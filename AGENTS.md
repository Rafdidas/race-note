# RaceNote Agent Guide

이 문서는 AI 코딩 에이전트가 RaceNote에서 작업할 때 따라야 하는 프로젝트 전용
기준입니다. 범용적인 선호보다 이 저장소의 기존 결정, 코드, 문서를 우선합니다.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 1. 작업 시작 전 필수 확인

작업을 시작하기 전에 다음 순서로 현재 상태를 파악합니다.

1. `PROJECT_HANDOFF.md`에서 완료 상태, 기술 결정, 배포 노트, 다음 작업 경계를
   확인합니다.
2. 기능·화면 요구사항은 `racenote_f1_full_pivot_screen_design.md`를 확인합니다.
3. 실행 및 배포 명령은 `README.md`와 `package.json`의 현재 내용을 기준으로
   확인합니다.
4. `git status --short`로 사용자의 기존 변경사항을 확인하고 보존합니다.
5. 관련 구현, 타입, 스타일, 테스트, 의존성을 읽은 뒤 수정합니다.

`PROJECT_HANDOFF.md`의 완료 상태나 기술 결정과 실제 코드가 다르면 임의로 한쪽을
덮어쓰지 않습니다. 차이를 확인하고, 작업 범위 안에서 올바른 상태로 맞춘 뒤 의미
있는 결정이나 마일스톤 변경을 `PROJECT_HANDOFF.md`에 반영합니다.

## 2. 제품과 현재 작업 경계

RaceNote는 F1 시즌을 한국어로 이해시키는 정보 허브입니다. 한국 시간 기준 다음
경기, 시즌 일정, 최근 결과, 순위, 드라이버, 팀, 입문 가이드를 한 곳에서 제공합니다.
WEC/WRC는 삭제가 아니라 F1 구조가 안정된 뒤 복귀할 보류 범위입니다.

현재 우선 범위:

- 공개 홈을 F1 Season Hub로 전면 교체
- `/f1/drivers`, `/f1/drivers/[slug]`, `/f1/teams`, `/f1/teams/[slug]`,
  `/f1/guide`, `/f1/races/[slug]` 공개 구조
- F1 순위, 드라이버, 팀, 결과, 시즌 일정 데이터 기반 구축
- 관리자 로그인, F1 시즌 데이터 관리, 일정·결과·순위·AI 문구 검수 및 공개
- Cloudflare Cron 기반 일정 수집 및 AI 콘텐츠 생성
- 이미지 없는 정보 중심 UI
- 비회원 공개 서비스와 단일 관리자 운영

현재 다음 작업 경계는 `PROJECT_HANDOFF.md`를 최종 기준으로 삼습니다. F1 중심 전면
재설계를 진행하되, 이미 구현된 D1/관리자/수집/AI 계층은 가능한 한 재사용하고 요청
없이 일반 회원 기능을 추가하지 않습니다.

## 3. 확정 기술 스택

- Next.js 16 App Router + React 19 + TypeScript
- SCSS 전역 스타일 + BEM 네이밍
- Cloudflare Workers + OpenNext
- Cloudflare D1 + Drizzle ORM
- DB 시간 저장은 UTC, 사용자 화면 표시는 KST
- Pretendard Variable + 자체 호스팅 IBM Plex Mono

사용하지 않는 기술:

- Tailwind CSS
- CSS Modules
- styled-components 등 별도 CSS-in-JS 라이브러리
- MVP 공개 화면용 이미지 자산

새 패키지, 상태 관리 라이브러리, UI 프레임워크를 추가하기 전에 기존 스택만으로
해결 가능한지 먼저 확인합니다. 사용자의 명시적 요청 없이 패키지를 설치하지
않습니다.

## 4. 코드 탐색과 영향 분석

이 저장소에는 프로젝트 로컬 `semble_rs` 환경이 있습니다. 최초 사용 전 한 번
설정합니다.

```bash
npm run semble:setup
```

넓은 범위의 구조 파악, 의미 기반 검색, 의존성 및 영향 분석에는 다음 명령을
우선합니다.

```bash
npm run semble:tree
npm run semble:search -- "<feature or symbol>" --outline
npm run semble:search -- "<feature or symbol>" --compact
npm run semble:deps -- <file>
npm run semble:impact -- <file>
```

정확한 문자열 검색과 대상이 좁혀진 뒤의 파일 탐색에는 `rg`와 일반 파일 읽기
도구를 사용합니다.

수정 전 확인 항목:

- 같은 역할의 페이지, 컴포넌트, 유틸, 타입이 이미 있는가
- 변경 대상의 호출자와 의존 대상은 무엇인가
- 공개 화면과 관리자 화면 양쪽에 미치는 영향이 있는가
- D1 스키마, 조회 모델, UI 모델 사이 계약이 바뀌는가
- 공통 스타일 또는 테마 토큰에 미치는 영향이 있는가
- 관련 테스트와 배포 런타임 제약이 있는가

## 5. 구현 기본 원칙

- 요청 범위와 `PROJECT_HANDOFF.md`의 다음 작업 경계를 지킵니다.
- 기존 구조와 명명 방식을 우선하고, 관련 없는 리팩터링을 섞지 않습니다.
- 임시 우회보다 원인을 해결하는 작고 유지보수 가능한 변경을 선호합니다.
- 새 추상화는 실제 중복이나 복잡성을 줄일 때만 추가합니다.
- 이미 있는 공통 컴포넌트와 데이터 변환 계층을 먼저 재사용합니다.
- 사용자의 기존 미커밋 변경사항을 되돌리거나 덮어쓰지 않습니다.
- 빌드, 타입, 린트 오류를 무시 설정이나 `any`로 숨기지 않습니다.
- 비밀값, 토큰, 실제 환경변수 값을 코드, 문서, 로그에 남기지 않습니다.

새 파일은 가장 가까운 기존 책임 영역에 둡니다. 페이지 전용 코드는 해당 라우트
근처에, 재사용 UI는 `src/components/`, 공개 데이터 조회와 변환은 기존
`src/lib/` 및 `src/types/`, DB 정의는 `src/db/schema/`의 패턴을 따릅니다.

## 6. Next.js와 React 규칙

- Next.js 관련 코드를 작성하기 전에 해당 주제의 최신 로컬 문서를
  `node_modules/next/dist/docs/`에서 확인합니다.
- App Router와 Server Component를 기본으로 사용합니다.
- 상호작용, 브라우저 API, 로컬 상태가 필요한 최소 경계에만 Client Component를
  둡니다.
- 데이터를 서버에서 조회할 수 있으면 불필요하게 클라이언트 fetch로 옮기지
  않습니다.
- 기존 동적 렌더링, 캐시, Cloudflare 런타임 동작을 확인하지 않고 렌더링 전략을
  바꾸지 않습니다.
- 페이지에 데이터 변환과 비즈니스 로직을 과도하게 넣지 않고 기존 조회/포맷 계층을
  사용합니다.
- 로딩, 빈 상태, 오류, not-found 상태를 사용자 흐름에 맞게 처리합니다.

React 상태는 가장 좁은 범위에 둡니다. 단순 토글, 탭, 폼 입력을 전역 상태로 만들지
않으며, 서버 상태와 클라이언트 UI 상태를 구분합니다.

## 7. TypeScript 규칙

- `any`를 사용하지 않습니다. 외부 입력은 `unknown`에서 검증하거나 좁힙니다.
- API/DB 응답 타입, 화면 모델, 컴포넌트 props 타입의 책임을 구분합니다.
- `null`과 `undefined` 가능성을 명시적으로 처리합니다.
- 반복되는 타입 단언보다 조회 또는 변환 경계에서 타입을 확정합니다.
- 기존 union과 상수 값의 의미를 유지하고 임의의 문자열로 상태를 표현하지
  않습니다.
- 공개 함수와 컴포넌트 props는 호출자가 이해할 수 있는 명확한 타입을 갖게 합니다.

DB 행을 그대로 UI에 전달하기보다 기존 공개 화면 모델 변환 패턴을 따릅니다. 시간,
상태 라벨, nullable 콘텐츠처럼 표시 정책이 필요한 값은 변환 계층에서 정리합니다.

## 8. UI, SCSS, BEM 규칙

RaceNote의 정보 구조와 화면 구성은 `racenote_f1_full_pivot_screen_design.md`를
따릅니다. Formula1.com 레퍼런스는 메인, 스케줄, 결과, 드라이버, 팀, 가이드의 정보
구조만 참고하며 공식 로고, 이미지, 콘텐츠, 레이아웃을 복제하지 않습니다.

스타일 규칙:

- 전역 SCSS와 BEM 네이밍을 사용합니다.
- 컴포넌트 스타일은 기존처럼 컴포넌트 폴더의 `.scss` 파일에 둡니다.
- 색상, 간격, 글꼴은 `src/styles/`의 기존 토큰과 믹스인을 우선 사용합니다.
- 라이트/다크 테마 모두 확인하고, 한 테마에만 맞는 색상을 하드코딩하지 않습니다.
- `<html data-theme="light|dark">`와 `racenote-theme` 저장 방식은 유지합니다.
- 임의의 높은 `z-index`, 일회성 magic number, 중복 미디어 쿼리를 피합니다.
- 모바일 우선으로 작성하고 데스크톱 레이아웃까지 확인합니다.
- 이미지 없이 타이포그래피, 선, 마커, 배지, 여백으로 정보 위계를 만듭니다.

