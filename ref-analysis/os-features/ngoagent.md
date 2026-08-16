# NGOAgent 源码调研:OS-level Agentic 可吸收特性

> 调研对象:`/tmp/ngoagent-check`(Go 1.24,DDD 分层;`internal/` 实测 75,438 行 Go,README 称 "30,000+" 偏保守)。
> 验证方式:逐文件读源码并核对行号;`go vet` 通过 security/notify/workspace/llm 四个包;全量 `go build` 仅因本机缺 sqlite3.h(sqlite-vec cgo 依赖)受阻,非代码问题;49 个 `_test.go` 作为有效性证据。
> 立场:NGOAgent 是用户自己的项目,本报告客观记录——实现扎实的给实现证据,名不副实的直接标注。
> 对照目标:grok-build(Rust 终端 coding agent;Leader 常驻种子、Hub WS、ACP、serve、Landlock/bwrap 沙箱、全局+workspace 记忆、fsnotify、Computer Hub;现状见 `docs/` 14 篇)。
> 轴定义:L1 常驻 / L2 跨域 / L3 系统面 / 治理 / 模型运营 / 生态 / 工程可信(同 `ref-analysis/os-agentic-proposal.md`)。

---

## 0. 总览

共抽取 **25 条特性**:P0×4、P1×12、P2×6、P3×3。
另列 **不吸收清单 15 条**,其中明确 **"宣称未实现" 5 条**(见 §2 标注)。

### 特性索引

| # | 特性 | 轴 | 成本 | 优先级 |
|---|---|---|---|---|
| F1 | BufferedDelta SSE 断线缓冲与重连重放(含统一事件模型) | L1/L3/工程可信 | M | P0 |
| F2 | LoopPool 每会话隔离+每用户公平配额 | L1/治理 | M | P1 |
| F3 | DreamTask 空闲预载框架(OnIdle/OnWake) | L1 | S | P2 |
| F4 | 安全分类器三策略(pattern/llm/hybrid) | 治理 | M | P1 |
| F5 | 安全决策链:子命令拆分+safe-zone+审计 | 治理 | M | P1 |
| F6 | 审批流:pending 注册表+超时+重水合 | 治理/L3 | M | P1 |
| F7 | ModePermissions 模式即权限矩阵 | 治理 | S | P2 |
| F8 | evo 沙箱路径策略(evoDecide) | 治理 | S | P2 |
| F9 | doCompact 密度切割+七维摘要+恢复注入 | 模型运营 | M | P0 |
| F10 | toolHeavyCompact + microCompact | 模型运营 | S | P1 |
| F11 | compressDiffOutput git-diff 结构压缩 | 模型运营 | S | P1 |
| F12 | processToolResult 三档注入+落盘引用 | 模型运营 | S | P0 |
| F13 | ToolSearch 分层懒加载(Tier0/1/2) | 模型运营 | M | P1 |
| F14 | 错误指纹分类+分级退避+后台禁重试 | 模型运营 | M | P0 |
| F15 | provider_registry 厂商预设+HealthChecker | 模型运营 | S | P1 |
| F16 | ModelPolicy 配置驱动能力覆盖 | 模型运营 | S | P2 |
| F17 | TelemetryCollector + CacheTracker | 模型运营/工程可信 | S | P1 |
| F18 | WebhookNotifier HMAC+异步队列+重试 | L2/L3 | M | P1 |
| F19 | SubagentOrchestrator + Barrier + auto-wake | L2/生态 | L | P1 |
| F20 | @include 递归展开 + AttachFile 附件引擎 | 生态 | S | P2 |
| F21 | A2A 协议端点(AgentCard+Task) | 生态 | M | P3 |
| F22 | evo 评估-修复闭环(EvoTrace/Evaluation/Repair) | 工程可信 | L | P2 |
| F23 | graph runtime 节点化执行+快照恢复 | 工程可信 | L/S | P3 |
| F24 | Sandbox 进程管理器(pgid/detached/增量输出) | L3 | M | P1 |
| F25 | PhaseDetector 4 阶段行为检测 | 工程可信 | S | P3 |

| 价值 Top 5 | 一句话 |
|---|---|
| F1 BufferedDelta 重连重放 | run 与连接解耦:断线只断 writer,事件按 seq 缓冲,重连 `Attach(last_seq)` 增量重放——grok-build Hub/ACP 多客户端的断线恢复直接抄此模型 |
| F12 工具结果三档注入+spill | <2K 内联 / 2K–32K 带 header / >32K 落盘+路径引用,一个函数管住上下文膨胀,read_file 豁免设计周到 |
| F9 doCompact 七维摘要 | 密度感知切割+七维结构化摘要+compact 深度守卫+文件/skill 恢复注入,是长会话压缩的完整闭环 |
| F17 错误指纹+退避策略表 | 状态码→body 指纹两级分类(含 DashScope 1305/火山/Cloudflare HTML 拦截),每级错误配独立退避,后台任务禁重试防放大 |
| F21 SubagentOrchestrator+Barrier | 子代理独立 loop+私有历史,barrier 计数齐后自动唤醒父 loop,进度事件实时推父会话——多代理编排的完整参考实现 |

---

## 1. 特性清单

### A. 常驻与连接(L1)

