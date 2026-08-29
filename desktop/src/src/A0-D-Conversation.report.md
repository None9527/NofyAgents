# A0-D-Conversation 批次报告（Stage A0 · declare 接线 + 类型收敛）

工作目录：/Users/mac/nofy-build · 基线：S2-d 之后磁盘状态（A0-S2d.report.md 已读）
任务域：Conversation.tsx / ConversationLeaves.tsx / ConversationOverlays.tsx / Composer.tsx / Modals.tsx / ModalsLeaves.tsx

## 0. 结果总览

| 文件 | declare（行首口径）前→后 | tsc 前→后 | 说明 |
|---|---|---|---|
| Conversation.tsx | 165 → 164 | 46 → 0 | 删 5 declare + 新增 4 域外镜像 declare（TopBar/FileRewindDialogDeep 未导出，已登记） |
| ConversationLeaves.tsx | 124 → 121 | 9 → 0 | 会话流共享类型 canonical 属主；新增 5 个 type export |
| ConversationOverlays.tsx | 41 → 37 | 1 → 0 | 本地 ToolCall 族接口删除 → Leaves canonical |
| Composer.tsx | 145 → 138 | 17 → 0 | 含 useServices 裁决（4 调用面）与 ConfigSelect 值域收敛 |
| Modals.tsx | 37 → 31 | 2 → 0 | 含 useHeroTextSizes → ModalsLeaves canonical |
| ModalsLeaves.tsx | 6 → 4 | 0 → 0 | cn/useIntlContext 接线 |
| 合计 | 518 → 495 | **75 → 0** | 域内错误清零 |

接线总数：**值符号 30 + 类型符号 26 = 56 条 declare→import**，另有 4 处 `useWorkspaceServices()` 调用面改接 `useServices()`（fs 裁决，见 §5.3）、2 处 declare 删除（Conversation ShellToolView→本地实现、Composer Tooltip 孤儿）。
保留 declare：495 条（Lane-4 vendored + 域外未导出，分类见 §3）。
需要的 export：**13 项**（§4，按属主文件分组）。

## 1. 逐文件接线清单

### 1.1 Conversation.tsx
值接线：
- `cn` → `import { cn } from './UtilsCn'`（原 Z，utils-CEEH0K_K.js）
- `useIntlContext` → `import { useZCodeIntl as useIntlContext } from './I18n'`（原 G）；本地 `interface IntlShape` 脚手架删除 → `type ZCodeIntl as IntlShape`
- `Button`（+ButtonProps 脚手架）→ `import { Button } from './button'`
- `Tooltip`（title/description/shortcut 面）→ `import { InfoTooltip as Tooltip } from './UsageStatsUiParts'`
- `ShellToolView` declare 删除：`resolveToolCallView` 改返回本地 `ShellToolViewImpl`（尾部导出别名 `ShellToolViewImpl as ShellToolView` 保持外部名不变）

类型接线（收敛到 canonical 属主）：
- ← ConversationLeaves：`ToolCall/ToolCallNode/ToolCallViewProps/ToolDisplayModel/FileSummary/OpenCodeViewerFn/AutomationCardModel/PreviewCardModel`（本地同形接口/脚手架全部删除，tombstone 在位）
- ← MarkdownIntegration：`type CodePreviewSettings`（本地脚手架删除）/`type FileLinkModel`
- ← GitReview：`type AttachmentContextBundle`/`type FileRewindPreview`（本地 FileRewindPreview 删除，TS2440 消除）
- ← UsageDeep：`type BillingDiscountConfig`（SessionQuotaBanner prop 由 unknown 收敛为 `BillingDiscountConfig | null`）
- ← stores-session：`type SessionBinding`/`type WorkspaceScope`

新增镜像 declare（属主域外未导出，保留并登记 §4）：`FileOpenWithMenu`（loose 形）、`buildFilePreviewSource`、`buildSummaryPanelModel`、`resolveSummaryPanelVariant`（TopBar tlt/Uct 镜像签名）+ 镜像类型 `SummaryPanelVariant/BackgroundWork/RunningSubagent/SummaryGoal`（与 TopBar 2719–2743 逐字段同形，注释在位）。

