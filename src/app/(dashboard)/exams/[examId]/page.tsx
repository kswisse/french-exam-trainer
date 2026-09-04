import { notFound } from "next/navigation";
import { getExamById } from "@/features/exams/services/exam";
import { ExamDetail } from "@/features/exams/components/exam-detail";

interface ExamDetailPageProps {
  params: Promise<{ examId: string }>;
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { examId } = await params;
  const exam = await getExamById(examId);

  if (!exam) {
    notFound();
  }

  return <ExamDetail exam={exam} />;
}
