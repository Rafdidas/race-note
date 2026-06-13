import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge/StatusBadge";
import { getAdminDashboardData } from "@/lib/admin-data";

export default async function AdminDashboardPage() {
  const { adminRaces, recentLogs, reviewQueue, sources } =
    await getAdminDashboardData();

  return (
    <div className="admin-dashboard">
      <AdminPageHeader
        description="수집 상태와 검수 대기 항목을 한눈에 확인합니다."
        eyebrow="Admin / Dashboard"
        title="Control room"
      />

      <div className="admin-summary">
        <article className="admin-summary__card"><span>Sync success</span><strong>{sources.filter((item) => item.status === "success").length}</strong></article>
        <article className="admin-summary__card"><span>Needs review</span><strong>{reviewQueue.length}</strong></article>
        <article className="admin-summary__card"><span>Published</span><strong>{adminRaces.filter((race) => race.publishStatus === "published").length}</strong></article>
      </div>

      <section className="admin-section">
        <div className="admin-section__heading"><h2>Review queue</h2><span>{reviewQueue.length} items</span></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Series</th><th>Race</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {reviewQueue.map((item) => (
                <tr key={item.race.id}>
                  <td>{item.race.series}</td>
                  <td><Link href={`/admin/races/${item.race.id}`}>{item.race.title}</Link></td>
                  <td>{item.reason}</td>
                  <td><StatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section__heading"><h2>Recent logs</h2><Link href="/admin/sync">Open sync logs ↗</Link></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Source</th><th>Status</th><th>Time</th><th>Message</th></tr></thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id}><td>{log.source}</td><td><StatusBadge status={log.status} /></td><td>{log.time}</td><td>{log.message}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
