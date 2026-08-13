# Workflow 编排与子代理系统

## 概述

Grok Build 的 Workflow 引擎使用 **Rhai** 嵌入式脚本语言编排子代理的生成和协调。支持并行扇出、预算控制、日志回放和暂停/恢复。子代理系统允许主代理将工作委托给独立运行的子代理。

---

## 一、Workflow 引擎（`xai-workflow`）

### 模块结构

```
src/
├── lib.rs       # 入口 + 常量 + 公共 API
├── engine.rs    # Rhai 引擎设置 + 脚本执行
├── host.rs      # WorkflowHostRequest + AgentOpts + AgentResult
├── journal.rs   # Journal + JournalEntry（确定性回放）
├── meta.rs      # WorkflowMeta + PhaseMeta + extract_meta()
├── run.rs       # WorkflowOutcome + PauseKind
├── validate.rs  # 脚本验证
└── host.rs      # 主机请求枚举
```

### 常量

```rust
pub const MAX_WORKFLOW_NAME_LEN: usize = 64;
pub const MAX_WORKFLOW_DESCRIPTION_LEN: usize = 1_024;
pub const MAX_WORKFLOW_WHEN_TO_USE_LEN: usize = 2_048;
pub const MAX_WORKFLOW_PHASES: usize = 64;
pub const MAX_PHASE_TITLE_LEN: usize = 128;
pub const MAX_PHASE_DETAIL_LEN: usize = 1_024;
pub const MAX_PARALLEL: usize = 1_024;        // parallel() 面板最大并行数
pub const DEFAULT_AGENT_BUDGET: u64 = 128;     // 默认 agent 预算
pub const MAX_AGENT_BUDGET: u64 = 1_024;      // 最大 agent 预算
pub const MAX_HOST_CALLS: u64 = 10_000;        // 最大主机调用数
```

### 脚本格式

Workflow 脚本是 Rhai 脚本，必须以纯字面量 `meta` map 开头：

```rhai
let meta = #{
    name: "review-changes",
    description: "Review code changes and provide feedback"
};

// 后续 Rhai 代码
let result = agent(#{
    prompt: "Review the git diff and provide feedback",
    agent_type: "explore"
});

let results = parallel([
    #{
        prompt: "Check for security issues",
        agent_type: "general-purpose"
    },
    #{
        prompt: "Check for performance issues",
        agent_type: "general-purpose"
    }
]);

// 结果处理...
```

### 运行参数

```rust
pub struct WorkflowRunParams {
    pub script: String,           // Rhai 脚本
    pub args: serde_json::Value,  // 绑定到脚本的 args 全局
    pub journal: Journal,          // 日志（确定性回放）
    pub host_tx: mpsc::UnboundedSender<WorkflowHostRequest>,  // 主机通道
    pub cancel: CancellationToken, // 取消令牌
    pub max_ops: u64,              // 最大操作数（默认 100M）
}
```

### 主机请求（`WorkflowHostRequest`）

Workflow 脚本通过主机请求与外部环境交互：

| 请求 | 描述 |
|------|------|
| `ReserveAgentCalls` | 预留 agent 调用配额 |
| `ReleaseAgentCalls` | 释放未使用的配额 |
| `SpawnAgent` | 生成子代理 |
| `Phase` | 报告阶段进展 |
| `Log` | 记录消息 |
| `Telemetry` | 记录遥测 |
| `BudgetQuery` | 查询预算状态 |
| `RenderTemplate` | 渲染模板 |
| `WriteScratchFile` | 写入临时文件 |
| `ReadScratchFile` | 读取临时文件 |
| `GitDiffSince` | 获取 Git diff |

### AgentOpts

```rust
pub struct AgentOpts {
    pub prompt: String,
    pub label: Option<String>,
    pub model: Option<String>,
    pub max_output_tokens: Option<u64>,
    pub agent_type: Option<String>,
    pub capability_mode: Option<String>,
    pub isolation_worktree: bool,    // worktree 隔离
    pub fork_context: bool,           // fork 上下文
    pub resume_from: Option<String>,  // 从之前运行恢复
    pub output_schema: Option<serde_json::Value>,
    pub phase: Option<String>,
}
```

