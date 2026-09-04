"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Answer {
  text: string;
  isAcceptable: boolean;
}

interface FillBlankQuestionProps {
  answers: Answer[];
  value?: string;
  onChange: (value: string) => void;
}

function getBlankCount(answers: Answer[]): number {
  const blankPrefixes = new Set<string>();
  for (const answer of answers) {
    const match = answer.text.match(/^blank_(\d+):/);
    if (match) {
      blankPrefixes.add(match[1]);
    }
  }
  return blankPrefixes.size || 1;
}

function parseBlanks(value?: string, count: number = 1): string[] {
  if (!value) return Array(count).fill("");
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return [...parsed, ...Array(Math.max(0, count - parsed.length)).fill("")].slice(0, count);
    }
  } catch {}
  return Array(count).fill("");
}

export function FillBlankQuestion({ answers, value, onChange }: FillBlankQuestionProps) {
  const blankCount = getBlankCount(answers);
  const blanks = parseBlanks(value, blankCount);

  const updateBlank = (index: number, newValue: string) => {
    const newBlanks = [...blanks];
    newBlanks[index] = newValue;
    onChange(JSON.stringify(newBlanks));
  };

  return (
    <div className="space-y-3">
      {blanks.map((blank, index) => (
        <div key={index} className="flex items-center gap-2">
          <Label className="text-sm font-medium min-w-[60px]">
            Blank {index + 1}:
          </Label>
          <Input
            type="text"
            value={blank}
            onChange={(e) => updateBlank(index, e.target.value)}
            placeholder={`Enter answer for blank ${index + 1}...`}
            className="flex-1"
          />
        </div>
      ))}
    </div>
  );
}
