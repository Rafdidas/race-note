import { AdminNav } from "@/components/admin/AdminNav/AdminNav";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-layout__main">{children}</main>
    </div>
  );
}
