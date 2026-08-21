#!/usr/bin/env bash
# U10 模型与错误体验(BYOK) — 10 tasks(v2)。
# 错误路径用本地 mock(mock_http.py)与黑穴地址复现,不依赖真端点故障。
set -u
NOFY=/home/none/grok-build/target/debug/nofy
A=$BENCH_ROOT/projects/alpha
H=$BENCH_ROOT/home
export NOFY_HOME=$H

cfg_std() {
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
}
cfg_two() { # bench + bench2(同端点,辨配置条目用)
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

[model.bench2]
model = "deepseek-v4-flash-0731"
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
name = "Bench Model Two"
env_key = "DASHSCOPE_FLASH_KEY"
api_backend = "chat_completions"
context_window = 128000
EOF
}

start_mock() { # $1=mode $2=port
  python3 /home/none/grok-build/bench/run/mock_http.py "$1" "$2" &
  echo $! > "$RESULTS/mock-$2.pid"
  sleep 1
}
stop_mock() { # $1=port
  local pid; pid=$(cat "$RESULTS/mock-$1.pid" 2>/dev/null || true)
  [ -n "$pid" ] && kill "$pid" 2>/dev/null || true
}

run_a() { # $1=timeout $2=out $3..=flags+prompt
  local tmo=$1 out=$2; shift 2
  rc=0
  ( cd "$A" && timeout "$tmo" "$NOFY" "$@" > "$out" 2>"$out.err" ) || rc=$?
  echo $rc
}

# ---------- U10-01 换模型即生效 ----------
task_start U10-01 "换模型即生效:改 config 默认,下一会话即用"
cfg_two
python3 - "$H/config.toml" <<'EOF'
import sys
p = sys.argv[1]
s = open(p).read().replace('default = "bench"', 'default = "bench2"', 1)
open(p, "w").write(s)
EOF
r=$(run_a 120 "$RESULTS/U10-01.out" -p "只回复:模型切换成功。" --debug-file "$RESULTS/U10-01.dbg")
cfg_two
if [ "$r" = 0 ] && grep -qa "bench2" "$RESULTS/U10-01.dbg" 2>/dev/null; then
  record pass - "新默认 bench2 立即生效(debug 有证据)"
elif [ "$r" = 0 ]; then
  record partial W-8 "会话成功但用户侧找不到『用了哪个配置条目』的证据(debug/会话均无 bench2 字样)"
else
  record fail M "rc=$r;换默认后会话失败"
fi

# ---------- U10-02 模型横评 ----------
task_start U10-02 "模型横评:harness 可切换对照"
r1=$(run_a 120 "$RESULTS/U10-02a.out" -p "用一句话介绍勾股定理。" -m bench)
r2=$(run_a 120 "$RESULTS/U10-02b.out" -p "用一句话介绍勾股定理。" -m bench2)
if [ "$r1" = 0 ] && [ "$r2" = 0 ] && [ -s "$RESULTS/U10-02a.out" ] && [ -s "$RESULTS/U10-02b.out" ]; then
  record pass - "同一题两配置各跑一遍,可对照"
else
  record fail M "rc=$r1/$r2;横评跑不齐"
fi

# ---------- U10-03 快慢可选 ----------
task_start U10-03 "快慢可选:推理档旗标被接受"
r1=$(run_a 90 "$RESULTS/U10-03a.out" -p "只回复:低档。" --reasoning-effort low)
r2=$(run_a 90 "$RESULTS/U10-03b.out" -p "只回复:高档。" --reasoning-effort high)
if [ "$r1" = 0 ] && [ "$r2" = 0 ]; then
  record pass - "low/high 档均可运行"
else
  record fail M "rc=$r1/$r2;推理档旗标不被接受"
fi

# ---------- U10-04 乱回不崩 ----------
task_start U10-04 "乱回不崩:模型返回垃圾有明白错误"
cat > "$H/config.toml" <<'EOF'
[models]
default = "mock"

[model.mock]
model = "mock-model"
base_url = "http://127.0.0.1:8931/v1"
name = "Mock Model"
env_key = "DASHSCOPE_FLASH_KEY"
api_backend = "chat_completions"
context_window = 128000
EOF
start_mock garbage 8931
r=$(run_a 90 "$RESULTS/U10-04.out" -p "说一个字。")
stop_mock 8931
cfg_std
if [ "$r" -ne 0 ] && ! grep -qa "panic" "$RESULTS/U10-04.out.err" && grep -qaiE "parse|invalid|json|decode|error|unexpected" "$RESULTS/U10-04.out" "$RESULTS/U10-04.out.err"; then
  record pass - "垃圾响应有明白错误,无 panic(rc=$r)"
elif [ "$r" -ne 0 ]; then
  record partial M "失败(rc=$r)但错误信息不可读"
else
  record fail M "垃圾响应 rc=0:静默吞下"
fi

# ---------- U10-05 超时明白 ----------
task_start U10-05 "超时明白:端点黑洞有超时错误"
cat > "$H/config.toml" <<'EOF'
[models]
default = "blackhole"

