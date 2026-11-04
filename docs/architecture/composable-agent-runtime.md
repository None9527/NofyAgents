# Agent SDK 早期演进记录

> 2026-11-03：本文保留早期SDK抽取与适配记录，不是当前完整API或旧产品兼容承诺。原Shell/Sampler/CLI及其对照脚本已在CLEAN5b移出，下文涉及它们的验收只代表历史阶段，不再执行或作为施工门槛。现行入口见[框架总览](../../README.md)、[Host说明](../../crates/common/nofy-agent-host/文件说明.md)及[独立SDK消费者](../../fixtures/agent-runtime-consumer/README.md)。配置编译、SDK示例或冻结快照不等于完整常驻平台或执行中更新。
- Owner：Agent 框架维护者。
- Read When：研究SDK演进与早期设计依据；现行实现以源码、Rustdoc和当前验收记录为准。
- Update Trigger：历史归档或替代入口变化。
- Validation：当前框架使用下述独立SDK/依赖边界入口，不再运行旧产品对照。
- 状态：2026-10-27起的历史记录；实际公共入口为 `nofy-agent-runtime`。

> 2026-10-29 施工补充：本文描述已实现的 SDK，不代表所有原能力已完成可配置模块化。C1–C6 已通过阶段验收，包括真实自研记忆、Prompt/规则/Skill、上下文策略和原压缩引擎接入。运行配方/会话输入治理、workflow 配置、管理 API 与原始预设全量验收仍按 C7–C10 继续。当前入口为[全能力模块化闭环计划](../superpowers/plans/2026-10-28-agent-modularity-closure.md)的阶段账本；下文旧测试记录仅证明当时所覆盖场景。

## 模块与依赖

公共入口位于 `crates/common/nofy-agent-runtime`。契约和 SDK 放在同一 crate，按下表拆分职责；配置、事件与持久化均有独立模块。HTTP/进程等具体执行器位于显式选择的下游适配包，避免默认 SDK 引入宿主依赖。新包由已有 workspace member 的 path dependency 自动登记，根生成文件 `Cargo.toml` 未修改。

| 模块 | 可替换的能力 | 默认行为 |
|---|---|---|
| `agent` | AgentSpec、Components、Builder、Middleware、invoke/stream | 实例级装配，无全局发现 |
| `registry` | ModuleDefinition/Ref、Descriptor、Factory、实例级 ModuleRegistry | 显式版本、配置/schema/依赖/能力要求校验；禁止覆盖已定义版本 |
| `compile` | AgentDocument、AgentDefinition、CompilationSnapshot、compile_document/compile_agent | 私有注册表快照，经原 Builder 构建；不另写执行循环 |
| `driver` | RunHost / Step / drive；兼容本地 future 的 drive_with | 唯一推进驱动，宿主提供一步行为 |
| `coding` | CodingHost、公共七阶段配方、重复动作/Todo/截断恢复策略 | 纯策略不依赖 SessionActor，宿主显式提供 I/O |
| `pack`（feature） | 完整 PackManifest 编译 | 所有引用通过宿主绑定，缺失即失败 |
| `recipe` | 可注册 RuntimeRecipe / AgentStage、稳定边界、纯决策与持久化进度 | 通过 runtime.recipe/stage.literal 配置；外部 I/O 仍走 Tool/Hook |
| `pipeline` | 具名 Stage、Pipeline、Flow::Next / Restart / Finish | 可替换的有序阶段，支持本地 actor future |
| `model` | Model.complete/stream、typed 多模态消息、能力、参数 schema、结构化输出与失败信息 | complete 旧实现自动适配；无隐式连接或凭据 |
| `hooks` | EventCatalog、HookRule/Handler/Bus、Factory、HookJournal、控制与事实 outbox | 显式订阅与 producer、Patch 重验、暂停/未知结果持久化与对账 |
| `events` | RunEvent、EventEnvelope、EventScope、EventSink、RunStatus | 持久 sink 先写、live channel 背压；取消可跳过阻塞 live send |
| `settings` | SettingsSource、SettingsResolver、StaticSettings、Settings | 显式来源按顺序覆盖，默认 32 次模型调用 |
| `prompt` | Prompt、PromptTemplate、StaticPrompt | 显式模板参数，不加载项目规则 |
| `tools` | ToolSource、ToolSnapshot、ToolCatalog、ToolEntry；复用既有 Tool / ToolDispatch | 按包选择、重名失败、注册/执行时校验 schema |
| `policy` | 最终工具准入，Allow / Deny / Pause | 未安装策略时由应用承担授权选择 |
| `context` | 每次运行的能力绑定、thread/run ID、取消 | 不隐式绑定 cwd、终端或 HOME |
| `context_policy` | 可注册的上下文计划与变换、持久化压缩进度 | 保留系统前缀和当前回合，检索内容不写入压缩输入 |
| `governance` | 共享 BudgetStore、原子预留/结算、未知回执和预算审计 | 已接模型、Tool、子 Agent、压缩和执行型 Hook；宿主显式安装预算 floor |
| `state` | RunState、版本化 Checkpoint、Checkpointer CAS | 默认内存实现；持久化显式选择 |
| `durable`（sqlite feature） | SqliteStore、事务 CAS、租约与 GuardedCheckpointer | 显式绝对路径、复用现有 journal 模式、FULL 同步 |
| `supervisor`（sqlite feature） | RunSupervisor、运行树、持久审批与子调用对账 | 同树后端与 fence，原会话格式不迁移 |
| `memory` | ContextSource、MemoryStore | 按显式 namespace 检索，不默认写入记忆 |
| `composition` | sequence、route、parallel、Agent::as_tool | 同一 Agent API，分支有独立 namespace |
| `workflow`（feature） | 既有 Rhai 引擎到 Agent 的适配 | 复用已有 journal，不复制图引擎 |

`nofy-tool-types` 拥有 canonical ToolDefinition / FunctionTool。`nofy-tools` 和 `nofy-sampling-types` 重新导出同一 Rust 类型，wire 形状不变。sampling-types 不再通过 schema 类型依赖具体工具实现。

默认 runtime 的 normal 依赖闭包不包含 nofy-tools、nofy-shell、nofy-agent、workspace、ACP、daemon、pager、sandbox 或 workflow。启用 `workflow` 才选择 Rhai。执行 `python3 scripts/check-agent-runtime-boundaries.py` 可复查。

## 创建新用途 Agent

完整可执行示例：`crates/common/nofy-agent-runtime/examples/business_lookup.rs`。

```bash
cargo run --locked --offline -p nofy-agent-runtime --example business_lookup
```

示例只注册业务模型、自定义 typed lookup 工具和业务提示词，不需要密钥、外部服务、终端或工作目录能力。

装配流程：

1. 用 `Components::default()` 建立实例级注册表，将 `Arc<dyn Model>`、`Arc<dyn Prompt>`、ToolCatalog、策略或 context source 放入各自 map。
2. `AgentBuilder::new(name).model(id).prompt(id).tools(pack_id).compile(&components)` 解析组件引用。也可反序列化 AgentSpec 后 `from_spec`。
3. `RunContext::new(thread_id, run_id)` 绑定当次取消与 capabilities；凭据和连接放在能力中，不放入 AgentSpec / checkpoint。
4. `agent.invoke(RunInput::new(prompt), context).await` 得到 Completed / Paused / Cancelled / BudgetExceeded。`stream` 使用相同执行路径，额外提供事件 channel。

新用途只更换组件。增加业务工具实现现有 `nofy_tool_runtime::Tool`，通过 `ToolEntry::typed` 注册；无需改 Agent 枚举或 runtime。更换模型实现 Model。高级提示词渲染实现 Prompt。业务路由在应用选择组件，内核不判断业务领域。

多个 Agent 可用 `composition::sequence_agent` 编译可恢复顺序配方、`route` 选择、`parallel` 并行，或 `child.as_tool(name, description)` 加入父 Agent 的工具包。`sequence` 保留仅返回文本的便捷接口；需要暂停/恢复时使用 sequence_agent 的同一 invoke/RunOutcome API。子运行继承取消和显式能力；工具封装必须由应用决定是否收窄这些能力。

### 持久化、审批与嵌套控制（C2）

显式启用 sqlite feature，使用绝对路径打开 `durable::SqliteStore`；将它提供给 `supervisor::RunSupervisor`。执行 `execute(&compiled, input, context)`，使用稳定 run/thread ID；新一轮使用新的 run ID，恢复沿用原 ID。`record`/`children` 查询运行与子运行，`pending_approvals`/`decide` 处理完整调用绑定的审批。启动下一轮后，旧 run ID 不得恢复覆盖该 thread。

重启后从 RunRecord 取 CompilationSnapshot，调用 `snapshot.restore(&host_registry)` 重新绑定匹配的 Factory 与模块版本。Supervisor 在事务内检查租约 fence 与 CAS；失效的 worker 不可写 checkpoint。运行树统一使用父后端，嵌套子 Agent 的独立后端在独立运行时仍可用，加入持久执行树后以父后端为准。

