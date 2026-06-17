import type { WatchTarget } from "@/types/public-data";

const typeLabels: Record<WatchTarget["targetType"], string> = {
  driver: "Driver",
  team: "Team",
  manufacturer: "Manufacturer",
  car: "Car",
  manual: "Note",
};

export function WatchTargetList({ targets }: { targets: WatchTarget[] }) {
  return (
    <ul className="watch-target-list">
      {targets.map((target, index) => (
        <li className="watch-target-list__item" key={`${target.targetName}-${index}`}>
          <div className="watch-target-list__head">
            <span className="watch-target-list__badge">{typeLabels[target.targetType]}</span>
            <span className="watch-target-list__name">{target.targetName}</span>
            {target.title && <span className="watch-target-list__title">{target.title}</span>}
          </div>
          <p className="watch-target-list__reason type-korean">{target.reason}</p>
        </li>
      ))}
    </ul>
  );
}
