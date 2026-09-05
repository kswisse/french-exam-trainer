# T11: Dashboard Page

**Goal:** Build the dashboard with performance metrics, recent exams, and available exams.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── dashboard/
│   │       ├── components/
│   │       │   ├── dashboard-page.tsx
│   │       │   ├── recent-exam-card.tsx
│   │       │   ├── performance-card.tsx
│   │       │   ├── skill-summary.tsx
│   │       │   ├── recent-mistakes.tsx
│   │       │   └── available-exams.tsx
│   │       └── services/
│   │           └── dashboard.ts     # getDashboardData
│   └── app/
│       └── (dashboard)/
│           └── dashboard/
│               └── page.tsx
```

**`src/features/dashboard/services/dashboard.ts`:**
```ts
import { prisma } from "@/lib/db";

export async function getDashboardData(profileId: string) {
  // 1. Recent exam: latest submitted attempt with exam title + score
  const recentAttempt = await prisma.examAttempt.findFirst({
    where: { profileId, status: { in: ["SUBMITTED", "TIME_UP"] } },
    include: { exam: true },
    orderBy: { submittedAt: "desc" },
  });

  // 2. Performance: overall accuracy, exams taken, questions attempted
  const allAttempts = await prisma.examAttempt.findMany({
    where: { profileId, status: { in: ["SUBMITTED", "TIME_UP"] } },
    include: { questionAttempts: true },
  });

  // 3. Weakest skills: skill accuracy (computed on demand)
  // 4. Strongest skills: top 3 skills by accuracy
  // 5. Recent mistakes: last 5 mistakes with question text
  // 6. Available exams: published exams with attempt status
}
```

**Dashboard layout (from spec Section 14.1):**
- Recent Exam card (top left)
- Performance card (top right)
- Weakest Skills card (middle left)
- Strongest Skills card (middle right)
- Recent Mistakes card (bottom left)
- Available Exams card (bottom right)

**Tests:** None (UI pages).

**Acceptance criteria:**
- Dashboard loads with all 6 cards
- Recent exam shows latest attempt
- Performance shows correct accuracy
- Skills sorted correctly (weakest/strongest)
- Recent mistakes show question text
- Available exams show "Take Exam" / "Practice" buttons
- Empty states shown when no data

**Dependencies:** T04, T07, T08, T10.
