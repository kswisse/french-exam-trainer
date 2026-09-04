"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ExamWithDetails } from "../types";

interface ExamDetailProps {
  exam: ExamWithDetails;
}

export function ExamDetail({ exam }: ExamDetailProps) {
  const totalPoints = exam.sections.reduce(
    (acc: number, s) => acc + s.questions.reduce((qa: number, q) => qa + q.points, 0),
    0
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{exam.title}</h1>
            {exam.description && (
              <p className="mt-2 text-muted-foreground">{exam.description}</p>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">
            {exam.type ?? "Exam"}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {exam.year && <span>Year: {exam.year}</span>}
          {exam.timeLimitMinutes && <span>Time: {exam.timeLimitMinutes} min</span>}
          <span>Total: {totalPoints} points</span>
          <span>Sections: {exam.sections.length}</span>
        </div>

        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href={`/exams/${exam.id}/take`}>Take Exam</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/exams/${exam.id}/take?mode=practice`}>Practice Mode</Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Sections</h2>
        {exam.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              {section.instructions && (
                <p className="text-sm text-muted-foreground">{section.instructions}</p>
              )}
            </CardHeader>
            <CardContent>
              {section.passages.length > 0 && (
                <div className="mb-4 space-y-2">
                  {section.passages.map((passage) => (
                    <div key={passage.id} className="rounded-md bg-muted p-3 text-sm">
                      {passage.title && (
                        <span className="font-medium">{passage.title}</span>
                      )}
                      <p className="mt-1 line-clamp-3 text-muted-foreground">
                        {passage.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {section.questions.map((question) => (
                  <div
                    key={question.id}
                    className="rounded-md border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">
                        {question.number}. {question.text}
                      </p>
                      <Badge variant="outline" className="shrink-0">
                        {question.points} pts
                      </Badge>
                    </div>
                    {question.options.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <span className="font-medium">{option.label}.</span>
                            <span>{option.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {question.skills.map((qs) => (
                          <Badge key={qs.id} variant="secondary" className="text-xs">
                            {qs.skill.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
