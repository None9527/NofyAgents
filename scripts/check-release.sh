#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

cargo fmt --all --check
python3 scripts/verify-format-blindspots.py
python3 scripts/verify-doc-claims.py
cargo check --workspace --all-features --all-targets --locked
# The nofy-cli integration tests start the real kernel helper, a binary of another
# package that `cargo test -p nofy-cli` does not build. A clean checkout has none.
cargo build --locked -p nofy-agent-host -p nofy-cli
cargo test --locked \
  -p nofy-agent-project \
  -p nofy-agent-client \
  -p nofy-agent-mcp \
  -p nofy-isolation \
  -p nofy-host-path \
  -p nofy-cli
# A real kernel starts and serves the control plane through the command line.
bash scripts/smoke-kernel.sh
cargo test --locked -p nofy-agent-host --lib
cargo test --locked -p nofy-agent-host --test http real_api_enforces_scopes_and_pure_preview_then_runs_edited_releases_in_one_process -- --exact
cargo test --locked -p nofy-agent-host --test http accepted_http_request_survives_server_disconnect_and_reopen_before_worker_dispatch -- --exact
cargo test --locked -p nofy-agent-host --test http session_policy::
cargo test --locked -p nofy-agent-host --test http credentials::
python3 -m unittest discover -s presets/coding/tests -p 'test_*.py'

# Sandbox acceptance: real namespaces, cgroups and seccomp under a delegated
# cgroup. It needs a systemd user manager that grants Delegate=yes. Probe that
# first; when it is missing, say what was skipped instead of dropping the core
# security checks silently. Set NOFY_REQUIRE_SANDBOX=1 to make a skip an error.
if systemd-run --user --scope -p Delegate=yes true >/dev/null 2>&1; then
  cargo test --locked -p nofy-agent-host --test process_tree
else
  message="SKIPPED sandbox acceptance (nofy-agent-host --test process_tree): no systemd user manager with cgroup delegation"
  if [ "${GITHUB_ACTIONS:-}" = true ]; then
    echo "::warning title=Sandbox acceptance skipped::$message"
  else
    echo "$message" >&2
  fi
  if [ "${NOFY_REQUIRE_SANDBOX:-0}" = 1 ]; then
    exit 1
  fi
fi

python3 scripts/verify-framework-boundaries.py
python3 scripts/verify-lint-ratchets.py
python3 scripts/verify-platform-welds.py
