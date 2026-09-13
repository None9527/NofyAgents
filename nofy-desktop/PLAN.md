# nofy-desktop 框架计划（v1）

状态：**框架定稿，待开工** · 日期 2026-09-09 · 干净树，不继承 `desktop/` 任何运行期代码

依据（全部为本机可读的第一方或实测件）：

| 依据 | 用途 | 位置 |
|---|---|---|
| `nofy-pager` 510 文件 / 444,894 行 | 第一方 UX 实现，交互契约的权威 | `crates/codegen/nofy-pager/` |
| TUI 全功能规格 Part 1–5 | 61 slash 全表 / 41 视图 / 键位 / **ACP 事件→UI 全表** / **P1–P8 parity 施工表** | `desktop/docs/research/nofy-tui-full-spec.md` |
| 内核 ACP 面机器提取件 | stdlib 21 点 + `_nofy/*` 266 扩展名 | `desktop/src/docs/KERNEL-ACP-SURFACE.md` |
| 移植方案 §2.1–2.4 | 逐方法实测结果与客户端义务 | `desktop/src/docs/PORTING-PLAN.md` |
| UI↔内核域处置图 | 33 通道 K0/K1/K2/K3 分类 | `desktop/src/docs/UI-KERNEL-GAP-MATRIX.md` |
| seam 左列 2,535 行 | 可运行传输层的移植源 | `desktop/src/out/{main,host}/seam/` |
| 解码树 846,083 + 343,162 行 | 控件工艺参照（只读，不移植） | `desktop/src/src-reconstructed/`、`desktop/src/src/` |
| 活体应用 CDP 9400 | 行为预言机 + 截图对照 | PID 78808，`--app-path=desktop/src` |

---

## 1. 三条裁定

### 裁定 A：传输＝ACP，线路＝`nofy agent stdio`

**ACP 不是外挂适配协议，是内核自己的 UI 边界。** 证据：

- `nofy-pager/src/acp/spawn.rs` 头注：「Simplified to only support NofyShell (**in-process**) mode」，
  直接 `use nofy_shell::agent::MvpAgent`，经 `acp_channels()` 得到一对 tokio mpsc 无界通道，
  类型为 `AcpChannel<AcpClientMessage, AcpAgentMessage>`。**TUI 的 UI 状态全部由 ACP 消息驱动**
  （`app/acp_handler/mod.rs:150` 为路由总入口）。
- `nofy-acp-lib/src/gateway.rs`：「allows sending messages to it via a channel and it will forward
  them to an underlying connection」——同一套消息类型，传输可插拔（TUI 插 mpsc，外部客户端插
  `line_reader.rs`/`stdin_reader.rs` 的行式 JSON-RPC）。
- ⇒ **ACP + `_nofy/*` 扩展对 100% UI 保真度是已被第一方证明充分的**；266 个扩展名的存在
  正是为了把内核内部丰富度从这同一契约推给 TUI。

替代路径全部为死路：

- `run_headless`（`nofy-shell/src/agent/app.rs:273`）直接 bail：「use `agent stdio` (ACP) instead」
- `run_leader`（`app.rs:288`）同样 bail；`nofy leader list/info/kill` 已移除
  （`nofy-pager-bin/src/main.rs:125`）
- 进程内嵌对 Electron 不可行（需 Rust 原生插件或改 Tauri 壳，均超出本项目范围）

内核侧已为桌面预留身份：`app.rs:177`「Log the client that launched us (**set by nofy-desktop
when spawning nofy agent stdio**)」；`initialize._meta.clientIdentifier="nofy-desktop"` 被内核
认识，Desktop/TUI 类客户端拿到比 Generic 更丰富的 bash 作用域权限选项。

**选 stdio 而非 serve**：serve 有单客户端约束（内核只向当前那条 WS 推通知，
`server.rs:314-334`；第二条并发连接抢走/丢失事件流）且需 secret 发现（旧路 D1 的成因）。
stdio 无端口、无 secret、天然单父客户端、stdin EOF 即子进程关停。

### 裁定 B：拓扑＝单内核，归 Electron main 所有

```
Electron main
 ├─ 拥有唯一 nofy agent stdio 子进程（全应用一条 ACP 连接）
 ├─ 拥有 IPC 服务端（renderer↔main 的唯一边界，形状由本项目定义）
 └─ renderer（React）
      └─ 经 preload 暴露的单一 typed bridge 消费事件、下发动作
```

明确取消的结构：

- **无 host utilityProcess**。ZCode 的 main→host→renderer 三层与其 MessagePort 二进制 RPC
  全部不存在；R1/R2 两个协议边界随之消失，只剩 renderer↔main 一个，且形状自定义。
- **无 processesByWorkspaceKey 基数**。workspace 只是一个 cwd 参数，不是进程单位。
  内核侧本就工作区无关：`_nofy/session_summaries/workspace_list` 从单个内核返回
  `{ all_sessions: { <cwd>: [...] } }` 全部 cwd；`session/new` 按会话带 cwd。

### 裁定 C：干净室规则（不可动摇）

1. **禁止 import**：新树任何文件不得 import `desktop/`、`out/`、`src-reconstructed/`、
   `desktop/src/src/` 下的任何代码。允许移植的只有 §9 白名单里点名的 seam 文件，
   且移植＝**读其行为、重写为 TypeScript**，不是拷贝 JS。
2. **禁止改 `desktop/`**：该树自此为只读参照。不再有任何 renderer bundle 补丁。
3. **不做 1:1 像素复刻**：目标是给 nofy 做产品，视觉语言可参照 ZCode 的纪律
   （36–48px 顶栏、24px 状态栏、行三态），但布局与信息架构按 TUI 的 AgentView 纵切重排。
4. **内核零改动（本项目侧）**：本项目不改 `crates/`、不动 `~/.local/bin/nofy`；
   发现内核缺口→登记，不擅自改。
   **但基线不是纯净上游**：工作树已有未提交的内核改动（434 行增 / 7 文件——
   `nofy-config/src/loader.rs` +359、`nofy-shell/src/util/config/{persist,mcp}.rs`、
   `nofy-pager/src/config_toml_edit.rs` 等），实现的是 JSON 配置体系。
   那是既有工作，本项目**以它为基线**，不回退也不续改。
5. **配置真源＝`~/.nofy/config.json`（优先）/ `config.toml`（遗留回退）**。
   内核 `nofy-config/src/loader.rs:46` 的 `user_config_filename_at(home)`：
   config.json 存在则用它，否则 config.toml；两者都读成 `toml::Value`，
   写回**格式感知**（`persist.rs` 的 `atomic_write_string` 见 `.json` 目标即把
   TOML 文本转成 JSON，不会串格式）。本机实测：只有 config.json（1,385B），
   config.toml 仅剩两个 `.bak`。
   ⇒ 桌面侧配置层必须**格式感知**，且**优先走内核 RPC 写**
   （`_nofy/mcp/upsert|delete`、`_nofy/setApiKey`、`_nofy/settings/update`、
   `_nofy/internal/reload_models`）——因为内核的 `SAVE_LOCK` 只是**进程内**互斥，
   挡不住外部写者并发（继承缺陷 I2 的根因并未因 JSON 化而消失）。
   桌面私有 UI 状态写 `[desktop]` 段（内核已声明该段 owned by nofy-desktop、
   opaque to the CLI agent）。不引入 setting.json，不引入 `~/.nofy/v2/`。

---

## 2. 通信契约

### 2.1 客户端 → 内核（请求）

| 线路名 | 类型 | 要点 |
|---|---|---|
| `initialize` | request | 发 `_meta.clientIdentifier="nofy-desktop"`；返回 `agentCapabilities`、`authMethods=[{id:"api_key"}]`、`_meta.modelState`（完整模型表）、`_meta.availableCommands`、`_meta.cancelRewind`、`_meta.sessionRecap`、`agentVersion` |
| `authenticate` | request | 仅 `api_key` / `cached_token`，**无 OAuth** |
| `session/new` | request | `_meta` 支持 `sessionId`（客户端给 UUID）、`modelId`、`yoloMode`/`autoMode`、`sessionKind`（仅接受 headless）；响应 `_meta` 含 `isGitRepo/gitRoot/codebaseIndexed`、**`nofy/sessionConfig.options`（模型选择器直接渲染它）**、`nofy/sessionDetail` |
| `session/load` | request | 需 `{sessionId, cwd, mcpServers}`；**响应前**先以 `session/update` 流回放持久转录；`_meta.noReplay:true` 可抑制 |
| `session/list` / `resume` / `close` | request | resume 从不回放；close 回 `_meta["nofy/closeOutcome"]` 并推 `_nofy/sessions/changed{removed}` |
| `session/prompt` | request | 流式 `session/update`；响应含 `stopReason` 与 `_meta{requestId, totalTokens, modelId, cancellationCategory}` |
| **`session/cancel`** | **notification（无 id）** | 作为 request 发送得 **-32601** |
| `session/set_model` | request | 回 `_meta.model.Ok`，并推 `_nofy/session_notification{sessionUpdate:"model_changed"}` |
| `session/set_mode` | request | modeId 为 default 或 plan；**对非活跃会话会挂起**，只可对活跃会话调用 |
| `_nofy/*` 扩展族 | request | 会话生命周期 / 历史回放 / 摘要 / 队列 / 模型认证 / MCP / git·worktree·PR·hunk / 任务·子代理 / fs·terminal / 插件·hooks·skills·workflows·commands·memory / rewind / search |

**内核未实现（不得凭空造名）**：`session/set_config_option`、标准 `session/fork`（走
`_nofy/session/fork`）、`logout`。

### 2.2 内核 → 客户端（本项目必须实现的客户端侧）

> **权威来源已改判（2026-09-09）**：本节与 §2.1 的名字表不再以
> `KERNEL-ACP-SURFACE.md`（字面量计数、不分方向与种类）为准，改以
> **`packages/acp/src/generated/` 的生成表**为准 —— stdlib 层出自 ACP 官方 schema
> （Apache-2.0），扩展层出自 `crates/` 全树提取。复核账与三类判决
> （源码确认 / 源码矛盾 / 源码沉默）见 **docs/contract/kernel-ext-audit.md**。

