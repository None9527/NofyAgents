# deepseek-harness 深度解析 04:工具系统

> 本篇拆解 dsh 的工具系统:`core/tools` 的作用域注册表 `ToolRuntime`、schema DSL 与编译器、三段式执行管线(pre-execute→execute→post-execute)与 `dispatchToolBody`、Code Mode(`run_code` 折叠)、工具呈现、审批/守卫的挂载层次,以及 tool catalog 生成脚本。论断以源码为准,路径相对 `ref/deepseek-harness/`。

---

## 1. 全局视图:一个注册表 + 三条 waterfall

工具系统的中心是 `packages/core/tools/src/index.ts` 的 `ToolRuntime extends Service`(挂载为 `ctx.tools`,`static inject = ['systemPrompt']`)。它同时承担四个角色:

1. **作用域注册表**:全局层 + 每个 agent 作用域层,工具按作用域链可见、可遮蔽、可限制;
2. **调度器**:向 `dsh-agent-loop` 暴露分阶段调度接口 `TOOL_RUNTIME_SCHEDULER`;
3. **策略管线宿主**:三条 waterfall(`tools/pre-execute` / `tools/execute` / `tools/post-execute`)加两个通知(`tools/result` / `tools/change`);
4. **呈现选择器**:native / code / both 三种模型可见形态,code 形态经保留传输工具 `run_code` 折叠。

配置只有两项(`Config`,index.ts:654):`mode`(默认 `'native'`)与 `maxParallelSubCalls`(默认 10,`resolveMaxParallelSubCalls` 校验正整数)。构造函数把工具 schema 经 `ctx.systemPrompt.tools(context => this.wireSchemas(context.scope))` 接入 prompt 装配;非 native 默认时全局注册 collapse 与 SDK 两个 section。

图上的 proc_0(00-graph-atlas §4)是工具管线的全链 10 步 trace:

```
dispatchToolBody → resolveExecution → get → view → requireCodeTransport
→ createRunCodeTool → defineTool → parameterSchemaSpecToJsonSchema
→ compilePropertyMap → runSchemaCompiler
```

即:**分发 → 解析执行视图 →(code 模式下)惰性构建保留传输 → schema 编译**。下面按层拆解。

---

## 2. ctx.tools 作用域注册表

### 层结构
注册表状态放在 `ScopedLayers` + `ToolLayer implements ScopeLayer`(index.ts:714):一个全局层 + 每个作用域一层,每层持有 `tools`(名称→定义)、`restrictions`、`guards`、`mode`。任何注册/限制/守卫都是 Cordis effect,随所属 fiber 卸载回卷,并在变更后 emit `tools/change`。

### view(scope):一次层遍历解析全部事实
`view(scope?)`(index.ts:1140-1195)是可见性算法的唯一实现,返回 `{visible, knownNames, restrictableNames}`:

| 步骤 | 规则 |
|---|---|
| 继承面 | 全局层 + 祖先链层,近祖先遮蔽远祖先(全局最远) |
| restrictions | 对**继承面**按链求交(`layers.every(layer => layer.admits(name))`);**本层自注册不受限** |
| 本层注册 | 最后叠加,遮蔽继承同名 |
| 保留传输 | `modeFor(scope) !== 'native'` 时插入 `RUN_CODE_NAME`,位于能力过滤之外 |

"限制只过滤继承、不过滤自注册"是关键设计:委派运行时把子 agent 的上报/结构化输出工具注册在子 agent 自己的层上,能力过滤器列出"允许子 agent 用的能力"时,不能把它应答所依赖的机构剥掉。注释记录了历史教训:把豁免集读成"全局层"而非"非本层",在 preset 把模型工具挪到 agent 平面后会让子 agent 的过滤器悄悄失效。保留传输**按 scope 插入**:一个 native agent 不能因为进程里别的 agent 用 code 就在自己的分发表里发现 `run_code`。

