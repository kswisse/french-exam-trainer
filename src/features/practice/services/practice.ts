import { prisma } from "@/lib/db";
import { type QuestionType } from "@/generated/prisma/browser";
import { buildQuestionSnapshot } from "@/features/exams/services/attempt";

export interface PracticeConfig {
  questionCount: number;
  skillId?: string;
  difficulty?: string;
  type?: QuestionType;
}

export async function createPracticeSession(profileId: string, config: PracticeConfig) {
  const { questionCount = 10, skillId, difficulty, type } = config;

  const where: any = {};
  if (skillId) where.skills = { some: { skillId } };
  if (difficulty) where.difficulty = difficulty;
  if (type) where.type = type;

  const questions = await prisma.question.findMany({
    where,
    include: { options: true, answers: true, skills: { include: { skill: true } }, section: true },
    orderBy: { createdAt: "desc" },
  });

  const shuffled = questions.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, questionCount);

  const exam = await prisma.exam.create({
    data: {
      title: "Practice Session",
      mode: "PRACTICE",
      status: "DRAFT",
      sections: {
        create: {
          title: "Practice Questions",
          order: 1,
        },
      },
    },
    include: { sections: true },
  });

  const attempt = await prisma.examAttempt.create({
    data: {
      profileId,
      examId: exam.id,
      mode: "PRACTICE",
      status: "IN_PROGRESS",
    },
  });

  const questionAttempts = await Promise.all(
    selected.map((q, i) =>
      prisma.questionAttempt.create({
        data: {
          attemptId: attempt.id,
          questionId: q.id,
          questionSnapshot: buildQuestionSnapshot(q) as any,
        },
      })
    )
  );

  return { attempt, questions: selected, questionAttempts };
}

export async function createMistakePracticeSession(profileId: string, questionCount: number) {
  const mistakes = await prisma.mistake.findMany({
    where: { userId: profileId },
    include: { attempt: true },
    orderBy: { createdAt: "desc" },
    take: questionCount * 2,
  });

  const uniqueQuestionIds = [...new Set(mistakes.map(m => m.attempt.questionId))];

  const shuffled = uniqueQuestionIds.sort(() => Math.random() - 0.5);
  const selectedIds = shuffled.slice(0, questionCount);

  const questions = await prisma.question.findMany({
    where: { id: { in: selectedIds } },
    include: { options: true, answers: true, skills: { include: { skill: true } }, section: true },
  });

  const exam = await prisma.exam.create({
    data: {
      title: "Practice My Mistakes",
      mode: "PRACTICE",
      status: "DRAFT",
      sections: {
        create: {
          title: "Mistake Review",
          order: 1,
        },
      },
    },
    include: { sections: true },
  });

  const attempt = await prisma.examAttempt.create({
    data: {
      profileId,
      examId: exam.id,
      mode: "PRACTICE",
      status: "IN_PROGRESS",
    },
  });

  const questionAttempts = await Promise.all(
    questions.map((q, i) =>
      prisma.questionAttempt.create({
        data: {
          attemptId: attempt.id,
          questionId: q.id,
          questionSnapshot: buildQuestionSnapshot(q) as any,
        },
      })
    )
  );

  return { attempt, questions, questionAttempts };
}
