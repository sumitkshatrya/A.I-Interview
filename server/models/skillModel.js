import mongoose from "mongoose";

const userSkillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillName: { type: String, required: true },
    category: { type: String, default: "Technical" },
    parentSkill: { type: String, default: null },
    masteryLevel: {
      type: String,
      enum: ["Weak", "Developing", "Good", "Strong", "Mastered"],
      default: "Developing",
    },
    attemptsCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    recentScore: { type: Number, default: 0 },
    scoreTrend: {
      type: String,
      enum: ["Improving", "Stable", "Declining"],
      default: "Stable",
    },
    history: [
      {
        interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
        score: Number,
        difficulty: Number,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSkillSchema.index({ userId: 1, skillName: 1 }, { unique: true });

const Skill = mongoose.model("Skill", userSkillSchema);

export default Skill;