错误修复要点：19 处 FC 类型不匹配（类型统一后消除）、`countContextAttachments(parsed as AttachmentContextBundle)`、MarkdownRenderer `onOpenFileLink` 边界断言（域内统一保持 `(path: string) => void`）、previewCards 链 `unknown[] → PreviewCardModel[]`（3 处 prop + buildAssistantPreviewCards 返回面）、`collectAutomationCards` 入参断言、buildSummaryPanelModel/ConversationSummaryAside 调用面 12 处值断言（镜像类型 → TopBar 类型边界）、`onSummaryPanelVariantOverrideChange` 两处 prop 面扩 `| null`（aside onVariantChange 传 `SummaryPanelVariant | null`；WorkspaceShell 传 `(variant: string|null)=>void` 逆变兼容，无外溢）、`onOpenPlanDetail` 两处 prop 面改 `(plan?: unknown) => void`（aside 期望 `()=>void`，可选参兼容）、`workspaceScopeKey(pane.workspaceScope as WorkspaceScope)`、`promotePaneLayoutToGroup(... as SessionBinding, useSplitLayoutStore.getState())`（bundle 裁决 §5.5）、SplitPaneHost declare `onSplit` 改签（§5.4）、Button 事件回调显式标注 3 处。

### 1.2 ConversationLeaves.tsx
值接线：`cn`→UtilsCn；`useIntlContext`→I18n（alias）；`Button`→button；`ToolLayout`、`ToolCallBlock`→Conversation；`MarkdownRenderer`、`baseName`、`joinWorkspacePath`→MarkdownIntegration。
类型接线：`type CodePreviewSettings/FileLinkModel`←MarkdownIntegration；`type ZCodeIntl as IntlShape`←I18n。
新增 export（会话流类型 canonical 属主）：`ToolCall`、`ToolCallNode`、`ToolDisplayModel`、`FileSummary`、`OpenCodeViewerFn`（`ToolCallViewProps` 原已导出）。本地 `CodePreviewSettings` 脚手架删除。
`FileOpenWithMenu`：曾试接 FileRewindDialogDeep，因该文件零 export 回退 loose declare（tombstone 注明），登记 §4。
错误修复：`childToolCalls = []` 解构缺省、`onOpenFileLink` 边界断言 2 处、`joinWorkspacePath(workspacePath as string, ...)`、`resolveHighlightTheme(..., codePreviewSettings ?? ({} as CodePreviewSettings))`、summaryAction useMemo 断言、2 处 Button 事件标注、`useWorkspaceInteractionNotifier` 内服务钩子改 `useServices()`（§5.3）。

### 1.3 ConversationOverlays.tsx
值接线：`cn`→UtilsCn；`useIntlContext`→I18n（alias）；`Button`→button；`ToolLayout`→Conversation（调用面 8 属性均在真实 ToolLayoutProps 面内）。
类型接线：`type ToolCall/ToolCallNode/ToolCallViewProps/FileSummary`←ConversationLeaves（本地三接口删除）；`type CodePreviewSettings`←MarkdownIntegration。
再类型化：`extractRawFileSummaries` declare 返回 `FileSummary[]`；`classifyPermissionToolView`/`buildPermissionToolViewProps` 的 `fileSummaries: FileSummary[]`；`buildPermissionToolViewProps` 内 `codePreviewSettings as CodePreviewSettings`；`toPermissionToolCall` 返回 `as ToolCall`（bundle zxt 116939 伪工具调用本就无 toolName，注释在位）。
错误修复：751 处 `<ToolView {...viewProps}/>` 联合组件 props 收敛随 canonical ToolCallViewProps 消除。

