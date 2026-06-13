const months: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function iso(year: number, month: number, day: number): string {
  const value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (
    Number.isNaN(parsed.valueOf()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error("Invalid calendar date");
  }
  return value;
}

function month(value: string): number {
  const result = months[value.toLowerCase()];
  if (!result) throw new Error("Invalid calendar month");
  return result;
}

export function parseOfficialDateRange(value: string): {
  startDate: string;
  endDate: string;
  season: number;
} {
  const normalized = value.replace(/^from\s+/i, "").trim();
  const crossMonth = normalized.match(
    /^(\d{1,2})\s+([a-z]+)\s*-\s*(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i,
  );
  if (crossMonth) {
    const season = Number(crossMonth[5]);
    return {
      startDate: iso(season, month(crossMonth[2]), Number(crossMonth[1])),
      endDate: iso(season, month(crossMonth[4]), Number(crossMonth[3])),
      season,
    };
  }

  const sameMonth = normalized.match(
    /^(\d{1,2})(?:\s+to|\s*-)\s*(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i,
  );
  if (sameMonth) {
    const season = Number(sameMonth[4]);
    const monthValue = month(sameMonth[3]);
    return {
      startDate: iso(season, monthValue, Number(sameMonth[1])),
      endDate: iso(season, monthValue, Number(sameMonth[2])),
      season,
    };
  }

  const single = normalized.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i);
  if (single) {
    const season = Number(single[3]);
    const date = iso(season, month(single[2]), Number(single[1]));
    return { startDate: date, endDate: date, season };
  }
  throw new Error("Invalid official calendar date range");
}

