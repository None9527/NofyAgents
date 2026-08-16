# deepseek-harness 深度解析 03:Agent 运行时

> 本篇拆解 dsh 的 Agent 运行时:`core/agent` 的接口与活注册表、`core/agent-loop` 的工厂服务与默认驱动 `ReactLoopAgent`、turn/step 边界语义、Inbox 单入口、`agent/*` waterfall 扩展点、取消与错误恢复,以及 compaction/goal/plan/todo 如何挂到循环上。所有论断以源码为准,路径相对 `ref/deepseek-harness/packages/`。

---

## 1. 分层:词汇包与驱动包分离

dsh 把"Agent 是什么"和"Agent 怎么跑"拆成两个包,这是理解运行时的前提:

| 包 | 角色 | 关键产物 |
|---|---|---|
| `core/agent` | **词汇/契约包**(无实现) | `Agent` 接口、`AgentRegistry`(活注册表)、`Inbox`、`agent/*` 事件声明、`AgentCancelCause`、`foldConsumedWork` |
| `core/agent-loop` | **驱动包**(可替换实现) | `ReactLoopAgent`、`AgentLoop`(工厂+服务)、工具调度 `tool-calls.ts`、`RuntimeContextProjection` |

`core/agent/src/index.ts` 的 `AgentRegistry` 自己**不会创建** agent:它只持有一个由驱动包注册的 `AgentFactory`(`setFactory`,`index.ts:372`,重复注册抛错)。`create`/`resume` 通过 `Reflect.apply(target.createAgent, receiver, …)` 委托给工厂(`index.ts:405-431`),Service 背景的工厂经 `getTraceable` 重新绑定到调用方上下文,使所有权跟随调用者。图上的证据(00-graph-atlas §5):`ReactLoopAgent` 的上游入边只有 `AgentLoop.prepare` 和契约回归测试——**换循环实现只需换一个插件**,注册表与全部 `agent/*` 事件词汇不动。

`core/agent` 同时是**持久化词汇包**:`types.ts` 用 `declare module '@deepseek-ai/dsh-session/types'` 把 `agent/inbox/spliced` 合并进 `SessionEventMap`。运行时的"活"状态(队列、相位)不落日志,但队列的每次变更作为 durable 事件落日志——这是 §6 Inbox 一节的根基。

---

## 2. Agent 接口(runtime-types.ts)

`core/agent/src/runtime-types.ts` 定义公共句柄 `Agent`:

| 成员 | 类型 | 说明 |
|---|---|---|
| `id` | `SessionId` | 与 `session` 共享的唯一身份 |
| `options` | `AgentOptions` | `provider` / `model` / `maxTokens` |
| `session` | `Session` | 活会话,日志是 durable 真相源 |
| `inbox` | `Inbox` | agent 拥有的待处理工作投影 |
| `status` | `AgentStatus` | `'idle' \| 'running'`,每次跃迁镜像到 `agent/status` |
| `ctx` | `Context` | agent 作用域上下文,贡献 agent-local,析构回卷,析构后拒绝注册 |

方法面:`cancel(cause, options?)`、`whenIdle()`、`runMaintenance(task)`、`send(message, target, wakeup)`、`followup(message)`、`steer(message)`、`inject(message)`。

设计点:

- **`AgentStatus` 只有两态**。注释明确:`idle` = 无驱动活跃;`running` 从唤醒输入进入可取消的 pre-step 处理开始,持续到驱动排空、关闭或检查点 turn。析构不是第三个可观察状态,它把 agent 从注册表移除。
- **`send` 是通用入口**,`followup`/`steer`/`inject` 只是它的定参组合(§4)。`CancelOptions.keepInbox` 允许取消时保留队列与 steering 项:活动 turn 仍被中止,但未开始与 pending 的工作存活到后续 turn,且不记录 canceled inbox splice。
- `SessionStartSource = 'startup' | 'resume' | 'clear' | 'compact'`:seeded 创建是 `startup`,持久化加载是 `resume`。

