# F1 레이스 상세 강화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** F1 레이스 상세 페이지에 Quick Facts·History·Who to Watch·Next Race·Explore 섹션을 추가하고, 관리자 편집 화면을 탭 구조로 전환해 해당 데이터를 직접 입력하게 한다.

**Architecture:** D1에 `race_facts`/`race_history`/`race_watch_targets` 3개 테이블을 추가한다. 순수 변환·파싱 함수는 `node:test`로 TDD하고, D1 조회·mutation은 기존 `runD1Batch` 패턴을 따른다. 공개/관리자 UI는 기존 Server Component + Server Action 구조를 유지하며 탭은 URL 쿼리(`?tab=`)로 전환한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle ORM + Cloudflare D1, SCSS(BEM), `tsx --test`(node:test).

## Global Constraints

- 스택 고정: Next.js 16 App Router + React 19 + TypeScript, SCSS 전역 + BEM, Drizzle + D1. 새 패키지 설치 금지.
- `any` 금지. 외부 입력은 `unknown`에서 좁힌다.
- DB 시간은 UTC 저장, 화면은 KST 표시(기존 `Intl.DateTimeFormat` `Asia/Seoul` 유틸 재사용).
- 원격 D1 쓰기는 Drizzle `transaction()` 금지, `runD1Batch`(원자적 `batch`) 사용. 다중 값 바인딩 조회는 `d1-helpers` 한도로 분할.
- 마이그레이션은 `drizzle-kit generate` 무응답 이슈로 손으로 작성하고 메모리 SQLite로 검증한다(기존 0001~0005와 동일).
- Facts/History/Watch Targets 저장은 **검수 흐름 없이 즉시 반영**한다. 레이스를 `needs_review`로 전환하지 않는다.
- 이번 범위는 **F1만**. 스키마는 범용, 콘텐츠 입력·표시는 F1 기준. WEC/WRC 상세는 신규 섹션 없이 기존 모습 유지(값이 없으면 섹션 미렌더).
- **커밋/배포는 사용자 명시 요청 시에만.** 각 task의 Commit 스텝은 사용자 정책에 따라 보류하거나 사용자가 직접 수행한다. 원격 D1 마이그레이션·운영 배포는 이 plan 범위 밖.
- 테스트: `npm test`(tsx --test, 순수 함수만). 마이그레이션 검증: `sqlite3 :memory: ".read ..." "PRAGMA foreign_key_check;"`. 타입/페이지: `npm run build`. Cloudflare: `npm run cf:build`.

---

### Task 1: DB 스키마 + 마이그레이션 0006

세 테이블의 Drizzle 스키마와 손으로 작성한 마이그레이션을 추가하고 메모리 SQLite로 적용을 검증한다.

**Files:**
- Modify: `src/db/schema/index.ts`
- Create: `drizzle/migrations/0006_race_detail.sql`

**Interfaces:**
- Produces: Drizzle 테이블 `raceFacts`, `raceHistory`, `raceWatchTargets`. 타입 `RaceFactsRow`(`typeof raceFacts.$inferSelect`), `NewRaceFactsRow`, `RaceHistoryRow`, `NewRaceHistoryRow`, `RaceWatchTargetRow`, `NewRaceWatchTargetRow`.

- [ ] **Step 1: Drizzle 스키마 추가**

`src/db/schema/index.ts`의 `manualOverrides` 정의 다음, `adminSessions` 정의 앞에 추가한다. 상단 상수 영역에 watch target 타입 union을 추가한다.

```ts
const watchTargetTypes = ["driver", "team", "manufacturer", "car", "manual"] as const;
```

```ts
export const raceFacts = sqliteTable("race_facts", {
  id: text("id").primaryKey(),
  raceId: text("race_id")
    .notNull()
    .unique()
    .references(() => races.id, { onDelete: "cascade", onUpdate: "cascade" }),
  circuitName: text("circuit_name"),
  trackLength: text("track_length"),
  laps: integer("laps"),
  raceDistance: text("race_distance"),
  corners: integer("corners"),
  drsZones: integer("drs_zones"),
  firstHeld: integer("first_held"),
  previousWinner: text("previous_winner"),
  mostWinsDriver: text("most_wins_driver"),
  mostWinsTeam: text("most_wins_team"),
  lapRecord: text("lap_record"),
  poleRecord: text("pole_record"),
  tyreCompounds: text("tyre_compounds"),
  overtakeDifficulty: text("overtake_difficulty"),
  keySector: text("key_sector"),
  surfaceType: text("surface_type"),
  totalStages: integer("total_stages"),
  totalDistance: text("total_distance"),
  eventDuration: text("event_duration"),
  classes: text("classes"),
  weatherNote: text("weather_note"),
  strategyNote: text("strategy_note"),
  beginnerNote: text("beginner_note"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const raceHistory = sqliteTable(
  "race_history",
  {
    id: text("id").primaryKey(),
    raceId: text("race_id")
      .notNull()
      .references(() => races.id, { onDelete: "cascade", onUpdate: "cascade" }),
    season: integer("season").notNull(),
    winnerDriverName: text("winner_driver_name"),
    winnerTeamName: text("winner_team_name"),
    poleDriverName: text("pole_driver_name"),
    fastestLapDriverName: text("fastest_lap_driver_name"),
    note: text("note"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("race_history_race_id_idx").on(table.raceId, table.season)],
);

export const raceWatchTargets = sqliteTable(
  "race_watch_targets",
  {
    id: text("id").primaryKey(),
    raceId: text("race_id")
      .notNull()
      .references(() => races.id, { onDelete: "cascade", onUpdate: "cascade" }),
    targetType: text("target_type", { enum: watchTargetTypes }).notNull(),
    targetId: text("target_id"),
    targetName: text("target_name").notNull(),
    title: text("title"),
    reason: text("reason").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("race_watch_targets_race_id_idx").on(table.raceId, table.displayOrder)],
);
```

파일 하단 타입 export 영역에 추가한다.

```ts
export type RaceFactsRow = typeof raceFacts.$inferSelect;
export type NewRaceFactsRow = typeof raceFacts.$inferInsert;
export type RaceHistoryRow = typeof raceHistory.$inferSelect;
export type NewRaceHistoryRow = typeof raceHistory.$inferInsert;
export type RaceWatchTargetRow = typeof raceWatchTargets.$inferSelect;
export type NewRaceWatchTargetRow = typeof raceWatchTargets.$inferInsert;
```

- [ ] **Step 2: 마이그레이션 SQL 작성**

`drizzle/migrations/0006_race_detail.sql` 생성. 기존 0003 형식(백틱, `--> statement-breakpoint`)을 따른다.

```sql
CREATE TABLE `race_facts` (
  `id` text PRIMARY KEY NOT NULL,
  `race_id` text NOT NULL,
  `circuit_name` text,
  `track_length` text,
  `laps` integer,
  `race_distance` text,
  `corners` integer,
  `drs_zones` integer,
  `first_held` integer,
  `previous_winner` text,
  `most_wins_driver` text,
  `most_wins_team` text,
  `lap_record` text,
  `pole_record` text,
  `tyre_compounds` text,
  `overtake_difficulty` text,
  `key_sector` text,
  `surface_type` text,
  `total_stages` integer,
  `total_distance` text,
  `event_duration` text,
  `classes` text,
  `weather_note` text,
  `strategy_note` text,
  `beginner_note` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `race_facts_race_id_unique` ON `race_facts` (`race_id`);
--> statement-breakpoint
CREATE TABLE `race_history` (
  `id` text PRIMARY KEY NOT NULL,
  `race_id` text NOT NULL,
  `season` integer NOT NULL,
  `winner_driver_name` text,
  `winner_team_name` text,
  `pole_driver_name` text,
  `fastest_lap_driver_name` text,
  `note` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `race_history_race_id_idx` ON `race_history` (`race_id`,`season`);
--> statement-breakpoint
CREATE TABLE `race_watch_targets` (
  `id` text PRIMARY KEY NOT NULL,
  `race_id` text NOT NULL,
  `target_type` text NOT NULL,
  `target_id` text,
  `target_name` text NOT NULL,
  `title` text,
  `reason` text NOT NULL,
  `display_order` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `race_watch_targets_race_id_idx` ON `race_watch_targets` (`race_id`,`display_order`);
```

- [ ] **Step 3: 마이그레이션 적용 검증**

기존 마이그레이션을 순서대로 적용한 뒤 0006을 적용하고 외래키를 검사한다. `--> statement-breakpoint` 주석은 SQLite가 무시하므로 `.read`로 그대로 읽을 수 있다.

Run (Git Bash):
```bash
sqlite3 :memory: \
  ".read drizzle/migrations/0000_initial.sql" \
  ".read drizzle/migrations/0001_manual_overrides.sql" \
  ".read drizzle/migrations/0002_wec_wrc_sources.sql" \
  ".read drizzle/migrations/0003_ai_content_drafts.sql" \
  ".read drizzle/migrations/0004_wrc_json_source.sql" \
  ".read drizzle/migrations/0005_wec_detail_source.sql" \
  ".read drizzle/migrations/0006_race_detail.sql" \
  ".read drizzle/seed.sql" \
  ".read drizzle/seed.sql" \
  "PRAGMA foreign_key_check;" \
  "SELECT count(*) FROM race_facts;"
```
Expected: 오류 출력 없음. `PRAGMA foreign_key_check` 빈 결과. 마지막 `SELECT`는 `0`.

