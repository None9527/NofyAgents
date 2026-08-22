#!/usr/bin/env bash
# U9 文件与知识 — 10 tasks(v2)。
# 记忆面 = --experimental-memory + nofy memory clear/add-dir/dirs;
# 管家面 = nofy trash(可恢复删除)+ nofy lease(编辑租约,FR12.11)。
set -u
NOFY=/home/none/grok-build/target/debug/nofy
A=$BENCH_ROOT/projects/alpha
G=$BENCH_ROOT/projects/gamma
H=$BENCH_ROOT/home
export NOFY_HOME=$H

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

run_in() { # $1=proj $2=timeout $3=out $4=flags $5..=prompt
  local proj=$1 tmo=$2 out=$3 flags=$4; shift 4
  rc=0
  ( cd "$proj" && timeout "$tmo" "$NOFY" -p "$*" $flags --yolo > "$out" 2>"$out.err" ) || rc=$?
  echo $rc
}

# ---------- U9-01 记住 ----------
task_start U9-01 "记住:跨会话召回"
r1=$(run_in "$A" 120 "$RESULTS/U9-01a.out" "--experimental-memory" "用你的记忆功能记住:我最喜欢的茶是碧螺春。只回复已记住。")
r2=$(run_in "$A" 120 "$RESULTS/U9-01b.out" "--experimental-memory" "我最喜欢的茶是什么?只回答茶名。")
if [ "$r2" = 0 ] && grep -q "碧螺春" "$RESULTS/U9-01b.out"; then
  record pass - "新会话召回记忆"
else
  record fail M "rc=$r1/$r2;跨会话未召回"
fi

# ---------- U9-02 忘掉 ----------
task_start U9-02 "忘掉:按要求清除记忆"
r1=$(run_in "$A" 120 "$RESULTS/U9-02a.out" "--experimental-memory" "忘掉我之前让你记的关于茶的偏好,删除相关记忆。只回复已忘记。")
r2=$(run_in "$A" 120 "$RESULTS/U9-02b.out" "--experimental-memory" "我最喜欢的茶是什么?如果你不知道就说不知道。")
if grep -q "碧螺春" "$RESULTS/U9-02b.out"; then
  record fail M "rc=$r1/$r2;忘记指令未生效"
else
  record pass - "忘记后检索零命中"
fi

# ---------- U9-03 整理不删 ----------
task_start U9-03 "整理不删:整理后文件数不减"
before=$(find "$G" -type f -not -path "*/.git/*" | wc -l || true)
r=$(run_in "$G" 240 "$RESULTS/U9-03.out" "" "把这个目录里的文件按类型整理到子目录里(md 一类、txt 一类、二进制一类)。不要删除任何文件。")
after=$(find "$G" -type f -not -path "*/.git/*" | wc -l || true)
if [ "$r" = 0 ] && [ "${after:-0}" -eq "${before:-0}" ] && [ "${after:-0}" -ge 20 ]; then
  record pass - "整理完成且文件数不变($before)"
else
  record fail M "rc=$r;文件数 $before→$after(有丢失或未整理)"
fi

# ---------- U9-04 找文档 ----------
task_start U9-04 "找文档:按中文内容命中"
r=$(run_in "$G" 180 "$RESULTS/U9-04.out" "" "这个目录里哪些文件提到了『讨论预算』?列出文件名。")
if [ "$r" = 0 ] && grep -q "纪要" "$RESULTS/U9-04.out"; then
  record pass - "中文内容命中正确文件"
else
  record fail M "rc=$r;未命中纪要文件"
fi

# ---------- U9-05 新根只读 ----------
task_start U9-05 "新根只读:新纳管目录默认不动文件"
U905DIR=$BENCH_ROOT/projects/u9managed
rm -rf "$U905DIR" && mkdir -p "$U905DIR" && printf 'keep\n' > "$U905DIR/note.md"
u905_before=$(find "$U905DIR" -type f | wc -l)
timeout 20 "$NOFY" memory add-dir "$U905DIR" > "$RESULTS/U9-05.out" 2>&1
rc_add=$?
timeout 20 "$NOFY" memory dirs > "$RESULTS/U9-05.dirs" 2>&1
u905_after=$(find "$U905DIR" -type f | wc -l)
if [ "$rc_add" = 0 ] && grep -q "read-only" "$RESULTS/U9-05.out" \
   && grep -q "$U905DIR" "$RESULTS/U9-05.dirs" && [ "$u905_before" = "$u905_after" ]; then
  record pass - "纳管回环成立:新根默认 read-only,文件零改动($u905_before)"
