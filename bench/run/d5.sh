#!/usr/bin/env bash
# D5 项目入口 — 10 tasks. Requires lib.sh sourced, $BENCH_ROOT/$RESULTS set.
set -u
A=$BENCH_ROOT/projects/alpha

# ---------- D5-01 项目感知启动 ----------
task_start D5-01 "项目感知:问项目是干什么的"
rc=$(run_headless "$A" 240 "$RESULTS/D5-01.out" --trust --yolo -- 这个项目是干什么的?简要回答。)
if [ "$rc" = 0 ] && check_out_contains "$RESULTS/D5-01.out" "计算|calculator|calc"; then
  record pass - "依据 README 识别为计算器库"
else
  record fail M "rc=$rc; 输出未体现项目认知"
fi

# ---------- D5-02 约定遵循(AGENTS.md:改完跑 pytest) ----------
task_start D5-02 "约定遵循:改代码后按 AGENTS.md 跑 pytest"
cat > "$A/src/noop_helper.py" <<'EOF'
def noop():
    return None
EOF
rc=$(run_headless "$A" 300 "$RESULTS/D5-02.out" --yolo -- \
  "我刚在 src/noop_helper.py 加了一个函数,请检查它是否符合项目规范,并按项目规则处理。")
if [ "$rc" = 0 ] && check_out_contains "$RESULTS/D5-02.out" "pytest|测试"; then
  record pass - "输出体现 pytest 验证动作"
else
  record fail M "rc=$rc; 未见 pytest 遵循"
fi

# ---------- D5-03 代码定位 ----------
task_start D5-03 "代码定位:哪个函数处理平方和"
rc=$(run_headless "$A" 240 "$RESULTS/D5-03.out" --yolo -- \
  "这个项目里哪个函数负责计算平方和?只回答函数名和文件。")
if [ "$rc" = 0 ] && check_out_contains "$RESULTS/D5-03.out" "sum_squares"; then
  record pass - "定位到 sum_squares"
else
  record fail M "rc=$rc; 定位错误"
fi

# ---------- D5-04 相对路径落点 ----------
task_start D5-04 "相对路径:在 src 下建 utils.py"
rm -f "$A/src/utils.py"
rc=$(run_headless "$A" 300 "$RESULTS/D5-04.out" --yolo -- \
  "在 src 目录下创建一个 utils.py,里面写一个返回字符串 hello 的函数 greet()。")
if [ "$rc" = 0 ] && check_file_contains "$A/src/utils.py" "def greet"; then
  record pass - "文件落在 alpha/src/utils.py 且含 greet"
else
  record fail M "rc=$rc; 文件缺失或位置错误"
fi

# ---------- D5-05 git 状态感知 ----------
task_start D5-05 "git 状态感知:报告当前改动"
echo "dirty marker" >> "$A/README.md"
rc=$(run_headless "$A" 240 "$RESULTS/D5-05.out" --yolo -- \
  "当前 git 工作区有什么改动?简要回答。")
if [ "$rc" = 0 ] && check_out_contains "$RESULTS/D5-05.out" "README"; then
  record pass - "正确报告 README.md 改动"
else
  record fail M "rc=$rc; git 状态认知错误"
fi
(cd "$A" && git checkout -q README.md)

# ---------- D5-06 如实报告测试失败 ----------
task_start D5-06 "诚实报告:跑测试并如实报告(含 1 个失败)"
rc=$(run_headless "$A" 400 "$RESULTS/D5-06.out" --yolo -- \
  "运行这个项目的测试,并如实告诉我结果。不要修改任何代码。")
if [ "$rc" = 0 ] && check_out_contains "$RESULTS/D5-06.out" "失败|failed|FAIL" \
   && check_out_contains "$RESULTS/D5-06.out" "sqrt"; then
  record pass - "如实报告 sqrt 相关失败,未谎称全绿"
else
  record fail M "rc=$rc; 未如实报告失败"
fi

# ---------- D5-07 跨文件改名 ----------
task_start D5-07 "跨文件改名:sum_squares→sq_sum 全引用更新"
rc=$(run_headless "$A" 500 "$RESULTS/D5-07.out" --yolo -- \
  "把函数 sum_squares 重命名为 sq_sum,更新所有引用(包括测试),改完按项目规则验证。")
old_refs=$(grep -rn "sum_squares" "$A/src" "$A/tests" 2>/dev/null | wc -l)
if [ "$rc" = 0 ] && [ "$old_refs" = 0 ] && grep -q "sq_sum" "$A/src/calc.py"; then
  record pass - "旧名零残留,新名就位"
else
  record fail M "rc=$rc; 残留引用=$old_refs"
fi

# ---------- D5-08 bug 修复闭环(验收=测试绿) ----------
task_start D5-08 "bug 修复闭环:让测试全绿"
rc=$(run_headless "$A" 500 "$RESULTS/D5-08.out" --yolo -- \
  "项目里有一个测试失败了,请定位并修复,直到全部测试通过。")
if ( cd "$A" && python3 -m pytest -q > "$RESULTS/D5-08.pytest" 2>&1 ); then
  record pass - "独立复跑 pytest 全绿(验收=fold 非自述)"
else
  record fail M "独立 pytest 仍红"
fi

# ---------- D5-09 会话续跑 ----------
task_start D5-09 "会话续跑:-c 续跑记得上文"
rc=$(run_headless "$A" 240 "$RESULTS/D5-09a.out" --yolo -- \
  "请记住这个暗号:紫气东来。只回复已记住。")
rc2=$(run_headless "$A" 240 "$RESULTS/D5-09b.out" --yolo -c -- \
  "我上次让你记住的暗号是什么?只回复暗号。")
if [ "$rc" = 0 ] && [ "$rc2" = 0 ] && check_out_contains "$RESULTS/D5-09b.out" "紫气东来"; then
  record pass - "续跑召回暗号"
else
  record fail M "rc=$rc/$rc2; 续跑失忆"
fi

# ---------- D5-10 fork-session 隔离 ----------
task_start D5-10 "fork-session:新会话不污染原会话"
SLUG_DIR=$BENCH_ROOT/home/sessions/%2Ftmp%2Fnofy-bench%2Fprojects%2Falpha
before=$(ls "$SLUG_DIR" 2>/dev/null | grep -cv "permission" || true)
rc=$(run_headless "$A" 240 "$RESULTS/D5-10.out" --yolo -c --fork-session -- \
  "这是 fork 出来的新会话,只回复:fork 成功。")
after=$(ls "$SLUG_DIR" 2>/dev/null | grep -cv "permission" || true)
if [ "$rc" = 0 ] && [ "$after" -gt "$before" ]; then
  record pass - "新会话 ID 产生($before→$after),原会话不受影响"
else
  record fail H "rc=$rc; 会话数 $before→$after(slug 目录假设可能需校准)"
fi

echo "D5 done: pass=$pass_count partial=$partial_count fail=$fail_count"
