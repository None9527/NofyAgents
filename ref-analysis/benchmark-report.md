# Nofy OS Agentic — 完成度基准报告(Benchmark Report)

> 生成日期:2026-08-20 · 分支:二次开发分支 · 入口:`scripts/test.sh --workspace --no-fail-fast`
> 依据:`ref-analysis/os-agentic-prd-final.md`(PRD-1.8)§4 需求目录 / §7 路线图 / §11 施工状态与验收

## 0. 这份报告回答什么

用户问题:**「按完成情况做 benchmark,分类每一项测试什么」**。

本报告把全 workspace 的测试资产按两个维度分类:

1. **PRD 需求域(FR1–FR14)**:每一组测试验证的是 PRD 里哪条需求、哪条验收标准(AC)。
2. **工程分层**:策略核(门内 14 crate)/ 宿主运行时(shell/tools/pager)/ 公共件(common)/ 第三方(third_party)。

基准口径:§1–§8 数字来自一次完整的 workspace 测试运行(规范入口,剥离 SSH 环境变量),非历史日志拼凑;§9 为真实模型端点上的端到端验证(真二进制 × 真推理)。

## 1. 总体基准数字

| 指标 | 数值 |
|---|---|
| 测试套件(二进制目标)数 | **347**(unit 113 + 集成 140 + doc-tests 95;另有 0 测试的 playground/probe/bench 目标不计) |
| 产生测试的 crate/二进制 | 98 / 112 |
| **通过测试总数** | **28,191**(unit 27,126 + 集成 1,031 + doc 34) |
| **失败** | **0** |
| ignored(默认不跑) | 469(built-binary e2e、PTY 场景 e2e、`ignore` 标注的 doc 示例等,见 §8 口径) |
| 门内 14 crate 测试合计 | 770(§4) |
| workspace LOC 预算棘轮 | 1,552,503(只降不升) |
| 门内 14 crate 逐文件覆盖率 | 100%(`scripts/coverage_gate.sh`,15 条列名豁免) |

**测试体量前五**(占总量 71%):`nofy-pager` 8,277(TUI 宿主)/ `nofy-shell` 5,545(会话运行时)/ `nofy-tools` 2,957(工具实现)/ `nofy-workspace` 1,689(workspace 权限)/ `nofy-pager-render` 1,062(渲染)。

**零测试的 14 个目标(诚实清单)**:`nofy-models`(模型目录,行为由 FR7 e2e 31/31 与 sampler 测试间接覆盖)、`graphlib_rust`(vendored)、`nofy-test-utils`/`nofy-tracing-macros`(测试/宏基建)、5 个 playground 与 2 个 probe 二进制(人工验收件,FR9.5 `PROBE_OK` 模板)、2 个 bench 目标(criterion 夹具)、`pty_scenario`(场景夹具)。

## 2. 里程碑完成度基准(P0–P3 → 测试证据)

> PRD §7 路线图四行全部闭环。每个里程碑的「完成」不是自述,下面给出它今天对应的可执行测试证据(本次运行口径)。

| 里程碑 | 状态 | 本次运行中的测试证据 |
|---|---|---|
| P0 地基(批次 A–D) | ✅ | daemon 190(双锁/退出码/watchdog/取证/恢复状态机/LRU×PSI)、channel 17、control-schema 9(漂移门)、session-registry 4、shell 搜索栈(CJK)、built-binary e2e(ignored 列,需真二进制) |
| P1 六批次(E–J:六策略核立项) | ✅ | scheduler 90 / orchestra 100 / governance 67 / memorycore 61 / stewardcore 80 / agility 44,各含 1 件 LOC 棘轮 |
| P2 五批次(K–O:三里程碑) | ✅ | 任务 DAG+批审批(orchestra task.* 族)、第三方零核心改动接表面(surfaces 30 + marketplace 29)、file-steward 上线(stewardcore 扩至 80)、runtimecore 41、seal 体系在 daemon |
| P3 批次 P(执行世界谱系) | ✅ | runtimecore execworld(default-off)、stewardcore osbridge 评估门、marketplace realmcheck |
| 集成阶段(Q0–Q5) | ✅ | packcore 8(解环下沉)、daemon 接线后 52→72→今 190;依赖 DAG 无环;daemon.rs 1,820→232 行(批次 T) |
| 持久化与跨重启(R/S) | ✅ | orchestra TaskLogStore 撕尾截断、runstore 原子计划、resume_run fold 重建(在 orchestra 100 与 daemon 190 内) |
| 调度端到端(U/Z) | ✅ | Schedule* 四方法进漂移门、control_client 真 socket 全链路、pager `nofy schedule` CLI(pager 8,277 内) |
| shell 深接缝(V/W/X/Y) | ✅ 接线 2 + 在案 2 | bootcheck 6/6、env_capture 3/3(在 shell/agent 计数内);X/Y 经深读裁定零代码(证据在 integration-plan §4) |
| 收尾批(FR9 政策件 + §10 销账) | ✅ | `scripts/coverage_gate.sh` 门内 14 crate 逐文件 100% 过;daemon 84→184(收尾批新增约 170 测试);§10 待核实 7/7 销账 |
| 门外恢复批 | ✅ | fork 点实验钉死 16 目标/99 失败全部先于 PRD;修复 5 个真生产 bug 各带回归测试;终态 = 本报告口径:**347 目标 / 28,191 通过 / 0 失败** |

