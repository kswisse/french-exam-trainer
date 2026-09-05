# T01: Project Scaffolding & Dependencies

**Goal:** Create the Next.js project with all dependencies installed and configured.

**Files to create:**
```
french-exam-trainer/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── .env.local
├── .env.example
├── .gitignore
├── eslint.config.mjs
└── src/
    └── app/
        ├── layout.tsx
        ├── page.tsx
        └── globals.css
```

**Dependencies (package.json):**
```json
{
  "name": "french-exam-trainer",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed/seed.ts"
  },
  "dependencies": {
    "next": "16.2.11",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@prisma/adapter-pg": "^7.9.0",
    "@prisma/client": "^7.9.0",
    "@supabase/ssr": "^0.12.3",
    "@supabase/supabase-js": "^2.110.8",
    "zod": "^4.4.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.6.0",
    "lucide-react": "^1.26.0",
    "date-fns": "^4.4.0",
    "pdf-parse": "^1.1.1",
    "tesseract.js": "^5.1.1",
    "@google/generative-ai": "^0.21.0"
  },
  "devDependencies": {
    "prisma": "^7.9.0",
    "tsx": "^4.23.1",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "16.2.11",
    "vitest": "^4.1.10",
    "pg": "^8.22.0",
    "@types/pg": "^8.20.0"
  },
  "prisma": {
    "seed": "tsx prisma/seed/seed.ts"
  }
}
```

**Config files:**

`next.config.ts`:
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "pdf-parse", "tesseract.js"],
};
export default nextConfig;
```

`postcss.config.mjs`:
```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "prisma/seed"]
}
```

`.env.example`:
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_AI_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**`src/app/globals.css`:**
```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}

:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --primary: #1e40af;
  --primary-foreground: #ffffff;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #1e40af;
  --destructive: #dc2626;
  --accent: #f5f5f5;
  --accent-foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --popover: #ffffff;
  --popover-foreground: #0a0a0a;
  --success: #16a34a;
  --warning: #d97706;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --primary: #3b82f6;
  --primary-foreground: #0a0a0a;
  --muted: #262626;
  --muted-foreground: #a3a3a3;
  --border: #262626;
  --input: #262626;
  --ring: #3b82f6;
  --destructive: #ef4444;
  --accent: #262626;
  --accent-foreground: #fafafa;
  --card: #171717;
  --card-foreground: #fafafa;
  --popover: #171717;
  --popover-foreground: #fafafa;
  --success: #22c55e;
  --warning: #f59e0b;
}
```

**`src/app/layout.tsx`:**
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "French Exam Trainer",
  description: "Practice French exams with AI-powered analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

**`src/app/page.tsx`:** Simple landing page with redirect to dashboard.

**Authorization:** None needed for scaffolding.

**Tests:** None for scaffolding.

**Acceptance criteria:**
- `npm run dev` starts without errors
- `npm run build` completes without errors
- TypeScript compiles without errors
- Tailwind CSS works (verified by background color in browser)

**Dependencies:** None (first task).
