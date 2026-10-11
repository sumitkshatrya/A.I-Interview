import Interview from '../models/interviewModel.js';
import { callAiProviderJson } from './aiProvider.service.js';
import { DYNAMIC_INTERVIEWER_SYSTEM_PROMPT, PERSONALITY_PROMPTS, INTERVIEW_TYPE_PROMPTS } from '../ai/prompts/interviewerPrompts.js';

const FALLBACK_QUESTIONS = [
  { question: "Could you walk me through your background, technical skills, and most notable recent project?", competency: "Background & Overview", difficulty: 2 },
  { question: "How do you handle API performance bottlenecks, database optimization, or caching strategies in production?", competency: "Performance & Caching", difficulty: 3 },
  { question: "Can you describe a challenging technical bug or system failure you encountered, and how you diagnosed and resolved it?", competency: "Debugging & Problem Solving", difficulty: 3 },
  { question: "How do you approach designing scalable systems and evaluating trade-offs between consistency, availability, and simplicity?", competency: "System Architecture", difficulty: 4 },
  { question: "Looking back at a past project, what would you re-architect or implement differently today, and what key lesson did you learn?", competency: "Technical Reflection", difficulty: 4 }
];

export const startDynamicInterview = async ({
  userId,
  role,
  experience,
  mode = "Technical",
  personality = "Technical Expert",
  interviewType = "Technical",
  resumeText = "",
  jobDescriptionText = "",
}) => {
  const personalityText = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS["Technical Expert"];
  const typeText = INTERVIEW_TYPE_PROMPTS[interviewType] || INTERVIEW_TYPE_PROMPTS["Technical"];

  let aiOutput = null;

  try {
    const prompt = DYNAMIC_INTERVIEWER_SYSTEM_PROMPT
      .replace("{{PERSONALITY_TEXT}}", personalityText)
      .replace("{{INTERVIEW_TYPE_TEXT}}", typeText)
      .replace("{{TARGET_ROLE}}", role)
      .replace("{{EXPERIENCE_LEVEL}}", experience)
      .replace("{{RESUME_TEXT}}", resumeText.slice(0, 1000) || "None")
      .replace("{{PROJECTS_TEXT}}", "Extracted from background")
      .replace("{{SKILLS_TEXT}}", "Core competencies for role")
      .replace("{{JD_TEXT}}", jobDescriptionText.slice(0, 1000) || "None")
      .replace("{{CURRENT_STEP}}", "1")
      .replace("{{MAX_STEPS}}", "5")
      .replace("{{PREVIOUS_TOPICS}}", "None")
      .replace("{{WEAK_SKILLS}}", "None")
      .replace("{{STRONG_SKILLS}}", "None");

    const messages = [
      { role: "system", content: prompt },
      { role: "user", content: "Please introduce yourself briefly and ask the first question." }
    ];

    aiOutput = await callAiProviderJson(messages, { temperature: 0.7 });
  } catch (err) {
    console.warn("Dynamic interviewer AI initialization call failed, using template question fallback:", err.message);
    aiOutput = {
      question: `Welcome to your ${interviewType} interview for ${role}. Could you please introduce yourself and walk me through your key technical background?`,
      competency: "Background & Technical Overview",
      difficulty: 2,
      transitionText: "Let's begin."
    };
  }

  const firstQuestion = {
    questionIndex: 0,
    question: aiOutput.question || `Welcome to your ${interviewType} interview for ${role}. To start, please introduce yourself and your background.`,
    competency: aiOutput.competency || "Introduction & Background",
    difficulty: aiOutput.difficulty || 2,
    actionType: "INITIATE",
    timeLimit: 90,
  };

  const interview = await Interview.create({
    userId,
    role,
    experience,
    mode,
    personality,
    interviewType,
    resumeText,
    jobDescriptionText,
    state: {
      currentStep: 1,
      maxSteps: 5,
      currentDifficulty: firstQuestion.difficulty,
      currentCompetency: firstQuestion.competency,
      previousTopics: [firstQuestion.competency],
    },
    questions: [firstQuestion]
  });

  return {
    interviewId: interview._id,
    currentQuestion: firstQuestion,
    transitionText: aiOutput.transitionText || "Let's begin.",
    totalQuestions: 5,
    currentStep: 1
  };
};

