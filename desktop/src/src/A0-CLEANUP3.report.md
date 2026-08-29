# A0-CLEANUP3.report.md — Pass 3（收尾接线）执行报告

日期：2026-08-29 · 基线：`/tmp/tsc-now10.txt`（项目合计 **528**）· 终值：**44**（`/tmp/tsc-pass3-mid33.txt`）
规则遵守：未重试 pass-1 跳过项 23/29/31/33/34；B5 约定（语义顶层名、不改函数体局部名、最小注记）；
未触碰 A0-PROGRESS.md / A0-CLEANUP-WORKLIST.md / src-reconstructed/ / out/；无 git commit；未新增 @ts-expect-error/@ts-ignore。

## 0. 结果摘要

| 指标 | 基线 | 终值 |
|---|---|---|
| 项目总错误 | 528 | **44**（-484，-91.7%） |
| 清零文件数 | — | 10（见 §4 表） |
| 单文件增长 | — | **0**（每个触碰文件终值 ≤ 基线） |
| 目标（<~350） | — | 远超（44） |

## 1. Phase 3a — 机械 export/shape 项（全部完成）

| 项 | 内容 | 状态 |
|---|---|---|
| 36 | WorkspaceShell props/signature/WorkspaceServices export（54-TS2322 族） | ✅ WorkspaceShell 66→3（余 3 为登记在案的 3074/3114/3608，见 §6） |
| 37 | Settings Alert `warning` / TabsTrigger `asChild` / TabsContent `forceMount`（radix 语义） | ✅ |
| 38 | ImeComposition usePlatformService/SpinnerIcon/InfoIcon export | ✅ |
| 39 | MarkdownIntegration getLastEditorId/setLastEditorId export | ✅ |
| 40 | services SessionIndexScope.workspacePath 可选化 | ✅ |
| 41 | GitReview openFileChangeInViewer/toWorkspaceRelativePath export | ✅ |
| 43 | SidebarLeaves/owner font-size trio（ProcessMonitor） | ✅ |
| 44 | useSettingsStoreValue/useOptionalServices 实体化（stores-core） | ✅ UsageDeep 等已改接 |

D-Misc §5 登记的注册消费方均已按上表改接。

## 2. Phase 3b — BaseServices 服务具型（最大杠杆）

### 2.1 核心手法：`ResolvedBaseServices` 收窄
stores-core.tsx 新增：

```
export type ResolvedBaseServices = BaseServices &
  Pick<Required<BaseServices>, "settingService" | "systemService" | …（23 个热服务面）>;
```

运行期依据：启动即注册 + 断开连接的 Proxy 兜底 ⇒ 热服务面在「必有上下文」钩子下恒有值。
接线点（services.tsx）：`useServices()`、`useBaseServices()`、`ResolvedWorkspaceServices.services`、
`useWorkspaceServices()` 返回型全部改为 `ResolvedBaseServices`。
单此一举消除全部 60 个 TS18048（'possibly undefined'）并联动消除大量 TS2339/TS2322。

副作用处理：交叉型与 `as {x: T}` 直cast 不再「充分重叠」（10 处 TS2352，GitReview×3/
CmdkPaletteDeep×2/Bots/QuickPick/services/UsageDeep×2）→ 升级为 `as unknown as X` 并加 3b 注释。

### 2.2 BaseServices 字段具型（field → owner，完整表见 §3）
- 属主已重建者改为真实类型导入：SkillsService/CommandsService/PluginService/SubagentsService/
  McpSyncService（stores-workspace）、SettingService/SystemService/MemoryService（Settings）、
  AutomationsAgentService/OffPeakTaskService/ZCodeTaskService（stores-tasks）。
- 无属主类型者按消费面具型为结构面（内联于 stores-core）：modelProviderService/repoWikiService/
  hooksService/skillSyncService/pluginSyncService/credentialService/oauthService/settingsSyncService/
  zcodeSessionService；mcpSyncService/skillSyncService/pluginSyncService 按 Modals 同步对话框消费面
  补足远端同步方法。
- 方法面过宽者保留可调用索引签名兜底：codingPlanSubscriptionService/paymentService。

