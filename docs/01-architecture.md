# 系统架构

## 分层设计

Grok Build 采用严格的分层架构，从上到下分为 6 层。每一层只能依赖下层，不允许反向依赖。

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 6: 二进制组合根                                                    │
│   xai-grok-pager-bin (main.rs)                                          │
│   - CLI 参数解析、jemalloc 设置、沙箱应用、tracing 初始化                 │
│   - 选择运行模式：TUI / Headless / Leader / Wrap / Serve / ACP-Stdio     │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 5: TUI 表示层                                                      │
│   xai-grok-pager · xai-grok-pager-render · xai-grok-pager-minimal      │
│   xai-ratatui-inline · xai-ratatui-textarea                             │
│   - 事件循环 (tokio::select!)、AppView、AgentView                       │
│   - 滚动历史、输入处理、模态对话框、Markdown 渲染                       │
│   - Slash 命令、补全、搜索、剪贴板                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 4: Agent 运行时                                                    │
│   xai-grok-agent · xai-grok-shell · xai-agent-lifecycle                │
│   xai-chat-state · xai-prompt-queue · xai-grok-compaction              │
│   - Agent 定义/构建器 (AgentBuilder) → Agent (不可变)                    │
│   - 对话状态 Actor (ChatStateActor)：独占 tokio task，命令通道通信      │
│   - 上下文压缩策略 (CompactionPolicy)                                   │
│   - 提示词队列、插话缓冲、会话生命周期                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 3: 工具与扩展层                                                    │
│   xai-grok-tools · xai-grok-tools-api · xai-tool-protocol              │
│   xai-tool-runtime · xai-tool-types · xai-grok-mcp                    │
│   xai-grok-hooks · xai-grok-plugin-marketplace · xai-workflow         │
│   xai-grok-subagent-resolution                                          │
│   - ToolBridge：工具注册表 + 会话上下文 + 通知句柄                      │
│   - 工具分类法 (ToolKind / ToolNamespace / CanonicalToolMeta)           │
│   - MCP 客户端 (rmcp SDK)：stdio/SSE/HTTP 传输                          │
│   - Hooks 分发器：pre_tool_use 门控，fail-open 策略                     │
│   - Rhai 脚本 Workflow 引擎：并行子代理生成、预算控制                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 2: 基础设施层                                                       │
│   xai-grok-sandbox · xai-grok-config · xai-grok-auth                   │
│   xai-grok-telemetry · xai-grok-workspace · xai-grok-memory            │
│   xai-grok-markdown · xai-grok-mermaid · xai-grok-models               │
│   xai-grok-sampler · xai-grok-http · xai-grok-paths · xai-grok-env     │
│   ptyctl · xai-file-utils · xai-fsnotify · xai-gix-status             │
│   xai-hunk-tracker · xai-token-estimation · xai-codebase-graph         │
│   - 沙箱：nono (Landlock/Seatbelt) + bwrap + seccomp                    │
│   - 配置：6 层合并优先级（系统→managed→用户→requirements→MDM）        │
│   - Markdown：流式增量解析 + syntect 语法高亮                           │
│   - Workspace：会话持久化、Git 集成、文件监控、权限                      │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 1: 共享基础层                                                       │
│   xai-tool-protocol · xai-tool-types · xai-tracing                      │
│   xai-circuit-breaker · xai-interjection-core · xai-test-utils         │
│   xai-computer-hub-core/sdk/mcp-adapter · xai-sqlite-journal           │
│   third_party: dagre_rust · graphlib_rust · mermaid-to-svg            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Crate 依赖图（核心路径）

