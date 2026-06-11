# RaceNote MVP 설계서

## 1. 프로젝트 개요

### 1.1 서비스명

**RaceNote**

> F1, WEC, WRC 일정을 한국 시간으로 모아 보여주고, 입문자도 쉽게 볼 수 있도록 관전 포인트를 제공하는 모터스포츠 캘린더 서비스

---

### 1.2 서비스 한 줄 정의

**이번 주 볼만한 레이스와 꼭 봐야 하는 세션을 한국어로 알려주는 모터스포츠 큐레이션 서비스**

---

### 1.3 서비스 목적

F1, WEC, WRC에 관심이 생긴 사용자가 각 시리즈의 일정을 따로 찾아보지 않아도, 한 곳에서 다음 내용을 확인할 수 있도록 한다.

- 이번 주 열리는 레이스
- 한국 시간 기준 세션 일정
- 꼭 봐야 하는 세션
- 입문자용 관전 포인트
- 처음 보면 헷갈리는 규칙
- 시리즈별 기본 개념

서비스의 핵심은 단순 일정 제공이 아니라, **“왜 이 레이스를 봐야 하는지”를 알려주는 것**이다.

---

## 2. MVP 범위

### 2.1 MVP 핵심 목표

MVP 단계에서는 회원 기능보다 서비스의 핵심 가치 검증에 집중한다.

> 사용자가 RaceNote에 들어와서 “이번 주에 어떤 레이스를 보면 되는지” 바로 이해할 수 있는가?

---

### 2.2 MVP 포함 기능

| 구분 | 기능 | 포함 여부 |
| --- | --- | --- |
| 공개 페이지 | 이번 주 레이스 | 포함 |
| 공개 페이지 | F1 / WEC / WRC 통합 일정 | 포함 |
| 공개 페이지 | 한국 시간 기준 세션 표시 | 포함 |
| 공개 페이지 | 꼭 봐야 하는 세션 표시 | 포함 |
| 공개 페이지 | 레이스 상세 페이지 | 포함 |
| 공개 페이지 | AI 기반 관전 포인트 노출 | 포함 |
| 공개 페이지 | 시리즈별 설명 카드 | 포함 |
| 관리자 | 관리자 로그인 | 포함 |
| 관리자 | 수집된 일정 확인 | 포함 |
| 관리자 | 레이스/세션 수정 | 포함 |
| 관리자 | 꼭 봐야 하는 세션 체크 | 포함 |
| 관리자 | AI 문구 생성/검수/수정 | 포함 |
| 자동화 | 일정 하루 2회 수집 | 포함 |
| 자동화 | AI 문구 하루 1회 생성 | 포함 |
| 자동화 | 수집 로그 저장 | 포함 |

---

### 2.3 MVP 제외 기능

| 기능 | 제외 이유 |
| --- | --- |
| 회원가입 | MVP 핵심 검증 이후 도입 |
| 찜 기능 | 회원 기능 필요 |
| 알림 기능 | 푸시/메일/스케줄 관리 부담 |
| 개인 시청 로그 | 회원 기능 필요 |
| 좋아하는 팀/드라이버 저장 | 회원 기능 필요 |
| 실시간 순위 | 데이터 확보 난이도 높음 |
| 실시간 랩타임 | 현재 단계 범위 초과 |
| 경기 결과 자동 분석 | 안정적인 결과 데이터 필요 |
| 이미지/썸네일 | 저작권 리스크 |
| 댓글/커뮤니티 | 운영 부담 |

---

## 3. 기술 스택

### 3.1 기본 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | Next.js |
| Styling | SCSS |
| CSS 방식 | BEM Naming |
| CSS Module | 사용하지 않음 |
| Database | Cloudflare D1 |
| ORM | Drizzle ORM |
| Hosting | Cloudflare Pages 또는 Workers |
| Scheduler | Cloudflare Cron Triggers |
| AI | OpenAI API 또는 대체 LLM API |
| Auth | 관리자 비밀번호 기반 세션 |

---

### 3.2 스타일 정책