普通 ToolDispatch 默认不可恢复。Agent-as-Tool 显式声明 is_resumable 和不可变 recovery_identity，作为配方和动态快照身份的一部分；它重新接回已持久化子工作，不是重试外部副作用。子暂停、取消、超预算和执行错误不会再被转换成普通模型工具错误。父结果写入失败后可以从已完成子 checkpoint 接回。

子工具留下无结果 intent 时，恢复仍为 uncertain；`RunSupervisor::reconcile_child` 只接受当前 root 的已记录子调用，核对完整 call 和实际 composition 后写入操作者证据。不要用“重试”清掉未知结果。单机租约不等于跨外部服务 exactly-once。

Rhai 持久恢复需在 RunContext 显式安装 `workflow::WorkflowCheckpointer`。它固定 script/args/全部 Agent composition，并绑定统一子后端。暂停以新的 HostError::Paused 非捕获控制传递，顺序和并行面板恢复后均重接子 checkpoint；不得编辑旧运行脚本后继续。无共享绑定的原无状态完成用法保留，不宣称能恢复暂停。

### 模型与事件（C3）

SamplerModel 复用现有 Chat Completions、Responses、Messages 三类原生流解析器，保留 Opaque item、工具调用配对、usage/stop/refusal 与提供方元数据。ModelCapabilities 声明适配能力和 settings_schema，编译时校验参数；未知字段、非法范围、不支持的后端参数和远程 schema 引用明确失败。图片输入使用 UserParts，适配接受 HTTP(S) 或 data:image URI，不读取任意本地路径；具体部署模型是否支持图片仍由宿主选择匹配的模型。

json_schema 对最终答案在原始 schema 根校验；本地引用保留语义。结构化修复受 structured_output_retries 限制（0–5，默认 2），累计 usage 并保留失败尝试与成对工具回执，拒答不触发修复。Messages 的工具形式终稿不会派发为真实工具。ModelFailure 保留类别、状态码、retryable/retry_after/code；执行重试所有权仍在后续 C7 收敛。

每次 invoke 有一个 Terminated 终态，区分完成、拒答、截断、审批暂停、取消、超预算和失败；Finished 是该次调用结束的兼容事件。SQLite envelope 含版本、全局游标、时间、root/run/thread/parent/node 身份。失败的持久事件写入阻止后续工具派发；事件观察不是外部副作用的事务回执。Completed 的 state.completion_info 可供 workflow 读取结构化答案与拒答信息。

## 设置与 Nofy 预设

### 配置客户端入口（C1）

宿主向 `registry::ModuleRegistry` 显式安装 Factory。`InstanceFactory` 可暴露已有 native 模型/工具等实例，并要求独立实现 revision；`PromptFactory` 接受 template/values，`StaticPromptFactory` 接受原样 text。客户端 JSON 形状见 `fixtures/agent-runtime-consumer/configured-agent.json`，使用 `compile::compile_document(document, &registry)` 编译。

ModuleRef 由 id/version 两字段组成，不能用容易冲突的字符串拼接代替身份。工厂描述含配置、输入/输出 schema、依赖种类和所需宿主适配能力。`provide_capability` 只声明已安装适配，不能授予运行时工具权限。所有可达依赖与插槽种类在构造前检查；重复版本、未知配置、缺引用、依赖环、远程 schema 引用和未安装能力均失败。Factory.build 必须无 I/O，实际连接/凭据由宿主绑定。

编译快照包含配方及所有可达模块定义、Factory revision，纳入恢复身份，包括通过新入口选择的 middleware/checkpointer/binding；同名但变更实现 revision 会拒绝恢复旧 checkpoint。旧 AgentBuilder 接口不变。客户端文档在注册表副本内编译，不能覆盖宿主定义，也不会把客户端草稿发布到共享注册表。

当前配置入口支持十六类实例：Model/Prompt/ToolPack/Policy/ToolSource/ContextSource/ContextPolicy/Governance/Stage/StageSource/Recipe/Middleware/Checkpointer/Binding/Hook/HookHandler。HTTP/脚本 Tool、Hook、自研记忆、Prompt/规则/Skill、压缩、配方和预算已有配置适配；workflow 配置图已按 C8b 接入，控制器恢复/Goal 与管理接口继续按 C8–C9 施工。

### 可配置执行器与宿主权限（C4）

`nofy-agent-executors` 是单独选择的下游适配包，默认 SDK 不依赖它；原 Nofy 宿主可启用 `nofy-agent/executors` 后从 `runtime::executors` 使用。宿主先安装资源，再注册 Factory；Factory.build 只校验、选引用和构造句柄，不启动连接或进程。

- `tool.http`：引用宿主 HttpConnection，限定 base URL 路径、HTTP 方法和 credential_ref。配置支持 typed JsonBinding 输入映射、JSON 输出指针/schema、timeout 与输入/输出字节限额。禁用重定向和环境代理；错误不返回 token、请求 URL 或远端响应正文。凭据每次执行由 CredentialProvider 解析，配置/快照只有引用。
- `tool.process`：引用 ProcessEnvironment 已安装的程序或解释器。可执行文件内容摘要进入资源身份并在启动前校验；argv 与 script 固定在已发布模块，运行输入只走 JSON stdin。环境变量先清空，cwd 限于明确工作区，超时、取消或 future 丢弃清理整个进程组。输出必须是有限大小 JSON 并通过 schema。脚本语言由宿主安装的解释器及 script_flag 决定，不把模型输入插入 shell 源码。
- `tool.mcp`：位于 nofy-mcp 的可选 agent-runtime 适配，配置只能选择宿主已准入服务器。沿用每轮固定 client/schema 快照与连接 epoch；未完成调用遇到重连身份变化仍安全拒绝，显式重绑定流程由后续管理阶段收敛。
- `model.sampler`：位于 nofy-sampler 可选 agent-runtime 适配，只接受 connection/model 引用，不能上传 API key 或任意 base URL；host-owned 连接与模型允许名单生成版本身份。
- `policy.tool_scope`：声明精确允许工具名，是收窄策略，不能覆盖其他 Deny/Pause。`ModuleRegistry.require_policy(ref)` 将宿主强制策略加入编译，客户端省略 policies 也不能移除；快照恢复要求相同的强制策略集合。父级强制策略在子 Agent 与其 bindings 后仍生效。

HTTP 模块配置示例（完整外层仍是 ModuleDefinition）：

```json
{
  "reference": {"id":"lookup","version":"1"},
  "factory":"tool.http",
  "config": {
    "contract": {
      "name":"lookup",
      "description":"Look up a business record",
      "input_schema":{"type":"object","required":["id"],"properties":{"id":{"type":"string"}}},
      "output_schema":{"type":"object"},
      "timeout_ms":30000,
      "effect":"read_only"
    },
    "connection":"business-api",
    "method":"POST",
    "path":"lookup",
    "credential_ref":"business-token",
    "input":{"kind":"input","pointer":""}
  }
}
```

EffectSemantics 只用于治理/审计声明，不开启自动副作用重放。HTTP/进程工具仍遵守 C2 的 intent/uncertain 对账协议。WorkflowDocument 已支持配置编译并导出 as_tool；tool.workflow/hook.workflow 已接入冻结 WorkflowLibrary；管理发布与历史装配由 C9 接线。

`nofy-workspace::permission::runtime::NofyPermissionPolicy` 直接复用 PermissionHandle 和原 managed-policy、路径解析、审批流程，保留 per-call cwd，识别 use_tool 包装后的目标。宿主把它安装为 required policy；旧 shell 原 fire site 继续自己管理准入，不额外双装相同策略。`NofySandboxGuard` 只接纳已由原宿主实际施加的 sandbox，没有 enforcement 就拒绝进程执行；不会在 Factory 中不可逆地修改宿主 sandbox。独立宿主可实现明确版本的 EnvironmentGuard，不能由客户端配置选择关闭它。

原预设 ToolBridge 适配通过 FinalizedToolset.call_streaming_with_context 保留调用能力与工具 progress；registry 自己的资源、renderer、行为版本和 inner dispatch 仍优先。use_tool 的内层执行保留父上下文并移除递归 inner dispatch。

### Hook 模块（C5）

Hook 不再只借用 Middleware。`hook.subscription` 配置事件、priority、匹配 JSON pointer/value、超时及 open/closed 失败策略；依赖插槽 handler 必须为 HookHandler。AgentDefinition.hooks 选择订阅版本。每个模块引用、handler 工厂 revision、事件声明与完整可达定义进入编译和恢复身份；手动装配可用 HookRegistration/HookBus 和 Agent.with_hooks。

