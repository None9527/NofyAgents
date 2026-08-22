#!/usr/bin/env bash
# Benchmark harness library: env, lifecycle, headless runs, checks, recording.
# Sourced by d5.sh / d6.sh / d7.sh. Requires $BENCH_ROOT and $RESULTS set.

NOFY_BIN=/home/none/grok-build/target/debug/nofy
CTL="python3 /home/none/grok-build/bench/run/ctl.py"
SOCK=$BENCH_ROOT/home/daemon/control.sock
export NOFY_HOME=$BENCH_ROOT/home

# model key is injected by run.sh from the environment at launch
: "${DASHSCOPE_FLASH_KEY:?DASHSCOPE_FLASH_KEY must be exported}"
export DASHSCOPE_FLASH_KEY

pass_count=0; partial_count=0; fail_count=0

task_start() { # $1=id $2=title
  CUR_ID=$1; CUR_TITLE=$2; CUR_START=$(date +%s)
  echo "=== $1: $2"
}

# record <status> <attribution> <note>
# status: pass | partial | fail ; attribution: - | M | W | H
record() {
  local status=$1 attr=$2 note=$3
  local secs=$(( $(date +%s) - CUR_START ))
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$CUR_ID" "$status" "$attr" "$secs" "$CUR_TITLE" "$note" >> "$RESULTS/results.tsv"
  case $status in
    pass) pass_count=$((pass_count+1));;
    partial) partial_count=$((partial_count+1));;
    fail) fail_count=$((fail_count+1));;
  esac
  echo "--- $CUR_ID => $status (attr=$attr, ${secs}s) $note"
}

# run_headless <project_dir> <timeout_s> <outfile> [--yolo] [--trust] [-- extra nofy args] -- <prompt...>
run_headless() {
  local proj=$1 tmo=$2 out=$3; shift 3
  local args=(); local prompt=()
  local seen_ddash=0
  for a in "$@"; do
    if [ "$a" = "--" ]; then seen_ddash=1; continue; fi
    if [ $seen_ddash = 0 ]; then args+=("$a"); else prompt+=("$a"); fi
  done
  local rc=0
  ( cd "$proj" && timeout "$tmo" "$NOFY_BIN" -p "${prompt[*]}" -m bench "${args[@]}" ) \
    > "$out" 2>"$out.err" || rc=$?
  echo $rc
}

# wait_journal <task_id> <pattern> <timeout_s>
wait_journal() {
  local tid=$1 pat=$2 tmo=$3 j=$BENCH_ROOT/home/daemon/task_journal.jsonl
  local deadline=$(( $(date +%s) + tmo ))
  while [ $(date +%s) -lt $deadline ]; do
    if [ -f "$j" ] && grep -a "\"task\":\"$tid\"" "$j" | grep -aq "$pat"; then return 0; fi
    sleep 3
  done
  return 1
}

check_file() { # <path> -> exists & non-empty
  [ -s "$1" ]
}
check_file_contains() { # <path> <pattern>
  [ -f "$1" ] && grep -qE "$2" "$1"
}
check_out_contains() { # <outfile> <pattern>
  grep -qaiE "$2" "$1"
}
check_not_contains() { # <outfile> <pattern>
  ! grep -qaiE "$2" "$1"
}

ensure_daemon() {
  if [ ! -S "$SOCK" ] || ! $CTL "$SOCK" ping >/dev/null 2>&1; then
    rm -f "$SOCK"
    # setsid + 全 fd 重定向:子进程不得继承 harness 的管道/终端,
    # 否则 run.sh 退出被悬挂(曾致整轮挂起)。
    NOFY_HOME=$BENCH_ROOT/home setsid nohup "$NOFY_BIN" daemon \
      --debug-file "$BENCH_ROOT/daemon.log" \
      </dev/null > "$BENCH_ROOT/daemon.out" 2>&1 &
    for _ in $(seq 1 30); do
      [ -S "$SOCK" ] && $CTL "$SOCK" ping >/dev/null 2>&1 && return 0
      sleep 1
    done
    # 卡死循环保护拒绝自恢复(连续非干净死亡≥3):本 harness 故意
    # kill -9 制造了该状态,清取证账本重置计数后重试一次。
    if grep -aq "stuck-loop signature" "$BENCH_ROOT/daemon.out" 2>/dev/null; then
      rm -f "$BENCH_ROOT/home/daemon/forensics.jsonl" "$SOCK"
      NOFY_HOME=$BENCH_ROOT/home setsid nohup "$NOFY_BIN" daemon \
        --debug-file "$BENCH_ROOT/daemon.log" \
        </dev/null > "$BENCH_ROOT/daemon.out" 2>&1 &
      for _ in $(seq 1 30); do
        [ -S "$SOCK" ] && $CTL "$SOCK" ping >/dev/null 2>&1 && return 0
        sleep 1
      done
    fi
    return 1
  fi
  return 0
}

provider_nofy_alive() { # 存在 cmdline 含 agent stdio 的存活 nofy 进程
  # 注意:不能只用 pgrep -x nofy —— daemon 也是 nofy 进程,会误判。
  local p
  for p in $(pgrep -x nofy 2>/dev/null); do
    if tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null | grep -q "agent stdio"; then
      return 0
    fi
  done
  return 1
}

ensure_provider() { # $1 = project dir to run in
  local proj=$1
  local alive=0
  if [ -f "$BENCH_ROOT/provider.pid" ] && grep -q "$proj" "$BENCH_ROOT/provider.cwd" 2>/dev/null; then
    # liveness = the recorded provider pid is a running agent-stdio wrapper
    # AND a nofy agent-stdio process is actually alive (the wrapper outlives
    # a dead nofy; the daemon alone must NOT count as a live provider).
    local pid; pid=$(cat "$BENCH_ROOT/provider.pid" 2>/dev/null)
    if [ -n "$pid" ] && tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null | grep -q "agent stdio" \
       && provider_nofy_alive; then
      alive=1
    fi
  fi
  [ $alive -eq 1 ] && return 0
  pgrep -x nofy 2>/dev/null | while read -r p; do
    # keep daemon, kill any stdio provider
    if tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null | grep -q "agent stdio"; then kill "$p" || true; fi
  done || true
  sleep 1
  : > "$BENCH_ROOT/provider.log"
  ( cd "$proj" && NOFY_HOME=$BENCH_ROOT/home NOFY_DAEMON_SOCK=$SOCK \
      setsid nohup bash -c "sleep infinity | $NOFY_BIN agent stdio --debug-file $BENCH_ROOT/provider.log" \
      </dev/null > "$BENCH_ROOT/provider.out" 2>&1 &
    echo $! > "$BENCH_ROOT/provider.pid" )
  echo "$proj" > "$BENCH_ROOT/provider.cwd"
  for _ in $(seq 1 40); do
    grep -aq "provider registered" "$BENCH_ROOT/provider.log" 2>/dev/null && return 0
    sleep 1
  done
  return 1
}
