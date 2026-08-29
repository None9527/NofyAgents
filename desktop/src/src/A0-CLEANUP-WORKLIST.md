# A0 收尾接线 pass —— 合并工作清单

> 生成时机：S2-a/b/c/d/e + D-Settings/Viewers/Shell/Services 已完工验证；
> D-Conversation、D-Misc 在编。本清单在两个在编批次落地后执行。
> 纪律：属主补 export 与消费方改指同一 pass 内成对完成；逐文件 esbuild 门 + 项目 tsc 只降不升 + out/ md5 不变。

## A. 族级 declare 清理（导出面已就绪）

| 族 | 属主与导出面 | 消费方规模 | 动作 |
|---|---|---|---|
| Button/buttonVariants/createLucideIcon | `./button`（L350 语义导出行已加） | ~29 文件 | 删本地 `declare const Button: any` 等 → `import { … } from './button'` |
| Tooltip/TooltipTrigger/TooltipContent/TooltipProvider | `./UsageStatsUiParts`（4 名已补导出，定义 L316/388/469/567） | 待 grep 清点 | 同上 |
| workspaceKey | `./SkillStore` 的 `resolveWorkspaceKey`（bundle b/H 实证） | 待 grep 清点 | declare → import + 调用点改 `resolveWorkspaceKey(…)` |

## B. 属主补 export（各批「需要的 export」合并；★=在编批次属主，须等落地）

### SkillStore.tsx（D-Shell #1–4、D-Services ⑥⑨）
1. `logger` 导出（L154 私有 declare；惯例 `import { logger } from './SkillStore'`，38 文件已用）→ 消域内 7 文件 TS2459
2. curried `create` 重载补 `()` 零参签名（~L276）→ Home off-peak 块 ~30 错
3. `TaskMeta.unreadAt?: number` → `number | null`；导出 `TaskMeta`/`TaskStore`/`TaskStoreState`（L399–414/3239）→ Sidebar ×6、WS 4375/4393、EV 2263/4849
4. 导出 `WhiteboardStroke`（L3282）/`WhiteboardBoard`（L3290）→ EV 3919/3955/3989
5. 导出 `GroupedDraftPlacement` interface（L422）→ AppRootLeaves 具名化
6. 导出 `SkillsService` 内部型（L4209）→ StoresDeep 静态面对齐前置

### SrcSharedA.tsx（D-Shell #6、D-Settings、D-Services ①）
7. `providerIds`（L5680）→ Home/EV/Settings/SettingsPanels/Data/Capability/StoresDeep（PROVIDER_IDS 族、PROVIDER_IDS_ZAI/BIGMODEL_CODING_PLAN）
8. `GLM_REASONING_LEVELS`（L5708）→ SettingsLeaves MAX_THINKING_LEVELS
9. `USAGE_REPORT_RANGES`（L4571）→ SettingsPanelsData APP_USAGE_RANGES

### ★ Composer.tsx（D-Shell #5、D-Viewers #2–3、D-Services ②）——等 D-Conversation
10. `ModelSelector`（L8248）、`BackgroundWorksCapsule`、`ComposerInput`、`useIsMobileTextInputViewport` → TopBar/Home/SidePanel/EV/SettingsLeaves
11. `appendWebElementsToContent`（L7411）→ GitReview
12. `nanoid`（L5607）→ CodeViewer uid 接线前置
13. `loadSkillContext`（L1131）→ stores-workspace

### ★ Modals.tsx（D-Shell #7、D-Settings、D-Services ⑧）——等 D-Conversation
14. `canOpenRemoteSessionSourceCheck`（L673）→ TopBar 129/Sidebar 194/Settings
15. `Progress`（L617）→ SettingsPanels
16. `BaseServices` interface（L242，可选）→ AppRootLeaves DirectoryBrowserDialog 去双重断言

### ★ Conversation.tsx（D-Shell #9）——等 D-Conversation
17. `GitSummary.branchName: string` → `string | null`（L424）→ WS 3571

