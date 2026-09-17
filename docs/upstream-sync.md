# 上游同步台账

我们与上游 xai-org/grok-build 无共同 git 历史(物理剔除 xAI 依赖 + 全量改名),
每次上游更新只能人工对照移植。本文档记录基线、流程与**有意分歧**,
让每次同步的摸底成本最小化。

## 基线

| 项 | 值 |
|---|---|
| 我们的移植基线 | 上游 1.0.4 |
| 已同步到 | 上游 1.0.8(2026-08-26,批1–批12);1.0.10(2026-08-28,批13–批23 完成,上游落点 77cd7eb) |
| 上游克隆 | `/tmp/grok-upstream`(丢失时 `git clone https://github.com/xai-org/grok-build`;本仓库已另加 remote `upstream`,2026-09-13 fetch 到 upstream/main=1.0.24@37949780) |
| 对照工具 | `scripts/upstream_diff.sh`(命名归一后 diff;`--changed <tag>..` 列改动面) |
| 剩余缺口 | 上游 1.0.11 尾差 → 1.0.24 未吸收;**批24 预检对账已完成(2026-09-13)**,缺口清单见下方专节;批次路线图见 [upstream-absorb-plan.md](upstream-absorb-plan.md)(自批25 起,批25 有前置阻塞) |

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
| xai-grok-update(自更新 CLI,16 文件) | 无 | 身份清理(0.2.159)已删 `nofy update` 子命令与文档;上游 update crate 改动随批一律跳过,批24 补登此条免重复评估 |
| 系统提示词模板身份归属("released by xAI"/"Grok Build"/"xAI Grok Build harness") | 已清理 | 批23 后身份清理(0.2.159):7 个模板 8 处改 Nofy Build 表述,主提示词删 "released by xAI" 归属,用户指南引导路径 `~/.grok/`→`~/.nofy/`;改模板后须重跑 `crates/codegen/nofy-agent/scripts/encrypt_templates.py` 重新生成加密产物 |
| 用户指南/参考文档/教程/模型表品牌遗留 | 已清理 | 身份清理第二步(0.2.159):26 个用户指南+2 个参考文档+9 个教程全量 Nofy 品牌化(按代码实况校正:`NOFY_*` 环境变量、`.nofy-plugin`/`.nofy/` 目录、`nofy plugin`/`nofy inspect` 子命令、`nofy/git/worktree/*` wire 前缀、`worktrees/nofy/` 路径、`nofy_code.*` 遥测 schema/`nofy-cli` service.name/`ai.nofy.nofy_code` meter scope、NofyNight/NofyDay 主题、`--nofy-ws-origin` 旗标);删除代码中不存在的条目(`GROK_OIDC_*` 环境变量、`[grok_com_config.oidc]` 表、mixpanel_enabled、Grok Desktop 终端、`nofy update`/`/feedback`、fleet 策略抑制段——远端设置已剔除);default_models.json 显示名/描述改 Nofy,`system_prompt_label` "Grok 4.5"→"Nofy"(该字段经模型表注入系统提示词);模型 ID `grok-4.5` 为功能性 API 标识保留 |

## 缺口清单(批24 对账,2026-09-13)

批24 预检对账产出。摸底用修好的 `scripts/upstream_diff.sh --changed 77cd7eb6..upstream/main`
(UPSTREAM_REPO=本仓库),完整清单落盘 `/tmp/upstream_changed_20260913_060901.txt`。

### 摸底数据

| 项 | 值 |
|---|---|
| 范围 | 77cd7eb6..upstream/main(37949780,1.0.24) |
| 改动文件 | 2969(其中 .rs 2738) |
| 映射后存在 | 1877 |
| 映射后缺失 | 1092(21 个整 crate + 既有 crate 内上游新增文件) |
| 缺失大户(既有 crate 内新增) | pty-harness +280、shell +280、pager +122、tool-protocol +58、workspace +35、tools +28、fast-worktree +18、telemetry +17、sampler +12、memory +10、sandbox +8、mcp +7、config +6 |

pty-harness/shell 的两个 +280 即计划红线「三巨提交禁整树吸收」的实体:
bc7f02ed(pager input 重写)与 bb7f39d5(shell 重构)的新增文件面,只能按 changelog 外科提取。

### 提交→版本映射校正

计划原表偏移约一个版本,以 changelog 新增实测为准。**对账单位是 changelog 条目,不是提交**——
批次边界跨提交边界(如 72a61251 含 1.0.14–1.0.16 三版,分属批27/批28)。

| 提交 | 日期 | 计划原标 | 实测引入 changelog | 文件数 |
|---|---|---|---|---|
| 9684fa3c | 08-27 | 1.0.10 第二落点 | 无(仍标 1.0.10) | 442 |
| bc7f02ed | 08-28 | 1.0.12 | **1.0.11 + 1.0.12** | 1240 |
| bb7f39d5 | 08-31 | 1.0.13/14 | 1.0.12改 + **1.0.13** | 1429 |
| 72a61251 | 09-01 | 1.0.16/17 | **1.0.14 + 1.0.15 + 1.0.16** | 310 |
| 75810042 | 09-08 | 1.0.18→1.0.24 | **1.0.17–1.0.24(八版)** | 1896 |
| 37949780 | 09-09 | 1.0.24 | 无(1.0.24 后修补) | 684 |

### 1.0.11 尾差对账

1.0.11 changelog 共 17 条。已移植 4、跳过 1、渲染存在但接线待核实 2、待核实/待移植 10。
待核实项归入批25(1.0.12 集群)一并处理,因 1.0.11 与 1.0.12 同落 bc7f02ed,代码面交织。

| # | 条目 | 分类 | 证据/归属 |
|---|---|---|---|
| 1 | Headless 会话可在 resume picker 浏览 | 已移植 | 批21 HeadlessPolicy + 批22 SourceFilter::Headless 页 |
| 2 | 新交互会话默认权限模式可配置 | 已移植 | 批16 `default_interactive_permission_mode()` + `NOFY_DEFAULT_PERMISSION_MODE` |
| 3 | resume 后历史显示回合时长 | 渲染存在,接线待核实 | `session_event.rs` "Worked for" marker 在;resume 重放路径未证 |
| 4 | /resume 后显示回合脚注(Worked for/cancelled/failed) | 同上待核实 | `turn_completion/tests.rs` 有断言 |
| 5 | mkdir/touch 不再在 auto 模式提示 | 已移植 | `permission/shell_access.rs:1182` 安全清单含 mkdir/touch |
| 6 | Auto 模式自动放行子代理消息 | 待核实(批25) | 无直接匹配 |
| 7 | headless 启动提示可自动放行权限 | 待核实(批25) | 批21 有 `startup_hints.non_interactive`,放行接线未证 |
| 8 | 命令链/子命令权限提示更可靠 | 待核实(批25) | 批16 有祖先授权修复,本条未证 |
| 9 | 重启后阻塞提示不再入历史/scrollback | 待核实(批25) | 无匹配 |
| 10 | 后台 monitor 去掉 10h 默认超时 | **已对齐(批24 假阳性纠正)** | 批25 实查:monitor 默认超时在 `nofy-tools/.../monitor/types.rs` 的 `DEFAULT_TIMEOUT_MS=36_000_000`(10h),与 upstream/main **逐字相同**(缺口内 diff 为空)。批24 误把 `tools/config.rs` 的 `PRODUCTION_MAX_TIMEOUT_SECS`(bash **前台**命令上限,注释明载"background tasks always unbounded")当成 monitor 超时。无需移植 |
| 11 | 鼠标右边距不再输入字符 | 待核实(批25 pager 面) | bc7f02ed pager 重写面,需外科提取 |
| 12 | 粘贴尾换行不再误提交 | 待核实(批25 pager 面) | 同上 |
| 13 | Auto 模式分类器拦截显示权限卡 | 待核实(批25) | 无匹配 |
| 14 | Kitty/Warp 图像预览残影 | 待核实(媒体面,倾向跳过) | 图像预览是否保留待核 |
| 15 | 展开的 Execute 输出不再回弹折叠 | 待核实(批25 pager 面) | bc7f02ed 面 |
| 16 | /voice parec/arecord 回退 | 跳过 | 语音已剔除(分歧表) |
| 17 | 后台命令等待随进程退出即结束 | 待核实(批25) | 无匹配 |

### 缺失 crate 定性(21 个整 crate)

08-13 波 10 个(锚点 77cd7eb 已存在、从未移植)+ 缺口内新增/其他 11 个。
「待评估」= 批24 不拍板,留到对应批次按 changelog 条目触发时再定。

| crate | rs | 用途(上游 description) | 定性 | 归属 |
|---|---|---|---|---|
| session-search | 10 | SQLite FTS5 本地会话搜索,BM25 排序 | **移植(立项)** | 批33,产品价值高且全本地 |
| session-events | 4 | 每会话事件日志 JSONL | 待评估 | 我们 `nofy-session-journal` 是空壳(0 rs),无重叠;按批25+ 需求触发 |
| active-sessions | 2 | 崩溃恢复 TUI 会话存活登记(lock-guarded JSON) | 待评估 | 与 `nofy-session-registry`(只读跨进程索引)用途不同;崩溃恢复需求触发 |
| foreign-sessions | 15 | 外部 coding-agent 会话元数据发现 | 待评估 | `nofy-session-registry` 已含 foreign-session 视图;发现层是否独立 crate 待核 |
| compaction-transcript | 1 | 压缩段 Markdown 渲染 + segment-store 命名 | 降维评估 | 压缩已移植(批20/23);渲染层按批25/26 需求 |
| fuzzy-file-search | 1 | 模糊文件搜索(ignore-aware walker + nucleo + daemon) | 移植评估 | 批33 候选;文件选择器价值,nucleo 依赖面需核 |
| bundle | 1 | 发布态子代理 bundle 校验缓存(personas/roles/agents/skills) | 跳过倾向 | 云/市场表面;marketplace 本地化需要时再评估 |
| diag-server | 1 | hub guest 诊断 HTTP server(/ready /statusz /logs) | **跳过** | hub guest 云表面,同批23 path_virtualization 分歧 |
| workspace-daemon | 3 | workspace-server 守护进程生命周期(自守护/pidfile/preview-proxy) | **跳过/登记分歧** | Computer Hub 表面,计划批31 决策点已倾向分歧 |
| pager-diff | 1 | TUI diff hunk 构造 | 降维评估 | 已有 diff 渲染;视批31 edit_file 真实行号条目是否需独立 crate |
| update | 16 | 自更新 CLI | **跳过** | 身份清理已删 `nofy update`;分歧表已补登 |
| image | 2 | 图像校验/转码(tools 与 clients 共享) | 评估 | 计划第 4 节已有条目,维持 |
| dirs | 1 | home 目录解析(USERPROFILE-first + grok-home) | 跳过 | 已有 `nofy_config::nofy_home` 等价;上游若新依赖再取(批33) |
| mixpanel | 1 | Mixpanel HTTP 追踪客户端 | **跳过** | 遥测云,分歧表已覆盖(mixpanel_enabled 已删) |
| message-delivery-core | 8 | interjection 原子交付 | 批27 评估 | 计划第 4 节已有条目,维持 |
| login | 46 | xAI 登录流 | **跳过** | 分歧表:BYOK,物理剔除 |
| dashboard-store | 14 | hub dashboard 持久化 | **跳过** | 云表面,计划第 4 节已有 |
| feedback | 12 | 退出反馈云上传 | **跳过** | 分歧表已有 |
| voice | 17 | 语音工具 | **跳过** | 分歧表:媒体/语音已剔除 |
| otel | 9 | OTLP 遥测上报 | 降维 | 计划第 4 节:只取 W3C trace-context 传播 |
| gboom | 5 | 彩蛋射线追踪游戏 | **跳过** | 计划第 4 节已有 |

### 工具修复记录(批24 前置,已完成)

`scripts/upstream_diff.sh` 此前对缺口基本失明:normalize sed 表仅 21 条 crate 枚举,
缺口重度触及的 tool-runtime/tool-protocol/grok-compaction/computer-hub-*/interjection-core/
grok-agent/mcp/models/auth/config/paths/sampler/sandbox/secrets/version 等约 50 个 crate 不在表内,
`--changed` 跑出 80/80 全「缺失」(且被 `head -80` 截断)的假阴性清单。批24 修复:

- normalize 改为 4 条统一规则(`xai-grok-`→`nofy-`、`xai_grok_`→`nofy_`、`xai-`→`nofy-`、`xai_`→`nofy_`),
  经全量 crate 清单核对与旧表结果一致且覆盖旧表全部遗漏;非 crate 字面量规则(grok_build/_x.ai/GROK_/.grok/)保留。
- `--changed` 修范围解析:尾随 `..` 在 UPSTREAM_REPO=本仓库时自动补全为 `upstream/main`,
  避免误解析到我们自己的 HEAD(含 336 桌面提交);用法改为显式 `<base>..<head>`。
- `--changed` 扩到 `crates/` 全文件类型(原仅 `.rs`,Cargo.toml/changelog 不可见);
  输出改为按 crate 汇总存在/缺失 + 全量清单落盘,去掉 `head -80` 截断。
- 遗留未动:`XAI_` env 前缀未加归一规则(我们树仅 3 处残留:npm 元数据 + bg_task.rs,
  非 crate 名,加规则恐掩盖真实差异,留待具体批次触及再定)。

### 批25 前置条件(阻塞,需用户处置)

