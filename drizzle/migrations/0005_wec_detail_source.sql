UPDATE `sync_sources`
SET
  `source_type` = 'html',
  `source_url` = 'https://www.fiawec.com/en/race/24-hours-of-le-mans-2026',
  `updated_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE `id` = 'source-wec-official';