### 注册面 API

| API | 约束 |
|---|---|
| `register(definition)` | 无条件拒绝 `RUN_CODE_NAME`(任何 agent 都可能选 code 模式,名字不可抢占/遮蔽) |
| `restrict({allow?, deny?})` | 仅作用域上下文可调(全局限制会遮蔽所有 agent,被显式拒绝);空过滤器、未知名称、作用域局部名、保留名都报错;限制求交 |
| `guard(fn)` | **单调守卫**:`(execution) => string \| undefined`,返回 reason 即拒绝;无守卫能强制放行被另一守卫拒绝的调用;全局上下文注册为全局,`agent.ctx` 注册为仅该 agent;注册不触发 `tools/change`(`notify:false`) |
| `presentAs(mode)` | 仅作用域;每作用域一个声明(冲突抛错);最近作用域优先;非 native 时同时挂 collapse 与 SDK 两个 prompt section |
| `get(name, scope?)` / `schemas(scope?)` | `view(scope).visible` 查询;`schemas` 投影模型可见 `ToolSchema{name, description, parameters}`(深克隆,剥离执行/呈现回调) |

`executionMode(exec)`(index.ts:1276-1285)分类并发:**只有 `isConcurrencySafe(args) === true` 才是 parallel**;未知、被遮蔽、未声明、参数非法、抛错,一律 fail-closed 为 exclusive。

### wireSchemas:模型目录按呈现模式裁剪
`wireSchemas(scope?)`(index.ts:980 起)是 prompt 装配的供给端:native 给全部可见 schema;code 模式先 `requireCodeRuntime(mode)`(语言无 SDK 渲染器时在**装配期**响亮失败),再只给 `run_code` 一个 schema、knownNames 只含它;both 给全部并把 `RUN_CODE_NAME` 计入 knownNames。

---

## 3. schema DSL 与编译器(core/tools/src/schema.ts)

### 作者面 DSL
`ValueSchemaSpec` 是闭联合:`string/number/integer/boolean/null/array/object/json/oneOf`,每节点带注解(`description/title/default/examples`,`ValueSchemaAnnotations`,default/examples 必须是无损 JSON 数据)。`ParameterSchemaSpec` 是隐式开放对象根,属性经 `ParameterPropertySpec = ValueSchemaSpec & { required?: true }` 声明。类型推断 `InferValue<S>` / `InferArgs<S>` 让 `defineTool` 全量推导参数类型。

### 编译:runSchemaCompiler(迭代任务图)
`parameterSchemaSpecToJsonSchema`(schema.ts:449)与 `valueSchemaSpecToJsonSchema`(438)把 DSL 编译成受限 JSON Schema。核心 `runSchemaCompiler`(schema.ts:275):

- **不递归下降**,用显式任务栈(`CompileTask` 联合:`value` / `property-map` / `property` / `property-map-tail` / `leave`),对任意深度的作者 schema 栈安全;
- `leave` 任务维护 `seen` 集合做环检测;
- 作者错误经 `authorError`(schema.ts:180)抛 `JsonSchemaError`:不支持的键、`required` 非 true、属性非对象等都在编译期拒绝;
- `assignCompiledNode` 用 `Object.defineProperty` 安装属性,避免 `__proto__` 获得赋值语义;
- `compilePropertyMap`(schema.ts:417)编译隐式属性图并收集 `required` 列表。

编译产物经 `json-schema.ts` 消费:`assertSupportedJsonSchema` 是注册期的 supported-subset 门禁(拒绝超出白名单的 JSON Schema 构造),`validateJsonSchemaValue` 是执行期参数校验(违规路径聚合)。注册表错误词汇窄而专:`ToolNotFoundError`(带引导消息)、`ToolOutputError`(输出/投影违规),都继承 harness 错误基类;`snapshotProjection`/`projectionError` 保证 `render`/`presentationMeta` 的返回值是无损 JSON 快照。

