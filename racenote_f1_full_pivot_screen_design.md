# RaceNote F1 중심 전면 재설계안

## 0. 결론

RaceNote는 기존의 F1 / WEC / WRC 통합 브리핑 구조를 잠시 내려놓고, 먼저 **F1 정보 허브**로 전면 재설계한다.

기존 방향은 “이번 주 레이스 브리핑”이라는 감성은 좋았지만, 실제 화면에서는 다음 문제가 반복됐다.

- 홈, F1, 캘린더, 시리즈, 상세 페이지의 역할이 겹침
- 사용자가 사이트에 들어왔을 때 “무엇을 보여주려는 서비스인지” 명확하지 않음
- F1 정보를 깊게 주려는 목표와 WEC/WRC 통합 브리핑 목표가 충돌함
- 순위, 드라이버, 팀, 결과, 스케줄 같은 F1 팬덤 핵심 정보가 약함
- 입문자용 설명과 팬용 데이터가 섞여 정보 구조가 흐려짐

따라서 RaceNote의 1차 완성 목표를 다음으로 재정의한다.

```txt
RaceNote는 F1을 처음 보는 사람도
이번 시즌, 다음 경기, 순위, 드라이버, 팀, 규칙을 한 번에 이해할 수 있게 돕는
한국어 F1 가이드 & 시즌 허브다.
```

WEC/WRC는 삭제가 아니라 **보류**한다. F1 구조가 안정된 뒤 같은 패턴으로 확장한다.

---

## 1. 재설계 기준

## 1.1 참고 구조

Formula1.com의 큰 정보 구조는 다음과 같이 나뉜다.

```txt
- 메인
- 스케줄
- 결과
- 드라이버
- 팀
- F1 입문 / 규칙 / 용어
```

RaceNote는 공식 사이트처럼 이미지, 영상, 뉴스, 공식 로고, 드라이버 사진을 사용할 수 없다. 대신 구조만 참고한다.

RaceNote에서는 다음처럼 재구성한다.

```txt
공식 사이트 구조
메인 + 스케줄 + 결과 + 드라이버 + 팀 + 가이드

RaceNote 구조
메인 = F1 시즌 허브 + 스케줄 + 결과 + 순위 요약
드라이버 = 드라이버 목록 + 드라이버 상세
팀 = 팀 목록 + 팀 상세
가이드 = F1 입문 설명
```

즉, RaceNote의 메인은 단순 랜딩 페이지가 아니라 **F1 시즌 대시보드**가 된다.

---

## 2. 최종 서비스 구조

## 2.1 공개 라우팅

```txt
/
/f1/drivers
/f1/drivers/[slug]
/f1/teams
/f1/teams/[slug]
/f1/guide
/f1/races/[slug]
```

### 보류 또는 숨김 처리

```txt
/calendar
/series
/series/wec
/series/wrc
```

기존 페이지를 바로 삭제하지는 않는다. 다만 공개 내비게이션에서는 F1 중심 구조가 안정될 때까지 제외한다.

---

## 2.2 내비게이션

기존:

```txt
THIS WEEK / F1 / CALENDAR / SERIES
```

변경:

```txt
F1 / DRIVERS / TEAMS / GUIDE
```

또는 메인 진입을 명확히 하려면 다음처럼 둔다.

```txt
SEASON / DRIVERS / TEAMS / GUIDE
```

권장안:

```txt
SEASON / DRIVERS / TEAMS / GUIDE
```

이유:

- `SEASON`은 메인 페이지가 단순 홈이 아니라 시즌 정보 허브라는 것을 보여줌
- `DRIVERS`, `TEAMS`는 팬덤 탐색의 핵심 진입점
- `GUIDE`는 입문자용 설명 페이지로 역할이 명확함
- `CALENDAR`, `SERIES`는 현재 우선순위에서 밀림

---

## 3. 페이지 역할 재정의

## 3.1 `/` — F1 Season Hub

### 역할

메인 페이지는 다음 세 가지를 한 화면에서 해결한다.

