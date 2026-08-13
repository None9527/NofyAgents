# OpenClaw 项目全面分析报告

> 分析对象：`/home/none/grok-build/ref/openclaw`（OpenClaw，版本 2026.8.1，MIT）
> 分析目的：为 grok-build（Rust 专有 coding agent）脱敏改造成"通用 OpenAI-compatible API agent"提供架构参考。
> 所有结论基于实际源码阅读，关键处标注文件路径。

---

## 1. 项目定位与技术栈

**定位**：`package.json` 的 description 是 *"Multi-channel AI gateway with extensible messaging integrations"*。OpenClaw 是一个**个人 AI 助理网关**：单操作者（single operator）场景，一个常驻 Gateway 进程统一管理模型调用、工具执行、会话状态，并把助理接入用户已有的聊天渠道（WhatsApp/Telegram/Slack/Discord/iMessage 等）。它不是单纯的 coding agent，而是"模型 × 工具 × 渠道"的多通道 AI 中枢。

**技术栈**：

- 语言/运行时：TypeScript（ESM，`"type": "module"`），Node.js `>=22.22.3 <23 || >=24.15.0 <25 || >=25.9.0`（`package.json` engines；`openclaw.mjs:11-16` 有严格版本闸门，Bun 需具备 `node:sqlite` 才放行）。
- 包管理：pnpm workspace（`pnpm-workspace.yaml`），成员为 `.`（根包即 `openclaw` 本体）、`ui`、`packages/*`、`extensions/*`、`examples/*`；`nodeLinker: hoisted`，带 `minimumReleaseAge`（依赖发布满 48h 才允许安装）与大量 `overrides`/`allowBuilds` 供应链管控。
- 关键依赖：`commander`（CLI）、`express`、`@anthropic-ai/sdk`、`openai`、`@google/genai`、`@mistralai/mistralai`、`@modelcontextprotocol/sdk`、`grammy`（Telegram）、`baileys`（WhatsApp）、`kysely` + `node:sqlite`（状态存储）、`typebox`/`zod`（协议与校验）、`chokidar`、`execa`、`@lydell/node-pty`。
- 规模：约 3.2 万文件；仅 `src/` 约 13.6k 个 ts 文件，`extensions/` 约 9k 文件（160 个扩展包），`docs/` 500+ 篇文档。

**入口与构建**：

- `bin: { "openclaw": "openclaw.mjs" }`。`openclaw.mjs` 是纯 JS 启动器：校验 Node 版本 → 管理 Node compile cache（必要时 respawn 子进程并转发信号，`openclaw.mjs:140-300`）→ help/version 快速路径（读预生成的 `dist/cli-startup-metadata.json`，避免冷启动加载整个 TS 运行时）→ 最终 `import("./dist/entry.js")`（`openclaw.mjs:808-815`）。
- 源码入口 `src/entry.ts`（CLI 主入口，commander 程序装配、profile/容器参数解析、respawn 策略）。
- 构建：`pnpm build` → `scripts/build-all.mts`；核心用 **tsdown**（rolldown 系打包器，`tsdown.config.ts`、`tsdown.ai.config.ts`）把 `src/` + workspace 包打成 `dist/`；`build:docker` 流水线还包括 build-stamp、build-info、CLI 启动元数据预生成、插件资产构建。plugin-sdk 的 `.d.ts` 用 tsgo（TS native preview）生成。
- `main: dist/index.js`；Docker 中即 `node dist/index.js gateway`。

**CLI 面**（commander，`src/cli/program/build-program.ts` + 命令注册表 `command-registry.ts`）：核心命令族包括 `onboard`（引导：验证模型访问、建 workspace、装 daemon）、`gateway`（启停/状态）、`models`（list/set/status/auth login，模型管理）、`configure`、`doctor`（自检修复）、`dashboard`（打开 Control UI）、`tui`、`agent`、`sessions`、`plugins`、`skills`、`channels`、`cron`、`nodes`、`browser`、`secrets`、`tasks`、`acp` 等。启动器对 `--version`、根 help 与少数子命令 help 做了**预计算快速路径**（`dist/cli-startup-metadata.json`），冷启动秒回。

---

## 2. Monorepo 结构总览

| 目录 | 职责 | 关键内容 |
|---|---|---|
| `src/` | 根包 `openclaw` 本体：CLI + Gateway + agent 运行时 | `cli/`、`gateway/`、`agents/`、`channels/`、`llm/`、`config/`、`plugins/`、`sessions/`、`memory/`、`tools/`、`mcp/`、`tui/`、`web/`、`cron/`、`secrets/`、`security/`、`model-catalog/`、`model-picker/`、`provider-runtime/` 等 70+ 子域 |
| `packages/` | 23 个可复用库（可独立发布） | 见下表 |
| `extensions/` | 160 个**捆绑插件**：模型 provider、聊天渠道、功能扩展 | 每个扩展一个包：`openclaw.plugin.json` + `package.json`（`openclaw.extensions` 入口）+ `index.ts` |
| `skills/` | ~50 个捆绑技能（纯 Markdown `SKILL.md` + 可选脚本） | github、tmux、obsidian、notion、weather、summarize… |
| `ui/` | Control UI（管理/聊天 Web 界面） | Lit web components + Vite，经 `@openclaw/gateway-client` 走 WS |
| `apps/` | 原生伴侣应用 | `macos/`（Swift）、`ios/`（Swift）、`android/`（Kotlin）、`linux/`（Tauri/Rust）、`shared/OpenClawKit` |
| `docs/` / `qa/` / `scripts/` | 文档、场景化 QA harness（515 个 yaml 场景）、构建脚本 | — |
| `examples/ai-chat` | `@openclaw/ai` 的最小外部消费者示例 | 见 §4 |

