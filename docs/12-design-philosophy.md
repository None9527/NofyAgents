# 设计理念与编码约定

## 概述

本文档总结 Grok Build 代码库中体现的核心设计理念、架构模式和编码约定。这些原则贯穿整个项目，是理解代码组织方式的钥匙。

---

## 一、分层与依赖管理

### 严格分层

项目分为 6 个明确的层级（详见 [01-architecture.md](01-architecture.md)），每一层只能依赖下层。这确保了：
- **无循环依赖** — 通过 IoC 缝合解决必要的双向引用
- **可替换性** — 下层实现可以替换（如 TerminalBackend trait）
- **可测试性** — 每层可以独立测试

### IoC 缝合模式

当需要避免循环依赖时，使用函数指针 IoC 缝合：

**示例：Minimal 模式集成**
```
xai-grok-pager（不能依赖 minimal）
  ↓ fn-pointer seam
xai-grok-pager-minimal（依赖 pager）
```

- `minimal_hook.rs` — pager → minimal 调度（fn-pointer IoC 缝合）
- `minimal_api.rs` — minimal → pager 读取表面（facade 模式）

**示例：Auth 依赖反转**
```
xai-grok-auth（定义 trait）
  ↑ implements
xai-grok-shell（实现 AuthCredentialProvider）
  ↓ consumes
xai-file-utils（消费 trait，不依赖 shell）
```

---

## 二、Actor 模式

关键状态管理采用 Actor 模式，通过专用 tokio task + 命令通道：

### 设计原则

- **无锁状态** — Actor 在独占 task 中运行，状态变更不需要锁
- **命令通道** — 通过 `mpsc` 命令通道 + `oneshot` 回复通信
- **事件广播** — 通过 `event_tx` 广播状态变更事件

### Actor 实例

| Actor | Crate | 管理的状态 |
|-------|-------|-----------|
| `ChatStateActor` | `xai-chat-state` | 对话历史、采样配置、token 计数 |
| `HunkTrackerActor` | `xai-hunk-tracker` | 文件变更 hunks |
| `SchedulerActor` | `xai-grok-tools/scheduler` | 定时任务调度 |

### 通信模式

```rust
// 命令（请求-回复）
let (reply_tx, reply_rx) = oneshot::channel();
actor_tx.send(Command::GetConversation { reply: reply_tx }).await?;
let result = reply_rx.await?;

// 事件（广播）
event_tx.send(ChatStateEvent::TextDelta(chunk)).await?;
```

---

## 三、不可变外壳 + 内部可变性

### Agent 不可变性

`Agent` 结构体在构造后不可变，但持有 `Arc<ToolBridge>`：

```rust
pub struct Agent {
    definition: AgentDefinition,           // 不可变
    prompt_context: PromptContext,         // 不可变
    system_prompt: String,                 // 不可变（缓存）
    tool_bridge: Arc<ToolBridge>,         // 外壳不可变，内部可变
    // ...
}
```

**ToolBridge 内部使用锁：**
- 工具注册表变更（MCP 注册）
- 完成追踪
- 重试配置

**设计理由：**
- Agent 的系统提示词和定义在整个会话期间不变
- 工具状态需要动态变更（MCP 服务器上线/下线）
- Arc 共享避免克隆开销

---

## 四、Action → State → Effect 模式

TUI 层采用经典的单向数据流：

```
Action (用户输入/ACP消息/任务完成)
    ↓
dispatch::handle_action() → (状态变更, Vec<Effect>)  [同步、纯函数]
    ↓
effects::spawn() → tokio task  [异步、有 IO]
    ↓
TaskResult → dispatch::handle_task_result() → 状态更新
```

### 设计理由

- **Dispatch 是纯同步函数** — 完全可测试，无 IO 副作用
- **Effects 是异步任务** — 处理网络/文件/进程 IO
- **状态变更永远通过 dispatch** — 不允许直接修改状态

---

## 五、多 Harness 兼容设计

### 工具分类法

项目支持多个 AI 编程框架的工具集，通过统一的 `ToolKind` 和 `CanonicalToolMeta` 实现互操作：

**设计原则：**
- `label` 是跨 harness 的分组/显示键——等价工具共享标签
- `kind` 是更细的判别器——不保证跨 harness 一致
- `name` 是 harness 特定的模型面向名称
- `input` 是规范投影——只保留跨 harness 字段

### 未知值降级

