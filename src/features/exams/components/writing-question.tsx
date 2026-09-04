"use client";

import { Textarea } from "@/components/ui/textarea";

interface WritingQuestionProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function WritingQuestion({ value, onChange, placeholder }: WritingQuestionProps) {
  return (
    <div className="space-y-2">
      <Textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Write your response here..."}
        className="min-h-[200px] w-full"
      />
      <p className="text-xs text-muted-foreground">
        This question will be manually graded.
      </p>
    </div>
  );
}
