# RaceNote MVP 화면 설계서

> `RaceNote(레이스노트)`는 현재 설계 단계의 **가제**입니다. 본 문서는 MVP 개발 전 화면 구조, 정보 배치, 공통 컴포넌트, 상태별 UI를 정의합니다.

---

## 1. 화면 설계 기준

### 1.1 화면 설계 목표

RaceNote의 화면은 사용자가 아래 정보를 빠르게 이해하도록 설계합니다.

- 이번 주 볼만한 레이스
- 오늘 또는 곧 시작하는 세션
- 한국 시간 기준 일정
- 꼭 봐야 하는 세션
- 입문자용 관전 포인트
- F1 / WEC / WRC 차이

### 1.2 디자인 방향

기준 레퍼런스는 Behance의 MCLN 디자인입니다. 단, 그대로 복제하지 않고 RaceNote의 서비스 성격에 맞게 재해석합니다.

| 항목 | 적용 방향 |
| --- | --- |
| 기본 테마 | 라이트 모드 우선 |
| 보조 테마 | 다크 모드 별도 제공 가능 |
| 톤 | 테크니컬, 유틸리테리언, 모터스포츠 브리핑 |
| 분위기 | 레이스 타이밍 보드, 피트월 모니터, 브리핑 문서 |
| 이미지 | MVP에서는 사용하지 않음 |
| 레이아웃 | 얇은 라인, 각진 패널, 정보 밀도 높은 카드 |
| 타이포그래피 | 시간/상태/코드는 모노스페이스, 본문은 산세리프 |

### 1.3 화면 우선순위

모바일 우선으로 설계하되, 데스크톱에서는 정보 밀도를 높입니다.

| 디바이스 | 방향 |
| --- | --- |
| Mobile | 세로 스크롤, 카드 단일 컬럼, 큰 터치 영역 |
| Tablet | 2컬럼 일부 적용 |
| Desktop | 좌우 그리드, 사이드 정보 패널, 테이블 활용 |

---

## 2. IA

### 2.1 공개 화면

```txt
/
/calendar
/races/[slug]
/series
```

### 2.2 관리자 화면

```txt
/admin/login
/admin
/admin/sync
/admin/races
/admin/races/[id]
```

### 2.3 내비게이션

공개 화면의 상단 내비게이션은 최소 구성으로 갑니다.

```txt
RaceNote
- This Week
- Calendar
- Series
- Theme Toggle
```

관리자 화면의 내비게이션은 별도 레이아웃을 사용합니다.

```txt
Admin
- Dashboard
- Sync Logs
- Races
- Logout
```

---

## 3. 공통 레이아웃

### 3.1 Public Layout

#### 목적

공개 사용자 화면의 기본 프레임입니다.

#### 구성

```txt
PublicHeader
MainContent
PublicFooter
```

#### BEM 기준

```txt
.public-layout
.public-layout__header
.public-layout__main
.public-layout__footer
```

### 3.2 Admin Layout

#### 목적

관리자 화면의 기본 프레임입니다.

#### 구성

```txt
AdminHeader
AdminSidebar 또는 AdminNav
AdminContent
```

#### BEM 기준

```txt
.admin-layout
.admin-layout__header
.admin-layout__nav
.admin-layout__main
```

---

## 4. 공개 화면 설계

## 4.1 홈 화면 `/`

### 화면 목적

사용자가 접속하자마자 이번 주 볼만한 레이스와 꼭 봐야 하는 세션을 확인합니다.

### 진입 경로

- 직접 접속
- 검색 결과
- 공유 링크
- 상단 로고 클릭

### 주요 구성

```txt
1. Hero Briefing
2. Today / Upcoming Sessions
3. This Week Races
4. Series Filter
5. Beginner Guide Preview
```

### 모바일 와이어프레임

```txt
┌────────────────────────────┐
│ RaceNote              MENU │
├────────────────────────────┤
│ MOTORSPORT WEEKLY BRIEFING │
│ KST 기준 이번 주 레이스    │
│ 2026.06.08 — 2026.06.14    │
├────────────────────────────┤
│ NEXT SESSION               │
│ [WEC] 24H LE MANS          │
│ START / 06.13 23:00 KST    │
├────────────────────────────┤
│ FILTER                     │
│ ALL  F1  WEC  WRC          │
├────────────────────────────┤
│ [F1] CANADIAN GP           │
│ QUALIFYING / RACE          │
│ 예선과 세이프티카 변수가... │
├────────────────────────────┤
│ [WEC] 24H LE MANS          │
│ START / NIGHT / FINAL HOUR │
│ 하이퍼카와 야간 주행이...   │
├────────────────────────────┤
│ BEGINNER NOTES             │
│ F1 / WEC / WRC 차이 보기   │
└────────────────────────────┘
```

