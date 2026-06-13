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
    },
    sessions,
  };
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
