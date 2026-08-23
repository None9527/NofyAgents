# 工具系统

## 概述

Grok Build 的工具系统是 Agent 与外部世界交互的桥梁——文件操作、Shell 执行、Web 搜索、图像生成等所有能力都通过工具实现。系统设计支持多 harness 兼容（Grok Build / Codex / OpenCode / MCP），具有统一的分类法、权限控制和通知机制。

---

## Crate 结构

### 1. `xai-grok-tools` — 工具实现（核心）

最大的工具 crate，包含所有内置工具实现。

#### 模块组织

```
src/
├── lib.rs                  # 入口
├── bridge.rs               # ToolBridge：注册表 + 会话上下文 + 通知
├── tool_taxonomy.rs         # 工具分类法（ToolKind / CanonicalToolMeta）
├── normalization.rs         # 跨 harness 输入规范化
├── attribution.rs          # 归因回调
├── retry.rs                # 重试逻辑
├── versions.rs             # 工具版本管理
├── persistence.rs          # 工具状态持久化
├── gitignore.rs            # .gitignore 集成
│
├── types/                  # 类型定义
│   ├── mod.rs
│   ├── tool.rs             # ToolKind, ToolNamespace 枚举
│   ├── definition.rs       # ToolDefinition
│   ├── context.rs          # ToolContext
│   ├── output.rs           # ToolOutput, MCPOutput
│   ├── params_validation.rs # 参数验证
│   ├── schema.rs           # JSON Schema 生成
│   ├── requirements.rs    # 工具要求
│   ├── resources.rs        # 资源管理
│   ├── tool_metadata.rs    # ToolMetadata
│   ├── tool_index.rs       # 工具索引
│   ├── tool_io.rs          # 工具 IO
│   ├── session_mode.rs     # 会话模式
│   ├── memory_backend.rs   # MemoryBackend trait
│   ├── process_manager.rs  # 进程管理
│   ├── api_key_provider.rs # API Key 提供器
│   ├── compat.rs           # 厂商兼容配置
│   ├── config_source.rs    # 配置来源
│   ├── claude_alias.rs     # Claude 别名映射
│   ├── template_renderer.rs # 模板渲染
│   ├── description.rs      # 工具描述
│   ├── error.rs            # 错误类型
│   └── skill_discovery_tracker/  # 技能发现追踪
│
├── registry/               # 工具注册表
│   ├── mod.rs
│   ├── types.rs            # SessionContext, 工具注册
│   └── proto_convert.rs   # 协议转换
│
├── implementations/        # 具体工具实现
│   ├── mod.rs
│   ├── read_file/          # 文件读取（含 PDF/PPTX/图片）
│   ├── search_tool/        # 搜索工具
│   ├── web_search/         # Web 搜索
│   ├── skills/             # 技能发现和执行
│   ├── task_output/        # 任务输出
│   ├── use_tool/           # MCP 工具使用
│   ├── lsp/                # LSP 集成
│   ├── memory/             # 记忆工具
│   │
│   ├── grok_build/         # ── Grok Build 原生工具 ──
│   │   ├── bash/           # Shell 命令执行
│   │   ├── read_file/      # 文件读取
│   │   ├── list_dir/       # 目录列表
│   │   ├── search_replace/ # 搜索替换
│   │   ├── grep/           # ripgrep 搜索
│   │   ├── monitor/        # 监控（流式日志）
│   │   ├── scheduler/      # 定时调度器
│   │   ├── task/           # 后台任务管理
│   │   ├── task_output/    # 任务输出
│   │   ├── web_fetch/      # Web 页面抓取
│   │   ├── web_search/     # Web 搜索
│   │   ├── workflow/       # Workflow 触发
│   │   ├── image_gen/       # 图像生成
│   │   ├── image_edit/     # 图像编辑
│   │   ├── video_gen/      # 视频生成
│   │   ├── kill_task/      # 终止任务
│   │   ├── enter_plan_mode/  # 进入计划模式
│   │   ├── exit_plan_mode/   # 退出计划模式
│   │   ├── ask_user_question/ # 向用户提问
│   │   ├── update_goal/    # 更新目标
│   │   ├── deploy_app_stub/  # 应用部署
│   │   ├── lsp/            # LSP 操作
│   │   └── storage.rs      # 存储
│   │
│   ├── grok_build_concise/ # ── 精简版工具 ──
│   │   ├── bash.rs         # Shell 命令
│   │   ├── read_file.rs    # 文件读取
│   │   ├── search_replace.rs # 搜索替换
│   │   └── mod.rs
│   │
│   ├── grok_build_hashline/ # ── Hashline 工具（行锚点编辑）──
│   │   ├── anchor.rs       # 锚点
│   │   ├── config.rs       # 配置
│   │   ├── edit/           # 编辑
│   │   ├── grep.rs         # 搜索
│   │   ├── mutate.rs       # 变异
│   │   ├── read_file.rs    # 文件读取
│   │   └── scheme.rs       # 方案
│   │
│   ├── codex/              # ── Codex 兼容工具 ──
│   │   ├── apply_patch/    # 补丁应用
│   │   ├── grep_files/     # 文件搜索
│   │   ├── list_dir/       # 目录列表
│   │   └── read_file/      # 文件读取
│   │
│   ├── opencode/           # ── OpenCode 兼容工具 ──
│   │   ├── bash/           # Shell 命令
│   │   ├── edit/           # 编辑
│   │   ├── glob/           # 通配符
│   │   ├── grep/           # 搜索
│   │   ├── read/           # 读取
│   │   ├── write/          # 写入
│   │   ├── skill/          # 技能
│   │   └── todowrite/      # 待办写入
│   │
│   ├── editor_infra/       # 编辑器基础设施
│   └── cursor_rules_on_read.rs # Cursor 规则
│
├── computer/               # Computer Use 集成
│   ├── mod.rs
│   ├── types.rs            # AsyncFileSystem, TerminalBackend traits
│   ├── task_log.rs         # 任务日志
│   └── local/              # 本地实现
│       ├── file_system.rs  # 文件系统
│       ├── terminal.rs     # 终端
│       ├── cgroup.rs       # cgroup 隔离
│       ├── lifecycle.rs    # 生命周期
│       ├── shell_state.rs  # Shell 状态
│       └── static_shell.rs # 静态 Shell
│
├── notification/          # 工具通知系统
│   ├── mod.rs
│   ├── handle.rs           # ToolNotificationHandle
│   └── types.rs            # 通知类型
│
├── reminders/              # 提醒系统
│   ├── mod.rs
│   ├── lsp_diagnostics.rs # LSP 诊断提醒
│   ├── skill_discovery.rs # 技能发现提醒
│   └── task_completion.rs # 任务完成提醒
│
└── util/                   # 工具函数
    ├── spawn.rs            # 进程生成
    ├── fs.rs              # 文件系统
    ├── env.rs             # 环境变量
    ├── truncate.rs         # 截断
    ├── base64_images.rs   # Base64 图片
    ├── binary.rs          # 二进制处理
    ├── command_display.rs # 命令显示
    ├── git_detect.rs      # Git 检测
    ├── grok_home.rs       # grok 主目录
    ├── hash.rs            # 哈希
    ├── image_compress.rs  # 图片压缩
    ├── image_validate.rs  # 图片验证
    ├── mcp_truncate.rs    # MCP 截断
    ├── path_suggestions.rs # 路径建议
    ├── query_tools.rs     # 工具查询
    ├── remap.rs           # 重映射
    ├── serde_base64.rs    # serde Base64
    ├── shell_env_policy.rs # Shell 环境策略
    └── unicode_confusables.rs # Unicode 混淆检测
```

