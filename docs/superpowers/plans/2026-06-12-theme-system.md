# RaceNote Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persisted light/dark theme toggle with neutral-gray/coral light colors and warm-black/lime dark colors.

**Architecture:** Keep the root layout as a Server Component and apply the initial theme with a synchronous inline script before first paint. Add a small `ThemeToggle` Client Component that updates `<html data-theme>` and persists the explicit user choice in `localStorage`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, global SCSS with BEM

---

### Task 1: Add Theme Tokens And Global Transition Rules

**Files:**
- Modify: `src/styles/abstracts/_variables.scss`
- Modify: `src/styles/base/_reset.scss`

- [ ] **Step 1: Replace the work-in-progress light tokens**

Update `:root` with the approved neutral-gray/coral values:

```scss
--color-canvas: #e7e7e4;
--color-surface: #f1f1ee;
--color-surface-raised: #fafaf7;
--color-text: #1b1a19;
--color-text-muted: #686460;
--color-text-faint: #918b86;
--color-line: #cbc7c2;
--color-line-strong: #99928b;
--color-accent: #e46f61;
--color-accent-ink: #1b1a19;
```

- [ ] **Step 2: Add dark theme token overrides**

Add a `[data-theme="dark"]` block with warm-black surfaces, warm text, restrained
lines, and a softened coral accent.

- [ ] **Step 3: Add color-scheme and reduced-motion behavior**

Set `color-scheme` for each theme, add global color transitions to theme-sensitive
elements, and disable transitions under `prefers-reduced-motion: reduce`.

- [ ] **Step 4: Run static verification**

Run: `npm run lint`

Expected: exit code 0.

### Task 2: Apply The Initial Theme Before First Paint

**Files:**
- Create: `src/components/ThemeScript/ThemeScript.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create the inline theme initialization script**

Create a Server Component that renders a synchronous inline script. The script must:

```js
var stored = localStorage.getItem("racenote-theme");
var theme =
  stored === "light" || stored === "dark"
    ? stored
    : matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
document.documentElement.dataset.theme = theme;
```

Wrap storage and media access in `try/catch`, falling back to `light`.

- [ ] **Step 2: Wire the script into the root layout**

Set `data-theme="light"` and `suppressHydrationWarning` on `<html>`, then render
`ThemeScript` inside `<head>` so it runs before first paint.

- [ ] **Step 3: Run static verification**

Run: `npm run lint`

Expected: exit code 0.

### Task 3: Add The Interactive Theme Toggle

**Files:**
- Create: `src/components/ThemeToggle/ThemeToggle.tsx`
- Create: `src/components/ThemeToggle/ThemeToggle.scss`
- Modify: `src/components/PublicHeader/PublicHeader.tsx`
- Modify: `src/components/PublicHeader/PublicHeader.scss`
- Modify: `src/styles/globals.scss`

- [ ] **Step 1: Create a focused Client Component**

Implement `ThemeToggle` with a lazy state initializer that reads
`document.documentElement.dataset.theme`. On click, switch the theme, update the
root dataset, persist `racenote-theme`, and expose an `aria-label` describing the
next action.

- [ ] **Step 2: Add the toggle to the public header**

Replace the static meta-only region with a meta group containing the toggle and
`KST · SEOUL`. Preserve the signal marker and navigation.

- [ ] **Step 3: Style desktop, mobile, focus, and hover states**

Keep the text-only technical style. Ensure the toggle remains visible below
`700px` while the location text can be shortened to `KST`.

- [ ] **Step 4: Register the component stylesheet**

Add the new SCSS partial to `src/styles/globals.scss`.

- [ ] **Step 5: Run static verification**

Run: `npm run lint`

Expected: exit code 0.

### Task 4: Verify Runtime Behavior And Document The Milestone

**Files:**
- Modify: `PROJECT_HANDOFF.md`

- [ ] **Step 1: Run production build verification**

Run: `npm run build`

Expected: Next.js production build completes successfully.

- [ ] **Step 2: Inspect the app in the browser**

Run the dev server and verify:

- No visible theme flash on reload.
- With no saved preference, system dark/light setting controls the first theme.
- Clicking the toggle changes `<html data-theme>`.
- `localStorage["racenote-theme"]` stores the explicit choice.
- Reload preserves the explicit choice.
- Public and admin screens remain legible in both themes.
- Mobile header keeps the toggle visible.
- Keyboard focus is visible.

- [ ] **Step 3: Update project handoff**

Record the finalized neutral-gray/coral light palette, warm-black/coral dark
palette, implemented toggle behavior, verification commands, and the next work
boundary in `PROJECT_HANDOFF.md`.

- [ ] **Step 4: Run final verification**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected: all commands exit with code 0.
