# RaceNote F1 전자동 정보 허브 전환 설계

작성일: 2026-06-30
기준 문서: `racenote_f1_full_pivot_screen_design.md` (화면/IA 참고), 본 문서 (자동화·데이터·제거 범위 확정)

## 0. 결론

RaceNote를 **관리자 없는 F1 전자동 정보 허브**로 전환한다. 데이터는 자동 수집(D1 + Cron)과
코드 내 시드 두 갈래로만 채우며, 관리자 로그인·검수·공개 토글·AI 초안 검수 계층을 제거한다.
WEC/WRC와 OpenAI AI 기능, 캘린더/시리즈 페이지는 이번 범위에서 제거하고, 필요 시 git에서 복구한다.

한 줄 정의:

```
RaceNote는 관리자 없이 자동 수집 + 코드 시드로 운영되는,
F1 시즌을 한국어·KST로 보여주는 정보 허브다.
```

## 1. 제품 범위와 정보 구조(IA)

### 1.1 공개 라우팅 (MVP)

```
/                     시즌 허브 (일정 · 순위 · 최근 결과 · 시즌 뉴스)
/f1/drivers           드라이버 인덱스 (드라이버 순위표)
/f1/drivers/[slug]    드라이버 상세 (+ 관련 네이버 뉴스)
/f1/teams             팀 인덱스 (컨스트럭터 순위)
/f1/teams/[slug]      팀 상세 (+ 머신 정보 + 관련 네이버 뉴스)
/f1/races/[slug]      레이스 상세 (+ 코스 정보 + 결과 + 관련 네이버 뉴스)
/f1/guide             [보류] 기존 정적 페이지 유지, 정보 MVP 이후 활성화
```

- 머신 정보는 **팀 상세 안**의 섹션으로 둔다(별도 인덱스 없음).
- 코스 정보는 **레이스 상세 안**의 트랙 브리핑 섹션으로 둔다(별도 인덱스 없음).
- 가이드는 정보 MVP 완료 이후 활성화한다. 기존 정적 페이지와 데이터는 유지한다.

### 1.2 네비게이션

```
SEASON / DRIVERS / TEAMS
```

가이드는 MVP 이후 `GUIDE`로 추가한다. `CALENDAR`, `SERIES`는 제거한다.

## 2. 아키텍처 (관리자 없음)

데이터는 세 종류로 흐른다.

| 종류 | 출처 | 저장 | 갱신 |
|---|---|---|---|
| 일정 · 결과 · 순위 | Jolpica (Ergast 후속, 이미 연동됨) | D1 | Cloudflare Cron |
| 관련 뉴스 | 네이버 검색 API (뉴스) | D1 캐시 | Cron (하루 수회) |
| 드라이버 · 팀 · 머신 · 코스 한국어 편집 콘텐츠 | 코드 시드 (`f1-season.ts` 확장) | 빌드에 포함 | 직접 커밋 |

### 2.1 병합 규칙

- 순위·포인트·우승 수 등 변동 데이터는 D1(자동)에서 가져온다.
- 한국어 노트·드라이빙 스타일·머신 설명·코스 브리핑 등 편집 콘텐츠는 시드에서 가져온다.
- 둘을 `driverId` / `constructorId` / `circuitId`(Jolpica 식별자) 키로 병합한다.
- 검수 단계는 없다. 자동 수집 데이터는 화면에 바로 노출된다.

### 2.2 데이터 공백 처리

2026 시즌은 진행 중이라 Jolpica 결과·순위가 점차 쌓인다. 시즌 초나 수집 공백 구간에는
**코드 시드 값을 폴백**으로 사용한다. D1에 해당 라운드/순위 데이터가 있으면 D1을 우선한다.

## 3. 데이터 모델

### 3.1 D1 (자동 수집)

- `races` + `sessions` — 기존 재사용. Jolpica 일정, 시간은 UTC 저장 후 KST 표시.
- `race_results` — 신규.
  - 필드: `id`, `race_id`(FK), `season`, `session_type`(우선 `race`), `position`, `driver_id`,
    `driver_name`, `team_id`, `team_name`, `grid_position`, `time_or_gap`, `points`, `status`,
    `source_key`, `created_at`, `updated_at`
