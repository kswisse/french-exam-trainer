"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExtractedQuestion, QuestionType } from "../types";

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True/False" },
  { value: "SHORT_TEXT", label: "Short Text" },
  { value: "FILL_BLANK", label: "Fill in Blank" },
  { value: "MATCHING", label: "Matching" },
  { value: "WRITING", label: "Writing" },
];

export function EditQuestionDialog({
  question,
  open,
  onOpenChange,
  onSave,
}: {
  question: ExtractedQuestion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: ExtractedQuestion) => void;
}) {
  const [text, setText] = useState(question.text);
  const [type, setType] = useState<QuestionType>(question.type);
  const [points, setPoints] = useState(question.points?.toString() || "1");
  const [difficulty, setDifficulty] = useState(question.difficulty || "");
  const [correctAnswer, setCorrectAnswer] = useState(
    Array.isArray(question.correctAnswer)
      ? question.correctAnswer.join(", ")
      : question.correctAnswer || ""
  );
  const [options, setOptions] = useState<
    Array<{ label: string; text: string }>
  >(question.options || []);

  const handleSave = () => {
    const updated: ExtractedQuestion = {
      ...question,
      text,
      type,
      points: parseInt(points) || 1,
      difficulty: difficulty || undefined,
      correctAnswer: correctAnswer || undefined,
      options: options.length > 0 ? options : undefined,
    };
    onSave(updated);
    onOpenChange(false);
  };

  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length);
    setOptions([...options, { label: nextLabel, text: "" }]);
  };

  const updateOption = (
    index: number,
    field: "label" | "text",
    value: string
  ) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question {question.number}</DialogTitle>
          <DialogDescription>
            Modify the extracted question data before approving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text</Label>
            <Textarea
              id="question-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Input
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                placeholder="e.g. B2"
              />
            </div>
          </div>

          {(type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={opt.label}
                      onChange={(e) => updateOption(i, "label", e.target.value)}
                      className="w-16"
                      placeholder="A"
                    />
                    <Input
                      value={opt.text}
                      onChange={(e) => updateOption(i, "text", e.target.value)}
                      className="flex-1"
                      placeholder="Option text"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(i)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="correct-answer">Correct Answer</Label>
            <Input
              id="correct-answer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder={
                type === "MULTIPLE_CHOICE"
                  ? "e.g. A"
                  : type === "TRUE_FALSE"
                    ? "True or False"
                    : "Answer text"
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
