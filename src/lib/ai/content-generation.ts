import { asc, eq } from "drizzle-orm";
import {
  aiContentDrafts,
  raceContents,
  races,
  series,
  sessions,
} from "@/db/schema";
import type { AiContentFields } from "@/lib/ai-content";
import type { RaceContentGenerationContext } from "@/lib/ai/openai-content-generator";
import type { RaceNoteDb } from "@/lib/db";

export type AutomaticAiCandidate = {
  id: string;
  startDate: string;
  aiStatus: string | null;
  draftStatus: string | null;
};

export type ContentGenerator = {
  model: string;
  generate(context: RaceContentGenerationContext): Promise<AiContentFields>;
};

function addUtcDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function selectAutomaticAiTargets(
  candidates: AutomaticAiCandidate[],
  today: string,
): AutomaticAiCandidate[] {
  const lastDate = addUtcDays(today, 14);
  return [...candidates]
    .filter(
      (candidate) =>
        candidate.startDate >= today &&
        candidate.startDate <= lastDate &&
        (candidate.aiStatus === null ||
          candidate.aiStatus === "empty" ||
          candidate.aiStatus === "generated" ||
          candidate.aiStatus === "needs_review") &&
        candidate.draftStatus !== "ready",
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3);
}

function safeGenerationError(error: unknown): string {
  if (error instanceof Error && error.message.startsWith("OpenAI request failed")) {
    return error.message.slice(0, 160);
  }
  return "AI content generation failed";
}

async function getRaceGenerationContext(
  db: RaceNoteDb,
  raceId: string,
): Promise<RaceContentGenerationContext> {
  const raceRows = await db
    .select({
      seriesCode: series.code,
      seriesName: series.name,
      raceName: races.name,
      country: races.country,
      location: races.location,
      venueName: races.venueName,
      startDate: races.startDate,
      endDate: races.endDate,
    })
    .from(races)
    .innerJoin(series, eq(races.seriesId, series.id))
    .where(eq(races.id, raceId))
    .limit(1);
  const race = raceRows[0];
  if (!race) throw new Error("Race not found");
  const sessionRows = await db
    .select({
      name: sessions.name,
      startTimeUtc: sessions.startTimeUtc,
      isMustWatch: sessions.isMustWatch,
    })
    .from(sessions)
    .where(eq(sessions.raceId, raceId))
    .orderBy(asc(sessions.startTimeUtc));
  return { ...race, sessions: sessionRows };
}

export async function generateRaceContentDraft(
  db: RaceNoteDb,
  raceId: string,
  generator: ContentGenerator,
): Promise<"ready" | "failed"> {
  const now = new Date().toISOString();
  try {
    const content = await generator.generate(await getRaceGenerationContext(db, raceId));
    await db
      .insert(aiContentDrafts)
      .values({
        id: crypto.randomUUID(),
        raceId,
        ...content,
        status: "ready",
        model: generator.model,
        errorMessage: null,
        generatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: aiContentDrafts.raceId,
        set: {
          ...content,
          status: "ready",
          model: generator.model,
          errorMessage: null,
          generatedAt: now,
          updatedAt: now,
        },
      });
    return "ready";
  } catch (error) {
    await db
      .insert(aiContentDrafts)
      .values({
        id: crypto.randomUUID(),
        raceId,
        status: "failed",
        model: generator.model,
        errorMessage: safeGenerationError(error),
        generatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: aiContentDrafts.raceId,
        set: {
          status: "failed",
          model: generator.model,
          errorMessage: safeGenerationError(error),
          generatedAt: now,
          updatedAt: now,
        },
      });
    return "failed";
  }
}

export async function runAutomaticAiGeneration(
  db: RaceNoteDb,
  generator: ContentGenerator,
  today = new Date().toISOString().slice(0, 10),
): Promise<{ attempted: number; ready: number; failed: number }> {
  const rows = await db
    .select({
      id: races.id,
      startDate: races.startDate,
      aiStatus: raceContents.aiStatus,
      draftStatus: aiContentDrafts.status,
    })
    .from(races)
    .leftJoin(raceContents, eq(raceContents.raceId, races.id))
    .leftJoin(aiContentDrafts, eq(aiContentDrafts.raceId, races.id));
  const targets = selectAutomaticAiTargets(rows, today);
  let ready = 0;
  let failed = 0;
  for (const target of targets) {
    const status = await generateRaceContentDraft(db, target.id, generator);
    if (status === "ready") ready += 1;
    else failed += 1;
  }
  return { attempted: targets.length, ready, failed };
}
