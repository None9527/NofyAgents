#!/bin/bash
# 我的 harness 的 CUA MCP 入口：从 launcher 的 current.env 取活 broker 的 socket 与 token。
source /tmp/nofy-cua/current.env || exit 1
export ZCODE_CUA_PERMISSION_BROKER_TOKEN="$(cat "$TOKEN_FILE")"
exec /opt/homebrew/bin/node /Applications/ZCode.app/Contents/Resources/glm/packages/zcode-cua-plugin/dist/mcp/server.js --permission-broker-socket "$SOCK_FILE"
