import type { ContentImport, Document } from "@/generated/prisma/client";
import type { ParsedExam } from "@/lib/validation/schemas";

export type ImportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "APPROVED" | "REJECTED" | "FAILED";

export type ImportStepStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "N_A";

export interface ImportWithDocument extends ContentImport {
  document: Document;
}

export interface ImportDetail extends ImportWithDocument {
  parsedExam: ParsedExam | null;
}

export interface UploadResult {
  document: Document;
  contentImport: ContentImport;
}

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_TEXT"
  | "FILL_BLANK"
  | "MATCHING"
  | "WRITING";

export interface ExtractedQuestion {
  number: number;
  type: QuestionType;
  text: string;
  instructions?: string;
  passageIndex?: number;
  options?: Array<{ label: string; text: string }>;
  correctAnswer?: string | string[];
  points?: number;
  difficulty?: string;
  confidence?: number;
}

export interface ExtractedSection {
  title: string;
  instructions?: string;
  passages?: Array<{
    title?: string;
    content: string;
    type: string;
  }>;
  questions: ExtractedQuestion[];
}
