import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { raceFacts, raceHistory, raceWatchTargets, races } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { runD1Batch } from "@/lib/d1-helpers";
import type {
  RaceFactsInput,
  RaceHistoryInput,
  WatchTargetInput,
} from "@/lib/admin-race-mutations";

async function requireRace(raceId: string) {
  const db = await getDb();
  const rows = await db
    .select({ id: races.id })
    .from(races)
    .where(eq(races.id, raceId))
    .limit(1);
  if (!rows[0]) {
    throw new Error("Race not found");
  }
  return db;
}

export async function saveAdminRaceFacts(
  raceId: string,
  input: RaceFactsInput,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const now = new Date().toISOString();
  await runD1Batch(db, [
    db
      .insert(raceFacts)
      .values({ id: crypto.randomUUID(), raceId, ...input, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: raceFacts.raceId,
        set: { ...input, updatedAt: now },
      }),
  ]);
}

export async function createAdminRaceHistory(
  raceId: string,
  input: RaceHistoryInput,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const now = new Date().toISOString();
  await runD1Batch(db, [
    db.insert(raceHistory).values({
      id: crypto.randomUUID(),
      raceId,
      ...input,
      createdAt: now,
      updatedAt: now,
    }),
  ]);
}

export async function deleteAdminRaceHistory(
  raceId: string,
  historyId: string,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  await runD1Batch(db, [
    db
      .delete(raceHistory)
      .where(and(eq(raceHistory.id, historyId), eq(raceHistory.raceId, raceId))),
  ]);
}

export async function createAdminWatchTarget(
  raceId: string,
  input: WatchTargetInput,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const existing = await db
    .select({ displayOrder: raceWatchTargets.displayOrder })
    .from(raceWatchTargets)
    .where(eq(raceWatchTargets.raceId, raceId))
    .orderBy(asc(raceWatchTargets.displayOrder));
  const nextOrder =
    existing.length === 0
      ? 1
      : Math.max(...existing.map((row) => row.displayOrder)) + 1;
  const now = new Date().toISOString();
  await runD1Batch(db, [
    db.insert(raceWatchTargets).values({
      id: crypto.randomUUID(),
      raceId,
      targetType: input.targetType,
      targetId: null,
      targetName: input.targetName,
      title: input.title,
      reason: input.reason,
      displayOrder: nextOrder,
      createdAt: now,
      updatedAt: now,
    }),
  ]);
}

export async function deleteAdminWatchTarget(
  raceId: string,
  targetId: string,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  await runD1Batch(db, [
    db
      .delete(raceWatchTargets)
      .where(and(eq(raceWatchTargets.id, targetId), eq(raceWatchTargets.raceId, raceId))),
  ]);
}

export async function reorderAdminWatchTarget(
  raceId: string,
  targetId: string,
  direction: "up" | "down",
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const rows = await db
    .select({ id: raceWatchTargets.id, displayOrder: raceWatchTargets.displayOrder })
    .from(raceWatchTargets)
    .where(eq(raceWatchTargets.raceId, raceId))
    .orderBy(asc(raceWatchTargets.displayOrder));
  const index = rows.findIndex((row) => row.id === targetId);
  if (index === -1) throw new Error("Watch target not found");
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= rows.length) return;

  const current = rows[index];
  const neighbor = rows[swapIndex];
  const now = new Date().toISOString();
  await runD1Batch(db, [
    db
      .update(raceWatchTargets)
      .set({ displayOrder: neighbor.displayOrder, updatedAt: now })
      .where(and(eq(raceWatchTargets.id, current.id), eq(raceWatchTargets.raceId, raceId))),
    db
      .update(raceWatchTargets)
      .set({ displayOrder: current.displayOrder, updatedAt: now })
      .where(and(eq(raceWatchTargets.id, neighbor.id), eq(raceWatchTargets.raceId, raceId))),
  ]);
}
