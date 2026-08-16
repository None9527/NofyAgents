# deepseek-harness 深度解析(GitNexus 图驱动)

> 索引:GitNexus 1.6.9(1.5.3 在本仓库触发 `Maximum call stack size exceeded`,升级后正常)
> 规模:**46,002 节点 | 100,802 边 | 1,958 clusters | 300 flows**(53s 完成)
> 注意:本环境 FTS 扩展不可用,`query` 文本检索退化;本文数据主要来自 `cypher` 全图聚合与 `context`。

---

## 1. 图 Schema 概览

节点分布(前 10):

| 标签 | 数量 | 标签 | 数量 |
|---|---|---|---|
| Function | 12,746 | Interface | 2,589 |
| Const | 8,512 | Property | 2,306 |
| Section | 6,975 | Community | 1,514 |
| Method | 4,996 | Class | 641 |
| File | 4,433 | Process | 300 |

边分布:

| 关系 | 数量 | 含义 |
|---|---|---|
| DEFINES | 24,757 | 文件/模块定义符号 |
| CALLS | 24,638 | 调用 |
| ACCESSES | 14,806 | 属性/变量访问 |
| CONTAINS | 12,226 | 目录/文件包含 |
| IMPORTS | 7,559 | 模块导入 |
| MEMBER_OF | 7,307 | 符号→社区 |
| HAS_METHOD / HAS_PROPERTY | 4,850 / 2,276 | 类成员 |
| STEP_IN_PROCESS | 1,278 | 符号→执行流步骤 |
| METHOD_IMPLEMENTS / EXTENDS | 330 / 192 | 多态 |
| HANDLES_TOOL | 1 | 全图仅一个 Tool 节点 |

## 2. 依赖拓扑:最硬的架构证据

对全部 24,638 条 CALLS 边按包聚合,**跨包组的直接调用几乎为零**——唯一一条是 `client -> test-support`(119,测试基建)。包内自调用排名:client 6,560 > scripts 1,692 > apps 1,161 > core 1,092 > typert 1,002 > session 923 > host 851 > subagent 705 > llm 615 …

**结论:包与包之间不互相调用,全部经 Cordis `ctx` 服务注册 / 类型化事件交互。** 这不是文档宣称,是图里可验证的事实。对比:hermes/openclaw 的包间 CALLS 密度远高于此(单体/网关式),dsh 的"一切皆插件"在调用图上表现为**包级零耦合**。

IMPORTS 拓扑(7,559 边)呈星型:

- `client`(Web 前端运行时)是唯一的大消费者:`client -> todo 303`、`-> workspace 47`、`-> sdk 14`、`-> session-query 12`、`-> host 12`……前端作为"组合点"直接 import 能力包。
- `docs -> *`(约 500 边)是 doc-typecheck 门禁:文档里的代码片段被真实编译,依赖全部包。
- 能力包之间仅零星导入(`subagent -> core 14`),且方向都是"消费方 → 核心词汇包"。

## 3. 热点符号(入度 CALLS 排名)

| 符号 | 位置 | 入度 | 解读 |
|---|---|---|---|
| `FsError` | fs/fs/types.ts | 56 | 能力错误类型是全包消费点 |
| `MockAdapter` | agent-loop/tests | 48 | 测试替身渗透率极高(无 key e2e 的基础) |
| `LlmError` | llm/llm | 48 | 同上,错误词汇是窄腰 |
| `SessionQueryError` | session-query | 48 | |
| `Inbox` | core/agent/inbox.ts | 34 | **agent 循环唯一输入口**,与架构文档一致 |
| `LocaleRuntime` | client/locale | 33 | 前端 i18n 中枢 |
| `SubagentError` / `HarnessError` / `WebError` / `StorageError` … | 各能力包 | 10-25 | 每个 seam 一个错误类型,被广泛引用 |

**模式:每个 capability seam 的"错误类型 + 词汇类型"是实际的全局消费点,而不是服务实现。** 实现可换、词汇稳定——这正是 seam 三角色(Service Definition / Provider / Consumer)在图上的投影。

## 4. 主执行流(300 flows 的头部)

