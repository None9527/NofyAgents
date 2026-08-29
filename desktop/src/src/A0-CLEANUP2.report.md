# A0-CLEANUP2 报告（收尾接线 pass 2）

范围：worklist items **10–20, 35, 42, 45, 46, 47, 50**。基线 tsc = `/tmp/tsc-now9.txt`（pass 1 收尾，项目总数 538）。
约定遵循：B5（顶层语义名、函数体局部名不动）；消费面接法 = 删本地 declare + 属主 import（保留既有 import 风格）；未新增任何 @ts-expect-error/@ts-ignore；未触碰 A0-PROGRESS.md / A0-CLEANUP-WORKLIST.md / src-reconstructed/ / out/；未 git commit。

## 逐项结果

### item 10 — Composer 属主导出 + 消费面接法 ✅
**属主导出（Composer.tsx）**：`ModelSelector`、`BackgroundWorksCapsule`、`ComposerInput`、`useIsMobileTextInputViewport`、`appendWebElementsToContent`、`nanoid`、`loadSkillContext`（+ 配套类型导出 `ModelGroup`、`BackgroundWork`、`AppSlashCommand`、`ComposerEditorApi`）。
**属主侧收宽（bundle 地面）**：`ModelSelector.focusSelectorOnClose?: string | null`（bundle 调用面 132964/197382 传 null 禁用聚焦还原）；`WebElementContext.id` 改可选（BH 校验不含 id，接收侧 XXe `id ?? NXe()` 补齐，68936）。
**消费面**：
- TopBar：无 Composer declare（摘要族类型 TopBar 自持，见 item 46）——无需接线。
- Home：`BackgroundWorksCapsule`/`ComposerInput` 既有 import 生效（清 2×TS2459）；调用面边界桥接 4 处：`backgroundWorks as BackgroundWork[]`、`inputApiRef as unknown as { current: ComposerEditorApi | null }`（ComposerInputApi↔ComposerEditorApi 不可比）、`appSlashCommands as AppSlashCommand[]`、`countContextAttachments` 的 `webElements as unknown as WebElementContext[]`；`useWhiteboardAttachmentScope.handlePaste` 注解改 DOM `ClipboardEvent`（对齐 ComposerInput onPaste / PasteCapturePlugin 原生监听）。
- SidePanel：既有 import 生效（TS2459 清除），无本体编辑。
- ExtendedViews：import 扩 `type ModelGroup`；2 处 `modelGroups as unknown as ModelGroup[]`（本地 ModelSelectGroup 无 key 字段，与 ModelGroup 不可比，单 as 非法——实测）。
- SettingsLeaves：declare 删除 → `import { ModelSelector, type ModelGroup }`；3 处 `as ModelGroup[]` 单铸（SelectGroupEntry 含 key?/items/索引签名，可比性实测成立）；offPeak 站点字面量直传。
- GitReview/CodeViewer/stores-workspace/BrowserPane：见 items 11/12/13/42。

### item 11 — appendWebElementsToContent → GitReview ✅
Composer 补导出 `WebElementContext` 类型；GitReview 删本地镜像 `interface WebElementContext { [key: string]: unknown }` 与 declare，改 `import { appendWebElementsToContent, type WebElementContext } from './Composer'`。
**附带修正（束真对齐，必要）**：`buildOutboundContentWithAttachments` 原重建调用错位一层——bundle GXe@68833 为 `_(zXe(CXe(Moe(e, selections), codeComments), webElements), pptxElements)`（4 级），重建缺代码评论级且 webElements 误传 pptx 追加器。按束真改用本文件既有导出 `appendCodeCommentsToContent` 补齐，`as unknown as` 随之删除。Conversation `countContextAttachments(parsed as AttachmentContextBundle)` 边界不受影响（ParsedUserInput unknown[] 面 → 可比）。

### item 12 — nanoid → CodeViewer uid ✅
CodeViewer `declare function uid()` 删除 → `import { nanoid as uid } from './Composer'`（bundle Ue 评论 id = QV()，js 161559；QV@67278）。

### item 13 — loadSkillContext → stores-workspace ✅
declare 删除 → `import { loadSkillContext } from './Composer'`（HB@63581 属主导出）。
**形状分歧记录**：stores-workspace 的 `SkillContextEntry`/`SkillsService` 为接口级镜像（缺属主侧 workspacePath/provider/loaded 等字段），调用面按 Composer 自身先例（UB store，js 63640，`set as never`）桥接：`skillsService as never`、`set as never`、`get as never`、`workspaceIdentity ?? undefined`（initialize/refresh 两处）。

