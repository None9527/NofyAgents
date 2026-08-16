# OpenClaw OS-level Agentic 特性深挖（源码级）

> 调研对象：`/home/none/grok-build/ref/openclaw`（OpenClaw 2026.8.x，TypeScript/Node monorepo）
> 目标：为 grok-build（Rust 终端 coding agent）的 OS-level agentic 演进抽取可吸收特性。
> 基线线索来自 `ref-analysis/openclaw.md`，但本文每条均回源码核实，并下钻到其未覆盖的实现细节。
> 轴：L1 常驻 / L2 跨域 / L3 系统面 / 治理 / 模型运营 / 生态 / 工程可信。
> grok-build 落点 crate 以 `crates/codegen/nofy-*` 现有布局为准（agent、agent-lifecycle、session-journal、sqlite-journal、sandbox、tools/tools-api、auth、config、memory、models、hooks、workspace、crash-handler、interjection-core、computer-hub-*、workflow、acp-lib 等）。

## grok-build 现状 ↔ 本文特性速查

| grok-build 已有种子 | 对应补齐特性 |
|---|---|
| Leader/Hub（per-workspace daemon，WS 多客户端） | F1/F2（健康与单实例）、F7/F8（会话键与写栅栏）、F19（幂等）、F22（pre-auth 硬化） |
| ACP + serve + headless 三协议面 | F27（schema-first 收敛）、F14（设备鉴权）、F15（caps 收窄） |
| nofy-sandbox（Landlock/bwrap/seccomp）+ 审批 | F20（三正交+explain）、F21（exec-approvals fail-closed）、F16（跨表面审批路由） |
| nofy-memory（全局+workspace 双层） | F11（dreaming 蒸馏 + backend trait）、F12（审计） |
| nofy-models（模型类别表）+ nofy-circuit-breaker | F24（generation 快照）、F30（failover 阶梯+原因分类学） |
| nofy-interjection-core（单表面插话） | F17（多表面 steering）、F18（中断转录）、F13（系统事件总线） |
| nofy-crash-handler / nofy-update | F4（服务安装）、F5（快速路径）、F6（restart sentinel） |
| nofy-plugin-marketplace / nofy-hooks | F23（供应链门禁）、F25（发现/隔离区） |
| nofy-computer-hub-*（浏览器手） | F15（执行世界 caps manifest） |
| 无主机级调度 | F9（cron 引擎）、F10（heartbeat 投影）、F4（BOOT.md 自检子项） |
| nofy-config（多表面可写） | F33（配置写 CAS） |

阅读建议：先看 P0（F1/F2/F6/F8/F9/F16/F17/F19/F20/F21/F30），再看"不吸收清单"避坑。

---

## 一、L1 常驻（daemon 生命周期 / 健康 / 单实例 / 安装 / 崩溃恢复）

### F1. 单实例双锁 + PID 复用防御 + 进程身份核验 — P0
- 源：`src/infra/gateway-lock.ts`（577 行）；`LockPayload` schema `:44-59`，`resolveGatewayOwnerStatus` `:188-238`，`shouldReclaimGatewayLock` `:257-288`，`acquireGatewayLock` 双锁 `:378-444`，sqlite 协调器 `:505-513`。
- 机制：获取锁时先抢 `<lock>.sqlite` 的独占协调器（`tryAcquireExclusiveSqliteCoordinator`），再走文件锁管理器；锁 payload 含 `pid/ownerId/createdAt/configPath/port/role/stateDir/startTime`。**三层 owner 存活判定**：① `isPidAlive`；② 进程启动时间比对（`startTime` 防 PID 复用，即使 argv 形状相同也判死，`:197-206`）；③ 读 `/proc/<pid>/cmdline`（Linux）/`ps -o command=`（macOS）/wmic（Windows）验证 argv 属于 openclaw（`:120-160`、`:208-238`）。stateDir 锁 + per-config 哈希锁双持（`gateway.state.lock` + `gateway.<hash8>.lock`），`OPENCLAW_ALLOW_MULTI_GATEWAY=1` 才允许同配置多实例；stateDir 经 realpath 规范化使符号链接别名共享同一把锁（`:290-311`）。role 枚举区分 `gateway/agent-embedded/skill-workshop-apply/sqlite-maintenance`，嵌入式写者也在同一锁体系内。
- 证据：`gateway-lock.test.ts` 存在；错误消息区分 "another embedded OpenClaw state writer is active" vs "gateway already running"（`:566-575`）；注释明确 "Process start identity catches PID recycling"。
- 价值：L1。grok-build 的 Leader 常驻种子 + serve 模式需要"同 workspace 单写者"保证；现有 fsnotify/workspace 多进程场景下缺一把带身份核验的锁。
- 吸收：落 `nofy-agent-lifecycle`（或新 `nofy-lock`）。`struct LockPayload { pid, owner_id: Uuid, created_at, start_time: Option<u64>, config_hash: [u8;8], role: LockRole }`；`trait OwnerProber { fn cmdline(pid)->Option<Vec<String>>; fn start_time(pid)->Option<u64> }`，Linux 读 `/proc`，macOS 用 libproc。sqlite 协调器可直接复用 `nofy-sqlite-journal` 的 `OPEN ... EXCLUSIVE` 语义。
- 成本 M；风险：macOS `ps` 解析空格路径的已知弱点（原注释承认，保守回退 alive）——Rust 侧用 libproc 可避开。

### F2. 健康监视家族：通道健康监视器 + readiness 探针 + event-loop 自我健康 — P0
- 源：`src/gateway/channel-health-monitor.ts`（329 行）+ `src/gateway/channel-health-policy.ts`（216 行）。默认值 `:17-21`（5min 周期、60s 启动宽限、2 周期冷却、**10 次/小时重启上限**）；`evaluateChannelHealth` policy `:83+`；stale 阈值 30min、连接宽限 120s（policy `:80-81`）。
- 机制：纯策略函数 `evaluateChannelHealth(snapshot, policy)` 返回 `{healthy, reason}`，reason 枚举 12 种（healthy/unmanaged/not-running/terminal-disconnect/blocked/busy/stuck/startup-connect-grace/disconnected/stale-socket/ingress-unavailable）。监视器每周期遍历所有 channel account 快照：跳过手动停止/自动重启已排程（避免与 supervisor backoff 互相踩踏，`:170-176`）；**"stale socket" 只看传输层活动时间戳**（heartbeat/poll，明确不用普通消息，`:24-29` 注释）；重启走 stop→resetRestartAttempts→start；`restartsThisHour` 滑动窗口预算 + 冷却；`pendingContinuationUsed` 标记保证卡在 restartPending 的账户只享受一次"免冷却续跑"，之后重新计入预算（`:144-150`、`:185-214`，注释引用 #105189 防 thrash）。shutdown 时 `waitForIdle` 带 5s handoff 超时，晚到的 stop 不得复活通道（`:286-314`）。
- 证据：`channel-health-monitor.test.ts`、`channel-health-policy.test.ts`；readiness 探针复用同一 `evaluateChannelHealth`（`server/readiness.ts:4-11`），两处共享阈值常量（policy `:78-81` 注释）。
- 价值：L1。grok-build 的 Hub WS 多客户端、MCP server、Computer Hub 连接都需要"僵尸连接检测 + 有预算的自愈"，目前无统一健康层。
- 吸收：新 `nofy-health`（或入 `nofy-agent-lifecycle`）。`trait HealthSubject { fn snapshot(&self)->HealthSnapshot; async fn restart(&self)->Result<()> }`；`struct RestartBudget { per_hour: VecDeque<Instant>, cooldown: Duration }`；策略函数与监视循环分离（照抄其 policy/monitor 二分），便于单测。
- 成本 M；风险：低——纯本地逻辑；注意把"活动时间戳"的来源约束写进 trait 文档（只认传输层信号）。
- 子项（readiness + event-loop 自健康，原 F3）：`src/gateway/server/readiness.ts`（144 行，`ReadinessResult {ready, failing[], suppressed[], uptimeMs, eventLoop}` `:14-20`，1s 结果缓存 `:25`）；`src/gateway/server/event-loop-health.ts`（201 行，阈值 `:4-11`：delay p99>1s、utilization>0.95、CPU>0.9 核、持续退化 60s 才告警）。event-loop 监视器采样延迟分布 + utilization + cpuUsage 产出 `degraded/degradedSinceMs/reasons`；readiness 把通道快照 + sidecar 状态 + event-loop 健康聚合成可 HTTP 暴露的探针，对 backoff 中的重启窗口给绿（`:36-44`）。证据：`readiness.test.ts`、`event-loop-health.test.ts`、docker healthcheck 复用。grok-build 落点：`nofy-http` 加 `/readyz`；`nofy-telemetry` 增 `RuntimeHealthSampler`（tokio 指标 + 慢任务计数），`struct Readiness { ready: bool, failing: Vec<SubsystemId>, uptime: Duration }`。成本 S。

