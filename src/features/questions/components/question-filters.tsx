"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface QuestionFiltersProps {
  exams: Exam[];
  sections: Section[];
  skills: Skill[];
  filters: {
    search: string;
    examId: string;
    sectionId: string;
    skillId: string;
    type: string;
    difficulty: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True/False" },
  { value: "SHORT_TEXT", label: "Short Text" },
  { value: "FILL_BLANK", label: "Fill in the Blank" },
  { value: "MATCHING", label: "Matching" },
  { value: "WRITING", label: "Writing" },
];

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export function QuestionFilters({
  exams,
  sections,
  skills,
  filters,
  onFilterChange,
}: QuestionFiltersProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="col-span-2 md:col-span-3 lg:col-span-2">
        <Input
          placeholder="Search questions..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>
      <Select
        value={filters.examId}
        onValueChange={(value) => onFilterChange("examId", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="All Exams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Exams</SelectItem>
          {exams.map((exam) => (
            <SelectItem key={exam.id} value={exam.id}>
              {exam.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.sectionId}
        onValueChange={(value) => onFilterChange("sectionId", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="All Sections" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sections</SelectItem>
          {sections.map((section) => (
            <SelectItem key={section.id} value={section.id}>
              {section.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.skillId}
        onValueChange={(value) => onFilterChange("skillId", value)}
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
      <Select
        value={filters.type}
        onValueChange={(value) => onFilterChange("type", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {questionTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.difficulty}
        onValueChange={(value) => onFilterChange("difficulty", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="All Difficulties" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Difficulties</SelectItem>
          {difficulties.map((diff) => (
            <SelectItem key={diff.value} value={diff.value}>
              {diff.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
