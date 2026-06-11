import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";
import { SeriesBadge } from "@/components/SeriesBadge/SeriesBadge";
import { seriesGuides } from "@/data/mock-races";

export const metadata: Metadata = {
  title: "Series Guide",
  description: "F1, WEC, WRC 입문 가이드",
};

export default function SeriesPage() {
  return (
    <div className="public-page series-page">
      <PageHeader
        description="세 시리즈는 모두 빠르지만, 재미를 발견하는 방법은 서로 다릅니다. 처음 볼 때 알아두면 좋은 차이만 정리했습니다."
        eyebrow="Beginner field guide"
        index="S/01"
        meta="Three ways to race"
        title="Series"
      />

      <section className="public-page__content container">
        <div className="series-page__grid">
          {seriesGuides.map((series, index) => (
            <article className="series-page__card" key={series.code}>
              <div className="series-page__card-top">
                <SeriesBadge series={series.code} />
                <span>P/{String(index + 1).padStart(2, "0")}</span>
              </div>
              <p className="series-page__format">{series.format}</p>
              <h2>{series.name}</h2>
              <p className="series-page__description type-korean">{series.description}</p>
              <div className="series-page__keywords">
                {series.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
              </div>
              <div className="series-page__first">
                <span>First watch</span>
                <strong>{series.firstWatch}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="series-page__comparison container">
        <SectionLabel index="02">Quick comparison</SectionLabel>
        <div className="series-page__comparison-grid">
          <p className="type-korean">F1은 같은 순간의 직접 경쟁, WEC는 긴 시간의 운영, WRC는 한 번의 스테이지 기록에서 재미를 찾으면 쉽습니다.</p>
          <div>
            <span>F1 / Position</span>
            <span>WEC / Endurance</span>
            <span>WRC / Time</span>
          </div>
        </div>
      </section>
    </div>
  );
}
