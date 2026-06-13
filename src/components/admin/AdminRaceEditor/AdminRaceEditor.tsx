import {
  addManualSession,
  deleteManualSession,
  publishRace,
  reviewAdminRace,
  saveAdminRace,
  unpublishRace,
} from "@/app/admin/races/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge/StatusBadge";
import type { AdminRace } from "@/types/admin-data";

type AdminRaceEditorProps = {
  race: AdminRace;
  message?: string;
  status?: string;
};

const successMessages: Record<string, string> = {
  published: "레이스를 공개했습니다.",
  reviewed: "검수 완료 상태로 변경했습니다.",
  saved: "수정 내용을 저장했습니다. 콘텐츠는 다시 검수가 필요합니다.",
  "session-added": "수동 세션을 추가했습니다. 레이스 일정 검수가 필요합니다.",
  "session-deleted": "수동 세션을 삭제했습니다. 레이스 일정 검수가 필요합니다.",
  unpublished: "레이스를 비공개 초안으로 변경했습니다.",
};

export function AdminRaceEditor({
  race,
  message,
  status,
}: AdminRaceEditorProps) {
  const saveAction = saveAdminRace.bind(null, race.id);
  const reviewAction = reviewAdminRace.bind(null, race.id);
  const publishAction = publishRace.bind(null, race.id);
  const unpublishAction = unpublishRace.bind(null, race.id);
  const addSessionAction = addManualSession.bind(null, race.id);
  const actionMessage =
    status === "error" ? message : status ? successMessages[status] : undefined;

  return (
    <div className="admin-race-detail">
      <AdminPageHeader
        actions={
          <>
            <button className="admin-button" disabled type="button">
              Generate AI
            </button>
            <form action={reviewAction}>
              <button className="admin-button" type="submit">
                Mark reviewed
              </button>
            </form>
            <form action={race.publishStatus === "published" ? unpublishAction : publishAction}>
              <button className="admin-button admin-button--primary" type="submit">
                {race.publishStatus === "published" ? "Unpublish" : "Publish"}
              </button>
            </form>
          </>
        }
        description={`${race.series} · ${race.location} · ${race.period}`}
        eyebrow="Admin / Race detail"
        title={race.title}
      />

      <p
        aria-live="polite"
        className={`admin-notice${status === "error" ? " admin-notice--error" : ""}`}
      >
        {actionMessage ??
          "자동 수집된 데이터를 정정하고 검수한 뒤 공개 상태를 관리합니다."}
      </p>

      <form action={saveAction}>
        <section className="admin-editor-section">
          <div className="admin-editor-section__heading">
            <h2>Basic info</h2>
            <StatusBadge status={race.publishStatus} />
          </div>
          <div className="admin-form-grid">
            <label>
              Series
              <input readOnly value={race.series} />
            </label>
            <label>
              Race name
              <input defaultValue={race.title} name="name" required />
            </label>
            <label>
              Country
              <input defaultValue={race.country} name="country" />
            </label>
            <label>
              Location
              <input defaultValue={race.locationName} name="location" />
            </label>
            <label>
              Start date
              <input defaultValue={race.startDate} name="startDate" required type="date" />
            </label>
            <label>
              End date
              <input defaultValue={race.endDate} name="endDate" required type="date" />
            </label>
          </div>
        </section>

        <section className="admin-editor-section">
          <div className="admin-editor-section__heading">
            <h2>Sessions</h2>
            <span>{race.sessions.length} sessions</span>
          </div>
          <input
            name="sessionIds"
            type="hidden"
            value={race.sessions.map((session) => session.id).join("\n")}
          />
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--editor">
              <thead>
                <tr>
                  <th>Must</th>
                  <th>Session</th>
                  <th>UTC start time</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {race.sessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <input
                        aria-label={`${session.name} must watch`}
                        defaultChecked={session.mustWatch}
                        name={`session.${session.id}.mustWatch`}
                        type="checkbox"
                      />
                    </td>
                    <td>
                      <input
                        defaultValue={session.name}
                        name={`session.${session.id}.name`}
                        required
                      />
                    </td>
                    <td>
                      <input
                        defaultValue={session.startTimeUtc}
                        name={`session.${session.id}.startTimeUtc`}
                        pattern="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z"
                        required
                      />
                    </td>
                    <td>
                      {session.needsReview ? (
                        <StatusBadge status="needs-review" />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-editor-section">
          <div className="admin-editor-section__heading">
            <h2>Content</h2>
            <StatusBadge status={race.aiStatus} />
          </div>
          <div className="admin-form-grid">
            <label className="admin-form-grid__wide">
              Three-line summary
              <textarea
                defaultValue={race.summaryThreeLines.join("\n")}
                name="summaryThreeLines"
                rows={5}
              />
            </label>
            <label className="admin-form-grid__wide">
              Must-watch reason
              <textarea defaultValue={race.summary} name="mustWatchReason" rows={3} />
            </label>
            <label className="admin-form-grid__wide">
              Beginner rules
              <textarea defaultValue={race.beginnerNote} name="beginnerRules" rows={4} />
            </label>
            <label className="admin-form-grid__wide">
              Race variables
              <textarea
                defaultValue={race.variables.join("\n")}
                name="raceVariables"
                rows={4}
              />
            </label>
          </div>
        </section>

        <div className="admin-editor-actions">
          <button className="admin-button admin-button--primary" type="submit">
            Save corrections
          </button>
        </div>
      </form>

      <section className="admin-editor-section">
        <div className="admin-editor-section__heading">
          <h2>Manual sessions</h2>
          <span>Official calendars without exact times can be curated here.</span>
        </div>
        <form action={addSessionAction}>
          <div className="admin-form-grid">
            <label>
              Session name
              <input name="name" required />
            </label>
            <label>
              Session type
              <select defaultValue="other" name="type">
                <option value="practice">Practice</option>
                <option value="qualifying">Qualifying</option>
                <option value="sprint">Sprint</option>
                <option value="race">Race</option>
                <option value="start">Start</option>
                <option value="sunset">Sunset</option>
                <option value="night">Night</option>
                <option value="sunrise">Sunrise</option>
                <option value="final_hour">Final hour</option>
                <option value="power_stage">Power stage</option>
                <option value="stage">Stage</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              UTC start time
              <input
                name="startTimeUtc"
                pattern="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z"
                placeholder="2026-06-13T14:00:00Z"
                required
              />
            </label>
            <label className="admin-form-grid__check">
              <input name="mustWatch" type="checkbox" />
              Must watch
            </label>
          </div>
          <div className="admin-editor-actions">
            <button className="admin-button" type="submit">Add manual session</button>
          </div>
        </form>
        {race.sessions.some((session) => session.sourceKey === null) ? (
          <div className="admin-manual-sessions">
            {race.sessions.filter((session) => session.sourceKey === null).map((session) => (
              <div className="admin-manual-sessions__item" key={session.id}>
                <span>{session.name} · {session.startTimeUtc}</span>
                <form action={deleteManualSession.bind(null, race.id, session.id)}>
                  <button className="admin-button" type="submit">Delete</button>
                </form>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="admin-editor-section">
        <div className="admin-editor-section__heading">
          <h2>Change logs</h2>
          <StatusBadge status={race.needsReview ? "needs-review" : "reviewed"} />
        </div>
        <p className="admin-change-log">
          {race.needsReview
            ? "수집된 일정 또는 콘텐츠 검수가 필요합니다."
            : "검수 대기 중인 변경사항이 없습니다."}
        </p>
      </section>
    </div>
  );
}
