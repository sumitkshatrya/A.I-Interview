import crypto from 'crypto';
import InterviewInvitation from '../models/invitationModel.js';
import Interview from '../models/interviewModel.js';

export const createInvitation = async (req, res) => {
  try {
    const { candidateEmail, roleTitle, experienceLevel = "Mid Level", interviewMode = "Technical" } = req.body;

    if (!candidateEmail || !roleTitle) {
      return res.status(400).json({ success: false, message: "Candidate email and role title are required." });
    }

    const inviteToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days link validity

    const invitation = await InterviewInvitation.create({
      recruiterId: req.userId,
      candidateEmail,
      roleTitle,
      experienceLevel,
      interviewMode,
      inviteToken,
      expiresAt
    });

    const origin = req.get('origin');
    let clientUrl = process.env.CLIENT_URL;
    if (!clientUrl) {
      if (origin && !origin.includes('localhost:8000')) {
        clientUrl = origin;
      } else {
        clientUrl = 'http://localhost:5173';
      }
    }
    const inviteUrl = `${clientUrl.replace(/\/$/, '')}/interview/invite/${inviteToken}`;

    return res.status(200).json({
      success: true,
      data: {
        invitation,
        inviteUrl
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvitationDetails = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await InterviewInvitation.findOne({ inviteToken: token });

    if (!invitation || invitation.expiresAt < new Date()) {
      return res.status(404).json({ success: false, message: "Invalid or expired invitation token." });
    }

    return res.status(200).json({ success: true, data: invitation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecruiterDashboard = async (req, res) => {
  try {
    const invitations = await InterviewInvitation.find({ recruiterId: req.userId })
      .populate("interviewId", "finalScore status createdAt questions")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: invitations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
