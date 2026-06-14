import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { connection } from "next/server";
import * as schema from "@/db/schema";

declare global {
  interface CloudflareEnv {
    DB?: D1Database;
    OPENAI_API_KEY?: string;
  }
}

export async function getOpenAiApiKey(): Promise<string> {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const { env } = await getCloudflareContext({ async: true });
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is missing");
  return env.OPENAI_API_KEY;
}

export async function getDb() {
  await connection();
  const { env } = await getCloudflareContext({ async: true });

  if (!env.DB) {
    throw new Error(
      "RaceNote D1 binding 'DB' is missing. Configure a local or remote D1 binding before loading public data.",
    );
  }

  return drizzle(env.DB, { schema });
}

export type RaceNoteDb = Awaited<ReturnType<typeof getDb>>;
