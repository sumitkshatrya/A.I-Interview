import { callAiProviderJson } from './aiProvider.service.js';
import { JOB_ANALYZER_PROMPT } from '../ai/prompts/jobPrompts.js';
import JobDescription from '../models/jobModel.js';

const KNOWN_TECH_KEYWORDS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular", "Node.js", "Express",
  "Python", "Django", "FastAPI", "Java", "Spring Boot", "C++", "C#", ".NET", "Go", "Rust",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch", "Docker", "Kubernetes", "AWS",
  "GCP", "Azure", "GraphQL", "REST APIs", "System Design", "Microservices", "CI/CD", "Git"
];

const fallbackJobExtraction = (rawText, title = "Target Role") => {
  const textLower = rawText.toLowerCase();

  const detectedSkills = KNOWN_TECH_KEYWORDS.filter(tech =>
    textLower.includes(tech.toLowerCase())
  );

  let seniority = "Mid-Senior";
  if (textLower.includes("senior") || textLower.includes("lead")) seniority = "Senior";
  else if (textLower.includes("junior") || textLower.includes("fresher") || textLower.includes("entry")) seniority = "Entry Level";
  else if (textLower.includes("architect") || textLower.includes("principal")) seniority = "Architect";

  return {
    title: title || "Target Position",
    seniority,
    department: "Engineering",
    responsibilities: [
      "Design and maintain software components",
      "Collaborate with team members on feature delivery",
      "Ensure quality, performance, and code reliability"
    ],
    requiredSkills: detectedSkills.slice(0, 5).length > 0 ? detectedSkills.slice(0, 5) : ["Software Engineering", "REST APIs", "Problem Solving"],
    preferredSkills: detectedSkills.slice(5, 8).length > 0 ? detectedSkills.slice(5, 8) : ["System Design", "Cloud Infrastructure"],
    technologies: detectedSkills.length > 0 ? detectedSkills : ["JavaScript", "Node.js", "Database Systems"],
    experienceRequired: "2+ years",
    interviewFocusAreas: detectedSkills.slice(0, 4).length > 0 ? detectedSkills.slice(0, 4) : ["Core Fundamentals", "System Design"]
  };
};

export const processJobAnalysis = async (userId, rawText, title = "Target Role") => {
  if (!rawText || typeof rawText !== "string" || rawText.trim().length < 10) {
    throw new Error("Job Description text must be at least 10 characters long.");
  }

  let parsedData = null;

  try {
    const prompt = JOB_ANALYZER_PROMPT.replace("{{JD_TEXT}}", rawText);
    const messages = [
      { role: "system", content: "You are a technical recruitment intelligence specialist." },
      { role: "user", content: prompt }
    ];
    parsedData = await callAiProviderJson(messages, { temperature: 0.2 });
  } catch (err) {
    console.warn("Job analysis AI call failed, using heuristic extraction fallback:", err.message);
    parsedData = fallbackJobExtraction(rawText, title);
  }

  const jobRecord = await JobDescription.create({
    userId,
    title: parsedData.title || title,
    company: "Target Company",
    rawText,
    parsedData
  });

  return {
    jobId: jobRecord._id,
    title: parsedData.title || title,
    seniority: parsedData.seniority || "Mid-Senior",
    department: parsedData.department || "Engineering",
    responsibilities: parsedData.responsibilities || [],
    requiredSkills: parsedData.requiredSkills || [],
    preferredSkills: parsedData.preferredSkills || [],
    technologies: parsedData.technologies || [],
    experienceRequired: parsedData.experienceRequired || "2+ years",
    interviewFocusAreas: parsedData.interviewFocusAreas || []
  };
};
