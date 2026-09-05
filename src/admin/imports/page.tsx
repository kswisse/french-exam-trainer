import { getImports } from "@/features/imports/services/import";
import { ImportList } from "@/features/imports/components/import-list";

export default async function AdminImportsPage() {
  const imports = await getImports("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Imports</h1>
        <p className="text-muted-foreground">
          Review, approve, or reject imported exam content.
        </p>
      </div>
      <ImportList imports={imports as any} />
    </div>
  );
}
