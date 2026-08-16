# Hermes-Agent OS-level Agentic 特性抽取（源码级）

> 对象：`/home/none/grok-build/ref/hermes-agent`（hermes-agent v0.20.x，MIT）
> 目的：为 grok-build（Rust 终端 coding agent，已有 Leader 常驻种子 / Hub WS 多客户端 / ACP / serve 模式 / Landlock-bwrap 沙箱 / 全局+workspace 记忆 / fsnotify / Computer Hub）的 "OS-level agentic" 演进抽取可吸收特性。
> 方法：每条均回源码核实（路径+行号）；线索参考 `/home/none/grok-build/ref-analysis/hermes-agent.md`，但行号与机制以当前代码树为准。
> 注意：线索文档中的 `max_live_sessions`/`DETACHED` 在本版代码中已演化为 agent-cache LRU（`_AGENT_CACHE_MAX_SIZE`）+ `resume_pending` 崩溃恢复状态机，见 F5/F6。
> 轴：L1 常驻 / L2 跨域 / L3 系统面 / 治理 / 模型运营 / 生态 / 工程可信。

## 0. 总览

| # | 特性 | 轴 | 成本 | 优先级 |
|---|------|----|----|--------|
| F1 | sd_notify + 事件循环滞后采样 watchdog | L1 | S | P1 |
| F2 | 环外关闭 watchdog + 循环活性三振 + 心跳文件 | L1 | M | P0 |
| F3 | 非干净死亡取证（生命周期账本/关闭取证/cgroup 清扫） | L1 | M | P1 |
| F4 | 进程权威：重启退出码契约 + 单实例锁 + 接管 | L1 | M | P0 |
| F5 | 崩溃恢复会话状态机（clean_shutdown/resume_pending/卡循环） | L1/L2 | M | P0 |
| F6 | Agent 缓存 LRU + cgroup 感知内存压力驱逐 | L1/L2 | M | P0 |
| F7 | 健康面：只读 readiness 探针 + RSS 时间序列 | L1 | S | P2 |
| F8 | SessionDB 全局会话索引（end_reason 谱系） | L2 | M | P0 |
| F9 | FTS5 多 tokenizer 检索（unicode61+trigram+原生 CJK） | L2 | M | P0 |
| F10 | Cron 子系统（文法/心跳/flock 超时/HOME_CHANNEL 投递） | L2 | L | P1 |
| F11 | 记忆冻结快照 + promptware 扫描 + prefetch/sync 钩子 | L2/治理 | M | P1 |
| F12 | 平台适配器插件契约（passive/active 分离等） | L3/生态 | M | P2 |
| F13 | 登录 shell 环境快照（原子发布/注入安全） | L3 | M | P1 |
| F14 | CWD 带内标记 + 输出限流 spill | L3 | S | P1 |
| F15 | 进程注册表（滚动缓冲/检查点/watch 熔断） | L3 | M | P0 |
| F16 | 投递义务账本（at-least-once） | L3/治理 | M | P1 |
| F17 | 轮次租约（按 session_id 串行化） | L2/L3 | S | P1 |
| F18 | Curator 硬不变量 | 治理 | M | P1 |
| F19 | background_review fork 隔离 | 治理/L2 | M | P2 |
| F20 | 审批纪律（YOLO 冻结/contextvar 身份/ACP 桥） | 治理 | S | P1 |
| F21 | 生命周期守卫（拒绝自毁型任务） | 治理 | S | P1 |
| F22 | FailoverReason 错误分类学 | 模型运营 | M | P0 |
| F23 | 凭据池状态机 + 分级冷却 + 租约 | 模型运营 | M | P0 |
| F24 | 辅助路由链 + models.dev 目录缓存 | 模型运营 | M | P2 |
| F25 | 工具注册表 generation 计数 + override 安全闸 | 生态 | S | P1 |
| F26 | lazy_deps 供应链懒安装原则 | 生态 | M | P2 |
| F27 | Hooks 事件桥 | 生态 | M | P2 |
| F28 | WAL 降级阶梯（探测/降级/拒降/版本闸） | 工程可信 | M | P0 |
| F29 | 压缩跨进程 DB 租约 | 工程可信 | S | P1 |
| F30 | 密封测试不变量 + trajectory 首末保护 | 工程可信 | S | P2 |

---

## L1 常驻（daemon 生命周期）

### F1. systemd sd_notify + 事件循环滞后采样 watchdog
- 源：`gateway/systemd_notify.py:17-40`（`notify()`）、`:44-58`（`watchdog_interval_seconds`）、`:61-176`（`SystemdWatchdog`）
- 机制：
  - `NOTIFY_SOCKET` 存在时发非阻塞 `AF_UNIX` datagram（`READY=1`/`STOPPING=1`/`WATCHDOG=1`/`STATUS=`），`@abstract` 地址转 `\0` 前缀（`:13-14`）。
  - 失败永不致命：`:22-25` 注释明说"缺 socket 或老平台不得阻止网关启动"。
  - watchdog 不是定时喂狗，而是**滞后采样**：每 `interval/2` 调度一次，`record_tick(scheduled_at, now)` 只在事件循环按预算（默认 `max(0.1, interval*0.25)`，`:90-100`）内醒来时才发 `WATCHDOG=1`。
  - 超差即置 `unhealthy`、发 `STATUS=watchdog unhealthy: event loop progress is late` 并停喂（`:127-138`）；`stop()` 保证 `STOPPING=1` 至多发一次（`:159-176`）。
  - 即"喂狗"本身成为事件循环活性证明。
- 有效性：`asyncio.sleep` 调度差直接度量 loop 卡死；非阻塞 socket 防接收缓冲区满拖垮主循环（`:33-35`）。
- 价值：L1 — grok-build Leader/serve 常驻进程目前无 supervisor 语义；此设计把"进程活着"与"循环在推进"合一。
- 吸收：`sd-notify` crate（或裸 `UnixDatagram`）；trait `ServiceNotify { ready(); stopping(); watchdog_tick(); }`，tokio 侧用 `tokio::time::sleep_until` 的唤醒延迟做同一滞后采样。
- 成本 S；风险：非 systemd 环境需全部 no-op 化（hermes 已示范）。优先级 **P1**。

### F2. 环外关闭 watchdog + 循环活性三振 + 心跳文件
- 源：`gateway/shutdown_watchdog.py:1-24`（设计自述）、`:47-57`（常量）、`:59-77`（floor timer）、`:116-130`（`start_loop_liveness_watchdog`）
- 关键常量（`:47-57`）：
  ```python
  DEFAULT_SHUTDOWN_WATCHDOG_GRACE_S = 60.0
  DEFAULT_HEARTBEAT_INTERVAL_S = 30.0
  DEFAULT_LOOP_FLOOR_TIMER_INTERVAL_S = 5.0
  DEFAULT_LOOP_WATCHDOG_INTERVAL_S = 30.0
  DEFAULT_LOOP_WATCHDOG_TIMEOUT_S = 10.0
  DEFAULT_LOOP_WATCHDOG_MAX_STRIKES = 3
  _HEARTBEAT_RELATIVE = ("state", "gateway.heartbeat")
  ```
- 机制：asyncio 循环冻结时所有 async 恢复路径结构性失效（drain 截止、状态改写、取证都需要同一个卡死的 loop），且 launchd/systemd KeepAlive 只重启**死掉的**进程——楔死但活着的网关是僵尸。故用**纯 OS 线程**兜底四件套：
  1. `stop()` 时上膛的关闭 watchdog：超过 `restart_drain_timeout+60s` 未完成则 `faulthandler` 倾泻全线程栈 + 元数据快照（写 `logs/gateway-shutdown-watchdog.log`），然后 `os._exit` 让 supervisor 复活。
  2. 心跳文件 `<HERMES_HOME>/state/gateway.heartbeat` 供外部监督区分"进程活"与"循环冻"（`gateway_state.json` 只在状态迁移/轮次时改写，不够）。
  3. 活性线程每 30s 投 probe，事件循环 10s 内不回应记一次 strike，**3 strikes → 以重启退出码硬退**（`:116-128`，默认开、`gateway.loop_watchdog: false` 可关）。
  4. 自续订 floor timer（5s）保持 selector 超时有限，给尚存的 async 恢复任务留活路。
- 有效性：注释引 #66892/#69089 生产事故；模块自述明确"环外"是设计前提。
- 价值：L1 — grok-build 的 tokio runtime 同样可能因阻塞调用楔死；这是"自己救不了自己"场景的唯一解。
- 吸收：独立 `std::thread` 看门狗 + 原子心跳计数；卡死诊断用 `backtrace` crate 写 dump 后 `std::process::exit(75)`；心跳文件沿用。
- 成本 M；风险：误杀慢任务 → strikes/阈值/超时可配。优先级 **P0**。

