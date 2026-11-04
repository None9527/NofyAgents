#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

cargo fmt --all --check
cargo check --workspace --all-features --all-targets --locked
cargo test --locked \
  -p nofy-agent-project \
  -p nofy-agent-client \
  -p nofy-agent-mcp \
  -p nofy-cli
cargo test --locked -p nofy-agent-host --lib
cargo test --locked -p nofy-agent-host --test http real_api_enforces_scopes_and_pure_preview_then_runs_edited_releases_in_one_process -- --exact
cargo test --locked -p nofy-agent-host --test http accepted_http_request_survives_server_disconnect_and_reopen_before_worker_dispatch -- --exact
cargo test --locked -p nofy-agent-host --test http session_policy::
cargo test --locked -p nofy-agent-host --test http credentials::
python3 -m unittest discover -s presets/coding/tests -p 'test_*.py'
python3 scripts/verify-framework-boundaries.py
