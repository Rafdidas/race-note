# Project-Local semble_rs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `semble_rs` reproducibly installable and usable from the RaceNote repository.

**Architecture:** A setup script installs a pinned Rust toolchain and `semble_rs` into ignored `.tools` directories. A command wrapper anchors searches to the repository root, while npm scripts and agent documentation provide a stable interface.

**Tech Stack:** Bash, npm scripts, Rustup, Cargo, `semble_rs v0.9.1`

---

### Task 1: Add project-local setup and wrapper scripts

**Files:**
- Create: `scripts/setup-semble.sh`
- Create: `scripts/semble.sh`
- Modify: `.gitignore`
- Modify: `eslint.config.mjs`

- [x] Add a setup script that installs Rustup and `semble_rs v0.9.1` beneath `.tools`.
- [x] Add a wrapper that validates arguments and targets the repository root.
- [x] Ignore `.tools/` in Git and ESLint.
- [x] Run `bash -n scripts/setup-semble.sh scripts/semble.sh`.

### Task 2: Expose and document commands

**Files:**
- Modify: `package.json`
- Modify: `AGENTS.md`
- Modify: `PROJECT_HANDOFF.md`

- [x] Add `semble:setup`, `semble:tree`, `semble:search`, `semble:deps`, `semble:impact`, and `semble:savings` npm scripts.
- [x] Add agent exploration rules that prefer the wrapper for broad and semantic exploration.
- [x] Record the project-local tool decision and commands in the handoff.
- [x] Verify missing-binary behavior and npm script wiring.

### Task 3: Install and verify

**Files:**
- No tracked file changes.

- [x] Run `npm run semble:setup`.
- [x] Run `npm run semble:tree`.
- [x] Run `npm run semble:search -- "public D1 data loading" --outline`.
- [x] Run the repository lint and tests.
