import assert from "node:assert/strict";
import test from "node:test";
import { chunkD1Values } from "./d1-helpers";

test("chunks D1 bound values below the per-query safety limit", () => {
  const values = Array.from({ length: 110 }, (_, index) => `session-${index}`);

  assert.deepEqual(
    chunkD1Values(values).map((chunk) => chunk.length),
    [90, 20],
  );
});

test("does not return an empty D1 value chunk", () => {
  assert.deepEqual(chunkD1Values([]), []);
});
