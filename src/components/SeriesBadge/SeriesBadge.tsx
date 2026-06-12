import type { SeriesCode } from "@/types/public-data";

type SeriesBadgeProps = {
  series: SeriesCode;
};

export function SeriesBadge({ series }: SeriesBadgeProps) {
  return (
    <span className={`series-badge series-badge--${series.toLowerCase()}`}>
      <span className="series-badge__mark" aria-hidden="true" />
      {series}
    </span>
  );
}
