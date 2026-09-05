# T18: Document Upload & Storage

**Goal:** Implement file upload to Supabase Storage with validation.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── lib/
│   │   └── storage.ts               # Supabase storage client
│   ├── features/
│   │   └── imports/
│   │       ├── services/
│   │       │   └── upload.ts         # uploadDocument
│   │       └── types.ts
│   └── app/
│       └── api/
│           └── imports/
│               └── upload/
│                   └── route.ts      # POST /api/imports/upload
```

**`src/lib/storage.ts`:**
```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadFile(buffer: Buffer, path: string, contentType: string) {
  const { data, error } = await supabase.storage
    .from("exam-documents")
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw error;
  return data;
}

export async function getFileUrl(path: string) {
  const { data } = await supabase.storage.from("exam-documents").createSignedUrl(path, 3600);
  return data?.signedUrl;
}
```

**`src/features/imports/services/upload.ts`:**
```ts
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/storage";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function uploadDocument(file: File, profileId: string) {
  // 1. Validate file type: PDF, JPG, JPEG, PNG
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.");
  }
  // 2. Validate file size: < 50MB
  if (file.size > MAX_SIZE) {
    throw new Error("File size exceeds 50MB limit.");
  }
  // 3. Generate storage path: `{profileId}/{timestamp}-{filename}`
  const path = `${profileId}/${Date.now()}-${file.name}`;
  // 4. Upload to Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadFile(buffer, path, file.type);
  // 5. Create Document record in DB
  const document = await prisma.document.create({
    data: {
      userId: profileId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      storagePath: path,
    },
  });
  // 6. Create ContentImport record
  const contentImport = await prisma.contentImport.create({
    data: {
      documentId: document.id,
      status: "PENDING",
    },
  });
  // 7. Return Document + ContentImport
  return { document, contentImport };
}
```

**`POST /api/imports/upload`:**
```ts
// Multipart form data
// Auth: requireAdmin
// Validates file type and size
// Uploads to storage
// Creates Document + ContentImport
// Returns created records
```

**Tests:** None.

**Acceptance criteria:**
- PDF upload works
- Image upload works
- File size validation (reject > 50MB)
- File type validation (reject non-PDF/image)
- Document record created
- ContentImport record created
- File accessible via Supabase Storage

**Dependencies:** T02, T04.
