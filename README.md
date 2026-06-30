# RaceNote

F1 시즌을 한국어로 이해시키는 정보 허브입니다.

현재 제품 방향은 기존 F1/WEC/WRC 통합 캘린더에서 F1 중심 시즌 허브로 전면 전환 중입니다.
다음 경기, 시즌 일정, 최근 결과, 순위, 드라이버, 팀, 입문 가이드를 한국 시간과
한국어 설명으로 정리하는 것이 1차 목표입니다.

기존 공개 화면과 원격 D1 조회, 관리자 운영 화면, 관리자 비밀번호 인증과 httpOnly
D1 세션, 레이스 정정·검수·공개 액션, 일정 수집, OpenAI 기반 AI 초안 생성과
관리자 검수·반영 흐름은 구현되어 있습니다. WEC/WRC는 삭제가 아니라 F1 구조가
안정된 뒤 복귀할 보류 범위입니다.

## Stack

- Next.js App Router + TypeScript
- SCSS + BEM
- Pretendard Variable dynamic subset + IBM Plex Mono
- Cloudflare Workers + D1
- Drizzle ORM

## Local development

```bash
npm install
npm run dev
```

환경변수는 `.env.example`을 참고해 로컬 파일에 설정합니다.

관리자 인증에는 `ADMIN_PASSWORD`와 충분히 긴 무작위
`ADMIN_SESSION_SECRET`이 필요합니다. 배포 환경에서는 두 값을 Cloudflare
Workers의 암호화된 비밀로 등록합니다.

`next dev`에서는 로컬 D1 바인딩 없이 관리자 화면을 확인할 수 있도록
`ADMIN_SESSION_SECRET`으로 서명한 개발 전용 httpOnly 쿠키 세션을 사용합니다.
배포 환경에서는 기존대로 D1 `admin_sessions`에 세션을 저장하고 검증합니다.

AI 초안 생성에는 `OPENAI_API_KEY`가 필요합니다. 로컬에서는 `.env.local`, 배포
환경에서는 Cloudflare Workers의 암호화된 비밀로 등록합니다.

## Commands

```bash
npm run lint
npm run build
npm run cf:build
npm run cf:preview
npm run cf:deploy
npm run cf:types
npm run db:generate
npm run db:migrate:local
npm run db:migrate:remote
```

배포 설정의 `DB` 바인딩은 원격 `racenote-db`에 연결되어 있습니다. 원격 migration,
seed, 데이터 변경은 운영 데이터에 영향을 주므로 명시적으로 필요한 경우에만
실행합니다.

## Local D1 Preparation

`wrangler.local.jsonc`, 초기 마이그레이션, seed SQL을 준비했습니다.

```bash
npm run db:migrate:local
npm run db:seed:local
npm run db:migrate:remote
npm run db:seed:remote
```

seed는 반복 실행 가능하며 공개 화면 확인용 F1, WEC, WRC 레이스 데이터를
추가합니다. 원격 `racenote-db`에는 초기 마이그레이션과 seed를 적용했으며 공개
화면은 Cloudflare 요청 시 원격 D1을 조회합니다. 현재 Windows 환경에서는
`workerd` 실행 문제로 로컬 D1 명령과 D1 기반 화면의 로컬 실행이 `write EOF`로
실패하므로, `next dev`에서는 공개 및 관리자 화면 목 데이터 fallback을 사용합니다.

## Cloudflare Builds

Cloudflare Workers Builds에서는 다음 명령을 사용합니다.

```txt
Build command: npm run cf:build
Deploy command: npx wrangler deploy
```

`npm run build`는 일반 Next.js 빌드만 생성하므로 Cloudflare 배포에 필요한
`.open-next` 산출물을 만들지 않습니다.

Cloudflare Cron은 UTC 기준 `0 0 * * *`, `0 12 * * *`에 현재 구현된 일정 소스를
각 소스별로 수집합니다. 관리자는 `/admin/sync`에서도 같은 작업을 수동 실행할 수
있습니다. 신규·변경 일정은 자동 공개되지 않으며 관리자 검수가 필요합니다.

UTC `0 1 * * *`에는 향후 14일 이내 레이스 중 AI 초안이 필요한 항목을 시작일
순으로 최대 3개 생성합니다. `gpt-5-nano`가 저장된 일정 정보만 사용하며, 생성
결과는 별도 초안으로 저장됩니다. 관리자가 초안을 반영하고 검수·공개하기 전까지
현재 공개 콘텐츠는 바뀌지 않습니다.

WEC는 공식 상세 페이지의 JSON-LD에 정확한 시작 시각이 있는 세션을 함께
수집합니다. WRC 공식 캘린더는 레이스 단위 일정만 제공하므로 필요한 Power Stage
등의 정확한 UTC 시각은 관리자 레이스 상세에서 수동 세션으로 추가하며, 수동
세션만 삭제할 수 있습니다.

현재 Windows 환경에서는 OpenNext 자동 배포가 로컬 `workerd`의 `write EOF`로
실패합니다. `npm run cf:build` 후 다음 명령으로 직접 배포합니다.

```powershell
$env:OPEN_NEXT_DEPLOY="true"
npx wrangler deploy
```

production 빌드는 Windows OpenNext의 Turbopack 서버 청크 누락을 피하기 위해
Webpack을 사용합니다.