```
xai-grok-pager-bin
├── xai-grok-pager (TUI 核心)
│   ├── xai-grok-pager-render (渲染原语)
│   ├── xai-grok-markdown (Markdown 渲染)
│   │   └── xai-grok-markdown-core
│   ├── xai-grok-mermaid (Mermaid → SVG)
│   │   ├── third_party/dagre_rust
│   │   ├── third_party/graphlib_rust
│   │   └── third_party/mermaid-to-svg
│   ├── xai-ratatui-inline (ratatui 扩展)
│   ├── xai-ratatui-textarea (输入框组件)
│   ├── xai-grok-shell (Agent 运行时入口)
│   │   ├── xai-grok-agent (Agent 定义/构建)
│   │   │   ├── xai-grok-tools (工具实现)
│   │   │   │   ├── xai-grok-tools-api
│   │   │   │   ├── xai-tool-protocol
│   │   │   │   ├── xai-tool-runtime
│   │   │   │   └── xai-tool-types
│   │   │   ├── xai-grok-compaction (上下文压缩)
│   │   │   └── xai-grok-subagent-resolution
│   │   ├── xai-grok-shell-base (Shell 基础)
│   │   ├── xai-grok-shell-session-support
│   │   ├── xai-agent-lifecycle (生命周期)
│   │   ├── xai-chat-state (对话状态 Actor)
│   │   ├── xai-prompt-queue (提示词队列)
│   │   ├── xai-grok-mcp (MCP 客户端)
│   │   ├── xai-grok-hooks (Hooks)
│   │   ├── xai-grok-workspace (Workspace)
│   │   ├── xai-grok-config (配置)
│   │   ├── xai-grok-auth (认证)
│   │   ├── xai-grok-telemetry (遥测)
│   │   ├── xai-grok-models (模型)
│   │   ├── xai-grok-sampler (采样)
│   │   ├── xai-grok-http (HTTP)
│   │   ├── xai-grok-memory (记忆)
│   │   └── ptyctl (PTY 控制)
│   ├── xai-grok-sandbox (沙箱)
│   ├── xai-grok-update (自更新)
│   ├── xai-grok-workspace (Workspace 管理)
│   ├── xai-acp-lib (ACP 协议)
│   └── xai-crash-handler (崩溃处理)
│
xai-workflow (Workflow 引擎)
├── xai-grok-subagent-resolution
└── rhai (嵌入式脚本引擎)
```

---

## 关键架构决策

### 1. 组合根模式 (Composition Root)

`xai-grok-pager-bin` 是唯一的组合根——它负责：
- 全局 allocator 设置（jemalloc）
- `malloc_conf` 配置（profiling）
- 沙箱应用（`SandboxManager::apply()` → `install()`）
- Tracing/遥测初始化
- CLI 参数解析（`PagerArgs` via clap）
- 运行模式选择和分发

### 2. IoC 缝合 (Inversion of Control Seams)

多处使用函数指针 IoC 缝合来避免循环依赖：

- **Minimal 模式**：`xai-grok-pager` 通过 `minimal_hook`（fn-pointer）和 `minimal_api`（facade）两个窄缝连接到 `xai-grok-pager-minimal`。`xai-grok-pager-minimal` 依赖 `xai-grok-pager`，所以 pager 不能反向依赖它——通过 IoC 缝合解决。
- **Auth 依赖反转**：`xai-grok-auth` 定义 `AuthCredentialProvider` trait，`xai-grok-shell` 实现它，`xai-file-utils` 消费它——保持 shell 类型不进入 file-utils 的导入图。
- **Terminal/FS 后端**：`TerminalBackend` 和 `AsyncFileSystem` trait 允许测试时注入 mock 实现。

### 3. Actor 模式

关键状态管理采用 Actor 模式，通过专用 tokio task + 命令通道通信：

- **ChatStateActor**（`xai-chat-state`）：独占 tokio task 管理对话状态，无需锁。通过 `ChatStateHandle` 发送命令 + oneshot 回复。状态包括：`conversation: Vec<ConversationItem>`、`sampling_config`、`prompt_index`、`total_tokens`。
- **HunkTrackerHandle**（`xai-hunk-tracker`）：追踪文件变更 hunk，同样采用 Actor 模式。
- **Scheduler Actor**（`xai-grok-tools/scheduler`）：调度器内部 actor 管理定时任务。

### 4. 不可变 Agent + 内部可变性

`Agent` 结构体在构造后不可变，但持有 `Arc<ToolBridge>`——工具状态变更（MCP 注册、完成追踪、重试配置）通过 `ToolBridge` 内部的锁实现。这是"不可变外壳 + 内部可变性"模式。

### 5. 多 Harness 工具兼容

工具系统设计支持多个 AI 编程框架的兼容层：

| Namespace | 来源 | 工具命名风格 |
|-----------|------|-------------|
| `grok_build` | Grok Build 原生 | `read_file`, `search_replace`, `run_terminal_cmd` |
| `grok_build_concise` | 精简版 | `bash`, `read`, `search_replace` |
| `grok_build_hashline` | Hashline 协议 | 行锚点定位编辑 |
| `codex` | OpenAI Codex 兼容 | `apply_patch`, `grep_files`, `list_dir` |
| `opencode` | OpenCode 兼容 | `edit`, `glob`, `grep`, `read`, `write` |
| `mcp` | MCP 外部工具 | `server__tool` 格式 |

