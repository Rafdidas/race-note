import type { RaceFacts as RaceFactsModel } from "@/types/public-data";

type FactItem = { label: string; value: string };

function buildFactItems(facts: RaceFactsModel): FactItem[] {
  const items: Array<[string, string | number | null]> = [
    ["Circuit", facts.circuitName],
    ["Track length", facts.trackLength],
    ["Laps", facts.laps],
    ["Race distance", facts.raceDistance],
    ["Corners", facts.corners],
    ["DRS zones", facts.drsZones],
    ["First held", facts.firstHeld],
    ["Previous winner", facts.previousWinner],
    ["Most wins (driver)", facts.mostWinsDriver],
    ["Most wins (team)", facts.mostWinsTeam],
    ["Lap record", facts.lapRecord],
    ["Pole record", facts.poleRecord],
    ["Tyre compounds", facts.tyreCompounds],
    ["Overtake difficulty", facts.overtakeDifficulty],
  ];
  return items
    .filter(([, value]) => value !== null && value !== "")
    .map(([label, value]) => ({ label, value: String(value) }));
}

export function RaceFacts({ facts }: { facts: RaceFactsModel }) {
  const items = buildFactItems(facts);
  const notes: Array<[string, string | null]> = [
    ["Key sector", facts.keySector],
    ["Strategy", facts.strategyNote],
    ["Weather", facts.weatherNote],
    ["Beginner note", facts.beginnerNote],
  ];
  const visibleNotes = notes.filter(([, value]) => value !== null && value !== "");

  return (
    <div className="race-facts">
      {items.length > 0 && (
        <dl className="race-facts__grid">
          {items.map((item) => (
            <div className="race-facts__item" key={item.label}>
              <dt className="race-facts__label">{item.label}</dt>
              <dd className="race-facts__value type-mono">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {visibleNotes.length > 0 && (
        <div className="race-facts__notes">
          {visibleNotes.map(([label, value]) => (
            <div className="race-facts__note" key={label}>
              <span className="race-facts__label">{label}</span>
              <p className="type-korean">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
