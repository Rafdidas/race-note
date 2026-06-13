# WEC/WRC Official Calendar Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collect official WEC/WRC race calendars and support manually curated sessions without inventing source times.

**Architecture:** Dedicated official-page parsers return the existing normalized schedule contract. A generic source runner and series-aware schedule store share logging and merge behavior, while admin-only manual session actions fill the exact-time gap.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, Cloudflare D1, Cloudflare Workers Cron

---

### Task 1: Add parser contracts and tests

**Files:**
- Create: `src/lib/wec-calendar.test.ts`
- Create: `src/lib/wrc-calendar.test.ts`
- Create: `src/lib/sync/calendar-dates.ts`
- Create: `src/lib/sync/wec-calendar.ts`
- Create: `src/lib/sync/wrc-calendar.ts`
- Modify: `src/lib/sync/types.ts`

- [ ] Write failing minimized-fixture tests for WEC rounds, WRC rows, cross-month dates, stable keys, and malformed source rejection.
- [ ] Run tests and confirm missing parser failures.
- [ ] Implement the strict official calendar parsers without adding packages.
- [ ] Run focused tests and confirm they pass.

### Task 2: Generalize schedule storage and source execution

**Files:**
- Modify: `src/lib/sync/schedule-store.ts`
- Create: `src/lib/sync/source-runner.ts`
- Modify: `src/lib/sync/f1-sync.ts`
- Create: `src/lib/sync/wec-sync.ts`
- Create: `src/lib/sync/wrc-sync.ts`
- Create: `src/lib/sync/all-sync.ts`

- [ ] Resolve the destination series from normalized race data.
- [ ] Extract common fetch, timeout, and source log behavior.
- [ ] Add independent WEC/WRC runners and an all-source runner.
- [ ] Keep each source failure isolated and logged.

### Task 3: Add source configuration and execution entrypoints

**Files:**
- Create: `drizzle/migrations/0002_wec_wrc_sources.sql`
- Modify: `src/app/admin/sync/actions.ts`
- Modify: `src/app/admin/(panel)/sync/page.tsx`
- Modify: `worker.ts`

- [ ] Add idempotent WEC and WRC source rows.
- [ ] Change manual and scheduled sync to run all sources.
- [ ] Update admin copy to describe all-series sync.

### Task 4: Add manual session management with TDD

**Files:**
- Modify: `src/lib/admin-race-mutations.test.ts`
- Modify: `src/lib/admin-race-mutations.ts`
- Modify: `src/lib/admin-race-editor.ts`
- Modify: `src/app/admin/races/actions.ts`
- Modify: `src/components/admin/AdminRaceEditor/AdminRaceEditor.tsx`
- Modify: `src/types/admin-data.ts`
- Modify: `src/lib/admin-data.ts`
- Modify: `src/lib/admin-data-format.ts`

- [ ] Write failing tests for valid manual sessions, invalid types, and non-UTC timestamps.
- [ ] Implement administrator-only add and manual-only delete mutations.
- [ ] Add session creation and manual-session deletion forms.
- [ ] Mark affected races as needing review.

### Task 5: Document and verify

**Files:**
- Modify: `README.md`
- Modify: `PROJECT_HANDOFF.md`

- [ ] Document official source limits and manual session policy.
- [ ] Verify both official pages with read-only live parsing.
- [ ] Run tests, lint, migrations, Next build, OpenNext build, Cloudflare types, and Wrangler dry-run.

