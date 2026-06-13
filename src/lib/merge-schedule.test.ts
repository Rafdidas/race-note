import assert from "node:assert/strict";
import test from "node:test";
import { mergeScheduleFields } from "@/lib/sync/merge-schedule";

test("returns no changes when source and stored fields are equal", () => {
  assert.deepEqual(
    mergeScheduleFields({
      entityType: "race",
      entityId: "race-1",
      current: { name: "Australian GP", country: "Australia" },
      incoming: { name: "Australian GP", country: "Australia" },
      protectedFields: new Set(),
    }),
    { patch: {}, changes: [], needsReview: false, skippedCount: 0 },
  );
});

test("applies unprotected source changes and marks them for review", () => {
  assert.deepEqual(
    mergeScheduleFields({
      entityType: "session",
      entityId: "session-1",
      current: { name: "Race", startTimeUtc: "2026-03-08T04:00:00.000Z" },
      incoming: { name: "Race", startTimeUtc: "2026-03-08T05:00:00.000Z" },
      protectedFields: new Set(),
    }),
    {
      patch: { startTimeUtc: "2026-03-08T05:00:00.000Z" },
      changes: [
        {
          entityType: "session",
          entityId: "session-1",
          fieldName: "startTimeUtc",
          oldValue: "2026-03-08T04:00:00.000Z",
          newValue: "2026-03-08T05:00:00.000Z",
          changeStatus: "needs_review",
        },
      ],
      needsReview: true,
      skippedCount: 0,
    },
  );
});

test("keeps protected fields and records ignored source conflicts", () => {
  assert.deepEqual(
    mergeScheduleFields({
      entityType: "race",
      entityId: "race-1",
      current: { location: "관리자 수정 장소", country: "Australia" },
      incoming: { location: "Melbourne", country: "Australia" },
      protectedFields: new Set(["location"]),
    }),
    {
      patch: {},
      changes: [
        {
          entityType: "race",
          entityId: "race-1",
          fieldName: "location",
          oldValue: "관리자 수정 장소",
          newValue: "Melbourne",
          changeStatus: "ignored",
        },
      ],
      needsReview: false,
      skippedCount: 1,
    },
  );
});

