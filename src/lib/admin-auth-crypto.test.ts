import assert from "node:assert/strict";
import test from "node:test";
import {
  createAdminSessionToken,
  hashAdminSessionToken,
  isAdminSessionExpired,
  verifyAdminPassword,
} from "./admin-auth-crypto";

test("verifies the configured admin password without accepting a different value", async () => {
  assert.equal(await verifyAdminPassword("correct horse", "correct horse", "secret"), true);
  assert.equal(await verifyAdminPassword("wrong horse", "correct horse", "secret"), false);
});

test("hashes the same session token deterministically without returning the raw token", async () => {
  const digest = await hashAdminSessionToken("raw-session-token", "session-secret");

  assert.equal(digest, await hashAdminSessionToken("raw-session-token", "session-secret"));
  assert.notEqual(digest, "raw-session-token");
});

test("creates unique URL-safe session tokens", () => {
  const first = createAdminSessionToken();
  const second = createAdminSessionToken();

  assert.notEqual(first, second);
  assert.match(first, /^[A-Za-z0-9_-]+$/);
});

test("detects expired admin sessions", () => {
  assert.equal(isAdminSessionExpired("2026-06-13T00:00:00.000Z", new Date("2026-06-13T00:00:01.000Z")), true);
  assert.equal(isAdminSessionExpired("2026-06-13T00:00:01.000Z", new Date("2026-06-13T00:00:00.000Z")), false);
});
