"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExamWithSections } from "../types";

interface ExamCardProps {
  exam: ExamWithSections;
}

export function ExamCard({ exam }: ExamCardProps) {
  const questionCount = exam.sections.reduce((acc: number, s) => acc + s.questions.length, 0);
  const totalPoints = exam.sections.reduce(
    (acc: number, s) => acc + s.questions.reduce((qa: number, q) => qa + q.points, 0),
    0
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{exam.title}</CardTitle>
          <Badge variant="secondary">{exam.type ?? "Exam"}</Badge>
        </div>
        {exam.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {exam.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>{questionCount} questions</span>
          <span>{exam.sections.length} sections</span>
          {totalPoints > 0 && <span>{totalPoints} points</span>}
          {exam.timeLimitMinutes && <span>{exam.timeLimitMinutes} min</span>}
          {exam.year && <span>{exam.year}</span>}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild className="flex-1">
          <Link href={`/exams/${exam.id}`}>Take Exam</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/exams/${exam.id}?mode=practice`}>Practice</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
