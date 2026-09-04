import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { createAttempt } from "@/features/exams/services/attempt";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { examId, mode } = body;

    if (!examId || !mode) {
      return apiError(400, "examId and mode are required");
    }

    if (mode !== "REAL_EXAM" && mode !== "PRACTICE") {
      return apiError(400, "mode must be REAL_EXAM or PRACTICE");
    }

    const result = await createAttempt(user.id, examId, mode);
    return apiSuccess(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Unauthorized") {
      return apiError(401, message);
    }
    if (message.includes("not found") || message.includes("not published") || message.includes("does not support")) {
      return apiError(404, message);
    }
    if (message.includes("already exists")) {
      return apiError(409, message);
    }
    return apiError(500, message);
  }
}
