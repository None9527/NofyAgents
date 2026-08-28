# QuickPick / 命令中心 模块抽取报告（F05 · D8 Stage B）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/QuickPick.tsx`（3,108 行）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 规格：`/home/none/grok-build/web/docs/zcode-uiux-spec.md` §8/§11
- 地图：`MODULE-MAP.md` F05（行号口径与地图一致：`.js` 闭区间 + `.jsx` 双行号）

---

## 0. 行号口径

延续 TopBar 试点结论：规格/地图锚点行号以 **jsx** 为口径，抽取以 **js** 阅读、jsx 复核。
本族全部符号的双行号已逐一核对（`Rje` jsx 33404 / `nPt` jsx 116646 / `QNt` jsx 116623 /
`O_e` jsx 22074 / `D_e` jsx 22073 / `Vo` jsx 569 / `ZS` jsx 32810 / `rge` jsx 20683，均精确命中）。

---

## 1. 抽取的组件清单（混淆名 → 语义名 → 行号范围）

### 1.1 核心组件（完整还原进 QuickPick.tsx）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `Rje` | `QuickPick` | 36439–36948 | 33404 | 命令中心根组件（memo）：输入行 + 4 范围 tab + 命令/任务/文件三段 + 历史页脚 |
| `nPt` | `QuickFindBar` | 139949–140188 | 116646 | 任务内查找条：消息/文件变更双范围、↑↓/Enter 导航、chat/window 双形态 |
| `O_e` | `buildQuickPickCommands` | 25394–25585 | 22074 | 命令注册表（18 条，见 §2） |
| `D_e` | `QUICK_PICK_SECTION_ORDER` | 25393 | 22073 | 段序 `suggested,chat,navigation,panels,configure,app` |
| `mje` | `QUICK_PICK_COMMAND_ICONS` | 36151–36169 | 33181 | 命令图标名 → lucide 组件（17 个） |
| `Lje` | `SearchHistoryFooter` | 36371–36438 | 33387 | 搜索历史胶囊页脚（>6 条可展开/折叠、可清空） |
| `pC` | `ScopeTab` | 36335–36348 | 33361 | 范围切换胶囊（全部/操作/任务/文件） |
| `eC` | `HighlightedText` | 36125–36150 | 33169 | 查询词 `<mark>` 高亮 |
| `Ije` | `MetaText` | 36361–36370 | 33381 | 行尾小字（相对时间） |
| `rge` | `useGlobalQuickPickShortcuts` | 24015–24078 | 20683 | 全局快捷键（capture 阶段，见 §3） |
| `Yb/tOe/Zb/Qb/$b/ex/tx` | `Command/CommandDialog/CommandList/CommandEmpty/CommandGroup/CommandItem/CommandShortcut` | 32092–32200 | 29478–29543 | cmdk 封装（`data-slot=command-*`，类名逐字保留） |

### 1.2 数据层（完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `Vo` | `useSearchResultsStore` | 1553–1878 | 569 | 搜索结果缓存 store（zustand，12 个 action；横切层 §2.1 #2，归属 F05） |
| `Zie` | `selectQueryResult` | 1879 | — | 按 queryKey 选择缓存 |
| `ZS` | `useGlobalTaskList` | 35727–36070 | 32810 | 跨工作区分片任务列表/搜索（缓存优先 + 增量合并 + 事件订阅） |
| `uje` | `mergeTaskListShards` | 35708–35726 | — | shard 结果去重/排序/截断 |
| `$S` | `formatRelativeTime` | 36080–36089 | — | 刚刚/分/时/天 |

### 1.3 纯函数助手（完整还原）