```json
{
  "reference":{"id":"audit-gate","version":"1"},
  "factory":"hook.subscription",
  "config":{"event":"before_tool","priority":10,"timeout_ms":5000,"failure":"closed","matches":{"pointer":"/call/name","equals":"lookup"}},
  "dependencies":{"handler":{"id":"audit-handler","version":"1"}}
}
```

Handler 可以是 InstanceFactory 安装的 native 方法，或 `hook.executor`（依赖 executor: ToolPack，config.tool 选择 Tool）。后者复用 C4 的真实 HTTP/进程执行器，接收完整 HookEvent JSON，返回 `{"decision":"continue"}`、deny/reason、pause/reason、patch/payload 或 stop/reason。Patch 是替换完整事件 payload；工具 ID 不可变，参数 schema 和最终宿主策略在派发前重验。Stop 只允许结束 gate，覆盖之前收集的继续工作请求，原因保存在 CompletionInfo.hook_stop_reason。普通事实事件不能 Deny/Patch/Stop。

HookBus 对自定义事件要求显式 EventDeclaration、所属 producer ModuleRef 和稳定 operation ID；只添加订阅不会自动触发。调用链检查重复事件和最大 16 层递归。runtime 自带声明中，Agent 已实际产生 session_start、user_input、turn_start、before/after_model、before/after_tool、tool_failure、permission_requested/denied、before_stop、turn_done/error/cancelled；Agent-as-Tool 产生 subagent_start/finished，子 Agent 的 subagent_stop 是可中断的结束 gate。session_idle/end 由真实宿主协调器调用 Agent.notify_session，不能把每次 invoke 结束当成会话退出。C6 的上下文策略实际产生 before/after_compact；workflow/node 事实由 C8b 图执行器实际生产，并使用持久 fact outbox。

安装 Agent checkpointer 后自动绑定 HookJournal；独立事件总线可显式安装 HookJournalBinding。暂停需要完整 Agent 状态后端；已执行 handler 的结果、失败和 Patch 可重接，未回执的 intent 返回 uncertain_hook。HookJournal.reconcile 只接受原事件、版本与订阅的明确结果，不盲重跑副作用；相同决定可重试，已经对账的结果不能翻转。原 middleware 的工具准备和模型请求也在暂停前保存，恢复不重复应用。工具/模型完成事实随其结果一起进入 checkpoint outbox，Hook 未完成时保留待办。取消/错误有实际终止事件，取消清理窗口有界。

原 nofy-hooks 的可选 agent-runtime feature 提供 LegacyDispatcher，继续调用原 matcher、disabled/managed-policy、HTTP/command dispatcher 与 Stop 信号合并；原 fail-open 保留。细分成功、跳过、阻止、失败放行状态写公共事件，可能含展开 URL 的旧诊断不复制到公开事件。原 command runner 现在边读边截取有限前缀并持续 drain，future 取消/超时可清理进程组；dispatcher 使用 async span instrumentation，不跨 await 持有非 Send guard。

nofy-agent-lifecycle 的可选 agent-runtime feature 提供 LifecycleHandler（已有 contributor 到模块）和 LifecycleEmitter（宿主事实到事件总线）。Send contributor 依靠既有 blanket impl 可用于 LocalSet；没有重写 SessionActor。宿主必须为每类事件选择唯一 fire site，不能同时安装旧路径与新 bridge 处理同一事件。可恢复 workflow handler 使用 hook.workflow；hook.executor 继续明确拒绝把调度器当作普通无状态函数。

### Prompt、规则、Skill 与自研记忆（C6）

`nofy-agent::runtime::prompt::DocumentPromptFactory` 注册 `prompt.document`。配置包含有序 fragments、变量 schema、values、separator；每片段保留 id 和版本化来源。Literal 不再解析模板，Template 使用严格变量检查和有界 MiniJinja；没有文件 loader 或环境发现。`DocumentPrompt::preview` 与实际 `Prompt::render` 使用同一路径，返回文本、片段来源及字节范围。工具视图只来自该 Agent 的实际工具列表，`tools/tool_names` 不能由上传变量覆盖；业务 Agent 不需要 cwd。

`runtime::sources::ImportRoots` 是显式导入动作，调用原 AGENTS/rules/Skill loader；未选 HOME 时不先读取再过滤。旧入口仍保留原默认目录、兼容开关、优先级和插件去重。导入结果的正文/路径/元数据进入模块配置快照，修改磁盘文件后须发布新模块版本。`context.rules` 保留原 reminder 格式及来源，`context.skills/tool.skills` 复用原 SkillManager 的条件匹配、目录优先级和 listing，以及原正文裁剪、参数替换和调用格式。成功文件工具回执可以激活已导入的条件 Skill；disabled、user-only 和命名空间继续生效。Skill 的 model/effort/allowed_tools 通过下述显式 execution 绑定作用于子 Agent；没有执行绑定时保留原载入行为，执行覆盖明确报错。

`nofy-memory/agent-runtime` 提供 `runtime::InstalledMemory`、`MemoryModule` 和 `MemoryFactory::{tools,context,capture}`，分别注册 `tool.memory/context.memory/hook.memory_capture`。宿主安装现有 `NofyMemoryService`、独立资源版本和读写/子运行/学习授权；配置只引用资源名并收窄授权。完整支持 search/list/get/explain/remember/revise/forget/undo/snapshot/consolidate，复用原 canonical 文件、索引、墓碑、敏感内容判断、确认字段和回执；没有第二套记忆数据库。撤销令牌仍遵循原引擎的进程内有效期。

默认只读项目记忆，子 Agent 默认无读取权限；即便复用同一 Arc，操作仍逐调用检查 lineage 和区域，读结果和 undo 不能绕过作用域。搜索在排名/限量前筛选区域。检索是临时非权威上下文，不持久追加到历史；`ContextSource::revision` 在构造和恢复模型请求时检查世代。暂停期间遗忘导致旧 prepared request 失效，并以新的输入版本重新执行 before_model。

capture 使用现有 CaptureQueue。内核仅在成功回合经 durable checkpointer 保存后，为 turn_done handler 绑定不可由 JSON 构造的 `DurableTurnReceipt`；capture 检查顶层标志，从回执提取当前真实输入之后的可见对话，排除系统/工具/检索、停止反馈和压缩摘要。真实入队回执区分 queued/duplicate/ineligible，持久队列可由宿主显式启动的原 CaptureWorker 处理。仅提供字符串 ID 的旧 MemoryService.capture 不再假报 queued；自动学习开启时提示需要宿主持久回执适配，原 shell 的 barrier→CaptureQueue 路径不变。

### 上下文策略与压缩（C6）

`AgentDefinition.context_policies` 选择 ContextPolicy 模块，直接装配可调用 `with_context_policy(versioned_identity, policy)`。计划、before_compact gate、变换提交和 after_compact 事实分开持久化；未知事实 handler 可以对账恢复，不重复生成已提交摘要。系统消息及当前回合的原消息范围必须逐项相同，工具配对和原生 Opaque 字节随保留范围一起保留。摘要用量累计到 RunState，并通过 ModelUsage 标记 context_compaction。

`nofy-compaction/agent-runtime` 的 `runtime::CompactionFactory` 注册 `context.compaction`，依赖 model 模块。它复用已有 full-replace 采样/清洗/组装与安全 tail selection，支持阈值、保留预算、最小压缩量、超时和有限重试。默认沿用 bytes/4 与图片估算，可由宿主安装带版本身份的 tokenizer。FullReplace 支持模型已理解的 Opaque 历史；TailKeep 遇到没有类型视图的 Opaque 明确失败。压缩只处理真实历史，随后重新检索记忆和规则/Skill；临时记忆不会被揉入长期摘要。原编程宿主的两遍压缩与触发顺序保持原接入。

### 可注册配方与纯决策阶段（C7c1）

`AgentDefinition.recipe` 选择一个 Recipe 模块；`RuntimeRecipe::new(versioned_identity, bindings)` 和 `Agent::with_recipe` 提供直接装配入口。`runtime.recipe` 按配置声明 name、at、stage 依赖别名，`stage.literal` 提供数据型阶段；宿主可用 Stage 类型的 InstanceFactory 安装自定义 `AgentStage`。合法边界是 before_model、after_model、before_tool、after_tool、before_stop，同一边界按配置顺序执行。不能通过配置删除/重排模型响应校验、工具 schema 与权限准入。

Stage 是有界、确定性、无副作用的同步决策；evaluate 只接收只读状态、当前调用/结果与自身 data，返回新 data 或 Next/Feedback/Pause/Limit/RejectTool。外部请求、进程或异步流程应通过 Tool/Hook；不能在 native stage 中隐藏 I/O。RejectTool 仅在 before_tool 合法，Limit 持久化停止原因，Pause 保留当前位置并在显式 resume 时重新计算纯条件。feedback 在完整工具结果配对后才进入模型历史，并标记为 synthetic，自动学习不会摄入它。

