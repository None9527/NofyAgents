# deepseek-harness 设计哲学深度解析

一句话概述:dsh 的哲学可以压缩为一条主定理和六条推论——**主定理:组合关系是配置与事件,不是调用**;推论分别是词汇类型即接口、守卫事件化、model-visible ⟺ logged、边界处显式优于隐式、pre-release 用门禁密度换兼容承诺、以及把"一切皆插件"贯彻到连 agent 循环本身都是插件。

> 路径均相对 `ref/deepseek-harness/`;图证据引自 `ref-analysis/deepseek-harness/00-graph-atlas.md`;对比材料引自 `ref-analysis/SUMMARY.md`、`hermes-agent.md`、`openclaw.md`、`pi.md`,NGOAgent 对照取自 `/tmp/ngoagent-check`(Go,DDD 四层)。

---

## 一、一切皆插件 vs DDD 状态机:两种"可替换性"

dsh 的 README 第一句架构声明就是 "everything is a plugin",底座是 vendored 的 Cordis(`vendor/cordis/`,4.0.0-rc.7,论文《A Programming Paradigm for Spatiotemporal Composability》)。
这不是修辞:

- **连 agent 循环都是插件**。
`ReactLoopAgent`(`packages/core/agent-loop/src/agent.ts`)由 `AgentLoop.prepare` 插件装配点构造;图证据是它的上游影响面极小(仅 prepare + 契约回归测试)——00-graph-atlas §5 的结论:"换循环实现只需换插件"。
`AgentFactory` 经 `ctx.agents.setFactory()` 注册,消费者用 `ctx.agents` 而从不依赖具体循环包(`docs/subsystems/core.md`:"扩展插件依赖 agent——包括需要 initiating Agent 时——从不直接依赖 agent-loop,所以循环保持可换");
- **包级零耦合是图可验证的事实**。
全仓 24,638 条 CALLS 边按包聚合,跨包组直接调用几乎为零(唯一例外 client→test-support 119 条测试基建);包与包全部经 Cordis `ctx` 服务注册与类型化事件交互;
- **组合是层叠配置**:profile(存于 Harness home)→ bundle(`dsh-base`/`dsh-web-app`/`dsh-headless`)→ profile 的 `cordis.patch.yml` → home 级 → `--patch` 覆盖。
`dsh --profile web --dump-config` 打印的树里任何一行都可被 patch 替换。
注册是 effect,插件卸载时回卷——"没有特权核心可打补丁,扩展方式是把插件挂到其他插件旁边";
- **自我修改也是插件操作**:图里的 proc_12-20 执行流(`DynamicCordisRunnerService.run`)以"agent 挂载自己的插件"收尾,动态组合走的是与静态组合同一套机制。

对照 NGOAgent(`/tmp/ngoagent-check`):经典 DDD 四层(`internal/domain|application|infrastructure|interfaces`),循环是 graph runtime 上的节点处理器(prepare/generate/tool/guard/compact/done;`internal/domain/service/run_states.go` 注释明说从 "standalone loop state machine" 迁到 graph adapter),组合靠 `internal/application/app_assembly.go` + `builder.go` 的代码装配。

| 维度 | dsh | NGOAgent |
|---|---|---|
| 组合时机 | 运行时(cordis.yml 层叠) | 编译期/启动期(builder 代码) |
| 可替换单元 | 插件(配置行即可换) | 依赖注入的接口实现(改代码) |
| 循环形态 | 事件 waterfall 上的 driver | 图节点状态机 |
| 可审计性来源 | Agent Note + 门禁 | 分层 + 类型 |
| 代价 | 事件/注册样板、门禁密度(scripts 自调用全仓第二) | 单体 internal/ 的耦合密度 |

两者没有绝对优劣:dsh 的形态服务"第三方插件生态"这个目标(README 提供 `dsh-plugin` topic、examples 里有 web-cordis/web-schedule 这类外部组合示例),NGOAgent 的形态服务"单团队可控演进"。
grok-build 目前是后者,且没有插件生态需求——这是后文借鉴清单的前提。

## 二、项目逻辑 vs 全局助理:服务对象决定架构

SUMMARY.md 的对比表里,dsh 与 NGOAgent/pi 同属"服务项目/工作区",hermes/openclaw 服务"人(全局)":