Tailwind CSS는 사용하지 않는다.  
CSS Module도 사용하지 않는다.

스타일은 전역 SCSS 구조와 BEM 네이밍을 사용한다.

```txt
src/
  app/
  components/
    RaceCard/
      RaceCard.tsx
      RaceCard.scss
    RaceCalendar/
      RaceCalendar.tsx
      RaceCalendar.scss
    SeriesBadge/
      SeriesBadge.tsx
      SeriesBadge.scss
  styles/
    abstracts/
      _variables.scss
      _mixins.scss
    base/
      _reset.scss
      _typography.scss
    layouts/
      _container.scss
    globals.scss
```

### 3.3 BEM 예시

```scss
.race-card {
  padding: 20px;
  border-radius: 20px;
  background: #111318;

  &__header {
    display: flex;
    justify-content: space-between;
  }

  &__series {
    font-size: 12px;
    font-weight: 700;
  }

  &__title {
    margin-top: 8px;
    font-size: 20px;
  }

  &__meta {
    margin-top: 12px;
    color: #9ca3af;
  }

  &--f1 {
    border-left: 4px solid #e10600;
  }

  &--wec {
    border-left: 4px solid #0057ff;
  }

  &--wrc {
    border-left: 4px solid #00a651;
  }
}
```

---

## 4. 서비스 구조

### 4.1 공개 사용자 플로우

```txt
사용자 접속
→ 홈에서 이번 주 레이스 확인
→ 관심 있는 레이스 선택
→ 레이스 상세 진입
→ 한국 시간 세션 확인
→ 꼭 봐야 하는 세션 확인
→ 관전 포인트 확인
```

---

### 4.2 관리자 플로우

```txt
관리자 로그인
→ 수집된 일정 확인
→ 레이스/세션 정보 검수
→ 꼭 봐야 하는 세션 체크
→ AI 문구 생성 또는 확인
→ 문구 수정
→ 공개 상태 변경
```

---

### 4.3 자동화 플로우

```txt
Cloudflare Cron 실행
→ F1 / WEC / WRC 일정 소스 조회
→ 일정 파싱
→ 기존 DB와 비교
→ 신규/변경 데이터 저장
→ sync_logs 저장
```

AI 문구 생성은 별도 cron으로 실행한다.

```txt
Cloudflare Cron 실행
→ 앞으로 14일 이내 레이스 조회
→ AI 문구가 필요한 레이스 필터링
→ AI 문구 생성
→ generated 상태로 저장
→ 관리자 검수 대기
```

---

## 5. 주요 화면 설계

## 5.1 홈

### 목적

사용자가 접속하자마자 이번 주에 볼만한 레이스를 알 수 있게 한다.

### 주요 구성

- 히어로 영역
- 이번 주 레이스
- 오늘 볼만한 세션
- 곧 시작하는 세션
- 시리즈별 바로가기
- 입문자 안내 카드

### 예시 UI 구조

```txt
RaceNote
이번 주 볼만한 레이스를 한눈에 확인하세요.

[이번 주 레이스]

[F1] Japanese Grand Prix
3월 27일 - 3월 29일
꼭 봐야 하는 세션: Qualifying, Race
관전 포인트: 고속 코너와 타이어 전략이 중요한 레이스입니다.

[WEC] 24 Hours of Le Mans
6월 13일 - 6월 14일
꼭 봐야 하는 세션: Start, Night Stint, Final Hour
관전 포인트: 내구성, 야간 주행, 피트 전략이 승부를 가릅니다.

[WRC] Rally Finland
7월 30일 - 8월 2일
꼭 봐야 하는 세션: Power Stage
관전 포인트: 고속 점프와 페이스노트 정확도가 핵심입니다.
```

---

## 5.2 통합 캘린더

### 목적

F1, WEC, WRC 일정을 한 곳에서 확인한다.

### 필터

- 전체
- F1
- WEC
- WRC
- 이번 주
- 이번 달

### 일정 카드 정보

