# deepseek-harness 深度解析 07:LLM seam 与 provider 家族

一句话概述:dsh 的模型接入是一个"注册表 + 瀑布"的窄腰——`ctx.llm` 只定义消息/流词汇与 adapter 注册,`llm/stream` waterfall 是重试/回放/路由的唯一挂载点;旗舰路由 `deepseek-official` 用手写直连 adapter,广度路由交给 pi-ai 库适配器,重试策略由 provider 携带、由独立插件在 agent 扩展点上执行。

> 路径均相对 `ref/deepseek-harness/packages/llm/`(另注明处)。与 `ref-analysis/SUMMARY.md` §2 的 pi/hermes/openclaw 对比见 §6。

---

## 1. llm seam:词汇、注册表与 `llm/stream`

### 1.1 Service Definition(`llm/src/index.ts`)

`LlmRuntime extends Service` 注册为 `ctx.llm`,本体是三张注册表:

| 注册表 | API | 语义 |
|---|---|---|
| adapter | `registerAdapter(providers: string[], adapter): AdapterRegistrationHandle` | provider 路由 → adapter 实例;重复路由抛 `DUPLICATE_ADAPTER`(all-or-nothing);handle 携带 `replace()` 做**同实例原子换路由**(先全量校验再同步换,请求看不到缝隙) |
| 可配置 provider 目录 | `registerConfigurableProviders(entries)` | 设置页/发现机制可见的路由清单,同样原子可换 |
| 模型发现 | `registerModelDiscovery(settingsNs, fn)` | 按设置命名空间挂发现函数,供草稿补全 |

`LlmAdapter` 抽象类只有一个必填方法 `stream(options: GenerateOptions): AsyncIterable<StreamChunk>`;其余全可选:`providerInfo()`、`providerRetryPolicy()`(**重试策略随路由注册被捕获**,是 provider 自带的事实)、`listModels()`(建议性,缺席不得变成拒绝请求的理由)、`resolveModel()`(精确模型元数据,独立于目录)。契约还要求每个 provider HTTP 请求带 `attributionHeaders()`(`llm/src/attribution.ts`:集中式 User-Agent 产品身份,版本从自身 package.json 读,禁止手抄)。

### 1.2 `llm/stream` waterfall

```ts
'llm/stream'(this: LlmRuntime, options: GenerateOptions,
             next: () => AsyncIterable<StreamChunk>): AsyncIterable<StreamChunk>
```

每次流式模型调用都过这道瀑布:调 `next()` 到达已解析 adapter 的流,或自己 yield chunk 短路(回放/缓存/路由替身都从这里挂)。事件注释钉了两条纪律:**agent 循环构建的请求**携带进程本地 `markAgentLoopRequest` 标记且深度冻结(内容是会话日志的纯函数——"可重构性"Agent Note),监听者只读不改;手写调用不带标记,但其消息本就遵守不可变构造契约。`test-support/llm-replay` 正是这道瀑布的消费者(快照测试的确定性重放 adapter)。

### 1.3 消息与流词汇

| 词汇 | 位置 | 形状 |
|---|---|---|
| `Message` | `llm/src/message.ts` | `role: 'system'\|'user'\|'assistant'` + `MessageId` + `MessageSource`;assistant 模型消息必带 `AssistantProvenance{ provider, model, replayState? }`;构造助手 `deepFreeze`,不可变 |
| `ContentBlock` | `llm/src/types.ts` | text / reasoning / image / tool-call / tool-result 五种 |
| `StreamChunk` | 同上 | `block-start` / `text-delta` / `reasoning-delta` / `tool-call-delta`(argumentsDelta 是**原始 JSON 字符串**)/ `block-end` / `usage` / `finish{ reason, replayState? }` |
| `FinishReason` | 同上 | stop / tool-calls / max-tokens / error(携带 `LlmFailure`) |
| `TokenUsage` | 同上 | **互斥计数**:inputTokens 不含 cacheRead;cacheRead/Write、reasoning 可选 |
| `BlockAssembler` | `llm/src/assembler.ts` | chunk → 完整块的组装器,工具执行与 token 计量共用 |

