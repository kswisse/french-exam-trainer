import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, displayName } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: "userId and email are required" },
        { status: 400 }
      );
    }

    await prisma.profile.upsert({
      where: { id: userId },
      update: { displayName },
      create: {
        id: userId,
        email,
        displayName: displayName || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
