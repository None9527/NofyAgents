# Grok Build — 项目总览

> **Grok Build**（二进制名 `grok`，crate 名 `xai-grok-pager`）是 SpaceXAI 的终端 AI 编程代理。它以全屏 TUI 运行，能理解代码库、编辑文件、执行 Shell 命令、搜索网页、管理长时任务——支持交互模式、无头脚本/CI 模式，以及通过 Agent Client Protocol (ACP) 嵌入编辑器。

---

## 项目身份

| 属性 | 值 |
|------|-----|
| 语言 | Rust (edition 2024) |
| 仓库类型 | 从 SpaceXAI monorepo 定期同步的开源镜像 |
| 源码规模 | ~2,538 个 Rust 文件，~1,536,197 行 Rust 代码 |
| Crate 数量 | ~90 个 workspace member crates |
| 许可证 | Apache-2.0 |
| 源码版本标记 | `SOURCE_REV` 文件记录 monorepo commit SHA |

---

## 核心能力

1. **TUI 交互界面** — 基于 ratatui 的全屏终端 UI，支持流式 LLM 输出渲染、Markdown/代码高亮、Mermaid 图表、模态对话框、滚动历史
2. **Agent 运行时** — 管理对话状态、工具调用、上下文压缩、子代理生成、流式响应
3. **工具系统** — 内置 30+ 种工具（文件读写、搜索、Shell 执行、Web 搜索/抓取、图像/视频生成等），支持多 harness 兼容（Grok Build / Codex / OpenCode）
4. **Shell 集成** — PTY 管理、后台任务、进程组控制
5. **沙箱安全** — Landlock/Seatbelt 内核级文件系统隔离 + bwrap 重执行 + seccomp 网络过滤
6. **MCP 集成** — Model Context Protocol 客户端，支持 stdio/SSE/HTTP 传输，动态发现并注册外部工具
7. **Hooks 系统** — 基于 JSON 配置的文件级钩子，支持 `session_start`/`pre_tool_use`/`post_tool_use`/`session_end` 四种事件
8. **插件市场** — 插件发现、安装、加载、信任管理
9. **Workflow 引擎** — 基于 Rhai 脚本的工作流编排，支持并行子代理生成、预算控制、日志回放
10. **ACP 协议** — Agent Client Protocol 实现，可嵌入 VS Code 等编辑器
11. **Workspace 系统** — 会话持久化、Git 集成、文件系统监控、权限管理
12. **Memory 系统** — 跨会话记忆持久化，支持语义搜索
13. **Markdown 渲染** — 流式增量 Markdown 解析 + 语法高亮 + LaTeX 数学公式
14. **遥测系统** — OpenTelemetry 追踪 + Mixpanel 分析 + Sentry 错误报告

---

## 运行模式

```
┌─────────────────────────────────────────────────────────────────────┐
│                      grok (xai-grok-pager)                           │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  TUI     │  │ Headless │  │ Leader   │  │  Wrap    │            │
│  │ (默认)   │  │ (-p)     │  │ (后台)   │  │ (PTY)    │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│       │             │             │             │                   │
│       └─────────────┴─────────────┴─────────────┘                   │
│                         │                                           │
│                    ┌────▼────┐                                      │
│                    │ Agent   │                                      │
│                    │ Runtime │                                      │
│                    └────┬────┘                                      │
│         ┌───────────────┼───────────────┐                          │
│    ┌────▼────┐   ┌──────▼──────┐  ┌─────▼─────┐                    │
│    │ Tools   │   │ Shell/PTY   │  │  MCP      │                    │
│    │ System  │   │ + Sandbox   │  │  Client   │                    │
│    └─────────┘   └─────────────┘  └───────────┘                    │
└─────────────────────────────────────────────────────────────────────┘
```

