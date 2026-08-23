# 配置、认证与遥测

## 概述

Grok Build 的配置系统采用多层合并策略，支持系统级、用户级和托管级配置。认证通过 OAuth 浏览器流程或 API Key 实现。遥测系统集成了 OpenTelemetry、Mixpanel 和 Sentry。

---

## 一、配置系统（`xai-grok-config` + `xai-grok-config-types`）

### 配置合并优先级

从低到高优先级（高优先级覆盖低优先级）：

```
1. /etc/grok/managed_config.toml      (系统级托管)
2. $GROK_HOME/managed_config.toml     (用户级托管)
3. $GROK_HOME/config.toml             (用户配置)
4. $GROK_HOME/requirements.toml       (云缓存，Ed25519 签名)
5. /etc/grok/requirements.toml        (系统级要求)
6. macOS MDM 托管偏好 (ai.x.grok)     (macOS only)
```

每一层在合并前应用自己的 `[[version_overrides]]`。Requirements 层（#4-#6）可以选择 fail-closed 启动。

### 核心模块

```
src/
├── lib.rs                # 入口
├── loader.rs             # 配置加载器（多层合并）
├── paths.rs              # 路径管理
├── shell.rs              # Shell 配置
├── managed_cache.rs       # 托管配置缓存
├── managed_text/          # 托管文本
│   ├── mod.rs
│   ├── source.rs          # 来源
│   ├── transaction.rs     # 事务
│   ├── validator.rs       # 验证器
│   └── format.rs          # 格式
├── signed_policy.rs       # 签名策略（Ed25519）
├── campaigns.rs           # 活动管理
├── config_override.rs     # 配置覆盖
├── version_overrides.rs   # 版本覆盖
├── validation.rs          # 验证
├── fs_atomic.rs           # 原子文件操作
├── global_hook_sources.rs # 全局 Hook 来源
└── macos_managed.rs       # macOS MDM 集成
```

### 关键功能

**深度合并：** `deep_merge_toml()` — TOML 值的递归合并，不是简单覆盖。

**环境变量展开：** `expand_env_vars_in_toml()` — 配置中的 `${VAR}` 引用展开为环境变量值。

**签名策略：** `signed_policy.rs` — Requirements 层使用 Ed25519 签名保护，防止篡改。签名密钥嵌入二进制。

**托管缓存：** `managed_cache.rs` — 托管配置的本地缓存，包括：
- `ServingIdentity` — 服务身份
- `SyncMarker` — 同步标记
- `bump_rollback_floor()` — 回滚地板
- `confirmed_team_switch()` — 确认团队切换
- `fail_closed_policy_armed_at()` — fail-closed 策略武装时间
- `managed_deployment_id()` — 托管部署 ID
- `is_managed_config_stale_for()` — 配置是否过期

**活动管理：** `campaigns.rs` — A/B 测试和功能开关管理。

**原子文件操作：** `fs_atomic.rs` — 确保配置文件的原子读写。

**全局 Hook 来源：** `global_hook_sources.rs` — 管理 Hook 目录的发现和验证：
- `ensure_grok_hook_slots()` — 确保 Hook 插槽存在
- `resolve_global_hook_sources()` — 解析全局 Hook 来源
- `existing_ancestor_chain()` — 现有祖先链
- `path_has_symlink_component()` — 路径是否有符号链接组件（安全检查）

### 路径管理（`paths.rs`）

| 函数 | 返回 |
|------|------|
| `grok_home()` | `$GROK_HOME` 或 `~/.grok` |
| `default_grok_home()` | 默认 grok 主目录 |
| `user_grok_home()` | 用户 grok 主目录 |
| `system_config_dir()` | 系统配置目录 (`/etc/grok`) |
| `sessions_cwd_dir()` | 会话 CWD 目录 |
| `ensure_sessions_cwd_dir()` | 确保会话目录存在 |
| `encode_cwd_dirname()` / `decode_cwd_from_dirname()` | CWD 目录名编解码 |
| `grok_application()` / `grok_application_in()` | grok 应用路径 |

### 配置类型（`xai-grok-config-types`）

定义配置的类型结构，供 `xai-grok-config` 和消费者使用。

---

## 二、认证（`xai-grok-auth`）

### 概述

认证依赖反转缝——`xai-grok-auth` 定义 trait，`xai-grok-shell` 实现，`xai-file-utils` 消费。

### 核心类型

```rust
pub trait AuthCredentialProvider {
    fn get_credentials(&self) -> CredentialSnapshot;
}

pub struct CredentialSnapshot {
    // Bearer token 或 API key
}

pub struct StaticAuthCredentialProvider { ... }
```

### 认证流程

```
进程启动
    │
    ▼
检查现有凭据 (auth.json / API key)
    │
    ├── 有效凭据 → 直接使用
    └── 无凭据/过期 → 外部认证提供方流程
        │
        ├── 执行 auth_provider_command 获取 token
        ├── 或读取 NOFY_API_KEY 等环境变量
        └── 保存凭据到 auth.json
    │
    ▼
ensure_authenticated() — 确保认证有效
    │
    ▼
构建 HTTP 请求（附加 Bearer token）
```

