"use client";

import { useState } from "react";
import Link from "next/link";
import { SeriesBadge } from "@/components/SeriesBadge/SeriesBadge";
import { allSessions, type SeriesCode } from "@/data/mock-races";

type Filter = "ALL" | SeriesCode;

const filters: Filter[] = ["ALL", "F1", "WEC", "WRC"];

export function CalendarSchedule() {
  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");
  const sessions =
    activeFilter === "ALL"
      ? allSessions
      : allSessions.filter(({ race }) => race.series === activeFilter);

  return (
    <div className="calendar-schedule">
      <div className="calendar-schedule__toolbar">
        <span>Series filter</span>
        <div>
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
      </div>

      <div className="calendar-schedule__month">
        <span>June</span>
        <strong>2026</strong>
      </div>

      <div className="calendar-schedule__list" aria-live="polite">
        {sessions.map(({ race, ...session }) => (
          <Link
            className="calendar-schedule__row"
            href={`/races/${race.id}`}
            key={`${race.id}-${session.name}`}
          >
            <div className="calendar-schedule__date">
              <strong>{session.date}</strong>
              <span>{session.day}</span>
            </div>
            <SeriesBadge series={race.series} />
            <div className="calendar-schedule__race">
              <strong>{race.title}</strong>
              <span>{session.name}</span>
            </div>
            {session.mustWatch && <span className="calendar-schedule__must">Must watch</span>}
            <time>{session.time} <span>KST</span></time>
          </Link>
        ))}
      </div>
    </div>
  );
}
