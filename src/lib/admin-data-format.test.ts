import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAdminReviewQueue,
  mapAdminRace,
  mapAdminRaceFacts,
  mapAdminRaceHistory,
  mapAdminSyncOverview,
  mapAdminWatchTargets,
} from "./admin-data-format";
import type {
  AdminRaceRow,
  AdminSessionRow,
  AdminSyncLogRow,
  AdminSyncSourceRow,
} from "../types/admin-data";
import type { RaceFactsRow, RaceHistoryRow, RaceWatchTargetRow } from "../db/schema";

const raceRow: AdminRaceRow = {
  id: "race-le-mans-2026",
  name: "24 Hours of Le Mans",
  country: "France",
  location: "Le Mans",
  startDate: "2026-06-13",
  endDate: "2026-06-14",
  publishStatus: "draft",
  needsReview: true,
  seriesCode: "WEC",
  summary: "여러 클래스가 함께 달립니다.",
  summaryThreeLines: [],
  beginnerNote: "클래스별 우승이 따로 존재합니다.",
  variables: [],
  keyDriversOrTeams: null,
  notificationText: null,
  seoTitle: null,
  seoDescription: null,
  aiStatus: "needs_review",
  draftStatus: "ready",
  draftModel: "gpt-5-nano",
  draftErrorMessage: null,
  draftGeneratedAt: "2026-06-13T01:00:00Z",
  draftSummaryThreeLines: ["초안 1", "초안 2", "초안 3"],
  draftKeyDriversOrTeams: null,
  draftRaceVariables: ["날씨"],
  draftBeginnerRules: "초안 규칙",
  draftMustWatchReason: "초안 이유",
  draftNotificationText: "초안 알림",
  draftSeoTitle: "초안 제목",
  draftSeoDescription: "초안 설명",
};

const sessionRows: AdminSessionRow[] = [
  {
    id: "session-le-mans-start",
    raceId: "race-le-mans-2026",
    sourceKey: null,
    name: "Race Start",
    startTimeUtc: "2026-06-13T14:00:00Z",
    isMustWatch: true,
    needsReview: false,
  },
];

test("maps an admin race row with D1 ID, normalized statuses, and KST sessions", () => {
  assert.deepEqual(mapAdminRace(raceRow, sessionRows), {
    id: "race-le-mans-2026",
    series: "WEC",
    title: "24 Hours of Le Mans",
    country: "France",
    location: "Le Mans · France",
    locationName: "Le Mans",
    startDate: "2026-06-13",
    endDate: "2026-06-14",
    period: "06.13 — 06.14",
    aiStatus: "needs-review",
    publishStatus: "draft",
    needsReview: true,
    summary: "여러 클래스가 함께 달립니다.",
    summaryThreeLines: [],
    beginnerNote: "클래스별 우승이 따로 존재합니다.",
    variables: [],
    keyDriversOrTeams: "",
    notificationText: "",
    seoTitle: "",
    seoDescription: "",
    aiDraft: {
      status: "ready",
      model: "gpt-5-nano",
      errorMessage: "",
      generatedAt: "2026.06.13 10:00",
      summaryThreeLines: ["초안 1", "초안 2", "초안 3"],
      keyDriversOrTeams: "",
      raceVariables: ["날씨"],
      beginnerRules: "초안 규칙",
      mustWatchReason: "초안 이유",
      notificationText: "초안 알림",
      seoTitle: "초안 제목",
      seoDescription: "초안 설명",
    },
    sessions: [
      {
        id: "session-le-mans-start",
        sourceKey: null,
        startTimeUtc: "2026-06-13T14:00:00Z",
        date: "06.13",
        day: "SAT",
        name: "Race Start",
        time: "23:00",
        mustWatch: true,
        needsReview: false,
      },
    ],
    facts: {
      circuitName: "",
      trackLength: "",
      laps: "",
      raceDistance: "",
      corners: "",
      drsZones: "",
      firstHeld: "",
      previousWinner: "",
      mostWinsDriver: "",
      mostWinsTeam: "",
      lapRecord: "",
      poleRecord: "",
      tyreCompounds: "",
      overtakeDifficulty: "",
      keySector: "",
      weatherNote: "",
      strategyNote: "",
      beginnerNote: "",
    },
    history: [],
    watchTargets: [],
  });
});

