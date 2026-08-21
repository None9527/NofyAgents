#!/usr/bin/env bash
# Benchmark orchestrator (P1: D5/D6/D7). Usage:
#   DASHSCOPE_FLASH_KEY=sk-... bash bench/run/run.sh [d5|d6|d7|all]
set -euo pipefail
cd /home/none/grok-build
export BENCH_ROOT=${BENCH_ROOT:-/tmp/nofy-bench}
TS=$(date +%Y%m%d-%H%M%S)
export RESULTS=$BENCH_ROOT/results/$TS
: "${DASHSCOPE_FLASH_KEY:?DASHSCOPE_FLASH_KEY must be exported}"
DIM=${1:-all}

source bench/run/lib.sh

fresh_env() {
  pkill -x nofy 2>/dev/null || true
  sleep 1
  rm -rf "$BENCH_ROOT"
  mkdir -p "$BENCH_ROOT/home"
  bash bench/run/fixtures.sh "$BENCH_ROOT"
  cat > "$BENCH_ROOT/home/config.toml" <<'EOF'
[models]
default = "bench"

[model.bench]
model = "deepseek-v4-flash-0731"
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
name = "Bench DeepSeek V4 Flash"
env_key = "DASHSCOPE_FLASH_KEY"
api_backend = "chat_completions"
context_window = 128000
EOF
}

printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > /dev/null  # header written after env prep

case $DIM in
  u1)
    fresh_env
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/u1.sh
    ;;
  d5)
    fresh_env
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/d5.sh
    ;;
  d6)
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/d6.sh
    ;;
  d7)
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/d7.sh
    ;;
  all)
    fresh_env
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/d5.sh
    source bench/run/d6.sh
    source bench/run/d7.sh
    ;;
esac

python3 bench/run/report.py "$RESULTS" > "$RESULTS/report.md" 2>/dev/null || true
echo "RESULTS_DIR=$RESULTS"
cat "$RESULTS/results.tsv"
