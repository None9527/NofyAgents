# Agent 全能力模块化闭环计划

- 状态：施工中，C0–C8d4 的已记账阶段通过；2026-10-29 按用户要求校准为控制台驱动的常驻、可装载与运行中可更新内核。优先 L1/L2 控制面/加载，再补执行更新与 C8 尾项。
- Owner：Agent 内核与宿主适配维护者。
- Read When：实施模块注册、Hook、记忆、模型、工具、权限、流程编排或其管理接口前。
- Update Trigger：公共契约、阶段状态、依赖、验收证据或迁移边界改变。
- Validation：各阶段真实执行证据与最终验收矩阵；禁止用计划文字替代实现。
- 工作分支：沿用 `research/modular-agent-framework`，保留已有暂存与未提交变更，不重置用户工作。
- 前置资料：[当前 SDK 指南](../../architecture/composable-agent-runtime.md)、[前轮蓝图](2026-10-27-composable-agent-framework.md)、根 AGENTS.md、根 .ai_project.md。

## 目标与完成定义

最终产品是由控制台管理的常驻 Agent 平台。用户能在内核运行期间注册和更改能力、源码/制品、提示词、工具、Hook、记忆、模型及运行策略，组合自主 Agent 或 workflow，装载发布并在明确执行边界更新现有会话；常规能力变化无须修改内核 Rust 源码、重新编译应用或重启内核。原 Nofy 编程预设是同一平台的版本化预设，并保留原入口和原配置。详细契约与新的施工优先级见[常驻内核与控制台规范](../../architecture/live-agent-console.md)。

本轮必须闭合 Hook 及审计的 13 类缺口：注册/工厂、Tool 实现绑定、Prompt/规则/Skill、模型与输出、记忆、上下文压缩、权限与环境、runtime 配方、workflow、子 Agent 控制、持久化恢复、流式观察、设置资源与治理。会话输入/插话作为跨层契约一并验收。

最终完成必须同时满足：

1. 仅修改可序列化配置即可创建新 Agent；新增 HTTP、进程/脚本、MCP 和 workflow Tool 不必修改内核或重编译应用。新增原生 Rust 插件仍需宿主安装/构建，不能把 Rust trait 对象当成可上传代码。
2. Hook、模型、Prompt、Tool、上下文、记忆、策略、执行环境、运行配方、状态后端、事件订阅和工作流均有明确的注册/绑定方式；支持范围可以枚举，未支持选项必须显式报错。
3. Agent 可以作为 workflow 节点，已发布 workflow 可以作为 Agent Tool；权限、暂停、取消、预算、恢复在嵌套边界不丢失。
4. 自研记忆与原权限、压缩、Skill、Hook 等实际能力可经公共适配装入新 Agent，不能只用模拟接口证明完成。
5. 独立进程重启后可继续线程和流程；审批、事件游标、配置版本和工具身份保持一致；不盲目重放不确定的外部副作用。
6. 原入口对话、工具、权限、取消、流式、继续会话、压缩、Hook、记忆、子 Agent、结构化输出均有兼容证据。
7. 同一个常驻内核进程中，控制台现场创建/修改/加载能力并执行；代码型模块通过受支持解释器或进程/服务协议接入。不能以 Rust 工厂注册代码充当用户的必经配置入口。
8. 运行中的变更有版本化更新指令、应用边界与恢复轨迹；保留会话、配额和成功效果。只有下一次启动或新建运行才读取新配置，不等于完整热更新。
9. 一份可移植系统声明可以共享、导入和应用整套 Agent，锁定代码/依赖/资源协议；控制台、文件与 API 使用同一事实源，支持差异、幂等应用和回滚。跨机器预检、凭据注入和自动装载不得变成手工修改/重编译宿主。
10. 配置迁移与运行数据迁移分别验收；后者通过显式状态后端或迁移包保留会话、记忆、检查点、预算及未完成工作，并防止源/目标双派发。

最终产品包含新控制台，当前先做控制面与内核，其页面为后续独立里程碑。非目标：原 TUI/Web/桌面展示层重构；Python 迁移；跨机器分布式调度；任意语言动态库加载；跨外部服务分布式 exactly-once。单机服务重启、嵌套总预算、执行审计属于本轮范围。非目标不能用来缩掉上列验收。

## 开工前审计基线（C0 前，当前进展见阶段账本）

- `Components` 是 Rust 实例容器，`AgentSpec` 是引用集合；缺配置到实例的统一 Factory 层。
- `agent.rs` 有 before_model/before_tool/observe Middleware，但没有完整 Hook 事件与既有 Hook 执行器接入。
- `memory.rs` 只有 search/append 与内存示例；尚未连接自研完整 MemoryService。
- CodingHost/七阶段与纯策略已公共化，但压缩、授权、流式、输入和资源生命周期仍由原 SessionActor 适配实现。
- Agent-as-Tool 将非 Completed 结果变成工具错误；sequence 和 Rhai adapter 也没有保留完整中断语义。
- `Model` 仅有 complete；SamplerModel 收集完响应才返回，通用事件可丢，工具取 terminal。
- 通用 Checkpointer 只有内存实现；现有 session/workflow journal 不是它的自动持久化后端。
- 仓库已有 nofy-hooks、nofy-agent-lifecycle、nofy-memory、nofy-orchestra DAG、nofy-workflow Rhai、nofy-subagent-resolution 等，必须优先复用而非重造。
- 前轮测试仅证明其覆盖场景；289 项通过和旧 CLI 四种对照不能证明本轮全部能力完成。

## 架构决定

### 配置、实例和运行分层

`ModuleDefinition -> ModuleRegistry/Factory -> CompiledPlan -> RunSupervisor -> Agent/Workflow`。

- 定义层存 kind/type/id/version、配置、config/input/output schema、依赖引用、能力要求与适用事件/端口。
- Factory 负责校验与绑定已有实现。纯 validate/compile 不启动进程、不执行网络请求；连接探测/预热为显式操作，不能假装编译无副作用。
- 单次执行快照固定组件版本、schema、策略、binding 身份和配方；草稿编辑不直接篡改它。发布激活与运行中更新由 Loader/CompositionTransition 显式驱动，在安全边界绑定新版本并保留历史；旧 v1/v2 恢复语义不变。动态 MCP 采用每轮不可变快照，保留现有安全校验。
- RunSupervisor 统一管理运行树、输入邮箱、审批、预算、取消、事件和恢复；内部复用同一 Agent 驱动与现有调度器。
- 公共 runtime 维持小依赖闭包。HTTP、进程、SQLite、原宿主能力置于显式选择的适配层，不强制进入默认依赖。
- AgentSpec 保留兼容解码；新增定义采用版本化 envelope 和显式迁移，未知字段/选项产生定位明确的错误，不能静默忽略。

### 两种连线

- 装配关系：模型、Prompt、工具、策略、记忆等绑定到 Agent/runtime 的命名插槽。
- 执行关系：workflow 节点通过结构化端口传数据和控制；Prompt 或配置块不因画了一条线就自动成为执行节点。
- 通用节点契约包含输入/输出 schema、绑定表达式、错误/超时规则、控制结果。Agent 和 workflow 都可实现该契约；Tool 直接作为节点时仍走最终准入。
- runtime 阶段顺序只允许通过已注册 recipe/stage 工厂配置；权限、schema、身份与副作用记账为不可绕过的执行边界。

### Hook 方法与结果

HookDefinition 描述事件、匹配、顺序、Handler 引用、超时、失败策略与版本。Handler 复用 native/HTTP/受控进程或脚本/workflow 执行器。结果按事件限制 Continue/Deny/Pause/Patch，变更参数后重新校验和准入；事实发生后的事件不能修改已完成事实。自定义事件必须由声明该事件的模块实际 emit。嵌套 Hook/workflow 有调用链标记、深度和预算，防止递归触发。

## 阶段依赖与执行纪律

原依赖主链为 C0–C10；2026-10-29 调整：C8d4 后优先进入 L1 配置/制品/资源仓库与 L2 常驻宿主/装载（对齐 C9），再推进 L3 执行更新及剩余 C8，最后 L4 控制台和 L5/C10。管理控制面不再等待所有 C8 尾项才开工。每类能力接通定义、装载、执行、修改与恢复后才算该类闭环。

阶段内部可以连续修改，不逐函数验证。阶段开始对入口集中做 upstream impact，报告真实调用方/流程与风险；Rust 图漏边以源码补齐。新增公共契约或扩大范围要补分析。HIGH/CRITICAL 在编辑前报告并采用兼容适配，不重复请求已授权范围的批准。阶段结束集中构建、契约和相关宿主回归，失败修复后才进入依赖阶段。无新证据不重复跑通过项。

计划已进入实施；各阶段 impact 必须在实际开工时按当时源码执行，不能把历史图结果作为未来批准证明。提交前运行 detect_changes，禁止重置/覆盖既有 68 文件施工成果。生成的根 Cargo.toml 不直接修改。

## C0：建立可核对的行为基线与覆盖账本

- 依赖：无。
- 文件：`scripts/verify-agent-preset-compat.py`、`scripts/verify-agent-independent-consumer.py`、`fixtures/agent-runtime-consumer/`、本计划；新增基线/能力矩阵资料位置待记录在本计划旁。
- 行为：记录现有工作树与暂存树身份；保留当前可执行基线及来源。尝试在独立目录从已知提交重建旧二进制；若失败，明确旧二进制来源限制，不能伪称提交级差分。扩展脚本覆盖审批、拒绝、取消、Hook、记忆、压缩、子 Agent、结构化输出。建立“已有/待适配/待新增/已验收”逐项账本。
- 验收：基线脚本能在隔离 HOME、模拟模型和测试服务下重放；无真实用户副作用；每个场景有预期轨迹和比较项。
- 风险/回滚：仅探针；不改变实际生产路径。
- 续做提示：前轮基线不是从 65ed83b8 重建，不得丢掉该限制。

## C1：定义注册、Factory 和不可变编译快照

- 依赖：C0。
- 文件：现有 runtime `agent.rs/settings.rs/context.rs/pack.rs/lib.rs`；拟新增 `registry.rs/definition.rs/compile.rs` 及相应契约测试。
- 行为：版本化 ModuleDefinition/ModuleRef/ModuleDescriptor/Factory；各 kind 有配置 schema 与输入输出 schema；注册 native 工厂及配置数据。新增显式装配 profile，覆盖 middleware/Hook、checkpointer、context binding、recipe、治理策略，保持 AgentSpec 兼容门面。编译递归解析引用、拒绝重名/循环、检查能力和 schema、返回配置字段级诊断。版本身份覆盖原先遗漏的 middleware、Prompt 实现、策略及绑定，不只比较工具 schema。草稿、发布版本和运行快照分离。
- 验收：只提交 JSON 定义可编译业务 Agent；修改已发布模块不改变旧运行；同名不同版本不得混用 checkpoint；未知配置、引用循环、缺凭据绑定均有明确错误且无 I/O。
- 风险/回滚：Builder 高扇出，保留旧 builder；新编译器先走显式入口。
- 续做提示：Factory 不能只是返回 trait 对象的另一层包装，必须实际消费序列化配置。

## C2：持久化 RunSupervisor、审批与组合控制闭环

- 依赖：C1。
- 文件：runtime `state.rs/agent.rs/composition.rs/context.rs/workflow.rs`；既有 `nofy-sqlite-journal`、`nofy-session-journal` 和 `nofy-orchestra` 的适配入口；拟新增可选持久化适配、supervisor/interrupt 模块及进程恢复测试。
- 行为：提供实际磁盘 CAS Checkpointer、运行索引和版本快照持久化；评估复用现有 SQLite 层而不挪用旧会话格式。规范 Run/Thread/Node/Child/Call/Interrupt ID、树关系与状态。组合调用携带 Completed/Paused/Cancelled/Failed/BudgetExceeded，停止把子暂停转成普通错误；恢复同一 child 而非重复创建。审批决定绑定运行、调用、参数与组件快照，恢复时重新准入；提供审批队列与显式对账。CAS 不足以防并发执行的部分以 run lease/fence 收敛。
- 验收：父 Agent 调子 Agent 请求审批，服务重启后批准，实际工具只执行一次；workflow 同样通过。两个 worker 竞争同一运行不产生双派发；intent 已存/result 未存时标记 uncertain，显式对账而非自动重放；旧版本缺失安全失败。
- 风险/回滚：存储与副作用 CRITICAL；独立新命名空间、明确 schema migration，不覆盖原存储。回退入口前处理未完成运行，不双跑副作用。
- 续做提示：远端服务无法确认是否成功的场景不能宣传 exactly-once。

## C3：完整事件、模型输出与数据契约

- 依赖：C2。
- 文件：runtime `model.rs/agent.rs/state.rs/tools.rs`，`nofy-sampler/src/agent_model.rs`、既有 sampling-types；拟新增事件适配和协议测试。
- 行为：在保留 complete 兼容入口下提供真正模型流；消费工具 progress/terminal，不能仅 call_terminal。定义序列化事件 envelope：event ID/cursor、run/node/parent/call、类型、顺序、时间与版本；覆盖 token、reasoning 可见性、工具进度、审批、错误、取消和结束。终态/控制事件可靠，token 传输、持久化与背压策略明确，断线通过游标和状态快照恢复。模型能力声明与配置 schema；完整映射声明支持的参数，结构化输出 schema/校验/修复预算，保留原生 opaque 数据；引入 typed 多模态输入/附件引用，不能随意跨 provider 重解释。输出可作为结构化节点端口数据。
- 验收：首 token 在模型完成前送达，工具进度在 terminal 前出现；重连无控制事件丢失；取消与失败有唯一终态；参数不静默丢弃，unsupported 可定位；结构化结果和图片往返通过真实适配及模拟 provider 协议测试。
- 风险/回滚：保留旧 CLI 流式入口，先适配而非重写全部 provider。
- 续做提示：不要把可丢观察 channel 改名就当成可靠事件流。

## C4：可配置执行器、Tool 与资源/权限边界

- 依赖：C1–C3。
- 文件：runtime `tools.rs/policy.rs/context.rs/settings.rs`，现有 `nofy-tool-runtime`、`nofy-mcp/src/runtime.rs`、`nofy-agent/src/runtime.rs`；nofy-sandbox/config/auth 及原 tool_dispatch 对应适配；拟新增可选 executor/resource adapters。
- 行为：统一 executable definition 与 HTTP、进程/脚本、native、MCP、workflow 引用工厂。脚本先明确支持的已安装解释器与资源约束，缺运行环境明确报错；不默认执行任意宿主命令。配置输入映射、输出 schema、timeout、错误映射、幂等声明；凭据只存引用。资源工厂管理模型连接、MCP admission、凭据解析、cwd/fs/终端/工作区生命周期。接入原权限审批与 sandbox；子能力显式收窄，拒绝模型或配置自行授予权限。Tool-as-node 同样经过参数校验、策略、Hook、账本与取消。MCP 重连版本改变后的未完成审批采用显式重新绑定/重新审批规则。
- 验收：仅用配置注册 HTTP、脚本/命令、MCP Tool 并让模型调用；无效参数、权限拒绝、取消/超时、凭据失效、连接重建和图片输出均有轨迹；不能由 workflow 绕过 Agent 工具准入。
- 风险/回滚：权限与文件执行高风险；复用原引擎，默认最小能力，不隐式继承用户 HOME/cwd。
- 续做提示：Tool schema 与具体可执行绑定必须是同一版本；原 ToolBridge adapter 当前不转发完整 per-call context，需核对取消/权限上下文。

## C5：Hook 与生命周期扩展统一接入

- 依赖：C2–C4。
- 文件：现有 `nofy-hooks`、`nofy-agent-lifecycle/src/{local,send}`、shell `hooks_plugins.rs/turn_end_hooks.rs` 与原 Hook fire sites；runtime `agent.rs/pipeline.rs`；拟新增公共 hook definitions 与 adapters。
- 行为：复用原 dispatcher、HTTP/command runner、matcher、信任和 managed-policy 约束；注册 Handler 与生命周期贡献者。覆盖 session/turn/user input/model/tool/permission/subagent/compact/workflow/node 事件。公开可扩展事件声明与 emitter；每个事件明确允许的决策、payload、超时、排序、冲突合并及 fail-open/closed 默认，保持原事件既有语义。连接原 LocalSet 和 Send 两类宿主，不强制重写 actor。支持配置自定义 HTTP、脚本、native 方法及受控子 workflow；限制递归与预算。legacy fire site 与新 adapter 明确唯一触发责任。
- 验收：pre/post/failure、拒绝、暂停、Patch 后重验、超时、取消、session stop 和节点失败均通过；原路径与公共路径事件一次且顺序正确；自定义事件只有对应模块 emit 才触发。
- 风险/回滚：审批/Hook 双触发高风险；按事件族切换唯一适配入口，禁止两套 handler 同时处理同一事件。
- 续做提示：Middleware 不是完整 Hook；已有 lifecycle registry 必须纳入复用评估。

## C6：Prompt/Skill、自研记忆和上下文压缩

- 依赖：C3–C5。
- 文件：runtime `prompt.rs/memory.rs/pack.rs`；现有 `nofy-agent/src/prompt/`、`plugins/`、`nofy-memory/src/service.rs`、工具 MemoryService 契约；shell `session_setup.rs`、coding_preset `context.rs/maintenance.rs` 与 compaction 实现；拟新增适配与注册工厂。
- 行为：Prompt 定义含变量 schema、片段顺序、工具视图、渲染预览和版本。规则/项目指令/Skill 保留来源、优先级与动态注入语义，不能全部压成静态文本；插件安装包与运行时模块身份建立映射。自研记忆通过 MemoryService 适配开放完整 search/remember/revise/forget/undo/snapshot/capture/consolidate，检索与生命周期写入分开；保留 Personal/Project、所有权、忘记优先、脱敏及子 Agent 限制，不能强塞进简单 search/append。上下文选择、token 计量、裁剪、压缩与摘要为注册策略，复用原算法并接 Hook/记忆刷新；保证模型消息和工具结果配对、缓存前缀稳定。
- 验收：配置更换 Prompt/Skill 后新运行生效，旧运行快照不漂移；无 cwd 的业务 Agent 正常；新 Agent 使用真实自研存储完成记住/检索/修改/遗忘/重启；压缩后继续工具对话且不会复活已遗忘内容；子 Agent 不隐式获得个人记忆。
- 风险/回滚：原记忆和压缩使用既有契约与独立 adapter；不得迁移或复制另一套 canonical 数据。
- 续做提示：自研记忆不是 InMemoryStore 的升级示例；capture 需要原有持久回执门槛。

## C7：运行配方、治理策略与会话输入

- 依赖：C2–C6。
- 文件：runtime `driver.rs/pipeline.rs/coding/agent.rs/settings.rs`，shell `interjection.rs/sampler_turn.rs` 与七阶段 adapter，`nofy-subagent-resolution`、`nofy-orchestra/caps`；拟新增 recipe/limits/input policy 模块。
- 行为：注册标准自主 Agent、编程配方和自定义命名 stage 工厂；配方配置决定合法阶段、策略、结束条件，不能绕过最终校验与准入。抽取重复动作、Todo/Goal、length salvage 等可选策略并接到实际执行，而不只是导出类型。统一 parent-child-workflow 预算账本：steps、tokens、deadline、工具/子调用数、并发及递归深度；恢复不重置，预留/结算可审计。明确模型重试、退避、回退和幂等 Tool 重试的所有权；原认证恢复适配复用。输入 mailbox 支持多轮、排队、插话、取消与恢复时机，定义租约和边界顺序。
- 验收：只改 recipe 配置就能构造不同结束/上下文策略；自定义 stage 真正执行；原编程配方相容。子 Agent 不能放大总预算/权限；重启不清空治理账本；取消退避/资源加载有界；运行中提交输入不会串轮或重复注入。
- 风险/回滚：维护原预设合法顺序与既有重试语义，不一次性替换整个 SessionActor。
- 续做提示：不能把单 Agent max_steps 当成跨组合预算；拒绝不安全的阶段重排。
- C6 接续项：FrozenSkills 暂时明确拒绝 model/effort/allowed_tools 执行覆盖；由本阶段的作用域配方实现，不能改成忽略字段。压缩 Model 调用也要纳入统一重试与预算账本，失败摘要尝试不能丢失成本。

阶段拆分（各自集中分析与验证，依赖通过后继续）：

1. C7a：共享预算存储与纯状态转换。原子预留、真实结算、未知 intent、回执重放、绝对 deadline、并发/深度与租约 fence；此步不宣称执行循环已经强制执行预算。
2. C7b：预算工厂/宿主 floor 接实际模型、工具、子运行、压缩与重试边界；持久请求身份和结果缓存避免恢复重扣/重发。token 限额必须有可信上界；不能拿 bytes/4 估算冒充硬上界。SamplerConfig.context_window 目前只是信息字段，必须确认提供方/请求约束与结构化修复、原生重试的所有权。
3. C7c：命名 recipe/stage 与重复动作、Todo/Goal、length salvage 策略接实际运行，完成 Skill 的作用域模型/effort/工具限制覆盖。
4. C7d：复用 nofy-interjection-core 的 FIFO/格式和原认证恢复门槛，落持久 mailbox、安全注入边界、排队/取消/重启与旧宿主窄适配。

## C8：统一 WorkflowSpec 与双向嵌套

- 依赖：C1–C7。
- 文件：runtime `workflow.rs/composition.rs`，现有 `nofy-workflow`、`nofy-orchestra/src/{dag,orchestra,replay,barrier}.rs`；拟新增 workflow spec/compiler/node adapters 和配置 fixture。
- 行为：定义版本化图/节点/端口/边/变量绑定、分支、join、有限循环、错误路径、重试、暂停、取消与输出。编译到复用的调度器/既有 Rhai 执行设施；C0/C1 先探针决定两者职责，禁止靠无源码映射的字符串拼接生成脚本。注册 Tool、Agent、Prompt 渲染、transform、condition、parallel/join、human、subworkflow 节点。Agent 作为完整可中断节点，已发布 workflow 作为 Tool；运行树与数据均有 checkpoint，外部副作用沿用 intent/reconciliation。补齐或明确映射原 adapter 拒绝的 per-call 选项、资源操作与日志事件，不能静默丢弃。
- 验收：纯配置完成“输入→检索 Tool→并行 Agent→join→结构化输出”，以及“Agent→workflow Tool→子 Agent→审批”；断点重启只继续未完成节点，已完成副作用不重复，错误/取消按图规则收敛，循环受预算限制。
- 风险/回滚：图/schema/compiler 先单独入口；旧 Rhai 与原 DAG 协议保留兼容入口，不偷偷迁移现有 journal。
- 续做提示：仓库并非没有图引擎；缺的是模块级图契约与公共 runtime 接线。

## C9：可供前端消费的配置管理与运行接口

- 依赖：C1–C8d4 已有契约；余下 C8 能力按完成情况接入，不阻塞控制面先行。
- 文件：拟新增独立可选管理宿主与 API schema（包名/目录在 C1 登记）；消费公共 compiler、registry 与 supervisor，不改现有展示层。
- 行为：提供模块类型/配置 schema/能力枚举；定义 CRUD、草稿校验、Prompt 预览、显式连接测试、Tool 单测、发布版本和依赖影响查询；Agent/workflow 编译预览；运行启动、输入、取消、审批、恢复、显式对账、状态/运行树/事件游标。配置仓库持久化并支持版本冲突检测；凭据只返回引用和状态。模块卸载/删除不破坏活跃或历史快照，提供 in-use 诊断。HTTP+SSE 作为首个可测试适配，服务接口本身不依赖 UI 框架。绑定与访问边界由宿主显式提供，不能开放无授权的进程执行入口。
- 验收：独立无界面客户端完全经接口新建 Prompt/Tool/Hook/Agent/workflow，校验、发布、运行、等待审批、重连及重启恢复；失败定位到模块字段/节点/调用；无 Rust 代码改动，无密钥明文泄漏。API 的能力清单必须与可运行实现一致。
- 风险/回滚：管理宿主默认不接管原 CLI；只允许显式绑定的注册类型和能力。
- 续做提示：本阶段先做控制面/装载和执行接口，最终控制台页面在 L4 交付；不得只有 CRUD、只供 SDK 编译或只有新运行生效而无执行更新契约。

