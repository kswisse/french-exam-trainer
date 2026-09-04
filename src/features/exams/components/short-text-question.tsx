"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShortTextQuestionProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ShortTextQuestion({ value, onChange, placeholder }: ShortTextQuestionProps) {
  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Enter your answer..."}
        className="w-full"
      />
    </div>
  );
}