错误词汇 `LlmError extends HarnessError`:稳定机器码(`AUTH`、`RATE_LIMIT`、`MISSING_CREDENTIAL`、`TRANSPORT`、`EMPTY_RESPONSE`、`CONTEXT_WINDOW_EXCEEDED`、`QUOTA_EXCEEDED`……)+ 可序列化的 `LlmFailure` 事实(status 限 100-599、`providerRetryAfterMs`、`requestId`)。图 atlas 的数据佐证了这套词汇的地位:`LlmError` 入度 48,是全仓消费点前列——**实现可换,错误词汇稳定**。

### 1.4 请求形状与调用配置

`GenerateOptions`(`types.ts`)是一次模型请求的全量组装:`provider`(选 adapter 的路由)、`model`、`reasoningEffort?`、`messages`(provider 视角的有序会话,loop 构建的是派生历史)、`system?`、`tools?: ToolSchema[]`、`temperature?`、`maxTokens?`、`stop?`、`signal?`。`ToolSchema` 刻意声明在本包而非 dsh-tools——因为它是 `GenerateOptions` 的一部分,dsh-tools 与 dsh-system-prompt 反过来从这里导入。

`call-config.ts` 把"这次调用选了哪些字段"独立成 `LlmCallConfig{ provider, model, reasoningEffort?, temperature?, maxTokens?, stop? }`,并配 `LlmCallConfigAdapterDefaults`——标记 reasoningEffort/maxTokens 是**调用方提议的**还是**精确模型解析物化的**(adapter 默认值)。`callConfigEquals()` 做字段级相等比较,`prepared call` 机制(注册捕获的 config 与实际请求比对,不匹配抛 `INVALID_PREPARED_CALL`)靠它成立。`normalizeApiKey()`(`api-key.ts`)统一修剪/校验 key 形状;`assertNever`(`never.ts`)是封闭联合的穷尽性助手,但注释明确警告**不要**用于声明合并式联合(会话事件、内容块)——插件可以添加合法的未知变体。

### 1.5 重试策略词汇(`llm/src/retry-policy.ts`)

策略是 **provider 所有、按路由解析**的配置,不是全局设置:

- 模式 `normal`:只重试配置的瞬时码,默认 `retryableCodes = [EMPTY_RESPONSE, RATE_LIMIT, SERVER, TIMEOUT, TRANSPORT]`,`maxRetries` 默认 2;
- 模式 `always`:一切失败无限重试直到成功/取消/拆除;
- 退避默认:`initialDelayMs 500`、`maxDelayMs 10_000`、`jitterRatio 0.1`(对称抖动)。

执行者不在本包——见 §3。

### 1.6 消息构造纪律与预制备调用

消息不可变是构造期的事:`message.ts` 的 `createMessage`/`freezeMessage` 深冻结每条消息;assistant 模型消息的 `AssistantProvenance.replayState` 有严格的暴露规则——`LlmRuntime` 只在目标适配器**同时拥有**历史 provider 与目标 provider 路由时才交还它,防止 A 适配器的私有重放状态泄漏给 B。上下文消息另带一条**语义轴** `ContextForm`(`instructions`/`catalog`/`snapshot`/`notice`/`relay`/`recall`):`source.kind` 回答"谁生产的",`form` 回答"这是什么种类的东西",两轴刻意正交;词汇只表达语义不表达视觉,颜色图标折叠默认全是消费者的事。

封闭/开放联合的分支纪律由 `never.ts` 钉死:`assertNever` 只用于封闭核心联合(新增变体在每个处理点编译失败);声明合并的联合(会话事件、内容块)**必须** fall-through 未知变体,因为插件可以合法地添加新成员。

请求头状态(provider/model/reasoningEffort/采样值)被单列为 `LlmCallConfig`——这些字段影响缓存复用,所以 waterfall 替换它们时,循环**记录变更快照**而不是允许逐调用静默漂移;`callConfigEquals` 逐字段(含 `stop` 逐元素)判断"是真变更还是重述"。分发走制备流程:

```
LlmRuntime.prepareCall(config, signal)
  → 解析路由 + resolveModel(精确模型元数据)
  → PreparedLlmCall { config(深冻结,含适配器物化的默认值),
                      retryPolicy, context?, adapterDefaults, stream() }
```