## C10：全矩阵验收、迁移收口与准确交付

- 依赖：C0–C9 全部门槛通过。
- 文件：现有契约/宿主测试、仓库外 fixture、兼容脚本、边界脚本、模块管理 E2E；本计划、SDK 指南、.ai_project.md。
- 行为：为每个缺口记录实现路径、公共配置、真实适配、正向/失败/重启证据及限制。清除已替代的重复机制，保留必要旧入口 shim；如果仍有 Unsupported，检查其是否落在明确非目标内，否则不能验收完成。旧预设保存配置/协议兼容，模块身份迁移有文档与测试。
- 验收：执行下列矩阵；记录真实命令、退出码和证据目录。每个审计项都必须有完成证据或用户明确批准的范围变更，不能自行降级为非目标。
- 风险/回滚：不删除仍被原入口使用的旧能力；最终 detect_changes 区分计划范围和既有用户修改，不夹带展示层。
- 续做提示：已存在的 289 项测试是基线的一部分，不是最终本轮充分条件。

## 最终验收矩阵

| 场景 | 必须观察到的结果 |
|---|---|
| 无代码装配 | 使用公共配置创建业务、研究、编程三种 Agent；更换模型/Prompt/Tool/策略无需改 runtime |
| 自定义执行 | HTTP、脚本/进程、MCP、native、workflow Tool 各有真实执行；配置与运行 schema 一致 |
| Hook | 内置/自定义事件、HTTP/脚本/原生/workflow Handler，Continue/Deny/Pause/Patch、失败/超时、递归保护 |
| 记忆与上下文 | 自研持久记忆完整操作，Personal/Project 隔离，忘记后重启/压缩不复活；Skill 与规则来源正确 |
| 模型协议 | token/工具进度实时到达、参数可核验、结构化输出、支持的多模态和 opaque 数据保真 |
| 权限与环境 | 准入、审批、sandbox、cwd、资源生命周期、子能力收窄；所有执行路径均不可绕过 |
| 双向组合 | Agent 调 workflow、workflow 调 Agent/Tool、分支并行/join/循环，控制结果不变成普通错误 |
| 进程恢复 | 审批前/后、intent 后/result 前、模型阶段、join 阶段杀进程并恢复；无盲目重放与并发双派发 |
| 配置版本 | 编辑/发布/删除模块对旧运行有确定行为；相同 ID 的不同实现版本不能蒙混恢复 |
| 总治理 | 父子总预算、超时、并发、深度、重试、取消、输入排队在重启后语义一致 |
| 管理接口 | 外部客户端从注册到发布运行、审批和重连全链路，无展示代码依赖 |
| 原始预设 | 原入口原配置，对话/工具/权限/拒绝/取消/流式/恢复/Hook/记忆/压缩/子 Agent/结构化输出回归 |
| 依赖边界 | 最小 SDK 不拉 shell/工具全集/展示层；显式启用适配才引入对应依赖 |

可复用的现有命令：

```bash
cargo test --locked --offline -p nofy-agent-runtime --all-features
cargo test --locked --offline -p nofy-sampler --features agent-runtime --lib agent_model::tests
cargo test --locked --offline -p nofy-mcp --features agent-runtime --lib runtime::tests
cargo test --locked --offline -p nofy-memory
cargo test --locked --offline -p nofy-hooks
cargo test --locked --offline -p nofy-agent-lifecycle -p nofy-workflow -p nofy-orchestra --lib
cargo build --locked --offline -p nofy-pager-bin --bin nofy
python3 scripts/check-agent-runtime-boundaries.py
python3 scripts/verify-agent-independent-consumer.py --output /tmp/nofy-closure-independent
python3 scripts/verify-agent-preset-compat.py --binary target/debug/nofy --output /tmp/nofy-closure-preset
```

以上命令存在不代表本轮已经执行。新增进程恢复、配置执行、管理 API E2E 的命令必须随对应阶段实现登记；原 shell/daemon 定向回归按实际变更选择，不默认全 workspace 构建。C10 使用 C0 保留的基线执行明确差分。

## 必须在依赖阶段前收敛的技术未知项

1. C0/C1：验证现有 DAG 和 Rhai 各自的控制/数据/重放能力，再确定统一 WorkflowSpec 的降低路径；保留明确架构决定，不并行维护第三个循环。
2. C2：检查已有 SQLite 抽象对 CAS、租约和事务事件写入的支持；先做崩溃/竞争探针再选后端，不用接口存在推断原子性。
3. C3：核对 Sampler 各实际支持 provider 的流与结构化参数矩阵；未支持能力明确拒绝，不能声称任意 provider 全支持。
4. C4/C5：核查本地执行器与 Hook runner 的取消、退出进程树、输出上限和权限语义；修补失败路径后才能开放配置注册。
5. C6/C7：确认记忆 capture、压缩、用户输入在原宿主的回执/顺序所有权，设计窄适配，不能把 SessionActor 搬入公共内核。

这些是阶段内技术探针，不是默认要求用户重新确认的门槛；遇到真实产品范围冲突才需要用户决策。

## 状态与证据账本

| 阶段 | 状态 | 通过证据 |
|---|---|---|
| C0 | 阶段基线通过 | 已固定源码/可执行身份；当前 CLI 已重新构建；修正后台请求分类后，7 场景新旧差分通过。其余领域探针与实际适配一同补齐，仍全部保留在 C10 验收矩阵，不据此宣称全量兼容 |
| C1 | 阶段通过 | registry/compile 与配置化仓库外 fixture 已实施；公共内核 41 项通过（含 10 项注册编译契约），默认依赖边界 179 项通过；真实仓库外配置化装配与原三种 Agent/委派/并行全部通过 |
| C2 | 阶段通过 | SQLite CAS/fence、RunSupervisor、持久审批/运行树、子结果对账、快照重绑定、Agent-as-Tool/顺序组合/Rhai 中断已实施；公共内核 51、Rhai 63、工具/MCP 338 项通过；nofy-shell cargo check 与默认 179 依赖边界通过 |
| C3 | 阶段通过 | runtime 60 项、Sampler 适配 10 项通过；原 nofy-shell 构建与仓库外配置装配通过，默认依赖边界仍为 179 |
| C4 | 阶段通过 | HTTP/进程/脚本、MCP 与模型连接配置工厂、宿主强制策略、原权限与工具上下文适配；150 项相关测试、原宿主构建与 179 依赖边界通过 |
| C5 | 阶段通过 | 独立 Hook/Handler、真实 Agent/父子/会话触发、持久决策/事实 outbox、HTTP/进程/原 dispatcher 与 Send/Local 适配；318 项阶段检查、Sampler 11 项、原宿主及仓库外消费通过。压缩/workflow 生产者按 C6/C8 接入，不伪称已触发 |
| C6 | 阶段通过 | 自研完整记忆、版本化 Prompt/规则/Skill、ContextPolicy 与原压缩引擎接入；1,097 项集中测试、冻结后导入/原加载器 584 项、最终原宿主构建及仓库外消费通过，最小依赖边界仍 179 |
| C7 | 调研中 | 命名运行配方、跨组合预算、Skill 执行覆盖、认证/重试及输入 mailbox |
| C8 | 施工中 | C8a 无模型 Tool 宿主、C8b WorkflowSpec/共享 DAG/双向嵌套通过；C8c1 可恢复 Hook/模块工厂通过；控制器重试、Rhai 完整映射与 Goal 编排待闭环 |
| C9–C10 | 待实施 | 管理服务、停止控制与原始预设最终矩阵尚未验收 |

实施时逐阶段展开此表；文档必须保持“计划、已实现、已验证”分离。任何阶段失败先修复或记录真实阻塞，不能以降低验收标准结案。

### C0/C1 开工记录（2026-10-28）

- 私有基线目录：`/private/tmp/nofy-closure-c0-20261028`。`manifest.json` 记录本轮开始前内容身份；patch 与日志只保存在本地，不作为可公开数据。
- 启动时 `target/debug/nofy` 不存在，已重新构建；`/private/tmp/nofy-before-modular-20261027` 是保留的旧二进制，不是从当前 HEAD 重建。
- 兼容脚本由 4 场景扩到 7 场景：plain/read/resume/stream/deny/structured/hook。拒绝检查必须看到 permission-policy 拒绝文本且没有真实文件内容；Hook 必须写入且只写一次回执。
- 第一版拒绝探针误用协议工具名 read_file 作为权限规则，未命中；已纠正为 Read，并从该场景移除 always-approve。纠正后的旧二进制 7 场景全部通过，不能把此前失败记录当成产品故障。
- C1 impact：AgentBuilder.compile 图报告 LOW/0，with_binding 报告 LOW/2（pack 与测试）；ToolCatalog.insert 补充分析 LOW/0。Rust 漏边经源码补充后按高风险公共契约处理。C1 不切换原入口，复用原 Builder/驱动；只抽取原 schema 校验供 Factory 复用。
- 配置层首批支持 Model/Prompt/ToolPack/Policy/ToolSource/ContextSource/Middleware/Checkpointer/Binding 九类实例。Hook 与 recipe 的配置扩展在后续所属阶段完成，不伪装成已可用类型。
- 现有 DAG 提供依赖就绪批次与失败传播，Rhai 提供脚本控制与 journal；C8 拟复用 DAG 调度显式图的无环片段，Rhai 保持已有脚本节点入口，有限循环由版本化控制节点描述。运行状态、节点身份和暂停统一归 C2 supervisor，不能把两个引擎的 journal 当成同一个数据格式。
- 现有 nofy-sqlite-journal 只提供连接与文件系统 journal 模式选择，不提供运行 CAS/lease 事务；C2 必须实现独立运行表及竞争/崩溃探针，再声明持久化闭环。

- C1 通过证据：`/private/tmp/nofy-closure-c1-acceptance.log`、`/private/tmp/nofy-closure-c1-consumer/result.json`；默认边界为 179 normal dependencies。注册层不等于其余 C2–C10 已完成。
- 新旧差分首轮发现后台 session_title 请求混入 foreground 记录的竞态，已按主工具集分类，禁止按请求到达顺序或工具列表非空判断。修正后的 7 场景完整差分通过，证据 `/private/tmp/nofy-closure-c0-20261028/final-differential`。

### C2 实施边界与证据（2026-10-28）

- 默认 ToolDispatch 不可恢复；只有显式 opt-in 且带非空不可变 recovery_identity 的调度器允许重接。该身份进入配方与动态工具快照，不能只比较 schema。普通工具仍在 durable intent 无结果时暂停，不自动重放。
- 同一执行树以父 checkpointer 为准，子 Agent 独立运行时可用自己的后端，嵌入有状态父运行时使用父后端，以保留统一事务 fence。跨后端的分布式事务不属于本轮。
- 可选 sqlite feature 复用 nofy-sqlite-journal 的连接模式选择，增加独立 runtime 表、FULL synchronous、CAS 与事务内租约验证；不会迁移旧会话格式。默认 runtime 依赖闭包仍不选择 SQLite。
- 新 RunSupervisor 保存原始编译快照、真实 composition、运行和子运行树；审批绑定 root/thread/step/call/arguments，决定可重试提交但不可翻转或挪用。
- `CompilationSnapshot.restore` 要求所有 Factory 描述与实现 revision 精确匹配；活跃 thread 不能被另一个 run ID 抢占，旧 run 不能覆盖新轮。
- `reconcile_child` 只处理当前 root 已记录的后代，并匹配实际 checkpoint composition 与完整 intent；记录操作者的外部证据，绝不重试该调用。
- `sequence_agent` 返回普通 Agent，具备 typed 控制和父子恢复；原 sequence 文本 helper 保留兼容用途。Rhai 通过新增 HostError::Paused 传播不可捕获暂停，平行面板完整收敛后停止，未完成面板不提交结果；已完成子工作通过 checkpoint 重接。
- Rhai 的持久恢复必须显式安装 WorkflowCheckpointer，它冻结 script/args/所有 Agent 的实际 composition 并统一子后端。无该绑定时不宣称暂停可恢复；原无状态完成用法保留。
- C2 impact：run/tool/as_tool/Checkpointer/ToolDispatch 图存在漏边，实际按公共工具与恢复契约高风险处理；补充 host_call 分析为 HIGH、32 个符号，已编辑前报告。保留原入口与现有 Rhai 完成/失败语义，增加控制分支而非复制引擎。
- 已通过的首轮 C2 证据：`/private/tmp/nofy-closure-c2-final-tests.log`，公共内核 51 + Rhai 63 项；其中独立 OS 进程审批/重启、父结果写失败重接、崩溃 intent 不重放与显式对账、过期 fence/CAS、版本漂移和两种 Rhai 面板均通过。
- C2 收口证据：`/private/tmp/nofy-closure-c2-sealed-tests.log`（FULL 同步/同树后端后 51 项通过）、`/private/tmp/nofy-closure-c2-adapter-tests.log`（338 项通过）、`/private/tmp/nofy-closure-c2-shell-check.log`（宿主构建检查通过）。C2 共 452 项相关测试，不把 C1 的子集重复累计。

### C3 实施边界与证据（2026-10-28）

- Model 上游图为 CRITICAL、14 个直接实现，编辑前已报告；保留 complete 兼容默认，并复用三种原生 backend 流解析器。
- 新 events 模块拥有 canonical 事件，agent::RunEvent 保留旧 reexport；durable sink 先写，live 背压，断线不停止运行，取消可跳过阻塞 live send。SQLite 保存 root/run/thread/parent/node、游标、时间、版本。
- Sampler 纯参数校验先于客户端创建；结构化输出本地根引用、有限修复与调用配对，拒答不修复，原生 opaque 数据保留。图片只接受明确 URI，不读取任意宿主文件。
- `/private/tmp/nofy-closure-c3-sealed-runtime.log`：60 项通过（含 9 项新增流/事件检查）；`/private/tmp/nofy-closure-c3-sealed-sampler.log`：10 项适配检查通过。
- `/private/tmp/nofy-closure-c3-shell-check.log`：原宿主构建通过；`/private/tmp/nofy-closure-c3-consumer/result.json`：仓库外 JSON 装配及依赖隔离通过；默认 179 normal dependencies。
- 索引刷新后 110125 symbols / 263063 relationships，detect_changes 汇总 933 个符号、21 flows、81 个已跟踪文件，整体 CRITICAL 标签符合多阶段内核改造范围，不等于全矩阵验收完成。

### C4 实施边界与证据（2026-10-28）

- 新增下游可选包 nofy-agent-executors；HTTP/进程 Factory 构造无 I/O，真实资源由宿主显式安装。固定 HTTP origin/路径/方法/凭据引用；显式进程程序摘要、workspace、环境与 guard；运行输入仅 JSON stdin。执行有界、错误不回传凭据；EffectSemantics 不授权自动重放。
- model.sampler 与 tool.mcp 配置工厂分别绑定已准入连接和名称。MCP 连接 epoch 改变继续拒绝未完成调用，显式重新绑定流程留在 C7/C9 收敛。workflow Tool 的发布工厂依赖 C8，这一项没有被宣称在 C4 完成。
- registry.require_policy/with_required_policy 建立父子不可移除的宿主 floor；required policies 保存进编译快照，移除 floor 后恢复失败。policy.tool_scope 只收窄；原 PermissionHandle 真实 managed deny 经别名、per-call cwd 与 use_tool 包装仍生效。
- 原 ToolBridge adapter 使用完整 per-call context 的 streaming 接口；内部 use_tool 保留能力并去除递归 inner dispatch，注册表自有资源仍权威。没有修改展示层。
- `/private/tmp/nofy-closure-c4-core-executor-sealed.log`：64 runtime + 9 executor；其中进程树超时/取消/future 丢弃均实际启动子孙进程后验证。第一版 150ms 探针启动期限太短，调整探针后通过。
- `/private/tmp/nofy-closure-c4-native-tools2.log`：62；`/private/tmp/nofy-closure-c4-model-tests.log`：11；`/private/tmp/nofy-closure-c4-mcp-tests.log`：3；`/private/tmp/nofy-closure-c4-permission-tests2.log`：1。共 150 项相关测试，包含必要既有回归，不是 150 项全新增测试。
- `/private/tmp/nofy-closure-c4-host-check2.log`：nofy-agent/executors 与原 nofy-shell 构建通过；前一构建启动早于新增 sha2 依赖，已用最终清单重跑。默认内核依赖边界仍为 179。
- `/private/tmp/nofy-closure-c4-index.log`：109971 nodes / 261869 edges / 300 flows；新 ProcessToolFactory 与 PolicyFloor 可被索引定位。暂存新增文件后 detect_changes：1298 个符号、20 flows、100 个文件，整体 CRITICAL，符合累计施工范围。

### C5 实施边界与证据（2026-10-28）

- 新增 Hook/HookHandler 模块种类、AgentDefinition.hooks、hook.subscription/ExecutorHookFactory 与原 Hook、Send/Local 生命周期适配；原 AgentSpec/默认无 Hook 路径保留。事件声明不自动触发；自定义事件须由对应 producer/version 实际 emit。
- Handler 的 Continue/Deny/Pause/Patch 与结束 gate 的 Stop 有明确权限；工具 ID 保护、Patch 后 schema/最终策略重验。Stop 收集继续工作请求、允许强制结束并保存 hook_stop_reason，不丢原 Stop 信号语义。
- 工具准备、模型请求、Hook intent/result/failure/Patch 与事实 outbox 可持久重接，取消后的未知 handler 结果不重放；显式 reconcile 绑定原事件/订阅/版本，不能翻转已决定结果。Agent 暂停须有完整状态 checkpointer。
- 原 command runner 补充影响分析 HIGH/49（编辑前已报告），改为有界前缀捕获并 drain，future 丢弃/超时有进程组 guard；正常完成保留原语义。原 dispatcher 不再跨 await 持有非 Send tracing guard，而使用 async instrumentation。
- `subagent_start/finished` 有 Agent-as-Tool 实际生产者，`subagent_stop` 是子 Agent 可暂停结束 gate；session idle/end 由真实协调器显式 notify。取消/错误有实际终止事件和有界清理。before/after_compact 及 workflow/node 声明是 C6/C8 的接入端口；workflow handler 的可恢复控制由 C8 接线，当前普通 executor handler 明确拒绝可恢复调度器。
- `/private/tmp/nofy-closure-c5-acceptance.log` 与 `/private/tmp/nofy-closure-c5-delivery-tests.log`：318 项相关检查（含原有测试和 doctest）；覆盖 80 项 runtime、10 项执行器、7 项 lifecycle、221 项 Hook/集成/文档检查。新增真实 HTTP/进程 handler、原 matcher/disabled policy、取消后子孙进程清理、父子 stop 暂停恢复、session 结束一次性和 Stop override 均通过。
- `/private/tmp/nofy-closure-c5-sampler-tests.log`：11 项通过；`/private/tmp/nofy-closure-c5-final-host-check.log`：最终原 nofy-shell 构建通过；`/private/tmp/nofy-closure-c5-consumer/result.json`：仓库外 SDK 通过。默认内核 normal dependencies 仍为 179。
- 第一轮注册探针错把 define 当作立即校验入口，已按既有 resolve/compile 延迟校验契约修正；未知选项测试中的 hooks 现已合法，改用 hook_typo 继续验证拒绝未知字段。未改变旧注册语义。

- C5 最终索引 `/private/tmp/nofy-closure-c5-sealed-index.log`：110263 symbols / 262535 relationships / 300 flows；最终范围核对在暂存后执行。

### C6 阶段记录（2026-10-29）

- 入口影响分析覆盖 ContextSource、Checkpointer、model_hook_request、MemoryService/队列、Prompt/Skill loader、配置编译与原压缩算法；图上的 LOW 不代表 Rust 方法无调用，已对照真实调用点。Skill loader/目录收集 HIGH/19–20、原规则根 loader MEDIUM/19 在编辑前报告，旧公开入口/默认目录/顺序保留，增加显式可省略 HOME 的根目录入口。
- 自研记忆通过 nofy-memory 的可选 agent-runtime 接入，复用真实 canonical 引擎的全部读写、解释、忘记、撤销、整合与快照能力。资源与模块逐层收窄区域授权，子运行每次按 lineage 检查；搜索在限量前筛选范围。世代变化使暂停的 prepared model request 失效，临时检索不存入历史。
- Capture 使用实际 CaptureQueue 和原 worker，内核只在 durable backend 成功提交回合后发行私有构造的回执；子回合、拒答/截断、内存后端不伪称持久成功。学习仅取本回合可见文本，排除工具/系统、停止反馈和压缩摘要。旧字符串 capture 入口明确要求宿主 barrier，不再只检查开关就返回 queued。
- prompt.document 的变量 schema、有序 literal/template、真实工具视图、来源/预览已接入。context.rules/context.skills/tool.skills 冻结原 loader 内容与元数据，复用原 SkillManager、条件匹配、正文裁剪/替换/格式；插件命名空间与安装包版本可映射模块身份。执行 model/effort/allowed_tools 覆盖留在 C7，以明确报错保护，不能静默降级。
- 新 ContextPolicy 插槽真实参与 Agent 循环，计划/gate/变换/outbox 分段持久化；原 nofy-compaction 的 FullReplace、tail selection、采样/清洗/组装直接复用。系统和当前回合保留范围不可改写，摘要用量累计，before/after_compact 真正触发。Opaque 在 FullReplace 原样交给对应模型；TailKeep 无类型视图时明确拒绝。原 shell 两遍压缩没有被重写。
- `/private/tmp/nofy-closure-c6-acceptance.log`：1,097 项通过（Agent 587、runtime 78、compaction 145、memory 287；此组合没有启用 runtime/pack 的 5 项测试）；包含原记忆恢复/墓碑/敏感处理与导入优先级测试。`/private/tmp/nofy-closure-c6-sealed-import-tests.log`：最终冻结源码的原 Agent/导入边界 584 项通过。默认依赖边界仍 179，仓库外结果 `/private/tmp/nofy-closure-c6-consumer/result.json` 通过；`/private/tmp/nofy-closure-c6-final-host-check.log` 最终原 nofy-shell 构建通过。
- 阶段内修正：队列状态断言由误写 pending 改为真实 queued；条件 Skill 探针补真实文件，并冻结 canonical cwd，覆盖 macOS 路径别名；过小 tail 预算不能拆当前工具组时，保留整个当前回合并只压旧历史。初轮测试启动后新增 MiniJinja fuel feature 引发旧构建图错误，已在完整 feature 集下重建验收。
- Hook 恢复要求同一回合沿用原 run ID，错误身份不会执行原回合终止 handler；不同输入仍使用新的 run ID。这个约束与 C2 supervisor 的稳定恢复身份一致。
- 最终索引 `/private/tmp/nofy-closure-c6-final-index.log`：110639 symbols / 263047 relationships / 300 flows；暂存后 detect_changes：1952 symbols / 17 flows / 144 files，累计风险 CRITICAL，已报告；没有展示层文件变更。这是累计影响范围，不是缺陷证明，也不替代 C10 全量兼容验收。

### C7a 阶段记录（2026-10-29）

