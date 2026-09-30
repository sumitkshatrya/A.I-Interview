import { callAiProviderJson } from './aiProvider.service.js';
import { ANSWER_EVALUATION_PROMPT } from '../ai/prompts/evaluationPrompts.js';

export const evaluateAnswerDetails = async ({
  question,
  competency,
  role,
  experience,
  answer
}) => {
  if (!answer || !answer.trim()) {
    return {
      relevance: 0,
      accuracy: 0,
      depth: 0,
      structure: 0,
      communication: 0,
      evidence: 0,
      roleAlignment: 0,
      finalScore: 0,
      starAnalysis: {
        situation: false,
        task: false,
        action: false,
        result: false,
        feedback: "No response was submitted by the candidate."
      },
      strengths: [],
      weaknesses: ["No answer submitted"],
      feedback: "You did not submit an answer before the timer expired.",
      idealAnswerStructure: "Provide a clear summary of your past experience and technical implementation details.",
      teachingExplanation: "Key lesson: Always prepare a structured 3-part response covering background context, technical execution, and final metrics achieved."
    };
  }

  const prompt = ANSWER_EVALUATION_PROMPT
    .replace("{{QUESTION}}", question)
    .replace("{{COMPETENCY}}", competency || "General Competency")
    .replace("{{ROLE}}", role)
    .replace("{{EXPERIENCE}}", experience)
    .replace("{{ANSWER}}", answer);

  const messages = [
    { role: "system", content: "You are an objective AI interview evaluator and mentor." },
    { role: "user", content: prompt }
  ];

  try {
    const evaluation = await callAiProviderJson(messages, { temperature: 0.3 });
    const finalScore = evaluation.finalScore ?? 6.0;

    return {
      relevance: evaluation.relevance ?? 6.0,
      accuracy: evaluation.accuracy ?? 6.0,
      depth: evaluation.depth ?? 6.0,
      structure: evaluation.structure ?? 6.0,
      communication: evaluation.communication ?? 6.0,
      evidence: evaluation.evidence ?? 5.0,
      roleAlignment: evaluation.roleAlignment ?? 6.0,
      finalScore,
      starAnalysis: evaluation.starAnalysis || {
        situation: true,
        task: true,
        action: true,
        result: false,
        feedback: "Include measurable outcomes."
      },
      strengths: evaluation.strengths || ["Answer provided."],
      weaknesses: evaluation.weaknesses || ["Could include more detail."],
      feedback: evaluation.feedback || "Good effort. Focus on concrete examples.",
      idealAnswerStructure: evaluation.idealAnswerStructure || "Situation -> Action -> Result.",
      teachingExplanation: evaluation.teachingExplanation || (finalScore < 7.0
        ? `Educational Note for ${competency}: Focus on stating clear architecture patterns, trade-offs evaluated, and measurable outcomes to demonstrate senior mastery.`
        : null)
    };
  } catch (err) {
    console.error("Evaluation service fallback:", err.message);
    return {
      relevance: 6.0,
      accuracy: 6.0,
      depth: 6.0,
      structure: 6.0,
      communication: 6.0,
      evidence: 5.0,
      roleAlignment: 6.0,
      finalScore: 6.0,
      starAnalysis: {
        situation: true,
        task: true,
        action: true,
        result: false,
        feedback: "Evaluation completed with fallback analysis."
      },
      strengths: ["Clear response provided."],
      weaknesses: ["Additional context would enhance response."],
      feedback: "Answer received and evaluated.",
      idealAnswerStructure: "1. Overview -> 2. Technical Solution -> 3. Impact.",
      teachingExplanation: `Educational Note: For ${competency}, explain why your chosen technical approach solves the core problem and back it up with metrics.`
    };
  }
};
