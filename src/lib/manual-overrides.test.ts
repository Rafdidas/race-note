import assert from "node:assert/strict";
import test from "node:test";
import { findChangedFields } from "@/lib/manual-overrides";

test("returns only administrator-edited fields", () => {
  assert.deepEqual(
    findChangedFields(
      { name: "Australian GP", country: null, startDate: "2026-03-06" },
      { name: "Australian Grand Prix", country: null, startDate: "2026-03-06" },
    ),
    ["name"],
  );
});

