import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav/AdminNav";
import { hasAdminSession } from "@/lib/admin-auth";
import { getAdminRuntime } from "@/lib/admin-runtime";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const runtime = getAdminRuntime(process.env.NODE_ENV);

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-layout__main">
        {runtime.usesMockData ? (
          <aside className="admin-runtime-notice" role="status">
            <strong>Local mock data</strong>
            <span className="type-korean">
              이 화면은 UI 확인용 예시 데이터입니다. 실제 동기화 결과와 운영 상태는 배포된 관리자 화면에서 확인해 주세요.
            </span>
          </aside>
        ) : null}
        {children}
      </main>
    </div>
  );
}
