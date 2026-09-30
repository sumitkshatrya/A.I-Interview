import express from 'express';
import isAuth from '../middlewares/Authmiddleware.js';
import {
  analyzeJob,
  matchResumeAndJob,
  getLatestMatch,
  improveBullet,
  getSkillGraph,
  getPrepPlan,
  togglePrepTask,
  chatWithCoach,
  getCoachHistory,
  getCoachConversations,
  deleteCoachSession,
  createNewCoachChat,
  deleteResume,
  deleteJob,
  deleteMatch,
  optimizeResume,
  getOptimizedResume
} from '../controllers/careerController.js';

const careerRouter = express.Router();

careerRouter.post('/analyze-job', isAuth, analyzeJob);
careerRouter.post('/match', isAuth, matchResumeAndJob);
careerRouter.get('/match/latest', isAuth, getLatestMatch);
careerRouter.post('/improve-bullet', isAuth, improveBullet);
careerRouter.get('/skill-graph', isAuth, getSkillGraph);
careerRouter.get('/prep-plan', isAuth, getPrepPlan);
careerRouter.post('/prep-plan/toggle', isAuth, togglePrepTask);
careerRouter.post('/coach/chat', isAuth, chatWithCoach);
careerRouter.get('/coach/history', isAuth, getCoachHistory);
careerRouter.get('/coach/conversations', isAuth, getCoachConversations);
careerRouter.get('/coach/conversation/:id', isAuth, getCoachHistory);
careerRouter.delete('/coach/conversation/:id', isAuth, deleteCoachSession);
careerRouter.post('/coach/new', isAuth, createNewCoachChat);

// Delete routes
careerRouter.delete('/resume/:id', isAuth, deleteResume);
careerRouter.delete('/job/:id', isAuth, deleteJob);
careerRouter.delete('/match/:id', isAuth, deleteMatch);

// ATS Resume Optimization routes
careerRouter.post('/optimize-resume', isAuth, optimizeResume);
careerRouter.get('/optimized-resume', isAuth, getOptimizedResume);

export default careerRouter;
