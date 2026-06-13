import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { adminSessions } from "@/db/schema";
import {
  createAdminSessionToken,
  hashAdminSessionToken,
  isAdminSessionExpired,
  verifyAdminPassword,
} from "@/lib/admin-auth-crypto";
import { getDb } from "@/lib/db";

export const ADMIN_SESSION_COOKIE = "racenote-admin-session";
const ADMIN_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

type AdminSecrets = {
  password: string;
  sessionSecret: string;
};

function getAdminSecrets(): AdminSecrets {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!password || !sessionSecret) {
    throw new Error("Admin authentication is not configured.");
  }

  return { password, sessionSecret };
}

export async function isValidAdminPassword(password: string): Promise<boolean> {
  const secrets = getAdminSecrets();
  return verifyAdminPassword(password, secrets.password, secrets.sessionSecret);
}

export async function createAdminSession(): Promise<void> {
  const { sessionSecret } = getAdminSecrets();
  const rawToken = createAdminSessionToken();
  const sessionToken = await hashAdminSessionToken(rawToken, sessionSecret);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_SESSION_DURATION_MS);
  const db = await getDb();

  await db.insert(adminSessions).values({
    id: crypto.randomUUID(),
    sessionToken,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, rawToken, {
    expires: expiresAt,
    httpOnly: true,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export const hasAdminSession = cache(async (): Promise<boolean> => {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!rawToken) {
    return false;
  }

  const { sessionSecret } = getAdminSecrets();
  const sessionToken = await hashAdminSessionToken(rawToken, sessionSecret);
  const db = await getDb();
  const rows = await db
    .select({
      id: adminSessions.id,
      expiresAt: adminSessions.expiresAt,
    })
    .from(adminSessions)
    .where(eq(adminSessions.sessionToken, sessionToken))
    .limit(1);
  const session = rows[0];

  if (!session) {
    return false;
  }

  if (isAdminSessionExpired(session.expiresAt)) {
    await db.delete(adminSessions).where(eq(adminSessions.id, session.id));
    return false;
  }

  return true;
});

export async function requireAdminSession(): Promise<void> {
  if (!(await hasAdminSession())) {
    throw new Error("Unauthorized");
  }
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (rawToken) {
    const { sessionSecret } = getAdminSecrets();
    const sessionToken = await hashAdminSessionToken(rawToken, sessionSecret);
    const db = await getDb();
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.sessionToken, sessionToken));
  }
}
