import { drizzle } from "drizzle-orm/d1";
import openNextWorker, {
  BucketCachePurge,
  DOQueueHandler,
  DOShardedTagCache,
} from "./.open-next/worker.js";
import * as schema from "./src/db/schema";
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
    _controller: ScheduledController,
    env: CloudflareEnv,
    ctx: ScheduledExecutionContext,
  ) {
    if (!env.DB) {
      throw new Error("RaceNote D1 binding 'DB' is missing");
    }
    const db = drizzle(env.DB, { schema });
    ctx.waitUntil(runAllScheduleSync(db));
  },
};

export default worker;
