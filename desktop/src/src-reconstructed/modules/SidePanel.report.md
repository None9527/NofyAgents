# SidePanel 模块抽取报告（右侧边面板 组件族 · D8 Stage B / F04）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**，md5 `c9d0d675…`）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/SidePanel.tsx`（4,770 行）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（pretty-print 版）
- 地图：`MODULE-MAP.md` F04；标样：`TopBar.tsx` / `TopBar.report.md`

---

## 0. 行号口径

与 TopBar 试点相同：所有行号以输入 `.js` 为主口径，括注 jsx 双行号。本次对 40+ 个符号做了
双向定位（`function X(` / `var X = (0, Q.memo)` 在两文件各自命中后核对类名/i18n key），
全部一致。MODULE-MAP 给定的根锚点 `xqt ≈ js 182519 / jsx 147333` 逐字命中。

一处地图口径修正：F04 备注写状态层为 `Boe useSidePaneState js 2816–3550`，但标签工厂与
转换函数实际从 **js 1978**（`uae`/`dae`/`fae`）就开始了（标签工厂 2015–2158、转换
2159–2575、缓存 2577–2637、`Boe` 2816–3549）。SidePanel.tsx 已按完整范围 1978–3549 抽取。

---

## 1. 抽取的组件清单（混淆名 → 语义名 → 行号范围）

### 1.1 根组件与标签栏（完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `xqt` | `SidePanel` | 182519–183258 | 147333 | 根：Panel 外壳 + 错误边界 + Tabs 标签栏 + 14 型内容分派 + 空态四宫格；40+ props 全量保留 |
| `TKt` | `SidePaneTabChip` | 181303–181428 | 146452 | 标签 chip：dnd-kit 拖拽重排、TabsTrigger 语义、右缘渐变+常驻关闭钮、右键三项关闭菜单；类名逐字 |
| `EKt` | `SidePaneTabChipDragOverlay` | 181429–181449 | 146517 | 拖拽悬浮 chip（`bg-selected shadow-md cursor-grabbing`） |
| `wKt` | `TabChipHoverTooltip` | 181283–181302 | 146442 | chip 悬停 tooltip（delayDuration=1500，拖拽中强制关） |
| `bKt` | `BrowserFaviconImage` | 181256–181268 | 146415 | favicon img，onError 回退 globe |
| `xKt` | `BrowserTabFavicon` | 181269–181271 | 146423 | favicon 或 globe |
| `SKt` | `BrowserUseTabIndicator` | 181272–181282 | 146432 | browser-use 操作中呼吸指示（`browser-use-operation-breathe` + mouse-pointer-2） |
| `R5` | `SidePaneTabIcon` | 181455–181482 | 146527 | 14 型图标分派（含 patch 路径→文件图标） |
| `DKt` | `tabShowsDiffBadge` | 181450–181454 | 146524 | code-viewer patch/multi-file-diff 徽章判定 |
| `V5` | `resolveSidePaneTabTitle` | 181533–181561 | 146611 | 14 型标题解析（辅助对话带序号） |
| `NKt` | `sidePaneTabSearchHint` | 181562–181590 | 146642 | 总览搜索关键词串 |
| `PKt`/`FKt` | `resolveTabTitleFromLabels`/`resolveTabTypeLabel` | 181591–181638 | 146645/146662 | 预取 labels 版标题/类型名 |
| `IKt` | `SidePaneTabOverview` | 181639–181854 | 146665 | ⌄(chevrons-down) 标签总览：Popover+cmdk，打开/最近关闭两组、评分搜索、60s 刷新相对时间 |
| `hKt/gKt/_Kt/L5/vKt/yKt` | 搜索字段/规范化/评分/排序助手 | 181216–181253 | 146388–146405 | 标题前缀 120 > 词边界 90 > 包含 70 > 提示 40 > 类型 20 > 1 |
| `z5/OKt/B5/kKt/AKt/jKt/MKt` | patch 头路径解析群 | 181483–181530 | 146561–146608 | `diff --git` / `+++` / `---` 解析、a/ b/ 前缀剥离、/dev/null 过滤 |

