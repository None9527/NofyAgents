# Pi Agent Harness（earendil-works）深度分析报告

> 分析对象：`/home/none/grok-build/ref/pi`（Pi monorepo，版本 0.84.x）
> 目的：为 grok-build（Rust 专有 coding agent）脱敏改造成"通用 API agent"提供参考。
> 所有结论均基于实际源码阅读，关键处标注文件路径。

---

## 1. 项目定位与技术栈

**定位**：Pi 是一个"最小化、可自我扩展的终端 coding agent harness"。核心哲学（`packages/coding-agent/README.md`）：不内置 sub-agent / plan mode / 权限系统，一切通过 TypeScript 扩展（Extensions / Skills / Prompt Templates / Themes）定制；LLM 层完全 provider 无关（BYOK、任意 OpenAI-compatible 后端）。

**技术栈**：
- TypeScript monorepo（npm workspaces，根 `package.json`），Node ≥ 22.19，纯 ESM；用 `tsgo`（TypeScript native preview）构建，Biome 做 lint/format，vitest + node:test 测试。
- 约束：只用"erasable TypeScript"（无 enum/namespace/参数属性），直接依赖全部 pin 精确版本，有 shrinkwrap 与供应链加固（根 README "Supply-chain hardening"）。
- 构建顺序即依赖顺序（根 `package.json` 的 `build` 脚本）：`tui → telemetry → ai → agent → session-backends/sqlite-node → protocol → client → server → coding-agent`。

**包结构**（`packages/`）：

| 包 | npm 名 | 职责 |
|---|---|---|
| `ai` | `@earendil-works/pi-ai` | 统一多 provider LLM API（本报告重点 §3） |
| `agent` | `@earendil-works/pi-agent-core` | Agent 循环、工具协议、会话状态（§4） |
| `coding-agent` | `@earendil-works/pi-coding-agent` | 交互式 CLI（interactive/print/json/rpc 四模式 + SDK）（§5） |
| `tui` | `@earendil-works/pi-tui` | 终端 UI 库，差分渲染（§6） |
| `telemetry` | `@earendil-works/pi-telemetry` | vendor-neutral 遥测契约（§7） |
| `protocol` | `@earendil-works/pi-protocol` | CBOR + 长度前缀帧的 wire 协议（§8） |
| `server` | `@earendil-works/pi-server` | 会话服务器核心（实验性） |
| `client` | `@earendil-works/pi-client` | 传输无关的远端会话客户端 |
| `session-backends/sqlite-node` | `@earendil-works/pi-session-backend-sqlite-node` | node:sqlite 会话存储后端 |
| `evals` | `@earendil-works/pi-evals` | 基于 vitest-evals 的行为评测 |

入口：CLI 为 `packages/coding-agent/src/cli.ts`（薄壳）→ `src/main.ts`（972 行，参数解析、auth 检查、trust、组装 `AgentSession`）→ `src/modes/`（InteractiveMode / runPrintMode / runRpcMode）。SDK 入口 `src/core/sdk.ts`（`createAgentSession`）。

---

## 2. packages/ 各包职责速览

- **ai**：`src/types.ts`（统一类型，830 行）、`src/models.ts`（Provider/Models 注册与调度，944 行）、`src/api/`（10 个协议适配器）、`src/providers/`（40+ provider 工厂 + 生成模型目录）、`src/auth/`（凭据抽象）、`models.generated.ts`（由 `scripts/generate-models.ts` 从 models.dev + 各 provider catalog 生成，禁止手改）。
- **agent**：`src/agent.ts`（有状态 Agent）、`src/agent-loop.ts`（低层循环）、`src/types.ts`（AgentTool/AgentEvent/AgentLoopConfig）、`src/proxy.ts`（把 LLM 调用代理到服务端的 StreamFn）、`src/stream-fn.ts`（可插拔默认 stream 函数）、`src/harness/`（coding harness：session 树、reducer、compaction、bash/read/edit/write 工具、telemetry schema）。
- **coding-agent**：`src/core/`（agent-session、model-runtime、provider-composer、settings、extensions 加载器、session-manager）、`src/cli/`（login/model 选择器等子命令 UI）、`src/modes/`、`src/extensions/`（内置扩展）、`docs/`（providers/models/settings/custom-provider 等 30+ 文档）。
- **tui**：`src/tui.ts`（TUI 接口 + TuiBase）、`src/tui-main-screen.ts`（主屏差分渲染）、`src/tui-alt-screen.ts`（备用屏 viewport）、`src/editor-component.ts`、`src/components/`（Text/Markdown/SelectList/Image 等）。
- **telemetry**：仅 4 个源文件（`index.ts` 契约 + 类型化 schema 工具、`noop.ts`、`memory.ts` 参考实现、`testing/` 一致性测试）。
- **protocol/server/client/session-backends**：见 §8。
- **evals**：`src/pi-harness.ts` 把真实 `AgentSession` 适配到 vitest-evals，在隔离临时目录跑模型驱动的行为断言。

