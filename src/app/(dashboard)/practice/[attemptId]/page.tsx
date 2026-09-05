import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PracticeTaker } from "@/features/practice/components/practice-taker";

interface PracticeSessionPageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function PracticeSessionPage({ params }: PracticeSessionPageProps) {
  const { attemptId } = await params;
  const user = await requireUser();

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
      questions: {
        orderBy: { createdAt: "asc" },
        include: {
          question: {
            include: {
              options: true,
              answers: true,
              skills: { include: { skill: true } },
              section: true,
              passage: true,
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.profileId !== user.id) {
    notFound();
  }

  if (attempt.status !== "IN_PROGRESS") {
    notFound();
  }

  const questions = attempt.questions.map((qa) => ({
    id: qa.question.id,
    passageId: qa.question.passageId,
    text: qa.question.text,
    type: qa.question.type as any,
    instructions: qa.question.instructions,
    points: qa.question.points,
    difficulty: qa.question.difficulty,
    options: qa.question.options.map((o) => ({
      id: o.id,
      label: o.label,
      text: o.text,
      isCorrect: o.isCorrect,
    })),
    answers: qa.question.answers.map((a) => ({
      text: a.text,
      isAcceptable: a.isAcceptable,
      normalizationRule: a.normalizationRule as Record<string, boolean> | null | undefined,
    })),
    skills: qa.question.skills.map((s) => ({
      name: s.skill.name,
      category: s.skill.category,
    })),
  }));

  const passages = attempt.questions
    .filter((qa) => qa.question.passage)
    .map((qa) => ({
      id: qa.question.passage!.id,
      title: qa.question.passage!.title,
      content: qa.question.passage!.content,
      type: qa.question.passage!.type,
      sourcePage: qa.question.passage!.sourcePage,
    }));

  const uniquePassages = passages.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
  );

  return (
    <PracticeTaker
      attemptId={attemptId}
      examTitle={attempt.exam.title}
      questions={questions}
      passages={uniquePassages}
    />
  );
}
