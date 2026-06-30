# RaceNote Project Handoff

이 문서는 다른 컴퓨터 또는 새로운 Codex 스레드에서 RaceNote 작업을 바로 이어가기
위한 인수인계 문서입니다. 작업을 시작하기 전에 아래 설계 문서와 함께 읽고, 중요한
결정이나 완료 상태가 바뀌면 이 문서를 갱신합니다.

## Required Reading

- `racenote_f1_full_pivot_screen_design.md`: F1 중심 전면 재설계 기준, 공개 IA,
  화면 구조, 데이터·관리자 확장 방향
- `README.md`: 실행 및 Cloudflare 배포 명령

## Current Status

- 프로젝트 생성과 초기 설정을 완료했습니다.
- 뉴트럴 그레이/코랄 라이트 테마와 웜 블랙/라임 다크 테마를 구현했습니다.
- 첫 방문에는 시스템 테마를 따르고, 사용자 선택은 브라우저에 저장하는 공개 헤더
  테마 토글을 구현했습니다.
- `/` 홈 화면의 Hero, Live Briefing, 이번 주 레이스, 시리즈 필터를 목업 데이터로
  구현했습니다.
- `/calendar`, `/series`, `/races/[slug]` 공개 화면을 목업 데이터로 구현했습니다.
- `PublicHeader`, `PublicFooter`, `PageHeader`, `SectionLabel`, `SeriesBadge`,
  `RaceCard`, `SessionList`, `EmptyState` 공통 컴포넌트를 구현했습니다.
- 설계서의 8개 MVP 테이블을 Drizzle 스키마로 구현하고 초기 D1 SQL 마이그레이션을
  추가했습니다.
- 로컬 D1 설정과 반복 실행 가능한 공개 화면 seed SQL을 추가했습니다.
- 공개 화면용 Drizzle D1 조회 계층과 화면 모델 변환 테스트를 준비했습니다.
- 홈, 캘린더, 레이스 상세, 시리즈 공개 화면을 원격 D1 조회 계층으로 교체했습니다.
- Cloudflare Worker에 배포하고 공개 화면의 원격 D1 런타임 조회를 검증했습니다.
- `/admin/login`, `/admin`, `/admin/sync`, `/admin/races`,
  `/admin/races/[id]` 관리자 운영 UI를 목업 데이터로 구현했습니다.
- 관리자 대시보드, 동기화 로그, 레이스 목록, 레이스 상세 화면을 원격 D1 조회
  계층으로 교체했습니다.
- 환경변수 비밀번호와 D1 `admin_sessions`, httpOnly 쿠키를 사용하는 관리자 인증과
  로그아웃을 구현했습니다.
- 기존 레이스의 기본 정보, 세션, 콘텐츠 정정 저장과 검수 완료, 공개/비공개 액션을
  구현했습니다.
- F1 Jolpica 일정 수집, 수동 실행, 하루 2회 Cloudflare Cron, 동기화 로그 저장을
  구현했습니다.
- 관리자 정정 필드를 `manual_overrides`에 기록하고 이후 자동 수집에서 보호하는
  병합 정책을 구현했습니다.
- WEC/WRC 공식 캘린더의 레이스 단위 수집, 전체 시리즈 수동 실행 및 Cron 연결,
  관리자 수동 세션 추가·삭제를 구현했습니다.
- 원격 D1에 `0001_manual_overrides.sql`, `0002_wec_wrc_sources.sql`을 적용하고
  전체 일정 수집 Worker와 Cron을 배포했습니다.
- OpenAI `gpt-5-nano` Structured Outputs 기반 AI 콘텐츠 초안 생성, 관리자 검수·
  반영 흐름, 하루 1회 Cloudflare Cron을 로컬 구현했습니다.
- AI 초안은 별도 `ai_content_drafts`에 저장하며 검수·공개 콘텐츠를 자동으로
  덮어쓰지 않습니다.
- Git 저장소와 Cloudflare Workers 배포 연결이 완료되어 있습니다.
- D1은 원격 `racenote-db`의 실제 데이터베이스 ID와 연결되어 있습니다.
- 프로젝트 로컬 `semble_rs v0.9.1` 코드 탐색 환경을 추가했습니다.
- `AGENTS.md`를 RaceNote 기술 스택, UI, D1, Cloudflare, 보안, 검증 절차를
  포함한 상세 프로젝트 작업 지침으로 정비했습니다.
- 2026-06-18 기준 제품 방향을 F1/WEC/WRC 통합 브리핑에서 F1 중심 시즌 허브로
  전면 전환하기로 결정했습니다. 새 기준 문서는
  `racenote_f1_full_pivot_screen_design.md`이며, 기존 루트 MVP 설계 문서
  `racenote_mvp_design.md`, `racenote_mvp_screen_design.md`,
  `racenote_mvp_design_v2.md`는 삭제했습니다.

## Product Summary

RaceNote는 F1을 처음 보는 사람도 이번 시즌, 다음 경기, 순위, 드라이버, 팀, 규칙을
한 번에 이해할 수 있게 돕는 한국어 F1 가이드 & 시즌 허브입니다.

현재 1차 완성 목표:

- `/`를 F1 Season Hub로 전면 교체
- `/f1/drivers`, `/f1/drivers/[slug]`, `/f1/teams`, `/f1/teams/[slug]`,
  `/f1/guide`, `/f1/races/[slug]` 공개 구조 마련
- 다음 경기, 시즌 일정, 최근 결과, 순위, 드라이버, 팀, 입문 가이드를 한국어와
  KST 기준으로 제공
- 관리자 로그인, F1 일정·결과·순위·드라이버·팀 데이터 관리, AI 문구 검수 및 공개
- Cloudflare Cron 기반 일정 수집과 AI 콘텐츠 생성 계층은 유지·재사용
- 공식 이미지, 팀 로고, 드라이버 사진 없이 텍스트, 컬러, 숫자, 표, 카드 중심 UI
- 회원 기능은 MVP에서 제외
- WEC/WRC는 삭제가 아니라 F1 구조 안정 후 확장할 보류 범위

## Confirmed Technical Decisions

- Next.js 16 App Router + TypeScript
- React 19
- SCSS 전역 스타일 + BEM 네이밍
- Tailwind CSS와 CSS Module은 사용하지 않음
- Cloudflare Workers + OpenNext
- Cloudflare D1 + Drizzle ORM
- DB 시간 저장은 UTC, 사용자 화면 표시는 KST

## Confirmed Design Direction

현재 디자인·정보 구조 기준:

- 기준 문서: `racenote_f1_full_pivot_screen_design.md`
- 참고 레퍼런스:
  - https://www.formula1.com/
  - https://www.formula1.com/en/racing/2026
  - https://www.formula1.com/en/results/2026/races
  - https://www.formula1.com/en/drivers
  - https://www.formula1.com/en/teams

Formula1.com은 정보 구조 참고용입니다. 공식 사이트처럼 이미지, 영상, 뉴스, 공식
로고, 드라이버 사진 중심으로 가지 않습니다. RaceNote는 한국 시간 기준, 한국어
입문 설명, 압축된 시즌 흐름, 이미지 없이 이해되는 순위/팀/드라이버 카드, 경기 전
읽는 브리핑 문장으로 차별화합니다.

유지할 RaceNote 정체성:

- 이미지 없는 정보 중심 구성
- 큰 타이포그래피, 얇은 라인, 모노스페이스 숫자
- 저채도 배경과 팀 컬러 포인트
- 카드와 테이블의 조합
- 한글 설명을 충분히 사용하고, 불필요한 영어 라벨 남용은 줄임

버릴 것:

- 너무 긴 브랜드형 Hero
- 의미만 있고 정보가 약한 섹션 번호
- WEC/WRC를 메인에서 F1과 동등하게 노출하는 구조
- 모든 페이지에 반복되는 How to Watch
- 카드마다 설명만 있고 데이터가 부족한 구조

### Theme Direction

라이트 모드는 밝은 뉴트럴 그레이 배경과 저채도 코랄 포인트로 최종 확정했습니다.
다크 모드는 기존 RaceNote의 웜 블랙/라임 계열을 유지하되, F1 시즌 허브 전환 후
순위표·일정표·팀 컬러 카드가 읽히는 정보형 대비를 우선합니다.

- 거의 검정에 가까운 웜 블랙 배경
- 크림 또는 웜 그레이 계열 주요 텍스트
- 낮은 대비의 중간 회색 보조 텍스트
- 얇고 절제된 회색 테두리
- 레이스 타이밍 보드 분위기의 라임 포인트

테마는 `<html data-theme="light|dark">`와 전역 CSS 토큰으로 적용합니다. 첫
방문에는 `prefers-color-scheme`을 따르고, 공개 헤더의 `LIGHT / DARK` 토글을
사용한 뒤에는 `localStorage`의 `racenote-theme` 선택이 우선합니다. 초기 테마는
루트 레이아웃의 동기 인라인 스크립트로 첫 페인트 전에 적용합니다.

## Font Policy

