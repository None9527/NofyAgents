# Nofy Desktop 移植方案（ZCode UI → nofy 内核）

状态：**调研定稿（待批准）**— 5 路测绘 + 活体探针全部完成，动代码前的唯一依据
分支：二次开发分支 · 基线 cb2ab75（去品牌完成）
日期：2026-08-28（2026-08-29 增补：新增阶段 A0 前端源码化——B5 全量解码收官后、
阶段 A 之前执行，把逐字重建产物转为模块化真源码工程；见 §5 阶段 A0）

---

## 0. 既定方针（不可动摇）

1. **内核零改动**。nofy 内核（`~/.local/bin/nofy`，v0.2.121）的稳定性远高于前端。
   内核的原生协议是 ACP（JSON-RPC over WebSocket / stdio），配置唯一来源是 `~/.nofy/config.toml`。
2. **前端动大刀**。借用逆向得到的 ZCode 3.7.6 桌面 UI 套在内核上；逐步改写其 IPC 与协议层，
   让前端直接说内核的原生 ACP。这是"移植"，不是"硬适配"。
3. **消灭 ZCode 协议语义**。最终代码里不应存在 "ZCode IPC / ZCode 协议" 这一层概念：
   `ZCodeProtocolClient`、`ZCodeStdioTransport`、`ZCodeAgentProcessManager`、ndjson v4 信封全部拆除。
4. **单一配置**。只有 `~/.nofy/config.toml`。不存在 setting.json、不存在 `~/.nofy/v2/config.json`
   镜像。桌面私有的 UI 状态写 config.toml 的 `[desktop]` 段（内核已声明该段"owned by
   nofy-desktop, opaque to the CLI agent"，见 `crates/codegen/nofy-shell/src/agent/config.rs`）。
5. **不留翻译进程**。当前的 `out/main/seam/acp-agent-adapter.js`（ZCode 协议 ↔ ACP 翻译器）
   是临时脚手架，必须随移植删除——"用 bridge 纯在埋雷"。

---

## 1. 调研方法与依据

| 途径 | 内容 |
|---|---|
| 进程/IPC 探查（子代理 + 实测） | 主进程→host→renderer 拓扑；MessagePort 二进制 RPC 帧格式；31 个 host 服务通道清单 |
| ZCode 协议层审计（子代理） | v4/legacy 方法全表、envelope 格式、renderer 实际调用面、adapter 已实现/桩对照 |
| 内核 ACP 源码测绘（子代理 ✅） | Rust 侧方法/通知/权限/会话存储/配置 schema（§2 已并入） |
| 服务+配置+门槛测绘（子代理 ✅×2，双份交叉验证） | 模型门槛条件、provider 存储、setting.json 键、存储分工（§2.7/§2.8 已并入） |
| 登录与云依赖清点（子代理 ✅） | 认证/权益/引导/云依赖全量清点：全部已本地化或惰性，唯一硬阻塞是模型门槛（§2.7 已并入） |
| **活体 ACP 探针**（本会话实测，可复跑） | `desktop/scripts/acp-probe*.mjs` 对 9803 端口真实内核逐方法探测 |
| 内核源码直查 | `crates/codegen/nofy-shell/src/agent/mvp_agent/acp_agent.rs` 扩展方法分派表；`agent-client-protocol-0.10.4` crate 线路名表 |
| 复原账本（前序工作 D5b/D5c 的删改记录） | `src-reconstructed/modules/DELETED-CLOUD-LEDGER.md`（云联路净删 ~30,500 行）、`D5C-WIRING-LEDGER.md`、`DEBRAND-LEDGER.md` |

---

## 2. 实测地面真相（live kernel v0.2.121，端口 9803 实测）

### 2.1 标准 ACP 面（客户端 → 内核）

| 线路名 | 类型 | 实测结果 |
|---|---|---|
| `initialize` | request | ✅ 返回 `agentCapabilities`（loadSession、sessionCapabilities.list/resume/close、auth）、`authMethods=[{id:"api_key"}]`、`_meta.modelState`（完整模型表）、`_meta.availableCommands`（compact / always-approve / context / session-info / deep-research / workflow / goal）、`_meta.cancelRewind=true`、`_meta.sessionRecap=true`、`agentVersion` |
| `authenticate` | request | 存在；仅支持 `api_key`（"NOFY_API_KEY or api_key/env_key in config.toml"）。**无 OAuth** |
| `session/new` | request | ✅ `_meta` 含 `isGitRepo/gitRoot/codebaseIndexed`、**`nofy/sessionConfig.options`**（模型选择项，含 selected 标记——UI 模型选择器直接渲染它）、`nofy/sessionDetail` |
| `session/load` | request | ✅ 需要 `{sessionId, cwd, mcpServers}`；**响应前**先把持久转录以 `session/update` / `_nofy/session/update` 流回放（rewind 死分支已过滤），`_meta.noReplay:true` 可抑制。`_meta["nofy/replayed"]` 是 TUI 客户端自己的约定，内核不打此标记 |
| `session/list` | request | ✅ 全量或按 cwd；条目含 title/updatedAt/`_meta["nofy/session"].kind` |
| `session/prompt` | request | ✅ 流式 `session/update`；响应含 `stopReason` 与 `_meta{requestId, totalTokens, modelId, cancellationCategory}` |
| **`session/cancel`** | **notification（无 id！）** | ✅ 实测 +4s 发送通知，12ms 内 prompt 以 `stopReason:"cancelled"` 收尾。**作为 request 发送会得到 -32601**——当前 adapter 正是这么错的（见 §2.5） |
| `session/set_model` | request | ✅ 接受模型名（如 `qwen3.8-max`），回 `_meta.model.Ok`，并推送 `_nofy/session_notification{sessionUpdate:"model_changed"}` |
| `session/set_mode` | request | ✅ modeId ∈ `default`/`plan`（对不存在的会话会挂起——只可对活跃会话调用） |
| `session/set_config_option` | — | **内核未实现**（trait 默认 → method_not_found）。选项切换走 `session/set_model` 与 `_meta` 参数 |
| `session/resume` / `session/close` | request | ✅ resume 从不回放；close 回 `_meta["nofy/closeOutcome"]` 并推 `_nofy/sessions/changed{removed:[…]}` |
| `session/fork` / `logout` | — | **未实现**；fork 走扩展 `_nofy/session/fork` |
| `authenticate` 补充 | request | methodId ∈ `api_key` / `cached_token`；返回 `_meta{email, authMode, teamId, …}` |

