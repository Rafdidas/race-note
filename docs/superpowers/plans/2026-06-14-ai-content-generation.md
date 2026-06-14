# AI Content Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cost-controlled OpenAI content drafting, administrator review/application, and a daily Cloudflare AI Cron without automatically changing reviewed or published content.

**Architecture:** A separate one-row-per-race AI draft table isolates generated output from current content. A shared generation service uses a validated OpenAI Responses API adapter and is called by authenticated admin actions and a three-race-limited Cron runner.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle ORM, Cloudflare D1/Workers Cron, OpenAI Responses API, global SCSS/BEM

---

### Task 1: Add AI draft schema and migration

**Files:**
- Modify: `src/db/schema/index.ts`
- Create: `drizzle/migrations/0003_ai_content_drafts.sql`

- [ ] Add `aiDraftStatuses = ["ready", "failed", "applied"]` and an
  `aiContentDrafts` Drizzle table with a unique `race_id`, the eight nullable content
  fields, latest-attempt metadata, timestamps, and indexes on status and generated time.
- [ ] Add inferred select and insert draft types.
- [ ] Write the matching idempotent SQL migration with a cascading race foreign key.
- [ ] Apply all migrations to memory SQLite twice and run `PRAGMA foreign_key_check`;
  expect no migration error and no foreign-key rows.

### Task 2: Validate generated content and admin eight-field forms with TDD

**Files:**
- Create: `src/lib/ai-content.ts`
- Create: `src/lib/ai-content.test.ts`
- Modify: `src/lib/admin-race-mutations.ts`
- Modify: `src/lib/admin-race-mutations.test.ts`

- [ ] Write failing tests that require exactly three non-empty summary lines, bounded
  variable arrays, bounded strings, nullable `keyDriversOrTeams`, and rejection of
  malformed provider output.
- [ ] Write failing admin form tests covering all eight current-content fields and all
  eight editable draft fields.
- [ ] Implement the `AiContentFields` type and an `unknown`-input validator without `any`.
- [ ] Extend current-content form parsing and add `parseAdminAiDraftForm`.
- [ ] Add `requiresRegenerationConfirmation` and
  `parseAdminGenerationConfirmation(formData, aiStatus)` so reviewed/published manual
  generation requires `confirmRegeneration=on`.
- [ ] Run `npm test`; expect the new and existing mutation tests to pass.

### Task 3: Add the OpenAI Responses API adapter with TDD

**Files:**
- Create: `src/lib/ai/openai-content-generator.ts`
- Create: `src/lib/openai-content-generator.test.ts`

- [ ] Write failing tests using an injected `fetch` implementation for the request model,
  no tools, strict JSON schema, output-token cap, timeout handling, non-2xx handling, and
  malformed response rejection.
- [ ] Implement a direct `fetch("https://api.openai.com/v1/responses")` adapter using
  `gpt-5-nano`, Structured Outputs, and the validator from `src/lib/ai-content.ts`.
- [ ] Keep the prompt limited to stored facts, explicitly forbid unsupported claims, and
  instruct the model to return `keyDriversOrTeams: null` without reliable facts.
- [ ] Do not retry or store raw provider responses.
- [ ] Run `npm test`; expect adapter tests to pass.

### Task 4: Build shared generation storage and target selection with TDD

**Files:**
- Create: `src/lib/ai/content-generation.ts`
- Create: `src/lib/ai-generation.test.ts`

- [ ] Write failing pure-function tests for the inclusive 14-day window, start-date order,
  hard limit of three, exclusion of reviewed/published content, and exclusion of an
  existing ready draft.
- [ ] Implement normalized race generation context construction and pure automatic target
  selection.
- [ ] Implement one-race generation that upserts a `ready` draft on success.
- [ ] On failure, preserve existing draft fields while updating or creating a `failed`
  latest-attempt record with a safe error message.
- [ ] Implement the automatic runner that queries eligible races and sessions, then
  sequentially generates at most three drafts without retrying failures.
