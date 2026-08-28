# WorkspaceShell 模块抽取报告（工作区壳 + 工作区根控制器 · F07 · D8 Stage B）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/WorkspaceShell.tsx`（6,015 行）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 规格：`/home/none/grok-build/web/docs/zcode-uiux-spec.md`（§13 逐条对拍见 §3）
- 地图登记：`MODULE-MAP.md` F07（WorkspaceShellFamily，P0 基础设施级）

---

## 0. 行号口径（与 TopBar 试点一致）

任务锚点 **yJt ≈ js 183896、XJt ≈ js 186219** 在输入 js 中逐字命中；规格 §13.6 引用的
`149287-149335` 是 **jsx 行号**（= yJt 返回段中 `section.bg-background` 到三分体收尾），
两者为同一 chunk 的两种排版。本报告所有符号均给出 **js 行（输入文件）/ jsx 行（规格口径）** 双行号。

| 锚点 | 规格口径(jsx) | jsx 实际 | 输入 js 实际 |
|---|---|---|---|
| yJt（WorkspaceShell） | §13.6 实现体 | 148387 ✅ | 183896 |
| §13.6 三分体现场 | 149287-149335 | 149287–149335 ✅（`X4 workspace-body-layout` 在 149330） | 185050–185339 |
| XJt（WorkspaceRoot） | — | 150098 ✅ | 186219 |
| Mqt dock（§13.7） | 148118 | 148118 ✅ | 183602 |
| 草稿头（§13.9） | 149295 | 149295 ✅ | 185122–185159 |

---

## 1. 抽取的组件清单（混淆名 → 语义名 → 行号范围）

### 1.1 主体（完整还原进 WorkspaceShell.tsx）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `yJt` | `WorkspaceShell` | 183896–185431 | 148387–149354 | **§13.6 三分体实现本体**（memo）：~120 props；桌面分支 + Web 远控移动壳分支 |
| `XJt` | `WorkspaceRoot` | 186219–187019 | 150098–150859 | **工作区根控制器**：身份解析/状态供给/主视图状态机/快捷键/草稿切换 |
| `Y4t` | `MemoizedWorkspaceRoot` | 206773 | 164452 | `memo(XJt)`，供远控壳/应用根挂载（挂载点 206845） |

### 1.2 窗口壳 / 错误边界 / 平台控件（完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `l4` | `WindowShell` | 129647–129666 | 109071–109087 | `h-dvh` 列容器；Mac `bg-background-alt` / 其余 `bg-background-win-alt` |
| `p4` | `ScopedErrorBoundary` | 129952–129991 | 109217–109263 | scope/resetKeys/variant；resetKeys 变化自动清错（`ZOt`） |
| `ekt` | `AppErrorBoundary` | 129920–129950 | 109184–109216 | 接口保留（应用级边界，结构同 p4） |
| `tkt` | `LinuxWindowControls` | 129992–130033 | 109264–109304 | Linux −□× 三键（`executeDesktopCommand`） |
| `d4/YOt/ZOt/JOt/XOt/f4` | 错误/语言助手 | 129706–129733 | 109129–109156 | toError/日志序列化/resetKeys 比较/locale 探测 |
| `VOt…qOt` | ARMS react-error 遥测组 | 129667–129705 | 109088–109128 | `perf_react_error` 事件 + 4KB 截断 |

### 1.3 分割布局原语（应用层还原；引擎接口保留）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `X4` | `SplitLayoutGroup` | 131934–131942 | 111263–111271 | Group + 布局持久化（`react-resizable-panels:{id}:{panels}` localStorage） |
| `Z4` | `SplitPanel`（= `pAt`） | 131943 | 111283 | Panel 直挂（minSize/defaultSize/elementRef） |
| `cAt` | `ResizablePanelGroup` 引擎 | 131422–131598 | 110732–110912 | 接口保留（vendored react-resizable-panels 变体） |
| `uAt` | `usePersistentGroupLayout` | 131631 | 110950 | 接口保留（100ms 防抖写回） |
| `J4` | `persistentLayoutKey` | 131599 | 110913 | 键格式逐字还原 |

### 1.4 WorkspaceShell 私有助手（完整还原）