- 入口分析覆盖 SqliteStore.open_with_clock、SqliteStore 和 GuardedCheckpointer；图上 LOW/0，源码明确存在 supervisor/checkpoint/event 消费，因此在原数据库增加独立预算表、保留原检查点和事件格式，所有事务继续走既有 Immediate transaction 与可选租约 fence。
- governance 模块提供 BudgetStore、预算 scope/spec、预留/实际 cost、回执/未知 intent 与游标事件。内存和 SQLite 使用相同状态转换；根总量与 operation 记录分表，避免每次重写全部历史。未知预留不会重新发放；已结算仅重放相同回执，同一操作换参数或改变预算版本/限额报错。
- steps/model/tool/child/tokens、primitive 并发、活跃子调用、深度和固定 deadline 有独立计量。enroll 在资源等待前启动期限；重启/重新注册不清零。超出提供方声明上界的实际 usage 仍记账并封锁后续请求，不能通过丢弃错误回执掩盖成本。
- `/private/tmp/nofy-closure-c7a-sealed-tests.log`：88 项公共内核回归通过，其中新增 10 项预算契约/竞态/跨连接/重启/fence/deadline 测试。预算尚未接实际 Agent 模型与工具调用，该工作必须在 C7b 完成；不能把存储测试通过当作总预算治理完成。
- `/private/tmp/nofy-closure-c7a-minimal-check.log`：无默认 feature 构建通过，没有引入新的 normal 依赖或强制 SQLite。
- C7b 冷启动入口：先补 impact，再抽 AgentHost 的模型推进体到独立适配文件（保留 advance 入口），为每个实际请求持久化稳定 operation ID；不能在 resume 时用 steps+1 重新生成已发出但未提交回执的请求。预算回执须能缓存 ModelResponse/工具终值，并区分未执行、未知、完成，不能把未知预留当作重试许可。
- C7b 计量边界：SamplerConfig.context_window 明确只是信息，不是 sampler 的强制输入上界；原 max_retries、429 门槛、length 与 structured_output 修复可能在一个 SDK Model 调用中发出多次请求。必须统一真实尝试与可信 token 上界，无法声明上界的模型在启用硬 token 限额时明确失败；实际超界回执已由账本记录/封锁。压缩请求必须走同一计量口，不能只在主循环加计数器。
- C7c/C7d 保留约束：Skill 的 model/effort/allowed_tools 当前会明确拒绝，须用作用域配方收口；原 auth 只应按已有 session/first-party/BYOK 门槛恢复，401 与 403 不混用。输入复用 nofy-interjection-core 的格式/FIFO，旧 SessionActor 的 safe-point 与排队语义不搬入公共内核。


### C7b 阶段记录（2026-10-29）

- 已接实际执行：GovernanceFactory/宿主 required_governance floor、Agent 模型与工具、子 Agent 深度/调用槽、原 compaction、HTTP/进程 Hook 以及原 LegacyDispatcher 的每个命令/HTTP runner。新增 ModelRequestBound、PendingModel 和 claim 契约；原运行入口没有隐式启用治理。
- 入口 impact 复用本阶段 Agent.run / advance / tool、compile_agent / Model / AgentDefinition、supervisor.execute_leased、SamplerModel.stream / provider_stream、RuntimeSampler.sample_compaction 及 BudgetStore 分析。补充 HookBus.emit（HIGH，8 个关联符号）与原 run_hook（HIGH，24 个关联符号），均已在修改前报告；仅增加可选执行适配，旧 dispatcher API 继续走原 native runner。Rust 图存在漏边，LOW/0 不代表没有调用方。
- Ledger 的 reserve 与原子 claim 分离：旧未带 claim 标记的 pending 记录按已派发保守处理。首次派发只有一个 worker 获得许可；结果先结算、后提交 Agent 状态。SQLite 重开后可从模型/工具结果缓存继续；未知 primitive 不重发，手动 Tool reconciliation 同时释放计量槽。子控制器按不可变协议重接，父预算不能被子 bindings 清除。
- Supervisor 要求预算与根检查点同库，操作使用根 lease fence；其他数据库/内存预算不能作为 durable 执行的替代后端。绝对期限不重置，资源等待/准入/流式/退避均可取消；上界违约仍记实际 usage 并阻止后续工具。
- 源码确认 SDK provider_stream 直接进入 SamplingClient 原始流，不经过旧 actor 的 retry.rs；没有禁用旧 CLI 的重试。结构化修复保留本域所有权，按最大 HTTP 次数预留，实际次数结算。压缩走 sample_model；语义摘要重试仍属原 compactor，启用治理时不再叠加传输重试，未安装治理时保留原重试行为。
- 硬 token 限额只接受宿主安装的 ProviderRequestLimits/ModelRequestBound；SamplerConfig.context_window 是信息字段。固定连接后拒绝运行时换模型/路由及超上界输出 cap，API key 同连接轮换保留。失败/取消缺少最终 usage 时保守结算预留上界，回执标记 reserved_upper_bound；不能把这一数值称作精确用量。
- `/private/tmp/nofy-closure-c7b-core-sealed.log`：最终公共内核 106 项通过，其中 governance_runtime 10 项覆盖真实派发拦截、父子总量/深度、绑定清除、超额、重试取消、deadline、失联暂停、模型/工具重开缓存、对账释放和 supervisor 同库接线。`/private/tmp/nofy-closure-c7b-core-native-acceptance.log`：原 Hook 221 项通过，包括原 API 全回归与每 runner 计量探针。
- `/private/tmp/nofy-closure-c7b-sampler-tests.log`：13 项真实三后端流/修复/上界测试通过；`/private/tmp/nofy-closure-c7b-adapter-tests.log`：执行器 10 + 压缩 4 项通过。合计 354 项相关验收（不重复累计旧内核测试）；另有 1 个原 Hook 文档示例通过。新增 Hook 测试初轮 mock 仅识别 before_tool，导致 before_model 返回非 Hook JSON；修正测试服务后全部通过。新 supervisor 测试初轮传入 Arc<SqliteStore>，按既有 API 修正为 SqliteStore 后通过。
- `/private/tmp/nofy-closure-c7b-host-check.log`：原 nofy-shell、Agent/context 与 Memory/runtime 构建通过；`/private/tmp/nofy-closure-c7b-consumer/result.json`：仓库外配置/委托/并行消费通过。最小 normal 依赖 186，增加 SHA-256 的 7 项闭包；无 shell、tools 全集或展示依赖。原 CLI 最终全矩阵仍在 C10，不能由构建通过替代。
- 续做入口：C7c 需要可注册 recipe/stage 与实际 stop/重复/Todo/length 策略，完成 FrozenSkills 当前明确拒绝的 model/effort/allowed_tools 作用域覆盖；之后 C7d 的 auth/mailbox，再进入 C8/C9/C10。仍须补充 C7c upstream impact 后才编辑新阶段。未知 Hook intent 仍按 HookJournal 原有对账协议处理；模型上下文世代改变而已有 pending RPC 时暂停待处理，不使用遗忘前的请求重新采样。

- C7b 最终索引 `/private/tmp/nofy-closure-c7b-index.log`：111009 symbols / 264269 relationships / 300 flows，55.5 秒。
- C7b 暂存后 detect_changes：2326 symbols / 18 flows / 159 files，累计风险 CRITICAL，已报告；无 TUI/Web/桌面展示层改动。尚未提交。

### C7c 接续拆分

- C7c1：注册 Recipe/Stage，公共配置决定合法插槽与 stage 顺序；stage 是纯决策，不承接外部 I/O，实际 I/O 仍使用 Tool/Hook。持久化 pending stage 与结果应用进度，不能在模型/工具结果提交后丢掉 after stage。补纯 config_dependencies 契约用于可变 stage/图依赖，默认工厂保持原行为。
- C7c2：原重复动作、Todo/Goal、length 策略接真实 recipe，并完成 Skill 的作用域 model/effort/allowed_tools 覆盖；不能仅把字段改为接受或导出 helper。
- C7c1 upstream 已分析 advance/model_step/tool/before_hook_stop、compile_agent/AgentDefinition/RunState、registry.visit/resolve_typed、on_length_stop/observe/evaluate_todo_gate。图上 LOW/UNKNOWN，源码补充原 shell model/dispatch/completion 调用，保留原算法与入口。C7b 的累计 CRITICAL 范围已报告。


### C7c1 阶段记录（2026-10-29）

- 新增 Recipe/Stage 两类注册模块（现为 15 类），AgentDefinition.recipe 与公共 with_recipe 接实际 AgentHost。合法边界和配置顺序可声明；不允许删除/重排核心校验。Stage 是有界纯决策，外部 I/O 仍由 Tool/Hook 处理。
- config_dependencies 为工厂提供纯配置派生依赖，required_dependencies 供无界面客户端读取完整依赖 kind；默认工厂不变，固定依赖不能覆盖，图校验仍先于所有 build。此契约也为后续 WorkflowSpec 提供可变节点依赖。
- before/after model/tool 与 before_stop 已接线。后置 frame 与原结果同次提交，工具结果用消息索引引用；stage 数据/进度同次 CAS，Pause 保留位置，Limit 保存原因，RejectTool 不执行副作用。feedback 等待所有工具配对并标记 synthetic，遵守自动 capture 排除规则。
- `/private/tmp/nofy-closure-c7c1-core-sealed.log`：公共内核 110 项通过，新增 4 项覆盖 JSON 配方、阶段依赖/非法插槽、暂停重接、工具结果后的纯效果恢复。`/private/tmp/nofy-closure-c7c1-host-check.log`：原 shell、Agent/context、Memory/runtime 构建通过。初版后置 frame 复制了 Tool 结果，阶段审计后改为稳定消息索引，最终冻结源码已重跑。
- C7c2 尚未实施：重复动作/Todo/Goal/length 策略与 Skill model/effort/allowed_tools 仍须实际接入，FrozenSkills 保持明确拒绝相关覆盖字段。C7c1 不代表 C7 完成。
- `/private/tmp/nofy-closure-c7c1-consumer/result.json`：仓库外 JSON 配方消费通过，recipe=true，配置/委托/并行与最小依赖边界继续通过。
- C7c1 索引 `/private/tmp/nofy-closure-c7c1-index.log`：111115 symbols / 264498 relationships / 300 flows，41.6 秒。
- C7c1 暂存后 detect_changes：2431 symbols / 30 flows / 162 files，累计风险 CRITICAL；沿用已报告的兼容迁移边界，无展示层改动。

### C7c2a 实施入口

- 首先将原重复动作和 length helper 作为 Stage 工厂接实际循环，计数需持久化；length 的文本拼接必须限制在无结构化输出、无拒答、无未配对工具的最终边界。补充分析 drain_recipe / AgentStage.evaluate，并复用已完成的 on_length_stop / observe upstream 分析，旧 shell 调用保留。此步不宣称 Todo/Goal 或 Skill 已完成。


### C7c2a 阶段记录（2026-10-29）

- 新增 stage.repeat / stage.length 纯配置工厂，实际参与 after_tool / before_stop；没有改变原 shell helper 的算法，只为其策略状态补序列化。Repeated classifier 由明确工具名/结果错误与 true-noop 配置提供，使用规范化参数签名和原 nudge/hard-stop 逻辑。
- Length 复用原继续计数和首次提醒 latch，真实模型片段由 kernel accumulator 保存/合并；无任意最终输出改写接口。结构化、拒答或未配对工具状态不能进入文本 accumulator。达到继续次数后保留 length 状态，超字节上限明确失败；不会伪称完整回答。计数/文本应用和 stage 位置共同提交，恢复不重复前缀。
- 新增 ContinueText/CompleteText 后 stage.literal descriptor revision 为 2；模型/Tool 的最终校验仍不变。单 stage effect 仍 64 KiB，文本由独立 1 MiB buffer 持有，总 recipe progress 仍 4 MiB。
- `/private/tmp/nofy-closure-c7c2a-core-tests.log`：114 项内核回归通过；其中新增 4 项实际循环验证重复提醒/停止、长文本中断恢复、length 截断/结构化保护和累积上限。随后统一 RepeatConfig 的 JSON/原生默认值与命名/大小界限，`/private/tmp/nofy-closure-c7c2a-policies-sealed.log` 最终 4 项策略测试通过；没有重复运行无关旧用例。
- 下一步仍为 Todo/Goal 的实际来源及 Skill 作用域执行，不得将已取消拒绝字段或静态样例称作完成。原宿主最终兼容矩阵仍为 C10 门槛。
- C7c2a 索引 `/private/tmp/nofy-closure-c7c2a-index.log`：111207 symbols / 264655 relationships / 300 flows，120.5 秒。

- C7c2a 暂存后 detect_changes：2494 symbols / 30 flows / 164 files，累计 CRITICAL，尚未提交。

### C7c2b：Skill 执行覆盖施工边界

- model/effort/allowed_tools 使用显式模型/工具/上下文模块依赖构建 scoped child Agent，复用 ChildAgent 的真实预算/权限/取消/持久恢复；父模型和设置不做全局修改。无 execution 配置的旧正文加载入口继续拒绝执行覆盖，context.skills 只读列出元数据。
- Skill scope 需要一个纯编译器接口：默认支持精确工具名；nofy-workspace 下游适配复用原 parse_permission_rule/CompiledPolicy 处理 Bash/路径/MCP 等 Nofy 规则。其 Allow 仅代表 scope 内可用，宿主必需权限仍逐次检查。未知裸自定义工具名必须按精确名称处理，不能意外套用原 parser 的裸路径 glob 分支。
- 已分析 FrozenSkills.validate/call、SkillsFactory.build、ImportRoots.skills、ChildAgent.call、NofyPermissionPolicy.classify、tool_filter_matches/evaluate_with_cwd、parse_permission_rule。parse_permission_rule 为 CRITICAL（63 符号，44 直接调用方），已提前报告；只复用，不改解析语义。补分析 Model/effective_config（LOW），用于显式模型选择时隔离父 SamplerConfig；同连接密钥轮换可复用，跨连接不能带父凭据。
- 冷启动注意：nofy-workspace 已依赖 nofy-agent，Agent 不能反向依赖 workspace；scope 编译器 trait 放 Agent，原生规则实现放 workspace。Root SDK 无新产品依赖。原 GoalTracker 位于 shell/session/goal_tracker.rs（3818 行，非完全纯，含 FS/配置依赖），Todo 的实际 canonical 状态在 nofy-tools State<TodoState>；Todo/Goal 尚不能靠静态 JSON 替代真实来源。

### C7c2b 阶段记录（2026-10-29）

- Skill 的 execution 通过显式类型依赖选 default/model-alias、Prompt、工具/动态源、上下文/压缩/策略、recipe 和 Hook。FrozenSkills 仅结构校验；无执行绑定的旧载入路径继续明确拒绝执行覆盖。context.skills 可展示元数据，不因此执行。model/effort 在编译时校验；原生 Sampler 只在同连接复用轮换凭据，不改变父模型或跨连接传密钥。
- 入口 impact 覆盖 FrozenSkills、SkillsFactory、ImportRoots.skills、ChildAgent.call、Model/bind_scope、SamplerModel.effective_config、NofyPermissionPolicy.classify、CompiledPolicy.evaluate_with_cwd。复用原 parser 的分析 CRITICAL/63（44 direct、3 flows），已在编辑前报告；原规则解析/判定算法未改，仅对别名分类抽取兼容包装和内部匹配可见性作窄适配。
- Skill 作为真正 resumable Agent-as-Tool 运行，继承不可移除的宿主权限和根预算，显式隔离上下文；白名单只收窄不授权。默认规则按实际 ToolId；原宿主编译器复用 Read/Bash/MCP/use_tool 和链式命令匹配，未知自定义名不走 bare-path glob fallback。条件、禁用、user-only、目录优先级与正文替换复用原逻辑。
- `/private/tmp/nofy-closure-c7c2b-agent-sealed-tests.log`：597 项通过（581 原 Agent 单元、3 Prompt、10 scoped Skill 含 worker 入口、3 导入/上下文）；实际新增父子执行场景验证隔离、权限拒绝、审批后不重采样、根预算、配置快照、拒答/截断、取消与 SQLite 全新进程恢复。`/private/tmp/nofy-closure-c7c2b-native-scope-tests.log`：2 项原权限匹配测试通过；`/private/tmp/nofy-closure-c7c2b-sampler-tests.log`：12 项真实 HTTP/三后端测试通过，其中新增模型与凭据作用域测试。
- 探针阶段修正对 CompiledAgent.agent、RunContext.cancel 与 TypedToolOutput.value 的错误用法；拒答测试进一步发现结构化值更新后模型可见文本未刷新，已改为统一重建 TypedToolOutput，最终集中回归通过。元数据 HashMap 先排序再摘要，真实两个 worker 的 child 身份保持一致，实际文件工具仅执行一次。
- 原宿主构建 `/private/tmp/nofy-closure-c7c2b-host-check.log` 通过；默认 normal 依赖仍 186。`/private/tmp/nofy-closure-c7c2b-core-tests.log` 的 sqlite/pack 组合 112 项通过（未启用 workflow adapter 的 2 项）；仓库外消费 `/private/tmp/nofy-closure-c7c2b-consumer/result.json` 通过；索引 111388 nodes / 265023 edges / 300 flows。用户 mailbox 的显式 user-only Skill 执行仍属 C7d；Todo/Goal 和 C8–C10 均未完成。

### C7c2c：任务观察源与 Todo 闭环

- 补充 upstream impact：ModuleKind/RuntimeRecipe LOW/0、StageInput LOW/4（2 类模型/工具流程）、drain_recipe LOW/3；源码补齐 RecipeFactory、配置快照及阶段推进调用方。新增 StageSource 作为独立模块，原纯 AgentStage 不承担异步 IO。源只读且有身份、超时、取消与 64 KiB 上限；每次阶段先提交观察快照，再提交决定/阶段游标。显式恢复暂停时允许重新观察；决定提交失败则使用已保存快照，避免重复读导致决定漂移。
- stage.todo 调用原 evaluate_todo_gate，保留 insertion-order 背景任务分区、原默认 2 次继续、Goal/refusal/structured-output 排除。source.nofy_todo 从实际 ToolBridge 的 State<TodoState> 与真实 terminal task 列表读取，外部协调器通过有身份的 TaskActivitySource 提供活跃子任务/Goal；没有另建 Todo store。来源绑定 thread，子 Agent 不能读另一个线程的任务。
- 实际原 Todo 工具验收发现原资源写入是后台排队语义；为了让 SDK durable terminal 不早于真实资源落盘，增加显式 tool_catalog_durable 和 checked fsync barrier。旧 tool_catalog、原宿主后台写入接口和状态格式保留。补充 impact：PresetDispatch LOW/4（tool_catalog/provider task）、save_and_flush_persistence LOW/3（workspace 持久化调用方）；不改变原方法算法，增加独立 checked 方法复用既有 SaveAndFlush。
- `/private/tmp/nofy-closure-c7c2c-task-tests.log`：5 项通过，覆盖实际继续/上限、原背景任务分区、快照决定提交失败、显式恢复刷新、取消/超时及纯配置类型校验。原工具注册 `/private/tmp/nofy-closure-c7c2c-native-registry-tests.log`：62 项通过。`/private/tmp/nofy-closure-c7c2c-native-task-final.log` 3 项实际原工具更新、立即重开、写入失败上报通过；`/private/tmp/nofy-closure-c7c2c-core-final.log` 的 sqlite/pack 组合 117 项通过。原宿主构建 `/private/tmp/nofy-closure-c7c2c-host-check.log`、仓库外消费 `/private/tmp/nofy-closure-c7c2c-consumer/result.json` 均通过，最小 normal 依赖仍 186。
- 写入失败探针初版把 state 路径设为目录，但原 persistence 会自动移除该目录后写入，因而实际没有失败；已改为占用临时文件目标目录，验证真实 EISDIR。不得因此把成功写入误判为 barrier 未传错误。
- 后续 C7c2d：原 GoalTracker 的状态/迁移/历史/资源算法下沉并保留 shell 重导出，GoalRoleModel 同一类型重导出避免依赖反转回 MCP/配置全集；真实 Goal 状态源与结束 gate 接 StageSource。规划/执行/验收的编排端口与 C8 WorkflowSpec 共同接线，不能只导出 Goal 类型即宣称完整 Goal 模块完成。

### C7c2d：共享 Goal 状态与观察 gate

- 入口 impact 覆盖 GoalTracker、GoalOrchestration、from_snapshot（MEDIUM/12）、create_goal（MEDIUM/86）、GoalRoleModel（LOW/0）；Rust 图漏边以实际 planner/classifier/session/slash/status/notification 消费点补齐。共享配方/StageSource 范围复用 C7c2c 分析。保留 shell::session::goal_tracker 和 config-types::GoalRoleModel 重导出，不重命名公开符号，不改变原状态机算法/serde 字段/未知状态 fail-closed 与 scratch 安全规则。
- 原 GoalTracker 实现及 120 项状态/恢复/历史/资源测试下沉 nofy-goal；原宿主保留 2 项 GoalUpdated 线协议测试。RoleModel 类型同源迁移，避免共享 Goal 库反向依赖 config-types 的 MCP/配置全集；原配置路径继续为相同类型。原 panel/rescue 常量同源共享且值不变。
- stage.goal 与 source.nofy_goal 使用 canonical tracker 的只读投影。纯 gate 不以模型自称完成结束 active Goal；有界继续耗尽后 Pause，原 paused/blocked/infra 状态留在暂停控制轨、BudgetLimited 留在预算控制轨、Complete 才解除 gate。计数绑定 goal_id，替换目标不沿用旧目标的计数。源绑定 owner thread，锁竞争异步等待且可取消。
- `/private/tmp/nofy-closure-c7c2d-goal-state-tests.log`：原 120 项测试通过；`/private/tmp/nofy-closure-c7c2d-goal-wiring-check.log`：Agent/context+goal 构建通过；`/private/tmp/nofy-closure-c7c2d-goal-runtime-final.log` 的实际状态源/配置快照/暂停恢复/未知状态/锁取消/目标替换计数 4 项通过；`/private/tmp/nofy-closure-c7c2d-original-goal-final.log` 的原宿主 495 项 Goal 回归通过。
- 这里的 completed 事实由受信的 canonical verifier/controller 生产，测试显式完成 tracker 只证明 gate 消费行为，不能当成验收模型已接入。公共配置化规划/工作/验收与 Goal command 的持久编排仍须在 C8 连同 WorkflowSpec 接完，当前不宣称完整 Goal 模块闭环。

- C7c2c 最终集中验收 `/private/tmp/nofy-closure-c7c2c-acceptance-final.log`：717 项通过（Agent 600 + runtime 117）；连同原 registry 62 项，阶段共 779 项相关测试通过。写入失败探针的旧失败记录保留，最终成功记录明确分列。

### C7d 冷启动设计与补充分析（Auth 已实施；mailbox 待实施）

- Auth 预分析：session_token_auth_gate LOW/7（子 Agent bearer resolver 流程）、sample_model LOW/1（Rust 图漏掉 compaction 消费，沿用 C7b 源码补齐）。拟把纯 ModelByok/session gate 移到 nofy-auth，并保留 shell 原路径；不改 CLI 的原恢复入口。实际 SDK 恢复由显式安装的 Sampler 连接资源负责，401 且未开始响应内容时至多一次；403 不刷新，不把第三方 BYOK 交给 session token。原 AuthCredentialProvider/已有 provider 的刷新逻辑可复用；不能套一层隐藏 HTTP 重试而丢掉预算计数。
- Sampler 的 native structured repair 与 auth retry 需共计真实 HTTP 次数；auth 每个 SDK 模型操作至多一次，可信上界为原 repairs+1 再加 1，不必按每个 repair 再倍增。成功回执记录真实 calls_used，失败缺 usage 沿用 reserved_upper_bound；固定 origin、连接和资源 revision，刷新等待可取消。禁止在已有文本/工具 delta 后盲目重放。原 transport retry 仍由 governance 持有。
- Mailbox 后续另阶段分析 supervisor/SQLite/Agent safe-point/RunInput 入口。复用 nofy-interjection-core FIFO 与格式；新输入与 interjection 分型，不在未配对 Tool 结果中间注入。需要 durable claim/deliver/ack 与 checkpoint 输入 ID 去重、根租约 fence、NextTurn 与 Interject 的队列边界；取消沿现有控制轨。显式 user-only Skill 命令须有内核签发且精确绑定工具/参数/调用身份的用户来源凭据，不能允许模型传 user_initiated=true。不能只把内存队列换名成持久邮箱。

