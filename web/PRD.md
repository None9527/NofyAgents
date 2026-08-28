# Grok Build 图形客户端 PRD（对标 ZCode 3.7.6）

> 状态：v0.2 —— 全量功能清单见 `docs/zcode-feature-inventory.md`（14 域 / 200+ 条目，
> 拆自安装包 i18n 词典、506 通道契约、重建渲染层）。本文件只定优先级与映射。
> 目标：在 `web/` 客户端（网页 + Electron 壳）中复刻 ZCode 功能面，
> 后端对接 Grok Build 自有接口（ACP / daemon / Electron IPC），不照搬 ZCode 私有 host。

## 0. 信息来源（均可复核）

| 来源 | 路径 | 提供什么 |
|---|---|---|
| 安装包 | `ref-ui/ZCode-3.7.6-linux-x64.deb` | 权威二进制 |
| 架构地图 | `ref-ui/zcode-restored/docs/ARCHITECTURE-MAP.md` | 506 IPC 通道、SQLite schema、端点 |
| Preload 契约 | `ref-ui/zcode-restored/docs/PRELOAD-API.md` | `window.zcode` 全方法面 |
| 渲染块清单 | `ref-ui/zcode-restored/docs/RENDERER-CHUNKS.md` | UI 模块名（treeView/usageStats/officePreview…） |
| 重建源码 | `ref-ui/zcode/apps/desktop/src`、`packages/*` | 组件级实现 |
| 实测 | 本文 §6 | 我们后端的 ACP 事件/方法面 |

## 1. 功能域与现状矩阵

状态图例：✅ 已实现 · 🟡 部分实现 · ⬜ 未实现

### 1.1 会话与对话（核心）
- ✅ 新建任务（模型/供应商/计划模式/变更前确认/思考强度位）
- ✅ 流式回复 + 思考分离（可折叠）+ 流式光标
- ✅ 工具调用块（可折叠、命令/路径摘要、输出查看）
- ✅ 工具审批（允许/拒绝；后端 yolo/hooks 自动放行时静默）
- ✅ 计划模式 → 批准执行
- ✅ 追问、停止（session/cancel）
- ✅ 历史列表 + 完整回放（session/load）、搜索浮层（Ctrl+K）
- ✅ 会话操作：重命名/删除；🟡 置顶/归档（UI 有，真实后端未持久化）
- ⬜ 未读徽章（tasks.unread_at）、会话 fork（forked_from_task_id）
- ⬜ 追问建议 chips（nofy/follow_ups）、prompt 队列显示（_nofy/queue/changed）
- ⬜ @文件提及菜单（输入 @ 弹文件候选；桌面端 fs 可做）
- ⬜ 工具结果 diff 视图（文件编辑类工具的 before/after）

### 1.2 侧栏组织
- ✅ 导航（新建/搜索/自动化/技能/终端/文件/浏览器）+ 快捷键提示
- ✅ 项目区（工作区行 + 会话行 + 状态点 + 相对时间）
- 🟡 分组/项目分段控件（UI 在，"分组"无功能）
- ⬜ 任务分组（task_groups：颜色、排序、kanban）
- ⬜ 置顶区/归档区折叠段、筛选/归档按钮功能
- ⬜ 多工作区切换菜单的真实"打开目录"（桌面端 dialog 已备）

### 1.3 主屏 Home
- ✅ 时段问候、水印、composer、建议卡、公告横幅（可关）
- ✅ 工作区 chip + git 徽章（桌面端真实 git）
- ✅ 模型选择菜单（真实模型清单）、附件（+）
- ⬜ 闲时任务（off_peak_tasks）入口与队列状态
- ⬜ / 命令菜单的图标/参数提示细化

### 1.4 自动化与技能
- 🟡 自动化列表视图（空壳；无 CRUD/运行历史）
- 🟡 技能视图（= agent slash 命令；无 skillStore 浏览/安装）
- ⬜ 自动化 CRUD（cron、模型、模式、投递目标）、启用开关、运行历史（automation_runs）
- ⬜ 插件/技能市场 UI（marketplace）

### 1.5 终端 / 文件 / 浏览器 / 预览
- ✅ 终端面板（桌面端真实 shell；网页端提示）
- ✅ 文件浏览器（桌面端树 + 只读查看）
- ✅ 浏览器多标签（iframe）
- ⬜ 文件预览引擎：PDF/DOCX/XLSX/PPTX/图片（officeFilePreview 等模块）
- ⬜ 进程监控面板（processMonitor preload）
- ⬜ 在外部编辑器/文件管理器打开（getInstalledEditors/openInEditor/openInFileManager）

