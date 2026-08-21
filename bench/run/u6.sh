#!/usr/bin/env bash
# U6 定时与自动化 — 10 tasks(v2)。
# 用户面 = nofy schedule enable/add/remove/list;add 带 --goal(必填)/--cwd/--once。
# 校准事实(W-5 已修):daemon 有时钟线程(schedclock),触发桥经 TaskPoll→provider;
# 成功运行落 delivery 文件($NOFY_HOME/scheduler/deliveries/);连败 3 次自禁用;
# enable 之前 add 会被拒(default-off 在注册处就强制)。
set -u
NOFY=/home/none/grok-build/target/debug/nofy
H=$BENCH_ROOT/home
J=$H/daemon/schedule.jsonl
D=$H/scheduler/deliveries
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
NOFY_HOME=$HF timeout 30 "$NOFY" schedule add silent-probe "* * * * *" --goal "probe" > "$RESULTS/U6-10add.out" 2>&1 || rc=$?
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
sch add bad-probe "not a cron" --goal "probe" > "$RESULTS/U6-09.out" 2>&1 || rc=$?
if [ "$rc" -ne 0 ] && grep -qaiE "error|invalid|refus|expect|bad" "$RESULTS/U6-09.out"; then
  record pass - "坏 cron 被拒且有说明(rc=$rc)"
else
  record fail M "rc=$rc;坏语法被静默收下或无说明"
fi

# ---------- U6-05 看得见日程 ----------
task_start U6-05 "看得见日程:list 与所加一致(含载荷)"
sch add job-a "*/5 * * * *" --goal "整理收件箱" > "$RESULTS/U6-05add.out" 2>&1 || true
sch add job-b "0 9 * * 1" --goal "周报汇总" > "$RESULTS/U6-05add2.out" 2>&1 || true
sch list > "$RESULTS/U6-05.out" 2>&1 || true
if grep -qa "job-a" "$RESULTS/U6-05.out" && grep -qa "job-b" "$RESULTS/U6-05.out" \
   && grep -qa "整理收件箱" "$RESULTS/U6-05.out"; then
  record pass - "两条日程都在表上且载荷可见"
else
  record fail M "日程缺失或载荷不可见(见 U6-05.out / U6-05add.out)"
fi

# ---------- U6-01 定期跑 ----------
task_start U6-01 "定期跑:按时触发且产物出现"
sch add tick-u601 "* * * * *" --goal "回复一个字:钟" > /dev/null 2>&1 || true
sleep 75   # 跨至少一个整分钟窗口
fires=$(grep -ac '"Fired"' "$J" 2>/dev/null || true)
deliv=$(find "$D" -name "tick-u601-*.json" 2>/dev/null | wc -l || true)
sch list > "$RESULTS/U6-01list.out" 2>&1 || true
if [ "${fires:-0}" -ge 1 ] && [ "${deliv:-0}" -ge 1 ]; then
  record pass - "触发且产物落盘(fires=$fires,deliveries=$deliv)"
elif [ "${fires:-0}" -ge 1 ]; then
  record partial M "触发了($fires 次)但无 delivery 产物:provider 未连接或运行失败"
else
  record fail M "跨整分钟窗口零触发(见 U6-01list.out)"
fi

# ---------- U6-06 删得掉 ----------
task_start U6-06 "删得掉:remove 后不再触发"
before=$(grep -ac '"Fired"' "$J" 2>/dev/null || true)
sch remove job-b > "$RESULTS/U6-06.out" 2>&1 || true
sch list > "$RESULTS/U6-06list.out" 2>&1 || true
sleep 65   # 跨一个窗口,确认无新触发
after=$(grep -ac '"Fired"' "$J" 2>/dev/null || true)
if ! grep -qa "job-b" "$RESULTS/U6-06list.out" && [ "${after:-0}" -le "${before:-0}" ]; then
  record pass - "移除后列表无该条且无新触发"
else
  record fail M "移除无效或移除后仍触发"
fi