### 데스크톱 와이어프레임

```txt
┌────────────────────────────────────────────────────────────┐
│ RaceNote       This Week  Calendar  Series           KST   │
├────────────────────────────────────────────────────────────┤
│ MOTORSPORT WEEKLY BRIEFING                                │
│ 2026.06.08 — 2026.06.14                                   │
├───────────────────────────────┬────────────────────────────┤
│ NEXT SESSION                  │ SERIES GUIDE               │
│ [WEC] 24H LE MANS START      │ F1 / WEC / WRC              │
├───────────────────────────────┴────────────────────────────┤
│ FILTER  ALL  F1  WEC  WRC                                  │
├────────────────────┬────────────────────┬──────────────────┤
│ RaceCard           │ RaceCard           │ RaceCard         │
└────────────────────┴────────────────────┴──────────────────┘
```

### 노출 데이터

| 데이터 | 설명 |
| --- | --- |
| 현재 주차 | KST 기준 주간 범위 |
| 다음 세션 | 현재 시각 이후 가장 가까운 공개 세션 |
| 레이스 카드 | 이번 주 공개 상태 레이스 |
| 시리즈 필터 | ALL / F1 / WEC / WRC |
| 관전 포인트 요약 | race_contents의 요약 일부 |

### 사용자 액션

| 액션 | 결과 |
| --- | --- |
| 레이스 카드 클릭 | 레이스 상세로 이동 |
| 시리즈 필터 클릭 | 해당 시리즈만 표시 |
| Calendar 클릭 | 캘린더 화면 이동 |
| Series 클릭 | 시리즈 소개 이동 |

### 상태별 UI

| 상태 | 처리 |
| --- | --- |
| 이번 주 레이스 없음 | EmptyState: “이번 주 등록된 레이스가 없습니다.” |
| 세션 시간 없음 | “세션 시간 확인 중” 표시 |
| AI 문구 없음 | 관전 포인트 영역 숨김 또는 “관전 포인트 준비 중” |
| 수집 오류 | 공개 화면에는 노출하지 않음 |

### BEM 기준

```txt
.home
.home__hero
.home__period
.home__next-session
.home__filter
.home__race-list
.home__guide-preview
```

---

## 4.2 통합 캘린더 `/calendar`

### 화면 목적

F1 / WEC / WRC 전체 일정을 날짜 기준으로 확인합니다.

### 주요 구성

```txt
1. Page Header
2. Series Filter
3. View Option
4. Date Group List
5. Race / Session Items
```

### 모바일 와이어프레임

```txt
┌────────────────────────────┐
│ Calendar                   │
│ F1 · WEC · WRC / KST       │
├────────────────────────────┤
│ ALL  F1  WEC  WRC          │
├────────────────────────────┤
│ JUNE 2026                  │
├────────────────────────────┤
│ 06.13 SAT                  │
│ [WEC] 24H LE MANS          │
│ START 23:00 KST            │
├────────────────────────────┤
│ 06.14 SUN                  │
│ [WEC] NIGHT STINT 04:00    │
│ [WRC] POWER STAGE 19:00    │
└────────────────────────────┘
```

### 데스크톱 와이어프레임

```txt
┌────────────────────────────────────────────────────────────┐
│ Calendar                                                   │
│ ALL  F1  WEC  WRC                     View: List / Month   │
├──────────────┬─────────────────────────────────────────────┤
│ JUNE 2026    │ 06.13 SAT                                   │
│              │ [WEC] 24H LE MANS / START 23:00 KST         │
│              │                                             │
│              │ 06.14 SUN                                   │
│              │ [WRC] POWER STAGE 19:00 KST                 │
└──────────────┴─────────────────────────────────────────────┘
```

### 노출 데이터

| 데이터 | 설명 |
| --- | --- |
| 월/날짜 | KST 기준 |
| 시리즈 코드 | F1 / WEC / WRC |
| 레이스명 | 세션이 속한 레이스 |
| 세션명 | Qualifying, Race, Start, Power Stage 등 |
| 시간 | KST 표시 |
| Must Watch 여부 | 강조 배지 |