### 1.6 用量与洞察
- 🟡 单会话用量徽章（response_completed 累计）+ 轮摘要
- ⬜ 用量仪表盘（AppUsage* 图表：按日模型柱状、模型饼图、CodingPlan 折线）
- ⬜ 会话活动面板（getDesktopSessionActivity）

### 1.7 设置与偏好
- ✅ 语言/主题/缩放/供应商/MCP 状态面板/关于/连接说明
- ⬜ MCP CRUD（load/saveMcpFromUserDirectory）、迁移
- ⬜ 数据目录管理、权限模式选择、hooks 列表展示
- ⬜ 自动更新偏好、标题栏主题、快捷键面板（keyboardShortcuts 模块）

### 1.8 窗口与桌面壳
- ✅ 最小/最大/关闭/全屏（Electron）、单实例、投屏页
- ⬜ 多窗口/窗口标签同步（SyncWindowTabs）、未读计数同步
- ⬜ 缩放级别系统事件、标题栏主题同步、window-controls-overlay
- ⬜ 系统通知 + 声音（showTaskNotification/TaskNotificationSound）
- ⬜ 截图/打印 PDF/导出日志（captureWindowScreenshot/print-to-pdf/exportLogs）

### 1.9 远程与协作（重投入，P2）
- ⬜ 远程工作区：SSH aliases / WSL / Docker（connectRemote 系列）
- ⬜ Web 远控配对（startWebRemoteControl 系列）
- ⬜ 社区/工单/反馈（canOpenCommunity/openTicketsPanel/openFeedbackDialog）
- ⬜ OAuth/支付回调、CUA 权限引导

### 1.10 更新与遥测
- ⬜ 自动更新全流程（getUpdateState/downloadUpdate/quitAndInstall/ReleaseNotes）
- ⬜ 遥测上下文/事件上报开关、性能追踪（perf:start/stop）

## 2. 数据模型（ZCode host SQLite → 我们需对齐的实体）

| 表 | 关键字段 | 客户端体现 |
|---|---|---|
| tasks | pinned/archived/deleted/unread_at/forked_from/mode/model | 侧栏分区、徽章、操作菜单 |
| task_groups(+members) | 颜色、排序 | 分组视图 |
| automations | cron_expr/prompt/model/mode/thought_level/enabled/next_run_at | 自动化 CRUD |
| automation_runs | outcome/session_id/error | 运行历史 |
| off_peak_tasks | status/queue_position/files_changed | 闲时任务面板 |

## 3. 协议映射（ZCode host RPC → 我们的后端）

