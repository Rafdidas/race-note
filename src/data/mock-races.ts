import type { RacePreview, SeriesGuide } from "@/types/public-data";

export type { RacePreview, RaceSession, SeriesCode } from "@/types/public-data";

export const featuredRaces: RacePreview[] = [
  {
    id: "canadian-grand-prix-2026",
    series: "F1",
    title: "Canadian Grand Prix",
    location: "Montréal · Canada",
    period: "06.12 — 06.15",
    mustWatch: ["Qualifying", "Race"],
    summary:
      "낮은 다운포스와 강한 제동이 승부를 가릅니다. 세이프티카가 흐름을 바꿀 가능성도 큽니다.",
    status: "Upcoming",
    sessions: [
      { id: "mock-canada-p3", date: "06.13", day: "SAT", name: "Practice 3", time: "01:30" },
      { id: "mock-canada-quali", date: "06.14", day: "SUN", name: "Qualifying", time: "05:00", mustWatch: true },
      { id: "mock-canada-race", date: "06.15", day: "MON", name: "Race", time: "03:00", mustWatch: true },
    ],
    brief: [
      "긴 직선과 강한 제동 구간이 이어져 브레이크 관리가 중요합니다.",
      "벽이 가까운 도심형 서킷이라 작은 실수가 세이프티카로 연결될 수 있습니다.",
      "추월 기회가 분명해 타이어 전략과 피트 타이밍을 함께 보기 좋습니다.",
    ],
    beginnerNote: "예선 결과가 결승 출발 순서를 정합니다. 결승에서는 의무 타이어 규정과 피트스톱 전략이 순위를 바꿉니다.",
    variables: ["Safety car", "Brake wear", "Tyre strategy"],
  },
  {
    id: "24-hours-of-le-mans-2026",
    series: "WEC",
    title: "24 Hours of Le Mans",
    location: "Le Mans · France",
    period: "06.13 — 06.14",
    mustWatch: ["Start", "Night", "Final Hour"],
    summary:
      "여러 클래스가 동시에 달리는 24시간 레이스입니다. 야간 주행과 피트 전략을 함께 보세요.",
    status: "Next",
    sessions: [
      { id: "mock-le-mans-start", date: "06.13", day: "SAT", name: "Race Start", time: "23:00", mustWatch: true },
      { id: "mock-le-mans-night", date: "06.14", day: "SUN", name: "Night Stint", time: "04:00", mustWatch: true },
      { id: "mock-le-mans-final", date: "06.14", day: "SUN", name: "Final Hour", time: "22:00", mustWatch: true },
    ],
    brief: [
      "24시간 동안 속도와 내구성, 교대 운영을 동시에 겨루는 레이스입니다.",
      "서로 다른 속도의 여러 클래스가 함께 달려 트래픽 관리가 핵심입니다.",
      "밤과 비, 세이프티카, 피트 전략이 결과를 크게 바꿀 수 있습니다.",
    ],
    beginnerNote: "여러 클래스 차량이 동시에 달리며 전체 우승과 클래스별 우승이 따로 존재합니다. 드라이버는 일정 시간마다 교대합니다.",
    variables: ["Night running", "Traffic", "Pit strategy"],
  },
  {
    id: "acropolis-rally-greece-2026",
    series: "WRC",
    title: "Acropolis Rally Greece",
    location: "Lamia · Greece",
    period: "06.25 — 06.28",
    mustWatch: ["Opening", "Power Stage"],
    summary:
      "거친 자갈길과 높은 기온이 차를 시험합니다. 빠른 기록만큼 완주 관리가 중요합니다.",
    status: "Soon",
    sessions: [
      { id: "mock-acropolis-opening", date: "06.25", day: "THU", name: "Opening Stage", time: "01:05", mustWatch: true },
      { id: "mock-acropolis-long", date: "06.27", day: "SAT", name: "Long Stage", time: "18:40" },
      { id: "mock-acropolis-power", date: "06.28", day: "SUN", name: "Power Stage", time: "19:15", mustWatch: true },
    ],
    brief: [
      "거친 자갈길과 높은 기온이 차량 내구성을 강하게 시험합니다.",
      "빠른 기록만큼 타이어 손상과 완주를 관리하는 판단이 중요합니다.",
      "마지막 파워 스테이지에는 추가 포인트가 걸려 있습니다.",
    ],
    beginnerNote: "WRC는 차량이 한 대씩 스테이지를 달리고 기록을 합산합니다. 코드라이버가 읽는 페이스노트가 드라이버의 시야를 대신합니다.",
    variables: ["Rough gravel", "Heat", "Tyre damage"],
  },
];

export const allSessions = featuredRaces.flatMap((race) =>
  race.sessions.map((session) => ({ ...session, race })),
).sort((a, b) => `${a.date}-${a.time}`.localeCompare(`${b.date}-${b.time}`));

export const seriesGuides: SeriesGuide[] = [
  {
    code: "F1" as const,
    name: "Formula 1",
    format: "Circuit racing",
    description: "같은 서킷에서 모든 차량이 동시에 경쟁하는 최고 등급 싱글시터 레이스.",
    beginnerGuide: "Qualifying과 Race부터 보면 팀과 드라이버, 전략의 차이를 이해하기 쉽습니다.",
    keywords: ["Drivers", "Teams", "Qualifying", "Strategy"],
    firstWatch: "Qualifying + Race",
  },
  {
    code: "WEC" as const,
    name: "World Endurance Championship",
    format: "Endurance racing",
    description: "여러 클래스와 드라이버가 긴 시간을 함께 달리며 속도와 내구성을 겨루는 레이스.",
    beginnerGuide: "Start와 Final Hour부터 보면 클래스, 교대, 피트 전략의 흐름을 이해하기 쉽습니다.",
    keywords: ["Classes", "Traffic", "Driver change", "Pit cycle"],
    firstWatch: "Start + Final Hour",
  },
  {
    code: "WRC" as const,
    name: "World Rally Championship",
    format: "Stage rally",
    description: "도로와 비포장 스테이지를 한 대씩 달린 기록을 합산하는 랠리 챔피언십.",
    beginnerGuide: "Power Stage부터 보면 기록 경쟁과 보너스 포인트의 긴장감을 느끼기 쉽습니다.",
    keywords: ["Stages", "Co-driver", "Surface", "Pace notes"],
    firstWatch: "Power Stage",
  },
];
