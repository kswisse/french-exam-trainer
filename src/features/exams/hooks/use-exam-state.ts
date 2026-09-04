"use client";

import { useState, useCallback } from "react";
import type { QuestionSnapshot } from "@/types/attempt";
import { loadFromLocalStorage } from "./use-autosave";

interface Answer {
  selectedOptionId?: string;
  textAnswer?: string;
}

interface UseExamStateProps {
  attemptId: string;
  questions: QuestionSnapshot[];
}

interface UseExamStateReturn {
  currentQuestionIndex: number;
  answers: Map<string, Answer>;
  markedForReview: Set<string>;
  setCurrentQuestionIndex: (index: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  updateAnswer: (questionId: string, answer: Answer) => void;
  toggleMarkForReview: (questionId: string) => void;
  getCurrentQuestion: () => QuestionSnapshot;
  getQuestionAnswer: (questionId: string) => Answer | undefined;
  isQuestionAnswered: (questionId: string) => boolean;
  isQuestionMarked: (questionId: string) => boolean;
  answeredCount: number;
  totalQuestions: number;
}

export function useExamState({ attemptId, questions }: UseExamStateProps): UseExamStateReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(() => {
    return loadFromLocalStorage(attemptId) ?? new Map();
  });
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

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

  const toggleMarkForReview = useCallback((questionId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  const getCurrentQuestion = useCallback(() => {
    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

  const getQuestionAnswer = useCallback((questionId: string) => {
    return answers.get(questionId);
  }, [answers]);

  const isQuestionAnswered = useCallback((questionId: string) => {
    const answer = answers.get(questionId);
    if (!answer) return false;
    if (answer.selectedOptionId) return true;
    if (answer.textAnswer && answer.textAnswer.trim().length > 0) return true;
    return false;
  }, [answers]);

  const isQuestionMarked = useCallback((questionId: string) => {
    return markedForReview.has(questionId);
  }, [markedForReview]);

  const answeredCount = Array.from(answers.entries()).filter(([, answer]) => {
    if (answer.selectedOptionId) return true;
    if (answer.textAnswer && answer.textAnswer.trim().length > 0) return true;
    return false;
  }).length;

  return {
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
    totalQuestions: questions.length,
  };
}
