import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";
import { f1GuideSteps, f1GuideTopics } from "@/data/f1-season";

export const metadata: Metadata = {
  title: "F1 입문 가이드",
  description: "처음 보는 사람을 위한 F1 경기 주말, 예선, 타이어, 전략 가이드",
};

export default function F1GuidePage() {
  return (
    <div className="public-page f1-page f1-guide-page">
      <PageHeader
        description="F1을 처음 볼 때 필요한 개념만 먼저 정리합니다. 모든 용어를 외우기보다 경기 흐름을 따라가는 순서에 집중합니다."
        eyebrow="입문 가이드"
        index="G/01"
        meta="처음 보는 F1"
        title="입문 가이드"
      />

      <section className="f1-page__content container">
        <div className="f1-page__guide-order">
          <div>
            <SectionLabel index="02">먼저 볼 장면</SectionLabel>
            <h2>처음이라면 이 순서로 보세요</h2>
            <p className="type-korean">
              예선으로 출발 순서를 이해하고, 결승 출발과 첫 피트스톱, 세이프티카,
              마지막 10랩만 따라가도 레이스 흐름이 보입니다.
            </p>
          </div>
          <ol>
            {f1GuideSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="f1-page__content container">
        <div className="f1-page__section-heading">
          <SectionLabel index="03">핵심 규칙</SectionLabel>
          <p className="type-korean">처음 보는 사람이 경기 중 바로 마주치는 개념만 먼저 골랐습니다.</p>
        </div>
        <div className="f1-page__guide-grid">
          {f1GuideTopics.map((topic, index) => (
            <article key={topic.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{topic.title}</h2>
              <p className="type-korean">{topic.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
