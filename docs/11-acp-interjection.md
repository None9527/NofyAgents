# ACP 协议、Computer Hub 与插话系统

## 概述

Grok Build 通过 Agent Client Protocol (ACP) 嵌入编辑器（如 VS Code），通过 Computer Hub 提供浏览器自动化能力，通过 Interjection 系统在 Agent 运行中注入消息。这三个系统共同扩展了 Agent 的交互边界。

---

## 一、ACP 协议（`xai-acp-lib` + `xai-grok-pager/src/acp/`）

### 概述

Agent Client Protocol (ACP) 是一个 JSON-RPC 2.0 协议，允许外部客户端（IDE、编辑器、CI 系统）与 Grok Agent 交互。Grok Build 既是 ACP 服务器（`--stdio` 模式）也是 ACP 客户端（通过 Leader 连接）。

### 协议基础

基于 `agent-client-protocol` crate（v0.10.4，启用 `unstable` feature）。

**核心 JSON-RPC 方法：**

| 方法 | 方向 | 描述 |
|------|------|------|
| `initialize` | Client→Server | 初始化连接，交换能力 |
| `session/new` | Client→Server | 创建新会话 |
| `session/load` | Client→Server | 加载已有会话 |
| `session/resume` | Client→Server | 恢复会话 |
| `session/close` | Client→Server | 关闭会话 |
| `session/prompt` | Client→Server | 发送提示词 |
| `session/update` | Server→Client | 流式更新通知 |
| `session/notification` | Server→Client | 会话通知 |
| `x.ai/leader_reconnected` | Server→Client | Leader 重连通知 |

### ACP 集成模块

```
xai-grok-pager/src/acp/
├── mod.rs               # ACP 模块入口
├── leader_bridge.rs     # Leader 桥接（核心）
├── spawn.rs             # ACP 进程生成
├── tracker.rs           # ACP 追踪器
├── meta.rs              # ACP 元数据
├── model_state.rs       # 模型状态
└── version_mismatch.rs  # 版本不匹配处理
```

### Leader Bridge（`leader_bridge.rs`）

桥接 TUI 和 Leader 进程的 ACP 通信：

```
TUI (AppView)
    │
    ▼
ACP Leader Bridge
    │
    ├── 连接到 Leader 进程（WebSocket 或 stdio）
    │
    ├── 发送 ACP 请求 → Leader
    │   ├── initialize
    │   ├── session/new / session/load
    │   ├── session/prompt
    │   └── session/close
    │
    └── 接收 ACP 通知 ← Leader
        ├── session/update（流式文本/工具调用）
        ├── session/notification
        └── x.ai/leader_reconnected
    │
    ▼
TUI (acp_handler/) — 路由到正确的 AgentView
```

### Leader 重连恢复

当 Leader 进程崩溃后重新选举，TUI 需要恢复所有会话状态：

```
Leader 崩溃
    │
    ▼
新 Leader 选举
    │
    ▼
ACP Bridge 检测到连接断开
    │
    ▼
重连新 Leader
    │
    ▼
回放缓存的状态 (StdioReplayState)
    │
    ├── 1. 重放 initialize 请求
    │      └── 等待响应（REPLAY_RESPONSE_DEADLINE = 180s）
    │
    ├── 2. 对每个缓存的会话重放 session/load
    │      └── 顺序执行（每个等待响应，REPLAY_RECV_TIMEOUT = 60s）
    │
    └── 3. 发送 x.ai/leader_reconnected 通知
           └── 包含恢复的主会话 ID
    │
    ▼
外部客户端继续正常操作
```

**StdioReplayState 缓存：**
```rust
struct StdioReplayState {
    initialize_json: Option<String>,         // initialize 请求
    sessions: Vec<(String, CachedSession)>,  // 会话列表
    pending_new: Option<CachedSession>,       // 待确认的 session/new
    last_session_id: Option<String>,          // 最后活跃会话
}

struct CachedSession {
    load_request_json: Option<String>,  // 原始 session/load 请求
    cwd: Option<String>,                // 工作目录
    mcp_servers_json: Option<String>,    // MCP 服务器配置
}
```

### ACP 进程生成（`spawn.rs`）

生成 ACP 子进程（stdio 模式）：
- 构建 JSON-RPC 通道
- 设置 stdin/stdout 管道
- 处理进程生命周期

