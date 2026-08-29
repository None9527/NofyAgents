# A0-D-Shell 批次报告（Stage A0 · declare 接线 + 类型收敛）

批次域：`modules/{WorkspaceShell,Sidebar,SidebarLeaves,TopBar,Home,ExtendedViews,SidePanel}.tsx`（7 文件）。
日期：2026-08-29。逐字基准：`src-reconstructed/modules/<同名>`；权威 bundle：`desktop/src/out/renderer/assets/{src-HCld2afU.js, styles-CdEGpc2x.js}`（见「异常」§2 路径说明）。

## 0. 门禁结果

| 门禁 | 结果 |
|---|---|
| a. esbuild 逐文件（--loader:.tsx=tsx --jsx=preserve） | 7/7 OK，0 错 |
| b. tsc -p tsconfig.json 域内逐文件不增 | 通过（全部低于基线，见 §3） |
| c. bundle md5 | src-HCld2afU.js = `f5edd6a1207c6d20008204829dad3923` ✓；styles-CdEGpc2x.js = `48d71d4874b0868d61fd35a328bf6ad5` ✓（实测路径 `desktop/src/out/`） |

## 1. 逐文件接线清单

### 1.1 declare → 真实 import

| 文件 | 符号 | 属主 | 备注 |
|---|---|---|---|
| TopBar | `CommitGraphViewer`（原 fct） | CmdkPaletteDeep `CommitGraphDialog`（别名导入） | B5-07：已核验 CmdkPaletteDeep 导出（CreateBranchDialog/SwitchAssistDialog/resolveBranchDisplayLabel/useGitBranchSwitcher/CommitGraphDialog L1390/CommitGraphView）；同组 Popover*/Command* 为 Lane-4 保留 |
| 全部 7 文件 | `cn`（原 Z） | UtilsCn | utils-CEEH0K_K.js 重建属主；裁决见 §5.1 |
| SidebarLeaves | `formatRelativeTime`（$S，js 36080） | SidePanel L263 | |
| WorkspaceShell | `AutomationsMain`（原 d6，F15 根） | ExtendedViews §6.10 | 调用面 `workspaceIdentity?: string \| null` 放宽；原 declare 处留接线注释 |
| WorkspaceShell | `GitSummary`/`GitDataset`/`GitSourceOption` | GitReview（原 Yhe/Yse 缺省形） | git 域规范形；本地 `GitChange` 一并删除 |
| WorkspaceShell | `SidePaneState`/`SidePaneTab`/`RecentClosedSidePaneTab`（type-only） | SidePanel | 本地松形删除；`recentClosedSidePaneTabs` 改 `RecentClosedSidePaneTab[]`（2 处） |
| Sidebar | `RemoteSyncMenuItems`/`TaskActionMenuItems`/`TaskRenameDialog`/`type TaskActionMenuItemsProps` | TopBar | `TaskActionContextMenuContent` props 收敛为 `Omit<TaskActionMenuItemsProps,"Item"\|"Separator">` |
| SidebarLeaves | `type BaseServices` | stores-core | 供 buildScopedServices/buildWorkspaceServicesMap declare 实参形 |
| Home | `CodeCommentAttachment`/`useCodeCommentContexts`/`countContextAttachments`/`isAddToChatEvent` | GitReview | `CodeCommentItem` 统一为 `CodeCommentAttachment`（原 DXe 族） |
| ExtendedViews | `type ToastOptions` | ImeComposition（与 toast 同主） | 本地松形删除；`automationsToast` 返回改 `number`（toast 实返） |
| ExtendedViews | `type CodeViewerSource`（type-only 再导出） | SidePanel | 原本地 kind 形为重建误差；MarkdownIntegration 调用面为 `type:"file"` 请求形 |

