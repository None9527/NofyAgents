# deepseek-harness 深度解析 05:会话持久化

> 本篇拆解 dsh 的会话层:`core/session` 的 append-only 事件日志与 surface 投影、"model-visible ⟺ logged" 不变式、`session-persistence` 抽象与 sqlite/jsonl 两个后端、fork/resume、`session-query` 的 SQLite FTS 检索与导出、`session-title` 标题生成、`session-telemetry` 遥测(OTLP、默认 DISABLED)。论断以源码为准,路径相对 `ref/deepseek-harness/packages/`。

---

## 1. SessionEvent:append-only 日志与合并扩展

真相源是 `core/session/src/types.ts` 的 `SessionEvent`:

```
type SessionEvent<T> = {
  type: T
  seq: number            // 会话内单调,且恒等于 log.length(连续契约)
  time: number           // Unix 毫秒
  data: SessionEventMap[T]
  ignorable?: true       // 读者不认识 type 时能否安全跳过
  // 仅 SurfaceEventType 变体可有:
  sourceEventSeqs?: number[]
  surfaceOp?: SurfaceOp
}
```

三个设计点:

1. **proper discriminated union**:`switch (event.type)` 直接收窄 `event.data`,无需 cast。
2. **`seq = log.length` 连续契约**:全系统依赖它;seed 校验、fork、持久化都强制 seq 从 0 连续。
3. **`ignorable` 默认必需**:读者遇到不认识且无标记的 type **必须拒绝重建**,而不是静默丢弃——未识别的必需事件可能改变其余日志的解释。忘记标记的后果是"过度拒绝"(不便),而不是"静默恢复被掏空的会话"(错误)。

`SessionEventMap` 是**合并可扩展**接口:核心在 types.ts 声明 `turn/start`、`turn/end`、`step/start|end`、`user/message`、`assistant/chunk`、`assistant/message`、`tool/call`、`tool/result`、`todo/write`、`request/header`、`request/context`、`session/end-seed`;其他包用 `declare module '@deepseek-ai/dsh-session/types'` 追加——`agent/inbox/spliced`(core/agent)、`compaction/start|summary|end|prune`(compaction)、`approval/asked|decided|policy`(interaction/user-approval)、`session/title`(session-title)、`tool/code-dispatch*`(core/tools)。

`known-event-types.ts` 由 `scripts/gen-persistence-catalog.ts` 生成 `KNOWN_SESSION_EVENT_TYPES` 全集(约 40 个,从 `agent-preset/selected` 到 `web/deepseek-search-llm-request`):持久化读路径遇到集合外且非 `ignorable` 的 type 拒绝解释该日志(它很可能出自更新的 harness)。`TurnEndReason` 同样是合并可扩展 sum;后端 reload 关闭 crash 孤儿 turn 时写 `interrupted`。

**关系不变式伴侣**(core/session/src/invariant.ts,经 `dsh-invariants` 装载)在 append 之上做逐事件预提交校验,每会话一份折叠状态 `SessionTrace {lastSeq, openTurn, openStep, nextTurn, nextStep, pendingCalls}`:

| 检查 | 内容 |
|---|---|
| seq 严格递增 | `seq <= lastSeq` 即失败 |
| turn/step 嵌套 | `turn/start` 不得嵌套且必须等于 `nextTurn`;`turn/end` 必须匹配开 turn 且无开 step;`step/start` 必须在开 turn 内、等于 `nextStep`、不得嵌套 |
| 工具调用配对 | `tool/call` 把 callId 加入 `pendingCalls`;`tool/result` 必须命中同 step 内的先前 call(surface replace 例外,但不得在开 turn 之外) |
| turn 封闭性 | `todo/write`、`request/header`、`request/context` 必须在开 turn 内;`user/message` 不受限;`session/end-seed` 显式无约束(不平衡种子可合法位于开 turn 内) |
| 可扩展默认 | 合并扩展的事件关系归其所有插件,默认分支不检查 |
| 发布一致性 | `session/event` 到达发布而无匹配预提交校验即失败 |

