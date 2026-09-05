"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MistakeList } from "./mistake-list";
import type { MistakeWithRelations } from "@/features/exams/services/mistakes";

interface Skill {
  id: string;
  name: string;
}

interface MistakesPageProps {
  skills: Skill[];
  mistakes: MistakeWithRelations[];
  total: number;
  page: number;
  limit: number;
  filters: {
    category: string;
    skillId: string;
  };
}

const categories = [
  { value: "CARELESS_MISTAKE", label: "Careless Mistake" },
  { value: "KNOWLEDGE_GAP", label: "Knowledge Gap" },
  { value: "VOCABULARY_GAP", label: "Vocabulary Gap" },
  { value: "GRAMMAR_GAP", label: "Grammar Gap" },
  { value: "READING_COMPREHENSION", label: "Reading Comprehension" },
  { value: "INFERENCE_ERROR", label: "Inference Error" },
  { value: "QUESTION_MISUNDERSTANDING", label: "Question Misunderstanding" },
  { value: "TIME_PRESSURE", label: "Time Pressure" },
  { value: "UNKNOWN", label: "Unknown" },
];

export function MistakesPage({
  skills,
  mistakes,
  total,
  page,
  limit,
  filters: initialFilters,
}: MistakesPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);

  const updateURL = useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams();
      if (newFilters.category && newFilters.category !== "all")
        params.set("category", newFilters.category);
      if (newFilters.skillId && newFilters.skillId !== "all")
        params.set("skillId", newFilters.skillId);

      router.push(`/mistakes?${params.toString()}`);
    },
    [router]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`/mistakes?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mistakes</h1>
        <p className="mt-2 text-muted-foreground">
          Review your mistakes and track your improvement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.skillId}
          onValueChange={(value) => handleFilterChange("skillId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Skills" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {skills.map((skill) => (
              <SelectItem key={skill.id} value={skill.id}>
                {skill.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MistakeList
        mistakes={mistakes}
        total={total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
}