---

## 工具分类法（Taxonomy）

### `ToolKind` — 语义工具种类

跨 harness 的统一语义分类：

| ToolKind | 描述 | 只读 |
|----------|------|------|
| `Read` | 文件读取 | ✅ |
| `Edit` | 文件编辑 | ❌ |
| `Delete` | 文件删除 | ❌ |
| `Write` | 文件写入 | ❌ |
| `Move` | 文件移动 | ❌ |
| `ListDir` / `List` | 目录列表 | ✅ |
| `Search` | 搜索 | ✅ |
| `Lsp` | 代码智能 (LSP) | ✅ |
| `Execute` | 运行命令 | ❌ |
| `Plan` | 计划 | ❌ |
| `WebSearch` | Web 搜索 | ✅ |
| `WebFetch` | Web 抓取 | ✅ |
| `BackgroundTaskAction` | 后台任务 | ❌ |
| `WaitTasksAction` | 等待任务 | ❌ |
| `KillTaskAction` | 终止任务 | ❌ |
| `Skill` | 技能 | ❌ |
| `MemorySearch` | 记忆搜索 | ✅ |
| `MemoryGet` | 记忆读取 | ✅ |
| `Task` | 子代理 | ❌ |
| `EnterPlan` | 进入计划模式 | ✅ |
| `ExitPlan` | 退出计划模式 | ✅ |
| `AskUser` | 向用户提问 | ✅ |
| `ImageGen` | 图像生成 | ❌ |
| `VideoGen` | 视频生成 | ❌ |
| `ImageToVideo` | 图像转视频 | ❌ |
| `ReferenceToVideo` | 参考图转视频 | ❌ |
| `DeployApp` | 应用部署 | ❌ |
| `SearchTool` | 搜索工具 | ✅ |
| `UseTool` | 使用工具 | ✅ |
| `Monitor` | 监控 | ❌ |
| `GoalUpdate` | 更新目标 | ❌ |
| `Workflow` | 工作流 | ❌ |
| `Other` | 其他 | ❌ |

