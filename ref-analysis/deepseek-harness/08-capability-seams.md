# deepseek-harness 深度解析 08:capability seam 全景

一句话概述:dsh 把每种能力做成"Service Definition / Provider / Consumer"三角色的 seam,Definition 持有 `ctx.<key>` 与词汇类型、Provider 可换、Consumer(多为模型工具)只注入服务;本文逐一核对 12 个主要 seam 的三角色落点,并以图数据与源码为准修正文档表述。

> 路径均相对 `ref/deepseek-harness/`。服务拓扑的自动生成图见 `docs/capability-seams.md`(由 `scripts/gen-doc-graphs.ts` 生成);本文以各包 `src/index.ts` 为准。

---

## 1. 三角色定义(以源码核实)

`docs/glossary.md` 的 seam 词条与 `docs/architecture.md` §Capability seams 给出同一定义,要点:

- **seam = 可替换能力**,必须三角色齐全;单一角色不是 seam,"添加能力 = 设计全部三个角色";
- **Service Definition**:持有 `ctx.<key>` 的 Cordis `Service`,**同时拥有词汇类型**。形态有两种:抽象类(如 `ShellExecutor`、`FileSystem`、`JobRegistry`——子类即 provider)或**具体注册表**(如 `WebRuntime`、`SkillRegistry`、`LlmRuntime`——provider 向它注册)。glossary 特意强调"never a TypeScript interface"——接缝是运行时对象,不是纯类型;
- **Service Provider**:实现抽象类或向注册表登记;
- **Consumer**:注入服务的一方,典型是模型面向工具。

两条结构性补充:glossary 明说角色通常分包,但**一个包可兼任多角色**("dsh-llm owns its Service Definition and Consumer"——本文按源码把消费者理解为 agent-loop 经 `llm/stream` 与 `ctx.llm` 消费);`packages/shell` 被点名为规范例子(`dsh-shell` Definition、`dsh-bash-local`/`dsh-bash-sandbox` provider、`dsh-tool-bash` consumer,见 06 篇)。图 atlas(`ref-analysis/deepseek-harness/00-graph-atlas.md` §3)给出三角色在调用图上的投影:**每个 seam 的错误类型+词汇类型才是全包消费点**(`FsError` 入度 56、`LlmError` 48),实现可换、词汇稳定;且包间直接 CALLS 近零——一切跨包交互走 cordis 服务注册与类型化事件。

单服务 seam 与多 provider seam 是两种拓扑:**单服务**(shell、subprocess、fs、sandbox)第二个 provider 加载即抛重复注册错;**注册表式**(llm、web、skill、lsp、subagent、terminal 后端)多 provider 共存、按名或按扩展名选择。下文每个 seam 标注属于哪种。

三角色在 cordis 机制上的落点也值得钉住:Definition 经 `declare module '@deepseek-ai/cordis' { interface Context { <key>: T } }` 把服务键合并进全局 Context 类型;Provider 通常是带 `static inject = [...]`(依赖声明)与 `static Config`(schemastery schema,配置目录静态遍历它)的 `Service` 子类,注册生命周期绑在加载它的 fiber 上(`ctx.effect` 作用域拆除);Consumer 在自己的 `apply`/`inject` 里拿服务。词汇类型与错误类型必须住在 Definition 包——这样消费者只 import Definition 就够了(`packages/README.md:67`:"Extension plugins depend on Service Definitions, never concrete providers")。

在代码里识别三角色有可靠的命名/形态信号:

- **Definition**:包内 `src/index.ts` 有 `extends Service` 且 `super(ctx, '<key>')`,伴随 `declare module '@deepseek-ai/cordis' { interface Context { … } }` 与 `interface Events` 声明合并;抽象类构造器里防直接加载的 throw(jobs)也是信号;
- **Provider**:类声明带 `static inject = [...]` 与 `static Config`(schemastery schema),或 `apply()` 里调用注册表的 `register*`;
- **Consumer**:`tool-*` 包名的模型工具(`defineTool` + `ctx.tools.register`),以及 `inject` 列表里引用服务键的非工具插件(如 compaction-basic 注入 `tokenMeter`)。

