import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-lg font-semibold text-foreground">
            Admin Panel
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin/imports"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Imports
            </Link>
            <Link
              href="/admin/exams"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Exams
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to App
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
