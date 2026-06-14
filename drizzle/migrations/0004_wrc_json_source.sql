UPDATE `sync_sources`
SET
  `source_type` = 'api',
  `source_url` = 'https://www.wrc.com/v3/api/graphql/v1/v3/content/rrn:content:misc:7c383cdb-3e16-4905-a513-73815689d128:en-INT?rb3Locale=en&rb3Schema=v1:inlineContent',
  `updated_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE `id` = 'source-wrc-official';
