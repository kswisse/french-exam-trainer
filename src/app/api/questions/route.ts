import { NextRequest } from "next/server";
import { getAuthUser, apiError, apiSuccess } from "@/lib/api-utils";
import { getQuestionBank } from "@/features/questions/services/question-bank";
import { type QuestionType } from "@/generated/prisma/browser";

export async function GET(request: NextRequest) {
  const { error, user } = await getAuthUser();
  if (error) return error;

  const { searchParams } = request.nextUrl;

  const examId = searchParams.get("examId") ?? undefined;
  const sectionId = searchParams.get("sectionId") ?? undefined;
  const skillId = searchParams.get("skillId") ?? undefined;
  const type = (searchParams.get("type") as QuestionType) ?? undefined;
  const difficulty = searchParams.get("difficulty") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const page = searchParams.get("page")
    ? Number(searchParams.get("page"))
    : undefined;
  const limit = searchParams.get("limit")
    ? Number(searchParams.get("limit"))
    : undefined;

  const result = await getQuestionBank({
    examId,
    sectionId,
    skillId,
    type,
    difficulty,
    search,
    page,
    limit,
  });

  return apiSuccess(result);
}
