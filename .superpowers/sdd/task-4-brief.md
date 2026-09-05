# T04: Authentication & Middleware

**Goal:** Implement Supabase auth with login/register, middleware protection, and Profile creation.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── lib/
│   │   ├── supabase-server.ts
│   │   ├── supabase-client.ts
│   │   ├── supabase-middleware.ts
│   │   └── auth.ts
│   ├── middleware.ts
│   └── app/
│       ├── (auth)/
│       │   ├── layout.tsx
│       │   ├── login/
│       │   │   └── page.tsx
│       │   └── register/
│       │       └── page.tsx
│       └── api/
│           └── auth/
│               └── callback/
│                   └── route.ts
```

**`src/lib/supabase-server.ts`:** Follow simplefeedback pattern:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch {}
        },
      },
    }
  );
}
```

**`src/lib/supabase-client.ts`:**
```ts
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
```

**`src/lib/supabase-middleware.ts`:** Follow simplefeedback pattern — refresh session, protect `/dashboard`, `/admin`, `/api/attempts`, `/api/exams` routes.

**`src/lib/auth.ts`:**
```ts
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.profile.findUnique({ where: { id: user.id } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}
```

**`src/middleware.ts`:**
```ts
import { updateSession } from "@/lib/supabase-middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

**Profile creation:** On first login, create Profile record. Implement in auth callback route or via database trigger.

**API auth helper (for later tasks):**
```ts
// src/lib/api-utils.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export async function getAuthUser() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  return { error: null, user };
}

export function apiError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
```

**Tests:** None (manual testing with Supabase dashboard).

**Acceptance criteria:**
- Login page renders and submits to Supabase
- Register page creates Supabase user + Profile record
- Middleware redirects unauthenticated users from `/dashboard/*` to `/login`
- `getCurrentUser()` returns Profile for authenticated users
- `requireAdmin()` throws for non-admin users

**Dependencies:** T01, T02.
