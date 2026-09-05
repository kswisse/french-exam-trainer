import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getImports } from "@/features/imports/services/import";
import { ImportList } from "@/features/imports/components/import-list";

export default async function ImportsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const imports = await getImports("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Imported Exams</h1>
        <p className="text-muted-foreground">
          Review and approve extracted exam content.
        </p>
      </div>
      <ImportList imports={imports as any} />
    </div>
  );
}
