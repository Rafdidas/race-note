import type { Metadata } from "next";
import { runAllSync } from "@/app/admin/sync/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge/StatusBadge";
import { getAdminSyncOverview } from "@/lib/admin-data";
import { getAdminRuntime } from "@/lib/admin-runtime";

export const metadata: Metadata = { title: "Sync Logs" };

export default async function AdminSyncPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { lastRun, recentLogs, sources } = await getAdminSyncOverview();
  const runtime = getAdminRuntime(process.env.NODE_ENV);

  return (
    <div className="admin-sync">
      <AdminPageHeader
        actions={
          runtime.canRunScheduleSync ? (
            <form action={runAllSync}><button className="admin-button admin-button--primary" type="submit">Run all sync</button></form>
          ) : (
            <button className="admin-button admin-button--primary" disabled type="button">Sync unavailable locally</button>
          )
        }
        description="일정 소스별 마지막 수집 결과와 오류를 확인합니다."
        eyebrow="Admin / Operations"
        title="Sync logs"
      />
      {runtime.usesMockData ? (
        <p className="admin-notice type-korean">아래 소스 상태와 실행 이력은 UI 확인용 예시입니다. 실제 동기화 성공 여부는 배포된 관리자 화면에서 확인해 주세요.</p>
      ) : (
        <>
          {status === "success" ? <p className="admin-notice type-korean">F1, WEC, WRC 일정 수집을 완료했습니다. 변경된 일정은 검수 목록을 확인해 주세요.</p> : null}
          {status === "partial" ? <p className="admin-notice admin-notice--warning type-korean">일부 일정 소스 수집에 실패했습니다. 성공한 결과는 반영되었으며 아래 실행 로그에서 원인을 확인할 수 있습니다.</p> : null}
          {status === "error" ? <p className="admin-notice admin-notice--warning type-korean">일정 수집을 시작하지 못했습니다. 아래 실행 로그와 환경 설정을 확인해 주세요.</p> : null}
        </>
      )}

      <section className="admin-section">
        <div className="admin-section__heading"><h2>Source status</h2><span>Last run · {lastRun} KST</span></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Source</th><th>Status</th><th>Last sync</th><th>Add</th><th>Update</th><th>Fail</th></tr></thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id}>
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