### 1.2 空态四宫格与面板几何（完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `mqt` | `resolveEmptyStateTabOptions` | 182389–182404 | 147217 | 空态可打开项（见 §2.2） |
| `hqt` | `canOpenSelectionSideConversation` | 182405–182407 | 147226 | 有激活任务 ∧ ¬mobileOverlay ∧ ¬手机键盘视口 |
| `gqt` | `resolveSidePanePanelSizing` | 182408–182424 | 147233 | 桌面 min 240px / max 65%；mobile overlay 100% |
| `_qt` | `shouldRenderHeavyContent` | 182425–182434 | 147250 | code-viewer 重内容门（可见∧激活∧宽度≥96） |
| `vqt`/`yqt` | `measureVisibleInlineSize`/`usePanelVisibleInlineSize` | 182435–182488 | 147260/147269 | 可见内宽测量（resize/scroll/RO 合流） |
| `bqt` | `useResizeSettling` | 182489–182518 | 147310 | resize 安定窗 220ms |
| `tqt` | `isTabBarOverflowing` | 182305–182310 | 147135 | 估宽 60px×n + 间隙 8px×(n−1) 判溢出 |
| `ZKt/QKt/$Kt/eqt/lqt/uqt/dqt/fqt` | 常量 | 182302,182362 | 147131,147183 | 0.45 缺省宽比 / 60 / 8 / 1 / 200ms / 220ms / [] / {left:false,right:false} |
| `nqt/iqt/aqt/oqt/sqt/cqt` | 开发者工具旗标群 | 182311–182360 | 147145–147180 | localStorage `zcode:developer-tools:enabled`、`zcode:token-debug:enabled`；storage+focus+1s 轮询 |
| `pqt` | `SuspendedBrowserTabPlaceholder` | 182366–182388 | 147193 | 挂起 browser tab 占位 + suspend-ready ack |

### 1.3 标签内容（本族内实现部分，完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `LKt` | `SubagentSessionTabContent` | 181855–181890 | 146763 | 子智能体会话 = 只读 `R0`（readOnly + allowWorkspaceFileRewind） |
| `KKt`/`qKt` | `SubagentDirectoryTabContent`/`Body` | 182104–182198 | 146995/147012 | 子智能体目录：运行中/已结束两段 + 加载更多 |
| `GKt` | `SubagentDirectoryItemRow` | 182056–182103 | 146983 | 目录行（状态图标/标题/状态文案/摘要/相对时间） |
| `WKt` | `SubagentStatusIcon` | 182038–182055 | 146954 | 6 态：spinner/circle-pause/circle-check/circle-alert/ban/circle-dashed |
| `VKt` | `useSubagentDirectory` | 181904–182024 | 146801 | 分页读取（页 20、上限 100、total 补偿连翻） |
| `U5/zKt/BKt/HKt/UKt` | 目录助手 | 181892–182036 | 146783–146938 | 空态/去重合并/请求量/[]/打开请求构造 |
| `JKt` | `SelectionSideChatTabContent` | 182199–182236 | 147056 | **辅助对话** = `R0 selectionSideChat` 形态（不可用时自动关标签） |
| `YKt`/`XKt` | `PlanDetailBody`/`PlanDetailTabContent` | 182237–182301 | 147076/147115 | 计划详情：跟踪 ExitPlanMode 工具调用 markdown + `cj` 渲染 |

### 1.4 侧面板状态机（js 1978–3549 / jsx 1037–2615，完整还原）

| 混淆名 | 语义名 | js 行 | 说明 |
|---|---|---|---|
| `Boe` | `useSidePaneState` | 2816–3549 | 总钩子：30+ handle*、工作区缓存换入换出、任务作用域同步、平台浏览器事件接线、父任务结束清理辅助对话 |
| `as/os/ss/cs/foe/poe/moe` | 快照缺省 / LRU(50) 缓存 / 读 / 写 / touch / evict / cacheKey | 2577–2611 | 按 `workspaceIdentity?.trim() \|\| workspacePath` 键控 |
| `fae` | `normalizeSidePaneState` | 1982–2014 | ordinal 补全 + activeTabId 修复（treemapping 豁免） |
| `uae`/`dae` | `shouldKeepPanelMounted`/`isBrowserTabResident` | 1978/1981 | 不可见但有 browser tab 仍挂载（后台驻留） |
| `pae…Eae`（12 工厂） | 各型标签工厂 | 2015–2158 | id 规则逐字：`browser:${uid}`、固定 `git`/`repo-wiki`/`developer-tools`、`terminal:${uid}`、四段冒号编码（subagent/selection-chat/plan）、`whiteboard:${boardId}`、`model-trajectory:${taskId}`、sourceKey 内容寻址 |
| `wae/Tae/cae` | sourceKey/hash36/解码规范化 | 2129–2158 | 31 进制哈希 |
| `Qo…doe`（30+ 转换） | upsert/作用域过滤/开关/重排/驻留 | 2159–2575 | `Oae` 工作区共享四型（git/repo-wiki/developer-tools/treemapping）、`ts` 任务归属规则、`Nae` 作用域同步 |
| `zoe` | `nextTerminalTabTitle` | 2803–2815 | Terminal / Terminal 2…（取目录名） |
| `ls`/`goe` | `useTrajectoryViewerStore`/`useTrajectoryOpenRequests` | 2610–2637 | model-trajectory-open 单次投递 |

