import type { RaceSession } from "@/data/mock-races";

type SessionListProps = {
  sessions: RaceSession[];
  showDate?: boolean;
};

export function SessionList({ sessions, showDate = true }: SessionListProps) {
  return (
    <div className="session-list">
      {sessions.map((session) => (
        <div className="session-list__row" key={`${session.date}-${session.name}`}>
          {showDate && (
            <div className="session-list__date">
              <strong>{session.date}</strong>
              <span>{session.day}</span>
            </div>
          )}
          <div className="session-list__name">
            {session.mustWatch && <span className="session-list__mark" aria-label="꼭 봐야 하는 세션" />}
            <strong>{session.name}</strong>
            {session.mustWatch && <span>Must watch</span>}
          </div>
          <time>{session.time} <span>KST</span></time>
        </div>
      ))}
    </div>
  );
}