after_model/after_tool 的待执行 frame 与原结果同一检查点提交；after_tool 使用既有消息索引，不复制大结果。每个 stage 的状态应用与位置推进通过 CAS 提交，恢复不重复应用已提交的效果，也不会丢失待运行的后置阶段。单配方最多 128 个具名阶段，单效果 64 KiB，总阶段进度 4 MiB/8192 个边界，待注入反馈 256 KiB。新输入重置回合级策略数据。模型/外部副作用的恢复约束仍依赖所安装的治理与工具恢复协议；纯 stage 的进度不替代它们。

`ModuleFactory::config_dependencies` 是新增的纯预构建查询，默认返回空映射；可变 stage/图节点依赖不要求为每个依赖数量重新注册一个工厂。`ModuleRegistry::required_dependencies(factory, config)` 返回固定与配置派生依赖的完整 kind 映射，配置派生项不能覆盖固定依赖，所有缺失、类型与环检查仍在任何 build 之前执行。编译快照继续记录精确模块定义与工厂版本。

`recipe::policies::RepeatStageFactory` 注册 stage.repeat，放在 after_tool。它使用原 IdenticalToolCallRun 的分层提醒/停止算法，按实际调用和结果计数、持久化 nudge latch；分类与 true-noop 工具由配置指定，参数对象排序后生成稳定签名，不受 provider call ID 变化影响。

`LengthStageFactory` 注册 stage.length，放在 before_stop，复用原 LengthSalvage。max_continues 默认 2、最多 16；只对普通文本的 length/max_tokens/max_output_tokens 继续采样，拒答与结构化输出跳过。实际文本片段存入独立的有界 accumulator，最终按原顺序拼接；不是重新生成或改写片段。单 buffer 最大 1 MiB，仍受总阶段进度上限约束。提醒仅注入一次，达到次数上限保留截断状态。stage.literal 的新 ContinueText/CompleteText 也只能在最终文本边界使用，不能修改结构化/拒答或未配对工具结果。

Todo 观察/结束策略已接入；Goal 的编排端口与认证/输入治理仍在施工，不能用已接入的 gate 替代全部 C7/C8 验收。

### 原有设置入口

`governance::GovernanceFactory` 注册 `governance.budget`，配置只引用宿主安装的 `InstalledBudget`，支持 limits 与有限模型 retry。`AgentDefinition.governance` 显式选择模块，直接装配使用 `with_governance`；`ModuleRegistry::require_governance` 设置客户端不能省略的宿主 floor。子 Agent 继承所有父 floor，bindings 不能移除；恢复时 floor 和资源版本必须一致。Supervisor 下的预算与检查点必须使用同一 SQLite 数据库，实际操作切换到根租约的 GuardedCheckpointer，拒绝另一个数据库或内存账本。

BudgetStore 的 enroll 固定 deadline；reserve 预留不等于派发许可，只有原子 claim 的 Dispatch 才允许首次执行。已结算返回 Replay；已 claim 而没有结果的 primitive 返回 budget_uncertain，必须显式对账；有不可变恢复协议的子 Agent/控制器才可重新连接。已保存模型请求持有稳定 operation ID 和上下文世代，进程恢复不通过 steps+1 生成另一次请求。模型与 Tool 结果先写预算回执，再提交 Agent 状态；两者之间丢失进程时使用已保存的回执，不重复调用。工具显式 reconciliation 同时释放账本槽位，已记录结果只能通过 resume 消费。

模型步骤、实际模型请求、Tool、子调用、并发、活跃子运行、深度和固定期限在根执行树累计。`sample_model` 是主模型、压缩的共同边界；`dispatch_tool` / `tool_operation` 供已经过准入的执行适配使用。自定义 native 代码由宿主负责遵守这些边界。HTTP/进程 Hook 和原 LegacyDispatcher 的每个实际 runner 均经过宿主 policy floor 与预算；原 disabled/matcher/managed policy 和停止聚合逻辑复用，预算/取消/恢复暂停不会被 fail-open 吞掉。默认不安装治理时，保持原单 Agent 预算和重试所有权。

硬 token 限额要求 `Model::request_bound` 提供可信输入/输出上界；缺失即在请求前失败。`SamplerModel::with_request_limits(ProviderRequestLimits)` 或 `SamplerConnection::with_request_limits` 由宿主声明提供方强制执行的每请求上界，输出 cap 实际发到提供方；不能把 `SamplerConfig.context_window` 或 bytes/4 当作证明。配置工厂和安装上界后的模型会固定连接/模型，只允许同连接的 API key 轮换。

SDK 的 SamplingClient 流式路径不经过旧 actor 重试循环，传输重试由共享治理边界负责；原生结构化输出修复仍由 Sampler 执行，预留覆盖其最大 HTTP 次数、结算使用实际 repair 次数。压缩的空/退化摘要重试仍由原压缩算法负责；启用治理后不再叠加第二层传输重试。成功回执记录已知 usage；失败或取消而缺少最终 usage 时按预留上界保守结算，缓存值标记 `reserved_upper_bound`，不伪称精确成本。提供方超出声明上界仍记录实际值，并封锁后续请求。截止时间覆盖上下文加载、准入、退避和实际流式等待；外部副作用的不确定结果保留待对账。

通用 Settings 接收已解析的 JSON 值，不读环境或磁盘。原有 Nofy config loader、设置优先级、热更新、credential recovery 留在 shell 宿主，继续使用原入口；它们不会成为业务 Agent 的隐式默认值。

真实模型适配使用 `nofy-sampler` 的可选 `agent-runtime` feature 和 `agent_model::SamplerModel`。它复用 SamplingClient，并将 provider 原生 ConversationItem 放在 Opaque 消息轨道，保留 reasoning / hosted-tool 等数据。直接创建且未固定连接的模型可通过 capability 绑定 SamplerConfig；配置工厂构建的模型保持所安装连接。不要把 Opaque 内容当成跨厂商通用格式。

`nofy_agent::runtime::tool_catalog(&agent)` 将原 Nofy 工具桥接成可选工具包；StaticPrompt 可携带已渲染的原提示词，避免二次解释模板。

原始 CLI / ACP 入口不变。`process_conversation_turn` 委托 `coding_preset::run`，后者通过公共 `Pipeline` 装配具名阶段，最终使用同一个 `driver::drive` 推进。编程专属 Goal/Todo/Plan、压缩、权限、工具并行、事件排序与恢复继续由兼容宿主执行；没有将整个 SessionActor 塞入通用内核。provider 则使用公共 Agent、SamplerModel 与工具包，保留 24 次预算和目标 judge，移除原来的独立模型工具循环。

这是两种 RunHost：通用组件宿主和编程阶段管线。编程预设固定装配 `stationarity → context → maintenance → model → completion → dispatch → convergence`，其顺序定义在公共 `coding::pipeline::<H>()`，宿主端口由 CodingHost 表达。原 CodingTurn 实现这些端口并保留会话 I/O。重复动作、Todo 结束判断和截断恢复的 canonical 实现在公共 coding 模块；旧路径重新导出，其他宿主可直接复用。

公共 `Pipeline::new(Vec<Stage>)` 供其他宿主装配自己的阶段；`replace` 按名称保留位置替换实现。Next 进入下一阶段，Restart 跳过余下阶段并重回首阶段，Finish 返回结果；错误立即结束。末阶段 Next 开始下一轮，因此应用必须安装结束/预算策略。公共 Pipeline 接受应用拥有的状态，不授予原 Nofy 会话的权限或私有 dispatcher。原预设内部装配维持原有政策顺序。

设置载入可实现 `SettingsSource::load(&RunContext)`，然后 `SettingsResolver::new(sources).resolve(&context).await`。后面的来源覆盖前面的来源，object 递归合并，array/scalar/null 替换；来源报错或非 object 时失败，不静默使用残缺设置。resolve 在 compile 前显式调用；默认不安装磁盘、环境或远程来源。示例已用 StaticSettings 接入这个入口。

## 运行与恢复约束

