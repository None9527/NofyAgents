# 三参考项目对比汇总：对 grok-build 脱敏的启示

> 输入：`ref-analysis/pi.md`（339 行）、`ref-analysis/hermes-agent.md`（325 行）、`ref-analysis/openclaw.md`（301 行）
> 目标：把 grok-build（Rust 专有 coding agent）脱敏为"通用 OpenAI-compatible BYOK agent"。
> 本文是三份独立分析的交叉对比与落地建议。

---

## 1. 三项目总览

| 维度 | pi | hermes-agent | openclaw |
|---|---|---|---|
| 定位 | 最小 coding agent harness | 自我改进通用 agent | 多渠道个人 AI 助理网关 |
| 语言 | TypeScript（Node ≥22，ESM） | Python ≥3.11（uv） | TypeScript（Node ≥22，pnpm monorepo） |
| 规模 | 10 包，小而精 | 单体 + 插件目录，~150 模块 | ~3.2 万文件，160 个捆绑扩展 |
| 与我们的距离 | **最近**（目标形态本身） | 中（provider 插件化范本） | 较远（网关/渠道非本次目标） |
| 专有认证 | 无 | 无（Nous Portal 只是可删插件） | 无（全 BYOK） |
| 默认遥测 | 仅可关的安装 ping | 仅本地聚合，无远端 sink | 零（OTel/Prometheus 是 opt-in 插件） |
| GitNexus 索引 | ✅ 13,476 节点 | ✅ 146,995 节点 | ❌（工具栈溢出，未索引） |

**共同结论（三选三）**：通用 agent 的"通用性"全部来自同一条抽象边界——**agent 循环只依赖一个可注入的流式补全函数，provider/端点/凭据全部从这条边界之外注入**。三者都无专有认证、默认无遥测、状态全部本地可审计。这验证了我们脱敏方案的方向，并给出了成熟实现参照。

---

## 2. Provider 抽象对比（核心）

### 2.1 三种分层，同一骨架

| 层 | pi | hermes-agent | openclaw |
|---|---|---|---|
| agent 循环的注入点 | `StreamFn = (model, context, options) => EventStream`（`agent/src/types.ts`） | `AIAgent` 持有 OpenAI client + transport | `runAgentLoop(..., streamFn, runtime)`（`packages/agent-core/src/agent-loop.ts`） |
| wire 协议适配层 | `ProviderStreams`（`ai/src/api/*.ts`，10 种 api） | `ProviderTransport`（按 api_mode，5 种） | `ApiProvider { api, stream, streamSimple }`（`MODEL_APIS` 10 种） |
| 厂商/端点层 | `Provider`（`createProvider()` 工厂，40+ 内置） | `ProviderProfile` 声明式 dataclass（34 个插件目录） | `ProviderPlugin { id, envVars, auth, catalog }`（~55 个扩展） |
| 用户声明自定义后端 | `models.json`（零代码） | config.yaml `providers:` 条目 / `custom` profile | `models.providers.<id>` 配置（零代码） |

**正交性是关键**：协议适配器（按 wire 格式分）与 provider（按厂商/端点分）解耦，一个 provider 可挂多个 api，一个 api 被所有同协议 provider 复用。

### 2.2 "窄腰"协议

- hermes 最明确：**内部消息/工具统一 OpenAI chat-completions 格式，只在出口经 transport 转换一次**（`agent/transports/`）。
- pi/openclaw 同理：`openai-completions` 适配器是覆盖面的主力，其余 api 是扩展位。
- **对我们的含义**：Rust 侧只需实现一条 `openai-completions` 路径即可覆盖绝大多数自建/第三方后端（vLLM、llama.cpp、Ollama、LiteLLM、OpenRouter……），Anthropic 等留作后续适配器。

### 2.3 兼容差异的处理：声明式 compat 旗标（pi/openclaw 一致）

