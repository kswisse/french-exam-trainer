# T10: Results Page

**Goal:** Build the post-submission results page with score, section analysis, and question review.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── exams/
│   │       ├── components/
│   │       │   ├── results-page.tsx
│   │       │   ├── score-summary.tsx
│   │       │   ├── section-performance.tsx
│   │       │   ├── question-review.tsx
│   │       │   └── question-review-detail.tsx
│   │       └── services/
│   │           └── results.ts       # getExamResult, getQuestionReview
│   └── app/
│       └── (dashboard)/
│           └── results/
│               └── [attemptId]/
│                   └── page.tsx
```

**`src/features/exams/services/results.ts`:**
```ts
import { prisma } from "@/lib/db";
import { calculateExamResult, calculateTotalPossible } from "@/services/scoring";
import { type QuestionSnapshot } from "@/generated/prisma/browser";

export async function getExamResult(attemptId: string, profileId: string) {
  // 1. Fetch attempt with QuestionAttempts
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      questionAttempts: { orderBy: { questionNumber: "asc" } },
      exam: { include: { sections: true } },
    },
  });
  // 2. Verify attempt belongs to profile
  if (!attempt || attempt.profileId !== profileId) return null;
  // 3. Verify attempt is SUBMITTED or TIME_UP
  if (attempt.status !== "SUBMITTED" && attempt.status !== "TIME_UP") return null;
  // 4. Compute ExamResult from QuestionAttempts
  const totalPossible = calculateTotalPossible(
    attempt.questionAttempts.map(qa => qa.questionSnapshot as unknown as QuestionSnapshot)
  );
  // 5. Return ExamResult
  return { attempt, totalPossible };
}

export async function getQuestionReview(attemptId: string, questionId: string, profileId: string) {
  // 1. Fetch QuestionAttempt with questionSnapshot
  // 2. Read from questionSnapshot (NOT current question)
  // 3. Return snapshot + user's answer + correct answer + mistake info
}
```

**`src/features/exams/components/results-page.tsx`:**
- Score Summary: score/total, accuracy%, time
- Section Performance: per-section score with progress bars
- Question Review: clickable list of all questions

**`src/features/exams/components/question-review-detail.tsx`:**
- Question text (from snapshot)
- User's answer (from QuestionAttempt)
- Correct answer (from snapshot)
- Explanation (if available — from Mistake.explanation)
- Skills tested (from snapshot.skills)
- Mistake category (if incorrect)

**`src/app/(dashboard)/results/[attemptId]/page.tsx`:**
- Server component fetching result data
- Renders `<ResultsPage>` component

**Tests:** None (UI pages).

**Acceptance criteria:**
- Score summary shows correct calculation
- Section performance shows per-section breakdown
- Question review shows all questions
- Clicking a question shows detail view
- Correct answer uses snapshot (not current question)
- Unanswered questions shown correctly
- WRITING questions shown as "Not graded"
- Responsive layout

**Dependencies:** T03, T04, T05, T08.
