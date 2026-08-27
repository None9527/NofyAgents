# 上游同步台账

我们与上游 xai-org/grok-build 无共同 git 历史(物理剔除 xAI 依赖 + 全量改名),
每次上游更新只能人工对照移植。本文档记录基线、流程与**有意分歧**,
让每次同步的摸底成本最小化。

## 基线

| 项 | 值 |
|---|---|
| 我们的移植基线 | 上游 1.0.4 |
| 已同步到 | 上游 1.0.8(2026-08-26,批1–批12);1.0.10(2026-08-28,批13–批23 完成,上游落点 77cd7eb) |
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
| listing/template/context/builder 测试断言放宽(上游 1.0.10) | 保留严格断言 | 批17 跳过:模板与实现均未变,上游仅删/放宽脆弱文本断言 |
| pager 区间混入 hunk(record_prompt_in_history/prompt_stash_evicted 删除/draws_a_row 签名、load.rs picker 路由) | 按批拆分 | 批18 跳过:前者属批19,后者属批22 |
| task_status_line spinner→静态菱形(views/agent_status.rs+task_tests+render.rs 调用点) | 无 | 批19 跳过:该特性(任务状态头行,依赖 TaskStatusCounts)未移植到我们树中 |
| render_tests verb-group hook 断言坐标修正 | 无 | 批19 跳过:hook outcome 聚合特性未移植,测试不存在 |
| settings.rs remote 推送参数与 broken_config_ask_fallback(remote 通道) | 本地降维 | 批19 等价适配:我们无 remote 设置通道,软默认回退改走 default_interactive_permission_mode()(与启动一致,尊重 NOFY_DEFAULT_PERMISSION_MODE) |
| pty_auto_mode/shift_tab 两测试删 --permission-mode default pin | 已是最终形态 | 批19 无需改:我们树中这些测试已无 pin |
| cancel_agent_turn 提取 + 子代理覆盖层取消分支(turn.rs) | 无 | 批18 外科适配:上游早期未移植特性,我们保留现有 turn.rs 结构直接接 cancel_and_arm |
| turn.rs round 式 goal 循环重构(GoalRoundDecision 外的上游回合结构) | 保留现有循环 | 上游 turn.rs 大重构的一部分;我们的循环语义等价,让位/续跑门控已按上游逻辑移植 |
| compaction.rs 遥测 hunk(CompactionModeLabel 内联/segments_written→segments_queued) | 无 | 批20 跳过:压缩完成遥测(CompactionCompleteStats/CompactionModeLabel)未移植 |
| two_pass_compaction 默认 false→true(config-types registry+文档) | 已完成 | 批20 暂缓→批23 落地:我们树无 FEATURES registry,等价改动在 `Config::resolve_two_pass_compaction` 默认值翻转(含优先级测试与文档同步);上游 1.0.10 已全量默认开启 |
| plan_mode.rs/enter_plan_mode/exit_plan_mode/revise_plan_message 测试断言放宽 | 保留严格断言 | 批20 跳过:模板与实现均未变,上游仅删脆弱文本断言(同批16/17 方针) |
| session_setup.rs sessionKind/is_headless(parse_client_session_kind 等) | 按批拆分 | 批20 跳过:属批21 会话列表/搜索架构;SessionStarted 计时部分批14 已移植 |
| 27-grok-clone.md 用户指南(docs.rs include) | 无 | 批20 跳过:Grove 深度克隆为云特性文档 |
| sampling 信号量/compaction pins 的 remote settings 层(subagents_sampling_limit/compaction_mode remote 参) | 本地降维 | 批20 等价适配:resolve_sampling_limit/resolve_compaction_mode 去掉 remote 参,走 env>config>default |
| sampler_turn_tests 基线测试(classifier reserve/cutoff 回显) | 无 | 批20 只移植新门控测试:基线测试依赖的 classifier_request_fits_context/resolve_configured_cutoff 未在我们树中 |
| retain_session_lanes 远端车道(SessionRecord 孪生) | 本地单车道 | 批21 简化:我们无云会话注册表,visibility.rs 只过滤本地 Summary 车道 |
| excludes_conversations 的 headless 参数 | 无 | 批21 跳过:我们无 conversations lane |
| persist load()/PersistedInfoLight 合并 | 已完成 | 批22:我们树本无 dead-code load(),等价于 PersistedInfoLight 改名 PersistedInfo(4 处,影响分析 LOW) |
| welcome/foreign_sessions 的 session_kind 字段 | 已完成 | 批22:SessionPickerEntry.session_kind 全字面量补齐+foreign_sessions map_summary 夹具 |
| session_registry 云注册表语义 | 本地 resident 状态 | 批21 适配:mark_headless/is_headless 只记进程内 ResidentResources 标志 |
| merge/unified_list 远端孪生测试(SessionRecord 车道) | 本地版改写 | 批21:测试只断言本地车道过滤 |
| dashboard peek Esc changelog 条目 | 无 | 批22 跳过:两提交全 diff 搜索确认窗口内无对应代码,仅更新日志记录 |
| dashboard_session_picker 预留臂 | 照搬 | 批22:上游该字段恒 None(为 dashboard headless 页预留),我们保留字段与 Dashboard 路由臂 |
| SourceFilter::Grok 变体名 | SourceFilter::Nofy | 批22 保留既有命名分歧:Headless 循环(Nofy→Headless→External→All→Local→Remote)与测试均按我们变体名 |
| SessionPickerEntry.last_recap 字段 | 无 | 批22 适配:云特性我们从无,session_kind 插在 last_turn_summary 之后 |
| picker 窗口内 dashboard.rs 12 行 | 已移植 | 批22 跳过:属批18 cancel_and_arm |
| shell-terminal 拆包(上游新 crate) | 已完成 | 批23:新建 nofy-shell-terminal(11 文件),nofy-shell 以 `pub use nofy_shell_terminal as terminal` 重导出保持路径不变;移动的是**我们的**终端文件(对上游基线有真实分歧:live_waiters/KillSource 等基线前特性从未移植),只叠加窗口路径改写,不照搬上游最终文件 |
| hunk-tracker SetWorkingDir/rekey_paths_for_working_dir | 无 | 批23 跳过:路径虚拟化(hub guest 工作区重挂载)配套,唯一消费者是 workspace `set_cwd_for_virtualization` |
| path_virtualization.rs(+550/+465)/session_root/LocalFs remount_root | 无 | 批23 跳过:hub guest 工作区 `/workspace/<conversation_id>` 虚拟化,云特性 |
| bot_relay.rs(1306 行)+Bot* wire 方法+`__hub:` 会话前缀 | 无 | 批23 跳过:hub bot 中继协议;我们架构是「表面只审批、执行走 provider」,仅作参照 |
| hub_auth/proactive.rs(+759/+1044 测试)、hub.rs 增量 | 无 | 云认证,随批跳过 |
| status_config.rs(+446) | 无 | workspace 工具服务器心跳/keepalive(hub 连接) |
| grok clone 系列(tip 拉取/worktree 复用/fast-worktree nfs 客户端/`Clone*` 遥测) | 无 | 我们无 clone 表面;Clone* 遥测批14 已登记 |
| /feedback 附图 | 无 | 依赖云上传 |
| Dashboard Shift+Tab 启 Auto | 无 | hub dashboard 表面 |
| config-types RemoteSettings(subagents_sampling_limit/two_pass remote 参/FEATURES registry) | 无 | 批23:我们无远端设置结构;等价项经 `Config::resolve_two_pass_compaction` 默认翻转与批20 `[subagents] sampling_limit` 本地配置实现 |
| pager-bin Cargo.toml sandbox-enforce feature 接线 | 无需 | 批23:上游因 workspace 不再默认开启而补;我们 nofy-workspace 的 sandbox-enforce 仍是默认 feature |
| agent config.rs general_purpose_toolset(workflow 不入列表) | 已完成 | 批23:`nofy_build_core_toolset(include_workflow)` 拆分,general-purpose 定义自带无 workflow 工具集(与子代理剥离双保险) |
| ConnectionKind::as_wire_str/Display/ALL | 已完成 | 批23:协议层单一来源,hub-sdk `expected_role` 改用;BotClient 变体不引入 |
| bash_grants warn/computer terminal 转后台/桥接方法 | 已移植 | 批23 核查:批20 已移植,无需重复 |
| 工具测试断言放宽集群(bash/kill_task/task_output/search_replace/enter·exit_plan/ask_user_question/types·output/registry·types/plan_mode/opencode bash/tools-api slash) | 已移植 | 批23:与批16/17/20 的「保留严格断言」不同,本批按上游放宽(断言去措辞钉选,改结构对比),减少后续同步摩擦;`.grok/plan.md`→`.nofy/plan.md` 需手工归一 |
| agent crate 测试放宽(discovery/context/template 共约 400 行删减) | 保留严格断言 | 批23 跳过:实现与措辞未变,按批16/17/20 方针保留 |
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
- workflow/子代理(批17):我们的子代理 ChildRunner 在 `mvp_agent/subagent_coordinator.rs`(上游在 `agent/subagent/spawn.rs`),继承工具剥离接线点在 `resident_handle` 快照处;上游 `acp_session_impl/spawn.rs` 的区间 diff 混有批20 的 `sampling_gate` 参数,移植时只取 workflow 启动块;工具描述与 reminder 里的斜杠命令保持我们的 `/workflows`(上游 `/workflow runs`);`ToolInput::Workflow` 标题逻辑在 `tool_calls.rs`,字段改 `source` 后要同步重写;`tracker.rs` 的 legacy 平铺 JSON 测试夹具保留(正好验证 wire 兼容)
- pager 健壮性(批18):`mark_turn_finished(TurnEnd)` 为横切签名改动,调用点 11 处(fork/lifecycle/load 传 Aborted、prompt/turn_completion 传 Completed);我们的 event_loop.rs 无 finish_startup 遥测,错误路径改显式 match + flush_pending_stall;我们的 drain_and_process 无 progress_tx 参数;上游 welcome_paste 测试未移植,新 handled 计数测试独立追加;FocusGained 鼠标捕获重申依赖 MOUSE_CAPTURE_ENABLED + with_locked_stderr
- minimal/呈现集群(批19):我们的测试内联在 `app_view.rs` 与 `acp/tracker.rs` 尾部 mod(上游是独立的 app_view_tests.rs/tracker_tests.rs),上游顶层测试要降一层缩进插入;`dispatch/tests/prompt.rs` 缺 prompt_stash_dispatch_tests 模块,连同新 recording 模块一起整段取上游最终版追加;`combined_prompt_history` 重写后,依赖 scrollback UserPrompt 出历史的测试要显式种 `session.prompt_history`;`entry_renderer.rs` 我们缺 hook 后缀截断与 bidi 渲染(上游基线前特性),hunk 锚点按我们结构对齐即可;`open_history_browse_at_newest`/`cancel_agent_turn` 提取上游早期未移植,Up 浏览路径内联在 prompt.rs,不做函数级跟随
- 子代理/回合集群(批20):`spawn_session_actor`/`spawn_session_on_thread` 无上游的 `spawn_timer` 参数(subagent spawn 遥测未移植),`sampling_gate` 直接加在 `is_chat_kind` 之后;SubagentSpawnContext 构造点在 `mvp_agent/subagent_coordinator.rs`(上游 subagent_spawn.rs),`parent_compaction` 快照的两段开关来源改 `Config::resolve_two_pass_compaction()`(上游走 `resolve_feature(Feature::TwoPassCompaction)`,我们 SubagentSpawnContext 无 resolve_feature);`resolve_compaction_mode`/`resolve_sampling_limit` 去掉 remote 层;我们的 sampler_turn.rs 无上游基线的 classifier/cutoff 函数,新测试文件只装门控测试;send-now 转后台的 kill 兜底依赖下一回合 dangling 修复(我们同有该机制,函数名不同)
- 会话可见性(批21):`retain_session_lanes` 上游双车道(本地 Summary+远端 SessionRecord)降为本地单车道;`SessionKindIndex` 用 `RelocationView.find_persisted_session_dir`+`read_summary_from_dir` 按需分类单个 id,避免全量扫描;`-p` 打戳走 `_meta.sessionKind` wire 字段(headless.rs 三处:新会话/带 id/fork),`subagent*` 是保留命名空间直接拒绝;`list_sessions_recent` 跳过 headless 但按 `RECENT_LIST_READ_SLACK=8` 倍读取上限回填,防 headless 主导树短路分页;`rows_dropped_by_policy` 标志阻止「策略清空车道后误放宽到全量扫描」;`session_registry.with` 我们返回 `Option`,is_headless 要 `.unwrap_or(false)`;pager 启动链路 `local_resume_selection()` 由 `single/prompt_json/prompt_file` 任一存在判定(Include),headless_materialize_ctx 恒 Any
- picker 路由(批22):测试只能逐 hunk 移植(我们 dispatch/tests/session/load.rs 无上游 title hydration/worktree/restore 等测试,不能整文件替换);`content_hit` 夹具按上游从 foreign.rs 上移到 tests/session/mod.rs;`open_session_picker_with` 助手打戳真实 generation(生产模态的 generation 由 dispatch_fetch_session_list 分配,0 只是构造占位);所有 `ActiveModal::SessionPicker` 字面量要补 `generation`/`detail_seq`;我们 effects 测试的 `execute()` 无 progress_tx 参数,上游新测试降维适配;`gitnexus_rename` 仍会漏定义文件自身引用(PersistedInfo 改名 4 处中漏 2 处),改名后要 grep 复核
- shell-terminal 拆包(批23):移动**我们的**文件而非照搬上游最终版(终端模块对上游基线有真实分歧);转换脚本做 `crate::terminal::`→`crate::`,pty_session 内联 `send_routed_notification`(新 crate 不依赖 shell 的 extensions::routing,用 `agent_client_protocol::ExtNotification`),`TargetClientId` 改从 `nofy_workspace::file_system` 导入,10 处 `pub(crate)`→`pub`;`nofy_home` 在新 crate 走 `nofy_config::nofy_home`(shell 里是 shell-base re-export);`From<TerminalExtError> for ExtMethodResult` impl 随上游移到 shell `session/result.rs`;上游已删的 `get_task_output_path` 我们保留(会话任务日志路径仍在用);工作区 Cargo.toml 要同时加 members 与 `[workspace.dependencies]` 条目;归一化 sed 表易漏 `.grok/` 路径字面量(测试断言里),apply 后要全量 grep 复核
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
| 批17 | 6ab0f93b | workflow 工具重构+子代理门控(上游 1.0.10):WorkflowSource tagged 枚举+wire 兼容反序列化(legacy 平铺字段仍可用)+is_workflow_tool 辅助函数(按 kind 或短 id 匹配);子代理剥离 workflow 工具(builder 构建末段按受众剥离+继承工具定义剥离),顺带补齐上游基线已有但我们遗漏的 strip_ask_user_question_tool;启动块/标题/reminder 措辞按新 source 语法重写;保留 /workflows 措辞分歧;跳过 sampling_gate/compaction pins(批20)、四处纯测试断言放宽、plan 门控放行 Task(批20) | 0.2.152 |
| 批18 | 6fc21c1d | pager 健壮性三件套(上游 1.0.10):x10_filter X10 鼠标报告重组(ConPTY/WSL UTF-8 展开修复,377 行)+pty-harness 泄漏场景;event_loop_stall 60 秒窗口滚动上报(最坏卡滞+活动快照+事件计数,截止/退出/错误路径冲刷);cancel_latency(cancel_and_arm 统一取消点防动作与测量漂移+settle_cancel 一次性发射 CancellationCompleted,Completed 上报/Aborted 丢弃);mark_turn_finished(TurnEnd) 横切 11 调用点接线+fork 失败强制空闲丢锚点防泄漏;event_loop 接线(drain_and_process 挂 x10_filter+DrainResult.handled 计数+stall select 臂+FocusGained 鼠标捕获重申);跳过 record_prompt_in_history/prompt_stash_evicted/draws_a_row(批19)、load.rs picker 路由(批22)、子代理覆盖层取消分支(上游早期未移植) | 0.2.153 |
| 批19 | 24b46ac6 | minimal 模式与呈现小修集群(上游 1.0.9/1.0.10):prompt 历史单一数据源(session.prompt_history 唯一来源+record_prompt_in_history 唯一入口+remember_prompt 只折叠紧邻重复+PromptHistoryLoaded 合并去重含 ! 变体+会话重放补种+Esc-Esc 清空只入 stash);minimal 状态栏行(draws_a_row 去 ScreenMode 参数+live/overlay 全链路 sl_h 预留+下拉带守卫回归测试);wake 回合不截断(is_turn_or_wake_running 三处替换);折叠工具行去左侧竖线(Collapsed 不画 rail 含闪烁+verb-group 菱形入内容列+同类工具块 swap 保持显示模式+完成不弹开折叠);小修(resolve_permission_mode 回退走 default_interactive_permission_mode、fork 截断/过滤清 announced_failed_servers、scrollbar 死代码、doctor dunce);测试新增 17+241 行并按上游重写旧语义(8040+82+1056+5214 全过);跳过 task_status_line 整组与 render_tests hook 断言(特性未在树中)、settings remote 通道(降维适配)、picker hunk(批21/22) | 0.2.154 |
| 批20 | c62278ab | 子代理/回合集群(上游 1.0.10):①压缩默认 Summary→Segments(手写 Default impl+解析链文档/测试同步);②compaction pins(CompactionPins{mode,two_pass}+cursor_compaction_pins+父会话快照含 harness 模板继承判定+子代理派生,子代理不再硬编码 Summary/两段关闭);③sampling 信号量全链路(NOFY_SUBAGENT_SAMPLING_LIMIT env+[subagents] sampling_limit,≤512 钳制;MvpAgent 共享 Semaphore→SubagentSpawnContext→spawn_session_on_thread/actor sampling_gate 参;子代理回合 submit 持许可排队、主会话 None 不限流、信号量关闭失败开放;CompletionResult 转 pub);④plan 门控放行 Task(plan_mode_edit_gate 对 ToolInput::Task 直接 Allow);⑤send-now 转后台(回合中发消息不再 SIGKILL 前台命令:TerminalBackend::background_foreground_commands+LocalTerminalActor 全量转后台+BashExecutionBackgrounded 补宣布+桥接方法+tasks_cancel 接线,空返回回退杀进程,模型收到「仍在运行,按 task_id 取输出」的 tool result);测试 +6(shell 5220 过)+1 终端转后台集成测试(tools 2912 过);跳过 compaction.rs 遥测 hunk、two_pass 默认翻转(暂缓)、sessionKind(批21)、纯测试放宽、grok-clone 云文档 | 0.2.155 |
| 批21 | ce84f43b | 会话列表/搜索可见性架构(上游 1.0.10):①新 visibility.rs(HeadlessPolicy Exclude/Only/Include+from_wire fail-closed+ClassifiedSessionKind+retain_session_lanes 本地单车道);②`-p`/headless 打戳全链(_meta.sessionKind 解析,subagent* 保留命名空间拒绝;StorageAdapter::set_session_kind_if_absent 锁内原子写;新会话/带 id/fork 三处 wire meta);③unified_list 的 ListReq.headless wire 字段+fetch_lanes/fetch_merged 策略过滤+rows_dropped_by_policy 阻止策略清空后假放宽;④session_search walk_admitted_window 分页分类(filtered-view offset/total);⑤list_sessions_recent 跳过 headless+8 倍读取上限;⑥花名册 mark_headless/is_headless,headless 不入 roster(resident+dormant 均排除);⑦pager 启动 local_resume_selection(-p/--prompt-*→Include)+presandbox_resume_target/most_recent_session_id/resolve_session_by_title 携带 RecentSessionSelection;sessions 命令清单用 Include;测试 +29(shell 5249 过)+4(pager 8044 过);跳过远端 SessionRecord 车道/conversations lane(无云),load()/PersistedInfoLight 与 welcome/foreign_sessions session_kind 延迟批22 | 0.2.156 |
| 批22 | 42e3abdb | picker 路由重构(上游 1.0.10):①新增 SessionPickerHost{Welcome/AgentModal/Dashboard}+SessionPickerSurface,picker_routing.rs 三重门(host 存活+generation 相等+seq 当前)统一结果路由;②AppView 新增 picker_generation_counter/session_picker_generation/alloc_picker_generation,welcome generation 每次 browse fetch 与每次 dismiss 重分配,session_picker_detail_generation 改名 detail_seq;③Effect/TaskResult 全量携带 host+generation 回显,wire 层 nofy/session/list 与 search 加 headless 参数,FetchDashboardSessions 恒 Exclude;④SourceFilter 新增 Headless 页(Nofy→Headless→External→All→Local→Remote),跨越 Headless 触发 refetch+清过期 natives+重启深搜,hidden_external_hint 移 Headless 页专属;⑤parse_session_picker_entries 解析 sessionKind,invalidate_picker_fetch_on_dismiss 改 generation+list_seq 双隔离,debounce 过期加 welcome 视图存活性检查(仅 build 模式深搜);⑥收尾 PersistedInfoLight 改名 PersistedInfo(上游合并 dead-code load(),我们本无);测试 8062 过(净增 18,含 8 个上游新测试),删 1 过时测试重写 2,minimal panel 删 pin-hint 测试;跳过 dashboard peek Esc changelog(窗口内无代码)/dashboard.rs 12 行(批18)/last_recap(云),dashboard_session_picker 预留臂照搬 | 0.2.157 |
| 批23 | 49b789d0 | shell-terminal 拆包+工具修复集群(上游 1.0.9/1.0.10,末批):①终端模块移出为独立 crate nofy-shell-terminal(11 文件机械移动+路径改写,移动的是我们的文件——对上游基线有 live_waiters/KillSource 等真实分歧,不照搬上游最终版),nofy-shell `pub use nofy_shell_terminal as terminal` 重导出路径不变,From<TerminalExtError> impl 移 session/result.rs,pty_session 内联路由通知,shlex/process-wrap/portable-pty 依赖迁移;②子代理 workflow 剥离补全(apply_child_tool_policy 按 kind/短 id 剥离+agent config.rs nofy_build_core_toolset(include_workflow) 拆分,general-purpose 定义自带无 workflow 工具集)+4 测试;③two_pass 压缩默认翻转开启(批20 暂缓解除,上游 1.0.10 全量);④工具测试断言放宽集群(bash/kill_task/task_output/search_replace/enter·exit_plan/ask_user_question/types·output/registry·types/plan_mode/opencode bash/tools-api slash,措辞去钉选改结构对比);⑤携带:build.rs 版本哈希 12 位、sandbox 钉 NOFY_DEFAULT_PERMISSION_MODE=ask、ConnectionKind::as_wire_str 协议单一来源+hub-sdk 改用、用户指南 6 处同步;测试 tools 2906/shell 5183/agent 575/subagent-resolution 108/shell-terminal 63/协议层全过;跳过 hunk-tracker SetWorkingDir(路径虚拟化配套)/config-types RemoteSettings(无此结构)/agent crate 测试放宽(保留严格断言)/bot_relay+hub_auth/proactive+status_config+grok clone 系列+/feedback 附图+Dashboard Shift+Tab(云/hub,登记分歧表);bash_grants warn 与 send-now 转后台核查批20 已移植 | 0.2.158 |