`AgentCancelCause`(`core/session` 定义)是闭合枚举:`user` / `parent` / `hook(reason)` / `disposed`。它作为 `turn/end` 的 `aborted.reason` 落日志(durable 侧另有 `legacy` 覆盖无 cause 的导入),也是驱动内部 `AbortController` 的 reason。

---

## 3. 活注册表 AgentRegistry(core/agent/src/index.ts)

`AgentRegistry extends Service`(挂载为 `ctx.agents`),核心是一张 `Map<SessionId, AgentEntry>`:

```
interface AgentEntry {
  id: SessionId
  agent: Agent
  owner: Agent | undefined   // 运行时创建者,独立于 durable 会话血缘
  carrier: Scoped<Agent>     // 作用域派发载体(scopeTarget(agent, agent))
  announced / announcing / detachRequested: boolean
}
```

关键机制:

1. **`enter` / `announce` 两段式发布**(`index.ts:475-590`)。工厂先在未发布状态完成 setup,`enter` 只做插入(校验 `agent.id === agent.session.id`、id 碰撞是权威边界)并返回幂等 `detach` 闭包;`announce` 才派发 `agent/created`。同步监听器抛错**否决发布并回滚**;返回 promise 的 rejection 只被 `logger.warn`。`announcing` 期间请求的 detach 置 `detachRequested`,推迟到派发收尾执行,保证"创建→析构"严格配对且每个回调看到同一活条目。未 announce 就回滚的插入**不 emit disposed**(避免虚构生命周期边)。
2. **`register` = `enter`+`announce` 的便捷封装**,返回**精确的 Cordis effect disposer**——注释强调复合 effect 必须 yield 这个本体而非包装,否则 agent 会在最后一个 turn 还在排空时被提前注销并提前 emit `agent/disposed`。
3. **工厂创建的消费者拿到 `AgentHandle{agent, dispose()}`**:disposer 是**能力**,只有持有者能拆除该 agent;`ctx.agents.get(id)` 只返回裸 `Agent`。config 创建的 agent(loop 自启动)归 loop fiber 所有,无 handle。
4. **initiator 链**(`withInitiator` / `withoutInitiator` / `currentInitiator` / `requireInitiator`,`index.ts:309-358`)。两层 `AsyncLocalStorage` 携带"发起 agent",只做同进程因果归因:在场既非存活证明也非授权;主体与 owner 仍然显式。工具调度(`tool-calls.ts:67`)靠 `requireInitiator()` 拿到当前 agent。teardown 时拒绝新边界、drain 已返回 promise 的边界,发起本次 teardown 的嵌套链被排除在自己的 drain 之外。
5. **typert 集成**:构造时注册 `agent` lookup(host 类型 `Agent`,wire `agentId: SessionId`)与 host context 解析;并在根上注册 `ctx.agent` accessor(默认 `undefined`,`Agent.ctx` 以自有属性遮蔽),使普通插件上下文读取不触发 Cordis 未知属性抛错。
6. `list()` 全部活 agent;`roots()` 无运行时 owner 的顶层 agent(resume 的 fork 仍可是 root——运行时归属与 durable 血缘正交);`isOwnedBy(id, owner)` 判定运行时归属。

---

## 4. AgentLoop:工厂服务(core/agent-loop/src/index.ts)

`AgentLoop extends Service implements AgentFactory`(`static inject = ['agents','sessions','llm','tools','systemPrompt']`,挂载 `ctx.agentLoop`),是注册表背后唯一的工厂。要点:

- **Config**:`maxParallelToolCalls`(默认 `DEFAULT_MAX_PARALLEL_TOOL_CALLS = 10`,constants.ts;`1` 即串行)与 `agents[]`(声明式启动条目:`id` + `sessionId`/`resumeSessionId` 互斥 + provider/model/cwd)。`validateConfiguredAgents` 在任何 agent 启动前拒绝自含身份冲突。
- **launcher 身份**:`CONFIGURED_AGENT_IDENTITIES_KEY`——launcher 在任何 Loader 条目挂载前 `ctx.provide()` 固定 config agent 的会话身份,overlay 重指模型路由不能丢掉身份;`applyLauncherIdentities` 整体替换两个身份键。
- **settings 面**:`AGENT_LOOP_SETTINGS_NAMESPACE` 只暴露 `maxParallelToolCalls`(刻意不含 `agents`:它是启动期一次性组合数组,存下来的改动只会"看起来生效")。config 对象上的 getter 每次调度决策时读 settings 源——提交的新上限约束下一个工具组,不打扰在飞组。
- **声明式启动**:构造函数逐条处理 `agents`——新建(`create`)、`restoreOrCreateConfigured`(先 resume,仅当 `list()` 确认真不存在才回落首次创建;损坏与后端失败保持响亮)、resume(经 `ctx.inject(['sessionPersistence'])` 的 effect)。失败经 `agent-loop/config-start-failed` emit 告知身份绑定的消费者。
- **FactoryOwnership**:accepting 标志 + teardown `AbortController` + 活 agent dispose 集合 + 启动任务集合;`dispose()` 停止接受、abort(reason: "agent loop is not active")、等待全部 teardown 与启动任务。
- **`prepare()`**(index.ts:455 起)构造驱动与反向拆除:三路 abort 融合(调用方 signal、owner fiber 卸载、工厂 teardown)在**任何资源存在之前**注册到可变槽上;`dispose` 记忆化——"disposal 就是一次 disposed-cause cancel 加静止等待":`machine.cancel({kind:'disposed'})` → `whenIdle()` → `scope.dispose()` → detach agent/session。
- **`publish(source)`** 的顺序是发布契约:`sessions.enter` → `agents.enter`(owner = `ownerCtx.agent`)→ `sessions.announce` → `agents.announce` → emit `agent/session-start`,每步后 `assertLive()`(announce 的同步监听器可能已启动 teardown)。setup 只组合不驱动:回调是受信任的同进程代码,拿到完整作用域上下文。
- `raceAbort` / `raceAbortCall` 让加载/setup 与取消竞速,晚到的值经 `releaseAbandoned` 释放(如 `SessionPreparation[Symbol.dispose]`)。

---

## 5. ReactLoopAgent:逐方法拆解(core/agent-loop/src/agent.ts:63-495)

私有相位状态机驱动一切:

```
type Phase =
  | { kind:'idle'; lastTurn }
  | { kind:'maintenance'; abort; lastTurn; wakeRequested }
  | { kind:'running'; abort; turn; step; wakeRequested }
```

`status` getter:maintenance 与 idle 都对外呈现 `idle`(agent.ts:99-101)。

**构造与 setPhase**:构造函数(80-97)用 `agentEvents(loopCtx, this)` 构建**融合派发器**(热路径零分配);以三个通知回调建 `Inbox`(inserted/discarded/claimed 映射到 `agent/inbox/*` emit);从日志 `findLast('turn/start')` 恢复 `lastTurn`;`createScope` + `ctx.extend({agent:this})` 建作用域;建 `RuntimeContextProjection`(§8)。`setPhase(next)`(104-111)提交相位,仅当对外可见状态变化才 emit `agent/status`。

**输入三入口**:

| 方法 | 实现 | 语义 |
|---|---|---|
| `followup(m)` | `send(m, 'next-turn', true)` | 排队普通后续 turn,唤醒驱动;该项成为其 turn 的唯一普通消息 |
| `steer(m)` | `send(m, 'next-step', true)` | 最近 step 边界消费;idle 驱动则启动 turn |
| `inject(m)` | `send(m, 'next-step', false)` | 注入模型可见上下文,**不唤醒**;可能错过已领取批次的请求 |

`send(message, target, wakeup)`(113-120):先在插入前捕获 `wakingAfterAbort`(非 idle 且当前 abort 已触发),防止 splice 观察者重入 cancel 改变分类;中止后的唤醒强制 target 为 `next-turn`;`inbox.splice(target, Infinity, 0, [message])` 追加;`wakeup` 则 `wakeDriver(wakingAfterAbort)`。这就是 **wake/injected 区分**:steer 与 inject 同写 `next-step`,唯一差别是 `wakeup`。

