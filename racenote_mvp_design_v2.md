# RaceNote 추가 개발 설계서

## 1. 문서 목적

이 문서는 기존 RaceNote MVP 설계서에 이어, 서비스를 단순 일정표가 아니라 **모터스포츠 레이스 브리핑 서비스**로 확장하기 위한 추가 개발 설계서이다.

기존 MVP의 핵심은 F1, WEC, WRC 일정을 한국 시간 기준으로 보여주고, 꼭 봐야 하는 세션과 입문자용 관전 포인트를 제공하는 것이다. 추가 개발에서는 여기에 **레이스 상세 정보, 시리즈별 콘텐츠, 팀/드라이버/머신 정보, 현재 순위, 역대 기록**을 더해 사용자가 더 오래 머물 수 있는 구조로 확장한다.

---

## 2. 추가 개발 방향

## 2.1 기존 MVP의 한계

현재 MVP는 다음 강점이 있다.

- 이번 주 레이스를 빠르게 확인할 수 있음
- 한국 시간 기준 세션 일정을 볼 수 있음
- 꼭 봐야 하는 세션을 알 수 있음
- F1 / WEC / WRC를 한 곳에서 볼 수 있음
- 이미지 없이 텍스트 중심의 감성적인 디자인을 유지할 수 있음

다만 다음 한계가 있다.

- 일정 확인 후 사용자가 더 볼 콘텐츠가 부족함
- 레이스 상세 페이지의 정보 밀도가 낮음
- F1, WEC, WRC의 재미 포인트가 충분히 구분되지 않음
- 팀, 드라이버, 머신, 순위, 역대 기록 같은 팬층용 정보가 없음
- 입문자가 계속 탐색할 만한 연결 페이지가 부족함

---

## 2.2 추가 개발의 핵심 목표

추가 개발의 핵심 목표는 다음과 같다.

> RaceNote를 “이번 주 레이스 일정표”에서 “이번 레이스 보기 전 읽는 한국어 모터스포츠 브리핑”으로 확장한다.

이를 위해 서비스 구조를 다음 방향으로 개선한다.

- 레이스 상세 페이지를 핵심 콘텐츠 페이지로 강화
- F1 / WEC / WRC별 정보 구조 차별화
- F1을 우선 깊게 확장하여 유입 콘텐츠 확보
- WEC / WRC는 일정 + 입문 가이드 + 대표 관전 포인트 중심으로 차별화
- 자동 수집에만 의존하지 않고 관리자 수동 큐레이션을 허용
- 팬과 입문자가 모두 볼 수 있는 정보 구조 설계

---

## 3. 추가 개발 범위

## 3.1 1차 추가 개발 범위

기존 MVP 이후 바로 추가할 기능이다.

| 구분 | 기능 | 설명 |
| --- | --- | --- |
| 레이스 상세 | 레이스 개요 강화 | 라운드, 개최지, 서킷, 상태, 기간 표시 |
| 레이스 상세 | 트랙 핵심 정보 | 서킷 길이, 랩 수, 코너 수, DRS, 추월 난이도 |
| 레이스 상세 | 역대 정보 | 전년도 우승자, 최근 우승자, 대표 기록 |
| 레이스 상세 | 현재 순위 요약 | 드라이버/팀 순위 TOP 5 표시 |
| 레이스 상세 | 유력 승리자/주목 대상 | 이번 레이스에서 볼 만한 드라이버/팀 |
| 레이스 상세 | 다음 경기 | 다음 라운드 카드 표시 |
| 시리즈 | F1 시리즈 메인 강화 | 다음 경기, 순위, 팀, 드라이버 목록 |
| 관리자 | 추가 콘텐츠 입력 | 트랙, 기록, 순위, 관전 포인트 수동 입력 |
| DB | 팀/드라이버/머신 기초 테이블 | F1 중심 확장 데이터 저장 |

---

## 3.2 1차 제외 범위

1차 추가 개발에서 제외하는 기능이다.