BEM 예시:

```scss
.race-card {}
.race-card__header {}
.race-card__status {}
.race-card--featured {}
```

공통 컴포넌트를 수정할 때는 모든 사용처를 확인합니다. 한 화면에만 필요한 변형은
공통 기본 동작을 훼손하지 않는 modifier나 명확한 prop으로 표현합니다.

## 9. 접근성과 사용자 상태

- 동작 요소는 의미에 맞는 `button`, `a`, form 요소를 사용합니다.
- 키보드 포커스와 조작을 유지합니다.
- 입력에는 연결된 label 또는 적절한 접근성 이름을 제공합니다.
- 색상만으로 상태를 구분하지 않습니다.
- 장식 요소가 스크린 리더에 불필요하게 노출되지 않도록 처리합니다.
- 모션 추가 시 `prefers-reduced-motion`을 고려합니다.

사용자가 마주칠 수 있는 로딩, 빈 데이터, 오류, 권한 없음, 저장 성공/실패 상태는
화면에서 이해할 수 있게 안내합니다. 개발자 로그와 사용자 메시지를 구분하고,
민감한 내부 오류 내용을 사용자에게 노출하지 않습니다.

## 10. 데이터, D1, Drizzle 규칙

- 스키마 변경 전 `src/db/schema/index.ts`, 기존 SQL 마이그레이션, 설계 문서를
  함께 확인합니다.
- DB에는 시간을 UTC로 저장하고 공개 및 관리자 화면의 표시 정책에 따라 KST로
  변환합니다.
- 기존 데이터, seed 반복 실행 가능성, 외래키 무결성을 유지합니다.
- 삭제가 필요하면 운영 데이터와 변경 이력에 미치는 영향을 먼저 판단합니다.
- D1 제약과 Cloudflare Workers 런타임에서 동작하는 API만 사용합니다.
- Drizzle 스키마 변경에는 대응하는 마이그레이션과 검증 방법을 포함합니다.
- 조회 성능에 영향을 주는 필터와 정렬에는 필요한 인덱스를 검토합니다.

원격 D1 명령은 실제 운영 데이터에 영향을 줄 수 있습니다. 사용자의 명시적 요청
없이 원격 migration, seed, 데이터 수정 명령을 실행하지 않습니다. 로컬 또는 메모리
SQLite 검증을 우선합니다.

현재 `npm run db:generate`와 로컬 `workerd` 관련 알려진 문제는
`PROJECT_HANDOFF.md`를 확인합니다. 알려진 실패를 성공으로 보고하거나 무작정
반복 실행하지 않습니다.

## 11. 인증, 관리자, 보안 규칙

- 관리자 권한은 UI 숨김만으로 보호하지 않고 서버와 데이터 접근 경계에서
  검증합니다.
- 관리자 세션은 설계된 httpOnly 쿠키 및 서버 검증 방향을 따릅니다.
- 비밀번호, 세션 토큰, Cloudflare 토큰을 클라이언트에 노출하지 않습니다.
- 사용자 입력, 외부 일정 데이터, AI 생성 결과는 신뢰하지 않고 경계에서
  검증합니다.
- AI 생성 문구는 관리자 검수 전 자동 공개하거나 기존 수동 편집을 자동으로
  덮어쓰지 않습니다.
- 인증, 공개 처리, 원격 DB 변경처럼 영향이 큰 작업은 실패 및 재시도 동작까지
  고려합니다.

`.env`, `.env.local`, 실제 Cloudflare/D1 비밀값은 Git에 커밋하지 않습니다.
예시가 필요하면 값이 없는 `.env.example` 형식을 사용합니다.

## 12. 일정 수집과 AI 콘텐츠 규칙

- 수집 소스와 반영 정책은 `PROJECT_HANDOFF.md`와
  `racenote_f1_full_pivot_screen_design.md`를 기준으로 합니다.
- 외부 소스 데이터는 형식 변경, 누락, 중복, 시간대 오류를 전제로 처리합니다.
- 자동 수집 데이터와 관리자 수정 데이터를 구분하고 수동 수정값을 보호합니다.
- 중복 실행되어도 결과가 망가지지 않는 idempotent 작업을 선호합니다.
- 동기화와 AI 생성 작업은 성공/실패 및 변경 내용을 추적할 수 있게 설계합니다.
- AI 출력은 사실로 단정하지 않고 검수 가능한 초안으로 취급합니다.

