# T02: Prisma Schema & Database Setup

**Goal:** Define the complete database schema and generate the Prisma client.

**Files to create:**
```
french-exam-trainer/
├── prisma/
│   ├── schema.prisma
│   └── config.ts
└── src/
    └── lib/
        └── db.ts          # Prisma client singleton
```

**`prisma/schema.prisma`:** Copy the complete schema from spec Section 4, including all 16 models, 10 enums, all indexes, and all cascade annotations. Key points:

```prisma
generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// All 16 models from spec Section 4.1-4.3
// All 10 enums from spec Section 4.4
// All @@index directives
// All cascade comments as documentation
```

**Important cascade rules to implement in Prisma:**
- Profile → ExamAttempt: `onDelete: Cascade`
- Profile → Mistake: `onDelete: Cascade`
- Exam → ExamSection: `onDelete: Cascade`
- Exam → ExamAttempt: `onDelete: Cascade`
- Exam → ExamSource: `onDelete: Cascade`
- Exam → ContentImport: `onDelete: Cascade`
- ExamSection → Passage: `onDelete: Cascade`
- ExamSection → Question: `onDelete: Cascade`
- Passage → Question: `onDelete: Restrict`
- Question → QuestionOption: `onDelete: Cascade`
- Question → QuestionAnswer: `onDelete: Cascade`
- Question → QuestionSkill: `onDelete: Cascade`
- Question → QuestionVersion: `onDelete: Cascade`
- Question → QuestionAttempt: `onDelete: Restrict`
- QuestionOption → QuestionAttempt: `onDelete: Restrict`
- ExamAttempt → QuestionAttempt: `onDelete: Cascade`
- QuestionAttempt → Mistake: `onDelete: Cascade`
- Document → ContentImport: `onDelete: Cascade`
- Document → ExamSource: `onDelete: Cascade`
- Skill → children: `onDelete: SetNull`
- Skill → QuestionSkill: `onDelete: Restrict`

**`prisma/config.ts`:**
```ts
import { defineConfig } from "prisma/config";
export default defineConfig({ earlyAccess: true, schema: "prisma/schema.prisma" });
```

**`src/lib/db.ts`:** Follow simplefeedback pattern exactly:
```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**After creating schema, run:**
```bash
npx prisma generate
npx prisma db push
```

**Tests:** None (schema only).

**Acceptance criteria:**
- `npx prisma generate` succeeds
- `npx prisma db push` applies to database
- `src/generated/prisma/client` exports all models and enums
- TypeScript imports from `@/generated/prisma/client` work

**Dependencies:** T01.