#### F1. BufferedDelta — SSE 断线缓冲与重连重放
- **源**:`internal/domain/service/buffered_delta.go:30-333`;`internal/interfaces/server/server.go:327-540`
- **机制**:每个 run 绑定一个 `BufferedDelta`(事件 seq 递增、序列化存 `[]BufferedEvent`,上限 5000 条防泄漏,L69-73)。SSE writer 以回调注入;写失败即 `writer=nil` 切缓冲模式(L75-80)。客户端重连走 `GET /v1/chat/reconnect?session_id=&last_seq=`,服务端 `Attach(writer, lastSeq)` 跳过已收 seq、重放其余(server.go:453)。run 上下文与 HTTP 请求解耦(`context.Background()`,server.go:334),断线后 run 继续;15s heartbeat 穿透代理空闲超时(server.go:354-383)。run 完成后缓冲保留 30 分钟供迟到重连,`RunTracker` 每 5 分钟清过期(L113-125, 315-333)。text_delta 50ms 节流合批降 SSE 频率(L196-208)。`ResetDone()` 支持 evo repair/auto-wake 重新打开流(L127-136)。事件模型本身是统一 DeltaSink 回调表(text/reasoning/tool_start/tool_result/progress/plan_review/approval_request/title/auto_wake/complete/error,MakeDelta L192-260),**SSE 与 WS 双路径共用同一缓冲**——WS 断线后可经 SSE reconnect 恢复(ws_handler.go:265 注释)。
- **证据**:WS 路径同样注册 RunTracker(ws_handler.go:265-269 注释 "D3 fix");api_contract_test.go:102-113 有 reconnect 契约测试;server.go 中 D2/D3/BUG 修复注释表明是线上问题驱动的真实实现。
- **对 grok-build 的价值**:L1 常驻 + L3 系统面 + 工程可信。grok-build 的 Hub WS 多客户端、serve 模式、ACP 断线重连(`StdioReplayState`)已有重放种子,但缺"run 与连接彻底解耦 + seq 增量重放 + 完成后窗口期可重连"这一完整模型;Leader 上提为 per-host daemon 后,任意表面(TUI/ACP/IM)掉线重连都需要它。同时 grok-build 现有 ACP/Hub/serve 三套表面,把事件收敛为单一 schema + 统一 replay 缓冲,正是多表面平等接入的前提(与 os-agentic-proposal §2 "收敛协议"方向一致)。
- **Rust 吸收**:`enum AgentEvent`(serde)+ `trait EventSink` + `struct ReplayBuffer { seq: u64, events: VecDeque<Bytes>, writer: Option<Box<dyn EventSink>>, done: watch::Sender<bool> }`,`attach(&mut sink, last_seq) -> usize`;放 `xai-grok-workspace` hub 层或独立 `xai-replay-stream` crate;tokio 下用 `broadcast`+环形 VecDeque。事件 schema 需带版本字段。
- **成本**:M **风险**:低(缓冲内存有上限;注意 done 通道的重开语义) **优先级**:P0

#### F2. LoopPool — 每会话独立 loop + 每用户公平配额
- **源**:`internal/domain/service/loop_pool.go:14-276`
- **机制**:每 session 一个 `AgentLoop`(独立 history/brain dir),池上限 `maxLoops=8`、每用户 `perUserMax=3`(L34-41)。淘汰两级:先淘同用户最旧空闲,再全局 LRU(L104-110);空闲判定用 `runMu.TryLock()`——正在跑的 loop 绝不淘汰(L148-156, 182-200)。`ExtractUserKey` 从 sessionID 前缀解析用户(L266-276)。池满且无空闲可淘时返回 `ErrPoolFull`(busy 语义,L262)。
- **证据**:代码含 BUG-11 修复注释(workspaceDir 传播,L118-121);被 server 的 chat/WS 路径实际使用(ws_handler.go 经 LoopPool 取 loop)。
- **对 grok-build 的价值**:L1 常驻 + 治理。grok-build Leader 管多 workspace 执行单元时,需要"每执行单元独立状态 + 全局并发上限 + 单用户不能占满"的调度底座;TryLock 判空闲再淘汰的模式比引入额外状态位更省。
- **Rust 吸收**:`SessionPool { loops: HashMap<SessionId, ManagedLoop>, max, per_user_max }`,淘汰用 `Mutex::try_lock()` 探测空闲;用户键从会话来源派生。放 hub/daemon 层。
- **成本**:M **风险**:低(淘汰时 loop.Stop() 需保证历史已持久化) **优先级**:P1

#### F3. DreamTask — 空闲预载框架(OnIdle/OnWake)
- **源**:`internal/domain/service/phase_dream.go:178-261`;接线:`run.go:87`(OnWake)、`run_states.go:315`(OnIdle)
- **机制**:Run 结束进入空闲,30s 阈值后并发启动注册的后台 job(可取消 context);新输入到达时 `OnWake()` 立即 cancel 全部 job(L256-261)。job 列表可插拔(`AddJob(DreamJob{Name, Fn})`)。
- **证据**:OnIdle/OnWake 确实在 run 生命周期被调用;但**全仓库无任何 `AddJob` 调用方**——框架接线完整,实际 job 为零。文件说明.md:13 宣称"会话空闲 30s 后后台扫描工作区"→ **宣称未实现**(仅框架)。
- **对 grok-build 的价值**:L1 常驻。常驻 daemon 的核心红利就是空闲期预计算(索引、记忆蒸馏、预取)。grok-build 有 fsnotify/记忆系统,dream 框架正好是"空闲策展"的调度壳。
- **Rust 吸收**:`trait IdleJob { fn name(&self); async fn run(&self, cancel: CancellationToken); }` + `DreamScheduler { idle_after: Duration, jobs }`,Run 完成触发 tokio::time::sleep 后启动,任意输入到达即 cancel。成本 S,价值取决于 job 内容。
- **成本**:S **风险**:低(注意 job 不得写会话热状态) **优先级**:P2(框架;配合记忆蒸馏 job 升 P1)

### B. 治理与安全

#### F4. 安全分类器三策略(pattern/llm/hybrid)
- **源**:`internal/infrastructure/security/classifier.go:1-251`;接线:`core_infrastructure_assembly.go:41-48`;配置:`config.go:299-302`
- **机制**:`Classifier` 接口 + 策略模式。pattern=正则/glob 黑名单,零延迟零成本(默认);llm=小模型(Haiku 级)按固定 prompt 输出 VERDICT/CONFIDENCE/REASON 三行,provider 出错自动降级 pattern(L143-148);hybrid=pattern 先行、低置信度升级 LLM(阈值 0.75,L203-226)。仅管 `run_command`,其余工具走 normalDecide。工厂在 provider 为 nil 时强制降级 pattern(L234-251)。
- **证据**:config 有 `classifier_mode/classifier_model` 字段并在 assembly 接线;`SetClassifier` 支持运行时热切换(hook.go:89-96)。
- **客观缺陷**:PatternClassifier 置信度硬编码 0.90/0.95(classifier.go:74,79),永远 ≥0.75,**hybrid 的 LLM 升级分支实际是死代码**——当前 hybrid≡pattern。设计意图好,落地未完成。
- **对 grok-build 的价值**:治理。grok-build 沙箱是内核级(Landlock/bwrap),命令级"是否需要问人"的策略层仍值得有:pattern 兜底 + 可选 LLM 升级的三层结构合理,但要修置信度来源。
- **Rust 吸收**:`trait CommandClassifier { fn classify(&self, cmd: &str) -> Verdict }`,Verdict{Allow,Ask{reason},Deny};hybrid 用真实信号(黑名单命中数、路径越界数)算置信度而非硬编码。
- **成本**:M **风险**:中(LLM 分类器不可作唯一防线,只做升级项) **优先级**:P1

