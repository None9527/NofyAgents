# Modals 模块抽取报告（模态 / 对话框族 · D8 Stage B3）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/Modals.tsx`（5,473 行，按子族分 7 节）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 格式标样：`TopBar.tsx` / `TopBar.report.md`；地图：`MODULE-MAP.md`（F09/F10/F18 行号包络）
- 行号口径：js 行（输入文件）/ jsx 行（规格口径）双列，方法同 TopBar 试点（混淆名双向定位核对）

---

## 1. 对话框清单（混淆 → 语义 → 行号 → 触发入口）

| 混淆 | 语义 | js 行 | jsx 行 | 触发入口 |
|---|---|---|---|---|
| `COt` | `UpdateStatusDialog` 更新对话框呈现层 | 128795–129028 | 108523–108589 | `POt` UpdateStatusDialogController（TopBar.tsx §1.1 已还原）渲染；打开入口 = `LOt` 更新指示器胶囊点击 / `S6` 菜单「检查更新」/ `onPostUpdateReleaseNotes` 静默确认路径（g8t js 213037+） |
| `wOt` | `splitUpdateDialogTitle` 标题占位切分 | 129029–129046 | 108590 | COt 内部 |
| `xOt` | `UpdateDialogCheckbox`（自动更新开关） | 128776–128790 | 108512 | COt before-download 相位 |
| `SOt` | 更新对话框 logo URL（icon_512@2x） | 128791 | 108522 | COt 头部 |
| `r4` | `RemoteSyncDialogs` 三同步对话框分派器 | 127248–127332 | 107623–107686 | `n4` RemoteSyncMenuItems（TopBar.tsx）三菜单项 onOpenSkillSync/onOpenMcpSync/onOpenPluginSync；菜单挂于工作区更多菜单/设置分区（`$Dt` 下拉按钮亦在本文件） |
| `ZEt` | `SkillSyncDialog` 技能同步对话框 | 125271–125470 | 106355 | r4 分派（canSyncSkills ∧ skillOpen ∧ remoteTarget ∧ 双服务齐） |
| `lDt` | `McpSyncDialog` MCP 同步对话框 | 125728–125933 | 106590 | r4 分派（同上，MCP 侧） |
| `XDt` | `PluginSyncDialog` 插件同步对话框 | 126826–127113 | 107373 | r4 分派（插件侧；含 inline+marketplace 双源、可停止管线） |
| `$Dt` | `RemoteSyncDropdownButton` 「同步到远端」下拉 | 127201–127247 | 107599 | 设置分区/工作区菜单（内嵌 n4） |
| `MEt` | `DirectoryBrowserDialog` 目录浏览对话框 | 123942–124126 | 105724–105811 | g8t `zt`（js 213152–213166）：`p4` scope=`directory-browser` variant=`silent` 包裹；open 态 `ne` 由 `handleOpenWorkspace`（preferDirectoryBrowser，js 210700+ `G9`）与远程向导 directory 步置位；onSelect→`handleSelectProject` |
| `E3t` | `OnboardingDialog` onboarding/迁移向导对话框 | 208252–208536 | 165388–165519 | g8t（js 213222–213233）：`p4` scope=`onboarding-dialog` resetKeys=[identity‖path]；打开 = `s3t` 首运行探测（getFirstRunPromptState→detect）或 `ko.onboardingDialogRequested`（设置 store） |
| `q4t` | `ConfirmDialog` 确认对话框 | 206572–206703 | 164353–164395 | `P9` 宿主常驻；`U2().requestConfirmation` 单飞 Promise |
| `G4t` | `AlertDialog` 警告对话框（单按钮） | 206527–206570 | 164317–164351 | `P9` 宿主常驻；`$3t().requestAlert`（如 b6t OAuth 登录过期，js 210080–210105） |
| `P9` | `AppDialogHost` 模态宿主（children+G4t+q4t） | 206704–206710 | 164396 | g8t 所有渲染分支外层 |
| `H2`/`U2` | ConfirmDialogStore / useConfirmDialog | 123480–123495 | 105205–105224 | 见 §3 任务删除/归档确认入口表 |
| `N9`/`$3t` | AlertDialogStore / useAlertDialog | 206514–206526 / 209650 | 164300 / 166685 | 同上 |

任务对象覆盖核对：`COt` ✅、`r4` ✅、directoryBrowser（`MEt`，scope directory-browser）✅、`E3t` ✅、任务删除/归档确认 ✅（§3）、WorkspaceActionError ✅（§5 登记）、配额/订阅错误上报 `wCt` ⏭ 跳过（Conversation 族已登记）、`j6` ⏭ 跳过（TopBar.tsx 已含）。

---

## 2. 各子族抽取明细