校验与提交分离:`validateEvent` 只规划 `SessionTraceTransition`(标量 + pendingCalls 增删清),`applyTransition` 在事件真正入日志后应用——失败不会部分变更 trace。

**`SessionHeader`**(types.ts)是日志之外的不可变存储元数据:

| 字段 | 说明 |
|---|---|
| `version` | 创建时从 `SESSION_FORMAT_VERSION` 盖章,后端加载时强制 |
| `id` / `createdAt` | 身份 / 非负安全整数 Unix 毫秒 |
| `cwd` | 创建时的绝对工作目录 |
| `parentSession` / `seedLength` | fork 血缘 / seed 继承的前缀长度(区分父历史与子工作) |
| `origin` | 粗分类 `'subagent'`(呈现元数据,不是可继续性证明) |
| `delegationDepth` | 委派深度:顶层缺省(0),子 = 父+1;持久化使递归预算在重启/resume 后存活 |
| `agentPreset` | 组合该会话 agent 的 preset id;durable 因为 preset 决定工具与 prompt |

`Session.append`(index.ts:606-650)是唯一写入口:`snapshotJsonValue` 一趟完成读取+校验+拷贝(有状态 getter 无法对校验给一个值、对存储给另一个值);非无损 JSON(BigInt/function/symbol/undefined/-0/非有限数/环/稀疏数组/Map/Set/Date/类实例)直接抛错;`surfaceManager.validateNext` 校验表面契约;**禁止重入**(发布期间再 append 抛错);事件 deep-freeze 后入日志,观察者失败逐监听器隔离。热路径不阻塞 I/O——持久化插件异步缓冲。

### 活会话事件面(index.ts:36-90)

| 事件 | 模式 | 语义 |
|---|---|---|
| `session/created` | emit | 发布期创建通告;同步抛错否决并回滚(配对 disposed);派发中请求的 detach 被推迟 |
| `session/disposed` | emit | 已通告会话离开 store(含发布回滚)一次;创建通告未开始的条目永不 emit |
| `session/event` | emit | **post-commit 火线**:监听器快照在 log push 前解析,回调在 push 后执行;失败隔离,不使已提交的 append 失败 |
| `session/flush` | parallel | awaited 耐久性检查点:所有监听器都跑,调用方 await 全部,无 waterfall 否决 |

---

## 2. "model-visible ⟺ logged" 不变式与 surface 投影

docs/architecture.md:96:**"Model-visible means logged."** 任何到达模型请求的东西必须可从日志重建,且有运行时不变式断言。这就是"新模型可见输入需要新 session 事件"的原因:扩展 `SessionEventMap`,从日志渲染。

实现该不变式的是 `core/session/src/surface.ts`——日志之上"产生 LLM 消息的事件"的有序视图:

- **表面资格**:`SurfaceEventType = 'user/message' | 'assistant/message' | 'tool/result'` 三种;只有它们可携带 `surfaceOp` 与 `sourceEventSeqs`,编译器在 `Session.append` 调用点强制(非表面事件传 surface 元数据会被拒,`surfaceOpOf` 在 replay 边界同样拒绝)。
- **`SurfaceOp`**:`'append'` 或 `{op:'replace', start, end}`(按**表面位置**替换一段范围,start/end 必须是当前表面节点;compaction 用)。`assertProvenance` 要求替换节点的 `sourceEventSeqs` 完整覆盖被遮蔽节点。
- **折叠是 plan→apply 两段**:`planSurfaceEvent` 先校验(seq 连续、op 形状、provenance)产出未变更状态的 `SurfacePlan`,`applySurfacePlan` 才变更——失败不会部分污染表面。`foldSurface(events)`(surface.ts:387)供外部重建者对日志前缀做完整折叠;活会话由 `SurfaceManager`(surface.ts:398)增量维护,是表面接受与投影状态的唯一增量 owner。
- **tool/result 替换的额外约束**:`assertToolResultRewrite` 要求 tool/result 的表面替换**只能改 content**——除 content 外的字段与被替换节点深相等(JSON 意义),否则抛错。
- **单节点投影规则 `deriveEventMessage`**(surface.ts:83-115):`user/message` 原样投影(不加框架,framing 是生产者职责);`assistant/message` 空内容返回 null(它只为 max-tokens step 承载 usage,不能注入无内容 assistant 轮);`tool/result` 投影其 message;其余(边界、chunk、log-only)返回 null。