| 混淆名 | 语义名 | js 行 | 语义 |
|---|---|---|---|
| `Iqt` | `useCollapsiblePanel` | 183714–183777 | open→expand/collapse；`rememberExpandedSize` 收起前记忆百分比 |
| `Lqt` | `resolveAutomationsRunTab` | 183778–183785 | 运行历史目标 tab 裁决（远程未连接→拒绝） |
| `Rqt` | `windowRoundedCornerClasses` | 183782–183790 | Win11 圆角/边框让位四态 |
| `Wqt/Gqt/Kqt/W5/qqt` | 远控导航高度组 | 183796–183814 | `0.5×视口−48` 上限 352、≤24 收起、上限 `视口−48−168` |
| `G5/Jqt/Yqt/Xqt` | 拖拽属性/事件 | 183816–183820 | `data-workspace-sidebar-resizing` + `zcode:workspace-sidebar-resize-end` |
| `J5/mJt/hJt/Y5/X5/gJt/_Jt/vJt` | 侧栏宽度组 | 183841–183894 | 钳制 `[264, 容器×0.5]`、双存储键读写、一次性收起标记 |
| 常量块 | `eJt/q5/tJt/nJt/rJt/iJt/aJt/oJt/sJt/uJt/dJt/fJt/pJt/Zqt/K5/Qqt/$qt/cJt/lJt` | 183822–183840 | 264/264/0.5/两存储键/16/两 CSS 变量/480/360/300/**`['conversation-column','browser']`**/**`['conversation','terminal']`**/`(max-width:767px)`/800/4/{}/[] |
| `RTt/j2/zTt/BTt/VTt/HTt` | 最后会话持久化 | 123122–123177 | `zcode-v4-last-session:v1:{workspaceKey}`；仅渲染器重载+无会话+草稿焦点 0 时恢复 |
| `FTt/ITt/LTt` | 侧栏会话投放上下文 | 123103–123120 | 拖拽任务入聊天区的能开/打开能力注入 |

### 1.5 壳平台助手 + 控制器助手（完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 |
|---|---|---|---|
| `Z5/Q5` | 96 / 136 常量 | 185430–185431 | 149354 |
| `$5/bJt/xJt` | roundPositivePx / resolveWindowControlsPadding / updateReadyVersionOf | 185432–185443 | 149355–149372 |
| `SJt` | `useAppChromeState` | 185445–185564 | 149373–149484 |
| `CJt/wJt/TJt` | 重建节流 1200ms 组 | 185566–185577 | 149485–149497 |
| `EJt/e7/DJt/OJt/kJt/AJt/jJt` | 模型选择裁决组 | 185578–185687 | 149498–149584 |
| `MJt` | `useReloadSession` | 185688–185784 | 149585–149670 |
| `NJt` | `useWorkspaceLifecycle` | 185785–185824 | 149671–149696 |
| `PJt/FJt/IJt/LJt/t7` | 重建禁用判定 + 状态投影选择器 | 185825–185882 | 149697–149745 |
| `RJt/zJt` | `isTaskStillVisible` / `useTaskNavigation` | 185884–186063 | 149748–149916 |
| `BJt` | `useBrowserRestoreUrls` | 186064–186109 | 149917–149967 |
| `n7/VJt` | trimmedOrUndefined / resolveActiveWorkspaceTarget | 186110–186118 | 149968–149984 |
| `HJt/UJt/WJt` | 闲时任务通知（30s 轮询） | 186119–186168 | 149985–150039 |
| `GJt/r7/KJt` | e2e 探针 / `zcode:close-active-context-request` / 可关闭标签裁决 | 186170–186217 | 150040–150097 |
| `T_e/Wg/E_e` | 查找状态初始/改词/导航 | 25385–25393 | （横切层） |

### 1.6 叶子组件（接口保留，完整 JSX 见各自行号或已抽取模块）

