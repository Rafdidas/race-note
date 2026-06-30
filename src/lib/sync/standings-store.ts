import { and, eq, inArray } from "drizzle-orm";
import { constructorStandings, driverStandings } from "@/db/schema";
import type { RaceNoteDb } from "@/lib/db";
import { chunkD1Values, runD1Batch, type D1BatchQuery } from "@/lib/d1-helpers";
import type { NormalizedStanding } from "@/lib/sync/types";

async function upsert(
  db: RaceNoteDb,
  table: typeof driverStandings | typeof constructorStandings,
  idColumn: typeof driverStandings.driverId | typeof constructorStandings.constructorId,
  idField: "driverId" | "constructorId",
  season: number,
  rows: NormalizedStanding[],
  now: string,
): Promise<number> {
  if (rows.length === 0) return 0;
  const ids = rows.map((row) => row.id);
  const existingChunks = await Promise.all(
    chunkD1Values(ids).map((chunk) =>
      db
        .select({ id: idColumn })
        .from(table)
        .where(and(eq(table.season, season), inArray(idColumn, chunk))),
    ),
  );
  const existing = new Set(existingChunks.flat().map((r) => r.id));
  const queries: D1BatchQuery[] = [];
  for (const row of rows) {
    if (existing.has(row.id)) {
      queries.push(
        db
          .update(table)
          .set({ position: row.position, points: row.points, wins: row.wins, updatedAt: now })
          .where(and(eq(table.season, season), eq(idColumn, row.id))),
      );
    } else {
      queries.push(
        db.insert(table).values({
          id: crypto.randomUUID(),
          season,
          [idField]: row.id,
          position: row.position,
          points: row.points,
          wins: row.wins,
          updatedAt: now,
        }),
      );
    }
  }
  await runD1Batch(db, queries);
  return rows.length;
}

export function upsertDriverStandings(
  db: RaceNoteDb,
  season: number,
  rows: NormalizedStanding[],
  now: string,
): Promise<number> {
  return upsert(db, driverStandings, driverStandings.driverId, "driverId", season, rows, now);
}

export function upsertConstructorStandings(
  db: RaceNoteDb,
  season: number,
  rows: NormalizedStanding[],
  now: string,
): Promise<number> {
  return upsert(
    db,
    constructorStandings,
    constructorStandings.constructorId,
    "constructorId",
    season,
    rows,
    now,
  );
}
