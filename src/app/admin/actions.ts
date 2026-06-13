"use server";

import { redirect } from "next/navigation";
import {
  createAdminSession,
  deleteAdminSession,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export type AdminLoginState = {
  message: string;
};

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return { message: "비밀번호를 확인해 주세요." };
  }

  try {
    if (!(await isValidAdminPassword(password))) {
      return { message: "비밀번호를 확인해 주세요." };
    }

    await createAdminSession();
  } catch {
    return { message: "관리자 인증을 사용할 수 없습니다." };
  }

  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  try {
    await deleteAdminSession();
  } finally {
    redirect("/admin/login");
  }
}