- 编译时检查组件引用和静态工具重名，动态工具在轮开始绑定时检查；工具 schema 必须自包含，禁止注册时读取远程引用。
- middleware 可改写请求或工具参数；最终调用仍经过 catalog、schema 和 policy，不能改调用 ID 或直接获得 dispatcher。
- 无自动工具重试；模型错误显式返回。每轮的 max_steps 是模型调用预算，恢复时继续累计。新用户输入开始新轮预算。子 Agent 各自有预算，不提供跨进程总 token 预算。
- 安装 Checkpointer 后，工具执行前先提交 intent，结果提交后才继续。结果未落盘时恢复会返回 uncertain_tool，必须显式 reconciliation，禁止盲目重放。
- Checkpoint 不保存 Future、连接和 credentials；存储实现必须遵守 CAS。应用须在重启时重新绑定同一组件版本和能力。当前 composition 检查配方与 schema，无法自动识别同名 trait 实现的代码变化，组件 ID 应含版本。
- invoke/stream 共享同一真正模型流与工具 progress 消费链。安装 EventSink 后先等待持久记录，再通知观察者与 live channel；live channel 对正常运行施加背压，断线不停止运行。取消时不等待已堵塞客户端；终态可靠重连使用 SqliteStore.events(root_run_id, after_cursor, limit)，不能把 live channel 当作持久存储。原始 Nofy 流式协议继续走兼容宿主。
- Rhai adapter 当前按请求串行执行 Agent，复用 journal 对已完成节点的重放；文件系统、模板和每次调用的模型/工作区覆盖必须由应用安装专用 adapter，否则显式 Unsupported。跨 workflow journal 与 Agent checkpoint 的外部副作用没有分布式 exactly-once 保证。
- 原有会话存储格式不迁移；通用 Checkpoint 是独立契约。C2 增加可选 SQLite 持久化与监督器，应用也可实现 Checkpointer；Nofy 会话保留原持久化。MCP 动态来源、pack 全字段绑定和公共编程策略已实现。

## 验证入口

```bash
cargo test --locked --offline -p nofy-agent-runtime --all-features
python3 scripts/check-agent-runtime-boundaries.py
python3 scripts/verify-agent-independent-consumer.py --output /tmp/nofy-independent-check
python3 scripts/verify-framework-boundaries.py
```

独立消费者实际在仓库外构建/运行，不依赖原产品宿主；其确定性模型实现只验证SDK契约，不是外部真实模型验收。常驻Host、Loader、预设、恢复及真实模型证据分别见docs/verification，不用旧CLI输出相同替代新框架能力验证。

早期兼容脚本和本文件修改前全文已保存在CLEAN5b恢复目录，原始历史证据不改写，也不继续作为当前产品验收目标。

## 历史验收记录（非当前完成度）

- 新旧 CLI 四类场景通过，工具 schema、系统提示词、调用结果 ID 和请求轮数一致。
- 原 shell 十二组定向回归共 253 项通过（含新增 provider 适配测试及策略迁移回归）：工具并行、取消、turn 处理、压缩、provider 单测、排队、空闲恢复、提示词持久化、认证恢复。
- 公共内核 31 项契约通过，包含公共 coding 策略、动态工具冻结/刷新/恢复和完整 pack 绑定；Sampler 的 Opaque、prompt_text/inline image 两项测试通过，真实 MCP 适配两项测试通过。
- `provider_loop_e2e` 已通过，并新增闲置握手后的 Ping、任务 settled_ok 和目标 judge 调用断言。先前 macOS 断连是 accept 连接继承 O_NONBLOCK，帧读取返回 WouldBlock；daemon 现对接入连接设置阻塞模式。独立探针验证了修改前 Broken pipe、修改后 pong。
- daemon 198 项单元测试通过；七阶段提取后的源码执行语句已与原循环核对，排除具名状态、控制返回适配和格式化差异后顺序一致。
- GitNexus 按阶段刷新；Rust 图可能漏边，不能用 LOW / zero affected 替代上述运行验证。

## 动态工具与真实 MCP

将 Arc<dyn ToolSource> 注册到 Components.tool_sources，再通过 Builder.tool_source(id) 选择。compile 检查引用，invoke 在每轮开始加载并校验 ToolSnapshot；模型声明、schema、policy 和执行共享该轮固定 catalog。下一轮刷新时会同步重渲染工具感知的系统提示词。pending / in-flight 或显式 resume 的来源 revision 变化会在执行前失败，禁止把旧审批交给新实现；应用须保留匹配版本或明确对账旧运行。

真实 MCP 接入位于 nofy-mcp 的可选 agent-runtime feature：runtime::McpToolSource::new(state, explicit_server_names)。应用拥有连接生命周期；来源只选择已准入连接，过滤 model/app 可见性及禁用项。每个 MCP 来源有独立 epoch，防止进程内 client_id 在重启后重复而误认旧审批；dispatcher 固定 Arc<McpClient>，状态中的客户端替换不影响旧快照；调用保留超时、取消和 MCP 错误语义。SamplerModel 保留工具图片为原生 inline image，同时保持原预设 prompt_text。

## 完整 pack 装配

启用 runtime 的 pack feature，先 pack::parse_pack(raw)，再 pack::compile(&manifest, &components, &bindings)。返回普通 Agent，可 invoke、stream、作为工具或组合节点。完整 manifest 的公共装配与既有 daemon 兼容协议是不同入口，原协议行为保留。

| 字段 | 装配行为 |
|---|---|
| id / persona | 独立身份和 StaticPrompt，不二次解释已渲染 persona |
| skills | 组合宿主显式绑定的 Prompt；未绑定失败 |
| model_route | 选择注册模型，缺省使用 host default_model |
| tool_policy | 注册 Policy，host required_policies 始终叠加 |
| mcp | 精确校验名称和 transport，选择 ToolSource |
| subagents | 按 id + provider 绑定 Agent，注册为委派工具 |
| services | 带 revision 的 typed handle；PackServices 按 realm 隔离，子 pack 安装自己的容器 |

PackBindings 可额外选择 host 批准的 tool_packs、context_sources、settings。缺失引用明确失败，不静默丢弃上述字段；packcore 继续拒绝 host-plane 字段和 root realm。

## 仓库外独立消费验收

```bash
python3 scripts/verify-agent-independent-consumer.py --output /tmp/nofy-independent-check
cargo test --locked --offline -p nofy-mcp --features agent-runtime --lib runtime::tests
```

脚本将 fixtures/agent-runtime-consumer 复制到仓库外临时目录，用独立 workspace 和固定 Rust 工具链编译。它只用公共 API 运行业务查询 Agent、research pack、standalone coding host，验证委派、并行、设置、记忆和隔离服务，并拒绝 shell、具体工具实现、daemon、pager、workspace、ACP、sandbox 依赖。共享的只有构建缓存和显式 path dependency；不调用 shell 私有入口。


### Skill 的作用域执行（C7c2b）

`tool.skills` 的可选 `execution` 声明 default_model、元数据 model 到已发布模型依赖的映射、tool_packs/tool_sources、上下文源/压缩/策略、Prompt、recipe 与 Hook 的命名依赖。所有引用先做类型与图校验；编译不读取网络或执行模型。未绑定的模型别名、无效参数或工具规则显式失败。effort 映射 reasoning_effort，并经所选模型 schema 校验。`context.skills` 仅提供目录和上下文，不执行覆盖。

执行型 Skill 使用真正的 Agent-as-Tool，保留父检查点、取消、审批控制及根预算；不修改父模型或 settings，也不隐式继承父 transcript/个人记忆。相同模型连接可沿用宿主已轮换的凭据，换连接使用所选模型已安装的资源。默认 ExactSkillScopeCompiler 按实际工具名收窄；原 Nofy 宿主可安装 `NofySkillScopeCompiler`，复用现有 Bash/Read/MCP/use_tool 规则匹配。Skill 白名单不授予宿主权限，并作为不可移除的父子策略约束。

原 disabled、conditional、user-only、命名空间、正文替换/截断继续生效；模型不能声明自己是用户来绕过 user-only。用户输入邮箱中的显式 Skill 执行入口仍属 C7d。执行身份对元数据排序后取摘要，SQLite 跨进程暂停恢复复用原 child；拒答/截断返回 success=false，结构化值与模型可见文本保持一致。


### 任务观察与结束策略（C7c2c）

`runtime.recipe` 每个 placement 可指定 `source` 依赖（StageSource）；`stage` 依赖仍为纯 AgentStage。源只读、有版本身份、超时和取消；快照最多 64 KiB，在决定前写入同一检查点。源不允许代替受准入的模型、Tool 或 Hook 执行副作用。决定提交失败重用快照；明确暂停后的 resume 重新读取。recipe 工厂实现 revision 为 2，缺源/错 kind/版本变化明确报错。

`stage.todo` 配置 max_fires（默认 2，上限 16）和 plan_tool；与 `source.nofy_todo` 组合装在 before_stop。源由宿主安装真实 ToolBridge 和 TaskActivitySource，按线程绑定读取原 TodoState、终端任务、协调器活跃子任务/Goal。原始 Todo 状态仍由原工具维护和持久化，独立 runtime 不复制 canonical store。

`runtime::tool_catalog_durable` 在原工具返回后等待原资源文件的 checked SaveAndFlush/fsync，再给 runtime terminal。失败会报告工具已执行但资源未确认持久，不能作为成功回执缓存。旧 tool_catalog 和原宿主的后台写入方式保留。该边界仅确认本地工具资源文件，不保证外部服务事务原子性。


### Goal 状态共享与结束 gate（C7c2d）