`TFt` SessionHeader / `BOt` TopBarOverlay / `S6` WindowsCaptionMenu / `U6` HelpMenu /
`H6` TerminalToggleButton / `zZ` GitBranchChip / `c4/s4` caption 让位（**以上已抽取进
TopBar.tsx**）；`rVt` Sidebar（F01，js 159137）、`a4` WorkspaceSelectionRow（F02，js 128568）、
`xqt` SidePanel（F04，js 182519）、`Mqt` DockTerminalBrowserPanel（F13，js 183602）、
`PTt` ConversationOrchestrator（F03，js 122803）、`owt` StackedConversationPane（js 121284）、
`nPt` TaskFindDialog（F05，js 139949）、`l3` RepoWikiMain（F16，js 132306）、
`d6` AutomationsMain（F15，js 138823）、`JPt` WebRemoteMobileShell（F17，js 141584）、
`Rje` QuickPick（F05，js 36439）、`RMe` FeedbackCenter（F09，js 39107）、
`$Ot/QOt` 两级错误降级呈现层。图标：`Rye` grip-horizontal(27180)、`fv` loader(27315)、
`bv` minus(27442)、`Wv` square(27823)、`g`=close（imeComposition chunk）。

---

## 2. 边界判定依据

1. **顶层声明定界**：`var yJt = (0, Q.memo)(function ({` 起至 `Z5 = 96, Q5 = 136`（185430）；
   `function XJt({` 起至 `var ZJt = 300`（187020）。与 MODULE-MAP F07 登记完全一致。
2. **闭包追踪**：从两锚点 JSX/表达式引用递归收集局部符号，全部落到三类终点：
   ① 本 chunk 顶层定义（1.2–1.5 全数还原）；② 文件头 336–827 行 import 块的跨 chunk 别名
   （§5 登记）；③ 其它族叶子（1.6 接口保留）。
3. **装配关系确认**：`XJt` 返回 Fragment = `[Rje QuickPick][RMe FeedbackCenter][yJt WorkspaceShell]`
   （186858–187017），且 `Y4t = memo(XJt)` 在 206773 被远控壳挂载（206845）——XJt 是
   "每工作区一个" 的根控制器，yJt 是其纯呈现层。
4. **排除项**：`Mqt/jqt`（F13）、`rVt`（F01）、`xqt`（F04）、`PTt/owt`（F03）、`l3`（F16）、
   `d6`（F15）、`JPt`（F17）、`Rje`（F05）、`RMe`（F09）按族边界保留接口；
   `185432–186218` 中的壳平台助手属 F07 备注登记的 `SJt` 段，全部纳入。

---

## 3. 布局树证据 —— 与规格 §13 逐条对拍

**实测布局树**（WorkspaceShell.tsx 返回段，桌面形态；类名/属性逐字自源码）：

```
WindowShell(l4)  title=`ZCode / {basename(workspaceAbsPath)}`  headerTestId='app-header'
└─ div[data-workspace-shell]  relative flex h-full min-h-0 w-full overflow-hidden
│    style: --workspace-sidebar-panel-width / --workspace-sidebar-width [/ --web-remote-navigation-height]
├─ div[data-panel][data-workspace-sidebar-panel][id=sidebar]
│    w-[var(--workspace-sidebar-panel-width)] max-w-[50%] flex-none
│    transition-[width,opacity] duration-200（隐藏态 opacity-0 + 宽 4px(Mac)/0）
│  └─ aside（远控壳时 id=web-remote-control-navigation-panel）
│     └─ p4(workspace-sidebar) > ITt(投放上下文) > rVt Sidebar          ← §13.8
├─ div[role=separator][aria-controls=sidebar][data-testid=resizable-handle]
│    w-px cursor-ew-resize my-6 h-[calc(100%-48px)]（键盘 ←→±16/Home 264/End 50%）
├─ div[data-panel][id=content]  flex min-w-[320px] flex-1 flex-col（Mac: p-1 pl-0 pt-0）
│  ├─ (Mac) div h-1 [app-region:drag]
│  └─ section  relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background
│     │        + Rqt Win 圆角让位                                       ← §13.6 "section.bg-background"
│     ├─ 头部三态：
│     │   ① Ar（有活动任务）: p4(workspace-header,compact,border-b) > TFt   ← §13.5
│     │   ② jr（桌面草稿）: header[data-testid=new-task-draft-drag-region]
│     │        h-10 [app-region:drag]，右簇 [U6][H6]（Mr 分支让位不渲染）   ← §13.9
│     │   ③ 无头部（automations 等）
│     ├─ 主视图：
│     │   repo-wiki → main > p4(repo-wiki-main) > l3
│     │   automations → main[id=automations-main-toast-anchor]（h-12 drag 条 + 滚动区
│     │        > p4(automations-main) > d6，max-w-5xl 居中）
│     │   chat(默认) → ★三分体★：
│     │     X4[layoutId=workspace-body-layout, panelIds=['conversation-column','browser']]
│     │     ├─ Z4#conversation-column  minSize=35%（远控 0px；侧面板开时 defaultSize=52%）
│     │     │  └─ X4[orientation=vertical, layoutId=workspace-conversation-column-layout,
│     │     │        panelIds=['conversation','terminal']]
│     │     │     ├─ Z4#conversation  minSize=35%（elementRef 供窄度检测）
│     │     │     │  └─ main > [nPt TaskFindDialog + p4(workspace-chat) > PTt 编排器]
│     │     │     └─ Mqt dock（Z4 id='terminal' minSize 140px maxSize 50%）  ← §13.7
│     │     └─ Dr = xqt SidePanel（右摘要栏，与整个会话列并排）
├─ p4(desktop-top-overlay) > BOt TopBarOverlay                          ← §13.1
├─ (Mr) p4(draft-caption-menu) > div.absolute.top-0.z-30.h-12 [H6][S6]   ← §13.2 Mr 分支
│        （Win: c4(U)+right:s4 让位；Linux: right-[120px]+rounded-bl-xl border-b）
├─ (Linux 桌面) div.absolute.right-0.top-0.z-30.h-12.w-[120px] > tkt(−□×)
└─ (远控切换任务) 全屏 loading 遮罩 common.loading
```

