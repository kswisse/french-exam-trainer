import { ScoreSummary } from "./score-summary";
import { SectionPerformance } from "./section-performance";
import { QuestionReview } from "./question-review";
import type { ExamResult } from "@/types/scoring";
import type { ExamResultDataAttempt } from "../services/results-types";

interface ResultsPageProps {
  examResult: ExamResult;
  questionAttempts: ExamResultDataAttempt["questionAttempts"];
  examTitle: string;
}

export function ResultsPage({
  examResult,
  questionAttempts,
  examTitle,
}: ResultsPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Results</h1>
        <p className="mt-2 text-muted-foreground">{examTitle}</p>
      </div>

      <ScoreSummary result={examResult} />

      <SectionPerformance sections={examResult.sectionResults} />

      <QuestionReview
        questionResults={examResult.questionResults}
        questionAttempts={questionAttempts}
      />
    </div>
  );
}
