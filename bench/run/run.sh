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
  # 清上一轮残留的 provider 包装(bash -c 'sleep infinity | nofy agent stdio');
  # 经脚本文件执行以免 pkill -f 自匹配
  printf 'pkill -f "sleep infinity" 2>/dev/null || true\n' > /tmp/bench_cleanup.sh
  bash /tmp/bench_cleanup.sh || true
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
  u2)
    fresh_env
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    source bench/run/u2.sh
    ;;
  u3)
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    source bench/run/u3.sh
    ;;
  u4)
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    source bench/run/u4.sh
    ;;
  p2)
    fresh_env
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/u2.sh
    source bench/run/u3.sh
    source bench/run/u4.sh
    ;;
  u5)
    fresh_env
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/u5.sh
    ;;
  u6)
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/u6.sh
    ;;
  p3)
    fresh_env
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/u5.sh
    source bench/run/u6.sh
    ;;
  u7)
    fresh_env
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/u7.sh
    ;;
  u8|u9|u10)
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source "bench/run/$DIM.sh"
    ;;
  p4)
    fresh_env
    mkdir -p "$RESULTS"
    printf 'id\tstatus\tattr\tsecs\ttitle\tnote\n' > "$RESULTS/results.tsv"
    ensure_daemon
    source bench/run/u7.sh
    source bench/run/u8.sh
    source bench/run/u9.sh
    source bench/run/u10.sh
    ;;
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

# 诊断:脚本退出后谁还握着 stdout 管道(曾致整轮尾部挂起 55 分钟)
pipe_ref=$(readlink /proc/$$/fd/1 2>/dev/null || true)
case $pipe_ref in
  pipe:*)
    for p in $(pgrep -x nofy 2>/dev/null || true) $(pgrep -f "sleep infinity" 2>/dev/null || true); do
      if ls -l "/proc/$p/fd" 2>/dev/null | grep -qF "$pipe_ref"; then
        echo "HOLDS_PIPE pid=$p cmd=$(tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null)"
      fi
    done
    ;;
esac
