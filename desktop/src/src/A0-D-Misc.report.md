# A0-D-Misc 批次报告（Stage A0 · declare 接线 + 类型收敛）

日期：2026-08-29　工作目录：/Users/mac/nofy-build　域：desktop/src/src/modules/ 13 文件

## 0. 总览

| 指标 | 基线 | 完工 |
|---|---|---|
| 域内 tsc 错误 | 139 | **0** |
| 接线（declare → 真实 import 的符号数） | — | **62** |
| 保留 declare | — | 451（Lane-4 vendored + 属主未重建/未导出） |
| 需要的 export（登记） | — | **17 项**（见 §5） |
| AMBIGUOUS 裁决 | — | 6 项（见 §6） |

门禁：
- a. esbuild 逐文件：13/13 通过（`--loader:.tsx=tsx --jsx=preserve`）。
- b. `tsc -p tsconfig.json`：域内 13 文件全部 0 错（逐文件不增 ✓，达标 0 ✓）。
- c. out/ md5：src-HCld2afU.js = `f5edd6a1207c6d20008204829dad3923` ✓；styles-CdEGpc2x.js = `48d71d4874b0868d61fd35a328bf6ad5` ✓（实测路径为 desktop/src/out/renderer/assets/）。

## 1. 逐文件接线清单

### Bots.tsx（错 16→0；declare 22→19）
- 接线：`cn`→UtilsCn；`Button`→button；`useZCodeIntl`→I18n（3 符号）。
- 类型收敛：新增 `BotsServiceLike` 接口 + `useBaseServices() as { botsService: BotsServiceLike }`（getConfig/getStatus/listWorkspaceRefs/getBotStates/saveBot/createBindCode/poll*/begin*/resetBotState/deleteBot/removeBotSecret），消除 getConfig 下游 bot 隐式 any。
- 保留 19：usePlatformService、Dialog*×5、Icon*×12、qrcode vendored（78456–79690 段未动，Lane-4）。

### OnboardingLoginLeaves.tsx（错 40→0；declare 145→142）
- 接线（7）：`useConfirmDialog`→Modals（原 U2，js 123493）；`registerBaseServices`→services（原 Sse，裁决见 §6.4）；`defaultCodePreviewSettings`→MarkdownIntegration.DEFAULT_CODE_PREVIEW_SETTINGS（原 lo，1040）；`cn`→UtilsCn；`useIntlContext`→I18n.useZCodeIntl；`Button`→button；`workspaceScopeKey`→SkillStore.resolveWorkspaceKey（原 Io，裁决见 §6.5）。
- 回滚前波错误 import（3，均编译失败且本文件无调用面）：`ConfirmDialog`←Modals、`CodingPlanUpgradeDialogProvider`←PaymentDeep、`CLOSE_ACTIVE_CONTEXT_EVENT`←WorkspaceShell → 恢复基线 declare 并登记需要的 export。
- 类型收敛：useOAuth/ApiKeyLoginView 的 `oauthService`/`platform` 投射（OAuthServiceLike / 本地 PlatformService）；`modelProviderService`/`settingService` 投射（ModelProviderServiceLike/SettingServiceLike）；login entry id 按 stores-core 契约改 `number`（handledRequestIdRef/pendingAttemptRef/startLoginTracked requestId）；oauthError 投射 `string | null`；captionWorkspacePath `?? undefined`×2；MemoizedWorkspaceShell 调用面：services 投射 ComponentProps["services"]、workspaceIdentity `?? undefined`、onCreateScratchWorkspace 投射、bundle 有而 WorkspaceShellProps 缺的 4 prop（baseFeedbackService/remoteConnectionLogs/remoteConnectionInProgress/onReturnToWorkspace）经 `as unknown as ComponentProps<typeof WorkspaceShell>` 投射 spread 传递；Alert `warning` 变体投射×2；AppDialogHost 显式 `{null}` 子节点。
- 保留 142：全部 UNRESOLVED（tab store/session router/split layout/code comments stores、remote 会话族、model provider 快照族、captcha 族、telemetry 族、useTaskListItems【误归属，见 §7.4】、HeroCardShell/BrandWordmarkSvg【属主未导出】等）。