#### F5. 安全决策链:子命令拆分 + safe-zone + 审计
- **源**:`internal/infrastructure/security/hook.go:319-610`
- **机制**:`normalDecide` 链:用户 override → mode(allow/ask)→ run_command 走分类器 → 黑名单(支持 `tool(argPattern)` 与裸命令两种语法,L383-413)。黑名单匹配前先把命令按 `; && || |` 与换行拆子命令、剥 `bash -c` 外壳、检查 `$(...)` 替换(L455-502),防 `echo ok; rm -rf /` 绕过。分类器判 Ask 时再过 `isInSafeZone`(所有路径参数必须在 /tmp 或 workspace 内,L556-573),是则降为 Allow。每个决策带 `DecisionLevel`(block/user/system/policy)记审计日志,上限 1000 条(L596-610)。
- **证据**:hook_test.go 有 TestMatchBlockList_Legacy/Pattern、TestMatchGlobPrefix、TestReadOnlyAutoApproveInAskMode 等 6 个测试。
- **客观缺陷**:拆分基于空白切分,不处理引号/变量展开/反引号嵌套,`rm "$X"` 类绕过挡不住;safe-zone 同理。只能算"便利层",不能当主防线。
- **对 grok-build 的价值**:治理。grok-build 已有内核级沙箱,这套的价值在"审批决策链的结构化"(override→policy→pattern→zone→ask)与审计级别字段,而非其字符串启发式。
- **Rust 吸收**:决策链做成 `enum DecisionLevel` + 有序 `Vec<Box<dyn SecurityRule>>`;命令解析若需要,用 shell-words 类 crate 做真实 tokenize,不抄空白切分。
- **成本**:M **风险**:低 **优先级**:P1

#### F6. 审批流:pending 注册表 + 超时 + 跨表面解析 + 重水合
- **源**:`internal/infrastructure/security/hook.go:152-276`;`internal/domain/service/security_middleware.go:33-99`
- **机制**:Ask 决策 → `RequestApproval` 生成 8 字符 ID 入 pending 表 → SSE 推 `approval_request` → 阻塞等 `chan bool`,三路 select:客户端 POST /v1/approve 解析 / 5 分钟超时(防永久挂起)/ ctx 取消(L78-88)。`RestorePending` 支持把序列化 approval 重水合回内存(重启恢复,hook_test.go:126 有测试);`CleanupExpired` 防泄漏;`Resolve` 用 buffered(1) 非阻塞发送防双解析。ReadOnly 工具在 ask 模式也自动放行(hook.go:368-372 + security_middleware.go:36-39 双保险)。
- **证据**:hook_test.go TestRestorePending_RehydratesApproval、TestListPending_ReturnsDeterministicOrder;security_middleware_test.go。
- **对 grok-build 的价值**:治理 + L3 系统面。grok-build 插话/审批目前单表面(xai-interjection-core);OS agentic 要求"IM 里批准、TUI 里执行",pending 表 + ID 解析 + 超时 + 重启重水合就是跨表面审批的最小完备模型。
- **Rust 吸收**:`ApprovalGate { pending: DashMap<ApprovalId, oneshot::Sender<bool>> }`,超时 tokio::time::timeout;事件经 F1 的统一事件层广播。
- **成本**:M **风险**:低 **优先级**:P1

#### F7. ModePermissions — 模式即权限矩阵
- **源**:`internal/domain/service/mode_permissions.go:1-62`
- **机制**:把执行模式从字符串分支改为能力位组合:`{ForcePlan, AutoApprove, SelfReview, PhaseDetect}` + 正交的 `EvoEnabled`。auto/plan/agentic 三档注册表(L22-31),"evo" 是 auto+evo 的向后兼容缩写(L36-43)。安全链直接消费能力位(security_middleware.go:57-60:AutoApprove 跳过人审)。
- **证据**:mode_permissions_test.go 三个测试覆盖解析/格式化/矩阵断言。
- **对 grok-build 的价值**:治理。grok-build 的模式(plan/agentic 等)若用字符串 if-else 分支会随模式增多而组合爆炸;能力位矩阵是干净的解法,且"evo 正交"示范了"横切层"如何不污染主模式轴。
- **Rust 吸收**:`bitflags!` 或 `struct ModeCaps { force_plan: bool, auto_approve: bool, ... }` + `Mode::caps()`。成本 S。
- **成本**:S **风险**:低 **优先级**:P2

#### F8. evo 沙箱路径策略(evoDecide)
- **源**:`internal/infrastructure/security/hook.go:503-538`;`builtin_tool_providers.go:69`
- **机制**:evo(自进化)上下文中的工具决策单独走 `evoDecide`:文件写只允许 `/tmp/ngoagent-evo/` 前缀(越界 Deny),读类放行,依赖安装(pip/npm/go get 等,L576-592)放行但记审计。
- **证据**:与 EvoTool(`NewEvoTool("/tmp/ngoagent-evo", sbMgr)`)硬编码根一致;evolution_test.go、evo_test.go 覆盖。
- **对 grok-build 的价值**:治理。任何"agent 自我修改/实验"场景都需要一个策略上独立、物理上受限的沙箱根;grok-build 有 Landlock/bwrap,把"实验区"做成独立 profile 即可。
- **Rust 吸收**:sandbox profile 增加 `experimental_root` 白名单;决策链加 evo 分支。
- **成本**:S **风险**:低 **优先级**:P2

### C. 模型运营

