# T22: Import Pipeline Orchestration

**Goal:** Wire together the complete import pipeline: upload → extract → AI parse → review → approve.

**Files to create/modify:**
```
french-exam-trainer/
├── src/
│   └── features/
│       └── imports/
│           ├── services/
│           │   └── pipeline.ts       # runImportPipeline
│           └── components/
│               ├── upload-zone.tsx    # Drag & drop upload
│               └── import-progress.tsx # Progress indicator
```

**`src/features/imports/services/pipeline.ts`:**
```ts
import { prisma } from "@/lib/db";
import { extractTextFromPDF } from "@/lib/pdf/extractor";
import { extractTextFromImage } from "@/lib/pdf/ocr";
import { parseExamWithAI } from "@/services/exam-parser";
import { getFileUrl } from "@/lib/storage";

export async function runImportPipeline(importId: string) {
  // Step 1: Extraction
  await updateImportStep(importId, "extraction", "RUNNING");
  let extraction;
  try {
    extraction = await extractText(importId);
    await updateImportStep(importId, "extraction", "COMPLETED");
  } catch (error: any) {
    await updateImportStep(importId, "extraction", "FAILED", error.message);
    return;
  }

  // Step 1b: OCR (if needed)
  if (extraction && !extraction.hasSelectableText) {
    await updateImportStep(importId, "ocr", "RUNNING");
    try {
      await runOCR(importId);
      await updateImportStep(importId, "ocr", "COMPLETED");
    } catch (error: any) {
      await updateImportStep(importId, "ocr", "FAILED", error.message);
      return;
    }
  }

  // Step 2: AI Parsing
  await updateImportStep(importId, "ai_parsing", "RUNNING");
  try {
    await parseExamWithAI(importId);
    await updateImportStep(importId, "ai_parsing", "COMPLETED");
  } catch (error: any) {
    await updateImportStep(importId, "ai_parsing", "FAILED", error.message);
    return;
  }

  // Pipeline complete — import ready for review
  await prisma.contentImport.update({
    where: { id: importId },
    data: { status: "COMPLETED" },
  });
}

async function updateImportStep(importId: string, step: string, status: string, error?: string) {
  // Update the appropriate step field on ContentImport
  const data: any = {};
  data[`${step}Status`] = status;
  if (error) data[`${step}Error`] = error;
  await prisma.contentImport.update({ where: { id: importId }, data });
}

async function extractText(importId: string) {
  const contentImport = await prisma.contentImport.findUnique({
    where: { id: importId },
    include: { document: true },
  });
  if (!contentImport) throw new Error("Import not found");

  const url = await getFileUrl(contentImport.document.storagePath);
  const response = await fetch(url!);
  const buffer = Buffer.from(await response.arrayBuffer());

  const result = await extractTextFromPDF(buffer);

  await prisma.contentImport.update({
    where: { id: importId },
    data: { extractedText: result.text },
  });

  return result;
}

async function runOCR(importId: string) {
  // For V1, OCR on scanned PDFs is not supported
  throw new Error("Scanned PDF OCR not implemented in V1");
}
```

**`upload-zone.tsx`:**
- Drag & drop area
- Click to browse
- File type validation (PDF, JPG, JPEG, PNG)
- File size validation (< 50MB)
- Upload progress indicator
- Success/error feedback

**`import-progress.tsx`:**
- Step 1: Text Extraction — status indicator
- Step 1b: OCR — status indicator (shown if needed)
- Step 2: AI Parsing — status indicator
- Step 3: Ready for Review — status indicator
- Each step shows: pending, running (spinner), completed (check), failed (X)

**Tests:** None (integration).

**Acceptance criteria:**
- Upload triggers pipeline automatically
- Pipeline runs steps sequentially
- Failed step stops pipeline
- Retry re-runs only failed step
- Progress indicator updates in real-time
- Import ready for review after pipeline completes
- Admin can approve from review page

**Dependencies:** T18, T19, T20, T21.