---

## 3. pi-ai 多 provider 抽象（最重点）

### 3.1 分层架构

```
Models (注册表 + auth 解析 + 调度)            src/models.ts
  └─ Provider (id/auth/models/stream)         createProvider()
       └─ ProviderStreams (协议适配器)         src/api/*.ts
            └─ HTTP/SSE/WebSocket 传输         openai SDK / 原生 fetch
```

四层解耦：**协议适配器**（api，按 wire 协议分）与 **provider**（按厂商分）正交。一个 provider 可挂多个 api（如 xAI 同时用 completions + responses，`src/providers/xai.ts`）；一个 api 被所有同协议 provider 复用。

### 3.2 统一接口定义（关键类型签名）

**模型与上下文**（`packages/ai/src/types.ts`）：

```ts
export interface Model<TApi extends Api> {
  id: string; name: string;
  api: TApi;                    // "openai-completions" | "anthropic-messages" | ... | 任意字符串
  provider: ProviderId;
  baseUrl: string;              // ← base URL 是模型级字段，天然支持任意端点
  reasoning: boolean;
  thinkingLevelMap?: ThinkingLevelMap;
  input: ("text" | "image")[];
  cost: ModelCost;
  contextWindow: number; maxTokens: number;
  samplingParams?: Record<string, unknown>;   // 模型级默认采样参数
  headers?: Record<string, string>;
  compat?: OpenAICompletionsCompat | OpenAIResponsesCompat | AnthropicMessagesCompat | BedrockCompat;
}

export interface Context { systemPrompt?: string; messages: Message[]; tools?: Tool[]; }
export type Message = UserMessage | AssistantMessage | ToolResultMessage;
```

**采样选项**（`StreamOptions`，types.ts L175-219）——这是"参数化 sampling 层"的核心：

```ts
export interface StreamOptions extends ProviderRequestOptions<Model<Api>> {
  temperature?: number;
  samplingParams?: Record<string, unknown>;  // 原样合并进请求体，覆盖具名字段；
                                             // 专为 llama.cpp/vLLM/SGLang 等 OpenAI-compatible
                                             // 服务器传 pi 未建模的参数（top_p/top_k/min_p/...）
  maxTokens?: number;
  transport?: Transport;                     // "sse" | "websocket" | ...
  cacheRetention?: CacheRetention;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  // 继承自 ProviderRequestOptions: signal, apiKey, fetch(可注入!), env, headers,
  //   onPayload(发送前改写 payload), onResponse, timeoutMs, maxRetries, maxRetryDelayMs
}
```

**流契约**（types.ts L268-330）：

```ts
export interface ProviderStreams {
  stream(model, context, options?): AssistantMessageEventStream;
  streamSimple(model, context, options?: SimpleStreamOptions): AssistantMessageEventStream;
  fetchDeferred?(...); cancelDeferred?(...);   // 可选的异步延迟响应能力
}
export type StreamFunction<TApi, TOptions> = (model, context, options?) => AssistantMessageEventStream;
```

**事件协议**（types.ts L520-539）：`AssistantMessageEvent` 联合类型：`start → {text,thinking,toolcall}_{start,delta,end}* → done{message} | error{error}`。关键契约（`StreamFn` 注释，agent/src/types.ts L19-34）：**失败不得 throw，必须编码为 `stopReason: "error"|"aborted"` 的最终 AssistantMessage 经流发出**。

### 3.3 Streaming 处理

