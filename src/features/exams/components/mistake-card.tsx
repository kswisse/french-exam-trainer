"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { MistakeCategory, QuestionType } from "@/generated/prisma/browser";

interface MistakeCardProps {
  mistake: {
    id: string;
    category: MistakeCategory;
    explanation: string | null;
    createdAt: Date;
    attempt: {
      question: {
        number: number;
        type: QuestionType;
        text: string;
        skills: {
          skill: {
            name: string;
          };
        }[];
      };
      attempt: {
        exam: {
          title: string;
        };
      };
    };
  };
  onCategoryChange?: (mistakeId: string, category: string) => void;
}

const categoryLabels: Record<MistakeCategory, string> = {
  CARELESS_MISTAKE: "Careless",
  KNOWLEDGE_GAP: "Knowledge Gap",
  VOCABULARY_GAP: "Vocabulary",
  GRAMMAR_GAP: "Grammar",
  READING_COMPREHENSION: "Reading",
  INFERENCE_ERROR: "Inference",
  QUESTION_MISUNDERSTANDING: "Misunderstood",
  TIME_PRESSURE: "Time Pressure",
  UNKNOWN: "Unknown",
};

const categoryColors: Record<MistakeCategory, string> = {
  CARELESS_MISTAKE: "bg-orange-100 text-orange-800",
  KNOWLEDGE_GAP: "bg-red-100 text-red-800",
  VOCABULARY_GAP: "bg-purple-100 text-purple-800",
  GRAMMAR_GAP: "bg-blue-100 text-blue-800",
  READING_COMPREHENSION: "bg-yellow-100 text-yellow-800",
  INFERENCE_ERROR: "bg-pink-100 text-pink-800",
  QUESTION_MISUNDERSTANDING: "bg-indigo-100 text-indigo-800",
  TIME_PRESSURE: "bg-amber-100 text-amber-800",
  UNKNOWN: "bg-gray-100 text-gray-800",
};

const typeLabels: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "MC",
  TRUE_FALSE: "TF",
  SHORT_TEXT: "ST",
  FILL_BLANK: "FB",
  MATCHING: "MA",
  WRITING: "WR",
};

export function MistakeCard({ mistake, onCategoryChange }: MistakeCardProps) {
  const truncatedText =
    mistake.attempt.question.text.length > 100
      ? mistake.attempt.question.text.substring(0, 100) + "..."
      : mistake.attempt.question.text;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">
              Q{mistake.attempt.question.number}
            </span>
            <Badge variant="secondary" className="text-xs">
              {typeLabels[mistake.attempt.question.type]}
            </Badge>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[mistake.category]}`}
            >
              {categoryLabels[mistake.category]}
            </span>
          </div>
        </div>
        <p className="text-sm text-foreground mb-3 line-clamp-2">
          {truncatedText}
        </p>
        {mistake.explanation && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
            {mistake.explanation}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{mistake.attempt.attempt.exam.title}</span>
          {mistake.attempt.question.skills.length > 0 && (
            <div className="flex gap-1">
              {mistake.attempt.question.skills.slice(0, 2).map((qs) => (
                <Badge key={qs.skill.name} variant="outline" className="text-xs">
                  {qs.skill.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}