"use client";

import { QuestionCard } from "./question-card";
import type { QuestionType } from "@/generated/prisma/browser";

interface Question {
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
}

interface QuestionListProps {
  questions: Question[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function QuestionList({
  questions,
  total,
  page,
  limit,
  onPageChange,
}: QuestionListProps) {
  const totalPages = Math.ceil(total / limit);

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No questions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of{" "}
          {total} questions
        </span>
      </div>
      <div className="grid gap-3">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
