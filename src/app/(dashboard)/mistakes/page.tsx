import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMistakes } from "@/features/exams/services/mistakes";
import { MistakesPage } from "@/features/exams/components/mistakes-page";

export default async function MistakesPageWrapper({
  searchParams,
}: {
  searchParams: { category?: string; skillId?: string; page?: string };
}) {
  const user = await requireUser();
  
  const skills = await prisma.skill.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const page = parseInt(searchParams.page || "1");
  const filters = {
    category: searchParams.category,
    skillId: searchParams.skillId,
    page,
    limit: 20,
  };

  const { mistakes, total, limit } = await getMistakes(user.id, filters);

  return (
    <MistakesPage
      skills={skills}
      mistakes={mistakes}
      total={total}
      page={page}
      limit={limit}
      filters={{
        category: searchParams.category || "all",
        skillId: searchParams.skillId || "all",
      }}
    />
  );
}