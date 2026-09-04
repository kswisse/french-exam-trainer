import type { QuestionSnapshot, ScoringConfig, GradeResult, ExamResult, SectionResult, QuestionResult } from "@/types/scoring";

const DEFAULT_CONFIG: ScoringConfig = {
  points: 1,
  negativePoints: 0,
};

function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeText(
  text: string,
  options: { trimWhitespace?: boolean; caseInsensitive?: boolean; removeAccents?: boolean } = {},
): string {
  const { trimWhitespace = true, caseInsensitive = true, removeAccents: doRemoveAccents = true } = options;
  let result = text;
  if (trimWhitespace) result = result.trim();
  if (caseInsensitive) result = result.toLowerCase();
  if (doRemoveAccents) result = removeAccents(result);
  return result;
}

function normalizeWithRules(text: string, rules?: Record<string, boolean>): string {
  const trimWhitespace = rules?.trimWhitespace ?? true;
  const caseInsensitive = rules?.caseInsensitive ?? true;
  const shouldRemoveAccents = rules?.removeAccents ?? true;
  return normalizeText(text, { trimWhitespace, caseInsensitive, removeAccents: shouldRemoveAccents });
}

export function gradeAnswer(
  snapshot: QuestionSnapshot,
  selectedOptionId: string | undefined | null,
  textAnswer: string | undefined | null,
  config: ScoringConfig = DEFAULT_CONFIG,
): GradeResult {
  switch (snapshot.type) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE": {
      const correctOption = snapshot.options.find((o) => o.isCorrect);
      if (!correctOption) {
        return { isCorrect: false, pointsAwarded: 0 };
      }
      const isCorrect = selectedOptionId === correctOption.id;
      const penalty = config.negativePoints > 0 ? -config.negativePoints : 0;
      return {
        isCorrect,
        pointsAwarded: isCorrect ? config.points : penalty,
      };
    }

    case "SHORT_TEXT": {
      const penalty = config.negativePoints > 0 ? -config.negativePoints : 0;
      if (!textAnswer) {
        return { isCorrect: false, pointsAwarded: penalty };
      }
      const normalizedInput = normalizeText(textAnswer);
      const isCorrect = snapshot.answers.some(
        (answer) => answer.isAcceptable && normalizeWithRules(answer.text, answer.normalizationRule) === normalizedInput,
      );
      return {
        isCorrect,
        pointsAwarded: isCorrect ? config.points : penalty,
      };
    }

    case "FILL_BLANK": {
      const penalty = config.negativePoints > 0 ? -config.negativePoints : 0;
      if (!textAnswer) {
        return { isCorrect: false, pointsAwarded: penalty };
      }
      const userBlanks: string[] = JSON.parse(textAnswer);
      const isCorrect = userBlanks.every((userAnswer, index) => {
        const blankPrefix = `blank_${index + 1}:`;
        const acceptableAnswers = snapshot.answers.filter(
          (a) => a.text.startsWith(blankPrefix) && a.isAcceptable,
        );
        const normalizedUser = normalizeText(userAnswer);
        return acceptableAnswers.some(
          (a) => normalizeWithRules(a.text.slice(blankPrefix.length), a.normalizationRule) === normalizedUser,
        );
      });
      return {
        isCorrect,
        pointsAwarded: isCorrect ? config.points : penalty,
      };
    }

    case "MATCHING": {
      const penalty = config.negativePoints > 0 ? -config.negativePoints : 0;
      if (!textAnswer) {
        return { isCorrect: false, pointsAwarded: penalty };
      }
      const userPairs: Record<string, string> = JSON.parse(textAnswer);
      const correctAnswer = snapshot.answers.find((a) => a.isAcceptable);
      if (!correctAnswer) {
        return { isCorrect: false, pointsAwarded: 0 };
      }
      const expectedPairs: Record<string, string> = JSON.parse(correctAnswer.text);
      const isCorrect = Object.keys(expectedPairs).every(
        (key) => normalizeText(userPairs[key]) === normalizeText(expectedPairs[key]),
      );
      return {
        isCorrect,
        pointsAwarded: isCorrect ? config.points : penalty,
      };
    }

    case "WRITING":
      return { isCorrect: null, pointsAwarded: 0 };
  }
}

interface QuestionInput {
  questionId: string;
  questionNumber: number;
  isCorrect: boolean | null;
  pointsAwarded: number;
  points: number;
  selectedOptionId?: string;
  textAnswer?: string;
  sectionId: string;
  sectionTitle: string;
}

export function calculateTotalPossible(questions: Array<{ points: number }>): number {
  return questions.reduce((sum, q) => sum + q.points, 0);
}

export function calculateExamResult(
  questions: QuestionInput[],
  timeSpentSeconds: number,
): ExamResult {
  const totalScore = questions.reduce((sum, q) => sum + q.pointsAwarded, 0);
  const totalPossible = calculateTotalPossible(questions);

  const correctCount = questions.filter((q) => q.isCorrect === true).length;
  const incorrectCount = questions.filter((q) => q.isCorrect === false).length;
  const unansweredCount = questions.filter((q) => q.isCorrect === null).length;

  const attemptedCount = correctCount + incorrectCount;
  const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
  const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

  // Build section results
  const sectionMap = new Map<string, { sectionId: string; sectionTitle: string; score: number; totalPossible: number }>();
  for (const q of questions) {
    if (!sectionMap.has(q.sectionId)) {
      sectionMap.set(q.sectionId, {
        sectionId: q.sectionId,
        sectionTitle: q.sectionTitle,
        score: 0,
        totalPossible: 0,
      });
    }
    const section = sectionMap.get(q.sectionId)!;
    section.score += q.pointsAwarded;
    section.totalPossible += q.points;
  }

  const sectionResults: SectionResult[] = Array.from(sectionMap.values()).map((s) => ({
    ...s,
    percentage: s.totalPossible > 0 ? (s.score / s.totalPossible) * 100 : 0,
  }));

  const questionResults: QuestionResult[] = questions.map((q) => ({
    questionId: q.questionId,
    questionNumber: q.questionNumber,
    isCorrect: q.isCorrect,
    pointsAwarded: q.pointsAwarded,
    selectedOptionId: q.selectedOptionId,
    textAnswer: q.textAnswer,
  }));

  return {
    totalScore,
    totalPossible,
    percentage,
    timeSpentSeconds,
    sectionResults,
    questionResults,
    correctCount,
    incorrectCount,
    unansweredCount,
    accuracy,
  };
}
