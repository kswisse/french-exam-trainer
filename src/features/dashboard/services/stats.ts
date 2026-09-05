import { prisma } from "@/lib/db";

export async function computePerformanceStats(profileId: string) {
  // 1. Overall accuracy: total correct / total attempted
  const totalAttempts = await prisma.questionAttempt.count({
    where: { attempt: { profileId } },
  });
  const correctAttempts = await prisma.questionAttempt.count({
    where: { attempt: { profileId }, isCorrect: true },
  });
  const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

  // 2. Recent accuracy: last 50 question attempts
  const recentAttempts = await prisma.questionAttempt.findMany({
    where: { attempt: { profileId }, isCorrect: { not: null } },
    orderBy: { id: "desc" },
    take: 50,
  });
  const recentCorrect = recentAttempts.filter(a => a.isCorrect).length;
  const recentAccuracy = recentAttempts.length > 0 ? recentCorrect / recentAttempts.length : 0;

  // 3. Skill accuracy: per-skill breakdown
  const allAttempts = await prisma.questionAttempt.findMany({
    where: { attempt: { profileId }, isCorrect: { not: null } },
    include: { question: { include: { skills: { include: { skill: true } } } } },
  });
  const skillStats: Record<string, { correct: number; total: number }> = {};
  allAttempts.forEach(a => {
    a.question.skills.forEach(s => {
      const name = s.skill.name;
      if (!skillStats[name]) skillStats[name] = { correct: 0, total: 0 };
      skillStats[name].total++;
      if (a.isCorrect) skillStats[name].correct++;
    });
  });

  // 4. Mistake frequency: per-category count
  const mistakes = await prisma.mistake.findMany({
    where: { userId: profileId },
  });
  const mistakeFrequency = mistakes.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 5. Exam history: list of attempts with scores
  const examHistoryRaw = await prisma.examAttempt.findMany({
    where: { profileId, status: { in: ["SUBMITTED", "TIME_UP"] } },
    include: { exam: true, questions: { include: { question: true } } },
    orderBy: { submittedAt: "desc" },
    take: 20,
  });
  const examHistory = examHistoryRaw.map(a => ({
    ...a,
    totalScore: a.questions.reduce((sum, q) => sum + q.pointsAwarded, 0),
    totalPossible: a.questions.reduce((sum, q) => sum + q.question.points, 0),
  }));

  // 6. Improvement trend: accuracy over time (last 10 exams)
  const trend = examHistory.slice(0, 10).reverse().map(a => ({
    date: a.submittedAt,
    score: a.totalScore,
    total: a.totalPossible,
  }));

  return {
    overall: { accuracy, totalAttempts, correctAttempts },
    recent: { accuracy: recentAccuracy, count: recentAttempts.length },
    skillStats,
    mistakeFrequency,
    examHistory,
    improvementTrend: trend,
  };
}