`Session.deriveMessages()`(index.ts:726-754)把该规则折叠到活表面:**带缓存**,每个表面节点只投影一次,O(新节点);`replaceGeneration`(单调的位置替换计数)变化时整体重建;返回每次都是新数组快照,但其中 `Message` 对象**共享且 deep-frozen**(复用已冻结的 durable 事件数据,无需二次深克隆)。

一个关键区分(surface.ts:42-56):**模型可见表面刻意遮蔽被替换的范围,因此它是人类转录的错误来源**——落地的替换会抹掉用户已看过的对话。`isAppendSurfaceEvent`(append-origin)才是人类转录的 durable 素材;替换副本只对模型可见。`agent-loop` 的 `RuntimeContextProjection` 就监听 `isReplacementSurfaceEvent` 判断保留的运行时上下文快照是否被压缩遮蔽。

`requestHeader()`(index.ts:670)是 `request/header` 的增量折叠:最新完整快照重建下一次请求的头部(`EpochHeader`:config+adapterDefaults+system+tools),冻结暴露,原地修改抛错;`request/context` 单独折叠路由元数据,不参与头部相等性。

### 通用投影单元:session-projection

surface/deriveMessages 是"模型可见"的专用投影;dsh 另有一条**通用投影缝** `session/session-projection`(`ctx.sessionProjections`),把"从日志折叠状态供客户端读"标准化:

- `SessionProjectionMap` 合并可扩展类型表(经 `session-projection/types` 出口供客户端聚合导入,不拖宿主 Context 合并);每个领域注册一个 `ProjectionDefinition{key, schema, init, apply, view, stateVersion}`——**三个纯同步函数加声明,永不是不透明 getter**;
- 框架(registry)**驱动**每个单元急切地走过已提交会话事件,拥有订阅、每会话 watermark 缓存与变更通知;领域宿主只贡献数学(init/apply/view),两侧互不知晓(能力缝三分);
- **whole-value 事件规则**(承重):携带状态的日志事件必须携带变更后的**完整状态**,永不发裸 delta——这使每个单元的转移平凡便宜、每个服务值自描述;
- `apply` 必须同步(异步单元会撕裂载体的一致性切面),state 必须是纯 JSON(持久化缓存前提);对不关心的事件**必须返回同一状态引用**(`Object.is` 相同引用产生零下游工作);
- `stateVersion` 是持久化缓存失效版本:序列化状态字段或折叠语义变化时 bump,使旧的 `(sessionId, key, ver, seq, val)` 缓存行被丢弃而不是前向应用成垃圾(缓存实现见 `session-projection-cache`)。

已见的注册单元都遵循该模式:`plan`(plan-mode 的 `{active, pending}` 双事件折叠)、`todo`(tool-todo)、`title`(session-title)、`sessionStats`(session-stats:全日志 turn/step 计数与 LLM/工具/首 token/解码墙钟时间——分页与 compaction 都改不了全日志数字)。这与 §6/§7 的"查询/标题/遥测都从日志折叠"互为表里:**投影是日志真相源之上的读模型,不是另一份状态**。

---

## 3. Session 与 SessionStore:发布、flush、fork

`Session`(index.ts:425)是 detached、构造时校验快照的对象(seed 与 `append` 同一套不变式校验,坏 seed 不能构造出"没有后端能存储"的活日志);`SessionStore extends Service`(index.ts:792,挂载 `ctx.sessions`)负责活实例:

- **三段发布**:`prepare`(校验 id/cwd,`Session.create`/`fromRestore`)→ `enter`(装模块私有发布钩子,返回幂等 detach;重复检查 id,预备过期的 session 不能覆盖活条目)→ `announce`(派发 `session/created`)。`SessionPreparation`(preparation.ts)是"未发布 Session 的所有权"包装,`Symbol.dispose` 幂等释放提供方状态(回缓存或丢弃)。
- **配对契约与 AgentRegistry 同构**:`session/created` 同步抛错否决发布并回滚,回滚路径 emit 配对的 `session/disposed`(创建通告未开始的条目永不 emit disposed,避免虚构生命周期边);`announcing` 期间请求的 detach 置 `detachRequested` 推迟到派发收尾,保证每个创建监听器看到同一活条目、析构严格晚于创建;`agent/disposed` 在 AgentLoop 的拆除序列里先于 `session/detach`,与这里的 `waitForDrainingConfiguredIdentity`(同 id 排空等待)配合。
- **`firstLiveSeq` 与 `session/end-seed`**:本进程 append 的第一个 seq = 构造 seed 长度;seed 历史不经 `session/event` 火线发布。有 seed 的会话在构造尾部 append log-only 的 `session/end-seed`(构造器是唯一合法写者;不变式伴侣刻意不约束它,插件伪造会把活历史误分类为 seed);读存储历史者找**最后一个**该标记——重开未动过的会话不重复打标,标记可能不在当前 `firstLiveSeq`。
- **`flush(session)`**(index.ts:1022):awaited `session/flush` 派发的**唯一入口**——一个 owner、一种拼写,作用域派发不变式可钉住它;消费者不得自行 `ctx.parallel('session/flush', …)`。
- **`fork(source, boundary?, childSessionId?)`**(index.ts:1081):从活源的稳定前缀建活子会话。`boundary` 是包含式 seq,缺省为源最后事件(空源 fork 空孩子);切片可在 turn 之间结束但**不能结束在打开的 turn 内**(`SessionForkError('OPEN_TURN')`)。子会话 header 带 `parentSession` 与 `seedLength`。错误码闭集:`SESSION_NOT_FOUND` / `SESSION_NOT_LIVE` / `SESSION_ALREADY_EXISTS` / `INVALID_BOUNDARY` / `OPEN_TURN`。

**resume** 走 `AgentRegistry.resume → AgentLoop.resumeWith`(core/agent-loop/src/index.ts):`persistence.prepare(id, fusedSignal)` 与调用方取消、owner fiber 卸载、工厂 teardown 三路 race(永不沉降的后端不能钉住身份),`SessionPreparation` 以 `seedSource:'persistence'` 走所有权转移路径(`RestoredSessionOptions`:新鲜 detached 事件/头部就地校验冻结),然后 `setupAndPublish(source:'resume')`。crash 尾部由 `repair.ts` 的 `interruptedTurnClosers` 修复:为未匹配的助手工具请求补合成错误结果(`TOOL_NOT_STARTED` = 未到记录的 call start;`TOOL_OUTCOME_UNKNOWN` = 已记录 call 无完成结果)、补开放的 `step/end`、以 `turn/end{kind:'interrupted'}` 收尾;seq 续接日志、时间戳复用最后真实事件;平衡或空日志不产事件。

---

## 4. session-persistence:抽象、版本与写路径

`session/session-persistence/src/index.ts` 定义 Service Definition `SessionPersistence extends Service`(挂载 `ctx.sessionPersistence`):后端把 `SessionEvent` 作为事件溯源日志存储,`SessionHeader` 单独携带。抽象方法面:

| 方法 | 契约 |
|---|---|
| `locate(meta)` | 不读/不建/不 flush 地解析后端工件位置;无每会话一工件的后端(如 SQLite)返回 undefined;路径是提示不是授权 |
| `supportsRawArtifacts` / `readRaw(id)` | 是否/逐字读后端自有工件原文(解码物理编码,保留 chunk 打包、键序、换行——不是从解析事件重建) |
| `create(meta)` / `append(id, events)` | `append` **仅在耐久后才 resolve** |
| `prepare(id, signal)` | 返回 `SessionPreparation`(加载+所有权转移) |
| `load(id)` / `inspect(id)` / `readFrom(id, fromSeq)` | 完整读 / 带取消 / 增量读;`load` 平衡完整中断尾但**不重写已提交事件** |
| `list()` / `listSnapshots()` | 头部列表 / 头部+`SessionPersistenceRevision`(branded 单调变更 token) |

**`SESSION_FORMAT_VERSION`**(core/session/src/types.ts:56)= **0**,单一单调整数、无 major/minor。规则:是否 bump 由**写者发射什么**决定,而非新读者能接受什么——仅当旧运行时无法再带完整语义正确处理新日志时才 bump("解析不报错"不等于正确;静默跳过塑造重建的内容就是错误读取)。只有结构性变化(header 形状、`SessionEvent` 信封、核心事件语义、surface 机制即 `SurfaceEventType` 集与 `SurfaceOp` 变体)达标;**新增普通事件类型不 bump**,由每事件 `ignorable` 覆盖词汇增长。存疑就 bump:近恒等的升级步几乎免费,漏 bump 让旧运行时静默错读。未发布期钉在 0:不暗示兼容、拒绝不兼容日志、无迁移。

写路径编排在 `coordinator.ts`:`PersistenceCoordinator`(第一方后端组合的后端无关写路径)、`SessionWriteBehind`(写后缓冲,`DEFAULT_WRITE_BATCH_MAX_DELAY_MS=200` 的批窗口)、`SessionPreparations`(预备会话池,`DEFAULT_PREPARED_SESSION_CACHE_SIZE=5`)。`PersistenceBackend` 接口以 `StoredPrefix<TornMarker>`/`StoredSuffix` 表达"已提交前缀 + 可追加后缀"的增量写模型,torn marker 标识撕裂尾。错误词汇:`SessionPersistenceCorruptionError`、`SessionFormatUnsupportedError`、`sessionFormatVersionRefusal`。

`SessionWriteBehind`(write-behind.ts)每活会话一个写控制器,拥有待写队列、固定批截止、在飞写、失败保留与显式静止屏障:

| 操作 | 语义 |
|---|---|
| `enqueue(event)` | `structuredClone` 拷贝入队(独立于生产者);队列从空变非空且自动路径未暂停时武装截止定时器;屏障期间只入队不武装 |
| `flush()` | 取消批等待,drain 到静止点;并发调用方加入同一 barrier;barrier 的耐久重试失败才 reject |
| `hasWork` | 有排队事件或在飞耐久写 |
| 后台失败 | 经 `reportBackgroundFailure` 观察,不 reject 生产者 |

协调器收养活会话时把 `session/event` 火线接到对应控制器;`automaticPaused` 支持收养切换期间的暂停/恢复。

**checkpoint 策略**(session-checkpoint-policy/src/index.ts)把持久化挂到模型/工具边界:`llm/stream` 包装器在请求首个 chunk 前 `await ctx.sessions.flush(session)`——**checkpoint 失败 fail-closed,阻止 adapter 分发**;顶层工具调用在 body 前 checkpoint 其记录的 call;下一请求边界 checkpoint 上一响应/结果批;嵌套工具分发复用 durable 外层调用。这解释了 `turn/end` 注释"循环不在 turn 边界等 flush":耐久性由 per-request checkpoint 拥有,`whenIdle()` 后读存储的消费者自行 flush。

### 两个后端

