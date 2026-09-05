# T08: Exam Attempt API & Service

**Goal:** Implement the core exam attempt lifecycle — create, save answers, submit.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── features/
│   │   └── exams/
│   │       └── services/
│   │           └── attempt.ts       # createAttempt, saveAnswer, submitAttempt
│   ├── app/
│   │   └── api/
│   │       └── attempts/
│   │           ├── route.ts          # POST /api/attempts — create attempt
│   │           └── [attemptId]/
│   │               ├── route.ts      # GET /api/attempts/[id] — get attempt
│   │               └── answers/
│   │                   └── route.ts  # PUT /api/attempts/[id]/answers — save answer
│   └── types/
│       └── attempt.ts
```

**`src/features/exams/services/attempt.ts`:**

```ts
export async function createAttempt(profileId, examId, mode) {
  // 1. Verify exam exists and is PUBLISHED
  // 2. Verify exam mode supports the requested mode (BOTH or matching)
  // 3. Check no IN_PROGRESS attempt exists for this user+exam
  // 4. Fetch all questions with options, answers, skills
  // 5. Create ExamAttempt with mode
  // 6. Create QuestionAttempt for each question with questionSnapshot
  // 7. Return attempt with questions
}

export async function saveAnswer(attemptId, profileId, questionId, selectedOptionId?, textAnswer?) {
  // 1. Verify attempt belongs to profile
  // 2. Verify attempt status is IN_PROGRESS
  // 3. Update QuestionAttempt with answer
  // 4. Return updated question attempt
}

export async function submitAttempt(attemptId, profileId) {
  // 1. Verify attempt belongs to profile
  // 2. Verify attempt status is IN_PROGRESS
  // 3. For each QuestionAttempt, grade using scoring engine
  // 4. Create Mistake records for incorrect answers
  // 5. Set attempt status = SUBMITTED, submittedAt = now
  // 6. Return ExamResult
}
```

**`createAttempt` details:**
- Fetch exam with sections → questions → options, answers, skills
- For each question, build `questionSnapshot` JSON:
  ```ts
  {
    id: question.id,
    text: question.text,
    type: question.type,
    instructions: question.instructions,
    points: question.points,
    difficulty: question.difficulty,
    options: question.options.map(o => ({ id: o.id, label: o.label, text: o.text, isCorrect: o.isCorrect })),
    answers: question.answers.map(a => ({ text: a.text, isAcceptable: a.isAcceptable, normalizationRule: a.normalizationRule })),
    skills: question.skills.map(s => ({ name: s.skill.name, category: s.skill.category })),
  }
  ```

**`submitAttempt` details:**
- Load all QuestionAttempts for this attempt
- For each, call `gradeAnswer(snapshot, selectedOptionId, textAnswer, config)`
- Update `isCorrect` and `pointsAwarded`
- If incorrect, create `Mistake` record with category=UNKNOWN (AI classification is Phase 4)
- Compute ExamResult using `calculateExamResult()`

**API routes:**

`POST /api/attempts`:
```ts
// Body: { examId: string, mode: "REAL_EXAM" | "PRACTICE" }
// Auth: requireUser
// Creates attempt, returns attempt with questions
```

`GET /api/attempts/[attemptId]`:
```ts
// Auth: requireUser, verify attempt belongs to user
// Returns attempt with QuestionAttempts
```

`PUT /api/attempts/[attemptId]/answers`:
```ts
// Body: { questionId: string, selectedOptionId?: string, textAnswer?: string }
// Auth: requireUser, verify attempt belongs to user
// Saves answer, returns updated QuestionAttempt
```

**Tests (`tests/unit/exam-attempt.test.ts`):**
```ts
describe("exam attempt", () => {
  test("create attempt creates question attempts with snapshots")
  test("create attempt prevents duplicate IN_PROGRESS attempts")
  test("save answer updates question attempt")
  test("save answer rejects if attempt is submitted")
  test("submit attempt grades all questions")
  test("submit attempt creates mistake records for incorrect answers")
  test("submit attempt sets status to SUBMITTED");
});
```

**Acceptance criteria:**
- Create attempt generates correct number of QuestionAttempts
- questionSnapshot contains all question data
- Save answer persists correctly
- Submit grades all questions deterministically

**Dependencies:** T02, T03, T04, T05.
