import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { approveImport } from "@/features/imports/services/import";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ importId: string }> }
) {
  try {
    const user = await requireAdmin();
    const { importId } = await params;
    const exam = await approveImport(importId, user.id);
    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to approve import";
    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
        ? 403
        : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
