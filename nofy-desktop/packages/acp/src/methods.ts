/**
 * ACP 线路名——**手写语义别名层**。
 *
 * 纪律（PLAN.md §12.1）：**不得凭空造名**。所有值一律引用生成常量，经 satisfies
 * 约束；写错键名、把通知当请求、把事件当请求都会在 tsc 失败。
 *
 * 两条生成链：
 *   - stdlib 层 ← ACP 官方 JSON schema（agent-client-protocol-schema 0.11.4, Apache-2.0）
 *     经 scripts/gen-wire-names.ts → src/generated/wire-names.ts
 *   - 扩展层   ← **内核源码**（scripts/extract-kernel-ext.ts 扫 crates/codegen 全树）
 *     经 scripts/gen-ext-names.ts → src/generated/ext-names.ts
 * 证据链与复核结论见 docs/contract/kernel-ext-audit.md。
 *
 * 已经付出过的代价：
 *   1. 初版把 Rust 枚举变体名 KillTerminalCommand 反推成 "terminal/kill_command"，
 *      权威值是 "terminal/kill"——codegen 第一次跑就抓到了。
 *   2. 初版把 toggle_plan_mode 与 queue/* 归成「客户端→内核请求」，而第一方 pager
 *      发它们用 ExtNotification（不等响应）。用 rpc() 发就会等一个永不到来的响应。
 *   3. 初版把 _nofy/replayed 当通知方法，而它其实是 _meta 键（见 EXT_META_KEY）。
 */
import { AGENT_WIRE, CLIENT_WIRE, PROTOCOL_WIRE } from "./generated/wire-names.ts";
import type { AgentWireName, ClientWireName, ProtocolWireName } from "./generated/wire-names.ts";
import {
  EXT_CLIENT_NOTIFICATION,
  EXT_CLIENT_REQUEST,
  EXT_DISPATCH_ONLY,
  EXT_DISPATCH_NOTIFY,
  EXT_EMIT_CLIENT,
  EXT_INDIRECT,
  EXT_KERNEL_EVENT,
  EXT_KERNEL_REQUEST,
} from "./generated/ext-names.ts";
import type {
  ExtClientNotificationName,
  ExtClientRequestName,
  ExtDispatchOnlyName,
  ExtDispatchNotifyName,
  ExtEmitClientName,
  ExtIndirectName,
  ExtKernelEventName,
  ExtKernelRequestName,
} from "./generated/ext-names.ts";

// 生成表整体再导出，供需要全量能力面的地方（命令面板、设置页、能力门）直接消费。
export {
  EXT_CLIENT_REQUEST,
  EXT_CLIENT_NOTIFICATION,
  EXT_KERNEL_REQUEST,
  EXT_KERNEL_EVENT,
  EXT_INDIRECT,
  EXT_DISPATCH_ONLY,
  EXT_DISPATCH_NOTIFY,
  EXT_EMIT_CLIENT,
  EXT_SIDE_SUPPRESSED,
  EXT_EVIDENCE_SHA256,
} from "./generated/ext-names.ts";

/* ═══════════════════════ stdlib 层（ACP 官方 schema 生成） ═══════════════════════ */

/**
 * 客户端 → 内核：本项目实际会调用的方法。
 *
 * 注意 nofy 自己的 nofy-acp-lib/src/message.rs 只把 10 个点包进 AcpMethod 枚举，
 * 其余由 agent-client-protocol crate 自身路由——「不在那 10 点里」≠「不存在」。
 * ACP schema（24 个 agent 方法）是更权威的口径。
 */
