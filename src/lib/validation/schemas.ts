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
