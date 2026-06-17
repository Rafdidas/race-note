import {
  addWatchTarget,
  deleteWatchTarget,
  moveWatchTarget,
} from "@/app/admin/races/actions";
import type { AdminWatchTarget } from "@/types/admin-data";

const targetTypes: AdminWatchTarget["targetType"][] = [
  "driver",
  "team",
  "manufacturer",
  "car",
  "manual",
];

export function WatchTargetEditor({
  raceId,
  targets,
}: {
  raceId: string;
  targets: AdminWatchTarget[];
}) {
  const addAction = addWatchTarget.bind(null, raceId);
  return (
    <div className="admin-watch">
      {targets.length > 0 ? (
        <ul className="admin-watch__list">
          {targets.map((target) => {
            const deleteAction = deleteWatchTarget.bind(null, raceId, target.id);
            const upAction = moveWatchTarget.bind(null, raceId, target.id, "up");
            const downAction = moveWatchTarget.bind(null, raceId, target.id, "down");
            return (
              <li className="admin-watch__row" key={target.id}>
                <span className="admin-watch__type">{target.targetType}</span>
                <span className="admin-watch__name">{target.targetName}</span>
                <span className="admin-watch__reason">{target.reason}</span>
                <div className="admin-watch__actions">
                  <form action={upAction}>
                    <button aria-label="Move up" className="admin-button" type="submit">
                      ↑
                    </button>
                  </form>
                  <form action={downAction}>
                    <button aria-label="Move down" className="admin-button" type="submit">
                      ↓
                    </button>
                  </form>
                  <form action={deleteAction}>
                    <button className="admin-button" type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="admin-change-log">등록된 주목 대상이 없습니다.</p>
      )}
      <form action={addAction} className="admin-watch__form admin-form-grid">
        <label>
          Target type
          <select defaultValue="driver" name="targetType">
            {targetTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Target name
          <input name="targetName" required type="text" />
        </label>
        <label>
          Title (optional)
          <input name="title" type="text" />
        </label>
        <label className="admin-form-grid__wide">
          Reason
          <textarea name="reason" required rows={2} />
        </label>
        <div className="admin-editor-actions">
          <button className="admin-button" type="submit">
            Add target
          </button>
        </div>
      </form>
    </div>
  );
}
