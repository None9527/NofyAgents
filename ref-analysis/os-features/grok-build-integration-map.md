# grok-build OS-level Agentic 吸收映射（Integration Map）

> 输入：`docs/` 全部 14 篇；`crates/` 关键 crate 源码骨架；`ref-analysis/`（openclaw.md、hermes-agent.md、pi.md、deepseek-harness/、SUMMARY.md、os-agentic-proposal.md）；`SANITIZATION_PLAN.md`、`RTAGENT-INTEGRATION.md`。
> 注意：`ref-analysis/os-features/` 下 openclaw/hermes/pi/deepseek-harness/ngoagent 的 OS 特性专题尚未产出，本文按任务给定的轴（L1 常驻 / L2 跨域 / L3 系统面 / 治理 / 模型运营 / 生态 / 工程）直接映射。
> 命名：docs/ 用 `xai-*` 旧名，实际 crate 已脱敏为 `nofy-*`（`SANITIZATION_PLAN.md` 里程碑 2）。本文一律用真实路径（`nofy-*`）。
> 所有论断带路径；无法核实的标注"待核实"。

---

## 1. 现状拓扑

### 1.1 常驻面（L1）：Leader 已死，器官还在

**关键事实：Leader 模式在脱敏构建中已被移除。**

- `crates/codegen/nofy-pager-bin/src/main.rs:209-217`：`run_leader_mgmt` 直接 bail——"leader mode was removed in the sanitized build; there is no shared leader process to manage"。
- 同文件 `:413-430`：`resolve_leader_mode(...)` 仍被调用（CLI flag/config/remote settings/sandbox 收敛出 `LeaderMode`），但随后硬编码 `let use_leader = false;`，注释"Leader mode was removed in the sanitized build; the embedded agent is always used"。
- 同文件 `:487-495`：`AgentCmd::Leader` 分支仍在 dispatch 表里，`run_leader` bail with explanatory error。
- 残留类型面：`crates/codegen/nofy-pager/src/app/mod.rs:403` `resolve_leader_mode`、`LeaderTargetArgs`；`crates/codegen/nofy-pager/src/acp/leader_bridge.rs` 只剩 22 行的 `ConnectionStatus` 枚举（注释明说 leader IPC bridge 已随 leader/relay 基础设施移除）；`crates/codegen/nofy-test-support/src/leader.rs` 仍保留 leader 双二进制 version-skew 测试夹具（lock-file 选举语义）。

**Leader 原语义是 per-user-host，不是 per-workspace**：test-support 夹具描述"one initial persistent leader"、lock-file PID 观察、"detached replacement generations"（`nofy-test-support/src/leader.rs:1-6`）；`main.rs:401-405` 的 `leader_eligible` 覆盖 `None | Stdio | Headless` 三种入口模式，即 leader 是客户端们共享的单一 agent 宿主。docs/11 描述的 `StdioReplayState`（leader 崩溃重选后重放 initialize/session/load）在脱敏代码中已不存在——docs/11 该节相对现代码是**过时的**（待核实：是否计划恢复）。

**现存的真正常驻件：**

| 常驻件 | 范围 | 路径 |
|---|---|---|
| `workspace_server` 二进制 | per-workspace（远程沙箱内一份） | `crates/codegen/nofy-workspace/src/bin/workspace_server.rs`（读 `~/.nofy/auth.json` OIDC，连 server，暴露 workspace tools，自动刷 token） |
| daemonize 基建 | 单实例 double-fork + `setsid` + pidfile `/tmp/workspace-server.pid` | `crates/codegen/nofy-workspace/src/daemonize.rs:1-41`（double-fork 必须先于 tokio runtime/线程启动） |
| `serve` 模式 agent（`AgentCmd::Serve`） | per-process（一个 WS 端点一个 MvpAgent） | `crates/codegen/nofy-shell/src/agent/server.rs:1-11`（agent 跨 WS 重连存活，session actors 与 in-flight prompts 不断） |
| diag server | workspace-server 同生共死，loopback/Unix socket | `crates/codegen/nofy-workspace/src/diag_server.rs:1-7`（`/ready`、`/statusz`、`/logs`） |
| Scheduler actor | per-session 工具内 actor（非进程级） | `crates/codegen/nofy-tools/src/implementations/nofy_build/scheduler/`（`actor.rs`、`occurrence_journal.rs`） |

**结论**：当前没有 per-host 的共享控制面进程。常驻能力散落在三处——workspace-server（沙箱场景）、serve 模式（远程 TUI 场景）、工具内 scheduler actor（会话内定时）。上提 Leader 的空位是真实存在的。

### 1.2 协议面：三套消息宇宙

**A. ACP over stdio（`--stdio`）**
- 载体：`agent-client-protocol` crate（docs/11 记 v0.10.4 + `unstable` feature），JSON-RPC 2.0 行分隔。
- 服务端实现：`crates/codegen/nofy-shell/src/agent/mvp_agent/mod.rs:653` `MvpAgent`；装配在 `crates/codegen/nofy-shell/src/agent/app.rs:32-61`（`spawn_agent_local`：`acp::AgentSideConnection::new(agent, outgoing, incoming)` + `AcpAgentGatewaySender/Receiver`，跑在 LocalSet 上）。
- 消息形状：`initialize` / `session/new|load|prompt|close` / `session/update`（流式）+ 内部扩展方法 `nofy/internal/*`（`crates/codegen/nofy-shell/src/extensions/session_admin.rs` 的 `InternalMethod`，如 `ReloadSkills`/`ReloadWorkflows`，经 `app.rs:64-118` 的 skills watcher 注入 ACP 入流）。
- 认证：无（进程管道边界即信任边界）。
- 重连：不适用（进程生命周期 = 连接生命周期）；会话加载时重放录制的 session updates（`crates/codegen/nofy-shell/src/agent/mvp_agent/replay.rs`，处理超尺寸 completion 的 refit/drop）。

**B. ACP over WebSocket（`serve`）**
- `crates/codegen/nofy-shell/src/agent/server.rs`：axum WS；认证 = `Authorization: Bearer <secret>` 或 `?server-key=` 查询参数（`validate_auth`，:90-108）；`ServerConfig { bind_addr, secret }`。
- 消息形状：与 stdio 完全相同的 ACP 消息集（`AcpClientMessage` 经 `simplex` 通道桥进同一个 `spawn_agent_local` 路径）。
- 重连语义：**agent 侧持久**——首个连接创建 MvpAgent 于专属线程，后续连接把新 WS 通道递给既有 agent 线程（`handle_connection`，`RelayDest` 可换目标）；KEEPALIVE_INTERVAL_SECS=15。

