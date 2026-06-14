import { drizzle } from "drizzle-orm/d1";
import openNextWorker, {
  BucketCachePurge,
  DOQueueHandler,
  DOShardedTagCache,
} from "./.open-next/worker.js";
import * as schema from "./src/db/schema";
import { runAutomaticAiGeneration } from "./src/lib/ai/content-generation";
import { OpenAiContentGenerator } from "./src/lib/ai/openai-content-generator";
import { runAllScheduleSync } from "./src/lib/sync/all-sync";

export { BucketCachePurge, DOQueueHandler, DOShardedTagCache };

type ScheduledExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

type ScheduledController = {
  cron: string;
};

const worker = {
  fetch: openNextWorker.fetch,
  async scheduled(
    controller: ScheduledController,
    env: CloudflareEnv,
    ctx: ScheduledExecutionContext,
  ) {
    if (!env.DB) {
      throw new Error("RaceNote D1 binding 'DB' is missing");
    }
    const db = drizzle(env.DB, { schema });
    if (controller.cron === "0 1 * * *") {
      if (!env.OPENAI_API_KEY) {
        throw new Error("RaceNote secret 'OPENAI_API_KEY' is missing");
      }
      ctx.waitUntil(
        runAutomaticAiGeneration(db, new OpenAiContentGenerator(env.OPENAI_API_KEY)),
      );
      return;
    }
    ctx.waitUntil(runAllScheduleSync(db));
  },
};

export default worker;
