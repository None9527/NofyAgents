# Runtime 进化:事件 Journal(Phase 1)

> 状态:已实施,`GROK_RUNTIME_JOURNAL=1` 启用(默认关闭)。
> 本方案借鉴 RTAgent-SDK 的"记账 + 感知 + 对账"纪律,详见会话方案文档。

## 目标

把 agent runtime 从"可变状态 + 快照持久化 + 阈值摘要压缩"演进为
"**事件日志为真相 + 投影为感知 + workspace 为对账基准**"的架构。
Phase 1 落地第一部分:会话级 runtime 事件成为 append-only、可回放、可审计的真相记录。

## 架构

```
ChatStateActor ──> JournalingChatPersistence(装饰器)──> ChannelChatPersistence ──> chat_history.jsonl
                        │(旁路事件)
turn.rs / tool_calls.rs / compaction.rs(语义发射点)
                        │
                        ▼
              RuntimeJournalHandle ──(mpsc)──> writer task ──> SessionJournal
                                                                    │
                                                                    ▼
                                            {session_dir}/runtime_events.jsonl
```

- **`xai-session-journal`**(Layer 1,`crates/common/`):事件类型(23 种封闭词汇表)、
  JSONL journal(密集 seq、撕裂尾修复、terminal 门控、256MB 上限)、确定性 reducer
  (`project(events) -> SessionRuntimeSnapshot`)。不依赖任何上层 crate。
- **`runtime_journal.rs`**(shell session 模块):writer task 独占 journal 文件;
  `RuntimeJournalHandle` 为 Clone + fire-and-forget;append 失败只告警不影响会话。
- **并存策略**:与既有 `events.jsonl`(分析级,fire-and-forget)和 `updates.jsonl`
  (UI 协议流)职责分明——`runtime_events.jsonl` 是回放级真相日志(每行 sync_data)。

## 事件词汇(与 RTAgent Kind 对齐)

| 类别 | 事件 | 发射点 |
|---|---|---|
| 生命周期 | session.started / resumed / ended | writer task(open)/ `end_session` 钩子(actor 退出) |
| Turn | turn.started {prompt_index} | `turn.rs::handle_prompt` |
| 模型 | model.responded | (保留词汇,当前未发射;assistant 追加由 history.message_appended 覆盖) |
| 工具 | tool.invoked {intent_id, tool} | `tool_calls.rs` dispatch future 内,**执行前** |
| 工具 | tool.succeeded / failed {intent_id, transport_status, outcome_status, duration_ms} | `tool_calls.rs` 结果循环(最终结果) |
| 权限 | permission.requested / granted / denied | (后续接入) |
| 上下文 | context.compaction_triggered / compacted | `compaction.rs::run_compact_inner` |
| 历史 | history.message_appended {role, synthetic_reason?, tool_calls?} | 持久化装饰器(内容无关,不含正文) |
| 历史 | history.replaced {items_len} | 持久化装饰器(replace_history) |
| 上下文 | reminder.injected | (保留词汇;合成项经 history.message_appended 的 synthetic_reason 覆盖) |

### 关键语义

- **intent_id = tool_call_id**:崩溃时"invoked 无 outcome"即未闭合 intent,
  是 resume 对账(Phase 3)的危险清单。
- **transport vs outcome 分离**:调用链正常返回(transport ok)不等于动作达到
  领域目标(outcome success),例如编辑锚点零匹配。两者分别记录。
- **缺失 session.ended = 非干净停止**:crash 与 clean shutdown 由此区分,
  重开时一律 session.resumed。
- **replace 建模为事件**:`replace_history`(压缩/回退/修复/硬清理)不是纯追加,
  journal 显式记录,回放方不得假设会话只增长。

## 不变量(P0)

1. 同一会话 seq 严格递增、无空洞;
2. append 失败显式报错(写入侧告警 + 丢弃计数),不静默;
3. terminal(session.ended)之后禁写执行类事件,直到 session.resumed;
4. 撕裂尾加载时截断保前缀,中段损坏硬报错;
5. tool.invoked 必须携带稳定 intent_id;
6. transport_status 与 outcome_status 分别记录;
7. 凭据(Credentials)永不进入事件 payload。

## 启用与验证

```bash
GROK_RUNTIME_JOURNAL=1 grok          # 交互会话
GROK_RUNTIME_JOURNAL=1 grok -p "..."  # 单提示词 headless
```

journal 位于 `~/.grok/sessions/<encoded_cwd>/<session_id>/runtime_events.jsonl`。

测试:`cargo test -p xai-session-journal`(crate 不变量)
+ `cargo test -p xai-grok-shell runtime_journal`(接入层,真实文件 I/O)。

## Phase 2:感知层(已实施)

### 2a 投影审计

`xai_chat_state::ProjectionAudit`(projection_audit.rs):每次模型请求在
`build_conversation_request` 末尾(所有剪枝/图片逐出/memory 注入之后)计算
结构化审计——system prompt 在场性(P0 不变量)、合成项普查(按
`SyntheticReason` 分类计数)、history/工具定义 token 估算、本次运行了哪些
变更通道。经 `ChatStateEvent::ProjectionAudit` 转发,session 层以
`model.requested` 事件写入 journal。内容零泄漏(只有计数与指纹)。

### 2b 事实级压缩

- `xai_grok_compaction::fact_projection`(纯函数层):从待压缩轮次提取
  canonical facts——最近用户查询、最近助手响应、最近工具结果、失败工具
  结果(失败标记启发式,有界 3 条)——每条限 2000 字符并带来源索引;
  渲染为 `# Key facts retained by compaction` 块。确定性:同输入同输出。
