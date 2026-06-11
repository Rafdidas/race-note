# RaceNote

F1, WEC, WRC 일정을 한국 시간으로 모아 보여주는 모터스포츠 캘린더 서비스입니다.

현재는 프로젝트 초기 설정만 완료된 상태입니다. 화면 및 기능 구현은 디자인 레퍼런스 확정 후 진행합니다.

## Stack

- Next.js App Router + TypeScript
- SCSS + BEM
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

Cloudflare 배포 전 `wrangler.jsonc`의 D1 `database_id`를 실제 값으로 변경해야 합니다.
