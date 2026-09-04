import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const exams = await prisma.exam.findMany({
    where: { status: "PUBLISHED" },
    include: {
      _count: {
        select: {
          sections: true,
        },
      },
      sections: {
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const summary = exams.map((exam) => ({
    id: exam.id,
    title: exam.title,
    description: exam.description,
    type: exam.type,
    year: exam.year,
    timeLimitMinutes: exam.timeLimitMinutes,
    totalPoints: exam.totalPoints,
    mode: exam.mode,
    status: exam.status,
    createdAt: exam.createdAt,
    _count: {
      sections: exam._count.sections,
      questions: exam.sections.reduce((acc, s) => acc + s._count.questions, 0),
    },
  }));

  return NextResponse.json(summary);
}
