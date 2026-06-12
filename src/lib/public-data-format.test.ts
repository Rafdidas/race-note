import assert from "node:assert/strict";
import test from "node:test";
import {
  formatKstSession,
  mapPublicRace,
} from "./public-data-format";
import type { PublicRaceRow, PublicSessionRow } from "../types/public-data";

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