### 사용자 액션

| 액션 | 결과 |
| --- | --- |
| 시리즈 필터 | 목록 필터링 |
| 세션/레이스 클릭 | 레이스 상세 이동 |
| 월 이동 | 추후 확장, MVP에서는 현재/다음 달 정도만 가능 |

### 상태별 UI

| 상태 | 처리 |
| --- | --- |
| 일정 없음 | EmptyState 표시 |
| 필터 결과 없음 | “선택한 시리즈의 일정이 없습니다.” |
| 시간 미정 | “TBD” 표시 |

### BEM 기준

```txt
.calendar-page
.calendar-page__header
.calendar-page__filter
.calendar-page__body
.calendar-page__month
.calendar-page__date-group
.calendar-page__session
```

---

## 4.3 레이스 상세 `/races/[slug]`

### 화면 목적

특정 레이스의 일정, 꼭 봐야 하는 세션, 관전 포인트, 입문자 안내를 제공합니다.

### 주요 구성

```txt
1. Race Header
2. Meta Info
3. Schedule
4. Must Watch
5. Race Brief
6. Beginner Notes
7. Variables
```

### 모바일 와이어프레임

```txt
┌────────────────────────────┐
│ [WEC] 24 HOURS OF LE MANS  │
│ Le Mans · France           │
│ 2026.06.13 — 06.14         │
├────────────────────────────┤
│ 01 / SCHEDULE              │
│ START       23:00 KST      │
│ NIGHT       04:00 KST      │
│ FINAL HOUR  22:00 KST      │
├────────────────────────────┤
│ 02 / MUST WATCH            │
│ START · NIGHT · FINAL HOUR │
├────────────────────────────┤
│ 03 / BRIEF                 │
│ 1. 24시간 동안 속도와...    │
│ 2. 하이퍼카 클래스는...     │
│ 3. 밤과 피트 전략이...      │
├────────────────────────────┤
│ 04 / BEGINNER NOTES        │
│ 여러 클래스 차량이 동시에...│
├────────────────────────────┤
│ 05 / VARIABLES             │
│ 날씨, 야간 주행, 세이프티카 │
└────────────────────────────┘
```

### 데스크톱 와이어프레임

```txt
┌────────────────────────────────────────────────────────────┐
│ [WEC] 24 HOURS OF LE MANS                                  │
│ Le Mans · France / 2026.06.13 — 06.14 / KST                │
├───────────────────────────────┬────────────────────────────┤
│ 01 / SCHEDULE                 │ 02 / MUST WATCH            │
│ START       23:00 KST         │ START                      │
│ NIGHT       04:00 KST         │ NIGHT STINT                │
│ FINAL HOUR  22:00 KST         │ FINAL HOUR                 │
├───────────────────────────────┴────────────────────────────┤
│ 03 / BRIEF                                                  │
│ 1. ...                                                      │
│ 2. ...                                                      │
│ 3. ...                                                      │
├───────────────────────────────┬────────────────────────────┤
│ 04 / BEGINNER NOTES           │ 05 / VARIABLES             │
└───────────────────────────────┴────────────────────────────┘
```

### 노출 데이터

| 데이터 | 설명 |
| --- | --- |
| 시리즈 | F1 / WEC / WRC |
| 레이스명 | 대회명 |
| 국가/장소 | country, location, venue_name |
| 기간 | start_date, end_date |
| 세션 목록 | start_time_utc를 KST 변환 |
| Must Watch | is_must_watch true 세션 |
| 3줄 요약 | summary_three_lines |
| 관전 포인트 | key_points |
| 변수 | race_variables |
| 입문자 안내 | beginner_notes |

### 사용자 액션

| 액션 | 결과 |
| --- | --- |
| 뒤로가기 | 이전 목록으로 이동 |
| Calendar 이동 | 전체 일정으로 이동 |
| Series 이동 | 해당 시리즈 설명으로 이동 |

### 상태별 UI

| 상태 | 처리 |
| --- | --- |
| 레이스 없음 | 404 처리 |
| 비공개 레이스 | 404 또는 공개 전 안내 |
| AI 문구 없음 | “관전 포인트 준비 중” |
| 세션 없음 | “세션 정보 확인 중” |

### BEM 기준