**initialize 请求侧要点**（源码 `acp_agent.rs:100-108, 351-413`）：
- `_meta.clientIdentifier` 应发 **`"nofy-desktop"`**（内核认识该标识；Generic 客户端的
  权限选项集更窄，Desktop/TUI 类型拿到更丰富的 bash 作用域选项）。
- `session/new _meta` 支持：`sessionId`（客户端给 UUID）、`modelId`（建会话即指定模型）、
  `yoloMode` / `autoMode`（权限模式）、`sessionKind` 仅接受 `"headless"`。

### 2.2 内核扩展方法（`_nofy/*`，线上全部带下划线前缀，双向）

实测存在：`_nofy/session_summaries/workspace_list`（按工作区分组的会话摘要：
`session_summary/created_at/updated_at/num_messages/current_model_id`…）。

源码分派表（`acp_agent.rs:1088-1229`）确认的完整扩展族（择要，均为 camelCase JSON）：

- **会话生命周期**：`nofy/session/info`（模型/轮次/上下文用量）、`nofy/session/close`、
  `nofy/session/list`（统一列表，支持 query/cursor/facetFilters）、`nofy/sessions/list`
  （**活体 roster**：activity ∈ working|idle|needs_input|dormant|completed|dead）、
  `nofy/session/rename`（支持 resetToAuto）、`nofy/session/delete`、**`nofy/session/fork`**、
  `nofy/session/update_mcp_servers`、`nofy/session/state`、`nofy/session/import`、
  `nofy/session/repair`、`nofy/session/usage`、`nofy/session/rehydrate`
- **历史/回放**：`nofy/session/updates`（随机访问回放：offset/limit/turnIndex/stream→
  `_nofy/session/updates/chunk`）、`nofy/session/load_history`、`nofy/session/search`
- **摘要**：`nofy/session_summaries/{session_list, workspace_list, workspace_list_recent}`
- **回合中交互**：`nofy/interject`（插话）、`nofy/btw`（旁路问答）、`nofy/recap`
- **队列**（通知形式，§2.3）：`nofy/queue/{remove,reorder,clear,edit,interject,hold_edit,release_edit}`
- **模型/认证**：`nofy/getApiKey`/`nofy/setApiKey`（写 auth.json）、`nofy/auth/info`、
  `nofy/auth/getBearerToken`
- **MCP**：`nofy/mcp/{list,setup,toggle,toggle_tool,auth_status,auth_trigger,call,elicit}`、
  **`nofy/mcp/upsert` / `nofy/mcp/delete`（直接持久化到 config.toml 的 `[mcp_servers.*]`）**
- **git/worktree/PR**：`nofy/git/*`（status/stage/commit/checkout/stash/diffs…）、
  `nofy/git/worktree/*`、`nofy/pr/status`、`nofy/hunk-tracker/*`
- **任务/子代理**：`nofy/task/{kill,list}`、`nofy/scheduler/delete`、
  `nofy/subagent/{cancel,get,list_running}`
- **文件系统/终端（内核侧执行，不依赖客户端能力）**：`nofy/fs/{list,exists,read_file,
  write_file,delete_file}`、`nofy/terminal/*`（含交互式 `pty/*`，输入走
  `_nofy/terminal/pty/input` 通知）
- **其他**：`nofy/plugins/{list,action,reload}`、`nofy/marketplace/*`、`nofy/hooks/*`、
  `nofy/skills/*`、`nofy/workflows/list`、`nofy/commands/list`、`nofy/memory/{flush,rewrite}`、
  `nofy/compact_conversation`、`nofy/rewind/{execute,points}`、`nofy/search/*`、
  `nofy/prompt_history`、`nofy/suggest`、`nofy/internal/reload_*`（模型/MCP/skills 热重载）

### 2.3 内核 → 客户端（host 必须实现的"客户端侧"）

