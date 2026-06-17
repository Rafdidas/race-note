import { cache } from "react";
import { asc, desc, eq, inArray } from "drizzle-orm";
import {
  aiContentDrafts,
  raceContents,
  raceFacts,
  raceHistory,
  raceWatchTargets,
  races,
  series,
  sessions,
  syncLogs,
  syncSources,
} from "@/db/schema";
import {
  adminRaces as mockAdminRaces,
  recentLogs as mockRecentLogs,
  syncSources as mockSyncSources,
} from "@/data/mock-admin";
import { getDb } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAdminRuntime } from "@/lib/admin-runtime";
import {
  buildAdminReviewQueue,
  mapAdminRace,
  mapAdminSyncOverview,
} from "@/lib/admin-data-format";
import type {
  AdminRace,
  AdminRaceRow,
  AdminSessionRow,
  AdminSyncLogRow,
  AdminSyncOverview,
  AdminSyncSourceRow,
} from "@/types/admin-data";

async function getAdminRaceRows(id?: string) {
  const db = await getDb();
  const raceRows = await db
    .select({
      id: races.id,
      name: races.name,
      country: races.country,
      location: races.location,
      startDate: races.startDate,
      endDate: races.endDate,
      publishStatus: races.publishStatus,
      needsReview: races.needsReview,
      seriesCode: series.code,
      summary: raceContents.mustWatchReason,
      summaryThreeLines: raceContents.summaryThreeLines,
      beginnerNote: raceContents.beginnerRules,
      variables: raceContents.raceVariables,
      keyDriversOrTeams: raceContents.keyDriversOrTeams,
      notificationText: raceContents.notificationText,
      seoTitle: raceContents.seoTitle,
      seoDescription: raceContents.seoDescription,
      aiStatus: raceContents.aiStatus,
      draftStatus: aiContentDrafts.status,
      draftModel: aiContentDrafts.model,
      draftErrorMessage: aiContentDrafts.errorMessage,
      draftGeneratedAt: aiContentDrafts.generatedAt,
      draftSummaryThreeLines: aiContentDrafts.summaryThreeLines,
      draftKeyDriversOrTeams: aiContentDrafts.keyDriversOrTeams,
      draftRaceVariables: aiContentDrafts.raceVariables,
      draftBeginnerRules: aiContentDrafts.beginnerRules,
      draftMustWatchReason: aiContentDrafts.mustWatchReason,
      draftNotificationText: aiContentDrafts.notificationText,
      draftSeoTitle: aiContentDrafts.seoTitle,
      draftSeoDescription: aiContentDrafts.seoDescription,
    })
    .from(races)
    .innerJoin(series, eq(races.seriesId, series.id))
    .leftJoin(raceContents, eq(raceContents.raceId, races.id))
    .leftJoin(aiContentDrafts, eq(aiContentDrafts.raceId, races.id))
    .where(id ? eq(races.id, id) : undefined)
    .orderBy(asc(races.startDate));

  const raceIds = raceRows.map((race) => race.id);
  const sessionRows =
    raceIds.length === 0
      ? []
      : await db
          .select({
            id: sessions.id,
            raceId: sessions.raceId,
            sourceKey: sessions.sourceKey,
            name: sessions.name,
            startTimeUtc: sessions.startTimeUtc,
            isMustWatch: sessions.isMustWatch,
            needsReview: sessions.needsReview,
          })
          .from(sessions)
          .where(inArray(sessions.raceId, raceIds))
          .orderBy(asc(sessions.startTimeUtc));

  return {
    races: raceRows as AdminRaceRow[],
    sessions: sessionRows as AdminSessionRow[],
  };
}

export async function getAdminRaces(): Promise<AdminRace[]> {
  await requireAdminSession();

  if (getAdminRuntime(process.env.NODE_ENV).usesMockData) {
    return mockAdminRaces;
  }

  const rows = await getAdminRaceRows();
  return rows.races.map((race) => mapAdminRace(race, rows.sessions));
}

export const getAdminRaceById = cache(
  async (id: string): Promise<AdminRace | null> => {
    await requireAdminSession();

    if (getAdminRuntime(process.env.NODE_ENV).usesMockData) {
      return mockAdminRaces.find((race) => race.id === id) ?? null;
    }

    const rows = await getAdminRaceRows(id);
    const race = rows.races[0];
    if (!race) return null;

    const db = await getDb();
    const [factsRows, historyRows, watchRows] = await Promise.all([
      db.select().from(raceFacts).where(eq(raceFacts.raceId, id)).limit(1),
      db.select().from(raceHistory).where(eq(raceHistory.raceId, id)),
      db.select().from(raceWatchTargets).where(eq(raceWatchTargets.raceId, id)),
    ]);
    return mapAdminRace(race, rows.sessions, factsRows[0], historyRows, watchRows);
  },
);

export async function getAdminSyncOverview(): Promise<AdminSyncOverview> {
  await requireAdminSession();

  if (getAdminRuntime(process.env.NODE_ENV).usesMockData) {
    return {
      lastRun:
        mockSyncSources
          .map((source) => source.lastSync)
          .sort()
          .at(-1) ?? "Never",
      sources: mockSyncSources,
      recentLogs: mockRecentLogs,
    };
  }

  const db = await getDb();
  const [sourceRows, logRows] = await Promise.all([
    db
      .select({
        id: syncSources.id,
        seriesCode: syncSources.seriesCode,
        enabled: syncSources.enabled,
        lastSyncedAt: syncSources.lastSyncedAt,
      })
      .from(syncSources)
      .orderBy(asc(syncSources.seriesCode)),
    db
      .select({
        id: syncLogs.id,
        sourceId: syncLogs.sourceId,
        seriesCode: syncLogs.seriesCode,
        status: syncLogs.status,
        message: syncLogs.message,
        addedCount: syncLogs.addedCount,
        updatedCount: syncLogs.updatedCount,
        skippedCount: syncLogs.skippedCount,
        startedAt: syncLogs.startedAt,
        finishedAt: syncLogs.finishedAt,
      })
      .from(syncLogs)
      .orderBy(desc(syncLogs.startedAt))
      .limit(50),
  ]);

  return mapAdminSyncOverview(
    sourceRows as AdminSyncSourceRow[],
    logRows as AdminSyncLogRow[],
  );
}

export async function getAdminDashboardData() {
  const [adminRaces, syncOverview] = await Promise.all([
    getAdminRaces(),
    getAdminSyncOverview(),
  ]);

  return {
    adminRaces,
    reviewQueue: buildAdminReviewQueue(adminRaces),
    ...syncOverview,
  };
}
