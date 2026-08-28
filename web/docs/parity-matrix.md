# nofy TUI ↔ v2 桌面前端 ·  parity 矩阵

> 2026-08-26 · 基线：`ref-analysis/tui-capability-inventory.md` + `docs/02-tui-pager.md`
> 逻辑（ZCode 之师）：内核的 TUI 定义产品功能边界；桌面前端先把边界**完整 GUI 化**（parity），
> 再叠加桌面增强。v2 自研概念（注意力轨/看板/契约/digest）= 增强层，**不得顶替 parity**。
> 标记：✅ 已有 / 🟡 部分 / ❌ 缺失

## 1. 会话内交互面（TUI 主体，缺口集中区）

| TUI 能力 | v2 状态 | 缺口说明 |
|---|---|---|
| /new /resume /delete | ✅ | Dispatch 派发 / 回放 / 右键删除 |
| /rename /fork | ❌ | 无重命名、无分叉 |
| /session_info | 🟡 | 头部仅 title/model/status，无信息面板 |
| /history /transcript | 🟡 | spine 全量渲染，无 transcript 模态/导出 |
| /export /share | ❌ | |
| session_picker / foreign_sessions | 🟡 | fleet 仅本工作区；无跨项目选择器 |
| history_search / scrollback 搜索 | ❌ | spine 无查找（旧树有 find bar，v2 丢） |
| /jump /find /copy | 🟡 | copy 有；jump/find 无 |
| /model /effort | ✅ | 芯片+setEffort |
| /auto /personas /config_agents | ❌ | |
| permission_view（选项级） | 🟡 | 仅 允许/拒绝；无 allow_once/always 选项暴露 |
| plan_approval_view /view_plan | ❌ | plan 芯片有，审批视图/计划查看无 |
| /always_approve | ❌ | |
| /tasks 三源（background+subagents+scheduled） | ❌ | lineage 仅日志提取；无活 pane |
| tasks_pane / todo_pane / queue_pane | 🟡 | queue 芯片有；todo/background 无 |
| /context /usage；context_bar / credit_bar | 🟡 | contract 有 usage；无上下文窗口条/用量视图 |
| /compact /compact_mode /expand | ❌ | |
| /timeline /timestamps | ❌ | spine 无时间戳列 |
| /remember / memory_modal | ❌ | |
| /mcps 运行时状态 | ❌ | 设置仅有配置 CRUD；无运行时状态面 |
| /skills /plugin /hooks /marketplace | 🟡 | skills 仅 # 提及；其余无 |
| /workflows 视图 / subagent_catalog | ❌ | |
| /theme | ✅ | |
| /dashboard | 🟡 | kanban 为自研增强，非 TUI dashboard 对齐 |
| /doctor / 诊断 | ❌ | |
| /help /docs /tutorial /release_notes | ❌ | |
| /rewind | ✅ | 轮级两步回滚 |
| /minimal /screen_mode | ❌ | |
| /btw /voice /imagine（media） | ❌ | |
| 流式 markdown + 语法高亮 | ✅ | |
| LaTeX / mermaid / 图片媒体 | ❌ | |
| 多 agent tab / roster | ❌ | 历史栈替代不了并行 tab |
| status_bar / shortcuts 视图 | 🟡 | 状态栏有；快捷键表视图无 |
| Leader 重连回放 | ✅ | replay 修正+降级态 |

## 2. 跨会话控制面（CLI 动词层，TUI 亦缺，v2 反而领先）

| 能力 | v2 状态 |
|---|---|
| delegation submit/list/status/cancel | ❌（TUI 亦无） |
| 全局 schedule | ✅ 设置-例程 |
| 跨会话审批账本 | ✅ 注意力轨 |
| trash / lease / forensics | ❌ |
| sessions --all 全局检索 | ❌ |

## 3. 结论：粗感来源量化

会话内交互面 36 项中 ✅7 🟡9 ❌20 —— **parity 完成率约 30%**。
v2 精力投在增强层与跨会话面，与 TUI 主体错位 → 用户感知"简陋"。

## 4. 修订施工顺序（parity-first）

- **P1 会话内环补全**：rename/fork、session_info 面板、spine 查找(jump/find)、timestamps、
  export/share、todo pane、context bar + /compact、transcript 模态
- **P2 审批/计划补全**：选项级审批（once/always/reject）、plan 审批视图、view_plan
- **P3 活任务 pane**：/tasks 三源活面板、workflows 视图、subagent catalog
- **P4 上下文/用量/记忆/诊断**：usage 视图、memory modal、doctor
- **P5 MCP 运行时/skills/plugins/hooks 面**
- **P6 全局面**：history_search 全滚动回搜索、sessions --all、trash/forensics
- **P7 媒体**：图片/mermaid/LaTeX
- **P8 桌面增强（parity 之后）**：tray、通知、remote、多 agent tab

纪律：每 P 步以 TUI 同能力截图对照验收；增强层冻结新功能，只修 bug。
