"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuestionFilters } from "./question-filters";
import { QuestionList } from "./question-list";
import type { QuestionType } from "@/generated/prisma/browser";

interface Exam {
  id: string;
  title: string;
}

interface Section {
  id: string;
  title: string;
}

interface Skill {
  id: string;
  name: string;
  category: string | null;
}

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

interface QuestionBankPageProps {
  exams: Exam[];
  sections: Section[];
  skills: Skill[];
  questions: Question[];
  total: number;
  page: number;
  limit: number;
  filters: {
    search: string;
    examId: string;
    sectionId: string;
    skillId: string;
    type: string;
    difficulty: string;
  };
}

export function QuestionBankPage({
  exams,
  sections,
  skills,
  questions,
  total,
  page,
  limit,
  filters: initialFilters,
}: QuestionBankPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);

  const updateURL = useCallback(
    (newFilters: typeof filters, newPage: number) => {
      const params = new URLSearchParams();
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.examId && newFilters.examId !== "all")
        params.set("examId", newFilters.examId);
      if (newFilters.sectionId && newFilters.sectionId !== "all")
        params.set("sectionId", newFilters.sectionId);
      if (newFilters.skillId && newFilters.skillId !== "all")
        params.set("skillId", newFilters.skillId);
      if (newFilters.type && newFilters.type !== "all")
        params.set("type", newFilters.type);
      if (newFilters.difficulty && newFilters.difficulty !== "all")
        params.set("difficulty", newFilters.difficulty);
      if (newPage > 1) params.set("page", newPage.toString());

      router.push(`/question-bank?${params.toString()}`);
    },
    [router]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      updateURL(newFilters, 1);
    },
    [filters, updateURL]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateURL(filters, newPage);
    },
    [filters, updateURL]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and search questions from all exams.
        </p>
      </div>
      <QuestionFilters
        exams={exams}
        sections={sections}
        skills={skills}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <QuestionList
        questions={questions}
        total={total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