**wakeDriver / whenIdle**:`wakeDriver`(172-193)非 idle 时只锁存 `wakeRequested`(maintenance 或中止后唤醒;`disposed` cause 不锁存——teardown 不等待模型 turn);idle 时置 running(`turn=lastTurn`、`step=0`)、`activityDone` 换 promise,在 `agents.withInitiator(this, …)` 内调 `kick()`。`whenIdle()`(195-200)循环 await `activityDone` 直到引用稳定。

**kick / turn / preStep**:`kick()`(210-223)`while (await this.turn()) {}`,失败与取消在驱动边界被吞;finally 落回 idle 并按需重放唤醒。`turn()`(245-330):

1. `turn = phase.turn + 1`,append `turn/start`(失败经 `throwError`);
2. 内层循环:`step = phase.step + 1`,`preStep(target, {turn, step})`;
3. **reject** → `turnEnds={kind:'blocked'}`,return false(claimed 批次保持已移除,turn 不花 step);
4. 首个 enter 但 messages 空 → `turnEnds={kind:'completed'}`,return false(拥有初始 turn 边界但不花模型调用);
5. append `step/start`;`decision.messages` 逐条 append `user/message`(`surfaceOp:'append'`);
6. `stepEnd = await step(assembly)`;**max-tokens 粘性**——后续 completed 不降级 turn 结果;
7. `step/end`(finally);若 `turnEnds` 且 `nextStep` 空 → `dispatch.serial('agent/turn-stopping')` → 再判一次 → break;否则 `target='next-step'` 继续;
8. catch:已中止 → `aborted(reason)` 并重抛;否则结构化 error(`LlmError.failure` 原样,其余 `errorChain` 拍平为 `UNKNOWN`);
9. finally append `turn/end`;若 `inbox.hasPending` → 换新 `AbortController`、`step=0`、return true(**同一驱动开下一个 turn**)。

`preStep`(225-243):`inbox.claim(target, turn)` → `systemPrompt.assemble(assembleContextFor(this, signal))` → `renderContextSections` + `runtimeContext.project` 得可能的上下文快照消息 → `agent/pre-step` waterfall(默认 enter `[...claimed, context?]`)。

**step 与 buildRequest**:`step(assembly)`(332-401)`renderPrompt` 得 system;循环内 `buildRequest` → `BlockAssembler` 聚合流,每 chunk append `assistant/chunk`;finish 为 error/aborted → `agent/request-error` waterfall,非 retry 抛 `LlmError`;成功 → `createAssistantMessage` + append `assistant/message`(带 `usage`,`sourceEventSeqs=chunkSeqs`);max-tokens 直接返回;无 tool-call → completed;有则 `executeToolCalls`,`concluded` 决定 completed/null(null = 工具欠另一个请求)。

`buildRequest`(407-495):首请求用声明路由(仅恢复该精确模型拥有的显式 effort);其后用 `requestProposal(persistedHeader)`(剥掉 `adapterDefaults` 标记的字段);`agent/request` waterfall 得 proposedConfig(缺 provider/model 抛错);`llm.prepareCall` 解析精确模型默认(`NO_ADAPTER` 退回 proposed——中间件可服务未注册路由);`canonicalHeader` 冻结后按 `headerEquals` 决定 append `request/header`(reason `initial`/`resume`/`change`);路由/容量变化 append `request/context`;最终 `markAgentLoopRequest(deepFreeze({…config, messages: deriveMessages(), system, tools, sessionId, signal}))`。

**cancel / runMaintenance**:`cancel(cause, options)`(134-140)除非 `keepInbox` 先 `inbox.clear()` 并清 `wakeRequested`,非 idle 则 `phase.abort.abort(cause)`;第一个 cause 对该活动生效,无活动时 no-op。`runMaintenance(task)`(142-162)仅 idle 可调(否则抛 "already has active work"):任务在声明相位后**同步开始**,期间唤醒输入留在 inbox、公共 status 保持 idle;finally 回 idle,`wakeRequested && hasPending` 则 `wakeDriver()`。这是 compaction `compactNow` 借用的通道。