- [ ] **Step 4: 타입 빌드 검증**

Run: `npm run build`
Expected: `Compiled successfully`, `Finished TypeScript` (스키마 타입 오류 없음).

- [ ] **Step 5: Commit (사용자 승인 시)**

```bash
git add src/db/schema/index.ts drizzle/migrations/0006_race_detail.sql
git commit -m "feat: add race_facts/race_history/race_watch_targets schema and migration"
```

---

### Task 2: 공개 타입 + 변환 함수 (TDD)

공개 화면 모델 타입과, D1 row를 화면 모델로 바꾸는 순수 변환 함수를 추가한다.

**Files:**
- Modify: `src/types/public-data.ts`
- Modify: `src/lib/public-data-format.ts`
- Test: `src/lib/public-data-format.test.ts`

**Interfaces:**
- Consumes: `RaceFactsRow`, `RaceHistoryRow`, `RaceWatchTargetRow` (Task 1).
- Produces:
  - 타입 `RaceFacts`, `RaceHistoryEntry`, `WatchTarget`, `RelatedRaceCard` (5.1 spec).
  - `RacePreview` 확장 필드: `facts?: RaceFacts | null`, `history?: RaceHistoryEntry[]`, `watchTargets?: WatchTarget[]`, `nextRace?: RelatedRaceCard | null`, `featuredOther?: RelatedRaceCard[]`.
  - `mapPublicRaceFacts(row: RaceFactsRow | undefined): RaceFacts | null` — 모든 콘텐츠 필드가 null이면 `null` 반환.
  - `mapRaceHistory(rows: RaceHistoryRow[]): RaceHistoryEntry[]` — season 내림차순.
  - `mapWatchTargets(rows: RaceWatchTargetRow[]): WatchTarget[]` — displayOrder 오름차순.
  - `mapRelatedRaceCard(row: { slug; seriesCode; name; location; country; startDate; endDate }): RelatedRaceCard`.

- [ ] **Step 1: 타입 추가**

`src/types/public-data.ts`에 추가하고 `RacePreview`를 확장한다.

```ts
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
```

`RacePreview` 타입 본문 끝(`variables: string[];` 다음)에 옵셔널 필드를 추가한다.

```ts
  facts?: RaceFacts | null;
  history?: RaceHistoryEntry[];
  watchTargets?: WatchTarget[];
  nextRace?: RelatedRaceCard | null;
  featuredOther?: RelatedRaceCard[];
```

- [ ] **Step 2: 실패하는 테스트 작성**

`src/lib/public-data-format.test.ts` 끝에 추가한다. import 줄에 새 함수를 더한다.

```ts
import {
  formatKstSession,
  mapPublicRace,
  mapPublicRaceFacts,
  mapRaceHistory,
  mapWatchTargets,
  mapRelatedRaceCard,
} from "./public-data-format";
import type {
  PublicRaceRow,
  PublicSessionRow,
  RaceFactsRow,
  RaceHistoryRow,
  RaceWatchTargetRow,
} from "../types/public-data";
```

(주: `RaceFactsRow` 등 row 타입은 `@/db/schema`에서 오므로 import 경로는 `../db/schema`를 쓴다. 아래 import로 교체한다.)

```ts
import type {
  RaceFactsRow,
  RaceHistoryRow,
  RaceWatchTargetRow,
} from "../db/schema";
```

테스트 본문:

```ts
function factsRow(overrides: Partial<RaceFactsRow>): RaceFactsRow {
  return {
    id: "facts-1",
    raceId: "race-1",
    circuitName: null,
    trackLength: null,
    laps: null,
    raceDistance: null,
    corners: null,
    drsZones: null,
    firstHeld: null,
    previousWinner: null,
    mostWinsDriver: null,
    mostWinsTeam: null,
    lapRecord: null,
    poleRecord: null,
    tyreCompounds: null,
    overtakeDifficulty: null,
    keySector: null,
    surfaceType: null,
    totalStages: null,
    totalDistance: null,
    eventDuration: null,
    classes: null,
    weatherNote: null,
    strategyNote: null,
    beginnerNote: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

test("returns null facts when every content field is empty", () => {
  assert.equal(mapPublicRaceFacts(factsRow({})), null);
  assert.equal(mapPublicRaceFacts(undefined), null);
});

test("maps facts row to public facts when any field is present", () => {
  const facts = mapPublicRaceFacts(factsRow({ trackLength: "5.807km", laps: 53 }));
  assert.equal(facts?.trackLength, "5.807km");
  assert.equal(facts?.laps, 53);
  assert.equal(facts?.corners, null);
});

test("orders history by season descending", () => {
  const rows: RaceHistoryRow[] = [
    { id: "h1", raceId: "race-1", season: 2024, winnerDriverName: "A", winnerTeamName: null, poleDriverName: null, fastestLapDriverName: null, note: null, createdAt: "x", updatedAt: "x" },
    { id: "h2", raceId: "race-1", season: 2025, winnerDriverName: "B", winnerTeamName: null, poleDriverName: null, fastestLapDriverName: null, note: null, createdAt: "x", updatedAt: "x" },
  ];
  assert.deepEqual(mapRaceHistory(rows).map((h) => h.season), [2025, 2024]);
});

test("orders watch targets by display order ascending", () => {
  const rows: RaceWatchTargetRow[] = [
    { id: "w2", raceId: "race-1", targetType: "team", targetId: null, targetName: "Ferrari", title: null, reason: "예선 페이스", displayOrder: 2, createdAt: "x", updatedAt: "x" },
    { id: "w1", raceId: "race-1", targetType: "driver", targetId: null, targetName: "Verstappen", title: "주목", reason: "고속 코너 강점", displayOrder: 1, createdAt: "x", updatedAt: "x" },
  ];
  assert.deepEqual(mapWatchTargets(rows).map((w) => w.targetName), ["Verstappen", "Ferrari"]);
});

test("maps a related race card with KST period and joined location", () => {
  const card = mapRelatedRaceCard({
    slug: "bahrain-grand-prix-2026",
    seriesCode: "F1",
    name: "Bahrain Grand Prix",
    location: "Sakhir",
    country: "Bahrain",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
  });
  assert.deepEqual(card, {
    slug: "bahrain-grand-prix-2026",
    series: "F1",
    title: "Bahrain Grand Prix",
    location: "Sakhir · Bahrain",
    period: "04.10 — 04.12",
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npm test`
Expected: FAIL — `mapPublicRaceFacts is not a function` 등.

- [ ] **Step 4: 변환 함수 구현**

`src/lib/public-data-format.ts`에 추가한다. 상단 import에 row 타입을 더한다.

```ts
import type {
  RaceFactsRow,
  RaceHistoryRow,
  RaceWatchTargetRow,
} from "@/db/schema";
import type {
  RaceFacts,
  RaceHistoryEntry,
  RelatedRaceCard,
  WatchTarget,
} from "@/types/public-data";
```

함수 본문(파일 끝):