- C7c2d 原宿主首次编译发现共享类型迁移后的 Rust orphan-rule：旧 shell 中 From<GoalVerdict/PauseReason> for telemetry（两侧现在均为外部类型）不合法。补充 impact 2 个 telemetry enum LOW/0，并按源码补齐映射与调用方；把原 exhaustive conversion 移到拥有 telemetry 类型的 nofy-file-utils，保留所有 .into() 调用和映射。原共享测试 fixture 通过 nofy-goal/test-support 给 shell dev-dependency 使用，不纳入生产默认 API。修复后的原宿主 495 项 Goal 回归已全部通过。

- C7c2c/d 封账索引 `/private/tmp/nofy-closure-c7c2cd-index.log`：111578 nodes / 265393 edges / 6196 clusters / 300 flows，151.7s。Goal 下沉源码审阅 `/private/tmp/nofy-closure-c7c2d-goal-extraction-review.json` 精确比对通过：除声明的文档、命名空间/可见性、测试导出与 2 项宿主 wire 测试搬移，算法源码一致。原 Goal 阶段实际验收合计 619（共享状态 120 + 实际模块 4 + 原宿主 495）。未改展示层；Root Cargo.toml 未改。

### C7d1：认证恢复资源

- 入口 impact：原 session_token_auth_gate LOW/7、ModelByok LOW/0、SamplerModel.stream LOW/2、request_bound/connection/factory LOW/0；结合源码覆盖主模型、压缩和 scoped Skill。共享纯 gate 下沉 nofy-auth，shell 原路径重导出，旧 token/provider 管理与恢复入口保留。
- 显式 SamplerAuthRecovery 安装到固定连接，再由 SamplerConnection/model 工厂绑定；纯构建和 request_bound 不访问凭据。session 模式复用原 session/BYOK/first-party gate，并限受信 HTTPS bearer 目标；provider 模式复用 AuthCredentialProvider 的原刷新/重 mint 契约。401 开启失败至多恢复一次，403、本地配置错误和已经流式返回的失败不重放；等待有超时与取消，并发 401 共享已轮换凭据。
- 真实 wire 测试发现旧 SamplingErrorInfo 会丢弃 Auth 的 HTTP 401 状态。SDK 仅在原 raw HTTP opening 的 auth_rejected 边界恢复其精确 401，保留其他 shared 事件/配置 Auth 的原状态；不以一般 auth 字符串判断 401。测试起初因此无法到达刷新回调，已修正并增加 rendezvous 超时及提前失败诊断。
- 307 实测可以离开配置地址。补充 SamplingClient.new 影响 HIGH/24（21 direct），编辑前已报告；保留原 new 默认路径，增加 new_pinned 与独立无 redirect 的 H2/H1 pools，SDK 使用固定传输，mTLS 沿用既有固定身份客户端。其他 transport retry 仍由原各自所有者持有；没有把隐藏 HTTP 重试叠在模型请求下。
- 真实成功请求数记录 model_http_attempts，bound 包含 native repair 最大次数再加至多 1 次 auth。首次 401 无 usage 时，安装可信 token 上界则保守计入 reserved_upper_bound；没有上界标记 unknown，硬 token 预算仍在 IO 前拒绝。未达到可预留的 auth 容量时，凭据读取和 HTTP 均不发生。
- `/private/tmp/nofy-closure-c7d1-sampler-final-tests.log` 229 项通过（包含 9 项新增认证/边界/预算测试）；原 provider/middleware 7 项与旧共享传输/kill-switch/请求头 5 项通过。第一轮测试错误地把 chat fixture 的输出 usage 当固定 5，已依据实际 2+1 token 修正；2 秒启动 rendezvous 在全 lib 首次 TLS 构建下过短，改为有界 10 秒并明确报告提前结束，生产刷新 timeout 不因此放宽。
- 原宿主 auth 范围首次 397 项通过、2 项原 ignored，1 项旧夹具失败；单独复现仍失败，原因是默认 catalog 模型支持 session-only，而测试假定支持 API key。补充该测试 impact LOW/0，改为显式 both/session-only/hidden 3 种 server metadata，不改 resolve_model_list/visible_for_auth 生产算法。最终 `/private/tmp/nofy-closure-c7d1-original-auth-final.log` 398 项通过、2 项原 ignored；含原 session/BYOK gate truth table、401/403、preflight、真实 provider 和子 Agent 认证回归。
- `/private/tmp/nofy-closure-c7d1-consumer/result.json` 仓库外消费通过，最小 normal 依赖仍 186。为防止磁盘不足，仅清理已无编译器使用的 nofy-shell 增量缓存及旧 runtime 增量缓存；保留源码、依赖产物、CLI 基线和所有验证日志。
- C7d2 接续：已结算的模型失败仍保留 pending operation，需通过显式、可持久化的用户 retry/新输入契约解除已知失败；不能把未知模型 intent 或原始工具副作用自动清掉。401 刷新成功的正常路径已在同一操作内闭合，刷新失败后的人工继续仍须在 mailbox/control 阶段完成。

- C7d1 封账测试：Sampler 229 + 原认证 provider/middleware 7 + 旧 wire 集成 5 + 原宿主 auth 398 = 639 项通过（另 2 项原 ignored）。固定传输改动保留原构造接口与默认分支；默认内核依赖仍 186，仓库外消费通过。显式失败恢复已在下述 C7d2a 验收；持久 mailbox/control 仍待 C7d2b，不以自动 401 恢复替代它们。
- C9 预留审计：公开配置前必须复现并封堵自定义 HTTP/process Tool 冒用原生工具名导致 permission classifier 按名字误判的路径；选择真实 provenance 或不可由客户端绕过的名称保留规则，不把原生能力类型当作客户端可声明的授权。资源新增/发布也需保留运行所用的冻结 resource-catalog/factory revision，不能重建全局 factory 后让不相关资源的新增破坏旧 snapshot 恢复。

### C7d2a：显式模型失败恢复（已通过）

- 阶段 upstream impact：sample_model LOW/1（model_step）；run/run_inner/execute_leased LOW/0；prepare_context LOW/2；hook_operation MEDIUM/9 直接入口，涉及主模型、工具、上下文、Hook 与 recipe。源码补齐图漏掉的原压缩 RuntimeSampler 调用；新增缺陷补分析 finish_hook_outcome LOW/0。低图风险不代替源码核对。
- ModelRetryTicket 精确绑定 thread/run、逻辑模型操作、压缩 scope、请求指纹和失败 generation；只由已结算的终态模型失败产生。ModelRetryCommand 有独立、持久的幂等 ID；旧票据、新 ID 重放旧票据、改写 ID 对应参数均拒绝。未知 dispatched intent、缓存成功、工具副作用不能借此重试。
- 私有 ModelRecovery 使用同一 Checkpointer 的独立 CAS journal；经 supervisor 运行时同样受根租约 fence。注册绑定后由每个 Agent 重装，子运行不继承父授权。journal 上限 8192 操作/命令、4 MiB；不淘汰恢复身份或清空原账本。
- generation 0 保留原预算操作编码；人工重试产生新的操作，仍先预留完整调用/令牌上界并受同一绝对 deadline 与父子预算约束。普通 resume 只重放失败；凭据自动变新本身不构成人工重试授权。成功/已授权指令重放均不额外发送请求。
- 主模型和原 FullReplace/TailKeep 压缩都接共享边界；压缩已成功的前置模型调用重放结果，仅失败调用获新 generation。保留原 context revisions 检查；上下文发生变化时不会借重试恢复旧内容。主检查点与授权/结果 journal 之间丢失提交时，恢复同步持久 control_sequence，使新产生的 Hook 事件与旧事实区分；已排队事实保持原身份。
- 新故障测试实际复现：对未完成 turn 的无效新输入，原 finish_hook_outcome 会把预检错误写入已完成 terminal Hook 的相同事件 ID，污染后续恢复。修复为只有进入驱动后的失败触发 turn 结束 Hook；预检仍有本次 invocation 的 Failed 运行事件。旧真实模型错误/取消 Hook 回归保留。
- 验收 `/private/tmp/nofy-closure-c7d2a-core-tests.log`：124 项通过，含新增 7 项重试/预算/未知请求/检查点故障/SQLite 真实进程退出重启。Sampler `/private/tmp/nofy-closure-c7d2a-sampler-final.log` 230 项通过，新增真实 HTTP401 刷新失败→显式重试→重放指令场景；失败操作按保守上界收费，下一次调用仍需完整可预留余额。原 compaction `/private/tmp/nofy-closure-c7d2a-compaction-tests.log` 5 项通过（两种模式实际运行）。合计 359 项，无 ignored。原 shell/Agent 构建、仓库外消费和 186 项默认依赖边界通过。
- 首轮编译测试少 `.into()` 已修复；首轮真实恢复失败保留在 second.log（Hook 预检污染复现）；Sampler 首轮预算只剩 1 次、但新请求可信上界为 2 次，按设计拒绝，将 fixture 调为可预留 2 次后通过，未放松生产准入。
- 下一阶段 C7d2b：durable mailbox、多轮/插话/取消、显式用户 Skill 命令；本节不宣称这些已实现。

### C7d2b1：持久 FIFO、插话与取消（已通过）

- 阶段入口 impact：Agent.advance、RunSupervisor.execute_leased/begin_run、SqliteStore.open_with_clock、ContextBinding.bind 均 LOW/0；DurableTurnReceipt.committed LOW/1 直接入口、2 条相关流程；新 Input 事件补分析 RunEvent LOW/0。复用 C7d2a 的共享模型/上下文/Hook 分析，源码补齐 trait 调用和 child context 继承。
- 新 mailbox 公共契约 MailEnvelope/MailInput/InputAddress、MailboxSender/InputInbox 与 MailboxBinding；原 nofy-interjection-core PendingInterjection/format_interjection 直接复用，默认依赖 186→187，仅增加中立 core crate。新建 SQLite schema1 additive mailbox/cancel 表，不改根 Cargo.toml。输入分 Interject/NextTurn/Tool，ID+完整 payload 指纹不可改写；目前 Interject/Cancel 已执行闭环，NextTurn/Tool 仅有存储与队列屏障，执行器在下节完成。
- SQLite producer 校验真实 root/child run、agent/thread 身份、active thread owner；未知/替换的收件人拒绝。重复已存在 ID 可查询旧回执，不能向已替换运行新增输入。单 envelope ≤1 MiB，text ≤64 KiB、图片 ≤8；每收件人至多 8192 条、1024 pending/claimed 和 8 MiB 待投递内容；取消 journal ≤8192。
- 普通 SqliteStore 只有 producer，consumer 来自 GuardedCheckpointer，claim/ack/cancel read/ack 同根 lease fence。严格队首判断 kind，NextTurn 保护后续插话；非终态当前运行不能 claim NextTurn。Supervisor 强制安装受保护 consumer，子 Agent 在自己的精确地址读取，同根 fence 不会因 bindings 清空而消失。
- driver 在完整 Tool batch 结果配对以后、下一模型/结束以前注入；已有 PendingModel、prepared model 或 context plan 时等待。claim→checkpoint pending→user_input Hook gate→消息/来源/输入 ID 原子 CAS→queue ack；丢失任意检查点或 ack 都不重复追加。Deny/不支持图片显式拒收，Pause 使用原 Hook journal 对账；不是新 turn，不重复触发 turn_start。已交付原文进入 capture 来源映射；记忆回执用原文替换模型可见包装，压缩同步重映射来源索引。每轮原文 capture ≤2 MiB。
- 取消为独立持久控制，100ms poll 打断阻塞模型/工具；不被 NextTurn 队首挡住。RunInput::resume_after_cancel(cursor) 只确认客户端已观察的游标；新取消不被旧确认吞掉，未知/future cursor 拒绝。控制存储读取失败停止 IO 并报告 Checkpoint 失败，不伪装用户取消。
- 新故障复现：压缩模型的已结算 Stopped/cancelled 账本在普通恢复时永久重放取消（cancel-compact-repro.log）。仅给已知取消的 context scope 记录恢复票据，显式确认对应取消 cursor 后才获得新 generation；未知 intent/工具副作用仍不会重发，主模型维持原取消后新 sequence 路径。
- 验收 `/private/tmp/nofy-closure-c7d2b-core-final.log` 135 项（新增 mailbox 11），Sampler 230、原压缩 5、真实 Agent Prompt/Skill/Source/Todo/Goal 23、自研 MemoryService 8，合计 401 项。旧宿主构建、仓库外消费与 187 项依赖边界通过。专项含两条 Tool 结果后多条插话 FIFO、原文记忆回执、不支持图片拒收、租约替换、投递 CAS/ack 故障、真实进程在 transcript commit 后 exit(93) 再恢复、取消游标与压缩取消恢复。
- 首轮测试编译错误为未导入 RunEvent、测试误导入同名 BudgetStore.claim 和非 Clone CompiledAgent；已修复测试装配，未改生产 trait 名称。native shell 已结束的 2.7 GiB 增量编译缓存因磁盘压力清理，所有二进制/依赖产物/CLI 基线/日志保留。

### C7d2b2：排队轮次与真实用户 Tool/Skill 命令（分阶段完成，见下）

- 不能把 NextTurn 仅存储宣称执行完成。下一阶段带前置的 durable submission/job 入口（原 C9 的运行接受原语），固定 snapshot+原始输入+run/thread+source input ID；先持久接受，再由 worker 获取 thread lease。根 RunRecord 与首个 Agent checkpoint 之间崩溃也必须能判断“尚未注入新输入”或“仅恢复”，避免重复首条输入。发布后的多条 NextTurn 保留提交顺序与各自快照；后来的旧 run 插话不能越界串入新 run，需显式拒收或按用户另发的精确目的地提交。
- 初始输入证明由 supervisor 私有 capability 签发并在首个 checkpoint 存储；单独提交记录不构成已经启动外部 IO。source mailbox ack 必须在首条输入 checkpoint 确认后完成，不能因 active root 已切换就遗失旧地址的 ack；需要以新 job/source/lease 的精确关联校验。
- Tool 命令不能接受用户自定 provider call ID；内核从 input ID 生成稳定调用，记录原始 tool/arguments digest 和来源；走既有 Hook/schema/policy/governance/取消/child control 边界。私有 UserToolInvocation 只装入该 ToolCallContext，不能放入子 RunContext。FrozenSkills 和 ScopedSkills 仅在精确证明匹配时 available(user_initiated=true)；模型伪造布尔参数、复用工具名/ID、Hook 改写参数都不能获得 user-only 权限。暂停保留来源，结果提交后消费来源；命令返回值与 synthetic assistant tool request 不作为用户记忆采集。
- 增补 upstream impact 后才改 RunSupervisor/job 接受、Agent 首次输入、tool 拒绝/完成及真实 Skill dispatch。C8 的 Goal 编排和 C9 管理 API/C10 仍未完成。

- C7d2b1 索引首次因磁盘不足失败（COPY lbug.wal / No space left，日志保留）；确认无 cargo/rustc 活跃后清理 target/debug/incremental 中 837 个旧变体，每个 crate 保留最近 2 个，释放后可用约 29 GiB。所有 target/deps、可执行基线与验收日志保留。随后重跑 force/index-only，不使用失败中间图做后续 impact。

### C7d2b2a：真实用户 Tool/Skill 命令（已通过）

- 入口 upstream impact：drain_inputs、Agent.tool、RunSupervisor.reconcile_child、FrozenSkills.call/ScopedSkills.call LOW/0；reject_hook_tool LOW/3 直接入口、2 条流程（Tool/Hook/recipe）；call_context LOW/1。复用前阶段共享模型、上下文、Hook 和 supervisor 范围；新增 public UserToolInvocation 及 checkpoint 来源契约均在这些入口落实。Rust 漏边仍以源码补齐。
- MailInput::Tool 只接受空的调用 ID，由内核从 input sequence+payload digest 生成稳定 host-input 调用；真实入队来源、原工具和参数保存在 InputProgress.command。创建合成 Assistant ToolCall 后仍走原 before_tool/schema/policy/governance/取消/child-control 边界。工具预算操作采用独立 user-tool 来源命名空间，模型复用 call ID 不能混入该预算操作。Hook 操作也带来源，原队列事实保留既定 ID；before_tool.payload.input_source 可供订阅者精确匹配。
- UserToolInvocation 只有私有构造，绑定 root/run/thread、精确 call ID/tool/arguments，只有当前工具的 ToolCallContext 持有。RunContext/新调用上下文主动去掉旧凭据；子 Agent 不继承它。Hook 修改 name/args 后不获得原授权；模型传 user_initiated 布尔值或复用 ID 也无授权。
- FrozenSkills（加载型）和 ScopedSkills（执行型）仅在凭据匹配时 available(user_initiated=true)，enabled/user_invocable/conditional 规则仍保留。作用域模型/effort/工具、父级强制策略和审批不被用户来源扩大。tool.skills 工厂 revision 升到 3，context.skills 保持 2；新实现不能静默冒充旧工厂 revision。C9 仍要闭合历史实现/资源 catalog 版本装配，不把新 registry 能恢复旧实现快照作为已经实现。
- Tool 正常结果与拒绝/validation/policy/Hook 结果均在同一结果 CAS 中消费来源、记录投递回执；原 C2 显式对账也消费已配对命令来源。未知/暂停的子运行保持来源，不向模型塞普通错误假装继续。合成 Assistant 请求与其 Tool 结果排除记忆 capture；真正模型生成的 Tool 操作照原规则保留，最终记忆测试实际核对授权=true 的用户工具结果被排除、模型伪造调用的授权=false 结果按原轨迹保留。
- 验收 `/private/tmp/nofy-closure-c7d2b2a-core-all-final.log` 139（sqlite/pack/workflow 全组合）；真实 Agent 全量 `/private/tmp/nofy-closure-c7d2b2a-agent-all.log` 607；Sampler 230、原 compaction 5、自研 memory 8，合计 989 项。命令 capture 补充断言 `/private/tmp/nofy-closure-c7d2b2a-command-capture-final.log` 同一测试通过，不重复计数。原宿主构建、仓库外消费与 187 默认依赖通过。
- 核心测试实际完成：受治理的用户 Tool 与模型复用相同 ID/伪造 user_initiated，观察到 [true,false] 且 model_calls=3/tool_calls=2；原权限审批精确匹配，未审批无执行，重复输入只返回原回执。真实 Skill 测试包括加载/作用域两型 user-only、模型拒绝、Hook 改参不授权、child write 被拒且 read 仅一次、root Skill 与 child Read 两次暂停后继续同一运行。
- 测试装配修复：load-only 不应提供 execution 依赖；有 Hook 时初始 GovernancePaused 模型留有冻结 prepared request，不能用它模拟可注入 safe point，改为真实模型在途提交→完成后安全投递。可选 Rhai 导入 SmartString 的 Add 实现使两项诊断 String+Cow 产生类型歧义，改为 format!，生产逻辑不变。
- C7d2b2b 仍待：接受/执行冻结配置的多条 NextTurn、worker 在根运行记录与首条输入检查点之间退出的恢复、持久 job 接受与队列头控制。C8–C10 仍待，不宣称整体完成。

### 新增审计候选：治理下的子运行显式对账

- 源码发现 RunSupervisor.reconcile_child 仍是 C2 的直接 checkpoint 追加，C7b 后子工具可能还有 claimed budget receipt；当前路径没有实际 child dispatcher 的 fingerprint/恢复元数据，也没有进入 child 的 governance 控制。尚须先复现“未知子工具→显式对账→有限并发预算下继续”矩阵，不能按源码推测直接宣布故障或修复。若复现，则补为 C7d2c，先做入口 impact，再通过持久 operator receipt 交给实际 child Agent 在安装其治理之后消费，禁止直接删账本或假清 in-flight。与 C8 的已关闭 Failed child 显式重试分开验收。

### C7d2c：子运行治理对账（已通过）

- 新审计候选已实际复现：unknown child primitive 占用 active_operations=1，旧 reconcile_child 直接追加检查点后没有释放账本；max_concurrent_operations=1 下恢复返回 BudgetExceeded（`/private/tmp/nofy-closure-c7d2c-repro.log`）。
- 阶段 upstream impact：reconcile_child、ChildAgent.call、reconcile_tool、TreeObserver.started、Agent.run_inner、SqliteStore.open_with_clock 均 LOW/0，补充 ChildReconciliation 公共 DTO LOW/0；按源码覆盖实际 child policy/schema/dispatcher/预算/观察链，复用前阶段 RunHost 与 Hook 分析。
- reconcile_child 保留原入口，改为只持久接受不可改写的 operator receipt，不改 transcript、不删除 in_flight、不释放未知预算。Root/child/composition/call/队首/模型轮次和根租约均校验；新 schema1 additive receipt 表，每 root ≤8192 条、单 receipt ≤1 MiB。新增可选 model_sequence 显式选择 child 操作；旧 JSON 可省略，provider call ID 重用时要求显式轮次，不能把旧请求重放到新操作。
- TreeObserver 在真实 child 恢复时按精确 epoch/call/composition 投递私有 ReconciliationInput；Agent 在 bindings 后保护其原作用域，移除不属于当前 child 的继承来源。仅当前未知 ToolCallContext 收到 ToolReconciliation，既有 Hook/schema/policy 仍先执行。不可把 resumable controller 当作 primitive 对账，运行时明确拒绝该 receipt 并暂停；更深的 primitive 仍走原控制轨。
- 实际 dispatch_tool 使用已安装 dispatcher 的恢复身份和工具版本结算原预算操作，再沿正常 Tool result/Hook/recipe/来源消费 CAS 继续。无治理的旧 child 同样沿实际边界消费 operator 结果，不重新执行外部工具。账本已有回执时优先重放真实回执，operator 不能覆盖成功或失败；结果 CAS 丢失时重复恢复只消耗已缓存结果。
- 验收 `/private/tmp/nofy-closure-c7d2c-core-all-final.log` 141（sqlite/pack/workflow），真实 scoped Skill 13，合计154。原宿主最终构建、仓库外消费与默认依赖187通过。专项同时核对：接收 receipt 前后 child checkpoint 字节等价、预算占用仍为1；重复同指令幂等、改结果/错 epoch 拒绝；恢复后 active_operations/active_children=0、tool_calls=2 且未知 primitive 只进入过一次。新增 cached-success 优先单元测试直接经过真实预算边界，operator 的矛盾报告没有改写已缓存成功。原 C2 的真实子进程退出/对账/恢复测试保持通过。
- 该阶段只修复“接受后交实际 child 消费”的治理闭环；已关闭 Failed child 的明确重新尝试仍属于 C8 controller 恢复，不借对账 API 重新打开已完成组。下一步回到 C7d2b2b 的持久 queued turn/job 接受，再进入 C8/C9/C10。

### C7d2b2b 阶段设计（已实施，验收见下）

