"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseExamTimerProps {
  timeLimitMinutes: number | null;
  onSubmit: () => void;
  attemptId: string;
}

interface UseExamTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  pause: () => void;
  resume: () => void;
  formatTime: (seconds: number) => string;
}

function getStorageKey(attemptId: string) {
  return `exam-timer-${attemptId}`;
}

function loadRemainingTime(attemptId: string, timeLimitMinutes: number): number {
  if (typeof window === "undefined") return timeLimitMinutes * 60;
  
  const stored = localStorage.getItem(getStorageKey(attemptId));
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return Math.min(parsed, timeLimitMinutes * 60);
    }
  }
  return timeLimitMinutes * 60;
}

function saveRemainingTime(attemptId: string, seconds: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(attemptId), String(seconds));
}

export function useExamTimer({ timeLimitMinutes, onSubmit, attemptId }: UseExamTimerProps): UseExamTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    return loadRemainingTime(attemptId, timeLimitMinutes ?? 60);
  });
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;
        saveRemainingTime(attemptId, next);
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          onSubmitRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, attemptId]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return { timeRemaining, isRunning, pause, resume, formatTime };
}
