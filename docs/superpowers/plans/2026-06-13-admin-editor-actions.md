# Admin Editor Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable authenticated correction, review, publication, and unpublication of existing races.

**Architecture:** Add tested server-side form parsing and transition guards, a
server-only mutation DAL, and authenticated Server Actions. Render the editor as
a progressive-enhancement Server Component form.

**Tech Stack:** Next.js 16 Server Actions, TypeScript, Drizzle ORM, Cloudflare D1

---

### Task 1: Mutation contracts

**Files:**
- Create: `src/lib/admin-race-mutations.test.ts`
- Create: `src/lib/admin-race-mutations.ts`
- Modify: `src/types/admin-data.ts`

- [ ] Write failing tests for form parsing and publish eligibility.
- [ ] Run `npm test` and confirm the module-missing failure.
- [ ] Implement strict parsing and transition guards.
- [ ] Run `npm test` and confirm all tests pass.

### Task 2: Mutation data access and actions

**Files:**
- Create: `src/lib/admin-race-editor.ts`
- Create: `src/app/admin/races/actions.ts`
- Modify: `src/lib/admin-data.ts`

- [ ] Add authenticated save, review, publish, and unpublish D1 mutations.
- [ ] Revalidate affected admin and public routes after successful actions.
- [ ] Redirect failures back to the editor with a generic status message.

### Task 3: Editor UI

**Files:**
- Create: `src/components/admin/AdminRaceEditor/AdminRaceEditor.tsx`
- Modify: `src/app/admin/(panel)/races/[id]/page.tsx`
- Modify: `src/app/admin/admin.scss`

- [ ] Render editable race, session, and content fields.
- [ ] Enable Save, Mark reviewed, Publish, and Unpublish controls.
- [ ] Keep Generate AI disabled.
- [ ] Display action results accessibly.

### Task 4: Documentation and verification

**Files:**
- Modify: `README.md`
- Modify: `PROJECT_HANDOFF.md`

- [ ] Record completed admin mutation flows and remaining sync override design.
- [ ] Run the complete verification suite.