```txt
1. 지금 F1 시즌이 어떻게 흘러가고 있는가?
2. 다음 경기는 언제, 어디서 열리는가?
3. 최근 결과와 현재 순위는 어떤가?
```

기존 홈처럼 브랜드 감성만 보여주는 페이지가 아니다. Formula1.com의 메인, 스케줄, 결과를 RaceNote 방식으로 합친다.

### 사용자 질문

```txt
- 지금 다음 F1 경기는 뭐야?
- 이번 시즌 순위는 어떻게 돼?
- 지난 경기 결과는 어땠어?
- 전체 시즌 일정은 어떻게 남았어?
- 처음 보면 어디서부터 보면 돼?
```

---

## 3.2 `/f1/drivers` — Driver Index

### 역할

F1 드라이버를 순위, 팀, 국적, 포인트, 특징 중심으로 보여준다.

### 사용자 질문

```txt
- 지금 누가 잘하고 있어?
- 이 드라이버는 어느 팀이야?
- 어떤 스타일의 드라이버야?
- 처음 보면 누구를 보면 좋아?
```

---

## 3.3 `/f1/teams` — Team Index

### 역할

F1 팀을 순위, 포인트, 드라이버 2명, 머신, 팀 특징 중심으로 보여준다.

### 사용자 질문

```txt
- 어떤 팀들이 있어?
- 지금 어느 팀이 강해?
- 각 팀 드라이버는 누구야?
- 이 팀은 어떤 스타일이야?
```

---

## 3.4 `/f1/guide` — Beginner Guide

### 역할

F1 입문자가 경기 보기 전에 알아야 하는 기본 개념을 설명한다.

### 사용자 질문

```txt
- F1은 어떻게 보는 거야?
- 예선은 왜 중요해?
- DRS가 뭐야?
- 피트스톱은 왜 해?
- 타이어 전략은 뭔데?
- 포인트는 어떻게 계산해?
```

---

## 3.5 `/f1/races/[slug]` — Race Detail

### 역할

특정 그랑프리의 상세 브리핑을 제공한다.

### 사용자 질문

```txt
- 이 경기는 언제 봐야 해?
- 이 트랙은 뭐가 재밌어?
- 누가 유리할 수 있어?
- 지난 결과는 어땠어?
- 이 경기는 시즌에서 왜 중요해?
```

레이스 상세는 메인보다 깊은 설명을 담당한다. 메인에서 모든 것을 설명하지 않는다.

---

# 4. 메인 화면 설계

## 4.1 화면 목표

메인은 기존 RaceNote의 가장 큰 혼란을 해결해야 한다.

기존 문제:

```txt
- 첫 화면은 멋있지만 정보가 늦게 나옴
- F1/WEC/WRC가 동시에 보여 중심이 흐림
- 스케줄, 결과, 순위, 팀, 드라이버가 분리되어 있지 않음
```

변경 목표:

```txt
- 들어오자마자 F1 시즌 사이트로 인식되어야 함
- 다음 경기, 현재 순위, 최근 결과, 시즌 일정이 바로 보여야 함
- 드라이버/팀/가이드로 자연스럽게 이동해야 함
```

---

## 4.2 메인 섹션 구조

```txt
01. Season Hero
02. Next Race
03. Standings Preview
04. Season Schedule
05. Latest Result
06. Drivers Preview
07. Teams Preview
08. Beginner Guide CTA
```

---

## 4.3 01. Season Hero

### 목적

RaceNote가 F1 시즌 허브라는 것을 첫 화면에서 선언한다.

### 구성

```txt
2026 F1 SEASON
한국 시간 기준으로 정리한 F1 시즌 브리핑.
다음 경기, 현재 순위, 결과, 드라이버와 팀 정보를 한 번에 확인합니다.

NEXT ROUND
Austrian Grand Prix
06.26 - 06.28 · Spielberg
```

### 디자인 방향

- 기존 RaceNote의 큰 타이포그래피 유지
- 하지만 HERO가 화면 전체를 잡아먹지 않음
- 상단에서 바로 다음 경기와 시즌 상태를 보여줌