**逐条对拍**：

| 规格断言 | 代码证据（js 行） | 结论 |
|---|---|---|
| §13.6 主体三分：`section.bg-background` 内 = 头部 + `<X4 水平分割>[conversation-column \| Dr 右摘要栏]` | 185054–185066 section 类名含 `bg-background`；185244 `X4 layoutId='workspace-body-layout' panelIds=fJt=['conversation-column','browser']`；第二子节点即 `Dr`（184728 `Dr = Er()` = `xqt` SidePanel） | ✅ 逐字一致（jsx 149287-149335 同文） |
| §13.6 conversation-column 内 `<X4 vertical>[conversation 聊天 \| Mqt 底部 dock]` | 185249–185255 `Z4 id='conversation-column' minSize=35%` 内 185256 `X4 orientation='vertical' panelIds=pJt=['conversation','terminal']`；185262 `Z4 id='conversation'` 内 PTt；185316 `Mqt` | ✅ dock 确在会话列内部（聊天下方），非窗口底部 |
| §13.6 右摘要栏与整个会话列并排 | `Dr` 是外层 `X4` 的第二个子节点（185336），与 `Z4#conversation-column` 同级 | ✅ |
| §13.7 Mqt dock：`Z4 id='terminal' border-t minSize 140px maxSize 50%`，内含 jqt 标签页 | Mqt（js 183602，F13 已登记）作为 `panelIds=['conversation','terminal']` 的 terminal 面板挂载；dock 开合由 `Iqt({open: isTerminalOpen, expandedSize:'30%', rememberExpandedSize:true})` 驱动（184084–184088） | ✅（Mqt 本体属 F13，接口保留） |
| §13.1 顶栏是绝对定位浮层，不含面板图标/窗口控制 | `p4(desktop-top-overlay) > BOt` 是壳的顶层兄弟节点（185339–185375），不在 section 内；`showNewTaskButton = !isSidebarVisible \|\| isFileTreeOpen`（184104） | ✅（BOt 本体见 TopBar.tsx） |
| §13.2 会话头右 = SFt + S6；**首页草稿态右簇 = [H6][S6]（Mr 分支）** | `Mr = !Ar && (isWindowsDesktop \|\| isLinuxDesktop)`（184739）；Mr 分支渲染 `div.absolute.top-0.z-30.h-12` 内恰为 `[H6][S6]`（185377–185405），S6 带 `triggerPresentation: Win?'header-borderless':'header'` | ✅ |
| §13.2 草稿头（Mac 态）右 = [U6][H6] | jr 分支 header `h-10 [app-region:drag]`，右簇 `absolute right-2.5 top-2.5` 内恰为 `[U6][H6]`（185146–185152）；Mr 时该簇不渲染（让位 caption 菜单） | ✅ |
| §13.5 会话头 `h-12 border-b`、非 Mac 让位 | `p4(workspace-header, variant=compact, className='border-b') > TFt`，TFt 收 `isWindowsDesktop/isMacFullscreen/windowsWindowControlsRightPaddingPx` 等（185067–185124；本体在 TopBar.tsx） | ✅ |
| §13.8 侧栏 rVt 挂载位 | `div[id=sidebar][data-workspace-sidebar-panel] > aside > p4(workspace-sidebar) > ITt > rVt`（184937–185019）；rVt 收导航/远程/未读全套 props | ✅ |
| §13.9 首页草稿头 `h-10` drag 区 | `data-testid='new-task-draft-drag-region'`，类名 `relative flex h-10 shrink-0 [app-region:drag]`，Linux `mr-[165px]`（185122–185130；jsx 149295 同文） | ✅ |
| §2 拖拽区/让位 | Mac 内容列 `p-1 pl-0 pt-0` + 顶部 `h-1 drag`；Win 圆角 `Rqt` 四态；Linux `w-[120px]` 控件区；Win caption `c4(136)+s4` | ✅ |
| §2 Win `env(titlebar-area-*)` 反推 | `windowsWindowControlsRightPaddingPx` 默认 136（`Q5`），经 `SJt` 的 `onWindowControlsOverlayChanged` 动态修正（185496–185514） | ✅（细化：几何可变，非恒 136） |

