import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export async function getAuthUser() {
  const user = await getCurrentUser();
  if (!user)
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  return { error: null, user };
}

export function apiError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