| 线路名 | 类型 | 说明 |
|---|---|---|
| `session/update` | notification | 主流式通道。`sessionUpdate` 种类：`user_message_chunk` / `agent_message_chunk` / `agent_thought_chunk`（text 块）、`tool_call` / `tool_call_update`（toolCallId/title/kind/status/content/locations）、`plan`、`available_commands_update`、`current_mode_update`（default/plan）、`session_info_update`（标题生成/改名） |
| `_nofy/session_notification` + 持久轨 `_nofy/session/update` | notification | 扩展事件（snake_case 标签，60+ 种）：`model_changed`、`hook_execution`、`auto_compact_*`、`subagent_spawned/progress/finished`、`pending_interaction`、`interaction_resolved`、`session_summary_generated`、`rewind_marker`、**`turn_completed{promptId, stopReason, usage}`（持久的回合结束信号；`_nofy/session/prompt_complete` 是内核标注 legacy 的旧双生，重连场景应依赖 turn_completed）** 等 |
| `_nofy/sessions/changed` | notification | `{upserted:[RosterEntry], removed:[sessionId]}` 活体会话索引增量 |
| `_nofy/queue/changed` | notification | 队列全量条目 + runningPrompt 状态 |
| `_nofy/models/update` | notification | 完整 `SessionModelState`（config.toml 热重载后推送） |
| `_nofy/settings/update` | notification | `{tips, slashCommandTags, autoPermissionModeEnabled}`（config 热重载后推送） |
| `_nofy/announcements/update`、`_nofy/git_head_changed`、`_nofy/task_*`、`_nofy/monitor_event`、`_nofy/session/interjection` | notification | 杂项事件 |
| `_nofy/mcp/servers_updated` / `init_progress` / `tools_changed` / `server_status` / `_nofy/mcp_initialized` | notification | MCP 生命周期（服务器来自 config.toml） |
| `session/request_permission` | **request（需应答）** | `{sessionId, toolCall, options:[{optionId, name, kind: allow_once\|allow_always\|reject_once\|reject_always}]}` → 应答 `{outcome:{outcome:"selected", optionId}}` 或 `{outcome:{outcome:"cancelled"}}`。**收到 session/cancel 时必须把所有挂起权限请求应答为 cancelled** |
| `_nofy/ask_user_question` | request | 多选问答；应答 `{outcome:"accepted", answers}` 等 |
| `_nofy/exit_plan_mode` | request | 计划模式退出审批；应答 `{outcome:"approved"\|"cancelled"\|"abandoned", feedback?}` |
| `fs/read_text_file` / `fs/write_text_file` | request | 仅当 clientCapabilities.fs 声明为 true 才会委托；**桌面建议声明 false，内核会用本地实现** |
| `terminal/*`（create/output/release/wait_for_exit/kill） | request | 同上；不声明则内核自管。交互式 PTY 另有 `nofy/terminal/pty/*` 扩展 |
| `session/elicitation` / `_nofy/mcp/elicit` | request | 表单追问 / MCP 表单 |
| `_nofy/mcp/sdk_call` | request | 进程内 SDK MCP 传输（`initialize._meta["nofy/mcp/sdk"]` 声明时） |
| 阻塞 hooks | request | `_meta["nofy/hooks"]`：`pre_tool_use/stop/subagent_stop`，decisions `deny/block` |

**⚠ 单客户端约束（架构级）**：serve 模式下，内核把出站通知只转发给**当前连着的那条
WS**（`server.rs:314-334`）；第二条并发连接会抢走/丢失事件流。⇒ 桌面的 ACP 连接
**必须是全局单例**（见 §3），多窗口在单例之上复用，不能每窗口各连一条。

### 2.4 配置真相

- 唯一配置：`~/.nofy/config.toml`。顶层段（`agent/config.rs:1055+`）：
  `[models]` `[model.<name>]` `[ui]` `[mcp_servers.*]` `[plugins]` `[permission]` `[tools]`
  `[agent]` `[subagents]` `[memory]` `[session]` `[skills]` `[auth]` `[endpoints]`
  `[worktree]` `[goal]` `[workflows]` `[compat]` `[paths]` `[cli]` `[hub]` `[sandbox]`
  `[hints]` **`[desktop]`（内核声明归桌面所有）** 等。
- **内核没有任何配置读写 RPC**（`config/get`、`_nofy/config/*`、`models/list` 全部 -32601）。
  ⇒ 设置界面必须直接读写 config.toml 文件。
- **内核热重载 config.toml**（fsnotify watcher，`config/watcher.rs:69-90`）：文件落盘后
  自动生效，并推送 `_nofy/settings/update` / `_nofy/models/update`。**改配置无需重启内核**。
- 仅有的两个 RPC 驱动写入：`nofy/setApiKey`（写 auth.json）、`nofy/mcp/upsert|delete`
  （写 `[mcp_servers.*]`）——MCP 管理界面应优先走这两个 RPC，其余设置走文件编辑。
- 模型表由内核从 `[models].default` + `[model.*]` 解析，经 `initialize._meta.modelState` /
  `session/new`、`session/load` 响应 / `_nofy/models/update` 下发；**桌面不需要也不应该
  维护自己的模型注册表**。模型选择三个控制点：建会话 `_meta.modelId`、
  `session/set_model`（可带 `_meta.reasoningEffort`）、`[models].default`。
  当前首页"当前没有可用模型"的门槛是 host 侧 ZCode provider 注册表
  （`~/.nofy/v2/config.json`）为空所致——拆除该注册表、改读内核 modelState 即自然消失。
- `[ui]` 段键虽多（theme/vim_mode/show_timestamps…），**只有 `permission_mode`
  （always-approve/auto/ask/default）改变内核行为**；其余是 TUI 渲染旋钮，桌面忽略即可，
  桌面自己的 UI 偏好写 `[desktop]`。运行时切换权限模式另有
  `_nofy/yolo_mode_changed` 通知与 `session/new _meta.yoloMode/autoMode`。