### defineTool(schema.ts:545)
`defineTool(options)` 是第一方工具的唯一入口,把作者函数包成 `ToolDefinition`:

| 选项 | 处理 |
|---|---|
| `parameters` / `output.schema` | 编译为 JSON Schema;`execute` 前 `validateJsonSchemaValue` 校验,违规抛 `ToolArgsError` |
| `output.render` | 模型可见渲染:校验后的规范值 → `ContentBlock[]` |
| `output.presentationMeta` | 可重放呈现元数据(仅顶层直接调用) |
| `timeoutMs` | 正有限数;供 timeout-policy 包装器使用 |
| `isConcurrencySafe` | 并发分类器;包装后**软校验**(参数非法返回 false 而非抛错) |
| `finalizeContent` | 最后一英里内容变换;参数保持 `unknown`(非法输入失败也到达) |
| `presentCall` / `presentResult` | UI 呈现器;**软校验 + 回退通用卡片**——replay 可能遇到旧 schema 的日志参数,呈现永不抛错 |

硬校验(execute)与软校验(presenters/classifier)的区分是刻意的:执行路径面对模型当前输出,呈现路径面对任意历史日志。

### 与 typert 的关系
两条独立的"类型生成"通道,勿混淆:
- **SDK 渲染**(code-mode 用):`ts-types.ts` 的 `jsonSchemaToTs` / `renderToolsSdk` 与 `py-types.ts` 的 `jsonSchemaToPy` / `renderToolsSdkPy`,把可见工具 schema 渲染成 `run_code` 程序可用的 TypeScript/Python SDK 文本(经 `SDK_RENDERERS` 表,index.ts:60;新后端语言是三处平行编辑);
- **typert 类型图**:工具包不注册 typert 条目;agent 侧的 typert lookup 在 `AgentRegistry`(core/agent/src/index.ts:268-281)。typert 是 wire 类型解析基础设施,工具 schema 走自己的 DSL→JSON Schema 链。

---

## 4. 执行管线:三段 waterfall + 分阶段调度器

### 事件面(index.ts:142-210)

| 事件 | 模式 | 语义 |
|---|---|---|
| `tools/pre-execute` | waterfall | allow / deny / ask;`next()` 委托给 allow;ask 缺审批支持时变拒绝;异步门必须观察 `exec.signal`,沉降后注册表复查取消但不抛弃其 promise |
| `tools/execute` | waterfall | around-dispatch:超时、重试、指标;包装器**只能改 `exec.signal`**,调用身份不可变;注册表在 body 前把原始 caller 信号重新融合,替换无法摘除调用方取消 |
| `tools/post-execute` | waterfall | accept / replace / enrich / block;抛错的工具也以 error 到达;caller 取消在监听器沉降后只替换成功的 accepted 结果(码由 body 是否启动决定) |
| `tools/code-dispatch-log` | waterfall | 替换 `run_code` 子分发**日志副本**的内容(如 spill 预览+定位符);程序已拿到完整值,模型两者都看不到;抛错监听器被隔离,回退记录原内容 |
| `tools/result` | emit | 冻结、无损 JSON 的最终结果通知;监听器失败被隔离 |
| `tools/change` | emit | 注册/注销/作用域限制变化;**刻意不做作用域过滤**——全局变更关乎每个 agent 的下一次装配,作用域监听器在这里看到所有变化 |

### 执行身份与结果类型

```
ToolExecutionInput   { callId, name, arguments, agent, signal }
  → ToolExecution    + rootCallId(根模型调用,嵌套也解析)+ token(注册表身份)
  → ToolDispatchExecution  signal 可变(tools/execute 包装器的唯一可动字段)
  → ToolRunContext   + deferContext(UserMessage)(延迟上下文挂到本执行结果)
                     + concludeTurn()(把成功结果标记为当前 turn 的终结)
```

