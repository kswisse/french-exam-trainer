import { prisma } from "@/lib/db";
import { calculateTotalPossible } from "@/services/scoring";
import type { QuestionSnapshot } from "@/types/attempt";
import type { ExamResult, SectionResult, QuestionResult } from "@/types/scoring";
import type { ExamResultData, ExamResultDataAttempt } from "./results-types";

export type { ExamResultData, ExamResultDataAttempt } from "./results-types";
export { getQuestionReview } from "./results-types";

export async function getExamResult(
  attemptId: string,
  profileId: string,
): Promise<ExamResultData | null> {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      questions: {
        orderBy: { question: { number: "asc" } },
        include: {
          question: {
            include: {
              section: true,
            },
          },
          mistake: true,
        },
      },
      exam: {
        include: {
          sections: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!attempt || attempt.profileId !== profileId) return null;

  if (attempt.status !== "SUBMITTED" && attempt.status !== "TIME_UP") return null;

  return attempt as unknown as ExamResultData;
}

export function computeExamResult(
  questionAttempts: ExamResultDataAttempt["questionAttempts"],
  timeSpentSeconds: number,
): ExamResult {
  const totalScore = questionAttempts.reduce(
    (sum, qa) => sum + qa.pointsAwarded,
    0,
  );

  const snapshots = questionAttempts.map(
    (qa) => qa.questionSnapshot as unknown as QuestionSnapshot,
  );
  const totalPossible = calculateTotalPossible(snapshots);

  const correctCount = questionAttempts.filter(
    (qa) => qa.isCorrect === true,
  ).length;
  const incorrectCount = questionAttempts.filter(
    (qa) => qa.isCorrect === false,
  ).length;
  const unansweredCount = questionAttempts.filter(
    (qa) => qa.isCorrect === null,
  ).length;

  const attemptedCount = correctCount + incorrectCount;
  const accuracy =
    attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
  const percentage =
    totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

  const sectionMap = new Map<
    string,
    { sectionId: string; sectionTitle: string; score: number; totalPossible: number }
  >();
  for (const qa of questionAttempts) {
    const sectionId = qa.question.sectionId;
    if (!sectionMap.has(sectionId)) {
      sectionMap.set(sectionId, {
        sectionId,
        sectionTitle: qa.question.section.title,
        score: 0,
        totalPossible: 0,
      });
    }
    const section = sectionMap.get(sectionId)!;
    const snapshot = qa.questionSnapshot as unknown as QuestionSnapshot;
    section.score += qa.pointsAwarded;
    section.totalPossible += snapshot.points;
  }

  const sectionResults: SectionResult[] = Array.from(sectionMap.values()).map(
    (s) => ({
      ...s,
      percentage:
        s.totalPossible > 0 ? (s.score / s.totalPossible) * 100 : 0,
    }),
  );

  const questionResults: QuestionResult[] = questionAttempts.map((qa) => ({
    questionId: qa.questionId,
    questionNumber: qa.question.number,
    isCorrect: qa.isCorrect,
    pointsAwarded: qa.pointsAwarded,
    selectedOptionId: qa.selectedOptionId ?? undefined,
    textAnswer: qa.textAnswer ?? undefined,
  }));

  return {
    totalScore,
    totalPossible,
    percentage,
    timeSpentSeconds,
    sectionResults,
    questionResults,
    correctCount,
    incorrectCount,
    unansweredCount,
    accuracy,
  };
}
