import type { RaceNoteDb } from "@/lib/db";
import { runScheduleSource } from "@/lib/sync/source-runner";
import { parseWecCalendar } from "@/lib/sync/wec-calendar";

export function runWecScheduleSync(db: RaceNoteDb, fetcher: typeof fetch = fetch) {
  return runScheduleSource({
    db,
    fetcher,
    sourceId: "source-wec-official",
    parse: parseWecCalendar,
  });
}
