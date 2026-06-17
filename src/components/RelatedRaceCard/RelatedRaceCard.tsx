import Link from "next/link";
import { SeriesBadge } from "@/components/SeriesBadge/SeriesBadge";
import type { RelatedRaceCard as RelatedRaceCardModel } from "@/types/public-data";

export function RelatedRaceCard({ race }: { race: RelatedRaceCardModel }) {
  return (
    <Link className="related-race-card" href={`/races/${race.slug}`}>
      <div className="related-race-card__top">
        <SeriesBadge series={race.series} />
        <span className="related-race-card__period type-mono">{race.period}</span>
      </div>
      <h3 className="related-race-card__title">{race.title}</h3>
      <span className="related-race-card__location">{race.location}</span>
    </Link>
  );
}