### QuickPick.tsx（错 15→0；declare 73→68）
- 接线（7）：`getWorkspaceState`→SkillStore.getWorkspaceTaskStateAlias（B5-11 规范名；原 fe = U 导出）；`mergeTaskMeta`→SkillStore.mergeTaskMeta（别名 mergeTaskMetaBase + 本地签名投射，本地 TaskMeta 的 unreadAt/changeSummary 更宽）；`workspaceKey`→SkillStore.resolveWorkspaceKey（原 Io/Lo，js 1368/1371）；`cn`→UtilsCn；`useIntlContext`→I18n；`Button`→button；`Tooltip`→UsageStatsUiParts.InfoTooltip（原 Ia；唯一调用面 title+side+children 兼容）。
- 类型收敛：`resolveTaskListShards` 调用面 `baseServices as TaskListShardServices`；`fileService` 投射 `{ fileService: FileService }`（files/error 获上下文类型）。
- 回滚：前波 `normalizeWorkspaceScopes`←'./126518'（模块不存在）→ 恢复 declare（原 oje，35647）。
- 移除：本地 TaskStoreState 接口（仅被 getWorkspaceState declare 引用）。
- 保留 68：shortcutLabel/isModKey/isModShiftKey/isModAltKey（keyboardShortcuts chunk 未重建）、createZustandStore（zustand Lane-4）、Dialog*×5、resolveFileInfo/stripTrailingSlash/relativePathFrom、CommandPrimitive（cmdk Lane-4）、Icon*×28、resolveIconFallback、深部查询/订阅引擎 14 件（reconcileIncomingTaskKeys…applyRuntimeStateFromTaskMeta，styles chunk 未重建）。

### QuickPickDeep.tsx（错 8→0；declare 20→19）
- 接线（6）：`SessionIndexStore`/`WorkspaceSubscriptionSet`/`sessionIndexPoolKey`/`useBaseServices`/`type SessionIndexScope`→services；`SearchResultsStore`→QuickPick.useSearchResultsStore（原 Vo）。
- 类型收敛：删除 WorkspaceStateLike 索引签名；两处 scope 字面量 `as unknown as SessionIndexScope`（bundle GS@styles 35529 只传 workspaceKey+endpointKey，services 侧 workspacePath 必填 → 登记 §5.13）；zcodeAgentService/session/error 投射；rollbackTaskUnreadNow 参数放宽 `number | null | undefined`。
- 保留 19：全部 UNRESOLVED（services.tsx 自身仍 declare zS/WS）。

### CmdkPaletteDeep.tsx（错 13→0；declare 19→15）
- 接线（6）：`errorMessageOf`→FeedbackCenter.extractErrorMessage（AMBIGUOUS 裁决 §6.1）；`type GitFileChange`/`type GitIdentity`→GitReview（删本地副本）；`cn`→UtilsCn；`useIntlContext`→I18n；`Button`→button。
- 类型收敛：`useServices() as { gitService: GitService }`×2。
- B5-07 核验：TopBar 从本域导入的 5 个符号（CommitGraphDialog、CreateBranchDialog、SwitchAssistDialog、resolveBranchDisplayLabel、useGitBranchSwitcher）均有 export，tsc 无相关错误。
- 保留 15：zZ 深部物化 declare（分支切换/提交图谱引擎）+ Lane-4 原语。

### UsageDeep.tsx（错 8→0；declare 101→95）
- 接线（7）：`cn`→UtilsCn；`useIntlContext`→I18n；`Button`→button；`Tooltip`→UsageStatsUiParts.InfoTooltip；`formatCompactNumber`→UsageStatsUiParts.formatNumberCompact（原 ja；调用面 3 处翻正为 (locale, value)，裁决 §6.3）；`PopoverRoot`→ImeComposition.Popover（原 n=T）；`type CodePreviewSettings`→MarkdownIntegration。
- 补 export：`formatGrantUnits`（PaymentDeep 跨模块消费；恢复 bundle 拓扑。注意 PaymentDeep 调用面 (locale, units) 与 bundle PXt(value, locale) 参数序相反，由 PaymentDeep 批修正）。
- 类型收敛：usageStatsService×2/systemService/modelProviderService×2 投射（本地 ServiceLike 接口）；useSubscriptionSnapshot 的 usageStatsService 投射；codePreviewSettings 投射 `CodePreviewSettings | undefined`；nameInputRef 放宽 `RefObject<HTMLInputElement | null>`；Button 接线引入的 3 处 handler 隐式 any → `(event: any)`。
- 保留 95：Dialog*/Command*/Select*/Collapsible*/dnd-kit 族（Lane-4）、Icon*×16、SpinnerIcon/InfoIcon/usePlatformService（ImeComposition 未导出）、model-provider 工具族（src chunk B 未重建）、testid 族、useSettingsStoreValue/useOptionalServices（属主未导出）。