- TUI 写 config 的方式是 `toml_edit` 文档级编辑（`crates/codegen/nofy-pager/src/config_toml_edit.rs`，
  保留注释/格式）。桌面侧需要 JS 等价物（见 §6 风险）。

### 2.5 当前脚手架的已证实缺陷（拆除动机）

1. **停止按钮是坏的**：`seam/acp-client.js:196` 把 `session/cancel` 当 request 发，
   内核回 -32601，且 `catch {}` 静默吞掉。正确做法是 notification。
2. `session/read`、`plugins/list` 等 ZCode 语义方法在内核侧不存在，adapter 用静态桩冒充，
   UI 得到的是假数据（如插件永远为空）。
3. 双配置轨道（`~/.nofy/v2/config.json` provider 镜像 + setting.json）与 config.toml 并存，
   设置界面改的不是内核真正读取的配置。
4. 模型门槛读的是 ZCode provider 注册表而非内核 modelState，导致首页报"没有可用模型"，
   而内核明明有 4 个可用模型（grok-4.5 内置 + dashscope/qwen-coder/glm-5.2 来自 config.toml）。

### 2.6 进程拓扑与移植边界（已实测）

```
main (Electron)
 ├─ host = utilityProcess(out/host/index.js)   ← 移植手术区（反混淆，~15500 恢复符号）
 │    ├─ 31 个服务经 MessagePort 二进制 RPC 暴露给 renderer
 │    └─ 现经 ZCODE_AGENT_SERVER_COMMAND 派生 adapter 子进程 ← 要拆
 ├─ scheduler = utilityProcess（cron）
 └─ renderer（757 个 minified chunk，无符号）  ← 第一阶段不动
```

- renderer ↔ host 走 VS Code 风格二进制 RPC（13 字节帧头，通道名 + call/listen）。
  renderer 是压缩产物，改它代价极高；**host 是唯一合理的手术面**。
- 策略：保持 renderer 的通道契约不变，把 host 服务的实现逐个换成"直连内核 ACP + 直读
  config.toml"，最后拆掉 ZCode 协议层与 adapter。

### 2.7 模型门槛的精确机理（服务测绘报告，含行号）

首页横幅"当前没有可用模型"= i18n `chat.error.noAvailableModel`，渲染条件是错误码属于
`{model_config_missing, MODEL_CONFIG_MISSING, ModelConfigMissing}`
（renderer `styles-CdEGpc2x.js:54260-54300`）。两个产生方：

- **Producer A（空装机即触发）**：renderer hook `pWe`（:54147-54259）调
  `modelProviderService.getProviderRegistrySnapshot()`，就绪判定 `Vx(snapshot)`
  （`src-HCld2afU.js:8884-8891`）：**任一 provider 有 baseURL + apiKey 可用
  （或 `apiKeyRequired===false`）+ 至少一个无 `disabledReason` 的模型** → ready。
  失败则产出 `model_config_missing`，阻塞 draft 启动（`agentStartupAllowed`）与首发
  （`ensureReadyForSend`）；RPC 本身失败时 **fail-open**。
- **Producer B（运行时）**：host `resolveRuntimeModelConfig`（`host/index.js:15296-15391`）
  在每次 session create/resume/subscribe/send/setModel 前校验注册表，抛
  `ZCODE_RUNTIME_MODEL_UNAVAILABLE` 等码。
- **Producer C（host 启动就绪门）**：`resolveZCodeAgentStartupReadiness` /
  `isZCodeAgentStartupReady` / `hasRuntimeCredential`（`chunk-O5YHTQBW.js:18885-18911`）
  ——provider 未就绪时 agent 被保持只读/不启动，`initialize` 报 `available:false` +
  reasonCode。**合成快照必须同时满足 renderer 的 `Vx` 与这道 host 门。**
- 空注册表的直接原因：目录式 catalog 文件
  `resources/model-providers/models_catalog_china_llm_zcode_2026-06-03.json`
  在本树不存在（它只喂"配置自定义模型"向导的目录），且未配置任何自定义 provider。

**结论（移植钥匙）**：renderer 门槛只需要快照里有**一条**可用条目；host 已有
`markLocalProvidersUsable` 把本地 provider 强制 `apiKeyRequired:false` 的先例
（`host/index.js:38488`），权益已 stub 为 unlimited。⇒ **让 `model-provider` 服务
从内核 `modelState` 合成注册表快照**（每个内核模型 → 一条 provider 条目，
baseURL 非空、`apiKeyRequired:false`），所有模型门槛自然全绿，renderer 零改动。
会话操作里的 runtimeModel 推送（含 apiKey 的 `session/setModel` 载荷）整体废弃，
换成 `session/set_model`——密钥解析归内核（config.toml）。

补充事实（第二份服务报告交叉确认）：
- 门槛 hook `pWe` 仅在 **draft 草稿态（`sessionId===null`）且 provider 家族为 `glm`**
  时启用（默认会话工作区即用 glm 家族）；合成快照必须让这条 draft 路径就绪。
- `workspace/updateProviderRegistry` 推送链路**当前就被 adapter ack 后丢弃**
  （`acp-agent-adapter.js:1158-1166` 返回 status:"applied"），注册表从未到达内核——
  整条链路是死代码，删除零风险。