### F4. daemon 安装：launchd/systemd 单元生成与重启策略 + BOOT.md 启动自检 — P1
- 源：`src/daemon/`（106 文件）：`launchd-plist.ts:341` 生成 plist（`RunAtLoad=true`、`KeepAlive=true`、`ExitTimeOut`、`ThrottleInterval`、`Umask`、stdout/stderr 落盘路径）；`systemd-unit.ts:81-82`（`Restart=always`、`RestartSec=5`）；另有 `systemd-linger.ts`（用户级 linger）、`launchd-restart-handoff.ts`（更新时旧服务交接）、`restart-logs.ts`、`gateway-heap.ts`（堆上限注入）。
- 机制：`openclaw onboard --install-daemon` 把当前进程参数固化为系统服务单元；更新流程用 "restart handoff"：新版本进程就绪后旧服务退出，避免双跑（与 F1 锁配合）。schtasks 路径覆盖 Windows。
- 证据：`service.runtime.test.ts`、`launchd-install.ts` 等成体系测试；docs/install/ 33 篇安装文档。
- 价值：L1。grok-build Leader 种子要"装一次、开机自启、崩溃自拉"，目前缺安装器。
- 吸收：`nofy-agent-lifecycle` 加 `daemon install/uninstall/status` 子命令；Linux 生成 user unit（`~/.config/systemd/user/nofy-leader.service`，`Restart=always RestartSec=5` + `systemctl --user enable`），macOS 生成 LaunchAgent plist。单元模板照抄其字段集（含日志路径与 umask）。
- 成本 M；风险：中——各发行版 systemd 用户会话差异（linger 未开时登出即停），需 doctor 诊断提示。
- 子项（BOOT.md agent 驱动启动自检，原 F32，P2）：`src/gateway/boot.ts:38-69`（`buildBootPrompt`）、`:74`（`MAX_BOOT_FILE_BYTES = 16MiB`）、`:109`（`runBootOnce`）、`:71`（隔离会话键 `agent:<id>:boot`）、`:144`（`preserveTemporarySessionMapping` 快照/恢复）。gateway 启动时读 workspace 的 `BOOT.md`，在**隔离 boot session** 里作为一次 agent turn 执行；内容包在 internal-runtime-context 分隔符中防模型回声原文（`:48-69`，注释引 #53732）；boot 会话对主会话 mapping 的副作用先快照后恢复（`:144-176`），失败不残留。证据：`boot.test.ts`、`boot-echo-guard.ts`（独立回声守卫）。价值：给常驻 daemon 一个"开机自检"面（磁盘、未合并 PR、昨日未完成任务），结果走公告不污染主会话。grok-build 落点：`nofy-agent-lifecycle` 启动路径对每个 workspace 找 `BOOT.md`（限大小），headless 执行、会话键 `boot:<ts>` 隔离、输出进 `nofy-announcements`；需限制工具面与时长（只读工具 + 超时）。成本 S。

### F5. 启动器冷启动快速路径 + compile-cache + respawn — P1
- 源：`openclaw.mjs`（818 行）：`tryOutputLauncherVersion` `:605-620`（纯读 package.json/build-info.json，不加载运行时）；`loadPrecomputedHelpText` `:594-603`（读构建期预生成的 `dist/cli-startup-metadata.json`）；`shouldDeferRootHelpToRuntimeEntry` `:577-592`（只有配置里出现 plugins/$include 才把 root help 交给重运行时，否则用预计算文本）；`src/entry.compile-cache.ts`（259 行，Node compile cache 管理 + 必要时 respawn 子进程并转发信号）、`src/entry.respawn.ts`（185 行）、`src/entry.version-fast-path.ts`（63 行）。
- 机制：三级快速路径：version → 预计算 help → 才 import 完整 CLI。构建期把 help 文本/子命令清单快照进 JSON，冷启动毫秒级返回。
- 证据：`entry.version-fast-path.test.ts`、`entry.root-help-fast-path.test.ts`、`entry.compile-cache.test.ts`、`entry.respawn.test.ts` 全覆盖；`config/control-ui-startup-budget-baseline.json` 还有 UI 启动预算基线。
- 价值：L1/工程。grok-build 单 Rust 二进制冷启动已快，但 `--version/--help` 仍会初始化日志/配置；子命令补全与 help 可构建期快照。
- 吸收：`nofy-pager-bin`/主 bin：在 clap 解析前短路 `--version`（读内嵌 build-info）；build.rs 生成 help 快照供 shell 补全。respawn 机制对应 grok-build 自更新场景（`nofy-update` 已有基础）。
- 成本 S；风险：低。

### F6. 重启哨兵 + restart-safe 准入 + 持久投递队列（崩溃恢复三件套）— P0
- 源：`src/gateway/server-restart-sentinel.ts`（746 行，头注释 `:1-3`："Resumes pending restart continuations and outbound delivery after process restart"）；`src/config/sessions/restart-recovery-state.ts`（512 行，`resolveRestartRecoveryChannelAuthority` `:21-40`：只有完整持久化的 channel claim 才配做恢复投递目标）；`src/infra/session-delivery-queue.ts` facade + `session-delivery-queue-storage.ts:153`（"Renewable wall-clock lease; an unexpired owner must never be dead-lettered"）；`src/gateway/server-methods/chat-send-handler.ts:186-228`（restart-safe admission：幂等行与生命周期声明**原子提交**，重启后重试认领而不重复提交）。
- 机制：① 进行中的 turn 以 `restartSafeAdmission` 落盘（含 clientRunId），进程重启后 sentinel 读取 pending 续体（`RestartSentinelContinuation`）恢复；② 出站回复进持久 delivery queue，带租约 + 死信（dead-letter 后不可盲目重放，`delivery-queue-recovery.ts:614`）；③ 恢复时校验"通道权威"（source run id + delivery context 完整才允许代发），防止把恢复消息发到错误会话。
- 证据：`qa/scenarios/jsonl-replay/gateway-restart-recovery.jsonl`（策展回放夹具："gateway restarted before final delivery; session state recovered… no duplicate marker was sent"）；`server-restart-sentinel.test.ts`、`restart-recovery-state` 系列测试。
- 价值：L1。grok-build 的 Leader 常驻 + 长任务（workflow/subagent）崩溃后必须"不丢回复、不重发"。这是 OpenClaw 最贵的也最值钱的常驻能力。
- 吸收：`nofy-session-journal` 增 `run_admission` 表（run_id, session_key, status, started_at, recovery_context）；`nofy-workspace` 或新 `nofy-outbox` 实现持久投递队列（sqlite，lease + attempt 计数 + dead letter）。恢复入口放 `nofy-agent-lifecycle` 启动路径。
- 成本 L；风险：高——恢复语义必须幂等（与 F19 联动）；建议先做"准入落盘 + 启动时标记 interrupted"，再做出站重投。

---

## 二、L2 跨域（全局会话索引 / 记忆策展 / 调度 / 事件总线）

### F7. 会话路由：dmScope 语义 + bindings + 路由缓存 — P1
- 源：`src/routing/resolve-route.ts`：`resolveAgentRoute` `:592+`，`dmScope` 默认解析 `:604`（`input.dmScope ?? cfg.session?.dmScope ?? "main"`），`buildAgentSessionKey` `:87-109`，路由缓存键 `:549-568`（含 dmScope、guild、team、role ids 排序后 JSON 序列化）、缓存上限清空策略 `:625-633`。
- 机制：入站消息按 (channel, accountId, peer, parentPeer, guild, team, roles) 匹配 bindings 选 agent，再按 `dmScope ∈ {main, per-peer, per-channel-peer, per-account-channel-peer}` 生成会话键——控制"所有 DM 汇一个主会话"到"每账户每渠道每对端独立会话"的隔离谱系。`identityLinks` 可把不同渠道的同一个人映射成同一 peer。路由结果按配置对象 WeakMap 缓存，配置变更自动失效。
- 证据：`docs/concepts/session.md`（前报告已引）+ `resolve-route` 大量单测；`session.identityLinks` 在 `:605` 参与解析。
- 价值：L2。grok-build 接 Hub 多客户端/ACP 多来源后，"哪些来源共享一个会话、哪些隔离"需要显式语义，而不是硬编码。
- 吸收：`nofy-chat-state`/`nofy-session-journal`。`enum SessionScope { Main, PerPeer, PerSurfacePeer, PerAccountSurfacePeer }`；会话键构造纯函数 + 属性测试。bindings 可后置（先做 scope）。
- 成本 S（scope 语义）/M（含 bindings）；风险：低。

### F8. writer-run 写栅栏：进程内 writer queue × 跨进程 BEGIN IMMEDIATE 双保险 — P0
- 源：`src/config/sessions/session-accessor.sqlite-transcript-write.ts`（694 行）：`replaceTranscriptEventsSync` 栅栏 `:159-186`；`withTranscriptWriteLock` `:549+`；BEGIN IMMEDIATE 后重校验 `:570-577`（注释："The writer queue is process-local. Revalidate after BEGIN IMMEDIATE so a committed cross-process append cannot be deleted by the rewrite"）；失败抛 `SessionTranscriptWriterClaimReboundError` `:183`。准入侧：`src/agents/embedded-agent-runner/run/session-bootstrap.ts:335`（`expectedWriterRunId: params.runId`）。
- 机制：每个被准入的 run 在会话条目上声明 `activeWriterRunId`；所有转录追加/替换在事务内重读行并校验 `activeWriterRunId === expectedWriterRunId`（还可带 `expectedLifecycleRevision`），声明被顶替的 run 提交即抛错。两层锁：进程内互斥 writer queue（序列化 read-append）+ SQLite BEGIN IMMEDIATE 事务内**再次**比对快照行（防跨进程并发改写删除他人提交）。
- 证据：`session-accessor.sqlite-entry.ts`（752 行）同族栅栏；`docs/concepts/agent-loop.md`（前报告引）；`server.sessions.reset-concurrency.test.ts` 等并发测试。
  - 细节下钻：这是**三道互不替代的栅栏**——`sessionId` 比对防"会话已 reset 成另一个转录"、`expectedLifecycleRevision` 防"生命周期已翻页（归档/删除/重建）"、`activeWriterRunId` 防"另一个 run 已接管写权"，三者都在同一事务内回读，杜绝 check-then-act 竞态。失败语义是**抛 `SessionTranscriptWriterClaimReboundError` 而非静默丢弃**（`:182-184`），让晚到的 run 显式得知自己已被取代，走孤儿修复而不是幻觉式追加。转录整体重写另有 `expectedGeneration` 乐观锁（`:141-147`），与行级栅栏分层：行级管"谁在写"，generation 管"基于哪版内容改写"。
- 价值：L2/治理。grok-build 已有 workspace 单写者锁（F1 方向），但**会话级**写栅栏（哪个 run 有权改哪段转录）是防"僵尸 run 覆盖新转录"的关键，尤其崩溃恢复与 subagent 并发场景。
- 吸收：`nofy-session-journal`：`session_entry` 表加 `active_writer_run_id INTEGER`；所有 append API 强制带 `expected_writer_run_id`，事务内比对，失败返回 `WriterClaimRebound` 错误类型（不得 panic）。
- 成本 M；风险：中——需要把现有所有写路径收敛到带栅栏的 API（一次性改造）。

