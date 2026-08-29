# A0-CLEANUP1 报告（收尾接线 pass）

执行范围：`A0-CLEANUP-WORKLIST.md` Section A 全部 + Section B items 1–9、21–34（★ 项跳过）+ Section C 中内嵌于 B-22 的 stores-core theme 对齐。D/E 仅参照。
基线：`/tmp/tsc-now7.txt`（项目总 582）。终态：`/tmp/tsc-final2.txt`（项目总 **538**）。

## 1. 逐条状态

### Section A（族级 declare 清理）— 全部完成

| 族 | 状态 | 接线文件（declare 删除 → 真实 import） |
|---|---|---|
| Button | done（22 文件） | ExtendedViews、TopBar、Settings、SidePanel、PaymentDeep、PreviewCards、Home、CodeViewer、SettingsPanels、RemoteWizard、SidebarLeaves、FileTreePanel、PdfViewer、WorkspaceShell、RemoteGapSegments、Sidebar、SettingsPanelsData、GitReview、WebRemote、SettingsLeaves、SettingsPanelsCapability、pptxPreviewViewer |
| buttonVariants | done（1） | Sidebar |
| createLucideIcon | done（8） | ExtendedViews、TopBar、SidePanel、RemoteWizard、WorkspaceShell、RemoteGapSegments、WebRemote、pptxPreviewViewer |
| button chunk 图标（ChevronLeft/Right、ZoomIn/Out） | done（9 线） | PdfViewer（4：原 u/l/c/s = s/o/i/a 导出）、RemoteGapSegments（IconChevronRight = 原 wa=o）、pptxPreviewViewer（4） |
| Tooltip → InfoTooltip | done（8） | ExtendedViews、TopBar、Settings、SidePanel、Home、SidebarLeaves、FileTreePanel、Sidebar（调用面均 title/shortcut/side/align/triggerClassName 形 = first-party InfoTooltip；沿用既有 `import { InfoTooltip as Tooltip }` 惯例） |
| TooltipProvider | done（2） | SidePanel（原 Na=Ce）、AppRootLeaves |
| workspaceKey（双参）→ `resolveWorkspaceKey as workspaceKey` | done（2） | WorkspaceShell、Sidebar（与 QuickPick/FeedbackCenter 参照式一致） |
| workspaceKey（对象参，原 Ti=ip 6913）→ `automationsWorkspaceKey as workspaceKey` | done（1） | SettingsLeaves（属主 SrcSharedB L3043，services.tsx tombstone 佐证） |

注：WorkspaceShell `workspaceKeyOf2`（~L4855）为不同符号，未动；AppRootLeaves `LucideProvider` declare 属图标族非本族范围，未动。

### Section B items 1–9

| # | 状态 | 说明 |
|---|---|---|
| 1 | done（前批已落地，本批复核） | `export { logger };` 已存在于 SkillStore；无需动作 |
| 2 | done（按规格原样） | SkillStore curried `create` 补第三重载 `<T>(): (createState) => ReturnType<typeof createBoundStore<T>>`（D-Shell bundle 实证）；Home 47→10 |
| 3 | done（按规格原样 + 邻接） | `TaskMeta.unreadAt?: number | null`；`export type { TaskMeta, TaskStore, TaskStoreState, ... }`；**额外**加入 `WorkspaceTaskState`（EV createShallowSelectorFactory 邻接必需） |
| 4 | done | `WhiteboardStroke`/`WhiteboardBoard` 入 export type 行；EV 本地副本删除 |
| 5 | done | `GroupedDraftPlacement` 导出；AppRootLeaves 两处内联字面量具名化 |
| 6 | done（仅属主侧） | `SkillsService` 入 export type 行；消费侧 StoresDeep 静态面对齐属 Section C，未执行 |
| 7 | done | `providerIds` 已导出（SrcSharedA L5817）；消费接线：Settings（ModelProviderId declare 删）、SettingsPanels（PROVIDER_IDS）、Capability（PROVIDER_IDS_ZAI/BIGMODEL_CODING_PLAN 改 `providerIds.zaiCodingPlan/.bigmodelCodingPlan`）；Home/EV 已先行接入 |
| 8 | done | `GLM_REASONING_LEVELS as MAX_THINKING_LEVELS`（+ `isGlmModelId as isMaxThinkingModel`）→ SettingsLeaves；declare 删 |
| 9 | done | `USAGE_REPORT_RANGES as APP_USAGE_RANGES` → SettingsPanelsData；declare 删 |

### Section B items 21–34

