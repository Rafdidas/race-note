#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SEMBLE_BIN="$ROOT_DIR/.tools/semble/bin/semble_rs"

if [[ ! -x "$SEMBLE_BIN" ]]; then
  echo "Project-local semble_rs is not installed. Run: npm run semble:setup" >&2
  exit 1
fi

command_name="${1:-}"
if [[ -z "$command_name" ]]; then
  echo "Usage: scripts/semble.sh <tree|search|deps|impact|savings> [arguments]" >&2
  exit 2
fi
shift

case "$command_name" in
  tree)
    exec "$SEMBLE_BIN" tree "$ROOT_DIR" "$@"
    ;;
  search)
    query="${1:-}"
    if [[ -z "$query" ]]; then
      echo 'Usage: npm run semble:search -- "<query>" [semble options]' >&2
      exit 2
    fi
    shift
    exec "$SEMBLE_BIN" search "$query" "$ROOT_DIR" "$@"
    ;;
  deps|impact)
    file="${1:-}"
    if [[ -z "$file" ]]; then
      echo "Usage: npm run semble:$command_name -- <file> [semble options]" >&2
      exit 2
    fi
    shift
    exec "$SEMBLE_BIN" "$command_name" "$file" "$ROOT_DIR" "$@"
    ;;
  savings)
    exec "$SEMBLE_BIN" savings "$@"
    ;;
  *)
    echo "Unsupported command: $command_name" >&2
    exit 2
    ;;
esac
