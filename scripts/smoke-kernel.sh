#!/usr/bin/env bash
# Start a real kernel and drive it through the command line: the control plane
# working end to end on this platform, without running any isolated tool.
# Needs `cargo build -p nofy-agent-host -p nofy-cli` first. Works on Linux, macOS
# and Windows (Git Bash).
set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
exe=""
case "$(uname -s)" in MINGW* | MSYS* | CYGWIN*) exe=".exe" ;; esac
host="$root/target/debug/nofy-agent-host$exe"
cli="$root/target/debug/nofy$exe"
for binary in "$host" "$cli"; do
  [ -f "$binary" ] || { echo "missing $binary; build nofy-agent-host and nofy-cli first" >&2; exit 2; }
done

work="$(mktemp -d)"
pid=""
cleanup() {
  [ -z "$pid" ] || kill "$pid" 2>/dev/null || true
  rm -rf "$work"
}
trap cleanup EXIT

token="smoke-$$-0123456789abcdef0123456789abcdef"
printf '%s\n' '[{"token_env":"NOFY_SMOKE_TOKEN","scopes":["read","edit","publish","resources","execute"]}]' >"$work/access.json"

NOFY_SMOKE_TOKEN="$token" "$host" --listen 127.0.0.1:0 --state-dir "$work/state" \
  --access-file "$work/access.json" 2>"$work/host.log" &
pid=$!

url=""
for _ in $(seq 1 150); do
  url="$(grep -o 'http://[0-9.:]*' "$work/host.log" 2>/dev/null | head -1 || true)"
  [ -n "$url" ] && break
  kill -0 "$pid" 2>/dev/null || break
  sleep 0.2
done
if [ -z "$url" ]; then
  echo "the kernel did not start on $(uname -s). Its log:" >&2
  cat "$work/host.log" >&2
  exit 1
fi
echo "kernel listening at $url on $(uname -s)"

export NOFY_ACCESS_TOKEN="$token"
failures=0
step() {
  local label="$1"
  shift
  local out
  out="$("$cli" --endpoint "$url" --config "$work/none.toml" "$@" 2>&1 || true)"
  if printf '%s' "$out" | grep -q '"status":"ok"'; then
    echo "ok    $label"
  else
    echo "FAIL  $label" >&2
    printf '%s\n' "$out" | head -c 600 >&2
    echo >&2
    failures=$((failures + 1))
  fi
}
: >"$work/none.toml"

step "describe the kernel" describe
step "create a managed Agent project" agent create smoke
step "list Agent projects" agent list
step "inspect the Agent" agent inspect smoke
step "read the operation contract" schema --operation run.start

if [ "$failures" -ne 0 ]; then
  echo "$failures step(s) failed. Kernel log:" >&2
  head -c 2000 "$work/host.log" >&2
  exit 1
fi
echo "control plane smoke test passed"