| 기능 | 제외 이유 |
| --- | --- |
| 실시간 랩타임 | 데이터 확보 난이도 높음 |
| 실시간 경기 순위 | 안정적인 API 확보 필요 |
| 경기 결과 자동 분석 | 결과 데이터와 검수 플로우 필요 |
| 팀/드라이버 이미지 | 저작권 리스크 |
| 공식 로고 사용 | 상표/저작권 이슈 가능 |
| 회원 찜 기능 | 회원 기능 필요 |
| 알림 기능 | 푸시/메일 인프라 필요 |
| 커뮤니티 | 운영 부담 큼 |

---

## 4. IA 개선안

## 4.1 기존 라우팅

```txt
/
/calendar
/races/[slug]
/series
/series/f1
/series/wec
/series/wrc

/admin/login
/admin
/admin/sync
/admin/races
/admin/races/[id]
```

---

## 4.2 추가 라우팅

```txt
/
/calendar
/races/[slug]

/series
/series/f1
/series/wec
/series/wrc

/series/f1/teams
/series/f1/teams/[slug]
/series/f1/drivers
/series/f1/drivers/[slug]
/series/f1/cars
/series/f1/cars/[slug]
/series/f1/standings

/admin/login
/admin
/admin/sync
/admin/races
/admin/races/[id]
/admin/teams
/admin/teams/[id]
/admin/drivers
/admin/drivers/[id]
/admin/cars
/admin/cars/[id]
/admin/standings
```

---

## 4.3 단계별 라우팅 적용

| 단계 | 추가 라우팅 |
| --- | --- |
| 1차 | `/series/f1`, `/series/f1/standings` |
| 1.5차 | `/series/f1/teams`, `/series/f1/drivers` |
| 2차 | `/series/f1/teams/[slug]`, `/series/f1/drivers/[slug]`, `/series/f1/cars/[slug]` |
| 3차 | WEC/WRC 상세 확장 라우팅 |

---

## 5. 화면 설계

# 5.1 홈 개선

## 목적

홈은 사용자가 접속하자마자 다음을 알 수 있어야 한다.

- 이번 주 어떤 레이스가 있는지
- 지금 가장 주목할 경기가 무엇인지
- 곧 시작하는 세션이 있는지
- 현재 시즌 흐름이 어떤지
- 입문자는 어디서부터 보면 되는지

---

## 주요 구성

```txt
01. Hero
- RaceNote 로고
- 이번 주 기간
- 대표 문구
- 이번 주 핵심 레이스 강조

02. This Week
- 이번 주 레이스 카드
- F1 / WEC / WRC 필터

03. Next Session
- 곧 시작하는 세션
- 시작 시간 KST
- must watch 여부

04. Featured Briefing
- 이번 주 가장 볼 만한 레이스 1개 강조
- 왜 봐야 하는지 요약

05. Standings Snapshot
- F1 드라이버 순위 TOP 5
- F1 컨스트럭터 순위 TOP 5

06. Series Guide
- F1 / WEC / WRC 입문 카드

07. Next Race
- 다음 경기 미리보기
```

---

## 홈 UI 블록 예시

```txt
THIS WEEK BRIEFING
2026.06.08 - 06.14

이번 주는 WEC 24 Hours of Le Mans가 중심입니다.
Start와 Final Hour는 입문자도 보기 좋습니다.

[Featured]
24 Hours of Le Mans
06.13 23:00 KST Race Start
Must Watch: Hyperpole 2, Race Start, Final Hour

[Next Session]
06.12 04:40 KST
Hyperpole 2 - Hypercar

[Standings Snapshot]
F1 Drivers
01 Verstappen 194pt
02 Norris 176pt
03 Leclerc 156pt
```

---

# 5.2 레이스 상세 개선

## 목적

레이스 상세 페이지는 추가 개발의 핵심이다.

사용자가 이 페이지에서 다음 질문에 답을 얻어야 한다.

- 이 레이스는 언제 열리는가?
- 어디서 열리는가?
- 무엇을 봐야 하는가?
- 왜 중요한 경기인가?
- 누가 이길 가능성이 높은가?
- 어떤 팀/드라이버를 보면 재밌는가?
- 이 트랙이나 랠리의 특징은 무엇인가?
- 이전에는 누가 이겼는가?
- 다음 경기는 무엇인가?

---

## 공통 구조

```txt
01. Race Hero
02. Quick Facts
03. Schedule
04. Must Watch
05. Why It Matters
06. Who to Watch
07. Track / Stage / Event Key
08. Current Standings
09. History
10. Beginner Note
11. Next Race
```

