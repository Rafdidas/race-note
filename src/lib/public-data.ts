import { and, asc, eq, gt, inArray, ne } from "drizzle-orm";
import {
  raceContents,
  raceFacts,
  raceHistory,
  raceWatchTargets,
  races,
  series,
  sessions,
} from "@/db/schema";
import {
  allSessions as mockSessions,
  featuredRaces as mockRaces,
  seriesGuides as mockSeriesGuides,
} from "@/data/mock-races";
import { getDb } from "@/lib/db";
import {
  mapPublicRace,
  mapPublicRaceFacts,
  mapRaceHistory,
  mapRelatedRaceCard,
  mapWatchTargets,
} from "@/lib/public-data-format";
import type {
  CalendarSession,
  PublicRaceRow,
  PublicSessionRow,
  RacePreview,
  SeriesCode,
  SeriesGuide,
} from "@/types/public-data";

// 레이스 상세 강화 섹션(facts/history/watch/next/explore)을 노출하는 시리즈.
// Phase 1은 F1만. WEC/WRC 콘텐츠·레이아웃이 준비되면 여기에 추가하면 된다
// (DB 스키마·관리자 입력은 이미 시리즈 범용이라 이 집합만 확장하면 공개 노출이 켜진다).
const ENRICHED_DETAIL_SERIES: ReadonlySet<SeriesCode> = new Set(["F1"]);

const seriesUi: Record<
  SeriesCode,
  Pick<SeriesGuide, "firstWatch" | "format" | "keywords">
> = {
  F1: {
    firstWatch: "Qualifying + Race",
    format: "Circuit racing",
    keywords: ["Drivers", "Teams", "Qualifying", "Strategy"],
  },
  WEC: {
    firstWatch: "Start + Final Hour",
    format: "Endurance racing",
    keywords: ["Classes", "Traffic", "Driver change", "Pit cycle"],
  },
  WRC: {
    firstWatch: "Power Stage",
    format: "Stage rally",
    keywords: ["Stages", "Co-driver", "Surface", "Pace notes"],
  },
};

function toSeriesCode(code: string): SeriesCode {
  if (code === "F1" || code === "WEC" || code === "WRC") {
    return code;
  }

  throw new Error(`Unsupported series code: ${code}`);
}

async function getPublicRaceRows(slug?: string) {
  const db = await getDb();
  const raceRows = await db
    .select({
      id: races.id,
      slug: races.slug,
      name: races.name,
      country: races.country,
      location: races.location,
      startDate: races.startDate,
      endDate: races.endDate,
      status: races.status,
      seriesCode: series.code,
      summary: raceContents.mustWatchReason,
      brief: raceContents.summaryThreeLines,
      beginnerNote: raceContents.beginnerRules,
      variables: raceContents.raceVariables,
    })
    .from(races)
    .innerJoin(series, eq(races.seriesId, series.id))
    .leftJoin(raceContents, eq(raceContents.raceId, races.id))
    .where(
      slug
        ? and(eq(races.publishStatus, "published"), eq(races.slug, slug))
        : eq(races.publishStatus, "published"),
    )
    .orderBy(asc(races.startDate));

  const raceIds = raceRows.map((race) => race.id);
  const sessionRows =
    raceIds.length === 0
      ? []
      : await db
          .select({
            id: sessions.id,
            raceId: sessions.raceId,
            name: sessions.name,
            startTimeUtc: sessions.startTimeUtc,
            isMustWatch: sessions.isMustWatch,
          })
          .from(sessions)
          .where(inArray(sessions.raceId, raceIds))
          .orderBy(asc(sessions.startTimeUtc));

  return {
    races: raceRows as PublicRaceRow[],
    sessions: sessionRows as PublicSessionRow[],
  };
}

export async function getPublishedRaces(): Promise<RacePreview[]> {
  if (process.env.NODE_ENV === "development") {
    return mockRaces;
  }

  const rows = await getPublicRaceRows();
  return rows.races.map((race) => mapPublicRace(race, rows.sessions));
}

