#!/usr/bin/env bash
# U6 定时与自动化 — 10 tasks(v2)。
# 用户面 = nofy schedule enable/add/remove/list(控制面动词已存在)。
# 校准事实:调度项只有 id+cron,无任务载荷;daemon 无时钟线程,触发桥缺失(W-5);
# enable 之前 add 会被拒(default-off 在注册处就强制)。
set -u
NOFY=/home/none/grok-build/target/debug/nofy
H=$BENCH_ROOT/home
J=$H/daemon/schedule.jsonl
export NOFY_HOME=$H

sch() { timeout 30 "$NOFY" schedule "$@"; }

# ---------- U6-10 默认关(全新环境,未 enable) ----------
task_start U6-10 "默认关:未 enable 前绝不触发"
HF=$BENCH_ROOT/home-fresh
mkdir -p "$HF"
cp "$H/config.toml" "$HF/config.toml" 2>/dev/null || true
NOFY_HOME=$HF setsid nohup "$NOFY" daemon --debug-file "$BENCH_ROOT/daemon-fresh.log" \
  </dev/null > "$BENCH_ROOT/daemon-fresh.out" 2>&1 &
sleep 5
rc=0
NOFY_HOME=$HF timeout 30 "$NOFY" schedule add silent-probe "* * * * *" > "$RESULTS/U6-10add.out" 2>&1 || rc=$?
if [ "$rc" -ne 0 ] && grep -qai "disabled" "$RESULTS/U6-10add.out"; then
  record pass - "default-off 双重强制:未 enable 连注册都被拒(disabled),遑论触发"
else
  # add 居然成功:等一个窗口验证不触发
  sleep 65
  fires=$(grep -ac '"Fired"' "$HF/daemon/schedule.jsonl" 2>/dev/null || true)
  if [ "${fires:-0}" -eq 0 ]; then
    record pass - "未 enable 跨窗口零触发"
  else
    record fail M "未 enable 却触发了 ${fires} 次"
  fi
fi

# 主 home:先 enable(产品要求 enable 先于 add)
sch enable > "$RESULTS/U6-enable.out" 2>&1 || true

# ---------- U6-09 坏语法当场拒 ----------
task_start U6-09 "坏语法当场拒:fail-loud 不静默收下"
rc=0
sch add bad-probe "not a cron" > "$RESULTS/U6-09.out" 2>&1 || rc=$?
if [ "$rc" -ne 0 ] && grep -qaiE "error|invalid|refus|expect|bad" "$RESULTS/U6-09.out"; then
  record pass - "坏 cron 被拒且有说明(rc=$rc)"
else
  record fail M "rc=$rc;坏语法被静默收下或无说明"
fi

# ---------- U6-05 看得见日程 ----------
task_start U6-05 "看得见日程:list 与所加一致"
sch add job-a "*/5 * * * *" > "$RESULTS/U6-05add.out" 2>&1 || true
sch add job-b "0 9 * * 1" > "$RESULTS/U6-05add.out" 2>&1 || true
sch list > "$RESULTS/U6-05.out" 2>&1 || true
if grep -qa "job-a" "$RESULTS/U6-05.out" && grep -qa "job-b" "$RESULTS/U6-05.out"; then
  record pass - "两条日程都在表上"
else
  record fail M "日程缺失(见 U6-05.out / U6-05add.out)"
fi

# ---------- U6-01 定期跑 ----------
task_start U6-01 "定期跑:按时触发且产物出现"
sch add tick-u601 "* * * * *" > /dev/null 2>&1 || true
sleep 75   # 跨至少一个整分钟窗口
fires=$(grep -ac '"Fired"' "$J" 2>/dev/null || true)
deliv=$(find "$H" -path "*scheduler/deliveries*" -name "*.json" 2>/dev/null | wc -l || true)
sch list > "$RESULTS/U6-01list.out" 2>&1 || true
if [ "${fires:-0}" -ge 1 ] && [ "${deliv:-0}" -ge 1 ]; then
  record pass - "触发且产物落盘"
elif grep -qa "tick-u601" "$RESULTS/U6-01list.out"; then
  record partial W-5 "条目在表且已 enable,但跨整分钟窗口零触发(fires=${fires:-0},deliveries=${deliv:-0}):daemon 无时钟线程,触发桥缺失"