```txt
.race-detail
.race-detail__header
.race-detail__meta
.race-detail__grid
.race-detail__section
.race-detail__schedule
.race-detail__brief
```

---

## 4.4 시리즈 소개 `/series`

### 화면 목적

F1, WEC, WRC의 차이를 입문자 기준으로 설명합니다.

### 주요 구성

```txt
1. Page Header
2. Series Cards
3. Comparison Table
4. Beginner Guide
```

### 모바일 와이어프레임

```txt
┌────────────────────────────┐
│ Series Guide               │
│ F1 · WEC · WRC             │
├────────────────────────────┤
│ [F1] Formula 1             │
│ 서킷 레이스 / 팀 / 드라이버 │
├────────────────────────────┤
│ [WEC] Endurance            │
│ 내구 레이스 / 클래스 / 교대 │
├────────────────────────────┤
│ [WRC] Rally                │
│ 스테이지 / 노면 / 코드라이버│
├────────────────────────────┤
│ 처음 보면 헷갈리는 차이     │
│ F1은 동시에 달리고...       │
└────────────────────────────┘
```

### 노출 데이터

| 데이터 | 설명 |
| --- | --- |
| 시리즈명 | Formula 1, WEC, WRC |
| 짧은 설명 | 한 줄 설명 |
| 입문 가이드 | beginner_guide |
| 핵심 키워드 | 팀, 클래스, 스테이지 등 |

### BEM 기준

```txt
.series-page
.series-page__header
.series-page__list
.series-page__card
.series-page__comparison
```

---

## 5. 관리자 화면 설계

## 5.1 관리자 로그인 `/admin/login`

### 화면 목적

관리자 비밀번호로 관리자 화면 접근을 인증합니다.

### 구성

```txt
┌────────────────────────────┐
│ RaceNote Admin             │
├────────────────────────────┤
│ Password                   │
│ [____________________]     │
│ [LOGIN]                    │
└────────────────────────────┘
```

### 상태별 UI

| 상태 | 처리 |
| --- | --- |
| 비밀번호 오류 | “비밀번호를 확인해 주세요.” |
| 세션 만료 | 로그인 화면으로 이동 |
| 로그인 성공 | `/admin` 이동 |

### BEM 기준

```txt
.admin-login
.admin-login__panel
.admin-login__title
.admin-login__form
.admin-login__error
```

---

## 5.2 관리자 대시보드 `/admin`

### 화면 목적

운영 상태를 한눈에 확인합니다.

### 주요 구성

```txt
1. Sync Status Summary
2. Review Queue
3. This Week Races
4. Recent Logs
```

### 와이어프레임

```txt
┌────────────────────────────────────────────────────────────┐
│ ADMIN / DASHBOARD                                          │
├────────────────────┬────────────────────┬──────────────────┤
│ SYNC SUCCESS 2     │ NEEDS REVIEW 5     │ PUBLISHED 12     │
├────────────────────┴────────────────────┴──────────────────┤
│ REVIEW QUEUE                                               │
│ [WEC] 24H LE MANS / AI generated / needs review            │
│ [WRC] Rally Finland / schedule changed                     │
├────────────────────────────────────────────────────────────┤
│ RECENT LOGS                                                │
│ F1 SUCCESS 09:00 / added 0 updated 1 failed 0              │
└────────────────────────────────────────────────────────────┘
```

### 노출 데이터

| 데이터 | 설명 |
| --- | --- |
| 마지막 수집 상태 | sync_logs 최신 상태 |
| 검수 필요 수 | ai_status, change_logs 기준 |
| 공개 레이스 수 | visibility published |
| 최근 로그 | 최근 수집/AI 작업 로그 |

### BEM 기준

```txt
.admin-dashboard
.admin-dashboard__summary
.admin-dashboard__card
.admin-dashboard__queue
.admin-dashboard__logs
```

---

## 5.3 수집 로그 `/admin/sync`

### 화면 목적

자동/수동 일정 수집 상태와 실패 로그를 확인합니다.

### 주요 구성

```txt
1. Manual Sync Button
2. Source Status Table
3. Sync Log Table
4. Error Detail
```

### 와이어프레임

