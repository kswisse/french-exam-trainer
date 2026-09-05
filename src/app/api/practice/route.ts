import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { createPracticeSession, createMistakePracticeSession } from "@/features/practice/services/practice";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { questionCount = 10, skillId, difficulty, type, mode } = body;

    if (mode === "MISTAKES") {
      const result = await createMistakePracticeSession(user.id, questionCount);
      return apiSuccess(result, 201);
    }

    const result = await createPracticeSession(user.id, {
      questionCount,
      skillId,
      difficulty,
      type,
    });
    return apiSuccess(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Unauthorized") {
      return apiError(401, message);
    }
    return apiError(500, message);
  }
}
