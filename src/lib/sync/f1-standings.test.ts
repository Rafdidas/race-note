import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseJolpicaConstructorStandings,
  parseJolpicaDriverStandings,
} from "@/lib/sync/f1-standings";

const driverPayload = {
  MRData: {
    StandingsTable: {
      StandingsLists: [
        {
          DriverStandings: [
            { position: "1", points: "423", wins: "7", Driver: { driverId: "norris", code: "NOR" } },
            { position: "2", points: "421", wins: "8", Driver: { driverId: "max_verstappen", code: "VER" } },
          ],
        },
      ],
    },
  },
};

const constructorPayload = {
  MRData: {
    StandingsTable: {
      StandingsLists: [
        {
          ConstructorStandings: [
            { position: "1", points: "800", wins: "12", Constructor: { constructorId: "mclaren", name: "McLaren" } },
          ],
        },
      ],
    },
  },
};

test("parseJolpicaDriverStandings maps driverId, position, points, wins", () => {
  const rows = parseJolpicaDriverStandings(driverPayload, 2025);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], { id: "norris", position: 1, points: 423, wins: 7 });
  assert.equal(rows[1].id, "max_verstappen");
});

test("parseJolpicaConstructorStandings maps constructorId", () => {
  const rows = parseJolpicaConstructorStandings(constructorPayload, 2025);
  assert.deepEqual(rows[0], { id: "mclaren", position: 1, points: 800, wins: 12 });
});

test("empty standings list returns []", () => {
  assert.deepEqual(parseJolpicaDriverStandings({ MRData: { StandingsTable: { StandingsLists: [] } } }, 2025), []);
});