- adapter 目前向 UI 呈现单一虚拟模型 `{providerId:"nofy", modelId:"nofy-kernel"}`、
  `available:[]`（`configOf`，adapter:276-301）——这就是选择器只有一个假模型的原因。
- 启动→发 prompt 共 7 道门：① splash ② 登录墙（已 stub 为 local-user，常通）
  ③ 权益（已 stub unlimited）④ 工作区（`~/.nofy/workspace/default` 自动创建，常通）
  ⑤ **模型就绪（当前唯一硬阻塞）** ⑥ agent runtime 存活（adapter/内核在线）
  ⑦ 运行时模型解析（会话引用的模型仍在注册表内）。移植后 ⑤⑦ 由合成快照 +
  `session/set_model` 覆盖，⑥ 变为"内核 WS 单例在线"。

### 2.8 桌面侧存储现状（需要在移植中收编/拆除）

| 存储 | 归属 | 处置 |
|---|---|---|
| `~/.nofy/v2/config.json`（OpenCode provider 镜像） | host | **拆除**，模型只认内核 modelState |
| `~/.nofy/v2/setting.json`（30+ 键） | host | **迁移**：UI-local 键 → config.toml `[desktop]`；内核有对应的运行时键 → 对应段；模型家族状态键（`providerFamilyDomain`、`modelProviderFamily*`、`enabledBuiltinAgentCliProviders`）与 `zcodeEndpointOrigin` → **删除** |
| `~/.nofy/v2/model-provider-display-order.json`、legacy `model-providers*.json`、`~/.nofy/cli/config.json` | host | **拆除** |
| `~/.nofy/v2/tasks-index.sqlite`（任务列表/分组/automation/off-peak） | host | **保留**（桌面本地 UI 状态），但数据源从 v4 `sessions-index/<ws>` topic 换成 `_nofy/sessions/changed` roster + `session_summaries` |
| `~/.nofy/sessions/<cwd>/<sid>/`（updates.jsonl、chat_history.jsonl、summary.json…） | **内核** | 不动；桌面经 ACP 读写 |
| `~/.nofy/workspace/default`（默认会话工作区） | host 自动创建 | 保留（内核语义里就是 cwd） |

---

## 3. 目标架构（终态）

```
main (Electron)
 ├─ NofyKernelClient（单例）：WS JSON-RPC（ACP 原生，_nofy/* 带下划线前缀）
 │    ├─ kernel-supervisor 发现/派生 `nofy agent serve`（已有，保留）
 │    ├─ initialize 时 clientIdentifier="nofy-desktop"
 │    ├─ 标准 ACP + _nofy/* 扩展；事件多路广播给所有窗口
 │    └─ 应答反向请求：权限 / ask_user_question / exit_plan_mode / elicitation
 ├─ host = utilityProcess（每窗口一个）
 │    ├─ 对 renderer 维持现有通道契约（过渡期），实现全部换成
 │    │   "经 main 单例走 ACP + 直读 config.toml"
 │    └─ 不再派生任何 agent server 子进程
 └─ renderer（第一阶段不动）
```

- **ACP 连接归 main 所有**：内核只把通知发给当前连接（§2.3 警示），每窗口各连一条
  必然互相抢流。main 单例 + 窗口级多路复用是唯一正确形状；这也顺带修掉现状
  （每窗口 host 各派生一个 adapter、各连一条 WS）的同类隐患。
- 不再有：ZCodeProtocolClient / ZCodeStdioTransport / ZCodeAgentProcessManager /
  ndjson v4 envelope / adapter 进程 / `ZCODE_AGENT_SERVER_*` 环境变量 /
  `~/.nofy/v2/` 配置镜像 / setting.json。
- TUI 与桌面并存：各自独立进程，共享 `~/.nofy`（config + 会话存储）。
  内核 `leader` 模式在净化版已移除（实测报错确认），不做实时共享内核。
  注意 TUI 与桌面**不要同时连着各自的 `agent serve`** 抢同一会话写存储——
  会话存储按 (id, cwd) 目录隔离，并发写不同会话安全；同一会话两端同时活跃
  属未定义行为，UI 层以 `_nofy/sessions/changed` roster 提示占用。

---

## 4. 能力映射表（桌面功能 → 内核原生）

> 由 5 路测绘报告合并而成；"状态"列标注证据等级（实测可用 > 源码确认 > 接线明确）。