| 维度 | sqlite(`session-persistence-sqlite`) | jsonl(`session-persistence-jsonl`) |
|---|---|---|
| 布局 | 单库:`sessions` 元数据行 + `events` 与 `SessionEvent` 1:1 行 | 每会话一文件,首行 `type:'session'` header,余为事件行 |
| 版本 | `SCHEMA_VERSION=15`(表布局版本,正交于会话 `version`——后者版本事件词汇,存于 sessions 行);`APPLICATION_ID=0x44534850`('DSHP')保护无关库;空库按当前版本初始化,非空异版**拒绝而非原地迁移** | header 行带 `SESSION_FORMAT_VERSION`,加载强制 |
| 物化信号 | `sessions` 行**存在**即物化(首次 append 才写,懒物化);`incarnation`(物化时指定的稳定身份)+`revision`(每个变更事务递增) | 首次 append 才有文件 |
| 记录 | `EventRow`:`data` JSON 文本、`source_event_seqs`/`surface_op` JSON 编码、`ignorable` 1/null | header 行 + `packChunkRuns` chunk 打包 |
| 耐久模型 | 默认 WAL(ADR 记录的耐久模型);`delete/truncate/persist` 供网络挂载;排除 `memory/off`(静默放弃耐久与后端承诺矛盾) | `zstd` 或 `none`,后缀 `.jsonl.zstd`/`.jsonl` |
| crash 尾 | load 时按最后 `turn/end` 截断,**与 jsonl 同语义** | 截断修复偏移计算(format.ts) |

`SessionId` 是未校验的 branded string,jsonl 后端**必须先编码再入路径**(无穿越、无碰撞,format.ts)。

**chunk 打包**(core/session/src/chunk-rows.ts)是两后端共享的存储编码:provider 流式吐 token 级 delta,日志会存数百行信封远大于载荷的近似相同事件(真实 DeepSeek 会话上测得约 56×)。`packChunkRuns` 把连续同块 delta 运行打包成**一个存储行**(`text-chunks`/`reasoning-chunks`/`tool-call-chunks`,成员 k 由 `seq0+k` 与时间 gap 重建,gap 可为负);`decodeStorageRecord` 校验后展开,畸形行响亮失败。存储行是**durable 编码词汇而非会话事件**:不进 `Session.events`、无 `SessionEventMap` 条目、用无斜杠裸 type 标签防与事件分类混淆;编码器白名单精确形状,不认识的原样存储——未知字段丢压缩不丢数据。

---

## 5. session-query:SQLite FTS 检索与导出

`session-query/session-query/src/index.ts` 定义 `SessionQueryEngine extends Service`(挂载 `ctx.sessionQuery`,`static inject=['sessions']`):**live-preferred 统一查询**。精确读、过滤、trace 是后端无关的具体行为;后端实现全文观察、调和、排序、游标代与查询执行。抽象方法:`searchSessions`(查询文本+元数据过滤+分页+游标,按会话分组、按其最强匹配事件排序)、`searchEvents`(单会话内)、read(窗口上限 `SESSION_QUERY_READ_WINDOW_MAX`)、trace(血缘/事件观察)。语料经 `SessionCorpus`(`persistedInspectConcurrency` 控制持久会话并发检视);文档化构件:`buildSessionEventSearchDocuments`、`extractSessionEventText`、`compileSessionTextFilter`、`SessionSearchCursor`。

请求/结果词汇(types.ts)值得注意两点:

```
SessionSearchRequest {
  query: string               // 全文查询按"数据"解释,永不是可执行的 FTS 语法
  sessionFilters?             // 逻辑会话谓词,先于事件排序应用
  eventFilters?               // 事件谓词,先于事件排序应用
  limit?; cursor?             // 游标只对同一规范化请求有效
}
SessionSearchHit extends SessionRecord   // 命中会话 = 会话记录 + 最强匹配事件
```

- **查询注入安全**:`query` 一律按数据解释,不暴露 FTS 语法执行面;
- **过滤先于排序**:会话/事件谓词在排序前应用,排序只回答"匹配得多好",不回答"算不算数"。

