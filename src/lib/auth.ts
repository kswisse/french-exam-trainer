import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";

function sanitizeDisplayName(
  name: string | null | undefined
): string | null {
  if (!name || typeof name !== "string") return null;
  const trimmed = name.trim().replace(/<[^>]*>/g, "");
  return trimmed.length > 0 ? trimmed.slice(0, 100) : null;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  return prisma.profile.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email,
      displayName: sanitizeDisplayName(
        (user.user_metadata?.display_name as string) ||
          (user.user_metadata?.name as string)
      ),
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}