### F9. Automations(cron) 引擎：catch-up / backoff / watchdog / 自禁用 / 启动修复 — P0
- 源：`src/cron/service/`（41 文件）：`timer-catchup.ts`（354 行，错过槽位追赶：backoff 中的 job 把 nextRun 推迟到 backoff 结束 `:33-60`，`DEFAULT_MAX_MISSED_JOBS_PER_RESTART` 限制单次追赶量并 stagger）；`startup-run-repair.ts`（241 行，重启时把"卡在 running"的 run 修复为失败/重试）；`agent-watchdog.ts`（242 行）；`auto-disable.ts`（108 行，连续失败自动禁用）；`locked.ts`（56 行，服务级互斥）；`run-admission.ts`（queued run 预约/认领/释放/清理）；`task-ledger.ts`；store 侧 `src/cron/store/`（row-codec、quarantine、runtime-authority-store）。
- 机制：job 状态机含 `queuedAtMs/runningAtMs/nextRunAtMs` + 错误 backoff 阶梯（`DEFAULT_ERROR_BACKOFF_SCHEDULE_MS`）；每个 run 有 run-id 与预约标记，防止双触发；投递结果回写 job 状态，失败累计触发 auto-disable；全部持久化，重启可重建。
- 证据：`cron-protocol-conformance.test.ts`、`cron-state-contracts.e2e.test.ts`、`cron-delivery-outcomes.e2e.test.ts`、`active-jobs.test.ts` 等 342 个 cron 文件；`docs/automation/cron-jobs.md`。
  - 细节下钻：cron 状态**全量落共享 SQLite**（`src/cron/store.ts:1` "backed entirely by shared SQLite state"），行分三类：job family 行（配置态，带陈旧行清理 `deleteStaleCronJobFamilyRows`）、runtime authority 行（运行授权，可修复 `repairCronRuntimeAuthorityRows`）、**隔离行**——配置损坏/无法解析的 job 不丢弃也不运行，进 quarantine 等人工处理（`store/quarantine.ts`）；`assertCronStoreCanPersist` 写前断言，防把临时态写进库。调度形态三选一并持久化：`{kind:"at"}|{kind:"every",everyMs,anchorMs}|{kind:"cron",expr}`（`types.ts:14-17`）；会话目标 `main|isolated|named` 与 wake 模式 `next-heartbeat|now` 是 job 字段而非代码分支（`:49-53`）——"任务进哪个会话"是数据，不是行为。
- 价值：L2。grok-build 的"定时任务/巡检/计划 workflow"若只做 cron 表达式不够——需要追赶、去重、自愈这一整套。
- 吸收：`nofy-workflow` 内建 scheduler 或新 `nofy-cron`：`struct JobState { next_run_at, queued_at, running_at, error_backoff_until, consecutive_failures }`；启动时 `repair_stuck_runs()` + `plan_catchup(max, stagger)`。job 定义走 sqlite（对齐 F12 审计）。
- 成本 L；风险：中——先做最小核（持久 job + 单触发去重），catchup/auto-disable 迭代加。

### F10. heartbeat = 系统自有 cron 投影 + scratch 便签 — P1
- 源：`src/cron/heartbeat-monitor.ts`（79 行）：`HEARTBEAT_DECLARATION_PREFIX = "heartbeat:"` `:13`，`resolveHeartbeatMonitorSpecs` `:27+` 把 `agents.*.heartbeat` 配置**投影**成每个 agent 一个系统自有 cron job（declarationKey 幂等去重，已存在则更新不重建）；`docs/gateway/heartbeat.md`：heartbeat 是"主会话的周期性 agent turn"，节奏由 Automations 持有，配置只表达期望态；`openclaw cron scratch <jobId> --set` 给监视器存小清单；迁移由 `doctor --fix` 执行（HEARTBEAT.md → db scratch + 归档备份）。
- 机制：用户改配置 → 启动/reload 时写穿到 cron 行；运行态永不读文件。isolated session + 轻量 bootstrap 上下文可选，避免每次心跳背全量历史。
- 证据：`server-cron-heartbeat-jobs.test.ts`、`heartbeat-monitor.ts` 测试；docs 明确 "There is no separate heartbeat fallback timer"。
- 价值：L2。grok-build Leader 种子的心跳（定期自检/巡检）应复用同一调度器而不是独立定时器——"期望态配置投影到系统 job"是防双实现的好模式。
- 吸收：F9 之上加 `SystemJobProjection`：`fn reconcile(cfg_jobs, store_jobs) -> Vec<Op>`；Leader 心跳 = declarationKey `leader:heartbeat` 的 job。
- 成本 S（依赖 F9）；风险：低。

### F11. dreaming 三相记忆蒸馏 + 改写 preimage + memory-host-sdk 能力契约 — P2
- 源：`extensions/memory-core/src/`：`dreaming.ts`（1173 行）、`dreaming-phases.ts`、`dreaming-consolidation*.ts`、`rem-harness.ts`（206 行）、`rem-evidence.ts`（grounded 预览）、`short-term-promotion*.ts`、`flush-plan.ts`；`docs/concepts/dreaming.md`；接口面在 `packages/memory-host-sdk/src/runtime-core.ts`（`:1-40`：`MemoryPluginCapability`/`MemoryPluginRuntime`/`MemoryFlushPlanResolver`/`MemoryPromptSectionBuilder` 等契约导出）。
- 机制：每次 sweep 顺序跑 light（分拣暂存，不落盘）→ REM（主题/反思摘要，不落盘）→ deep（加权打分 + 三门槛 `minScore/minRecallCount/minUniqueQueries` 全过才晋升，**写前从 live daily 文件重新取片段**，过期/已删的跳过）。只有 deep 写 `MEMORY.md`；晋升条目带 `<!-- trigger: ... -->`/`<!-- importance: N -->` 注记且既有注记条目逐字节保留；**改写前把 preimage 存 SQLite 插件状态**（可回滚）；机器状态在 `memory/.dreams/`（含锁与 checkpoint）。默认开启，可配置关闭。dreaming 不是硬编码进核心，而是 memory-core 插件经 memory-host-sdk 的 capability 注册契约挂载——宿主只依赖 SDK 类型（embedding provider 同样由模型插件注册），这是其可插拔的关键。
- 证据：`dreaming.test.ts`（1763 行）；docs 的 phase 表与"reviewable/explainable"设计陈述；`extensions/memory-lancedb`/honcho/qmd 多后端证明契约有效（`src/memory-host-sdk/` 13 文件宿主适配）。
- 价值：L2。grok-build 已有全局+workspace 记忆；缺"后台把短期信号蒸馏进长期记忆"的策展环。preimage 回滚与证据 grounding 是可审计性的关键；能力契约是记忆后端可插拔的前提。
- 吸收：`nofy-memory`：先立 `trait MemoryBackend { fn search(...); fn ingest(...); fn distill(...); fn capabilities() -> MemoryCaps }` + 注册表（当前单实现也先立 trait）；distill 管线 `trait DistillPhase { fn run(&ctx) -> PhaseOutput }`（light/rem 只产信号，deep 才写）；写 MEMORY.md 前经 `nofy-sqlite-journal` 存 preimage；用 grok-build 自己的模型调用做 consolidation subagent。
- 成本 L；风险：中——蒸馏质量依赖模型；先做 deep-only 最小版（打分+门槛+preimage），REM 后补。

### F12. 审计事件存储：metadata-only + 假名化 + 保留期/行数上限 — P1
- 源：`src/audit/audit-event-store.ts`（695 行）：保留 30 天 `:42`、上限 10 万行 `:43`、批量裁剪 1024 行 `:44`；`pseudonymizeAuditIdentity` `:32-36`（身份假名化，key 每库生成 `loadOrCreateAuditIdentityKey`）；WeakMap 缓存行数避免热路径全表扫 `:45-47`；写入走独立 worker（`audit-event-writer.worker.ts`）单 DB handle。事件类型分 agent-run/inbound/outbound/tool-action 四类（`audit-event-types.ts`），**只存元数据不存内容**。
- 证据：`audit-recorder.test.ts`、`message-audit-events.test.ts`、`execution-identity-admission.test.ts`；`docs/logging.md`。
- 价值：治理。grok-build 的跨表面（TUI/Hub/ACP）动作需要统一审计；"metadata-only + 假名化 + 硬上限"是隐私默认的正确形态。
- 吸收：`nofy-telemetry` 或新 `nofy-audit`：sqlite 表 `audit_events(seq, ts, kind, actor_pseudo, session_key, tool, outcome, meta_json)`；`PRAGMA` 级 WAL + 单写线程；启动时按保留期/行数裁剪。
- 成本 M；风险：低。

### F13. system-event：操作者事件总线 + presence + wake 路由 — P2
- 源：`packages/gateway-protocol/src/schema/system-event.ts`（33 行全文）：`SystemEventParamsSchema` 含 `text/idempotencyKey/sessionKey/wake/deviceId/instanceId/host/ip/platform/lastInputSeconds/reason/tags`；presence 清除标记 `:7-9`（`system-presence-clear-last-input` + 2592000s 兼容覆写）；入队 `src/infra/system-events.ts:176`（`enqueueSystemEvent`），restart sentinel 恢复时也经它（F6 导入 `:45`）。
- 机制：任何控制面客户端可注入"操作者事件"（如"用户 30 天没输入了"的 presence 元数据），可指定精确会话路由与是否唤醒 heartbeat；事件进主会话上下文供模型感知"OS 侧发生了什么"。
- 证据：`server.models-voicewake-misc.test.ts` 等；`docs/automation/` 的 webhook/hooks 同源。
- 价值：L2/L3。grok-build 的 OS 感官轴需要一个"外部世界 → agent 上下文"的标准注入口（fsnotify 事件、CI 结果、系统电源状态都可走它）。
- 吸收：`nofy-interjection-core` 已有插话机制，扩一个 `SystemEvent { text, wake: bool, session: Option<SessionKey>, idempotency_key }`；Leader 心跳消费队列。
- 成本 S；风险：低。

---

## 三、L3 系统面（多表面协议 / 跨表面审批 / OS 感官 / 执行谱系）

