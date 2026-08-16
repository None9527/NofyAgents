# grok-build → OS-level Agentic 完整方案 v2(源码级)

> v1(`os-agentic-proposal.md`)是产品草图;v2 建立在六份源码级深抽之上:
> `os-features/openclaw.md`(33 特性,记 OC-)、`os-features/hermes.md`(30,记 HM-)、`os-features/pi.md`(25,记 PI-)、`os-features/ngoagent.md`(25,记 NG-)、`os-features/deepseek-harness.md`(27,记 DS-)、`os-features/grok-build-integration-map.md`(现状拓扑/吸收映射,记 MAP-)。
> 全部论断带源路径;crate 用脱敏后真名 `nofy-*`(docs/ 的 `xai-*` 为旧名)。

---

## 1. 现状认知修正(v1 的三处错误,本版纠正)

1. **Leader 不是"待上提",而是"已删除、器官还在"**。`nofy-pager-bin/src/main.rs:209-217` 直接 bail("leader mode was removed in the sanitized build");`:413-430` 收敛出 `LeaderMode` 后硬编码 `use_leader = false`;但 `resolve_leader_mode` 的 policy 链(flag > config > remote > sandbox)、`LeaderTargetArgs`、test-support 的 lock-file 选举夹具、`session_registry_client.rs` 全在(MAP-§1.1)。**原语义是 per-user-host 共享 agent 宿主**——空位真实存在,器官可复用,但没有一个活着的 Leader 可以"提升"。
2. **协议面不是"三套可收敛",而是"三套互不相通的消息宇宙 + 一个已有统一缝"**。ACP stdio(会话宇宙)、serve ACP-WS(同词汇不同载体+bearer)、Hub WS(工具宇宙,Principal 握手);唯一跨宇宙抽象是 `WorkspaceOps::Local|Proxy`(`nofy-workspace/src/workspace_ops.rs:1307-1347`)(MAP-§1.2)。
3. **状态面已经事件化,不需要新存储发明**。`nofy-session-journal` 24 种封闭事件词汇 + 确定性 reducer + world-state,零上层依赖,是全仓最接近 dsh"词汇包"纪律的资产;会话根 per-cwd 文件化(`{NOFY_HOME}/sessions/{encoded_cwd}/`),journal P0 不变量(seq 无空洞、terminal 门控、凭据永不入 payload、未闭合 intent 清单)可直接作为新常驻件的持久化契约(MAP-§1.3)。

**对 v1 路线的净影响**:daemon 不是"改 Leader",而是"用残留器官+新 crate 填 per-host 空位";协议收敛不是"三选一",而是"先定 schema,serve 做参考传输,ACP 挂映射桥,Hub 降级为工具传输"。

---

## 2. 目标架构与 crate 边界

```
表面层  TUI ─ ACP/IDE(映射桥)─ headless/CI ─ Web(serve 升级)─ IM/webhook(契约位,后置)
        │            控制面协议:schema-first,词汇=journal 24 事件+ACP ContentBlock+tool-protocol
nofy-daemon(per-host 单实例,lock-file 选举;宿主 registry/scheduler/approval-broker;崩溃经 journal 对账)
        │ 管理 N 个执行单元(会话 actor 族形状不变,改宿主进程)
执行层  ChatStateActor/SamplerActor/HunkTracker ─ ToolBridge ─ 沙箱(Landlock/bwrap/seccomp)─ workflow
```

六条原则(带证据):

1. **daemon 只编排不执行**:hermes `GatewayRunner` 28k 行与 `AIAgent` god object 是反例(HM-不吸收);dsh 包级 CALLS 近零是正例。
2. **词汇包先行**:`nofy-session-journal` 是已验证范本;新 crate 的错误类型与词汇类型住在自己 crate(dsh 纪律,DS-系列 §14)。
3. **认证在传输层,协议字节不掺认证**(PI-F4,`packages/server` Unix listener 用文件权限、WS 在 upgrade 认证)。
4. **schema-first + 漂移门禁**(OC-F27 TypeBox→JSON Schema→多端 codegen;本仓对应 `nofy-proto-build` 先例)。
5. **model-visible ⟺ logged 上提为产品契约**(DS):IM 批准/插话/调度注入一律落 journal 事件。
6. **默认零外呼**:脱敏先于控制面——`EndpointsConfig` 单一来源化必须先做,否则控制面会把 `api.x.ai` 固化进 schema(MAP-§5.3 热点表)。

五个新 crate(MAP-§4,依赖预算即纪律):

| crate | 职责 | 允许依赖 | 禁止依赖 |
|---|---|---|---|
| `nofy-channel` | 帧化/握手/重连/背压,传输无关 | tokio、serde、`nofy-secrets` | 任何会话/工具语义类型 |
| `nofy-session-registry` | 跨进程会话索引+foreign 源只读并入 | journal、storage adapter、`nofy-paths` | `nofy-shell`/`nofy-agent`/`nofy-sampler` |
| `nofy-scheduler` | 耐久调度,决定落 journal 事件(dsh 同款,无独立存储) | journal、`nofy-sqlite-journal` | `nofy-tools`/`nofy-shell` |
| `nofy-approval-broker` | 四条审批路径收敛为单一审批事件流 | `nofy-hooks` 类型、`nofy-tool-types`、journal | 具体工具执行、TUI |
| `nofy-daemon` | 组装以上四件+控制面监听 | 上述+`nofy-config/paths` | `nofy-pager*`、`nofy-tools` 实现、`nofy-sampler` |

落地顺序:channel+schema → registry(只读起步)→ scheduler(平移 `nofy-tools/.../scheduler/` actor+occurrence journal,工具层留 thin consumer,模型可见 schema 不动)→ approval-broker(先统一事件流)→ daemon(serve 做第一传输)。

---

## 3. 特性吸收目录(按子系统,~80 条精选)

### 3.1 L1 常驻可靠性——"不楔死、不双开、崩了能续"

