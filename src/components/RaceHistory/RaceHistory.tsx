import type { RaceHistoryEntry } from "@/types/public-data";

export function RaceHistory({ entries }: { entries: RaceHistoryEntry[] }) {
  return (
    <ul className="race-history">
      {entries.map((entry) => (
        <li className="race-history__row" key={entry.season}>
          <span className="race-history__season type-mono">{entry.season}</span>
          <div className="race-history__detail">
            <span className="race-history__winner">
              {entry.winnerDriverName ?? "기록 없음"}
              {entry.winnerTeamName ? ` · ${entry.winnerTeamName}` : ""}
            </span>
            {(entry.poleDriverName || entry.fastestLapDriverName || entry.note) && (
              <span className="race-history__meta">
                {[
                  entry.poleDriverName ? `Pole ${entry.poleDriverName}` : null,
                  entry.fastestLapDriverName ? `FL ${entry.fastestLapDriverName}` : null,
                  entry.note,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
