# 上游同步台账

我们与上游 xai-org/grok-build 无共同 git 历史(物理剔除 xAI 依赖 + 全量改名),
每次上游更新只能人工对照移植。本文档记录基线、流程与**有意分歧**,
让每次同步的摸底成本最小化。

## 基线

| 项 | 值 |
|---|---|
| 我们的移植基线 | 上游 1.0.4 |
| 已同步到 | 上游 1.0.8(2026-08-26,批1–批12);1.0.9/1.0.10 同步进行中(批13 起,上游落点 77cd7eb) |
| 上游克隆 | `/tmp/grok-upstream`(丢失时 `git clone https://github.com/xai-org/grok-build`) |
| 对照工具 | `scripts/upstream_diff.sh`(命名归一后 diff;`--changed <tag>..` 列改动面) |

## 标准流程(每批)

1. `scripts/upstream_diff.sh --changed <上次同步点>..` 摸清改动面,按自包含程度分批
2. 每批:读上游 → 归一移植(`xai*` → `nofy*`,见脚本内映射表)→ 核对依赖 → `cargo check`
3. `cargo test` 相关 crate(基线:shell ~5242、pager ~8100、hooks 202+13)
4. `gitnexus_detect_changes(scope:"all")` 核对变更范围
5. 提交(中文信息)→ 并行 `npx gitnexus analyze` + `NOFY_VERSION=x.y.z cargo build --release -p nofy-pager-bin`
6. 安装 `cp target/release/nofy ~/.local/bin/nofy` + 冒烟 `nofy -p "只回复两个字:正常"`

## 有意分歧(上游有、我们不移植/简化)

摸底时先查这张表,命中即跳过,不要重复评估。

| 上游特性 | 我们的状态 | 原因 |
|---|---|---|
| remote_sync / 云同步 | 无 | 随 xAI 账号体系剔除 |
| remote_settings / requirements 特性钉选 | 简化为 `BoolFlag: env > config > default` | 远端设置拉取已剔除 |
| 计费/付费墙/账单 | 无 | 物理剔除 |
| xAI 登录流 | 无,BYOK(DashScope 等 OpenAI 兼容端点) | 物理剔除 |
| 媒体生成/网页搜索/语音工具 | 无 | 物理剔除 |
| 状态栏(status line) | 已移植 | 批12(aee2fe61,0.2.147) |
| feedback_manager(退出反馈上传) | 无 | 依赖云上传;相关测试引用时裁掉 |
| 遥测 activity gauges(SUBAGENTS_ACTIVE 等) | 已移植 | 批14(554647cb,0.2.149):activity 模块整体移植+六路接线+事件 metadata 合并 |
| startup tracing span 机制(span_table/phase_span/subphase_span/root_span) | 无 | 批14 有意跳过:只移 subphase 时序,保持 PhaseSnapshot 路线;startup.rs 相关上游代码不纳入 |
| two-pass 压缩遥测字段(TwoPassOutcome/segments/compaction_mode) | 无 | 未移植 two-pass 压缩,遥测字段随之不引入 |
| 遥测 Clone* 事件(CloneSession* 等) | 无 | 批14 有意跳过:依赖云会话克隆特性 |
| auto_mode 测试断言放宽(上游 1.0.10) | 保留严格断言 | 批16 跳过:实现未变,上游仅放宽测试 pin |
| turn.rs round 式 goal 循环重构(GoalRoundDecision 外的上游回合结构) | 保留现有循环 | 上游 turn.rs 大重构的一部分;我们的循环语义等价,让位/续跑门控已按上游逻辑移植 |
| session registry 标题同步 | 无 | 依赖 registry 服务 |
| 权限 Always/Never | 已移植 | 批9(3fe2d814,0.2.144) |
| attempt_store 子代理恢复台账 | 已移植 | 批10(09c96a05,0.2.145) |
| MCP elicitation | 已移植 | 批11(b3778c3f,0.2.146) |
| 双向文本(阿拉伯/波斯) | 无 | 低优先 |

## 移植时的常见适配点