- [ ] Use D1-compatible writes and `runD1Batch` where multiple writes must be atomic.
- [ ] Run `npm test`; expect target-selection and failure-preservation tests to pass.

### Task 5: Add authenticated manual generation and draft application

**Files:**
- Modify: `src/lib/db.ts`
- Modify: `src/lib/admin-race-editor.ts`
- Modify: `src/app/admin/races/actions.ts`

- [ ] Add optional `OPENAI_API_KEY` to `CloudflareEnv` and a server-only key lookup that
  supports `.env.local` during local development without exposing the value.
- [ ] Add an authenticated `generateAdminAiDraft` operation that checks protected-status
  confirmation and calls the shared one-race generator.
- [ ] Add an authenticated `applyAdminAiDraft` operation that validates edited draft
  fields, atomically copies them to `race_contents`, sets `aiStatus: "needs_review"`,
  `aiGenerated: true`, `reviewedByAdmin: false`, and marks the draft `applied`.
- [ ] Add server actions and redirects for `ai-generated`, `ai-applied`, and safe error
  notices; revalidate public and admin race paths after application.
- [ ] Run `npm test` and `npm run lint`; expect both to pass.

### Task 6: Show current content and editable AI draft in the admin editor

**Files:**
- Modify: `src/types/admin-data.ts`
- Modify: `src/lib/admin-data.ts`
- Modify: `src/lib/admin-data-format.ts`
- Modify: `src/lib/admin-data-format.test.ts`
- Modify: `src/data/mock-admin.ts`
- Modify: `src/components/admin/AdminRaceEditor/AdminRaceEditor.tsx`
- Modify: `src/app/admin/admin.scss`

- [ ] Extend admin row and view models with all eight current fields and the latest draft
  plus status, model, safe error, and generated time.
- [ ] Write failing format tests for nullable current fields and ready/failed/applied draft
  mapping.
- [ ] Join the latest one-per-race draft in admin reads and update mocks.
- [ ] Replace the disabled Generate AI button with an authenticated form; for reviewed or
  published content, show a required confirmation checkbox explaining that current content
  remains unchanged.
- [ ] Render all eight current-content fields in the save form.
- [ ] Render all eight draft fields in a separate editable form with Apply Draft enabled
  only for a usable draft; show failed-attempt details without replacing draft fields.
- [ ] Add responsive BEM styles using existing theme tokens and accessible labels/notices.
- [ ] Run `npm test`, `npm run lint`, and `npm run build`; expect all to pass.

### Task 7: Route the daily AI Cron

**Files:**
- Modify: `worker.ts`
- Modify: `wrangler.jsonc`
- Modify: `worker-configuration.d.ts` only through `npm run cf:types`

- [ ] Add UTC `0 1 * * *` to Wrangler triggers.
- [ ] Type the scheduled controller's `cron` property and route only `0 1 * * *` to the AI
  automatic runner; keep `0 0 * * *` and `0 12 * * *` routed to schedule sync.
- [ ] Require `OPENAI_API_KEY` only for the AI route and keep schedule sync independent.
- [ ] Run `npm run cf:types`, `npm run cf:build`, and
  `npx wrangler deploy --dry-run`; expect successful type generation and bundles.

### Task 8: Document and complete local verification

**Files:**
- Modify: `README.md`
- Modify: `PROJECT_HANDOFF.md`

- [ ] Document `OPENAI_API_KEY`, manual generation, draft application, Cron timing, the
  three-race limit, and the no-auto-overwrite policy without including secret values.
- [ ] Update the handoff milestone, known constraints, verification results, and next work
  boundary.
- [ ] Run `npm test`, `npm run lint`, `npm run build`, `npm run cf:build`,
  `npm run cf:types`, `npx wrangler deploy --dry-run`, and `git diff --check`.
- [ ] Confirm no secret value, raw provider response, unrelated user change, or generated
  deployment artifact was added.
- [ ] Stop before remote D1 migration, Cloudflare secret changes, or deployment unless the
  user explicitly authorizes those operations.