else
  record fail M "条目都丢了"
fi

# ---------- U6-06 删得掉 ----------
task_start U6-06 "删得掉:remove 后不再触发"
before=$(grep -ac '"Fired"' "$J" 2>/dev/null || true)
sch remove job-b > "$RESULTS/U6-06.out" 2>&1 || true
sch list > "$RESULTS/U6-06list.out" 2>&1 || true
sleep 65   # 跨一个窗口,确认无新触发
after=$(grep -ac '"Fired"' "$J" 2>/dev/null || true)
if ! grep -qa "job-b" "$RESULTS/U6-06list.out" && [ "${after:-0}" -le "${before:-0}" ]; then
  record pass - "移除后列表无该条且无新触发(注:当前本就不触发,W-5)"
else
  record fail M "移除无效或移除后仍触发"
fi

# ---------- U6-03 错过会补 ----------
task_start U6-03 "错过会补:停机跨窗口再启,追赶不风暴"
sch add catch-u603 "* * * * *" > /dev/null 2>&1 || true
DPID=$(pgrep -x nofy 2>/dev/null | while read -r p; do
  tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null | grep -q "daemon --debug-file $BENCH_ROOT/daemon.log" && echo "$p"
done | head -1 || true)
[ -n "$DPID" ] && kill -9 "$DPID" || true
sleep 75   # 停机跨至少一个窗口
ensure_daemon || true
sleep 3
catchup=$(grep -acE '"Dropped"|"CatchUp"|catch' "$J" 2>/dev/null || true)
fired=$(grep -a '"Fired"' "$J" 2>/dev/null | grep -ac "catch-u603" || true)
if [ "${fired:-0}" -ge 1 ] && [ "${fired:-0}" -le 2 ]; then
  record pass - "追赶一次不风暴"
else
  record partial W-5 "重启后无追赶(fired=${fired:-0},catchup=${catchup:-0}):recover 只重放日志,未接 startup_repair"
fi

# ---------- U6-02 一次性 ----------
task_start U6-02 "一次性任务:触发一次不多不少"
if sch add --help 2>&1 | grep -qaiE "once|one-shot|count|times"; then
  record pass - "存在一次性表面"
else
  record fail W-5 "schedule add 只收 5 字段 cron,无一次性(once/次数)概念:用户无法加『只跑一次』的任务"
fi

# ---------- U6-04 连败会停 ----------
task_start U6-04 "连败自禁用:连败 3 次后停且原因可查"
if sch add --help 2>&1 | grep -qaiE "payload|prompt|task|command"; then
  record pass - "调度带任务体,失败语义可测"
else
  record partial W-5 "调度项无任务载荷(仅 id+cron):无『运行失败』概念,连败自禁用不可达;核心算法 self_disable_events 存在但未接线"
fi

# ---------- U6-07 定时也守约定 ----------
task_start U6-07 "定时也守约定:任务落项目内守 AGENTS.md"
if sch add --help 2>&1 | grep -qaiE "cwd|project|dir"; then
  record pass - "调度可绑定项目"
else
  record partial W-2 "调度无项目/目录绑定:『定时任务守项目约定』无落点(W-2 同族)"
fi

# ---------- U6-08 事后可查 ----------
task_start U6-08 "事后可查:定时任务结果有记录可追"
if [ -f "$J" ] && grep -qa "tick-u601" "$J"; then
  if sch list 2>&1 | grep -qaiE "last.*run|run_id|result"; then
    record pass - "运行结果可从 list 查"
  else
    record partial W-5 "仅原始日志 schedule.jsonl 有登记事件;无运行结果(从未触发),亦无查询动词"
  fi
else
  record fail M "连日志里都没有调度记录"
fi

# 清理:停掉 fresh daemon,清空日程
FPID=$(pgrep -f "daemon-fresh.log" 2>/dev/null | head -1 || true)
[ -n "$FPID" ] && kill "$FPID" 2>/dev/null || true
sch remove tick-u601 > /dev/null 2>&1 || true
sch remove job-a > /dev/null 2>&1 || true
sch remove catch-u603 > /dev/null 2>&1 || true

echo "U6 done: pass=$pass_count partial=$partial_count fail=$fail_count"