`nofy-goal` 持有原 GoalTracker/GoalOrchestration/GoalRoleModel，以及原历史、状态迁移、快照和安全 scratch 处理。shell 的原模块路径和 config-types 的模型配置类型保留重导出；不是第二套 Goal store。此库含原同步文件操作，宿主须在适当的受控操作中调用它，不能把状态生命周期操作称作纯 Stage。

`nofy-agent/goal` 可选适配提供 source.nofy_goal，读取宿主安装且绑定 thread 的同一个 tracker。`stage.goal` 放在 before_stop，按只读投影处理 active/paused/budget/complete，active 的自称完成会继续或暂停；max_continuations 默认 3、最多 16，计数绑定 goal_id。原 paused 状态和未知快照仍 fail-closed，锁竞争可以取消。gate 只消费 canonical 完成事实，不执行验收模型，也不自行修改 Goal 状态；配置化规划/执行/验收以及持久 Goal command 仍待 C8 接线，不能把这个 gate 当成完整 Goal 编排器。


### 显式认证恢复资源（C7d1）

`nofy-sampler/agent-runtime` 的 SamplerAuthRecovery 由宿主安装到 SamplerConnection 或直接装到 SamplerModel，配置文档只选择已授权连接。纯编译和 request_bound 不读凭据。Session 模式复用 nofy-auth 的原 session_token_auth_gate/ModelByok，并限定受信 HTTPS bearer；Provider 模式复用 AuthCredentialProvider 刷新契约，可封装原认证 helper。资源身份包含固定 base URL、策略、timeout 与宿主 revision，令牌轮换不进入定义或 factory metadata。

只有打开 HTTP 请求时的精确 401 至多恢复一次；403、本地非法凭据格式及流式失败不触发同一路径。刷新等待可取消/超时，并发请求可重用已经轮换的键。SDK 使用 SamplingClient.new_pinned 的独立无 redirect 传输；原 new 的 shared/H1/mTLS 默认路径保留。工厂固定连接和模型，SDK 记录实际成功链的 model_http_attempts，auth 与 structured repair 共用根预算。

缺 usage 的 401 在可信限额存在时按单次上界加入总量，并在 provider.auth_failed_usage 标注 reserved_upper_bound；没有可信上界则标记 unknown，不能把已知响应量当成完整精确总量。硬 token 限额仍在网络前拒绝不具上界的模型。自动刷新失败后的显式模型 retry 和输入 mailbox 仍属 C7d2；未知 intent 不可借 retry 绕过对账。

### 显式模型失败重试

对安装 governance 与 checkpointer 的 Agent，已结算的模型失败保留原请求。`agent.model_retry_ticket(thread_id, run_id).await?` 返回最后已知失败的精确票据；宿主以稳定 `command_id` 构建 `governance::ModelRetryCommand`，通过 `RunInput::retry_model(command)` 执行。它使用原 thread/run/预算/绝对 deadline，并为目标操作分配新 generation；普通 `RunInput::resume()` 只重放旧失败。重复指令不再次调用模型，ID 对应的票据不能修改，旧票据不能换新 ID 重试。

该边界也覆盖原压缩模型；成功前置调用不会重发。新鲜凭据在真正发送时读取，不能仅凭凭据改变就重新发送失败请求。失败上界费用保留，新尝试仍需预留完整上界。未知 dispatch、工具副作用、已成功结果和变化的上下文均不因该命令绕过对账或检查。票据不是任意错误的通用重试许可；子运行有自己的恢复作用域，不能用父票据重新打开已关闭的子调用结果。

直接或多层 Agent-as-Tool 链可由 `RunSupervisor::child_model_retry_ticket(root_run_id, child_run_id)` 查询已知模型失败，再将该子票据的 `ModelRetryCommand` 交给原根的 `execute(..., RunInput::retry_model(command), context)`。根验证当前等待路径、目标 pending model、各级已闭合失败凭据和原 composition；保留旧账本回执，以新的控制序号重新准入原子调用。未知结果不能获得重试许可；中断时尚未结算的父级须先普通 resume 结算已知结果。授权记录受根 lease fence，落盘后新进程普通 resume 也可继续，不需重新发布命令。模型请求与成功工具结果保持，额度与 deadline 不重置，Hook 使用新的控制身份。

这一入口现支持 Agent 父子链，以及 Agent→workflow Tool→Agent、子流程、有限循环的包装路径。Supervisor 校验真实控制记录及原图节点/attempt/失败或等待状态；只恢复该路径，保持同一节点调用身份、已完成 peer 和循环迭代结果。失败后关闭的子 group 使用新代数，暂停而未结算的 group 保留原槽位。并行多个耗尽失败不能因打开一个节点而被当成完成。内核 Agent、子调用及图事实驱动的 workflow Hook 也可沿原源事件和订阅恢复。独立会话通知/自定义 emitter 需专用的可恢复提交入口，不能借根循环命令重放；返回票据只代表查询到目标失败，不代表整个路径已获准恢复。

### 持久输入与取消

`RunSupervisor` 在根租约内自动绑定 SQLite mailbox consumer；宿主经 `mailbox::MailboxSender` 的 `submit(MailEnvelope)`、`input_status` 和 `cancel` 提交/查询。`InputAddress` 固定 root/run/thread/agent；由已记录运行树验证，禁止串收件人。其他后端可显式提供 `InputInbox` 并通过 `MailboxBinding` 绑定，持久 checkpointer 要求持久 consumer。

定点子取消可用 `RunSupervisor::control(compiled, RunControlCommand::ResumeChildCancel(ChildCancelResumeCommand { command_id, address, through }), context)` 确认并继续原根。address 为真实子 Agent 的 InputAddress，through 为取消返回的精确游标；根取消仍可使用原 `RunInput::resume_after_cancel`。原 RunInput 结构与入口保持。确认只覆盖该游标及更早的取消，后发取消仍生效；相同命令幂等、改内容或复用为另一类命令拒绝。

Supervisor 校验原父调用/图/Hook 路径，先持久接受，再在根 fence 下确认邮箱；确认写入失败后普通 resume 补做，不重复派发。确认先于预算准备，因此过期额度也能确认取消，而模型/工具仍被原预算拒绝。Agent 在安装监听器前建立自己的取消通道；子取消先完成本层结算并返回控制结果，不能先取消父调度。首个子检查点尚未创建时，使用原父调用里冻结的 prompt 初始化一次；未知 primitive 仍暂停等待对账。暂停中刚接受的取消也可直接确认，不需为了观察取消额外运行一次。

Interject 使用原 PendingInterjection 与格式，在完整工具结果批次后、模型/压缩请求未冻结时投递；Hook、检查点和确认保证恢复不重复追加。模型看到包装消息，记忆 capture 接收用户原文。NextTurn 在接受事务中同时创建持久 job，保留提交快照与多条轮次 FIFO；旧地址的插话不会跨入新运行。Tool 命令已接实际执行：`MailInput::Tool` 的 call.id 留空，由内核生成稳定 ID；命令走原工具准入与回执路径。`UserToolInvocation` 是不可从 JSON 构造的单调用来源证明，真实 Skill 适配据此允许 user-only 执行；模型参数不能自行声明用户来源。

`cancel(address, command_id)` 返回持久游标。`RunInput::resume_after_cancel(cursor)` 只确认已看到的取消，更晚的取消仍有效；普通 resume 不清除它。控制读取失败报告 checkpoint 错误并停止 IO。已知取消的压缩请求仅在该显式控制下分配新模型 generation；未知 intent 继续对账，预算与绝对 deadline 保留。

用户工具的来源保留到结果 CAS（包括拒绝与显式对账），暂停不消费；其合成 Assistant/Tool 消息不进入用户记忆 capture。`before_tool` payload 在真实用户命令时包含 `input_source.kind=user_command`、input_id/sequence，Hook 可匹配该来源；对 name/args 的改写仍会重新校验且不会获得原 user-only 授权。原宿主权限与子 Agent 的 scope/floor 保持有效。tool.skills 工厂 revision 为 3，context.skills 为 2；历史工厂/catalog 装配仍是管理服务阶段的待办，不能用新 revision 静默恢复旧实现。

### 子运行显式对账

`RunSupervisor::reconcile_child` 接受 operator receipt，包含 child_run_id、原 call、result/is_error，建议携带 model_sequence。它现在只持久接受证据；不会直接改检查点。恢复时由实际 child 在原权限/schema/Hook 和 dispatcher 元数据下结算预算、提交成对结果，已有真实缓存结果优先。重复相同 receipt 幂等，改结果或错误轮次拒绝；旧请求省略轮次时不得用于复用 call ID 的新操作。未知 controller 应定位更深 primitive，不能用人工结果替换整个 resumable controller。原宿主独立会话协议没有切换到这条新接口。


### 持久任务与轮次执行

