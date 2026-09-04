"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionReviewDetail } from "./question-review-detail";
import { getQuestionReview, type ExamResultDataAttempt } from "../services/results-types";
import type { QuestionResult } from "@/types/scoring";
import type { QuestionSnapshot } from "@/types/attempt";

interface QuestionReviewProps {
  questionResults: QuestionResult[];
  questionAttempts: ExamResultDataAttempt["questionAttempts"];
}

export function QuestionReview({
  questionResults,
  questionAttempts,
}: QuestionReviewProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );

  const reviewDetail = selectedQuestionId
    ? getQuestionReview(questionAttempts, selectedQuestionId)
    : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {questionResults
              .sort((a, b) => a.questionNumber - b.questionNumber)
              .map((qr) => {
                const snapshot = questionAttempts.find(
                  (qa) => qa.questionId === qr.questionId,
                )?.questionSnapshot as QuestionSnapshot | undefined;

                const isWriting = snapshot?.type === "WRITING";
                const isSelected = selectedQuestionId === qr.questionId;

                return (
                  <Button
                    key={qr.questionId}
                    variant={isSelected ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 text-left"
                    onClick={() =>
                      setSelectedQuestionId(
                        isSelected ? null : qr.questionId,
                      )
                    }
                  >
                    <span className="w-12 font-mono text-sm text-muted-foreground">
                      Q{qr.questionNumber}
                    </span>
                    <span className="flex-1">
                      {isWriting ? (
                        <Badge variant="secondary" className="mr-2">
                          Not graded
                        </Badge>
                      ) : qr.isCorrect === true ? (
                        <Badge variant="default" className="mr-2 bg-green-600 hover:bg-green-600">
                          ✓
                        </Badge>
                      ) : qr.isCorrect === false ? (
                        <Badge variant="destructive" className="mr-2">
                          ✗
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mr-2">
                          —
                        </Badge>
                      )}
                      <span className="text-sm">
                        {qr.isCorrect === true
                          ? "Correct"
                          : qr.isCorrect === false
                            ? `Incorrect — ${qr.pointsAwarded} pt`
                            : isWriting
                              ? "Not graded"
                              : "Unanswered"}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isSelected ? "Hide" : "Show"}
                    </span>
                  </Button>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {reviewDetail && (
        <QuestionReviewDetail
          snapshot={reviewDetail.snapshot}
          questionAttempt={reviewDetail.questionAttempt}
        />
      )}
    </div>
  );
}
