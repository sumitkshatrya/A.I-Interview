import express from 'express';
import isAuth from '../middlewares/Authmiddleware.js';
import {upload} from '../middlewares/multer.js'
import { analyzeResume, finishInterview, generateQuestion, getInterviewReport, getMyInterviews, submitAnswer } from '../controllers/interviewController.js';



const interviewRouter = express.Router();

const handleUpload = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || "File upload failed." });
    }
    next();
  });
};

interviewRouter.post("/resume", isAuth, handleUpload, analyzeResume);
interviewRouter.post("/generate-questions", isAuth, generateQuestion);
interviewRouter.post("/submit-answer", isAuth, submitAnswer);
interviewRouter.post("/finish", isAuth, finishInterview);

interviewRouter.get("/get-interviews", isAuth, getMyInterviews);
interviewRouter.get("/report/:id", isAuth, getInterviewReport);

export default interviewRouter;