- `FactProjectingSampler`(shell,full_replace_compaction.rs):包装
  `ShellCompactionSampler`,把事实块**前置**到 LLM 摘要之前,委托
  `take_last_success` 保持遥测链路;失败原样传播,不静默替代。
- 开关:`GROK_FACT_COMPACTION=1`(默认关 = 纯透传)。
- v1 明确不做:utility 打分、MMR、lane 配额——先证明 hard-include 的价值。
- **关键实现细节(已修复的陷阱)**:full-replace 路径构建压缩后历史时,
  用的是 `take_last_success()` 缓存的 `CompactOutput`(内层 sampler 调模型
  后独自缓存),**不是** `sample_compaction` 的返回值。只在返回值上投影会
  让事实块进遥测 artifact 却进不了对话历史。修复:`FactProjectingSampler`
  缓存最后一次事实块,`take_last_success` 委托时前置到 `content`,两条数据
  源携带相同内容。
- **实测**(远程 headless,t05-long-context,35k 窗口模型强制压缩):
  事实块提取 3 条(2555 字符)并进入压缩后对话历史(journal
  `context.compacted` + chat_history 压缩摘要含 "Key facts retained" 块)。
  A/B 首轮:开/关均通过、均触发压缩——qwen3.8-max 足够强,该任务难度下
  保留率无差异;区分度需要更多事实/更长历史的更难任务。

## Phase 3:真相对账(已实施 v1)

`SessionActor::inject_external_edit_reconciliation`(tool_calls.rs):每个工具
批次后、下一次模型请求前检测 agent 写过的文件被外部修改——这个事实
过去只喂 UI,现在注入模型上下文:

- **检测路径 1**(交互模式):HunkTracker 的 `ExternalEditOnAgentFile`
  fs 事件归因;
- **检测路径 2**(模式无关,headless 必需):`ToolContext.agent_write_ledger`
  (通知桥在每次 `FileWritten` 记录 path→写入时间)+ mtime 直查——磁盘
  mtime 严格新于 agent 写入时间(1s 容差)即判定外部修改。此路径不依赖
  fs watch / hunk tracking 能力门控;
- 仅观察,不修改文件、不阻断(RTAgent 纪律);
- 120 秒时间窗限流(v1 无额外状态;长期未接受的变更不会反复提醒);
- 注入 `<system-reminder>` 列出受影响路径,提示先重读再编辑;
- 写 `reconciliation.completed` 事件(路径数)。

**实测**(远程 headless,t04-reconciliation):后台进程每秒篡改 agent 刚
创建的文件,对账在每个工具批次后触发(journal `reconciliation.completed`
+ 对话提醒),任务验收通过。

后续(P3 完整形态):resume 时对 journal 中未闭合的文件类 intent
(invoked 无 outcome)先读文件现状再决定是否重放;scratch/deliverable
路径角色分类。

## Phase 4:收敛治理(已实施纯逻辑层,`xai-convergence`)

仅面向无人值守运行(headless/子代理/workflow),交互模式不做。

- **失败五分类**(`failure.rs`):`invalid_input / path_escape /
  anchor_miss / timeout_inconclusive / runtime_failure`。前四类是
  "世界在反驳"——作为 observation 回传模型继续运行;只有
  `runtime_failure`(传输/调度层崩溃)终止 run。未识别错误保守归为
  可恢复(错误文本模型始终可见,错误续跑比错误早停代价低)。
- **动态预算**(`governor.rs`):hard cap(host 安全上限,绝对)+
  soft budget(工作预算)。边界附近有实质进度(新证据/mutation/验证)
  → 有界延期;连续无进度且无未闭合 intent → 提前收尾;resume 必须
  携带已用延期数(预算连续性,suspend/resume 不能绕过预算)。
- **明确不做**:required-tool 完成门控、强制编辑、action space 收缩
  (RTAgent 反模式清单)。

接入点(后续步骤):headless `max_turns` 决策处与子代理 turn 循环
引入 governor 检查点,进度信号由 `xai-session-journal` 的
`SessionRuntimeSnapshot` 投影。

## 度量回路(Phase 0)与隔离

评测脚手架位于 `crates/codegen/xai-grok-shell/evals/`(README + `run_eval.sh`
+ 固定任务集)。隔离契约:

- **编译**:`CARGO_TARGET_DIR=/home/none/grok-dev-target`(独立目标目录,
  不碰运行中系统的构建产物);
- **测评**:`EVAL_GROK_HOME`(默认 `~/.grok-eval`)独立会话/凭据存储,
  每任务独立 git worktree;
- **远程独立环境**:`none@192.168.31.21`(8 核,已免密登录,仓库同步于
  `~/grok-build`,构建目录 `~/grok-dev-target`)——编译与测评可完全脱离
  本机运行,验证日志 `~/remote-verify.log`。

四项核心指标:任务完成率、崩溃恢复成功率(`--crash-recovery` 模式:
SIGKILL → resume → 验收)、压缩事实保留率(探针任务)、对账检出率(P3 场景)。
辅助度量(轮次/token/工具调用)直接来自 `runtime_events.jsonl` —— journal
在 Phase 0 就作为度量数据源,这是"没有度量不改架构"纪律的执行机制。

## 后续阶段(见全面方案)

- Phase 2:投影审计(`build_conversation_request`)+ 事实级压缩(`CompactionSampler` 确定性投影器);
- Phase 3:workspace 真相对账(HunkTracker + gix-status → system-reminder);
- Phase 4:headless/子代理收敛治理(动态预算、失败分类、open-loop)。
