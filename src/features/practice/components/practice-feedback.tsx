"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import type { QuestionSnapshot } from "@/types/attempt";
import type { QuestionFeedback } from "../hooks/use-practice";

interface PracticeFeedbackProps {
  snapshot: QuestionSnapshot;
  feedback: QuestionFeedback;
}

export function PracticeFeedback({ snapshot, feedback }: PracticeFeedbackProps) {
  const isWriting = snapshot.type === "WRITING";

  return (
    <Card className="mt-4">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2">
          {feedback.isCorrect === true ? (
            <>
              <Badge variant="default" className="bg-green-600 hover:bg-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Correct
              </Badge>
            </>
          ) : feedback.isCorrect === false ? (
            <>
              <Badge variant="destructive" className="flex items-center gap-1">
                <X className="h-3 w-3" />
                Incorrect
              </Badge>
            </>
          ) : (
            <Badge variant="secondary">Not auto-graded</Badge>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Your answer</p>
            <p className="mt-1 text-foreground">{feedback.userAnswerLabel}</p>
          </div>

          {!isWriting && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Correct answer</p>
              <p className="mt-1 text-foreground">{feedback.correctAnswerLabel}</p>
            </div>
          )}
        </div>

        {(snapshot.type === "MULTIPLE_CHOICE" || snapshot.type === "TRUE_FALSE") && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Options</p>
            {snapshot.options.map((option) => {
              const isSelected = option.id === feedback.userAnswer.selectedOptionId;
              const isCorrectOption = option.isCorrect;
              return (
                <div
                  key={option.id}
                  className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                    isCorrectOption
                      ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
                      : isSelected && !isCorrectOption
                        ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
                        : ""
                  }`}
                >
                  <span className="font-medium">{option.label}.</span>
                  <span className="flex-1">{option.text}</span>
                  {isCorrectOption && (
                    <Badge variant="default" className="text-xs">Correct</Badge>
                  )}
                  {isSelected && !isCorrectOption && (
                    <Badge variant="destructive" className="text-xs">Your answer</Badge>
                  )}
                  {isSelected && isCorrectOption && (
                    <Badge variant="default" className="text-xs">Your answer</Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