`stream()` 只能分发一次(复用/配置不匹配抛 `INVALID_PREPARED_CALL`);`adapterDefaults` 记录哪些字段是适配器物化的而非调用方提议的。agent 循环的 `buildRequest`(`core/agent-loop/src/agent.ts:447-450`)先试 `prepareCall`,拿不到制备调用时回落裸 `ctx.llm.stream(request)`(345 行)——制备是优化路径,不是必经路径。

---

## 2. llm-deepseek:手写直连适配器(`llm-deepseek/src/`)

### 2.1 注册与凭据

插件 `apply()` 在 `ctx.llm` 上注册**唯一路由** `deepseek-official`(`PROVIDER` 常量)。凭据解析是每请求的:

```
DEFAULT_API_KEY_ENV = 'DEEPSEEK_API_KEY'
Config.apiKeyEnv → credentialRef(...)   // schemastery role: 'credential-ref'
```

`resolveApiKey()` 的顺序:`ctx.credentials.resolve(ref)`(凭据 seam 存在时,web Models 页写入的受管文档)→ 否则 `launchEnvironmentOf(ctx).get(ref)`(无 seam 时环境就是整个凭据平面)→ 否则抛 `LlmError('…store DEEPSEEK_API_KEY through the credentials service… or export it…', 'MISSING_CREDENTIAL')`。**缺 key 在请求时失败,不在插件加载时失败**。

连接事实(baseURL、目录、thinking 策略)同样每请求解析:`options()` 带 last-good 快照缓存,坏设置快照保留上一代并记一次错误——"请求永远不会把陈旧 endpoint 配新 key"。唯一在注册时捕获的事实是重试策略,它变化时**原地重注册路由**。`baseURL` 缺省 `PUBLIC_BASE_URL = 'https://api.deepseek.com'`,`DEEPSEEK_BASE_URL` 只从受信 launch-environment 层读。

### 2.2 Config 默认值(`index.ts` 的 `Config` schema)

| 字段 | 默认 | 说明 |
|---|---|---|
| `thinking` | 无(用 provider 默认) | `disabled` 把会话请求限到 off |
| `reasoningEffort` | `high` | `off`/`high`/`max` |
| `maxTokens` | `DEFAULT_MAX_TOKENS = 256_000` | 模型自身上限与显式请求值优先 |
| `defaultContextWindow` | `DEFAULT_CONTEXT_WINDOW = 1_000_000` | 精确值缺失时的容量 |
| `models` | `[deepseek-v4-flash, deepseek-v4-pro]` | 建议性目录 |
| `streamIdleTimeoutMs` | `DEFAULT_STREAM_IDLE_TIMEOUT_MS = 300_000` | 流读挂起时的 provider 空闲上限 |
| `retryPolicy` | 无(用常规默认) | provider 所有 |

`examples/acp-agent/cordis.yml` 的出厂组合是 `thinking: enabled, reasoningEffort: max`,并注释"full thinking at max effort on every request;exact-model resolution materializes request defaults before logging"(`serialize.ts` 的 `RequestDefaults`:精确模型解析把请求默认值物化进日志,重放才能逐字节复现)。

设置热更走 `installSettingsSection(ctx, NS, Config, entry, …)`:`cordis.yml` 条目配置垫在可选的 `llm-deepseek` 用户设置段之下(`ctx.settings`),`setSource` 把读取指针换成活文档;`ensureRegistrationFacts()` 在每次设置快照变化时比对 `retryPolicy`,不同就经 `registration.replace([PROVIDER])` **原地重注册**——路由集合不变、adapter 实例不变,只有注册时捕获的策略事实更新。`bundle/base/cordis.patch.yml` 的注释点明了这条链:`settings.yaml` 里的 `llm-deepseek:` 段无需重启即覆盖 adapter 条目,"这正是 web Models 页写入的东西"。

### 2.3 流事件翻译(`adapter.ts` + `translate.ts` + `sse.ts`)

`DeepSeekAdapter.stream()`:每次流调用解析一次连接+凭据并**冻结本次请求全程**(在途流用启动时的事实);fetch 直连 OpenAI 兼容端点,`accept: text/event-stream`;空闲看门狗到期抛 `STREAM_IDLE_TIMEOUT`。`translate()` 把 DeepSeek SSE 翻成 `StreamChunk`,三条纪律:

