"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Answer {
  text: string;
  isAcceptable: boolean;
}

interface MatchingQuestionProps {
  answers: Answer[];
  value?: string;
  onChange: (value: string) => void;
}

function parseMatchingPairs(answers: Answer[]): { left: string[]; right: string[] } {
  const correctAnswer = answers.find((a) => a.isAcceptable);
  if (!correctAnswer) {
    return { left: [], right: [] };
  }
  try {
    const pairs = JSON.parse(correctAnswer.text);
    const left = Object.keys(pairs);
    const right = Object.values(pairs) as string[];
    return { left, right };
  } catch {
    return { left: [], right: [] };
  }
}

function parseUserPairs(value?: string): Record<string, string> {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export function MatchingQuestion({ answers, value, onChange }: MatchingQuestionProps) {
  const { left, right } = parseMatchingPairs(answers);
  const userPairs = parseUserPairs(value);

  const handleSelect = (leftItem: string, rightItem: string) => {
    const newPairs = { ...userPairs };
    if (rightItem === "__clear__") {
      delete newPairs[leftItem];
    } else {
      newPairs[leftItem] = rightItem;
    }
    onChange(JSON.stringify(newPairs));
  };

  return (
    <div className="space-y-3">
      {left.map((leftItem) => (
        <div key={leftItem} className="flex items-center gap-4">
          <Label className="text-sm font-medium min-w-[100px] truncate">
            {leftItem}
          </Label>
          <span className="text-muted-foreground">→</span>
          <Select
            value={userPairs[leftItem] ?? ""}
            onValueChange={(val) => handleSelect(leftItem, val)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select match..." />
            </SelectTrigger>
            <SelectContent>
              {right.map((rightItem) => (
                <SelectItem key={rightItem} value={rightItem}>
                  {rightItem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
