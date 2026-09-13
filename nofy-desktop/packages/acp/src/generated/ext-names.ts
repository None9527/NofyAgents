/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * 源      : packages/acp/schema/kernel-ext-usage.json
 * 源 sha  : 7599594ddafbac19892055425b9053aa514d423cd3f92c08718b3c155d6cd8e4
 * 证据 sha: 7c6d1fed4a2d65b2c8a4e282067a71c7d0d05c6cfe64d0f8673618177ebca2a1
 * 生成器  : packages/acp/scripts/gen-ext-names.ts
 * 提取器  : packages/acp/scripts/extract-kernel-ext.ts（扫 /Users/mac/nofy-build/crates/codegen）
 *
 * 值一律带 _ 前缀（线上形）；键为去掉 nofy/ 前缀、/ 换 _ 的机械名。
 * 手写别名表（methods.ts）必须引用这里的值，不得写字面量。
 */

/** 客户端 → 内核，请求（等响应）（42 条） */
export const EXT_CLIENT_REQUEST = {
  btw: "_nofy/btw",
  bundle_entry_get: "_nofy/bundle/entry/get",
  bundle_status: "_nofy/bundle/status",
  commands_list: "_nofy/commands/list",
  compact_conversation: "_nofy/compact_conversation",
  git_worktree_create_from_worktree_sync: "_nofy/git/worktree/create_from_worktree_sync",
  git_worktree_resume_session: "_nofy/git/worktree/resume_session",
  hooks_action: "_nofy/hooks/action",
  hooks_list: "_nofy/hooks/list",
  interject: "_nofy/interject",
  marketplace_action: "_nofy/marketplace/action",
  marketplace_list: "_nofy/marketplace/list",
  mcp_auth_trigger: "_nofy/mcp/auth_trigger",
  mcp_delete: "_nofy/mcp/delete",
  mcp_list: "_nofy/mcp/list",
  mcp_setup: "_nofy/mcp/setup",
  mcp_toggle: "_nofy/mcp/toggle",
  mcp_toggle_tool: "_nofy/mcp/toggle_tool",
  mcp_upsert: "_nofy/mcp/upsert",
  memory_rewrite: "_nofy/memory/rewrite",
  plugins_action: "_nofy/plugins/action",
  plugins_list: "_nofy/plugins/list",
  prompt_history: "_nofy/prompt_history",
  recap: "_nofy/recap",
  rewind_execute: "_nofy/rewind/execute",
  rewind_points: "_nofy/rewind/points",
  scheduler_delete: "_nofy/scheduler/delete",
  session_delete: "_nofy/session/delete",
  session_fork: "_nofy/session/fork",
  session_info: "_nofy/session/info",
  session_list: "_nofy/session/list",
  session_rename: "_nofy/session/rename",
  session_search: "_nofy/session/search",
  session_usage: "_nofy/session/usage",
  sessions_list: "_nofy/sessions/list",
  skills_list: "_nofy/skills/list",
  skills_toggle: "_nofy/skills/toggle",
  subagent_cancel: "_nofy/subagent/cancel",
  suggest: "_nofy/suggest",
  task_kill: "_nofy/task/kill",
  terminal_background: "_nofy/terminal/background",
  workflows_list: "_nofy/workflows/list",
} as const;

/** 客户端 → 内核，通知（fire-and-forget，**不等响应**）（9 条） */
export const EXT_CLIENT_NOTIFICATION = {
  queue_clear: "_nofy/queue/clear",
  queue_edit: "_nofy/queue/edit",
  queue_hold_edit: "_nofy/queue/hold_edit",
  queue_interject: "_nofy/queue/interject",
  queue_release_edit: "_nofy/queue/release_edit",
  queue_remove: "_nofy/queue/remove",
  queue_reorder: "_nofy/queue/reorder",
  toggle_plan_mode: "_nofy/toggle_plan_mode",
  yolo_mode_changed: "_nofy/yolo_mode_changed",
} as const;

/** 内核 → 客户端，请求（**必须应答**，否则内核悬挂或 fail-closed）（3 条） */
export const EXT_KERNEL_REQUEST = {
  ask_user_question: "_nofy/ask_user_question",
  exit_plan_mode: "_nofy/exit_plan_mode",
  folder_trust_request: "_nofy/folder_trust/request",
} as const;

/** 内核 → 客户端，事件通知（22 条） */
export const EXT_KERNEL_EVENT = {
  announcements_update: "_nofy/announcements/update",
  fs_index: "_nofy/fs/index",
  fs_index_delta: "_nofy/fs/index/delta",
  fs_notify: "_nofy/fs_notify",
  git_worktree_status: "_nofy/git/worktree/status",
  git_head_changed: "_nofy/git_head_changed",
  mcp_tools_changed: "_nofy/mcp/tools_changed",
  mcp_initialized: "_nofy/mcp_initialized",
  models_update: "_nofy/models/update",
  monitor_event: "_nofy/monitor_event",
  scheduled_task_created: "_nofy/scheduled_task_created",
  scheduled_task_deleted: "_nofy/scheduled_task_deleted",
  scheduled_task_fired: "_nofy/scheduled_task_fired",
  scheduled_task_inject_prompt: "_nofy/scheduled_task_inject_prompt",
  session_interjection: "_nofy/session/interjection",
  session_prompt_complete: "_nofy/session/prompt_complete",
  session_update: "_nofy/session/update",
  session_updates_chunk: "_nofy/session/updates/chunk",
  session_notification: "_nofy/session_notification",
  settings_update: "_nofy/settings/update",
  task_backgrounded: "_nofy/task_backgrounded",
  task_completed: "_nofy/task_completed",
} as const;

