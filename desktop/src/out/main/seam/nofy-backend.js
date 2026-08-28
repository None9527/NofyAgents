// nofy backend seam — D5b/D5c (nofy local-first rebrand)
//
// This module is the wiring seam between the de-clouded ZCode shell and the
// local nofy agent backend. It is intentionally NOT required by main yet:
// D5c will consume it to route agent transport to the local acp-ws endpoint.
//
// D5c（已接线）：out/main/index.js 启动序列 import kernel-supervisor.js；
// supervisor 按 发现-否则-启动 管理内核，host spawn env 指向 acp-agent-adapter.js
// （ZCODE_AGENT_SERVER_COMMAND / ZCODE_AGENT_SERVER_ARGS_JSON），agent 会话经
// ACP 连本地 nofy 内核。详见 src-reconstructed/modules/D5C-WIRING-LEDGER.md。
module.exports = {
  brand: "nofy",
  agentTransport: "acp-ws",
  url: "ws://127.0.0.1:9800/ws",
  auth: "local",
};