test("derives a single review queue entry and prioritizes schedule review", () => {
  const race = mapAdminRace(raceRow, sessionRows);

  assert.deepEqual(buildAdminReviewQueue([race]), [
    {
      race,
      reason: "Schedule review required",
      status: "needs-review",
    },
  ]);
});

test("adds a ready AI draft to the review queue without changing current content status", () => {
  const race = {
    ...mapAdminRace(raceRow, sessionRows),
    needsReview: false,
    aiStatus: "empty" as const,
  };
  assert.deepEqual(buildAdminReviewQueue([race]), [
    {
      race,
      reason: "AI draft review required",
      status: "needs-review",
    },
  ]);
});

test("maps sync sources with their latest log and formats KST timestamps", () => {
  const sources: AdminSyncSourceRow[] = [
    {
      id: "source-wec",
      seriesCode: "WEC",
      enabled: true,
      lastSyncedAt: "2026-06-13T00:00:00Z",
    },
  ];
  const logs: AdminSyncLogRow[] = [
    {
      id: "log-old",
      sourceId: "source-wec",
      seriesCode: "WEC",
      status: "failed",
      message: "Old failure",
      addedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      startedAt: "2026-06-12T00:00:00Z",
      finishedAt: "2026-06-12T00:01:00Z",
    },
    {
      id: "log-latest",
      sourceId: "source-wec",
      seriesCode: "WEC",
      status: "success",
      message: "Latest success",
      addedCount: 1,
      updatedCount: 2,
      skippedCount: 3,
      startedAt: "2026-06-13T00:00:00Z",
      finishedAt: "2026-06-13T00:01:00Z",
    },
  ];

  assert.deepEqual(mapAdminSyncOverview(sources, logs), {
    lastRun: "2026.06.13 09:00",
    sources: [
      {
        id: "source-wec",
        series: "WEC",
        enabled: true,
        status: "success",
        lastSync: "2026.06.13 09:00",
        added: 1,
        updated: 2,
        failed: 0,
      },
    ],
    recentLogs: [
      {
        id: "log-latest",
        source: "WEC",
        status: "success",
        time: "2026.06.13 09:00",
        message: "Latest success",
      },
      {
        id: "log-old",
        source: "WEC",
        status: "failed",
        time: "2026.06.12 09:00",
        message: "Old failure",
      },
    ],
  });
});

test("maps null facts row to empty-string admin facts", () => {
  const facts = mapAdminRaceFacts(undefined);
  assert.equal(facts.trackLength, "");
  assert.equal(facts.laps, "");
});

test("maps facts row numbers to strings", () => {
  const row = { laps: 53, corners: 18, trackLength: "5.807km" } as RaceFactsRow;
  const facts = mapAdminRaceFacts(row);
  assert.equal(facts.laps, "53");
  assert.equal(facts.corners, "18");
  assert.equal(facts.trackLength, "5.807km");
});

test("maps admin history sorted by season descending with string season", () => {
  const rows: RaceHistoryRow[] = [
    { id: "h1", raceId: "r", season: 2024, winnerDriverName: "A", winnerTeamName: null, poleDriverName: null, fastestLapDriverName: null, note: null, createdAt: "x", updatedAt: "x" },
    { id: "h2", raceId: "r", season: 2025, winnerDriverName: "B", winnerTeamName: null, poleDriverName: null, fastestLapDriverName: null, note: null, createdAt: "x", updatedAt: "x" },
  ];
  const mapped = mapAdminRaceHistory(rows);
  assert.deepEqual(mapped.map((h) => h.season), ["2025", "2024"]);
  assert.equal(mapped[0].winnerDriverName, "B");
});

test("maps admin watch targets sorted by display order", () => {
  const rows: RaceWatchTargetRow[] = [
    { id: "w2", raceId: "r", targetType: "team", targetId: null, targetName: "B", title: null, reason: "r2", displayOrder: 2, createdAt: "x", updatedAt: "x" },
    { id: "w1", raceId: "r", targetType: "driver", targetId: null, targetName: "A", title: "t", reason: "r1", displayOrder: 1, createdAt: "x", updatedAt: "x" },
  ];
  const mapped = mapAdminWatchTargets(rows);
  assert.deepEqual(mapped.map((w) => w.targetName), ["A", "B"]);
  assert.equal(mapped[0].title, "t");
});
