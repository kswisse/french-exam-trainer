import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { getQuestionBank } from "@/features/questions/services/question-bank";
import { QuestionBankPage } from "@/features/questions/components/question-bank-page";

interface SearchParams {
  search?: string;
  examId?: string;
  sectionId?: string;
  skillId?: string;
  type?: string;
  difficulty?: string;
  page?: string;
}

async function getFilterData() {
  const [exams, sections, skills] = await Promise.all([
    prisma.exam.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.examSection.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.skill.findMany({
      where: { parentId: null },
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { exams, sections, skills };
}

async function QuestionBankContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { exams, sections, skills } = await getFilterData();

  const filters = {
    search: searchParams.search || "",
    examId: searchParams.examId || "",
    sectionId: searchParams.sectionId || "",
    skillId: searchParams.skillId || "",
    type: searchParams.type || "",
    difficulty: searchParams.difficulty || "",
  };

  const page = parseInt(searchParams.page || "1", 10);
  const limit = 20;

  const apiFilters: Record<string, any> = {};
  if (filters.examId && filters.examId !== "all")
    apiFilters.examId = filters.examId;
  if (filters.sectionId && filters.sectionId !== "all")
    apiFilters.sectionId = filters.sectionId;
  if (filters.skillId && filters.skillId !== "all")
    apiFilters.skillId = filters.skillId;
  if (filters.type && filters.type !== "all") apiFilters.type = filters.type;
  if (filters.difficulty && filters.difficulty !== "all")
    apiFilters.difficulty = filters.difficulty;
  if (filters.search) apiFilters.search = filters.search;
  apiFilters.page = page;
  apiFilters.limit = limit;

  const result = await getQuestionBank(apiFilters);

  return (
    <QuestionBankPage
      exams={exams}
      sections={sections}
      skills={skills}
      questions={result.questions}
      total={result.total}
      page={result.page}
      limit={result.limit}
      filters={filters}
    />
  );
}

export default async function QuestionBankPageRoute({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
      <QuestionBankContent searchParams={searchParams} />
    </Suspense>
  );
}
