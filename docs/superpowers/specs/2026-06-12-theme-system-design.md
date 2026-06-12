# RaceNote Theme System Design

## Goal

RaceNote의 기본 라이트 테마를 뉴트럴 그레이와 코랄 조합으로 확정하고, 다크
테마에는 웜 블랙과 라임 조합을 적용한다. 사용자는 라이트/다크 모드를 전환해
선택을 저장할 수 있다.

## Confirmed Behavior

- 첫 방문에는 운영체제의 `prefers-color-scheme` 설정을 따른다.
- 사용자가 토글을 누르면 `light` 또는 `dark` 선택을 `localStorage`에 저장한다.
- 저장된 선택은 이후 방문에서 운영체제 설정보다 우선한다.
- MVP에서는 시스템 설정으로 되돌리는 세 번째 상태를 제공하지 않는다.
- 공개 화면과 관리자 화면은 같은 전역 테마를 사용한다.

## Theme Architecture

`<html data-theme="light|dark">`를 테마의 단일 기준으로 사용한다.

루트 레이아웃은 Server Component로 유지한다. `<head>` 안의 동기 인라인 스크립트가
초기 HTML 파싱 중 저장된 선택을 확인하고, 저장값이 없으면 시스템 설정을 읽어
`data-theme`을 적용한다. 이를 통해 React hydration 이후 테마를 바꿀 때 생기는
화면 깜빡임을 피한다.

`ThemeToggle`만 Client Component로 구현한다. 이 컴포넌트는 현재
`document.documentElement.dataset.theme` 값을 읽고, 버튼 클릭 시 반대 테마를
적용한 뒤 `localStorage`에 저장한다.

## Palette Direction

### Light

- 중립적인 밝은 회색 캔버스
- 거의 흰색에 가까운 표면
- 차콜 계열 주요 텍스트
- 중간 회색 보조 텍스트와 얇은 경계선
- 저채도 코랄 포인트

### Dark

- 거의 검정에 가까운 웜 블랙 캔버스
- 캔버스보다 약간 밝은 표면
- 크림 또는 웜 그레이 주요 텍스트
- 낮은 대비의 보조 텍스트와 경계선
- 레이스 타이밍 보드 분위기의 라임 포인트

각 테마의 포인트 컬러는 활성 필터, 포커스 링, 링크 호버, 작은 마커, 주요 액션에만
사용한다. 넓은 배경 전체에는 사용하지 않는다. F1, WEC, WRC 고유색은 유지하되
전체 팔레트에 맞춘 현재 저채도 방향을 유지한다.

## Toggle UI

- `PublicHeader` 우측 메타 영역에 `LIGHT` 또는 `DARK` 텍스트 버튼을 배치한다.
- KST 표시는 유지한다.
- 모바일에서도 토글을 숨기지 않는다.
- 버튼은 `aria-label`과 현재 상태를 제공하고 키보드 포커스 링을 표시한다.
- 색상 전환에는 짧은 transition을 사용한다.
- `prefers-reduced-motion: reduce`에서는 전환 애니메이션을 제거한다.

## Scope

### Included

- 전역 라이트/다크 색상 토큰
- 초기 테마 적용 스크립트
- 저장 가능한 헤더 테마 토글
- 공개 및 관리자 화면의 공통 테마 적용
- 반응형, 키보드, reduced-motion 검증
- `PROJECT_HANDOFF.md` 갱신

### Excluded

- 시스템 설정으로 되돌리는 별도 버튼
- 서버 쿠키 기반 테마 저장
- 사용자 계정별 테마 저장
- 페이지 구조, 목업 데이터, 관리자 기능 변경

## Verification

- `npm run lint`
- `npm run build`
- 브라우저에서 저장값이 없는 첫 방문의 시스템 테마 확인
- 토글 후 `data-theme` 및 `localStorage` 값 확인
- 새로고침 후 선택 유지 확인
- 공개 홈, 캘린더, 레이스 상세, 시리즈, 관리자 화면의 라이트/다크 확인
- 모바일 헤더와 키보드 포커스 확인