### F3. 非干净死亡取证：生命周期账本 + 关闭取证 + cgroup 清扫
- 源：`gateway/lifecycle_ledger.py:1-30`（sentinel 状态机）、`gateway/shutdown_forensics.py:1-35`（信号上下文快照 + 分离 ps）、`gateway/cgroup_cleanup.py:1-25`（`ExecStopPost` 逐 PID SIGKILL）
- 机制：
  - `state/gateway.lifecycle.json` sentinel：启动时 `record_startup` 读上一世残留，`phase=="running"` 即判定**非干净死亡**（SIGKILL/OOM/VM 死，任何 handler 都没跑）。
  - 发现后把最后心跳的内存采样（`sample_memory`，<1ms 纯 /proc 读）作为最接近临死的遥测，写入 `gateway-exit-diag.log` 的 `gateway.previous_unclean_exit` 记录并 WARNING。
  - 每条干净退出路径 `mark_exited()` 改写 `phase=exited`+退出码+原因，接线在唯一的 graceful 退出漏斗 `_exit_after_graceful_shutdown`（#53107）与两个 watchdog `os._exit` 点。
  - 关闭取证提供 <10ms 同步探针（信号号、谁发的 SIGTERM）立即落日志；重活（`ps aux` 遍历）走分离子进程——/proc 楔住也不阻塞 teardown。
  - cgroup 清扫在 `ExecStopPost` 对 unit cgroup 内残留进程**逐 PID** SIGKILL（不用 `cgroup.kill`：#37454 的原始故障就是内核对其返回 EINVAL，逐 PID 走另一条仍可用的路径）。
- 有效性：NS-608 事故驱动；三者互补覆盖 graceful/unclean/orphan 三类死因。
- 价值：L1 — grok-build 崩溃恢复目前只有 Leader 重拉；"上一世怎么死的"是可诊断性刚需。
- 吸收：`struct LifecycleSentinel { phase, pid, started_at, last_mem_sample }` + 启动对账；信号处理只放非阻塞快照，重活走 spawn。
- 成本 M；风险：低（纯旁路记录）。优先级 **P1**。

### F4. 进程权威：重启退出码契约 + 单实例锁 + 接管
- 源：`gateway/restart.py:9-15`（退出码 75/78）、`:23-35`（两种重启超时）、`:38-55`（supervisor 探测）、`:58-67`（容器探测）、`:97-120`（退出等待预算）；`gateway/run.py:27560-27615`（接管路径）、`:27851`（PID 文件竞态）；`gateway/status.py:732`（flock）
- 机制：
  - sysexits 语义固化：`75`(EX_TEMPFAIL)=请 supervisor 重启；`78`(EX_CONFIG)=致命配置错（token 冲突/无平台），s6 finish 转 125 永久停（`:9-15`）。
  - 两种重启超时严格区分：in-band 重启先等活跃轮次结束（`restart_after_turn_timeout`），之后 `stop()` 内才有 `restart_drain_timeout` 强制预算；CLI 等退出的等待预算必须覆盖两段+余量，否则重演 #77184（`:97-120`）。
  - supervisor 探测看 `INVOCATION_ID`/`XPC_SERVICE_NAME`/`HERMES_S6_SUPERVISED_CHILD`/显式 env（`:38-55`）；容器探测 `/.dockerenv`/`/run/.containerenv`——容器里 detach-setsid 路径随 cgroup 死，exit-75 是唯一可行重启路径（`:58-67`）。
  - 单实例：PID 文件+flock，判活用 **PID+进程启动时间**。
  - `--replace` 接管按序：杀旧进程 → reap 孤儿适配器子进程（否则它们继续持有 scoped token 锁）→ 删 PID → 清未消费的接管 marker → **释放旧进程遗留的全部 scoped lock**（Ctrl+Z 停驻进程退出时不释锁，会挡住新网关启动，`:27586-27599`）。
- 有效性：#77184/#51228 修复痕迹；竞态输掉时明确日志退出（`:27851`）。
- 价值：L1 — grok-build 单实例与自重启目前靠约定；退出码契约 + 启动时间判活 + 陈旧锁回收是完整答案。
- 吸收：`enum DaemonExit { Restart=75, FatalConfig=78 }`；pidfile 用 `fs2` flock + `/proc/<pid>/stat` starttime 校验。
- 成本 M；风险：接管路径需充分测试。优先级 **P0**。

### F5. 崩溃恢复会话状态机（clean_shutdown / resume_pending / 卡循环升级）
- 源：`gateway/session.py:31-58`（freshness 窗）、`:2317`（`_should_reset`）、`:2428`（`get_or_create_session`）、`:3067`（`mark_resume_pending`）、`:3166`（`suspend_recently_active`）；`gateway/run.py:10036`（`_suspend_stuck_loop_sessions`）、`:11354/:13482`（`.clean_shutdown` marker）；`docs/session-lifecycle.md:99-143/:300-345/:350-440/:445-500`
- 机制：会话条目带 `suspended`（硬清）与 `resume_pending`（软恢复）双标志，访问优先级链（docs §2）：
  ```text
  suspended=True      → 强制重置（新 session_id）
  resume_pending=True → 保留 session_id（软恢复），下轮成功后清
  策略过期(idle/daily) → 自动重置
  否则                → 原样续用（bump updated_at）
  ```
  - 启动无 `.clean_shutdown` marker → 把最近 120s 内活跃会话标 `resume_pending`（跳过已 pending/已 suspended 的，`:3166`）；drain 超时中断的轮按 `restart_timeout`/`shutdown_timeout` 标记。
  - `resume_pending` 直到下一轮**成功完成**才清；再被打断则保留重试。
  - `restart_counts.json` 计连续重启次数，**同一会话跨 3+ 次重启自动 suspend**（卡循环熔断，给用户干净起点）。
  - 干净退出写 marker，防 `hermes update`/`/restart` 误伤。
  - 重置策略 `none|idle|daily|both` 可按平台/会话类型覆盖；有活跃后台进程的会话永不过期（`has_active_processes_fn` 异常时 **fail-closed 返回 True**，`session.py:1303-1320`）。
  - 自动续跑有 freshness 闸：`resume_pending` 超过 1h（可配，非正值禁用）不再自动续，防僵尸会话无限重放（`:31-58`）。
  - 配套消息排队：单槽 `_pending_messages`（突发折叠）+ `_queued_events` FIFO 溢出，`/queue` 每条产生独立完整轮次、不合并、不丢序（docs §8）。
- 有效性：#7536 全链路方案；docs 有状态机图与配置表。
- 价值：L1/L2 — grok-build Leader 崩溃后"接着聊还是重开"现在无状态机；此设计可直接移植到 Hub 会话。
- 吸收：SQLite sessions 表加 `resume_pending/suspended/end_reason` 列；`enum ResumeReason`；重启计数 JSON。
- 成本 M；风险：freshness/卡循环阈值需按 grok-build 节奏调参。优先级 **P0**。

### F6. Agent 缓存 LRU + cgroup 感知内存压力驱逐
- 源：`gateway/run.py:80`（`_AGENT_CACHE_MAX_SIZE=128`）、`:24461-24466`（idle TTL）、`:24466-24592`（`_sweep_agent_cache_under_pressure`）、`:24693-24726`（`_sweep_idle_cached_agents`）；`gateway/agent_cache_pressure.py`；`docs/session-lifecycle.md:580-668`
- 机制：每 session_key 缓存 AIAgent 以保前缀缓存；三道闸：
  1. 条目上限 128（LRU `OrderedDict.popitem(last=False)`）。
  2. idle TTL 3600s（sweep 对可终结会话还会延后，等过期观察期走完）。
  3. **内存预算**：匿名 RSS 对比 `memory_high_mb`（`auto` = 依次读 cgroup `memory.high`→`memory.max`→v1→总内存），超预算按 LRU 走软驱逐 `_commit_then_release_soft` + `malloc_trim` 归还 arena（`:24586-24592` 注明 trim 必须在软释放之后跑否则几乎不归还）。
  - 三类会话豁免：正在轮中的（client/沙箱在用）、最近 `protect_recent=8` 个 MRU（前缀缓存最值钱）、**transcript 尚未落盘追平的**（`transcript_persistence_caught_up` 比较 `_last_flushed_db_idx` 与 `len(_session_messages)`，`:24519/:24543`——与 FTS 写损坏守卫认的是同一个偏差）。
  - 每轮压力扫描最多驱逐 `max_evictions_per_pass=16` 个；被驱逐会话下一轮从持久化 transcript 重建。
- 有效性：#80764（RSS 涨到 cgroup 节流、SIGTERM 在 systemd stop 超时内刷不完）的直接修复。
- 价值：L1/L2 — grok-build 多会话常驻后同样面临 transcript 驻留内存；"落盘追平才许驱逐"是通用不变量。
- 吸收：`lru` crate + `procfs`/cgroup 读取；trait `Evictable { fn caught_up(&self)->bool; fn soft_release(self); }`。
- 成本 M；风险：驱逐后重建成本需计量。优先级 **P0**。

### F7. 健康面：只读探针 readiness + RSS 时间序列
- 源：`gateway/readiness.py:28-46`（state.db 只读探针）、`:62-87`（disk/gateway 探针）、`:89-120`（`collect_runtime_readiness`）；`gateway/memory_monitor.py:1-30`（设计）、`:48/:55-80`（5min 间隔、`ru_maxrss` 平台单位坑）
- 机制：
  - readiness 六项探针（state_db/config/model/disk/gateway/background_queues）。
  - state.db 用 `file:...?mode=ro` URI + `PRAGMA query_only`，绝不与写者抢锁；连接必须 `closing()` 关闭——context manager 只 commit/rollback 不 close，每次健康轮询漏一个 fd（#69678/#69567 教训，`:32-40`）。
  - disk >90% 判 degraded；gateway 探针统计 connected/configured 平台数。
  - **隐私纪律：探针只暴露状态与计数，永不暴露配置值/凭据/路径/命令/队列内容/异常消息**（`:99-101`）。
  - memory_monitor 每 5 分钟一行 grep 友好的 `[MEMORY] rss=...MB gc=... threads=... uptime=...`；启动基线 + 退出终值必记；daemon 线程不阻塞退出；`resource` 不可用退 `psutil`，两者皆无则单次 WARNING 后自废。