主要 seam 速览(均为源码核对后的落点):

| seam | ctx 键 | Definition 形态 | 内置 provider | 模型工具 |
|---|---|---|---|---|
| fs | `ctx.fs` | 抽象类 `FileSystem` + 3 事件 | fs-local / fs-sandbox / fs-e2b | read, write, edit, read_image, glob, grep, str_replace_editor |
| web | `ctx.web` | 具体注册表 `WebRuntime`(双表) | web-search-{deepseek,exa,perplexity}, web-fetch-http | web_search, web_fetch |
| skill | `ctx.skills` | 具体注册表 `SkillRegistry` | skill-filesystem, skill-badge | skill |
| mcp | (无服务) | 桥插件注册进 `ctx.tools` | mcp-client(每 server 一实例) | mcp__&lt;server&gt;__&lt;tool&gt; |
| lsp | `ctx.lsp` | 注册表 + 扩展名路由 | lsp-stdio | lsp(四操作) |
| workflow | `ctx.workflowEngine` | 抽象类 `WorkflowEngine` | workflow-worker-thread | workflow, ralph |
| subagent | `ctx.subagents` | 命名 provider 注册表 | spawn/fork-in-process, acp, dsh-sdk, codex, claude-code | subagent 族 |
| schedule | (agent 作用域运行时) | 单包族 `ScheduleRuntime` | 内置(事件日志驱动) | schedule_create/list/delete |
| jobs | `ctx.jobs` | 抽象类 `JobRegistry` | jobs-local | job_output, job_list, job_kill |
| attachment | `ctx.attachments` | 抽象类 `AttachmentStore` | attachment-local | (经 read_image 间接) |
| compaction | `ctx.compaction` | 抽象类 `CompactionEngine` | compaction-basic(+ tool-result-pruner 邻接) | (经 /compact 命令) |

---

## 2. fs——文件系统(单服务)

| 角色 | 落点 |
|---|---|
| Definition | `packages/fs/fs/`:`FileSystem extends Service`(`ctx.fs`)+ 词汇(`FsTarget`/`FsVersion`/`FsError`)+ 三个策略事件 `fs/write-intent`、`fs/edit-intent`(waterfall 单槽)、`fs/observed`(emit) |
| Provider | `fs-local`(本地机制全集);`fs-sandbox`(`SandboxedFileSystem extends LocalFileSystem`,只加变更口策略围栏,读直通);`e2b/fs-e2b`(远程) |
| Consumer | `tool-fs`(`read`/`write`/`edit`/`read_image`)、`tool-fs-search`(`glob`/`grep`)、`tool-str-replace-editor`(`str_replace_editor`);非工具消费者:`skill-filesystem` 经 `ctx.fs` 读技能正文、`lsp-stdio` 经 `ctx.fs` 读源码 |

Definition 的契约要点:目标必须**跨别名保持身份**(`resolve()` 产出的 `FsTarget` 带稳定 `targetKey`,同一文件任何路径形式都得到同一 key——观察策略的 WeakMap 就按它索引);读取只暴露常规 UTF-8 文本或类型化错误,列表稳定且无内容,变更原子;`editText` 留在后端,让版本检查、字面匹配、重写共享一个临界区;可选守卫(stale 保护)不改变无守卫 provider 的契约。

换 provider 的影响:挂 `fs-e2b` + `subprocess-e2b` 即把全部文件工作与 bash/PTY/LSP 整体迁入 E2B 沙箱,**消费者零分叉**(06 篇 §7)。`fs-sandbox` 与 `fs-local` 的替换只改变两个变更口的策略,工具层不动;拒绝走结构化 `FS_SANDBOX_DENIED`,升级重试逻辑在工具层。`fs-observation-policy` 是纯事件插件(不注册服务):不挂它,provider 保留无条件变更行为。

## 3. web——搜索与抓取(注册表式,双 sub-seam)

