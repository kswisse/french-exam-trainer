import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const user = await requireUser();
    const { attemptId } = await params;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        questions: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!attempt) {
      return apiError(404, "Attempt not found");
    }

    if (attempt.profileId !== user.id) {
      return apiError(403, "Unauthorized");
    }

    return apiSuccess(attempt);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Unauthorized") {
      return apiError(401, message);
    }
    return apiError(500, message);
  }
}
