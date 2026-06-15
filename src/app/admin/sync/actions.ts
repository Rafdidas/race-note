"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAdminRuntime } from "@/lib/admin-runtime";
import { getDb } from "@/lib/db";
import { runAllScheduleSync } from "@/lib/sync/all-sync";

export async function runAllSync(): Promise<never> {
  try {
    await requireAdminSession();
  } catch {
    redirect("/admin/sync?status=error");
  }

  if (!getAdminRuntime(process.env.NODE_ENV).canRunScheduleSync) {
    redirect("/admin/sync?status=local-mock");
  }

  let status = "success";
  try {
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
