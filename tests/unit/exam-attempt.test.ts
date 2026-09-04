import { describe, test, expect, vi, beforeEach } from "vitest";
import type { QuestionSnapshot } from "@/types/attempt";

vi.mock("@/lib/db", () => ({
  prisma: {
    exam: {
      findUnique: vi.fn(),
    },
    examAttempt: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    questionAttempt: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    mistake: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireUser: vi.fn(),
  getCurrentUser: vi.fn(),
}));

import { createAttempt, saveAnswer, submitAttempt } from "@/features/exams/services/attempt";
import { prisma } from "@/lib/db";

const mockPrisma = vi.mocked(prisma) as any;

function makeQuestionSnapshot(overrides: Partial<QuestionSnapshot> = {}): QuestionSnapshot {
  return {
    id: "q1",
    text: "What is the capital of France?",
    type: "MULTIPLE_CHOICE",
    points: 1,
    options: [
      { id: "opt-a", label: "A", text: "Paris", isCorrect: true },
      { id: "opt-b", label: "B", text: "Lyon", isCorrect: false },
    ],
    answers: [],
    skills: [],
    ...overrides,
  };
}

function makeExam(overrides = {}) {
  return {
    id: "exam-1",
    title: "Test Exam",
    status: "PUBLISHED",
    mode: "BOTH",
    negativePoints: 0,
    sections: [
      {
        id: "section-1",
        title: "Section 1",
        order: 1,
        questions: [
          {
            id: "q1",
            text: "What is the capital of France?",
            type: "MULTIPLE_CHOICE",
            instructions: null,
            points: 1,
            difficulty: "B1",
            number: 1,
            order: 1,
            options: [
              { id: "opt-a", label: "A", text: "Paris", isCorrect: true },
              { id: "opt-b", label: "B", text: "Lyon", isCorrect: false },
            ],
            answers: [],
            skills: [{ skill: { name: "Vocabulary", category: "Lexical" } }],
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("exam attempt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAttempt", () => {
    test("creates question attempts with snapshots", async () => {
      const exam = makeExam();
      mockPrisma.exam.findUnique.mockResolvedValue(exam);
      mockPrisma.examAttempt.findFirst.mockResolvedValue(null);
      mockPrisma.examAttempt.create.mockResolvedValue({
        id: "attempt-1",
        profileId: "user-1",
        examId: "exam-1",
        status: "IN_PROGRESS",
        mode: "REAL_EXAM",
        startedAt: new Date(),
        submittedAt: null,
        timeSpentSeconds: 0,
      });
      mockPrisma.questionAttempt.create.mockResolvedValue({
        id: "qa-1",
        attemptId: "attempt-1",
        questionId: "q1",
        questionSnapshot: makeQuestionSnapshot(),
      });

      const result = await createAttempt("user-1", "exam-1", "REAL_EXAM");

      expect(result.attempt.id).toBe("attempt-1");
      expect(result.questions).toHaveLength(1);
      expect(mockPrisma.questionAttempt.create).toHaveBeenCalledTimes(1);

      const callData = mockPrisma.questionAttempt.create.mock.calls[0][0].data;
      expect(callData.questionSnapshot).toMatchObject({
        id: "q1",
        text: "What is the capital of France?",
        type: "MULTIPLE_CHOICE",
        points: 1,
      });
    });

    test("prevents duplicate IN_PROGRESS attempts", async () => {
      const exam = makeExam();
      mockPrisma.exam.findUnique.mockResolvedValue(exam);
      mockPrisma.examAttempt.findFirst.mockResolvedValue({
        id: "existing-attempt",
        status: "IN_PROGRESS",
      });

      await expect(
        createAttempt("user-1", "exam-1", "REAL_EXAM"),
      ).rejects.toThrow("An in-progress attempt already exists for this exam");
    });
  });

  describe("saveAnswer", () => {
    test("updates question attempt", async () => {
      mockPrisma.examAttempt.findUnique.mockResolvedValue({
        id: "attempt-1",
        profileId: "user-1",
        status: "IN_PROGRESS",
      });
      mockPrisma.questionAttempt.findFirst.mockResolvedValue({
        id: "qa-1",
        attemptId: "attempt-1",
        questionId: "q1",
      });
      mockPrisma.questionAttempt.update.mockResolvedValue({
        id: "qa-1",
        attemptId: "attempt-1",
        questionId: "q1",
        selectedOptionId: "opt-a",
        textAnswer: null,
      });

      const result = await saveAnswer(
        "attempt-1",
        "user-1",
        "q1",
        "opt-a",
      );

      expect(result.selectedOptionId).toBe("opt-a");
      expect(mockPrisma.questionAttempt.update).toHaveBeenCalled();
    });

    test("rejects if attempt is submitted", async () => {
      mockPrisma.examAttempt.findUnique.mockResolvedValue({
        id: "attempt-1",
        profileId: "user-1",
        status: "SUBMITTED",
      });

      await expect(
        saveAnswer("attempt-1", "user-1", "q1", "opt-a"),
      ).rejects.toThrow("Cannot save answer to a submitted attempt");
    });
  });

  describe("submitAttempt", () => {
    test("grades all questions", async () => {
      const snapshot = makeQuestionSnapshot();
      mockPrisma.examAttempt.findUnique.mockResolvedValue({
        id: "attempt-1",
        profileId: "user-1",
        status: "IN_PROGRESS",
        timeSpentSeconds: 120,
        exam: { negativePoints: 0 },
      });
      mockPrisma.questionAttempt.findMany.mockResolvedValue([
        {
          id: "qa-1",
          attemptId: "attempt-1",
          questionId: "q1",
          selectedOptionId: "opt-a",
          textAnswer: null,
          questionSnapshot: snapshot,
          question: {
            id: "q1",
            number: 1,
            points: 1,
            sectionId: "section-1",
            section: { title: "Section 1" },
          },
        },
      ]);
      mockPrisma.questionAttempt.update.mockResolvedValue({});
      mockPrisma.examAttempt.update.mockResolvedValue({});

      const result = await submitAttempt("attempt-1", "user-1");

      expect(result.totalScore).toBe(1);
      expect(result.totalPossible).toBe(1);
      expect(result.correctCount).toBe(1);
      expect(mockPrisma.questionAttempt.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isCorrect: true, pointsAwarded: 1 }),
        }),
      );
    });

    test("creates mistake records for incorrect answers", async () => {
      const snapshot = makeQuestionSnapshot();
      mockPrisma.examAttempt.findUnique.mockResolvedValue({
        id: "attempt-1",
        profileId: "user-1",
        status: "IN_PROGRESS",
        timeSpentSeconds: 120,
        exam: { negativePoints: 0 },
      });
      mockPrisma.questionAttempt.findMany.mockResolvedValue([
        {
          id: "qa-1",
          attemptId: "attempt-1",
          questionId: "q1",
          selectedOptionId: "opt-b",
          textAnswer: null,
          questionSnapshot: snapshot,
          question: {
            id: "q1",
            number: 1,
            points: 1,
            sectionId: "section-1",
            section: { title: "Section 1" },
          },
        },
      ]);
      mockPrisma.questionAttempt.update.mockResolvedValue({});
      mockPrisma.mistake.create.mockResolvedValue({});
      mockPrisma.examAttempt.update.mockResolvedValue({});

      await submitAttempt("attempt-1", "user-1");

      expect(mockPrisma.mistake.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          questionAttemptId: "qa-1",
          category: "UNKNOWN",
        },
      });
    });

    test("sets status to SUBMITTED", async () => {
      const snapshot = makeQuestionSnapshot();
      mockPrisma.examAttempt.findUnique.mockResolvedValue({
        id: "attempt-1",
        profileId: "user-1",
        status: "IN_PROGRESS",
        timeSpentSeconds: 0,
        exam: { negativePoints: 0 },
      });
      mockPrisma.questionAttempt.findMany.mockResolvedValue([
        {
          id: "qa-1",
          attemptId: "attempt-1",
          questionId: "q1",
          selectedOptionId: "opt-a",
          textAnswer: null,
          questionSnapshot: snapshot,
          question: {
            id: "q1",
            number: 1,
            points: 1,
            sectionId: "section-1",
            section: { title: "Section 1" },
          },
        },
      ]);
      mockPrisma.questionAttempt.update.mockResolvedValue({});
      mockPrisma.examAttempt.update.mockResolvedValue({});

      await submitAttempt("attempt-1", "user-1");

      expect(mockPrisma.examAttempt.update).toHaveBeenCalledWith({
        where: { id: "attempt-1" },
        data: {
          status: "SUBMITTED",
          submittedAt: expect.any(Date),
        },
      });
    });
  });
});
