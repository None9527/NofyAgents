# RTAgent-SDK 核心设计思想与 Nofy 接入方案

> 来源：`/home/none/RTAgent-SDK`（Go runtime SDK，v0.0.1）+ 已合并进本仓库的 Rust 移植
> 目的：梳理设计宪法，并给出让它在本项目 runtime 中**实际产生作用**的接线方案
>
> **状态：A→B→C→D 四阶段全部落地**（A resume 对账 `d964695`；B 收敛放权 `0a8476a`/`d2963db`；C WorldState 分区+每轮帧注入+gix dirty 扫描 `e42097d`/`d388290`/`50ad571`/`ae33da6`；D 预算连续性+证据化验证门 `ded82c1`/`8cd33b3`）。全部默认关闭、env 门控灰度：`NOFY_RUNTIME_JOURNAL`、`NOFY_CONVERGENCE_GOVERNOR`、`NOFY_WORLD_STATE`、`NOFY_VERIFICATION_GATE`。

---

## 第一部分：核心设计思想

### 0. 核心判断（一切的起点）

> **模型不是系统本体。模型是 Runtime 中可替换的决策策略组件。**

传统 agent loop 把模型上下文当成整个系统（prompt → model → tool → 追加结果 → model），长任务中必然退化：压缩丢事实、工具输出淹没状态、崩溃后只能从聊天文本猜进度、模型可以声称完成但系统没有独立证据。根因是**系统缺少独立于模型上下文之外的持续现实**。

由此得到四条不可违反的边界：

```text
Runtime owns the authoritative runtime record.   # Runtime 持有运行事实的权威记录
Agent proposes actions.                          # Agent 负责推理并提出动作
World State projects reality.                    # World State 是事实的类型化当前态投影
Context exposes only what is needed.             # Context 是某一轮的局部观察
```

注意严格含义：Runtime 只拥有**运行事实**（观察、批准、执行、提交过的事件），不拥有领域真相——文件真相在文件系统，进程真相在进程管理器，业务真相在远程服务。

### 1. 控制系统视角

Agent Runtime 是部分可观测环境中的控制系统：

| 控制系统 | RTAgent 对应物 |
|---|---|
| 被控对象 | 文件、进程、服务、任务 |
| 传感器 | 工具观察、workspace observer |
| **状态估计** | **World State projection** |
| 控制策略 | Model / Agent |
| 执行器 | Tools |
| 安全治理 | Governance |
| 历史轨迹 | Event Journal |

### 2. 五条原则

1. **事件溯源——journal 是唯一真相**：每个状态变化（run 开始、模型轮次、工具调用、权限决定、会话生命周期）都是不可变事件。由此免费获得：全轨迹回放、确定性投影、无隐藏变更。
2. **WorldState 是动态投影，不是真相存储**：从 journal + host 数据源按需重算，带投影感知缓存。没人直接写 WorldState。内核从不拥有业务真相——内核观察并投影。
3. **agent 从真实投影中自然生长**：内核不决定 agent"知道什么"，host 通过注入 provider 决定。
4. **单线程内核，可扩展地基**：一个可靠 run loop、一个 journal、一个投影引擎、一个权限边界。不内置编排范式（DAG/plan-execute/多 agent 都是上层建筑）。
5. **能力是触手不是内核**：工具、记忆、MCP、skills 都是外部数据源/能力 provider，经 well-defined ports 接入，不编译进内核。

### 3. Event Journal 契约（事实提交边界）

- 同一 run 内事件严格递增 seq；append 用 CAS version；重试命令可识别（幂等 key）
- terminal 事件后不得追加执行事件；append 失败不得静默
- **工具双写问题**（外部副作用 + 事件提交无法原子）：每个工具执行必须带 stable intent ID + idempotency key + attempt ID，且 **transport status 与 outcome status 分开记录**——`error == nil` 不等于工具成功
- **Reconciliation**：崩溃恢复不能只按"journal 里没有成功事件"盲目重放，必须重新确认现实：按 intent ID 查动作是否已生效、按幂等 key 安全重试、不可查询的标记 `outcome_unknown`、由 external observer 重读现实、对账结果作为新事件提交

### 4. World State 设计

> 宽 World State、强分区、强类型、强来源治理。

六个初始分区：`task`（目标/待办/阻塞/完成证据）、`workspace`（变更资源/诊断/验证结果）、`execution`（活动工具/进程/后台任务/重试）、`agent`（worker/分配/租约）、`knowledge`（事实/证据/假设/冲突）、`governance`（权限/审批/预算/中断状态）。

每个 entry 的最小契约：`id / partition / subject / predicate / authority / source / source_sequence / evidence / confidence / freshness`。

Authority 分级：`observed`（直接观察）> `external`（host 真相源）> `inferred`（模型推断）> `policy`（治理决策）——推断不能覆盖更高 authority 的观察，除非产生显式冲突。

