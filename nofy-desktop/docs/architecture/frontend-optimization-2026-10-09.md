# 前端架构审查与优化方案

状态：A0 模块盘点与 AST 依赖门已落地；A1/A2/A3 第一批迁移已完成，详见 [前端架构 v1](frontend-framework-v1-2026-10-09.md)。MCP/插件写入隔离与共享控件见 [v1.1](frontend-settings-domain-2026-10-09.md)。[对话局部订阅与基线](frontend-conversation-read-model-2026-10-09.md) 已交付 A3 首批；[长对话虚拟化](frontend-conversation-virtualization-2026-10-09.md) 已交付 A5 首批；[主界面状态模块](frontend-shell-module-2026-10-10.md) 已移除 App 全量订阅并接入侧栏/输入区/审批/队列边界；[设置模块](frontend-settings-module-2026-10-10.md) 已交付六分区注册、八类清单查询与统一未保存修改保护；[文件资源模块](frontend-file-module-2026-10-10.md) 已交付受限图片预览、变化失效与视图恢复；[架构收口](frontend-closeout-2026-10-11.md) 已交付设置命令门面、窗口布局/浮层及三次本机性能门；当前阶段完成情况与未覆盖边界按该文状态表。更新于 2026-10-11。
审查对象：本地 ZCode 3.14.3（ref-desktop，29628c9）与当前 nofy-desktop。
本文件是后续架构迁移的统一入口；现有功能验收仍以 docs/contract/frontend-acceptance.md 为准。

## 0. 不可变前提：内核独立，桌面与 TUI 是不同客户端

内核独立于桌面前端，拥有自己的 TUI。这是产品前提，不是本轮需要重新选择的方案。桌面负责客户端体验与宿主集成，不实现模型推理循环、工具调度、上下文压缩、权限执行策略或权威历史持久化。TUI 的交互语义可以作为参照，不得依赖 TUI 的界面代码作为桌面后端。

当前 `renderer/core` 名字容易引起误解：它指**客户端投影、读模型和协议命令适配**，不指 Nofy agent 内核。application 也只协调客户端用例，不拥有 agent loop。目录改名仅在后续迁移确有必要时单独实施，当前没有重命名符号。

```text
                  Nofy 独立内核 / agent runtime
                   会话事实、模型与工具执行、历史
                       /                 \
           内核自己的 TUI 客户端      ACP 服务入口
                                          │ stdio
                              Desktop main 连接/进程管理
                                          │ typed IPC
                              客户端协议适配与事件投影
                                          │
                              客户端用例、局部订阅、共享 UI
```

这是一张职责图，不声称 TUI 与桌面已经共享同一个常驻内核进程。现有桌面管理一个 stdio 子进程；能否跨客户端同时附着同一会话，需要内核能力与并发控制证据，不能通过 React store 或新增 IPC 自动实现。

### Codex 官方参照（2026-10-09 实查）

源码固定到 openai/codex 提交 `e45069d770c6d0b8984c58a6e7cbaf221ad37599`，本次读取的是公开 Rust/TUI/app-server 实现，不据此推断未公开的桌面 React 组件结构。