| 항목 | 설명 |
| --- | --- |
| 시리즈 | F1 / WEC / WRC |
| 대회명 | Japanese Grand Prix, 24 Hours of Le Mans 등 |
| 국가 | Japan, France, Finland 등 |
| 장소 | 서킷명 또는 랠리 지역 |
| 기간 | 시작일 ~ 종료일 |
| 상태 | 예정 / 진행중 / 종료 / 취소 |
| 꼭 봐야 하는 세션 | Qualifying, Race, Power Stage 등 |

---

## 5.3 레이스 상세

### 목적

사용자가 해당 레이스를 왜 봐야 하는지 이해할 수 있게 한다.

### 주요 구성

- 레이스 기본 정보
- 세션 일정
- 꼭 봐야 하는 세션
- 이번 레이스 3줄 요약
- 누구를 보면 재밌는지
- 경기 변수
- 처음 보면 헷갈리는 규칙
- 시리즈 기본 설명

### F1 상세 예시

```txt
[F1] Japanese Grand Prix
Suzuka Circuit · Japan

일정
- Practice 1: 3월 27일 11:30 KST
- Practice 2: 3월 27일 15:00 KST
- Qualifying: 3월 28일 15:00 KST
- Race: 3월 29일 14:00 KST

꼭 봐야 하는 세션
- Qualifying
- Race

이번 레이스 3줄 요약
1. 스즈카는 드라이버 실력이 잘 드러나는 고속 서킷입니다.
2. 추월이 쉽지 않아 예선 순위와 타이어 전략이 중요합니다.
3. 날씨 변화가 생기면 경기 흐름이 크게 달라질 수 있습니다.

처음 보면 헷갈리는 규칙
- 예선 결과가 결승 출발 순서를 정합니다.
- 피트스톱에서 타이어를 바꾸며 전략 차이가 발생합니다.
```

### WEC 상세 예시

```txt
[WEC] 24 Hours of Le Mans
Circuit de la Sarthe · France

꼭 봐야 하는 세션
- Start
- Sunset
- Night Stint
- Sunrise
- Final Hour

이번 레이스 3줄 요약
1. 르망24는 24시간 동안 속도와 내구성을 동시에 겨루는 경기입니다.
2. 하이퍼카 클래스는 종합 우승을 노리는 최상위 클래스입니다.
3. 밤, 비, 세이프티카, 피트 전략이 결과를 크게 바꿀 수 있습니다.

처음 보면 헷갈리는 규칙
- 여러 클래스 차량이 동시에 달립니다.
- 전체 1등과 클래스별 1등이 따로 존재합니다.
- 한 명이 끝까지 운전하는 것이 아니라 여러 드라이버가 교대합니다.
```

### WRC 상세 예시

```txt
[WRC] Rally Finland
Finland

꼭 봐야 하는 세션
- Opening Stage
- Saturday Long Stage
- Power Stage

이번 레이스 3줄 요약
1. 랠리 핀란드는 고속 점프와 숲길로 유명한 대표적인 WRC 이벤트입니다.
2. 코드라이버의 페이스노트와 드라이버의 차체 제어가 매우 중요합니다.
3. 마지막 파워스테이지에서는 추가 포인트가 걸려 있어 끝까지 긴장감이 유지됩니다.

처음 보면 헷갈리는 규칙
- WRC는 여러 차가 동시에 트랙을 도는 방식이 아닙니다.
- 정해진 스테이지를 한 대씩 달리고 기록을 합산합니다.
- 파워스테이지는 보너스 포인트가 걸린 마지막 주요 스테이지입니다.
```

---

## 5.4 시리즈 소개 페이지

### 목적

F1, WEC, WRC를 처음 접하는 사용자가 각 시리즈의 차이를 이해할 수 있게 한다.

### 구성

- F1이란?
- WEC란?
- WRC란?
- 세 시리즈 비교
- 입문자가 먼저 보면 좋은 세션

### 비교 예시

