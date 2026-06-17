import assert from "node:assert/strict";
import test from "node:test";
import { scheduleSourceRequestHeaders, safeScheduleSyncError } from "@/lib/sync/source-runner";

test("identifies RaceNote when requesting the WRC official API", () => {
  const headers = scheduleSourceRequestHeaders("WRC");

  assert.equal(headers.get("accept"), "application/json,text/html");
  assert.match(headers.get("user-agent") ?? "", /^RaceNote\//);
});

test("does not add a custom user agent for other schedule sources", () => {
  const headers = scheduleSourceRequestHeaders("F1");

  assert.equal(headers.get("user-agent"), null);
});

test("passes through HTTP status error messages", () => {
  const error = new Error("WRC source returned HTTP 403");
  assert.equal(safeScheduleSyncError(error, "WRC"), "WRC source returned HTTP 403");
});

test("passes through too-large response message", () => {
  const error = new Error("Schedule source response was too large");
  assert.equal(
    safeScheduleSyncError(error, "WEC"),
    "Schedule source response was too large",
  );
});

test("normalises AbortError timeout to safe message", () => {
  const error = new DOMException("The user aborted a request.", "AbortError");
  assert.equal(
    safeScheduleSyncError(error, "F1"),
    "F1 schedule source request timed out",
  );
});

test("normalises TimeoutError to safe message", () => {
  const error = new DOMException("Signal timed out.", "TimeoutError");
  assert.equal(
    safeScheduleSyncError(error, "WEC"),
    "WEC schedule source request timed out",
  );
});

test("sanitises unrecognised Error messages to the generic fallback", () => {
  const error = new Error("Enabled sync source abc-123 is missing");
  assert.equal(safeScheduleSyncError(error, "F1"), "F1 schedule sync failed");
});

test("sanitises D1 batch error containing SQL and parameters", () => {
  const error = new Error(
    "D1_ERROR: SQLITE_ERROR: no such table: sessions — executed SQL: INSERT INTO sessions (id, race_id) VALUES (?, ?) with params [\"abc\", \"def\"]",
  );
  assert.equal(safeScheduleSyncError(error, "F1"), "F1 schedule sync failed");
});

test("sanitises unexpected parse error", () => {
  const error = new Error("Unexpected token < at position 0");
  assert.equal(safeScheduleSyncError(error, "WRC"), "WRC schedule sync failed");
});

test("handles non-Error thrown values", () => {
  assert.equal(safeScheduleSyncError("string error", "WEC"), "WEC schedule sync failed");
  assert.equal(safeScheduleSyncError(null, "F1"), "F1 schedule sync failed");
  assert.equal(safeScheduleSyncError(42, "WRC"), "WRC schedule sync failed");
});

test("truncates allowed messages that exceed 160 characters", () => {
  const longUrl = "x".repeat(200);
  const error = new Error(`WEC source returned HTTP 503 from ${longUrl}`);
  const result = safeScheduleSyncError(error, "WEC");
  assert.ok(result.length <= 160);
  assert.ok(result.startsWith("WEC source returned HTTP 503"));
});