| 线路名 | 类型 | 处置 |
|---|---|---|
| `session/update` | notification | 主流式通道。子类型：`user_message_chunk` / `agent_message_chunk` / `agent_thought_chunk`、`tool_call` / `tool_call_update`、`plan`、`available_commands_update`、`current_mode_update`、`session_info_update` |
| `_nofy/session_notification` + `_nofy/session/update` | notification | 扩展事件（snake_case 标签，60+ 种）。**回合结束依赖 `turn_completed{promptId, stopReason, usage}`**；`_nofy/session/prompt_complete` 是内核标注 legacy 的旧双生，重连场景不得依赖 |
| `_nofy/sessions/changed` | notification | `{upserted:[RosterEntry], removed:[sessionId]}`；activity 为 working/idle/needs_input/dormant/completed/dead 六态 |
| `_nofy/queue/changed` | notification | 队列全量条目 + runningPrompt 状态 |
| `_nofy/models/update` / `_nofy/settings/update` | notification | config.toml 热重载后推送（前者完整 `SessionModelState`） |
| `_nofy/mcp/{servers_updated, init_progress, tools_changed, server_status}` | notification | MCP 生命周期 |
| `session/request_permission` | **request（需应答）** | `{sessionId, toolCall, options:[{optionId,name,kind}]}` → `{outcome:{outcome:"selected", optionId}}`。**收到 `session/cancel` 时必须把所有挂起权限请求应答为 cancelled** |
| `_nofy/ask_user_question` | request | 多选问答，应答 `{outcome:"accepted", answers}` |
| `_nofy/exit_plan_mode` | request | 计划审批，应答 outcome 为 approved / cancelled / abandoned，可带 feedback |
| `session/elicitation` / `_nofy/mcp/elicit` | request | 表单追问 |
| 阻塞 hooks | request | `_meta["nofy/hooks"]`：pre_tool_use / stop / subagent_stop，decisions deny / block |
| `fs/read_text_file` / `fs/write_text_file` | request | **`clientCapabilities.fs` 声明 false**，内核用本地实现 |
| `terminal/*` | request | **不声明该能力**，内核自管；交互式 PTY 走 `_nofy/terminal/pty/*` 扩展 |
| `WaitForTerminalExit` | request | **拒绝**：返回 METHOD_NOT_FOUND 并轮询。第一方行为即如此（`nofy-pager/src/acp/mod.rs` 的 `wait_for_exit_not_supported`：「Both the interactive pager and headless mode reject this ACP method (the adapter falls back to polling)」） |
| `_nofy/mcp/sdk_call` | request | 仅当 `initialize._meta["nofy/mcp/sdk"]` 声明时；**本项目不声明** |

### 2.3 陷阱表（旧路已付费，不得重蹈）

| # | 陷阱 | 后果 |
|---|---|---|
| T1 | `session/cancel` 当 request 发 | -32601，且若 catch{} 静默吞掉 → 停止按钮永久失效 |
| T2 | stdout 写日志 | 污染协议线路，整个会话面 EPIPE 闸死（旧 D9/D6） |
| T3 | 第二条并发 ACP 连接 | 抢走事件流（serve 模式）；stdio 模式下则是多内核各写 `~/.nofy` |
| T4 | 对非活跃会话调 `session/set_mode` | 挂起 |
| T5 | 依赖 `_nofy/session/prompt_complete` | 内核已标 legacy，重连场景丢事件 |
| T6 | 期待内核打 `_meta["nofy/replayed"]` | 那是 TUI **客户端自己**的约定，内核不打 |
| T7 | 每 workspace 派生一个内核 | N 个工作区 = N 个 Rust 运行时 + **N 个 config.toml 并发写者**（read-modify-write 丢更新竞态） |
| T8 | 权限选项按 ZCode 语义渲染 | nofy 的选项级语义不同（allow-always-command 带选词范围、MCP scope Tool⇄Server 仅当名含双下划线） |
| T9 | 把 `sessionUpdate` 当 params **顶层**字段读 | 真形状是 **`params.update.sessionUpdate`**。旧文档 §2.3 的写法极易误读；record-turn 初版因此把 23 条 session/update 全记成 `?`、agentChunks=0、门假红。实测账 docs/contract/session-events-measured.md §1 |
| T10 | 对不带 `_meta.eventId` 的事件套用去重高水位 | eventId **只出现在进持久转录轨的事件上**（chunk 类 / tool_call 类 / available_commands / hook_execution / turn_completed）。`session_info_update`、`model_changed`、`tool_call_delta_chunk`、`response_completed`、`pending_interaction`、queue/roster/mcp **一律没有**——套上去会把标题生成与模型切换永久丢弃。实测账同上 §3 |
| T11 | 把 `response_completed` 当回合结束 | 实测一轮里它出现 **2 次**（工具调用前、轮末），每次对应一段模型响应。回合结束的权威信号是 `turn_completed`（实测早于 legacy 的 `prompt_complete` 1ms）。实测账同上 §5/§6 |
| T13 | 把 ext **通知**当请求发（`_nofy/toggle_plan_mode`、`_nofy/queue/*` 共 9 条） | 会等一个永不到来的响应——与 T1 同类但更隐蔽，因为这些名字看起来就像请求。源码判决：pager `effects/mod.rs:1127/1209` 用 `ExtNotification::new` 发，失败只 `tracing::warn`。已建 `EXT_NOTIFY` 独立表 + drift 门。见 docs/contract/kernel-ext-audit.md §2.1 |
| T12 | 录夹具不脱敏 | `copyConfig=true` 会把 provider 的 api_key 回显进 initialize 的 modelState。未脱敏的 golden-turn 实测含 **16 处 `sk-` 密钥 + 617 处 `/Users/<用户名>`** + hostname/agentId。录制必须走 `main/lib/redact.ts`，且 `audit:fixtures` 已入 verify 链 |

### 2.4 协议纪律

- **stdout 仅协议帧**（行式 JSON）。日志一律 stderr 或文件。
- 所有内核事件先过 **strict zod 门**再进 store；未知 `sessionUpdate` 标签显式记录并降级，
  不得静默丢弃（旧路「索引订阅软成功」掩盖过真缺陷）。
- 去重高水位：`last_applied_event_seq`，**replay 豁免**（第一方语义，
  `session_notification.rs:74` 的 `drop_unexpected_replay`）。
- 会话路由：状态变更永远落在拥有 session_id 的 agent；后台 agent 的流式块进自己的
  scrollback；子代理路由 Root→Child→竞态兜底（`routing.rs:126`）。

---

## 3. 目录树与职责

```
nofy-desktop/
├─ PLAN.md                    本件
├─ README.md                  干净室规则 + orientation
├─ pnpm-workspace.yaml
├─ packages/
│  └─ acp/                    ← 唯一契约包，main 与 renderer 共用
│     └─ src/
│        ├─ methods.ts        线路名常量（stdlib 21 点 + 用到的 _nofy/* 子集）
│        ├─ schema.ts         zod：请求/响应/通知形状（strict，未知键报错）
│        ├─ events.ts         KernelEvent 判别联合（由 TUI spec Part 4 逐条派生）
│        └─ caps.ts           clientCapabilities 声明（fs=false、terminal 不声明）
├─ apps/desktop/
│  ├─ main/
│  │  ├─ kernel/              内核子进程监督：spawn nofy agent stdio、生命周期、重启
│  │  ├─ acp/                 行式 JSON-RPC 编解码、pending 表、通知分派、重连
│  │  ├─ config/              ~/.nofy/config.toml 保注释读改写（tmp+rename 原子）
│  │  └─ ipc/                 renderer↔main 契约的服务端（本项目自定义形状）
│  ├─ preload/                唯一 bridge，typed，无 Node 能力外泄
│  └─ renderer/
│     ├─ core/
│     │  ├─ transport.ts      bridge 客户端 + 事件流订阅
│     │  ├─ store/            zustand slices（sessions/roster/models/queue/tasks/settings）
│     │  ├─ project.ts        KernelEvent → store action 的投影（唯一映射点）
│     │  └─ fixtures/         录制的真事件流回放器
│     ├─ ui/                  原语（Button/Menu/Sheet/Dialog/Tooltip/Toast/Switch/Input/Badge/Kbd）+ tokens.css
│     ├─ shell/               布局骨架：TopBar / FleetSidebar / Spine / RightRail / StatusBar
│     └─ features/
│        ├─ spine/            会话时间脊柱（轮/块/工具调用/思考/计划/时间戳）
│        ├─ composer/         输入器（草稿、斜杠与 at/hash 菜单、队列语义、运行中插话）
│        ├─ approval/         权限/计划/问答三类覆盖层（选项级语义保真）
│        ├─ fleet/            工作区 + 会话名册（activity 六态）
│        ├─ tasks/            活任务面（workflows/subagents/bg+monitor/scheduled 四源）
│        ├─ review/           git 变更 / diff / hunk 回滚 / worktree
│        └─ settings/         模型 / MCP / 技能 / hooks / 记忆 / 插件（直读写 config.toml）
├─ docs/
│  ├─ contract/               从三份权威件提炼的契约摘录（含 file:line 引证）
│  └─ fixtures/               黄金夹具：真内核录制的完整轮次事件流
└─ tests/                     契约门 / 夹具回放门 / 端到端
```

**只有两个包**（packages/acp + apps/desktop）。刻意不复制旧 monorepo 的七包铺开。

---

## 4. 技术栈

本机已就绪：node **v24.16.0**、npm 11.13.0、pnpm **11.7.0**。

| 层 | 选型 | 理由 |
|---|---|---|
| 壳 | Electron + electron-vite | 与既有工具链一致；node-pty / ssh2 等原生依赖生态成熟 |
| UI | React 19 + TypeScript **strict** | 与解码树同代，参照可读 |
| 状态 | zustand（细粒度 slice 订阅） | 对应 TUI「渲染层不拥有状态」；slice 化避免整树重渲 |
| 契约 | zod（strict schema） | 旧路 probe8 已证 strict 键集门禁有效 |
| 样式 | CSS 变量令牌 + Tailwind | 令牌从 out/renderer/assets/styles-*.css 重新提取（机械活） |
| 编辑器 | Lexical 0.42.0 | 与解码树锚定版本一致（bundle 指纹双锚） |
| 终端 | @xterm/xterm **6.x** + addon-fit | 5.5.0 那个锚只为对齐 ZCode bundle 指纹；新树无此约束，取当前稳定版 |
| 流式 markdown | **streamdown** + @streamdown/{code,math,mermaid,cjk} | 专为「边流边渲染」设计（半截围栏、半截表格、CJK 断行）。自己搓这个是公认的坑 |
| 虚拟化/滚动 | **react-virtuoso** + **use-stick-to-bottom** | 会话脊柱虚拟化 + 流式期滚动锚定；ZCode 手搓的 UnitSizeCache / buildRenderUnits / splitVirtualizedUnits 不必复刻 |
| 主题 | **数据驱动 JSON**（每主题一个文件）+ 明暗切换 | 正合「先按 ZCode 风格走、之后再调整」：先出一个 zcode.json，将来调整是改 JSON 不是改组件 |
| 高亮/图 | shiki 3.x、mermaid | P7 才需要，先不引 |

---

## 5. 事件→状态契约层（本项目的心脏）

TUI 的架构三句话（spec §0.1）直接照搬为前端纪律：

1. **Action → dispatch(纯同步) → Effect(异步) → TaskResult**
   ⇒ 前端：store action（纯同步改状态）→ effect（异步打内核）→ 结果回灌 store。
   **渲染层不拥有状态。**
2. **AgentView 纵切**（`agent.rs:156`）：
   status_bar → warnings → tasks → catalog → todo → scrollback(timeline gutter) → btw →
   queue → turn_status → banner → cta → follow_ups → prompt → shortcuts
   ⇒ 这段纵切**就是组件树**。桌面版把它翻译为 shell/ + features/ 的组合，
   顺序与可见性语义保持一致。
