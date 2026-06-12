import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

declare global {
  interface CloudflareEnv {
    DB?: D1Database;
  }
}

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.DB) {
    throw new Error(
      "RaceNote D1 binding 'DB' is missing. Configure a local or remote D1 binding before loading public data.",
    );
  }

  return drizzle(env.DB, { schema });
}
