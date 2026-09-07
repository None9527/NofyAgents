# 内核 ACP 通信面（机器提取参考件）

> 由 `desktop/scripts/extract-kernel-acp-surface.py` 生成；内核改动后重跑。
> 用途：P1b 的 ACP→v4 映射与后续能力点亮的**权威名字表**；不作阶段门槛。

## A. stdlib 点（nofy-acp-lib message.rs 枚举，全量）

### client → agent（10）

- `Initialize` — `acp::InitializeRequest`
- `Authenticate` — `acp::AuthenticateRequest`
- `NewSession` — `acp::NewSessionRequest`
- `LoadSession` — `acp::LoadSessionRequest`
- `SetSessionMode` — `acp::SetSessionModeRequest`
- `Prompt` — `acp::PromptRequest`
- `Cancel` — `acp::CancelNotification`
- `ExtMethod` — `acp::ExtRequest`
- `ExtNotification` — `acp::ExtNotification`
- `SetSessionModel` — `acp::SetSessionModelRequest`

### agent → client（11）

- `RequestPermission` — `acp::RequestPermissionRequest`
- `ReadTextFile` — `acp::ReadTextFileRequest`
- `WriteTextFile` — `acp::WriteTextFileRequest`
- `SessionNotification` — `acp::SessionNotification`
- `CreateTerminal` — `acp::CreateTerminalRequest`
- `TerminalOutput` — `acp::TerminalOutputRequest`
- `ReleaseTerminal` — `acp::ReleaseTerminalRequest`
- `WaitForTerminalExit` — `acp::WaitForTerminalExitRequest`
- `KillTerminalCommand` — `acp::KillTerminalRequest`
- `ExtMethod` — `acp::ExtRequest`
- `ExtNotification` — `acp::ExtNotification`

## B. `_nofy/*` 扩展名（crates 全树字面量，266 个）