`session-query-sqlite/src/index.ts` 是具体引擎:**SQLite FTS5 over live-preferred corpus**。两张 FTS5 虚表(schema.ts):`persisted_docs`(持久语料)与 `temp.live_docs`(活会话),均 `tokenize='unicode61'`,列含 `text, session_id, seq, type, time, surface, codepoint_length`。检索 `WHERE persisted_docs MATCH ?` / `WHERE live_docs MATCH ?`(index.ts:804,827),`highlight()` 用无碰撞标记 `FTS_HIGHLIGHT_START/END` 包裹命中,`makeSnippet` 截到 `snippetChars`(默认 240 Unicode 码点)。会话变更时删旧文档重插(index.ts:560-616),活会话文档进 temp 表——查询永远优先活状态。

**导出**:`session-query/session-log-export` 提供 Web 专属 `/export` 命令(src/index.ts,经 ApiProxy 拥有的宿主端点下载会话日志 ZIP,文件名 `dsh-session-<id>.zip`;不接受路径参数);`tool-session-query` 把查询能力暴露为模型工具,`operations.ts:275` 的五个操作:`executeSessionSearch`、`executeEventSearch`、`executeSessionTrace`、`executeEventTrace`、`executeEventRead`;workspace-access/service-boundary 分文件隔离权限与边界。

---

## 6. session-title:日志支撑的标题生成

`session/session-title/src/index.ts` 是 log-backed 标题服务 + 确定性回退 + provider 契约:

- **`session/title` log-only 事件**:`{title, messageSeqs, source}`;`messageSeqs` 是派生该标题的人类 `user/message` seq(用户显式改名时为空)。
- **`SessionTitleSource`**:`fallback`(内置确定性)/ `provider`(注册提供者,带可选 `SessionTitleModelProvenance{provider, model}`)/ `user`(显式改名,**钉住标题——自动生成停止调度**)。
- **`foldSessionTitle(events)`**(index.ts:191):last-wins 折叠最后一个 `session/title`,返回 `SessionTitleSnapshot`(title/messageSeqs/source + eventSeq/updatedAt)。
- **provider 契约**:`SessionTitleProvider` 接收 `SessionTitleProviderRequest`(含 `collectSessionTitleMessages` 收集的消息),返回 `SessionTitleProviderResult`;辅助模型调用前记录 `session/title-llm-request` 事件(精确的模型可见请求,session-title-llm)。具体策略两种:`session-title-first-prompt-llm`(首提示)、`session-title-all-prompts-llm`(全部提示)。
- **规范化与限额**(normalize.ts):`fallbackSessionTitle` / `normalizeSessionTitle` / `truncateTitleUtf8`;`Config` 限 `fallbackMaxWords` / `fallbackMaxBytes` / `maxTitleBytes`;接受非法标题抛 `SessionTitleInvalidError`。服务经 `isAgentLoopRequest` 区分主循环请求与辅助调用,并注册 session-projection 的 `title` 单元。

---

## 7. session-telemetry:捕获侧与 OTLP(默认 DISABLED)

`session/session-telemetry/src/index.ts` 是 **SessionTelemetryBackend Service Definition**,拥有会话事件上报的**捕获侧**——哪些记录存在(chunk 投影)、携带什么(逻辑记录)、何时捕获(adoption、每 append 火线、生命周期转发)、live vs on-demand 规范日志捕获、HMR 游标。`emit` 之后的批处理/重试/排队/丢失策略是上报 SDK 的领地,刻意不建模。

