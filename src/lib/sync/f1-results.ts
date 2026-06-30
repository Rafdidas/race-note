import type { NormalizedRaceResult } from "@/lib/sync/types";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function intOf(value: unknown): number | null {
  const n = Number(typeof value === "string" ? value.trim() : value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseResultRow(
  row: unknown,
  season: number,
  round: number,
): NormalizedRaceResult | null {
  if (!isRecord(row)) return null;
  const position = intOf(row.position);
  if (position === null) return null;
  const driver = isRecord(row.Driver) ? row.Driver : {};
  const constructor = isRecord(row.Constructor) ? row.Constructor : {};
  const time = isRecord(row.Time) ? text(row.Time.time) : null;
  const given = text(driver.givenName);
  const family = text(driver.familyName);
  const driverName = [given, family].filter(Boolean).join(" ") || text(driver.driverId) || "Unknown";
  return {
    sourceKey: `jolpica:f1:${season}:${round}:race:${position}`,
    season,
    round,
    position,
    driverId: text(driver.driverId),
    driverName,
    teamId: text(constructor.constructorId),
    teamName: text(constructor.name),
    gridPosition: intOf(row.grid),
    timeOrGap: time,
    points: intOf(row.points) ?? 0,
    status: text(row.status),
  };
}

export function parseJolpicaResults(
  input: unknown,
): { season: number; round: number; results: NormalizedRaceResult[] } | null {
  if (
    !isRecord(input) ||
    !isRecord(input.MRData) ||
    !isRecord(input.MRData.RaceTable) ||
    !Array.isArray(input.MRData.RaceTable.Races) ||
    !isRecord(input.MRData.RaceTable.Races[0])
  ) {
    return null;
  }
  const race = input.MRData.RaceTable.Races[0] as RecordValue;
  const season = intOf(race.season);
  const round = intOf(race.round);
  if (season === null || round === null) return null;
  const rawResults = Array.isArray(race.Results) ? race.Results : [];
  const results = rawResults
    .map((row) => parseResultRow(row, season, round))
    .filter((row): row is NormalizedRaceResult => row !== null);
  if (results.length === 0) return null;
  return { season, round, results };
}
