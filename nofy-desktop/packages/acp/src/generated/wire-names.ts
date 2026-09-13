/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * 源     : packages/acp/schema/meta.unstable.json
 * 源 sha : 04fb56625acd502b01861101a49aa63fe51dabdb94346c44f6b4f04063976eb8
 * 生成器 : packages/acp/scripts/gen-wire-names.ts
 * 上游   : agent-client-protocol-schema 0.11.4 (Apache-2.0), features=["unstable"]
 * 命令   : cargo run --bin generate --features unstable --release
 *
 * 这些是 ACP 协议的**权威线路名**。手写常量必须引用这里的值，不得写字面量——
 * 如此任何拼错都会在类型层失败（见 methods.ts 的 satisfies 约束）。
 */

/** ACP protocolVersion（initialize 请求用）。 */
export const ACP_PROTOCOL_VERSION = 1;

/** agent 侧方法（客户端 → 内核）。24 条。 */
export const AGENT_WIRE = {
  authenticate: "authenticate",
  document_did_change: "document/didChange",
  document_did_close: "document/didClose",
  document_did_focus: "document/didFocus",
  document_did_open: "document/didOpen",
  document_did_save: "document/didSave",
  initialize: "initialize",
  logout: "logout",
  nes_accept: "nes/accept",
  nes_close: "nes/close",
  nes_reject: "nes/reject",
  nes_start: "nes/start",
  nes_suggest: "nes/suggest",
  session_cancel: "session/cancel",
  session_close: "session/close",
  session_fork: "session/fork",
  session_list: "session/list",
  session_load: "session/load",
  session_new: "session/new",
  session_prompt: "session/prompt",
  session_resume: "session/resume",
  session_set_config_option: "session/set_config_option",
  session_set_mode: "session/set_mode",
  session_set_model: "session/set_model",
} as const;

/** client 侧方法（内核 → 客户端，多数需应答）。11 条。 */
export const CLIENT_WIRE = {
  fs_read_text_file: "fs/read_text_file",
  fs_write_text_file: "fs/write_text_file",
  session_elicitation: "session/elicitation",
  session_elicitation_complete: "session/elicitation/complete",
  session_request_permission: "session/request_permission",
  session_update: "session/update",
  terminal_create: "terminal/create",
  terminal_kill: "terminal/kill",
  terminal_output: "terminal/output",
  terminal_release: "terminal/release",
  terminal_wait_for_exit: "terminal/wait_for_exit",
} as const;

/** 协议级方法。1 条。 */
export const PROTOCOL_WIRE = {
  cancel_request: "$/cancel_request",
} as const;

export type AgentWireName = (typeof AGENT_WIRE)[keyof typeof AGENT_WIRE];

export type ClientWireName = (typeof CLIENT_WIRE)[keyof typeof CLIENT_WIRE];

export type ProtocolWireName = (typeof PROTOCOL_WIRE)[keyof typeof PROTOCOL_WIRE];

/** 生成物指纹，供 drift 测试校验「改了 meta 没重跑生成器」。 */
export const META_SHA256 = "04fb56625acd502b01861101a49aa63fe51dabdb94346c44f6b4f04063976eb8";
