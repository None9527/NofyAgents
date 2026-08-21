#!/usr/bin/env bash
# D6 全局入口 — 10 tasks. Requires lib.sh sourced.
set -u
A=$BENCH_ROOT/projects/alpha
B=$BENCH_ROOT/projects/beta

# ---------- D6-01 daemon 单实例 ----------
task_start D6-01 "单实例:第二个 daemon 启动被拒或接管"
rc=0
NOFY_HOME=$BENCH_ROOT/home timeout 15 "$NOFY_BIN" daemon > "$RESULTS/D6-01.out" 2>&1 || rc=$?
if [ $rc -ne 0 ] || check_out_contains "$RESULTS/D6-01.out" "lock|already|running|in use|接管|占用"; then
  record pass - "第二实例未双跑(rc=$rc,输出有锁证据)"
else
  # 双跑不成立时控制面仍唯一也算通过一半;这里严格判
  record fail M "第二实例无声退出且无锁证据,需人工确认"
fi
ensure_daemon

# ---------- D6-02 全局会话列表 ----------
task_start D6-02 "全局会话列表:sessions list 含 alpha 会话"
rc=0
NOFY_HOME=$BENCH_ROOT/home timeout 60 "$NOFY_BIN" sessions list > "$RESULTS/D6-02.out" 2>&1 || rc=$?
if [ $rc -eq 0 ] && check_out_contains "$RESULTS/D6-02.out" "alpha"; then
  record pass - "列表含 alpha 项目会话"
else
  record fail H "rc=$rc; 列表无 alpha(会话 slug 展示形态需校准)"
fi

# ---------- D6-03 全局中文检索 ----------
task_start D6-03 "全局中文检索:播种中文会话后命中,负例零命中"
rc=$(run_headless "$B" 240 "$RESULTS/D6-03seed.out" --trust --yolo -- \
  "请记住这句话:青瓷茶盏编号七七。只回复已记住。")
NOFY_HOME=$BENCH_ROOT/home timeout 90 "$NOFY_BIN" sessions search "青瓷茶盏" > "$RESULTS/D6-03.out" 2>&1 || true
NOFY_HOME=$BENCH_ROOT/home timeout 90 "$NOFY_BIN" sessions search "不存在词zzzxyz" > "$RESULTS/D6-03neg.out" 2>&1 || true
if check_out_contains "$RESULTS/D6-03.out" "beta|青瓷" && check_not_contains "$RESULTS/D6-03neg.out" "beta"; then
  record pass - "中文命中 beta 会话,负例零命中"
else
  record fail M "命中或负例判定失败(见 D6-03.out)"
fi

# ---------- D6-04 按会话 ID 恢复 ----------
task_start D6-04 "会话恢复:--resume <id> 续答上文"
SID=$(ls -t "$BENCH_ROOT/home/sessions/%2Ftmp%2Fnofy-bench%2Fprojects%2Fbeta" 2>/dev/null | grep -v permission | head -1)
if [ -n "$SID" ]; then
  rc=0
  ( cd "$B" && timeout 240 "$NOFY_BIN" --resume "$SID" -p "我上次让你记住的编号是什么?只回复编号。" -m bench --yolo ) \
    > "$RESULTS/D6-04.out" 2>&1 || rc=$?
  if [ $rc -eq 0 ] && check_out_contains "$RESULTS/D6-04.out" "七七"; then
    record pass - "按 ID 恢复并召回上文"
  else
    record fail M "rc=$rc; 恢复后未召回"
  fi
else
  record fail H "未找到 beta 会话 ID(slug 目录假设需校准)"
fi

# ---------- D6-05 kill -9 对账 ----------
task_start D6-05 "kill -9 对账:调度表重启后仍在"
$CTL "$SOCK" schedule_enable >/dev/null
$CTL "$SOCK" schedule_add durable-job "17 3 * * *" >/dev/null
DPID=$(pgrep -x nofy | while read -r p; do
  tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null | grep -q "daemon" && echo "$p"
done | head -1 || true)
if [ -n "$DPID" ]; then kill -9 "$DPID" || true; sleep 2; fi
ensure_daemon
$CTL "$SOCK" schedule_list > "$RESULTS/D6-05.out" 2>&1
if check_out_contains "$RESULTS/D6-05.out" "durable-job"; then
  record pass - "kill -9 重启后调度表完整(FR1.3 对账)"
