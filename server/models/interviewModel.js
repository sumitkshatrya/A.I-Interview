import mongoose from "mongoose";

const questionEvaluationSchema = new mongoose.Schema({
  relevance: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  depth: { type: Number, default: 0 },
  structure: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  evidence: { type: Number, default: 0 },
  roleAlignment: { type: Number, default: 0 },
  finalScore: { type: Number, default: 0 },
  starAnalysis: {
    situation: Boolean,
    task: Boolean,
    action: Boolean,
    result: Boolean,
    feedback: String,
  },
  strengths: [String],
  weaknesses: [String],
  feedback: String,
  idealAnswerStructure: String,
});

const questionSchema = new mongoose.Schema({
  questionIndex: Number,
  question: String,
  competency: String,
  difficulty: { type: Number, default: 3 },
  actionType: {
    type: String,
    enum: [
      "INITIATE",
      "FOLLOW_UP",
      "CLARIFY",
      "CHALLENGE",
      "DEEPEN",
      "MOVE_TO_NEW_TOPIC",
      "INCREASE_DIFFICULTY",
      "DECREASE_DIFFICULTY",
      "END_INTERVIEW",
    ],
    default: "INITIATE",
  },
  timeLimit: { type: Number, default: 90 },
  answer: { type: String, default: "" },
  timeTaken: { type: Number, default: 0 },
  evaluation: questionEvaluationSchema,
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    mode: { type: String, default: "Technical" },
    personality: {
      type: String,
      default: "Technical Expert",
    },
    interviewType: {
      type: String,
      default: "Technical",
    },
    resumeText: { type: String, default: "" },
    jobDescriptionText: { type: String, default: "" },
    state: {
      currentStep: { type: Number, default: 0 },
      maxSteps: { type: Number, default: 5 },
      currentDifficulty: { type: Number, default: 3 },
      currentCompetency: { type: String, default: "General Technical" },
      weakSkills: [String],
      strongSkills: [String],
      previousTopics: [String],
      isFinished: { type: Boolean, default: false },
    },
    questions: [questionSchema],
    finalScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    correctnessScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Incompleted", "completed"],
      default: "Incompleted",
    },
    integritySignals: {
      tabSwitches: { type: Number, default: 0 },
      disconnects: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
