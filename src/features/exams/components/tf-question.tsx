"use client";

import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
  text: string;
}

interface TfQuestionProps {
  options: Option[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

export function TfQuestion({ options, selectedOptionId, onSelect }: TfQuestionProps) {
  return (
    <div className="flex gap-4">
      {options.map((option) => (
        <label
          key={option.id}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-md border p-4 cursor-pointer transition-colors",
            selectedOptionId === option.id
              ? "border-neutral-900 bg-neutral-50 dark:border-neutral-50 dark:bg-neutral-900"
              : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          )}
        >
          <input
            type="radio"
            name="tf-option"
            value={option.id}
            checked={selectedOptionId === option.id}
            onChange={() => onSelect(option.id)}
            className="shrink-0"
          />
          <span className="text-sm font-medium">{option.text}</span>
        </label>
      ))}
    </div>
  );
}
