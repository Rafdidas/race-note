import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAdminReviewQueue,
  mapAdminRace,
  mapAdminSyncOverview,
} from "./admin-data-format";
import type {
  AdminRaceRow,
  AdminSessionRow,
  AdminSyncLogRow,
  AdminSyncSourceRow,
} from "../types/admin-data";

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
  aiStatus: "needs_review",
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
