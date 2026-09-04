import { notFound, redirect } from "next/navigation";
import { getExamById } from "@/features/exams/services/exam";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ExamTaker } from "@/features/exams/components/exam-taker";

interface TakeExamPageProps {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function TakeExamPage({ params, searchParams }: TakeExamPageProps) {
  const { examId } = await params;
  const { mode } = await searchParams;

  const user = await requireUser();
  const exam = await getExamById(examId);

  if (!exam) {
    notFound();
  }

  if (exam.status !== "PUBLISHED") {
    notFound();
  }

  const attemptMode = mode === "practice" ? "PRACTICE" : "REAL_EXAM";

  if (exam.mode !== "BOTH" && exam.mode !== attemptMode) {
    notFound();
  }

  let attempt = await prisma.examAttempt.findFirst({
    where: {
      profileId: user.id,
      examId,
      status: "IN_PROGRESS",
    },
    include: {
      questions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!attempt) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, mode: attemptMode }),
    });

    if (!response.ok) {
      throw new Error("Failed to create attempt");
    }

    const data = await response.json();
    attempt = await prisma.examAttempt.findUnique({
      where: { id: data.attempt.id },
      include: {
        questions: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!attempt) {
      throw new Error("Failed to fetch created attempt");
    }
  }

  const questions = attempt.questions.map((qa) => qa.questionSnapshot as any);

  const passages = exam.sections.flatMap((section) =>
    section.passages.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      type: p.type,
      sourcePage: p.sourcePage,
    }))
  );

  return (
    <ExamTaker
      attemptId={attempt.id}
      examId={exam.id}
      examTitle={exam.title}
      timeLimitMinutes={exam.timeLimitMinutes}
      questions={questions}
      passages={passages}
    />
  );
}
