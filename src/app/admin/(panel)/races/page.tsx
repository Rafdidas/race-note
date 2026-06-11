import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge/StatusBadge";
import { adminRaces } from "@/data/mock-admin";

export const metadata: Metadata = { title: "Races" };

export default function AdminRacesPage() {
  return (
    <div className="admin-races">
      <AdminPageHeader
        description="수집된 레이스의 AI 검수 상태와 공개 상태를 관리합니다."
        eyebrow="Admin / Editorial"
        title="Races"
      />
      <div className="admin-filter" aria-label="레이스 필터">
        {["All", "F1", "WEC", "WRC", "Needs review", "Published", "Draft"].map((filter, index) => (
          <button className={index === 0 ? "is-active" : ""} key={filter} type="button">{filter}</button>
        ))}
      </div>
      <section className="admin-section">
        <div className="admin-section__heading"><h2>Race inventory</h2><span>{adminRaces.length} races</span></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Series</th><th>Race</th><th>Date</th><th>AI</th><th>Visibility</th><th>Review</th></tr></thead>
            <tbody>
              {adminRaces.map((race) => (
                <tr key={race.id}>
                  <td>{race.series}</td>
                  <td><Link href={`/admin/races/${race.id}`}>{race.title}</Link></td>
                  <td>{race.period}</td>
                  <td><StatusBadge status={race.aiStatus} /></td>
                  <td><StatusBadge status={race.publishStatus} /></td>
                  <td>{race.needsReview ? <StatusBadge status="needs-review" /> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