- 载体：`AssistantMessageEventStream extends EventStream<AssistantMessageEvent, AssistantMessage>`（`src/utils/event-stream.ts`，88 行）——手写 async-iterable 队列 + `result(): Promise<AssistantMessage>` 终值。
- 异步启动包装：`lazyStream(model, setup)`（`src/api/lazy.ts`）同步返回流、后台跑 auth 解析/模块懒加载，失败转成 error 事件。`lazyApi(load)` 把动态 import 的 API 模块包成 `ProviderStreams`——所有 api 模块都是懒加载，保证 tree-shaking 与启动速度。
- 各适配器内部：如 `src/api/openai-completions.ts`（1577 行）用官方 `openai` SDK 的 `chat.completions.create({stream:true})`，逐 chunk 维护 text/thinking/toolCall 块状态机，发 delta 事件；`retryProviderRequest()`（`src/utils/provider-retry.ts`）做受控重试；`parseStreamingJson` 处理增量 JSON 工具参数。
- `SimpleStreamOptions` 在 `StreamOptions` 上加 `reasoning?: ThinkingLevel` 与 `thinkingBudgets`；`buildBaseOptions()`（`src/api/simple-options.ts`）负责 maxTokens 按上下文窗口钳制、`model.samplingParams` 与请求级 `samplingParams` 按 key 合并。

### 3.4 支持的 provider / API

- **API（wire 协议）**：`openai-completions`、`openai-responses`、`azure-openai-responses`、`openai-codex-responses`、`anthropic-messages`、`google-generative-ai`、`google-vertex`、`bedrock-converse-stream`、`mistral-conversations`、`pi-messages`（自家网关协议）；`Api = KnownApi | (string & {})` 开放扩展。
- **Provider**：40+ 内置（`src/providers/all.ts`：openai/anthropic/google/xai/deepseek/groq/cerebras/openrouter/bedrock/vertex/mistral/minimax/moonshot/zai/huggingface/fireworks/together/baseten/cloudflare×2/vercel-ai-gateway/…），外加纯动态 provider（radius、llama.cpp）。
- 模型目录：`models.generated.ts` 由脚本从 `https://models.dev/api.json` + provider 私有 catalog 生成（`scripts/generate-models.ts`）；运行时动态 provider 可通过 `refreshModels()` 拉取并缓存到 `models-store.json`。
- 测试用假 provider：`src/providers/faux.ts`（708 行，脚本化回放 text/thinking/toolCall），是整个测试体系的 LLM 替身——**对我们脱敏后的离线 e2e 极有参考价值**。

### 3.5 API key / base URL 配置与切换机制

**Auth 抽象**（`src/auth/types.ts`）：

```ts
export interface ApiKeyAuth {
  name: string;
  login?(interaction): Promise<ApiKeyCredential>;        // 交互式录入
  check?(input): Promise<AuthCheck | undefined>;         // 无副作用可用性检查
  resolve(input: { ctx; credential?; signal }): Promise<AuthResult | undefined>;  // 解析请求凭据
}
export interface ModelAuth { apiKey?: string; headers?: ProviderHeaders; baseUrl?: string; }
export interface CredentialStore {   // 应用侧存储，一 provider 一凭据
  read(providerId); list(); modify(providerId, fn); delete(providerId);  // modify 是唯一写路径（串行 RMW）
}
```

标准实现 `envApiKeyAuth(name, envVars)`（`src/auth/helpers.ts`）：存储凭据优先，否则按序查 env。解析顺序（`src/auth/resolve.ts` `resolveProviderAuth`）：**请求级 overrides.apiKey > 已存凭据（auth.json）> ambient（env/AWS profile/ADC 文件）**；OAuth 刷新在 CredentialStore.modify 锁内完成防止 double-refresh。

**请求时注入**（`src/models.ts` `ModelsImpl.applyAuth`，L636-668）：`Models.stream()` 先解析 auth，再把 `apiKey/headers/baseUrl/env` 合并进请求（显式 options 逐字段优先，auth 提供的 baseUrl 可整体替换 `model.baseUrl`——GitHub Copilot 按凭据换端点就靠这个），最后委托给拥有该 model 的 provider。

**用户侧配置**（coding-agent 层，§9）：`~/.pi/agent/auth.json`（0600，支持 `$ENV` 插值、`!command` 取密钥）+ env 变量 + `models.json` 里的 `baseUrl`/`apiKey`/`headers`/`authHeader`。凭据解析顺序文档化（`docs/providers.md` "Resolution Order"）：CLI `--api-key` > auth.json > env > models.json。

### 3.6 OpenAI-compatible 兼容层（compat）——最值得抄的设计