| 시리즈 | 핵심 재미 | 입문 포인트 |
| --- | --- | --- |
| F1 | 드라이버, 팀, 전략, 예선 경쟁 | Qualifying과 Race 중심으로 보기 |
| WEC | 내구성, 제조사, 클래스, 피트 전략 | 르망24 Start와 Final Hour부터 보기 |
| WRC | 노면, 스테이지, 코드라이버, 차량 제어 | Power Stage부터 보기 |

---

## 6. 관리자 페이지 설계

## 6.1 관리자 인증

MVP에서는 별도 회원 시스템을 만들지 않는다.

관리자 접근은 환경변수 기반 비밀번호로 처리한다.

```txt
/admin/login
→ ADMIN_PASSWORD 입력
→ 검증 성공 시 httpOnly cookie 발급
→ /admin 접근 허용
```

### 환경변수

```txt
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
OPENAI_API_KEY=
```

---

## 6.2 관리자 대시보드

### 경로

```txt
/admin
```

### 표시 정보

- 이번 주 공개 레이스 수
- 검수 필요한 레이스 수
- AI 문구 생성 대기 수
- 최근 수집 성공/실패 상태
- 마지막 수집 시간
- 마지막 AI 생성 시간

---

## 6.3 일정 수집 관리

### 경로

```txt
/admin/sync
```

### 기능

- 수동 수집 실행
- 최근 수집 로그 확인
- 실패 로그 확인
- 소스별 활성/비활성 확인

### 수집 로그 예시

```txt
F1 Sync
status: success
added: 2
updated: 4
skipped: 20
finishedAt: 2026-06-11 09:00 KST
```

---

## 6.4 레이스 관리

### 경로

```txt
/admin/races
```

### 기능

- 레이스 목록
- 시리즈 필터
- 공개 상태 필터
- 검수 필요 필터
- 레이스 상세 이동

### 목록 표시 항목

| 항목 | 설명 |
| --- | --- |
| 시리즈 | F1 / WEC / WRC |
| 레이스명 | 대회명 |
| 기간 | 시작일 ~ 종료일 |
| 상태 | 예정 / 진행중 / 종료 |
| 공개 상태 | draft / published |
| AI 상태 | empty / generated / reviewed |
| 최근 변경 | 일정 변경 여부 |

---

## 6.5 레이스 상세 관리

### 경로

```txt
/admin/races/[id]
```

### 기능

- 레이스 기본 정보 수정
- 세션 목록 수정
- 꼭 봐야 하는 세션 체크
- 중요도 설정
- AI 문구 생성
- AI 문구 수정
- 공개 상태 변경

### AI 문구 관리 상태

```txt
empty
→ generated
→ needs_review
→ reviewed
→ published
```

검수 완료된 문구는 자동 작업으로 덮어쓰지 않는다.

---

## 7. 데이터 수집 정책

## 7.1 기본 원칙

일정은 전부 수동 입력하지 않는다.  
공식 캘린더, ICS, 공개 API, 공식 페이지를 우선 활용한다.

다만 외부 소스에서 가져온 데이터는 그대로 무조건 노출하지 않고, DB에 저장한 뒤 관리자 페이지에서 검수할 수 있게 한다.

---

## 7.2 수집 대상

| 시리즈 | 수집 대상 |
| --- | --- |
| F1 | 그랑프리 일정, 세션 일정, 스프린트 여부 |
| WEC | 라운드 일정, 주요 세션, 르망24 핵심 세션 |
| WRC | 랠리 일정, 주요 스테이지, 파워스테이지 |

---

## 7.3 수집 주기

Cloudflare Cron 기준으로 하루 2회 실행한다.

```txt
0 0 * * *   // 매일 09:00 KST
0 12 * * *  // 매일 21:00 KST
```

### 목적

| 시간 | 목적 |
| --- | --- |
| 09:00 KST | 당일/이번 주 일정 갱신 |
| 21:00 KST | 야간 경기 전 변경사항 반영 |

---

## 7.4 데이터 반영 방식

외부 데이터 수집 후 기존 DB와 비교한다.

```txt
외부 일정 수집
→ 파싱
→ 기존 DB 조회
→ 신규 데이터 추가
→ 변경 데이터 비교
→ 변경 로그 저장
→ 필요 시 관리자 검수 상태로 표시
```

