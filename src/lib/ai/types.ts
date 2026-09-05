import type { ParsedExam } from "@/lib/validation/schemas";

export interface AIProvider {
  parseExam(text: string, context: ParseContext): Promise<ParsedExam>;
  classifyMistake(params: ClassifyMistakeParams): Promise<MistakeClassification>;
  explainQuestion(params: ExplainQuestionParams): Promise<Explanation>;
}

export interface ParseContext {
  filename: string;
  pageCount?: number;
  language?: string;
}

export interface ClassifyMistakeParams {
  questionText: string;
  options?: Array<{ label: string; text: string }>;
  correctAnswer: string;
  userAnswer: string;
  skills?: string[];
}

export interface MistakeClassification {
  category: string;
  confidence: number;
  explanation?: string;
}

export interface ExplainQuestionParams {
  questionText: string;
  options?: Array<{ label: string; text: string }>;
  correctAnswer: string;
  userAnswer: string;
  skills?: string[];
}

export interface Explanation {
  whyCorrect: string;
  whyIncorrect: string;
  frenchContext: string;
  takeaway: string;
}
