import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchJolpicaJson } from "@/lib/sync/f1-sync";

function stubFetcher(responses: Array<() => Response>): {
  fetcher: typeof fetch;
  calls: () => number;
} {
  let index = 0;
  const fetcher = (async () => {
    const make = responses[index];
    index += 1;
    if (!make) throw new Error("stub fetcher exhausted");
    return make();
  }) as typeof fetch;
  return { fetcher, calls: () => index };
}

const ok = () => new Response(JSON.stringify({ ok: true }), { status: 200 });
const status = (code: number) => () => new Response("", { status: code });

test("fetchJolpicaJson returns JSON on first success without retrying", async () => {
  const { fetcher, calls } = stubFetcher([ok]);
  const body = await fetchJolpicaJson(fetcher, "https://example.test/a", 0);
  assert.deepEqual(body, { ok: true });
  assert.equal(calls(), 1);
});

test("fetchJolpicaJson retries once after HTTP 429 and succeeds", async () => {
  const { fetcher, calls } = stubFetcher([status(429), ok]);
  const body = await fetchJolpicaJson(fetcher, "https://example.test/a", 0);
  assert.deepEqual(body, { ok: true });
  assert.equal(calls(), 2);
});

test("fetchJolpicaJson retries once after HTTP 503 and rethrows second failure", async () => {
  const { fetcher, calls } = stubFetcher([status(503), status(503)]);
  await assert.rejects(
    () => fetchJolpicaJson(fetcher, "https://example.test/a", 0),
    /HTTP 503/,
  );
  assert.equal(calls(), 2);
});

test("fetchJolpicaJson does not retry non-retryable HTTP errors", async () => {
  const { fetcher, calls } = stubFetcher([status(404), ok]);
  await assert.rejects(
    () => fetchJolpicaJson(fetcher, "https://example.test/a", 0),
    /HTTP 404/,
  );
  assert.equal(calls(), 1);
});
