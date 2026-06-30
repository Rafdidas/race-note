CREATE TABLE `race_results` (
  `id` text PRIMARY KEY NOT NULL,
  `race_id` text NOT NULL,
  `season` integer NOT NULL,
  `session_type` text DEFAULT 'race' NOT NULL,
  `position` integer NOT NULL,
  `driver_id` text,
  `driver_name` text NOT NULL,
  `team_id` text,
  `team_name` text,
  `grid_position` integer,
  `time_or_gap` text,
  `points` integer DEFAULT 0 NOT NULL,
  `status` text,
  `source_key` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `race_results_race_idx` ON `race_results` (`race_id`,`session_type`,`position`);
--> statement-breakpoint
CREATE UNIQUE INDEX `race_results_source_key_idx` ON `race_results` (`source_key`);
--> statement-breakpoint
CREATE TABLE `driver_standings` (
  `id` text PRIMARY KEY NOT NULL,
  `season` integer NOT NULL,
  `driver_id` text NOT NULL,
  `position` integer NOT NULL,
  `points` integer DEFAULT 0 NOT NULL,
  `wins` integer DEFAULT 0 NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `driver_standings_season_driver_idx` ON `driver_standings` (`season`,`driver_id`);
--> statement-breakpoint
CREATE INDEX `driver_standings_position_idx` ON `driver_standings` (`season`,`position`);
--> statement-breakpoint
CREATE TABLE `constructor_standings` (
  `id` text PRIMARY KEY NOT NULL,
  `season` integer NOT NULL,
  `constructor_id` text NOT NULL,
  `position` integer NOT NULL,
  `points` integer DEFAULT 0 NOT NULL,
  `wins` integer DEFAULT 0 NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `constructor_standings_season_idx` ON `constructor_standings` (`season`,`constructor_id`);
--> statement-breakpoint
CREATE INDEX `constructor_standings_position_idx` ON `constructor_standings` (`season`,`position`);