`ToolExecutionResult = ToolExecutionSuccess | ToolExecutionFailure`:content 块、`isError`、可选 `error{name, code, info}`、可选 `additionalContexts`(模型可见的后续上下文,循环在 `tool/result` 之后注入)、`concludesTurn`(仅成功结果)、`meta`(工具私有呈现载荷,持久化到 `tool/result.meta`)。

### 分阶段调度器
`TOOL_RUNTIME_SCHEDULER`(unique symbol,index.ts:466)暴露给 `dsh-agent-loop` 的四段接口,阶段结果是闭合联合:

| 阶段 | 输入 → 输出 |
|---|---|
| `prepare` | `ToolExecutionInput` → `dispatch`(进 around/body)/ `post-result`(拒/取消,仍走 post-execute)/ `final-result`(管线失败,绕过 post-execute) |
| `dispatch` | around-dispatch/body → `post-result` / `final-result` |
| `finalize` | post-execute + finish(用于 needsPost 的结果) |
| `finish` | 物化 + finalizeContent + `tools/result`(不经 post-execute) |

`createExecution`(index.ts:1380 起):快照参数(无损 JSON,失败抛 TypeError);建 `deferContext`/`concludeTurn` 闭包;**在参数物化前捕获 `finalizeContent`**(参数 getter 可能在快照期间换掉回调);code 折叠命中时直接 final-result——已中止给 `ABORTED_BEFORE_DISPATCH`,否则给带引导的 `ToolNotFoundError`("only `run_code` is callable directly — call X from inside a run_code program instead"),让模型知道该走哪条路而不是读到裸的 unknown tool。

`prepareExecution`(index.ts:1468-1515)的顺序即策略顺序:

```
callerCancelled? → aborted-before-dispatch
→ tools/pre-execute waterfall(默认 allow)
→ ask? → serviceAsk(ctx.get('approval') 机会式消费)
→ 取消且审批取消 → post-result(aborted)
→ denialReason = allow? guardReason(exec) : decision.reason
→ 有 reason → post-result(Error: reason)
→ 再查 callerCancelled → dispatch
```

**守卫在 waterfall 之后**:`allow` 决策才进入单调守卫;`deny` 决策直接带 reason。守卫顺序是全局层先,再作用域链(最远祖先开始),第一个拒绝生效。

### dispatchToolBody(index.ts:1532-1571)

```
fused = fuseToolSignals(callerSignal, wrapperSignal)  // 原始取消永远在
isAborted(fused)? → aborted-before-dispatch
exec.signal = fused.signal
tool = resolveExecution(name, agent, nested)          // get→view,collapse 命中=undefined
tool 缺失 → ToolNotFoundError
state.bodyInvoked = true
returned = await tool.execute(exec.arguments, exec)
result = createSuccessResult(exec, tool, returned)    // output.render 渲染 content
isAborted? → toolAbortedResult(result)                // body 完成但已取消
finally: fused.dispose(); exec.signal = wrapperSignal // 恢复包装器信号
```

取消语义由 `bodyInvoked` 决定结果码:body 已启动 → `TOOL_ABORTED`;未启动 → `TOOL_ABORTED_BEFORE_DISPATCH`。**取消永不抛弃 body**:已启动的 promise 先达到静止,结果才被改写。

`dispatchScheduledExecution` 在 `tools/execute` waterfall 内调用 `dispatchToolBody`(innermost next),随后 `normalizeDispatchResult`、把 `deferredContexts` 并入 `additionalContexts`(按调用序)、检查 caller 取消。`finalizeScheduledExecution`:post-execute → 物化(`materializeFinalResult`,无损快照,失败转错误结果)→ `applyFinalContent`(定义拥有的内容变换)→ 再物化 → `notifyResult`(`Object.freeze(exec)` 后 emit `tools/result`)。

