# MCP、插件与 Hooks 系统

## 概述

Grok Build 通过三个互补的扩展机制增强 Agent 能力：MCP（Model Context Protocol）连接外部工具服务器，插件市场管理可安装扩展，Hooks 在关键事件点注入自定义逻辑。

---

## 一、MCP 集成（`xai-grok-mcp`）

### 概述

使用官方 **rmcp SDK** 实现的 MCP 客户端，支持 stdio、SSE 和 HTTP 传输。MCP 服务器提供的工具被动态发现并注册到 ToolBridge。

### 传输方式

| 传输 | 描述 | 使用场景 |
|------|------|----------|
| **stdio** | 通过子进程 stdin/stdout 通信 | 本地 MCP 服务器（如 GitHub、Slack） |
| **HTTP (Streamable)** | 通过 HTTP + SSE 流式通信 | 远程 MCP 服务器 |
| **ACP Transport** | 通过 ACP 通道传输 | 嵌入式编辑器场景 |

### 核心模块

```
src/
├── lib.rs              # 入口
├── servers.rs          # MCP 服务器管理（核心）
├── wire.rs             # 线路协议
├── oauth.rs            # MCP OAuth 认证
├── oauth_config.rs     # OAuth 配置
├── credentials.rs      # 凭据管理
├── mcp_http_client.rs  # MCP HTTP 客户端
├── acp_transport.rs    # ACP 传输适配器
└── liveness.rs         # 活性检测
```

### MCP 服务器管理（`servers.rs`）

**工具命名规则：** MCP 工具使用 `server__tool` 格式（双下划线分隔），由 `MCP_TOOL_NAME_DELIMITER` 常量定义。

**工具名验证：** `validate_tool_name()` 确保工具名符合最严格的跨供应商要求：
```
^[a-zA-Z_][a-zA-Z0-9_-]{0,63}$
```
- 必须以字母/下划线开头（Gemini 要求）
- 只允许字母、数字、下划线、连字符（Anthropic/OpenAI 要求）
- 最长 64 字符

**额外 CA 证书：** 通过 `xai-grok-extra-ca` 支持 `GROK_EXTRA_CA_BUNDLE` 环境变量注入额外根证书。

### MCP 客户端架构

```
MCP 服务器配置 (config.toml [mcp] 段)
    │
    ▼
启动 MCP 客户端 (rmcp::ServiceExt::serve)
    │
    ├── stdio → spawn 子进程，通过 stdin/stdout 通信
    ├── HTTP → StreamableHttpClientTransport
    └── ACP → acp_transport 适配器
    │
    ▼
Initialize 握手 (ClientInfo → RunningService<RoleClient>)
    │
    ▼
工具发现 (list_tools)
    │
    ▼
注册到 ToolBridge (namespace = MCP)
    │
    ▼
工具调用路由 (CallToolRequestParams → server__tool)
    │
    ▼
结果返回 (MCPOutput → ToolOutput)
```

### MCP 工具集成

MCP 工具被发现后：
- 注册到 `ToolRegistry`，namespace 为 `MCP`
- 生成 `ToolDefinition`（包含 JSON Schema）发送给 LLM
- LLM 调用时，通过 `server__tool` 格式路由到正确的 MCP 服务器
- 结果作为 `MCPOutput` 返回，包含 `MCPOutputDetails`

### MCP OAuth

某些远程 MCP 服务器需要 OAuth 认证：
- `oauth.rs` — OAuth 流程
- `oauth_config.rs` — `McpOAuthConfig` 配置
- `credentials.rs` — 凭据存储

---

## 二、Hooks 系统（`xai-grok-hooks`）

### 概述

基于文件的轻量级钩子系统，在关键事件点执行用户自定义命令。

### 事件类型

| 事件 | 触发时机 | 阻塞性 |
|------|----------|--------|
| `session_start` | Agent 会话开始 | 非阻塞 |
| `pre_tool_use` | 工具调用前 | **阻塞（可 deny）** |
| `post_tool_use` | 工具调用后 | 非阻塞 |
| `session_end` | Agent 会话结束 | 非阻塞 |

### 钩子发现

从两个目录扫描 JSON 钩子定义文件：
1. `~/.grok/hooks/` — 全局钩子
2. `<git-worktree-root>/.grok/hooks/` — 项目级钩子

### 钩子配置格式

JSON 格式，与 settings 格式兼容：

```json
{
  "name": "lint-on-edit",
  "event": "post_tool_use",
  "command": "npx eslint ${TOOL_INPUT_PATH}",
  "matcher": "search_replace|write|edit",
  "enabled": true,
  "timeout_ms": 30000
}
```

### 核心模块

```
src/
├── lib.rs           # 入口 + 模块文档
├── config.rs        # HookSpec 配置定义
├── discovery.rs     # HookRegistry + 文件发现
├── dispatcher.rs    # 事件分发
├── event.rs         # HookEventName, HookEventEnvelope
├── result.rs        # HookDecision, HookRunResult
├── runner/          # 钩子执行器
│   ├── mod.rs
│   ├── command.rs   # 命令执行
│   └── http.rs      # HTTP 执行
├── matcher.rs       # 工具名匹配器
├── trust.rs         # 信任管理
├── env_expand.rs    # 环境变量展开
└── error.rs         # 错误类型
```

