"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, BarChart3 } from "lucide-react";
import type { QuestionSnapshot } from "@/types/attempt";
import { useAutosave } from "@/features/exams/hooks/use-autosave";
import { QuestionDisplay } from "@/features/exams/components/question-display";
import { QuestionNavigator } from "@/features/exams/components/question-navigator";
import { usePracticeState } from "../hooks/use-practice";
import { PracticeFeedback } from "./practice-feedback";
import { AiExplanation } from "./ai-explanation";

interface Passage {
  id: string;
  title?: string | null;
  content: string;
  type: string;
  sourcePage?: number | null;
}

interface PracticeTakerProps {
  attemptId: string;
  examTitle: string;
  questions: QuestionSnapshot[];
  passages: Passage[];
}

export function PracticeTaker({
  attemptId,
  examTitle,
  questions,
  passages,
}: PracticeTakerProps) {
  const router = useRouter();

  const {
    currentQuestionIndex,
    answers,
    isAnswered,
    setCurrentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,
    updateAnswer,
    submitCurrentAnswer,
    getCurrentQuestion,
    getQuestionAnswer,
    getQuestionFeedback,
    answeredCount,
    correctCount,
    incorrectCount,
    totalQuestions,
  } = usePracticeState({ attemptId, questions });

  const { isSaving } = useAutosave({ attemptId, answers });

  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);
  const answeredQuestions = useMemo(() => {
    const set = new Set<string>();
    answers.forEach((answer, questionId) => {
      if (answer.selectedOptionId || (answer.textAnswer && answer.textAnswer.trim().length > 0)) {
        set.add(questionId);
      }
    });
    return set;
  }, [answers]);

  const currentQuestion = getCurrentQuestion();
  const currentPassage = useMemo(() => {
    if (!currentQuestion.passageId) return null;
    return passages.find((p) => p.id === currentQuestion.passageId) ?? null;
  }, [currentQuestion, passages]);

  const feedback = getQuestionFeedback(currentQuestion.id);
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isAllAnswered = answeredCount === totalQuestions;

  if (isAllAnswered && feedback) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur dark:bg-neutral-950/95">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">{examTitle}</h1>
              {isSaving && (
                <Badge variant="secondary" className="shrink-0">
                  Saving...
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Practice Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">{correctCount} correct</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">{incorrectCount} incorrect</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                You scored {correctCount} out of {totalQuestions} (
                {Math.round((correctCount / totalQuestions) * 100)}%)
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => router.push("/practice")}>
                  New Practice Session
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur dark:bg-neutral-950/95">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{examTitle}</h1>
            {isSaving && (
              <Badge variant="secondary" className="shrink-0">
                Saving...
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>{answeredCount}/{totalQuestions}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 min-w-0">
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
              passage={currentPassage}
              answer={getQuestionAnswer(currentQuestion.id)}
              isMarkedForReview={false}
              onAnswerChange={(answer) => updateAnswer(currentQuestion.id, answer)}
              onToggleMark={() => {}}
            />

            {!isAnswered && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <Button onClick={submitCurrentAnswer}>
                  Submit Answer
                </Button>
              </div>
            )}

            {isAnswered && feedback && (
              <>
                <PracticeFeedback snapshot={currentQuestion} feedback={feedback} />

                {feedback.isCorrect === false && (
                  <div className="mt-4">
                    <AiExplanation
                      question={currentQuestion}
                      userAnswer={feedback.userAnswer}
                      isCorrect={feedback.isCorrect}
                    />
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  {!isLastQuestion ? (
                    <Button onClick={goToNextQuestion}>
                      Next →
                    </Button>
                  ) : (
                    <Button onClick={submitCurrentAnswer} variant="default">
                      Finish Practice
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="lg:w-64 shrink-0">
            <div className="sticky top-20">
              <QuestionNavigator
                totalQuestions={totalQuestions}
                currentIndex={currentQuestionIndex}
                answeredQuestions={answeredQuestions}
                markedQuestions={new Set()}
                questionIds={questionIds}
                onSelect={setCurrentQuestionIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
