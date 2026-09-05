# T15: Practice Mode UI

**Goal:** Build the practice mode interface with immediate feedback and AI explanations.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── practice/
│   │       ├── components/
│   │       │   ├── practice-setup.tsx       # Configure practice session
│   │       │   ├── practice-taker.tsx       # Practice session interface
│   │       │   ├── practice-feedback.tsx    # Immediate feedback after answer
│   │       │   └── ai-explanation.tsx       # AI explanation panel
│   │       └── hooks/
│   │           └── use-practice.ts
│   └── app/
│       └── (dashboard)/
│           └── practice/
│               ├── page.tsx                 # Practice setup page
│               └── [attemptId]/
│                   └── page.tsx             # Practice session page
```

**`practice-setup.tsx`:**
- Question count input
- Skill filter
- Difficulty filter
- Type filter
- "Practice My Mistakes" button
- "Start Practice" button

**`practice-taker.tsx`:**
- Similar to exam-taker but with:
  - No timer (optional)
  - After answering, show feedback immediately
  - "Explain this question" button for wrong answers
  - "Next" button moves to next question
  - No submit modal — auto-advances

**`practice-feedback.tsx`:**
- Shows: correct/incorrect, user answer, correct answer
- If incorrect: shows explanation (from Mistake or AI)
- "Explain this question" button triggers AI

**`ai-explanation.tsx`:**
- Calls `POST /api/ai/explain` with question data
- Shows AI explanation in loading → loaded states
- Explanation includes: why correct, why wrong, French context, takeaway

**Tests:** None (UI).

**Acceptance criteria:**
- Practice setup creates session correctly
- Immediate feedback shown after answering
- Correct answer revealed
- AI explanation loads and displays
- Navigation works (prev/next)
- "Practice My Mistakes" works

**Dependencies:** T03, T04, T09, T14.
