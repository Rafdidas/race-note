# Admin D1 Read Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace admin mock-data reads with shared D1-backed read models.

**Architecture:** Add typed conversion functions between Drizzle query rows and
admin UI models, then expose server-only read functions used by all admin pages.
Keep the development mock fallback and disabled mutation controls.

**Tech Stack:** Next.js 16 Server Components, TypeScript, Drizzle ORM, Cloudflare D1

---

### Task 1: Admin model conversion

**Files:**
- Create: `src/types/admin-data.ts`
- Create: `src/lib/admin-data-format.ts`
- Test: `src/lib/admin-data-format.test.ts`

- [ ] Write tests for race conversion, KST timestamps, sync source aggregation,
  and review queue derivation.
- [ ] Run `npm test` and verify the new tests fail because the conversion module
  does not exist.
- [ ] Implement the minimal typed conversion functions.
- [ ] Run `npm test` and verify all tests pass.

### Task 2: D1 read functions

**Files:**
- Create: `src/lib/admin-data.ts`
- Modify: `src/data/mock-admin.ts`
- Modify: `src/components/admin/StatusBadge/StatusBadge.tsx`

- [ ] Move the shared admin status type out of mock data.
- [ ] Add Drizzle reads for races, sessions, content, sources, logs, and change
  logs.
- [ ] Preserve development fallback behavior.
- [ ] Run `npm test` and `npm run lint`.

### Task 3: Admin page integration

**Files:**
- Modify: `src/app/admin/(panel)/page.tsx`
- Modify: `src/app/admin/(panel)/sync/page.tsx`
- Modify: `src/app/admin/(panel)/races/page.tsx`
- Modify: `src/app/admin/(panel)/races/[id]/page.tsx`

- [ ] Convert pages to async Server Components and await the shared reads.
- [ ] Remove static params restrictions from the D1-backed race detail route.
- [ ] Preserve disabled mutation controls and handle empty data.
- [ ] Run `npm run lint`, `npm run build`, and `npm run cf:build`.

### Task 4: Handoff

**Files:**
- Modify: `PROJECT_HANDOFF.md`

- [ ] Record the completed admin D1 read connection and updated next boundary.
- [ ] Run the final verification suite and inspect `git status --short`.
