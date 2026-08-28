# Orca 全量解析规格（ref-ui/orca v1.4.178，MIT）

目标：把 orca（多 agent 编排桌面端）的 UI/UX 设计逐模块解析成可直接指导我们
nofy 前端开发的规格。源码为完整 TypeScript（非反编译），证据以
`src/renderer/src/...` 路径给出。配套：`orca-study.md`（速记版）。

orca 一句话：并行运行 Codex/ClaudeCode/OpenCode/Pi 等 agent，每个 agent 一个
git worktree + 一个终端窗格；左侧 worktree 侧栏、中间多窗格工作区、右侧
AiVault 会话保险库；Agent Dashboard（看板+地图）跨 worktree 总览；
状态栏常驻；命令面板 cmdk；Electron 与 Web 双形态。

---

## §1 进程与代码架构

- `src/main`：Electron 主进程（PTY、worktree、IPC relay、popout 窗口、relay 服务）。
- `src/preload`：contextBridge API（window.api.*）。
- `src/renderer`：React 18 + zustand + tailwind v4 + shadcn/Radix 原语。
  - `app-shell/` 窗口壳与启动路由
  - `components/` 功能模块（sidebar、dashboard、right-sidebar/AiVault、
    workspace-space、status-bar、settings、new-workspace、terminal…）
  - `store/` zustand slices（terminals、github、…）
  - `lib/` pane-manager、palette-match、terminal-themes、monaco-languages…
  - `web/` 浏览器形态的 preload-api shim；`web-index.html` + `vite.web.config.ts`
- `src/shared/` 跨进程序列化契约（dashboard-snapshot、agent-status-types、
  execution-host、repo-icon、tui-agent）。
- `src/relay`、`src/cli`：手机伴侣中继与 CLI（orcad）。
- 弹层双形态：Agent Dashboard 既是窗内 companion sheet，也可 popout 成独立
  窗口；二者共用 `AgentKanbanBoard`，仅 ack/reveal 路由不同（IPC relay）。

## §2 设计系统（docs/STYLEGUIDE.md + assets/main.css）

### 2.1 总纲
单色安静：中性灰承载 chrome，颜色只留给状态（selection ring / destructive /
git 装饰 / agent 状态点）。先 muted/accent/border，后颜色；先 CSS 变量，后 hex；
先 shadcn 原语，后自定义 CSS。

### 2.2 令牌（main.css :root / .dark，精确值）
| 令牌 | light | dark | 角色 |
|---|---|---|---|
| background | #fff | #0a0a0a | 画布 |
| editor-surface | #fff | #1e1e1e | 编辑器/预览窗格（暗色比画布亮一档，VS Code 惯例） |
| foreground | #0a0a0a | #fafafa | 正文 |
| card | #fff | #171717 | 抬起面板 |
| popover | #fff | #171717 | 浮层 |
| primary | #171717 | #e5e5e5 | 唯一肯定动作 |
| secondary/muted/accent | #f5f5f5 | #262626（accent #404040） | 次级/弱化/hover |
| border | #e5e5e5 | rgb(255 255 255 / .07) | 所有 hairline |
| input | #e5e5e5 | rgb(255 255 255 / .15) | 仅表单底 |
| ring | #a1a1a1 | #737373 | focus/选中 halo |
| destructive | #e40014 | #ff6568 | 不可逆动作 |
| sidebar | — | #171717（accent #262626） | 通用侧栏族 |
| worktree-sidebar | — | #2a2a2a（accent #353535） | worktree 侧栏专用族 |
| agent-question | orange-500/300 | | "回答我"注意力色 |
| status-success | #86efac + color-mix 10%/25% 底/边 | | 成功态三件套 |
| workspace-status | done #c7a594 / review #16a34a / progress #d4a300 | | 工作区状态 |

规则：token 成对（surface+foreground）一起用；git 装饰色镜像 VS Code
（added/modified/deleted/renamed/untracked/copied/ignored）只用于 git；
需要色调用 `color-mix(in srgb, var(--x) N%, var(--y))`，不新增 hex；
light/dark 自动对齐。

### 2.3 字体/圆角/ elevation
- Geist 可变字重（100–900）唯一 sans；mono 用 `--font-mono`（路径/代码/终端相邻）。
- body letter-spacing 0.01em 全局，不得覆盖。
- 字号：11px 大写元信息（600 + uppercase + 0.05em）、12px 次级、13px 密集行、14px 正文。
- `--radius: 0.625rem`(10px) 基准，sm/md/lg/xl 按比例派生；按钮/输入 rounded-md，
  Card rounded-xl，badge rounded-full。
- 阴影三级封顶：inset hairline（默认）→ subtle lift（shadow-xs+border）→
  floating（0 10px 24px rgba(0,0,0,.18)，popover 专用）。第四级=用 ring 反思。

### 2.4 列表行三态（全应用统一）
idle 透明 / hover `bg-accent`（worktree 侧栏 `bg-sidebar-accent`）/
键盘选中：浅色下纯 accent 会"消失"，用 color-mix(foreground 12%) + inset ring
（`.jump-palette-item[data-selected]` 配方）/ 常驻 current：`bg-accent + data-current`。
禁硬编码 #ededed/#333 之类。

