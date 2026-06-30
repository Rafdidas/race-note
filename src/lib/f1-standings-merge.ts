import type { F1Driver, F1Team } from "@/data/f1-season";

export type DriverStanding = {
  slug: string;
  name: string;
  code: string;
  number: string;
  nationality: string;
  team: string;
  position: number;
  points: number;
  wins: number;
  note: string;
  style: string;
};

export type ConstructorStanding = {
  slug: string;
  name: string;
  shortName: string;
  drivers: string[];
  car: string;
  tone: F1Team["tone"];
  position: number;
  points: number;
  wins: number;
  note: string;
};

const NO_RANK = 9999;

function seedPosition(value: string | undefined): number {
  if (!value) return NO_RANK;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : NO_RANK;
}

export function mergeDriverStandings(
  seed: F1Driver[],
  rows: { driverId: string; position: number; points: number; wins: number }[],
): DriverStanding[] {
  const byId = new Map(rows.map((row) => [row.driverId, row]));
  return seed
    .map((driver) => {
      const row = byId.get(driver.jolpicaDriverId);
      return {
        slug: driver.slug,
        name: driver.name,
        code: driver.code,
        number: driver.number,
        nationality: driver.nationality,
        team: driver.team,
        position: row?.position ?? seedPosition(driver.position),
        points: row?.points ?? driver.points ?? 0,
        wins: row?.wins ?? 0,
        note: driver.note,
        style: driver.style,
      };
    })
    .sort((a, b) => a.position - b.position);
}

export function mergeConstructorStandings(
  seed: F1Team[],
  rows: { constructorId: string; position: number; points: number; wins: number }[],
): ConstructorStanding[] {
  const byId = new Map(rows.map((row) => [row.constructorId, row]));
  return seed
    .map((team) => {
      const row = byId.get(team.jolpicaConstructorId);
      return {
        slug: team.slug,
        name: team.name,
        shortName: team.shortName,
        drivers: team.drivers,
        car: team.car,
        tone: team.tone,
        position: row?.position ?? seedPosition(team.position),
        points: row?.points ?? team.points ?? 0,
        wins: row?.wins ?? 0,
        note: team.note,
      };
    })
    .sort((a, b) => a.position - b.position);
}