### 1.4 Composer.tsx
值接线：`cn`→UtilsCn；`useIntlContext`→I18n（alias）；`Button`→button；`TooltipTrigger`/`TooltipContent`→UsageStatsUiParts（radix 导出）；`workspaceKey`→`SkillStore.resolveWorkspaceKey`（alias，b 导出）。
删除：`Tooltip`（原 Ia title/shortcut 面）declare——全文件无调用面（孤儿），同形 InfoTooltip 已导出，注释在位。
调用面改接：4 处 `useWorkspaceServices()` → `useServices()`（bundle fs 裁决 §5.3）。
错误修复：
- 3 处服务解构断言（`skillsService as SkillsService` 形、`fileService.listWorkspaceFiles` 面、`promptAttachmentTransferService`，均 `as unknown as {...}` 二段）
- SelectTrigger `onPointerDown/onKeyDown` 事件标注 `React.PointerEvent/KeyboardEvent<HTMLButtonElement>`（Settings SelectTrigger 面为按钮原生事件）
- 2 处 SelectContent `onCloseAutoFocus` 改 spread 透传（Settings SelectContent 面未声明该 radix prop；spread 规避多余属性检查）
- ConfigSelect `triggerVariant/triggerSize` prop 值域收窄为 Settings SelectTrigger 的 union（调用面 PaymentDeep/SettingsLeaves 均为字面量，无外溢）
- `contentProps` 显式类型标注（字面量 `position: "popper"` 等不再宽化为 string）
- 4 处 Button `onClick` 事件显式标注（button.tsx ButtonProps 为 loose Record）
- 3 处 `<TooltipTrigger {...{ asChild: true }}>` spread 透传（UsageStatsUiParts radix TooltipTrigger 面未声明 asChild，内部 Slot 支持）

### 1.5 Modals.tsx
值接线：`cn`→UtilsCn；`useIntlContext`→I18n（alias）；`Button`→button；`createLucideIcon`→button（c 导出；`IconProps` 脚手架随删）；`Tooltip`→`UsageStatsUiParts.InfoTooltip`（alias；调用面 open/title/description/side/align 均在 InfoTooltipProps 面内）；`useHeroTextSizes`→`ModalsLeaves.useHeroThemeStyles`（alias，S4t canonical；4174 调用面用 heading/description，HeroThemeStyles 兼容）。
错误修复：2 处 `useServices() as unknown as BaseServices & { settingsSyncService: SettingsSyncService }` 二段断言（TS2352 按 tsc 提示经 unknown）。

### 1.6 ModalsLeaves.tsx
值接线：`cn`→UtilsCn；`useIntlContext`→I18n（alias）。`IntlShape` 脚手架删除。

## 2. 域内要点回扣
1. Composer 作为 ConfigSelect/Mq（76848–77167）、U3e/W3e/G3e（77062–77126）、popover 原语（76034–76156）canonical 属主：导出面未动（S2-d 已补齐），本批仅收窄 ConfigSelect 两个 prop 值域（调用面全为字面量，PaymentDeep 侧无新错）。
2. B5-09：域内 6 文件经 grep 核验**无** LegacyDocEngineC4 属主 declare（无 docx 语义消费），无需登记。
3. 前波属主全部接上：workspaceKey→SkillStore.resolveWorkspaceKey；Tooltip 族→UsageStatsUiParts；Button/buttonVariants/createLucideIcon→button.tsx；cn→UtilsCn；useZCodeIntl→I18n。

