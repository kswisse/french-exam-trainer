import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardData } from "../services/dashboard";

interface AvailableExamsProps {
  availableExams: DashboardData["availableExams"];
}

export function AvailableExams({ availableExams }: AvailableExamsProps) {
  if (availableExams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Exams</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No exams available yet. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Exams</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {availableExams.map((exam) => {
          const questionCount = exam.sections.reduce(
            (sum, s) => sum + s.questions.length,
            0
          );
          const hasAttempt = exam.attempts.length > 0;

          return (
            <div
              key={exam.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{exam.title}</h3>
                  {hasAttempt && (
                    <Badge variant="secondary">Attempted</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {questionCount} questions
                  {exam.timeLimitMinutes &&
                    ` · ${exam.timeLimitMinutes} min`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {exam.mode !== "PRACTICE" && (
                  <Button asChild size="sm">
                    <Link href={`/exam/${exam.id}/take`}>Take Exam</Link>
                  </Button>
                )}
                {exam.mode !== "REAL_EXAM" && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/exam/${exam.id}/take?mode=PRACTICE`}>
                      Practice
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