- `driver_standings` — 신규: `season`, `driver_id`, `position`, `points`, `wins`, `updated_at`
- `constructor_standings` — 신규: `season`, `constructor_id`, `position`, `points`, `wins`, `updated_at`
- `news_cache` — 신규: `query_key`(예: `home`, `race:{slug}`, `driver:{slug}`, `team:{slug}`),
  `payload`(직렬화된 기사 목록), `fetched_at`

마이그레이션은 새 번호로 추가한다(다음 번호는 코드 확인 후 확정). 기존 원격 D1의 미사용
WEC/WRC·`manual_overrides`·`ai_content_drafts` 테이블은 즉시 DROP하지 않고, 운영 영향이 없으면
후속 정리로 미룬다(원격 D1 파괴적 변경은 명시적 단계에서만).

### 3.2 코드 시드 (편집 콘텐츠)

기존 `src/data/f1-season.ts`를 확장·정리한다.

- `drivers`: 기존 필드(slug, name, code, team, nationality, number, note, style) +
  `strengths`, `weaknesses`, `jolpicaDriverId`(병합 키)
- `teams`: 기존 필드(slug, name, shortName, drivers, car, tone, note) +
  `color`, `jolpicaConstructorId`(병합 키)
- `machines`: 팀 시드에 포함. `carName`, `powerUnit`, 한국어 `strengths`, `weaknesses`
- `circuits`: 서킷별 `length`, `laps`, `corners`, `drsZones`, 한국어 `trackBriefing`, `trackSvg`.
  레이스와 `circuitId`로 매칭.

순위/포인트/우승 수는 시드에 하드코딩하지 않고 D1에서 채운다. 시드 값은 폴백 용도로만 보존한다.

## 4. 네이버 뉴스 연동

- 서버(Server Component / sync 작업)에서 네이버 검색 API(뉴스)를 호출한다.
- 인증값 `NAVER_SEARCH_CLIENT_ID`, `NAVER_SEARCH_CLIENT_SECRET`는 Cloudflare Worker 시크릿으로 관리한다(코드/문서/로그에 값 미노출).
- 화면별 검색어:
  - 홈: `F1` 또는 `포뮬러1`
  - 레이스 상세: `F1 {그랑프리 한글명}`
  - 드라이버 상세: `F1 {드라이버 한글명}`
  - 팀 상세: `F1 {팀명}`
- D1 `news_cache`에 `query_key`별로 저장하고 Cron으로 갱신한다. 요청마다 외부 API를 호출하지
  않아 레이트리밋을 보호한다.
- 표시 항목: 제목, 원문 링크(새 탭, `rel` 안전 처리), 언론사/출처, 날짜.
- 네이버 응답의 `<b>` 등 HTML 태그는 정제한다. 외부 입력은 신뢰하지 않고 경계에서 검증한다.
- 검수 없이 노출되므로 출처를 명시하고, 본문 복제 없이 링크로 연결한다.

## 5. 페이지와 컴포넌트

### 5.0 UI 방향: 대시보드형

- 메인(시즌 허브)은 길게 스크롤하는 서사형 섹션 나열이 아니라 **대시보드형**으로 구성한다.
  핵심 시즌 상태(다음 경기, 드라이버/컨스트럭터 순위, 최근 결과, 시즌 뉴스)를 패널 그리드로
  한눈에 보여주고, 깊은 설명은 상세 페이지로 넘긴다.
- 정보 밀도를 높인 패널·카드·테이블 조합을 우선한다. 이미지 없이 타이포그래피·라인·숫자·
  팀 컬러 포인트로 위계를 만든다(기존 RaceNote 정체성 유지).
- 상세 페이지도 정보 밀도 높은 패널 구성을 따른다.
- 프론트는 이 방향에 맞게 기존 홈 레이아웃을 포함해 필요한 만큼 재구성한다(사용자 승인됨).
- 모바일 우선으로 패널이 1열로 쌓이고, 데스크톱에서 그리드로 펼쳐지도록 한다.

### 5.1 페이지 재배선과 신규

