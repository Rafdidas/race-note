# Phase 1: F1 레이스 상세 강화 설계서

작성일: 2026-06-17
관련 문서: 당시 추가 개발 설계서의 Phase 1(현재 루트 문서는 `racenote_f1_full_pivot_screen_design.md`로 대체됨), `PROJECT_HANDOFF.md`, `AGENTS.md`

## 1. 목적과 배경

현재 RaceNote는 일정 수집·검수·AI 초안 생성까지 인프라는 완성됐지만, 사용자가
레이스 상세에서 볼 수 있는 것은 세션 시간표와 3줄 요약 수준이라 "일정 확인 후 더
볼 콘텐츠가 부족"하다. 이 spec은 당시 추가 개발 설계의 **Phase 1: 레이스 상세 강화**를
구현해 레이스 페이지를 "보기 전 읽는 브리핑"으로 채운다.

이번 범위는 **F1에 집중**한다. WEC/WRC는 데이터 확보·세션 추측 문제가 있고, v2
설계도 "F1을 우선 깊게 확장"을 명시했다. DB 스키마는 시리즈 범용으로 만들되,
**콘텐츠 입력과 표시는 F1 레이스부터** 채운다.

## 2. 범위

### 포함

- DB 테이블 3개: `race_facts`, `race_history`, `race_watch_targets` + 마이그레이션 `0006`
- 공개 레이스 상세(`/races/[slug]`)에 Quick Facts / Who to Watch / History / Next Race / Explore 섹션 추가
- 관리자 레이스 편집(`/admin/races/[id]`)을 탭 구조로 전환하고 Facts / History / Watch Targets 입력 추가
- 위 데이터의 공개·관리자 조회 계층, 타입, 변환 함수, 단위 테스트

### 제외 (다음 spec 또는 후속 Phase)

- `teams` / `drivers` / `cars` / `standings` 테이블과 F1 팀·드라이버·차 독립 페이지, 현재 순위
- Watch Target의 실제 FK 연결(`target_id` → drivers/teams)
- 홈 Standings Snapshot
- WEC/WRC 전용 Facts 입력·표시 분기
- 원격 D1 마이그레이션 적용·운영 배포 (명시 요청 시에만)

## 3. 결정 사항 (확정)

| 항목 | 결정 |
| --- | --- |
| 시리즈 범위 | F1만. 스키마는 범용, 입력·표시는 F1 우선 |
| Watch Target | Phase 1은 `target_name`·`reason` 직접 입력만. `target_id` FK 연결은 다음 Phase |
| Quick Facts 시리즈 분기 | 통합 테이블 + F1 레이아웃 고정 표시. 값 없는 필드는 미표시 |
| Next Race | 같은 시리즈의 다음 라운드(`start_date`가 더 늦은 가장 가까운 published) 자동 |
| 다른 시리즈 추천(Explore) | `is_featured = true`, 현재 시리즈 제외, 시간상 가장 가까운 published 1~2개. 별도 섹션 |
| 저장 검수 흐름 | Facts/History/Watch Targets는 검수 흐름 없이 저장 즉시 반영(needs_review 전환 안 함) |
| 관리자 탭 전환 | URL 쿼리(`?tab=...`) 기반. 탭 네비는 `<a>` 링크라 Server Component 유지 |

## 4. DB 설계

마이그레이션 `drizzle/migrations/0006_race_detail.sql`을 손으로 작성(drizzle-kit
`db:generate` 무응답 이슈 회피, 기존 0001~0005와 동일 방식). Drizzle
스키마(`src/db/schema/index.ts`)에 테이블 3개와 추론 타입을 추가한다.

세 테이블 모두 **수동 입력 전용**이라 `manual_overrides` 보호 대상이 아니며 자동
수집과 무관하다.

### 4.1 race_facts