| 混淆名 | 语义名 | js 行 | 功能 |
|---|---|---|---|
| `Nje` | `parseScopedQuery` | 36286–36298 | 前缀语法 `>`命令 `#`任务 `@`文件 |
| `mC` | `scopePrefix` | 36349–36360 | 段 → 前缀字符（反向） |
| `Pje` | `commandMatchesQuery` | 36299–36308 | 命令过滤（标题+关键词，分词全命中） |
| `kje/Aje` | `fileSearchHaystack/filterWorkspaceFiles` | 36244–36260 | 文件过滤（仅 file、分词全命中、≤80） |
| `Oje` | `fileDirectoryLabel` | 36240–36243 | 相对路径的目录部分 |
| `jje/dC/Fje` | `normalizeSearchSnippet/dedupeSearchSnippets/buildTaskSearchRows` | 36261–36334 | 任务×片段行展开 |
| `oC/sC/xje/Sje/bje/aC/iC` | `load/save/record/clearSearchHistory…` | 36176–36231 | 历史持久化（键 `zcode-command-center-search-history:<workspaceKey>`，上限 20） |
| `dje/fje/pje` | `tokenizeQuery/mergeHighlightRanges/findHighlightRanges` | 36090–36124 | 高亮区间 |
| `fC/Mje` | `resolveTaskTitle/compareRecentChanges` | 36277/36281 | 标题回退/变更排序 |
| `QNt/$Nt/ePt/tPt` | `mapFindNavigationKey/normalizeFindMatchState/stepFindIndex/nextFindNavigation` | 139925–139948 | 查找条导航（Enter 受 Shift 反向） |
| `qg/z_e/B_e`+8 常量 | `fuzzyScoreRecursive/fuzzyNormalize/fuzzyScore` | 25586–25631 | vendored `fuzzy` 评分（cmdk 默认过滤器 `kve` 用；面板本体 `shouldFilter=false`） |

常量：`cC=3` 折叠段上限、`lC=3` 最近段条数、`Tje=80` 文件搜索上限、`uC=80` 任务列表上限、
`rC=20` 历史上限；类名常量 `hje/gje/_je/tC/vje/nC/Eje/Dje`（36170–36243）逐字保留。

### 1.4 接口级深部依赖（未逐行展开，行号已登记于 tsx 头注/声明处）

`oje`(35647)/`sje`(35652)/`zie`(1385)/`Bie`(1396)/`cje`(35682)/`aje`(35615)/`dx`(32279)/
`JS`(35504)/`Ex`(32488)/`Ox`(32600)/`px/rx/ux/sOe/oOe`(32217–32316)/`lje`(35697)/
`Xie`(1532)/`Jie`(1479)/`Yie`(1510)/`Uie`(1414)/`Bo`(1453)/`Kie`(1449)/
`Io/Lo`(1368/1371)/`Mo/Po`(1311/1324)/`Fo`(1365)/`Go`(1928)/`yg`(23717)/`zc`(5150)/
cmdk 库本体(26004–26574)/Dialog 封装 `zb/Hb/Ub/Gb/Kb`(31943–32040)。
注：`Xb` CommandInput 封装（32123）存在但 `Rje` 未使用（自建输入行），未抽取。

---

## 2. 命令清单（id → section → icon → shortcut → run）

`icon` 列为注册表 `icon` 字段（经 `mje` 映射到 lucide）；`shortcut` 为 `XJt` 传入的
`shortcutLabel` 文案；`run` 给出 **注册表行号**（`O_e` 内 `run: s.xxx`）与
**装配行号**（`XJt` handlers 接线，js 186789–186805）。

