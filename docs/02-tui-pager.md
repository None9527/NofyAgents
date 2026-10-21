# TUI / Pager 渲染层

## 概述

Grok Build 的 TUI 层是一个基于 **ratatui** 的全屏终端用户界面，支持流式 LLM 输出、Markdown 渲染、工具调用展示、模态对话框等。核心由 5 个 crate 组成。

---

## Crate 结构

### 1. `xai-grok-pager-bin` — 组合根

二进制入口，构建名为 `xai-grok-pager` 的可执行文件。

**职责：**
- 全局 allocator（jemalloc + `malloc_conf` profiling 配置）
- CLI 参数解析（clap derive）
- 沙箱应用（`bwrap` re-exec + `SandboxManager`）
- Tracing/遥测初始化
- 运行模式分发

**CLI 命令结构（`PagerArgs`）：**

| 命令 | 描述 |
|------|------|
| `agent` (默认) | 启动 TUI 交互模式 |
| `headless` / `-p` | 非交互模式 |
| `leader` | 启动/管理后台 Leader 进程 |
| `wrap` | PTY 包装模式 |
| `serve` | HTTP/WebSocket 服务器 |
| `workspace` | Workspace 生命周期管理 |
| `leader-mgmt` | Leader 进程管理 (kill/list/info) |
| `setup` | 安装托管配置 |
| `mcp` | MCP 服务器管理 |
| `doctor` | 诊断 |

**关键特性：**
- `jemalloc` feature：启用 jemalloc allocator（默认开启）
- `sandbox-enforce` feature：启用内核级沙箱（默认开启）
- `local-workspace` feature：本地 workspace 模式
- `release-dist` feature：分发构建配置

### 2. `xai-grok-pager` — TUI 核心

主库，包含所有 TUI 应用逻辑。

**模块组织：**

```
src/
├── app/                    # 应用入口和终端管理
│   ├── mod.rs              # AppView 根组件、CLI 定义
│   ├── actions.rs          # Action/Effect/TaskResult 枚举
│   ├── agent.rs            # AgentSession, AgentId, TurnState
│   ├── agent_view/         # 每代理视图模型
│   │   ├── mod.rs          # AgentView: 输入处理 + 绘制
│   │   ├── render.rs       # 渲染逻辑
│   │   ├── prompt.rs       # 提示词输入
│   │   ├── modals.rs       # 模态对话框
│   │   ├── plan.rs         # 计划模式
│   │   ├── panes.rs        # 面板布局
│   │   ├── viewer.rs       # 查看器
│   │   ├── media.rs        # 媒体展示
│   │   ├── paste.rs        # 粘贴处理
│   │   ├── rewind.rs       # 回退/历史
│   │   ├── links.rs        # 链接处理
│   │   └── shell_completion.rs  # Shell 补全
│   ├── app_view.rs         # AppView: 根组件，输入路由 + draw
│   ├── dispatch/           # Action → 状态变更 + Vec<Effect>
│   │   ├── ctx.rs          # 调度上下文
│   │   ├── auth.rs         # 认证相关
│   │   ├── cta.rs          # 行动号召
│   │   ├── dashboard.rs    # 仪表盘
│   │   └── ...             # 其他 dispatch 处理器
│   ├── effects.rs          # Effect → 异步任务生成
│   ├── event_loop.rs       # tokio::select! 主循环
│   ├── acp_handler/        # ACP 通知路由
│   │   ├── mod.rs          # ACP 处理主模块
│   │   ├── permissions.rs  # 权限处理
│   │   ├── queue.rs        # 队列处理
│   │   ├── routing.rs      # 路由
│   │   └── ...
│   ├── bundle.rs           # 打包
│   ├── cli.rs              # CLI 参数定义 (clap derive)
│   ├── roster.rs           # Agent 花名册
│   ├── session_startup.rs  # 会话启动
│   ├── status_blocks.rs    # 状态栏
│   ├── subagent.rs         # 子代理管理
│   └── turn_completion.rs  # 轮次完成
├── acp/                    # ACP 集成
│   ├── leader_bridge.rs    # Leader 桥接
│   ├── spawn.rs            # ACP 进程生成
│   ├── tracker.rs          # 追踪器
│   └── ...
├── scrollback.rs           # 滚动历史
├── input.rs                # 输入处理
├── slash/                  # Slash 命令系统
├── actions/                # 用户可配置动作
├── settings.rs             # 设置面板
├── completions_cmd.rs      # 补全命令
├── diagnostics.rs          # 诊断
├── diff.rs                 # Diff 显示
├── git_info.rs             # Git 信息
├── headless.rs             # 无头模式
├── notifications.rs        # 通知
├── tool_usage.rs           # 工具使用展示
├── minimal_api.rs          # Minimal 模式 facade
├── minimal_hook.rs         # Minimal 模式 IoC 缝合
├── search.rs               # 搜索
├── pty_wrap.rs             # PTY 包装
├── docs.rs                 # 文档系统
├── tips.rs                 # 提示
├── tutorial_docs.rs        # 教程文档
└── ...
```