**规格需补充的三处实测细节**：
1. §13.6 未提 **会话列过窄自动收起**：chat 视图下 resize 防抖 300ms 检测会话列宽度，
   `<480px` 收右侧面板、`<360px` 收侧栏（184111–184160，阈值 `sJt/uJt`）。
2. §13.6 的 `Dr` 在代码中即变量名 `Dr`（`Dr = Er()` = `xqt` SidePanel），规格用名与源码一致；
   但"右摘要栏"的会话内 mini/panel 形态（`Flt`）在 PTt 内部，不在本级。
3. 侧栏宽度是 **自管 separator**（`data-testid=resizable-handle`，CSS 变量写壳元素），
   与主体三分的 react-resizable-panels 引擎是两套机制；旧版百分比布局
   （`react-resizable-panels:workspace-shell-layout:sidebar:content`）首挂载时迁移（184173–184182）。

---

## 4. 工作区根控制器（XJt）状态机要点

1. **身份解析（186269–186293）**：活动工作区 tab（`pc` store，浅比较选择器）→
   `VJt` 合并出 `workspaceIdentity/remoteSessionId/remoteTarget`（tab 优先、props 兜底）→
   `Dc` 解析工作区服务得 `rpcReady`。tab 标记 `unavailable-local-directory` 时
   （`sc`）产出 **全壳只读原因** `workspaceSidebar.unavailableLocalDirectory`，
   之后所有写动作（建任务/终端/审查/树映射/代码查看）被守卫短路。
2. **状态供给**：`LJt`（workspaceShellZCodeState 浅投影 + `reloadSessionDisabled`
   = 存在与草稿供应商同供应商的活跃运行时 creating/restoring/streaming）、
   `Boe` useSidePaneState（40+ 句柄）、`SJt` useAppChromeState、`nge` useGitState、
   `e_e` useActiveTaskMeta、`BJt` 按任务恢复浏览器 url。
3. **主视图状态机**：`workspaceMainView ∈ {chat, automations, repo-wiki}`（186697–186706）。
   任务选择/导航回调（`onNavigateToTask`）与草稿动作一律先回 `chat`；
   automations 携带 `openAutomationId`（消费后清空）；**远控壳强制
   `automations → chat`**（184426–184428）。
4. **草稿焦点联动（186372–186385）**：同工作区内 `draftFocusVersion` 递增且非 0 →
   侧面板未收起则收起（日志 `[App] 新建任务时收起右侧面板`）。