| id | section | icon（lucide） | shortcut | run（注册/装配行） | 条件 |
|---|---|---|---|---|---|
| `new-task` | suggested | `message`（message-circle-plus） | `Ctrl+N`（`$i('N')` 186259） | 25413 / 186789 `createTask` | — |
| `open-workspace` | suggested | `folder`（folder-open） | `Ctrl+O`（`$i('O')` 186264） | 25424 / 186790 `openWorkspace` | `disabled: !allowOpenWorkspace` |
| `suggested-settings` | suggested | `settings` | — | 25432 / 186791 `openSettings` | — |
| `toggle-sidebar` | panels | `sidebarClose`/`sidebarOpen`（panel-left-*，按当前可见态） | `Ctrl+B`（`$i('B')` 186258） | 25441 / 186800 `toggleSidebar` | — |
| `toggle-terminal` | panels | `terminal`（square-terminal） | `Ctrl+J`（`$i('J')` 186262） | 25450 / 186801 `toggleTerminal` | — |
| `toggle-preview` | panels | `browser`（globe） | — | 25470 / 186802 `togglePreview` | 仅 `supportsEmbeddedBrowser` |
| `add-terminal-tab` | panels | `terminal` | — | 25480 / 186803 `openTerminalTab` | — |
| `add-browser-tab` | panels | `browser` | — | 25490 / 186804 `openBrowserTab` | 仅 `supportsEmbeddedBrowser` |
| `add-review-tab` | panels | `diff`（file-diff） | — | 25500 / 186805 `openReviewTab` | — |
| `settings` | configure | `settings` | — | 25508 / 186791 `openSettings` | — |
| `switch-theme` | configure | `themeDark`/`themeLight`（moon/sun，按 themeTarget 反向） | — | 25519 / 186794 `switchTheme` | 标题随当前主题切换 |
| `skills-settings` | configure | `skills`（wand-sparkles） | — | 25528 / 186792 `openSkillsSettings`（设置→skills 分区） | — |
| `mcp-settings` | configure | `mcp`（server） | — | 25536 / 186793 `openMcpSettings`（设置→mcp 分区） | — |
| `feedback` | app | `feedback`（message-square） | — | 25546 / 186795 `openFeedback` | — |
| `community` | app | `community`（users） | — | 25555 / 186796 `openCommunity` | 仅 `canOpenCommunity` |
| `product-docs` | app | `book`（book-open） | — | 25563 / 186797 `openProductDocs` | — |
| `logout` | app | `logout`（log-out） | — | 25572 / 186799 `logout` | 仅已登录 |
| `login` | app | `login`（log-in） | — | 25582 / 186798 `login` | 仅未登录（与 logout 互斥） |

段渲染顺序（`D_e`）：`suggested → chat → navigation → panels → configure → app`。
**`chat`/`navigation` 两段在 3.7.6 无任何命令注册**（段序保留、词典保留旧 key，见 §4）。

---

## 3. 全局快捷键（`rge`，js 24015–24078；`XJt` 186753–186762 接线）

| 按键 | 动作 | 代码证据 |
|---|---|---|
| `Ctrl/⌘+K` | 打开命令中心 | `ta(e,'k')` → `openQuickPick`（24033） |
| `Ctrl/⌘+⇧+P` | 打开命令中心 | `Qi(e,'p')`（24033） |
| `Ctrl/⌘+F` | 任务内查找（QuickFindBar） | `ta(e,'f')`（24036） |
| `Ctrl/⌘+⇧+[` / `]` | 上一/下一个会话 | `Qi(e,'[')`/`Qi(e,']')`（24039/24043） |
| `Ctrl/⌘+B` | 切换侧栏 | `ta(e,'b')`（24047） |
| `Ctrl/⌘+J` | 切换终端 | `ta(e,'j')`（24051） |
| `Ctrl/⌘+⌥+B` | 切换侧面板 | `Rre(e,'b')`（24055） |
| `Ctrl/⌘+[` / `]` | 导航后退/前进 | `ta(e,'[')`/`ta(e,']')`（24059/24063） |

匹配器语义（keyboardShortcuts-BGHopxr9.js）：`ta`=mod 无 Shift/Alt、`Qi`=mod+Shift、`Rre`=mod+Alt；
Mac 上 mod=metaKey，其余平台 mod=ctrlKey（且排除对方平台修饰键）。监听在 **capture** 阶段，
忽略 `repeat` 与 IME 组词。查找条内部另有 ↑/↓/Enter/⇧Enter 导航（`QNt`）与 chat 形态 Escape 关闭。

---

## 4. 与 zcode-uiux-spec.md §8/§11 的交叉验证