- 记忆 flush 提示词:上游在 `xai-grok-memory/src/flush.rs`,我们在 `nofy-shell/src/session/helpers/memory_flush.rs`(FLUSH/FLUSH_DELTA 两提示词同文件)
- 遥测 startup.rs 测试基建(批14):上游有 `SERIAL` 串行锁+`reset_for_tests()`,我们原本只有单个整体生命周期测试;移植新测试时已补齐,既有生命周期测试也要拿锁+重置
- nofy-shell `agent/session_metrics.rs` 是遥测事件的 re-export shim:遥测新增导出项要同步补,否则编译错(批14 漏 `SessionStartKind` 曾致编译失败)
- MCP 失败提醒(批15):`retries_on_use` 判定保留 Nofy 分歧——`nofy_com_` 前缀托管连接器走 managed-mcp 代理,「下次工具调用自动重试」提示不适用(上游无此排除,因其无托管连接器机制);`mcp_server_name` 我们走 `session::managed_mcp` 路径(上游同);上游对 mcp_connecting_reminder/reminder_policy 测试断言的放宽不移植(实现未变,保留严格断言)
- 权限/信任(批16):上游 `permissions.rs`/`folder_trust.rs` 带 remote 设置通道参数(`remote_permission_mode`/`RemoteSettings`),我们已剥离,签名需降维适配(只留本地配置维度);`effective_auto_for_launch` 第三参 `unset_default` 由调用方按场景传(headless 传 Ask、TUI 传 `default_interactive_permission_mode()`);echo 等命令入安全清单自动放行后,依赖「权限必询问」的测试探测命令要换成脚本路径(上游同改)
- `log_prompt_cache_usage` → 我们是 `log_prompt_cache_hit`(side_call.rs)
- `AuxCall` 无 `hosted_tools` 字段
- `strum` 依赖:我们不引入,枚举改手写 `as_str` + 显式变体列表测试
- 测试字面量(SessionActor/AppView 等)新增字段时,用脚本批量补 12+ 处测试构造点
- 上游 `CancellationCategory` 在 `session::events`,我们在 `nofy_file_utils::events::types`
- 上游 grok_build 工具路径 → 我们 `nofy_build`
- 上游 `_x.ai/` wire 方法前缀 → `_nofy/`
- 队列策略移植(批8-4):上游 `trace_gcs_config`/`artifact_tracker`/`tool_overrides_update` 字段一律裁掉;`goal_tracker.lock().status()` 两侧同构可直接用;`combine_edit_holds: HashSet` → `edit_holds: HashMap<String, Instant>` + `EDIT_HOLD_TTL`(10 分钟)+ `expire_older_than` GC
- goal steering 移植(批8-5):steer 缓存是进程级静态,翻动它的三个测试要加串行锁(`STEER_CACHE_TEST_LOCK`)防竞态;e2e mock 从 prompt 反引号 `.md` token 取计划路径(`plan_path_from_prompt`),不能写死 `/plan.md`(planner 现在写暂存文件 `plan-<uuid>.md`)
- 权限 Always/Never 移植(批9):上游 `xai_grok_paths`→`nofy_paths`、`xai_grok_agent`→`nofy_agent`(state.rs 仓库根作用域);本机 `~/.claude/settings.local.json` 有真实规则,.resolution_tests 里 15 个全局层测试要补 HOME 隔离守卫(上游 CI 干净不需要);`ToolInput::from(EditInput)` 我们映射到 `Dynamic`(上游映射 `SearchReplace`),types.rs 动态测试断言随之调整;`permission_prompt` 通知钩子:管理器接线(`wire_permission_prompt_notification`)与 tool_calls 内联分发二选一,两者都留会双发;钩子事件 wire 方法是 `nofy/hooks/event`(测试里别写 `x.ai/`);`remember_tool_approvals` 默认翻转为 ON(`DEFAULT_REMEMBER_TOOL_APPROVALS`),pager 默认值测试/开关方向全部随之翻转;上游 pre_tool_use `updatedInput` 钩子改写特性未移植,其测试不纳入
- attempt_store 移植(批10):上游整包替换会把 waterfall/activity telemetry/backend-search/tool-overrides 等其他批次特性一起拖进来,必须外科手术——只移植台账基座(`attempt_store/` 15 文件,上游自身即 `#[allow(dead_code)]` 基座)+孤儿恢复加固(heal_lock 每会话串行、persist_running_meta_as_finish 先写盘再广播、orphan_reason 参数化、`reconcile_live_orphaned_subagents`+notification_drain 30 秒节流接线);锁经 RetainedResources→session_registry→ToolContext 传递;测试 wire 断言 `nofy/session_notification`(sed 别误伤 `api.x.ai` 测试 URL)
- MCP elicitation 移植(批11):上游 `servers.rs` 与我们分叉 2800+ 行,只能外科手术(elicitation_tx 槽位、`ElicitationComplete` 事件、handler 两个 trait 方法、ClientInfo 能力通告);`make_client_info` 加 `advertise_elicitation` 参数后 4 处测试夹具要补第二参数;协议版本保持我们的 `V_2025_06_18` 不跟上游 `V_2025_11_25`(与 elicitation 正交);协调器非交互标志用 `startup_hints.non_interactive` 构造 `Rc<Cell<bool>>`(我们没有上游的动态 attach 流);leader 重放层、headless ext_method 应答路径我们不存在,相应上游代码不纳入;`restore_card_prompt` 必须补 question 打开分支(草稿移交 question 的 stash,否则 peer-resolved 测试失败);上游 key_owner 里的 feedback 面板/line-viewer 排名调整/取消面板语义变更属于被剔除或其他批次特性,不随批移植;测试注入时注意区块边界,别把下一个测试的头切进来
- 状态栏移植(批12):新增 `nofy-status-line` crate(配置+上下文载荷+能力常量 `nofy/statusLine`);shell 侧 `StatusLineContext` 快照经 `SessionStatus` 通知发出(只发不落盘),`status_line_enabled: Arc<AtomicBool>` 贯穿两条 spawn 路径,压缩/回合结束/模型切换处 `emit_status_snapshot_detached` 唤醒,fs_watch git 分支变更联动;pager 侧 app 拥有 `StatusLineState` 状态机,命令型行走 `Effect::RunStatusLineCommand`/`TaskResult::StatusLineCommandFinished`,事件循环接刷新定时器+resize 队列+tick 需求;**未采纳**上游 `AgentViewLayoutParams` 布局重构(保持位置参数 `AgentViewLayout::compute`,只插入 `status_line_height` 一个参数)与语音字段;我们无 leader 层,相应接线跳过;`transcript_path()` 换成 `session_dir().join("updates.jsonl")`;宿主机 `NO_COLOR=1` 使 `quantize` 返回 `Color::Reset`,颜色断言要包 `crate::theme::color_support::detect().has_color()` 守卫(结构断言保持无条件);`include_str!` 引用的 `docs/user-guide/25-status-line.md` 必须随批移植;`try_get_estimated_total_tokens` 返回 `Option<u64>` 不做 `unwrap_or(0)`

