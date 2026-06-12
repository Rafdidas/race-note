import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";
import { SeriesBadge } from "@/components/SeriesBadge/SeriesBadge";
import { SessionList } from "@/components/SessionList/SessionList";
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
      </div>
    </article>
  );
}