| # | 状态 | 说明 |
|---|---|---|
| 21 | done | FileTreePanel `export interface InstalledEditor { id; name; iconDataUrl?; [key: string]: unknown }`（组件本体早已导出）；TopBar 本地别名删除 + `resolveAvailableEditors` 调用去断言 |
| 22 | done | Settings `export type ThemeMode`（5 值）；CodeViewer/GitReview `resolveTheme` cast 删除；stores-core theme 对齐（见 Section C 行）；级联修复 WebRemote（`import type { ThemeMode }` + 1 处边界 cast，`MOBILE_THEME_OPTIONS.includes` 守卫内）。验证：GitReview 唯一基线错（4154 `"left"`）消解，1→0 |
| 23 | skipped（按字面）/ 已满足 | 收紧为 `number` 会击穿 Capability 的 `showToastWithAction`（string 返回，src-reconstructed L4102 地面真值实证）；回退保留 `(message: string, options?: any) => string \| number` 并集 —— EV（number 返回）与 Capability（string 返回）同时满足。记录为并集即目标态 |
| 24 | done | RemoteWizard `export interface RemoteWorkspaceSessionLike`；级联接线 WS props → Home WorkspaceSelectionRow → AppRootLeaves（RemoteSessionEntry[] 可赋值：`target: any` + 索引签名） |
| 25 | done | ImeComposition `PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Anchor> & Record<string, unknown>)`（Sidebar 2703 onOpenChange 透传） |
| 26 | done | SidePanel `export function normalizeDecodedSource<T extends { title: string }>(source: T): T`（泛型恒等，两侧调用面 CodeViewerSource/CodeViewerSourceInput→DecodedCodeViewerSource 均满足）；CodeViewer declare 删 → 真实 import（运行时环 SidePanel↔CodeViewer 两侧均延迟使用，可接受） |
| 27 | done | TopBar `popoverSide?: "top" \| "bottom" \| "left"` |
| 28 | done | UsageStatsUiParts `InfoTooltipProps` += `"aria-pressed"?: boolean`（FileTreePanel 前置；实测 aria-pressed 传面在 Button，InfoTooltip 侧为型面补齐） |
| 29 | **skipped — 误归属** | MarkdownIntegration 原 aA（js 50241）是 MarkdownImage 的扩展名媒体判定，与 pptx 原 b 的 `ppt/media/` 前缀判定（pptxRendererPreviewEngine isMediaPath）非同函数；接线会引入错误语义 |
| 30 | done | PaymentDeep `export useCodingPlanEntitlements`（L9642 区）+ `export CodingPlanUpgradeDialogProvider`；SettingsPanels / AppRootLeaves 接线 |
| 31 | **partial** | `OffPeakCreateButton`、`SCHEDULED_TEMPLATES` 导出并接线 Capability（declare 删）。**skipped**：`buildAutomationModelSelectGroups`（EV 形参 `displayOrder: string[]` vs Capability bundle 实参 `{providerIds: string[]; updatedAt?: number} \| null`，型冲突）；`OffPeakTaskList`（全库无实现，EV/Capability 均为 declare，物化=转录非接线）——Capability 该两条 declare 保留并加注记 |
| 32 | done | WorkspaceShell `export const CLOSE_ACTIVE_CONTEXT_EVENT = "zcode:close-active-context-request"`；AppRootLeaves 接线 |
| 33 | **skipped — 型冲突级联** | 三 Lazy chart 的 prop 型（UsageSnapshot/ModelUsageSnapshot/{xTime: string[]…}）与 SPData `AppUsageSnapshot [key: string]: unknown` 结构不兼容；接线即增 ≥3 错，对齐需级联进 useAppUsageStats |
| 34 | **skipped — 实体未物化** | moveGroupOver/placeTaskOutsideGroup（xIt/vIt）仅存于 chunk 符号表，Sidebar 无实体；地面真值保留 declare；物化属转录非接线 |

### ★ items 10–20、35、42 — 全部跳过（在编批次属主，按指令）

### Section C
跳过；唯一执行项为 B-22 内嵌的 stores-core theme 对齐（判定为 trivial）：`import type { ThemeMode } from './Settings'`（type-only 避免运行时环），`SettingsState.theme: ThemeMode`、`setTheme(theme: ThemeMode)`，3 处边界 cast（localStorage 读取归一、setTheme 归一、IPC message.payload）。其余 C 项（BaseServices 类型化、stores-tasks/stores-workspace 收窄、StoresDeep 三组对齐）未动。

## 2. 编辑文件（27）

modules/: AppRootLeaves.tsx、CodeViewer.tsx、ExtendedViews.tsx、FileTreePanel.tsx、GitReview.tsx、Home.tsx、ImeComposition.tsx、PaymentDeep.tsx、PdfViewer.tsx、PreviewCards.tsx、RemoteGapSegments.tsx、RemoteWizard.tsx、Settings.tsx、SettingsLeaves.tsx、SettingsPanels.tsx、SettingsPanelsCapability.tsx、SettingsPanelsData.tsx、SidePanel.tsx、Sidebar.tsx、SidebarLeaves.tsx、SkillStore.tsx、TopBar.tsx、UsageStatsUiParts.tsx、WebRemote.tsx、WorkspaceShell.tsx、pptxPreviewViewer.tsx、stores-core.tsx

硬排除文件（Conversation/ConversationLeaves/ConversationOverlays/Composer/Modals/ModalsLeaves、A0-PROGRESS.md、src-reconstructed/、out/）零触碰；无 git commit。

## 3. 数量