export const AGENT_METHOD = {
  initialize: AGENT_WIRE.initialize,
  authenticate: AGENT_WIRE.authenticate,
  newSession: AGENT_WIRE.session_new,
  loadSession: AGENT_WIRE.session_load,
  listSessions: AGENT_WIRE.session_list,
  resumeSession: AGENT_WIRE.session_resume,
  closeSession: AGENT_WIRE.session_close,
  setSessionMode: AGENT_WIRE.session_set_mode,
  setSessionModel: AGENT_WIRE.session_set_model,
  prompt: AGENT_WIRE.session_prompt,
  /**
   * **notification（无 id）**。源码坐实：message.rs:387-391
   * acp_define_request_response!(acp::CancelNotification, (), session_cancel)。
   * 陷阱 T1：作为 request 发送得 -32601。
   */
  cancel: AGENT_WIRE.session_cancel,
} satisfies Record<string, AgentWireName>;

/** 协议定义了、但 nofy 内核未实现（trait 默认 → method_not_found）。 */
export const AGENT_METHOD_UNIMPLEMENTED = {
  setSessionConfigOption: AGENT_WIRE.session_set_config_option,
  /** fork 走扩展 _nofy/session/fork（该扩展名在分派表 acp_agent.rs:1120 已确认） */
  forkSession: AGENT_WIRE.session_fork,
  logout: AGENT_WIRE.logout,
} satisfies Record<string, AgentWireName>;

/** ACP schema 定义了、本项目当前不用。显式登记以免后来者以为漏了。 */
export const AGENT_METHOD_UNUSED = {
  documentDidOpen: AGENT_WIRE.document_did_open,
  documentDidChange: AGENT_WIRE.document_did_change,
  documentDidSave: AGENT_WIRE.document_did_save,
  documentDidClose: AGENT_WIRE.document_did_close,
  documentDidFocus: AGENT_WIRE.document_did_focus,
  nesStart: AGENT_WIRE.nes_start,
  nesSuggest: AGENT_WIRE.nes_suggest,
  nesAccept: AGENT_WIRE.nes_accept,
  nesReject: AGENT_WIRE.nes_reject,
  nesClose: AGENT_WIRE.nes_close,
} satisfies Record<string, AgentWireName>;

/** 内核 → 客户端。fs/* 与 terminal/* 我们不声明能力（caps.ts），内核正常不会委托。 */
export const CLIENT_SIDE_METHOD = {
  sessionUpdate: CLIENT_WIRE.session_update,
  requestPermission: CLIENT_WIRE.session_request_permission,
  elicitation: CLIENT_WIRE.session_elicitation,
  elicitationComplete: CLIENT_WIRE.session_elicitation_complete,
  readTextFile: CLIENT_WIRE.fs_read_text_file,
  writeTextFile: CLIENT_WIRE.fs_write_text_file,
  createTerminal: CLIENT_WIRE.terminal_create,
  terminalOutput: CLIENT_WIRE.terminal_output,
  releaseTerminal: CLIENT_WIRE.terminal_release,
  waitForTerminalExit: CLIENT_WIRE.terminal_wait_for_exit,
  /** 初版误写 "terminal/kill_command"（把 Rust 变体名当线路名），权威值是这个。 */
  killTerminal: CLIENT_WIRE.terminal_kill,
} satisfies Record<string, ClientWireName>;

/** 协议级方法（不属于 agent/client 任一侧）。 */
export const PROTOCOL_METHOD = {
  cancelRequest: PROTOCOL_WIRE.cancel_request,
} satisfies Record<string, ProtocolWireName>;

/* ═══════════════════════ 扩展层（内核源码提取生成） ═══════════════════════ */

/**
 * 四类的区别是**行为性**的，不是分类学洁癖：
 *   EXT_EVENT          内核 → 客户端，通知。投影层的输入。
 *   EXT_REQUEST        客户端 → 内核，**等响应**。用 rpc()/ext()。
 *   EXT_NOTIFY         客户端 → 内核，**不等响应**。用 notify()。
 *   EXT_SERVER_REQUEST 内核 → 客户端，**必须应答**。不应答则内核悬挂或 fail-closed。
 */

