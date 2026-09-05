# T14: Practice Session Service & API

**Goal:** Implement practice session creation and management.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── practice/
│   │       ├── services/
│   │       │   └── practice.ts
│   │       └── types.ts
│   └── app/
│       └── api/
│           └── practice/
│               └── route.ts          # POST /api/practice — create practice session
```

**`src/features/practice/services/practice.ts`:**
```ts
import { prisma } from "@/lib/db";
import { type QuestionType } from "@/generated/prisma/browser";
import { buildQuestionSnapshot } from "@/features/exams/services/attempt";

export interface PracticeConfig {
  questionCount: number;      // default 10
  skillId?: string;
  difficulty?: string;
  type?: QuestionType;
}

export async function createPracticeSession(profileId: string, config: PracticeConfig) {
  const { questionCount = 10, skillId, difficulty, type } = config;

  // 1. Query QuestionBank for matching questions
  const where: any = {};
  if (skillId) where.skills = { some: { skillId } };
  if (difficulty) where.difficulty = difficulty;
  if (type) where.type = type;

  const questions = await prisma.question.findMany({
    where,
    include: { options: true, answers: true, skills: { include: { skill: true } }, section: true },
    orderBy: { createdAt: "desc" },
  });

  // 2. Randomly select questionCount questions
  const shuffled = questions.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, questionCount);

  // 3. Create a "practice exam" (Exam with status=DRAFT, mode=PRACTICE)
  const exam = await prisma.exam.create({
    data: {
      title: "Practice Session",
      mode: "PRACTICE",
      status: "DRAFT",
      sections: {
        create: {
          title: "Practice Questions",
          order: 1,
          sectionType: "CUSTOM",
        },
      },
    },
    include: { sections: true },
  });

  // 4. Create ExamAttempt with mode=PRACTICE
  const attempt = await prisma.examAttempt.create({
    data: {
      profileId,
      examId: exam.id,
      mode: "PRACTICE",
      status: "IN_PROGRESS",
    },
  });

  // 5. Create QuestionAttempts with snapshots
  const questionAttempts = await Promise.all(
    selected.map((q, i) =>
      prisma.questionAttempt.create({
        data: {
          attemptId: attempt.id,
          questionId: q.id,
          questionNumber: i + 1,
          questionSnapshot: buildQuestionSnapshot(q) as any,
        },
      })
    )
  );

  // 6. Return attempt with questions
  return { attempt, questions: selected, questionAttempts };
}

export async function createMistakePracticeSession(profileId: string, questionCount: number) {
  // 1. Get user's recent Mistakes (last N)
  const mistakes = await prisma.mistake.findMany({
    where: { attempt: { profileId } },
    orderBy: { createdAt: "desc" },
    take: questionCount * 2, // get extra in case of duplicates
  });

  // 2. Extract unique questionIds
  const uniqueQuestionIds = [...new Set(mistakes.map(m => m.questionId))];

  // 3. Select questionCount from those
  const shuffled = uniqueQuestionIds.sort(() => Math.random() - 0.5);
  const selectedIds = shuffled.slice(0, questionCount);

  const questions = await prisma.question.findMany({
    where: { id: { in: selectedIds } },
    include: { options: true, answers: true, skills: { include: { skill: true } }, section: true },
  });

  // 4. Create practice session (same as above)
  const exam = await prisma.exam.create({
    data: {
      title: "Practice My Mistakes",
      mode: "PRACTICE",
      status: "DRAFT",
      sections: {
        create: {
          title: "Mistake Review",
          order: 1,
          sectionType: "CUSTOM",
        },
      },
    },
    include: { sections: true },
  });

  const attempt = await prisma.examAttempt.create({
    data: {
      profileId,
      examId: exam.id,
      mode: "PRACTICE",
      status: "IN_PROGRESS",
    },
  });

  const questionAttempts = await Promise.all(
    questions.map((q, i) =>
      prisma.questionAttempt.create({
        data: {
          attemptId: attempt.id,
          questionId: q.id,
          questionNumber: i + 1,
          questionSnapshot: buildQuestionSnapshot(q) as any,
        },
      })
    )
  );

  return { attempt, questions, questionAttempts };
}
```

**`POST /api/practice`:**
```ts
// Body: PracticeConfig
// Auth: requireUser
// Creates practice session, returns attempt with questions
```

**Tests:** None.

**Acceptance criteria:**
- Creates practice attempt with correct number of questions
- Filters work (skill, difficulty, type)
- Mistake practice selects from recent mistakes
- Practice attempt mode = PRACTICE

**Dependencies:** T02, T08, T12.
