import assert from "node:assert/strict";
import test from "node:test";
import {
  formatKstSession,
  mapPublicRace,
  mapPublicRaceFacts,
  mapRaceHistory,
  mapWatchTargets,
  mapRelatedRaceCard,
} from "./public-data-format";
import type { PublicRaceRow, PublicSessionRow } from "../types/public-data";
import type {
  RaceFactsRow,
  RaceHistoryRow,
  RaceWatchTargetRow,
} from "../db/schema";

test("formats a UTC session in KST", () => {
  assert.deepEqual(
    formatKstSession({
      id: "session-1",
      raceId: "race-1",
      name: "Race Start",
      startTimeUtc: "2026-06-13T14:00:00Z",
      isMustWatch: true,
    }),
    {
      id: "session-1",
      date: "06.13",
      day: "SAT",
      name: "Race Start",
      time: "23:00",
      mustWatch: true,
    },
  );
});

test("maps a published race row and related sessions to the public card contract", () => {
  const race: PublicRaceRow = {
    id: "race-1",
    slug: "24-hours-of-le-mans-2026",
    name: "24 Hours of Le Mans",
    country: "France",
    location: "Le Mans",
    startDate: "2026-06-13",
    endDate: "2026-06-14",
    status: "scheduled",
    seriesCode: "WEC",
    summary: "24시간 레이스입니다.",
    brief: ["첫 줄", "둘째 줄", "셋째 줄"],
    beginnerNote: "여러 클래스가 함께 달립니다.",
    variables: ["Night running"],
  };
  const sessions: PublicSessionRow[] = [
    {
      id: "session-1",
      raceId: "race-1",
      name: "Race Start",
      startTimeUtc: "2026-06-13T14:00:00Z",
      isMustWatch: true,
    },
  ];

  assert.deepEqual(mapPublicRace(race, sessions), {
    id: "24-hours-of-le-mans-2026",
    series: "WEC",
    title: "24 Hours of Le Mans",
    location: "Le Mans · France",
    period: "06.13 — 06.14",
    mustWatch: ["Race Start"],
    summary: "24시간 레이스입니다.",
    status: "Upcoming",
    sessions: [
      {
        id: "session-1",
        date: "06.13",
        day: "SAT",
        name: "Race Start",
        time: "23:00",
        mustWatch: true,
      },
    ],
    brief: ["첫 줄", "둘째 줄", "셋째 줄"],
    beginnerNote: "여러 클래스가 함께 달립니다.",
    variables: ["Night running"],
  });
});

function factsRow(overrides: Partial<RaceFactsRow>): RaceFactsRow {
  return {
    id: "facts-1",
    raceId: "race-1",
    circuitName: null,
    trackLength: null,
    laps: null,
    raceDistance: null,
    corners: null,
    drsZones: null,
    firstHeld: null,
    previousWinner: null,
    mostWinsDriver: null,
    mostWinsTeam: null,
    lapRecord: null,
    poleRecord: null,
    tyreCompounds: null,
    overtakeDifficulty: null,
    keySector: null,
    surfaceType: null,
    totalStages: null,
    totalDistance: null,
    eventDuration: null,
    classes: null,
    weatherNote: null,
    strategyNote: null,
    beginnerNote: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

test("returns null facts when every content field is empty", () => {
  assert.equal(mapPublicRaceFacts(factsRow({})), null);
  assert.equal(mapPublicRaceFacts(undefined), null);
});

test("maps facts row to public facts when any field is present", () => {
  const facts = mapPublicRaceFacts(factsRow({ trackLength: "5.807km", laps: 53 }));
  assert.equal(facts?.trackLength, "5.807km");
  assert.equal(facts?.laps, 53);
  assert.equal(facts?.corners, null);
});

test("orders history by season descending", () => {
  const rows: RaceHistoryRow[] = [
    { id: "h1", raceId: "race-1", season: 2024, winnerDriverName: "A", winnerTeamName: null, poleDriverName: null, fastestLapDriverName: null, note: null, createdAt: "x", updatedAt: "x" },
    { id: "h2", raceId: "race-1", season: 2025, winnerDriverName: "B", winnerTeamName: null, poleDriverName: null, fastestLapDriverName: null, note: null, createdAt: "x", updatedAt: "x" },
  ];
  assert.deepEqual(mapRaceHistory(rows).map((h) => h.season), [2025, 2024]);
});

test("orders watch targets by display order ascending", () => {
  const rows: RaceWatchTargetRow[] = [
    { id: "w2", raceId: "race-1", targetType: "team", targetId: null, targetName: "Ferrari", title: null, reason: "예선 페이스", displayOrder: 2, createdAt: "x", updatedAt: "x" },
    { id: "w1", raceId: "race-1", targetType: "driver", targetId: null, targetName: "Verstappen", title: "주목", reason: "고속 코너 강점", displayOrder: 1, createdAt: "x", updatedAt: "x" },
  ];
  assert.deepEqual(mapWatchTargets(rows).map((w) => w.targetName), ["Verstappen", "Ferrari"]);
});

test("maps a related race card with KST period and joined location", () => {
  const card = mapRelatedRaceCard({
    slug: "bahrain-grand-prix-2026",
    seriesCode: "F1",
    name: "Bahrain Grand Prix",
    location: "Sakhir",
    country: "Bahrain",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
  });
  assert.deepEqual(card, {
    slug: "bahrain-grand-prix-2026",
    series: "F1",
    title: "Bahrain Grand Prix",
    location: "Sakhir · Bahrain",
    period: "04.10 — 04.12",
  });
});
