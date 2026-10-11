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

const allowedOrigins = [
  "https://a-i-interview-client.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", (req, res) => {
  return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

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

// Global Express Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error occurred." : "Invalid request.",
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDb();
});