### AgentResult

```rust
pub struct AgentResult {
    pub agent_id: String,
    pub success: bool,
    pub output: serde_json::Value,
    pub cancelled: bool,
    pub tokens_used: u64,
    pub duration_ms: u64,
}
```

### BudgetState

```rust
pub struct BudgetState {
    pub total: Option<u64>,
    pub spent: u64,
    pub reserved: u64,
    pub remaining: Option<u64>,
}
```

### 运行流程

```
run_workflow(WorkflowRunParams)
    │
    ▼
创建 Rhai Engine
    │
    ├── 设置 max_operations
    ├── 注册主机函数（agent, parallel, phase, log 等）
    └── 设置错误提示
    │
    ▼
extract_meta() — 从脚本提取 meta map
    │
    ▼
执行脚本
    │
    ├── 遇到 agent() 调用
    │   ├── ReserveAgentCalls — 检查预算
    │   ├── 记录到 Journal
    │   ├── 发送 SpawnAgent 到主机
    │   └── 等待 AgentResult
    │
    ├── 遇到 parallel() 调用
    │   ├── 批量 ReserveAgentCalls
    │   ├── 顺序生成（主机限制 16 并发）
    │   └── 等待所有完成
    │
    ├── 遇到 phase() — 发送 Phase 通知
    ├── 遇到 log() — 发送 Log 通知
    └── 遇到 telemetry() — 发送遥测
    │
    ▼
返回 WorkflowOutcome
    │
    ├── Completed { result } — 成功完成
    ├── Paused { kind, message } — 被暂停
    ├── BudgetExceeded { message } — 预算超限
    ├── Cancelled — 被取消
    └── Failed { error } — 执行失败
```

### 暂停类型

```rust
pub enum PauseKind {
    User,          // 用户暂停
    BackOff,       // 退避（速率限制等）
    NoProgress,    // 无进展
    Verification,  // 需要验证
    Infra,         // 基础设施问题
}
```

### 日志与回放

`Journal` 记录所有主机调用的结果，支持确定性回放：

```
Journal
├── record(seq, kind, hash, value) — 记录条目
├── covers(seq) — 是否覆盖该序列号
└── replay — 回放已记录的结果

Ctx {
    host_tx,   // 主机通道
    journal,   // 日志
    seq: u64,  // 序列号
}

// 如果 journal 已覆盖该 seq，使用记录的值（回放）
// 否则发送实际请求到主机
```

**确定性回放：** 如果脚本的输入相同，Journal 会确保输出完全一致——不重新调用 agent，而是使用之前记录的结果。这使得 workflow 可以安全地暂停和恢复。

### 脚本验证（`validate.rs`）

```rust
pub fn validate_script(script: &str) -> ValidationReport
pub fn validate_script_with_agent_budget(script: &str, budget: u64) -> ValidationReport
```

验证脚本：
- 提取和验证 meta（名称、描述、when_to_use）
- 检查语法
- 检查 agent 调用数量是否在预算内
- 验证 parallel() 面板大小

### Rhai 错误提示

`with_rhai_hint()` 为常见 Rhai 错误提供人类可读的提示：
- "Expression exceeds maximum complexity" — 建议拆分长字符串连接
- "reserved keyword" — 列出 Rhai 保留字（`shared`, `sync`, `async` 等）
- "getter is not registered for type 'char'" — 提示字符串索引问题

---

## 二、子代理类型解析（`xai-grok-subagent-resolution`）

### 内置子代理类型

| 类型 | 职责 | 工具权限 |
|------|------|----------|
| `general-purpose` | 通用多步骤任务 | 全部工具 |
| `explore` | 快速只读代码库探索 | `read_file`, `list_dir`, `grep` |
| `plan` | 软件架构规划（只读） | `read_file`, `list_dir`, `grep`, `todo_write` |
| `codex:codex-rescue` | Codex 救援代理 | Codex 运行时工具 |

