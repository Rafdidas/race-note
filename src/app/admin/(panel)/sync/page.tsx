import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge/StatusBadge";
import { recentLogs, syncSources } from "@/data/mock-admin";

export const metadata: Metadata = { title: "Sync Logs" };

export default function AdminSyncPage() {
  return (
    <div className="admin-sync">
      <AdminPageHeader
        actions={<button className="admin-button admin-button--primary" disabled type="button">Run sync</button>}
        description="일정 소스별 마지막 수집 결과와 오류를 확인합니다."
        eyebrow="Admin / Operations"
        title="Sync logs"
      />
      <p className="admin-notice type-korean">실제 D1과 수집 작업이 연결되기 전까지 수동 동기화 버튼은 비활성화됩니다.</p>

      <section className="admin-section">
        <div className="admin-section__heading"><h2>Source status</h2><span>Last run · 09:06 KST</span></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Source</th><th>Status</th><th>Last sync</th><th>Add</th><th>Update</th><th>Fail</th></tr></thead>
            <tbody>
              {syncSources.map((source) => (
                <tr key={source.series}>
                  <td>{source.series}</td><td><StatusBadge status={source.status} /></td><td>{source.lastSync}</td>
                  <td>{source.added}</td><td>{source.updated}</td><td>{source.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section__heading"><h2>Execution history</h2><span>{recentLogs.length} logs</span></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Source</th><th>Status</th><th>Time</th><th>Message</th></tr></thead>
            <tbody>{recentLogs.map((log) => <tr key={log.id}><td>{log.source}</td><td><StatusBadge status={log.status} /></td><td>{log.time}</td><td>{log.message}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
