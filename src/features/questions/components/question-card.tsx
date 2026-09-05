"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { QuestionType } from "@/generated/prisma/browser";

interface QuestionCardProps {
  question: {
    id: string;
    number: number;
    type: QuestionType;
    text: string;
    difficulty: string | null;
    section: {
      exam: {
        title: string;
      };
      title: string;
    };
    skills: {
      skill: {
        name: string;
      };
    }[];
  };
}

const typeLabels: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "MC",
  TRUE_FALSE: "TF",
  SHORT_TEXT: "ST",
  FILL_BLANK: "FB",
  MATCHING: "MA",
  WRITING: "WR",
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export function QuestionCard({ question }: QuestionCardProps) {
  const truncatedText =
    question.text.length > 120
      ? question.text.substring(0, 120) + "..."
      : question.text;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">
              Q{question.number}
            </span>
            <Badge variant="secondary" className="text-xs">
              {typeLabels[question.type]}
            </Badge>
            {question.difficulty && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[question.difficulty] || "bg-gray-100 text-gray-800"}`}
              >
                {question.difficulty}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-foreground mb-3 line-clamp-2">
          {truncatedText}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>{question.section.exam.title}</span>
            <span>·</span>
            <span>{question.section.title}</span>
          </div>
          {question.skills.length > 0 && (
            <div className="flex gap-1">
              {question.skills.slice(0, 2).map((qs) => (
                <Badge key={qs.skill.name} variant="outline" className="text-xs">
                  {qs.skill.name}
                </Badge>
              ))}
              {question.skills.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{question.skills.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