### 解析流程

```
AgentOpts.agent_type = "explore"
    │
    ▼
SubagentResolution::resolve("explore")
    │
    ├── 检查内置类型
    ├── 检查用户定义类型（.grok/agents/ 目录）
    ├── 检查插件提供的类型
    └── 返回 SubagentEntry
    │
    ▼
AgentBuilder
    ├── .prompt_audience(子代理)
    ├── .with_tools(子代理类型允许的工具)
    ├── .with_compact_system_prompt()
    └── .build()
```

### 用户定义子代理

用户可以在 `~/.grok/agents/` 和 `.grok/agents/` 目录定义自定义子代理类型，使用 Markdown 格式的定义文件。

---

## 三、子代理协调（`xai-grok-shell`）

### SubagentCoordinator

`xai-grok-shell/src/agent/mvp_agent/subagent_coordinator.rs` — 子代理协调器：

- 管理子代理生命周期
- 跟踪活跃子代理
- 路由子代理通知到 TUI
- 处理子代理完成/取消/失败

### 隔离模式

| 模式 | 描述 |
|------|------|
| **无隔离** | 子代理在主代理的工作目录中工作 |
| **Worktree** (`isolation_worktree`) | 子代理在独立 git worktree 中工作，编辑不影响父工作区 |
| **Fork Context** (`fork_context`) | Fork 上下文（共享对话历史但独立执行） |

### Worktree 隔离

`xai-fast-worktree` crate 提供快速 git worktree 创建：

```
子代理生成请求 (isolation_worktree: true)
    │
    ▼
xai-fast-worktree 创建 git worktree
    │
    ├── 在 ~/.grok/worktrees/<project>/ 下创建
    ├── 创建 overlay 目录（用于 fork 上下文）
    └── 返回 worktree 路径
    │
    ▼
AgentBuilder
    ├── .working_directory(worktree_path) — 实际工作目录
    └── .prompt_working_directory(original_path) — 模型可见目录
    │
    ▼
子代理在隔离 worktree 中工作
    │
    ▼
完成后，worktree 保留（用户可合并）
```

---

## 四、子代理提示词

子代理使用精简的系统提示词：

- `COMPACT_SYSTEM_PROMPT` — 压缩版系统提示词
- `subagent_prompts.rs` — 子代理特定提示词
- `PromptAudience::Subagent` — 面向子代理的提示词模式
- AGENTS.md 内容被精简后注入

---

## 五、集成架构

```
┌─────────────────────────────────────────────────────────────┐
│ 主 Agent                                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  spawn_subagent 工具 / Workflow 工具                │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│    ┌────────────────────┼────────────────────┐              │
│    │                    │                    │              │
│    ▼                    ▼                    ▼              │
│  子代理 1              子代理 2            并行面板          │
│  (explore)            (general)           [agent1,          │
│    │                    │                 agent2, ...]     │
│    │                    │                    │              │
│    │ 独立 tokio task    │ 独立 tokio task    │ 批量生成      │
│    │ 独立 AgentBuilder  │ 独立 AgentBuilder  │ 最多 16 并发  │
│    │ 独立 ChatState     │ 独立 ChatState     │              │
│    │ 独立 ToolBridge    │ 独立 ToolBridge    │              │
│    │                    │                    │              │
│    │ 可选: worktree 隔离│                    │              │
│    │                    │                    │              │
│    └────────┬───────────┘                    │              │
│             │                                  │              │
│             ▼                                  ▼              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SubagentCoordinator                                  │   │
│  │  - 跟踪活跃子代理                                     │   │
│  │  - 路由通知到 TUI                                     │   │
│  │  - 处理完成/取消/失败                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Workflow 引擎 (Rhai)                                 │   │
│  │  - 脚本验证                                           │   │
│  │  - agent() / parallel() API                          │   │
│  │  - 预算控制 (agent_budget)                            │   │
│  │  - Journal 回放                                       │   │
│  │  - 暂停/恢复 (PauseKind)                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```
