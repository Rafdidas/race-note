import assert from "node:assert/strict";
import test from "node:test";
import { getAdminRuntime } from "./admin-runtime";

test("development admin uses clearly identified read-only mock data", () => {
  assert.deepEqual(getAdminRuntime("development"), {
    canRunScheduleSync: false,
    usesMockData: true,
  });
});

test("production admin uses live data and can run schedule sync", () => {
  assert.deepEqual(getAdminRuntime("production"), {
    canRunScheduleSync: true,
    usesMockData: false,
  });
});