1. **block-end / usage / finish 全部推迟到 `[DONE]`**——兼容 finish 挂 usage 与尾随纯 usage 两种线形,且保证 `finish` 后绝无 chunk;
2. `mapFinishReason`:`stop`/`tool_calls`/`length` → stop/tool-calls/max-tokens,其余(content_filter 等)→ `{kind:'error', code: 大写原值}`;
3. `mapUsage` 修正 DeepSeek 语义:`prompt_tokens` **包含**缓存命中,harness 的 TokenUsage 是互斥计数,所以 `inputTokens = prompt_tokens - cacheRead`。

空初始 reasoning delta 不开块;`stop` 且无块是退化完成,映射为 `EMPTY_RESPONSE` 错误 finish 而非成功的空消息(该码在默认可重试码表里)。

---

## 3. llm-retry:agent 扩展点上的执行者(`llm-retry/src/`)

`llm-retry` 插件**没有配置**(`Config` 是空对象 schema,还主动拒绝 `retryPolicy` 键并附错误消息"retryPolicy belongs under each provider configuration")。它挂在 agent 循环的请求恢复扩展点 `agent/request-error` waterfall 上:

```
失败请求 → agent/request-error(req, next)
  → 按 req.provider 从 ctx.llm 取该路由的 ResolvedRetryPolicy
  → normal:码在 retryableCodes 且 retry ≤ maxRetries 才重试
  → always:无条件重试
  → localDelay():指数退避(2^n,指数封顶 1024)× 对称抖动,夹 maxDelayMs
  → 先写耐久事件,再 cancellableDelay(signal 可中断)
  → 成功后写 llm/retry-started,返回重试决定;否则 next() 交给下游
```

两条会话事件(`types.ts` 声明进 `SessionEventMap`)是回放安全的根基:`llm/retry`(等待**前**落盘:retryId、policyKey、retry 序号、delayMs、failure 事实)与 `llm/retry-started`(等待成功后、下次请求前)。

`recover()` 的三个实现细节值得拆开:

1. **重试计数从事件日志重建**:`findLast` 同 turn/step/provider/policyKey 的 `llm/retry` 事件取 `retry` 序号——重放后计数不靠内存而靠耐久日志,retryId 也沿用同一条事件的 id;
2. **provider 延迟的裁决**:`failure.providerRetryAfterMs` 有效且 ≤ `maxDelayMs` 时照用;超过上限时 `normal` 模式**放弃重试**交给下游,`always` 模式退回本地退避;
3. **`always` 先让下游**:`always` 模式先 `settleDownstream(next)`(下游决定或失败都被吞掉并记 warn),自己兜底——循环与插件生命周期保持打开直到委托恢复落定,中止信号在任何一方变更状态前获胜。

所有活跃等待在 `active` 集合里跟踪,`lifetime` AbortController 与每次调用的 signal 经 `AbortSignal.any` 融合;插件拆除时统一中止。

---

## 4. llm-pi-ai:广度适配器(`llm-pi-ai/src/`)

一个插件实例持有**一张路由字典**;每条路由两种出身:

- **目录路由**(pi-ai 内置 provider,如 `openai`/`anthropic`):继承该 provider 的端点、协议、模型目录作默认,配置可收窄目录、纠正容量(`models: [{id, contextWindow}]`)、覆盖凭据引用与重试策略;
- **手声明路由**(pi-ai 不认识,如 `acme-gateway`):必须给 `displayName`、`api`、`baseURL`、`models`,可选 `compat`。

`provider.ts` 的构造决策:目录路由且未覆盖协议 → **复用目录 provider 本体**(只换模型表)——因为目录 provider 持有本包无法重建的 API 实现(如 Bedrock 的 Smithy 懒加载模块);其余路由经 `createProvider` + 协议表构造,而协议表**刻意只有三行**:`openai-completions` / `openai-responses` / `anthropic-messages`。注释解释了窄的原因:Bedrock(SigV4)、Vertex(项目/位置/ADC)、Azure(api-version)、Codex(OAuth)的认证无法用这套配置形状表达,给出去就是"拿到一个不能认证的 provider"。

凭据从不进 pi-ai 的存储:harness 先经 `ctx.credentials` 解析,再作为 stream option 交入。

### 4.1 compat 表面:thinkingFormat 与 reasoningEfforts

`config.ts` 的 `PiAiCompatProfile` 只有两个字段,都关于推理方言:

- `thinkingFormat`:8 种线形白名单(`catalog.ts` 的 `THINKING_FORMAT_GATE`):`openai` / `deepseek` / `openrouter` / `together` / `zai` / `qwen` / `string-thinking` / `ant-ling`,provider 级默认、每模型覆盖;
- `reasoningEfforts`:级别 → 线形拼写的字典(如 `{off: '', high: 'high', max: 'ultra'}`),`off` 允许空值(什么都不发);`false` 表示该模型不支持推理;配置了级别但模型不支持时**发 none 而非报错**。

`stream.ts` 的 `toStreamChunks()` 把 pi-ai 的 `AssistantMessageEvent` 翻成 harness 词汇,差异点被显式补偿:pi-ai 的 tool-call 参数是**已解析对象**,harness 保持原始 JSON,这里重新序列化;pi-ai 把失败报为终结流事件,这里映射成 error finish;usage 的 reasoning 已被 pi-ai 折进 output,直接搬运。错误分类有一段诚实的 XXX 注释:pi-ai 上游把 Error 拍平成 `error.message` 丢弃 `cause` 链,本包只能文本模式匹配(401/403→AUTH、429→RATE_LIMIT、5xx→SERVER……),待上游转发原 Error 后改按 code/cause 分类。

### 4.2 模型发现(`discovery.ts`):目录路由零网络

`discoverModels()` 回答配置面的"fetch available models",路径二分:**pi-ai 目录收录的路由直接从目录回答,不发任何网络请求**(目录是这些 provider 的权威清单,且携带列表端点不会透露的容量);只有目录不认识的路由(网关、自托管)才走线上询问,且**只询问 OpenAI 兼容协议**——那是网关/自托管/官方端点唯一共同遵守的列表形状,其余协议直接报"无法询问",让配置面回落到手工录入而不是猜响应形状。两条路径都**不是目录刷新**:什么都不存储,请求携带用户正在编辑的草稿,回复只是供采纳的候选元数据,`settings.yaml` 仍是唯一决定路由服务什么的地方。发现请求也带 `attributionHeaders()`。

---

## 5. token-meter 与 model 配置

### 5.1 token-meter(`token-meter/src/`)

`ctx.tokenMeter`(`TokenMeter extends Service`)是**回放感知**的单一计量服务:每会话一份 `ReplayState`(WeakMap),对会话事件日志做增量 fold(`consumedEvents` 游标 + surface 树 + step 起点锚)——重放时从事件重建,不依赖任何运行时内存。`measure(session, requestHeader?)` 返回深度不可变的 `TokenMeasurement`:请求压力(以最近一次耐久路由请求为锚,`requestHeader` 只影响请求压力、不影响 surface)与表面 token 树。估计是字符级的(`estimate.ts`:内容/消息/header 各自估计 + `ROLE_OVERHEAD` 常量),provider 报告的真实 usage 优先;`usageTokens()` 把互斥桶相加且明确"不重复计 reasoning 输出"。服务向可选的 `ctx.sessionProjections` 注册三个投影:`tokenUsage`、`contextPressure`、`contextBreakdown`(web 端上下文压力条的数据源);无投影注册表的组合保留独立读取形状。它是 compaction 的压力源:`compaction-basic` 用 `meter.measure()` 对 `thresholdRatio` 判定(见 08 篇 §12)。

### 5.2 默认模型(`core/agent-default-model/`)

`ctx.agentDefaultModel`(`AgentDefaultModelConfig`)独立于任何 Host/传输地持有默认选择:设置命名空间 `agent-default-model`,schema `{provider: required, model: required, reasoningEffort?}`;组合条目无设置 provider 也可用,挂了设置则**活读**用户层(`source` 指针热替换,`onChange` 为空——消费者每次经 `currentSelection()` 现读)。出厂组合(`packages/bundle/base/cordis.patch.yml`):

```yaml
- id: agent-default-model
  config: { provider: deepseek-official, model: deepseek-v4-flash }
```

`core/agent/src/model-selection.ts` 的 `ModelSelection{ provider, model, reasoningEffort? }` 是 agent 创建时的消费形状。ACP 示例则显式 `provider: deepseek-official, model: deepseek-v4-pro`。

### 5.3 消费侧:agent 循环与无 key 回放