### 2.5 原语选择分叉表（节选）
hover 标签→Tooltip；富预览→HoverCard；动作菜单→DropdownMenu；右键→ContextMenu；
任意内容浮层→Popover；强制决策→Dialog；边缘滑入→Sheet；已知列表单选→Select；
带搜索单选→Command(cmdk)+Popover；带搜索多选→repo-multi-combobox；
瞬态确认→sonner toast；常驻状态→内联文本+Badge。
按钮变体优先级：default(唯一肯定) > secondary > outline > ghost > link > destructive；
尺寸 36/32/24/40 + icon 族，与行高匹配。
Tooltip：delayDuration 400 全局单 Provider；`asChild` 触发；side top offset 4；
快捷键用 `<ShortcutKeyCombo/>` 芯片，不拼字符串。

## §3 Agent Dashboard（多 agent 总览，核心创新）

### 3.1 形态
- 窗内：非模态 companion Sheet，从 worktree 侧栏边缘展开（left = sidebar 宽，
  top = 顶栏高，bottom = 状态栏高），`modal={false}`，外部点击/Escape 自管；
  侧栏保持可交互（guardSidebarInteraction 拦截左半指针事件）。
- popout：独立 BrowserWindow，同一 `AgentKanbanBoard`（h-screen w-screen），
  ack/reveal 经 IPC relay 回主窗口。
- 设置可切换两种形态（AgentDashboardSettingsMenu "Switch to pop-out"）。

### 3.2 看板模型（shared/dashboard-snapshot.ts，序列化契约，structured-clone 安全）
- 列 `DashboardBucket` 顺序固定：attention("Needs You") / working / done / idle
  （idle 可隐藏，snapshot.showIdle）。
- 卡 `DashboardCard` 字段：paneKey、ptyId（终端预览用，可 null）、agentType
  （开放字符串，well-known：claude/codex/gemini/opencode/cursor/copilot/aider/pi/
  grok/devin/trae…）、bucket、dotState(working|blocked|waiting|done|idle)、
  workingMode('monitoring'→display 'monitoring')、task 一行摘要、
  lastUserMessage/lastAgentMessage、路由四元组 repoId/worktreeId/tabId/leafId、
  parentPaneKey/parentWorktreeId（lineage）、repoName/worktreeName、
  hostKind(local|ssh|wsl|remote)+executionHostId+hostLabel、
  workspaceKind(worktree|folder)、workspaceStatus{Id,Label,Color}、
  hasReview+review{number,state open|closed|merged|draft}、
  subagents[{id,name,dotState}]、startedAt、finishedAt（完成卡显示"完成后多久"）、
  stateChangedAt（列内排序键，刚换列的置顶）、unseen（全应用 ack map 派生，
  与侧栏未读同源同步）、askSummary（attention 时的待答摘要）、conversationName、
  terminalInput（预览终端的键编码契约：hostPlatform、ConPTY、Shift+Enter 编码等）。
- 上限保护：标签 1KB、launch worktrees 500、map workspaces 2000，超限整快照丢弃。
- 显示态：`done && !unseen → idle`（完成保持绿直到 ack，然后沉灰）。

### 3.3 看板 UI（AgentKanbanBoard/AgentKanbanCard）
- 列：`min-w-[264px] flex-1 rounded-xl border-border/60 bg-muted/30`；
  头：11px uppercase 600 0.05em 标签 + 右对齐计数 pill（bg-background tabular-nums）；
  空列文案 "None"。attention 不再整列染色——卡片自带状态色，避免双重信号。
- 卡：attention 用 `--agent-question` 40% 边 + 6% 底（hover 60%/10%）；
  标题 unseen 加粗 foreground，否则 muted；相对时长 just now/Xm/Xh/Xd；
  HostBadge（local/ssh/wsl/remote）；review 徽章四态；"You" 行显示最近用户输入；
  askSummary 行：orange 15% 底 + inset ring；subagents 计数可展开（chevron 90°
  旋转），逐子代理 dot；点击 reveal：setActiveWorktree + activateTabAndFocusPane
  （flashFocusedPane）；ack：acknowledgeAgents([paneKey])。
- 工具栏：搜索框（"Search agents"，结果计数 "{{shown}} of {{total}} shown"，
  clear 按钮）+ Filter 菜单（Project / Workspace status / PR-MR status 三组多选，
  带各态计数）+ 活动过滤芯片行（可单删/Clear）+ 视图切换（Board ⇄ Map）+ 设置菜单。
- 终端预览：AgentTerminalDialog——xterm 实时回放 agent 的 PTY（快照回放
  preview-terminal-snapshot-replay），键编码按 execution host；按钮 "Open worktree"
  = reveal。

### 3.4 Agent Map（空间画布总览）
- 工作区环（worktree ring）+ 环内 agent 节点 + lineage chevron 连线（父子派生）；
  状态光晕（StatusGlow）按 dotState；项目标签自动 declutter；空间打包算法
  （worktree-packing/spatial-index）；时间过滤（time-range）、quick views、
  视口缩放控件、项目/工作区右键菜单；hover containment；motion layout 动画。
- 与看板共享过滤（useAgentMapFilters）与快照。

## §4 共享状态契约（agent-status-types.ts）

- 状态来源：**agent 原生 hooks 上报（IPC），绝不从终端标题推断**；
  中断兜底合成最终 done。