`OpenAICompletionsCompat`（types.ts L545-605）用 ~25 个布尔/枚举开关刻画一个 OpenAI-compatible 后端的能力差异：`supportsStore`、`supportsDeveloperRole`、`supportsReasoningEffort`、`supportsUsageInStreaming`、`supportsFinishReason`、`maxTokensField`、`requiresToolResultName`、`requiresThinkingAsText`、`thinkingFormat`（openai/openrouter/deepseek/zai/qwen/chat-template/…11 种）、`supportsStrictMode`、`cacheControlFormat`、`supportsThinkingTokenBudget`（vLLM）等。

解析策略（`src/api/openai-completions.ts` L1444-1577）：`detectCompat(model)` 按 provider id / baseUrl 子串**自动探测**已知厂商 → `getCompat()` 用 `model.compat` 逐字段覆盖。自定义后端（Ollama/vLLM/LM Studio）只需在 models.json 写少量 compat 覆盖即可工作。`buildParams()`（L682-891）把 thinking level 映射、cache retention、工具转换全部按 compat 分支处理，最后 `Object.assign(params, options.samplingParams)` 允许任意自定义参数逃逸。

### 3.7 如何新增一个 provider

**路径 A（声明式，零代码）**：`~/.pi/agent/models.json`（`docs/models.md`）：

```json
{ "providers": { "ollama": {
    "baseUrl": "http://localhost:11434/v1",
    "api": "openai-completions",
    "apiKey": "ollama",
    "compat": { "supportsDeveloperRole": false, "supportsReasoningEffort": false },
    "models": [ { "id": "llama3.1:8b", "reasoning": false, "contextWindow": 128000 } ]
} } }
```

schema 校验在 `coding-agent/src/core/model-config.ts`（typebox Compile），组装在 `provider-composer.ts`，最终走同一个 `createProvider()`。

**路径 B（编程式）**：`createProvider()`（`ai/src/models.ts` L739-860）——内部 provider 与 models.json 自定义 provider 走同一工厂：

```ts
export function createProvider<TApi extends Api>(input: {
  id: string; name?: string; baseUrl?: string; headers?: ProviderHeaders;
  auth: ProviderAuth;                       // 必填，即使只是 ambient/keyless
  models: readonly Model<TApi>[];           // 静态基线目录
  fetchModels?: (ctx: RefreshModelsContext) => Promise<readonly Model<TApi>[]>;  // 动态目录
  api: ProviderStreams | Partial<Record<TApi, ProviderStreams>>;  // 单实现或按 model.api 分派
}): Provider<TApi>
```

实例：`providers/openai.ts` 全文 15 行（id + baseUrl + envApiKeyAuth + models + `openAIResponsesApi()`）。coding-agent 扩展还可通过 `pi.registerProvider()` 注册完整 Provider 或 legacy config（`docs/custom-provider.md`），用于企业代理/SSO/自定义流式 API。

---

## 4. pi-agent-core（packages/agent）

### 4.1 Agent 循环

- 低层：`agentLoop(prompts, context, config, signal, streamFn)` / `runAgentLoop`（`src/agent-loop.ts`）。全程操作 `AgentMessage[]`，**只在 LLM 调用边界经 `config.convertToLlm` 转成 pi-ai 的 `Message[]`**。循环：turn_start → streamFn 请求 → 流式转发 message_update → 执行工具（可并行）→ 追加 toolResult → 检查 steering 队列 → 下一轮或检查 followUp 队列 → agent_end。
- `AgentLoopConfig`（`src/types.ts` L148-297）是扩展点集合：`convertToLlm`、`transformContext`（上下文裁剪/注入）、`getApiKey`（每次调用动态解析，应对短命 OAuth）、`shouldStopAfterTurn`、`prepareNextTurn`（换 model/thinking/context）、`getSteeringMessages`/`getFollowUpMessages`（运行中注入消息）、`beforeToolCall`/`afterToolCall`（拦截/改写工具结果，`block:true` 可拒绝执行）。
- 高层：`Agent` 类（`src/agent.ts`）持有 `AgentState`（systemPrompt/model/thinkingLevel/tools/messages + isStreaming/pendingToolCalls 只读态），`prompt()` 串行化运行，事件经 `subscribe()` 分发。
- **sampling 注入点**：`AgentOptions.streamFn: StreamFn`（`(model, context, options?) => AssistantMessageEventStream`）。`Models.streamSimple.bind(models)` 即满足（README 示例）；`src/stream-fn.ts` 提供 `setDefaultStreamFn()` 让宿主安装默认运行时——**agent 核心不依赖任何 provider catalog**。`src/proxy.ts` 则给出把流调用转发到远端服务器的 StreamFn 实现。