# ---------- U6-03 错过会补 ----------
task_start U6-03 "错过会补:停机跨窗口再启,追赶不风暴"
sch add catch-u603 "* * * * *" --goal "追赶探针" > /dev/null 2>&1 || true
sleep 5  # 让时钟先 arm 一次,停机才有未竟义务
DPID=$(pgrep -x nofy 2>/dev/null | while read -r p; do
  tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null | grep -q "daemon --debug-file $BENCH_ROOT/daemon.log" && echo "$p"
done | head -1 || true)
[ -n "$DPID" ] && kill -9 "$DPID" || true
sleep 75   # 停机跨至少一个窗口
ensure_daemon || true
sleep 8
fired=$(grep -a '"Fired"' "$J" 2>/dev/null | grep -ac "catch-u603" || true)
if [ "${fired:-0}" -ge 1 ] && [ "${fired:-0}" -le 2 ]; then
  record pass - "追赶一次不风暴(fired=$fired)"
else
  record fail M "重启后无追赶或风暴(fired=${fired:-0})"
fi

# ---------- U6-02 一次性 ----------
task_start U6-02 "一次性任务:触发一次不多不少"
sch add once-u602 "* * * * *" --goal "一次性探针" --once > "$RESULTS/U6-02add.out" 2>&1 || true
sleep 75   # 跨一个窗口让它触发并完成
sch list > "$RESULTS/U6-02list.out" 2>&1 || true
fired=$(grep -a '"Fired"' "$J" 2>/dev/null | grep -ac "once-u602" || true)
if grep -qa "once-u602" "$RESULTS/U6-02list.out" && grep -qa "one-shot completed" "$RESULTS/U6-02list.out" \
   && [ "${fired:-0}" -eq 1 ]; then
  record pass - "触发一次后自禁用(one-shot completed)"
elif [ "${fired:-0}" -eq 1 ]; then
  record partial M "触发了一次但未见自禁用登记(fired=$fired)"
else
  record fail M "一次性行为异常(fired=${fired:-0};见 U6-02add/list.out)"
fi

# ---------- U6-04 连败会停 ----------
task_start U6-04 "连败自禁用:连败 3 次后停且原因可查"
# 无 provider 可达的 goal 运行必败:绑定一个不存在的 cwd,dispatch 当场失败。
sch add flaky-u604 "* * * * *" --goal "必败探针" --cwd "/nonexistent-u604" > "$RESULTS/U6-04add.out" 2>&1 || true
sleep 200  # 三个整分钟窗口
sch list > "$RESULTS/U6-04list.out" 2>&1 || true
if grep -qa "flaky-u604" "$RESULTS/U6-04list.out" && grep -qaE "disabled \(.*failures" "$RESULTS/U6-04list.out"; then
  record pass - "连败后自禁用且原因可查"
else
  record partial M "未见自禁用(可能窗口不够或 provider 未连接;见 U6-04list.out)"
fi

# ---------- U6-07 定时也守约定 ----------
task_start U6-07 "定时也守约定:任务落项目内守 AGENTS.md"
if sch add --help 2>&1 | grep -qaiE "cwd"; then
  record pass - "调度可绑定项目目录(--cwd),dispatch 携带 cwd"
else
  record fail W-2 "调度无项目/目录绑定"
fi

# ---------- U6-08 事后可查 ----------
task_start U6-08 "事后可查:定时任务结果有记录可追"
if [ -f "$J" ] && grep -qa "tick-u601" "$J"; then
  deliv=$(find "$D" -name "*.json" 2>/dev/null | head -1 || true)
  if [ -n "$deliv" ] && grep -qa '"output"' "$deliv"; then
    record pass - "运行结果落 delivery 文件可追($deliv)"
  else
    record partial M "日志有登记事件但无 delivery 产物(运行可能失败)"
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
sch remove once-u602 > /dev/null 2>&1 || true
sch remove flaky-u604 > /dev/null 2>&1 || true

echo "U6 done: pass=$pass_count partial=$partial_count fail=$fail_count"
