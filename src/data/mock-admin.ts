import { featuredRaces } from "@/data/mock-races";

export type AdminStatus =
  | "success"
  | "failed"
  | "partial"
  | "empty"
  | "generated"
  | "needs-review"
  | "reviewed"
  | "published"
  | "draft";

export const adminRaces = featuredRaces.map((race, index) => ({
  ...race,
  aiStatus: (["reviewed", "generated", "empty"] as AdminStatus[])[index],
  publishStatus: (["published", "draft", "draft"] as AdminStatus[])[index],
  needsReview: index > 0,
}));

export const syncSources = [
  { series: "F1", status: "success" as const, lastSync: "2026.06.11 09:02", added: 0, updated: 1, failed: 0 },
  { series: "WEC", status: "success" as const, lastSync: "2026.06.11 09:04", added: 1, updated: 0, failed: 0 },
  { series: "WRC", status: "failed" as const, lastSync: "2026.06.11 09:06", added: 0, updated: 0, failed: 1 },
];

export const recentLogs = [
  { id: "log-wrc-0906", source: "WRC", status: "failed" as const, time: "09:06", message: "Official calendar request timed out." },
  { id: "log-wec-0904", source: "WEC", status: "success" as const, time: "09:04", message: "Added 1 race, no schedule changes." },
  { id: "log-f1-0902", source: "F1", status: "success" as const, time: "09:02", message: "Updated 1 session, review required." },
];

export const reviewQueue = [
  { race: adminRaces[1], reason: "AI content generated", status: "needs-review" as const },
  { race: adminRaces[2], reason: "Schedule source failed", status: "needs-review" as const },
];