---

## 6. Inbox:单入口与 durable 投影(core/agent/inbox.ts)

`Inbox` 是 replay-once 增量投影,私有状态只有两条有序列表:`{ 'next-turn': UserMessage[]; 'next-step': UserMessage[] }`。构造函数从 `session.events.slice(header.seedLength ?? 0)` 重放 `agent/inbox/spliced` 重建状态——**队列真相在日志里**,活投影是缓存;持久化的非法 splice 在构造时抛错(带 seq)。图上 `Inbox` 入度 34(00-graph-atlas §3),是循环事实上的唯一输入口。

| 方法 | 行为 |
|---|---|
| `claim(target, turn)` | 取走**全部** `next-step`,target 为 `next-turn` 时再取一条 `next-turn`;逐条 `claimed` 通知;durable splice 是纯删除 |
| `append` / `prepend` | 尾部/头部插入,落 durable |
| `replace(id, new)` | 原位替换(可换身份);旧消息 discarded、新消息 inserted;不在 pending 返回 false |
| `remove(id)` / `clear()` | 删除一条 / 先清 next-step 再清 next-turn |
| `splice(target,start,del,ins)` | 标准 splice 语义,规范化后落日志 |

不变式由 `validate`(200-218)强制:坐标合法;**两条列表的消息 id 全局唯一**。`mutate`(157-196)的顺序契约:**durable 事件先提交,活投影后变更**——同步 `session/event` 观察者看到 splice 前的列表,可从规范化坐标重建被移除消息。`discardRemoved && removed>0` 时置 `outcome:'canceled'`,`foldConsumedWork`(consumed-work.ts)据此区分"turn 领走输入"与"工作未运行就被丢弃"。`InboxNotifications` 由 `ReactLoopAgent` 接线成三个 emit——Inbox 本身不知道事件,只报告事实。

---

## 7. agent/* 事件面:waterfall / serial / emit

`runtime-types.ts` 经 `declare module '@deepseek-ai/cordis'` 声明全部 `agent/*` 事件,派发全部经 `dispatch.ts` 的融合派发器 `agentEvents`(emit 逐监听器容错;serial/waterfall 委托 Cordis mixin;`AgentSubjectEvent` 在编译期筛出 payload 带 agent 且 `this` 为 `Scoped<Agent>` 的事件,scope key 与 payload agent 不可分叉)。

| 事件 | 模式 | 语义 |
|---|---|---|
| `agent/created` / `agent/disposed` | emit | 发布/离开注册表(配对);同步失败否决发布 |
| `agent/status` | emit | idle⇄running 跃迁,载荷带目标状态 |
| `agent/inbox/inserted` / `claimed` / `discarded` | emit | claimed 带 owning turn;被拒 step 的 claimed 消息在此终结——不 discarded 也不重发 |
| `agent/session-start` | emit | 首个 turn 前一次;通知非否决;用 `agent.inject()` 播种上下文 |
| `agent/pre-step` | **waterfall** | 拒绝进入或替换进入消息;`next()` 保留现状 |
| `agent/request` | **waterfall** | 替换冻结调用配置;**不能改消息**——模型可见内容必须走 logged 通道 |
| `agent/request-error` | **waterfall** | 返回 `{kind:'retry'}` 接管恢复或 `next()` 委托;默认 undefined = 失败终结 |
| `agent/turn-stopping` | **serial**(无 next) | turn 将关闭(模型不欠响应)前被 await |
| `agent/error` | emit | step/turn 出错;即使错误无 durable 位置也在此报告 |

`agent/turn-stopping` 是**数据决策**:反对者调 `agent.steer(…)`,机器重读 inbox——有新 steering 再跑一个 step,没有就关 turn;监听器顺序不能改变结果。反向控制(提前停工具循环)也是数据:工具结果带 `concludesTurn` 在该 step 结束 turn,但不短路已提交的 next-step 工作(同 step `additionalContexts` 或竞速 steering 仍会跑)。与 docs/architecture.md:84 对账:`agent/pre-step`、`agent/request` 与三个 `tools/*` 是 waterfall,`agent/turn-stopping` 是 serial,一致。

