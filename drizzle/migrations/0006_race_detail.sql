CREATE TABLE `race_facts` (
  `id` text PRIMARY KEY NOT NULL,
  `race_id` text NOT NULL,
  `circuit_name` text,
  `track_length` text,
  `laps` integer,
  `race_distance` text,
  `corners` integer,
  `drs_zones` integer,
  `first_held` integer,
  `previous_winner` text,
  `most_wins_driver` text,
  `most_wins_team` text,
  `lap_record` text,
  `pole_record` text,
  `tyre_compounds` text,
  `overtake_difficulty` text,
  `key_sector` text,
  `surface_type` text,
  `total_stages` integer,
  `total_distance` text,
  `event_duration` text,
  `classes` text,
  `weather_note` text,
  `strategy_note` text,
  `beginner_note` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `race_facts_race_id_unique` ON `race_facts` (`race_id`);
--> statement-breakpoint
CREATE TABLE `race_history` (
  `id` text PRIMARY KEY NOT NULL,
  `race_id` text NOT NULL,
  `season` integer NOT NULL,
  `winner_driver_name` text,
  `winner_team_name` text,
  `pole_driver_name` text,
  `fastest_lap_driver_name` text,
  `note` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `race_history_race_id_idx` ON `race_history` (`race_id`,`season`);
--> statement-breakpoint
CREATE TABLE `race_watch_targets` (
  `id` text PRIMARY KEY NOT NULL,
  `race_id` text NOT NULL,
  `target_type` text NOT NULL,
  `target_id` text,
  `target_name` text NOT NULL,
  `title` text,
  `reason` text NOT NULL,
  `display_order` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `race_watch_targets_race_id_idx` ON `race_watch_targets` (`race_id`,`display_order`);
