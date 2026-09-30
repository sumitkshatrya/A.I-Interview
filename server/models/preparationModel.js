import mongoose from "mongoose";

const prepTaskSchema = new mongoose.Schema({
  day: Number,
  title: String,
  category: {
    type: String,
    enum: ["System Design", "Technical Revision", "Behavioral", "Coding Practice", "Mock Interview"],
  },
  description: String,
  estimatedMinutes: { type: Number, default: 20 },
  completed: { type: Boolean, default: false },
});

const preparationPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetRole: String,
    targetCompany: { type: String, default: "Target Company" },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    tasks: [prepTaskSchema],
  },
  { timestamps: true }
);

const PreparationPlan = mongoose.model("PreparationPlan", preparationPlanSchema);

export default PreparationPlan;
