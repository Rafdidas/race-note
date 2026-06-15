import assert from "node:assert/strict";
import test from "node:test";
import {
  safeGenerationError,
  selectAutomaticAiTargets,
} from "./ai/content-generation";

const candidate = (
  id: string,
  startDate: string,
  aiStatus: string | null = "empty",
  draftStatus: string | null = null,
) => ({ id, startDate, aiStatus, draftStatus });

test("selects at most three eligible races in the inclusive fourteen-day window", () => {
  const selected = selectAutomaticAiTargets(
    [
      candidate("later", "2026-06-20"),
      candidate("today", "2026-06-14"),
      candidate("third", "2026-06-16", "needs_review"),
      candidate("fourth", "2026-06-17", "generated"),
      candidate("outside", "2026-06-29"),
      candidate("past", "2026-06-13"),
    ],
    "2026-06-14",
  );
  assert.deepEqual(selected.map((item) => item.id), ["today", "third", "fourth"]);
});

test("excludes protected content and races with a ready draft", () => {
  const selected = selectAutomaticAiTargets(
    [
      candidate("reviewed", "2026-06-15", "reviewed"),
      candidate("published", "2026-06-16", "published"),
      candidate("ready", "2026-06-17", "empty", "ready"),
      candidate("applied", "2026-06-18", "empty", "applied"),
    ],
    "2026-06-14",
  );
  assert.deepEqual(selected.map((item) => item.id), ["applied"]);
});

test("keeps safe AI failure categories for administrator diagnostics", () => {
  assert.equal(
    safeGenerationError(new Error("OpenAI request failed (429)")),
    "OpenAI request failed (429)",
  );
  assert.equal(
    safeGenerationError(new Error("OpenAI structured output is invalid")),
    "OpenAI structured output is invalid",
  );
  assert.equal(
    safeGenerationError(new DOMException("request timed out", "TimeoutError")),
    "OpenAI request timed out",
  );
  assert.equal(
    safeGenerationError(new Error("secret provider detail")),
    "AI content generation failed",
  );
});
