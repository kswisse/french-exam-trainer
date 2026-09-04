"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { QuestionSnapshot } from "@/types/attempt";
import { useExamTimer } from "../hooks/use-exam-timer";
import { useAutosave } from "../hooks/use-autosave";
import { useExamState } from "../hooks/use-exam-state";
import { ExamHeader } from "./exam-header";
import { QuestionDisplay } from "./question-display";
import { QuestionNavigator } from "./question-navigator";
import { SubmitModal } from "./submit-modal";
import { ExamComplete } from "./exam-complete";

interface Passage {
  id: string;
  title?: string | null;
  content: string;
  type: string;
  sourcePage?: number | null;
}

interface ExamTakerProps {
  attemptId: string;
  examId: string;
  examTitle: string;
  timeLimitMinutes: number | null;
  questions: QuestionSnapshot[];
  passages: Passage[];
}

export function ExamTaker({
  attemptId,
  examId,
  examTitle,
  timeLimitMinutes,
  questions,
  passages,
}: ExamTakerProps) {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to submit exam");
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Failed to submit exam. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  }, [attemptId, isSubmitting]);

  const {
    currentQuestionIndex,
    answers,
    markedForReview,
    setCurrentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,
    updateAnswer,
    toggleMarkForReview,
    getCurrentQuestion,
    getQuestionAnswer,
    isQuestionAnswered,
    isQuestionMarked,
    answeredCount,
    totalQuestions,
  } = useExamState({ attemptId, questions });

  const { timeRemaining, isRunning, pause, resume, formatTime } = useExamTimer({
    timeLimitMinutes: timeLimitMinutes ?? 60,
    onSubmit: handleSubmit,
    attemptId,
  });

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

  const unansweredCount = totalQuestions - answeredCount;
  const markedCount = markedForReview.size;

  if (isSubmitted) {
    return <ExamComplete attemptId={attemptId} />;
  }

  return (
    <div className="min-h-screen">
      <ExamHeader
        title={examTitle}
        timeRemaining={timeRemaining}
        isRunning={isRunning}
        isSaving={isSaving}
        formatTime={formatTime}
        onPause={pause}
        onResume={resume}
        onSubmit={() => setShowSubmitModal(true)}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 min-w-0">
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
              passage={currentPassage}
              answer={getQuestionAnswer(currentQuestion.id)}
              isMarkedForReview={isQuestionMarked(currentQuestion.id)}
              onAnswerChange={(answer) => updateAnswer(currentQuestion.id, answer)}
              onToggleMark={() => toggleMarkForReview(currentQuestion.id)}
            />

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="lg:w-64 shrink-0">
            <div className="sticky top-20">
              <QuestionNavigator
                totalQuestions={totalQuestions}
                currentIndex={currentQuestionIndex}
                answeredQuestions={answeredQuestions}
                markedQuestions={markedForReview}
                questionIds={questionIds}
                onSelect={setCurrentQuestionIndex}
              />
            </div>
          </div>
        </div>
      </div>

      <SubmitModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        markedCount={markedCount}
        onConfirmSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
