import pdfParse from "pdf-parse";

export interface ExtractionResult {
  text: string;
  pageCount: number;
  hasSelectableText: boolean;
  pages: Array<{ pageNumber: number; text: string }>;
}

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<ExtractionResult> {
  const data = await pdfParse(buffer);
  const pages =
    data.numpages > 0
      ? Array.from({ length: data.numpages }, (_, i) => ({
          pageNumber: i + 1,
          text: "",
        }))
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
