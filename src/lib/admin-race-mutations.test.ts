import assert from "node:assert/strict";
import test from "node:test";
import {
  canPublishAdminRace,
  parseAdminAiDraftForm,
  parseAdminGenerationConfirmation,
  parseAdminSessionForm,
  parseAdminRaceForm,
  parseRaceFactsForm,
  parseRaceHistoryForm,
  parseWatchTargetForm,
} from "./admin-race-mutations";

function fd(entries: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) form.set(key, value);
  return form;
}

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
  formData.set("keyDriversOrTeams", "확인 가능한 참가 정보");
  formData.set("notificationText", "주말 레이스를 확인하세요.");
  formData.set("seoTitle", "르망 24시 관전 가이드");
  formData.set("seoDescription", "르망 24시 일정과 관전 포인트");
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
      keyDriversOrTeams: "확인 가능한 참가 정보",
      notificationText: "주말 레이스를 확인하세요.",
      seoTitle: "르망 24시 관전 가이드",
      seoDescription: "르망 24시 일정과 관전 포인트",
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

test("parses all eight editable AI draft fields", () => {
  const formData = validFormData();
  assert.deepEqual(parseAdminAiDraftForm(formData), {
    summaryThreeLines: ["첫 줄", "둘째 줄", "셋째 줄"],
    keyDriversOrTeams: "확인 가능한 참가 정보",
    raceVariables: ["Night running", "Traffic"],
    beginnerRules: "여러 클래스가 함께 달립니다.",
    mustWatchReason: "야간 주행을 보세요.",
    notificationText: "주말 레이스를 확인하세요.",
    seoTitle: "르망 24시 관전 가이드",
    seoDescription: "르망 24시 일정과 관전 포인트",
  });
});

test("requires explicit confirmation before regenerating protected content", () => {
  assert.throws(
    () => parseAdminGenerationConfirmation(new FormData(), "reviewed"),
    /confirmation/i,
  );
  const confirmed = new FormData();
  confirmed.set("confirmRegeneration", "on");
  assert.doesNotThrow(() => parseAdminGenerationConfirmation(confirmed, "published"));
  assert.doesNotThrow(() => parseAdminGenerationConfirmation(new FormData(), "empty"));
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

test("parses facts form with numeric coercion and empty-to-null", () => {
  const input = parseRaceFactsForm(fd({
    trackLength: "5.807km",
    laps: "53",
    corners: "",
    drsZones: "1",
  }));
  assert.equal(input.trackLength, "5.807km");
  assert.equal(input.laps, 53);
  assert.equal(input.corners, null);
  assert.equal(input.drsZones, 1);
  assert.equal(input.circuitName, null);
});

test("rejects non-numeric facts number field", () => {
  assert.throws(() => parseRaceFactsForm(fd({ laps: "abc" })));
});

test("parses history form with season validation", () => {
  const input = parseRaceHistoryForm(fd({ season: "2025", winnerDriverName: "Verstappen" }));
  assert.equal(input.season, 2025);
  assert.equal(input.winnerDriverName, "Verstappen");
  assert.equal(input.winnerTeamName, null);
});

test("rejects invalid season", () => {
  assert.throws(() => parseRaceHistoryForm(fd({ season: "abc" })));
  assert.throws(() => parseRaceHistoryForm(fd({ season: "1700" })));
});

test("parses watch target form", () => {
  const input = parseWatchTargetForm(fd({
    targetType: "driver",
    targetName: "Verstappen",
    title: "주목",
    reason: "고속 코너 강점",
  }));
  assert.deepEqual(input, {
    targetType: "driver",
    targetName: "Verstappen",
    title: "주목",
    reason: "고속 코너 강점",
  });
});

test("rejects watch target with invalid type or missing fields", () => {
  assert.throws(() => parseWatchTargetForm(fd({ targetType: "alien", targetName: "x", reason: "y" })));
  assert.throws(() => parseWatchTargetForm(fd({ targetType: "driver", targetName: "", reason: "y" })));
});
