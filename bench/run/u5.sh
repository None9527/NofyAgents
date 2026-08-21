#!/usr/bin/env bash
# U5 多项目与全局助手 — 10 tasks(v2)。
# 从 neutral 目录(不属于任何项目)驱动;项目无注册表,用户以路径告知——
# 这本身是现状的一部分,题目按此现实驱动。
set -u
NOFY=/home/none/grok-build/target/debug/nofy
A=$BENCH_ROOT/projects/alpha
B=$BENCH_ROOT/projects/beta
G=$BENCH_ROOT/projects/gamma
N=$BENCH_ROOT/neutral
H=$BENCH_ROOT/home
export NOFY_HOME=$H
mkdir -p "$N"

cat > "$H/config.toml" <<'EOF'
[models]
default = "bench"

[model.bench]
model = "deepseek-v4-flash-0731"
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
name = "Bench Model"
env_key = "DASHSCOPE_FLASH_KEY"
api_backend = "chat_completions"
context_window = 128000
EOF

run_g() { # $1=timeout $2=out $3..=prompt(neutral 目录起跑)
  local tmo=$1 out=$2; shift 2
  rc=0
  ( cd "$N" && timeout "$tmo" "$NOFY" -p "$*" --yolo > "$out" 2>"$out.err" ) || rc=$?
  echo $rc
}

# ---------- U5-01 点名派活 ----------
task_start U5-01 "点名派活:从任意处给 alpha 派活,产物落 alpha"
rm -f "$A/global-task.txt"
r=$(run_g 240 "$RESULTS/U5-01.out" "请在 alpha 项目(路径 $A)里创建文件 global-task.txt,内容为 U501-OK。")
if [ "$r" = 0 ] && grep -q "U501-OK" "$A/global-task.txt" 2>/dev/null; then
  record pass - "产物准确落在 alpha"
else
  record fail M "rc=$r;产物未落在 alpha"
fi

# ---------- U5-02 全局看得全 ----------
task_start U5-02 "全局看得全:列所有项目会话且归属正确"
( cd "$N" && timeout 90 "$NOFY" sessions list --all > "$RESULTS/U5-02.out" 2>&1 ) || true
if grep -qa "alpha" "$RESULTS/U5-02.out" && grep -qa "beta" "$RESULTS/U5-02.out"; then
  record pass - "两项目会话都在"
else
  record fail W-8 "sessions list 不读本地会话库(U3-06/08 同因),全局看不到项目会话"
fi

# ---------- U5-03 跨项目问答 ----------
task_start U5-03 "跨项目问答:哪个项目有 pytest"
r=$(run_g 240 "$RESULTS/U5-03.out" "我在 $BENCH_ROOT/projects 下有三个项目。哪一个是带 pytest 测试的 Python 项目?只回答项目目录名。")
if [ "$r" = 0 ] && grep -q "alpha" "$RESULTS/U5-03.out"; then
  record pass - "正确指向 alpha"
else
  record fail M "rc=$r;未指向 alpha"
fi

# ---------- U5-04 依次派两项目 ----------
task_start U5-04 "依次派两项目:产物各归其主不串"
rm -f "$A/note-a.txt" "$B/note-b.txt"
r1=$(run_g 240 "$RESULTS/U5-04a.out" "在 alpha 项目(路径 $A)创建 note-a.txt,内容 U504-A。")
r2=$(run_g 240 "$RESULTS/U5-04b.out" "在 beta 项目(路径 $B)创建 note-b.txt,内容 U504-B。")
if grep -q "U504-A" "$A/note-a.txt" 2>/dev/null && grep -q "U504-B" "$B/note-b.txt" 2>/dev/null \
   && [ ! -e "$B/note-a.txt" ] && [ ! -e "$A/note-b.txt" ]; then
  record pass - "两份产物各自落位,零串项目"
else
  record fail M "rc=$r1/$r2;产物缺失或串项目"
fi

# ---------- U5-05 知道各项目状态 ----------
task_start U5-05 "知道各项目 git 状态:与事实一致"
echo "# dirty-probe" >> "$B/scripts/backup.sh"   # 制造确定性事实:beta 脏、alpha 净
r=$(run_g 240 "$RESULTS/U5-05.out" "检查这两个项目的 git 状态:$A 和 $B。哪个项目有未提交的改动?")
if [ "$r" = 0 ] && grep -q "beta" "$RESULTS/U5-05.out" && grep -qaiE "未提交|有改动|修改|dirty|modified|changes" "$RESULTS/U5-05.out"; then
  record pass - "正确识别 beta 有未提交改动"
