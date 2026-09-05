import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-lg font-semibold text-foreground">
            French Exam Trainer
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/exams"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Exams
            </Link>
            <Link
              href="/question-bank"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Question Bank
            </Link>
            <span className="text-sm text-muted-foreground">
              {user.displayName ?? user.email}
            </span>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
