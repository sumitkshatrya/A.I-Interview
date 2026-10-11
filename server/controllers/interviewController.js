import Interview from '../models/interviewModel.js';
import User from '../models/userModel.js';
import { startDynamicInterview, processTurnAndGetNextQuestion } from '../services/InterviewService.js';
import { evaluateAnswerDetails } from '../services/EvaluationService.js';
import { updateSkillFromEvaluation } from '../services/SkillService.js';
import { processResumeAnalysis } from '../services/ResumeService.js';

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume PDF file is required." });
    }

    const result = await processResumeAnalysis(req.userId, req.file.path, req.file.originalname);
    return res.status(200).json({
      success: true,
      data: result,
      // Backward compatibility fields
      role: result.role,
      experience: result.experience,
      projects: result.projects.map(p => p.name),
      skills: result.skills,
      resumeText: result.resumeText
    });
  } catch (error) {
    console.error("Analyze resume error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generateQuestion = async (req, res) => {
  try {
    const {
      role,
      experience,
      mode = "Technical",
      personality = "Technical Expert",
      interviewType = "Technical",
      resumeText = "",
      jobDescriptionText = ""
    } = req.body;

    if (!role || !experience) {
      return res.status(400).json({ success: false, message: "Role and experience are required." });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (user.credits < 50) {
      return res.status(400).json({ success: false, message: "Not enough credits. Minimum 50 required." });
    }

    user.credits -= 50;
    await user.save();

    const interviewData = await startDynamicInterview({
      userId: user._id,
      role,
      experience,
      mode,
      personality,
      interviewType,
      resumeText,
      jobDescriptionText
    });

    return res.status(200).json({
      success: true,
      data: {
        interviewId: interviewData.interviewId,
        creditsLeft: user.credits,
        userName: user.name,
        questions: [interviewData.currentQuestion],
        currentQuestion: interviewData.currentQuestion,
        transitionText: interviewData.transitionText,
        totalQuestions: 5,
        currentStep: 1
      },
      // Backward compatibility fields
      interviewId: interviewData.interviewId,
      creditsLeft: user.credits,
      userName: user.name,
      questions: [interviewData.currentQuestion]
    });
  } catch (error) {
    console.error("Generate question error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken = 0 } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found." });

    const currentQ = interview.questions[questionIndex];
    if (!currentQ) return res.status(400).json({ success: false, message: "Question not found." });

    // Multi-dimensional AI Evaluation
    const evaluation = await evaluateAnswerDetails({
      question: currentQ.question,
      competency: currentQ.competency || "Technical Skills",
      role: interview.role,
      experience: interview.experience,
      answer
    });

    // Update Skill Graph Mastery
    if (currentQ.competency) {
      await updateSkillFromEvaluation(
        req.userId,
        currentQ.competency,
        evaluation.finalScore,
        currentQ.difficulty || 3,
        interview._id
      );
    }

    // Process turn and retrieve next adaptive question
    const turnResult = await processTurnAndGetNextQuestion({
      interviewId,
      questionIndex,
      answer,
      timeTaken,
      evaluationResult: evaluation
    });

    return res.status(200).json({
      success: true,
      data: {
        feedback: evaluation.feedback,
        evaluation,
        isFinished: turnResult.isFinished,
        nextQuestion: turnResult.nextQuestion || null,
        transitionText: turnResult.transitionText || "Thank you.",
        currentStep: turnResult.currentStep || 5
      },
      // Backward compatibility fields
      feedback: evaluation.feedback
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found." });

    const questions = interview.questions || [];
    const totalQuestions = questions.length;

    let totalScore = 0, totalConf = 0, totalComm = 0, totalCorr = 0;
    questions.forEach((q) => {
      const evalScore = q.evaluation?.finalScore ?? q.score ?? 0;
      const confScore = q.evaluation?.confidence ?? q.confidence ?? evalScore;
      const commScore = q.evaluation?.communication ?? q.communication ?? evalScore;
      const corrScore = q.evaluation?.accuracy ?? q.correctness ?? evalScore;

      totalScore += evalScore;
      totalConf += confScore;
      totalComm += commScore;
      totalCorr += corrScore;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConf = totalQuestions ? totalConf / totalQuestions : 0;
    const avgComm = totalQuestions ? totalComm / totalQuestions : 0;
    const avgCorr = totalQuestions ? totalCorr / totalQuestions : 0;

    interview.finalScore = Number(finalScore.toFixed(1));
    interview.confidenceScore = Number(avgConf.toFixed(1));
    interview.communicationScore = Number(avgComm.toFixed(1));
    interview.correctnessScore = Number(avgCorr.toFixed(1));
    interview.status = "completed";
    if (!interview.state) interview.state = {};
    interview.state.isFinished = true;

    await interview.save();

    const formattedQuestions = questions.map((q) => ({
      question: q.question,
      competency: q.competency,
      difficulty: q.difficulty || 3,
      answer: q.answer || "",
      timeTaken: q.timeTaken || 0,
      score: q.evaluation?.finalScore ?? q.score ?? 0,
      feedback: q.evaluation?.feedback ?? q.feedback ?? "",
      confidence: q.evaluation?.confidence ?? q.confidence ?? (q.evaluation?.finalScore ?? q.score ?? 0),
      communication: q.evaluation?.communication ?? q.communication ?? (q.evaluation?.finalScore ?? q.score ?? 0),
      correctness: q.evaluation?.accuracy ?? q.correctness ?? (q.evaluation?.finalScore ?? q.score ?? 0),
      evaluation: q.evaluation
    }));

    return res.status(200).json({
      success: true,
      data: {
        interviewId: interview._id,
        finalScore: interview.finalScore,
        confidence: interview.confidenceScore,
        communication: interview.communicationScore,
        correctness: interview.correctnessScore,
        questionWiseScore: formattedQuestions
      },
      // Backward compatibility fields
      interviewId: interview._id,
      finalScore: interview.finalScore,
      confidence: interview.confidenceScore,
      communication: interview.communicationScore,
      correctness: interview.correctnessScore,
      questionWiseScore: formattedQuestions
    });
  } catch (error) {
    console.error("Finish interview error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode personality interviewType finalScore status createdAt");

    return res.status(200).json({
      success: true,
      data: { interviews },
      // Backward compatibility field
      interviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.userId });
    if (!interview) return res.status(404).json({ success: false, message: "Interview report not found." });

    const formattedQuestions = (interview.questions || []).map((q) => ({
      question: q.question,
      competency: q.competency,
      difficulty: q.difficulty || 3,
      answer: q.answer || "",
      timeTaken: q.timeTaken || 0,
      score: q.evaluation?.finalScore ?? q.score ?? 0,
      feedback: q.evaluation?.feedback ?? q.feedback ?? "",
      confidence: q.evaluation?.confidence ?? q.confidence ?? (q.evaluation?.finalScore ?? q.score ?? 0),
      communication: q.evaluation?.communication ?? q.communication ?? (q.evaluation?.finalScore ?? q.score ?? 0),
      correctness: q.evaluation?.accuracy ?? q.correctness ?? (q.evaluation?.finalScore ?? q.score ?? 0),
      evaluation: q.evaluation
    }));

    return res.status(200).json({
      success: true,
      data: {
        role: interview.role,
        experience: interview.experience,
        mode: interview.mode,
        personality: interview.personality,
        interviewType: interview.interviewType,
        status: interview.status,
        createdAt: interview.createdAt,
        finalScore: interview.finalScore,
        confidence: interview.confidenceScore,
        communication: interview.communicationScore,
        correctness: interview.correctnessScore,
        questions: formattedQuestions,
        questionWiseScore: formattedQuestions
      },
      // Backward compatibility fields
      role: interview.role,
      experience: interview.experience,
      mode: interview.mode,
      status: interview.status,
      createdAt: interview.createdAt,
      finalScore: interview.finalScore,
      confidence: interview.confidenceScore,
      communication: interview.communicationScore,
      correctness: interview.correctnessScore,
      questions: formattedQuestions,
      questionWiseScore: formattedQuestions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