- 有效性：探针自身泄漏 fd 被修（注释在案）；格式为"grep 时间序列"刻意设计。
- 价值：L1 — grok-build serve/Hub 健康检查与长期泄漏排查的现成模板。
- 吸收：`/healthz` 返回 `{status, checks}`；RSS 用 `jemalloc` stats 或 `/proc/self/status`。
- 成本 S；风险：低。优先级 **P2**。

## L2 跨域（全局索引 / 记忆 / 调度）

### F8. SessionDB 全局会话索引（SQLite + 内容寻址去重 + end_reason 谱系）
- 源：`hermes_state.py:1-15`（WAL 设计自述）、`hermes_state_schema.py`（sessions/messages/usage/routing 表）；`gateway/session.py:1238-1310`（SessionStore）、`:1256-1266`（revision 全序快速持久化）、`:1325-1466`（routing scope/legacy 导入/陈旧修剪）
- 机制：
  - 单一 `state.db` 承载 sessions（含 source/model/model_config/system_prompt_hash/cwd/profile/parent_session_id）、messages、session_model_usage、gateway_routing。
  - system prompt 内容寻址去重（hash 表）。
  - `gateway_routing` 行按 **scope=解析后的 sessions_dir 路径**命名空间化，多 profile 共库互不可见（`:1325-1335`）。
  - 持久化双通道：全量重写 + 单条快速 upsert；后者带从 `_routing_generation` 分配的 revision，快慢快照**全序**可比，防陈旧延迟写覆盖新状态（`:1256-1266`）。
  - 会话结束带 `end_reason`（`session_reset`/`compression`/`session_switch`/`agent_close`/`ws_orphan_reap`）；过期晋升只覆盖可恢复类理由、绝不覆盖显式边界（docs §10）。
  - 崩溃遗留的陈旧路由条目启动时按 `end_reason IS NOT NULL` 修剪自愈（`_prune_stale_sessions_locked`，`:1430-1466`）。
  - SQLite 不可用降级 JSONL（仅降级路径；live-system 测试守卫异常必须响失败不得吞进降级，`:1293-1300`）。
- 有效性：多进程（gateway/cron/CLI）共享一库；损坏条目（裸 bool/字符串）跳过不中止全量加载（#46994）。
- 价值：L2 — grok-build 全局会话索引 + 跨会话谱系（parent_session_id）的基础设施参照。
- 吸收：`rusqlite` + 版本化 migration；`end_reason` 枚举化；revision 全序持久化值得照搬。
- 成本 M；风险：schema 需按 grok-build 裁剪。优先级 **P0**。

### F9. FTS5 多 tokenizer 检索（unicode61 + trigram + 原生 CJK bigram）
- 源：`hermes_state_search.py:1`（模块自述）、`:133-165`（补扫三索引）、`:385-424`（CJK 索引 live/backfill）、`:479-531`（docsize 零行修复）、`:1347-1358`（三索引分工）、`:1835`（CJK 查询绕过 unicode61 表）；`native/fts5_cjk/fts5_cjk.c` + `README.md:1-25`
- 机制：三张 external-content FTS5 表并存，各司其职（`:1347-1358`）：
  ```text
  messages_fts          unicode61 词级检索
  messages_fts_trigram  3-char 重叠序列，捕获 ≥3 字符子串（unicode61 不切边）
  messages_fts_cjk      C 扩展 tokenizer：unicode61 + CJK 字符 bigram
                        （Lucene CJKAnalyzer 语义）
  ```
  - CJK tokenizer 修两类病：1-2 字中韩日词落穿到 LIKE 全表扫；unicode61 把拉丁串粘进相邻 CJK（如 `修改youer服务端`）。
  - CJK 索引按需建：tokenizer .so 懒加载（`HERMES_FTS5_CJK_SO` 可指、build.sh 装到 `~/.hermes/lib/`、vendored sqlite3.h 免 libsqlite3-dev）；建表时宿主无 tokenizer 则打 backfill marker，换到有能力的主机自动重建（`:644-665`）。
  - tool 行不入索引（存储纪律）；`sessions.cjk_fts: false` 可关。
  - 索引健康自愈：docsize 表零行对非空 messages 表视为损坏并修复（`:479-531`）；FTS 触发器被无 tokenizer 进程删掉的陈旧索引起重建（`:804-809`）。
  - 查询路由：CJK 查询绕过 unicode61 表（`:1835`）。
- 有效性：PR #65544 社区贡献进主干；README 给出完整构建/回填/禁用说明。
- 价值：L2 — grok-build 面向中文用户的会话检索刚需；rusqlite bundled 自带 FTS5/trigram，CJK 需自挂 tokenizer。
- 吸收：`libsqlite3-sys` 注册自定义 tokenizer（移植 fts5_cjk.c，约 1 个 .c 文件）；或 tantivy + CJK bigram analyzer 备选。
- 成本 M；风险：自定义 tokenizer 的 SQLite 版本耦合（vendored 头已缓解）。优先级 **P0**。

### F10. Cron 子系统：调度文法 + 心跳/成功双文件 + 跨进程 flock 超时 + HOME_CHANNEL 投递
- 源：`cron/jobs.py:44-58`（croniter 懒导入）、`:86-113`（双心跳文件、60s 单一事实源、flock 30s 上限、oneshot 120s 宽限）、`:611-709`（`parse_schedule`）；`cron/scheduler.py:268-290`（`*_HOME_CHANNEL` 映射）、`:1605-1703`（`_deliver_result`）、`:3030`（deliver=local 免凭据）、`:3168-3218`（`run_job` 进程外环境）；`cron/scheduler_provider.py:265-267/:283-308`；`gateway/platforms/ADDING_A_PLATFORM.md:30-40`
- 机制：
  - 调度文法四态 `once|interval|cron|timestamp`（"30m"/"every 30m"/"0 9 * * *"/ISO）；croniter 仅在首个 cron 表达式时懒导入（~15ms 正则编译隔离，`:44-48`）。
  - naive 时间锚定到**配置的时区**而非服务器时区（否则存进去的时刻偏几小时、oneshot 永不到期，#51021）。
  - ticker 每 60s 摸 `ticker_heartbeat`，但只有无异常完成才摸 `ticker_last_success` —— `hermes cron status` 能区分"ticker 线程活着但每 tick 都失败"（#32612/#32895）。
  - jobs.json 跨进程 flock **带 30s 超时**：临界区只有字段更新，无限等会让楔死的兄弟进程冻住心跳与全部 job（#60703）；超时降级路径还有 shrink-merge 重写防双写（#80624）。
  - 投递：`deliver=origin|<platform>|all|local`；平台默认目标取 `*_HOME_CHANNEL` env（含线程 ID 伴生变量，`:1198`）；插件用 `cron_deliver_env_var` 声明自己的变量名即可入路由，零改 scheduler。
  - cron 独立进程运行时经插件 `standalone_sender_fn` 进程外投递，否则报 "No live adapter"。
  - `deliver=local` 明确免凭据检查（不得为本地任务付出凭据代价，`:3030`）；`deliver=origin` 无 origin 时安静回退 home channel 而非报错刷屏（`:1621-1634`）。
  - 多 profile 复用：scheduler_provider 对每个被服务 profile 逐库 tick 并独立记 liveness（`:283-308`）。
- 有效性：大量 issue 修复痕迹；插件声明式扩展投递面验证了开放封闭。
- 价值：L2 — grok-build 调度（含 Leader 定时任务）+ 跨表面投递的完整参照。
- 吸收：`croner`/`saffron` crate 解析 cron；`enum ScheduleKind`；flock 用 `fs2::try_lock_exclusive` + 有界重试；投递目标 trait 化（surface 注册 home_channel）。
- 成本 L；风险：时区/夏令时边角（hermes 已踩坑：锚定配置时区）。优先级 **P1**。

### F11. 记忆：冻结快照注入 + promptware 扫描 + prefetch/sync 钩子
- 源：`tools/memory_tool.py:11-23`（冻结快照自述）、`:71-87`（注入/外泄扫描）、`:153-243`（snapshot 构建与净化）、`:352-356`（drift guard）、`:396/:458/:578`（写路径扫描）、`:684-732`（快照读取/渲染）；`agent/memory_manager.py:1-24`（编排契约）、`:45-47`（drain/prefetch 超时）、`:50-80`（schema 归一）
- 机制：
  - `MEMORY.md`/`USER.md`（`§` 分隔条目）会话启动时载入并**冻结快照**进 system prompt；会中写入立即落盘但不改 prompt（保整个会话的前缀缓存，下会话生效，`:11-14`）。
  - 快照构建时对每条条目做确定性注入/外泄模式扫描，命中则该条以占位符替换入 prompt（原文留盘并告知用户如何恢复）——"被投毒的记忆不能进 system prompt"；扫描从磁盘字节确定性得出，快照可复现（`:78-87/:217`）。
  - 写路径同样先扫后写（add/replace 全覆盖）；replace/remove 用"短唯一子串"匹配。
  - drift guard 一次读取一次快照，消除"重读文件把并发写者刚加的内容当漂移"的窗口（`:352-356`）。
  - MemoryManager 是唯一编排点：`build_system_prompt()/prefetch_all(user_msg)/sync_all(user,assistant)/queue_prefetch_all()`；**只允许一个外部 provider**（防 schema 膨胀与后端冲突）。
  - shutdown drain 5s、外部 prefetch 8s 硬超时（楔死 provider 不得阻塞进程退出，worker 是 daemon 线程，`:45-47`）。
  - provider 工具 schema 经 `normalize_tool_schema` 归一，无名 schema 跳过并告警而非让严格 provider 拒整个请求（#47707）。