关键规则：**Absence of evidence is not evidence of absence**——"没观察到进程"不等于"没有进程"，也可能是 observer 不可用或 snapshot 过期。

### 5. Checkpoint 与恢复

Checkpoint 不是消息备份，是 **continuation contract**：run_id、journal_version、phase、turn/budget 位置、pending intent、幂等 key、world-state watermark、approval 状态。**resume 不是新 run**——turn 计数、工具尝试数、token/时间预算、重试数必须连续，不能靠反复 suspend/resume 绕过预算。

### 6. Terminal Condition

**模型可以提出完成，但不能单方面提交 `run.completed`。** 完成由 host/domain policy 依据结构化证据决定：完成提案 + 必需证据 + 无阻塞活动 + 无待审批 + 领域验收。Terminal policy 必须能表达 `unknown`——证据缺失时进入等待/重试/人工确认，而不是把缺失当成功。

---

## 第二部分：本仓库已合并的内容与现状

| SDK 概念 | 本仓库落点 | 状态 |
|---|---|---|
| Event Journal | `nofy-session-journal`（event/journal/reducer，18 种事件） | ✅ 实现完整，21 测试 |
| 确定性投影 | `reducer::project()`（全量=增量，有测试钉住） | ✅ 验证过 |
| 写路径接线 | `runtime_journal.rs` 装饰器包 chat 持久化 + turn/tool/compaction 10+ emit 点 | ✅ 接通，`NOFY_RUNTIME_JOURNAL` 门控，默认 off |
| Convergence 治理 | `nofy-convergence` BudgetGovernor（Continue/Extend/Finish） | ⚠️ 只观察不掌权（"observe before authority"），默认 off |
| 事实投影 | `nofy-compaction/fact_projection`（压缩时提取事实注入历史） | ✅ **唯一真正影响行为的组件**，默认 off |
| WorldState 分区 | 仅 `SessionRuntimeSnapshot`（计数器+开放意图） | ⚠️ 无分区/authority/freshness |
| Reconciliation | reducer 预留 `open_intents`/`orphan_outcomes` | ❌ 无运行时消费者 |
| Checkpoint 连续性 / Terminal policy / Context Builder | — | ❌ 未合并 |

**一句话现状**：journal 内核真实运转（opt-in），但它是"只写不读"的——投影结果没有反馈进任何运行时决策。

---

## 第三部分：接入方案——让它实际产生作用

按"先读路径、再放权、再分区"排序，每阶段独立可验证、独立开关。

### Phase A：Journal 从记录变依据（打通读路径）

**A1. Resume 对账**（SDK §5.3 的直接落地，价值最高）
- 接线点：`nofy-shell` 会话加载路径（`acp_session.rs` load/resume 处）
- 逻辑：加载会话时读 journal 尾段 → `project()` → 取 `open_intents`（上次崩溃/中断时没有 outcome 的工具调用）→ 对可查询的工具做现实确认（文件类工具查文件状态，进程类查进程存活）→ 结果作为 `reconciliation.completed` 事件提交 → 把"上次做到哪、哪些动作结局未知"注入恢复后的首轮上下文
- 产生作用：崩溃/中断恢复不再从聊天文本猜进度；避免盲目重放已生效的副作用
- 验证：构造"工具已调用未落 outcome → kill → resume"的集成测试

**A2. 孤儿结果告警**
- `orphan_outcomes > 0` 说明 journal 或 dispatch 有 bug——接入 tracing warn + pager 诊断面板
- 产生作用：把"隐性的状态不一致"变成可见信号

### Phase B：Convergence 放权（观察期结束后）

**B1. 决策接入控制流**（当前代码明确标注的 follow-up）
- 接线点：`tool_calls.rs:3594` 的 decision 分支之后
- `Extend { new_soft_budget }` → 真实写回 turn 预算（run_loop 的 max-turns 判定读它）
- `Finish { HardCapReached | NoProgress }` → 触发优雅终止（注入终止提示而非硬截断）
- 前置条件（SDK 作者的设计纪律）：先在 evals 里 A/B 证明决策质量——仓库自带 evals harness，用 `NOFY_CONVERGENCE` 开关分组跑
- 产生作用：长任务不再一刀切撞 turn 上限；无进展任务提前止损

### Phase C：WorldState 分区化（从快照到世界模型）

**C1. WorldState 分区结构**，先做三个有现成数据源的分区（实现方式：`nofy-session-journal::world_state` 独立强类型层 + shell 侧投影器从活动数据源构建，`SessionRuntimeSnapshot` 保持纯 journal 投影不掺现实观察）：
- `workspace` 分区：数据源 = `nofy-gix-status`（git 变更）+ bash 工具的测试/构建输出 → `changed_resources` / `verification_results`
- `execution` 分区：数据源 = 现有 open_intents + 后台任务（monitor/task 工具）→ `active_tools` / `background_jobs`
- `governance` 分区：数据源 = 现有预算/权限系统 → `budgets` / `permissions`
- 每个 entry 带 authority（observed/inferred）+ freshness（observed_at）——从第一天就按 SDK §6.1 契约建，后补代价大

