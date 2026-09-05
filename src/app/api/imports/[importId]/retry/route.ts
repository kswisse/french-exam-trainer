import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { retryImport } from "@/features/imports/services/import";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ importId: string }> }
) {
  try {
    const user = await requireAdmin();
    const { importId } = await params;
    const result = await retryImport(importId);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to retry import";
    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
        ? 403
        : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
