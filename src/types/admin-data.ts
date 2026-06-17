import type { SeriesCode } from "@/types/public-data";

export type AdminStatus =
  | "success"
  | "failed"
  | "partial"
  | "empty"
  | "generated"
  | "needs-review"
  | "reviewed"
  | "published"
  | "draft"
  | "hidden";

export type AdminSession = {
  id: string;
  sourceKey: string | null;
  startTimeUtc: string;
  date: string;
  day: string;
  name: string;
  time: string;
  mustWatch: boolean;
  needsReview: boolean;
};

export type AdminRace = {
  id: string;
  series: SeriesCode;
  title: string;
  country: string;
  location: string;
  locationName: string;
  startDate: string;
  endDate: string;
  period: string;
  aiStatus: AdminStatus;
  publishStatus: AdminStatus;
  needsReview: boolean;
  summary: string;
  summaryThreeLines: string[];
  beginnerNote: string;
  variables: string[];
  keyDriversOrTeams: string;
  notificationText: string;
  seoTitle: string;
  seoDescription: string;
  aiDraft: AdminAiDraft | null;
  sessions: AdminSession[];
  facts: AdminRaceFacts;
  history: AdminRaceHistoryEntry[];
  watchTargets: AdminWatchTarget[];
};

export type AdminRaceFacts = {
  circuitName: string;
  trackLength: string;
  laps: string;
  raceDistance: string;
  corners: string;
  drsZones: string;
  firstHeld: string;
  previousWinner: string;
  mostWinsDriver: string;
  mostWinsTeam: string;
  lapRecord: string;
  poleRecord: string;
  tyreCompounds: string;
  overtakeDifficulty: string;
  keySector: string;
  weatherNote: string;
  strategyNote: string;
  beginnerNote: string;
};

export type AdminRaceHistoryEntry = {
  id: string;
  season: string;
  winnerDriverName: string;
  winnerTeamName: string;
  poleDriverName: string;
  fastestLapDriverName: string;
  note: string;
};

export type AdminWatchTarget = {
  id: string;
  targetType: "driver" | "team" | "manufacturer" | "car" | "manual";
  targetName: string;
  title: string;
  reason: string;
  displayOrder: number;
};

export type AdminAiDraft = {
  status: "ready" | "failed" | "applied";
  model: string;
  errorMessage: string;
  generatedAt: string;
  summaryThreeLines: string[];
  keyDriversOrTeams: string;
  raceVariables: string[];
  beginnerRules: string;
  mustWatchReason: string;
  notificationText: string;
  seoTitle: string;
  seoDescription: string;
};

export type AdminReviewQueueItem = {
  race: AdminRace;
  reason: string;
  status: "needs-review";
};

export type AdminSyncSource = {
  id: string;
  series: string;
  enabled: boolean;
  status: AdminStatus;
  lastSync: string;
  added: number;
  updated: number;
  failed: number;
};

export type AdminRecentLog = {
  id: string;
  source: string;
  status: AdminStatus;
  time: string;
  message: string;
};

export type AdminSyncOverview = {
  lastRun: string;
  sources: AdminSyncSource[];
  recentLogs: AdminRecentLog[];
};

export type AdminRaceRow = {
  id: string;
  name: string;
  country: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  publishStatus: string;
  needsReview: boolean;
  seriesCode: string;
  summary: string | null;
  summaryThreeLines: string[] | null;
  beginnerNote: string | null;
  variables: string[] | null;
  keyDriversOrTeams: string | null;
  notificationText: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  aiStatus: string | null;
  draftStatus: string | null;
  draftModel: string | null;
  draftErrorMessage: string | null;
  draftGeneratedAt: string | null;
  draftSummaryThreeLines: string[] | null;
  draftKeyDriversOrTeams: string | null;
  draftRaceVariables: string[] | null;
  draftBeginnerRules: string | null;
  draftMustWatchReason: string | null;
  draftNotificationText: string | null;
  draftSeoTitle: string | null;
  draftSeoDescription: string | null;
};

export type AdminSessionRow = {
  id: string;
  raceId: string;
  sourceKey: string | null;
  name: string;
  startTimeUtc: string;
  isMustWatch: boolean;
  needsReview: boolean;
};

export type AdminSyncSourceRow = {
  id: string;
  seriesCode: string;
  enabled: boolean;
  lastSyncedAt: string | null;
};

export type AdminSyncLogRow = {
  id: string;
  sourceId: string | null;
  seriesCode: string;
  status: string;
  message: string | null;
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
  startedAt: string;
  finishedAt: string | null;
};
