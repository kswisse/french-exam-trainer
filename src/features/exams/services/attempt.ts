import { prisma } from "@/lib/db";
import { gradeAnswer, calculateExamResult } from "@/services/scoring";
import type { QuestionSnapshot } from "@/types/attempt";
import type { AttemptMode } from "@/generated/prisma/browser";

export function buildQuestionSnapshot(question: {
  id: string;
  passageId?: string | null;
  text: string;
  type: string;
  instructions?: string | null;
  points: number;
  difficulty?: string | null;
  options: Array<{
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }>;
  answers: Array<{
    text: string;
    isAcceptable: boolean;
    normalizationRule?: unknown;
  }>;
  skills: Array<{
    skill: {
      name: string;
      category?: string | null;
    };
  }>;
}): QuestionSnapshot {
  return {
    id: question.id,
    passageId: question.passageId,
    text: question.text,
    type: question.type as QuestionSnapshot["type"],
    instructions: question.instructions,
    points: question.points,
    difficulty: question.difficulty,
    options: question.options.map((o) => ({
      id: o.id,
      label: o.label,
      text: o.text,
      isCorrect: o.isCorrect,
    })),
    answers: question.answers.map((a) => ({
      text: a.text,
      isAcceptable: a.isAcceptable,
      normalizationRule: a.normalizationRule as Record<string, boolean> | null | undefined,
    })),
    skills: question.skills.map((s) => ({
      name: s.skill.name,
      category: s.skill.category,
    })),
  };
}

export async function createAttempt(
  profileId: string,
  examId: string,
  mode: AttemptMode,
) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      sections: {
        include: {
          questions: {
            include: {
              options: true,
              answers: true,
              skills: { include: { skill: true } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!exam || exam.status !== "PUBLISHED") {
    throw new Error("Exam not found or not published");
  }

  if (exam.mode !== "BOTH" && exam.mode !== mode) {
    throw new Error(`Exam does not support mode: ${mode}`);
  }

  const existingAttempt = await prisma.examAttempt.findFirst({
    where: {
      profileId,
      examId,
      status: "IN_PROGRESS",
    },
  });

  if (existingAttempt) {
    throw new Error("An in-progress attempt already exists for this exam");
  }

  const allQuestions = exam.sections.flatMap((section) =>
    section.questions.map((q) => ({ ...q, section })),
  );

  const attempt = await prisma.examAttempt.create({
    data: {
      profileId,
      examId,
      mode,
    },
  });

  const questionAttempts = await Promise.all(
    allQuestions.map((question) => {
      const snapshot = buildQuestionSnapshot(question);
      return prisma.questionAttempt.create({
        data: {
          attemptId: attempt.id,
          questionId: question.id,
          questionSnapshot: snapshot as any,
        },
      });
    }),
  );

  return {
    attempt,
    questions: questionAttempts,
  };
}

export async function saveAnswer(
  attemptId: string,
  profileId: string,
  questionId: string,
  selectedOptionId?: string,
  textAnswer?: string,
) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.profileId !== profileId) {
    throw new Error("Unauthorized");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Cannot save answer to a submitted attempt");
  }

  const questionAttempt = await prisma.questionAttempt.findFirst({
    where: {
      attemptId,
      questionId,
    },
  });

  if (!questionAttempt) {
    throw new Error("Question attempt not found");
  }

  const updated = await prisma.questionAttempt.update({
    where: { id: questionAttempt.id },
    data: {
      selectedOptionId: selectedOptionId ?? null,
      textAnswer: textAnswer ?? null,
    },
  });

  return updated;
}

export async function submitAttempt(attemptId: string, profileId: string) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
    },
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.profileId !== profileId) {
    throw new Error("Unauthorized");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt is not in progress");
  }

  const questionAttempts = await prisma.questionAttempt.findMany({
    where: { attemptId },
    include: {
      question: {
        include: {
          section: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const gradingConfig = {
    points: 1,
    negativePoints: attempt.exam.negativePoints,
  };

  const gradedResults = await Promise.all(
    questionAttempts.map(async (qa) => {
      const snapshot = qa.questionSnapshot as any;
      const result = gradeAnswer(
        snapshot,
        qa.selectedOptionId ?? undefined,
        qa.textAnswer ?? undefined,
        gradingConfig,
      );

      await prisma.questionAttempt.update({
        where: { id: qa.id },
        data: {
          isCorrect: result.isCorrect,
          pointsAwarded: result.pointsAwarded,
        },
      });

      if (result.isCorrect === false) {
        await prisma.mistake.create({
          data: {
            userId: profileId,
            questionAttemptId: qa.id,
            category: "UNKNOWN",
          },
        });
      }

      return {
        questionId: qa.questionId,
        questionNumber: qa.question.number,
        isCorrect: result.isCorrect,
        pointsAwarded: result.pointsAwarded,
        points: qa.question.points,
        selectedOptionId: qa.selectedOptionId ?? undefined,
        textAnswer: qa.textAnswer ?? undefined,
        sectionId: qa.question.sectionId,
        sectionTitle: qa.question.section.title,
      };
    }),
  );

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  const result = calculateExamResult(gradedResults, attempt.timeSpentSeconds);

  return result;
}
