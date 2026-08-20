# 集成施工计划(批次 Q):策略核 → daemon/shell 接线

> PRD §7 路线图(P0–P3)已全部闭环:十枚策略核 529 单测+14 棘轮件全绿。
> 但运行时(daemon/shell)尚**未依赖任何策略核**——daemon 内仍是 P0 内联
> 实现(orchestra.rs 469 行/steward.rs 132 行/approval.rs 138 行)。
> 本计划 = 把核接进运行时,使核成为单一真相,daemon 保持薄编排(OC-F28)。

## §0 摸底结论(2026-08-19,只读)

**依赖方向现状**:`nofy-daemon` 的 `[dependencies]` 无任何策略核;反向有
三处核→daemon 的类型复用(orchestra/stewardcore/marketplace 依赖 daemon 的
`pack`/`ApprovalBroker` 等运行时件)。接线方向 = daemon 委托核,删除内联重复。

**daemon 接缝清单**(src/):

| 模块 | 现状 | 对应核 |
|---|---|---|
| `daemon.rs` | 装配:boot 链+控制面 serve_connection | (装配层,接线目标) |
| `approval.rs` | ApprovalBroker 往返机制(condvar) | governance 已消费(gateway);保留 |
| `orchestra.rs` | P0 编排 OrchRun(469 行) | nofy-orchestra(replay/dag/batchapproval/taskjournal) |
| `steward.rs` | confined batch=单审批单元(132 行) | nofy-stewardcore(roots/lease/mgmt/tombstone/trust) |
| `pack.rs` | manifest+realm(核已复用) | nofy-marketplace(创作门/审计) |
| `proc.rs` | 进程注册 | nofy-scheduler registry(FR6.1)+ runtimecore |
| 其余(eviction/forensics/health/live/recovery/search_proxy/provider/sd_notify) | P0 运行时件 | 不动(非核覆盖域) |

**shell 侧**:体量大、依赖多,接线放最后(Q5),仅列 seam 不展开。

## §1 批次结构

| 批 | 范围 | 出口 |
|---|---|---|
| Q1 | governance 接线:控制面审批边界过 envelope/lifeguard;preauth 预算守卫连接;presets/cas 供配置路径 | daemon 审批往返经真信封验证+自毁拒;64 测试保持绿 |
| Q2 | steward 接线:steward.rs 委托 stewardcore——root 分类/租约加载期拒/两阶段 intent/墓碑 | AC-12 运行时路径经核复验 |
| Q3 | orchestra 接线:submit_run 委托 nofy-orchestra——装载 fail-loud/goal fold/DAG 派发/批审批经 ApprovalBroker | P1 回放等价性在 daemon 层复验 |
| Q4 | scheduler 接线:daemon 增调度服务模块消费 scheduler 核(catch-up/cron/fence/idle 门控) | 调度路径 default-off 可演示 |
| Q5 | shell 侧 seam:memory 注入/injection 三档、env 快照、cwd 标记、worker 路由、boot 自检;webhook/IM 表面 | 逐 seam 绿,shell 回归不破 |

## §2 纪律(与 P1/P2 同款 + GitNexus 实装)

1. **改任何既有符号前**:`gitnexus_impact({target, direction: "upstream"})`,
   向用户报爆半径;HIGH/CRITICAL 先警告后动。
2. **提交前**:`gitnexus_detect_changes()` 核对影响范围。
3. **daemon 只薄不胖**:OC-F28 棘轮 daemon cap 3707——接线以内联逻辑换核
   委托,行数应降;升必须有理由注释。
4. 测试驱动已发货代码:daemon 测试走核,不留平行实现。
5. 双跑确定性;default-off/零新增出站保持。
6. 每批独立提交,批边界可停。

## §3 风险与裁定

- **R1 循环依赖(精确摸底)**:
  - orchestra 核 → daemon:`pack::*`(compile/project/replay/delegation)+
    `orchestra::{ProjectManifest, ManifestError, OnFail, OrchRun, SettleOutcome}`
    (project/replay,均 P0 类型);
  - marketplace 核 → daemon:仅 `pack::*`(exemplars/realmcheck);
  - governance 核 → daemon:仅 gateway **测试**内 ApprovalBroker(dev 性质);
  - governance 核 → orchestra 核:caps(identity);stewardcore 核 → orchestra 核:
    suggestions。
  **裁定 = 批次 Q0 解环(接线前置)**:
  1. **Q0a pack 下沉**:新 crate `nofy-packcore` 承接 pack.rs 全部类型与
     parse/compose/builtin;daemon 原 `pack` 模块改为再导出(现有调用方零
     破坏);marketplace/orchestra 改依赖 packcore。
  2. **Q0b 编排类型归属**:P0 编排类型(ProjectManifest/ManifestError/OnFail/
     OrchRun/SettleOutcome)移入 nofy-orchestra 核(核成为单一真相),daemon
     orchestra.rs 改再导出+只留运行时件。orchestra 核自此不依赖 daemon。
  3. **Q0c governance→daemon 降为 dev-dependency**(仅测试用)。
  Q0 后依赖 DAG:daemon → 核 → packcore,无环;Q1–Q4 直接接线。