| 桌面能力 | ZCode 旧途径 | 内核原生途径 | 状态 |
|---|---|---|---|
| 会话列表/历史 | session/list + v4 sessions-index topic | `session/list` + `_nofy/session_summaries/workspace_list` + `_nofy/sessions/changed` 增量 + `nofy/sessions/list` 活体 roster | 实测可用 |
| 打开旧会话 | session/read（内核不存在） | `session/load`（响应前回放转录，可 `_meta.noReplay` 抑制）；预览用 `nofy/session/updates` 随机访问 | 实测可用 |
| 发送/流式 | v4/command sendText | `session/prompt` + `session/update` 流 + `turn_completed` 收尾 | 实测可用 |
| 停止 | v4/command stop →（adapter 发错的）session/cancel | `session/cancel` **notification**（可带 `_meta.cancelTrigger`）；同时把挂起权限请求应答 cancelled | 实测可用 |
| 权限审批 | interaction/requestPermission | `session/request_permission`（request 应答，选项 kind 四类）；`[ui] permission_mode` 管总开关 | 接线明确 |
| 权限模式切换 | （无） | `_nofy/yolo_mode_changed` 通知 / `session/new _meta.yoloMode/autoMode` / config.toml `[ui] permission_mode` | 源码确认 |
| 计划模式 | （无） | `session/set_mode{default\|plan}` + `_nofy/toggle_plan_mode` + `current_mode_update` + `_nofy/exit_plan_mode` 审批 | 源码确认 |
| 模型切换 | workspace/session setModel（静态桩） | `session/set_model`（+reasoningEffort）；列表只认 `modelState` / `_nofy/models/update` | 实测可用 |
| 模型列表/门槛 | host provider 注册表（config.json 镜像） | `initialize._meta.modelState` | 实测可用 |
| 设置界面 | setting.json + config.json | 直读写 config.toml（内核热重载，无需重启）；UI 私有状态进 `[desktop]` | 需 JS TOML 编辑方案 |
| MCP 管理 | mcp-sync 服务 | **`nofy/mcp/upsert\|delete` RPC（内核直接落 config.toml）** + `nofy/mcp/{list,toggle,…}` + `_nofy/mcp/*` 通知 | 源码确认 |
| 消息队列/插话 | v4 queue 命令 | `nofy/queue/*` 通知 + `nofy/interject` + `_nofy/queue/changed` | 源码确认 |
| 会话重命名/删除/fork | v4 命令 | `nofy/session/rename\|delete\|fork`（fork 支持 targetPromptIndex 分叉点） | 源码确认 |
| 撤回/回退点 | v4 rewind | `nofy/rewind/{points,execute}`（`cancelRewind:true`） | 源码确认，待实测 |
| 插件 | plugins/*（静态桩） | `nofy/plugins/{list,action,reload}` + config.toml `[plugins]` | 源码确认 |
| 登录/账户 | ZCode oauth + entitlement | **云联路已在 D5b 复原中整体删除**（DELETED-CLOUD-LEDGER，~30,500 行）：OAuth→`LOCAL_USER_PROFILE` 恒认证、权益→`unlimited` 常量、订阅/计费/captcha/web-remote/遥测/强升全部地化 stub；登录墙不再出现。内核侧认证 = `authenticate{api_key\|cached_token}`。残留空壳服务（settings-sync、off-peak、coding-plan-subscription 等）在阶段 D 清理 | 门槛已不存在，仅清理 |
| 终端 | （ZCode 自管） | 客户端能力声明 false → 内核自管；UI 展示走 `nofy/terminal/*` / `pty/*` | 接线明确 |
| 用量/上下文 | （桩） | `nofy/session/info`（context.used/total/usagePct）+ `nofy/session/usage` + prompt 响应 `_meta` | 源码确认 |

---

## 5. 分阶段计划

每阶段独立可验证、独立提交；前一阶段不绿不进下一阶段。

### 阶段 A0：前端源码化（移植前置，B5 全量解码完成后执行）

> 前提：B5 全量解码收官（`B5-FULL-DECODE-PLAN.md` 全部批次 + b5-merge 对账验收：
> 接口级清单清零、`out/` md5 复验不变）。此后**逐字产物 + 映射表 + SYMBOL-INDEX
> 升格为只读真值底稿**（与 `out/` 同级），本阶段产出的工程化源码是**可重新派生**的
> 衍生物，任何时候可回退重导。

目标：把「族级大文件 + 映射表代指」的重建产物转成真正的模块化源码工程，
作为阶段 A–E 手术的操作面。分三层，验证强度递减、可读性递增：

**A0.1 模块拆分 + 别名落地（纯机械变换，可证明正确）**
- 以各批导出别名表为模块边界图（SrcSharedB 412 条、SmallChunks 三张、
  Composer 351 条映射等；汇总见 `B5-MERGE-NOTES.md`），把族级 `.tsx`
  （Composer.tsx / SrcSharedA/B.tsx / SkillStore.tsx / …）拆成
  `src/{components,hooks,stores,lib,services}/…` 文件树。
- 跨文件 `declare` 接缝全部换成真实 `import`；双归属段按既定裁决取 canonical
  （ConfigSelect→Composer、YLt…nRt→WebRemote，见 B5-MERGE-NOTES §2），
  重复转录件删除。
- vendored 库体按 `VENDOR-MANIFEST-LIBS.md` 换 npm 依赖：
  **zod v4.3.6**（SrcSharedA §2–§8，~3,260 行）、recharts（含 CartesianChart 分包）、
  Lexical、xterm、Stripe（6.4.0/9.6.0）、resizable-panels 等；
  存储键与薄层包装保持兼容（WorkspaceShell.report §6 策略）。
- **验证**：esbuild/tsc strict 0 错；拆分前后发射代码 diff 对照（语义名回代后
  与逐字产物一致）；既有锚点抽查不回退。

**A0.2 类型收敛（机械 + 少量归纳）**
- 把接口级 `declare const X: any` 换成属主模块的类型化导入：
  LegacyDocEngineC4 §0 316 项、SkillStore 的 SubagentsService/SkillsService/
  Descriptor、SrcSharedB §0 90 条 ambient、各批「集成改指清单」
  （B5-MERGE-NOTES §4 总账）。
- **验证**：tsc strict 0 错；`grep -c "declare const .* any"` 逐批清零。

**A0.3 局部语义化（按需，随移植阶段滚动做，不盲目全量）**
- 函数体内单字母局部名（`e/t/n`，逐字保留的部分）只在**阶段 A–E 要动到的模块**
  上做语义重命名，改到哪美化到哪。
- 注意：此层一旦执行即永久失去「逆映射回代逐字节一致」证明，守护手段从
  字节 diff 换成 esbuild/tsc + 运行时验证（UI 端到端回归）。因此必须以
  A0.1/A0.2 完成为前置，且每个模块改动前留逐字底稿快照。
- 原项目的完整 TS 类型与注释在打包时已烧毁，不可恢复；注释只重写不伪造。

**总验证**：`src/` 工程可独立编译；对 `out/` 与逐字底稿零改动（md5 复验）；
阶段 B 起的每一处移植改动都能落在可读的具名模块上。

### 阶段 A：main 内锚定原生 ACP 单例（不拆旧路）
- 在 **main 进程**落地 `NofyKernelClient` 单例（WS JSON-RPC；吸收 `seam/acp-client.js`
  已验证部分，修正 cancel=notification、`_nofy/*` 前缀等错误），由 kernel-supervisor
  发现的端点接入；host 经 main↔host IPC 使用它（旧 ZCodeProtocolClient 暂留，仍服务 renderer）。
- **收编 `seam/workspace-registry.js`**：它已在 main 里自建第二条 ACP 连接做
  workspace/session 枚举（`zcode:nofy-list-workspaces` / `zcode:nofy-workspace-sessions`），
  是单客户端中继约束的现存违例（可能抢走 adapter 的事件流）——其客户端并入单例，
  枚举逻辑（含 dir-scan 回退与标题回退链）保留。
- **验证**：initialize 成功（clientIdentifier=nofy-desktop）、modelState/roster 拉取；
  全进程对内核只剩一条 WS；探针脚本入库 `desktop/scripts/acp-probe*.mjs` 作为回归基线。

### 阶段 B：会话主流程切换（核心垂直切片）
- `nofy-agent`/`zcode-session` 通道背后的会话实现改走 ACP：
  列表、新建、打开（load 回放）、发送、流式、停止、权限应答。
- `session/setModel` 语义换成 `session/set_model`：host 不再解析/推送 apiKey 与
  runtimeModel（`resolveRuntimeModelConfig` 一族整体退役），模型解析归内核。
- 任务列表同步器（`createZCodeTaskIndexSyncer`，喂 tasks-index.sqlite）的数据源
  从 v4 `sessions-index/<ws>` topic 换成 `_nofy/sessions/changed` + `session_summaries`。
- renderer 契约形状不变，数据由 ACP 事件映射而来。
- **验证**：UI 端到端——真实发一条 prompt，看到流式输出、停止生效（`stopReason:cancelled`）、
  权限弹窗可批准/拒绝；旧会话可打开且历史完整；任务列表与内核会话一致。

### 阶段 C：单一配置 + 模型门槛拆除
- `model-provider` 服务改为**内核 modelState 合成快照**（§2.7），`getProviderRegistrySnapshot`
  返回内核模型映射的条目；`save/upsert/remove` 改为写 config.toml `[model.*]`/`[models]`
  （经内核热重载生效）；`workspace/updateProviderRegistry` 推送链路删除。
- 设置界面全部改读写 `~/.nofy/config.toml`：模型（`[models]`/`[model.*]`）、权限
  （`[ui].permission_mode`，运行期另走 `_nofy/yolo_mode_changed`）、MCP
  （**优先 `nofy/mcp/upsert|delete` RPC**，内核直接落盘）、插件（`[plugins]`）。
- setting.json 键迁移（按服务测绘分类）：
  - UI-local（recentProjects、locale、窗口/托盘/缩放、lastWorkspaceSession、
    messageStreamShow*、taskAutoArchive* 等）→ config.toml `[desktop]` 段；
  - 内核有对应语义的运行时键（memoryEnabled→`[memory]`、代理→内核启动环境等）→ 对应段；
  - 模型家族/云状态键（providerFamilyDomain、modelProviderFamilyModes/SelectedKeys、
    enabledBuiltinAgentCliProviders、zcodeEndpointOrigin）→ **删除**。
- 拆除并行存储：`v2/config.json`、`v2/setting.json`（迁移完成后）、
  `model-provider-display-order.json`、legacy `model-providers*.json`、`~/.nofy/cli/config.json`。
- **验证**：UI 改默认模型 → config.toml 落盘 → 内核热重载（`_nofy/models/update`）→
  新会话即用新模型；TUI 与桌面读到同一配置；`~/.nofy/v2/` 不再被写；
  首页横幅消失、模型选择器列出内核全部模型。

### 阶段 D：拆除 ZCode 协议层 + 云时代空壳清理
- 删除 ZCodeProtocolClient / ZCodeStdioTransport / ZCodeAgentProcessManager /
  v4 envelope 编解码、adapter 进程与 `ZCODE_AGENT_SERVER_*` 环境变量。
- 清理 D5b 遗留的空壳服务与死键：`settings-sync`、`off-peak-task`、
  `coding-plan-subscription`（补 `getEnterprisePricing` 空 stub 消日志噪声）、
  `usage-stats` 常量分支、setting.json 迁移后的 `webRemoteControl*` /
  `zcodeEndpointOrigin` 死键、OTEL/`ZCODE_BASE_URL` 环境注入、
  孤儿远端配置 URL 常量、ARMS nudge 残留。
- "升级"按钮：云漏斗对话框（`Ort`）在本地 stub 下渲染空白——把入口改指向
  模型设置（小改），或保留无害现状。
- 通道名/语义中残留的 "zcode" 逐步改名（在 renderer 契约允许范围内）。注意 33 个
  服务通道名在三处定义必须同步（host `CZ` chunk-O5YHTQBW.js:17538-17571 /
  main `mC` chunk-FQMTTDFW.js:302-334 / renderer `Pb` src-HCld2afU.js:8468-8501），
  renderer 那份不能动 ⇒ 通道名事实上冻结，改名仅限 host/main 内部符号。
- **验证**：`grep -ri zcode` 于 host 代码只剩无关项；全功能回归一遍。

### 阶段 E：收尾能力与打磨
- 队列/插话、fork/rewind、插件市场、skills/workflows、终端等进阶能力。
- 按能力映射表逐项点亮；每项有独立 UI 验证。

---

## 6. 风险与未决

1. **JS 侧 TOML 编辑**：内核/TUI 用 `toml_edit` 保格式保注释；JS 生态无等价物。
   候选：`@iarna/toml`/`smol-toml` 读 + 针对性文本编辑写；或接受写时丢注释。
   ——阶段 C 开工前必须定案（倾向：限定键集的文档级文本编辑，用户手写注释不丢）。
   缓解：能用 RPC 的设置不碰文件（MCP 走 `nofy/mcp/upsert|delete`、
   API key 走 `nofy/setApiKey`、权限模式运行期走 `_nofy/yolo_mode_changed`）。
2. **renderer 契约冻结面**：哪些通道形状是 renderer 硬编码依赖的，需服务测绘报告逐条确认；
   凡形状无法匹配的，优先在 host 做数据整形而不是改 renderer。
3. **登录/权益门槛（已基本解决）**：DELETED-CLOUD-LEDGER 证实云联路（OAuth/遥测/
   计费/权益/强升/captcha/web-remote）已在 D5b 净删 ~30,500 行并三重验证零悬挂；
   登录墙、订阅横幅、"开通编程套餐"类门槛已不存在。剩余工作只是清理空壳
   （`settings-sync`、`off-peak-task`、`coding-plan-subscription` 等返回常量的服务，
   及 setting.json 里 `webRemoteControl*`/`zcodeEndpointOrigin` 死键），归入阶段 D。
   唯一要补的正面体验：未配置模型时给"编辑 config.toml / 打开设置"的可操作引导。
4. **`session/set_mode` 对非活跃会话挂起**（实测）：host 调用需加超时与会话状态守卫。
5. **多窗口/单客户端中继**：内核只向当前 WS 发通知。阶段 A 的 main 单例是硬要求；
   迁移过程中严禁出现"每窗口各连一条"的中间形态。
6. **内核能力缺口（前端需知）**：无 `session/set_config_option` / 标准 `session/fork` /
  `logout`；无 availableModes 通告（`default`/`plan` 硬编码）；无 usage_update 推送
  （用量取自 prompt 响应 `_meta` / `nofy/session/usage` / `turn_completed.usage`）；
  `_nofy/session/prompt_complete` 已标 legacy（重连场景依赖 `turn_completed`）；
  `_nofy/follow_ups` 在净化内核从不发出（TUI 残留，前端不接）。
7. **会话存储并发**：存储按 `~/.nofy/sessions/<encoded-cwd>/<session-id>/` 隔离，
   TUI 与桌面写不同会话安全；同一会话两端同时活跃未定义，以 roster 的
   activity 状态在 UI 提示占用，不引入第二把锁。

---

## 7. 验证标准（总验）

- 内核：`git status` 零改动；`~/.local/bin/nofy` 二进制不动。
- 配置：`~/.nofy` 下只有 config.toml + 会话存储 + 内核自身产物；无 v2/、无 setting.json。
- UI 端到端：新建会话 → 发 prompt → 流式输出 → 中途停止 → 权限审批 → 切换模型 →
  打开历史会话 → 重命名/删除，全流程真实可用。
- 共存：ZCode.app 与 Nofy 并行不冲突（已达成）；TUI 与桌面共享 `~/.nofy` 互不破坏。

---

## 附录：调研原始证据

- 探针脚本（已入库 `desktop/scripts/`）：`acp-probe.mjs`（方法存在性）、
  `acp-probe2.mjs`（initialize/model 全量、close/resume/set_model）、
  `acp-probe3.mjs`（cancel 族排除法 + load 回放）、`acp-probe4.mjs`（cancel 通知中断实测）。
- adapter 缺陷定位：`desktop/src/out/main/seam/acp-client.js:194-198`。
- 内核分派表：`crates/codegen/nofy-shell/src/agent/mvp_agent/acp_agent.rs:1088-1229`；
  ACP 线路名表：`agent-client-protocol-schema-0.11.4/src/bin/generate.rs:1020-1066`。
- 子代理报告（5/5 已并入本文档）：进程/IPC ✅、ZCode 协议层 ✅、内核 ACP ✅（§2）、
  服务+配置+门槛 ✅×2（§2.7/§2.8）、登录/云依赖 ✅（§4/§6）。
- 前序复原账本：`src-reconstructed/modules/DELETED-CLOUD-LEDGER.md`、
  `D5C-WIRING-LEDGER.md`、`DEBRAND-LEDGER.md`。
