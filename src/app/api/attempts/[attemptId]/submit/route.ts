import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { submitAttempt } from "@/features/exams/services/attempt";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const user = await requireUser();
    const { attemptId } = await params;
    const result = await submitAttempt(attemptId, user.id);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Unauthorized") {
      return apiError(401, message);
    }
    if (message.includes("not found")) {
      return apiError(404, message);
    }
    if (message.includes("not in progress") || message.includes("submitted")) {
      return apiError(400, message);
    }
    return apiError(500, message);
  }
}