| 角色 | 落点 |
|---|---|
| Definition | `packages/web/web/`:**具体注册表** `WebRuntime extends Service`(`ctx.web`),`registerSearchProvider()`/`registerFetchProvider()` 两张独立注册表,重复 id 拒绝 |
| Provider | 搜索:`web-search-deepseek`(Anthropic 兼容 Messages API + 原生 `web_search_20250305`,复用 `DEEPSEEK_API_KEY` 但**不复用** `DEEPSEEK_BASE_URL`——搜索与 chat-completions 基址不同)、`web-search-exa`、`web-search-perplexity`;抓取:`web-fetch-http`(匿名公共 HTTP,函数/命名空间插件,无默认导出) |
| Consumer | `tool-web`(`web_search`/`web_fetch`) |

选择规则是注册表式 seam 的范本:配置指定的 provider 必须可用;未配置时**要求恰有一个可用 provider**——选择永不依赖注册顺序。配置本身只有两个可选键(`static Config`:`searchProvider`/`fetchProvider`),注释强调它们是显式指名,"不是隐藏的优先级链"。工具启用与 provider 可用解耦:无 provider 时工具仍然可见,执行期才抛结构化错误。换 provider 只动搜索/抓取方言,工具 schema、限额、提示词不动。

## 4. skill——技能目录(注册表式)

| 角色 | 落点 |
|---|---|
| Definition | `packages/skill/skill/`:具体注册表 `SkillRegistry extends Service`(`ctx.skills`)——合并各 provider 目录、按名解析胜出技能、向消费者暴露摘要与定义;`ScopedLayers` 按 scope 分层 + collect 缓存(`collectCacheMaxEntries` 配置上限)+ `revision` 计数失效;provider 贡献以 `register()` 进入,带唯一 provider 名与注册顺序 |
| Provider | `skill-filesystem`(从 project/custom/user 三类根发现目录束与平铺 Markdown,解析 YAML frontmatter,正文经 `ctx.fs` 读);`skill-badge`(内置 bundled 技能) |
| Consumer | `tool-skill`(模型工具 `skill` + 耐久的会话技能目录,参与 `PreStepDecision`) |

换 provider 的影响:技能来源(文件系统/远端/内置)可替换,但"按名取胜出者 + 摘要先行、正文按需加载"的消费协议不变。注册表的 scope 分层意味着同一技能名在不同作用域(项目/用户)可以有不同的胜出者——解析规则归 Definition,发现机制归 provider。

## 5. mcp——外部工具桥(无 Definition 服务的桥插件)

`packages/mcp/mcp-client/` 是**桥插件而非经典三角色 seam**:没有 `ctx.mcp` 服务,它把外部 MCP server 的工具注册进**工具 seam**(`ctx.tools`),公开名 `mcp__<serverName>__<rawName>`(serverName 约束 `[A-Za-z0-9_-]{1,32}`,刻意压在公开工具名预算之内)。配置是两种传输的判别联合:`stdio`(拉起子进程,`command`/`args`,`env` 在**洗刷后的环境之上**合并——与 subprocess seam 的凭据纪律同源)或 `streamable-http`(`url`)。一个插件实例连一个 server,多 server 在 `cordis.yml` 加载多实例;`serverName` 预留按 `ctx.root` 全局登记(多 app 共存),生命周期 effect 作用域:拆除即断连、反注册全部工具、释放命名空间预留;HMR 热换保持同名。换"provider"(即换 MCP server)是纯组合操作;它复用的是 tools seam 的守卫执行管线,不新增词汇。

## 6. lsp——语言服务(注册表式,扩展名路由)

| 角色 | 落点 |
|---|---|
| Definition | `packages/lsp/lsp/`:`ctx.lsp` provider 注册表 + 每查询、顺序无关的选择;`registerProvider` 原子预留品牌 id 与**独占扩展名集合**(冲突/非法则什么都不发布);seam 只暴露 `goToDefinition`/`findReferences`/`goToImplementation`/`hover` 四个操作,**没有 JSON-RPC 逃逸舱** |
| Provider | `lsp-stdio`:命名 server 命令表,每表项注册一个隔离 provider;按规范 workspace 目标懒启动、single-flight 一个 server 进程;读源码经 `ctx.fs`、起进程经 `ctx.subprocess`(因此本地/远程共享同一 host) |
| Consumer | `tool-lsp`(单个只读工具 `lsp`,四操作;1-based UTF-16 坐标转 0-based;强制会话 workspace,无回退) |

