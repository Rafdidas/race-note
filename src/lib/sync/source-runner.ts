import { eq } from "drizzle-orm";
import { syncLogs, syncSources } from "@/db/schema";
import type { RaceNoteDb } from "@/lib/db";
import { runD1Batch } from "@/lib/d1-helpers";
import {
  applyNormalizedSchedule,
  type ScheduleSyncCounts,
} from "@/lib/sync/schedule-store";
import type { NormalizedRace } from "@/lib/sync/types";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_SOURCE_BYTES = 3_000_000;
export const RACENOTE_USER_AGENT = "RaceNote/1.0 (+https://race-note.rafdi.workers.dev)";
const SAFE_MESSAGE_MAX_LEN = 160;
const ERR_RESPONSE_TOO_LARGE = "Schedule source response was too large";

export function safeScheduleSyncError(error: unknown, seriesCode: string): string {
  if (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  ) {
    return `${seriesCode} schedule source request timed out`;
  }

  if (error instanceof Error) {
    if (/returned HTTP \d+/.test(error.message)) {
      return error.message.slice(0, SAFE_MESSAGE_MAX_LEN);
    }
    if (error.message === ERR_RESPONSE_TOO_LARGE) {
      return ERR_RESPONSE_TOO_LARGE.slice(0, SAFE_MESSAGE_MAX_LEN);
    }
  }

  return `${seriesCode} schedule sync failed`;
}

export function scheduleSourceRequestHeaders(seriesCode: string): Headers {
  const headers = new Headers({ accept: "application/json,text/html" });
  if (seriesCode === "WRC") headers.set("user-agent", RACENOTE_USER_AGENT);
  return headers;
}

async function readLimitedText(response: Response): Promise<string> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_BYTES) {
    throw new Error(ERR_RESPONSE_TOO_LARGE);
  }
  if (!response.body) return response.text();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_SOURCE_BYTES) {
      await reader.cancel();
      throw new Error(ERR_RESPONSE_TOO_LARGE);
    }
    result += decoder.decode(value, { stream: true });
  }
  return result + decoder.decode();
}

export async function runScheduleSource({
  db,
  fetcher = fetch,
  parse,
  sourceId,
}: {
  db: RaceNoteDb;
  fetcher?: typeof fetch;
  parse: (body: string) => NormalizedRace[] | Promise<NormalizedRace[]>;
  sourceId: string;
}): Promise<ScheduleSyncCounts> {
  const sourceRows = await db
    .select()
    .from(syncSources)
    .where(eq(syncSources.id, sourceId))
    .limit(1);
  const source = sourceRows[0];
  if (!source?.enabled) throw new Error(`Enabled sync source ${sourceId} is missing`);

  const startedAt = new Date().toISOString();
  const logId = crypto.randomUUID();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetcher(source.sourceUrl, {
        headers: scheduleSourceRequestHeaders(source.seriesCode),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) {
      throw new Error(`${source.seriesCode} source returned HTTP ${response.status}`);
    }
    const races = await parse(await readLimitedText(response));
    const counts = await applyNormalizedSchedule(db, races, startedAt);
    const finishedAt = new Date().toISOString();
    await runD1Batch(db, [
      db.insert(syncLogs).values({
        id: logId,
        sourceId: source.id,
        seriesCode: source.seriesCode,
        status: counts.skipped > 0 ? "partial" : "success",
        message: `${source.seriesCode} schedule sync completed: ${races.length} races processed.`,
        addedCount: counts.added,
        updatedCount: counts.updated,
        skippedCount: counts.skipped,
        startedAt,
        finishedAt,
      }),
      db
        .update(syncSources)
        .set({ lastSyncedAt: finishedAt, updatedAt: finishedAt })
        .where(eq(syncSources.id, source.id)),
    ]);
    return counts;
  } catch (error) {
    const finishedAt = new Date().toISOString();
    console.error(`[sync] ${source.seriesCode} schedule sync error:`, error);
    const message = safeScheduleSyncError(error, source.seriesCode);
    await db.insert(syncLogs).values({
      id: logId,
      sourceId: source.id,
      seriesCode: source.seriesCode,
      status: "failed",
      message,
      startedAt,
      finishedAt,
    });
    throw error;
  }
}