docs/tool-execution-pipeline.md 的流程图与源码一致:pre-execute → guards →(ask 时 `ctx.approval`)→ tools/execute → body →(tool-fs 的 `fs/write-intent`/`fs/edit-intent` 门)→ 工具自有事件(`todo/write`、`fs/observed`、`hook/*`、`tool/code-dispatch`)→ post-execute → 规范化 → finalizeContent → tools/result → `tool/result` 落日志。

---

## 5. Code Mode(core/tools/src/code-mode.ts)

Code Mode 把"每个工具一个原生调用"折叠成"一个 `run_code` 程序 + 程序内子分发":

- `RUN_CODE_NAME = 'run_code'`(保留名)、`SDK_SECTION_ORDER = 150`、`CodeSdkLanguage = 'typescript' | 'python'`;
- `collapses(name, scope, nested)`(index.ts:1312-1330)是**唯一的安全谓词**:`!nested && modeFor(scope) === 'code' && name !== RUN_CODE_NAME`;经 `modeFor`(本作用域声明优先于部署默认)而非 `defaultMode` 解析——preset 在 native 部署里给某 agent `code` 正是 `dsh-agent-tool-presentation` 存在的组合,读部署默认会让它不被折叠:宣告一个面、执行另一个面,此谓词关闭该绕过;
- `requireCodeTransport()`(index.ts:922)惰性构建保留传输:`createRunCodeTool(this, {requireRuntime, peekRuntime, maxParallel, shapeDispatchLog})`,缓存于 `codeTransport`;requireRuntime 在 `ctx.codeRuntime` 缺失时抛响亮的误配置错误,peekRuntime 不抛(供 schema 发射区分"无运行时"与"未知语言")。

`createRunCodeTool`(code-mode.ts:294)产出 `run_code` 定义:
- 必填参数 `code` + `description`;description/parameters 是**语言感知 getter**,schema 发射时解析运行时 flavor,使模型看到的 schema 与 SDK section 语言一致;参数校验仍按静态 spec(一个必填 string),与语言无关;
- 输出 schema `{logs: string[], result?: json}`,`render` 拼日志与结果,无输出时给 "(run_code completed with no output)";
- 执行体建 run 级 `AbortController`(跟随外部信号;run 以任何原因沉降即中止在飞子分发、放弃排队项);
- **每 run 调度器复刻原生循环的时序**:单一有序车道上,有序阶段(开始事件 append、prepare=pre-execute/guards、commit=post-execute+context 延迟+沉降事件)串行,仅 around-dispatch/body 并发;启动严格按提交序,结果经队首游标按提交序提交;parallel 类调用重叠上限 `maxParallel`(注册表传入校验过的 `maxParallelSubCalls`),exclusive 调用等池排空、独占运行、屏障保持到 commit 完成;启动前经 `executionMode()` 重分类(排队期间注册表变更可翻转为 exclusive),与原生调度器的懒重分类一致。

子调用的 durable 词汇(core/tools/src/types.ts):
- `tool/code-dispatch-start`:调度器**实际启动**时 append(排队被放弃的不记);携带 `rootCallId/parentCallId/subCallId`(`<parent>:code:<n>`,按提交序编号)、name、**分发前规范化**的 arguments(因此该 append 永不因载荷形状失败);
- `tool/code-dispatch`:子分发沉降时 append,内容是 `tool/result` 词汇的模型可见结果(`content`+`isError`),每个启动的子调用恰好一条(中止也是 isError 结果);
- 两者都是 **log-only**:`deriveMessages()` 忽略,子调用不重新进入模型上下文;UI 按 `subCallId` 配对两事件、用各自 `time` 字段算耗时。子调用携带父 token、拒绝以约束性拒绝返回、**不带 additionalContexts** 以保持 call/result 邻接(docs/tool-execution-pipeline.md)。