- 把 C9 的 durable submit/job 最小原语前置到此阶段，不能在 HTTP 收到请求后尚未持久接收就宣称已接受。拟新增 queued job 表与 JobSubmission：run/thread、冻结 CompilationSnapshot、输入与 expected composition、可选 source mailbox pointer（address/input ID/sequence/digest），全部不可改写且有幂等 ID/容量限制。
- Mailbox NextTurn 在接受事务内同时建立 job，以 job sequence 保留同 thread 的多条新轮次顺序；不只在 execute_next 时临时生成一个任务，否则切换 active root 后会遗失后续仍绑定旧 root 的 queued turns。Interject/Tool 始终精确指向原 run，不自动串入新的 root；旧 root 结束后无法再送达的这些输入应显式 Rejected，NextTurn 任务保留。
- worker 获取 thread lease，最早未关闭 job 才可执行。旧入口 execute 仍保留；job 路径通过私有 initial-input binding/证明记入首次输入 checkpoint，恢复判定以同 job/run/digest 的 checkpoint 标记为准。根 RunRecord 已创建但首条输入未提交时，须允许同 job 的有界初始化重入，不允许普通调用绕过 duplicate run ID 检查。
- 第一条输入 checkpoint 提交以后才确认 source mailbox。确认时 old source 地址的 active root 可能已切换，须校验 new job/source/根 lease 和 checkpoint 证明，不能调用普通 recipient.active 检查而永久卡住旧 source ack。该确认可在 Agent 首个 commit 后、任何模型/工具 IO 之前执行；崩溃后仅补确认，不能重复首条输入。
- Job 状态与 finish_run 原子同步。Paused、未知 pending tool/model/context/Hook 等不能被后续新 job 偷跳过；已结束且没有未完成边界的取消/预算结果可按明确结束语义关闭该 job。显式恢复原 job 应继续原预算；新 job 是用户接受的新 root，不是模型重置原额度。queued cancellation 和执行中 cancellation 要分开。
- 现有 runtime thread 绑定 composition；本阶段 NextTurn 固定当前同一 composition 的 snapshot，跨 profile/config 版本切换不得偷偷迁移旧 checkpoint。服务 StartRun 默认新 thread 可使用新配置，旧运行保持原快照；如要同会话历史跨 composition，应另加明确的 history import/迁移契约，不能放松 resume 身份校验。
- 为 C8 Workflow 根执行保留版本化 submission envelope 扩展；此阶段先 Agent，后续不要靠虚构模型调用假装实现 workflow scheduler。下一步先补 upstream impact（submit/execute/begin_run/finish_run、Agent 首输入、mailbox submit/ack 和 Snapshot.restore）再编码。


### C7d2b2b：持久任务与 queued turn（阶段通过）

- upstream impact 已覆盖 execute/execute_leased/begin_run/finish_run/run_inner、mailbox submit/ack、Snapshot.restore，补充 Agent.run/governance.prepare，均 LOW/0；Rust 调用图漏边，另按源码检查旧 execute、首输入 CAS、治理与取消的实际调用链。
- 新 supervisor::jobs 提供 JobSubmission/JobRecord/JobStatus、submit/run_next/execute_submitted/cancel_submitted。接受先持久化固定 run/thread/snapshot/composition/input，随后 worker 获取原 thread lease；同 ID 同内容幂等、改内容拒绝。schema1 additive jobs 表，单输入 ≤2 MiB、每 thread ≤1024 待处理/32 MiB。
- Mailbox NextTurn 接受事务同时写 job，保留多条轮次 FIFO；切换 active root 后不遗失原地址下的后续 NextTurn。Interject/Tool 仍指向精确原运行，过期输入显式 Rejected，不自动串入下一轮。现有 thread 固定同一 composition/snapshot，新配置使用新 thread，未隐式迁移历史。
- 私有 InitialInputProof 与 root-fenced receipt 在首输入 checkpoint 后、任何模型/工具 IO 前确认 source/job。根 RunRecord 创建后首 CP 前退出可由同一 job 重入初始化；首 CP 后确认事务失败只补确认，不重复首条消息。旧 execute 入口保留，但不能绕过 job worker；初始化后的原 job 可显式恢复。
- finish_run 原子同步任务状态；Paused 与 pending model/tool/context/Hook 等保持 Waiting，后续 job 不能越过。修复 begin_run 旧逻辑只检查 pending tool 而允许新 root 抢走失败模型运行所属 thread 的问题。取消 watcher 提前到治理与 prompt/tool catalog 初始化之前，输入未提交时即使额度已过期也能持久取消，不启动模型。
- cancel_submitted 只取消尚未创建运行记录的 queued job；执行中取消走已有 mailbox 控制。已初始化且存在未完成边界的停止/预算失败仍保守 Waiting，C9 必须提供明确 stop/abandon 控制并保留未知副作用证据；不能靠清 pending 字段自动推进队列。
- 集中回归：/private/tmp/nofy-closure-c7d2b2b-core-all.log 153（sqlite/pack/workflow）、agent-all.log 607、sampler-tests.log 230、memory-tests.log 8、compaction-tests.log 5，合计1003，全部通过。host-check.log 原宿主构建通过；consumer/result.json 仓库外消费通过；默认依赖187，diff --check 通过。
- 12 项 job 专项覆盖 FIFO、冻结版本漂移、原运行所有权、错误输入、queued/初始化期间取消、过期预算下取消、暂停 gate、首 CP 后确认失败，以及真实子进程在根记录后首 CP 前 exit(93) 的新进程恢复。模型调用次数和输入消息次数均校验，无重复执行。
- C8 WorkflowSpec/双向嵌套/Goal 编排、C9 管理接口与停止控制、C10 原始预设最终矩阵继续施工，整体未完成。


### C8a：共享无模型 Tool 宿主（阶段通过）

- upstream impact：compile_agent LOW/1（compile_document）；Agent/run_inner/advance/RunState LOW/0，按源码核对 AgentBuilder、原模型调用和 Hook 适配；Dag.dispatch_batch LOW/2（原测试/建议编排），保留原调度实现。C7d2b2b 已刷新索引112111/266813，累计暂存范围3621符号/31流程/204文件 CRITICAL，已报告；此阶段未提交。
- 新 tool_program 的 ToolRuntimeDefinition/compile_tools/ToolCompilationSnapshot/ToolRuntime，无 Model 或 Prompt 配置依赖。内部 Agent 明确区分有模型与无模型程序，共用 AgentHost.tool、policy/schema、Hook、governance、cancel、checkpoint 和 primitive reconciliation；没有虚构 completion，不计模型或模型 step 配额。原 AgentBuilder 的模型必填与采样路径保留。
- 编译固定完整模块快照与 required policy/governance floor；共享 restore_modules 只抽取原 CompilationSnapshot.restore 的验证，旧方法入口和快照格式不变。每次 Tool 程序固定 call 身份/参数到 composition；恢复不能换调用、参数、run 或历史工厂版本。节点不继承父 mailbox 收件人或用户来源凭据，仍继承取消/权限 floor/总预算。
- 六项真实边界测试通过：model_calls=0/steps=0 下 Tool 一次；恢复重放不重复；宿主审批暂停/恢复；Hook 改写后实际 schema 拒绝；参数/取消拒绝；结果 checkpoint 丢失后重放真实预算回执；worker task 丢失后未知 primitive 暂停，显式对账才继续且不重发。完整 core 回归157项通过后新增后两项专项6项全通过，共159项不同检查；日志 /private/tmp/nofy-closure-c8a-{core,tool-final}.log。
- 原宿主构建 c8a-host-check.log 通过，仓库外 c8a-consumer/result.json 通过；默认依赖187，diff --check 通过。这里只完成 Workflow Tool 节点所需公共执行原语；WorkflowSpec 图编译/调度、Goal 控制器、管理接口与最终预设验收继续实施。


### C8b：WorkflowSpec、共享 DAG 与双向嵌套（本段通过，C8 继续）

- upstream impact：compile_document/compile_tools/workflow.run LOW/0，Dag.dispatch_batch LOW/2、Dag.build LOW/5；补充 PromptVariables LOW/0、HookBus.emit LOW/9（工具/模型调用链）、ChildAgent.call 与 Agent.run LOW/0。GitNexus 不索引 fixture，main impact 明确 Target not found，另按源码核对仓库外消费入口及脚本。原 DAG/Rhai 算法和入口保留，仅 workflow feature 增加可选 nofy-orchestra；默认依赖187不变。
- 新 workflow::{spec,compile,graph} 提供 WorkflowDocument/WorkflowSpec、冻结编译/恢复、版本化节点/输入输出 schema、字面量/输入/祖先节点/对象/数组绑定。纯图检查先于任何工厂构造；拒绝环、悬空边、跨祖先读取、明显端口类型/闭合字段错误、坏 JSON pointer。实际节点输入/输出继续验证完整 JSON Schema，动态工具目录与未知 schema 不冒充静态证明。
- 复用真实 Dag.build/dispatch_batch；Tool、Agent、Prompt、transform、condition、join（成功或全部结束）、human、subworkflow、有限 loop 已执行。限制1024总节点/128 programs/16层嵌套、parallelism1..32、循环1..128、重试最多16、展开最多8192次调度；输入/单结果1 MiB、图检查点8 MiB、编译快照16 MiB。scheduler step 进入原共享预算；纯工具图模型额度0可执行，实际 controller Tool/子 Agent/primitive 均按对应边界计费。
- 新 Frozen Workflow 既可 root invoke，也可 as_tool 被 Agent 调用；as_tool 安装 workflow 自己的 model-free host，保留其绑定/治理并把其配置 policy 作为内部不可移除 floor，不能只继承调用者约束。Agent 节点经原 Agent-as-Tool、同根 checkpointer/lease/child group/审批/控制轨执行，没有另造模型循环。PromptVariables 下沉中立 prompt 契约，原 nofy-agent 路径 reexport，原模板行为不变。
- 图按稳定节点/attempt/输入身份保留 checkpoint、并行 peer 结果与 Hook fact outbox；known failure 仅在显式配置的有界 on_error 重试内开新 attempt，未知 primitive 不进入错误重试。失败耗尽保存 halted，普通 resume 不会把失败节点当成功略过。human 响应绑定 workflow digest/version/thread/run/node/原请求，改决定或复用不同内容的 command ID 拒绝。
- 实际发现并修复 infrastructure error 的分类问题：ChildControl 新私有 Checkpoint 通道保留原错误，检查点错误不结算为永久 Failed child group；已知模型/工具失败仍保留原闭合回执。图结果 CAS 丢失后，通过 Agent→workflow Tool 恢复，实际工具只执行一次，父 Agent 继续完成。此处不等于已完成关闭 Failed controller 的显式重试。
- Tool 节点自身不消费父 mailbox，但保留受保护 root backend 给更深 sampled Agent，后者绑定运行树里的自身收件地址。真实 SQLite 测试经 root Agent→workflow host→node Tool host→child Agent 定向提交持久取消，父运行在3秒界限内取消，未借根取消掩盖子取消传递。
- 验收：/private/tmp/nofy-closure-c8b-core-final.log 173 项全过；c8b-agent-all.log 原 Agent607项全过，合计780。c8b-host-final.log 原宿主构建通过。c8b-consumer-final/result.json 在真实仓库外通过新增纯 JSON workflow 编译/冻结恢复/Tool→join/完成后恢复（workflow=true）；/dev/stdout 的 protoc 沙箱权限问题经已授权的提升重跑通过，非代码失败。
- workflow_graph 的14项含：配置检索→两个真实 Agent 节点同时抵达 barrier→join；Agent→workflow Tool→子 Agent→实际审批；人工决定的幂等/冲突；有限循环/结果缓存；step/model硬额度；Hook workflow/node 实际生产者且恢复不重复；真实进程在 human wait 后 exit(97)、新进程恢复 SQLite/frozen snapshot 并只执行剩余工具一次。工件保留在 /private/tmp/nofy-workflow-restart-*。
- 后续 C8c 必须完成：已关闭 Failed child/controller 的显式重试权限及各级 Hook control epoch；嵌套取消的定点显式确认；workflow/node 统一事件/运行树（包括纯控制/子 workflow）与 root submission envelope；Hook handler 的 workflow 可恢复 journal；Rhai per-call 配置/资源/日志映射；canonical Goal 的 planner/work/verifier/commands。之后 C9/C10。不得把本段图演示通过称为全部模块化完成。


### C8c1：可恢复 workflow Hook 与发布模块工厂（阶段通过）

- upstream impact：HookHandler LOW/1（ExecutorHandler）、HookBus.new LOW/8、emit LOW/9（原工具/模型 Hook 调用链）、HookJournal.begin LOW/0；按实际 source journal、Agent/child/graph 控制轨补充检查。C8b 暂存后3967符号/31流程/216文件，累计CRITICAL已报告，未提交。
- HookHandler 新增默认 None 的 recovery_identity，只有原生、固定恢复身份的控制器能声明可恢复。普通 HTTP/进程/原 dispatcher handler 保持原 uncertain/reconcile 规则；没有 controller 时 HookBus identity 字节格式保持原样。Saved.controller 是 additive/serde default，旧 journal 仍可读。
- workflow handler 通过同根 checkpointer、真实 ToolRuntime/HostedGraph/child group 跑冻结工作流；原权限/预算/取消/运行树 backend 保留。源 HookJournal intent 未确认或内部暂停时只重入这个 controller，已完成 HookDecision 仍缓存；内部 primitive 继续按自己的 intent/receipt 处理，不能因为外层可恢复就重做未知副作用。controller 超时转持久可恢复暂停，failure=open 也不能吞控制轨；普通 handler timeout 语义不变。
- WorkflowLibrary 安装1..128个已编译冻结资源，新增纯配置 tool.workflow（ToolPack）和 hook.workflow（HookHandler）工厂；JSON 选择已发布 resource、工具名与描述，不上传代码或 live handle。Hook 的最终图输出实际解析为 HookDecision 并经过原事件决策能力校验。library revision 固定整个资源集；新增资源的历史 catalog/工厂版本装配仍须 C9 收口，不能宣称旧快照可用新 catalog 静默恢复。
- 首输入恢复使用 controller host 的首 CP，覆盖“host 已提交、graph 首 CP 未写入”的窗口，不能只看图是否存在。实际故障测试分别丢 HookDecision commit 和 graph 首次 commit，父 Agent 恢复后模型一次、工具一次、用户消息一次。
- /private/tmp/nofy-closure-c8c1-core.log 177、executors.log 真 HTTP/进程10、native-hooks.log 原 dispatcher2，合计189全过；host.log 原宿主构建通过。consumer/result.json 仓库外通过 workflow_module=true 和 workflow_hook=true：客户端经工厂配置发布 workflow Tool，并用 before_model workflow Hook 继续原 Agent；默认依赖187，diff --check通过。
- 四项专项含真实人工等待后继续父 Agent、两个 commit 故障窗口、发布 Tool 工厂执行，以及已有 primitive 开始后 controller timeout：首次暂停 kind=hook_controller_timeout，恢复进入实际图并因 unknown primitive 再暂停，primitive 只进入过一次，模型未启动。该边界不能替代已关闭 Failed controller 的显式重试；其授权、各级控制 epoch、嵌套取消确认、完整控制节点事件/树/root job envelope、Rhai映射及 Goal 编排仍待下一阶段。


### C8c1a：会话通知治理补口（阶段通过）

- 接线复核发现 notify_session 只安装 Hook/floor，未进入 Agent.governance；upstream impact LOW/0，context 查到原 session_signals 测试调用。此入口是显式宿主会话信号，未改原展示层或通知协议。
- 在任何 handler IO 前保留 bindings 前的 inherited BudgetControl/SupervisedBudgetBackend/RunLineage，恢复不可移除 floor，并安装同一个 runtime_prepare/绝对 deadline guard。普通 Agent 没有 governance 时行为保持；deadline 到期准确返回 BudgetExceeded，用户取消仍是 Cancelled。
- /private/tmp/nofy-closure-c8c1a-final.log 18项通过（session_governance5、原 hook_agent9、workflow_hooks4）：自身工具额度、已完成结果缓存、failure=open 不吞超额、子通知 binding 清空不能移除父总额度、host policy floor、用户取消和 deadline 阻断真实副作用。原宿主 host.log 构建通过，diff --check/default187通过。
- 待 C8c2 的共同控制契约：完整 workflow/纯控制节点运行树与稳定事件、root ProgramSubmission/快照封装、已知 Failed controller 显式重新尝试和 control epoch、嵌套取消确认；notify_session 的管理宿主接入必须选择原根 lease-fenced backend，不能在 API 中绕开此边界。Rhai映射、Goal和C9/C10仍未完成。


### C8c2a：不可移除根服务与稳定 workflow 事件（阶段通过）

- 阶段入口 impact：ContextBinding LOW/0、EventSink.record LOW/1、TreeObserver.started LOW/0；扩大事件契约前补充 RunEvent/SqliteStore.open_with_clock/DurableEventSink.record LOW/0、Frame.flush LOW/2（run_graph/execute_node）。复用 Agent.run/notify_session 的已有分析。Rust漏边按实际调用链补充，累计阶段前4038符号/31流程/220文件 CRITICAL已报告。
- 新私有 RunServices 固定 run/thread/cancel，恢复宿主已安装的 EventSink 与 ChildObserver；bindings 仍可在宿主未提供时安装服务，不能替换权威服务或绕开取消。bindings 抛错后也先恢复原身份/事件接收器，失败事实不会冒充其他 run。Agent.run 与 notify_session 共用此保护；原 budget/floor/lineage/mailbox 保护保留。
- 实际 SQLite supervisor＋清空扩展 binding 验证子 Agent 仍记录运行树、绑定精确 mailbox、完成模型；权威事件不能丢。尝试改 run ID 在模型 IO 前拒绝；更换取消 token 无法让已取消运行继续；清空后抛错也向原 owner 的 sink 记录失败。
- 新可选 RunEvent::Workflow 携带 ref、稳定 operation、事实名、node及payload；graph fact outbox 在 Hook/节点 IO 前向 EventSink 投递，同一个稳定键覆盖确认丢失后的重放。EventSink.record_once 默认兼容旧 sink，允许至少一次投递；SQLite supervisor 在 schema1 additive receipt 表内与事件/cursor原子写入，重复相同内容不分配新 cursor，改内容拒绝，根 lease fence 每次校验。
- /private/tmp/nofy-closure-c8c2a-core-final.log 187 项全过；host-final.log 原宿主构建、consumer-final/result.json 仓库外三 Agent/配置/workflow Tool/Hook消费通过；default187和diff --check通过。新增私有 SQLite 单测含 receipt 插入失败整事务回滚、重复/冲突、失效 lease、新连接续写和 cursor 增量；实际图测试在 node_end 后用 SQL trigger 丢图 ack，重开 DB 恢复时原 node_end cursor 不变、工具一次、父模型继续。
- 本段增加统一 workflow 事实事件并保护已有 Agent/Tool 树；纯控制节点/subworkflow 的完整树、root ProgramSubmission、关闭 Failed controller 显式重试/control epoch、嵌套取消确认仍须继续实施。不要将当前 Agent 子记录＋workflow事实流当成完整控制运行树已完成。Rhai全映射、Goal、C9管理与C10原始预设矩阵未完成。


### C8c2b：控制节点/迭代运行树（阶段通过）

- upstream impact：ChildRunRecord/ChildObserver/accept_child_reconciliation/recipient LOW/0，run_graph/execute_node LOW/1；reconcile_child 按旧错误文件查询 Target not found 后改查实际 accept_child_reconciliation 入口。新增 mailbox 范围前补分析，未依赖漏边推断安全。C8c2a暂存4078符号/31流程/222文件，累计CRITICAL已报告。
- ChildRunRecord additive optional kind/checkpoint_key/workflow_ref/node_id，旧 JSON 仍可解码。真实 Agent/Tool 程序按实际执行类型登记；节点控制记录只投影已有图 checkpoint，不引入模型/工具调用。新增私有 control observer 每次都受原根 lease fence，身份、父节点、模块版本与 checkpoint key 不可变。
- 已登记 Prompt/transform/condition/join/human/subworkflow/loop及每次迭代；旧 Agent/Tool 的 run/thread、budget op 与 checkpoint key 均保持。Tool/Agent 的控制 marker 使用独立命名空间，不会占用已有调用身份。恢复补齐已保存节点的投影；状态来自实际图与控制结果，失败/取消/预算有独立状态。
- 普通 Agent mailbox 只接受真正 Agent；新增控制节点/Tool程序不再接受无法消费的输入或定点取消，既有回执查询/同ID重放保留。pure control 不能被当作 primitive 对账；该拒绝发生在根运行转 running 前。真正嵌套 Agent 的 mailbox/取消和 primitive 对账继续保留。
- /private/tmp/nofy-closure-c8c2b-core.log 188全过；host.log 原宿主构建通过；consumer/result.json 仓库外配置/Tool/Hook/三Agent通过；default187/diff检查通过。专项先断在human：记录waiting和固定图key；拒绝向human发mail/cancel/primitive receipt；响应后 condition/human/subworkflow/loop/iteration/join全完成，跳过分支为skipped，所有父记录存在且无自指，完成后恢复的整棵树JSON等价。原 mailbox13、nested control5亦通过。
- 仍待：root ProgramSubmission/通用执行快照、已关闭 Failed controller 的明确重试及统一 control epoch、嵌套取消确认、Rhai全映射、Goal实际编排、C9/C10。控制节点可见不等于上述控制动作已全部实现。


### C8c3a：直接与嵌套 Agent 的显式模型恢复（本段通过，workflow 控制链继续）

- upstream impact 覆盖 execute_leased/run_inner/ChildAgent.call/RunServices，均 LOW/0；Agent.model_retry_ticket LOW/1，实际调用方为 Sampler 认证恢复测试，已定向重跑；child_hook LOW/0。错误回放复核补查 Error LOW/0，没有新增公共 Error variant。Rust 图漏边以实际父子调用链补充。
- 新私有根 ControllerBinding 保存明确命令、控制序号、目标模型票据与已结算失败证明，全部使用原根 lease-fenced CAS。公开 child_model_retry_ticket 只查询目标已知失败；execute 使用原 RunInput::retry_model 接受子票据，验证根/子 thread/run、原 composition、目标 pending model/context、当前每级父调用和已闭合失败证明。旧失败预算回执保留，新尝试另行准入；未知 primitive 不在本入口范围。
- 直接和多层 Agent-as-Tool 链沿原 child checkpoint 接回，成功工具与原模型请求保持；普通 resume 不开启新模型 generation。重试授权提交后、子模型 generation 提交前中断，新进程普通 resume 继续已接受命令。重复 command_id 不新发请求，同 ID 改票据、旧票据新 ID、跨根/线程/指纹/代数伪造拒绝，并恢复原 RunRecord 状态。
- 控制序号贯穿父子 Agent Hook 和 subagent_start/finished，修复旧 child group 缓存错误重放时重复添加 composition 前缀、污染同一 turn_error payload 的问题。失败 group 已结算但根恢复凭据落盘失败时保留 Checkpoint 控制轨，不让父模型把基础设施失败当普通工具结果；先普通恢复结算后才能明确重试。
- /private/tmp/nofy-closure-c8c3a-core.log 196 项全过，child_retry 八项含重复失败/两层父子链、精确累计配额、用尽总额度、Hook 身份、四类错误票据、SQLite trigger 两个提交窗口、新连接恢复及真实子进程 exit(97) 后继续。成功工具累计一次，失败/重试请求字节等价，活跃子槽最终归零。
- 原宿主 c8c3a-host.log 构建、仓库外 c8c3a-consumer/result.json、无默认 feature 构建、默认依赖187和 diff --check通过。Sampler 本地监听初次被沙箱禁止，提升权限后 c8c3a-sampler-final.log 一项认证恢复通过，非实现失败。索引刷新至112696节点/268176边。
- 此段明确只支持 Agent 父子链；workflow/Tool 包装路径暂拒绝，不能用该结果宣称通用 Failed controller 已完成。下一段继续 workflow 恢复适配、各类控制序号和嵌套取消确认，随后 root ProgramSubmission、Rhai完整映射、Goal真实编排与C9/C10。


### C8c3b：workflow 包装层的模型恢复（本段通过，C8 继续）

