import express from 'express';
import isAuth from '../middlewares/Authmiddleware.js';
import { createInvitation, getInvitationDetails, getRecruiterDashboard } from '../controllers/recruiterController.js';

const recruiterRouter = express.Router();

recruiterRouter.post('/invite', isAuth, createInvitation);
recruiterRouter.get('/invite/:token', getInvitationDetails);
recruiterRouter.get('/dashboard', isAuth, getRecruiterDashboard);

export default recruiterRouter;