- 有效性：冻结快照 + 扫描是"记忆可写但 prompt 稳定"的不变量实现；超时值在案。
- 价值：L2/治理 — grok-build 已有全局+workspace 记忆，缺的正是冻结快照语义与投毒扫描。
- 吸收：`trait MemoryProvider { fn snapshot(&self)->FrozenSnapshot; async fn prefetch(&self,msg); async fn sync(&self,u,a); }` + `tokio::time::timeout` 包裹。
- 成本 M；风险：扫描规则误报需可调（hermes 用占位符而非拒绝，降级平滑）。优先级 **P1**。

## L3 系统面（多表面 / 执行环境）

### F12. 平台适配器插件契约：passive/active 依赖分离 + requires_env 进向导 + 边缘钩子
- 源：`gateway/platform_registry.py:39-100`（`PlatformEntry`）、`:55-80`（check_fn vs ensure_deps_fn 及 #79812 注释）；`gateway/platforms/ADDING_A_PLATFORM.md:1-120`；`plugins/platforms/irc/plugin.yaml`
- 机制：
  - `PlatformEntry` 把**被动探针** `check_fn`（必须无副作用——`hermes setup`/`status`/dashboard readiness 都会调，绝不可触发 pip 安装）与**主动安装** `ensure_deps_fn`（仅在 `create_adapter` 要拉起平台且 check 失败时调）拆开。
  - 合一曾致桌面启动循环装包（94% boot-loop）或永远不装（Teams 死锁）；拆开则两处调用点按构造正确（`:62-80`）。
  - plugin.yaml 的 `requires_env`/`optional_env` 带 description/prompt/password 字段，自动注入 setup 向导与 `OPTIONAL_ENV_VARS`（irc 插件实例含 IRC_SERVER/IRC_HOME_CHANNEL/IRC_ALLOWED_USERS 等 11 项）。
  - 四个边缘钩子：`env_enablement_fn`（env-only 配置在 status 可见）、`apply_yaml_config_fn`（插件自持 YAML schema，env>YAML 优先级用 `not os.getenv` 守卫）、`cron_deliver_env_var`、`standalone_sender_fn`。
  - 适配器基类契约：必需 `connect/disconnect/send/send_typing/send_image/get_chat_info`；可选媒体方法有默认 stub；交互 UX（`send_clarify`/`send_exec_approval` 按钮）未实现时优雅降级为纯文本。
  - 平台硬时限（LINE 60s 一次性 reply token、WhatsApp 24h 窗）用 `_keep_typing` 覆写叠加而非扩 kwarg 面；同平台双传输模式用行为 mixin + 两个适配器（WhatsApp Baileys/Cloud，mixin 必须在基类首位）。
  - 授权走 `*_ALLOWED_USERS` 白名单。
- 有效性：22 个平台插件 + 核心仓库零改动（文档自述 + 目录结构实证）。
- 价值：L3/生态 — grok-build 未来新表面（IM、webhook、Computer Hub 新后端）的模板；即使不做 IM，passive/active 依赖分离也适用于 MCP/工具后端。
- 吸收：`trait SurfaceAdapter { fn manifest()->Manifest; async fn check()->bool; async fn ensure_deps()->bool; ... }` + TOML manifest 反序列化。
- 成本 M；风险：钩子面要克制（hermes 也只给 4 个）。优先级 **P2**。

### F13. 登录 shell 环境快照：原子发布 + 注入安全的导出转储
- 源：`tools/environments/base.py:695-800`（`init_session`）、`:507-527`（会话变量排除契约）、`:531-560`（`_export_dump_excluding_session_vars`）
- 机制：后端构造后一次性用登录 shell 跑 bootstrap：`export -p` + 函数定义 + `alias -p` + `shopt -s expand_aliases` + `set +e/+u` 写入快照文件，之后每命令 source 快照而非 `bash -l`（快照失败才退回登录 shell）。四个关键防御：
  1. **原子发布**：快照先写 `mktemp` 唯一临时文件再 `mv`（`$$` 在 `&` 子 shell 中不唯一、`$BASHPID` macOS bash3.2 没有，故用 mktemp，`:724-739`），并发 source 永不读到半截文件（#38249）。
  2. **每会话桥接变量（HERMES_SESSION_* 等）绝不入快照**：共享后端服务多会话，首个会话的身份若入快照会让后续会话 source 到外国会话身份；排除用"先在子 shell unset 再 dump"而非行过滤——bash3.2 把含换行的值打成多行 `declare -x` 块，`grep -v` 只匹配首行，续行可把 `curl …|bash #` 走私进快照并在下次 source 时执行（#71296）。
  3. 函数过滤按**名字**选（`declare -F` 取名 → 逐个 `declare -f name` 整体转储）：行过滤会剥掉函数头留下孤儿 `{…}` 体损坏快照致 exit 127；且空名单时裸 `declare -f` 会泄漏全部函数（`:746-760`）。
  4. profile 脚本可能 `cd ~`，快照后必须 `cd` 回配置 cwd 再取 `pwd -P`（`:702-712`）。
  - 快照失败降级链：`bash -l` → 登录本身坏（Git-Bash 名场景）探测 `true` 后降非登录（`:786-800`）。
- 有效性：每处防御挂 issue 号；Windows/Git-Bash 路径转义有专门处理（`:705-718`）。
- 价值：L3 — grok-build 终端工具的环境一致性（nvm/alias/函数）与多会话隔离的直接参照。
- 吸收：Rust 侧生成 bootstrap 脚本字符串，`tempfile` + `rename` 原子发布；排除名单常量与 gateway 桥接变量同步（测试锁定）。
- 成本 M；风险：shell 兼容性长尾（macOS bash3.2 等），需照抄其防御。优先级 **P1**。

### F14. CWD 带内标记 + 输出限流 spill（命令状态跟踪双件）
- 源：`tools/environments/base.py:502-504`（`_cwd_marker`）、`:769/:949`（包装注入）、`:1330-1365`（`_extract_cwd_from_output`）；`:82-145`（`_BoundedOutputCollector`）、`:1383-1445`（`execute` 的 `bounded_capture` 契约）
- 机制：
  - CWD：每条命令包装尾部注入 `printf '\n__HERMES_CWD_{sid}__%s__HERMES_CWD_{sid}__\n' "$(pwd -P)"`；宿主从 stdout 尾部 rfind 标记对（向前 4KB 窗，CWD 路径不会更长）解析新 cwd，并把注入换行到闭标记后的整段从输出剥净（`:1338-1365`）。
  - 远程后端（Docker/SSH/Modal/Daytona/Singularity）走带内标记；本地后端可用临时文件变体。
  - 限流：40/60 头尾窗（`max_chars` 可配）；**开始驱逐才懒开 spill 文件**并回填已保留内容使文件自字节 0 完整；硬上限 5MB 后追加封顶标记（`_SPILL_CAP_CHARS`）；磁盘故障绝不破坏命令执行（`:133-135`）。
  - `bounded_capture=True` 只许"输出将进模型"的调用方使用；cat/日志读等全保真消费者必须 False——截断它们损坏的是数据不是显示（`:1396-1402`）。
  - execute 还含 `A && B &` 子壳等待陷阱改写、sudo stdin 合并、heredoc stdin 模式等包装（`:1405-1430`）。
- 有效性：#64435（全量输出驻内存）修复；spill 使截断结果免重跑可恢复。
- 价值：L3 — grok-build 终端工具的 cwd 持久化与大输出治理现成方案。
- 吸收：`struct BoundedCollector { head, tail: VecDeque, spill: Option<File>, cap }`；CWD 解析纯函数易测。
- 成本 S；风险：标记与命令自身输出碰撞 → 会话随机后缀已防。优先级 **P1**。

### F15. 进程注册表：滚动缓冲 + 检查点恢复 + watch 通知熔断
- 源：`tools/process_registry.py:1-18`（职责自述）、`:59-66`（常量）、`:68-80`（watch 限流与全局熔断）
- 关键常量（`:59-80`）：
  ```python
  CHECKPOINT_PATH = get_hermes_home() / "processes.json"
  MAX_OUTPUT_CHARS = 200_000      # 滚动输出缓冲
  FINISHED_TTL_SECONDS = 1800     # 完成进程保留 30min
  MAX_PROCESSES = 64              # LRU 修剪上限
  WATCH_MIN_INTERVAL_SECONDS = 15 # 每会话 watch 通知最小间隔
  WATCH_STRIKE_LIMIT = 3          # 连续 strike → 禁用 watch 降级完成通知
  WATCH_GLOBAL_MAX_PER_WINDOW = 15  # 全局熔断：10s 窗内上限
  ```