### ★ BrowserPane.tsx（D-Shell #10–11）——等 D-Misc
18. `useScreenshotSurfaceRequest` 实收 tabs 数组（bundle SWt styles-178517）→ SidePanel 3876
19. `BrowserView.faviconUrl?: string` → `string | null`（L246）→ SidePanel 4375

### ★ QuickPickDeep.tsx（D-Services ⑦）——等 D-Misc
20. 导出 `SessionIndexRow`（L255）；`INITIAL_SESSION_INDEX_STATE.logEpoch` → `string | null`（L935/981，bundle hke@styles33313）→ services 5 处 `as unknown as` 收窄

### 其余属主（非在编）
21. FileTreePanel.tsx：`FileTreePanel` 组件导出 + `InstalledEditor.iconDataUrl?: string`（L181）→ Sidebar 191、TopBar 去断言（D-Shell #8）
22. Settings.tsx：`ThemeMode` 导出（L320）→ WS 5473、CodeViewer/GitReview 去 cast（D-Shell #12、D-Viewers #6）；并与 stores-core `theme` 型对齐
23. SettingsLeaves.tsx：`OffPeakTaskEditor.showToast` 返回 `string` → `number`（L5033）→ EV 6284（D-Shell #13）
24. RemoteWizard.tsx：`RemoteWorkspaceSessionLike` 导出（L228）→ Home 1377（D-Shell #14）
25. ImeComposition.tsx：`PopoverAnchor` 收透传 props（bundle FBt styles-158095，L347）→ Sidebar 2703（D-Shell #15）
26. SidePanel.tsx：`normalizeDecodedSource` 导出（L942）→ CodeViewer（D-Viewers #1）
27. TopBar.tsx：`GitBranchChipProps.popoverSide` 收录 `"left"`（L2465）→ GitReview 4154 唯一残留错（D-Viewers #4）
28. UsageStatsUiParts.tsx：`InfoTooltipProps` 加 `aria-pressed`（L924）→ FileTreePanel Tooltip→InfoTooltip 前置（D-Viewers #5）
29. pptxRendererPreviewEngine.tsx：`isMediaPath` 导出（L132）→ MarkdownIntegration（D-Viewers #7）
30. PaymentDeep.tsx：`useCodingPlanEntitlements`（L9910）→ SettingsPanels；`CodingPlanUpgradeDialogProvider`（L10492）→ AppRootLeaves
31. ExtendedViews.tsx：`OffPeakCreateButton`（L5154）、`SCHEDULED_TEMPLATES`（L5332）、`buildAutomationModelSelectGroups`（L5642）、`OffPeakTaskList`（L1007）→ SettingsPanelsCapability
32. WorkspaceShell.tsx：`CLOSE_ACTIVE_CONTEXT_EVENT`（L4859）→ AppRootLeaves
33. appUsageDailyModelBarChart / appUsageModelUsagePieChart / codingPlanUsageLineChart：Lazy 包装导出 → SettingsPanelsData 三个 Lazy*（D-Settings）
34. Sidebar.tsx：xIt/vIt（moveGroupOver/placeTaskOutsideGroup）物化后导出 → QuickPickDeep L300–322 改指（D-Shell #16）

### D-Misc 批新增（17 项，与上文重复者并入）
35. Modals.tsx：`ConfirmDialog`（q4t，206572）export；`AppDialogHost` children 改可选（bundle P9 @styles 206992）【★等 D-Conversation】
36. WorkspaceShell.tsx：WorkspaceShellProps 补 `baseFeedbackService`/`remoteConnectionLogs`/`remoteConnectionInProgress`/`onReturnToWorkspace`（bundle XJt @styles 186515–186552）；`onCreateScratchWorkspace` 型改 `(name: string) => Promise<string | null>`；`WorkspaceServices` 类型 export
37. Settings.tsx：`Alert` 补 `warning` 变体（@styles 202627）；`TabsTrigger` 补 `asChild`；`TabsContent` 补 `forceMount`（radix 语义）
38. ImeComposition.tsx：`usePlatformService`/`SpinnerIcon`/`InfoIcon` export → UsageDeep/BrowserPane/TerminalPane
39. MarkdownIntegration.tsx：`getLastEditorId`/`setLastEditorId` export → FileRewindDialogDeep
40. services.tsx：`SessionIndexScope.workspacePath` 改可选（bundle GS@styles 35529 只传 workspaceKey+endpointKey）→ QuickPickDeep 2 处断言收窄
41. GitReview.tsx：`openFileChangeInViewer`/`toWorkspaceRelativePath` export → FileRewindDialogDeep
42. ★ Composer.tsx：`addWebElementContextToChat`/`validateWebElementContext` export → BrowserPane【等 D-Conversation】
43. SidebarLeaves.tsx（或相应属主）：ProcessMonitor 3 个 font-size 函数实体化/export
44. Settings 域：`useSettingsStoreValue`（Ao 1301）/`useOptionalServices`（ps 2643）实体化/export → UsageDeep
（D-Misc #2 PaymentDeep CodingPlanUpgradeDialogProvider = 上文 #30；#3 WorkspaceShell CLOSE_ACTIVE_CONTEXT_EVENT = 上文 #32）