**C. Hub WS（Computer Hub 工具平面）**
- crate 三件套：`crates/common/nofy-computer-hub-core`（Transport/Principal/ToolRegistry/resolver）、`nofy-computer-hub-sdk`（`ToolServer` `src/server.rs:570`、`ToolHarness` `src/harness.rs:566`、`ToolServerHandler` trait `src/server.rs:160`、`HubConnectionPool`、handshake/admission/demux）、`nofy-computer-hub-mcp-adapter`。
- 消息形状：**不是会话宇宙，是工具调用宇宙**——`tool_call_request` 路由、`session.bind` 通知、`ToolNotificationFrame`（`crates/codegen/nofy-workspace/src/hub_channel.rs:20-48`）。workspace.* JSON-RPC 方法被打包成一个 tool（tool_id `workspace_rpc`）挂在 ToolServer 上：`crates/codegen/nofy-workspace/src/hub_server.rs:1-10`（`WorkspaceRpcHandler implements ToolServerHandler`）；tool id 常量在 `crates/codegen/nofy-workspace/src/hub_ids.rs`（canonical 位于 `nofy_workspace_types::rpc`）。
- 认证：握手期一次性认证产出 `Principal { user_id, session_ids, scopes, audiences }`（`crates/common/nofy-computer-hub-core/src/transport.rs:16-40`）；loopback `ws://` 走 plain bearer，非 loopback 走 auto-refresh OIDC（`crates/codegen/nofy-workspace/src/hub_auth.rs:1-7`）；后续调用不再带凭据，per-call 按 `SessionId` 收窄。
- 重连：`HubConnectionPool` 按 `(url, principal)` 复用单 WS（`hub.rs:22-25`）；proxy 模式可挂 `on_reconnect` 回调重置连接标志（`workspace_ops.rs:1332-1336`）。
- 会话多路复用：一个 workspace-server 可同时 bind 多个 session，各自独立 CWD/shell state/toolset，无特权 main session（`hub.rs:10-17`）。

**重叠点**：
1. `WorkspaceOps`（`crates/codegen/nofy-workspace/src/workspace_ops.rs:1307-1347`）把 Local（WorkspaceHandle 直连）与 Proxy（经 Hub RPC 的 `WorkspaceClient`）收敛成同一操作面——这是三套协议中**唯一已有的统一抽象**。
2. MCP 有 ACP transport（`crates/codegen/nofy-mcp/src/acp_transport.rs`）：MCP 帧可骑 ACP 通道（编辑器场景），即 ACP 与 MCP 已有桥。
3. serve 与 Hub 都做"远端客户端 → 本地 agent/tools"，但消息形状、认证、会话模型互不相通。
4. relay（Web 前端驱动本地 agent，`wss://code.nofy.com/ws/code-agent`）与 cloud gateway（`/cloud new` 沙箱）是两条专有 WS，协议不同（`crates/codegen/nofy-env/src/lib.rs:79-93` 注释明说"the two speak different protocols"）；`crates/codegen/nofy-shell/src/remote/` 的 `BackendClient`/`RemoteSync`/device-flow login 是其客户端残留。

### 1.3 状态面

**会话持久化**：
- 落盘布局：`{NOFY_HOME}/sessions/{url_encoded_cwd}/{session_id}/`（`crates/codegen/nofy-shell/src/session/storage/jsonl/mod.rs:26`；cwd 编解码在 `crates/codegen/nofy-config/src/paths.rs:117-168` `encode_cwd_dirname`/`sessions_cwd_dir`）。**状态根是 per-cwd 的**，这继承了原 Leader 的 per-workspace 会话拓扑。
- 文件族：`chat_history.jsonl`（对话真相）、`events.jsonl`（分析级 fire-and-forget）、`updates.jsonl`（UI 协议流）、`runtime_events.jsonl`（回放级 journal，`NOFY_RUNTIME_JOURNAL=1` 门控）——四文件职责分明（`docs/13-runtime-evolution-journal.md`）。
- trait 形状：`ChatPersistence`（`crates/codegen/nofy-chat-state/src/persistence.rs:23-43`）：`persist_message` / `persist_working_directory_switch_and_ack`（oneshot ACK）/ `replace_history` / `flush` / 会话终止钩子（journaling 实现用）。装饰器 `JournalingChatPersistence`（`crates/codegen/nofy-chat-state/src/journaling.rs`）旁路事件到 `RuntimeJournalHandle`（`crates/codegen/nofy-shell/src/session/runtime_journal.rs`）。
- 存储抽象：`StorageAdapter` + `JsonlStorageAdapter`（`crates/codegen/nofy-shell/src/session/storage/mod.rs`、`storage/jsonl/`），另有 FTS 搜索层（`storage/search_fts.rs` 等 6 个 search 文件）与 relocation 支持（`storage/relocation/`）。
- 进程内会话注册表：`crates/codegen/nofy-shell/src/agent/mvp_agent/session_registry.rs`——`SessionRegistry`（`Rc<RefCell<HashMap<SessionId, SessionResources>>>`）+ `SessionPresence` 状态机（Resident/Attaching/Evicted，带 displaced 回滚）。**这是进程本地的**；另有 `agent/session_registry_client.rs` 对接远端 registry（Leader 残留，待核实是否仍有活服务端）。

**Runtime journal（事件真相层，Layer 1）**：
- `crates/common/nofy-session-journal/`：24 种封闭事件词汇（`src/event.rs:129-152`：session/turn/model/tool/permission/context/history/checkpoint/budget/reconciliation），JSONL 密集 seq + 撕裂尾修复 + 256MB 上限（`src/journal.rs`），确定性 reducer `project(events) -> SessionRuntimeSnapshot`（`src/reducer.rs`），world-state 分区（`src/world_state.rs`）。不依赖任何上层 crate——这是全仓最接近 dsh"词汇包"纪律的既有资产。

**记忆后端 trait 形状**：
- `MemoryBackend`（`crates/codegen/nofy-tools/src/types/memory_backend.rs:106-152`）：`async search(query, max_results, min_score)` / `get(path, from, lines)` / `total_chunks()` + 两个可覆盖默认值（`default_search_max_results`/`default_search_min_score`）。只读接口（`&self`，无 mutation），`Arc<dyn MemoryBackend>` 挂 `SessionContext`。
- 实现：`crates/codegen/nofy-memory/src/backend.rs`（FTS5 + 可选向量 KNN 混合检索；`rusqlite` 连接 per-query 新开，WAL 并发读；embedding 凭据 `EndpointScopedCredentials` fail-closed）。存储位置 `~/.nofy/memory/` + `.nofy/memory/`（docs/10 §二）。另有 `dream.rs`/`dream_lock.rs`（后台蒸馏，待核实启用条件）、`watcher.rs`（文件监控入索引）。

**治理状态**：`crates/common/nofy-convergence/`（failure.rs 五分类 + governor.rs 动态预算）；`crates/codegen/nofy-chat-state/src/projection_audit.rs`（每次模型请求的结构化审计，零内容泄漏）；`crates/codegen/nofy-shell/src/session/world_state.rs`。全部 env 门控默认关（`RTAGENT-INTEGRATION.md` 头部：`NOFY_RUNTIME_JOURNAL`/`NOFY_CONVERGENCE_GOVERNOR`/`NOFY_WORLD_STATE`/`NOFY_VERIFICATION_GATE`）。

