import express from 'express';
import { googleAuth, logout } from '../controllers/authcontroller.js';

const authRouter = express.Router();

authRouter.post("/google-login",  googleAuth);
authRouter.get("/logout",  logout);

export default authRouter;