误接线回退：
- TopBar `resolveEffectiveProvider`：前批次 `import … from './21359'`（TS2307，无此模块；21359 为 jsx 行号）→ 复原为 declare（原 Zge，bundle 24734 `(e,t)=>e??t`）。
- SidebarLeaves `resolveSelectedSupplierKey`：前批次误接 WorkspaceShell kJt → 回退 import、复原 Uq declare（裁决 §5.4）。
- WorkspaceShell `Sidebar`→`WorkspaceSidebar` 实接尝试：调用面新增 10 错 → 回退，declare 保留（§5.6）。

### 1.2 域内加 export（供他域后续 import）

| 文件 | 符号 | 说明 |
|---|---|---|
| TopBar | `WINDOWS_CAPTION_RIGHT_INSET_VAR`、`windowsCaptionInsetStyle`、`PRODUCT_DOCS_URL`、`TaskActionMenuItemsProps` | WS/Sidebar 消费 |
| Sidebar | `moveTaskToGroupEdge`（u8）、`moveTaskIntoGroupStart`（d8）、`moveTaskIntoGroupEnd`（bIt）、`TaskActionContextMenuContent` | B5-07 拖拽函数；`groupedTaskKey`（n8）原已导出 |
| SidebarLeaves | `readVisibleLimit` | |

B5-07 账目：u8/d8/bIt/n8 已导出；**xIt/vIt 未在 Sidebar 物化**（仅头部注释提及；QuickPickDeep L300–322 以自有名 declare：moveTaskOverTask=vIt、placeTaskOutsideGroup=u8、placeTaskAtGroupHead=d8、appendTaskToGroupTail=bIt、moveGroupOver=xIt、groupedTaskKeyOf=n8）→ 登记 §4.16。
B5-02 账目：域内无指向 j6t（AppRootLeaves）/K9/q9/J9/Y9（OLL）的 declare，grep 核验无动作。

### 1.3 类型收敛（纯类型面，无运行时语义变化）

| 文件 | 改动 | 依据 |
|---|---|---|
| TopBar | `GitSummary.branchName: string → string \| null` | 与 GitReview.GitSummary 对齐；useGitBranchSwitcher/resolveBranchDisplayLabel 均收 `string \| null`（CmdkPaletteDeep 核验） |
| TopBar | `triggerPresentation` 并集增 `"header-borderless"` | bundle styles-185695/205611 实传值 |
| TopBar | `inputRef: RefObject<HTMLInputElement \| null>` | React 19 useRef(null) 实参形 |
| TopBar | `InstalledEditor` interface → type 别名；`resolveAvailableEditors` 调用 `remoteTarget ?? null` + 返回断言回本族形 | 并行批次 FileTreePanel 导出 resolveAvailableEditors 后暴露的重复型错；返回为入参子集同引用，断言为真 |
| Sidebar | `WorkspaceTab` interface → type 别名 | 对 SidebarLeaves.WorkspaceTab（索引签名形）可赋值 |
| Sidebar | `RemoteTarget` kind 基收紧（`kind: "ssh"\|"wsl"\|"docker"\|"server"`，去 port/sshConfigAlias 的 null） | resolveSshConnectionInfo（原 RBt/zBt 158137/158140）按 `kind==="ssh"` 裁决；与 Home/RemoteWizard 同口径 |
| Sidebar | `SidebarUsageState` 去 `[key:string]: unknown` | 与 SidebarLeaves.SidebarUsageStateModel（interface，无隐式索引签名）对齐 |
| SidebarLeaves | `buildScopedServices`/`buildWorkspaceServicesMap` declare 参 `services: BaseServices` | 实参为 useBaseServices() 返回形；返回分片按 WorkspaceServices 收敛 |
| WorkspaceShell | `GitState` interface → type 别名 | 对 SidePanel `GitState {[key:string]:unknown}` 占位可赋值 |
| SidePanel | `UseSidePaneStateArgs.defaultWhiteboardNamePrefix` 改必填 | 唯一调用面（WS）恒传 intl 字符串；SkillStore createBoard 必填 defaultNamePrefix |
| SidePanel | `tabs.findLast(…)` → `[...tabs].reverse().find(…)` | tsconfig lib ES2022 无 findLast（TS2550）；语义等价 |
| Home | `isSameWorkspaceTab` 经 `scopeOf` 归一 `?? undefined` 后走 workspaceScopeKey | stores-session.WorkspaceScope 不收 null |
| Sidebar | ContextMenuItem/ContextMenuSeparator declare 形复原/对齐；两处 TabsTrigger ref 标注 `HTMLButtonElement \| null`；`upgradeTargetProviderId` 与 mRt 返回对齐 | 前批次遗留修复 |

