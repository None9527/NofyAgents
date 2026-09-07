#!/bin/bash
# nofy 桌面控制（CUA）独立 launcher —— 复刻 host 的完整启动契约
# （out/host/index.js:23599 的 open 参数 + 活进程 cmdline 实证的全量 flag）。
# 本脚本同时充当 keeper：helper 用 --launcher-pid 监视启动者，启动者死则 helper 退。
DIR=/tmp/nofy-cua
mkdir -p "$DIR"
HEX=$(/opt/homebrew/bin/node -e 'process.stdout.write(require("crypto").randomBytes(8).toString("hex"))')
SOCK_PENDING="$DIR/broker-$HEX.sock.pending"
SOCK="$DIR/broker-$HEX.sock"
T1="$DIR/broker.token"; T2="$DIR/presentation.token"; TV="$DIR/broker.token.value"
APP="/Users/mac/.zcode/computer-use/ZCode Computer Use.app"
[ -d "$APP" ] || APP="/Applications/ZCode.app/Contents/Resources/cua-helper/ZCode Computer Use.app"
rm -f "$SOCK" "$SOCK_PENDING"
/opt/homebrew/bin/node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("hex"))' > "$T1"; chmod 600 "$T1"
/opt/homebrew/bin/node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("hex"))' > "$T2"; chmod 600 "$T2"
cp "$T1" "$TV"; chmod 600 "$TV"
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
