# RaceNote Project Handoff

이 문서는 다른 컴퓨터 또는 새로운 Codex 스레드에서 RaceNote 작업을 바로 이어가기
위한 인수인계 문서입니다. 작업을 시작하기 전에 아래 설계 문서와 함께 읽고, 중요한
결정이나 완료 상태가 바뀌면 이 문서를 갱신합니다.

## Required Reading

- `racenote_mvp_design.md`: 서비스 범위, 기술 스택, DB/API/운영 설계
- `racenote_mvp_screen_design.md`: 화면 구조, 컴포넌트, 상태별 UI 설계
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

## Product Summary

RaceNote는 F1, WEC, WRC 일정을 한국 시간으로 모아 보여주고, 입문자에게 꼭 봐야 할
세션과 관전 포인트를 제공하는 모터스포츠 캘린더 서비스입니다.

MVP 핵심:

- 공개 홈, 통합 캘린더, 레이스 상세, 시리즈 소개
- 관리자 로그인, 일정 검수, AI 문구 검수 및 공개
- Cloudflare Cron 기반 일정 수집 및 AI 콘텐츠 생성
- 이미지는 사용하지 않음
- 회원 기능은 MVP에서 제외

## Confirmed Technical Decisions

- Next.js 16 App Router + TypeScript
- React 19
- SCSS 전역 스타일 + BEM 네이밍
- Tailwind CSS와 CSS Module은 사용하지 않음
- Cloudflare Workers + OpenNext
- Cloudflare D1 + Drizzle ORM
- DB 시간 저장은 UTC, 사용자 화면 표시는 KST

## Confirmed Design Direction

디자인 레퍼런스:

- MCLN Behance: https://www.behance.net/gallery/183750417/MCLN
- MCLN Live Website: https://www.francescomichelini.com/

사용자가 말한 "거의 그대로 복제"의 대상은 MCLN의 페이지 구조나 레이아웃이 아니라
색감과 시각 스타일입니다. RaceNote의 정보 구조, 화면 구성, 카드 및 데이터 배치는
기존 RaceNote 설계 문서를 기준으로 구현합니다.

적용할 핵심:

- MCLN 특유의 저채도 배경, 낮은 대비의 본문, 밝은 포인트 컬러 조합
- 모놀리식 워드마크와 테크니컬한 타이포그래피 분위기
- 작고 얇은 외곽선 버튼, 사각 마커, 슬래시, 점 형태의 장식
- 여백이 넓고 정보 요소가 정밀하게 배치된 시각적 리듬
- 코드형 번호 및 라벨 (`01 / SCHEDULE`, `P/01` 등)
- MCLN과 유사한 호버 및 화면 전환 애니메이션
- 원본 사이트의 콘텐츠 구조와 포트폴리오 레이아웃은 복제하지 않음
- RaceNote의 홈, 캘린더, 레이스 상세, 시리즈, 관리자 화면 구조를 유지
- 원본 로고, 이미지, 유료 폰트는 직접 복제하지 않음

### Theme Direction

라이트 모드는 밝은 뉴트럴 그레이 배경과 저채도 코랄 포인트로 최종 확정했습니다.
다크 모드는 MCLN 실사이트의 다크 테마 색감을 기준으로 구현했습니다.

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
fallback으로 사용합니다. 로컬 관리자 인증 런타임 확인은 workerd가 실행 가능한
환경이 필요합니다.

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
액션, F1/WEC/WRC 일정 수집, 관리자 수동 세션 관리, Cloudflare 빌드 검증, MVP
Drizzle 스키마와 SQL 마이그레이션 구현 및 운영 배포를 완료했습니다.

권장 다음 순서:

1. 자동 르망 세션 검수·관전 시점 보강 후 공개 seed 전환
2. 다음 UTC `0 1 * * *` AI 자동 실행 결과와 실패 시 구체 오류 범주 확인

## New Session Starter Prompt

다른 컴퓨터의 새 Codex 스레드에서는 다음처럼 요청하면 됩니다.

```txt
AGENTS.md와 PROJECT_HANDOFF.md, racenote_mvp_design.md,
racenote_mvp_screen_design.md를 읽고 현재 Git 상태를 확인해줘.
기존 결정사항을 유지하면서 RaceNote 작업을 이어가자.
```
