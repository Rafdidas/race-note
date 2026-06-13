import type { BatchItem } from "drizzle-orm/batch";
import type { RaceNoteDb } from "@/lib/db";

const D1_VALUE_CHUNK_SIZE = 90;
export type D1BatchQuery = BatchItem<"sqlite">;

export function chunkD1Values<T>(values: T[]): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += D1_VALUE_CHUNK_SIZE) {
    chunks.push(values.slice(index, index + D1_VALUE_CHUNK_SIZE));
  }
  return chunks;
}

export async function runD1Batch(
  db: RaceNoteDb,
  queries: D1BatchQuery[],
): Promise<void> {
  if (queries.length === 0) return;
  await db.batch(
    queries as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]],
  );
}