- 机制：
  - `terminal(background=true)` 的进程统一登记，且**经 environment 接口执行**——沙箱后端里命令就跑在沙箱里。
  - 能力：滚动 200KB 输出窗、poll/wait（带中断支持）/kill、完成进程 30min TTL、64 并发 LRU 修剪、**JSON 检查点做网关崩溃恢复**、会话作用域跟踪使网关重置不误杀后台进程。
  - 与 F5 联动：`has_active_processes_fn` 同源——有活跃进程的会话永不过期。
  - watch_patterns 通知限流双层：每会话 15s 最小间隔，冷却窗内的匹配丢弃并记 strike，**连续 3 strike 永久禁用该会话 watch、降级为完成通知**；全局熔断 10s 窗内最多 15 条，超则全体冷却 30s——防并发兄弟会话合谋刷屏（`:68-80`）。
- 有效性：限流规则以常量+注释固化；#29177 的 24h 活跃上限可配（`session_reset.bg_process_max_age_hours`）。
- 价值：L3 — grok-build 后台任务（background bash）管理的完整模板，尤其熔断设计。
- 吸收：`ProcessRegistry` + tokio 进程句柄；检查点 serde JSON；strike 计数 per-session。
- 成本 M；风险：检查点恢复的孤儿进程判活需 pid+starttime。优先级 **P0**。

### F16. 投递义务账本：最终回复 at-least-once 不丢
- 源：`gateway/delivery_ledger.py:1-30`
- 机制：
  - 最终回复"已生成未确认送达"是网关唯一会无痕丢失的产物（token 已烧、文本只在 Python 局部变量，finalize 与平台 ACK 之间崩溃/计划重启即静默丢失）。
  - 每条出站最终回复在 state.db 记一行（与 `tools.async_delegation` 同约定：WAL、owner pid+进程启动时间判活、有界保留）。
  - 三点检查：`record_obligation(pending)` → `mark_attempting()`（await 前一刻）→ `mark_delivered()`（仅 SendResult.success）/`mark_failed()`（确定性拒绝）。
  - 启动时 `sweep_recoverable()` 认领死进程的行重投；歧义语义显式：
    - `pending`（从未开始发）→ 直接重投，无重复风险。
    - `attempting`（崩在 await 中）→ 平台可能已收到，重投**带可见的 recovered-reply 标记**。
    - `failed` → 自然重试边界，也带标记。
  - 契约是诚实的 at-least-once，永不静默重复（#58818/#41696/#63695；早期 outbox 方案 #61790 因静默重发歧义消息被契约评审否决）。
- 有效性：三 issue 驱动 + 前方案被否决的演化记录在案。
- 价值：L3/治理 — grok-build Hub WS 断连重发、ACP 中途断开的回复保全同理适用。
- 吸收：SQLite `obligations` 表 + 状态枚举 + 启动清扫；重投标记由表面适配器渲染。
- 成本 M；风险：重复投递的用户感知需标记兜底。优先级 **P1**。

### F17. 轮次租约：按已解析 session_id 串行化（防别名键并发）
- 源：`gateway/turn_lease.py:1-30`
- 机制：
  - 忙守卫按**路由键**（adapter `_active_sessions`、runner `_running_agents`），但持久 transcript 按 **session_id** 所有；`switch_session`/`/resume`/CLI 续接重绑/异步委托完成钉住/Telegram 话题 tip-walk 使键→id 多对一。
  - 两个路由键映射同一 session_id 时，两个 agent 对象并发跑轮、按完成序冲刷同一 transcript——行序错乱、去重吞行、第二轮跑在没见过第一轮的历史上，留下永久 `user;user` 交替楔让 `repair_message_sequence` 每请求反复修。
  - 租约在会话解析**最终确定后**（switch/tip-walk 之后）、transcript 载入前获取，dispatch 层 `finally` 释放；同键消息到不了获取点（两道键守卫已拦住），故锁只在别名路径竞争。
  - 安全性质：**代际限定 + 身份校验释放**——token 记录持有者（路由键、运行代际），释放只在身份匹配时生效。
  - 配套跨 agent 绊线 `note_turn_start` 记 WARNING 点名会话与两个路由键。
- 有效性：#64934 根因分析完整记录在 docstring。
- 价值：L2/L3 — grok-build Hub 多客户端绑定同一会话、ACP+CLI 并发时的互斥正是此问题。
- 吸收：`TurnLease { tokio Semaphore(1) per session_id, token: LeaseToken{gen, owner} }`。
- 成本 S；风险：低（锁粒度清晰、无竞争路径）。优先级 **P1**。

## 治理（审批 / fail-closed / 不变量）

### F18. Curator 硬不变量：只碰自创 / 只归档不删 / pinned 豁免
- 源：`agent/curator.py:3-18`（不变量自述）、`:73/:184-208`（archive_after_days=90、bundled 可归档开关+抑制名单）、`:306-380`（纯时间自动迁移）、`:399-565`（LLM pass 的 prompt 纪律与 consolidation 报告）；`tools/skill_usage.py:427-452`
- 不变量自述（`:15-18`）：
  ```text
  Strict invariants:
    - Only touches agent-created skills (see tools/skill_usage.is_agent_created)
    - Never auto-deletes — only archives. Archive is recoverable.
    - Pinned skills bypass all auto-transitions
  ```
- 机制：curator 是辅助模型驱动的后台 skill 维护（空闲触发、非 cron 守护），不变量代码化：
  1. 只碰 agent 自创 skill——`is_agent_created` = 不在 bundled manifest ∪ hub-installed 名单且非 external_dirs（外部目录对 curator 只读，越界给专门错误消息，`:448-452`）。
  2. 永不删除只归档（`.archive/` 可恢复）；LLM prompt 明写 "Archives are recoverable; deletion is not"（`:439-440`）；`skill_manage action=delete` 实际执行归档。
  3. pinned 与 cron-referenced（`cron=yes`）skill 豁免一切自动迁移（`:331/:339-347`）。
  4. 从未使用（use=0）的 skill 有宽限地板不得直接归档（`:359`）。
  5. 双层执行：纯时间戳的无 LLM 自动迁移（active→stale→archived，锚点是**最后真实活动时间**）+ 派生 fork agent 做 pin/archive/consolidate/patch；LLM pass 结束必须交 consolidation 报告——每个被归档 skill 必须恰好出现在一个去向栏目里（`:546-565`）。
  6. 用辅助模型不动主会话缓存。
- 有效性：不变量在 docstring、prompt 文本、代码守卫三处一致。
- 价值：治理 — grok-build 若做记忆/技能自动策展，这是"可委托但不可失控"的样板。
- 吸收：`enum SkillProvenance { Bundled, HubInstalled, AgentCreated }`；`fn archive()` 无 delete API；pinned 标志位。
- 成本 M；风险：LLM 策展需审计日志（hermes 有 consolidation 报告）。优先级 **P1**。

### F19. background_review：fork 隔离 + 工具白名单 + 缓存感知重放
- 源：`agent/background_review.py:1-17`（设计自述）、`:33-110`（运行时解析）、`:125-130`（digest 策略）、`:935-985`（线程级工具白名单）；频率闸：`agent/conversation_loop.py:1701`、`agent/turn_finalizer.py:734`（`_skill_nudge_interval`）
- 机制：每轮后可 spawn daemon 线程，持父 agent 的 fork 重放对话自问"要不要存/更新 skill/memory"。隔离三要素：
  1. fork 继承父运行时（provider/model/凭据/已缓存 system prompt）→ 命中**同一前缀缓存**；主会话与其 prompt 缓存绝不触碰。
  2. 线程级工具白名单只放 memory/skill 管理工具，其余运行期拒绝（`set_thread_tool_whitelist`，拒绝带日志，`:946-956`）。
  3. 写直达存储。
  - 缓存感知重放策略一句话：同模型→全量重放（缓存热，读便宜）；路由到不同辅助模型（`auxiliary.background_review.{provider,model}`）→缓存必冷，故只重放尾部 24 条 + 旧轮折叠成单条 digest 保持角色交替，最小化冷写 token（`:33-45` 把策略讲死）。
  - 触发有频率闸（`_skill_nudge_interval` 默认每 10 次工具迭代评估一次）。
- 有效性：`tests/test_background_review_session_isolation.py` 等专门测试。
- 价值：治理/L2 — grok-build 的"轮后反思/记忆固化"若直接跑在主会话会污染上下文与前缀缓存，此设计给出两全解。
- 吸收：Rust 侧 fork=克隆 `Arc<RuntimeConfig>` + 消息切片起新任务；白名单用请求级 `ToolPolicy`。
- 成本 M；风险：成本失控 → 需频率/预算闸。优先级 **P2**。

### F20. 审批系统：YOLO 冻结 + contextvar 会话身份 + ACP 选项桥 + 智能审批
- 源：`tools/approval.py:1-9`（职责）、`:36-38`（YOLO 导入期冻结）、`:40-60`（contextvar 身份与 GHSA）、`:124-159`（智能审批观察器）、`:693`（`DANGEROUS_PATTERNS`）、`:2175`（`detect_dangerous_command`）、`:2711-2717`（allow_permanent）；`acp_adapter/permissions.py:19-45`
- 机制：
  - 危险命令审批单一事实源：模式检测 + 每 session_key 线程安全审批状态 + CLI 交互/网关异步双提示 + 辅助 LLM 智能审批（低风险自动放行，verdict 有观察器记录）+ 永久 allowlist 持久化（config.yaml）。
  - **fail-closed 纪律一**：`HERMES_YOLO_MODE` 在模块导入期冻结——运行中任何 skill 改 env 即绕过审批是提权路径，故读一次定终身（`:36-38`）。
  - **fail-closed 纪律二**：会话身份（session_key/turn_id/tool_call_id）用 contextvar 而非进程全局 env——并发 ACP 会话共享线程池时改 `os.environ["HERMES_INTERACTIVE"]` 竞态曾把一个会话掉进非交互自动批准路径，危险命令未经审批回调执行（GHSA-96vc-wcxf-jjff 修复，`:53-60`）。
  - 审批选项 `allow_permanent=False` 时隐藏 [a]lways（`:2711-2717`）。
  - ACP 桥把 hermes 审批结果映射到 `allow_once/allow_session/allow_always/deny/deny_always` 稳定选项 id（跨两种 allow_permanent 路径不漂移）；运行时探测所装 ACP SDK 支持的 option kind 降级（`:32-40`）。