### `ToolNamespace` — 工具命名空间

| Namespace | Wire 值 | 来源 |
|-----------|---------|------|
| `GrokBuild` | `grok_build` | Grok Build 原生 |
| `GrokBuildConcise` | `grok_build_concise` | 精简版 |
| `GrokBuildHashline` | `grok_build_hashline` | Hashline 协议 |
| `Codex` | `codex` | OpenAI Codex 兼容 |
| `OpenCode` | `opencode` | OpenCode 兼容 |
| `MCP` | `mcp` | MCP 外部工具 |

### `CanonicalToolMeta` — 规范工具身份信封

附加到工具调用事件 `_meta` 的 `nofy/tool` 键下：

```json
{
  "nofy/tool": {
    "version": 1,
    "name": "read_file",
    "kind": "read",
    "namespace": "grok_build",
    "label": "Read",
    "read_only": true,
    "input": { "path": "..." }
  }
}
```

**设计原则：**
- `label` 是跨 harness 的分组/显示键
- `kind` 是更细的判别器（不保证跨 harness 一致）
- `name` 是 harness 特定的模型面向名称
- `input` 是规范投影（只保留跨 harness 字段）
- 未知 `kind` 降级为 `other`（`#[serde(other)]`）
- `namespace` 是闭枚举（新工具集需要更新消费者）

---

## ToolBridge — 工具桥接器

`ToolBridge` 是 Agent 与工具系统的桥梁：

```rust
pub struct ToolBridge {
    // 工具注册表（包含所有已注册工具）
    registry: ToolRegistry,
    // 会话上下文（cwd、环境变量等）
    session_context: SessionContext,
    // 工具通知句柄（通知 TUI 工具进度）
    notification_handle: ToolNotificationHandle,
}
```

**职责：**
- 管理 `ToolRegistry`（所有工具的注册表）
- 持有 `SessionContext`（会话级上下文：工作目录、环境变量等）
- 通过 `ToolNotificationHandle` 发送工具进度通知
- 提供 `tool_definitions()` 方法生成 LLM 请求中的工具定义
- `dispatch()` 方法执行工具调用

---

## 工具定义流

```
Agent::tool_bridge().tool_definitions()
    │
    ▼
ToolRegistry 遍历所有已注册工具
    │
    ▼
每个工具生成 ToolDefinition（包含 JSON Schema）
    │
    ▼
发送给 LLM API 作为 function definitions
    │
    ▼
LLM 返回工具调用 → ToolBridge::dispatch()
```

---

## 工具执行流

```
LLM 返回工具调用
    │
    ▼
ChatStateActor 接收 tool_call
    │
    ▼
ToolBridge::dispatch(tool_call)
    │
    ├── 1. pre_tool_use Hooks 分发
    │   ├── 匹配的 hooks 按配置顺序执行
    │   ├── 任何 hook 可以 deny（阻止执行）
    │   └── hook 失败 = fail-open（继续执行）
    │
    ├── 2. 工具执行
    │   ├── 查找工具实现
    │   ├── 验证参数 (JSON Schema)
    │   ├── 执行工具 (async)
    │   ├── 可能产生进度通知 (ToolNotificationHandle)
    │   └── 返回 ToolOutput
    │
    └── 3. post_tool_use Hooks 分发
        └── 非阻塞，仅用于通知/日志
    │
    ▼
ToolOutput → ChatStateActor::append_tool_result()
    │
    ▼
继续 LLM 调用
```

---

## 后端托管工具

某些工具由 LLM 后端执行（不需要本地实现）：

- `HostedTool::WebSearch` — 服务端 Web 搜索
- `HostedTool::XSearch` — X (Twitter) 搜索

这些工具在 API 请求中作为原生 Responses API 类型发送，由 agentic sampler 在服务端执行。通过 `backend_search_enabled` 开关控制。

---

## 权限模式

`PermissionMode` 定义工具执行权限：

- **默认模式** — 危险操作需要用户确认
- **自动批准模式** — 沙箱激活时自动批准 bash 命令（`should_auto_allow_bash`）
- **计划模式** — 只读工具可用，写入工具被禁用

---

## 工具版本管理

`versions.rs` 管理工具版本，支持向后兼容：
- 工具可以有多个版本（如 `legacy_0_4_10`）
- 通过版本号选择正确的工具实现
- 确保旧会话可以正确恢复

---

## 技能发现（Skills）

`skills/` 模块实现技能发现和执行：

- **发现** — 从 `.grok/skills/` 和 `~/.grok/skills/` 扫描 SKILL.md 文件
- **加载** — 解析技能定义
- **执行** — 将技能作为工具暴露给 LLM
- **追踪** — `SkillDiscoveryTracker` 追踪已发现的技能

技能也可以通过厂商兼容目录发现（`.claude/skills/`、`.cursor/skills/`）。
