"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, AlertCircle } from "lucide-react";
import type { QuestionSnapshot } from "@/types/attempt";

interface AiExplanationProps {
  question: QuestionSnapshot;
  userAnswer: { selectedOptionId?: string; textAnswer?: string };
  isCorrect: boolean | null;
}

interface Explanation {
  whyCorrect: string;
  whyWrong: string;
  frenchContext: string;
  takeaway: string;
}

export function AiExplanation({
  question,
  userAnswer,
  isCorrect,
}: AiExplanationProps) {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExplain() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          questionText: question.text,
          questionType: question.type,
          options: question.options,
          correctAnswers: question.answers,
          userAnswer: userAnswer.selectedOptionId || userAnswer.textAnswer,
          isCorrect,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get explanation");
      }
      const data = await response.json();
      setExplanation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load explanation");
    } finally {
      setIsLoading(false);
    }
  }

  if (!explanation && !isLoading && !error) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            AI Explanation
          </CardTitle>
          {!explanation && !isLoading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExplain}
              className="text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Explain this question
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExplain}
              className="ml-auto text-red-700"
            >
              Retry
            </Button>
          </div>
        )}

        {explanation && (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-foreground mb-1">Why the correct answer works</h4>
              <p className="text-muted-foreground">{explanation.whyCorrect}</p>
            </div>

            {explanation.whyWrong && (
              <div>
                <h4 className="font-medium text-foreground mb-1">Why your answer was incorrect</h4>
                <p className="text-muted-foreground">{explanation.whyWrong}</p>
              </div>
            )}

            {explanation.frenchContext && (
              <div>
                <h4 className="font-medium text-foreground mb-1">French context</h4>
                <p className="text-muted-foreground">{explanation.frenchContext}</p>
              </div>
            )}

            {explanation.takeaway && (
              <div>
                <h4 className="font-medium text-foreground mb-1">Key takeaway</h4>
                <p className="text-muted-foreground">{explanation.takeaway}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
