import type { NormalizedRace, NormalizedSession } from "@/lib/sync/types";

type RecordValue = Record<string, unknown>;

const sessionDefinitions = [
  ["FirstPractice", "practice-1", "Practice 1", "practice"],
  ["SecondPractice", "practice-2", "Practice 2", "practice"],
  ["ThirdPractice", "practice-3", "Practice 3", "practice"],
  ["SprintQualifying", "sprint-qualifying", "Sprint Qualifying", "qualifying"],
  ["SprintShootout", "sprint-shootout", "Sprint Shootout", "qualifying"],
  ["Sprint", "sprint", "Sprint", "sprint"],
  ["Qualifying", "qualifying", "Qualifying", "qualifying"],
] as const;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function utcDateTime(value: unknown): string | null {
  if (!isRecord(value)) return null;
  const date = text(value.date);
  const time = text(value.time);
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString();
}

function parseSession(
  race: RecordValue,
  sourcePrefix: string,
  field: string,
  key: string,
  name: string,
  type: NormalizedSession["type"],
): NormalizedSession | null {
  const startTimeUtc = utcDateTime(race[field]);
  return startTimeUtc
    ? { sourceKey: `${sourcePrefix}:${key}`, name, type, startTimeUtc }
    : null;
}

function parseRace(value: unknown): NormalizedRace | null {
  if (!isRecord(value)) return null;
  const season = Number(text(value.season));
  const round = Number(text(value.round));
  const name = text(value.raceName);
  const circuit = isRecord(value.Circuit) ? value.Circuit : {};
  const location = isRecord(circuit.Location) ? circuit.Location : {};
  const raceStart = utcDateTime({ date: value.date, time: value.time });
  if (!Number.isInteger(season) || !Number.isInteger(round) || !name || !raceStart) {
    return null;
  }

  const sourcePrefix = `jolpica:f1:${season}:${round}`;
  const sessions = sessionDefinitions
    .map(([field, key, sessionName, type]) =>
      parseSession(value, sourcePrefix, field, key, sessionName, type),
    )
    .filter((session): session is NormalizedSession => session !== null);
  sessions.push({
    sourceKey: `${sourcePrefix}:race`,
    name: "Race",
    type: "race",
    startTimeUtc: raceStart,
  });
  sessions.sort((a, b) => a.startTimeUtc.localeCompare(b.startTimeUtc));
  const dates = sessions.map((session) => session.startTimeUtc.slice(0, 10));

  return {
    sourceKey: sourcePrefix,
    seriesCode: "F1",
    season,
    round,
    name,
    slug: `f1-${season}-round-${round}`,
    country: text(location.country),
    location: text(location.locality),
    venueName: text(circuit.circuitName),
    startDate: dates[0],
    endDate: dates.at(-1) ?? dates[0],
    timezone: "UTC",
    sessions,
  };
}

export function parseJolpicaSchedule(input: unknown): NormalizedRace[] {
  const rawRaces =
    isRecord(input) &&
    isRecord(input.MRData) &&
    isRecord(input.MRData.RaceTable) &&
    Array.isArray(input.MRData.RaceTable.Races)
      ? input.MRData.RaceTable.Races
      : [];
  const races = rawRaces
    .map(parseRace)
    .filter((race): race is NormalizedRace => race !== null);

  if (races.length === 0) {
    throw new Error("Jolpica response contained no valid F1 races");
  }
  if (races.length !== rawRaces.length) {
    throw new Error("Jolpica response contained invalid race records");
  }
  return races;
}
