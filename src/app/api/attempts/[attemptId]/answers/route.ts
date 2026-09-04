import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { saveAnswer } from "@/features/exams/services/attempt";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const user = await requireUser();
    const { attemptId } = await params;
    const body = await request.json();
    const { questionId, selectedOptionId, textAnswer } = body;

    if (!questionId) {
      return apiError(400, "questionId is required");
    }

    const result = await saveAnswer(
      attemptId,
      user.id,
      questionId,
      selectedOptionId,
      textAnswer,
    );

    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Unauthorized") {
      return apiError(401, message);
    }
    if (message.includes("not found")) {
      return apiError(404, message);
    }
    if (message.includes("submitted") || message.includes("not in progress")) {
      return apiError(400, message);
    }
    return apiError(500, message);
  }
}
