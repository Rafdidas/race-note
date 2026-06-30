import { asc, eq } from "drizzle-orm";
import { constructorStandings, driverStandings } from "@/db/schema";
import { f1Drivers, f1Teams } from "@/data/f1-season";
import { getDb } from "@/lib/db";
import {
  mergeConstructorStandings,
  mergeDriverStandings,
  type ConstructorStanding,
  type DriverStanding,
} from "@/lib/f1-standings-merge";

const SEASON = new Date().getUTCFullYear();

export async function getDriverStandings(): Promise<DriverStanding[]> {
  if (process.env.NODE_ENV === "development") {
    return mergeDriverStandings(f1Drivers, []);
  }
  try {
    const db = await getDb();
    const rows = await db
      .select({
        driverId: driverStandings.driverId,
        position: driverStandings.position,
        points: driverStandings.points,
        wins: driverStandings.wins,
      })
      .from(driverStandings)
      .where(eq(driverStandings.season, SEASON))
      .orderBy(asc(driverStandings.position));
    return mergeDriverStandings(f1Drivers, rows);
  } catch (error) {
    console.error("getDriverStandings fell back to seed", error);
    return mergeDriverStandings(f1Drivers, []);
  }
}

export async function getConstructorStandings(): Promise<ConstructorStanding[]> {
  if (process.env.NODE_ENV === "development") {
    return mergeConstructorStandings(f1Teams, []);
  }
  try {
    const db = await getDb();
    const rows = await db
      .select({
        constructorId: constructorStandings.constructorId,
        position: constructorStandings.position,
        points: constructorStandings.points,
        wins: constructorStandings.wins,
      })
      .from(constructorStandings)
      .where(eq(constructorStandings.season, SEASON))
      .orderBy(asc(constructorStandings.position));
    return mergeConstructorStandings(f1Teams, rows);
  } catch (error) {
    console.error("getConstructorStandings fell back to seed", error);
    return mergeConstructorStandings(f1Teams, []);
  }
}