prompt 侧配套两个 section:`tools:code-only`(collapse section,`COLLAPSE_SECTION_ORDER` 先于各工具指引的 order 100-199)用与执行拒绝**同一谓词**声明"只有 run_code 可直接调用"——没有它,模型会读到一份宣告全部工具的目录却只被允许调 run_code,发出原生调用后收到 UNKNOWN_TOOL 并断定部署不一致;`both` 模式渲染空(native 调用在那里可执行,规则为假)。`tools:sdk` 按调用作用域再生成 SDK 文本,native 呈现的 agent 渲染空并被丢弃。

---

## 6. 工具呈现

### 呈现模式选择(agent-tool-presentation)
`packages/core/agent-tool-presentation/src/index.ts` 是 **agent 平面的呈现选择行**:工具注册表留在宿主平面(循环调度器、API proxy presenter、所有工具插件都是它的消费者,进不了 preset),preset 能拥有的是呈现——`ctx.tools.presentAs(mode)` 为挂载作用域( preset 的常驻挂载)声明,覆盖加入该 preset 的全部 agent,"一行每组合,不是一行每会话",code 模式 preset 可与 native preset 同进程并存。

`Config.mode` 必填(省略即部署默认,该行毫无意义)。`native` 直接声明;`code`/`both` 经 `ctx.inject(['codeRuntime'], …)` 等待 TypeScript code runtime(宿主平面服务 `dsh-code-runtime-worker-thread`)——**没有运行时的部署在挂载时就失败**,记入 preset 激活审计,而不是拖到第一次 prompt。`inject` 未列 `codeRuntime`:native 行必须在无运行时的部署里能挂载。

### 呈现视图(presentation.ts)
UI 词汇与模型词汇分离:`ToolCallKind` 分类(`read/edit/delete/move/search/execute/fetch/other`);`ToolCallView = Generic | Terminal | Diff`;`ToolResultView = Generic | Terminal | Diff | Search | Read | Web`(含 `FileDiff`、`FileLocation`、`ReadFileLine`、`SearchLineMatch`、`WebSource` 等结构)。工具经 `defineTool` 的 `presentCall`/`presentResult` 提供纯呈现意图,缺省回退通用卡片;结果时的私有呈现载荷(如 `dsh-tool-fs` 的结果时上下文 diff)经 `ToolExecutionResult.meta` 持久化到 `tool/result.meta`,`Session.append` 运行时校验其 JSON 可序列化,UI bridge 在 replay 时据此复现同一卡片(agent-loop/src/tool-calls.ts:281-288)。

---

## 7. 审批与守卫挂在哪一层

结论先行:**审批挂在 `tools/pre-execute` 的 ask 分支(注册表机会式消费 `ctx.approval`),策略守卫挂在注册表的单调 guard 层(waterfall 之后),超时等 around 关注点挂在 `tools/execute`**。三层互不替代:

1. **审批缝(interaction/user-approval)**:`ctx.approval` 服务,`approval/request` waterfall 向应答者链要决策,**缺应答者 fail-closed**;授权只覆盖被请求的动作。策略词汇:`ApprovalPolicy = 'ask' | 'never'`(会话级覆盖,last-wins,`source:'delegation'` 标记委派种子);`ApprovalOutcome = 'allowed-once' | 'rejected' | 'cancelled' | 'unavailable'`。审计落三个 log-only 会话事件:`approval/asked`(id 配对,带 toolName/callId/reason)、`approval/decided`(每次 ask 恰一条)、`approval/policy`(永不进模型转录——模型从运行时上下文快照与切换通知得知)。注册表侧,`prepareExecution` 对 `ask` 决策调 `serviceAsk`:机会式 `ctx.get('approval')`,缺席或不可答即拒绝。
2. **单调守卫(`tools.guard`)**:同步、只拒不放;全局先、作用域链后。文档明确分工:**不可被重排的 owner 策略留作注册守卫**,可变策略走 pre/post waterfall。`packages/guard/repeat-tool-reminder` 是相邻样本:它不是守卫而是**咨询性**重复调用检测器——在 post-execute 决策上富集日志化的模型上下文(连续重复达阈值 `[3,5,8]` 时注入提醒),不否决不改写调用;`include/exclude` 是 `*` 通配谓词,匹配不到任何已注册工具也合法。
3. **around 包装(guard/timeout-policy)**:`ctx.on('tools/execute')` 包装器,读 `ctx.tools.get(exec.name, exec.agent)?.timeoutMs`,无预算直接 `next()`;有则经 `dsh-timeout` 的 `deadline`/`timeoutOf` 武装截止,临时替换 `exec.signal`、沉降后恢复上游信号,**仅当本插件自己的计时器先响**才用 `TOOL_TIMEOUT` 结构化结果替换(`error.code` 与内部 deadline 分类码同名,供重试/沙箱插件与 replay 路由)——嵌套外层 deadline 先响时读作普通上游取消,不误判。