else
  record fail M "rc=$r;状态判断与事实不符"
fi

# ---------- U5-06 跨项目搬文件 ----------
task_start U5-06 "跨项目搬文件:落点正确且原件仍在"
rm -f "$G/docs-readme.md"
r=$(run_g 240 "$RESULTS/U5-06.out" "把 alpha 项目($A)的 README.md 复制一份到 gamma 项目($G),命名为 docs-readme.md。")
if [ "$r" = 0 ] && [ -f "$G/docs-readme.md" ] && grep -q "alpha" "$G/docs-readme.md" && [ -f "$A/README.md" ]; then
  record pass - "落点正确,原件未动(可撤销)"
else
  record fail M "rc=$r;落点错误或原件被毁"
fi

# ---------- U5-07 全局近况 ----------
task_start U5-07 "全局近况:摘要覆盖所有项目"
r=$(run_g 300 "$RESULTS/U5-07.out" "总结一下这三个项目最近的活动情况(可查看 git 历史与文件变化):alpha=$A,beta=$B,gamma=$G。每个项目一两句。")
if [ "$r" = 0 ] && grep -q "alpha" "$RESULTS/U5-07.out" && grep -q "beta" "$RESULTS/U5-07.out"; then
  record pass - "摘要覆盖 alpha 与 beta"
else
  record fail M "rc=$r;摘要未覆盖全部项目"
fi

# ---------- U5-08 派活守对方约定 ----------
task_start U5-08 "派活守约定:目标项目 AGENTS.md 被尊重"
r=$(run_g 300 "$RESULTS/U5-08.out" "给 alpha 项目($A)的 src/calc.py 增加 triple(x) 函数(返回三倍值)。改代码时请遵守该项目自己的规则。")
if [ "$r" = 0 ] && grep -q "def triple" "$A/src/calc.py" 2>/dev/null && grep -qai "pytest" "$RESULTS/U5-08.out"; then
  record pass - "函数落地且按 AGENTS.md 跑了 pytest"
elif grep -q "def triple" "$A/src/calc.py" 2>/dev/null; then
  record fail M "函数落地但未遵守项目规则(未跑 pytest)"
else
  record fail M "rc=$r;函数未落地"
fi

# ---------- U5-09 全局不毁项目 ----------
task_start U5-09 "全局不毁项目:只浏览不改动"
snap() { ( cd "$A" && git status --porcelain ); ( cd "$B" && git status --porcelain ); find "$G" -type f -not -path "*/.git/*" | sort; }
snap > "$RESULTS/U5-09.before" 2>/dev/null || true
r=$(run_g 240 "$RESULTS/U5-09.out" "浏览这三个项目($A、$B、$G),告诉我每个项目是做什么的。不要修改任何文件。")
snap > "$RESULTS/U5-09.after" 2>/dev/null || true
if [ "$r" = 0 ] && diff -q "$RESULTS/U5-09.before" "$RESULTS/U5-09.after" >/dev/null 2>&1 && grep -q "gamma" "$RESULTS/U5-09.out"; then
  record pass - "浏览后三项目零改动"
else
  record fail M "rc=$r;浏览造成了改动或未完成浏览"
fi

# ---------- U5-10 重启不健忘 ----------
task_start U5-10 "重启不健忘:daemon 重启后全局仍认识项目"
DPID=$(pgrep -x nofy 2>/dev/null | while read -r p; do
  tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null | grep -q "daemon --debug-file $BENCH_ROOT/daemon.log" && echo "$p"
done | head -1 || true)
[ -n "$DPID" ] && kill -9 "$DPID" || true
sleep 2
ensure_daemon || true
r=$(run_g 240 "$RESULTS/U5-10.out" "路径 $A 的项目是做什么的?一句话。")
if [ "$r" = 0 ] && grep -qaiE "计算|calculator|Python|pytest" "$RESULTS/U5-10.out"; then
  record pass - "重启后全局助手仍认识项目"
else
  record fail M "rc=$r;重启后答不出项目是什么"
fi

echo "U5 done: pass=$pass_count partial=$partial_count fail=$fail_count"