### 자동 반영 기준

| 항목 | 자동 반영 여부 |
| --- | --- |
| 신규 레이스 | 가능 |
| 신규 세션 | 가능 |
| 세션 시간 변경 | 검수 필요 |
| 세션명 변경 | 검수 필요 |
| 취소/연기 상태 | 검수 필요 |
| 장소/국가 변경 | 검수 필요 |

---

## 8. AI 콘텐츠 생성 정책

## 8.1 AI 사용 방향

회원이 직접 AI를 사용하는 구조가 아니다.

AI는 운영자가 콘텐츠를 작성하는 시간을 줄이기 위해 사용한다.

```txt
관리자/크론 → AI 문구 생성 → 관리자 검수 → 사용자 노출
```

---

## 8.2 AI 생성 대상

| 항목 | 설명 |
| --- | --- |
| summaryThreeLines | 이번 레이스 3줄 요약 |
| keyDriversOrTeams | 누구를 보면 재밌는지 |
| raceVariables | 경기 변수 |
| beginnerRules | 처음 보면 헷갈리는 규칙 |
| mustWatchReason | 꼭 봐야 하는 이유 |
| notificationText | 짧은 알림형 문구 |
| seoTitle | SEO 제목 |
| seoDescription | SEO 설명 |

---

## 8.3 AI 생성 주기

하루 1회 실행한다.

```txt
0 1 * * *   // 매일 10:00 KST
```

---

## 8.4 AI 생성 대상 조건

앞으로 14일 이내 열리는 레이스 중 아래 조건에 해당하는 경우만 생성한다.

- AI 문구가 비어 있음
- 일정 변경으로 재생성 필요 상태가 됨
- 관리자가 재생성 요청함
- 레이스가 새로 추가됨

---

## 8.5 자동 덮어쓰기 금지

다음 상태의 콘텐츠는 자동으로 덮어쓰지 않는다.

- reviewed
- published

관리자가 직접 재생성을 요청한 경우에만 새 문구를 생성한다.

---

## 8.6 AI 프롬프트 예시

```txt
너는 한국어 모터스포츠 입문자를 위한 콘텐츠 에디터다.

아래 레이스 정보를 바탕으로 입문자도 이해할 수 있는 관전 포인트를 작성해라.

조건:
- 과장하지 말 것
- 확인되지 않은 사실은 단정하지 말 것
- 전문 용어는 쉽게 풀어쓸 것
- 문장은 짧게 작성할 것
- 한국어 기준으로 자연스럽게 작성할 것
- 결과는 JSON 형식으로만 반환할 것

레이스 정보:
시리즈: {seriesName}
대회명: {raceName}
장소: {location}
일정: {startDate} ~ {endDate}
중요 세션: {mustWatchSessions}
기본 설명: {adminMemo}

반환 형식:
{
  "summaryThreeLines": ["", "", ""],
  "keyDriversOrTeams": "",
  "raceVariables": "",
  "beginnerRules": "",
  "mustWatchReason": "",
  "notificationText": "",
  "seoTitle": "",
  "seoDescription": ""
}
```

---

## 9. DB 설계

Cloudflare D1은 SQLite 기반으로 사용한다.  
MVP에서는 회원 관련 테이블을 제외하고, 일정/콘텐츠/관리자/수집 로그 중심으로 구성한다.

---

## 9.1 series

시리즈 정보 테이블.

