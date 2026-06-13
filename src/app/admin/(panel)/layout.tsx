import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav/AdminNav";
import { hasAdminSession } from "@/lib/admin-auth";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-layout__main">{children}</main>
    </div>
  );
}