**渲染原语从 `xai-grok-pager-render` 重新导出：**
```rust
pub use xai_grok_pager_render::{
    appearance, clipboard, gboom, glyphs, host, link_opener,
    modal_window_state, prompt_images, render, syntax, terminal,
    theme, util,
};
```

### 3. `xai-grok-pager-render` — 渲染原语

独立的表示层原语 crate，从 pager 中提取以保持关注分离。

**模块：**
- `appearance` — 外观/主题配置
- `theme` — 主题系统（明/暗模式、颜色方案）
- `syntax` — 语法高亮
- `terminal` — 终端能力检测
- `glyphs` — 图标/字形
- `clipboard` — 剪贴板集成
- `link_opener` — 链接打开
- `host` — 宿主环境
- `render` — 渲染辅助
- `modal_window_state` — 模态窗口状态
- `prompt_images` — 提示词中的图片
- `util` — 工具函数

### 4. `xai-grok-pager-minimal` — 精简渲染模式

通过 `/minimal` 命令切换的精简渲染模式。通过 fn-pointer IoC 缝合连接到主 pager，避免循环依赖。

### 5. ratatui 扩展

- `xai-ratatui-inline` — ratatui 内联渲染扩展
- `xai-ratatui-textarea` — 文本区域输入组件

---

## 事件循环架构

```
event_loop.rs
│
└── tokio::select! (biased)
    ├── 终端事件 (crossterm::event)     → AppView::handle_input()
    ├── ACP 通道消息                    → acp_handler::route()
    ├── 异步任务结果 (JoinSet)          → dispatch::handle_task_result()
    ├── 动画 tick (sleep_until)         → AppView::tick()
    ├── 配置热重载通知                  → AppView::reload_config()
    └── 系统外观变化 (macOS)            → theme 更新
```

**设计理念：**
- 事件循环是一个**薄**的 `tokio::select!` 循环
- 所有输入路由、渲染、状态管理委托给 `AppView`
- 事件循环只处理 IO 管道：终端事件、ACP 通道、任务结果、动画 tick

---

## AppView / AgentView 架构

### AppView（根组件）

管理整个应用的状态和输入路由：

- **AgentView 集合** — 支持多个并行 agent tab
- **AuthState** — 认证状态
- **TrustState** — 文件夹信任状态
- **ActiveView** — 当前活跃视图
- **模态/覆盖层** — 模态对话框状态

### AgentView（每代理视图模型）

每个 agent 会话有一个 AgentView，负责：
- **输入处理** — 文本输入、快捷键、Slash 命令
- **渲染** — 滚动历史、提示词、工具调用、模态
- **会话状态** — 轮次状态、队列、计划模式

**AgentView 子模块：**
- `prompt` — 提示词输入框
- `render` — 主渲染逻辑
- `modals` — 模态对话框（权限请求、确认等）
- `panes` — 面板布局
- `viewer` — 文件查看器
- `media` — 图片/视频展示
- `paste` — 剪贴板粘贴
- `rewind` — 对话回退
- `links` — 超链接处理
- `plan` — 计划模式 UI
- `shell_completion` — Shell 命令补全
- `selection` — 文本选择
- `queue` — 队列展示

---

## Dispatch / Effects 模式