- [官方 App Server 文档](https://learn.chatgpt.com/docs/app-server)：客户端通过双向协议提交 thread/turn 命令、接收事件与响应审批；可生成匹配当前版本的 TS/JSON schema。
- [TUI 会话门面源码](https://github.com/openai/codex/blob/e45069d770c6d0b8984c58a6e7cbaf221ad37599/codex-rs/tui/src/app_server_session.rs)：AppServerSession 包装类型化请求，把 request/response plumbing 隔离在 App/ChatWidget 外。
- [TUI 启动源码](https://github.com/openai/codex/blob/e45069d770c6d0b8984c58a6e7cbaf221ad37599/codex-rs/tui/src/lib.rs)：AppServerTarget 有 Embedded、LocalDaemon、Remote。逻辑接口统一不意味着强制另起一个服务进程；Nofy 保持既定独立进程边界。
- [App Server 处理器](https://github.com/openai/codex/blob/e45069d770c6d0b8984c58a6e7cbaf221ad37599/codex-rs/app-server/src/message_processor.rs)：服务端使用 codex_core::ThreadManager，agent 运行事实归服务端。

应借鉴的是服务边界、类型化客户端门面、事件驱动投影和能力协商。不要复制 Codex 方法名、初始化步骤或取消语义；我们的 ACP 契约继续以本地内核源码、生成 schema 与实测为准。

### 对 A0–A6 的补充约束

1. A0 增加客户端/内核职责矩阵与能力清单：协议版本、方法支持、配置写入、历史读取、重连恢复分别记录。未知能力显示 unsupported，不通过前端补造内核行为。
2. A1 的 sessions/models/mcp 门面相当于类型化客户端入口；页面不能组装线路字段。把代理转发与界面应用用例分开，不把 agent 决策搬进 application。
3. 客户端 reducer 保存可重建的投影，不建立第二份权威会话历史。重连以实际 session/load/事件回放重建，使用 transportEpoch 防旧请求响应污染。
4. pending approval 要绑定连接代际和会话身份，处理断连、窗口关闭与取消；按钮操作与内核最终完成事件分别建模，不用“点击已发送”冒充“执行已完成”。
5. main 只管理自己启动的子进程与连接。未来若支持外部进程附着，必须区分 owned/attached，关闭窗口不得杀死外部共享服务；此项现在是设计约束，不是已实现能力。
6. 模型 native JSON writer 是现有协议缺口的宿主适配例外，不升级为第二套配置系统。保留单一配置与当前保护，登记能力缺口；未来内核提供等价写入时再迁移，不在本轮修改内核。
7. 必须验证无 GUI 时 TUI 仍可独立使用、桌面不依赖 TUI 渲染、前端协议适配可被模拟服务测试。共享历史、并发写配置及同时运行同一会话另设内核验收，不默认支持。

## 桌面安装包补充证据

已只读分析本机 Codex 26.930.51102 build 13100 的桌面壳。详见 [桌面壳结构分析](codex-shell-analysis-2026-10-09.md) 与 [证据清单](codex-shell-evidence-2026-10-09.json)。这份证据确认了集中宿主服务入口、查询与订阅分工、对话层次、动态高度虚拟化、设置路由与 dirty-close 处理；不代表恢复了官方源码结构。

A1 增加设置查询身份与失效契约；A2/A4 增加 SettingsSection 注册表与统一未保存修改处理；A3/A5 明确 Conversation 容器、轮级读模型、RowView 和虚拟列表的职责。保留当前内核、ACP 与 reducer，不复制 Codex 的多产品范围或大公共包。

## 右侧工作区专项研究

[Codex 右侧工作区调研](codex-right-workspace-research-2026-10-09.md) 已完成静态分析与截图审查。纳入现有 A0/A1/A2/A4/A5：文件资源身份与查询代际、PanelTabRegistry、资源 Tab 生命周期、正文与树并列布局、只读 Markdown/源码切换。文件编辑作为写入契约完整后的独立能力切片，内核保持独立。v1 已迁移文件读取、搜索与查询生命周期；资源标签和只读布局已在 [v1.2](frontend-file-workspace-2026-10-09.md) 落地；通用 PanelTabRegistry 待迁移。

## 1. 结论

ZCode 的方向合理：平台能力与共享 UI 分离，服务有接口，会话使用独立投影和生命周期管理，长列表虚拟化，控件与主题统一。它不是一个应当原样复制的目标：UI 根组件、会话 Pane、设置页仍集中大量编排，服务上下文允许组件取得广泛服务，架构检查尚未覆盖全部 UI。

Nofy 保留现有 Electron + React + TypeScript + ACP + reducer，不更换框架，不引入另一套状态源。目标是建立明确的应用层、领域公开接口、局部订阅和完整共享控件入口。先阻止新增越界，再渐进迁移；不做全树重写。

## 2. 源码证据与判断

路径相对于仓库根目录。行数只是定位复杂模块的信号，不能独立证明设计好坏。

| 对象 | 证据 | 判断 |
|---|---|---|
| ZCode 平台分离 | packages 分为 rpc、services、client、server、ui、web、desktop | 适合多平台产品；Nofy 目前不需要复制全部包 |
| ZCode 设计体系 | ref-desktop/DESIGN.md；packages/ui/src/components/ui；settings/SettingsFormActions.tsx 等 | 主题、控件、设置布局均有复用，不应误判为全靠散落样式 |
| ZCode 会话数据 | v4/sessionDataLayer.ts 的 acquire/release 与 keep-warm；useConversationProjection.ts | 会话生命周期与显示分离，可借鉴；不能把 ZCode 的订阅协议照搬到 ACP |
| ZCode 长对话 | v4/ConversationTimeline.tsx 使用 useVirtualizer；ConversationTurnNavigator.tsx 独立虚拟化 | 比我们的整段整理与渲染更完整；未做同机性能对比，不宣称速度差值 |
| ZCode 编排集中 | App.tsx 1280 行，SettingsPage.tsx 1962 行，v4/SessionPane.tsx 4834 行；根文件有 max-lines 豁免 | 大量功能形成集中修改点；需按领域职责拆分，不能仅拆 JSX |
| ZCode 边界治理 | architecture-policy.yaml：managedOnly:true；ui、desktop、services 等 managed:false | 已有治理机制，但目前声明的严格规则没有覆盖所有这些模块；不能说已全量强制 |
| Nofy 出站纪律 | core/effects.ts 区分 request/notify/respond，core/project.ts 投影，seam/runtime.ts 装配 | 保留，尤其取消、队列、审批与回放语义不能因重构改变 |
| Nofy 根编排 | features/shell/App.tsx 989 行；useFrameState(runtime.store) 订阅整份状态；导航、草稿、Git、上下文轮询等混合 | 16ms 合并解决频繁通知，尚未解决订阅粒度和职责集中 |
| Nofy 接口过宽 | core/runtime.ts 同时暴露 bridge、port、store、effect、native 配置能力 | 页面虽然很少直接使用 port，接口仍提供绕过入口的可能 |
| Nofy 协议下沉不足 | McpSettings.tsx 组装 session_id/server_name 并解析 setup/status；通用 service/request 接收 Record<string,unknown> | 方法名集中不等于业务契约集中；协议字段与失败处理仍进入界面 |
| Nofy 样式迁移不完整 | MCP/插件等使用 set__write 与原生控件；styles.css 2643 行；ui/readers.ts 混合多领域解码 | 本轮已有共享层，但仍需按职责迁移；CSS 同选择器检测无法识别不同类名的语义重复 |
| Nofy 依赖检查 | test/dep-guard.test.ts 正则扫描 import，core 规则未禁止 React/main；不检测领域依赖循环 | 有基础保护，需升级为 TypeScript AST 和解析后依赖图 |

## 3. 目标结构与依赖方向

采用现有目录演进，不为整齐而批量搬家。新增 application 承载用例和界面订阅；core 保持无 React 的客户端事实投影与协议适配；seam 保持装配与传输适配。

```text
renderer/
  features/                 页面、领域视图、局部交互草稿
    shell/                  窗口布局、导航呈现
    conversation/           消息、输入、查找、轮级操作
    approvals/              审批呈现与表单
    settings/               分区与资源表单
  application/              用例与 React 订阅，不含线路字段
    sessions/               导航、发送、删除、fork、回退
    conversation/           活跃会话订阅、行模型与索引
    settings/               模型、MCP、插件查询与写入
    workspace/              草稿、偏好、Git/上下文查询生命周期
    contracts/              领域门面、宿主端口、统一结果类型
  core/                     客户端 reducer、投影、解码与协议命令
  seam/                     IPC/ACP 适配与唯一运行时装配
  ui/                       主题、基础控件、内容渲染、通用布局
main/                       进程、文件、凭据与配置写入
preload/                    最小 typed IPC bridge
```

允许的方向：features → application 公开入口 + ui；application → core 公开入口 + 宿主端口类型；seam → application/core + preload；main 不依赖 renderer。
ui 的基础控件不引用 features/application/seam。React 订阅留在 application；core 不引用 React、DOM、main 实现或页面。
跨领域调用由 application 用例协调；feature 不深层导入另一个 feature 的内部文件。现有无副作用模型允许暂时继续存在 features 内，按实际复用需求迁移。

共享样式仍沿用 ui-style-system.md；领域样式负责布局，控件负责状态与外观。不要让 CSS 目录成为第二套业务架构。

## 4. 状态所有权

| 状态 | 所有者 | 页面获取方式 |
|---|---|---|
| 内核连接、会话、消息、队列、审批 | core 投影 store | application selector/read model，只读 |
| 主题、字号、语言、草稿、归档/分组偏好 | application workspace 偏好服务 | 指定的偏好 hooks 与命令 |
| 模型配置、MCP/插件读取结果 | application settings 查询状态 | 按配置/会话身份缓存的资源快照 |
| 编辑草稿、弹窗开关、展开与查找输入 | feature 局部 React 状态 | 局部拥有，必要时通过领域接口共享 |
| 密钥、配置备份与写入事务 | main native controller | 只接受受限写入；读取不回显密钥 |

“UI 不拥有内核事实”不意味着所有 UI 状态必须塞进全局 store。禁用两份消息事实、跨页面复制服务缓存、localStorage 保存凭据。

## 5. 接口与数据流

页面只调用窄领域接口，例如 sessions.send/activate/rewind、models.read/save、mcp.upsert/toggle、plugins.install/uninstall。每个接口定义确定参数、返回值和能力限制，不提供任意 method+params 逃生口。

底层现有 runtime.effect 继续作为协议强制点；通用 service/request 在迁移后只允许内部命令适配器使用。线路字段与响应解码从设置组件移到 core 对应领域适配器。禁止建立只是转发同一大 Runtime 的假门面。

入站：main/IPC → seam → core 投影 → application 选择器 → feature。
出站：feature 意图 → application 用例 → core 命令/宿主端口 → seam/main → 内核 → 读回。
原生模型保存保持当前 busy/approval gate、CAS、stop+await、单内核重启和重新握手；成功以写入与读回为准，不乐观伪造内核生效。

异步查询以 cwd/sessionId/transportEpoch/configRevision 中实际需要的字段组成身份。身份变化后旧响应不能覆盖新页面；退出时释放计时器、监听和查询。仅当现有传输支持取消时取消，其他请求按身份丢弃迟到结果。

错误结果使用可判别类型（validation、busy、conflict、disconnected、unsupported、remote）；UI 决定文案，适配器保留诊断原因但不泄漏密钥。不要只靠字符串匹配判断错误种类。

## 6. 对话与性能策略

保留同步 reducer 与 16ms UI 合并；改为共享调度后的选择器快照，避免每个组件创建独立调度器。快照引用稳定，选择结果未变化不通知。

Sidebar 订阅会话目录，Conversation 订阅活跃会话，Composer 订阅发送能力/模式/模型，ApprovalHost 订阅当前审批。App 只订阅窗口布局与路由所需状态，不接收完整 AppState。

先做稳定 block/turn 索引与行级更新，再引入可测量高度的虚拟化列表。视图卸载不等于释放内核会话事实；不复制 ZCode 的订阅 RPC。跨轮折叠、查找跳转、底部跟随、用户向上阅读和高度变化均需保留。

基准：同一机器、窗口、构建、固定回放，分别测试 1000/10000 块、流式追加与 A/B 会话切换。记录 DOM 行数、各区域 render 次数、输入事件到下一帧耗时、长任务、内存与跳转正确性。先记录基线再设性能预算，不用单次通过替代 p95 证据。

必要验收：非活跃会话追加不重渲活跃消息区；消息追加不重渲静态设置页；未修改消息行不因单块追加重新解析 Markdown；DOM 行数受视口与 overscan 控制，不随全部历史等比例增长。

## 7. 开发治理

1. 每个领域一个 public.ts，公开能力和类型；内部文件禁止跨领域深层导入。
2. 更新 test/dep-guard.test.ts 为 AST 与解析后路径检查，覆盖单双引号、别名、动态导入、type import、side-effect import 与循环依赖；运行时依赖和类型依赖分开判定。
3. 对存量违规记录具体 import 边和原因，只允许数量下降；新文件从第一天受规则约束。不得使用整目录永久豁免。
4. 新组件不得添加 set__write 兼容类、复制按钮/输入/弹窗样式或自行读写窗口偏好；共享组件扩展必须有真实使用点。
5. 文件约 400 行作为审查提示，约 800 行必须解释职责与拆分计划；生成物和字典除外。功能耦合比行数更重要，不为过线机械拆碎。
6. 每个开发切片声明状态所有者、公开接口、依赖方向与验收。先运行 GitNexus upstream impact 再修改既有符号，HIGH/CRITICAL 先说明风险；提交前 detect_changes。
7. 本次审查未修改函数、未提交；迁移方案里的风险是待验证判断，不冒充已运行的 symbol impact 结果。

## 8. 迁移顺序与阶段出口

所有阶段保持应用可运行。每次修改只迁移一个职责，保留原行为夹具与 GUI 作为对照；失败时撤回该切片，不同时修改内核协议。完成对应阶段前，不在未收口的旧入口继续叠加新功能。

### A0：边界与性能基线

修改 test/dep-guard.test.ts；新增 scripts/check-architecture.ts、architecture-policy.json 与 test/architecture-policy.test.ts。TypeScript 现有依赖可用于 AST，无需先换工具链。
先用故意违规夹具验证越界/循环/别名会被拒绝，再登记现有违规边。将 architecture:check 加入根 verify 与 CI。
新增 e2e/conversation-performance.mjs，复用确定性模拟器记录基线；不读取真实凭据。
出口：新违规必失败，存量预算可审计，已有 311 单测与 33 GUI 行为保持，产出基线 JSON。

### A1：领域门面与协议隔离

新增 application/contracts、application/sessions/public.ts、application/settings/public.ts；从 core/runtime.ts 的大接口中划分会话、配置与宿主能力。
移动设置响应解码到 core/settings 领域文件；迁移 McpSettings、PluginSettings，再迁移 ProviderSettings。保留底层 effects 请求/通知分派。
测试文件：session-actions、settings-writes-model、model-config、transport-epoch 与新增领域命令契约测试。
出口：已迁移设置组件无 session_id/server_name/setup 线路解析、任意 service/request、bridge/port/store.dispatch；忙碌、冲突、迟到响应行为不变。

### A2：根编排收口

从 features/shell/App.tsx 迁移草稿与偏好到 application/workspace，Git/上下文轮询到资源 hooks，导航与取消用例到 application/sessions。
建立 ShellLayout/WorkspaceContent/OverlayHost；App 只完成装配与布局。现有 useWorkspace/useSessionNavigation 按状态所有者演进，不复制第二套导航实现。
出口：App 无协议请求、持久化写入、轮询计时器或全局 store.dispatch；项目/草稿/最后会话恢复的 GUI 回归通过。

### A3：局部订阅与稳定行模型

修改 core/store、ui/frameStore/useFrameState；新增 application/conversation/selectors 与订阅 hooks；逐个迁移 Sidebar、Composer、ApprovalHost、Conversation。
从 Spine 的每次全段整理改为按会话/块版本更新的索引；不缓存可变事实，不丢回放通知。
出口：选择器引用稳定；后台会话不触发前台无关重渲；1000 块行为、重连 epoch 与审批旧请求保护通过。

### A4：共享 UI 完整迁移

统一 ui/public.ts 与表单/资源布局组合；迁移 MCP、插件、通用设置、模型设置与审批控件。协议解码不得回流 ui/readers。
按领域迁走 styles.css 里剩余页面布局，删除没有调用点的兼容 set__write；增强样式检查，但不宣称能自动识别所有视觉语义重复。
出口：目标页面全部使用共享控件，兼容类无调用点；深浅主题、键盘、1024 窗口与表单错误态截图验收。

### A5：长对话虚拟化

在 A3 稳定行模型上替换 Spine 的列表承载；轮级导航与查找按索引定位并测量。虚拟化库选型单独记录依赖成本与官方 API 核实，不直接复制上游实现。
出口：10000 块 DOM 不线性增长；查找跳转、折叠、高度变化与底部跟随通过；同机基准相对 A0 有明确改善且输入无回归。

### A6：治理关闭与交付

删除迁移过渡接口，检查领域依赖图、资源释放和存量违规预算；更新 ipc-boundary.md、ui-style-system.md 与 frontend-acceptance.md。
执行 pnpm verify、三组 Electron GUI、性能基准和本地 package/verify:package。协议适配改变时增加隔离真实线路验收。
出口：边界规则在 CI 强制，证据可复跑；未测平台、远端 CI 和公开签名仍明确保留边界。

## 9. 本轮决策与范围

本轮交付审查和迁移方案，不把建议目录当作已完成重构。优先 A0→A1→A2→A3；A4 在接口稳定后迁移，A5 必须依赖 A3；A6 收尾。
借鉴 ZCode 的设计系统、领域服务、会话生命周期与虚拟化；不复制它的庞大服务访问器、旧新状态混合和根编排集中。当前核心问题是职责与依赖，而不是选择另一套前端框架。