provider 内部有两个容错机制值得点名(`lsp-stdio/src/index.ts`):**transient-open**——查询涉及的文件若未在 workspace 打开,临时打开再查;**一次性传输替换**——选中的传输在下一次只读查询之前或期间失败,就替换一次并透明重试(只读查询才允许,写路径不做);替换前要先等旧槽位静默,保证所有权检查不被并发替换绕过。拆除时逐 provider/逐实例收集 teardown 失败并聚合上抛(`throwTeardownFailures`)。

换 provider 的影响:扩展名→server 的映射与传输可换,四操作词汇不变;因为 lsp-stdio 走 `ctx.fs`/`ctx.subprocess`,e2b 组合下 LSP 自动进沙箱。注意一处文档与源码不符:`docs/capability-seams.md` 把该 provider 写作 `lsp-local`,源码包名实为 `@deepseek-ai/dsh-lsp-stdio`(目录 `packages/lsp/lsp-stdio/`)——以源码为准。

## 7. workflow——编排引擎(单服务引擎 + worker-thread provider)

| 角色 | 落点 |
|---|---|
| Definition | `packages/workflow/workflow/`:抽象类 `WorkflowEngine extends Service`(`ctx.workflowEngine`),唯一抽象方法 `start(request): WorkflowRun`;`WorkflowRun.result` 永不 reject,消费者可 `cancel()` 且必须幂等 `dispose()` 等待脚本与子代理静默;生命周期事件**只读**(`workflow/start`、`workflow/phase`、`workflow/log`、`workflow/agent-start`、`workflow/agent-end`、`workflow/end`),不暴露运行控制 |
| Provider | `workflow-worker-thread`:每次运行在新 worker 线程的**可逃逸 vm context** 里跑模型写的 JS 脚本,把脚本的 `agent()` 调用桥接到宿主 `ctx.subagents`(默认 `spawn` provider,可配);并发上限默认 `min(16, max(1, cores-2))`,总 `agent()` 调用上限默认 1000(失控循环 backstop);注释自陈"是 containment,不是 security boundary" |
| Consumer | `tool-workflow`(模型工具 `workflow`:等 `run.result`,总是 dispose,非 completed 原因变工具错误);`tool-ralph`(`ralph`/`ralph-loop`,循环编排的专门消费者) |

Definition 的事件面是观察协议的样本:六个 `workflow/*` 事件全部 emit 模式、只携带 info 快照(`WorkflowRunInfo`/`WorkflowAgentInfo`/`WorkflowResultInfo`),UI 与遥测从事件重建运行时间线,没有任何"控制句柄"泄漏给监听者——运行控制只存在于 `WorkflowRun` 持有者手里。

换 provider 的影响:脚本语言/执行容器可换(如换隔离更强的引擎),模型可见的 schema 与运行生命周期不动——tool-workflow 注释明说"强化引擎换入时模型看到的东西不动"。

## 8. subagent——子代理(注册表式,能力即字段)

