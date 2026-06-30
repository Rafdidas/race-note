# RaceNote F1 전자동 허브 — Phase 0 + Phase 1 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 구 구조(관리자·캘린더·시리즈·WEC/WRC·AI) 코드를 제거해 F1 전용 앱으로 단순화하고(Phase 0), F1 결과·순위를 Jolpica에서 수집해 D1에 저장하고 코드 시드와 병합해 대시보드형 홈·드라이버·팀 페이지를 D1 데이터로 구동한다(Phase 1).

**Architecture:** 변동 데이터(일정·결과·순위)는 Jolpica → D1(Cron). 편집 콘텐츠(드라이버·팀 한국어 노트)는 코드 시드(`f1-season.ts`). 둘을 `driverId`/`constructorId` 키로 병합해 화면 모델을 만든다. `next dev`는 D1(workerd)이 없으므로 기존 패턴대로 시드 기반 목 폴백을 사용하고, 운영(Worker)에서는 D1을 우선하며 D1 공백은 시드로 폴백한다. 검수 단계 없음.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, SCSS+BEM, Cloudflare Workers+OpenNext, Cloudflare D1+Drizzle ORM, node:test(`tsx`).

## Global Constraints

- Next.js 16 App Router + Server Component 기본. Client Component는 최소 경계만.
- TypeScript에서 `any` 금지. 외부 입력은 `unknown`에서 검증/좁힘.
- DB 시간은 UTC 저장, 화면은 KST 표시.
- SCSS 전역 + BEM. 색상·간격·글꼴은 `src/styles/`의 기존 토큰/믹스인 우선. 라이트/다크 모두 확인.
- 이미지 없는 정보 중심 UI. 타이포·라인·숫자·팀 컬러로 위계.
- 비밀값·토큰·환경변수 값을 코드/문서/로그에 남기지 않는다.
- 원격 D1에 대한 migration/seed/데이터 수정은 사용자의 명시적 요청 없이 실행하지 않는다. 검증은 메모리 SQLite 우선.
- 커밋/푸시는 각 Task 끝에서 수행하되, **푸시는 사용자 명시 요청 시에만**. (이 저장소 기준: 자동 커밋은 허용, 자동 푸시 금지)
- 테스트 명령: `node --import tsx --test src/lib/**/*.test.ts`. 빌드: `npm run build`. Cloudflare: `npm run cf:build`, `npm run cf:types`.
- `package.json`에 없는 스크립트를 가정하지 않는다(`type-check` 없음).

---

# Phase 0 — 레거시 제거와 F1 전용 단순화

각 Task는 삭제/수정 후 빌드가 통과하는 상태로 끝난다. 삭제 전 `npm run semble:impact -- <file>` 또는
`rg`로 사용처를 확인한다. 공통 컴포넌트(`SectionLabel`, `SeriesBadge` 등)는 현재 홈에서 쓰이므로 삭제하지 않는다.

### Task P0-0: 루트 MVP 설계 문서 삭제 확정

이미 작업 트리에서 삭제된(`D`) 루트 MVP 설계 문서 3종의 삭제를 커밋으로 확정한다. **이 3개만**
삭제하며, `racenote_f1_full_pivot_screen_design.md`와 `docs/superpowers/` 하위 구 기능 스펙/플랜,
유지 인프라 스펙은 **삭제하지 않는다**(사용자 확정 범위).

**Files:**
- Delete: `racenote_mvp_design.md`, `racenote_mvp_design_v2.md`, `racenote_mvp_screen_design.md`

- [ ] **Step 1: 삭제 상태 확인**

Run: `git status --short racenote_mvp_design.md racenote_mvp_design_v2.md racenote_mvp_screen_design.md`
Expected: 세 파일 모두 `D`(작업 트리에서 삭제됨)로 표시.

- [ ] **Step 2: 다른 문서의 참조 확인(정보용)**

Run: `rg -l "racenote_mvp_design|racenote_mvp_screen_design|racenote_mvp_design_v2" --glob '!*.md.bak'`
Expected: `PROJECT_HANDOFF.md`만 매칭(이미 "삭제했습니다"로 기록된 이력). 추가 수정 불필요.

- [ ] **Step 3: 삭제 스테이징과 커밋**

```bash
git rm racenote_mvp_design.md racenote_mvp_design_v2.md racenote_mvp_screen_design.md
git commit -m "chore: remove superseded root MVP design docs"
```

- [ ] **Step 4: 빌드 영향 없음 확인**

Run: `npm run build`
Expected: 성공(문서 삭제는 빌드에 영향 없음).

### Task P0-1: AI 계층 제거 (Cron 분기·worker·lib)

**Files:**
- Modify: `worker.ts`
- Modify: `wrangler.jsonc`
- Modify: `src/lib/db.ts`
- Delete: `src/lib/ai/content-generation.ts`, `src/lib/ai/openai-content-generator.ts`
- Delete: `src/lib/ai-content.ts`, `src/lib/ai-generation.test.ts`, `src/lib/ai-content.test.ts`, `src/lib/openai-content-generator.test.ts`

**Interfaces:**
- Produces: `worker.ts`의 `scheduled` 핸들러가 AI 분기 없이 `runAllScheduleSync(db)`만 호출.

- [ ] **Step 1: AI 테스트/파일 사용처 확인**

Run: `rg -l "ai/content-generation|openai-content-generator|ai-content|runAutomaticAiGeneration" src worker.ts`
Expected: `worker.ts`와 `src/lib/ai*` 관련 파일만 매칭.

- [ ] **Step 2: `worker.ts`에서 AI 분기 제거**

`worker.ts`를 아래로 교체한다.

```ts
import { drizzle } from "drizzle-orm/d1";
import openNextWorker, {
  BucketCachePurge,
  DOQueueHandler,
  DOShardedTagCache,
} from "./.open-next/worker.js";
import * as schema from "./src/db/schema";
import { runAllScheduleSync } from "./src/lib/sync/all-sync";

export { BucketCachePurge, DOQueueHandler, DOShardedTagCache };

type ScheduledExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

type ScheduledController = {
  cron: string;
};

const worker = {
  fetch: openNextWorker.fetch,
  async scheduled(
    _controller: ScheduledController,
    env: CloudflareEnv,
    ctx: ScheduledExecutionContext,
  ) {
    if (!env.DB) {
      throw new Error("RaceNote D1 binding 'DB' is missing");
    }
    const db = drizzle(env.DB, { schema });
    ctx.waitUntil(runAllScheduleSync(db));
  },
};

export default worker;
```

- [ ] **Step 3: `wrangler.jsonc`에서 AI Cron 제거**

`triggers.crons`를 `["0 0 * * *", "0 12 * * *"]`로 바꾼다(`"0 1 * * *"` 제거).

- [ ] **Step 4: `src/lib/db.ts`에서 OpenAI 의존 제거**

`getOpenAiApiKey` 함수 전체를 삭제하고, `CloudflareEnv` 선언에서 `OPENAI_API_KEY?: string;` 줄을 제거한다. 남는 선언:

```ts
declare global {
  interface CloudflareEnv {
    DB?: D1Database;
  }
}
```

- [ ] **Step 5: AI lib/테스트 파일 삭제**

```bash
git rm src/lib/ai/content-generation.ts src/lib/ai/openai-content-generator.ts \
  src/lib/ai-content.ts src/lib/ai-generation.test.ts src/lib/ai-content.test.ts \
  src/lib/openai-content-generator.test.ts
```

(`src/lib/ai/` 디렉터리가 비면 함께 제거한다.)

- [ ] **Step 6: 빌드/테스트 확인**

