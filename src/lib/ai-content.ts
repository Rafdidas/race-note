export type AiContentFields = {
  summaryThreeLines: string[];
  keyDriversOrTeams: string | null;
  raceVariables: string[];
  beginnerRules: string | null;
  mustWatchReason: string | null;
  notificationText: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

const limits = {
  summaryLine: 160,
  keyDriversOrTeams: 300,
  raceVariable: 120,
  beginnerRules: 800,
  mustWatchReason: 500,
  notificationText: 120,
  seoTitle: 70,
  seoDescription: 160,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedNullableString(
  value: unknown,
  field: keyof typeof limits,
): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new Error(`${field} must be a string or null`);
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > limits[field]) throw new Error(`${field} is too long`);
  return trimmed;
}

function boundedStringArray(
  value: unknown,
  field: "summaryThreeLines" | "raceVariables",
  maximumItems: number,
  maximumLength: number,
): string[] {
  if (!Array.isArray(value) || value.length > maximumItems) {
    throw new Error(`${field} is invalid`);
  }
  const strings = value.map((item) => {
    if (typeof item !== "string") throw new Error(`${field} is invalid`);
    const trimmed = item.trim();
    if (!trimmed || trimmed.length > maximumLength) {
      throw new Error(`${field} is invalid`);
    }
    return trimmed;
  });
  return strings;
}

export function parseAiContentFields(value: unknown): AiContentFields {
  if (!isRecord(value)) throw new Error("AI content must be an object");
  const summaryThreeLines = boundedStringArray(
    value.summaryThreeLines,
    "summaryThreeLines",
    3,
    limits.summaryLine,
  );
  if (summaryThreeLines.length !== 3) {
    throw new Error("summaryThreeLines must contain exactly three lines");
  }
  return {
    summaryThreeLines,
    keyDriversOrTeams: boundedNullableString(
      value.keyDriversOrTeams,
      "keyDriversOrTeams",
    ),
    raceVariables: boundedStringArray(
      value.raceVariables,
      "raceVariables",
      5,
      limits.raceVariable,
    ),
    beginnerRules: boundedNullableString(value.beginnerRules, "beginnerRules"),
    mustWatchReason: boundedNullableString(value.mustWatchReason, "mustWatchReason"),
    notificationText: boundedNullableString(value.notificationText, "notificationText"),
    seoTitle: boundedNullableString(value.seoTitle, "seoTitle"),
    seoDescription: boundedNullableString(value.seoDescription, "seoDescription"),
  };
}
