# WEC Official Sessions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collect only WEC sessions whose official page provides an exact timestamp, without guessing missing session times or replacing the current public Le Mans seed prematurely.

**Architecture:** Extend the existing WEC HTML parser to read the featured race session panel and attach exact-timestamp sessions only to the matching normalized race. Reuse the current schedule store so new sessions remain review-required and automatic collection never publishes them directly.

**Tech Stack:** TypeScript, Node test runner, Cloudflare D1/Workers, existing RaceNote schedule sync pipeline

---

### Task 1: Parse exact WEC session timestamps

**Files:**
- Modify: `src/lib/wec-calendar.test.ts`
- Modify: `src/lib/sync/wec-calendar.ts`

- [ ] Add a failing parser test containing a featured race link, an exact-timestamp Warm-up, an exact-timestamp Race, and a date-only practice session.
- [ ] Verify the parser excludes the date-only session and attaches only Warm-up and Race to the matching race.
- [ ] Implement timestamp-to-UTC conversion and stable session source keys.
- [ ] Run the WEC parser tests and the full test suite.

### Task 2: Validate and deploy the WEC sync change

**Files:**
- Modify: `PROJECT_HANDOFF.md`

- [ ] Parse the saved official WEC HTML and verify Le Mans produces exactly Warm-up and Race.
- [ ] Run lint, Next build, Cloudflare build, and deploy dry-run.
- [ ] Deploy the Worker and run the WEC source sync against remote D1.
- [ ] Verify the automatic Le Mans race has two review-required sessions and the public seed remains published.
- [ ] Record the completed behavior and remaining Le Mans transition boundary.
