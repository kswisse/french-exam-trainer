import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardData } from "../services/dashboard";

interface PerformanceCardProps {
  performance: DashboardData["performance"];
}

export function PerformanceCard({ performance }: PerformanceCardProps) {
  const { examsTaken, totalQuestionsAttempted, correctAnswers, overallAccuracy } = performance;

  if (examsTaken === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete exams to see your performance metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Accuracy</span>
            <span className="font-medium">{overallAccuracy}%</span>
          </div>
          <Progress value={overallAccuracy} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{examsTaken}</div>
            <div className="text-xs text-muted-foreground">Exams Taken</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{totalQuestionsAttempted}</div>
            <div className="text-xs text-muted-foreground">
              Questions Attempted
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{correctAnswers}</div>
            <div className="text-xs text-muted-foreground">Correct Answers</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {totalQuestionsAttempted - correctAnswers}
            </div>
            <div className="text-xs text-muted-foreground">
              Incorrect Answers
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