#### F9. doCompact — 密度感知切割 + 七维摘要 + 恢复注入
- **源**:`internal/domain/service/compact.go:19-237`
- **机制**:按 user 消息切 turn,每 turn 计密度(`len(content)+toolCalls*200`),保尾两 turn,中段送 LLM 摘要(L29-66)。摘要 prompt 两步:先 `<analysis>` 草稿再输出七维(user_intent/session_summary/code_changes/learned_facts/all_user_messages/current_work/errors_and_fixes),并强制保留 preference/semantic knowledge 原文(L86-122)。**compact 深度守卫**:连续 compact>3 次退化为原文截取,防"摘要的摘要"信息塌方(L136-145)。压缩后:最近 5 个文件路径重注入(L203-212)、活跃 skill 全文重注入防"忘记自己在执行什么"(L214-232)、首条若已是摘要则替换不嵌套(BUG-19,L184-191)。BeforeCompact hook 先把被删内容送向量记忆(L70-72)。
- **证据**:run_states.go 中 StateCompact 节点、compact 触发链完整;core_test.go 等覆盖 loop 行为。
- **对 grok-build 的价值**:模型运营,直接服务长会话/常驻场景。grok-build 的 session_summary 模型类别已有,七维结构+深度守卫+恢复注入这三件是工程上防"压缩致残"的关键,值得整体借鉴。
- **Rust 吸收**:`struct Compactor { dims: [Section; 7], max_depth: u32 }`,摘要走 session_summary 模型档;恢复注入复用 grok-build 记忆/skill 已有存储。
- **成本**:M **风险**:中(摘要质量依赖模型;all_user_messages 全量保留在超长会话会膨胀,需上限) **优先级**:P0

#### F10. toolHeavyCompact + microCompact — 工具输出定向瘦身
- **源**:`internal/domain/service/compact.go:279-394`
- **机制**:toolHeavyCompact:若 tool 输出占总字符 >60%,把 >10KB 的 tool 消息压成 500 头+1500 尾+压缩标记,先于全量 LLM compact 执行(L286-347)。microCompact:保留最近 2 个 assistant 消息之后的 tool 结果,更早的 >200 字符 tool 输出清空为 `[cleared: 首行]`(L355-394)。
- **证据**:注释明确对标 CC 的 tool-heavy compact 策略;逻辑自包含、无外部依赖。
- **对 grok-build 的价值**:模型运营。两个都是零 LLM 成本的廉价前置压缩,顺序上"先定向后全量"很对;grok-build 长 run(构建日志、grep 大输出)最吃这个。
- **Rust 吸收**:history 层加两个纯函数 pass,阈值可配。成本 S。
- **成本**:S **风险**:低(头尾截取可能丢中部关键行,标记里写明压缩事实即可) **优先级**:P1

#### F11. compressDiffOutput — git diff 结构化压缩
- **源**:`internal/domain/service/compact.go:430-488`
- **机制**:保留 `diff --git/---/+++/index/` 结构标记与 +/- 变更行,丢弃纯上下文行,统计省略数;支持 maxLines 截断。diff 工具结果在中档注入前先过此压缩(compact.go:514-518),超大 diff 压缩后若降回阈值内则直接内联(L539-546)。
- **证据**:isDiffTool 覆盖 git_diff/diff_files/git_log(L560-566)。
- **对 grok-build 的价值**:模型运营。diff 的语义全在 +/- 与 hunk 头,去上下文行是近乎无损的高倍压缩;grok-build 的 git 工具输出直接受益。
- **Rust 吸收**:纯函数 `fn compress_diff(raw: &str, max_lines: Option<usize>) -> String`,挂到工具输出后处理。成本 S。
- **成本**:S **风险**:低(少数依赖上下文行判断的场景受损,保留原始落盘路径可回查) **优先级**:P1

#### F12. processToolResult — 工具结果三档注入 + 落盘引用
- **源**:`internal/domain/service/compact.go:490-587`
- **机制**:≤2K 原样内联;2K–32K 加 `[Tool output: N lines, N bytes]` header 内联(diff 先结构压缩、grep 限 30 条);>32K 写入 `/tmp/ngo_<tool>_*.txt`,返回路径+前 30 行预览+`read_file(path)` 提示(L527-556)。**read_file 豁免**:任何大小都内联,防止 agent 看不到完整文件(如 SKILL.md)——注释写明教训(L529-533)。
- **证据**:阈值常量 L493-497;与 spillToTemp 配套。注意:文件说明.md:14 写 "<2K/2K-8K/>8K",**源码实际是 2K/32K**,以源码为准。
- **对 grok-build 的价值**:模型运营。一个函数统一管住所有工具输出的上下文预算,"落盘+路径引用"把上下文问题转成可寻址问题,与 grok-build 的 pager/大输出处理互补;read_file 豁免这类例外是实战经验的体现。
- **Rust 吸收**:`fn inject_tool_result(name, out) -> ToolOutput`,spill 目录放 grok-build 会话 tmp;阈值进配置。
- **成本**:S **风险**:低(spill 文件需随会话清理) **优先级**:P0

#### F13. ToolSearch 分层懒加载(Tier0/1/2)
- **源**:`internal/domain/service/run_helpers.go:196-295`(注:文件说明.md 写 run.go,实际在 run_helpers.go)
- **机制**:工具总数 >30 且 step<2 时按层裁剪工具定义:Tier0 16 个核心工具恒在;用户消息含 search 类关键词加 Tier1(web_search/web_fetch/http_fetch 等),含 heavy 关键词(中英文都有,如"记住/偏好/记忆")加 Tier2(git/memory/media/cron/clipboard);两类都要则不裁;MCP 工具恒在(用户配置的外部能力不裁,L272-275)。
- **证据**:run.go:693 实际调用 `activeToolDefs`;run_helpers_test.go 存在。
- **客观缺陷**:关键词匹配是朴素 Contains("api"/"look" 这类短词误触率高);step≥2 后全量放开,节省的只是冷启动两步。
- **对 grok-build 的价值**:模型运营。grok-build 工具+MCP 数量增长后同样面临工具 schema 吃 token 的问题;分层思路可取,触发器建议换成嵌入相似度或让模型自己发 tool_search 调用。
- **Rust 吸收**:`ToolTier` 标记 + `fn active_tools(msg, step) -> Vec<ToolDef>`;或直接做 ToolSearch 元工具(模型主动检索),比关键词更稳。
- **成本**:M **风险**:中(裁错工具会导致模型行为异常,需全量兜底通道) **优先级**:P1

