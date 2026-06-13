# F1 Schedule Sync And Manual Override Protection Design

## Goal

Implement the first production schedule collector for F1 while ensuring that
future automatic syncs never overwrite fields corrected by an administrator.
The implementation establishes reusable collection and merge boundaries for
later WEC and WRC adapters.

## Scope

- Fetch the current F1 season schedule from the Jolpica Ergast-compatible API.
- Parse races and known F1 sessions into a provider-neutral schedule model.
- Add new races and sessions as draft records that require review.
- Compare existing races and sessions by stable `source_key`.
- Apply unprotected source changes and create `change_logs`.
- Keep administrator-protected fields unchanged and create `ignored`
  `change_logs` for conflicting source values.
- Record each execution in `sync_logs` and update `sync_sources.last_synced_at`.
- Enable authenticated manual execution from `/admin/sync`.
- Add Cloudflare Cron triggers for 09:00 and 21:00 KST.

WEC, WRC, AI generation, automatic deletion of missing source records, and
automatic publication are outside this implementation.

## Source Adapter

The F1 adapter uses the Jolpica Ergast-compatible current-season schedule
endpoint configured in `sync_sources`. It treats every response as untrusted:
the adapter validates the nested response shape, required race values, and UTC
date-time values before returning normalized records.

Stable keys do not depend on names:

- Race: `jolpica:f1:<season>:<round>`
- Session: `jolpica:f1:<season>:<round>:<session-type>`

The first supported session fields are practice sessions, qualifying, sprint
qualifying, sprint, and race. Unknown or absent sessions are ignored.

## Manual Override Model

Add a `manual_overrides` table:

| Column | Purpose |
| --- | --- |
| `id` | UUID |
| `entity_type` | `race` or `session` |
| `entity_id` | Existing entity ID |
| `field_name` | Protected database model field |
| `created_at` | First protection time |
| `updated_at` | Latest administrator edit time |

The tuple `(entity_type, entity_id, field_name)` is unique.

When the administrator saves a correction, the mutation layer reads the
existing race and sessions, compares editable schedule fields, and upserts an
override only for fields whose values changed. Content fields are not included
because the schedule collector does not write content. Existing corrections
made before this migration cannot be inferred and are not automatically
backfilled.

Protected fields remain protected after review. Reviewing acknowledges pending
source changes; it does not surrender the administrator's chosen value.

## Merge Rules

The merge engine is pure and independent of D1:

1. New source entities are inserted with `needs_review = true`.
2. Equal values produce no patch or change log.
3. Changed, unprotected values are applied and logged as `needs_review`.
4. Changed, protected values are skipped and logged as `ignored`.
5. An existing entity receiving any applied source change becomes
   `needs_review = true`.
6. Source absence never deletes or cancels an entity in this phase.
7. Editorial-only fields such as `publish_status`, `is_featured`, and
   `is_must_watch` are never supplied by the adapter and are never overwritten.

The sync result counts inserted entities as `added`, applied changed entities
as `updated`, and protected conflicts or invalid source records as `skipped`.

## Execution And Logging

`runF1ScheduleSync` loads the enabled F1 source, creates a running context,
fetches and parses the source, applies the normalized schedule in a D1
transaction, then writes a success or partial log. A fetch, parse, or database
failure writes a failed log before rethrowing.

The manual Server Action verifies the administrator session before calling the
same runner. Cloudflare scheduled execution uses the same runner through a
custom Worker entrypoint that delegates HTTP requests to the generated
OpenNext worker.

Cron expressions are UTC:

- `0 0 * * *`: 09:00 KST
- `0 12 * * *`: 21:00 KST

No sync run publishes data automatically.

## Error Handling

- HTTP errors, malformed payloads, and a response with no valid races fail the
  source run and preserve existing schedule data.
- Individual malformed optional sessions are skipped while valid races remain
  usable.
- Database writes and their change logs run transactionally.
- Admin UI receives a generic failure message; detailed failure text is kept
  in `sync_logs`.
- Fetches use a bounded timeout.

## Testing

- Parser tests cover valid F1 races, optional sessions, stable keys, and
  malformed payload rejection.
- Merge tests cover unchanged values, applied changes, protected conflicts, and
  review flags.
- Override tests cover changed-only protection detection.
- Migration is applied twice to an in-memory SQLite database and checked with
  `PRAGMA foreign_key_check`.
- Project tests, lint, Next build, OpenNext build, Cloudflare types, and
  Wrangler dry-run validate integration.

