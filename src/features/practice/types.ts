import { type QuestionType } from "@/generated/prisma/browser";

export interface PracticeConfig {
  questionCount: number;
  skillId?: string;
  difficulty?: string;
  type?: QuestionType;
}