### 模块

```
src/
├── lib.rs               # 入口
├── auth_provider.rs      # AuthCredentialProvider trait
├── bearer_fragment.rs    # Bearer token 片段处理
├── retry_middleware.rs   # 认证重试中间件
└── visibility.rs         # HTTP 认证可见性
```

### 重试中间件

`AuthRetryMiddleware` — HTTP 请求的认证重试中间件，在 401 响应时自动刷新 token 并重试。

`execute_with_stamp()` — 带时间戳的 Bearer 后缀执行，防止 token 重放。

### 部署密钥

除了 OAuth，还支持部署密钥认证：
```
export GROK_DEPLOYMENT_KEY=<your-key>
grok setup
```

---

## 三、遥测（`xai-grok-telemetry`）

### 概述

遥测引擎集成多种观测系统：产品事件、Mixpanel 发射、Sentry 错误报告、OpenTelemetry 追踪、结构化统一日志。

### 核心模块

```
src/
├── lib.rs               # 入口
├── client.rs            # TelemetryClient
├── config.rs            # 遥测配置
├── context.rs           # TelemetryCtx（会话上下文）
├── events.rs            # TelemetryEvent
├── enums.rs             # 枚举类型
├── external.rs          # 外部 OTel 配置
├── instrumentation.rs   # 仪表化层
├── otel_layer.rs        # OTel tracing layer
├── otlp_http.rs         # OTLP HTTP 传输
├── session_ctx.rs       # 会话上下文
├── session_metrics.rs   # 会话指标
├── startup.rs           # 启动遥测
├── unified_log.rs       # 统一日志
├── debug_log.rs         # 调试日志
├── sampling_log.rs      # 采样日志
├── hooks_log.rs         # Hooks 日志
├── memory_log.rs        # 内存日志
├── memory_telemetry.rs  # 内存遥测
├── prompt_timing.rs     # 提示词计时
├── sentry.rs            # Sentry 错误报告
├── http.rs              # HTTP 事件发送
├── id.rs                # ID 生成
├── appender.rs          # 日志追加器
└── redact_common.rs     # 敏感信息脱敏
```

### TelemetryClient

```rust
pub struct TelemetryClient {
    // ...
}

pub struct UserContext {
    // 用户信息
}

pub struct Metadata {
    // 元数据
}
```

### 会话上下文

`TelemetryCtx` — 会话级遥测上下文，跟踪：
- 会话 ID
- 用户 ID
- 客户端版本
- 应用入口点
- 事件来源（`EmitterOrigin`）

**API：**
- `emit_event()` — 发射事件
- `emit_event_with_origin()` — 带来源发射事件
- `log_event()` — 记录事件
- `log_session_event()` — 记录会话事件
- `with_session_ctx()` — 在上下文中执行

### Tracing Layers

```
tracing::Subscriber 构建：
├── fmt layer (EnvFilter + stderr 输出)
├── sampling_log layer (采样日志)
├── instrumentation layer (OTel 仪表化)
├── hooks_log layer (Hooks 日志)
└── external OTel layer (外部 OTel 配置)
```

**OTel 集成：** `otel_layer.rs` 构建 OpenTelemetry layer：
- `OtelClientInfo` — 客户端信息（名称、版本、服务版本、入口点）
- 使用 `fastrace` + `fastrace-opentelemetry` 进行高效追踪
- `otlp_http.rs` — OTLP HTTP 传输

### Sentry 错误报告

`sentry.rs` — 集成 Sentry SDK，自动报告未处理的 panic 和错误。

### 敏感信息脱敏

`redact_common.rs` — 在遥测数据中脱敏常见敏感信息（API key、token、密码等）。

### Mixpanel 分析（`xai-mixpanel`）

独立的 Mixpanel 分析集成 crate，发送产品事件到 Mixpanel。

### 调试日志

`debug_log.rs` — 调试日志系统：
- `install_firehose()` — 安装 firehose 日志
- `RMCP_SSE_NOISE_TARGET` — MCP SSE 噪音过滤目标

---

## 四、环境变量（`xai-grok-env`）

管理 Grok Build 的环境变量：
- `GrokBuildEnvironment` — 环境枚举（Production/Staging/Dev）
- 解析环境特定配置（API 端点等）

---

## 五、自更新（`xai-grok-update`）

```
进程启动
    │
    ▼
enforce_version_policy_or_exit()
    │
    ├── 检查版本策略（managed requirements 可能要求特定版本）
    └── 版本不匹配 → 退出并提示更新
    │
    ▼
auto_update() (如果启用)
    │
    ├── 检查最新版本
    ├── 下载新版本
    └── 提示用户重启
```

---

## 六、崩溃处理（`xai-crash-handler`）

集成崩溃处理器，在 panic 时：
- 捕获崩溃堆栈
- 写入崩溃日志
- 发送到 Sentry（如果启用）
- 显示友好的错误信息