### F14. 设备身份 = 公钥派生 + challenge 签名握手 — P1
- 源：`src/gateway/server/ws-connection/connect-device-proof.ts`（101 行全文）：`DEVICE_SIGNATURE_SKEW_MS = 2min` `:15`；`deriveDeviceIdFromPublicKey(pubkey) === device.id` 强制校验 `:64-68`；签名时效 `:70-74`；nonce 必填且必须等于服务端 connect 时下发的 `connectNonce` `:75-84`；payload 版本 v2/v3 协商 `:85-93`；失败一律发安全事件 + close 1008 + 结构化 error detail code。配套 `src/infra/device-identity.ts`（派生/规范化）、`connect-device-pairing.ts`（717 行配对流程）、`connect-auth.ts`（517 行，token/password/tailscale/trusted-proxy/none 五模式，`src/gateway/auth.ts:226-265` 模式完备性校验——token 模式缺 token 直接启动失败，fail-closed）。
- 机制：设备首次连接走配对审批；之后每连接用私钥对 (nonce, role, scopes, signedAt, 协议上下文) 签名，服务端用公钥验证且 deviceId 必须由公钥派生（防冒用他人设备 id）。时间偏差 ±2min 防重放。
- 证据：`server.device-pair-approve-authz.test.ts`、`server.node-pairing-rate-limit.test.ts`、`server.auth.*` 系列（含 `server.silent-scope-upgrade-reconnect.poc.test.ts`——连"静默提权重连"的 PoC 攻击都有回归测试）。
  - 细节下钻：配对请求有 1 小时 pending TTL（`src/pairing/pairing-store.ts:27` `CHANNEL_PAIRING_PENDING_TTL_MS`），过期才可重新发起（`:57`）；配对码用"生成-查重-重试"保证唯一，超限抛错而非放行重复码（`:128-134`）。关键安全设计：**批准/拒绝操作用稳定不透明的 `requestId` 而非人类可读配对码**（`:38` 注释 "approving a request without exposing its human pairing code"；`DevicePairApproveParamsSchema` 只含 `requestId`，`packages/gateway-protocol/src/schema/devices.ts:18`）——配对码只在设备屏幕上短暂展示供人确认，不进 API/日志/URL，杜绝旁路重放。设备 token 按 `(deviceId, role)` 粒度轮换/吊销（`devices.ts:35-45`），可单独撤销某角色授权而不影响设备其他授权。
- 价值：L3/治理。grok-build Hub WS 多客户端目前若只有共享 token，设备级身份（哪台设备、什么权限）是跨表面审批的前提。
- 吸收：`nofy-auth`：ed25519 设备密钥对，`device_id = sha256(pubkey)[..16]`；握手 challenge = 服务端随机 nonce；签名载荷绑定 (nonce, scopes, ts)。`struct DeviceProof { device_id, pubkey, signed_at, nonce, sig }`，验证失败分类计数（联动 F22）。
- 成本 M；风险：中——密钥存储（设备侧 keychain/文件权限）要同步设计。

### F15. nodes 能力声明：connect 时声明 caps/commands，运行时审批只能收窄 — P1
- 源：`src/gateway/node-registry.ts`（1580 行）：节点条目 `caps: string[]; commands: string[]` `:64-67`；connect 解析 `:452-463`；**运行时收窄注释 `:990`："Runtime approvals can only narrow capabilities/commands/permissions declared at connect"**，收窄实现 `:992-1003`（filter 后同步回 node 与 client.connect）；`src/gateway/node-catalog.ts`（403 行）汇总在线节点能力供工具路由；`src/node-host/`（设备侧宿主：invoke-system-run、camera/screen 命令、exec-policy）。
- 机制：设备节点（macOS/iOS/Android/headless）以 role=node 连接并声明能力集（canvas.*/camera.*/screen.record/system.run…）；之后任何会话级批准只能在声明集内做减法，永远不能加——能力上限在连接时钉死。
- 证据：`server.node-pairing-authz.test.ts`、`server.node-invoke-approval-bypass.test.ts`（绕过尝试的回归测试）、`server.node-version-mismatch.test.ts`。
- 价值：L3。grok-build 的 Computer Hub/多执行端（本机/容器/远端）需要同样的"声明上限 + 只减不增"语义，避免运行时被说服提权。
- 吸收：`nofy-computer-hub-core`：`struct NodeCaps { caps: BTreeSet<CapId>, commands: BTreeSet<CmdId> }`；会话批准存 `narrowed: NodeCaps`，校验 `narrowed ⊆ declared`。
- 成本 M；风险：低——纯不变量约束。

### F16. 跨表面审批路由：审批管理器 + 操作者存储 + APNs 推送 — P0
- 源：`src/gateway/exec-approval-manager.ts`（1245 行）：`ExecApprovalManager` `:227`，resolution source 区分 `"operator" | "auto-review"` `:78`，无路由时 `resolvedBy: "no-approval-route"` 超时即拒 `:935-943`；`src/gateway/operator-approval-store.ts`：`OperatorApprovalKind = "exec" | "plugin" | "system-agent"` `:37`，状态机 pending/allowed/denied/expired/cancelled `:38`，audience 上限 64 会话 `:31`，历史游标 `OperatorApprovalHistoryCursorError` `:159`；`src/gateway/exec-approval-ios-push.ts`：APNs 推送给已配对操作者设备，推送需 approval scope + identity-read，resolve/expire 早于推送计划完成时有竞态处理 `:360-368`。
- 机制：沙箱内 exec 请求批准 → 管理器按在线表面（TUI/Control UI/iOS 节点）选路由 → 操作者在任意表面决定 → 决定回写并广播；决定持久化（可审计、可回放），超时/无路由 = 拒绝（fail-closed）。
- 证据：`operator-approvals-client.e2e.test.ts`、`server.device-pair-approve-supersede.test.ts`、docs/refactor/operator-approvals.md（代码注释引用）。
- 价值：L3/治理。grok-build 已有 ACP/Hub，审批目前局限单表面；"审批跟着操作者走"是 OS-level agent 的核心治理面。
- 吸收：`nofy-tools-api` 定义 `ApprovalRequest { id, kind, payload_hash, audience, expires_at }`；`nofy-agent-lifecycle` 持有 pending 表 + 表面路由（先 TUI+Hub WS 广播，后推移动端）；无路由=拒绝写进默认策略。
- 成本 L；风险：中——批准决定的幂等与 supersede 语义（同一请求二次决定）要测试覆盖。

### F17. steering 注入点：循环检查点 + 工具批边界 + 转录提交等待 — P0
- 源：`packages/agent-core/src/agent-loop.ts`：`getSteeringAtCheckpoint` `:73-82`；`STEERING_TOOL_SKIP_MESSAGE = "Skipped due to queued user message."` `:71`（用户插队后跳过剩余工具）；`TOOL_LOOP_RECOVERY_TERMINATED_MESSAGE` `:69-70`；循环开始先取 steering `:310-311`，工具批结束后取 `:420`、`:783-786`、`:849-850`，turn 结束前还有 follow-up 通道 `:507-512`（与 steering 同路径保事件顺序）；gateway 侧 `src/gateway/server-methods/chat-send-message-injection.ts:30-70`：`steeringMode: "all"`、`waitForTranscriptCommit: true`（注入前等转录落盘）、debounce 合流 `:47-53`。
- 机制：用户新消息不打断当前 LLM 流，而是在下一个检查点作为 steering 注入；未执行的工具批标记 skip；注入必须等转录提交，保证"插队消息"与转录顺序一致、崩溃可恢复。
- 证据：`agent-loop.test.ts`、`server.sessions-send.direct-announce.test-support.ts` 等；`docs/concepts/agent-loop.md`。
- 价值：L3/工程。grok-build 已有 interjection-core，但"检查点语义 + 工具批 skip + 等转录提交"这套完整语义可直接对齐，解决 TUI 插队与 Hub 插队的一致性。
- 吸收：`nofy-interjection-core` + `nofy-agent`：`trait SteeringSource { fn drain(&self) -> Vec<Msg> }` 在 loop 的固定 checkpoint 调用；工具执行器收到非空 steering 时对未启动工具回 skip 结果。
- 成本 M；风险：中——检查点位置决定延迟/一致性权衡，需要属性测试。

### F18. turn-interruption：可恢复转录的中断语义 — P1
- 源：`packages/agent-core/src/turn-interruption.ts`（88 行全文）：`createFailureMessage` `:5-28`（空 aborted/error assistant 消息，带 stopReason 与 errorMessage，usage 归零）；`INTERRUPTED_TURN_GUIDANCE` `:32-35`（告诉下一轮"上一轮被中断，后台进程可能还活着，工具可能部分执行"）；`isTurnHandoffAbort` `:42-52`（yield 类工具主动交接的 abort 带 `turnHandoff: true`，跳过中断提示——干净停止不撒谎）；`appendInterruptedTurnMessage` `:65-72`（以 `custom` 角色 `openclaw:turn-aborted` 持久化，display:false）；`normalizeCoreContextMessages` `:74+`（喂模型前把 custom 中断消息规范化为 user 消息）。
- 机制：任何中断（abort/crash/重启）都在转录留下结构化痕迹：失败占位消息 + 中断指导消息；转录保持"可续接"（配合 agent-loop 的 `removeNonExecutableToolCalls`/`TranscriptNotContinuableError`）。
- 证据：`translator.replay.test.ts`、`qa/scenarios/jsonl-replay/recovery-partial-session.jsonl`；`docs/concepts/agent-loop.md`。
- 价值：L1/工程。grok-build 崩溃/Esc 中断后的转录目前可能留下悬空 tool_call；这套"中断也要续接"的契约是 replay/恢复的地基。
- 吸收：`nofy-agent` 循环出口统一走 `finalize_interrupted_turn()`：写占位 assistant(stop_reason=Aborted) + 内部指导消息；`nofy-session-journal` 加载时校验可续接性（悬空 tool_call 修复/剥离）。
- 成本 M；风险：低。

