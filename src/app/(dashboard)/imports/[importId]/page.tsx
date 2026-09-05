import { requireAdmin } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getImportDetail } from "@/features/imports/services/import";
import { ImportReview } from "@/features/imports/components/import-review";

export default async function ImportDetailPage({
  params,
}: {
  params: Promise<{ importId: string }>;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const { importId } = await params;
  const importData = await getImportDetail(importId, "");

  if (!importData) {
    notFound();
  }

  return <ImportReview importData={importData as any} />;
}