## 已完成批次日志

| 批次 | 提交 | 内容 | 版本 |
|---|---|---|---|
| 批1 | 23413806 | 剥图持久化 | 0.2.134 |
| 批2 | 2882a728 | 压缩请求图片预算 | 0.2.135 |
| 批3 | 3a06e55a | 子代理 429 等待 | 0.2.136 |
| 批4 | 3a04656d | 启动/退出加固 | 0.2.137 |
| 批5 | 5a0b47d8 | 子代理生命周期去重 | 0.2.138 |
| 批6 | 428d235c | 会话加载屏障 | 0.2.139 |
| 批7 | d5ef2f8f | 回合结束钩子上报(StopCancelled+epoch 状态机) | 0.2.140 |
| 批8-1 | c0f28872 | 工作流列表+命名参数+effort | 0.2.141 |
| 批8-2 | 47a7a422 | 标题自动刷新(3/6 回合) | 0.2.141 |
| 批8-3 | e570b82b | 进程内 /minimal⇄/fullscreen | 0.2.141 |
| 批8-4 | 2077fc9b | 队列策略架构:InputPolicy/QueuePolicy 类型、queue_mutation 授权、edit_holds TTL 乐观锁、HoldEdit promote 阻塞、受保护行 | 0.2.142 |
| 批8-5 | 2da01b78 | goal steering:planner 转向循环(5 次上限+目标身份守卫+原子暂存)、队列并入活跃 goal、promote_queued_as_interjections、goal 回合让位、follow_up_behavior 配置+pager 设置 | 0.2.143 |
| 批9 | 3fe2d814 | 权限 Always/Never:manager/bash_grants 作用域持久化、state 仓库根存储+deny 集、resolution MCP URL 结构化匹配、prompter Never 行、pager 分行作用域 UI、permission_prompt 管理器接线、remember_tool_approvals 默认 ON、sessions 目录 0700 | 0.2.144 |
| 批10 | 09c96a05 | attempt_store 台账基座(15 文件)+孤儿恢复加固(heal_lock 串行/先写盘再广播/存活会话 30s 节流治愈)+12 个 reconcile 测试 | 0.2.145 |
| 批11 | b3778c3f | MCP elicitation:tools schema/校验模块、mcp 桥接层+servers 外科接入、shell 协调器+dispatcher completes、pager 表单/URL 卡片全链(键鼠/粘贴/Esc 阶梯/渲染)+35 文件 | 0.2.146 |
| 批12 | aee2fe61 | 状态栏:新增 nofy-status-line crate、shared [ui.status_line] 配置、telemetry 两事件、shell 快照发射器+通知+唤醒联动、pager 状态机/布局行/渲染/命令型行/刷新定时器+73 文件 | 0.2.147 |
| 批13 | 2a628c92 | 记忆精化(上游 1.0.9):dream/flush 提示词泛化+细节接地、注入段与 memory_get/search 描述加「历史上下文,用前核实」;我们的 memory_context 双参+可信扫描结构保留,只移措辞;注意上游 flush 在我们树中位于 shell/helpers/memory_flush.rs | 0.2.148 |
| 批14 | 554647cb | 遥测地基(上游 1.0.9/1.0.10):activity gauges 模块整体移植+六路接线(子代理/压缩/MCP 连接/回合/工作流/会话)、事件 metadata 活动计数合并、StartupComplete→StartupCompleted+6 subphase 计时字段、startup.rs Subphase 时序机制(不含 span)、InstrumentationTimer::with_subphase、StartupPhase 改名(ConfigLoad/WorkerSpawn)、SessionStarted 增 kind/setup_duration/restored_from_disk、新事件 CancellationCompleted/EventLoopStall、MCP ClientState::Ready 持连接 gauge、pager prefetch/首帧计时;跳过 Clone* 事件/two-pass 字段/span 机制;测试基建补 SERIAL 锁+reset_for_tests | 0.2.149 |
| 批15 | f2ad859a | MCP 失败提醒集群(上游 1.0.10):McpAnnounced episode 状态机(每失败宣布一次/auth 粘性/配置编辑开新 episode/恢复接管不误宣布)+mcp_failed_reminder 分类渲染模块(单一消毒边界)+mcp.rs 重接线(dirty 提前清+RearmOnDrop+同步 latch_and_push)+rewind/compaction rearm+text_sanitize 欺骗字符压平+announced_failed_servers 持久化(只存分类);Nofy 分歧保留:托管连接器(nofy_com_)不带自动重试提示;跳过上游测试断言放宽(实现未变);顺带修复批H 遗留 benches/session_list 编译错 | 0.2.150 |
| 批16 | 3f20ae9b | 权限修复+信任加固(上游 1.0.10):TrustStore 0600 原子写+workspace_id+同 git 根后代覆盖+has_decision;祖先授权不再级联、撤销对从未信任目录不写 deny;permission/manager 批量屏障与取消路径修复+echo 安全清单自动放行;新增 default_interactive_permission_mode()+NOFY_DEFAULT_PERMISSION_MODE env(未知值忽略防 bypass);load_permission_mode 拆出 load_selected_permission_mode(坏配置显式 Ask);effective_auto_for_launch 增 unset_default(headless=Ask/TUI=交互默认),4 处调用方接线;上游 remote 设置通道签名为本地降维适配;测试探测命令 echo→脚本(echo 已自动放行);跳过 auto_mode 测试断言放宽(实现未变) | 0.2.151 |