3. **可见性是状态函数**：命令/面板/芯片的显隐由特性门、会话态、能力共同决定
   （硬隐藏 3、visible() 5、工具门 1、模式门 11、session_scoped 28）
   ⇒ **菜单不能是死列表**。每个条目的可见性必须是 (sessionState, caps, config) => boolean
   的纯函数，且与内核 initialize._meta.availableCommands / available_commands_update 对齐。

投影层规则（`core/project.ts`）：

- **唯一映射点**：所有 KernelEvent → store action 的翻译只在这一个文件里发生。
  features 只读 store，不解析协议。
- 逐条对照 TUI spec Part 4 的「ACP 事件→UI 全表」实现，**一条不落、一条不造**。
  表里没有的事件 → 显式 unhandled 计数 + 开发期告警，不静默吞。
- 每个映射条目带引证注释（指向 spec 的段与 nofy-pager 的 file:line）。

---

## 6. 施工序

> 与旧 rebuild-plan 的差别：**S1 提前到 S0 之前**。传输层是全部未知量所在，
> 且它已有可运行移植源与可复跑探针，先做等于第一天就有绿灯。

| 步 | 内容 | 验收门 |
|---|---|---|
| **S1** | packages/acp 契约包 + main/kernel 监督 + main/acp 编解码。**移植 seam 左列 2,535 行的行为**（nofy-kernel-client / kernel-supervisor / acp-client / workspace-enum / session-title / nofy-config-toml / toml-parser），重写为 TS | ① initialize 拿到 modelState 与 availableCommands；② **录制一段完整轮次真事件流**存为 docs/fixtures/golden-turn.jsonl；③ 逐条对账 spec Part 4 的事件表，产出对账报告 |
| **S1b** | 夹具回放器：把 golden-turn 灌进投影层，断言 store 终态 | 回放门进 CI；此后任何投影改动都必须过夹具 |
| **S0** | 壳骨架：tokens（从 styles-*.css 提取）+ ui 原语 + ShellGrid（顶栏/侧栏/主区/右轨/状态栏）+ 主题切换 | 空壳截图，暗/亮两套；tsc strict 零错 |
| **P1** | **会话内环**（合格线核心）：spine 脊柱 + composer + 流式 + 停止 + 历史回放 + rename/fork/export/find/jump/内联编辑/timeline/copy | 真任务全流程走通；**「TUI 同动作可在 GUI 完成」** |
| **P2** | **审批保真**：权限选项级（选词范围±、MCP scope Tool⇄Server、reject+附言、pattern 编辑、光标预选链）+ plan 审批（行级评论、Inline/FileBacked 两源）+ QuestionView 多问题表单 + CancelTurn 子代理四选项 + 模式芯片三态 | elicitation / permission / plan 三类各演练一次；选项文案与 prompter.rs 逐字对齐 |
| P3 | 活任务面：tasks 四源 + todo + queue 全操作 + follow-up chips + btw 侧问 + send-now/interject + 转后台 | 后台任务与队列演练 |
| P4 | 上下文/用量/记忆/诊断：context bar + usage 全字段 + compact + recap + memory browser + doctor | 用量数字与内核 _meta 对账 |
| P5 | 生态面：extensions 五页签（hooks/plugins/marketplace/skills/mcp 运行态）+ agents/personas 管理 | MCP 增删改落 config.toml 并热重载 |
| P6 | 全局面：dashboard roster（attach/peek/行内回复/pin）+ 全局会话检索 + trash/forensics/worktree 运维页 | 多会话并行观测 |
| P7 | 媒体/查看器：BlockViewer 全屏 + LineViewer + 图片/视频/mermaid 内联 + 幽灵下一提示 | 查看器演练 |
| P8 | 桌面增强：主题跟随 / 原生通知 / tray / zen 布局 / 多 agent tab | — |

**合格线 = P1 + P2。** 这两块的参照物是完整的（Part 4 事件契约 + AgentView 纵切 +
解码树的 Conversation/Composer 族工艺参照 + 活体预言机 + 可运行传输层）。
P3–P8 为增量，可独立排期。

---

## 7. 验收门（每步通用）

1. `tsc --strict` **零错误**（不用 declare X: any 消错；旧路 7,153 处 any 是反面教材）
2. 夹具回放门绿（S1b 之后）
3. **三态演练**：断内核 / 内核重启 / 能力缺失——不得出现死按钮，必须诚实降级
   （连接瞬态＝琥珀 connecting；翻转不清数据，保留 "Last known: N"；能力缺失＝诚实文案）
4. 截图对照活体 9400（仅作行为参照，不作像素目标）
5. 进程不变量：**全应用恰好一个 nofy agent stdio 子进程**；ps 可验
6. 配置不变量：`~/.nofy` 下只有 config.toml + 会话存储 + 内核自身产物；无 v2/、无 setting.json
7. 内核不变量：crates/ 与 `~/.local/bin/nofy` 零改动

---

## 8. 不做清单

- 不复现云壳：oauth 登录墙 / 订阅升级 / 云设置同步 / bots / 反馈工单（域处置图 K2，本就该拆）
- 不做 leader / headless（内核已 bail）
- 不实现 WaitForTerminalExit（拒绝 + 轮询，与第一方一致）
- 不声明 clientCapabilities.fs 与 terminal 能力（内核自管）
- 不引入第二配置体系，不引入 ZCode 协议语义（v4 信封 / logEpoch / seq / resync / rowsRange
  全部不存在——**新 UI 直接消费 ACP 事件，没有中间协议**）
- 不移植解码树的 Conversation/Composer 族代码（只读其工艺，自己写）
- P7 之前不引 xlsx/pptx/pdf 查看器、shiki、mermaid

---

## 9. 参照物与移植白名单

**可移植（读行为、重写为 TS）——seam 左列 2,535 行：**

| 文件 | 行 | 价值 |
|---|---|---|
| `nofy-config-toml.js` | 613 | **降级：遗留回退专用**（见下方降级说明）。保注释 config.toml 片段编辑，tmp+rename 原子替换 |
| `toml-parser.js` | 573 | **降级：遗留回退专用**（见下方降级说明）。从出厂 main bundle 提取的 TOML parser |
| `nofy-kernel-client.js` | 489 | main 进程 ACP 单例；已吸收 acp-client 的已验证部分并修掉其已证错误 |
| `kernel-supervisor.js` | 316 | 私有 stdio 子进程拓扑（P0.5）+ attach-serve opt-in |
| `acp-client.js` | 279 | 帧分派 / pending 表 / 重连 / 事件面（注意其 cancel 缺陷已在 kernel-client 修正） |
| `workspace-enum.js` | 164 | 纯函数：ACP 主路 + dir-scan 回退 + 标题回退链 |
| `session-title.js` | 56 | 纯函数：首条真实用户消息回退，截断 80 字 |
| `nofy-v2-retire.js` | 45 | 一次性迁移（若目标机仍有 v2 残留） |

**降级说明（2026-09-09，配置真源改判为 config.json 之后）**：上表前两项合计 **1,186 行**
（占左列 2,535 行的 **47%**）从「头号资产」降为**遗留回退专用**。理由：内核配置真源已是
`config.json`，桌面侧读写 JSON 就是 `JSON.parse`/`JSON.stringify` + tmp+rename——
**PORTING-PLAN §6.1 那条「JS 生态无 toml_edit 等价物」的未决风险自动消解**。
仅当目标机上只有 config.toml 而无 config.json 时，才需要那条保注释编辑路径。
⇒ 无条件带走的核心收窄为 **1,304 行**：nofy-kernel-client 489 + kernel-supervisor 316
+ acp-client 279 + workspace-enum 164 + session-title 56。

**明确抛弃——seam 右列 2,338 行**（acp-agent-adapter.js 1592 / kernel-provider-source.js 305 /
agent-service-observer.js 168 / kernel-bridge.js 137 / workspace-registry.js 73 /
kernel-client-host.js 47 / nofy-backend.js 16）。
这些是 ZCode 形状的胶水：v4 信封翻译、为骗过 renderer 门槛而合成 ZCode 形 provider、
main→host 桥、zcode:* 通道名注册。**旧路 D2/D3/D6/D7/D9/D10/D13/D14/D15/D20 全部记在这一列。**

**只读参照（不得 import）：**

- `desktop/src/src-reconstructed/` 846,083 行逐字真值 —— 控件工艺的权威
- `desktop/src/src/` 343,162 行工程树（tsc exit=0）—— 语义命名与模块划分的参照
- `desktop/src/docs/*.md` —— 契约与实测账
- 活体 CDP 9400 —— 行为预言机

---

## 10. 继承缺陷登记（新项目不得复现）

| # | 旧路缺陷 | 新项目如何结构性避免 |
|---|---|---|
| I1 | **三套 adapter+内核**：host 的 ZCodeAgentProcessManager.processesByWorkspaceKey（out/host/index.js:13390）按工作区各派生一个 agent 子进程，cwd 取 e.workspacePath（index.js:13363）；实测三进程 cwd 分别为 /Users/mac、/Users/mac/nofy-build、/Users/mac/nofy-build/web | 裁定 B：无 per-workspace 基数，单内核归 main 所有；验收门 5 用 ps 硬验 |
| I2 | **config.toml 三个并发写者** → read-modify-write 丢更新竞态（单次写原子，跨进程不原子） | 单内核 + config 写入集中在 main/config/ 单点，串行化 |
| I3 | **只读真值 md5 基线被打破**：styles-CdEGpc2x.js 期望 48d71d48… 实测 4d5f3f69…；src-HCld2afU.js 期望 f5edd6a1… 实测 70673a78…——量具被污染，从此无法判断解码树是否还对得上产品 | 裁定 C 第 2 条：desktop/ 自此只读；新树不改任何出厂字节 |
| I4 | **renderer bundle 里手写新功能**：zzModBox/zzModFilter/zzModLock 一整套 modality 选择器直接写进 214,056 行、标识符最小化的 chunk（+168/−50） | 新树全部为 TS 源，tsc strict 门；不存在 bundle 手术这个动作 |
| I5 | **垃圾工作区占一整套内核**：/Users/mac/nofy-build/web 只剩 372M 孤儿 node_modules、零源码，却获得独立 adapter+内核 | workspace 是数据不是进程；枚举结果只影响列表渲染 |

---

## 11. 未决（需产品裁定，非技术不确定性）

1. **范围档位**：P1–P8 做到哪一档？spec 把 TUI parity 定为地板，天花板由产品定。
2. **仅 CLI 动词是否 GUI 化**：task 委托 / schedule / approval 批量 / trash /
   forensics / worktree 运维 / lease / du / trace。TUI 亦无入口，属增强而非 parity。
3. ~~modality 面~~ **已定（2026-09-09，实测）**：**不照搬旧路那个五模态选择器**。
   活体内核 initialize 回的 agentCapabilities.promptCapabilities 是
   `{ image: false, audio: false, embeddedContext: true }`——本内核**不接受** prompt 里的
   图片与音频内容块。故 modality 一律**按 capability 门渲染**，能力为 false 的模态不出现在
   UI 上（§5 第 3 条「可见性是状态函数」）。证据：docs/contract/initialize-measured.md §4.2。
   待复核：该 capability 是否随模型而变——录含 session/new 的夹具时一并取回。