/** 仅以枚举访问器/常量出现：真实存在，但发送点经间接构造，无字面量 ExtRequest/ExtNotification::new（28 条） */
export const EXT_INDIRECT = {
  hooks_event: "_nofy/hooks/event",
  hooks_run: "_nofy/hooks/run",
  internal_auth_cleared: "_nofy/internal/auth_cleared",
  internal_evict_sessions: "_nofy/internal/evict_sessions",
  internal_reload_all_mcp_servers: "_nofy/internal/reload_all_mcp_servers",
  internal_reload_models: "_nofy/internal/reload_models",
  internal_reload_models_cache: "_nofy/internal/reload_models_cache",
  internal_reload_project_mcp_servers: "_nofy/internal/reload_project_mcp_servers",
  internal_reload_skills: "_nofy/internal/reload_skills",
  internal_reload_workflows: "_nofy/internal/reload_workflows",
  local_workspace: "_nofy/local_workspace",
  log: "_nofy/log",
  mcp_: "_nofy/mcp/",
  mcp_auth_status: "_nofy/mcp/auth_status",
  mcp_call: "_nofy/mcp/call",
  mcp_elicit: "_nofy/mcp/elicit",
  mcp_elicit_complete: "_nofy/mcp/elicit_complete",
  mcp_init_progress: "_nofy/mcp/init_progress",
  mcp_read_resource: "_nofy/mcp/read_resource",
  mcp_sdk: "_nofy/mcp/sdk",
  mcp_sdk_call: "_nofy/mcp/sdk_call",
  mcp_server_status: "_nofy/mcp/server_status",
  mcp_servers: "_nofy/mcp/servers",
  mcp_servers_updated: "_nofy/mcp/servers_updated",
  queue_changed: "_nofy/queue/changed",
  sessions_changed: "_nofy/sessions/changed",
  terminal_pty_notification: "_nofy/terminal/pty/notification",
  tool: "_nofy/tool",
} as const;

/** 仅分派侧有证据：内核 match 臂接受该精确名，但全树无字面量构造点（第一方经常量/helper 发）。**仍是真请求**（82 条） */
export const EXT_DISPATCH_ONLY = {
  auth_info: "_nofy/auth/info",
  code_status: "_nofy/code/status",
  debug_agent: "_nofy/debug/agent",
  debug_arm_auto_compact: "_nofy/debug/arm_auto_compact",
  follow_ups: "_nofy/follow_ups",
  fs_delete_file: "_nofy/fs/delete_file",
  fs_exists: "_nofy/fs/exists",
  fs_list: "_nofy/fs/list",
  fs_read_file: "_nofy/fs/read_file",
  fs_write_file: "_nofy/fs/write_file",
  git_branches: "_nofy/git/branches",
  git_checkout: "_nofy/git/checkout",
  git_checkout_commit: "_nofy/git/checkout_commit",
  git_checkout_session_head: "_nofy/git/checkout_session_head",
  git_commit: "_nofy/git/commit",
  git_current_commit: "_nofy/git/current_commit",
  git_diffs: "_nofy/git/diffs",
  git_discard: "_nofy/git/discard",
  git_files: "_nofy/git/files",
  git_git_repo_root: "_nofy/git/git_repo_root",
  git_info: "_nofy/git/info",
  git_serialize_changes: "_nofy/git/serialize_changes",
  git_stage: "_nofy/git/stage",
  git_stage_content: "_nofy/git/stage/content",
  git_stash: "_nofy/git/stash",
  git_status: "_nofy/git/status",
  git_unstage: "_nofy/git/unstage",
  git_worktree_apply: "_nofy/git/worktree/apply",
  git_worktree_create: "_nofy/git/worktree/create",
  git_worktree_create_from_worktree: "_nofy/git/worktree/create_from_worktree",
  git_worktree_db_path: "_nofy/git/worktree/db/path",
  git_worktree_db_rebuild: "_nofy/git/worktree/db/rebuild",
  git_worktree_db_stats: "_nofy/git/worktree/db/stats",
  git_worktree_gc: "_nofy/git/worktree/gc",
  git_worktree_list: "_nofy/git/worktree/list",
  git_worktree_remove: "_nofy/git/worktree/remove",
  git_worktree_show: "_nofy/git/worktree/show",
  leader_version_mismatch: "_nofy/leader/version_mismatch",
  leader_reconnected: "_nofy/leader_reconnected",
  mcp_elicit: "_nofy/mcp/elicit",
  mcp_elicit_complete: "_nofy/mcp/elicit_complete",
  mcp_init_progress: "_nofy/mcp/init_progress",
  mcp_servers_updated: "_nofy/mcp/servers_updated",
  memory_flush: "_nofy/memory/flush",
  plugins_reload: "_nofy/plugins/reload",
  pr_status: "_nofy/pr/status",
  queue_changed: "_nofy/queue/changed",
  rollout_survey: "_nofy/rollout/survey",
  search_content: "_nofy/search/content",
  search_fuzzy_change: "_nofy/search/fuzzy/change",
  search_fuzzy_close: "_nofy/search/fuzzy/close",
  search_fuzzy_open: "_nofy/search/fuzzy/open",
  session_add_local_workspace: "_nofy/session/add_local_workspace",
  session_close: "_nofy/session/close",
  session_import: "_nofy/session/import",
  session_load_history: "_nofy/session/load_history",
  session_rehydrate: "_nofy/session/rehydrate",
  session_repair: "_nofy/session/repair",
  session_resolve_local_for_worktree_resume: "_nofy/session/resolve_local_for_worktree_resume",
  session_state: "_nofy/session/state",
  session_update_mcp_servers: "_nofy/session/update_mcp_servers",
  session_updates: "_nofy/session/updates",
  session_summaries_session_list: "_nofy/session_summaries/session_list",
  session_summaries_workspace_list: "_nofy/session_summaries/workspace_list",
  session_summaries_workspace_list_recent: "_nofy/session_summaries/workspace_list_recent",
  sessions_changed: "_nofy/sessions/changed",
  skills_add: "_nofy/skills/add",
  skills_config: "_nofy/skills/config",
  skills_remove: "_nofy/skills/remove",
  skills_reset: "_nofy/skills/reset",
  subagent_get: "_nofy/subagent/get",
  subagent_list_running: "_nofy/subagent/list_running",
  task_list: "_nofy/task/list",
  terminal_create: "_nofy/terminal/create",
  terminal_kill: "_nofy/terminal/kill",
  terminal_list: "_nofy/terminal/list",
  terminal_output: "_nofy/terminal/output",
  terminal_pty_create: "_nofy/terminal/pty/create",
  terminal_pty_load: "_nofy/terminal/pty/load",
  terminal_pty_resize: "_nofy/terminal/pty/resize",
  terminal_release: "_nofy/terminal/release",
  terminal_wait_for_exit: "_nofy/terminal/wait_for_exit",
} as const;