| 特性 | 源 | 机制要点 | 成本 | 优先级 |
|---|---|---|---|---|
| 单实例双锁+PID 复用防御+进程身份核验 | OC-F1(openclaw `src/infra/*lock*`) | lockfile+pid 校验+启动时间戳防 PID 复用误接管 | M | P0 |
| 通道健康监视器:周期评估+重启预算+stale-socket 判定 | OC-F2 | 每通道独立重启预算,超预算自禁而非风暴重启 | M | P0 |
| 重启哨兵+restart-safe 准入+持久投递队列(崩溃恢复三件套) | OC-F6 | 重启前哨兵落盘;恢复后准入检查;未投递消息持久队列补发 | L | P0 |
| systemd sd_notify + 事件循环滞后采样 watchdog | HM-F1(`gateway/run.py` 滞后采样) | 环内自报+环外看门狗双活检测 | M | P0 |
| 非干净死亡取证:生命周期账本+关闭取证+cgroup 清扫 | HM-F3 | 死亡原因分类落账本,孤儿进程 cgroup 级清扫 | M | P0 |
| 重启退出码契约+单实例锁+接管 | HM-F4 | 退出码=重启策略语义,supervisor 按码决策 | S | P0 |
| 崩溃恢复会话状态机(clean_shutdown/resume_pending/卡循环升级) | HM-F5 | 三态恢复机,卡循环自动升级恢复策略 | M | P0 |
| Agent 缓存 LRU + cgroup 感知内存压力驱逐 | HM-F6 | 多会话 LRU + 内存压力信号驱逐,DETACHED 可磁盘 resume | M | P0 |
| 持久化运行时三原则(lane/operation/deferred write 全持久+解释器执行) | PI-F9~F11(`packages/agent/docs/harness.md`) | 只吸收三原则,不吸收未实现的 v4 整体 | M | P1 |
| BufferedDelta 重连重放(run 与连接解耦,Attach(last_seq) 增量) | NG-F1(`buffered_delta.go` 333 行) | 断线切缓冲模式,重连按 seq 增量重放——Hub/ACP 断线恢复直接模板 | M | P0 |
| interruptedTurnClosers:崩溃尾巴合成边界+幂等重试指引 | DS-#16(`core/session/src/repair.ts:27-134`) | 未决工具调用按 `TOOL_OUTCOME_UNKNOWN`/`TOOL_NOT_STARTED` 两码闭合,kill -9 后无损续跑 | M | P0 |
| write-behind:有界批写+flush barrier | DS-#18 | 与 checkpoint fail-closed 配合,可控延迟换崩溃不丢一致性 | M | P0 |
| 持久化 barrier 作为工具语义:`persistence_uncertain` | DS-#4 | 工具结果自带持久化确定性语义,恢复对账有据 | S | P1 |
| daemon 安装:launchd/systemd 单元生成与重启策略 | OC-F4 | `install-daemon` 子命令生成单元文件 | S | P1 |
| 启动器冷启动快速路径+compile-cache+respawn | OC-F5 | help/version 预计算元数据,冷启动不加载运行时 | M | P1 |
| BOOT.md:agent 驱动的启动自检会话 | OC-F32 | 启动时跑一次自检 agent 会话,输出健康报告 | M | P2 |

### 3.2 控制面协议——"先定词汇,再挂传输"