4. ~~设计令牌口径~~ **已定（2026-09-09）**：先按 ZCode 风格走，令牌从
   desktop/src/out/renderer/assets/styles-*.css 机械提取，落成数据驱动的 zcode.json 主题；
   「做清晰之后再调整」＝改主题 JSON，不动组件。
5. ~~多窗口~~ **已定（2026-09-09）**：照「一个 agent 进程 + N 个消费者」范式——
   上游 initialize 响应**缓存并回放给后到的消费者**（后加入的窗口不重新 initialize 内核）、
   未应答的内核→客户端请求跨重连存活、重启走退避计数，恢复期间对消费者发**诚实的
   「正在恢复」并主动断开**而不是假装可用。窗口间会话占用用 roster 的 activity 六态提示。

---

## 11b. 能力门裁定（2026-09-09，详见 docs/contract/capability-gates.md）

内核只有**两个** `_meta` 能力门（全树仅两个 `parse_*_capability`），加标准 fs/terminal：

| 能力 | 裁定 | 依据 |
|---|---|---|
| `nofy/folderTrust.interactive` | **声明 true** | 不声明 ⇒ `folder_trust_prompt.rs` 文档所述「DORMANT no-op」+「session was already created with **project servers GATED**」⇒ 仓库级 MCP/配置**永久 gated 且 GUI 无解锁途径**。**但本机自建内核上它 inert**（`folder_trust.rs:161-167`：local build 一律 auto-trust、永不提示；本机 `nofy --version` = 0.2.121 (1431aa44508c)，commit 即本仓库 HEAD）⇒ 是**发布阻塞项，不是开发阻塞项** |
| `nofy/codeNavigation.enabled` | **不声明**（P6 再开） | 它门的是代码库索引启动资格（`code_nav.rs:19-40`）。声明了内核会为一个**尚无界面**的功能在后台起索引。与 folderTrust 不同：不声明**不会**让任何东西被 gated |
| `nofy/mcp/sdk_call` | **无门可声明；P5 前不实现** | `_meta["nofy/mcp/sdk"]=true` 是内核**单向通告**（`acp_agent.rs:387`）；sdk_call 是 emit-only 反向方法（`extensions/mcp.rs:2011-2025`）。不实现 ⇒ in-process SDK 型 MCP 服务器不可用，须**逐服务器诚实上报**。本机 `mcpServers=[]`，唯一加载的 gitnexus 是 source=local 常规服务器 ⇒ 当前无影响 |
| `fs.*` / `terminal` | **false / 不声明** | `agent_ops.rs:2654-2662`：只有声明 true 才委托；否则内核本地实现/自管 |

**陷阱（新增 T14）**：能力门必须写在 `clientCapabilities._meta` 里。
`folder_trust_prompt.rs:375` 明写「Production reads `client_capabilities.meta`,
**not** top-level request meta」。initialize **顶层** `_meta` 是 clientIdentifier 的位置；
写错地方内核读不到且不报错。旧 seam 的 handshake 只有顶层 _meta，照抄即静默失效。
`connection.test.ts` 有守卫专门盯这条。

**folder trust 应答语义**（`folder_trust_prompt.rs:221-262`）：`{outcome:"trust"}` ⇒
持久化授权 + 热重载项目 MCP/插件/managed/auth；`{outcome:"reject"}` ⇒ 保留 dedup key
（同进程不再问）、拒绝不持久化；超时/不可解码/error ⇒ 判为「not a decision」、
释放 dedup key ⇒ **每次开会话重问**。故无人裁决时回**显式 reject**，不回 JSON-RPC error。
授权会持久化 ⇒ **绝不能自动 trust**；UI 未落地前默认显式 reject + 告警 + 界面诚实说明。

release-stamped 构建上的开关优先级（`folder_trust.rs:152-178`）：
env `NOFY_FOLDER_TRUST` > 用户配置 `[folder_trust] enabled` > managed > **default true**。
⇒ UI 须展示实际生效状态，不能假定它一定开。

## 12. 协议契约：机器生成，不手抄（2026-09-09 定案）

`packages/acp` 分两层：

- **stdlib 层＝生成物**。`agent-client-protocol-schema 0.11.4`（**Apache-2.0**，LICENSE 已随
  schema 入库）自带 `src/bin/generate.rs`，用 schemars draft2020-12 对
  `JsonRpcMessage<OutgoingMessage<AgentSide, ClientSide>>` 求出
  `schema.unstable.json`（290KB）+ `meta.unstable.json`（权威线路名表：
  agentMethods 24 / clientMethods 11 / protocolMethods 1）。两份产物已入库
  `packages/acp/schema/`，`scripts/gen-wire-names.ts` 再由 meta 生成
  `src/generated/wire-names.ts`（含 meta 的 sha256 指纹）。
  手写常量一律**引用生成值 + `satisfies Record<string, AgentWireName>`**，拼错在 tsc 直接失败。
  复现命令（须用 nofy 锁定的版本与 feature）：

```sh
# nofy-build/Cargo.lock: agent-client-protocol 0.10.4 + schema 0.11.4, features=["unstable"]
RUSTUP_TOOLCHAIN=1.94.0 cargo run --bin generate --features unstable --release
```

- **扩展层＝手工**。`_nofy/*` 不在 ACP schema 内，来源仍是
  `desktop/scripts/extract-kernel-acp-surface.py` 的产物
  （`desktop/src/docs/KERNEL-ACP-SURFACE.md` §B）。

**这一步已经回本**：生成器第一次跑就抓到手写表里的真错——初版把 Rust 枚举变体名
`KillTerminalCommand` 反推成线路名 `terminal/kill_command`，权威值是 **`terminal/kill`**。
`test/wire-names-drift.test.ts` 已把它钉成回归门，并额外守：生成物与 meta 的 sha256 同步、
方法表基数不得缩水（防用错 crate 或漏 feature）、EXT 名必须归一且不与 stdlib 冲突。

## 13. 进度与下一步

一条命令跑全部门：`pnpm verify`
＝ gen（codegen 幂等）→ typecheck ×2 → test（123 例：acp 37 + app 86）→ audit:fixtures
→ **build（vite ×3）** → smoke → smoke:recovery。

### 已完成

- [x] **S1 传输层**。`packages/acp`（契约）+ `main/acp/connection.ts`（stdio 单传输）
      + `main/kernel/{supervisor,bin,test-home}.ts`。smoke 7/7：initialize 拿到
      modelState 与 availableCommands、全进程恰好一个内核子进程、帧零坏、子进程回收。
- [x] **协议 codegen**（§12）。ACP 权威 schema 入库 + 线路名生成 + 10 条 drift 门。
      第一次跑即抓到 `terminal/kill_command` 的手抄错。
- [x] **NOFY_HOME 隔离**。默认 hermetic，隔离生效可断言（workspace_list 为 0，真库 5/82）。
- [x] **恢复门**（11/11）。SIGKILL → 察觉 → 清账 → 自动重派生 → 单内核不变量 → 无孤儿。
      过程中修掉连接层一处真瑕疵：原先先发 `status:false` 后清 `initialized`，
      消费者会在「已断连」回调里读到 `isInitialized===true`。
- [x] **S1b 黄金夹具 + 回放门**（23 例）。`golden-turn.jsonl` 为真内核完整轮次
      （54 帧 / 4,274ms / stopReason=end_turn），已脱敏。实测账见
      `docs/contract/session-events-measured.md`——它推翻了旧文档的三处记载
      （判别字段嵌套层、eventId 覆盖规律、response_completed 的语义）。
- [x] **归一化层** `renderer/core/events.ts`：线路形状 → 应用形状的唯一入口，
      表外事件显式产出 unknown。
- [x] **夹具卫生门** `audit-fixtures.ts`：密钥与真实路径为硬红线，已入 verify 链。

- [x] **投影层** `renderer/core/project.ts`（538 行）+ 极小 reducer store
      （`store/store.ts`，唯一写入通道是 dispatch）。回放门 `test/projection.test.ts`
      **18 例全绿**：零 unhandled、脊柱形状（1 user / 2 agent / 1 tool，被 2 次
      response_completed 正确切段）、文本重组、段级与轮级 usage 不混用、
      去重高水位、T5（去掉 prompt_complete 终态不变）、T10（无 eventId 的事件重放不被丢）。
      **回放门当场抓到一个真 bug**：`tool_call_delta_chunk` 只有首帧带 tool_call_id、
      后续靠 tool_index 关联，按 id 关联会造出幽灵工具卡（详见
      session-events-measured.md §8.1）。
- [x] 能力门三条裁定（§11b）+ 陷阱 T14（能力必须写在 clientCapabilities._meta）
- [x] **权限流夹具** `golden-permission.jsonl`（两轮：allow-once 批准 / reject-once 拒绝，
      13/13 门）+ P2 逐字对齐回放门。实测账 docs/contract/permission-flow-measured.md：
      选项全表 4 条逐字、拒绝路径 stopReason=cancelled 且文件未写、
      `enable-always-approve` 在线路上只是 allow_once（开 YOLO 是客户端职责，
      须另发 `_nofy/yolo_mode_changed`）。
      **前置发现**：本机 config.json 是 `ui.permission_mode="always-approve"`，
      该模式下内核**完全不发**权限请求 ⇒ 隔离 home 需支持 configOverrides 才能录。
- [x] 共享回放工具 `test/helpers/replay.ts`（按 phase 分段回放）
- [x] **重连+回放夹具** `golden-replay.jsonl`（三段：live / SIGKILL 重连后 load /
      noReplay）+ 8 例去重回放门。**去重语义定案**：单一高水位正确，
      **不需要** epoch 重置（replay-dedup-measured.md §5）。核心发现：扩展事件有
      **两条轨**——`_nofy/session/update` 持久可回放、`_nofy/session_notification`
      即发即弃；回放**乱序到达**；load 会**新产生**事件（含真的又跑一次的
      session_start hook）；`_meta["nofy/replayed"]` 线路级零出现（判定 doubly 确认）。
      过程中修掉两个自身缺陷：`ready()` 在死亡窗口返回陈旧结果、录制器不截断。

- [x] **P1 硬前提已解**：冷启动标题从 `session/load` 响应的
      `_meta["nofy/sessionDetail"].title` 取（**零额外往返**）。5 条读路径形状全部实测，
      见 docs/contract/session-read-shapes.md；落为 `session/hydrated` action +
      `hydrateFromResponse()`，并有端到端门禁。