两者都有 `OpenAICompletionsCompat`/`ModelCompatConfig`：~25 个能力位（`supportsDeveloperRole`、`supportsReasoningEffort`、`supportsUsageInStreaming`、`maxTokensField`、`thinkingFormat` 11 种方言、`requiresToolResultName`……），**按 baseUrl 自动探测 + 配置逐项覆盖**。工程纪律：**遇到不兼容后端优先加 compat 旗标，而不是 fork 适配器**。

### 2.4 采样参数逃逸舱（pi 独有、最值得抄）

`StreamOptions.samplingParams: Record<string, unknown>` **原样合并进请求体、最后覆盖具名字段**——不穷举 top_p/top_k/min_p/repetition_penalty 这类后端私有参数。对自建推理服务是刚需。

### 2.5 模型发现（三家一致）

`GET {baseUrl}/models` 带 key 在线发现 → 失败回落静态/配置目录 → **发现永远建议性，离线可启动**（hermes `fetch_models`、openclaw `catalog.run` + TTL 缓存 + 401/403 归类 `auth-rejected`、pi `refreshModels`）。

---

## 3. BYOK 凭据对比

| 维度 | pi | hermes-agent | openclaw |
|---|---|---|---|
| 解析优先级 | CLI flag > auth.json（0600，`$ENV` 插值、`!command` 取密） > env > models.json | 显式 flag > config > 通用 env（OPENAI_API_KEY）> 专属 env > 登录态 > Bedrock 链 > 报错（8 级） | `LIVE_<P>_KEY` > `<P>_API_KEYS`（列表轮换）> `<P>_API_KEY` > `<P>_API_KEY_N` |
| 凭据存储 | `CredentialStore` 接口（read/list/modify/delete，modify 串行 RMW） | `.env` + auth.json 池 + 外部 secret 源（1Password/Bitwarden/command） | `SecretInput = string \| SecretRef`（env/file/vault/1password） |
| 认证方式声明 | `ApiKeyAuth { login?, check?, resolve }` | auth 注册表**自动从 provider 插件的 env_vars 派生**（零两处维护） | `createProviderApiKeyAuthMethod({...})` 一个对象同时驱动 CLI flag/向导/UI |
| 轮换 | OAuth 刷新在锁内防 double-refresh | `credential_pool.py` 多 key 池 | 仅 429/限流时轮换下一把 |

**共同点**：全部配置驱动、无硬编码认证；密钥支持间接引用（env 插值/外部命令/SecretRef）；解析顺序文档化。

---

## 4. 其余共同模式（三家一致，可直接定标准）

1. **错误编码进流而非抛出**：失败产出 `stopReason: "error"|"aborted"` 的终值消息，agent 循环不需要 try/catch 分支，重试/降级统一在适配器内（pi/openclaw 明示契约）。
2. **会话状态本地可审计**：JSONL 树状转录（pi v3、openclaw）或 SQLite（hermes WAL+FTS5、openclaw 迁移中）；openclaw 还有 writer-run 声明防并发写坏。
3. **记忆 = 纯 Markdown**：`MEMORY.md`/`USER.md`（hermes/openclaw 一致），启动冻结快照注入，会中写入不破坏前缀缓存。
4. **权限哲学**：pi 明示"No Built-in Sandbox"（只有 project trust 门控资源加载）；openclaw 把 sandbox/工具策略/审批做成正交可配置层；hermes 靠终端后端（Docker/SSH）隔离。**核心工具层保持干净，隔离推给 OS/容器**。
5. **遥测 = 契约 + NOOP 默认**：pi-telemetry 只有回调式契约 + NOOP context + adapter 位；openclaw 全 opt-in 插件；hermes 只写本地计数。**默认零外呼**。
6. **状态目录可整体重定位**：`PI_CODING_AGENT_DIR` / `HERMES_HOME` / `OPENCLAW_STATE_DIR`——容器化与隔离测试的基础。
7. **测试替身**：pi 的 faux provider（脚本化回放 LLM 响应）支撑无 key e2e——脱敏后 CI 不应依赖任何真实端点。

---

## 5. 对 grok-build 脱敏的落地建议（综合）

