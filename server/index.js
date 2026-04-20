import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/connectDb.js';
import authRouter from './routes/authRoute.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/userRoute.js';
import interviewRouter from './routes/interviewRoute.js';
import paymentRouter from './routes/paymentRoute.js';

dotenv.config();

const app = express();
const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, '');

app.use(cors({
   origin: clientUrl,
   credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use('/api/interview', interviewRouter)
app.use("/api/payment", paymentRouter)

const PORT = process.env.PORT || 8000;
 app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`)
    connectDb();
 });
