# RaceNote

F1, WEC, WRC 일정을 한국 시간으로 모아 보여주는 모터스포츠 캘린더 서비스입니다.

공개 화면과 원격 D1 조회, 관리자 운영 화면의 D1 읽기 연결, 관리자 비밀번호 인증과
httpOnly D1 세션, 기존 레이스의 정정·검수·공개 액션까지 구현되어 있습니다. F1은
Jolpica API, WEC/WRC는 공식 캘린더에서 하루 2회 수집하며 관리자 수정 필드는 이후
수집에서 보호됩니다. AI 생성 작업은 다음 구현 범위입니다.

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

Cloudflare Cron은 UTC 기준 `0 0 * * *`, `0 12 * * *`에 F1, WEC, WRC 일정을
각 소스별로 수집합니다. 관리자는 `/admin/sync`에서도 같은 작업을 수동 실행할 수
있습니다. 신규·변경 일정은 자동 공개되지 않으며 관리자 검수가 필요합니다.

WEC/WRC 공식 캘린더에는 정확한 세션 시작 시각이 없으므로 레이스 단위 일정만
수집합니다. 필요한 Start, Final Hour, Power Stage 등의 정확한 UTC 시각은 관리자
레이스 상세에서 수동 세션으로 추가하며, 수동 세션만 삭제할 수 있습니다.

현재 Windows 환경에서는 OpenNext 자동 배포가 로컬 `workerd`의 `write EOF`로
실패합니다. `npm run cf:build` 후 다음 명령으로 직접 배포합니다.

```powershell
$env:OPEN_NEXT_DEPLOY="true"
npx wrangler deploy
```

production 빌드는 Windows OpenNext의 Turbopack 서버 청크 누락을 피하기 위해
Webpack을 사용합니다.
