# T20: AI Exam Parser

**Goal:** Implement AI provider abstraction and exam parsing with Zod validation.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── lib/
│   │   └── ai/
│   │       ├── types.ts              # AIProvider interface
│   │       ├── provider.ts           # getAIProvider()
│   │       └── gemini.ts             # Gemini implementation
│   ├── services/
│   │   └── exam-parser.ts            # parseExamWithAI
│   └── lib/
│       └── validation/
│           └── schemas.ts            # ParsedExamSchema (Zod)
```

**`src/lib/ai/types.ts`:**
```ts
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
```

**`src/lib/validation/schemas.ts`:**
```ts
import { z } from "zod";

export const ParsedExamSchema = z.object({
  title: z.string(),
  type: z.string().optional(),
  year: z.number().optional(),
  timeLimitMinutes: z.number().optional(),
  totalPoints: z.number().optional(),
  sections: z.array(z.object({
    title: z.string(),
    instructions: z.string().optional(),
    passages: z.array(z.object({
      title: z.string().optional(),
      content: z.string(),
      type: z.enum(["READING_TEXT", "AUDIO_TRANSCRIPT", "IMAGE", "OTHER"]),
    })).optional(),
    questions: z.array(z.object({
      number: z.number(),
      type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT", "FILL_BLANK", "MATCHING", "WRITING"]),
      text: z.string(),
      instructions: z.string().optional(),
      passageIndex: z.number().optional(),
      options: z.array(z.object({
        label: z.string(),
        text: z.string(),
      })).optional(),
      correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
      points: z.number().optional(),
      difficulty: z.string().optional(),
    })),
  })),
});

export type ParsedExam = z.infer<typeof ParsedExamSchema>;
```

**`src/lib/ai/gemini.ts`:**
```ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type AIProvider, type ParseContext, type ClassifyMistakeParams, type MistakeClassification, type ExplainQuestionParams, type Explanation } from "./types";
import { ParsedExamSchema, type ParsedExam } from "@/lib/validation/schemas";

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  }

  async parseExam(text: string, context: ParseContext): Promise<ParsedExam> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `You are an expert French exam parser. Extract the following exam into structured JSON.
Return ONLY valid JSON matching this schema: ${JSON.stringify(ParsedExamSchema.shape)}`;

    const result = await model.generateContent([prompt, text]);
    const response = result.response.text();
    const parsed = JSON.parse(response);
    return ParsedExamSchema.parse(parsed);
  }

  async classifyMistake(params: ClassifyMistakeParams): Promise<MistakeClassification> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Classify this French exam mistake. Return JSON: { "category": "...", "confidence": 0-1, "explanation": "..." }`;
    const result = await model.generateContent([prompt, JSON.stringify(params)]);
    const response = result.response.text();
    return JSON.parse(response);
  }

  async explainQuestion(params: ExplainQuestionParams): Promise<Explanation> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Explain this French exam question. Return JSON: { "whyCorrect": "...", "whyIncorrect": "...", "frenchContext": "...", "takeaway": "..." }`;
    const result = await model.generateContent([prompt, JSON.stringify(params)]);
    const response = result.response.text();
    return JSON.parse(response);
  }
}
```

**`src/lib/ai/provider.ts`:**
```ts
import { GeminiProvider } from "./gemini";
import type { AIProvider } from "./types";

let provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!provider) {
    provider = new GeminiProvider();
  }
  return provider;
}
```

**`src/services/exam-parser.ts`:**
```ts
import { prisma } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";

export async function parseExamWithAI(importId: string) {
  const contentImport = await prisma.contentImport.findUnique({
    where: { id: importId },
    include: { document: true },
  });
  if (!contentImport) throw new Error("ContentImport not found");

  const ai = getAIProvider();
  const parsed = await ai.parseExam(
    contentImport.extractedText || "",
    { filename: contentImport.document.filename }
  );

  await prisma.contentImport.update({
    where: { id: importId },
    data: { aiParsingStatus: "COMPLETED" },
  });

  return parsed;
}
```

**Tests (`tests/unit/import-parsing.test.ts`):**
```ts
describe("AI exam parser", () => {
  test("validates correct JSON structure")
  test("rejects malformed JSON")
  test("rejects missing required fields")
  test("handles missing answer key gracefully")
  test("validates question types against enum")
});
```

**Acceptance criteria:**
- AIProvider interface implemented by GeminiProvider
- Zod validation catches malformed output
- parseExam returns structured ParsedExam
- Classification returns category + confidence
- Explanation returns 4 sections
- Provider is swappable via config

**Dependencies:** T02.
