# nofy TUI 全功能规格（穷尽调研报告）

> 2026-08-26 · 信源：`crates/codegen/nofy-pager/src/`（+ nofy-pager-render / nofy-shell / nofy-workspace 交叉核实）
> 方法：四路并行只读穷尽（slash 注册表逐文件 / views 全目录 55+ 文件 / 键位与全局 UX / ACP 面与生命周期），
> 全部结论带 file:line；原始分件存 /tmp/tui-part{1..4}.md，本文档为综合终稿。
> 用途：桌面前端 parity 施工的唯一基线——TUI 的每一个交互表面都必须在 GUI 有对应表达，先齐后强。

## 0. 计数校验

| 维度 | 数量 | 锚点 |
|---|---|---|
| slash 注册条目 | 61（触发键 88=名+别名 27） | slash/commands/mod.rs:70-136 |
| 命令实现文件 | 58（plugin.rs×4、screen_mode_switch.rs×2） | ls slash/commands |
| 视图/面板/模态条目 | 41（本档 Part2 编号） | views/ 全目录 |
| 键位动作注册 | defaults.rs 全表（Always/Agent/Prompt/Scrollback/Dashboard/Overlay 六上下文） | actions/defaults.rs |
| ACP 入站表面 | 协议层 5 + session/update 10 + ext notification 18 + xAI 层 24 + ext method 2 | acp_handler/* |
| 设置模态项 | 43 | settings/defs.rs |
| 仅 CLI 动词 | 20 组（本档 Part4 §5） | app/cli.rs |

## 0.1 架构三句话

1. **Action→dispatch(纯同步)→Effect(异步 tokio)→TaskResult**：所有输入/ACP 事件都归一到这条管线，渲染层不拥有状态——GUI 化时直接映射为 store action + 异步 effect。
2. **AgentView 纵切布局**（agent.rs:156）：status_bar→warnings→tasks→catalog→todo→scrollback(timeline gutter)→btw→queue→turn_status→banner→cta→follow_ups→prompt→shortcuts；桌面版即把这个纵切翻译为组件树。
3. **可见性是状态函数**：命令/面板/芯片的显隐由特性门、会话态、终端能力共同决定（硬隐藏 3、visible() 5、工具门 1、模式门 11、session_scoped 28）——GUI 的菜单不能是死列表。

## 0.2 桌面版翻译原则（ZCode 之师 + 本档结论）

- 内核定义边界：TUI 有的动作，GUI 一个不少；TUI 没有的（仅 CLI 动词）按产品价值选择性 GUI 化。
- 交互范式保真：权限选项级语义、rewind picker 的锚点暗化、queue 的乐观重排、plan 审批的行级评论——这些"手感"是产品合格线，不是装饰。
- 终端专属机制做桌面等价物：re-exec screen mode→窗口布局模式；$PAGER transcript→内嵌查看器；OSC52 剪贴板→原生剪贴板；kitty 媒体→DOM 媒体；Esc 阶梯→焦点栈。

---

# Part 1 · Slash 命令全表


# TUI 穷尽调研 · Part 1：Slash 命令系统（explore agent 原始交付，2026-08-26）

统计：builtin 注册 61 条 / 实现文件 58 / 别名 27 / 总触发 88；硬隐藏 3（dashboard/recap/auto）；
visible() 门控 5（announcements/toggle-mouse-reporting/gboom/scroll-debug/debug）；required_tools 1（loop→scheduler_create）；
模式门控 11（FullscreenOnly×8: find/theme/dashboard/workflows/timeline/jump/tutorial/minimal；MinimalOnly×3: edit-prompt/expand/fullscreen）；
session_scoped 28；无会话也提供 3（model/plan/multiline）；dashboard_only 1（cd）。
架构：run() 同步返回 CommandResult ∈ {Handled,HandledNoOp,Doctor,Error,Message,Action,QueueCommand,InjectSkill,PassThrough}；命令不做异步 ACP。
动态命令源：ACP shell 内建（compact/always-approve/flush/dream/memory/context/hooks-*/plugins 子命令，见 nofy-shell/src/session/slash_commands.rs）、skills、workflows。

