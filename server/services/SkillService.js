import Skill from '../models/skillModel.js';
import User from '../models/userModel.js';

export const calculateMasteryLevel = (avgScore, attemptsCount) => {
  if (attemptsCount === 0) return "Weak";
  if (avgScore >= 8.5 && attemptsCount >= 3) return "Mastered";
  if (avgScore >= 7.0 && attemptsCount >= 2) return "Strong";
  if (avgScore >= 5.5) return "Good";
  if (avgScore >= 4.0) return "Developing";
  return "Weak";
};

export const updateSkillFromEvaluation = async (userId, skillName, score, difficulty, interviewId) => {
  if (!skillName || skillName === "General Technical" || skillName === "Introduction & Background") {
    return;
  }

  let skillRecord = await Skill.findOne({ userId, skillName });

  if (!skillRecord) {
    skillRecord = new Skill({
      userId,
      skillName,
      attemptsCount: 0,
      averageScore: 0,
      recentScore: 0,
      history: []
    });
  }

  skillRecord.history.push({
    interviewId,
    score,
    difficulty,
    date: new Date()
  });

  const totalAttempts = skillRecord.history.length;
  const sumScores = skillRecord.history.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = Number((sumScores / totalAttempts).toFixed(1));

  let scoreTrend = "Stable";
  if (totalAttempts > 1) {
    const prevScore = skillRecord.recentScore;
    if (score > prevScore + 0.5) scoreTrend = "Improving";
    else if (score < prevScore - 0.5) scoreTrend = "Declining";
  }

  skillRecord.attemptsCount = totalAttempts;
  skillRecord.averageScore = avgScore;
  skillRecord.recentScore = score;
  skillRecord.scoreTrend = scoreTrend;
  skillRecord.masteryLevel = calculateMasteryLevel(avgScore, totalAttempts);

  await skillRecord.save();

  // Also sync to User model skills list
  const user = await User.findById(userId);
  if (user) {
    const existingIndex = user.skills.findIndex(s => s.name === skillName);
    if (existingIndex >= 0) {
      user.skills[existingIndex].masteryLevel = skillRecord.masteryLevel;
      user.skills[existingIndex].score = avgScore;
      user.skills[existingIndex].attempts = totalAttempts;
    } else {
      user.skills.push({
        name: skillName,
        masteryLevel: skillRecord.masteryLevel,
        score: avgScore,
        attempts: totalAttempts
      });
    }
    await user.save();
  }

  return skillRecord;
};

export const getUserSkillGraph = async (userId) => {
  const skills = await Skill.find({ userId }).sort({ averageScore: -1 });

  if (skills.length === 0) {
    // Return default skill tree fallback
    return [
      { skillName: "JavaScript", category: "Frontend", masteryLevel: "Strong", averageScore: 8.0, attemptsCount: 3 },
      { skillName: "React", category: "Frontend", masteryLevel: "Good", averageScore: 7.2, attemptsCount: 2 },
      { skillName: "Node.js", category: "Backend", masteryLevel: "Developing", averageScore: 6.0, attemptsCount: 2 },
      { skillName: "System Design", category: "Architecture", masteryLevel: "Weak", averageScore: 4.5, attemptsCount: 1 },
      { skillName: "REST APIs", category: "Backend", masteryLevel: "Strong", averageScore: 8.5, attemptsCount: 4 }
    ];
  }

  return skills;
};