#### F14. 错误指纹分类 + 分级退避 + 后台禁重试
- **源**:`internal/infrastructure/llm/errors.go:1-305`
- **机制**:六级错误(rate_limit/overload/context_overflow/recoverable/billing/fatal),每级配独立策略:429→30s 基退避 5 次、503/529→15s 8 次、overflow→compact 后重试、billing→换 provider、fatal→终止(L176-189)。两级分类:先状态码(`ClassifyHTTPError`),再 body 指纹(`ClassifyByBody`):Cloudflare HTML/socket hang up 强制 retry 防把 HTML 当 JSON 解析、DashScope 1305 与火山 RequestBurstTooFast 归 overload 走短退避、429+显式 quota 关键词才升级 billing(注释特别警告不要用宽泛词 "billing" 误杀可重试 429,L136-147)、Mistral/Bedrock 上下文溢出指纹(L155-164)。指数退避+±25% jitter、5 分钟封顶(L205-217)。**后台任务(compact/title)对 429/529 禁重试**,防负载下重试放大(L193-202)。每级错误带中文用户建议文案(L52-68)。
- **证据**:errors_test.go 用 DashScope/火山/Mistral 真实 mock JSON 断言分类准确率。
- **对 grok-build 的价值**:模型运营,常驻场景必备。grok-build 的模型路由目前缺 fallback 链与错误指纹(os-agentic-proposal §2 已点名);"后台禁重试防放大"与"指纹继承自 OpenClaw"这两点是多厂商运营的真经验。
- **Rust 吸收**:`enum LlmErrorLevel` + `fn classify(status, body) -> Level`(指纹表数据驱动)+ `RetryPolicy::for_level()`;放 provider 客户端层。
- **成本**:M **风险**:低 **优先级**:P0

#### F15. provider_registry 厂商预设 + HealthChecker 探活
- **源**:`internal/infrastructure/llm/provider_registry.go:1-37`;`health.go:34-105`;接线 `llm_assembly.go:28`
- **机制**:17 个厂商预设(文件说明称 16;openai/azure/anthropic/google/bedrock/dashscope/volcengine/groq/mistral/cohere/deepseek/together/cloudflare/ollama/venice/zhipuai/minimax),每项含 DefaultBaseURL+RequiredAuthType(bearer/x-api-key/ak-sk/none),config.yaml 只写 provider 名即可自动注入路由。HealthChecker 周期探活各 provider,`IsHealthy` 供 Router 降级选择(router.go:96-149 ResolveWithFallback/Exclusions)。
- **证据**:llm_assembly.go 实际消费 GetPresetProvider;router 有 exclusions 参数配合 generate 重试换 provider(run_states.go addExcludedProvider)。
- **对 grok-build 的价值**:模型运营。grok-build 以 xAI 为主但 OS agentic 需要多厂商容灾;预设表是低价值高密度资产(抄表即可),探活+排除链是 fallback 的骨架。
- **Rust 吸收**:`static PRESETS: &[ProviderPreset]` + `HealthChecker`(tokio interval 探活,轻量 HEAD/小请求)。
- **成本**:S **风险**:低(探活请求成本需控制) **优先级**:P1

#### F16. ModelPolicy 配置驱动能力覆盖
- **源**:`internal/infrastructure/llm/errors.go:219-305`
- **机制**:模型能力(context window/max output/tools/thinking/vision/cache/价格)不写死内核,config.yaml `model_config` 启动与热重载时注入 overlay;能力旗标用指针区分"未设置(继承保守默认)"与"显式 false"(L283-290);未注册模型回落保守默认(32K/8K)。
- **证据**:RegisterModelOverrides 注释"纯配置驱动模型注册,无需改内核代码"。
- **对 grok-build 的价值**:模型运营。新模型发布不改代码只改配置,对常驻 daemon 的热运营很重要;grok-build 模型类别表可加此 overlay 机制。
- **Rust 吸收**:`ModelPolicy { ctx: u32, caps: CapabilityFlags }` + `OnceLock<RwLock<HashMap>>` overlay,热重载走 grok-build 已有 fsnotify 配置监听。
- **成本**:S **风险**:低 **优先级**:P2

#### F17. TelemetryCollector + CacheTracker
- **源**:`internal/infrastructure/llm/telemetry.go:1-178`;`cache_tracker.go:1-40`;接线 `run.go:781-790`
- **机制**:每次 LLM 调用记 {model, provider, tokens(含 cached_tok), latency, error} 入 1000 格环形缓冲;Stats 算 P50/P95/P99、成功率、按模型分布;hook 机制可外接 sink;全局单例 nil-safe。CacheTracker 用系统 prompt hash 变化次数估算 prompt-cache 命中率(cache breaks)。doctor 端点直接展示(server/doctor.go:341 execTelemetry)。
- **证据**:run.go 实际 Record;doctor_test.go 存在。
- **对 grok-build 的价值**:模型运营 + 工程可信。grok-build 已有遥测(docs/07),可吸收的是 ring buffer+分位数这种零依赖轻量形态,以及"prompt 稳定性→缓存命中率"这个独特观测指标。
- **Rust 吸收**:环形 VecDeque + 分位数(或 t-digest);CacheTracker 用 DefaultHasher 即可。成本 S。
- **成本**:S **风险**:低 **优先级**:P1

### D. 跨域与生态(L2/L3)