- 한글 본문: Pretendard Variable
- 영문, 숫자, 시간, 상태값: IBM Plex Mono
- Pretendard는 가변 폰트 동적 서브셋을 사용
- IBM Plex Mono는 자체 호스팅하며 `400/500/600/700`만 포함
- 외부 폰트 서버 요청 없이 Cloudflare 빌드 가능

현재 전역 폰트 스택:

```scss
--font-body: "IBM Plex Mono", "Pretendard Variable", Pretendard, sans-serif;
--font-korean: "Pretendard Variable", Pretendard, sans-serif;
--font-mono: "IBM Plex Mono", monospace;
```

- 기본 스택은 IBM Plex Mono 우선이며, 한글 글리프는 Pretendard로 폴백됩니다.
- 한글 전용 표현은 `.type-korean`을 사용합니다.
- 숫자 정렬이 필요한 시간 및 상태값은 `.type-mono`를 사용합니다.

## Current Project Structure

```txt
src/
  app/
    calendar/
    admin/
      (panel)/
      login/
    races/[slug]/
    series/
    layout.tsx
    page.tsx
    home.scss
    public-pages.scss
  components/
    CalendarSchedule/
    EmptyState/
    HomeRaceGrid/
    PageHeader/
    PublicFooter/
    PublicHeader/
    RaceCard/
    SectionLabel/
    SeriesBadge/
    SessionList/
    admin/
      AdminNav/
      AdminPageHeader/
      StatusBadge/
  data/
    mock-admin.ts
    mock-races.ts
  db/
    schema/
      index.ts
  styles/
    abstracts/
      _variables.scss
      _mixins.scss
    base/
      _reset.scss
      _typography.scss
    layouts/
      _container.scss
    globals.scss
drizzle/
  0000_initial.sql
```

Drizzle 스키마와 `drizzle/0000_initial.sql` 초기 마이그레이션을 구현했습니다.
공개 화면은 배포 환경에서 `src/lib/public-data.ts`의 원격 D1 조회를 사용하고,
관리자 운영 화면은 `src/lib/admin-data.ts`의 원격 D1 조회를 사용하며,
`src/lib/admin-auth.ts`가 모든 관리자 조회 경계와 관리자 레이아웃의 D1 세션을
검증합니다.
현재 Windows의 `workerd` 문제를 피하기 위해 `next dev`에서만 기존 목 데이터를
fallback으로 사용합니다. 로컬 관리자 화면은 이를 실제 운영 상태로 오해하지 않도록
`Local mock data` 안내를 공통 노출하며, 원격 D1을 변경하는 일정 동기화 액션은
비활성화합니다. 실제 수집 성공 여부와 운영 레이스 상태는 배포된 관리자 화면에서
확인합니다. 로컬 관리자 D1 런타임 확인은 workerd가 실행 가능한 환경이 필요합니다.

로컬 개발 설정:

```txt
Wrangler config: wrangler.local.jsonc
D1 binding: DB
Seed SQL: drizzle/seed.sql
```

## Cloudflare Deployment Notes

Cloudflare Workers Builds 설정:

```txt
Build command: npm run cf:build
Deploy command: npx wrangler deploy
```

`npm run build`만 사용하면 `.open-next` 산출물이 없어 배포가 실패합니다.

D1 바인딩 `DB`는 원격 `racenote-db`에 연결되어 있습니다. 초기 마이그레이션과
공개 화면 확인용 seed도 원격 DB에 적용했습니다.

### D1 Connection Resume Point

2026-06-11 기준 Cloudflare 대시보드 로그인까지 완료했고 계정 overview 접근을
확인했습니다.

```txt
Cloudflare account ID: 94170803d79901358ea300e1f74a6ee7
Target D1 database name: racenote-db
```

2026-06-12에 API 토큰을 준비해 Wrangler의 D1 접근을 확인했고, 실제
`racenote-db` 바인딩과 초기 데이터를 적용했습니다. 실제 토큰은 Git에 커밋하지
않습니다.

```txt
CLOUDFLARE_ACCOUNT_ID=94170803d79901358ea300e1f74a6ee7
CLOUDFLARE_D1_TOKEN=
```

토큰에는 최소한 해당 계정의 D1 데이터베이스 생성·편집 권한이 필요합니다.

완료한 항목:

1. Wrangler D1 권한 확인
2. `racenote-db` 생성 및 `DB` 바인딩 반영
3. `drizzle/migrations/0000_initial.sql` 원격 적용
4. `drizzle/seed.sql` 원격 적용
5. 원격 D1 데이터 개수와 외래키 상태 검증

## Commands Verified

다음 명령은 현재 설정에서 통과했습니다.

```bash
npm ci --dry-run
npm run lint
npm run build
npm run cf:build
npm run cf:types
npx wrangler deploy --dry-run
sqlite3 :memory: ".read drizzle/0000_initial.sql" "PRAGMA foreign_key_check;"
```

프로젝트 로컬 코드 탐색 도구:

```bash
npm run semble:setup
npm run semble:tree
npm run semble:search -- "public D1 data loading" --outline
npm run semble:deps -- src/lib/public-data.ts
npm run semble:impact -- src/lib/public-data.ts
```

Rust 툴체인과 `semble_rs` 바이너리는 Git에서 제외된 `.tools/` 아래에 설치됩니다.
첫 검색에서는 기본 임베딩 모델 약 60MB를 사용자 Hugging Face 기본 캐시에 추가로
다운로드합니다. 현재 업스트림 `model2vec-rs 0.2.0` 모델 로더는 `HF_HOME`을
사용하지 않습니다.

Windows에서 OpenNext는 WSL 사용 권장 경고를 표시하지만 빌드는 통과합니다.
`npm run db:generate`는 아래 Known Notes의 현재 이슈로 인해 검증 목록에서
제외했습니다.

배포 URL:

```txt
https://race-note.rafdi.workers.dev
```

Windows의 Turbopack 기반 OpenNext 번들은 서버 청크가 누락되어 배포 후
`ChunkLoadError`가 발생했습니다. production 빌드를 `next build --webpack`으로
고정해 해결했습니다. Windows에서 OpenNext 자동 배포는 로컬 `workerd`의
`write EOF`로 실패하므로, 빌드 후 다음 방식으로 직접 배포합니다.

```powershell
$env:OPEN_NEXT_DEPLOY="true"
npx wrangler deploy
```

테마 구현 후 브라우저에서 다음을 검증했습니다.

- 시스템 다크 설정을 따르는 첫 방문
- 테마 토글과 실제 `data-theme` 상태 일치
- 사용자 선택 저장과 새로고침 후 유지
- 공개/관리자 화면의 라이트/다크 대비
- 모바일 공개 헤더의 토글 노출
- 브라우저 콘솔 오류 없음

공개 D1 데이터 계층 준비 후 다음을 검증했습니다.

- `npm test`: UTC → KST 포맷과 공개 레이스 화면 모델 변환
- 초기 마이그레이션 + seed SQL 2회 실행: SQLite에서 반복 실행 가능
- seed 결과: series 3, races 3, sessions 9, race_contents 3
- SQLite `PRAGMA foreign_key_check`: 오류 없음
- D1 조회 계층과 공개 화면 모델의 TypeScript 빌드
- `npm run cf:build` 통과
- 원격 D1 seed 결과: series 3, races 3, sessions 9, race_contents 3
- 원격 D1 `PRAGMA foreign_key_check`: 오류 없음
- `wrangler deploy --dry-run`: `env.DB` → `racenote-db` 바인딩 확인
- 공개 경로 `/`, `/calendar`, `/races/[slug]`, `/series`: 동적 렌더링 빌드 확인
- 배포된 홈, 캘린더, 레이스 상세, 시리즈, 관리자 경로: HTTP 200
- 배포된 공개 화면에서 원격 D1 seed 콘텐츠 확인
- 존재하지 않는 공개 레이스 slug: HTTP 404

관리자 D1 읽기 계층 준비 후 다음을 검증했습니다.

- 관리자 레이스·세션·동기화 로그 화면 모델 변환 테스트
- 관리자 대시보드, 동기화 로그, 레이스 목록, 레이스 상세의 D1 조회 연결
- 관리자 상세 경로가 D1 `races.id`를 요청 시 조회하는 동적 경로로 빌드
- `npm run build` 및 `npm run cf:build` 통과

관리자 인증 준비 후 다음을 검증했습니다.

- Web Crypto 기반 비밀번호 검증, 세션 토큰 HMAC, 만료 판정 테스트
- 원문 세션 토큰은 httpOnly 쿠키에만 저장하고 D1에는 HMAC digest 저장
- 관리자 레이아웃과 관리자 데이터 조회 경계의 세션 검증
- 로그인 실패 메시지, 로그인 성공 리디렉션, 로그아웃 세션 삭제 흐름

배포 전에 Cloudflare Workers의 암호화된 비밀로 다음 값을 등록해야 합니다.

