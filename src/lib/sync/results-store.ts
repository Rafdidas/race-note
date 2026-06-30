import { eq, inArray } from "drizzle-orm";
import { raceResults, races } from "@/db/schema";
import type { RaceNoteDb } from "@/lib/db";
import { chunkD1Values, runD1Batch, type D1BatchQuery } from "@/lib/d1-helpers";
import type { NormalizedRaceResult } from "@/lib/sync/types";

export async function upsertRaceResults(
  db: RaceNoteDb,
  rows: NormalizedRaceResult[],
  now: string,
): Promise<number> {
  if (rows.length === 0) return 0;
  const first = rows[0];
  const raceSourceKey = `jolpica:f1:${first.season}:${first.round}`;
  const raceRow = await db
    .select({ id: races.id })
    .from(races)
    .where(eq(races.sourceKey, raceSourceKey))
    .limit(1);
  const raceId = raceRow[0]?.id;
  if (!raceId) return 0;

  const sourceKeys = rows.map((row) => row.sourceKey);
  const existingChunks = await Promise.all(
    chunkD1Values(sourceKeys).map((chunk) =>
      db.select({ sourceKey: raceResults.sourceKey }).from(raceResults).where(inArray(raceResults.sourceKey, chunk)),
    ),
  );
  const existing = new Set(existingChunks.flat().map((r) => r.sourceKey));
  const queries: D1BatchQuery[] = [];
  for (const row of rows) {
    const values = {
      raceId,
      season: row.season,
      sessionType: "race",
      position: row.position,
      driverId: row.driverId,
      driverName: row.driverName,
      teamId: row.teamId,
      teamName: row.teamName,
      gridPosition: row.gridPosition,
      timeOrGap: row.timeOrGap,
      points: row.points,
      status: row.status,
      sourceKey: row.sourceKey,
      updatedAt: now,
    };
    if (existing.has(row.sourceKey)) {
      queries.push(db.update(raceResults).set(values).where(eq(raceResults.sourceKey, row.sourceKey)));
    } else {
      queries.push(db.insert(raceResults).values({ id: crypto.randomUUID(), createdAt: now, ...values }));
    }
  }
  await runD1Batch(db, queries);
  return rows.length;
}