- 有效性：一个 GHSA 编号 + 选项 id 稳定性注释。
- 价值：治理 — grok-build 已有审批，但"启动期冻结安全开关 + 任务局部身份"两条纪律值得对照加固。
- 吸收：`static YOLO: OnceLock<bool>`；会话身份走 tokio task-local/请求上下文。
- 成本 S；风险：低。优先级 **P1**。

### F21. 生命周期守卫：拒绝自毁型 cron/命令（命令形状锚定）
- 源：`cron/lifecycle_guard.py:1-35`（设计自述）、`:47-60`（`GatewayLifecycleBlocked` + 命令形状正则）
- 机制：
  - 攻击面：网关内 agent 排一条 cron 调 `hermes gateway restart`（或 `launchctl kickstart`/`systemctl restart`）→ 触发即网关死 → supervisor KeepAlive 复活 → auto-resume 捡起原会话重跑同一逻辑 → 每 10s SIGTERM-重生死循环直到人工打破。
  - 守卫在 `create_job` 收口拒绝 prompt/script 含**命令形状**的网关生命周期指令——CLI 子命令与模型 `cronjob` 工具都直接过 `create_job`，一处生效全路径。
  - 模式刻意锚定具体命令标识符而非英文子串：cron prompt 是给未来 LLM 的不是给 shell 的，宽匹配会对 "Kong API gateway autoscaling and restart behavior" 类文本高误报且挡不住真脚枪；`start` 刻意排除（网关内 start 是无害 no-op）。
  - 纵深防御：terminal_tool 在 `_HERMES_GATEWAY=1` 下拦截直接命令与其引用的脚本、拒绝 `launchctl submit`（launchd 视其为持久 KeepAlive 原语而非一次性任务）、`hermes gateway stop|restart` 拒绝网关内自我指向。
- 有效性：#30719 修复；agent 得到即时信息性拒绝而非排一个触发时才静默失败的任务。
- 价值：治理 — grok-build 的 agent 若能调度任务/执行 shell，"agent 杀死自己的宿主"同类风险真实存在。
- 吸收：任务创建期的命令形状正则 + 运行期终端拦截双层；收口点单一化。
- 成本 S；风险：模式维护成本。优先级 **P1**。

## 模型运营（fallback / 路由 / catalog）

### F22. FailoverReason 错误分类学 + 恢复提示标志
- 源：`agent/error_classifier.py:24-70`（reason 枚举）、`:77-97`（`ClassifiedError` 四提示标志）、`:624-643`（`classify_api_error` 管线自述）、`:644-1002`（分类主体）
- 分类学节选（`:24-49`）：
  ```python
  class FailoverReason(enum.Enum):
      auth = "auth"                    # 401/403 瞬时 — 刷新/轮换
      billing = "billing"              # 402/额度耗尽 — 立即轮换
      rate_limit = "rate_limit"        # 429 — 退避后轮换
      upstream_rate_limit = "..."      # 聚合器 429 — 换模型，不换凭据
      overloaded / server_error        # 503/529、500/502
      timeout                          # 重建 client + 重试
      ssl_cert_verification            # 对主机确定性 — fail fast
      context_overflow                 # 压缩，而非 failover
      payload_too_large / image_too_large
      model_not_found / provider_policy_blocked / content_policy_blocked
      format_error / invalid_encrypted_content / multimodal_tool_content_unsupported
      thinking_signature / long_context_tier / llama_cpp_grammar_pattern ...
      unknown                          # 兜底：退避重试
  ```
- 机制：
  - 把散落的字符串匹配集中为一个优先级管线（状态码 → provider 专属模式 → 消息模式 → … → 兜底 unknown，`:643`），输出结构化 `ClassifiedError`。
  - 重试循环只读四个提示标志，不再自己重分类：`retryable / should_compress / should_rotate_credential / should_fallback`（`:90-93`）。
  - 关键判例：聚合器 429 换模型**而非**轮换凭据（用户的 key 是健康的，`:37-39`）；TLS 验证失败对主机确定性，fail-fast 给可操作指引不烧重试（`:44-49`）；无异常对象的 raise 不得留在可重试侧（`:726-732`）。
- 有效性：1842 行分类表 + 每分支注释引生产故障；被主循环对每次 API 失败调用。
- 价值：模型运营 — grok-build 多 provider fallback 的决策核心；分类学可直接搬，provider 专属条目按需增删。
- 吸收：`enum FailoverReason` + `struct ClassifiedError { reason, retryable, should_compress, should_rotate, should_fallback }`；单一 `fn classify(err:&ApiError)->ClassifiedError`。
- 成本 M；风险：模式匹配需随 provider 演化维护。优先级 **P0**。

### F23. 凭据池：OK/EXHAUSTED/DEAD 状态机 + 分级冷却 + 四策略 + 租约
- 源：`agent/credential_pool.py:64-77`（状态与 DEAD 语义）、`:80-88`（终局 OAuth 原因集）、`:92-100`（DEAD 修剪策略）、`:109-133`（策略与冷却 TTL）、`:633/:667-699`（`CredentialPool`/`has_available`）、`:1808`（available/pending_refresh）、`:2031`（`mark_exhausted_and_rotate`）、`:2201/:2249`（租约）
- 冷却 TTL（`:122-133`）：
  ```python
  EXHAUSTED_TTL_401_SECONDS = 5 * 60      # 瞬时 auth，单 key 可恢复
  EXHAUSTED_TTL_429_SECONDS = 60 * 60
  EXHAUSTED_TTL_DEFAULT_SECONDS = 60 * 60
  EXHAUSTED_TTL_SOLE_CREDENTIAL_SECONDS = 60  # 唯一 key：短冷却快速重试
  ```
- 机制：
  - 多 key 池持久化 JSON。`DEAD` 是终态：`token_invalidated`/`token_revoked`/`invalid_token`/`invalid_grant`/`unauthorized_client`/`refresh_token_reused`（来自 Codex/Anthropic/xAI/Google OAuth 规范与 RFC 6749/7009/6750 的 frozenset），无条件退出轮换，只有写侧重新登录才复活。
  - manual 死条目 24h 后修剪；singleton 种子条目不修剪（重播种会带回同样坏 token，`:92-100`）。
  - provider 给的 `reset_at` 覆盖默认冷却；**池里只剩这一个非 DEAD key 时降到 60s**（1h 硬失败无备胎不如快速重试，`:126-133`）。
  - 策略四选一：fill_first/round_robin/random/least_used。
  - 失败语义经 classifier 判定后以纯文本存（池持久化 JSON 不得 import classifier，`:135-137`）。
  - `has_available` 对过期冷却**不清除**只判断，防回退门为 60s 冷却白等 1h（`:686-699`）；租约 API（acquire/release）支持并发占用；"no available entries" INFO 有节流（`:140`）。
- 有效性：#43747（陈旧冷却被误提）等修复；策略与 TTL 全部可配。
- 价值：模型运营 — grok-build 多 key/多账号轮换的现成状态机；"唯一 key 短冷却"是细节亮点。
- 吸收：`enum CredentialStatus` + `CooldownPolicy`；持久化 serde JSON；与 F22 的 `should_rotate_credential` 联动。
- 成本 M；风险：冷却参数需按 provider 实测。优先级 **P0**。

### F24. 辅助路由链 + models.dev 目录（stale-while-revalidate）
- 源：`agent/auxiliary_client.py:1-48`（解析链/402 fallback/free_only/Codex 排除理由）、`agent/models_dev.py:1-40`（三级解析与延迟敏感模式）
- 机制：
  - 辅助任务（压缩/检索摘要/视觉/web 抽取/浏览器视觉）走独立路由：主 provider → OpenRouter → Nous Portal → 自定义端点 → Anthropic → 各 API-key provider。
  - 402/额度耗尽自动链上下移；`auxiliary.free_only` 把 OpenRouter 回退限制在 `:free` SKU（成本闸，非 free 一次性 WARNING）；每任务可在 config `auxiliary.<task>.{provider,model}` 覆盖。
  - 视觉任务有独立链（本地视觉模型 Qwen-VL/LLaVA 走自定义端点位）。
  - Codex OAuth 刻意不进回退链——OpenAI 对其端点有未文档化且漂移的模型 allow-list，"硬编码模型试试"会自己腐烂。
  - models.dev（4000+ 模型/109+ provider 社区目录）三级解析：内存缓存（1h，过期**立返旧值**同时单后台线程刷新）→ 磁盘缓存（任意龄，宁用旧数据不阻塞调用方）→ 网络（仅完全无缓存时；失败全进程退避 5min）。
  - 延迟敏感调用方（网关路由身份检查）传 `allow_network=False` 永不触网。
  - 目录字段含上下文窗/最大输出/每 M token 价/能力位（reasoning/tools/vision/PDF/audio）/知识截止/开源权重/弃用状态。
