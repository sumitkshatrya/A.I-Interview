import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    credits: {
      type: Number,
      default: 1000,
    },
    targetRole: {
      type: String,
      default: "Full Stack Engineer",
    },
    experienceLevel: {
      type: String,
      default: "Mid Level (2-4 yrs)",
    },
    skills: [
      {
        name: String,
        masteryLevel: {
          type: String,
          enum: ["Weak", "Developing", "Good", "Strong", "Mastered"],
          default: "Developing",
        },
        score: { type: Number, default: 0 },
        attempts: { type: Number, default: 0 },
      },
    ],
    preparationScore: {
      type: Number,
      default: 70,
    },
    streakDays: {
      type: Number,
      default: 1,
    },
    subscriptionTier: {
      type: String,
      enum: ["FREE", "PRO", "PREMIUM"],
      default: "FREE",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;