每个工具都有 `CanonicalToolMeta` 信封（`x.ai/tool` 元数据），包含跨 harness 的规范身份信息。

### 6. 构建配置

| Profile | 用途 | 关键设置 |
|---------|------|----------|
| `dev` | 本地开发 | opt-level=0, codegen-units=128, incremental |
| `release` | 默认发布 | incremental=true, panic=abort |
| `release-dist` | 分发构建 | thin LTO, codegen-units=1, debug=1 |
| `x-prod` | 生产服务 | thin LTO, panic=unwind, line-tables-only |
| `release-dist-jemalloc` | Desktop 别名 | 继承 release-dist |

### 7. 依赖外部工具链

- **DotSlash**：用于 hermetic 工具分发（`bin/protoc`）
- **protoc**：通过 `bin/protoc`（DotSlash）或 PATH/$PROTOC
- **jemalloc**：默认 allocator（Unix），带 profiling 支持
- **bwrap**：Linux 沙箱 re-exec（用户空间容器）
- **nono**：内核级沙箱（Landlock on Linux, Seatbelt on macOS）

---

## 进程启动流程

```
main()
│
├── 1. 设置全局 allocator (jemalloc)
├── 2. 解析 CLI 参数 (clap → PagerArgs)
├── 3. 应用沙箱
│   ├── 若需要 bwrap re-exec → exec(bwrap + self)
│   └── SandboxManager::apply() → install() [不可逆]
├── 4. 初始化 tracing/遥测
│   ├── EnvFilter + fmt layer
│   ├── sampling_log layer
│   ├── instrumentation layer (OTel)
│   ├── hooks_log layer
│   └── external OTel layer
├── 5. 检查版本策略 (enforce_version_policy_or_exit)
├── 6. 分发到运行模式
│   ├── Command::Agent → TUI 模式
│   │   ├── 初始化终端 (crossterm)
│   │   ├── 创建 AppView (AgentView 集合)
│   │   ├── 启动事件循环 (tokio::select!)
│   │   └── 渲染循环 (ratatui::Terminal::draw)
│   ├── Command::Headless → run_headless()
│   ├── Command::Leader → run_leader()
│   ├── Command::Wrap → PTY 包装
│   ├── Command::Serve → HTTP/WS 服务器
│   └── Command::LeaderMgmt → Leader 管理
└── 7. 退出清理 (终端恢复、flush 日志)
```

---

## 运行时数据流

### 用户输入 → LLM 响应流程

```
用户按键
│
▼
crossterm Event → event_loop.rs (tokio::select!)
│
▼
AppView::handle_input() → dispatch::handle_action()
│
├── 如果是普通文本 → 积累到输入缓冲
├── 如果是 Slash 命令 → 解析并执行
├── 如果是快捷键 → 对应 Action
│
▼ (用户提交 prompt)
Effect::PromptAgent { agent_id, text }
│
▼
effects::spawn() → 异步任务
│
▼
AgentSession → ChatStateActor::push_user_message()
│
▼
ChatStateActor → build_request() (组装 system prompt + 历史 + 工具定义)
│
▼
LLM API 调用 (streaming, SSE)
│
▼ (流式响应)
ChatStateActor → event_tx → SessionActor → TUI 通知
│
├── 文本增量 → Markdown 渲染器 (StreamingMarkdownRenderer)
├── 工具调用 → ToolBridge::dispatch()
│   ├── pre_tool_use hooks → 门控
│   ├── 工具执行 (可能并行)
│   └── post_tool_use hooks
│
▼ (工具结果返回 LLM)
ChatStateActor → 追加工具结果 → 继续 LLM 调用
│
▼ (LLM 生成完成或需要用户输入)
TUI 渲染最终结果
```

### 上下文压缩流程

```
ChatStateActor 检测 total_tokens 接近上下文窗口限制
│
▼
CompactionPolicy 触发
│
├── 估算每条消息的 token 数 (estimate_item_tokens)
├── 选择压缩点 (checkpoint)
├── 生成摘要 (LLM 调用，使用 session_summary 模型)
├── 替换旧消息为摘要
└── 更新 prompt_index 和 total_tokens
```