| ZCode 能力 | 我们现状 | 缺口补齐方式 |
|---|---|---|
| 会话/流式/工具/审批 | ACP：session/new·prompt·update·request_permission·cancel | ✅ |
| 历史/回放 | session/list · session/load | ✅ |
| 模型清单/切换 | session/new.models · session/set_model | ✅ |
| slash 命令 | available_commands_update | ✅ |
| MCP 状态 | _nofy/mcp/* | ✅ 只读；CRUD 需扩展或 CLI 桥 |
| 用量 | response_completed.usage | ✅ 累计；仪表盘需聚合存储 |
| 任务置顶/归档/未读 | 无 ACP 方法 | 扩展 `nofy/ui/*` ext 方法或读会话持久化 |
| 自动化 CRUD | daemon `nofy schedule`（control socket） | Electron 桥 CLI；网页端只读通知 |
| 分组 | 无 | 客户端本地存储先行（localStorage），后端后置 |
| 终端/文件/对话框 | Electron IPC（已备） | ✅ 桌面；网页端明确降级 |
| 远程工作区 | 无 | P2，评估 nofy leader/remote 能力 |

## 3.5 UI fork 决策（v0.3，2026-08-24）

用户要求全面 fork ZCode 的 UX/UI。对 ref-ui 三种可fork形态做了实测评估：

| 形态 | 结论 |
|---|---|
|  shipped renderer（757 JSX + 打包 chunk） | 视觉 1:1，但深绑 ZCode 账号体系（本地凭据门、阿里云验证码）与 506 通道 host 协议；无登录态无法越过启动门，fork 成本以周计 |
| `packages/client-clean`（复原工程自带的干净客户端，home 视差 96.6% 已验证） | React 组件 + 556 行 ZCode 采样样式，RPC 面与我们的 HostClient 同构 —— **采用** |
| 我们原有自写 UI | 被用户判定"一团乱麻"，弃用其视觉层 |

**落地方式**：`styles/app.css` = client-clean 的 styles.css 作唯一视觉基底 + 我们的功能扩展块（P0/P1 的 ctx-meter、queue、turn-nav、work-panel、git、palette、elicitation 等）；组件 markup 类名本就同构，直接继承新基底。CDP 套件（P0 10 项 + P1 12 项）换肤后全绿。

shipped renderer 的探索产物保留在 `web/zfork/`（bridge-nofy.js、nofy-client.js、zfork-serve.mjs）作为后续"像素级 1:1"立项的起点；若要把登录门 patch 掉并实现 30 通道 host 适配器，单独立项。

## 4. 分期计划（v0.2 修订：对话面优先）

**P0（对话框与核心对话体验完整）**
1. ✅ 富 Markdown（代码块+复制、表格、列表、引用、链接）/ 共享 Composer（多行、@、/、工具条）/ 滚动管理 / 消息元信息 —— 本轮已完成
2. ✅ 消息队列：运行中可继续发送，排队消息以 chip 显示（mock：live.queue；真实后端：`_nofy/queue/changed`）—— CDP 验证通过
3. ✅ 消息操作：重试（↻ 重发该轮提问）、编辑重发（✎ 回填 Composer）、赞/踩（本地态）—— CDP 验证通过
4. ✅ 上下文用量表：头部 ctx-meter（token 条 + 数值，>85% 变红；数据 `_meta.totalTokens` / 模型 `_meta.totalContextTokens`）—— CDP 验证通过
5. ✅ 轮导航器：右侧用户提问列表，点击平滑滚动到对应轮 —— CDP 验证通过
6. ✅ Git 状态面板 + 变更文件列表 + diff 视图（桌面端 termExec 真实 git，含分支 chip、状态徽标、彩色 diff；网页端显式降级提示）—— 桌面 CDP 验证通过
7. ✅ 思考级别选择器：Composer 工具条 off…max，经 `session/set_model` + `_meta.reasoningEffort` 尽力下发（后端无独立 effort 方法时的最佳映射）

**P1（代理工作流对齐）**
8. ✅ Todo 面板 + 变更摘要（工作面板，从 tool_call 提取 todo_write/写文件）+ 整轮回退（真实 `_nofy/rewind/points|execute`，确认框 + 冲突提示）—— 双端 CDP 验证
9. ✅ # 提及选择器（会话 + 技能；会话提及在发送时展开近期内容为上下文）
10. ✅ Elicitation 多问对话框（MCP form elicitation：initialize 声明能力，`elicitation/create` 渲染 schema 表单并应答）—— mock CDP 验证
11. ✅ 代码查看：行号 + 轻量语法高亮（零依赖，暗/亮主题）；Mermaid/KaTeX 延后 P2（需重依赖）
12. ✅ 命令面板 Ctrl+P（视图/操作/会话，模糊过滤 + 键盘导航）—— 双端 CDP 验证
13. ✅ 自动化 CRUD（桌面桥 `nofy schedule list/add/remove --json`；daemon 停机显式报错；网页只读降级）—— 双端 CDP 验证
14. ✅ MCP CRUD（桌面桥 `nofy mcp add/remove/enable/disable` + 设置面板表单）；用量仪表盘延后 P2
15. ✅ 侧栏：置顶/归档分区（localStorage 覆盖层）、未读徽章、今天/更早时间线分组 —— mock CDP 验证

**P2（重投入，单独立项）**
16. Office/PDF/PPTX 预览、图片灯箱、表格工具
17. Git 图、commit/push 对话框、分支切换器
18. 分屏/侧栏面板、白板
19. 远程工作区向导、Web 远控、Bot 通道
20. 设置大面（供应商 CRUD、导入外部 agent、onboarding）、更新流程、进程监控、反馈/工单

## 5. 验收标准

- 每个 P0 项需在真实后端（nofy agent serve）或桌面 IPC 下 CDP 自动化验证通过；
- 网页端对桌面独占功能必须有显式降级提示，不允许静默死按钮；
- 所有新增视图保持现有传输抽象（mock/ACP/IPC 三态可切换）。

## 6. 实测事件面（我们后端，2026-08-24 探针）

方法：initialize / session/new / session/list / session/load / session/prompt /
session/cancel / session/set_model（待验）。
通知：session/update{agent_message_chunk, agent_thought_chunk, user_message_chunk,
tool_call, tool_call_update, available_commands_update, session_info_update}；
_nofy/{sessions/changed, session_notification{hook_execution, response_completed,
last_turn_summary, pending_interaction, interaction_resolved, tool_call_delta_chunk,
turn_completed, session_summary_generated}, mcp/*, queue/changed, session/prompt_complete}。
