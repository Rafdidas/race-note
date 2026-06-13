import assert from "node:assert/strict";
import test from "node:test";
import {
  canPublishAdminRace,
  parseAdminSessionForm,
  parseAdminRaceForm,
} from "./admin-race-mutations";

function validFormData() {
  const formData = new FormData();
  formData.set("name", "24 Hours of Le Mans");
  formData.set("country", "France");
  formData.set("location", "Le Mans");
  formData.set("startDate", "2026-06-13");
  formData.set("endDate", "2026-06-14");
  formData.set("summaryThreeLines", "첫 줄\n둘째 줄\n셋째 줄");
  formData.set("mustWatchReason", "야간 주행을 보세요.");
  formData.set("beginnerRules", "여러 클래스가 함께 달립니다.");
  formData.set("raceVariables", "Night running\nTraffic");
  formData.set("sessionIds", "session-start");
  formData.set("session.session-start.name", "Race Start");
  formData.set("session.session-start.startTimeUtc", "2026-06-13T14:00:00Z");
  formData.set("session.session-start.mustWatch", "on");
  return formData;
}

test("parses a valid admin race correction form", () => {
  assert.deepEqual(parseAdminRaceForm(validFormData()), {
    race: {
      name: "24 Hours of Le Mans",
      country: "France",
      location: "Le Mans",
      startDate: "2026-06-13",
      endDate: "2026-06-14",
    },
    content: {
      summaryThreeLines: ["첫 줄", "둘째 줄", "셋째 줄"],
      mustWatchReason: "야간 주행을 보세요.",
      beginnerRules: "여러 클래스가 함께 달립니다.",
      raceVariables: ["Night running", "Traffic"],
    },
    sessions: [
      {
        id: "session-start",
        name: "Race Start",
        startTimeUtc: "2026-06-13T14:00:00Z",
        isMustWatch: true,
      },
    ],
  });
});

test("rejects invalid date ranges and non-UTC session timestamps", () => {
  const formData = validFormData();
  formData.set("endDate", "2026-06-12");
  assert.throws(() => parseAdminRaceForm(formData), /date range/i);

  formData.set("endDate", "2026-06-14");
  formData.set("session.session-start.startTimeUtc", "2026-06-13T14:00");
  assert.throws(() => parseAdminRaceForm(formData), /UTC/i);
});

test("allows publication only after race, sessions, and content are reviewed", () => {
  assert.equal(
    canPublishAdminRace({
      aiStatus: "reviewed",
      raceNeedsReview: false,
      sessionNeedsReview: false,
    }),
    true,
  );
  assert.equal(
    canPublishAdminRace({
      aiStatus: "needs_review",
      raceNeedsReview: false,
      sessionNeedsReview: false,
    }),
    false,
  );
  assert.equal(
    canPublishAdminRace({
      aiStatus: "reviewed",
      raceNeedsReview: true,
      sessionNeedsReview: false,
    }),
    false,
  );
});

test("parses a valid manually curated session", () => {
  const formData = new FormData();
  formData.set("name", "Final Hour");
  formData.set("type", "final_hour");
  formData.set("startTimeUtc", "2026-06-14T13:00:00Z");
  formData.set("mustWatch", "on");

  assert.deepEqual(parseAdminSessionForm(formData), {
    name: "Final Hour",
    type: "final_hour",
    startTimeUtc: "2026-06-14T13:00:00Z",
    isMustWatch: true,
  });
});

test("rejects invalid manual session types and non-UTC timestamps", () => {
  const formData = new FormData();
  formData.set("name", "Final Hour");
  formData.set("type", "invalid");
  formData.set("startTimeUtc", "2026-06-14T13:00:00Z");
  assert.throws(() => parseAdminSessionForm(formData), /session type/i);

  formData.set("type", "final_hour");
  formData.set("startTimeUtc", "2026-06-14T13:00");
  assert.throws(() => parseAdminSessionForm(formData), /UTC/i);
});
