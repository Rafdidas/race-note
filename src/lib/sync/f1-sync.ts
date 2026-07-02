import type { RaceNoteDb } from "@/lib/db";
import { parseJolpicaSchedule } from "@/lib/sync/f1-jolpica";
import { parseJolpicaResults } from "@/lib/sync/f1-results";
import {
  parseJolpicaConstructorStandings,
  parseJolpicaDriverStandings,
} from "@/lib/sync/f1-standings";
import { upsertRaceResults } from "@/lib/sync/results-store";
import type { ScheduleSyncCounts } from "@/lib/sync/schedule-store";
import { RACENOTE_USER_AGENT, runScheduleSource } from "@/lib/sync/source-runner";
import {
  upsertConstructorStandings,
  upsertDriverStandings,
} from "@/lib/sync/standings-store";

const SEASON = new Date().getUTCFullYear();
const BASE = "https://api.jolpi.ca/ergast/f1";
const RETRY_DELAY_MS = 3_000;
// 429는 공유 Cloudflare egress IP 기준 레이트리밋으로 일시 발생할 수 있어 재시도 대상.
const RETRYABLE_HTTP = /HTTP (429|5\d\d) /;

async function requestJson(fetcher: typeof fetch, url: string): Promise<unknown> {
  const response = await fetcher(url, {
    headers: { "User-Agent": RACENOTE_USER_AGENT },
  });
  if (!response.ok) throw new Error(`Jolpica HTTP ${response.status} for ${url}`);
  return response.json();
}

export async function fetchJolpicaJson(
  fetcher: typeof fetch,
  url: string,
  retryDelayMs: number = RETRY_DELAY_MS,
): Promise<unknown> {
  try {
    return await requestJson(fetcher, url);
  } catch (error) {
    if (!(error instanceof Error) || !RETRYABLE_HTTP.test(error.message)) throw error;
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    return requestJson(fetcher, url);
  }
}

export async function runF1ScheduleSync(
  db: RaceNoteDb,
  fetcher: typeof fetch = fetch,
): Promise<ScheduleSyncCounts> {
  // 일정 수집 실패(레이트리밋 등)가 순위·결과 수집까지 막지 않도록 실패를 보관했다가
  // 나머지 수집을 마친 뒤 다시 던진다. 일정 실패 로그는 source-runner가 이미 기록한다.
  let schedule: { counts: ScheduleSyncCounts } | { error: unknown };
  try {
    const counts = await runScheduleSource({
      db,
      fetcher,
      sourceId: "source-f1-jolpica",
      parse: (body) => parseJolpicaSchedule(JSON.parse(body)),
    });
    schedule = { counts };
  } catch (error) {
    schedule = { error };
  }

  const now = new Date().toISOString();

  try {
    const standings = await fetchJolpicaJson(fetcher, `${BASE}/${SEASON}/driverStandings/`);
    await upsertDriverStandings(db, SEASON, parseJolpicaDriverStandings(standings, SEASON), now);
  } catch (error) {
    console.error("F1 driver standings sync failed", error);
  }

  try {
    const constructors = await fetchJolpicaJson(
      fetcher,
      `${BASE}/${SEASON}/constructorStandings/`,
    );
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
    const lastResults = await fetchJolpicaJson(fetcher, `${BASE}/${SEASON}/last/results/`);
    const parsed = parseJolpicaResults(lastResults);
    if (parsed) await upsertRaceResults(db, parsed.results, now);
  } catch (error) {
    console.error("F1 results sync failed", error);
  }

  if ("error" in schedule) throw schedule.error;
  return schedule.counts;
}
