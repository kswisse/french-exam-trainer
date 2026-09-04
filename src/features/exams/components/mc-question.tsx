"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
  text: string;
}

interface McQuestionProps {
  options: Option[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

export function McQuestion({ options, selectedOptionId, onSelect }: McQuestionProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.id}
          className={cn(
            "flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors",
            selectedOptionId === option.id
              ? "border-neutral-900 bg-neutral-50 dark:border-neutral-50 dark:bg-neutral-900"
              : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          )}
        >
          <input
            type="radio"
            name="mc-option"
            value={option.id}
            checked={selectedOptionId === option.id}
            onChange={() => onSelect(option.id)}
            className="mt-0.5 shrink-0"
          />
          <div className="flex-1">
            <span className="font-medium text-sm">{option.label}.</span>{" "}
            <span className="text-sm">{option.text}</span>
          </div>
        </label>
      ))}
    </div>
  );
}