/** 内核 → 客户端事件（投影层输入）。 */
export const EXT_EVENT = {
  sessionNotification: EXT_KERNEL_EVENT.session_notification,
  sessionUpdate: EXT_KERNEL_EVENT.session_update,
  sessionUpdatesChunk: EXT_KERNEL_EVENT.session_updates_chunk,
  modelsUpdate: EXT_KERNEL_EVENT.models_update,
  settingsUpdate: EXT_KERNEL_EVENT.settings_update,
  announcementsUpdate: EXT_KERNEL_EVENT.announcements_update,
  gitHeadChanged: EXT_KERNEL_EVENT.git_head_changed,
  taskBackgrounded: EXT_KERNEL_EVENT.task_backgrounded,
  taskCompleted: EXT_KERNEL_EVENT.task_completed,
  monitorEvent: EXT_KERNEL_EVENT.monitor_event,
  sessionInterjection: EXT_KERNEL_EVENT.session_interjection,
  /** legacy 双生（陷阱 T5）：fire-and-forget，重连会丢；回合结束一律依赖 turn_completed。 */
  sessionPromptComplete: EXT_KERNEL_EVENT.session_prompt_complete,
  mcpToolsChanged: EXT_KERNEL_EVENT.mcp_tools_changed,
  mcpInitialized: EXT_KERNEL_EVENT.mcp_initialized,
  fsNotify: EXT_KERNEL_EVENT.fs_notify,
  fsIndex: EXT_KERNEL_EVENT.fs_index,
  fsIndexDelta: EXT_KERNEL_EVENT.fs_index_delta,
  gitWorktreeStatus: EXT_KERNEL_EVENT.git_worktree_status,
  scheduledTaskCreated: EXT_KERNEL_EVENT.scheduled_task_created,
  scheduledTaskFired: EXT_KERNEL_EVENT.scheduled_task_fired,
  scheduledTaskDeleted: EXT_KERNEL_EVENT.scheduled_task_deleted,
  scheduledTaskInjectPrompt: EXT_KERNEL_EVENT.scheduled_task_inject_prompt,
  /* 下面几个经常量构造，落在 INDIRECT 桶（证据同级，仅提取模式不同）。 */
  sessionsChanged: EXT_INDIRECT.sessions_changed,
  queueChanged: EXT_INDIRECT.queue_changed,
  mcpServersUpdated: EXT_INDIRECT.mcp_servers_updated,
  mcpInitProgress: EXT_INDIRECT.mcp_init_progress,
  mcpServerStatus: EXT_INDIRECT.mcp_server_status,
  /* 内核经 emit_client_ext 助手推送（无构造点字面量，故提取器另立证据类）。
   * 〔实测〕⌘K 的文件模糊搜索结果**不在 fuzzy/change 的响应里**——响应只回
   * {sessionId, searchId}，结果走 _nofy/search/fuzzy/status 通知，形状
   * {sessionId, searchId, matches[{name,type,path,score,indices[]}], total, done, generation}
   * （docs/contract/ecosystem-shapes.json；内核 handle.rs:2321）。
   * 内容搜索同理走 search/content/status（handle.rs:2348）。 */
  searchFuzzyStatus: EXT_EMIT_CLIENT.search_fuzzy_status,
  searchContentStatus: EXT_EMIT_CLIENT.search_content_status,
} satisfies Record<string, ExtKernelEventName | ExtIndirectName | ExtEmitClientName>;

