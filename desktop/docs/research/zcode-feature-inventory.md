# ZCode 3.7.6 全功能清单（拆解自安装包）

> 来源：重建渲染层 `ref-ui/zcode/apps/desktop/src`、内嵌 i18n 词典（~4500 keys）、
> 506 通道 IPC 契约、preload 契约、host SQLite schema。由 explore 子代理盘点（2026-08-24）。
> 每条形目格式：功能 — 证据源（i18n 键域 / 组件 / IPC）。

## A. 会话与对话
- 新任务首页（问候/工作区 chip/建议卡）— chat.empty.*
- 对话视图：轮次、流式、思考块、加载更早消息、工作时长 — chat.history.* / chat.reasoning.*
- 追问 composer：发送/停止、队列占位 — chat.placeholder.followUp* / chat.send / chat.stop
- **消息队列**：运行中排队草稿、排序、恢复/暂停、立即发送确认 — chat.queue.*
- **消息操作**：复制、赞/踩、编辑、重试、恢复、从消息 fork — chat.message.*
- **轮导航器**：长任务内跳转用户提问 — chat.turnNavigator.*
- 侧栏任务列表：置顶/最近分区、时间线分组、重命名/置顶/归档/删除、未读、状态徽章、按 agent 新建（ZCode/Claude/Codex/Gemini/OpenCode）— taskList.*
- **任务分组**：彩色分组、拖入、cron 组、移动/取消分组 — taskGroup.*
- 任务搜索（标题/正文+片段）— taskSearch.*；时间线分组 — taskTimeline.*；任务前进/后退 — taskNav.*
- 归档：归档/恢复、归档搜索与删除 — taskList.archive*
- 会话头操作：复制 session/task/日志/JSONL 路径、重载、在编辑器/文件管理器打开 — appHeader.*
- **上下文用量表**：token 预算、分解（系统/工具/MCP/技能）、缓存命中率、压缩触发 — chat.contextUsage*
- **上下文压缩**：手动/自动、队列/重试态 — chat.compact.*
- **Prompt 增强**：用所选模型改写草稿 — chat.promptEnhance.*
- **引用侧聊**：最多 8 段会话引用进任务或侧聊 — chat.selections.*
- **Goal 模式**：设置/暂停/恢复目标、目标验证循环 — chat.target.* / chat.goalVerification.*
- 计划模式与计划面板：plan/raw 标签、复制、批准、模式切换 — planTool.*
- 模型切换守卫：超窗先压缩 — chat.modelSwitch.*
- 聊天错误处理：重试/重登/换模型/验证码/配额、复制 TraceID、带上下文反馈 — chat.error.* / chat.quota.*
- Agent/供应商中途切换 — chat.agentSwitch.*
- CUA 权限引导（macOS）— chat.cuaPermission.*

## B. Composer
- 富输入：@ 提及、/ 斜杠、# 会话插入 — chat.composer.*
- **提及选择器**：文件、插件、技能、子代理、会话、白板 — chat.mention.*
- 斜杠面板：命令/技能/子代理/侧聊 — chat.slash.*
- 附件：文件/图片/剪贴板、拖放、粘贴、大小/数量限制、上传进度/重试 — chat.attachments.*
- 后台工作指示（运行中 bash + 子代理胶囊）— chat.composer.backgroundWorks.*
- 工具条：模式选择、模型选择（搜索/管理）、思考级别（off…max）— chat.toolbar.*
- 每 agent 权限模式（default/plan/accept-edits/yolo/bypass）— mode.*
- IME 安全输入、toast、popover — imeComposition-*.jsx

## C. 工具执行与审批
- 权限提示：允许一次/永远、拒绝一次/永远、按项目/会话范围、命令前缀范围 — chat.permission.*
- **Elicitation 多问对话框**：多问题流、倒计时、自定义答案、键盘导航 — chat.elicitation.*
- 工具卡：bash/读/搜索/编辑/写生命周期、MCP 详情、技能运行、todo 更新、计划文件 — chat.toolCall.*
- **子代理工具**：后台启动、实时输出、侧栏打开、回复协调者、发消息、输出/停止 — chat.toolCall.agent.*
- Node REPL 工具（沙箱、结果图、完整结果文件）— chat.toolCall.nodeRepl.*
- **变更摘要**：改动文件、review、重应用、回退（含安全预检）— chat.changeSummary.*
- **整轮回退 rewind**：外部修改冲突确认 — chat.rewind.*
- 状态面板：git 分支/变更、运行中 agent/终端、todo 进度、goal、计划、commit/push 入口 — chat.statusPanel.*
- Todo 面板（折叠完成/等待）— todo.panel.*；长时工具面板 — chat.longRunning.*
- **Treemapping**：每轮文件活动树（读/写/查看/删除）— treemapping.*

## D. 工作区 / 文件 / Git
- 工作区管理：打开/创建/最近/分离、WSL UNC 提示 — workspace.*
- 侧栏组织：按项目/时间线/分组、排序、缩放、隐藏 — workspaceSidebar.*
- 文件树：搜索、git-ignore 徽章、仅变更过滤、打开方式、加入聊天 — workspaceFileTree.* / fileTree.*
- 目录浏览对话框（路径输入、隐藏目录）— directoryBrowser.*
- **Git 变更面板**：staged/unstaged/untracked/conflict/上轮来源 — git.*；diff worker
- **Diff 面板**：真实工作区 diff、截断提示 — diff.*
- **Commit 对话框**：AI 生成提交信息、含未暂存、commit & push — git.actionMenu.commitDialog.*
- **Push 对话框**：ahead/behind、upstream 创建 — git.actionMenu.pushDialog.*
- **分支切换器**：搜索/切换/创建、blocked 先提交流 — git.branchSwitcher.*
- **Git 图**：提交图、泳道、详情、加载更多 — gitGraph.*
- 外部编辑器打开（检测已装编辑器）— appHeader.openInEditor*