- `AGENT_STATUS_STATES = working|blocked|waiting|done`；workingMode 'monitoring'。
- AgentType 开放集合（自定义 agent 存在），well-known 仅便利联合。
- 历史快照 AgentStateHistoryEntry 用于活动块渲染；合并轮输出存
  lastCompletedAssistantMessage（每窗格一份，防内存放大）。
- 字段规范化 + 长度上限（AGENT_STATUS_MAX_FIELD_LENGTH）+ JSON 结构限幅。

## §5 AiVault 会话保险库（right-sidebar/AiVault*，约 60 文件）

跨所有 agent（17 种：claude/codex/gemini/cursor/copilot/opencode/pi/grok/devin/
droid/hermes/…）的**历史会话扫描器**——不存数据，扫各 agent 本机转录文件。

### 5.1 面板结构（AiVaultPanel.tsx）
头部（标题 "Agent Session History"，<300px 容器查询收缩为 "Agents"；副标题
"{{shown}} shown · {{recent}} recent"；主机范围菜单/视图菜单/刷新）→ 错误条 →
扫描问题横幅 → **虚拟列表**（@tanstack/react-virtual，overscan 8，粘性分组头）→
续写对话框。
头部第二行：scope 三段 ToggleGroup **Workspace / Project / All**（上下文不可用
禁用；scope 不持久化，恢复时按可用性还原用户偏好）。第三行：搜索框（支持
`repo:` `path:` 操作符 + 引号值，查询 >2KB 直接空结果）。

### 5.2 会话对象（shared/ai-vault-types.ts）
id、executionHostId(+platform)、agent、sessionId、title、cwd、branch、model、
filePath（`#`=OpenCode SQLite 合成路径）、createdAt/updatedAt/modifiedAt、
messageCount、totalTokens、previewMessages（最近 N 轮 role+text+ts，截断标记）、
firstUserPrompt（**懒加载**，列表扫描不含）、lastUserPrompt（续写安全 hint）、
queuedMessageCount、subagentTranscriptCount（零轮次可恢复信号）、resumeCommand、
subagent{parentSessionId,agentType,status}。
判定：resumable = messageCount>0 或预览含 user/assistant 轮；recoverable-empty =
零轮次但有排队/子代理转录 → 显示 "Not saved" 虚线徽章而非隐藏。

### 5.3 视图选项（持久化 localStorage `orca.aiVault.viewOptions.v1`）
disabledAgents(17 多选)、sort(updated|created)、group(project|folder|agent)、
hideEmptySessions、sessionLimit **[250,500,1000,unlimited] 默认 250**（附性能注：
"May be slower"/"Slowest"/"Recommended"）。调整计数驱动视图菜单徽章 + Reset view。
folder 分组键归一化（尾斜杠/NFC）防重复组；标签取路径末两段。

### 5.4 行卡片
标题行（**可拖拽恢复**到新标签，drag data 全量携带）；折叠态显示最新一轮
（role 标签+文本）；元数据行：agent 图标+实时状态点（仅非 done）、agent 名、
n msgs、子代理数、Not saved 徽章、相对时间、模型、worktree 徽章行；
尾部动作 + 右键 ContextMenu 共用同一 deleteBlockedReason。

### 5.5 详情展开（SessionInlineDetails）
动作条：Resume in Worktree / Resume in New Tab / **Continue in New Session…** /
View Log；FirstPromptCard（懒加载）；Latest turns（最近 3 轮 ConversationTurnCard：
You/Agent/tool/system）；子代理列表；worktree 段（紧凑路径+全路径 tooltip）。

### 5.6 resume/续写门控
resume 目标 = 会话自身 worktree → 当前活动 worktree，逐个校验（目标已知 + 状态/
执行主机允许；**跨主机会话不可本地恢复**）；resume 需真实内容，**复制命令只认
内容不受目标阻塞**；标签随目标变 "Resume in Worktree"/"Resume in New Tab"。
续写请求：capturedText（预览拼接）、lastPrompt **仅用 lastUserPrompt**（预览 user
项可能是工具结果/注入）、lastAssistantMessage、initialCwd、launchSource。

### 5.7 删除三层阻断
非本机主机 / 合成路径 / agent 不在可删集合（codex 有 index+硬链接会复活、
opencode 是 SQLite 行、antigravity/kimi 独立注册表留悬空）→ 渲染器可删集合 ⊂
主进程可删集合（主进程磁盘复核）。确认对话框警告"该 agent 自身 CLI 也无法恢复"。

### 5.8 活动栏（右栏入口）
内置序：explorer(Files) → **vault("Agents")** → workspaces(folderOnly) →
pr-checks(folderOnly) → source-control(gitOnly) → checks(gitOnly) → ports(sshOnly)
→ 插件项（核心位置稳定）。按钮支持 top|side 布局、状态点（emerald/rose/amber/
muted）、激活下划线、溢出 "More sidebar tabs"（隐藏项 failure 冒泡红点）。

## §6 设置页（components/settings/）

左栏（搜索框+分组导航+项目列表）+ 右内容（max-w-4xl）。**只有激活分区渲染**；
分区内再懒挂载（deriveNeededSectionIds 同步计算，避免 Effect 延迟）。
导航元数据单一来源 `buildSettingsNavigationMetadata`（同时供设置侧栏与 Cmd+J
跳转面板；架构测试禁止其导入面板 UI）。深链：先激活分区、下一帧滚动子分区；
Shift-点击 Experimental 解锁隐藏组（会话级）。

