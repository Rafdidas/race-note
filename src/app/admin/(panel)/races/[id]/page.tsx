import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge/StatusBadge";
import { adminRaces } from "@/data/mock-admin";

export const dynamicParams = false;

export function generateStaticParams() {
  return adminRaces.map((race) => ({ id: race.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const race = adminRaces.find((item) => item.id === id);
  return race ? { title: `Edit ${race.title}` } : {};
}

export default async function AdminRaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const race = adminRaces.find((item) => item.id === id);
  if (!race) notFound();

  return (
    <div className="admin-race-detail">
      <AdminPageHeader
        actions={<><button className="admin-button" disabled type="button">Save</button><button className="admin-button" disabled type="button">Generate AI</button><button className="admin-button" disabled type="button">Mark reviewed</button><button className="admin-button admin-button--primary" disabled type="button">Publish</button></>}
        description={`${race.series} · ${race.location} · ${race.period}`}
        eyebrow="Admin / Race detail"
        title={race.title}
      />
      <p className="admin-notice type-korean">편집 액션은 실제 D1과 관리자 인증 연결 후 활성화됩니다. 현재는 검수 화면 구조를 확인할 수 있습니다.</p>

      <section className="admin-editor-section">
        <div className="admin-editor-section__heading"><h2>Basic info</h2><StatusBadge status={race.publishStatus} /></div>
        <div className="admin-form-grid">
          <label>Series<input readOnly value={race.series} /></label>
          <label>Period<input readOnly value={race.period} /></label>
          <label className="admin-form-grid__wide">Race name<input readOnly value={race.title} /></label>
          <label className="admin-form-grid__wide">Location<input readOnly value={race.location} /></label>
        </div>
      </section>

      <section className="admin-editor-section">
        <div className="admin-editor-section__heading"><h2>Sessions</h2><span>{race.sessions.length} sessions</span></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Must</th><th>Date</th><th>Session</th><th>Time</th></tr></thead>
            <tbody>{race.sessions.map((session) => <tr key={session.name}><td>{session.mustWatch ? "YES" : "—"}</td><td>{session.date} {session.day}</td><td>{session.name}</td><td>{session.time} KST</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="admin-editor-section">
        <div className="admin-editor-section__heading"><h2>AI content</h2><StatusBadge status={race.aiStatus} /></div>
        <div className="admin-form-grid">
          <label className="admin-form-grid__wide">Summary<textarea readOnly rows={3} value={race.summary} /></label>
          <label className="admin-form-grid__wide">Beginner notes<textarea readOnly rows={4} value={race.beginnerNote} /></label>
        </div>
      </section>

      <section className="admin-editor-section">
        <div className="admin-editor-section__heading"><h2>Change logs</h2><StatusBadge status={race.needsReview ? "needs-review" : "reviewed"} /></div>
        <p className="admin-change-log">{race.needsReview ? "session.start_time 또는 콘텐츠 검수가 필요합니다." : "검수 대기 중인 변경사항이 없습니다."}</p>
      </section>
    </div>
  );
}