## E. 文件预览 / 代码查看
- 代码查看面板：TextMate 语法高亮 + 主题、换行、行号、256KB 上限 — codeViewer.*
- 行/范围代码评论进会话 — codeViewer.comment.*
- Markdown 预览（源/预览）、SVG 预览 — codeViewer.markdown* / svg*
- PDF 查看（翻页/缩放）、PPTX（缩略图/元素选择/加入聊天/导出 PDF）、DOCX（含旧 .doc）、XLSX — codeViewer.pdf/pptx.* + office worker
- 聊天预览卡（DOCX/MD/PDF/PPTX/XLSX/网页）— chat.previewCards.*
- 图片灯箱、**Markdown 表格工具**（复制 MD/CSV/TSV、下载、全屏）— markdownImage.* / markdownTable.*
- **Mermaid 全图种**渲染 + 缩放/下载/源码；**KaTeX 数学**；外链安全弹窗

## F. 浏览器
- 地址栏/前进后退刷新/关闭隐藏；多标签与窗口同步；**元素选择器**（取色/字体/背景进聊天）；
  响应式视口；内嵌 DevTools；系统浏览器打开；JS 对话框处理；清数据/导入 Chrome 配置；
  Browser Use 开关 — browser.* / settings.browser.*

## G. 终端
- 集成终端多标签、上下文菜单、shell 选择、继承系统 profile — terminal.* / settings.integratedTerminalShell*

## H. MCP / 插件 / 技能 / 命令 / Hooks / 子代理
- MCP 管理器：增删改（stdio/SSE/JSON）、工具数、OAuth、导入外部 agent、远程同步 — settings.mcp.*
- 插件管理器 + 市场（GitHub/Git/dir 源、商店分类/精选、更新、卸载）— settings.plugins.*
- 技能管理器（工作区/个人/插件、开关、诊断、复制、聊天创建）— settings.skills.*
- 命令管理器（用户 .md 斜杠 CRUD、参数提示、导入）— settings.commands.*
- Hooks 管理器（事件/匹配/超时/异步、兼容导入）— settings.hooks.*
- 子代理管理器（profile：模型/工具/权限/轮数/颜色、后台标志、AGENTS.md 注入）— settings.subagents.*
- 子代理目录面板（运行/结束、状态、打开会话）— subagentDirectory.*

## I. 自动化 / 闲时
- 定时任务 CRUD：频率（时/日/工作日/周/月/自定义）、最大次数、暂停/恢复/立即运行 — automations.*
- 运行历史（触发源、时长、状态、跳转会话）— automations.runs.*
- 模板（晨间简报、风险扫描、周报…）；聊天创建定时任务 — automations.template.* / createViaChat*
- 闲时任务：队列位、暂停/取消、保活、历史、模板 — offPeak.*

## J. 远程 / 配对 / Bot
- 远程向导：SSH/Server/WSL/Docker 四型分步流、连接日志、重试/中止 — remote.* / ssh.* / server.* / wsl.* / docker.*
- Web 远控（手机）：QR 配对、状态、移动端首页/任务壳 — webRemoteControl.*
- Bot 通道：飞书/Telegram/微信/Webhook；绑定码、允许工作区/命令、回复粒度 — bots.*

## K. 设置
- 通用：语言/主题(含 system)/UI 字号/缩放/交互行为/自动归档+保留期
- 外观：代码主题、代码字号、行号、换行
- 通知（桌面+声音）；系统行为（保活、托盘、硬件加速、数据目录迁移、HTTP 代理+CA、性能模式、遥测开关）
- 索引（仓库即时 grep）；模型供应商（预设 OAuth/自定义端点/模型 CRUD/测速/排序）；
  Coding Plan 订阅与支付；**用量统计仪表盘**（热力图、日趋势、模型饼、高峰时段、配额、工具调用分布）；
  记忆查看；Claude 历史迁移；**18 种外部 agent 设置一键导入**； onboarding 向导

## L. 窗口 / 导航
- 标题栏 + 应用菜单（File/View/Help）；**命令面板 quick pick**；任务内查找；
  **命令中心**全局搜索；**侧栏面板**（review/files/subagent/selection 标签页）；**分屏 v4**；
  侧栏（新建/搜索/设置/导日志/社区/资料/快捷主题语言缩放/用量卡）；项目选择器；
  快捷键层；错误边界；启动 splash；**白板**（笔/橡皮/颜色/撤销/命名/加入聊天）

## M. 更新 / 遥测 / 反馈 / 诊断 / 账号
- 更新 toast/对话框/强制更新门/重启确认/发布说明/状态窗口/预览通道
- 反馈中心（提交+我的工单、类型/严重度/模块、截图附件、日志上传、工单时间线、官方回复、补充）
- 进程监控窗口；开发者工具（模型网络状态、token 调试、轨迹查看、调试信息复制、性能录制、stdio tap）
- 登录（OAuth/API key/过期重登/登出运行警告）、欢迎门、OAuth/支付回调

## N. Host 服务面（32 个 message-port 服务）
file, git, gitCheckpoint, system, terminal, setting, credential, broadcast, zcodeTask,
zcodeAgent, zcodeSession, bots, fileWatcher, oauth, modelProvider, usageStats,
codingPlanSubscription, offPeakTask, skills, skillSync, mcpSync, pluginSync, plugins,
pluginManagement, subagents, commands, hooks, memory, outputStyle, settingsSync,
feedback, repoWiki, promptAttachmentTransfer