5. **任务切换状态机（zJt，185907–186063）**：模型运行时重建中
   （`modelSwitchPending && stage==='restartingRuntime'`）→ 阻断 + toast
   `taskList.switchBlockedByModelRestart`；选择任务时 **未读清除乐观链**
   （本地置空 → 远程/本地服务落库 → 成功 `nae`+flush / 失败回滚+队列重试）；
   后退/前进按导航历史弹栈，`RJt` 裁决可见性，不可见条目剔除继续弹，
   自动化条目走 automations 导航，耗尽 toast `taskNav.noMore*`。
6. **草稿工作区切换（Jn，186642–186666）**：失联目录拒绝 → `C_e` 解析目标供应商 →
   活动任务为空时携带分组草稿位置（`groupedDraftTask.placement`）→
   purpose 型补 tab / 否则激活或补 tab → **非远控壳时重置会话路由组
   （`A2.deactivateActiveGroup`）与主分屏（`s2.resetToPrimaryPane`）** →
   `startDraft` → 跨工作区时清理源分组草稿。
7. **会话重建（MJt，185688–185784）**：1200ms 节流；`initializing →
   restartWorkspaceProcess →（无 resumeTaskId 时）configOptions loading →
   拉草稿配置 → 合并 → 模型裁决（jJt：内置供应商本地快路径 / 否则服务裁决，
   失败回退原样）→ ready + toast`；失败路径 `failed + configOptions error + draftError`。
8. **查找双状态机（186386–186402）**：会话内查找与文件变更查找各持
   `{query, activeIndex, navigationRequestId}`（`T_e/Wg/E_e`）；导航请求使
   `navigationRequestId+1`；对话框关闭即双清零。搜索结果高亮请求带自增
   `requestId`，完成回调按 id 精确清除；壳层再按"当前任务+同工作区"二次过滤（`Xn`）。
9. **快捷键层（rge 调用，186752–186762）**：`ta`=Ctrl、`Qi`=⌘、`Rre`=Ctrl+Shift ——
   Ctrl+K/⌘K/⌘P 命令面板、Ctrl+F 查找、⌘[/] 上一/下一会话、Ctrl+B 侧栏、
   Ctrl+J 终端、Ctrl+Shift+B 侧面板、Ctrl+[/] 任务后退/前进（可空）。
10. **全局事件**：`zcode:close-active-context-request` → 关闭激活侧面板标签（仅工作区
    可见且未收起，`KJt`）；平台菜单事件 → 反馈提交/工单面板；
    `canOpenCommunity(locale)` 异步决定命令面板社群项。
11. **生命周期（NJt）**：工作区路径变化清浏览器导航请求/测试消息；卸载时若无活动任务、
    无 creating/streaming 运行时且预热非 idle → 回退预热并 `releaseWorkspacePreparation`。
12. **最后会话恢复（HTt，壳层）**：`zcode-v4-last-session:v1:{workspaceKey}`，
    仅"渲染器重载 + 无活动会话 + 草稿焦点 0"时恢复一次，之后持续写回。

---

## 5. 外部依赖清单（跨 chunk）

