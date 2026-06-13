import assert from "node:assert/strict";
import test from "node:test";
import { parseWecCalendar } from "@/lib/sync/wec-calendar";

const fixture = `
<div class="splide inner-slider" data-year="2025">
  <div class="calendar-item"><div class="infos-full">
    <div class="ff-normal fw-bold fs-9 fs-lg-5 text-uppercase lh-1 mb-2">6 Hours of</div>
    <div class="fs-9 fs-lg-4 ff-headings fw-bold text-uppercase lh-1 mb-4">Old Race</div>
    <div class="fs-10 fs-lg-6 text-primary text-uppercase mb-4">From 1 to 2 May 2025</div>
    <a href="/en/race/old-race-2025">Race info</a>
  </div></div>
</div>
<div class="splide inner-slider" data-year="2026">
  <div class="calendar-item"><div class="infos-full">
    <div class="ff-normal fw-bold fs-9 fs-lg-5 text-uppercase lh-1 mb-2">Official Prologue</div>
    <div class="fs-9 fs-lg-4 ff-headings fw-bold text-uppercase lh-1 mb-4">IMOLA</div>
    <div class="fs-10 fs-lg-6 text-primary text-uppercase mb-4">14 April 2026</div>
    <a href="/en/race/official-prologue-imola-2026">Race info</a>
  </div></div>
  <div class="calendar-item"><div class="infos-minimal"><span class="flag:BE border"></span></div><div class="infos-full">
    <div class="ff-normal fw-bold fs-9 fs-lg-5 text-uppercase lh-1 mb-2">TotalEnergies 6 Hours of</div>
    <div class="fs-9 fs-lg-4 ff-headings fw-bold text-uppercase lh-1 mb-4">Spa-Francorchamps</div>
    <div class="fs-10 fs-lg-6 text-primary text-uppercase mb-4">From 7 to 9 May 2026</div>
    <a href="/en/race/totalenergies-6-hours-of-spa-francorchamps-2026">Race info</a>
  </div></div>
</div>`;

test("parses WEC race rounds and excludes the prologue", () => {
  assert.deepEqual(parseWecCalendar(fixture), [
    {
      sourceKey: "fiawec:totalenergies-6-hours-of-spa-francorchamps-2026",
      seriesCode: "WEC",
      season: 2026,
      round: 1,
      name: "TotalEnergies 6 Hours of Spa-Francorchamps",
      slug: "wec-totalenergies-6-hours-of-spa-francorchamps-2026",
      country: "Belgium",
      location: "Spa-Francorchamps",
      venueName: null,
      startDate: "2026-05-07",
      endDate: "2026-05-09",
      timezone: "UTC",
      sessions: [],
    },
  ]);
});

test("rejects malformed WEC calendar HTML", () => {
  assert.throws(() => parseWecCalendar("<html></html>"), /WEC calendar/i);
});