`ctx.llm` 的主消费者是 agent 循环(core/agent-loop):`buildRequest` 组装 `GenerateOptions` 并打上 `markAgentLoopRequest` 标记、深度冻结,经 `ctx.llm` 的 `llm/stream` 瀑布发出;工具执行消费 `BlockAssembler` 组装的 tool-call 块。这条路径上最特殊的消费者是 `test-support/llm-replay`:**无 key 的快照测试回放 adapter**——它从录制会话的 `assistant/chunk` 事件(与显式标记的本地压缩调用)派生出每会话一份的模型调用脚本,再按首次调用顺序把新活会话绑定到父/子脚本;抛错与挂起情形需要显式 override,因为会话日志本身重构不出它们。它挂在 `llm/stream` 瀑布上短路真实网络——这正是 §1.2 那条瀑布作为"重试/回放/路由唯一挂载点"的实证:回放不改 adapter、不改循环、不改词汇。

凭据侧补一句:`llm-deepseek`/`llm-pi-ai` 都经 `credentialRef()`(`packages/credentials`)把"环境变量名"变成受管引用;web Models 页只写受管文档 `$DSH_HOME/.credentials.yaml`,该文档**永不物化进进程环境**(`bundle/base/cordis.patch.yml` 注释)——这与 06 篇 subprocess 的 `SENSITIVE_ENV_PATTERN` 洗刷构成同一凭据纪律的两端。

---

## 6. 与 pi/openclaw 的 compat 路线对比

`ref-analysis/SUMMARY.md` §2 归纳 pi/openclaw 的做法:单一 `OpenAICompletionsCompat`/`ModelCompatConfig`,约 25 个能力位(`supportsDeveloperRole`、`maxTokensField`、`thinkingFormat` 11 种方言……),**按 baseUrl 自动探测 + 配置逐项覆盖**,工程纪律是"遇到不兼容优先加旗标而非 fork 适配器"。dsh 走了一条结构不同的路:

| 维度 | pi / openclaw | dsh |
|---|---|---|
| 兼容位载体 | 一个大的 compat 配置对象,全协议共享 | 拆进 seam 角色:adapter 自带方言知识(deepseek 的 prompt_tokens 缓存语义在 `translate.ts`;pi-ai 的 8 种 thinking 方言在 `catalog.ts`) |
| 探测 | baseUrl 自动探测 + 覆盖 | **无自动探测**;路由全部显式声明(cordis.yml / 设置文档) |
| 广度来源 | 自研 provider 目录(40+/55+) | 委托 pi-ai 库目录(目录路由复用其 provider 本体) |
| 重试 | 通常在 adapter/transport 内 | provider 携带策略词汇,独立插件在 agent 扩展点执行,耐久事件可回放 |
| 旗舰协议 | openai-completions 是覆盖面主力 | 同(`deepseek-official` 即 OpenAI 兼容),但旗舰是**手写直连**而非通用 compat 层 |

取舍清晰:dsh 用"每 seam 一个窄词汇 + 显式路由"换掉了自动探测的便利,得到的是每个方言差异都有具名代码位置可审计、可测试(逐文件覆盖率纪律);代价是新后端要么进 pi-ai 目录、要么手声明整条路由,没有"加一个旗标就通"的逃逸舱。SUMMARY §2.4 提到 pi 的 `samplingParams` 原样合并逃逸舱在 dsh 词汇里没有对应物——`GenerateOptions` 是封闭形状。

---

## 7. 小结

1. **窄腰是词汇不是实现**:`StreamChunk`/`Message`/`LlmError` 码是全局消费点,adapter 只是注册表里的可换件;
2. **每请求解析、注册时捕获最小化**:key/endpoint/目录每请求现读(last-good 缓存),唯一注册时事实(重试策略)变化即原地重注册;
3. **回放是一等公民**:请求深度冻结、`replayState` 随 finish chunk 与 assistant provenance 流转、重试先落盘再等待;
4. **方言知识有固定住址**:DeepSeek 语义在 `llm-deepseek/translate.ts`,pi-ai 支持的方言在 `llm-pi-ai/catalog.ts`,错误码分类在各自 adapter——不兼容不是配置问题,是代码位置问题;
5. **重试策略与执行分离**:provider 所有词汇(`retry-policy.ts`),`llm-retry` 所有执行,agent 循环所有扩展点(`agent/request-error`)。