| 特性 | 源 | 要点 | 成本 | 优先级 |
|---|---|---|---|---|
| 帧纪律:长度前缀帧+校验后编码+违规即拒(`ProtocolValidationError`) | PI-F1~F3 | payload 用 JSON 不用 CBOR(PI-不吸收#1);快照权威、progress 仅 UI hint | M | P0 |
| hello 版本协商+传输层认证 | PI-F4 | 首帧 hello 协商;Unix 用文件权限、WS 在 upgrade 认证 | S | P0 |
| 设备身份=公钥派生+challenge 签名握手 | OC-F14 | 设备配对,多端同一身份模型 | M | P1 |
| nodes 能力声明:connect 时声明 caps/commands,运行时审批只能收窄 | OC-F15 | 能力声明单调收窄,防提权 | M | P1 |
| 副作用方法幂等键+原子准入 | OC-F19 | send/agent 类方法带幂等键,重放不重复执行 | M | P0 |
| steering 注入点:循环检查点+工具批边界+转录提交等待 | OC-F17 | 插话在三类检查点被消费;本仓落点 `InterjectionBuffer`/`PromptQueue`(MAP-§1.3) | M | P0 |
| turn-interruption:可恢复转录的中断语义 | OC-F18 | 中断后转录仍可续接(`appendInterruptedTurnMessage`) | M | P1 |
| schema-first codegen 链+版本协商+漂移门禁 | OC-F27 | schema→多端类型;CI 门禁防漂移 | M | P1 |
| 会话谱系表:链式代际+内容来源标记 | OC-F29 | session_nodes/windows 代际链,fork/resume 可追溯 | M | P1 |
| ACP 兼容桥:在 `AcpAgentChannel` 与控制面 channel 间双向映射 | MAP-§3.2 Step2 | `--stdio`=控制面 stdio 传输+ACP 映射;`mvp_agent/acp_agent.rs` 不动 | M | P0 |
| Hub 降级为工具传输,`workspace.*` 改由 daemon 授权转发 | MAP-§3.2 Step3 | `WorkspaceOps::Proxy` 语义不变 | M | P1 |

### 3.3 调度与事件总线

| 特性 | 源 | 要点 | 成本 | 优先级 |
|---|---|---|---|---|
| Automations(cron)引擎:catch-up/backoff/watchdog/自禁用/启动修复 | OC-F9 | 错过窗口按策略追赶;连续失败自禁用并留痕 | L | P0 |
| heartbeat=系统自有 cron 投影+scratch 便签 | OC-F10 | 周期自检与便签状态分离 | S | P1 |
| Cron 子系统:调度文法+心跳/成功双文件+跨进程 flock 超时+HOME_CHANNEL 投递 | HM-F10 | 投递目标声明化;flock 防双跑 | M | P1 |
| system-event:操作者事件总线+presence+wake 路由 | OC-F13 | 事件按在线表面路由唤醒 | M | P2 |
| event-sourced schedule:调度状态=会话日志纯 fold(create/delete/dispatch 事件+seedLength fork 感知) | DS-#1(`packages/schedule`) | 定时任务随会话持久化/fork/压缩存活;本仓落点 `nofy-scheduler` | M | P0 |
| fixed-rate latest-only 追赶:不补发积压 | DS-#2 | 错过窗口只投最新一次,防风暴 | S | P0 |
| 一次性定时器 clamped arm+每次唤醒重校墙钟+idle 通道投递 | DS-#3 | 与 #17 真 idle 通道联动 | S | P1 |
| jobs:session 栅栏+controller 闸门+双通道完成投递 | DS-#5(`packages/jobs`) | 完成投递竞态有账本(D2 深潜) | M | P1 |
| runMaintenance 真 idle 通道:第三相位+wake 闩收敛后重放 | DS-#17(`core/agent-loop/src/agent.ts:142-163`) | 维护任务(压缩/调度投递/记忆整理)只真 idle 运行、对外仍 idle——一切"闲时做事"的前置 | M | P0 |
| OnIdle/OnWake 空闲框架(job 自研) | NG-F3(`loop.go`) | 框架真实,宣称的扫描 job 不存在(NG-N3) | S | P2 |
| fs 事件→任务绑定(防抖+预算+自毁守卫同构物) | HM-F21+本仓 `nofy-fsnotify` | 可调 shell/排任务的事件规则需拒自毁型 | M | P1 |

### 3.4 全局状态与记忆

| 特性 | 源 | 要点 | 成本 | 优先级 |
|---|---|---|---|---|
| writer-run 写栅栏:进程内 writer queue × 跨进程 BEGIN IMMEDIATE 双保险 | OC-F8 | 被取代的 run 无法提交过期转录;本仓 journal seq 不变量已近形,缺跨进程声明(MAP-§1.5) | M | P0 |
| session-checkpoint-policy:per-request fail-closed(模型请求/工具副作用前日志前缀必须已耐久) | DS-#8(`session-checkpoint-policy/src/index.ts:31-84`) | 失败即不发起;三道闸深潜 D3 | M | P0 |
| ProjectionValueStore:higher-seq-wins 三情形+init/apply/view 纯同步单元 | DS-#23/#24(`client/runtime/.../projection-store.ts`) | 多客户端投影一致性;stateVersion+same-reference 门 | M | P1 |
| SessionDB 全局索引(SQLite+内容寻址去重+end_reason 谱系) | HM-F8 | 单库多表服务全局列表/检索 | M | P0 |
| FTS5 多 tokenizer(unicode61+trigram+原生 CJK bigram) | HM-F9(`native/fts5_cjk`) | 中文跨会话检索刚需;本仓 `storage/search_fts.rs` 已有 FTS 层可扩 | M | P0 |
| 记忆冻结快照注入+promptware 扫描+prefetch/sync 钩子 | HM-F11 | 会中写盘不改 prompt 护前缀缓存;加载期投毒扫描 | M | P1 |
| Curator 硬不变量:只碰自创/只归档不删/pinned 豁免 | HM-F18 | 后台策展的安全边界 | M | P1 |
| background_review:fork 隔离+工具白名单+缓存感知重放 | HM-F19 | 轮后反思不污染主会话;Rust 用"快照+新运行时"不 deepcopy(HM-不吸收) | M | P1 |
| dreaming 三相蒸馏+改写 preimage+memory-host-sdk 能力契约 | OC-F11 | 浅/深/REM 三相;preimage 保留可回滚 | L | P2 |
| goal/plan 作为 logged state:严格 fold+CAS 迁移;goal-round pre-step 预留校验 fail-closed 原子化 | DS-#6/#7(`packages/goal`、`packages/plan`) | 模式切换与 step 接受原子化;失效即 reject 并归还同批消息 | M | P1 |
| 审计事件存储:metadata-only+假名化+保留期/行数上限 | OC-F12 | 审计不存内容,本仓 `projection_audit.rs` 同纪律可合流 | M | P1 |
| 工具结果三档注入+spill(<2K 内联/2K-32K 带 header/>32K 落盘+路径) | NG-F12(`compact.go`) | 一个函数管住上下文预算 | S | P0 |
| doCompact 七维摘要+密度感知切割+深度守卫(>3 次退化原文) | NG-F9 | 长会话压缩闭环 | M | P1 |

### 3.5 跨表面审批与治理

| 特性 | 源 | 要点 | 成本 | 优先级 |
|---|---|---|---|---|
| 跨表面审批路由:审批管理器+操作者存储+推送 | OC-F16 | 任意在线表面应答;本仓落点 `nofy-approval-broker`,替代 `request_permission` 本地假设(MAP-§4.4) | L | P0 |
| sandbox × tool-policy × elevated 三正交+explain 诊断 | OC-F20 | 三轴独立配置+人读诊断;收编本仓第四条旁路(sandbox 激活自动批准 bash,MAP-§L3 摩擦) | M | P0 |
| exec-approvals:fail-closed 存储+本地 socket 协议+命令解析 | OC-F21 | 审批存储损坏即拒绝而非放行 | L | P0 |
| pre-auth 硬化:每 IP 连接预算+未授权洪水守卫+速率限制 | OC-F22 | daemon 暴露 loopback 外的前置条件 | S | P1 |
| YOLO 冻结+contextvar 会话身份+ACP 选项桥 | HM-F20 | 会话身份任务局部化(GHSA 教训);危险模式不可热升级 | M | P1 |
| 生命周期守卫:拒绝自毁型 cron/命令(命令形状锚定) | HM-F21 | agent 不能排掉自己的看门狗 | S | P1 |
| 轮次租约:按已解析 session_id 串行化(防别名键并发) | HM-F17 | 同会话跨表面并发 prompt 串行 | M | P1 |
| 投递义务账本:最终回复 at-least-once 不丢 | HM-F16 | 回复投递与生成解耦,崩溃后补投 | M | P1 |
| 安全分类器三策略骨架(pattern/llm/hybrid)+结构化输出 | NG-F4(换 JSON schema 输出,NG-N13) | 只作审批提示,不当边界(NG-N10) | M | P2 |
| mode_permissions 矩阵(Allow/Auto/Ask 按模式×工具类) | NG-F5 | 权限词汇表矩阵化,本仓 `wire_enum!` 可承载 | S | P1 |
| 配置写 CAS:锁时 baseHash 比对+applied-hash 发布 | OC-F33 | 多表面并改配置不互踩 | M | P1 |
| /api 浏览器信任栅栏:WHATWG Host 规范化+loopback/trustedHosts+sec-fetch-site+Origin 四层判定 | DS-#22(`client/connection/src/api-request-trust.ts:96-121`) | serve 模式暴露本地 HTTP/WS 的安全底线,堵 DNS rebinding;判定顺序深潜 D5 | M | P0 |
| 注入抗性帧:提醒/通知固定信封 | DS-#21 | 系统注入内容不可被模型/用户输入伪造 | S | P1 |
| permission-presets:intent 事件+knob write-through+custom 派生 | DS-#20 | 权限旋钮变更即事件,审计可折叠 | M | P1 |
| self-modification 审批链:per-package 人批+steer-back | DS-#19(`cordis-host-runner`) | agent 挂载自身插件需人批;Client 激活语义 | L | P2 |

### 3.6 执行世界与进程管理

| 特性 | 源 | 要点 | 成本 | 优先级 |
|---|---|---|---|---|
| 登录 shell 环境快照:原子发布+注入安全导出转储 | HM-F13 | 沙箱内命令环境一致性 | M | P1 |
| CWD 带内标记+输出限流 spill(命令状态跟踪双件) | HM-F14 | 与本仓 spill 机制合流 | S | P1 |
| 进程注册表:滚动缓冲+检查点恢复+watch 通知熔断 | HM-F15 | 后台进程有登记、可恢复、通知不风暴 | M | P0 |
| 子代理 barrier+auto-wake(计数齐唤醒父 loop+进度事件) | NG-F19(`subagent_orchestrator.go`) | 多代理编排参考实现 | M | P1 |
| workflow 宿主请求路由到常驻面(`WorkflowHostRequest` 词汇现成) | MAP-§生态+DS workflow seam | `ReserveAgentCalls/SpawnAgent/Pause` 等路由出会话 | M | P2 |
| realm 沙箱(worker-thread materialize/instanceof 补丁) | DS(`cordis-host-runner/sandbox.ts`) | self-modification 的执行隔离参考 | L | P3 |
| 进程外 provider 公共件:env 清洗、cwd 可进入性、never-reject settlement | DS-#12 | 子代理/外部进程.spawn 的安全公共件清单 | M | P1 |
| workflow worker-thread:scrubbed env+grace 强杀+start/end 配对账本 | DS-#13 | worker 生命周期有账本,强杀有宽限 | M | P2 |
| SubagentCapabilities 位+fail-loud 能力闸;委托深度 header 权威只增不减 | DS-#9/#10 | 能力"存在即能力"四位布尔;深度防环 | S | P1 |
| fork provider:completed-turn prefix 作为 seed | DS-#11 | fork 只取已闭合 turn 前缀,与 #15 OPEN_TURN 族错误码配套 | M | P1 |

### 3.7 模型运营

| 特性 | 源 | 要点 | 成本 | 优先级 |
|---|---|---|---|---|
| failover 阶梯:失败原因分类学+profile 轮换→模型回退两级升级 | OC-F30 | 先换凭据再换模型,语义分明 | M | P0 |
| FailoverReason 错误分类学+恢复提示标志 | HM-F22 | 本仓落点 `nofy-sampler/retry.rs classify_error` 之上加层(MAP-§模型运营) | S | P0 |
| 凭据池:OK/EXHAUSTED/DEAD 状态机+分级冷却+四策略+租约 | HM-F23 | 多 key 轮换的工程化形态 | M | P0 |
| 错误指纹两级分类(状态码→body 指纹)+分级退避+后台任务禁重试 | NG-F14(`errors.go` 305 行,真实厂商 mock 测试) | 与 HM-F22 合流为统一分类学 | S | P0 |
| generations:每 agent 原子模型运行时快照+lease/retention | OC-F24 | 配置热加载与运行一致性 | M | P1 |
| 辅助路由链+models.dev 目录 stale-while-revalidate | HM-F24 | 数据源换本地 models.json(PI-不吸收#5),机制保留 | M | P1 |
| samplingParams 逃逸舱(原样合并、最后覆盖) | PI-F22 | 自建推理服务私有参数不穷举 | S | P0 |
| compat 旗标表+按 baseUrl 自动探测+配置覆盖 | PI/SUMMARY | 一个 openai-completions 适配器吃方言 | M | P0 |
| OAuth 刷新双检锁(CredentialStore.modify 串行 RMW) | PI-F21 | 防 double-refresh | S | P1 |
| 16 厂商静态预设表(去叙事,按表吸收) | NG-F15 | baseURL+auth 类型静态表,作 BYOK 向导种子 | S | P2 |

### 3.8 生态与供应链

| 特性 | 源 | 要点 | 成本 | 优先级 |
|---|---|---|---|---|
| 供应链门禁:minimumReleaseAge+trust verdict(fail-closed) | OC-F23 | 依赖发布满龄才允许;ClawHub 判定 fail-closed | M | P1 |
| 插件发现:manifest 声明+构建产物隔离区 | OC-F25 | 静态描述可不加载运行时读取(Gateway 启动 guardrail) | M | P2 |
| Docker build-arg 插件子集抽取 | OC-F26 | 镜像按需带插件,层缓存友好 | S | P2 |
| 平台适配器契约形状(passive/active 依赖分离+requires_env 进向导) | HM-F12 | 作为未来 channel 扩展位契约,不建 22 渠道 | S | P2 |
| 工具注册表 generation 计数缓存失效+插件 override 安全闸 | HM-F25 | 动态工具刷新的并发安全 | S | P1 |
| Hooks 事件桥:目录发现+错误永不阻塞主管线 | HM-F27 | 本仓 hooks 现 fail-open,补"永不阻塞"纪律 | S | P1 |
| hooks 桥:detach/drain 静默+600s 超时+invoked/result 耐久配对 | DS-#14(`hooks-claude-code`) | 钩子崩溃不拖主管线;调用有耐久账本;CC/Codex 事件映射表 | M | P1 |

### 3.9 工程可信

| 特性 | 源 | 要点 | 成本 | 优先级 |
|---|---|---|---|---|
| fenced writer lease(存储写租约) | PI-F13 | 与 OC-F8 合流为写一致性双保险 | M | P0 |
| faux 无 key e2e(脚本化回放+override sidecar) | PI-F19/DS llm-replay | 本仓 `MockInferenceServer` 已等价(MAP-§5.2),补 `{{fromRequest}}` 式注入 | S | P0 |
| 预算棘轮:max-lines ratchet+env 预算+knip 死代码 | OC-F28 | 行数只降不升的 CI 棘轮 | S | P1 |
| WAL 降级阶梯:探测-降级-拒降三级+版本漏洞闸 | HM-F28 | 容器/NFS 场景 sqlite 不楔死 | S | P0 |
| 压缩跨进程租约(DB 锁而非文件锁) | HM-F29 | 与 journal terminal 门控合流 | S | P1 |
| 密封测试不变量+trajectory 首末保护 | HM-F30 | 训练/回放数据纪律 | M | P2 |
| 遥测 NOOP 契约+conformance 测试套件 | PI-F25 | 替换 Mixpanel/Sentry 的目标形态 | S | P0 |
| 逐文件 100% 覆盖=死代码探测器+豁免列名带理由 | DS(11 篇) | 覆盖率纪律移植 | M | P2 |
| guard 双件:重复调用提醒+scoped TOOL_TIMEOUT | DS-#27(`packages/guard`) | 循环卫生守卫挂在事件层,不入侵调用链 | S | P1 |
| llm-replay override sidecar+`{{fromRequest:regex}}` 注入 | DS-#26 | 无 key 回放可补 throw/hang/运行时值 | S | P0 |
| workspace-server probe 二进制作常驻件验收模板 | MAP-§5.2 | `PROBE_OK` 式 e2e 探针 | S | P0 |

### 3.10 套件/专家包:收敛 subagent 作为分发单元(WorkBuddy 对照)

> 背景:腾讯 WorkBuddy 的产品形态是 **专家 = 人设 + 自带技能 + 连接器(MCP)**,市场分发、一键召唤为收敛 subagent,场景级"专家团"再编排。v2 初版只把 dsh 的 preset/bundle/subagent-provider 放在机制层,未升为产品一等抽象;本节补齐。源码核实:`packages/preset/agent-presets/src/index.ts:1-60`(standing mount + scope join 语义)、`apps/cli/config/agent-presets/standard/agent.cordis.yml`(persona/skill/subagent 行 + isolate 强制)、`packages/preset/persona/`。

**概念映射**:

| WorkBuddy | dsh 对应物 | grok-build 落点(新) |
|---|---|---|
| 专家(人设+技能+连接器) | **preset**:一份 `cordis.yml` 收敛 persona 行(`dsh-persona`,`{{model}}`/`{{cwd}}` 模板)+ skill 层 + 工具/委托 roster | `nofy-pack` manifest v1 |
| 召唤 | agent 工厂 `setup(agentCtx)` 钩子 join standing mount;**被拒组合整体回滚创建**(index.ts:24-27) | pack 加载=会话 preset join 或 subagent 定义实例化,失败 fail-loud |
| 技能标签 | per-scope 分层 skill catalog(`skill-filesystem` 本地根 + `tool-skill` 装载器,合并目录,standard preset :76-87) | pack 的 `skills[]` 白名单层叠进现有 skills watcher |
| 连接器 | MCP roster 行(组合格式可承载;注册表在 host 面) | pack 的 `mcp[]` 编译为会话 MCP 装配 |
| 专家团/精选场景 | orchestrator preset:subagent 行指向其他 preset(`tool-subagent-codex/claude-code` 同款)+ workflow 编排 | workflow 模板引用 pack 列表 |
| 市场分发 | `discovery.ts`(USER_PRESET_DIR)+ `authoring.ts`(copyComposition)+ `metadata.ts`(PresetMetadata 展示面) | plugin-marketplace 增加 pack 类型 |

**吸收特性**:

| 特性 | 源 | 要点 | 成本 | 优先级 |
|---|---|---|---|---|
| standing mount + scope join:一个组合只挂载一次,会话以 scope 父系加入,冷转录读取同解析 | DS-P1(`agent-presets/src/index.ts:14-27`、`mount.ts`) | 专家≠每会话复制一份运行时;状态按 session key 留在插件内 | M | P1 |
| isolate realm 强制断言:服务行必须在 isolate 组,泄入根 realm 即 mount 拒绝 | DS-P2(`invariant.ts` + preset 注释 :11-19) | 多专家同进程零碰撞的硬保证;`leakedServices` 做加载期检测 | M | P0 |
| persona 行 + 模板变量 + 部署默认遮蔽 | DS-P3(`packages/preset/persona/`) | 人设即配置行,可被上层 patch 遮蔽 | S | P1 |
| 宿主面/代理面所有权判据:"注入服务的行归宿主面" | DS-P4(standard preset 注释 :29-33) | pack 不拥有注册表/沙箱/审批/持久化/模型路由——与 §2 原则 1 同构 | S | P0 |
| 委托行即专家召唤:`tool-subagent` config 挂 provider,外部专家(codex/claude-code)独立进程 | DS-P5(standard preset :186-190 + DS-#12 进程外公共件) | 召唤第三方专家=声明一行 provider | M | P1 |
| preset 发现/创作/元数据三件=市场面 | DS-P6(`discovery/authoring/metadata.ts`) | 用户目录发现、复制式创作、展示元数据渲染 | M | P2 |

**grok-build 设计草图**(`nofy-pack`):

```
pack.toml / pack 目录:
  persona.md            # 人设(对应 dsh-persona 行)
  skills = ["..."]      # 白名单,层叠进 skills watcher
  mcp = [{name, ...}]   # 连接器 roster
  tool_policy = "..."   # 引用 approval-broker 策略名,不内嵌策略本体
  model_route = "..."   # 可选,走 generations 快照
  subagents = [{id, provider, pack?}]  # 专家团:指向其他 pack 或外部 ACP 专家
```

编译目标二选一:会话级(整个会话 join 该 pack,=WorkBuddy"与专家对话")或 subagent 级(主代理按需召唤,=工具面)。纪律继承 DS-P4:pack **不携带**沙箱/审批/持久化语义,只携带面向模型的组合;治理面统一走 §3.5。分发走 marketplace(pack 类型),调度走 `nofy-scheduler`(cron 召唤专家=自动化×套件)。

**路线图插入**:DS-P2/P4 进 P0 批次 D(控制面词汇期就定 pack 的宿主面/代理面边界);pack manifest v1 进 P1;marketplace pack 类型与专家团模板进 P2。

**单 agent 单 pack 纪律(源码)**:dsh 会话的 preset 是单值——`agentPreset: string`,blank 期可换、newest-wins,换动作落 `agent-preset/selected` 日志事件(`agent-presets/src/session.ts:13-27`,`resolveSessionPreset` 重建只认日志不认 header)。**多套件不靠单 agent 叠 preset,而靠编排层给每个任务/子代理各 join 一个 pack**——见 §3.11。

### 3.11 任务管理:项目选多套件+编排执行

> 需求形态(WorkBuddy 对照):左侧"项目"持有任务列表,一个项目可选多个专家/套件,任务可编排(顺序/并行/依赖)执行,配合"自动化"周期跑。v2 初版有引擎件(workflow/subagent/scheduler/goal)但无项目级任务管理层;本节补齐。

**设计原则(由 §3.10 单 pack 纪律推出)**:

1. **项目 = pack 集合 + 编排策略**,不是超大 preset。`.nofy/project.toml` 声明 `packs[]`、编排模式、失败策略;任务 DAG 里的每个节点 = 一次 agent/subagent 生成,**恰好 join 一个 pack**。
2. **编排是 daemon 面的声明式编译**,不是会话内脚本:项目 manifest 的任务图编译为 workflow run(本仓 Rhai 引擎现成:`SpawnAgent`/预算/`Journal` 确定性回放/`PauseKind` 五值,docs/09),会话内只执行单任务。
3. **验收即 logged state**:每任务的完成判据走 goal 机制(DS-#6/#7 严格 fold+CAS+pre-step fail-closed 原子化),不靠模型自述"完成了"。
4. **fan-in 与投递有账本**:barrier 计数齐唤醒父 loop(NG-F19);最终结果 at-least-once 投递(HM-F16);失败追赶/自禁用走 automations 语义(OC-F9)。
5. **任务生命周期进 journal 词汇**:扩 `task.*` 事件(armed/claimed/settled/escalated),继承 seq 无空洞/凭据不入 payload 等 P0 不变量(MAP-§治理),崩溃后 daemon 凭 journal 对账续跑(D4 深潜同款)。

**特性吸收**:

| 特性 | 源 | 要点 | 成本 | 优先级 |
|---|---|---|---|---|
| 单 preset 单值+选择落日志(newest-wins) | DS-P7(`agent-presets/src/session.ts:13-47`) | 多套件编排的反面纪律:叠装禁止,分配唯一 | S | P0 |
| workflow host 请求词汇+Journal 确定性回放+五值暂停 | DS(`packages/workflow`)+ 本仓 `nofy-workflow` `WorkflowHostRequest` | 编排引擎不新造;宿主请求路由到 daemon(MAP-§生态) | M | P1 |
| goal-round 预留校验作任务验收 | DS-#6/#7 | 验收原子化,失效即 reject 归还消息 | M | P1 |
| barrier+auto-wake 作 fan-in | NG-F19 | 并行任务齐套唤醒编排者 | M | P1 |
| 投递义务账本 | HM-F16 | 任务结果跨表面不丢 | M | P1 |
| catch-up/backoff/自禁用 | OC-F9 | 周期编排(自动化×套件)的失败语义 | S | P2 |
| 本仓 todo/plan/hunk 三件作单任务内管理 | docs/04/09 | 不升级为跨任务语义,边界清晰 | S | P1 |

**项目 manifest 草图**:

```toml
# .nofy/project.toml
packs = ["code-review", "sec-audit", "docs-zh"]
[orchestration]
mode = "dag"            # dag | pipeline | swarm
parallel = 4
on_fail = "retry(1)"    # retry(n) | escalate | skip
[[task]]
id = "review"
pack = "code-review"
goal = "审查本分支变更,输出风险清单"
verify = "gate:review-signoff"   # goal 验收或命令门
deliver = ["tui", "im:ops"]
[[task]]
id = "sec"
pack = "sec-audit"
needs = ["review"]      # 依赖边
```

编译与执行链:daemon 读 manifest → 拓扑排序+预算分配 → 每任务 `SpawnAgent`(join 单 pack)→ barrier fan-in → goal fold 验收 → `task.*` 事件落 journal → 投递账本分发 → 失败按 on_fail 升级(escalate 走 §3.5 跨表面审批)。

**路线图插入**:P1 出 project manifest + 单任务执行(pack join+goal 验收);P2 出 DAG/并行/barrier+`task.*` journal 词汇+投递账本;P2/P3 接 `nofy-scheduler` 做周期编排(自动化×套件)。

### 3.12 文件管家(File Steward):OS 级文件理解与管理

> 结论:**需要,但拆两半,且默认不当全盘扫描器**。现状缺口:grok 文件能力全在项目内(fs 工具/沙箱/hunk/codebase-graph;memory FTS 只索引记忆目录);五参考同样止于 workspace(openclaw 有 document-extract/vault 扩展,无系统级索引)。OS agentic 的差异化正是"跨项目文件脑",但它也是最大隐私面。

**拆分原则**:

1. **理解在 daemon 侧**:索引只读、真 idle 才跑(DS-#17 通道)、预算棘轮约束;产物是"提示"不是"事实"——任何操作前对真实文件再验证(PI-F3 快照权威思想的变体:索引会漂移,磁盘才是真相)。
2. **管理走执行侧**:文件操作经 workspace runtime 的沙箱与 §3.5 审批;删除约定 trash-over-delete;批量操作两阶段 intent(journal `intent_id` 未闭合清单同款,MAP-§治理)+ 回滚快照。
3. **roots 空默认 opt-in**:未选根=无索引;每根两档策略(`index-only` / `manage`);根外操作一律 escalate 到审批 broker。

**理解侧设计**:

| 件 | 机制 | 出处/落点 |
|---|---|---|
| 索引三层 | metadata(mtime/size/kind/provenance)+ FTS(CJK bigram)+ 可选 embeddings(默认关,BYOK embedding provider) | HM-F9 的 tokenizer 栈;grok `storage/search_fts.rs` 扩 |
| 增量管道 | per-root watcher→§3.3 事件总线;真 idle 增量索引;内容提取管线(pdf/docx/图片描述)提取文本入索引、原文按需读 | openclaw `document-extract` 扩展;DS-#17 |
| file-activity 图 | journal 的 `tool.*` 文件副作用全局化:哪个任务/会话改过哪个文件;与 hunk-tracker 合流 | 本仓 journal+hunk;新增 `file.*` 事件族 |
| 隐私四件 | 全设备本地;retention+`forget` 命令(索引被遗忘权);redaction;审计 metadata-only | OC-F12 审计存储纪律 |
| 注入纪律 | 文件摘要/清单进模型上下文走冻结快照(HM-F11),会中索引变化不改 prompt 护前缀缓存;model-visible ⟺ logged 落 `file.referenced` 事件 | DS 不变式 |

**管理侧设计**:

- 工具面:`move/rename/tag/dedupe/cleanup/summarize`,全部高风险分级;Auto 档只在根内+风险阈值下生效,其余 Ask(NG-F5 矩阵,阈值启发式只作提示,NG-N10 教训)。
- 整理建议即任务:steward 产出"建议 DAG"(移动/归并/清理)→ §3.11 编排执行 → 人一键批准整批(批级审批=一次 Ask,逐条执行带账本)。
- 跨项目检索:`find` 语义=索引提示+根内实读二次确认;结果带 provenance(哪根/何时索引/是否已变化)。

**产品形态**:**内置专家包 `file-steward`**(§3.10 机制零新架构):persona(文件管家)+ skills(find/organize/summarize/cleanup/dedupe)+ connectors(fs-index 只读 + fs-manage 受控)+ tool_policy=strict。OS 面可被 daemon 召唤(周期整理=§3.11 自动化);项目面可被会话挂载(=现有 fs 工具的增强视图,根自动含该 workspace)。

**吸收特性**:

| 特性 | 源 | 成本 | 优先级 |
|---|---|---|---|
| document-extract 提取管线+vault 加密根 | openclaw extensions | M | P2 |
| FTS5 CJK+per-query 连接+WAL 并发读 | HM-F9/grok `nofy-memory/backend.rs` 同款 | S | P1 |
| fs seam+`fs/*` 策略事件+结构化 `FS_SANDBOX_DENIED`(拒因不靠文本推断) | DS-06 篇 | M | P1 |
| 真 idle 索引通道 | DS-#17 | S | P1 |
| 审计 retention+假名化 | OC-F12 | S | P1 |
| 冻结快照注入护缓存 | HM-F11 | S | P1 |

**风险**:索引与现实漂移(对策:操作前再验证);扫描资源(对策:idle+预算+per-root 暂停);隐私(对策:空默认+forget+本地);"管家越权"恐惧(对策:trash-over-delete+批级审批+全账本可回放)。

**路线图插入**:P1 出 fs-index v1(metadata+FTS,根 opt-in,`fs/*` 事件接入);P2 出提取管线+embeddings 可选+`file-steward` 包+建议 DAG;P3 评估 OS 集成面(Spotlight/Everything 桥接作 provider,不内置)。

---

## 4. 分阶段路线图(特性批次+验收)

**P0(6–8 周)地基:可信常驻+可检索+可失败转移+控制面词汇**
- 批次 A 脱敏先行:`EndpointsConfig` 单一来源化→BYOK 扶正(compat 旗标+samplingParams+凭据池 HM-F23)→遥测 NOOP 化→`rg -i 'grok|xai|x\.ai'` 归零(MAP-§5.3 验收口径)。
- 批次 B 常驻可靠性:OC-F1/F2/F6+HM-F1/F3/F4/F5+NG-F1;daemonize 复用 `nofy-workspace/src/daemonize.rs`。
- 批次 C 状态地基:OC-F8+PI-F13 写栅栏;HM-F8/F9 全局索引+CJK FTS;HM-F15 进程注册表;WAL 阶梯 HM-F28。
- 批次 D 控制面词汇:`nofy-channel`+schema crate(journal 24 事件+ACP ContentBlock+tool-protocol+rpc 错误码);serve 升为参考传输;ACP 映射桥;**pack 的宿主面/代理面所有权边界与 isolate 断言同期定死(DS-P2/P4)**。
- 验收:daemon 崩溃→新实例 journal 对账续跑;TUI/ACP/headless 同会话真相;跨项目中文 FTS 命中;全链路无 key e2e(MockInferenceServer)。

**P1(6 周)跨域与治理**:cron 引擎(OC-F9+HM-F10)+fs 事件绑定;记忆冻结快照+curator;审批 broker 收编四路径(OC-F16/F20/F21+HM-F20/F21);generations;设备签名鉴权;steering 三检查点;供应链门禁;预算棘轮;**`nofy-pack` manifest v1(§3.10:standing mount+scope join+persona+skill 层+委托行),会话级与 subagent 级两种编译目标;`.nofy/project.toml` 项目 manifest+单任务执行(pack join+goal 验收,§3.11);fs-index v1(metadata+FTS、根 opt-in、`fs/*` 事件接入,§3.12)**。
- 验收:合盖后 cron/事件任务继续;IM-未接但 webhook 表面可批准高危操作(fail-closed 演示)。

**P2(6 周)多表面与生态**:webhook+一个 IM 契约实现(HM-F12 形状);dreaming;system-event 总线;会话谱系表;hooks 桥 CC/Codex;Docker 子集;trajectory 纪律;**marketplace pack 类型+专家团 workflow 模板+`nofy-scheduler` 召唤专家(DS-P6,§3.10);任务 DAG/并行/barrier fan-in+`task.*` journal 词汇+投递账本+周期编排(§3.11);提取管线+embeddings 可选+内置 `file-steward` 包+整理建议 DAG(§3.12)**。
- 验收:第三方可按 manifest 契约零核心改动接入新表面。

**P3(持续)执行世界谱系**:docker/ssh 执行世界(HM-F13/F14 合流);workflow 宿主请求路由出会话;realm 级 self-modification 隔离评估;原生 app 不承诺。

---

## 5. 不吸收清单(六份文档合并,按类)

- **god object**:hermes GatewayRunner/AIAgent/hermes_state mixin 巨类;openclaw gateway 70+ 子域聚合倾向;本仓对应风险 `nofy-workspace/handle.rs` 10,030 行与 `nofy-shell` 58 依赖(MAP-§5.1)——daemon 化时第一拆分对象。
- **语言特有**:hermes deepcopy-fork、AST 工具发现、pip 懒安装、线程局部静默;NGO chan 审批/goroutine fan-out、VERDICT 文本解析;pi CBOR 本体、in-proc TS 扩展、一 session 一 SQLite 文件;dsh Cordis 运行时插件树、declaration merging 类型表、`!!js` 配置表达式、typert 类型图、worker-thread realm 补丁(DS 不吸收清单 10 项)——机制可借,载体不搬。
- **宣称未实现(NGO 五条)**:ShouldApprove 链式升级、分类器命令级缓存、dream 扫描 job、forge 配置块、Forge 验证管线——引用 NGO 一律以源码为准。
- **叙事不吸收**:LoopPool™/bank-grade/Unbreakable SSE 话术、16 厂商"生态库"叙事、10-state ReAct 营销表述。
- **专有/商业**:billing/credits/portal、relay/gateway 专有 WS、install ping、归因头。
- **pi harness v4 整体**(未实现占位,只收三原则)、PiServer 9 命令 schema(太窄)、22 渠道本体(只收契约)。

---

## 6. 风险与对策

| 风险 | 对策 |
|---|---|
| daemon 滑向 god object | 五 crate 依赖预算+禁止依赖清单;`handle.rs` 拆分先行;预算棘轮 OC-F28 对 daemon crate 生效 |
| 控制面固化专有端点 | 脱敏批次 A 先于 schema crate(原则 6) |
| 协议收敛二次返工 | PI-F1~F5 五条一次性设计到位(PI 吸收顺序建议:拆开做必返工,~2-3 周) |
| 审批统一触动四条路径回归 | 先统一事件流、策略合并后置(MAP-§4.4 顺序) |
| 文档/营销超前于实现(NGO 教训) | 本方案所有引用以源码行号为准;待核实清单单列(MAP 附录 7 条) |

---

## 7. 指标

- 北极星:非 TUI 发起且跨表面闭环任务占比 ≥20%(P2+3 月)。
- 可靠性:daemon 7 日存活 ≥99%;崩溃恢复成功率 ≥99.5%(journal 对账);投递 at-least-once 丢失=0。
- 工程:无 key e2e 覆盖所有新组件;`rg -i 'grok|xai|x\.ai'` 归零;daemon crate 行数棘轮只降不升。
- 生态:channel/skill 第三方接入数(斜率指标)。

---

## 8. 待核实清单(承接 MAP 附录)

1. Leader 是否计划恢复(影响 ACP 桥设计);2. `session_registry_client` 远端服务端存否;3. convergence governor 接入点;4. evals 度量回路是否重建;5. schema 载体 JSON Schema vs protobuf;6. `nofy-memory/dream.rs` 启用条件与外呼面;7. `activity.rs` 与 journal 投影重叠度。
> DS- 深抽已落地(27 条,P0×10):schedule(#1-3)、checkpoint/write-behind(#8/#18)、interruptedTurnClosers(#16)、真 idle 通道(#17)、信任栅栏(#22)等行号级条目已并入 §3.1-3.9;不吸收清单(Cordis 本体、declaration merging、`!!js`、typert 类型图)并入 §5。五个 P0 的完整调用路径深潜见 `os-features/deepseek-harness.md` §D1-D5。
