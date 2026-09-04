import { type QuestionType } from "@/generated/prisma/client";

export interface ScoringConfig {
  points: number;
  negativePoints: number;
}

export interface GradeResult {
  isCorrect: boolean | null;  // null for WRITING
  pointsAwarded: number;
}

export interface ExamResult {
  totalScore: number;
  totalPossible: number;
  percentage: number;
  timeSpentSeconds: number;
  sectionResults: SectionResult[];
  questionResults: QuestionResult[];
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
}

export interface SectionResult {
  sectionId: string;
  sectionTitle: string;
  score: number;
  totalPossible: number;
  percentage: number;
}

export interface QuestionResult {
  questionId: string;
  questionNumber: number;
  isCorrect: boolean | null;
  pointsAwarded: number;
  selectedOptionId?: string;
  textAnswer?: string;
}

export interface QuestionSnapshot {
  id: string;
  text: string;
  type: QuestionType;
  instructions?: string;
  points: number;
  difficulty?: string;
  options: Array<{
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }>;
  answers: Array<{
    text: string;
    isAcceptable: boolean;
    normalizationRule?: Record<string, boolean>;
  }>;
  skills: Array<{
    name: string;
    category?: string;
  }>;
}
