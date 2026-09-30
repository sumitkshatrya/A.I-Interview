import razorpay from "../services/razorpay.js";
import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import crypto from "crypto";

// Server-side authorized credit plans (amounts in INR)
const AUTHORIZED_PLANS = {
  basic: { amount: 100, credits: 500 },
  pro: { amount: 249, credits: 1500 },
};

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please log in first" });
    }

    const authorizedPlan = AUTHORIZED_PLANS[planId];
    if (!authorizedPlan) {
      return res.status(400).json({ success: false, message: "Invalid or unsupported credit plan selected" });
    }

    // Protect against amount or credit tampering
    if (Number(amount) !== authorizedPlan.amount || Number(credits) !== authorizedPlan.credits) {
      return res.status(400).json({ success: false, message: "Payment validation failed: Plan details mismatch" });
    }

    const options = {
      amount: authorizedPlan.amount * 100, // amount in paise
      currency: "INR",
      receipt: `rcpt_${req.userId.toString().slice(-6)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.userId,
      planId,
      amount: authorizedPlan.amount,
      credits: authorizedPlan.credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    res.json({
      ...order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return res.status(500).json({ success: false, message: `Failed to create payment order: ${error.message || error}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing required payment verification tokens" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature verification" });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment order record not found" });
    }

    // Authorization check: ensure payment belongs to authenticated user
    if (payment.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: Payment record user mismatch" });
    }

    // Idempotency check: if already processed, return current user state without double-crediting
    if (payment.status === "paid") {
      const existingUser = await User.findById(req.userId).select("-password");
      return res.json({
        success: true,
        message: "Payment already verified",
        user: existingUser,
      });
    }

    // Update payment status
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    // Credit user account
    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      { $inc: { credits: payment.credits } },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Payment verified and credits added successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    return res.status(500).json({ success: false, message: `Failed to verify payment: ${error.message || error}` });
  }
};