- **Wires（declare/本地垫片 → 真实 import）**：71（Section A 族 53：Button 22 + buttonVariants 1 + createLucideIcon 8 + button 图标 9 + Tooltip 8 + TooltipProvider 2 + workspaceKey 3；Section B 消费侧 18：AppRootLeaves 3、SettingsPanels 2、Capability 4、SettingsLeaves 1、SettingsPanelsData 1、Settings 1、TopBar 1、CodeViewer 1、EV 本地型 4）。tombstone 注记 45 处（23 文件）。
- **Export adds（属主侧）**：13 文件 —— SkillStore（create 零参重载 + unreadAt 型 + 8 个 type export）、PaymentDeep（2 函数）、RemoteWizard（RemoteWorkspaceSessionLike）、FileTreePanel（InstalledEditor）、Settings（ThemeMode）、ImeComposition（PopoverAnchor 形参扩展）、SidePanel（normalizeDecodedSource）、TopBar（popoverSide + "left"）、UsageStatsUiParts（aria-pressed）、ExtendedViews（OffPeakCreateButton + SCHEDULED_TEMPLATES）、WorkspaceShell（CLOSE_ACTIVE_CONTEXT_EVENT）、stores-core（theme: ThemeMode）、WebRemote（ThemeMode 边界 cast，级联修复）。

## 4. tsc 前后（基线 /tmp/tsc-now7.txt → 终态 /tmp/tsc-final2.txt）

项目总：**582 → 538**（−44）。中途快照 542 → 532 → 541 → 569（569 含本批 Button 接线副作用 + 在编批次于排除文件的并行改动波动；随后本批修复至 538）。

触及文件（全部 ≤ 基线，无增加）：

| 文件 | 基线 | 终态 | 文件 | 基线 | 终态 |
|---|---|---|---|---|---|
| ExtendedViews | 80 | **75** | SettingsLeaves | 2 | 2 |
| Home | 47 | **10** | SettingsPanels | 44 | 44 |
| WorkspaceShell | 68 | **67** | SettingsPanelsCapability | 168 | 168 |
| GitReview | 1 | **0** | SettingsPanelsData | 6 | 6 |
| Sidebar | 30 | 30 | SidePanel | 20 | 20 |
| SidebarLeaves | 11 | 11 | TopBar | 16 | 16 |
| PaymentDeep | 30 | 30 | UsageStatsUiParts | 3 | 3 |
| Settings | 52 | 52 | 其余 12 文件 | 0 | 0 |

## 5. 门结果

- **a. 逐文件 esbuild**：27/27 通过（0 错），两轮（注解修复前后各一轮）。
- **b. tsc --noEmit**：项目总 582 → 538；每一编辑文件 per-file 错误数 ≤ 基线（4 文件下降，其余持平）。
- **c. out/ md5**：`f5edd6a1207c6d20008204829dad3923` / `48d71d4874b0868d61fd35a328bf6ad5` —— 两次核验均不变。
- **d. 作用域**：`git status --porcelain | grep -v '^??'` 全部 27 条修改路径均在 `desktop/src/src/` 下，无越界。

## 6. 发现（误归属 / 型冲突 / 其他）

1. **Button 型面副作用（已修复）**：真实 Button 的 `ButtonProps extends Record<string, unknown>`（与 src-reconstructed 地面真值逐字一致，故不改属主）丢失事件处理器上下文类型，接线后 7 文件新增 26 处 TS7006 + SidePanel 空态图标表 5 处 TS2322（ForwardRefExoticComponent ↛ FC<IconProps>）。修复：26 处最小参数注解（`React.MouseEvent<HTMLButtonElement>` / `React.PointerEvent<HTMLButtonElement>`，不改函数体、不改局部名）+ SidePanel 图标表注解改 `ReturnType<typeof createLucideIcon>`（与 EV 图标表同策）。
2. **item 29 误归属**：见上表；两个 isMediaPath 语义不同（扩展名判定 vs `ppt/media/` 前缀判定）。
3. **item 31 两处型冲突**：buildAutomationModelSelectGroups 形实参不兼容；OffPeakTaskList 无实现本体。
4. **item 33 型冲突级联**：Lazy chart prop 型与 AppUsageSnapshot 索引签名不兼容。
5. **item 23 并集裁决**：`string | number` 为双语义并集（EV number / Capability string），字面 `number` 会击穿地面真值实参。
6. **未识别 tooltip 隙段 chunk**：GitReview（TooltipRoot/TooltipTrigger/TooltipContent，js 54784）与 PaymentDeep（TooltipRoot/TooltipTriggerAsChild/TooltipContent，原 Oa/Ma/ka）的 declare 属未识别 chunk，地面真值保留 declare —— 不在本族范围，未动。
7. **pptxPreviewViewer 头注字母表笔误**：其注释 `i→IconChevronLeft / s→IconZoomOut` 与 button.tsx 导出表（i=ZoomOut、s=ChevronLeft，PdfViewer 注释佐证）矛盾；语义接线（按组件语义名）不受影响。
8. **item 3 邻接扩充**：export type 行加入 `WorkspaceTaskState`（EV 选择器工厂必需，超出清单字面）。
9. **item 1 前批已落地**：logger 导出已存在，本批仅复核。
10. **item 6 半程**：SkillsService 已导出；StoresDeep 消费侧对齐属 Section C，按指令未执行。