### 2.3 联动修复的重复类型族（双向可赋值对齐）
- McpServer 三元组（Settings ↔ SettingsPanels ↔ stores-workspace）：source/config/projectPath/
  authorization 对齐；McpServerConfig 补 type/headers/timeoutMs/oauth。
- ModelProvider（Settings ↔ SettingsPanels ↔ UsageDeep ↔ SettingsPanelsData）：endpoints: ProviderEndpoints、
  models: ModelMetadata[]、systemDisabledReason: string | null；SPD 本地 ModelProvider 立碑改引用。
- CodingPlan 族：renew/expire `number→string`（ISO，Date.parse 消费——地面真值实证）、
  quotaLimits→EntitlementQuotaLimit[]、SubscriptionSnapshot.quota | null、CodingPlanSource 对齐。
- Automation 三元组：统一 `ScheduleRule`（SettingsLeaves canonical，加 `[key: string]: unknown`）；
  StoresDeep.Automation.scheduleRule→ScheduleRule|null + nextRunAt/runCount；ExtendedViews.AutomationRecord
  cronExpr 必填 + scheduleRule?: ScheduleRule|null；SPC.AutomationTask.nextRunAt: number|null。
  ⚠ 发现：`Omit<带索引签名接口, K>` 会把成员塌缩为 unknown ⇒ scheduleRulePayload 改用
  `Pick<…> & Partial<ScheduleRule>`（SettingsLeaves +5 回归的根因与修复）。
- OffPeakTask ↔ OffPeakTaskRecord 对齐；OffPeakTaskService 补 `[method: string]: unknown`。
- AutomationsAgentService 补 createSession/closeSession/getModelTrajectory（SettingsLeaves AgentService 消费面）。
- ScopedSkillLike.scope 改必填（接口无隐式索引签名 ⇒ 不能靠 `[key]` 兜底；McpHelpers）。
- Radix 声明具型：RadixTabsList/RadixTabsTrigger → ComponentPropsWithRef 变体（Sidebar ref 穿透）；
  QuickPick CommandPrimitive.List → ComponentPropsWithRef（TopBar branchListRef）。

### 2.4 §C 余项
- SettingsState.theme→ThemeMode ✅（stores-core）。
- AutomationRun trigger/sessionId、installedPlugins 收窄、Automation→AutomationTask 对齐（5 错）✅（并入 2.3）。
- StoresDeep §5.2 静态面 ①–③：**不可达**——真实 store 无 declare 所列成员，强对齐会级联；延后 S5。

## 3. 服务类型属主表（BaseServices field → owner module → type）

| field | owner 模块 | 类型 | 备注 |
|---|---|---|---|
| settingService | Settings.tsx | SettingService | 真实导入 |
| systemService | Settings.tsx | SystemService | 真实导入 |
| memoryService | Settings.tsx | MemoryService | 真实导入 |
| skillsService | stores-workspace.tsx | SkillsService | SkillStore 域导出，经 stores-workspace 转手 |
| commandsService | stores-workspace.tsx | CommandsService | 真实导入 |
| pluginService / pluginManagementService | stores-workspace.tsx | PluginService | 同一面，双字段 |
| subagentsService | stores-workspace.tsx | SubagentsService | 真实导入 |
| mcpSyncService | stores-workspace.tsx | McpSyncService & {5 个远端同步方法} | 消费面：Modals McpSyncDialog |
| zcodeTaskService | stores-tasks.tsx | ZCodeTaskService | 真实导入 |
| zcodeAgentService / automationsAgentService | stores-tasks.tsx | AutomationsAgentService | 宿主面=自动化面超集 |
| offPeakTaskService | stores-tasks.tsx | OffPeakTaskService | 真实导入 |
| zcodeSessionService | stores-core（内联） | { closeSession; [method] } | 无属主类型 |
| modelProviderService | stores-core（内联） | { onDidChangeProviderRegistry; refreshCodingPlanApiKey; getAllCached; [method] } | 消费面：Settings/UsageDeep |
| repoWikiService | stores-core（内联） | { onDidChangeRepoWiki; readSummary/readPage/generate/delete/cancel; [method] } | 消费面：ExtendedViews RepoWikiView |
| hooksService | stores-core（内联） | { loadHooks; saveHooks; [method] } | 消费面：StoresDeep/SPC |
| skillSyncService | stores-core（内联） | 候选/导出/远端状态/写权限/导入 + [method] | 消费面：Modals 同步对话框 |
| pluginSyncService | stores-core（内联） | 同上 + importMarketplaceSourceArchive | 消费面：Modals 同步对话框 |
| credentialService | stores-core（内联） | { load; [method] } | |
| oauthService | stores-core（内联） | { logout; [method] } | |
| settingsSyncService | stores-core（内联） | { detect; importSelected; [method] } | |
| fileWatcherService / localModelProviderService | — | unknown | 消费面未具型需求 |
| codingPlanSubscriptionService / paymentService | — | Record<string, (...args:any[])=>any> | 方法面过宽，索引签名兜底 |

