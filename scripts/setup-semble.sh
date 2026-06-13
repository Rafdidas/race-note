#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="$ROOT_DIR/.tools"
CARGO_HOME="$TOOLS_DIR/cargo"
RUSTUP_HOME="$TOOLS_DIR/rustup"
SEMBLE_ROOT="$TOOLS_DIR/semble"
SEMBLE_VERSION="${SEMBLE_VERSION:-v0.9.1}"

export CARGO_HOME RUSTUP_HOME

mkdir -p "$TOOLS_DIR"

if [[ -x "$SEMBLE_ROOT/bin/semble_rs" ]] &&
  [[ -f "$SEMBLE_ROOT/.crates.toml" ]] &&
  grep -q "semble ${SEMBLE_VERSION#v} " "$SEMBLE_ROOT/.crates.toml"; then
  echo "semble_rs $SEMBLE_VERSION is already installed at $SEMBLE_ROOT/bin/semble_rs"
  exit 0
fi

if [[ ! -x "$CARGO_HOME/bin/cargo" ]]; then
  command -v curl >/dev/null 2>&1 || {
    echo "curl is required to install the project-local Rust toolchain." >&2
    exit 1
  }

  echo "Installing project-local Rust toolchain..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs |
    sh -s -- -y --no-modify-path --profile minimal
fi

echo "Installing semble_rs $SEMBLE_VERSION..."
"$CARGO_HOME/bin/cargo" install \
  --git https://github.com/johunsang/semble_rs.git \
  --tag "$SEMBLE_VERSION" \
  --locked \
  --root "$SEMBLE_ROOT" \
  --force

echo "semble_rs installed at $SEMBLE_ROOT/bin/semble_rs"