레이스당 1행. `race_id` UNIQUE. v2 7.5 통합 스키마에 v2 6.1 F1 필드를 더해
구성한다(모든 콘텐츠 필드 nullable). F1에서 사용하는 필드: `circuit_name`,
`track_length`, `laps`, `race_distance`, `corners`, `drs_zones`, `first_held`,
`previous_winner`, `most_wins_driver`, `most_wins_team`, `lap_record`,
`pole_record`, `tyre_compounds`, `overtake_difficulty`, `key_sector`,
`weather_note`, `strategy_note`, `beginner_note`. (`tyre_compounds`,
`overtake_difficulty`, `key_sector`는 v2 6.1에는 있으나 7.5 스키마에 빠져 있어
추가한다.) WEC/WRC 전용 필드(`surface_type`, `total_stages`, `total_distance`,
`event_duration`, `classes`)도 컬럼으로 두되 Phase 1에서는 입력·표시하지 않는다.

```sql
CREATE TABLE race_facts (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL UNIQUE REFERENCES races(id) ON DELETE CASCADE ON UPDATE CASCADE,
  circuit_name TEXT,
  track_length TEXT,
  laps INTEGER,
  race_distance TEXT,
  corners INTEGER,
  drs_zones INTEGER,
  first_held INTEGER,
  previous_winner TEXT,
  most_wins_driver TEXT,
  most_wins_team TEXT,
  lap_record TEXT,
  pole_record TEXT,
  tyre_compounds TEXT,
  overtake_difficulty TEXT,
  key_sector TEXT,
  surface_type TEXT,
  total_stages INTEGER,
  total_distance TEXT,
  event_duration TEXT,
  classes TEXT,
  weather_note TEXT,
  strategy_note TEXT,
  beginner_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 4.2 race_history

레이스당 N행. 연도별 결과 기록. `race_id`에 인덱스, 표시·조회는 `season` 내림차순.

```sql
CREATE TABLE race_history (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL REFERENCES races(id) ON DELETE CASCADE ON UPDATE CASCADE,
  season INTEGER NOT NULL,
  winner_driver_name TEXT,
  winner_team_name TEXT,
  pole_driver_name TEXT,
  fastest_lap_driver_name TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX race_history_race_id_idx ON race_history(race_id, season);
```

### 4.3 race_watch_targets

레이스당 N행. 주목할 대상. `target_type`은 라벨 구분용(`driver` / `team` /
`manufacturer` / `car` / `manual`), `target_id`는 컬럼만 두고 Phase 1에서 항상
NULL. 표시·조회는 `display_order` 오름차순.

```sql
CREATE TABLE race_watch_targets (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL REFERENCES races(id) ON DELETE CASCADE ON UPDATE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_name TEXT NOT NULL,
  title TEXT,
  reason TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX race_watch_targets_race_id_idx ON race_watch_targets(race_id, display_order);
```

## 5. 타입

### 5.1 공개 (`src/types/public-data.ts`)

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

`RacePreview`(상세에서 사용)에 다음 옵셔널 필드를 확장한다:
`facts?: RaceFacts | null`, `history?: RaceHistoryEntry[]`,
`watchTargets?: WatchTarget[]`, `nextRace?: RelatedRaceCard | null`,
`featuredOther?: RelatedRaceCard[]`.

`facts`는 모든 필드가 null이면 `null`로 변환(섹션 미표시 판단을 변환 계층에서
처리). `RaceFacts`의 `null` 필드는 UI에서 해당 항목을 렌더링하지 않는다.

### 5.2 관리자 (`src/types/admin-data.ts`)

`AdminRace`에 `facts: AdminRaceFacts`(빈 값은 빈 문자열/`null`로 정규화),
`history: AdminRaceHistoryEntry[]`, `watchTargets: AdminWatchTarget[]`를 추가한다.
관리자 타입은 폼 바인딩 편의를 위해 빈 입력을 빈 문자열로 다룬다.

## 6. 데이터 조회 계층

### 6.1 공개 (`src/lib/public-data.ts`, `src/lib/public-data-format.ts`)

`getPublishedRaceBySlug(slug)`를 확장한다:

1. 기존 레이스/세션/콘텐츠 조회 유지
2. `race_facts` 1행, `race_history`(season desc), `race_watch_targets`
   (display_order asc) 조회
3. **Next Race**: 같은 `series_id`, `publish_status = 'published'`,
   `start_date > 현재 레이스 start_date`, `start_date asc` 첫 1행
4. **Explore(featured other)**: `is_featured = true`,
   `publish_status = 'published'`, `series_id != 현재 시리즈`,
   아직 끝나지 않은 레이스(`end_date >= 오늘`) 중 `start_date asc` 최대 2행.
   조건을 만족하는 결과가 없으면 섹션 미표시
5. 변환 함수로 `RaceFacts` / `RaceHistoryEntry[]` / `WatchTarget[]` /
   `RelatedRaceCard`로 매핑. 시간·기간 표기는 기존 KST 포맷 유틸 재사용

조회는 D1 제약을 고려해 단순 `where`/`limit` 쿼리로 구성하고, 다중 값 바인딩이
없으므로 `d1-helpers` 분할은 불필요하다.

### 6.2 관리자 (`src/lib/admin-data.ts`)

`getAdminRaceById(id)`가 facts/history/watchTargets를 함께 조회해 `AdminRace`에
포함한다.

## 7. 공개 레이스 상세 UI (`/races/[slug]`)

기존 섹션을 유지하면서 v2 5.2 공통 구조에 맞춰 섹션을 추가한다. **값이 없으면
섹션 자체를 렌더링하지 않는다**(빈 블록 비표시). F1만 facts/history/watch를
채우므로 WEC/WRC 상세는 기존 모습을 유지한다.

```
01 Schedule        (기존)
02 Must Watch      (기존)
03 Quick Facts     ← 신규: RaceFacts, F1 레이아웃 고정, 채워진 항목만
04 Race Brief      (기존)
05 Who to Watch    ← 신규: WatchTargetList
06 History         ← 신규: RaceHistory, season desc
07 Beginner Note   (기존)
08 Variables       (기존)
09 Next Race       ← 신규: NextRaceCard (같은 시리즈 다음 라운드)
10 Explore         ← 신규: 다른 시리즈 is_featured 1~2개 카드 (별도 섹션)
```

신규 컴포넌트(BEM, 컴포넌트 폴더에 `.scss`):

- `RaceFacts/` — Quick Facts. 라벨+값 그리드. `track_length`, `laps`, `corners`,
  `drs_zones`, `previous_winner`, `tyre_compounds`, `overtake_difficulty`,
  `key_sector` 등 채워진 항목만. 짧은 수치는 그리드, `key_sector`·`strategy_note`
  같은 서술형은 별도 메모 블록으로 표시. 숫자/시간값은 `.type-mono`
- `RaceHistory/` — 연도별 우승자 목록. `season` 기준 행, 우승자/팀/폴/패스티스트랩
- `WatchTargetList/` — `target_name`(+선택 `title`)과 `reason`. `target_type`은
  작은 배지 라벨
- `NextRaceCard/` — 같은 시리즈 다음 라운드 카드(시리즈 배지, 대회명, 장소, 기간,
  상세 링크)

`Explore` 섹션은 `NextRaceCard`와 동일한 카드 컴포넌트를 재사용하되 섹션 라벨과
배치만 다르게 한다(다른 시리즈 강조).

스타일: `src/styles/`의 기존 토큰·믹스인 우선. 라이트/다크, 모바일/데스크톱 확인.
이미지 없이 타이포·라인·배지로 정보 위계 구성(AGENTS.md 8장). 임의 z-index·매직
넘버 지양.

## 8. 관리자 탭 구조 (`/admin/races/[id]`)

기존 단일 스크롤 `AdminRaceEditor`를 탭 구조로 재구성한다. Phase 1 탭:

```
Basic · Sessions · Briefing · Facts · History · Watch Targets · Publish
```

- 기존 폼(기본 정보, 세션, 콘텐츠/AI, 공개)을 Basic/Sessions/Briefing/Publish
  탭으로 분리해 배치. 기존 Server Action·검증·보호 로직은 유지
- SEO 필드는 기존 콘텐츠 폼 위치를 유지한다(별도 SEO 탭 신설하지 않음)
- **탭 전환**: URL 쿼리 `?tab=facts` 기반. 탭 네비게이션은 `<a>` 링크
  (Server Component 유지, 별도 클라이언트 상태 불필요). 페이지 컴포넌트가
  `searchParams.tab`을 읽어 활성 탭만 표시
- **저장 후 복귀**: 신규 Server Action들은 `editorRedirect`에 `tab` 파라미터를
  포함해 저장한 탭으로 되돌아오게 한다. 기존 redirect 헬퍼를 `tab` 인자까지
  받도록 확장

### 8.1 신규 Server Actions (`src/app/admin/races/actions.ts`)

- `saveRaceFacts(raceId, formData)` — race_facts upsert
- `addRaceHistory(raceId, formData)` / `deleteRaceHistory(raceId, historyId)`
- `addWatchTarget(raceId, formData)` / `deleteWatchTarget(raceId, targetId)` /
  `reorderWatchTarget(raceId, targetId, direction)`

모든 mutation은:

- 기존 패턴대로 **관리자 세션 재검증** + D1 mutation 경계 검증
- **검수 흐름 없이 저장 즉시 반영** (레이스를 `needs_review`로 전환하지 않음)
- `revalidatePath`로 공개 상세·관리자 화면 갱신
- 다중 쓰기는 D1 원자적 `batch()` 사용(`transaction()` 금지, PROJECT_HANDOFF 정책)
- 입력 파싱·검증은 `src/lib/admin-race-mutations.ts` 패턴을 따라 별도 함수로 분리

### 8.2 신규 관리자 컴포넌트 (`src/components/admin/`)

- `RaceFactsForm/` — race_facts 입력 폼(F1 필드 위주)
- `RaceHistoryTable/` — 연도별 항목 목록 + 추가/삭제
- `WatchTargetEditor/` — 대상 추가/삭제/순서 변경

## 9. 검증 계획 (AGENTS.md 13장)

- `npm test` — facts/history/watchTargets 변환, Next Race·Explore 조회 로직,
  facts 전체 null → `null` 변환, 관리자 폼 파싱
- 메모리 SQLite에 `0006_race_detail.sql` 적용 + `drizzle/seed.sql` 2회 반복 +
  `PRAGMA foreign_key_check`
- `npm run lint`
- `npm run build`
- `npm run cf:build`
- UI 수동 확인: 라이트/다크, 모바일/데스크톱, 빈 상태(facts 없는 WEC/WRC 레이스가
  기존대로 보이는지), F1 레이스에 신규 섹션이 보이는지, 콘솔 오류

원격 D1 마이그레이션·운영 배포는 이 spec 범위에 포함하지 않으며 사용자의 명시
요청 시에만 수행한다(AGENTS.md 15장).

## 10. 완료 기준 (v2 13.1)

- F1 레이스 상세에서 Quick Facts(트랙 길이/랩/코너/DRS/전년 우승자 등)를 볼 수 있다
- F1 레이스 상세에서 전년도 우승자와 역대 기록을 볼 수 있다
- F1 레이스 상세에서 주목할 팀/드라이버(직접 입력)를 볼 수 있다
- 레이스 상세에서 같은 시리즈 다음 경기로 이동할 수 있고, 다른 시리즈 추천을 볼 수 있다
- 관리자가 Facts/History/Watch Targets를 탭에서 직접 입력·수정·삭제할 수 있고 저장 즉시 반영된다
- WEC/WRC 레이스 상세는 신규 섹션 없이 기존 모습을 유지한다
- 이미지 없이 텍스트·컬러·타이포그래피 정체성을 유지한다

## 11. 영향받는 파일 (예상)

- `src/db/schema/index.ts` — 테이블 3개 + 타입
- `drizzle/migrations/0006_race_detail.sql` — 신규
- `src/types/public-data.ts`, `src/types/admin-data.ts`
- `src/lib/public-data.ts`, `src/lib/public-data-format.ts`
- `src/lib/admin-data.ts`, `src/lib/admin-race-editor.ts`, `src/lib/admin-race-mutations.ts`
- `src/app/races/[slug]/page.tsx`, `src/app/races/[slug]` 관련 스타일
- `src/app/admin/(panel)/races/[id]/page.tsx`, `src/app/admin/races/actions.ts`
- `src/components/admin/AdminRaceEditor/AdminRaceEditor.tsx` — 탭 구조 재구성
- 신규 컴포넌트: `RaceFacts`, `RaceHistory`, `WatchTargetList`, `NextRaceCard`,
  `admin/RaceFactsForm`, `admin/RaceHistoryTable`, `admin/WatchTargetEditor`
- 대응 테스트 파일