**WorkspaceHandle 的操作面**（状态面的另一半）：
- `WorkspaceHandle`（`crates/codegen/nofy-workspace/src/handle.rs:431`）经 `connect_local_workspace` 建立，`resolve_workspace_home` 定根；`drain()` 返回 `DrainOutcome`，`DrainReason` 只有两种：`Sigterm`（独立 workspace_server 收到 SIGTERM/Ctrl-C）与 `Evict`（Hub 发来 `tool_server.evict`）（`handle.rs:3703-3713`）——**排空语义已经是事件驱动的**，daemon 化可直接复用。
- 能力模式 `CapabilityMode { ReadOnly, ReadWrite, Execute, All }`（`crates/codegen/nofy-workspace/src/capability.rs:14-23`，默认 ReadWrite = 子代理默认）；Hub consumer 方向拉来的远程工具只在 `CapabilityMode::All` 下可见（`hub.rs:26-31`）。
- 会话配置形状：`WorkspaceConfig`/`AgentSessionConfig`/`MemoryConfig`/`SessionContextFactory`/`DEFAULT_EVENT_BUFFER_CAPACITY`（`crates/codegen/nofy-workspace/src/lib.rs` 导出面；`config.rs` 1,113 行）。

**Agent 侧的两个窄腰类型**：
- `ToolBridge`（`crates/codegen/nofy-tools/src/bridge.rs:60`）：`registry: Arc<FinalizedToolset>` + 会话上下文 + 通知句柄；产物 `ToolBridgeResult { output, prompt_text }`（`:32-37`）——clean output 给 JSON/ACP/hunk，prompt_text 带 system reminders 给模型。这是工具宇宙与会话宇宙之间**既有的转换点**。
- `PromptQueue`（`crates/codegen/nofy-prompt-queue/src/`，combine.rs/types.rs）+ `InterjectionBuffer`（`crates/common/nofy-interjection-core/`）：用户消息/插话/系统提醒的合流点在 ChatStateActor 之前——daemon 化后"向运行中会话投递消息"的入口就是这里。

### 1.4 拓扑结论（3 条）

1. **常驻面是"删掉一半的 Leader 拓扑"**：原 Leader 是 per-user-host 的共享 agent 宿主（lock-file 选举、多客户端经 ACP 接入、崩溃重选 + 状态重放），脱敏构建把进程删了但留下了全部接口器官（`resolve_leader_mode`、`LeaderTargetArgs`、acp tracker/bridge 类型、test-support 夹具、`session_registry_client`）。现存常驻件只有 per-workspace 的 `workspace_server`（沙箱用）与 per-process 的 serve agent。**上提新 daemon 的空位真实存在，且 ACP 客户端侧基建可直接复用。**
2. **协议面是三套互不相通的消息宇宙 + 一个已有统一缝**：ACP（会话宇宙，stdio/WS 两种载体）、Hub WS（工具宇宙，Principal 握手 + tool 帧）、relay/gateway（专有云，残留）。唯一已存在的跨宇宙抽象是 `WorkspaceOps::Local|Proxy`（`workspace_ops.rs:1307`）——它证明"同一操作面、两种传输"的收敛在本仓已有工程先例。
3. **状态面已经 per-cwd 文件化 + 事件化**：会话根在 `{NOFY_HOME}/sessions/{encoded_cwd}/`，真相层正在从快照迁移到事件日志（`nofy-session-journal` 24 事件 + reducer + world-state，RTAgent 纪律已落地 A-D 四阶段）。**跨进程会话注册、调度、审批的持久化基座可以直接长在 journal/storage adapter 上，不需要新存储发明。**

### 1.5 相对参考项目的 OS 面差距

| OS agentic 能力 | openclaw | hermes | pi | dsh | grok-build 现状 |
|---|---|---|---|---|---|
| per-host 常驻 gateway/daemon | Gateway 单进程拥有所有消息面（`ref-analysis/openclaw.md` §5） | GatewayRunner 单进程承载所有平台（`hermes-agent.md` §7.1） | server 实验性（`pi.md` §8） | jobs/schedule 常驻 seam | **缺失**（Leader 已删；serve/workspace_server 各自为政） |
| 多客户端控制面协议 | WS + TypeBox schema-first + 多端 codegen（openclaw §5） | 平台适配器 + api_server | CBOR + 长度前缀帧，认证在传输层（pi §8） | cordis 服务注册/事件 | 三套并存（§1.2），无 schema-first 层 |
| 渠道/跨 agent 接入 | ~30 个 ChannelPlugin（openclaw §2） | 22 个平台插件（hermes §7.1） | 无（哲学上不做） | subagent 注册表 6 provider（dsh §8） | foreign_sessions 只读 + MCP + ACP；无投递通道 |
| 耐久调度 | `cron` 命令族（openclaw §2 CLI） | `cron/` croniter 调度器（hermes §2） | 无 | schedule seam 建在事件日志上（dsh §9） | 会话内 scheduler actor，无常驻宿主 |
| 会话写一致性 | activeWriterRunId 声明 + expectedWriterRunId 事务校验（openclaw §6） | 跨进程压缩锁（hermes §5） | SessionStorage 接口 | seq 连续契约 + 不变式伴侣（dsh 05 §1） | JSONL strict-append + ACK（`persist_working_directory_switch_and_ack`），journal seq 不变量——**形状已接近，缺跨进程 writer 声明** |
| 无 key e2e 替身 | QA harness 515 yaml 场景（openclaw §2） | tests 与源码等量（hermes §1） | faux provider（pi §3.4） | MockAdapter 入度 48 渗透全 e2e（dsh §14） | MockInferenceServer + scripted（§5.2），已具备 |

---

## 2. 扩展点清单（按 OS agentic 轴）

### L1 常驻

| 落点 | 路径 | 说明 |
|---|---|---|
| serve agent 持久线程 | `crates/codegen/nofy-shell/src/agent/server.rs` | 现成的"agent 跨连接存活"模型；新 daemon 的会话宿主可照此形状上提 |
| daemonize | `crates/codegen/nofy-workspace/src/daemonize.rs` | double-fork+setsid+pidfile，已从 workspace-server 抽出，可复用 |
| scheduler actor | `crates/codegen/nofy-tools/src/implementations/nofy_build/scheduler/` | 定时任务 actor + occurrence journal；但**困在工具实现里**，只能被模型经工具调用驱动 |
| 后台任务/monitor | `crates/codegen/nofy-tools/src/implementations/nofy_build/{task,monitor,kill_task,task_output}/` | background=true 子进程、进程组、流式输出通知 |
| 会话级 actor 族 | `crates/codegen/nofy-chat-state/src/actor/`（ChatStateActor）、`crates/codegen/nofy-hunk-tracker/`（HunkTrackerHandle）、`nofy-sampler/src/actor/`（SamplerActor） | 三个既有 actor 都是"独占 tokio task + 命令通道 + 事件广播"形状（docs/12 §二）——daemon 上提时它们是被宿主对象，形状不用改，改的是宿主进程 |