## 61 条全表（名(别名) | 参数 | 行为 | 门控 | 文件:行）
1 quit(exit) | 无 | Action::Quit；prompt 路径另有 :q/:q!/:wq/:wq! 退出别名 | 无 | exit.rs:18-41
2 help | 无 | OpenCommandPalette(=Ctrl+P) | 无 | help.rs:12-29
3 docs(howto,guides) | [title] | 列表词→OpenHowtoGuides；标题→ShowReleaseNotes；未知→Error | 无 | docs.rs:15-78
4 home(welcome) | 无 | ExitSession 回欢迎屏 | 无 | home.rs:8-29
5 delete | 无 | DeleteCurrentSession(落盘历史) | session_scoped | delete.rs:6-32
6 new(clear) | 无 | NewSession | 无 | new.rs:8-29
7 fork | [--worktree|--no-worktree][directive] | Fork(ForkArgs)；--at 报本版不支持；互斥/重复 flag 报错 | session_scoped | fork.rs:50-139
8 compact | [instructions] | QueueCommand→队列管线→经 ACP 给 shell/模型 | session_scoped | compact.rs:11-51
9 copy | [N][file] | CopyAssistantMessage{n,file_path}；N=0 报错；带空格路径支持 | session_scoped | copy.rs:15-77
10 find | [text] | OpenScrollbackSearch | session_scoped+FullscreenOnly | find.rs:13-52
11 history | 无 | OpenHistorySearch(prompt 历史模糊搜索) | session_scoped | history.rs:13-36
12 export | [filename] | 空→剪贴板；路径→写 .md(~展开/建父目录)；参数做 fs 路径补全 | session_scoped | export.rs:18-160
13 transcript(log) | 无 | OpenTranscriptPager(临时 md+$PAGER，挂起 TUI) | session_scoped | transcript.rs:14-43
14 edit-prompt | 无 | EditPromptExternal(外部编辑器) | session_scoped+MinimalOnly | edit_prompt.rs:9-38
15 expand | 无 | MinimalExpandLast(重印最后折叠块；Ctrl+E 孪生) | session_scoped+MinimalOnly | expand.rs:16-47
16 context | 无 | ShowContextInfo(即时上下文用量) | session_scoped | context.rs:8-35
17 minimal | 无 | RelaunchInScreenMode{minimal:true}(re-exec) | session_scoped+FullscreenOnly | screen_mode_switch.rs:8-84
18 fullscreen(full) | 无 | 同上 minimal:false | session_scoped+MinimalOnly | 同上
19 model(m) | <name>[effort] | 纯名→SetDefaultModel(持久化默认+会话切换)；名+effort→SwitchModel 仅会话级；级联 effort 子菜单 | session_scoped+无会话提供 | model.rs:14-105
20 effort | <level> | SwitchModel{当前,effort}；按模型 reasoningEfforts 校验；空参列菜单 | session_scoped | effort.rs:12-93
21 always-approve | 无 | SetYoloMode(!cur)+PersistPermissionMode(带回滚)+toast；受管策略可锁 | 无 | always_approve.rs:13-34
22 auto | 无 | SetPermissionMode(Auto/Ask)；yolo 优先语义；硬隐藏至 set_auto_mode_available | 硬隐藏 | auto.rs:15-42
23 multiline(ml) | 无 | SetMultilineMode(仅会话不落盘) | session_scoped+无会话提供 | multiline.rs:15-49
24 compact-mode | 无 | ToggleCompactMode+PersistSetting(矮终端可自动强制) | 无 | compact_mode.rs:13-32
25 vim-mode | 无 | ToggleVimMode+PersistSetting；传播已开 subagent 视图 | 无 | vim_mode.rs:14-32
26 hooks | 无 | OpenExtensionsModal{Hooks}；不透传子命令(BLOCKED_ACP_NAMES) | 可 set_plugins_visible 隐藏 | plugin.rs:15-35
27 plugins | 无 | 同上 Plugins 页签 | 同上 | plugin.rs:38-58
28 marketplace | 无 | 同上 Marketplace | 无 | plugin.rs:61-82
29 skills | 无 | 同上 Skills | 无 | plugin.rs:85-105
30 session-info | 无 | ShowSessionInfo(ID/cwd/模型/上下文) | session_scoped | session_info.rs:8-34
31 rename(title) | <title>|--auto | RenameSession{reset_to_auto}；--auto 带尾文本报错 | session_scoped | rename.rs:8-80
32 dashboard(agents-dashboard,sessions) | 无 | OpenDashboard(全会话总览/peek/attach/dispatch) | 硬隐藏至 dashboard_enabled+FullscreenOnly | dashboard.rs:26-62
33 cd | [path] | 空→位置选择器；路径→改 dashboard 新 agent cwd；非 dashboard 面提示 | dashboard_only | cd.rs:14-54
34 theme(t) | [name] | 空参轮转；auto=系统跟随；别名归一；参数实时预览(Esc 还原不落盘) | FullscreenOnly | theme.rs:16-146
35 announcements | hide|show | AnnouncementsHide/Show | visible()=has_session_announcements | announcements.rs:9-65
36 remember | [text] | 空→EnterRememberMode；文本→SendRememberNote | 无 | remember.rs:8-40
37 plan | [description] | 空→SetPlanMode(On)；带描述→EnterPlanMode 自动起一轮 | session_scoped+无会话提供 | plan.rs:12-55
38 view-plan(show-plan,plan-view) | 无 | ShowPlan | session_scoped | view_plan.rs:8-37
39 resume | 无 | ShowSessionPicker | 无 | resume.rs:6-24
40 mcps | 无 | OpenExtensionsModal{McpServers}；MCP prompts 不注入斜杠表 | 无 | mcps.rs:4-24
41 workflows | 无 | ToggleWorkflows(运行面板) | FullscreenOnly | workflows.rs:5-36
42 btw | <question> | SendBtw→ACP ext nofy/btw，绕过队列不打断 | session_scoped | btw.rs:10-44
43 recap(summarize) | 无 | SendRecap→ACP ext nofy/recap，异步回 scrollback | session_scoped+硬隐藏至 shell sessionRecap 门 | recap.rs:12-40
44 doctor(terminal-setup,-check,-info) | [fix[id]] | Doctor(Report/ListFixes/Fix)；4 修复项 ssh-wrap/tmux-clipboard/dcs-passthrough/tmux-extended-keys | session_scoped | doctor.rs:14-116
45 loop | [interval]<prompt> | InjectSkill 结构化指令→模型调 scheduler_create；预览 every 5m；fire_mode Detached/InSession | required_tools scheduler_create | loop_cmd.rs:14-144
46 timestamps | 无 | SetTimestamps+PersistSetting{show_timestamps} | 无 | timestamps.rs:10-33
47 timeline | 无 | SetTimeline+PersistSetting{show_timeline} | FullscreenOnly | timeline.rs:11-37
48 toggle-mouse-reporting | 无 | ToggleMouseCapture(=Ctrl+R)；配置关则提示 | visible()=[ui]mouse_reporting_toggle | toggle_mouse_reporting.rs:16-47
49 settings(config,preferences,prefs) | 无(参数静默丢弃) | OpenSettings(弹窗内 / 过滤搜索) | 无 | settings_cmd.rs:12-32
50 rewind(undo) | 无 | RewindShowPicker | session_scoped | rewind.rs:3-30
51 jump | 无 | JumpShowPicker | session_scoped+FullscreenOnly | jump.rs:5-35
52 import-claude | 无 | ImportClaudeSettings(扫 .claude/settings*.json ~/.claude.json .mcp.json；=Ctrl+I) | 无 | import_claude.rs:14-36
53 usage(cost) | 无 | ShowUsage(本地用量；计费分支已移除) | 无 | usage.rs:11-40
54 queue | 无 | ShowQueue(服务器+本地合并队列只读块) | session_scoped | queue.rs:14-38
55 tasks | 无 | ShowTasks(background+subagents+scheduled 三源只读块) | session_scoped | tasks.rs:14-38
56 tutorial(tour,onboarding) | 无 | OpenTutorial(纯 opt-in) | FullscreenOnly | tutorial.rs:12-41
57 config-agents(agents) | 无 | OpenConfigAgentsModal(None) | 无 | config_agents.rs:8-28
58 personas | 无 | OpenConfigAgentsModal(Personas 页签) | 无 | personas.rs:9-31
59 gboom | 无(带参 PassThrough) | OpenGboom(kitty 光追射击彩蛋) | visible()恒 false | gboom.rs:12-46
60 scroll-debug | 无 | ToggleScrollDebugHud | visible()恒 false | scroll_debug.rs:13-42
61 debug | [scroll|fps|log] | ShowDebugStatus/ToggleScrollDebugHud/ToggleFpsHud/ToggleScrollLog | release 可执行不上菜单 | debug.rs:29-94

## Shell 侧动态内建（ACP available_commands，TUI 下拉可见，多数 PassThrough 回 shell）
compact / always-approve / flush(立即落盘记忆) / dream(记忆整合) / memory(浏览管理记忆) / context /
hooks-trust / hooks-list / hooks-add / hooks-remove / hooks-untrust / plugins(list,reload,trust,add,remove 子动作)。
注：TUI 网关 BLOCKED_ACP_NAMES 屏蔽 hooks-*/reload-plugins（扩展弹窗接管）；skills 与 workflows 亦动态注入。

---

# Part 2 · 视图/面板/模态全表

# TUI 穷尽调研 · Part 2：视图/面板/模态（condensed，41 条目）

## 主视图
1 Agent 主视图：布局纵切 status_bar→startup_warnings→tasks→catalog→todo→scrollback(滚动条/timeline gutter)→btw→queue→turn_status→banner→plugin_cta→follow_ups→prompt→shortcuts（agent.rs:156）；ActivePane=Scrollback/Todo/Queue/Prompt/Tasks/Catalog；SHORT_TERMINAL_ROWS=16 抑制 CTA/followups/banner；≤20 行强制 compact；build_hints 按活动面板动态底部提示。
2 Welcome：顶栏 repo:branch+版本；宽≥90 hero box；菜单 [ctrl+i Import claude(可[x]消)] [ctrl+w New worktree] [ctrl+s(实F3) Resume] [ctrl+q/d Quit]；信任询问 y/n；workspace 模式分段(Sandbox|Local,首次 ACK)；即打即开。
3 Dashboard：Ctrl+\/命令/面板开；NOFY_AGENT_DASHBOARD=0 关；minimal 拒绝；行字段 id/label/subtitle(repo/branch/worktree)/state/activity/secondary_line(末工具/助手/待批预览)/cwd/last_change/pinned/badges/context_pct 迷你仪表/indent/parent；RowState Awaiting/Working/Idle/Inactive/Done/Failed/Blocked；分组 State|Directory(Ctrl+G)；Filter a:<name>/s:<state>/子串；Idle 折叠 …N more；子代理>8 折叠；[+ New Agent]；attach 浮层([✗][Prev][Next],Ctrl+[/])；peek(live-tail 回放+待批选项+❯reply 输入+1-9 答权限)；LocationPicker(模糊 recents⇄目录补全混合)；持久化 [dashboard]。