Run: `npm run build`
Expected: 성공(누락 import 없음).
Run: `node --import tsx --test src/lib/**/*.test.ts`
Expected: AI 테스트가 사라진 채 나머지 통과.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove OpenAI AI generation layer"
```

### Task P0-2: WEC/WRC 수집 제거 (F1 전용 sync)

**Files:**
- Modify: `src/lib/sync/all-sync.ts`
- Delete: `src/lib/sync/wec-calendar.ts`, `src/lib/sync/wec-sync.ts`, `src/lib/sync/wec-calendar.test.ts`
- Delete: `src/lib/sync/wrc-calendar.ts`, `src/lib/sync/wrc-sync.ts`, `src/lib/sync/wrc-calendar.test.ts`
- (조건부) Delete: `src/lib/sync/calendar-dates.ts` — WEC/WRC 외 사용처가 없을 때만

**Interfaces:**
- Produces: `runAllScheduleSync(db)`가 F1만 실행.

- [ ] **Step 1: `all-sync.ts`를 F1 전용으로 축소**

```ts
import type { RaceNoteDb } from "@/lib/db";
import { runF1ScheduleSync } from "@/lib/sync/f1-sync";

export async function runAllScheduleSync(db: RaceNoteDb): Promise<{
  successes: number;
  failures: number;
}> {
  try {
    await runF1ScheduleSync(db);
    return { successes: 1, failures: 0 };
  } catch {
    return { successes: 0, failures: 1 };
  }
}
```

- [ ] **Step 2: `calendar-dates.ts` 사용처 확인**

Run: `rg -l "calendar-dates" src`
Expected: WEC/WRC 파일만 매칭하면 삭제 대상에 포함. 다른 곳에서 쓰면 남긴다.

- [ ] **Step 3: WEC/WRC 파일 삭제**

```bash
git rm src/lib/sync/wec-calendar.ts src/lib/sync/wec-sync.ts src/lib/sync/wec-calendar.test.ts \
  src/lib/sync/wrc-calendar.ts src/lib/sync/wrc-sync.ts src/lib/sync/wrc-calendar.test.ts
```

(Step 2에서 단독 사용이 확인되면 `git rm src/lib/sync/calendar-dates.ts`도 추가.)

- [ ] **Step 4: 빌드/테스트 확인**

Run: `npm run build` → 성공.
Run: `node --import tsx --test src/lib/**/*.test.ts` → 통과(WEC/WRC 테스트 제거됨).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: drop WEC/WRC schedule sync, F1-only"
```

### Task P0-3: 관리자(admin) 라우트·컴포넌트·lib 제거

**Files:**
- Delete (dir): `src/app/admin/`
- Delete (dir): `src/components/admin/`
- Delete: `src/lib/admin-auth-crypto.ts`, `src/lib/admin-auth-crypto.test.ts`, `src/lib/admin-auth.ts`,
  `src/lib/admin-data-format.ts`, `src/lib/admin-data-format.test.ts`, `src/lib/admin-data.ts`,
  `src/lib/admin-race-detail-editor.ts`, `src/lib/admin-race-editor.ts`,
  `src/lib/admin-race-mutations.ts`, `src/lib/admin-race-mutations.test.ts`,
  `src/lib/admin-runtime.ts`, `src/lib/admin-runtime.test.ts`
- Delete: `src/data/mock-admin.ts`

**Interfaces:**
- Produces: 관리자 라우트/액션 없음. 공개 화면만 남는다.

- [ ] **Step 1: 관리자 모듈 외부 사용처 확인**

Run: `rg -l "@/lib/admin|components/admin|mock-admin|admin-auth" src --glob '!src/app/admin/**' --glob '!src/lib/admin*' --glob '!src/components/admin/**'`
Expected: 매칭 없음(관리자 코드는 자기 영역에서만 참조). 매칭이 있으면 해당 참조부터 정리.

- [ ] **Step 2: 관리자 파일/디렉터리 삭제**

```bash
git rm -r src/app/admin src/components/admin
git rm src/lib/admin-auth-crypto.ts src/lib/admin-auth-crypto.test.ts src/lib/admin-auth.ts \
  src/lib/admin-data-format.ts src/lib/admin-data-format.test.ts src/lib/admin-data.ts \
  src/lib/admin-race-detail-editor.ts src/lib/admin-race-editor.ts \
  src/lib/admin-race-mutations.ts src/lib/admin-race-mutations.test.ts \
  src/lib/admin-runtime.ts src/lib/admin-runtime.test.ts \
  src/data/mock-admin.ts
```

- [ ] **Step 3: 빌드/테스트 확인**

