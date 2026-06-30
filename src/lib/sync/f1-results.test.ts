import assert from "node:assert/strict";
import { test } from "node:test";
import { parseJolpicaResults } from "@/lib/sync/f1-results";

const payload = {
  MRData: {
    RaceTable: {
      season: "2025",
      round: "24",
      Races: [
        {
          season: "2025",
          round: "24",
          raceName: "Abu Dhabi Grand Prix",
          Results: [
            {
              position: "1",
              points: "25",
              grid: "1",
              status: "Finished",
              Driver: { driverId: "max_verstappen", givenName: "Max", familyName: "Verstappen" },
              Constructor: { constructorId: "red_bull", name: "Red Bull" },
              Time: { time: "1:26:07.469" },
            },
            {
              position: "2",
              points: "18",
              grid: "3",
              status: "Finished",
              Driver: { driverId: "piastri", givenName: "Oscar", familyName: "Piastri" },
              Constructor: { constructorId: "mclaren", name: "McLaren" },
              Time: { time: "+12.594" },
            },
          ],
        },
      ],
    },
  },
};

test("parseJolpicaResults extracts season, round, and rows", () => {
  const parsed = parseJolpicaResults(payload);
  assert.ok(parsed);
  assert.equal(parsed.season, 2025);
  assert.equal(parsed.round, 24);
  assert.equal(parsed.results.length, 2);
  assert.deepEqual(parsed.results[0], {
    sourceKey: "jolpica:f1:2025:24:race:1",
    season: 2025,
    round: 24,
    position: 1,
    driverId: "max_verstappen",
    driverName: "Max Verstappen",
    teamId: "red_bull",
    teamName: "Red Bull",
    gridPosition: 1,
    timeOrGap: "1:26:07.469",
    points: 25,
    status: "Finished",
  });
  assert.equal(parsed.results[1].timeOrGap, "+12.594");
});

test("parseJolpicaResults returns null when no race", () => {
  assert.equal(parseJolpicaResults({ MRData: { RaceTable: { Races: [] } } }), null);
});