### F19. 副作用方法幂等键 + 原子准入 — P0
- 源：`packages/gateway-protocol/src/schema/agent.ts`：`idempotencyKey: NonEmptyString` 出现在 chat.send 等 4 处（`:116,149,277,344`）；`src/gateway/server-methods/chat-send-session.ts:40`（`clientRunId = p.idempotencyKey`）；`chat-send-handler.ts:190-197` 注释："A matching idempotency row and lifecycle claim commit atomically, so retries adopt the durable turn without submitting it twice"；出站侧 `chat-abort-runtime.ts:82`（`${runId}:assistant` 作幂等键防重复 assistant 投递）、`chat-transcript-persistence.ts:85-93`（按 idempotencyKey 查重放）。
- 机制：客户端生成幂等键 → 服务端把"幂等行 + run 准入"放进同一 sqlite 事务 → 网络重试/崩溃重发命中已有行时**认领**而非新建；出站消息同样带幂等键防双发。
- 证据：`server.sessions-send.test.ts`、restart-recovery 场景夹具（F6）。
  - 细节下钻：agent 运行侧的幂等是**两阶段预留生命周期**（`src/gateway/agent-turn/agent-dedupe-lifecycle.ts:26-60`）：请求先以 `reservationId`（randomUUID）写入 pending 条目并带 `pendingTimeoutMs`，真正被接受后升级为 `status:"accepted"` 并记录 `ownerConnId/ownerDeviceId`（哪个连接/设备拥有这次运行）；条目 TTL 10min（`agent-turn/agent-job.ts:33`）。这解决"客户端在 run 被接受前断线重发"——第二次请求看到 pending 预留而非重复触发。还有第三态**预注册即被中止**（`agent-turn/agent-dedupe.ts:51-63`）：run 登记前就被 abort 时条目记 `status:"timeout"+stopReason`，后续同会话的合法新请求经 runId/sessionKey 归属校验后不被死预留挡住（`:65-95`）。审批续接另挂第二把键 `agent:exec-approval-followup:<approvalId>`（`:10-13`），steer 注入有独立 `sessions.steer:<key>` dedupe（`server-methods/sessions-messaging.ts:61`）。
- 价值：L3/治理。grok-build Hub RPC 的副作用方法（run/abort/approve/send）目前缺幂等语义；与 F6/F8 联动后才构成完整"至少一次投递 + 恰好一次效果"。
- 吸收：`nofy-chat-state`/Hub server：所有副作用 RPC 参数加 `idempotency_key: String`；`rpc_claims(key, run_id, created_at)` 表，事务内 upsert；响应缓存最近结果。
- 成本 M；风险：低——增量加字段，旧客户端缺省给 UUID 即可。

---

## 四、治理（审批 / 策略正交 / fail-closed / 隐私默认）