#### F18. WebhookNotifier — HMAC-SHA256 + 异步队列 + 重试退避
- **源**:`internal/infrastructure/notify/webhook.go:1-261`;接线 `builder.go:192-213`、`run.go:115-119,170-174`、`tool_exec.go:92-94`
- **机制**:每目标可配事件过滤器/secret/重试数。事件入 128 缓冲 chan(满则丢弃并记日志),单 goroutine 消费、每目标独立 goroutine 投递;失败线性退避 2s/4s 重试;HMAC-SHA256 签名写 `X-Hub-Signature-256: sha256=<hex>`(L165-170);Close 时 3s 内尽力排空(L96-110)。tool_result 只对副作用工具发(write/edit/run_command/git_commit/spawn_agent/manage_cron,L229-235)防刷屏;输出截断 512。
- **证据**:builder/engine_assembly 实际接线;配置格式见文件头注释。
- **客观缺陷**:退避是线性非指数、无 jitter;队列满即丢(无持久化);8s HTTP 超时写死。
- **对 grok-build 的价值**:L2 跨域 + L3 系统面。OS agentic 需要"任务完成推到 IM/自动化系统";grok-build 目前无出站通知。HMAC 签名+事件过滤+副作用过滤三点可直接抄。
- **Rust 吸收**:`tokio::mpsc` 队列 + 投递 task;签名用 `hmac`+`sha2` crate;重试改指数+jitter。
- **成本**:M **风险**:低(出站请求需尊重代理配置) **优先级**:P1

#### F19. SubagentOrchestrator + Barrier + auto-wake
- **源**:`internal/domain/service/subagent_orchestrator.go:1-208`;`barrier.go:59-373`;`factory.go:52-241`
- **机制**:spawn 时经 LoopFactory 造**独立 AgentLoop**(共享基础设施、独立 history/state/mutex,factory.go:73-76 注释),注入父上下文摘要+agent 定义模型;barrier 按 (session, parentRun) 聚合子代理,`Add` 计数、`OnComplete` 收集结果,支持 maxConcurrent/timeout/transcript 落库;**全部完成后自动唤醒父 loop**(goroutine 里 `wakeLoop.Run("")`,L154-166)并向父会话推 subagent_progress 事件(done/total/current_step);父 loop 被注入 coordinator ephemeral 提示"不要轮询、等 auto-wake"(agent_tools.go:130-136)。
- **证据**:barrier 状态可序列化进 graphruntime.BarrierState(Snapshot/FromState,L70,373);completeness_test.go 覆盖。
- **对 grok-build 的价值**:L2 跨域 + 生态。grok-build 已有 workflow 子代理编排(docs/09),可吸收的是:barrier 计数+auto-wake 的父子协作模型、进度事件回注父会话、子代理 transcript 独立落库审计。
- **Rust 吸收**:`Barrier { pending: AtomicUsize, on_clear: WakeParent }` + 子会话独立 history store;与 grok-build Leader 多执行单元模型天然契合。
- **成本**:L **风险**:中(auto-wake 与用户输入竞争需排队;超时子代理的结果语义要定义) **优先级**:P1

#### F20. @include 递归展开 + AttachFile 附件引擎
- **源**:`internal/infrastructure/workspace/context_ecosystem.go:10-176`
- **机制**:context.md 支持 `@include ./path`,递归展开,**深度上限 5**(文件说明.md:29 写 3,以源码 L22 `maxIncludeDepth=5` 为准),visited 集合防循环引用(同路径不同子树允许重入,L72),路径安全限制在 workspace 与 /tmp 内(L51-55),缺失文件内联警告不失败。AttachFile:二进制检测(前 4K 查 NUL)、三档注入(<4K 内联/4K–20K 带 header/>20K 头 50 行+尾 50 行)。
- **证据**:ReadContextWithIncludes 被 workspace Store 消费;CompressCustomInstructions 配套(markdown 压缩进系统提示)。
- **对 grok-build 的价值**:生态。grok-build 的 AGENTS.md/记忆文件若支持 @include,可组合出分层指令体系;附件三档注入与 F12 同构,可共用一套注入策略。
- **Rust 吸收**:`fn expand_includes(content, base, depth, &mut HashSet<PathBuf>) -> String`;注意保留"警告不失败"语义。成本 S。
- **成本**:S **风险**:低(路径越界检查必须保留) **优先级**:P2

#### F21. A2A 协议端点(AgentCard + Task)
- **源**:`internal/domain/a2a/handler.go:1-200+`、`protocol.go`、`types.go`;测试 `handler_test.go`
- **机制**:实现 A2A(Agent2Agent)HTTP 端点:暴露 AgentCard(能力广告,接 ToolDiscovery.Advertise)、接收 task、把事件桥接进 TriggerRegistry(EventBus)。
- **证据**:handler_test.go 用 stub trigger registry 做 httptest 端到端断言。
- **对 grok-build 的价值**:生态(P3)。grok-build 已有 ACP;A2A 是 agent 间互操作的另一条标准化路线,远期多 agent 主机互联时可评估,近期不必。
- **Rust 吸收**:若做,axum handler + AgentCard schema;先观察生态。
- **成本**:M **风险**:低(纯增量) **优先级**:P3

### E. 工程可信

#### F22. evo 评估-修复闭环(EvoTrace/Evaluation/Repair)
- **源**:`internal/domain/service/evo_controller.go:1-214`、`evo_evaluator.go`(271 行)、`evo_repair.go:1-223`;`trace_hook.go`(236 行);`infrastructure/persistence/evo.go`(251 行);`infrastructure/evolution/`(assertion/diagnosis/tracker)
- **机制**:agentic+evo 模式下,run 结束把 trace(工具步骤 JSON)flush 入库,有效步骤≥2 才评估;LLM 评估打分+error_type 分类(param_wrong/tool_wrong/intent_mismatch/quality_low/capability_gap);RepairRouter 按 error_type 映射 5 策略(param_fix/tool_swap/re_route/iterate/escalate),每策略生成注入下一轮的 ephemeral 指令;**CircuitBreaker** 限每会话修复次数(默认 2)+冷却期(默认 30s),熔断则只报告不修复(evo_controller.go:119-135);修复即 auto-wake 重开 run(BufferedDelta.ResetDone 配套);EvoTrace/Evaluation 持久化带 LLM 压缩摘要列(persistence/evo.go:15)。配置 EvoConfig:max_retries/cooldown/score_threshold/eval_model/auto_eval(config.go:319-326)。
- **证据**:evo_contracts_test.go、evolution_test.go、evo_test.go;graph runtime 里 evaluate/repair 是正式节点类型(types.go NodeKindEvaluate/Repair)。
- **对 grok-build 的价值**:工程可信。"评估→归因→定向修复指令→熔断"是完整的自修复闭环,比泛泛的 reflect 更工程化;grok-build 若做质量闭环,error_type→策略映射表+熔断器是最值得抄的两件。
- **Rust 吸收**:`trait Evaluator { async fn evaluate(&self, trace) -> EvalResult }` + `RepairRouter::route(err_type) -> RepairPlan` + 熔断器(计数器+Instant 冷却)。评估模型走辅助模型档。
- **成本**:L **风险**:中(评估本身消耗 token 且可能误判,需 score_threshold 与熔断双闸;无人值守场景才划算) **优先级**:P2