- 阶段 upstream impact：run_graph LOW/1（execute_node），HostedGraphDispatch.call/authorize_child_retry/ControllerBinding.authorize LOW/0；补查 WorkflowProgress LOW/2（run_graph/execute_node）、record_failure LOW/0，并复用 ChildAgent.call/child_hook 分析。暂存累计4164符号/31流程/227文件 CRITICAL已报告；不因 Rust 漏边省略实际路径验证。
- Supervisor 仍使用原子票据和根 execute 入口，新增对真实 workflow host、节点 Tool 程序、subworkflow、loop/iteration 控制路径的验证。节点引用、父子哈希、图 key/composition、原 attempt、已知 Failed 或传播 Waiting 及剩余 Hook facts 均核对；source Hook 包装暂明确拒绝，普通 primitive 对账入口不变。
- 恢复指令与所有图路径同一个根 journal 原子提交；GraphProgress additive control_epoch/recovering，先投递旧 facts，再只打开原目标节点，同一 attempt/call/checkpoint 保持。完成 peer/迭代缓存不重做，重试期间不抢跑下游；其他耗尽失败继续保留 halted，不能顺带被当作成功。新 facts 加控制序号，旧 event/cursor 不改写。
- 将 Hook 控制序号与 child group 代数分开，兼容旧 journal 的默认映射。只有已闭合失败 group 才开新代数；暂停的 host/祖先继续原 held group，避免泄漏/重复占用活跃子槽。HostedGraph 失败凭据也受原根 fence。复现并修复 Checkpoint 错误提前发 subagent_finished=failed 的问题，该非终态不再污染恢复后的 completed 事件身份。
- /private/tmp/nofy-closure-c8c3b-core.log 200 项全过；child_retry 的12项含8种 direct/subflow/nested-loop/parallel × fail/pause 路径，重复嵌套失败、旧 Hook/fact 回执、精确模型调用量、活跃子槽归零和真实子进程 exit(97)。授权后子模型 generation 提交故障，新进程只补剩余模型，成功 Tool/peer/已完成迭代累计一次。
- c8c3b-host.log 原宿主构建、c8c3b-consumer/result.json 仓库外配置化消费通过；sqlite-only 构建修复一处 cfg 引起的 unused_mut 后无警告；默认依赖187，diff --check通过。此段没有完成源 Hook 控制器重试、嵌套取消确认、root ProgramSubmission、Rhai完整映射、Goal真实编排、C9管理与C10最终预设矩阵。


### C8c3c：workflow Hook 的原源事件模型恢复（本段通过，C8继续）

- upstream impact：HookBus.emit LOW/9，直接 AgentHost.hook/child_hook，传至工具/模型执行的7条相关流程；HookJournal.begin/reconcile、WorkflowHandler.handle LOW/0；复用阶段控制日志与图恢复分析。发现 stop 边界后补查 RunState.has_pending_work LOW/1（jobs.finish）。累计4212符号/31流程/229文件CRITICAL已报告，原始入口与普通 Hook manifest 格式保留。
- 内核实际生产者安装私有的精确 source 标记，workflow handler 保存源事件/订阅/父检查点指纹与 authority locator；源许可和各级图路径一起在根控制日志提交。模型重试仍使用原子票据、同一 root/run/预算与 deadline。源 event ID 保持，目标 controller 使用新的独立 journal 代数；旧失败与成功 handler 回执均不覆写，原 Patch 不重复应用。
- locator 解析当前已接受控制代数，公开 HookJournal.reconcile 不会误改旧失败。新代数 intent 尚未创建时对账拒绝；新 decision 提交失败则可恢复 controller 或对当前 intent 明确对账。父阶段推进后旧 source 许可不再匹配；Graph fact 源绑定自己的 graph checkpoint，不能只依赖未变化的外层 Tool checkpoint。
- Root retry 只支持实际能由 Agent/子调用/图驱动重新抵达的源。独立 session_idle/session_end 或自定义 emitter 不伪装成根循环边界；negative case 验证拒绝其 root retry、保持原 RunRecord、无额外模型/工具IO。通知本身与 governance 能力保持，专用可恢复 notification/event ProgramSubmission 仍待后续。
- 修复模型 complete 而 stop Hook 未结束时 has_pending_work=false 的缺口。源 stop/turn_done Hook 失败的 job 继续 Waiting，模型重试完成后才 Closed；原“没有未配对工具也不能越过暂停任务”的回归现在明确检查无工具 pending 但有 stop 工作。
- 最终 /private/tmp/nofy-closure-c8c3c-core-final2.log 默认并发207全过；child_retry19项包含11种源事件×fail/pause、prior handler/Patch一次、原模型/工具调用数、两层嵌套Hook、重复失败、SQLite intent/decision 两处故障、当前代数对账、后续新轮次不误用旧许可、stop job Waiting/Closed、真实进程exit(97)后只补剩余模型，以及外部通知越权恢复拒绝。初次并发回归遇到测试短时限和待投递事实；恢复测试使用60s配置并按契约先续接旧 facts，生产 timeout 未放宽，专门 timeout/unknown primitive 测试保留。
- c8c3c-native-hooks-final.log 2项原 runner/disable/预算回归，host-final.log 原宿主构建，sqlite-final.log、default.log 无警告构建，consumer-final/result.json 仓库外三Agent/JSONworkflow/Tool/Hook消费及default187/diff检查通过，共209项内核/原Hook检查。
- 待继续：嵌套定点取消确认、通用根 ProgramSubmission/独立通知与配置化事件生产者、通用失败节点明确新 attempt、Rhai选项/资源映射、真实Goal规划/工作/验收、C9版本化catalog/认证管理API/停止控制/工具来源与C10原始预设矩阵。不要把本段模型恢复完成视为所有 controller 控制已经完成。


### C8c4：定点子取消的确认与续接（阶段通过）

- upstream impact：execute_leased/ChildAgent.call/watch_cancel/acknowledge_cancel LOW/0，watch_cancel 起初按不存在的子文件查询后改为实际 mailbox.rs；后补 execute/execute_submitted_leased LOW/0，Agent.run LOW/0。逐段核对真实 invoke/stream、任务 worker、监听器/治理准备及父子控制路径；累计4284符号/31流程/230文件CRITICAL已报告。
- 新公开 RunControlCommand（RetryModel/ResumeChildCancel）与 ChildCancelResumeCommand，统一交给 RunSupervisor.control；原 RunInput、execute、根 resume_after_cancel 不变。原模型恢复和新取消恢复共用 recovery_path/控制序号推进，不复制另一套图驱动。目标地址、版本/父调用、仍未确认的精确游标在根 fence 下验证；真实 Agent 才可接受，已完成对象不能以新命令重新打开。
- 接受命令先落盘，再确认邮箱。确认失败保存可续接的控制意图，普通 resume/新进程补做；新命令不会确认更晚取消，旧命令重放不降低当前游标。模型/取消命令 ID 的冲突拒绝，非法地址/游标/变更内容恢复原 RunRecord；确认先于 runtime_prepare，绝对 deadline 过期也可确认但无后续模型/工具IO。已暂停或因中断投影滞后的未完成子运行可沿原路径处理，未知 primitive 继续待对账。
- 实测发现原 Agent 的 mailbox watcher 在治理创建子 token 之前捕获父 token，定点取消提前打断父调度、丢掉子结算投影。Agent.run 现在先建立本层 token，再绑定/监听；父取消仍向下传，子取消通过控制轨返回。租约续期外移至 invoke_leased，覆盖控制校验、确认和实际 loop；原 job worker 共用同一包装。
- /private/tmp/nofy-closure-c8c4-core-final.log 217全过；child_cancel10项覆盖 direct/两层Agent/workflow/subflow/workflow Hook 五种路径、成功效果与原模型请求保持、活跃子槽归零、原累计配额/截止时间、原调用者token不被子取消、首CP前取消只初始化一次、未知副作用不重发、后发取消隔离、七类非法/冲突、确认事务故障/新连接，以及真实子进程exit(97)后续接。暂停审批时新收到取消可直接确认，真实 required policy floor 仍重新准入。
- c8c4-sampler.log 原认证恢复1项、executors.log 实际HTTP/进程取消/超时/后代清理10项通过；合计228项。host.log 原宿主构建、sqlite.log 无警告、consumer/result.json 仓库外消费、default187/diff检查通过。没有展示层改动。
- 继续 C8d 通用根执行/快照与任务提交、独立通知/配置事件生产者、通用失败节点新attempt、Rhai/Goal；C9/C10未完成。本段不把未知外部效果当作已取消成功，也不修改已成功结果来伪造完成。

### C8d 开工补充：根提交与标识边界（待实施）

- 统一 Agent/Tool/Workflow/Hook通知等 ProgramSubmission/ExecutionSnapshot，保留原 Agent JobSubmission v1 解码与原入口；新 root 服务不能靠虚构 Model/AgentDefinition 运行无模型流程。
- 子 Agent 的旧 child:JSON(parent thread/run/sequence/call) 身份递归增长，会在较深链撞到 mailbox 4 KiB/operation 8 KiB 限制。新执行 envelope 应明确固定有界 hash 身份策略，旧根/检查点继续用旧策略；不能在恢复中换 ID、账本、控制路径或审批对象。需添加深层实际组合及旧根迁移回归，不能只声称 max_depth 可配置。
- 独立通知与配置化自定义事件生产者应有自己的持久驱动/源状态；当前只允许真实可重入内核生产者的根控制许可，保持该拒绝直到对应 Program 实现。通用失败节点的新 attempt 仍须明确权限和费用，不能重发已成功节点或未知 primitive。

### C8d1：有界身份与深层 Agent 调用（阶段通过）

- upstream impact：Settings LOW/5，实际关联 compile_agent/compile_document/compile_workflow 与 Sampler 测试；ToolRuntimeDefinition/RunServices/ChildAgent/recovery_path/DefinitionSettings/AgentBuilder.compile LOW/0，逐段补查真实子派发、冻结配置、根控制路径。深层测试触发栈溢出后补查 Agent.invoke，返回 CRITICAL/10、直接 sequence/workflow.run/run_tool_node/provider_task/Sampler 认证恢复及传递执行流程，已在编辑任务边界前报告。notify_session 补查 LOW/0，同步绑定根方案。
- 新 IdentityScheme::Legacy/HashedV1；Settings/DefinitionSettings/ToolRuntimeDefinition 的可选 scope_identity 缺省不序列化，旧配置和原始 child:JSON 身份保持。HashedV1 子 thread/run 固定78字节，保留父 thread/run/序号/call 的完整摘要；显式选择该方案的 Agent 编译身份也压成摘要，防止静态组合递归转义。运行时未指定的子组件继承根方案，显式冲突在子 Hook/登记/预算/IO前拒绝；根服务保护该私有选择。
- Supervisor 在控制路径验证前绑定冻结方案，模型重试与取消确认共用的 recovery_path 使用同一生成规则。没有迁移旧检查点、额度或已完成结果。原 Skill/Sampler 测试的 Rust Settings 字面量补默认字段，未改原业务设置。
- 实际16层轮询首先触发默认测试线程栈溢出，已修复为父调用拥有的 JoinSet 子任务；父 future 中断会 abort 后代，JoinError 走 Checkpoint 控制轨，不形成成功/已知失败回执。原未知副作用与陈旧 fence 规则保留，没有增大宿主/测试线程栈规避问题。
- 7项专项覆盖：16层完整调用及原累计额度/子槽归零、12层已知模型失败原请求恢复、12层定点取消确认、旧地址精确值与冲突零子IO、无新字段JSON、父 future 中断清理、无模型 Tool 根选择/冻结恢复/缓存。交替显式选择与继承，并在每层清空扩展，验证根服务恢复机制。
- /private/tmp/nofy-closure-c8d1-core.log 224项、agent.log 原Agent607项、sampler.log 原认证恢复1项全过，合计832项；追加session.log 验证通知绑定后的7项身份与5项原会话治理通过。host.log 原宿主构建、sqlite.log 无警告构建、consumer/result.json 仓库外配置Agent/Tool/Workflow/Hook消费、默认依赖187及diff检查通过。索引刷新至112963节点/268966边/300流程；detect_changes 累计4420符号/31流程/235文件 CRITICAL，含此前各阶段暂存变更，已报告，未提交。接续 C8d2 通用 Program 根执行与任务 envelope，独立通知/配置事件、通用节点新attempt、Rhai/Goal、C9/C10仍未完成。

### C8d2：通用根执行与版本化快照（阶段通过）

- upstream impact：RunRecord/execute_leased/begin_run/recipient/CompiledWorkflow.invoke LOW/0，ToolRuntime.program LOW/3（run_tool_node→execute_node→run_graph）；补查 watch_cancel/attach_job/drain_inputs LOW/0，SupervisedIdentity LOW/1。Rust 漏边按真实 SQL jobs、邮箱、控制/对账、事件、workflow 根调用方补查；复用上一阶段 Agent.invoke CRITICAL 范围与 RunServices 分析。累计4420符号/31流程/235文件CRITICAL已报告。
- CompiledProgram 绑定真实 Agent/ToolRuntime/CompiledWorkflow；ExecutionSnapshot v2 固定原编译快照及无模型程序的实际 call/输入，可纯恢复。原 RunRecord 泛型默认仍为 CompilationSnapshot，wire 不变；新的 ExecutionRecord/RunSnapshot 支持两类记录，按版本明确解码，不能把畸形 v2 回退成旧 Agent 数据。
- 新 execute_program/control_program/reconcile_program_child 与旧入口共用 ExecutionPlan、租约续期、运行树、控制日志、治理/权限、源Hook恢复和原 primitive 对账；无伪模型或假 AgentDefinition。程序根保留自己的取消监听，普通 Agent 输入拒绝；子 Agent 保留真实邮箱。with_checkpointer/invoke 也可在无SQLite公共SDK使用。
- 专项复现并修复：Clear binding 丢失真实 SupervisedIdentity 令持久审批失败；新纯根取消监听与 Agent 输入 drain 混用令完成阶段报错。根服务保护该身份与 ProgramRoot 标记，纯根只监听取消。未知效果测试保持 used+reserved 的真实额度，不把尚无回执的调用伪记已完成。
- 9项专项含旧 JSON/source API 共存、真实审批/0模型0step、纯根取消与未知 primitive 不重发、冻结输入/版本拒绝、workflow human/树/事件、新连接恢复、直接 Tool→真实子Agent 模型恢复、workflow根目标恢复，以及 start exit(97)→新进程人工决定/恢复→第三进程缓存，外部效果日志累计一次。
- /private/tmp/nofy-closure-c8d2-core-final.log 233项全过，program-final.log 9项追加验证畸形混合版本拒绝；host.log 原宿主构建、sqlite.log SQLite-only 无警告通过。consumer-final/result.json 在实际仓库外、未启用SQLite时恢复/执行Program并断言program=true；默认依赖187与diff检查通过。无默认feature构建default.log无警告通过。索引刷新至113060节点/269138边/300流程，暂存detect_changes累计4511符号/31流程/237文件CRITICAL，已报告，未提交。C8d3 必须继续 v2持久任务/首次提交窗口与 FIFO，之后独立通知/配置事件生产者、失败节点明确新attempt、Rhai/Goal，C9/C10；此阶段不宣称 ProgramSubmission 已完成。

### C8d3：v2 持久任务与兼容队列（阶段通过）

- upstream impact：JobSubmission LOW/1（enqueue_next_turn）、JobRecord LOW/1（insert），execute_submitted/enqueue_next_turn/prepare_direct_tool/attach_job/invoke_leased LOW/0；补查 run_inner/execute_leased/ControllerBinding.accepted/ModelRecovery.accepted LOW/0。实际补查同一 SQL 队列、原 worker、RootRecord→CP→确认两步协议、邮箱来源、控制命令、关闭缓存和租约。
- JobSubmission/JobRecord 引入兼容默认泛型；ProgramSubmission/ProgramJobRecord 提供 v2，ExecutionSubmission/ExecutionJobRecord 读取两版。旧 Saved payload 与 SHA256 摘要逐字节验证相同。v2 仅真实 Agent 有初始消息，Tool/workflow 的 input 为 null；原 submit/job API 保留，新增 submit_program/program_job/execution_job。
- 原 execute_submitted/run_next 使用相同 ExecutionPlan/heartbeat 与存储队列；v2 NextTurn 保留 v2 根格式且沿原 MailInput wire。首 CP 写私有 InitialInputProof，确认事务核对 fence/线程/摘要/执行身份；无模型的新任务只在已完成前项后按自己的证明初始化，不重用旧调用状态，也不伪造用户消息。
- 完成缓存修复：直接 execute/control 重放已关闭提交先验证冻结身份与原结果，避免过期预算或取消令牌改写结果及任务状态；重复命令只允许已接受且内容相同。新命令/变更证据拒绝，旧任务不能抢占更新的线程。未提交运行的缓存/停止行为仍待 C9 专项，不在此处冒称解决。
- 12项队列专项覆盖旧字节/摘要、纯提交、混合FIFO、同线程无模型多运行、v2 NextTurn与确认故障、三类首 CP/确认事务故障和新连接恢复、失败票据、未知效果对账、截止时间/完成缓存、未初始化取消、非法重用，以及三类程序分别在 submit/preflight/ack 后 exit(97)，再由新进程执行和第三进程缓存。实际效果或模型请求日志各一次。
- 拆分前 /private/tmp/nofy-closure-c8d3-core.log 245项通过；恢复源码版本后 final-queue.log 原jobs12项与program21项通过，sqlite-final.log/host-final.log无警告。收尾时 supervisor.rs 曾回退到旧暂存内容，原因未确认；已重新固定、暂存并记录 SHA256，不能把早先二进制通过直接等同于最终源码验收。
- 按新规则补查 Agent.invoke/run_inner、RunSupervisor、InitialReceipt、validate_begin/finish，图谱均LOW/0，复用既有高风险实际调用路径。公共类型/导出、方法名、序列化与运行顺序保持，执行封装、CP初始化、工具派发、驱动、Supervisor执行/SQL存储、初始确认、任务生命周期及测试分文件；本段21个组件均不超过500行。增加内核 文件说明.md，拆分后 split-core-final.log 245项全过且零警告；split-host.log/split-sqlite.log无警告，split-consumer/result.json 仓库外且无SQLite消费通过，默认依赖187。125个已暂存Rust源文件的SHA256复核一致；索引刷新至113172节点/269320边/300流程；暂存detect_changes累计4583符号/32流程/254文件CRITICAL，包含前序阶段及本次提取，已报告，未提交。
- 下一阶段仍有：独立通知/配置事件生产者、失败节点明确新attempt、Rhai/Goal、C9管理API/存储适配边界/停止控制/模块版本与工具来源、C10原始预设最终矩阵。整体未完成；文件持久后端没有获得完整调度适配，不因 Checkpointer 可替换而宣称持久 Supervisor 已无后端耦合。

### C8d4：有主事件生产者与独立通知程序（阶段通过）

- 范围：新增宿主安装的 EventProducer 模块、配置化 EventProgramDefinition / 冻结快照及 ProgramSnapshot::Event；共享 Agent 的无模型驱动、首检查点、HookBus、原模型失败/取消控制路径与现有持久任务。原 notify_session 保留兼容语义，不自动升级为可重试程序。
- 设计：配置引用已注册 producer，不能提交自称内核 owner 的声明；独立程序先持久化准确事件事实，再执行原订阅链。成功后保存 HookResult，检查点失败重放原 journal；未知 handler 效果保持待对账。工作流 Hook 下真实模型失败只能沿原源事实及运行树获得明确重试授权，不创建假模型、用户消息或工具调用。
- upstream impact：notify_session、CompiledProgram/ExecutionSnapshot、HookReplaySource、recovery_path、ModuleKind/ModuleInstance、run_inner、alias_hook LOW/0；HookBus.emit LOW/9（直接 hook/child_hook，两条流程），compile_tools LOW/1（compile_workflow），resolve_checked/PromptFactory/StaticPromptFactory LOW/0。公共枚举新增对外部穷举匹配存在源码兼容风险，已报告；复用 Agent.invoke 既有 CRITICAL 回归范围。提取 HookBus 发射及注册表解析/提示工厂以满足本段组件500行上限。
- 阶段验收：自定义 owner/版本与 payload 拒绝、无模型直接/无SQLite消费、首次CP与最终CP故障、订阅效果及成功peer不重复、持久任务FIFO和新连接恢复、真实子进程退出/重启、源工作流模型失败明确重试/定点取消、原核心/宿主及依赖边界集中回归。

- 已取得证据：core.log 258项全过且零警告，其中13项事件专项含真实 SQLite、效果日志、三处提交故障、新连接及独立进程 exit(97)；自定义事件前置 patch 后的模型重试保持原源身份、原请求与成功 peer。host.log 原宿主无警告构建，default.log/sqlite.log、boundaries.log 默认187依赖通过。consumer-final/result.json 在仓库外且无SQLite，event_program=true；无SQLite/workflow的 parent_pending 警告已补查 LOW/2（hook_route→recovery_path）并按 feature 收紧，仅在实际消费者存在时编译，复验 consumer-final 零警告。native-agent.log 原Agent607项、native-hooks.log 原Hook2项全过且零警告，合计867项。134个已暂存Rust源文件SHA256复核一致，本段新增/触及代码组件不超过500行；索引刷新至113275节点/269599边/300流程，暂存detect_changes累计4679符号/32流程/262文件CRITICAL，含前序阶段，已报告，未提交。
- 边界：此模块是单次、冻结来源的持久事件程序；外部 webhook/定时器接收由宿主负责，改变 payload/operation 用新线程，不静默重定义已有来源。旧 notify_session 的恢复拒绝仍保留。接续通用失败节点明确新attempt、Rhai完整映射与Goal实际编排；C9认证管理API/完整事务存储适配/模块版本历史/停止控制/工具来源与C10原始预设矩阵未完成。

### 2026-10-29 用户目标校准：控制台与常驻驱动优先

- 已更新目标规范、完成定义、C9 依赖与验收入口；本段为架构/计划校准，没有把未实现的常驻管理或热更新写成已完成。
- 已实现的 SDK/工厂/驱动继续复用；不再以只读 JSON 并返回 CompiledAgent 作为最终交付。普通能力扩展必须走外部定义/脚本/制品与实际加载路径。
- 优先 L1/L2 配置/制品/资源仓库与常驻宿主/Loader，再接 L3 版本化执行边界更新；C8 通用失败节点/Rhai/Goal、完整事务存储适配与原预设矩阵继续保留，最终 L4 控制台真实操作验收。
- 验证本段文档链接、Docs Index 与原执行源码摘要；实现阶段继续按 AGENTS.md 补 impact、集中验证及实际证据。

### 2026-10-29 声明式系统补充

- 用户明确单配置文件共享与迁移的体验。已将系统声明、传递依赖/代码摘要锁定、文件/API/控制台同源、差异与幂等应用/回滚纳入 L1/L2；配置不是不可见本地注册表的索引。
- 跨机器的环境/解释器/路径/资源能力预检、凭据引用注入，以及独立运行数据迁移包纳入最终验收；配置本身不被宣传为包含历史状态。
- 本段更新目标与验收，未宣称已实现声明加载、环境装配或迁移。优先阶段不变：L1/L2，再接 L3 运行更新、C8尾项和 L4/L5。

### L1a：单文件系统定义、锁定发布与配置仓库（阶段通过）

