# Agent 运行时

## 概述

Agent 运行时是 Grok Build 的核心——它管理对话状态、调用 LLM、执行工具调用、处理流式响应、管理上下文窗口。涉及 6 个核心 crate。

---

## Crate 结构

### 1. `xai-grok-agent` — Agent 定义与构建

**核心类型：**

#### `Agent`（不可变）

构造后不可变的 Agent 实例。持有：
- `definition: AgentDefinition` — 来源定义
- `prompt_context: PromptContext` — 生成系统提示词的上下文
- `system_prompt: String` — 缓存的渲染后系统提示词
- `tool_bridge: Arc<ToolBridge>` — 工具注册表 + 会话上下文（内部可变）
- `reminder_policy: ReminderPolicy` — 提醒策略
- `compaction_policy: CompactionPolicy` — 压缩策略
- `hosted_tools: Vec<HostedTool>` — 后端托管工具（如 WebSearch）
- `backend_search_enabled: bool` — 服务端搜索开关

#### `AgentBuilder`（流畅构建器）

两种构建流程：
1. **从定义文件** — `from_definition(AgentDefinition::from_file(...))`
2. **编程构建** — `with_name()`, `with_description()`, `with_tools()`

**构建器配置项（部分）：**
- `working_directory` / `prompt_working_directory` — 实际工作目录 vs 模型可见目录
- `terminal_backend` / `fs_backend` — 可注入的后端
- `notification_handle` — 工具通知句柄
- `definition` — Agent 定义
- `prompt_audience` — 面向主代理或子代理
- `role_instructions` / `persona_instructions` — 角色和人格指令
- `prompt_mode` — 提示词模式
- `tools` / `disallowed_tools` — 工具白/黑名单
- `skill_names` — 技能名称列表
- `permission_mode` — 权限模式
- `agents_md` — 是否加载 AGENTS.md
- `compaction_policy` / `reminder_policy`
- `memory_enabled` / `memory_global_path` / `memory_workspace_path`
- `backend_search` — 后端搜索开关
- `web_fetch_config` / `lsp` / `image_gen_config` / `video_gen_config`
- `subagents_enabled` / `background_workflows_enabled`
- `compat` — 厂商兼容配置（.claude/.cursor 目录扫描）
- `plugin_registry` — 插件注册表
- `context_window_tokens` — 上下文窗口大小
- `api_key_provider` — API Key 提供器

#### `AgentDefinition`

Agent 定义，可从文件加载或编程构建。包含：
- `name` — 唯一标识符
- `description` — 描述
- `permission_mode` — 权限模式
- `completion_requirement` — 完成要求
- `tools` — 允许的工具列表
- `prompt_mode` — 提示词模式

#### `PromptContext` 和系统提示词

`PromptContext` 生成系统提示词，包含：
- 工作目录信息
- OS 信息
- Git 状态
- 工具列表
- AGENTS.md 内容（格式化为 `<system-reminder>` 块注入用户消息）
- 角色和人格指令
- 技能列表
- 子代理提示词

**提示词模块（`prompt/`）：**
- `context.rs` — PromptContext
- `template.rs` — 提示词模板（包括 `COMPACT_SYSTEM_PROMPT`）
- `agents_md.rs` — AGENTS.md 加载和格式化
- `skills.rs` — 技能提示词
- `subagent_prompts.rs` — 子代理提示词
- `user_message.rs` — 用户消息格式化
- `workspace_user.rs` — Workspace 用户信息
- `prompt_encrypted.rs` — 加密提示词
- `ignore.rs` — .gitignore 集成

### 2. `xai-chat-state` — 对话状态 Actor

**Actor 模式架构：**

```
┌────────────────┐                  ┌──────────────────────────────────────┐
│ SessionActor   │ ─── Command ───▶ │        ChatStateActor                │
│  (push_user,   │                  │  (runs in dedicated tokio task)      │
│   build_req)   │                  │                                      │
└────────────────┘                  │  State (no locks needed):            │
                                     │  - conversation: Vec<ConversationItem>│
┌────────────────┐                  │  - sampling_config: SamplingConfig   │
│   Query (e.g.  │ ── Cmd+Oneshot ─▶│  - prompt_index: usize                │
│  get_conv)     │ ◀── Response ────│  - total_tokens: u64                  │
└────────────────┘                  │                                      │
                                     │         │ ChatStateEvent             │
                                     │         ▼                            │
                                     │  ┌──────────────────┐               │
                                     │  │ event_tx         │───▶ Session   │
                                     │  └──────────────────┘               │
                                     └──────────────────────────────────────┘
```

**核心模块：**
- `actor.rs` — ChatStateActor 实现
- `commands.rs` — 命令定义（`ModelMetadata`, `StrictAppendAck`, `StrictAppendError`）
- `events.rs` — ChatStateEvent
- `handle.rs` — ChatStateHandle（命令通道接口）
- `persistence.rs` — 对话持久化（`ChatPersistence` trait）
- `compaction_mode.rs` — CompactionMode
- `compaction_transcript.rs` — 压缩记录
- `compaction_utils.rs` — 压缩工具
- `conversation_util.rs` — 对话操作工具
- `types.rs` — 类型定义
- `usage.rs` — UsageLedger / UsageTotals（token 使用追踪）

**Token 估算函数：**
- `estimate_conversation_tokens()` — 估算整个对话的 token 数
- `estimate_item_tokens()` — 估算单条消息的 token 数
- `estimate_messages_tokens()` — 估算消息列表
- `estimate_system_message_tokens()` — 估算系统消息
- `estimate_tool_definition_token()` / `estimate_tool_definitions_tokens()` — 估算工具定义

### 3. `xai-agent-lifecycle` — Agent 生命周期管理

