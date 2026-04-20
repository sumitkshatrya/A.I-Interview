import express from "express"
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import  isAuth from '../middlewares/Authmiddleware.js'

const paymentRouter = express.Router();

paymentRouter.post("/order", isAuth, createOrder)
paymentRouter.post("/verify", isAuth, verifyPayment)


export default paymentRouter