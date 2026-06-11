# RaceNote Project Handoff

이 문서는 다른 컴퓨터 또는 새로운 Codex 스레드에서 RaceNote 작업을 바로 이어가기
위한 인수인계 문서입니다. 작업을 시작하기 전에 아래 설계 문서와 함께 읽고, 중요한
결정이나 완료 상태가 바뀌면 이 문서를 갱신합니다.

## Required Reading

- `racenote_mvp_design.md`: 서비스 범위, 기술 스택, DB/API/운영 설계
- `racenote_mvp_screen_design.md`: 화면 구조, 컴포넌트, 상태별 UI 설계
- `README.md`: 실행 및 Cloudflare 배포 명령

## Current Status

- 프로젝트 생성과 초기 설정까지 완료했습니다.
- 화면 및 기능 구현은 아직 시작하지 않았습니다.
- Next.js 기본 예제 화면은 제거했고 `/`는 빈 `<main />`만 렌더링합니다.
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

다크 모드는 MCLN 실사이트의 다크 테마 색감을 기준으로 확정합니다.

- 거의 검정에 가까운 웜 블랙 배경
- 크림 또는 웜 그레이 계열 주요 텍스트
- 낮은 대비의 중간 회색 보조 텍스트
- 얇고 절제된 회색 테두리
- 과도하게 선명하지 않은 포인트 컬러

라이트 모드는 아직 확정하지 않았습니다. 후보는 다음 두 방향입니다.

1. 연한 세이지/그레이그린 배경 + 코랄 포인트
2. 밝은 뉴트럴 그레이 배경 + 라임 포인트

사용자가 라이트 모드를 결정하기 전에는 하나로 고정하지 않습니다.

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
    layout.tsx
    page.tsx
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
```

Drizzle 스키마는 아직 빈 상태입니다. 설계서에 정의된 테이블 구현은 다음 단계에서
진행합니다.

## Cloudflare Deployment Notes

Cloudflare Workers Builds 설정:

```txt
Build command: npm run cf:build
Deploy command: npx wrangler deploy
```

`npm run build`만 사용하면 `.open-next` 산출물이 없어 배포가 실패합니다.

D1 바인딩은 현재 `wrangler.jsonc`에서 제거된 상태입니다. 자리표시자 ID를 활성
설정에 두면 Cloudflare 배포가 실패하기 때문입니다. 실제 D1 데이터베이스 생성 후
`wrangler.d1.example.jsonc`의 블록을 `wrangler.jsonc`에 복사하고 실제
`database_id`를 입력합니다.

## Commands Verified

다음 명령은 현재 설정에서 통과했습니다.

```bash
npm ci --dry-run
npm run lint
npm run build
npm run cf:build
npm run cf:types
npm run db:generate
npx wrangler deploy --dry-run
```

Windows에서 OpenNext는 WSL 사용 권장 경고를 표시하지만 빌드는 통과합니다.

## Known Notes

- npm 선택적 peer dependency 문제를 방지하기 위해 `@emnapi/core`와
  `@emnapi/runtime`을 개발 의존성으로 명시했습니다.
- Cloudflare와 같은 npm 10.9.2 환경에서 `npm ci --dry-run`을 검증했습니다.
- 저장소 루트 아래에 추적되지 않은 `race-note/.git` 빈 중첩 저장소가 보입니다.
  사용자가 만든 상태일 수 있으므로 명시적 요청 없이 삭제하지 않습니다.
- `.env`와 실제 Cloudflare/D1 비밀값은 Git에 커밋하지 않습니다.

## Next Work Boundary

현재 합의된 다음 단계는 디자인 레퍼런스를 기반으로 화면 구현을 시작하는 것입니다.
다만 사용자가 구체적인 시작 지시를 내리기 전에는 기능, DB 테이블, 화면을 임의로
구현하지 않습니다.

화면 구현을 시작할 때 권장 순서:

1. MCLN 기반 디자인 토큰과 공통 레이아웃 확정
2. Public Header 및 홈 화면 구현
3. 공통 RaceCard, SeriesBadge, SessionList 구현
4. 캘린더, 레이스 상세, 시리즈 소개 구현
5. 관리자 화면 구현
6. D1 및 Drizzle 스키마 연결

## New Session Starter Prompt

다른 컴퓨터의 새 Codex 스레드에서는 다음처럼 요청하면 됩니다.

```txt
AGENTS.md와 PROJECT_HANDOFF.md, racenote_mvp_design.md,
racenote_mvp_screen_design.md를 읽고 현재 Git 상태를 확인해줘.
기존 결정사항을 유지하면서 RaceNote 작업을 이어가자.
```
