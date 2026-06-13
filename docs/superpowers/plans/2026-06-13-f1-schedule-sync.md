# F1 Schedule Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collect the current F1 schedule into D1 without overwriting administrator-corrected fields.

**Architecture:** A Jolpica adapter converts untrusted API data into normalized schedule records. A pure merge module decides patches and change logs, while a D1 runner applies those decisions and is shared by authenticated manual execution and Cloudflare Cron.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, Cloudflare D1, Cloudflare Workers Cron

---

### Task 1: Define override schema and migration

**Files:**
- Modify: `src/db/schema/index.ts`
- Create: `drizzle/migrations/0001_manual_overrides.sql`

- [ ] Add `manual_overrides` with a unique entity/field index.
- [ ] Add the enabled F1 Jolpica source idempotently in the migration.
- [ ] Apply initial and new migrations twice to in-memory SQLite and run foreign-key checks.

### Task 2: Build normalized F1 adapter with TDD

**Files:**
- Create: `src/lib/sync/types.ts`
- Create: `src/lib/sync/f1-jolpica.ts`
- Create: `src/lib/sync/f1-jolpica.test.ts`

- [ ] Write failing parser tests for a representative race, optional sessions, stable keys, and malformed payloads.
- [ ] Run the focused tests and confirm expected failures.
- [ ] Implement strict unknown-input parsing and normalized F1 records.
- [ ] Run focused tests and confirm they pass.

### Task 3: Build merge and override rules with TDD

**Files:**
- Create: `src/lib/sync/merge-schedule.ts`
- Create: `src/lib/sync/merge-schedule.test.ts`
- Create: `src/lib/manual-overrides.ts`
- Create: `src/lib/manual-overrides.test.ts`

- [ ] Write failing tests for unchanged, changed, protected, and changed-only override behavior.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement pure merge decisions and override field detection.
- [ ] Run focused tests and confirm they pass.

### Task 4: Record administrator corrections as overrides

**Files:**
- Modify: `src/lib/admin-race-editor.ts`

- [ ] Read existing editable race and session values before mutation.
- [ ] Upsert override rows only for fields changed by the administrator.
- [ ] Keep review and publication behavior unchanged.
- [ ] Run all unit tests.

### Task 5: Implement D1 sync runner

**Files:**
- Create: `src/lib/sync/f1-sync.ts`
- Create: `src/lib/sync/schedule-store.ts`

- [ ] Load the enabled F1 source and fetch it with a bounded timeout.
- [ ] Apply inserts and merge decisions transactionally.
- [ ] Write change logs, sync counts, source timestamps, and failure logs.
- [ ] Ensure source absence does not delete existing entities.

### Task 6: Connect manual sync and Cron

**Files:**
- Create: `src/app/admin/sync/actions.ts`
- Modify: `src/app/admin/(panel)/sync/page.tsx`
- Create: `worker.ts`
- Modify: `wrangler.jsonc`

- [ ] Add an authenticated manual sync Server Action and status redirect.
- [ ] Enable the Run Sync button and user-facing result messages.
- [ ] Add a Worker entrypoint that delegates fetch to OpenNext and handles scheduled events.
- [ ] Configure the two UTC Cron expressions.

### Task 7: Document and verify

**Files:**
- Modify: `README.md`
- Modify: `PROJECT_HANDOFF.md`

- [ ] Document implemented F1 sync, override behavior, and remaining WEC/WRC boundary.
- [ ] Run tests, lint, migration checks, Next build, OpenNext build, Cloudflare types, and Wrangler dry-run.
- [ ] Confirm no secrets or generated artifacts were added.