采用经典的 **Action → State → Effect** 模式：

```
用户输入
    │
    ▼
Action (枚举: 键盘/鼠标/Slash/ACP消息/...)
    │
    ▼
dispatch::handle_action(action, ctx) → (state_mutation, Vec<Effect>)
    │  ← 同步、可测试、无 IO
    ▼
Effect (枚举: PromptAgent/SpawnTask/SendACP/...)
    │
    ▼
effects::spawn(effect) → tokio task
    │  ← 异步、有 IO
    ▼
TaskResult → dispatch::handle_task_result() → 更新状态
```

**关键特点：**
- Dispatch 是纯同步函数，完全可测试
- Effects 是异步任务，处理网络/文件/进程 IO
- 状态变更永远通过 dispatch，不允许直接修改

---

## Markdown 渲染集成

TUI 通过 `xai-grok-markdown` crate 实现流式 Markdown 渲染：

- **StreamingMarkdownRenderer** — 增量渲染，chunk-by-chunk
- **Checkpoint 冻结** — 只重新渲染稳定边界后的"尾部"
- **语法高亮** — syntect 引擎
- **颜色自适应** — 自动降级到 256 色/16 色
- **LaTeX 数学** — `$...$` 和 `$$...$$` 转换为 Unicode 近似
- **Mermaid 图表** — 渲染为 SVG，离线程 worker

---

## 终端能力管理

- **Kitty 键盘协议** — 增强键盘输入（GBOOM 游戏需要 `REPORT_ALL_KEYS_AS_ESCAPE_CODES`）
- **颜色检测** — truecolor/256/16 色自适应
- **系统外观监控** — macOS 暗色模式自动切换主题
- **屏幕模式** — 内嵌模式（`/minimal`）和全屏模式（`/fullscreen`），支持 re-exec 切换

---

## VSCode Remote-SSH 文件链接（2026-10-21）

- 官方 VSCode SSH 终端中，Read/Edit 标题显示远端绝对路径，保留影响符号链接语义的 `..`。
- 文件路径由 VSCode 原生文件检测器处理，macOS 使用 Command+点击，在当前 SSH 窗口打开；不输出对应的 `file://` OSC 8，也不调用客户端外部程序。
- 被裁切、不能独立定位的文件文字不回退到外部 URL。需要加宽终端以显示完整路径；VSCode 的终端文件链接检测必须开启。
- 本机终端、非官方 VSCode 分支及 HTTP/HTTPS 链接保持原策略。本次未替换远端已有的 Grok 程序。

维护入口：修改 `render/tool_paths.rs`、`render/osc8.rs` 或文件链接点击策略时阅读本节；由调试维护者在这些策略改变时更新。
验证入口：`nofy-pager-render` 的链接/路径测试、`nofy-pager` 单测，以及 `pty_e2e_vscode_ssh_links` 原生 PTY 测试。
PTY 对照验证 PNG 标题的绝对路径与无外部文件 URL；VSCode SSH 实机点击另用临时 PNG 验证，未部署远端 Nofy。

---

## ACP / Leader 集成

TUI 通过 ACP 协议与 Leader 进程通信：

- **Leader Bridge** (`acp/leader_bridge.rs`) — 桥接 TUI 和 Leader
- **ACP Handler** (`app/acp_handler/`) — 路由 ACP 通知
  - `permissions.rs` — 工具权限请求
  - `queue.rs` — 提示词队列
  - `routing.rs` — 消息路由
  - `session_notification.rs` — 会话通知
  - `subagent_activity.rs` — 子代理活动
  - `workflow_ingest.rs` — Workflow 摄取
  - `settings.rs` — 设置同步
  - `mcp.rs` — MCP 状态

**Leader 重连恢复：** 当 Leader 崩溃后重连，TUI 会缓存所有会话状态（`StdioReplayState`）并重放 `initialize` + 每个会话的 `session/load` 请求。

---

## `/gboom` 游戏

内置的 Kitty 终端游戏，需要额外的键盘层（`REPORT_ALL_KEYS_AS_ESCAPE_CODES`）来追踪同时按下的多个键。键盘层在游戏打开时推送、关闭时弹出，与基础键盘层分离管理。
