export type SeriesCode = "F1" | "WEC" | "WRC";

export type RaceSession = {
  id: string;
  date: string;
  day: string;
  name: string;
  time: string;
  mustWatch?: boolean;
};

export type RacePreview = {
  id: string;
  series: SeriesCode;
  title: string;
  location: string;
  period: string;
  mustWatch: string[];
  summary: string;
  status: string;
  sessions: RaceSession[];
  brief: string[];
  beginnerNote: string;
  variables: string[];
  facts?: RaceFacts | null;
  history?: RaceHistoryEntry[];
  watchTargets?: WatchTarget[];
  nextRace?: RelatedRaceCard | null;
  featuredOther?: RelatedRaceCard[];
};

export type RaceFacts = {
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

export type RaceHistoryEntry = {
  season: number;
  winnerDriverName: string | null;
  winnerTeamName: string | null;
  poleDriverName: string | null;
  fastestLapDriverName: string | null;
  note: string | null;
};

export type WatchTarget = {
  targetType: "driver" | "team" | "manufacturer" | "car" | "manual";
  targetName: string;
  title: string | null;
  reason: string;
};

export type RelatedRaceCard = {
  slug: string;
  series: SeriesCode;
  title: string;
  location: string;
  period: string;
};

export type CalendarSession = RaceSession & {
  race: RacePreview;
};

export type SeriesGuide = {
  code: SeriesCode;
  name: string;
  format: string;
  description: string;
  beginnerGuide: string;
  keywords: string[];
  firstWatch: string;
};

export type PublicRaceRow = {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  status: string;
  seriesCode: string;
  summary: string | null;
  brief: string[] | null;
  beginnerNote: string | null;
  variables: string[] | null;
};

export type PublicSessionRow = {
  id: string;
  raceId: string;
  name: string;
  startTimeUtc: string;
  isMustWatch: boolean;
};