### 1.5 入口（命令表/快捷键，完整转录于产物 §11）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `D_e` | `QUICK_PICK_SECTION_ORDER` | 25394 | 22073 | `[suggested, chat, navigation, panels, configure, app]` |
| `O_e` | `buildQuickPickCommands`（panels 段） | 25395–25520 | 22074 | panels 段 6 命令（§2.3） |
| `rge` | `useGlobalShortcuts` | 24021–24078 | 20683 | 全局 keydown（capture），含 **Ctrl+Alt+B = toggleSidePane** |
| `SFt`（TopBar.tsx 已抽取） | 会话头侧面板开关按钮 | 143462–143479 | 119457 内 | `sidePane.togglePanel` tooltip + 快捷键文案 + `!bg-selected` 激活态 |

### 1.6 接口保留的大体积叶子（未逐行展开，行号已登记）

| 混淆名 | 语义名 | js 行 | 归属 |
|---|---|---|---|
| `BWt` | GitChangesPanel（= **审查** 标签内容） | 178584–178920 | F04 叶子（变更列表+diff+查找+源切换） |
| `FGt` | WhiteboardCanvas | 179888–180149 | F04 叶子 |
| `AGt` | TreemappingView | 179493–179694 | F04 叶子 |
| `tKt` | ModelTrajectoryView | 180606–180749 | F04 叶子 |
| `mKt` | DeveloperToolsView | 180870–181215 | F04 叶子 |
| `l3` | RepoWikiView | 132306 | F16 |
| `bUt` | TerminalPanel（终端标签内容） | 175976 | F13 |
| `_Wt`/`vWt` | BrowserView / BrowserUseView（浏览器标签内容） | 177724 / 178191 | F13 |
| `tHt` | CodeViewerPanel | 161141 | F14 |
| `R0` | ConversationPane（辅助对话/子智能体会话底座） | 119219 | F03 |
| `$It` | 工作区文件树虚拟列表 | 146089–147766 | 地图登记于 F04，属 workspaceFileTree 视图，非标签内容，未随本次展开 |
| `Sqt…Aqt` | 终端 dock 会话状态机（183259–183363） | — | 行号落在 F04 区间内，语义归 F13 `jqt`（双归属，未展开） |

### 1.7 图标（17 个，含 1 个自定义 SVG）

plus(`kv` 27606 ⊞)、chevrons-down(`dye` 26804 总览)、message-square-text(`_v` 27399 辅助对话)、
file-diff(`X_` 27036 审查)、square-terminal(`Uv` 27818)、globe(`nv` 27170 浏览器)、bug(`k_` 26737 开发者工具)、
notepad-text(`Sv` 27501 计划)、bot(`D_` 26708)、list-tree(`uv` 27300)、map(`qye` 27335)、palette(`wv` 27522)、
waypoints(`Ibe` 27982)、file-code-corner(`Y_` 27024)、circle-pause/check/alert、ban、circle-dashed（状态 5 图标）；
`s3`（132175）= repo wiki 自定义 32×32 SVG。另跨 chunk：x(`g`=imeComposition b)、loader-circle(`M`=w)、mouse-pointer-2(`o`=C)。

---

## 2. tab 类型与入口证据（任务重点）

### 2.1 tab 类型（14 型，内容分派现场 js 183044–183208 逐字核对）