| 角色 | 落点 |
|---|---|
| Definition | `packages/subagent/subagent/`:`ctx.subagents` 命名 provider 注册表 + **能力校验的异步 start API**。与 bash seam(每 context 一个执行器)相反,这里**多 provider 共存、按名选**;形状刻意模仿 `LlmRuntime.registerAdapter`。provider 在返回 run 前必须建好孩子(fulfillment 即唯一的发布与所有权转移边界);`capabilities` 字段上"存在即能力",缺能力报"capability absence, not an error" |
| Provider(谱系) | `subagent-spawn-in-process`(同 cordis context 里全新子 Agent:自己的会话/系统提示,**零父上下文**,最便宜);`subagent-fork-in-process`(以父会话日志前缀**播种**的子 Agent,种子截至最后一条 `turn/end`——当前工具调用 turn 不平衡不可重放);`subagent-acp`(独立进程/会话/模型/工具,走 ACP,从 `request.parent` 只读 workspace cwd);`subagent-dsh-sdk`(独立进程里的完整 dsh 运行时,stdio JSON-RPC + TS SDK 客户端);`subagent-codex`(官方 `codex app-server --stdio`,thread 存在后才发布);`subagent-claude-code`(官方 Agent SDK,SDK 拉起的真 CLI 置于共享 subprocess owner 之下) |
| Consumer | `tool-subagent`(前台收集后必 dispose;一次性调用用普通 Task,可续调用 `startContinuable()`)、`tool-subagent-control`、`tool-subagent-report`、`workflow-worker-thread` 的 `agent()` 桥 |

能力词汇是封闭的 `SubagentCapabilities`(`types.ts`):`outputSchema` / `depthLimit` / `toolFilter` / `persona` 四个布尔位——start 请求想要的每项能力都必须被命名 provider 持有,缺则拒绝("capability absence, not an error")。一次性 start 请求由工具层从模型的 `{ description, prompt }` 加自身配置构建,服务负责对照 provider 校验。

这是全仓 provider 谱系最宽的 seam:从"同进程新 Agent"到"另一个产品的委托回合",接口不变。换 provider 改变的是子代理的**物理与身份边界**,不是委托协议。

## 9. schedule——提醒(单包族,事件日志驱动)

`packages/schedule/schedule/`:agent 作用域的耐久**one-shot 与 fixed-rate 提醒**,直接建在会话事件日志上(无独立存储 seam;持久化借 `session-persistence`)。`ScheduleRuntime` 每步做 preflight/fold/arm/dispatch:选一条到期 one-shot、一个完整 fixed-rate 批次或下一次唤醒;决定落 `schedule/change` 会话事件(类型声明进 `SessionEventMap`,因此可回放、可跨传输重放)。fixed-rate 决定失败只 warn 不炸(`renderThrown` 记日志)。消费者即自带工具:`schedule_create`/`schedule_list`/`schedule_delete`。Definition/provider/consumer 同包——这是 glossary"一个包可兼任多角色"的实例;换"provider"意味着换整个插件。

## 10. jobs——后台作业(单服务注册表)

| 角色 | 落点 |
|---|---|
| Definition | `packages/jobs/jobs/`:抽象类 `JobRegistry extends Service`(`ctx.jobs`)——job id、会话作用域访问、生命周期状态、完成监听、owner 清理;**producer 保留自己的执行资源**,注册表只管身份与可见性。直接加载抽象包会在构造时抛错提示"load an implementation such as dsh-jobs-local" |
| Provider | `jobs-local`(进程本地注册表) |
| Consumer | `tool-jobs`(`job_output`/`job_list`/`job_kill`);producer 侧:tool-bash 后台调用、tool-terminal 后台 send(经 `declare module` 扩展 `JobKindMap` 注册 `pty-send` 种类) |

`JobRegistry` 的抽象面即 job 的完整访问路径:`start(spec): JobId`、`list(caller?)`、`get(id, caller?)`、`read(id, caller?)`(增量输出)、`kill(id, caller?, reason?): 'requested' | 'already-finished'`、`wait(id, timeoutMs, …)`、`onJobDone(listener)`。`caller` 参数是会话作用域授权的钩子——实现按调用 agent 过滤可见性。

设计意图(shell seam 注释明说):job id、所有权、轮询、通知归 jobs,**让执行器与会话解耦**——后台进程的生命周期边界是 `ctx.subprocess` 的拆除而非执行器重载。换 provider 影响 job 的存储/可见性范围,不影响 producer 的执行语义。

## 11. attachment——耐久附件(单服务)

