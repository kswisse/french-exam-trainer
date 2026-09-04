import { type QuestionType } from "@/generated/prisma/browser";

export interface CreateAttemptInput {
  examId: string;
  mode: string;
}

export interface SaveAnswerInput {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
}

export interface QuestionSnapshot {
  id: string;
  passageId?: string | null;
  text: string;
  type: QuestionType;
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
    normalizationRule?: Record<string, boolean> | null;
  }>;
  skills: Array<{
    name: string;
    category?: string | null;
  }>;
}
