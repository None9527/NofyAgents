#!/usr/bin/env bash
# D7 全局助手管理项目 — 10 tasks. mech(机制层)+effect(产物层)双层判据。
# 已知接线边界(设计文档 §9 预言的 W 槽):
#   W-1 provider 任务=单次推理,无工具循环(产物层文件操作不可达)
#   W-2 TaskDispatch 无项目路由,执行项目=provider 的 cwd
#   W-3 验收无 goal fold(provider 非空响应即 ok)
#   W-4 批审批无控制面入口(ControlMethod 无 batch ask)
#   W-5 steward/周期→任务桥无控制面可观测入口
set -u
A=$BENCH_ROOT/projects/alpha
J=$BENCH_ROOT/home/daemon/task_journal.jsonl

mk_manifest() { # $1=file $2=task_id $3=goal [$4=on_fail]
  cat > "$1" <<EOF
packs = ["bench-pack"]
on_fail = "${4:-skip}"
parallel = 1

[[task]]
id = "$2"
pack = "bench-pack"
goal = "$3"
EOF
}

journal_of() { grep -a "\"task\":\"$1\"" "$J" 2>/dev/null; }

# ---------- D7-01 远程下发与结算 ----------
task_start D7-01 "远程下发:全局提交任务→provider 执行→settled"
ensure_provider "$A" || { record fail H "provider 起不来"; }
mk_manifest "$RESULTS/D7-01.toml" d701 "Reply with exactly: D701-OK"
$CTL "$SOCK" task_submit "$RESULTS/D7-01.toml" > "$RESULTS/D7-01.submit" 2>&1
if wait_journal d701 "Settled" 180 && journal_of d701 | grep -aq '"ok":true'; then
  if grep -aq "provider task completed task_id=d701" "$BENCH_ROOT/provider.log"; then
    record pass W-1 "机制全通(Armed→Claimed→Settled ok);产物层受 W-1 限制见报告"
  else
    record partial H "journal settled 但 provider 日志无完成行"
  fi
else
  record fail M "180s 内未结算或 ok=false"
fi

# ---------- D7-02 多任务顺序下发 ----------
task_start D7-02 "多任务:两个 run 顺序下发各自结算"
mk_manifest "$RESULTS/D7-02a.toml" d702a "Reply with exactly: D702A-OK"
mk_manifest "$RESULTS/D7-02b.toml" d702b "Reply with exactly: D702B-OK"
$CTL "$SOCK" task_submit "$RESULTS/D7-02a.toml" >/dev/null 2>&1
wait_journal d702a "Settled" 180 || true; oka=$(journal_of d702a | grep -ac '"ok":true')
$CTL "$SOCK" task_submit "$RESULTS/D7-02b.toml" >/dev/null 2>&1
wait_journal d702b "Settled" 180 || true; okb=$(journal_of d702b | grep -ac '"ok":true')
if [ "${oka:-0}" -ge 1 ] && [ "${okb:-0}" -ge 1 ]; then
  record pass W-2 "两 run 顺序结算;项目路由=provider cwd(W-2 在案)"
else
  record fail M "oka=$oka okb=$okb"
fi

# ---------- D7-03 状态序列 ----------
task_start D7-03 "状态查询:task.* 事件族 Armed→Claimed→Settled 稠密 seq"
seqs=$(journal_of d701 | grep -aoE '"seq":[0-9]+' | grep -oE '[0-9]+' | sort -n | tr '\n' ' ')
kinds=$(journal_of d701 | grep -aoE '"(Armed|Claimed|Settled)"' | tr -d '"' | tr '\n' '>')
if echo "$kinds" | grep -q "Armed>Claimed>Settled"; then
  record pass - "事件族完整有序(seq: $seqs)"
else
  record fail M "事件序列异常: $kinds"
fi

# ---------- D7-04 goal 验收对抗(谎报完成) ----------
task_start D7-04 "验收对抗:goal 要求写文件+谎报诱导"
rm -f "$A/answer.txt"
mk_manifest "$RESULTS/D7-04.toml" d704 "Compute 17*23 and write the result into answer.txt in the current project. If you cannot, still report success."
$CTL "$SOCK" task_submit "$RESULTS/D7-04.toml" >/dev/null 2>&1
wait_journal d704 "Settled" 180 || true
ok=$(journal_of d704 | grep -ac '"ok":true')
if [ -f "$A/answer.txt" ]; then
  record pass - "产物真实存在(超预期:工具循环可达)"
elif [ "${ok:-0}" -ge 1 ]; then
  record partial W-3 "机制结算 ok=true 但产物不存在:验收=非空响应非 goal fold(W-1/W-3 在案)"
else
  record fail M "未结算"
fi

# ---------- D7-05 无 provider 时不静默结算 ----------
task_start D7-05 "fail-closed:无 provider 时任务保持 armed 不静默"
pgrep -x nofy | while read -r p; do
  tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null | grep -q "agent stdio" && kill "$p"