- dsh 的会话身份绑定 `cwd`(`session.create` 必须带 cwd,cwd 冲突抛 `SessionCwdConflict`),workspace 是第一级 RPC 域(7 个方法),preset/权限/技能全部按项目解析;skill 目录从会话 header 解析项目根,不碰 Agent 注册表;
- hermes 的状态真相是"这个人的全部历史"(SQLite 跨会话 FTS5 检索 + memory 策展 + 自我改进 skill),openclaw 是常驻 Gateway 管"模型 × 工具 × 渠道"的多通道中枢,会话只是渠道投递的载体;
- 架构后果:dsh 不需要 hermes 的 credential_pool 多 key 池、openclaw 的 channel-health 监控这类"助理运维"机制,它的运维面是**部署组合**(profile/bundle)与**信任栅栏**(loopback/trustedHosts)。

对 grok-build 的含义:脱敏为通用 BYOK agent 时,应保持 dsh 式的项目逻辑(SUMMARY §5 的蓝图已是此方向),而不是滑向 openclaw 的网关形态——后者的 gateway/渠道/多端协议"本次不需要,仅在未来接入 IM 渠道或多客户端控制面时再参考"。
项目逻辑还有一个直接收益:状态目录天然按工作区组织,容器化与隔离测试(SUMMARY §4 的 `<NAME>_STATE_DIR` 要求)不需要额外设计。

五个项目的组合机制与服务对象总览(00-graph-atlas §7):

| 维度 | dsh | pi | hermes | openclaw | NGOAgent |
|---|---|---|---|---|---|
| 组合机制 | 纯插件树(cordis.yml 层叠) | 代码内固定 + 配置 | 插件目录 + 配置 | 扩展 + Gateway 配置 | DDD + builder wiring |
| 包间耦合(图证) | **近零 CALLS** | 中 | 高 | 高 | 高(单体 internal/) |
| 服务对象 | 项目/工作区 | 项目 | 人(全局) | 人(全局) | 项目 |
| 状态真相 | append-only 会话日志 | JSONL 转录 | SQLite | SQLite/JSONL | 状态机 + 持久层 |

dsh 是唯一把"包级零调用耦合"做到图可验证程度的样本;其代价是大量事件/注册样板与极高的工程门禁密度。注意状态真相一栏:dsh 与 pi 选择 append-only 日志,hermes/openclaw 选择数据库——这正是"model-visible ⟺ logged"(§五)能成立的前提,数据库双真相则必须靠 portability/迁移机制维持一致。

## 三、词汇类型即接口:错误类型才是真正的窄腰

00-graph-atlas §3 的入度排名是这条哲学最硬的证据:

| 符号 | 位置 | 入度 |
|---|---|---|
| `FsError` | `packages/fs/fs/src/types.ts:196` | 56 |
| `MockAdapter` | agent-loop/tests | 48 |
| `LlmError` | `packages/llm/llm/src/index.ts:83` | 48 |
| `SessionQueryError` | session-query | 48 |
| `Inbox` | `packages/core/agent/src/inbox.ts` | 34 |
| `LocaleRuntime` | client/locale | 33 |
| `SubagentError`/`HarnessError`/`WebError`/`StorageError`… | 各能力包 | 10-25 |

**每个 capability seam 的"错误类型 + 词汇类型"才是全局消费点,而不是服务实现。** 实现可换、词汇稳定——这正是 seam 三角色(Service Definition / Provider / Consumer)在图上的投影;`docs/capability-seams.md`(gen-doc-graphs 生成的能力图)列出每个服务的声明包、已知实现包、直接消费包,如 `ctx.llm` 的实现包括 llm-deepseek 与 llm-replay——回放 provider 与真实 provider 在同一个 seam 上是平级实现。

`Inbox` 的入度 34 值得单独说:它是"agent 循环唯一输入口"(00-graph-atlas),本身只是**持久 inbox 事件的增量投影**——构造时从 `session.events` 重放 `agent/inbox/spliced` 事件重建 `{next-turn, next-step}` 两个队列,之后的 splice 增量消费;非法持久 splice 在构造时抛错。
词汇(`inserted`/`discarded`/`claimed` 通知)先于任何调度实现。

配套机制:

- 错误词汇有共同根基(`FsError extends HarnessError`、`LlmError extends HarnessError`),但每个 seam 一个错误类,被该 seam 的全部消费者引用;
- 会话词汇 `SessionEventMap` 是 merge-extensible 类型表,新增模型可见输入 = 新增事件类型(见下节);
- RPC 错误码集封闭(`RpcErrorDetailsMap` closes the code set),wire 两侧的错误词汇先于任何实现固定;
- 投影类型表 `SessionProjectionMap` 词汇先行地端到端贯通(host unit、wire 块、client store、React hook 共用一张表)。

