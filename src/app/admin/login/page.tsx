import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm/AdminLoginForm";
import { hasAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Login" };

export default async function AdminLoginPage() {
  if (await hasAdminSession()) {
    redirect("/admin");
  }

  return (
    <main className="admin-login">
      <div className="admin-login__panel">
        <div className="admin-login__brand">
          <strong>R/N</strong>
          <span>Control room access</span>
        </div>
        <div>
          <span className="admin-login__index">A/00 · Admin login</span>
          <h1>RaceNote<br />Admin</h1>
          <p className="type-korean">관리자 비밀번호로 운영 화면에 접근합니다.</p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