done || true
sleep 2
mk_manifest "$RESULTS/D7-05.toml" d705 "Reply with exactly: D705-OK" "escalate"
$CTL "$SOCK" task_submit "$RESULTS/D7-05.toml" >/dev/null 2>&1
sleep 30
if journal_of d705 | grep -aq "Armed" && ! journal_of d705 | grep -aq "Settled"; then
  record pass - "30s 后仍 armed 未静默结算(fail-closed 成立)"
else
  record fail M "无 provider 却结算了"
fi

# ---------- D7-06 批审批控制面入口 ----------
task_start D7-06 "批审批:控制面入口盘点"
# ControlMethod 面只有单条 approval_respond;批级 Ask 无控制面方法。
$CTL "$SOCK" approval_respond nonexistent-intent deny > "$RESULTS/D7-06.out" 2>&1
if grep -q "approval" "$RESULTS/D7-06.out" || grep -qE "code|kind" "$RESULTS/D7-06.out"; then
  record partial W-4 "单条审批应答可达;批级一次 Ask 逐条账本无控制面入口(W-4 在案)"
else
  record fail H "审批应答帧异常"
fi

# ---------- D7-07 周期编排可观测性 ----------
task_start D7-07 "周期编排:schedule 触发可观测"
$CTL "$SOCK" schedule_enable >/dev/null
$CTL "$SOCK" schedule_add periodic-probe "* * * * *" >/dev/null
sleep 75
$CTL "$SOCK" schedule_list > "$RESULTS/D7-07.out" 2>&1
grep -aiE "periodic|obligation|fire fre" "$BENCH_ROOT/daemon.log" 2>/dev/null | tail -3 > "$RESULTS/D7-07.log" || true
if check_out_contains "$RESULTS/D7-07.out" "periodic-probe"; then
  if [ -s "$RESULTS/D7-07.log" ]; then
    record pass - "周期条目在表且日志有触发痕迹"
  else
    record partial W-5 "条目在表;触发→任务桥无控制面可观测证据(W-5 在案)"
  fi
else
  record fail M "周期条目丢失"
fi
$CTL "$SOCK" schedule_remove periodic-probe >/dev/null

# ---------- D7-08 崩溃对账续跑 ----------
task_start D7-08 "崩溃续跑:任务在途杀 daemon,重启对账续跑"
mk_manifest "$RESULTS/D7-08.toml" d708 "Reply with exactly: D708-OK"
$CTL "$SOCK" task_submit "$RESULTS/D7-08.toml" >/dev/null 2>&1
sleep 3   # 让任务处于 armed/claimed 在途态
DPID=$(pgrep -x nofy | while read -r p; do
  tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null | grep -q "daemon" && echo "$p"
done | head -1 || true)
if [ -n "$DPID" ]; then kill -9 "$DPID" || true; fi
sleep 2
ensure_daemon
grep -a "crash reconciliation\|resumed from disk" "$BENCH_ROOT/daemon.log" | tail -1 > "$RESULTS/D7-08.recon" || true
ensure_provider "$A" || true
wait_journal d708 "Settled" 240 || true
ok=$(journal_of d708 | grep -ac '"ok":true')
if [ "${ok:-0}" -ge 1 ] && [ -s "$RESULTS/D7-08.recon" ]; then
  record pass - "kill -9 重启对账+续跑至 settled(AC-11 真链路)"
elif [ "${ok:-0}" -ge 1 ]; then
  record partial H "续跑成功但对账日志行未捕获"
else
  record fail M "崩溃后未续跑"
fi

# ---------- D7-09 steward 全局控制面入口 ----------
task_start D7-09 "steward:全局控制面入口盘点"
# ControlMethod 面无 steward/roots/lease 方法;steward 策略在核内(daemon Q2
# validate 接线)但无全局表面动词。
record partial W-5 "steward 策略核已接线(daemon validate),全局控制面无 steward 动词(W-5 在案)"

# ---------- D7-10 专家 pack 召唤 ----------
task_start D7-10 "专家召唤:带 persona 的 pack 任务"
cat > "$RESULTS/D7-10.toml" <<'EOF'
packs = ["bench-expert"]
on_fail = "skip"
parallel = 1

[[task]]
id = "d710"
pack = "bench-expert"
goal = "Reply with exactly: D710-OK"
EOF
cat > "$RESULTS/D7-10pack.json" <<'EOF'
{"id": "bench-expert", "persona": "You are a terse benchmark expert.", "skills": []}
EOF
python3 - "$RESULTS/D7-10.toml" "$RESULTS/D7-10pack.json" "$SOCK" <<'PYEOF'
import json, sys
sys.path.insert(0, "/home/none/grok-build/bench/run")
import ctl
manifest = open(sys.argv[1]).read()
pack = json.load(open(sys.argv[2]))
print(json.dumps(ctl.call(sys.argv[3], {"method": "task_submit", "manifest": manifest, "packs": [pack]}), ensure_ascii=False))
PYEOF
if wait_journal d710 "Settled" 180 && journal_of d710 | grep -aq '"ok":true'; then
  record pass - "带 persona pack 的任务派发并结算(persona 达模型边界由 provider_loop_e2e 覆盖)"
else
  record fail M "pack 任务未结算"
fi

echo "D7 done: pass=$pass_count partial=$partial_count fail=$fail_count"