---

## 레이스 상세 UI 예시

```txt
[F1] Japanese Grand Prix
Suzuka Circuit · Japan
Round 3 · Upcoming · KST

Quick Facts
- Track Length: 5.807km
- Laps: 53
- Corners: 18
- DRS Zones: 1
- Previous Winner: Max Verstappen

Schedule
- Practice 1: 03.27 11:30 KST
- Practice 2: 03.27 15:00 KST
- Qualifying: 03.28 15:00 KST
- Race: 03.29 14:00 KST

Must Watch
- Qualifying
- Race

Why It Matters
스즈카는 드라이버 실력이 잘 드러나는 고속 서킷입니다.
추월이 쉽지 않아 예선 순위와 타이어 전략이 중요합니다.

Who to Watch
- Red Bull: 고속 코너 구간에서 강점
- McLaren: 최근 업그레이드 이후 장거리 페이스 주목
- Ferrari: 예선 페이스가 관건

Track Key
- Sector 1의 연속 코너가 핵심
- 타이어 마모 관리가 중요
- 비가 오면 경기 흐름이 크게 바뀔 수 있음

History
- 2025 Winner: Max Verstappen
- 2024 Winner: Max Verstappen
- Most Wins: Michael Schumacher

Next Race
Bahrain Grand Prix
```

---

# 5.3 F1 시리즈 메인

## 목적

F1 시리즈 메인은 RaceNote의 유입용 허브 페이지다.

F1은 가장 대중적인 모터스포츠 콘텐츠이므로, 팀/드라이버/순위 페이지로 확장하는 첫 번째 대상이 된다.

---

## 주요 구성

```txt
01. F1 Hero
- Formula 1 소개
- 현재 시즌
- 다음 경기

02. Next Grand Prix
- 다음 경기 카드
- 일정
- 서킷
- must watch 세션

03. Current Standings
- 드라이버 순위 TOP 10
- 컨스트럭터 순위 TOP 10

04. Teams
- 참가팀 목록
- 팀명
- 드라이버 2명
- 머신명

05. Drivers
- 드라이버 목록
- 소속팀
- 번호
- 포인트

06. How to Watch F1
- 입문자가 보면 좋은 순서
- Practice / Qualifying / Race 설명

07. Season Calendar
- 시즌 전체 일정
```

---

# 5.4 F1 팀 목록

## 경로

```txt
/series/f1/teams
```

## 주요 구성

```txt
- 팀 카드 목록
- 현재 순위
- 포인트
- 드라이버 2명
- 머신명
- 팀 특징 요약
```

## 팀 카드 예시

```txt
RED BULL RACING
P/01 · 312pt
Drivers: Max Verstappen, Yuki Tsunoda
Car: RB22

고속 코너와 레이스 운영에서 강한 팀입니다.

OPEN TEAM NOTE →
```

---

# 5.5 F1 팀 상세

## 경로

```txt
/series/f1/teams/[slug]
```

## 주요 구성

```txt
01. Team Hero
- 팀명
- 국적
- 현재 순위
- 포인트

02. Drivers
- 현재 드라이버 2명

03. Car
- 머신명
- 파워유닛
- 강점
- 약점

04. Season Form
- 최근 흐름
- 우승 수
- 포디움 수

05. Team Note
- 입문자용 팀 설명

06. Related Races
- 이 팀이 강할 가능성이 높은 경기
```

---

# 5.6 F1 드라이버 목록

## 경로

```txt
/series/f1/drivers
```

## 주요 구성

```txt
- 드라이버 카드 목록
- 현재 순위
- 포인트
- 소속팀
- 차량 번호
- 국적
- 드라이빙 스타일 요약
```

---

# 5.7 F1 드라이버 상세

## 경로

```txt
/series/f1/drivers/[slug]
```

## 주요 구성

```txt
01. Driver Hero
- 이름
- 국적
- 차량 번호
- 소속팀
- 현재 순위

02. Season Stats
- 포인트
- 우승
- 포디움
- 폴 포지션
- 패스티스트 랩

03. Driving Style
- 강점
- 약점
- 잘 맞는 트랙

04. This Season
- 현재 시즌 흐름

05. Beginner Note
- 이 드라이버를 볼 때 재밌는 포인트

06. Related Team
- 소속팀 카드
```