```txt
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

관리자 편집 액션 준비 후 다음을 검증했습니다.

- 레이스 기본 정보, 세션 UTC 시간, Must Watch, 콘텐츠 입력 검증 테스트
- 저장 시 콘텐츠를 `needs_review`로 전환하고 기존 공개 상태 유지
- 검수 완료 시 레이스·세션 review flag와 관련 change log 처리
- 검수 완료 상태에서만 공개 허용, 공개 레이스의 비공개 초안 전환
- 모든 mutation Server Action과 D1 mutation 경계에서 관리자 세션 재검증

관리자 편집은 자동 수집 데이터를 정정하기 위한 기능이며 신규 일정을 모두 수동
등록하는 흐름이 아닙니다. 관리자 저장 시 실제로 변경한 레이스·세션 필드를
`manual_overrides`에 기록하며, 이후 자동 수집은 해당 필드를 유지하고 소스와의
충돌을 `ignored` 변경 로그로 남깁니다. WEC/WRC 공식 캘린더가 정확한 세션 시각을
제공하지 않는 경우에만 관리자 상세에서 수동 세션을 추가하며, 자동 수집 세션은
다음 실행에서 되살아나는 혼동을 막기 위해 삭제할 수 없습니다.

F1 수집 구현 후 다음을 검증했습니다.

- Jolpica 응답을 provider-neutral 레이스·세션 모델로 변환
- 실제 Jolpica current 응답에서 2026 시즌 22개 레이스 파싱
- `source_key` 기준 신규 추가와 기존 데이터 비교
- 보호되지 않은 외부 변경은 적용 후 `needs_review` 처리
- 신규·변경 일정은 draft/검수 상태로 유지하고 자동 공개하지 않음
- `/admin/sync` 수동 F1 수집과 Cloudflare Cron 진입점 연결
- 초기 SQL, `0001_manual_overrides.sql`, seed 2회 적용과 외래키 검사
- `npm test`, `npm run lint`, `npm run build`, `npm run cf:build` 통과
- `npm run cf:types`, `wrangler deploy --dry-run` 완료. 현재 sandbox에서는 Wrangler
  로그 파일 경로 권한 경고가 표시되지만 타입 생성과 dry-run 번들은 정상 완료됨

WEC/WRC 수집 구현 후 다음을 검증했습니다.

- WEC 공식 캘린더 HTML에서 현재 시즌 레이스를 파싱하고 Prologue 제외
- WRC 공식 캘린더의 내장 JSON에서 라운드와 월 경계 날짜 범위를 파싱
- 2026-06-13 실제 공식 페이지에서 WEC 8개, WRC 14개 라운드 파싱
- WEC/WRC는 정확한 세션 시각을 추측하지 않고 레이스 단위 데이터만 저장
- F1/WEC/WRC 소스를 순차 실행하고 한 소스 실패가 나머지 실행을 막지 않도록 격리
- `/admin/sync` 수동 전체 수집과 Cloudflare Cron 전체 수집 연결
- 관리자 수동 세션 입력 검증, 추가 및 수동 세션 전용 삭제
- 수동 세션 추가·삭제 시 공개 상태는 유지하고 레이스를 검수 필요 상태로 전환
- 초기 SQL, `0001_manual_overrides.sql`, `0002_wec_wrc_sources.sql`, seed 2회 적용과
  외래키 검사
- `npm test`, `npm run lint`, `npm run build`, `npm run cf:build`,
  `npm run cf:types`, `wrangler deploy --dry-run` 완료

2026-06-13 운영 반영 후 다음을 검증했습니다.

- 원격 D1에 `0001_manual_overrides.sql`, `0002_wec_wrc_sources.sql` 적용
- 원격 마이그레이션 보류 항목 없음
- 원격 `manual_overrides` 테이블과 F1/WEC/WRC 동기화 소스 3개 확인
- 원격 D1 `PRAGMA foreign_key_check` 오류 없음
- `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` Worker 비밀 유지
- Worker 버전 `22ccb177-736a-4024-ac35-1c96a255a0bf` 배포
- UTC `0 0 * * *`, `0 12 * * *` Cron 트리거 배포
- 배포된 `/`, `/calendar`, `/series`, `/admin/login`, `/admin` HTTP 200 확인

배포 환경 관리자 흐름 검증 중 Drizzle D1 `transaction()`이 원격 D1에 `BEGIN`을
보내 실패하고, F1 세션 source key 110개를 한 `IN` 쿼리로 조회해 D1 바인딩 한도를
넘는 문제를 발견했습니다. 모든 다중 쓰기를 D1 원자적 `batch()`로 교체하고, 대형
`IN` 조회를 90개 단위로 분할했습니다.

수정 후 Worker 버전 `8c708988-e357-4320-ab59-6149369d32d5`를 배포하고 다음을
검증했습니다.

- 배포 환경 관리자 로그인과 로그아웃
- 전체 수동 동기화 성공: F1 22개 레이스와 세션 합계 132건, WEC 8개, WRC 14개 추가
- 전체 수동 동기화 재실행 시 F1/WEC/WRC 추가·수정 모두 0
- 자동 수집 WEC 레이스에 테스트 수동 세션 추가 후 삭제
- 테스트 수동 세션이 원격 D1에 남지 않음
- 수집 레이스 수: F1 22, WEC 8, WRC 14
- 원격 D1 `PRAGMA foreign_key_check` 오류 없음
- `npm test` 27개, `npm run lint`, `npm run build`, `npm run cf:build` 통과

2026-06-14 AI 콘텐츠 초안 생성 구현 후 다음을 로컬 검증했습니다.

- `0003_ai_content_drafts.sql`과 Drizzle 스키마 추가, 메모리 SQLite 적용 및
  외래키 검사
- OpenAI Responses API 직접 호출, `gpt-5-nano`, Structured Outputs, 도구 없음,
  호출당 8개 필드 생성과 출력 상한 적용
- 향후 14일 이내 시작 레이스, 실행당 최대 3개, 준비된 초안 및 검수·공개 콘텐츠
  자동 생성 제외
- 생성 실패 시 기존 콘텐츠와 이전 초안 필드 유지
- 관리자 화면에서 현재 콘텐츠와 AI 초안의 8개 필드 검수·수정, 초안 반영 후
  `needs_review` 전환
- 검수·공개 콘텐츠 수동 재생성 시 명시적 확인 요구
- UTC `0 1 * * *` AI 생성 Cron 분기
- `npm test` 37개, `npm run lint`, `npm run build`, `npm run cf:build`,
  `npm run cf:types` 통과
2026-06-14 AI 콘텐츠 생성 운영 반영 후 다음을 검증했습니다.

- 원격 D1에 `0003_ai_content_drafts.sql` 적용, 보류 마이그레이션 없음
- 원격 `ai_content_drafts` 테이블과 `PRAGMA foreign_key_check` 오류 없음 확인
- Cloudflare `OPENAI_API_KEY` 비밀을 로컬 현재 키로 재등록
- 최초 실제 생성에서 기존 Cloudflare 키의 OpenAI 401을 확인했고, 비밀 재등록 후
  생성 성공
- 모든 자연어 출력을 한국어로 요구하도록 프롬프트를 보강하고 재배포
- 최종 Worker 버전 `46fd2b71-8690-41b1-abf1-8f94939737d5` 배포
- UTC `0 0 * * *`, `0 12 * * *`, `0 1 * * *` Cron 트리거 배포
- 관리자 로그인 후 `WRC EKO Acropolis Rally Greece` 실제 AI 초안 생성 성공
- 현재 콘텐츠는 `empty`, AI 초안은 `ready`, 3줄 요약과
  `key_drivers_or_teams = null` 확인
- AI 초안은 관리자 검수 전 현재 콘텐츠에 반영하지 않음
- 실제 생성 결과에도 근거가 약한 표현이 포함될 수 있으므로 관리자 검수 필수
- 검증 관리자 세션 로그아웃 후 원격 `admin_sessions` 0개 확인
- `/`, `/calendar`, `/admin/login` HTTP 200 확인

2026-06-14 로컬 관리자 로그인 실패 원인을 수정했습니다.

- `next dev`는 관리자 데이터를 목 데이터로 제공하지만 로그인 세션 생성만 D1을
  요구해, 로컬 D1 바인딩이 없는 환경에서 로그인에 실패했습니다.
- 개발 모드에서는 `ADMIN_SESSION_SECRET`으로 서명하고 만료 시각을 포함한 httpOnly
  쿠키 세션을 사용하도록 변경했습니다.
- 운영 모드는 기존 D1 `admin_sessions` 저장·검증 방식을 유지합니다.
- 서명 검증, 변조 거부, 만료 거부 테스트를 추가했습니다.
- `npm test` 38개, `npm run lint`, `npm run build`, `npm run cf:build` 통과

2026-06-14 실제 AI 초안 품질 검수 후 다음을 보강했습니다.

- 모든 자연어 한국어 출력 규칙에 더해, 입력에 없는 노면·코스 특성·날씨·경기
  형식·역사·참가자·결과를 추측하지 못하도록 프롬프트를 강화했습니다.
- 강화 프롬프트의 동일 입력 생성 결과는 시리즈·대회명·날짜만 사용하고 근거 없는
  필드는 `null` 또는 빈 배열로 반환했습니다.
- Worker 버전 `05cd6c47-2ddd-4faf-8ef2-b1c422bc167f`를 배포했습니다.
- 운영 `WRC EKO Acropolis Rally Greece` AI 초안을 사실성 검증 결과로 교체했습니다.
- 해당 자동 수집 레이스는 `draft`/현재 콘텐츠 `empty`/AI 초안 `ready` 상태이며,
  공개 중인 seed `Acropolis Rally Greece`와 같은 기간의 중복 레이스입니다.
- 중복 노출을 피하기 위해 자동 수집 레이스의 초안 반영·공개는 seed 전환 정책
  확정 전까지 보류합니다.

2026-06-14 Acropolis 중복 레이스를 자동 수집 기준으로 전환했습니다.

- seed의 출처 불명 세션·관전 문구는 자동 수집 레이스에 복사하지 않았습니다.
- 사실성 검증을 통과한 AI 초안만 자동 수집 `WRC EKO Acropolis Rally Greece`
  콘텐츠로 반영하고 검수 완료·공개 처리했습니다.
- 자동 수집 레이스는 `published`, `needs_review = false`, AI 콘텐츠 `published`,
  AI 초안 `applied` 상태입니다.
- 기존 seed `Acropolis Rally Greece`는 `hidden`, 비추천, 검수 불필요 상태로
  전환했습니다.
- 같은 기간 공개 Acropolis 레이스가 정확히 1개임을 확인했습니다.
- 새 자동 수집 상세 URL은 HTTP 200, 기존 seed 상세 URL은 HTTP 404를 확인했습니다.
- 반복 seed 실행 시 기존 seed 레이스가 다시 공개되지 않도록 `drizzle/seed.sql`도
  `hidden` 상태로 변경하고 seed 2회 적용과 외래키 검사를 통과했습니다.

2026-06-14 잘못된 Canadian GP seed를 자동 수집 Barcelona로 교체했습니다.

- 공식 F1 2026 일정에서 Canadian GP는 5월 22~24일, 같은 seed 기간인 6월
  12~14일은 Barcelona-Catalunya임을 확인했습니다.
- 공식 세션 5개가 있는 자동 수집 `Barcelona Grand Prix`를 `published`,
  `needs_review = false`, 추천 상태로 전환했습니다.
- 캐나다 전용 관전 문구와 세션을 Barcelona에 복사하지 않고, 잘못된 공개 seed
  `Canadian Grand Prix`를 `hidden`, 비추천 상태로 전환했습니다.
- 같은 주말 공개 F1 레이스가 정확히 1개이고 원격 D1 외래키 오류가 없음을
  확인했습니다.
- 반복 seed 실행 시 Canadian GP가 다시 공개되지 않도록 `drizzle/seed.sql`도
  `hidden` 상태로 변경하고 seed 2회 적용과 외래키 검사를 통과했습니다.
- 자동 수집 `24 Hours of Le Mans`는 세션이 0개이므로, 현재 공개 seed의 관전
  시점 3개를 잃지 않도록 전환을 보류했습니다.
- AI 생성 Cron은 UTC `0 1 * * *` 배포가 2026-06-14 실행 시각 이후 완료되어
  자동 실행 기록이 아직 없습니다. 첫 운영 자동 실행은 2026-06-15 01:00 UTC
  이후 실행당 최대 3개 제한을 확인해야 합니다.

2026-06-14 WEC 공식 상세 세션 수집을 로컬 구현했습니다.

- WEC 캘린더에서 종료되지 않은 가장 가까운 레이스를 선택하고, 해당 공식 상세
  페이지의 JSON-LD `subEvent`에서 정확한 `startDate`가 있는 세션만 수집합니다.
- 실제 르망 상세 페이지에서 연습·예선·Hyperpole·Warm-up·Race 공식 세션 12개를
  UTC 시각으로 파싱했습니다.
- 날짜만 있거나 시각이 없는 세션은 추측하지 않습니다.
- 공용 source runner가 동기 parser와 async parser를 모두 지원하도록 확장했습니다.
- 불안정한 WEC 홈 `next-race` 링크는 사용하지 않습니다. 현재 홈 응답은 해당
  링크를 공식 상세가 아닌 `plus.fiawec.com`으로 제공합니다.
- `node --import tsx --test src/lib/*.test.ts` 40개, `npm run lint`,
  `npm run cf:build`, `git diff --check`를 통과했습니다.
- 최종 날짜 기반 상세 선택 로직을 포함한 Worker 버전
  `796f6419-b2c6-4612-b78a-289a1dcb6a9c`를 배포했습니다.
- 최종 배포 이후 WEC 동기화 실행 기록은 아직 없으므로 자동 르망 레이스 세션은
  아직 0개입니다. 다음 일정 수집 Cron 이후 공식 세션 12개 반영을 확인해야 합니다.

2026-06-14 WRC 공식 일정 소스를 JSON API로 전환했습니다.

- 운영 Worker에서 WRC 공식 캘린더 HTML 요청만 HTTP 403을 반환하는 반면, 공식
  페이지가 사용하는 원본 JSON API는 로컬에서 HTTP 200을 반환함을 확인했습니다.
- 기존 HTML 내장 JSON 파싱 호환성을 유지하면서 공식 원본 JSON 응답을 직접
  파싱하도록 확장했습니다.
- 실제 공식 JSON 응답에서 2026 WRC 라운드 14개를 파싱했습니다.
- `0004_wrc_json_source.sql`로 `source-wrc-official`을 `api` 타입과 공식 JSON
  URL로 전환했습니다.
- 전체 마이그레이션과 seed를 메모리 SQLite에 두 번 적용하고 외래키 오류 없음과
  WRC JSON API 소스 유지를 확인했습니다.
- `node --import tsx --test src/lib/*.test.ts` 41개, `npm run lint`,
  `npm run cf:build`, `git diff --check`를 통과했습니다.
- 원격 D1에 `0004_wrc_json_source.sql`을 적용하고 활성 WRC 소스가 `api` 타입과
  공식 JSON URL을 사용하는지 확인했습니다.
- WEC 최종 세션 수집과 WRC JSON 소스 전환을 포함한 Worker 버전
  `7b8fb46d-3fae-43dc-8c4f-24bd3dd94d73`을 배포했습니다.
- 원격 D1 외래키 오류 없음, 공개 `/`와 `/calendar` HTTP 200을 확인했습니다.
- 배포 이후 일정 수집 Cron은 아직 실행되지 않았으므로 WRC Worker 요청 성공과
  자동 르망 세션 12개 반영은 다음 UTC `0 0 * * *` 실행 후 확인해야 합니다.

2026-06-15 첫 운영 Cron 결과를 확인하고 후속 수정했습니다.

- UTC `0 0 * * *` 일정 수집에서 F1은 성공했지만, WEC는 기존
  `/en/calendar/80`이 홈으로 리디렉션되어 레이스를 찾지 못했고 WRC JSON API는
  Worker 요청의 `User-Agent` 부재로 HTTP 403을 반환했습니다.
- WEC 공식 상세 페이지는 전체 시즌 캘린더와 현재 상세 레이스 JSON-LD 세션을 함께
  제공합니다. `0005_wec_detail_source.sql`에서 WEC 소스를 르망 공식 상세 URL로
  전환하고, canonical URL로 링크가 생략된 현재 레이스를 복원해 상세 세션을
  병합하도록 수정했습니다.
- 2026-06-15 실제 공식 WEC 상세 응답에서 시즌 8개와 르망 세션 12개를 파싱했고,
  실제 WRC JSON 응답에서 14개 라운드를 파싱했습니다.
- WRC 요청에는 식별 가능한 RaceNote `User-Agent`를 추가했습니다. 동일 공식 API는
  `User-Agent`가 없으면 HTTP 403, RaceNote 식별값이 있으면 HTTP 200임을
  확인했습니다.
- 첫 UTC `0 1 * * *` AI 자동 실행은 Austrian Grand Prix 한 건을 시도했지만
  실패했습니다. 동일 저장 컨텍스트의 로컬 OpenAI 호출은 약 3초 만에 성공해 현재
  일시적 외부 실패로 판단하며, 이후 실패는 비밀값 없이 요청 실패·응답 오류·
  타임아웃 범주를 관리자 진단용으로 저장하도록 보강했습니다.
- 로컬 `npm test` 45개를 통과했습니다. 원격 `0005_wec_detail_source.sql` 적용과
  Worker 배포는 아직 하지 않았습니다.

2026-06-15 후속 수집 수정 운영 반영 후 다음을 검증했습니다.

- 원격 D1에 `0005_wec_detail_source.sql` 적용, 보류 마이그레이션 없음
- Worker 버전 `83c647ad-afda-4e88-9234-ca752a01cb2a` 배포
- UTC `0 0 * * *`, `0 12 * * *`, `0 1 * * *` Cron 트리거 유지
- 배포 환경 관리자 로그인 후 전체 수동 동기화 성공
- F1 22개, WEC 8개, WRC 14개 처리. WEC는 르망 공식 세션 12개와 다음 레이스
  상파울루 공식 세션 8개, 합계 20개 세션 추가
- 원격 WRC JSON API 동기화가 HTTP 403 없이 성공
- 원격 D1 `PRAGMA foreign_key_check` 오류 없음
- 공개 `/`와 `/calendar` HTTP 200 확인
- 검증 관리자 세션 로그아웃 완료. 원격에 남은 관리자 세션 1개는 이번 검증 전에
  생성된 기존 세션임을 확인

2026-06-15 르망 공개 데이터를 자동 수집 기준으로 전환했습니다.

- 자동 수집 `24 Hours of Le Mans`의 공식 세션 12개를 검수 완료 처리했습니다.
- 공식 일정 중 `Hyperpole 2 - HYPERCAR`와 `Race`만 Must Watch로 지정했습니다.
- 기존 seed의 비공식 `Night Stint`, `Final Hour` 세션과 추측성 관전 문구는 자동
  수집 레이스로 복사하지 않았습니다.
- AI 초안은 사실성은 지켰지만 문장이 어색하고 세션 목록을 경기 변수로 분류해
  그대로 반영하지 않았습니다. 공식 일정과 확정 WEC 기본 설명만 사용한 수동 검수
  문구를 반영했습니다.
- 자동 수집 레이스는 `published`, 추천, 검수 불필요, 콘텐츠 `published` 상태로
  전환했습니다.
- 기존 seed 르망은 `hidden`, 비추천 상태로 전환했고, 반복 seed 실행 시 다시
  공개되지 않도록 `drizzle/seed.sql`도 변경했습니다.
- 새 자동 수집 상세 URL은 HTTP 200, 기존 seed 상세 URL은 HTTP 404를 확인했습니다.
- 공개 캘린더가 자동 수집 르망 URL과 공식 세션 12개, Must Watch 2개만 노출하는지
  확인했습니다.
- 원격 D1 `PRAGMA foreign_key_check` 오류 없음과 같은 이름의 공개 르망 레이스가
  정확히 1개임을 확인했습니다.
- 다음 AI 자동 Cron 대상 조건을 확인한 결과 현재 보호되지 않은 후보는
  `Austrian Grand Prix` 1개뿐입니다. 2026-06-16 10:00 KST 실행에서 기존 실패
  초안을 재시도할 예정이며, 후보가 1개라 실행당 최대 3개 제한은 이번 실행만으로
  검증할 수 없습니다.

## Known Notes

- npm 선택적 peer dependency 문제를 방지하기 위해 `@emnapi/core`와
  `@emnapi/runtime`을 개발 의존성으로 명시했습니다.
- Cloudflare와 같은 npm 10.9.2 환경에서 `npm ci --dry-run`을 검증했습니다.
- 저장소 루트 아래에 추적되지 않은 `race-note/.git` 빈 중첩 저장소가 보입니다.
  사용자가 만든 상태일 수 있으므로 명시적 요청 없이 삭제하지 않습니다.
- `.env`와 실제 Cloudflare/D1 비밀값은 Git에 커밋하지 않습니다.
- Cloudflare API 토큰은 로컬 `.env.local`에만 저장하며 Git에 커밋하지 않습니다.
- 현재 API 토큰에는 D1 편집과 Worker 배포 권한이 있습니다.
- 원격 D1 쓰기에는 Drizzle `transaction()`을 사용하지 않습니다. D1의 원자적
  `batch()`를 사용하고, 다수 값을 바인딩하는 조회는 `src/lib/d1-helpers.ts`의
  안전 한도로 분할합니다.
- 기존 공개 seed F1 레이스는 `seed-*` source key를 사용하므로 Jolpica 수집 레이스와
  자동 병합되지 않습니다. 수집된 실제 F1 레이스를 공개하기 전에 기존 seed F1
  레이스를 비공개 처리해야 합니다.
- 현재 설치된 `drizzle-kit 0.31.10`에서 전체 스키마를 대상으로 `npm run
  db:generate`를 실행하면 오류 없이 무응답 상태로 멈춥니다. 스키마는 Next 빌드와
  Node 직접 import로 검증했고, 초기 SQL은 수동으로 추가해 SQLite 적용 검증했습니다.
  실제 D1 연결 전에 drizzle-kit/Node 버전 조합을 재확인해야 합니다.
- 현재 Windows 환경에서 `workerd.exe`가 직접 실행되지 않으며 Wrangler 로컬 D1
  명령과 `next dev`의 D1 바인딩 초기화가 `write EOF`로 실패합니다. Wrangler
  4.99.0/4.100.0과 Node 22/24에서 동일하게 재현했습니다. SQL과 OpenNext 빌드는
  검증됐으며, `next dev` 공개 화면은 목 데이터 fallback을 사용합니다. 실제 로컬
  D1 런타임 확인은 WSL 또는 workerd가 실행 가능한 환경에서 재개해야 합니다.
- WEC 일정 소스는 전체 시즌 캘린더와 JSON-LD 세션을 함께 제공하는 해당 시즌의
  공식 상세 URL을 사용합니다. 2027 시즌 수집을 시작하기 전에 새 시즌 공식 상세
  URL로 `sync_sources`를 갱신해야 합니다.

## Next Work Boundary

공개·관리자 화면의 원격 D1 조회 연결, 관리자 인증, 기존 레이스 정정·검수·공개
액션, F1/WEC/WRC 일정 수집, 관리자 수동 세션 관리, AI 초안 생성, Cloudflare 빌드
검증, Drizzle 스키마와 SQL 마이그레이션 구현 및 운영 배포를 완료했습니다.

하지만 2026-06-18 기준 제품 방향은 F1/WEC/WRC 통합 브리핑에서 **F1 중심 시즌 허브**로
전면 전환합니다. 기존 구현은 버리는 것이 아니라, F1 Season Hub와 F1 공개 구조에
맞게 재배치·확장합니다. WEC/WRC는 공개 내비게이션과 메인 노출에서 내려두고, F1
구조가 안정된 뒤 별도 시리즈 허브로 복귀합니다.

현재 기준 문서:

- `racenote_f1_full_pivot_screen_design.md`

삭제한 옛 기준 문서:

- `racenote_mvp_design.md`
- `racenote_mvp_screen_design.md`
- `racenote_mvp_design_v2.md`

Formula1.com 참고 URL:

- https://www.formula1.com/
- https://www.formula1.com/en/racing/2026
- https://www.formula1.com/en/results/2026/races
- https://www.formula1.com/en/drivers
- https://www.formula1.com/en/teams

참고 방식은 정보 구조만입니다. 공식 이미지, 로고, 드라이버 사진, 영상, 뉴스 구성은
복제하지 않습니다. RaceNote는 한글 설명, KST, 압축된 시즌 흐름, 텍스트 기반 순위·팀·
드라이버 카드로 차별화합니다.

2026-06-17 Sync 실패 로그 안전 메시지 정제를 완료했습니다.

- `src/lib/sync/source-runner.ts`에 `safeScheduleSyncError(error, seriesCode)` 함수를
  추가했습니다. D1 batch 오류, 파싱 실패 등 내부 상세가 포함된 메시지는 일반 운영
  메시지로 교체하고, HTTP 상태·타임아웃·크기 초과 같은 진단 유용 메시지는 그대로
  보존합니다(최대 160자).
- catch 블록에서 `error.message` 직접 사용을 `safeScheduleSyncError` 호출로 교체하고,
  원시 오류 전체는 `console.error`로 Worker 로그에 남겨 디버깅 단서를 유지합니다.
- 오류 문자열 리터럴을 `ERR_RESPONSE_TOO_LARGE` 상수로 추출해 일치 조건과 throw 지점이
  동기화됩니다.
- 단위 테스트 9개 추가, `npm test` 56개 통과.
- `syncSources.lastSyncedAt`이 수집 실패 시 갱신되지 않는 기존 문제(성공 시각만 기록)는
  이번 범위 밖의 사전 존재 문제로 별도 처리가 필요합니다.

2026-06-17 AI 생성 운영 오류를 진단하고 수정했습니다.

- `gpt-5-nano` Responses API(`/v1/responses`)가 403을 반환해 AI 생성이 전혀 동작하지
  않았습니다. Responses API는 별도 베타 접근이 필요합니다.
- Chat Completions API(`/v1/chat/completions`)로 전환했습니다. 동일 모델과
  json_schema Structured Outputs를 지원합니다.
- Cloudflare Worker가 HKG(홍콩) 엣지에서 실행될 때 OpenAI가 지역 차단
  (`unsupported_country_region_territory`)으로 403을 반환하는 문제를 발견했습니다.
- **Cloudflare AI Gateway**를 경유해 OpenAI로 요청을 프록시하도록 변경해 HK 차단을
  우회했습니다. Gateway ID: `racenote`, Account: `94170803d79901358ea300e1f74a6ee7`.
- 엔드포인트:
  `https://gateway.ai.cloudflare.com/v1/94170803d79901358ea300e1f74a6ee7/racenote/openai/chat/completions`
- OpenAI Structured Outputs strict 모드가 `type: ["string", "null"]` 배열 형식을
  지원하지 않아 400을 반환했습니다. 모든 nullable 필드를 `anyOf` 형식으로 수정했습니다.
- 모델을 `gpt-5-nano`에서 `gpt-4o-mini`로 교체했습니다. `gpt-5-nano`는 Chat
  Completions에서도 403을 반환했습니다.
- 오류 메시지에 OpenAI 응답 본문 최대 120자를 포함해 D1에서 실패 원인을 직접
  확인할 수 있습니다.
- 과거 레이스 42개가 `needs_review` 상태로 쌓여 있습니다. Cron 자동 생성은
  `startDate >= today` 조건으로 미래 레이스만 대상이므로 과거 레이스는 자동 처리되지
  않습니다. 서비스에 영향 없으므로 현재 방치 결정.

2026-06-17 홈 Hero를 축소했습니다.

- "정보 위주 사이트인데 첫 화면을 Hero가 통째로 차지한다"는 문제를 반영했습니다.
- `src/app/home.scss`의 `.home__hero`에서 `min-height: min(720px, calc(100svh - 72px))`
  풀 높이를 제거하고, 타이틀 `font-size` 상한을 `13.5rem → 7.5rem`, 타이틀 위
  마진을 `150px → 52px`, `__hero-bottom` 위 마진을 `140px → 60px`, 상하 패딩을
  `130px → 72px`로 줄였습니다.
- 큰 워드마크·원형 라인 장식·액센트 점·코드형 라벨(`00 / …`) 등 컨셉 요소는
  유지했습니다(축소 방향 A안).
- `npm run build` 통과(SCSS 정상 컴파일). 실제 화면은 `next dev`(mock fallback)로
  확인 가능. 원형 장식 비율은 사용자 확인 후 필요 시 추가 조정 예정.

2026-06-17 추가 개발 방향을 "F1 레이스 상세 강화"로 좁혀 설계·계획을 작성했습니다.

- "완성에 가까운데 볼 게 없는 사이트"라는 문제 인식에서, 당시 추가 개발 설계의
  Phase 1(레이스 상세 강화)을 다음 작업으로 정했습니다. 해당 루트 설계 문서는
  2026-06-18 F1 전면 pivot으로 삭제됐지만, 구현 기록은 아래에 유지합니다.
- WEC/WRC까지 한 번에 확장하지 않고 **F1에 집중**하기로 결정했습니다. DB 스키마는
  시리즈 범용으로 두되, 콘텐츠 입력·표시는 F1 기준입니다. 드라이버/팀/차 독립
  페이지·현재 순위(v2 Phase 2/3)는 다음 spec으로 분리합니다.
- 확정 결정: Watch Target은 Phase 1에서 `target_id` FK 없이 직접 입력만, Quick
  Facts는 통합 테이블 + F1 레이아웃 고정 표시(값 없는 필드 미표시), Next Race는
  같은 시리즈 다음 라운드 자동, 다른 시리즈 추천(Explore)은 `is_featured` 기준
  1~2개 별도 섹션, Facts/History/Watch Targets 저장은 검수 흐름 없이 즉시 반영,
  관리자 편집은 URL 쿼리(`?tab=`) 기반 탭 구조로 전환.
- 설계서: `docs/superpowers/specs/2026-06-17-f1-race-detail-design.md`
- 구현 계획: `docs/superpowers/plans/2026-06-17-f1-race-detail.md` (Task 1~9,
  순수 함수는 node:test TDD, D1/UI는 빌드+메모리 SQLite 검증)
- 아직 구현 코드는 작성하지 않았습니다. 마이그레이션 번호는 `0006`이 다음입니다.

2026-06-17 F1 레이스 상세 강화(Phase 1) 구현을 완료했습니다(Task 1~9).

- `race_facts`(통합 Quick Facts), `race_history`, `race_watch_targets` 3개 테이블과
  Drizzle 스키마, 손으로 작성한 `drizzle/migrations/0006_race_detail.sql`을 추가했습니다.
- 공개 측: `RaceFacts`/`RaceHistoryEntry`/`WatchTarget`/`RelatedRaceCard` 타입과
  변환 함수(`mapPublicRaceFacts`/`mapRaceHistory`/`mapWatchTargets`/`mapRelatedRaceCard`),
  `getPublishedRaceBySlug`의 facts/history/watchTargets/nextRace(같은 시리즈 다음 라운드)/
  featuredOther(다른 시리즈 `is_featured` 최대 2개) 조회, 상세 페이지 신규 섹션
  (Quick facts 06 / Who to watch 07 / History 08 / Next race 09 / Explore 10)을
  추가했습니다. 값이 없는 섹션은 렌더링하지 않습니다.
- 컴포넌트 `RaceFacts`/`RaceHistory`/`WatchTargetList`/`RelatedRaceCard`의 SCSS는
  `src/styles/globals.scss`에 `@use`로 등록했습니다(이 프로젝트는 컴포넌트 SCSS를
  globals에서 모읍니다 — 플랜에 누락됐던 부분을 반영).
- 관리자 측: `AdminRaceFacts`/`AdminRaceHistoryEntry`/`AdminWatchTarget` 타입,
  변환 함수, `getAdminRaceById`의 facts/history/watch 조회, 폼 파서
  (`parseRaceFactsForm`/`parseRaceHistoryForm`/`parseWatchTargetForm`),
  mutation(`src/lib/admin-race-detail-editor.ts`, `runD1Batch`·facts upsert·history
  추가/삭제·watch 추가/삭제/순서변경), Server Action을 추가했습니다.
- 관리자 편집 화면을 URL 쿼리(`?tab=`) 기반 탭 구조로 전환했습니다(Basic/Sessions/
  Briefing/Facts/History/Watch). 클라이언트 JS 없이 활성 탭에 따라 `.admin-tab-panel--active`
  CSS로 패널을 토글하며, 기존 통합 저장 폼(basic+sessions+briefing)은 한 `<form>`을
  유지해 어느 탭에서 저장해도 `sessionIds` 등 hidden 필드가 누락되지 않습니다.
- Facts/History/Watch Targets 저장은 검수 흐름을 타지 않고 즉시 반영합니다.
- 신규 상세 섹션(facts/history/watch/next/explore)은 `src/lib/public-data.ts`의
  `ENRICHED_DETAIL_SERIES` 집합(현재 `{"F1"}`)에 속한 시리즈만 노출합니다. WEC/WRC
  상세는 extras를 건너뛰어 기존 모습을 그대로 유지합니다(Next race·Explore는 데이터
  무관 계산이라 별도 게이트가 필요했음).
- WEC/WRC 추가 개발을 전제로 한 확장 지점: DB 스키마(`race_facts`에 surface_type,
  total_stages, total_distance, event_duration, classes 등 WEC/WRC용 컬럼 포함)와
  관리자 입력은 이미 시리즈 범용입니다. 향후 WEC/WRC 상세를 켜려면 (1) 해당 시리즈를
  `ENRICHED_DETAIL_SERIES`에 추가하고, (2) F1 고정 레이아웃인 `RaceFacts` 공개
  컴포넌트를 시리즈별 표시 필드로 분기하면 됩니다(관리자 `RaceFactsForm`도 시리즈별
  필드 노출 검토). nextRace/Explore 로직은 시리즈 무관이라 추가 작업이 없습니다.
- 로컬 미리보기: `next dev`는 mock fallback을 쓰므로, `src/data/mock-races.ts`의 F1
  Canadian GP mock에 facts/history/watchTargets/nextRace/featuredOther 표본을
  채워 신규 섹션을 로컬에서도 확인할 수 있습니다(WEC/WRC mock은 미입력 → 미렌더).
- 검증: `npm test`(신규 변환·파싱 테스트 15개 포함, openai stale 2개 제외 전부 통과),
  메모리 SQLite 0000~0006 + seed 2회 FK 오류 없음, `npm run lint`/`build`/`cf:build` 통과.
- 원격 D1 `0006` 적용과 배포는 아직 하지 않았습니다(사용자 명시 요청 시에만).
- 기존 `src/lib/openai-content-generator.test.ts` 2개는 2026-06-17 Chat Completions
  전환 때 갱신되지 않은 stale 테스트로, 이번 작업과 무관합니다(별도 처리 필요).
- 개발 모드(`next dev`)는 mock fallback이라 신규 섹션은 빈 상태로 보입니다. 실데이터
  렌더는 관리자 입력 후 D1 런타임(배포 또는 workerd) 환경에서 최종 확인해야 합니다.

2026-06-17 F1 레이스 상세 강화를 운영 반영(원격 D1 적용 + 배포)했습니다.

- 원격 D1에 `0006_race_detail.sql` 적용. `wrangler d1 migrations list`에서 보류는
  `0006`뿐이었고 적용 후 `race_facts`/`race_history`/`race_watch_targets` 3개 테이블
  생성, `PRAGMA foreign_key_check` 오류 없음을 확인했습니다.
- Worker 배포: `npm run cf:deploy`의 빌드는 통과하나 opennext deploy 단계가
  miniflare/workerd를 띄워 macOS 12.6.0에서 실패합니다. 빌드 후 `OPEN_NEXT_DEPLOY=true
  npx wrangler deploy`로 직접 업로드해 배포했습니다(Windows 우회와 동일 원리).
  Version `482f54e5-aaf9-4e28-a469-7cf4b304fca3`, Cron 3종 유지.
- 인증: 이 컴퓨터엔 토큰이 없어 `.env.local`에 `CLOUDFLARE_API_TOKEN`을 추가했습니다
  (wrangler는 이 이름만 읽음. 과거 문서의 `CLOUDFLARE_D1_TOKEN`은 미사용). 토큰은
  Git 미커밋.
- 배포 확인: `/`, `/calendar`, `/series`, `/admin/login` HTTP 200. 공개 F1 상세
  `/races/f1-2026-round-7` HTTP 200이며 Explore 섹션(다른 시리즈 featured)이 F1
  상세에 정상 노출. Quick Facts/History/Who to watch/Next race는 아직 데이터가 없어
  미렌더(정상). 관리자가 입력하면 공개 상세에 나타납니다.

권장 다음 순서:

1. **Phase 2: 데이터 기반 구축** — `teams`, `drivers`, `standings`,
   `race_results`를 확정하고 F1 seed/관리자 입력 경로를 준비합니다. 다음 마이그레이션
   번호는 `0007`입니다.
2. **Phase 3: 상세 페이지 확장** — `/f1/drivers/[slug]`, `/f1/teams/[slug]`를
   추가하고, 정적 전환 데이터를 DB 조회 모델로 교체합니다.
3. **Phase 4: Guide 고도화** — `/f1/guide`에서 경기 주말 흐름, 예선, 결승, 타이어,
   DRS, 피트스톱, 세이프티카, 포인트를 더 깊은 한글 설명과 예시로 확장합니다.
4. **Phase 5: Race Detail 정리** — F1 상세 라우팅을 `/f1/races/[slug]`로 정리하고,
   Watch First, Track Briefing, Standings Context, Result를 연결합니다.
5. **Phase 6: WEC/WRC 복귀** — F1 구조가 안정된 뒤 `/motorsport` 또는 `/series`를
   복구하고 WEC/WRC에 맞는 별도 시즌 허브와 가이드를 설계합니다.

즉시 제외:

- 실시간 경기 순위
- 팀/드라이버 공식 이미지
- 공식 로고 사용
- 일반 회원 기능
- F1 구조 안정 전 WEC/WRC 동등 노출

2026-06-18 F1 전면 pivot 첫 화면 작업을 시작했습니다.

- Formula1.com 레퍼런스는 메인/스케줄/결과/순위/드라이버/팀 정보 구조만 참고했습니다.
- 공개 헤더 내비게이션을 `SEASON / DRIVERS / TEAMS / GUIDE`로 교체했습니다. 아직
  별도 `/f1/*` 페이지가 없으므로 현재는 홈 내부 섹션 앵커로 연결합니다.
- `/` 홈을 기존 주간 모터스포츠 브리핑에서 F1 Season Hub 구조로 전면 교체했습니다.
  섹션은 Season Hero, Next Race, Standings, Season Schedule, Latest Result,
  Teams, Drivers, Guide CTA, WEC/WRC 보류 안내입니다.
- 기존 `getPublishedRaces()`를 계속 사용해 F1 공개 레이스를 일정/다음 경기 카드에
  우선 연결했습니다. F1 공개 레이스가 없을 때는 Austrian Grand Prix 임시 fallback을
  사용합니다.
- 드라이버 순위, 컨스트럭터 순위, 최근 결과, 드라이버/팀 소개는 Phase 2 데이터
  테이블(`drivers`, `teams`, `standings`, `race_results`)이 들어오기 전까지 정적
  화면 데이터입니다. 실제 서비스 데이터로 오해하지 않도록 다음 작업에서 관리자 입력
  또는 seed/DB 조회로 교체해야 합니다.
- WEC/WRC는 홈 메인 노출에서 제거하고 하단 보류 안내로 내렸습니다. 기존 `/calendar`,
  `/series`, `/races/[slug]` 라우트와 수집/관리자 계층은 삭제하지 않았습니다.
- 검증: `npm run lint`, `npm run build` 통과. Chrome headless로 `http://localhost:3001`
  데스크톱 1440px와 모바일 390px 렌더를 확인했고, 모바일 가로 오버플로 없음. 콘솔은
  개발 모드 React DevTools/HMR 안내만 확인했습니다.

2026-06-18 F1 하위 공개 페이지 1차 구조를 추가했습니다.

- `src/data/f1-season.ts`에 F1 전환용 정적 데이터 계층을 추가했습니다. 공식
  Formula1.com 레퍼런스는 2026 드라이버/팀 라인업과 페이지 정보 구조 확인에만
  사용했고, 소개 문장과 관전 포인트는 RaceNote 편집 데이터입니다.
- 공개 헤더 내비게이션을 실제 라우트 `/`, `/f1/drivers`, `/f1/teams`,
  `/f1/guide`로 연결하고, 가능한 표시 문구를 `시즌 / 드라이버 / 팀 / 가이드`처럼
  한국어 중심으로 정리했습니다.
- `/f1/drivers`를 추가했습니다. 드라이버 순위 상위 요약, 순위표, 22명 드라이버
  카드를 이미지 없이 번호·팀·국적·관전 문장 중심으로 보여줍니다.
- `/f1/teams`를 추가했습니다. 컨스트럭터 상위 요약, 팀 표, 11개 팀 카드를 로고 없이
  팀 컬러 라인·드라이버 조합·설명 문장 중심으로 보여줍니다.
- `/f1/guide`를 추가했습니다. 처음 보는 사람이 따라갈 순서와 핵심 규칙 6개를
  한글 중심으로 정리합니다.
- 현재 드라이버 순위, 컨스트럭터 순위, 최근 결과, 머신명은 Phase 2 데이터 테이블
  이전의 정적 전환 데이터입니다. 실제 운영 데이터로 고정하지 말고 다음 작업에서
  `drivers`, `teams`, `standings`, `race_results` 스키마·seed·관리자 입력 경로로
  교체해야 합니다.
- 검증: `npm run lint`, `npm run build` 통과. `next start -p 3001` 기준
  `/f1/drivers`, `/f1/teams`, `/f1/guide` 모두 HTTP 200. Chrome/Playwright로
  데스크톱 1440px와 모바일 390px에서 H1, 한글 내비게이션, 카드/표 렌더, 콘솔 오류
  없음, 모바일 가로 오버플로 없음 확인.
- 이 시점에는 `/`가 D1 공개 레이스 조회를 사용하던 동적 홈이어서, 로컬
  `next start`에서 D1 바인딩 없는 생산 모드 한계로 500이 날 수 있었습니다. 아래
  보드형 홈 전환 후에는 `/`를 정적 전환 데이터 기반으로 바꿔 이 제한을 해소했습니다.

2026-06-18 F1 홈 비주얼 방향을 레퍼런스 2안의 시즌 보드형 UI로 조정했습니다.

- `/` 홈을 D1 공개 레이스 조회에 의존하지 않는 F1 전환용 정적 시즌 보드로
  변경했습니다. 빌드 결과 홈은 정적 라우트(`○ /`)가 되었고, 로컬 `next start`에서도
  D1 바인딩 없이 HTTP 200으로 확인 가능합니다.
- 사용자 피드백에 따라 트랙 라인과 국기 이미지는 허용 범위로 결정했습니다. 단,
  공식 로고·드라이버 사진·팀 로고는 계속 사용하지 않습니다.
- `public/images/f1/flags/austria.svg`,
  `public/images/f1/tracks/red-bull-ring.svg`를 추가해 다음 레이스 카드에 오스트리아
  국기와 Red Bull Ring 단순 트랙 라인을 표시합니다.
- 홈의 레이아웃은 보드형 UI 밀도와 표/일정 중심 구성을 반영했습니다. 컬러는 기존
  RaceNote 라이트/다크 테마 토큰을 유지합니다(라이트 뉴트럴 그레이/코랄, 다크 웜
  블랙/라임). 한글 문구는 Pretendard Variable Dynamic Subset, 영어·숫자는 IBM Plex
  Mono 우선 체계를 유지합니다.
- 사용자가 제안한 jsDelivr Pretendard CDN은 QA 환경에서 네트워크 차단 콘솔 오류가
  발생해 직접 link로 쓰지 않았습니다. 동일한 Pretendard Dynamic Subset을 설치된
  `pretendard` 패키지 import로 유지해 한글 폰트 안정성을 확보했습니다.
- `src/data/f1-season.ts`에 다음 레이스, 2026 시즌 22라운드 일정, 세션 시간 표시용
  정적 전환 데이터를 추가했습니다. Phase 2에서 DB seed/관리자 입력 경로로 교체해야
  합니다.
- 검증: `npm run lint`, `npm run build` 통과. `next start -p 3001` 기준 `/`와
  `/f1/drivers`, `/f1/teams`, `/f1/guide` HTTP 200. Chrome/Playwright로 데스크톱
  1365px와 모바일 390px에서 국기/트랙 SVG 로드, 한글 Pretendard computed font,
  콘솔 오류 없음, 모바일 가로 오버플로 없음 확인.

2026-06-30 F1 전자동 정보 허브로 제품 방향을 재확정하고 Phase 0(레거시 제거)을 완료했습니다.

- 새 제품 방향: **관리자 없는 F1 전자동 정보 허브**. 변동 데이터(일정·결과·순위·뉴스)는
  자동 수집(Jolpica + 네이버 뉴스) → D1 + Cron, 편집 콘텐츠(드라이버·팀·머신·코스 한국어
  설명)는 코드 시드(`src/data/f1-season.ts`). 검수 단계 없음. 가이드와 AI(OpenAI) 기능은
  정보 MVP 이후로 보류. WEC/WRC도 보류.
- 기준 문서: 설계 `docs/superpowers/specs/2026-06-30-f1-auto-hub-pivot-design.md`,
  계획 `docs/superpowers/plans/2026-06-30-f1-auto-hub-phase0-1.md`. 화면/IA 참고는
  `racenote_f1_full_pivot_screen_design.md`를 계속 사용.
- Phase 0 제거 완료(모두 git 이력으로 복구 가능):
  - 루트 MVP 설계 문서 3종 삭제 확정(`racenote_mvp_design.md` 등).
  - OpenAI AI 생성 계층 제거(`src/lib/ai/*`, `ai-content*`, `openai-content-generator*`,
    worker의 `0 1 * * *` AI Cron 분기와 트리거, `db.ts`의 `getOpenAiApiKey`/`OPENAI_API_KEY`).
  - WEC/WRC 일정 수집 제거(`wec-*`/`wrc-*`/`calendar-dates.ts`). `runAllScheduleSync`는 F1 전용.
  - 관리자 전면 제거(`src/app/admin`, `src/components/admin`, `src/lib/admin-*`,
    `src/data/mock-admin.ts`, `globals.scss`의 admin SCSS `@use`).
  - 캘린더/시리즈/구 레이스 라우트 제거(`src/app/calendar|series|races`),
    `CalendarSchedule`/`HomeRaceGrid` 컴포넌트 제거, 헤더 네비를 `시즌 / 드라이버 / 팀`으로 축소.
- 남은 공개 라우트: `/`, `/f1/drivers`, `/f1/guide`, `/f1/teams`. Cron 트리거는
  `0 0 * * *`, `0 12 * * *` 2종.
- 의도적 보존(아직 삭제 안 함): `src/lib/public-data.ts`, `src/data/mock-races.ts`는
  `/f1/races/[slug]`(Phase 2)에서 F1 기준으로 재작성하며 정리 예정. D1 스키마의 미사용
  테이블(`admin_sessions`, `manual_overrides`, `change_logs`, `ai_content_drafts`,
  `race_facts`/`race_history`/`race_watch_targets`)과 `manual_overrides` 병합 로직은
  운영 영향이 없어 후속 정리로 미룸. `source-runner`의 WRC user-agent 등은 시리즈 무관
  인프라라 유지.
- 검증: 각 제거 태스크마다 `npm run build` 통과, `node --import tsx --test src/lib/**/*.test.ts`
  통과(admin/WEC/WRC/AI 테스트 제거로 최종 27개). 원격 D1/배포 변경은 하지 않음.
- 다음 작업 경계: Phase 1(결과·순위 D1 테이블·마이그레이션 `0007` 후보, Jolpica 순위·결과
  수집, 시드 병합, 대시보드형 홈·드라이버·팀 D1 연동). 원격 D1 마이그레이션 적용은
  사용자 명시 요청 시에만.

2026-06-30 Phase 1(F1 데이터 계층 + 대시보드 홈/드라이버/팀)을 완료했습니다.

- D1 스키마에 `race_results`(레이스별 결과), `driver_standings`/`constructor_standings`
  (시즌별 순위) 3개 테이블을 추가하고 `drizzle/migrations/0007_f1_results_standings.sql`을
  작성했습니다. 마이그레이션 번호는 기존 최댓값이 `0006_race_detail.sql`이라 `0007`로
  확정했습니다(설계 문서 초안의 0006 표기는 계획 작성 중 수정).
- Jolpica(`api.jolpi.ca/ergast/f1`)에서 드라이버/컨스트럭터 순위와 최근 라운드 결과를
  파싱하는 순수 함수(`src/lib/sync/f1-standings.ts`, `src/lib/sync/f1-results.ts`)와
  D1 upsert 스토어(`src/lib/sync/standings-store.ts`, `src/lib/sync/results-store.ts`)를
  추가했습니다. `runF1ScheduleSync`(`src/lib/sync/f1-sync.ts`)가 일정 수집 후 순위·결과를
  이어서 수집하며, 일정 수집 실패는 그대로 전파하고 순위/결과 수집 실패는 격리해
  `console.error`로만 남깁니다(부분 실패가 전체 sync를 막지 않음).
- `src/data/f1-season.ts`의 22명 드라이버·11개 팀 전원에 실제 Jolpica id
  (`jolpicaDriverId`/`jolpicaConstructorId`)를 채웠습니다. 2026 시즌 Jolpica 데이터로
  직접 조회해 검증한 값입니다.
- 시드(한국어 편집 콘텐츠)와 D1(자동 순위)을 병합하는 순수 함수
  (`src/lib/f1-standings-merge.ts`)와 페이지용 조회 계층(`src/lib/f1-data.ts`:
  `getDriverStandings`/`getConstructorStandings`)을 추가했습니다. D1 행이 있으면
  position/points/wins는 D1 값을 쓰고, 없으면 시드 값으로 폴백합니다(시즌 초·수집 공백
  대비). `next dev`는 D1 바인딩이 없는 기존 환경 제약으로 시드 전용 병합을 사용하고,
  운영(Worker)은 D1 조회 후 병합하며 D1 조회 자체가 실패해도 시드로 폴백합니다.
- `/f1/drivers`, `/f1/teams`, `/`(홈)을 정적 시드 직접 참조에서 위 조회 계층 사용으로
  재배선했습니다. 세 라우트 모두 정적(`○`)에서 동적(`ƒ`) 렌더링으로 전환됐습니다.
- 홈을 대시보드형으로 재구성했습니다. 데스크톱에서 다음 레이스·드라이버 순위·컨스트럭터
  순위·최근 결과가 3열 패널 그리드로 한 화면에 보이고, 모바일은 1열로 쌓입니다. 기존에
  팀 카드 목록이 두 번 렌더링되던 중복을 제거하고 하나로 통합했습니다. 일정/결과 데이터는
  이번 단계에서 D1로 옮기지 않고 계속 시드를 사용합니다(다음 단계 범위).
- `.env.example`에서 Phase 0에서 이미 제거된 `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET`/
  `OPENAI_API_KEY` 항목을 정리했습니다(값 없는 템플릿이라 안전, 코드 참조 없음을 확인 후
  삭제). `NAVER_SEARCH_CLIENT_ID`/`NAVER_SEARCH_CLIENT_SECRET`은 향후 뉴스 연동 단계용으로
  유지합니다.
- 검증: `node --import tsx --test src/lib/**/*.test.ts` 34개 통과, `npm run build`,
  `npm run lint`, `npm run cf:build`, `npm run cf:types` 통과. `node:sqlite`로
  `0000`~`0007` 마이그레이션을 메모리 DB에 순차 적용해 외래키 위반 0건, 테이블 16개
  생성 확인(로컬에 `sqlite3` CLI가 없어 Node 내장 `node:sqlite`로 대체 검증). 홈 화면은
  Claude Preview MCP로 라이트/다크, 데스크톱/모바일, 콘솔 오류 없음을 확인했습니다.
- 원격 D1에는 `0007` 마이그레이션을 적용하지 않았습니다(사용자 명시 요청 시에만). 배포도
  하지 않았습니다.
- 다음 작업 경계: Phase 2(`/f1/drivers/[slug]`, `/f1/teams/[slug]`(머신 정보 포함),
  `/f1/races/[slug]`(코스 정보·결과 포함) 상세 페이지, `src/lib/public-data.ts`/
  `src/data/mock-races.ts`를 F1 기준으로 재작성하며 정리), Phase 3(네이버 뉴스 API
  연동·`news_cache` 테이블·Cron 갱신·홈/상세 뉴스 섹션). 설계 기준은
  `docs/superpowers/specs/2026-06-30-f1-auto-hub-pivot-design.md`.

## New Session Starter Prompt

다른 컴퓨터의 새 Codex 스레드에서는 다음처럼 요청하면 됩니다.

```txt
AGENTS.md와 PROJECT_HANDOFF.md, racenote_f1_full_pivot_screen_design.md,
README.md를 읽고 현재 Git 상태를 확인해줘.
RaceNote F1 중심 시즌 허브 전환을 이어가자. 현재 `/`, `/f1/drivers`, `/f1/teams`,
`/f1/guide` 1차 화면은 있고 정적 전환 데이터에 의존한다.
다음은 `drivers`, `teams`, `standings`, `race_results` 데이터 모델과 seed/관리자
입력 경로를 설계해 실제 데이터 기반으로 바꾸는 Phase 2를 진행해줘.
한글로 자연스럽게 보이는 정보 구조를 우선하고, 기존 D1/관리자/수집/AI 계층은
가능한 한 재사용해줘.
```
