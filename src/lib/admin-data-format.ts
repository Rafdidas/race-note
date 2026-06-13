import type {
  AdminRace,
  AdminRaceRow,
  AdminReviewQueueItem,
  AdminSession,
  AdminSessionRow,
  AdminStatus,
  AdminSyncLogRow,
  AdminSyncOverview,
  AdminSyncSourceRow,
} from "@/types/admin-data";
import type { SeriesCode } from "@/types/public-data";

const kstDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Seoul",
  weekday: "short",
});

const kstDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Seoul",
  year: "numeric",
});

const kstTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  timeZone: "Asia/Seoul",
});

function toSeriesCode(code: string): SeriesCode {
  if (code === "F1" || code === "WEC" || code === "WRC") {
    return code;
  }

  throw new Error(`Unsupported series code: ${code}`);
}

function toAdminStatus(status: string | null | undefined): AdminStatus {
  const normalized = status?.replaceAll("_", "-") ?? "empty";
  const supported: AdminStatus[] = [
    "success",
    "failed",
    "partial",
    "empty",
    "generated",
    "needs-review",
    "reviewed",
    "published",
    "draft",
    "hidden",
  ];

  return supported.includes(normalized as AdminStatus)
    ? (normalized as AdminStatus)
    : "empty";
}

function formatDateRangePart(date: string) {
  return date.slice(5).replace("-", ".");
}

export function formatAdminKstDateTime(value: string | null): string {
  if (!value) {
    return "Never";
  }

  const parts = kstDateTimeFormatter.formatToParts(new Date(value));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${read("year")}.${read("month")}.${read("day")} ${read("hour")}:${read("minute")}`;
}

function mapAdminSession(session: AdminSessionRow): AdminSession {
  const date = new Date(session.startTimeUtc);
  const dateParts = kstDateFormatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((part) => part.type === type)?.value ?? "";

  return {
    id: session.id,
    sourceKey: session.sourceKey,
    startTimeUtc: session.startTimeUtc,
    date: `${read("month")}.${read("day")}`,
    day: read("weekday").toUpperCase(),
    name: session.name,
    time: kstTimeFormatter.format(date),
    mustWatch: session.isMustWatch,
    needsReview: session.needsReview,
  };
}

export function mapAdminRace(
  race: AdminRaceRow,
  sessions: AdminSessionRow[],
): AdminRace {
  const relatedSessions = sessions
    .filter((session) => session.raceId === race.id)
    .sort((a, b) => a.startTimeUtc.localeCompare(b.startTimeUtc))
    .map(mapAdminSession);

  return {
    id: race.id,
    series: toSeriesCode(race.seriesCode),
    title: race.name,
    country: race.country ?? "",
    location: [race.location, race.country].filter(Boolean).join(" · "),
    locationName: race.location ?? "",
    startDate: race.startDate,
    endDate: race.endDate,
    period: `${formatDateRangePart(race.startDate)} — ${formatDateRangePart(race.endDate)}`,
    aiStatus: toAdminStatus(race.aiStatus),
    publishStatus: toAdminStatus(race.publishStatus),
    needsReview:
      race.needsReview || relatedSessions.some((session) => session.needsReview),
    summary: race.summary ?? "",
    summaryThreeLines: race.summaryThreeLines ?? [],
    beginnerNote: race.beginnerNote ?? "",
    variables: race.variables ?? [],
    sessions: relatedSessions,
  };
}

export function buildAdminReviewQueue(
  races: AdminRace[],
): AdminReviewQueueItem[] {
  return races.flatMap((race) => {
    if (race.needsReview) {
      return [{ race, reason: "Schedule review required", status: "needs-review" }];
    }

    if (race.aiStatus === "generated" || race.aiStatus === "needs-review") {
      return [{ race, reason: "AI content review required", status: "needs-review" }];
    }

    return [];
  });
}

export function mapAdminSyncOverview(
  sources: AdminSyncSourceRow[],
  logs: AdminSyncLogRow[],
): AdminSyncOverview {
  const sortedLogs = [...logs].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );

  return {
    lastRun: formatAdminKstDateTime(sortedLogs[0]?.startedAt ?? null),
    sources: sources.map((source) => {
      const latestLog = sortedLogs.find((log) => log.sourceId === source.id);

      return {
        id: source.id,
        series: source.seriesCode,
        enabled: source.enabled,
        status: toAdminStatus(latestLog?.status),
        lastSync: formatAdminKstDateTime(
          source.lastSyncedAt ?? latestLog?.startedAt ?? null,
        ),
        added: latestLog?.addedCount ?? 0,
        updated: latestLog?.updatedCount ?? 0,
        failed: latestLog?.status === "failed" ? 1 : 0,
      };
    }),
    recentLogs: sortedLogs.map((log) => ({
      id: log.id,
      source: log.seriesCode,
      status: toAdminStatus(log.status),
      time: formatAdminKstDateTime(log.startedAt),
      message: log.message ?? "No message recorded.",
    })),
  };
}