**C2. Context Builder：每轮注入 WorldState 帧**
- 接线点：turn 构建上下文处（system prompt 组装）
- 把紧凑的当前态帧（活动工具、未验证的变更、预算余量、阻塞项）注入模型可见上下文——fact_projection 已证明这条注入通路可行（它注入的是历史事实，这里注入的是当前现实）
- 产生作用：模型每轮看到的不再只是聊天文本，还有系统独立维护的现实切片——这是 SDK 对"上下文退化"的直接回答

### Phase D：Terminal Condition 与 Checkpoint 连续性

**D1. 完成证据化**：模型声称完成时，要求结构化证据（如"测试通过"断言必须对应 journal 里真实的 bash outcome 事件），证据不足返回 `unknown` 让模型继续或请求人工确认——已实现（`8cd33b3`）：`evidence::verification_state` 折叠事件流为 NoMutations/Verified/Unverified（验证只对严格早于它的变更有效、失败不算数），writer task 维护变更/验证 seq 水位且 resume 播种（未验证变更跨重启保持未验证），判定 Unverified 时按变更波次注入一次提醒让模型补验证或说明原因——观察而非阻断，`NOFY_VERIFICATION_GATE` 门控
**D2. Journal-based checkpoint**：resume 时从 journal 恢复 turn/budget 计数，杜绝"重开会话绕过预算"——已实现（`ded82c1`）：`continuity::restore_budget_continuity` 折叠 budget.updated 历史（payload 计数是决策前值，extend +1），resume 时恢复并以 `decision=restored` 重记（幂等），spawn 播种 `convergence_base_limit`/`convergence_extensions_used`。turn 计数本身随 chat history 持久化，无需额外恢复

### 开关与灰度策略（沿用现有纪律）

| Phase | 开关 | 默认 | 灰度方式 | 状态 |
|---|---|---|---|---|
| A | `NOFY_RUNTIME_JOURNAL`（已有）+ resume 对账随 journal 开关 | off | 先内部 dogfood | **A1/A2 已实现**（`d964695`）：reconcile 模块分类开放意图，重开 journal 时提交 reconciliation.completed，需要关注时向恢复后的会话注入 system-reminder；孤儿结果随报告暴露（A2 告警接入待做） |
| B | `NOFY_CONVERGENCE`（已有）+ 放权子开关 | off | evals A/B 通过后放权 | **B 阶段完成**：B1（`0a8476a`）边界 Extend 提高有效上限继续执行；B2（`d2963db`）连续 5 轮无新变更且无在途意图时 NoProgress 早停，由 journal writer 的活动意图实时表提供"无在途"证据，journal 未启用时不放权（观察缺失≠空闲） |
| C | `NOFY_WORLD_STATE` | off | 分区逐个启用 | **C 阶段完成**：C1a（`e42097d`）`world_state` 类型层（六分区、§6.1 entry 契约、§6.2 authority 治理 upsert、§6.3 认知状态）；C1b（`d388290`）三分区投影器接活动数据源（execution=open-intent 实时表+resume 对账现实声明、workspace=agent 写入台账+外部编辑 hunks、governance=收敛预算态）；C2（`50ad571`）每轮帧注入（与 external-edit reconciliation 同接线点，变更检测去重，journal 记录 reminder.injected）；C1c（`ae33da6`）gix dirty 扫描入 workspace 分区（30s TTL 缓存按 git root 键控、spawn_blocking + nofy-gix-status 线程预算、200 路径上限、Authority::External，扫描失败投影为空而非"干净"） |
| D | journal 常开即生效（D2）/ `NOFY_VERIFICATION_GATE`（D1） | off | 场景化验收 | **D 阶段完成**：D2（`ded82c1`）resume 从 journal 的 budget.updated 历史恢复 base_limit + 已用扩展数（extend 决策补偿 +1），以 decision=restored 重记（幂等），spawn 播种收敛计数器——重开会话不再绕过预算；D1（`8cd33b3`）验证证据门——journal 维护变更/验证水位（resume 播种），最后一次文件编辑后无成功验证运行时按变更波次注入一次提醒，观察而非阻断 |

---

## 第四部分：优先级建议

1. **先做 A1（resume 对账）**——它直接解决"崩溃后丢进度/盲目重放"这个用户可感知的痛点，且 journal 写路径已经在记录所需事件，纯增量开发
2. **B 并行跑观察期**——convergence 决策继续积累 eval 数据，达标即放权
3. **C 是中期主干**——WorldState 帧注入是整套设计对 agent 质量提升最大的一环，但工作量也最大
4. D 依赖 C 的 governance/task 分区，放最后