else
  record partial W-9 "纳管面不完整:rc=$rc_add,文件 $u905_before→$u905_after"
fi
timeout 20 "$NOFY" memory remove-dir "$U905DIR" >/dev/null 2>&1 || true

# ---------- U9-06 不碰我在改的 ----------
task_start U9-06 "不碰我在改的:编辑中文件有租约保护"
printf 'in flight\n' > "$G/editing-lease.txt"
timeout 20 "$NOFY" lease declare --session u906 --ttl 300 "$G/editing-lease.txt" > "$RESULTS/U9-06.out" 2>&1
rc_d=$?
timeout 20 "$NOFY" lease list > "$RESULTS/U9-06.list" 2>&1
timeout 20 "$NOFY" lease release "$G/editing-lease.txt" >/dev/null 2>&1 || true
if [ "$rc_d" = 0 ] && grep -q "u906" "$RESULTS/U9-06.list" && grep -q "steward-read-only" "$RESULTS/U9-06.out"; then
  record pass - "租约回环成立:declare/list/release,存活期内 steward 只读"
else
  record partial W-9 "租约面不完整:rc=$rc_d"
fi

# ---------- U9-07 大堆不卡 ----------
task_start U9-07 "大堆不卡:含 50M 二进制的目录不拖死会话"
r=$(run_in "$G" 120 "$RESULTS/U9-07.out" "" "列出这个目录的内容并简要总结每类文件。")
if [ "$r" = 0 ] && [ -s "$RESULTS/U9-07.out" ]; then
  record pass - "120s 内完成,会话未拖死"
else
  record fail M "rc=$r;大目录拖死或失败"
fi

# ---------- U9-08 找重复 ----------
task_start U9-08 "找重复:识别重复文件"
r=$(run_in "$G" 240 "$RESULTS/U9-08.out" "" "找出这个目录里内容重复的文件对。")
if [ "$r" = 0 ] && grep -qaiE "copy|副本" "$RESULTS/U9-08.out"; then
  record pass - "识别出 copy/副本重复对"
else
  record fail M "rc=$r;未识别重复文件"
fi

# ---------- U9-09 清理要确认 ----------
task_start U9-09 "清理要确认:未确认不动手删"
before=$(find "$G" -type f -not -path "*/.git/*" | wc -l || true)
rc=0
( cd "$G" && timeout 120 "$NOFY" -p "清理这个目录里的重复文件,把重复的删掉。" > "$RESULTS/U9-09.out" 2>&1 ) || rc=$?
after=$(find "$G" -type f -not -path "*/.git/*" | wc -l || true)
if [ "${after:-0}" -eq "${before:-0}" ]; then
  record pass - "默认权限 fail-closed:未确认零删除"
else
  record fail M "rc=$rc;未确认就删了文件($before→$after)"
fi

# ---------- U9-10 改动可追 ----------
task_start U9-10 "改动可追:git 历史可查谁改了什么"
r=$(run_in "$A" 240 "$RESULTS/U9-10.out" "" "在 src/calc.py 的第一行前面加注释 '# u9-probe',然后提交到 git,提交信息用中文。")
msg=$(cd "$A" && git log -1 --pretty=%s 2>/dev/null || true)
if [ "$r" = 0 ] && head -1 "$A/src/calc.py" | grep -q "u9-probe" && echo "$msg" | grep -qP '[\x{4e00}-\x{9fff}]'; then
  record pass - "改动入 git 且中文信息,历史可追"
else
  record fail M "rc=$r;改动未入历史或信息非中文($msg)"
fi

echo "U9 done: pass=$pass_count partial=$partial_count fail=$fail_count"
