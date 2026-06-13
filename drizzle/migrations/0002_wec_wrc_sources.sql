INSERT INTO `sync_sources` (`id`, `series_code`, `source_type`, `source_url`, `enabled`, `created_at`, `updated_at`)
VALUES
  ('source-wec-official', 'WEC', 'html', 'https://www.fiawec.com/en/calendar/80', true, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('source-wrc-official', 'WRC', 'html', 'https://www.wrc.com/en/calendar', true, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
ON CONFLICT (`id`) DO UPDATE SET
  `source_url` = excluded.`source_url`,
  `enabled` = excluded.`enabled`,
  `updated_at` = excluded.`updated_at`;