## 3. PRD 需求域 → 测试分类

> 每节格式:**测什么**(验收标准口径)→ **落在哪些 crate** → 测试构成。
> 「门内」= AC-9 覆盖率门覆盖的 14 个新组件 crate(逐文件 100% 行覆盖);「门外」= 既有宿主 crate。

### FR1 常驻可靠性(L1)— 「daemon 杀不死、楔不死、丢不了事」

- **测什么**:单实例双锁 + PID 复用防御(AC-1「绝不双跑」);`kill -9` 后 journal 对账续跑;重启预算耗尽自禁;环外 watchdog 60s 检出楔死;sd_notify + 事件循环滞后;非干净死亡取证(生命周期账本/关闭取证/cgroup 清扫);重启退出码契约;崩溃恢复会话状态机;LRU + cgroup 内存压力驱逐、DETACHED 磁盘 resume;write-behind 有界批写;持久化三原则(lane/operation/deferred);冷启动快速路径;BOOT 自检会话。
- **落点**:`nofy-daemon`(双锁/退出码/watchdog/取证/恢复状态机/LRU×PSI/孤儿清扫 PID+starttime)、`nofy-runtimecore`(FR1.12–1.16:persistence 三原则、unitgen 单元生成、coldstart、bootcheck)、`nofy-shell`(boot_gate 接线,批次 V)。
- **构成**:daemon 185+ratchet 5(含 forensics last_entry 回归)+ runtimecore 40+1。

### FR2 控制面协议(L3/工程)— 「帧不骗人、schema 不漂移」

- **测什么**:长度前缀帧 + 校验后编码 + 违规即拒;hello 版本协商;幂等键原子准入;ACP 双向映射桥;schema-first codegen + 漂移门禁(24 事件);设备身份公钥派生 + challenge 签名;能力声明只收窄;turn-interruption 可恢复转录;会话谱系链式代际;Hub 降级单次授权防重放。
- **落点**:`nofy-channel`(帧/握手/违规拒绝,17)、`nofy-control-schema`(事件漂移门,24 方法/事件 + Schedule* 四方法)、`nofy-daemon` wire(15 走帧测试)、`nofy-surfaces`(谱系严格代际链)、`nofy-governance`(hubgate)。
- **构成**:AC-2 五句全部有对应测试(schema 漂移 CI 红 / 映射桥 e2e / 幂等重放 / 增量补发 / 传输层认证)。

### FR3 调度与事件总线(L1/L2)— 「无人值守也准时、错过有策略」

- **测什么**:event-sourced schedule 纯 fold + fork 感知 + 撕尾容忍;fixed-rate latest-only 追赶不补发积压;真 idle 三相 + wake 闩;cron 引擎 catch-up/backoff/watchdog/自禁用留痕/启动修复;cron 文法 + 心跳双文件 + 跨进程 flock + HOME 投递;定时器单调锚定墙钟重校;session 栅栏双通道;fs 事件防抖 + 预算 + 拒自毁;heartbeat 投影 + scratch;system-event 总线 + presence + wake 路由。
- **落点**:`nofy-scheduler`(89+1,批次 E 建核、Q4 接线、R3 持久化、U 协议、Z 客户端全链路)、`nofy-daemon` SchedulerService(default-off 构造,损坏降级出声)。
- **构成**:AC-3 五句逐句有测试;端到端链路 = 核 E1 → 服务 Q4 → 持久化 R3 → 协议 U → 客户端 Z(pager `nofy schedule` CLI)。