#### F23. graph runtime — 节点化执行 + 快照恢复
- **源**:`internal/domain/graphruntime/runtime.go:1-570`、`types.go:1-476`、`snapshot_store.go`、`trigger.go`;测试 runtime_test.go(787 行)+bench(822 行)
- **机制**:agent loop 重构为图运行时:16 种节点(prepare/orchestrate/spawn/barrier_wait/merge/generate/tool_exec/guard/reflect/plan/evaluate/repair/compact/done/complete/custom),节点返回 continue/wait/complete/fatal,wait 带原因(approval/barrier/external/user_input);ExecutionCursor(graph 版本+当前节点+步数)可序列化,SnapshotStore 支持 `Resume(runID)` 断点续跑;maxSteps=256 防失控。原 10 状态(state.go:7-16)降级为观测标签(注释明说 "observational phase label")。
- **证据**:runtime_test.go 787 行 + 基准测试 822 行,是测试最密集的模块之一;service 层 run_states.go 全部改为节点 handler。
- **对 grok-build 的价值**:工程可信(P3)。grok-build 的 loop 是命令式的且运行良好,不必照搬图化;但"执行游标可序列化→跨重启 resume"与"wait 原因类型化(审批/屏障/用户输入)"两个概念,对 per-host daemon 的任务可恢复性有直接参考价值。
- **Rust 吸收**:不做全图化;仅吸收 `ExecutionCursor` 序列化 + `WaitReason` 枚举进 grok-build 会话状态。
- **成本**:L(全图化)/ S(仅游标+wait 概念) **风险**:高(全图化是大重构) **优先级**:P3

#### F24. Sandbox 进程管理器 — pgid 组杀/detached/增量输出/持久 shell 状态
- **源**:`internal/infrastructure/sandbox/sandbox.go:1-412`;`shell_state.go`
- **机制**:每个命令 `Setpgid` 新建进程组,取消时 `kill(-pgid, SIGKILL)` 组杀防子进程持管道 fd 导致 Wait 挂起(L92-102),`WaitDelay=3s` 兜底;`RunDetached` 用 setsid 完全脱离 agent 进程树、不继承管道、不跟踪,供常驻服务存活于 agent 重启之外(L207-239);后台进程支持 stdin 写入、**增量输出读取**(lastReadOffset,只返回新增,L249-290)、SIGTERM→2s→SIGKILL 组杀(L310-336)、KillAll 防孤儿;ShellState 跨命令持久化 cwd/env(WrapCommand 在输出埋标记回提 cwd)。
- **证据**:sandbox_state_test.go、shell_state_test.go;注释标注 L1 进程组隔离动机。
- **对 grok-build 的价值**:L3 系统面。这是"进程管理"而非"权限沙箱"(无 Landlock/bwrap 对应物,权限面 grok-build 更强);但 pgid 组杀+WaitDelay、detached 服务、增量输出、持久 cwd 四个细节是 shell 工具鲁棒性的实战经验,值得对照 grok-build 的 shell 工具查漏。
- **Rust 吸收**:nix crate `setsid/setpgid`;增量输出用 offset 游标;detached 用 `Command::new().process_group(0)` + stdio::null。
- **成本**:M **风险**:低 **优先级**:P1

#### F25. PhaseDetector — 4 阶段行为检测与 ephemeral 注入
- **源**:`internal/domain/service/phase_dream.go:12-176`;接线 `tool_exec.go:30`、`prepare.go:74-78`、`run.go:88`
- **机制**:按工具调用模式识别 Research/Synthesize/Implement/Verify 四阶段(读工具计数/写工具计数/run_command 含 test 关键词/无工具轮),带滞回(需连续 2 次信号才迁移,防抖,L104-113);每阶段注入对应 ephemeral 行为提示(如 Research 阶段 "不要写文件")。仅 agentic 模式启用(ModePermissions.PhaseDetect)。
- **证据**:tool_exec 实际 RecordTool;prepare 实际注入;RecordNoTool 有定义但**未发现调用方**(Synthesize 检测未完全接线)。
- **对 grok-build 的价值**:工程可信。用零成本启发式给模型"阶段感"是轻量 prompt 工程;grok-build 可评估在长 run 中按行为阶段注入纪律提示。
- **Rust 吸收**:`PhaseDetector` 纯状态机 + 提示模板;成本 S。
- **成本**:S **风险**:低(提示可能与具体任务冲突,做成可关) **优先级**:P3

---

## 1.5 吸收路线建议(对应 grok-build 阶段)

- **第一步(P0,随 Host Daemon 上提一起做)**:F1 重连重放 + F12 工具结果三档注入 + F14 错误指纹退避 + F9 七维 compact。前两件是常驻控制面的地基,后两件直接降低长会话/多厂商运营成本,彼此无依赖,可并行。
- **第二步(P1,控制面成型后)**:F2 会话池、F6 跨表面审批、F18 webhook 出站、F19 子代理 barrier/auto-wake、F24 进程管理细节、F10/F11/F13/F15/F17 模型运营件。这一批把"多表面 + 多会话 + 多代理"的治理面补齐。
- **第三步(P2/P3,按需)**:F3 dream(待记忆蒸馏 job 落地后升值)、F7/F8 权限矩阵、F16 能力 overlay、F20 @include、F22 evo 闭环(先在有无人值守需求的场景试点)、F21/F23/F25 观察评估。
- 贯穿原则:NGOAgent 的用户空间字符串启发式(F5 的拆分/zone)一律只作审批提示,grok-build 的安全边界保持 Landlock/bwrap 内核级;所有 Go chan/goroutine 模式按各条给出的 tokio 对应物重写。

