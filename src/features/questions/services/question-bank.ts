import { prisma } from "@/lib/db";
import {
  type QuestionBankFilters,
  type QuestionBankResult,
  type QuestionBankStats,
} from "@/features/questions/types";

export async function getQuestionBank(
  filters: QuestionBankFilters,
): Promise<QuestionBankResult> {
  const {
    examId,
    sectionId,
    skillId,
    type,
    difficulty,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {};
  if (examId) where.section = { examId };
  if (sectionId) where.sectionId = sectionId;
  if (skillId) where.skills = { some: { skillId } };
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;
  if (search) where.text = { contains: search, mode: "insensitive" };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        section: { include: { exam: true } },
        options: true,
        answers: true,
        skills: { include: { skill: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { number: "asc" },
    }),
    prisma.question.count({ where }),
  ]);

  return { questions, total, page, limit };
}

export async function getQuestionBankStats(): Promise<QuestionBankStats> {
  const [total, byType, bySkill] = await Promise.all([
    prisma.question.count(),
    prisma.question.groupBy({ by: ["type"], _count: true }),
    prisma.questionSkill.groupBy({ by: ["skillId"], _count: true }),
  ]);
  return { total, byType, bySkill };
}
