import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const raceStatuses = ["scheduled", "ongoing", "finished", "cancelled", "postponed"] as const;
const publishStatuses = ["draft", "published", "hidden"] as const;
const sessionTypes = [
  "practice",
  "qualifying",
  "sprint",
  "race",
  "start",
  "sunset",
  "night",
  "sunrise",
  "final_hour",
  "power_stage",
  "stage",
  "other",
] as const;
const aiStatuses = ["empty", "generated", "needs_review", "reviewed", "published"] as const;
const sourceTypes = ["ics", "api", "html", "manual"] as const;
const syncStatuses = ["success", "failed", "partial"] as const;
const entityTypes = ["race", "session", "content"] as const;
const changeStatuses = ["auto_applied", "needs_review", "ignored"] as const;

export const series = sqliteTable("series", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  beginnerGuide: text("beginner_guide"),
  color: text("color"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const races = sqliteTable(
  "races",
  {
    id: text("id").primaryKey(),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "restrict", onUpdate: "cascade" }),
    season: integer("season").notNull(),
    round: integer("round"),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    country: text("country"),
    location: text("location"),
    venueName: text("venue_name"),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    timezone: text("timezone"),
    status: text("status", { enum: raceStatuses }).notNull().default("scheduled"),
    publishStatus: text("publish_status", { enum: publishStatuses }).notNull().default("draft"),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    needsReview: integer("needs_review", { mode: "boolean" }).notNull().default(false),
    sourceKey: text("source_key"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("races_series_id_idx").on(table.seriesId),
    index("races_schedule_idx").on(table.startDate, table.endDate),
    index("races_publish_status_idx").on(table.publishStatus),
    index("races_review_queue_idx").on(table.needsReview, table.publishStatus),
    uniqueIndex("races_source_key_idx").on(table.sourceKey),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    raceId: text("race_id")
      .notNull()
      .references(() => races.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: text("name").notNull(),
    type: text("type", { enum: sessionTypes }).notNull(),
    startTimeUtc: text("start_time_utc").notNull(),
    endTimeUtc: text("end_time_utc"),
    isMustWatch: integer("is_must_watch", { mode: "boolean" }).notNull().default(false),
    importanceLevel: integer("importance_level").notNull().default(1),
    sourceKey: text("source_key"),
    needsReview: integer("needs_review", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("sessions_race_id_idx").on(table.raceId),
    index("sessions_start_time_idx").on(table.startTimeUtc),
    index("sessions_must_watch_idx").on(table.isMustWatch, table.startTimeUtc),
    uniqueIndex("sessions_source_key_idx").on(table.sourceKey),
  ],
);

export const raceContents = sqliteTable(
  "race_contents",
  {
    id: text("id").primaryKey(),
    raceId: text("race_id")
      .notNull()
      .unique()
      .references(() => races.id, { onDelete: "cascade", onUpdate: "cascade" }),
    summaryThreeLines: text("summary_three_lines", { mode: "json" }).$type<string[]>(),
    keyDriversOrTeams: text("key_drivers_or_teams"),
    raceVariables: text("race_variables", { mode: "json" }).$type<string[]>(),
    beginnerRules: text("beginner_rules"),
    mustWatchReason: text("must_watch_reason"),
    notificationText: text("notification_text"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    aiStatus: text("ai_status", { enum: aiStatuses }).notNull().default("empty"),
    aiGenerated: integer("ai_generated", { mode: "boolean" }).notNull().default(false),
    reviewedByAdmin: integer("reviewed_by_admin", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("race_contents_ai_status_idx").on(table.aiStatus)],
);

export const syncSources = sqliteTable(
  "sync_sources",
  {
    id: text("id").primaryKey(),
    seriesCode: text("series_code").notNull(),
    sourceType: text("source_type", { enum: sourceTypes }).notNull(),
    sourceUrl: text("source_url").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    lastSyncedAt: text("last_synced_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("sync_sources_series_code_idx").on(table.seriesCode, table.enabled)],
);

export const syncLogs = sqliteTable(
  "sync_logs",
  {
    id: text("id").primaryKey(),
    sourceId: text("source_id").references(() => syncSources.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    seriesCode: text("series_code").notNull(),
    status: text("status", { enum: syncStatuses }).notNull(),
    message: text("message"),
    addedCount: integer("added_count").notNull().default(0),
    updatedCount: integer("updated_count").notNull().default(0),
    skippedCount: integer("skipped_count").notNull().default(0),
    startedAt: text("started_at").notNull(),
    finishedAt: text("finished_at"),
  },
  (table) => [
    index("sync_logs_source_id_idx").on(table.sourceId),
    index("sync_logs_started_at_idx").on(table.startedAt),
    index("sync_logs_status_idx").on(table.status),
  ],
);

export const changeLogs = sqliteTable(
  "change_logs",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type", { enum: entityTypes }).notNull(),
    entityId: text("entity_id").notNull(),
    fieldName: text("field_name").notNull(),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    changeStatus: text("change_status", { enum: changeStatuses }).notNull().default("needs_review"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("change_logs_entity_idx").on(table.entityType, table.entityId),
    index("change_logs_review_queue_idx").on(table.changeStatus, table.createdAt),
  ],
);

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    id: text("id").primaryKey(),
    sessionToken: text("session_token").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("admin_sessions_expires_at_idx").on(table.expiresAt)],
);

export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type Race = typeof races.$inferSelect;
export type NewRace = typeof races.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type RaceContent = typeof raceContents.$inferSelect;
export type NewRaceContent = typeof raceContents.$inferInsert;
