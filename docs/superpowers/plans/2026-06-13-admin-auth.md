# Admin Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect RaceNote admin pages with a password login and revocable D1 sessions.

**Architecture:** Use tested Web Crypto helpers and a server-only D1 session DAL.
Invoke login and logout through Server Actions, and enforce authorization in the
admin panel layout.

**Tech Stack:** Next.js 16 Server Actions, React 19, Web Crypto, Drizzle ORM, Cloudflare D1

---

### Task 1: Authentication crypto

**Files:**
- Create: `src/lib/admin-auth-crypto.test.ts`
- Create: `src/lib/admin-auth-crypto.ts`

- [ ] Write failing tests for password verification, token hashing, unique token
  generation, and expiration.
- [ ] Run `npm test` and verify failure because the module is missing.
- [ ] Implement the Web Crypto helpers.
- [ ] Run `npm test` and verify all tests pass.

### Task 2: Session data access layer

**Files:**
- Create: `src/lib/admin-auth.ts`
- Modify: `src/db/schema/index.ts`

- [ ] Add server-only secret access, D1 session creation, validation, deletion,
  and cookie operations.
- [ ] Ensure expired sessions are deleted and rejected.
- [ ] Keep raw tokens out of D1.

### Task 3: Login and logout flows

**Files:**
- Create: `src/app/admin/actions.ts`
- Create: `src/components/admin/AdminLoginForm/AdminLoginForm.tsx`
- Modify: `src/app/admin/login/page.tsx`
- Modify: `src/app/admin/(panel)/layout.tsx`
- Modify: `src/components/admin/AdminNav/AdminNav.tsx`
- Modify: `src/app/admin/admin.scss`

- [ ] Add a Server Action login form with pending and generic error states.
- [ ] Redirect authenticated login-page requests to `/admin`.
- [ ] Protect the panel layout with D1 session authorization.
- [ ] Add a POST Server Action logout control.

### Task 4: Documentation and verification

**Files:**
- Modify: `README.md`
- Modify: `PROJECT_HANDOFF.md`

- [ ] Document required Cloudflare encrypted secrets and the completed auth flow.
- [ ] Run tests, lint, Next build, OpenNext build, Cloudflare types, and Wrangler
  dry-run.