/** 客户端 → 内核，请求（等响应，用 rpc/ext）。 */
export const EXT_REQUEST = {
  sessionInfo: EXT_CLIENT_REQUEST.session_info,
  sessionList: EXT_CLIENT_REQUEST.session_list,
  sessionRename: EXT_CLIENT_REQUEST.session_rename,
  sessionDelete: EXT_CLIENT_REQUEST.session_delete,
  sessionFork: EXT_CLIENT_REQUEST.session_fork,
  sessionUsage: EXT_CLIENT_REQUEST.session_usage,
  sessionsList: EXT_CLIENT_REQUEST.sessions_list,
  interject: EXT_CLIENT_REQUEST.interject,
  btw: EXT_CLIENT_REQUEST.btw,
  recap: EXT_CLIENT_REQUEST.recap,
  rewindPoints: EXT_CLIENT_REQUEST.rewind_points,
  rewindExecute: EXT_CLIENT_REQUEST.rewind_execute,
  compactConversation: EXT_CLIENT_REQUEST.compact_conversation,
  commandsList: EXT_CLIENT_REQUEST.commands_list,
  workflowsList: EXT_CLIENT_REQUEST.workflows_list,
  promptHistory: EXT_CLIENT_REQUEST.prompt_history,
  suggest: EXT_CLIENT_REQUEST.suggest,
  /** 裁定 C #5「优先走内核 RPC 写配置」的依据：这三个经源码确认为真请求。 */
  mcpUpsert: EXT_CLIENT_REQUEST.mcp_upsert,
  mcpDelete: EXT_CLIENT_REQUEST.mcp_delete,
  mcpList: EXT_CLIENT_REQUEST.mcp_list,
  mcpSetup: EXT_CLIENT_REQUEST.mcp_setup,
  mcpToggle: EXT_CLIENT_REQUEST.mcp_toggle,
  mcpToggleTool: EXT_CLIENT_REQUEST.mcp_toggle_tool,
  mcpAuthTrigger: EXT_CLIENT_REQUEST.mcp_auth_trigger,
  hooksList: EXT_CLIENT_REQUEST.hooks_list,
  hooksAction: EXT_CLIENT_REQUEST.hooks_action,
  pluginsList: EXT_CLIENT_REQUEST.plugins_list,
  pluginsAction: EXT_CLIENT_REQUEST.plugins_action,
  skillsList: EXT_CLIENT_REQUEST.skills_list,
  skillsToggle: EXT_CLIENT_REQUEST.skills_toggle,
  subagentCancel: EXT_CLIENT_REQUEST.subagent_cancel,
  taskKill: EXT_CLIENT_REQUEST.task_kill,
  schedulerDelete: EXT_CLIENT_REQUEST.scheduler_delete,
  memoryRewrite: EXT_CLIENT_REQUEST.memory_rewrite,
  terminalBackground: EXT_CLIENT_REQUEST.terminal_background,
  marketplaceList: EXT_CLIENT_REQUEST.marketplace_list,
  marketplaceAction: EXT_CLIENT_REQUEST.marketplace_action,
  /* 仅分派侧有证据（内核 match 臂接受，第一方经常量/helper 发）。
   * 其中 summariesWorkspaceList 已由 smoke 实测调通（返回 5 工作区 / 82 会话）。 */
  sessionUpdates: EXT_DISPATCH_ONLY.session_updates,
  summariesWorkspaceList: EXT_DISPATCH_ONLY.session_summaries_workspace_list,
  summariesWorkspaceListRecent: EXT_DISPATCH_ONLY.session_summaries_workspace_list_recent,
  reloadModels: EXT_INDIRECT.internal_reload_models,
} satisfies Record<string, ExtClientRequestName | ExtDispatchOnlyName | ExtIndirectName>;

/**
 * 客户端 → 内核，**通知**（不等响应，用 notify）。
 *
 * 本轮复核的主要收获。第一方 pager 发这些用 ExtNotification：
 * effects/mod.rs:1127 toggle_plan_mode、:1209 queue/edit，失败只 tracing::warn、
 * 不解析响应。若我们用 rpc() 发，就会等一个永不到来的响应——正是旧路 D13
 * 「sendText 恰好卡 30.0 秒」那一类失效形态。
 */
