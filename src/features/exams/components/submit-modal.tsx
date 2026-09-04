"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answeredCount: number;
  unansweredCount: number;
  markedCount: number;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
}

export function SubmitModal({
  open,
  onOpenChange,
  answeredCount,
  unansweredCount,
  markedCount,
  onConfirmSubmit,
  isSubmitting,
}: SubmitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Exam</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit your exam? You won&apos;t be able to change your answers after submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Answered questions:</span>
            <span className="font-medium">{answeredCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Unanswered questions:</span>
            <span className="font-medium text-amber-600">{unansweredCount}</span>
          </div>
          {markedCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Marked for review:</span>
              <span className="font-medium text-amber-600">{markedCount}</span>
            </div>
          )}
        </div>

        {unansweredCount > 0 && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            You have {unansweredCount} unanswered question{unansweredCount > 1 ? "s" : ""}. 
            These will be marked as incorrect.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onConfirmSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Confirm Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