### F20. sandbox × tool-policy × elevated 三正交 + explain 诊断 + group 简写 — P0
- 源：`docs/gateway/sandbox-vs-tool-policy-vs-elevated.md`（154 行全文）：三控制定义 `:9-14`（sandbox 决定**在哪跑**、tool policy 决定**哪些工具可用**、elevated 是 exec-only 的逃逸阀）；"deny always wins / allow 非空即白名单" `:68-70`；**工具组表 `:79-108**（group:runtime/fs/sessions/memory/web/ui/automation/messaging/nodes/agents/media/openclaw/plugins）；elevated 门槛 `:119-132`（enabled + per-channel allowFrom，且明确 elevated 不授予工具、不覆盖 allow/deny）；`openclaw sandbox explain [--session|--agent|--json]` `:17-30` 打印生效策略与"fix-it key paths"。
- 机制：三个维度各自独立配置、独立审计（`agents/tool-policy` 日志记录每条被移除工具与规则标签）；调试命令直接告诉你该改哪个配置键。文档明确警示"tool policy 按名字过滤，不看 exec 内部副作用"——边界诚实。
- 证据：docs 与 `server.tools-effective.global-agent-gateway.test.ts`、`server.tools-catalog.test.ts`；sandbox bind 双次校验（`:48-52`：规范化路径 + 最深存在祖先解析后再查，防 symlink 父目录逃逸）。
- 价值：治理。grok-build 已有 Landlock/bwrap 沙箱与工具系统，但"沙箱/工具策略/提权"三维目前耦合；正交化 + explain 命令是运维可解释性的关键。
- 吸收：`nofy-sandbox` + `nofy-tools`：定义 `SandboxPolicy{mode, workspace_access}`、`ToolPolicy{profile, allow, deny, by_provider}`、`ElevatedGate{enabled, allow_from}` 三个独立结构，合成函数 `effective_tool_surface(session)`；`nofy` CLI 加 `sandbox explain`。工具组枚举照抄（按 grok-build 工具集裁剪）。
- 成本 M；风险：中——策略合成顺序必须单测钉死（deny>wins 等不变量）。

### F21. exec-approvals：fail-closed 存储 + 本地 socket 协议 + 命令解析 — P0
- 源：`src/infra/exec-approvals-store.ts`（348 行）：SQLite 状态不可用/行畸形 → **拒绝宿主执行**（`createFailClosedExecApprovalsFallback`、`warnFailClosed("...denying host execution")` `:62-76`）；警告 60s 节流 `:49-59`；迁移闸门 `assertNoPendingLegacyExecApprovals`（旧文件策略未迁移完不放行）。`src/infra/exec-approvals-socket.ts`（35 行全文）：沙箱内进程经 unix socket 发 `{type:"request", token, id, request}` JSONL，15s 超时，回 `{type:"decision"}`——socket path + token 双要素。`src/infra/exec-approvals-analysis.ts` + `exec-approvals-safe-bins.test.ts`（672 行测试）：argv 分词、shell 链操作符分析、Windows shell 安全重建、allowlist 匹配与哈希化 arg pattern。
- 机制：策略状态（allow-always 列表、safe bins、每 agent 策略）全在 sqlite 带 fenced mutation（`ExecApprovalsMutationFencedError`）；沙箱与宿主之间只有一条窄 socket 协议；命令在批准前被结构化解析（不是字符串匹配）。
- 证据：`exec-approvals-parity.test.ts`、`state-migrations.exec-approvals.test.ts`、safe-bins 672 行测试。
- 价值：治理。grok-build 沙箱内 shell 提权目前依赖 Landlock 边界；"fail-closed 策略存储 + 结构化命令解析 + 窄协议"能补上审批环。
- 吸收：`nofy-sandbox`：策略表入 `nofy-sqlite-journal`（读取失败=拒绝执行，日志节流）；沙箱内 `exec` 请求走 unix socket（token 从环境变量注入，权限 0600）；命令解析用 shell-words 式 argv 分析 + 白名单 bin 哈希。
- 成本 L；风险：高——审批环是安全关键路径；先做 fail-closed 存储与 allow-always，socket 协议二期。

### F22. pre-auth 硬化：每 IP 连接预算 + 未授权洪水守卫 + 速率限制 — P1
- 源：`src/gateway/server/preauth-connection-budget.ts`（68 行）：默认每 IP 32 条未认证 WS `:8`，未知 IP 归一桶 `:9`，acquire/release 配额 `:29-32`；`src/gateway/server/ws-connection/unauthorized-flood-guard.ts`（77 行）：单连接未授权角色错误 >10 次关连接、每 100 次才打一条日志 `:21-22`；另有 `src/gateway/auth-rate-limit.ts`、`handshake-auth-log-limiter.ts`（认证失败日志限流防日志炸弹）。
- 机制：三层漏斗——连接建立前（IP 预算）→ 握手期（认证失败速率限制）→ 连接内（洪水守卫），全部默认开启，无需配置。
- 证据：`server.preauth-hardening.test.ts`、`server.preauth-bootstrap-token-rate-limit.test.ts`、`unauthorized-flood-guard.test.ts`。
- 价值：治理/L1。grok-build serve/Hub 暴露端口后的第一道防线；成本极低。
- 吸收：`nofy-http`/Hub server：`PreauthBudget { per_ip: HashMap<IpAddr, u32> }` + 每连接失败计数器；认证失败结构化日志带限流。
- 成本 S；风险：低（注意 trusted-proxy 下 IP 未知的保守处理，照抄其 unknown-bucket）。

### F23. 供应链门禁：minimumReleaseAge + ClawHub trust verdict（fail-closed）— P1
- 源：`pnpm-workspace.yaml:8`（`minimumReleaseAge: 2880` 分钟 = 发布满 48h 的依赖才允许安装，`:10-22` 显式豁免清单）；`src/infra/clawhub-install-trust.ts`（937 行）：错误码 `:19-23`（`clawhub_security_unavailable`/`risk_acknowledgement_required`/`download_blocked`）——**安全服务不可达时安装直接失败（fail-closed）**；trust disposition 四档 `:36-44`（clean/review-recommended/review-required/blocked）+ scan status/moderation state/pending/stale 全记录进安装 record；风险确认分 "confirm" 与 "type-package"（键入包名）两档 `:30`。
- 机制：新发布包有 48h 隔离期（防发布即投毒的窗口期）；市场安装逐包拉安全裁决，裁决不可得 = 不安装；每次安装把 trust 证据写进本地索引（可审计）。
- 证据：`clawhub-trust-error-details.ts`（协议层错误细节）、`src/plugins/clawhub.ts:1306-1320`（trust 失败短路）、skills/clawhub 文档。
- 价值：生态/治理。grok-build 的 plugin-marketplace 若开放第三方，发布龄闸门 + 裁决 fail-closed 是低成本高回报的防线。
- 吸收：`nofy-plugin-marketplace`：安装记录结构加 `trust: { disposition, checked_at, reasons }`；索引源元数据带 `published_at`，`min_release_age: Duration` 配置（默认 48h）；裁决服务不可达时默认拒绝 + `--acknowledge-risk` 显式绕过。
- 成本 M；风险：低——策略保守，误伤用豁免清单解决。

### F33. 配置写 CAS：锁时 baseHash 比对 + applied-hash 发布 — P1
- 源：`src/gateway/server-methods/config-write-flow.ts:281-330`（`commitGatewayConfigWrite`）、`src/gateway/applied-config-hash-publisher.ts`（27 行）、`src/gateway/config-reload-plan.ts`/`config-reload-recovery.ts`（热加载与回滚）。
- 机制：`config.patch` RPC 携带 baseHash，但**早期 RPC 层的 hash 检查只是建议性的**，真正的 CAS 发生在持有写锁之后——注释明说："The early RPC hash check is only advisory until this lock-time CAS. Without it, concurrent writers can both succeed and overwrite each other's config."（`:296-299`）。写后返回 persistedHash（重读文件计算，与后续 config.get 所见完全一致）供写方 ack；断连共享密钥客户端、刷新 generation 等副作用**延迟到 RPC 响应之后**执行（`queueFollowUp`，`:318-326`），保证写方先收到成功再被断开。`applied-config-hash-publisher` 持续发布"当前已生效配置"的 hash，客户端可判断自己是否落后于生效态。
- 证据：`config-write-flow.test.ts`、`server.config-patch.test.ts`；qa 场景 `gateway-rpc-account-health.yaml` 的 successCriteria 明写 "A real CAS config.patch … applies the new runtime revision"。
- 价值：治理/L2。grok-build 全局配置将被多表面（TUI/Hub/ACP/文件 watcher）并发写；无 CAS 时两个写者会互覆盖且都认为自己成功。
- 吸收：`nofy-config` 写 API 加 `base_hash: Option<ConfigHash>`；文件锁内读-比-写；返回 persisted hash；watcher 与 RPC 共用同一写入口。
- 成本 S；风险：低。

---

## 五、模型运营（generations / fallback / catalog）

### F24. generations：每 agent 一份原子模型运行时快照 + lease/retention 生命周期 — P1
- 源：`src/agents/prepared-model-runtime.owner.ts`（618 行）：`createPreparedModelRuntimeOwner` `:53-64`（`generation: 0, needsRefresh: true`，owner 带 `environmentFingerprint` 与 provenance）；`PreparedModelRuntimeOwnerRetention` `:68-100`（run 级 owner 在 lease 归零后延迟回收，配置发布级 owner 不属于 retention 层）；错误类型 `PreparedModelRuntimePublicationSupersededError`/`OwnerNotPublishedError`；`docs/agent-runtime-architecture.md:54-56`："Gateway startup and config, plugin, or auth publication build one prepared model runtime generation per configured agent… A failed or stale generation is never served alongside a newer partial generation; the lifecycle owner must publish a complete replacement first."
- 机制：配置/插件/auth 变更时**整代重建**（auth 模板 + 模型注册表 + 投影目录 = 一个原子快照），运行从快照 fork 可变状态（lease 引用计数）；失败/过期的代永不与新版混发——要么完整替换，要么继续用旧代。auth profile 轮换在代内进行（`auth-profiles/runtime-snapshots.ts`，567 行）。
- 证据：`prepared-model-runtime.facts.ts`、`server-shared-auth-generation.test.ts`、`ws-shared-generation.test.ts`（WS 层也按 generation 对齐）。
  - 细节下钻：替换是**受控交接**而非覆盖：同一 agent 的并发构建经 completion chain（`prepared-model-runtime.ts:67` `agentBuildCompletions` Map）串行化，第二次构建排在第一次之后；旧 owner 仍被在途 run 引用时由 retention LRU 保留（直接运行 LRU=1、gateway 运行 LRU=8，`:69-70`），引用释放才回收；构建超时 120s 只用于检测挂死构建（`:57-63` 注释 "overlap safety comes from the completion chain, and a timeout here is fatal to gateway startup"）。config/auth 变更触发的刷新经 `pendingAuthMutations` 队列合并（`:74`），一次多键轮换不触发 N 次重建。独立嵌入式运行时（无 gateway）在激活边界发布同形状快照（`standaloneActivationTails`，`:68`）——"无 gateway 也有 generation 纪律"。快照身份由 config/env/workspace 的 hash 指纹决定，同身份共享实例（`prepared-model-runtime.inbound-registry.ts:8-15`）。
- 价值：模型运营。grok-build 配置热加载时"半新半旧"的模型/auth 状态是真实 bug 源；generation 原子发布语义一劳永逸。
- 吸收：`nofy-models`：`struct ModelRuntimeGeneration { id: u64, fingerprint: ConfigHash, catalog: Arc<ModelCatalog>, auth: Arc<AuthSnapshot> }`；`GenerationOwner { publish(new) -> Result<(), Superseded>, lease() -> Arc<Generation> }`。配置 watcher 触发整代构建，运行持有 Arc。
- 成本 M；风险：低——Rust 的 Arc swap 天然适合这个模式。

### F30. failover 阶梯：失败原因分类学 + profile 轮换 → 模型回退两级升级 — P0
- 源：`packages/gateway-protocol/src/failover-reasons.ts:1-18`（`FAILOVER_REASONS` 16 类：auth/auth_permanent/format/rate_limit/overloaded/billing/server_error/timeout/tls_certificate/context_overflow/model_not_found/session_expired/empty_response/no_error_details/unclassified/unknown——进协议层供客户端展示）；`src/agents/embedded-agent-runner/run/assistant-failover.ts:36`（`retryKind: profile_rotation|same_model_idle_timeout|same_model_rate_limit`）、`:97`（决策三态 `rotate_profile|fallback_model|surface_error`）、`:172`（overload 轮换上限后 "escalating to model fallback"）、`:196`（RPM 分钟窗口无代价恢复）、`:221`（无可用 profile 时给可操作指引）、`:230-231`（失败标记非阻塞）。
- 机制：失败先分类（16 类枚举），再走**有上限的两级阶梯**：同模型内轮换 auth profile（多 key）→ 达上限才升级到模型回退（fallbacks 链）→ 都不行才 surface_error。用户钉选的模型选择不降级（docs/concepts/models.md）。
- 证据：`assistant-failover.ts` 395 行；`model.configured-fallback.ts`（232 行，fallback 的 transport/compat 解析）；`models-list-result.provider-outcomes.test.ts`。
- 价值：模型运营。grok-build 有模型类别表与 circuit-breaker 底座，但无"先换 key 再换模型"的阶梯与统一失败分类学；16 类原因枚举是最低成本的高可用 + 可观测。
- 吸收：`nofy-models` 增 `enum FailoverReason`（照抄 16 类）+ `struct FallbackChain { profiles: Vec<AuthProfileRef>, models: Vec<ModelRef> }`；决策器纯函数 `decide(failure, state) -> RotateProfile|FallbackModel|SurfaceError`，接 `nofy-circuit-breaker`。
- 成本 M；风险：中——错误分类需逐 provider 适配（先做 openai-completions 一类）。

---

## 六、生态（plugin / skill / hooks 桥）

### F25. 插件发现：manifest 声明 + 构建产物隔离区 + Docker build-arg 子集抽取 — P2
- 源：`src/plugins/discovery.ts`（1627 行）：扫描 bundled/workspace/全局/npm/bundle 根，manifest 为 `openclaw.plugin.json` 或 package.json `openclaw` 字段；`src/plugins/install-managed-npm-state.ts:30`（`_openclaw-quarantined-npm-projects` 隔离目录，`:489` `quarantineManagedNpmProjectRebuildArtifacts`——重建产物可疑时整体隔离而非带病运行）；`satisfiesPluginApiRange` 版本兼容 + doctor 诊断链。
- 机制：发现（静态 manifest，gateway 启动可不加载运行时代码）与激活（运行时 register）分离；安装产物异常进隔离区等待修复。
- 证据：`plugin-activation-boundary.test.ts`、`server-startup-plugin-quarantine.test.ts`、release-openclaw-plugin-testing skill（发布前插件验证清单）。
- 价值：生态。grok-build hooks/plugins 体系（nofy-hooks、plugin-marketplace）可借鉴"发现与激活分离 + 产物隔离区"。
- 吸收：`nofy-hooks`：manifest 发现保持纯 JSON 解析；安装/构建失败的插件移入 `<state>/quarantine/<name>-<ver>` 并记录原因，doctor 可列出。
- 成本 S；风险：低。
- 子项（Docker build-arg 插件子集抽取，原 F26）：`scripts/lib/docker-plugin-selection.mjs`（83 行，`PLUGIN_ID_RE` 严格校验 id `:5`，按 manifest id 或目录名匹配 `:35-50`，只拷所选插件的 package.json/manifest 以保层缓存）；`Dockerfile:11,31,49`（`ARG OPENCLAW_EXTENSIONS=""` → 构建期运行选择脚本 → `:179` prune 未选插件的 dist）。镜像按需携带插件子集：选择发生在依赖安装之前（manifest 先行），未选插件的构建产物显式剪掉。证据：`docker-setup.e2e.test.ts`、`dockerfile.test.ts`。grok-build 落点：发布流水线层 `--features` 组合矩阵 + Dockerfile ARG 映射（无需进 crate 代码）。成本 S。

---

## 七、工程可信（replay e2e / 协议 codegen / 预算棘轮）

### F27. schema-first 协议 codegen 链 + 版本协商 + 漂移门禁 — P1
- 源：`packages/gateway-protocol/src/schema/`（TypeBox schema 单一事实源）；`scripts/protocol-gen.ts`（`:35-70`：导出 `protocol.schema.json`，含帧 discriminator + **每个方法的 since/scope 元数据**）；`scripts/protocol-gen-swift.ts`（876 行：从 ProtocolSchemas 直接生成 `apps/shared/OpenClawKit/Sources/OpenClawProtocol/GatewayModels.swift`，`--check` 模式在 CI 检测漂移 `:28`）；`packages/gateway-protocol/src/version.ts`（`PROTOCOL_VERSION=4`、`MIN_CLIENT_PROTOCOL_VERSION=4`、`MIN_NODE_PROTOCOL_VERSION=3`——客户端/节点/探针三档最低版本）。
- 机制：TS schema → JSON Schema（对外文档/校验）→ Swift 模型（原生端）三端同源；协议版本分角色设最低线，允许节点慢一拍升级；`check-protocol-since.mts`/`check-protocol-event-coverage.mjs` 在 CI 守方法元数据完整性。
- 证据：`native-protocol-levels.guard.test.ts`、`protocol-schema.test.ts`、`server.rpc-wire-contracts.test.ts`。
  - 细节下钻：schema 严格度是**分层的**——方法参数用 `closedObject`（`additionalProperties:false`，`schema/closed-object.ts`）严格拒绝未知字段，防客户端多发字段被静默忽略；但**帧信封**用轻量 guard（`frame-guards.ts:33-40` 注释 "validate dispatch-critical envelope fields without compiling the full schemas or rejecting additive payload fields"），对载荷新增字段宽容。即"信封宽松演进、参数严格闭合"：协议加字段不破坏旧客户端，参数又不漂移。运行时每方法入参在 dispatch 前过 TypeBox 编译校验（`validator-registry.ts`）。`since` 用发布列车号（如 `"<=2026.7"`，`core-descriptors.ts:39`）而非 semver，对齐其日期版本制；方法描述符总表（`core-descriptors.ts:37-40`）把 name/family/scope/since/advertise/startup/write-policy 收在一处，列表/鉴权/启动可用性/写限流全从表派生——这是防"方法注册四处漂移"的结构性手段，比 codegen 本身更值得抄。
- 价值：工程/L3。grok-build 的 Hub WS/ACP 协议若扩多语言客户端，schema-first + codegen + 版本档位是防漂移的唯一 scalable 路径。
- 吸收：`nofy-proto-build` 已有 codegen 基建；把 Hub 协议收敛到一份 schema（JSON Schema 或 prost），生成 TS/Swift 客户端模型 + Rust 类型；CI 加 `--check` 漂移门禁。协议版本号分 client/node 两档。
- 成本 M；风险：低——先做单语言内"类型与校验同源"，跨语言 codegen 二期。

### F28. 预算棘轮：max-lines ratchet + 环境变量预算 + knip 死代码 — P1
- 源：`config/max-lines-baseline.txt`（952 行豁免清单，头注释 `:1-4`："Ratchet: this list may only shrink. Split files; never add entries."）；`scripts/check-max-lines-ratchet.mts`（`:7,12,81`：只许删不许增的 CI 检查）；`.oxlintrc.json:296,318,340,364,370`（max-lines 按目录分层 700/800/950/1000，skipBlankLines/skipComments）；`config/env-var-count-budget.txt`（"Distinct OPENCLAW_* names… Ratchet: lower this number… never raise it." 当前 502）；`config/knip.*.json` 三份死导出检查配置。
- 机制：对已知技术债不做一次性清偿，而是**冻结现状、只减不增**：新代码必须低于行数预算，旧文件豁免清单单调收缩；环境变量总数也是预算。
- 证据：`scripts/check-changed.mts:611-612` 把 ratchet 挂进 changed-files 门禁；清单本身即证据。
- 价值：工程。grok-build 演进期防"god file 回潮"的最便宜制度；比 code review 口号可执行。
- 吸收：CI 脚本（bash/rust 皆可）：`xtask check-lines --budget 700 --baseline config/max-lines-baseline.txt`，baseline 文件进 git 且 PR 中只允许删除行；顺带给 `nofy-env` 的环境变量清单做预算。
- 成本 S；风险：低（初期豁免清单会很长，属预期）。

### F29. 会话谱系表：session_nodes × session_windows 链式代际 + 内容来源标记 — P1
- 源：`src/state/openclaw-agent-schema.sql`：`session_nodes` `:15-40`（会话节点：`status CHECK (running/done/failed/killed/timeout)`、`created_via CHECK (operator/spawn/channel/cron/talk/run/plugin/internal)`、`created_actor_type CHECK (human/agent/system)`、谱系列 `parent_session_key/spawned_by/fork_source_session_key/fork_source_session_id/fork_source_entry_id`）；`session_windows` `:95-125`（转录窗口/代际：`previous_session_id` 链 + `reason CHECK (initial/reset/rollover/fork/rewind/switch/recovery/compaction)`、`session_scope (conversation/shared-main/group/channel)`、`session_entry_provenance`、`acp_owned`、`plugin_owner_id`、**`hook_external_content_source CHECK (gmail/webhook)`**、model/harness/channel 快照列）；`transcript_events` `:317-324`（`(session_id, seq)` 复合主键，外键挂 window，级联删除）；`transcript_rewrite_watermarks` `:326-331`（改写水位 + generation 标记）。
- 机制：会话（node）与转录代（window）分离：reset/compaction/fork 不销毁历史，而是开新 window 并以 `previous_session_id` 串链，`reason` 说明每一代为什么诞生；每个 window 冻结诞生时的模型/harness/渠道上下文。外部内容（gmail hook、webhook）注入的转录带 `hook_external_content_source` 标记——为提示注入防御与审计提供内容出处。
- 证据：schema CHECK 约束本身即契约；`openclaw-agent-db-session-provenance.ts`、`openclaw-agent-db-session-nodes-migration.ts`、`server.sessions.reset-hooks.succession.test.ts` 等围绕它的迁移与测试。
- 价值：L3（执行世界谱系）/治理。grok-build 的 workflow/subagent/compaction 目前缺少"谁生了谁、为什么重开、当时用什么模型"的持久谱系；这是 replay 与审计的骨架。外部内容来源标记对 OS 感官轴（外部事件进上下文）尤其重要。
- 吸收：`nofy-session-journal`：拆 `sessions`（节点+谱系列）与 `session_windows`（代际+reason 枚举+模型快照）两表；转录表主键 `(session_id, seq)`；外部来源注入一律带 `external_source` 列。Rust 侧 reason/provenance 用 `#[non_exhaustive] enum` + sqlite CHECK 双保险。
- 成本 M；风险：中——需要现有 session 存储迁移（可增量：先加 window 表，旧数据挂 initial 代）。

