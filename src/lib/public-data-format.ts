import type {
  PublicRaceRow,
  PublicSessionRow,
  RacePreview,
  RaceSession,
  SeriesCode,
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
