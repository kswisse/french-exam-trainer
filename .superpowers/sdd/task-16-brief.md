# T16: Mistake Tracking

**Goal:** Implement mistake tracking service and mistake review UI.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── exams/
│   │       ├── services/
│   │       │   └── mistakes.ts        # getMistakes, getMistakeStats
│   │       └── components/
│   │           ├── mistakes-page.tsx
│   │           ├── mistake-list.tsx
│   │           └── mistake-card.tsx
│   └── app/
│       └── (dashboard)/
│           └── mistakes/
│               └── page.tsx
```

**`src/features/exams/services/mistakes.ts`:**
```ts
import { prisma } from "@/lib/db";

export interface MistakeFilters {
  category?: string;
  skillId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export async function getMistakes(profileId: string, filters?: MistakeFilters) {
  const { category, skillId, dateFrom, dateTo, page = 1, limit = 20 } = filters || {};
  const where: any = { attempt: { profileId } };
  if (category) where.category = category;
  if (skillId) where.questionAttempt = { question: { skills: { some: { skillId } } } };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [mistakes, total] = await Promise.all([
    prisma.mistake.findMany({
      where,
      include: {
        questionAttempt: {
          include: { question: { include: { skills: { include: { skill: true } } } } },
        },
        attempt: { include: { exam: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mistake.count({ where }),
  ]);

  return { mistakes, total, page, limit };
}

export async function getMistakeStats(profileId: string) {
  const mistakes = await prisma.mistake.findMany({
    where: { attempt: { profileId } },
    include: { questionAttempt: { include: { question: { include: { skills: { include: { skill: true } } } } } } },
  });

  // Mistake frequency by category
  const byCategory = mistakes.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top mistake skills
  const skillCounts: Record<string, number> = {};
  mistakes.forEach(m => {
    m.questionAttempt.question.skills.forEach(s => {
      skillCounts[s.skill.name] = (skillCounts[s.skill.name] || 0) + 1;
    });
  });

  return { total: mistakes.length, byCategory, topSkills: skillCounts };
}

export async function updateMistakeCategory(mistakeId: string, profileId: string, category: string) {
  const mistake = await prisma.mistake.findUnique({
    where: { id: mistakeId },
    include: { attempt: true },
  });
  if (!mistake || mistake.attempt.profileId !== profileId) return null;
  return prisma.mistake.update({
    where: { id: mistakeId },
    data: { category: category as any },
  });
}
```

**Mistakes page:**
- List of recent mistakes
- Filter by category, skill, date
- Click to see full question + answer details
- "Override category" dropdown

**Tests:** None.

**Acceptance criteria:**
- Mistakes page shows all user mistakes
- Filters work
- Category override works
- Statistics computed correctly
- Empty state when no mistakes

**Dependencies:** T02, T04, T08.