**packages/ 关键包**：

- `agent-core`（`@openclaw/agent-core`）：**agent 主循环**、harness 类型、消息、compaction 辅助、会话存储契约。
- `ai`（`@openclaw/ai`）：**模型 provider 适配器与流式运行时**（可独立复用，见 §4）。
- `llm-core`：LLM 消息/上下文/事件基础类型（`Context`、`UserMessage`、`AssistantMessage`、`EventStream`…）。
- `model-catalog-core`：模型目录规范化、`provider/model` 引用解析。
- `gateway-protocol`：Gateway WS 协议的 TypeBox schema + JSON Schema（`protocol.schema.json`），Swift 客户端模型由它 codegen。
- `gateway-client`：协议参考客户端（TS）。
- `plugin-sdk`：插件 SDK 类型与运行时辅助（与 `src/plugin-sdk` 一起以 `openclaw/plugin-sdk/*` barrel 暴露）。
- `memory-host-sdk`、`terminal-core`、`acp-core`（Agent Client Protocol）、`markdown-core`、`media-core`、`retry`、`net-policy`、`sdk` 等。

**extensions/ 三类**（160 个）：

1. **模型 provider**（~55 个）：openai、anthropic、anthropic-vertex、google、xai、deepseek、openrouter、ollama、litellm、vllm、sglang、lmstudio、llama-cpp、amazon-bedrock(-mantle)、microsoft(-foundry)、azure-speech、cerebras、groq、mistral、moonshot、qwen、zai、volcengine、tencent、qianfan、xiaomi、together、fireworks、deepinfra、novita、nvidia、huggingface、github-copilot、copilot、codex、opencode(-go)、kilocode、kimi-coding、vercel-ai-gateway、cloudflare-ai-gateway、perplexity、cohere、minimax、stepfun、longcat、arcee、baseten、chutes、featherless、venice、synthetic、voyage（embedding）、inworld…
2. **聊天渠道**（~30 个）：telegram、discord、slack、whatsapp、signal、matrix(mxc)、msteams、googlechat、feishu、line、irc、imessage、qqbot、zalo(zalouser)、nostr、twitch、sms、synology-chat、nextcloud-talk、mattermost、tlon、webhooks、voice-call、talk-voice、teams-meetings、google-meet、zoom-meetings…
3. **功能扩展**：memory-core/memory-lancedb/memory-wiki（记忆）、active-memory、browser、canvas、linux-canvas、cua-computer、diagnostics-otel、diagnostics-prometheus、vault、onepassword、document-extract、duckduckgo/exa/brave/tavily/searxng/firecrawl（搜索）、elevenlabs/deepgram/fish-audio-speech（TTS）、fal/runway/pixverse/comfy（媒体生成）、llm-task、policy、qa-lab/qa-channel、tokenjuice、migrate-claude/migrate-hermes…

---

## 3. 核心架构：agent 主循环 / 运行时

权威说明在 `docs/agent-runtime-architecture.md`（要点摘录 + 源码核对）：

- **内置 agent 运行时 id 为 `openclaw`**（旧别名 `pi` 归一化为 `openclaw`；`codex-app-server` → `codex`）。运行时代码在 `src/agents/`，模型/传输层在 `src/llm/`，对插件的契约经 `openclaw/plugin-sdk/*` barrel 暴露。
- 插件 harness 可注册**额外运行时 id**（如 `codex`、`claude-cli`、`google-gemini-cli`），即"agent 执行后端"本身是可插拔的。选择策略：provider/model 作用域的 `agentRuntime.id` 配置（model 条目优先于 provider 条目）；未设置或 `default` 解析为 `auto`；`auto` 选支持当前 provider 路由的已注册 harness，否则回落到内置运行时（`docs/agent-runtime-architecture.md:42-49`）。

**关键代码位置**：

| 路径 | 职责 |
|---|---|
| `packages/agent-core/src/agent-loop.ts` | 通用 agent 循环 `runAgentLoop(prompts, context, config, emit, signal, streamFn, runtime)`（`:208`）与 `runAgentLoopContinue`（`:235`）：事件驱动（`agent_start`/`turn_start`/`message_*`/`agent_end`），调用 `streamFn` 出流式 assistant 消息 → 解析 toolCall → 执行工具（`validateToolArguments`、tool-loop 恢复、steering 消息注入、中断/abort 处理）→ 循环直到非 toolUse 停止 |
| `src/agents/embedded-agent-runner/` | 内置"attempt 循环"封装：`run.ts`/`run-orchestrator.ts`（`runEmbeddedAgent`）、`run/attempt-*.ts`（每次尝试的引导上下文、工具装配、before-agent-run 钩子、failover）、`model.*.ts`（模型选择/前向兼容/provider 规范化）、`extra-params.*.ts`（按 provider 注入请求参数）、`compact*.ts`（上下文压缩） |
| `src/agents/sessions/` | 会话持久化（`session-manager.ts`）、资源发现（`package-manager.ts`、`resource-loader.ts`）、会话内 extensions 加载、prompt 模板、skills、工具渲染器 |
| `src/agents/agent-tools*.ts` | OpenClaw 自有工具定义、参数 schema、工具策略、before/after tool-call 适配器 |
| `src/agents/harness/` | harness 注册表与选择策略（内置 + 插件注册） |
| `src/gateway/` | Gateway 守护进程：WS 服务器、channel 生命周期、agent-turn 分发、鉴权/配对、健康监控（`boot.ts`、`agent-turn/`、`auth*.ts`、`channel-health-*.ts`…） |
| `src/tools/`、`src/mcp/` | 工具实现与 MCP 集成；agent 的 MCP 装配在 `src/agents/agent-bundle-mcp-*.ts` |

