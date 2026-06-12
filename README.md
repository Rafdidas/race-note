# RaceNote

F1, WEC, WRC 일정을 한국 시간으로 모아 보여주는 모터스포츠 캘린더 서비스입니다.

현재는 프로젝트 초기 설정만 완료된 상태입니다. 화면 및 기능 구현은 디자인 레퍼런스 확정 후 진행합니다.

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

현재 초기 배포 설정에는 D1 바인딩이 활성화되어 있지 않습니다. D1 데이터베이스를
생성한 뒤 `wrangler.d1.example.jsonc`의 `d1_databases` 블록을 `wrangler.jsonc`에
복사하고 실제 `database_id`로 변경합니다.

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
`workerd` 실행 문제로 로컬 D1 명령과 D1 기반 공개 화면의 로컬 실행이 `write
EOF`로 실패하므로, `next dev`에서는 공개 화면 목 데이터 fallback을 사용합니다.

## Cloudflare Builds

Cloudflare Workers Builds에서는 다음 명령을 사용합니다.

```txt
Build command: npm run cf:build
Deploy command: npx wrangler deploy
```

`npm run build`는 일반 Next.js 빌드만 생성하므로 Cloudflare 배포에 필요한
`.open-next` 산출물을 만들지 않습니다.

현재 Windows 환경에서는 OpenNext 자동 배포가 로컬 `workerd`의 `write EOF`로
실패합니다. `npm run cf:build` 후 다음 명령으로 직접 배포합니다.

```powershell
$env:OPEN_NEXT_DEPLOY="true"
npx wrangler deploy
```

production 빌드는 Windows OpenNext의 Turbopack 서버 청크 누락을 피하기 위해
Webpack을 사용합니다.
