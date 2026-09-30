import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: String,
    resumeText: String,
    parsedData: {
      name: String,
      email: String,
      phone: String,
      role: String,
      experience: String,
      skills: [String],
      softSkills: [String],
      projects: [
        {
          name: String,
          techStack: [String],
          summary: String,
        },
      ],
      experienceItems: [
        {
          company: String,
          title: String,
          duration: String,
          bullets: [String],
        },
      ],
      education: [String],
      certifications: [String],
      atsScore: Number,
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