当前工作树有 47 文件未提交改动(+1909/−575),是**在飞的 Desktop 第一方 MCP server 实现**
(`nofy-mcp` 的 `local_agent_endpoint`/`NOFY_AGENT_ID_HEADER`,即计划批31 决策点 #6「取」)
加 D 系列模型管理收尾,且正好覆盖批25 操作面(`nofy-mcp/servers.rs`、`nofy-workspace/worktree/mod.rs`、
`permission/*`、`nofy-shell/config/*`)。批25 起要改内核代码并做批次提交,**不能在这份未提交特性工作上叠提交**。
开工批25 前须:① 提交或暂存在飞工作;② 固化桌面 seam 基线(`desktop/src/out/*` 当前已改);
③ 在干净树上复测三路测试基线(脏树计数会误导「只增不减」判定)。

**批24 附加发现(已修复)**:脏树的 `nofy-shell (lib test)` 目标曾**编译失败**,lib 本身过(13 warnings)。
精确错误(编译器只报 1 个):
`crates/codegen/nofy-shell/src/session/acp_session_tests/reactive_managed_reauth_e2e_tests.rs:200:17`
`error[E0063]: missing field 'local_agent_endpoint' in initializer of 'HttpConfig'`。
根因是在飞的 Desktop 第一方 MCP server 工作给 `nofy-mcp` 的 `HttpConfig` 加了 `local_agent_endpoint: bool`,
生产构造点(`servers.rs`)已补 `false`,但漏了这一个测试构造点。
(注:`ModelEntry` 的 `input_modalities`/`output_modalities` 两字段已补全,无报错;
早先按 grep 推测的「17 文件缺 modality 字段」是红鲱鱼,以编译器输出为准。)
**批24 已修**:该测试构造点补 `local_agent_endpoint: false,` 一行(与生产默认一致,该测试与本地代理端点无关),
`cargo check -p nofy-shell --tests` 复核通过(Finished 34s,无 error;余下 unused import 警告属 nofy-governance/surfaces/daemon 预存,无关)。
**批25 前置已解除(2026-09-13)**:在飞工作已分三个提交固化,内核树(`crates/`)干净——
`1feaa602` Desktop 第一方 MCP server 内核地基(特性 1,即"desktop mcp 收尾")、
`894ab59c` 批24 预检对账、`9383df3a` 在飞检查点(特性 2 配置 TOML→JSON 迁移 + 特性 3 模型 modality 字段,
两特性在 loader.rs 纠缠故合提交,detect_changes risk=HIGH 但 9 执行流全汇聚 discover_servers 单点)。
桌面构建产物/i18n(desktop/src/out/*、desktop/src/src/lib/i18n/*)与未跟踪项(nofy-desktop/ 独立 monorepo、
migrate-config-to-json.mjs、desktop seam/tests、stray dmg/png)不碰内核 .rs,留桌面侧自行提交。

**测试基线(干净内核树,2026-09-13)**:nofy-config 188、nofy-mcp 180、nofy-shell 5175、
nofy-workspace 1759、nofy-pager 8058,共 **15,180 通过**。4 个失败全为 macOS 环境产物
(tempdir `/var`→`/private/var` 规范化 + `/tmp` 临时性前置:shell 的 memory_writer/registry、
pager 的 lease_cmd/memory_cmd),均在特性 2/3 未触及的文件里,干净树同样失败,非回归。
台账旧基线"shell ~5242 / pager ~8100"系约数,以本次实测为准。

### 批25 调查定性(2026-09-13,摸底/读上游步)

批25 原计划标"(小)",**实查后证伪**:1.0.12 集群经 23 批分歧累积,条目要么与既有分歧纠缠、
要么需移植大型新子系统。逐条定性(证据见各条):

| 条目 | 定性 | 证据 |
|---|---|---|
| context 估算含 reasoning + rewind/模式切换 token 校正 | **大改,需独立子批** | 上游新增 `context_snapshot.rs`(+462,我们树无)、`rewind.rs` 改 219、`compaction_context.rs` 改 163、多测试文件改;是上下文核算子系统重构 |
| 压缩进度即时更新 context bar | **大改,跨层** | 我们 `AutoCompactStarted` 只带 `{percentage}` 无 `tokens_used`(ext_protocol.rs:260/reducer/acp.rs:200);且我们树无 `refresh_context_used`/`confirm_context_used`/`compaction_context_refresh`(仅有 `note_context_used`)。需 shell 发射 tokens_used→wire 加字段→pager 解析+移植 context-refresh 子系统+接线 |
| MCP 服务器瞬断重试 | 纠缠分歧 | 仅 `mcp_connecting_reminder_tests.rs`(缺失);实际重试纠缠批15 登记的 Nofy 分歧(托管连接器 `nofy_com_` 前缀不带"下次工具调用自动重试"提示) |
| worktree 创建跳过 stale reflog | 纠缠云面 | 上游改动在 `xai-fast-worktree` 的 `SKIP_SOURCE_IS_GROVE_MOUNT`/auto-GC;台账批23 已跳过 fast-worktree NFS 客户端/clone 表面 |
| interjection 后子代理等待修复 | 纠缠结构分歧 | 上游 `agent/subagent/spawn.rs` vs 我们 `mvp_agent/subagent_coordinator.rs`(台账批17);pty-harness interjection 测试缺失 |
| 截断错误措辞不再建议"短回答" | 我们树无对应 | 全树无 "shorter answer/response" 字符串 |
| monitor 10h 默认超时 | 已对齐 | 见上方 1.0.11 表第 10 行(批24 假阳性已纠正) |
| credit upsell Try Again | 跳过 | 云/计费(分歧表) |

**最终定论(深挖后,纠正上方早期定级)**:批25 的 1.0.12 头条项(context 估算含 reasoning、rewind/模式切换 token 校正)
**无法外科提取**,触发红线「结构级重构成为前置依赖时单独决策」条款。三重障碍:

1. **嵌在红线巨提交的结构重构里**:token 计数实现(`record_response_token_usage`)在 `sampler_turn.rs`,
   bc7f02ed 对该文件改 **786 行**、`turn.rs` 改 395、新增 `turn_task.rs` +259——属"pager input 重写"巨提交的
   turn 执行子系统重构,红线明禁整树吸收;4 行测试期望(102_000→101_750,reasoning base64 *3/4 校正)只是其表层。
2. **依赖未吸收的 9684fa3c 基线(1.0.10 第二落点,+442 文件)**:bc7f02ed 的 rewind 改动引用
   `prepare_image_strips_for_rewind`/`cancel_pending_image_strips_for_rewind`/`cancel_active_sampling_requests`,
   我们树全缺失(同步锚点停在 77cd7eb,跳过了 9684fa3c)。
3. **该基线核心是云表面**:`context_snapshot.rs`(+462,经 `#[path] mod` 结构接入 acp_session.rs)依赖
   `POST {xai_api_base_url}/tokenize-text` 云 tokenizer + `tokenize_api_key()` + 遥测 session metrics,
   按云红线**应跳过**,非可移植基线。

早期"批25a(context_snapshot+462/rewind219/compaction_context163)"定级**作废**:那些是 `77cd7eb..upstream/main`
**缺口累积(1.0.11–1.0.24)**数,非 1.0.12 单版;bc7f02ed 单版对 rewind 仅 16 行、compaction_context/memory_context 未改。

**结论**:1.0.12 无可干净移植的高价值项——头条项缠在结构重构+云基线里,余条(MCP 重试/worktree reflog/
interjection/截断措辞/monitor/credit)前已定性为分歧纠缠或关闭。**版本逐批模型在 1.0.12 处失效**:
bc7f02ed 是结构重写(红线禁整树)、9684fa3c 是含云的未吸收基线。需用户级单独决策(见下方「批25 结构决策点」),
不在批中擅自吸收结构重构或云表面。节奏"2–3 周吃 9–10 批"据此作废:1.0.11–1.0.24 的真实移植受结构分歧门控。

### 批25 结构决策点(需用户拍板,红线「单独决策」条款)

| 选项 | 内容 | 代价/风险 |
|---|---|---|
| A 结构对齐立项 | 单独立项吸收 bc7f02ed turn 执行重构(sampler_turn/turn/turn_task)+ 9684fa3c 本地部分(image-strips/cancel_active_sampling),**跳过云 context_snapshot**;配 PTY e2e 全量回归 | 大;动核心 turn 执行,我们已分歧 23 批,回归面广;但解锁 1.0.12–1.0.24 的 token/context 条目 |
| B 登记分歧跳过 | 1.0.12 的 token/context/rewind 项登记为有意分歧(我们 token 计数维持现状),转查批26(1.0.13 韧性)等后续批是否有更自包含的条目 | 小;放弃上游 token 精度改进;需逐批验证后续是否同样被结构重构门控 |
| C 仅取离散小项 | 排查 1.0.12 是否有不缠结构重构的离散小项(如 pager 渲染类:表格单元格复制/提示块 hook 友好描述),有则单独移植,余登记分歧 | 中;价值有限(非头条项);仍需逐条验证自包含性 |

**方法论校准(2026-09-13,用户裁定,取代上方 A/B/C 框架)**:吸收的目标不是"原样合并每项上游改进",
而是**以上游为参照、提炼能推进我们架构合理性的想法、用我们自己的(BYOK/无云/已分歧)架构原生实现**。
上游 diff 缠在结构重构里这件事,只要原生实现想法就无关紧要——A(结构对齐立项)因此通常不必要,
B(登记分歧)仅用于想法对我们无价值或与我们架构冲突时,C(取离散小项)升级为"取离散**想法**原生实现"。
判据:该想法是否架构无关地提升正确性/韧性/合理性?能否在我们树原生落地而不引入云依赖或结构重写?

### 批25 原生实现日志(校准后方法)

| # | 上游想法(版本) | 原生实现 | 提交 | 验证 |
|---|---|---|---|---|
| ① | reasoning token 估算:加密内容是 base64,bytes/4 会高估 4/3(1.0.12「context 估算含 reasoning 更准」) | `nofy-token-estimation` 新增 `estimate_base64_tokens`(len*3/4 再 /4);`estimate_item_tokens` 的 Reasoning 分支加密内容改用它。**不碰**上游缠在 sampler_turn 786 行重构 + 云 context_snapshot 的实现 | `0dfe1dac` | token-estimation 16 / chat-state 375 / shell 5175 通过(2 失败为 macOS 环境产物,与基线一致);detect_changes low/0 流程 |
| ② | rewind/模式切换后 token 数应匹配 server 报告值而非失准(1.0.12) | **消除我们树内部不一致**(非照搬上游):压缩路径 `replace_conversation` 已用 ratio reseed 保留 provider 开销(系统提示词/工具,state.rs 注释"carried across compaction"),但 rewind 路径 `truncate_to_prompt_index` 裸重估、delta 清零、丢弃开销。提取共享助手 `reseed_tokens_after_shrink`(state.rs,单一真源),压缩与 rewind 统一调用 | `25f53433` | chat-state 376(+1 新测试,4 压缩 reseed 测试验证重构等价含 total==6525)/ shell 5175(与基线一致);detect_changes low/0 流程 |
| ③ | auto 模式不再瞬间执行破坏性 `git checkout --`(1.0.22#15,安全) | 根因:`ROUTINE_PREFIXES` 把 "git checkout" 当工作流动词放行,但 `git checkout -- <path>` 丢弃未提交工作树改动。`exec_risk.rs` 新增 `git_checkout_restores_pathspec`(`--` 分隔符为可靠破坏信号;分支切换无 `--`、良性切换有 git switch、git restore 本就不在表),`bash_command_is_routine` 加守卫→Block→走模型 | `b6fb756e` | workspace 1761(+2 新测试,0 失败);detect_changes low/0 流程 |
| ④ | 模型后端选择修复:config.toml 显式 `chat_completions` 不被同 slug 兄弟覆盖(1.0.22#18,A2/22) | 根因:`resolve_model_list` 第 4 层 slug 传播用 `api_backend == ApiBackend::default()` 当"未设置"判据,而显式 `chat_completions` 与默认值**同值**,故被同 slug donor 的 `responses` 静默覆盖(BYOK 用户明确选的后端被换掉)。原生做法:覆盖循环旁路收集 `explicit_api_backend_keys`(含经 `model_provider` 继承的显式值),backend 分支加 `!contains(key)` 守卫。`ModelInfo` 未派生 `Default` 且构造点众多,故用侧信道 `HashSet` 而非改结构体;`context_window` 分支不动(NonZeroU64 vs 256k 默认可区分,已有守卫) | `187b7131` | 新增 `slug_propagation_does_not_overwrite_explicit_chat_completions_backend`,**红绿双验**(摘掉守卫→left=Responses/right=ChatCompletions 失败);shell --lib 5176 passed / 2 failed(既有 macOS 环境伪失败 memory_writer.rs:416、workflow/registry.rs:849,与基线一致);detect_changes low/0 流程 |
| ⑤ | 参数完整的截断工具调用照常执行,而非整回合失败(1.0.13#12,A1/309) | **消除我们树内部不一致**:messages.rs 的 stop_reason 重写早已声明"Completed tool_use blocks win even over Refusal: the calls are real model output the agent loop must resolve",但同函数上方的 `final_stop_reason == Length` 早退把这批已完成的 tool_use 整体丢弃。原生做法:sampling-types 立单一真源判据 `ToolCall::arguments_complete`(空参=零参约定非截断证据;其余须可解析,用 `IgnoredAny` 免分配)+ `truncated_tool_calls_are_actionable` + `ConversationResponse::length_truncation_is_actionable`;messages.rs L2 早退与 request_task.rs `drive_l2` 两个终结点共用该谓词,不会各自漂移。**不引入**上游 `LengthPolicy` 三态请求级旋钮:我们树无 `CompletePartial` 消费方,且 `ConversationRequest` 有 43 处结构体字面量构造点,加字段是无收益的大面积改动 | `86fa559f` | 6 个谓词单测 + 2 个 messages L2 流测,**红绿双验**(摘掉守卫→complete_tool_use 测 FAILED);既有纯文本 `model_context_window_exceeded_fails_as_max_tokens_truncation` 仍失败如前;sampler 176 / sampling-types 307,0 failed;detect_changes low/0 流程;impact(stream_messages)=HIGH 但 16 个直接调用者中 15 个是其自身单测 |
| ⑥ | 会话数据在 prompt 后与掉电时更可靠落盘(1.0.13#9,A1/308) | **消除我们树内部不一致**:JSONL **追加**路径早已 write→flush→sync_file(F_FULLFSYNC)→sync_parent 四步齐全,但**整文件原子重写**路径 `write_bytes_atomic` 只有 `std::fs::write` + rename,两道屏障全缺——而它正是 summary.json / plan_mode / signals / announcement_state / goal state / updates.jsonl 全量重写 / 会话导入列 / 会话索引的落盘口。temp+rename 只保证"旧或新",不保证新内容已落盘:掉电时 rename 已提交而数据未刷→读回 0 字节→我们的读取路径直接判 `InvalidData("summary.json is empty (0 bytes)")`,会话等于丢失。原生做法:拆出注入式 `write_bytes_atomic_with`,**先 sync temp 再 rename、rename 后再 sync 父目录**(替换与首次创建都付,因父目录 sync 失败后的重试无法区分 create/replace);新增共享 `sync_dir_durable`(macOS sync_all+F_FULLFSYNC / 其他 unix sync_all / windows no-op / 其他 Unsupported)+ `sync_parent_dir_durable`;jsonl 的三份 cfg 私有副本收敛为委托(顺带修正追加路径目录 sync 在 macOS 只做 sync_all 的既有不一致);`write_bytes_atomic_async` 改为 `spawn_blocking` 复用同步版(F_FULLFSYNC 可达数十毫秒,不能卡 reactor,且两路径共用一份实现) | `0574edf8` | 6 个注入式屏障契约测试(顺序/替换路径同样付/失败后重试仍付/失败清理 temp 且目标不变)+ `atomic_write_real_barriers_succeed_on_tempdir` 用真屏障跑通 create+replace,实证 macOS 目录 fd 上 F_FULLFSYNC 不被拒;shell --no-fail-fast lib 5182 passed / 2 failed(同既有环境伪失败,+6 为新测试),全部集成二进制 0 failed;detect_changes low/0 流程。**未纳入**:上游同批 `create_dir_all_durable`(目录链首次创建窗口)与 `sync_cwd_marker_if_present`(.cwd 标记),非本条 changelog 语义,另行评估 |
| ⑦ | 瞬态推理失败(卡死/断连/5xx)自动重试而非结束回合(1.0.13#7,A1/307) | **对账定性:主体已对齐,不新造重试面**——`SamplingError::is_retryable` 已覆盖 Http(timeout/connect)、EventStreamError、StreamError、429+5xx(除 525/526)、EmptyResponse,`DEFAULT_MAX_RETRIES=15` 与上游同值,`IdleTimeout` 判 Fatal 也与上游逐字一致(上游同样不重试 stall,因重试仍会 stall)。真实余量仅一处:`classify_error` 通用可重试分支对所有错误一律走 2s 起指数阶梯,而传输层失败不是服务端拥塞(无 Retry-After 可尊重,且首次重试本就要重建 HTTP 客户端逃离被污染的 HTTP/2 池)。原生做法:新增 `TRANSPORT_REBUILD_BACKOFF=200ms`,退避按错误种类分派——`Http(_)` 走 jittered(200ms),其余不变;只影响 `next_attempt==1` 的 `RetryWithClientRebuild`,状态码错误(5xx=源站确在挣扎)仍走阶梯 | `5e46ce16` | 新增 `classify_transport_error_first_retry_rebuilds_client_fast`(loopback 端口 1 的确定性即时 ECONNREFUSED 造 `reqwest::Error`,因其无公开构造器),**红绿双验**(换掉 match 臂→backoff=2.027s 断言失败);既有 `classify_5xx_first_retry_rebuilds_client` 仍断言 >=1600ms 证明状态码路径未变;sampler 177 / 0 failed;detect_changes low/0 流程;⚠ impact(classify_error)=CRITICAL(17 直接调用者)但 15 个是其自身单测,唯一生产调用者 `apply_retry_decision`,0 流程 |
| ⑧ | 模型可按 reasoning-effort 声明不同 wire id,而非所有 effort 都发同一个 id(1.0.14#6,A2/319) | 网关普遍把 effort 暴露成**不同模型**而非请求参数(`gpt-5` vs `gpt-5-high`、`-fast` vs `-thinking` sku),BYOK 用户不声明 per-effort id 就根本够不着。原生做法:`ModelVariant { effort, model_id }` + `ModelInfo/ModelEntryConfig/ConfigModelOverride/DefaultModelJson` 各加 `variants`(TOML `[[model.<id>.variants]]`,JSON 走 serde 自动解析);`ModelInfo::model_at(effort)` 命中变体则换 id、否则回落 `model`;`ModelsManager::model_for_effort` 经 `resolve_catalog_key` 解析(调用方传的是 wire id 非 catalog key);`route_model_for_effort` 作为**唯一换 id 点**,会话创建/模型切换/子代理 spawn 三处共用,不会各自漂移。换 id 必须在 effort 支持门之后——门按 catalog id 解析,先换就查不到。**顺带补上本特性自身会引入的洞**:`resolve_catalog_key` 与 `selectable_catalog_key_for_persisted` 的 slug 匹配从 `info.model == id` 改为 `info.has_model_id(id)`,否则以变体 id 落盘的会话 resume 时解析不回 catalog 条目(`variants` 为空时两者逐字等价,零回归面)。远程 catalog 手写解析处填 `Vec::new()` 并注释说明:远端无 per-effort id 契约,variants 是本地声明 | `ff0e0e7c` | 8 个测试通过:TOML 解析+按 effort 路由、无变体回落 base、`has_model_id` 覆盖 base 与变体、变体 id 反解 catalog key;既有 3 个 `resolve_catalog_key` 与 3 个 `selectable_*` 测试全数保持;shell --no-fail-fast lib 5187 passed / 2 failed(同既有 macOS 环境伪失败,+5 为新测试),36 个集成二进制全部 0 failed。impact(resolve_catalog_key)=LOW(4 直接调用者,0 流程);detect_changes medium/1 流程(Apply→As_str,改动落在 step1 的 `ConfigModelOverride::apply`;medium 源于给 3 个结构体加字段波及 58 符号的行号映射,非行为风险——variants 处处默认空) |
| ⑨ | OpenAI 兼容错误码地基:`error.code` 语义化贯通(解锁 1.0.13#13 大图炸会话,并为 1.0.18#10/#11 铺路) | 你指出的方向对了——**地基我们树本就有一半**:`error.rs` 早已解析 OpenAI 标准信封 `{"error":{message,type}}` 与扁平代理信封 `{"code","error"}`,但 `ErrorBody` 连 `code` 字段都没有,`FlatErrorResponse.code` 只被当 `error_type` 兜底用——**语义码在边界就被丢掉了**。于是所有分类只能靠 message 文本嗅探,换个 provider 措辞就失效(我们树里 DashScope 的 "multimodal file" 就是这么补的)。原生做法:边界处一次解析成 `ApiErrorCode`(`InvalidImage` / `ContextOverflow(String)` / `Other(String)`,`#[non_exhaustive]`——下一个语义码是加变体而非再挂一个 const 和 `\|\|` 链),`Serialize`/`Deserialize` 走裸 wire 字符串故线上字节不变;`lenient_code` 吞掉嵌套 `code` 槽里的非字符串(严格 `Option<String>` 会让整个信封解析失败,把可重试的流错误降级成致命 `Serialization`);`try_parse_error` 返回 `ParsedError` 结构体取代 `(String,String)` 元组;扁平信封的 `code` 槽被 gRPC kebab 码与 type 槽复用,故只放行语义值。分类改为码优先、文本兜底:`is_image_processing_error` 增 `InvalidImage` 码 + 两种方言的图像 JSON 指针(`.image.source.` Messages / `.image_url.url` Chat Completions)+ 流错误码臂;**保留**我们自有的 DashScope "multimodal file" 分支;新增 `is_byte_size_overflow_coded`(字节档 vs token 档分离:代理把 413 包成 400/500,状态码看不出来,而 token 档剥图无用);`is_context_length_error` 增码路径 + **429 带 Retry-After 且无结构化尺寸码时不判上下文超限**(限流是瞬态,重试环该退避而非快速失败,压缩分类器也不该步进输入阶梯)。手写 `clone_error` 补上 `error_code`/`code` 传递——否则任何克隆过的错误都丢掉分类 | `ab339094` | 12 个 sampling-types 单测 + 4 个 retry.rs 分类测试 + `stream_collect_error` 往返测试扩为同时断言 `error_code`;**红绿双验**(摘掉 `|| is_byte_size_overflow_coded()` → `classify_byte_size_overflow_code_strips_images_under_any_status` FAILED);既有 DashScope/Anthropic 措辞、retry_veto、context_length_error_matches_backend_variants 全数保持;`cargo check --workspace --all-targets` 零错误;sampling-types 319 / sampler 181 均 0 failed;shell lib 5187 passed / 2 failed(同既有 macOS 环境伪失败),45 个测试二进制 ok;detect_changes low/0 流程;⚠ impact(is_image_processing_error)=CRITICAL 但 2 个直接调用者、20 个受影响符号中 18 个是 retry.rs 自身单测、0 流程 |
| ⑩ | 429 重试上限可按模型配置(1.0.18#10 ★★★),顺带覆盖子代理遵守所选模型 retry/rate-limit(1.0.18#18 ★★) | **挖出真 bug**:`spawn.rs` 构造会话 sampler `RetryPolicy` 时,`max_retries` 从模型配置解析后传入,紧挨着的 `rate_limit_retry_threshold: 2` 却是**硬编码字面量**——这个旋钮在我们树里根本不存在,不是"缺 per-model 覆盖",是连全局都不可配。429 要单列上限是因为它通常带很长的 `Retry-After`,与传输错误共用预算能让一个回合卡住几分钟;BYOK 差异更大(配额按分钟刷新的网关要快速重试,恢复很慢的要立刻失败告知用户)。原生做法:三级优先级抽成可单测纯函数 `resolve_rate_limit_threshold(request_override, policy)`(请求覆盖→会话策略→常量默认),`request_task.rs` 改为调用它不再内联;`SamplerConfig` 加 `Option<u32>`(`#[serde(default)]`,旧持久化配置仍可加载);`classify_error` 本就用 `max_retries.min(threshold)` 收口故无需额外 clamp;配置面 `ModelInfo`/`ModelEntryConfig`/`ConfigModelOverride`/`ModelsConfig` 各加字段,`apply` 与 `apply_global_scalar_defaults` 沿用"仅 Some 才覆盖 / get_or_insert"既有语义;魔数 2 归位到 `RATE_LIMIT_RETRY_THRESHOLD`。**关键辨别**:`sampling_config_for_model` 只是其中一条路径,**主回合走 `AcpSession::reconstruct_full_config`**——它从 chat-state 存的 SamplingConfig(字段更少、无此旋钮)重建,`max_retries` 取自会话字段。只在前者加一行则主回合永远拿到 None,特性空转。故照 `max_retries` 既有走法补全链路:`AcpSession` 新增字段 → `spawn_session_on_thread`/`spawn_session_actor` 新增参数(仅 2 个调用点)→ 两调用点各自解析。子代理调用点因 `effective_sampling_config` 传参即被 move,故 move 前取出阈值存局部变量再传——**子代理由此遵守自己选中模型的 429 设置**,正是 1.0.18#18,一条链路覆盖两项 | `68697b03` | 2 个 retry.rs 单测(三级优先级、策略 0 视为未设、`Some(0)`/`Some(1)` 确实禁用而默认阈值仍重试)+ 3 个 config.rs 测试(TOML 解析并**贯通到 SamplerConfig**、未声明保持 None 而非硬编码、`[models]` 全局默认是 fallback 非 override);**红绿双验**(把 `sampling_config_for_model` 那行改成 None → `parses_model_rate_limit_retry_threshold` FAILED:"the per-model ceiling must reach the sampler");`cargo check --workspace --all-targets` 零错误;sampler 183 / 0 failed;shell lib 5190 passed / 2 failed(同既有 macOS 环境伪失败),43 个测试二进制 ok。⚠ detect_changes **high**/6 流程,全部是 `Spawn_session_actor → *`(会话 spawn 流,正是改签名之处,范围符合预期);HIGH 来自给 spawn 入口加参数波及整条流程而非行为风险——调用点仅 2 个且编译器穷尽校验,全量测试与基线逐字一致。⚠ impact(sampling_config_for_model)=HIGH(11 直接调用者,8 个是自身测试,3 个生产调用者恰为辅助模型/provider task/子代理);impact(spawn_session_on_thread)=LOW。**已知局限**(与既有设计一致,非本次引入):会话字段 spawn 时解析,回合中途 `/model` 切换不更新会话级 429 上限——`self.max_retries` 有完全相同局限;走 `sampling_config_for_model` 的路径每次现算不受影响。彻底修需让 `reconstruct_full_config` 从模型目录现查,要给 `AcpSession` 注入目录访问权,另一个量级 |
| ⑪ | 子代理/任务输出等待默认上限 10min → 1h(1.0.16#8 ★★) | **对账发现是纯常量差**:上下游管道逐字相同(同样的 `format_wait_cap_ms` / `max_wait_block_ms` / `NOFY_MAX_WAIT_BLOCK_MS` 环境变量覆盖 / `{max_wait_ms}` 占位符按会话插值),只有 `MAX_WAIT_BLOCK_MS_DEFAULT` 一个 600_000、一个 3_600_000。顺带核对同区 `DEFAULT_WAIT_TIMEOUT`(30s) 与 `MAX_MULTI_WAIT_IDS`(20) 均已一致。10 分钟低于模型实际请求超时的分布上端,长构建/长测试几乎必然先拿回"仍在运行",白烧一个回合去轮询——而完成本会自动唤醒父任务。截断仍安全:任务完成会 ping 模型,被截断的等待只多花一次轮询不丢结果;传输期限更短的宿主仍可用环境变量压回,且服务端强制值与工具描述广告值同源。原生做法:常量改值并在 doc 补上选型理由(高于 p99)而非只改数字;`format_wait_cap_ms` 增小时档(否则 1h 渲染成难读的 `~60 min`),三档一律**向下取整**——上限绝不能读起来比实际更长;真实工具描述本就走 `{max_wait_ms}` 占位符自动跟随,故只更新 doc 示例/测试夹具快照/模块 doc;`20-background-tasks.md` 补钳制说明、环境变量逃生口,以及"等待返回但子任务仍在跑时不要杀它" | `5ece02e1` | `format_wait_cap_ms_derives_its_unit_and_rounds_down` 扩为覆盖小时档(默认值 → `3600000 (~1 h)`、9_000_000 → `~2 h` 向下取整、3_599_999 → `~59 min` 不误升档);`capped_wait_timeout_clamps_and_defaults` 补"恰等于上限钳到自身、低于上限原样透传"两例(原断言 `Some(600_000) → cap` 在新上限下语义已变,故改写非删除);两个期望值由同一常量推导的测试自动跟随无需改。nofy-tool-types 103 / 0 failed;nofy-tools 2863 passed / 43 failed,43 项全在 `grep::tests`(31)+`opencode::glob::tests`(12)——**已用 git stash 在干净树上复现同样失败,证实为既有环境伪失败(本机 `rg` 不在 PATH),与本次改动无关**;改动覆盖的 4 个测试单独跑全数通过。impact(format_wait_cap_ms)=LOW、impact(max_wait_block_ms)=LOW(各 1 直接调用者,0 流程);detect_changes low/0 流程 |
| ⑫ | `--sandbox strict` 写入收窄到 `sessions/`(1.0.14#13 ★★,安全) | **安全洞**:Strict profile 的 `read_write` 用的是与 Workspace/Devbox 共用的 `essential_writable_paths(workspace)` = `[workspace, nofy_home(), ...temp]`,即 strict 下整个 `~/.nofy` 可写。而那里放着 config.toml、凭据、hooks、skills、requirements.toml、sandbox.toml——**被沙箱困住的代码可以改写它们,从而在下一次运行时提升自己的权限**。沙箱的意义正是阻止这件事。原生做法:paths.rs 新增 `essential_writable_paths_strict(workspace)` = `[workspace, nofy_home()/sessions, ...temp]`;`essential_writable_paths` 的 doc 去掉 "strict" 字样避免两个助手适用面被读错;profiles.rs 的 Strict 臂改用它,`nofy_home()` 仍留在 `read_only` 链上(Strict 是 `default_read: false`,进 read_only 才可读)——AuthManager/config/hooks/skills 都要**读** home,只是不该**写**。关键约束写进注释:Landlock 无法从一个写授权里挖掉子目录,故 home 必须整个离开 read_write,只单独授 sessions/(会话与 events JSONL 所在,也是 strict 唯一需要持久化的东西)。**对账依据(决定敢不敢做的关键)**:上游 `grok_home()` 子目录集合与我们几乎逐一对应(logs/memory/worktrees/worktree_pool/mcp/debug/workflows/trace-exports/slash-mru.json/sandbox-events.jsonl/plugin-data/vendor/workspace/hooks-paths),**上游在同样的面上仍然做了这个收窄**——即"strict 下这些写入会失败"是上游明知并接受的设计,它们都是尽力而为的辅助面且 temp 仍可写。我们树并不处于独特暴露面 | `87b77dfe` | 新增 `strict_profile_writes_only_sessions_under_nofy_home`,断言四件事:sessions/ 与 workspace 仍可写、`nofy_home()` **不在** read_write、`nofy_home()` **在** read_only,并对照 Workspace profile 未被收窄;**红绿双验**(Strict 臂改回 `essential_writable_paths` → 该测试在 `!read_write.contains(&home)` 上 FAILED);nofy-sandbox 68 passed / 0 failed(54+8+5+1),带与不带 `enforce` feature 一致;既有 `strict_allowlist_includes_run_and_var_when_present`、`strict_capability_set_builds_without_openable_dev_tty` 保持通过;`cargo check --workspace --all-targets` 零错误;impact(essential_writable_paths)=LOW。⚠ detect_changes 返回 "No changes detected / risk none"——gitnexus 索引未覆盖 nofy-sandbox crate,属索引盲区,**不作为安全性证据**。**未验证(明确声明)**:Landlock/bwrap 强制是 Linux-only(`apply_sandbox` 里 `#[cfg(target_os="linux")]`),本机 macOS 上 profile 基本是建议性的,无法端到端验证真实写入被拒;已验证的是 profile 解析出的 read_write/read_only 集合本身正确。若在 Linux 上跑 strict 发现某辅助面因写失败而硬崩(而非降级),应把该目录单独加回 read_write,而非回退整个收窄 |
| ⑬ | MCP OAuth 进程内去重的凭据水合失败不再被吞掉(核实 1.0.16#7 时挖出的真缺口) | 核实该条 changelog 时分出三层,本项是第三层。①**死锁本条早已对齐且我们更完整**:上游在 oauth.rs 内用 `discover_metadata_bounded`(5s)包住发现,我们在 servers.rs:1036 有同名同值 `OAUTH_DISCOVERY_TIMEOUT = 5s`,在调用点 4394-4398 包住 `discover_and_prepare_auth`,超时后除 warn 外**额外发 `McpOAuthDiscoveryTimeout` 事件给 UI**(上游没有)。②**legacy 端点拒绝不可移植**:上游把 `LegacyEndpointFallback` 判为 `NoAuthorizationSupport`,但我们 vendored 的 rmcp 没有 `resolve_metadata`/`AuthorizationMetadataSource` 这套 API(全域零匹配),属钉版差异需先升 rmcp。③**真缺口**:oauth.rs 去重分支里跟随者等到 leader 认证成功后执行 `let _ = mgr.initialize_from_store().await`——**返回值被丢弃**;上游对应处是 `if !ensure_oauth_ready(..).await.hydrated { return Err(..) }`。store 损坏/竞态/权限问题致水合失败时我们仍返回 Ok,把一个**没有 token 的 manager** 交回调用方,下一次请求要么死于令人困惑的 auth 错误,要么静默重开一次用户没要求的浏览器授权流。改为水合失败即返回带服务器名的明确错误 | `754d0e28` | 唯一调用方 servers.rs:2983 本就用 `if let Err(e)` 接住、warn 后 `return false`,故这是把"假成功"变成"调用方早已能处理的真失败",无需改调用方(已人工核对)。nofy-mcp 180 passed / 0 failed(与基线一致)+ 另一二进制 3 / 0;`cargo check -p nofy-mcp --all-targets` 零错误;impact=LOW。⚠ detect_changes 返回 "No changes detected / risk none"——gitnexus 索引未覆盖 nofy-mcp(与 ⑫ 的 nofy-sandbox 同一盲区),**不作为安全性证据** |
| ⑭ | MCP 启动不再卡在固定 8 并发批次(1.0.13#19 性能,核实 A5 时确认的真缺口) | `start_mcp_servers` 用 `buffer_unordered(8)`。固定 8 个槽位意味着配了 9 个以上 MCP server 时,第 9 个必须等前面某个腾出槽位才能**开始**——哪怕前 8 个只是慢。而"慢"在这里是常态:OAuth 发现本身就有 5s 预算(servers.rs:1036),stdio server 的 init 握手要等子进程起来,任何一个卡住都把整条尾巴押后。改为不设上限的 `join_all`,理由(上游注释 + 我们的具体触发条件):数量由配置界定(非无界输入)、工作是 I/O 密集(故并发数不需对齐核数)、而任何上限都是一个要排在卡住的服务器后面等的槽位。`server_name` 需 `.to_owned()`,因 `async move` 否则会在把 `server` 移进 `start_mcp_server` 的同时借用它。**返回顺序不变**:`buffer_unordered` 完成顺序乱但 `collect::<Vec<_>>()` 按原流序收集,`join_all` 同样按入参序返回,故 4 个调用方(extensions/mcp.rs:785、session/mcp_servers.rs:90 与 131、nofy-workspace/handle.rs:2643)无需改动 | `7a276928` | nofy-mcp 180 passed / 0 failed(与基线逐字一致)+ 另一二进制 3 / 0;改后全树 `buffer_unordered(` 在 nofy-mcp 与 nofy-shell/session 下仅剩本提交注释里的那一处提及。impact=LOW;⚠ detect_changes 对 nofy-mcp 仍返回 "No changes detected"(索引盲区,与 ⑫⑬ 同),故以 183 个测试 + 4 个调用方人工核对为准 |

> ⚠ **工具可靠性记录（重建索引后定论，影响以后每次提交前的验证方式）**
>
> 2026-09-14 跑了 `npx gitnexus analyze` 重建索引（原索引停在 `cee815e`/9-03，落后约 350 个提交；重建后 203191 nodes / 430253 edges / 300 flows，`status` 报 up-to-date，`Agents.md`、`Claude.md` 已同步且两者均被 gitignore）。**但重建并未修好 `detect_changes` 在 `nofy-sandbox` / `nofy-mcp` 上的假阴性**——根因不是陈旧也不是覆盖不全，而是调用图解析缺陷：
>
> - `context({name: "essential_writable_paths"})` 返回 `incoming: {}`（**零入边**），但 `profiles.rs:355` 与 `:439` 确实直接调用它（已人工读过源码）。
> - `context({name: "authenticate_mcp_server_dedup"})` 同样 `incoming: {}`，但 `servers.rs:2983` 确实调用它。
> - 两者的 `outgoing.calls` 都含**跨语言伪边**：前者指向 `desktop/src/src-reconstructed/renderer/assets/katex-*.jsx:e.extend#1`（KaTeX 的 JS 方法），后者指向 `nofy-desktop/packages/acp/scripts/gen-ext-names.ts:drop`——均为裸名匹配误中。
> - 对照：`nofy-shell` 与 `nofy-sampler` 的入边解析正常（`impact(resolve_model_list)`=72 直接调用者、`impact(classify_error)`=17、`impact(sampling_config_for_model)`=11 含 3 个跨文件生产调用者）。故缺陷是**按 crate 分布的**，不是全局的。
> - 索引确实含这两个 crate（`meta.json` 的 `fileHashes` 里 nofy-mcp 12 个文件、nofy-sandbox 15 个；符号能查到且行号区间正确），所以不是"没索引"。
>
> **结论与做法**：`impact(direction:upstream)` 与 `detect_changes` 都依赖入边，故在 `nofy-sandbox` / `nofy-mcp` 上会给出 "0 callers / No changes detected / risk none" 的**假阴性**，重建索引不能修好。在这两个 crate 上改代码时，**不得把 gitnexus 结论当安全性证据**；改用：① `grep` 人工枚举真实调用方并逐个核对其错误处理；② 跑该 crate 全量测试；③ 红绿双验。⑫⑬⑭ 三次提交均已按此做，并在提交说明里明确标注了盲区。另：`outgoing` 的跨语言伪边会**虚增** impact 计数，故 HIGH/CRITICAL 评级也需看具体调用者名单而非只看数字（本会话多次遇到：报 CRITICAL 但绝大多数调用者是符号自身的单测）。

> ⚠ **双索引布局与定位方式（2026-09-17 建立）**
>
> 现在有两份 gitnexus 索引，可用于跨树对账：
>
> | 树 | 路径 | commit | 规模 |
> |---|---|---|---|
> | 二次开发分支 | `/Users/mac/nofy-build` | `7fc6be8` | 4856 files / 203191 nodes / 430253 edges / 9334 clusters |
> | 上游 | `/Users/mac/nofy-upstream`（`git worktree add --detach` 自 `upstream/main`） | `37949780` | 3593 files / 128672 nodes / 311481 edges / 7185 clusters |
>
> **定位必须传绝对路径**：两条注册表项的 `name` **都是 `nofy-build`**（名字取自 git remote，而 worktree 与主仓共享 remote）。`resolveRepoFromCache` 的匹配顺序是 id → name（**首个命中即返回**）→ 绝对路径精确匹配 → 名字子串，所以传 `repo: "nofy-build"` 会**静默命中注册表里排在前面的那一个**，顺序一变就会惄惄打到另一棵树上。CLI 同理（`-r /Users/mac/nofy-upstream`）；cwd 不参与解析，在 worktree 里不带 `-r` 会报 "Multiple repositories indexed"。
>
> 已三向验证两份索引确实独立且定位正确：上游独有的 `LengthPolicy` 在上游索引命中（`xai-grok-sampling-types/src/conversation.rs:516`）、在我们索引报 not found；`lossy_input_budget` 在上游索引命中于 `xai-grok-shell/src/session/compaction.rs`（② 抽出后两树同名）。
>
> **重建索引并未修好入边缺陷**：在全新索引上重测 `context({name:"essential_writable_paths"})` 仍为 `incoming: {}`，且 `outgoing.calls` 仍含那条指向 `desktop/src/src-reconstructed/renderer/assets/katex-*.jsx:e.extend#1` 的跨语言伪边。故上方工具可靠性记录里的结论不变：在 `nofy-sandbox` / `nofy-mcp` 上改代码仍需走 grep 枚举调用方 + 全量测试 + 红绿双验。
>
> 维护：上游 worktree 不需要时用 `git worktree remove /Users/mac/nofy-upstream` 清掉（其 `.gitnexus` 约 1.2GB 会一并删除）；若只想释放磁盘而保留 worktree，用 `npx gitnexus remove /Users/mac/nofy-upstream`。两者都不会影响主仓库索引（已核：主仓 `meta.json` 的 repoPath/lastCommit/indexedAt 在上游索引前后逐字不变）。

| ⑮ | compaction 不再把 TPM 限流误判为确定性上下文溢出(1.0.26,重新评估时核实出的 T0) | **修的是原生⑨ 留下的自相矛盾**。⑨ 给 `SamplingError::is_context_length_error()`（**方法**）加了 error_code 路径与 429 例外，但同文件的**自由函数** `is_context_length_error(message)`(error.rs:799) 纯文本匹配、两个能力都没有，而 compaction 分类器用的正是自由函数(session_compact.rs:58 导入，:77 与 :120 调用)。两处的状态码分支**都已排除 429**，但文本判定那一支没有——而且它在 `classify_sampling_error` 里是 `||` 的**第一项**。于是一个 429(TPM 限流)只要 message 含 "too long for this model"/"maximum context length" 之类措辞(限流错误引用配额与尺寸措辞极常见)，就被判 `Deterministic`——**压缩直接放弃、不退避重试**，会话因此卡在上下文超限状态，而真正病因是瞬态限流、配额刷新后本可恢复。原生做法（**三处消费点全部闭合**，不止 changelog 指的那一处）：① `classify_sampling_error` 的 Api 臂—429 一律 `false`，否则 `error_code.is_size_overflow() || 文本 || (4xx 且非 408)`；顺带把 ⑨ 加的 `error_code` 接上（原先被丢在 `..` 里，compaction 分类器完全没用上结构化码）。② `classify_response_event_error` 同一 bug 第二处：数字状态码分支早已排除 429，但**收尾那个独立的文本 if 没有**；守卫针对 429 而非砍掉文本检查（非数字 code 时文本判定仍生效）。③ `sampler_turn.rs:1003` 的 `error_type` 标签—grep 全树发现的**第三个消费点**，不在原计划内；它给遥测与用户可见 `RetryState` 选标签，同样会把 429 误标 `context_length` 把诊断引向错误方向。④ `error.rs` 自由函数 doc 明写它与方法版**同名不同义**，防止第三次出现。**刻意未改**：方法版的 429 例外仍要求 `retry_after_secs.is_some()`。两者答的是不同问题——方法版服务 `is_retry_vetoed`(“重试环该不该放弃”，Retry-After 是服务端明确要求等待的信号)，compaction 分类器答“重发同样载荷是否必然再次失败”，而 429 按定义瞬态。该区分写进 doc 而非强行统一(统一会偏离上游语义且无证据支持) | `5b37d12d` | 3 个新测试(4 种限流措辞×429 全保持瞬态且同措辞配 400 仍判确定性、结构化码在措辞陌生时仍能判定、事件分类器同规则含非数字 code 对照);**红绿双验**(429 守卫换成 `if false` → FAILED "a 429 must stay transient even when its message reads like an overflow");既有 `sampling_api_4xx_is_deterministic_except_408_and_429`、`sampling_api_500_with_context_length_message_is_deterministic`(证明守卫未放宽过头)、`response_event_context_length_message_is_deterministic`、`response_event_numeric_codes_match_http_classification` 全数保持;sampling-types 319 / 0 failed;shell lib 5194 passed / 2 failed(同既有 macOS 环境伪失败,+3 为新测试),38 个测试二进制 ok;`cargo check -p nofy-shell -p nofy-sampling-types --all-targets` 零错误;impact(classify_sampling_error)=LOW(3 直接调用者:1 生产+2 测试,0 流程);detect_changes low/0 流程 |
| ⑯ | `mkdir`/`touch` 在 auto 模式与安全命令表免提示(1.0.11 批次,A4 权限;路线图 §8.7) | **落点不在 auto 模式白名单**——两边 `ROUTINE_PREFIXES` 都没有 mkdir/touch(已核对),真正的机制是「创建 ⇒ `FileWrite` floor ⇒ 不放行」这条链。原生做法:`ShellFileMode` 加第三态 `Create`(仍映射 `AccessKind::Edit`,故 deny/ask 规则照样覆盖 `touch <path>`);`shell_path_command_operands` 把 `"rm" \| "rmdir"` 与 `mkdir`/`touch` **拆开**(破坏性动词绝不跟随改判);`is_creation_program` 抽成共享谓词,由写路径分类器与安全命令表共用以防漂移;`command_words_creation_paths` + `WritePathsSplit.creation_paths` 把创建操作数**单独追踪**而非丢弃;`script_has_cwd_change` 让 `cd /etc && touch hosts` 的相对操作数 fail closed(否则按请求 cwd 解析成 `<cwd>/hosts` 就绕过了 `/etc` 保护);`bash_creation_protection` 把创建操作数接进 `edit_target_protection`。**规格 §8.7 的两处错误已在路线图更正**:crate 是 `nofy-workspace` 不是 `nofy-shell`;「单一消费端」错得危险——`protected_edit` 有 4 个放行闸口,其中**分类器后的 `pre_decision` Bash 臂**与 **sandbox 自动放行**原本只靠 `FileWrite` floor 兜住创建,摘掉 floor 后两处同时失守,须各补一个 `protected_edit` 守卫(上游 `manager/mod.rs:2093`/`:1992` 同样如此)。顺带:修 ⑭ 遗留的 `use futures::StreamExt;` 未用告警;更正 `auto_mode/mod.rs` 的 `ROUTINE_PREFIXES` doc(原写「mkdir/touch 缺席因为写模型已 Block」,改后写模型**刻意不再** Block 创建,缺席本身才是闸口) | `84c1819d` | 10 个新测试;**红绿双验 5 项**——G1 去掉分类器后 pre-decision 的 `protected_edit.is_some()` → `left: 0, right: 1`(`touch /etc/hosts` **零提示放行**);G3 去掉 `protected_edit` 的 Bash 臂 → 同上;G4 去掉 `has_cwd_change` fail-closed → `left: None, right: Some(Sensitive)`;G5 把 mkdir/touch 改回 `Write` → 11 个创建测试 **7 个 FAILED**(含漂移检测器与端到端);G7 去掉安全表条目 → "mkdir x must auto-allow via the safe list"。**G2(sandbox 闸口)无法红绿验证**:`is_active()` 读 `OnceLock SANDBOX`,进程内一次写入、测试无法置位;替代证据=与上游同位置逐字对齐 + `sandbox_auto_allow_respects_real_file_write_floor` 新增断言证明创建确实清掉了 assessment floor(即该 conjunct 承重)。2 个既有 GB-5153 测试的示例命令 `touch CANARY` → `cp src CANARY`(`touch` 已不再是「词可见的内容写」,与上游同一处做的同一替换)。nofy-workspace **1771 passed / 0 failed**(改前基线 1761 / 0)+ 21 + 1 + doctests;`cargo check --workspace --all-targets` 零错误(8m20s);impact(`command_write_paths_split`,upstream)=**HIGH**(55 受影响,2 个直接调用者 `evaluate_bash`/`command_write_paths_in_tree`,3 模块,0 流程)——直接调用者与人工 grep 逐一吻合,HIGH 来自测试的传递扇出。⚠ **操作事故**:中途跑了 `cargo fmt -p nofy-workspace -p nofy-mcp`,改了 **40 个文件 785 行**。根因:本 fork 全树**不是 rustfmt-clean**——`xai_*`→`nofy_*` 全局改名打乱了 import 字母序(`xai_acp_lib` 排在 `tokio` 后,`nofy_acp_lib` 排在前),rustfmt 一跑就重排全仓 import。**本仓禁止跑 `cargo fmt`**;已逐文件回退(35 个纯 churn 文件 `git checkout --`,余下手工挑出 churn hunk 反向恢复),并用 `git show HEAD:file` + rustfmt 探针核对残留为零 |
| ⑰ | 企业策略经签名 requirements.toml 限制可选模型(1.0.16#1,E 类第 5 项;路线图 §8.9 规格) | 我们树此前只有**用户级** `[models] allowed_models`(接线完整:`ModelGlobSet`、`user_selectable`、session 回退、prompt 阻断、测试都在),requirements 层没有对应字段,所以企业策略限制不了模型——用户自己就能改宽。原生做法:`AllowlistPin { List, FailClosed }` 三态(**「策略存在但读不出来」必须与「没设策略」分开**,否则一份坏策略文件静默变成不设限);`Constrained<T>` 加 `pin_ref()`/`is_pinned()`(放独立 `impl<T>` 块,这两个访问器不该要求 `T: Clone`),并把 `Constrained` 的 `Default` 从 derive 改手写(derive 会带上 `T: Default`,而 pin 载荷的 Default 无意义——「未钉」就是 `pin: None`);`Requirements.allowed_models`;`apply_requirements_inner` 加 `ReqStrArray`(Absent/Value/Malformed 三态)+ `pin_str_array!`;`EffectiveAllowlist` 取代四处直接读 `cfg.models.allowed_models`,持有**已编译**的 GlobSet 以免在逐条目 catalog 循环里反复编译(为此给 `ModelGlobSet` 加 `compile_slice`,`compile` 委托它,既有 7 个调用点零改动)。**三个安全要点,漏一个就是绕过**:① Fleet **替换** user 不是并集(否则用户往自己配置加 pattern 就能放宽);② Fleet **只匹配 model id 不匹配 catalog key**(key 是用户自定义的,若键名也能满足 fleet 限制,`[model.grok-4-alias]` 里放 `grok-3` 就逃出去了;用户级仍按 key 或 id 匹配,这个不对称正是重点);③ fail-closed 文案**不得**叫用户去改 `allowed_models`(那是 requirements 层每次加载都重钉的值)。为此把 provenance 贯穿到运行时消息:新增 `allowlist_denied_message`/`allowlist_excludes_all_message`,接进 `acp_agent` 两处与 `session_setup` 一处(上游同样做了这个拆分,`remote_config/resolution.rs:306-326`)。**顺带修掉一个既有缺口**:`resolve_model_override_to_config` 此前**完全没有** `user_selectable` 检查,子代理可被指向 catalog 里任何模型;现按上游语义补上——用户级列表只是 picker 过滤,隐藏掉的模型仍是合法子代理目标;fleet pin 是权威的,被策略排除的模型不能靠开子代理绕过去;`agent_config` 缺失时 fail closed(拿不到配置就无法证明这次排除只是 picker 行为) | `9fbf1910` | 12 个新测试(11 在 `config/tests.rs`,1 在 `subagent/tests/rest.rs`)。nofy-shell lib **5206 passed / 2 failed**,基线 5194 / 2;那 2 个是已记录在案的 macOS 环境产物(`ephemeral_workspace_reports_skip_instead_of_fake_success`、`save_through_symlinked_session_root_stays_in_canonical_project`),与本改动无关;+12 与新测试数逐一吻合。**红绿双验 5 项**:R1 让 fleet 也匹配 catalog key → `ignores_user_catalog_key` FAILED(逃生口被抓住);R2 让 fleet pin 被忽略、用户列表说了算 → 10 个 `allowed_models` 测试 **4 个 FAILED**;R3 把 `FailClosed` 当不设限 → `malformed_allowed_models_fail_closes` FAILED;R4 删掉子代理闸口 → `resolve_model_override_respects_a_fleet_pin_but_not_a_user_picker_list` FAILED;R5 把 `is_fleet()` 恒返回 false(provenance 塌缩)→ 2 个 provenance 测试 FAILED。既有测试 `validate_selectable_rejects_bad_allowlists` **未改一字仍通过**(它只断言 `.contains("grok-3")` 与 `is_err()`,用户级文案保留了这两点)。五项全部拿到失败输出,且 5 次变异后 `diff -q` 逐一确认两个被改文件与变异前字节相同(无残留)。impact(`resolve_model_catalog`,upstream)=**MEDIUM**(12 个直接调用者、2 模块 Models/Agent、0 流程)——但 12 个**全是测试**,4 个生产调用点(`models.rs:281/322/619/1067`)一个都没报,又是已知的调用图缺陷(只作下界);生产面靠人工 grep + 5206 全绿兜住。其中 `allowed_models_marks_selectable_by_wildcard_key_or_model` 与 `allowed_models_empty_is_unrestricted` 两个既有测试未改一字仍通过,即用户级行为逐字未变⚠ 夹具认知纠错:3 个新测试的断言初版写错——`resolve_model_catalog` 的 catalog 里还带一个**内置默认条目**(`grok-4.5`),所以「全部可选」必须断言成性质(`all_selectable`)而不是精确 id 列表;用户级 pattern 也从 `grok-4*` 改成精确 `grok-4`,否则会把内置条目一起扫进来。是夹具认知问题,不是代码问题。本轮**未跑 `cargo fmt`**(⑯ 的教训:本仓全树不是 rustfmt-clean,改名打乱了 import 序),`git diff --stat` 恰为预期的 10 个文件 |
| ⑱ | MCP 协议钉版从 2025-06-18 抬到 2025-11-25（1.0.17#1 拆分后的 (a) 项；E 类第 4 项，第一性原理复查） | **起因是台账标题本身就是误读**：原记「elicitation 升级到 2026-07-28 多轮」，据此我还给用户造了个「钉 2026-07-28 还是 2025-11-25」的选择题。第一性原理复查后两者都不成立。**钉版这个旋钮在我们进程里到底控制什么**：rmcp 2.1.0 全树只有一处按协议版本分支（`handler/server.rs:140`，SEP-2164 把 resource-not-found 映射成标准 `INVALID_PARAMS`），而那是**服务端**路径——我们是纯 MCP 客户端（`nofy-mcp` 无 `ServerHandler`/`RoleServer`/服务端 transport，4 个连接点调的都是裸 `handler.serve(transport)`），该分支永不执行。我们自己代码里也没有任何一处按 MCP 协议版本分支（`ProtocolVersion` 的命中全是 ACP 的 `acp::ProtocolVersion::V1` 与 daemon 的 `nofy_channel::hello`，不同协议）。客户端侧 rmcp 只用它做两件事：`initialize` 里发出去、以及把**服务端回应**的版本写进 `MCP-Protocol-Version` 头（`streamable_http_client.rs:413/515` 用的是 `init_result`，不是我们的值）。**所以钉版的唯一实际作用就是「我们向远端服务端自称支持什么」。**由此推出原则：**声明我们真正实现并能行使语义的最高版本**——不是上游声明什么，不是 SDK 叫 LATEST 什么，也不是 changelog 暗示什么。**按这个原则，最硬的理由与上游无关，是我们树内部自相矛盾**：`make_client_info` 早就声明了 URL 模式 elicitation 能力（`with_form(schema_validation=true)` + `with_url(...)`)，而 URL elicitation 晚于 2025-06-18；声明旧版意味着版本严格的服务端根本不会发它，**我们声明的能力有一半在空转**。改钉 `V_2025_11_25`，它同时满足四条：①仍保留 `initialize` 握手的最新修订；②rmcp 2.1.0 自身的 `LATEST`，其 wire 语义 SDK 已实现（所有请求参数带 `_meta`、错误响应 `id` 可选，见 rmcp `model/meta.rs:24,82` 与 `model.rs:474`）；③上游在同一调用点钉的同一值（`servers.rs:4027`）；④我们 handler 已实现的面（`create_elicitation` + `on_url_elicitation_notification_complete`，`servers.rs:4635/4663`）。**(b) 项 SEP-2575 无会话发现（2026-07-28）不可移植，登记 defer，原因已精确**：该修订**删掉了 `initialize` 握手**，版本严格的服务端会**拒绝**自称 2026-07-28 的 `initialize`（上游注释原话「Never pin 2026-07-28 here」）；它只能经 `server/discover` 探测协商，需要 rmcp 3.x 的 `ClientLifecycleMode::Discover` + `serve_with_lifecycle` 两阶段 probe_modern/serve_legacy 回退。**上游在 rmcp 3.2，我们在 2.1**，rmcp 2.1.0 全树无这套 API（唯一的 Discover 命中是 OAuth 授权服务器元数据发现，spec-2025-11-25 §4.3，另一回事）。故 (b) 的前置是 rmcp 大版本升级 + 一套握手状态机，是立项不是改版本号 | `99d54359` | 2 个新测试，把钉版与能力声明**绑成一对**：`make_client_info_pins_protocol_version`（含一条独立的 `assert_ne!(V_2026_07_28)`，让最危险的那个具体错误在失败信息里说出原因，而不只是「版本变了」）、`make_client_info_advertises_form_and_url_elicitation`（含 opt-out 路径断言，证明 `advertise_elicitation` 是活开关不是摆设）。nofy-mcp **182 passed / 0 failed**，基线 180 / 0，+2 与新测试数吻合。全仓 grep 确认 `V_2025_06_18` 已无代码引用（只剩两处解释「为何不停在旧版」的注释）。**红绿双验 3 项**：G1 把钉版退回 `V_2025_06_18` → `make_client_info_pins_protocol_version` FAILED（`left: 2025-06-18, right: 2025-11-25`）；G2 把钉版设成 `V_2026_07_28` → 同测试 FAILED（`left: 2026-07-28`）；G3 删掉 `.with_url(UrlElicitationCapability::new())` → `make_client_info_advertises_form_and_url_elicitation` FAILED。三次变异后 `diff -q` 确认文件与变异前字节相同。注：G2 是被 `assert_eq!` 先抓住的，那条独立的 `assert_ne!(V_2026_07_28)` 守的是另一种情形——有人把 `assert_eq` 的期望值改成 2026-07-28 来「让测试通过」，此时 `assert_ne` 会红；它的价值窄但真实⚠ **红绿harness 本身出过一次故障并已修正**：第一版驱动脚本把变异参数传给 python 时漏了第三个（`python3 - "$1" "$2"` 少了 `"$3"`），变异从未落地，三个用例全部「通过」——**红跑变绿说明是 harness 坏了，不是测试通过了**。修正后加了双重校验（python 侧 `assert a != b` + shell 侧 `diff -q` 确认文件确实变了），重跑得到正确结果。回溯核对：⑯ 的 5 项与 ⑰ 的 5 项红绿都是把变异内联在 heredoc 里、且每项都打印了 「mutation applied」并确实 FAILED，不受此 bug 影响。**一项测试无法覆盖、如实登记**：删掉整个 `with_protocol_version(...)` 调用（改为跟随 rmcp 默认）在当前不可测——rmcp 2.1.0 的 `LATEST` 恰好就是 `V_2025_11_25`，删掉后观测值不变，测试照样绿。而「显式钉住以免依赖升级时静默改wire」正是这个 setter 存在的理由。该性质只能靠 review + 注释守，测试守不住；等 rmcp 的 LATEST 前进后，这条断言会自动变成有效守卫 |
| ⑲ | 记忆整合从会话退出路径挪到会话启动，退出不再被 30 分钟的模型调用阻塞（1.0.15#2，A5 性能；核实轮次里发现的真缺口） | **核实结论比台账原注更严重**。原注只说「疑似真缺口，待确认是否阻塞关闭」；确认后三点：① **确实阻塞**——`run_session_end_memory_pipeline` 在两个退出臂（channel-closed、shutdown）都是被 `.await` 的；② **预算不是 60 秒而是 30 分钟**——`maybe_run_dream` 的 doc 写「The model call has a 60s timeout」，代码是 `Duration::from_secs(30 * 60)`，**doc 与代码矛盾**，故关闭会话最坏等半小时；③ 顺带纠正原注另一处误判——dream-check 定时器臂**已经是** `spawn_local`、不阻塞 select 循环（核实中一度以为它内联，读了实际代码才纠正），所以缺口只在退出路径 + 缺启动侧。原生做法：`spawn_dream_check` 后台跑整合并交回句柄（上游版本前面还有 `await_init_reindex()`，我们**没有**后台初始重索引任务——全树 `init_reindex` 零命中——故按我们树的实际形状裁掉，不是漏掉）；`stop_dream` = abort + await 句柄，**关键性质**：模型调用在 `execute_dream` 写整合 marker **之前**，故中途 abort 不盖 marker、闸门对下次启动仍打开（反过来才是 bug：marker 写了再 abort，工作被记成已完成而永不重试）——已核对我们 `run_dream_inner` 的顺序确实如此；启动侧进循环前 spawn 一次，门控 `!is_subagent && memory.is_enabled()`（子代理共享工作区记忆，不能各自整合）；定时器臂改为持句柄 + `is_none_or(|h| h.is_finished())` 守卫后才重新 spawn（原来无条件 `spawn_local`，而整合锁只在模型调用**返回后**才拿，故偏短的 check 间隔会堆出一串任务、每个白烧一次模型调用再在锁上排队），并把 `!is_subagent` 补进臂的门控；退出侧删掉 `run_exit_dream` 三处判定与那句内联 `.await`，两个退出臂改为在 session-end 索引工作**之前** `stop_dream` 以免重叠（`queries_meeting_session_end_threshold` 仍有其它调用方 hooks.rs:113 与其自身测试，未成孤儿）；30 分钟字面量抽成 `DREAM_MODEL_CALL_TIMEOUT` 常量、doc 指向它，并把「因此绝不能在用户等待的路径上 await 它」写进常量 doc——这次 doc 与代码矛盾就是这么来的 | `154b3281` | 4 个新测试。`run_session_spawns_launch_dream` 驱动真实 `run_session` 循环断言启动整合确实触发（照上游同名测试移植；我们的 `run_session` 8 参签名与 `create_test_actor_with_memory` 与上游逐字一致）；`session_end_pipeline_does_not_run_dream` **先直接调一次 `maybe_run_dream` 证明闸门是开的**（否则测试会空洞地通过），再断言退出流水线不增加 `dream_count`；`stop_dream` 两用例分别钉「abort 而非 await」（`std::future::pending()` 活任务 + 1 秒上限）与「absent/finished 时 no-op」。nofy-shell lib **5210 passed / 2 failed**，基线 5206 / 2（那 2 个是已记录在案的 macOS 环境产物），+4 与新测试数逐一吻合。**红绿双验 3 项**：H1 删掉启动侧 spawn → `run_session_spawns_launch_dream` FAILED；H2 把 `maybe_run_dream().await` 放回退出流水线 → `session_end_pipeline_does_not_run_dream` FAILED；H3 `stop_dream` 改 no-op（不 take 句柄）→ 2 个 `stop_dream` 用例同时 FAILED。三次变异后 `diff -q` 确认两个被改文件与变异前字节相同。**一项无法红绿验证，如实登记**：定时器臂的 `is_finished()` 防堆叠守卫没有专门测试——观测它需要「整合慢于 check 间隔」的时序，得在完整 actor 循环里注入可控延迟的模型调用，代价与收益不匹配。缓解证据：整合锁 + `check_dream_gates` 已保证不会数据损坏（并发只白烧模型调用，不会写坏记忆），故该守卫是**效率**修复而非**正确性**修复；正确性由 H1/H2/H3 覆盖。detect_changes=22 符号/risk low/0 流程（正确列出 `run_session_end_memory_pipeline`、`maybe_run_dream`、`run_dream_inner`、`run_session` 等，但新增的 `spawn_dream_check`/`stop_dream` 不在索引里） |
| ⑳ | MCP 策略闸口前移到配置写入之前（1.0.18#1 + 1.0.19#3，A6 治理；两项同源同修） | 缺口形状不是「没有拦截」而是「拦截点太晚」：`nofy-pager/src/mcp_cmd.rs` 里 `managed_settings`/`allowlist`/`blocked`/`denied` **零命中**，`run_add` 直接写配置并打印 「Added … to user config」，`run_set_enabled` 直接翻 `enabled`。运行时仍会拦（`session/managed_mcp.rs:288`），故**不是权限绕过**；后果是**假成功** + 配置文件里落下策略禁止的条目。上游 `mcp_cmd.rs:639` 注释原话:「Policy check BEFORE the config write, or a blocked server is written under a success [message]」。原生做法：`find_configured_server(cwd, name)`（按名字在会话 merge 读的全部来源里定位——user/project TOML、`.mcp.json`、managed gateway、plugin registry；**两个闸口共用**，以免它们对「这个名字指哪个定义」产生分歧）、`policy_refusal(allowlist, server)`（复用既有 `McpDisabledReason` 的 Display，故拒绝信息**自带策略文件路径**——这正是 1.0.19#3「清晰信息」的实质：不只说被拦，还说被哪份策略拦）、`policy_add_refusal` + `policy_enable_refusal` 各带一个可注入 allowlist 的 `_with` seam（理由同上游：运行时读进程级 `OnceLock`，测试无法 populate）。接线：`run_add` 在 `save_mcp_server_config_at` 之前；`run_set_enabled` 在 `save_mcp_server_enabled_in` 之前且**只在 `enabled` 时**——禁用一个被拦的 server 永远应允许，拒绝它会把那条条目卡死在配置里。`load_cli_plugin_registry` 从模块私有提到 `pub(crate)`，否则 `find_configured_server` 找不到 plugin 提供的 server。**两个 block reason 刻意不实现**（已写进 doc）：`Lockdown`（某来源封锁它绑定的一切）与 `ProjectPin`（`enableAllProjectMcpServers = false`）——我们 managed-settings 模型里没有这两个概念（`enable_all_project_mcp_servers` 全树 0 命中 vs 上游 6），**为凑齐而猜语义比留着缺口更糟**。同理 `policy_add_refusal` **不收 `scope` 参数**：上游用它走 `ProjectPin` 那条腿，我们没有那条腿，加一个用不上的参数只会暗示一个不存在的保证 | `21416546` | 4 个新测试，全走可注入 seam：无策略时闸口不挡路；deny 命中报 "matches deniedMcpServers" **且带策略文件路径**；restricted allowlist 未授权报 "not in allowedMcpServers"（与 deny 是两种不同拒绝，修法不同）且已授权的放行；未知 server 名保持沉默（「没有这个 server」是调用方的错，闸口不与它抢）。nofy-shell lib **5214 passed / 2 failed**，基线 5210 / 2（那 2 个是已记录在案的 macOS 环境产物），+4 与新测试数逐一吻合。**红绿双验 2 项**：P1 把 add 闸口改成恒放行 → 3 个 add 测试 FAILED；P2 让 `policy_refusal` 丢掉规则名与来源（只留 "blocked by organization policy"）→ 断言规则文案与策略路径的两条 FAILED。两次变异后 `diff -q` 确认字节还原。**两处无法红绿验证，如实登记**：① `mcp_cmd.rs` 里的**接线**没有测试——`run_add`/`run_set_enabled` 在 nofy-pager 里且以 `std::process::exit(1)` 结束，单测够不着；上游是用 `pager-pty-harness/tests/mcp_toggle_cli.rs`（400+ 行 PTY 级测试，带真实 `denied_mcp_servers` 夹具）覆盖的，我们的 pty harness 里**没有 MCP 用例**。② `policy_enable_refusal` 的**被拦路径**端到端同理，需要 managed-settings 夹具，本 crate 没有那个 seam，故只测了「未知名字保持沉默」这条腿。缓解证据：两个闸口共用 `find_configured_server` 与 `policy_refusal`，而 `policy_refusal` 的两种文案都被 P2 钉住。注:P1 的 3 个 add 测试里只有 2 个 FAILED 是**正确**的——第三个 `add_refusal_is_none_when_policy_is_unrestricted` 期望的就是 `None`,闸口恒放行时它理应仍通过;该用例的作用正是钉住「无策略时不挡路」,防止闸口被写成无条件拒绝 |

> ⚠ **工具可靠性记录的更正（2026-09-17，全量重建后实测）**
>
> 上方那条记录把缺陷定性为「按 crate 分布的入边解析失败（nofy-sandbox / nofy-mcp），nofy-shell 与 nofy-sampler 正常」。**这个定性是错的**，在一次完整全量重建（203377 nodes / 430880 edges，`ANALYZE_EXIT=0`，indexed commit = current = `0745b76`）之后重测，真实情况更差：
>
> | 符号 | 所在 crate | incoming | outgoing | 实际情况 |
> |---|---|---|---|---|
> | `essential_writable_paths` | nofy-sandbox | **`{}` 零入边** | 2 条（含 1 条指向 KaTeX JS 的跨语言伪边） | `profiles.rs:355` 与 `:439` 确实调用它 |
> | `classify_sampling_error` | **nofy-shell** | 3 条（正确：1 生产 + 2 测试） | **`{}` 零出边** | 它确实调用 `is_context_length_error`、`acp::Error::internal_error` 等多个函数 |
>
> 所以缺陷**不是按 crate 分布的，也不只是入边**：它是**双向的、按符号零散分布的调用图解析不完全**。同一个 nofy-shell 里，一个符号入边完整而出边为空，另一个 crate 里的符号出边有值（但含伪边）而入边为空。全量重建**不能**修好它。
>
> **因此结论比原记录更强，适用于全仓而不只两个 crate**：
> - gitnexus 的调用图结论只能当**下界**用：报出的调用者是真的，但空集**不代表不存在**。
> - `impact` 的 HIGH/CRITICAL 评级与 `detect_changes` 的 "0 affected processes" / "risk none" **均不得单独作为安全性证据**，无论哪个 crate。
> - 必须配套：`grep` 人工枚举调用方 + 该 crate 全量测试 + 红绿双验。
>
> **本会话已落地提交的正确性不依赖 gitnexus**：③–⑮ 每一项的验证都是全量测试 + 红绿双验 + 人工核对调用方，三者都与索引无关。gitnexus 结果在提交说明里始终是作为额外信号引用、并在盲区处明确标注，没有任何一项拿 "risk none" 当过通过依据。
>
> 另记一次操作事故（与工具无关，是命令写法错）：用 `npx gitnexus analyze 2>&1 | tail -6` 刷索引，`tail` 截断了输出且管道吞掉了退出码（任务报 exit 0 实为 `tail` 的），analyze 实际中途停止，把索引留在 `incrementalInProgress` 脏状态并丢了主 DB 文件、留下孤儿 sidecar（`lbug.shadow`、`lbug.wal.checkpoint`）。gitnexus 自行检测到并强制全量重建自愈（清理孤儿 sidecar + 73.8s 重建成功）。**与本会话早先 `cargo test ... | tail -30` 掩盖失败是同一错误模式**：管道尾部截断 + 不查真实退出码。正确写法：输出重定向到文件、显式 `echo EXIT=$?`、不用 tail 截断管道。

辨别力记录:`conversation_content_bytes`(mutations.rs)也用 `encrypted_content.len()`,但它是**内存足迹日志测量**
非 token 估算,base64 校正不适用,故不改——原生实现要按我们架构的语义辨别落点,不是见 base64 就改。

**待评估的后续原生候选**(按架构合理性排序;①② 已落地):
- ③ 压缩起始即刷新 context bar(UX 润色非架构合理性;我们 `apply_session_event` 无 AgentView、`AutoCompactStarted` 仅带 percentage,需线入 view 或加 wire 字段,中等 pager 手术 + ~9min pager 测试周期。优先级低)
- ④ MCP 瞬断重试 / 后台流式时抑制 auto recap(韧性想法,需各自调查与我们分歧——批15 托管连接器、批17 subagent 结构——的相容性)
- ⑤ 1.0.12 余条已定性:worktree reflog(缠批23 fast-worktree 云面)、interjection 等待(缠批17 结构分歧)、截断措辞(我们树无对应)、monitor 10h(已对齐)、credit upsell(云跳过)——均非原生候选

## 待合并项逐项决定(1.0.13–1.0.24 + 缺失 crate,2026-09-13)

校准后方法下对剩余缺口逐条定性。决定码:**原生**=架构无关好想法、我们树原生实现( DO );
**移植**=自包含逻辑可干净移植;**跳云**=云依赖(红线跳过);**跳剔**=已物理剔除特性;
**跳歧**=与我们有意分歧纠缠(跳过/defer);**对齐**=已有或对我们无对应;**决策**=行为变更需用户拍板。
价值标注:★★★ 高(P0 韧性/模型管理/安全)、★★ 中、★ 低(UX 润色)。

### A. 原生实现候选(DO,按主题×价值)

**A1 韧性(★★★,计划 P0;多为"新增逻辑"类,比"重写既有核算"更易原生落地)**
- 1.0.13#1 截断响应自动续传(不再 fail turn)★★★—**核实:确为真缺口,且是大项**。上游为独立模块 `length_salvage.rs`(329 行)+ `LengthSalvage` 六字段每回合状态机 + `&mut salvage` 穿过 turn.rs 约 10 个函数签名 + `LengthSalvageStreak` + 续传提醒注入 + 回合完成语义(`MaxTokens` vs `EndTurn`)+ TodoGate 脱离 + 耗尽事件;并需 `ConversationRequest.length_policy` 字段(我们树 43 处构造点,24 处用 `..Default::default()`,约 19 处需手改)。**三档预算有两档我们不能用**:`is_cursor_agent`(cursor 专属)与远程 `length_salvage_budget`(云,红线),原生版只剩环境变量一档,等于要自行重设预算分层。结论:值一个独立会话,不在长会话尾部开工(⑤ 已把"工具调用完整"那一档落地,纯文本截断仍失败)
- 1.0.13#7 瞬态推理失败(卡死/断连/5xx)自动重试 ★★★(配 1.0.14#5 重试原因短提示 ★★)—**主体已对齐,余量已落地 ⑦ `5e46ce16`**;1.0.14#5 短提示—**核实:重归类为 pager UX,按用户指示跳过**(上游原文 "Retry status in **composer and title** now shows a short reason for the retry",composer/title 均为 pager UI)
- 1.0.13#9 会话保存断电加固(prompt 后/掉电更可靠)★★★—**已落地 ⑥ `0574edf8`**
- 1.0.13#12 参数完整的截断工具调用照常执行 ★★—**已落地 ⑤ `86fa559f`**
- 1.0.13#13 >2000px 大图不再炸会话(多请求)★★(我们有图像输入面)—**已落地 ⑨ `ab339094`**(码驱动图像分类 + 字节档尺寸码剥图;未对真实 >2000px 拒答做端到端验证)
- 1.0.14#12 上下文超限的压缩失败降级输入而非原样重试 ★★—**对账定性:早已完整实现,台账原列为待办是错的** `c5f613f1`。逐段核实:`InputStage{Verbatim,VerbatimFitted,Lossy}` 三档阶梯(compaction.rs:1039,与上游同名同序、初始档同由 `verbatim_input_enabled` 决定)、确定性上下文溢出时的 step-down(1159-1161,注释同为"避免进入 incompactable 状态")、`input_overflow_rejections` 计数 + `compaction_input_overflow_rejections` tracing 字段、`CompactionRetryDegraded` 遥测(nofy-telemetry/events/mod.rs:434,含 from_stage/to_stage/reason)、两个预算助手 `prepare_conversation_for_verbatim_summarization` 与 `fit_conversation_to_budget` 均具备。diff 后只剩 `.into()` vs `.as_str()` 与"上游把 lossy 预算抽成具名函数"两类差异;本次只做后者(纯可读性,零行为变更),算式与上游逐字相同。**另记一处未做的上游差异(不属本条)**:`suppress_auto_compaction` 上游多收 `&message`(把失败原因写进抑制记录),我们签名是 `(reason, estimated_tokens, context_window)`,属独立小项。验证:新增 `lossy_input_budget_leaves_summary_headroom_and_saturates`(钉住 70% 切片、工具 token 超切片时饱和到 0 不回绕、整数除法向下取整 9→6、零窗口→0);`cargo test -p nofy-shell --lib compaction` 108 passed / 0 failed;detect_changes low/0 流程
- 1.0.16#7 /mcps 触发的 MCP OAuth 不再死锁 ★★—**核实:分三层,死锁本条早已对齐**。①**死锁已对齐且我们更完整**:上游在 oauth.rs 内用 `discover_metadata_bounded`(5s)包住发现;我们在 servers.rs:1036 有同名同值 `OAUTH_DISCOVERY_TIMEOUT = 5s`,在调用点 4394-4398 包住 `discover_and_prepare_auth`,超时后除 warn 外**额外发 `McpOAuthDiscoveryTimeout` 事件给 UI**(上游没有)。②**legacy 端点拒绝不可移植**:上游还把 `AuthorizationMetadataSource::LegacyEndpointFallback` 判为 `NoAuthorizationSupport`,但我们 vendored 的 rmcp **没有 `resolve_metadata`/`AuthorizationMetadataSource` 这套 API**(全域零匹配),属钉版差异,与 D 类"MCP elicitation 钉版"同性质,需先升 rmcp。③**去重跟随者水合校验是真缺口—已落地 ⑬ `754d0e28`**:`let _ = mgr.initialize_from_store()` 吞掉失败,水合不成也返回 Ok,把没有 token 的 manager 交回调用方
- 1.0.16#8 子代理/任务输出等待默认 1h 上限(原 10min)★★—**已落地 ⑪ `5ece02e1`**(纯常量差 + `format_wait_cap_ms` 补小时档)
- 1.0.19#10 终端停止读取时回合中 UI 冻结修复 ★★—**核实定论:shell 侧按构造已对齐,不可能因消费端停读而冻结**。逐段追了 `nofy-shell-terminal/src/pty_session.rs` 的输出泵链路:阻塞读任务(`spawn_blocking`)→`mpsc::channel::<Vec<u8>>(64)` 有界通道→`tokio::select!` 消费循环→`flush_output`→`send_routed_notification`→`gateway.forward_fire_and_forget`。关键事实:`nofy-acp-lib/src/gateway.rs:71` 的 `tx` 是 **`mpsc::UnboundedSender`**,`enqueue` 走 `tx.send(..).is_ok()`(gateway.rs:330)——**永不阻塞**,只在接收端已 drop 时返回 false 并 debug 日志丢弃。故消费循环不会停在 gateway 上→`data_rx.recv()` 持续抽干→有界(64)通道不会填满→读任务的 `blocking_send` 不会阻塞→PTY 始终被读。另核两点:`output_ring` 有界且超限即 `drain(..excess)`(pty_session.rs:450-453),不会无界膨胀;消费循环内唯一的 `.await` 锁点 `pty.lock().await`(448、593) 均为短作用域——593 取完 `output_offset`/`target_client_id` 两个字段就释放守卫,再做 base64 与发送,无跨 await 长持锁。结论:若上游该修复在 shell 侧,我们没有这个 bug;若在 pager 侧(终端面板自己的读取器),则属 A8 已跳过。两种情形都不需做内核工作。(上游历史全为 "Synced from monorepo" 无粒度,无法定位其具体修法,故以我们树的构造证据为准)
- 1.0.19#11 退出时关闭终端面板崩溃修复 ★★—**核实:重归类为 pager UX,按用户指示跳过**。"terminal pane"(终端面板)是 pager 的 UI 概念,退出期面板生命周期属 A8 同类
- 1.0.22#16 skill 注入/rewind 后恢复粘贴内容崩溃修复 ★★—**核实:重归类为 pager UX,按用户指示跳过**。粘贴内容恢复在 `nofy-pager/src/wrap_restore.rs`、`wrap_clipboard_image.rs`、`app/actions.rs`,是 composer 侧;与原生② 的 rewind **不同区**(②改的是 chat-state 的 token 重播种,不涉及粘贴缓冲)

**A2 模型管理(★★★,计划批27 P0;我们已有 modality 字段基础)**
- 1.0.14#6 模型按 reasoning-effort 声明不同 id ★★★—**已落地 ⑧ `ff0e0e7c`**
- 1.0.18#10 限流请求的重试行为按模型可配 ★★★—**已落地 ⑩ `68697b03`**(并修掉 spawn.rs 里硬编码的 `rate_limit_retry_threshold: 2`)(与 #6 一次设计)
- 1.0.18#11 按模型 mTLS 客户端证书 ★★—**归属已核实(2026-09-17,路线图 §8.8):是 BYOK/自建网关需求,不是 xAI 云或 Grok 模型需求**。上游 `mtls_cert_dir` 是 `[models.<id>]` 每模型字段,四条校验钉死用途(必须配同表 HTTPS `base_url`;不得与 `api_base_url` 或 provider 的 `api_base_url` 并存——「一个 mTLS 身份只能有一个目的地」),消费点 `sampler/client.rs:618` → `shared_http/mtls.rs` 找 `client.crt`/`client.key`、回退 `tls.crt`/`tls.key`(**K8s Secret 命名约定**),按证书内容摘要缓存客户端(上限 16)、`https_only` + 禁重定向。xAI 自家端点走 bearer token,永不用此路。**恰是我们 fork 的受众**,零云依赖,规模约等于 ⑩ 一轮(注意 ⑩ 的坑:`reconstruct_full_config` 才是主回合路径)。⚠ 勿与 `otel/otlp.rs` 的 `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE` 混——那是 OTLP 标准环境变量契约,属遥测面。定性由「有企业需求再取」升级为「**与受众直接相关,可排期**」
- 1.0.18#18 子代理会话遵守所选模型的 retry/rate-limit ★★—**已随 ⑩ `68697b03` 覆盖**(子代理 spawn 前取出所选模型阈值传入)
- 1.0.22#18 模型后端选择修复(config.toml 显式 chat_completions 不被同 slug 兄弟覆盖)★★★(与 D20 configOf 同区)—**已落地 ④ `187b7131`**

**A3 Hooks 能力(★★,架构能力扩展;我们已有 hooks 基建)**
- 1.0.13#2 hook 可请求用户确认工具调用(非仅允许/拒绝)★★
- 1.0.13#3 hook 可请求延迟/注入工具后上下文 ★★
- 1.0.14#2 PostToolUse hook 向模型提供反馈/上下文 ★★★
- 1.0.14#3 SDK 注册的 PostToolUse hook 同样提供模型反馈 ★★
- 1.0.14#17 每个 SessionEnd hook 独立超时(单个慢 hook 不拖延关闭)★★

**A4 权限/安全(★★★ 安全项优先)**
- 1.0.22#15 auto 模式不再瞬间执行破坏性 `git checkout --`(走模型)★★★(安全)—**已落地 ③ `b6fb756e`**
- 1.0.21#1 权限模式在 plan 模式保持可见、退出恢复 ★★
- 1.0.22#5 文件编辑权限提示自动展开 diff 行 ★★—**纯 pager UX,按用户指示跳过**(A8 同类)
- 1.0.14#13 `--sandbox strict` 限制写入仅 ~/.nofy/sessions ★★—**已落地 ⑫ `87b77dfe`**(Linux 强制路径未在 macOS 端到端验证)

**A5 性能(★★,启动/响应延迟)**
> ⚠ **编号方案缺陷(核实 A5 时发现,影响全表)**:本台账的 `1.0.xx#N` 编号**不对应上游 changelog 的行号**,而是早前自行枚举的序号。例:台账写"1.0.13#18 auth 已配时带 MCP 的会话启动更快",但上游 1.0.13 第 18 行是 "Truncation error messages"——完全无关。**故跨树核实必须按内容匹配,不能按编号。**下方已为每项补上上游原文以便后续核实。
- 1.0.13#18 auth 已配时带 MCP 的会话启动更快 ★★ — 上游原文:"Session startup with MCP servers is now much faster when auth is already configured." **部分核实**:我们 servers.rs:1836-1848 已有存量凭证快速路径(非交互模式下 `get_access_token()` 成功即 `return ManagerReady`,不走发现),疑似已对齐,待确认
- 1.0.13#19 MCP 启动不再卡在固定 batch ★★—**核实:真缺口,已落地 ⑭ `7a276928`**。上游原文 "MCP server startup no longer stalls behind a fixed batch size";我们原为 `buffer_unordered(8)`,上游 `xai-grok-mcp/src/` 全域已无 `buffer_unordered`,改为 `join_all` 不设上限
- 1.0.14#24 大仓库首条消息不再等仓库状态扫描 ★★ — 上游原文:"First message on large repositories no longer waits on repository status scan." **未核实**:我们树无 `repo_status`/`status_scan` 符号,需先定位对应实现(可能在 pager 的 git_info)
- 1.0.14#25 大会话内存不再在回合完成/子代理 spawn 时阻塞 agent ★★ — 上游原文:"Large session memory no longer blocks the agent during turn completion or subagent spawning." **核实:回合完成路径未复现,退出路径同源已随 ⑲ 修掉,子代理路径未定位**。`run_memory_flush` 全树三个调用点:`run_loop.rs:436` 已在 `spawn_local` 内(idle flush 定时器,非阻塞)、`run_loop.rs:1224` 是 `user_requested`、`slash_exec.rs:57` 是斜杠命令——后两处是用户显式请求,阻塞是预期语义。**故「回合完成时阻塞」在我们树里不成立**。会话结束路径确实内联,但与 1.0.15#2 同源,已随 ⑲ 一并修掉。「子代理 spawn 时阻塞」按内容匹配未定位到上游对应实现,留待后续
- 1.0.15#2 会话关闭更快(记忆整合挪到下次启动)★★ — 上游原文:"Session close is now faster because memory consolidation runs at the next launch instead of blocking exit." **核实:真缺口,已落地原生⑲ `154b3281`。且比原记的更严重**——原注只说「疑似,待确认是否阻塞关闭」,确认后:①**确实阻塞**,`run_session_end_memory_pipeline` 在两个退出臂(channel-closed、shutdown)都是被 `.await` 的;②**预算不是 60 秒而是 30 分钟**——`maybe_run_dream` 的 doc 写「The model call has a 60s timeout」,代码是 `Duration::from_secs(30 * 60)`,**doc 与代码矛盾**,故关闭会话最坏等半小时;③顺带纠正原注的另一处误判:dream-check 定时器臂**已经是** `spawn_local`、不阻塞 select 循环(核实中我一度以为它内联,读了实际代码才纠正),所以缺口只在退出路径 + 缺启动侧。修法与红绿见 ⑲ 行
- 1.0.15#5 首响应延迟降低(会话启动时后台开模型连接)★★ — 上游原文:"First reply latency is reduced by opening the model connection in the background when a session starts." **部分对齐**:我们有 `warm_async_http_client()`(mvp_agent/mod.rs:823-828,起线程预热共享 HTTP client)与 `chat_modes.warm_in_background()`(acp_agent.rs:459),但未见针对**具体模型端点**的 TLS/连接预开;待确认是否等价
- 1.0.15#7 新建会话更快返回(MCP/启动工作后台化)★★ — 上游原文:"Creating a new session returns faster; MCP tools and other startup work happen in the background." **核实:已对齐**。`run_loop.rs:391-395` 进主循环前就 `tokio::task::spawn_local` 了 `ensure_mcp_tools_initialized()` + `maybe_start_running_task`,即 MCP 工具与启动工作都在后台;`run_loop.rs:1508` 另有一处同型 spawn。无需工作
- 1.0.18#22 resume picker 单次磁盘遍历标注本地会话 ★★(批22 已动 resume picker) — 上游原文:"Resume picker now labels local sessions with a single disk walk instead of per-row lookups." **未核实**;注:resume picker 在 pager 侧,可能属 A8
- 1.0.18#26 新会话 start hooks 后台化更快响应 ★★ — 上游原文:"New sessions start responding faster by running start hooks in the background." **核实:按内容匹配失败,上游对应实现未定位**。上游 `xai-grok-shell/src/session/` 全域搜 `fire_session_start_hooks`/`start_hooks` **零命中**,故无法按符号对照。我们侧有 `SessionCommand::DispatchSessionStartHook`(`run_loop.rs:1942`,`commands.rs:728`),是命令派发形态。**结论:待另找上游实现名后再判**;不轻易判「已对齐」也不轻易判「缺口」
- 1.0.22#27 打开/恢复会话不再因读 MCP 配置卡顿 ★★(与本轮配置迁移同区) — 上游原文:"Opening or resuming sessions no longer pauses the interface while reading MCP config files." **未核实**;注:"卡顿界面"指 pager,可能属 A8

**A6 策略/治理(★★,我们已有 nofy-governance/marketplace/requirements)**
- 1.0.18#1 托管策略在写入前阻止不允许的 MCP server/marketplace 安装 ★★ — **核实:MCP 侧真缺口,marketplace 侧已有**。marketplace 我们已 fail-closed(`plugin_cmd.rs:880`、`extensions/marketplace.rs:831` 都是 `strictKnownMarketplaces` 拦截)。MCP 侧:我们 `nofy-pager/src/mcp_cmd.rs` 里 `managed_settings`/`allowlist`/`blocked`/`denied` **零命中**,`run_add`(:223)直接写配置并报成功。运行时仍会拦(`session/managed_mcp.rs:288`),故**不是权限绕过,而是假成功 + 配置文件里落下策略禁止的条目**。上游三个闸口(`policy_blocked_servers`/`policy_add_refusal`/`policy_enable_refusal`)我们**全部 0 命中**;根因是缺一整层策略裁决抽象(`McpSubject` 0 vs 44、`McpBlockReason` 0 vs 37、`mcp_blocked_reasons`/`mcp_subject`/`mcp_subject_for_tier`/`policy_enable_error` 全 0),而管道全有(`project_scoped_mcp_names`/`to_acp_mcp_server`/`materialize_mcp_config`/`load_mcp_server_configs_with_project` 都在)。上游 `mcp_cmd.rs:639` 注释原话:「Policy check BEFORE the config write, or a blocked server is written under a success [message]」。**已做,原生⑳**。**但 §10.2/§10.3 的规模估计是错的,实施时实读推翻**:我们 `session/managed_mcp.rs:222-256` 早有同层裁决(`McpDisabledReason::{Denylist,Allowlist}` 各带 `source: PathBuf`,Display 文案与上游逐字相同,`for_blocked_server` 即上游 `mcp_blocked_reasons` 的角色,`is_server_allowed`/`is_server_denied` 早已 pub),连「为可测把 enforcement 拆成可注入 allowlist 的纯函数」这个设计都已独立做过(`apply_mcp_server_policy` 的 doc 原话就在讲 OnceLock seam)。**真正缺的只有 CLI 侧调用点**,故实际是「两个薄闸口 + 接线」,远小于 ⑩。错误模式见路线图 §10.2bis
- 1.0.19#3 被组织策略阻止的 MCP server 显示清晰信息、配置变更前拒绝 ★★ — **核实:真缺口,与 1.0.18#1 同源同修**。两个子缺口:①「配置变更前拒绝」= `policy_enable_refusal`(上游 `mcp_cmd.rs:641`,我们 0 命中);②「显示清晰信息」= `mcp list` 的裁决表(上游 `mcp_cmd.rs:167,181-183,207-208` 显示 `blocked_reason` 与 "blocked by organization policy" 注记,我们 `mcp_cmd.rs` 无任何 blocked 显示)。上游 `McpBlockReason` **每个变体都带 `source: PathBuf`** 指明是哪份策略文件拦的(Deny/NotGranted/Lockdown/ProjectPin 四变体),这正是「清晰信息」的实质——不只说被拦,还说被哪份策略拦。**已做,原生⑳**:我们的 `McpDisabledReason` 两个变体本就带 source,故复用其 Display 即满足;`Lockdown`/`ProjectPin` 两变体我们模型里没有对应概念,**刻意不实现**(见 ⑳ 行)
- 1.0.14#9 grok inspect 把 Claude bypass 锁显示为 advisory 而非 enforced ★ — **本轮未核**(预算用尽)。注:我们 `inspect/mod.rs:551` 已在读 `managed_settings()`,上游同位置多一个 `ManagedOnlyScope::resolve(&ms.mcp_allowlist)`(`inspect/mod.rs:728`)抽象,可能相关
- 1.0.18#8 grok inspect/mcp doctor 显示托管策略详情 ★ — **本轮未核**(预算用尽)。我们 `inspect/mod.rs:551,915` 与 `mcp_doctor.rs:478` 都已在读 `managed_settings()`/`mcp_allowlist`,故可能只是详情粒度差而非缺失;上游 `ManagedSettings` 比我们多三个字段(`project_mcp: PolicyPin`、`plugin_auto_update: PolicyPin`、`extra_marketplaces: Vec<ManagedMarketplace>`)且已抽成独立模块 `permission/managed_policy/`(我们的还在 `permission/resolution.rs`),详情差可能主要来自这里

**A7 会话/resume 上下文(★★)**
- 1.0.19#4 resume 时告知模型仍在运行的 loops/subagents/workflows ★★ — **核实:按内容匹配失败,上游对应实现未定位**。关键词(still.running / running loops / resume+subagent|workflow|loop)在上游只命中测试注释与 `activity.rs` 的忙判定,没有「resume 时把在跑的任务告知模型」的实现。**待另找上游实现名后再判**
- 1.0.19#6 headless 会话支持 --worktree 旗标 ★★(批21 headless + 我们 worktree)
- 1.0.22#13 恢复会话显示你为回合中跟进输入的确切原文 ★★
- 1.0.14#15 失败的 task/todo 工具调用出现在 transcript ★★

**A8 pager UX/渲染(★,多为小项;按需取,价值低于 A1–A7)**
- 渲染正确性:1.0.18#21 表格内删除线、1.0.23#1 表格单元格裸 URL/邮件每行可点、1.0.19#13 跨行 URL 可点、1.0.17#3 /btw 表格单元格选择复制为 TSV、1.0.19#8 多行 bash 块视图换行高亮
- 输入/交互:1.0.18#15 富文本粘贴 Unicode 行分隔符不再损坏 composer、1.0.18#16 单行 prompt 上滚轮滚动历史、1.0.19#14 welcome composer 多行粘贴增高、1.0.20#1 发送后滚动不丢底部留白/跳视口、1.0.21#2 welcome 上输入/粘贴/Shift+Tab 开会话而非建重复
- 状态/布局:1.0.18#14 session dock 对齐/展开更多行/hover 显示停止、1.0.21#3 dock/queue/reveal 行高度规则、1.0.19#18 后台任务完成后回合摘要行不丢间距、1.0.19#19 全屏/最小切换后 thinking 块不保持展开、1.0.14#16 双 Enter 发送时 composer 状态行不闪烁、1.0.22#12 自动后台回合运行时 send-now 按钮/快捷键正常、1.0.22#21 队列跟进按钮顺序 [Send now][edit][cancel]
- 提示/小修:1.0.15#1 重复拖拽复制后提示 /copy /export、1.0.16#4 slash 长名不显空白标签、1.0.18#17 slash 下拉不截断长名、1.0.18#2 quote 前消息从块视图直接引用、1.0.19#2 透明背景终端主题、1.0.22#11 extensions modal tab 聚焦时快捷键、1.0.22#19 home 目录 slash 广告不刷屏、1.0.22#25 skill 公告不重复、1.0.13#15 周期任务提醒停止 monitor、1.0.13#16 计划任务 ID 用完整 UUID 防碰撞
- 工具描述准确性:1.0.22#24 run_terminal_cmd 告知模型前台命令 ~15s 转后台(非 120s)、1.0.22#20 前台 shell 命令不再误报后台提醒/错误 kill 结果、1.0.22#23 Esc 后 /goal 正确启动规划器、1.0.22#26 多会话进程 monitor 事件唤醒空闲会话、1.0.22#14 /skills 从另一 NFS 客户端写入也更新模型、1.0.22#17 子代理/workflow 继承父会话 bash 超时/自动后台、1.0.13#10 压缩失败显示真实错误、1.0.18#18(见 A2)

### B. 跳过—云依赖(红线,DELETED-CLOUD-LEDGER)
- 远端设置:1.0.14#11 冷启动重复远端拉取、1.0.14#23 启动只拉一次、1.0.14#26 本地缓存暖启动、1.0.18#23 慢网不挂起、1.0.18#25 共享设置拉取、1.0.15#4 dock 远端设置、1.0.14#7 prompt 建议远端配置(默认会话模型部分可原生)
- 登录/token:1.0.14#1 OIDC 主动刷新、1.0.15#6 后台 token 刷新、1.0.16#3 过期 token 中断不丢工作(token 面)、1.0.18#13 回合中认证恢复、1.0.19#15 GROK_AUTH_PATH 策略文件、1.0.19#20 登录后首 prompt(MCP 后台连接部分可原生)
- dashboard/hub/远控:1.0.19#5 dashboard 即时显示派发会话、1.0.19#7 dashboard 文案、1.0.22#3 远控选择器按设备分组、1.0.22#8 dashboard 统一头部
- 计费/用量:1.0.13#5 credit upsell Try Again、1.0.19#9 /usage 账户额度
- 上传:1.0.18#24 响应更快(uploads 后台化部分—upload 面跳过)

### C. 跳过—已物理剔除特性
- feedback 全家:1.0.18#4/#5/#6/#12、1.0.19#16/#17(反馈模态/草稿/结构化/图片)
- 媒体生成:1.0.18#9 图像生成参数、1.0.18#7 Chart.js 交互图表(渲染面,若 pager 需要再单独评估)
- 语音:1.0.11#16 /voice parec 回退(批24 已记)
- CLI 下载/自更新:1.0.13#20 CLI 下载压缩、1.0.14#8 Windows CLI 下载更小(nofy update 已删,分歧表已登)
- 彩蛋:grok gboom(缺失 crate,批24 已记)

### D. 跳过/defer—分歧纠缠
- 子代理结构分歧(批17:我们 subagent_coordinator vs 上游 subagent/spawn):1.0.13#17 连接断时 spawn 更快、1.0.14#10 线程/fd 泄漏、1.0.14#14 busy coordinator 等待、1.0.14#20 父等待时子任务误取消、1.0.14#22 大 transcript 恢复子代理、1.0.16#5 spawn 后立即发消息、1.0.18#20 子代理视图重复任务 prompt、1.0.22#6 给已结束子代理发消息续接、1.0.22#7 后台子代理完成显示实际输出——**defer 到子代理结构对齐时统一处理**
- MCP elicitation 协议钉版(批11 V_2025_06_18):1.0.17#1 2026-07-28 多轮 elicitation——**决策点(见 E)**
- fast-worktree/clone 云面(批23):1.0.13 的 worktree reflog(批25 已定性跳歧)
- pager input 重写(bc7f02ed 红线):1.0.15#3 启动期保留输入(缠 pager 重写,defer)
- interjection 原子交付(上游 message-delivery-core,我们缺):1.0.14#19 interjection 原子交付——**defer/评估(批27)**

### E. 决策点(行为变更/需用户拍板)
- 1.0.24#1 Esc 不再取消运行中回合、改提示 Ctrl+C(批30 决策#1,行为变更)—**定性:跳过(A8 pager 同类)**,纯键位行为
- 1.0.19#1 计划 /loop 任务始终后台运行、不再注入回合(批30 决策#2,行为变更;我们有 scheduler)—**定性:待核,很可能已对齐或更完整**。我们 `nofy-scheduler` 是持久义务账本(arm/fire/drop、fork 安全、离线只补放最新一次),`ScheduleEntry` 已带 `goal`/`cwd`/`once`;只需核 fired payload 的投递方式。**核实定论(2026-09-17):按构造已对齐,且强于上游**。`nofy-scheduler/src/fence.rs` 的模块 doc 就是这条不变量:「Scheduled deliveries must not land in a session that is actively working — the fence HOLDS them instead」;`SessionFence::submit` 对 `active` 中的会话返回 `SubmitOutcome::Held` 并压入 `held`,否则 `record` 后 `Delivered`;`release(session)` 由控制器闸口显式放行、按会话 FIFO,且**不自动释放**。我们额外有:持久日志(daemon 的 `schedule.jsonl`)+ fold/apply 事件溯源、fork 安全(子进程绝不继承自己没 arm 的 fire 义务)、离线只补放最新一次(更早的逾期以 `ScheduleEvent::Dropped` 丢弃)、双通道审计(direct + ledger,带「ledger 必须按序包含每条 direct」的不变量测试)、按 schedule 计失败→退避→自禁用。上游 `/loop` 是 pager 侧功能,我们是 daemon 侧持久子系统。归类同 1.0.19#10:**已对齐(按构造)**,不需内核工作
- 1.0.18#3 welcome 屏停留到真正发送、后台预备会话(批30 决策#5,UX 行为变更)—**定性:跳过(A8 pager 同类)**
- 1.0.17#1 MCP elicitation 升级(批28 决策#4)—**原标题「升级到 2026-07-28 多轮」是误读,已按第一性原理重查并拆成两项(2026-09-17)**。**(a) 协议钉版:已做,原生⑱ `99d54359`。** 我们此前钉 `V_2025_06_18`,但 `make_client_info` 已经声明了 URL 模式 elicitation 能力(`with_form(schema_validation=true)` + `with_url(...)`)——**能力声明与协议版本自相矛盾**:URL elicitation 晚于 2025-06-18,声明旧版意味着版本严格的服务端根本不会发它,我们声明的能力有一半是空转。这一条不看上游也能推出来,是本项最硬的理由。改钉 `V_2025_11_25`:它同时是 ①仍保留 `initialize` 握手的最新修订、②rmcp 2.1.0 自身的 `LATEST`(其 wire 语义 SDK 已实现:所有请求参数带 `_meta`、错误响应 `id` 可选)、③上游在同一调用点钉的同一值、④我们 handler 已实现的面(`create_elicitation` + `on_url_elicitation_notification_complete`)。加两个测试把钉版与能力声明绑成一对(`make_client_info_pins_protocol_version`、`make_client_info_advertises_form_and_url_elicitation`),任一半单独改动都会红。**(b) SEP-2575 无会话发现(2026-07-28):不可移植,登记 defer,原因已精确。** **2026-07-28 根本不是钉版候选**——该修订**删掉了 `initialize` 握手**,版本严格的服务端会**拒绝**一个自称 2026-07-28 的 `initialize`(上游 `servers.rs:4027` 注释原话:「Never pin 2026-07-28 here」)。它只能经 `server/discover` 探测协商,需要 rmcp 3.x 的 `ClientLifecycleMode::Discover` + `serve_with_lifecycle` 两阶段 probe_modern/serve_legacy 回退状态机。**上游在 rmcp 3.2,我们在 2.1**;rmcp 2.1.0 全树无 `ClientLifecycleMode`/`serve_with_lifecycle`/`server/discover`(唯一的 Discover 命中是 OAuth 授权服务器元数据发现,spec-2025-11-25 §4.3,另一回事),我们 4 个连接点调的都是裸 `handler.serve(transport)`。故 (b) 的前置是 rmcp 2.1→3.2 大版本升级 + 一套握手状态机,是一个立项,不是一次改版本号
- 1.0.16#1 企业策略经签名 requirements.toml 限制可选模型—**已做,原生⑰ `9fbf1910`**。基建已核:全在(`RequirementSource`/`apply_requirements_inner`/`enforce_str!`/`Constrained<T>`/`ModelGlobSet` 都有,用户级 `allowed_models` 也已完整接线),缺的只是 requirements 层的 pin。可执行规格见路线图 §8.9(站点清单逐个读过上游真实实现,非推断)
- 1.0.22#9 grok-workspaced daemon 暴露文件夹给 Computer Hub(批31 决策)—**定性:跳云,登记有意分歧**(Computer Hub 是云表面)
- 1.0.13#6 iTerm2 粘贴图实时像素预览(媒体/pager 面)—**定性:跳过(A8 pager 同类)**

### F. 已对齐/无对应
- 1.0.13#11 截断错误措辞(我们树无该字符串,批25 已记)
- 1.0.11#10 monitor 10h 超时(已对齐,批24 假阳性已纠)
- 1.0.13#8 Windows ~/.grok+worktree(我们 nofy_home 跨平台,需核 Windows 面但非云)
- 1.0.14#4 grok usage <session-id> 持久化每回合 token/cost(需核我们 usage 面;本地数据可原生,暂列对齐待核)

### 缺失 crate(21,批24 定性,此处汇总决定)
**原生/移植立项**:session-search(批33,★★★ 本地 FTS5 会话搜索)。**待评估(按需求触发)**:session-events、active-sessions、foreign-sessions、fuzzy-file-search、compaction-transcript、pager-diff、image、message-delivery-core(批27)。**跳过**:diag-server/workspace-daemon/mixpanel/login/dashboard-store/feedback/voice/otel(降维)/gboom/update/dirs/bundle(云·剔除·分歧·已有等价)。

### 执行优先级建议
P0(先做,★★★):A1 韧性(截断续传/瞬态重试/断电加固)+ A2 模型管理(per-effort id/per-model retry/mTLS/backend 选择修复)+ A4 安全(auto 拦 git checkout --)。
P1:A3 hooks 能力、A5 性能、A6 治理、A7 resume 上下文。
P2:A8 pager UX(按需取离散小项)。
决策点 E 需用户先拍板再动。B/C/D 跳过/defer 已登记,批中命中即跳。

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
- 版本与安装(0.2.159 起钉死):版本号经构建时 `NOFY_VERSION` 环境变量注入(pager-bin build.rs 读 `NOFY_VERSION` > `CARGO_PKG_VERSION`,Cargo.toml 的 0.2.121 是永久占位,勿改勿信),拼接 12 位 git 哈希;构建命令固定 `NOFY_VERSION=0.2.<n> cargo build --release -p nofy-pager-bin`;安装位置**唯一** `~/.local/bin/nofy`(文档规定位置,PATH 首位),不要再复制到 `~/.cargo/bin`——双二进制时 PATH 跑旧的,会误判修复未生效(0.2.159 排查「仍回答 xAI」即此因);覆盖正在运行的二进制要先 `rm`(直接 cp 报文本文件忙);冒烟前先 `which -a nofy` 确认唯一

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
| 身份清理 | aa2c94ec+14b5c54a | Grok/xAI 身份与品牌遗留全量清理(非上游移植,自主清理):①系统提示词模板 7 个 8 处(主提示词删 "released by xAI"、用户指南引导块改 Nofy Build TUI+`~/.nofy/`、子代理/apply_patch 改 Nofy Build、goal 四模板改 Nofy Build harness)+context.rs 注释,重跑 encrypt_templates.py 重新生成加密产物;②26 用户指南+2 参考文档+9 教程全量 Nofy 品牌化(按代码实况校正 NOFY_* 环境变量/目录/子命令/wire 前缀/遥测 schema/主题名/旗标,删除代码中不存在的 OIDC 变量、mixpanel、Grok Desktop、nofy update、/feedback、fleet 策略抑制段);③default_models.json system_prompt_label "Grok 4.5"→"Nofy"(经模型表注入系统提示词)、显示名/描述去 SpaceXAI,模型 ID grok-4.5 功能性保留;④排查「仍回答 xAI」:根因是双二进制(~/.local/bin 旧版遮蔽修复)+版本号机制(NOFY_VERSION 构建注入);收敛为唯一安装位 ~/.local/bin/nofy;测试 575+610+148 全过,冒烟身份回答纯净 | 0.2.159 |
