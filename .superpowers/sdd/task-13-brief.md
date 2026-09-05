# T13: Question Bank UI

**Goal:** Build the question bank browsing interface with filters and search.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── questions/
│   │       └── components/
│   │           ├── question-bank-page.tsx
│   │           ├── question-filters.tsx
│   │           ├── question-list.tsx
│   │           └── question-card.tsx
│   └── app/
│       └── (dashboard)/
│           └── question-bank/
│               └── page.tsx
```

**`question-filters.tsx`:**
- Search input
- Exam dropdown (All + specific exams)
- Section dropdown
- Skill dropdown (hierarchical)
- Type dropdown (All, MC, TF, etc.)
- Difficulty dropdown

**`question-card.tsx`:**
- Question number, type badge, difficulty
- Question text (truncated)
- Exam source, skill tags
- Usage count (from QuestionAttempt)

**Tests:** None (UI).

**Acceptance criteria:**
- All filters work independently
- Filters combine correctly
- Search updates results
- Pagination works
- Empty state when no results

**Dependencies:** T03, T04, T12.
