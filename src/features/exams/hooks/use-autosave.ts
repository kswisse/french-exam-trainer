"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Answer {
  selectedOptionId?: string;
  textAnswer?: string;
}

interface UseAutosaveProps {
  attemptId: string;
  answers: Map<string, Answer>;
}

interface UseAutosaveReturn {
  isSaving: boolean;
  lastSavedAt: Date | null;
}

const AUTOSAVE_INTERVAL = 10000;

function getStorageKey(attemptId: string) {
  return `exam-answers-${attemptId}`;
}

function saveToLocalStorage(attemptId: string, answers: Map<string, Answer>) {
  if (typeof window === "undefined") return;
  const data = Object.fromEntries(answers);
  localStorage.setItem(getStorageKey(attemptId), JSON.stringify(data));
}

function loadFromLocalStorage(attemptId: string): Map<string, Answer> | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(getStorageKey(attemptId));
  if (!stored) return null;
  try {
    const data = JSON.parse(stored);
    return new Map(Object.entries(data));
  } catch {
    return null;
  }
}

export function useAutosave({ attemptId, answers }: UseAutosaveProps): UseAutosaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const answersRef = useRef(answers);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChanges = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const saveToServer = useCallback(async (answersToSave: Map<string, Answer>) => {
    setIsSaving(true);
    try {
      const entries = Array.from(answersToSave.entries());
      const savePromises = entries.map(async ([questionId, answer]) => {
        const response = await fetch(`/api/attempts/${attemptId}/answers`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId,
            selectedOptionId: answer.selectedOptionId,
            textAnswer: answer.textAnswer,
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to save answer for question ${questionId}`);
        }
      });
      await Promise.all(savePromises);
      setLastSavedAt(new Date());
      pendingChanges.current = false;
    } catch (error) {
      console.error("Autosave failed:", error);
      pendingChanges.current = true;
    } finally {
      setIsSaving(false);
    }
  }, [attemptId]);

  useEffect(() => {
    saveToLocalStorage(attemptId, answers);
    pendingChanges.current = true;
  }, [answers, attemptId]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (pendingChanges.current) {
        saveToServer(answersRef.current);
      }
    }, AUTOSAVE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [saveToServer]);

  useEffect(() => {
    const handleOnline = () => {
      if (pendingChanges.current) {
        saveToServer(answersRef.current);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [saveToServer]);

  return { isSaving, lastSavedAt };
}

export { loadFromLocalStorage };
