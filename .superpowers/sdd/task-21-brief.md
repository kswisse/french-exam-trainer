# T21: Import Review UI

**Goal:** Build the admin import review interface for editing and approving extracted exams.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── imports/
│   │       ├── services/
│   │       │   └── import.ts         # getImports, approveImport, rejectImport
│   │       ├── components/
│   │       │   ├── import-list.tsx
│   │       │   ├── import-detail.tsx
│   │       │   ├── import-review.tsx
│   │       │   ├── extracted-question.tsx
│   │       │   ├── edit-question-dialog.tsx
│   │       │   └── import-status-badge.tsx
│   │       └── types.ts
│   ├── app/
│   │   ├── api/
│   │   │   └── imports/
│   │   │       ├── route.ts          # GET /api/imports — list imports
│   │   │       └── [importId]/
│   │   │           ├── route.ts      # GET /api/imports/[id] — get import detail
│   │   │           ├── approve/
│   │   │           │   └── route.ts  # POST /api/imports/[id]/approve
│   │   │           ├── reject/
│   │   │           │   └── route.ts  # POST /api/imports/[id]/reject
│   │   │           └── retry/
│   │   │               └── route.ts  # POST /api/imports/[id]/retry
│   │   └── (dashboard)/
│   │       └── imports/
│   │           ├── page.tsx          # Import list
│   │           └── [importId]/
│   │               └── page.tsx      # Import detail + review
│   └── admin/
│       ├── layout.tsx                # Admin layout with role check
│       ├── imports/
│       │   └── page.tsx
│       └── exams/
│           └── page.tsx
```

**`src/features/imports/services/import.ts`:**
```ts
import { prisma } from "@/lib/db";
import type { ParsedExam } from "@/lib/validation/schemas";

export async function getImports(profileId: string) {
  return prisma.contentImport.findMany({
    include: { document: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getImportDetail(importId: string, profileId: string) {
  return prisma.contentImport.findUnique({
    where: { id: importId },
    include: { document: true },
  });
}

export async function approveImport(importId: string, profileId: string) {
  const contentImport = await prisma.contentImport.findUnique({
    where: { id: importId },
    include: { document: true },
  });
  if (!contentImport) throw new Error("Import not found");

  const parsed = JSON.parse(contentImport.extractedText || "{}") as ParsedExam;

  // Create Exam
  const exam = await prisma.exam.create({
    data: {
      title: parsed.title,
      mode: "BOTH",
      status: "PUBLISHED",
    },
  });

  // Create ExamSections, Questions, Options, Answers
  for (const sectionData of parsed.sections) {
    const section = await prisma.examSection.create({
      data: {
        examId: exam.id,
        title: sectionData.title,
        order: parsed.sections.indexOf(sectionData) + 1,
        sectionType: "CUSTOM",
      },
    });

    for (const q of sectionData.questions) {
      const question = await prisma.question.create({
        data: {
          sectionId: section.id,
          text: q.text,
          type: q.type as any,
          questionNumber: q.number,
          points: q.points || 1,
          difficulty: q.difficulty || "MEDIUM",
        },
      });

      if (q.options) {
        await prisma.questionOption.createMany({
          data: q.options.map(o => ({
            questionId: question.id,
            label: o.label,
            text: o.text,
            isCorrect: o.label === q.correctAnswer,
          })),
        });
      }
    }
  }

  // Create ExamSource
  await prisma.examSource.create({
    data: {
      examId: exam.id,
      documentId: contentImport.documentId,
    },
  });

  // Update import status
  await prisma.contentImport.update({
    where: { id: importId },
    data: { status: "APPROVED" },
  });

  return exam;
}

export async function rejectImport(importId: string, profileId: string, reason?: string) {
  return prisma.contentImport.update({
    where: { id: importId },
    data: { status: "REJECTED" },
  });
}
```

**`src/admin/layout.tsx`:**
```tsx
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }
  return <div>{children}</div>;
}
```

**Tests:** None (UI).

**Acceptance criteria:**
- Import list shows all imports
- Import detail shows parsed data
- Low-confidence items flagged
- Edit question works
- Approve creates exam with all records
- Reject marks import as rejected
- Retry re-runs failed step
- Only admins can approve/reject

**Dependencies:** T03, T04, T18, T19, T20.
