PRAGMA foreign_keys = ON;

INSERT INTO series (id, code, name, description, beginner_guide, color, created_at, updated_at)
VALUES
  ('series-f1', 'F1', 'Formula 1', '같은 서킷에서 모든 차량이 동시에 경쟁하는 최고 등급 싱글시터 레이스.', 'Qualifying과 Race부터 보면 팀과 드라이버, 전략의 차이를 이해하기 쉽습니다.', '#d84d3f', '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('series-wec', 'WEC', 'World Endurance Championship', '여러 클래스와 드라이버가 긴 시간을 함께 달리며 속도와 내구성을 겨루는 레이스.', 'Start와 Final Hour부터 보면 클래스, 교대, 피트 전략의 흐름을 이해하기 쉽습니다.', '#3674b8', '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('series-wrc', 'WRC', 'World Rally Championship', '도로와 비포장 스테이지를 한 대씩 달린 기록을 합산하는 랠리 챔피언십.', 'Power Stage부터 보면 기록 경쟁과 보너스 포인트의 긴장감을 느끼기 쉽습니다.', '#608313', '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z')
ON CONFLICT(id) DO UPDATE SET
  code = excluded.code,
  name = excluded.name,
  description = excluded.description,
  beginner_guide = excluded.beginner_guide,
  color = excluded.color,
  updated_at = excluded.updated_at;

INSERT INTO races (id, series_id, season, round, name, slug, country, location, venue_name, start_date, end_date, timezone, status, publish_status, is_featured, needs_review, source_key, created_at, updated_at)
VALUES
  ('race-canada-2026', 'series-f1', 2026, 10, 'Canadian Grand Prix', 'canadian-grand-prix-2026', 'Canada', 'Montréal', 'Circuit Gilles Villeneuve', '2026-06-12', '2026-06-15', 'America/Toronto', 'scheduled', 'hidden', 0, 0, 'seed-f1-canada-2026', '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('race-le-mans-2026', 'series-wec', 2026, 4, '24 Hours of Le Mans', '24-hours-of-le-mans-2026', 'France', 'Le Mans', 'Circuit de la Sarthe', '2026-06-13', '2026-06-14', 'Europe/Paris', 'scheduled', 'published', 1, 0, 'seed-wec-le-mans-2026', '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('race-acropolis-2026', 'series-wrc', 2026, 7, 'Acropolis Rally Greece', 'acropolis-rally-greece-2026', 'Greece', 'Lamia', NULL, '2026-06-25', '2026-06-28', 'Europe/Athens', 'scheduled', 'hidden', 0, 0, 'seed-wrc-acropolis-2026', '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z')
ON CONFLICT(id) DO UPDATE SET
  series_id = excluded.series_id,
  season = excluded.season,
  round = excluded.round,
  name = excluded.name,
  slug = excluded.slug,
  country = excluded.country,
  location = excluded.location,
  venue_name = excluded.venue_name,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  timezone = excluded.timezone,
  status = excluded.status,
  publish_status = excluded.publish_status,
  is_featured = excluded.is_featured,
  needs_review = excluded.needs_review,
  source_key = excluded.source_key,
  updated_at = excluded.updated_at;

INSERT INTO sessions (id, race_id, name, type, start_time_utc, end_time_utc, is_must_watch, importance_level, source_key, needs_review, created_at, updated_at)
VALUES
  ('session-canada-p3', 'race-canada-2026', 'Practice 3', 'practice', '2026-06-12T16:30:00Z', NULL, 0, 1, 'seed-canada-p3', 0, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('session-canada-quali', 'race-canada-2026', 'Qualifying', 'qualifying', '2026-06-13T20:00:00Z', NULL, 1, 3, 'seed-canada-quali', 0, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('session-canada-race', 'race-canada-2026', 'Race', 'race', '2026-06-14T18:00:00Z', NULL, 1, 3, 'seed-canada-race', 0, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('session-le-mans-start', 'race-le-mans-2026', 'Race Start', 'start', '2026-06-13T14:00:00Z', NULL, 1, 3, 'seed-le-mans-start', 0, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('session-le-mans-night', 'race-le-mans-2026', 'Night Stint', 'night', '2026-06-13T19:00:00Z', NULL, 1, 2, 'seed-le-mans-night', 0, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('session-le-mans-final', 'race-le-mans-2026', 'Final Hour', 'final_hour', '2026-06-14T13:00:00Z', NULL, 1, 3, 'seed-le-mans-final', 0, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('session-acropolis-opening', 'race-acropolis-2026', 'Opening Stage', 'stage', '2026-06-24T16:05:00Z', NULL, 1, 2, 'seed-acropolis-opening', 0, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('session-acropolis-long', 'race-acropolis-2026', 'Long Stage', 'stage', '2026-06-27T09:40:00Z', NULL, 0, 1, 'seed-acropolis-long', 0, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('session-acropolis-power', 'race-acropolis-2026', 'Power Stage', 'power_stage', '2026-06-28T10:15:00Z', NULL, 1, 3, 'seed-acropolis-power', 0, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z')
ON CONFLICT(id) DO UPDATE SET
  race_id = excluded.race_id,
  name = excluded.name,
  type = excluded.type,
  start_time_utc = excluded.start_time_utc,
  end_time_utc = excluded.end_time_utc,
  is_must_watch = excluded.is_must_watch,
  importance_level = excluded.importance_level,
  source_key = excluded.source_key,
  needs_review = excluded.needs_review,
  updated_at = excluded.updated_at;

INSERT INTO race_contents (id, race_id, summary_three_lines, key_drivers_or_teams, race_variables, beginner_rules, must_watch_reason, notification_text, seo_title, seo_description, ai_status, ai_generated, reviewed_by_admin, created_at, updated_at)
VALUES
  ('content-canada-2026', 'race-canada-2026', '["긴 직선과 강한 제동 구간이 이어져 브레이크 관리가 중요합니다.","벽이 가까운 도심형 서킷이라 작은 실수가 세이프티카로 연결될 수 있습니다.","추월 기회가 분명해 타이어 전략과 피트 타이밍을 함께 보기 좋습니다."]', NULL, '["Safety car","Brake wear","Tyre strategy"]', '예선 결과가 결승 출발 순서를 정합니다. 결승에서는 의무 타이어 규정과 피트스톱 전략이 순위를 바꿉니다.', '낮은 다운포스와 강한 제동이 승부를 가릅니다. 세이프티카가 흐름을 바꿀 가능성도 큽니다.', NULL, '2026 Canadian Grand Prix 관전 포인트', '캐나다 그랑프리 일정과 입문자 관전 포인트', 'published', 1, 1, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('content-le-mans-2026', 'race-le-mans-2026', '["24시간 동안 속도와 내구성, 교대 운영을 동시에 겨루는 레이스입니다.","서로 다른 속도의 여러 클래스가 함께 달려 트래픽 관리가 핵심입니다.","밤과 비, 세이프티카, 피트 전략이 결과를 크게 바꿀 수 있습니다."]', NULL, '["Night running","Traffic","Pit strategy"]', '여러 클래스 차량이 동시에 달리며 전체 우승과 클래스별 우승이 따로 존재합니다. 드라이버는 일정 시간마다 교대합니다.', '여러 클래스가 동시에 달리는 24시간 레이스입니다. 야간 주행과 피트 전략을 함께 보세요.', NULL, '2026 24 Hours of Le Mans 관전 포인트', '르망24 일정과 입문자 관전 포인트', 'published', 1, 1, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z'),
  ('content-acropolis-2026', 'race-acropolis-2026', '["거친 자갈길과 높은 기온이 차량 내구성을 강하게 시험합니다.","빠른 기록만큼 타이어 손상과 완주를 관리하는 판단이 중요합니다.","마지막 파워 스테이지에는 추가 포인트가 걸려 있습니다."]', NULL, '["Rough gravel","Heat","Tyre damage"]', 'WRC는 차량이 한 대씩 스테이지를 달리고 기록을 합산합니다. 코드라이버가 읽는 페이스노트가 드라이버의 시야를 대신합니다.', '거친 자갈길과 높은 기온이 차를 시험합니다. 빠른 기록만큼 완주 관리가 중요합니다.', NULL, '2026 Acropolis Rally Greece 관전 포인트', '아크로폴리스 랠리 일정과 입문자 관전 포인트', 'published', 1, 1, '2026-06-11T00:00:00Z', '2026-06-11T00:00:00Z')
ON CONFLICT(id) DO UPDATE SET
  race_id = excluded.race_id,
  summary_three_lines = excluded.summary_three_lines,
  race_variables = excluded.race_variables,
  beginner_rules = excluded.beginner_rules,
  must_watch_reason = excluded.must_watch_reason,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  ai_status = excluded.ai_status,
  ai_generated = excluded.ai_generated,
  reviewed_by_admin = excluded.reviewed_by_admin,
  updated_at = excluded.updated_at;
