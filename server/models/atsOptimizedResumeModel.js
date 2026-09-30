import mongoose from 'mongoose';

const atsOptimizedResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription'
  },
  targetRole: {
    type: String,
    default: 'Target Role'
  },
  candidateName: {
    type: String,
    default: 'Candidate Name'
  },
  contactInfo: {
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    portfolio: String
  },
  professionalSummary: {
    type: String
  },
  coreCompetencies: [{
    type: String
  }],
  workExperience: [{
    title: String,
    company: String,
    duration: String,
    location: String,
    achievements: [String]
  }],
  projects: [{
    name: String,
    techStack: String,
    description: String,
    keyMetric: String
  }],
  education: [{
    degree: String,
    field: String,
    institution: String,
    year: String
  }],
  certifications: [{
    title: String,
    issuer: String,
    year: String
  }],
  atsImprovementsMade: [{
    type: String
  }],
  predictedAtsScore: {
    type: Number,
    default: 95
  }
}, { timestamps: true });

export default mongoose.model('AtsOptimizedResume', atsOptimizedResumeSchema);

