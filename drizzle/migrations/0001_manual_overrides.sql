CREATE TABLE `manual_overrides` (
  `id` text PRIMARY KEY NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text NOT NULL,
  `field_name` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `manual_overrides_entity_field_idx` ON `manual_overrides` (`entity_type`, `entity_id`, `field_name`);
--> statement-breakpoint
CREATE INDEX `manual_overrides_entity_idx` ON `manual_overrides` (`entity_type`, `entity_id`);
--> statement-breakpoint
INSERT INTO `sync_sources` (`id`, `series_code`, `source_type`, `source_url`, `enabled`, `created_at`, `updated_at`)
VALUES ('source-f1-jolpica', 'F1', 'api', 'https://api.jolpi.ca/ergast/f1/current.json', true, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
ON CONFLICT (`id`) DO UPDATE SET
  `source_url` = excluded.`source_url`,
  `enabled` = excluded.`enabled`,
  `updated_at` = excluded.`updated_at`;
