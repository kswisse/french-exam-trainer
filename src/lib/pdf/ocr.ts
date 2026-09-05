import Tesseract from "tesseract.js";

export interface OCRResult {
  text: string;
  confidence: number;
  pages: Array<{ pageNumber: number; text: string; confidence: number }>;
}

export async function extractTextFromImage(
  imageBuffer: Buffer
): Promise<OCRResult> {
  const result = await Tesseract.recognize(imageBuffer, "fra+eng");
  return {
    text: result.data.text,
    confidence: result.data.confidence / 100,
    pages: [
      {
        pageNumber: 1,
        text: result.data.text,
        confidence: result.data.confidence / 100,
      },
    ],
  };
}

export async function extractTextFromScannedPDF(
  buffer: Buffer,
  pageCount: number
): Promise<OCRResult> {
  throw new Error(
    "Scanned PDF OCR not implemented in V1. Use text-based PDF or images."
  );
}