SQLite supervisor 的 `supervisor::jobs::JobSubmission::for_agent` 固定已编译快照、composition、thread/run 和首输入；`RunSupervisor::submit` 持久接受，`run_next(registry, agent, thread)` 或 `execute_submitted(registry, run_id)` 执行队首。相同 ID/内容幂等，改变提交内容拒绝。首输入 checkpoint 和 source 确认之间崩溃只补确认，根记录创建后首输入之前崩溃仍能初始化同一任务；普通 execute 不能绕过已接受任务的队首约束。已完成任务返回保存结果。

同一 thread 固定同一 composition；使用新发布配置时创建新 thread，当前没有隐式历史迁移。Paused 或仍有模型/工具/Hook/压缩待处理边界时 job 保持 Waiting，后续轮次不能跳过。`cancel_submitted` 仅用于尚未创建运行记录的 queued job，执行中使用 mailbox cancel；初始化期间的持久取消可打断目录/Prompt 加载，并在模型/工具 IO 前结束。已经初始化且有未知副作用的停止不能靠清空状态推进，管理服务的显式 stop/abandon 接口仍待 C9 验收。


### 无模型 Tool 程序

`tool_program::compile_tools(ToolRuntimeDefinition, registry)` 编译纯 Tool 宿主，配置 tool_packs/tool_sources/policies/governance/hooks/bindings/checkpointer。它不要求模型或系统提示词；`runtime.invoke(call, RunInput::default(), context)` 沿实际公共工具边界执行，`RunInput::resume()` 恢复，未知 primitive 用原 reconciled 回执显式对账。模型调用/step 配额为0时仍可运行，实际 Tool 调用仍正常计费。

同一 thread 的 call 身份和参数固定到 composition，恢复不能更换。结果检查点丢失优先读取治理回执，不重做外部副作用。此程序不获得用户专用 Skill 授权，也不消费父 Agent 的 mailbox；host floor 与根总预算继续向下约束。ToolCompilationSnapshot 恢复检查工厂版本、定义与宿主 floor，与 Agent 的冻结恢复保持一致。


### 配置化 WorkflowSpec

启用 `workflow` feature 后，`workflow::compile::compile_workflow(WorkflowDocument, registry)` 编译纯配置程序。Document 包含 modules、带 ModuleRef 的 agents/tool_runtimes/workflows、entry，以及无模型 host。WorkflowCompilationSnapshot 固定完整定义、工厂版本与宿主 floor；restore 检查全部依赖。仓库外 [configured-workflow.json](../../fixtures/agent-runtime-consumer/configured-workflow.json) 是可运行配置，消费脚本断言 workflow=true。

图用既有 nofy-orchestra DAG 做校验和依赖批次。节点 input/output schema 在实际边界执行；ValueBinding 支持 literal/input/node/object/array，node 引用必须声明祖先依赖，JSON pointer 无隐式字符串插值。明显端口错误在编译时拒绝，动态 schema 继续在运行时校验。

已实现 Tool、完整 Agent、Prompt、transform、condition、join、human、subworkflow 与有界 loop。parallelism 控制活动批次，Agent 节点保持原 schema/权限/总预算/暂停和取消。on_error.retries 仅对已知失败作有界新 attempt，失败耗尽持久 halted；普通 resume 不会擦除失败。未知副作用继续走 primitive 对账。Root workflow 本身是经准入的 controller Tool，消耗该 Tool 调用和真实节点 step，内部 Tool/Agent 另按实际调用计费，没有虚构模型调用。

`compiled.with_checkpointer(store).invoke(input, recovery, context)` 启动或恢复；恢复时保持原 input/thread/run。`as_tool(name, description)` 支持 Agent→workflow→Agent，仍安装 workflow 的 host 配置；host policies 约束内部后代。`inspect` 读 WorkflowProgress；human 暂停 reason 提供等待图的 thread/run/reference，`respond` 接收精确原请求与不可改写的 command ID/value。supervised 调用必须使用同根 lease-fenced backend，JSON 不上传 live handles。Prompt 节点通过公共 `prompt::PromptVariables` 显式传变量，原 nofy-agent 导出仍可用。

图 checkpoint 与节点子调用 checkpoint 分开，结果 CAS 丢失只补图提交，已完成副作用不重发；真实进程退出后也能恢复 human wait。workflow_start/end、node_start/end/failure 有真实生产者与 Hook fact outbox。可恢复 workflow Hook handler 见下节；完整控制节点运行树/统一事件、关闭 Failed controller 的显式重试、Rhai 全选项和 Goal 编排继续施工。


### workflow Tool/Hook 配置工厂

宿主以 `WorkflowLibrary::new` 安装冻结的已编译图，注册 `WorkflowToolFactory` 与 `WorkflowHookFactory`。`tool.workflow` 配置为 `{ "workflow": "published@1", "name": "my_tool", "description": "..." }`，返回可直接放进 Agent.tool_packs 的模块；`hook.workflow` 配置 `{ "workflow": "published@1" }`，作为 hook.subscription 的 handler 依赖。资源列表由工厂 schema 枚举，客户端不能构造任意执行器。仓库外消费同时验证了这两条路径和 before_model Hook。

Hook 图接收完整 HookEvent（最多1 MiB），最终输出为原 HookDecision JSON，例如 `{ "decision": "continue" }`。内部 human/审批暂停沿控制轨保留源事件和图状态，父 Agent 恢复时重入该图；已经完成的工具/节点/决策复用结果。HookDecision 不被当作模型文本。图自身的 host policies、总预算和 child 调用准入依然有效。

普通 handler 的 recovery_identity 默认 None，原 bus identity/journal 不因新增能力变更；原 HTTP/进程 handler 未完成 intent 仍需显式对账。workflow handler 的冻结恢复身份进入 bus manifest，未知源 intent 允许恢复 controller，其内部未知 primitive 仍暂停。controller timeout 也暂停，不能被 failure=open 隐藏。Hook 决策提交或 graph 首次提交丢失后恢复均不会重复工具。其中已知模型失败可用同一个子模型重试票据沿原 workflow/source Hook 恢复；旧失败 group/journal 保留，成功工具与普通 handler 不重发。历史 catalog 的管理装配仍是后续工作。

源 Hook 恢复许可由实际 Agent/子调用/图事实生产者生成，绑定原事件、订阅、父检查点与当前等待状态，JSON 不能自授。目标恢复使用独立 journal 代数；原事件身份保持，之前成功的普通 handler/patch 继续复用原回执。HookJournal 的 authority locator 读取同根控制日志，因此 `reconcile` 指向当前代数；新代数尚无 intent 时拒绝，不能退回覆盖旧失败。源阶段已推进时不再套用旧许可。两个嵌套 workflow Hook 可共同恢复；未知内部 primitive 仍走原对账边界。

`RunState::has_pending_work` 现在包含模型完成但 stop Hook 未结束的情况；持久任务保持 Waiting，停止/turn_done Hook 失败不等于整个任务关闭。独立 `session_idle/session_end` 或自定义 emitter 的模型恢复必须由对应宿主提交/驱动；根 execute 明确拒绝无法重新驱动的通知来源；Agent/Tool/workflow/Event 的持久提交与独立源程序见下文；原 notify_session 仍不获得独立来源的恢复许可。

显式 `Agent::notify_session` 也安装自身及继承的 governance/floor；bindings 不能清掉父预算、supervised backend 或 lineage。会话信号的工具调用计入原根预算，deadline 返回 BudgetExceeded、用户取消返回 Cancelled。已完成的 Hook 决策继续缓存；管理宿主应传递同根受租约保护的后端。


### 根服务与 workflow 事件

绑定只配置能力；runtime 固定 run/thread 身份与原取消通道，并保留宿主安装的 EventSink/ChildObserver。绑定即使清空扩展或抛错，也不能丢失根事件、子运行登记或把失败归到其他运行。宿主没有提供这些服务时，绑定仍可显式安装。权限 floor、总预算、lineage 与 mailbox 继续按原规则保护。

workflow/node 事实现在同时进入统一 `RunEvent::Workflow`，包含 reference、operation_id、name、node_id、payload。`EventSink::record_once` 的默认实现兼容原 sink，可能重投；自定义后端可用稳定键去重。SQLite supervisor 将事件、global cursor 与去重回执原子写入，outbox确认丢失后不会增加重复事件；同键改内容拒绝，旧 lease 无法写入。原 `record` 行为和已有事件历史保留。控制节点运行树见下节；通用根任务与现有控制恢复指令见下文，独立事件程序见下文；失败节点新尝试继续施工。


### 控制节点运行树

SQLite `children(root)` 现在也返回配置图的 Prompt、transform、condition、join、human、subworkflow、loop及迭代记录。kind、checkpoint_key、workflow_ref、node_id 是可选新增字段，旧子 Agent JSON 保持可读；waiting/skipped/failed/cancelled/budget_exceeded 与 completed 分开记录。记录投影自已存在的图状态，不调用模型/工具，写入使用原根租约。

