import { describe, test, expect, vi, beforeEach } from "vitest";
import { extractTextFromPDF } from "@/lib/pdf/extractor";
import { extractTextFromImage } from "@/lib/pdf/ocr";
import { ParsedExamSchema } from "@/lib/validation/schemas";

vi.mock("pdf-parse", () => ({
  default: vi.fn(),
}));

vi.mock("tesseract.js", () => ({
  default: {
    recognize: vi.fn(),
  },
}));

describe("PDF extraction", () => {
  let mockPdfParse: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const pdfParse = await import("pdf-parse");
    mockPdfParse = vi.mocked(pdfParse.default);
  });

  test("extracts text from text-based PDF", async () => {
    mockPdfParse.mockResolvedValue({
      text: "This is a sample PDF text with enough content to be considered selectable.",
      numpages: 5,
      numrender: 5,
      info: {},
      metadata: null,
      version: "1.10.100",
    });

    const buffer = Buffer.from("fake pdf content");
    const result = await extractTextFromPDF(buffer);

    expect(result.text).toContain("This is a sample PDF text");
    expect(result.pageCount).toBe(5);
    expect(result.hasSelectableText).toBe(true);
    expect(result.pages).toHaveLength(5);
    expect(result.pages[0].pageNumber).toBe(1);
  });

  test("detects low text content", async () => {
    mockPdfParse.mockResolvedValue({
      text: "Short",
      numpages: 1,
      numrender: 1,
      info: {},
      metadata: null,
      version: "1.10.100",
    });

    const buffer = Buffer.from("fake pdf content");
    const result = await extractTextFromPDF(buffer);

    expect(result.hasSelectableText).toBe(false);
    expect(result.text).toBe("Short");
  });

  test("handles invalid PDF gracefully", async () => {
    mockPdfParse.mockRejectedValue(new Error("Invalid PDF"));

    const buffer = Buffer.from("not a pdf");
    await expect(extractTextFromPDF(buffer)).rejects.toThrow("Invalid PDF");
  });
});

describe("OCR extraction", () => {
  let mockTesseract: { recognize: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();
    const tesseract = await import("tesseract.js");
    mockTesseract = vi.mocked(tesseract.default);
  });

  test("extracts text from image", async () => {
    mockTesseract.recognize.mockResolvedValue({
      data: {
        text: "Bonjour, ceci est un test d'OCR en français.",
        confidence: 85.5,
      },
    });

    const buffer = Buffer.from("fake image content");
    const result = await extractTextFromImage(buffer);

    expect(result.text).toContain("Bonjour");
    expect(result.confidence).toBeCloseTo(0.855, 2);
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].pageNumber).toBe(1);
  });

  test("returns confidence score", async () => {
    mockTesseract.recognize.mockResolvedValue({
      data: {
        text: "Test confidence",
        confidence: 92.3,
      },
    });

    const buffer = Buffer.from("fake image content");
    const result = await extractTextFromImage(buffer);

    expect(result.confidence).toBeCloseTo(0.923, 2);
    expect(result.pages[0].confidence).toBeCloseTo(0.923, 2);
  });
});

describe("AI exam parser", () => {
  test("validates correct JSON structure", () => {
    const validExam = {
      title: "DELF B2 - Examen blanc",
      type: "DELF B2",
      year: 2024,
      timeLimitMinutes: 120,
      totalPoints: 50,
      sections: [
        {
          title: "Compréhension écrite",
          instructions: "Lisez les textes et répondez aux questions.",
          passages: [
            {
              title: "Texte 1",
              content: "Le climat en France change considérablement...",
              type: "READING_TEXT",
            },
          ],
          questions: [
            {
              number: 1,
              type: "MULTIPLE_CHOICE",
              text: "Quel est le sujet principal du texte?",
              instructions: "Choisissez la bonne réponse.",
              passageIndex: 0,
              options: [
                { label: "A", text: "Le climat" },
                { label: "B", text: "L'économie" },
                { label: "C", text: "La politique" },
              ],
              correctAnswer: "A",
              points: 2,
              difficulty: "B2",
            },
          ],
        },
      ],
    };

    const result = ParsedExamSchema.safeParse(validExam);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error("Validation failed");
    expect(result.data.title).toBe("DELF B2 - Examen blanc");
    expect(result.data.sections).toHaveLength(1);
    expect(result.data.sections[0].questions).toHaveLength(1);
  });

  test("rejects malformed JSON", () => {
    const malformed = { title: 123, sections: "not an array" };
    const result = ParsedExamSchema.safeParse(malformed);
    expect(result.success).toBe(false);
  });

  test("rejects missing required fields", () => {
    const missingTitle = { sections: [] };
    const result = ParsedExamSchema.safeParse(missingTitle);
    expect(result.success).toBe(false);
  });

  test("handles missing answer key gracefully", () => {
    const noAnswer = {
      title: "Test",
      sections: [
        {
          title: "Section 1",
          questions: [
            {
              number: 1,
              type: "MULTIPLE_CHOICE",
              text: "Question?",
              options: [
                { label: "A", text: "Option A" },
                { label: "B", text: "Option B" },
              ],
            },
          ],
        },
      ],
    };

    const result = ParsedExamSchema.safeParse(noAnswer);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error("Validation failed");
    expect(result.data.sections[0].questions[0].correctAnswer).toBeUndefined();
  });

  test("validates question types against enum", () => {
    const invalidType = {
      title: "Test",
      sections: [
        {
          title: "Section 1",
          questions: [
            {
              number: 1,
              type: "INVALID_TYPE",
              text: "Question?",
            },
          ],
        },
      ],
    };

    const result = ParsedExamSchema.safeParse(invalidType);
    expect(result.success).toBe(false);
  });
});