async function getRaceDetailExtras(
  raceId: string,
  seriesId: string,
  startDate: string,
) {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);

  const relatedColumns = {
    slug: races.slug,
    seriesCode: series.code,
    name: races.name,
    location: races.location,
    country: races.country,
    startDate: races.startDate,
    endDate: races.endDate,
  };

  const [factsRows, historyRows, watchRows, nextRows, featuredRows] =
    await Promise.all([
      db.select().from(raceFacts).where(eq(raceFacts.raceId, raceId)).limit(1),
      db.select().from(raceHistory).where(eq(raceHistory.raceId, raceId)),
      db.select().from(raceWatchTargets).where(eq(raceWatchTargets.raceId, raceId)),
      db
        .select(relatedColumns)
        .from(races)
        .innerJoin(series, eq(races.seriesId, series.id))
        .where(
          and(
            eq(races.publishStatus, "published"),
            eq(races.seriesId, seriesId),
            gt(races.startDate, startDate),
          ),
        )
        .orderBy(asc(races.startDate))
        .limit(1),
      db
        .select(relatedColumns)
        .from(races)
        .innerJoin(series, eq(races.seriesId, series.id))
        .where(
          and(
            eq(races.publishStatus, "published"),
            eq(races.isFeatured, true),
            ne(races.seriesId, seriesId),
            gt(races.endDate, today),
          ),
        )
        .orderBy(asc(races.startDate))
        .limit(2),
    ]);

  return {
    facts: mapPublicRaceFacts(factsRows[0]),
    history: mapRaceHistory(historyRows),
    watchTargets: mapWatchTargets(watchRows),
    nextRace: nextRows[0] ? mapRelatedRaceCard(nextRows[0]) : null,
    featuredOther: featuredRows.map(mapRelatedRaceCard),
  };
}

export async function getPublishedRaceBySlug(
  slug: string,
): Promise<RacePreview | null> {
  if (process.env.NODE_ENV === "development") {
    return mockRaces.find((race) => race.id === slug) ?? null;
  }

  const rows = await getPublicRaceRows(slug);
  const race = rows.races[0];
  if (!race) return null;

  const base = mapPublicRace(race, rows.sessions);

  // 강화 섹션 미지원 시리즈(현재 WEC/WRC)는 extras를 건너뛰어 기존 모습을 유지한다.
  if (!ENRICHED_DETAIL_SERIES.has(base.series)) return base;

  const db = await getDb();
  const meta = await db
    .select({
      id: races.id,
      seriesId: races.seriesId,
      startDate: races.startDate,
    })
    .from(races)
    .where(eq(races.slug, slug))
    .limit(1);
  if (!meta[0]) return base;

  const extras = await getRaceDetailExtras(
    meta[0].id,
    meta[0].seriesId,
    meta[0].startDate,
  );
  return { ...base, ...extras };
}

export async function getPublishedSessions(): Promise<CalendarSession[]> {
  if (process.env.NODE_ENV === "development") {
    return mockSessions;
  }

  const publishedRaces = await getPublishedRaces();

  return publishedRaces
    .flatMap((race) =>
      race.sessions.map((session) => ({
        ...session,
        race,
      })),
    )
    .sort((a, b) => `${a.date}-${a.time}`.localeCompare(`${b.date}-${b.time}`));
}

export async function getSeriesGuides(): Promise<SeriesGuide[]> {
  if (process.env.NODE_ENV === "development") {
    return mockSeriesGuides;
  }

  const db = await getDb();
  const rows = await db.select().from(series).orderBy(asc(series.code));

  return rows.map((row) => {
    const code = toSeriesCode(row.code);
    return {
      code,
      name: row.name,
      description: row.description ?? "",
      beginnerGuide: row.beginnerGuide ?? "",
      ...seriesUi[code],
    };
  });
}
