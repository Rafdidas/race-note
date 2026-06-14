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
  parseAdminRaceForm,
  parseAdminAiDraftForm,
  parseAdminSessionForm,
} from "@/lib/admin-race-mutations";
import { parseAiContentFields } from "@/lib/ai-content";

function revalidateRace(raceId: string) {
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/admin");
  revalidatePath("/admin/races");
  revalidatePath(`/admin/races/${raceId}`);
}

function editorRedirect(raceId: string, status: "saved" | "reviewed" | "published" | "unpublished" | "session-added" | "session-deleted" | "ai-generated" | "ai-applied" | "error", message?: string): never {
  const params = new URLSearchParams({ status });
  if (message) params.set("message", message);
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