| 线路名 | 字面量次数 | 在 agent 分派表 | 出现文件数 |
|---|---|---|---|
| `_nofy/announcements/update` | 5 | 否 | 4 |
| `_nofy/ask_user_question` | 5 | 否 | 4 |
| `_nofy/auth/` | 1 | 是 | 1 |
| `_nofy/auth/getBearerToken` | 1 | 否 | 1 |
| `_nofy/auth/info` | 2 | 否 | 2 |
| `_nofy/bashOutputNoColor` | 2 | 否 | 2 |
| `_nofy/btw` | 3 | 是 | 3 |
| `_nofy/bundle/` | 1 | 是 | 1 |
| `_nofy/bundle/entry/get` | 2 | 否 | 2 |
| `_nofy/bundle/status` | 2 | 否 | 2 |
| `_nofy/closeOutcome` | 3 | 否 | 2 |
| `_nofy/cloud_existing_workspace` | 15 | 否 | 3 |
| `_nofy/cloud_server_id` | 11 | 否 | 4 |
| `_nofy/code/` | 1 | 是 | 1 |
| `_nofy/code/find-definitions` | 1 | 否 | 1 |
| `_nofy/code/find-references` | 1 | 否 | 1 |
| `_nofy/code/goto-definition` | 1 | 否 | 1 |
| `_nofy/code/goto-references` | 1 | 否 | 1 |
| `_nofy/code/status` | 1 | 否 | 1 |
| `_nofy/codeNavigation` | 3 | 否 | 2 |
| `_nofy/commands/list` | 3 | 是 | 3 |
| `_nofy/compact_conversation` | 3 | 是 | 3 |
| `_nofy/debug/` | 1 | 是 | 1 |
| `_nofy/debug/agent` | 3 | 否 | 3 |
| `_nofy/debug/arm_auto_compact` | 1 | 否 | 1 |
| `_nofy/display_cwd` | 1 | 否 | 1 |
| `_nofy/exit_plan_mode` | 12 | 否 | 7 |
| `_nofy/facetFilters` | 15 | 否 | 4 |
| `_nofy/facets` | 1 | 否 | 1 |
| `_nofy/folderTrust` | 3 | 否 | 1 |
| `_nofy/folder_trust/request` | 2 | 否 | 2 |
| `_nofy/follow_ups` | 7 | 否 | 3 |
| `_nofy/fs/` | 1 | 否 | 1 |
| `_nofy/fs/delete_file` | 1 | 否 | 1 |
| `_nofy/fs/exists` | 1 | 否 | 1 |
| `_nofy/fs/index` | 1 | 否 | 1 |
| `_nofy/fs/index/delta` | 1 | 否 | 1 |
| `_nofy/fs/list` | 1 | 否 | 1 |
| `_nofy/fs/read_file` | 1 | 否 | 1 |
| `_nofy/fs/write_file` | 1 | 否 | 1 |
| `_nofy/fs_notify` | 3 | 是 | 3 |
| `_nofy/getApiKey` | 2 | 是 | 2 |
| `_nofy/git/` | 1 | 是 | 1 |
| `_nofy/git/branches` | 2 | 否 | 2 |
| `_nofy/git/checkout` | 2 | 否 | 2 |
| `_nofy/git/checkout_commit` | 1 | 否 | 1 |
| `_nofy/git/checkout_session_head` | 1 | 否 | 1 |
| `_nofy/git/commit` | 2 | 否 | 2 |
| `_nofy/git/current_commit` | 2 | 否 | 2 |
| `_nofy/git/diffs` | 1 | 否 | 1 |
| `_nofy/git/discard` | 2 | 否 | 2 |
| `_nofy/git/files` | 1 | 否 | 1 |
| `_nofy/git/git_repo_root` | 1 | 否 | 1 |
| `_nofy/git/info` | 2 | 否 | 2 |
| `_nofy/git/serialize_changes` | 1 | 否 | 1 |
| `_nofy/git/stage` | 2 | 否 | 2 |
| `_nofy/git/stage/content` | 2 | 否 | 2 |
| `_nofy/git/stash` | 2 | 否 | 2 |
| `_nofy/git/status` | 2 | 否 | 2 |
| `_nofy/git/unstage` | 2 | 否 | 2 |
| `_nofy/git/worktree/` | 1 | 是 | 1 |
| `_nofy/git/worktree/apply` | 1 | 否 | 1 |
| `_nofy/git/worktree/create` | 2 | 否 | 1 |
| `_nofy/git/worktree/create_from_worktree` | 2 | 否 | 1 |
| `_nofy/git/worktree/create_from_worktree_sync` | 3 | 否 | 2 |
| `_nofy/git/worktree/db/path` | 2 | 否 | 2 |
| `_nofy/git/worktree/db/rebuild` | 2 | 否 | 2 |
| `_nofy/git/worktree/db/stats` | 4 | 否 | 2 |
| `_nofy/git/worktree/gc` | 3 | 否 | 2 |
| `_nofy/git/worktree/list` | 4 | 否 | 2 |
| `_nofy/git/worktree/remove` | 3 | 否 | 2 |
| `_nofy/git/worktree/resume_session` | 3 | 否 | 2 |
| `_nofy/git/worktree/show` | 3 | 否 | 2 |
| `_nofy/git/worktree/status` | 1 | 否 | 1 |
| `_nofy/gitHeadChanged` | 3 | 否 | 3 |
| `_nofy/git_head_changed` | 4 | 否 | 4 |
| `_nofy/hooks` | 12 | 是 | 4 |
| `_nofy/hooks/` | 1 | 是 | 1 |
| `_nofy/hooks/action` | 2 | 否 | 2 |
| `_nofy/hooks/event` | 5 | 否 | 3 |
| `_nofy/hooks/list` | 2 | 否 | 2 |
| `_nofy/hooks/run` | 2 | 否 | 2 |
| `_nofy/hunk-tracker/` | 1 | 是 | 1 |
| `_nofy/hunk-tracker/all-action` | 1 | 否 | 1 |
| `_nofy/hunk-tracker/file-action` | 1 | 否 | 1 |
| `_nofy/hunk-tracker/get-all-file-contents` | 1 | 否 | 1 |
| `_nofy/hunk-tracker/get-files` | 1 | 否 | 1 |
| `_nofy/hunk-tracker/get-hunks` | 1 | 否 | 1 |
| `_nofy/hunk-tracker/get-summary` | 1 | 否 | 1 |
| `_nofy/hunk-tracker/hunk-action` | 1 | 否 | 1 |
| `_nofy/hunk-tracker/turn-action` | 1 | 否 | 1 |
| `_nofy/hunkTracker` | 6 | 否 | 3 |
| `_nofy/incrementalBashOutput` | 2 | 否 | 2 |
| `_nofy/interject` | 2 | 是 | 2 |
| `_nofy/internal/auth_cleared` | 3 | 否 | 3 |
| `_nofy/internal/evict_sessions` | 3 | 否 | 3 |
| `_nofy/internal/reload_all_mcp_servers` | 1 | 否 | 1 |
| `_nofy/internal/reload_models` | 2 | 否 | 2 |
| `_nofy/internal/reload_models_cache` | 1 | 否 | 1 |
| `_nofy/internal/reload_project_mcp_servers` | 1 | 否 | 1 |
| `_nofy/internal/reload_skills` | 1 | 否 | 1 |
| `_nofy/internal/reload_workflows` | 1 | 否 | 1 |
| `_nofy/leader/not_a_method` | 2 | 否 | 2 |
| `_nofy/leader/version_mismatch` | 7 | 否 | 4 |
| `_nofy/leaderClientId` | 3 | 否 | 2 |
| `_nofy/leader_reconnected` | 1 | 否 | 1 |
| `_nofy/limit` | 3 | 否 | 1 |
| `_nofy/listScope` | 7 | 否 | 3 |
| `_nofy/local_workspace` | 21 | 否 | 4 |
| `_nofy/log` | 1 | 否 | 1 |
| `_nofy/marketplace/` | 1 | 是 | 1 |
| `_nofy/marketplace/action` | 5 | 否 | 3 |
| `_nofy/marketplace/list` | 5 | 否 | 3 |
| `_nofy/mcp/` | 1 | 否 | 1 |
| `_nofy/mcp/auth_status` | 1 | 否 | 1 |
| `_nofy/mcp/auth_trigger` | 2 | 否 | 2 |
| `_nofy/mcp/call` | 1 | 否 | 1 |
| `_nofy/mcp/delete` | 2 | 否 | 2 |
| `_nofy/mcp/elicit` | 10 | 否 | 3 |
| `_nofy/mcp/elicit_complete` | 4 | 否 | 3 |
| `_nofy/mcp/init_progress` | 4 | 否 | 3 |
| `_nofy/mcp/list` | 3 | 否 | 3 |
| `_nofy/mcp/read_resource` | 1 | 否 | 1 |
| `_nofy/mcp/sdk` | 1 | 否 | 1 |
| `_nofy/mcp/sdk_call` | 1 | 否 | 1 |
| `_nofy/mcp/server_status` | 5 | 否 | 5 |
| `_nofy/mcp/servers` | 7 | 否 | 3 |
| `_nofy/mcp/servers_updated` | 3 | 否 | 3 |
| `_nofy/mcp/setup` | 2 | 否 | 2 |
| `_nofy/mcp/toggle` | 2 | 否 | 2 |
| `_nofy/mcp/toggle_tool` | 2 | 否 | 2 |
| `_nofy/mcp/tools_changed` | 5 | 否 | 4 |
| `_nofy/mcp/upsert` | 2 | 否 | 2 |
| `_nofy/mcp_initialized` | 7 | 否 | 4 |
| `_nofy/memory/flush` | 2 | 是 | 2 |
| `_nofy/memory/rewrite` | 3 | 是 | 3 |
| `_nofy/models/update` | 5 | 否 | 4 |
| `_nofy/monitor_event` | 5 | 否 | 4 |
| `_nofy/noop` | 1 | 否 | 1 |
| `_nofy/other` | 1 | 否 | 1 |
| `_nofy/partial` | 6 | 否 | 3 |
| `_nofy/permissions/reset` | 1 | 是 | 1 |
| `_nofy/persist` | 4 | 否 | 3 |
| `_nofy/pluginDirs` | 1 | 否 | 1 |
| `_nofy/plugins/` | 1 | 是 | 1 |
| `_nofy/plugins/action` | 3 | 否 | 2 |
| `_nofy/plugins/list` | 2 | 否 | 2 |
| `_nofy/plugins/notify-updates` | 3 | 否 | 3 |
| `_nofy/plugins/reload` | 2 | 是 | 2 |
| `_nofy/pr/` | 1 | 是 | 1 |
| `_nofy/pr/status` | 1 | 否 | 1 |
| `_nofy/prompt_history` | 3 | 是 | 3 |
| `_nofy/query` | 3 | 否 | 1 |
| `_nofy/queue/` | 1 | 是 | 1 |
| `_nofy/queue/bogus` | 2 | 否 | 2 |
| `_nofy/queue/changed` | 9 | 否 | 7 |
| `_nofy/queue/clear` | 5 | 否 | 3 |
| `_nofy/queue/edit` | 10 | 否 | 3 |
| `_nofy/queue/hold_edit` | 9 | 否 | 3 |
| `_nofy/queue/interject` | 10 | 否 | 3 |
| `_nofy/queue/release_edit` | 8 | 否 | 3 |
| `_nofy/queue/remove` | 8 | 否 | 3 |
| `_nofy/queue/reorder` | 5 | 否 | 3 |
| `_nofy/recap` | 2 | 是 | 2 |
| `_nofy/replayed` | 6 | 否 | 3 |
| `_nofy/restore_code` | 7 | 否 | 4 |
| `_nofy/rewind` | 1 | 是 | 1 |
| `_nofy/rewind/execute` | 2 | 否 | 2 |
| `_nofy/rewind/points` | 3 | 否 | 3 |
| `_nofy/rollout/survey` | 2 | 是 | 2 |
| `_nofy/runningPromptId` | 4 | 否 | 3 |
| `_nofy/s1` | 1 | 否 | 1 |
| `_nofy/scheduled_task_created` | 3 | 否 | 3 |
| `_nofy/scheduled_task_deleted` | 3 | 否 | 3 |
| `_nofy/scheduled_task_fired` | 4 | 否 | 3 |
| `_nofy/scheduled_task_inject_prompt` | 4 | 否 | 4 |
| `_nofy/scheduler/` | 1 | 是 | 1 |
| `_nofy/scheduler/delete` | 2 | 否 | 2 |
| `_nofy/schedulerBackgroundLoops` | 2 | 否 | 2 |
| `_nofy/schedulerGeneration` | 4 | 否 | 1 |
| `_nofy/schedulerRevision` | 5 | 否 | 1 |
| `_nofy/search/` | 1 | 是 | 1 |
| `_nofy/search/content` | 1 | 否 | 1 |
| `_nofy/search/content/status` | 1 | 否 | 1 |
| `_nofy/search/fuzzy/change` | 1 | 否 | 1 |
| `_nofy/search/fuzzy/close` | 1 | 否 | 1 |
| `_nofy/search/fuzzy/open` | 1 | 否 | 1 |
| `_nofy/search/fuzzy/status` | 4 | 否 | 1 |
| `_nofy/sess` | 1 | 否 | 1 |
| `_nofy/session` | 27 | 否 | 7 |
| `_nofy/session/add_local_workspace` | 2 | 是 | 2 |
| `_nofy/session/close` | 6 | 是 | 5 |
| `_nofy/session/delete` | 3 | 是 | 3 |
| `_nofy/session/fork` | 4 | 是 | 4 |
| `_nofy/session/import` | 1 | 是 | 1 |
| `_nofy/session/info` | 5 | 是 | 4 |
| `_nofy/session/interjection` | 5 | 否 | 4 |
| `_nofy/session/list` | 6 | 是 | 4 |
| `_nofy/session/load_history` | 1 | 是 | 1 |
| `_nofy/session/prompt_complete` | 6 | 是 | 4 |
| `_nofy/session/rehydrate` | 1 | 是 | 1 |
| `_nofy/session/rename` | 3 | 是 | 3 |
| `_nofy/session/repair` | 2 | 是 | 2 |
| `_nofy/session/resolve_local_for_worktree_resume` | 2 | 是 | 2 |
| `_nofy/session/search` | 4 | 是 | 4 |
| `_nofy/session/state` | 1 | 是 | 1 |
| `_nofy/session/update` | 60 | 是 | 24 |
| `_nofy/session/update_mcp_servers` | 2 | 是 | 2 |
| `_nofy/session/updates` | 4 | 是 | 2 |
| `_nofy/session/updates/chunk` | 1 | 否 | 1 |
| `_nofy/session/usage` | 4 | 是 | 4 |
| `_nofy/sessionConfig` | 2 | 否 | 2 |
| `_nofy/sessionDetail` | 1 | 否 | 1 |
| `_nofy/session_notification` | 43 | 否 | 24 |
| `_nofy/session_summaries/` | 2 | 是 | 2 |
| `_nofy/session_summaries/session_list` | 1 | 否 | 1 |
| `_nofy/session_summaries/workspace_list` | 1 | 否 | 1 |
| `_nofy/session_summaries/workspace_list_recent` | 1 | 否 | 1 |
| `_nofy/sessions/changed` | 2 | 否 | 2 |
| `_nofy/sessions/list` | 4 | 是 | 4 |
| `_nofy/setApiKey` | 2 | 是 | 2 |
| `_nofy/settings/update` | 9 | 否 | 6 |
| `_nofy/skills/` | 1 | 是 | 1 |
| `_nofy/skills/add` | 1 | 否 | 1 |
| `_nofy/skills/config` | 1 | 否 | 1 |
| `_nofy/skills/list` | 2 | 否 | 2 |
| `_nofy/skills/refresh-baseline` | 2 | 是 | 2 |
| `_nofy/skills/remove` | 1 | 否 | 1 |
| `_nofy/skills/reset` | 1 | 否 | 1 |
| `_nofy/skills/toggle` | 2 | 否 | 2 |
| `_nofy/skip_envrc` | 1 | 否 | 1 |
| `_nofy/statusLine` | 1 | 否 | 1 |
| `_nofy/subagent/` | 1 | 是 | 1 |
| `_nofy/subagent/cancel` | 4 | 否 | 4 |
| `_nofy/subagent/get` | 1 | 否 | 1 |
| `_nofy/subagent/list_running` | 1 | 否 | 1 |
| `_nofy/suggest` | 3 | 是 | 3 |
| `_nofy/suggestPrompt` | 3 | 是 | 3 |
| `_nofy/task/` | 1 | 是 | 1 |
| `_nofy/task/kill` | 5 | 否 | 4 |
| `_nofy/task/list` | 1 | 否 | 1 |
| `_nofy/task_backgrounded` | 14 | 否 | 7 |
| `_nofy/task_completed` | 15 | 否 | 9 |
| `_nofy/telemetry/multi_agent_apply` | 1 | 是 | 1 |
| `_nofy/telemetry/multi_agent_discard` | 1 | 是 | 1 |
| `_nofy/telemetry/multi_agent_followup` | 1 | 是 | 1 |
| `_nofy/telemetry/non_git_decision` | 1 | 是 | 1 |
| `_nofy/terminal/` | 1 | 是 | 1 |
| `_nofy/terminal/background` | 2 | 否 | 2 |
| `_nofy/terminal/create` | 1 | 否 | 1 |
| `_nofy/terminal/kill` | 1 | 否 | 1 |
| `_nofy/terminal/list` | 1 | 否 | 1 |
| `_nofy/terminal/output` | 1 | 否 | 1 |
| `_nofy/terminal/pty/create` | 1 | 否 | 1 |
| `_nofy/terminal/pty/input` | 1 | 是 | 1 |
| `_nofy/terminal/pty/load` | 1 | 否 | 1 |
| `_nofy/terminal/pty/notification` | 1 | 否 | 1 |
| `_nofy/terminal/pty/resize` | 1 | 否 | 1 |
| `_nofy/terminal/release` | 1 | 否 | 1 |
| `_nofy/terminal/wait_for_exit` | 1 | 否 | 1 |
| `_nofy/test` | 1 | 否 | 1 |
| `_nofy/toggle_plan_mode` | 2 | 是 | 2 |
| `_nofy/tool` | 4 | 否 | 2 |
| `_nofy/workflows/list` | 4 | 是 | 4 |
| `_nofy/wt-a` | 2 | 否 | 2 |
| `_nofy/yolo_mode_changed` | 5 | 是 | 5 |

