import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";

export default async function AdminExamsPage() {
  const exams = await prisma.exam.findMany({
    include: {
      sections: {
        include: { questions: true },
      },
      sources: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Exams</h1>
        <p className="text-muted-foreground">
          View and manage all exams in the system.
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">No exams yet</h2>
          <p className="mt-2 text-muted-foreground">
            Approve an import to create an exam.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const totalQuestions = exam.sections.reduce(
              (acc, s) => acc + s.questions.length,
              0
            );
            return (
              <Card
                key={exam.id}
                className="transition-colors hover:bg-muted/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.sections.length} sections, {totalQuestions}{" "}
                        questions · {exam.status}
                      </p>
                    </div>
                    <Link href={`/exams/${exam.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