## 4. tsc 增量（触碰文件 before → after；基线 528 / 终值 44）

| 文件 | 基线 | 终值 | 文件 | 基线 | 终值 |
|---|---|---|---|---|---|
| SettingsPanelsCapability | 168 | **0** | Sidebar | 30 | 4 |
| ExtendedViews | 74 | **0** | PaymentDeep | 28 | 6 |
| WorkspaceShell | 66 | 3 | TopBar | 16 | 7 |
| Settings | 52 | **0** | SidePanel | 16 | 9 |
| SettingsPanels | 44 | **0** | SidebarLeaves | 11 | 1 |
| Home | 8 | 7 | SettingsPanelsData | 6 | **0** |
| UsageStatsUiParts | 3 | 3 | SrcSharedB | 2 | 2 |
| SettingsLeaves | 2 | **0** | MarkdownMermaid | 1 | 1 |
| MarkdownElements | 1 | 1 | ConversationOverlays | 0 | 0 |

其余触碰文件（36 个，见 §7）基线即为 0，终值仍为 0。**零单文件增长。**

快照序列（/tmp/tsc-pass3-midNN.txt，共 33 份）：
528 → 479 → 475 → 468 → 470* → 441 → 424 → 427* → 421 → 410 → 390 → 386 → 373 → 346 → 315 →
312 → 311 → 310 → 310 → 303 → 297 → 202 → 178 → 175 → 148 → 141 → 113 → 105 → 88 → 69 → 64 → 61 → 48 → **44**。
（*mid4/mid7 为迭代中的瞬时回弹 +2/+3，同阶段内收回；每一步终值所有文件均 ≤ 基线。）
拐点：mid20→mid21（297→202）= ResolvedBaseServices 收窄落地。

## 5. Phase 3c — 横切属主定位

### #49 useSettingsSelector（Ao）✅ 完成
- **属主定位**：styles-CdEGpc2x.js js 1301（`function Ao(e,t)` = useContext(Oo)+useSyncExternalStore，
  紧邻 ko useZCodeStore）。⚠ worklist 所记「src-HCld2afU.js」不确：该 chunk 3367 的 `Ao` 是无关对象字面量，
  且该 chunk 无 codePreviewSettings/notificationEnabled。
- canonical = stores-core `useSettingsStoreValue`（pass 3a #44 已实体化，与 bundle 逐句对应）。
- 改接：
  - ConversationOverlays.tsx：declare 删除（立碑）→ `import { useSettingsStoreValue as useSettingsSelector } from './stores-core'`；文件头依赖注释同步更正。
  - SidePanel.tsx：declare + 本地 `CodePreviewSettings {[key]: unknown}` 占位删除（立碑）→ 同上 alias 导入 +
    `type CodePreviewSettings`/`DEFAULT_CODE_PREVIEW_SETTINGS`（MarkdownIntegration canonical）；
    3425 回退值 `{} as CodePreviewSettings` → `DEFAULT_CODE_PREVIEW_SETTINGS`（bundle 原回退即 lo 默认值，
    js 1040）。**顺带消除 3454 的 CodePreviewSettings 缺成员错误。**
  - GitReview.tsx：先前 pass 已改接（`useSettingsStore as useSettingsSelector`），无残留 declare。
- 全树 `declare function useSettingsSelector` 已清零。