分组树（顺序即侧栏序）：
- AI Capabilities：agents / accounts(Optional) / orchestration / linear(条件) /
  computer-use(桌面) / voice(桌面)
- Set Up：orca-account(桌面) / setup-guide / general / integrations / mobile(桌面)
- Workflows：automations / artifacts(Beta) / share-skills(Beta) / git / tasks /
  terminal / quick-commands / browser(桌面) / mobile-emulator(桌面) /
  floating-workspace
- Interface：appearance / input / notifications(桌面) / shortcuts / stats
- Remote Hosts：ssh(桌面) / servers(Beta，web 描述变体)
- Privacy & Security：developer-permissions(mac) / privacy
- Advanced：advanced(桌面) / dev(DEV)
- Experimental：experimental / plugins(桌面)
- 每项目一行（多主机折叠，描述含 kind+hosts 摘要）

Agents 分区：每 agent 启用开关（更新串行队列）、默认 agent、检测目录、权限
yolo/manual 分段、防睡眠、Windows runtime、缓存计时、**每 agent 默认 args/env
启动参数编辑器**、技能安装面板、CLI 注册。搜索条目按平台裁剪（不暴露隐藏控件）。
Terminal 分区：六个子分区（Windows shell 选择/渲染字体回滚预设/交互/安装脚本/
**会话管理表+kill 对话框**/高级），搜索时只渲染命中子分区。
Appearance：interface|terminal|window 三 accordion 默认全展开（只开一个其余太难
发现）；含 Ghostty/Warp 主题导入、app 图标选择、标题栏/侧栏/状态栏条目。

## §7 i18n 架构

- `translate(key, fallback, options)`：**调用点永远携带英文回退串**；en 急切打包，
  es/ja/ko/zh 懒加载（自定义 lazyLocaleBackend，changeLanguage 时 import()）。
- 伪本地化在 translate 出口统一处理；插值 `{{value0}}` 位置参数风格。
- I18nProvider：store 的 uiLanguage 异步到达前**不应用任何语言**（防与持久化偏好
  竞态）；以"最后请求的 locale"去重（懒目录加载中 i18n.language 仍旧）。
- `createLocalizedCatalog(builder)`：按 locale 缓存构建结果（搜索元数据等构建期
  调用 translate 的目录），切换语言自动失效重建。
- 质量护栏测试：禁顶层 translate、伪本地化、ja/ko/zh 技术字面量误翻、英语回归。

## §8 Web 形态（web/* + web-index.html + vite.web.config.ts）

- 构建：root=src/renderer，base './'（反代前缀友好），输出 out/web，worker ES 格式。
- 启动链：地址栏配对链接 → decideWebPairingStartup 三态（auto-save-runtime-offer /
  use-stored-environment / show-connect）→ 无环境渲染 **WebConnect**（名称+配对码；
  拒绝 mobile scope QR；HTTPS 混合内容守卫；15s 超时连通+deviceScope 双校验）→
  成功后 `installWebPreloadApi()` 懒加载**与桌面同一个 App**。
- 分工：浏览器零 Node 能力，经 `WebRuntimeClient`（WebSocket RPC：心跳/超时预算/
  文件监视重放）连已配对 runtime；`window.api` = ~50 个 web-*-api 模块组装的 shim；
  桌面独有功能走 runtime 代理或**回退代理静默降级**。
- **回退语义（web-fallback-api.ts，值得我们抄）**：withFallback 递归 Proxy；
  按方法名启发式默认值：`on*`→noop 退订；`is*/has*/pathExists`→false；
  `list*/detect*`→[]；`preview*`→空预览；`get*Status`→[]；`write/resize`→undefined；
  其余→Promise.resolve(undefined)（屏蔽 then 防 thenable 误判）。

## §9 zustand store（44 slices 展开合并成单一 useAppStore）

要点：监听器普查；OOM 面包屑点名最胖 slice；dev 挂 window.__store；大 slice 再拆
（github 30+ 模块、terminals 30 子模块、editor、worktrees）。
清单（节选职责）：repos / sparse-presets / worktrees（detached-head 名、删除记忆）/
terminals（重启、布局、启动队列、水合重连）/ tabs / ui / settings / keybindings /
github / hosted-review / linear / preflight / jira / editor（**含右栏标签状态**）/
stats / memory / workspace-space（磁盘扫描+取消识别）/ 三提供商用量 slice 工厂 /
browser（页缓存）/ rate-limits / ssh / runtime-environment-ssh / **agent-status**
（每 pane 状态、retained、ack 代理、orchestration、epoch 新鲜度纪元）/
pane-foreground-agent / diffComments / detected-agents(+runtime) /
**worktree-nav-history（前进/后退！）** / dictation / workspace-cleanup /
runtime-status / pull-request-generation / commit-message-generation /
pinned-tab-close-confirm / **recently-closed-tabs（Cmd+Shift+T MRU）** /
orca-profiles / new-issue-draft / task-creation-drafts / remote-server-updates /
terminal-quick-command-hosts。

