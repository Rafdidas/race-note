"use client";

import { useState } from "react";
import { RaceCard } from "@/components/RaceCard/RaceCard";
import type { RacePreview, SeriesCode } from "@/types/public-data";

type Filter = "ALL" | SeriesCode;

const filters: Filter[] = ["ALL", "F1", "WEC", "WRC"];

export function HomeRaceGrid({ races }: { races: RacePreview[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");
  const filteredRaces =
    activeFilter === "ALL"
      ? races
      : races.filter((race) => race.series === activeFilter);

  return (
    <>
      <div className="home-race-grid__filters" aria-label="시리즈 필터">
        <span>Filter</span>
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className={activeFilter === filter ? "is-active" : ""}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="home-race-grid" aria-live="polite">
        {filteredRaces.map((race, index) => (
          <RaceCard key={race.id} race={race} index={index} />
        ))}
      </div>
    </>
  );
}