| Flow | 步数 | 入口 → 终点 |
|---|---|---|
| proc_0/1 | 10 | `ToolRuntime.dispatchToolBody` → `runSchemaCompiler` / `authorError` |
| proc_2/3/4/9/10 | 7-8 | `BasicCompactionEngine.compactNow` → inbox claim / waterfall / `requestProposal` / 投影 |
| proc_6 | 7 | `SessionRuntime.constructor` → `ProjectionValueStore.subscribeAny`(web 客户端会话投影) |
| proc_7/8 | 7 | `FaceModelEmitter.runtimeModel` → typert 渲染器(类型图 codegen) |
| proc_12-20 | 6 | `WorkflowExecution.agent` / `DynamicCordisRunnerService.run` → 沙箱陷阱(self-modification:agent 挂载自己的插件) |
| proc_21-23 | 6 | `GoalService.edit/resume` → goal fold(同会话目标管理) |

两条逐步轨迹:

**工具执行管线(proc_0)**:`dispatchToolBody → resolveExecution → get → view → requireCodeTransport → createRunCodeTool → defineTool → parameterSchemaSpecToJsonSchema → compilePropertyMap → runSchemaCompiler`。即:分发 → 解析执行视图 → code-mode 包装 → schema 编译。守卫/审批在 `tools/pre-execute` 事件上,不在调用链里(再次印证事件化)。

**压缩唤醒循环(proc_2)**:`compactNow → runMaintenance → wakeDriver → kick → turn → preStep → claim(Inbox) → claimed`。压缩完成后经维护钩子唤醒驱动、开新 turn、从 inbox 取输入——与 `docs/architecture.md` 的 turn flow 图完全对账。

## 5. ReactLoopAgent 360°(core/agent-loop/src/agent.ts:63-495)

- 被 `AgentLoop.prepare`(插件装配点)构造;契约回归测试直接引用。
- 方法面:`step` / `buildRequest` / `send` / `followup` / `steer` / `inject` / `cancel` / `runMaintenance` / `setPhase` / `status` + 内部 `inserted/discarded/claimed`。
- `step`(331-400)与 `buildRequest`(406-494)是循环心脏:一步 = 一次模型请求 + 工具批次;`buildRequest` 组装 prompt sections + tool schemas。
- 上游影响面极小(仅 prepare + 测试)——**换循环实现只需换插件**,与"连 agent loop 都是插件"的宣称一致。

## 6. 社区结构

最大社区:Cluster_1674(66 符号,cohesion 0.94)、多个 `Tests` 社区(30-44 符号,cohesion 0.83-0.99)、`Client`(27)、`Chat`(21,cohesion 0.99)、`Input`(20)、`Scripts`(26)。
**测试自成高内聚社区**,与"逐文件 100% 覆盖率"纪律吻合;前端按 UI 概念(Chat/Input)聚簇而非按文件目录。

## 7. 与既有参考项目的关系

| 维度 | dsh | pi | hermes | openclaw | NGOAgent |
|---|---|---|---|---|---|
| 组合机制 | 纯插件树(cordis.yml 层叠) | 代码内固定 + 配置 | 插件目录 + 配置 | 扩展 + Gateway 配置 | DDD + builder wiring |
| 包间耦合(图证) | **近零 CALLS** | 中 | 高 | 高 | 高(单体 internal/) |
| 服务对象 | 项目/工作区 | 项目 | 人(全局) | 人(全局) | 项目 |
| 状态真相 | append-only 会话日志 | JSONL 转录 | SQLite | SQLite/JSONL | 状态机 + 持久层 |

dsh 是唯一把"包级零调用耦合"做到图可验证程度的样本;其代价是大量事件/注册样板与极高的工程门禁密度(scripts 自调用 1,692,全仓第二)。

## 8. 对 grok-build / NGOAgent 的启示

1. **词汇类型是真正的接口**:错误类型入度远超服务类。脱敏/重构时先稳定词汇(`*Error`、消息/事件 map),实现随便换。
2. **事件化守卫优于调用链守卫**:审批/策略挂在 waterfall 事件上,调用链保持干净;Rust 侧可用 trait + 中间件模拟,但 dsh 证明事件版能同时服务 UI/遥测/审批多方。
3. **MockAdapter 渗透率 = 无 key CI 的基础**:测试替身要做成一等公民(dsh 的 `llm-replay` / faux provider 同义)。
4. **前端作为唯一大消费者是健康的星型**:host/client 直接 import 能力包,而能力包互不 import——Rust crate 依赖图可照此收敛。
5. **doc-typecheck 门禁**(docs 导入全部包)是文档不失真的硬手段,成本是 docs 成为依赖汇点。
