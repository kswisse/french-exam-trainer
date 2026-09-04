"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answeredQuestions: Set<string>;
  markedQuestions: Set<string>;
  questionIds: string[];
  onSelect: (index: number) => void;
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answeredQuestions,
  markedQuestions,
  questionIds,
  onSelect,
}: QuestionNavigatorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Questions</h3>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const questionId = questionIds[i];
          const isAnswered = answeredQuestions.has(questionId);
          const isMarked = markedQuestions.has(questionId);
          const isCurrent = i === currentIndex;

          return (
            <Button
              key={i}
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 text-xs",
                isCurrent && "ring-2 ring-neutral-900 dark:ring-neutral-50",
                isMarked && "bg-amber-100 border-amber-300 hover:bg-amber-200 dark:bg-amber-900 dark:border-amber-700",
                !isMarked && isAnswered && "bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900 dark:border-green-700",
                !isMarked && !isAnswered && "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              )}
              onClick={() => onSelect(i)}
            >
              {i + 1}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-green-200 border border-green-300 dark:bg-green-800 dark:border-green-700" />
          Answered
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-amber-200 border border-amber-300 dark:bg-amber-800 dark:border-amber-700" />
          Marked
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-neutral-200 border border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" />
          Unanswered
        </div>
      </div>
    </div>
  );
}
