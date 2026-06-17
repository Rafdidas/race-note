export type AdminRaceMutationInput = {
  race: {
    name: string;
    country: string | null;
    location: string | null;
    startDate: string;
    endDate: string;
  };
  content: {
    summaryThreeLines: string[];
    mustWatchReason: string | null;
    beginnerRules: string | null;
    raceVariables: string[];
    keyDriversOrTeams: string | null;
    notificationText: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  };
  sessions: Array<{
    id: string;
    name: string;
    startTimeUtc: string;
    isMustWatch: boolean;
  }>;
};

type PublishCandidate = {
  aiStatus: string;
  raceNeedsReview: boolean;
  sessionNeedsReview: boolean;
};

const sessionTypes = [
  "practice",
  "qualifying",
  "sprint",
  "race",
  "start",
  "sunset",
  "night",
  "sunrise",
  "final_hour",
  "power_stage",
  "stage",
  "other",
] as const;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const utcPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function requiredString(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function optionalString(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }
  return value.trim();
}

function lines(formData: FormData, name: string): string[] {
  const value = formData.get(name);
  if (typeof value !== "string") {
    return [];
  }
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const watchTargetTypes = ["driver", "team", "manufacturer", "car", "manual"] as const;
type WatchTargetType = (typeof watchTargetTypes)[number];

function optionalNumber(formData: FormData, name: string): number | null {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    throw new Error(`${name} must be an integer`);
  }
  return parsed;
}

export function parseAdminRaceForm(formData: FormData): AdminRaceMutationInput {
  const startDate = requiredString(formData, "startDate");
  const endDate = requiredString(formData, "endDate");

  if (
    !datePattern.test(startDate) ||
    !datePattern.test(endDate) ||
    startDate > endDate
  ) {
    throw new Error("Invalid date range");
  }

  const sessionIds = lines(formData, "sessionIds");
  const sessions = sessionIds.map((id) => {
    const startTimeUtc = requiredString(
      formData,
      `session.${id}.startTimeUtc`,
    );
    if (!utcPattern.test(startTimeUtc) || !Number.isFinite(Date.parse(startTimeUtc))) {
      throw new Error("Session time must be a valid UTC timestamp");
    }

    return {
      id,
      name: requiredString(formData, `session.${id}.name`),
      startTimeUtc,
      isMustWatch: formData.get(`session.${id}.mustWatch`) === "on",
    };
  });

  return {
    race: {
      name: requiredString(formData, "name"),
      country: optionalString(formData, "country"),
      location: optionalString(formData, "location"),
      startDate,
      endDate,
    },
    content: {
      summaryThreeLines: lines(formData, "summaryThreeLines"),
      mustWatchReason: optionalString(formData, "mustWatchReason"),
      beginnerRules: optionalString(formData, "beginnerRules"),
      raceVariables: lines(formData, "raceVariables"),
      keyDriversOrTeams: optionalString(formData, "keyDriversOrTeams"),
      notificationText: optionalString(formData, "notificationText"),
      seoTitle: optionalString(formData, "seoTitle"),
      seoDescription: optionalString(formData, "seoDescription"),
    },
    sessions,
  };
}

export function parseAdminAiDraftForm(
  formData: FormData,
): AdminRaceMutationInput["content"] {
  return {
    summaryThreeLines: lines(formData, "summaryThreeLines"),
    keyDriversOrTeams: optionalString(formData, "keyDriversOrTeams"),
    raceVariables: lines(formData, "raceVariables"),
    beginnerRules: optionalString(formData, "beginnerRules"),
    mustWatchReason: optionalString(formData, "mustWatchReason"),
    notificationText: optionalString(formData, "notificationText"),
    seoTitle: optionalString(formData, "seoTitle"),
    seoDescription: optionalString(formData, "seoDescription"),
  };
}

export function requiresRegenerationConfirmation(aiStatus: string): boolean {
  return aiStatus === "reviewed" || aiStatus === "published";
}

export function parseAdminGenerationConfirmation(
  formData: FormData,
  aiStatus: string,
): void {
  if (
    requiresRegenerationConfirmation(aiStatus) &&
    formData.get("confirmRegeneration") !== "on"
  ) {
    throw new Error("Regeneration confirmation is required");
  }
}

