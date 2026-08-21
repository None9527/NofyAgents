#!/usr/bin/env bash
# U3 对话与记忆延续 — 10 tasks,用户面驱动(v2)。
# 多轮 = 用户真实做法:-c 续跑;恢复 = --resume <id>;检索 = nofy sessions。
set -u
NOFY=/home/none/grok-build/target/debug/nofy
A=$BENCH_ROOT/projects/alpha
B=$BENCH_ROOT/projects/beta
H=$BENCH_ROOT/home
export NOFY_HOME=$H

run_in() { # $1=proj $2=timeout $3=out $4=extra_flags $5..=prompt
  local proj=$1 tmo=$2 out=$3 flags=$4; shift 4
  rc=0
  ( cd "$proj" && timeout "$tmo" "$NOFY" -p "$*" $flags --yolo > "$out" 2>"$out.err" ) || rc=$?
  echo $rc
}

# ---------- U3-01 三轮追加约束 ----------
task_start U3-01 "连续三轮加约束,最终产物全满足"
run_in "$A" 180 "$RESULTS/U3-01a.out" "" "记住约束A:接下来我让你写的句子必须包含「灯」字。只回复收到。" >/dev/null
run_in "$A" 180 "$RESULTS/U3-01b.out" "-c" "追加约束B:句子还必须包含「夜」字。只回复收到。" >/dev/null
run_in "$A" 180 "$RESULTS/U3-01c.out" "-c" "追加约束C:句子必须以「明」结尾。只回复收到。" >/dev/null
r=$(run_in "$A" 240 "$RESULTS/U3-01d.out" "-c" "现在按我之前给的全部约束写一个句子,只输出这个句子。")
if [ "$r" = 0 ] && grep -q "灯" "$RESULTS/U3-01d.out" && grep -q "明" "$RESULTS/U3-01d.out"; then
  record pass - "三轮约束均满足(灯+明在句)"
else
  record fail M "rc=$r;约束丢失(见 U3-01d.out)"
fi

# ---------- U3-02 长对话记得住 ----------
task_start U3-02 "多轮后召回早期细节"
run_in "$A" 120 "$RESULTS/U3-02a.out" "-c" "只回复:甲" >/dev/null
run_in "$A" 120 "$RESULTS/U3-02b.out" "-c" "只回复:乙" >/dev/null
run_in "$A" 120 "$RESULTS/U3-02c.out" "-c" "只回复:丙" >/dev/null
run_in "$A" 120 "$RESULTS/U3-02d.out" "-c" "只回复:丁" >/dev/null
r=$(run_in "$A" 180 "$RESULTS/U3-02e.out" "-c" "回顾我们的对话,我让你回复过甲乙丙丁,按顺序说出这些字。")
if [ "$r" = 0 ] && grep -q "甲" "$RESULTS/U3-02e.out" && grep -q "丁" "$RESULTS/U3-02e.out"; then
  record pass - "多轮后召回早期内容"
else
  record fail M "rc=$r;早期内容失忆"
fi

# ---------- U3-10 长会话不丢约束(插入干扰轮) ----------
task_start U3-10 "干扰轮后早期约束仍生效"
run_in "$A" 180 "$RESULTS/U3-10a.out" "-c" "记住规则R:接下来无论我问什么,回答末尾都加上「遵R」。只回复收到。" >/dev/null
run_in "$A" 120 "$RESULTS/U3-10b.out" "-c" "只回复:扰一" >/dev/null
run_in "$A" 120 "$RESULTS/U3-10c.out" "-c" "只回复:扰二" >/dev/null
r=$(run_in "$A" 180 "$RESULTS/U3-10d.out" "-c" "1加1等于几?")
if [ "$r" = 0 ] && grep -q "遵R" "$RESULTS/U3-10d.out"; then
  record pass - "干扰轮后约束仍被遵守"
else
  record fail M "rc=$r;约束在干扰后丢失"
fi

