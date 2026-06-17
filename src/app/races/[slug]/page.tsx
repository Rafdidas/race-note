import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RaceFacts } from "@/components/RaceFacts/RaceFacts";
import { RaceHistory } from "@/components/RaceHistory/RaceHistory";
import { RelatedRaceCard } from "@/components/RelatedRaceCard/RelatedRaceCard";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";
import { SeriesBadge } from "@/components/SeriesBadge/SeriesBadge";
import { SessionList } from "@/components/SessionList/SessionList";
import { WatchTargetList } from "@/components/WatchTargetList/WatchTargetList";
import { getPublishedRaceBySlug } from "@/lib/public-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const race = await getPublishedRaceBySlug(slug);
  return race ? { title: race.title, description: race.summary } : {};
}

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const race = await getPublishedRaceBySlug(slug);

  if (!race) notFound();

  return (
    <article className="race-detail">
      <header className="race-detail__hero container">
        <div className="race-detail__top">
          <SeriesBadge series={race.series} />
          <span>{race.status} · KST</span>
        </div>
        <h1>{race.title}</h1>
        <div className="race-detail__meta">
          <span>{race.location}</span>
          <span>{race.period}</span>
          <span>{race.sessions.length} sessions</span>
        </div>
      </header>

      <div className="race-detail__content container">
        <section className="race-detail__schedule">
          <SectionLabel index="01">Schedule</SectionLabel>
          <SessionList sessions={race.sessions} />
        </section>

        <aside className="race-detail__must-watch">
          <SectionLabel index="02">Must watch</SectionLabel>
          <div>
            {race.sessions.filter((session) => session.mustWatch).map((session) => (
              <span key={session.name}>{session.name}</span>
            ))}
          </div>
          <p className="type-korean">{race.summary}</p>
        </aside>

        <section className="race-detail__brief">
          <SectionLabel index="03">Race brief</SectionLabel>
          <ol className="type-korean">
            {race.brief.map((line) => <li key={line}>{line}</li>)}
          </ol>
        </section>

        <section className="race-detail__note">
          <SectionLabel index="04">Beginner note</SectionLabel>
          <p className="type-korean">{race.beginnerNote}</p>
        </section>

        <section className="race-detail__variables">
          <SectionLabel index="05">Variables</SectionLabel>
          <div>{race.variables.map((variable) => <span key={variable}>{variable}</span>)}</div>
        </section>

        {race.facts && (
          <section className="race-detail__facts">
            <SectionLabel index="06">Quick facts</SectionLabel>
            <RaceFacts facts={race.facts} />
          </section>
        )}

        {race.watchTargets && race.watchTargets.length > 0 && (
          <section className="race-detail__watch">
            <SectionLabel index="07">Who to watch</SectionLabel>
            <WatchTargetList targets={race.watchTargets} />
          </section>
        )}

        {race.history && race.history.length > 0 && (
          <section className="race-detail__history">
            <SectionLabel index="08">History</SectionLabel>
            <RaceHistory entries={race.history} />
          </section>
        )}
      </div>

      {race.nextRace && (
        <section className="race-detail__next container">
          <SectionLabel index="09">Next race</SectionLabel>
          <RelatedRaceCard race={race.nextRace} />
        </section>
      )}

      {race.featuredOther && race.featuredOther.length > 0 && (
        <section className="race-detail__explore container">
          <SectionLabel index="10">Explore other series</SectionLabel>
          <div className="race-detail__explore-grid">
            {race.featuredOther.map((other) => (
              <RelatedRaceCard key={other.slug} race={other} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
