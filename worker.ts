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

const worker = {
  fetch: openNextWorker.fetch,
  async scheduled(
    _controller: unknown,
    env: CloudflareEnv,
    ctx: ScheduledExecutionContext,
  ) {
    if (!env.DB) {
      throw new Error("RaceNote D1 binding 'DB' is missing");
    }
    ctx.waitUntil(runAllScheduleSync(drizzle(env.DB, { schema })));
  },
};

export default worker;