---

## 4.4 02. Next Race

### 목적

사용자가 가장 먼저 알고 싶은 “다음 경기”를 보여준다.

### 구성

```txt
NEXT RACE
Austrian Grand Prix
Round 8 · Red Bull Ring · Austria
06.26 - 06.28 KST

Watch First
- Qualifying
- Race Start
- Final 10 Laps

Key Points
01. 짧은 랩타임으로 트래픽 영향이 큽니다.
02. 고저차와 코너 탈출 속도가 중요합니다.
03. 트랙 리밋과 타이어 관리가 변수입니다.

OPEN RACE BRIEFING →
```

### 주의

메인에서는 너무 긴 트랙 설명을 넣지 않는다. 상세 브리핑으로 이동시킨다.

---

## 4.5 03. Standings Preview

### 목적

F1 정보 사이트처럼 보이게 만드는 핵심 섹션이다.

### 구조

```txt
STANDINGS
[DRIVERS] [TEAMS]

Top 3 Podium Cards
- 1위 카드 크게
- 2위, 3위 카드 보조

Ranking Table
- Pos
- Driver / Team
- Nationality 또는 Drivers
- Team
- Points

VIEW FULL STANDINGS →
```

### 드라이버 탭 카드 예시

```txt
01
Kimi Antonelli
Mercedes
Italy
156 PTS

02
Lewis Hamilton
Ferrari
United Kingdom
115 PTS

03
George Russell
Mercedes
United Kingdom
106 PTS
```

### 팀 탭 카드 예시

```txt
01
Mercedes
262 PTS
George Russell / Kimi Antonelli

02
Ferrari
190 PTS
Charles Leclerc / Lewis Hamilton

03
McLaren
141 PTS
Lando Norris / Oscar Piastri
```

### 이미지 대체 전략

공식 드라이버 사진과 머신 이미지는 사용하지 않는다.

대체 요소:

```txt
- 팀 컬러 배경
- 직접 제작한 추상 실루엣
- 차량 번호
- 국기 이모지 또는 텍스트
- 순위 숫자
- 포인트
- 팀 컬러 라인
```

---

## 4.6 04. Season Schedule

### 목적

Formula1.com의 racing 페이지처럼 라운드별 시즌 흐름을 보여준다.

### 구조

```txt
SEASON SCHEDULE
[ALL] [UPCOMING] [COMPLETED]

Round Cards Grid
- Round number
- Country
- Grand Prix name
- Date range
- Status
- Winner / Top 3 if completed
- Next Race badge if upcoming
- Circuit outline if 직접 제작 가능
```

### 카드 예시

```txt
ROUND 08
Austria
FORMULA 1 AUSTRIAN GRAND PRIX 2026
26 - 28 JUN
NEXT RACE

OPEN BRIEFING →
```

### 완료된 경기 카드 예시

```txt
ROUND 07
Barcelona-Catalunya
12 - 14 JUN

Result
1 HAM
2 RUS
3 NOR

OPEN RESULT →
```

### 디자인 방향

- 현재 RaceNote의 얇은 라인 카드보다 정보 밀도를 높임
- 카드 배경은 어둡게 또는 RaceNote 라이트 톤 유지 가능
- 중요한 것은 “라운드별 시즌 지도”처럼 보여야 함

---

## 4.7 05. Latest Result

### 목적

결과 페이지를 따로 빼기 전에 메인에서 최근 경기 결과를 보여준다.

### 구성

```txt
LATEST RESULT
Barcelona-Catalunya Grand Prix
Race · 06.14

Top 3
01 Lewis Hamilton · Ferrari
02 George Russell · Mercedes
03 Lando Norris · McLaren

Result Table
- Pos
- Driver
- Team
- Time / Gap
- Points

VIEW ALL RESULTS →
```

### 추후 확장

결과 데이터가 충분해지면 `/f1/results`를 분리할 수 있다. 지금은 메인 안에 포함한다.