```txt
┌────────────────────────────────────────────────────────────┐
│ ADMIN / SYNC                                               │
│ [RUN SYNC]                                                 │
├────────┬─────────┬────────────────┬───────┬───────┬───────┤
│ SOURCE │ STATUS  │ LAST SYNC      │ ADD   │ UPD   │ FAIL  │
├────────┼─────────┼────────────────┼───────┼───────┼───────┤
│ F1     │ SUCCESS │ 2026-06-11 09  │ 0     │ 1     │ 0     │
│ WEC    │ SUCCESS │ 2026-06-11 09  │ 1     │ 0     │ 0     │
│ WRC    │ FAILED  │ 2026-06-11 09  │ 0     │ 0     │ 1     │
└────────┴─────────┴────────────────┴───────┴───────┴───────┘
```

### 사용자 액션

| 액션 | 결과 |
| --- | --- |
| Run Sync | 수동 수집 실행 |
| 로그 클릭 | 상세 메시지 확인 |
| 실패 로그 확인 | 오류 원인 확인 |

### 상태별 UI

| 상태 | 처리 |
| --- | --- |
| 수집 중 | 버튼 disabled, loading 표시 |
| 실패 | status badge failed, message 표시 |
| 로그 없음 | EmptyState 표시 |

### BEM 기준

```txt
.admin-sync
.admin-sync__toolbar
.admin-sync__table
.admin-sync__status
.admin-sync__message
```

---

## 5.4 레이스 목록 `/admin/races`

### 화면 목적

수집된 레이스를 목록으로 확인하고 검수/공개 상태를 관리합니다.

### 주요 구성

```txt
1. Filter Bar
2. Race Table
3. Status Badge
4. Pagination 또는 Load More
```

### 와이어프레임

```txt
┌────────────────────────────────────────────────────────────┐
│ ADMIN / RACES                                              │
│ ALL  F1  WEC  WRC  NEEDS REVIEW  PUBLISHED  DRAFT          │
├──────┬───────────────┬──────────────┬────────┬─────────────┤
│ SER  │ RACE          │ DATE         │ AI     │ VISIBILITY  │
├──────┼───────────────┼──────────────┼────────┼─────────────┤
│ F1   │ Canadian GP   │ 2026.06.14   │ review │ published   │
│ WEC  │ 24H Le Mans   │ 2026.06.13   │ gen    │ draft       │
│ WRC  │ Rally Finland │ 2026.08.02   │ empty  │ draft       │
└──────┴───────────────┴──────────────┴────────┴─────────────┘
```

### 노출 데이터

| 데이터 | 설명 |
| --- | --- |
| 시리즈 | F1 / WEC / WRC |
| 레이스명 | name |
| 날짜 | start_date ~ end_date |
| AI 상태 | empty/generated/reviewed/published |
| 공개 상태 | draft/published |
| 변경 여부 | change_logs needs_review 존재 여부 |

### 사용자 액션

| 액션 | 결과 |
| --- | --- |
| 행 클릭 | 레이스 상세 관리 이동 |
| 필터 클릭 | 목록 필터링 |
| 공개 상태 변경 | MVP에서는 상세에서 처리 권장 |

### BEM 기준

```txt
.admin-races
.admin-races__filter
.admin-races__table
.admin-races__row
.admin-races__status
```

---

## 5.5 레이스 상세 관리 `/admin/races/[id]`

### 화면 목적

특정 레이스의 기본 정보, 세션, AI 문구, 공개 상태를 검수합니다.

### 주요 구성

```txt
1. Race Basic Form
2. Session Editor
3. Must Watch Toggle
4. AI Content Panel
5. Change Logs
6. Publish Actions
```

### 와이어프레임

```txt
┌────────────────────────────────────────────────────────────┐
│ ADMIN / RACE DETAIL                                        │
│ [SAVE] [GENERATE AI] [MARK REVIEWED] [PUBLISH]             │
├────────────────────────────────────────────────────────────┤
│ BASIC INFO                                                 │
│ Series: WEC                                                │
│ Name: 24 Hours of Le Mans                                  │
│ Date: 2026.06.13 — 06.14                                   │
├────────────────────────────────────────────────────────────┤
│ SESSIONS                                                   │
│ [x] MUST  START       2026.06.13 23:00 KST                 │
│ [x] MUST  NIGHT       2026.06.14 04:00 KST                 │
│ [x] MUST  FINAL HOUR  2026.06.14 22:00 KST                 │
├────────────────────────────────────────────────────────────┤
│ AI CONTENT                                                 │
│ 3 Lines Summary                                            │
│ [textarea]                                                 │
│ Beginner Notes                                             │
│ [textarea]                                                 │
├────────────────────────────────────────────────────────────┤
│ CHANGE LOGS                                                │
│ session.start_time changed / needs review                  │
└────────────────────────────────────────────────────────────┘
```

