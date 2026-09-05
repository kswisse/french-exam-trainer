export interface UploadResult {
  document: {
    id: string;
    filename: string;
    mimeType: string;
    storagePath: string;
    fileSize: number;
    processingStatus: string;
    uploadedAt: Date;
  };
  contentImport: {
    id: string;
    documentId: string;
    extractionStatus: string;
    ocrStatus: string;
    aiParsingStatus: string;
    createdAt: Date;
  };
}