### D-Conversation 批新增（13 项）
45. FileRewindDialogDeep.tsx：`FileOpenWithMenu`（L694）、`buildFilePreviewSource`（L652）export → Conversation/ConversationLeaves
46. TopBar.tsx：`buildSummaryPanelModel`（L2782）、`resolveSummaryPanelVariant`（L2811）、type `SummaryPanelVariant`/`SummaryPanelLayoutMode`/`BackgroundWork`/`RunningSubagent`/`SummaryGoal`/`GitSummary`（L2719–2743/219）export → Conversation 删 4 条镜像 declare + 8 镜像类型改 type import
47. UsageStatsUiParts.tsx：`TooltipRoot`（title/shortcut/triggerRef 封装，原 Ia 族）、`useControllableState`（原 fa，dist-DJJArJ7D.js p）export → Composer/Conversation
48. 横切层（属主待定位，bundle src 23084/20269 一带）：`classifyToolCall`(og)/`extractRawFileSummaries`(_g)/`parseToolCallRaw`(hg)/`isPlainRecord`(pg) → Conversation/ConversationOverlays
49. Settings store 族：`useSettingsSelector`（Ao，src-HCld2afU.js）属主定位后 export → Overlays/SidePanel/GitReview 三处同形 declare
（注意：上文 #17 Conversation GitSummary.branchName 与 #46 TopBar GitSummary 属主关系需在落地时复核——D-Conversation 报告称 Conversation 为本地镜像、TopBar 为属主）

### PaymentDeep 追补（无批次覆盖，12,066 行）
50. PaymentDeep.tsx：2 处 `formatGrantUnits` 调用面参数序翻正为 `(value, locale)`（bundle PXt；D-Misc 批登记）
51. PaymentDeep.tsx：~26 处 TS2339（paymentService 型为 `{}`）待 §C BaseServices 服务类型化后消解；其余 2 处随核

## C. 类型收敛（属主侧，非缺 export）
- stores-core：`SettingsState.theme` → `ThemeMode`；`BaseServices` 服务类型化（消 TS18046 族）
- stores-tasks：`AutomationRun` 增补 `trigger`/`sessionId`
- stores-workspace：`PluginsState.installedPlugins` 收窄
- StoresDeep ↔ SkillStore/stores-* 静态面三组对齐（D-Services §5.2 ①–③；依赖 B-6 SkillsService 导出）

## D. S2-c 遗留
- C4 四项属主未转录：Kp/Ip/Sp/Rp 保留 declare（待实体化）
- 跨批/他 chunk declare 36 项（逐件文件内注记）
- batch-B qg…e_/m_/p_ 重复副本：消费侧已改指 C5，副本实现本体待删/改指（S2-c §9 后续）

## E. 待实体化（无属主横切层，仅登记）
D-Viewers §5 清单（Jo joinPath/sae/Yo/useIntlContext/mc/pc/GitReview 钩子族/CodeViewer uid 族/vendored mermaid·shiki·katex/F01 任务态×9 等）+ D-Services ⑩–⑫（F04 TabStore/键盘助手/遥测/schemas/帧助手/MCP 24015–25006/CodeViewer 68500 区/ZS 族）。
