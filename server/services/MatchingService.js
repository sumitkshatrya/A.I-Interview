import { callAiProviderJson } from './aiProvider.service.js';
import { RESUME_JOB_MATCH_PROMPT } from '../ai/prompts/matchingPrompts.js';
import ResumeJobMatch from '../models/matchModel.js';
import Resume from '../models/resumeModel.js';
import JobDescription from '../models/jobModel.js';

const fallbackMatchComputation = (resume, job) => {
  const resumeSkills = (resume.parsedData?.skills || []).map(s => s.toLowerCase());
  const reqSkills = (job.parsedData?.requiredSkills || []).map(s => s.toLowerCase());

  const matching = reqSkills.filter(s => resumeSkills.includes(s));
  const missing = reqSkills.filter(s => !resumeSkills.includes(s));

  const matchRatio = reqSkills.length > 0 ? matching.length / reqSkills.length : 0.75;
  const score = Math.min(95, Math.max(50, Math.round(matchRatio * 100)));

  return {
    matchScore: score,
    summary: `Preparation Match Score calculated at ${score}%. ${matching.length} required skills matched out of ${reqSkills.length}.`,
    matchingSkills: matching.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    missingRequiredSkills: missing.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    missingPreferredSkills: (job.parsedData?.preferredSkills || []).slice(0, 3),
    keywordGaps: missing.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    technicalGaps: missing.length > 0 ? missing.map(s => s.charAt(0).toUpperCase() + s.slice(1)) : ["System Architecture & Scalability"],
    preparationPriorities: missing.slice(0, 2).map((skill, idx) => ({
      priority: idx + 1,
      topic: skill.charAt(0).toUpperCase() + skill.slice(1),
      reason: "Required by target job description",
      action: `Complete a 20-minute practice session on ${skill}`
    }))
  };
};

export const processResumeJobMatch = async (userId, resumeId, jobId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  const job = await JobDescription.findOne({ _id: jobId, userId });

  if (!resume || !job) {
    throw new Error("Resume or Job Description record not found.");
  }

  let matchData = null;

  try {
    const prompt = RESUME_JOB_MATCH_PROMPT
      .replace("{{RESUME_ROLE}}", resume.parsedData?.role || "Candidate")
      .replace("{{RESUME_EXPERIENCE}}", resume.parsedData?.experience || "N/A")
      .replace("{{RESUME_SKILLS}}", (resume.parsedData?.skills || []).join(", "))
      .replace("{{RESUME_PROJECTS}}", (resume.parsedData?.projects || []).map(p => p.name).join(", "))
      .replace("{{RESUME_TEXT}}", (resume.resumeText || "").slice(0, 1000))
      .replace("{{JD_TITLE}}", job.parsedData?.title || job.title)
      .replace("{{JD_REQUIRED_SKILLS}}", (job.parsedData?.requiredSkills || []).join(", "))
      .replace("{{JD_PREFERRED_SKILLS}}", (job.parsedData?.preferredSkills || []).join(", "))
      .replace("{{JD_FOCUS_AREAS}}", (job.parsedData?.interviewFocusAreas || []).join(", "))
      .replace("{{JD_TEXT}}", (job.rawText || "").slice(0, 1000));

    const messages = [
      { role: "system", content: "You are a career matching scoring engine." },
      { role: "user", content: prompt }
    ];

    matchData = await callAiProviderJson(messages, { temperature: 0.3 });
  } catch (err) {
    console.warn("Matching AI call failed, using heuristic match computation:", err.message);
    matchData = fallbackMatchComputation(resume, job);
  }

  const matchRecord = await ResumeJobMatch.create({
    userId,
    resumeId,
    jobId,
    matchScore: matchData.matchScore || 75,
    summary: matchData.summary || "Good baseline match with actionable skill preparation priority areas.",
    matchingSkills: matchData.matchingSkills || [],
    missingRequiredSkills: matchData.missingRequiredSkills || [],
    missingPreferredSkills: matchData.missingPreferredSkills || [],
    keywordGaps: matchData.keywordGaps || [],
    technicalGaps: matchData.technicalGaps || [],
    preparationPriorities: matchData.preparationPriorities || []
  });

  return matchRecord;
};