### items 14–16 — Modals 导出 ✅
`Progress`、`ConfirmDialog` 补 export，`BaseServices` 改 export interface（`canOpenRemoteSessionSourceCheck` 已导出，核验通过）。
**消费面**：Settings（`canOpenRemoteSessionSourceCheck as canOpenRemoteSessionSource`）、SettingsPanels（`Progress`）、AppRootLeaves（`type BaseServices`；DirectoryBrowserDialog services 断言保留 `as unknown as BaseServices` 双铸——ServicesBundle.fileService 缺 readdir，单铸非法，改具名型）。

### item 35 — AppDialogHost children 可选 ✅
`AppDialogHost({ children }: { children?: React.ReactNode })`（bundle P9@206992 children 可省）。OnboardingLoginLeaves `<AppDialogHost>{null}</AppDialogHost>` → `<AppDialogHost />`；AppRootLeaves 既有带 children 用法兼容。TopBar/Sidebar/Settings/SettingsPanels 无 AppDialogHost 调用面（grep 核验）。

### item 17 — GitSummary.branchName → string | null ✅（经 item 46 达成）
核验：Conversation 的 GitSummary 确为本地镜像（A0-D-Conversation 报告 §4 item 10 判断属实），TopBar 为属主且其 GitSummary 已是 `branchName: string | null`（与 GitReview.GitSummary 对齐）。镜像删除后 Conversation 全域改用属主类型；Conversation 无 `.branchName` 读取点，无新增错误。附带红利：WorkspaceShell(3559) `GitReview.GitSummary → TopBar.GitSummary` 基线错误随之消除。

### items 18–19 — BrowserPane ✅
- **18**：`useScreenshotSurfaceRequest` 改收 tabs 数组（bundle SWt@178517：`SWt(e)` 直传 `xWt(e, incoming)`）：`<T extends { type: string } & Parameters<typeof browserUseTabMatches>[0]>(tabs: T[])`，体内 `findBrowserUseTab(tabs, incoming)`，deps `[platform, tabs]`；`browserUseTabMatches` tab 面收宽（browser 族字段可选，兼容 SidePanel SidePaneTab 异构联合）。
- **19**：`BrowserViewProps.faviconUrl`、`BrowserUseTabDescriptor.faviconUrl`、`browserViewReportResidency.faviconUrl` 收 `string | null`（bundle 178245：`=== void 0` 才省略，null 原样上报）。
- **消费面**：SidePanel 无本体编辑，基线错误消 3 处（3870 钩子签名、4274 BrowserUseTab→BrowserUseTabDescriptor、4369 string|null→string|undefined）。SidePanel L713 的 `BrowserUseTabDescriptor` 为其本地类型，与 BrowserPane 导出同名不同物，未动。

### item 20 — QuickPickDeep SessionIndexRow + logEpoch → services 收窄 ✅
属主：`SessionIndexRow` 补 export；`INITIAL_SESSION_INDEX_STATE.logEpoch` 与 snapshot 负载 `logEpoch` 改 `string | null`（bundle schema hke@styles33313：`logEpoch: K()` = z.string()）。
services.tsx：`SessionIndexState.sessions` 改 `Map<string, SessionIndexRow>`（import type 自 QuickPickDeep），5 处 `as unknown as` 收窄为直接赋值（3717/4047/4089/4094/4104——状态形与属主逐字段同形后双向可赋）。
**保留 2 处双铸（记录）**：① `frame as unknown as Parameters<typeof applyFrameToIndexState>[1]`（4090）——传输面 frame.payload 为 `{kind; [key]: unknown}` 弱形，与属主 snapshot/deltas 判别联合不可比；② `getSessions()` 内 `values() as unknown as SessionIndexEntry[]`——公共边界保留弱形（Sidebar HomeConversationEntry 消费面需索引签名；SessionIndexRow 接口无索引签名，不可比，实测）。簇内双铸 6 → 2。

### item 42 — addWebElementContextToChat / validateWebElementContext → BrowserPane ✅
BrowserPane 两 declare 删除 → `import { dispatchWebElementAddEvent as addWebElementContextToChat, isWebElementAddDetail as validateWebElementContext } from './Composer'`（WXe@68822 / BH@68671；消费名别名保留）。

