import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getAppUrl } from "@/lib/auth/env";
import { deleteCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  await deleteCurrentSession();

  const response = NextResponse.redirect(new URL("/", getAppUrl()));
  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}
