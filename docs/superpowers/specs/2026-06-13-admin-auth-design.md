# Admin Authentication Design

## Goal

Protect RaceNote admin pages with a single environment-password login and
revocable D1-backed sessions.

## Architecture

- `src/lib/admin-auth-crypto.ts` contains Web Crypto helpers for constant-work
  password verification, opaque token generation, and HMAC token hashing.
- `src/lib/admin-auth.ts` is a server-only data access layer that reads secrets,
  stores and validates D1 sessions, and manages the httpOnly cookie.
- `src/app/admin/actions.ts` exposes login and logout Server Actions.
- `src/components/admin/AdminLoginForm/AdminLoginForm.tsx` is the smallest client
  boundary required for pending and error states.
- The admin panel layout authorizes every request before rendering protected UI.

## Session Policy

- Cookie name: `racenote-admin-session`
- Lifetime: 7 days
- Cookie flags: `httpOnly`, `sameSite=lax`, `path=/admin`, `secure` in production
- The raw random token exists only in the cookie. D1 stores an
  `ADMIN_SESSION_SECRET` HMAC digest.
- Expired sessions are rejected and deleted when encountered.
- Logout deletes the D1 row and expires the cookie.

## Failure Behavior

- Missing password input and incorrect passwords return the same generic Korean
  error.
- Missing server secrets produce a generic configuration error without exposing
  secret names or values to the browser.
- Unauthenticated admin panel requests redirect to `/admin/login`.
- An authenticated request to `/admin/login` redirects to `/admin`.

## Deployment

Cloudflare must define `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` as encrypted
secrets before authentication can work in the deployed Worker.

## Verification

- Unit tests cover password verification, token hashing, token uniqueness, and
  expiration checks.
- Run `npm test`, `npm run lint`, `npm run build`, `npm run cf:build`,
  `npm run cf:types`, and `wrangler deploy --dry-run`.