摩擦点：scheduler 与 task 都是会话内 actor，无常驻宿主；会话结束即失忆。dsh 的 schedule seam 直接建在会话事件日志上（`ref-analysis/deepseek-harness/08-capability-seams.md` §9），本仓的 `nofy-session-journal` 已具备同等基座但未接。

### L2 跨域

| 落点 | 路径 | 说明 |
|---|---|---|
| foreign sessions | `crates/codegen/nofy-workspace/src/foreign_sessions/`（`claude.rs`/`codex/`/`capability/`） | 只读列出 Claude/Codex/Cursor 的 SQLite 会话（metadata-only，`MAX_SESSIONS_PER_TOOL=50`，30 天窗口）；已有 ApprovedRoot 能力门控 |
| Computer Use 后端 traits | `crates/codegen/nofy-tools/src/computer/types.rs`（`AsyncFileSystem`/`TerminalBackend`）、`computer/local/`（cgroup、lifecycle、shell_state） | 本地/远程/mock 可注入；hub-mcp-adapter 已把 computer hub 暴露为 MCP 工具 |
| worktree 隔离 | `crates/codegen/nofy-fast-worktree/` + `crates/codegen/nofy-shell/src/session/worktree.rs`/`worktree_pool.rs` | 子代理隔离工作区 |
| workspace VCS 面 | `crates/codegen/nofy-workspace/src/session/{git.rs,jj.rs}`、`crates/codegen/nofy-gix-status/`、`nofy-hunk-tracker`（actor） | git/jj 双 VCS + hunk 级变更追踪 + 外部编辑对账（docs/13 Phase 3） |

摩擦点：foreign sessions 只读、单向；没有"向其他 agent 会话投递消息"的通道。跨域写路径要过 permission + sandbox 两道门，目前无统一审批代理。

### L3 系统面

| 落点 | 路径 | 说明 |
|---|---|---|
| 沙箱 | `crates/codegen/nofy-sandbox/src/`（profiles/deny/hook_write_deny/child_net/network_policy） | nono(Landlock/Seatbelt) + bwrap re-exec + seccomp 子进程网络；启动期一次性 apply 不可逆；fail-closed |
| 权限 | `crates/codegen/nofy-workspace/src/permission/`（manager/policy/rules/prompter/exec_risk/gate_preflight/auto_mode/hub_permission/claude_settings） | `wire_enum!` 宏保证权限词汇表跨 crate 不漂移；prompter 经 ACP `request_permission` 向客户端提问（`prompter.rs:1-20`） |
| hooks | `crates/codegen/nofy-hooks/src/`（discovery/dispatcher/runner/trust） | 4 事件，`pre_tool_use` 可 deny，fail-open（docs/06 §二、docs/12 §六） |
| folder trust | `crates/codegen/nofy-workspace/src/folder_trust.rs`、`nofy-shell/src/agent/folder_trust.rs` | 项目信任门控 |
| 系统电源 | `crates/codegen/nofy-system-power/` | 电池/睡眠事件（docs/10 §九） |

摩擦点：权限决策链（permission prompter / hooks deny / plan-mode gate / sandbox auto-allow-bash）是**四条独立路径**，无统一审批事件流；journal 的 `permission.requested/granted/denied` 词汇已预留但标注"后续接入"（docs/13 事件表）。

沙箱 profile 面（`docs/05-shell-sandbox.md` §沙箱详细设计；`crates/codegen/nofy-sandbox/src/profiles.rs`）：`Off`/`Workspace`（默认）/`Strict`/`ReadOnly`/`Devbox`/`Custom(String)`；自定义经 `.nofy/sandbox.toml` 的 `extends`+`deny` glob；全局状态 `SANDBOX: OnceLock` + `AUTO_ALLOW_BASH: AtomicBool`（docs/05 §全局状态）——**沙箱激活时自动批准 bash** 这条旁路是审批统一化必须收编的第四条路径。

### 治理

| 落点 | 路径 | 说明 |
|---|---|---|
| 事件 journal | `crates/common/nofy-session-journal/` | 24 事件封闭词汇 + 不变量（seq 无空洞、terminal 门控、凭据永不入 payload） |
| 收敛治理 | `crates/common/nofy-convergence/`（failure.rs/governor.rs） | 失败五分类 + hard cap/soft budget + 预算连续性；纯逻辑层已实施，接入点在 headless max_turns 与子代理 turn 循环（docs/13 Phase 4，**接入待核实**） |
| 投影审计 | `crates/codegen/nofy-chat-state/src/projection_audit.rs` | 每次模型请求的 system-prompt 在场性/合成项普查/token 估算 |
| 验证门 | `RTAGENT-INTEGRATION.md`（`NOFY_VERIFICATION_GATE`） | 证据化验证门，Stage 1 e2e 已过 |

摩擦点：governor 与 journal 都是"观察侧"，缺少"执行侧"的常驻宿主（谁来 enforce 预算、谁来持有未闭合 intent 清单）——这又是 L1 空位。

journal 的 P0 不变量是治理轴可复用的硬契约（docs/13 §不变量）：同一会话 seq 严格递增无空洞；append 失败显式报错不静默；terminal（`session.ended`）之后禁写执行类事件直到 `session.resumed`；撕裂尾加载截断保前缀、中段损坏硬报错；`tool.invoked` 必须带稳定 intent_id（= tool_call_id，崩溃时"invoked 无 outcome"即未闭合 intent，是 resume 对账的危险清单）；transport_status 与 outcome_status 分别记录；凭据永不进入事件 payload。任何新常驻组件（daemon/scheduler/approval-broker）的持久化都应继承这组不变量而不是另立一套。

### 模型运营

| 落点 | 路径 | 说明 |
|---|---|---|
| 编译时模型表 | `crates/codegen/nofy-models/src/lib.rs`（`include_str!("../default_models.json")`，grok-4.5，`api_backend: "responses"`） | 解析优先级 CLI > ENV > config > remote settings > 编译时默认 |
| 模型管理 | `crates/codegen/nofy-shell/src/agent/models/{cache,endpoint,fetch,resolution}.rs` | `ModelsEndpoint` trait 可注入 fake（`endpoint.rs:8-15`）；在线 `/v1/models` 拉取 + 缓存 |
| sampler | `crates/codegen/nofy-sampler/src/`（client/stream/actor/retry/config） | 三种 wire：`stream_chat_completions`/`stream_responses`/`stream_messages`；`SamplerConfig` 带 `BearerResolver`/`HeaderInjector` 注入缝（`config.rs`）；Layer 1/2/3 分层 |
| 端点 | `crates/codegen/nofy-env/src/lib.rs` | `NofyBuildEndpoints` 编译期生产默认 + `NOFY_PRODUCTION_*` env 覆盖（cli_chat_proxy/asset/relay/gateway 四个 URL） |

