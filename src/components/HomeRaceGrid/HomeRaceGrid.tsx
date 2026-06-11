"use client";

import { useState } from "react";
import { RaceCard } from "@/components/RaceCard/RaceCard";
import { featuredRaces, type SeriesCode } from "@/data/mock-races";

type Filter = "ALL" | SeriesCode;

const filters: Filter[] = ["ALL", "F1", "WEC", "WRC"];

export function HomeRaceGrid() {
  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");
  const races =
    activeFilter === "ALL"
      ? featuredRaces
      : featuredRaces.filter((race) => race.series === activeFilter);

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
        {races.map((race, index) => (
          <RaceCard key={race.id} race={race} index={index} />
        ))}
      </div>
    </>
  );
}
