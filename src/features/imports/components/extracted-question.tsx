"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtractedQuestion } from "../types";

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "MC",
  TRUE_FALSE: "TF",
  SHORT_TEXT: "Text",
  FILL_BLANK: "Fill",
  MATCHING: "Match",
  WRITING: "Write",
};

export function ExtractedQuestion({
  question,
  sectionIndex,
  onEdit,
  onDelete,
  isLowConfidence,
}: {
  question: ExtractedQuestion;
  sectionIndex: number;
  onEdit: () => void;
  onDelete: () => void;
  isLowConfidence?: boolean;
}) {
  return (
    <Card
      className={cn(
        "transition-colors",
        isLowConfidence && "border-amber-300 bg-amber-50/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                Q{question.number}
              </span>
              <Badge variant="outline" className="text-xs">
                {TYPE_LABELS[question.type] || question.type}
              </Badge>
              {question.points && (
                <span className="text-xs text-muted-foreground">
                  {question.points}pt{question.points !== 1 ? "s" : ""}
                </span>
              )}
              {isLowConfidence && (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-300 text-amber-700 bg-amber-50"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Low Confidence
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed">{question.text}</p>

            {question.options && question.options.length > 0 && (
              <div className="mt-2 space-y-1">
                {question.options.map((opt) => (
                  <div key={opt.label} className="flex gap-2 text-sm">
                    <span className="font-medium text-muted-foreground">
                      {opt.label}.
                    </span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>
            )}

            {question.correctAnswer && (
              <div className="mt-2 text-sm">
                <span className="font-medium text-muted-foreground">
                  Answer:{" "}
                </span>
                <span className="text-green-700">
                  {Array.isArray(question.correctAnswer)
                    ? question.correctAnswer.join(", ")
                    : question.correctAnswer}
                </span>
              </div>
            )}

            {question.difficulty && (
              <div className="mt-1">
                <Badge variant="secondary" className="text-xs">
                  {question.difficulty}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