摩擦点：**编译时模型表**（`include_str!` + `assert!` 开发者错误语义）与 BYOK 目标冲突——`SANITIZATION_PLAN.md` 里程碑 1 组 A 已决定"BYOK 扶正为默认（`EndpointsConfig`/`ModelEntry` 已有 per-model api_key/env_key/base_url 基础设施）"，但默认表仍是 grok-* 专有名词。sampler 的 `attribution.rs`（`BEARER_SUFFIX_LEN`、`SamplingConsumer`）是专有归因残留。

补充两个运营相关的既有机制：sampler 自带 `retry.rs`（`classify_error`/`retry_backoff_with_jitter`/`RATE_LIMIT_RETRY_THRESHOLD`）与 `doom_loop.rs`（`DoomLoopSignalCollector`，重复失败信号收集），以及 `metrics.rs`（`InferenceLatencyStats`/percentiles）——这些是"模型运营"轴的错误分类与退避基座，参照 hermes 的 `classify_api_error` + fallback 链（`ref-analysis/hermes-agent.md` §4.5）可在此之上加 provider 级 failover，而不必新造。`nofy-circuit-breaker`（`crates/common/nofy-circuit-breaker/`）已用于 LLM/MCP/web fetch 的级联故障保护（docs/11 §四）。

### 生态

| 落点 | 路径 | 说明 |
|---|---|---|
| MCP | `crates/codegen/nofy-mcp/src/`（servers/oauth/credentials/acp_transport/liveness） | rmcp 2.1 + reqwest 0.13 被**隔离**在本 crate（lib.rs 注释：全仓其余用 reqwest 0.12）；stdio/HTTP/ACP 三传输 |
| 插件市场 | `crates/codegen/nofy-plugin-marketplace/src/`（catalog/git/index/installer/scanner） | official source 是 git URL（`OFFICIAL_SOURCE_GIT_URL`）；SHA 要求可配 |
| 插件注册 | `crates/codegen/nofy-agent/src/plugins/`（manifest/discovery/registry/install_registry/hooks_adapter/trust） | 插件可贡献 tools/MCP/hooks/subagent 类型 |
| 子代理解析 | `crates/codegen/nofy-subagent-resolution/` + `nofy-shell/src/agent/subagent/`、`mvp_agent/subagent_coordinator.rs` | 内置 general-purpose/explore/plan + 用户定义（`.nofy/agents/`） |
| workflow | `crates/codegen/nofy-workflow/src/`（engine/host/journal/meta/run/validate） | Rhai 引擎 + Journal 确定性回放 + 预算（MAX_PARALLEL=1024、DEFAULT_AGENT_BUDGET=128） |
| 插话 | `crates/common/nofy-interjection-core/src/`（buffer/events/format） | InterjectionBuffer + EventQueue + `<system-reminder>` 注入格式 |
| skills | `nofy-agent/src/prompt/skills.rs` + watcher 注入 reload（`nofy-shell/src/agent/app.rs:70-118`） | SKILL.md 发现 + 热重载经 ACP internal 方法 |

摩擦点：生态扩展面（plugins/hooks/skills/marketplace）全部挂在**进程内**注册表上，无常驻宿主——daemon 化后这些注册表的归属要重新划界。

workflow 引擎与 OS 常驻的接口已具备雏形：`WorkflowHostRequest` 枚举（`crates/codegen/nofy-workflow/src/host.rs`）含 `ReserveAgentCalls`/`ReleaseAgentCalls`/`SpawnAgent`/`Phase`/`Log`/`Telemetry`/`BudgetQuery`/`RenderTemplate`/`WriteScratchFile`/`ReadScratchFile`/`GitDiffSince`（docs/09 §一），`Journal` 支持确定性回放与暂停/恢复（`PauseKind::{User,BackOff,NoProgress,Verification,Infra}`）。这与 dsh 的 workflow seam（抽象类 `WorkflowEngine` + worker-thread provider，生命周期事件只读，`ref-analysis/deepseek-harness/08-capability-seams.md` §7）形状一致——本仓的 `WorkflowHostRequest` 就是现成的"主机请求"词汇，daemon 化时 workflow 的宿主请求应路由到常驻面而非会话内。

### 工程

| 落点 | 路径 | 说明 |
|---|---|---|
| 无 key e2e | `crates/codegen/nofy-test-support/src/mock_server.rs` | `MockInferenceServer`：`/v1/chat/completions`、`/v1/responses`、`/v1/messages` + `/v1/models`、`/v1/settings`、`/v1/user`、`/v1/storage`、`/v1/privacy/coding-data-retention`；expectation > scripted queue > echo 模式三级应答 |
| 脚本化响应 | `nofy-test-support/src/scripted.rs`、`inference_override.rs` | 纯数据 `ScriptedResponse`/`SseEvent`；`InferenceEndpoint`/`InferenceExpectation`/`InferenceRequestMatcher` |
| 进程夹具 | `nofy-test-support/src/{headless,acp_client,process,sandbox,leader,uds_proxy,counting_server}.rs` | headless 驱动、ACP 客户端、沙箱测试、UDS 代理 |
| 环境隔离 | `crates/codegen/nofy-env/src/lib.rs:96-115` `EnvVarGuard`；`nofy-workspace/src/lib.rs` ENV_TEST_LOCK；docs/12 §十 `LockedTestEnv` | 全局 env 测试锁 + RAII 恢复 |
| Mock 持久化 | `MockChatPersistence`（docs/03 会话持久化节） | ChatPersistence trait 的测试替身 |

摩擦点：evals 目录（docs/13 所述 `crates/codegen/xai-grok-shell/evals/`）在脱敏时整体删除（`SANITIZATION_PLAN.md` §1.5），度量回路（任务完成率/崩溃恢复率/压缩保留率/对账检出率）当前无脚手架——**待核实**是否已在别处重建。

---

## 3. 协议收敛分析

### 3.1 三套协议差异对照

| 维度 | ACP stdio | serve（ACP-WS） | Hub WS |
|---|---|---|---|
| 消息形状 | JSON-RPC 2.0 行分隔；`session/*` + `nofy/internal/*` | 同 ACP（逐行过 WS 文本帧） | tool 帧：`tool_call_request`/`session.bind`/`ToolNotificationFrame`；workspace.* 方法打包为 `workspace_rpc` tool |
| 词汇所有者 | `agent-client-protocol` crate（外部）+ `nofy-acp-lib`（消息/gateway/channel 类型） | 同左 | `nofy-tool-protocol`（ToolId/SessionId/HookFrame/TransportKind）+ `nofy_workspace_types::rpc`（RpcEnvelope/错误码） |
| 认证 | 无（管道边界） | bearer header 或 `server-key` query（`server.rs:90-108`） | 握手期 Principal：loopback bearer / 非 loopback OIDC 自动刷新（`hub_auth.rs`）；per-call 按 session 收窄 |
| 重连 | 无（进程即连接） | agent 持久 + 客户端重连后 session load + 录制 updates 重放（`replay.rs`） | `HubConnectionPool` 复用 + `on_reconnect` 回调（`workspace_ops.rs:1332`） |
| 会话模型 | MvpAgent 内 SessionRegistry（进程本地） | 同左 | workspace session 多路复用（per-session CWD/shell/toolset，`hub.rs:10-17`） |
| 传输实现 | tokio simplex + `LineBufferedRead`（`nofy-acp-lib/src/line_reader.rs`） | axum WS + mpsc 桥 | `nofy-computer-hub-sdk` 连接/借用/demux |