## 2. 保留 declare 及原因

剩余 declare 计数：WorkspaceShell 95、Sidebar 166、SidebarLeaves 70、TopBar 35、Home 86、ExtendedViews 68、SidePanel 34（合计 554）。

1. **Lane-4 vendored（S3 换 npm，保留不动）**：`Icon*`/`createLucideIcon`、shadcn/radix 原语（Button/Dialog*/DropdownMenu*/Select*/Tabs*/Tooltip*/ScrollArea/Command*/Popover*/Slot/Switch*/Input/Textarea/Badge）、lexical 系、qrcode、useVirtualizer。7 文件均有。
2. **属主未物化（函数本体尚未重建，declare 为接口占位）**：服务袋（useServices/useWorkspaceServicesResolver/usePlatformService/useBaseServices 派生）、store 选择子（taskStore/searchResultsStore/useWorkspaceTabs/sessionRouterStore/splitLayoutStore）、git 钩子（useGitState/useGitSummarySync/countDirtyFiles——类型已接 GitReview，钩子本体未物化）、QuickPick/Feedback/更新对话框族、zcode* 服务类型。
3. **待属主导出（TS2459，登记于 §4）**：logger（SkillStore）、ModelSelector/ComposerInput/BackgroundWorksCapsule/useIsMobileTextInputViewport（Composer）、providerIds（SrcSharedA）、canOpenRemoteSessionSourceCheck（Modals）、FileTreePanel 组件（FileTreePanel）。
4. **裁决保留**：useOffPeakTaskStore（§5.5）、Sidebar 组件（§5.6）、SidebarLeaves Uq（§5.4）。

## 3. tsc 前后对照（域内）

基线取任务书头部数（会话内首次实测同口径；SidebarLeaves 首测 16，任务书 25，两口径均满足不增）。

| 文件 | 基线 | 完工 | Δ |
|---|---:|---:|---:|
| WorkspaceShell.tsx | 82 | 69 | −13 |
| Sidebar.tsx | 46 | 33 | −13 |
| SidebarLeaves.tsx | 25（首测 16） | 12 | −13（−4） |
| TopBar.tsx | 22 | 18 | −4 |
| Home.tsx | 55 | 49 | −6 |
| ExtendedViews.tsx | 86 | 84 | −2 |
| SidePanel.tsx | 26 | 21 | −5 |
| **合计** | **342**（首测 333） | **286** | **−56** |

剩余错误构成：待属主导出 TS2459（~10）、服务袋 unknown 级联（~60）、SkillStore curried create 下游（Home ~30、ExtendedViews 2263/4849）、跨批次重复型漂移（TaskMeta/Conversation GitSummary/CodeViewer 族/会话句柄，~80）、Lane-4 原语 ref/props 漂移（~10）、其余零散。均属规则 7「待属主接线后消解」类。

## 4. 需要的 export（属主域外，declare/错误保留）