- [x] **端到端接线**：`core/kernel-port.ts`（传输无关端口）+ `core/bind.ts`
      （入站信号 → dispatch）+ `core/effects.ts`（13 个 Effect，闭合 TUI 的
      Action→dispatch→Effect→TaskResult 环）。Effect 层是**请求/通知之分的强制点**：
      queue/* 与 togglePlanMode 结构性地只能走 notify，cancel 只能走 cancel 原语
      （陷阱 T1/T13 在类型与测试双层守卫）。16 例端到端门。
- [x] 三条调不通的读路径移入 `EXT_UNVERIFIED_PARAMS`（`session/state` 与
      `session_summaries/session_list` 回 Invalid params；`session/load_history`
      **有分派臂却回 Method not found**）——「有分派」≠「可按显然参数调用」。

- [x] **S0 Electron 壳**（2026-09-09，真内核真界面端到端验过）。
      - 边界三件套：`preload/contract.ts`（9 通道 + 类型，三进程共用的唯一形状）、
        `main/ipc/bridge.ts`（buffer/sticky/outstanding 信号路由）、
        `renderer/core/ipc-port.ts`（`adaptIpcBridge`，与 `adaptConnection` 同形）。
        bind/effects/project **一行未改**跨进程——「边界透明」门用真夹具
        `assert.deepEqual` 证明跨 IPC 与直连终态逐字段相等（含「内核先跑、界面后挂」
        的启动缓冲路径）。契约说明书 `docs/contract/ipc-boundary.md`。
      - `main/ipc/hold.ts`：把内核→客户端请求挂住等 renderer 裁决。不写这一层，
        权限请求会在到达界面前被 connection 的 listenerCount fail-safe 静默取消。
      - 第一个真界面：ShellGrid（顶栏/左栏/脊柱/审批区/输入区/状态栏）+
        令牌驱动的样式（`renderer/ui/styles.css` 全手写，只消费 tokens.css 变量）。
        审批卡选项**逐字**渲染实测四条；`enable-always-approve` 选中后补发
        `_nofy/yolo_mode_changed`（真开 YOLO 是客户端职责，实测账 §3）。
      - 令牌提取器修一处**级联语义** bug：拍平 `@layer`/`@supports` 包裹会让
        `:root` 的亮色值在暗色下反赢（unlayered 压 layered 的规则被丢）。
        症状是「看得见灰块看不见字」，由首屏截图 + getComputedStyle 自检抓到。
        账见 `docs/contract/tokens-measured.md`。
      - 无人值守自检手段入库：`NOFY_SCREENSHOT`（capturePage 落盘）、
        `NOFY_WINDOW_X/Y`（坐标锚点）、`NOFY_ISOLATED_HOME=1`（隔离 home +
        permission_mode 覆盖成 default，否则审批面永远不出现）；
        隔离 home 在 SIGTERM 路径也收尸（exit 钩子；此前只覆盖 before-quit，
        信号强杀会把含真实凭据的临时目录留在 /tmp——已清并加门）。
      - 真键盘路径验过一整轮：输入 → Enter → 流式脊柱（user 块 / agent 块带段级
       usage / hook 事件折叠）→ 轮级 usage 与 stopReason 上状态栏 → 标题实时回写。

- [x] **代码侧组织**（2026-09-09）。renderer 按特性域分 `features/{shell,conversation,approvals}`；
      跨进程/跨线路代码集中到 `seam/`（main/seam、renderer/seam），装配的形状类型住 core
      （`core/runtime.ts`，与 KernelPort 同构：形状与实现分离）。
      `test/dep-guard.test.ts` 把守则变成门：features 不准 import 线路名包 / main / seam /
      不准碰 window·document；core 与 seam 不准碰 DOM；main 不准碰 react/DOM。
      首跑即抓到 App.tsx 直接碰 localStorage ⇒ 搬去 `ui/prefs.ts`（ui/ 是唯一允许碰 window 的区域，
      与 theme.ts 同先例）。**新增豁免＝改门文件＝一次可评审的决定。**

- [x] **UI/UX 参照账**（docs/contract/uiux-reference.md）。证据三源对照：活壳截图（设置面+主面）、
      逆向源码（WorkspaceShell 6017 行 / Sidebar 5636 / SidePanel 4789 / TopBar 3098 /
      Conversation 8342 / Composer 9321 / stores-{core,session,tasks,workspace}）、实测契约。
      裁定：**界面跟 ZCode 的组织，代码不跟**。四区语法＝侧栏（动作栈+工作区分组+任务区）｜
      对话列｜右辅助 pane（pane↔session 绑定模型记为裁定）｜顶栏只留面包屑与窗口开关；
      composer 工具条承载 附件/权限模式/模型/推理档/发送；布局开合态持久化。
      明确跳过：main/host/scheduler 拓扑、flat modules 平铺、底部终端/浏览器 dock
      （未声明 terminal 能力）、office/pdf 预览族、Payment/Onboarding 等。

- [x] 壳按四区语法重组，真机截图验过（/tmp/nofy-s6-ia.png，易失）。模型选择器从顶栏移进
      composer 右组（ZCode 的位置）；权限模式位以「未接线」占位芯片**显式存在**——
      生效模式的线路来源待录 settings 读路径（uiux-reference.md §3），不猜不藏。

- [x] **UI/UX 工艺批 1/2**（2026-09-10，用户裁定「太简陋」后）。图标系 22 枚自绘、
      自绘弹层替掉全部原生 select、markdown 渲染（React 节点无注入面）、品牌空态+建议芯片、
      状态栏降级为诊断弹层、回合本地计时、滚动条/selection/focus/过渡全局手感。
      真轮次与空态截图验过；与活壳的剩余差距逐条登记在 uiux-reference.md §7
      （高亮/表格/diff 汇总条/子智能体浮层/设置面/⌘K/可拖拽分隔/亮色走查）。

- [x] **UI/UX 工艺批 3**（2026-09-10 晚）：代码块达到活壳结构级——语言条/复制/行号
      （CSS counter）/自写高亮（ui/highlight.tsx 字符扫描器，ts/js/rust/py/bash 族）；
      markdown 表格；亮色主题走查（修 kbd 反色一处）。真轮次截图 /tmp/nofy-s10-code.png、
      /tmp/nofy-s11-light.png。剩余差距刷新在 uiux-reference.md §7。
- [x] **壳槽位改正 + 像素门第一轮**（2026-09-10，用户指正「右上角不是 theme 切换，
      看清 shell 和左边栏」后）。对活壳逐个 aria-label 取数（CDP eval，含点开任务后的
      会话态与 tabs 第二档），改正：卡片头右簇＝帮助/切换终端/展开·收起侧边面板三枚
      （主题/设置/诊断**搬去侧栏页脚**：齿轮菜单 + 账号卡槽位的诊断菜单）；卡片头左＝
      标题 + 路径胶囊 + ⋯（空态为空）；侧栏叠层四枚（切换侧栏/后退/前进/新建任务，
      后退前进＝会话激活历史栈 navhistory.ts）；动作区四行（新建任务行是 DIV，
      上一轮选择器漏看）；tabs 分组|项目 + 展开全部/筛选/归档；列表＝分区头→项目行→
      任务行（roster 全量进列表，未加载可点 session/load）；队列条搬去 composer 上方。
      纯模型新增 sidebarModel.ts（分组/排序/紧凑时间）与 hotkeys-help.ts（键位记档面，
      与 App.tsx 的 hotkeyMap 双向对账门）。**像素门**：自身实例开 NOFY_DEBUG_PORT=9444
      同选择器自量，与活壳逐行相等（zcode-live-metrics.md §1.2）；测试 133 例全绿。
- [x] **composer 工具条按活壳重排 + 像素门第二轮**（2026-09-10）。chat-composer-region
      逐枚取数（会话态）：输入区 min-h-10/leading-5 首行顶格、工具条 h-28 gap-4、
      左簇 添加上下文/切换模式(shield-alert warning)/电脑操作(monitor-cog)、右簇
      上下文计量(12px 环, aria 带已用/总量)/选择模型(package)/推理档(brain)/发送(28×28
      radius-8 实心 primary)。ContextMeter 从 72px 横条改成活壳的 28×28 圆环；
      发送钮从 32 圆钮改 28×28 方块；三个未接线位（模式/电脑操作/推理档）灰着 + title 写明
      缺哪条读路径。region 相对坐标与活壳全等（zcode-live-metrics.md §1.4）。
      cdp-dump 新增 shot 模式：交互后的界面也能进像素门。

### 下一步

**（2026-09-11 修订：分阶段版。主线＝生态面施工序；43 条读路径已全部实测，
见 docs/contract/ecosystem-shapes.json；排序＝用户价值 × 风险。
每阶段收尾动作相同：像素门差表（zcode-live-metrics.md §1.5 起）＋亮色走查＋pnpm verify。）**

**阶段 A —— #4 审查 pane + diff 汇总条**（下一轮，从取解剖开始）
- [x] **已完成（2026-09-11）**：A0 取解剖（侧边面板审查 tab、汇总条、文件行、diff 体
      是 shadow-DOM web component diffs-container，gutter 38/行 h-20/折叠行 h-32；
      顺带量到终端=底部 dock，给阶段 B）；A1 数据层（effects 三读 + readers 三纯函数）；
      A2 视图（ReviewPane 自绘 unified diff：diffModel.ts 解析+折叠，8 例门；
      未跟踪文件展开才发 fs/read_file 全行画增行）；A3 入口（⌘K 审查面板转真、
      DiffChip 浮在对话区右上、aux 宽改 548 对齐活壳）。解剖账 zcode-live-metrics.md §1.5。
- A0 取解剖：CDP 量活壳审查面（入口、diff 汇总条、文件列表、单文件 diff 视图）；
  活壳需带改动的工作区（本仓自己就有未提交改动）。教训 §1.3：先量再动。
- A1 数据层：effects 加 git/status、git/diffs（from="HEAD"）、git/files（version:"HEAD"）
  三个读 effect；readers 加三个纯函数＋单测（陷阱：from 小写静默空，探针已记）。
- A2 视图：AuxPane 加「审查」tab——汇总条（+增/−删/文件数）→ 文件列表（status 芯片）
  → 单文件 diff（git/diffs＋git/files 取 HEAD 侧；渲染复用 ui/highlight.tsx 与 --color-diff-* 令牌）。
- A3 入口：⌘K「审查面板」由灰转真。

**阶段 B —— #3 终端 pane**（全序唯一状态机，放 A 后）
- [x] **已完成（2026-09-11）**：B0 解剖（活壳 dock＝对话列底部：根 p-3 pb-2/gap-2/bg-background、
      头 h-28＝「终端」+tab 列（名=cwd 末段、重名 " 2"）+两枚 28×28、体 flex-1、非活动片隐藏不卸载、
      xterm DOM renderer 13px+终端 mono 栈；收起时 .xterm 仍 0×0 在 DOM ⇒ 收起≠销毁）；
      B1 依赖（@xterm/xterm 6 + @xterm/addon-fit，renderer 第一个第三方运行时依赖）；
      B2 接线（core/ptybus 流总线＝记档的「流不进 store」例外；effects 六动作；dockModel 纯模型 9 例门：
      busy≠退出、无变化同引用、missing、interactive 过滤、活壳命名口径；TerminalDock：接管走 pty/load
      回放且 isReplay 先 reset、收起不销毁、ResizeObserver+FitAddon 报真实 rows/cols）；
      B3 入口（卡片头「切换终端」转真 + ⌘J（我们自己的绑定，hotkeys-help 双向对账）+ 布局键 dock-open）；
      B4 门（scripts/pty-smoke.ts 8 条：create/回显/input 键负对照/list 存活/pty 回放/kill/kill 后消失/
      默认 shell 就绪后执行；hermetic 无凭据也能跑，本机约 4s；已进 verify 链）。
      真机验收（CDP 9444 驱动我们自己的实例）：dock 507×280 与活壳度量同、fish+starship 首屏 <1.1s、
      paste→执行→输出回写 xterm、收起再开历史在且 pty 仍活、第二 tab 名 "nofy-desktop 2" 与活壳口径同。
      顺带修了两处真窗口才看得见的视觉缺陷（UA 按钮壳、xterm 视口黑底），账记 zcode-live-metrics.md §1.6。
- [x] **打磨轮（2026-09-11，侧栏 + dock）**：按活壳 computed 值逐项对账改正——动作行 fs14/radius8、
      segment 改「5% 容器底 + 文字态」（删滑动胶囊）、区段头纯小标题 + 工具钮悬停才现、
      工作区行去计数/chevron 改名字后活动点、任务行 16 槽恒在但点按需、页脚 32 圆头像芯片、
      dock 标签 fs14/芯片 27 高 + selected 底；顺带修页脚窄侧栏溢出。亮色走查过。差表 §1.7。
- [x] **面板首屏 + 标签管理轮（2026-09-11）**：侧边面板补上活壳的两块缺失界面——零标签首屏
      （居中标题副题 + 三列卡片网格；终端卡=dock 真动作、辅助对话/浏览器灰卡）与标签模型重构
      （头行 chevrons 触发钮 + 可横滚芯片组 + 「+」dropdown；「搜索标签页」弹层=搜索框 + 打开的/
      最近关闭的两段，行内相对时间与 × 齐全）。活壳关 tab 量空态后已恢复原状；差表 §1.8。
      我们实例 CDP 验收四态：首屏 / 双芯片头行 / 弹层含最近关闭段 / Escape 关层。
- [x] **删「会话活动」设定（2026-09-11 用户裁定）**：侧边面板标签只剩 文件/审查；首屏卡与 + 菜单
      同步收掉。roster 读路径保留（侧栏未加载会话 + session/load 还在用）。
- [x] **抓取 ZCode 子智能体体系（同日晚批）**：三面=会话内 AgentToolView 工具块（IconBot + 8 色
      调色板色徽 + 嵌套子工具 + 「在右侧打开」）/ 侧栏按需 tab（子智能体会话只读 bot 图标、子智能体
      目录 list-tree）/ 顶栏汇总岛 SummaryAgentsSection（耗时·计数、行点击开侧栏）。差表 §1.9。
- [x] 子智能体落地批：先录内核 child tool calls / roster 父子关系夹具，再按 §1.9 提案三面实施。
      （被晚二批取代：线路证据改从源码取＋roster join，三面已实施；清账 2026-09-12。）
- [x] **子智能体落地批（2026-09-11 晚二批）**：内核线路证据改从源码取（task wire 名 / <subagent_result>
      页脚 / 子会话 id join roster），三面实施：脊柱 AgentCard（IconBot + 8 色色徽 + 嵌套列 +
      在右侧打开）、侧栏「子智能体」目录 tab、卡片头 AgentChip（chipstack 与 DiffChip 同栈）。
      store 新增 resultText 捕获（tool_call_update.content type=text）；agentModel 纯模型 + 7 条门。
      刻意不画：嵌套子工具列表（无线路）、子会话只读 tab（history 读路径 Method not found）、
      顶栏汇总岛（我们没有 summary stack 壳）。差表 §1.9 落地批注。
- [x] **composer 电脑操作开启才显示（同批用户裁定）**：未接线 ⇒ 整枚不画；接线批传
      computerUseEnabled + onToggleComputerUse 后芯片带绿点出现。
- [x] 录一轮真子智能体轮次夹具（模型自发 task 调用），把 AgentCard 运行态/回传在真数据上走查。
      （走查改真内核真轮次完成＝晚三批、四态截图在案；夹具录制欠件归支线 1。清账 2026-09-12。）
- [x] **真轮次走查（2026-09-11 晚三批）**：真内核跑 explore 子智能体轮次，帧级更正四处线路
      （嵌套 content wrapper / 后台派发通知 / 轮询 rawOutput join 质量档 / 轮询块折进 agent 卡），
      四态截图在案；cleanAgentOutput 摘 meta 行与页脚。夹具录制仍欠（录脚本只支持固定只读 prompt）。
- [x] **agent 块形态更正（2026-09-11 晚四批）**：按活壳 ToolLayout 逻辑（有 summaryAction 不渲染
      内联内容、canToggle=false）改为单行摘要 + 整行点击进目录；删内嵌 details。真轮次复验在案。
- [x] **后台胶囊批（2026-09-11 晚五批）**：右上 AgentChip 与 composer .bgworks 改由
      runningAgentRows（所有 running，回合内+detached，活壳实机同口径）驱动，补 .bgworks CSS；
      接 SessionUpdate::SubagentFinished 进 SessionState.subagentFinished，使 detached 子智能体
      结束后胶囊消失。活体复现：running=两处出现 / 结束=两处消失。单测五态在案。
- [x] **侧栏可移动批（2026-09-11 晚六批，用户报「左侧栏无法移动」）**：分隔条命中区 4px→8px
      （居中骑侧栏右缘）+ 居中 2px hover 指示线 + 双击恢复默认宽；活体复验 264→344→双击回 264。
      工作区行改真拖拽排序（.proj draggable + hover grip，reorderProjects 纯函数 + LayoutPrefs.
      projectOrder 持久化，po= 段 URL 编码、空序不写保持旧键逐字不变）；删掉永远 Disabled 的
      「移动项目分区」假按钮（不放假按钮纪律）。单测：prefs 往返/旧键兼容 + sidebar 排序/重排。
- [x] **主区域去内嵌框（2026-09-11 晚七批，用户裁定）**：.card 去 border + radius、.shell__main
      去右/下 4px 内缩缝 ⇒ 侧栏以右整块通栏。有意偏离活壳卡片形态，度量表 §1.1 已标 ⚠️。
- [x] **右侧面板可拖宽（2026-09-11 晚八批，用户报「右侧还是不能拖动」）**：.aux 左缘加
      .aux__handle（与左侧同规格 8px 命中 + 2px hover 线 + 双击恢复默认），宽度进 LayoutPrefs.
      auxWidth（a= 段、默认不写保持旧键逐字不变）；.aux 改 flex:none 让拖拽宽度精确生效
      （原先可 shrink 导致 548 渲染成 511）。活体复验 628→708→双击回 548。
- [x] **删 aux 面板的终端入口（2026-09-11 晚九批，用户：顶栏有了）**：AuxPane 首屏「终端」卡与
      「+」菜单终端项移除（dockOpen/onToggleDock props 一并下线）；终端开合只留顶栏「切换终端」
      + ⌘J + dock 自身关闭钮。活体复验：全窗终端入口只剩 cardhead 一枚，顶栏开关 dock 正常。
- [x] **dock 三修（2026-09-11 晚十批，用户三点）**：① dock 头删「终端」二字标签；② 标签的 ×
      原为 .dock__tab 的兄弟节点（框外）⇒ 芯片外观上移到 .dock__tabwrap（:has 判活动态），× 落进
      框内、hover/活动常显；③ 补顶缘拖高把手 .dock__resize（6px 命中 + 2px hover 线 + 双击恢复
      默认），高度进 LayoutPrefs.dockHeight（dh= 段、默认不写）。活体复验 280→340→双击回 280。
- [x] **终端滚动条统一（2026-09-11 晚十一批，用户：ui 不统一）**：.dock .xterm-viewport 的
      scrollbar-width:thin 删掉——标准属性会让 Chromium 忽略全局 ::-webkit-scrollbar 自定义，
      终端因此走浏览器默认细条。删后终端与全应用同族（10px 轨 + 圆角 thumb）。活体复验
      computed scrollbar-width=auto + 截图同族 thumb。
- [x] **终端滚动条二批（同晚，用户：还是宽的跟全局不一致）**：真凶是 xterm 6 自带 vscode 风格
      DOM 滚动条（.xterm-scrollable-element > .scrollbar.vertical，14px 实心 slider）叠在全局原生
      滚动条上面。隐藏自带这根（display:none），只留全局同族原生条；滚轮/拖拽走 viewport 原生不受
      影响。活体复验：自带条 0×0/display none、nativeGap=10（仅全局那根）。
- [x] **玻璃/接缝/深浅色批（2026-09-11 深夜，用户：整体外观和 zcode 差距大、zcode 是玻璃材质、
      接缝整齐；并指点「逆向解析的老版本直接就有 ui 样式 去找」）**：
      ① 找到老版本（3.7.6）逆向树的直接可读 UI 样式：desktop/src/src（230 个 tsx，className
      逐字可读，WorkspaceShell.tsx 3366-3570 即壳层布局）、desktop/src/src-reconstructed
      （757 个 pretty jsx）、出厂 authored CSS styles-BxSv8qTx.css；更老的 fork 树
      （~/.Trash/zcode-fork、Documents/Codex/2026-06-17/zcode）另有 styles-DK_Mqp_v.pretty.css。
      ② 活壳 3.11.2 CDP 复核壳层：WindowShell=bg-background-alt（60% 半透明＝玻璃底）、
      aside 全透明、separator=w-px + my-6 + mask 渐隐发丝线、#content=p-1 pl-0 pt-0、
      主 section=rounded-xl + border-border + bg-background 不透明卡。
      ③ 落地：.sidebar 改透明（坐玻璃上）；.shell__main 恢复右/下 4px 内缩；.card 恢复
      圆角 12px + 1px 边；.shell__handle 视觉改 1px 发丝线 + 两端渐隐 + hover 60% 边色
      （命中区仍 8px）。此前「通栏」裁定针对卡内套框，外壳这圈是 ZCode 本体观感。
      ④ 修构建丢精度：vite build.cssTarget=chrome136，esbuild 不再把 oklch()/color-mix()
      降级成 lab()（dist 从 oklch 0 处→124 处）。
      ⑤ 验收：235 个 --color-* 令牌与 docs/contract/zcode-live-vars.json（活壳 3.11.2 解析值
      存档）换算 sRGB 后 **0 mismatch**；暗/亮两主题真窗截图复核玻璃与接缝；
      typecheck + 168 测试全绿。
- [x] **空板批右栏扩展（同夜三批，用户更正：是右侧）**：空板族升为左右共用 .emptyboard
      （原 .sidebar__emptyboard 改名）；.aux 也设 container-type: inline-size。右栏五处空态
      全部换空板：开标签引导卡图标 clamp(16px, 5cqw, 24px) 随栏宽缩放、卡片网格改
      auto-fit minmax(6.5rem, 1fr) 窄栏折行不挤碎；文件树无根/搜索无匹配、审查无 git/
      工作区干净、子智能体目录空，各配自适应图标（folder/search/branch/check/bot）＋
      人话文案（顺带清掉 cwd、staged/unstaged、subagent_id 等术语）。
      实测图标宽：栏 320→16px、360→17.9px、760→24px 封顶。typecheck + 168 测试全绿。
- [x] **侧栏空板批（2026-09-11 深夜二批，用户：左侧栏空板图标自适应没做）**：空态从一行
      内部术语文案（「尚无已知会话（roster 为空）」）换成居中空板：自适应图标 +
      标题 + 一句人话提示。图标尺寸 clamp(28px, 20cqw, 56px)，尺寸源是 .sidebar 的
      container-type: inline-size——拖宽/拖窄侧栏图标随栏宽缩放，纯 CSS 容器查询、
      不引 resize 监听（dep-guard 不变）。项目视图零项目时同族空板（folder 图标）。
      实测：栏宽 264→图标 52.8px、420/560→封顶 56px、恢复后回 52.8px。
      typecheck + 168 测试全绿。
- B0 取解剖：活壳卡片头「切换终端」开在哪里（底部 dock／侧面板）与其度量。
- B0 取解剖：活壳卡片头「切换终端」开在哪里（底部 dock／侧面板）与其度量。
- B1 依赖：引 @xterm/xterm——renderer 第一个第三方运行时依赖 ⇒ dep-guard 豁免评审
  （改门文件＝可评审决定，与 prefs.ts 同先例）。
- B2 接线：pty create/load/resize/kill＋input（notify + base64 data）；输出帧 base64 解码→xterm.write。
  **回显验证纪律**：通知族没有错误通道，写入必须读回回显才算成功（pty/input 教训），
  并落进测试（写一条命令、断言输出帧里出现）。
- B3 入口：卡片头「切换终端」由灰转真＋⌘J。

**阶段 C —— #5 生态面**（marketplace 292 / skills 155 / plugins / mcp，只读面）
- 2026-09-12 取解剖裁定（docs/contract/ecosystem-anatomy.md）：逆向树复核**更正**旧记——
  四面住**设置面分区**（SettingsView modules/Settings.tsx:879 + 分区组件族），不是滑入面板；
  ⇒ 阶段 C 与阶段 D 的 #6 合并施工：设置面壳 + 插件(含市场)/技能/MCP 三分区只读先行。
  安装/卸载写路径未实测 ⇒ 只读＋灰按钮＋title 写明（纪律不变）。
- [x] **C 数据层批（2026-09-12）**：readers 四纯函数（readSkills/readPlugins/readMarketplace/
      readMcpServers，snake/camel 双键与 mcp status 双键兜底）＋effects 四请求
      （eco/skills|plugins|marketplace|mcp → EXT_CLIENT_REQUEST.*_list）＋门 4 例
      （test/readers-eco5.test.ts）。typecheck + 172 测试全绿。
- [x] **C UI 批（2026-09-12）**：设置面立起来（features/settings/）：壳层照逆向树
      SettingsView 语法（左玻璃导航 h-8 分区行 rounded-xl / 组标题 text-ui-sm subtlest /
      右段 p-1 pl-0 pt-0 + 圆角卡 + 内容 max-w-4xl gap-8 / 标题 text-2xl semibold）。
      首批四分区：通用（主题+内核版本）/ 插件（已装列表+市场子表 295 条真数据）/
      技能 / MCP（gitnexus 行：状态灯+工具数，展开工具芯片）。只读纪律：安装/启停
      灰按钮+title 写明。接线：侧栏「插件市场」动作行与页脚齿轮「设置…」开设置面；
      MCP 分区订阅 state.mcpServers（内核 mcp 事件投影）活刷新，不轮询。
      装机旧内核差异再兜一处：mcp tools/toolCount 在 session 对象内（13 工具实测现形）。
      门：settingsModel 纯模型 4 例 + 全量 176 测试绿；暗/亮真窗截图在案。
- [x] **模型选择器改正批（2026-09-12，用户：模型选择页面做的不对）**：三处错一次修——
      ① 菜单向下开被窗口底裁掉 ⇒ 改 up（活壳 ModelSelector contentSide=top 同纪律）；
      ② 内核 sessionConfig.options 是**模型项与推理档项混装一张表**（session_config.rs
      build_session_config_options：category=model / category=mode），旧实现整表塞进
      模型菜单还把 category 当 hint 画成「model」噪声 ⇒ 新增 splitModelOptions 拆两族，
      模型菜单只吃 model 族、去 hint、保留选中勾；③ 推理档由永远灰按钮升级为真菜单：
      mode 族非空时渲染（选中态来自 options.selected），选中经 session/set_model 的
      _meta.reasoningEffort 发出（内核 pager SwitchModel effects/mod.rs:1516-1535 同线路）；
      当前目录模型不产 mode 族时仍灰按钮＋title 写明（灰按钮比假按钮诚实）。
      端到端实测：菜单上开四模型项、切 qwen3.8-max 成功、reload 后触发器保持新模型。
      门：model-options 2 例 + 全量 178 测试绿。
- [x] **#7 用量面批（2026-09-12）**：设置面加「数据与统计 / 用量」分区（活壳注册表同组同词）：
      上下文窗口卡（used/total、usagePct 条 + 内核 autoCompactThresholdPercent 阈值线、
      四段分解芯片 系统提示/工具定义/消息/其余 + 工具数/消息数/调用数/压缩数）＋本轮用量卡
      （turn_completed.usage 九量：入/出/合计/缓存读/缓存写/推理/调用次数/接口耗时）。
      token 全由内核给，界面零自算。**顺带抓出真 bug**：readContext 没拆 {result:…} 信封，
      自落地起一直静默 null（ContextMeter 环因此永远画 0 弧）——拆信封后用量面与环同时活。
      门：settings-model 用量纯函数 3 例（分段钳 ≥0 / 缺段 null / k-M 与 ms-s 档位）+ 181 测试绿；
      真窗截图在案（14.5k/262.1k、6%、阈值线现形）。
- [x] **用量面重做批（2026-09-12 二批，用户拿活壳使用统计页对比：完全不是一回事）**：
      活壳那页是仪表盘（五卡 + 热力 + 趋势 + 模型占比），内核却只给单会话用量
      （_nofy/session/usage = 会话 ledger）⇒ 干净室解法＝本机用量账本：
      ui/usageLedger.ts（localStorage、去重键 会话+numTurns、5000 条上限）在
      turn_completed.usage 投影变化时追加；聚合全在 features/settings/usageModel.ts
      纯函数（ISO 周键儒略日算法、±1 天跨月跨年、连续天数、桶化、趋势拆线 Top3+其他、
      模型占比、万/亿与分钟档格式化），门 8 例。UsageDashboard 自绘 SVG/CSS 网格
      （不引图表库）：五卡（累计/峰值/时长/当前连续/最长连续）→ Token 活动热力
      （每日 53 周×7 格 / 每周 / 累计三档）→ 每日趋势（近 7/30 日、按模型拆线）→
      模型用量环 + 行；热力色走令牌 sky 族（暗 theme brand=白，不能当数据色）。
      截图用种子数据验设计、验完即清（账本回到真实空态，从装机日起攒）。
      全量 189 测试 + typecheck 绿。
- [x] **用量面归位批（同夜三批，用户裁定：上下文窗口/本轮用量不该在设置统计里）**：
      两块会话级实时卡从设置用量分区删除（设置统计只留仪表盘四块：五卡/热力/
      趋势/模型占比，与活壳使用统计页同构）。上下文窗口的活数据仍在 composer
      计量环（session/info 轮询）；本轮用量若以后要露出，归回合脊柱/环弹层，
      不进统计面。顺带清掉 .use__* 死规则 1.1k 行字符。189 测试 + typecheck 绿。
- [ ] D #6 设置面写路径（下一批）：main 本地 config.json + 新 IPC 通道（ipc-boundary.md 同步、
      dep-guard 门评审）；通用分区从只读转真；侧栏齿轮主题入口收敛进设置面。

**阶段 D —— #6 设置面＋#7 用量面**
- #6：内核无 config 读扩展 ⇒ main 读写本地 config.json，新增一条 IPC 通道
  （ipc-boundary.md 与契约文档同步、dep-guard 门）；分组词汇沿用活壳；
  设置面落地后侧栏齿轮菜单的主题入口收敛进设置面。
- #7：session/usage 9 量＋context 四段分解；落地后 ContextMeter 环由 span 换成真按钮开此面。

**支线**（穿插做，不挡主线）
1. 补夹具：plan / ask_user_question / cancel / subagent 四份＋permission 变体
   （reject+附言是审批卡唯一缺的实测，录到即补输入框）；subagent 夹具录到即开 subagent pane。
2. 写路径实测：queue 撤销（活壳排队芯片 ✕）、session 重命名/归档（⋯ 菜单）——录到即把这两处转真。
3. codegen 第二段：zod strict schema（packages/acp/schema/schema.unstable.json）替换宽松读取。
4. 追一条矛盾：load_history 有分派臂却回 Method not found（已登记 EXT_UNVERIFIED_PARAMS）。
5. 脊柱虚拟化＋codeblock 下载/shiki/mermaid（等长轮次夹具到再做）。
6. store 域切四片（单 store 单 dispatch 不变）。

**排序理由**：A 先于 B——git 三读是纯请求/响应、无状态机、风险低，且顺带积累 diff 视图组件；
B 带硬依赖与写入回显纪律、风险最高；C/D 是面类、读路径全实测、可拆子智能体并行。
**明确不做**（uiux-reference 已裁定）：云项目图标、移动端远控、office/pdf 预览族、
Payment/Onboarding、底部浏览器 dock。

**阶段 E —— composer 工具条五控件转真（2026-09-12 批，212 测试绿）**
分析结论先行：五控件里四个内核早已给全线路，只有「思考强度」是真门（门在模型目录
supports_reasoning_effort，不在 UI）。落地：
- 上下文圆环浮层：HoverCard 形态逐字对照逆向树（w-80/rounded-xl/bg-menu/p-3/space-y-3、
  SegmentedProgress h-2、图例行 tabular-nums）；数据换内核真字段，含此前没读的
  usageCategories 三行（与 messageTokens 重叠 ⇒ 单列「已计入消息」，不进堆叠条）；
  条上加 autoCompactThresholdPercent 刻度。色阶混色改往 --color-menu（surface 半透明，
  往透明色混在 oklab 下不改变色相，三段会塌成同色）。
- 斜杠面板："/" 开头且无空白时开；数据 = available_commands_update（167 条），
  分组依据实测 _meta.scope（有=技能/无=命令）；选中填 "/name " 文本——内核自己在
  prompt 里解析斜杠命令，不造第二条线路；↑↓/Tab/Enter/Esc 全键盘；超 12 条诚实报数指 ⌘K。
- 「+」添加上下文：embeddedContext:true 旧结论纠正后转真。选文件走 _nofy/search/fuzzy
  （open/change/status 全实测）；发送时每项变 resource_link 块（uri 三斜杠），内核自己
  展开 @路径 进上下文——实机验证：附加后 context.used 14,461→27,752（+13,291 tok）。
- 权限模式芯片：三源合成当前档（roster.yolo / settings auto_permission_mode_enabled /
  current_mode_update）；写走 session/set_mode（plan/ask/default）+ nofy/yolo_mode_changed
  （auto/always-approve，四键逐字对齐 acp_agent.rs 读取面）。顺手修两处死线路：
  旧 yoloModeChanged 载荷 {sessionId,enabled} 内核一个键不认（审批卡「全放行」静默无效）；
  内核切 ask/default 不推 current_mode_update ⇒ 记 set_mode 成功回执。读回补 roster/pull
  （_nofy/sessions/list，冷启动也拉一次）。
- 思考强度：改为「有档才画」。内核不支持的模型既不给 category=mode 选项、也会静默丢弃
  我们发的 reasoningEffort（model_switch.rs:127-143）⇒ 永久灰按钮只是噪音，整枚不画。
  待用户裁定：是否给 DashScope 三模型在 ~/.nofy/config.json 开 supports_reasoning_effort。

**阶段 E2 —— 「+」四行菜单与 @/$ 触发器（2026-09-13，活壳截图对照，217 测试绿）**
- 「+」改活壳同构四行菜单：添加附件／使用 @ 添加上下文／使用 / 选择能力／使用 $ 选择技能
  （行内键帽 .menu__kbd；MenuItem.label 放宽成 ReactNode）。
- @ 族：查询住在草稿 token 里，内核全文收集 @token（prompt_parser.rs:205-228），选中就地
  替换成 "@相对路径 "（cwd 下剥相对，join cwd 后等价）；文中任意位置可触发，前一字符须是
  边界（代码里的 @ 不抢键）。
- $ 族：纯界面触发器，只认草稿第 0 位——技能最终落成 "/name "，而斜杠只在首块开头生效
  （slash_commands.rs:1479-1489）；数据 = availableCommands 里 scope!=null 的本地过滤（154 条）。
- / 与 $ 两行在「插进去也是死命令」的草稿状态下灰着并给原因（诚实灰按钮纪律）。
- 三族共用 PickerPopover 壳：附件自带输入框走 fuzzy；@/$ 无输入框、键盘归 textarea。
- 顺手修：菜单开着时 Esc 只在触发器上生效 ⇒ overlay 开层即聚焦（tabIndex=-1），
  焦点在输入框里也能 Esc 关层。

**阶段 E3 —— 用户报「功能都不对」后的实机复现修复批（2026-09-13，219 测试绿）**
按用户视角把活体当真操一遍（CDP 真键鼠 + 控制台监听），复现并修掉四个真 bug：
1. **审批卡把 composer 顶出视口**（最严重）：两张以上权限卡叠到 ~700px，spine 压成 40px，
   工具条落 y=862（视口 860）。修：.approvals flex 0 1 auto + min-height 0 + max-height 45%
   + 自滚；.card__conversation overflow hidden。实机三张卡（1058px 内容）→ 审批区 295px 自滚、
   composer 回 y=798。
2. **孤儿审批卡**：turn_completed 后挂起请求不清，留下点不动的卡。修：收尾清该会话挂起请求；
   回放门新增「终态必空」断言；「请求到达过」的断言改成逐步轨迹（去重 id 数），
   因为夹具里第一张在收尾时被清、第二张随后才到，峰值并发只有 1。
3. **中文不打空格 @ 不触发**：旧边界白名单把 CJK 挡门外。修：改成「前一字符不是
   路径/标识符续接符（字母数字 . _ / \ - @）就触发」；mail@host、foo@bar.ts 仍不抢键。
4. 斜杠面板与 @/$ 浮层可同屏叠画 ⇒ 互斥（斜杠优先）；菜单 Esc 焦点问题见 E2 顺手修。
 
**阶段 E4 —— 「添加附件」改系统选文件框（2026-09-13 用户裁定，实机全链路验过）**
· 用户报「添加附件没有 finder 窗口」：此前给的是应用内模糊搜索，方向错。
· 新增第 10 条 IPC 通道 nofy:pick-files（contract/preload/register 三处 + ipc-boundary.md 同步）：
  dialog.showOpenDialog(openFile+multiSelections)，取消＝[]；载荷 {path,name}。
  它是唯一「非内核」通道：OS 能力不进 KernelPort 形状。
· 「+」菜单「添加附件」行 → 系统对话框 → 芯片；@ 族继续走应用内 fuzzy（引用语义≠附件语义）；
  PickerPopover 删掉自带输入框分支（附件不再用它）。
· 实机 e2e：CDP 点菜单行 → Finder「打开」对话框 → ⌘⇧G 输路径回车 → 芯片 PLAN.md 出现
  （AX 树可见「移除附加 PLAN.md」）→ 点 × 清除。218 测试 + typecheck 绿；主进程改动需重启实例。

**阶段 E5 —— 权限菜单对齐活壳四档双行式（2026-09-13，用户报「控制不对」+ 活壳截图）**
· 旧五档单行菜单（默认/询问/计划/自动/全放行）退役，改活壳权限菜单的四档双行式
  （标题+描述、左图标、当前档整行底色+右勾）：变更前确认 / 自动编辑 / 计划模式 / 完全访问。
· permModel 重写为四档单选语义：选一档即清另两轴（confirm→mode default+双清；autoedit→auto_mode；
  plan→mode plan；full→yolo+mode default 先退计划）。ask 档并入 confirm（活壳无独立询问档）；
  线路词汇 default/ask/auto/always-approve 不变（pager 设置面同族）。
· 描述诚实化：自动编辑按内核分类器语义写「安全编辑自动放行，危险动作仍会问」（活壳原文
  「自动编辑文件。」对我们的 auto 轴是过度承诺）；full 描述「跳过所有权限询问。」
  （活壳「减少确认次数。」对 yolo 是低报）。
· 行图标逐档对齐活壳：hand / shield-check / clipboard-list / shield-alert；触发芯片标签＝当前档名，
  full 档带 danger 色。

**阶段 E6 —— 审批卡对齐活壳形态 + 布局二次事故（2026-09-13，用户报「审批弹窗也不对」+ 活壳截图）**
· 卡面重写为活壳形态：标题行「需要权限」→ 上下文行（工具图标 + 等待确认 + 目标芯片，
  芯片只读实测键 rawInput.file_path/path，读不到不画）→ 编号 listbox（选中行整行底色；
  点未选中行=选中、点选中行=确认；ArrowUp/Down 与 Tab/Shift+Tab 移选中、Enter 确认、Home/End 跳首尾）
  → 底行（info 图标 + 「使用 Tab / 上下键选择，回车确认」+ primary 确认按钮）。
  权限卡不再挂 rawInput 原始转储（活壳卡面没有，S0 调试脚手架退役）。
· 选项文案按实测 optionId 映射活壳文案族：allow-once→允许/仅允许这一次；
  allow-edits-session→允许本会话/本次会话内的编辑不再询问；reject-once→拒绝/这次先拒绝；
  enable-always-approve→完全访问/允许本次并开启全放行，后续不再询问（danger 红标签——
  文案不藏「真开 YOLO 是客户端职责」这件事）。展示顺序＝安全→危险（活壳三档逐字 + 全放行收尾
  当减速带）；表外选项按内核顺序附尾、原样 name。
· 数字热键 1–N 改与屏幕行号同表（optionViews 导出共用）：旧实现按内核顺序取，重排后
  热键 1 会命中全放行——键位骗人比没键位更糟。
· 布局二次事故：.approvals shrink=1 与 spine 的几千 px content basis 按比例分摊，单张卡被压成
  ~80px 细条（选项区裁进内部滚动条，屏幕只剩标题行）。改 flex: 0 0 auto——审批卡不参与 shrink，
  压缩全给 spine（自滚）；多卡超高仍由 max-height 45% + 自滚兜底。实机：卡 297px 完整，
  composer 721+134=855 钉在 860 视口内。
· 实机验收（CDP）：菜单四档双行+图标+当前档勾；卡四行文案/选中/高亮、ArrowDown→第 2 行、
  Tab→第 3 行、点第 4 行只选中不确认、热键 3 直拒卡消失（不留文件）。218 测试 + typecheck 绿，
  renderer 热重载生效。

**阶段 E7 —— 问答裁决面 _nofy/ask_user_question 落地（2026-09-13，用户指回退卡问「这是什么」）**
· 旧 UnknownCard 诚实写「裁决面未实现」+ 取消 + params 原样转储；用户截图里的 params 就是活体夹具。
· 契约源＝内核源码逐字（nofy-tools ask_user_question/{mod.rs,types.rs}）：请求 camelCase
  {sessionId, toolCallId, questions[{question, options[{label,description,preview?,id?}],
  multiSelect?（alias multi_select）, id?}], mode}；应答 internally tagged on outcome：
  accepted{answers:{<题干原文>:[label,…]}, annotations?:{<q>:{preview?,notes?}}} /
  chat_about_this / skip_interview / cancelled。
· 应答细则钉死：answers 原序、未答省略；纯自由文本＝["Other"]+notes；preview 仅单选逐字；
  空 annotations 整键省略；零题已答⇒提交禁用（不发空 accepted 混淆取消语义）。
· 卡面＝活壳 elicitation 形态：需要确认 → 题干 → 选项行（单选圆标/多选方标+标签+描述）→
  自定义回答行（展开输入）→ 底行（Tab/上下键/回车或空格提示 + 上一题/下一题 + 继续/提交）。
  plan 模式访谈双按钮活壳不露、我们同纪律不露；取消走已登记 {outcome:"cancelled"}；Esc 扩到问答面。
· 新增 interaction/answer effect：只送 questionModel 造好的载荷，线路名仍只住在 core。
· 实机 e2e（CDP）：诱导模型发 ask_user_question → 卡现（两选项+自定义回答）→ 选首项提交 →
  卡消失无报错、内核按回答续轮。222 测试 + typecheck 绿。
· 设置页统计复核（用户重发旧截图）：活体设置→用量只有账本五卡+热力+趋势+模型占比；
  上下文窗口（composer 环）与本轮用量（侧栏脚卡）都是会话级视图，本就不在设置统计——与用户判断一致。

**阶段 E8 —— 上下文圆环加缓存命中率（2026-09-13 用户问「能加上么」）**
· 数据源＝内核已有的轮级三桶（turn_completed.usage 实测 camelCase）：读 cachedReadTokens /
  建 cacheCreationTokens / 未缓存 inputTokens。内核 notification.rs:1048 明写 input_tokens 是
  uncached prompt 部分、三桶互斥穷尽 prompt 侧 ⇒ 命中率＝读/三桶和，分母不猜。
· 呈现两处：环内圈同心弧（brand 色，r=5.5，与外圈用量弧不叠；hit=0 只画 track 不画弧）+
  浮层两行（本轮缓存命中 加粗百分比 / 缓存 读·建·未缓存 三桶明细）；环的 title/aria 也带上命中率。
· 诚实细则：无轮级 usage（重载后没跑过轮）不加行、不画内圈；三桶和 0 ⇒ 命中率「—」不除零。
  本供应商（DashScope）当前轮读/建皆 0 ⇒ 活体照实画 0% + 0/0/24,065，明细自己解释自己。
· 门禁：contextModel 新增 cacheView/cacheStats 纯函数 + 2 条新测试（三桶分母/除零/无轮不画），
  224 测试 + typecheck 绿；实机 CDP 跑一轮后开环验收（浮层行 + 内圈 track 截图）。