## 侧栏/条状
4 TodoPane：Ctrl+T；图标 □▶✓✗；h 隐藏已完成；状态栏徽章计数可点击；auto-visible on todo 到达。
5 QueuePane：条目 #N/全文/首行/(+N lines)/kind(Prompt/Command/Bash/Cron)/origin(Local/Server)/version；server 先 local 后；x 删/e 编辑/J/K 重排/y 复制/Interject 强发；空 Enter=send-now 队首；空自动隐藏。
6 TasksPane：Ctrl+G；四源交错 Workflows/Subagents/Bg+Monitor/Scheduled；running 优先按开始时间；bash 高亮；stdout 行数徽章 (1.9k)；Enter/Ctrl+F 按类型打开(块查看器/subagent 全屏/workflow 详情)；x kill 按类型；y 复制 stdout；/、f 搜索过滤。
7 SubagentCatalogPane：Personas/Roles/Agents 三组带描述；≤8 行 ≤15% 屏高；Enter ViewCatalogEntry。
8 Timeline：每轮一刻度(顺序非比例)；show_timeline+非子视图+≥60 列+≥2 轮；点击刻度跳轮；▲▼ 上/下轮；悬浮预览。
9 StatusBar：左 git 分支/worktree/sandbox:profile/~cwd/(worktree of)/promo CTA；右芯片 link_url/plan(点击开预览)/goal([Goal: phase] tokens/budget elapsed,暂停黄/失败红)/mcp ⠋(connected/total)/context 条/todo 徽章/队列徽章/bg 计数；context 条 8.5K/1.0M 常态,悬浮变进度条,断点 0/50/65/75/85/95%；各芯片可点击。
10 TurnStatus：⠧ 活动标签 阶段计时 · N queued — Enter to send now … 总时长 ⇣tokens [stop][↓]；空闲高度0；watcher 线索 "1 command · 2 monitors still running"；[stop] 取消(有子代理→CancelTurn 面板)；[↓] 转后台；动画 ~7.5fps+监控脉冲+待裁决菱形脉冲。
11 Announcements：critical 恒优先两行(! Title [hide]+Message)；promo 一行 [Label] CTA(警告黄)+caption；dismissible:false 钉住；/announcements hide|show。
12 ShortcutsBar：HintItem；PendingAction 时整条 "press again to {label}"。
13 btw 面板：Loading/Done/Error；上边框嵌 /btw <q> 与 {pos}-{end}/{total} ↑↓ [Esc]；Done markdown ≤12 行；Esc 关→持久化折叠 BtwBlock 进 scrollback；支持选择/超链接。
14 Plugin CTA 行 / Follow-up chips：[ label ] 可点击悬浮高亮超宽截断停渲染。
15 FPS/Scroll Debug HUD：/debug fps|NOFY_FPS=1；/scroll-debug|NOFY_SCROLL_DEBUG=1；纯观察。

## 模态
16 ActiveModal 枚举：EditConfirm/CommandPalette/ArgPicker/SessionPicker/DocPicker/DocViewer/ShortcutsHelp/MemoryBrowser/Settings/ResetSettingsConfirm/RememberNoteReview。
16a EditConfirm：Save changes?/Save and send? y/n/x(delete)。
16b CommandPalette：Ctrl+P/?；分节 Session(New/Worktree/Dashboard/Home/Delete/Resume/Rename/Info)/Context(Compact/Usage/ViewPlan/Memory)/Model&Input(SwitchModel/AlwaysApprove/Multiline/EditExternal)/Tools(Hooks/Plugins/Marketplace/Skills/MCP/ManageAgents)/Other(Theme/Settings/Shortcuts/Guides/Tutorial/Quit)；标签+快捷键匹配过滤；按屏幕模式过滤条目。
16c ArgPicker：/model 选模型→尾随空格进 effort 子菜单；Esc 恢复面板快照。
16d SessionPicker：按仓库分组当前置顶；内容深搜 snippet；f 来源循环 Nofy→External→All→Local→Remote；d 武装删(外部不可删)y/n；Enter 仅合法 UUID 直载；双通道 spinner(native+foreign)。
16e DocPicker/DocViewer：j/k±3、PgDn±20、Home/End、滚轮±3；Esc viewer→列表→恢复面板。
16f ShortcutsHelp：按类分组 Essentials/Input/Nav/Actions/Panels/Session/Dashboard；非当前上下文变暗；伪行带 long_help；e/Space/l/h 展开；Enter man 风格详情；f 过滤暗行。
16g MemoryBrowser：左 40% 列表右 60% 预览(<80 列单栏)；分组 Global/Workspace/Sessions；meta "size · modified"；y 复制路径；x 删(仅会话日志,双击)；f 全屏持久；预览≤1MiB。
16h Settings：F2/Ctrl+,；状态机 Browse/FilterFocused/PickingEnum(含预览)/PickingGroup/EditingValue(‹/›步进)；Right/l 展开描述；d 重置单项(→ResetConfirm)；面包屑；43 设置项键：compact_mode/screen_mode/show_timestamps/show_timeline/page_flip_on_send/combine_queued_prompts/follow_up_behavior/confirm_before_rewind/simple_mode/vim_mode/theme/auto_dark_theme/auto_light_theme/render_mermaid/permission_mode(default/ask/auto/always-approve)/remember_tool_approvals/multiline_mode/default_model/show_thinking_blocks/prompt_suggestions/respect_manual_folds/group_tool_verbs/collapsed_edit_blocks/display_refresh_auto_cadence/scroll_speed/scroll_mode/scroll_lines/invert_scroll/keep_text_selection/default_selected_permission/toolset.ask_user_question.timeout_enabled/plan_mode(会话级)/show_tips/contextual_hints 组(.undo/.plan_mode/.image_input/.send_now/.small_screen/.word_select/.ssh_wrap)/hunk_tracker_mode/fork_secondary_model；Int 例 max_thoughts_width 40-500。
16i ResetSettingsConfirm：y 重置/n/Esc 取消保留过滤滚动位。
16j RememberNoteReview：raw vs enhanced(Tab 切)；rewrite_nonce 防串。
16k CancelTurn 面板："Subagents are still running. Stop them?"+计数；4 选项 Stop/Continue/Always stop/Always continue(1-4)。
17 Agents 模态：条目 名/描述/作用域徽章(built-in/project/user/bundled)/启用/[off]/active/default；展开=Model/Prompt mode/Tools(n)/Skills/Source/Prompt 预览；内置 NofyBuild/GeneralPurpose/Explore/Plan/BrowserUse；键 j/k、e/→展开、Enter→LineViewer、/ 搜索、t 启停、s 设默认、i $EDITOR、Tab 切标签；Personas 页：n 新建表单(Name/Description/Instructions/Scope user|project)、d 删(y/n 仅本地)、Enter→PersonaDetail。
18 PersonaDetail：Name/Description/Model/Effort/Isolation/Instructions/Instr.file+IO 表(inputs/outputs)；仅 user/project 可编辑；i $EDITOR 打开 TOML。
19 Extensions 模态：五页签 Hooks/Plugins/Marketplace/Skills/MCP Servers(Tab 循环)；Hooks 按来源分组行 on:{event}/{matcher}；Plugins 按 origin 分组 启停/卸载/更新；Marketplace 官方源优先 安装/更新/卸载/移除源；Skills 分组+Workflows 折叠块；MCP 分区 Managed(connectors+Ctrl+O)/Plugin/Local；状态/工具启停/auth/setup 表单(Enter save and authenticate)；动作进行中锁定仅 Esc。
20 ImportClaude：ImportPlan 扫描 .claude/；作用域 Global/Project；分组 Permissions/Env/MCP/Hooks/Paths；勾选默认全选；组头三态批量；页脚 select all/none/confirm/cancel；Enter 写 .nofy/config.toml。
21 NewWorktreeDialog：Name(optional) 可滚动输入；Enter 创建 Esc 关；100 字节上限。
22 GoalDetail：g 或点 goal 芯片；状态行(Active 阶段/暂停变体/Failed/Interrupted/Budget Limited/Complete)；暂停原因块；token 预算条(>80%红≥50%黄)；进度 todo ≤15+N；活动子代理块+分模型 token ≤6；Completion review(Achieved/Not/Not yet+attempts n/m)；Recent History 人性化事件+相对时间。
23 Workflows 浮层：Snapshot=run_id/name/objective/status/phases/current_phase/agents(label/phase/model/state/tokens/duration)/预算 used/reserved/remaining/elapsed/pause_message/result_summary；能力 can_pause/resume/stop/save；列表+详情(阶段轨/代理行)。
24 Tutorial：List(✓已浏览)→Topic(→/←)→Guide(d)；从不自动弹。