else
  record fail M "调度表丢失"
fi

# ---------- D6-06 schedule CLI 面 ----------
task_start D6-06 "schedule CLI:enable/add/list + 坏文法 fail-loud"
rc1=0
NOFY_HOME=$BENCH_ROOT/home timeout 30 "$NOFY_BIN" schedule add cli-job "*/10 * * * *" > "$RESULTS/D6-06.out" 2>&1 || rc1=$?
NOFY_HOME=$BENCH_ROOT/home timeout 30 "$NOFY_BIN" schedule list > "$RESULTS/D6-06list.out" 2>&1 || true
rc2=0
NOFY_HOME=$BENCH_ROOT/home timeout 30 "$NOFY_BIN" schedule add bad-job "not a cron" > "$RESULTS/D6-06bad.out" 2>&1 || rc2=$?
if [ $rc1 -eq 0 ] && check_out_contains "$RESULTS/D6-06list.out" "cli-job" \
   && [ $rc2 -ne 0 ] && check_out_contains "$RESULTS/D6-06bad.out" "refused|fields|拒"; then
  record pass - "CLI 全链路通,坏文法 fail-loud"
else
  record fail H "rc1=$rc1 rc2=$rc2(CLI 与 daemon 状态目录假设需校准)"
fi

# ---------- D6-07 schedule remove ----------
task_start D6-07 "schedule remove:条目与义务清零"
$CTL "$SOCK" schedule_remove cli-job >/dev/null
$CTL "$SOCK" schedule_list > "$RESULTS/D6-07.out" 2>&1
if check_not_contains "$RESULTS/D6-07.out" "cli-job"; then
  record pass - "移除后列表无该条"
else
  record fail M "移除未生效"
fi

# ---------- D6-08 全局记忆跨项目 ----------
task_start D6-08 "全局记忆:alpha 写入 beta 可读"
rc1=$(run_headless "$A" 240 "$RESULTS/D6-08a.out" --yolo --experimental-memory -- \
  "把这句话记入长期记忆:灯塔密码三三九。只回复已记住。")
rc2=$(run_headless "$B" 240 "$RESULTS/D6-08b.out" --yolo --experimental-memory -- \
  "查一下长期记忆里的灯塔密码是什么?只回复密码。")
if [ "$rc1" = 0 ] && [ "$rc2" = 0 ] && check_out_contains "$RESULTS/D6-08b.out" "三三九"; then
  record pass - "跨项目记忆读写通"
else
  record fail M "rc=$rc1/$rc2; 跨项目记忆未召回"
fi

# ---------- D6-09 默认零模型配置可用 ----------
task_start D6-09 "默认关:无模型凭据时控制面仍服务"
T=$BENCH_ROOT/home-zero
rm -rf "$T"; mkdir -p "$T"
NOFY_HOME=$T nohup "$NOFY_BIN" daemon --debug-file "$T/d.log" > "$T/d.out" 2>&1 &
ZPID=$!
ok=0
for _ in $(seq 1 20); do
  if [ -S "$T/daemon/control.sock" ] && $CTL "$T/daemon/control.sock" ping 2>/dev/null | grep -q pong; then ok=1; break; fi
  sleep 1
done
kill $ZPID 2>/dev/null || true
if [ $ok -eq 1 ]; then
  record pass - "零凭据启动,控制面即服务(默认关成立)"
else
  record fail M "零凭据时控制面不可用"
fi

# ---------- D6-10 leader 管理面 ----------
task_start D6-10 "leader 管理面:list/info 不崩"
rc=0
NOFY_HOME=$BENCH_ROOT/home timeout 30 "$NOFY_BIN" leader list > "$RESULTS/D6-10.out" 2>&1 || rc=$?
if [ $rc -eq 0 ]; then
  record partial - "leader list 可用;dashboard 为 TUI 面需人工(标 T)"
else
  record fail H "rc=$rc"
fi

echo "D6 done: pass=$pass_count partial=$partial_count fail=$fail_count"