### FeedbackCenter.tsx（错 0→0；declare 31→24）
- 接线（7）：`cn`→UtilsCn；`useIntlContext`→I18n；`Button`/`createLucideIcon`→button；`parseCustomModelKey`→SrcSharedB.parseCustomModelRef；`isE2eStoreBridgeMode`→SkillStore.isE2EStoreBridgeEnabled；`workspaceEntityKey`→SkillStore.resolveWorkspaceKey。
- 保留 24（含 FormatMessageFn：被本族 export 签名引用）。

### BrowserPane.tsx（错 4→0；declare 26→22）
- 接线（5）：`cn`→UtilsCn；`useIntlContext`+`type ZCodeIntl`→I18n；`Button`→button；`Tooltip`→UsageStatsUiParts.InfoTooltip。
- 类型收敛：`declare module "react"` 的 webview IntrinsicElements 重声明（TS2717 冲突）改为扩展 `WebViewHTMLAttributes`（含 `data-${string}` 索引签名）；ref/allowpopups 调用面投射；`IntlShape["formatMessage"]` 引用面 4 处改 `ZCodeIntl["formatMessage"]`；TabsContent forceMount 经投射 spread（Settings 缺，已登记）。
- 保留 22：Icon*×13、DropdownMenu×4、usePlatformService、addWebElementContextToChat/validateWebElementContext（Composer 域未导出）、SelectContentAlignEnd。

### TerminalPane.tsx（错 6→0；declare 16→14）
- 接线（3）：`cn`→UtilsCn；`useIntlContext`→I18n；`Button`→button。
- 回滚：前波 `ContextMenuItem`←LegacyDocEngineBModel（该处为 interface，TS2693）→ 恢复 Lane-4 declare。
- 类型收敛：`(e: any)` handler×2；TabsTrigger asChild / TabsContent forceMount 经投射 spread（Settings 缺，已登记）。
- 保留 14：ContextMenu 族、Icon*、Settings 深部 declare。

### FileRewindDialogDeep.tsx（错 7→0；declare 18→16）
- 接线（3）：`cn`→UtilsCn；`useIntlContext`→I18n；`Button`→button。
- 回滚：前波 `DiffViewer`←CodeViewer（props 面不符：patch/oldFile/themeType vs file/options/lineAnnotations/renderAnnotation）→ 恢复基线 declare。
- 类型收敛：`usePlatform() as unknown as PlatformService`（本地接口）；`(event: any)`×2；`(editor: InstalledEditor)` 注解。
- 保留 16：formatKbd/isMacKeyboard/getLastEditorId/setLastEditorId/openFileChangeInViewer/toWorkspaceRelativePath（属主未导出）、DropdownMenu×5、Icon×4。

### RemoteDirectorySuggestInput.tsx（错 22→0；declare 4→4；B5-15 优先）
- 接线（7）：`Q`→react（chunk 996）；`$`→react/jsx-runtime（chunk 1287）；`Z`→UtilsCn.cn（chunk 901）；`T/O/P/x`→ImeComposition Popover/PopoverAnchor/Input/PopoverContent（chunk 358/361/367/354，B5-15 §6.3）。
- 修正前波错误 import：`import { $, O, P, Q, T, Z, x } from './SrcSharedB'` 的单字母名与 SrcSharedB 混淆导出冲突（$=AUTOMATION_CREATE_LIMIT_REACHED 等）→ 全部改按 B5-15 §6 属主接线。
- 补 export：`SuggestionInput`。类型收敛：useRef 初值投射、`(e?: any)` 回调。
- 保留 4：Yb/Zb/Qb/ex（cmdk Lane-4）。

### ProcessMonitor.tsx（错 0→0；declare 5→4）
- 接线（1）：`ReactDOMClient`→react-dom/client（原 i = imeComposition 的 P 导出）。
- 保留 4：3 个 font-size 函数（属主未重建，登记 §5.16）+ declare global。

### DiffsWorker.tsx（错 0→0；declare 9→9）
- 未改动。9 个 declare 全部为 vendored（shiki/jsdiff/oniguruma/worker 桥接），保留待 S3。

## 2. tsc 前后对照（域内）