### 2.1 更新对话框子族（§1，js 128776–129046）
- `COt` 逐字转录：三相位（before-download/downloading/downloaded）+ `edgeToEdge` 全屏变体（自绘 `role=dialog`，`[app-region:drag]`，网格行随相位切换）+ Radix 变体（`zb/Hb`，`showOverlay/showCloseButton=false`）。
- 进度条 `yq`（Progress，js 75986 / jsx 67310）随族转录（segments 支持）；`xOt` Checkbox 封装（Radix `Zxe/$xe`）。
- 控制器 `POt` 与视图模型助手 `DOt/TOt/EOt/kOt/NOt` 已在 TopBar.tsx，不重复；本文件 `UpdateStatusDialog` 即 TopBar.tsx §1 中 `declare` 接口的**实现**。

### 2.2 远程同步对话框子族（§2，js 124995–127332）
- preflight 助手全量：`ZDt`(15s)/`QDt`/`Q2`/`$2`/`e4`/`t4`。
- 技能：`zEt/BEt/VEt/HEt/UEt/WEt/GEt/KEt/q2/qEt/JEt/YEt/XEt/ZEt` 全量。
- MCP：`QEt/$Et/eDt/tDt/nDt/rDt/iDt/aDt/oDt/sDt/cDt/lDt` 全量。
- 插件：数据层 `J2/dDt/fDt/pDt/mDt/hDt/gDt/_Dt/vDt/yDt/bDt/xDt/SDt/CDt/wDt/TDt/EDt/DDt/ODt/kDt/ADt/Y2/X2/Z2/jDt/MDt/NDt/PDt/FDt/IDt/LDt/RDt/zDt/BDt` + UI 层 `VDt/HDt/UDt/WDt/GDt/KDt/qDt/JDt/YDt/XDt` 全量（含 stopControl 三件套：isStopped/waitForStop/cancelOperation；marketplace 源镜像准备；可移植选项同步）。
- 三相位对话框共用形态：`h-[min(720px,calc(100dvh-2rem))] max-w-2xl`；preflighting/syncing 期间 `onOpenChange(false)` 被拒（技能/MCP 直接拒，插件经 `vDt`）。
- `n4` 菜单项已在 TopBar.tsx，本文件以接口引用（`RemoteSyncMenuItemsInner`）。

### 2.3 目录浏览器子族（§3，js 123929–124126）
- `OEt/kEt/AEt/jEt` + `MEt` 全量：homedir 起手（`systemService.info`）、路径输入 form、隐藏目录切换（`aria-pressed`）、`..` 上行、竞态令牌 `jEt`、`embedded` 变体（远程向导复用）、Escape/遮罩取消。
- 挂载侧 `p4`（ScopedErrorBoundary，js 129952）已在 WorkspaceShell.tsx；g8t 挂载点 js 213152 逐字记录于注释。

### 2.4 Onboarding 对话框子族（§4，js 206927–208536）
- settings-sync 纯助手 `$4t/F9/I9/e3t/t3t/n3t/r3t/i3t/a3t/L9/o3t` + 控制器 `s3t`（首运行探测/手动重探/选择 toggles/importSelected 逐任务 320ms 推进/providers 失效刷新/skills 上下文刷新）全量。
- 向导 UI：`c3t/l3t/u3t/d3t/f3t/p3t/m3t/h3t/g3t/_3t/R9/v3t/y3t/b3t/x3t/S3t/C3t/w3t/T3t/z9/E3t` 全量（welcome 双栏 + 六步 rail + session 多选 + 三导入步共享 `v$t` + AGENTS.md 步 + 迁移进度/完成三卡 + 底部导航）。
- 跨族远端钩子接口级：`R7`（useImportSelections，193347）、`I2t`（useSessionMigrationScanner，203145）、`v$t`（ImportSelectionView，193680）、`S4t/C4t`（hero，206090/206094）——属 F06/F18 设置迁移页共用面，按 TopBar 先例保留接口。
- 关闭守卫：migration 运行中关闭走 `U2` 确认（`onboarding.migration.confirmClose*`）；agents-file 起步走 `onboarding.agentsFile.confirm*` 确认。

### 2.5 确认/警告对话框 + 宿主（§5）
- `H2/U2`（123480/123493）、`N9/$3t`（206514/209650）、`K4t`、`q4t`（含 window 级 Enter 捕获、esc/⏎ 键帽、`automation-confirmation` 加宽变体、compact 变体、testid `confirm-dialog-confirm`）、`G4t`、`P9` 全量逐字。

---

## 3. 任务删除/归档确认 —— 触发入口登记

确认对话框本体 = `q4t`（§5）。本 chunk 内调用点：

| 入口 | js 行 | i18n key | 归属组件 |
|---|---|---|---|
| 会话头更多菜单→归档 | 143661–143673 | `confirmDialog.taskArchiveTitle`/`taskArchiveDescription`，confirm=`taskList.archive` | `wFt`（TopBar.tsx 已含调用点） |
| 侧栏归档平铺段→删除归档任务 | 147005–147046 | `confirmDialog.archivedTaskDeleteTitle`/`archivedTaskDeleteDescription`，confirm=行 title | `lLt`（F01 Sidebar 族，未抽取；jsx 122315） |
| Web 远控任务索引→删除归档远控任务 | 147510–147546 | 同上 | `mLt`（F17 族，jsx 122463 内） |
| Onboarding agents-file 起步 / migration 运行中关闭 | 208417–208455 | `onboarding.agentsFile.confirm*` / `onboarding.migration.confirmClose*` | `E3t`（本文件） |
| 更新重启前活动会话确认 | （TopBar POt 内） | `updateDialog.*` | TopBar.tsx |