### #48 classifyToolCall(og)/extractRawFileSummaries(_g)/parseToolCallRaw(hg)/isPlainRecord(pg) —— 属主**从未重建**，保留 declare
精确定位记录：
- **og classifyToolCall**：实现位于 styles-CdEGpc2x.js js ~23084–23187（含助手 qme/ig/ag/Jme/ste/Zme/
  Qme/$me/Yme + 回退身份 Gme，其后为 sg/cg toolContentFamilyOf）。属「工具身份 + vendored diff 引擎」
  横切层。该层仅**下游片段**被重建：ModalsLeaves §C（ahe/dhe，js 23153/23226 真实代码）、
  GitReview git 数据集域（js 23760+）。og 本体在全部地面真值消费方均为 declare
  （Conversation 421、ConversationOverlays 213、PreviewCards 294、ExtendedViews 754 以 classifyToolFamily 名）。
- **_g extractRawFileSummaries**：declare 于 Conversation 1081 / ConversationOverlays 214；
  同层兄弟 _g（js 23638，extractFileChangeCandidates）declare 于 ExtendedViews 755。未见任何重建实现。
- **hg parseToolCallRaw**：仅 ConversationOverlays 215 declare。未见任何重建实现。
- **pg isPlainRecord**：ConversationOverlays 216 declare。ExtendedViews 3047 有同形**文件内**实现，
  但地面真值将其归入 TreemappingView 基座（b5…XWt，js 178920–179049 域）的本地助手、未导出、
  未标注 pg —— 是同一语义的局部副本，不是横切 pg 的属主。为保持与地面真值结构一致，不导出、不改接。
- 结论：四者的横切属主层（bundle js ~20269/23084 一带）**从未被重建为任何 modules/ 文件**；
  按任务规则保留全部 declare。消费方清单（Conversation/ConversationOverlays/SidePanel/GitReview）中
  仅 ConversationOverlays 持有这组 declare，SidePanel/GitReview 无。

## 6. Gates

- **(a) esbuild**：36 个触碰文件逐一 `--loader:.tsx=tsx --jsx=preserve --outfile=/dev/null` → 全部 0 错误。✅
- **(b) tsc**：终值 44；每个触碰文件 ≤ 基线（§4 表）；零单文件增长。✅
- **(c) md5**：`src-HCld2afU.js` = f5edd6a1207c6d20008204829dad3923；`styles-CdEGpc2x.js` = 48d71d4874b0868d61fd35a328bf6ad5。✅
- **(d) git status**：`git status --porcelain | grep -v '^??'` 全部位于 desktop/src/src/ 下（0 条例外）。✅

## 7. 触碰文件（36）

WorkspaceShell、SidePanel、TerminalPane、BrowserPane、services、FileRewindDialogDeep、ProcessMonitor、
GitReview、stores-session、Conversation、ConversationLeaves、TopBar、WebRemote、QuickPick、SettingsLeaves、
SettingsPanelsCapability、stores-workspace、stores-tasks、McpHelpers、StoresDeep、Modals、ExtendedViews、
ImeComposition、Settings、UsageDeep、OnboardingLoginLeaves、QuickPickDeep、stores-core、Sidebar、
SettingsPanels、SettingsPanelsData、UsageStatsUiParts、Bots、CmdkPaletteDeep、Home、ConversationOverlays。

## 8. 发现（供后续 pass 引用）

1. **ResolvedBaseServices 是最大杠杆**：交叉型收窄一次消除 60 个 TS18048 + 大片级联（~95 直接命中）。
   凡「必有上下文」钩子皆可复用此模式。
2. **交叉型破坏直cast可比性**：`as {x: T}` 需升级 `as unknown as {x: T}`（10 处，已带注释）。
3. **接口无隐式索引签名**：以接口为源对 `[key]` 目标赋值必败；修法 = 源接口加 `[key: string]: unknown`
   或把成员改必填（ScopedSkillLike 取后者）。
4. **`Omit<带索引签名接口, K>` 塌缩**：keyof 变 string，成员全塌为 unknown；用 `Pick & Partial` 替代。
5. **重复类型须双向对齐**：McpServer/ModelProvider/CodingPlan/Automation/OffPeakTask 各族按
   「两边字段互相可赋值」对齐后，两个方向的错误同时消失。