---

## 4.8 06. Drivers Preview

### 목적

드라이버 페이지로 보내는 진입점이다.

### 구성

```txt
DRIVERS TO KNOW
- 현재 순위 TOP 5
- 입문자가 보기 좋은 드라이버 3명
- 루키 / 챔피언 / 인기 드라이버 구분 가능
```

### 카드 예시

```txt
Max Verstappen
Red Bull Racing
#1
공격적인 레이스 운영과 강한 일관성이 특징입니다.

OPEN DRIVER →
```

---

## 4.9 07. Teams Preview

### 목적

팀 페이지로 보내는 진입점이다.

### 구성

```txt
TEAMS
- 컨스트럭터 순위 TOP 5
- 팀 컬러 카드
- 드라이버 2명
- 머신명
```

---

## 4.10 08. Beginner Guide CTA

### 목적

입문자를 가이드 페이지로 보낸다.

### 구성

```txt
NEW TO F1?
처음이라면 아래 순서로 보면 쉽습니다.

01 Qualifying
02 Race Start
03 Pit Stop
04 Safety Car
05 Final 10 Laps

OPEN F1 GUIDE →
```

---

# 5. 드라이버 페이지 설계

## 5.1 `/f1/drivers`

### 구조

```txt
01. Drivers Hero
02. Standings Podium
03. Driver Table
04. Driver Cards
05. Beginner Picks
```

### 01. Drivers Hero

```txt
F1 DRIVERS
2026 시즌 드라이버 순위와 각 드라이버의 특징을 정리합니다.
```

### 02. Standings Podium

상위 3명을 카드로 강조한다.

```txt
01 Driver Name
Team
Nationality
Points

02 Driver Name
Team
Nationality
Points

03 Driver Name
Team
Nationality
Points
```

### 03. Driver Table

```txt
POS. | DRIVER | NATIONALITY | TEAM | PTS.
```

### 04. Driver Cards

드라이버별 상세 이동 카드.

```txt
Driver Name
Team
#Number
Nationality
Driving Style
OPEN DRIVER NOTE →
```

### 05. Beginner Picks

```txt
처음 보면 좋은 드라이버
- 우승 후보
- 예선 강자
- 루키
- 전략적으로 보는 재미가 있는 드라이버
```

---

## 5.2 `/f1/drivers/[slug]`

### 구조

```txt
01. Driver Hero
02. Season Stats
03. Driving Style
04. This Season
05. Team Connection
06. Related Races
```

### 상세 구성

```txt
Driver Hero
- 이름
- 번호
- 국적
- 팀
- 현재 순위
- 포인트

Season Stats
- Points
- Wins
- Podiums
- Poles
- Fastest Laps

Driving Style
- 강점
- 약점
- 잘 맞는 트랙

This Season
- 현재 흐름
- 최근 3경기 결과

Team Connection
- 소속팀 카드

Related Races
- 이 드라이버가 중요하게 볼 만한 다음 경기
```

---

# 6. 팀 페이지 설계

## 6.1 `/f1/teams`

### 구조

```txt
01. Teams Hero
02. Constructor Podium
03. Team Table
04. Team Cards
```

### 01. Teams Hero

```txt
F1 TEAMS
2026 시즌 컨스트럭터 순위와 팀별 드라이버, 머신 특징을 정리합니다.
```

### 02. Constructor Podium

상위 3팀을 크게 보여준다.

```txt
01 Mercedes
262 PTS
George Russell / Kimi Antonelli

02 Ferrari
190 PTS
Charles Leclerc / Lewis Hamilton

03 McLaren
141 PTS
Lando Norris / Oscar Piastri
```

### 03. Team Table

```txt
POS. | TEAM | DRIVERS | CAR | PTS.
```

### 04. Team Cards

```txt
Team Name
P/01 · 262 PTS
Drivers: A / B
Car: W17

팀 성향 한 줄
OPEN TEAM NOTE →
```

---

## 6.2 `/f1/teams/[slug]`

### 구조

