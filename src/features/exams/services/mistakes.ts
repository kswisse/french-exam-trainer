import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export interface MistakeFilters {
  category?: string;
  skillId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export type MistakeWithRelations = Prisma.MistakeGetPayload<{
  include: {
    attempt: {
      include: {
        question: { include: { skills: { include: { skill: true } } } },
        attempt: { include: { exam: true } },
      };
    };
  };
}>;

export async function getMistakes(userId: string, filters?: MistakeFilters) {
  const { category, skillId, dateFrom, dateTo, page = 1, limit = 20 } = filters || {};

  const where: Prisma.MistakeWhereInput = {
    userId,
    ...(category && { category: category as any }),
    ...(skillId && {
      attempt: { question: { skills: { some: { skillId } } } },
    }),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }
      : {}),
  };

  const [mistakes, total] = await Promise.all([
    prisma.mistake.findMany({
      where,
      include: {
        attempt: {
          include: {
            question: { include: { skills: { include: { skill: true } } } },
            attempt: { include: { exam: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mistake.count({ where }),
  ]);

  return { mistakes: mistakes as MistakeWithRelations[], total, page, limit };
}

export async function getMistakeStats(userId: string) {
  const mistakes = await prisma.mistake.findMany({
    where: { userId },
    include: {
      attempt: {
        include: {
          question: { include: { skills: { include: { skill: true } } } },
          attempt: { include: { exam: true } },
        },
      },
    },
  });

  const byCategory = mistakes.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const skillCounts: Record<string, number> = {};
  mistakes.forEach((m) => {
    m.attempt.question.skills.forEach((s) => {
      skillCounts[s.skill.name] = (skillCounts[s.skill.name] || 0) + 1;
    });
  });

  return { total: mistakes.length, byCategory, topSkills: skillCounts };
}

export async function updateMistakeCategory(
  mistakeId: string,
  userId: string,
  category: string
) {
  const mistake = await prisma.mistake.findUnique({
    where: { id: mistakeId },
  });
  if (!mistake || mistake.userId !== userId) return null;
  return prisma.mistake.update({
    where: { id: mistakeId },
    data: { category: category as any },
  });
}