```sql
CREATE TABLE series (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  beginner_guide TEXT,
  color TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 예시 데이터

| code | name |
| --- | --- |
| F1 | Formula 1 |
| WEC | FIA World Endurance Championship |
| WRC | World Rally Championship |

---

## 9.2 races

대회 단위 테이블.

```sql
CREATE TABLE races (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL,
  season INTEGER NOT NULL,
  round INTEGER,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country TEXT,
  location TEXT,
  venue_name TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  timezone TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  publish_status TEXT NOT NULL DEFAULT 'draft',
  is_featured INTEGER NOT NULL DEFAULT 0,
  needs_review INTEGER NOT NULL DEFAULT 0,
  source_key TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (series_id) REFERENCES series(id)
);
```

### status

```txt
scheduled
ongoing
finished
cancelled
postponed
```

### publish_status

```txt
draft
published
hidden
```

---

## 9.3 sessions

세션 단위 테이블.

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  start_time_utc TEXT NOT NULL,
  end_time_utc TEXT,
  is_must_watch INTEGER NOT NULL DEFAULT 0,
  importance_level INTEGER NOT NULL DEFAULT 1,
  source_key TEXT,
  needs_review INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (race_id) REFERENCES races(id)
);
```

### type

```txt
practice
qualifying
sprint
race
start
sunset
night
sunrise
final_hour
power_stage
stage
other
```

---

## 9.4 race_contents

AI 문구 및 관전 포인트 테이블.

```sql
CREATE TABLE race_contents (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL UNIQUE,
  summary_three_lines TEXT,
  key_drivers_or_teams TEXT,
  race_variables TEXT,
  beginner_rules TEXT,
  must_watch_reason TEXT,
  notification_text TEXT,
  seo_title TEXT,
  seo_description TEXT,
  ai_status TEXT NOT NULL DEFAULT 'empty',
  ai_generated INTEGER NOT NULL DEFAULT 0,
  reviewed_by_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (race_id) REFERENCES races(id)
);
```

### ai_status

```txt
empty
generated
needs_review
reviewed
published
```

---

## 9.5 sync_sources

수집 소스 관리 테이블.

```sql
CREATE TABLE sync_sources (
  id TEXT PRIMARY KEY,
  series_code TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### source_type

```txt
ics
api
html
manual
```

---

## 9.6 sync_logs

수집 로그 테이블.

```sql
CREATE TABLE sync_logs (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  series_code TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  added_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  FOREIGN KEY (source_id) REFERENCES sync_sources(id)
);
```

### status

```txt
success
failed
partial
```

---

## 9.7 change_logs

일정 변경 추적 테이블.

```sql
CREATE TABLE change_logs (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_status TEXT NOT NULL DEFAULT 'needs_review',
  created_at TEXT NOT NULL
);
```

### entity_type

```txt
race
session
content
```

### change_status

```txt
auto_applied
needs_review
ignored
```

---

## 9.8 admin_sessions

관리자 세션 테이블.

```sql
CREATE TABLE admin_sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

---

## 10. API 설계

## 10.1 공개 API

### 이번 주 레이스 조회

```txt
GET /api/races/week
```

### 전체 레이스 조회

```txt
GET /api/races?series=F1&from=2026-06-01&to=2026-06-30
```

### 레이스 상세 조회

```txt
GET /api/races/:slug
```

### 시리즈 목록 조회

```txt
GET /api/series
```

---

## 10.2 관리자 API

### 관리자 로그인

```txt
POST /api/admin/login
```

### 관리자 로그아웃

```txt
POST /api/admin/logout
```

### 레이스 목록 조회

```txt
GET /api/admin/races
```

### 레이스 수정

```txt
PATCH /api/admin/races/:id
```

### 세션 수정

```txt
PATCH /api/admin/sessions/:id
```

### 수동 수집 실행

```txt
POST /api/admin/sync
```

### AI 문구 생성

```txt
POST /api/admin/races/:id/generate-content
```

### AI 문구 수정

```txt
PATCH /api/admin/races/:id/content
```

### 레이스 공개 처리

```txt
POST /api/admin/races/:id/publish
```

---

## 11. 라우팅 설계

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

## 12. 컴포넌트 설계

## 12.1 공개 컴포넌트

```txt
components/
  RaceCard/
  RaceList/
  RaceCalendar/
  RaceDetail/
  SessionList/
  SessionBadge/
  SeriesBadge/
  SeriesGuideCard/
  MustWatchList/
  AiContentBlock/
```

---

## 12.2 관리자 컴포넌트