### FR4 全局状态与记忆(L2)— 「写不串、查得到、忘得掉」

- **测什么**:writer-run 写栅栏(被取代 run 无法提交过期转录);per-request checkpoint fail-closed(未耐久不发起,故障注入 3 用例);全局会话索引(SQLite + 内容寻址去重);FTS5 多 tokenizer 含 CJK bigram(131 用例);工具结果三档注入;记忆冻结快照注入 + promptware 扫描(会中写不改 prompt);Curator 硬不变量(只碰自创/只归档不删/pinned 豁免,类型级编码);fork 隔离 + 缓存感知重放;higher-seq-wins 投影存储;审计 metadata-only + 假名化 + retention;七维 compact + 密度切割 + 深度守卫;dreaming 三相蒸馏 preimage 可回滚。
- **落点**:`nofy-memorycore`(60+1,含 injection/dreaming/compleases)、`nofy-session-registry`(3)、`nofy-shell` 搜索栈(CJK trigram 131,单线程口径)、daemon DS-#8 `durable_barrier` + `request_initiation_gate`。
- **构成**:AC-4 五句全过;批次 H 测试捕获真 bug 2 个(双检锁死锁/大写签名漏检)。

### FR5 审批与治理(治理)— 「高危必有人点头,拒绝是默认」

- **测什么**:跨表面审批路由(任意在线表面应答);sandbox×tool-policy×elevated 三正交 + explain;exec-approvals fail-closed 存储;/api 浏览器信任栅栏(Host 规范化 + sec-fetch-site + Origin 四层 + DNS rebinding);YOLO 冻结 + 会话身份任务局部化;生命周期守卫拒自毁命令;轮次租约跨表面串行;投递义务账本 at-least-once;mode_permissions 矩阵(FORCE_PLAN/AUTO_APPROVE/SELF_REVIEW/PHASE_DETECT × 六模式);注入抗性固定信封;permission-presets write-through;配置写 CAS;pre-auth 连接预算 + 洪水守卫;安全分类器三策略骨架;self-modification per-package 人批。
- **落点**:`nofy-governance`(66+1,含 Ed25519 设备身份 + challenge)、`nofy-daemon`(ApprovalBroker + lifeguard 即拒 + preauth 起线程前裁决,Q1)、`nofy-agility`(四层浏览器信任栅栏 + DNS rebinding)、`nofy-shell` `mode_permissions.rs`(4 用例,deny Plan×Write + allow)。
- **构成**:AC-5 五句全过;**G11 非 TUI 审批证明单元经真 ApprovalBroker 完成高危批准 fail-closed(D-1 里程碑)**。

### FR6 执行世界与进程管理(L3)— 「进程有户口、环境有快照」

- **测什么**:进程注册表(滚动缓冲 + 检查点恢复 + watch 熔断);登录 shell 环境快照(原子发布 + 注入安全转储,含 allexport E2BIG 防御);CWD 带内标记 + 输出限流 spill;子代理 barrier + auto-wake;能力位只收窄 + 委托深度只增;fork 只取 completed-turn prefix;workflow 宿主请求路由出会话;worker-thread scrubbed env + grace 强杀 + 配对账本;docker/ssh 执行世界(default-off + 能力只收窄)。
- **落点**:`nofy-runtimecore`(envsnapshot/cwdmark/workerroute/execworld)、`nofy-orchestra`(能力位/fork 前缀,批次 F)、`nofy-tools`(shell_state dump/replay,门外恢复批修 E2BIG)、`nofy-shell`(批次 W 环境捕获接线)。
- **构成**:AC-6 三句全过;门外恢复批在此域捕获 2 个真生产 bug(allexport E2BIG、会话扫描 raced-NotFound)。

### FR7 模型运营 — 「默认零外呼,故障有阶梯」