| 模式 | 命令 | 描述 |
|------|------|------|
| **TUI** | `grok` | 全屏终端 UI，交互式编程助手 |
| **Headless** | `grok -p "prompt"` | 非交互模式，用于脚本/CI |
| **Leader** | `grok leader` | 后台常驻进程，管理 workspace 和多个客户端 |
| **Wrap** | `grok wrap` | PTY 包装模式 |
| **ACP/Stdio** | `grok --stdio` | JSON-RPC over stdio，供编辑器嵌入 |
| **Serve** | `grok serve` | HTTP/WebSocket 服务器模式 |
| **Workspace** | `grok workspace start/stop/status` | Workspace 生命周期管理 |

---

## 仓库布局

```
grok-build/
├── Cargo.toml              # Workspace 根文件（自动生成）
├── README.md
├── SOURCE_REV               # Monorepo commit SHA
├── rust-toolchain.toml      # Rust 工具链锁定
│
├── crates/
│   ├── build/
│   │   └── xai-proto-build/         # Protobuf 代码生成
│   │
│   ├── codegen/                     # 主代码目录（~80 crates）
│   │   ├── xai-grok-pager-bin/      # 组合根：构建 xai-grok-pager 二进制
│   │   ├── xai-grok-pager/          # TUI 核心：滚动、输入、模态、渲染
│   │   ├── xai-grok-pager-render/   # 渲染原语层
│   │   ├── xai-grok-pager-minimal/  # 精简渲染模式
│   │   ├── xai-grok-agent/          # Agent 定义、构建器、提示词
│   │   ├── xai-grok-shell/          # Shell 集成 + Agent 运行时入口
│   │   ├── xai-grok-shell-base/     # Shell 基础抽象
│   │   ├── xai-grok-tools/          # 工具实现（30+ 内置工具）
│   │   ├── xai-grok-tools-api/      # 工具 API/trait 定义
│   │   ├── xai-grok-sandbox/        # OS 级沙箱（nono: Landlock/Seatbelt）
│   │   ├── xai-grok-mcp/            # MCP 客户端集成
│   │   ├── xai-grok-config/         # 配置加载（多层合并）
│   │   ├── xai-grok-config-types/   # 配置类型定义
│   │   ├── xai-grok-auth/           # 认证（OAuth/API Key）
│   │   ├── xai-grok-telemetry/      # 遥测（OTel + Mixpanel + Sentry）
│   │   ├── xai-grok-hooks/          # Hooks 系统
│   │   ├── xai-grok-workspace/      # Workspace 管理
│   │   ├── xai-grok-memory/         # 跨会话记忆
│   │   ├── xai-grok-models/         # 模型定义
│   │   ├── xai-grok-sampler/        # 采样配置
│   │   ├── xai-grok-markdown/       # 流式 Markdown 渲染
│   │   ├── xai-grok-markdown-core/  # Markdown 核心解析
│   │   ├── xai-grok-mermaid/        # Mermaid 图表渲染
│   │   ├── xai-grok-update/         # 自更新机制
│   │   ├── xai-grok-paths/          # 路径管理
│   │   ├── xai-grok-env/            # 环境变量
│   │   ├── xai-grok-http/           # HTTP 客户端
│   │   ├── xai-grok-secrets/        # 密钥管理
│   │   ├── xai-grok-shared/         # 共享工具
│   │   ├── xai-grok-plugin-marketplace/  # 插件市场
│   │   ├── xai-grok-subagent-resolution/  # 子代理类型解析
│   │   ├── xai-grok-workspace-client/    # Workspace 客户端
│   │   ├── xai-grok-workspace-types/     # Workspace 类型
│   │   ├── xai-grok-extra-ca/        # 额外 CA 证书
│   │   ├── xai-grok-announcements/   # 公告
│   │   ├── xai-grok-version/         # 版本信息
│   │   ├── xai-grok-crash-handler/   # 崩溃处理
│   │   ├── xai-acp-lib/              # ACP 协议库
│   │   ├── xai-agent-lifecycle/      # Agent 生命周期管理
│   │   ├── xai-chat-state/           # 对话状态 Actor
│   │   ├── xai-codebase-graph/       # 代码库图索引
│   │   ├── xai-fast-worktree/        # 快速 Git worktree
│   │   ├── xai-file-utils/           # 文件工具
│   │   ├── xai-fsnotify/             # 文件系统通知
│   │   ├── xai-gix-status/           # Git 状态
│   │   ├── xai-hunk-tracker/         # 文件变更 hunk 追踪
│   │   ├── xai-hooks-plugins-types/  # Hooks/插件共享类型
│   │   ├── xai-mixpanel/             # Mixpanel 分析
│   │   ├── xai-prompt-queue/          # 提示词队列
│   │   ├── xai-ratatui-inline/        # ratatui 内联渲染扩展
│   │   ├── xai-ratatui-textarea/      # ratatui 文本区域组件
│   │   ├── xai-sqlite-journal/        # SQLite 日志
│   │   ├── xai-system-power/         # 系统电源管理
│   │   ├── xai-token-estimation/      # Token 估算
│   │   ├── xai-tracing-macros/        # 追踪宏
│   │   ├── xai-tty-utils/             # TTY 工具
│   │   ├── xai-workflow/             # Workflow 引擎（Rhai 脚本）
│   │   ├── ptyctl/                   # PTY 控制库
│   │   ├── ptyctl-cli/               # PTY 控制 CLI
│   │   └── ...
│   │
│   └── common/                      # 跨产品共享 crate
│       ├── xai-circuit-breaker/     # 断路器模式
│       ├── xai-computer-hub-core/   # Computer Use 核心
│       ├── xai-computer-hub-mcp-adapter/  # MCP 适配器
│       ├── xai-computer-hub-sdk/    # Computer Use SDK
│       ├── xai-grok-compaction/     # 上下文压缩
│       ├── xai-interjection-core/   # 插话/打断核心
│       ├── xai-tool-protocol/       # 工具调用协议
│       ├── xai-tool-runtime/        # 工具执行运行时
│       ├── xai-tool-types/          # 工具类型定义
│       ├── xai-tracing/             # 追踪基础设施
│       └── xai-test-utils/          # 测试工具
│
├── third_party/                    # 第三方库
│   ├── dagre_rust/                 # 图布局算法
│   ├── graphlib_rust/              # 图数据结构
│   ├── mermaid-to-svg/             # Mermaid → SVG 转换
│   └── ordered_hashmap/            # 有序哈希表
│
└── prod/
    └── mc/cli-chat-proxy-types/    # 聊天代理类型
```