- **R2 shell 体量**:Q5 按 seam 切片,每片独立绿。
- **R3 行为漂移**:接线前后 daemon 既有 64 测试必须同绿;核语义与内联实现
  冲突时,以核为准(P1/P2 已对账 PRD),内联实现让位。
- **R4 Q0 动既有符号**:pack/编排类型是 daemon 高扇入符号,逐符号
  `gitnexus_impact` 报爆半径后再动;再导出层保证 d=1 调用方零改动。

**计划立。下一步 = 批次 Q0(解环)→ Q1。**

## §4 批次 Q5 裁定(2026-08-19,第一性原理)

**摸底事实**:shell 深层机制各有成熟自架构——compaction 是 SessionActor
方法块(跨 acp_session.rs/compaction.rs/helpers,消费 nofy-chat-state)、
task_completed_frame 是 ACP 帧预算(与上下文注入是**范畴不同**的两件事)、
spawn 环境在 acp_session_impl/spawn.rs、nofy-env 只是端点预设;nofy-http
是客户端件,无 webhook 服务端接缝。强行把核塞进深层机制=高风险或测试
表演,两者皆违反既定纪律。

**裁定**:Q5 切两片——
- **Q5a(已执行)**:daemon 表面网关 `surfaces.rs`——webhook 三道门→
  审批应答进 broker、IM 卡片出/应答解析进 broker(FR13.3/13.4 运行时
  路径,与 Q1–Q4 同款薄接缝,6 测试驱动真代码)。
- **Q5b(本节)**:shell 深接缝**识别在案、专项跟进**,不在本批硬接:

| seam | shell 位置 | 核 | 接线所需 |
|---|---|---|---|
| 压缩七维+头尾保护 | session/compaction.rs + helpers/session_compact | memorycore compact/seal | 在 build_compacted_history/CompactionOutcome 处加头尾保留与密度策略钩子;需 SessionActor 专项设计 |
| 工具结果三档注入 | agent/handlers→会话历史构建(非 task_completed_frame) | memorycore injection | 先追踪结果入上下文的真实路径,再定阈值接线点 |
| spawn 环境快照+擦洗 | session/acp_session_impl/spawn.rs | runtimecore envsnapshot/workerroute | 环境捕获处接 staged→publish 原子发布+白名单擦洗 |
| 启动体检 | agent/init.rs 启动路径 | runtimecore bootcheck | 清单化启动检查,失败阻断/降级语义 |
| cwd 带内标记 | session cwd 变更路径 | runtimecore cwdmark | 定位 cwd 变更事件源 |

每处均需独立 impact 分析+专项测试设计;列为集成后续工作,不属本计划批次。

**§4 补记(批次 T 后,调度器实例化裁定)**:daemon `run()` 不实例化
`SchedulerService`——控制协议(`nofy-control-schema::ControlMethod`)尚无
任何调度方法,实例化一个永远 default-off 且无启用路径的服务=死接线/测试
表演。调度器的 daemon 级实例化与「调度控制协议批次」(schema 方法+wire
分派+shell 客户端)一并落地;服务层持久化(R3 recover)已就绪待接。

**§4 补记(cwd 接缝摸底结论,批次 T 后)**:cwd 变更的**生产事件源不存
在**——基础设施全部就绪但无触发者:
- 载体:`ConversationItem::working_directory_switch(content, generation)`
  = 合成 user 项(`SyntheticReason::WorkingDirectorySwitch` +
  `cwd_generation`,nofy-sampling-types/src/conversation.rs:164/1040);
- 账本:chat-state actor 严格追加(`AppendWorkingDirectorySwitchAndAck`,
  generation 匹配=恰一次,actor/mod.rs:130、persistence.rs:155-182);
- 迁移:session relocation 全套(`RelocationRequest{source_cwd,
  target_cwd, cwd_generation, pending_reminder}`、stage/commit/rollback、
  summary.json 暂存 `PendingCwdSwitchReminder{cwd_generation,previous_cwd,
  destination_cwd,content,destination_project_instructions}`、启动恢复
  `recover_session_relocations_in`,storage/relocation/mod.rs +
  session/persistence.rs:2988)。
- 全 workspace grep:`RelocationRequest` 构造与
  `append_working_directory_switch_and_ack` 调用**仅见于测试**。
