import PreparationPlan from '../models/preparationModel.js';
import Skill from '../models/skillModel.js';
import ResumeJobMatch from '../models/matchModel.js';

export const generatePersonalizedPrepPlan = async (userId, targetRole = "Full Stack Engineer") => {
  const weakSkills = await Skill.find({ userId, masteryLevel: { $in: ["Weak", "Developing"] } }).limit(3);
  const latestMatch = await ResumeJobMatch.findOne({ userId }).sort({ createdAt: -1 });

  const weakSkillNames = weakSkills.map(s => s.skillName);
  const missingGaps = latestMatch?.technicalGaps || ["API Scalability", "System Architecture"];

  const primaryFocus = weakSkillNames[0] || missingGaps[0] || "System Architecture & API Design";
  const secondaryFocus = weakSkillNames[1] || missingGaps[1] || "Behavioral & STAR Answers";

  const tasks = [
    {
      day: 1,
      title: `Deep Dive: ${primaryFocus}`,
      category: "Technical Revision",
      description: `Review fundamental concepts and common interview pitfalls for ${primaryFocus}.`,
      estimatedMinutes: 25,
      completed: false
    },
    {
      day: 2,
      title: `Mock Interview: ${primaryFocus} Focus`,
      category: "Mock Interview",
      description: "Complete a 15-minute targeted adaptive mock interview to test key concepts.",
      estimatedMinutes: 20,
      completed: false
    },
    {
      day: 3,
      title: `Practice ${secondaryFocus}`,
      category: "Technical Revision",
      description: `Prepare structured responses for top 5 questions on ${secondaryFocus}.`,
      estimatedMinutes: 30,
      completed: false
    },
    {
      day: 4,
      title: "STAR Behavioral Masterclass",
      category: "Behavioral",
      description: "Draft 3 STAR stories highlighting measurable metrics and team achievements.",
      estimatedMinutes: 20,
      completed: false
    },
    {
      day: 5,
      title: "System Design & Architecture Simulation",
      category: "System Design",
      description: "Interactive system design session on caching, databases, and microservices.",
      estimatedMinutes: 45,
      completed: false
    },
    {
      day: 6,
      title: "Coding & Complexity Speed Run",
      category: "Coding Practice",
      description: "Solve 2 algorithm problems focusing on Time/Space complexity explanations.",
      estimatedMinutes: 30,
      completed: false
    },
    {
      day: 7,
      title: "Final Target Job Full Simulation",
      category: "Mock Interview",
      description: "Conduct a full 5-question adaptive interview under realistic pressure.",
      estimatedMinutes: 30,
      completed: false
    }
  ];

  const plan = await PreparationPlan.create({
    userId,
    targetRole,
    tasks
  });

  return plan;
};