对比:hermes/openclaw 的窄腰是**协议格式**(OpenAI chat-completions 内部表示,只在出口转换一次);dsh 的窄腰是**类型词汇**。
前者适合多 provider 接入,后者适合多插件共存——grok-build 脱敏需要前者(SUMMARY §2 已定),但 dsh 证明词汇稳定后"实现随便换"的自由度是真实收益。

## 四、事件化守卫:审批不在调用链里

`docs/architecture.md` 的 turn flow 图里,守卫全部是 waterfall 事件:

```text
agent/pre-step    → 决定模型看到什么(可重写/拒绝 claimed messages)
agent/request     → 请求级拦截
llm/stream        → 流级拦截
tools/pre-execute → 审批/策略挂这里
tools/execute / tools/post-execute
agent/turn-stopping → serial,无 next()
```

waterfall 的监听者必须调 `next()` 才算委托。
图证据(00-graph-atlas §4 的 proc_0 工具管线):`dispatchToolBody → resolveExecution → … → runSchemaCompiler` 整条调用链里**没有守卫节点**,"守卫/审批在 `tools/pre-execute` 事件上,不在调用链里"。

这样做的收益是多方消费:同一个 pre-execute 事件同时服务 UI(审批面板)、遥测、策略插件,调用链保持干净;拒绝一个 turn 也会留下持久记录("被拒绝或重写为空的首次 claim 仍关闭一个花了零 step 的 durable turn,日志记录这次尝试")。

防御性模式文档(`docs/defensive-patterns.md`,7 条 bug-class 规则)给事件化提供了配套纪律:分发器必须吞掉回调异常("一个坏订阅者永不破坏核心生命周期");异步状态不是同步状态(`agent/status` 与 `whenIdle()` 不能作为单个 followup 的结果);dispose 必须到达静止而不只是请求静止(kill → await done,先关监听注册表再杀)。
事件化把扩展点从调用链挪到事件总线,这三条规则就是为总线上的生命周期写的。

grok-build 对照:TUI 侧已有同构物(hooks fail-open、dispatch 的 Effect),但 hooks 是"调用点上的回调注册",不是"领域事件上的 waterfall"。
差异在语义:dsh 的守卫对全部入口生效(Web/TUI/ACP 共享一条 `session.prompt` 路径,连 skill 调用都是普通 prompt——`/name` token 由 `dsh-tool-skill` 在 pre-step 边界识别,"每个入口共享一条确定性路径"),grok-build 的 hooks 需要每个调用点自觉经过。

## 五、model-visible ⟺ logged:一条运行时断言的哲学

`docs/architecture.md:96` 是全文档最重要的一句话:

> **Model-visible means logged.** Anything that reaches a model request must be reconstructable from the log, and a runtime invariant asserts it.

推论链条:

1. 会话日志是模型上下文的唯一来源,`deriveMessages()` 从日志投影模型历史;原始 `assistant/chunk` 事件保留回放与 UI 保真;
2. 因此新的模型可见输入**必须**是新的 session event(扩展 `SessionEventMap`,从日志渲染),不存在"只进请求不进日志"的旁路;
3. 请求信封本身也是日志状态:`request/header` 事件记录 `EpochHeader`(调用配置 + 适配器默认值标记 + 渲染后的系统提示 + 组装后的工具 schema),`foldRequestHeader(events)` 选最新快照重建——"每个会话请求都是日志的纯函数";空系统提示/空工具列表的规范形态是字段缺席,与请求构建方式一致;legacy v0 的 delta 事件在 seed/append/持久化加载边界被拒绝,"而不是不完整重放";
4. 客户端也遵守:`Session` 的 `events` 与 `views` 平行存放不合并,注释明说"让 events 保持原始日志切片(model-visible ⟺ logged)"(`packages/client/runtime/src/client/sessions/session.ts:69`);
5. 压缩不破坏该性质:`compaction/summary` 是日志记录,替换与被引用记录同页;llm-replay 能仅从 `assistant/chunk` 重建全部模型流,正是该性质的测试侧兑现;
6. 辅助模型调用同样遵守:会话标题生成的共享 LLM helper "在调用模型前记录每个已验证、可派发的标题请求",载荷复现模型可见输入。

这条哲学同时是审计哲学:fork、resume、转录、遥测、持久化全部从同一条流派生,不存在第二真相源。
对比 hermes(SQLite 状态 + 转录两份真相,需要 portability mixin 维持一致)与 openclaw(Entry/Record 分离,pi.md 建议 grok-build 保留该分离),dsh 选择了最极端的一份真相。

## 六、显式优于隐式:request/spec 分裂

