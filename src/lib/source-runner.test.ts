import assert from "node:assert/strict";
import test from "node:test";
import { scheduleSourceRequestHeaders } from "@/lib/sync/source-runner";

test("identifies RaceNote when requesting the WRC official API", () => {
  const headers = scheduleSourceRequestHeaders("WRC");

  assert.equal(headers.get("accept"), "application/json,text/html");
  assert.match(headers.get("user-agent") ?? "", /^RaceNote\//);
});

test("does not add a custom user agent for other schedule sources", () => {
  const headers = scheduleSourceRequestHeaders("F1");

  assert.equal(headers.get("user-agent"), null);
});
