import { getPublishedExams } from "@/features/exams/services/exam";
import { ExamList } from "@/features/exams/components/exam-list";

export default async function ExamsPage() {
  const exams = await getPublishedExams();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Exams</h1>
        <p className="mt-2 text-muted-foreground">
          Choose an exam to start practicing.
        </p>
      </div>
      <ExamList exams={exams} />
    </div>
  );
}
