# P1 施工日志

> 计划:`p1-construction-plan.md`(批次 E–J)。纪律承 P0:影响分析先行、无 key e2e 为门槛、证据留路径、不虚构行号。

---

## 2026-08-17 · P1 施工计划立项(无代码改动)

- 起草 `p1-construction-plan.md`:批次 E(调度与事件总线 FR3)/ F(任务编排×pack 两形态 FR11+FR10)/ G(审批治理 FR5)/ H(记忆扩展 FR4)/ I(文件管家执行面 FR12)/ J(敏捷面×Web FR14+FR13)。
- 校准输入:PRD §7 P1 行(os-agentic-prd-final.md 路线图节)、§4 FR 表逐行优先级、§11 看板 PRD-1.2 完成态、仓库 crate 实况(`crates/codegen/`、`crates/common/` 清单核实)。
- 关键校准结论(详见计划 §0):
  - §7 P1 行漏列 FR 表 P1 项:FR1.12–1.15、FR2.6–2.11、FR6.2–6.7、FR9.6–9.8、FR12.11/12.12/12.14/12.15——以 FR 表优先级列为准全部收编,逐行标「§7 未列」。
  - 「FR5 全/FR14 全」按表内 P1 行解释(FR5.14/5.15 仍 P2)。
  - FR3.1–3.4 标 P0 但 P0 批次未覆盖,归批次 E。
  - P0 遗留下落:FR4.5→H0、FR5.4→J7、FR6.1→E10、FR13.1→J9、FR2.3–2.5→E0 裁定步。
- 待决策(不阻塞 E0/E1):**D-1** 是否拉入最小 webhook 审批面(P1 里程碑「webhook 批高危」与 FR13.3/FR11.8 的 P2 标记冲突);**D-2** 范围膨胀后接受 9–11 周延期,还是把 §7 未列项推入 P2。
- PRD 回写:§11 队列加 P1 计划指针;附录 C 记 PRD-1.3。需求正文未动。
- 下一步:E0 裁定(只读半天)→ E1 `nofy-scheduler` event-sourced 骨架(计划 §9)。

## 2026-08-17 · E0 裁定备忘(只读,无代码改动)

P0 遗留五区逐项核实,结论+证据路径如下(证据均为仓库现存文件,行号为核实时所见):