- **测什么**:统一错误分类学 + 分级退避;凭据池状态机(OK/EXHAUSTED/DEAD)+ 冷却租约;failover 阶梯(凭据轮换→模型回退);samplingParams 逃逸舱;compat 旗标表;BYOK `EndpointsConfig` 单一来源 + 声明式 auth;generations 原子快照 + lease/retention;辅助路由 stale-while-revalidate;OAuth 刷新双检锁(8 线程恰一次)。
- **落点**:批次 A(Mixpanel/Sentry 物理移除、updater opt-in、e2e 31/31)、`nofy-memorycore`(FR7.7–7.9,批次 H)、`nofy-models`/`nofy-sampler`/`nofy-auth`(门外既有件)。
- **构成**:AC-7 三句——默认配置启动零外呼(构造保证 + 测试)、三自建后端 e2e、429 轮换序列可观测。

### FR8 生态与供应链 — 「第三方走同一道门」

- **测什么**:供应链门禁(minimumReleaseAge + trust verdict,fail-closed);工具注册表 generation 失效;hooks 桥 detach/drain + 耐久配对、钩子崩溃不拖主管线;插件 manifest 声明 + 隔离区准入;Docker build-arg 白名单 all-or-nothing;channel 适配器契约拒 no-op。
- **落点**:`nofy-agility`(供应链 + 钩子,批次 J)、`nofy-marketplace`(manifest/隔离区/build-arg/适配器,28+1)。
- **构成**:AC-8 两句全过(零核心改动接入 = 同一道门;钩子崩溃不拖管线 = J6)。

### FR9 工程可信 — 「测试本身可信,规模只降不升」

- **测什么**:fenced writer lease;无 key e2e(MockInferenceServer + override sidecar);WAL 降级阶梯;遥测 NOOP 契约;probe 二进制验收模板;**预算棘轮(max-lines ratchet)**;**逐文件 100% 覆盖 = 死代码探测器**;压缩跨进程租约;guard 双件;密封测试 + trajectory 首末保护。
- **落点**:14 个门内 crate 各自 `tests/ratchet.rs`(LOC 只降不升)+ workspace 总预算棘轮(`nofy-daemon/tests/ratchet.rs`,当前 1,552,503)+ `scripts/coverage_gate.sh`(llvm-cov 逐文件 100%,15 条列名豁免)+ daemon seal 体系(批次 O)。
- **构成**:AC-9 两句全过;棘轮累计行使 20+ 次(每次升都带阶梯注释评审)。

### FR10 套件/专家包(L3/生态)— 「pack 是数据不是代码」

