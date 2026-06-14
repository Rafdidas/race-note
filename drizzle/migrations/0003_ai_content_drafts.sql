CREATE TABLE `ai_content_drafts` (
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
  `status` text DEFAULT 'ready' NOT NULL,
  `model` text NOT NULL,
  `error_message` text,
  `generated_at` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_content_drafts_race_id_unique` ON `ai_content_drafts` (`race_id`);
--> statement-breakpoint
CREATE INDEX `ai_content_drafts_status_idx` ON `ai_content_drafts` (`status`);
--> statement-breakpoint
CREATE INDEX `ai_content_drafts_generated_at_idx` ON `ai_content_drafts` (`generated_at`);
