import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";
import { f1Drivers } from "@/data/f1-season";

export const metadata: Metadata = {
  title: "F1 드라이버",
  description: "2026 F1 드라이버 순위와 드라이버별 관전 포인트",
};

const rankedDrivers = f1Drivers.filter((driver) => driver.position && driver.points);

export default function F1DriversPage() {
  return (
    <div className="public-page f1-page f1-drivers-page">
      <PageHeader
        description="2026 시즌 F1 드라이버를 순위, 팀, 국적, 포인트와 입문자 관전 포인트 중심으로 정리합니다."
        eyebrow="드라이버 인덱스"
        index="D/01"
        meta="2026 Formula 1"
        title="드라이버"
      />

      <section className="f1-page__content container">
        <div className="f1-page__podium" aria-label="드라이버 순위 상위 3명">
          {rankedDrivers.slice(0, 3).map((driver) => (
            <article className="f1-page__podium-card" key={driver.slug}>
              <span>{driver.position}</span>
              <strong>{driver.name}</strong>
              <p>{driver.team}</p>
              <small>{driver.nationality} · {driver.points} PTS</small>
            </article>
          ))}
        </div>
      </section>

      <section className="f1-page__content container">
        <div className="f1-page__section-heading">
          <SectionLabel index="02">드라이버 순위</SectionLabel>
          <p className="type-korean">현재 화면 데이터는 공식 라인업과 임시 순위 요약을 바탕으로 한 전환용 데이터입니다.</p>
        </div>
        <div className="f1-page__table" role="table" aria-label="F1 드라이버 순위">
          <div className="f1-page__table-row f1-page__table-row--head" role="row">
            <span>POS</span>
            <span>DRIVER</span>
            <span>NATIONALITY</span>
            <span>TEAM</span>
            <span>PTS</span>
          </div>
          {rankedDrivers.map((driver) => (
            <div className="f1-page__table-row" role="row" key={driver.slug}>
              <span>{driver.position}</span>
              <strong>{driver.name} <em>{driver.code}</em></strong>
              <span>{driver.nationality}</span>
              <span>{driver.team}</span>
              <span>{driver.points}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="f1-page__content container">
        <div className="f1-page__section-heading">
          <SectionLabel index="03">드라이버 노트</SectionLabel>
          <p className="type-korean">사진 없이 번호, 팀, 국적, 스타일 문장으로 드라이버를 구분합니다.</p>
        </div>
        <div className="f1-page__card-grid">
          {f1Drivers.map((driver) => (
            <article className="f1-page__driver-card" key={driver.slug}>
              <div>
                <span>#{driver.number}</span>
                <small>{driver.nationality}</small>
              </div>
              <h2>{driver.name}</h2>
              <p className="f1-page__meta">{driver.team}</p>
              <p className="type-korean">{driver.note}</p>
              <strong className="type-korean">{driver.style}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
