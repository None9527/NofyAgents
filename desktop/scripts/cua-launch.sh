#!/bin/bash
# nofy 桌面控制（CUA）独立 launcher —— 复刻 host 的完整启动契约
# （out/host/index.js:23599 的 open 参数 + 活进程 cmdline 实证的全量 flag）。
# 本脚本同时充当 keeper：helper 用 --launcher-pid 监视启动者，启动者死则 helper 退。
DIR=/tmp/nofy-cua
mkdir -p "$DIR"
# 复用既有 current.env 的 socket/token 路径：我的 MCP server 在会话启动时就把这两个路径
# 烧进了插件进程（wrapper 启动时 source current.env），重铸新路径会让活着的 MCP server 指向死路径。
if [ -f "$DIR/current.env" ]; then
  source "$DIR/current.env"
  SOCK="$SOCK_FILE"; TV="$TOKEN_FILE"; T1="$TV"; T2="$DIR/presentation.token"
  HEX=$(basename "$SOCK" .sock | sed 's/^broker-//')
else
  HEX=$(/opt/homebrew/bin/node -e 'process.stdout.write(require("crypto").randomBytes(8).toString("hex"))')
  SOCK="$DIR/broker-$HEX.sock"; TV="$DIR/broker.token.value"; T1="$TV"; T2="$DIR/presentation.token"
fi
SOCK_PENDING="$SOCK.pending"
APP="/Users/mac/.zcode/computer-use/ZCode Computer Use.app"
[ -d "$APP" ] || APP="/Applications/ZCode.app/Contents/Resources/cua-helper/ZCode Computer Use.app"
rm -f "$SOCK" "$SOCK_PENDING"
# TV 的内容在我的会话启动时已被 wrapper 读走并烧进插件 env；复用路径时绝不能重铸，
# 否则 helper 拿新 token、插件持旧 token，鉴权必败。
if [ ! -s "$TV" ]; then
  /opt/homebrew/bin/node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("hex"))' > "$TV"; chmod 600 "$TV"
fi
T1="$TV"
/opt/homebrew/bin/node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("hex"))' > "$T2"; chmod 600 "$T2"
DEADLINE=$(( ( $(date +%s) + 90 ) * 1000 ))
CANCEL="$DIR/.launch-cancel-$HEX.sentinel"; rm -f "$CANCEL"
echo "SOCK_FILE=$SOCK" > "$DIR/current.env"
echo "TOKEN_FILE=$TV" >> "$DIR/current.env"
open -n -g "$APP" --args --socket "$SOCK_PENDING" --token-file "$T1" \
  --presentation-token-file "$T2" --version 3.11.2 \
  --expected-app-bundle-path "$APP" --controller-variant stable \
  --broker-launch-deadline-epoch-ms "$DEADLINE" --broker-launch-cancel-file "$CANCEL" \
  --exit-log "$SOCK.pending.exit.log" --launcher-pid $$
for i in $(seq 1 240); do [ -S "$SOCK" ] && break; sleep 0.5; done
if [ ! -S "$SOCK" ]; then echo "LAUNCH FAILED"; [ -f "$SOCK.pending.exit.log" ] && tail -3 "$SOCK.pending.exit.log"; exit 1; fi
echo "SOCKET=$SOCK"; echo "TOKEN_VALUE_FILE=$TV"
# keeper：活着，让 --launcher-pid 有效
while true; do sleep 5; done