### 5.1 sampling 层改造蓝图（Rust）

照 pi 的形状定义边界：

```rust
// agent 循环唯一依赖
trait StreamFn {
    fn stream(&self, model: &Model, ctx: &Context, opts: &StreamOptions) -> EventStream;
}

// Model 描述符承载端点差异（pi 五字段）
struct Model {
    id: String,
    api: ApiId,                    // 首期只有 "openai-completions"
    base_url: String,              // ← 参数化的核心，替代 28 处硬编码 api.x.ai
    compat: OpenAICompat,          // 声明式能力位（openclaw ModelCompatConfig 形状）
    sampling_params: Map<String, Value>,  // 逃逸舱，原样合并进请求体
    headers: Map<String, String>,
    // context_window / max_tokens / cost ...
}
```

- 现有 `xai-grok-sampler` 改造成第一个适配器（保留其重试/错误分类逻辑，去掉 x.ai 端点与文档链接）；
- 专有认证删除后，凭据解析采用三家共同的顺序：**请求参数 > 凭据文件（支持 `$ENV` 插值）> 环境变量 > 配置文件**；
- `GROK_OAUTH2_*`/`XAI_API_KEY` 等全部换新前缀，解析顺序写进文档（pi `docs/providers.md` 的做法）。

### 5.2 配置 schema（抄 openclaw，最完整）

```toml/json
models.providers.<id> = {
  baseUrl, apiKey (支持 ${ENV}), api = "openai-completions",
  headers, timeoutSeconds,
  models = [ { id, contextWindow, maxTokens, reasoning, compat } ]
}
models.mode = "replace"   # 完全摆脱内置目录
```

默认形态 = hermes 的 `custom` profile：空内置端点、用户配 base_url、`GET /models` 探测 + 回落。

### 5.3 删除项的对照验证

三家共同证明以下删除**不影响 agent 完整性**：专有 OAuth/device flow（hermes 的 Nous Portal 就是可删插件的实证）、订阅分级/billing（三家都没有）、Mixpanel 类遥测（三家默认零外呼）、自动更新（pi 用 `PI_OFFLINE`/`PI_SKIP_VERSION_CHECK` 开关，我们直接删）、归因头（openclaw 明确只允许发往用户显式选择的官方服务，建议完全移除）。

### 5.4 脱敏后的验收清单（从三家做法反推）

- [ ] 默认配置下启动零外呼（模型目录刷新类回连必须有显式开关且默认关）
- [ ] 状态目录可经单一 env 重定位（`<NAME>_STATE_DIR`）
- [ ] 所有落盘内容可 grep、无二进制隐藏状态（JSONL/Markdown/SQLite）
- [ ] CI 用 faux/mock provider 跑 e2e，不依赖真实端点
- [ ] `rg -i 'grok|xai|x\.ai'` 归零（含 Cargo.lock、文档、错误信息）

### 5.5 警示

- **hermes 的单文件膨胀**（cli.py 1.9 万行、state 1.1 万行）是反面教材：我们做剥离时以 **loop / transport / registry / state** 四个模块边界为纲，删改都沿边界切，不往已有大文件里堆。
- **openclaw 的 gateway/渠道/多端协议**（WS + schema-first codegen）本次不需要，仅在未来接入 IM 渠道或多客户端控制面时再参考。
- pi 的 harness v4（崩溃恢复状态机）尚是占位实现，不必跟进；其 Entry/Record 分离的会话模型已可用。

---

## 6. 参考报告与索引

| 产物 | 位置 |
|---|---|
| pi 深度分析 | `ref-analysis/pi.md` |
| hermes-agent 深度分析 | `ref-analysis/hermes-agent.md` |
| openclaw 深度分析 | `ref-analysis/openclaw.md` |
| GitNexus 索引 | `ref/pi/.gitnexus`（13,476 节点）、`ref/hermes-agent/.gitnexus`（146,995 节点）；openclaw 未索引（工具限制） |
| 脱敏总方案 | `SANITIZATION_PLAN.md` |