```txt
components/admin/
  AdminHeader/
  AdminLoginForm/
  AdminDashboardCard/
  SyncLogTable/
  RaceAdminTable/
  RaceEditForm/
  SessionEditTable/
  AiContentEditor/
  PublishStatusBadge/
```

---

## 13. 시간 처리 정책

DB에는 UTC 기준으로 저장한다.

```txt
start_time_utc
end_time_utc
```

화면에서는 항상 한국 시간 기준으로 표시한다.

```txt
Asia/Seoul
KST
```

### 예시

```txt
DB: 2026-06-13T14:00:00Z
화면: 2026년 6월 13일 23:00 KST
```

---

## 14. 이미지 정책

MVP에서는 이미지를 사용하지 않는다.

### 이유

- F1/WEC/WRC 사진 대부분은 저작권 리스크가 있음
- 공식 이미지, 팀 이미지, 방송 캡처, SNS 이미지는 임의 사용이 어려움
- 텍스트 큐레이션 서비스의 정체성을 유지하는 편이 안전함

### 대체 UI 요소

- 시리즈별 컬러
- 텍스트 배지
- 직접 제작한 SVG 아이콘
- 국가명 텍스트
- 카드형 레이아웃
- 일정 중심 UI

---

## 15. 디자인 방향

### 15.1 키워드

```txt
Dark
Racing
Calendar
Editorial
Minimal
Text-focused
```

---

### 15.2 컬러 예시

```scss
$color-bg: #080a0f;
$color-surface: #111318;
$color-surface-light: #181b22;
$color-text: #f5f7fa;
$color-text-muted: #9ca3af;

$color-f1: #e10600;
$color-wec: #0057ff;
$color-wrc: #00a651;

$color-border: #252a33;
$color-warning: #f59e0b;
$color-success: #22c55e;
```

---

## 16. 배포 및 환경변수

## 16.1 환경변수

```txt
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
OPENAI_API_KEY=
DATABASE_URL=
```

Cloudflare D1 바인딩은 `wrangler.toml`에서 관리한다.

```toml
[[d1_databases]]
binding = "DB"
database_name = "racenote-db"
database_id = ""
```

---

## 16.2 Cron 설정 예시

```toml
[triggers]
crons = [
  "0 0 * * *",
  "0 12 * * *",
  "0 1 * * *"
]
```

### Cron 역할

| Cron | KST | 역할 |
| --- | --- | --- |
| 0 0 * * * | 09:00 | 일정 수집 |
| 0 12 * * * | 21:00 | 일정 수집 |
| 0 1 * * * | 10:00 | AI 문구 생성 |

---

## 17. MVP 개발 순서

## 17.1 1단계: 프로젝트 세팅

- Next.js 프로젝트 생성
- SCSS 설정
- BEM 기반 스타일 구조 생성
- Cloudflare Pages/Workers 배포 환경 확인
- D1 생성
- Drizzle 설정

---

## 17.2 2단계: DB 및 기본 데이터

- series 테이블 생성
- races 테이블 생성
- sessions 테이블 생성
- race_contents 테이블 생성
- F1/WEC/WRC 기본 데이터 seed

---

## 17.3 3단계: 공개 페이지

- 홈
- 이번 주 레이스
- 통합 캘린더
- 레이스 상세
- 시리즈 소개 페이지

---

## 17.4 4단계: 관리자 페이지

- 관리자 로그인
- 관리자 대시보드
- 레이스 목록
- 레이스 상세 수정
- 세션 수정
- AI 문구 수정
- 공개 처리

---

## 17.5 5단계: 일정 수집

- sync_sources 생성
- 수집 함수 작성
- 파싱 함수 작성
- DB 비교 로직 작성
- sync_logs 저장
- 수동 수집 버튼 연결
- Cron 연결

---

## 17.6 6단계: AI 문구 생성

- AI 프롬프트 템플릿 작성
- 관리자 수동 생성 기능
- 하루 1회 자동 생성 Cron
- 검수 상태 관리
- 자동 덮어쓰기 방지

---

## 17.7 7단계: 배포 전 점검