管理 Agent 从创建到销毁的完整生命周期：
- 创建（配置加载、认证、工具注册）
- 运行（事件循环、响应处理）
- 暂停/恢复（用户中断、后台切换）
- 停止（清理、持久化）

### 4. `xai-prompt-queue` — 提示词队列

管理用户输入和系统插话的排队：
- 用户消息排队
- 插话（interjection）优先级处理
- 队列编辑（运行中修改待执行提示词）

### 5. `xai-grok-compaction` — 上下文压缩

上下文窗口管理策略：

```
total_tokens 接近 context_window_tokens
    │
    ▼
CompactionPolicy 触发
    │
    ├── 估算每条消息 token 数 (estimate_item_tokens)
    ├── 选择压缩检查点 (checkpoint)
    ├── 调用 LLM 生成摘要 (session_summary 模型)
    ├── 替换旧消息为摘要
    └── 更新 prompt_index 和 total_tokens
```

**CompactionMode 类型：** 定义不同的压缩策略。
**CompactionDetail：** 压缩详情记录。

### 6. `xai-grok-shell` 中的 Agent 模块

`xai-grok-shell/src/agent/` 是 Agent 运行时在 Shell 层的集成：

**关键模块：**
- `mod.rs` — Agent 模块入口
- `app.rs` — Agent 应用入口（`run_headless`, `run_leader`, `run_stdio_agent`）
- `config.rs` — Agent 配置（`Config`）
- `server.rs` — Agent 服务器
- `mvp_agent/` — MVP Agent 实现
  - `acp_agent.rs` — ACP Agent
  - `agent_ops.rs` — Agent 操作
  - `session_lifecycle.rs` — 会话生命周期
  - `session_registry.rs` — 会话注册表
  - `session_setup.rs` — 会话设置
  - `subagent_coordinator.rs` — 子代理协调器
  - `replay.rs` — 回放
  - `resource_telemetry.rs` — 资源遥测
- `handlers/` — 事件处理器
  - `model_switch.rs` — 模型切换
  - `session.rs` — 会话事件
  - `workspaces.rs` — Workspace 事件
- `models/` — 模型管理
  - `cache.rs` — 模型缓存
  - `endpoint.rs` — 端点管理
  - `fetch.rs` — 模型获取
  - `resolution.rs` — 模型解析
- `chat_modes.rs` — 聊天模式
- `folder_trust.rs` — 文件夹信任
- `relay.rs` — 中继
- `proxy.rs` — 代理

---

## Agent 主循环

```
用户提交 prompt
    │
    ▼
ChatStateActor::push_user_message()
    │
    ▼
ChatStateActor::build_request()
    ├── 组装 system_prompt (Agent::system_prompt())
    ├── 组装 conversation history (Vec<ConversationItem>)
    ├── 组装 tool definitions (ToolBridge::tool_definitions())
    ├── 组装 hosted_tools (WebSearch 等)
    └── 设置 sampling_config
    │
    ▼
LLM API 调用 (streaming SSE)
    │
    ├── 文本增量 → ChatStateEvent::TextDelta → event_tx → TUI
    ├── 工具调用 → ChatStateEvent::ToolCall → event_tx → TUI
    └── 完成 → ChatStateEvent::Done → event_tx → TUI
    │
    ▼ (如有工具调用)
ToolBridge::dispatch(tool_call)
    ├── pre_tool_use hooks → 门控 (deny 则阻止)
    ├── 工具执行 (可能并行)
    │   ├── 文件操作 (read_file, search_replace, etc.)
    │   ├── Shell 命令 (run_terminal_cmd)
    │   ├── Web 操作 (web_search, web_fetch)
    │   ├── 子代理 (spawn_subagent)
    │   ├── Workflow (run_workflow)
    │   └── MCP 工具 (server__tool)
    └── post_tool_use hooks
    │
    ▼
工具结果 → ChatStateActor::append_tool_result()
    │
    ▼
继续 LLM 调用 (工具结果作为新消息)
    │
    ▼ (LLM 判断任务完成)
返回最终响应 → TUI 渲染
    │
    ▼ (检查是否需要上下文压缩)
CompactionPolicy::should_compact() → 如果需要，触发压缩
```

---

## 子代理系统

Agent 可以通过 `spawn_subagent` 工具生成子代理：

1. **子代理协调器** (`subagent_coordinator.rs`) 管理子代理生命周期
2. **子代理类型解析** (`xai-grok-subagent-resolution`) 解析类型
3. **内置类型：** `general-purpose`, `explore`, `plan`
4. **隔离模式：** 支持 worktree 隔离（子代理在独立 git worktree 中工作）
5. **提示词精简：** 子代理使用 `COMPACT_SYSTEM_PROMPT` 和精简的工具集

---

## 插话（Interjection）系统

`xai-interjection-core` 提供在 Agent 运行中插入消息的能力：

- **InterjectionBuffer** — 缓冲待处理的插话
- **PendingInterjection** — 等待中的插话
- **FormattedInterjection** — 格式化后的插话
- **EventQueue** — 事件队列
- **format_interjection()** — 格式化插话为用户消息
- **LARGE_PROMPT_THRESHOLD** — 大提示词阈值

插话场景：
- 用户在 Agent 运行中输入新消息
- 系统提醒（LSP 诊断、技能发现等）
- 后台任务完成通知

---

## 会话持久化

`ChatPersistence` trait 定义对话持久化接口：
- 保存对话记录
- 恢复对话状态
- `PersistenceRecord` — 持久化记录类型
- `MockChatPersistence` — 测试用 mock

持久化存储路径由 `xai-grok-paths` 和 `xai-grok-config` 管理。
