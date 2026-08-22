# 原版 Grok Build TUI 已有能力清单(防重复建设基线)

> 2026-08-22 · 分支:二次开发分支 · 目的:在讨论「内核能力接入 TUI」之前,先盘清原版 TUI(nofy-pager)已做好的功能,确保任何后续接入只**补缺失面、复用现有模式**,不重建已有面(别画蛇添足)。
> 方法:只读盘点 `crates/codegen/nofy-pager/src/` 的 slash 命令注册表(`slash/commands/mod.rs::builtin_commands`)、视图/面板(`views/`)、app 处理器(`app/acp_handler/`)与 CLI 动词模块。

## 0. 一句话结论

原版 TUI 已是一个功能完备的**会话内(in-session, ACP 驱动)开发者界面**;我们这一轮建设的内核能力(daemon/控制面、跨会话/全局)目前**只落在 CLI 动词层,尚未进入 TUI**。因此「内核能力接入 TUI」的真实工作量 = 把少量跨会话/控制面能力补进 TUI,且应复用现有 pane/命令模式;会话内能力**一律不重做**。

## 1. 已有能力盘点(会话内,勿重建)

| 域 | 已有载体(slash / 视图 / 处理器) |
|---|---|
| 会话生命周期 | `/new /resume /fork /rename /delete /session_info /history /recap /transcript /export /share /import_claude`;`session_picker`、`history_search`、`foreign_sessions` |
| 模型与推理档 | `/model /effort /auto /personas /config_agents`;`acp/model_state` |
| 权限与审批(会话内交互) | `permission_view`、`plan_approval_view`、`/always_approve /plan /view_plan`;`dispatch/permissions` |
| 任务/后台/子代理/会话内调度 | `/tasks`(background+subagents+scheduled 三源)、`tasks_pane`、`todo_pane`、`queue_pane`;`app/acp_handler/{background,scheduled_tasks,subagent_activity}` |
| 上下文与用量 | `/context /usage /compact /compact_mode /expand /timeline /timestamps`;`context_bar`、`credit_bar` |
| 记忆 | `/remember`、`memory_modal` |
| MCP/插件/技能/市场 | `/mcps`+`mcps_modal`、`/plugin /hooks /marketplace /skills`、`extensions_modal` |
| 工作流/子代理目录 | `/workflows`+`workflows` 视图、`subagent_catalog_pane` |
| 界面与体验 | `/theme /vim_mode /multiline /mouse /screen_mode /dashboard /doctor /help /docs /tutorial /release_notes /feedback /announcements /rewind /jump /find /copy /btw /voice /imagine /imagine_video`;`welcome/workspace_mode`、`status_bar`、`shortcuts_*` |
| 设置与诊断 | `/settings`+`settings_modal`;`/doctor`+`diagnostics/view` |

要点:`/tasks` 与 `tasks_pane` 读的是**当前会话**的三源(后台/子代理/会话内调度),**不读 daemon 控制面**;审批是**会话内交互**(`permission_view`),不是跨会话审批账本。

## 2. 已做但仅在 CLI 层(本轮新增,未进 TUI)

`*_cmd.rs` 走 `nofy_daemon::control_client`(控制面 socket),目前只挂在 CLI 子命令(`app/cli.rs` + `nofy-pager-bin`),**TUI 交互面没有入口**:
`task_cmd`(submit/list/status/cancel)、`schedule_cmd`(enable/add/remove/list)、`approval_cmd`(list/decide/decide-all)、`trash_cmd`、`lease_cmd`、`forensics_cmd`、`sessions_cmd --all`、`memory_cmd`(add-dir/dirs/remove-dir)。

## 3. 真实缺口(内核能力 ∖ TUI 已有)

| 内核能力 | TUI 现状 | 缺口性质 |
|---|---|---|
| 委托 run(delegation)submit/list/status/cancel | 无(只有会话内 `/tasks`) | 跨会话控制面,缺 |
| 全局 schedule enable/add/remove/list | 无(会话内调度≠全局调度) | 跨会话控制面,缺 |
| 跨会话审批 list/decide | 无(会话内 `permission_view`≠跨会话账本) | 跨会话控制面,缺 |
| trash / lease / forensics | 无 | 管家面,缺 |
| 跨项目 sessions `--all` | `session_picker` 偏本会话/本地选择 | 全局检索面,部分缺 |

## 4. 接入纪律(若做,如何不画蛇添足)

1. **只补 §3 的缺失面**;§1 一律不动。
2. **复用现有渲染模式**:列表类复用 `list_pane`/`tasks_pane` 或 `/tasks` 的 `CommandResult::Message` 快照;审批复用 `permission_view` 的交互范式;不新建并行 UI 体系。
3. **先问必要性**:开发者在项目内的 TUI 场景,CLI 动词已覆盖 §3;是否进 TUI 取决于是否要「不离开界面」。若只做最小,可先加只读快照类(`/delegations /schedules /forensics`),写操作仍走 CLI。
4. 任何接入须过现有纪律:LOC 棘轮、coverage gate、`gitnexus_impact`/`detect_changes`。

## 5. 与「全局入口」讨论的关系

TUI 已有 `welcome/workspace_mode`(启动时的模式概念),说明「模式」在 TUI 有落点;但 §3 的跨会话能力与 home 锚点/作用域指示仍缺。若后续做全局入口,作用域指示可挂 `status_bar`,home 锚点可挂 `session_picker`/welcome——均为**在现有组件上加投影**,不新增体系。
