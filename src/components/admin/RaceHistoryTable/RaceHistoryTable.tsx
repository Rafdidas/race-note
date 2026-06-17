import { addRaceHistory, deleteRaceHistory } from "@/app/admin/races/actions";
import type { AdminRaceHistoryEntry } from "@/types/admin-data";

export function RaceHistoryTable({
  raceId,
  entries,
}: {
  raceId: string;
  entries: AdminRaceHistoryEntry[];
}) {
  const addAction = addRaceHistory.bind(null, raceId);
  return (
    <div className="admin-history">
      {entries.length > 0 ? (
        <ul className="admin-history__list">
          {entries.map((entry) => {
            const deleteAction = deleteRaceHistory.bind(null, raceId, entry.id);
            return (
              <li className="admin-history__row" key={entry.id}>
                <span className="type-mono">{entry.season}</span>
                <span>
                  {entry.winnerDriverName || "—"}
                  {entry.winnerTeamName ? ` · ${entry.winnerTeamName}` : ""}
                </span>
                <form action={deleteAction}>
                  <button className="admin-button" type="submit">
                    Delete
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="admin-change-log">등록된 역대 기록이 없습니다.</p>
      )}
      <form action={addAction} className="admin-history__form admin-form-grid">
        <label>
          Season
          <input name="season" inputMode="numeric" required type="text" />
        </label>
        <label>
          Winner driver
          <input name="winnerDriverName" type="text" />
        </label>
        <label>
          Winner team
          <input name="winnerTeamName" type="text" />
        </label>
        <label>
          Pole driver
          <input name="poleDriverName" type="text" />
        </label>
        <label>
          Fastest lap
          <input name="fastestLapDriverName" type="text" />
        </label>
        <label>
          Note
          <input name="note" type="text" />
        </label>
        <div className="admin-editor-actions">
          <button className="admin-button" type="submit">
            Add history
          </button>
        </div>
      </form>
    </div>
  );
}