| tab.type | 内容组件 | 图标 | 标题 i18n（zh 值，IntlProvider 词典核对） |
|---|---|---|---|
| `selection-side-chat` | `JKt`→R0 selectionSideChat | message-square-text | `sidePane.selectionChat`=**辅助对话**（标题带序号「辅助对话 2」） |
| `git` | `BWt` GitChangesPanel | file-diff | `sidePane.review`=**审查**（⚠ 审查标签即 git 标签，固定 id `git`） |
| `terminal` | `bUt` TerminalPanel | square-terminal | `terminal.title`=终端 |
| `browser` | `_Wt` BrowserView | globe/favicon | `browser.title`=浏览器 |
| `browser-use` | `vWt` BrowserUseView | favicon/操作指针 | `browser.title` |
| `code-viewer` | `tHt` CodeViewerPanel | 文件图标/file-code-corner | `codeViewer.title` |
| `plan-detail` | `XKt` | notepad-text | `planTool.panel.planTab` |
| `subagent-session` | `LKt`→R0 readOnly | bot | 任务名 ∥ `sidePane.subagent`=子智能体 |
| `subagent-directory` | `KKt` | list-tree | `sidePane.subagentDirectory`=子智能体目录 |
| `treemapping` | `AGt` | map | `treemapping.title` |
| `whiteboard` | `FGt` | palette | `whiteboard.title` |
| `model-trajectory` | `tKt` | waypoints | `modelTrajectory.title` |
| `repo-wiki` | `l3` | s3 自定义 SVG | `repoWiki.title` |
| `developer-tools` | `mKt` | bug | `developerTools.title`=开发者工具 |

任务所述「辅助对话/审查/终端/浏览器 tab + 空态四宫格」与代码完全对应：前三型 + 浏览器
正是空态四宫格的默认四项（§2.2）；「审查」在代码中实现为 `git` 型标签。

### 2.2 空态四宫格（原 `Je`，js 182840–182891）

- 容器类名逐字：`side-pane-open-tab-shell` / `side-pane-open-tab-content` / `side-pane-open-tab-list` /
  `side-pane-open-tab-button`；标题 `sidePane.openTab`=「打开标签页」+ 描述 `sidePane.openTabDescription`=
  「选择要在侧边面板中打开的标签。」
- 项集 = `mqt({...}).map(→Ke)`（js 182804–182839 定义五项元数据表 `Ke`），规则（js 182389）：
  1. `selection-side-conversation` — 当 `hqt` 为真（**有激活任务** ∧ 非 mobileOverlay ∧ 非手机键盘视口）；
  2. `review` — 当尚无 git 标签（`!Le`）；
  3. `terminal` — 恒有；
  4. `browser` — 当 `supportsEmbeddedBrowser`（缺省 = isDesktop）；
  5. `developer-tools` — 当 localStorage 旗标开启。
- **典型桌面 + 激活任务 = 4 项（辅助对话/审查/终端/浏览器）→ 即「空态四宫格」**；无激活任务时退化为 3 项。
- 每项按钮 `data-side-pane-open-tab-item={id}`，点击调对应 `onOpen*`（与 ⊞ 菜单同源）。

### 2.3 三类入口及证据链

**A. ⊞ 新增标签按钮**（xqt 内 `Ge`，js 182722–182803）
- Button：`variant=outline size=icon-md`，`data-side-pane-add-trigger` + `data-side-pane-add-tab-trigger`，
  `aria-label=sidePane.addTab`=「新增标签」，图标 `kv`=plus。
- 菜单五项与空态同源（辅助对话/审查/终端/浏览器/开发者工具），data 属性
  `data-side-pane-add-item={selection-side-conversation|terminal|browser}`。
- 位置自适应：标签栏溢出（`tqt` 判定）时 ⊞ 收进滚动区尾部，否则固定在标签栏右端
  （js 183017/183035 两处挂载 `Ee ? null : Ge` / `Ee ? Ge : null`）。

**B. 快捷键**（`rge`，js 24021–24078；接线 `XJt` js 186753–186761）
- `Rre(e,'b')` → `toggleSidePane()`。keyboardShortcuts chunk 反查：`Rre`=`c` 导出=
  `p(e,n) && !shift && alt && g(e,t)`，即 **Ctrl+Alt+B（Mac ⌘⌥B）切换右侧面板收起/展开**。
- 文案：`XJt` js 186263 `ee = Vre('B')`（`Vre`=`t` 导出=Ctrl+Alt 标签生成器）→
  `toggleSidePaneShortcutLabel` 下发（186928），显示在会话头开关按钮的 tooltip（SFt js 143462 `shortcut={c}`）。