## 查看器/媒体
25 BlockViewer：Ctrl+F 全屏；ViewerKind Markdown/Execute/Edit(diff 带 DiffLineMeta 补丁复制)/BgTask/WebFetch/IntegrationSearch/UseTool/Read(语法高亮+绝对行号)/Grep/PlainText；ListPane 全能力+运行中跟随+r raw+Y 命令+y 内容/补丁+字符级拖选+流式代际检测。
26 LineViewer：语法高亮+行号；构建 @file:N-M 引用；v 选区→Enter 确认(undo 组)；计划审批联动 a 批准/s 提意见/q 放弃/c 行评论；休闲 c/s/Ctrl+Enter 发评论；打开：@元素后 :、Ctrl+L、Agents Enter、plan 芯片。
27 PlanApproval 状态：寄生 LineViewer/prompt；focus Preview/Prompt/Commenting；行级评论；approved/abandoned/cancelled+feedback；空计划占位。
28 ImageViewer+内联媒体：Esc/q 关(清 Kitty+回收)；Kitty/iTerm2 转义；视频帧播放；64MiB 缓存驱逐；mermaid 交互。

## 搜索/跳转
29 Scrollback 搜索：后台 regex 守护；content_generation 缓存；/ (vim) 或 /find；Enter 接受保留高亮；n/N 匹配；搜索条占底 2 行。
30 History Search：后台 nucleo 守护 MAX 100 最新/最佳在底；SEARCH(/history)与 BROWSE(空 Up 实时回填,打字脱离,最底 Down 关)。
31 Jump：每轮一行 序号+提示预览；移动光标实时滚动正文；Enter 跳(稳定 id)；Esc 恢复打开时视口(书签)。
32 Rewind：见 Part4 §4。
33 @ 文件搜索：后台模糊 top-K 1000；@query 下拉；目录追 / 钻入；@path:range 渲染；: 开 LineViewer 选行。
34 Slash/Shell 补全下拉+幽灵下一提示(Tab/→ 接受、前缀收缩、Esc 本轮不再)。

## 权限/问题
35 PermissionView：VecDeque 仅队首；三焦点 Options/FollowupInput/PatternEdit；字段 request/id/options/active_idx/bash_highlights+selection_count/bash_command_raw/mcp_scope/tool/desc/args_expanded(Ctrl+F)/desc_scroll。
36 QuestionView：questions 列表+active_tab (i/N)；selections Single/Multi；focus Navigation/InputMode；fullscreen；底部 plan 模 "Chat about this"/"Skip interview"；opened_at 暂停 turn 计时；LocalQuestionKind Fork/NewSession/AgentTypeMismatch/DoctorFix/DeleteCurrentSession；键 j/k、Space 多选、Enter 选择/进输入、@ 下拉、Esc 阶梯。

## 辅助层
37 status_blocks：/queue /tasks /usage 只读块(minimal 主检视面)；usage 含 cached/reasoning 拆分+By model+incomplete 标记+绝不显示 $0。
38 diff.rs：SearchReplaceEditDetail→hunks(3 行上下文)；供 Edit 块+补丁复制。
39 tool_usage.rs：ToolCategory Execute/Read/Edit/Search/Skill/ListDir/WebFetch/Other/Thinking/Message 各带序列条符号+主题色；LineageEntry 活动谱系；Scope Session/SelectedTurn。
40 diagnostics：WarningCategory 13 类→启动警告横幅；DiagnosticReport facts/findings/probe_notes；fix 计划→DoctorFix 问题模态征询。
41 基础设施：ListPane(搜索/过滤/跳转/跟随/可视选择/复制 全键)；Picker 三框架 FullScreen/Floating/Popup；ModalWindow chrome(边框+标签栏+页脚快捷键+[✗],minimal 无边框嵌入)；OverlayState 三态机(Tab→scrollback/Space→prompt/Esc,q 退层/Ctrl+F 全屏)；session_title 派生序 改名>生成>首提示60字>session {id8}；progress_bar 1/8 块。

---

# Part 3 · 键位系统 + 全局 UX 机制

# TUI 穷尽调研 · Part 3：键位系统 + 全局 UX 机制（condensed，2026-08-26）

## 架构
- 单一事实源 actions/defaults.rs default_actions()(:66)；ActionRegistry 三消费者：hints/命令面板/按键派发。
- 上下文精确匹配+冒泡：Pane(ScrollbackFocused|PromptFocused)→Agent(AgentScreen)→全局(Always)（app_view.rs:2174-2177）。
- 终端品牌自适应：VS Code 家族 Quit=Ctrl+D/HalfPageDown=D/Interject=Ctrl+L；Apple Terminal Interject=Ctrl+O；ctrl_dot_unreliable() 决定 ShortcutsHelp 主键 Ctrl+X↔Ctrl+.。
- vim 门控 lookup_with_mode()(:411-443)：vim 关时抑制裸字母落入输入框。
- 双击确认 PendingAction：Quit/NewSession/DashboardOverlayStop，TTL 1000ms；Esc 双击 800ms（NOFY_ESC_DOUBLE_PRESS_MS 覆盖）。
- KeyboardNormalizer 救援丢失修饰位（Apple Terminal Shift+Enter→裸 Enter）。
- Esc→d 500ms = DumpInputLog 飞行记录仪。

## 全局键(Always)
Ctrl+Q(VSCode:Ctrl+D) Quit 双击确认 | Ctrl+N NewSession 双击确认(+worktree ask 弹窗) | Ctrl+\ OpenDashboard(仅 Fullscreen/Inline) | Ctrl+C/D 视图兜底 arm Quit。