### item 45 — FileRewindDialogDeep 导出 → Conversation/ConversationLeaves ✅
属主：`FileOpenWithMenu`、`buildFilePreviewSource` 补 export；`OpenWithTarget` 重建为判别联合（file 支 path/title/label 必填；website 支可仅 type+url，bundle 111334），新增 `FileOpenPreviewSource` 型；`onOpenCodeViewer` source.path 改可选（E_t 透传面 path 可缺；属主体内窄化安全，零体改）。
**Conversation**：两 §0 declare 删除 → `import { FileOpenWithMenu, buildFilePreviewSource } from './FileRewindDialogDeep'`；调用面（4127/4184 区）零改动通过。
**ConversationLeaves**：FileOpenWithMenu declare 删除 → 属主 import；本地 `buildFilePreviewSource`（E_t@94854）与属主 __t@110410 为**不同束符号**（形参 card+scope），保留本地、返回型改具名对齐 `FileOpenPreviewSource`；PreviewCard `onOpenFileLink?: (arg: any) => void`（bundle v_t@110488 实回传对象 `{path,label,pathKind,...}`，链路按 path 建模，边界收 any）；website 分支 `previewSource ?? undefined`（null 不入属主可选槽）。

### item 46 — TopBar 摘要族导出 → Conversation 镜像删除 ✅
属主导出：`buildSummaryPanelModel`、`resolveSummaryPanelVariant`（值）+ `GitSummary`、`SummaryPanelVariant`、`SummaryPanelLayoutMode`、`BackgroundWork`、`RunningSubagent`、`SummaryGoal`（型）。
形状核验：与 Conversation 镜像逐字段同形（GitSummary.branchName 属主侧已含 | null，见 item 17）→ Conversation 删 4 declare + 5 镜像类型，改 `import { … } from './TopBar'` type 接线；既有 `as GitSummary` / `as SummaryPanelVariant | null` 边界铸保留（仍合法）。

### item 47 — UsageStatsUiParts TooltipRoot + useControllableState ✅
属主：`useControllableState` 改 `export declare`（原 fa = dist-DJJArJ7D.js p 导出，未转录，按 MarkdownVendored 惯例接口级导出）；`InfoTooltip` 已导出（原 Ia = u 导出）。
**Composer**：TooltipRoot declare 删除 → `import { InfoTooltip as TooltipRoot }`（4 处调用面 5180/5518/5537/8031 title/shortcut 形吻合）。
**附带修正（束真对齐，必要）**：ContextUsageProvider（J4e@76079）处 `<TooltipRoot closeDelay={0} openDelay={0} {...rest}/>` 束真渲染 **dN = HoverCard root**（76086；dN@54538 data-slot=hover-card，非 Ia 族）——原重建误挂 TooltipRoot declare（Record 索引签名吸收了 delay 属性）。改接本文件既有 `HoverCardRoot` declare 并为其补 `openDelay?/closeDelay?`（radix HoverCard 透传面）。
**Conversation**：useControllableState declare 删除 → `import { useControllableState } from './UsageStatsUiParts'`（两调用面 1579/1580 兼容：defaultProp 均显式传递）。
**结构注记（不属本波次）**：Composer 调用面以 `<TooltipTrigger asChild>` 作 InfoTooltip 子，而 InfoTooltip 自带 ShadcnTooltipTrigger asChild 包裹——类型安全，运行时嵌套语义留待结构性波次核验。

### item 50 — PaymentDeep formatGrantUnits 参数序 ✅（仅此项）
两处调用面改 `(value, locale)` 序（bundle PXt@189694：`PXt(e, t) => ja(t, e)`，value 在前）：`formatGrantUnits(entry.grantUnits, locale)`（startPlanEntitlementRowsOf）、`formatGrantUnits(total, locale)`（startPlanSummaryOf）。PaymentDeep 其余错误未触碰（30 → 28，恰为基线 9311/9324 两错消除）。

## 跳过项
本波次**无整项跳过**。局部保留（均已记录于上文）：item 13 调用面 `as never` 桥接（镜像状态形分歧）；item 20 保留 2 处双铸（4090 frame / getSessions 公共边界）。pass 1 跳过项（23/29/31-partial/33/34）未触碰。

## 编辑文件（21）
属主：Composer.tsx、Modals.tsx、TopBar.tsx、BrowserPane.tsx、QuickPickDeep.tsx、FileRewindDialogDeep.tsx、UsageStatsUiParts.tsx、PaymentDeep.tsx
消费面：Settings.tsx、SettingsPanels.tsx、AppRootLeaves.tsx、OnboardingLoginLeaves.tsx、SettingsLeaves.tsx、ExtendedViews.tsx、Home.tsx、GitReview.tsx、CodeViewer.tsx、stores-workspace.tsx、Conversation.tsx、ConversationLeaves.tsx、services.tsx
（SidePanel/WorkspaceShell/Sidebar 未编辑，错误减少纯属属主变更红利。）