| # | chunk | 提供的符号（原局部名） |
|---|---|---|
| 1 | `react` + `jsx-runtime` | React（Q）、jsx 运行时（$） |
| 2 | `utils-CEEH0K_K.js` | `cn()`（Z） |
| 3 | `button-laUijeDG.js` | `Button`（X）、`createLucideIcon`（Sa） |
| 4 | `IntlProvider-C321H7m8.js` | `useIntlContext`（G）→ {intl, locale, setLocale} |
| 5 | `imeComposition-DEYFkwWm.js` | `usePlatformService`（l）、toast（m）、close 图标（g←b） |
| 6 | `keyboardShortcuts-BGHopxr9.js` | `shortcutLabel`（$i）、`shortcutLabelVariant`（Vre）、`ta/Qi/Rre` 判定 |
| 7 | `logger-PFDwl5Yq.js` | logger（J） |
| 8 | `src-HCld2afU.js` | `DesktopCommand`（oi）、testid `Mi='app-header'`（wt←bg，8235 行）、模型工具 `jt/On/mi/Ei`、`re()` 测试模式 |
| 9 | `skillStore-BmeKHDBI.js` | `useTaskStore`（xe）、zustand create（Ae）、工作区状态选择器群（B/se/Fe/Re/fe/ze/le/oe/Ce/ae/re 等 11 字母） |
| — | 本 chunk 内 | stores：`A2` 会话路由（122619）/`s2` 分屏（121669）/`Vo` 搜索（1553）/`yC` 反馈（36992）/`ko` 设置（1296）/`pc/hc` 工作区 tabs（4753/4761）/`Ug` MCP（25007）；钩子：`Boe`（2816）/`fs`（2638）/`Ec`（4897）/`Dc`（4907）/`nge`（23920）/`Yse`（4949）/`e_e`（24724）/`wge`（24240）/`rge`（24015）/`O_e`（25395）/`eSt`（117283）/`z0`（121365）；路由：`MTt/ATt/jTt`（122742–122802）；工具：`Io/Go/Yo/Lo`（1368/1928/1958/1371）、`BA/VA`（50926/50929）、`yst`（94961）、`Ogt`（109814）、`$ae/_oe/woe`（2440/2650/2685）、`rXe`（67542）、`W6e`（77966）、`zMe/BMe`（39206/39220）、`JMe`（39407）、`w_e`（25374）、`S_e`（25351）、`moe/ss/cs`（2595–2609）、`$o`（2171）、`oc/sc`（4439/4445）、`co`（1033）、`xo`（1103）、`iw`（39327）、`lw/uw`（39409/39411）、`fM/pM`（52633/52636）、`NM`（52950）、`$6e`（78042）、`VUe`（52921）、`tae/nae/Wo/Ho/sx`（1905–1911/32242）、`tc`（4380）、`hse`（4178）、`c6`（138630） |

WorkspaceShell.tsx 头部注释按"符号 → chunk → 行号"完整登记了上述全部映射。

---

## 6. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| yJt 布局树（两返回分支）、全部类名/属性/panelIds/CSS 变量/testid、头部三态判定式（Ar/jr/Mr/Bt） | **高（逐字转录）** | 直接从压缩源码逐行还原，与 jsx 148387–149354 双向核对 |
| XJt 装配序（12 项状态机要点）、守卫链、快捷键映射、草稿切换/重建流程 | **高（逐字转录）** | 186219–187019 全文还原；日志文案（中文）逐条保留 |
| 私有助手群（1.4/1.5 全部纯函数与钩子） | **高** | 函数体短小、无外部状态，逐字还原 |
| TS props 类型 | **中高（推断）** | 由解构默认值与调用面归纳；跨 chunk 服务对象（PlatformService/WorkspaceServices/TaskStoreState 等）按调用面重建，可能与真实接口有细微出入 |
| 叶子组件（rVt/xqt/PTt/Mqt/l3/d6/JPt/Rje/RMe/owt/nPt 及 $Ot/QOt） | **中（接口级）** | 体量大且属其它族，保留 props 接口 + 行号，未逐行展开（与 TopBar 试点同策略） |
| 分割引擎（cAt/pAt/uAt 内部） | **中（接口级）** | vendored react-resizable-panels 变体，按 MODULE-MAP 建议以依赖替换，仅还原 X4/Z4 包装层 |
| 跨 chunk 符号归属 | **高** | 文件头 336–827 行 import 块逐个别名核对（含 `Mi` 反查到 src chunk 8235 行字面值） |

---

## 7. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`（web/node_modules/.bin/esbuild）：**0 错误**。
- `tsc --noEmit --strict --jsx react-jsx --target es2020 --moduleResolution bundler --skipLibCheck`
  （在 `/home/none/grok-build/web` 的 @types/react 环境下，临时副本，验证后已清理）：**0 错误**。
- `out/` 目录未做任何修改（只读访问；git 状态中 out/ 仍为未跟踪原样）。

## 8. 后续建议

1. 按 §6 接口级叶子做后续族抽取时，F13（Mqt/jqt dock 本体）与 F04（xqt 侧面板）
   可直接引用本模块的 `SplitPanel`/`useCollapsiblePanel` 接口。
2. 规格 §13.6 建议补记三处实测细节（§3 末尾：窄度自动收起阈值 480/360、
   侧栏自管 separator 与两套持久化键、远控壳 `automations→chat` 强制）。
3. `Win caption 让位` 在 §2 中写"默认 136px"，实测为 **默认 136 + 原生几何事件动态修正**
   （`SJt.onWindowControlsOverlayChanged`），建议规格注明。