```txt
01. Team Hero
02. Current Drivers
03. Car
04. Season Form
05. Team Character
06. Related Races
```

### 상세 구성

```txt
Team Hero
- 팀명
- 현재 순위
- 포인트
- 국적 / 베이스

Current Drivers
- 드라이버 2명

Car
- 머신명
- 파워유닛
- 강점
- 약점

Season Form
- 최근 결과
- 우승
- 포디움
- 폴 포지션

Team Character
- 이 팀을 볼 때 재밌는 포인트

Related Races
- 이 팀에게 유리할 수 있는 다음 경기
```

---

# 7. 가이드 페이지 설계

## 7.1 `/f1/guide`

### 목적

입문자가 F1을 보기 전에 필요한 정보를 빠르게 이해하게 한다.

### 구조

```txt
01. Guide Hero
02. How a Race Weekend Works
03. What to Watch First
04. Key Rules
05. Strategy Basics
06. Terms Glossary
07. Start Watching CTA
```

### 02. How a Race Weekend Works

```txt
Practice
차와 트랙을 맞춰보는 시간입니다.

Qualifying
결승 출발 순서를 정하는 세션입니다.

Race
포인트가 걸린 본 경기입니다.
```

### 03. What to Watch First

```txt
처음이면 이 순서로 보세요.

01 Qualifying
02 Race Start
03 Pit Stop Window
04 Safety Car
05 Final 10 Laps
```

### 04. Key Rules

```txt
- 포인트
- 예선
- 타이어
- DRS
- 피트스톱
- 세이프티카
- 트랙 리밋
- 페널티
```

### 05. Strategy Basics

```txt
- 왜 타이어를 바꾸는가?
- 언더컷과 오버컷은 무엇인가?
- 세이프티카가 왜 변수가 되는가?
- 비가 오면 왜 전략이 흔들리는가?
```

---

# 8. 레이스 상세 페이지 재정의

## 8.1 `/f1/races/[slug]`

현재 상세 페이지는 유지하되, 역할을 명확히 한다.

메인에서 모든 정보를 보여주고, 상세는 다음을 깊게 설명한다.

```txt
- 세션별 시간
- 트랙 특성
- 관전 포인트
- 주목할 팀/드라이버
- 결과 또는 예상 흐름
- 히스토리
```

### 구조

```txt
01. Race Hero
02. Watch First
03. Schedule
04. Track Briefing
05. Standings Context
06. Who to Watch
07. History
08. Result / Previous Result
09. Next Race
```

### 02. Watch First

```txt
처음 보는 사람은 이것부터 보면 됩니다.

01 Qualifying
02 Race Start
03 Pit Stop Window
```

### 04. Track Briefing

```txt
Quick Facts
- Circuit
- Track Length
- Laps
- Corners
- DRS Zones
- Race Distance

Track Key
- 추월 난이도
- 타이어 부담
- 브레이크 부담
- 날씨 변수
```

### 05. Standings Context

```txt
현재 순위에서 이 경기가 중요한 이유
- 드라이버 챔피언십 영향
- 컨스트럭터 순위 영향
- 특정 팀/드라이버의 반등 여부
```

---

# 9. 데이터 설계 보완

기존 v2 설계의 핵심 테이블은 유지한다.

```txt
teams
 drivers
cars
standings
race_facts
race_history
race_watch_targets
```

다만 공식 결과 페이지 구조를 메인에 합치려면 결과 전용 데이터가 필요하다.

## 9.1 추가 필요 테이블: race_results