## Agent 级键(AgentScreen)
Ctrl+C CancelTurn(有 pending 升级 Quit；minimal 空闲=Quit) | Ctrl+O ToggleYolo(有 CTA 时开 CTA) | Ctrl+G Fullscreen=ToggleTasks / Minimal=EditPromptExternal | Ctrl+T ToggleTodos | Ctrl+;(alt Ctrl+') ToggleQueue | F3 OpenSessions | Ctrl+L OpenExtensions(VSCode 不绑) | Ctrl+B SendToBackground(仅前台运行中) | Ctrl+P 或 ? CommandPalette | Ctrl+./Ctrl+X ShortcutsHelp | Ctrl+M ModelPicker(Prompt 焦点=ToggleMultiline) | F2/Ctrl+,/Cmd+, OpenSettings | g goal/workflows 覆盖层 | Ctrl+/ 连接匹配插件 | Ctrl+Y 接受词选择提示。

## Prompt 焦点键
Enter SendPrompt(multiline 时插换行；例外：斜杠无参/bash/空草稿+队列强发) | Ctrl+Enter(alt Ctrl+I;Apple:Ctrl+O;VSCode:Ctrl+L) InterjectPrompt(取消当前回合立即发；空草稿强发队首) | Ctrl+M ToggleMultiline | Ctrl+S(alt Alt+S) StashPrompt(一次一份) | Shift+Tab CycleMode(Normal→Plan→Always-Approve) | Tab FocusScrollback(minimal 不注册) | ! 空草稿=BashMode | # 空草稿=Remember 模式([features]remember_mode 默认关) | Up 空草稿=历史浏览面板 | Ctrl+V/Cmd+V 延迟粘贴管线(路径同步优先,图片异步探测) | Shift+Enter/Alt+Enter multiline 发送 | Tab 接受 ghost 斜杠补全/预测建议 | bash 模式 Tab=终端式补全(总开,Windows 除外) | PgUp/PgDn 翻页会话。
下拉拦截优先级：历史面板 > @文件搜索 > 斜杠下拉 > 补全下拉 > 幽灵建议。
历史面板键：Esc/Ctrl+C 关还原；Enter/Tab 接受；Up/Ctrl+P/Ctrl+K、Down/Ctrl+N/Ctrl+J；PgUp/Ctrl+U、PgDn/Ctrl+D；browse 其他键=脱离编辑。
Esc 策略(prompt.rs:807-917)：有待答卡→吞；运行中 vim+fullscreen→吞(取消归 Ctrl+C)，minimal/非vim→立即取消；空闲非空草稿→arm 清空(双击 800ms)；空闲空草稿有回合→arm rewind 选择器(取消后 1000ms grace 抑制)；其余吞。

## Scrollback 焦点键(vim 门控)
j/Down SelectNext | k/Up SelectPrev | L/Shift+Right NextTurn | H/Shift+Left PrevTurn | J NextResponse | K PrevResponse | g GotoTop | G GotoBottom | Ctrl+K/J ScrollUp/Down | Ctrl+U/D(VSCode:D) HalfPage | PgUp/PgDn | h/Left Collapse | l/Right Expand | e ToggleFold | E ToggleExpandAll | Ctrl+E ExpandAllThinking | r ToggleRaw | y CopyBlockContent | Y CopyBlockMeta | Enter(alt Ctrl+F) OpenBlockViewer | o/O 链接导航高亮 Enter 打开 | x KillBgTask(vim) | Tab/i/Space FocusPrompt | /(vim) scrollback 搜索 | n/N 匹配导航 | Esc 清选择→清链接高亮→Esc策略 | Enter 用户块=内联编辑(INLINE_EDIT) / subagent 块=全屏视图 | Ctrl+R ToggleMouseCapture(配置门)。
搜索条：Esc 关；编辑 Enter 接受；浏览 n/N。

## 侧面板键
Todo：Ctrl+T 关回 scrollback；Ctrl+F 全屏；Tab/Esc/q/Space overlay 结构键。
Tasks：Ctrl+G 关；Left/Right 组折叠；Enter/Ctrl+F 按行类型(块查看器/subagent 全屏/workflow 详情)；x kill(按类型)；y 复制 stdout；Tab 回 prompt；/、f 过滤。
Queue：x/Delete 删行(Server 乐观 QueueRemoveShared)；e 编辑行；SwapUp/Down 重排(Server QueueReorderShared)；Interject 同键=ForceInterject 强发选中；j/k/y 导航复制。
Catalog：Enter ViewCatalogEntry。

## 模态/覆盖层键
modal chrome：Esc 关；h/l 折叠/展开组。Picker 通用：鼠标滚轮±3；搜索态 Esc 退、Tab 切 tab、其余编辑；导航态 j/k、Enter、/ 或 i 进搜索、f 循环过滤器、动作字符(d 删/y 复制/e 展开)、Space；vim_normal_first 先 i// 才输入。
命令面板 Esc 先清查询再关。RememberNoteReview：Enter/y 保存、Tab 增强预览。DocViewer Esc 回 picker。ShortcutsHelp 三模式。Settings F2/Ctrl+, 总关；子模式自持 Esc。Reset/EditConfirm 单字符匹配。
Extensions 每 tab 动作键：Plugins r/u/a/Space/x/f；Hooks r/a/x/Space/f；Marketplace i/r/u/d/a/x；Skills Space/r/f；MCP a/x/r/Space/i(auth)/f；Ctrl+O(MCP tab)=托管 connectors。
Agents/Persona：ViewAgent、OpenPersonaDetail、EditInEditor(SuspendForEditor $EDITOR)。
阻塞卡主排序：LineViewer>BlockViewer>Permission>PlanApproval>其他>Pane。
权限卡：Esc 阶梯；Ctrl+F 展参数；Ctrl+C PermissionCancel；j/k/Tab 行移；Enter 执行；1-9 直选；Ctrl+O YOLO；Right/Left 调 allow 作用域(MCP server↔tool、bash 高亮词±)；e pattern 编辑；RejectOnce 行打字→followup 输入。
取消回合卡：Esc=KeepRunning；Ctrl+C 确认；1-4 直选。
问答卡(elicitation)：Esc 阶梯；Ctrl+Y 关闭视图；Ctrl+C 导航=提交跳过/输入=回导航；Ctrl+F 全屏；j/k/Ctrl+D/U/PgDn/g/G 移动；Space 切换选项；Enter 单选前进/提交；z 跳自由文本；l/]/h/[ 多问题切换；1-9/a-f 跳选；y 复制；Shift+X 强制提交；输入态全键进 prompt。
Rewind 覆盖层：Picker j/k/Enter/Esc；CancelOffer y=取消并继续/n；Confirm y/a(确认且关询问设置)/n；滚轮移光标。
Jump：j/k/Enter/Esc。内联编辑：Enter 提交/Esc 放弃/Shift+Alt+Enter 换行/外点放弃。
行查看器：Esc/q/Ctrl+C 关；Ctrl+F 全屏；y/Y 复制；plan 审批内 c 评论/s 反馈输入/a 批准/q 放弃；casual plan c/s/Ctrl+Enter。
块查看器：Esc/q/Ctrl+F；r raw；y/Y 复制；拖放自动复制。
图片/视频查看器：Esc/q 关；视频 Space 播放、Left/Right 进退。
Workflows 覆盖层：Esc/q 关；g 开关；Tab 切 run；Enter/Right 详情；p/r/x/s(Ctrl)=pause/resume/stop/save。
教程：列表 picker；主题页 Right/Left、d 深入、Esc 逐级。

## Dashboard 键
注册表：Down(j)/Up(k) 选行 | Ctrl+T 置顶 | Ctrl+R 行内改名 | Ctrl+X Stop(忙=取消；空闲 2s 内再按=永久删；subagent=kill；CONFIRM_WINDOW=2s) | Shift+Tab CycleMode(peek 时 PeekCycle) | Ctrl+G 分组 | Shift+Up/Down 排序 | Ctrl+./? 速查 | Esc 多级级联退出 | Ctrl+O 行 YOLO | Ctrl+L 目录选择 | Ctrl+W worktree 模式。
硬编码：Ctrl+/ 搜索模式 | Ctrl+S send+open | Ctrl+M multiline | Ctrl+V 粘贴 | Enter attach/dispatch | Tab 焦点切换 | Esc 级联(搜索→peek→清过滤→失焦→取消选中→退出) | Right/l 详情 | Left/h 折叠 | i(vim) 进输入 | y/n 删除确认 | peek：❯reply 行编辑、Up/Down 切 agent、Enter 发/排、1-9 答权限。
Session Overlay：Ctrl+\ 回 dashboard | Ctrl+[/] 前/后会话 | Ctrl+X 双击停并关 | q/Esc(中性)/Left(空prompt) 退出。

## Welcome 屏键
信任询问 y/Enter=信任、n/Esc=退 | workspace ACK y/n | Ctrl+E 模式循环(Sandbox⇄Local) | 会话选择器：d 删(y/n)、f 过滤、Ctrl+/ 强搜、粘贴 id 回车加载 | Enter(auth Done)=NewSession | Ctrl+O 开 CTA | Ctrl+W 新 worktree 对话框 | F3 会话列表(标签误写 ctrl+s) | Ctrl+U foreign resume | Ctrl+I 导入 claude(Ctrl+Shift+I 消横幅) | Shift+Tab ActionThenForward(NewSession) | 任意文本键=即打即开带入字符 | Paste=开新会话粘贴。

## Minimal 重映射
Ctrl+T pin todo | ToggleQueue 键=提交只读 /queue 块 | Ctrl+E 重印最后折叠块 | Ctrl+O $PAGER 全转录 | 注册表剔除全部 Scrollback/Dashboard 动作+OpenDashboard+FocusScrollback。

## UX 机制档案(condensed)
1 主题：ThemeKind NofyNight(默认)/NofyDay/TokyoNight/RosePineMoon/OscuraMidnight/Auto(磁盘存 auto)；非 truecolor 只给前两；/theme 实时预览(Esc 还原不落盘)；系统跟随检测链：桌面 API→NOFY_APPEARANCE 环境戳→OSC11 启动查询(500ms)→COLORFGBG→None；auto 时 SystemAppearanceWatcher 5s 轮询；[ui].auto_dark/light_theme 映射。
2 通知：事件 turn_complete/approval_required/session_ready/task_complete/agent_error；默认仅前二；同批权限只通知一次；条件 unfocused(默认,失焦≥3s)/always/never；协议 auto/osc9/osc99/osc777/bel/none，绕过帧管线直写 stderr；hooks 配置(command+$NOFY_MESSAGE+events+only_unfocused)；睡眠抑制默认开；OSC 9;4 标签进度条(Ghostty 5s keep-alive)；标签标题条目序列 [action-required,spinner,activity,session-name,nofy]；session_recap 阈值 30s。
3 剪贴板：写路由 native+tmux_buffer+osc52(+tmux DCS passthrough 条件)；env NOFY_OSC52_SINK/NOFY_CLIPBOARD_NO_OSC52/NOFY_COPY_FILE；读=Ctrl+V 延迟管线(路径同步优先、图片/URL 异步)；bracketed paste 图片探测；拖放转附件；复制动作 y/Y、/copy、块查看器拖放；clipboard_focus tip 轮询 changeCount 提示粘图。
4 链接路由：OSC8 发射策略表(品牌原生=emit+id_param；Apple Terminal/Warp/未知/screen/tmux<3.4/VTE 旧=skip 归因)；o/O 循环高亮 Enter 打开；点击打开决策 app_should_open_link_on_click+has_native_link_hover。
5 媒体：Kitty/iTerm2 图形协议；64MB CPU 缓存随机驱逐；视频逐帧+海报帧；ffmpeg 仅视频海报/内联预览，缺失时横幅+按平台包管理器安装命令(! 前缀可 bash 模式执行)；Mermaid ◇ 按钮行(Open/CopyPath/CopySource)按需渲染。
6 Shell 补全：CLI `nofy completions <shell>`(clap_complete+zsh 补丁)；bash 模式 Tab 总开(Windows 除外)；语义 InstaAccept/Fill(LCP)/Open/Nothing；确定性 includeAi:false token_only；接受目录后自动 refetch；另有 AI/历史建议管线(PROMPT_SUGGESTIONS_DEFAULT=true)。
7 鼠标：滚轮/触控板启发式(80ms 分流、3 行/tick、区间加速 2.5/1.6/1.0、16ms 节流)；可配 scroll_mode/invert_scroll/scroll_lines/scroll_speed；mouse_reporting_toggle 默认关→Ctrl+R//toggle-mouse-reporting 把选择权还终端；应用内命中矩形分发(todo/queue/tasks 关闭钮、队列徽章、后台状态、goal、context bar 防抖、plan 芯片、[bg]/[cancel]、链接、选择、滚动条)。
8 vim：默认关；关=裸字母抑制转输入；开=导航键+/ 搜索/x kill/i 进输入；传播 subagent 视图；picker vim_normal_first。
9 multiline：仅会话不落盘；Enter/Shift+Enter 互换；例外斜杠无参/bash/空草稿队列强发；行尾反斜杠续行两模式有效。
10 screen mode：Fullscreen(alt-screen)/Inline(--no-alt-screen)/Minimal；/minimal /fullscreen=re-exec 同二进制(argv 重建：剔一次性 flag、追 --resume；NOFY_SCREEN_MODE env)；minimal 差异固化(注册表剔除、Ctrl+G 互换、/theme 不可用)。
11 状态栏：/status 系只读块(queue_block/tasks_block 四段 Workflows/Subagents/Bg+Monitor/Scheduled/session_usage_block token+成本+incomplete 警告)；运行时底行 turn_status(空闲/运行/等待/parked/watchers 动画)+context_bar(断点混色)；可点击语义(mouse.rs)；shortcuts_bar 按上下文 hint_items 动态。
12 roster：leader 模式 nofy/sessions/list+changed 广播；RosterEntry(session_id/title/cwd/is_worktree/model_id/yolo/activity[Working/Idle/NeedsInput/Dormant/Completed/Dead]/last_turn_summary/resident/origin)；必须先解包 result 信封(回归测试固化)；Dashboard=FleetView；attach→overlay；Ctrl+[/] 切换；peek 悬浮预览+行内回复。
13 welcome：认证 Pending 仅 Quit；菜单 [Import claude(ctrl+i 可消)]/New worktree(ctrl+w)/Resume(标签 ctrl+s 实 F3)/Quit；信任询问；workspace 模式分段(Sandbox|Local,首次 ACK)；会话选择器(模糊+Ctrl+/ 深度+f 过滤+d 删+粘贴 id)；即打即开；公告/CTA；foreign resume ctrl+u。
14 tips/tutorial/docs：tips 单槽 TTL 去重(打字不清除)；触发器 clear_detector(Ctrl+Z 恢复)/clipboard_focus/plan_nudge(Shift+Tab)/send_now/small_screen/ssh_wrap/word_select(Ctrl+Y)；tutorial 9 主题编译期内嵌严格 opt-in；docs USER_GUIDE include_str! DocPicker→DocViewer。
15 gboom：隐藏可键入无参；kitty a=T 逐帧 ~30fps 480×320；WASD/箭头/鼠标瞄准/左键/Space；KKP 释放锁存；失焦 release_all；阶段 Title→Playing→Won/Dead。
交叉事实：遥测白名单仅 InterjectPrompt/OpenExtensions；Esc 所有权层级 app→overlay→卡阶梯→esc_policy；welcome 标签 ctrl+s 实 F3 偏差。

---

# Part 4 · ACP 事件→UI / 生命周期 / Rewind / CLI 动词

# TUI 穷尽调研 · Part 4：ACP 事件→UI / 生命周期 / Rewind / CLI 动词（condensed）

## 1. ACP 事件→UI 全表
路由总入口 acp_handler::handle(mod.rs:150)；状态变更永远落在拥有 session_id 的 agent（后台 agent 流式块也进自己 scrollback）；find_session_match(routing.rs:126) Root→Child→竞态兜底；drop_unexpected_replay(session_notification.rs:74)；去重高水位 last_applied_event_seq(replay 豁免)。

协议层：SessionNotification→1.2/1.4 | RequestPermission→权限覆盖层+系统通知 | ExtMethod: nofy/ask_user_question→问题覆盖层; nofy/exit_plan_mode→计划审批覆盖层; 未知→-32601 | WaitForTerminalExit→回错。

session/update 子类型：Plan→todo pane | ToolCallUpdate(bg stdout)→中央 bg 存储不进 scrollback | 其余 chunk/tool/thinking→promptId 门控后 scrollback 块 | AvailableCommandsUpdate→slash 注册表+workflows 刷新 | CurrentModeUpdate→plan_mode_active | meta.totalTokens→context bar | meta.turnStartMs→计时 | viewer 收养→TurnRunning("⠿ Responding…") | Child 路由→子代理块 activity label。

ext notification：nofy/follow_ups→跟随建议 chips(≤6,≤256字,仅活跃) | nofy/task_backgrounded→BgTask 块(前台降级原位替换) | nofy/task_completed→完成/失败块 | nofy/models/update→模型目录刷新 | nofy/settings/update→auto 闸门/软默认权限/group_tool_verbs/tips | nofy/sessions/changed→roster/dashboard | nofy/queue/changed→queue pane 镜像+乐观调和+收养运行中 prompt | nofy/session/interjection→插话块 | nofy/monitor_event→bg stdout 追加 | nofy/scheduled_task_created/fired/deleted/inject_prompt→任务 pane /loop 行 | nofy/announcements/update→公告 | nofy/git_head_changed→状态栏分支缓存 | nofy/leader/version_mismatch→toast | nofy/mcp/init_progress→"Connecting MCPs (N/M)…"转圈 | nofy/mcp/tools_changed|initialized→清指示器+防抖重取 | nofy/mcp/server_status→modal 行内补丁 | nofy/mcp/servers_updated→广播防抖重取。

xAI NofySessionUpdate 层：AutoCompact*→会话事件块+AutoCompacting 态 | RetryState→retry 态;耗尽→错误横幅(ReAuth/RetryFailed/DiskFull/ContextTooLarge) | ImageDropped/Compressed→system 块(成功不可见) | MemoryFlush/Dream/SessionSaved→事件块 | ToolCallDeltaChunk→"正在调用工具…" | TurnCompleted→finalize 结束标记 | SubagentSpawned→Subagent 块+子视图(继承外观) | SubagentProgress→统计+activity | SubagentFinished→块状态翻转 | HookAnnotation/HookExecution→事件块/挂最近工具块 | HooksChanged/PluginsChanged→extensions 页 | SessionSummaryGenerated→标题 | LastTurnSummary→picker 备用 | SessionRecap→Recap 块(迟到/重复闸门) | SessionRecapUnavailable→toast | ModelAutoSwitched→ModelUnavailable 块 | ModelChanged→状态栏 | MemoryFiles→Memory Browser 模态 | WorkflowUpdated→Workflow 块+overlay 快照 | GoalUpdated→goal 面板/GoalCompleted 块 | InteractionResolved→关覆盖层。

## 2. 权限全流程
入队：按 session 路由;无匹配回 Cancelled | YOLO 自动选首个 AllowOnce 立即应答 | 空→非空跃迁发 ApprovalRequired 通知(限流) | enqueue：解析 bash 高亮/MCP scope meta→子代理来源标签→stash 输入框→焦点切 Prompt→光标预选→FIFO push_back(只渲染队首)→last_active_at(NeedsInput 计时)。
选项原文(prompter.rs)：位0 enable-always-approve "Yes, and don't ask again for anything" | Edit: allow-edits-session(仅内存)/allow-once | reject-once "No, and tell Nofy what to do differently" | Bash: allow-always-command "Always allow: {选中词}"(←/→调范围)/allow-once "Yes, proceed"/reject-always-command | 通用 bash always-allow/reject-always | WebFetch allow-always-domain | MCP allow-always-mcp(带 meta,scope Tool↔Server 仅当名含 __) | 门控 REMEMBER_TOOL_APPROVALS_GATED_IDS 剥离细粒度 always。
视图交互：焦点三态 Options/FollowupInput/PatternEdit | j/k+Enter+1-9 | ←/→ 调 bash 选词/scope | e pattern 编辑(Esc 丢/Enter 持久) | Ctrl+F 展折叠(5 行预算) | 高度≤50%屏 | 光标预选链：粘性上次 kind→[ui].default_selected_permission(always_allow_all_sessions 默认/allow_once/allow_command_always/reject)→enable-always-approve(按身份)→索引0;有目标 kind 时跳过 YOLO 行。
always-approve：slash 纯切换;副作用在 dispatcher(排空/持久化回滚/toast 破坏性样式) | enable-always-approve 选项 shell 侧只映射 AllowOnce,客户端选中才触发 YOLO | settings/update 关 auto 时降级 Ask+清标志+nofy/yolo_mode_changed。
plan_approval：exit_plan_mode→路由/挂起同 ask | 旧审批 send_stale_cancel+清场独占 | 来源 Inline(CreatePlan/"Plan: Submit for approval")vs FileBacked(plan.md) | 三焦点 Preview/Prompt/Commenting+行级评论 PlanComment | 空计划占位 "# No plan written yet…" | 应答 approved / cancelled+反馈(行评论格式 Inline "Proposed plan line(s) N[-M]:"+引用;FileBacked @plan.md:N) / abandoned | plan 模式进出以 CurrentModeUpdate 单向权威。

## 3. 生命周期流
/new：启动闸门延迟 | worktree 模式 Always/Never/Ask(Ask→模态 Yes/No/Always/Never 后两者持久化) | 占位 AgentView 继承 cwd/worktree/yolo/auto/模型→McpInitProgress 转圈→Effect::CreateSession。
/resume+picker：条目字段 id/summary/updated/created/cwd/hostname/source/model/num_messages/branch/repo/worktree_label/last_turn_summary/卡懒加载(turn_count/tool_call_count/first_prompt_preview) | SourceFilter 默认 Nofy;f 循环 Nofy→External→All→Local→Remote | 按 repo_name 分组当前置顶 | d 武装删(外部不可删)y/n | 自由文本 Enter 仅合法 UUID 直载 | 内容深搜偏移 100_000 | foreign：ForeignScanCoordinator 扫 claude/codex/cursor;welcome 10min 内提示;外部 resume=新建会话+发 resume prompt | 加载：已开同 kind→聚焦;否则占位(loading_replay+attached_as_viewer+begin_replay_window+"Loading session…")→Effect::LoadSession;chat 模式拒载本地 Build 会话。
/fork：--worktree/--no-worktree(--at 报不支持) | Ask 模态 | 父 scrollback "Forked: {directive}" | 子 pending_fork_banner+pending_first_prompt | worktree 路径 CreateWorktreeSession{load_session_id=父} | 非 worktree Effect::ForkSession→nofy/session/fork | shell 侧 copy_session_data_sync(含压缩段)=复制 transcript 分叉。
/rename：乐观 display_name(--auto 清钉回生成标题)→nofy/session/rename;无确认模态。
/delete：确认问题模态 "Delete this session permanently?" Delete(desc 随场景)/Cancel | 确认后 CancelTurn{cancel_subagents}→逐个 KillBgTask→toast→Effect::DeleteSession{after:Dashboard|Welcome}。
dashboard 关闭会话：拒关唯一会话(toast "Cannot close the only session -- use /home")。
/export 无参剪贴板/有参 .md | /share shell 透传,本构建 sharing_enabled=false menu-hidden | /transcript 临时 md+$PAGER(minimal 走 request_minimal_transcript;空=system 块) | /history 模糊搜索回填 | /recap ACP ext 绕队列,fail-closed 至 shell sessionRecap 门 | /import-claude=welcome Ctrl+I 同 UI。
leader 重连：ReconnectLoadPlan meta={yoloMode,autoMode,cursor:last_seen_event_id};leader 有 cursor 只重放尾部,无才全量 | begin_replay_window 抑制 TurnRunning | 窗外 replay 丢弃 | finalize 采纳 nofy/runningPromptId(他客户端驱动的回合)+schedulerBackgroundLoops | replay 豁免去重 | restored_from_replay 防任务 pane 自动弹。

## 4. Rewind 全流程
入口：/rewind(/undo) | Ctrl+C 无输出回退(服务器无活动且无排队→在途 prompt 回输入框+移除块) | 内联编辑提交(目标=被编辑轮;busy 先 CancelOffer) | ActionId::Rewind 默认无绑定。
状态机 Loading→Picker→Confirm→Executing,旁路 CancelOffer/Error;鼠标全套。
busy→CancelOffer y "Cancel turn and rewind"/n | 取点 FetchRewindPoints→nofy/rewind;空→toast "No undoable prompts";有预选→直达 confirm | Picker "Rewind to which turn?" 降序,行仅 prompt_preview;j/k 锚点同步+以下变暗 | Confirm(confirm_before_rewind 开时) y/a "don't ask again"(持久化关)/n | Executing "Rewinding..."。
RewindPointInfo：prompt_index(唯一标识)/created_at(不渲染)/num_file_snapshots(不渲染)/prompt_preview(唯一显示)/has_file_changes(不渲染)。
文件回滚全在 shell 端;pager 对 reverted/clean/conflicts 只反序列化不渲染不交互 | 成功：清上轮摘要→scrollback.remove_from(anchor) 截断(+缓存释放)→toast "Reverted conversation"(minimal=system 块)→恢复输入框(prompt_text 优先)→焦点回 Prompt | 内联编辑截断后自动重发 | 失败 Error 阶段 | 草稿保护：进流程即 stash,取消/错误恢复。

## 5. 仅 CLI 动词(TUI 无入口=parity 之外,桌面版可选 GUI 化)
task submit/list/status/cancel(委托,daemon 控制套接字) | schedule enable/add/remove/list(默认关闭) | approval list/decide/decide-all(跨会话批量审批) | trash list/restore/add/empty--force | lease list/declare/release | forensics(崩溃账本,daemon 停机可查) | sessions list/search/delete(search 仅 CLI) | memory clear/add-dir/dirs/remove-dir(clear 等仅 CLI) | mcp list/add/remove/enable/disable/doctor(配置管理仅 CLI;/mcps 看运行态) | plugin list/install/uninstall/update(安装类仅 CLI) | doctor(有 slash) | export <id>(按 ID 离线导出仅 CLI) | trace(打包 tar.gz) | worktree list/show/rm/gc/db(创建有 TUI,运维仅 CLI) | du | models | leader list/info/kill | daemon | agent stdio/headless/serve/leader | inspect | wrap(PTY 包裹 OSC52) | version | completions | workspace(隐藏,Computer Hub) | dashboard(有 slash)。
PagerArgs 关键旗标：-r/--resume[ID|标题] -c/--continue -s/--session-id --fork-session -w/--worktree --restore-code -p/--single --output-format --json-schema --permission-mode --sandbox --minimal/--fullscreen/--no-alt-screen 位置 prompt。启动意图 DeferredSessionStartup{Load/NewWithId/Fork/ForeignResume} auth+trust 闸门后 drain 重放。

## 6. 其他
AgentState{Idle,TurnRunning,TurnCancelling,CommandRunning,CommandCancelling} | McpInitProgress total==0="Starting session…" | wake/synthetic 回合不被收养,仅持久 TurnCompleted 收尾 | /loop scheduler-fired 客户端驱动可被 viewer 采纳。


---

# Part 5 · 桌面前端 GUI 化优先级（parity 施工表）

> 状态：✅ 已有 / 🟡 部分 / ❌ 缺失。P 序=施工顺序，每 P 以"TUI 同动作可在 GUI 完成"为验收。

## P1 会话内环补全（合格线核心）
| TUI 表面 | v2 现状 | GUI 化要点 |
|---|---|---|
| rename /rename --auto | ❌ | fleet 右键+spine 头部内联编辑 |
| fork（transcript 分叉+worktree 询问模态） | ❌ | spine 轮级动作"分叉"，模态 Yes/No/Always/Never |
| export（剪贴板/.md）/ transcript 查看器 | ❌ | spine 头部菜单；transcript→BlockViewer 等价 |
| session-info 面板 | 🟡 | 头部徽章点击→信息卡(ID/cwd/模型/上下文) |
| scrollback 搜索 /find + n/N | ❌ | spine 内搜索条(Ctrl+F)，匹配高亮+跳转 |
| jump 轮跳转 | ❌ | 轮索引浮层，移动即滚动 |
| history prompt 搜索 | ❌ | composer Up 浏览+模糊搜索浮层 |
| 内联编辑历史用户块(Enter 编辑→rewind 流) | ❌ | 用户节点编辑→截断重发 |
| timestamps / timeline | ❌ | 脊柱时间戳列+轮刻度导航条 |
| copy [N][file] | 🟡(仅复制按钮) | 轮级 copy 菜单 |

## P2 审批/计划/问答保真
| 权限选项级（allow-always-command 选词±、MCP scope Tool⇄Server、reject+followup 输入、pattern 编辑、1-9 直选、光标预选链） | 🟡 仅允许/拒绝 | 审批卡重做：选项列表+作用域调整+拒绝附言 |
| plan 审批（行级评论、a/s/q、空计划占位、CurrentModeUpdate 权威） | ❌ | 计划查看器+评论+批准/请求修改 |
| QuestionView 多问题表单（多 tab、多选、自由文本、Shift+X 强提） | 🟡 accept/decline | elicitation 表单渲染器(requestedSchema 全类型) |
| CancelTurn 子代理仍运行四选项 | ❌ | 取消时模态 Stop/Continue/Always* |
| always-approve/auto 模式芯片+toast+持久化回滚 | 🟡 L1 芯片 | 会话头模式芯片(Normal/Plan/Always 三态循环=Shift+Tab 等价) |

## P3 活任务面
| tasks pane 四源(Workflows/Subagents/Bg+Monitor/Scheduled)+kill/copy stdout | ❌(lineage 仅日志) | 任务抽屉：实时三源+操作 |
| todo pane(□▶✓✗+h 隐藏已完成) | ❌ | 侧栏 todo 卡 |
| queue pane(删/编辑/重排/强发/origin 区分) | 🟡 芯片 | 队列面板全操作 |
| follow-up chips(≤6 可点击) | ❌ | spine 回合后建议芯片 |
| btw 侧问面板 | ❌ | "不打断侧问"输入+折叠块 |
| send-now(空 Enter 强发队首)+interject | ❌ | composer 运行中语义 |
| SendToBackground [↓] | ❌ | 回合头"转后台"按钮 |

## P4 上下文/用量/记忆/诊断
| context bar(断点混色+悬浮进度) | ❌ | 状态栏上下文条 |
| /usage 块(cached/reasoning/By model/incomplete 标记) | 🟡 | 用量视图全字段 |
| compact(+AutoCompact 态块) | ❌ | 头部"压缩"动作+事件块 |
| recap 块(迟到/重复闸门) | ❌ | "摘要"动作+块 |
| memory browser(三源分组+预览+删) | ❌ | 记忆模态 |
| doctor(13 类警告+fix 征询) | ❌ | 诊断模态(桌面探针等价) |

## P5 生态面
| extensions 五页签(hooks/plugins/marketplace/skills/mcp 运行态+auth+setup 表单) | ❌(仅 mcp 配置 CRUD) | 扩展模态 |
| agents/personas 管理(启停/设默认/$EDITOR/新建表单) | ❌ | agent 管理模态 |
| import 等价(从 ZCode/claude 生态导入) | N/A | 可选 |

## P6 全局面
| dashboard roster(attach 浮层/peek live-tail/行内回复/pin/rename/stop 双击) | 🟡 kanban 无 attach/peek | 看板升级：attach 页+peek 面板 |
| sessions --all 全局检索+来源过滤(f 循环) | ❌ | 会话浏览器 |
| 跨会话审批账本 approval list/decide | ✅ 注意力轨 | 保持 |
| trash/forensics 管家面 | ❌ | 设置内页签 |
| worktree 运维(list/rm/gc) | ❌ | 设置内页签 |

## P7 媒体/查看器
| BlockViewer 全屏(raw/补丁复制/拖选/跟随) | ❌ | 块全屏查看器 |
| LineViewer @file:N-M 引用构建 | ❌ | 文件行选择器 |
| 图片/视频/mermaid 内联 | ❌ | DOM 媒体渲染 |
| 幽灵下一提示(fish 风格) | ❌ | composer 建议行 |

## P8 桌面增强层（parity 之后）
主题 auto 系统跟随+多主题 / Electron 通知(turn_complete+approval_required 默认) / tray Companion / remote pairing 客户端 / zen 布局模式 / 多 agent 并行 tab。

---

# 附：仅 CLI 动词（TUI 亦无入口，GUI 化属增强而非 parity）
task(委托 submit/list/status/cancel) · schedule(enable/add/remove/list) · approval(list/decide/decide-all) · trash · lease · forensics · sessions search · memory clear/add-dir · mcp 配置 CRUD · plugin install 系 · export <id> 离线 · trace · worktree 运维 · du · leader · daemon · wrap · completions · workspace(隐藏)。