---

## 8. turn/step 语义与文档对账

docs/architecture.md:65:**step = 一次模型请求 + 它调用的工具;turn = 零或多个 step**,在领取首个输入前打开,不再欠任何东西时关闭。逐条对账:

| 文档断言 | 源码位置 | 结论 |
|---|---|---|
| turn 在 claim 前打开 | `turn()` 先 append `turn/start` 再 `preStep`(agent.ts:252-258) | ✅ |
| claim "next-step 输入 + 一条排队消息" | `claim('next-turn')` 取全部 next-step + 一条 next-turn(inbox.ts:71-78) | ✅ |
| reject 或首个 enter 改写为空 → 关 turn 不花 step | agent.ts:261-270(分别 `blocked`/`completed`) | ✅ |
| 工具欠请求或 next-step 到达 → 下一 step | `step()` 返回 null / `target='next-step'`(agent.ts:299-300) | ✅ |
| `turn/*`、`step/*`、`user/message`、`assistant/*`、`tool/*` 是 durable 事件 | 均经 `Session.append` | ✅ |

`TurnEndReason`(core/session/types.ts)合并可扩展:`completed` / `aborted(reason)` / `blocked` / `error(LlmFailure)` / `max-tokens` / `interrupted`(后端 reload 关闭 crash 孤儿 turn,循环永不发出)。

**与文档不一致处以源码为准**:docs/agent-lifecycle.md 时序图把 `agent/request-error` 画在 `step/end` 之后;源码里它在 `step()` 内部、`step/end`(由 `turn()` 的 finally append)**之前**派发(agent.ts:354-371 vs 291-293)——错误恢复发生在 step 未关闭时,retry 在同 step 内 `continue` 重新 buildRequest。另一处文档未画出的事实:一个 driver 可以在 `kick` 内连续开多个 turn(`turn()` 末尾 `inbox.hasPending` 时返回 true,换新 abort 控制器继续)。

---

## 9. RuntimeContextProjection:动态上下文的 durable 差分

`agent-loop/src/runtime-context.ts` 解决"动态运行时上下文(如 todo/plan 快照)如何进模型又不刷屏":

- 所有权:source 为 `{kind:'plugin', plugin:'@deepseek-ai/dsh-system-prompt'}` 的 `user/message`;
- 构造时从尾部扫描恢复最后保留快照(仅认表面上的节点),随后监听 `session/event`:新的自有消息更新保留值;`isReplacementSurfaceEvent` 且 `sourceEventSeqs` 覆盖保留 seq(被压缩遮蔽)则置 null;
- `project(current, sections)` 仅当渲染文本与保留值不同才产出**未提交**候选消息;空上下文产出固定 `CLEARED` 文本("Earlier runtime-context snapshots no longer apply");
- 候选由 `preStep` 追加进 enter 决策的 messages——因此快照更新走正常 logged 通道,符合 §7 的"模型可见必须 logged"。

---

## 10. 工具调度:step 内的并行/屏障(core/agent-loop/src/tool-calls.ts)

`executeToolCalls(ctx, turn, step, toolCalls, signal, acceptContext)`(59-101):