### 노출 데이터

| 데이터 | 설명 |
| --- | --- |
| 기본 정보 | race 필드 |
| 세션 정보 | sessions |
| AI 콘텐츠 | race_contents |
| 변경 로그 | change_logs |
| 공개 상태 | visibility |

### 사용자 액션

| 액션 | 결과 |
| --- | --- |
| Save | 기본 정보/세션/문구 저장 |
| Generate AI | AI 문구 생성 |
| Mark Reviewed | ai_status reviewed 처리 |
| Publish | 공개 상태 published 처리 |
| Unpublish | draft 처리 |

### 상태별 UI

| 상태 | 처리 |
| --- | --- |
| AI 생성 중 | 버튼 disabled, loading 표시 |
| AI 생성 실패 | 오류 메시지 표시, 기존 문구 유지 |
| 검수 완료 문구 | 자동 생성 시 덮어쓰기 금지 안내 |
| 변경 로그 있음 | 상단 warning 표시 |

### BEM 기준

```txt
.admin-race-detail
.admin-race-detail__toolbar
.admin-race-detail__section
.admin-race-detail__form
.admin-race-detail__sessions
.admin-race-detail__ai
.admin-race-detail__logs
```

---

## 6. 공통 컴포넌트 설계

## 6.1 Header

### 역할

공개 화면 상단 내비게이션입니다.

### Props 예시

```ts
type HeaderProps = {
  currentPath?: string;
  theme?: "light" | "dark";
};
```

### BEM

```txt
.site-header
.site-header__logo
.site-header__nav
.site-header__link
.site-header__theme
```

---

## 6.2 SeriesBadge

### 역할

F1 / WEC / WRC 시리즈를 짧게 표시합니다.

### Props 예시

```ts
type SeriesBadgeProps = {
  code: "F1" | "WEC" | "WRC";
  label?: string;
};
```

### BEM

```txt
.series-badge
.series-badge--f1
.series-badge--wec
.series-badge--wrc
```

---

## 6.3 RaceCard

### 역할

홈과 목록에서 레이스 정보를 요약 표시합니다.

### 노출 정보

- 시리즈
- 라운드
- 레이스명
- 국가/장소
- 기간
- Must Watch 세션
- 관전 포인트 한 줄

### BEM

```txt
.race-card
.race-card__header
.race-card__series
.race-card__round
.race-card__title
.race-card__meta
.race-card__sessions
.race-card__brief
.race-card--f1
.race-card--wec
.race-card--wrc
```

---

## 6.4 SessionList

### 역할

세션명과 시간을 KST 기준으로 표시합니다.

### BEM

```txt
.session-list
.session-list__item
.session-list__name
.session-list__time
.session-list__badge
.session-list__item--must-watch
```

---

## 6.5 BriefPanel

### 역할

AI가 생성한 관전 포인트, 입문자 안내, 변수 등을 섹션형으로 표시합니다.

### BEM

```txt
.brief-panel
.brief-panel__label
.brief-panel__title
.brief-panel__content
.brief-panel__list
```

---

## 6.6 StatusBadge

### 역할

관리자 화면에서 상태값을 표시합니다.

### 상태

```txt
success
failed
partial
empty
generated
needs-review
reviewed
published
draft
```

### BEM

```txt
.status-badge
.status-badge--success
.status-badge--failed
.status-badge--needs-review
.status-badge--published
```

---

## 6.7 EmptyState

### 역할

데이터가 없을 때 안내합니다.

### BEM

```txt
.empty-state
.empty-state__title
.empty-state__description
.empty-state__action
```

---

## 6.8 AdminTable

### 역할

관리자 목록/로그 화면의 테이블을 구성합니다.

### BEM

```txt
.admin-table
.admin-table__head
.admin-table__body
.admin-table__row
.admin-table__cell
.admin-table__cell--mono
```

---

## 7. 상태별 UI 정책

### 7.1 공개 화면 상태

| 상태 | UI 정책 |
| --- | --- |
| 로딩 | Skeleton보다 텍스트 기반 Loading 사용 |
| 빈 목록 | EmptyState 사용 |
| 시간 미정 | TBD 표시 |
| AI 문구 없음 | “관전 포인트 준비 중” |
| 비공개 데이터 | 공개 화면에서 제외 |
| 오류 | 공개 화면에서는 사용자 친화적인 일반 오류 문구 표시 |