- 한국 시간 변환 확인
- 공개/비공개 상태 확인
- 관리자 인증 확인
- AI 문구 검수 플로우 확인
- 크론 로그 확인
- 모바일 화면 확인
- SEO 메타 정보 확인

---

## 18. 리스크 및 대응

## 18.1 일정 수집 소스 변경

### 리스크

외부 페이지 구조가 변경되면 수집이 실패할 수 있다.

### 대응

- sync_logs 저장
- 실패 시 관리자 대시보드에 표시
- 수동 입력/수정 가능하게 유지
- 공식 ICS/API 우선 사용

---

## 18.2 AI 문구 부정확성

### 리스크

AI가 확인되지 않은 정보를 단정할 수 있다.

### 대응

- 사용자에게 바로 노출하지 않음
- 관리자 검수 후 공개
- 프롬프트에 “확인되지 않은 사실 단정 금지” 포함
- reviewed/published 문구 자동 덮어쓰기 금지

---

## 18.3 저작권 문제

### 리스크

레이싱 이미지, 팀 로고, 방송 캡처 사용 시 저작권 이슈 발생 가능.

### 대응

- MVP에서는 이미지 미사용
- 직접 제작한 아이콘만 사용
- 텍스트/컬러/배지 중심 UI 유지

---

## 18.4 Cloudflare D1 제약

### 리스크

D1은 SQLite 기반이므로 복잡한 관계형 쿼리나 대규모 데이터에는 제약이 있을 수 있다.

### 대응

- MVP에서는 테이블 구조 단순화
- 회원 기능 제외
- 이미지/대용량 데이터 미사용
- 필요 시 추후 Postgres로 이전 가능하게 설계

---

## 19. 2차 확장 계획

MVP 검증 후 아래 기능을 순차적으로 추가한다.

| 우선순위 | 기능 | 설명 |
| --- | --- | --- |
| 1 | 찜 기능 | 보고 싶은 레이스 저장 |
| 2 | 알림 기능 | 이메일 또는 웹푸시 알림 |
| 3 | 회원가입 | 개인화 기능 기반 |
| 4 | 시청 로그 | 본 레이스 기록, 별점, 메모 |
| 5 | 좋아하는 팀/드라이버 저장 | 취향 기반 추천 준비 |
| 6 | SEO 콘텐츠 확장 | “WEC 보는 법”, “WRC 파워스테이지란?” 등 |
| 7 | 결과 요약 | 경기 종료 후 수동 또는 반자동 요약 |
| 8 | 굿즈/상품 연계 | 네이버 쇼핑 API 활용 가능 |

---

## 20. 최종 MVP 정의

RaceNote MVP는 다음을 만족하면 1차 완성으로 본다.

```txt
1. 사용자는 홈에서 이번 주 F1/WEC/WRC 레이스를 볼 수 있다.
2. 사용자는 각 레이스의 한국 시간 세션 일정을 확인할 수 있다.
3. 사용자는 꼭 봐야 하는 세션을 확인할 수 있다.
4. 사용자는 입문자용 관전 포인트를 읽을 수 있다.
5. 관리자는 수집된 일정을 확인하고 수정할 수 있다.
6. 관리자는 AI 문구를 생성하고 검수 후 공개할 수 있다.
7. 시스템은 하루 2회 일정을 수집한다.
8. 시스템은 하루 1회 필요한 레이스의 AI 문구를 생성한다.
9. 이미지는 사용하지 않는다.
10. 회원 기능은 포함하지 않는다.
```

---

## 21. MVP 요약

```txt
서비스명: RaceNote
목표: 이번 주 볼만한 레이스를 알려주는 한국어 모터스포츠 캘린더
대상: F1, WEC, WRC 입문자 및 관심자
배포: Cloudflare Pages/Workers
DB: Cloudflare D1
ORM: Drizzle
스타일: SCSS + BEM
AI: 관리자 콘텐츠 생성용
수집: 하루 2회
AI 문구 생성: 하루 1회
이미지: 미사용
회원 기능: 2차
```
