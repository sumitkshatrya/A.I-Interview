import { processJobAnalysis } from '../services/JobService.js';
import { processResumeJobMatch } from '../services/MatchingService.js';
import { improveResumeBullet, generateAtsOptimizedResume } from '../services/ResumeService.js';
import { getUserSkillGraph } from '../services/SkillService.js';
import { generatePersonalizedPrepPlan } from '../services/PreparationService.js';
import {
  handleCoachConversation,
  getUserCoachConversations,
  getCoachConversationById,
  deleteCoachConversation as deleteCoachService,
  createNewCoachConversation
} from '../services/CareerCoachService.js';
import PreparationPlan from '../models/preparationModel.js';
import ResumeJobMatch from '../models/matchModel.js';
import Resume from '../models/resumeModel.js';
import JobDescription from '../models/jobModel.js';
import CareerCoachConversation from '../models/coachModel.js';
import AtsOptimizedResume from '../models/atsOptimizedResumeModel.js';

export const analyzeJob = async (req, res) => {
  try {
    const { rawText, title } = req.body;
    if (!rawText || typeof rawText !== "string" || rawText.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Job Description text must be at least 10 characters long." });
    }

    const result = await processJobAnalysis(req.userId, rawText.trim(), title);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Analyze job error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to analyze Job Description." });
  }
};

export const matchResumeAndJob = async (req, res) => {
  try {
    const { resumeId, jobId } = req.body;

    let targetResumeId = resumeId;
    let targetJobId = jobId;

    if (!targetResumeId) {
      const latestResume = await Resume.findOne({ userId: req.userId }).sort({ createdAt: -1 });
      if (!latestResume) return res.status(400).json({ success: false, message: "Please upload a resume first." });
      targetResumeId = latestResume._id;
    }

    if (!targetJobId) {
      const latestJob = await JobDescription.findOne({ userId: req.userId }).sort({ createdAt: -1 });
      if (!latestJob) return res.status(400).json({ success: false, message: "Please analyze a job description first." });
      targetJobId = latestJob._id;
    }

    const matchResult = await processResumeJobMatch(req.userId, targetResumeId, targetJobId);
    return res.status(200).json({ success: true, data: matchResult });
  } catch (error) {
    console.error("Match resume and job error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to compute match score." });
  }
};

export const getLatestMatch = async (req, res) => {
  try {
    const match = await ResumeJobMatch.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: match });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const improveBullet = async (req, res) => {
  try {
    const { bullet, goal, userMetrics } = req.body;
    if (!bullet) return res.status(400).json({ success: false, message: "Bullet point text required." });

    const result = await improveResumeBullet({ bullet, goal, userMetrics });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSkillGraph = async (req, res) => {
  try {
    const skills = await getUserSkillGraph(req.userId);
    return res.status(200).json({ success: true, data: skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPrepPlan = async (req, res) => {
  try {
    let plan = await PreparationPlan.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!plan) {
      plan = await generatePersonalizedPrepPlan(req.userId);
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePrepTask = async (req, res) => {
  try {
    const { planId, taskId } = req.body;
    const plan = await PreparationPlan.findOne({ _id: planId, userId: req.userId });
    if (!plan) return res.status(404).json({ success: false, message: "Preparation plan not found." });

    const task = plan.tasks.id(taskId);
    if (task) {
      task.completed = !task.completed;
      await plan.save();
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const chatWithCoach = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message is required." });

    const result = await handleCoachConversation(req.userId, message, conversationId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCoachHistory = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const conversation = await getCoachConversationById(req.userId, id);
      return res.status(200).json({ success: true, data: conversation?.messages || [], conversation });
    }
    const conversation = await CareerCoachConversation.findOne({ userId: req.userId }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: conversation?.messages || [], conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCoachConversations = async (req, res) => {
  try {
    const conversations = await getUserCoachConversations(req.userId);
    return res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoachSession = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCoachService(req.userId, id);
    return res.status(200).json({ success: true, message: "Coach conversation deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createNewCoachChat = async (req, res) => {
  try {
    const conversation = await createNewCoachConversation(req.userId);
    return res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id !== 'latest') {
      await Resume.deleteOne({ _id: id, userId: req.userId });
    } else {
      const latest = await Resume.findOne({ userId: req.userId }).sort({ createdAt: -1 });
      if (latest) await Resume.deleteOne({ _id: latest._id });
    }
    return res.status(200).json({ success: true, message: "Resume deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete resume." });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id !== 'latest') {
      await JobDescription.deleteOne({ _id: id, userId: req.userId });
    } else {
      const latest = await JobDescription.findOne({ userId: req.userId }).sort({ createdAt: -1 });
      if (latest) await JobDescription.deleteOne({ _id: latest._id });
    }
    return res.status(200).json({ success: true, message: "Job description deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete job description." });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id !== 'latest') {
      await ResumeJobMatch.deleteOne({ _id: id, userId: req.userId });
    } else {
      const latest = await ResumeJobMatch.findOne({ userId: req.userId }).sort({ createdAt: -1 });
      if (latest) await ResumeJobMatch.deleteOne({ _id: latest._id });
    }
    return res.status(200).json({ success: true, message: "Match analysis deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete match analysis." });
  }
};

export const optimizeResume = async (req, res) => {
  try {
    const { resumeId, jobId } = req.body;
    const result = await generateAtsOptimizedResume({ userId: req.userId, resumeId, jobId });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Optimize resume error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to generate ATS optimized resume." });
  }
};

export const getOptimizedResume = async (req, res) => {
  try {
    const record = await AtsOptimizedResume.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

