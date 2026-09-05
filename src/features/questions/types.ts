import { type QuestionType } from "@/generated/prisma/browser";

export interface QuestionBankFilters {
  examId?: string;
  sectionId?: string;
  skillId?: string;
  type?: QuestionType;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QuestionBankResult {
  questions: any[];
  total: number;
  page: number;
  limit: number;
}

export interface QuestionBankStats {
  total: number;
  byType: { type: string; _count: number }[];
  bySkill: { skillId: string; _count: number }[];
}