文件系统写门(`fs/write-intent` / `fs/edit-intent`)在更下层:tool-fs 的变更在工具 body 内触发,不属于工具注册表管线(docs/tool-execution-pipeline.md 图中 `fsGate` 节点);read-before-edit 检查留在 tool-fs 之下的 `fs/*` 事件上。

---

## 8. tool catalog 生成脚本

`scripts/gen-tool-catalog.ts` 生成 `docs/tool-catalog.md`:

- **运行时注册是计算 schema 的唯一真相源**:脚本真实启动一个 Cordis 组合(`Context` + `AgentRegistry` + `SessionStore` + `SessionProjectionRegistry` + `ToolRuntime` + 全部工具/能力插件,约 40 个 import,从 `ToolBash`/`ToolFs`/`ToolStrReplaceEditor` 到 `ToolSubagent`/`ToolWorkflow`/`ToolRalph`),在活注册表上收 schema,而不是静态解析源码;
- 清单(manifest)与磁盘上每个 `tool-*` 包核对,防漏收;
- `--check` 校验已提交产物,纳入 doc-sync 门禁;
- 附件敏感工具(如 `read_image`)用 `CatalogAttachmentStore` 标记使条件 schema 可收割。

这与 00-graph-atlas 的结论互证:dsh 的文档不失真靠"文档导入全部包 + 生成物校验"两道硬门禁,tool catalog 是后者在工具面的实例。

---

## 9. 小结

- **一个注册表四个角色**:`ToolRuntime` 同时是作用域注册表、分阶段调度器、策略管线宿主、呈现选择器;`view(scope)` 的"限制只过滤继承、自注册豁免 + run_code 位于过滤之外"是可见性的核心算法。
- **schema 是一条独立编译链**:DSL → `runSchemaCompiler`(迭代任务图、栈安全、作者错误即 `JsonSchemaError`)→ 受限 JSON Schema;`defineTool` 对 execute 硬校验、对呈现/并发分类软校验,区分"面对模型当前输出"与"面对任意历史日志"。
- **管线顺序即策略顺序**:pre-execute(可 ask)→ 单调守卫 → tools/execute(around)→ body → post-execute → 物化 → finalizeContent → tools/result;阶段结果以 `post-result`/`final-result` 显式区分是否还走 post-execute;取消由 `bodyInvoked` 决定结果码,永不抛弃在飞 body。
- **Code Mode 是呈现层折叠而非另一套执行**:`collapses` 单一谓词、保留 `run_code` 传输、每 run 调度器复刻原生时序、子调用经 log-only `tool/code-dispatch*` 事件全量审计但不进模型上下文。
- **审批/守卫/超时各挂各层**:ask→`ctx.approval`(fail-closed、`allowed-once` 粒度)、不可重排策略→guard、around 关注点→`tools/execute` 包装;三者与 pre/post waterfall 的正交划分,是"hooks 跨工具族而不耦合策略服务"的实现方式。
