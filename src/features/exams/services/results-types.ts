import type { QuestionSnapshot } from "@/types/attempt";

export interface ExamResultDataAttempt {
  id: string;
  profileId: string;
  examId: string;
  status: string;
  mode: string;
  startedAt: Date;
  submittedAt: Date | null;
  timeSpentSeconds: number;
  exam: {
    title: string;
    type: string | null;
    year: number | null;
    negativePoints: number;
    sections: Array<{
      id: string;
      title: string;
      order: number;
    }>;
  };
  questionAttempts: Array<{
    id: string;
    questionId: string;
    selectedOptionId: string | null;
    textAnswer: string | null;
    questionSnapshot: unknown;
    isCorrect: boolean | null;
    pointsAwarded: number;
    timeSpentSeconds: number;
    question: {
      id: string;
      number: number;
      points: number;
      sectionId: string;
      section: {
        id: string;
        title: string;
      };
    };
    mistake: {
      id: string;
      category: string;
      explanation: string | null;
      confidence: number | null;
    } | null;
  }>;
}

export interface ExamResultData {
  attempt: ExamResultDataAttempt;
}

export interface QuestionReviewDetail {
  questionAttempt: ExamResultDataAttempt["questionAttempts"][number];
  snapshot: QuestionSnapshot;
}

export function getQuestionReview(
  questionAttempts: ExamResultDataAttempt["questionAttempts"],
  questionId: string,
): QuestionReviewDetail | null {
  const qa = questionAttempts.find((q) => q.questionId === questionId);
  if (!qa) return null;

  return {
    questionAttempt: qa,
    snapshot: qa.questionSnapshot as unknown as QuestionSnapshot,
  };
}
