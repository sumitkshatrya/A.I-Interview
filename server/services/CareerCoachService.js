import CareerCoachConversation from '../models/coachModel.js';
import User from '../models/userModel.js';
import Resume from '../models/resumeModel.js';
import JobDescription from '../models/jobModel.js';
import Skill from '../models/skillModel.js';
import Interview from '../models/interviewModel.js';
import ResumeJobMatch from '../models/matchModel.js';
import { callAiProvider } from './aiProvider.service.js';
import { CAREER_COACH_PROMPT } from '../ai/prompts/coachPrompts.js';

export const handleCoachConversation = async (userId, userMessage, conversationId = null) => {
  const user = await User.findById(userId);
  const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
  const latestJob = await JobDescription.findOne({ userId }).sort({ createdAt: -1 });
  const skills = await Skill.find({ userId });
  const recentInterviews = await Interview.find({ userId, status: "completed" }).sort({ createdAt: -1 }).limit(3);
  const latestMatch = await ResumeJobMatch.findOne({ userId }).sort({ createdAt: -1 });

  const skillSummary = skills.length > 0
    ? skills.map(s => `${s.skillName}: ${s.masteryLevel} (Avg: ${s.averageScore})`).join(", ")
    : "JavaScript: Good, React: Developing, System Design: Weak";

  const interviewSummary = recentInterviews.length > 0
    ? recentInterviews.map(i => `${i.role} (${i.interviewType}) - Final Score: ${i.finalScore}/10`).join("; ")
    : "No completed interviews yet.";

  let coachReply = "";

  try {
    const prompt = CAREER_COACH_PROMPT
      .replace("{{USER_NAME}}", user?.name || "Candidate")
      .replace("{{TARGET_ROLE}}", user?.targetRole || "Full Stack Engineer")
      .replace("{{EXPERIENCE_LEVEL}}", user?.experienceLevel || "Mid Level")
      .replace("{{RESUME_SUMMARY}}", latestResume?.parsedData?.role || "Uploaded Resume Profile")
      .replace("{{JD_SUMMARY}}", latestJob?.title || "Target Position")
      .replace("{{SKILL_MASTERY}}", skillSummary)
      .replace("{{RECENT_INTERVIEWS}}", interviewSummary)
      .replace("{{MATCH_SCORE}}", String(latestMatch?.matchScore || 75))
      .replace("{{USER_MESSAGE}}", userMessage);

    const messages = [
      { role: "system", content: prompt },
      { role: "user", content: userMessage }
    ];

    coachReply = await callAiProvider(messages, { temperature: 0.7 });
  } catch (err) {
    console.warn("Career coach AI call failed, returning structured fallback guidance:", err.message);
    coachReply = `Based on your profile for **${user?.targetRole || "Full Stack Engineer"}**:

1. **Daily Practice Recommendation**: Focus on reviewing system design fundamentals (caching with Redis, REST API scalability) and practicing past technical questions.
2. **Behavioral Preparation**: Ensure every past project answer uses the **STAR framework** (Situation, Task, Action, Result) with measurable metrics.
3. **Next Step**: Start a 15-minute targeted mock interview in the platform to test your current preparedness.`;
  }

  let conversation = null;
  if (conversationId) {
    conversation = await CareerCoachConversation.findOne({ _id: conversationId, userId });
  }

  if (!conversation) {
    const generatedTitle = userMessage.length > 35 ? userMessage.slice(0, 35) + "..." : userMessage;
    conversation = new CareerCoachConversation({
      userId,
      title: generatedTitle || "Career Strategy Session",
      messages: []
    });
  } else if (conversation.messages.length === 0) {
    conversation.title = userMessage.length > 35 ? userMessage.slice(0, 35) + "..." : userMessage;
  }

  conversation.messages.push({ sender: "user", text: userMessage });
  conversation.messages.push({ sender: "coach", text: coachReply });

  await conversation.save();

  return {
    reply: coachReply,
    conversationId: conversation._id,
    title: conversation.title,
    conversationHistory: conversation.messages
  };
};

export const getUserCoachConversations = async (userId) => {
  const conversations = await CareerCoachConversation.find({ userId })
    .select('_id title updatedAt messages')
    .sort({ updatedAt: -1 });

  return conversations.map(c => ({
    _id: c._id,
    title: c.title || "Strategy Session",
    updatedAt: c.updatedAt,
    messageCount: c.messages ? c.messages.length : 0,
    preview: c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].text.slice(0, 60) + "..." : "Empty session"
  }));
};

export const getCoachConversationById = async (userId, conversationId) => {
  const conversation = await CareerCoachConversation.findOne({ _id: conversationId, userId });
  if (!conversation) {
    throw new Error("Conversation not found.");
  }
  return conversation;
};

export const deleteCoachConversation = async (userId, conversationId) => {
  if (conversationId && conversationId !== 'all') {
    await CareerCoachConversation.deleteOne({ _id: conversationId, userId });
  } else {
    await CareerCoachConversation.deleteMany({ userId });
  }
  return true;
};

export const createNewCoachConversation = async (userId) => {
  const conversation = await CareerCoachConversation.create({
    userId,
    title: "New AI Coaching Session",
    messages: [
      {
        sender: "coach",
        text: "Hello! I am your AI Career Coach & Mentor. I have reviewed your target role, resume, and mock interview history. How can I help you accelerate your prep today?"
      }
    ]
  });
  return conversation;
};
