import { prisma } from "@/lib/db";
import { extractTextFromPDF } from "@/lib/pdf/extractor";
import { extractTextFromImage } from "@/lib/pdf/ocr";
import { parseExamWithAI } from "@/services/exam-parser";
import { getFileUrl } from "@/lib/storage";

export type PipelineStep = "extraction" | "ocr" | "ai_parsing";

export async function runImportPipeline(importId: string) {
  await prisma.contentImport.update({
    where: { id: importId },
    data: { status: "PROCESSING" },
  });

  // Step 1: Extraction
  await updateImportStep(importId, "extraction", "RUNNING");
  let extraction;
  try {
    extraction = await extractText(importId);
    await updateImportStep(importId, "extraction", "COMPLETED");
  } catch (error: any) {
    await updateImportStep(importId, "extraction", "FAILED", error.message);
    await prisma.contentImport.update({
      where: { id: importId },
      data: { status: "FAILED" },
    });
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
      await prisma.contentImport.update({
        where: { id: importId },
        data: { status: "FAILED" },
      });
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
    await prisma.contentImport.update({
      where: { id: importId },
      data: { status: "FAILED" },
    });
    return;
  }

  // Pipeline complete
  await prisma.contentImport.update({
    where: { id: importId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
}

export async function retryFailedStep(importId: string) {
  const contentImport = await prisma.contentImport.findUnique({
    where: { id: importId },
  });
  if (!contentImport) throw new Error("Import not found");

  // Determine which step to retry based on failure state
  if (contentImport.extractionStatus === "FAILED") {
    await runImportPipeline(importId);
  } else if (contentImport.aiParsingStatus === "FAILED") {
    // Resume from AI parsing
    await updateImportStep(importId, "ai_parsing", "PENDING");
    await prisma.contentImport.update({
      where: { id: importId },
      data: { status: "PROCESSING" },
    });

    await updateImportStep(importId, "ai_parsing", "RUNNING");
    try {
      await parseExamWithAI(importId);
      await updateImportStep(importId, "ai_parsing", "COMPLETED");
    } catch (error: any) {
      await updateImportStep(importId, "ai_parsing", "FAILED", error.message);
      await prisma.contentImport.update({
        where: { id: importId },
        data: { status: "FAILED" },
      });
      return;
    }

    await prisma.contentImport.update({
      where: { id: importId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  } else {
    throw new Error("No failed step to retry");
  }
}

async function updateImportStep(
  importId: string,
  step: string,
  status: string,
  error?: string
) {
  const data: Record<string, any> = {};
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
  if (!url) throw new Error("Failed to get file URL");

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to download document");

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
