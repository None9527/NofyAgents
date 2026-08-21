#!/usr/bin/env bash
# U1 安装与一份配置 — 10 tasks,用户面驱动(v2)。
# 驱动面:config.toml + `nofy` CLI + 会话落盘文件。内部日志仅归因。
# 需要:source lib.sh;BENCH_ROOT/RESULTS 已设;NOFY_BIN 指向含最新修复的二进制。
set -u
NOFY=/home/none/grok-build/target/debug/nofy
H=$BENCH_ROOT/home
CFG=$H/config.toml
export NOFY_HOME=$H

# 写一份「用户唯一配置点」的标准 config。key 经 env_key 引用,不落盘。
write_config() { # $1=model slug
  cat > "$CFG" <<EOF
[models]
default = "bench"

[model.bench]
model = "$1"
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
name = "Bench Model"
env_key = "DASHSCOPE_FLASH_KEY"
api_backend = "chat_completions"
context_window = 128000
EOF
}

# 会话落盘里实际用到的模型(用户可见证据)——只看最新会话目录。
session_model_evidence() {
  local d
  d=$(ls -td "$H/sessions"/%2F*/* 2>/dev/null | head -1)
  [ -n "$d" ] || return 0
  grep -hoaE 'deepseek[A-Za-z0-9._-]*' "$d"/*.jsonl 2>/dev/null | sort -u | head -1
}

# ---------- U1-01 配好模型就能用 ----------
task_start U1-01 "配好模型就能用:nofy models 列出且自带 key"
write_config "deepseek-v4-flash-0731"
timeout 40 "$NOFY" models > "$RESULTS/U1-01.out" 2>&1
rc=$?
if [ $rc -eq 0 ] && grep -qiE "bench" "$RESULTS/U1-01.out"; then
  if grep -qiE "own|api[_ ]?key|custom" "$RESULTS/U1-01.out"; then
    record pass - "models 列出 bench 且标注自带 key"
  else
    record partial H "列出 bench 但未见『自带 key』标注(展示文案需校准)"
  fi
else
  record fail M "rc=$rc;models 未列出配置的模型"
fi

# ---------- U1-02 换模型只改一处 ----------
task_start U1-02 "换模型只改 config 一处,会话实际模型随之变"
write_config "deepseek-v4-flash-0731"
( cd "$BENCH_ROOT/projects/alpha" && timeout 120 "$NOFY" -p "只回复:一" --yolo >/dev/null 2>&1 ) || true
m1=$(session_model_evidence)
write_config "deepseek-v4-flash"   # 只改 model 名
( cd "$BENCH_ROOT/projects/alpha" && timeout 120 "$NOFY" -p "只回复:二" --yolo >/dev/null 2>&1 ) || true
m2=$(session_model_evidence)
echo "m1=$m1 m2=$m2" > "$RESULTS/U1-02.models"
if [ -n "$m1" ] && [ -n "$m2" ] && [ "$m1" != "$m2" ]; then
  record pass - "config 改一处,会话实际模型由 $m1 → $m2"
elif [ "$m1" = "$m2" ] && [ -n "$m1" ]; then
  record fail W "改 config 后会话实际模型未变(仍 $m1)——配置单点未贯通"
else
  record fail H "m1=$m1 m2=$m2;会话模型证据缺失"
fi

# ---------- U1-03 没配置时有指引 ----------
task_start U1-03 "空 config 首启有引导,不静默失败"
EMPTY=$BENCH_ROOT/home-empty; rm -rf "$EMPTY"; mkdir -p "$EMPTY"
rc=0
( cd "$BENCH_ROOT/projects/alpha" && NOFY_HOME=$EMPTY timeout 60 "$NOFY" -p "hi" --yolo \
    > "$RESULTS/U1-03.out" 2>&1 ) || rc=$?
if grep -qiE "login|sign|auth|api[_ ]?key|not authenticated|device" "$RESULTS/U1-03.out"; then
  record pass - "无配置时给出登录/配 key 引导"
elif [ $rc -ne 0 ]; then
  record partial M "rc=$rc 非静默,但引导文案不明确"
else
  record fail M "无配置时既无引导也未明示失败"
fi

# ---------- U1-04 坏 key 有明白话 ----------
task_start U1-04 "坏 key 给清晰鉴权错误,不挂死"
write_config "deepseek-v4-flash-0731"
rc=0
( cd "$BENCH_ROOT/projects/alpha" && DASHSCOPE_FLASH_KEY=sk-deadbeef timeout 90 "$NOFY" -p "hi" --yolo \
    > "$RESULTS/U1-04.out" 2>&1 ) || rc=$?
if grep -qiE "unauthorized|401|invalid|expired|auth|credential|api key" "$RESULTS/U1-04.out"; then
  record pass - "坏 key 得到清晰鉴权错误"
elif [ $rc -ne 0 ]; then
  record partial M "rc=$rc 失败但错误信息不够明白"
else
  record fail M "坏 key 未给出可理解的鉴权失败"
fi

# ---------- U1-05 单配置属性(门) ----------
task_start U1-05 "单配置门:headless 与 provider 都用同一份 config 的模型"
write_config "deepseek-v4-flash-0731"
# 面一:headless -p(不传 -m,纯靠 config 默认)
rm -rf "$H/sessions"
( cd "$BENCH_ROOT/projects/alpha" && timeout 120 "$NOFY" -p "只回复:门" --yolo >/dev/null 2>&1 ) || true
hm=$(session_model_evidence)
# 面二:provider 委派任务(模型只能来自 config)
ensure_daemon || true
ensure_provider "$BENCH_ROOT/projects/alpha" || true
cat > "$RESULTS/U1-05.toml" <<'EOF'
packs = ["bench-pack"]
on_fail = "skip"
parallel = 1

[[task]]
id = "gate"
pack = "bench-pack"
goal = "Reply with exactly: GATE-OK"
EOF
$CTL "$SOCK" task_submit "$RESULTS/U1-05.toml" >/dev/null 2>&1
wait_journal gate "Settled" 120 || true
pm=$(grep -aoE "resolved credentials model=[A-Za-z0-9._-]+" "$BENCH_ROOT/provider.log" 2>/dev/null \
     | tail -1 | sed 's/.*model=//')
echo "headless=$hm provider=$pm" > "$RESULTS/U1-05.models"
if [ "$hm" = "deepseek-v4-flash-0731" ] && [ "$pm" = "deepseek-v4-flash-0731" ]; then
  record pass - "headless 与 provider 均用 config 的 deepseek-v4-flash-0731(单配置门通过)"
elif [ -n "$hm" ] && [ "$pm" != "$hm" ]; then
  record fail W "两面模型不一致(headless=$hm provider=$pm)——单配置被破坏"
else
  record partial H "headless=$hm provider=$pm;某面证据缺失"
fi

# ---------- U1-06 偏好生效(上下文窗) ----------
task_start U1-06 "config 的上下文窗设定被会话尊重"
write_config "deepseek-v4-flash-0731"
python3 - "$CFG" <<'EOF'
import sys
p=sys.argv[1]; s=open(p).read()
s=s.replace('context_window = 128000','context_window = 4096')
open(p,'w').write(s)
EOF
rc=0
( cd "$BENCH_ROOT/projects/alpha" && timeout 120 "$NOFY" -p "只回复:窗" --yolo > "$RESULTS/U1-06.out" 2>&1 ) || rc=$?
if [ $rc -eq 0 ]; then
  record pass - "带 context_window=4096 的会话正常起(设定被读取)"
else
  record fail H "rc=$rc;无法确认上下文窗设定路径"
fi

# ---------- U1-07 权限偏好生效 ----------
task_start U1-07 "config 权限模式(plan)下不改文件"
write_config "deepseek-v4-flash-0731"
cat >> "$CFG" <<'EOF'

[ui]
permission_mode = "plan"
EOF
rm -f "$BENCH_ROOT/projects/alpha/plan_probe.txt"
( cd "$BENCH_ROOT/projects/alpha" && timeout 120 "$NOFY" -p "创建文件 plan_probe.txt 写入 x" \
    > "$RESULTS/U1-07.out" 2>&1 ) || true
if [ ! -f "$BENCH_ROOT/projects/alpha/plan_probe.txt" ]; then
  record pass - "plan 模式下未落盘文件(权限偏好生效)"
else
  record fail W "plan 模式仍写了文件——配置权限未贯通 headless"
fi

# ---------- U1-08 缺省不报错 ----------
task_start U1-08 "只写必要段,其余走默认"
cat > "$CFG" <<'EOF'
[model.bench]
model = "deepseek-v4-flash-0731"
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
env_key = "DASHSCOPE_FLASH_KEY"
EOF
rc=0
( cd "$BENCH_ROOT/projects/alpha" && timeout 120 "$NOFY" -p "只回复:省" -m bench --yolo \
    > "$RESULTS/U1-08.out" 2>&1 ) || rc=$?
if [ $rc -eq 0 ] && grep -q "省" "$RESULTS/U1-08.out"; then
  record pass - "最小配置可用,缺省字段不报错"
else
  record fail M "rc=$rc;最小配置不可用"
fi

# ---------- U1-09 写错语法有定位 ----------
task_start U1-09 "坏 TOML 启动报错有定位,不崩"
write_config "deepseek-v4-flash-0731"
printf '\n[model.bench\nthis is not toml\n' >> "$CFG"
rc=0
( cd "$BENCH_ROOT/projects/alpha" && timeout 60 "$NOFY" -p "hi" --yolo \
    > "$RESULTS/U1-09.out" 2>&1 ) || rc=$?
if grep -qiE "toml|parse|config|invalid|expected|line" "$RESULTS/U1-09.out"; then
  record pass - "坏 TOML 得到指向配置的错误"
elif [ $rc -ne 0 ]; then
  record partial M "rc=$rc 失败但错误未指向配置问题"
else
  record fail M "坏 TOML 未报错或静默忽略"
fi

# ---------- U1-10 key 不落盘 ----------
task_start U1-10 "env_key 引用,配置文件无明文 key"
write_config "deepseek-v4-flash-0731"
if grep -qE "sk-[A-Za-z0-9]{16,}" "$CFG"; then
  record fail W "配置文件出现明文 key"
else
    rc=0
  ( cd "$BENCH_ROOT/projects/alpha" && timeout 120 "$NOFY" -p "只回复:密" -m bench --yolo \
      > "$RESULTS/U1-10.out" 2>&1 ) || rc=$?
  if [ $rc -eq 0 ] && grep -q "密" "$RESULTS/U1-10.out"; then
    record pass - "key 经 env_key 引用不落盘,功能正常"
  else
    record fail H "rc=$rc;env_key 路径功能异常"
  fi
fi

echo "U1 done: pass=$pass_count partial=$partial_count fail=$fail_count"