| 项 | 结论 | 证据 |
|---|---|---|
| FR2.3 幂等键+原子准入(OC-F19) | **未做** | 控制面 TaskSubmit 无客户端幂等键、重放即重新准入(`crates/codegen/nofy-daemon/src/daemon.rs:253` 处理器);全库 186 个 `idempoten` 命中均为无关局部注释/测试(如 `nofy-markdown/src/streaming.rs:2250` 渲染幂等),控制面四 crate 内仅 `crates/common/nofy-session-journal/src/continuity.rs:150` 一个测试名命中,非准入机制 |
| FR2.4 steering 三检查点(OC-F17) | **部分** | 进程内 interjection 机制齐套:`crates/common/nofy-interjection-core/`(buffer/format/drain)+ 消费点:工具批边界 `crates/codegen/nofy-shell/src/session/acp_session_impl/tool_calls.rs:424`、循环检查点 `turn.rs:2039/2519/2531`、长工具内等待 `tool_calls.rs:626`;但为进程内会话语义,非经控制面路由的 steering 协议,「转录提交等待」检查点未独立成型 |
| FR2.5 ACP 双向映射桥(MAP-§3.2) | **已做** | `crates/codegen/nofy-acp-lib/src/`(channel/gateway/message/normalize 等)+ `crates/codegen/nofy-shell/src/session/acp_session_impl/`(30+ 文件)+ `acp_session_tests/`(47 个测试文件);ACP 表面原生驱动 MvpAgent 且不改其本体(`crates/codegen/nofy-shell/src/agent/server.rs` 头注:MvpAgent 实例跨连接复用) |
| FR4.5 工具结果三档注入+spill(NG-F12) | **部分** | spill 形态仅 web_fetch 一家:`crates/codegen/nofy-tools/src/implementations/nofy_build/web_fetch/overflow.rs`(bounded inline preview+session artifact+recovery footer);工具输出有 size cap+truncated 标志(`crates/common/nofy-tool-runtime/src/notification.rs:33-49`);通用 tool 分发层无三档注入 |
| FR6.1 进程注册表(HM-F15) | **部分** | daemon 已有 children 登记(`children.jsonl`)+PID/starttime 活体判定+启动期轮转清扫(`crates/codegen/nofy-daemon/src/proc.rs`,看板记 3 用例);缺滚动缓冲、活进程检查点恢复、watch 熔断 |
| FR13.1 表面迁控制面客户端(MAP) | **未做** | TUI/headless/serve 均进程内跑 agent(`crates/codegen/nofy-pager-bin/src/main.rs:317/475`、`crates/codegen/nofy-shell/src/agent/server.rs`);控制面唯一触点为 P0 所立 `nofy daemon` 子命令(`main.rs:978`);表面未迁 |
| FR5.4 /api 浏览器信任栅栏(DS-#22) | **未做** | serve 表面在(`crates/codegen/nofy-shell/src/agent/server.rs`,488 行,axum WebSocket),全文零 Origin/Host/sec-fetch-site 检查;四层栅栏缺位 |

**去向确认**(与计划 §0 一致):FR4.5→H0、FR5.4→J7、FR6.1→E10、FR13.1→J9;FR2.3→G 批(控制面准入),FR2.4→G/F 批(控制面 steering 协议化),FR2.5 闭环只留回归。

## 2026-08-17 · E1 `nofy-scheduler` event-sourced 骨架(已执行)

- 影响分析:纯新增,零既有符号改动。GitNexus MCP 本会话不可用(search_tool 无结果),按 P0 先例记为偏离;grep 核实唯一既有文件改动 = 根 `Cargo.toml` members 增一行。`nofy-scheduler` 仅依赖 serde/serde_json,不被任何 crate 依赖,既有 crate 依赖图零变化。
- 新 crate `crates/codegen/nofy-scheduler/`(workspace 成员):
  - `src/lib.rs`(429 行):`ScheduleEvent` 六变体(Added/Removed/Armed/Fired/Disabled/Forked);`fold`/`apply` 纯函数——状态=日志纯 fold,同日志必同状态;fork 感知在 fold 内:Forked 保留定义、清空 pending、generation 只由 Forked 变更(DS-#1 语义);fail-closed:无活定义的 Armed 被忽略;幂等:重复 arm/fire、同 due 不重复挂账;撕尾容忍:`parse_log` 自首个不可解析行截断(单写者 append,尾部之后必为垃圾,同 session-journal 纪律);`LogStore` 薄盘层(append+flush+sync_data,缺文件=空日志,撕尾截断不报错)。
  - `tests/ratchet.rs`:日一 LOC 棘轮 cap=429,模式同 `nofy-daemon/tests/ratchet.rs`(只降不升,升=刻意评审)。
- 测试(全部驱动出厂函数、自空态起):8 单元——空 fold、replay 全前缀切分一致(崩溃于任一 append 边界重放必同态)、fork 不继承义务+fork 后 arm 正常+父前缀保留义务、退化 fork 忽略、无定义 arm fail-closed+re-add 重启用、重复 arm/fire 幂等、撕尾截断(内存与磁盘两路)、LogStore 盘上往返;1 棘轮。
- 验证:`cargo test -p nofy-scheduler` 双跑 8+1 全绿且两次一致(证据 `{scratch}/scheduler-tests-1.log`、`scheduler-tests-2.log`);`cargo test -p nofy-daemon` 回归 64+1 全绿(`regression.log`);`cargo check --workspace`(`check.log`)。
- 零外呼/零行为变化:crate 无网络依赖;既有 crate 无改动。
- **E0+E1 闭环。下一步 = E2(FR3.2 fixed-rate latest-only 追赶),属后续目标。**

## 2026-08-17 · D-1/D-2 第一性原理裁定(安排定稿,无代码改动)

推理前提:① 里程碑是待证伪的命题,不是待交付的功能;② 条目优先级来自它被哪些 P1 验收命题依赖;③ 工期是推导值不是承诺值。

- **D-1 = 拉入,按命题定义**。「webhook 批高危」的命题是"审批路径不依赖 TUI + 批高危 fail-closed";最小证伪单元 = 一个非 TUI 表面应答一次高危批准。G11 定为「非 TUI 审批证明单元」,验收看命题不看表面完整度;完整 webhook 表面仍 P2(FR13.3 本分)。
- **D-2 = 两案均不取,按依赖切割**。保留(P1 验收命题依赖):FR12.11/12.12/12.14/12.15(AC-12 加粗条款)、FR2.6/2.7(AC-2/AC-5)、FR6.4–6.7(FR11.4/FR10.5 机制本体)、FR2.9(FR14.3 前置)、FR6.1(FR3.7 活体判定)、FR9.6(工程闸门)。推迟 P2 前置队列(P1 无命题依赖):FR13.1、FR4.5、FR1.12–1.15、FR2.8/2.10/2.11、FR6.2/6.3、FR9.7/9.8。
- 批次净变化:E 去 E11、E10 收窄至 FR6.1;F3 去 FR2.11;G 去 G10、G11 按命题定义;H 去 H0/H9;J 去 J9。合计估算 ≈8–9 周(vs PRD 6 周,差额=AC-12/AC-2/AC-5/AC-14 通过成本,如实记录)。
- 回写:计划 §0 裁定节+批次行+P2 前置队列;PRD §7 结算注记+§11+附录 C(PRD-1.5)。FR 条目优先级列未动(结算只动 §7 行解释,不改需求本体)。

## 2026-08-17 · E2 catch-up 策略(已执行)

- 影响分析:GitNexus MCP 不可用,按 grep 先例记录——`rg nofy-scheduler` 全库枚举**外部依赖方为零**,改动面=nofy-scheduler crate 内(E1 出厂 `ScheduleEvent` 加一变体,无外部消费方)。
- 实现(FR3.2/DS-#2,fixed-rate latest-only):
  - 新事件 `Dropped { id, dues }`:追赶丢弃的审计事件——陈旧过期义务**不补发**,丢弃留痕;fold 臂幂等且 fail-closed(未知 id/dues 为 no-op)。
  - `catch_up_events(&state, now, rate) -> Vec<ScheduleEvent>` 纯策略提案:每 schedule 只发**最新**过期义务一次、其余过期义务随 `Dropped` 丢弃(不风暴);`rate` 限速——每 tick 至多 `rate` 个 schedule 追赶,大积压按固定速率排空;BTreeMap 序=确定性(id 升序);返回空=已追赶完毕;rate 钳 ≥1。
  - 引擎形状(后续 E 步消费):提案→append 日志→fold,崩溃重启从头 fold 仍同态(catch-up 本身崩溃安全)。
- 测试(6 新,全部驱动出厂函数):积压三欠=只发最新一次+丢弃审计;五积压 rate=2 按 2/2/1 确定性排空+重放一致;未来义务不动;无过期=noop;Dropped 幂等+fail-closed;完整引擎循环(提案→入日志→从头 fold)追赶后重放同态、 firing 序列=[20,30] 最新优先。
- 棘轮二次行使:429→628,抬升附评审理由(`tests/ratchet.rs` 注释),先红后绿验证门禁有效。
- 验证:`cargo test -p nofy-scheduler` 双跑 14+1 全绿且一致。零外部依赖方、零新外呼。
- **E2 闭环。下一步 = E3(FR3.3 真 idle 通道:runMaintenance 第三相位+wake 闩)。**

## 2026-08-17 · E3+E4 真 idle 通道 + cron 引擎策略(已执行)

- 用户授权「直接把 P1 做完,你来把控」——自此按批次连续施工,逐步验证逐步回写。
- **E3(FR3.3/DS-#17)**:`maintenance.rs` 三相状态机(Active/Idle/Maintenance)——维护只能自 Idle 进入(第三相位不可由 Active 直达);**wake 闩**:Activity/Wake 中断维护即置闩,未经显式 Rearm 任何 Start 都被忽略(抖动负载不会饿死真实工作);Finish 才计 cycle,中断不计。`fold_maintenance` 纯 fold+全前缀重放一致。6 用例。
- **E4(FR3.4/OC-F9)**:`ScheduleEvent` 增运行生命周期三变体(RunStarted{at}/RunSucceeded/RunFailed,fold 臂 fail-closed+run_id 门:陈旧/重放结果不腐化状态);状态增 `inflight`(id→(run_id,at))与 `consecutive_failures`。`cron.rs` 纯策略提案:`startup_repair`(崩溃后 in-flight 一律判败,记账诚实)、`watchdog_events`(超时判败)、`backoff_delay`(base×2^(n-1) 带 cap,饱和安全)、`self_disable_events`(达阈值自禁用,reason 即留痕「N consecutive failures」,已禁用不重复)。8 用例(含引擎循环:catch-up+repair 后从头 fold 同态)。
- 棘轮三次行使:628→1083(附评审理由)。
- 验证:`cargo test -p nofy-scheduler` 双跑 28+1 全绿且一致。期间修复 1 处测试断言推导错误(interruptions 计数,事件序列手工重追踪后更正)。
- **E3+E4 闭环。下一步 = E5(FR3.5 cron 文法+心跳/成功双文件+跨进程 flock+HOME 投递)。**

## 2026-08-17 · E5 cron 文法+双文件+flock+HOME 投递(已执行)

- **cron 文法**(`grammar.rs`):严格 5 字段解析(`*`/`N`/`A-B`/`*/S`/`A-B/S`/`N/S` Vixie 语义,逗号表),范围校验(minute 0-59/hour 0-23/dom 1-31/month 1-12/dow 0-6),13 种非法式全拒;dom/dow 双限=任一命中(标准 cron 规则);`next_after` 纯函数(月跳过+日扫描+日内时刻,~5 年上限,无时钟访问,引擎供 now)。用例:季度刻/工作日环绕(周五→周一)/闰日 2026→2028-02-29/dom-dow 任一/不可能式(2 月 30 日)=None/严格 after+确定性。
- **心跳/成功双文件**(`runfiles.rs`):`{id}.heartbeat`(任意结果)与 `{id}.success`(仅成功)分离——外部 watchdog 可辨「卡死(心跳新/成功旧)」与「调度器死(心跳旧)」;原子写(temp+rename);`safe_stem` 消毒 id,`../evil` 落回目录内。
- **跨进程 flock**(`lock.rs`):`ScheduleLock::acquire` 独占 flock,二次获取=None(退避不双发),holder 死则内核释锁;Drop 显式 unlock。
- **HOME 投递**(`delivery.rs`):`~/.nofy/scheduler/deliveries/{id}-{run_id}.json`,原子写,id 消毒,list 升序。
- 依赖:chrono/fs2(workspace 既有)。期间修复:1 处测试 Option 包裹、1 处 safe_stem 期望值下划线计数。
- 棘轮四次行使:1083→1661(附评审理由)。
- 验证:`cargo test -p nofy-scheduler` 双跑 43+1 全绿且一致。
- **E5 闭环。下一步 = E6(FR3.6 一次性定时器 clamped+重校墙钟)。**

## 2026-08-17 · E6–E9 定时器/栅栏/fs 触发/心跳投影(已执行)

- **E6(FR3.6/DS-#3)**`timer.rs`:一次性定时器锚定**单调钟**——到期判定只认单调经过,墙钟时刻仅由单调余量**推导**;`arm` 钳位(过去目标→MIN_DELAY 1s,荒远目标→MAX_DELAY 1 年);`revalidate` 重校:墙钟前跳不提前触发、后跳不搁浅;`fire` 一生一次。6 用例。
- **E7(FR3.7/DS-#5)**`fence.rs`:jobs↔session 栅栏——活跃会话的投递被 HOLD;idle 不自动放行,**controller 闸门**显式 `release`(按会话 FIFO);每次成功投递双通道记录(direct+ledger),`reconcile` 验证账本可恢复 direct。4 用例。
- **E8(FR3.8/HM-F21)**`fstrigger.rs`:fs 事件→任务绑定三策——**拒自毁**(self_generated 事件直接拒,不耗预算不开窗)、**防抖**(每 path 每窗一次触发)、**预算**(滚动窗内触发上限,过期回补);决策枚举 Triggered/Debounced/BudgetExhausted/RefusedSelf;同序列确定性。5 用例。
- **E9(FR3.9/OC-F10)**`heartbeat.rs`:心跳自检投影——gap > interval×factor 记 missed,最大 gap 留观,乱序/重复 seq 防御性忽略;scratch 便签同日志承载(NoteSet/NoteClear,last-write-wins),重启不丢;全前缀重放一致。5 用例。
- 棘轮五次行使:1661→2314(附评审理由)。
- 验证:`cargo test -p nofy-scheduler` 双跑 63+1 全绿且一致。
- **E6–E9 闭环。下一步 = E10(FR6.1 进程注册表)+ E12(FR9.6 workspace 棘轮)。**
