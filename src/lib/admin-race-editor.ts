import "server-only";

import { and, eq, inArray, isNull } from "drizzle-orm";
import {
  aiContentDrafts,
  changeLogs,
  manualOverrides,
  raceContents,
  races,
  sessions,
} from "@/db/schema";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  canPublishAdminRace,
  parseAdminGenerationConfirmation,
  type AdminRaceMutationInput,
  type AdminSessionMutationInput,
} from "@/lib/admin-race-mutations";
import type { AiContentFields } from "@/lib/ai-content";
import { generateRaceContentDraft } from "@/lib/ai/content-generation";
import { OpenAiContentGenerator } from "@/lib/ai/openai-content-generator";
import {
  getDb,
  getOpenAiApiKey,
} from "@/lib/db";
import { runD1Batch, type D1BatchQuery } from "@/lib/d1-helpers";
import { findChangedFields } from "@/lib/manual-overrides";

async function requireRace(raceId: string) {
  const db = await getDb();
  const rows = await db
    .select({ id: races.id })
    .from(races)
    .where(eq(races.id, raceId))
    .limit(1);
  if (!rows[0]) {
    throw new Error("Race not found");
  }
  return db;
}

export async function saveAdminRaceCorrection(
  raceId: string,
  input: AdminRaceMutationInput,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const sessionIds = input.sessions.map((session) => session.id);
  const raceRows = await db
    .select({
      name: races.name,
      country: races.country,
      location: races.location,
      startDate: races.startDate,
      endDate: races.endDate,
    })
    .from(races)
    .where(eq(races.id, raceId))
    .limit(1);
  const ownedSessions =
    sessionIds.length === 0
      ? []
      : await db
          .select({
            id: sessions.id,
            name: sessions.name,
            startTimeUtc: sessions.startTimeUtc,
            isMustWatch: sessions.isMustWatch,
          })
          .from(sessions)
          .where(
            and(eq(sessions.raceId, raceId), inArray(sessions.id, sessionIds)),
          );

  if (ownedSessions.length !== sessionIds.length) {
    throw new Error("Invalid session");
  }

  const now = new Date().toISOString();
  const overrideFields: Array<{
    entityType: "race" | "session";
    entityId: string;
    fieldName: string;
  }> = findChangedFields(raceRows[0], input.race).map(
    (fieldName) => ({ entityType: "race" as const, entityId: raceId, fieldName }),
  );
  const existingSessions = new Map(ownedSessions.map((session) => [session.id, session]));
  for (const session of input.sessions) {
    const existing = existingSessions.get(session.id);
    if (!existing) continue;
    overrideFields.push(
      ...findChangedFields(existing, session)
        .filter((fieldName) => fieldName !== "id")
        .map((fieldName) => ({
          entityType: "session" as const,
          entityId: session.id,
          fieldName,
        })),
    );
  }

  const queries: D1BatchQuery[] = [
    db
      .update(races)
      .set({ ...input.race, updatedAt: now })
      .where(eq(races.id, raceId)),
  ];

  for (const session of input.sessions) {
    queries.push(
      db
        .update(sessions)
        .set({
          name: session.name,
          startTimeUtc: session.startTimeUtc,
          isMustWatch: session.isMustWatch,
          updatedAt: now,
        })
        .where(and(eq(sessions.id, session.id), eq(sessions.raceId, raceId))),
    );
  }

  queries.push(
    db
      .insert(raceContents)
      .values({
        id: crypto.randomUUID(),
        raceId,
        ...input.content,
        aiStatus: "needs_review",
        aiGenerated: false,
        reviewedByAdmin: false,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: raceContents.raceId,
        set: {
          ...input.content,
          aiStatus: "needs_review",
          aiGenerated: false,
          reviewedByAdmin: false,
          updatedAt: now,
        },
      }),
  );

  for (const override of overrideFields) {
    queries.push(
      db
        .insert(manualOverrides)
        .values({
          id: crypto.randomUUID(),
          ...override,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            manualOverrides.entityType,
            manualOverrides.entityId,
            manualOverrides.fieldName,
          ],
          set: { updatedAt: now },
        }),
    );
  }
  await runD1Batch(db, queries);
}

export async function markAdminRaceReviewed(raceId: string): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const now = new Date().toISOString();
  const sessionRows = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(eq(sessions.raceId, raceId));
  const contentRows = await db
    .select({ id: raceContents.id })
    .from(raceContents)
    .where(eq(raceContents.raceId, raceId))
    .limit(1);
  const reviewedEntityIds = [
    raceId,
    ...sessionRows.map((session) => session.id),
    ...contentRows.map((content) => content.id),
  ];

  await runD1Batch(db, [
    db
      .update(races)
      .set({ needsReview: false, updatedAt: now })
      .where(eq(races.id, raceId)),
    db
      .update(sessions)
      .set({ needsReview: false, updatedAt: now })
      .where(eq(sessions.raceId, raceId)),
    db
      .update(raceContents)
      .set({
        aiStatus: "reviewed",
        reviewedByAdmin: true,
        updatedAt: now,
      })
      .where(eq(raceContents.raceId, raceId)),
    db
      .update(changeLogs)
      .set({ changeStatus: "auto_applied" })
      .where(
        and(
          inArray(changeLogs.entityId, reviewedEntityIds),
          eq(changeLogs.changeStatus, "needs_review"),
        ),
      ),
  ]);
}