export const EXT_NOTIFY = {
  queueRemove: EXT_CLIENT_NOTIFICATION.queue_remove,
  queueReorder: EXT_CLIENT_NOTIFICATION.queue_reorder,
  queueClear: EXT_CLIENT_NOTIFICATION.queue_clear,
  queueEdit: EXT_CLIENT_NOTIFICATION.queue_edit,
  queueInterject: EXT_CLIENT_NOTIFICATION.queue_interject,
  queueHoldEdit: EXT_CLIENT_NOTIFICATION.queue_hold_edit,
  queueReleaseEdit: EXT_CLIENT_NOTIFICATION.queue_release_edit,
  togglePlanMode: EXT_CLIENT_NOTIFICATION.toggle_plan_mode,
  yoloModeChanged: EXT_CLIENT_NOTIFICATION.yolo_mode_changed,
  /* 通知侧分派证据（提取器的 dispatchedNotify 桶 → 生成表 EXT_DISPATCH_NOTIFY）。
   * 内核在 acp_agent.rs 的 `async fn ext_notification`（:1240）体内用
   * `if args.method.as_ref() == "nofy/…"` 接受它们，**没有任何响应构造点**。
   * 〔实测〕rpc() 发 _nofy/terminal/pty/input 得 -32601 Method not found，
   * notify() 发才生效（docs/contract/ecosystem-shapes.json 的终端段）。
   * 这就是陷阱 T13 的又一例：分派表里有名 ≠ 是请求。 */
  /** 终端面写入。形状 {terminalId, input}（探针实测：input 键被接受）。 */
  terminalPtyInput: EXT_DISPATCH_NOTIFY.terminal_pty_input,
  /** 权限面「重置权限状态」：acp_agent.rs:1318 → SessionCommand::ResetPermissionState。 */
  permissionsReset: EXT_DISPATCH_NOTIFY.permissions_reset,
  /* telemetry 四条（:1445+）：多智能体/非 git 决策的埋点。生态面暂不发送，
   * 登记以免后来者以为漏了，也以免被误当请求发。 */
  telemetryNonGitDecision: EXT_DISPATCH_NOTIFY.telemetry_non_git_decision,
  telemetryMultiAgentFollowup: EXT_DISPATCH_NOTIFY.telemetry_multi_agent_followup,
  telemetryMultiAgentApply: EXT_DISPATCH_NOTIFY.telemetry_multi_agent_apply,
  telemetryMultiAgentDiscard: EXT_DISPATCH_NOTIFY.telemetry_multi_agent_discard,
} satisfies Record<string, ExtClientNotificationName | ExtDispatchNotifyName>;

/**
 * 内核 → 客户端，**必须应答**。
 *
 * folder_trust_request 是本轮新发现：内核 folder_trust_prompt.rs:183 发它，并以
 * TRUST_PROMPT_TIMEOUT 等 FolderTrustResponse{outcome}；**fail-closed**——超时/
 * 不可解码/传输错都判「not a decision → stay gated」并释放 dedup key 以便重问。
 * 应答形状：{outcome:"trust"} 解锁；#[serde(other)]（folder_trust_prompt.rs:61）使
 * 任何其它值——含我们的 METHOD_NOT_FOUND——解码为 Reject。
 * **受能力门控制**：folder_trust_prompt.rs:75 parse_interactive_trust_capability 读
 * initialize.clientCapabilities._meta["nofy/folderTrust"].interactive；我们当前未声明
 * ⇒ 内核不会问。要支持 GUI 信任提示，必须先声明该能力（见 caps.ts 的登记）。
 */
export const EXT_SERVER_REQUEST = {
  askUserQuestion: EXT_KERNEL_REQUEST.ask_user_question,
  exitPlanMode: EXT_KERNEL_REQUEST.exit_plan_mode,
  folderTrustRequest: EXT_KERNEL_REQUEST.folder_trust_request,
  mcpElicit: EXT_INDIRECT.mcp_elicit,
  /** 见 docs/contract/initialize-measured.md §4.1：内核 initialize._meta 声明了 nofy/mcp/sdk。 */
  mcpSdkCall: EXT_INDIRECT.mcp_sdk_call,
} satisfies Record<string, ExtKernelRequestName | ExtIndirectName>;

