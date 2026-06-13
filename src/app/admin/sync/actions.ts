"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { runAllScheduleSync } from "@/lib/sync/all-sync";

export async function runAllSync(): Promise<never> {
  let status = "success";
  try {
    await requireAdminSession();
    const result = await runAllScheduleSync(await getDb());
    status = result.failures > 0 ? "partial" : "success";
    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/admin");
    revalidatePath("/admin/sync");
    revalidatePath("/admin/races");
  } catch {
    redirect("/admin/sync?status=error");
  }
  redirect(`/admin/sync?status=${status}`);
}