### 7.2 관리자 화면 상태

| 상태 | UI 정책 |
| --- | --- |
| 저장 중 | 버튼 disabled |
| 저장 성공 | 짧은 success 메시지 |
| 저장 실패 | 오류 메시지 표시 |
| AI 생성 중 | Generate 버튼 disabled |
| AI 실패 | 기존 데이터 유지, 실패 사유 표시 |
| 변경 로그 있음 | Warning 패널 표시 |
| 검수 필요 | needs-review badge 표시 |

---

## 8. 시간 표시 정책

DB에는 UTC로 저장하고, 화면에는 KST로 표시합니다.

### 8.1 사용자 화면

```txt
06.13 SAT 23:00 KST
```

### 8.2 관리자 화면

관리자 화면에서는 필요하면 UTC와 KST를 함께 볼 수 있게 합니다.

```txt
KST: 2026.06.13 23:00
UTC: 2026.06.13 14:00
```

---

## 9. 접근성/반응형 기준

### 9.1 접근성

- 버튼은 실제 `button` 요소 사용
- 링크 이동은 `a` 또는 Next Link 사용
- 색상만으로 상태를 구분하지 않음
- 상태 배지는 텍스트를 함께 표시
- 폼 입력에는 label 연결
- 관리자 테이블은 헤더 구조 유지

### 9.2 반응형

| 구간 | 기준 |
| --- | --- |
| Mobile | 0 ~ 767px |
| Tablet | 768px ~ 1199px |
| Desktop | 1200px 이상 |

### 9.3 모바일 우선 정책

- 홈은 단일 컬럼
- 레이스 카드는 전체 너비
- 캘린더는 날짜 그룹 리스트 우선
- 관리자 테이블은 가로 스크롤 허용
- 버튼 높이는 터치 가능한 크기로 확보

---

## 10. 화면 설계 검수 체크리스트

### 10.1 공개 화면

- [ ] 홈에서 이번 주 레이스가 바로 보이는가?
- [ ] 다음 세션이 명확히 보이는가?
- [ ] F1 / WEC / WRC 필터가 직관적인가?
- [ ] 레이스 카드에서 꼭 봐야 하는 세션이 보이는가?
- [ ] 상세 페이지에서 Schedule → Must Watch → Brief 순서가 자연스러운가?
- [ ] 이미지 없이도 화면 분위기가 유지되는가?
- [ ] 라이트 모드가 기본으로 어울리는가?
- [ ] 모바일에서 정보가 과하게 빽빽하지 않은가?

### 10.2 관리자 화면

- [ ] 수집 실패 여부를 대시보드에서 바로 알 수 있는가?
- [ ] 검수 필요한 레이스를 바로 찾을 수 있는가?
- [ ] AI 문구 생성/수정/공개 플로우가 헷갈리지 않는가?
- [ ] 검수 완료 문구가 자동으로 덮어써지지 않는다는 안내가 있는가?
- [ ] 로그 테이블에서 실패 원인을 확인할 수 있는가?

### 10.3 스타일/BEM

- [ ] Tailwind CSS를 사용하지 않는가?
- [ ] CSS Module을 사용하지 않는가?
- [ ] 컴포넌트 클래스가 BEM 구조를 따르는가?
- [ ] 시리즈별 modifier가 일관적인가?
- [ ] 숫자/시간/상태값에 모노스페이스 적용이 가능한가?

---

## 11. 최종 화면 구성 요약

```txt
공개 화면
- 홈: 이번 주 레이스와 다음 세션 중심
- 캘린더: 날짜별 통합 일정 중심
- 레이스 상세: 세션, Must Watch, AI 관전 포인트 중심
- 시리즈 소개: F1 / WEC / WRC 입문자 설명 중심

관리자 화면
- 로그인: 비밀번호 기반
- 대시보드: 수집/검수/공개 상태 요약
- 수집 로그: 자동 수집 결과 확인
- 레이스 목록: 검수 대상 관리
- 레이스 상세 관리: 세션/AI 문구/공개 처리

디자인
- Light-first
- Dark mode optional
- MCLN 레퍼런스 기반
- 이미지 미사용
- SCSS + BEM
```