- **测什么**:isolate 断言(leaked service 加载期即拒);宿主面/代理面所有权判据(pack 不拥有沙箱/审批/持久化/模型路由);standing mount + scope join;persona 默认遮蔽;委托行即专家召唤;`nofy-pack` manifest 双编译目标(会话级/subagent 级);单 agent 单 pack 纪律;市场面发现/创作/元数据。
- **落点**:`nofy-packcore`(Q0 解环,pack.rs 逐字下沉)、`nofy-orchestra`(join/persona/委托行,批次 F)、`nofy-marketplace`(批次 M)、`nofy-shell` pack_join 接线(provider_host → AgentBuilder → 真推理调用)。
- **构成**:AC-10 四句全过;shell 侧接线单元 23(provider_host 5、mode_permissions 4、DS-#8 3、runtime_journal 11)。

### FR11 任务管理与编排(L2/L3)— 「验收靠 fold 不靠自述」

- **测什么**:`.nofy/project.toml` 装载 fail-loud;单任务 = SpawnAgent join 单 pack + goal 验收纯 fold;编排日志确定性回放(与真 OrchRun 逐字段等价);barrier fan-in + at-least-once 账本;`task.*` journal 事件族(稠密 seq + 终态终结 + 崩溃对账);per-task on_fail DAG;scheduler×pack 周期桥不堆积;批级审批一次 Ask 逐条账本;TaskLogStore 落盘撕尾截断;完整 run 跨重启续跑(resume_run 经 fold_orch 重建)。
- **落点**:`nofy-orchestra`(99+1,批次 F 建核、K 扩展、Q3 接线、R 持久化、S 跨重启)、`nofy-daemon`(runlife/runstore,批次 T 抽取后 daemon.rs 1,820→232 行)。
- **构成**:AC-11 四句全过(manifest 编译 / goal fold / 崩溃对账续跑 / escalate 跨表面审批)。

### FR12 文件管家 File Steward(L2/L3,差异化)— 「不删只扔垃圾桶,不确定必问」

- **测什么**:roots 空默认 opt-in 两档;fs-index idle 门控 + watch 预算降级;结构化 `FS_SANDBOX_DENIED`;file-activity 图 steward 一等 actor;forget/redaction;管理工具面 trash-over-delete(构造级无 Delete 构造)+ 两阶段 intent + 回滚快照;提取管线 embeddings 默认关;建议 DAG → orchestra → 批审批;索引 = 提示操作前再验证;租约表 leased = 只读禁管理;三区分域重叠取更严;越界 handoff 降级建议者;墓碑 + `undo --batch`;清理禁区 + 新根前三批强制 dry-run + 信任爬坡;OS 集成面只读评估门。
- **落点**:`nofy-stewardcore`(79+1,批次 I 建核、N 扩展、Q2 接线)、`nofy-daemon` steward validate 委托、`nofy-shell` fs 执行面。
- **构成**:AC-12 九句全过(加载期租约拒/重叠取严/墓碑解析/三批 dry-run/外部对账归因)。

### FR13 表面层(L3)— 「四个表面一个真相」

- **测什么**:TUI/ACP/headless 迁控制面客户端;Web 先栅栏后投影(信任栅栏 FR5.4);webhook 表面三道门(签名/信封/去重);IM 契约卡片 + 应答解析通道无关;表面迁移持引用不持状态。
- **落点**:`nofy-surfaces`(29+1,批次 L)、`nofy-agility`(Web 栅栏,批次 J)、`nofy-daemon` 表面网关(Q5:webhook 审批应答进 broker、IM 卡片出/应答进)、`nofy-pager`(TUI 宿主,门外)。
- **构成**:AC-13 两句全过(四表面同一会话真相;IM 可批准)。

### FR14 敏捷与脚本面 — 「迭代不过编译边界」

- **测什么**:script runner 受管运行时(pack 捆绑脚本零 Rust 改动);扩展点全协议化(InProc = 硬违规);SDK conformance 套件;热重载 packs/skills/hooks/scripts 不重启 daemon(generation + 退出码契约);预演区三次法则;script 沙箱构造级永不 in-proc + 资源限额 fail-closed。
- **落点**:`nofy-agility`(43+1,批次 J)。
- **构成**:AC-14 四句全过(Python pack <5 分钟零 Rust 改动 / Java 子进程过 conformance / 脚本崩溃不拖 daemon / 热重载不重启)。

## 4. 门内 14 crate 逐项分类(AC-9 覆盖率门内,逐文件 100% 行覆盖)

> 口径:本次运行的 unit + 集成测试通过数(不含 doc-tests);每 crate 的 `ratchet.rs` 计入其中。
> 门内合计 **770 个测试,0 失败**。

| crate | 通过 | 测什么(一句话) | 对应 FR |
|---|---|---|---|
| `nofy-daemon` | 190(185+ratchet 5) | 控制面宿主:双锁单实例、退出码契约、watchdog/sd_notify、关闭取证、恢复状态机、LRU×PSI 驱逐、孤儿清扫、wire 走帧 15、ApprovalBroker、SchedulerService、表面网关、runlife/runstore 跨重启续跑、seal 双件 | FR1/2/3/5/9/11/13 |
| `nofy-orchestra` | 100(99+ratchet 1) | 编排核:project.toml fail-loud、goal 验收纯 fold、确定性回放、barrier fan-in、at-least-once 账本、task.* 日志族、per-task on_fail DAG、standing mount/persona/委托行、能力位只收窄 | FR10/11/6 |
| `nofy-scheduler` | 90(89+ratchet 1) | 调度核:event-sourced fold、catch-up latest-only、真 idle 三相、cron 引擎五件、定时器单调锚定、session 栅栏、fs 触发防抖、心跳投影、system-event 总线 | FR3 |
| `nofy-stewardcore` | 80(79+ratchet 1) | 文件管家核:roots 两档、FS_SANDBOX_DENIED、file-activity 图、forget/redaction、trash-only 构造级、租约表、三区分域、墓碑 undo、禁区 dry-run 爬坡、提取管线、handoff、OS 桥评估门 | FR12 |
| `nofy-governance` | 67(66+ratchet 1) | 治理核:YOLO 冻结、拒自毁、轮次租约、账本投影、注入抗性信封、preset write-through、配置 CAS、pre-auth 预算/洪水守卫、Ed25519 设备身份、分类器骨架、selfmod 人批、hubgate | FR5/2/9 |
| `nofy-memorycore` | 61(60+ratchet 1) | 记忆核:冻结快照注入、promptware 扫描、Curator 硬不变量、fork 隔离重放、higher-seq-wins 投影、审计假名化 retention、七维 compact、三档注入、dreaming 蒸馏、generations 租约/SWR/OAuth 双检锁 | FR4/7 |
| `nofy-agility` | 44(43+ratchet 1) | 敏捷核:脚本沙箱永不 in-proc、扩展点全协议化、codegen conformance、热重载 generation、供应链 fail-closed、钩子不拖管线、四层浏览器信任栅栏 + DNS rebinding、Web 栅栏、预演区三次法则 | FR14/8/5/13/2 |
| `nofy-runtimecore` | 41(40+ratchet 1) | 运行时核:持久化三原则、persistence_uncertain、unitgen、冷启动快路径、BOOT 自检、envsnapshot 原子发布、cwdmark、workerroute、execworld docker/ssh default-off | FR1/6 |
| `nofy-surfaces` | 30(29+ratchet 1) | 表面核:webhook 三道门(签名/信封/去重)、IM 契约卡片通道无关、会话谱系严格代际链、表面迁移持引用不持状态 | FR13/2 |
| `nofy-marketplace` | 29(28+ratchet 1) | 市场核:pack 创作门 + 校验和 + 索引发现、内置包同一道门不特例、插件 manifest 隔离区、docker build-arg all-or-nothing、通道适配器拒 no-op | FR10/8 |
| `nofy-channel` | 17 | 帧层:长度前缀帧、校验后编码、违规即拒、hello 协商 | FR2 |
| `nofy-control-schema` | 9 | schema 漂移门:24 事件/方法 codegen 一致性 + Schedule* 四方法 | FR2/9 |
| `nofy-packcore` | 8(7+ratchet 1) | pack 数据模型:manifest 装载、isolate 断言、面所有权判据(Q0 自 shell 逐字下沉,测试守恒) | FR10 |
| `nofy-session-registry` | 4 | 全局会话索引登记:去重、end_reason 谱系 | FR4 |

## 5. 门外宿主层逐项分类

> 门外 = fork 之前既有的宿主 crate。PRD 施工前它们已有大量测试;PRD 期间对它们只做接线与欠账修复(门外恢复批:16 目标/99 失败全部先于 PRD 工作,归因经 fork 点 worktree 实验钉死)。

| crate 族 | 测什么 | 本次通过数 |
|---|---|---|
| `nofy-pager` 族(pager 8,277 + render 1,062 + pty-harness 97 + minimal 82 + bin) | TUI 宿主:渲染、分页、键位、paste 注入(88 用例经规范入口)、权限提示、drop 分类(SSH 感知)、settings e2e 274、scroll 矩阵;另有 278 ignored 的 PTY e2e 场景 | 9,822(最大测试体,含集成目标 todo_pane_playground 291 + scroll_matrix 13) |
| `nofy-shell` 族(shell 5,545 + base 69 + session-support 17) | 会话运行时:ACP 会话/turn 循环、压缩、工具分发、bootstrap single-flight、搜索栈 CJK trigram、boot_gate、env 捕获、mode_permissions、pack_join 接线;集成目标 `test_sampling_server` 118 通过 + 78 ignored(built-binary e2e:`provider_loop_e2e`/`test_built_binary_e2e` 等) | ~5,631 + e2e |
| `nofy-tools`(+api) | 工具实现:shell 执行、文件操作、进程管理、env dump/replay(allexport E2BIG 回归)、输出限流;集成 36(含 subagent soak 17、path suggestions 18) | 2,982 |
| `nofy-workspace`(+client 16/types 146) | workspace 权限与目录模型、wire round-trip(24 项 HOME 密封修复在此域) | 1,851 |
| `nofy-agent` | agent 循环宿主件(run_stdio/run_server 载体,boot_gate 挂这里) | 575 |
| `nofy-markdown`(+core) | markdown 解析/渲染 | 521 |
| `nofy-fast-worktree` | worktree overlay(集成 12) | 414 |
| `nofy-chat-state`(+chat_history_downgrade 15) | 聊天状态机与历史降级 | 374 |
| `nofy-ratatui-textarea` / `ratatui-inline` | 输入组件与内联渲染差分 | 408 |
| `nofy-sampling-types` / `nofy-sampler`(199)/ `nofy-models`(0) | 采样类型、采样器(cf 边界/kill switch/wire)、模型目录 | 500 |
| `nofy-memory` | 宿主侧记忆/RAG(真端点 `API.X.AI` 字面量回归) | 290 |
| `nofy-update` | 自更新:unit 136 + 集成 139(blitz/convergence/downgrade 矩阵/install/network/subprocess) | 275 |
| `nofy-computer-hub-sdk/core/mcp-adapter` | computer-hub 三件(集成 67:resolver/dispatch/transport/registry) | 322 |
| `nofy-file-utils` | 文件工具(233) | 233 |
| `nofy-hooks`(+plugins-types) | 钩子宿主件(集成 13) | 237 |
| `nofy-tool-protocol/runtime/types` | 工具协议三件:serde roundtrip 73、标识校验、运行时(94 集成:streaming/blocking/dyn) | 447 |
| `nofy-hunk-tracker` | hunk 追踪(FR12.4 外部对账的宿主侧) | 199 |
| `nofy-telemetry` | 遥测 NOOP 契约 + OTLP 门控(集成 7) | 193 |
| `nofy-config`(+types) | 配置装载与类型 | 269 |
| `nofy-mcp` | MCP 客户端(含 SSE flood 复现 3) | 170 |
| `nofy-plugin-marketplace` | 插件市场宿主面 | 145 |
| `nofy-compaction` | 压缩公共件 | 142 |
| `nofy-shared` / `nofy-fsnotify`(125)/ `nofy-subagent-resolution` / `nofy-sandbox`(92)/ `nofy-secrets` / `nofy-auth` / `nofy-env` / `nofy-http` / `nofy-acp-lib` / `nofy-crash-handler`(23)/ `nofy-extra-ca`(13)/ `ptyctl`(15)等 | 各自单一职责单元行为 + 关键 e2e(deny_paths、extra_ca 四态、crash 集成) | 各 10–233 |
| `nofy-workflow` / `nofy-codebase-graph`(53)/ `nofy-session-journal` / `nofy-sqlite-journal` / `nofy-voice` / `nofy-prompt-queue` / `nofy-token-estimation` / `nofy-convergence` / `nofy-interjection-core` / `nofy-announcements` / `nofy-paths` / `nofy-version` / `nofy-system-power` / `nofy-tty-utils` / `nofy-agent-lifecycle` / `nofy-proto-build` | 支撑件单一职责 | 各 2–59 |
| `third_party/`(mermaid-to-svg 79、ordered_hashmap 15 doc、dagre 1、graphlib 0) | vendored 第三方既有测试 | 95 |
| `prod/mc/cli-chat-proxy-types` | 生产侧 CLI 代理类型 | 34 |

## 6. 公共件与第三方

| crate | 测什么 |
|---|---|
| `common/nofy-circuit-breaker` | 熔断器状态机(FR7 退避阶梯的公共底座) |
| `common/nofy-compaction` | 转录压缩公共件 |
| `common/nofy-session-journal` | 会话 journal 不变量(`task.*`/`tool.*` 事件族的公共载体) |
| `common/nofy-tool-protocol` / `tool-runtime` / `tool-types` | 工具协议三件:类型、运行时、分发契约 |
| `common/nofy-interjection-core` | 插话/steering 注入核心(FR2.4 载体) |
| `common/nofy-convergence` | 收敛判定 |
| `common/nofy-computer-hub-core` / `mcp-adapter` / `sdk` | computer-hub 三件 |
| `common/nofy-tracing` / `codegen/nofy-tracing-macros` / `nofy-telemetry` | 追踪与遥测(NOOP 契约,FR9.4) |
| `common/nofy-test-utils` / `codegen/nofy-test-support` | 测试基建(本身不计数为产品测试) |
| `third_party/dagre_rust` / `graphlib_rust` / `mermaid-to-svg` / `ordered_hashmap` |  vendored 第三方:图布局、DAG、mermaid 渲染、有序 map 的既有测试 |
| `prod/mc/cli-chat-proxy-types` | 生产侧 CLI 代理类型 |

## 7. 工程政策件(元测试:测「测试与规模本身」)

这一层不是功能测试,而是保证工程可信的棘轮,全部在 CI 路径上:

1. **LOC 棘轮(15 件)**:门内 14 crate 每 crate 一个 `tests/ratchet.rs`(行数只降不升,升必须加阶梯注释行评审)+ workspace 总预算棘轮(`nofy-daemon/tests/ratchet.rs::workspace_loc_budget_only_shrinks`,当前帽 1,552,503)。作用:防代码膨胀、防死代码藏身。
2. **逐文件覆盖门**:`scripts/coverage_gate.sh`(cargo-llvm-cov LCOV),门内 14 crate 逐文件 100% 行覆盖;9 个零豁免 + 5 个 crate 共 15 条列名豁免(每条有名字和理由)。作用:死代码探测器(FR9.10 纪律移植)。
3. **schema 漂移门**:`nofy-control-schema` 24 事件/方法的 codegen 漂移测试,schema 改了不重新 codegen 即 CI 红(FR2.9)。
4. **规范测试入口**:`scripts/test.sh` 剥离 SSH 环境变量后调 cargo test——paste/drop 分类测试在 SSH 会话下语义不同,规范入口保证任何环境下结果一致。这不是弱化测试,是固定测试环境。
5. **双跑纪律**:策略核批次均「双跑绿」(串行 + 并行各一遍),门外恢复批后 nofy-shell 全 lib 5542/0 三连绿 + 模块并发 10/10。

## 8. 已知边界与跟进项

**benchmark 的口径边界(诚实声明)**:

- 本报告计数 = 一次完整 workspace 运行的 `test result:` 汇总;`ignored` 项(如 built-binary e2e `provider_loop_e2e`、需真二进制的用例)默认不跑,单独列出不计入通过数。
- 门内覆盖率 100% 是**逐文件行覆盖**,不等于分支/条件覆盖;15 条豁免均为构造级不可达或宿主接缝未出现(名字与理由在 `scripts/coverage_gate.sh` 的 `EXEMPTIONS`)。
- 门外 crate 的测试是 fork 前既有资产,PRD 期间只修复不新增(唯一例外:接线需要的接缝测试,如 shell 侧 23 个接线单元)。
- 测试数 ≠ 需求覆盖度的唯一证据:AC 对账的权威记录在 PRD §11 看板与 `p1-dev-log.md`,本报告是它的可执行口径投影。

**生产侧跟进项(非测试欠账,记录在 dev-log)**:安装脚本品牌、CLI_BASE_URL、paste 注入缝、CACHE_EPOCH 作用域收窄。

## 9. 真实测试(真模型基准,2026-08-21)

> §1–§8 是代码级测试(mock 模型)。本节是**真实推理端点**上的端到端验证:真二进制 × 真模型 × 真工具循环。

**被测对象**:`target/debug/nofy`(本次构建)+ DashScope OpenAI 兼容端点 `https://dashscope.aliyuncs.com/compatible-mode/v1` + 模型 `deepseek-v4-flash-0731`(推理模型,输出含 `reasoning_content`)。

**接入方式(BYOK,FR7.6 路径)**:`~/.nofy/config.toml` 增 `[model.deepseek-v4-flash]`——`base_url` 指兼容端点、`api_backend = "chat_completions"`、`env_key = "DASHSCOPE_FLASH_KEY"`(key 只走环境变量,不落盘、不进报告)。`nofy models` 确认条目生效:「Model 'deepseek-v4-flash' is using its own API key」。

| 测试 | 内容 | 结果 |
|---|---|---|
| T1 基础问答 | headless `-p` 模式,17×23 | ✅ 答 391,正确 |
| T2 工具循环 | 创建 numbers.txt(1–10)→ 算平方和 → 写 result.txt → 回报 | ✅ 两文件实际落盘且内容正确,平方和 385 正确(多轮工具分发全通) |
| T3 中文+读文件+代码生成 | 读 README.md、写 fib.py、报 F(20) | ✅ 读取正确(`hello nofy`);生成的 fib.py 经**独立导入验证** F(20)=6765 正确;中文流畅 |
| T4 会话持久化 | 三次运行后查 `~/.nofy/sessions` | ✅ 三个会话入全局索引(FR4.3 真运行验证) |

**结论**:PRD 的 BYOK/控制面/工具分发/会话持久化链路在**真实模型**上端到端工作;代码测试(mock)与真实测试(本节)互为补充——前者保回归,后者证集成。

**口径边界**:单模型、debug 二进制、每类 1 例的小样本冒烟,不构成模型质量评测;推理模型的 reasoning token 消耗未计入任何预算测量。
