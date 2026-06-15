import type { RaceNoteDb } from "@/lib/db";
import { runScheduleSource } from "@/lib/sync/source-runner";
import {
  applyWecDetailSessions,
  parseWecCalendar,
  parseWecRaceSessions,
  selectWecDetailRace,
} from "@/lib/sync/wec-calendar";

const WEC_BASE_URL = "https://www.fiawec.com/en/race/";
const MAX_DETAIL_BYTES = 3_000_000;

export function runWecScheduleSync(db: RaceNoteDb, fetcher: typeof fetch = fetch) {
  return runScheduleSource({
    db,
    fetcher,
    sourceId: "source-wec-official",
    parse: async (body) => {
      const races = applyWecDetailSessions(parseWecCalendar(body), body);
      const detailRace = selectWecDetailRace(races);
      if (!detailRace) return races;
      const detailHref = detailRace.sourceKey.replace(/^fiawec:/, "");
      const response = await fetcher(`${WEC_BASE_URL}${detailHref}`, {
        headers: { accept: "text/html" },
      });
      if (!response.ok) {
        throw new Error(`WEC detail source returned HTTP ${response.status}`);
      }
      const detail = await response.text();
      if (detail.length > MAX_DETAIL_BYTES) {
        throw new Error("WEC detail source response was too large");
      }
      const sessions = parseWecRaceSessions(
        detail,
        detailRace.sourceKey,
        detailRace.name,
      );
      return races.map((race) =>
        race.sourceKey === detailRace.sourceKey ? { ...race, sessions } : race,
      );
    },
  });
}
