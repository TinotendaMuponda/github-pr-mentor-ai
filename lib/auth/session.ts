import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS
} from "@/lib/auth/constants";
import {
  createSessionCookieValue,
  randomBase64Url,
  verifySessionCookieValue
} from "@/lib/auth/crypto";
import { getSessionSecret } from "@/lib/auth/env";

export async function createUserSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const sessionId = `session_${randomBase64Url(18)}`;
  const sessionCookie = createSessionCookieValue(sessionId, getSessionSecret());

  await prisma.userSession.create({
    data: {
      id: sessionId,
      userId,
      tokenHash: sessionCookie.tokenHash,
      expiresAt
    }
  });

  return {
    cookieValue: sessionCookie.cookieValue,
    expiresAt
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const verified = verifySessionCookieValue(
    cookieStore.get(SESSION_COOKIE_NAME)?.value,
    getSessionSecret()
  );

  if (!verified) {
    return null;
  }

  const session = await prisma.userSession.findFirst({
    where: {
      id: verified.sessionId,
      tokenHash: verified.tokenHash,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  });

  if (!session) {
    return null;
  }

  await prisma.userSession.update({
    where: {
      id: session.id
    },
    data: {
      lastSeenAt: new Date()
    }
  });

  return session.user;
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const verified = verifySessionCookieValue(
    cookieStore.get(SESSION_COOKIE_NAME)?.value,
    getSessionSecret()
  );

  if (!verified) {
    return;
  }

  await prisma.userSession.deleteMany({
    where: {
      id: verified.sessionId,
      tokenHash: verified.tokenHash
    }
  });
}