### F31. 策展回放夹具 + ACP 事件账本（replay/rehydration）— P2
- 源：`qa/scenarios/`（index.yaml + 分主题 YAML 场景库，`qa/README.md`：qa suite/qa manual/qa coverage 三工作流）；`qa/scenarios/jsonl-replay/`（7 个策展 JSONL：gateway-restart-recovery、approval-denial-retry、plan-mode-boundaries、recovery-partial-session、repo-triage-tool-loop、workspace-edit-loop、plugin-lifecycle-searchable-tools——每条是 role/content 的最小对话账本，如 "record the marker RESTART-RECOVERY-A … confirm no duplicate marker was sent"）；`src/acp/event-ledger.ts`（SQLite 事件账本：`session_id/session_key/cwd/complete/next_seq` 行 `:36-44`，事件按 seq 追加，`AcpEventLedgerReplay` 类型支持会话 rehydration `:14-17`，另有内存实现 `event-ledger.memory.ts` 供测试）。
- 机制：e2e 不追求全真环境，而是把关键故障路径固化成可回放的最小转录/场景；ACP 侧所有会话更新进 seq 账本，客户端断线后按 seq 重放恢复。
- 证据：`acp/event-ledger.test.ts`、`translator.replay.test.ts`、qa-lab 扩展消费这些夹具。
- 价值：工程。grok-build 的 crash-handler/恢复/审批拒绝重试等路径需要"转录级回归"；seq 账本让 ACP 断线重连有确定性恢复。
- 吸收：`nofy-acp-lib`：事件账本表 `(session_id, seq, event_json)` + `replay(from_seq)`；测试基建加 JSONL 夹具目录（`tests/replays/*.jsonl`），每个夹具 = 输入转录 + 期望不变量（无重复 marker 等）。
- 成本 M；风险：低。

---

## 八、关键流程走查（机制深挖）

### W1. 设备连接握手（F14/F22 的时序）
1. TCP/WS 建立 → `PreauthConnectionBudget.acquire(clientIp)`（每 IP 32 配额，未知 IP 入统一桶；`preauth-connection-budget.ts:29-32`）。超额直接拒绝升级。
2. 首帧必须为 `connect`（协议规定）。服务端下发 nonce（`connectNonce`，message-handler 持有）。
3. 鉴权模式解析（`auth.ts:483-591`）：token/password/tailscale/trusted-proxy/none 五选一；`validateResolvedGatewayAuth`（`:226-265`）在启动期就拒绝残缺配置（fail-closed，不给运行期惊喜）。
4. 设备证明（`connect-device-proof.ts`）：`deviceId === deriveDeviceIdFromPublicKey(publicKey)` → `|now - signedAt| ≤ 2min` → nonce 非空且等于服务端 nonce → 按 (role, scopes, signedAt, nonce) 重建 v2/v3 签名载荷并验签。任一失败：发安全事件（`emitGatewayAuthSecurityEvent`，含 severity/authMethod/reason）+ 结构化 error detail + close 1008。
5. 连接内守卫：未授权角色重试 >10 次 → 关连接；日志每 100 次一条（`unauthorized-flood-guard.ts:21-22`）。
- 要点：**身份（公钥派生）、新鲜度（nonce+skew）、授权（scopes 进签名载荷）三者绑死在一个签名里**，scope 提升必须重新签名——这就是 `server.silent-scope-upgrade-reconnect.poc.test.ts` 守护的不变量。

### W2. 崩溃恢复：一次 chat turn 的完整生命周期（F6/F19/F8 联动）
1. `chat.send` 携带 `idempotencyKey`（协议 schema 强制非空，`schema/agent.ts:116`）；服务端 `clientRunId = idempotencyKey`（`chat-send-session.ts:40`）。
2. restart-safe 准入：幂等行 + run 生命周期声明在**同一 sqlite 事务**提交（`chat-send-handler.ts:190-197`）；提交成功才算"持久准入"，否则抛 "chat turn was not durably admitted"。
3. run 在会话条目声明 `activeWriterRunId`（`session-bootstrap.ts:335`）；此后所有转录写入带 `expectedWriterRunId` 栅栏（F8）。
4. 进程崩溃/重启。sentinel 启动时读 `RestartSentinelPayload`（`server-restart-sentinel.ts`）：恢复 pending 续体、`recoverPendingSessionDeliveries` 重领出站队列（租约未过期者不得死信，`delivery-queue-storage.ts:153`）。
5. 客户端重试同一 `idempotencyKey`：命中已有幂等行 → **认领**既有 run 而非新建（`restartRecoveryDeliveryRunId` 比对，`chat-send-handler.ts:196-200`）；若生命周期代数已变（`lifecycleGeneration` 变化），旧 run 被 abort 并标记 `abortStopReason: "restart"`，准入按 `retryable` 终态化。
6. 出站投递恢复时校验"通道权威"（`restart-recovery-state.ts:21-40`）：只有 source run id + delivery context 完整的 channel 入口才允许代发，防止恢复消息进错会话。
- 要点：幂等（不重复提交）× 栅栏（不覆盖新转录）× 权威（不投递错目标）三约束缺一不可。

### W3. cron 启动追赶（F9 的决策链）
1. 启动修复：`startup-run-repair.ts` 把上次进程遗留的 `runningAtMs` run 结算为失败/可重试（不悬挂）。
2. 追赶规划：`timer-catchup.ts` 收集 `hasMissedCronSlotSinceLastRun` 的 job；backoff 中的 job 不立即跑，把 `nextRunAtMs` 推到 backoff 结束（`:33-60`）；单次重启最多追 `DEFAULT_MAX_MISSED_JOBS_PER_RESTART` 个，间隔 `DEFAULT_MISSED_JOB_STAGGER_MS` 错峰，避免"宕机 8 小时后启动瞬间百 job 齐发"。
3. 准入：`run-admission.ts` 对 queued run 做 reserve→execute→release；标记防止 catchup 与正常触发双跑。
4. 运行期：`agent-watchdog.ts` 看门超时 run；`timeout-policy.ts` 结算超时；失败累计进 `auto-disable.ts` 的禁用判定；`task-ledger.ts` 记录 run 台账供审计。
5. 全程持 `locked.ts` 服务互斥；状态经 `store.ts` 的 `persistOrRestore`（写失败回滚快照）持久化。
- 要点：**追赶是计划行为而非补偿事务**——先规划（谁跑、何时跑、跑多少），再准入，再执行；每个阶段都有持久化标记。