工具执行有独立的策略/审批/沙箱体系：`agent-tools.before-tool-call.*`（调用前策略、审批、policy 钩子）、exec approvals（`src/infra/exec-approvals-store.ts`）、sandbox 与 tool policy 是三个正交维度（`docs/gateway/sandbox-vs-tool-policy-vs-elevated.md`）。

**模型运行时"代"（generation）机制**：Gateway 启动时为每个配置的 agent 构建一份原子快照（auth 模板 + 模型注册表 + 投影后的模型目录）；agent 运行从快照 fork 可变状态；失败/过期的 generation 永不与新版混发（`docs/agent-runtime-architecture.md:52-58`）。这是对"配置热加载 + 运行一致性"很值得借鉴的设计。

**agent 循环内部要点**（`packages/agent-core/src/agent-loop.ts`）：

- `runLoop` 每轮：取 steering 消息（用户插队消息，`getSteeringAtCheckpoint`）→ 调 `streamFn(model, context, config)` 出 assistant 消息 → 若 `stopReason === "toolUse"` 则执行工具批次（`validateToolArguments` 校验入参、`takeInternalToolBatchLifecycle` 管批次生命周期）→ 把 `ToolResultMessage` 追加进 context 继续下一轮；否则结束并发 `agent_end`。
- 工具循环防护：`TOOL_LOOP_RECOVERY_TERMINATED_MESSAGE`（`:69`）在检测到致命工具循环时终止运行且不执行被阻塞的动作；`removeNonExecutableToolCalls`（`:113`）确保非 toolUse 停止时剥离残留 toolCall，保持转录可续接（否则抛 `TranscriptNotContinuableError`）。
- 事件流构造统一走 `@openclaw/ai/event-stream` 的 `EventStream`，与 `@openclaw/llm-core` 共享构造器身份（`:1-11` 注释强调跨包单一 constructor identity，避免 `instanceof` 失效）——monorepo 多包共享运行时类型的典型坑。
- abort/中断语义独立成模块（`turn-interruption.ts`：`appendInterruptedTurnMessage`、`isTurnHandoffAbort`），保证中断后的转录仍可恢复。

---

## 4. 模型 / Provider 抽象（重点）

OpenClaw 的 provider 体系分**两层**，边界清晰：

### 4.1 传输适配层（API adapter）

- **API 适配器枚举**（`src/config/types.models.ts:14-25`）：

```ts
export const MODEL_APIS = [
  "openai-completions",        // 通用 OpenAI Chat Completions（任意兼容后端）
  "openai-responses",          // OpenAI Responses API
  "openai-chatgpt-responses",  // ChatGPT/Codex OAuth Responses
  "anthropic-messages",
  "google-generative-ai",
  "google-vertex",
  "github-copilot",
  "bedrock-converse-stream",
  "ollama",
  "azure-openai-responses",
] as const;
export type ModelApi = (typeof MODEL_APIS)[number];
```