- 有效性：两个模块的 docstring 即设计文档；`default_aux_model` 在 provider profile 里声明。
- 价值：模型运营 — grok-build 的压缩/摘要等副任务路由廉价模型 + 模型目录缓存的完整参照。
- 吸收：`fn resolve_aux(task)->Option<Runtime>` 链式；目录缓存 `ArcSwap<Catalog>` + 后台刷新任务。
- 成本 M；风险：外部目录可用性（hermes 的降级链已示范）。优先级 **P2**。

## 生态（plugin / hooks）

### F25. 工具注册表：generation 计数缓存失效 + 插件 override 安全闸
- 源：`tools/registry.py:207-230`（`dynamic_schema_overrides`）、`:420-436`（`_generation`/RLock/override 策略表）、`:513-560`（策略注册/owner 鉴权）、`:562-644`（`register` 闸门）、`:653-710`（unregister 同闸）、`:747-752`（动态 schema 应用）；`model_tools.py:276-384`
- 机制：
  - 单例注册表每次 register/unregister/alias 递增 `_generation`（RLock 保护，`:436/:497/:644/:710`）。
  - `get_tool_definitions` 的 memo 以 (toolsets, generation, config 文件 mtime_ns+size) 为键（`model_tools.py:343-351`）——MCP 工具动态刷新自动失效缓存且并发安全；缓存条目有硬上限防长寿命网关膨胀（`:289`）。
  - 工具可挂 `dynamic_schema_overrides`（零参 callable）在取 schema 时做运行时覆写（如 delegate_task 描述，`:747-752`）。
  - 插件替换内置工具需双重闸门：`override=True` 显式 opt-in **且** 配置里 `plugins.entries.<id>.allow_tool_override: true`。
  - 授权按 handler 的**定义模块命名空间**绑定（`_plugin_owner_of`），回调无法"洗"授权（`:522-538`）；每次 override INFO 日志可审计（`:605-608`）。
  - unregister 走同一闸门（`:653-710`）；MCP 刷新路径因无插件 override 概念而豁免检查（`:657-660`）。
- 有效性：闸门注释明确威胁模型；generation 机制被 schema 缓存直接消费。
- 价值：生态 — grok-build 工具/MCP 动态注册的缓存失效与插件越权防护。
- 吸收：`AtomicU64 generation` + `RwLock<HashMap>`；override 授权表读配置；缓存键含 generation。
- 成本 S；风险：低。优先级 **P1**。

### F26. lazy_deps：供应链安全的运行时懒安装
- 源：`tools/lazy_deps.py:1-65`（安全模型自述）、`:96-110`（LAZY_DEPS allowlist 与 CVE 注释）
- 机制：
  - 动机：可选后端依赖不进 `[all]` extras——一个传递依赖被 PyPI 隔离/yank 会让整个 resolve 失败、新装静默掉到精简档，一次丢 10+ 无关 extras；改为首次使用时 `ensure("feature.name")` 懒装。
  - 供应链约束：allowlist（`LAZY_DEPS` map）之外的 spec 不可装，拼错特性名不产生"装任意包"语义。
  - 只收包名+版本范围，**不支持 `--index-url`/`git+`/`file:`**（可被恶意配置劫持的输入形态全禁）。
  - venv 作用域绝不碰系统 Python。
  - 不可变镜像场景（`HERMES_DISABLE_LAZY_INSTALLS=1` + 只读 /opt）装到持久卷目录并**追加（永不前置）到 sys.path**、不导出 PYTHONPATH——懒装包只能新增模块，不能 shadow/降级核心已有模块，最坏只是自己 import 失败报不可用，核心保持健康（这是敢封 venv 的结构性保证）。
  - 目标子目录带 ABI/Python 版本戳防跨镜像重建的 wheel 不兼容。
  - `security.allow_lazy_installs: false` 全局可禁（受限网络自锁）；失败以 `FeatureUnavailable` 带 pip stderr 上浮，无静默重试无坏状态缓存。
- 有效性：docstring 即威胁模型文档；CVE-2026-34450/34452 写在 anthropic pin 注释里。
- 价值：生态 — Rust 无 pip 对应物，吸收的是**原则**：可选能力 feature-gate + 运行时探测（check_fn）+ 安装面收敛到受信渠道 + 失败显式上浮。grok-build 的 MCP/插件二进制下载同理需要 allowlist 与来源限定。
- 吸收：cargo features 编译期 + `Capability::probe()` 运行期；若做插件市场则 manifest allowlist + 校验和。
- 成本 M；风险：运行期安装语义在 Rust 生态需重新设计（不照搬 pip）。优先级 **P2**。

### F27. Hooks 事件桥：目录发现 + 错误永不阻塞主管线
- 源：`gateway/hooks.py:1-54`（事件谱系与 context 契约）、`:54-202`（`HookRegistry`）
- 机制：
  - `~/.hermes/hooks/<name>/` = `HOOK.yaml`（name/description/events 列表）+ `handler.py`（`async def handle(event_type, context)`），`HookRegistry` 发现并加载（含内置 hooks 目录）。
  - 事件谱系：`gateway:startup`、`session:start/end/reset`、`agent:start/step/end`、`command:*` 通配。
  - context 带 platform/user_id/chat_id/thread_id/chat_type/session_id 及截断到 500 字的消息/响应；`agent:end` 追加 response/model/provider。
  - 文档甚至给出论坛话题回帖要带 `message_thread_id` 的集成细节。
  - **hook 异常被捕获记录但永不阻塞主管线**；另有 `emit_collect` 收集型发射（`:202`）供需要返回值的场景。
- 有效性：事件面与字段契约写在模块 docstring。
- 价值：生态 — grok-build 的用户自定义生命周期扩展点；注意 Python 版直接加载任意 .py 是安全弱点。
- 吸收：Rust 侧改为**外部二进制 + JSON-over-stdio**（或 WASM）而非动态加载代码，保留目录发现与事件谱系，fail-open 语义不变。
- 成本 M；风险：子进程 hook 的延迟/超时治理。优先级 **P2**。

## 工程可信

### F28. WAL 降级阶梯：探测-降级-拒降三级 + 版本漏洞闸
- 源：`hermes_state.py:511-560`（不兼容标记与策略注释）、`:722-729`（磁盘头模式只读探测）、`:746-811`（macOS fullfsync 屏障 + WAL-reset 漏洞探测）、`:838-862`（`resolve_journal_mode`）、`:864-980`（`apply_wal_with_fallback`/`WalUnsupportedError`）
- 机制：WAL 需要共享内存 mmap 与 fcntl，NFS/SMB/FUSE/ZFS 上两种失败形态：显式 `SQLITE_PROTOCOL`("locking protocol")/`disk I/O error`，或 macOS-NFS 式**静默拒绝**（pragma 返回未变的模式不报错）——都要识别（标记表 + 返回模式比对，`:539-541/:866-876`）。降级到 DELETE 记 ERROR（真实并发损失非装饰性警告）且按 db_label 去重（kanban_db 每操作连接也只报一次）。四条硬纪律：
  1. **永不 live-downgrade 磁盘头已是 WAL 的库**——其他 gateway/cron/worker 连接可能开着，翻模式会毁未 checkpoint 事务（`:535-539`）。
  2. 磁盘头探测用只读连接——不加 flock、不 checkpoint、不 unlink WAL/SHM，防 WAL-init 把别的连接持有的文件 unlink 掉（`:946-948`）。
  3. 配置要求 DELETE 但探测失败（库被锁）时**大声失败**而非降级——不能验证独占所有权就不动（`:957-968`）。
  4. 对含 WAL-reset 损坏 bug 的 SQLite 版本（上游文档至 3.51.2），新库拒开 WAL 宁用 DELETE（#69784/#70055；注释完整记录了"门控被误删后又按 3.50.4 实测恢复"的审查过程）。
  - macOS 另有 `fullfsync=1` checkpoint 屏障（WAL 默认 synchronous=FULL 在 Darwin 不发屏障，`:746-795`）。
  - `require_wal=True` 给宁可响失败不跑降级档的场景；SessionDB 与 kanban_db 共享同一函数保证行为一致。
- 有效性：每个分支挂 issue。
- 价值：工程可信/L1 — grok-build 状态库跑在容器卷/NFS/WSL 上的降级正确性。
- 吸收：rusqlite `PRAGMA journal_mode=WAL` 包一层：比对返回模式识别静默拒绝 + 磁盘头探测 + 版本闸。
- 成本 M；风险：低（保守方向）。优先级 **P0**。

### F29. 压缩跨进程租约（DB 锁而非文件锁）
- 源：`hermes_state_common.py:327-369`（`compression_locks` 表 + expires 索引）、`hermes_state.py:5190-5330`（refresh/try_acquire/release）、`:4639-4704`（发布前租约校验）
- 机制：上下文压缩跨进程互斥用 SQLite 表租约：holder 身份 `pid:tid:nonce`（诊断可查），TTL 300s。
  - 获取：过期行先 compare-and-delete（`DELETE ... WHERE holder=? AND expires_at=?` 校验 rowcount==1，防并发竞态），再 `INSERT OR IGNORE` + SELECT 验证持有——INSERT 幂等，所有权以 SELECT 为准（`:5289-5297`）。
  - 持有期间 `refresh` 续期（UPDATE rowcount 判成否，`:5221-5225`）。
  - 压缩结果发布前**校验租约仍属己且未过期**，否则抛 `CompressionSessionBusyError` 拒绝发布（`:4696-4704`）。
  - 释放仅当仍持有——防迟归压缩器覆盖他人新锁（`:5324-5330`）。
  - 持有者崩溃靠 `expires_at` 自然回收（`:5188-5189`）。
