import { parseOfficialDateRange } from "@/lib/sync/calendar-dates";
import type { NormalizedRace, NormalizedSession } from "@/lib/sync/types";

const countries: Record<string, string> = {
  BE: "Belgium",
  BH: "Bahrain",
  BR: "Brazil",
  FR: "France",
  IT: "Italy",
  JP: "Japan",
  QA: "Qatar",
  US: "United States",
};

function clean(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extract(block: string, pattern: RegExp): string | null {
  return block.match(pattern)?.[1] ?? null;
}

function sessionType(name: string): NormalizedSession["type"] {
  if (/race/i.test(name)) return "race";
  if (/qualifying|hyperpole/i.test(name)) return "qualifying";
  if (/practice/i.test(name)) return "practice";
  return "other";
}

function sessionKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function selectWecDetailRace(
  races: NormalizedRace[],
  today = new Date().toISOString().slice(0, 10),
): NormalizedRace | null {
  return (
    [...races]
      .filter((race) => race.endDate >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null
  );
}

export function parseWecRaceSessions(
  html: string,
  raceSourceKey: string,
  raceName: string,
): NormalizedSession[] {
  const sessions: NormalizedSession[] = [];

  for (const match of html.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    let data: unknown;
    try {
      data = JSON.parse(match[1]);
    } catch {
      continue;
    }
    if (!isRecord(data) || !Array.isArray(data.subEvent)) continue;
    for (const event of data.subEvent) {
      if (!isRecord(event)) continue;
      const id = typeof event["@id"] === "string" ? event["@id"] : null;
      const rawName = typeof event.name === "string" ? event.name : null;
      const rawStartDate =
        typeof event.startDate === "string" ? event.startDate : null;
      if (!id || !rawName || !rawStartDate) continue;
      const fragment = id.split("#")[1];
      const startTimeUtc = new Date(rawStartDate);
      if (!fragment || Number.isNaN(startTimeUtc.valueOf())) continue;
      const name = rawName.endsWith(` - ${raceName}`)
        ? rawName.slice(0, -(` - ${raceName}`.length))
        : rawName;
      sessions.push({
        sourceKey: `${raceSourceKey}:${sessionKey(fragment)}`,
        name,
        type: sessionType(name),
        startTimeUtc: startTimeUtc.toISOString(),
      });
    }
  }

  return sessions.sort((a, b) => a.startTimeUtc.localeCompare(b.startTimeUtc));
}

export function parseWecCalendar(
  html: string,
  season = new Date().getUTCFullYear(),
): NormalizedRace[] {
  const marker = `<div class="splide inner-slider" data-year="${season}"`;
  const start = html.indexOf(marker);
  const next = start >= 0 ? html.indexOf('<div class="splide inner-slider" data-year="', start + marker.length) : -1;
  const yearBlock = start >= 0 ? html.slice(start, next >= 0 ? next : undefined) : "";
  const blocks = [
    ...yearBlock.matchAll(
      /<div class="calendar-item[^"]*">([\s\S]*?)(?=<div class="calendar-item|<\/ul>|$)/gi,
    ),
  ];
  const races: NormalizedRace[] = [];

  for (const match of blocks) {
    const block = match[1];
    const href = extract(block, /href="\/en\/race\/([^"]+)"/i);
    if (!href || href.includes("prologue")) continue;
    const firstTitle = extract(
      block,
      /class="ff-normal fw-bold fs-9 fs-lg-5[^"]*">([\s\S]*?)<\/div>/i,
    );
    const location = extract(
      block,
      /class="fs-9 fs-lg-4 ff-headings[^"]*">([\s\S]*?)<\/div>/i,
    );
    const date = extract(
      block,
      /class="fs-10 fs-lg-6 text-primary[^"]*">([\s\S]*?)<\/div>/i,
    );
    const countryCode = extract(block, /class="flag:([A-Z]{2})\b/i);
    if (!firstTitle || !location || !date) {
      throw new Error("WEC calendar contained malformed race rows");
    }
    const range = parseOfficialDateRange(clean(date));
    const round = races.length + 1;
    races.push({
      sourceKey: `fiawec:${href}`,
      seriesCode: "WEC",
      round,
      name: clean(`${firstTitle} ${location}`),
      slug: `wec-${href}`,
      country: countryCode ? countries[countryCode] ?? countryCode : null,
      location: clean(location),
      venueName: null,
      ...range,
      timezone: "UTC",
      sessions: [],
    });
  }

  if (races.length === 0) throw new Error("WEC calendar contained no race rounds");
  return races;
}
