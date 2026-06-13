import assert from "node:assert/strict";
import test from "node:test";
import { parseJolpicaSchedule } from "@/lib/sync/f1-jolpica";

const response = {
  MRData: {
    RaceTable: {
      Races: [
        {
          season: "2026",
          round: "1",
          raceName: "Australian Grand Prix",
          Circuit: {
            circuitName: "Albert Park Grand Prix Circuit",
            Location: {
              country: "Australia",
              locality: "Melbourne",
            },
          },
          date: "2026-03-08",
          time: "04:00:00Z",
          FirstPractice: { date: "2026-03-06", time: "01:30:00Z" },
          Qualifying: { date: "2026-03-07", time: "05:00:00Z" },
          Sprint: { date: "2026-03-07", time: "02:00:00Z" },
        },
      ],
    },
  },
};

test("parses a Jolpica F1 race and supported sessions with stable keys", () => {
  assert.deepEqual(parseJolpicaSchedule(response), [
    {
      sourceKey: "jolpica:f1:2026:1",
      seriesCode: "F1",
      season: 2026,
      round: 1,
      name: "Australian Grand Prix",
      slug: "f1-2026-round-1",
      country: "Australia",
      location: "Melbourne",
      venueName: "Albert Park Grand Prix Circuit",
      startDate: "2026-03-06",
      endDate: "2026-03-08",
      timezone: "UTC",
      sessions: [
        {
          sourceKey: "jolpica:f1:2026:1:practice-1",
          name: "Practice 1",
          type: "practice",
          startTimeUtc: "2026-03-06T01:30:00.000Z",
        },
        {
          sourceKey: "jolpica:f1:2026:1:sprint",
          name: "Sprint",
          type: "sprint",
          startTimeUtc: "2026-03-07T02:00:00.000Z",
        },
        {
          sourceKey: "jolpica:f1:2026:1:qualifying",
          name: "Qualifying",
          type: "qualifying",
          startTimeUtc: "2026-03-07T05:00:00.000Z",
        },
        {
          sourceKey: "jolpica:f1:2026:1:race",
          name: "Race",
          type: "race",
          startTimeUtc: "2026-03-08T04:00:00.000Z",
        },
      ],
    },
  ]);
});

test("rejects a malformed or empty Jolpica response", () => {
  assert.throws(() => parseJolpicaSchedule({}), /valid F1 races/i);
  assert.throws(
    () => parseJolpicaSchedule({ MRData: { RaceTable: { Races: [] } } }),
    /valid F1 races/i,
  );
});

test("rejects the whole response when any race record is malformed", () => {
  const mixedResponse = structuredClone(response);
  mixedResponse.MRData.RaceTable.Races.push({
    season: "2026",
    round: "2",
    raceName: "Malformed Grand Prix",
    Circuit: {
      circuitName: "Unknown",
      Location: { country: "Unknown", locality: "Unknown" },
    },
    date: "not-a-date",
    time: "not-a-time",
  });

  assert.throws(() => parseJolpicaSchedule(mixedResponse), /invalid race records/i);
});
