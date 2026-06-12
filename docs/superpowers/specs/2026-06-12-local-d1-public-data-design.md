# Local D1 Public Data Design

## Goal

원격 Cloudflare 인증을 기다리는 동안 로컬 D1을 구성하고, 공개 화면의 목업 레이스
데이터를 Drizzle 기반 D1 조회로 교체한다.

## Scope

### Included

- 로컬 개발 전용 Wrangler D1 설정
- 초기 MVP 데이터를 넣는 seed SQL
- Cloudflare D1 바인딩과 Drizzle 연결
- 공개 레이스 목록, 캘린더 세션, 레이스 상세, 시리즈 조회
- 홈, 캘린더, 레이스 상세, 시리즈 화면의 D1 데이터 사용
- 로컬 D1 마이그레이션과 seed 검증

### Excluded

- 원격 D1 생성 및 배포 바인딩
- 관리자 화면의 목업 데이터 교체
- 관리자 인증과 변경 액션
- 일정 수집 및 AI 생성

## Configuration

`wrangler.jsonc`는 원격 배포용 설정으로 유지하며, 실제 원격 D1 ID가 준비되기 전까지
D1 바인딩을 추가하지 않는다.

`wrangler.local.jsonc`는 로컬 개발 전용 설정으로 추가한다. `racenote-db`라는
로컬 D1 바인딩 `DB`를 정의하고, `next dev`에서는
`initOpenNextCloudflareForDev({ configPath: "./wrangler.local.jsonc" })`로 이
설정을 읽는다.

로컬 마이그레이션과 seed 명령도 해당 설정 파일을 명시한다.

## Data Access

`src/lib/db.ts`는 `getCloudflareContext({ async: true })`에서 `DB` 바인딩을 읽고
Drizzle 인스턴스를 반환한다. 바인딩이 없으면 목업 fallback 없이 명확한 오류를
발생시킨다.

`src/lib/public-data.ts`는 공개 화면에 필요한 조회와 화면 모델 변환을 담당한다.

- `getPublishedRaces()`
- `getPublishedRaceBySlug(slug)`
- `getPublishedSessions()`
- `getSeriesGuides()`

레이스, 시리즈, 세션, 콘텐츠 테이블을 조회한 뒤 현재 컴포넌트가 사용하는
`RacePreview`, `RaceSession`, `SeriesGuide` 형태로 변환한다. UTC 시간은
`Asia/Seoul` 기준 날짜와 시간으로 포맷한다.

## UI Integration

공개 페이지는 D1 바인딩을 요청 시 읽어야 하므로 동적 렌더링으로 전환한다.

- 홈은 공개 레이스와 다음 세션을 조회한다.
- 캘린더는 공개 세션 목록을 조회한다.
- 레이스 상세는 slug로 공개 레이스를 조회하고 없으면 404를 반환한다.
- 시리즈 화면은 D1의 설명과 입문 가이드를 사용한다.

`HomeRaceGrid`와 `CalendarSchedule`은 Client Component 상태를 유지하되 데이터는
props로 받는다. 공통 타입은 목업 파일이 아닌 별도 공개 데이터 타입 파일로 옮긴다.

## Seed Policy

초기 seed는 현재 목업의 세 레이스와 F1/WEC/WRC 시리즈 데이터를 동일한 화면 결과가
나오도록 저장한다. 공개 화면 확인을 위해 레이스는 `published`, `is_featured = 1`
상태로 넣는다.

seed SQL은 반복 실행 가능하도록 `INSERT ... ON CONFLICT DO UPDATE`를 사용한다.

## Error Handling

- D1 바인딩이 없으면 개발자가 즉시 알아볼 수 있는 오류를 발생시킨다.
- 공개되지 않은 레이스나 존재하지 않는 slug는 404로 처리한다.
- 콘텐츠 필드가 비어 있으면 빈 배열 또는 준비 중 문구로 변환해 컴포넌트 계약을
  유지한다.

## Verification

- 로컬 D1 마이그레이션 적용
- seed SQL 반복 적용
- D1에서 8개 테이블 및 seed 행 개수 확인
- `npm run lint`
- `npm run build`
- `npm run cf:build`
- 로컬 브라우저에서 홈, 캘린더, 상세, 시리즈 확인

