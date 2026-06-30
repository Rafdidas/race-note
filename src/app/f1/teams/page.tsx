import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";
import { f1Teams } from "@/data/f1-season";

export const metadata: Metadata = {
  title: "F1 팀",
  description: "2026 F1 팀 라인업과 팀별 관전 포인트",
};

const rankedTeams = f1Teams.filter((team) => team.position && team.points);

export default function F1TeamsPage() {
  return (
    <div className="public-page f1-page f1-teams-page">
      <PageHeader
        description="2026 시즌 F1 팀을 컨스트럭터 순위, 드라이버 조합, 머신명, 팀별 관전 포인트 중심으로 정리합니다."
        eyebrow="팀 인덱스"
        index="T/01"
        meta="2026 Formula 1"
        title="팀"
      />

      <section className="f1-page__content container">
        <div className="f1-page__podium f1-page__podium--teams" aria-label="컨스트럭터 순위 상위 3팀">
          {rankedTeams.slice(0, 3).map((team) => (
            <article className={`f1-page__podium-card f1-page__team-tone--${team.tone}`} key={team.slug}>
              <span>{team.position}</span>
              <strong>{team.name}</strong>
              <p>{team.drivers.join(" / ")}</p>
              <small>{team.points} PTS</small>
            </article>
          ))}
        </div>
      </section>

      <section className="f1-page__content container">
        <div className="f1-page__section-heading">
          <SectionLabel index="02">컨스트럭터 표</SectionLabel>
          <p className="type-korean">팀별 드라이버 조합과 머신명을 먼저 보여주고, 상세 데이터는 Phase 2에서 DB로 연결합니다.</p>
        </div>
        <div className="f1-page__table f1-page__table--teams" role="table" aria-label="F1 팀 순위">
          <div className="f1-page__table-row f1-page__table-row--head" role="row">
            <span>POS</span>
            <span>TEAM</span>
            <span>DRIVERS</span>
            <span>CAR</span>
            <span>PTS</span>
          </div>
          {f1Teams.map((team) => (
            <div className="f1-page__table-row" role="row" key={team.slug}>
              <span>{team.position ?? "--"}</span>
              <strong>{team.name}</strong>
              <span>{team.drivers.join(" / ")}</span>
              <span>{team.car}</span>
              <span>{team.points ?? "--"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="f1-page__content container">
        <div className="f1-page__section-heading">
          <SectionLabel index="03">팀 카드</SectionLabel>
          <p className="type-korean">공식 로고 대신 팀 컬러 라인, 순위, 드라이버 조합, 설명 문장으로 구분합니다.</p>
        </div>
        <div className="f1-page__card-grid f1-page__card-grid--teams">
          {f1Teams.map((team) => (
            <article className={`f1-page__team-card f1-page__team-tone--${team.tone}`} key={team.slug}>
              <div>
                <span>{team.position ? `P/${team.position}` : "TEAM"}</span>
                <small>{team.car}</small>
              </div>
              <h2>{team.name}</h2>
              <p>{team.drivers.join(" / ")}</p>
              <strong className="type-korean">{team.note}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