export async function publishAdminRace(raceId: string): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const [raceRows, contentRows, sessionRows] = await Promise.all([
    db
      .select({ needsReview: races.needsReview })
      .from(races)
      .where(eq(races.id, raceId))
      .limit(1),
    db
      .select({ aiStatus: raceContents.aiStatus })
      .from(raceContents)
      .where(eq(raceContents.raceId, raceId))
      .limit(1),
    db
      .select({ needsReview: sessions.needsReview })
      .from(sessions)
      .where(eq(sessions.raceId, raceId)),
  ]);

  if (
    !canPublishAdminRace({
      raceNeedsReview: raceRows[0]?.needsReview ?? true,
      sessionNeedsReview: sessionRows.some((session) => session.needsReview),
      aiStatus: contentRows[0]?.aiStatus ?? "empty",
    })
  ) {
    throw new Error("Race must be reviewed before publishing");
  }

  const now = new Date().toISOString();
  await runD1Batch(db, [
    db
      .update(races)
      .set({ publishStatus: "published", updatedAt: now })
      .where(eq(races.id, raceId)),
    db
      .update(raceContents)
      .set({ aiStatus: "published", updatedAt: now })
      .where(eq(raceContents.raceId, raceId)),
  ]);
}

export async function unpublishAdminRace(raceId: string): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  await db
    .update(races)
    .set({ publishStatus: "draft", updatedAt: new Date().toISOString() })
    .where(eq(races.id, raceId));
}

export async function generateAdminAiDraft(
  raceId: string,
  formData: FormData,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const contentRows = await db
    .select({ aiStatus: raceContents.aiStatus })
    .from(raceContents)
    .where(eq(raceContents.raceId, raceId))
    .limit(1);
  parseAdminGenerationConfirmation(formData, contentRows[0]?.aiStatus ?? "empty");
  const status = await generateRaceContentDraft(
    db,
    raceId,
    new OpenAiContentGenerator(await getOpenAiApiKey()),
  );
  if (status === "failed") throw new Error("AI content generation failed");
}

export async function applyAdminAiDraft(
  raceId: string,
  content: AiContentFields,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const draftRows = await db
    .select({ id: aiContentDrafts.id, summary: aiContentDrafts.summaryThreeLines })
    .from(aiContentDrafts)
    .where(eq(aiContentDrafts.raceId, raceId))
    .limit(1);
  if (!draftRows[0] || !draftRows[0].summary) throw new Error("AI draft not found");
  const now = new Date().toISOString();
  await runD1Batch(db, [
    db
      .insert(raceContents)
      .values({
        id: crypto.randomUUID(),
        raceId,
        ...content,
        aiStatus: "needs_review",
        aiGenerated: true,
        reviewedByAdmin: false,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: raceContents.raceId,
        set: {
          ...content,
          aiStatus: "needs_review",
          aiGenerated: true,
          reviewedByAdmin: false,
          updatedAt: now,
        },
      }),
    db
      .update(aiContentDrafts)
      .set({ ...content, status: "applied", updatedAt: now })
      .where(eq(aiContentDrafts.raceId, raceId)),
  ]);
}

export async function createAdminManualSession(
  raceId: string,
  input: AdminSessionMutationInput,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const now = new Date().toISOString();

  await runD1Batch(db, [
    db.insert(sessions).values({
      id: crypto.randomUUID(),
      raceId,
      ...input,
      importanceLevel: input.type === "race" ? 3 : 1,
      sourceKey: null,
      needsReview: false,
      createdAt: now,
      updatedAt: now,
    }),
    db
      .update(races)
      .set({ needsReview: true, updatedAt: now })
      .where(eq(races.id, raceId)),
  ]);
}

export async function deleteAdminManualSession(
  raceId: string,
  sessionId: string,
): Promise<void> {
  await requireAdminSession();
  const db = await requireRace(raceId);
  const manualRows = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.raceId, raceId),
        isNull(sessions.sourceKey),
      ),
    )
    .limit(1);
  if (!manualRows[0]) {
    throw new Error("Only manual sessions can be deleted");
  }

  const now = new Date().toISOString();
  await runD1Batch(db, [
    db
      .delete(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.raceId, raceId))),
    db
      .update(races)
      .set({ needsReview: true, updatedAt: now })
      .where(eq(races.id, raceId)),
  ]);
}
