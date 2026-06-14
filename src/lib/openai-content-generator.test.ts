import assert from "node:assert/strict";
import test from "node:test";
import {
  OpenAiContentGenerator,
  type RaceContentGenerationContext,
} from "./ai/openai-content-generator";

const context: RaceContentGenerationContext = {
  seriesCode: "WEC",
  seriesName: "FIA World Endurance Championship",
  raceName: "24 Hours of Le Mans",
  country: "France",
  location: "Le Mans",
  venueName: "Circuit de la Sarthe",
  startDate: "2026-06-13",
  endDate: "2026-06-14",
  sessions: [{ name: "Race Start", startTimeUtc: "2026-06-13T14:00:00Z", isMustWatch: true }],
};

const output = {
  summaryThreeLines: ["첫 줄", "둘째 줄", "셋째 줄"],
  keyDriversOrTeams: null,
  raceVariables: ["날씨"],
  beginnerRules: "여러 클래스가 함께 달립니다.",
  mustWatchReason: "긴 흐름을 관찰하기 좋습니다.",
  notificationText: "르망 24시를 확인하세요.",
  seoTitle: "르망 24시 관전 가이드",
  seoDescription: "르망 24시 일정과 입문자 관전 포인트",
};

test("requests one strict structured gpt-5-nano response without tools", async () => {
  let requestBody: Record<string, unknown> | undefined;
  const generator = new OpenAiContentGenerator("secret", async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return Response.json({ output_text: JSON.stringify(output) });
  });

  assert.deepEqual(await generator.generate(context), output);
  assert.equal(requestBody?.model, "gpt-5-nano");
  assert.deepEqual(requestBody?.tools, []);
  assert.equal(requestBody?.max_output_tokens, 1200);
  assert.deepEqual(requestBody?.reasoning, { effort: "minimal" });
  assert.match(
    (
      requestBody?.input as Array<{ role: string; content: string }>
    )[0]?.content ?? "",
    /모든 자연어.*한국어/,
  );
  assert.match(
    (
      requestBody?.input as Array<{ role: string; content: string }>
    )[0]?.content ?? "",
    /노면.*코스 특성.*날씨/,
  );
  assert.equal(
    (requestBody?.text as { format?: { type?: string; strict?: boolean } }).format?.type,
    "json_schema",
  );
  assert.equal(
    (requestBody?.text as { format?: { type?: string; strict?: boolean } }).format?.strict,
    true,
  );
});

test("rejects provider failures and malformed structured output without retrying", async () => {
  let attempts = 0;
  const failed = new OpenAiContentGenerator("secret", async () => {
    attempts += 1;
    return new Response("provider detail", { status: 429 });
  });
  await assert.rejects(() => failed.generate(context), /OpenAI request failed/);
  assert.equal(attempts, 1);

  const malformed = new OpenAiContentGenerator("secret", async () =>
    Response.json({ output_text: "{\"summaryThreeLines\":[]}" }),
  );
  await assert.rejects(() => malformed.generate(context), /summaryThreeLines/);
});