```ts
export function mapPublicRaceFacts(row: RaceFactsRow | undefined): RaceFacts | null {
  if (!row) return null;
  const facts: RaceFacts = {
    circuitName: row.circuitName,
    trackLength: row.trackLength,
    laps: row.laps,
    raceDistance: row.raceDistance,
    corners: row.corners,
    drsZones: row.drsZones,
    firstHeld: row.firstHeld,
    previousWinner: row.previousWinner,
    mostWinsDriver: row.mostWinsDriver,
    mostWinsTeam: row.mostWinsTeam,
    lapRecord: row.lapRecord,
    poleRecord: row.poleRecord,
    tyreCompounds: row.tyreCompounds,
    overtakeDifficulty: row.overtakeDifficulty,
    keySector: row.keySector,
    weatherNote: row.weatherNote,
    strategyNote: row.strategyNote,
    beginnerNote: row.beginnerNote,
  };
  const hasValue = Object.values(facts).some((value) => value !== null);
  return hasValue ? facts : null;
}

export function mapRaceHistory(rows: RaceHistoryRow[]): RaceHistoryEntry[] {
  return [...rows]
    .sort((a, b) => b.season - a.season)
    .map((row) => ({
      season: row.season,
      winnerDriverName: row.winnerDriverName,
      winnerTeamName: row.winnerTeamName,
      poleDriverName: row.poleDriverName,
      fastestLapDriverName: row.fastestLapDriverName,
      note: row.note,
    }));
}

export function mapWatchTargets(rows: RaceWatchTargetRow[]): WatchTarget[] {
  return [...rows]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((row) => ({
      targetType: row.targetType,
      targetName: row.targetName,
      title: row.title,
      reason: row.reason,
    }));
}

export function mapRelatedRaceCard(row: {
  slug: string;
  seriesCode: string;
  name: string;
  location: string | null;
  country: string | null;
  startDate: string;
  endDate: string;
}): RelatedRaceCard {
  return {
    slug: row.slug,
    series: assertSeriesCode(row.seriesCode),
    title: row.name,
    location: [row.location, row.country].filter(Boolean).join(" · "),
    period: `${formatDateRangePart(row.startDate)} — ${formatDateRangePart(row.endDate)}`,
  };
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (신규 5개 포함 전체 통과).

- [ ] **Step 6: Commit (사용자 승인 시)**

```bash
git add src/types/public-data.ts src/lib/public-data-format.ts src/lib/public-data-format.test.ts
git commit -m "feat: add public race facts/history/watch-target mappers"
```

---

### Task 3: 공개 조회 계층 확장

`getPublishedRaceBySlug`가 facts/history/watchTargets/nextRace/featuredOther를 조회해 `RacePreview`에 담는다.

**Files:**
- Modify: `src/lib/public-data.ts`

**Interfaces:**
- Consumes: `mapPublicRaceFacts`, `mapRaceHistory`, `mapWatchTargets`, `mapRelatedRaceCard` (Task 2); 스키마 `raceFacts`, `raceHistory`, `raceWatchTargets` (Task 1).
- Produces: `getPublishedRaceBySlug`가 확장 필드를 채운 `RacePreview` 반환.

- [ ] **Step 1: import 추가**

`src/lib/public-data.ts` 상단 import를 확장한다.

```ts
import { and, asc, desc, eq, gt, inArray, lt, ne } from "drizzle-orm";
import { raceContents, raceFacts, raceHistory, raceWatchTargets, races, series, sessions } from "@/db/schema";
import {
  mapPublicRace,
  mapPublicRaceFacts,
  mapRaceHistory,
  mapWatchTargets,
  mapRelatedRaceCard,
} from "@/lib/public-data-format";
```

- [ ] **Step 2: 상세 확장 조회 헬퍼 추가**

`getPublishedRaceBySlug` 위에 헬퍼를 추가한다. `seriesId`/`startDate`는 상세 레이스의 것을 받는다.

```ts
async function getRaceDetailExtras(
  raceId: string,
  seriesId: string,
  startDate: string,
) {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [factsRows, historyRows, watchRows, nextRows, featuredRows] = await Promise.all([
    db.select().from(raceFacts).where(eq(raceFacts.raceId, raceId)).limit(1),
    db.select().from(raceHistory).where(eq(raceHistory.raceId, raceId)),
    db.select().from(raceWatchTargets).where(eq(raceWatchTargets.raceId, raceId)),
    db
      .select({
        slug: races.slug,
        seriesCode: series.code,
        name: races.name,
        location: races.location,
        country: races.country,
        startDate: races.startDate,
        endDate: races.endDate,
      })
      .from(races)
      .innerJoin(series, eq(races.seriesId, series.id))
      .where(
        and(
          eq(races.publishStatus, "published"),
          eq(races.seriesId, seriesId),
          gt(races.startDate, startDate),
        ),
      )
      .orderBy(asc(races.startDate))
      .limit(1),
    db
      .select({
        slug: races.slug,
        seriesCode: series.code,
        name: races.name,
        location: races.location,
        country: races.country,
        startDate: races.startDate,
        endDate: races.endDate,
      })
      .from(races)
      .innerJoin(series, eq(races.seriesId, series.id))
      .where(
        and(
          eq(races.publishStatus, "published"),
          eq(races.isFeatured, true),
          ne(races.seriesId, seriesId),
          gt(races.endDate, today),
        ),
      )
      .orderBy(asc(races.startDate))
      .limit(2),
  ]);

  return {
    facts: mapPublicRaceFacts(factsRows[0]),
    history: mapRaceHistory(historyRows),
    watchTargets: mapWatchTargets(watchRows),
    nextRace: nextRows[0] ? mapRelatedRaceCard(nextRows[0]) : null,
    featuredOther: featuredRows.map(mapRelatedRaceCard),
  };
}
```

(주: `gt(races.endDate, today)`는 오늘 이후 종료 레이스를 추천 후보로 둔다. spec의 `end_date >= 오늘`을 단순 비교로 근사한다. `lt`는 미사용이면 import에서 제거한다.)

- [ ] **Step 3: getPublishedRaceBySlug에서 확장 조회 병합**

상세 레이스의 `id`/`seriesId`/`startDate`가 필요하다. 기존 `getPublicRaceRows`는 `seriesId`/`startDate`를 select하지 않으므로, slug 분기에서 별도로 조회한다.

```ts
export async function getPublishedRaceBySlug(
  slug: string,
): Promise<RacePreview | null> {
  if (process.env.NODE_ENV === "development") {
    return mockRaces.find((race) => race.id === slug) ?? null;
  }

  const rows = await getPublicRaceRows(slug);
  const race = rows.races[0];
  if (!race) return null;

  const base = mapPublicRace(race, rows.sessions);

  const db = await getDb();
  const meta = await db
    .select({ id: races.id, seriesId: races.seriesId, startDate: races.startDate })
    .from(races)
    .where(eq(races.slug, slug))
    .limit(1);
  if (!meta[0]) return base;

  const extras = await getRaceDetailExtras(meta[0].id, meta[0].seriesId, meta[0].startDate);
  return { ...base, ...extras };
}
```

- [ ] **Step 4: 빌드 검증**

Run: `npm run build`
Expected: `Compiled successfully`, TypeScript 오류 없음. (개발 모드 mock fallback은 확장 필드가 `undefined`라 UI에서 미렌더 — Task 4에서 옵셔널 처리.)

- [ ] **Step 5: Cloudflare 빌드 검증**

Run: `npm run cf:build`
Expected: 빌드 통과(워닝 허용).

- [ ] **Step 6: Commit (사용자 승인 시)**

```bash
git add src/lib/public-data.ts
git commit -m "feat: load race facts/history/watch-targets/next-race in public detail"
```

---

### Task 4: 공개 레이스 상세 UI

신규 섹션 컴포넌트 4개를 만들고 상세 페이지에 통합한다. 값이 없으면 섹션을 렌더링하지 않는다.

**Files:**
- Create: `src/components/RaceFacts/RaceFacts.tsx`, `src/components/RaceFacts/RaceFacts.scss`
- Create: `src/components/RaceHistory/RaceHistory.tsx`, `src/components/RaceHistory/RaceHistory.scss`
- Create: `src/components/WatchTargetList/WatchTargetList.tsx`, `src/components/WatchTargetList/WatchTargetList.scss`
- Create: `src/components/RelatedRaceCard/RelatedRaceCard.tsx`, `src/components/RelatedRaceCard/RelatedRaceCard.scss`
- Modify: `src/app/races/[slug]/page.tsx`
- Modify: `src/app/public-pages.scss` (필요 시 상세 섹션 간격만)

**Interfaces:**
- Consumes: `RaceFacts`, `RaceHistoryEntry`, `WatchTarget`, `RelatedRaceCard` (Task 2).
- Produces: 컴포넌트 `RaceFacts`, `RaceHistory`, `WatchTargetList`, `RelatedRaceCard`(카드 1개 렌더, Next Race와 Explore에서 재사용).

- [ ] **Step 1: RaceFacts 컴포넌트**

`src/components/RaceFacts/RaceFacts.tsx`. 짧은 수치는 라벨/값 그리드, 서술형(keySector/strategyNote/weatherNote/beginnerNote)은 메모 블록.

```tsx
import type { RaceFacts as RaceFactsModel } from "@/types/public-data";

type FactItem = { label: string; value: string };

function buildFactItems(facts: RaceFactsModel): FactItem[] {
  const items: Array<[string, string | number | null]> = [
    ["Circuit", facts.circuitName],
    ["Track length", facts.trackLength],
    ["Laps", facts.laps],
    ["Race distance", facts.raceDistance],
    ["Corners", facts.corners],
    ["DRS zones", facts.drsZones],
    ["First held", facts.firstHeld],
    ["Previous winner", facts.previousWinner],
    ["Most wins (driver)", facts.mostWinsDriver],
    ["Most wins (team)", facts.mostWinsTeam],
    ["Lap record", facts.lapRecord],
    ["Pole record", facts.poleRecord],
    ["Tyre compounds", facts.tyreCompounds],
    ["Overtake difficulty", facts.overtakeDifficulty],
  ];
  return items
    .filter(([, value]) => value !== null && value !== "")
    .map(([label, value]) => ({ label, value: String(value) }));
}

