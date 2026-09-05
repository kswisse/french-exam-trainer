import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getImports } from "@/features/imports/services/import";

export async function GET() {
  try {
    const user = await requireAdmin();
    const imports = await getImports(user.id);
    return NextResponse.json(imports);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch imports";
    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
        ? 403
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