### 版本不匹配处理（`version_mismatch.rs`）

当客户端和服务器版本不匹配时：
- 警告用户
- 可能限制功能
- 建议升级

---

## 二、Computer Hub（`xai-computer-hub-*`）

### 概述

Computer Hub 提供"Computer Use"能力——让 Agent 可以控制浏览器/桌面应用。由三个 crate 组成。

### Crate 结构

```
crates/common/
├── xai-computer-hub-core/      # 核心：能力定义、消息类型
├── xai-computer-hub-sdk/       # SDK：客户端接口
└── xai-computer-hub-mcp-adapter/  # MCP 适配器：将 Computer Hub 暴露为 MCP 工具
```

### 架构

```
Agent (LLM)
    │
    ▼
ToolBridge (computer_use 工具)
    │
    ▼
xai-computer-hub-mcp-adapter
    │ (MCP 协议适配)
    ▼
xai-computer-hub-sdk (客户端)
    │
    ▼
xai-computer-hub-core (核心)
    │
    ├── 浏览器自动化
    │   ├── 页面导航
    │   ├── 元素交互（点击、输入）
    │   ├── 截图
    │   └── DOM 提取
    │
    └── 桌面自动化
        ├── 窗口管理
        ├── 键盘/鼠标控制
        └── 屏幕截图
```

### 本地实现（`xai-grok-tools/src/computer/local/`）

```
computer/local/
├── mod.rs
├── file_system.rs     # 本地文件系统实现
├── terminal.rs        # 本地终端实现
├── cgroup.rs          # cgroup 隔离
├── lifecycle.rs       # 生命周期管理
├── shell_state.rs     # Shell 状态
├── static_shell.rs    # 静态 Shell
└── embedded_search_tools.rs  # 内嵌搜索工具
```

### Computer Use 类型（`computer/types.rs`）

```rust
pub trait AsyncFileSystem: Send + Sync {
    // 异步文件系统操作
}

pub trait TerminalBackend: Send + Sync {
    // 终端操作
}
```

这些 trait 允许注入不同的实现（本地、远程、mock）。

### 任务日志（`computer/task_log.rs`）

记录 Computer Use 的操作日志，用于审计和调试。

---

## 三、插话/打断系统（`xai-interjection-core`）

### 概述

允许在 Agent 运行中注入消息，而不需要等待当前轮次完成。支持用户打断、系统提醒和后台任务通知。

### 模块结构

```
src/
├── lib.rs           # 入口
├── buffer.rs         # InterjectionBuffer
├── events.rs         # EventQueue
└── format.rs         # 格式化
```

### 核心类型

```rust
pub struct InterjectionBuffer {
    pending: Vec<PendingInterjection>,
}

pub struct PendingInterjection {
    // 待处理的插话
}

pub struct FormattedInterjection {
    // 格式化后的插话（注入用户消息格式）
}

pub struct EventQueue {
    // 事件队列
}
```

### 插话流程

```
来源：用户输入 / 系统提醒 / 后台任务
    │
    ▼
format_interjection() — 格式化为用户消息
    │
    ├── user_query() — 构造用户查询格式
    └── LARGE_PROMPT_THRESHOLD — 大提示词阈值检测
    │
    ▼
InterjectionBuffer::push(PendingInterjection)
    │
    ▼
drain_formatted() — 排空已格式化的插话
    │
    ▼
ChatStateActor — 在下一轮 LLM 调用中注入
```

### 插话场景

1. **用户打断** — 用户在 Agent 运行中输入新消息
   - 通过 prompt_queue 排队
   - 在当前工具调用完成后注入

2. **系统提醒** — `xai-grok-tools/src/reminders/`
   - `lsp_diagnostics.rs` — LSP 诊断提醒
   - `skill_discovery.rs` — 技能发现提醒
   - `task_completion.rs` — 任务完成提醒

3. **系统提醒注入格式** — 使用 `<system-reminder>` XML 标签注入用户消息

### 与 Prompt Queue 的关系

`xai-prompt-queue` 管理用户输入和插话的排队：

```
用户消息 ──┐
           │
插话 ──────┤──→ PromptQueue ──→ ChatStateActor
           │
系统提醒 ──┘
```