**裁定**:cwdmark 接线阻塞于 shell 侧功能本身(触发 relocation 的用户
动作,如 /move 或 cwd 变更检测)。触发者落地时接线点已确定:reminder
`content` 以 `cwdmark::render_mark(CwdMark{seq: cwd_generation, path:
destination_cwd})` 构造,stale 判定走 `is_stale`——策略归核,不再另做
设计。强行先接=测试表演,不做。
**深度摸底补证(explore 子代理,107 次工具调用)**:①渲染侧——switch 项
是合成 user 消息,`content` **逐字**入 prompt(Chat Completions/Responses
两条转换链均不特殊处理),shell 内不存在任何格式串;全仓库唯一此类格式
串即核 `cwdmark::render_mark`,接线点唯一且确定。②generation 由调用方
供给,权威计数器=Summary.cwd_generation,relocation 校验 `+1` 单调,存储
强制非零。③缺失触发者恰两处:relocation 发起者、handle append 调用者
(shell 斜杠命令表无 /cd 类命令,ACP 无 setCwd 方法;pager 侧 /cd
仅仪表盘级——决定新会话孵化地,不切换活动会话 cwd)。④其余 cwd 变化路径均非
会话权威 cwd:terminal 每次执行 cwd、warm shell ShellState.cwd 漂移、
fork 新会话新 cwd(transform_conversation_cwd 文本改写)、子代理 cwd 解
析——不构成 cwdmark 接线面。⑤二发报告补正:另有
`Summary.prompt_display_cwd` 纯展示覆写(改提示词显示的 Workspace
Path,不碰 info.cwd);compaction 按 generation 选项目指令(0→AGENTS.md
提醒,否则 destination_project_instructions)——均非权威 cwd 变化。

**§4 补记(spawn 环境接缝摸底,批次 V 后)**:shell 环境流非单点,共四
条:①会话 spawn 再执行门(CHILD_ENV,spawn.rs:103-121);②工具上下文
session_env=envrc 受信加载(tool_context.rs:268);③agent 启动环境
=claude settings+envrc+color 环境(agent_ops.rs:3562-3579);④子代理
spawn 继承 session_env(handle_request.rs:658)。核侧件已就绪
(envsnapshot staged→publish+dump/parse_dump 注入安全、workerroute
scrub_env 白名单+route 车道+PairLedger)。**裁定**:接线须先指定唯一
权威捕获点与擦洗点(候选:③为捕获、④为擦洗),属专项设计批次;多
头并接=语义混乱,不做。启动体检(批次 V)已落地,本接缝顺位第一。

**§4 补记(批次 W 摸底深化,2026-08-20)**:擦洗点候选④(子代理
spawn)经深读**否决**——FR6.9 的擦洗对象是**出会话 worker 进程**,
而子代理是**子会话**(同一 agent 的委托延伸,完整继承项目环境是设计
而非漏洞;按固定白名单擦洗会剥夺其合法项目环境=功能回归)。全 shell
摸底:workflow host 为进程内 tokio 任务(host_service.rs SpawnAgent
仍走子代理机制),**不存在任何出会话 worker 进程生成路径**——擦洗点
与 cwd 触发者同型:基础设施就绪、对象缺失。**批次 W 执行面收窄为捕
获点半边**:③处 staged→publish 原子捕获+注入安全持久化
(nofy_home/env_snapshot),并解锁 bootcheck 的 EnvSnapshotPresent 检查
项;擦洗半边在案,待真正的 worker 进程生成路径出现再接。

**§4 补记(批次 X 裁定:工具结果三档注入,2026-08-20,87 次调用深
摸)**:FR4.5 的运行时纪律**已被 shell 现有机制实质覆盖**,无诚实接
线点,裁定不接:
- 尺寸纪律在字节源头:terminal 30KB 尾部保留(local_terminal.rs)、
  MCP 20KB 上限(mcp_truncate.rs)、子代理完成输出封顶
  (coordinator_state.rs cap_completion_output)、任务完成帧收缩
  (task_completed_frame.rs shrink_record)等 14 处在案;
- 尺寸纪律在上下文装配:请求时裁剪(nofy-chat-state
  request_builder:>50% 上下文占用触发,>4000 字符软裁=头 1500+尾
  1500+标记,≥10 轮龄硬清=占位符)、compaction 丢弃/占位、图片字节
  预算 50MB、413 反应式剥图;
- 「绝不静默丢弃」构造级保证成立:裁剪皆留标记/占位,**盘上是真相**
  (全文按 tool_call_id 存于 chat_history.jsonl,引用可解析);
- 核 API 的两个前提在 shell 均不存在:Summary 档需通用摘要器(只有
  逐工具 concise 输出,无通用件)、Spill 档需带外体存储(盘上日志已
  承担此角色,但请求装配在 nofy-chat-state 基础件内,与既有裁剪策略
  同址必冲突)。
**裁定**:强行接线=重复既有策略或发明新基础设施,两者皆表演。接线点
已确定:通用摘要器或带外 spill 存储出现之日,档判定委托
`memorycore::injection::{select_tier, inject}`;14 处机制清单为证存
档。FR4.5 核策略(batch O)在案,运行时纪律实质满足。