/** 仅通知侧分派有证据：内核 ext_notification 体内以比较式接受，**无响应构造点 ⇒ 必须用 notify() 发**（用 rpc() 发得 -32601，实测 terminal/pty/input）（6 条） */
export const EXT_DISPATCH_NOTIFY = {
  permissions_reset: "_nofy/permissions/reset",
  telemetry_multi_agent_apply: "_nofy/telemetry/multi_agent_apply",
  telemetry_multi_agent_discard: "_nofy/telemetry/multi_agent_discard",
  telemetry_multi_agent_followup: "_nofy/telemetry/multi_agent_followup",
  telemetry_non_git_decision: "_nofy/telemetry/non_git_decision",
  terminal_pty_input: "_nofy/terminal/pty/input",
} as const;

/** 内核经 emit_client_ext 助手推送的事件（内核 → 客户端通知，无构造点字面量）（2 条） */
export const EXT_EMIT_CLIENT = {
  search_content_status: "_nofy/search/content/status",
  search_fuzzy_status: "_nofy/search/fuzzy/status",
} as const;

/** 被内核侧优先规则从客户端桶移出的名（两侧都有构造点，需人工复核）。 */
export const EXT_SIDE_SUPPRESSED = ["nofy/session/update"] as const;

export type ExtClientRequestName = (typeof EXT_CLIENT_REQUEST)[keyof typeof EXT_CLIENT_REQUEST];
export type ExtClientNotificationName = (typeof EXT_CLIENT_NOTIFICATION)[keyof typeof EXT_CLIENT_NOTIFICATION];
export type ExtKernelRequestName = (typeof EXT_KERNEL_REQUEST)[keyof typeof EXT_KERNEL_REQUEST];
export type ExtKernelEventName = (typeof EXT_KERNEL_EVENT)[keyof typeof EXT_KERNEL_EVENT];
export type ExtIndirectName = (typeof EXT_INDIRECT)[keyof typeof EXT_INDIRECT];
export type ExtDispatchOnlyName = (typeof EXT_DISPATCH_ONLY)[keyof typeof EXT_DISPATCH_ONLY];
export type ExtDispatchNotifyName = (typeof EXT_DISPATCH_NOTIFY)[keyof typeof EXT_DISPATCH_NOTIFY];
export type ExtEmitClientName = (typeof EXT_EMIT_CLIENT)[keyof typeof EXT_EMIT_CLIENT];
export type ExtWireName =
  | ExtClientRequestName | ExtClientNotificationName | ExtKernelRequestName | ExtKernelEventName | ExtIndirectName | ExtDispatchOnlyName | ExtDispatchNotifyName | ExtEmitClientName;
export const EXT_EVIDENCE_SHA256 = "7599594ddafbac19892055425b9053aa514d423cd3f92c08718b3c155d6cd8e4";
