import { prisma } from "@/lib/db";
import type { ParsedExam } from "@/lib/validation/schemas";

export async function getImports(profileId: string) {
  return prisma.contentImport.findMany({
    include: { document: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getImportDetail(importId: string, profileId: string) {
  const contentImport = await prisma.contentImport.findUnique({
    where: { id: importId },
    include: { document: true },
  });

  if (!contentImport) return null;

  let parsedExam: ParsedExam | null = null;
  if (contentImport.extractedText) {
    try {
      parsedExam = JSON.parse(contentImport.extractedText) as ParsedExam;
    } catch {
      parsedExam = null;
    }
  }

  return { ...contentImport, parsedExam };
}

export async function approveImport(importId: string, profileId: string) {
  const contentImport = await prisma.contentImport.findUnique({
    where: { id: importId },
    include: { document: true },
  });
  if (!contentImport) throw new Error("Import not found");
  if (contentImport.status === "APPROVED") throw new Error("Import already approved");
  if (!contentImport.extractedText) throw new Error("No parsed data available");

  const parsed = JSON.parse(contentImport.extractedText) as ParsedExam;

  const exam = await prisma.exam.create({
    data: {
      title: parsed.title,
      type: parsed.type,
      year: parsed.year,
      timeLimitMinutes: parsed.timeLimitMinutes,
      totalPoints: parsed.totalPoints,
      mode: "BOTH",
      status: "PUBLISHED",
    },
  });

  for (let i = 0; i < parsed.sections.length; i++) {
    const sectionData = parsed.sections[i];
    const section = await prisma.examSection.create({
      data: {
        examId: exam.id,
        title: sectionData.title,
        instructions: sectionData.instructions,
        order: i + 1,
      },
    });

    for (const q of sectionData.questions) {
      const question = await prisma.question.create({
        data: {
          sectionId: section.id,
          text: q.text,
          instructions: q.instructions,
          type: q.type as any,
          number: q.number,
          order: q.number,
          points: q.points || 1,
          difficulty: q.difficulty || "MEDIUM",
        },
      });

      if (q.options) {
        await prisma.questionOption.createMany({
          data: q.options.map((o) => ({
            questionId: question.id,
            label: o.label,
            text: o.text,
            isCorrect:
              typeof q.correctAnswer === "string"
                ? o.label === q.correctAnswer
                : Array.isArray(q.correctAnswer)
                  ? q.correctAnswer.includes(o.label)
                  : false,
          })),
        });
      }
    }
  }

  await prisma.examSource.create({
    data: {
      examId: exam.id,
      documentId: contentImport.documentId,
      originalFilename: contentImport.document.filename,
    },
  });

  await prisma.contentImport.update({
    where: { id: importId },
    data: { status: "APPROVED", examId: exam.id },
  });

  return exam;
}

export async function rejectImport(
  importId: string,
  profileId: string,
  reason?: string
) {
  const contentImport = await prisma.contentImport.findUnique({
    where: { id: importId },
  });
  if (!contentImport) throw new Error("Import not found");
  if (contentImport.status === "APPROVED") throw new Error("Cannot reject approved import");

  const updateData: any = { status: "REJECTED" };
  if (reason) {
    const warnings = (contentImport.warnings as string[]) || [];
    warnings.push(`Rejected: ${reason}`);
    updateData.warnings = warnings;
  }

  return prisma.contentImport.update({
    where: { id: importId },
    data: updateData,
  });
}

export async function retryImport(importId: string) {
  const contentImport = await prisma.contentImport.findUnique({
    where: { id: importId },
  });
  if (!contentImport) throw new Error("Import not found");
  if (contentImport.status === "APPROVED") throw new Error("Cannot retry approved import");

  return prisma.contentImport.update({
    where: { id: importId },
    data: {
      status: "PENDING",
      extractionStatus: "PENDING",
      aiParsingStatus: "PENDING",
    },
  });
}
