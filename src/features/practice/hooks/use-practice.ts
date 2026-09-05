"use client";

import { useState, useCallback, useMemo } from "react";
import type { QuestionSnapshot } from "@/types/attempt";
import { gradeAnswer } from "@/services/scoring";
import type { QuestionSnapshot as ScoringSnapshot } from "@/types/scoring";

interface Answer {
  selectedOptionId?: string;
  textAnswer?: string;
}

export interface QuestionFeedback {
  isCorrect: boolean | null;
  userAnswer: Answer;
  correctAnswerLabel: string;
  userAnswerLabel: string;
}

interface UsePracticeStateProps {
  attemptId: string;
  questions: QuestionSnapshot[];
}

interface UsePracticeStateReturn {
  currentQuestionIndex: number;
  answers: Map<string, Answer>;
  feedbackMap: Map<string, QuestionFeedback>;
  isAnswered: boolean;
  setCurrentQuestionIndex: (index: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  updateAnswer: (questionId: string, answer: Answer) => void;
  submitCurrentAnswer: () => void;
  getCurrentQuestion: () => QuestionSnapshot;
  getQuestionAnswer: (questionId: string) => Answer | undefined;
  getQuestionFeedback: (questionId: string) => QuestionFeedback | undefined;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
}

function getCorrectAnswerLabel(snapshot: QuestionSnapshot): string {
  switch (snapshot.type) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE": {
      const correct = snapshot.options.find((o) => o.isCorrect);
      return correct ? `${correct.label}. ${correct.text}` : "N/A";
    }
    case "SHORT_TEXT":
      return snapshot.answers
        .filter((a) => a.isAcceptable)
        .map((a) => a.text)
        .join(" / ");
    case "FILL_BLANK":
      return snapshot.answers
        .filter((a) => a.isAcceptable)
        .map((a) => a.text)
        .join(" / ");
    case "MATCHING": {
      const correct = snapshot.answers.find((a) => a.isAcceptable);
      if (!correct) return "N/A";
      try {
        const pairs = JSON.parse(correct.text) as Record<string, string>;
        return Object.entries(pairs)
          .map(([k, v]) => `${k} → ${v}`)
          .join(", ");
      } catch {
        return correct.text;
      }
    }
    case "WRITING":
      return "Not auto-graded";
  }
}

function getUserAnswerLabel(
  snapshot: QuestionSnapshot,
  selectedOptionId?: string | null,
  textAnswer?: string | null,
): string {
  if (!selectedOptionId && !textAnswer) return "Not answered";

  switch (snapshot.type) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE": {
      if (!selectedOptionId) return "Not answered";
      const selected = snapshot.options.find((o) => o.id === selectedOptionId);
      return selected ? `${selected.label}. ${selected.text}` : selectedOptionId;
    }
    case "SHORT_TEXT":
      return textAnswer || "Not answered";
    case "FILL_BLANK": {
      if (!textAnswer) return "Not answered";
      try {
        const answers = JSON.parse(textAnswer) as string[];
        return answers.join(", ");
      } catch {
        return textAnswer;
      }
    }
    case "MATCHING": {
      if (!textAnswer) return "Not answered";
      try {
        const pairs = JSON.parse(textAnswer) as Record<string, string>;
        return Object.entries(pairs)
          .map(([k, v]) => `${k} → ${v}`)
          .join(", ");
      } catch {
        return textAnswer;
      }
    }
    case "WRITING":
      return textAnswer || "Not answered";
  }
}

function buildFeedback(
  snapshot: QuestionSnapshot,
  answer: Answer,
): QuestionFeedback {
  const result = gradeAnswer(snapshot as unknown as ScoringSnapshot, answer.selectedOptionId, answer.textAnswer);
  return {
    isCorrect: result.isCorrect,
    userAnswer: answer,
    correctAnswerLabel: getCorrectAnswerLabel(snapshot),
    userAnswerLabel: getUserAnswerLabel(snapshot, answer.selectedOptionId, answer.textAnswer),
  };
}

export function usePracticeState({
  attemptId: _attemptId,
  questions,
}: UsePracticeStateProps): UsePracticeStateReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [answeredSet, setAnsweredSet] = useState<Set<string>>(new Set());
  const [feedbackMap, setFeedbackMap] = useState<Map<string, QuestionFeedback>>(new Map());

  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const updateAnswer = useCallback((questionId: string, answer: Answer) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, answer);
      return next;
    });
  }, []);

  const submitCurrentAnswer = useCallback(() => {
    const currentQ = questions[currentQuestionIndex];
    const answer = answers.get(currentQ.id);
    if (!answer) return;

    const fb = buildFeedback(currentQ, answer);
    setFeedbackMap((prev) => new Map(prev).set(currentQ.id, fb));
    setAnsweredSet((prev) => { const next = new Set(prev); next.add(currentQ.id); return next; });
  }, [questions, currentQuestionIndex, answers]);

  const getCurrentQuestion = useCallback(() => {
    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

  const getQuestionAnswer = useCallback(
    (questionId: string) => answers.get(questionId),
    [answers],
  );

  const getQuestionFeedback = useCallback(
    (questionId: string) => feedbackMap.get(questionId),
    [feedbackMap],
  );

  const currentQuestion = getCurrentQuestion();
  const isAnswered = answeredSet.has(currentQuestion.id);

  const answeredCount = answeredSet.size;
  const correctCount = useMemo(() => {
    let count = 0;
    feedbackMap.forEach((fb) => {
      if (fb.isCorrect === true) count++;
    });
    return count;
  }, [feedbackMap]);
  const incorrectCount = useMemo(() => {
    let count = 0;
    feedbackMap.forEach((fb) => {
      if (fb.isCorrect === false) count++;
    });
    return count;
  }, [feedbackMap]);

  return {
    currentQuestionIndex,
    answers,
    feedbackMap,
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
    totalQuestions: questions.length,
  };
}