已有 Agent/Tool 调用身份保持，Tool/Agent 控制 marker 用独立命名空间。恢复不会为登记树而重做副作用。真正 Agent 可接 mailbox；控制节点和 Tool 程序明确拒绝不能消费的普通 mail/cancel，human 通过 respond 提交决定。primitive 对账必须定位到实际准入的工具边界，不能用人工返回值替换整个控制节点。独立通知程序见下文；通用失败节点的新 attempt 继续施工；已知模型失败和定点取消确认见上文。

### 深层组合的标识版本

Agent的settings.scope_identity及ToolRuntimeDefinition.scope_identity可显式选择hashed_v2；AgentBuilder对应IdentityScheme::HashedV2。它在初始编译和每次能力追加后折叠为84字节composition-hash-v2身份，子地址为78字节child-hash-v2。摘要绑定原声明与追加内容，顺序或内容变化会改变身份。编程预设已采用V2。

编译格式由组件冻结声明选择，地址方案由根在运行前选择并向后代继承。未声明的子组件不在运行时被重编译成V2；显式冲突仍在子Hook、登记、预算和IO前拒绝。ContextBinding清空扩展不能移除根的选择。Legacy/HashedV1保留框架自身已存格式；V1只哈希初始定义，其后追加形式保持原语义。不能通过换scope_identity续接旧检查点，未支持新格式的内核不能据此宣称可读取V2快照。

子组预算不再重复存放完整composition/input，改为79字节child-group/v1摘要。原Child活动、固定child_calls=1且其余字段完全一致的原请求，可按原元组核对摘要；继续使用原reservation，claim/settle不放宽。已claim未知不会因此重派发，原receipt、用量、预留、原操作id和期限保持。

Agent-as-Tool仍由父调用拥有Tokio子任务，父future丢弃会中止后代；未知效果须原对账。V1/V2均验证16层共享预算、12层模型重试及定点取消、清空绑定和快照恢复；原失败Agent＋Hook和V2长输入另有原生HTTP及真实退出证据。详见[设计](bounded-composition-identity.md)和[验收](../verification/bounded-composition-identity.md)。

### 通用根执行与 ExecutionSnapshot

`program::CompiledProgram::for_agent`、`for_tool`、`for_event` 和启用 workflow 时的 `for_workflow` 绑定已经编译的真实程序。`ExecutionSnapshot` 的 version 为2，program.kind 为 agent/tool/workflow/event；Agent 内层保留原 CompilationSnapshot，Tool 固定实际 ToolCall，workflow 固定原 WorkflowCompilationSnapshot 和输入。恢复调用 `snapshot.restore(registry)`，仍严格核对工厂、模块与宿主 floor。无模型程序不构造 Model 或 AgentDefinition；snapshot 上限16 MiB，工具/图调用输入保持1 MiB边界。

`RunSupervisor::execute_program(program, input, context)` 与原 execute 使用同一租约、heartbeat、检查点、控制日志、事件和运行树。Agent 根以 `RunInput::new/multimodal` 开始，Tool/workflow/Event 根以 `RunInput::default()` 开始；恢复为 `resume()`，不能换 call/输入/配置。`control_program` 接受原模型重试或定点子取消确认命令，`reconcile_program_child` 为真实后代 primitive 记录原有对账证据。根 Tool 的未知效果仍走原 RunInput.reconciled，不会因为根无模型而重发。

`SqliteStore::execution_record` 同时读取旧 Agent 和新根记录。原 `RunRecord` 的默认 snapshot 类型、`record()` 与旧 JSON 格式保留；泛型 `RunRecord<RunSnapshot>` 为通用读取类型，version1/2 明确分派，混合格式和未知版本拒绝。纯 Tool/workflow/Event 根接受持久取消，拒绝普通 Agent mail；真正的后代 Agent 仍有自己的邮箱。清空 capability 的绑定不能丢掉 Program 根标记或真实审批所需的 Supervisor 身份。

无需 SQLite 时，`CompiledProgram::with_checkpointer(...).invoke(...)` 使用相同内核；仓库外消费验证了 version2 冻结恢复与完成后恢复。workflow 人工决定沿用 `respond`，管理宿主必须传同根租约保护的 checkpointer；`program.checkpoint_key(thread)` 提供根租约 key。v2 的持久排队和首次输入确认见下节；独立通知/自定义事件程序见下节；统一认证管理入口继续施工。

### v2 持久任务与兼容队列

启用 sqlite 后，`supervisor::jobs::ProgramSubmission::for_program(program, thread, run, input)` 固定已经编译的程序、身份及原编译摘要。Agent 的 input 为真实 PendingInterjection；Tool/workflow 为 None，其调用与输入固定在 ExecutionSnapshot 内。`RunSupervisor::submit_program` 在 IO 前持久接受，`execute_submitted` 和 `run_next` 共用原 FIFO worker，不创建伪用户消息或模型协调器。

`JobSubmission`、`JobRecord` 的默认 Rust 类型及 v1 JSON 保持，旧 Saved 字节与摘要有直接比对。`SqliteStore::program_job` 查询 v2；`execution_job` 同时读取两版。v2 Agent 的 NextTurn 使用原 MailInput wire，队列依据实际根记录保留 v2 格式；与 v1 Agent 相邻排队时维持线程所有权和顺序。

首检查点保存私有 InitialInputProof，随后在原根租约内确认输入、来源事件及任务运行状态。RootRecord 已建立但首 CP 尚未保存、CP 已保存但确认事务失败，两种窗口均可恢复。只有新任务自己的证明可以初始化下一个无模型运行；直接调用和旧恢复身份规则保持。完成的同线程 Tool/workflow 可按新的 run/proof 再执行一次，未完成前项不能被后项跳过。

已知模型失败和未知副作用保留 Waiting；模型失败须明确票据重试，未知副作用须提交匹配的对账证据。未初始化的任务可取消且不会执行 IO。已关闭任务读回原结果：预算后来过期或调用者取消也不会改写结果、重新计费或把任务改回 Waiting；重复控制命令必须已被接受且内容一致。普通直接恢复仍核对当前线程所有权。

当前持久调度仍具体依赖 SqliteStore；内存/自定义 Checkpointer 只替代相应状态接口，并不自动提供相同事务调度语义。基础 SDK 继续可不启用 SQLite。文件职责与恢复边界见 [文件说明](../../crates/common/nofy-agent-runtime/文件说明.md)。

### 独立事件程序与 producer 注册

宿主可用 `EventProducer::new(owner, declarations)` 安装自定义事件来源，通过 `InstanceFactory` 注册 `ModuleInstance::EventProducer`；JSON 只引用已安装 producer，不上传 owner 权限。`EventProducer::session()` 只授权 session_idle/session_end，不授权模型、工具或权限生命周期。订阅沿用 `HookFactory::new(producer.catalog())`、原生/执行器/工作流 handler 和 `hook.subscription`。

`compile_event(EventProgramDefinition, registry)` 纯编译事件程序。定义包含 schema_version=1、host:ToolRuntimeDefinition、producer:ModuleRef、event、operation、payload。operation 必须非空且不超过1024字节，payload不超过1MiB且满足已安装声明的 schema。`CompiledEventProgram.snapshot.restore(registry)` 严格核对源声明、模块、工厂与宿主 floor；`CompiledProgram::for_event` 进入原通用执行入口和 v2 ProgramSubmission 队列，提交 input 为 null。冻结 payload 或 operation 变化须开启新线程，不修改已有运行的来源事实。

程序先提交准确源事实与首输入证明，再执行原 HookBus，最终保存类型化 HookResult。根本身没有模型、工具或用户消息；实际订阅中的模型/工具按原准入与总预算计费。事件宿主普通 policies 也提升为后代不可移除的 floor。订阅结果可以是受声明允许的 deny/patch/stop；pause 保留源事实，精确对账后续接。未知 handler 效果不自动重发；不能使用根 Tool 对账来替换整个事件程序。

工作流 Hook 沿已提交源事实登记路由，真正的子 Agent 模型失败可用原 `child_model_retry_ticket` / `control_program(RetryModel)` 明确续接。成功的前置订阅、patch 结果及工作流 peer 保留；定点子取消沿原控制日志确认。独立通知直接使用原共享驱动与源 journal；原 `Agent::notify_session` 保持旧宿主语义，不因此获得新的可重入许可。

基础 SDK 不要求 SQLite。已提交程序可复用原租约/heartbeat/取消/首确认/完成缓存协议；本阶段没有新增调度数据库或副作用执行引擎。外部 webhook/定时器仍由宿主接收、生成新的冻结事件任务，内核不会隐式创建后台轮询。公共 ModuleKind/ModuleInstance 与 ProgramSnapshot 增加 EventProducer/Event 分支，外部 Rust 消费者的穷举 match 需补分支；原 v1/旧 v2数据和字段不变。
