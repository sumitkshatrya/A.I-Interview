export const JOB_ANALYZER_PROMPT = `
You are a Senior Technical Recruiter analyzing a Job Description (JD).
Extract clean structured intelligence from the target job posting text.

Job Description Text:
"""
{{JD_TEXT}}
"""

Extract:
- Job Title
- Seniority Level (Entry, Mid, Senior, Lead, Executive)
- Department / Function
- Core Responsibilities
- Must-have / Required Skills
- Preferred / Good-to-have Skills
- Technologies & Frameworks mentioned
- Minimum Experience required
- Key Interview Focus Areas (Likely question topics)

STRICT JSON ONLY:
{
  "title": "Senior Full Stack Engineer",
  "seniority": "Senior",
  "department": "Engineering",
  "responsibilities": [
    "Design and maintain scalable microservices",
    "Collaborate with product managers and designers"
  ],
  "requiredSkills": ["React", "Node.js", "TypeScript", "PostgreSQL", "System Design"],
  "preferredSkills": ["GraphQL", "Docker", "Kubernetes", "Redis"],
  "technologies": ["React", "Node.js", "Express", "PostgreSQL", "Docker"],
  "experienceRequired": "4+ years",
  "interviewFocusAreas": ["Database Optimization", "System Architecture", "React State Management", "API Security"]
}
`;