| 文件 | 基线 | 完工 |
|---|---|---|
| Bots.tsx | 16 | 0 |
| OnboardingLoginLeaves.tsx | 40 | 0 |
| QuickPick.tsx | 15 | 0 |
| QuickPickDeep.tsx | 8 | 0 |
| CmdkPaletteDeep.tsx | 13 | 0 |
| UsageDeep.tsx | 8 | 0 |
| FeedbackCenter.tsx | 0 | 0 |
| BrowserPane.tsx | 4 | 0 |
| TerminalPane.tsx | 6 | 0 |
| FileRewindDialogDeep.tsx | 7 | 0 |
| RemoteDirectorySuggestInput.tsx | 22 | 0 |
| ProcessMonitor.tsx | 0 | 0 |
| DiffsWorker.tsx | 0 | 0 |
| **合计** | **139** | **0** |

全项目总数受并行批影响，不以本表为准。

## 3. 保留 declare 及原因（451，按类）

1. **Lane-4 vendored（S3 换 npm）**：Icon*/*Icon 全族、Dialog*/DropdownMenu*/Select*/Tabs*/Tooltip 原语/Popover 原语/ScrollArea/Command*(cmdk)/Collapsible*、dnd-kit 族（UsageDeep）、lexical 系、qrcode（Bots 78456–79690）、useVirtualizer、createZustandStore/zustand 桥、shiki/jsdiff/oniguruma（DiffsWorker）、ContextMenu 族。
2. **属主未重建（UNRESOLVED，styles/src chunk 深部）**：QuickPick 深部查询引擎 14 件、QuickPickDeep 19 件、CmdkPaletteDeep zZ 深部、OLL remote 会话/tab/captcha/telemetry/model-provider 快照族 ~120 件、UsageDeep model-provider 工具/testid 族 ~80 件、keyboardShortcuts 族、font-size 族等。
3. **属主域外未导出（登记 §5，declare 保留）**：usePlatformService、SpinnerIcon/InfoIcon、formatKbd/isMacKeyboard、getLastEditorId/setLastEditorId、openFileChangeInViewer/toWorkspaceRelativePath、addWebElementContextToChat/validateWebElementContext、useSettingsStoreValue、useOptionalServices、useAppSettings、useTabStore/useTabStoreApi、trackTelemetryEvent/isTelemetryEnabled、HeroCardShell/BrandWordmarkSvg、ConfirmDialog/CodingPlanUpgradeDialogProvider/CLOSE_ACTIVE_CONTEXT_EVENT 等。

## 4. 域内补 export（本批新增）

- UsageDeep.`formatGrantUnits`（PaymentDeep 消费，bundle 拓扑恢复）。
- RemoteDirectorySuggestInput.`SuggestionInput`。

## 5. 需要的 export（17 项，域外）

1. Modals：`ConfirmDialog`（q4t，206572）export。
2. PaymentDeep：`CodingPlanUpgradeDialogProvider` export。
3. WorkspaceShell：`CLOSE_ACTIVE_CONTEXT_EVENT` export。
4. WorkspaceShell：WorkspaceShellProps 补 `baseFeedbackService`/`remoteConnectionLogs`/`remoteConnectionInProgress`/`onReturnToWorkspace`（bundle XJt @styles 186515–186552 实收）。
5. WorkspaceShell：`onCreateScratchWorkspace` 类型应为 `(name: string) => Promise<string | null>`（现为 `() => void`）。
6. WorkspaceShell：`WorkspaceServices` 类型 export（消费面目前只能 ComponentProps 投射）。
7. Settings：`Alert` 补 `warning` 变体（bundle @styles 202627 有 warning 类组）。
8. Settings：`TabsTrigger` 补 `asChild`（radix 原语语义）。
9. Settings：`TabsContent` 补 `forceMount`（radix 原语语义）。
10. Modals：`AppDialogHost` children 改可选（bundle P9 @styles 206992 可省 children）。
11. ImeComposition：`usePlatformService`（l=M）、`SpinnerIcon`（w）、`InfoIcon`（T=Ht）export。
12. MarkdownIntegration：`getLastEditorId`/`setLastEditorId` export（FRDD 消费）。
13. services：`SessionIndexScope.workspacePath` 改可选（bundle GS@styles 35529 只传 workspaceKey+endpointKey）。
14. GitReview：`openFileChangeInViewer`/`toWorkspaceRelativePath` export（FRDD 消费）。
15. Composer：`addWebElementContextToChat`/`validateWebElementContext` export（BrowserPane 消费）。
16. SidebarLeaves（或相应属主）：ProcessMonitor 的 3 个 font-size 函数实体化/export。
17. Settings 域：`useSettingsStoreValue`（Ao 1301）与 `useOptionalServices`（ps 2643）实体化/export（UsageDeep 消费）。

## 6. AMBIGUOUS 裁决（bundle 行号锚点 + 调用面）