# ---------- U3-03 退出→续跑(beta 新会话线) ----------
task_start U3-03 "续跑:-c 记得暗号"
run_in "$B" 180 "$RESULTS/U3-03a.out" "--trust" "请记住暗号:青瓷茶盏。只回复已记住。" >/dev/null
r=$(run_in "$B" 180 "$RESULTS/U3-03b.out" "-c" "我让你记住的暗号是什么?只回复暗号。")
if [ "$r" = 0 ] && grep -q "青瓷茶盏" "$RESULTS/U3-03b.out"; then
  record pass - "续跑召回暗号"
else
  record fail M "rc=$r;续跑失忆"
fi

# ---------- U3-04 按 ID 恢复 ----------
task_start U3-04 "按会话 ID 恢复续答"
SLUG=$H/sessions/%2Ftmp%2Fnofy-bench%2Fprojects%2Fbeta
SID=$(ls -t "$SLUG" 2>/dev/null | grep -v permission | head -1 || true)
if [ -n "$SID" ]; then
  r=0
  ( cd "$B" && timeout 180 "$NOFY" --resume "$SID" -p "这个会话里记住的暗号是什么?只回复暗号。" --yolo \
      > "$RESULTS/U3-04.out" 2>&1 ) || r=$?
  if [ "$r" = 0 ] && grep -q "青瓷茶盏" "$RESULTS/U3-04.out"; then
    record pass - "按 ID 恢复并召回"
  else
    record fail M "rc=$r;ID 恢复后未召回"
  fi
else
  record fail H "未找到 beta 会话 ID"
fi

# ---------- U3-05 fork 不污染原会话 ----------
task_start U3-05 "fork 会话:新 ID 不污染原会话"
before=$(ls "$SLUG" 2>/dev/null | grep -cv permission || true)
r=$(run_in "$B" 180 "$RESULTS/U3-05.out" "-c --fork-session" "这是 fork 的会话,只回复:fork 成功。")
after=$(ls "$SLUG" 2>/dev/null | grep -cv permission || true)
if [ "$r" = 0 ] && [ "$after" -gt "$before" ]; then
  record pass - "fork 产生新会话($before→$after)"
else
  record fail H "rc=$r;会话数 $before→$after"
fi

# ---------- U3-06 中文找历史 ----------
task_start U3-06 "全局中文检索命中播种会话"
timeout 90 "$NOFY" sessions search "青瓷茶盏" > "$RESULTS/U3-06.out" 2>&1 || true
if grep -qaE "beta|青瓷" "$RESULTS/U3-06.out" && ! grep -qa "Total: 0" "$RESULTS/U3-06.out"; then
  record pass - "中文检索命中"
else
  record fail M "检索未命中(见 U3-06.out)"
fi

# ---------- U3-07 负例零命中 ----------
task_start U3-07 "负例检索零命中"
timeout 90 "$NOFY" sessions search "不存在词zzzxyz" > "$RESULTS/U3-07.out" 2>&1 || true
if grep -qa "Total: 0" "$RESULTS/U3-07.out" || ! grep -qaE "alpha|beta" "$RESULTS/U3-07.out"; then
  record pass - "负例零命中"
else
  record fail M "负例出现命中"
fi

# ---------- U3-08 知道在哪干过活 ----------
task_start U3-08 "会话列表含项目归属"
timeout 90 "$NOFY" sessions list > "$RESULTS/U3-08.out" 2>&1 || true
if grep -qa "alpha" "$RESULTS/U3-08.out" && grep -qa "beta" "$RESULTS/U3-08.out"; then
  record pass - "列表覆盖两项目会话"
else
  record fail M "列表缺项目归属"
fi

# ---------- U3-09 项目间不串 ----------
task_start U3-09 "beta 会话归属 beta 不串 alpha"
# beta 的暗号会话不应出现在 alpha 目录
if [ -d "$SLUG" ] && ! ls "$H/sessions/%2Ftmp%2Fnofy-bench%2Fprojects%2Falpha" 2>/dev/null | grep -q "$(ls -t "$SLUG" | grep -v permission | head -1)"; then
  record pass - "会话按项目隔离存放"
else
  record fail W "会话目录出现跨项目混放"
fi

echo "U3 done: pass=$pass_count partial=$partial_count fail=$fail_count"
