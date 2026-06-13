import { parseOfficialDateRange } from "@/lib/sync/calendar-dates";
import type { NormalizedRace } from "@/lib/sync/types";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findTables(value: unknown, result: unknown[][] = []): unknown[][] {
  if (Array.isArray(value)) {
    for (const item of value) findTables(item, result);
  } else if (isRecord(value)) {
    if (value.type === "table" && Array.isArray(value.rows)) result.push(value.rows);
    for (const item of Object.values(value)) findTables(item, result);
  }
  return result;
}

function cellParts(cell: unknown): RecordValue[] {
  return Array.isArray(cell) ? cell.filter(isRecord) : [];
}

function cellText(cell: unknown): string {
  return cellParts(cell)
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
    .trim();
}

export function parseWrcCalendar(html: string): NormalizedRace[] {
  const json = html.match(
    /<script type="application\/json" id="rb3-prerender-data-cache">([\s\S]*?)<\/script>/i,
  )?.[1];
  if (!json) throw new Error("WRC calendar data was not found");
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("WRC calendar data was invalid JSON");
  }
  const table = findTables(data).find((rows) => rows.length > 0);
  if (!table) throw new Error("WRC calendar contained no race rounds");

  const races = table.map((row) => {
    if (!Array.isArray(row) || row.length < 3) {
      throw new Error("WRC calendar contained malformed race rows");
    }
    const round = Number(cellText(row[0]));
    const eventParts = cellParts(row[1]);
    const link = eventParts.find((part) => isRecord(part.reference));
    const href =
      link && isRecord(link.reference) && typeof link.reference.href === "string"
        ? link.reference.href
        : null;
    const resourceId = link && typeof link.resourceId === "string" ? link.resourceId : null;
    const name = cellText(row[1]);
    const range = parseOfficialDateRange(cellText(row[2]));
    const resourceKey = resourceId?.match(/event-profiles:([^:]+):/)?.[1];
    const slug = href?.split("/").filter(Boolean).at(-1);
    if (!Number.isInteger(round) || !name || !resourceKey || !slug) {
      throw new Error("WRC calendar contained malformed race rows");
    }
    return {
      sourceKey: `wrc:${resourceKey}`,
      seriesCode: "WRC" as const,
      round,
      name,
      slug: `wrc-${slug}`,
      country: null,
      location: null,
      venueName: null,
      ...range,
      timezone: "UTC" as const,
      sessions: [],
    };
  });

  if (races.length === 0) throw new Error("WRC calendar contained no race rounds");
  return races;
}
