import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    company: { type: String, default: "Target Company" },
    rawText: { type: String, required: true },
    parsedData: {
      title: String,
      seniority: String,
      department: String,
      responsibilities: [String],
      requiredSkills: [String],
      preferredSkills: [String],
      technologies: [String],
      experienceRequired: String,
      interviewFocusAreas: [String],
    },
  },
  { timestamps: true }
);

const JobDescription = mongoose.model("JobDescription", jobSchema);

export default JobDescription;