- `ctx.agents.requireInitiator()` 取 agent;每个 block 解析成 `PlannedCall`(参数 JSON.parse,坏 JSON 保留原文,空输入映射 `{}`);
- 按**活并发模式**分组:`ctx.tools.executionMode(exec).kind` 为 parallel 取剩余全部,否则单个屏障;**分组前重新分类**,注册表变更影响未启动调用;
- `runGroup`(121-246):并行组用有界滚动池(上限 `ctx.agentLoop.config.maxParallelToolCalls`),exclusive 独占并构成排序屏障;派发可重叠,**策略、结果、结果上下文保持模型顺序**(`commitReady` 只在连续模型顺序槽推进,经 `finalize`/`finish`);
- 启动即 append `tool/call`(记 seq),结果 append `tool/result` 以 `sourceEventSeqs:[callSeq]` 回指,`meta` 持久化呈现载荷;
- **中止**:停止补充、排空已启动、为未启动调用记合成错误结果(`TOOL_ABORTED_BEFORE_DISPATCH`)保 replay 有效;调度器内部失败保留已记录 `tool/call`、不伪造结果;
- `additionalContexts` 经 `acceptContext` 进 next-step inbox(机器在 step 边界暂存),`concludesTurn` 聚合为 `concluded`。

---

## 11. 取消与错误恢复

取消是 cause 化 + 信号化的:`cancel(cause)` → `phase.abort.abort(cause)`,turn 的 catch 把 `signal.reason` 落为 `turn/end` 的 `aborted.reason`。`send` 对"中止后唤醒"重分类(强制 next-turn),配合 **cancel-convergence wake latch**(runtime-types.ts `send` 注释):idle 时提交的 wake 总打开其 turn 边界,即便消息在领取前被清除;仅当队列不再有该 wake 时才抑制锁存重放。

错误恢复两层:

1. **请求级**:`step()` 内 finish error/aborted → `agent/request-error`(载荷含 provider、failure、retryPolicy、signal);返回 `{kind:'retry'}` 同 step 重试,否则抛 `LlmError`。失败一律结构化:`LlmError` 保留事实,其余 `errorChain` → `UNKNOWN`。
2. **turn 级**:非中止异常 → `turnEnds={kind:'error'}`;`throwError`(202-208)先 emit `agent/error` 再抛,`kick()` 在驱动边界吞掉。

`foldConsumedWork`(consumed-work.ts:68)单遍折叠日志回答"消费的工作怎么记账":进入过模型 step 的 turn、或领取输入后失败/被停/被拒的 turn 算记账(`accountsForClaim`:completed 不算,blocked/aborted/interrupted/error 算);`droppedUnrun` 记录任何 turn 打开前就被取消丢掉的输入。所有输入都是日志本身——任何人发出的取消(owner teardown、祖先 interrupt、卸载插件)读到同一份账。

模型切换的循环挂法可参考 `model-selection.ts` 的 `installModelSelection(agentCtx, selection)`:在 `system-prompt/assemble` waterfall 里快照选择并注入 provider/model 变量,在 `agent/request` waterfall 里把**组装时快照**的选择套用到请求配置——并发切换在后续 step 生效,不会把 prompt 与请求两个面劈开。

---

## 12. compaction 能力:compactNow 唤醒链

compaction 是能力缝(compaction/compaction 定义词汇与 `CompactionEngine` 抽象,compaction/compaction-basic 提供后端),三个挂点:

1. **`agent/pre-step`(压力触发)**:`_registerAutomaticCompaction` 在 pre-step waterfall 调 `compactIfNeeded(agent,'pressure',signal)`:`tokenMeter.measure` 度量,先解析路由模型容量(`resolveModelInfo`),超 `thresholdRatio` 阈值 → 可选 `toolResultPruner.pruneSession` 模型无关剪枝 → 重测 → `selectCompactableRange(retainTokens)` → `compactRegion`;循环最多 `compactionRetries+1` 次,仍超阈值抛错。失败只 warn 继续 turn;`TargetPressureConfigError` 每 target 只 warn 一次。
2. **`agent/request-error`(溢出恢复)**:仅 `failure.code === CONTEXT_WINDOW_EXCEEDED_CODE` 且未中止;overflow 绕过阈值与保留尾策略强制一次有用缩减。**只有 `surface.replaceGeneration` 前进**(确有 durable 替换进展)才返回 `{kind:'retry'}`,否则保留原请求错误;`overflowRetries` 按 agent 计数受 `maxOverflowRetries` 限,`agent/status→idle` 或成功 `assistant/message` 重置序列。
3. **`compactNow`(手动,真 idle)**:包在 `agent.runMaintenance(…)` 里;`selectCompactableRange(…, retainTokens=0)`,`compactSurfaceRegion` 以 `{owner:null, stability:'selected-span'}` 落 `compaction/start|summary|end`,`flush` 回调 `ctx.sessions.flush(session)` 使独立标记对耐久。非 idle 调用抛 `ManualCompactionError('busy')`,维护中被取消抛 `'cancelled'`。