### 3.2 收敛为单一 schema-first 控制面的最小路径

**原则**（参照 openclaw gateway-protocol 的 TypeBox schema-first + dsh 的"词汇包是消费点"纪律，`ref-analysis/openclaw.md` §5、`ref-analysis/deepseek-harness/08-capability-seams.md` §1）：先定词汇与 schema，再挂传输；认证留在传输层，协议字节不掺认证（pi-server 做法，`ref-analysis/pi.md` §8）。

**Step 0 — 定 schema（新 crate，见 §4）**：控制面词汇直接**复用既有资产**，不新造：
- 事件骨干 = `nofy-session-journal` 24 事件词汇（已是封闭集、有不变量、有 reducer）；
- 会话/内容形状 = ACP 的 `ContentBlock`/`SessionUpdate` 类型（`agent-client-protocol` + `nofy-acp-lib`）；
- 工具面形状 = `nofy-tool-protocol`（ToolId/SessionId/ToolNotificationFrame）；
- 错误码 = `nofy_workspace_types::rpc` 的 wire code 表（`rpc_envelope.rs` 的 exhaustive match 纪律可直接继承）。
schema 载体建议 JSON Schema + 生成（仓内已有 `crates/build/nofy-proto-build` 的 protobuf 代码生成先例，protobuf vs JSON Schema 选型待核实）。

**Step 1 — serve 改造成控制面参考传输**：serve 已是"ACP 消息 + WS + bearer + agent 持久"，改动最小：把 `ServerConfig` 的 secret 认证换成控制面握手（token/设备配对），消息集从裸 ACP 行升级为 schema 校验后的控制面信封（违规即拒，参照 pi-protocol 的 `ProtocolValidationError`，`ref-analysis/pi.md` §8）。

**Step 2 — ACP 兼容桥的挂法**：`nofy-acp-lib` 已是传输无关的（`channel.rs`/`gateway.rs` 只依赖 mpsc + `AsyncRead/AsyncWrite`，`lib.rs` 导出面）。桥的位置 = **在 `AcpAgentChannel` 与控制面 channel 之间加一个双向映射层**：
- 入向：ACP `session/new|load|prompt` → 控制面 session 方法；
- 出向：控制面事件（journal 词汇）→ ACP `session/update|notification`；
- `nofy/internal/*` 扩展方法保留为控制面一等方法（它们本来就是超 ACP 词汇的扩展位）。
这样 `--stdio` 模式 = 控制面的 stdio 传输 + ACP 映射，编辑器兼容不丢；`mvp_agent/acp_agent.rs` 不动。

**Step 3 — Hub 降级为"工具传输"**：Hub 不再承担控制面职责，只作为 workspace tools 的远程传输（它本来就是 tool 宇宙）。`WorkspaceOps::Proxy` 已是这个形状；`hub_server.rs` 的 `workspace.*` 方法改为由控制面 daemon 授权后转发。MCP 维持独立（它是外部工具协议，不是控制面）。

**不收敛项**：relay/gateway 专有云 WS（`nofy-env` 两条 wss URL）随脱敏删除或参数化，不进控制面（`SANITIZATION_PLAN.md` §1.3）。

### 3.3 各步骤的文件级触点

| 步骤 | 触点文件 | 动作 |
|---|---|---|
| Step 0 | 新 crate（schema）+ `crates/common/nofy-session-journal/src/event.rs`（事件词汇引用，不改） | 把 24 事件词汇 + ACP ContentBlock + tool-protocol 类型收进单一 schema 包；错误码表从 `nofy_workspace_types::rpc` 迁入 |
| Step 1 | `crates/codegen/nofy-shell/src/agent/server.rs`（`ServerConfig`/`validate_auth`/`ws_handler`） | 认证升级为控制面握手；消息加 schema 校验；`RelayDest` 换成控制面 channel |
| Step 2 | `crates/codegen/nofy-acp-lib/src/{channel,gateway,message}.rs`（传输无关层）+ 新映射模块 | ACP↔控制面双向映射；`--stdio` 路径（`nofy-shell/src/agent/app.rs:32-61`）改走映射层；`mvp_agent/acp_agent.rs` 不动 |
| Step 3 | `crates/codegen/nofy-workspace/src/{hub.rs,hub_server.rs,workspace_ops.rs}` | `workspace.*` 方法改由 daemon 授权转发；`WorkspaceOps::Proxy` 语义不变 |
| 清理 | `crates/codegen/nofy-pager/src/acp/{leader_bridge.rs,tracker.rs}`、`nofy-pager-bin/src/main.rs:209-217/:413-430/:487-495` | leader 残留类型归并进控制面客户端状态；`resolve_leader_mode` 的 policy 收敛逻辑（flag > config > remote settings > sandbox）是 daemon 开关的现成形状 |

---

## 4. 新 crate 边界建议

依赖纪律参照 dsh 包级零耦合（`ref-analysis/deepseek-harness/08-capability-seams.md` §14：跨包直接 CALLS 近零，一切走服务注册/类型化事件；错误类型+词汇类型才是全包消费点）。本仓对应物：`nofy-session-journal`（Layer 1，零上层依赖）是已验证的范本。

### 4.1 `nofy-daemon`（上提 Leader 的 per-host 常驻宿主）

- **职责**：per-host 单实例（lock-file 选举，语义取自 `nofy-test-support/src/leader.rs` 的既有夹具）；宿主 session-registry、scheduler、approval-broker；持有控制面 WS/UDS 监听；崩溃后新实例经 journal resume 对账（docs/13 Phase 3 的未闭合 intent 清单）。
- **允许依赖**：`nofy-session-journal`、`nofy-convergence`、`nofy-workspace-types`、新控制面 schema crate、`nofy-config`/`nofy-paths`、tokio。
- **禁止依赖**：`nofy-pager*`（TUI）、`nofy-tools` 实现、`nofy-sampler`、`nofy-workspace` 的 handle 内部（只经 types）、任何遥测 sink。
- **trait 草图**：

```rust
pub trait DaemonControl: Send + Sync {
    async fn attach_session(&self, req: SessionAttach) -> Result<SessionLease, DaemonError>;
    async fn route_interjection(&self, target: SessionId, msg: Interjection) -> Result<(), DaemonError>;
    fn events(&self) -> broadcast::Receiver<JournalEvent>; // 词汇 = nofy-session-journal
}
```