[model.blackhole]
model = "mock-model"
base_url = "http://10.255.255.1:9999/v1"
name = "Blackhole Model"
env_key = "DASHSCOPE_FLASH_KEY"
api_backend = "chat_completions"
context_window = 128000
EOF
r=$(run_a 150 "$RESULTS/U10-05.out" -p "说一个字。")
cfg_std
if [ "$r" -ne 0 ] && grep -qaiE "timeout|timed out|超时" "$RESULTS/U10-05.out" "$RESULTS/U10-05.out.err"; then
  record pass - "超时错误明白(rc=$r)"
elif [ "$r" -ne 0 ] && grep -qaiE "connect|network|unreachable|error" "$RESULTS/U10-05.out" "$RESULTS/U10-05.out.err"; then
  record partial M "有网络错误但非超时语义(黑洞被快速拒绝)"
else
  record fail M "rc=$r;黑洞无明白错误"
fi

# ---------- U10-06 限额明白 ----------
task_start U10-06 "限额明白:429 归因清楚"
cat > "$H/config.toml" <<'EOF'
[models]
default = "mock"

[model.mock]
model = "mock-model"
base_url = "http://127.0.0.1:8932/v1"
name = "Mock Model"
env_key = "DASHSCOPE_FLASH_KEY"
api_backend = "chat_completions"
context_window = 128000
EOF
start_mock rate429 8932
r=$(run_a 90 "$RESULTS/U10-06.out" -p "说一个字。")
stop_mock 8932
cfg_std
if [ "$r" -ne 0 ] && grep -qaiE "429|rate|limit|quota" "$RESULTS/U10-06.out" "$RESULTS/U10-06.out.err"; then
  record pass - "429 归因明白(rc=$r)"
else
  record fail M "rc=$r;429 无明白归因"
fi

# ---------- U10-07 按任务指定 ----------
task_start U10-07 "按任务指定:-m 覆盖默认"
cfg_two   # 默认 bench
r=$(run_a 120 "$RESULTS/U10-07.out" -p "只回复:指定成功。" -m bench2 --debug-file "$RESULTS/U10-07.dbg")
if [ "$r" = 0 ] && grep -qa "bench2" "$RESULTS/U10-07.dbg" 2>/dev/null; then
  record pass - "-m bench2 生效(debug 有证据)"
elif [ "$r" = 0 ]; then
  record partial W-8 "任务运行成功但无 bench2 证据,无法确认用的是指定模型"
else
  record fail M "rc=$r;-m 指定后失败"
fi

# ---------- U10-08 用了谁可查 ----------
task_start U10-08 "用了谁可查:会话记录含真实模型"
ASLUG=$H/sessions/%2Ftmp%2Fnofy-bench%2Fprojects%2Falpha
ev=$(find "$ASLUG" -name events.jsonl -newer "$RESULTS/U10-07.out" 2>/dev/null | head -1 || true)
if [ -n "$ev" ] && grep -qa "deepseek-v4-flash-0731" "$ev"; then
  record pass - "会话 events 记录真实模型 slug"
else
  ev2=$(find "$ASLUG" -name events.jsonl 2>/dev/null | xargs grep -la "deepseek-v4-flash-0731" 2>/dev/null | head -1 || true)
  if [ -n "$ev2" ]; then
    record pass - "会话 events 记录真实模型 slug"
  else
    record fail M "会话记录中无模型证据"
  fi
fi

# ---------- U10-09 过期有指引 ----------
task_start U10-09 "过期有指引:key 失效引导重配"
cat > "$H/config.toml" <<'EOF'
[models]
default = "badkey"

[model.badkey]
model = "deepseek-v4-flash-0731"
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
name = "Badkey Model"
env_key = "U10_BAD_KEY"
api_backend = "chat_completions"
context_window = 128000
EOF
r=0
( cd "$A" && U10_BAD_KEY=sk-expired-xxx timeout 90 "$NOFY" -p "说一个字。" > "$RESULTS/U10-09.out" 2>"$RESULTS/U10-09.err" ) || r=$?
cfg_std
if [ "$r" -ne 0 ] && grep -qaiE "key|token|auth|login|config|配置|登录" "$RESULTS/U10-09.out" "$RESULTS/U10-09.err"; then
  record pass - "key 失效有归因与指引字样(rc=$r)"
else
  record fail M "rc=$r;key 失效无指引"
fi

# ---------- U10-10 默认不外呼 ----------
task_start U10-10 "默认不外呼:未配模型不静默外呼"
cat > "$H/config.toml" <<'EOF'
# 空配置:未配任何模型
EOF
r=$(run_a 60 "$RESULTS/U10-10.out" -p "说一个字。")
cfg_std
if [ "$r" -ne 0 ] && grep -qaiE "model|signed|login|config|模型|配置|登录" "$RESULTS/U10-10.out" "$RESULTS/U10-10.out.err"; then
  record pass - "未配模型即拒,有明白提示(rc=$r)"
else
  record fail M "rc=$r;未配模型却运行或静默"
fi

echo "U10 done: pass=$pass_count partial=$partial_count fail=$fail_count"
