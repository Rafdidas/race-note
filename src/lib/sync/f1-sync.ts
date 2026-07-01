import type { RaceNoteDb } from "@/lib/db";
import { parseJolpicaSchedule } from "@/lib/sync/f1-jolpica";
import { parseJolpicaResults } from "@/lib/sync/f1-results";
import {
  parseJolpicaConstructorStandings,
  parseJolpicaDriverStandings,
} from "@/lib/sync/f1-standings";
import { upsertRaceResults } from "@/lib/sync/results-store";
import { runScheduleSource } from "@/lib/sync/source-runner";
import {
  upsertConstructorStandings,
  upsertDriverStandings,
} from "@/lib/sync/standings-store";

const SEASON = new Date().getUTCFullYear();
const BASE = "https://api.jolpi.ca/ergast/f1";

async function fetchJson(fetcher: typeof fetch, url: string): Promise<unknown> {
  const response = await fetcher(url, {
    headers: { "User-Agent": "RaceNote/1.0 (+https://race-note.rafdi.workers.dev)" },
  });
  if (!response.ok) throw new Error(`Jolpica HTTP ${response.status} for ${url}`);
  return response.json();
}

export async function runF1ScheduleSync(db: RaceNoteDb, fetcher: typeof fetch = fetch) {
  const result = await runScheduleSource({
    db,
    fetcher,
    sourceId: "source-f1-jolpica",
    parse: (body) => parseJolpicaSchedule(JSON.parse(body)),
  });

  const now = new Date().toISOString();

  try {
    const standings = await fetchJson(fetcher, `${BASE}/${SEASON}/driverStandings/`);
    await upsertDriverStandings(db, SEASON, parseJolpicaDriverStandings(standings, SEASON), now);
  } catch (error) {
    console.error("F1 driver standings sync failed", error);
  }

  try {
    const constructors = await fetchJson(fetcher, `${BASE}/${SEASON}/constructorStandings/`);
    await upsertConstructorStandings(
      db,
      SEASON,
      parseJolpicaConstructorStandings(constructors, SEASON),
      now,
    );
  } catch (error) {
    console.error("F1 constructor standings sync failed", error);
  }

  try {
    const lastResults = await fetchJson(fetcher, `${BASE}/${SEASON}/last/results/`);
    const parsed = parseJolpicaResults(lastResults);
    if (parsed) await upsertRaceResults(db, parsed.results, now);
  } catch (error) {
    console.error("F1 results sync failed", error);
  }

  return result;
}
