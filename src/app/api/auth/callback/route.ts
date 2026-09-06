import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, displayName } = body;

    if (!userId || !email || typeof userId !== "string" || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (userId.length > 100 || email.length > 200) {
      return NextResponse.json({ error: "Payload too long" }, { status: 400 });
    }

    await prisma.profile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: email,
        displayName: typeof displayName === "string" ? displayName : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!next.startsWith("/") || next.includes("://")) {
    return NextResponse.redirect(`${origin}/login?error=invalid_redirect`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await prisma.profile.upsert({
          where: { id: user.id },
          update: {},
          create: {
            id: user.id,
            email: user.email!,
            displayName:
              (user.user_metadata?.display_name as string) ||
              (user.user_metadata?.name as string) ||
              null,
          },
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