### W4. 一次沙箱 exec 的审批路径（F20/F21/F16 的合成）
1. 工具面合成：`sandbox.mode`（在哪跑）→ `tools.allow/deny + profile + byProvider`（哪些工具存在；deny 恒胜）→ 沙箱内再叠加 `tools.sandbox.tools.*` 第二道 allow 门（docs `:59-111`）。exec 被 deny 时后续全不发生。
2. 沙箱内 agent 发起 exec：命令先被结构化解析（argv 分词、shell 链操作符、Windows shell 安全重建，`exec-approvals-analysis.ts`）；匹配 allow-always/safe-bins 白名单（哈希化 arg pattern）则直接放行。
3. 未命中 → 经 unix socket 发审批请求（`exec-approvals-socket.ts`：token + uuid + request，15s 超时）；策略存储读取失败/畸形 = 拒绝（fail-closed，`exec-approvals-store.ts:62-76`）。
4. gateway 侧 `ExecApprovalManager` 选路由：在线操作者表面（TUI/Control UI/iOS APNs 推送）；`no-approval-route` → 超时拒绝（`exec-approval-manager.ts:935-943`）。
5. 操作者决定（allow/deny + 可选 allow-always）→ 持久化到 `operator-approval-store`（状态机 pending/allowed/denied/expired/cancelled）→ 决定经 socket 回沙箱 → 审计事件落 `audit_events`（F12）。
6. elevated 是独立旁路：仅影响 exec 目标（沙箱→宿主），不授予工具、不覆盖 allow/deny（docs `:119-132`）。
- 要点：每一层的拒绝都是默认态；放行需要显式证据（白名单命中/操作者决定），且全链路有审计。

---

## 九、不吸收清单 + 理由

1. **`src/gateway/` 巨型模块（顶层 927 个条目 / 子树 1615 文件）与 `server-methods.ts` 中央分发器**：虽然已拆出数百个 `server-*.ts`，但方法注册、鉴权、分发仍向中心收拢，导致 `server.*.test.ts` 达数百个、跨切面改动（如 restart sentinel）要 import 十个子系统。grok-build 应保持 Hub server 的薄分发 + 按域 crate 划分，不复制中央 dispatcher。
2. **`src/auto-reply/reply/dispatch-from-config.*` 家族**：单个 test-utils 文件 2053-2822 行（`dispatch-from-config.hooks-and-send-policy.test-utils.ts` 2822 行），说明消息出站管线的钩子/策略组合爆炸已难以用常规测试承载。教训：出站管线应早期限定钩子点数并冻结组合面。
3. **`extensions/memory-core/src/memory/manager.ts`（2409 行）、`dreaming.ts`（1173 行）、`extensions/openai/realtime-voice-provider.ts`（2491 行）**：即便有 max-lines 棘轮，仍有 952 个文件在豁免清单里——棘轮是止血带不是治愈。grok-build 吸收 F28 时应把初始预算定严（≤700），不接受大豁免清单起步。
4. **502 个 `OPENCLAW_*` 环境变量（`config/env-var-count-budget.txt` 自证）**：配置面失控到需要给环境变量数量本身设预算。grok-build 应坚持"配置优先走文件/结构体，env 只做覆盖"，并维护 env 白名单。
5. **运行时直食 `.ts` 插件源码（免构建）**：灵活性换来的是供应链攻击面，不得不叠加 minimumReleaseAge、ClawHub trust、quarantine 三层门禁（F23/F25）。grok-build 作为 Rust 项目天然走编译/动态库边界，**不应**为了插件便利引入脚本直执行；门禁只吸收其策略思想。
6. **`server-restart-sentinel.ts`（746 行）的实现方式**：语义正确（F6），但单文件横跨 delivery queue、heartbeat、channels、subagent 结算十余个子系统，是"崩溃恢复耦合一切"的警示。grok-build 实现 F6 时应以 outbox 表为中心、各子系统只注册恢复回调，避免复制这种扇入。
7. **qa-lab 闭源核心**：场景库在公开仓（`qa/scenarios`），但执行 harness 是私有 extension（`extensions/qa-lab`，`gateway-child.ts` 2048 行）——公开仓无法自证 e2e。grok-build 的 replay harness 必须留在主仓内可运行。
8. **`ui/src/i18n/locales/en.ts`（5827 行）类静态巨石**：i18n 文案进代码库并膨胀到全仓最大文件。grok-build 无多语言 UI 负担，文案保持资源文件即可，不引入 i18n 框架。
9. **协议 schema 的手工维护面**：`packages/gateway-protocol` 169 个文件、大量 `lazyCompile` 与手写 validator/guard 测试（`native-protocol-levels.guard.test.ts`）——schema-first 的收益真实，但每加一个字段要同步 schema/validator/codegen/测试四处。grok-build 做 F27 时优先选能单向生成 validator 的工具链（如 prost/serde 派生），避免手写校验层。

---

## 十、优先级汇总

| 优先级 | 特性 | 轴 | 成本 |
|---|---|---|---|
| P0 | F1 单实例双锁+PID 复用防御 | L1 | M |
| P0 | F2 健康监视器+重启预算 | L1 | M |
| P0 | F6 重启哨兵+持久投递队列 | L1 | L |
| P0 | F8 writer-run 写栅栏 | L2 | M |
| P0 | F9 cron 引擎全套 | L2 | L |
| P0 | F16 跨表面审批路由 | L3/治理 | L |
| P0 | F17 steering 注入点 | L3 | M |
| P0 | F19 幂等键+原子准入 | L3/治理 | M |
| P0 | F20 三正交策略+explain | 治理 | M |
| P0 | F21 exec-approvals fail-closed | 治理 | L |
| P0 | F30 failover 阶梯+失败分类学 | 模型运营 | M |
| P1 | F4 daemon 安装（含 BOOT.md 自检子项）/ F5 启动快速路径 | L1 | S/M |
| P1 | F7 dmScope / F10 heartbeat 投影 / F12 审计存储 | L2 | S/M |
| P1 | F14 设备签名鉴权 / F15 caps 收窄 / F18 中断转录 | L3 | M |
| P1 | F22 pre-auth 硬化 / F23 供应链门禁 | 治理 | S/M |
| P1 | F24 generations / F27 协议 codegen / F28 预算棘轮 / F29 会话谱系表 | 模型运营/工程/L3 | M |
| P1 | F33 配置写 CAS | 治理/L2 | S |
| P2 | F11 dreaming（含 memory-host-sdk 契约）/ F13 system-event | L2 | S-L |
| P2 | F25 插件发现/隔离区/Docker 子集 / F31 replay 账本 | 生态/工程 | S/M |

**落地顺序建议**：先 P0 中的 S/M 项（F1→F8→F19→F20→F17），它们互相构成"单写者 + 幂等 + 可解释策略"的地基；再上 F2/F22 硬化常驻面；F6/F9/F16/F21 四个 L 项按季度排期，且 F6 依赖 F19、F10 依赖 F9、F16 依赖 F14/F15 的身份体系。

---

## 附录 A：核心持久化表结构速查（F8/F29/F31 的落表参考）

来自 `src/state/openclaw-agent-schema.sql`（schema 版本化：根 package.json `openclaw.schemaVersions: { state: 6, agent: 17 }`），grok-build 在 `nofy-session-journal` 落对应表时可直接参照其约束设计：

- `session_nodes`（`:15-40`，会话节点 = 谱系锚点）：
  - `session_key TEXT PRIMARY KEY`、`current_session_id`、`entry_json`（会话条目含 `activeWriterRunId`/`lifecycleRevision` 等写栅栏字段，F8）。
  - `entry_valid INTEGER CHECK (IN -1,0,1)`——条目校验三态，`entry_valid=0` 有专门的部分索引待后台校验。
  - `status CHECK (running/done/failed/killed/timeout)`——run 终态枚举与 F6 restart 修复共用。
  - `created_via CHECK (operator/spawn/channel/cron/talk/run/plugin/internal)` + `created_actor_type CHECK (human/agent/system)` + `created_actor_id`——每个会话"谁、从哪个面、以什么身份"创建，全部落库（审计与谱系的地基，F12/F29）。
  - 谱系列：`parent_session_key`、`spawned_by`、`fork_source_session_key/session_id/entry_id`。
- `session_windows`（`:95-125`，转录代际）：
  - `session_id PRIMARY KEY` + `previous_session_id` 链 + `reason CHECK (initial/reset/rollover/fork/rewind/switch/recovery/compaction)`——每一代转录为什么诞生（F29）。
  - 出生快照列：`model_provider/model/agent_harness_id/channel/account_id/chat_type`。
  - 所有权列：`acp_owned`、`plugin_owner_id`、`session_entry_provenance`。
  - **`hook_external_content_source CHECK (gmail/webhook)`**——外部内容注入标记，提示注入防御与内容出处审计（OS 感官轴进上下文的每段内容都应带此类标记）。
- `transcript_events`（`:317-324`）：`PRIMARY KEY (session_id, seq)`，`event_json`，外键挂 window 级联删除——seq 单调即 F31 replay 账本的同构设计。
- `transcript_rewrite_watermarks`（`:326-331`）：`session_id → generation + updated_at`，改写（compaction 等）的水位标记，防跨代重写串扰。
- 状态库（`openclaw-state-db`，跨 agent 全局）另含：`audit_events`（F12）、exec-approvals 配置行（F21，带 fenced mutation）、cron job/run 台账（F9）、设备配对与 APNs 注册（F14/F16）、delivery 队列与死信（F6）。

> 设计要点：CHECK 约束在数据库层强制枚举（应用层 bug 写不进脏状态）；谱系/代际用"新行 + 前驱指针"而非原地更新（历史不可变）；全局状态与 per-agent 状态分库（state db vs agent db），写事务各自独立。

