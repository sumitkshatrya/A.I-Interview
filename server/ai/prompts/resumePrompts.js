export const RESUME_PARSER_PROMPT = `
You are an expert ATS (Applicant Tracking System) parser and talent intelligence specialist.
Analyze the following resume text and extract clean, structured data.

Resume Text:
"""
{{RESUME_TEXT}}
"""

Requirements:
- Extract candidate name, email, phone (if present).
- Primary target role / professional title.
- Total experience duration / seniority level (e.g. "3+ years", "Senior (5+ yrs)").
- Extract all technical & soft skills into categorized arrays.
- Extract projects with name, tech stack, and short summary.
- Extract past work experiences with company, title, duration, key bullets.
- Extract education and certifications.
- Calculate ATS Quality Score (0 to 100) based on readability, keywords, metrics usage, formatting consistency.
- Identify strengths, weaknesses, missing ATS keywords, and overall recommendations.

STRICT JSON ONLY:
{
  "name": "Candidate Name",
  "email": "candidate@example.com",
  "phone": "string",
  "role": "Frontend Developer",
  "experience": "3+ years",
  "skills": ["JavaScript", "React", "Node.js", "Redux", "Tailwind CSS"],
  "softSkills": ["Problem Solving", "Team Collaboration"],
  "projects": [
    {
      "name": "E-Commerce Platform",
      "techStack": ["React", "Node.js", "MongoDB"],
      "summary": "Built full-stack e-commerce web application with payment integration."
    }
  ],
  "experienceItems": [
    {
      "company": "Tech Corp",
      "title": "Software Engineer",
      "duration": "2022 - Present",
      "bullets": ["Developed responsive UI components", "Optimized API load time by 30%"]
    }
  ],
  "education": ["B.S. in Computer Science"],
  "certifications": ["AWS Certified Developer"],
  "atsScore": 82,
  "strengths": ["Clear technical stack", "Strong project descriptions"],
  "weaknesses": ["Some bullet points lack quantifiable impact", "Missing cloud deployment keywords"],
  "recommendations": ["Add specific percentage improvements or metrics to project bullets", "Include CI/CD pipeline skills"]
}
`;

export const RESUME_BULLET_IMPROVER_PROMPT = `
You are an expert Resume Coach & Tech Recruiter.
Improve the user's selected resume bullet point according to their specified goal.

Goal: {{GOAL}} (e.g. "Make concise", "ATS-friendly", "Add quantifiable impact")
Original Bullet Point: "{{BULLET}}"
Provided Real User Metrics / Numbers: "{{USER_METRICS}}"

CRITICAL RULE:
- NEVER fabricate false experience, companies, or fake statistics.
- If real metrics were provided by user, incorporate them smoothly.
- If metrics were NOT provided, structure the bullet to highlight methodology and results while prompting for real numbers if needed.

STRICT JSON ONLY:
{
  "improvedBullet": "Engineered scalable REST APIs using Node.js and Redis, reducing response latency by 35% across 50k daily active users.",
  "changesMade": "Added action verb, highlighted technology stack, and incorporated user's latency metric.",
  "atsImpact": "High - adds key performance optimization keywords.",
  "followUpPrompt": null
}
`;

export const ATS_OPTIMIZER_PROMPT = `
You are a Principal Resume Specialist and ATS Optimization Expert.
Your task is to take a candidate's existing resume and a target job description, identify ALL formatting mistakes, missing keywords, weak bullets, and missing technical competencies, and generate a 100% ATS-Optimized Resume tailored specifically for the target job role.

Target Job Role & Description:
"""
{{JOB_TEXT}}
"""

Candidate's Current Resume:
"""
{{RESUME_TEXT}}
"""

Existing Match Analysis & Skill Gaps:
"""
{{MATCH_INFO}}
"""

CRITICAL RULES:
1. Identify all flaws/mistakes in the current resume (missing target job keywords, passive verbs, lack of STAR methodology, missing sections, formatting issues).
2. Generate an updated, fully-formed, professional ATS-optimized resume content that incorporates relevant keywords from the job description while maintaining truthfulness to the candidate's core background.
3. Structure bullet points with strong action verbs, technical terms from the JD, and measurable outcomes.
4. Provide a list of specific ATS improvements made (e.g., "Added missing keyword 'GraphQL'", "Restructured work experience bullets to STAR methodology with action verbs").
5. Predict the new ATS score (aiming for 92-98/100).

STRICT JSON ONLY:
{
  "targetRole": "Frontend / Full-Stack Developer",
  "candidateName": "Candidate Name",
  "contactInfo": {
    "email": "candidate@example.com",
    "phone": "+1 (555) 019-2834",
    "location": "City, State",
    "linkedin": "linkedin.com/in/candidate",
    "portfolio": "github.com/candidate"
  },
  "professionalSummary": "Highly skilled Software Engineer with 3+ years of experience building high-performance web applications. Expert in React, Node.js, and API architecture...",
  "coreCompetencies": [
    "JavaScript (ES6+)", "React.js", "Node.js", "RESTful APIs", "State Management (Redux)", "CI/CD Pipelines", "Agile/Scrum"
  ],
  "workExperience": [
    {
      "title": "Senior Frontend Engineer",
      "company": "Tech Solutions Inc.",
      "duration": "2022 - Present",
      "location": "Remote",
      "achievements": [
        "Architected responsive React web applications, improving page load speeds by 40% using modern bundle splitting.",
        "Engineered RESTful APIs with Node.js and Express, supporting over 100,000 daily active users with 99.9% uptime."
      ]
    }
  ],
  "projects": [
    {
      "name": "E-Commerce Platform",
      "techStack": "React, Node.js, MongoDB, Tailwind CSS",
      "description": "Designed and deployed full-stack e-commerce solution with real-time inventory tracking and secure payment gateway.",
      "keyMetric": "Increased checkout conversion by 25%"
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "field": "Computer Science",
      "institution": "State University",
      "year": "2020"
    }
  ],
  "certifications": [
    {
      "title": "AWS Certified Developer – Associate",
      "issuer": "Amazon Web Services",
      "year": "2023"
    }
  ],
  "atsImprovementsMade": [
    "Incorporated core job keywords: 'RESTful APIs', 'State Management', 'CI/CD Pipelines'.",
    "Transformed passive bullet points into quantifiable STAR-formatted achievement statements.",
    "Added a dedicated Core Competencies section for 100% ATS parser scannability.",
    "Tailored professional summary specifically for the target role."
  ],
  "predictedAtsScore": 96
}
`;