- 未知 `kind` → 降级为 `other`（`#[serde(other)]`）
- `namespace` 是闭枚举——新工具集需要更新消费者（故意为之）
- `version` 只在移除或含义变更时递增

---

## 六、Fail-Open vs Fail-Closed

项目在不同子系统中采用不同的失败策略：

| 子系统 | 策略 | 理由 |
|--------|------|------|
| Hooks | **Fail-Open** | 钩子失败不应阻断正常工作流 |
| 沙箱 bwrap plan | **Fail-Closed** | 安全关键，不能静默降级 |
| 沙箱 profile 解析 | **Fail-Closed**（有 deny 的 profile） | 安全关键 |
| 沙箱 Hook 写保护 | **Fail-Closed** | 防止恶意写入 |
| MCP 工具调用 | **Fail-Open** | 外部工具失败不影响核心 |
| 配置 requirements | 可选 Fail-Closed | 管理员可选择 |

### Hooks Fail-Open 理由

> Grok 在受保护环境中运行，诱导故障绕过安全钩子不属于威胁模型。之前的 fail-closed 策略在钩子超时或配置错误时过度阻断了正常工具调用。

---

## 七、安全设计

### 沙箱分层防御

```
1. Landlock/Seatbelt (内核级) ← nono 库
2. bwrap (用户空间容器) ← re-exec
3. seccomp (子进程网络过滤)
4. Hook 写保护 (bwrap 绑定覆盖)
```

### 关键安全决策

- **沙箱应用不可逆** — 一旦应用，无法撤销
- **网络保持开放** — 进程需要 LLM API，但子进程网络被 seccomp 阻止
- **bwrap --cap-drop ALL** — 丢弃所有 Linux capabilities
- **Hook 写保护** — 防止恶意代码修改 Hook 目录
- **身份重验证** — bwrap 绑定前验证路径身份（防止符号链接替换）
- **零权限占位符** — `chmod 000` 的占位文件用于覆盖不可读路径

### Unicode 安全

`unicode_confusables.rs` — 检测 Unicode 混淆字符，防止视觉欺骗攻击（如用西里尔字母 `а` 替换拉丁字母 `a`）。

### SSRF 防护

`web_fetch/ssrf.rs` — Web 抓取时的 SSRF 防护：
- 阻止访问内部 IP 地址
- 阻止访问 localhost/私有网络
- DNS 重绑定防护

---

## 八、流式渲染优化

### 检查点冻结

Markdown 渲染使用检查点冻结策略：
- 稳定边界之前的内容被"冻结"，不再重绘
- 只有检查点之后的"尾部"需要重新渲染
- 大幅减少流式输出时的重绘开销

### 离线程渲染

重计算任务在独立线程中执行：
- Mermaid 图表渲染 — `mermaid_worker.rs`
- 编辑 diff 语法高亮 — `edit_highlight_worker.rs`
- 避免阻塞 TUI 主循环

---

## 九、配置合并策略

### 多层优先级

```
1. /etc/grok/managed_config.toml      (最低)
2. $GROK_HOME/managed_config.toml
3. $GROK_HOME/config.toml
4. $GROK_HOME/requirements.toml       (签名保护)
5. /etc/grok/requirements.toml
6. macOS MDM                           (最高)
```

### 设计原则

- 深度合并（递归，非简单覆盖）
- 环境变量展开
- Ed25519 签名保护 requirements 层
- 版本覆盖（每层独立应用）
- 可选 fail-closed 启动

---

## 十、确定性回放

### Workflow Journal

Workflow 引擎的 Journal 系统确保确定性回放：

- 所有主机调用的结果被记录
- 相同输入 → 相同输出（使用记录的结果）
- 支持暂停/恢复——恢复时回放已记录的调用
- 序列号追踪确保顺序一致

### 测试环境隔离

```rust
#[cfg(test)]
pub(crate) static ENV_TEST_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

#[cfg(test)]
pub(crate) struct LockedTestEnv {
    _env: Vec<TestEnvGuard>,
    _lock: std::sync::MutexGuard<'static, ()>,
}
```

- 全局环境测试锁——序列化所有修改环境变量的测试
- RAII 环境变量保护——自动恢复
- 声明顺序保证恢复顺序（`_env` 先于 `_lock` drop）

---

## 十一、构建与性能

### Allocator

- **jemalloc** — 默认 allocator（Unix），支持 profiling
- `malloc_conf` — 通过 `extern const char *malloc_conf` 配置
- 内存悬崖清理——`purge_jemalloc_retained_pages` hook