export const processTurnAndGetNextQuestion = async ({
  interviewId,
  questionIndex,
  answer,
  timeTaken,
  evaluationResult
}) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) throw new Error("Interview session not found.");

  const currentQ = interview.questions[questionIndex];
  if (!currentQ) throw new Error("Question index invalid.");

  currentQ.answer = answer;
  currentQ.timeTaken = timeTaken;
  currentQ.evaluation = evaluationResult;

  if (!interview.state) {
    interview.state = {
      currentStep: 1,
      maxSteps: 5,
      currentDifficulty: 3,
      currentCompetency: "General Technical",
      weakSkills: [],
      strongSkills: [],
      previousTopics: [],
      isFinished: false
    };
  }
  if (!interview.state.previousTopics) interview.state.previousTopics = [];
  if (!interview.state.strongSkills) interview.state.strongSkills = [];
  if (!interview.state.weakSkills) interview.state.weakSkills = [];

  if (currentQ.competency && !interview.state.previousTopics.includes(currentQ.competency)) {
    interview.state.previousTopics.push(currentQ.competency);
  }

  if (evaluationResult.finalScore >= 7.5) {
    if (!interview.state.strongSkills.includes(currentQ.competency)) {
      interview.state.strongSkills.push(currentQ.competency);
    }
  } else if (evaluationResult.finalScore < 6.0) {
    if (!interview.state.weakSkills.includes(currentQ.competency)) {
      interview.state.weakSkills.push(currentQ.competency);
    }
  }

  const nextStepNum = (interview.state.currentStep || 1) + 1;
  const maxSteps = interview.state.maxSteps || 5;

  if (nextStepNum > maxSteps) {
    interview.state.isFinished = true;
    interview.status = "completed";
    await interview.save();
    return { isFinished: true, interviewId };
  }

  let aiOutput = null;

  try {
    const personalityText = PERSONALITY_PROMPTS[interview.personality] || PERSONALITY_PROMPTS["Technical Expert"];
    const typeText = INTERVIEW_TYPE_PROMPTS[interview.interviewType] || INTERVIEW_TYPE_PROMPTS["Technical"];

    const prompt = DYNAMIC_INTERVIEWER_SYSTEM_PROMPT
      .replace("{{PERSONALITY_TEXT}}", personalityText)
      .replace("{{INTERVIEW_TYPE_TEXT}}", typeText)
      .replace("{{TARGET_ROLE}}", interview.role)
      .replace("{{EXPERIENCE_LEVEL}}", interview.experience)
      .replace("{{RESUME_TEXT}}", (interview.resumeText || "").slice(0, 500))
      .replace("{{PROJECTS_TEXT}}", "Candidate past projects")
      .replace("{{SKILLS_TEXT}}", "Core competencies")
      .replace("{{JD_TEXT}}", (interview.jobDescriptionText || "").slice(0, 500))
      .replace("{{CURRENT_STEP}}", String(nextStepNum))
      .replace("{{MAX_STEPS}}", String(maxSteps))
      .replace("{{PREVIOUS_TOPICS}}", interview.state.previousTopics.join(", ") || "None")
      .replace("{{WEAK_SKILLS}}", interview.state.weakSkills.join(", ") || "None")
      .replace("{{STRONG_SKILLS}}", interview.state.strongSkills.join(", ") || "None");

    const messages = [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Previous Question: "${currentQ.question}"\nCandidate Answer: "${answer}"\nScore Received: ${evaluationResult.finalScore}/10.\nGenerate the next question for step ${nextStepNum} of ${maxSteps}. Avoid repeating topics: ${interview.state.previousTopics.join(", ")}.`
      }
    ];

    aiOutput = await callAiProviderJson(messages, { temperature: 0.7 });
  } catch (err) {
    console.warn("Turn AI call failed, using fallback question:", err.message);
    const fallbackTemplate = FALLBACK_QUESTIONS[nextStepNum - 1] || FALLBACK_QUESTIONS[1];
    aiOutput = {
      question: fallbackTemplate.question,
      competency: fallbackTemplate.competency,
      difficulty: fallbackTemplate.difficulty,
      action: "MOVE_TO_NEW_TOPIC",
      transitionText: "Thank you. Let's move to the next question."
    };
  }

  const nextQuestion = {
    questionIndex: nextStepNum - 1,
    question: aiOutput.question || `Next question regarding your experience with ${interview.role}.`,
    competency: aiOutput.competency || "Technical Problem Solving",
    difficulty: aiOutput.difficulty || 3,
    actionType: aiOutput.action || "MOVE_TO_NEW_TOPIC",
    timeLimit: 90
  };

  interview.state.currentStep = nextStepNum;
  interview.state.currentDifficulty = nextQuestion.difficulty;
  interview.state.currentCompetency = nextQuestion.competency;
  interview.questions.push(nextQuestion);

  await interview.save();

  return {
    isFinished: false,
    nextQuestion,
    transitionText: aiOutput.transitionText || "Thank you. Let's move forward.",
    currentStep: nextStepNum,
    maxSteps
  };
};
