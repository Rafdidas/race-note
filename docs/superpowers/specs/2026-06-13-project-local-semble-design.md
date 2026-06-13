# Project-Local semble_rs Design

## Goal

Configure `semble_rs` as a reproducible, project-local code exploration tool for
RaceNote without requiring a global Rust or `semble_rs` installation.

## Architecture

- Install a private Rust toolchain under `.tools/rustup` and `.tools/cargo` when
  no usable project-local toolchain exists.
- Install the pinned `semble_rs v0.9.1` binary under `.tools/semble/bin`.
- Expose project-root-aware commands through `scripts/semble.sh`.
- Expose setup and common exploration commands through npm scripts.
- Keep downloaded tools out of Git. The upstream model loader stores its
  embedding model in the user's default Hugging Face cache.

## Commands

- `npm run semble:setup`: install or refresh the pinned local binary.
- `npm run semble:tree`: show the RaceNote source tree and symbols.
- `npm run semble:search -- "<query>"`: search RaceNote semantically.
- `npm run semble:deps -- <file>`: show a file's dependencies.
- `npm run semble:impact -- <file>`: show reverse dependencies.
- `npm run semble:savings`: show estimated token savings.

## Agent Behavior

Agents should prefer the project npm commands for broad codebase mapping,
semantic search, and dependency or impact analysis. Exact literal searches may
still use `rg`, and normal file reads remain appropriate after targets are
known.

## Error Handling And Verification

The wrapper exits with an actionable setup message when the binary is missing
and validates required query/file arguments. Shell syntax, missing-binary
behavior, npm script wiring, and a real local setup/search run verify the
integration.
