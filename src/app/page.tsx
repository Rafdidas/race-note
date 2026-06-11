import Link from "next/link";
import { HomeRaceGrid } from "@/components/HomeRaceGrid/HomeRaceGrid";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";
import { SeriesBadge } from "@/components/SeriesBadge/SeriesBadge";

export default function Home() {
  return (
    <div className="home">
      <section className="home__hero">
        <div className="container">
          <SectionLabel index="00">Motorsport weekly briefing</SectionLabel>
          <h1 className="home__hero-title">Race Note</h1>
          <div className="home__hero-bottom">
            <p className="home__hero-copy type-korean">
              이번 주 어떤 레이스를, 언제, 왜 봐야 하는지 짧고 정확하게 정리합니다.
              모든 시간은 한국 표준시를 기준으로 표시합니다.
            </p>
            <div className="home__hero-period">
              <span>Week 24</span>
              <strong>2026.06.08 — 06.14</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="home__briefing container">
        <SectionLabel index="01">Live briefing</SectionLabel>
        <div className="home__briefing-grid">
          <div className="home__next-session">
            <div>
              <SeriesBadge series="WEC" />
              <h2>24 Hours of Le Mans</h2>
            </div>
            <div className="home__next-time">
              06.13 · 23:00
              <span>Race start · KST</span>
            </div>
          </div>
          <aside className="home__guide">
            <SectionLabel index="N/01">Beginner note</SectionLabel>
            <p className="type-korean">
              F1, WEC, WRC는 무엇이 다를까요? 가장 먼저 보면 좋은 세션부터
              알려드립니다.
            </p>
            <div className="home__guide-codes">
              <span>F1</span><span>/</span><span>WEC</span><span>/</span><span>WRC</span>
            </div>
            <Link className="home__guide-link" href="/series">
              Open series guide ↗
            </Link>
          </aside>
        </div>
      </section>

      <section className="home__races container" id="this-week">
        <div className="home__section-heading">
          <div>
            <SectionLabel index="02">This week races</SectionLabel>
            <h2>On the grid</h2>
          </div>
          <p>Curated briefings · KST</p>
        </div>
        <HomeRaceGrid />
      </section>
    </div>
  );
}
