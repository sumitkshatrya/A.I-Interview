export const RESUME_JOB_MATCH_PROMPT = `
You are an AI Talent Matching & Career Strategy Specialist.
Compare the Candidate's Resume against the Target Job Description requirements.

Candidate Resume Summary:
- Role: {{RESUME_ROLE}}
- Experience: {{RESUME_EXPERIENCE}}
- Skills: {{RESUME_SKILLS}}
- Projects: {{RESUME_PROJECTS}}
- Resume Text Excerpt: "{{RESUME_TEXT}}"

Target Job Description:
- Title: {{JD_TITLE}}
- Required Skills: {{JD_REQUIRED_SKILLS}}
- Preferred Skills: {{JD_PREFERRED_SKILLS}}
- Focus Areas: {{JD_FOCUS_AREAS}}
- JD Text Excerpt: "{{JD_TEXT}}"

Perform transparent match scoring and gap analysis:
1. Preparation Match Score (0 to 100%): How closely does the candidate's current background match the job requirements?
2. Matching Skills: Skills present in both resume and JD.
3. Missing Required Skills: Skills required by JD but absent or weak in resume.
4. Missing Preferred Skills: Desirable skills in JD missing in resume.
5. Keyword Gaps: Critical ATS keywords present in JD missing in resume.
6. Technical Gaps: Core technical competencies candidate needs to study/practice.
7. Preparation Priorities: Ordered list of top action items to get 100% ready for this role.

DO NOT state probability of getting hired or claim guaranteed job offers. Label this clearly as "Preparation Match Score".

STRICT JSON ONLY:
{
  "matchScore": 84,
  "summary": "Strong match for frontend and API building, but needs system design and Redis caching preparation.",
  "matchingSkills": ["JavaScript", "React", "Node.js", "REST APIs"],
  "missingRequiredSkills": ["TypeScript", "System Design"],
  "missingPreferredSkills": ["Redis", "Docker"],
  "keywordGaps": ["TypeScript", "Microservices", "CI/CD"],
  "technicalGaps": ["Distributed caching with Redis", "System architecture & load balancing"],
  "preparationPriorities": [
    {
      "priority": 1,
      "topic": "System Design & API Scalability",
      "reason": "Required for senior level evaluation in target JD",
      "action": "Complete a 20-minute System Design mock interview focusing on Redis & Load Balancers"
    },
    {
      "priority": 2,
      "topic": "TypeScript Fundamentals",
      "reason": "Mentioned as core required skill in target JD",
      "action": "Review TypeScript generics and interface definitions"
    }
  ]
}
`;
