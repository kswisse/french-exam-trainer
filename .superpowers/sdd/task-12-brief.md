# T12: Question Bank Service & API

**Goal:** Implement question bank queries with filtering and search.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── questions/
│   │       ├── services/
│   │       │   └── question-bank.ts
│   │       └── types.ts
│   └── app/
│       └── api/
│           └── questions/
│               └── route.ts          # GET /api/questions — filtered question list
```

**`src/features/questions/services/question-bank.ts`:**
```ts
import { prisma } from "@/lib/db";
import { type QuestionType } from "@/generated/prisma/browser";

export interface QuestionBankFilters {
  examId?: string;
  sectionId?: string;
  skillId?: string;
  type?: QuestionType;
  difficulty?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getQuestionBank(filters: QuestionBankFilters) {
  const { examId, sectionId, skillId, type, difficulty, search, page = 1, limit = 20 } = filters;
  const where: any = {};
  if (examId) where.section = { examId };
  if (sectionId) where.sectionId = sectionId;
  if (skillId) where.skills = { some: { skillId } };
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;
  if (search) where.text = { contains: search, mode: "insensitive" };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        section: { include: { exam: true } },
        options: true,
        answers: true,
        skills: { include: { skill: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { questionNumber: "asc" },
    }),
    prisma.question.count({ where }),
  ]);

  return { questions, total, page, limit };
}

export async function getQuestionBankStats() {
  const [total, byType, bySkill] = await Promise.all([
    prisma.question.count(),
    prisma.question.groupBy({ by: ["type"], _count: true }),
    prisma.questionSkill.groupBy({ by: ["skillId"], _count: true }),
  ]);
  return { total, byType, bySkill };
}
```

**`GET /api/questions`:**
```ts
// Query params: examId, sectionId, skillId, type, difficulty, search, page, limit
// Auth: requireUser
// Returns paginated questions with metadata
```

**Tests:** None (service only, tested via integration).

**Acceptance criteria:**
- Filter by exam works
- Filter by section works
- Filter by skill works
- Filter by type works
- Search by text works
- Pagination works
- Returns total count for pagination UI

**Dependencies:** T02.