## 接线/导出计数
- 新增属主导出 **29**：值 16（Composer 9：ModelSelector/BackgroundWorksCapsule/ComposerInput/useIsMobileTextInputViewport/appendWebElementsToContent/nanoid/loadSkillContext/dispatchWebElementAddEvent/isWebElementAddDetail；Modals 2：Progress/ConfirmDialog；TopBar 2：buildSummaryPanelModel/resolveSummaryPanelVariant；QuickPickDeep 0；FileRewindDialogDeep 2：FileOpenWithMenu/buildFilePreviewSource；UsageStatsUiParts 1：useControllableState）+ 类型 13（Composer 5：ModelGroup/BackgroundWork/WebElementContext/AppSlashCommand/ComposerEditorApi；Modals 1：BaseServices；TopBar 6：GitSummary/SummaryPanelVariant/SummaryPanelLayoutMode/BackgroundWork/RunningSubagent/SummaryGoal；QuickPickDeep 1：SessionIndexRow）。
- 消费面接法 **14 处**（16 符号）：Settings 1、SettingsPanels 1、AppRootLeaves 1、OnboardingLoginLeaves 1、SettingsLeaves 1、ExtendedViews 1（import 扩展）、Home 1（既有 import 生效 + 边界桥接 5）、GitReview 1（2 符号）、CodeViewer 1、stores-workspace 1、BrowserPane 1（2 符号别名）、Conversation 3（9 符号：45/46/47 三批）、ConversationLeaves 1、services 1（type import）。
- 删除 declare **15** + 镜像类型/接口 **6**（Conversation 5 + GitReview 1），全部留 tombstone 注记。

## tsc 前后（基线 /tmp/tsc-now9.txt → 本波次终值）
**项目总数：538 → 528（−10）**

| 文件 | 前 | 后 | 说明 |
|---|---|---|---|
| PaymentDeep | 30 | 28 | item 50 两错消除 |
| ExtendedViews | 75 | 74 | TS2459 ModelSelector 清除 |
| Home | 10 | 8 | 2×TS2459 清除 |
| SidePanel | 20 | 16 | TS2459 + items 18/19 三错（3870/4274/4369） |
| WorkspaceShell | 67 | 66 | item 46 红利（3559 GitSummary 对齐） |
| 其余全部文件 | — | 不变 | 含所有 0 基线编辑文件（Composer/Modals/BrowserPane/QuickPickDeep/FileRewindDialogDeep/GitReview/CodeViewer/stores-workspace/AppRootLeaves/OnboardingLoginLeaves/Conversation/ConversationLeaves/services 保持 0） |

无任一文件增加（全量逐文件比对核验）。

## 门槛结果
- **a. esbuild**：21 个编辑文件逐一 `--loader:.tsx=tsx --jsx=preserve` → 全部 0 错误 ✅
- **b. tsc --noEmit**：538 → 528；编辑文件无增加 ✅
- **c. md5**：src-HCld2afU.js = `f5edd6a1207c6d20008204829dad3923`；styles-CdEGpc2x.js = `48d71d4874b0868d61fd35a328bf6ad5` ✅（out/ 未动）
- **d. git status**：modified 路径全部位于 desktop/src/src/ 下 ✅（A0-CLEANUP-WORKLIST.md 的 M 状态为会话开始前既有，本波次未编辑该文件）

## 发现（供后续波次）
1. **GitReview buildOutboundContentWithAttachments 错位**：重建缺代码评论级且参数移位，已按 GXe@68833 修正——提示其他「接口级 declare 组合体」可能存在同类移位。
2. **Composer TooltipRoot declare 一形盖两物**：Ia（InfoTooltip，title/shortcut 面）与 dN（HoverCard root，openDelay/closeDelay 面）被同一 declare 吸收；dN/fN/pN = hover-card 三件（Modals.tsx 头注已有登记）。GitReview:324、PaymentDeep:248 仍存同类 TooltipRoot declare（非本波次消费面，未动）。
3. **接口 vs 索引签名**：interface 无隐式索引签名 → 不可赋给 `{[key:string]: unknown}` 面；但 `as` 可比性宽于可赋性（可选→必填、索引签名缺失在可比关系均放行），单铸合法性以实测为准（本波次两处实测：SelectGroupEntry↔ModelGroup 可；ModelSelectGroup→ModelGroup 不可）。
4. **ConversationLeaves E_t ≠ FileRewindDialogDeep __t**：同名 buildFilePreviewSource 为两个束符号（94854 vs 110410），形参不同，不可合并。
5. **范围外遗留 declare**（登记备查）：useConfirmDialog（U2）于 AppRootLeaves/TopBar/SidebarLeaves/ExtendedViews；uid 于 SidePanel/TerminalPane；NestedTooltipRoot 于 Composer。
6. **stores-workspace useSkillContextStore 与 Composer useSkillContextStore 同源**（UB@63640 双重建），前者为接口级镜像；后续波次或可整体改接属主。