- upstream impact：compile_agent LOW/2（compile_document/compile_workflow）、compile_tools LOW/2（compile_event/compile_workflow）、ModuleRegistry.resolve 与 ExecutionSnapshot.restore LOW/0；实际核对各种 program snapshot、模块闭包与 floor 恢复。新增控制面只消费既有编译/执行契约。
- 文件：拟新增 runtime/src/system.rs、system/{compile,lock}.rs，control.rs、control/{service,file}.rs 及对应测试；lib.rs 新增导出。文件后端使用独立 control-file feature 与现有 fs2，不引入默认产品依赖；不修改生成的根 Cargo.toml。
- 契约：SystemDocument 描述全局模块、宿主 floor 与具名 Agent/Tool/workflow/Event；SystemBundle 导出完整可达模块、确切工厂版本与程序快照。不可变 Publication、草稿 revision/CAS、带期望 generation 的幂等 apply/回滚、结构差异及历史使用同一领域服务。文件后端为独立配置仓库，并不替换现有 SQLite 运行调度。
- 事务：纯编译/校验在激活前完成；配置 mutation 通过 CatalogStore CAS。文件实现持进程间锁，临时文件同步后 rename 并同步父目录；内容摘要/引用完整性验证，写失败保留可用版本，提交后同步失败明确返回提交结果不确定。重放 command_id 不重复激活，旧 generation 拒绝。
- 边界：该阶段先完成定义/发布/激活与真实程序装载；自动安装新的执行器、完整资源配置、常驻 HTTP 宿主、执行中组合转换与状态迁移继续 L1b/L2/L3，不能把当前激活指针当作全部热更新。
- 验证：单文件跨仅安装 factory 的新 registry 恢复执行、声明顺序/重复/冲突/锁篡改、旧发布保留、无效发布不激活、并发 CAS/ABA/幂等回滚、真实磁盘/新连接/子进程退出、原内核/宿主/仓库外消费与依赖边界。

- L1a 补充范围：ModuleRegistry.without_definitions 补查结构 LOW/0，仅用于从完整导出闭包构造私有注册表；原宿主声明不被改写。SystemFile 区分源/锁定输入，拒绝畸形锁定格式回退；同步准备与异步阻塞池准备共用同一编译器。
- declarative-file.log 最新20项专项全过。此前 core.log 与新增 SystemFile 编辑重叠，旧库/新测试接口不一致；不以该次构建代表最终代码。现固定、暂存全部阶段源码并记录摘要后重跑最终全量及宿主/仓库外检查。

- 最终验收：/private/tmp/nofy-live-l1-core-final.log 278项全过且零警告，包含20项声明式/文件/进程专项；host.log 原宿主构建、default.log/file.log/sqlite.log 三种 feature 无警告通过。consumer/result.json 仓库外、不启用SQLite，declarative_system/file_catalog=true；在同一进程更新Prompt、同时调用旧/新发布、磁盘重开与新catalog导入通过。默认依赖仍187，文件 feature 显式增加 fs2；146个Rust源码SHA256与暂存版本一致。索引113501节点/270093边/300流程，最终detect范围记录见下一条。

- L1a 最终暂存检测4880符号/32流程/276文件CRITICAL，包含前序全部阶段，已报告；未创建提交。该阶段只切换新调用的激活版本，L2常驻宿主与L3执行转换尚未交付。

### L1b：可声明资源与模型连接（已验证）

- upstream impact：ModuleKind/ModuleInstance/ResolvedModule/SamplerModel 均 LOW/0；实际补查 registry 实例构建/快照、Sampler.bind_scope/request_bound/calls_used/stream、原 factory 和全仓 ResolvedModule 字面量。公共枚举增加 Resource 会影响外部 Rust 穷举匹配，已报告；旧非资源快照新增字段缺省且不序列化，保持旧 wire/identity。
- 新 ResourceHandle 保存宿主内的类型化句柄和可导出的身份，不序列化实际连接或密钥。资源声明本身是标准模块，Model 通过类型化依赖引用资源；ResolvedModule 仅对资源记录身份，以免同名配置绑定到不同资源而不被发现。
- 原 Sampler 新增稳定 resource.sampler/model.connected 工厂；资源连接、允许模型、凭据引用/头引用和请求上界由系统文件声明，复用原 SamplerModel 的协议、流、成本和取消。凭据运行时解析，不进入文件或纯编译。工厂 revision 不依赖全部连接列表；新增无关资源不改变旧发布。
- 文件：registry 实例/ResourceHandle 分模块以满足500行；native sampler agent_model/declarative/ 下实现，旧 SamplerModel/factory 保留。新配置只开放可实际映射字段，未知字段、明文 api_key、模型/资源依赖类型冲突和未准入模型显式拒绝。
- 验证：真实本地 HTTP/SSE 三类原协议、参数/头/凭据轮换、无编译IO、导出不含密钥、资源身份篡改、无关连接添加、旧 v1/v2 字节回归、原认证恢复/预算、内核/宿主/外部消费与默认依赖。

- 结果：内核280项通过，原 Sampler234项通过，均零 warning；原 nofy-agent/executors 构建通过；默认依赖187项边界通过。日志 `/private/tmp/nofy-live-l1b-{core,sampler-final,host}.log`。首次宿主命令误用了该包不存在的 agent-runtime feature，已改成实际 executors feature 并通过，未修改包 feature。
- `agent_model.rs` 原598行拆为360行，mapping.rs243行；辅助函数 item/converted/provider_stream/sampling_failure upstream LOW，原循环和函数名保持。模型连接声明仍未覆盖原 OAuth/session repair 回调、通用 process/http/memory 资源，后续按对象补齐。

### L2a：真实常驻管理宿主与持久接纳（已验证）

- impact：jobs.insert/durable.open_with_clock/execute_submitted/control_program/control.apply upstream 均 LOW/0；图未覆盖动态 trait 和 Rust 宏全部调用，人工补查原队列写入、冻结恢复、根租约、控制重放、事件与审批消费者。新增 SQLite 表只增不改原表/版本和既有 wire；不得把影响标签当成充分安全证明。
- 架构已锁定在 live-agent-console 的 L2a：新可选宿主，原 ControlPlane + Supervisor，不做原展示层重构。运行请求显式发布摘要，管理请求与原 Job 原子写入；恢复命令持久后由有界后台 worker 执行，事件/审批共用旧存储。
- 变更范围：runtime supervisor/jobs 新 managed admission/query/action 模块、durable 的增量表；新 common/nofy-agent-host crate、workspace member/lock、真实 JSON 样例、运行/鉴权/恢复测试和相应文件说明。未扩展原模型/工具 driver；涉及新增入口时补 impact。
- 阶段验收：真实 HTTP 的权限、配置发布/回滚/加载、同进程修改 Prompt/连接、新旧 run、连接中断/进程退出后继续、命令重放、事件游标、审批取消；内核与原宿主回归、独立消费者和默认依赖边界。

- 阶段结果：内核283项、真实宿主7项通过（其中1项为受环境控制的退出测试子入口），均零 warning；原 nofy-shell 完整构建检查通过，默认 SDK 正常依赖仍187项。最终日志 `/private/tmp/nofy-live-l2-{core,host-verified,original-host}.log`。仓库外非SQLite消费已在L1b通过，本阶段新增管理队列仅在SQLite feature 下，不重复同一无关检查。
- 真实验证包括同进程 Prompt/模型连接变更、旧发布继续使用、激活/回滚、权限/资源权限、纯预览无凭据读取、API接纳后无 worker 的进程直接退出97、恢复后一次模型调用、实际常驻二进制加载文件并重启缓存、持久事件、Last-Event-ID、SSE断线不取消执行、队列/进行中取消、精确审批/不可变决定、持久恢复与HTTP工具只执行一次。
- 首次新增审批 API 测试在202后立即读取运行，读到旧 paused 状态；已修正为等待命令持久完成回执再检查运行，不通过清空真实状态掩盖异步语义。测试依赖新增后 lock 尚未更新时原 shell 的首次 --locked 检查被正确拒绝，已离线更新并以固定 lock 重跑通过。
- 调度补充：原 job/action restore 使用 blocking pool，后台读取不含大图/输入的队首；有游标分页跳过占用/退避项，避免前256条阻塞后续任务；管理运行列表有8MiB页上界。关闭时拒绝新请求、结束SSE并收束已派发任务。
- 边界：当前默认凭据来源仍为进程环境引用，普通外部 shell 变更不会刷新它；通用外部资源/制品、原预设完整声明、CompositionTransition 和最终控制台尚未完成，后续继续施工。

### L2b1：外部可轮换凭据（已验证）

- 资产/边界：密钥值是独立资源，不进入配置导出/响应/错误；references 可分享。resources 权限可更新模型/HTTP工具使用的引用值，普通 read/edit/publish/execute 不能读取值或写密钥。文件内容也作为外部不可信输入校验。
- 范围：新 host credentials 文件仓库和只返回metadata的API、native/main 默认凭据装配；稳定逻辑 authority 保持已有环境资源导出兼容。既有API/旧宿主不改；默认SDK依赖仍隔离。后续 L2b2 接声明HTTP资源/工具/Hook，再补进程制品与完整Loader。
- 迁移：本机 entries 覆盖可选环境初始来源；删除保存墓碑防止回退旧密钥。密钥值变化不构成配置发布，不变更进行中已经发出的HTTP请求；后续请求读取最新值。
- 验收：同进程真实模型/HTTP请求使用新值；未授权/错误revision拒绝；纯编译无凭据IO；响应/导出/错误无密钥；重开、跨实例CAS、损坏文件、权限和墓碑回退；原宿主与L2a路径回归。

- L2a 索引刷新：113850 nodes/270989 edges/6309 clusters/300 flows；暂存 detect_changes 5167符号/32流程/302文件，累计CRITICAL已在编辑下一阶段前报告；覆盖之前全部改造，没有提交。
- L2b1 impact：KernelHost.open LOW/2（宿主装配/测试），API.router LOW/0，native.registry LOW/0，原 CredentialProvider trait LOW/2（声明连接与测试）；KernelHost结构名查询UNKNOWN，按实际open/registry/router入口补查。原trait不增加强制方法，旧嵌入调用保持，文件仓库是可选装配；默认二进制升级为文件+初始环境fallback。

- L2b1结果：宿主13项通过、零warning（含两个受环境控制的子进程入口）；日志 `/private/tmp/nofy-live-l2b1-{check,host}.log`。实际模型请求在同一发布摘要下分别使用更新前/后值；撤销后新运行在读取凭据处失败且无第三次HTTP。元数据/配置导出/错误响应不含测试私密标记；并发实例和两个独立进程只允许一个CAS更新。文件损坏/权限放宽/authority不符拒绝读取，墓碑阻止旧环境回退。原L2a二进制/进程/API/审批/取消路径全部继续通过。
- 实施：FileCredentials只在实际读取/管理操作访问文件；Unix0600、绝对固定路径、1MiB/1024项/单值16KiB、严格references、全局单调revision、进程间锁和原子替换。存储为受权限保护的明文，未声称加密保险库。metadata不返回值；系统导出不含值。访问授权令牌仍是独立引导来源。

### L2b2：声明式HTTP工具与Hook资源（已验证）

- 目标：默认常驻宿主中通过一个系统文件新建HTTP资源/工具/Hook并执行，不写Rust连接注册表。原tool.http/HttpConnection安装接口保留。
- impact：HttpConnection.install upstream LOW/0；私有endpoint图解析UNKNOWN，已人工读取HttpToolFactory.build唯一使用点、URL归属检查与HttpDispatch.call。native.registry/router入口LOW沿用已覆盖范围；原CredentialProvider trait不改必需方法。
- Schema：resource.http配置`{base_url,methods,credential_refs}`，稳定工厂revision和当前authority进入ResourceHandle身份；tool.http_connected配置`{contract,path,method,input?,credential_ref?}`，connection依赖必须是Resource且类型为HTTP资源。工厂只解析URL/验证引用，不创建客户端或发请求；首次实际调用懒装配原HttpConnection/HttpToolFactory，并复用原dispatch的JSON映射/权限/timeout/取消/输出限制。
- 原URL归属算法抽为私有pure helper，避免两套路径规则；只开放Resources权限发布的基址，工具输入无法覆盖URL/方法/凭据引用。客户端复用于同一资源，禁止重定向/环境代理，保留原请求语义。
- 同一工具Pack可由原hook.executor适配为handler，再由hook.subscription绑定运行边界。默认native安装稳定HTTP资源/工具/Hook执行器；HTTP credentials桥接同一逻辑authority及当前凭据仓库。旧连接路径/默认SDK边界不变。
- 验收：编译无IO、旧/新接口、路径/方法/凭据/资源类型冲突、无关新资源不改变旧程序、真实工具/Hook同进程加载/修改/审批/恢复/凭据轮换与导出重建；未知效果继续原对账协议。

- 结果：宿主14项、原executors10项全部通过、零warning；原 nofy-agent/executors 构建通过；日志 `/private/tmp/nofy-live-l2b2-{host,executors,original-host}.log`。源码冻结185个Rust文件无漂移。原内核283项在L2a通过，本阶段未改内核实现。
- 同一HTTP API/宿主通过 examples/http-system.json 直接注册HTTP工具和before_model Hook，真实请求验证工具路径/Hook Patch 变更；相同旧发布可继续使用旧路径，同时读取最新凭据。新资源不会改变旧程序composition；跨目录相同authority的原生工厂可重建锁定导出。非法路径/方法/credential_ref/Resource类型/未知字段和inline URL credentials在纯校验阶段拒绝，无网络与凭据文件创建。
- 既有工具/Hook dispatch、权限和未知效果协议没有复制。HttpConnection 的纯URL/相对路径算法抽到 http/connection.rs，保留原安装/工具工厂接口；new declarative.rs243行。后台恢复仍由原Supervisor；没有把HTTP函数配置等同于进程制品或执行中组合转换。

### L2b3：外部源码JSON方法与Hook（已验证）

- 原run_workflow upstream CRITICAL/29，outcome_from_error/register_host_fns HIGH，影响原shell会话与runtime.workflow，已在编辑前报告。阶段锁定为可选executors/rhai的纯方法profile，不修改原workflow入口、结构或引擎；它仍负责Agent编排。native.registry LOW/0沿用覆盖范围。
- 新tool.rhai工厂/source执行器、默认宿主feature/注册、实际JSON样例与测试。使用项目已经依赖的同版本Rhai库；统一本profile的编译/运行engine builder，只做JSON方法，无Agent/文件/网络/工具宿主函数；导入/eval/输出关闭。不是第二套Agent运行循环，也不冒充完整Rhai编排选项已闭环。
- Schema：contract为原ToolContract，source 1..1MiB，input为原JsonBinding，max_operations默认100000、1..10000000；未知字段拒绝。字符串/数组/Map总递归大小与变量/函数/调用深度有界；输入/输出沿原contract校验。publish仅编译语法，执行在blocking pool；timeout/cancel/drop触发VM取消。code/schema/limits均进快照，源修改走新发布。
- 验收：无模型纯工具实际执行，hook.executor修改真实模型请求；同进程源码变更、旧发布/恢复、语法/字段/schema错误、循环预算、超时取消、模块/文件/Agent宿主调用拒绝，原HTTP/process/Hook及管理宿主全部回归。

- 结果：宿主15项、executors/rhai14项通过、零warning，日志 `/private/tmp/nofy-live-l2b3-{host,executors-verified}.log`。完整单文件examples/code-system.json通过无模型计算14/新源码21、原模型前Hook源码修改、旧发布继续执行与重复运行回执验证。
- VM限制测试覆盖嵌套complete、原JSON映射与schema、语法/未知选项/非法限额、未注册Agent/文件/网络函数、模块导入阻断、不可捕获的操作上限、数据/输入/输出限制、timeout/已取消和future drop后的单blocking worker恢复。初次测试误从人类错误文本找code，已按原ToolError.details.code协议修正；无修改运行错误行为。
- 新code.rs120行、code/rhai.rs94行；原nofy-workflow源码未改。该profile直接使用项目同版本Rhai库，方法编译与运行共用严格builder；默认SDK无新增依赖，复用工具/Hook/监督驱动。完整可调用Agent的workflow脚本仍继续原引擎及后续模块装载阶段，不能把纯方法当成编排预算闭环。

- L2b3补充：默认无rhai feature的executors构建、原 nofy-agent/executors 构建均通过、零warning，日志 `/private/tmp/nofy-live-l2b3-{default,original-host}.log`。

### L2c：可复用workflow资源/工具/Hook（已验证）

- 缺口：既有tool.workflow/hook.workflow只选择宿主预装WorkflowLibrary。新的资源工厂需要按声明依赖构建隔离编译环境；不能把全部宿主定义偷渡进子图，不能丢失模型/资源/策略的冻结身份。
- 契约：ModuleFactory新增build_with_context默认调用build，ModuleBuildContext借用当前定义/registry/已解析快照；只在需要时创建声明依赖闭包+强制floor的隔离registry，编译后验证已解析依赖与原事实相同。旧工厂无新增必需方法/字段，旧快照/顺序不变。
- resource.workflow配置document与bindings(kind map)，实际ModuleRef在标准dependencies；通过原compile_workflow纯编译，深度16，强制floor依赖当前资源时拒绝循环。connected Tool/Hook转发原冻结WorkflowLibrary单图适配，不复制调度/控制器。默认管理宿主安装三个稳定工厂；模块依赖查询接口输出动态绑定类型供控制台连接。
- 范围：registry新context模块/默认方法/resolve调用，workflow新declarative模块，native工厂与read-only依赖schema API；Core作用域/兼容/模块测试、实际HTTP一文件workflow复用/Hook/恢复与原矩阵回归。
- 验收：无隐式定义可见性、资源/依赖身份变更检测、host floor不可省略/移除、纯编译/无关资源稳定、Agent/Tool/Hook共享workflow、重启/审批与子控制恢复；内核全测试/原宿主/SDK边界并适当检查仓库外消费。

- impact：ModuleFactory HIGH/21直接依赖，resolve_typed HIGH/5，resolve_checked LOW/0，compile_workflow LOW/1，WorkflowHookFactory LOW/0；已在编辑前报告HIGH。增加默认方法与借用上下文，只有新组合工厂使用作用域；不扩展旧wire、不改变解析顺序。原WorkflowLibrary/Tool/Hook仍可使用。
- 实际scope按显式依赖传递闭包及宿主floor重建原定义/工厂，未把live实例改成伪造的空config工厂，保证内层快照仍是可恢复原定义；编译后核对已经解析的事实，资源身份漂移拒绝。所有构造仍遵循纯编译契约。

- 作用域测试先通过：显式传递闭包、宿主floor/能力保留、无关定义不可见、同ref资源身份漂移拒绝。新增深度/floor测试首次测试文档缺少原WorkflowSpec必填input_schema/output_schema，已按原契约补齐，不放宽生产校验。
- 补充安全边界：资源权限扫描原来只检查SystemDocument.modules，内联WorkflowProgram.document.modules可能绕过resources作用域。resources入口upstream LOW/4后补充扫描该原始嵌套声明，草稿/发布/导入/应用共享检查；新增publish/edit/execute无resources的真实API拒绝测试，且确认被拒后catalog无写入。

- L2c结果：内核287项、宿主17项通过且零warning；原nofy-shell构建与仓库外旧工厂/无SQLite消费通过。日志 `/private/tmp/nofy-live-l2c-{core,host,original-host,consumer}.log` 与 consumer/result.json。默认SDK仍187项依赖；194个Rust源码冻结无漂移。
- 单文件workflow-system.json验证纯Tool、workflow Hook、workflow子Agent；无模型计算14、上游源码更新后21、旧图继续14，Hook更新真实模型请求。验证未声明绑定不可见、错误kind拒绝、无关模块不改变composition、导出跨目录重建、重复运行不增加事件，以及嵌套资源权限拒绝且catalog不落盘。
- scope/floor/depth测试覆盖强制floor自动入内层快照、同ref配置覆盖拒绝、16层嵌套限制及失败后恢复；Resource身份漂移拒绝。新上下文是可选默认方法，解析顺序与旧wire保持；Connected工具和Hook继续原调度/恢复代码。
- 下一阶段管理缺口：模型外程序的运行参数目前固定于发布默认值；HumanResponse/完整对账与终止接口尚未接管理队列。先补每次运行的参数冻结，再接这些受根租约保护的控制；仍保留进程/制品、剩余C8、CompositionTransition、原预设完整声明与控制台的后续验收。

### L2d1：每次运行参数冻结（架构锁定，待impact后实施）

- 缺口：旧Agent有消息输入，但Model-free Tool/workflow/Event调用参数固定在发布默认值。新增可选ManagedRunRequest.parameters，仅覆盖数据输入，不允许更改模块、工具名、事件名/owner或权限；未提供继续默认值。
- schema/字节校验与具体Snapshot生成发生在提交前；原请求和实际JobSnapshot原子落盘，重复ID按完整参数比较；重启/恢复不可重新读取配置默认值。Agent拒绝parameters，显式null与省略分开，旧JSON摘要通过skip_none保持。新Rust字段影响本阶段新增DTO的结构字面量，现有调用按None适配。
- 范围：system新invocation模块/公共方法，tool_schema私有helper去除workflow-only限制，managed DTO/admission，host只读program schema API与真实运行测试；不改原Job wire或Agent入口。
- 验收：一个release不同Tool/workflow/Event输入、schema/超限/Agent误用拒绝且无队列写入、默认/null区分、重复ID冲突、进程接纳后退出/旧快照恢复使用原参数、原内核/宿主/外部消费与默认feature边界。

### L2d2：人工响应管理（已完成验证）

- 复用原HumanResponse/CompiledWorkflow::respond和监督器根租约，禁止客户端直接写检查点。
- 管理命令绑定记录的human控制节点和冻结workflow资源路径，验证节点attempt、输入请求、schema及根归属。
- 接纳命令、人工决策、恢复与命令回执均使用现有SQLite数据链，失败关闭且可重放；不得重跑已完成节点。
- 实际HTTP效果计数验证根workflow、模块workflow、错误目标/值/请求、命令冲突及进程退出后的执行。

### L2d1验证记录

- 已完成真实每次运行的Tool/workflow/Event参数、程序输入schema/default接口与任务事务快照冻结。
- 内核全量289项、宿主20项、默认无SQLite/无workflow的2项参数用例通过；日志为/private/tmp/nofy-live-l2d1-core-final.log、host-verified.log、default.log。
- 新workflow测试最初漏注入原合约要求的共享checkpointer，修正测试装配后通过；未放宽生产边界。
- 并行压力下原审批用例5秒等待超时，单独运行通过；统一为原outcome用例同等15秒有界等待，并保留超时最后回执。验证仍检查恰好一次真实HTTP效果，未改变生产调度。
- 原nofy-shell构建、仓库外消费均通过；索引为114120节点、271571关系、300流程。未宣称L3或平台最终验收完成。

### L2d2验证记录

- 已完成Human管理命令、冻结根/模块/嵌套模块选择、根租约内控制树与attempt校验、原HumanReceipt和监督器恢复。
- 内核全量290项无警告通过（/private/tmp/nofy-live-l2d2-core.log）；宿主25项无警告通过（host-final.log，测试并发2）。包含真实HTTP根/模块效果、多层模块、模型前Hook等待、错误命令不堵塞、跨进程恢复。
- 丢失人工决策之后的管理进度、执行完成但管理ack缺失均经真实文件效果验证，重开数据库不重复。
- 嵌套用例在全量并行负载下触发15秒回执等待，单独9.73秒通过；内核完成后独立宿主全量通过，保留原有界超时，无生产逻辑放宽。
- 最初实现按借用猜测了ResourceHandle::get返回类型，编译指出实际为Arc；已按实际契约修正并清除冗余导入。

### L2d3：可声明业务事件（已完成验证）

- 新event.producer的owner绑定模块reference；外部声明不能取得runtime命名空间或原生命周期事件名。
- 新hook.owned_subscription通过显式producer/handler依赖复用原HookRule/Registration/Bus；不改旧hook.subscription工厂与身份。
- 原EventProgram使用按次payload，覆盖源码/HTTP/workflow回调、错误声明/归属/数据拒绝和跨目录锁恢复；复验Event根中的Human管理。

### L2d3验证记录

- event.producer与hook.owned_subscription已安装默认宿主，保留旧工厂、原构造器和原事件循环。分析入口均LOW；compile_event影响系统编译入口，新增工厂不改旧执行行为。
- 内核相关43项、宿主全量27项、默认无SQLite/无workflow的2项事件测试通过，无警告。日志/private/tmp/nofy-live-l2d3-{core,host,default}.log。
- 单文件源码Hook和按次payload、缺失/错类型/错owner/保留事件拒绝、锁跨目录恢复、Event根中Human响应均验证。原model_sequence零值省略协议保留。
- 原nofy-shell构建及实际仓库外消费通过（original-host.log、consumer.log）；204个冻结Rust源码无漂移。