| 规格断言 | 代码证据 | 结论 |
|---|---|---|
| §8 标题「命令面板」 | `quickPick.title` = `命令面板`（词典命中；`tOe` 标题取 `intl.formatMessage({id:'quickPick.title'})` 36849） | ✅ |
| §8 placeholder「输入命令」 | 词典确有 `quickPick.placeholder`=`输入命令`，**但命令中心实际用的是** `commandCenter.placeholder`=`搜索操作、任务或文件`（36866）；`输入命令` 为旧版残留 key | ✅（细化） |
| §8 段序 `suggested/recommended/chat/navigation/panels/configure/app`（7 段） | 运行时段序 `D_e` 为 **6 段**：`suggested,chat,navigation,panels,configure,app`，**无 `recommended`**；词典保留 `quickPick.section.recommended`=推荐（旧版残留） | ⚠️ 规格需更正 |
| §8 suggested: new-task(message,Ctrl+N)/open-workspace(folder)/settings(gear) | 三条全中（icon 字段 message/folder/settings；new-task 带 `Ctrl+N`，open-workspace 带 `Ctrl+O`） | ✅ |
| §8 chat: 会话级命令（compact/rewind 等，TODO） | `O_e` 未注册任何 chat 段命令 | ❌ 规格待补证据 → 结论：**无** |
| §8 navigation: previous/next-conversation、go-back、go-forward、find | 未注册进面板；这些是**全局快捷键**（§3）。词典保留 `quickPick.command.previousConversation/nextConversation/goBack/goForward/find/openFile` 6 个 key，但全 chunk **零引用**（旧版残留） | ⚠️ 规格需更正（键盘存在、面板无） |
| §8 panels: toggle-sidebar/toggle-terminal/toggle-preview/add-terminal-tab/add-browser-tab/add-review-tab | 六条全中（toggle-preview/add-browser-tab 受 `supportsEmbeddedBrowser` 门控） | ✅ |
| §8 panels 另列 toggle-side-pane/toggle-browser-panel/toggle-diff-panel | 注册表无此三条；toggle-side-pane 仅以全局快捷键 `Ctrl/⌘+⌥+B` 存在 | ❌ 规格需更正 |
| §8 configure: settings/mcp-servers/personalization/skills/switch-theme | settings/mcp/skills/switch-theme 四条中；**personalization 无**（词典有 key、代码零引用） | ⚠️ 4/5 |
| §8 app: feedback/my-tickets/community/product-docs/login/logout | feedback/community(门控)/product-docs/login/logout 五条中；**my-tickets 无**（词典 `quickPick.command.myTickets`=我的反馈，代码零引用；「我的反馈」入口在反馈中心内，见 F09 `RMe`） | ⚠️ 5/6 |
| §8 命令面板键盘导航 ↑↓/Enter | cmdk root（26240–26278）：ArrowUp/Down、Ctrl+n/j/p/k、Home/End、Enter 派发 `cmdk-item-select`；`loop=true`（36853） | ✅ |
| §11 Ctrl+K 搜索/查找 | `ta(e,'k')` 打开命令中心；`Ctrl+F` 打开任务内查找 | ✅（并补充 ⌘⇧P 同开命令中心） |
| §11 Ctrl+B 切换侧栏（TODO） | `ta(e,'b')` + 命令标签 `$i('B')` | ✅ 证实 |
| §11 toggleTerminal 默认值（TODO） | `Ctrl+J`（`ta(e,'j')` + `$i('J')`，与 TopBar 族 H6 一致） | ✅ 证实 |
| §11 Ctrl+P/⇧P 命令面板（TODO） | 实际为 `Ctrl/⌘+K` **或** `Ctrl/⌘+⇧+P` | ✅ 证实并更正 |

**规格修订建议**（§8 重写依据）：
1. 段序改为 6 段（删 `recommended`）；`chat`/`navigation` 标注「3.7.6 未注册命令」。
2. 命令清单按本报告 §2 的 18 条（含 4 个条件项）落账；删除 personalization/my-tickets/toggle-browser-panel/toggle-diff-panel/toggle-side-pane（面板内）。
3. placeholder 用 `commandCenter.placeholder`（搜索操作、任务或文件）。
4. §11 快捷键表按本报告 §3 落账。

---

## 5. 外部依赖清单（跨 chunk）

