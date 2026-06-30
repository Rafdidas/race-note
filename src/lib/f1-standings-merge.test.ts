import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeDriverStandings } from "@/lib/f1-standings-merge";
import type { F1Driver } from "@/data/f1-season";

const seed: F1Driver[] = [
  { slug: "norris", name: "Lando Norris", code: "NOR", team: "McLaren", nationality: "United Kingdom",
    number: "4", position: "05", points: 73, note: "n", style: "s", jolpicaDriverId: "norris" },
  { slug: "verstappen", name: "Max Verstappen", code: "VER", team: "Red Bull Racing",
    nationality: "Netherlands", number: "1", note: "n", style: "s", jolpicaDriverId: "max_verstappen" },
];

test("D1 row overrides seed position/points/wins and sorts by position", () => {
  const merged = mergeDriverStandings(seed, [
    { driverId: "max_verstappen", position: 1, points: 421, wins: 8 },
    { driverId: "norris", position: 2, points: 400, wins: 5 },
  ]);
  assert.equal(merged[0].name, "Max Verstappen");
  assert.equal(merged[0].position, 1);
  assert.equal(merged[0].points, 421);
  assert.equal(merged[1].slug, "norris");
});

test("missing D1 row falls back to seed position/points", () => {
  const merged = mergeDriverStandings(seed, []);
  // norris seed position "05" -> 5, verstappen has no seed position -> sorted last
  assert.equal(merged[0].slug, "norris");
  assert.equal(merged[0].position, 5);
  assert.equal(merged[1].slug, "verstappen");
});
