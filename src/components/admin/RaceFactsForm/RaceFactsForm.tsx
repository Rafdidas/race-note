import { saveRaceFacts } from "@/app/admin/races/actions";
import type { AdminRaceFacts } from "@/types/admin-data";

const textFields: Array<[keyof AdminRaceFacts, string]> = [
  ["circuitName", "Circuit"],
  ["trackLength", "Track length"],
  ["raceDistance", "Race distance"],
  ["previousWinner", "Previous winner"],
  ["mostWinsDriver", "Most wins (driver)"],
  ["mostWinsTeam", "Most wins (team)"],
  ["lapRecord", "Lap record"],
  ["poleRecord", "Pole record"],
  ["tyreCompounds", "Tyre compounds"],
  ["overtakeDifficulty", "Overtake difficulty"],
];

const numberFields: Array<[keyof AdminRaceFacts, string]> = [
  ["laps", "Laps"],
  ["corners", "Corners"],
  ["drsZones", "DRS zones"],
  ["firstHeld", "First held"],
];

const noteFields: Array<[keyof AdminRaceFacts, string]> = [
  ["keySector", "Key sector"],
  ["strategyNote", "Strategy note"],
  ["weatherNote", "Weather note"],
  ["beginnerNote", "Beginner note"],
];

export function RaceFactsForm({
  raceId,
  facts,
}: {
  raceId: string;
  facts: AdminRaceFacts;
}) {
  const action = saveRaceFacts.bind(null, raceId);
  return (
    <form action={action} className="admin-facts-form">
      <div className="admin-form-grid">
        {textFields.map(([name, label]) => (
          <label key={name}>
            {label}
            <input defaultValue={facts[name]} name={name} type="text" />
          </label>
        ))}
        {numberFields.map(([name, label]) => (
          <label key={name}>
            {label}
            <input
              defaultValue={facts[name]}
              inputMode="numeric"
              name={name}
              type="text"
            />
          </label>
        ))}
      </div>
      <div className="admin-form-grid">
        {noteFields.map(([name, label]) => (
          <label className="admin-form-grid__wide" key={name}>
            {label}
            <textarea defaultValue={facts[name]} name={name} rows={2} />
          </label>
        ))}
      </div>
      <div className="admin-editor-actions">
        <button className="admin-button admin-button--primary" type="submit">
          Save facts
        </button>
      </div>
    </form>
  );
}
