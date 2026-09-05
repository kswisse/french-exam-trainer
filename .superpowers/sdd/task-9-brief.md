# T09: Exam-Taking Interface

**Goal:** Build the exam-taking UI with timer, autosave, navigation, and question types.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── exams/
│   │       ├── components/
│   │       │   ├── exam-taker.tsx          # Main exam container
│   │       │   ├── exam-header.tsx         # Title + timer
│   │       │   ├── question-display.tsx    # Renders question by type
│   │       │   ├── question-navigator.tsx  # Grid of question numbers
│   │       │   ├── mc-question.tsx         # Multiple choice renderer
│   │       │   ├── tf-question.tsx         # True/false renderer
│   │       │   ├── short-text-question.tsx # Short text input
│   │       │   ├── fill-blank-question.tsx # Fill in blank
│   │       │   ├── matching-question.tsx   # Matching pairs
│   │       │   ├── writing-question.tsx    # Writing prompt
│   │       │   ├── passage-display.tsx     # Shared passage content
│   │       │   ├── submit-modal.tsx        # Confirmation dialog
│   │       │   └── exam-complete.tsx       # Post-submission redirect
│   │       └── hooks/
│   │           ├── use-exam-timer.ts       # Countdown timer hook
│   │           ├── use-autosave.ts         # Autosave hook
│   │           └── use-exam-state.ts       # Exam state management
│   └── app/
│       └── exam/
│           └── [examId]/
│               └── take/
│                   └── page.tsx            # Exam take page
```

**`src/app/exam/[examId]/take/page.tsx`:**
```tsx
// Server component: fetch attempt or create new one
// If no IN_PROGRESS attempt, create one via API
// Pass attempt data to <ExamTaker> client component
```

**`src/features/exams/components/exam-taker.tsx`:**
```tsx
// Client component managing exam state
// State: currentQuestionIndex, answers (Map<questionId, {selectedOptionId?, textAnswer?}>)
// State: markedForReview (Set<questionId>)
// Renders: ExamHeader (title + timer), QuestionDisplay, QuestionNavigator, Previous/Next buttons
```

**Timer hook (`use-exam-timer.ts`):**
```ts
// Takes: timeLimitMinutes, onSubmit callback
// Returns: { timeRemaining, isRunning, pause, resume }
// Uses: useEffect with setInterval
// On time up: calls onSubmit automatically
// Persists remaining time to localStorage
```

**Autosave hook (`use-autosave.ts`):**
```ts
// Takes: attemptId, answers Map
// Saves to localStorage immediately on change
// Debounces API call every 10 seconds
// On reconnect: syncs queued saves
// Returns: { isSaving, lastSavedAt }
```

**Question display:**
- Switch on question type to render appropriate component
- If question has passage, show `<PassageDisplay>` above question
- MC/TF: Radio button group
- SHORT_TEXT: Text input
- FILL_BLANK: Multiple text inputs (one per blank)
- MATCHING: Drag-and-drop or select-based matching
- WRITING: Textarea

**Question navigator:**
- Grid of question numbers
- Color coding: answered (green), unanswered (gray), marked (amber)
- Click to jump to question

**Submit flow:**
- "Submit" button opens `<SubmitModal>`
- Modal shows: X answered, Y unanswered, Z marked for review
- "Confirm Submit" calls API to submit attempt
- Redirects to results page

**Tests:** None (UI components, manual testing).

**Acceptance criteria:**
- Timer counts down and auto-submits at zero
- Autosave persists to localStorage and syncs to server
- All 6 question types render correctly
- Previous/Next navigation works
- Question navigator shows correct state colors
- Mark for review toggles correctly
- Submit modal shows correct counts
- Submit redirects to results page
- Works on mobile (responsive)

**Dependencies:** T03, T04, T08.
