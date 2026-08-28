# Orca 研究笔记（ref-ui/orca，v1.4.178，MIT）

Orca = 多 agent 编排桌面端：并行跑 Codex/ClaudeCode/OpenCode/Pi，每个 agent 一个
git worktree，统一追踪、比较、合并。对我们的 nofy 前端（任务/子代理/工作流/委托）
是直接可借鉴的多 agent 管理范本。

## 1 架构地图（src/renderer/src）

- `app-shell/`：窗口壳。TitlebarLeftControls / TitlebarMainStrip / WindowControls，
  与 ZCode 同构（左簇浮层 + 右窗口控制）。
- `components/sidebar/`：worktree 侧栏（多仓库多 worktree 树 + kanban 入口）。
- `components/dashboard/` + `dashboard-popout/`：**Agent Dashboard**——
  窗内非模态 companion sheet（从侧栏边缘展开）或独立 popout 窗口，二者共用
  `AgentKanbanBoard`，仅 ack/reveal 路由不同（IPC relay）。
- `components/right-sidebar/AiVault*`：AI 会话保险库——跨 worktree 的会话列表、
  续跑（session-continuation）、限额菜单、详情、删除性判定。
- `components/workspace-space/`：工作区页（pane-manager 多窗格终端/编辑器）。
- `store/` zustand slices；`shared/dashboard-snapshot.ts` = 看板序列化契约。

## 2 看板模型（shared/dashboard-snapshot.ts）

- 列 `DashboardBucket`：`attention`(Needs You) / `working` / `done` / `idle`（可隐藏）。
- 卡 dotState：`working|blocked|waiting|done|idle`，另有 display `monitoring`
  （workingMode==='monitoring'，即长驻监视类 agent）。
- **unseen 语义**：完成的 agent 保持绿色直到被 ack（确认），之后沉为灰色 idle；
  未读完成 + 等待回答 → attention 列。与我们的 unread-dot / awaiting-approval 同构。
- 卡字段：paneKey、repo/worktree 名、hostKind(local/ssh/wsl/remote)+HostBadge、
  startedAt→相对时长（just now/Xm/Xh/Xd）、subagents[{id,name,dotState}] 可展开、
  review 徽章(open/draft/merged/closed)、attention 时的 question 摘要行、
  "You" 最近用户输入行。
- 排序：列内按 stateChangedAt 降序（刚换列的在最上），配 view-transition 动画。
- 交互：ack（标记已见）、reveal（跳到该 agent 窗格并 flash 聚焦）、
  终端预览对话框（AgentTerminalDialog，xterm 实时回放）。

## 3 视觉纪律（docs/STYLEGUIDE.md，值得整体引入）

- 单色安静：灰阶承载 chrome，颜色只留给状态（selection ring / destructive / git）。
- token 成对（surface+foreground）；shadcn 原语优先；禁硬编码 hex；
  需要色调用 `color-mix(in srgb, var(--primary) 12%, var(--background))`。
- git 装饰色镜像 VS Code（added/modified/deleted/renamed/untracked…），只用于 git。
- 列表行三态：idle 透明 / hover `bg-accent` / 常驻 current `bg-accent + data-current`；
  键盘选中用 color-mix ~12% + inset ring（浅色下纯 accent 会"消失"）。

## 4 对我们前端的映射

| Orca 概念 | nofy 对应 | 落地 |
|---|---|---|
| worktree 卡 | 任务 task | 看板卡 |
| attention | awaiting-approval 或 completed+未读 | 列1 |
| working | running | 列2 |
| done→ack→idle | completed 未读→已读 | 列3/4 |
| subagents 展开 | 会话内子代理/工作流子运行 | 卡内展开 |
| hostKind badge | 传输 mock/acp/ipc | 卡徽章 |
| reveal | openTask + 滚动定位 | 点击 |
| ack | markSeen | 按钮 |
| terminal preview | dock 终端 | 二期 |

实现：`components/AgentDashboard.tsx`（窗内 companion drawer + 三/四列看板），
Ctrl+Shift+D 与侧栏入口触发；数据来自现有 tasks + taskmeta，不新增后端。
