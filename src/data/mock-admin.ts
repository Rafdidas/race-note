import { featuredRaces } from "@/data/mock-races";
import { mapAdminRaceFacts } from "@/lib/admin-data-format";
import type {
  AdminRace,
  AdminRecentLog,
  AdminStatus,
  AdminSyncSource,
} from "@/types/admin-data";

export const adminRaces: AdminRace[] = featuredRaces.map((race, index) => ({
  ...race,
  country: race.location.split(" · ").at(-1) ?? "",
  locationName: race.location.split(" · ")[0] ?? "",
  startDate: `2026-${race.period.slice(0, 5).replace(".", "-")}`,
  endDate: `2026-${race.period.slice(-5).replace(".", "-")}`,
  summaryThreeLines: race.brief,
  variables: race.variables,
  keyDriversOrTeams: "",
  notificationText: "",
  seoTitle: "",
  seoDescription: "",
  aiDraft: null,
  aiStatus: (["reviewed", "generated", "empty"] as AdminStatus[])[index],
  publishStatus: (["published", "draft", "draft"] as AdminStatus[])[index],
  needsReview: index > 0,
  sessions: race.sessions.map((session) => ({
    ...session,
    sourceKey: null,
    startTimeUtc: `2026-${session.date.replace(".", "-")}T${session.time}:00Z`,
    mustWatch: Boolean(session.mustWatch),
    needsReview: false,
  })),
  facts: mapAdminRaceFacts(undefined),
  history: [],
  watchTargets: [],
}));

export const syncSources: AdminSyncSource[] = [
  { id: "mock-source-f1", series: "F1", enabled: true, status: "success", lastSync: "2026.06.11 09:02", added: 0, updated: 1, failed: 0 },
  { id: "mock-source-wec", series: "WEC", enabled: true, status: "success", lastSync: "2026.06.11 09:04", added: 1, updated: 0, failed: 0 },
  { id: "mock-source-wrc", series: "WRC", enabled: true, status: "failed", lastSync: "2026.06.11 09:06", added: 0, updated: 0, failed: 1 },
];

export const recentLogs: AdminRecentLog[] = [
  { id: "log-wrc-0906", source: "WRC", status: "failed" as const, time: "09:06", message: "Official calendar request timed out." },
  { id: "log-wec-0904", source: "WEC", status: "success" as const, time: "09:04", message: "Added 1 race, no schedule changes." },
  { id: "log-f1-0902", source: "F1", status: "success" as const, time: "09:02", message: "Updated 1 session, review required." },
];