`docs/subsystems/shell.md:15` 把这个模式命名为仓库规则:

> seam 把 **模型/插件面的 request**(可选的 `workdir`/`timeoutMs`/`stdoutMaxBytes`,由配置或请求策略填充)与**完全解析的 spec**(这些字段必填)分开。工具层在两者之间调用 `ctx.shell.resolve(request)`——**仓库的"包边界处显式 > 隐式"规则**。

`SubprocessSpawnSpec` 的文档注释是同一规则的另一次陈述:"这个 seam 不应用任何默认值:每个处置、限制、目录都在 spec 上显式存在,决定它们的是调用者自己的配置,而不是 subprocess 服务的隐藏默认;argv 永不经过 shell 解释"(`packages/subprocess/subprocess/src/types.ts`,subprocess 文档称 dsh-shell 的 request/spec 分裂是 "owning template")。

同一哲学在别处的投影:

- 连接信任栅栏"刻意不为未标记 HTTP 请求开捷径"(connection README);
- 覆盖率豁免必须逐文件列名带理由,`v8 ignore` 注释必须携带 reason;
- preset 选择"存储组合压倒请求参数",因为隐式采纳请求会重放模型已无法再调的工具;
- `agentPreset.select` 只允许 blank 会话——"历史由哪套工具产生,就必须由哪套工具继续",不允许隐式换组合;
- `session.export` 输出"存储工件的逐字节原文"(`readRaw`),"不是从解析事件重建"——导出语义显式到字节。

显式原则甚至延伸到包与模型的关系本身:每个包 README 必须有 `## Model Experience` 与 `#### KV Cache effect` 小节(verify-package-readme-model-experience 门禁守护),明确声明"这个包的代码会不会进入模型请求、对 KV 缓存有什么影响"。client 全系包的答案都是 "None, as …"——这不是文档装饰,而是让"模型可见面"的边界在包粒度上可审计:任何声称 None 的包一旦把值送进请求,就是契约违反。对正在脱敏的 grok-build,这等价于一份逐 crate 的"专有面暴露清单"。

## 七、pre-release 不兼容策略:门禁密度换兼容承诺

README 的 Developer preview 声明只有一句:"**THERE WILL BE COMPATIBILITY-BREAKING CHANGES.**" 版本号印证:主包 0.1.0-rc.5,vendored cordis 4.0.0-rc.7/loader 1.0.0-rc.5。
策略实质:

- **不做兼容承诺,做变更纪律**。
Agent Note 制度(每个非平凡变更同 PR 附决策记录,分类/格式/归档各有门禁)加上全部门禁,让"破坏性变更"的代价从"下游断裂"变成"仓库内部门禁变红";归档笔记被 `verify-archived-agent-notes` 封存——历史决策只读,防止回溯改写;
- **词汇层仍然刻意稳定**:错误码集封闭、wire 四象限联合、`SessionEventMap` merge-extensible、legacy 事件在边界拒绝而非降级重放——破坏性集中在实现层与组合层,词汇层是事实上的稳定承诺;
- 对比 pi 的 harness v4 占位状态机(pi.md:"尚是占位实现,不必跟进")与 openclaw 的 gateway-protocol schema-first codegen(Swift 客户端由 JSON Schema 生成),dsh 选择了第三条路:不承诺外部稳定,但把内部变更成本全部工具化。
这与它"一切皆插件"的主定理一致:外部扩展面是配置与词汇(稳定),内部实现是插件(随便换)。

## 八、对 grok-build(Rust)的借鉴清单

**能搬(与语言/框架无关):**

| 设计 | grok-build 落点 | 成本 |
|---|---|---|
| 词汇先行:每个 seam 一个稳定错误枚举 + 封闭错误码集 | 现有 `XxxError` 命名约定已在,补"码集封闭 + 词汇先于实现冻结"纪律 | 低 |
| model-visible ⟺ logged | Workflow Journal 已是记录底座,补"任何进模型请求的内容必须先进 journal"的运行时断言 | 中 |
| 事件化守卫(waterfall + next()) | Rust 用 `tower`-style middleware 或类型化事件总线;hooks 从"调用点回调"升级为"全入口事件" | 中 |
| request/spec 分裂 | 工具/子进程边界:模型面可选参数 → resolve() → 全必填 spec | 低 |
| 投影模式(host 折叠整值 + seq 仲裁) | ChatStateActor 事件广播已同构,补"整值 + 水位"纪律即可服务未来 Web UI | 中 |
| 逐文件覆盖率 + gen/verify 同体门禁 | cargo-llvm-cov + xtask | 中 |
| defensive patterns 七条 | 生命周期/并发/拆除代码的评审清单,直接翻译可用 | 零 |

