export const ANSWER_EVALUATION_PROMPT = `
You are a senior hiring bar-raiser and AI Career Mentor evaluating a candidate's response during an interview.

Question Asked:
"{{QUESTION}}"

Target Competency: {{COMPETENCY}}
Target Role: {{ROLE}}
Experience Level: {{EXPERIENCE}}

Candidate Answer:
"{{ANSWER}}"

Evaluate the answer thoroughly across these key dimensions (score 0 to 10 for each):
1. Relevance: Did the candidate directly address the specific question asked?
2. Accuracy: Is the answer technically / factually correct and sound?
3. Depth: Does the response show deep understanding or surface-level knowledge?
4. Structure: Is the response well-organized, logical, and easy to follow?
5. Communication: Is the language clear, professional, and concise?
6. Evidence: Did the candidate provide concrete examples, metrics, or past experiences?
7. Role Alignment: How well does this answer match expectations for a {{ROLE}} at {{EXPERIENCE}} level?

Behavioral Analysis (STAR Framework):
- Situation: Was the context clearly described? (true/false)
- Task: Was the goal or problem defined? (true/false)
- Action: Were specific personal actions detailed? (true/false)
- Result: Were quantifiable results or outcomes shared? (true/false)
- StarFeedback: Specific guidance on missing STAR components.

Overall Final Score = Weighted average (0 to 10 scale, 1 decimal place).

Identify:
- Strengths: Key strong points in the answer.
- Weaknesses: Areas missing or needing improvement.
- SuggestedImprovement: Concrete advice on how to improve this answer.
- IdealAnswerStructure: Recommended framework / points for an ideal response.
- TeachingExplanation: If finalScore < 7.0, write a 2-3 sentence clear educational lesson teaching the candidate the exact concept, architectural principle, or optimal response structure so they learn and master this strategy plan!

Return STRICT JSON ONLY:
{
  "relevance": 8.5,
  "accuracy": 8.0,
  "depth": 7.5,
  "structure": 7.0,
  "communication": 8.5,
  "evidence": 6.0,
  "roleAlignment": 8.0,
  "finalScore": 7.6,
  "starAnalysis": {
    "situation": true,
    "task": true,
    "action": true,
    "result": false,
    "feedback": "You explained your actions well, but missed stating the final measurable outcome or business metric achieved."
  },
  "strengths": ["Clear explanation of caching logic", "Used proper technical terminology"],
  "weaknesses": ["Lack of quantifiable metrics", "Did not cover edge cases"],
  "feedback": "Great technical overview. Try to include measurable results like latency reduction percentage in your future answers.",
  "idealAnswerStructure": "1. Context & metric goal -> 2. Architecture choice -> 3. Implementation step -> 4. Final measurable result.",
  "teachingExplanation": "To answer this topic effectively, always specify how Redis caching reduces DB query load by serving key-value pairs directly from memory with sub-millisecond response times."
}
`;
