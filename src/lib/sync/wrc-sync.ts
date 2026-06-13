import type { RaceNoteDb } from "@/lib/db";
import { runScheduleSource } from "@/lib/sync/source-runner";
import { parseWrcCalendar } from "@/lib/sync/wrc-calendar";

export function runWrcScheduleSync(db: RaceNoteDb, fetcher: typeof fetch = fetch) {
  return runScheduleSource({
    db,
    fetcher,
    sourceId: "source-wrc-official",
    parse: parseWrcCalendar,
  });
}
