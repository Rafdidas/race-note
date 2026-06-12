# Local D1 Public Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure local D1 and replace public-page race mocks with Drizzle-backed queries.

**Architecture:** Use a local-only Wrangler config for `next dev` and local migration commands while leaving the production config unbound until a real D1 ID exists. Query D1 in dynamic Server Components, map rows into stable public view models, and pass those models into existing Client filter components.

**Tech Stack:** Next.js 16 App Router, OpenNext Cloudflare, Cloudflare D1, Drizzle ORM, TypeScript, SCSS

---

### Task 1: Configure Local D1 And Seed Data

**Files:**
- Create: `wrangler.local.jsonc`
- Create: `drizzle/seed.sql`
- Modify: `next.config.ts`
- Modify: `package.json`
- Modify: `worker-configuration.d.ts`

- [ ] Add local D1 binding `DB` with `migrations_dir: "drizzle"`.
- [ ] Initialize OpenNext Cloudflare development context with the local config.
- [ ] Add `db:seed:local` and update `db:migrate:local` to use the local config.
- [ ] Add idempotent seed SQL for three series, three races, sessions, and race contents.
- [ ] Generate Cloudflare types from the local config.
- [ ] Apply local migrations and seed twice to verify repeatability.
- [ ] Query table and row counts from local D1.

### Task 2: Add Public Data View Models And Mappers

**Files:**
- Create: `src/types/public-data.ts`
- Create: `src/lib/public-data-format.ts`
- Create: `src/lib/public-data-format.test.ts`
- Modify: `package.json`

- [ ] Add a test runner script using Node's test runner with `tsx`.
- [ ] Write failing tests for UTC-to-KST session formatting and race row mapping.
- [ ] Run tests and confirm expected failures.
- [ ] Implement stable public view models and pure mapping/formatting functions.
- [ ] Run tests and confirm they pass.

### Task 3: Add Cloudflare Drizzle Queries

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/public-data.ts`

- [ ] Implement a D1 binding getter that fails clearly when `DB` is missing.
- [ ] Implement published race, race-by-slug, session, and series queries.
- [ ] Assemble related sessions and contents into public view models.
- [ ] Run `npm run lint` and `npm test`.

### Task 4: Replace Public Page Mocks

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/calendar/page.tsx`
- Modify: `src/app/races/[slug]/page.tsx`
- Modify: `src/app/series/page.tsx`
- Modify: `src/components/HomeRaceGrid/HomeRaceGrid.tsx`
- Modify: `src/components/CalendarSchedule/CalendarSchedule.tsx`
- Modify: `src/components/RaceCard/RaceCard.tsx`
- Modify: `src/components/SessionList/SessionList.tsx`
- Modify: `src/components/SeriesBadge/SeriesBadge.tsx`

- [ ] Make public pages dynamic and load D1 data in Server Components.
- [ ] Pass race and session data into Client filter components.
- [ ] Replace mock-data type imports with public view-model imports.
- [ ] Remove static slug generation and return 404 for missing/unpublished races.
- [ ] Run `npm test`, `npm run lint`, and `npm run build`.

### Task 5: Verify OpenNext Runtime And Update Handoff

**Files:**
- Modify: `PROJECT_HANDOFF.md`
- Modify: `README.md`

- [ ] Run `npm run cf:build`.
- [ ] Start local development with seeded D1 and inspect all public routes.
- [ ] Confirm the admin routes still use mock data.
- [ ] Document local D1 commands, completed public-data milestone, and remote D1 blocker.
- [ ] Run final `npm test`, `npm run lint`, `npm run build`, `npm run cf:build`, and `git diff --check`.

