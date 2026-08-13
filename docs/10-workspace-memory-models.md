# Workspace、Memory、模型与采样

## 概述

Grok Build 的 Workspace 系统管理会话持久化、Git 集成和文件系统监控。Memory 系统提供跨会话的记忆持久化和语义搜索。模型系统定义支持的 LLM 模型，采样系统控制生成参数。

---

## 一、Workspace 管理（`xai-grok-workspace` + `xai-grok-workspace-client` + `xai-grok-workspace-types`）

### 核心理念

Workspace 是 Grok Build 的会话和状态管理核心。它协调：
- 会话持久化和恢复
- Git 集成（状态、commit、worktree）
- 文件系统监控和通知
- 权限管理
- Hub 连接（多会话共享）
- 诊断服务器

### 模块结构

```
src/
├── lib.rs               # 入口
├── activity.rs           # 活动追踪
├── capability.rs         # CapabilityMode
├── channel.rs            # 传输通道
├── config.rs             # WorkspaceConfig, AgentSessionConfig
├── daemonize.rs          # 守护进程化
├── diag_server.rs        # 诊断服务器
├── discovery.rs          # 发现
├── envrc.rs              # .envrc 集成
├── error.rs              # WorkspaceError
├── export_github.rs      # GitHub 导出
├── file_system.rs        # 文件系统操作
├── folder_trust.rs       # 文件夹信任
├── foreign_sessions.rs   # 外部会话
├── fs_notify.rs          # 文件系统通知
├── handle.rs             # WorkspaceHandle（核心句柄）
├── hub.rs                # HubConfig
├── hub_auth.rs           # Hub 认证
├── hub_channel.rs        # Hub 通道
├── hub_ids.rs            # Hub ID
├── hub_server.rs         # Hub 服务器
├── mcp.rs                # MCP 集成
├── permission.rs         # 权限管理
├── preview_supervisor.rs # 预览监督
├── project_config.rs     # 项目配置
├── recovery.rs           # 恢复
├── rpc_envelope.rs       # RPC 信封
├── session/              # 会话管理
│   ├── git.rs            # Git 操作
│   ├── jj.rs             # Jujutsu (jj) 操作
│   ├── swap_policy.rs    # 工具集交换策略
│   └── file_state.rs     # 文件状态
├── status_config.rs      # StatusConfig
├── trust.rs              # 信任管理
├── upload/               # 上传
│   └── environment.rs    # WorkspaceEnvironment, WorkspaceIdentity
├── workspace_ops.rs      # WorkspaceOp, WorkspaceOps
└── worktree.rs           # Worktree 管理
```

### WorkspaceHandle

核心句柄，管理 workspace 的连接和操作：

```rust
pub struct WorkspaceHandle {
    // ...
}

// 关键方法：
pub fn connect_local_workspace(...) -> WorkspaceHandle;
pub fn resolve_workspace_home() -> PathBuf;
pub fn drain(&self) -> DrainOutcome;
```

**DrainOutcome / DrainReason** — workspace 排空结果和原因（如 SIGTERM）。

### CapabilityMode

```rust
pub enum CapabilityMode {
    // 不同的能力模式
}
```

### WorkspaceConfig

```rust
pub struct WorkspaceConfig {
    // workspace 配置
}

pub struct AgentSessionConfig {
    // agent 会话配置
}

pub struct MemoryConfig {
    // memory 配置
}

pub struct SessionContextFactory {
    // 会话上下文工厂
}
```

### 会话管理

- **WorkspaceSession** / **WorkspaceShared** — 会话和共享状态
- **Git 操作** (`session/git.rs`) — commit、状态、对象检查
- **Jujutsu 操作** (`session/jj.rs`) — jj VCS 集成
- **工具集交换** (`session/swap_policy.rs`) — 动态工具集切换策略

### 权限管理（`permission.rs`）

- 工具执行权限
- 文件夹信任
- 权限超时

### 文件系统通知（`fs_notify.rs`）

使用 `notify` / `notify-debouncer-mini` 监控文件系统变化：
- 文件创建/修改/删除
- 目录变化
- 防抖处理

### 恢复（`recovery.rs`）

- 会话恢复
- 崩溃后恢复
- `git_object_exists()` — 检查 git 对象是否存在
- `ensure_commits_reachable()` — 确保 commits 可达

### Hub 系统

- **HubConfig** — Hub 配置
- **Hub 服务器** (`hub_server.rs`) — WebSocket Hub 服务器
- **Hub 通道** (`hub_channel.rs`) — Hub 通信通道
- **Hub 认证** (`hub_auth.rs`) — Hub 认证
- **Hub ID** (`hub_ids.rs`) — Hub 标识

Hub 允许多个客户端共享一个 workspace（Leader 模式）。

### 外部会话（`foreign_sessions.rs`）

发现和管理外部会话（其他 grok 进程或兼容工具的会话）。

### 指标（Metrics）

```rust
pub fn init_metrics() {
    handle::init_metrics();
    recovery::init_metrics();
    session::swap_policy::init_metrics();
    upload::init_metrics();
    permission::init_metrics();
    hub_server::init_metrics();
}
```