### 分发流程

```
工具调用触发
    │
    ▼
dispatch_pre_tool_use(registry, envelope, ctx)
    │
    ▼
获取所有 pre_tool_use hooks
    │
    ▼
按配置顺序遍历每个 hook
    │
    ├── 检查 enabled / trust 状态
    │   ├── disabled → Skipped
    │   └── 不匹配 matcher → 跳过
    │
    ▼
执行 hook (runner::run_hook)
    │
    ├── command.rs — 执行子进程命令
    │   ├── 环境变量展开 (env_expand)
    │   ├── 超时控制
    │   └── 捕获 stdout
    │
    └── http.rs — HTTP 请求
    │
    ▼
解析 hook 结果
    │
    ├── Allow → 继续下一个 hook
    ├── Deny { reason } → 阻止工具调用
    └── 失败 → fail-open（继续执行）
    │
    ▼
返回 PreToolUseResult { decision, results }
```

### Fail-Open 策略

**设计决策：** Hook 失败（超时、崩溃、command-not-found、环境变量拒绝、格式错误输出）采用 **fail-open** 策略——失败被记录并显示在 UI 中，但工具调用继续执行。

**理由：** Grok 在受保护环境中运行，诱导故障绕过安全钩子不属于威胁模型。之前的 fail-closed 策略在钩子超时或配置错误时过度阻断了正常工具调用。

### HookDecision

```rust
pub enum HookDecision {
    Allow,
    Deny { reason: String, ... },
}
```

### HookRunResult

```rust
pub enum HookRunResult {
    Success { ... },
    Skipped { hook_name: String },
    Failed { hook_name: String, error: String },
    Denied { hook_name: String, reason: String },
    // ...
}
```

### 信任管理（`trust.rs`）

- `is_hook_disabled()` — 检查钩子是否被信任禁用
- 钩子可以通过信任系统被禁用（防止恶意钩子执行）

---

## 三、插件市场（`xai-grok-plugin-marketplace`）

### 概述

插件管理系统，支持插件发现、安装、加载和信任管理。

### 插件生命周期

```
发现 → 安装 → 信任 → 加载 → 激活
  │       │       │       │       │
  │       │       │       │       └── 插件提供的工具/MCP/Hooks 可用
  │       │       │       └── 插件代码加载到进程
  │       │       └── 用户确认信任插件
  │       └── 下载/复制到 ~/.grok/plugins/
  └── 从市场或 Git 仓库发现插件
```

### Agent 插件集成（`xai-grok-agent/src/plugins/`）

```
plugins/
├── mod.rs               # 插件模块入口
├── manifest.rs           # 插件清单解析
├── discovery.rs          # 插件发现
├── registry.rs           # PluginRegistry
├── install_registry.rs   # 安装注册表
├── git_install.rs        # Git 安装
├── local_refresh.rs      # 本地刷新
├── marketplace.rs        # 市场交互
├── hooks_adapter.rs      # Hooks 适配器
└── trust.rs              # 信任管理
```

**插件清单（`manifest.rs`）：** 描述插件的元数据、工具、MCP 服务器、Hooks 等。

**PluginRegistry：** 管理所有已安装的插件，提供插件查询接口。

**Hooks 适配器（`hooks_adapter.rs`）：** 将插件的 Hooks 定义转换为 `xai-grok-hooks` 的 `HookSpec` 格式。

---

## 四、共享类型（`xai-hooks-plugins-types`）

定义 Hooks 和 Plugins 系统共享的类型，避免循环依赖。

---

## 集成关系

```
┌─────────────────────────────────────────────────────────────┐
│ Agent 运行时                                                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ToolBridge   │  │ HookRegistry │  │ PluginRegistry│      │
│  │              │  │              │  │              │      │
│  │ ┌──────────┐│  │ ┌──────────┐│  │ ┌──────────┐│      │
│  │ │ 内置工具 ││  │ │ pre_hook ││  │ │ 清单     ││      │
│  │ │ MCP 工具 ││  │ │ post_hook││  │ │ 工具定义 ││      │
│  │ │ 插件工具 ││  │ │ ...      ││  │ │ MCP 配置 ││      │
│  │ └──────────┘│  │ └──────────┘│  │ │ Hook 配置││      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                │               │
│         │     ┌────────────┘                │               │
│         │     │  插件 → Hooks 适配          │               │
│         │     ▼                              │               │
│  ┌──────────────────────────────────────────┐│               │
│  │      pre_tool_use → dispatch              ││               │
│  │      工具执行                              ││               │
│  │      post_tool_use → dispatch             ││               │
│  └──────────────────────────────────────────┘│               │
│                                              │               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  MCP Client (rmcp)  ←──  stdio/HTTP/SSE  ──→ MCP 服务器│  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```