1. **errorMessageOf（CmdkPaletteDeep）**：候选 FeedbackCenter/PaymentDeep/Settings。bundle MC@js 37651 为「剥 `Error:` 前缀」实体，与 FeedbackCenter.extractErrorMessage 实现一致 → 接 FeedbackCenter。
2. **SearchResultsStore（Vo，QuickPickDeep）**：wiring-plan 旧候选 stores-session（styles 未重建，A0-PROGRESS 警示误归属）→ 裁决接域内 QuickPick.useSearchResultsStore（已实体化，getState 面吻合）。
3. **formatCompactNumber（ja，UsageDeep）**：真实实体 UsageStatsUiParts.formatNumberCompact，签名 `(locale, value)`。锚点：NYt@styles 187927 `ja('en-US', e)`、PXt@styles 189694 `ja(t, e)`（PXt(value, locale) 内部翻转为 ja(locale, value)）。重建稿 3 处调用面参数序写反 → 按 bundle 翻正（2780/4642/4647）。旁证：PaymentDeep@9310 `PXt(locale→)` 亦反序，归 PaymentDeep 批修正。
4. **registerBaseServices（OLL）**：services.tsx:790 与 stores-core.tsx:541 双导出、实现逐字相同（均委托 useSessionRegistryStore.getState().registerBaseServices）→ 按本文件既有 services 导入面接 services。
5. **workspaceScopeKey（OLL R6t）**：前波接 stores-session.workspaceScopeKey（单参 scope 形）编译失败（4×TS2554）。bundle R6t@styles 211133 调 `Io(path, identity)` 两参形 = resolveWorkspaceKey（js 1368）→ 改接 SkillStore.resolveWorkspaceKey（别名保留 workspaceScopeKey）。
6. **cn**：wiring-plan 标 AMBIGUOUS（SrcSharedB;UtilsCn）→ 按已知属主规则一律接 UtilsCn。

## 7. 异常

1. **前波误接线回滚（5）**：OLL 三件未导出 import（ConfirmDialog/CodingPlanUpgradeDialogProvider/CLOSE_ACTIVE_CONTEXT_EVENT）；QuickPick normalizeWorkspaceScopes←'./126518'（模块不存在）；TerminalPane ContextMenuItem←LegacyDocEngineBModel（interface 当值用）；FRDD DiffViewer←CodeViewer（props 面不符）；RDSI 单字母 import←SrcSharedB（与混淆导出名冲突，22 错根因）。均恢复基线 declare/改按正确属主，tombstone 注释在位。
2. **Button 接线副作用**：button.tsx ButtonProps extends Record<string, unknown> 破坏 JSX handler 上下文类型 → 调用面 `(event: any)`/`(e: any)` 注解（B5 既有风格，零运行时影响）。涉及 UsageDeep×3、FRDD×2、TerminalPane×2、Bots/OLL 等。
3. **并行批交互**：WorkspaceShell 域收紧 WorkspaceShellProps 后，OLL 的 MemoizedWorkspaceShell 调用面出现 excess/missing 冲突 → 以 ComponentProps 投射 spread 收敛（4 个 bundle 实有 prop 经投射传递），根因登记 §5.4–5.6。
4. **OLL 本地导出类型与 stores-core 契约不一致**：本地 `LoginEntryRequest.id: string`/SettingsStoreState 字符串 id 签名 vs stores-core number。调用面已按 stores-core（number）收敛；本地导出接口保留不动（防外部消费面破坏），后续波次统一。
5. **useTaskListItems（OLL declare）**：A0-PROGRESS 警示 wiring-plan 误归属（TopBar 为消费方而非属主）→ 保留 declare，不接线。
6. `declare ... any` 下游 any 传播：域内错误已清零，无遗留项。

## 8. B5 账目核验

- B5-07：CmdkPaletteDeep 对 TopBar/SettingsPanels 的导出面齐全（CommitGraphDialog 等 5 件，tsc 佐证）。
- B5-11：QuickPick getWorkspaceState 按规范名 getWorkspaceTaskStateAlias 接线。
- B5-15：RemoteDirectorySuggestInput 22 错全清（本域错误密度最高项）。
- 已知属主接入：workspaceKey→SkillStore.resolveWorkspaceKey（QuickPick/OLL/FeedbackCenter）、Tooltip→UsageStatsUiParts.InfoTooltip（QuickPick/UsageDeep/BrowserPane）、Button/buttonVariants/createLucideIcon→button、cn→UtilsCn（9 文件）、useZCodeIntl→I18n（9 文件）。
