export type ScheduleEntityType = "race" | "session";
export type ScheduleFieldValue = string | number | null;

export type NormalizedSession = {
  sourceKey: string;
  name: string;
  type:
    | "practice"
    | "qualifying"
    | "sprint"
    | "race"
    | "other";
  startTimeUtc: string;
};

export type NormalizedRace = {
  sourceKey: string;
  seriesCode: "F1" | "WEC" | "WRC";
  season: number;
  round: number;
  name: string;
  slug: string;
  country: string | null;
  location: string | null;
  venueName: string | null;
  startDate: string;
  endDate: string;
  timezone: "UTC";
  sessions: NormalizedSession[];
};

export type ScheduleChange = {
  entityType: ScheduleEntityType;
  entityId: string;
  fieldName: string;
  oldValue: ScheduleFieldValue;
  newValue: ScheduleFieldValue;
  changeStatus: "needs_review" | "ignored";
};