/**
 * **不是方法名——是 _meta 键。**
 *
 * 旧 seam（acp-client.js / nofy-kernel-client.js）把 _nofy/replayed 当通知方法，
 * 我们继承了它。内核源码复核：全树无 ExtNotification::new("nofy/replayed")。
 * 它只以 _meta["nofy/replayed"] 存在于 **pager 客户端侧**：
 *   app/acp_handler/follow_ups.rs:67「reserved _meta["nofy/replayed"] == true marker
 *   suppresses rendering」、:80 .and_then(|m| m.get("nofy/replayed"))、
 *   app/agent_view/mod.rs:3081「upstream by the _meta["nofy/replayed"] gate」。
 * ⇒ 客户端自己在回放期打标、自己读标以抑制重复渲染；内核不打此标记。
 * ⇒ 连接层不该有 "replayed" 事件；回放抑制由投影层读 _meta 键实现。
 */
export const EXT_META_KEY = {
  replayed: "nofy/replayed",
} as const;

/**
 * **有分派臂但实测调不通**的名（probe-session-shapes.ts，2026-09-09）。
 *
 * 「内核分派表里有」≠「可按显然参数调用」。三条实测结果：
 *   _nofy/session/state                     → Invalid params（参数形状未定）
 *   _nofy/session_summaries/session_list    → Invalid params（参数形状未定）
 *   _nofy/session/load_history              → **Method not found**（acp_agent.rs:1104
 *                                             有分派臂却回未找到，可能被特性门或前置条件挡住）
 * 用到之前必须先量出正确参数形状，不得凭 EXT_DISPATCH_ONLY 的存在就上线调用。
 */
export const EXT_UNVERIFIED_PARAMS = {
  sessionState: EXT_DISPATCH_ONLY.session_state,
  summariesSessionList: EXT_DISPATCH_ONLY.session_summaries_session_list,
  sessionLoadHistory: EXT_DISPATCH_ONLY.session_load_history,
} satisfies Record<string, ExtDispatchOnlyName>;

/**
 * 已**移除**的名与移除理由。留此表防止有人照旧文档把它们加回来。
 */
export const EXT_REMOVED = {
  replayed: "不是方法名，是 _meta 键（见 EXT_META_KEY）；内核全树无构造点",
  followUps:
    "_nofy/follow_ups 只在分派侧有名（内核接受该 ext 名）、无任何发射点；" +
    "旧账记载净化内核从不发出。分派≠发射。要接先用活体内核实测",
} as const;

/**
 * 扩展方法名归一化：幂等补 _nofy/ 前缀。
 * 内核分派表匹配的是**不带下划线**的名字（acp_agent.rs:1087 起：
 * "nofy/session/info" => …），前缀在路由前被剥离；**线上形必须带下划线**。
 *   "a/b" | "nofy/a/b" | "_nofy/a/b" → "_nofy/a/b"
 */
export function extMethodName(method: string): string {
  const m = String(method ?? "");
  if (m.startsWith("_nofy/")) return m;
  if (m.startsWith("nofy/")) return "_" + m;
  return "_nofy/" + m;
}

export type AgentMethod = (typeof AGENT_METHOD)[keyof typeof AGENT_METHOD];
export type ClientSideMethod = (typeof CLIENT_SIDE_METHOD)[keyof typeof CLIENT_SIDE_METHOD];
export type ExtEventName = (typeof EXT_EVENT)[keyof typeof EXT_EVENT];
export type ExtRequestName = (typeof EXT_REQUEST)[keyof typeof EXT_REQUEST];
export type ExtNotifyName = (typeof EXT_NOTIFY)[keyof typeof EXT_NOTIFY];
export type ExtServerRequestName = (typeof EXT_SERVER_REQUEST)[keyof typeof EXT_SERVER_REQUEST];
