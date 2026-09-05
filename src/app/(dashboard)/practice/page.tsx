import { prisma } from "@/lib/db";
import { PracticeSetup } from "@/features/practice/components/practice-setup";

export default async function PracticePage() {
  const skills = await prisma.skill.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
    },
  });

  return <PracticeSetup skills={skills} />;
}