```sql
CREATE TABLE race_results (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL,
  season INTEGER NOT NULL,
  session_type TEXT NOT NULL,
  position INTEGER NOT NULL,
  driver_id TEXT,
  driver_name TEXT NOT NULL,
  team_id TEXT,
  team_name TEXT,
  grid_position INTEGER,
  time_or_gap TEXT,
  points REAL DEFAULT 0,
  status TEXT,
  source_key TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (race_id) REFERENCES races(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

### session_type

```txt
race
qualifying
sprint
sprint_qualifying
practice
```

처음에는 `race`만 저장해도 된다.

---

## 9.2 standings 보완

기존 `standings`는 유지한다.

필요 표시 데이터:

```txt
- driver standings
- constructor standings
- wins
- podiums
- poles
- fastest_laps
- points
- updated_at
```

---

## 9.3 teams 보완

팀 카드에 필요한 필드:

```txt
- team color
- second color
- short name
- current car name
- driver 1
- driver 2
- constructor position
- points
- beginner note
```

---

## 9.4 drivers 보완

드라이버 카드에 필요한 필드:

```txt
- driver number
- nationality
- team
- current position
- points
- driving style
- beginner note
- strengths
- weaknesses
```

---

# 10. 관리자 설계 변경

관리자는 기존 레이스 편집 중심에서 F1 시즌 데이터 관리 중심으로 확장한다.

## 10.1 관리자 내비게이션

```txt
Dashboard
Races
Results
Standings
Drivers
Teams
Guide
Sync
```

---

## 10.2 Dashboard

```txt
- 다음 F1 경기
- 입력 누락된 경기 수
- 결과 미입력 경기 수
- 순위 마지막 갱신 시간
- 드라이버/팀 데이터 입력 현황
- AI 초안 검수 필요 수
```

---

## 10.3 Results 관리

```txt
/admin/results

- 시즌 선택
- 라운드 선택
- 세션 선택
- 결과 테이블 입력/수정
- Top 3 자동 메인 반영
```

---

## 10.4 Standings 관리

```txt
/admin/standings

- Driver / Constructor 탭
- 순위
- 포인트
- 우승
- 포디움
- 폴
- 패스티스트 랩
- 마지막 갱신 시간
```

---

## 10.5 Drivers 관리

```txt
/admin/drivers

- 드라이버명
- 번호
- 국적
- 팀
- 설명
- 드라이빙 스타일
- 입문자 노트
- 공개 여부
```

---

## 10.6 Teams 관리

```txt
/admin/teams

