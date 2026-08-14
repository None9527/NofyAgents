#!/usr/bin/env bash
# Stage-2 A/B harness: does the RTAgent runtime stack improve real-model
# task outcomes?
#
# Each task runs in two arms:
#   control   — all RTAgent switches off (default behavior)
#   treatment — NOFY_RUNTIME_JOURNAL=1 NOFY_WORLD_STATE=1
#               NOFY_VERIFICATION_GATE=1 NOFY_CONVERGENCE_GOVERNOR=1
#
# Every run gets an isolated HOME (fresh config/session state), a fresh
# copy of the task fixture, and identical prompt/model/turn budget.
# Success is judged objectively by the task's check.sh after the agent
# finishes. Journal/transcript metrics are collected per run.
set -u

ROOT="$(cd "$(dirname "$0")" && pwd)"
NOFY_BIN="${NOFY_BIN:-$ROOT/../target/debug/nofy}"
MODEL="${AB_MODEL:-deepseek-v4-flash-0731}"
TASKS_DIR="${AB_TASKS_DIR:-$ROOT/tasks}"
API_BASE="${NOFY_API_BASE_URL:-https://dashscope.aliyuncs.com/compatible-mode/v1}"
API_KEY="${NOFY_API_KEY:?set NOFY_API_KEY}"
MAX_TURNS="${AB_MAX_TURNS:-20}"
TIMEOUT_SECS="${AB_TIMEOUT:-300}"
OUT="$ROOT/results/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"

run_arm_in_repo() {
  local task="$1" arm="$2"
  local work="$OUT/$task-$arm"
  local prompt
  prompt="$(cat "$TASKS_DIR/$task/PROMPT.txt")"
  local env_args=(
    env
    "HOME=$work/home"
    "NOFY_API_BASE_URL=$API_BASE"
    "NOFY_API_KEY=$API_KEY"
    "NOFY_DISABLE_TELEMETRY=1"
    "RUST_MIN_STACK=16777216"
  )
  if [ "$arm" = "treatment" ]; then
    env_args+=(
      "NOFY_RUNTIME_JOURNAL=1"
      "NOFY_WORLD_STATE=1"
      "NOFY_VERIFICATION_GATE=1"
      "NOFY_CONVERGENCE_GOVERNOR=1"
    )
  fi
  local start end
  start=$(date +%s)
  (
    cd "$work/repo" || exit 90
    "${env_args[@]}" timeout "$TIMEOUT_SECS" "$NOFY_BIN" \
      -m "$MODEL" --yolo --max-turns "$MAX_TURNS" \
      -p "$prompt" \
      > "$work/agent_stdout.txt" 2> "$work/agent_stderr.txt"
  )
  end=$(date +%s)
  echo $((end - start)) > "$work/elapsed_secs.txt"

  # Objective success check after the agent finishes.
  if ( cd "$work/repo" && bash check.sh > "$work/check_out.txt" 2>&1 ); then
    echo PASS > "$work/verdict.txt"
  else
    echo FAIL > "$work/verdict.txt"
  fi

  # Metrics.
  {
    echo "task=$task arm=$arm"
    echo "verdict=$(cat "$work/verdict.txt")"
    echo "elapsed_secs=$(cat "$work/elapsed_secs.txt")"
    local journal
    journal=$(find "$work/home" -name runtime_events.jsonl 2>/dev/null | head -1)
    if [ -n "$journal" ]; then
      echo "journal_events=$(wc -l < "$journal")"
      echo "tool_invoked=$(grep -c '"kind":"tool.invoked"' "$journal" || true)"
      echo "tool_succeeded=$(grep -c '"kind":"tool.succeeded"' "$journal" || true)"
      echo "tool_failed=$(grep -c '"kind":"tool.failed"' "$journal" || true)"
      echo "reminders=$(grep -c '"kind":"reminder.injected"' "$journal" || true)"
      echo "frame_reminders=$(grep -c 'world_state_frame' "$journal" || true)"
      echo "verification_reminders=$(grep -c 'verification_missing' "$journal" || true)"
      echo "budget_events=$(grep -c '"kind":"budget.updated"' "$journal" || true)"
    else
      echo "journal_events=0"
    fi
    local chat
    chat=$(find "$work/home" -name chat_history.jsonl 2>/dev/null | head -1)
    if [ -n "$chat" ]; then
      echo "assistant_msgs=$(grep -c '"role":"assistant"' "$chat" || true)"
      echo "tool_calls=$(grep -o '"tool_calls"' "$chat" | wc -l || true)"
    fi
  } > "$work/metrics.txt"
  cat "$work/metrics.txt"
  echo "---"
}

prepare() {
  local task="$1" arm="$2"
  local work="$OUT/$task-$arm"
  mkdir -p "$work/home" "$work/repo"
  cp -r "$TASKS_DIR/$task/." "$work/repo/"
}

echo "== A/B run: model=$MODEL out=$OUT ==" >&2
for task in $(ls "$TASKS_DIR"); do
  for arm in control treatment; do
    prepare "$task" "$arm"
  done
done
# Run arms interleaved per task to reduce drift effects.
for task in $(ls "$TASKS_DIR"); do
  for arm in control treatment; do
    echo ">>> $task [$arm]" >&2
    run_arm_in_repo "$task" "$arm"
  done
done

echo "== summary ==" >&2
printf "%-24s %-10s %-8s %s\n" "run" "verdict" "secs" "tools(inv/ok/fail) reminders"
for task in $(ls "$TASKS_DIR"); do
  for arm in control treatment; do
    local_work="$OUT/$task-$arm"
    verdict=$(cat "$local_work/verdict.txt" 2>/dev/null || echo "?")
    secs=$(cat "$local_work/elapsed_secs.txt" 2>/dev/null || echo "?")
    tools=$(grep -E "tool_invoked|tool_succeeded|tool_failed" "$local_work/metrics.txt" 2>/dev/null | cut -d= -f2 | paste -sd/ -)
    rem=$(grep "reminders=" "$local_work/metrics.txt" 2>/dev/null | head -1 | cut -d= -f2)
    printf "%-24s %-10s %-8s %s / %s\n" "$task-$arm" "$verdict" "$secs" "$tools" "${rem:-0}"
  done
done

echo "== behavior analysis ==" >&2
python3 "$ROOT/analyze.py" "$OUT" "$TASKS_DIR"