## C. 与 PORTING-PLAN §2.2 的对账

- §2.2 提及而 crates 字面量未见（3）：`_nofy/internal/reload_`, `_nofy/memory/`, `_nofy/rewind/`
- crates 字面量有而 §2.2 未提及（216）：`_nofy/announcements/update`, `_nofy/ask_user_question`, `_nofy/auth/`, `_nofy/bashOutputNoColor`, `_nofy/bundle/`, `_nofy/bundle/entry/get`, `_nofy/bundle/status`, `_nofy/closeOutcome`, `_nofy/cloud_existing_workspace`, `_nofy/cloud_server_id`, `_nofy/code/`, `_nofy/code/find-definitions`, `_nofy/code/find-references`, `_nofy/code/goto-definition`, `_nofy/code/goto-references`, `_nofy/code/status`, `_nofy/codeNavigation`, `_nofy/debug/`, `_nofy/debug/agent`, `_nofy/debug/arm_auto_compact`, `_nofy/display_cwd`, `_nofy/exit_plan_mode`, `_nofy/facetFilters`, `_nofy/facets`, `_nofy/folderTrust`, `_nofy/folder_trust/request`, `_nofy/follow_ups`, `_nofy/fs/delete_file`, `_nofy/fs/exists`, `_nofy/fs/index`, `_nofy/fs/index/delta`, `_nofy/fs/list`, `_nofy/fs/read_file`, `_nofy/fs/write_file`, `_nofy/fs_notify`, `_nofy/git/branches`, `_nofy/git/checkout`, `_nofy/git/checkout_commit`, `_nofy/git/checkout_session_head`, `_nofy/git/commit`, `_nofy/git/current_commit`, `_nofy/git/diffs`, `_nofy/git/discard`, `_nofy/git/files`, `_nofy/git/git_repo_root`, `_nofy/git/info`, `_nofy/git/serialize_changes`, `_nofy/git/stage`, `_nofy/git/stage/content`, `_nofy/git/stash`, `_nofy/git/status`, `_nofy/git/unstage`, `_nofy/git/worktree/apply`, `_nofy/git/worktree/create`, `_nofy/git/worktree/create_from_worktree`, `_nofy/git/worktree/create_from_worktree_sync`, `_nofy/git/worktree/db/path`, `_nofy/git/worktree/db/rebuild`, `_nofy/git/worktree/db/stats`, `_nofy/git/worktree/gc`, `_nofy/git/worktree/list`, `_nofy/git/worktree/remove`, `_nofy/git/worktree/resume_session`, `_nofy/git/worktree/show`, `_nofy/git/worktree/status`, `_nofy/gitHeadChanged`, `_nofy/git_head_changed`, `_nofy/hooks`, `_nofy/hooks/action`, `_nofy/hooks/event`, `_nofy/hooks/list`, `_nofy/hooks/run`, `_nofy/hunk-tracker/all-action`, `_nofy/hunk-tracker/file-action`, `_nofy/hunk-tracker/get-all-file-contents`, `_nofy/hunk-tracker/get-files`, `_nofy/hunk-tracker/get-hunks`, `_nofy/hunk-tracker/get-summary`, `_nofy/hunk-tracker/hunk-action`, `_nofy/hunk-tracker/turn-action`, `_nofy/hunkTracker`, `_nofy/incrementalBashOutput`, `_nofy/internal/auth_cleared`, `_nofy/internal/evict_sessions`, `_nofy/internal/reload_all_mcp_servers`, `_nofy/internal/reload_models`, `_nofy/internal/reload_models_cache`, `_nofy/internal/reload_project_mcp_servers`, `_nofy/internal/reload_skills`, `_nofy/internal/reload_workflows`, `_nofy/leader/not_a_method`, `_nofy/leader/version_mismatch`, `_nofy/leaderClientId`, `_nofy/leader_reconnected`, `_nofy/limit`, `_nofy/listScope`, `_nofy/local_workspace`, `_nofy/log`, `_nofy/marketplace/action`, `_nofy/marketplace/list`, `_nofy/mcp/auth_status`, `_nofy/mcp/auth_trigger`, `_nofy/mcp/call`, `_nofy/mcp/elicit`, `_nofy/mcp/elicit_complete`, `_nofy/mcp/init_progress`, `_nofy/mcp/list`, `_nofy/mcp/read_resource`, `_nofy/mcp/sdk`, `_nofy/mcp/sdk_call`, `_nofy/mcp/server_status`, `_nofy/mcp/servers`, `_nofy/mcp/servers_updated`, `_nofy/mcp/setup`, `_nofy/mcp/toggle`, `_nofy/mcp/toggle_tool`, `_nofy/mcp/tools_changed`, `_nofy/mcp_initialized`, `_nofy/memory/flush`, `_nofy/memory/rewrite`, `_nofy/models/update`, `_nofy/monitor_event`, `_nofy/noop`, `_nofy/other`, `_nofy/partial`, `_nofy/permissions/reset`, `_nofy/persist`, `_nofy/pluginDirs`, `_nofy/plugins/action`, `_nofy/plugins/list`, `_nofy/plugins/notify-updates`, `_nofy/plugins/reload`, `_nofy/pr/`, `_nofy/query`, `_nofy/queue/bogus`, `_nofy/queue/changed`, `_nofy/queue/clear`, `_nofy/queue/edit`, `_nofy/queue/hold_edit`, `_nofy/queue/interject`, `_nofy/queue/release_edit`, `_nofy/queue/remove`, `_nofy/queue/reorder`, `_nofy/replayed`, `_nofy/restore_code`, `_nofy/rewind`, `_nofy/rewind/execute`, `_nofy/rewind/points`, `_nofy/rollout/survey`, `_nofy/runningPromptId`, `_nofy/s1`, `_nofy/scheduled_task_created`, `_nofy/scheduled_task_deleted`, `_nofy/scheduled_task_fired`, `_nofy/scheduled_task_inject_prompt`, `_nofy/scheduler/`, `_nofy/schedulerBackgroundLoops`, `_nofy/schedulerGeneration`, `_nofy/schedulerRevision`, `_nofy/search/content`, `_nofy/search/content/status`, `_nofy/search/fuzzy/change`, `_nofy/search/fuzzy/close`, `_nofy/search/fuzzy/open`, `_nofy/search/fuzzy/status`, `_nofy/sess`, `_nofy/session`, `_nofy/session/add_local_workspace`, `_nofy/session/interjection`, `_nofy/session/prompt_complete`, `_nofy/session/resolve_local_for_worktree_resume`, `_nofy/session/update`, `_nofy/sessionConfig`, `_nofy/sessionDetail`, `_nofy/session_notification`, `_nofy/session_summaries/session_list`, `_nofy/session_summaries/workspace_list_recent`, `_nofy/sessions/changed`, `_nofy/settings/update`, `_nofy/skills/add`, `_nofy/skills/config`, `_nofy/skills/list`, `_nofy/skills/refresh-baseline`, `_nofy/skills/remove`, `_nofy/skills/reset`, `_nofy/skills/toggle`, `_nofy/skip_envrc`, `_nofy/statusLine`, `_nofy/subagent/cancel`, `_nofy/subagent/get`, `_nofy/subagent/list_running`, `_nofy/suggestPrompt`, `_nofy/task/kill`, `_nofy/task/list`, `_nofy/task_backgrounded`, `_nofy/task_completed`, `_nofy/telemetry/multi_agent_apply`, `_nofy/telemetry/multi_agent_discard`, `_nofy/telemetry/multi_agent_followup`, `_nofy/telemetry/non_git_decision`, `_nofy/terminal/background`, `_nofy/terminal/create`, `_nofy/terminal/kill`, `_nofy/terminal/list`, `_nofy/terminal/output`, `_nofy/terminal/pty/create`, `_nofy/terminal/pty/load`, `_nofy/terminal/pty/notification`, `_nofy/terminal/pty/resize`, `_nofy/terminal/release`, `_nofy/terminal/wait_for_exit`, `_nofy/test`, `_nofy/toggle_plan_mode`, `_nofy/tool`, `_nofy/wt-a`, `_nofy/yolo_mode_changed`

注：分派表判定用整名字符串包含，format! 拼接或常量间接的线路会被低估；
「在 agent 分派表=否」仅表示未在 acp_agent.rs 以整名出现（可能是纯通知发射方）。