**看板快照派生**（useLiveDashboardSnapshot）：对 ~30 个 store 字段细粒度订阅后
useMemo buildDashboardSnapshot；agentLaunchConfig 用 getState() 非响应式读（只用于
编码身份，订阅只会白白重建看板）；必须监视所有执行主机 slice（SSH 握手/宿主切换
不产生 agent 活动）；agentStatusEpoch 让"陈旧衰减"在无 map 变化时也能重算。

## §10 移动伴侣 UX 调查（docs/mobile-relay-ux-findings.md，方法论值得抄）

三症状根因：Resume 落空白 Host 页（冷嵌套导航器解析丢 hostId 参数）；健康 relay
主机点击先灰 1-2s（聚焦即挂起健康会话再重拨，migrateTo 认证后才绑定）；配对像死
5-10s（relay 路径无日志槽 + 先拨不可达 LAN 最长 12s）。
反模式清查：(a) 未协调深推；(b) **预期瞬态期间渲染灰色 disconnected**——状态翻转
还**清空已载数据**（约 12 界面受影响；正确姿势 "Last known: N worktrees" 陈旧
保留）；(c) 不可见的连接建立阶段。
修复原则：挂载默认 connecting（琥珀）而非 disconnected；make-before-break 迁移零
闪烁；给所有连接路径日志槽；happy-eyeballs 并行直连+relay。
常量附录：直连超时 12s、握手 5s、重连阶梯 0.5→60s、relay 退避 250ms/500ms/30s 全
抖动、worktree 缓存 TTL 30s、配对总上限 25s。

## §11 窗口壳 / 顶栏 / 启动路由 / 状态栏 / 快捷键 / 命令面板 / 引导

### 11.1 窗口骨架（App.tsx + AppWorkspaceShell.tsx）
根 `div.app-layout` 内联 4 个 CSS 变量（--collapsed-sidebar-header-width、
--window-controls-width/height、--mac-traffic-lights-width），并同步写到
documentElement 供 Radix portal 使用（否则弹层被窗口按钮盖住）。
布局树：`[左+中列 | 右栏]`；左+中列 = `[titlebar(非工作区)] + [侧栏列 | 中央列]`；
侧栏折叠时左 titlebar 变**浮层**（absolute top-0 left-0 z-10 w-max border-r）；
中央列 = `[stacked titlebar] + [右栏关闭时的 RightSidebarToggle 悬浮按钮 +
TerminalWorkbench + ActivePage + FloatingTerminalToggleButton]`。
ActivePage 按 activeView lazy 分发：settings/skills/artifacts/tasks/automations/
activity/space/mobile；terminal 视图无活动 worktree → **Landing 落地页**（不拉
终端 bundle）；创建中 → WorktreeCreationPanel。
平台 chrome：Win/Linux 去原生标题栏**自绘**（hasCustomTitleBar），macOS 原生，
配对 Web 两者都不绘。窗口控制 3×46×36px，close hover #c42b1c；**WindowControls
最后渲染**（Electron 拖拽命中按 DOM 序忽略 z-index）。Radix portal 全强制 no-drag；
终端聚焦时 titlebar 释放 drag（第一次点击可释放 zoom 焦点）。

chrome 精确值：titlebar 高 **36px** bg var(--bg-titlebar,var(--card)) border-b drag；
.titlebar-left 同高 bg var(--worktree-sidebar)，分隔用 **inset box-shadow 而非
border-bottom**（保 36px 内容高与红绿灯中心对齐）；logo 16px opacity .75，亮色
invert(1)；mac 红绿灯 pad 80px/zoom。

布局派生（use-app-chrome-layout）：终端工作台**挂载闩锁**（一旦挂载保持，防
activeWorktreeId 瞬空卸载）；hasTabBar = tabCount>=2；showSidebar = 视图非
settings/activity/space；ResizeObserver 测左控件宽 → 折叠留白变量；侧栏开合同帧
dispatch SYNC_FIT_PANES 重排终端。