### 4.2 `nofy-channel`（控制面传输抽象）

- **职责**：帧化（行分隔 JSON 或长度前缀）、认证握手、重连/退避、背压；传输无关（stdio/WS/UDS）。形状参照 `nofy-acp-lib/src/channel.rs` 与 pi-protocol 的 transport 抽象。
- **允许依赖**：tokio、serde、`nofy-secrets`（redaction）。
- **禁止依赖**：会话/工具/agent 任何语义类型（词汇经泛型或 schema crate 注入）。
- **trait 草图**：

```rust
pub trait ControlChannel {
    type Tx; type Rx;
    async fn accept(&mut self, auth: &dyn ChannelAuth) -> Result<Conn<Self::Tx, Self::Rx>, ChannelError>;
}
pub trait ChannelAuth { fn verify(&self, handshake: &Handshake) -> Result<Principal, AuthError>; }
```

（`Principal` 形状直接借 `nofy-computer-hub-core/src/transport.rs:16-40`，不新造。）

### 4.3 `nofy-scheduler`（耐久调度，从工具层上提）

- **职责**：one-shot + fixed-rate 耐久提醒/任务；决定落事件日志（dsh schedule seam 同款：建在会话事件日志上，无独立存储，`08-capability-seams.md` §9）；宿主在 daemon，工具（现 `nofy-tools/.../scheduler/`）降级为 thin consumer。
- **允许依赖**：`nofy-session-journal`（事件词汇 + 持久化）、`nofy-sqlite-journal`（落盘）、`nofy-paths`。
- **禁止依赖**：`nofy-tools`、`nofy-shell`、`nofy-sampler`。
- **trait 草图**：

```rust
pub trait ScheduleRuntime {
    fn arm(&self, spec: ScheduleSpec) -> Result<ScheduleId, ScheduleError>; // 决定写 schedule/change 事件
    fn list(&self, scope: SessionScope) -> Vec<ScheduleSnapshot>;
    fn cancel(&self, id: ScheduleId) -> CancelOutcome;
}
```

迁移成本注意：现 scheduler 的 `occurrence_journal.rs` 已有发生日志雏形，可整体平移（待核实其与 chat-state actor 的耦合深度）。

### 4.4 `nofy-approval-broker`（统一审批代理）

- **职责**：把四条审批路径（permission prompter、hooks `pre_tool_use` deny、plan-mode gate、sandbox auto-allow）收敛为单一审批词汇 + 事件流；决策写 journal（`permission.requested/granted/denied` 词汇已预留，docs/13 事件表）；支持远端审批端（daemon 路由到任意控制面客户端，替代 ACP `request_permission` 的本地假设，`permission/prompter.rs`）。
- **允许依赖**：`nofy-hooks`（HookDecision 类型）、`nofy-tool-types`、`nofy-session-journal`、`nofy-workspace-types`（permission 词汇表，`wire_enum!` 产物）。
- **禁止依赖**：具体工具执行、`nofy-sampler`、TUI。
- **trait 草图**：

```rust
pub trait ApprovalBroker {
    async fn request(&self, req: ApprovalRequest) -> ApprovalDecision; // 含 hook 链 + 人审 + 策略
    fn policy(&self) -> &dyn ApprovalPolicy;                          // 纯函数策略可换
}
```

### 4.5 `nofy-session-registry`（跨进程会话索引）

- **职责**：跨进程的会话身份/位置/状态索引（现 `mvp_agent/session_registry.rs` 的进程本地 map + `session_registry_client.rs` 的远端残留合并上提）；会话发现（含 foreign sessions 的 Claude/Codex/Cursor 只读源，`nofy-workspace/src/foreign_sessions/`）；存储建在 JSONL storage adapter 的 `list_sessions*` 既有能力上（`storage/jsonl/mod.rs:155-198`）。
- **允许依赖**：`nofy-session-journal`、storage adapter 类型、`nofy-paths`、`nofy-workspace-types`。
- **禁止依赖**：`nofy-shell`、`nofy-agent`、`nofy-sampler`。
- **trait 草图**：

```rust
pub trait SessionRegistry {
    async fn lookup(&self, id: &SessionRef) -> Option<SessionRecord>;   // 含 cwd/model/状态指纹
    async fn list(&self, filter: &SessionFilter) -> Vec<SessionSummary>; // 含 foreign 源
    fn watch(&self) -> broadcast::Receiver<RegistryEvent>;
}
```

**公共纪律**（五个 crate 一致）：错误类型与词汇类型住在各自 crate（dsh 纪律）；跨 crate 交互只经 trait/事件，禁止直接函数调用耦合；每个新 crate 先写 `lib.rs` 的 `//!` 层文档 + 不变量清单（本仓约定，docs/12 §十五）。

### 4.6 落地顺序与依赖关系

```
nofy-channel ──┐
               ├──> nofy-daemon ──> (serve/stdio 传输迁移)
nofy-session-registry ──┤
nofy-scheduler ─────────┤
nofy-approval-broker ───┘
```

1. 先 `nofy-channel` + schema crate（零语义依赖，可独立验收）；
2. 再 `nofy-session-registry`（只读起步：先索引既有 JSONL 会话目录 + foreign sessions，不引入写路径）；
3. `nofy-scheduler` 平移 `nofy-tools/.../scheduler/` 的 actor + occurrence journal（工具层保留 thin consumer，模型可见 schema 不变——dsh tool-workflow 的"强化引擎换入时模型看到的东西不动"原则，`08-capability-seams.md` §7）；
4. `nofy-approval-broker` 收编四条审批路径（先统一事件流，策略合并后置）；
5. 最后 `nofy-daemon` 组装，serve 模式成为控制面第一个传输（§3.2 Step 1）。
每步的验收基线：`cargo test` + `MockInferenceServer` 无 key e2e（§5.2），不依赖任何真实端点。

---

## 5. 风险地形

### 5.1 God-object 候选

| 候选 | 证据 | 风险 |
|---|---|---|
| `nofy-workspace/src/handle.rs` | **10,030 行**、62 个 pub fn、`WorkspaceHandle` struct 在 `:431`、5 个 impl 块（`:434/:4448/:4493/:4540`） | 全仓最大单文件；会话/Git/权限/hub/drain 全经此句柄；daemon 化的第一拆分对象 |
| `nofy-pager/src/acp/tracker.rs` | **6,713 行** | ACP SessionUpdate → scrollback 的有状态流式机；TUI 与协议词汇的耦合点，协议收敛时必动 |
| `nofy-shell` crate 整体 | Cargo.toml 中 58 处 workspace 内依赖；`src/session/` 80+ 模块（goal_classifier 一族就 10 个文件）；`MvpAgent`（`mvp_agent/mod.rs:653`） | SUMMARY.md §5.5 已警告 hermes 单文件膨胀是反面教材；shell 是 crate 级同构风险——loop/transport/registry/state 四边界切分建议对 shell 同样适用 |
| `nofy-workspace/src/workspace_ops.rs` | 2,463 行 | Local/Proxy 双模式的 ops 全集，收敛协议时是天然 seam，但体量说明它已在承担"协议适配层"职责而无其名 |
| `nofy-workspace/src/activity.rs` | 2,241 行 | 活动追踪，待核实是否可并入 journal 投影 |

