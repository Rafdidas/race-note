import type { RaceNoteDb } from "@/lib/db";
import { parseJolpicaSchedule } from "@/lib/sync/f1-jolpica";
import { runScheduleSource } from "@/lib/sync/source-runner";

export function runF1ScheduleSync(db: RaceNoteDb, fetcher: typeof fetch = fetch) {
  return runScheduleSource({
    db,
    fetcher,
    sourceId: "source-f1-jolpica",
    parse: (body) => parseJolpicaSchedule(JSON.parse(body)),
  });
}
