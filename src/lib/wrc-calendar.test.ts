import assert from "node:assert/strict";
import test from "node:test";
import { parseWrcCalendar } from "@/lib/sync/wrc-calendar";

const fixtureData = {
  "/v3/api/graphql/calendar": {
    data: {
      data: {
        items: [
          {
            type: "table",
            rows: [
              [
                [{ variant: "text", text: "10" }],
                [
                  {
                    variant: "reference-link",
                    text: "🇫🇮 WRC Secto Rally Finland",
                    reference: { href: "/en/events/wrc-secto-rally-finland-2026" },
                    resourceId: "rrn:content:event-profiles:finland-2026:en-INT",
                  },
                ],
                [{ variant: "text", text: "30 JULY - 02 AUGUST 2026" }],
              ],
            ],
          },
        ],
      },
    },
  },
};
const fixture = `<script type="application/json" id="rb3-prerender-data-cache">${JSON.stringify(fixtureData)}</script>`;

test("parses WRC embedded calendar JSON and cross-month dates", () => {
  assert.deepEqual(parseWrcCalendar(fixture), [
    {
      sourceKey: "wrc:finland-2026",
      seriesCode: "WRC",
      season: 2026,
      round: 10,
      name: "WRC Secto Rally Finland",
      slug: "wrc-wrc-secto-rally-finland-2026",
      country: null,
      location: null,
      venueName: null,
      startDate: "2026-07-30",
      endDate: "2026-08-02",
      timezone: "UTC",
      sessions: [],
    },
  ]);
});

test("rejects malformed WRC calendar HTML", () => {
  assert.throws(() => parseWrcCalendar("<html></html>"), /WRC calendar/i);
});

