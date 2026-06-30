import type { RaceNoteDb } from "@/lib/db";
import { runF1ScheduleSync } from "@/lib/sync/f1-sync";

export async function runAllScheduleSync(db: RaceNoteDb): Promise<{
  successes: number;
  failures: number;
}> {
  try {
    await runF1ScheduleSync(db);
    return { successes: 1, failures: 0 };
  } catch {
    return { successes: 0, failures: 1 };
  }
}
