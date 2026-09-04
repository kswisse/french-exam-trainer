import { notFound } from "next/navigation";
import { getExamResult, computeExamResult } from "@/features/exams/services/results";
import { ResultsPage } from "@/features/exams/components/results-page";
import { getCurrentUser } from "@/lib/auth";

interface ResultsPageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function ResultsPageComponent({
  params,
}: ResultsPageProps) {
  const { attemptId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  const resultData = await getExamResult(attemptId, user.id);

  if (!resultData) {
    notFound();
  }

  const examResult = computeExamResult(
    resultData.attempt.questionAttempts,
    resultData.attempt.timeSpentSeconds,
  );

  return (
    <ResultsPage
      examResult={examResult}
      questionAttempts={resultData.attempt.questionAttempts}
      examTitle={resultData.attempt.exam.title}
    />
  );
}
