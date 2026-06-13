# WEC/WRC Official Calendar Sync Design

## Goal

Collect WEC and WRC race-level schedules from their official calendar pages,
reuse the existing manual override merge policy, and let administrators add or
remove manually curated sessions when official calendars do not provide exact
session times.

## Sources

- WEC: `https://www.fiawec.com/en/calendar/80`
- WRC: `https://www.wrc.com/en/calendar`

Both sources are official public calendar pages. WEC provides rendered
calendar HTML. WRC embeds its calendar table in the
`rb3-prerender-data-cache` JSON script.

The collectors treat source pages as untrusted and fail the whole source run
when the expected current-season calendar structure is missing or any calendar
row is malformed.

## Collected Data

WEC and WRC collectors create and update race-level records only:

- series, season, round
- name and stable official-page-based source key
- country when reliably available
- start and end dates
- official page slug

They do not synthesize sessions at midnight and do not infer precise start
times. New and changed races remain draft and require administrator review.

WEC Prologue is excluded because RaceNote's MVP calendar focuses on race
rounds.

## Stable Keys

- WEC race: `fiawec:<official-race-page-slug>`
- WRC race: `wrc:<official-event-resource-id>`

These keys survive display-name changes and avoid matching records by title.

## Shared Sync Architecture

The normalized race model accepts `F1 | WEC | WRC`. The existing schedule
store resolves the target series from each source payload instead of assuming
F1. A reusable source runner handles timeout, sync log creation, source
timestamp updates, and failed-run logging.

The twice-daily Cron and the authenticated manual sync action run all enabled
F1, WEC, and WRC collectors independently. Failure in one source is logged and
does not prevent the other sources from running.

## Manual Sessions

The administrator race editor adds a separate form for a session name, type,
and exact UTC start timestamp. Manually created sessions have no `source_key`
and are immediately considered administrator-controlled.

Only sessions without a `source_key` can be deleted in this phase. Deleting an
automatically collected F1 session would cause it to return on the next sync,
so the UI does not offer that misleading operation.

Adding or deleting a manual session:

- requires a valid administrator session
- marks the race as needing review
- leaves publication status unchanged
- does not overwrite content

## Error Handling And Testing

- Parser tests use minimized official-source fixtures.
- Date-range tests cover same-month and cross-month WRC dates.
- Missing calendar structures and malformed rows fail the source run.
- Manual session validation rejects unknown types and non-UTC timestamps.
- Existing override protection and no-automatic-publication rules remain.
- Verification includes real read-only fetch/parsing of both official pages,
  project tests, lint, Next/OpenNext builds, Cloudflare types, and dry-run.

