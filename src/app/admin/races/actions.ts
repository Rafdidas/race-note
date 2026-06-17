"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminManualSession,
  deleteAdminManualSession,
  applyAdminAiDraft,
  generateAdminAiDraft,
  markAdminRaceReviewed,
  publishAdminRace,
  saveAdminRaceCorrection,
  unpublishAdminRace,
} from "@/lib/admin-race-editor";
import {
  saveAdminRaceFacts,
  createAdminRaceHistory,
  deleteAdminRaceHistory,
  createAdminWatchTarget,
  deleteAdminWatchTarget,
  reorderAdminWatchTarget,
} from "@/lib/admin-race-detail-editor";
import {
  parseAdminRaceForm,
  parseAdminAiDraftForm,
  parseAdminSessionForm,
  parseRaceFactsForm,
  parseRaceHistoryForm,
  parseWatchTargetForm,
} from "@/lib/admin-race-mutations";
import { parseAiContentFields } from "@/lib/ai-content";

function revalidateRace(raceId: string) {
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/admin");
  revalidatePath("/admin/races");
  revalidatePath(`/admin/races/${raceId}`);
}

function editorRedirect(
  raceId: string,
  status:
    | "saved" | "reviewed" | "published" | "unpublished"
    | "session-added" | "session-deleted" | "ai-generated" | "ai-applied"
    | "facts-saved" | "history-added" | "history-deleted"
    | "watch-added" | "watch-deleted" | "watch-moved" | "error",
  message?: string,
  tab?: string,
): never {
  const params = new URLSearchParams({ status });
  if (message) params.set("message", message);
  if (tab) params.set("tab", tab);
  redirect(`/admin/races/${raceId}?${params}`);
}

export async function generateAiDraft(raceId: string, formData: FormData) {
  try {
    await generateAdminAiDraft(raceId, formData);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "AI 초안을 생성하지 못했습니다. 기존 콘텐츠와 초안은 유지됩니다.");
  }
  editorRedirect(raceId, "ai-generated");
}

export async function applyAiDraft(raceId: string, formData: FormData) {
  try {
    await applyAdminAiDraft(
      raceId,
      parseAiContentFields(parseAdminAiDraftForm(formData)),
    );
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "AI 초안을 반영하지 못했습니다.");
  }
  editorRedirect(raceId, "ai-applied");
}

export async function saveAdminRace(raceId: string, formData: FormData) {
  try {
    await saveAdminRaceCorrection(raceId, parseAdminRaceForm(formData));
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "입력값을 확인하고 다시 시도해 주세요.");
  }
  editorRedirect(raceId, "saved");
}

export async function reviewAdminRace(raceId: string) {
  try {
    await markAdminRaceReviewed(raceId);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "검수 상태를 변경하지 못했습니다.");
  }
  editorRedirect(raceId, "reviewed");
}

export async function publishRace(raceId: string) {
  try {
    await publishAdminRace(raceId);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "검수를 완료한 뒤 공개해 주세요.");
  }
  editorRedirect(raceId, "published");
}

export async function unpublishRace(raceId: string) {
  try {
    await unpublishAdminRace(raceId);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "비공개 상태로 변경하지 못했습니다.");
  }
  editorRedirect(raceId, "unpublished");
}

export async function addManualSession(raceId: string, formData: FormData) {
  try {
    await createAdminManualSession(raceId, parseAdminSessionForm(formData));
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "세션 이름, 유형, UTC 시작 시각을 확인해 주세요.");
  }
  editorRedirect(raceId, "session-added");
}

export async function deleteManualSession(raceId: string, sessionId: string) {
  try {
    await deleteAdminManualSession(raceId, sessionId);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "수동으로 추가한 세션만 삭제할 수 있습니다.");
  }
  editorRedirect(raceId, "session-deleted");
}

export async function saveRaceFacts(raceId: string, formData: FormData) {
  try {
    await saveAdminRaceFacts(raceId, parseRaceFactsForm(formData));
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "Facts 입력값을 확인해 주세요.", "facts");
  }
  editorRedirect(raceId, "facts-saved", undefined, "facts");
}

export async function addRaceHistory(raceId: string, formData: FormData) {
  try {
    await createAdminRaceHistory(raceId, parseRaceHistoryForm(formData));
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "연도와 입력값을 확인해 주세요.", "history");
  }
  editorRedirect(raceId, "history-added", undefined, "history");
}

export async function deleteRaceHistory(raceId: string, historyId: string) {
  try {
    await deleteAdminRaceHistory(raceId, historyId);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "기록을 삭제하지 못했습니다.", "history");
  }
  editorRedirect(raceId, "history-deleted", undefined, "history");
}

export async function addWatchTarget(raceId: string, formData: FormData) {
  try {
    await createAdminWatchTarget(raceId, parseWatchTargetForm(formData));
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "대상 유형, 이름, 이유를 확인해 주세요.", "watch");
  }
  editorRedirect(raceId, "watch-added", undefined, "watch");
}

export async function deleteWatchTarget(raceId: string, targetId: string) {
  try {
    await deleteAdminWatchTarget(raceId, targetId);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "대상을 삭제하지 못했습니다.", "watch");
  }
  editorRedirect(raceId, "watch-deleted", undefined, "watch");
}

export async function moveWatchTarget(
  raceId: string,
  targetId: string,
  direction: "up" | "down",
) {
  try {
    await reorderAdminWatchTarget(raceId, targetId, direction);
    revalidateRace(raceId);
  } catch {
    editorRedirect(raceId, "error", "순서를 변경하지 못했습니다.", "watch");
  }
  editorRedirect(raceId, "watch-moved", undefined, "watch");
}
