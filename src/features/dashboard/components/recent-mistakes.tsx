import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardData } from "../services/dashboard";

interface RecentMistakesProps {
  recentMistakes: DashboardData["recentMistakes"];
}

export function RecentMistakes({ recentMistakes }: RecentMistakesProps) {
  if (recentMistakes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Mistakes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No mistakes recorded yet. Keep practicing!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Mistakes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentMistakes.map((mistake) => (
          <div
            key={mistake.id}
            className="flex items-start justify-between gap-2 rounded-lg border p-3"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="shrink-0">
                  {mistake.category.replace(/_/g, " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {mistake.attempt.question.text}
              </p>
              <p className="text-xs text-muted-foreground">
                From: {mistake.attempt.attempt.exam.title}
              </p>
            </div>
          </div>
        ))}
        <Button asChild variant="outline" className="w-full">
          <Link href="/mistakes">View All Mistakes</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
