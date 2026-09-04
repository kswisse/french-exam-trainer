import type { ExamWithSections } from "../types";
import { ExamCard } from "./exam-card";

interface ExamListProps {
  exams: ExamWithSections[];
}

export function ExamList({ exams }: ExamListProps) {
  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-semibold text-foreground">No exams available</h2>
        <p className="mt-2 text-muted-foreground">
          Check back later for published exams.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <ExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  );
}