export function canPublishAdminRace(candidate: PublishCandidate): boolean {
  return (
    !candidate.raceNeedsReview &&
    !candidate.sessionNeedsReview &&
    (candidate.aiStatus === "reviewed" || candidate.aiStatus === "published")
  );
}

export type AdminSessionMutationInput = {
  name: string;
  type: (typeof sessionTypes)[number];
  startTimeUtc: string;
  isMustWatch: boolean;
};

export function parseAdminSessionForm(formData: FormData): AdminSessionMutationInput {
  const type = requiredString(formData, "type");
  const startTimeUtc = requiredString(formData, "startTimeUtc");
  if (!sessionTypes.includes(type as AdminSessionMutationInput["type"])) {
    throw new Error("Invalid session type");
  }
  if (!utcPattern.test(startTimeUtc) || !Number.isFinite(Date.parse(startTimeUtc))) {
    throw new Error("Session time must be a valid UTC timestamp");
  }
  return {
    name: requiredString(formData, "name"),
    type: type as AdminSessionMutationInput["type"],
    startTimeUtc,
    isMustWatch: formData.get("mustWatch") === "on",
  };
}

export type RaceFactsInput = {
  circuitName: string | null;
  trackLength: string | null;
  laps: number | null;
  raceDistance: string | null;
  corners: number | null;
  drsZones: number | null;
  firstHeld: number | null;
  previousWinner: string | null;
  mostWinsDriver: string | null;
  mostWinsTeam: string | null;
  lapRecord: string | null;
  poleRecord: string | null;
  tyreCompounds: string | null;
  overtakeDifficulty: string | null;
  keySector: string | null;
  weatherNote: string | null;
  strategyNote: string | null;
  beginnerNote: string | null;
};

export function parseRaceFactsForm(formData: FormData): RaceFactsInput {
  return {
    circuitName: optionalString(formData, "circuitName"),
    trackLength: optionalString(formData, "trackLength"),
    laps: optionalNumber(formData, "laps"),
    raceDistance: optionalString(formData, "raceDistance"),
    corners: optionalNumber(formData, "corners"),
    drsZones: optionalNumber(formData, "drsZones"),
    firstHeld: optionalNumber(formData, "firstHeld"),
    previousWinner: optionalString(formData, "previousWinner"),
    mostWinsDriver: optionalString(formData, "mostWinsDriver"),
    mostWinsTeam: optionalString(formData, "mostWinsTeam"),
    lapRecord: optionalString(formData, "lapRecord"),
    poleRecord: optionalString(formData, "poleRecord"),
    tyreCompounds: optionalString(formData, "tyreCompounds"),
    overtakeDifficulty: optionalString(formData, "overtakeDifficulty"),
    keySector: optionalString(formData, "keySector"),
    weatherNote: optionalString(formData, "weatherNote"),
    strategyNote: optionalString(formData, "strategyNote"),
    beginnerNote: optionalString(formData, "beginnerNote"),
  };
}

export type RaceHistoryInput = {
  season: number;
  winnerDriverName: string | null;
  winnerTeamName: string | null;
  poleDriverName: string | null;
  fastestLapDriverName: string | null;
  note: string | null;
};

export function parseRaceHistoryForm(formData: FormData): RaceHistoryInput {
  const seasonRaw = requiredString(formData, "season");
  const season = Number(seasonRaw);
  if (!Number.isInteger(season) || season < 1900 || season > 2100) {
    throw new Error("Invalid season");
  }
  return {
    season,
    winnerDriverName: optionalString(formData, "winnerDriverName"),
    winnerTeamName: optionalString(formData, "winnerTeamName"),
    poleDriverName: optionalString(formData, "poleDriverName"),
    fastestLapDriverName: optionalString(formData, "fastestLapDriverName"),
    note: optionalString(formData, "note"),
  };
}

export type WatchTargetInput = {
  targetType: WatchTargetType;
  targetName: string;
  title: string | null;
  reason: string;
};

export function parseWatchTargetForm(formData: FormData): WatchTargetInput {
  const targetType = requiredString(formData, "targetType");
  if (!watchTargetTypes.includes(targetType as WatchTargetType)) {
    throw new Error("Invalid target type");
  }
  return {
    targetType: targetType as WatchTargetType,
    targetName: requiredString(formData, "targetName"),
    title: optionalString(formData, "title"),
    reason: requiredString(formData, "reason"),
  };
}