### 4.2 工具调用协议

```ts
export interface AgentTool<TParameters extends TSchema, TDetails> extends Tool<TParameters> {
  label: string;
  prepareArguments?: (args: unknown) => Static<TParameters>;   // 校验前兼容 shim
  execute(toolCallId, params, signal?, onUpdate?): Promise<AgentToolResult<TDetails>>;
  executionMode?: "sequential" | "parallel";
}
```

- 参数 schema 用 **typebox**（`Tool.parameters: TSchema`），`validateToolArguments`（pi-ai utils/validation）校验；`constrainedSampling` 支持 json_schema strict / grammar（Lark/regex）两种 provider 侧约束采样（`ai/src/api/constrained-sampling.ts`）。
- 结果 `AgentToolResult { content: (TextContent|ImageContent)[]; details; usage?; terminate? }`，`onUpdate` 支持流式部分结果（bash 输出节流推送）。
- 执行模式：默认 parallel（先串行 preflight 再并发执行），`beforeToolCall` 可 block+reason，`afterToolCall` 可按字段覆盖结果。

### 4.3 状态管理（session 结构、消息类型）

- **消息**：pi-ai 三种基础消息 + `AgentMessage = Message | CustomAgentMessages[keyof ...]`，自定义消息用**声明合并**扩展（agent/src/types.ts L305-325）。harness 注册了 `bashExecution`/`custom`/`branchSummary`/`compactionSummary`（`src/harness/messages.ts`），并提供 `convertToLlm` 把自定义消息转 user 消息或过滤。
- **会话树**（`src/harness/session/`）：write-once `Entry`（message/model_change/thinking_level_change/active_tools_change/compaction/branch_summary/custom，带 `id/seq/parentId/timestamp`）+ 独立 `Record` 流水（operation_started/tool_started/usage/queue_*，见 `session/types.ts`）。`Session`（`session/session.ts`）做 JSON 可序列化强校验（`assertJsonSerializable`）后委托 `SessionStorage` 接口；lane 指针实现分支。coding-agent 现行落盘是 JSONL v3 树格式（`docs/session-format.md`：`~/.pi/agent/sessions/--<cwd>--/<ts>_<uuid>.jsonl`，`id/parentId` 原地分支）。
- **新 AgentHarness**（`src/harness/agent-harness.ts` + `docs/harness.md` 千行 spec）：面向崩溃恢复的操作状态机（lane/operation/queue/deferred write 全部持久化，解释器逐步执行 ActionInfo），当前大部分方法还是 `HarnessNotImplemented` 占位——属于在建的 v4 架构，但 Entry/Record/SessionStorage 抽象已可用。
- Compaction：`src/harness/compaction/compaction.ts`（848 行，阈值触发/溢出触发，保留近尾 token，摘要替换前缀）+ branch-summarization。

---

## 5. coding-agent CLI

**交互流程**：`main.ts` 解析参数 → 迁移（`migrations.ts`）→ project trust 检查 → 组装 services（`core/agent-session-services.ts`：ModelRuntime/AuthStorage/SettingsManager/SessionManager/扩展加载）→ `createAgentSession`（SDK）→ 按模式运行。四模式：interactive（TUI）、`-p` print、`--mode json`（JSON 事件流）、`--mode rpc`（进程间集成）。交互命令：`/model`（模型选择器，每次打开重读 models.json）、`/login`、`/logout`、`/tree`（会话树导航）、`/compact`、`/settings`、`/trust`、`!` shell 直通等。

**内置工具**（`src/core/tools/index.ts`）：核心四件 `read`/`bash`/`edit`/`write`，另有 `grep`/`find`/`ls`（只读集）。工具全部是工厂函数（`createBashTool(cwd, options)`），bash 支持 `spawnHook`（改 env/命令）、输出截断（默认行数/字节双限，全文存临时文件）、会话环境变量注入（`PI_SESSION_ID/PI_PROVIDER/PI_MODEL/...`，`docs/environment-variables.md`）。edit 工具用精确字符串匹配替换 + 唯一性校验（`edit.ts`/`edit-diff.ts`）。