### 11.2 顶栏左簇按钮序
[mac 红绿灯 pad] → [Win/Linux: logo + ⋯ 应用菜单(popupMenu)] → [mac: 应用名
(右键可 Hide)] → 侧栏开关 PanelLeft → 后退/前进 ArrowLeft/Right（worktree 历史，
disabled 随 canGoBack/Forward）。主带：[#titlebar-tabs portal 插槽（标签条）] →
窗格展开 Minimize2 → RightSidebarToggle(PanelRight) → 138px 窗口控制 spacer。

### 11.3 启动水合链（测试钉死顺序）
fetchSettings → ∥(keybindings, onboarding.get) → await ui.get → hydrate-persisted-ui
→ fetchRepos(skip remote) → catalog-settlement → projectGroups → folderWorkspaces →
session.get → first-window-services-await → fetch-hydration-worktrees(并发受限，含
SSH) → ∥settled(sessionChain, localCatalog) → hydrate-session-stores →
hydration-done → remote refresh → worktree lineage → refreshCompleted。
终端重连夹在 first-window-services-await 后：recover-legacy → snapshot-capabilities →
reconnect → recover-legacy-post。
**降级恢复**：水合抛错进"不保存"模式（磁盘状态不动，fallback UI 水合）。

工作区之前的画面（AppRootSurfaces 固定兄弟序，全 lazy + boundary）：OnboardingFlow、
TelemetryFirstLaunch、SetupGuideModal、FeatureWallModal、FeatureTipsModal；
状态栏 lazy fallback = 24px 占位条。Toaster **急切挂载**（sonner 丢弃订阅前 toast）。

### 11.4 全局快捷键管线
window keydown/keyup **capture** 单次注册；每帧镜像 AppShortcutState 进 ref；
修饰键双击探测器生成合成输入；blur reset。判定序：defaultPrevented → 录制器内 →
context(xterm→'terminal' 否则 'app') → search 特例(选中文件夹→include glob；选中
文本→query) → 浮层关闭时 tab.close 隐藏浮层 → 可编辑目标退出(保 TipTap) → 插件
命令优先 → 逐 handler claim(返回 false 回落终端/下一处理器，claim 时 preventDefault
+ 终端捕获通知)。

默认绑定（Mod=mac Cmd/其余 Ctrl；节选）：
| 动作 | 键 | | 动作 | 键 |
|---|---|---|---|---|
| Go to File | Mod+P | | Toggle Sidebar | Mod+B |
| Settings | Mod+, | | Toggle Right Sidebar | Mod+L |
| **Switch worktree 面板** | mac Mod+J / 其余 Mod+Shift+J | | Explorer/Search/SC | Mod+Shift+E/F/G |
| Create worktree | Mod+N | | New Terminal/Browser/Markdown | Mod+T / Mod+Shift+B / Mod+Shift+M |
| Prev/Next worktree | Mod+Shift+↑/↓ | | Close Tab / Reopen | Mod+W / Mod+Shift+T |
| Worktree 历史 | Mod+Alt+←/→ | | MRU Tab | Ctrl+Tab |
| Workspace 1–9 | Mod+1..9 | | Tab by index | Ctrl/Alt+1..9 |
| Split Right/Down | Mod+D / Mod+Shift+D(mac) | | Terminal search/clear | Mod+F / Mod+K |
| Zoom in/out/reset | Mod+= / - / 0 | | Expand pane | Mod+Shift+Enter |
| Floating terminal | Mod+Alt+A | | Dictation | Mod+E |
平台差异注释：Win Ctrl+Alt=AltGr、Linux Ctrl+Alt+T 开系统终端、Ctrl+R shell 反搜——
故这些和弦在 win/linux 不绑。部分和弦 main 进程 before-input-event 先拦（Mod+J、
数字跳转；palette 打开时 Mod+1–9 路由为行跳转）。

### 11.5 状态栏（24px，text-xs，border-t，bg titlebar）
ResizeObserver：compact<900 / iconOnly<500。**右键任意处**锚定隐藏触发器弹可见性
菜单（CheckboxItem 列表：各 provider Usage、Remote Hosts、Resource Manager、Ports；
按 PATH 检测门控可用性）。
左簇：用量空态 CTA；否则**统一名册按钮** → 360px DropdownMenu(UsageRosterPanel)；
iconOnly 退化为字母徽章；行级下钻每 provider 切换菜单（账号/runtime/reset credits）；
刷新按钮 = refreshRateLimits + refreshDetectedAgents（新装 CLI 即时出现）。
右簇序：Caffeinate → RemoteServerUpdate → SkillUpdate → Update → Pet(实验) →
ResourceUsage(lazy) → Ports(lazy) → Ssh(lazy) → 浮动终端按钮（amber 未读点）。

### 11.6 命令面板（WorktreeJumpPalette，cmdk CommandDialog）
条目联合：worktree / 打开标签(terminal/browser/simulator) / project-target /
settings / quick-action / create-worktree / section-header / hint。
分区：无查询 = Recent Chats & Terminals + Recent Worktrees；有查询 = Open Tabs /
Worktrees / Projects & Groups / Actions & Settings；粘贴 GitHub issue/PR URL =
只显关联 worktree + 创建行。空查询最近区跳过"你已在其中"的 idle 行。
区领导权：意图/更高质量类排前（cmd-j-section-leadership）；渲染上限+双主区交错。
quick actions：New Browser Tab / New Markdown / New Terminal Tab / Create Worktree /
Delete Worktree / Add Quick Command，各带 verbKeywords 参与匹配；Actions & Settings
来自设置导航元数据（同一注册表）。
**模糊匹配库 palette-match（15 文件，值得整体抄）**：query 仅按空白切词（标点留在
token，`orca/main` 完整），≤16 token；token 分 components/compact/identifierLike
（含数字或 sigil 永不模糊）/单拉丁字符(仅 exact/prefix)；质量阶梯 field-exact >
word-exact > field-prefix > word-prefix > boundary-substring > literal-substring >
compact > typo(≥4 字母、编辑距离≤1)；跨区类 exact-intent > exact-visible > … >
fuzzy-evidence；sigil 门控 #123≠GitLab、!123≠GitHub；repo/branch 复合对双字段联打；
整查询评分相等0/前缀1/边界2/默认3。

### 11.7 引导体系
Onboarding 五步（agent→theme→integrations→windows_terminal→notifications），跳过
规则（gh 已装跳 integrations、非 Win 跳 windows_terminal），跳过需确认对话框，
最后一步主按钮 "Add your first project" 交接 add-repo 模态；步骤遥测齐全。
Feature Tips：目录序即优先级；**展示即 markSeen**（崩溃不重弹）；onboarding 显示
中抑制 tip（同会话不弹第二个教育弹窗）。
Feature Wall "Get to know Orca"：1240×780 Dialog，左垂直 rail 五工作流
(workspaces/tasks/agents-orchestration/workbench/review)，三流带 a–f 子步骤打勾；
动画视觉 + 设置清单（SetupGuide 复用同一清单 + 进度环）。

## §12 Worktree 侧栏 / 新建工作区 / 分屏体系 / 终端栈 / agent 启动

### 12.1 worktree 侧栏
宽 220–500 可拖拽（手柄 w-3，hover 显 ring 线）。纵构：SidebarNav（视图入口，
settings 门控）→ SidebarHeader（标题随 groupBy 切 "Projects"/"Workspaces"；
右侧 选项菜单 + **Add Project** + **New workspace**(带快捷键标签)）→
**虚拟化** WorktreeList（TanStack Virtual，行删除动画/sticky 头/滚动锚定）→
SetupScriptPromptCard + SidebarToolbar（底部，含 **Kanban 入口按钮**
data-workspace-board-trigger）。对话框全部渲染在侧栏外防裁剪。
行树模型（扁平虚拟化，非组件嵌套）：GroupHeader / WorktreeRow(含 lineageTrail/
isLastLineageChild/depth) / FolderWorkspace / ImportedCard / NewExternalInbox /
PendingCreation。分组维度：none | workspace-status | repo | pr-status + Pinned 段。
**卡片三态配方**：idle 透明 border-transparent；hover =
`color-mix(sidebar-foreground 4%)`（dark: sidebar-accent 40%）；active 用
`data-worktree-card-active='primary'|'secondary'` 属性选择器承载完整样式（**DOM
抢先同步**：导航时 data 属性先于 React 状态更新，option-dom.ts 在提交前直写
aria-current 与 active 属性）；多选 ring；lineage 放置目标 accent  tint；删除中
opacity-50 grayscale + 全覆盖 blur 层 + 药丸标签；SSH 断连 opacity-60。
Worktree 数据模型要点：id=`repoId::path`、hostId、displayName、comment(Note)、
linkedIssue/linkedPR、isArchived/isUnread/isPinned、sortOrder/manualOrder、
lastActivityAt、createdWithAgent（重开补种终端）、sparse*、baseRef、pushTarget、
priorWorktreeIds(lineage)、workspaceStatus、diffComments、provenance(automation/cli)。
动作：创建（~25 参数 + 冲突重试策略 + manual 排序置顶 + runtime RPC）；删除决策漏斗
（host 精确取行防 SSH/本地互删 → 主检出转 remove-folder → ghost 转 forget-ssh →
有 lineage 子禁跳确认 → 并行执行 + toast）；**无 git merge 动作**——merge 语义全在
PR/MR 徽章展示；右键菜单：Rename / Move to Status(kanban radio 子菜单) / Open In… /
Copy Path / Pin / Mark Read-Unread / 分组三动作 / 父级选择器(FolderTree) /
Open Parent / Remove from Parent / Alt 开发者菜单 / Sleep / Delete(destructive 多变体)。
**workspace kanban 抽屉**：Sheet，关闭 linger 300ms；泳道 = workspaceStatuses
（默认 todo/in-progress/in-review/completed）；列宽 default 308 / min 220 / max 520。
chrome 度量常量：TOP_CHROME_HEIGHT=36、STATUS_BAR_RESERVE=24（portal sheet 显式预留）。

### 12.2 新建工作区 Composer（模态，急切导入——关键创建面）
单列表单，标签 text-xs muted：Project combobox（项目+项目组）→ Run on（host 列表/
Add SSH/Add remote server/ephemeral VM）→ SSH 未连接横幅(role=status) →
**Smart Name 字段**（type-ahead：GitHub/GitLab work item、分支、Linear、Jira；IME
兼容；Enter 不提交而推进焦点到 Agent）→ Reuse branch 复选（grid-rows 动画展开）→
Agent combobox（齿轮开设置 dialog，tabIndex=-1）→ Advanced 折叠（inert；派生 name/
branch 覆盖/**Note 文本域**(field-sizing:content 自增高，超限粘贴提示)/sparse 预设/
setup 脚本决策）→ 主按钮文案三分叉：project-group→Folder Workspace 标签 / git→
"Create worktree" / 非 git→"Create workspace" + "Create more" 开关。
提交快捷键 Cmd/Ctrl+Enter（capture，嵌套 dialog 时挂起）。
Agent 目录 ~35 种 TuiAgent；可见 = detected − disabledTuiAgents；默认 defaultTuiAgent。

### 12.3 分屏体系（两层树；更正：workspace-space 是磁盘占用页不是分屏）
第一层 标签组布局树：`TabGroupLayoutNode = leaf{groupId} | split{direction,first,
second,ratio?}`；Tab 7 种 contentType（terminal/editor/diff/conflict-review/
check-details/browser/simulator），字段含 viewMode('terminal'|'chat')、isPreview、
isPinned、generation(重挂载代)、lastFocusedAt；TabGroup 含 recentTabIds(MRU)。
递归 SplitNode 渲染；ResizeHandle 比例钳制 0.15–0.85；**拖动中直写 style.flex**
（避免 60-120Hz store 提交），pointerup 才 commit。
**editor 族在组内渲染；terminal/browser/simulator 不在组内**——在 worktree 层
统一渲染（避免 split 移动导致 xterm/webview 重挂载）。
第二层 终端内分屏：**PaneManager 的树是 DOM 树**（.pane-split 包装 + .pane 叶子 +
.pane-divider 4px 命中/::after 可见线）；insert 时把目标包进新 split（reparent 前
disposeWebgl 释放 GPU 槽，帧回调 attach+fit）；关闭时兄弟顶替（promoteSibling，根部
恢复 100%）；equalize 按同轴 pane 数加权。持久快照按**稳定 leafId(UUID)** 键（非
运行时数字 id），含 ptyIds/buffers/scrollbackRefs/titles。

### 12.4 终端栈
xterm 默认：fontSize 14、跨平台 mono 链 + Nerd Font、fontWeight 300/bold 500、
cursorBlink block/outline、scrollSensitivity 1.15/fast 5、scrollbar width 7、
kittyKeyboard、minimumContrastRatio 亮色保护；link provider 注册加守卫（防抛异常杀
渲染进程）；插件 Fit/Search/Serialize/Unicode11/WebLinks(+Ligatures 可选)；WebGL
渲染器自动策略 + 诊断；vendored patched xterm 6.1.0-beta + headless 同版契约测试。
主题：目录 = 默认+流行暗/亮+经典；默认暗 'Ghostty Default Style Dark'、亮
'Builtin Tango Light'、divider #3f3f46；theme system/dark/light + 独立亮主题开关；
自定义来源 Warp|Ghostty|Manual；每 pane 合成注入滚动条滑块色 + Ghostty 式逐色覆盖 +
不透明度转 rgba；**CSI 2031 暗/亮模式同步推送**。
Quick commands：terminal-command(appendEnter) | agent-prompt 两类；scope global|repo；
上限 40 条/label 80/命令 4000/prompt 6000；入口 = 标签栏按钮 + 终端右键。
TerminalSlice 核心键：tabsByWorktree、ptyIdsByTabId(**存活判定权威**)、未读三表、
suppressedPtyExitIds/pendingPtyShutdownIds(退出抑制/引用计数关停)、
expandedPaneByTabId、terminalLayoutsByTabId、pendingStartupByTabId、
pendingSnapshotByPtyId(reattach)、pendingColdRestoreByPtyId、cacheTimerByKey。

### 12.5 agent 启动与状态上屏
启动计划 buildAgentStartupPlan → {agent, launchCommand, followupPrompt,
launchConfig, draftPrompt, env, startupCommandDelivery, sessionOptions}；注入方式按
agent 配置：claude `--prefill`(只预填)、codex argv+trust+paste-ready 信号(20s 上限)、
opencode `--prompt`、pi 环境变量 ORCA_PI_PREFILL。
自包含命令走**后端 spawn**；否则渲染端 activateAndRevealWorktree 编排：setActiveRepo
→ view terminal → setActiveWorktree(清未读、死 PTY 递增 generation 重挂载) →
markVisited(最近序) → resumeSleepingSessions → ensureInitialTerminal(消费 startup/
setup/issueCommand/defaultTabs) → 清遮挡过滤 → revealInSidebar。
新会话落在活动工作区活动标签组主终端标签的(首个)pane；launchAgent 写入标签使**首
hook 前**标签栏即显 provider 图标；viewMode 'chat' 为覆盖层，底层 xterm 保持挂载。
状态视觉映射（StatusIndicator 12×12）：working=spinner / monitoring=Radio yellow /
interrupted=red 点 / permission=question 图标 / done|active=emerald 点 /
inactive=neutral 点；出现在卡片状态槽、内联 agent 行、dashboard；辅助 OSC 标题实时
更新 + prompt-cache 倒计时。

## §13 对我们 nofy 前端的映射与实施 backlog

已落地（本轮+前轮）：agent 看板抽屉（§3→AgentDashboard.tsx）、列表行三态、
color-mix token 纪律、git 装饰色、非模态 companion sheet 语义。

待实施 backlog（按价值序）：
1. **任务卡状态点语义对齐**（§12.5 映射表）：running=spinner、awaiting=question
   琥珀、completed 未读=emerald、已读=neutral——替换现有 unread-dot 单信号。
2. **会话内终端预览对话框**（§3.3）：看板卡点击 → dock 终端定位/闪聚焦
   （已有 dock，加 flashFocusedPane 视觉）。
3. **Cmd+J 式跳转面板升级**（§11.6）：抄 palette-match 质量阶梯与分区领导权；
   粘贴 issue/PR URL 直达创建行。
4. **worktree/任务右键菜单补全**（§12.1）：Move to Status、Copy Path、Sleep 等。
5. **状态栏**（§11.5）：24px 条 + 用量名册菜单 + 右键可见性菜单——我们目前无状态栏。
6. **启动水合降级**（§11.3）：后端连不上进"不保存"降级模式而非白屏。
7. **回退代理语义**（§8）：web 形态 window.api shim 的启发式默认值表，直接抄。
8. **引导体系**（§11.7）：首启 onboarding 步骤 + feature tips（展示即 markSeen）。
9. **两层分屏**（§12.3）：dock 内终端支持 split right/down（pane DOM 树配方）。
10. **quick commands**（§12.4）：终端标签栏快速命令按钮（terminal-command/
    agent-prompt 两类，scope global/repo）。

文档完。证据路径均见各节引用；orca 为 MIT，可直接借鉴实现。