- 팀명
- 컬러
- 드라이버 2명
- 머신명
- 팀 설명
- 입문자 노트
- 공개 여부
```

---

# 11. 디자인 방향

## 11.1 유지할 RaceNote 정체성

```txt
- 이미지 없는 정보 중심 구성
- 큰 타이포그래피
- 얇은 라인
- 모노스페이스 숫자
- 저채도 배경
- 팀 컬러 포인트
- 카드와 테이블의 조합
```

---

## 11.2 버릴 것

```txt
- 너무 긴 브랜드형 Hero
- 의미만 있는 섹션 번호
- WEC/WRC를 메인에서 동등하게 노출하는 구조
- 모든 페이지에 How to Watch 반복
- 상세 페이지를 문서처럼 길게 늘리는 구조
- 카드마다 설명만 있고 데이터가 없는 구조
```

---

## 11.3 새 디자인 핵심

```txt
F1 공식 사이트의 정보 구조 + RaceNote의 텍스트 브리핑 감성
```

공식 사이트처럼 화려한 이미지 중심으로 가지 않는다.

RaceNote는 다음 방식으로 차별화한다.

```txt
- 한국 시간 기준
- 한국어 입문 설명
- 공식 사이트보다 압축된 시즌 흐름
- 이미지 없이도 이해되는 순위/팀/드라이버 카드
- 경기 전 읽는 브리핑 문장
```

---

# 12. 개발 우선순위 재정렬

## Phase 0. 기존 방향 정리

```txt
1. 공개 내비게이션에서 Calendar / Series 우선순위 제거
2. WEC/WRC 메인 노출 제거 또는 하단 보류
3. 홈을 F1 Season Hub로 재정의
4. 기존 This Week 중심 문구 제거
```

---

## Phase 1. 메인 전면 교체

```txt
1. Season Hero
2. Next Race
3. Standings Preview
4. Season Schedule
5. Latest Result
6. Drivers Preview
7. Teams Preview
8. Guide CTA
```

완료 기준:

```txt
- 메인만 봐도 F1 사이트라는 것이 명확하다.
- 다음 경기, 순위, 시즌 일정, 최근 결과가 한 화면에 있다.
- 드라이버/팀/가이드로 이동할 수 있다.
```

---

## Phase 2. 데이터 기반 구축

```txt
1. teams 테이블 확정
2. drivers 테이블 확정
3. standings 테이블 확정
4. race_results 테이블 추가
5. F1 seed 데이터 입력
6. 관리자 standings/results 입력 기능 추가
```

완료 기준:

```txt
- 드라이버 순위가 표시된다.
- 팀 순위가 표시된다.
- 최근 경기 결과가 표시된다.
- 시즌 일정 카드에 완료/예정 상태가 표시된다.
```

---

## Phase 3. Drivers / Teams 페이지

```txt
1. /f1/drivers
2. /f1/drivers/[slug]
3. /f1/teams
4. /f1/teams/[slug]
```

완료 기준:

```txt
- 드라이버 목록과 상세를 볼 수 있다.
- 팀 목록과 상세를 볼 수 있다.
- 메인에서 드라이버/팀 페이지로 자연스럽게 이동한다.
```

---

## Phase 4. Guide 페이지

```txt
1. /f1/guide
2. F1 기본 규칙
3. 경기 주말 흐름
4. 용어 설명
5. 처음 보는 순서
```

완료 기준:

```txt
- 입문자가 F1 경기를 보기 위한 기본 지식을 얻을 수 있다.
- 상세 페이지에서 모르는 용어를 Guide로 연결할 수 있다.
```

---

## Phase 5. Race Detail 정리

```txt
1. /f1/races/[slug]로 라우팅 정리
2. Watch First 상단 배치
3. Track Briefing 정리
4. Standings Context 추가
5. Result 연결
```

완료 기준:

```txt
- 메인 일정 카드에서 상세 브리핑으로 이동한다.
- 경기별로 왜 봐야 하는지 명확하다.
```

---

## Phase 6. WEC/WRC 복귀

F1 구조가 안정된 뒤 다음 순서로 확장한다.

```txt
1. /motorsport 또는 /series 복구
2. WEC 시즌 허브
3. WRC 시즌 허브
4. WEC/WRC 가이드
5. WEC/WRC 상세 브리핑
```

단, F1과 동일한 템플릿을 억지로 쓰지 않는다.

```txt
F1 = 순위 / 팀 / 드라이버 / 전략
WEC = 클래스 / 내구 / 제조사 / 시간대
WRC = 스테이지 / 노면 / 기록 / 페이스노트
```

---

# 13. 최종 화면 지도

```txt
SEASON (/)
├─ Next Race
├─ Standings
├─ Schedule
├─ Latest Result
├─ Drivers Preview
├─ Teams Preview
└─ Guide CTA

DRIVERS (/f1/drivers)
├─ Driver standings
├─ Driver table
├─ Driver cards
└─ Driver detail

TEAMS (/f1/teams)
├─ Constructor standings
├─ Team table
├─ Team cards
└─ Team detail

GUIDE (/f1/guide)
├─ Race weekend
├─ Qualifying
├─ Race
├─ Tyre
├─ DRS
├─ Pit stop
├─ Safety car
└─ Points

RACE DETAIL (/f1/races/[slug])
├─ Watch first
├─ Schedule
├─ Track briefing
├─ Who to watch
├─ Standings context
├─ History
└─ Result
```

---

# 14. 한 줄 결론

```txt
RaceNote는 지금부터 F1/WEC/WRC 통합 브리핑이 아니라,
F1 시즌을 한국어로 이해시키는 정보 허브로 갈아엎는다.

메인은 Formula1.com의 메인 + 스케줄 + 결과를 RaceNote 방식으로 합친다.
드라이버와 팀은 별도 페이지로 분리한다.
가이드는 F1 입문 지식을 담당한다.
WEC/WRC는 F1 구조가 안정된 뒤 확장한다.
```
