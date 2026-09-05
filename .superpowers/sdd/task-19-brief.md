# T19: PDF Extraction & OCR

**Goal:** Implement PDF text extraction with OCR fallback for scanned documents.

**Files to create:**
```
french-exam-trainer/
├── src/
│   └── lib/
│       └── pdf/
│           ├── extractor.ts          # extractTextFromPDF
│           └── ocr.ts                # extractTextFromImage
```

**`src/lib/pdf/extractor.ts`:**
```ts
import pdfParse from "pdf-parse";

export interface ExtractionResult {
  text: string;
  pageCount: number;
  hasSelectableText: boolean;
  pages: Array<{ pageNumber: number; text: string }>;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<ExtractionResult> {
  const data = await pdfParse(buffer);
  const pages = data.numpages > 0
    ? Array.from({ length: data.numpages }, (_, i) => ({ pageNumber: i + 1, text: "" }))
    : [];

  // pdf-parse doesn't give per-page text directly in v1
  // For V1, treat entire document as one text block
  const hasSelectableText = data.text.trim().length > 50;

  return {
    text: data.text,
    pageCount: data.numpages,
    hasSelectableText,
    pages,
  };
}
```

**`src/lib/pdf/ocr.ts`:**
```ts
import Tesseract from "tesseract.js";

export interface OCRResult {
  text: string;
  confidence: number;
  pages: Array<{ pageNumber: number; text: string; confidence: number }>;
}

export async function extractTextFromImage(imageBuffer: Buffer): Promise<OCRResult> {
  const result = await Tesseract.recognize(imageBuffer, "fra+eng");
  return {
    text: result.data.text,
    confidence: result.data.confidence / 100,
    pages: [{ pageNumber: 1, text: result.data.text, confidence: result.data.confidence / 100 }],
  };
}

export async function extractTextFromScannedPDF(buffer: Buffer, pageCount: number): Promise<OCRResult> {
  throw new Error("Scanned PDF OCR not implemented in V1. Use text-based PDF or images.");
}
```

**Integration with ContentImport pipeline:**
```ts
export async function processExtraction(importId: string) {
  // 1. Fetch ContentImport + Document
  // 2. Download file from Supabase Storage
  // 3. If PDF: extractTextFromPDF
  //    If image: extractTextFromImage
  // 4. Update ContentImport: extractionStatus = COMPLETED
  // 5. Store extracted text (in ContentImport or separate)
  // 6. If no selectable text and PDF: set ocrStatus = RUNNING, attempt OCR
}
```

**Tests (`tests/unit/import-parsing.test.ts`):**
```ts
describe("PDF extraction", () => {
  test("extracts text from text-based PDF")
  test("detects low text content")
  test("handles invalid PDF gracefully")
});

describe("OCR extraction", () => {
  test("extracts text from image")
  test("returns confidence score")
});
```

**Acceptance criteria:**
- Text-based PDF extraction works
- Image OCR works with French text
- Low text detection triggers OCR path
- Invalid PDF handled gracefully
- Extraction result stored in ContentImport

**Dependencies:** T02, T18.
