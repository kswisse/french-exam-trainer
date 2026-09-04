# T07: Exam List & Detail Pages

**Goal:** Build the exam browsing interface — list published exams and view exam details.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── exams/
│   │       ├── services/
│   │       │   └── exam.ts         # getPublishedExams, getExamById
│   │       ├── components/
│   │       │   ├── exam-list.tsx
│   │       │   ├── exam-card.tsx
│   │       │   └── exam-detail.tsx
│   │       └── types.ts
│   ├── app/
│   │   └── (dashboard)/
│   │       ├── layout.tsx           # Dashboard layout with auth check
│   │       ├── dashboard/
│   │       │   └── page.tsx         # Dashboard home
│   │       └── exams/
│   │           ├── page.tsx         # Exam list
│   │           └── [examId]/
│   │               └── page.tsx     # Exam detail
│   └── app/
│       └── api/
│           └── exams/
│               └── route.ts         # GET /api/exams
```

**`src/features/exams/services/exam.ts`:**
```ts
import { prisma } from "@/lib/db";

export async function getPublishedExams() {
  return prisma.exam.findMany({
    where: { status: "PUBLISHED" },
    include: { sections: { include: { questions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExamById(id: string) {
  return prisma.exam.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          questions: { include: { options: true, answers: true, skills: { include: { skill: true } } } },
          passages: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getExamTotalPoints(examId: string) {
  const result = await prisma.question.aggregate({
    where: { section: { examId } },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}
```

**`src/app/(dashboard)/layout.tsx`:**
```tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

**`src/app/(dashboard)/exams/page.tsx`:** Server component fetching published exams, rendering `<ExamList>`.

**`src/features/exams/components/exam-card.tsx`:** Card showing exam title, type, question count, time limit, "Take Exam" and "Practice" buttons.

**API `GET /api/exams`:** Returns published exams with section/question counts.

**Tests:** None (UI pages).

**Acceptance criteria:**
- Dashboard page loads with auth check
- Exam list shows published exams from seed data
- Exam detail page shows sections, questions, options
- "Take Exam" button links to exam take page
- Responsive layout works

**Dependencies:** T02, T03, T04, T06.