| # | 属主文件 | 符号/修正 | 定义行 | 受益方 |
|---|---|---|---|---|
| 1 | SkillStore.tsx | `logger` 导出（L154 私有 declare；logger.tsx L149 导出 `logger as t`；38 文件已按 `import { logger } from './SkillStore'` 惯例） | 154 | 域内 7 文件各 1 处 TS2459 |
| 2 | SkillStore.tsx | curried `create` 重载补 `()` 零参调用签名 | ~276 | Home off-peak store 块 ~30 错 |
| 3 | SkillStore.tsx | `TaskMeta.unreadAt?: number` → `number \| null`；并导出 `TaskMeta`/`TaskStore`/`TaskStoreState` 类型 | 399–414 / 3239 | Sidebar TaskMeta ×6、WS 4375/4393、EV 2263/4849 |
| 4 | SkillStore.tsx | `WhiteboardStroke`（3282）/`WhiteboardBoard`（3290）类型导出 | 3282/3290 | EV 3919/3955/3989 |
| 5 | Composer.tsx | `ModelSelector`、`BackgroundWorksCapsule`、`ComposerInput`、`useIsMobileTextInputViewport` 导出 | — | TopBar/Home/SidePanel/ExtendedViews TS2459 |
| 6 | SrcSharedA.tsx | `providerIds` 导出 | — | Home/ExtendedViews TS2459 |
| 7 | Modals.tsx | `canOpenRemoteSessionSourceCheck` 导出 | — | TopBar 129/Sidebar 194 |
| 8 | FileTreePanel.tsx | `FileTreePanel` 组件导出；`InstalledEditor` 增 `iconDataUrl?: string` | 181 | Sidebar 191；TopBar 可去 iconDataUrl 断言 |
| 9 | Conversation.tsx | `GitSummary.branchName: string` → `string \| null` | 424 | WS 3571（ConversationOrchestrator gitSummary） |
| 10 | BrowserPane.tsx | `useScreenshotSurfaceRequest` 签名修正：实收 tabs 数组（bundle SWt styles-178517：`SWt(e)` 内 `xWt(e, incoming)`） | 3191 | SidePanel 3876 |
| 11 | BrowserPane.tsx | `BrowserView.faviconUrl?: string` → `string \| null`（bundle 调用面传 BrowserTab.faviconUrl: string \| null） | 246 | SidePanel 4375 |
| 12 | Settings.tsx | `ThemeMode` 导出（并与 stores-core `theme` 型对齐） | 320 | WS 5473 |
| 13 | SettingsLeaves.tsx | `OffPeakTaskEditor.showToast` 返回 `string` → `number`（ImeComposition toast 实返 number；其缺省值即 toast） | 5033 | EV 6284 |
| 14 | RemoteWizard.tsx | `RemoteWorkspaceSessionLike` 导出 | 228 | Home 1377 |
| 15 | ImeComposition.tsx | `PopoverAnchor` 收透传 props（bundle FBt 将 onOpenChange 传 Oa=Anchor：styles-158095） | 347 | Sidebar 2703 |
| 16 | Sidebar.tsx（本域，待物化） | xIt/vIt（moveGroupOver/placeTaskOutsideGroup 语义位）物化后导出 | 头部 99 区 | QuickPickDeep L300–322 后续改指 |

## 5. 歧义裁决（AMBIGUOUS）