- **`SessionTelemetryRecord`**:`channel`(`ledger` 一对一镜像会话日志 / `ops` 携带无日志归宿的 `agent-error`、`shutdown`,刻意不带 `event.seq` 式身份以免误读为 ledger 行)、`time`(ledger = 源事件 append 时间,ops = 发射时间)、`severity`(捕获时预映射:工具结果 `isError`、`turn/end` error、`agent-error` 为 `error`,余默认 `info`,`warn` 留给策略与后端)、`attributes`(刻意最小:ledger 带 `session.id`/`event.type`/`event.seq` 及 header 可得的 cwd/parent/seed_length;可从 body 恢复的不重复)、`body`(事件 `data` 深拷贝,交接后永不 mutate)。
- **`session-telemetry/record` waterfall** 是脱敏扩展点:**不自带规则**;最内 `next()` 原样透传;无监听器时记录按捕获原样到达后端("导出数据恰好和部署挂载的规则一样干净")。同步在捕获热路径派发、在协调器容错内:**抛错的监听器扣留该一条记录(fail-closed)**,永不到达 agent 循环。脱敏只作用于导出副本,**规范会话日志永不重写**。
- **`SessionTelemetrySink`** 最小后端契约:`emit` 必须非阻塞入队(协调器从 `session/event` 热路径或显式规范日志捕获同步调用,慢于队列推送就会拖累循环);`flush?` 可选提示(多数后端应留空,让 SDK 批处理节奏 govern;OTel 后端正因并发 flush 与 shutdown drain 的交互风险而留空);`shutdown` 转发 fiber 析构,此前 emit 的一切必须仍被送达。

`session/session-telemetry-otel/src/index.ts` 是 OpenTelemetry 提供者:原样组合 OTel JS SDK——`LoggerProvider` + `BatchLogRecordProcessor` + OTLP/HTTP `OTLPLogExporter`,把每条记录映射到 `logger.emit()`;之后交给 SDK 文档化行为,经 `exporter`/`processor` 透传配置。本包只拥有捕获模式与外层 shutdown 截止(`shutdownTimeoutMillis`——SDK 的 export timeout 不约束其前置 `forceFlush()` 等待)。resource 用 `APP_IDENTITY` + 匿名用户 id;instrumentation scope 版本取自包自身 manifest。

**共享策略 `SessionTelemetryMode`**:`FULL` / `FEEDBACK_ONLY` / `DISABLED`;**`DEFAULT_TELEMETRY_MODE = DISABLED`**(本地、不共享;feedback 事件得到 "nothing will be shared, remains local" 警告)。上传模式在插件加载时校验 endpoint(`exporter.url` 必填)与 shutdown 截止;`DISABLED` 两者都不读;非规范日志中的反馈事件被忽略并警告。

---

## 8. 小结

- **日志是唯一真相源**:`SessionEvent` append-only、seq 连续、无损 JSON、deep-freeze、禁止重入;`SessionEventMap` 合并可扩展,`KNOWN_SESSION_EVENT_TYPES` + `ignorable` 共同守住"未识别必需事件拒绝重建"的读路径安全。
- **"model-visible ⟺ logged" 由 surface 机制落地**:仅三种事件类型可上表面,折叠 plan→apply 原子化,tool/result 替换只能改 content;`deriveEventMessage` 是单节点投影规则,`deriveMessages` 带缓存、`replaceGeneration` 触发重建;append-origin 与替换副本区分人类转录与模型可见。
- **持久化是抽象缝**:`SessionPersistence` 定义 `append 仅耐久后 resolve`、`load 不重写已提交事件` 等契约;`SESSION_FORMAT_VERSION=0` 钉住未发布期语义,bump 规则以写者为准;sqlite(WAL、行级 1:1、懒物化、SCHEMA_VERSION 15)与 jsonl(header 行 + chunk 打包 + zstd)给出同 crash 尾语义的两后端;per-request checkpoint 在模型/工具边界 fail-closed。
- **fork/resume 是纯日志操作**:fork 取稳定前缀(不得入打开的 turn)、记 `parentSession`/`seedLength`;resume 经 `SessionPreparation` 所有权转移,crash 尾由 `interruptedTurnClosers` 补合成边界(`interrupted` 结束原因)。
- **查询/标题/遥测都从日志折叠**:session-query 用 FTS5 live-preferred 双表检索,session-title last-wins 折叠 `session/title`,session-telemetry 捕获侧镜像日志、脱敏 fail-closed、OTLP 后端**默认 DISABLED**——三者印证"实现可换、词汇稳定"的 seam 模式。