- **注册表**（`packages/ai/src/api-registry.ts`）：`ApiProvider<TApi> { api; stream; streamSimple }`；`createApiRegistry()` 可创建隔离的 registry（按 runtime/租户），`registerApiProvider(provider, sourceId)` 注册、可按 sourceId 整体卸载（插件生命周期友好）。内置适配器经 `registerBuiltInApiProviders(registry)`（`packages/ai/src/providers/register-builtins.ts:154`）一次性注册。
- **适配器实现**在 `packages/ai/src/providers/`：`openai-completions.ts`（基于官方 `openai` SDK，`model.baseUrl` 任意指向兼容端点）、`anthropic.ts`、`google.ts`/`google-vertex.ts`、`mistral.ts`、`openai-chatgpt-responses.ts`、`azure-openai-responses.ts`、`bedrock` 等；每个适配器把统一的 `Context`（system+messages+tools）翻译为各家协议，输出统一的 `AssistantMessageEventStreamContract` 流事件（text/thinking/toolcall 的 start/delta/end）。
- **统一请求选项 `StreamOptions`**（`packages/llm-core/src/types.ts:68-149`）：`temperature/maxTokens/responseFormat(JSON Schema)/stop/signal/apiKey/transport("sse"|"websocket"|"auto")/cacheRetention("none"|"short"|"long")/sessionId/promptCacheKey/headers/timeoutMs/maxRetries/maxRetryDelayMs/metadata`，外加两个钩子 `onPayload`（发送前检查/替换请求体）与 `onResponse`（响应头回调）——provider 插件用其做 payload 日志与改写；`SimpleStreamOptions` 追加 `reasoning`（归一化 thinking 等级 "off"…"max"）与 `thinkingBudgets`。
- **流事件协议**（同文件 419-449 行）：`start → text_*/thinking_*/toolcall_*（start/delta/end）→ done(reason,message) | error(reason,error)`；`text_delta` 可省略 `partial` 快照避免每 token 保留整条消息。契约要求**错误编码进流而非 throw**（终止消息带 `stopReason: "error"|"aborted"` + `errorMessage`），这让上层重试/failover 逻辑统一。
- **OpenAI 兼容旋钮 `OpenAICompletionsCompat`**（同文件 460-507 行）：`supportsStore/supportsDeveloperRole/supportsReasoningEffort/supportsUsageInStreaming/maxTokensField/requiresToolResultName/requiresAssistantAfterToolResult/requiresThinkingAsText/thinkingFormat("openai"|"openrouter"|"deepseek"|"together"|"zai"|"qwen"|"qwen-chat-template")/cacheControlFormat("anthropic")/supportsStrictMode/supportsJsonSchemaResponseFormat/supportsPromptCacheKey/…`——**默认按 baseUrl 自动探测、可配置覆盖**，这是"一个适配器吃遍所有 OpenAI-compatible 方言"的关键设计；Anthropic/Responses 系各有对应 compat 结构。
- **门面**（`src/llm/stream.ts`）：`stream(model, context, options)` / `complete(...)` / `streamSimple(...)`，内部 `resolveRuntime(model)` 选择 LLM runtime（可被插件替换），再按 `model.api` 从 registry 取适配器。
- **Model 运行时对象**（`packages/ai/src/provider-types.ts`、`src/llm/types.ts`）：`{ id, name, api, provider, baseUrl, reasoning, input: ("text"|"image"|"audio"|"video")[], cost, contextWindow, maxTokens, ... }`。
- **最小消费者示例** `examples/ai-chat/index.mjs`：`createLlmRuntime()` + `registerBuiltInApiProviders()` 后直接对 `{api:"openai-completions", baseUrl:"http://localhost:11434/v1", ...}` 的 Model 对象发起流式补全——证明传输层可完全脱离 OpenClaw 应用独立使用。
- **兼容性微调（对 OpenAI-compatible 后端尤其重要）**：`ModelCompatConfig`（`src/config/types.models.ts:83`）把各家后端的怪癖全部声明化，可在 provider/模型配置里逐项开关，包括：`supportsStore`、`supportsDeveloperRole`、`supportsReasoningEffort`、`supportsUsageInStreaming`、`supportsStrictMode`、`supportsJsonSchemaResponseFormat`、`maxTokensField`（max_tokens vs max_completion_tokens）、`requiresToolResultName`、`requiresAssistantAfterToolResult`、`thinkingFormat`、`supportedReasoningEfforts`/`reasoningEffortMap`、`supportsTools`、`supportsPromptCacheKey`、`requiresStringContent`、`strictMessageKeys`、`toolSchemaProfile`、`unsupportedToolSchemaKeywords`、`toolCallArgumentsEncoding` 等。这是"同一个 openai-completions 适配器吃下几百种兼容后端"的关键工程手段——**遇到不兼容后端优先加 compat 旗标而非 fork 适配器**。

### 4.2 Provider 目录/配置/插件层

- **用户配置 schema**（`src/config/types.models.ts:152-293`）：

```ts
export type ModelProviderConfig = {
  baseUrl: string;                 // API base URL（BYOK 任意后端的关键字段）
  apiKey?: SecretInput;            // 明文 | SecretRef（env/file/exec secret provider）
  auth?: ModelProviderAuthMode;    // api-key | oauth | token ...
  api?: ModelApi;                  // 该 provider 默认适配器
  contextWindow?/contextTokens?/maxTokens?/timeoutSeconds?/region?;
  headers?: Record<string, SecretInput>;  // 带密钥的自定义头
  authHeader?: boolean;            // 是否注入默认 Authorization 头
  params?: Record<string, unknown>;       // provider 特定参数
  localService?: ...;              // 调用前先拉起的本地服务（如 llama.cpp）
  models: ModelDefinitionConfig[]; // 模型目录条目
};
export type ModelDefinitionConfig = {
  id; name; api?; baseUrl?;        // 模型级适配器/baseURL 覆盖
  reasoning: boolean; input: [...]; cost: {input,output,cacheRead,cacheWrite,tieredPricing?};
  contextWindow; contextTokens?; maxTokens;
  thinkingLevelMap?; params?; headers?; compat?; mediaInput?; agentRuntime?;
};
export type ModelsConfig = {
  mode?: "merge" | "replace";      // 与内置目录合并或整体替换
  providers?: Record<string, ModelProviderConfig>;
  catalogRefresh?: { enabled?: boolean; url?: string };  // 远程目录刷新开关
};
```

- **ProviderPlugin 插件契约**（`src/plugins/provider-plugin.types.ts:93`）：