词典另有 `confirmDialog.taskDeleteTitle`/`taskDeleteDescription`/`projectRemoveTitle`/`projectRemoveDescription`（IntlProvider zh 143–150 行），**本 chunk 无调用点**（历史/它端入口），仅登记不还原。

---

## 4. 外部依赖清单（跨 chunk）

| # | chunk | 符号 |
|---|---|---|
| 1 | react / jsx-runtime | `Q`/`$` |
| 2 | utils-CEEH0K_K.js | `cn`（Z） |
| 3 | button-laUijeDG.js | Button（X）、IconX（g）、IconChevronRight（wa） |
| 4 | IntlProvider-C321H7m8.js | useIntlContext（G） |
| 5 | imeComposition-DEYFkwWm.js | Input（P）、spinner loader-circle（M） |
| 6 | usageStatsUiParts-CiR7YEhh.js | Tooltip（Ia） |
| 7 | logger-PFDwl5Yq.js | logger（J） |
| 8 | skillStore-BmeKHDBI.js | zustand create（Ae） |
| 9 | src-HCld2afU.js | testid `confirm-dialog-confirm`（mee，8463 行 Mb） |
| 10 | 本 chunk 它族 | Dialog 族 `zb/Hb/Ub/Gb/Kb/Wb/Vb`（31943+）、HoverCard `dN/fN/pN`（jsx 49005）、Select 四件、Checkbox `Zxe/$xe`、Progress `yq`（75986，随族转录）、Badge `uJ`（接口）、图标块 18 个（§0 表）、`Go`（1928）、`fs`（2638）、`Ag`（24320）、`M6`（142697）、`mM`（52639） |
| 11 | 接口级（它族共用面） | `R7`（193347）、`I2t`（203145）、`v$t`（193680）、`S4t/C4t`（206090/206094）、`ko` 设置 store（1296） |

---

## 5. WorkspaceActionError 呈现 —— 核查结论

逐行核对（全 chunk grep `workspaceActionError` 仅 2 处）：

1. 状态定义：`j6t`（useWorkspaceActions，js 210486–210765）内 `let [y, b] = useState(null)`（210507），随 return 暴露 `workspaceActionError: y`（210678）。
2. 唯一调用方 `g8t`（212837–212852）**只解构 `setWorkspaceActionError: qe`**，值侧无任何消费/渲染。
3. 置位点：210549（无活动工作区新建任务 → `workspace.noActiveForNewTask`）、210447（`O6t` ensureConversationWorkspace 失败 → 原始 message）、213098（g8t 启动兜底失败 → 原始 message）；清零点 210437/210444/212882。
4. 结论：**本构建中该状态为「置位但无呈现」的死状态**（呈现层或被移除）。Modals.tsx §6 以 `WorkspaceActionsModel` 接口 + 注释完整登记接线，重建时建议自接 `N9` AlertDialog 或 toast。把握度：高（穷尽搜索为证）。

---

## 6. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| COt/MEt/q4t/G4t/P9/r4/$Dt/三同步对话框/E3t 向导全件的 JSX 结构、类名、i18n key、相位机 | **高（逐字转录）** | 类名/key 未改动；jsx 双行号逐段核对 |
| 插件同步数据层（Z2/IDt/LDt/zDt/FDt/NDt…） | **高** | 纯函数逐行转录；MDt 调用约定（值=configuredOptions 项、schema=userConfig 项）按原调用面保留 |
| TS props/服务接口 | **中高（推断）** | 由调用面归纳，可能与真实 IPC 接口有细微出入 |
| R7/I2t/v$t/S4t/C4t 接口级保留 | **中** | 它族共用面，按 TopBar 先例保留行号与接口 |
| WorkspaceActionError 无呈现结论 | **高** | 全 chunk 穷尽搜索 |

---

## 7. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`：解析通过（0 错误，156.3kb 产物）。
- `tsc --noEmit --strict`（ES2022+DOM、moduleResolution=bundler、@types/react 取自 `/home/none/grok-build/web/node_modules`）：**0 错误**。
- `out/` 目录未做任何修改（只读访问）。

## 8. 后续建议

1. F01 Sidebar 抽取时直接复用本文件 `useConfirmDialog` 接口，归档/删除确认调用点（147005/147510）归位。
2. F06/F18 抽取时实现 `R7/I2t/v$t`（设置迁移页共用面），与本文件 E3t 对接。
3. `confirmDialog.taskDeleteTitle` 等 4 个死 key 建议在词典审计中标注。