- 有效性：锁与业务同库，天然随 WAL 一致；holder 可诊断。
- 价值：工程可信/L2 — grok-build CLI 与 Hub 并发压缩同一会话的互斥；比文件锁多"随库一致 + 可诊断"。
- 吸收：同 schema 移植 rusqlite；holder = `pid:tid:uuid`。
- 成本 S；风险：低。优先级 **P1**。

### F30. 密封测试不变量 + trajectory 压缩首末保护
- 源：`tests/conftest.py:1-60`（四条不变量 + 导入期日志沙箱）；`trajectory_compressor.py:94-98`（保护配置）、`:334-340`（算法）、`:477-523`（`_find_protected_indices`）；`datagen-config-examples/trajectory_compression.yaml`
- 机制（测试侧四不变量）：
  1. 每个测试前剥光一切凭据形 env（`*_API_KEY/_TOKEN/_SECRET/_PASSWORD/_CREDENTIALS` 等）。
  2. HERMES_HOME 指 per-test tempdir（不重定向 HOME——那曾弄坏 CI 子进程；`Path.home()/".hermes"` 用法算调用点 bug）。
  3. TZ=UTC/LANG=C.UTF-8/PYTHONHASHSEED=0 确定性运行时。
  4. 禁 HERMES_SESSION_* 继承。
  - 日志沙箱必须在**任何测试模块导入前**生效（`hermes_cli/main.py` 模块级 setup_logging 会把 root logger 挂到真实 agent.log——实测一次测试 run 污染操作员日志 126 条警告）；kanban 写守卫的 deny-list 要在沙箱改写 HERMES_HOME **之前**捕获真实根（#69385）。
- 机制（压缩侧，离线训练数据用但算法通用）：
  - 保护首轮四件（first system/human/gpt/tool，各自可开关）+ 末 N=4 轮。
  - 可压缩区只在头尾保护区之间（头保护取前半索引、尾保护取后半，`:516-523`）。
  - 超预算的中段替换为单条 human summary；边界判断还看压缩窗口前方是否存在边界（`:550`）。
- 有效性：conftest 注释含实测数据与修复编号；压缩配置样例在仓库。
- 价值：工程可信 — 密封测试纪律直接可搬（cargo-nextest env 清洗）；首末保护算法对 grok-build 在线压缩的"保真边界"同样成立。
- 吸收：test harness fixture + `ProtectSet { head: [System,Human,Gpt,Tool], tail_n: 4 }`。
- 成本 S；风险：低。优先级 **P2**。

---

## 不吸收清单（含理由）

| 项 | 源 | 理由 |
|---|---|---|
| `GatewayRunner` 28k 行 god object | `gateway/run.py`（28226 行） | 单类承载路由/缓存/drain/恢复/slash 命令，是 hermes 最大的维护负债（docs/session-lifecycle.md 自述 run.py "~16800 lines"还在涨）。grok-build 应保持 Hub 各面拆分，只吸收其机制不吸收其聚合。 |
| `AIAgent` god object + 8.3k 行 `run_agent.py` / 18.9k 行 `cli.py` | `run_agent.py:412`、`cli.py` | 同上；hermes 自己靠 `agent_init`/`conversation_loop` 外置缓解。Rust 侧应按职责 crate/模块划分。 |
| 11k 行 `hermes_state.py` mixin 巨类 | `hermes_state*.py`（11165 行） | 四文件 mixin 仍是单类；吸收其 schema 与纪律（end_reason/WAL/租约），组织方式按 rusqlite migration 分层重做。 |
| sessions.json + JSONL 双写遗留路径 | `gateway/session.py:1282-1420` | 纯迁移负担（legacy import/去重/prune 对账/损坏条目跳过）。grok-build 无历史包袱，SQLite 单一事实源起步。 |
| `DaemonThreadPoolExecutor` | `tools/daemon_pool.py:1-64` | Python 特有补丁：绕 `concurrent.futures` atexit 无条件 join 楔死退出。Rust/tokio 无此问题；其原则（best-effort 工作不得阻塞进程退出）在 tokio 下用 `JoinHandle` 放弃语义天然满足。 |
| AST 静态扫描发现工具 | `tools/registry.py` discover_builtin_tools（见线索文档 §3.3） | Python 动态导入特有；Rust 用 `inventory` crate / 链接期注册 / feature gate 更简洁安全。 |
| fork = `copy.deepcopy(AIAgent)` | `agent/background_review.py:755-830` | 依赖 god object 可深拷贝；Rust 应显式构造"快照 + 新运行时"（克隆 Arc 配置 + 消息切片），不追求通用深拷贝。 |
| 22 个 IM 平台适配器本体 | `plugins/platforms/*` | grok-build 无 IM 渠道需求；只吸收 F12 的契约形状作为未来扩展位。 |
| 运行时 pip 懒安装语义 | `tools/lazy_deps.py` | Python 生态特有（venv/pip）；Rust 按 F26 转译为 feature-gate + 受信渠道下载原则，不实现运行期包管理。 |
| hooks 直接加载任意 `handler.py` | `gateway/hooks.py` | 安全弱点（任意代码进网关进程）；grok-build 用外部进程/WASM 隔离替代（见 F27）。 |
| s6/docker entrypoint 矩阵 | `docker/`、`nix/` | 部署形态专属；grok-build 按自身分发渠道（单二进制 + 可选 systemd unit）重做，仅借鉴退出码契约（F4）。 |
| billing/credits/nous portal/xai 迁移提示 | `agent/billing_*.py`、`credits_tracker.py` 等 | 厂商商业化成分，与 OS agentic 无关。 |
| croniter 依赖本体 | `cron/jobs.py:44-58` | 吸收其懒加载思想，实现用 Rust cron crate（`croner`/`saffron`）。 |
| Python GIL 时代的线程局部输出静默 | `agent/thread_scoped_output.py` | 机制本身（fork 线程静默主通道）随 F19 吸收，但实现应换成 tokio task-local/显式句柄，不搬线程局部模式。 |

---

## 对 grok-build 现状的落点映射

| grok-build 现状 | 可吸收特性 | 说明 |
|---|---|---|
| Leader 常驻种子 | F1 F2 F3 F4 F7 | Leader 即 daemon：sd_notify/环外看门狗/死亡取证/单实例接管/健康面一套配齐 |
| Hub WS 多客户端 | F5 F8 F16 F17 | 崩溃恢复状态机 + 全局索引 + 回复不丢账本 + 同会话轮次串行 |
| ACP / serve 模式 | F12 F20 | 表面契约（check/ensure 分离）+ 审批身份任务局部化（GHSA 教训） |
| Landlock/bwrap 沙箱 | F13 F14 F15 | 沙箱内执行的环境一致性（快照/CWD/限流）+ 后台进程登记与熔断 |
| 全局+workspace 记忆 | F11 F18 F19 | 冻结快照 + 投毒扫描；策展不变量；轮后反思 fork 不污染主会话 |
| fsnotify | F21 | 文件事件驱动的任务若可调 shell/排任务，需自毁守卫同构物 |
| Computer Hub | F12 F15 | 新表面按 manifest 契约接入；长任务走进程注册表 |
| 模型调用层 | F22 F23 F24 | 分类学驱动 fallback + 凭据池 + 辅助任务廉价路由 |
| MCP/工具注册 | F25 F26 F27 | generation 缓存失效 + override 闸 + 供应链原则 + hooks 桥 |
| 状态库 | F28 F29 F30 | WAL 阶梯 + 压缩租约 + 密封测试纪律 |

## 建议吸收顺序

1. **第一阶段（地基，P0）**：F28 WAL 阶梯 → F8 SessionDB → F4 进程权威 → F2 环外看门狗 → F5 崩溃恢复 → F6 缓存压力 → F15 进程注册表 → F22/F23 分类学与凭据池 → F9 FTS+CJK。
   此阶段结束 grok-build 具备"可信常驻 + 可检索 + 可失败转移"。
2. **第二阶段（跨域与治理，P1）**：F11 记忆快照 → F10 cron → F13/F14 执行环境 → F16/F17 投递账本与轮次租约 → F18/F20/F21 治理三件 → F25/F29 → F1/F3 收尾。
3. **第三阶段（生态与运营，P2）**：F12 表面契约 → F19/F24/F26/F27 → F7/F30。

## 优先级汇总

- **P0**（10 条）：F2、F4、F5、F6、F8、F9、F15、F22、F23、F28 —— OS-level 地基：不楔死、不双开、崩了能续、内存有闸、状态可查可搜、后台进程有登记、失败会分类、凭据会轮换、WAL 会降级。
- **P1**（13 条）：F1、F3、F10、F11、F13、F14、F16、F17、F18、F20、F21、F25、F29。
- **P2**（7 条）：F7、F12、F19、F24、F26、F27、F30。
- **P3**：无（本轮抽取均至少 P2）。
