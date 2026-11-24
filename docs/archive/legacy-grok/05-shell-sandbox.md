# Shell 集成与沙箱安全

## 概述

Grok Build 的 Shell 子系统负责进程生成、PTY 管理、命令执行和后台任务。沙箱子系统通过内核级隔离（Landlock/Seatbelt + bwrap + seccomp）保护用户系统安全。

---

## Crate 结构

### 1. `xai-grok-shell` — Shell 集成主库

**模块概览：**

```
src/
├── lib.rs                  # 入口（re-export 大量子模块）
├── active_sessions.rs      # 活跃会话追踪
├── agent/                   # Agent 运行时集成（详见 03-agent-runtime.md）
├── auth/                    # 认证（详见 07-config-auth-telemetry.md）
├── builtin/                 # 内置功能
├── bundle/                  # 打包
├── claude_import.rs         # Claude 配置导入
├── claude_import_state.rs   # Claude 导入状态
├── cli_models.rs            # CLI 模型
├── config/                  # 配置加载
├── extensions/              # 扩展
├── heap_profile.rs          # 堆分析
├── inspect/                  # 检查
├── instrumentation/         # 仪表化
├── leader/                   # Leader 进程管理
├── managed_config/           # 托管配置
├── mcp_doctor/               # MCP 诊断
├── plugin/                   # 插件
├── relay/                    # 中继
├── remote/                   # 远程
├── sampling/                 # 采样
├── session/                  # 会话管理
├── terminal/                 # 终端
├── tier/                     # 层级
├── tools/                    # 工具集成
├── upload/                   # 上传
└── util/                     # 工具函数
```

### 2. `xai-grok-shell-base` — Shell 基础抽象

提供 Shell 层的基础类型和 trait：
- CPU profiling
- 环境变量管理

### 3. `xai-grok-shell-session-support` — 会话支持

会话级支持功能。

### 4. `ptyctl` — PTY 控制库

伪终端控制库，提供：
- PTY 分配和管理
- 进程组控制
- 信号处理

### 5. `xai-grok-sandbox` — 沙箱系统

**核心理念：** 在进程启动时一次性应用 OS 级沙箱，覆盖进程内 `tokio::fs` 调用和子进程。网络在进程级别保持开放（Agent 需要 LLM API），子进程网络通过 seccomp 按子进程阻止。

**沙箱层次：**

```
┌─────────────────────────────────────────────────────────────────┐
│ 应用进程                                                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Landlock (Linux) / Seatbelt (macOS)  ← nono 库           │  │
│  │ - 文件系统访问控制（白名单/黑名单）                        │  │
│  │ - 不可逆，内核强制执行                                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ bwrap (Linux) ← 用户空间容器 re-exec                      │  │
│  │ - 只读绑定（deny_write）                                  │  │
│  │ - 不可读路径绑定覆盖（deny_read）                         │  │
│  │ - Hook 写保护                                             │  │
│  │ - --cap-drop ALL                                          │  │
│  │ - --dev-bind /dev                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ seccomp ← 子进程网络过滤                                   │  │
│  │ - 在已知 Linux 子进程启动路径安装网络过滤器               │  │
│  │ - 阻止子进程的网络访问                                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 沙箱详细设计

### `SandboxManager`

```rust
pub struct SandboxManager {
    profile: ProfileName,
    logger: SandboxLogger,
    net_restricted: bool,
    applied: bool,
}
```

**生命周期：**
1. `SandboxManager::new(profile, workspace)` — 创建管理器
2. `apply(workspace)` — 应用沙箱（**不可逆**）
   - 检查 Hook 写保护需求
   - 加载沙箱配置（`sandbox.toml`）
   - 解析 profile
   - 获取能力集
   - 调用 `nono::Sandbox::apply()`
3. `install(self)` — 全局安装，供会话级违规日志使用

### `ProfileName` — 沙箱 Profile

| Profile | 描述 |
|---------|------|
| `Off` | 沙箱关闭 |
| `Workspace` | 工作区沙箱（默认） |
| `Strict` | 严格沙箱 |
| `ReadOnly` / `Readonly` | 只读沙箱 |
| `Devbox` | 开发盒沙箱（/data 写保护） |
| `Custom(String)` | 自定义 profile（从 sandbox.toml 加载） |

### 配置文件：`sandbox.toml`

位于 `.grok/sandbox.toml`，定义自定义 profile：

```toml
[profiles.my-custom]
extends = "workspace"
deny = [".env", "secrets/"]
```

- `extends` — 继承内置 profile
- `deny` — 不可读路径列表（支持 glob）
- 自定义 profile 可继承 `devbox` 获得 `/data` 写保护

### Hook 写保护

沙箱保护 Hook 目录（`~/.grok/hooks/`）不被恶意写入：
- `requires_hook_write_deny()` — 判断 profile 是否需要 Hook 写保护
- `hook_write_deny` 模块 — 实现 bwrap 绑定计划
- 根ward 祖先 RW 自绑定 → 叶子 RO 绑定（确保 bwrap 挂载顺序正确）
- 身份重验证（防止叶子被替换）

### bwrap re-exec 流程

```
进程启动
    │
    ▼
