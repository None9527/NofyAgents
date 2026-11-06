#!/usr/bin/env bash
# Start a real kernel and drive it through the command line: the control plane
# working end to end on this platform, without running any isolated tool. Then
# kill it hard and start it again on the same state, to show that what it said
# was committed is still there. Needs `cargo build -p nofy-agent-host -p
# nofy-cli` first. Works on Linux, macOS and Windows (Git Bash).
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
# Stop the kernel the same hard way the test does: a plain `kill` does not end a
# native Windows process started from Git Bash, which then keeps its files open
# and makes removing the state directory fail. Cleaning up is best effort and
# never changes the script's result.
cleanup() {
  [ -z "$pid" ] || kill_hard
  rm -rf "$work" 2>/dev/null || true
}
trap cleanup EXIT

token="smoke-$$-0123456789abcdef0123456789abcdef"
printf '%s\n' '[{"token_env":"NOFY_SMOKE_TOKEN","scopes":["read","edit","publish","resources","execute"]}]' >"$work/access.json"
: >"$work/none.toml"
url=""
starts=0

# Start the kernel on the shared state directory and wait until it listens.
start_kernel() {
  starts=$((starts + 1))
  local log="$work/host-$starts.log"
  NOFY_SMOKE_TOKEN="$token" "$host" --listen 127.0.0.1:0 --state-dir "$work/state" \
    --access-file "$work/access.json" 2>"$log" &
  pid=$!
  url=""
  for _ in $(seq 1 150); do
    url="$(grep -o 'http://[0-9.:]*' "$log" 2>/dev/null | head -1 || true)"
    [ -n "$url" ] && break
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.2
  done
  if [ -z "$url" ]; then
    echo "the kernel did not start on $(uname -s) (start $starts). Its log:" >&2
    cat "$log" >&2
    exit 1
  fi
  echo "kernel listening at $url on $(uname -s) (start $starts)"
}

# A hard stop, not a graceful one: the kernel gets no chance to flush anything.
kill_hard() {
  kill -9 "$pid" 2>/dev/null || true
  for _ in $(seq 1 50); do
    kill -0 "$pid" 2>/dev/null || { pid=""; return; }
    sleep 0.1
  done
  # A native Windows process started from Git Bash may ignore the MSYS signal.
  if command -v taskkill >/dev/null 2>&1; then
    local winpid
    winpid="$(ps -p "$pid" 2>/dev/null | awk 'NR==2 {print $4}')"
    [ -z "$winpid" ] || taskkill //F //PID "$winpid" >/dev/null 2>&1 || true
    sleep 1
  fi
  pid=""
}

export NOFY_ACCESS_TOKEN="$token"
failures=0
# Run one command and require the envelope's status to be ok; with a second
# pattern, also require it in the output.
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
# Like step, and the output must also mention `needle`.
step_has() {
  local label="$1" needle="$2"
  shift 2
  local out
  out="$("$cli" --endpoint "$url" --config "$work/none.toml" "$@" 2>&1 || true)"
  if printf '%s' "$out" | grep -q '"status":"ok"' && printf '%s' "$out" | grep -q "$needle"; then
    echo "ok    $label"
  else
    echo "FAIL  $label (expected to find $needle)" >&2
    printf '%s\n' "$out" | head -c 600 >&2
    echo >&2
    failures=$((failures + 1))
  fi
}

start_kernel
step "describe the kernel" describe
step "create a managed Agent project" agent create smoke
step_has "list Agent projects" smoke agent list
step "inspect the Agent" agent inspect smoke
step "read the operation contract" schema --operation run.start

# What the kernel committed must survive a crash.
kill_hard
start_kernel
step_has "the project survives a hard kill" smoke agent list
step "the restarted kernel still serves it" agent inspect smoke

if [ "$failures" -ne 0 ]; then
  echo "$failures step(s) failed. Kernel log:" >&2
  head -c 2000 "$work/host-$starts.log" >&2
  exit 1
fi
echo "control plane smoke test passed"
