PRAGMA foreign_keys = ON;
--> statement-breakpoint
CREATE TABLE `series` (
  `id` text PRIMARY KEY NOT NULL,
  `code` text NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `beginner_guide` text,
  `color` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `series_code_unique` ON `series` (`code`);
--> statement-breakpoint
CREATE TABLE `races` (
  `id` text PRIMARY KEY NOT NULL,
  `series_id` text NOT NULL,
  `season` integer NOT NULL,
  `round` integer,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `country` text,
  `location` text,
  `venue_name` text,
  `start_date` text NOT NULL,
  `end_date` text NOT NULL,
  `timezone` text,
  `status` text DEFAULT 'scheduled' NOT NULL,
  `publish_status` text DEFAULT 'draft' NOT NULL,
  `is_featured` integer DEFAULT false NOT NULL,
  `needs_review` integer DEFAULT false NOT NULL,
  `source_key` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`series_id`) REFERENCES `series` (`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `races_slug_unique` ON `races` (`slug`);
--> statement-breakpoint
CREATE INDEX `races_series_id_idx` ON `races` (`series_id`);
--> statement-breakpoint
CREATE INDEX `races_schedule_idx` ON `races` (`start_date`, `end_date`);
--> statement-breakpoint
CREATE INDEX `races_publish_status_idx` ON `races` (`publish_status`);
--> statement-breakpoint
CREATE INDEX `races_review_queue_idx` ON `races` (`needs_review`, `publish_status`);
--> statement-breakpoint
CREATE UNIQUE INDEX `races_source_key_idx` ON `races` (`source_key`);
--> statement-breakpoint
CREATE TABLE `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `race_id` text NOT NULL,
  `name` text NOT NULL,
  `type` text NOT NULL,
  `start_time_utc` text NOT NULL,
  `end_time_utc` text,
  `is_must_watch` integer DEFAULT false NOT NULL,
  `importance_level` integer DEFAULT 1 NOT NULL,
  `source_key` text,
  `needs_review` integer DEFAULT false NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_race_id_idx` ON `sessions` (`race_id`);
--> statement-breakpoint
CREATE INDEX `sessions_start_time_idx` ON `sessions` (`start_time_utc`);
--> statement-breakpoint
CREATE INDEX `sessions_must_watch_idx` ON `sessions` (`is_must_watch`, `start_time_utc`);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_source_key_idx` ON `sessions` (`source_key`);
--> statement-breakpoint
CREATE TABLE `race_contents` (
  `id` text PRIMARY KEY NOT NULL,
  `race_id` text NOT NULL,
  `summary_three_lines` text,
  `key_drivers_or_teams` text,
  `race_variables` text,
  `beginner_rules` text,
  `must_watch_reason` text,
  `notification_text` text,
  `seo_title` text,
  `seo_description` text,
  `ai_status` text DEFAULT 'empty' NOT NULL,
  `ai_generated` integer DEFAULT false NOT NULL,
  `reviewed_by_admin` integer DEFAULT false NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `race_contents_race_id_unique` ON `race_contents` (`race_id`);
--> statement-breakpoint
CREATE INDEX `race_contents_ai_status_idx` ON `race_contents` (`ai_status`);
--> statement-breakpoint
CREATE TABLE `sync_sources` (
  `id` text PRIMARY KEY NOT NULL,
  `series_code` text NOT NULL,
  `source_type` text NOT NULL,
  `source_url` text NOT NULL,
  `enabled` integer DEFAULT true NOT NULL,
  `last_synced_at` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sync_sources_series_code_idx` ON `sync_sources` (`series_code`, `enabled`);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `source_id` text,
  `series_code` text NOT NULL,
  `status` text NOT NULL,
  `message` text,
  `added_count` integer DEFAULT 0 NOT NULL,
  `updated_count` integer DEFAULT 0 NOT NULL,
  `skipped_count` integer DEFAULT 0 NOT NULL,
  `started_at` text NOT NULL,
  `finished_at` text,
  FOREIGN KEY (`source_id`) REFERENCES `sync_sources` (`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `sync_logs_source_id_idx` ON `sync_logs` (`source_id`);
--> statement-breakpoint
CREATE INDEX `sync_logs_started_at_idx` ON `sync_logs` (`started_at`);
--> statement-breakpoint
CREATE INDEX `sync_logs_status_idx` ON `sync_logs` (`status`);
--> statement-breakpoint
CREATE TABLE `change_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text NOT NULL,
  `field_name` text NOT NULL,
  `old_value` text,
  `new_value` text,
  `change_status` text DEFAULT 'needs_review' NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `change_logs_entity_idx` ON `change_logs` (`entity_type`, `entity_id`);
--> statement-breakpoint
CREATE INDEX `change_logs_review_queue_idx` ON `change_logs` (`change_status`, `created_at`);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `session_token` text NOT NULL,
  `expires_at` text NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_sessions_session_token_unique` ON `admin_sessions` (`session_token`);
--> statement-breakpoint
CREATE INDEX `admin_sessions_expires_at_idx` ON `admin_sessions` (`expires_at`);