---

## 2. 不吸收清单 + 理由

| # | 条目 | 理由 |
|---|---|---|
| N1 | "ShouldApprove 链式升级" | **宣称未实现**。文件说明.md:24 宣称 hook.go 有 ShouldApprove 链式升级;全仓库 Go 代码无 `ShouldApprove` 符号,实际决策链是 `normalDecide`/分类器(F4/F5 已按实际实现收录)。 |
| N2 | 安全分类器"命令级缓存" | **宣称未实现**。文件说明.md:23 宣称 classifier 有命令级缓存;classifier.go 无任何缓存结构,grep security/ 无 cache 命中。grok-build 若做分类器可自行加决策缓存,但此处无可抄之物。 |
| N3 | dream "空闲 30s 后台扫描工作区" | **宣称未实现**(job 部分)。OnIdle/OnWake 框架真实(F3),但全仓库无 `AddJob` 调用方,宣称的工作区扫描 job 不存在。吸收时框架收下,job 需自研。 |
| N4 | `forge:` 配置块(sandbox_dir/max_retries/auto_forge_on_install) | **宣称未实现**(配置死区)。config.example.yaml:36-41 有 forge 块,但 Go 侧无 `ForgeConfig` 结构体、无解析;evo 沙箱根硬编码 `/tmp/ngoagent-evo`(builtin_tool_providers.go:69),与配置里的 `/tmp/ngoagent-forge` 互不相干。 |
| N5 | README "未验证代码在 Forge Sandbox 严格验证后零风险部署" | **宣称未实现**(验证管线)。skill 侧只有 evo 状态机(draft→evolving→evolved→degraded,manager.go:263-289)+ forge_history.log 追加(292-313),无针对 skill 的沙箱验证执行管线;"零风险"为营销话术。 |
| N6 | hybrid 分类器的 LLM 升级路径 | 死代码,不照抄。pattern 置信度硬编码 0.90/0.95 ≥ 阈值 0.75,升级分支永不触发(classifier.go:74,79 vs 203-226)。吸收三策略骨架(F4)但置信度必须换成真实信号。 |
| N7 | skill Manager.StartWatcher 的 "fsnotify watcher" | 名实不符。注释称 fsnotify,实现是 30s ticker 轮询(manager.go:446+)。grok-build 已有真 fsnotify(xai-fsnotify),无需借鉴。 |
| N8 | README "10-state ReAct decision engine" | 营销表述。10 个状态存在(state.go:7-16)但注释自认是图运行时的"观测标签",实际调度是 graph 节点路由;按 F23 的实际形态评估即可,不作为独立特性。 |
| N9 | 文件说明的 @include "最大 3 层"与工具结果 "2K/8K" | 文档与代码不一致(实际 5 层、32K)。非空实现,但提醒:该项目文档滞后于代码,引用一律以源码为准(F20/F12 已按源码收录)。 |
| N10 | `extractSubCommands`/`isInSafeZone` 空白切分启发式 | 不抄实现。不处理引号/变量展开/嵌套替换,`rm "$X"` 即绕过;grok-build 的主防线是 Landlock/bwrap 内核级沙箱,用户空间启发式只能做审批提示,不能当边界。结构已并入 F5 说明。 |
| N11 | LoopPool™ / "bank-grade security" / "Unbreakable SSE" 等营销语 | 话术不吸收。实际实现分别是:map+mutex 的会话池(隔离是对象级非 OS 级)、正则黑名单+可选 LLM 分类、带重放的 SSE 缓冲——都是合格工程实现,但与措辞量级不符。 |
| N12 | Go 特有并发模式(chan 审批等待/chan 投递队列/goroutine fan-out) | 语言特有,不可直译。Rust 侧一律换 tokio mpsc/oneshot/DashMap 重写(F1/F6/F18/F19 的吸收方式已分别给出)。 |
| N13 | LLMClassifier 的 VERDICT 单行文本解析 | 脆弱模式不抄。三行文本解析易被模型输出漂移破坏;grok-build 若做 LLM 分类,用结构化输出(JSON schema/tool call)。 |
| N14 | Telegram bot / gRPC 接口层(`interfaces/bot`、`interfaces/grpc`) | 与 grok-build 表面战略不重叠(grok-build 走 ACP/Hub),且其价值在渠道插件化而非 OS agentic 本体;如需 IM 接入另行评估。 |
| N15 | provider_registry "16 厂商"数量叙事 | 实际 17 项且只是 baseURL+auth 类型的静态表,无"网关智能路由";按静态预设表吸收(F15),不接受"生态库"叙事。 |

---

## 3. 验证备注

- 行号均基于 `/tmp/ngoagent-check` 当前工作树;关键文件行数:buffered_delta.go 333、loop_pool.go 276、classifier.go 251、hook.go 610、compact.go 587、webhook.go 261、errors.go 305、context_ecosystem.go 252、sandbox.go 412、graphruntime/runtime.go 570。
- `go vet ./internal/infrastructure/{security,notify,workspace,llm}` 全部通过;全仓 `go build` 在本机因 sqlite-vec cgo 需要 sqlite3.h 未装而中断(环境问题,非代码缺陷)。
- 测试证据:49 个 `_test.go`,其中与本报告直接相关:hook_test.go(6 用例)、mode_permissions_test.go(3)、errors_test.go(真实厂商错误指纹断言)、event_bus_test.go(9,含并发派发)、graphruntime runtime_test.go(787 行)+bench(822 行)、sandbox_state_test.go/shell_state_test.go、evo_test.go/evolution_test.go/evo_contracts_test.go、api_contract_test.go(reconnect)、completeness_test.go(设计契约完备性自检)。
- 文件说明.md 是该项目自带的变更清单,与源码交叉核对后发现 5 处"宣称未实现"(N1–N5)、2 处参数不符(N9)、1 处名实不符(N7)——该项目代码质量整体扎实,但文档/营销层系统性超前于实现,引用时需逐条对源码。
