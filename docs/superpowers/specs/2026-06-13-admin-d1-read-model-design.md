# Admin D1 Read Model Design

## Goal

Replace the admin dashboard, sync, race list, and race detail mock-data reads
with a shared D1-backed read model while keeping all mutation controls disabled.

## Architecture

- `src/types/admin-data.ts` defines admin UI models and raw query row contracts.
- `src/lib/admin-data-format.ts` converts D1 rows into KST-aware admin UI models.
- `src/lib/admin-data.ts` owns Drizzle queries and development mock fallback.
- Admin pages remain Server Components and await the shared read functions.
- The dynamic race detail route resolves arbitrary D1 race IDs at request time.

## Behavior

- Production and Cloudflare builds read all races regardless of publish status.
- Development keeps the current mock fallback because local `workerd` is a known
  unsupported path.
- Review queue entries include races with `needs_review` or AI states that need
  editorial review.
- Sync pages show actual sources and logs. Empty tables are valid until sync
  sources and logs are created.
- Missing race IDs return the existing 404 page.
- Save, AI generation, review, publish, and sync controls remain disabled.

## Verification

- Unit tests cover admin race conversion, KST timestamps, sync source latest-log
  selection, and review queue derivation.
- Run `npm test`, `npm run lint`, `npm run build`, and `npm run cf:build`.
