import mongoose from "mongoose";

const coachMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "coach"], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const coachConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, default: "Career Coaching Session" },
    messages: [coachMessageSchema],
  },
  { timestamps: true }
);

const CareerCoachConversation = mongoose.model("CareerCoachConversation", coachConversationSchema);

export default CareerCoachConversation;
