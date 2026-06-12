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
