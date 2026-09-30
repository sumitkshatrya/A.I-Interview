import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDescription",
    },
    matchScore: { type: Number, required: true },
    summary: String,
    matchingSkills: [String],
    missingRequiredSkills: [String],
    missingPreferredSkills: [String],
    keywordGaps: [String],
    technicalGaps: [String],
    preparationPriorities: [
      {
        priority: Number,
        topic: String,
        reason: String,
        action: String,
      },
    ],
  },
  { timestamps: true }
);

const ResumeJobMatch = mongoose.model("ResumeJobMatch", matchSchema);

export default ResumeJobMatch;