### 构建配置

| Profile | 用途 | 特点 |
|---------|------|------|
| `dev` | 开发 | opt-level=0, 128 codegen-units, incremental |
| `release` | 默认 | incremental, panic=abort |
| `release-dist` | 分发 | thin LTO, codegen-units=1, debug=1 |
| `x-prod` | 生产服务 | thin LTO, panic=unwind |

### 崩溃处理

- `panic = "abort"` (release) — 崩溃时立即终止，避免 unwind 开销
- `panic = "unwind"` (x-prod) — 生产服务需要 unwind 以保持可用性
- `xai-crash-handler` — 崩溃时捕获堆栈、写入日志、发送到 Sentry

---

## 十二、命名约定

### Crate 命名

- `xai-grok-*` — Grok Build 专属 crate
- `xai-*` (无 grok) — 跨产品共享 crate
- `third_party/*` — 第三方库（fork 或移植）

### 模块组织

- `lib.rs` — crate 入口，包含模块声明和公共 API
- `mod.rs` — 模块入口
- `tests.rs` 或 `tests/` — 测试
- `*_tests.rs` — 特定模块的测试

### 文件命名

- snake_case 文件名
- 测试后缀：`_tests.rs`
- 版本特定：`versions/legacy_0_4_10.rs`

### 类型命名

- Actor: `XxxActor` (如 `ChatStateActor`)
- Handle: `XxxHandle` (如 `ChatStateHandle`, `HunkTrackerHandle`)
- Builder: `XxxBuilder` (如 `AgentBuilder`)
- Config: `XxxConfig` (如 `WorkspaceConfig`)
- Error: `XxxError` (如 `WorkspaceError`, `AgentBuildError`)

---

## 十三、测试策略

### 测试层级

1. **单元测试** — `#[cfg(test)] mod tests` 或 `*_tests.rs` 文件
2. **集成测试** — `tests/` 目录
3. **快照测试** — `insta` crate
4. **Mock 测试** — MockChatPersistence, MockFileSystem 等
5. **序列化测试** — `serial_test` crate（环境变量修改需要序列化）
6. **模糊测试** — `fuzz/` 目录（Markdown 解析器）

### 测试辅助

- `xai-grok-test-support` — 跨 crate 测试辅助
- `xai-test-utils` — 通用测试工具
- `TestEnvGuard` / `LockedTestEnv` — 环境变量测试保护
- `#[serial]` — 序列化测试标记

---

## 十四、Clippy 配置

```toml
[workspace.lints.clippy]
doc_lazy_continuation = "allow"          # prost 0.14 生成代码
doc_overindented_list_items = "allow"    # prost 0.14 生成代码
needless_lifetimes = "allow"
single_range_in_vec_init = "allow"
too_many_arguments = "allow"
uninlined_format_args = "allow"         # 合并安全：防止旧分支 CI 失败
useless_format = "allow"                 # fastrace 宏展开问题
```

**`uninlined_format_args` 的特殊处理：** 允许而非拒绝，因为：
- 旧分支（添加此 lint 前）合并到 main 时会违反规则
- 没有 merge queue 在 PR 分支运行 main 的 CI 检查
- 允许防止 main 的 CI 因合并代码而失败
- TODO: 启用 merge queue 后改为 "deny"

---

## 十五、文档惯例

### 模块文档

每个 crate 的 `lib.rs` 以 `//!` 模块文档开头，包含：
- 模块概述
- 核心概念解释
- 使用示例
- 设计决策说明

### 内联文档

关键类型和函数有详细的文档注释，包含：
- 用途说明
- 参数和返回值
- 设计理由
- 不变量和前提条件
- 示例代码

### ASCII 图

复杂架构使用 ASCII 图说明（如 ChatStateActor 的 Actor 模式图）。

---

## 总结

Grok Build 的设计理念可以概括为：

1. **分层清晰** — 6 层严格分层，IoC 缝合解决循环依赖
2. **Actor 模式** — 关键状态独占 task，无锁管理
3. **单向数据流** — Action → State → Effect，可测试的 dispatch
4. **多 Harness 兼容** — 统一分类法，开放集合，优雅降级
5. **安全优先** — 多层沙箱防御，fail-closed 安全关键路径
6. **流式优化** — 检查点冻结，离线程重计算
7. **确定性回放** — Journal 系统，支持暂停/恢复
8. **可测试性** — 纯函数 dispatch，mock 后端，序列化测试
