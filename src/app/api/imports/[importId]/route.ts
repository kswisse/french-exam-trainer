import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getImportDetail } from "@/features/imports/services/import";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ importId: string }> }
) {
  try {
    const user = await requireAdmin();
    const { importId } = await params;
    const importData = await getImportDetail(importId, user.id);

    if (!importData) {
      return NextResponse.json({ error: "Import not found" }, { status: 404 });
    }

    return NextResponse.json(importData);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch import";
    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
        ? 403
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
