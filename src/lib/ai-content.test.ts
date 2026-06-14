import assert from "node:assert/strict";
import test from "node:test";
import { parseAiContentFields } from "./ai-content";

const validContent = {
  summaryThreeLines: ["첫 줄", "둘째 줄", "셋째 줄"],
  keyDriversOrTeams: null,
  raceVariables: ["날씨", "타이어"],
  beginnerRules: "세션별 역할을 먼저 확인하세요.",
  mustWatchReason: "전략 변화가 잘 드러나는 레이스입니다.",
  notificationText: "이번 주말 레이스를 확인하세요.",
  seoTitle: "RaceNote 레이스 가이드",
  seoDescription: "입문자를 위한 레이스 일정과 관전 포인트입니다.",
};

test("parses all eight bounded AI content fields", () => {
  assert.deepEqual(parseAiContentFields(validContent), validContent);
});

test("requires exactly three non-empty summary lines", () => {
  assert.throws(
    () => parseAiContentFields({ ...validContent, summaryThreeLines: ["하나", "둘"] }),
    /summaryThreeLines/,
  );
  assert.throws(
    () => parseAiContentFields({ ...validContent, summaryThreeLines: ["하나", " ", "셋"] }),
    /summaryThreeLines/,
  );
});

test("rejects malformed and oversized AI content", () => {
  assert.throws(() => parseAiContentFields(null), /AI content/);
  assert.throws(
    () => parseAiContentFields({ ...validContent, notificationText: "가".repeat(121) }),
    /notificationText/,
  );
  assert.throws(
    () => parseAiContentFields({ ...validContent, raceVariables: Array(6).fill("변수") }),
    /raceVariables/,
  );
});