- 用户消息有优先级
- 插话可以在下一轮注入
- 队列编辑允许在运行中修改待执行的提示词

---

## 四、断路器（`xai-circuit-breaker`）

### 概述

断路器模式，保护外部服务调用免受级联故障。

### 工作原理

```
正常状态 → 连续失败 N 次 → 断路状态
    ↑                        │
    │                        │ 超时后
    └── 半开状态 ←──────────┘
```

- **正常状态** — 请求正常通过
- **断路状态** — 请求立即失败（不发送）
- **半开状态** — 允许少量请求测试

### 应用场景

- LLM API 调用
- MCP 服务器调用
- Web fetch 请求
- 远程服务调用

---

## 五、SQLite 日志（`xai-sqlite-journal`）

### 概述

基于 SQLite 的日志系统，用于持久化结构化数据。

### 应用场景

- Workflow Journal 回放数据
- 会话历史持久化
- 工具调用日志
- 遥测事件缓冲

---

## 六、聊天代理类型（`prod/mc/cli-chat-proxy-types`）

### 概述

CLI 聊天代理的类型定义，用于与 xAI 后端的聊天代理服务通信。

### 模块

```
src/
├── lib.rs
├── feedback_types.rs        # 反馈类型（2037 行，大量类型定义）
├── client_metrics_types.rs  # 客户端指标类型
├── storage_types.rs         # 存储类型
├── team_managed_config_types.rs  # 团队托管配置类型
└── serde_helpers.rs         # Serde 辅助函数
```

---

## 七、追踪基础设施

### `xai-tracing`

跨产品的追踪基础设施。

### `xai-tracing-macros`

提供追踪相关的宏：
- `teprintln!` — 追踪 eprintln
- `tprintln!` — 追踪 println
- `timed!` — 计时宏

这些宏将追踪信息注入到 tracing 系统，而不是直接打印到 stderr/stdout。

---

## 整体集成图

```
┌────────────────────────────────────────────────────────────────────────┐
│ 编辑器 (VS Code) / TUI / CLI                                            │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  ACP Bridge (JSON-RPC 2.0 over stdio/WebSocket)              │    │
│  │  - initialize / session/* / session/prompt                  │    │
│  │  - Leader 重连恢复                                           │    │
│  │  - 版本不匹配处理                                             │    │
│  └──────────────────────┬───────────────────────────────────────┘    │
│                         │                                              │
│  ┌──────────────────────┼──────────────────────────────────────┐     │
│  │  Agent Runtime        │                                      │     │
│  │                       ▼                                      │     │
│  │  ┌─────────────────────────────────────────────────────┐    │     │
│  │  │  PromptQueue + InterjectionBuffer                   │    │     │
│  │  │  - 用户消息排队                                      │    │     │
│  │  │  - 系统提醒注入 (<system-reminder>)                  │    │     │
│  │  │  - 插话缓冲                                          │    │     │
│  │  └─────────────────────────────────────────────────────┘    │     │
│  │                       │                                      │     │
│  │  ┌────────────────────▼─────────────────────────────────┐   │     │
│  │  │  ChatStateActor (对话状态 Actor)                      │   │     │
│  │  │  - conversation: Vec<ConversationItem>                │   │     │
│  │  │  - CompactionPolicy (上下文压缩)                      │   │     │
│  │  │  - UsageLedger (token 使用追踪)                       │   │     │
│  │  └────────────────────┬─────────────────────────────────┘   │     │
│  │                       │                                      │     │
│  │  ┌────────────────────▼─────────────────────────────────┐   │     │
│  │  │  ToolBridge                                           │   │     │
│  │  │  ├── 内置工具 (read_file, grep, bash, ...)           │   │     │
│  │  │  ├── MCP 工具 (server__tool)                          │   │     │
│  │  │  ├── Computer Hub (浏览器/桌面自动化)                  │   │     │
│  │  │  │   └── xai-computer-hub-mcp-adapter                 │   │     │
│  │  │  │       └── xai-computer-hub-sdk                    │   │     │
│  │  │  │           └── xai-computer-hub-core              │   │     │
│  │  │  ├── Circuit Breaker (断路器保护)                     │   │     │
│  │  │  └── SQLite Journal (持久化)                          │   │     │
│  │  └─────────────────────────────────────────────────────┘   │     │
│  └──────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```