检查是否已在 bwrap 内 (__GROK_INSIDE_BWRAP 环境变量)
    │
    ├── 是 → 跳过 re-exec
    └── 否 → 构建 bwrap 命令
        │
        ├── --cap-drop ALL
        ├── --bind / / (根挂载)
        ├── --ro-bind <deny_write_path> <deny_write_path> (只读挂载)
        ├── --ro-bind <blocked_placeholder> <deny_read_path> (不可读覆盖)
        ├── --dev-bind /dev /dev
        ├── --proc /proc
        ├── --env __GROK_INSIDE_BWRAP=1
        └── -- <self_exe> <args>
        │
        ▼
        exec(bwrap command)
```

### seccomp 子进程网络过滤

```
should_restrict_child_network()
    │
    ▼
在已知 Linux 子进程启动路径安装 seccomp 过滤器
    │
    └── 阻止 socket/connect/accept 等网络系统调用
```

### 沙箱违规日志

```
SandboxLogger
├── log(SandboxEvent) — 记录事件
├── flush_to_disk() — 刷新到磁盘
└── metrics() — 返回 SandboxMetrics

事件类型：
- profile_applied — profile 成功应用
- apply_failed — 应用失败
- fs_violation — 文件系统违规
```

### 全局状态

```rust
static SANDBOX: OnceLock<GlobalSandboxState> = OnceLock::new();
static CONFIGURED_PROFILE: OnceLock<String> = OnceLock::new();
static AUTO_ALLOW_BASH: AtomicBool = AtomicBool::new(false);
```

- `SANDBOX` — 全局沙箱状态（安装后）
- `CONFIGURED_PROFILE` — 启动时配置的 profile 名
- `AUTO_ALLOW_BASH` — 沙箱激活时自动批准 bash 命令

### Fail-Closed 设计

- profile 解析失败 → 拒绝启动（如果 profile 有 deny 或 hook 写保护需求）
- bwrap deny plan 构建 → 失败则拒绝启动
- Hook 写保护准备 → 失败则拒绝启动

---

## PTY 管理

`ptyctl` crate 提供 PTY 控制：

- **PTY 分配** — 为 Shell 命令分配伪终端
- **进程组管理** — `ProcessGroup` / `ProcessScope`（在 `xai-grok-tools/src/util/spawn.rs`）
- **信号处理** — SIGTERM/SIGKILL 到进程组
- **输出捕获** — 流式捕获 stdout/stderr

---

## 后台任务系统

```
用户请求后台执行命令
    │
    ▼
run_terminal_command 工具 → background=true 参数
    │
    ▼
Task Coordinator 创建后台任务
    │
    ├── 分配 task_id
    ├── 生成子进程（PTY + 进程组）
    ├── 注册到活跃任务列表
    └── 返回 task_id 给用户
    │
    ▼
后台任务运行
    │
    ├── 输出流式发送到 TUI（通过通知系统）
    ├── 用户可以查看输出 (task_output 工具)
    ├── 用户可以等待完成 (wait_tasks 工具)
    └── 用户可以终止 (kill_task 工具)
    │
    ▼
任务完成/终止
    │
    └── 通知用户（通过 TaskResult → TUI）
```

**任务相关工具：**
- `task` — 后台任务管理（创建、列出、等待）
- `task_output` — 获取任务输出
- `kill_task` — 终止任务
- `monitor` — 流式监控（长时间运行的命令）

---

## 进程组管理

`ProcessGroup` 和 `ProcessScope`（`xai-grok-tools/src/util/spawn.rs`）：

- **ProcessGroup** — 管理 Shell 命令的进程组
  - 发送信号到整个进程组
  - 超时后升级 SIGTERM → SIGKILL
  - 清理子进程

- **ProcessScope** — 进程作用域
  - `ProcessScope::Reclaim` — 进程范围回收
  - 用于 dhat 内存分析测试

---

## Shell 会话持久化

Shell 会话支持持久化：
- 当前工作目录
- 环境变量
- 活跃后台任务
- Shell 历史

会话恢复时可以重新加载这些状态。
