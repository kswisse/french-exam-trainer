import { prisma } from "@/lib/db";

export async function getPublishedExams() {
  return prisma.exam.findMany({
    where: { status: "PUBLISHED" },
    include: {
      sections: {
        include: { questions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExamById(id: string) {
  return prisma.exam.findUnique({
    where: { id },
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
          passages: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getExamTotalPoints(examId: string) {
  const result = await prisma.question.aggregate({
    where: { section: { examId } },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}
