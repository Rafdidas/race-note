import Link from "next/link";
import type { RacePreview } from "@/types/public-data";
import { SeriesBadge } from "@/components/SeriesBadge/SeriesBadge";

type RaceCardProps = {
  race: RacePreview;
  index: number;
};

export function RaceCard({ race, index }: RaceCardProps) {
  return (
    <Link className="race-card" href={`/races/${race.id}`}>
      <div className="race-card__top">
        <SeriesBadge series={race.series} />
        <span className="race-card__index">P/{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="race-card__body">
        <span className="race-card__status">{race.status}</span>
        <h3>{race.title}</h3>
        <p className="race-card__location">{race.location}</p>
      </div>
      <div className="race-card__schedule">
        <span>{race.period}</span>
        <span>KST</span>
      </div>
      <div className="race-card__must-watch">
        {race.mustWatch.map((session) => (
          <span key={session}>{session}</span>
        ))}
      </div>
      <p className="race-card__summary type-korean">{race.summary}</p>
      <span className="race-card__action">Open briefing ↗</span>
    </Link>
  );
}
