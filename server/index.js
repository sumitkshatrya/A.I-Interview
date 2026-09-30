import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/connectDb.js';
import authRouter from './routes/authRoute.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/userRoute.js';
import interviewRouter from './routes/interviewRoute.js';
import paymentRouter from './routes/paymentRoute.js';
import careerRouter from './routes/careerRoute.js';
import recruiterRouter from './routes/recruiterRoute.js';

dotenv.config();

const app = express();

app.use(cors({
   origin: [
     "https://a-i-interview-client.onrender.com",
     "http://localhost:5173"
   ],
   credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/career", careerRouter);
app.use("/api/recruiter", recruiterRouter);

app.get("/interview/invite/:token", (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return res.redirect(`${clientUrl.replace(/\/$/, '')}/interview/invite/${req.params.token}`);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDb();
});
