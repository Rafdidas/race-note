import type { NormalizedStanding } from "@/lib/sync/types";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function intOf(value: unknown): number | null {
  const n = Number(typeof value === "string" ? value.trim() : value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function standingsList(input: unknown): RecordValue {
  if (
    isRecord(input) &&
    isRecord(input.MRData) &&
    isRecord(input.MRData.StandingsTable) &&
    Array.isArray(input.MRData.StandingsTable.StandingsLists) &&
    isRecord(input.MRData.StandingsTable.StandingsLists[0])
  ) {
    return input.MRData.StandingsTable.StandingsLists[0] as RecordValue;
  }
  return {};
}

function mapRows(
  rows: unknown,
  entityKey: "Driver" | "Constructor",
  idKey: "driverId" | "constructorId",
): NormalizedStanding[] {
  if (!Array.isArray(rows)) return [];
  const result: NormalizedStanding[] = [];
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const entity = isRecord(row[entityKey]) ? (row[entityKey] as RecordValue) : {};
    const id = typeof entity[idKey] === "string" ? (entity[idKey] as string) : null;
    const position = intOf(row.position);
    const points = intOf(row.points);
    if (!id || position === null) continue;
    result.push({
      id,
      position,
      points: points ?? 0,
      wins: intOf(row.wins) ?? 0,
    });
  }
  return result;
}

export function parseJolpicaDriverStandings(
  input: unknown,
  _season: number,
): NormalizedStanding[] {
  return mapRows(standingsList(input).DriverStandings, "Driver", "driverId");
}

export function parseJolpicaConstructorStandings(
  input: unknown,
  _season: number,
): NormalizedStanding[] {
  return mapRows(standingsList(input).ConstructorStandings, "Constructor", "constructorId");
}
