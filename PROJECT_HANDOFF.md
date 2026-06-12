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
- `/admin/login`, `/admin`, `/admin/sync`, `/admin/races`,
  `/admin/races/[id]` 관리자 운영 UI를 목업 데이터로 구현했습니다.
- 관리자 인증, 동기화, 저장, AI 생성, 공개 액션은 실제 D1 연결 전까지
  비활성화된 상태입니다.
- Git 저장소와 Cloudflare Workers 배포 연결이 완료되어 있습니다.
- D1은 아직 실제 데이터베이스 ID와 연결하지 않았습니다.

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
공개 화면은 배포 환경에서 `src/lib/public-data.ts`의 원격 D1 조회를 사용합니다.
현재 Windows의 `workerd` 문제를 피하기 위해 `next dev`에서만 기존 목 데이터를
fallback으로 사용합니다. 관리자 화면은 아직 정적 목업을 사용합니다.

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

Windows에서 OpenNext는 WSL 사용 권장 경고를 표시하지만 빌드는 통과합니다.
`npm run db:generate`는 아래 Known Notes의 현재 이슈로 인해 검증 목록에서
제외했습니다.

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

## Known Notes

- npm 선택적 peer dependency 문제를 방지하기 위해 `@emnapi/core`와
  `@emnapi/runtime`을 개발 의존성으로 명시했습니다.
- Cloudflare와 같은 npm 10.9.2 환경에서 `npm ci --dry-run`을 검증했습니다.
- 저장소 루트 아래에 추적되지 않은 `race-note/.git` 빈 중첩 저장소가 보입니다.
  사용자가 만든 상태일 수 있으므로 명시적 요청 없이 삭제하지 않습니다.
- `.env`와 실제 Cloudflare/D1 비밀값은 Git에 커밋하지 않습니다.
- Cloudflare API 토큰은 로컬 `.env.local`에만 저장하며 Git에 커밋하지 않습니다.
- 현재 설치된 `drizzle-kit 0.31.10`에서 전체 스키마를 대상으로 `npm run
  db:generate`를 실행하면 오류 없이 무응답 상태로 멈춥니다. 스키마는 Next 빌드와
  Node 직접 import로 검증했고, 초기 SQL은 수동으로 추가해 SQLite 적용 검증했습니다.
  실제 D1 연결 전에 drizzle-kit/Node 버전 조합을 재확인해야 합니다.
- 현재 Windows 환경에서 `workerd.exe`가 직접 실행되지 않으며 Wrangler 로컬 D1
  명령과 `next dev`의 D1 바인딩 초기화가 `write EOF`로 실패합니다. Wrangler
  4.99.0/4.100.0과 Node 22/24에서 동일하게 재현했습니다. SQL과 OpenNext 빌드는
  검증됐으며, `next dev` 공개 화면은 목 데이터 fallback을 사용합니다. 실제 로컬
  D1 런타임 확인은 WSL 또는 workerd가 실행 가능한 환경에서 재개해야 합니다.

## Next Work Boundary

공개 화면의 원격 D1 조회 연결, 관리자 운영 UI, MVP Drizzle 스키마와 초기 SQL
마이그레이션 구현을 완료했습니다. 관리자 화면은 현재 목업 데이터 기반이며 모든
변경 액션은 비활성화되어 있습니다. 공개 화면의 실제 Cloudflare 요청 검증은 Worker
배포 후 진행해야 합니다.

권장 다음 순서:

1. Worker 배포 후 공개 화면의 원격 D1 런타임 조회 검증
2. 관리자 화면 목업 데이터를 D1 조회로 교체
3. 관리자 비밀번호 인증과 httpOnly 세션 구현
4. 관리자 저장·검수·공개 액션 구현
5. 일정 수집·AI 생성 작업 구현

## New Session Starter Prompt

다른 컴퓨터의 새 Codex 스레드에서는 다음처럼 요청하면 됩니다.

```txt
AGENTS.md와 PROJECT_HANDOFF.md, racenote_mvp_design.md,
racenote_mvp_screen_design.md를 읽고 현재 Git 상태를 확인해줘.
기존 결정사항을 유지하면서 RaceNote 작업을 이어가자.
```