```ts
export type ProviderPlugin = {
  id: string; label: string;
  aliases?: string[]; hookAliases?: string[];
  envVars?: string[];                 // setup/help 展示的环境变量
  auth: ProviderAuthMethod[];         // API key / OAuth 等认证方式（含向导元数据）
  catalog?: ProviderPluginCatalog;    // run(ctx) → 返回 providers/models 定义（可联网发现）
  ...                                  // 静态目录、动态模型解析、failover 分类等钩子
};
```

- **注册方式**（`extensions/openai/index.ts`）：插件入口 `definePluginEntry({ id, name, register(api) })`，在 `register` 中调用
  `api.registerProvider(buildOpenAIProvider())`，还可注册 `registerMemoryEmbeddingProvider`、`registerImageGenerationProvider`、`registerRealtimeVoiceProvider`、`registerSpeechProvider`、`registerMediaUnderstandingProvider`、`registerVideoGenerationProvider`、`registerHttpRoute`、生命周期钩子等——即 provider 插件可同时挂载多模态能力。
- **BYOK API key 认证**（`extensions/openai/openai-provider.ts:929-951`）：`createProviderApiKeyAuthMethod({ providerId, methodId:"api-key", envVar:"OPENAI_API_KEY", optionKey, flagName:"--openai-api-key", promptMessage, profileId, defaultModel, applyConfig, wizard:{...} })`——认证方式本身是声明式对象，直接驱动 onboarding 向导、CLI flag 与 Control UI。
- **密钥来源与轮换**（`docs/concepts/model-providers.md`）：优先级 `OPENCLAW_LIVE_<P>_KEY` > `<P>_API_KEYS`（逗号列表）> `<P>_API_KEY` > `<P>_API_KEY_N`；仅在限流（429/rate_limit/quota…）时轮换下一把 key。
- **模型引用与切换**（`docs/concepts/models.md`）：引用格式 `provider/model`；`agents.defaults.model.primary` + `fallbacks`（按序降级）；`agents.defaults.modelPolicy.allow` 允许清单（支持 `provider/*` 通配）；会话内 `/model` 命令、`session_status(model=...)` 可钉住模型（`modelOverrideSource:"user"` 时严格不降级）；`utilityModel`/`imageModel`/`pdfModel`/`mediaModels` 分用途路由；auth profile 轮换发生在 provider 内部，之后才轮到模型级 fallback（`docs/concepts/model-failover.md`）。
- **在线模型发现**：provider 的 `catalog.run(ctx)` 可调 `GET /v1/models`（`extensions/openai/openai-provider.ts:278-343` `buildOpenAILiveProviderConfig`，经 `getCachedLiveProviderModelRows` 带 TTL 缓存与 401/403 → `auth-rejected` 分类），失败时回落静态 manifest 目录——发现永远是"建议性"的，离线可用。
- **任意 OpenAI-compatible 后端**（与我们最相关的用法，`docs/providers/litellm.md`）：

```json5
{ models: { providers: { litellm: {
    baseUrl: "http://localhost:4000",
    apiKey: "${LITELLM_API_KEY}",
    api: "openai-completions",
    models: [ { id: "gpt-4o", name: "GPT-4o", reasoning: false,
                input: ["text","image"], contextWindow: 128000, maxTokens: 8192 } ],
} } } }
```

  官方 provider 插件自带目录，无需 `models.providers` 条目；`models.providers` 专门用于**自定义 provider** 或窄化请求设置（timeout、headers 等）——这正是"通用 API agent"的配置形态。

---

## 5. 渠道接入（"in your chats"）

- **Gateway 单进程模型**（`docs/concepts/architecture.md`）：一个长驻 Gateway 拥有所有消息面（WhatsApp/Baileys、Telegram/grammY、Slack、Discord、Signal、iMessage、WebChat…）；控制面客户端（macOS app、CLI、Control UI）通过 **WebSocket**（默认 `127.0.0.1:18789`）连接；设备节点（macOS/iOS/Android/headless）以 `role: node` 连接同一 WS，声明 caps/commands（`canvas.*`、`camera.*`、`screen.record`…）。每主机一个 Gateway。
- **协议**：JSON 文本帧；首帧必须 `connect`（握手含鉴权 token/password、设备身份、challenge 签名）；之后 `req/res` + 服务器推送 `event`；副作用方法（`send`、`agent`）要求幂等键。协议由 TypeBox schema 定义（`packages/gateway-protocol`），生成 JSON Schema，再生成 Swift 模型——**schema-first 多端同步**。
- **ChannelPlugin 契约**（`src/channels/plugins/types.plugin.ts:60`）：渠道 = 一组适配器聚合——

```ts
export type ChannelPlugin = {
  id: ChannelId; meta; capabilities;
  config: ChannelConfigAdapter; configSchema?; setupWizard?/setupContract?;
  pairing?; security?; groups?; mentions?; outbound?; status?;
  gatewayMethods?; gateway?; auth?; approvalCapability?;
  commands?; lifecycle?; secrets?; allowlist?; doctor?; bindings?; ...
};
```

  渠道插件经 `package.json` 的 `openclaw.channel` 元数据声明静态描述（id/label/docs/env 依赖，见 `extensions/telegram/package.json`），运行时由 `index.ts` 注册完整插件——Gateway 启动路径可只读静态描述不加载插件运行时（`src/gateway/AGENTS.md` 的 guardrail）。
