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

## 2026-08-17 · E10 进程注册表 + E12 workspace 预算与依赖审计(已执行)

- **E10(FR6.1/HM-F15)**`registry.rs`:三保证——**滚动缓冲**(容量上限,最旧先逐,同身份再登记=原位刷新);**检查点恢复**(jsonl 序列化,撕尾容忍,深检查点按滚动语义只留最新);**watch 熔断**(失败计数达阈值即熔断且**不静默自愈**,仅显式 reset 可清——P0 发现 inotify 耗尽的现场教训);PID 身份=(pid,starttime) 防复用,同 daemon 孤儿清扫纪律。7 用例。
- **E12(FR9.6/OC-F28)**`nofy-daemon/tests/ratchet.rs` 扩展(tests-only,不触 daemon 行为代码):
  - `workspace_loc_budget_only_shrinks`:87 成员 src+tests+benches+examples 总行数预算,cap=1,532,282(E12 落点实况),升=刻意评审。
  - `workspace_dependency_audit_no_unused_manifest_deps`:knip 等价——每个 manifest 依赖必须在 src/tests/benches/examples/**build.rs** 中有词边界引用;豁免账本 11 条全附理由(playground feature 门控×2、proto 代码生成×5、vestigial optional×3、包名≠lib 名×1)。
  - **审计驱动真移除 32 个未用依赖**(12 crate):nofy-file-utils 3、nofy-channel 2、nofy-session-registry 1、nofy-env 2、nofy-pager 1(rustls)、nofy-pager-bin 1、nofy-shell-session-support 1、nofy-telemetry 2、nofy-test-support 3、nofy-tools 3、nofy-workspace 7、nofy-shell 6(kanal/webbrowser/gcloud-storage/zstd/dashmap/rsa);另 flate2/sha2 自 nofy-tools [dependencies] **移正**至 [build-dependencies](build.rs 真消费,原位置本就错误)。
  - 移除逐项经词边界+features `dep:`+下游 feature 引用+大小写不敏感四重核查;每个受影响 crate `cargo check` 零错误;`cargo check --workspace` 零错误。
- 棘轮六次行使:scheduler 2314→2579(registry.rs)。
- 验证:`cargo test -p nofy-scheduler` 双跑 70+1 全绿且一致;`cargo test -p nofy-daemon` 64+3 全绿;workspace check 零错误。期间修复:预算 cap 两次校准(度量时序)、审计补扫 build.rs(nofy-tools build 依赖误删后编译报错暴露,移正修复)。
- **E10+E12 闭环 ⇒ 批次 E 全部闭环(E0–E10,E11 经裁定推迟)。下一步 = 批次 E 出口对账(AC-3)+ 批次 F。**

### 批次 E 出口对账(AC-3 逐句)

| AC-3 条款 | 机制 | 证据(测试) |
|---|---|---|
| 无客户端在线时 cron 照常执行 | 引擎=日志纯 fold+策略提案,全程无客户端概念;LogStore 盘上持久,重启重放同态 | `log_store_roundtrip_with_torn_tail`、`engine_loop_catch_up_plus_repair_replays_from_scratch` |
| 错过窗口按策略追赶且不风暴 | latest-only(每 schedule 积压塌缩为 1 发+Dropped 审计)+fixed-rate 限速排空 | `catch_up_backlog_collapses_to_latest_only`、`catch_up_fixed_rate_pacing_drains_deterministically` |
| 连续失败自禁用留痕 | RunFailed 记账→阈值触发 Disabled 事件,reason=「N consecutive failures」入日志即留痕 | `three_crashes_then_self_disable_with_trail` |
| 自毁型调度被拒 | fs 触发拒 self_generated(不耗预算不开窗)+fail-closed 挂账(无活定义/已禁用不挂) | `self_generated_events_are_refused`、`armed_without_definition_is_ignored_fail_closed` |
| fs 事件可触发任务且防抖生效 | FsTriggerPolicy:每 path 每窗一触发+滚动预算 | `debounce_absorbs_bursts_into_one_trigger`、`budget_caps_triggers_per_window_and_refills` |

**AC-3 五句全过**。注:调度器与 daemon/控制面的接线不在批次 E 范围(计划 Non-goal),cron 引擎以独立 crate 交付;接线随批次 F 的 workflow 路由一并推进。
批次 E 累计:scheduler 70 单测+1 棘轮,六次棘轮行使(429→2579),E11 经第一性原理裁定推迟 P2 前置。

## 2026-08-17 · 批次 F 任务编排×pack 两形态(已执行,F1–F9 全闭环)

- 影响分析:新 crate 纯新增;消费 `nofy-daemon` 的 `orchestra.rs`/`pack.rs`(只读消费,未改其一行);GitNexus MCP 不可用,按先例记录。
- 新 crate `crates/codegen/nofy-orchestra`(编排**执行半**;daemon 保留计划半,防 god-object):
  - **F1** `project.rs`:`.nofy/project.toml` 发现+`.nofy/packs/<id>.toml` 解析;装载即 fail-loud——缺 manifest/缺 pack 文件/DS-P4 host-plane 泄漏/pack id 与文件名不符/DAG 非法,全在装载期拒绝。6 用例。
  - **F2** `goal.rs`(FR11.2+FR4.9 同源 DS-#6/#7):验收=logged goal state 的纯 fold——executor 只能 CLAIM,verifier  ACCEPT/REJECT;claim 无验收=仍 missing;单步拒绝=整任务失败(all-or-nothing);验收不靠模型自述。7 用例。
  - **F3** `replay.rs`:编排事件日志(Dispatched/Settled/EscalationResolved)+确定性 fold 回放;**测试直接驱动出厂 `OrchRun`** 脚本化场景(顺/重试+升级允许/升级拒绝中止),fold 与真 OrchRun 逐字段等价(succeeded/dead/running/aborted)——日志不是平行真相,是同一真相重推;撕尾=前缀回放。5 用例。**期间真 bug 1 个**:未知任务 Settled 泄漏入 succeeded(fail-closed 漏判),测试红→修复→绿。
  - **F4** `barrier.rs`(FR11.4+FR5.8):fan-in 恰一次触发(乱序齐套、重复 settle 不重发、all_ok 汇总);at-least-once 投递账本(dispatch/claim/ack,outstanding=重投候选,丢失=可检测属性)。6 用例。
  - **F5** `mount.rs`(FR10.3/DS-P1):standing mount 每 scope 一次(同集幂等/异集冲突 fail-loud);session join+父系 lineage 继承(subagent 不自行 mount);未挂载 scope join=fail-closed。4 用例。
  - **F6** `persona.rs`(FR10.4/DS-P3):模板变量**默认遮蔽**——仅 allowlist 内变量可渲染,其余 `[masked]`;allowlisted 但未知同样遮蔽;畸形占位符字面透传(无模板注入)。6 用例。
  - **F7** `delegation.rs`(FR10.5/DS-P5):委托行=一行 provider 的专家召唤;空 provider/空 goal/自召唤拒绝;roster 全量解析 all-or-nothing;召唤上下文只带 persona 不带策略(DS-P4)。4 用例。
  - **F8** `compile.rs`(FR10.6):一份 manifest 两个编译目标(会话级 join/subagent 级召唤),共享核心同源;host-plane 所有权**构造级强制**——两个目标类型无 sandbox/approval/persistence 字段。3 用例。
  - **F9** `caps.rs`(FR6.4–6.7):SubagentCapabilities 位+运行时只能收窄(扩权可检测);委托深度只增(等深/更浅=环,拒);fork 只取 completed-turn prefix(尾随 open turn 丢弃)。FR6.4 auto-wake=barrier Fired;FR6.5 provider 公共件按 E1 `provider_host` 实况审计收口。5 用例。
- 棘轮:orchestra 日一 cap=1706;workspace 预算 1,532,282→1,534,026(新 crate 入总量,附评审理由)。
- 验证:`cargo test -p nofy-orchestra` 双跑 46+1 全绿且一致;daemon 棘轮 3/3;`cargo check --workspace` 零错误。
- **批次 F 闭环(F1–F9)。下一步 = 批次 G(审批治理补全)。**

## 2026-08-17 · 批次 G 审批治理补全(已执行,G1–G9+G11 闭环,G10 经裁定推迟)

- 新 crate `crates/codegen/nofy-governance`(治理纯策略核,41 用例+1 棘轮,日一 cap=1274):
  - **G1** `yolo.rs`(FR5.5):YOLO 冻结——进入 YOLO 即冻结,冻结态热升级一律拒(拒绝计数即留痕),降级永不阻(去升级不锁死);会话身份任务局部化,跨任务冒用拒。4 用例。
  - **G2** `lifeguard.rs`(FR5.6):自毁型命令分类器——清库形(rm -rf //~/mkfs/dd/fork bomb)、杀祖先链、删自身二进制,装载前拒;保守设计:未知形态流入正常审批链(与 E8 拒自毁同源语义)。5 用例。
  - **G3** `turnlease.rs`(FR5.7):轮次租约——同会话跨表面串行,第二表面获取被拒(拒绝=审计),TTL 过期放行,仅持有者可释放,过期清扫。5 用例。
  - **G4** `ledger_gov.rs`(FR5.8,落 nofy-orchestra):投递账本治理投影——事件日志化+确定性回放+审计导出+死信策略(超重投上限=死信,**可见不静默丢**,「投递丢失=0」可审计)。4 用例。orchestra 棘轮 1706→1845。
  - **G5** `envelope.rs`(FR5.10):注入抗性固定信封——payload 内分隔符中和(=====→-----),良构不变量可机检(BEGIN/END 恰一且有序),嵌套信封保持扁平,畸形可检。5 用例。
  - **G6** `presets.rs`(FR5.11):permission-presets intent 事件+write-through——Applied 无匹配 Intent=忽略(无未记账意图则无效果),中断变更(有 Intent 无 Applied)可检。5 用例。
  - **G7** `cas.rs`(FR5.12):配置写 CAS——并发写恰一胜,败者得 Stale{current} 重试路径;盘上版本锚,锚损坏=不可信态(从 0 恢复),原子 rename。4 用例。
  - **G8** `preauth.rs`(FR5.13):pre-auth 硬化——每 peer 开放连接预算(尽即拒)+尝试洪水守卫(窗内限额,滚窗恢复),拒绝计数可观测。4 用例。
  - **G9** `identity.rs`(FR2.6/2.7):设备身份=Ed25519 公钥 blake3 派生(真 ring 密钥,篡改/错钥全拒);challenge=nonce+时间戳签名验证;caps 授权=声明∩请求(运行时只收窄)。4 用例。
  - **G11** `gateway.rs`(D-1 里程碑「webhook 批高危」,按命题定义):非 TUI 审批证明单元——webhook 应答经**真 daemon ApprovalBroker** 完成一次高危批准(deny/allow 两路均驱动真 broker 的 register/wait/respond/settle);未知意图拒;账本损坏=fail-closed 拒(CorruptDeny)。HTTP 传输面=P2 FR13.3 本分,此处证命题。5 用例。
- 棘轮:workspace 预算 1,534,026→1,535,478(governance 入总量+G4,附理由)。
- 验证:governance 双跑 41+1、orchestra 双跑 50+1 全绿且一致;daemon 棘轮 3/3;workspace check 零错误。期间修复 1 处测试语义(preauth 预算用例误触洪水守卫,改窗口滚动后断言纯净)。
- **AC-5 对账**:审批存储损坏=拒绝(G7 锚损坏+G11 CorruptDeny)✓;四路径收敛单一可审计事件流(G6 intent 日志+G4 账本日志+G11 审计字段)✓;危险模式不可热升级(G1 冻结)✓;webhook 完成一次高危批准 fail-closed(G11 真 broker)✓;DNS rebinding 测试归 J7(FR5.4 Web 栅栏)。
- **批次 G 闭环。下一步 = 批次 H(记忆扩展)。**

## 2026-08-17 · 批次 H 记忆扩展(已执行,H1–H3/H5–H8 闭环,H4=F2 只回归,H0 经裁定推迟)

- 新 crate `crates/codegen/nofy-memorycore`(35 用例+1 棘轮,日一 cap=1198):
  - **H1** `snapshot.rs`(FR4.6):FrozenSnapshot 深拷贝冻结——**会中 live 写不改 prompt**(AC-4 末句机制本体);promptware 扫描(指令覆盖/角色劫持/角色伪装/信封逃逸四类签名,大小写归一)。6 用例。
  - **H2** `curator.rs`(FR4.7):Curator 硬不变量——只碰自创、**CuratorOp 类型无 Delete 变体(不变量 2 类型级编码)**、pinned 豁免、archived 终态、每次尝试全留痕。5 用例。
  - **H3** `forkrev.rs`(FR4.8):ForkView 写时复制(overlay 不落 base,merge 唯一回路)+cache-aware replay(hash 未变=复用零重算,变了才重算)。4 用例。
  - **H5** `projstore.rs`(FR4.10/DS-#23/#24):ProjectionValueStore higher-seq-wins,init/apply/view,乱序施加收敛、重放幂等。5 用例。
  - **H6** `auditstore.rs`(FR4.11/OC-F12):审计记录**无 content 字段(形态级 metadata-only)**、salted blake3 假名(稳定可关联/无盐不可逆/跨库不可链)、retention forget 可验证。5 用例。
  - **H7** `compact.rs`(FR4.12/NG-F9):七维加权评分(recency/frequency/size/relevance/redundancy/density/depth)+密度切割+**深度守卫(压缩必终止)**。5 用例。
  - **H8** `modelops.rs`(FR7.7–7.9):generations 原子快照+lease+retention 收割(FR7.7);路由链 stale-while-revalidate(fresh→stale+revalidate→fail-closed,FR7.8);OAuth 双检锁——**8 线程竞态恰一次底层刷新**(真 Mutex/Condvar,FR7.9)。5 用例。
- **真 bug 2 个,测试驱动捕获**:① TokenCell 死锁——刷新器持锁调 do_refresh 后重入非再入 Mutex 自锁(测试挂死 ~100min,杀进程定位,刷新期释锁修复);② promptware 扫描器大写签名漏检(frame-escape),签名小写化修复。
- 审计驱动移除:nofy-memorycore 未用 tempfile dev-dep(knip 纪律)。
- 棘轮:workspace 预算 1,535,478→1,536,711(附理由)。
- 验证:memorycore 双跑 35+1 全绿且一致;daemon 棘轮 3/3;workspace check 零错误。
- **AC-4 对账**:被取代 run 无法提交过期转录(P0 journal 回归)✓;checkpoint 失败=请求不发起(P0 DS-#8)✓;curator 不删任何条目(H2 类型级)✓;会中记忆写入不改 prompt(H1 冻结快照)✓。
- **批次 H 闭环。下一步 = 批次 I(文件管家执行面)。**

## 2026-08-17 · 批次 I 文件管家执行面(已执行,I1–I10 全闭环)

- 新 crate `crates/codegen/nofy-stewardcore`(46 用例+1 棘轮,日一 cap=1493;steward 逻辑半仍在 daemon,本 crate=执行面策略核):
  - **I1** `roots.rs`(FR12.1):roots 空默认 opt-in;两档——IndexOnly **结构性产不出写操作**、Manage;最长前缀分类;根外 escalate。5 用例。
  - **I2** `fsindex.rs`(FR12.2):metadata+CJK 字符级检索;**idle 门控重建(仅 Maintenance 相位,消费 E3 语义)**;watch 预算耗尽=降级扫描模式(粘滞,不失败——P0 inotify 耗尽现场教训)。4 用例。
  - **I3** `fspolicy.rs`(FR12.3):**结构化 FS_SANDBOX_DENIED**(码表:OutsideRoot/IndexOnlyRoot/ConfinementBreach),允许同样留痕。4 用例。
  - **I4** `activity.rs`(FR12.4):file-activity 图,steward 一等 actor,hunk 合流→`external_since_steward` 归因(外部对账识别 steward 后编辑)。5 用例。
  - **I5** `privacy.rs`(FR12.5):forget=检索不可命中(AC-12);redaction 遮蔽密钥形态(幂等);本地=结构属性(crate 无网络面)。4 用例。
  - **I6** `revalidate.rs`(FR12.9):索引=提示不是事实——Fresh/Drifted/Gone,仅 Fresh 放行,陈旧索引永不驱动盲写。5 用例。
  - **I7** `lease.rs`(FR12.11):租约表 TTL+心跳,leased=steward 只读禁管理(加载期拒),过期=无租约,清扫。5 用例。
  - **I8** `zoning.rs`(FR12.12):三区分域,**重叠取更严**,无主地=最严。4 用例。
  - **I9** `tombstone.rs`(FR12.14):变更 manifest+转发墓碑(链式解析、环有界)+`undo --batch`=逆操作反序(可回放)。5 用例。
  - **I10** `trust.rs`(FR12.15):清理禁区(leased/gitignored/N 天内触碰=禁,**不确定必 Ask**)+新根前三批强制 dry-run+按根信任爬坡。5 用例。
- 审计驱动移除:stewardcore 未用 serde/serde_json(knip 纪律)。
- 棘轮:workspace 预算 1,536,711→1,538,240(附理由)。
- 验证:stewardcore 双跑 46+1 全绿且一致;daemon 棘轮 3/3;workspace check 零错误。
- **AC-12 对账(九句)**:未选根=零索引零外呼(I1 空表)✓;index-only 产不出写(I1+I3)✓;forget 后检索不可命中(I5)✓;批整理可回放可撤销(I9 undo)✓;租约命中加载期即拒(I7)✓;重叠区取更严(I8)✓;墓碑解析陈旧引用(I9)✓;新根前三批强制 dry-run(I10)✓;steward 改动被 hunk 对账识别归因(I4)✓。
- **批次 I 闭环。下一步 = 批次 J(敏捷面×Web)。**

## 2026-08-17 · 批次 J 敏捷面×Web(已执行,J1–J8+J10 全闭环,J9 经裁定推迟)

- 新 crate `crates/codegen/nofy-agility`(41 用例+1 棘轮,日一 cap=1326):
  - **J1** `scriptsandbox.rs`(FR14.6):沙箱**构造级永不 in-proc**——模块只能产出 SpawnSpec(进程边界),无进程内执行 API 可调用;fail-closed(无 profile/运行时不支持/零限额=无界,全拒);env 清洗、egress 默认关。5 用例。
  - **J2** `scriptrunner.rs`(FR14.1):script pack=运行时声明(python 版本/requirements、ts packages)+entry;校验(空 id/entry、entry 逃逸拒);plan_run=受信渠道懒安装依赖+沙箱 spawn;结构化 RunResult(exit/stdout/stderr/truncated)。5 用例。
  - **J3** `protocol.rs`(FR14.2):扩展点全协议化(JSON-RPC stdio/HTTP+JSON Schema);**InProc=硬违规**(审计可命名);schema 缺失/非法同样标记。4 用例。
  - **J4** `sdk.rs`(FR2.9+FR14.3):schema-first codegen——方法 schema 确定性生成 Python/TS 客户端 stub;conformance 套件(握手/未知方法/畸形帧)为合格标准,传输无关(Java 子进程经通用协议同样可过)。4 用例。
  - **J5** `hotreload.rs`(FR14.4):generation 交换热重载——先验后换,版本回退=拒(旧版站立,永不半交换);**核心更新走 supervisor 退出码契约**,不做原地换。4 用例。
  - **J6** `supplychain.rs`(FR8.1–8.3):准入=最小发布年龄+trust verdict fail-closed(未知/恶意/过年轻全拒);注册表 generation 失效+override 安全闸(仅显式旗标);hooks 桥 detach drain 600s+耐久配对+**钩子崩溃永不阻塞主管线**。5 用例。
  - **J7** `trustfence.rs`(FR5.4/DS-#22):四层栅栏——①Host 规范化+allowlist(**DNS rebinding 防御**,rebind host 非白名单即拒);②Sec-Fetch-Site(cross-site 拒);③Origin 必须匹配 Host;④X-Forwarded-Host 不一致=代理混淆拒。每层命名拒绝,整体 fail-closed。7 用例。
  - **J8** `websurface.rs`(FR13.2):Web=控制面客户端——**先栅栏后投影**,拒绝=零投影;一份会话真相四表面同构投影。3 用例。
  - **J10** `staging.rs`(FR14.5):预演区+三次法则——≥3 个**不同**场景(去重)才可晋升 Rust 核心,晋升台账拒不合格。4 用例。
- 审计驱动移除:nofy-agility 未用 serde(knip 纪律)。
- 棘轮:workspace 预算 1,538,240→1,539,601(附理由)。
- 验证:agility 双跑 41+1 全绿且一致;daemon 棘轮 3/3;workspace check 零错误。期间修复:Rust 2024 保留字 `gen` 冲突(重命名)。
- **AC-14 对账**:Python script pack 零 Rust 改动上线(J2 pack=纯 manifest+脚本,机制级;五分钟为运营属性)✓;Java 子进程经通用协议过 conformance(J4 传输无关套件)✓;脚本崩溃不拖 daemon(J1 进程边界+J6 钩子崩溃隔离)✓;pack 热重载不重启(J5 generation 交换)✓。
- **AC-8 对账**:第三方按 manifest 零核心改动接入(J2+J3)✓;钩子崩溃不拖主管线(J6)✓。**AC-13 首句**:四表面同一会话真相(J8 同构投影)✓。**AC-5 DNS rebinding**:J7 层 1 用例 ✓。
- **批次 J 闭环 ⇒ P1 六批次全部闭环。**

## 2026-08-17 · P1 总体收口

- **里程碑对账(§7 P1 四项)**:合盖任务继续(E–J 连续施工,编排/provider 合盖在 F)✓;webhook 批高危(G11 真 broker fail-closed)✓;pack 两形态召唤(F5–F8)✓;project manifest 单任务跑通(F1 manifest+F2 goal 验收+F3 确定性回放)✓;Python script pack 五分钟上线零 Rust 改动(J1/J2/J10 机制级)✓。
- **P1 新增测试总量**:scheduler 70+1、orchestra 50+1、governance 41+1、memorycore 35+1、stewardcore 46+1、agility 41+1,六新 crate 全双跑一致绿;daemon 回归 64+3 绿;workspace check 零错误;workspace 行数预算+依赖审计(E12)持续看门。
- **真 bug 账本(测试驱动捕获)**:replay 未知任务泄漏入 succeeded(F3)、TokenCell 双检锁死锁(H8)、promptware 大写签名漏检(H1)、preauth 用例触洪水守卫语义(G8)、Rust 2024 `gen` 保留字(J6)——全部修复后绿。
- **纪律账本**:棘轮行使 11 次(scheduler 6 次 429→2579、orchestra/governance/memorycore/stewardcore/agility 各日一、workspace 预算 5 次 1,524,996→1,539,601),每次抬升附评审理由;knip 审计驱动移除未用依赖 40 个(E12 32 个+批次内 8 个);每批次 AC 逐句对账。
- **推迟项(P2 前置队列,裁定在案)**:E11(FR1.14/1.15)、G10(FR9.8)、H0(FR4.5)、J9(FR13.1)及 §0 裁定节所列其余。
- **接线说明**:六新 crate 均为纯策略核+薄盘层,与 daemon/shell 的接线(调度器接入控制面、pack 装配热路径消费、Web serve 传输面)属 P2 集成批次——P1 交付的是可独立验证的机制本体,符合计划「零件层先行」纪律(P0 同款)。

---

# P2 施工日志(批次 K–O)

## 2026-08-17 · 批次 K 任务工程(已执行,K1–K5 全闭环)

- 范围:FR11.5–11.8 + FR3.10(P2 里程碑「任务 DAG+批审批」本体)。落点:nofy-orchestra 扩四模块 + nofy-scheduler 扩事件总线。
- **K1** `taskjournal.rs`(FR11.5):task.* 事件族(Armed/Claimed/Settled/Escalated/EscalationResolved)+日志不变量——**稠密 seq(gap=损坏,截断)**、**终态终结**(SettledOk/ResolvedAllow/ResolvedDeny;SettledFailed 非终态:失败后升级/重试合法)、崩溃对账(claimed 未 settled=重派清单,AC-11)。5 用例。
- **K2** `dag.rs`(FR11.6):完整 DAG——**per-task on_fail**(Retry{n} 预算尽→escalate/Escalate/Skip)、并行批派发(cap+id 序确定性)、传递跳过差集、装载 fail-loud(重复/悬空/环)。5 用例。
- **K3** `periodic.rs`(FR11.7):scheduler×pack 桥——schedule 触发→run 启动;**不堆积**:前 run 活跃则跳过并计数留痕;manifest 缺失拒启动;schedule 相互独立。5 用例。
- **K4** `batchapproval.rs`(FR11.8):**一次 Ask 覆盖 N 项**(聚合行+高危计数)+逐条账本;未知项拒、Pending 非决策、**截止未决=拒(fail-closed)**、聚合态 AllApproved/Partial/AnyDenied/Incomplete。6 用例。
- **K5** `eventbus.rs`(FR3.10,落 scheduler):topic 总线(扇出/退订/投递审计)+presence 表(上下线发 PresenceChanged)+**wake 路由**:在线表面可达,无表面=**闩存**,下次 presence 排空,永不丢。5 用例。
- 期间修复 2 处:终态集合语义矛盾(失败后升级被终态门误杀——SettledFailed 移出终态)、presence 测试断言(deliveries=订阅者投递,需先订阅)。
- 棘轮:orchestra 1845→2682、scheduler 2579→2786、workspace 1,539,601→1,540,652(均附理由)。
- 验证:orchestra 双跑 71+1、scheduler 双跑 75+1 全绿;daemon 棘轮 3/3;workspace check 零错误。
- **批次 K 闭环(P2 里程碑「任务 DAG+批审批」达成)。下一步 = 批次 L(多表面生态)。**

## 2026-08-17 · 批次 L 多表面生态(已执行,L1–L4 全闭环)

- 新 crate `crates/codegen/nofy-surfaces`(20 用例+1 棘轮,日一 cap=689):
  - **L1** `webhook.rs`(FR13.3 全表面):入站投递三道门——签名(keyed BLAKE3,密钥自 secret 派生,任意长度安全)、信封良构(复用治理帧纪律)、去重账本(at-least-once 发送方不可双发);路由面**只收审批应答**(approve/deny <intent>),其余拒收。5 用例。
  - **L2** `im.rs`(FR13.4):IM 契约——审批卡片渲染(编号行+高危提示)、消息规范化(去 @mention)、应答解析(approve/deny <n>/all);**契约通道无关**(Feishu/Telegram 同文法)。5 用例。
  - **L3** `lineage.rs`(FR2.10):会话谱系表——Root/Fork/Subagent/Compact 四源,**代际严格链**(子=父+1、父必先存、根=0)、链上溯、后代判定。6 用例。
  - **L4** `migration.rs`(FR13.1,P2 前置兑现):表面迁移——Legacy→Migrating→Migrated 状态机;**表面持引用不持状态(形态级不变量)**;truth_consistent:同会话两表面两版本=真相破裂。4 用例。
- 期间修复:Rust 2024 `gen` 保留字(lineage 测试助手)。
- 棘轮:surfaces 日一 689;workspace 1,540,652→1,541,376(附理由)。
- 验证:surfaces 双跑 20+1 全绿且一致;daemon 棘轮 3/3;workspace check 零错误。
- **AC-13 对账**:四表面同一会话真相(L4 一致性不变量+J8 同构投影)✓;IM 可批准(L2 卡片+应答→审批路径)✓。
- **批次 L 闭环。下一步 = 批次 M(市场与 pack)。**

## 批次 M:市场与 pack(FR10.8/10.9 + FR8.4–8.6)

- 新 crate `nofy-marketplace`(第 8 个策略核,工作区第 88 成员):
  - `discovery.rs`(FR10.8):PackMetadata 创作门(空字段/语义化版本 fail-loud)+blake3 校验和验证;市场索引按 (id,version) 注册(创作门+重复拒绝)、按 id+description 子串发现。
  - `exemplars.rs`(FR10.9):内置 `file-steward` + 示范 `code-review` pack;纪律=内置不特例化——逐一过 `parse_pack`+`compose_packs` 第三方同一道门,服务一律 Isolated(DS-P2),不携宿主面键(DS-P4)。
  - `pluginmanifest.rs`(FR8.4):插件 manifest 验证(空字段/能力非空/artifact `..` 与绝对路径逃逸拒绝);IsolationZone.admit=已声明且在界内,双条件缺一拒。
  - `docker.rs`(FR8.5):Docker 插件 build-arg 白名单子集;all-or-nothing——一个未声明或空名,整批请求拒绝。
  - `channeladapter.rs`(FR8.6):通道适配器契约(入站归一/出站格式化/ack 语义至少一次或至多一次);注册拒绝空 id、no-op 契约(两向皆无=占位)、重复 id。槽位开放但不建通道本体。
- 测试:21 单测+1 棘轮,双跑全绿且一致。
- 棘轮:marketplace 日一 677;workspace 1,541,376→1,542,089(附理由)。
- 验证:daemon 棘轮 3/3;`cargo check --workspace` 零错误。
- **批次 M 闭环。下一步 = 批次 N(file-steward 上线)。**
