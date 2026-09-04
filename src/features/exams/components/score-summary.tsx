import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExamResult } from "@/types/scoring";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface ScoreSummaryProps {
  result: ExamResult;
}

export function ScoreSummary({ result }: ScoreSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {result.totalScore} / {result.totalPossible}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.percentage.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {result.accuracy.toFixed(0)}%
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.correctCount} correct / {result.correctCount + result.incorrectCount} answered
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {formatTime(result.timeSpentSeconds)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.unansweredCount} unanswered
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
