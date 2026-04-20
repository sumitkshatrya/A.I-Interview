import express from 'express';
import isAuth from '../middlewares/Authmiddleware.js';
import { getCurrentUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser);

export default userRouter;