## 3. 保留 declare 及原因（495 条）
- **Lane-4 vendored（S3 换 npm，保留）**：
  - lexical 系（Composer ~25：LexicalNode/$getRoot/$* 等）
  - Icon*/*Icon（Conversation ~37、Leaves ~20、Overlays 9、Composer ~20、Modals 3）
  - radix/shadcn 原语：Conversation（HoverCard 三件、RadixCollapsible 三件）、Composer（DropdownMenu 12 件、SelectRoot、HoverCard 三件、PopoverRoot、ProgressRoot/Indicator、NestedTooltip 4 件、motion/AnimatePresence）、Modals（Dialog 7 件、HoverCard 三件、DropdownMenu 4 件、ProgressRoot/Indicator、CheckboxRoot/Indicator、Slot）、Leaves（Collapsible 三件、MotionPresence/motion）
  - useVirtualizer（Composer）、dnd 族（Conversation：DndContext/useSortable 等 8 条）
- **域外未导出（登记 §4 或属主待定位，保留）**：
  - Conversation：FileOpenWithMenu/buildFilePreviewSource（FileRewindDialogDeep）、buildSummaryPanelModel/resolveSummaryPanelVariant（TopBar）、classifyToolCall/extractRawFileSummaries（横切层）、useControllableState（UsageStatsUiParts）、parseUserInputContext/FilePath、chips 4 件、HomeDraftHeader/EmptyStateGreeting/BillingDiscountNote、tool 模型族（TOOL_STATUS_DISPLAY_MAP/resolveToolDisplayModel/buildPlanResultMarkdown 等）、用户输入族（MENTION_CHIP_*/splitUserInputParts 等）、useTelemetryPlatform/trackEvent/useOpenCodeViewerForReference
  - Leaves：FileOpenWithMenu、工具视图内部件（ToolCallExpandedContent/SnapshotRefsLoader/ToolErrorSurface/CodeSurface 6 件等）、agent/nodeRepl/mcp/skill 解析族、buildCommand/pendingCommandLedger、notifier 登记 4 件、patch/highlight 族、usePlatformService/useWorkspaceScopedServices/agent hooks
  - Overlays：useSettingsSelector（Settings 族）、isImeComposing、classifyToolCall/extractRawFileSummaries/parseToolCallRaw/isPlainRecord（横切层）、命令协议 2 件、交互模型族（isSwitchModePermissionRequest/SwitchModeHint/倒计时 2 件/elicitation 草稿 5 件/useNotificationEnabled/useTelemetryPlatform/useSnapshotInteractionToasts/useOverlayCommandEnvironment/taskElicitationDraftKeys）、captcha 族 6 件、useOverlayServices
  - Composer：whiteboard 族 6 件、subagent 族 3 件、workspace tabs 族 8 件、session registry 族 3 件、pptx 族 9 件、遥测/路径 2 件、usePlatformService、taskScopeSelector、TooltipRoot（登记 §4）
  - Modals：useZcodeSessionService/refreshSkillContexts/invalidateModelProviderSnapshot/workspaceBaseLabel/useImportSelections/useSessionMigrationScanner/ImportSelectionView/RemoteSyncMenuItemsInner
  - ModalsLeaves：resolveSystemThemeIsDark/DEFAULT_FILE_ICON_NAME/resolveFileIconName/serializeHast
- `declare ... any` 下游传播：域内已清零，无遗留；他域（如 Composer 域外消费面）不在本批。

## 4. 需要的 export（13 项）
| # | 属主文件（域外） | 符号 | 定义行 | 消费方（域内） |
|---|---|---|---|---|
| 1 | FileRewindDialogDeep.tsx | FileOpenWithMenu | 694 | Conversation、ConversationLeaves |
| 2 | FileRewindDialogDeep.tsx | buildFilePreviewSource | 652 | Conversation |
| 3 | TopBar.tsx | buildSummaryPanelModel | 2782 | Conversation |
| 4 | TopBar.tsx | resolveSummaryPanelVariant | 2811 | Conversation |
| 5 | TopBar.tsx | type SummaryPanelVariant | 2719 | Conversation（镜像中） |
| 6 | TopBar.tsx | type SummaryPanelLayoutMode | 2720 | Conversation（镜像中） |
| 7 | TopBar.tsx | type BackgroundWork | 2722 | Conversation（镜像中） |
| 8 | TopBar.tsx | type RunningSubagent | 2733 | Conversation（镜像中） |
| 9 | TopBar.tsx | type SummaryGoal | 2743 | Conversation（镜像中） |
| 10 | TopBar.tsx | type GitSummary | 219 | Conversation（本地镜像 branchName: string 窄形，结构兼容） |
| 11 | UsageStatsUiParts.tsx | TooltipRoot（title/shortcut/triggerRef 封装，原 Ia 族） | 未导出（实现位于该文件 Tooltip 区段） | Composer |
| 12 | UsageStatsUiParts.tsx | useControllableState（原 fa，dist-DJJArJ7D.js p 导出） | 未导出 | Conversation |
| 13 | 横切层（属主文件待 F07/横切批定位；bundle src 23084/20269 一带） | classifyToolCall(og)/extractRawFileSummaries(_g)/parseToolCallRaw(hg)/isPlainRecord(pg) | — | Conversation、ConversationOverlays |

另：Settings 族 `useSettingsSelector`（Ao，src-HCld2afU.js；Overlays/SidePanel/GitReview 三处同形 declare）属主候选为 Settings store 族，随横切/Settings 批定位后登记。
补 export 落地后建议：Conversation 删 4 条镜像 declare + 8 个镜像类型改 type import；Overlays/Conversation 横切 4 件改 import；Composer TooltipRoot 改 import。