| # | chunk | 符号 |
|---|---|---|
| 1 | `react` + `jsx-runtime` | React / jsx 运行时 |
| 2 | `utils-CEEH0K_K.js` | `cn()`（Z） |
| 3 | `button-laUijeDG.js` | `Button`（X）、`createLucideIcon`（Sa） |
| 4 | `IntlProvider-C321H7m8.js` | `useIntlContext`（G）；词典 `quickPick.*`/`commandCenter.*`/`taskSearch.*`/`taskList.*` |
| 5 | `imeComposition-DEYFkwWm.js` | toast（m=_）、x 关闭图标（g=b→内部 qt） |
| 6 | `usageStatsUiParts-CiR7YEhh.js` | `Tooltip`（Ia） |
| 7 | `keyboardShortcuts-BGHopxr9.js` | `shortcutLabel`（$i=n）、`isModKey`（ta=u）、`isModShiftKey`（Qi=l→d）、`isModAltKey`（Rre=c→f） |
| 8 | `logger-PFDwl5Yq.js` | `logger`（J） |
| 9 | `skillStore-BmeKHDBI.js` | zustand create（Ae=q）、`useTaskStore`（xe=h）、`getWorkspaceState`（fe=U→_e）、`mergeTaskMeta`（pe=W→de） |
| — | 本 chunk 内 | cmdk（26004–26574）、Dialog 封装（31943–32040）、`Vo`(1553)、`Zs`(4309)、`fs`(2638)、`Ec`(4897)、图标块 184 个（26575–28020，本族用 29 个）、文件图标工具（4946–6061） |

---

## 6. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| `Rje`/`nPt`/`O_e`/`D_e`/`mje`/历史/过滤/高亮/`pC`/`Lje`/`Ije` 的 JSX、类名、i18n key、常量值 | **高（逐字转录）** | 直接从压缩源码逐行还原，类名/i18n id/阈值常量未做任何改动 |
| 命令清单 §2、快捷键 §3、段序 | **高** | 注册表 + 装配现场（186780–186871）+ keyboardShortcuts chunk 语义三方互证 |
| `Vo` store 12 个 action 逻辑 | **高（逐字转录）** | 1553–1878 全量还原；仅 7 个内部合并助手（`Xie` 等）为接口级 stub（行号在案） |
| `ZS` useGlobalTaskList 主流程 | **高** | 35727–36070 全量转录；13 个深部助手（快照缓存/事件/分片解析）为接口级 stub（行号在案） |
| TS 类型（TaskMeta/QueryResult/各 stub 签名） | **中高（推断）** | 由解构用法与调用面归纳；跨 chunk 服务接口可能有细微出入 |
| vendored `fuzzy` 评分 | **高** | 25586–25631 逐字转录（保留原算法常量） |
| 与 §8 的差异判定 | **高** | 词典（IntlProvider chunk）与代码引用双向核对：6 个残留 key 确认零引用 |

---

## 7. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`（web 工作区 esbuild）：**0 错误**（81.6kb 输出）。
- `tsc --noEmit --strict --jsx preserve --target es2022 --lib es2022,dom`（web 工作区 @types/react 环境，
  临时副本 `/home/none/grok-build/web/.qp-check/`）：**0 错误**，验证后已清理临时副本。
- `out/` 目录未做任何修改（只读访问）。

## 8. 后续建议

1. `ZS` 的 13 个接口级助手（快照缓存 `Ex/Ox`、分片解析 `sje`、事件助手群）若 F01 侧栏族抽取时需要，
   可顺带展开（它们同时服务侧栏任务列表）。
2. `Vo` 的 7 个合并助手（`Xie/Jie/Yie/Uie/Bo/Kie` + `Mo/Po`）建议与 F01 一并展开，属任务列表共享层。
3. 规格 §8 按本报告 §4 的修订建议回写（段序 6 段、18 条命令、placeholder、§11 快捷键表）。
4. 词典残留 key（`quickPick.section.recommended`、`quickPick.command.{find,goBack,goForward,previousConversation,nextConversation,openFile,personalization,myTickets}`）
   可在重建词典时标记 deprecated。