**权限模型——确认 README 说法属实**：`docs/security.md` 明确 "**No Built-in Sandbox**"——内置工具以 pi 进程权限读写文件、执行命令，扩展同权限运行；唯一的守卫是 **project trust**（仅管输入加载：`.pi/settings.json`、扩展、skills、SYSTEM.md 等项目资源需信任后才加载，决策存 `~/.pi/agent/trust.json`；非交互模式按 `defaultProjectTrust: ask|always|never` 处理）。隔离靠容器化（`docs/containerization.md`：整体 Docker / OpenShell / Gondolin micro-VM 路由工具执行）。**无任何运行时工具调用审批/路径白名单机制**——与我们的目标一致（权限交给 OS/容器层）。

**扩展系统**：TypeScript 模块，`ExtensionAPI` 提供 `registerProvider`/`registerTool`/事件钩子（`core/extensions/types.ts` 1728 行），加载器支持用户级/项目级/npm 包（pi packages）。

---

## 6. tui 差分渲染要点

- 架构：`TUI` 共享接口 + 两个渲染器（`src/tui.ts` 1256 行 TuiBase 管组件树/focus/输入/overlay）：`TuiMainScreen`（主屏，保留 scrollback）与 `TuiAltScreen`（备用屏固定 viewport，应用自管滚动）。
- 差分机制（`src/tui-main-screen.ts`）：组件 `render(width)` 产出字符串行数组 → 与 `previousLines` 逐行比较得 `firstChanged/lastChanged` → **只重写变化区间**（L417-424），宽度变化/高度变化/内容收缩走全量重绘分支；Kitty 图片行单独跟踪 id 做删除。
- 防闪烁：整段输出包在 **CSI 2026 同步输出**（`\x1b[?2026h ... \x1b[?2026l`）里原子提交（L212-234、390-497）。
- 其他：bracketed paste、光标位置追踪（DPR 查询）、Termux 适配、调试渲染日志（`PI_TUI_DEBUG`）。

---

## 7. telemetry：vendor-neutral 契约（对照 Mixpanel 专有遥测）

`packages/telemetry`（极小，无后端依赖）设计原则（README + `src/index.ts`）：

1. **只有契约，无 exporter、无全局 current-span、无后端依赖**。核心是回调式显式上下文：

```ts
export interface TelemetryContext {
  startSpan<T>(options: SpanOptions, callback: (span: TelemetrySpan) => T | Promise<T>): Promise<T>;
}
export interface TelemetrySpan extends TelemetryContext {
  addEvent(name, attributes?); setAttributes(attributes); setStatus(status);
}
```

span 生命周期由 startSpan 独占（无公共 end()），默认注入 `NOOP_TELEMETRY_CONTEXT`——**不接后端时零开销零代码路径**。接 OTel/Sentry/日志只需写一个 adapter 实现 TelemetryContext，包内附 `InMemoryTelemetryContext` 参考实现与 conformance 测试套件（`test/conformance.test.ts`）。

2. **类型化 schema**：`defineTelemetrySchema()` + 条件类型推断，把 span/属性/事件定义成可序列化数据，编译期推出强类型属性（required/optional 分离、枚举值收窄、精确多余字段检查）。pi-ai 的请求 span schema（`agent/src/harness/telemetry.ts` `AI_TELEMETRY_SCHEMA`，`pi.ai.request`：provider/model/operation/usage/cost/stop_reason 等属性）可自动生成文档（`scripts/generate-telemetry-docs.ts`）。
3. **显式传递**：`StreamOptions.telemetryContext`（pi-ai types.ts L125）把父上下文沿请求链传，不用全局变量。
4. coding-agent 层实际遥测只剩两个开关（`core/telemetry.ts` + settings）：`enableInstallTelemetry`（匿名安装/更新 ping 到 pi.dev，`PI_TELEMETRY=0` 可关）与 opt-in 的 `enableAnalytics`（默认 false）。**无任何使用行为上报**。

**对照结论**：grok-build 删掉 Mixpanel 后，若仍想保留可观测性，可直接照搬这个"契约 + NOOP 默认 + adapter 可选"三层结构，替换成本极低。

---

## 8. session-backends / protocol / server / client

