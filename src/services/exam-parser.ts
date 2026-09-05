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
    data: {
      aiParsingStatus: "COMPLETED",
      extractedText: JSON.stringify(parsed),
    },
  });

  return parsed;
}