export function RaceFacts({ facts }: { facts: RaceFactsModel }) {
  const items = buildFactItems(facts);
  const notes: Array<[string, string | null]> = [
    ["Key sector", facts.keySector],
    ["Strategy", facts.strategyNote],
    ["Weather", facts.weatherNote],
    ["Beginner note", facts.beginnerNote],
  ];
  const visibleNotes = notes.filter(([, value]) => value !== null && value !== "");

  return (
    <div className="race-facts">
      {items.length > 0 && (
        <dl className="race-facts__grid">
          {items.map((item) => (
            <div className="race-facts__item" key={item.label}>
              <dt className="race-facts__label">{item.label}</dt>
              <dd className="race-facts__value type-mono">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {visibleNotes.length > 0 && (
        <div className="race-facts__notes">
          {visibleNotes.map(([label, value]) => (
            <div className="race-facts__note" key={label}>
              <span className="race-facts__label">{label}</span>
              <p className="type-korean">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

`src/components/RaceFacts/RaceFacts.scss` — 기존 토큰 사용, 라이트/다크 공용.

```scss
.race-facts {
  display: grid;
  gap: 24px;

  &__grid {
    display: grid;
    gap: 1px;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    margin: 0;
  }

  &__item {
    border-top: 1px solid var(--color-line);
    padding: 12px 0;
  }

  &__label {
    color: var(--color-text-muted);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__value {
    font-size: 1rem;
    margin-top: 6px;
  }

  &__notes {
    display: grid;
    gap: 16px;
  }

  &__note p {
    color: var(--color-text-muted);
    line-height: 1.7;
    margin: 6px 0 0;
  }
}
```

- [ ] **Step 2: RaceHistory 컴포넌트**

`src/components/RaceHistory/RaceHistory.tsx`.

```tsx
import type { RaceHistoryEntry } from "@/types/public-data";

export function RaceHistory({ entries }: { entries: RaceHistoryEntry[] }) {
  return (
    <ul className="race-history">
      {entries.map((entry) => (
        <li className="race-history__row" key={entry.season}>
          <span className="race-history__season type-mono">{entry.season}</span>
          <div className="race-history__detail">
            <span className="race-history__winner">
              {entry.winnerDriverName ?? "기록 없음"}
              {entry.winnerTeamName ? ` · ${entry.winnerTeamName}` : ""}
            </span>
            {(entry.poleDriverName || entry.fastestLapDriverName || entry.note) && (
              <span className="race-history__meta">
                {[
                  entry.poleDriverName ? `Pole ${entry.poleDriverName}` : null,
                  entry.fastestLapDriverName ? `FL ${entry.fastestLapDriverName}` : null,
                  entry.note,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
```

`src/components/RaceHistory/RaceHistory.scss`.

```scss
.race-history {
  list-style: none;
  margin: 0;
  padding: 0;

  &__row {
    border-top: 1px solid var(--color-line);
    display: grid;
    gap: 16px;
    grid-template-columns: 64px 1fr;
    padding: 14px 0;
  }

  &__season {
    color: var(--color-accent);
    font-size: 1.1rem;
  }

  &__detail {
    display: grid;
    gap: 4px;
  }

  &__meta {
    color: var(--color-text-muted);
    font-size: 0.78rem;
  }
}
```

- [ ] **Step 3: WatchTargetList 컴포넌트**

`src/components/WatchTargetList/WatchTargetList.tsx`.

```tsx
import type { WatchTarget } from "@/types/public-data";

const typeLabels: Record<WatchTarget["targetType"], string> = {
  driver: "Driver",
  team: "Team",
  manufacturer: "Manufacturer",
  car: "Car",
  manual: "Note",
};

export function WatchTargetList({ targets }: { targets: WatchTarget[] }) {
  return (
    <ul className="watch-target-list">
      {targets.map((target, index) => (
        <li className="watch-target-list__item" key={`${target.targetName}-${index}`}>
          <div className="watch-target-list__head">
            <span className="watch-target-list__badge">{typeLabels[target.targetType]}</span>
            <span className="watch-target-list__name">{target.targetName}</span>
            {target.title && <span className="watch-target-list__title">{target.title}</span>}
          </div>
          <p className="watch-target-list__reason type-korean">{target.reason}</p>
        </li>
      ))}
    </ul>
  );
}
```

`src/components/WatchTargetList/WatchTargetList.scss`.

```scss
.watch-target-list {
  display: grid;
  gap: 14px;
  list-style: none;
  margin: 0;
  padding: 0;

  &__item {
    border: 1px solid var(--color-line);
    padding: 16px;
  }

  &__head {
    align-items: baseline;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__badge {
    border: 1px solid var(--color-line);
    color: var(--color-text-muted);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    padding: 2px 8px;
    text-transform: uppercase;
  }

  &__name {
    font-size: 1.05rem;
  }

  &__title {
    color: var(--color-text-muted);
    font-size: 0.78rem;
  }

  &__reason {
    color: var(--color-text-muted);
    line-height: 1.7;
    margin: 10px 0 0;
  }
}
```

- [ ] **Step 4: RelatedRaceCard 컴포넌트**

`src/components/RelatedRaceCard/RelatedRaceCard.tsx`. Next Race와 Explore가 함께 쓴다.

```tsx
import Link from "next/link";
import { SeriesBadge } from "@/components/SeriesBadge/SeriesBadge";
import type { RelatedRaceCard as RelatedRaceCardModel } from "@/types/public-data";

export function RelatedRaceCard({ race }: { race: RelatedRaceCardModel }) {
  return (
    <Link className="related-race-card" href={`/races/${race.slug}`}>
      <div className="related-race-card__top">
        <SeriesBadge series={race.series} />
        <span className="related-race-card__period type-mono">{race.period}</span>
      </div>
      <h3 className="related-race-card__title">{race.title}</h3>
      <span className="related-race-card__location">{race.location}</span>
    </Link>
  );
}
```

`src/components/RelatedRaceCard/RelatedRaceCard.scss`.

```scss
.related-race-card {
  border: 1px solid var(--color-line);
  display: grid;
  gap: 12px;
  padding: 20px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--color-accent);
  }

  &__top {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  &__period {
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  &__title {
    font-size: 1.4rem;
    font-weight: 500;
    letter-spacing: -0.04em;
    margin: 0;
  }

  &__location {
    color: var(--color-text-muted);
    font-size: 0.82rem;
  }
}
```

- [ ] **Step 5: 상세 페이지 통합**

`src/app/races/[slug]/page.tsx`를 수정한다. import를 추가하고 신규 섹션을 조건부 렌더한다.

```tsx
import { RaceFacts } from "@/components/RaceFacts/RaceFacts";
import { RaceHistory } from "@/components/RaceHistory/RaceHistory";
import { WatchTargetList } from "@/components/WatchTargetList/WatchTargetList";
import { RelatedRaceCard } from "@/components/RelatedRaceCard/RelatedRaceCard";
```

`race-detail__content` 안, 기존 `__brief` 섹션 다음에 추가한다(번호는 표시용). `Variables` 섹션 뒤에 Next Race/Explore를 둔다.

```tsx
        {race.facts && (
          <section className="race-detail__facts">
            <SectionLabel index="06">Quick facts</SectionLabel>
            <RaceFacts facts={race.facts} />
          </section>
        )}

        {race.watchTargets && race.watchTargets.length > 0 && (
          <section className="race-detail__watch">
            <SectionLabel index="07">Who to watch</SectionLabel>
            <WatchTargetList targets={race.watchTargets} />
          </section>
        )}

        {race.history && race.history.length > 0 && (
          <section className="race-detail__history">
            <SectionLabel index="08">History</SectionLabel>
            <RaceHistory entries={race.history} />
          </section>
        )}
```

`race-detail__content` 닫는 태그 뒤(article 안)에 Next Race / Explore 섹션을 추가한다.

```tsx
      {race.nextRace && (
        <section className="race-detail__next container">
          <SectionLabel index="09">Next race</SectionLabel>
          <RelatedRaceCard race={race.nextRace} />
        </section>
      )}

      {race.featuredOther && race.featuredOther.length > 0 && (
        <section className="race-detail__explore container">
          <SectionLabel index="10">Explore other series</SectionLabel>
          <div className="race-detail__explore-grid">
            {race.featuredOther.map((other) => (
              <RelatedRaceCard key={other.slug} race={other} />
            ))}
          </div>
        </section>
      )}
```

- [ ] **Step 6: 상세 섹션 스타일 보강**

`src/app/public-pages.scss`에서 `race-detail` 블록을 찾아 신규 섹션 간격과 explore 그리드를 추가한다(기존 변수/간격 토큰 사용). 새 규칙:

```scss
.race-detail {
  &__next,
  &__explore {
    padding-top: var(--section-space);
  }

  &__explore-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    margin-top: 20px;
  }
}
```

(주: `race-detail`이 이미 `public-pages.scss`에 있으면 해당 블록 안에 중첩 추가한다. 없으면 파일 끝에 위 블록을 추가한다.)

- [ ] **Step 7: 빌드 + 수동 확인**

Run: `npm run build`
Expected: 통과.

Run: `npm run dev` 후 브라우저에서 확인(개발 모드는 mock fallback이라 신규 섹션은 비어 미렌더 — 레이아웃 깨짐 없음 확인). 실제 데이터 확인은 관리자 입력(Task 9) 이후 또는 D1 런타임 환경에서.

수동 체크: 라이트/다크 토글, 모바일(≤800px)/데스크톱, 콘솔 오류 없음.

- [ ] **Step 8: Commit (사용자 승인 시)**

```bash
git add src/components/RaceFacts src/components/RaceHistory src/components/WatchTargetList src/components/RelatedRaceCard src/app/races/[slug]/page.tsx src/app/public-pages.scss
git commit -m "feat: render quick facts, history, watch targets, next race on public detail"
```

---

### Task 5: 관리자 타입 + 변환 + 조회

관리자 편집 화면이 facts/history/watchTargets를 읽도록 타입·변환·조회를 확장한다.

**Files:**
- Modify: `src/types/admin-data.ts`
- Modify: `src/lib/admin-data-format.ts`
- Modify: `src/lib/admin-data.ts`
- Test: `src/lib/admin-data-format.test.ts`

**Interfaces:**
- Consumes: `RaceFactsRow`, `RaceHistoryRow`, `RaceWatchTargetRow` (Task 1).
- Produces:
  - 타입 `AdminRaceFacts`(모든 필드 `string`, 빈 값은 `""`), `AdminRaceHistoryEntry`(`id` 포함, season은 `string`), `AdminWatchTarget`(`id`/`targetType`/`targetName`/`title`/`reason`/`displayOrder`).
  - `AdminRace` 확장: `facts: AdminRaceFacts`, `history: AdminRaceHistoryEntry[]`, `watchTargets: AdminWatchTarget[]`.
  - `mapAdminRaceFacts(row?: RaceFactsRow): AdminRaceFacts`, `mapAdminRaceHistory(rows: RaceHistoryRow[]): AdminRaceHistoryEntry[]`, `mapAdminWatchTargets(rows: RaceWatchTargetRow[]): AdminWatchTarget[]`.

- [ ] **Step 1: 관리자 타입 추가**

`src/types/admin-data.ts`에 추가하고 `AdminRace`를 확장한다.

```ts
export type AdminRaceFacts = {
  circuitName: string;
  trackLength: string;
  laps: string;
  raceDistance: string;
  corners: string;
  drsZones: string;
  firstHeld: string;
  previousWinner: string;
  mostWinsDriver: string;
  mostWinsTeam: string;
  lapRecord: string;
  poleRecord: string;
  tyreCompounds: string;
  overtakeDifficulty: string;
  keySector: string;
  weatherNote: string;
  strategyNote: string;
  beginnerNote: string;
};

export type AdminRaceHistoryEntry = {
  id: string;
  season: string;
  winnerDriverName: string;
  winnerTeamName: string;
  poleDriverName: string;
  fastestLapDriverName: string;
  note: string;
};

export type AdminWatchTarget = {
  id: string;
  targetType: "driver" | "team" | "manufacturer" | "car" | "manual";
  targetName: string;
  title: string;
  reason: string;
  displayOrder: number;
};
```

`AdminRace` 본문 끝(`sessions: AdminSession[];` 다음)에 추가한다.

```ts
  facts: AdminRaceFacts;
  history: AdminRaceHistoryEntry[];
  watchTargets: AdminWatchTarget[];
```

- [ ] **Step 2: 실패하는 테스트 작성**

`src/lib/admin-data-format.test.ts`에 추가한다. import에 새 함수와 row 타입을 더한다.

```ts
import {
  mapAdminRaceFacts,
  mapAdminRaceHistory,
  mapAdminWatchTargets,
} from "./admin-data-format";
import type { RaceFactsRow, RaceHistoryRow, RaceWatchTargetRow } from "../db/schema";
```

```ts
test("maps null facts row to empty-string admin facts", () => {
  const facts = mapAdminRaceFacts(undefined);
  assert.equal(facts.trackLength, "");
  assert.equal(facts.laps, "");
});

test("maps facts row numbers to strings", () => {
  const row = { laps: 53, corners: 18, trackLength: "5.807km" } as RaceFactsRow;
  const facts = mapAdminRaceFacts(row);
  assert.equal(facts.laps, "53");
  assert.equal(facts.corners, "18");
  assert.equal(facts.trackLength, "5.807km");
});

test("maps admin history sorted by season descending with string season", () => {
  const rows: RaceHistoryRow[] = [
    { id: "h1", raceId: "r", season: 2024, winnerDriverName: "A", winnerTeamName: null, poleDriverName: null, fastestLapDriverName: null, note: null, createdAt: "x", updatedAt: "x" },
    { id: "h2", raceId: "r", season: 2025, winnerDriverName: "B", winnerTeamName: null, poleDriverName: null, fastestLapDriverName: null, note: null, createdAt: "x", updatedAt: "x" },
  ];
  const mapped = mapAdminRaceHistory(rows);
  assert.deepEqual(mapped.map((h) => h.season), ["2025", "2024"]);
  assert.equal(mapped[0].winnerDriverName, "B");
});

test("maps admin watch targets sorted by display order", () => {
  const rows: RaceWatchTargetRow[] = [
    { id: "w2", raceId: "r", targetType: "team", targetId: null, targetName: "B", title: null, reason: "r2", displayOrder: 2, createdAt: "x", updatedAt: "x" },
    { id: "w1", raceId: "r", targetType: "driver", targetId: null, targetName: "A", title: "t", reason: "r1", displayOrder: 1, createdAt: "x", updatedAt: "x" },
  ];
  const mapped = mapAdminWatchTargets(rows);
  assert.deepEqual(mapped.map((w) => w.targetName), ["A", "B"]);
  assert.equal(mapped[0].title, "t");
});
```

(주: `{ ... } as RaceFactsRow`는 테스트 편의를 위한 부분 캐스트다. 누락 필드는 접근하지 않는 테스트만 둔다.)

- [ ] **Step 3: 테스트 실패 확인**

Run: `npm test`
Expected: FAIL — `mapAdminRaceFacts is not a function`.

- [ ] **Step 4: 변환 함수 구현**

`src/lib/admin-data-format.ts`에 추가한다. import에 row 타입과 관리자 타입을 더한다.

```ts
import type { RaceFactsRow, RaceHistoryRow, RaceWatchTargetRow } from "@/db/schema";
import type {
  AdminRaceFacts,
  AdminRaceHistoryEntry,
  AdminWatchTarget,
} from "@/types/admin-data";
```

```ts
function str(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function mapAdminRaceFacts(row: RaceFactsRow | undefined): AdminRaceFacts {
  return {
    circuitName: str(row?.circuitName),
    trackLength: str(row?.trackLength),
    laps: str(row?.laps),
    raceDistance: str(row?.raceDistance),
    corners: str(row?.corners),
    drsZones: str(row?.drsZones),
    firstHeld: str(row?.firstHeld),
    previousWinner: str(row?.previousWinner),
    mostWinsDriver: str(row?.mostWinsDriver),
    mostWinsTeam: str(row?.mostWinsTeam),
    lapRecord: str(row?.lapRecord),
    poleRecord: str(row?.poleRecord),
    tyreCompounds: str(row?.tyreCompounds),
    overtakeDifficulty: str(row?.overtakeDifficulty),
    keySector: str(row?.keySector),
    weatherNote: str(row?.weatherNote),
    strategyNote: str(row?.strategyNote),
    beginnerNote: str(row?.beginnerNote),
  };
}

export function mapAdminRaceHistory(rows: RaceHistoryRow[]): AdminRaceHistoryEntry[] {
  return [...rows]
    .sort((a, b) => b.season - a.season)
    .map((row) => ({
      id: row.id,
      season: String(row.season),
      winnerDriverName: str(row.winnerDriverName),
      winnerTeamName: str(row.winnerTeamName),
      poleDriverName: str(row.poleDriverName),
      fastestLapDriverName: str(row.fastestLapDriverName),
      note: str(row.note),
    }));
}

export function mapAdminWatchTargets(rows: RaceWatchTargetRow[]): AdminWatchTarget[] {
  return [...rows]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((row) => ({
      id: row.id,
      targetType: row.targetType,
      targetName: row.targetName,
      title: str(row.title),
      reason: row.reason,
      displayOrder: row.displayOrder,
    }));
}
```

- [ ] **Step 5: mapAdminRace에 확장 필드 연결**

`mapAdminRace`는 현재 row와 sessions를 받는다. facts/history/watch row를 추가 인자로 받도록 시그니처를 확장한다. `src/lib/admin-data-format.ts`의 `mapAdminRace`를 찾아 인자와 반환에 추가한다.

```ts
export function mapAdminRace(
  row: AdminRaceRow,
  sessionRows: AdminSessionRow[],
  factsRow?: RaceFactsRow,
  historyRows: RaceHistoryRow[] = [],
  watchRows: RaceWatchTargetRow[] = [],
): AdminRace {
```

반환 객체 끝에 추가한다.

```ts
    facts: mapAdminRaceFacts(factsRow),
    history: mapAdminRaceHistory(historyRows),
    watchTargets: mapAdminWatchTargets(watchRows),
```

- [ ] **Step 6: getAdminRaceById 조회 확장**

`src/lib/admin-data.ts`의 `getAdminRaceById`(단건 조회 분기)에서 facts/history/watch를 조회해 `mapAdminRace`에 넘긴다. import에 스키마 테이블을 추가한다.

```ts
import { raceFacts, raceHistory, raceWatchTargets } from "@/db/schema";
```

조회 코드(해당 함수의 row 조회 직후, `mapAdminRace` 호출 전):

```ts
const [factsRows, historyRows, watchRows] = await Promise.all([
  db.select().from(raceFacts).where(eq(raceFacts.raceId, id)).limit(1),
  db.select().from(raceHistory).where(eq(raceHistory.raceId, id)),
  db.select().from(raceWatchTargets).where(eq(raceWatchTargets.raceId, id)),
]);
return mapAdminRace(raceRow, sessionRows, factsRows[0], historyRows, watchRows);
```

(주: 개발 모드 mock 분기는 `mock-admin`에 facts/history/watch가 없으므로 빈 기본값으로 반환된다 — `mapAdminRace`의 기본 인자가 처리. mock 분기에서는 `mapAdminRace(mockRow, mockSessions)`처럼 호출해 빈 값이 채워지게 두거나, mock이 이미 `AdminRace`이면 `facts`/`history`/`watchTargets`를 빈 기본값으로 보강한다. 실제 mock 구조는 함수 내 기존 코드에 맞춘다.)

- [ ] **Step 7: 테스트 + 빌드 검증**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: 통과.

- [ ] **Step 8: Commit (사용자 승인 시)**

```bash
git add src/types/admin-data.ts src/lib/admin-data-format.ts src/lib/admin-data-format.test.ts src/lib/admin-data.ts
git commit -m "feat: load race facts/history/watch targets in admin race detail"
```

---

### Task 6: 관리자 입력 파싱 (TDD)

폼 데이터를 facts/history/watch 입력 모델로 파싱·검증하는 순수 함수를 추가한다.

**Files:**
- Modify: `src/lib/admin-race-mutations.ts`
- Test: `src/lib/admin-race-mutations.test.ts`

**Interfaces:**
- Produces:
  - 타입 `RaceFactsInput`(텍스트 필드는 `string | null`, 숫자 필드 `laps`/`corners`/`drsZones`/`firstHeld`는 `number | null`).
  - `parseRaceFactsForm(formData: FormData): RaceFactsInput`.
  - 타입 `RaceHistoryInput`(`season: number`, 나머지 `string | null`).
  - `parseRaceHistoryForm(formData: FormData): RaceHistoryInput` — `season`은 1900~2100 정수 검증, 실패 시 throw.
  - 타입 `WatchTargetInput`(`targetType`, `targetName`, `title: string | null`, `reason`).
  - `parseWatchTargetForm(formData: FormData): WatchTargetInput` — `targetType`은 허용 union, `targetName`/`reason` 필수.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/admin-race-mutations.test.ts`에 추가한다. import에 새 함수를 더한다.

```ts
import {
  parseRaceFactsForm,
  parseRaceHistoryForm,
  parseWatchTargetForm,
} from "./admin-race-mutations";

function fd(entries: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) form.set(key, value);
  return form;
}
```

```ts
test("parses facts form with numeric coercion and empty-to-null", () => {
  const input = parseRaceFactsForm(fd({
    trackLength: "5.807km",
    laps: "53",
    corners: "",
    drsZones: "1",
  }));
  assert.equal(input.trackLength, "5.807km");
  assert.equal(input.laps, 53);
  assert.equal(input.corners, null);
  assert.equal(input.drsZones, 1);
  assert.equal(input.circuitName, null);
});

test("rejects non-numeric facts number field", () => {
  assert.throws(() => parseRaceFactsForm(fd({ laps: "abc" })));
});

test("parses history form with season validation", () => {
  const input = parseRaceHistoryForm(fd({ season: "2025", winnerDriverName: "Verstappen" }));
  assert.equal(input.season, 2025);
  assert.equal(input.winnerDriverName, "Verstappen");
  assert.equal(input.winnerTeamName, null);
});

test("rejects invalid season", () => {
  assert.throws(() => parseRaceHistoryForm(fd({ season: "abc" })));
  assert.throws(() => parseRaceHistoryForm(fd({ season: "1700" })));
});

test("parses watch target form", () => {
  const input = parseWatchTargetForm(fd({
    targetType: "driver",
    targetName: "Verstappen",
    title: "주목",
    reason: "고속 코너 강점",
  }));
  assert.deepEqual(input, {
    targetType: "driver",
    targetName: "Verstappen",
    title: "주목",
    reason: "고속 코너 강점",
  });
});

test("rejects watch target with invalid type or missing fields", () => {
  assert.throws(() => parseWatchTargetForm(fd({ targetType: "alien", targetName: "x", reason: "y" })));
  assert.throws(() => parseWatchTargetForm(fd({ targetType: "driver", targetName: "", reason: "y" })));
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test`
Expected: FAIL — `parseRaceFactsForm is not a function`.

- [ ] **Step 3: 파싱 함수 구현**

`src/lib/admin-race-mutations.ts`에 추가한다. 기존 `requiredString`/`optionalString` 헬퍼를 재사용한다.

```ts
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit (사용자 승인 시)**

```bash
git add src/lib/admin-race-mutations.ts src/lib/admin-race-mutations.test.ts
git commit -m "feat: add admin parsers for race facts/history/watch targets"
```

---

### Task 7: 관리자 mutation 함수

facts upsert, history 추가/삭제, watch target 추가/삭제/순서변경을 `runD1Batch`로 구현한다. 검수 흐름을 타지 않는다.

**Files:**
- Create: `src/lib/admin-race-detail-editor.ts`

**Interfaces:**
- Consumes: `RaceFactsInput`, `RaceHistoryInput`, `WatchTargetInput` (Task 6); `requireAdminSession`; `runD1Batch`; 스키마 테이블 (Task 1).
- Produces:
  - `saveAdminRaceFacts(raceId: string, input: RaceFactsInput): Promise<void>` — `race_facts` upsert(`onConflictDoUpdate` target `raceFacts.raceId`).
  - `createAdminRaceHistory(raceId: string, input: RaceHistoryInput): Promise<void>`.
  - `deleteAdminRaceHistory(raceId: string, historyId: string): Promise<void>` — 해당 race 소속만.
  - `createAdminWatchTarget(raceId: string, input: WatchTargetInput): Promise<void>` — `displayOrder`는 현재 최대+1.
  - `deleteAdminWatchTarget(raceId: string, targetId: string): Promise<void>`.
  - `reorderAdminWatchTarget(raceId: string, targetId: string, direction: "up" | "down"): Promise<void>` — 인접 항목과 `displayOrder` 교환.

- [ ] **Step 1: 파일 작성**

`src/lib/admin-race-detail-editor.ts`. `admin-race-editor.ts`의 `requireRace` 패턴을 그대로 복제한다(파일 경계를 분리해 책임을 명확히 한다).

```ts
import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { raceFacts, raceHistory, raceWatchTargets, races } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { runD1Batch } from "@/lib/d1-helpers";
import type {
  RaceFactsInput,
  RaceHistoryInput,
  WatchTargetInput,
} from "@/lib/admin-race-mutations";

async function requireRace(raceId: string) {
  const db = await getDb();
  const rows = await db
    .select({ id: races.id })
    .from(races)
    .where(eq(races.id, raceId))
    .limit(1);
  if (!rows[0]) {
    throw new Error("Race not found");
  }
  return db;
}

export async function saveAdminRaceFacts(
  raceId: string,
  input: RaceFactsInput,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const now = new Date().toISOString();
  await runD1Batch(db, [
    db
      .insert(raceFacts)
      .values({ id: crypto.randomUUID(), raceId, ...input, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: raceFacts.raceId,
        set: { ...input, updatedAt: now },
      }),
  ]);
}

export async function createAdminRaceHistory(
  raceId: string,
  input: RaceHistoryInput,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const now = new Date().toISOString();
  await runD1Batch(db, [
    db.insert(raceHistory).values({
      id: crypto.randomUUID(),
      raceId,
      ...input,
      createdAt: now,
      updatedAt: now,
    }),
  ]);
}

export async function deleteAdminRaceHistory(
  raceId: string,
  historyId: string,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  await runD1Batch(db, [
    db
      .delete(raceHistory)
      .where(and(eq(raceHistory.id, historyId), eq(raceHistory.raceId, raceId))),
  ]);
}

export async function createAdminWatchTarget(
  raceId: string,
  input: WatchTargetInput,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const existing = await db
    .select({ displayOrder: raceWatchTargets.displayOrder })
    .from(raceWatchTargets)
    .where(eq(raceWatchTargets.raceId, raceId))
    .orderBy(asc(raceWatchTargets.displayOrder));
  const nextOrder =
    existing.length === 0
      ? 1
      : Math.max(...existing.map((row) => row.displayOrder)) + 1;
  const now = new Date().toISOString();
  await runD1Batch(db, [
    db.insert(raceWatchTargets).values({
      id: crypto.randomUUID(),
      raceId,
      targetType: input.targetType,
      targetId: null,
      targetName: input.targetName,
      title: input.title,
      reason: input.reason,
      displayOrder: nextOrder,
      createdAt: now,
      updatedAt: now,
    }),
  ]);
}

export async function deleteAdminWatchTarget(
  raceId: string,
  targetId: string,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  await runD1Batch(db, [
    db
      .delete(raceWatchTargets)
      .where(and(eq(raceWatchTargets.id, targetId), eq(raceWatchTargets.raceId, raceId))),
  ]);
}

export async function reorderAdminWatchTarget(
  raceId: string,
  targetId: string,
  direction: "up" | "down",
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const rows = await db
    .select({ id: raceWatchTargets.id, displayOrder: raceWatchTargets.displayOrder })
    .from(raceWatchTargets)
    .where(eq(raceWatchTargets.raceId, raceId))
    .orderBy(asc(raceWatchTargets.displayOrder));
  const index = rows.findIndex((row) => row.id === targetId);
  if (index === -1) throw new Error("Watch target not found");
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= rows.length) return;

  const current = rows[index];
  const neighbor = rows[swapIndex];
  const now = new Date().toISOString();
  await runD1Batch(db, [
    db
      .update(raceWatchTargets)
      .set({ displayOrder: neighbor.displayOrder, updatedAt: now })
      .where(and(eq(raceWatchTargets.id, current.id), eq(raceWatchTargets.raceId, raceId))),
    db
      .update(raceWatchTargets)
      .set({ displayOrder: current.displayOrder, updatedAt: now })
      .where(and(eq(raceWatchTargets.id, neighbor.id), eq(raceWatchTargets.raceId, raceId))),
  ]);
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: 통과(타입 오류 없음).

- [ ] **Step 3: Cloudflare 빌드 검증**

Run: `npm run cf:build`
Expected: 통과.

- [ ] **Step 4: Commit (사용자 승인 시)**

```bash
git add src/lib/admin-race-detail-editor.ts
git commit -m "feat: add admin mutations for race facts/history/watch targets"
```

---

### Task 8: 관리자 Server Actions

Task 7 함수를 호출하는 Server Action을 추가하고, 저장 후 해당 탭으로 복귀하도록 redirect를 확장한다.

**Files:**
- Modify: `src/app/admin/races/actions.ts`

**Interfaces:**
- Consumes: Task 7 함수, Task 6 파서.
- Produces: Server Action `saveRaceFacts`, `addRaceHistory`, `deleteRaceHistory`, `addWatchTarget`, `deleteWatchTarget`, `moveWatchTarget`. `editorRedirect`가 `tab` 파라미터를 받도록 확장.

- [ ] **Step 1: editorRedirect에 tab 지원 추가**

`src/app/admin/races/actions.ts`의 `editorRedirect`를 수정한다. status union에 신규 값을 추가하고 `tab` 인자를 받는다.

```ts
function editorRedirect(
  raceId: string,
  status:
    | "saved" | "reviewed" | "published" | "unpublished"
    | "session-added" | "session-deleted" | "ai-generated" | "ai-applied"
    | "facts-saved" | "history-added" | "history-deleted"
    | "watch-added" | "watch-deleted" | "watch-moved" | "error",
  message?: string,
  tab?: string,
): never {
  const params = new URLSearchParams({ status });
  if (message) params.set("message", message);
  if (tab) params.set("tab", tab);
  redirect(`/admin/races/${raceId}?${params}`);
}
```

- [ ] **Step 2: import 추가**

```ts
import {
  saveAdminRaceFacts,
  createAdminRaceHistory,
  deleteAdminRaceHistory,
  createAdminWatchTarget,
  deleteAdminWatchTarget,
  reorderAdminWatchTarget,
} from "@/lib/admin-race-detail-editor";
import {
  parseRaceFactsForm,
  parseRaceHistoryForm,
  parseWatchTargetForm,
} from "@/lib/admin-race-mutations";
```

- [ ] **Step 3: Server Action 추가**

파일 끝에 추가한다.

```ts
export async function saveRaceFacts(raceId: string, formData: FormData) {
  try {
    await saveAdminRaceFacts(raceId, parseRaceFactsForm(formData));
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "Facts 입력값을 확인해 주세요.", "facts");
  }
  editorRedirect(raceId, "facts-saved", undefined, "facts");
}

export async function addRaceHistory(raceId: string, formData: FormData) {
  try {
    await createAdminRaceHistory(raceId, parseRaceHistoryForm(formData));
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "연도와 입력값을 확인해 주세요.", "history");
  }
  editorRedirect(raceId, "history-added", undefined, "history");
}

export async function deleteRaceHistory(raceId: string, historyId: string) {
  try {
    await deleteAdminRaceHistory(raceId, historyId);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "기록을 삭제하지 못했습니다.", "history");
  }
  editorRedirect(raceId, "history-deleted", undefined, "history");
}

export async function addWatchTarget(raceId: string, formData: FormData) {
  try {
    await createAdminWatchTarget(raceId, parseWatchTargetForm(formData));
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "대상 유형, 이름, 이유를 확인해 주세요.", "watch");
  }
  editorRedirect(raceId, "watch-added", undefined, "watch");
}

export async function deleteWatchTarget(raceId: string, targetId: string) {
  try {
    await deleteAdminWatchTarget(raceId, targetId);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "대상을 삭제하지 못했습니다.", "watch");
  }
  editorRedirect(raceId, "watch-deleted", undefined, "watch");
}

export async function moveWatchTarget(
  raceId: string,
  targetId: string,
  direction: "up" | "down",
) {
  try {
    await reorderAdminWatchTarget(raceId, targetId, direction);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "순서를 변경하지 못했습니다.", "watch");
  }
  editorRedirect(raceId, "watch-moved", undefined, "watch");
}
```

- [ ] **Step 4: 빌드 검증**

Run: `npm run build`
Expected: 통과.

- [ ] **Step 5: Commit (사용자 승인 시)**

```bash
git add src/app/admin/races/actions.ts
git commit -m "feat: add admin server actions for race facts/history/watch targets"
```

---

### Task 9: 관리자 탭 UI

`AdminRaceEditor`를 탭 구조로 재구성하고 Facts/History/Watch Targets 입력 컴포넌트를 추가한다.

**Files:**
- Modify: `src/app/admin/(panel)/races/[id]/page.tsx`
- Modify: `src/components/admin/AdminRaceEditor/AdminRaceEditor.tsx`
- Modify: `src/app/admin/admin.scss`
- Create: `src/components/admin/RaceFactsForm/RaceFactsForm.tsx`
- Create: `src/components/admin/RaceHistoryTable/RaceHistoryTable.tsx`
- Create: `src/components/admin/WatchTargetEditor/WatchTargetEditor.tsx`

**Interfaces:**
- Consumes: Task 5 `AdminRace.facts/history/watchTargets`; Task 8 Server Actions.
- Produces: 탭 전환되는 관리자 편집 화면.

- [ ] **Step 1: page.tsx에서 활성 탭 전달**

`src/app/admin/(panel)/races/[id]/page.tsx`의 `searchParams`에 `tab`을 추가하고 `AdminRaceEditor`에 넘긴다.

```tsx
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; status?: string; tab?: string }>;
}) {
  const { id } = await params;
  const actionResult = await searchParams;
  const race = await getAdminRaceById(id);
  if (!race) notFound();

  return <AdminRaceEditor race={race} {...actionResult} />;
```

- [ ] **Step 2: RaceFactsForm 컴포넌트**

`src/components/admin/RaceFactsForm/RaceFactsForm.tsx`. `saveRaceFacts`를 bind해 사용한다.

```tsx
import { saveRaceFacts } from "@/app/admin/races/actions";
import type { AdminRaceFacts } from "@/types/admin-data";

const textFields: Array<[keyof AdminRaceFacts, string]> = [
  ["circuitName", "Circuit"],
  ["trackLength", "Track length"],
  ["raceDistance", "Race distance"],
  ["previousWinner", "Previous winner"],
  ["mostWinsDriver", "Most wins (driver)"],
  ["mostWinsTeam", "Most wins (team)"],
  ["lapRecord", "Lap record"],
  ["poleRecord", "Pole record"],
  ["tyreCompounds", "Tyre compounds"],
  ["overtakeDifficulty", "Overtake difficulty"],
];

const numberFields: Array<[keyof AdminRaceFacts, string]> = [
  ["laps", "Laps"],
  ["corners", "Corners"],
  ["drsZones", "DRS zones"],
  ["firstHeld", "First held"],
];

const noteFields: Array<[keyof AdminRaceFacts, string]> = [
  ["keySector", "Key sector"],
  ["strategyNote", "Strategy note"],
  ["weatherNote", "Weather note"],
  ["beginnerNote", "Beginner note"],
];

export function RaceFactsForm({ raceId, facts }: { raceId: string; facts: AdminRaceFacts }) {
  const action = saveRaceFacts.bind(null, raceId);
  return (
    <form action={action} className="admin-facts-form">
      <div className="admin-facts-form__grid">
        {textFields.map(([name, label]) => (
          <label key={name}>
            <span>{label}</span>
            <input name={name} defaultValue={facts[name]} type="text" />
          </label>
        ))}
        {numberFields.map(([name, label]) => (
          <label key={name}>
            <span>{label}</span>
            <input name={name} defaultValue={facts[name]} inputMode="numeric" type="text" />
          </label>
        ))}
      </div>
      {noteFields.map(([name, label]) => (
        <label className="admin-facts-form__note" key={name}>
          <span>{label}</span>
          <textarea name={name} defaultValue={facts[name]} rows={2} />
        </label>
      ))}
      <button type="submit">Save facts</button>
    </form>
  );
}
```

- [ ] **Step 3: RaceHistoryTable 컴포넌트**

`src/components/admin/RaceHistoryTable/RaceHistoryTable.tsx`. 추가 폼 + 기존 항목 삭제.

```tsx
import { addRaceHistory, deleteRaceHistory } from "@/app/admin/races/actions";
import type { AdminRaceHistoryEntry } from "@/types/admin-data";

export function RaceHistoryTable({
  raceId,
  entries,
}: {
  raceId: string;
  entries: AdminRaceHistoryEntry[];
}) {
  const addAction = addRaceHistory.bind(null, raceId);
  return (
    <div className="admin-history">
      <ul className="admin-history__list">
        {entries.map((entry) => {
          const deleteAction = deleteRaceHistory.bind(null, raceId, entry.id);
          return (
            <li className="admin-history__row" key={entry.id}>
              <span className="type-mono">{entry.season}</span>
              <span>{entry.winnerDriverName || "—"}{entry.winnerTeamName ? ` · ${entry.winnerTeamName}` : ""}</span>
              <form action={deleteAction}>
                <button type="submit">Delete</button>
              </form>
            </li>
          );
        })}
      </ul>
      <form action={addAction} className="admin-history__form">
        <input name="season" inputMode="numeric" placeholder="Season" required type="text" />
        <input name="winnerDriverName" placeholder="Winner driver" type="text" />
        <input name="winnerTeamName" placeholder="Winner team" type="text" />
        <input name="poleDriverName" placeholder="Pole" type="text" />
        <input name="fastestLapDriverName" placeholder="Fastest lap" type="text" />
        <input name="note" placeholder="Note" type="text" />
        <button type="submit">Add history</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: WatchTargetEditor 컴포넌트**

`src/components/admin/WatchTargetEditor/WatchTargetEditor.tsx`.

```tsx
import {
  addWatchTarget,
  deleteWatchTarget,
  moveWatchTarget,
} from "@/app/admin/races/actions";
import type { AdminWatchTarget } from "@/types/admin-data";

const targetTypes: AdminWatchTarget["targetType"][] = [
  "driver",
  "team",
  "manufacturer",
  "car",
  "manual",
];

export function WatchTargetEditor({
  raceId,
  targets,
}: {
  raceId: string;
  targets: AdminWatchTarget[];
}) {
  const addAction = addWatchTarget.bind(null, raceId);
  return (
    <div className="admin-watch">
      <ul className="admin-watch__list">
        {targets.map((target) => {
          const deleteAction = deleteWatchTarget.bind(null, raceId, target.id);
          const upAction = moveWatchTarget.bind(null, raceId, target.id, "up");
          const downAction = moveWatchTarget.bind(null, raceId, target.id, "down");
          return (
            <li className="admin-watch__row" key={target.id}>
              <span className="admin-watch__type">{target.targetType}</span>
              <span className="admin-watch__name">{target.targetName}</span>
              <span className="admin-watch__reason">{target.reason}</span>
              <div className="admin-watch__actions">
                <form action={upAction}><button type="submit">↑</button></form>
                <form action={downAction}><button type="submit">↓</button></form>
                <form action={deleteAction}><button type="submit">Delete</button></form>
              </div>
            </li>
          );
        })}
      </ul>
      <form action={addAction} className="admin-watch__form">
        <select name="targetType" defaultValue="driver">
          {targetTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input name="targetName" placeholder="Target name" required type="text" />
        <input name="title" placeholder="Title (optional)" type="text" />
        <input name="reason" placeholder="Reason" required type="text" />
        <button type="submit">Add target</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: AdminRaceEditor 탭 구조 재구성**

`src/components/admin/AdminRaceEditor/AdminRaceEditor.tsx`를 탭 전환 구조로 바꾼다. props에 `tab`을 추가하고, 활성 탭만 렌더한다. 탭 네비게이션은 `<a href="?tab=...">` 링크다.

```tsx
import Link from "next/link";
import { RaceFactsForm } from "@/components/admin/RaceFactsForm/RaceFactsForm";
import { RaceHistoryTable } from "@/components/admin/RaceHistoryTable/RaceHistoryTable";
import { WatchTargetEditor } from "@/components/admin/WatchTargetEditor/WatchTargetEditor";
```

`successMessages`에 신규 status를 추가한다.

```ts
  "facts-saved": "Facts를 저장했습니다.",
  "history-added": "역대 기록을 추가했습니다.",
  "history-deleted": "역대 기록을 삭제했습니다.",
  "watch-added": "주목 대상을 추가했습니다.",
  "watch-deleted": "주목 대상을 삭제했습니다.",
  "watch-moved": "주목 대상 순서를 변경했습니다.",
```

컴포넌트 시그니처와 탭 정의:

```tsx
const TABS = [
  { id: "basic", label: "Basic" },
  { id: "sessions", label: "Sessions" },
  { id: "briefing", label: "Briefing" },
  { id: "facts", label: "Facts" },
  { id: "history", label: "History" },
  { id: "watch", label: "Watch Targets" },
  { id: "publish", label: "Publish" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminRaceEditor({
  race,
  message,
  status,
  tab,
}: AdminRaceEditorProps & { tab?: string }) {
  const activeTab: TabId =
    (TABS.find((t) => t.id === tab)?.id as TabId) ?? "basic";
  // ... 기존 bind/protectedContent/actionMessage 유지
```

`AdminRaceEditorProps`에 `tab?: string`을 더하거나 위처럼 교차 타입으로 받는다.

렌더에서 탭 네비게이션 + 활성 탭 패널을 둔다. **기존 폼 마크업을 탭별 `{activeTab === "..." && (...)}` 블록으로 감싼다.** 기존 기본정보/세션/콘텐츠/공개 폼을 각각 basic/sessions/briefing/publish로 분배한다(기존 JSX를 잘라 배치, 로직·action은 그대로).

```tsx
  return (
    <div className="admin-race-detail">
      <AdminPageHeader /* 기존 actions 유지 */ />
      {actionMessage && <p className="admin-action-message">{actionMessage}</p>}

      <nav className="admin-tabs">
        {TABS.map((t) => (
          <Link
            key={t.id}
            className={`admin-tabs__link${activeTab === t.id ? " admin-tabs__link--active" : ""}`}
            href={`?tab=${t.id}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {activeTab === "basic" && (/* 기존 기본 정보 폼 */)}
      {activeTab === "sessions" && (/* 기존 세션 폼 */)}
      {activeTab === "briefing" && (/* 기존 콘텐츠/AI 폼 + SEO 필드 */)}
      {activeTab === "facts" && <RaceFactsForm raceId={race.id} facts={race.facts} />}
      {activeTab === "history" && <RaceHistoryTable raceId={race.id} entries={race.history} />}
      {activeTab === "watch" && <WatchTargetEditor raceId={race.id} targets={race.watchTargets} />}
      {activeTab === "publish" && (/* 기존 검수/공개 폼 */)}
    </div>
  );
```

(주: 기존 단일 폼이 하나의 `<form>`으로 여러 섹션을 묶고 있으면, 탭 분할 시 각 탭이 자기 `<form>`을 갖도록 분리한다. 기존 저장 액션 `saveAdminRace`는 기본+세션+콘텐츠를 함께 처리하므로, Basic/Sessions/Briefing을 하나의 저장 폼으로 유지하되 탭으로 보이는 영역만 나눌지, 폼을 쪼갤지는 기존 `saveAdminRace`의 입력 필드 구성을 보고 결정한다. 가장 안전한 방식: 기존 통합 저장 폼은 그대로 두고 Basic 탭에 배치, Sessions/Briefing은 같은 폼의 시각적 영역으로 두되 탭 전환은 해당 영역만 표시. 구현자는 `saveAdminRace`가 요구하는 hidden 필드(`sessionIds` 등)가 제출 시 누락되지 않도록 한 `<form>` 범위를 유지할 것.)

- [ ] **Step 6: 탭 스타일 추가**

`src/app/admin/admin.scss`에 추가한다.

```scss
.admin-tabs {
  border-bottom: 1px solid var(--color-line);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 24px 0;

  &__link {
    border-bottom: 2px solid transparent;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    padding: 10px 14px;
    text-transform: uppercase;

    &--active {
      border-bottom-color: var(--color-accent);
      color: var(--color-text);
    }
  }
}
```

- [ ] **Step 7: 빌드 + Cloudflare 빌드 + lint**

Run: `npm run lint`
Expected: 통과.

Run: `npm run build`
Expected: 통과.

Run: `npm run cf:build`
Expected: 통과.

- [ ] **Step 8: 수동 확인**

`npm run dev` 후 `/admin/races/[id]`에서 탭 전환(URL `?tab=facts` 등), Facts/History/Watch 입력 폼 표시, 라이트/다크, 모바일 폭 확인. (개발 모드 mock은 빈 facts/history/watch로 폼이 비어 보이는 것이 정상.)

- [ ] **Step 9: Commit (사용자 승인 시)**

```bash
git add src/app/admin src/components/admin/RaceFactsForm src/components/admin/RaceHistoryTable src/components/admin/WatchTargetEditor src/components/admin/AdminRaceEditor
git commit -m "feat: tabbed admin race editor with facts/history/watch target input"
```

---

## 최종 검증 (전체 완료 후)

- [ ] `npm test` — 전체 통과(신규 변환·파싱 테스트 포함)
- [ ] 메모리 SQLite: 0000~0006 + seed 2회 + `PRAGMA foreign_key_check` 오류 없음
- [ ] `npm run lint`, `npm run build`, `npm run cf:build` 통과
- [ ] 개발 모드 수동 확인: 공개 상세(빈 섹션 미렌더, 레이아웃 정상), 관리자 탭 전환, 라이트/다크, 모바일/데스크톱, 콘솔 오류 없음
- [ ] 원격 D1 마이그레이션·배포는 사용자 명시 요청 시에만(이 plan 범위 밖)

## 알려진 제약

- Windows `workerd` 문제로 `next dev`는 mock fallback을 쓴다. 신규 섹션의 실제 데이터 렌더는 D1 런타임 환경(배포 또는 workerd 가능 환경)에서 최종 확인해야 한다.
- 개발 모드 mock(`mock-races`, `mock-admin`)에는 facts/history/watch가 없으므로 로컬에서는 빈 상태로 보인다. 실데이터 확인은 관리자 입력 후 배포 환경에서 한다.
