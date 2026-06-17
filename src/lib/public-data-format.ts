import type {
  RaceFactsRow,
  RaceHistoryRow,
  RaceWatchTargetRow,
} from "@/db/schema";
import type {
  PublicRaceRow,
  PublicSessionRow,
  RaceFacts,
  RaceHistoryEntry,
  RacePreview,
  RaceSession,
  RelatedRaceCard,
  SeriesCode,
  WatchTarget,
} from "@/types/public-data";

const kstDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Seoul",
  weekday: "short",
});

const kstTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  timeZone: "Asia/Seoul",
});

const statusLabels: Record<string, string> = {
  cancelled: "Cancelled",
  finished: "Finished",
  ongoing: "Live",
  postponed: "Postponed",
  scheduled: "Upcoming",
};

function assertSeriesCode(code: string): SeriesCode {
  if (code === "F1" || code === "WEC" || code === "WRC") {
    return code;
  }

  throw new Error(`Unsupported series code: ${code}`);
}

function formatDateRangePart(date: string) {
  return date.slice(5).replace("-", ".");
}

export function formatKstSession(session: PublicSessionRow): RaceSession {
  const date = new Date(session.startTimeUtc);
  const dateParts = kstDateFormatter.formatToParts(date);
  const month = dateParts.find((part) => part.type === "month")?.value ?? "";
  const dayOfMonth = dateParts.find((part) => part.type === "day")?.value ?? "";
  const weekday = dateParts.find((part) => part.type === "weekday")?.value ?? "";

  return {
    id: session.id,
    date: `${month}.${dayOfMonth}`,
    day: weekday.toUpperCase(),
    name: session.name,
    time: kstTimeFormatter.format(date),
    mustWatch: session.isMustWatch || undefined,
  };
}

export function mapPublicRace(
  race: PublicRaceRow,
  sessions: PublicSessionRow[],
): RacePreview {
  const formattedSessions = sessions
    .filter((session) => session.raceId === race.id)
    .sort((a, b) => a.startTimeUtc.localeCompare(b.startTimeUtc))
    .map(formatKstSession);

  return {
    id: race.slug,
    series: assertSeriesCode(race.seriesCode),
    title: race.name,
    location: [race.location, race.country].filter(Boolean).join(" · "),
    period: `${formatDateRangePart(race.startDate)} — ${formatDateRangePart(race.endDate)}`,
    mustWatch: formattedSessions
      .filter((session) => session.mustWatch)
      .map((session) => session.name),
    summary: race.summary ?? "관전 포인트 준비 중",
    status: statusLabels[race.status] ?? race.status,
    sessions: formattedSessions,
    brief: race.brief ?? [],
    beginnerNote: race.beginnerNote ?? "입문자 안내 준비 중",
    variables: race.variables ?? [],
  };
}

export function mapPublicRaceFacts(row: RaceFactsRow | undefined): RaceFacts | null {
  if (!row) return null;
  const facts: RaceFacts = {
    circuitName: row.circuitName,
    trackLength: row.trackLength,
    laps: row.laps,
    raceDistance: row.raceDistance,
    corners: row.corners,
    drsZones: row.drsZones,
    firstHeld: row.firstHeld,
    previousWinner: row.previousWinner,
    mostWinsDriver: row.mostWinsDriver,
    mostWinsTeam: row.mostWinsTeam,
    lapRecord: row.lapRecord,
    poleRecord: row.poleRecord,
    tyreCompounds: row.tyreCompounds,
    overtakeDifficulty: row.overtakeDifficulty,
    keySector: row.keySector,
    weatherNote: row.weatherNote,
    strategyNote: row.strategyNote,
    beginnerNote: row.beginnerNote,
  };
  const hasValue = Object.values(facts).some((value) => value !== null);
  return hasValue ? facts : null;
}

export function mapRaceHistory(rows: RaceHistoryRow[]): RaceHistoryEntry[] {
  return [...rows]
    .sort((a, b) => b.season - a.season)
    .map((row) => ({
      season: row.season,
      winnerDriverName: row.winnerDriverName,
      winnerTeamName: row.winnerTeamName,
      poleDriverName: row.poleDriverName,
      fastestLapDriverName: row.fastestLapDriverName,
      note: row.note,
    }));
}

export function mapWatchTargets(rows: RaceWatchTargetRow[]): WatchTarget[] {
  return [...rows]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((row) => ({
      targetType: row.targetType,
      targetName: row.targetName,
      title: row.title,
      reason: row.reason,
    }));
}

export function mapRelatedRaceCard(row: {
  slug: string;
  seriesCode: string;
  name: string;
  location: string | null;
  country: string | null;
  startDate: string;
  endDate: string;
}): RelatedRaceCard {
  return {
    slug: row.slug,
    series: assertSeriesCode(row.seriesCode),
    title: row.name,
    location: [row.location, row.country].filter(Boolean).join(" · "),
    period: `${formatDateRangePart(row.startDate)} — ${formatDateRangePart(row.endDate)}`,
  };
}