- **消息 → 会话路由**：DM 默认汇入主会话、群聊按群隔离、cron/webhook 独立会话；`allow-from` 白名单、mention gating、配对审批等策略在 `src/channels/`（`allow-from.ts`、`direct-dm-guard-policy.ts`、`conversation-resolution.ts`…）。

---

## 6. 会话与状态

- **会话路由**（`docs/concepts/session.md`）：会话状态全部由 Gateway 持有，UI 只查询。`session.dmScope`: `main`（默认，所有 DM 共享）/`per-peer`/`per-channel-peer`/`per-account-channel-peer` 控制多用户隔离。
- **持久化**：转录为 **JSONL**，位于 `~/.openclaw/agents/<agentId>/sessions/`（路径解析见 `src/config/sessions/paths.ts`：`sessions.json` 索引 + `<sessionId>.jsonl`，sessionId 有严格字符校验）；旧 `sessions.json` 行存储迁移到 **sqlite**（`node:sqlite` + kysely；`src/infra/sqlite-wal.ts`、`src/infra/state-migrations.*.ts` 可见大量迁移脚本）。schema 版本化记录在根 `package.json`：`openclaw.schemaVersions: { state: 6, agent: 17 }`。
- **写一致性**（`docs/concepts/agent-loop.md`）：每个被准入的 run 记录持久化 `activeWriterRunId` 声明；每次转录追加/改写都要带 `expectedWriterRunId`，同步提交事务校验声明仍有效——被取代的 run 无法提交过期转录。SQLite writer queue 按 agent 排序变更，state 目录级锁防止第二个 Gateway/`openclaw agent --local` 进程并发接管同一状态目录。
- **上下文管理**：compaction（`src/agents/embedded-agent-runner/compact*.ts`、`docs/concepts/compaction.md`）、session pruning、context-engine（`src/context-engine/`）。compaction 本身也走模型调用（compaction-session-agent），带安全超时、队列化与 successor 转录衔接。
- **多 agent**：`agents.entries.*` 可定义多个 agent（各自 model/workspace/绑定规则），消息按 binding 路由到不同 agent（`docs/concepts/multi-agent.md`、`src/agents/agent-scope*.ts`）；会话还可 spawn 子 agent（`accepted-session-spawn.ts`）。
- **记忆机制**（`docs/concepts/memory.md`）："模型只记得写进磁盘的东西，无隐藏状态"。工作区默认 `~/.openclaw/workspace`：
  - `USER.md`（用户画像/偏好，会话启动加载，小预算）；
  - `MEMORY.md`（长期记忆，启动加载）；
  - `memory/YYYY-MM-DD.md`（每日笔记，进索引供 `memory_search`/`memory_get`，不逐轮注入）；
  - `DREAMS.md`（dreaming 后台蒸馏的摘要，`docs/concepts/dreaming.md`）。
  - 向量检索：`extensions/memory-core`（内置）/`memory-lancedb`（LanceDB）+ `sqlite-vec`；embedding provider 由模型插件注册（如 `extensions/openai/memory-embedding-adapter.ts`）。

---

## 7. 扩展体系（extensions / skills / plugins）

- **发现**（`src/plugins/discovery.ts`）：扫描 bundled（`extensions/`）、workspace、全局目录、npm 包、bundle 根；清单为 `openclaw.plugin.json` 或 `package.json` 的 `openclaw` 字段：

```json
{ "openclaw": { "extensions": ["./index.ts"], "skills": ["skills/*.md"],
                "prompts": ["prompts/*.md"], "themes": ["themes/*.json"] } }
```

  未声明的资源类型回落到约定目录发现。入口文件扩展名 `.ts/.js/.mts/.cts/.mjs/.cjs`（运行时可直接吃 TS，源码树免构建）。
- **入口契约**：`definePluginEntry({ id, name, description, register(api) })`（`openclaw/plugin-sdk/plugin-entry`）。`api` 提供：`registerProvider`、`registerChannel`、`registerTool`/工具中间件、`registerHttpRoute`（挂 Gateway HTTP）、`registerMemoryEmbeddingProvider`、各类媒体生成 provider、`lifecycle.registerRuntimeLifecycle`、CLI 命令/子命令、harness（agent 运行时）、`registrationMode`（full vs 轻量）等。
- **安装来源**：bundled、npm、git、ClawHub（`src/plugins/clawhub.ts`、`install-*.ts` 系列）；已装插件索引、版本兼容（`satisfiesPluginApiRange`）与 doctor 诊断完备。
- **Skills**（`skills/`、`src/skills/`）：`SKILL.md` frontmatter（`name`/`description`/`metadata.openclaw.requires.bins`/`install` 安装配方）+ 正文指令；由 `src/skills/{discovery,loading,runtime,lifecycle}` 发现、校验依赖二进制、注入 agent 提示。技能是**纯文本 + 可选脚本**的极轻扩展面。
- **MCP**：`src/mcp/` + `@modelcontextprotocol/sdk`；agent bundle 的 MCP 装配/过滤/生命周期在 `src/agents/agent-bundle-mcp-*.ts`。
- **插件钩子清单**（`docs/concepts/agent-loop.md`，与代码一致）：`before_model_resolve`（确定性覆盖 provider/model）、`before_prompt_build`（注入上下文/收窄工具面）、`before_agent_reply`（插件可接管本轮返回合成回复）、`agent_end`、`before/after_compaction`、`before/after_tool_call`（拦截参数/结果，`block:true` 为终结性）、`tool_result_persist`（写转录前同步变换工具结果）、`message_received/sending/sent`、`session_start/end`、`gateway_start/stop`——agent 循环与消息管线的每个缝都有明确的拦截点。