- 落点：`_n = () => qe()`（js 186532）→ `qe`=`handleToggleSidePaneCollapse`（Boe 返回值）。
- 同钩子其余键位（证据）：Ctrl/⌘K 与 Ctrl/⌘⇧P 命令面板、Ctrl/⌘F 查找、Ctrl/⌘⇧[/] 会话切换、
  Ctrl/⌘B 侧栏、Ctrl/⌘J 底部终端、Ctrl/⌘[/] 导航。

**C. quickpick panels 段**（`O_e`，js 25394–25520；接线 `XJt` js 186780–186806）
- 段序 `D_e=[suggested, chat, navigation, panels, configure, app]`（25394）；段标题
  `quickPick.section.panels`=「面板」（IntlProvider 词典）。
- panels 段 6 命令（25433–25502，含 keywords 逐字）：
  | id | i18n（zh） | run 落点（XJt 包装 → Boe） |
  |---|---|---|
  | toggle-sidebar | 切换侧边栏 | `Ke`=handleToggleSidebar |
  | toggle-terminal | 切换终端 | `bn`→`Ge`=handleToggleTerminal |
  | toggle-preview | 切换预览 | `Me`=handleToggleBrowser（仅支持内嵌浏览器时注册） |
  | add-terminal-tab | 添加终端标签 | `xn`→`ze`=handleOpenTerminalTab |
  | add-browser-tab | 添加浏览器标签 | `Ne`=handleOpenBrowserTab（仅支持内嵌时） |
  | add-review-tab | 添加审查标签 | `Sn=()=>Fe()`（js 186553）=`Fe`=**handleOpenGit**（审查=git 标签的直接证据） |
- 命令面板渲染：`Rje`（F05，js 36439）内 `quickPick.section.${sectionId}` 分组（36720–36722），
  执行经 `nPt`（js 139949）。
- 只读门：`XJt` 对 `xn/Sn/Cn/wn/Tn` 均有 `de ||` 包装（`de`=workspaceReadOnlyReason，186546–186572）。

**D. 辅助对话专属入口**（`Tr`，yJt js 184666–184676）：⊞/空态里的「辅助对话」最终调
`woe(_oe(workspaceKey, activeTaskId))` —— 聚焦主会话控制器触发框选副屏；无可用控制器时
warn「辅助对话入口没有可用的主会话控制器」。

---

## 3. 边界判定依据

1. **函数体边界**：压缩版每语句一行；`xqt` 从 `function xqt({`（182519）到下一个顶层声明
   `Sqt`（183259）前。标签栏/助手群同理以相邻顶层声明定界（§1 行号）。
2. **闭包追踪**：从 `xqt` JSX 引用出发递归收集局部符号，终点三类：本 chunk 他处顶层定义
   （继续追，如 `TKt→DZ/yk/xk/Sk/bk/wKt/R5/DKt`）、文件头跨 chunk 别名（§4）、叶子组件（接口保留）。
3. **状态层归属**：`Boe` 内全部转换函数（`Vae/Hae/…`）与标签工厂经调用关系唯一归属侧面板域；
   `ls`（轨迹 store）被 `goe` 消费、`goe` 被 `Boe` 调用，故一并收入。
4. **排除项**：`Sqt…Aqt`（183259–183363）为终端 dock 会话状态机（`jqt` F13 使用），仅登记；
   `$It`（146089–147766）为工作区文件树视图（`workspaceFileTree.*`），非标签内容，仅登记；
   `vWt/_Wt` 本体在 F13 行区（178191/177724），按借用处理。
5. **调用方确认**：`xqt` 唯一实例化点在 `yJt`（WorkspaceShell）js 184678 `Er=(t={})=>jsx(xqt,…)`，
   桌面 `Dr=Er()` + 移动端 overlay 双形态；`yJt` 的 40+ props 由 `XJt`（js 186900+）下发，
   与 `Boe` 返回值一一对应（186306–186344 解构现场核对）。

## 4. 外部依赖清单（跨 chunk）

