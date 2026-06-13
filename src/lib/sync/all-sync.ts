import type { RaceNoteDb } from "@/lib/db";
import { runF1ScheduleSync } from "@/lib/sync/f1-sync";
import { runWecScheduleSync } from "@/lib/sync/wec-sync";
import { runWrcScheduleSync } from "@/lib/sync/wrc-sync";

export async function runAllScheduleSync(db: RaceNoteDb): Promise<{
  successes: number;
  failures: number;
}> {
  const runners = [runF1ScheduleSync, runWecScheduleSync, runWrcScheduleSync];
  let successes = 0;
  let failures = 0;

  for (const runner of runners) {
    try {
      await runner(db);
      successes += 1;
    } catch {
      failures += 1;
    }
  }

  return { successes, failures };
}