Run: `npm run build` → 성공.
Run: `node --import tsx --test src/lib/**/*.test.ts` → 통과.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove admin routes, components, and lib"
```

### Task P0-4: 캘린더/시리즈/구 레이스 라우트 제거 + 네비게이션 정리

**Files:**
- Delete (dir): `src/app/calendar/`, `src/app/series/`, `src/app/races/`
- Modify: `src/components/PublicHeader/PublicHeader.tsx`
- (조건부) Delete: `src/components/CalendarSchedule/`, `src/components/HomeRaceGrid/` — 사용처 없을 때만

**Interfaces:**
- Produces: 공개 라우트는 `/`, `/f1/*`만. 네비게이션은 `SEASON / DRIVERS / TEAMS`.

- [ ] **Step 1: 제거 대상 라우트의 컴포넌트 사용처 확인**

Run: `rg -l "CalendarSchedule|HomeRaceGrid" src/app`
Expected: `calendar`/`series`/`races`/구 `page` 외 사용 없음이면 컴포넌트도 삭제 대상.

- [ ] **Step 2: 라우트 삭제**

```bash
git rm -r src/app/calendar src/app/series src/app/races
```

(Step 1에서 미사용 확인 시) `git rm -r src/components/CalendarSchedule src/components/HomeRaceGrid`

- [ ] **Step 3: `PublicHeader.tsx` 네비게이션 정리**

`links` 배열을 가이드 제외(MVP 이후 추가)로 바꾼다.

```ts
const links = [
  { href: "/", label: "시즌" },
  { href: "/f1/drivers", label: "드라이버" },
  { href: "/f1/teams", label: "팀" },
];
```

- [ ] **Step 4: 가이드 페이지 처리 확인**

`/f1/guide`는 보류이므로 라우트는 유지하되 네비에서 제외했다. 빌드가 통과하는지 확인.

- [ ] **Step 5: 빌드 확인**

Run: `npm run build` → 성공. 남은 공개 라우트(`/`, `/f1/drivers`, `/f1/teams`, `/f1/guide`)만 빌드되는지 출력 확인.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove calendar/series/old-race routes, trim nav to F1"
```

### Task P0-5: 미사용 공개 데이터/목 정리 보류 메모

**Files:**
- Modify: `PROJECT_HANDOFF.md`

`src/lib/public-data.ts`와 `src/data/mock-races.ts`는 `/f1/races/[slug]`(Phase 2)에서 F1 기준으로
재작성하며 정리한다. Phase 0에서는 삭제하지 않는다(Phase 2 의존). `manual_overrides`/`change_logs`
기록은 관리자가 없어 항상 빈/감사 용도이므로, Phase 1의 sync 정리 Task에서 단순화한다.

- [ ] **Step 1: 핸드오프에 Phase 0 결과 기록**

`PROJECT_HANDOFF.md`에 "2026-06-30 F1 전자동 전환 Phase 0: AI/WEC/WRC/admin/calendar/series 제거,
네비 F1 전용. public-data/mock-races는 Phase 2에서 정리 예정" 항목을 추가한다.

- [ ] **Step 2: Commit**

```bash
git add PROJECT_HANDOFF.md
git commit -m "docs: record Phase 0 legacy removal in handoff"
```

---

# Phase 1 — F1 데이터 계층 + 대시보드 홈/드라이버/팀

순수 파서·병합 함수는 node:test TDD로 작성한다. D1 스키마/스토어/페이지는 빌드 + 메모리 SQLite로 검증한다.

## 파일 구조 (Phase 1 신규/수정)

- `src/db/schema/index.ts` — `raceResults`, `driverStandings`, `constructorStandings` 테이블 추가
- `drizzle/migrations/0007_f1_results_standings.sql` — 대응 마이그레이션(번호는 기존 최댓값+1로 확정)
- `src/lib/sync/types.ts` — `NormalizedRaceResult`, `NormalizedStanding` 타입 추가
- `src/lib/sync/f1-results.ts` — Jolpica 결과 파서(순수 함수) + 테스트
- `src/lib/sync/f1-standings.ts` — Jolpica 순위 파서(순수 함수) + 테스트
- `src/lib/sync/results-store.ts` — 결과 D1 upsert
- `src/lib/sync/standings-store.ts` — 순위 D1 upsert
- `src/lib/sync/f1-sync.ts` — 결과·순위 수집을 일정 수집 뒤에 이어 실행
- `src/data/f1-season.ts` — 시드에 `jolpicaDriverId`/`jolpicaConstructorId` 추가
- `src/lib/f1-standings-merge.ts` — 시드+D1 병합(순수 함수) + 테스트
- `src/lib/f1-data.ts` — 페이지용 조회(dev 시드 폴백, prod D1+시드)
- `src/app/page.tsx`, `src/app/f1/drivers/page.tsx`, `src/app/f1/teams/page.tsx` — `f1-data.ts` 사용으로 재배선
- `src/app/home.scss`, `src/app/public-pages.scss` — 대시보드형 보강(필요 범위)

### Task P1-1: D1 스키마에 결과·순위 테이블 추가

**Files:**
- Modify: `src/db/schema/index.ts`
- Create: `drizzle/migrations/0007_f1_results_standings.sql`

**Interfaces:**
- Produces: `raceResults`, `driverStandings`, `constructorStandings` 테이블과 `$inferInsert`/`$inferSelect` 타입.

- [ ] **Step 1: 마이그레이션 번호 확정**

Run: `ls drizzle/migrations`
Expected: 최댓값은 `0006_race_detail.sql`(이미 존재). 새 파일은 `0007_f1_results_standings.sql`. 만약 0007이 이미 있으면 다음 번호로.

- [ ] **Step 2: 스키마 테이블 추가**

`src/db/schema/index.ts`의 `raceWatchTargets` 정의 다음(타입 export 위)에 추가한다.

```ts
export const raceResults = sqliteTable(
  "race_results",
  {
    id: text("id").primaryKey(),
    raceId: text("race_id")
      .notNull()
      .references(() => races.id, { onDelete: "cascade", onUpdate: "cascade" }),
    season: integer("season").notNull(),
    sessionType: text("session_type").notNull().default("race"),
    position: integer("position").notNull(),
    driverId: text("driver_id"),
    driverName: text("driver_name").notNull(),
    teamId: text("team_id"),
    teamName: text("team_name"),
    gridPosition: integer("grid_position"),
    timeOrGap: text("time_or_gap"),
    points: integer("points").notNull().default(0),
    status: text("status"),
    sourceKey: text("source_key").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("race_results_race_idx").on(table.raceId, table.sessionType, table.position),
    uniqueIndex("race_results_source_key_idx").on(table.sourceKey),
  ],
);

export const driverStandings = sqliteTable(
  "driver_standings",
  {
    id: text("id").primaryKey(),
    season: integer("season").notNull(),
    driverId: text("driver_id").notNull(),
    position: integer("position").notNull(),
    points: integer("points").notNull().default(0),
    wins: integer("wins").notNull().default(0),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("driver_standings_season_driver_idx").on(table.season, table.driverId),
    index("driver_standings_position_idx").on(table.season, table.position),
  ],
);

export const constructorStandings = sqliteTable(
  "constructor_standings",
  {
    id: text("id").primaryKey(),
    season: integer("season").notNull(),
    constructorId: text("constructor_id").notNull(),
    position: integer("position").notNull(),
    points: integer("points").notNull().default(0),
    wins: integer("wins").notNull().default(0),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("constructor_standings_season_idx").on(table.season, table.constructorId),
    index("constructor_standings_position_idx").on(table.season, table.position),
  ],
);
```

파일 하단 타입 export에 추가:

```ts
export type RaceResultRow = typeof raceResults.$inferSelect;
export type NewRaceResultRow = typeof raceResults.$inferInsert;
export type DriverStandingRow = typeof driverStandings.$inferSelect;
export type NewDriverStandingRow = typeof driverStandings.$inferInsert;
export type ConstructorStandingRow = typeof constructorStandings.$inferSelect;
export type NewConstructorStandingRow = typeof constructorStandings.$inferInsert;
```

- [ ] **Step 3: 마이그레이션 SQL 작성**

`drizzle/migrations/0007_f1_results_standings.sql`:

```sql
CREATE TABLE `race_results` (
  `id` text PRIMARY KEY NOT NULL,
  `race_id` text NOT NULL,
  `season` integer NOT NULL,
  `session_type` text DEFAULT 'race' NOT NULL,
  `position` integer NOT NULL,
  `driver_id` text,
  `driver_name` text NOT NULL,
  `team_id` text,
  `team_name` text,
  `grid_position` integer,
  `time_or_gap` text,
  `points` integer DEFAULT 0 NOT NULL,
  `status` text,
  `source_key` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `race_results_race_idx` ON `race_results` (`race_id`,`session_type`,`position`);
--> statement-breakpoint
CREATE UNIQUE INDEX `race_results_source_key_idx` ON `race_results` (`source_key`);
--> statement-breakpoint
CREATE TABLE `driver_standings` (
  `id` text PRIMARY KEY NOT NULL,
  `season` integer NOT NULL,
  `driver_id` text NOT NULL,
  `position` integer NOT NULL,
  `points` integer DEFAULT 0 NOT NULL,
  `wins` integer DEFAULT 0 NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `driver_standings_season_driver_idx` ON `driver_standings` (`season`,`driver_id`);
--> statement-breakpoint
CREATE INDEX `driver_standings_position_idx` ON `driver_standings` (`season`,`position`);
--> statement-breakpoint
CREATE TABLE `constructor_standings` (
  `id` text PRIMARY KEY NOT NULL,
  `season` integer NOT NULL,
  `constructor_id` text NOT NULL,
  `position` integer NOT NULL,
  `points` integer DEFAULT 0 NOT NULL,
  `wins` integer DEFAULT 0 NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `constructor_standings_season_idx` ON `constructor_standings` (`season`,`constructor_id`);
--> statement-breakpoint
CREATE INDEX `constructor_standings_position_idx` ON `constructor_standings` (`season`,`position`);
```

- [ ] **Step 4: 메모리 SQLite로 마이그레이션 검증**

Run: `sqlite3 :memory: ".read drizzle/migrations/0000_initial.sql" ".read drizzle/migrations/0007_f1_results_standings.sql" "PRAGMA foreign_key_check;"`
Expected: 오류 출력 없음. (중간 마이그레이션이 테이블 의존성에 필요하면 0000~0006을 순서대로 `.read` 한다.)

- [ ] **Step 5: 빌드 확인**

Run: `npm run build`
Expected: 성공(타입 export 정상).

- [ ] **Step 6: Commit**

```bash
git add src/db/schema/index.ts drizzle/migrations/0007_f1_results_standings.sql
git commit -m "feat: add F1 race_results and standings tables"
```

### Task P1-2: Jolpica 순위 파서 (TDD)

**Files:**
- Modify: `src/lib/sync/types.ts`
- Create: `src/lib/sync/f1-standings.ts`
- Test: `src/lib/sync/f1-standings.test.ts`

**Interfaces:**
- Produces:
  - `type NormalizedStanding = { id: string; position: number; points: number; wins: number }`
  - `parseJolpicaDriverStandings(input: unknown, season: number): NormalizedStanding[]` — `id`는 `driverId`
  - `parseJolpicaConstructorStandings(input: unknown, season: number): NormalizedStanding[]` — `id`는 `constructorId`

- [ ] **Step 1: 타입 추가**

`src/lib/sync/types.ts` 끝에 추가:

```ts
export type NormalizedStanding = {
  id: string;
  position: number;
  points: number;
  wins: number;
};
```

- [ ] **Step 2: 실패 테스트 작성**

`src/lib/sync/f1-standings.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseJolpicaConstructorStandings,
  parseJolpicaDriverStandings,
} from "@/lib/sync/f1-standings";

const driverPayload = {
  MRData: {
    StandingsTable: {
      StandingsLists: [
        {
          DriverStandings: [
            { position: "1", points: "423", wins: "7", Driver: { driverId: "norris", code: "NOR" } },
            { position: "2", points: "421", wins: "8", Driver: { driverId: "max_verstappen", code: "VER" } },
          ],
        },
      ],
    },
  },
};

const constructorPayload = {
  MRData: {
    StandingsTable: {
      StandingsLists: [
        {
          ConstructorStandings: [
            { position: "1", points: "800", wins: "12", Constructor: { constructorId: "mclaren", name: "McLaren" } },
          ],
        },
      ],
    },
  },
};

test("parseJolpicaDriverStandings maps driverId, position, points, wins", () => {
  const rows = parseJolpicaDriverStandings(driverPayload, 2025);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], { id: "norris", position: 1, points: 423, wins: 7 });
  assert.equal(rows[1].id, "max_verstappen");
});

test("parseJolpicaConstructorStandings maps constructorId", () => {
  const rows = parseJolpicaConstructorStandings(constructorPayload, 2025);
  assert.deepEqual(rows[0], { id: "mclaren", position: 1, points: 800, wins: 12 });
});

test("empty standings list returns []", () => {
  assert.deepEqual(parseJolpicaDriverStandings({ MRData: { StandingsTable: { StandingsLists: [] } } }, 2025), []);
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `node --import tsx --test src/lib/sync/f1-standings.test.ts`
Expected: FAIL("Cannot find module '@/lib/sync/f1-standings'").

- [ ] **Step 4: 파서 구현**

`src/lib/sync/f1-standings.ts`:

```ts
import type { NormalizedStanding } from "@/lib/sync/types";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function intOf(value: unknown): number | null {
  const n = Number(typeof value === "string" ? value.trim() : value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function standingsList(input: unknown): RecordValue {
  if (
    isRecord(input) &&
    isRecord(input.MRData) &&
    isRecord(input.MRData.StandingsTable) &&
    Array.isArray(input.MRData.StandingsTable.StandingsLists) &&
    isRecord(input.MRData.StandingsTable.StandingsLists[0])
  ) {
    return input.MRData.StandingsTable.StandingsLists[0] as RecordValue;
  }
  return {};
}

function mapRows(
  rows: unknown,
  entityKey: "Driver" | "Constructor",
  idKey: "driverId" | "constructorId",
): NormalizedStanding[] {
  if (!Array.isArray(rows)) return [];
  const result: NormalizedStanding[] = [];
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const entity = isRecord(row[entityKey]) ? (row[entityKey] as RecordValue) : {};
    const id = typeof entity[idKey] === "string" ? (entity[idKey] as string) : null;
    const position = intOf(row.position);
    const points = intOf(row.points);
    if (!id || position === null) continue;
    result.push({
      id,
      position,
      points: points ?? 0,
      wins: intOf(row.wins) ?? 0,
    });
  }
  return result;
}

export function parseJolpicaDriverStandings(
  input: unknown,
  _season: number,
): NormalizedStanding[] {
  return mapRows(standingsList(input).DriverStandings, "Driver", "driverId");
}

export function parseJolpicaConstructorStandings(
  input: unknown,
  _season: number,
): NormalizedStanding[] {
  return mapRows(standingsList(input).ConstructorStandings, "Constructor", "constructorId");
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `node --import tsx --test src/lib/sync/f1-standings.test.ts`
Expected: PASS(3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/sync/types.ts src/lib/sync/f1-standings.ts src/lib/sync/f1-standings.test.ts
git commit -m "feat: parse Jolpica driver/constructor standings"
```

### Task P1-3: Jolpica 결과 파서 (TDD)

**Files:**
- Modify: `src/lib/sync/types.ts`
- Create: `src/lib/sync/f1-results.ts`
- Test: `src/lib/sync/f1-results.test.ts`

**Interfaces:**
- Produces:
  - `type NormalizedRaceResult = { sourceKey: string; season: number; round: number; position: number; driverId: string | null; driverName: string; teamId: string | null; teamName: string | null; gridPosition: number | null; timeOrGap: string | null; points: number; status: string | null }`
  - `parseJolpicaResults(input: unknown): { season: number; round: number; results: NormalizedRaceResult[] } | null`

- [ ] **Step 1: 타입 추가**

`src/lib/sync/types.ts` 끝에 추가:

```ts
export type NormalizedRaceResult = {
  sourceKey: string;
  season: number;
  round: number;
  position: number;
  driverId: string | null;
  driverName: string;
  teamId: string | null;
  teamName: string | null;
  gridPosition: number | null;
  timeOrGap: string | null;
  points: number;
  status: string | null;
};
```

- [ ] **Step 2: 실패 테스트 작성**

`src/lib/sync/f1-results.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseJolpicaResults } from "@/lib/sync/f1-results";

const payload = {
  MRData: {
    RaceTable: {
      season: "2025",
      round: "24",
      Races: [
        {
          season: "2025",
          round: "24",
          raceName: "Abu Dhabi Grand Prix",
          Results: [
            {
              position: "1",
              points: "25",
              grid: "1",
              status: "Finished",
              Driver: { driverId: "max_verstappen", givenName: "Max", familyName: "Verstappen" },
              Constructor: { constructorId: "red_bull", name: "Red Bull" },
              Time: { time: "1:26:07.469" },
            },
            {
              position: "2",
              points: "18",
              grid: "3",
              status: "Finished",
              Driver: { driverId: "piastri", givenName: "Oscar", familyName: "Piastri" },
              Constructor: { constructorId: "mclaren", name: "McLaren" },
              Time: { time: "+12.594" },
            },
          ],
        },
      ],
    },
  },
};

test("parseJolpicaResults extracts season, round, and rows", () => {
  const parsed = parseJolpicaResults(payload);
  assert.ok(parsed);
  assert.equal(parsed.season, 2025);
  assert.equal(parsed.round, 24);
  assert.equal(parsed.results.length, 2);
  assert.deepEqual(parsed.results[0], {
    sourceKey: "jolpica:f1:2025:24:race:1",
    season: 2025,
    round: 24,
    position: 1,
    driverId: "max_verstappen",
    driverName: "Max Verstappen",
    teamId: "red_bull",
    teamName: "Red Bull",
    gridPosition: 1,
    timeOrGap: "1:26:07.469",
    points: 25,
    status: "Finished",
  });
  assert.equal(parsed.results[1].timeOrGap, "+12.594");
});

test("parseJolpicaResults returns null when no race", () => {
  assert.equal(parseJolpicaResults({ MRData: { RaceTable: { Races: [] } } }), null);
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `node --import tsx --test src/lib/sync/f1-results.test.ts`
Expected: FAIL(모듈 없음).

- [ ] **Step 4: 파서 구현**

`src/lib/sync/f1-results.ts`:

```ts
import type { NormalizedRaceResult } from "@/lib/sync/types";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function intOf(value: unknown): number | null {
  const n = Number(typeof value === "string" ? value.trim() : value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseResultRow(
  row: unknown,
  season: number,
  round: number,
): NormalizedRaceResult | null {
  if (!isRecord(row)) return null;
  const position = intOf(row.position);
  if (position === null) return null;
  const driver = isRecord(row.Driver) ? row.Driver : {};
  const constructor = isRecord(row.Constructor) ? row.Constructor : {};
  const time = isRecord(row.Time) ? text(row.Time.time) : null;
  const given = text(driver.givenName);
  const family = text(driver.familyName);
  const driverName = [given, family].filter(Boolean).join(" ") || text(driver.driverId) || "Unknown";
  return {
    sourceKey: `jolpica:f1:${season}:${round}:race:${position}`,
    season,
    round,
    position,
    driverId: text(driver.driverId),
    driverName,
    teamId: text(constructor.constructorId),
    teamName: text(constructor.name),
    gridPosition: intOf(row.grid),
    timeOrGap: time,
    points: intOf(row.points) ?? 0,
    status: text(row.status),
  };
}

export function parseJolpicaResults(
  input: unknown,
): { season: number; round: number; results: NormalizedRaceResult[] } | null {
  if (
    !isRecord(input) ||
    !isRecord(input.MRData) ||
    !isRecord(input.MRData.RaceTable) ||
    !Array.isArray(input.MRData.RaceTable.Races) ||
    !isRecord(input.MRData.RaceTable.Races[0])
  ) {
    return null;
  }
  const race = input.MRData.RaceTable.Races[0] as RecordValue;
  const season = intOf(race.season);
  const round = intOf(race.round);
  if (season === null || round === null) return null;
  const rawResults = Array.isArray(race.Results) ? race.Results : [];
  const results = rawResults
    .map((row) => parseResultRow(row, season, round))
    .filter((row): row is NormalizedRaceResult => row !== null);
  if (results.length === 0) return null;
  return { season, round, results };
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `node --import tsx --test src/lib/sync/f1-results.test.ts`
Expected: PASS(2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/sync/types.ts src/lib/sync/f1-results.ts src/lib/sync/f1-results.test.ts
git commit -m "feat: parse Jolpica race results"
```

### Task P1-4: 순위 D1 스토어 (upsert)

**Files:**
- Create: `src/lib/sync/standings-store.ts`

**Interfaces:**
- Consumes: `NormalizedStanding`(P1-2), `runD1Batch`/`chunkD1Values`(`@/lib/d1-helpers`), `driverStandings`/`constructorStandings`(schema).
- Produces:
  - `upsertDriverStandings(db, season, rows: NormalizedStanding[], now: string): Promise<number>`
  - `upsertConstructorStandings(db, season, rows: NormalizedStanding[], now: string): Promise<number>`

- [ ] **Step 1: 스토어 구현**

`src/lib/sync/standings-store.ts`:

```ts
import { and, eq, inArray } from "drizzle-orm";
import { constructorStandings, driverStandings } from "@/db/schema";
import type { RaceNoteDb } from "@/lib/db";
import { chunkD1Values, runD1Batch, type D1BatchQuery } from "@/lib/d1-helpers";
import type { NormalizedStanding } from "@/lib/sync/types";

async function upsert(
  db: RaceNoteDb,
  table: typeof driverStandings | typeof constructorStandings,
  idColumn: typeof driverStandings.driverId | typeof constructorStandings.constructorId,
  idField: "driverId" | "constructorId",
  season: number,
  rows: NormalizedStanding[],
  now: string,
): Promise<number> {
  if (rows.length === 0) return 0;
  const ids = rows.map((row) => row.id);
  const existingChunks = await Promise.all(
    chunkD1Values(ids).map((chunk) =>
      db
        .select({ id: idColumn })
        .from(table)
        .where(and(eq(table.season, season), inArray(idColumn, chunk))),
    ),
  );
  const existing = new Set(existingChunks.flat().map((r) => r.id));
  const queries: D1BatchQuery[] = [];
  for (const row of rows) {
    if (existing.has(row.id)) {
      queries.push(
        db
          .update(table)
          .set({ position: row.position, points: row.points, wins: row.wins, updatedAt: now })
          .where(and(eq(table.season, season), eq(idColumn, row.id))),
      );
    } else {
      queries.push(
        db.insert(table).values({
          id: crypto.randomUUID(),
          season,
          [idField]: row.id,
          position: row.position,
          points: row.points,
          wins: row.wins,
          updatedAt: now,
        }),
      );
    }
  }
  await runD1Batch(db, queries);
  return rows.length;
}

export function upsertDriverStandings(
  db: RaceNoteDb,
  season: number,
  rows: NormalizedStanding[],
  now: string,
): Promise<number> {
  return upsert(db, driverStandings, driverStandings.driverId, "driverId", season, rows, now);
}

export function upsertConstructorStandings(
  db: RaceNoteDb,
  season: number,
  rows: NormalizedStanding[],
  now: string,
): Promise<number> {
  return upsert(
    db,
    constructorStandings,
    constructorStandings.constructorId,
    "constructorId",
    season,
    rows,
    now,
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 성공(드리즐 동적 키 `[idField]` 타입 통과). 타입 오류 시 `values()` 인자를 `NewDriverStandingRow`/`NewConstructorStandingRow`로 명시적 분기.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sync/standings-store.ts
git commit -m "feat: upsert F1 standings into D1"
```

### Task P1-5: 결과 D1 스토어 (upsert by sourceKey)

**Files:**
- Create: `src/lib/sync/results-store.ts`

**Interfaces:**
- Consumes: `NormalizedRaceResult`(P1-3), `races`/`raceResults`(schema), d1-helpers.
- Produces: `upsertRaceResults(db, rows: NormalizedRaceResult[], now: string): Promise<number>` — `races.sourceKey = "jolpica:f1:{season}:{round}"`로 raceId를 찾는다. 일치 레이스가 없으면 0.

- [ ] **Step 1: 스토어 구현**

`src/lib/sync/results-store.ts`:

```ts
import { eq, inArray } from "drizzle-orm";
import { raceResults, races } from "@/db/schema";
import type { RaceNoteDb } from "@/lib/db";
import { chunkD1Values, runD1Batch, type D1BatchQuery } from "@/lib/d1-helpers";
import type { NormalizedRaceResult } from "@/lib/sync/types";

export async function upsertRaceResults(
  db: RaceNoteDb,
  rows: NormalizedRaceResult[],
  now: string,
): Promise<number> {
  if (rows.length === 0) return 0;
  const first = rows[0];
  const raceSourceKey = `jolpica:f1:${first.season}:${first.round}`;
  const raceRow = await db
    .select({ id: races.id })
    .from(races)
    .where(eq(races.sourceKey, raceSourceKey))
    .limit(1);
  const raceId = raceRow[0]?.id;
  if (!raceId) return 0;

  const sourceKeys = rows.map((row) => row.sourceKey);
  const existingChunks = await Promise.all(
    chunkD1Values(sourceKeys).map((chunk) =>
      db.select({ sourceKey: raceResults.sourceKey }).from(raceResults).where(inArray(raceResults.sourceKey, chunk)),
    ),
  );
  const existing = new Set(existingChunks.flat().map((r) => r.sourceKey));
  const queries: D1BatchQuery[] = [];
  for (const row of rows) {
    const values = {
      raceId,
      season: row.season,
      sessionType: "race",
      position: row.position,
      driverId: row.driverId,
      driverName: row.driverName,
      teamId: row.teamId,
      teamName: row.teamName,
      gridPosition: row.gridPosition,
      timeOrGap: row.timeOrGap,
      points: row.points,
      status: row.status,
      sourceKey: row.sourceKey,
      updatedAt: now,
    };
    if (existing.has(row.sourceKey)) {
      queries.push(db.update(raceResults).set(values).where(eq(raceResults.sourceKey, row.sourceKey)));
    } else {
      queries.push(db.insert(raceResults).values({ id: crypto.randomUUID(), createdAt: now, ...values }));
    }
  }
  await runD1Batch(db, queries);
  return rows.length;
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sync/results-store.ts
git commit -m "feat: upsert F1 race results into D1"
```

### Task P1-6: F1 sync에 결과·순위 수집 연결

**Files:**
- Modify: `src/lib/sync/f1-sync.ts`

**Interfaces:**
- Consumes: 파서(P1-2,3), 스토어(P1-4,5), `parseJolpicaSchedule`/`runScheduleSource`(기존).
- Produces: `runF1ScheduleSync(db, fetcher?)`가 일정 수집 후 현재 시즌 순위와 최근 라운드 결과까지 수집한다. 일정 수집 실패는 그대로 throw, 결과/순위 실패는 일정 성공을 막지 않도록 격리(`console.error`만).

- [ ] **Step 1: f1-sync 확장**

`src/lib/sync/f1-sync.ts`를 아래로 교체한다.

```ts
import type { RaceNoteDb } from "@/lib/db";
import { parseJolpicaSchedule } from "@/lib/sync/f1-jolpica";
import { parseJolpicaResults } from "@/lib/sync/f1-results";
import {
  parseJolpicaConstructorStandings,
  parseJolpicaDriverStandings,
} from "@/lib/sync/f1-standings";
import { upsertRaceResults } from "@/lib/sync/results-store";
import { runScheduleSource } from "@/lib/sync/source-runner";
import {
  upsertConstructorStandings,
  upsertDriverStandings,
} from "@/lib/sync/standings-store";

const SEASON = new Date().getUTCFullYear();
const BASE = "https://api.jolpi.ca/ergast/f1";

async function fetchJson(fetcher: typeof fetch, url: string): Promise<unknown> {
  const response = await fetcher(url, {
    headers: { "User-Agent": "RaceNote/1.0 (+https://race-note.rafdi.workers.dev)" },
  });
  if (!response.ok) throw new Error(`Jolpica HTTP ${response.status} for ${url}`);
  return response.json();
}

export async function runF1ScheduleSync(db: RaceNoteDb, fetcher: typeof fetch = fetch) {
  const result = await runScheduleSource({
    db,
    fetcher,
    sourceId: "source-f1-jolpica",
    parse: (body) => parseJolpicaSchedule(JSON.parse(body)),
  });

  const now = new Date().toISOString();

  try {
    const standings = await fetchJson(fetcher, `${BASE}/${SEASON}/driverStandings/`);
    await upsertDriverStandings(db, SEASON, parseJolpicaDriverStandings(standings, SEASON), now);
    const constructors = await fetchJson(fetcher, `${BASE}/${SEASON}/constructorStandings/`);
    await upsertConstructorStandings(
      db,
      SEASON,
      parseJolpicaConstructorStandings(constructors, SEASON),
      now,
    );
  } catch (error) {
    console.error("F1 standings sync failed", error);
  }

  try {
    const lastResults = await fetchJson(fetcher, `${BASE}/${SEASON}/last/results/`);
    const parsed = parseJolpicaResults(lastResults);
    if (parsed) await upsertRaceResults(db, parsed.results, now);
  } catch (error) {
    console.error("F1 results sync failed", error);
  }

  return result;
}
```

- [ ] **Step 2: 빌드/cf 빌드 확인**

Run: `npm run build` → 성공.
Run: `npm run cf:build` → 성공(Worker 번들에 새 모듈 포함).

- [ ] **Step 3: Commit**

```bash
git add src/lib/sync/f1-sync.ts
git commit -m "feat: collect F1 standings and latest results in sync"
```

### Task P1-7: 시드에 Jolpica 매칭 키 추가

**Files:**
- Modify: `src/data/f1-season.ts`

**Interfaces:**
- Produces: `F1Driver`에 `jolpicaDriverId: string`, `F1Team`에 `jolpicaConstructorId: string` 추가.

- [ ] **Step 1: 타입 확장**

`F1Driver` 타입에 `jolpicaDriverId: string;`, `F1Team` 타입에 `jolpicaConstructorId: string;`를 추가한다.

- [ ] **Step 2: 각 드라이버·팀에 ID 채우기**

Jolpica `driverId`/`constructorId` 규칙(소문자, 공백→`_`, 일부는 성 기반)을 따른다. 실제 값은
`https://api.jolpi.ca/ergast/f1/2025/drivers/` 와 `.../constructors/`로 확인한다. 예시 매핑(검증 후 확정):

```txt
드라이버: norris, max_verstappen, piastri, russell, leclerc, hamilton, antonelli(=kimi_antonelli),
  alonso, sainz, albon, hulkenberg, ocon, gasly, stroll, bearman, lawson, hadjar, colapinto,
  bortoleto, bottas, perez
팀: mclaren, ferrari, mercedes, red_bull, williams, aston_martin, alpine, haas, rb(=racing_bulls),
  sauber/audi(시즌 명칭 확인), cadillac(신규, API 확인)
```

신규 팀/드라이버가 Jolpica에 아직 없으면 `jolpicaConstructorId`/`jolpicaDriverId`를 가장 가까운 공식
ID로 두되, 매칭 실패는 병합에서 시드 폴백으로 처리된다(P1-8).

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 성공(필수 필드 누락 시 타입 오류로 드러남 → 모두 채운다).

- [ ] **Step 4: Commit**

```bash
git add src/data/f1-season.ts
git commit -m "feat: add Jolpica id keys to F1 seed data"
```

### Task P1-8: 시드+D1 순위 병합 (TDD)

**Files:**
- Create: `src/lib/f1-standings-merge.ts`
- Test: `src/lib/f1-standings-merge.test.ts`

**Interfaces:**
- Consumes: `F1Driver`/`F1Team`(시드), `DriverStandingRow`/`ConstructorStandingRow`(schema는 형태만 참조).
- Produces:
  - `type DriverStanding = { slug; name; code; number; nationality; team; position: number; points: number; wins: number; note; style }`
  - `type ConstructorStanding = { slug; name; shortName; drivers: string[]; car; tone; position: number; points: number; wins: number; note }`
  - `mergeDriverStandings(seed: F1Driver[], rows: { driverId: string; position: number; points: number; wins: number }[]): DriverStanding[]`
  - `mergeConstructorStandings(seed: F1Team[], rows: { constructorId: string; position: number; points: number; wins: number }[]): ConstructorStanding[]`
  - 규칙: D1 행이 있으면 position/points/wins는 D1 값, 없으면 시드의 `position`(문자열→숫자)·`points`·`wins=0` 폴백. position 오름차순 정렬. position 없는 시드는 뒤로.

- [ ] **Step 1: 실패 테스트 작성**

`src/lib/f1-standings-merge.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeDriverStandings } from "@/lib/f1-standings-merge";
import type { F1Driver } from "@/data/f1-season";

const seed: F1Driver[] = [
  { slug: "norris", name: "Lando Norris", code: "NOR", team: "McLaren", nationality: "United Kingdom",
    number: "4", position: "05", points: 73, note: "n", style: "s", jolpicaDriverId: "norris" },
  { slug: "verstappen", name: "Max Verstappen", code: "VER", team: "Red Bull Racing",
    nationality: "Netherlands", number: "1", note: "n", style: "s", jolpicaDriverId: "max_verstappen" },
];

test("D1 row overrides seed position/points/wins and sorts by position", () => {
  const merged = mergeDriverStandings(seed, [
    { driverId: "max_verstappen", position: 1, points: 421, wins: 8 },
    { driverId: "norris", position: 2, points: 400, wins: 5 },
  ]);
  assert.equal(merged[0].name, "Max Verstappen");
  assert.equal(merged[0].position, 1);
  assert.equal(merged[0].points, 421);
  assert.equal(merged[1].slug, "norris");
});

test("missing D1 row falls back to seed position/points", () => {
  const merged = mergeDriverStandings(seed, []);
  // norris seed position "05" -> 5, verstappen has no seed position -> sorted last
  assert.equal(merged[0].slug, "norris");
  assert.equal(merged[0].position, 5);
  assert.equal(merged[1].slug, "verstappen");
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --import tsx --test src/lib/f1-standings-merge.test.ts`
Expected: FAIL(모듈 없음).

- [ ] **Step 3: 병합 구현**

`src/lib/f1-standings-merge.ts`:

```ts
import type { F1Driver, F1Team } from "@/data/f1-season";

export type DriverStanding = {
  slug: string;
  name: string;
  code: string;
  number: string;
  nationality: string;
  team: string;
  position: number;
  points: number;
  wins: number;
  note: string;
  style: string;
};

export type ConstructorStanding = {
  slug: string;
  name: string;
  shortName: string;
  drivers: string[];
  car: string;
  tone: F1Team["tone"];
  position: number;
  points: number;
  wins: number;
  note: string;
};

const NO_RANK = 9999;

function seedPosition(value: string | undefined): number {
  if (!value) return NO_RANK;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : NO_RANK;
}

export function mergeDriverStandings(
  seed: F1Driver[],
  rows: { driverId: string; position: number; points: number; wins: number }[],
): DriverStanding[] {
  const byId = new Map(rows.map((row) => [row.driverId, row]));
  return seed
    .map((driver) => {
      const row = byId.get(driver.jolpicaDriverId);
      return {
        slug: driver.slug,
        name: driver.name,
        code: driver.code,
        number: driver.number,
        nationality: driver.nationality,
        team: driver.team,
        position: row?.position ?? seedPosition(driver.position),
        points: row?.points ?? driver.points ?? 0,
        wins: row?.wins ?? 0,
        note: driver.note,
        style: driver.style,
      };
    })
    .sort((a, b) => a.position - b.position);
}

export function mergeConstructorStandings(
  seed: F1Team[],
  rows: { constructorId: string; position: number; points: number; wins: number }[],
): ConstructorStanding[] {
  const byId = new Map(rows.map((row) => [row.constructorId, row]));
  return seed
    .map((team) => {
      const row = byId.get(team.jolpicaConstructorId);
      return {
        slug: team.slug,
        name: team.name,
        shortName: team.shortName,
        drivers: team.drivers,
        car: team.car,
        tone: team.tone,
        position: row?.position ?? seedPosition(team.position),
        points: row?.points ?? team.points ?? 0,
        wins: row?.wins ?? 0,
        note: team.note,
      };
    })
    .sort((a, b) => a.position - b.position);
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --import tsx --test src/lib/f1-standings-merge.test.ts`
Expected: PASS(2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/f1-standings-merge.ts src/lib/f1-standings-merge.test.ts
git commit -m "feat: merge seed editorial with D1 standings"
```

### Task P1-9: 페이지용 F1 조회 계층 (dev 시드 폴백 / prod D1 병합)

**Files:**
- Create: `src/lib/f1-data.ts`

**Interfaces:**
- Consumes: 병합(P1-8), schema 테이블, `getDb`.
- Produces:
  - `getDriverStandings(): Promise<DriverStanding[]>`
  - `getConstructorStandings(): Promise<ConstructorStanding[]>`
  - 규칙: `process.env.NODE_ENV === "development"`이면 D1 없이 시드만으로 병합(빈 rows). 운영이면 D1 순위 조회 후 병합. D1 조회 실패 시 시드 폴백.

- [ ] **Step 1: 조회 계층 구현**

`src/lib/f1-data.ts`:

```ts
import { asc, eq } from "drizzle-orm";
import { constructorStandings, driverStandings } from "@/db/schema";
import { f1Drivers, f1Teams } from "@/data/f1-season";
import { getDb } from "@/lib/db";
import {
  mergeConstructorStandings,
  mergeDriverStandings,
  type ConstructorStanding,
  type DriverStanding,
} from "@/lib/f1-standings-merge";

const SEASON = new Date().getUTCFullYear();

export async function getDriverStandings(): Promise<DriverStanding[]> {
  if (process.env.NODE_ENV === "development") {
    return mergeDriverStandings(f1Drivers, []);
  }
  try {
    const db = await getDb();
    const rows = await db
      .select({
        driverId: driverStandings.driverId,
        position: driverStandings.position,
        points: driverStandings.points,
        wins: driverStandings.wins,
      })
      .from(driverStandings)
      .where(eq(driverStandings.season, SEASON))
      .orderBy(asc(driverStandings.position));
    return mergeDriverStandings(f1Drivers, rows);
  } catch (error) {
    console.error("getDriverStandings fell back to seed", error);
    return mergeDriverStandings(f1Drivers, []);
  }
}

export async function getConstructorStandings(): Promise<ConstructorStanding[]> {
  if (process.env.NODE_ENV === "development") {
    return mergeConstructorStandings(f1Teams, []);
  }
  try {
    const db = await getDb();
    const rows = await db
      .select({
        constructorId: constructorStandings.constructorId,
        position: constructorStandings.position,
        points: constructorStandings.points,
        wins: constructorStandings.wins,
      })
      .from(constructorStandings)
      .where(eq(constructorStandings.season, SEASON))
      .orderBy(asc(constructorStandings.position));
    return mergeConstructorStandings(f1Teams, rows);
  } catch (error) {
    console.error("getConstructorStandings fell back to seed", error);
    return mergeConstructorStandings(f1Teams, []);
  }
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build` → 성공.

- [ ] **Step 3: Commit**

```bash
git add src/lib/f1-data.ts
git commit -m "feat: F1 standings data layer with seed fallback"
```

### Task P1-10: 드라이버·팀 페이지를 D1 병합 데이터로 재배선

**Files:**
- Modify: `src/app/f1/drivers/page.tsx`
- Modify: `src/app/f1/teams/page.tsx`

**Interfaces:**
- Consumes: `getDriverStandings`/`getConstructorStandings`(P1-9). 표시 위계는 기존 SCSS 클래스 유지.

- [ ] **Step 1: 드라이버 페이지 재배선**

`src/app/f1/drivers/page.tsx`에서 `f1Drivers` 직접 사용 대신 조회 계층을 쓴다. 컴포넌트를 `async`로 바꾸고 `position`은 두 자리 패딩 표시.

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";
import { getDriverStandings } from "@/lib/f1-data";

export const metadata: Metadata = {
  title: "F1 드라이버",
  description: "2026 F1 드라이버 순위와 드라이버별 관전 포인트",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default async function F1DriversPage() {
  const drivers = await getDriverStandings();
  const ranked = drivers.filter((d) => d.position < 9999);
  return (
    <div className="public-page f1-page f1-drivers-page">
      <PageHeader
        description="2026 시즌 F1 드라이버를 순위, 팀, 국적, 포인트와 입문자 관전 포인트 중심으로 정리합니다."
        eyebrow="드라이버 인덱스"
        index="D/01"
        meta="2026 Formula 1"
        title="드라이버"
      />

      <section className="f1-page__content container">
        <div className="f1-page__podium" aria-label="드라이버 순위 상위 3명">
          {ranked.slice(0, 3).map((driver) => (
            <article className="f1-page__podium-card" key={driver.slug}>
              <span>{pad(driver.position)}</span>
              <strong>{driver.name}</strong>
              <p>{driver.team}</p>
              <small>{driver.nationality} · {driver.points} PTS</small>
            </article>
          ))}
        </div>
      </section>

      <section className="f1-page__content container">
        <div className="f1-page__section-heading">
          <SectionLabel index="02">드라이버 순위</SectionLabel>
          <p className="type-korean">순위와 포인트는 시즌 진행에 따라 자동 갱신됩니다.</p>
        </div>
        <div className="f1-page__table" role="table" aria-label="F1 드라이버 순위">
          <div className="f1-page__table-row f1-page__table-row--head" role="row">
            <span>POS</span>
            <span>DRIVER</span>
            <span>NATIONALITY</span>
            <span>TEAM</span>
            <span>PTS</span>
          </div>
          {ranked.map((driver) => (
            <div className="f1-page__table-row" role="row" key={driver.slug}>
              <span>{pad(driver.position)}</span>
              <strong>{driver.name} <em>{driver.code}</em></strong>
              <span>{driver.nationality}</span>
              <span>{driver.team}</span>
              <span>{driver.points}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="f1-page__content container">
        <div className="f1-page__section-heading">
          <SectionLabel index="03">드라이버 노트</SectionLabel>
          <p className="type-korean">사진 없이 번호, 팀, 국적, 스타일 문장으로 드라이버를 구분합니다.</p>
        </div>
        <div className="f1-page__card-grid">
          {drivers.map((driver) => (
            <article className="f1-page__driver-card" key={driver.slug}>
              <div>
                <span>#{driver.number}</span>
                <small>{driver.nationality}</small>
              </div>
              <h2>{driver.name}</h2>
              <p className="f1-page__meta">{driver.team}</p>
              <p className="type-korean">{driver.note}</p>
              <strong className="type-korean">{driver.style}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: 팀 페이지 재배선**

`src/app/f1/teams/page.tsx`도 동일 패턴으로 `getConstructorStandings()`를 사용하도록 바꾼다(기존 `f1Teams` 직접 사용 제거, `async` 함수, `pad(position)` 표시, 기존 클래스 유지). 기존 파일의 마크업 구조를 유지하고 데이터 소스만 교체한다.

- [ ] **Step 3: 빌드 확인**

Run: `npm run build` → 성공. `/f1/drivers`, `/f1/teams`가 동적 렌더링으로 빌드되는지 확인.

- [ ] **Step 4: Commit**

```bash
git add src/app/f1/drivers/page.tsx src/app/f1/teams/page.tsx
git commit -m "feat: wire drivers/teams pages to D1 standings"
```

### Task P1-11: 홈을 대시보드형 + D1 데이터로 재구성

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/home.scss`

**Interfaces:**
- Consumes: `getDriverStandings`/`getConstructorStandings`(P1-9), `f1NextRace`/`f1SeasonSchedule`/`f1LatestResult`(시드, 일정/결과 D1 연동은 Phase 2에서).

**디자인 방향:** 상단에 핵심 패널 그리드(다음 경기 · 드라이버 순위 · 컨스트럭터 순위 · 최근 결과)를
한눈에 배치하는 대시보드. 길게 늘어지는 서사형 섹션을 줄이고 정보 밀도를 높인다. 모바일 1열,
데스크톱 그리드.

- [ ] **Step 1: 홈 데이터 소스 교체**

`src/app/page.tsx`에서 모듈 스코프 `driverStandings`/`constructorStandings` 상수(시드 직접 필터)를 제거하고,
`Home`을 `async`로 바꿔 `getDriverStandings()`/`getConstructorStandings()`를 await한다. 순위 표시에 `pad(position)`을 쓴다.
`driverNotes`는 `drivers.slice(0, 3)`로 대체한다.

```tsx
import Image from "next/image";
import Link from "next/link";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";
import { SeriesBadge } from "@/components/SeriesBadge/SeriesBadge";
import { f1LatestResult, f1NextRace, f1SeasonSchedule } from "@/data/f1-season";
import { getConstructorStandings, getDriverStandings } from "@/lib/f1-data";

const pad = (n: number) => String(n).padStart(2, "0");
const completedRounds = f1SeasonSchedule.filter((r) => r.status === "done").length;
const progress = Math.round((completedRounds / f1SeasonSchedule.length) * 100);

export default async function Home() {
  const [drivers, teams] = await Promise.all([getDriverStandings(), getConstructorStandings()]);
  const rankedDrivers = drivers.filter((d) => d.position < 9999);
  const rankedTeams = teams.filter((t) => t.position < 9999);
  const driverNotes = drivers.slice(0, 3);
  // ...기존 마크업에서 driver.position(문자열) → pad(driver.position), driverStandings → rankedDrivers,
  //    constructorStandings → rankedTeams 로 치환
}
```

마크업의 순위/포인트 출력은 기존 클래스를 유지하되 `rankedDrivers.slice(0,3)`(포디움), `rankedDrivers.slice(0,5)`(테이블), `rankedTeams`(팀 카드)로 바꾼다.

- [ ] **Step 2: 대시보드형 레이아웃 보강**

`src/app/home.scss`에서 상단 `home__dashboard`/`home__season-pulse` 영역을 핵심 패널 그리드로 정리한다.
다음 경기·드라이버 순위·컨스트럭터 순위·최근 결과 패널이 데스크톱에서 한 화면에 보이도록
`grid-template-columns`를 조정하고, 길게 분리돼 있던 `home__explore`(중복 팀/드라이버 섹션)의 중복을
제거한다. 기존 토큰/믹스인을 사용하고 새 magic number·z-index를 만들지 않는다. 라이트/다크 모두 확인.

(중복 섹션 정리: 현재 `home__season-pulse`와 `home__explore`가 팀 카드를 두 번 렌더한다. 대시보드에서는
순위 패널 1회 + 프리뷰 진입 링크로 통합한다.)

- [ ] **Step 3: 빌드 확인**

Run: `npm run build` → 성공.

- [ ] **Step 4: 시각 확인(개발 서버)**

Run: `npm run dev` 후 브라우저로 `/` 확인. 시드 폴백 순위가 대시보드 패널에 표시되고 콘솔 오류가 없는지,
라이트/다크·모바일/데스크톱을 확인한다. (workerd 미동작 환경이므로 dev는 시드 폴백 데이터다.)

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/home.scss
git commit -m "feat: dashboard-style home backed by D1 standings"
```

### Task P1-12: Phase 1 통합 검증과 핸드오프 갱신

**Files:**
- Modify: `PROJECT_HANDOFF.md`

- [ ] **Step 1: 전체 테스트**

Run: `node --import tsx --test src/lib/**/*.test.ts`
Expected: 신규 파서·병합 테스트 포함 전부 PASS.

- [ ] **Step 2: 빌드/Cloudflare 검증**

Run: `npm run build` → 성공.
Run: `npm run cf:build` → 성공.
Run: `npm run cf:types` → 성공.

- [ ] **Step 3: 메모리 SQLite 마이그레이션 재검증**

Run: `sqlite3 :memory: ".read drizzle/migrations/0000_initial.sql" ".read drizzle/migrations/0007_f1_results_standings.sql" "PRAGMA foreign_key_check;"`
Expected: 오류 없음.(필요 시 0000~0006 순차 `.read`.)

- [ ] **Step 4: 핸드오프 기록**

`PROJECT_HANDOFF.md`에 Phase 1 완료(결과·순위 D1 테이블/마이그레이션, Jolpica 순위·결과 수집,
시드 병합, 대시보드 홈·드라이버·팀 D1 연동, dev 시드 폴백)와 다음 작업 경계(Phase 2 상세 페이지,
원격 D1 마이그레이션 적용 보류)를 추가한다. **원격 D1 `0006` 적용은 사용자 명시 요청 시에만**임을 명시.

- [ ] **Step 5: Commit**

```bash
git add PROJECT_HANDOFF.md
git commit -m "docs: record Phase 1 F1 data layer completion"
```

---

## Self-Review 기록

- **Spec coverage:** Phase 0(레거시 제거: AI P0-1, WEC/WRC P0-2, admin P0-3, calendar/series/races+nav P0-4) /
  Phase 1(데이터 모델 P1-1, Jolpica 순위·결과 수집 P1-2~6, 시드 키 P1-7, 병합 P1-8, 조회 P1-9,
  페이지 재배선 P1-10·11). 네이버 뉴스·상세 페이지·머신/코스·가이드는 스펙상 Phase 2/3로 별도 plan.
- **폴백:** 스펙 2.2(데이터 공백 시드 폴백)는 P1-8/P1-9에서 구현.
- **원격 D1 안전:** 모든 검증은 메모리 SQLite/빌드. 원격 migration/seed는 명시 요청 전 미실행(P1-12에 명시).
- **미해결 확정 항목:** P1-1 마이그레이션 번호(기존 최댓값+1 확인), P1-7 Jolpica id 실제 값(API로 확정),
  P1-2/P1-4의 드리즐 동적 키 타입은 빌드에서 확인 후 필요 시 명시 분기.

## 다음 plan 예고 (이 plan 범위 밖)

- Phase 2: `/f1/drivers/[slug]`, `/f1/teams/[slug]`(머신), `/f1/races/[slug]`(코스·결과), public-data/mock-races 정리.
- Phase 3: 네이버 뉴스 API 클라이언트·`news_cache` 테이블·Cron·뉴스 섹션.