| # | chunk | 符号 |
|---|---|---|
| 1 | react / jsx-runtime | React（Q）、jsx（$） |
| 2 | utils-CEEH0K_K.js | `cn()`（Z） |
| 3 | button-laUijeDG.js | Button（X）、createLucideIcon（Sa） |
| 4 | IntlProvider-C321H7m8.js | useIntlContext（G）→{intl,locale}；词典侧 `sidePane.*` 26 key 已核对 |
| 5 | imeComposition-DEYFkwWm.js | usePlatformService（l=M）、x 图标（g=b）、mouse-pointer-2（o=C）、spinner（M=w）、Popover（T/h/x=n/a/i） |
| 6 | usageStatsUiParts-CiR7YEhh.js | TooltipProvider（Na=Ce js 512）、Tooltip（Ia=X js 545） |
| 7 | keyboardShortcuts-BGHopxr9.js | $i=n 标签、Vre=t Ctrl+Alt 标签、ta=u / Qi=d / Rre=c 匹配器（已反查 chunk 本体） |
| 8 | logger-PFDwl5Yq.js | logger（J） |
| 9 | skillStore-BmeKHDBI.js | zustand create（Ae） |
| — | 本 chunk vendored | dnd-kit（91811–94695：aZ/UX/WX/KX/EZ/DZ/bZ/Uot/BX）、cmdk（26004–26574）+封装（32092–32200）、ContextMenu 封装（48825–48880）、Tabs 封装（36949–36991）、react-resizable-panels 封装（131934–131960）、ScopedErrorBoundary（129952）、文件图标（5150/5195）、图标块（26575–28020） |

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| `xqt` 根 JSX（标签栏/空态/14 型分派/Panel 外壳）、`TKt`/`EKt`/`IKt` 全部类名与 i18n key | **高（逐字转录）** | 直接自压缩源码还原，类名/data 属性/i18n id 零改动 |
| 状态机（`Boe` + 40+ 纯函数 + 缓存 + 工厂） | **高** | 纯逻辑逐行对照；日志文案（`[App] …`）逐字保留可核对 |
| tab 类型/入口/快捷键语义 | **高** | 三重证据：分派现场 + i18n 词典 + keyboardShortcuts chunk 本体反查 |
| 标签内容 `LKt/KKt/qKt/GKt/JKt/YKt/XKt/pqt` | **高** | 完整还原；依赖的 `R0`/`cj`/作用域 context 按接口声明 |
| TS props 类型 | **中高（推断）** | 由解构与用法归纳；跨 chunk 服务接口（如 `PlatformService` 浏览器面）按调用面归纳，可能与真实接口有细微出入 |
| 叶子 `BWt/FGt/AGt/tKt/mKt/l3/bUt/_Wt/vWt/tHt` | **中（接口级）** | 体量大且相对独立，保留 props 接口 + 行号，未逐行展开（方法同 TopBar 报告 §5） |
| `useIsMobileTextInputViewport`/`useScreenshotSurfaceRequest`（`VV`/`SWt`） | **中（接口级）** | `SWt` 逻辑已核读（178264），以声明接口挂接，未内联 |

## 6. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`：解析通过（0 错误，输出 133.9kb）。
- `tsc --noEmit --strict --lib es2023,dom,dom.iterable`（在 `/home/none/grok-build/web` 的
  @types/react 环境下，临时副本验证后已清理）：**0 错误**。
- `out/` 目录未做任何修改（只读访问；该目录整体未被 git 跟踪，无改动痕迹）。

## 7. 对地图/规格的勘误与建议

1. **MODULE-MAP §2.4**：「小件原语 36949–36991 `hC` Separator、`gC` Badge」有误 ——
   `hC/gC/_C/vC` 实为 **Tabs/TabsList/TabsTrigger/TabsContent**（Radix Tabs 封装，
   `data-slot=tabs*`，底层 `JDe/YDe/XDe/ZDe`）。侧面板标签栏正建立在它之上。
2. **审查 = git 标签**：无独立 `review` 型；`git` 型标题即 `sidePane.review`（「审查」），
   固定 id `git`、工作区共享单实例。quickpick `add-review-tab` → `handleOpenGit` 为直接证据。
3. **空态四宫格**是条件四项（有激活任务的桌面态），非固定四项；开发者工具开启时为五项。
4. F04 状态层行号应扩为 **1978–3549**（地图写 2816–3550，漏了标签工厂/转换段）。
5. `Sqt…Aqt`（183259–183363）语义属 F13（终端 dock），建议下版地图改记双归属。
6. 侧面板切换快捷键 **Ctrl+Alt+B** 建议回写规格（现规格文档未记载侧面板快捷键）。