## 5. 歧义裁决（AMBIGUOUS）
1. **cn（TSV AMBIGUOUS：SrcSharedB vs UtilsCn）** → 全部接 `UtilsCn.cn`。裁决依据：任务域要点指定 cn→UtilsCn；SrcSharedB 的 cn 同源（utils-CEEH0K_K.js）非属主。6 文件一致。
2. **Tooltip（TSV UNIQUE_ADDEXPORT UsageStatsUiParts）** → 调用面裁决：title/description/side/align/open 面 = `InfoTooltip`（X/u 导出）；UsageStatsUiParts 的 `Tooltip` 导出为 radix 根（children/open/delayDuration），形状不符。Conversation/Modals 接 `InfoTooltip as Tooltip`；Composer 的 Tooltip declare 无调用面（孤儿），删除。
3. **useWorkspaceServices() 零参（4 处于 Composer + 1 处于 Leaves）** → bundle 锚点：fs 定义 2675（`useContext(us)`，services.tsx 注释「原 fs：useServices」）；调用面 pqe 63492 / WB 63682 / AJe 65313 / attachment 67691 / eSt 117331 均为 `fs()` 零参。services.tsx 的 `useWorkspaceServices`（原 Oc）是带参解析面。裁决：改接 `useServices()`，语义与 bundle 逐字一致。
4. **SplitPaneHost.onSplit 签名漂移** → bundle 122015/122163：内部 C/w 回调按 `onSplit(paneId, 'row'|'column', workspaceScope)` 调用（与 stores-session.splitPane 同签）。基线 declare `(paneId, side: "right"|"down")` 为误记，按 bundle 改 declare。
5. **promotePaneLayoutToGroup 第二参** → bundle 123047/123060：传 `s2.getState()`（split store 全量 state = LayoutCore 形）；基线传 `rootPanes`（仅 panes 记录）为转录漂移（store 实现需要 layout.root，传裸记录运行时会坏）。按 bundle 改为 `useSplitLayoutStore.getState()`。此为语义级修正，特登记。
6. **createLucideIcon（Lane-4 名单与已知属主清单冲突）** → 任务域要点 3 明确 button.tsx 已导出且为前波成果优先接；S3 npm 化时不冲突。接 button.tsx。

## 6. 异常
1. §5.5 的 promotePaneLayoutToGroup 语义修正超出纯类型接线，已按 bundle 逐字基准裁决并在此明示。
2. PaymentDeep 新增 2 错（9310/9323，formatGrantUnits 签名）与本域无关——UsageDeep 并行批导出签名变化所致；本域对 PaymentDeep 的导出面（ConfigSelect/Badge 等）无新错。
3. 外溢核验：WorkspaceShell 68、SidePanel 20、Home 47、TopBar 16、QuickPick 0、UsageDeep 0、DiffsWorker 0——接线前后错误数全部不变，域内改动无外溢。
4. TooltipTrigger `asChild` 与 SelectContent `onCloseAutoFocus` 采用 spread 透传（属主面未声明）；若 UsageStatsUiParts/Settings 后续补声明，可去 spread。
5. WorkspaceShell(3577) 既有错 `handleOpenPlanDetail(planId?: string)` → 本域 prop 面：ConversationOrchestrator.onOpenPlanDetail 由 `(plan: unknown)=>void` 改 `(plan?: unknown)=>void` 后该处仍为同因错误（unknown ⊄ string|undefined），错误数不增，归属 WorkspaceShell 批。
6. 全项目 tsc 总数 657 → 582（含并行批变化；域内 75 → 0）。

## 7. 门禁自验记录（完工时点）
- a. esbuild 逐文件：6/6 OK（`--loader:.tsx=tsx --jsx=preserve --outfile=/dev/null`）
- b. tsc -p tsconfig.json：域内 6 文件 0 错（前 46/9/1/17/2/0 = 75）
- c. md5：out/renderer/assets/src-HCld2afU.js = f5edd6a1207c6d20008204829dad3923 ✓；styles-CdEGpc2x.js = 48d71d4874b0868d61fd35a328bf6ad5 ✓
- 未新增 @ts-expect-error/@ts-ignore；B5 头部注释与尾部符号表未动（tombstone 均为新增注释）。