---

## 文档导航

| 文档 | 内容 |
|------|------|
| [01-architecture.md](01-architecture.md) | 系统架构、Crate 依赖图、分层设计 |
| [02-tui-pager.md](02-tui-pager.md) | TUI/Pager 渲染层详解 |
| [03-agent-runtime.md](03-agent-runtime.md) | Agent 运行时、生命周期、对话状态、上下文压缩 |
| [04-tool-system.md](04-tool-system.md) | 工具系统、分类法、全部内置工具 |
| [05-shell-sandbox.md](05-shell-sandbox.md) | Shell 集成与沙箱安全 |
| [06-mcp-plugins-hooks.md](06-mcp-plugins-hooks.md) | MCP、插件市场、Hooks 系统 |
| [07-config-auth-telemetry.md](07-config-auth-telemetry.md) | 配置、认证、遥测、环境管理 |
| [08-markdown-rendering.md](08-markdown-rendering.md) | Markdown 渲染、Mermaid、语法高亮 |
| [09-workflow-subagent.md](09-workflow-subagent.md) | Workflow 编排与子代理系统 |
| [10-workspace-memory-models.md](10-workspace-memory-models.md) | Workspace、Memory、模型、采样 |
| [11-acp-interjection.md](11-acp-interjection.md) | ACP 协议、Computer Hub、插话系统 |
| [12-design-philosophy.md](12-design-philosophy.md) | 设计理念、模式、编码约定 |
