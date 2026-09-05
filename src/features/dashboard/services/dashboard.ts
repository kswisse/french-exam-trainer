import { prisma } from "@/lib/db";

export async function getDashboardData(profileId: string) {
  const [
    recentAttempt,
    allAttempts,
    skillStats,
    recentMistakes,
    availableExams,
  ] = await Promise.all([
    prisma.examAttempt.findFirst({
      where: { profileId, status: { in: ["SUBMITTED", "TIME_UP"] } },
      include: { exam: true, questions: true },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.examAttempt.findMany({
      where: { profileId, status: { in: ["SUBMITTED", "TIME_UP"] } },
      include: { questions: true },
    }),
    prisma.questionAttempt.findMany({
      where: {
        attempt: { profileId, status: { in: ["SUBMITTED", "TIME_UP"] } },
        isCorrect: { not: null },
      },
      include: {
        question: {
          include: { skills: { include: { skill: true } } },
        },
      },
    }),
    prisma.mistake.findMany({
      where: { userId: profileId },
      include: {
        attempt: {
          include: {
            question: true,
            attempt: { include: { exam: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.exam.findMany({
      where: { status: "PUBLISHED" },
      include: {
        sections: { include: { questions: true } },
        attempts: {
          where: { profileId },
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const examsTaken = allAttempts.length;
  const totalQuestionsAttempted = allAttempts.reduce(
    (sum, a) => sum + a.questions.length,
    0
  );
  const correctAnswers = allAttempts.reduce(
    (sum, a) =>
      sum + a.questions.filter((qa) => qa.isCorrect === true).length,
    0
  );
  const overallAccuracy =
    totalQuestionsAttempted > 0
      ? Math.round((correctAnswers / totalQuestionsAttempted) * 100)
      : 0;

  const skillAccuracyMap = new Map<
    string,
    { name: string; correct: number; total: number }
  >();
  for (const qa of skillStats) {
    for (const qs of qa.question.skills) {
      const existing = skillAccuracyMap.get(qs.skill.id) ?? {
        name: qs.skill.name,
        correct: 0,
        total: 0,
      };
      existing.total += 1;
      if (qa.isCorrect === true) existing.correct += 1;
      skillAccuracyMap.set(qs.skill.id, existing);
    }
  }

  const skillsWithAccuracy = Array.from(skillAccuracyMap.values()).map((s) => ({
    name: s.name,
    accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    total: s.total,
    correct: s.correct,
  }));

  skillsWithAccuracy.sort((a, b) => a.accuracy - b.accuracy);

  const weakestSkills = skillsWithAccuracy.slice(0, 3);
  const strongestSkills = [...skillsWithAccuracy].reverse().slice(0, 3);

  return {
    recentAttempt,
    performance: {
      examsTaken,
      totalQuestionsAttempted,
      correctAnswers,
      overallAccuracy,
    },
    weakestSkills,
    strongestSkills,
    recentMistakes,
    availableExams,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
