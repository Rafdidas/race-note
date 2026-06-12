import { and, asc, eq, inArray } from "drizzle-orm";
import { raceContents, races, series, sessions } from "@/db/schema";
import { getDb } from "@/lib/db";
import { mapPublicRace } from "@/lib/public-data-format";
import type {
  CalendarSession,
  PublicRaceRow,
  PublicSessionRow,
  RacePreview,
  SeriesCode,
  SeriesGuide,
} from "@/types/public-data";

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
  const rows = await getPublicRaceRows();
  return rows.races.map((race) => mapPublicRace(race, rows.sessions));
}

export async function getPublishedRaceBySlug(
  slug: string,
): Promise<RacePreview | null> {
  const rows = await getPublicRaceRows(slug);
  const race = rows.races[0];
  return race ? mapPublicRace(race, rows.sessions) : null;
}

export async function getPublishedSessions(): Promise<CalendarSession[]> {
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
