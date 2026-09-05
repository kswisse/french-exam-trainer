# T05: Scoring Engine (Domain Logic)

**Goal:** Implement the deterministic scoring engine with all question types.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── services/
│   │   └── scoring.ts
│   └── types/
│       └── scoring.ts
└── tests/
    └── unit/
        └── scoring.test.ts
```

**`src/types/scoring.ts`:**
```ts
import { type QuestionType, type QuestionSnapshot } from "@/generated/prisma/client";

export interface ScoringConfig {
  points: number;
  negativePoints: number;
}

export interface GradeResult {
  isCorrect: boolean | null;  // null for WRITING
  pointsAwarded: number;
}

export interface ExamResult {
  totalScore: number;
  totalPossible: number;
  percentage: number;
  timeSpentSeconds: number;
  sectionResults: SectionResult[];
  questionResults: QuestionResult[];
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
}

export interface SectionResult {
  sectionId: string;
  sectionTitle: string;
  score: number;
  totalPossible: number;
  percentage: number;
}

export interface QuestionResult {
  questionId: string;
  questionNumber: number;
  isCorrect: boolean | null;
  pointsAwarded: number;
  selectedOptionId?: string;
  textAnswer?: string;
}
```

**`src/services/scoring.ts`:**
```ts
// gradeAnswer(snapshot, selectedOptionId, textAnswer, config) → GradeResult
// - MULTIPLE_CHOICE / TRUE_FALSE: compare selectedOptionId to correct option
// - SHORT_TEXT: compare textAnswer against QuestionAnswer records with normalization
// - FILL_BLANK: parse JSON array, compare each blank against QuestionAnswer
// - MATCHING: parse JSON objects, compare pairings
// - WRITING: return { isCorrect: null, pointsAwarded: 0 }

// normalizeText(text, rules?) → string
// - trimWhitespace, caseInsensitive, removeAccents

// calculateExamResult(attempt, questions, sections) → ExamResult
// - Sum pointsAwarded, compute totals, section breakdowns

// calculateTotalPossible(questions) → number
// - SUM(question.points) for all questions
```

**Implementation details:**

`gradeAnswer` function:
1. Switch on `snapshot.type`
2. For MC/TF: find option where `isCorrect === true` in snapshot, compare with `selectedOptionId`
3. For SHORT_TEXT: iterate `snapshot.answers`, normalize both texts, check match
4. For FILL_BLANK: parse `textAnswer` as JSON array, for each blank iterate answers with matching blank prefix
5. For MATCHING: parse both `textAnswer` and expected answer as JSON, compare key-value pairs
6. For WRITING: return null
7. Return `{ isCorrect, pointsAwarded }` where pointsAwarded = isCorrect ? config.points : -config.negativePoints

`normalizeText` function:
1. Apply trimWhitespace (default true)
2. Apply caseInsensitive (default true)
3. Apply removeAccents using Unicode normalization

**Tests (`tests/unit/scoring.test.ts`):**
```ts
describe("scoring engine", () => {
  describe("gradeAnswer", () => {
    test("MC correct answer → full points")
    test("MC incorrect answer → 0 points")
    test("TF correct answer → full points")
    test("SHORT_TEXT exact match → full points")
    test("SHORT_TEXT case-insensitive match → full points")
    test("SHORT_TEXT with accent normalization → full points")
    test("SHORT_TEXT no match → 0 points")
    test("FILL_BLANK all correct → full points")
    test("FILL_BLANK partial correct → 0 points")
    test("MATCHING all correct → full points")
    test("MATCHING partial → 0 points")
    test("WRITING → null isCorrect, 0 points")
    test("negative points applied on incorrect")
  });

  describe("normalizeText", () => {
    test("trims whitespace")
    test("lowercases")
    test("removes accents (é → e)")
  });

  describe("calculateExamResult", () => {
    test("computes total score correctly")
    test("computes section breakdown")
    test("computes accuracy percentage")
  });
});
```

**Acceptance criteria:**
- All 15+ test cases pass
- Scoring is pure function (no side effects, no DB calls)
- WRITING returns null isCorrect
- Normalization handles French accents

**Dependencies:** T02.