## 13. 테스트와 검증

변경 위험도에 맞게 가장 좁은 검증부터 실행하고, 완료 전 관련 검증 결과를
확인합니다.

기본 명령:

```bash
npm test
npm run lint
npm run build
npm run cf:build
npm run cf:types
npx wrangler deploy --dry-run
```

검증 기준:

- 포맷/변환/데이터 로직 변경: 관련 테스트와 `npm test`
- TypeScript, 컴포넌트, 페이지 변경: `npm run lint`와 `npm run build`
- Cloudflare 런타임, 바인딩, 배포 설정 변경: `npm run cf:build`,
  `npm run cf:types`, 필요 시 deploy dry-run
- DB 스키마/SQL 변경: 메모리 SQLite 적용, seed 반복 실행, 외래키 검사
- UI 변경: 라이트/다크, 모바일/데스크톱, 주요 상태, 콘솔 오류 확인

`package.json`에 없는 명령을 있다고 가정하지 않습니다. 이 프로젝트에는 별도
`type-check` 스크립트가 없으므로 TypeScript 검증은 현재 빌드 경로를 기준으로
합니다.

전체 검증을 실행하지 못했거나 환경 문제로 실패했다면 숨기지 않고 완료 보고에
명령과 원인을 적습니다.

## 14. 문서와 인수인계

다음에 해당하면 `PROJECT_HANDOFF.md`를 갱신합니다.

- 의미 있는 기능 또는 마일스톤 완료
- 확정 기술/제품/디자인 결정 변경
- 배포, D1, 로컬 개발 절차 변경
- 새로 발견한 중요한 제약이나 재현 가능한 문제
- 다음 작업 경계 변경

일시적인 디버깅 기록이나 아직 확정되지 않은 추측은 인수인계 문서에 넣지
않습니다. 실행 명령을 바꾸면 `README.md`, `package.json`,
`PROJECT_HANDOFF.md` 사이의 설명도 함께 확인합니다.

## 15. Git과 위험 작업

사용자의 명시적 요청 없이 다음 작업을 하지 않습니다.

- commit, push, pull, rebase
- branch 생성 또는 삭제
- force push
- `git reset --hard`, 파일 복원, 사용자 변경 폐기
- 파일 또는 디렉토리 대량 삭제
- 원격 D1 migration, seed, 데이터 수정
- 실제 Cloudflare 배포

작업 트리가 더러우면 기존 변경을 보존한 채 필요한 파일만 수정합니다. 작업 중
예상하지 못한 변경을 발견하면 사용자 변경으로 간주하고, 관련이 없으면 건드리지
않으며 관련이 있으면 내용을 이해한 뒤 함께 작업합니다.

특히 신중해야 하는 변경:

- 공통 컴포넌트와 전역 스타일
- 라우팅 및 렌더링 전략
- 인증과 관리자 권한
- DB 스키마와 마이그레이션
- 테마 초기화 스크립트
- Cloudflare/OpenNext/Wrangler 설정

## 16. 완료 보고

작업을 마치면 다음을 간결하게 보고합니다.

- 무엇을 변경했고 어떤 사용자/운영 동작이 달라지는지
- 주요 수정 파일
- 실행한 검증과 결과
- 남은 제약, 실패한 검증, 사용자가 확인해야 할 사항

코드가 실제로 변경되지 않았거나 검증하지 못한 내용을 완료했다고 표현하지
않습니다.

## 17. 작업 체크리스트

작업 전:

```txt
[ ] PROJECT_HANDOFF.md와 관련 설계서를 읽었는가?
[ ] git status와 사용자 기존 변경을 확인했는가?
[ ] 관련 구현, 타입, 스타일, 테스트, 의존성을 확인했는가?
[ ] Next.js 작업이면 로컬 Next.js 문서를 확인했는가?
[ ] 요청 범위와 현재 다음 작업 경계를 지키는가?
[ ] 보안, 시간대, D1, Cloudflare 영향이 있는가?
```

작업 후:

```txt
[ ] 요청한 동작을 끝까지 구현했는가?
[ ] 기존 기능과 사용자 변경을 훼손하지 않았는가?
[ ] 타입 오류를 any나 무시 설정으로 숨기지 않았는가?
[ ] 관련 테스트, lint, build를 실행했는가?
[ ] UI 변경이면 테마, 반응형, 접근성, 상태별 UI를 확인했는가?
[ ] DB 변경이면 마이그레이션, seed, 외래키를 확인했는가?
[ ] 비밀값과 불필요한 로그가 남지 않았는가?
[ ] 의미 있는 결정과 완료 상태를 PROJECT_HANDOFF.md에 반영했는가?
```