- **SessionStorage 接口**（agent `session/types.ts`）是存储抽象边界；`session-backends/sqlite-node` 提供 `node:sqlite` 实现：`SqliteSessionRepository`（懒持有单连接、迁移、物化视图）+ 独立 `createSqliteSessionSearch`（FTS5 全文检索，首次搜索懒建表+一次性重建，之后触发器同步）。刻意把 sqlite 拆出核心包，避免 agent-core 引入原生依赖——**后端可换文件/Postgres**。
- **protocol**：版本 1，wire = `[uint32 BE 长度][CBOR payload]`；自带严格 RFC 8949 子集编解码（`src/cbor/`）与增量 `FrameDecoder`（任意分片/合包）；消息经 typebox 风格运行时校验（`encodeClientMessage` 校验后编码，违规 throw `ProtocolValidationError`）。首包 `hello` 协商版本，之后是 request/response 关联信封 + server 事件信封；**快照权威、progress 事件仅为 UI hint**。
- **server**（实验性）：`PiServer` + `PiServerService`（listSessions/listModels/createSession/openSession 由应用实现）+ `PiServerListener` 传输抽象；Unix listener 靠文件权限做认证，WebSocket 在 upgrade 阶段认证——**认证在传输层完成，协议字节不掺认证**。含 `toProtocolAssistantMessage()` 等 pi-ai↔wire DTO 桥接（显式字段清单，新增字段强制 review）。
- **client**：`PiClient` + `ByteTransportFactory`（无 Node 依赖，可跑浏览器）；`SessionLease` 独占/共享获取语义、快照订阅、结构化错误类型。

---

## 9. 配置体系

**目录布局**（`coding-agent/src/config.ts`：`getAgentDir()` 等，可被 `PI_CODING_AGENT_DIR` 覆盖）：

```
~/.pi/agent/
  settings.json      # 全局设置（defaultProvider/defaultModel/defaultThinkingLevel/theme/
                     #   compaction/retry/httpProxy/enableInstallTelemetry/...，docs/settings.md）
  models.json        # 自定义 provider/model（§3.7，每次打开 /model 热重载）
  auth.json          # 凭据（0600；api_key/oauth；key 支持 $ENV 插值与 !command 执行）
  trust.json         # project trust 决策
  models-store.json  # 动态模型目录缓存
  sessions/--<cwd>--/*.jsonl
.pi/settings.json    # 项目级设置，覆盖全局（需 project trust）
.pi/extensions|skills|prompts|themes, .pi/SYSTEM.md|APPEND_SYSTEM.md
AGENTS.md / CLAUDE.md / AGENTS.override.md   # 上下文文件，无需 trust 即加载
```

**关键 env**（`docs/environment-variables.md`）：`PI_CODING_AGENT_DIR`、`PI_CODING_AGENT_SESSION_DIR`、`PI_OFFLINE`（禁所有启动网络操作）、`PI_SKIP_VERSION_CHECK`、`PI_TELEMETRY`、`PI_CACHE_RETENTION`、`HTTP(S)_PROXY`；provider key 变量 40+ 个（`ai/src/env-api-keys.ts`）。

**模型/provider 切换**：CLI `pi --provider x --model y --api-key k`；交互内 `/model`（选择器，含未配置 auth 的模型提示）、`/login`、`/logout`；settings `defaultProvider/defaultModel/defaultThinkingLevel`；运行中切模型写 `model_change` 会话条目。bash 工具注入 `PI_PROVIDER/PI_MODEL/PI_REASONING_LEVEL`。

---

## 10. 对 grok-build 脱敏改造的可借鉴点