---

## 8. 认证与隐私

- **无专有认证**：全部 BYOK。模型凭据 = 用户自己的 API key（env/config）或用户自己的 OAuth 账号（OpenAI ChatGPT、Anthropic、GitHub Copilot 的 OAuth/device-code 流程都在 `extensions/openai/openai-chatgpt-oauth*.ts` 等处，纯客户端流程）。`SecretInput = string | SecretRef`（`src/config/types.secrets.ts:23`），SecretRef 支持 env/file/外部 secret provider（vault、1password 扩展）。auth profile 有完整资格性/解析语义（`docs/auth-credential-semantics.md`：过期、SecretRef 未解析、probe reasonCode 等）。
- **Gateway 鉴权**：共享密钥 token/password、Tailscale Serve、trusted-proxy、`none`（仅限私有入站）；设备配对 + challenge 签名（`docs/concepts/architecture.md`、`docs/gateway/authentication.md`）。
- **遥测**：默认**无** analytics/上报——全仓未见 posthog/sentry/segment 之类。可观测性是**可选插件**：`extensions/diagnostics-otel`（OTLP/HTTP 出站，`docs/gateway/opentelemetry.md`）与 `extensions/diagnostics-prometheus`（走 Gateway 已鉴权路由）；日志有 redaction 配置（`logging` 配置段）。
- **仅有的默认外呼**：托管模型目录刷新 `https://catalog.openclaw.ai/models/v1/catalog.json`（`src/model-catalog/remote-refresh.ts:21`），可经 `models.catalogRefresh.enabled: false` 关闭或换镜像 URL；ClawHub 搜索为按需。另有 OpenAI 原生流量上的归因头（`originator`/`version`/`User-Agent`），文档明确**只发往官方端点，不发往通用兼容代理**（`docs/concepts/model-providers.md`）。
- 配置面：`OpenClawConfig`（`src/config/types.openclaw.ts:80`）含 `auth`、`env.vars`、`diagnostics`、`logging`、`security`、`wizard`（含 securityAcknowledgedAt）等段；状态目录可整体重定位（`OPENCLAW_STATE_DIR`/`OPENCLAW_CONFIG_PATH`/`OPENCLAW_HOME`，`openclaw.mjs:556-573`）。

---

## 9. 部署形态

- **本地 CLI/守护进程**：`npm install -g openclaw`；`openclaw onboard --install-daemon`（launchd/systemd）；`openclaw gateway` 前台运行。
- **Docker**（`Dockerfile`）：多阶段；基础镜像 node:24-bookworm(-slim) 按 SHA256 digest 钉死；`--build-arg OPENCLAW_EXTENSIONS="diagnostics-otel,matrix"` **按需选择捆绑插件**（`scripts/lib/docker-plugin-selection.mjs` 只抽取所选插件的 package.json 以优化层缓存）；产物为无构建工具、无源码的精简运行时镜像。阶段链：`workspace-deps`（依赖 manifest 提取，源码变更不击穿缓存层）→ `bun-binary`（从官方 bun 镜像直接拷二进制，避免 curl 下载）→ `build`（corepack pnpm + tsdown + 插件资产，`OPENCLAW_DOCKER_BUILD_SKIP_DTS=1` 默认跳过 d.ts 提速）→ bookworm-slim 运行时。
- **docker-compose.yml**：`openclaw-gateway`（`node dist/index.js gateway --bind lan --port 18789`）+ `openclaw-cli`（共享网络）；挂载 `~/.openclaw`（状态/配置）、workspace、`~/.config/openclaw`（auth profile secrets）；`OPENCLAW_STATE_DIR` 等容器内路径钉死防宿主 `.env` 泄漏；`cap_drop NET_RAW/NET_ADMIN`、`no-new-privileges`、healthcheck（`dist/docker-healthcheck.js`）、`host.docker.internal` 映射（方便容器内访问宿主 Ollama/LM Studio）。
- **fly.io**（`fly.toml` + `deploy/fly.private.toml`）：`node dist/index.js gateway --allow-unconfigured --port 3000 --bind lan`，持久卷挂 `/data`（`OPENCLAW_STATE_DIR=/data`）。
- **render**（`render.yaml`）：docker runtime + 1GB 持久盘，`OPENCLAW_GATEWAY_TOKEN` 自动生成。
- 远程访问首选 Tailscale/SSH 隧道，Gateway 默认只绑 loopback——**local-first** 部署哲学。

---

## 10. 对我们脱敏改造（通用 API agent）的可借鉴点

结合"Rust grok-build → 可配置任意 OpenAI-compatible 后端、BYOK、无专有认证/遥测/更新"的目标：

