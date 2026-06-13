import { and, eq, inArray } from "drizzle-orm";
import {
  changeLogs,
  manualOverrides,
  races,
  series,
  sessions,
} from "@/db/schema";
import type { RaceNoteDb } from "@/lib/db";
import {
  chunkD1Values,
  runD1Batch,
  type D1BatchQuery,
} from "@/lib/d1-helpers";
import { mergeScheduleFields } from "@/lib/sync/merge-schedule";
import type {
  NormalizedRace,
  ScheduleEntityType,
  ScheduleFieldValue,
} from "@/lib/sync/types";

export type ScheduleSyncCounts = {
  added: number;
  updated: number;
  skipped: number;
};

function logValue(value: ScheduleFieldValue): string | null {
  return value === null ? null : String(value);
}

function overrideMap(
  rows: Array<{ entityType: ScheduleEntityType; entityId: string; fieldName: string }>,
) {
  const result = new Map<string, Set<string>>();
  for (const row of rows) {
    const key = `${row.entityType}:${row.entityId}`;
    const fields = result.get(key) ?? new Set<string>();
    fields.add(row.fieldName);
    result.set(key, fields);
  }
  return result;
}

export async function applyNormalizedSchedule(
  db: RaceNoteDb,
  incomingRaces: NormalizedRace[],
  now: string,
): Promise<ScheduleSyncCounts> {
  const seriesCode = incomingRaces[0]?.seriesCode;
  if (
    !seriesCode ||
    incomingRaces.some((race) => race.seriesCode !== seriesCode)
  ) {
    throw new Error("Schedule payload must contain one series");
  }
  const sourceKeys = incomingRaces.map((race) => race.sourceKey);
  const sessionSourceKeys = incomingRaces.flatMap((race) =>
    race.sessions.map((session) => session.sourceKey),
  );
  const [seriesRows, existingRaceChunks, existingSessionChunks] = await Promise.all([
    db
      .select({ id: series.id })
      .from(series)
      .where(eq(series.code, seriesCode))
      .limit(1),
    Promise.all(
      chunkD1Values(sourceKeys).map((keys) =>
        db.select().from(races).where(inArray(races.sourceKey, keys)),
      ),
    ),
    Promise.all(
      chunkD1Values(sessionSourceKeys).map((keys) =>
        db.select().from(sessions).where(inArray(sessions.sourceKey, keys)),
      ),
    ),
  ]);
  const existingRaces = existingRaceChunks.flat();
  const existingSessions = existingSessionChunks.flat();
  const seriesId = seriesRows[0]?.id;
  if (!seriesId) throw new Error(`${seriesCode} series row is missing`);

  const entityIds = [
    ...existingRaces.map((race) => race.id),
    ...existingSessions.map((session) => session.id),
  ];
  const overrideChunks = await Promise.all(
    chunkD1Values(entityIds).map((ids) =>
      db
        .select({
          entityType: manualOverrides.entityType,
          entityId: manualOverrides.entityId,
          fieldName: manualOverrides.fieldName,
        })
        .from(manualOverrides)
        .where(inArray(manualOverrides.entityId, ids)),
    ),
  );
  const overrides = overrideChunks.flat();
  const protectedFields = overrideMap(overrides);
  const racesBySource = new Map(existingRaces.map((race) => [race.sourceKey, race]));
  const sessionsBySource = new Map(
    existingSessions.map((session) => [session.sourceKey, session]),
  );
  const counts: ScheduleSyncCounts = { added: 0, updated: 0, skipped: 0 };
  const queries: D1BatchQuery[] = [];

  for (const incoming of incomingRaces) {
      let raceId: string;
      const existingRace = racesBySource.get(incoming.sourceKey);
      if (!existingRace) {
        raceId = crypto.randomUUID();
        queries.push(db.insert(races).values({
          id: raceId,
          seriesId,
          sourceKey: incoming.sourceKey,
          season: incoming.season,
          round: incoming.round,
          name: incoming.name,
          slug: incoming.slug,
          country: incoming.country,
          location: incoming.location,
          venueName: incoming.venueName,
          startDate: incoming.startDate,
          endDate: incoming.endDate,
          timezone: incoming.timezone,
          status: "scheduled",
          publishStatus: "draft",
          needsReview: true,
          createdAt: now,
          updatedAt: now,
        }));
        counts.added += 1;
      } else {
        raceId = existingRace.id;
        const decision = mergeScheduleFields({
          entityType: "race",
          entityId: raceId,
          current: {
            season: existingRace.season,
            round: existingRace.round,
            name: existingRace.name,
            slug: existingRace.slug,
            country: existingRace.country,
            location: existingRace.location,
            venueName: existingRace.venueName,
            startDate: existingRace.startDate,
            endDate: existingRace.endDate,
            timezone: existingRace.timezone,
          },
          incoming: {
            season: incoming.season,
            round: incoming.round,
            name: incoming.name,
            slug: incoming.slug,
            country: incoming.country,
            location: incoming.location,
            venueName: incoming.venueName,
            startDate: incoming.startDate,
            endDate: incoming.endDate,
            timezone: incoming.timezone,
          },
          protectedFields:
            protectedFields.get(`race:${raceId}`) ?? new Set<string>(),
        });
        if (decision.needsReview) {
          queries.push(db
            .update(races)
            .set({ ...decision.patch, needsReview: true, updatedAt: now })
            .where(eq(races.id, raceId)));
          counts.updated += 1;
        }
        counts.skipped += decision.skippedCount;
        for (const change of decision.changes) {
          queries.push(db.insert(changeLogs).values({
            id: crypto.randomUUID(),
            ...change,
            oldValue: logValue(change.oldValue),
            newValue: logValue(change.newValue),
            createdAt: now,
          }));
        }
      }

      for (const incomingSession of incoming.sessions) {
        const existingSession = sessionsBySource.get(incomingSession.sourceKey);
        if (!existingSession) {
          queries.push(db.insert(sessions).values({
            id: crypto.randomUUID(),
            raceId,
            ...incomingSession,
            isMustWatch: false,
            importanceLevel: incomingSession.type === "race" ? 3 : 1,
            needsReview: true,
            createdAt: now,
            updatedAt: now,
          }));
          counts.added += 1;
          continue;
        }

        const decision = mergeScheduleFields({
          entityType: "session",
          entityId: existingSession.id,
          current: {
            name: existingSession.name,
            type: existingSession.type,
            startTimeUtc: existingSession.startTimeUtc,
          },
          incoming: {
            name: incomingSession.name,
            type: incomingSession.type,
            startTimeUtc: incomingSession.startTimeUtc,
          },
          protectedFields:
            protectedFields.get(`session:${existingSession.id}`) ??
            new Set<string>(),
        });
        if (decision.needsReview) {
          queries.push(db
            .update(sessions)
            .set({ ...decision.patch, needsReview: true, updatedAt: now })
            .where(
              and(
                eq(sessions.id, existingSession.id),
                eq(sessions.raceId, raceId),
              ),
            ));
          counts.updated += 1;
        }
        counts.skipped += decision.skippedCount;
        for (const change of decision.changes) {
          queries.push(db.insert(changeLogs).values({
            id: crypto.randomUUID(),
            ...change,
            oldValue: logValue(change.oldValue),
            newValue: logValue(change.newValue),
            createdAt: now,
          }));
        }
      }
  }

  await runD1Batch(db, queries);

  return counts;
}