---

# 5.8 F1 머신 상세

## 경로

```txt
/series/f1/cars/[slug]
```

## 주요 구성

```txt
01. Car Hero
- 머신명
- 팀
- 시즌
- 파워유닛

02. Character
- 고속 코너
- 저속 코너
- 직선 속도
- 타이어 관리
- 예선 페이스
- 레이스 페이스

03. Strengths
- 강점

04. Weaknesses
- 약점

05. Best Fit Tracks
- 잘 맞는 트랙 유형
```

---

# 5.9 시리즈 소개 페이지 개선

기존 시리즈 소개 페이지는 F1, WEC, WRC의 차이를 설명하는 역할이다.

추가 개발에서는 단순 소개를 넘어 “어떤 시리즈를 먼저 보면 좋은지”를 알려주는 입문 허브로 개선한다.

```txt
/series

01. Series Hero
- 처음 보는 사람을 위한 모터스포츠 선택 가이드

02. Three Ways to Race
- F1: Position
- WEC: Endurance
- WRC: Time

03. Compare
- 경기 방식
- 핵심 재미
- 입문 난이도
- 먼저 볼 세션

04. Start Here
- F1 입문자는 Qualifying + Race
- WEC 입문자는 Start + Final Hour
- WRC 입문자는 Power Stage
```

---

## 6. 시리즈별 콘텐츠 구조

# 6.1 F1 콘텐츠 구조

F1은 다음 정보를 중심으로 구성한다.

```txt
핵심 재미:
- 드라이버 경쟁
- 팀 경쟁
- 예선 순위
- 타이어 전략
- 피트스톱
- 트랙 특성
- 시즌 포인트 경쟁
```

## F1 레이스 상세 필드

```txt
- round
- circuit_name
- track_length
- laps
- race_distance
- corners
- drs_zones
- first_grand_prix
- previous_winner
- pole_record
- lap_record
- tyre_compounds
- overtake_difficulty
- strategy_note
- weather_note
- key_sector
```

---

# 6.2 WEC 콘텐츠 구조

WEC는 다음 정보를 중심으로 구성한다.

```txt
핵심 재미:
- 장시간 내구 레이스
- 여러 클래스 동시 주행
- 제조사 경쟁
- 드라이버 교대
- 야간 주행
- 피트 전략
- 차량 신뢰성
```

## WEC 레이스 상세 필드

```txt
- event_duration
- circuit_name
- classes
- hypercar_entries
- lmp2_entries
- lmgt3_entries
- night_session_available
- safety_car_note
- pit_strategy_note
- traffic_note
- key_time_slots
```

---

# 6.3 WRC 콘텐츠 구조

WRC는 다음 정보를 중심으로 구성한다.

```txt
핵심 재미:
- 스테이지 기록 경쟁
- 노면 변화
- 날씨 변수
- 코드라이버 페이스노트
- 점프와 고속 코너
- Power Stage 보너스 포인트
```

## WRC 레이스 상세 필드

```txt
- rally_region
- surface_type
- total_stages
- total_distance
- longest_stage
- power_stage_name
- weather_note
- tyre_note
- pace_note_importance
- key_stage_note
```

---

## 7. DB 추가 설계

## 7.1 teams

시리즈별 참가 팀 정보를 저장한다.

```sql
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL,
  season INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country TEXT,
  base_location TEXT,
  team_principal TEXT,
  description TEXT,
  beginner_note TEXT,
  color TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (series_id) REFERENCES series(id)
);
```

---

## 7.2 drivers

드라이버 정보를 저장한다.

