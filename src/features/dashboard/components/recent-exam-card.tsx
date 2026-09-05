import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardData } from "../services/dashboard";

interface RecentExamCardProps {
  recentAttempt: DashboardData["recentAttempt"];
}

export function RecentExamCard({ recentAttempt }: RecentExamCardProps) {
  if (!recentAttempt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t completed any exams yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/exams">Take Your First Exam</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalPoints = recentAttempt.questions.reduce(
    (sum, qa) => sum + qa.pointsAwarded,
    0
  );
  const maxPoints = recentAttempt.questions.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Exam</CardTitle>
          <Badge variant="secondary">
            {recentAttempt.status === "TIME_UP" ? "Time Up" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="font-medium">{recentAttempt.exam.title}</h3>
          <div className="text-sm text-muted-foreground">
            Score: {totalPoints} / {maxPoints} points
          </div>
          {recentAttempt.submittedAt && (
            <div className="text-sm text-muted-foreground">
              Completed:{" "}
              {new Date(recentAttempt.submittedAt).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/results/${recentAttempt.id}`}>View Results</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