| 角色 | 落点 |
|---|---|
| Definition | `packages/attachment/attachment/`:抽象类 `AttachmentStore extends Service`(`ctx.attachments`)——耐久二进制附件存储;`AttachmentId` 品牌、`AttachmentError`、图像限额/校验/保存抽象(`imageLimits`/`validateImage`/`saveImage`) |
| Provider | `attachment-local`(根植 `$DSH_HOME` 之下,图像探测/校验/落盘;默认单图编码字节上限在包内常量) |
| Consumer | `tool-fs` 的 `read_image`(图像经附件存储持久化后再进消息)、`host/apiproxy`(会话导出/API 代理)、`client/connection`、`llm-pi-ai`(请求组装时取图像) |

换 provider 改变附件的物理位置与限额,引用形状(`ImageAttachmentRef`)不变——会话日志里存的是引用,这是附件可跨传输重放的前提。注意消费面横跨 host 与 client 两侧:导出/代理侧要把引用物化成可传输内容,请求组装侧要把引用还原成 image block——两侧都只依赖 Definition 词汇,不触碰后端存储布局。

## 12. compaction——压缩(单服务引擎)

| 角色 | 落点 |
|---|---|
| Definition | `packages/compaction/compaction/`:抽象类 `CompactionEngine extends Service`(`ctx.compaction`)——`compactIfNeeded`(按触发判定)/`compactNow`/`compactRegion`;`CompactionTrigger = 'pressure' \| 'context-overflow'`;接口自认依赖 session 与 llm 词汇(有专门 Agent Note 论证) |
| Provider | `compaction-basic`(回放感知;`inject = ['llm', 'tokenMeter', 'sessions']`;压力来自 `ctx.tokenMeter.measure()`,配置 `thresholdRatio`/`retainRatio`/`maxTokens`/`compactionRetries`;处理 `CONTEXT_WINDOW_EXCEEDED` 溢出触发);`compaction-tool-result-pruner`(`ctx.toolResultPruner`,无模型的 tool-result 修剪,是相邻的独立服务) |
| Consumer | agent-loop 维护路径(图 atlas proc_2:`compactNow → runMaintenance → wakeDriver → kick → turn → preStep → claim`);`command-compact`(人类 `/compact`,后端无关,跟随本叶挂的 compaction 服务) |

`compactIfNeeded` 的两条触发路径(`compaction-basic/src/index.ts`)把 seam 间的依赖链走得很清楚:

- **pressure**:先 `ctx.llm.resolveModelInfo()` 取路由模型的 context 容量(缺失即抛 `TargetPressureConfigError`,要求在该 adapter 模型上配置 contextWindow),再按 target 专属阈值比对 `meter.measure()` 的压力;
- **context-overflow**:绕过阈值与保留尾策略,先让可选的 `toolResultPruner.pruneSession()` 做一次无模型修剪、重测,再 `selectCompactableRange` 强制一次"有用的平衡缩减"。

pruner 经 `ctx.get()` 可选注入——"compaction-basic 保持独立可组合"是注释里明说的理由。换 provider 改变"何时压、压哪段、留多少"的策略,压缩节点在会话日志里的形状不变。

---

## 13. 跨 seam 组合规则

seam 不是孤立的:组合层(`bundle/base/cordis.patch.yml` 与各 app 的 `cordis.yml`)负责装配,而源码把关键组合约束做成**加载期断言**:

1. **同一执行世界**:`subprocess/src/index.ts` 的实现契约第一条就是"可执行文件路径属于与已挂文件系统 provider 共享的一个执行世界"——fs 与 subprocess 必须同世界,e2b POC 正是同时换两者;
2. **围栏三件套**:执行器宣告围栏(`sandboxMode !== undefined`)时,`tool-bash` 在 `apply()` 里断言 `ctx.sandboxPolicy` 存在,缺失直接抛错("the mounted bash executor confines but ctx.sandboxPolicy is missing")——分裂组合在工具插件加载期就失败,而不是运行期;`fs-sandbox` 同理 `inject = ['sandboxPolicy']`;
3. **策略事件栅栏**:terminal-bash 监听 `sandbox/mode` 会话事件,有活跃 PTY 时拒绝换模式(06 篇 §3)——策略切换与持久状态的冲突在事件层裁决;
4. **词汇依赖方向单一**:图 atlas §2 的 IMPORTS 拓扑显示能力包之间只有零星导入且方向都是"消费方 → 核心词汇包"(如 `subagent → core`),词汇包永不反向依赖消费者。