零初始化每个 workspace 指标族，确保空闲面板显示 `0` 基线而不是"No data"。

---

## 二、Memory 系统（`xai-grok-memory`）

### 概述

跨会话记忆持久化系统，让 Agent 可以记住之前交互中的重要信息。

### 存储位置

- **全局记忆** — `~/.grok/memory/`
- **工作区记忆** — `.grok/memory/`

### 记忆工具

在 `xai-grok-tools/src/implementations/memory/` 中：

| 工具 | 功能 |
|------|------|
| `memory_search` | 语义搜索记忆 |
| `memory_get` | 读取特定记忆 |

### MemoryBackend trait

```rust
pub trait MemoryBackend: Send + Sync {
    // 记忆后端接口
}
```

可注入不同的记忆后端实现。

---

## 三、模型管理（`xai-grok-models`）

### 模型定义

模型 ID 从 `default_models.json` 编译时嵌入：

```rust
pub const DEFAULT_MODELS_JSON: &str = include_str!("../default_models.json");
```

### 模型解析优先级

```
CLI flag > ENV var > config.toml > remote settings > 编译时默认
```

### 模型类别

| 类别 | 用途 | 解析函数 |
|------|------|----------|
| `default` | 主模型（编程任务和通用回退） | `default_model()` |
| `web_search` | Web 搜索合成 | `default_web_search_model()` |
| `image_description` | 图像描述 | `default_image_description_model()` |
| `session_summary` | 会话标题/摘要生成 | `default_session_summary_model()` |

### 模型管理（Shell 层）

`xai-grok-shell/src/agent/models/`：

```
models/
├── cache.rs          # 模型缓存
├── endpoint.rs       # 端点管理
├── fetch.rs          # 模型获取
├── resolution.rs     # 模型解析
└── tests.rs
```

- **缓存** — 缓存模型列表，减少 API 调用
- **端点** — 管理 API 端点
- **获取** — 从 API 获取可用模型列表
- **解析** — 解析模型 ID（CLI > ENV > config > remote > default）

### 模型提供器

`model_providers.rs` — 管理不同的 LLM API 提供器（xAI、兼容端点等）。

---

## 四、采样系统（`xai-grok-sampler` + `xai-grok-sampling-types`）

### 采样配置

```
SamplingConfig
├── temperature — 温度
├── top_p — Top-p 采样
├── max_tokens — 最大 token 数
├── top_k — Top-k 采样
└── ... 其他参数
```

### HostedTool

```rust
pub enum HostedTool {
    WebSearch,
    XSearch,
    // ...
}
```

后端托管工具——在 API 请求中作为原生类型发送，由 agentic sampler 在服务端执行。

### Sampling Types

`xai-grok-sampling-types` — 采样相关的共享类型定义。

---

## 五、Token 估算（`xai-token-estimation`）

### 概述

不依赖 tokenizer 的快速 token 估算，用于：
- 上下文窗口管理
- 压缩触发判断
- 使用量追踪

### 估算策略

- 基于字符数的启发式估算（英文 ~4 字符/token，中文 ~2 字符/token）
- 特殊 token 计数
- 工具定义 token 估算

---

## 六、代码库图（`xai-codebase-graph`）

### 概述

代码库索引和查询系统，提供代码结构化理解。

### 使用 petgraph

使用 `petgraph` 库构建代码依赖图：
- 模块依赖关系
- 函数调用关系
- 类型引用关系

---

## 七、文件相关工具

### `xai-file-utils` — 文件工具

文件操作的基础工具集（路径处理、文件读写等）。

### `xai-fsnotify` — 文件系统通知

基于 `notify` 库的文件系统监控封装。

### `xai-gix-status` — Git 状态

使用 `gix` 库获取 Git 状态（修改、暂存、未跟踪文件）。

### `xai-hunk-tracker` — Hunk 追踪

```
┌────────────────┐                  ┌──────────────────────────────────────┐
│ SessionActor  │ ─── Command ───▶ │        HunkTrackerActor              │
│                │                  │  (runs in dedicated tokio task)      │
└────────────────┘                  │  State (no locks needed):            │
                                     │  - hunks: HashMap<PathBuf, Hunk>     │
┌────────────────┐                  │                                      │
│   Query        │ ── Cmd+Oneshot ─▶│                                      │
│ (get_hunks)   │ ◀── Response ────│                                      │
└────────────────┘                  └──────────────────────────────────────┘
```

追踪文件变更的 hunk（差异块），用于：
- 编辑 diff 显示
- 回退操作
- 文件变更通知

### `xai-fast-worktree` — 快速 Git Worktree

快速创建 Git worktree，用于子代理隔离。

---

## 八、语音输入（`xai-grok-voice`）

语音输入集成，支持：
- 麦克风录音
- 语音转文字
- 将转文字结果注入提示词

---

## 九、系统电源（`xai-system-power`）

系统电源管理，检测：
- 电池状态（影响遥测频率）
- 电源模式（省电/高性能）
- 睡眠/唤醒事件
