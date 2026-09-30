import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidateEmail: { type: String, required: true },
    roleTitle: { type: String, required: true },
    experienceLevel: { type: String, default: "Mid Level" },
    interviewMode: { type: String, default: "Technical" },
    inviteToken: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "EXPIRED"],
      default: "PENDING",
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
    },
  },
  { timestamps: true }
);

const InterviewInvitation = mongoose.model("InterviewInvitation", invitationSchema);

export default InterviewInvitation;
