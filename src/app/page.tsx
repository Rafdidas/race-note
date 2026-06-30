import Image from "next/image";
import Link from "next/link";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";
import { SeriesBadge } from "@/components/SeriesBadge/SeriesBadge";
import { f1GuideSteps, f1LatestResult, f1NextRace, f1SeasonSchedule } from "@/data/f1-season";
import { getConstructorStandings, getDriverStandings } from "@/lib/f1-data";

const pad = (n: number) => String(n).padStart(2, "0");
const completedRounds = f1SeasonSchedule.filter((round) => round.status === "done").length;
const progress = Math.round((completedRounds / f1SeasonSchedule.length) * 100);

export default async function Home() {
  const [drivers, teams] = await Promise.all([getDriverStandings(), getConstructorStandings()]);
  const rankedDrivers = drivers.filter((driver) => driver.position < 9999);
  const rankedTeams = teams.filter((team) => team.position < 9999);
  const driverNotes = drivers.slice(0, 3);

  return (
    <div className="home">
      <section className="home__dashboard">
        <div className="container">
          <div className="home__hero-grid" aria-label="F1 시즌 요약">
            <article className="home__hero-main">
              <h1 className="home__hero-title">2026<br />F1 Season</h1>
              <p className="home__hero-copy type-korean">한국 시간 기준으로 정리한 F1 시즌 브리핑</p>
              <div className="home__season-stats" aria-label="2026 F1 시즌 진행률">
                <div>
                  <span>라운드</span>
                  <strong>{f1SeasonSchedule.length}</strong>
                </div>
                <div>
                  <span>완료</span>
                  <strong>{completedRounds}</strong>
                </div>
                <div>
                  <span>남은 경기</span>
                  <strong>{f1SeasonSchedule.length - completedRounds}</strong>
                </div>
                <div>
                  <span>진행률</span>
                  <strong>{progress}%</strong>
                  <em style={{ inlineSize: `${progress}%` }} />
                </div>
              </div>
            </article>

            <aside className="home__next-card" aria-label="다음 레이스">
              <div className="home__panel-head">
                <SectionLabel index="01">다음 레이스</SectionLabel>
                <SeriesBadge series="F1" />
              </div>
              <div className="home__next-card-title">
                <div>
                  <h2>{f1NextRace.title}</h2>
                  <p className="type-korean">{f1NextRace.titleKo}</p>
                </div>
                <Image
                  alt="오스트리아 국기"
                  className="home__flag"
                  height={32}
                  src={f1NextRace.flagSrc}
                  width={32}
                />
              </div>
              <dl className="home__next-meta">
                <div>
                  <dt>라운드</dt>
                  <dd>ROUND {f1NextRace.round}</dd>
                </div>
                <div>
                  <dt>서킷</dt>
                  <dd>{f1NextRace.circuit}</dd>
                </div>
                <div>
                  <dt>장소</dt>
                  <dd>{f1NextRace.location}</dd>
                </div>
              </dl>
              <div className="home__race-date">
                <strong>{f1NextRace.period}</strong>
                <span>KST (한국 시간)</span>
                <Image
                  alt="Red Bull Ring 트랙 라인"
                  height={88}
                  src={f1NextRace.trackSrc}
                  width={138}
                />
              </div>
              <div className="home__session-strip" aria-label="오스트리아 그랑프리 세션 시간">
                {f1NextRace.sessions.map((session) => (
                  <div
                    className={
                      session.name === "RACE"
                        ? "home__session-strip-item home__session-strip-item--race"
                        : "home__session-strip-item"
                    }
                    key={session.name}
                  >
                    <span>{session.name}</span>
                    <strong>{session.time}</strong>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="home__panel-grid" aria-label="순위 및 최근 결과 패널">
            <article className="home__standings" id="drivers">
              <div className="home__panel-head">
                <SectionLabel index="02">드라이버 순위</SectionLabel>
                <Link href="/f1/drivers">드라이버 보기</Link>
              </div>
              <div className="home__podium" aria-label="드라이버 순위 상위 3명">
                {rankedDrivers.slice(0, 3).map((driver) => (
                  <div className="home__podium-card" key={driver.slug}>
                    <span>{pad(driver.position)}</span>
                    <strong>{driver.name}</strong>
                    <p>{driver.team}</p>
                    <small>{driver.points} PTS</small>
                  </div>
                ))}
              </div>
              <div className="home__table" role="table" aria-label="드라이버 순위 요약">
                <div className="home__table-row home__table-row--head" role="row">
                  <span>POS</span>
                  <span>DRIVER</span>
                  <span>TEAM</span>
                  <span>PTS</span>
                </div>
                {rankedDrivers.slice(0, 5).map((driver) => (
                  <div className="home__table-row" role="row" key={driver.slug}>
                    <span>{pad(driver.position)}</span>
                    <strong>{driver.name} <em>{driver.code}</em></strong>
                    <span>{driver.team}</span>
                    <span>{driver.points}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="home__standings home__standings--teams" id="teams">
              <div className="home__panel-head">
                <SectionLabel index="03">컨스트럭터 순위</SectionLabel>
                <Link href="/f1/teams">팀 보기</Link>
              </div>
              <div className="home__team-list home__team-list--compact">
                {rankedTeams.map((team) => (
                  <div className={`home__team-card home__team-card--${team.tone}`} key={team.slug}>
                    <span>P/{pad(team.position)}</span>
                    <strong>{team.name}</strong>
                    <p>{team.drivers.join(" / ")}</p>
                    <small>{team.points} PTS</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="home__result">
              <div className="home__panel-head">
                <SectionLabel index="04">최근 결과</SectionLabel>
                <span className="home__panel-head-meta">Barcelona-Catalunya GP · Race</span>
              </div>
              <div className="home__result-top">
                {f1LatestResult.slice(0, 3).map((row) => (
                  <div key={row.driver}>
                    <span>{row.pos}</span>
                    <strong>{row.driver}</strong>
                    <p>{row.team}</p>
                  </div>
                ))}
              </div>
              <div className="home__table home__table--result" role="table" aria-label="최근 경기 결과">
                <div className="home__table-row home__table-row--head" role="row">
                  <span>POS</span>
                  <span>DRIVER</span>
                  <span>GAP</span>
                  <span>PTS</span>
                </div>
                {f1LatestResult.map((row) => (
                  <div className="home__table-row" role="row" key={row.driver}>
                    <span>{row.pos}</span>
                    <strong>{row.driver}</strong>
                    <span>{row.gap}</span>
                    <span>{row.points}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="home__schedule container">
        <div className="home__section-heading">
          <div>
            <SectionLabel index="05">시즌 일정</SectionLabel>
            <h2>시즌 흐름</h2>
          </div>
          <p className="type-korean">공식 2026 캘린더 기준으로 완료, 다음 경기, 예정 라운드를 구분합니다.</p>
        </div>
        <div className="home__round-grid">
          {f1SeasonSchedule.map((race) => (
            <article className={`home__round-card home__round-card--${race.status}`} key={`${race.round}-${race.countryCode}`}>
              <span>R{race.round}</span>
              <strong>{race.countryCode}</strong>
              <p className="type-korean">{race.grandPrixKo}</p>
              <small>{race.period}</small>
              <em>{race.status === "done" ? "완료" : race.status === "next" ? "진행 예정" : "예정"}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="home__explore container">
        <article className="home__drivers">
          <div className="home__panel-head">
            <SectionLabel index="06">드라이버</SectionLabel>
            <Link href="/f1/drivers">드라이버 보기</Link>
          </div>
          <div className="home__driver-list">
            {driverNotes.map((driver) => (
              <div className="home__driver-card" key={driver.slug}>
                <span>#{driver.number}</span>
                <strong>{driver.name}</strong>
                <small>{driver.team}</small>
                <p className="type-korean">{driver.note}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="home__guide-cta container" id="guide">
        <div className="home__guide-cta-inner">
          <div>
            <SectionLabel index="07">입문 가이드</SectionLabel>
            <h2>처음이라면 이 순서로 보면 쉽습니다</h2>
            <p className="type-korean">
              F1은 모든 세션을 다 알아야 재미있는 스포츠가 아닙니다. 예선, 출발,
              피트스톱, 세이프티카, 마지막 10랩만 먼저 잡아도 경기 흐름이 보입니다.
            </p>
          </div>
          <ol>
            {f1GuideSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home__deferred container" aria-label="보류된 시리즈">
        <div className="home__deferred-inner">
          <span>WEC / WRC</span>
          <p className="type-korean">
            WEC와 WRC는 삭제하지 않습니다. F1 시즌 구조가 안정된 뒤 각 시리즈에 맞는
            허브로 다시 확장합니다.
          </p>
        </div>
      </section>
    </div>
  );
}
