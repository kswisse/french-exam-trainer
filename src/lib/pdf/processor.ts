import { prisma } from "@/lib/db";
import { getFileUrl } from "@/lib/storage";
import { extractTextFromPDF } from "./extractor";
import { extractTextFromImage } from "./ocr";

export async function processExtraction(importId: string) {
  // 1. Fetch ContentImport + Document
  const contentImport = await prisma.contentImport.findUnique({
    where: { id: importId },
    include: { document: true },
  });

  if (!contentImport) {
    throw new Error(`ContentImport not found: ${importId}`);
  }

  const { document } = contentImport;

  // 2. Update status to RUNNING
  await prisma.contentImport.update({
    where: { id: importId },
    data: { extractionStatus: "RUNNING" },
  });

  try {
    // 3. Download file from Supabase Storage
    const signedUrl = await getFileUrl(document.storagePath);
    if (!signedUrl) {
      throw new Error(`Could not get signed URL for: ${document.storagePath}`);
    }

    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    // 4. Extract text based on file type
    let extractedText: string;
    let pageCount = document.pageCount || 1;

    if (document.mimeType === "application/pdf") {
      const result = await extractTextFromPDF(buffer);
      extractedText = result.text;
      pageCount = result.pageCount;

      // If no selectable text, trigger OCR path
      if (!result.hasSelectableText) {
        await prisma.contentImport.update({
          where: { id: importId },
          data: { ocrStatus: "RUNNING" },
        });
        // V1: Scanned PDF OCR not implemented, mark as FAILED
        await prisma.contentImport.update({
          where: { id: importId },
          data: {
            ocrStatus: "FAILED",
            warnings: ["Scanned PDF OCR not supported in V1"],
          },
        });
      }
    } else if (document.mimeType.startsWith("image/")) {
      const result = await extractTextFromImage(buffer);
      extractedText = result.text;
      pageCount = 1;
    } else {
      throw new Error(`Unsupported file type: ${document.mimeType}`);
    }

    // 5. Update ContentImport with results
    await prisma.contentImport.update({
      where: { id: importId },
      data: {
        extractionStatus: "COMPLETED",
        parserVersion: "1.0.0",
      },
    });

    // 6. Update Document page count
    await prisma.document.update({
      where: { id: document.id },
      data: { pageCount, processingStatus: "COMPLETED" },
    });

    return { extractedText, pageCount };
  } catch (error) {
    // Update status to FAILED
    await prisma.contentImport.update({
      where: { id: importId },
      data: {
        extractionStatus: "FAILED",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
    });
    throw error;
  }
}