图上的 proc_2(00-graph-atlas §4)8 步链与源码吻合:`compactNow → runMaintenance → wakeDriver → kick → turn → preStep → claim(Inbox) → claimed`。`compaction/*` 事件 log-only(无 surfaceOp),表面替换由紧随的 `user/message` 承载(compaction/src/types.ts 的邻接契约)。

---

## 13. goal / plan / todo 如何挂在循环上

三者都不是循环的一部分,通过事件与 inbox 挂入:

| 能力 | 包 | 挂点 |
|---|---|---|
| **goal** | `goal/goal-round-driver` | `agent.followup(message)` 排入一轮目标提示(source `{kind:'goal',goalId,revision,round}`,index.ts:192);`agent/pre-step` 监听器(349)校验预约仍有效(goal active/armed、round == roundsStarted+1、内容一致),失效则 `restoreOtherClaimed` 把同批其他消息送回并返回 `{kind:'reject'}`;达 `maxGoalRounds` 时 `ctx.goals.block(…,'round-limit')` |
| **plan** | `plan/plan-mode` | 状态从日志 `plan/mode` 折叠(last-wins),resume/fork 无需活镜像;`agent/pre-step`(index.ts:205)在 step **被接受后**才 append `plan/mode`(失败的 append 保持 pending 等下一个被接受的 in-turn pre-step;策略不能阻塞 step);narration 经 `agent.inject`(443)追加进决策消息;`systemPrompt.section('plan:policy', order 50)` 按生效状态渲染指引;`exit_plan_mode` 工具常驻——进出 plan 模式只改 prompt section,不改请求工具目录 |
| **todo** | `core/session` 词汇 + `todo/tool-todo` | `todo/write` 是内置 `SessionEventMap` 事件:全量快照、last-write-wins、**log-only 不进派生历史**;条目极简(`content` + 三态 status,无 id——整表替换无需稳定身份);工具注册 projection 单元供客户端折叠 |

共同模式:**持久状态全部落 session 事件,循环只提供 `followup`(开新 turn)、`steer/inject`(影响 step)与 `pre-step`(把关)这几个稳定挂点**。goal 用 followup+pre-step 校验实现"每轮目标自成 turn 且可被拒";plan 用 pre-step 把模式切换与 step 接受原子化;todo 与循环零耦合。

---

## 14. 小结

- **词汇与实现分离**:`core/agent` 定义接口/注册表/Inbox/事件词汇,`ReactLoopAgent` 只是经 `setFactory` 注册的工厂实现;图上其上游入边极小,可整体替换。
- **相位状态机**(idle/maintenance/running)+ `setPhase` 仅在对外状态变化时 emit;maintenance 对外呈现 idle,是 compaction 等维护任务的专用通道,结束后可重放锁存唤醒。
- **Inbox 是唯一输入口**:两条列表的每次变更先落 durable `agent/inbox/spliced` 再动活投影;`followup/steer/inject` 是 `send` 的定参组合,wake 与 injected 的区别就是 `wakeup` 布尔。
- **turn/step 与文档基本对账**;需以源码修正的两点:`agent/request-error` 在 `step/end` 之前派发且可同 step retry;一个 driver 可在 `kick` 内连续多个 turn。
- **取消 cause 化、错误结构化**:请求级 retry 与 turn 级报告两层;`foldConsumedWork` 让任何来源的取消读到一致记账。
- **compaction/goal/plan/todo 全部经事件与 inbox 挂载**,循环本体不感知具体能力——呼应 00-graph-atlas 的结论:包间零调用耦合,一切经 Cordis `ctx` 服务与类型化事件交互。