6. **地面真值实证**：SidebarFooter 从不接收 workspacePath；subscriptionRenewTime 为 ISO 字符串
   （Date.parse 消费）；bundle 的 Ao 回退值一律是 lo 默认对象；WorkspaceShell 的
   handleWebRemoteTaskSwitchingChange 收 string key 却按 boolean 存（bundle 原生宽行，见 §9-Sidebar）。
7. **search_replace 静默假成功**：本 pass 两次报成功而文件未变（UsageDeep 785/819、QuickPick 2152）。
   此后每次编辑必 grep 复核。
8. **§5.2 StoresDeep 静态面不可达**：真实 store 无 declare 成员，强对齐会级联 —— S5 专项。
9. **Ao 属主更正**：在 styles-CdEGpc2x.js js 1301，非 src-HCld2afU.js（worklist 记载有误，已在本报告与
   ConversationOverlays 头注更正）。

## 9. 剩余错误普查（44，按族 —— S5 计划输入）

| 族 | 文件(行) | 数 | 根因/建议 |
|---|---|---|---|
| OffPeakTaskService 重复型 | Home 922×2/938 | 3 | stores-tasks OffPeakTask 缺 `id` vs 本地 OffPeakTaskSummary；S5 对齐 list() 返回型 |
| CodingPlanSubscriptionService declare | Home 922 | 1 | `Record<string,(...any)=>any>` 缺 getOffPeakClientConfig；消费面补型 |
| 远程会话 declare 签名 | Home 1373–1376 | 4 | RemoteTarget/void\|Promise/string\|undefined 四处 declare 与调用面不齐 |
| UpdateDialog props 面 | TopBar 881 | 1 | 缺 intl/isUpdateActionPending 等 10+ props；props 面重建 |
| TaskMeta↛PinnedTask/TimelineTask | TopBar 2148/2153/2182/2185 | 4 | TaskMeta 缺 workspacePath（重复型对齐） |
| GitSummary 重复型 | TopBar 2954×2 | 2 | 本地 GitSummary vs GitReview canonical + SummaryPanelGitModel(added/removed/dirtyFileCount) |
| SessionHandle↛{store} | SidePanel 3234/3432 | 2 | useSessionSnapshot 参数面（单一根因） |
| subagents unknown | SidePanel 3267×2/3356 | 3 | 目录项 unknown + SubagentOpenRequest 回调型 |
| FileLinkModel vs string | SidePanel 3455 | 1 | onOpenFileLink 参数面 |
| CodeViewerSource(Input) | SidePanel 4316 | 1 | 联合型收窄方向反了 |
| GitState↛GitPaneState | SidePanel 4330 | 1 | 缺 workspaceKey/summary/identity 等 9 成员 |
| TerminalServices | SidePanel 4354 | 1 | BaseServices 无 terminalService（宿主面） |
| PaymentDeep 杂项 | 759/1638/11253/11409-11 | 6 | DropdownMenuContent 缺 onCloseAutoFocus；TS2871 恒 nullish；normalizedValue 多余属性；model 条目 string vs {fullLabel,providerPrefix,modelLabel} |
| Sidebar 真值原样不齐 | 4431/4449/4450/4553 | 4 | 与地面真值逐字一致：switcher prop 面缺 listWorkspaces、onTaskOpen/onCrossWorkspaceSwitchingChange 形状不齐、双 TaskMeta status 可选性 —— bundle 原生宽行，S5 语义裁决 |
| ZCodeTaskServiceLike | SidebarLeaves 1527 | 1 | 缺 unarchiveTask/deleteTask |
| WorkspaceShell 登记跳过 | 3074/3114/3608 | 3 | pass-1 已登记（WorkspaceServices↛BaseServices；FileLinkModel vs string） |
| UsageStatsUiParts unknown ctx | 964/976×2 | 3 | createContext 泛型未具型 |
| SrcSharedB | 445/866 | 2 | process 重复声明 TS2403；string\|undefined |
| Markdown 杂项 | MarkdownElements 703 / MarkdownMermaid 186 | 2 | createContext unknown 泛型；RefObject\<T\|null\>↛RefObject\<T\> |

—— A0 pass 3 完毕。下一步（S5）：按 §9 族表逐项推进；优先 SidePanel(9)/TopBar(7)/Home(7)/PaymentDeep(6) 四个重复型族。