### 5.2 可支撑无 key e2e 的既有基建

- `MockInferenceServer`（`crates/codegen/nofy-test-support/src/mock_server.rs`）：三推理端点 + models/settings/user/storage 端点，expectation/scripted/echo 三级应答，请求全记录、drop 即关——**等价于 pi 的 faux provider（`ref-analysis/pi.md` §3.4）的本仓实现**，脱敏后 CI 的无 key e2e 基座已存在。
- 配套：`scripted.rs`（纯数据 SSE 脚本）、`inference_override.rs`（按端点匹配的 expectation）、`headless.rs`/`acp_client.rs`（进程级驱动）、`sandbox.rs`、`uds_proxy.rs`、`counting_server.rs`。
- 可注入缝：`ModelsEndpoint` trait（`nofy-shell/src/agent/models/endpoint.rs:8-15`，"tests inject a fake"）、`MockChatPersistence`（docs/03）、`TerminalBackend`/`AsyncFileSystem`（docs/01 §2 IoC 缝）、`EnvVarGuard`/ENV_TEST_LOCK（env 隔离）。
- 缺口：evals 脚手架已删（§2 工程轴摩擦点）；崩溃恢复 e2e（docs/13 的 `--crash-recovery` SIGKILL→resume 模式）依赖的度量回路当前无家——**待核实**。

既有测试纪律可直接继承：journal 层的验收是 `cargo test -p nofy-session-journal`（crate 不变量）+ `cargo test -p nofy-shell runtime_journal`（接入层真实文件 I/O）（docs/13 §启用与验证）；env 变更测试经 nextest 进程隔离 + `cargo test --lib` 共享进程内的全局锁双保险（`nofy-workspace/src/lib.rs` ENV_TEST_LOCK 注释）；workspace-server 有独立 e2e 探针二进制（`crates/codegen/nofy-workspace/src/bin/workspace_server_probe.rs`：连本地 server、bind session、真实调用 `run_terminal_command`/`read_file` 断言回显，输出 `PROBE_OK`）——这是"常驻件 + 控制面"类改动的现成验收模板。

### 5.3 脱敏清单（crate 级，承接 `SANITIZATION_PLAN.md`）

| 组 | crate/模块 | 内容 |
|---|---|---|
| 专有认证 | `nofy-shell/src/auth/`（OIDC device flow/JWT/refresh）、`nofy-workspace/src/hub_auth.rs`（OIDC）、`nofy-auth`（bearer_fragment/retry_middleware 的 x.ai 语义）、`agent/auth_method.rs`（`xai.api_key` 一等 auth method） | 里程碑 1 组 B 删除项；BYOK 扶正依赖 `EndpointsConfig`/`ModelEntry` 既有 per-model 基础设施 |
| 遥测回连 | `nofy-telemetry`（Mixpanel emission/Sentry/OTLP HTTP/http.rs 事件发送）、`nofy-mixpanel`、`nofy-crash-handler` | 参照 pi-telemetry"契约 + NOOP 默认 + adapter 可选"替换（`ref-analysis/pi.md` §7）；`redact_common.rs` 保留 |
| 归因头 | `nofy-sampler/src/attribution.rs`（BEARER_SUFFIX_LEN/SamplingConsumer）、`nofy-pager/src/client_identity.rs` | openclaw 结论：归因头只允许发往用户显式选择的官方服务，建议移除（`ref-analysis/SUMMARY.md` §5.3） |
| 运营/商务 | `nofy-announcements`、`nofy-update`、`nofy-shell/src/extensions/billing.rs`、`agent/feedback_client.rs`、`nofy-config/src/campaigns.rs`（A/B） | 删除或默认关 |
| 云端残留 | `nofy-shell/src/remote/`（BackendClient/device-flow/RemoteSync）、`nofy-workspace/src/upload/`、`restore_fetch.rs`、`export_github.rs`、`nofy-env` 的 relay/gateway wss URL | relay/gateway 两条专有 WS 协议随脱敏处理（§3.2 不收敛项） |
| 编译时专有物 | `nofy-models/default_models.json`（grok-* 模型名 + docs.x.ai 链接）、`nofy-shell/src/sampling/error.rs:27-28`（docs.x.ai 错误文案） | 参数化；错误文案去链接 |
| 待核实项 | `nofy-voice`（厂商 STT 端点）、`nofy-shell/src/session/managed_mcp.rs`（managed 刷新回连）、`nofy-plugin-marketplace` official source 自动注册 | 是否默认外呼需逐个核 |

品牌/端点字符串热点（`SANITIZATION_PLAN.md` §1.1/§1.3，供脱敏与"协议收敛后残留面"评估）：`nofy-tools/src/registry/types.rs`（~145 处 grok/xai）、`nofy-workspace/src/handle.rs`（~35 处）、`nofy-shell/src/agent/config.rs`（`https://api.x.ai/v1` ~28 处）。`api.x.ai` 的引用分布在 sampler、web_search、image_gen、memory backend、auth credential_provider、remote client 等 20+ 文件（`SANITIZATION_PLAN.md` §1.3 表）——这意味着**模型运营的端点参数化是横切多 crate 的**，收敛控制面之前应先完成 `EndpointsConfig` 的单一来源化，否则控制面会把专有端点固化进 schema。

验收口径沿用 SUMMARY.md §5.4：默认配置启动零外呼（模型目录刷新类回连必须显式开关且默认关）；状态目录可经单一 env 重定位（本仓已有 `NOFY_HOME`，`nofy-config/src/paths.rs:28-35`）；所有落盘内容可 grep（JSONL/Markdown/SQLite 已满足）；CI 用 mock provider 跑 e2e（§5.2 已具备）；`rg -i 'grok|xai|x\.ai'` 归零。

---

## 附录：待核实清单

1. docs/11 的 `StdioReplayState`/leader 重连重放相对脱敏代码已过时——是否计划恢复 Leader（影响 §4.1 daemon 的 ACP 桥设计）。
2. `agent/session_registry_client.rs` 的远端 registry 服务端是否仍存在（sandbox 场景）。
3. `nofy-convergence` governor 在 headless max_turns 与子代理 turn 循环的接入点是否已落地（docs/13 标注"后续步骤"）。
4. evals/度量回路是否在别处重建（原 `crates/codegen/xai-grok-shell/evals/` 已删）。
5. 控制面 schema 载体选型：JSON Schema vs protobuf（仓内有 `crates/build/nofy-proto-build` 先例）。
6. `nofy-memory/src/dream.rs` 后台蒸馏的启用条件与外呼面。
7. `nofy-workspace/src/activity.rs`（2,241 行）与 journal 投影的重叠度。