### L2d4a：子工具对账管理（已完成验证）

- 把原reconcile_program_child的接纳逻辑提取为同一根租约内可复用方法，旧公共接口继续自行获得/释放租约。
- 新持久化ReconcileChild管理命令强制model_sequence，按原完整call、根/子归属和预算/回执机制接纳证据，再恢复原根。
- 提供有界、分页、只读的子工具recovery targets，供控制台取得真实待对账操作；不暴露原始检查点写入。
- 验证实际进程在HTTP效果发生后退出、原根恢复到不确定状态、错误证据拒绝、合法证据只推进剩余流程以及重复/重启回放。

### L2d4a验证记录

- 新ReconcileChild命令复用原证据表与原监督器；提取租约内实现并保留旧API的获得/释放租约、可选旧epoch兼容。未新增对账存储表或修改children实现。
- children的上游图报告CRITICAL/63符号，含AST等同名匹配；采用独立有界投影查询，保持旧接口及展示层兼容。其余入口LOW。
- 相关内核55项、完整宿主29项通过，无警告（/private/tmp/nofy-live-l2d4a-core.log、host.log）。实际HTTP效果发生后硬退出，错误子运行/epoch/call和图标记被拒绝；合法证据恢复原workflow，HTTP计数始终为1。
- 新投影视图在SQLite内比较组合，只返回待处理调用候选，不把整个组合/消息批量载入内存；执行时由原边界进一步拒绝可恢复控制器。支持旧kind缺省、Unicode字节地址与分页。
- 崩溃用例最初使用100ms租约，未能稳定完成I/O准备；改为原恢复用例采用的2秒量级，并在重开前等候该租约到期。生产租约未修改。
- 207个Rust源文件冻结，无漂移。关闭workflow的8项回归与原宿主构建均通过，无警告。

### L2e1：可声明且可迁移的预算（已完成验证）

- 增加显式命名InstalledBudget安装方式，旧物理身份构造器保持原有行为。命名身份不含DB路径，监督器物理存储一致性检查保留。
- 新resource.budget和governance.budget_connected使用原预算引擎/SQLite/根租约；常驻宿主安装，普通配置可设置limits和retry。
- 验证锁跨目录复建且不携带历史、纯编译不enroll、预算用尽后resume不重置、异库同名不能调度。
- 本阶段不宣称运行中预算修改、根原语/模型对账、停止/放弃或完整L3已完成。

### L2d4b：系统required floor恢复（已完成验证）

- 已确认系统文件额外required floor与worker基础registry不一致会拒绝合法管理任务。
- 仅管理任务恢复时补入快照中的额外自约束，要求当前宿主全部强制floor仍存在；普通SDK恢复严格语义保留。
- 验证额外审批floor首次暂停、审批命令恢复效果一次、当前新增宿主floor不能被快照省略；覆盖原缓存回放及无workflow构建。

### L2d4b验证记录

- 修复前用例直接复现Composition("host required policy floor changed during restore")。
- 仅已接纳管理任务在恢复前补回系统额外自约束，当前宿主floor仍须为快照floor的子集。普通SDK/未管理任务继续原严格恢复。Human准备复用同一上下文，关闭任务和完成动作保留提前缓存回放。
- 相关内核65项、宿主全量29项通过，无警告；覆盖配置级required审批首次暂停/恢复只产生一次HTTP效果、required治理零配额无效果、遗漏当前宿主floor拒绝。
- 日志/private/tmp/nofy-live-l2d4b-before.log、core.log、host.log。207个冻结Rust源码无漂移；关闭workflow的10项回归与原宿主构建通过，无警告。

### L2e1验证记录

- 新install_named、resource.budget与governance.budget_connected已实现并默认安装；旧构造器和运行时storage_identity验证保持原逻辑。
- 影响查询为LOW，两个构造器返回partial，补查实际调用点；采用追加API，未改旧身份计算。
- 内核预算相关36项通过，无警告。新资源默认无SQLite用例通过；真实HTTP预算用尽/恢复额度不重置、跨目录锁复建已通过。
- 同名资源绑定异库仍在调用前拒绝；旧安装方法在不同物理库仍产生不同身份。编译不enroll，配置导出无本机DB路径且不携带账本历史。
- 默认feature首次测试有仅在SQLite场景使用的导入警告，已改条件导入；完整宿主30项、最终默认用例1项无警告通过；原nofy-shell构建与仓库外消费通过。210个Rust源文件冻结且无漂移。

### 当前交付边界（L2e5阶段验证之后）

已经完成的常驻配置链包含单文件源码/锁、发布/计划/应用/历史、按次输入、模型/HTTP/源码/可复用workflow、事件生产者/订阅、人工响应、根/子工具与治理模型对账、系统自约束恢复及可迁移预算。

整个目标尚未最终验收：一般失败workflow新attempt、完整编排脚本Agent参数、真实Goal规划/验证、进程/制品Loader与实际隔离、完整原Nofy/记忆/MCP资源声明、存储抽象/回收/provenance、运行中CompositionTransition及原始编程Agent完整矩阵仍需继续。控制台展示层按用户要求后置。不能将当前阶段通过解释为平台完全体或原始Agent全行为验收通过。

### L2e1最终索引与累计范围

- GitNexus刷新成功：114273节点、272002关系、300流程。
- detect_changes(staged)覆盖整个未提交改造：339文件、5537符号、32流程，累计风险critical。该结果不是本次单个预算阶段的影响量，也不代表完成最终验收。
- 210个冻结Rust源码最终零漂移，git diff --check通过。未执行commit/push/PR。

### L2e2：根工具对账（已完成运行验证）

- 用户调整优先级：前端后置，先完善内核恢复和能力闭环。
- 上游分析覆盖ManagedCommand、managed_action_leased、invoke_plan_leased、accept_child_reconciliation_leased和reconciliation_input，均返回LOW/0；Rust图缺失实际调用边，已补查管理worker、根租约执行和ChildObserver链路。
- 增加强制epoch的ReconcileRootTool，复用原证据表、完整调用身份、根租约与原工具dispatch边界。根workflow/Event控制器必须定位真实原语后对账，不能用外部结果替换整个控制器。
- 根恢复视图在SQLite内投影待处理调用，保留原子恢复分页API。API只接纳证据，不直接改写检查点、消息或释放预算。
- 验证范围：真实HTTP效果后硬退出，带/不带预算恢复；Agent和Tool根的接纳后重开、最终管理回执丢失重放；错误epoch/call、不可覆盖回执和原子workflow回归。

### L2e2验证记录

- 相关内核61项通过；关闭workflow的SQLite回归11项通过，包含旧根失去线程归属后拒绝新对账命令。新测试内部恢复私有方法不可见的问题通过使用公共编译产物构造既有ExecutionPlan解决，没有扩大生产可见性。
- 新HTTP用例最初把缺失必填字段的纯文本422响应按JSON读取；修正为直接断言HTTP状态，保留原鉴权和错误协议。根HTTP两项定向复验通过；完整宿主32项（HTTP27、凭据5）通过，无警告。
- 真实进程在HTTP效果后硬退出，带/不带预算均通过证据恢复；效果计数保持1，预算从预留1结算为使用1，重放不增加费用。覆盖错误轮次/调用、缺失轮次、篡改结果、只读作用域拒绝执行以及根workflow控制器拒绝。
- 边界脚本通过：最小内核仍为187个normal dependencies，未引入产品宿主/具体工具实现。原nofy-shell构建与实际仓库外消费者均通过；213个冻结Rust源文件零漂移。最终索引刷新成功：114316节点、272107关系、300流程；日志/private/tmp/nofy-live-l2e2-index.log。
- detect_changes(staged)审计整个未提交分支：342文件、5573符号、32流程，累计critical；新增根对账阶段的入口分析仍为LOW，累计标签不代表单阶段变更体量。没有提交、推送或创建PR；完整原始编程Agent行为矩阵尚未验收。

### L2e3：已持久化模型意图的对账（已完成运行验证）

- 边界：只接纳治理模型边界已经记录的派发意图；未治理旧入口继续原流式行为，本阶段不宣称支持它的崩溃对账。
- 在原sample_model边界、原ModelRecovery检查点命名空间旁记录当前尝试票据：thread/run、operation/scope、request fingerprint、generation、attempt以及原预留。新增独立有界journal，不更改旧预算/失败重试回执。
- ReconcileModel管理命令在原根租约内验证冻结组合、当前根及目标Agent归属和完整票据；写不可覆盖证据，再恢复原根。原边界优先使用预算真实回执；证据不能授权重发请求。
- 证据返回的模型结果沿原Agent/压缩/工具后续边界处理；消耗按原预留上界与报告实际值取较大者，未知费用不归零。
- GitNexus覆盖sample_model、model_step、ModelRecovery、ManagedCommand、managed_action_leased和子模型票据入口，均LOW；模型入口为partial，人工补查原Agent、压缩适配及子运行调用。公共改动为追加票据/命令/恢复查询，旧接口保持。
- 结果契约使用显式Completed/Failed类型：失败证据沿原ModelFailure结算并产生原显式重试票据，成功/失败不能相互覆盖。补充ModelFailure上游分析为LOW（2符号、1流程）；原ModelFailure及原预算结果格式不改。
- 模型目标按SQLite主键读取指定子运行，避免为单个目标载入整棵子运行树。真实预留使用原request_bound，Sampler可能按实际max_completion_tokens收窄，验收不假定配置上限就是最终预留。

### L2e3验证记录

- 内核相关92项、默认无SQLite/无workflow的20项、关闭workflow的SQLite回归18项通过。覆盖原真实预算回执优先、并行scope无丢更新、旧claimed意图补出原生票据、成功/失败与原显式重试、超上界记账并阻断、管理接纳后重开及最终回执丢失。
- 完整宿主34项（HTTP29、凭据5）通过。真实模型HTTP请求发生后进程硬退出，根Agent与workflow子Agent的原请求均不重发；恢复后HTTP工具效果一次。错误归属、scope、指纹、generation、只读执行及覆盖证据被拒绝。
- 最初构建使用JobStatus直接比较，改为原枚举模式匹配，未扩展旧状态契约。HTTP用例最初假设输出预留等于资源配置上限，现使用返回的原request_bound预留，生产计费保持原边界。
- 旧governance_runtime测试辅助类型仅用于SQLite，在默认构建产生未使用警告。补充影响分析均LOW，将776行测试文件拆成387行主套件与398行恢复套件，并给专用辅助类型加SQLite条件；生产逻辑不改。默认复验无警告，拆分后10项完整治理回归通过且无警告。
- 新examples/model-recovery-system.json已用真实二进制通过system-file载入，激活generation=1、注册chat且未提交模型任务；凭据仍为引用。边界检查保持187个normal dependencies。
- 补测复现：模型对账关闭后管理回执丢失、同一线程已进入下一轮时，旧命令误报失去线程归属（next-turn-before.log）。补充cached_outcome/管理入口影响分析LOW；将命令接纳凭据与模型证据同CAS保存，只让已接纳旧命令读取原关闭任务的不可变结果，未知新命令仍拒绝，不修改新轮次检查点。修复后47项相关回归通过（next-turn-final.log），新轮次检查点摘要完全不变，未接纳的新旧根命令仍拒绝；完整宿主34项复验再次通过且无警告。

### L2e3最终检查

- 补修后默认20项、SQLite-only 18项及完整宿主34项再次通过，无编译警告；原nofy-shell构建与仓库外消费者再次通过。220个冻结Rust文件零漂移，git diff --check通过。
- GitNexus刷新成功：114449节点、272358关系、300流程，日志/private/tmp/nofy-live-l2e3-index.log。detect_changes(staged)审计整个未提交分支为350文件、5668符号、32流程，累计critical；这不是单个模型对账阶段的体量。未执行commit/push/PR，整体目标仍未最终验收。

### L2e4：无预算模型日志模块（阶段验证完成）

- 新binding.model_journal通过既有Binding模块显式选择，无需注册自定义Rust或附加预算。默认旧配置不改变；要求实际检查点，持久性由所注入后端提供，常驻宿主继续原SQLite/根租约。
- 原模型边界在调用前保存原生派发意图，在返回后保存不可变真实结果。未知意图通过既有ReconcileModel命令继续；真实结果优先，失败复用原ModelRetryTicket/generation，取消保留原控制语义。
- 不创建预算记录；恢复目标标注unmetered，reserved为无预留，实际Token继续原ModelResponse累计。单Agent原生结果日志16MiB/8192操作有界，证据继续原4MiB日志及命令接纳关联。
- 影响分析覆盖sample_model/model_step、ModelRecovery、Agent.run_inner、Agent.run及默认宿主registry；已返回入口均LOW，sample_model显示模型循环和恢复测试依赖。人工补查绑定安装、上下文scope、显式重试及子运行；不重构展示层。


### L2e4阶段验证与边界

- 相关核心63项通过；后续身份补修后默认构建18项通过。真实HTTP模型恢复2个测试覆盖根/子Agent与有/无预算4种情形全部通过，进程退出后的原请求计数保持1。
- 首轮完整宿主33/34通过，子Agent无预算日志缺少execution_run_id导致严格身份验证拒绝。修复日志模式初始化的运行身份后，上述HTTP用例通过；没有放宽对账归属验证。
- 最终完整宿主复验尚未启动：自动审批登录令牌刷新失败阻断前置缓存清理。未删除缓存、未重试绕过审批，日志见/private/tmp/nofy-live-l2e4-model-http.log与default.log；不能宣称补修后完整宿主34项已复验。

### L2e5：管理放弃与线程封存（阶段验证完成）

架构锁定：沿原POST actions/持久管理worker增加Abandon，携带非空reason和acknowledge_unresolved=true。它是管理终止事实，不是业务完成/失败结果。活跃执行先走原cancel或等待租约释放；Abandon只在原根租约围栏下提交。

- 持久Abandonment回执与线程封存、job abandoned状态、未启动同线程任务取消、待处理邮件拒绝及管理回执在同一SQLite事务提交。保留原检查点、原生结果/证据日志、预算used/reserved与原运行outcome；旧execution.status可为abandoned，outcome仍是最后观测值，不是放弃结果。
- 放弃不恢复模块/凭据，允许缺失工厂时脱困。待处理Abandon在同根管理队列优先，普通命令仍FIFO；取得围栏后被放弃根的其余未完成命令记为管理层superseded，不能推断其已发生外部效果失败。原业务效果和已完成回执不可覆盖。
- 同一command_id精确幂等；封存后的相同原因Abandon可读原回执，不同原因拒绝。已关闭任务返回原缓存结果，不封存已被下一轮使用的线程。旧任务/邮件的精确重放仍可查回执，新输入、恢复、对账及同命名空间新任务拒绝，必须显式选择新线程。
- 公共契约为ManagedCommand::Abandon、JobStatus::Abandoned、ManagedActionRecord.abandonment可选字段及SqliteStore.abandonment；新增表保留旧数据库schema1读取，不修改原预算/检查点格式，不新增展示层RunEvent枚举。
- GitNexus阶段入口execute_managed_action/insert/validate_begin/begin_run/recipient/JobStatus/open_with_clock及补充ManagedCommand/ActionResult/worker/query/initial影响均LOW；execute_submitted识别宿主worker，managed_runs识别API list。图谱Rust边不足，人工按HIGH处理，集中验证租约互斥、未知效果不重发、数据不变、队列/邮箱关闭和回执重开。API actions图谱无路由索引，人工核对execute/read鉴权，复用现有路由。
- 顺序：契约及封存事务 -> 调度与所有恢复入口封口 -> 回归与真实HTTP验收 -> 索引和交付记录。前端保持范围外。自动审批故障解除前，需审批的构建/测试保持未验证。


### L2e5实现与验证状态

- 已实现公共契约、无factory restore的行政路径、原租约围栏、原子回执/封存/后续队列与邮箱关闭。原管理队列优先规则同时约束worker投影和直接执行入口，普通命令保持原FIFO。已关闭业务回执通过原cached_outcome核验，不修改较新轮次。
- 监督器新运行、任务恢复、管理恢复、根/子工具及模型证据接纳均补封存检查；输入/取消保留精确旧回执读回，新输入拒绝。封存作用域为原Agent命名空间加thread_id，不声称隔离持有任意存储写权限的可信SDK调用方。
- 原始4个新单元测试函数已通过。追加第5个用例复现旧模型证据已成功、最终管理ACK丢失、后续运行被封存时，合法旧回执被封存检查误拦（closed-before.log）。修复为先校验原已接纳命令并读原closed结果，只有需要继续业务执行的路径检查封存；未接纳新命令仍拒绝。修复后完整相关内核80项通过；关闭workflow的SQLite回归36项通过；默认无SQLite/无workflow 18项通过。均无编译警告。
- 原nofy-shell离线构建与仓库外公共API消费者通过，原宿主仅使用runtime默认feature，未加载新SQLite模块。默认187项依赖边界、rustfmt及git diff --check通过；实际源码52条SQLite语句预编译、FIFO/行政优先/保存点回滚检查通过。230个Rust源文件冻结为/private/tmp/nofy-live-l2e5-source-manifest.json。
- 宿主与HTTP套件已编译，凭据5项通过。沙箱HTTP运行30项中6个辅助入口通过、24项在本地端口绑定时PermissionDenied（Operation not permitted），均未进入业务验收；host.log保留证据。新HTTP函数覆盖根/子Agent、有/无预算四种真实硬退出后的行政封存，尚未获得运行结果。
- 自动审批因登录令牌无法刷新而未执行缓存清理；保留缓存后沙箱离线构建成功。为真实HTTP端口申请的放行也被同一审批故障拦下，命令未启动，不是业务失败或安全拒绝，未采用其他接口绕过限制。必须恢复登录审批后完成HTTP运行；不因此改变测试或宣称平台闭环。
- 初版阶段源文件已暂存；追加兼容修复的git add被.git/index.lock写权限拒绝，目前追加源文件与文档存在未暂存内容。未提交、未推送。后续需恢复授权后暂存、运行完整HTTP、复核冻结与detect_changes；不能进入依赖本阶段的CompositionTransition。
- 已有日志：/private/tmp/nofy-live-l2e5-core-final.log、sqlite-final.log、default.log、original-host.log、consumer/result.json、host.log、closed-before.log。索引刷新与累计审计结果另记。


### L2e5索引审计与阻塞交接

- 本地图谱已写入114580节点、272731关系、6361社区和300流程；meta.incrementalInProgress为空，230个冻结Rust文件全部存在且fileHashes逐一匹配。MCP context已读取新Abandonment结构，证明当前图谱可读；AGENTS.md统计已同步。CLI随后因无权写/Users/mac/.gitnexus/registry.json退出1，故命令整体不是成功状态。未重定向HOME/registry或绕过限制。
- detect_changes(all)返回5775变更符号、32受影响流程、360映射文件，累计critical；范围是整条未提交分支，包含原Agent/宿主适配历史，不是L2e5单阶段。当前未追踪的closed_receipts.rs已纳入冻结、图谱和真实内核测试，但需要后续git add；索引审计不能代替它的暂存。
- 最终HTTP套件使用当前修复源码再次完成--no-run编译，无警告；实际端口测试仍受限。原宿主与仓库外消费者已验证，源文件零漂移，暂存/未暂存diff格式检查通过。缓存未清理，磁盘剩余约1.5GiB；不得将缓存清理审批失败改写成已执行。
- 恢复登录审批后仅需先处理本阶段收尾：暂存新增兼容修复和文档；运行本地HTTP完整套件；在原路径完成GitNexus全局登记/刷新与detect_changes复核。HTTP失败须按实际证据修复，再进入L3。不得把现有激活指针或行政封存宣传为运行中组合更新，完整热更新和原编程预设最终矩阵仍未完成。


### L2e5权限恢复后的最终验收

- 权限环境更新后，冻结230个Rust文件仍零漂移。完整宿主35项全部通过：HTTP30、凭据5，无警告。新增放弃测试的根/子Agent、有/无预算四种真实进程场景通过，原模型请求计数保持1、后续工具效果0、预算和最后业务outcome保留、回执可重开。该结果也补齐L2e4初始归属修复后的完整宿主复验。
- 原新增兼容修复及文档已成功暂存；GitNexus强制纯索引重建与全局登记成功（index-final.log），114580节点、272731关系、300流程。此前权限失败保留作历史证据，当前不再是阻塞。
- 交付仍是阶段结果，运行中CompositionTransition、原编程预设最终矩阵等边界未变。用户随后取消固定500行约束；结构审查改按职责、依赖与可测性，继续L3安全停驻及版本转换。


### 结构质量规则调整：撤销固定行数拆分

用户更新规则，取消500行强制上限，改为代码简洁、职责合理和适当格式化。行数只作为审查线索，不能证明需要拆分；模块边界以职责内聚、依赖方向、公共契约、可替换性与独立测试为准。

此前按旧上限将22个文件提取为76个文件，虽然739个函数、180个类型和325个测试入口的语义token核对相同，但增加了内部可见性与条件编译导出成本；集中编译发现Goal测试支持函数的cfg导出缺失。为避免维护无必要结构，已精确恢复该阶段22个原文件，并移除54个本阶段生成文件，未触碰既有模块化功能和其他改动。

恢复后230个Rust源码摘要全部匹配此前已验收的L2e5清单。该清单对应内核80项、SQLite-only36项、默认18项、宿主35项，以及原宿主构建和仓库外消费的验证结果。机械拆分的失败日志仅为已撤回阶段证据，不代表当前代码仍有该错误。新补的Goal与外部执行器文件说明保留，并已改为实际当前布局。

下一步继续L3安全停驻和版本转换。将来仅在存在多职责、错误依赖方向或独立替换需求时提取模块，不按文件数量或行数验收模块化。


### 2026-10-30开发机迁移接续

当前分支research/modular-agent-framework，迁移目标origin=https://git.none.xz.cn/none/nofy-build.git。此次保存的是L2e5已验证阶段，完整运行中版本转换尚未实现。22文件的机械行数拆分已经完全撤回；后续保持职责内聚、接口清楚和代码简洁，不设固定行数上限。

已验证：相关内核80项、SQLite-only36项、默认18项、完整宿主35项（HTTP30、凭据5）、原nofy-shell构建、仓库外公共API消费与187项正常依赖边界。原源码清单230文件已在提交前逐一核对零漂移。日志和构建缓存位于旧机临时/忽略目录，不能作为新机依赖；新机以Git源码、Cargo.lock及rust-toolchain.toml恢复，重新生成索引。

接续优先：先设计并实现持久安全停驻，再做CompositionTransition。入口为agent/loop_host.rs、agent/execution.rs、context.rs、supervisor执行/任务/管理控制，以及host管理API。需要保留旧v1/v2快照、原提交摘要与初始输入证明；不能通过改写旧快照或清零预算实现更新。Agent恢复路径目前每次会提交检查点，停驻回执需考虑这一边界。模型/工具/Hook/上下文未完成工作须按原版本结算；真实转换需有独立幂等记录和故障窗口验证。

新机阶段检查：

```sh
cargo test -p nofy-agent-runtime --features sqlite,workflow --lib --test managed --test jobs --test program --test model_journal --test model_recovery --test governance_runtime
cargo test -p nofy-agent-host --test http --test credentials -- --test-threads=2
cargo check -p nofy-shell
python3 scripts/verify-agent-independent-consumer.py --output /tmp/nofy-independent-consumer
python3 scripts/check-agent-runtime-boundaries.py
```

首次构建需要下载锁定依赖，不强制offline。控制台展示层继续后置。其余未完成项以“当前交付边界”和常驻内核规范为准，不能把阶段提交当作最终平台验收。
