import { describe, test, expect } from "vitest";
import { gradeAnswer, normalizeText, calculateExamResult } from "@/services/scoring";
import type { QuestionSnapshot } from "@/types/scoring";

function makeSnapshot(overrides: Partial<QuestionSnapshot> = {}): QuestionSnapshot {
  return {
    id: "q1",
    text: "Test question",
    type: "MULTIPLE_CHOICE",
    points: 1,
    options: [],
    answers: [],
    skills: [],
    ...overrides,
  };
}

describe("scoring engine", () => {
  describe("gradeAnswer", () => {
    test("MC correct answer → full points", () => {
      const snapshot = makeSnapshot({
        options: [
          { id: "opt-a", label: "A", text: "Paris", isCorrect: true },
          { id: "opt-b", label: "B", text: "Lyon", isCorrect: false },
        ],
      });
      const result = gradeAnswer(snapshot, "opt-a", null);
      expect(result).toEqual({ isCorrect: true, pointsAwarded: 1 });
    });

    test("MC incorrect answer → 0 points", () => {
      const snapshot = makeSnapshot({
        options: [
          { id: "opt-a", label: "A", text: "Paris", isCorrect: true },
          { id: "opt-b", label: "B", text: "Lyon", isCorrect: false },
        ],
      });
      const result = gradeAnswer(snapshot, "opt-b", null);
      expect(result).toEqual({ isCorrect: false, pointsAwarded: 0 });
    });

    test("TF correct answer → full points", () => {
      const snapshot = makeSnapshot({
        type: "TRUE_FALSE",
        options: [
          { id: "opt-t", label: "True", text: "True", isCorrect: true },
          { id: "opt-f", label: "False", text: "False", isCorrect: false },
        ],
      });
      const result = gradeAnswer(snapshot, "opt-t", null);
      expect(result).toEqual({ isCorrect: true, pointsAwarded: 1 });
    });

    test("SHORT_TEXT exact match → full points", () => {
      const snapshot = makeSnapshot({
        type: "SHORT_TEXT",
        answers: [{ text: "Bonjour", isAcceptable: true }],
      });
      const result = gradeAnswer(snapshot, null, "Bonjour");
      expect(result).toEqual({ isCorrect: true, pointsAwarded: 1 });
    });

    test("SHORT_TEXT case-insensitive match → full points", () => {
      const snapshot = makeSnapshot({
        type: "SHORT_TEXT",
        answers: [{ text: "Bonjour", isAcceptable: true }],
      });
      const result = gradeAnswer(snapshot, null, "bonjour");
      expect(result).toEqual({ isCorrect: true, pointsAwarded: 1 });
    });

    test("SHORT_TEXT with accent normalization → full points", () => {
      const snapshot = makeSnapshot({
        type: "SHORT_TEXT",
        answers: [{ text: "café", isAcceptable: true }],
      });
      const result = gradeAnswer(snapshot, null, "cafe");
      expect(result).toEqual({ isCorrect: true, pointsAwarded: 1 });
    });

    test("SHORT_TEXT no match → 0 points", () => {
      const snapshot = makeSnapshot({
        type: "SHORT_TEXT",
        answers: [{ text: "Bonjour", isAcceptable: true }],
      });
      const result = gradeAnswer(snapshot, null, "Au revoir");
      expect(result).toEqual({ isCorrect: false, pointsAwarded: 0 });
    });

    test("FILL_BLANK all correct → full points", () => {
      const snapshot = makeSnapshot({
        type: "FILL_BLANK",
        answers: [
          { text: "blank_1:Paris", isAcceptable: true },
          { text: "blank_2:Lyon", isAcceptable: true },
        ],
      });
      const result = gradeAnswer(snapshot, null, JSON.stringify(["Paris", "Lyon"]));
      expect(result).toEqual({ isCorrect: true, pointsAwarded: 1 });
    });

    test("FILL_BLANK partial correct → 0 points", () => {
      const snapshot = makeSnapshot({
        type: "FILL_BLANK",
        answers: [
          { text: "blank_1:Paris", isAcceptable: true },
          { text: "blank_2:Lyon", isAcceptable: true },
        ],
      });
      const result = gradeAnswer(snapshot, null, JSON.stringify(["Paris", "Marseille"]));
      expect(result).toEqual({ isCorrect: false, pointsAwarded: 0 });
    });

    test("MATCHING all correct → full points", () => {
      const snapshot = makeSnapshot({
        type: "MATCHING",
        answers: [{ text: JSON.stringify({ A: "1", B: "2", C: "3" }), isAcceptable: true }],
      });
      const result = gradeAnswer(snapshot, null, JSON.stringify({ A: "1", B: "2", C: "3" }));
      expect(result).toEqual({ isCorrect: true, pointsAwarded: 1 });
    });

    test("MATCHING partial → 0 points", () => {
      const snapshot = makeSnapshot({
        type: "MATCHING",
        answers: [{ text: JSON.stringify({ A: "1", B: "2", C: "3" }), isAcceptable: true }],
      });
      const result = gradeAnswer(snapshot, null, JSON.stringify({ A: "1", B: "3", C: "2" }));
      expect(result).toEqual({ isCorrect: false, pointsAwarded: 0 });
    });

    test("WRITING → null isCorrect, 0 points", () => {
      const snapshot = makeSnapshot({ type: "WRITING" });
      const result = gradeAnswer(snapshot, null, "Some essay text");
      expect(result).toEqual({ isCorrect: null, pointsAwarded: 0 });
    });

    test("negative points applied on incorrect", () => {
      const snapshot = makeSnapshot({
        options: [
          { id: "opt-a", label: "A", text: "Paris", isCorrect: true },
          { id: "opt-b", label: "B", text: "Lyon", isCorrect: false },
        ],
      });
      const result = gradeAnswer(snapshot, "opt-b", null, { points: 2, negativePoints: 1 });
      expect(result).toEqual({ isCorrect: false, pointsAwarded: -1 });
    });
  });

  describe("normalizeText", () => {
    test("trims whitespace", () => {
      expect(normalizeText("  hello  ")).toBe("hello");
    });

    test("lowercases", () => {
      expect(normalizeText("Bonjour")).toBe("bonjour");
    });

    test("removes accents (é → e)", () => {
      expect(normalizeText("café")).toBe("cafe");
      expect(normalizeText("résumé")).toBe("resume");
      expect(normalizeText("Élève")).toBe("eleve");
    });
  });

  describe("calculateExamResult", () => {
    test("computes total score correctly", () => {
      const questions = [
        {
          questionId: "q1",
          questionNumber: 1,
          isCorrect: true,
          pointsAwarded: 1,
          points: 1,
          sectionId: "s1",
          sectionTitle: "Section 1",
        },
        {
          questionId: "q2",
          questionNumber: 2,
          isCorrect: false,
          pointsAwarded: 0,
          points: 1,
          sectionId: "s1",
          sectionTitle: "Section 1",
        },
        {
          questionId: "q3",
          questionNumber: 3,
          isCorrect: true,
          pointsAwarded: 1,
          points: 1,
          sectionId: "s1",
          sectionTitle: "Section 1",
        },
      ];
      const result = calculateExamResult(questions, 120);
      expect(result.totalScore).toBe(2);
      expect(result.totalPossible).toBe(3);
      expect(result.correctCount).toBe(2);
      expect(result.incorrectCount).toBe(1);
    });

    test("computes section breakdown", () => {
      const questions = [
        {
          questionId: "q1",
          questionNumber: 1,
          isCorrect: true,
          pointsAwarded: 1,
          points: 1,
          sectionId: "s1",
          sectionTitle: "Comprehension",
        },
        {
          questionId: "q2",
          questionNumber: 2,
          isCorrect: false,
          pointsAwarded: 0,
          points: 2,
          sectionId: "s2",
          sectionTitle: "Grammar",
        },
        {
          questionId: "q3",
          questionNumber: 3,
          isCorrect: true,
          pointsAwarded: 2,
          points: 2,
          sectionId: "s2",
          sectionTitle: "Grammar",
        },
      ];
      const result = calculateExamResult(questions, 300);
      expect(result.sectionResults).toHaveLength(2);
      expect(result.sectionResults[0]).toMatchObject({
        sectionTitle: "Comprehension",
        score: 1,
        totalPossible: 1,
        percentage: 100,
      });
      expect(result.sectionResults[1]).toMatchObject({
        sectionTitle: "Grammar",
        score: 2,
        totalPossible: 4,
        percentage: 50,
      });
    });

    test("computes accuracy percentage", () => {
      const questions = [
        {
          questionId: "q1",
          questionNumber: 1,
          isCorrect: true,
          pointsAwarded: 1,
          points: 1,
          sectionId: "s1",
          sectionTitle: "Section 1",
        },
        {
          questionId: "q2",
          questionNumber: 2,
          isCorrect: false,
          pointsAwarded: 0,
          points: 1,
          sectionId: "s1",
          sectionTitle: "Section 1",
        },
        {
          questionId: "q3",
          questionNumber: 3,
          isCorrect: true,
          pointsAwarded: 1,
          points: 1,
          sectionId: "s1",
          sectionTitle: "Section 1",
        },
        {
          questionId: "q4",
          questionNumber: 4,
          isCorrect: null,
          pointsAwarded: 0,
          points: 1,
          sectionId: "s1",
          sectionTitle: "Section 1",
        },
      ];
      const result = calculateExamResult(questions, 60);
      // accuracy = correct / (correct + incorrect) = 2 / 3 = 66.67%
      expect(result.accuracy).toBeCloseTo(66.67, 1);
      expect(result.percentage).toBe(50); // totalScore=2 / totalPossible=4
      expect(result.unansweredCount).toBe(1);
    });
  });
});
