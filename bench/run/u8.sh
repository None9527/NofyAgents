#!/usr/bin/env bash
# U8 逆境下的可靠 — 10 tasks(v2)。
# 逆境=杀进程/断网/坏端点/坏文件/写不进/双开/久放/崩溃/换版本。
set -u
NOFY=/home/none/grok-build/target/debug/nofy
A=$BENCH_ROOT/projects/alpha
H=$BENCH_ROOT/home
P=$BENCH_ROOT/projects
export NOFY_HOME=$H

write_config() { # $1 可选:追加段
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
write_config

# ---------- U8-01 杀了能续 ----------
task_start U8-01 "杀了能续:任务中 kill,续跑有交代"
mkdir -p "$P/u8kill" && rm -f "$P/u8kill/part1.txt" "$P/u8kill/part2.txt"
( cd "$P/u8kill" && timeout 120 "$NOFY" -p "先创建 part1.txt 内容 A,再创建 part2.txt 内容 B。" --yolo \
    > "$RESULTS/U8-01a.out" 2>&1 ) &
KPID=$!
sleep 8
pkill -x nofy 2>/dev/null || true
wait $KPID 2>/dev/null || true
sleep 1
rc=0
( cd "$P/u8kill" && timeout 180 "$NOFY" -c -p "继续刚才的任务,把没做完的做完,并报告进度。" --yolo \
    > "$RESULTS/U8-01b.out" 2>&1 ) || rc=$?
if [ -f "$P/u8kill/part2.txt" ]; then
  record pass - "kill 后续跑补齐(part2 落地)"
elif [ "$rc" = 0 ] && grep -qaiE "part1|part2|继续|完成|进度" "$RESULTS/U8-01b.out"; then
  record pass - "kill 后接续有明白交代(会话续上)"
else
  record fail M "rc=$rc;kill 后失忆或无法接续"
fi

# ---------- U8-02 重启不丢 ----------
task_start U8-02 "重启不丢:kill -9 后日程仍在"
ensure_daemon || true   # U8-01 的 pkill 会连带杀掉 daemon
timeout 30 "$NOFY" schedule enable > /dev/null 2>&1 || true
timeout 30 "$NOFY" schedule add u802-probe "*/10 * * * *" --goal "Say PROBE." > /dev/null 2>&1 || true
DPID=$(pgrep -x nofy 2>/dev/null | while read -r p; do
  tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null | grep -q "daemon --debug-file $BENCH_ROOT/daemon.log" && echo "$p"
done | head -1 || true)
[ -n "$DPID" ] && kill -9 "$DPID" || true
sleep 2
ensure_daemon || true
timeout 30 "$NOFY" schedule list > "$RESULTS/U8-02.out" 2>&1 || true
timeout 30 "$NOFY" schedule remove u802-probe > /dev/null 2>&1 || true
if grep -qa "u802-probe" "$RESULTS/U8-02.out"; then
  record pass - "kill -9 重启后日程完整"
else
  record fail M "重启后日程丢失"
fi

# ---------- U8-03 断网有话说 ----------
task_start U8-03 "断网有话说:连不上端点有清晰错误"
cat > "$H/config.toml" <<'EOF'
[models]
default = "netdown"

[model.netdown]
model = "deepseek-v4-flash-0731"
base_url = "http://127.0.0.1:9/v1"
name = "Netdown Model"
env_key = "DASHSCOPE_FLASH_KEY"
api_backend = "chat_completions"
context_window = 128000
EOF
rc=0
( cd "$P/u8kill" && timeout 60 "$NOFY" -p "说一个字。" --yolo > "$RESULTS/U8-03.out" 2>"$RESULTS/U8-03.err" ) || rc=$?
write_config
if [ "$rc" -ne 0 ] && grep -qaiE "connect|connection|network|refused|error|failed" "$RESULTS/U8-03.out" "$RESULTS/U8-03.err" && ! grep -qa "panic" "$RESULTS/U8-03.err"; then
  record pass - "连不上有明白错误,无 panic(rc=$rc)"
elif [ "$rc" -ne 0 ]; then
  record partial M "有失败(rc=$rc)但错误信息不可读(见 U8-03.out/err)"
else
  record fail M "断网却 rc=0:静默或假成功"
fi

# ---------- U8-04 端点错有话说 ----------
task_start U8-04 "端点错有话说:401 明白归因"
cat > "$H/config.toml" <<'EOF'
[models]
default = "badkey"

[model.badkey]
model = "deepseek-v4-flash-0731"
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
name = "Badkey Model"
env_key = "U8_BAD_KEY"
api_backend = "chat_completions"
context_window = 128000
EOF
rc=0
( cd "$P/u8kill" && U8_BAD_KEY=sk-invalid-000 timeout 60 "$NOFY" -p "说一个字。" --yolo > "$RESULTS/U8-04.out" 2>"$RESULTS/U8-04.err" ) || rc=$?
write_config
if [ "$rc" -ne 0 ] && grep -qaiE "401|auth|token|invalid|unauthor|key" "$RESULTS/U8-04.out" "$RESULTS/U8-04.err"; then
  record pass - "401 归因明白(认证/key 字样)"
else
  record fail M "rc=$rc;401 无明白归因"
fi

# ---------- U8-05 坏文件不崩 ----------
task_start U8-05 "坏文件不崩:损坏会话文件不 panic"
mkdir -p "$P/u8corrupt"
CSLUG=$H/sessions/%2Ftmp%2Fnofy-bench%2Fprojects%2Fu8corrupt
mkdir -p "$CSLUG/00000000-dead-beef-0000-000000000000"
echo '{{{this is not json' > "$CSLUG/00000000-dead-beef-0000-000000000000/chat_history.jsonl"
rc=0
( cd "$P/u8corrupt" && timeout 90 "$NOFY" -c -p "继续。" --yolo > "$RESULTS/U8-05.out" 2>"$RESULTS/U8-05.err" ) || rc=$?
if ! grep -qa "panic" "$RESULTS/U8-05.err"; then
  record pass - "损坏会话不崩(rc=$rc,大声或降级)"
else
  record fail M "损坏会话触发 panic"
fi

# ---------- U8-06 写不进有话说 ----------
task_start U8-06 "写不进有话说:会话目录不可写"
mkdir -p "$P/u8write"
chmod 555 "$H/sessions" 2>/dev/null || true
rc=0
( cd "$P/u8write" && timeout 90 "$NOFY" -p "说一个字。" --yolo > "$RESULTS/U8-06.out" 2>"$RESULTS/U8-06.err" ) || rc=$?
chmod 755 "$H/sessions" 2>/dev/null || true
if [ "$rc" -ne 0 ] && grep -qaiE "permission|denied|read-only|readonly|write|error" "$RESULTS/U8-06.out" "$RESULTS/U8-06.err"; then
  record pass - "写不进大声失败(rc=$rc)"
elif [ "$rc" -eq 0 ]; then
  record partial M "写不进却 rc=0:降级未声张或绕过了不可写目录"
else
  record partial M "失败(rc=$rc)但错误不可读"
fi

# ---------- U8-07 不会双开 ----------
task_start U8-07 "不会双开:第二个 daemon 被拒"
rc=0
NOFY_HOME=$H timeout 30 "$NOFY" daemon > "$RESULTS/U8-07.out" 2>&1 || rc=$?
if [ "$rc" -ne 0 ] && grep -qaiE "lock|already|instance|running|single" "$RESULTS/U8-07.out"; then
  record pass - "第二实例被拒且有说明(rc=$rc)"
elif [ "$rc" -ne 0 ]; then
  record pass - "第二实例退出(rc=$rc)"
else
  record fail M "双开成功:两个 daemon 并存"
fi

# ---------- U8-08 久放还能用 ----------
task_start U8-08 "久放还能用:打断后回来会话仍在"
mkdir -p "$P/u8idle"
rc1=0
( cd "$P/u8idle" && timeout 120 "$NOFY" -p "记住口令:闲庭花开。只回复已记住。" --yolo > "$RESULTS/U8-08a.out" 2>&1 ) || rc1=$?
( cd "$P/u8kill" && timeout 120 "$NOFY" -p "1加1等于?只回答数字。" --yolo > "$RESULTS/U8-08mid.out" 2>&1 ) || true
rc2=0
( cd "$P/u8idle" && timeout 120 "$NOFY" -c -p "我让你记的口令是什么?只回复口令。" --yolo > "$RESULTS/U8-08b.out" 2>&1 ) || rc2=$?
if [ "$rc2" = 0 ] && grep -q "闲庭花开" "$RESULTS/U8-08b.out"; then
  record pass - "打断后回来口令仍在"
else
  record fail M "rc=$rc1/$rc2;回来后会话失忆"
fi

# ---------- U8-09 死因可查 ----------
task_start U8-09 "死因可查:崩溃有取证"
F=$H/daemon/forensics.jsonl
DPID=$(pgrep -x nofy 2>/dev/null | while read -r p; do
  tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null | grep -q "daemon --debug-file $BENCH_ROOT/daemon.log" && echo "$p"
done | head -1 || true)
[ -n "$DPID" ] && kill -9 "$DPID" || true
sleep 2
# 先问(动词在 daemon 停机时也可查,账本未动);再恢复。若先 ensure_daemon,
# 卡死循环保护的归档恢复会重置账本,死因证据就被挪走了。
timeout 20 "$NOFY" forensics > "$RESULTS/U8-09.out" 2>&1 || true
ensure_daemon || true
if grep -q "UNCLEAN_DEATH" "$RESULTS/U8-09.out" && grep -q "PREVIOUS RUN DIED UNCLEAN" "$RESULTS/U8-09.out"; then
  record pass - "崩溃可问:nofy forensics 点名 UNCLEAN_DEATH 并给出死亡判词"
elif [ -s "$F" ] && grep -qaiE "crash|kill|signal|shutdown|aware" "$F"; then
  record partial W-12 "forensics.jsonl 有崩溃取证记录,但查询动词未给出死因"
elif [ -s "$F" ]; then
  record partial W-12 "forensics.jsonl 存在但内容无明确死因词"
else
  record fail M "无取证文件"
fi

# ---------- U8-10 升级不丢 ----------
task_start U8-10 "升级不丢:换 home 实例配置会话都在"
rm -rf "$H-v2" 2>/dev/null || true
cp -r "$H" "$H-v2"
n1=$(find "$H/sessions" -mindepth 2 -maxdepth 2 -type d 2>/dev/null | wc -l || true)
NOFY_HOME=$H-v2 timeout 30 "$NOFY" models > "$RESULTS/U8-10.out" 2>&1 || true
n2=$(find "$H-v2/sessions" -mindepth 2 -maxdepth 2 -type d 2>/dev/null | wc -l || true)
rm -rf "$H-v2" || true
if grep -qa "bench" "$RESULTS/U8-10.out" && [ "${n1:-0}" -eq "${n2:-0}" ] && [ "${n1:-0}" -ge 1 ]; then
  record pass - "配置可解析、会话数一致($n1)"
else
  record fail M "换实例后配置或会话丢失(n1=${n1:-0} n2=${n2:-0})"
fi

echo "U8 done: pass=$pass_count partial=$partial_count fail=$fail_count"
