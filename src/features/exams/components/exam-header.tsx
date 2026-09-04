"use client";

import { Clock, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExamHeaderProps {
  title: string;
  timeRemaining: number;
  isRunning: boolean;
  isSaving: boolean;
  formatTime: (seconds: number) => string;
  onPause: () => void;
  onResume: () => void;
  onSubmit: () => void;
}

export function ExamHeader({
  title,
  timeRemaining,
  isRunning,
  isSaving,
  formatTime,
  onPause,
  onResume,
  onSubmit,
}: ExamHeaderProps) {
  const isLowTime = timeRemaining < 300;
  const isCriticalTime = timeRemaining < 60;

  return (
    <div className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur dark:bg-neutral-950/95">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          {isSaving && (
            <Badge variant="secondary" className="shrink-0">
              Saving...
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-sm",
              isCriticalTime && "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300",
              isLowTime && !isCriticalTime && "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
              !isLowTime && "border-neutral-200 dark:border-neutral-800"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          {isRunning ? (
            <Button variant="ghost" size="icon" onClick={onPause} title="Pause timer">
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={onResume} title="Resume timer">
              <Play className="h-4 w-4" />
            </Button>
          )}

          <Button onClick={onSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