1. **cn 属主 = UtilsCn**：UtilsCn 为 utils-CEEH0K_K.js 重建，`export function cn(...inputs: ClassValue[])`（npm clsx+tailwind-merge，0 错）；SrcSharedB 的 `cn` 是 testid 别名（browserResponsiveResizeHeightTestid）。7 文件统一接 UtilsCn。
2. **AutomationsMain（d6）= ExtendedViews §6.10**：COVERAGE-LEDGER L38「d6 视图态随 ExtendedViews」+ ExtendedViews.report d6 canonical；调用面 identity 参数放宽为 `string \| null`。
3. **$S = SidePanel.formatRelativeTime**（js 36080，SidePanel L263 已导出）。
4. **Uq ≠ kJt**：Uq（bundle 77975，供应商键前缀解析，`string → string \| null`）与 kJt（185901，对象参解析）同名异函数；前批次将 SidebarLeaves 误接 WorkspaceShell.kJt 引发 924 行 TS2345 → 回退，Uq declare 保留。
5. **useOffPeakTaskStore 保留 declare**：Home 本地副本型坏（SkillStore curried create，~25 错传播）；stores-tasks 版 OffPeakTask 过松（`offPeakTaskId?: string; [key:string]: unknown`，破坏 OffPeakTaskList 调用面）→ 待 #4.2/#4.3 属主修正后接线。
6. **Sidebar→WorkspaceSidebar 实接回退**：接入后调用面 10 错（theme string vs ThemeId、user unknown、fileTreeOpenRequest 形、回调 null 方差等）> 收益 → 保留 `declare const Sidebar: React.FC<Record<string, unknown>>` 并注明。
7. **Sidebar RemoteTarget kind 基**：resolveSshConnectionInfo（RBt/zBt）运行时按 `kind==="ssh"` 分支，与 Home/RemoteWizard kind 基一致；原松形（kind?: string）为重建误差。
8. **TopBar branchName 可空**：CmdkPaletteDeep 两个消费面均 `string \| null`；bundle 无仓库时 branchName=null。
9. **EV CodeViewerSource = SidePanel 形**：MarkdownIntegration 调用面为 `{type:"file", title, path, …}` 请求形；EV 原 kind 形注释自称「与 SidePanel 对齐」而实不符。
10. **WS SidePane 型 = SidePanel 导出**：useSidePaneState 返回形为事实源（含 RecentClosedSidePaneTab = {tab, closedAt}）。
11. **defaultWhiteboardNamePrefix 必填**：唯一调用面恒传字符串；SkillStore createBoard 必填 defaultNamePrefix。
12. **buildScopedServices/buildWorkspaceServicesMap 参形 = BaseServices**：实参恒为 useBaseServices() 返回形。
13. **SidebarUsageState 去索引签名**：否则 interface 型 SidebarUsageStateModel 无隐式索引签名不可赋值。
14. **triggerPresentation 增 "header-borderless"**：bundle 两处实传（185695/205611）；TopBar 原并集缺项。

## 6. 异常

1. **并行批次活动**：工作期间 FileTreePanel 批次导出 resolveAvailableEditors（TopBar TS2459 消解、同时暴露 InstalledEditor 重复型 7 错，本批已收敛）；rendererEntry 批次修复 TS2687 zcode 冲突（Sidebar 3681 相关 2 错外部消解）；/tmp 基线文件 07:27 被覆盖，本报告基线以任务书头部数为准。
2. **路径**：任务书 `desktop/out/` 不存在；权威 bundle 实际位于 `desktop/src/out/renderer/assets/`，md5 与门禁值一致。
3. **行号锚点**：重建注释中「js NNNNN」指 styles-CdEGpc2x.js（213,979 行，7.2MB 主 bundle）；src-HCld2afU.js 仅 10,069 行。
4. **xIt/vIt 未物化**：B5-07 要求导出的 6 个拖拽函数中 2 个在 Sidebar 无实体（仅头部注释），已登记 §4.16。
5. **EV 178 行孤儿注释**（`/** 日志器（原 J…） */`）：前批次移除 logger declare 改 import 时遗留，未动。

## 7. 完工汇报

- 接线数：11 组 declare→import（含 cn ×7 文件、git 域 3 型、SidePane 3 型、ToastOptions、CodeViewerSource、BaseServices、fct、$S、d6、GitReview 族、TopBar 四件套）+ 误接回退 3 处。
- 加 export：域内 8 个（TopBar 4、Sidebar 4（含 TaskActionContextMenuContent）、SidebarLeaves 1）。
- 保留 declare：554（Lane-4 vendored + 属主未物化 + 待导出 + 裁决保留）。
- 错误数变化：342 → 286（−56；逐文件只减不增，门禁 b 通过）。
- 需要的 export：16 项（§4）。