1. **两层 provider 抽象是最值得照搬的骨架**。传输适配层（按 `api` id 注册的 `ApiProvider { api, stream, streamSimple }`，`packages/ai/src/api-registry.ts`）与 provider 目录层（`ProviderPlugin { id, envVars, auth, catalog }`，`src/plugins/provider-plugin.types.ts:93`）彻底解耦。我们只需实现一个 `openai-completions` 传输适配器 + 配置驱动的 provider 条目，即可获得 OpenClaw 级别的 BYOK 能力；未来加 Anthropic/本地后端只是加适配器。
2. **配置 schema 直接可抄**：`ModelProviderConfig { baseUrl, apiKey: SecretInput, api, headers, authHeader, timeoutSeconds, models[] }` + `ModelDefinitionConfig { id, contextWindow, maxTokens, cost, input, reasoning, compat }`（`src/config/types.models.ts`）。要点：`apiKey` 支持 `${ENV}`/SecretRef 间接引用；模型级可覆盖 provider 的 `baseUrl`/`api`；`models.mode: "replace"` 允许完全摆脱内置目录。
3. **BYOK 认证声明化**：`createProviderApiKeyAuthMethod({ envVar, flagName, optionKey, promptMessage, defaultModel, applyConfig })` 用一个对象同时驱动 CLI flag、交互向导与 UI（`extensions/openai/openai-provider.ts:929`）。改造时把 grok-build 的专有认证替换为这种"env 变量 + 配置文件 + 可选交互提示"的声明式 auth method 即可；密钥轮换（`<P>_API_KEYS` 列表、仅限流时轮换）是低成本高价值的加分项。
4. **模型引用与切换语义**：`provider/model` 字符串 + `primary/fallbacks` + `modelPolicy.allow` 白名单 + 会话级钉住（user 选择严格不降级、config 默认可自动 failover）——这套语义（`docs/concepts/models.md`）比"单一 model 字段"健壮得多，且天然支持多后端灰度/降级。
5. **在线发现可选、离线兜底**：`GET {baseUrl}/models` 带 key 发现 + 静态 manifest 回落 + 401/403 归类为 `auth-rejected`（`extensions/openai/openai-provider.ts:278-343`）。我们应保留"发现失败不阻塞启动"的原则。
6. **脱敏清单（OpenClaw 已验证的做法）**：默认零遥测，可观测性做成 opt-in 插件（OTel/Prometheus 走标准协议与本地路由）；远程目录刷新有显式开关（`models.catalogRefresh.enabled`）——我们应直接删除或默认关闭任何回连；归因头一类的隐性标识只允许出现在用户明确选择的官方服务上（最好完全移除）；状态目录可整体重定位（`OPENCLAW_STATE_DIR` 模式 → 我们的 `AGENT_STATE_DIR`），便于容器化与隔离测试。
7. **扩展面分层**：插件（代码，`definePluginEntry` + manifest 发现）/ 技能（Markdown，`SKILL.md` frontmatter + 依赖二进制声明）/ MCP（标准协议）三层并存。技能层几乎零成本，适合快速扩充 agent 能力；`package.json` 内 `openclaw.extensions` 声明入口的做法让 monorepo 内每个扩展自包含。
8. **会话与记忆的可审计性**：JSONL 转录 + Markdown 记忆文件（`MEMORY.md`/`USER.md`/每日笔记），"无隐藏状态"——对通用 agent 是隐私卖点，也方便我们验证脱敏效果（所有落盘内容皆可 grep）。
9. **构建/发布**：单一 launcher（版本闸门 + help/version 快速路径，避免冷启动重加载）+ 打包后的 `dist/` 单入口；Docker 用 build-arg 选择插件子集、digest 钉基础镜像、非 root 运行、healthcheck 独立脚本——这套发布卫生可整体移植。
10. **暂不需要但值得留意的**：Gateway WS 协议（TypeBox schema-first + 多端 codegen）与 `ChannelPlugin` 适配器聚合模式（`src/channels/plugins/types.plugin.ts`）。若我们未来要把 agent 接入 IM 渠道或提供多客户端控制面，这是现成的最佳参考；当前改造可先不做。

---

### 附：快速导航（关键文件索引）

| 主题 | 路径 |
|---|---|
| 启动器/入口 | `openclaw.mjs`、`src/entry.ts` |
| 构建 | `tsdown.config.ts`、`scripts/build-all.mts`、`package.json` scripts |
| agent 循环 | `packages/agent-core/src/agent-loop.ts`、`src/agents/embedded-agent-runner/` |
| 传输适配 | `packages/ai/src/{api-registry.ts,providers/}`、`src/llm/stream.ts` |
| 模型配置 schema | `src/config/types.models.ts` |
| Provider 插件契约 | `src/plugins/provider-plugin.types.ts`、`extensions/openai/{index.ts,openai-provider.ts}` |
| 渠道契约 | `src/channels/plugins/types.plugin.ts`、`extensions/telegram/` |
| Gateway 协议 | `packages/gateway-protocol/`、`docs/concepts/architecture.md` |
| 会话/记忆 | `docs/concepts/{session,memory}.md`、`src/agents/sessions/`、`extensions/memory-core/` |
| 插件发现 | `src/plugins/discovery.ts`、`packages/plugin-sdk/` |
| 凭据语义 | `src/config/types.secrets.ts`、`docs/auth-credential-semantics.md` |
| 远程目录 | `src/model-catalog/remote-refresh.ts` |
| 部署 | `Dockerfile`、`docker-compose.yml`、`fly.toml`、`render.yaml` |