- 기존 홈 / 드라이버 / 팀 페이지를 정적 목 → D1 + 시드 병합으로 재배선한다.
- 신규 상세 3종: `/f1/drivers/[slug]`, `/f1/teams/[slug]`(머신 포함), `/f1/races/[slug]`(코스 포함).
- 공통 `NewsList` 컴포넌트를 추가해 홈·상세에서 재사용한다.
- 머신/코스 표시 블록을 추가한다.
- 기존 공통 컴포넌트(`PageHeader`, `SectionLabel`, `RaceCard`, `SessionList`, `EmptyState` 등)를
  최대한 재사용한다. 한 화면 전용 변형은 modifier/prop으로 표현한다.
- 로딩·빈 데이터·오류·not-found 상태를 사용자 흐름에 맞게 처리한다.
- SCSS 전역 + BEM, 기존 토큰/믹스인 우선, 라이트/다크·모바일/데스크톱 모두 확인한다.

## 6. 레거시 제거 범위

삭제 대상(F1 전자동에 불필요):

- 관리자: `/admin` 라우트 전체, `src/lib/admin-*`, `admin-auth*`, `src/components/admin/*`,
  `src/data/mock-admin.ts`, `admin_sessions` 사용 흐름
- 캘린더/시리즈: `/calendar`, `/series` 라우트, 관련 전용 컴포넌트, `src/data/mock-races.ts`
- WEC/WRC: `src/lib/wec-calendar.ts`, `src/lib/wrc-calendar.ts`, sync 소스 등록, 관련 스키마/소스 데이터
- OpenAI AI: `src/lib/ai/*`, `ai-content.ts`, `openai-content-generator.ts`, AI 생성 Cron 분기,
  `ai_content_drafts` 검수 흐름
- 관리자 검수용 `manual_overrides` 병합 로직

유지 대상:

- F1 Jolpica 일정 수집(`f1-jolpica`), D1, Cloudflare Cron(F1 전용으로 축소)
- 공개 데이터 조회/포맷 계층(`public-data*`)은 F1 기준으로 정리해 재사용

제거는 git 이력으로 복구 가능하다. 공통 컴포넌트(예: `SeriesBadge`)가 F1 화면에서 계속
쓰이면 삭제하지 않고 사용처를 확인한 뒤 유지한다.

## 7. 구현 단계 (각 단계는 별도 plan으로 분해)

- **Phase 0 — 정리**: 레거시 제거, 네비게이션·Cron·sync를 F1 전용으로 단순화, 빌드/타입/린트 통과.
- **Phase 1 — F1 데이터 계층**: `race_results` / `driver_standings` / `constructor_standings` /
  `news_cache` 스키마와 마이그레이션, Jolpica 결과·순위 수집, 시드 병합·폴백, 홈·드라이버·팀 페이지 D1 연동.
- **Phase 2 — 상세 페이지**: 드라이버 상세, 팀 상세(머신), 레이스 상세(코스·결과).
- **Phase 3 — 네이버 뉴스**: API 클라이언트, D1 캐시, Cron 갱신, 홈·상세 뉴스 섹션.
- **Phase 4 — 이후**: 가이드 활성화, AI 용도 브레인스토밍, WEC/WRC 복귀(F1 템플릿 강요하지 않음).

각 Phase 완료 시 관련 테스트·lint·build를 실행하고, 의미 있는 결정과 완료 상태를
`PROJECT_HANDOFF.md`에 반영한다.

## 8. 검증 기준

- 순수 함수(병합·포맷·뉴스 파싱): `npm test`
- 페이지/컴포넌트/타입: `npm run lint`, `npm run build`
- Cloudflare 런타임·바인딩·Cron·시크릿: `npm run cf:build`, `npm run cf:types`,
  필요 시 `wrangler deploy --dry-run`
- D1 스키마/SQL: 메모리 SQLite 적용, seed 반복 실행, 외래키 검사
- UI: 라이트/다크, 모바일/데스크톱, 로딩·빈·오류·not-found 상태, 콘솔 오류 확인

## 9. 비범위 / 보류

- 회원 기능
- WEC/WRC 노출
- OpenAI 기반 AI 생성 콘텐츠
- F1 가이드 페이지 신규 작업(기존 정적 페이지는 유지)
- 원격 D1의 미사용 레거시 테이블 즉시 DROP
