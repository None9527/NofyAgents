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
- 1.0.13#1 截断响应自动续传(不再 fail turn)★★★
- 1.0.13#7 瞬态推理失败(卡死/断连/5xx)自动重试 ★★★(配 1.0.14#5 重试原因短提示 ★★)
- 1.0.13#9 会话保存断电加固(prompt 后/掉电更可靠)★★★
- 1.0.13#12 参数完整的截断工具调用照常执行 ★★
- 1.0.13#13 >2000px 大图不再炸会话(多请求)★★(我们有图像输入面)
- 1.0.14#12 上下文超限的压缩失败降级输入而非原样重试 ★★
- 1.0.16#7 /mcps 触发的 MCP OAuth 不再死锁 ★★
- 1.0.16#8 子代理/任务输出等待默认 1h 上限(原 10min)★★
- 1.0.19#10 终端停止读取时回合中 UI 冻结修复 ★★
- 1.0.19#11 退出时关闭终端面板崩溃修复 ★★
- 1.0.22#16 skill 注入/rewind 后恢复粘贴内容崩溃修复 ★★(与本轮原生②rewind 同区)

**A2 模型管理(★★★,计划批27 P0;我们已有 modality 字段基础)**
- 1.0.14#6 模型按 reasoning-effort 声明不同 id ★★★
- 1.0.18#10 限流请求的重试行为按模型可配 ★★★(与 #6 一次设计)
- 1.0.18#11 按模型 mTLS 客户端证书 ★★(BYOK 安全相关)
- 1.0.18#18 子代理会话遵守所选模型的 retry/rate-limit ★★
- 1.0.22#18 模型后端选择修复(config.toml 显式 chat_completions 不被同 slug 兄弟覆盖)★★★(与 D20 configOf 同区)

**A3 Hooks 能力(★★,架构能力扩展;我们已有 hooks 基建)**
- 1.0.13#2 hook 可请求用户确认工具调用(非仅允许/拒绝)★★
- 1.0.13#3 hook 可请求延迟/注入工具后上下文 ★★
- 1.0.14#2 PostToolUse hook 向模型提供反馈/上下文 ★★★
- 1.0.14#3 SDK 注册的 PostToolUse hook 同样提供模型反馈 ★★
- 1.0.14#17 每个 SessionEnd hook 独立超时(单个慢 hook 不拖延关闭)★★

**A4 权限/安全(★★★ 安全项优先)**
- 1.0.22#15 auto 模式不再瞬间执行破坏性 `git checkout --`(走模型)★★★(安全)
- 1.0.21#1 权限模式在 plan 模式保持可见、退出恢复 ★★
- 1.0.22#5 文件编辑权限提示自动展开 diff 行 ★★
- 1.0.14#13 `--sandbox strict` 限制写入仅 ~/.nofy/sessions ★★

**A5 性能(★★,启动/响应延迟)**
- 1.0.13#18 auth 已配时带 MCP 的会话启动更快 ★★
- 1.0.13#19 MCP 启动不再卡在固定 batch ★★
- 1.0.14#24 大仓库首条消息不再等仓库状态扫描 ★★
- 1.0.14#25 大会话内存不再在回合完成/子代理 spawn 时阻塞 agent ★★
- 1.0.15#2 会话关闭更快(记忆整合挪到下次启动)★★
- 1.0.15#5 首响应延迟降低(会话启动时后台开模型连接)★★
- 1.0.15#7 新建会话更快返回(MCP/启动工作后台化)★★
- 1.0.18#22 resume picker 单次磁盘遍历标注本地会话 ★★(批22 已动 resume picker)
- 1.0.18#26 新会话 start hooks 后台化更快响应 ★★
- 1.0.22#27 打开/恢复会话不再因读 MCP 配置卡顿 ★★(与本轮配置迁移同区)

**A6 策略/治理(★★,我们已有 nofy-governance/marketplace/requirements)**
- 1.0.18#1 托管策略在写入前阻止不允许的 MCP server/marketplace 安装 ★★
- 1.0.19#3 被组织策略阻止的 MCP server 显示清晰信息、配置变更前拒绝 ★★
- 1.0.14#9 grok inspect 把 Claude bypass 锁显示为 advisory 而非 enforced ★
- 1.0.18#8 grok inspect/mcp doctor 显示托管策略详情 ★

**A7 会话/resume 上下文(★★)**
- 1.0.19#4 resume 时告知模型仍在运行的 loops/subagents/workflows ★★
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
- 1.0.24#1 Esc 不再取消运行中回合、改提示 Ctrl+C(批30 决策#1,行为变更)
- 1.0.19#1 计划 /loop 任务始终后台运行、不再注入回合(批30 决策#2,行为变更;我们有 scheduler)
- 1.0.18#3 welcome 屏停留到真正发送、后台预备会话(批30 决策#5,UX 行为变更)
- 1.0.17#1 MCP elicitation 升级到 2026-07-28 多轮(批28 决策#4;我们钉 V_2025_06_18,升级影响协议面)
- 1.0.16#1 企业策略经签名 requirements.toml 限制可选模型(依赖我们 nofy-governance/requirements 基建现状,需核)
- 1.0.22#9 grok-workspaced daemon 暴露文件夹给 Computer Hub(批31 决策,倾向跳云登记分歧)
- 1.0.13#6 iTerm2 粘贴图实时像素预览(媒体/pager 面,我们图像输入策略需核)

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