**TS/Cordis 特有,搬不动或需重铸:**

| dsh 机制 | 为何搬不动 | Rust 近似物 |
|---|---|---|
| declaration merging 类型表(`SessionProjectionMap`/`TypertLookupMap` 空接口合并扩展) | TS 独有;Rust 无法跨 crate 合并 map 类型 | trait + 关联类型,或 `inventory`/`linkme` 分布式注册 |
| cordis.yml 运行时插件树 + effect 回卷 | 依赖 JS 模块动态性与 fiber | 无对应;最接近的是 feature flags + 配置驱动注册 |
| 槽位系统(React 组合授权) | 绑定 React 渲染模型 | TUI 无此需求 |
| doc-typecheck 编译 Markdown 围栏 | 依赖 TS 编译器 API | Rust doctest 原生覆盖,但"文档粘贴声明与源比对"(type-equiv)无对应,可用宏生成代替 |
| HMR 插件热替换 | 依赖模块重载 | 编译语言天然无 |
| Typert 源码类型 → 调用描述符 codegen | 依赖 TS 类型系统反射 | Rust 的 serde/proc-macro 可覆盖参数校验部分,lookup 身份机制需重设计 |

## 九、结论:如果重做 grok-build,偷这 5 个设计

| # | 设计 | 偷什么 | 预期收益 | 风险/代价 |
|---|---|---|---|---|
| 1 | **model-visible ⟺ logged + request/header 事件** | 每个模型请求的信封(系统提示 + 工具 schema + 采样配置)作为 journal 事件;请求 = 日志的纯函数 | 回放/审计/fork 共享一份真相;脱敏审计可直接 grep 日志证明无专有旁路 | 日志体积;需要 fold 函数维护 |
| 2 | **词汇类型即接口** | 每个 seam 冻结错误枚举与事件 map,再写实现;错误码集封闭 | 脱敏换实现(xai-grok-sampler → 通用适配器)时消费者零改动;与 SUMMARY §5.1 蓝图直接衔接 | 词汇设计需前置评审 |
| 3 | **事件化守卫(tools/pre-execute waterfall)** | 审批/策略/遥测挂在统一事件上,调用链无守卫节点 | Web/TUI/ACP(未来)共享一条守卫路径;hooks fail-open 语义保留 | Rust 事件总线样板 |
| 4 | **llm-replay 式无 key e2e** | fixture = 录制的 journal;replay/record/refresh 三态 | 脱敏验收清单"CI 不依赖真实端点"(SUMMARY §5.4)直接达成;grok-build 已有 Journal 底座,成本最低 | fixture 迁移脚本 |
| 5 | **request/spec 分裂 + 逐文件覆盖率门** | 包边界 resolve() 显式化默认值;cargo-llvm-cov 逐文件 100%(豁免列名带理由) | 边界处无隐藏默认(与 grok-build 沙箱 fail-closed 哲学天然一致);死代码被门禁持续标记 | 一次性补齐覆盖率的工作量 |

没进前五但值得记录的:doc-budgets 字数棘轮(成本一天)、"每个 crate 声明碰不碰模型请求"的 README 契约(脱敏审计加速器)、source/artifact 平面分离的安装态 smoke、defensive patterns 作为评审清单。
dsh 用 123 个根 script 证明的事只有一件:**纪律不靠自觉,靠把自觉编译成门禁**——这一条对任何语言都成立。

---

## 核心发现

1. **主定理是"组合关系 = 配置 + 事件,不是调用"**:包级 CALLS 近零、连 agent 循环都是可换插件、守卫不在调用链上——三条图证据指向同一架构事实。
2. **窄腰是词汇不是协议**:错误类型入度(FsError 56、LlmError 48)远超任何服务类;实现随便换的前提是词汇先冻结,这与 hermes/openclaw 以协议格式为窄腰形成对照。
3. **model-visible ⟺ logged 是一份真相的极端形态**:请求是日志的纯函数(request/header + foldRequestHeader),运行时 invariant 断言,fork/resume/replay/遥测全部派生,无第二真相源。
4. **显式优于隐式是边界规则而非风格偏好**:request/spec 分裂、"seam 不应用任何默认值"、preset 存储组合压倒请求参数——隐式默认在 dsh 里被系统性消灭。
5. **pre-release 策略的实质是门禁换承诺**:对外不承诺兼容,对内把每次变更的成本工具化(Agent Note + 40 余门禁);破坏性集中在实现层,词汇层事实稳定。