1. **sampling 层参数化 = 注入一个 StreamFn 边界**。pi 的 agent 循环只认 `(model, context, options) => AssistantMessageEventStream`（agent `src/types.ts` `StreamFn`），`Models.streamSimple` 是默认实现但可整体替换（`setDefaultStreamFn`、`proxy.ts`）。建议 grok-build 的 Rust 侧定义同形 trait：`fn stream(&Model, &Context, &SampleOptions) -> EventStream`，专有后端与 OpenAI-compatible 后端各实现一个 adapter；agent loop 与后端彻底解耦。
2. **Model 描述符承载端点差异**：`Model.baseUrl` + `Model.api` + `Model.compat` + `Model.samplingParams` + `Model.headers` 五字段即可表达任意后端（§3.2）。特别是 `samplingParams: Record<string, unknown>` 的"原样合并、最后覆盖"策略（types.ts L183-189、openai-completions.ts L886-888）——不要试图穷举所有采样参数，留一个逃逸舱给 top_p/min_p/repetition_penalty 这类后端私有参数。
3. **compat 开关表替代硬编码 provider 判断**：把"某后端是否支持 developer role / reasoning_effort / streaming usage / finish_reason / strict tools"做成声明式能力位，URL 自动探测 + 配置覆盖（§3.6）。我们只需保留 `openai-completions` 一条路径 + 最小 compat 集即可覆盖绝大多数自建推理服务。
4. **Auth 三级解析 + 可插拔 CredentialStore**：`请求参数 > 凭据存储 > env`（§3.5），凭据值支持 `$ENV` 插值与 `!command`（从 keychain/vault 取 key）——BYOK 场景直接可用。凭据存储是接口（read/list/modify/delete，modify 串行 RMW），文件实现 0600。
5. **遥测替换**：删除 Mixpanel 后采用 pi-telemetry 式 NOOP 契约（§7）：默认 noop context，span 回调式、显式传递；如果将来要接 OTel 只写 adapter。安装 ping / 自动更新检查（pi.dev 端点）这类专有网络行为对应 grok-build 要删的更新遥测，pi 用 `PI_OFFLINE`/`PI_SKIP_VERSION_CHECK`/`PI_TELEMETRY=0` 三档开关处理，可参考做成编译期/配置开关。
6. **错误编码进流而非抛出**：StreamFn 契约要求失败产出 `stopReason:"error"` 的终值消息（§3.2），agent loop 因此不需要 try/catch 分支，重试/降级逻辑（`utils/retry.ts`、`provider-retry.ts` 的 maxRetryDelayMs 上限）统一在 adapter 内。
7. **工具层**：typebox schema + `execute(id, params, signal, onUpdate)` + before/after 钩子（§4.2）是干净的权限挂载点——若将来要加审批，`beforeToolCall` 就是唯一拦截面；pi 自己选择不加（§5），把隔离推给容器。
8. **会话持久化**：JSONL 树（id/parentId 原地分支，v3 带版本迁移）简单可 grep 可分享；若要检索再上 SQLite FTS（§8）。Entry/Record 分离（对话内容 vs 操作流水）值得在 Rust 侧保留。
9. **测试替身**：faux provider（`ai/src/providers/faux.ts`）脚本化回放工具调用流，支撑无 API key 的 e2e——脱敏后的 CI 不应依赖专有端点，建议照此实现一个 Rust mock provider。
10. **配置分层**：全局 `settings.json` + 项目 `.pi/settings.json`（trust 门控）+ env 覆盖 + 声明式 `models.json`，热重载（打开 /model 即重读）——该分层与 grok-build 的配置文件改造可直接对齐。

---

## 附：关键文件索引

| 主题 | 路径（相对 `ref/pi`） |
|---|---|
| 统一类型 | `packages/ai/src/types.ts` |
| Provider/Models 注册与调度 | `packages/ai/src/models.ts` |
| OpenAI-compatible 适配器 | `packages/ai/src/api/openai-completions.ts` |
| 懒加载包装 | `packages/ai/src/api/lazy.ts` |
| Auth 抽象/解析 | `packages/ai/src/auth/types.ts`、`auth/resolve.ts`、`auth/helpers.ts` |
| Provider 工厂示例 | `packages/ai/src/providers/openai.ts`、`xai.ts`、`all.ts` |
| 测试假 provider | `packages/ai/src/providers/faux.ts` |
| Agent 循环 | `packages/agent/src/agent-loop.ts`、`agent.ts`、`types.ts` |
| StreamFn 注入 | `packages/agent/src/stream-fn.ts`、`proxy.ts` |
| 会话树/存储接口 | `packages/agent/src/harness/session/{types,session}.ts` |
| Harness 工具 | `packages/agent/src/harness/tools/*.ts`、`packages/coding-agent/src/core/tools/*.ts` |
| models.json schema | `packages/coding-agent/src/core/model-config.ts` |
| 系统提示词 | `packages/coding-agent/src/core/system-prompt.ts` |
| 扩展 API | `packages/coding-agent/src/core/extensions/types.ts` |
| 遥测契约 | `packages/telemetry/src/index.ts`、`agent/src/harness/telemetry.ts` |
| 协议/服务端/客户端 | `packages/protocol/src/`、`packages/server/src/`、`packages/client/src/` |
| 文档 | `packages/coding-agent/docs/{providers,models,custom-provider,settings,security,environment-variables,session-format}.md` |