`docs/capability-seams.md` 是这套组合的**生成地图**(`scripts/gen-doc-graphs.ts` 产出,头部注明勿手编):每个服务节点标注声明包、已知实现包、直接消费包。它的价值在于与源码对账——本文 §2-§12 的表格即按该图逐包核对,凡图与源码不一致处(如 glossary 称 dsh-llm 兼任 Consumer)以源码为准并加注。

---

## 14. seam 设计的代价与收益

**收益(图可验证):**
1. **换 provider 即换产品切面**:e2b 只换两个 adapter,bash/PTY/LSP/fs 整体迁移(06 篇 §7);subagent 六个 provider 从同进程到异产品共享一个接口;
2. **包级零调用耦合**:图 atlas 统计跨包 CALLS 仅 `client → test-support` 一条(测试基建),其余全部经服务注册/事件——换实现不产生调用面破坏;
3. **词汇是稳定窄腰**:错误类型(`FsError` 56、`LlmError` 48 入度)而非实现是全局消费点,测试替身(MockAdapter 入度 48)因此能渗透全部 e2e;
4. **策略与机制分离可审计**:fs 的观察策略、sandbox 的策略之家、approval 的策略都是独立插件/服务,不挂即裸行为,挂了有事件日志可回放。

**代价(源码里看得见):**
1. **样板密度高**:每个 seam 一套错误类型 + `invariant.ts` + 设置命名空间归属谈判(shell 的注释专门解释为什么命名空间归 Definition);scripts 包自调用 1,692 次居全仓第二,大量是门禁与生成(`gen-doc-graphs`、i18n 三文件制);
2. **刻意重复**:pwsh-local 逐调用镜像 bash-local(`jscpd:ignore` 注释),换来 seam 表面的对称而非抽象复用;
3. **学习成本**:三角色 + 两种拓扑(单服务/注册表)+ 事件模式(waterfall/emit/单槽)是每个新能力的前置知识;文档本身需要生成器维护一致性;
4. **封闭形状的代价**:没有 pi 式 `samplingParams` 逃逸舱(07 篇 §6),新方言必须落到具名代码位置——审计性的反面是灵活性。

一句话总结:dsh 用工程门禁密度购买了"图可验证的零耦合",seam 是这笔交易的合同文本。

---

## 15. 与本系列其余各篇的衔接

- **06 篇**(shell/sandbox)是 seam 方法论的纵深样例:本篇 §1 的三角色在那条栈上表现为四层嵌套(shell → subprocess → sandbox → sandbox-policy),每层各有自己的 Definition 词汇与 fail-closed 契约;
- **07 篇**(llm providers)展示了注册表式 seam 的完整谱系:adapter 注册、目录注册、发现注册三张表共存,`llm/stream` waterfall 是唯一的横切挂载点;
- 本篇的 12 个 seam 里,**单服务拓扑**集中在"执行世界"相关能力(fs/subprocess/shell/sandbox/jobs/attachment/compaction)——一个世界一份实现;**注册表拓扑**集中在"来源多样"的能力(web/skill/lsp/subagent/llm)——多来源共存、确定性选择。这条分界线比任何文档表述都稳定;
- terminal seam(`ctx.terminals` 注册表 + terminal-bash 后端 + 六个 terminal_* 工具)是注册表拓扑与 owner 作用域授权的样例,机制细节见 06 篇 §3;它同时演示了策略事件如何约束持久状态(sandbox/mode 切换栅栏);
- 对 grok-build 的直接参照价值:若要做能力可替换,先定**词汇与错误类型**(那才是消费点),再定注册拓扑(单服务还是注册表),最后才写 provider;工具层永远只注入服务、不 import 实现。