```sql
CREATE TABLE drivers (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL,
  season INTEGER NOT NULL,
  team_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  nationality TEXT,
  driver_number INTEGER,
  description TEXT,
  beginner_note TEXT,
  driving_style TEXT,
  strengths TEXT,
  weaknesses TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (series_id) REFERENCES series(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

---

## 7.3 cars

시즌별 머신 정보를 저장한다.

```sql
CREATE TABLE cars (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  season INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  power_unit TEXT,
  description TEXT,
  strengths TEXT,
  weaknesses TEXT,
  high_speed_rating INTEGER,
  low_speed_rating INTEGER,
  straight_speed_rating INTEGER,
  tyre_management_rating INTEGER,
  qualifying_pace_rating INTEGER,
  race_pace_rating INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

---

## 7.4 standings

드라이버/팀/제조사 순위 정보를 저장한다.

```sql
CREATE TABLE standings (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL,
  season INTEGER NOT NULL,
  type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  points REAL NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  podiums INTEGER NOT NULL DEFAULT 0,
  poles INTEGER NOT NULL DEFAULT 0,
  fastest_laps INTEGER NOT NULL DEFAULT 0,
  source_key TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (series_id) REFERENCES series(id)
);
```

### type

```txt
driver
constructor
manufacturer
team
```

---

## 7.5 race_facts

레이스별 핵심 정보를 저장한다.

```sql
CREATE TABLE race_facts (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL UNIQUE,
  circuit_name TEXT,
  track_length TEXT,
  laps INTEGER,
  race_distance TEXT,
  corners INTEGER,
  drs_zones INTEGER,
  first_held INTEGER,
  previous_winner TEXT,
  most_wins_driver TEXT,
  most_wins_team TEXT,
  lap_record TEXT,
  pole_record TEXT,
  surface_type TEXT,
  total_stages INTEGER,
  total_distance TEXT,
  event_duration TEXT,
  classes TEXT,
  weather_note TEXT,
  strategy_note TEXT,
  beginner_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (race_id) REFERENCES races(id)
);
```

---

## 7.6 race_history

레이스의 연도별 결과 기록을 저장한다.

```sql
CREATE TABLE race_history (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL,
  season INTEGER NOT NULL,
  winner_driver_name TEXT,
  winner_team_name TEXT,
  pole_driver_name TEXT,
  fastest_lap_driver_name TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (race_id) REFERENCES races(id)
);
```

---

## 7.7 race_watch_targets

이번 레이스에서 주목할 팀/드라이버/제조사를 저장한다.

```sql
CREATE TABLE race_watch_targets (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_name TEXT NOT NULL,
  title TEXT,
  reason TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (race_id) REFERENCES races(id)
);
```

### target_type

```txt
driver
team
manufacturer
car
manual
```

---

## 8. API 추가 설계

## 8.1 공개 API

### F1 팀 목록

```txt
GET /api/series/f1/teams
```

### F1 팀 상세

```txt
GET /api/series/f1/teams/:slug
```

### F1 드라이버 목록

```txt
GET /api/series/f1/drivers
```

### F1 드라이버 상세

```txt
GET /api/series/f1/drivers/:slug
```

### F1 머신 목록

```txt
GET /api/series/f1/cars
```

### F1 머신 상세

```txt
GET /api/series/f1/cars/:slug
```

### F1 순위 조회

```txt
GET /api/series/f1/standings?type=driver
GET /api/series/f1/standings?type=constructor
```

### 레이스 확장 상세 조회

```txt
GET /api/races/:slug
```

응답에 다음 항목을 추가한다.

```txt
raceFacts
raceHistory
watchTargets
standingsSnapshot
nextRace
```

---

## 8.2 관리자 API

### 팀 관리

```txt
GET /api/admin/teams
POST /api/admin/teams
PATCH /api/admin/teams/:id
DELETE /api/admin/teams/:id
```

### 드라이버 관리

```txt
GET /api/admin/drivers
POST /api/admin/drivers
PATCH /api/admin/drivers/:id
DELETE /api/admin/drivers/:id
```

### 머신 관리

```txt
GET /api/admin/cars
POST /api/admin/cars
PATCH /api/admin/cars/:id
DELETE /api/admin/cars/:id
```

### 순위 관리

```txt
GET /api/admin/standings
POST /api/admin/standings/import
PATCH /api/admin/standings/:id
```

### 레이스 확장 정보 관리

```txt
GET /api/admin/races/:id/facts
PATCH /api/admin/races/:id/facts

GET /api/admin/races/:id/history
POST /api/admin/races/:id/history
PATCH /api/admin/races/:id/history/:historyId
DELETE /api/admin/races/:id/history/:historyId

GET /api/admin/races/:id/watch-targets
POST /api/admin/races/:id/watch-targets
PATCH /api/admin/races/:id/watch-targets/:targetId
DELETE /api/admin/races/:id/watch-targets/:targetId
```

---

## 9. 관리자 페이지 추가 설계

# 9.1 관리자 대시보드 개선

기존 관리자 대시보드에 다음 정보를 추가한다.

```txt
- 검수 필요한 레이스 수
- 확장 정보가 비어 있는 레이스 수
- 순위 데이터 마지막 갱신 시간
- 팀/드라이버 정보 입력 현황
- 이번 주 featured briefing 설정 여부
```

---

# 9.2 레이스 상세 관리 개선

기존 `/admin/races/[id]`에 탭 구조를 추가한다.

```txt
/admin/races/[id]

Tabs:
01. Basic
02. Sessions
03. Briefing
04. Facts
05. History
06. Watch Targets
07. SEO
08. Publish
```

## Basic

```txt
- 대회명
- 시리즈
- 시즌
- 라운드
- 국가
- 장소
- 개최지
- 시작일
- 종료일
- 공개 상태
```

## Sessions

```txt
- 세션 목록
- 시작 시간
- 종료 시간
- must watch 여부
- 중요도
```

## Briefing

```txt
- 3줄 요약
- 관전 포인트
- 경기 변수
- 입문자 규칙
- 꼭 봐야 하는 이유
```

## Facts

```txt
- 서킷 길이
- 랩 수
- 코너 수
- DRS 구간
- 전년도 우승자
- 타이어/전략 메모
- 날씨 변수
```

## History

```txt
- 연도별 우승자
- 우승 팀
- 폴 포지션
- 패스티스트 랩
- 비고
```

## Watch Targets

```txt
- 주목할 드라이버
- 주목할 팀
- 주목할 머신
- 직접 입력 대상
- 표시 순서
```

---

# 9.3 팀 관리

```txt
/admin/teams

- 시즌 필터
- 시리즈 필터
- 팀명
- 현재 순위
- 포인트
- 드라이버
- 공개 여부
```

---

# 9.4 드라이버 관리

```txt
/admin/drivers

- 시즌 필터
- 시리즈 필터
- 팀 필터
- 드라이버명
- 번호
- 국적
- 현재 순위
- 포인트
```

---

# 9.5 머신 관리

```txt
/admin/cars

- 시즌 필터
- 팀 필터
- 머신명
- 파워유닛
- 강점
- 약점
```

---

# 9.6 순위 관리

```txt
/admin/standings

- 시즌 선택
- 시리즈 선택
- type 선택
- 순위 목록
- 포인트 수정
- 수동 import
- 마지막 갱신 시간 표시
```

---

## 10. 컴포넌트 추가 설계

## 10.1 공개 컴포넌트

```txt
components/
  RaceFacts/
    RaceFacts.tsx
    RaceFacts.scss
  RaceHistory/
    RaceHistory.tsx
    RaceHistory.scss
  WatchTargetList/
    WatchTargetList.tsx
    WatchTargetList.scss
  StandingsSnapshot/
    StandingsSnapshot.tsx
    StandingsSnapshot.scss
  NextRaceCard/
    NextRaceCard.tsx
    NextRaceCard.scss
  TeamCard/
    TeamCard.tsx
    TeamCard.scss
  DriverCard/
    DriverCard.tsx
    DriverCard.scss
  CarSpecCard/
    CarSpecCard.tsx
    CarSpecCard.scss
  TrackBriefing/
    TrackBriefing.tsx
    TrackBriefing.scss
```

---

## 10.2 관리자 컴포넌트

```txt
components/admin/
  RaceFactsForm/
    RaceFactsForm.tsx
    RaceFactsForm.scss
  RaceHistoryTable/
    RaceHistoryTable.tsx
    RaceHistoryTable.scss
  WatchTargetEditor/
    WatchTargetEditor.tsx
    WatchTargetEditor.scss
  TeamAdminTable/
    TeamAdminTable.tsx
    TeamAdminTable.scss
  TeamEditForm/
    TeamEditForm.tsx
    TeamEditForm.scss
  DriverAdminTable/
    DriverAdminTable.tsx
    DriverAdminTable.scss
  DriverEditForm/
    DriverEditForm.tsx
    DriverEditForm.scss
  CarEditForm/
    CarEditForm.tsx
    CarEditForm.scss
  StandingsEditor/
    StandingsEditor.tsx
    StandingsEditor.scss
```

---

## 11. 데이터 입력 정책

## 11.1 자동 수집과 수동 입력 분리

추가 개발 범위의 데이터는 모두 자동 수집 대상으로 보지 않는다.

| 데이터 | 처리 방식 |
| --- | --- |
| 레이스 일정 | 자동 수집 우선 |
| 세션 일정 | 자동 수집 우선 |
| must watch | 관리자 수동 |
| 3줄 요약 | AI 생성 + 관리자 검수 |
| 트랙 핵심 정보 | 관리자 수동 입력 |
| 역대 우승자 | 관리자 수동 입력 또는 반자동 import |
| 현재 순위 | 수동 입력 또는 추후 수집 |
| 주목할 팀/드라이버 | 관리자 수동 큐레이션 |
| 팀/드라이버 설명 | 관리자 수동 + AI 초안 |
| 머신 정보 | 관리자 수동 |

---

## 11.2 저작권 정책

추가 개발에서도 이미지는 사용하지 않는다.

사용하지 않는 항목:

- F1 공식 이미지
- WEC 공식 이미지
- WRC 공식 이미지
- 팀 로고
- 드라이버 사진
- 머신 사진
- 방송 캡처
- SNS 이미지

대체 요소:

- 텍스트 중심 카드
- 시리즈 컬러
- 팀 컬러 직접 지정
- 직접 제작 SVG 아이콘
- 숫자 기반 스탯 표현
- 타이포그래피 중심 레이아웃

---

## 12. AI 콘텐츠 확장

## 12.1 AI 생성 대상 추가

기존 AI 생성 대상에 다음 항목을 추가한다.

```txt
team_beginner_note
team_description

driver_beginner_note
driver_driving_style

grand_prix_why_it_matters
track_key_summary
watch_target_reason
history_summary
```

---

## 12.2 AI 프롬프트 예시: 레이스 확장 브리핑

```txt
너는 한국어 모터스포츠 입문자를 위한 콘텐츠 에디터다.
아래 레이스 정보를 바탕으로 이번 경기 브리핑을 작성해라.

조건:
- 확인되지 않은 사실은 단정하지 말 것
- 전문 용어는 쉽게 풀어쓸 것
- 과장된 승부 예측을 하지 말 것
- 입문자가 이해할 수 있게 짧게 쓸 것
- 결과는 JSON으로만 반환할 것

레이스 정보:
시리즈: {seriesName}
대회명: {raceName}
장소: {venueName}
서킷/지역: {circuitOrRegion}
일정: {startDate} ~ {endDate}
주요 세션: {mustWatchSessions}
현재 순위: {standingsSnapshot}
관리자 메모: {adminMemo}

반환 형식:
{
  "whyItMatters": "",
  "trackKeySummary": "",
  "watchTargets": [
    {
      "targetName": "",
      "reason": ""
    }
  ],
  "beginnerNote": ""
}
```

---

## 13. 개발 우선순위

## 13.1 Phase 1: 레이스 상세 강화

가장 먼저 진행한다.

```txt
1. race_facts 테이블 추가
2. race_history 테이블 추가
3. race_watch_targets 테이블 추가
4. /api/races/:slug 응답 확장
5. 레이스 상세 페이지 UI 개선
6. 관리자 레이스 상세 탭 추가
7. Facts / History / Watch Targets 입력 기능 추가
```

완료 기준:

```txt
- 레이스 상세에서 Quick Facts를 볼 수 있다.
- 레이스 상세에서 전년도 우승자를 볼 수 있다.
- 레이스 상세에서 주목할 팀/드라이버를 볼 수 있다.
- 레이스 상세에서 다음 경기를 볼 수 있다.
- 관리자가 위 정보를 직접 입력/수정할 수 있다.
```

---

## 13.2 Phase 2: F1 순위/팀/드라이버 목록

```txt
1. teams 테이블 추가
2. drivers 테이블 추가
3. standings 테이블 추가
4. F1 팀 seed 데이터 입력
5. F1 드라이버 seed 데이터 입력
6. F1 순위 수동 입력 기능 추가
7. /series/f1 페이지 개선
8. /series/f1/teams 페이지 추가
9. /series/f1/drivers 페이지 추가
10. /series/f1/standings 페이지 추가
```

완료 기준:

```txt
- F1 시리즈 페이지에서 다음 경기와 현재 순위를 볼 수 있다.
- F1 팀 목록을 볼 수 있다.
- F1 드라이버 목록을 볼 수 있다.
- 관리자가 팀/드라이버/순위를 수정할 수 있다.
```

---

## 13.3 Phase 3: 팀/드라이버/머신 상세

```txt
1. cars 테이블 추가
2. 팀 상세 페이지 추가
3. 드라이버 상세 페이지 추가
4. 머신 상세 페이지 추가
5. 관리자 머신 관리 추가
6. 관련 레이스 연결
```

완료 기준:

```txt
- 팀 상세에서 소속 드라이버와 머신 정보를 볼 수 있다.
- 드라이버 상세에서 현재 시즌 기록과 스타일 설명을 볼 수 있다.
- 머신 상세에서 강점/약점 정보를 볼 수 있다.
```

---

## 13.4 Phase 4: WEC/WRC 확장

```txt
1. WEC 클래스 설명 확장
2. WEC 제조사/팀 정보 추가
3. WRC 드라이버/제조사 정보 추가
4. WRC 랠리별 노면/스테이지 정보 추가
5. 시리즈별 상세 UI 분기 강화
```

완료 기준:

```txt
- WEC 상세에서 클래스와 주요 시간대 정보를 볼 수 있다.
- WRC 상세에서 노면, 스테이지, Power Stage 정보를 볼 수 있다.
- F1/WEC/WRC가 같은 템플릿이 아니라 각 시리즈 특성에 맞게 보인다.
```

---

## 14. 디자인 보완 방향

## 14.1 현재 디자인 유지 요소

현재 디자인의 강점은 유지한다.

```txt
- 이미지 없는 텍스트 중심 구성
- 넓은 여백
- 얇은 라인
- 모노스페이스 느낌의 정보 UI
- 잡지/브리핑 같은 레이아웃
- 시리즈별 작은 컬러 포인트
```

---

## 14.2 보완이 필요한 요소

```txt
- 큰 타이틀 대비 중간 정보 블록 부족
- 카드 내부 정보 밀도 부족
- 상세 페이지 하단 콘텐츠 부족
- 클릭 가능한 연결 구조 부족
- 팬용 데이터와 입문자 설명의 균형 부족
```

---

## 14.3 카드 정보 밀도 개선

기존 카드:

```txt
- 시리즈
- 대회명
- 기간
- 상태
- 간단 설명
```

개선 카드:

```txt
- 시리즈
- 대회명
- 국가/장소
- 기간
- 다음 주요 세션
- must watch 세션
- 전년도 우승자
- 관전 키워드 2~3개
- open briefing 링크
```

---

## 15. 최종 추가 개발 정의

RaceNote 추가 개발은 다음을 만족하면 1차 완성으로 본다.

```txt
1. 사용자는 레이스 상세에서 일정 외에도 경기 핵심 정보를 볼 수 있다.
2. 사용자는 이번 경기의 트랙/스테이지 특징을 이해할 수 있다.
3. 사용자는 전년도 우승자와 주요 기록을 볼 수 있다.
4. 사용자는 현재 순위와 주목할 팀/드라이버를 볼 수 있다.
5. 사용자는 다음 경기로 자연스럽게 이동할 수 있다.
6. F1 페이지에서 팀, 드라이버, 순위를 탐색할 수 있다.
7. 관리자는 레이스 확장 정보, 팀, 드라이버, 순위를 직접 관리할 수 있다.
8. 이미지는 사용하지 않고 텍스트/컬러/타이포그래피 중심의 정체성을 유지한다.
```

---

## 16. 한 줄 결론

```txt
RaceNote의 추가 개발 방향은 “일정 확인 서비스”가 아니라 “레이스 보기 전 읽는 한국어 브리핑 서비스”로 확장하는 것이다.
```
