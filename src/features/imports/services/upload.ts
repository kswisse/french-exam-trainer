import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import path from "path";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function uploadDocument(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed."
    );
  }

  if (file.size > MAX_SIZE) {
    throw new Error("File size exceeds 50MB limit.");
  }

  const safeFilename = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `uploads/${Date.now()}-${safeFilename}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadFile(buffer, storagePath, file.type);

  const document = await prisma.document.create({
    data: {
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      storagePath,
    },
  });

  const contentImport = await prisma.contentImport.create({
    data: {
      documentId: document.id,
    },
  });

  return { document, contentImport };
}
