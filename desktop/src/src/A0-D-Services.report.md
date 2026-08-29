# A0-D-Services 批次报告（Stage A0 · declare 接线 + 类型收敛）

日期：2026-08-29 · 工作目录 /Users/mac/nofy-build
域内 7 文件：services.tsx / stores-core.tsx / stores-session.tsx / stores-tasks.tsx / stores-workspace.tsx / StoresDeep.tsx / AppRootLeaves.tsx

## 0. 总账

| 指标 | 数值 |
|---|---|
| declare→import 接线 | 35 条（另 logger 属主改接 6 处，见 §1） |
| 保留 declare | 114 条（services 21 / stores-session 1 / stores-tasks 1 / stores-workspace 17 / StoresDeep 6 / AppRootLeaves 68 / stores-core 0） |
| tsc 域内错误 | 135 → 0（逐文件均 0，只减不增达成） |
| 需要的 export（域外登记） | 12 项（§5） |
| 需要的域内类型对齐（后续波次） | 3 项（§5.2） |
| 歧义裁决 | 8 项（§6） |
| 新增 @ts-expect-error/@ts-ignore | 0 |
| out/ md5 | src-HCld2afU.js = f5edd6a1207c6d20008204829dad3923 ✓ / styles-CdEGpc2x.js = 48d71d4874b0868d61fd35a328bf6ad5 ✓ |
| esbuild 逐文件 | 7/7 通过（--loader:.tsx=tsx --jsx=preserve） |

## 1. 逐文件接线清单

### 1.1 stores-core.tsx（1 → 0）
| 原 declare/符号 | 接线为 | 属主证据 |
|---|---|---|
| `logger`（原 J，import 自 SkillStore 未导出） | `import { t as logger } from './logger'` | logger.tsx:147 `export { logger as t }`（真属主） |
| `createStore`（原 Ae） | `import { create as createStore } from './SkillStore'` | SkillStore.tsx export 块 4468 |
| `readLocalStorage`/`writeLocalStorage`（原 He/We） | `import { readLocalStorageItem as …, writeLocalStorageItem as … } from './intlProvider'` | intlProvider.tsx:136/145 |
| `user: unknown \| null` | `user: UserInfo \| null` + `import type { UserInfo } from './OnboardingLoginLeaves'` | 修复 ARL 2109/2176/2512/2551 连锁 |

### 1.2 stores-session.tsx（15 → 0）
| 原 declare | 接线为 | 属主 |
|---|---|---|
| `logger` | `import { t as logger } from './logger'` | logger.tsx:147 |
| `createStore`（原 Ae） | `import { create as createStore } from './SkillStore'` | SkillStore 4468 |
| `workspaceKey`（原 Io=U） | `import { resolveWorkspaceKey as workspaceKey } from './SkillStore'` | SkillStore.tsx:579（export 4436） |
| 7 条纯助手 declare（原 Jie/Yie/Kie/Bo/pe/Po/Mo/Hie） | `import { mergeTaskMetaEntry as mergeTaskMeta, isQueryResultEquivalent as isQueryResultEqual, descriptorContainsTask as matchesDescriptor, sortTaskKeysByDescriptor as sortTaskKeys, pickBestTaskMetadata as pickPreferredMeta, mergeMetaPreservingActivity as mergeMeta, sessionActivityOf as isNewerMeta, broadcastSessionActivity as broadcastTaskListEvent } from './StoresDeep'` | StoresDeep §A/§H 已导出 |
| `freezeQueryResult/mergeIncomingTaskKeys/taskEntityKey` | 同上一并自 StoresDeep import | StoresDeep 483/632/… |
| 本地 SearchDescriptor/QueryResult/TaskMeta 接口 | 删除，`import type … from './StoresDeep'` + `export type` 再导出 | StoresDeep 247/273/296 规范型 |

另：两处 `const result: QueryResult = {` → `QueryResultInput`（字面量缺 fetchedAt/stale，freezeQueryResult 补齐——与 bundle 一致）。

### 1.3 stores-tasks.tsx（19 → 0）
| 原 declare/本地型 | 接线为 | 属主 |
|---|---|---|
| `logger` | `import { t as logger } from './logger'` | logger.tsx:147 |
| `createStore`（原 Ae） | `import { create as createStore } from './SkillStore'` | SkillStore 4468 |
| `workspaceKey`（原 Io） | `import { resolveWorkspaceKey as workspaceKey } from './SkillStore'` | SkillStore.tsx:579 |
| `getRegisteredSession`（原 tc） | `import { getSessionById as getRegisteredSession } from './stores-core'` | stores-core.tsx:568；调用面仅 `session.services.zcodeTaskService as ZCodeTaskService`，与 BaseServices 索引签名兼容 |
| 本地 Automation（359）/OffPeakCreateResult（116） | 删除，`import type … from './StoresDeep'` + `export type` | StoresDeep 698/800 规范型 |
| 本地 AutomationsAgentService | 增补 `listAllAutomations(): Promise<Automation[]>` | bundle 真值：服务面含该方法（ExtendedViews.ZCodeAgentService:296 同证）；StoresDeep.loadAutomationsIntoStore 消费 |

### 1.4 stores-workspace.tsx（15 → 0）
| 原 declare/本地型 | 接线为 | 属主 |
|---|---|---|
| `logger` | `import { t as logger } from './logger'` | logger.tsx:147 |
| `createStore`（原 Ae） | `import { create as createStore } from './SkillStore'` | SkillStore 4468 |
| `workspaceKey`（原 Io） | `import { resolveWorkspaceKey as workspaceKey } from './SkillStore'` | SkillStore.tsx:579 |
| `normalizeProvider`（原 ni） | `import { resolveDefaultAgentCliProvider as normalizeProvider } from './SrcSharedA'` | SrcSharedA.tsx:4662；bundle 链 src Es@3841 → SrcSharedB `Es as ds` → styles `ds as ni`（§6.5） |
| 本地 HookDescriptor（1332）/HooksService（1350） | 删除，`import type … from './StoresDeep'` + `export type` | StoresDeep 820/837 规范型 |
| `import { loadSkillContext } from './Composer'`（TS2459） | 回退为 declare（原 §5 原 HB 位置，签名同逐字基准） | 属主 Composer.tsx:1131 未导出 → §5 登记 |

### 1.5 StoresDeep.tsx（1 → 0）
| 原 declare | 接线为 | 属主 |
|---|---|---|
| `logger`（误接 `import { logger } from './SkillStore'`，TS2459） | `import { t as logger } from './logger'` | logger.tsx:147 |
| `workspaceKey`（原 U） | `import { resolveWorkspaceKey as workspaceKey } from './SkillStore'` | SkillStore.tsx:579 |
| `isZaiPlanFamily`（原 tr=vl） | `import { isZaiPlanProviderId as isZaiPlanFamily } from './SrcSharedA'` | SrcSharedA.tsx:5694 |
| `isZaiProviderFamily`（原 jt=_l） | `import { isBuiltinProviderId as isZaiProviderFamily } from './SrcSharedA'` | SrcSharedA.tsx:5690（调用面 1619 已窄化为 string） |
| `parseCustomModelKey`（原 Zn=iS） | `import { parseCustomModelRef as parseCustomModelKey } from './SrcSharedB'` | SrcSharedB.tsx:5661 |
| `countDiffLines`（原 Xr=bS） | `import { countLineDiffChanges as countDiffLines } from './SrcSharedB'` | SrcSharedB.tsx:5750 |
| `generateRandomId`（原 xi=cx） | `import { generateUuid as generateRandomId } from './SrcSharedB'` | SrcSharedB.tsx:5301 |
| `telemetryClientContext`（原 Qne=tx） | `import { resolveClientTelemetryContext as telemetryClientContext } from './SrcSharedB'` | SrcSharedB.tsx:5231；形参 `(e: any)` 必填 → 唯一调用点改 `telemetryClientContext(undefined)`（bundle 读 `e?.timeZone`，语义不变） |
| `joinModelName`（原 we=rt） | `import { formatCustomModelId as joinModelName } from './SkillStore'` | SkillStore.tsx:1709（export 4461） |
| `useStoreSelector`（原 ne） | `import { useStore as useStoreSelector } from './SkillStore'` | SkillStore.tsx:250（本文件暂无调用点，接线留属主记录） |
| `useSkillContextStoreStatic`（原 UB） | `import { useSkillContextStore as useSkillContextStoreStatic } from './stores-workspace'` | stores-workspace.tsx:601 |
| `refreshSkillsAfterCommandsChange.skillsService: unknown` | `SkillsService`（`import type` 自 stores-workspace:570） | 与 useSkillContextStore.refresh 形参一致 |

类型收敛（配合域内消费面）：
- `isQueryResultEquivalent`/`mergeIncomingTaskKeys` 的 `previousResult: QueryResult | null` → `| null | undefined`（stores-session 以 `resultsByQueryKey[key]` 传入）。
- `reloadHooks`/`saveHooksList` 的 get/set 收窄为结构型 `{ workspacePath; workspaceIdentity }` / `{ hooks?; loadedWorkspaceKey? }`（zustand SetState/GetState 逆变兼容；函数体只读这些字段）。
- `loadAutomationsIntoStore` set/get、`isSameAutomationWorkspace`/`findAutomation` 参数同法收窄。
- `buildCompactionDetail.timeline` 增补可选字段 version/kind/type/operationId/display/summaryMessageId/maxAttempts（services 调用面原样传入；函数体不读这些字段，纯类型放宽）。

### 1.6 services.tsx（63 → 0）
| 原 declare | 接线为 | 属主 |
|---|---|---|
| `workspaceKey`（原 Io） | `import { resolveWorkspaceKey as workspaceKey } from './SkillStore'` | SkillStore.tsx:579（本文件当前无调用点，高频符号按任务要求落实属主） |
| `providerSyncScopeKey`（原 Ti） | `import { automationsWorkspaceKey as providerSyncScopeKey } from './SrcSharedB'` | SrcSharedB.tsx:3048（bundle 同符号 ip/to，§6.3） |
| `PROVIDER_NOT_READY_CODE`（原 Hr） | `import { ZCODE_AGENT_PROVIDER_NOT_READY as PROVIDER_NOT_READY_CODE } from './SrcSharedB'` | SrcSharedB.tsx:5521 |
| `normalizeRpcError`（原 it） | `import { extractErrorInfo as normalizeRpcError } from './SrcSharedA'` | SrcSharedA.tsx:448（返回 `{message, code?}` 与原 declare 一致；bundle ee@100） |
| `declare class ConversationLayer`（原 mw/_w） | `import { ConversationDataLayer as ConversationLayer } from './FeedbackCenter'` | FeedbackCenter.tsx:4126（ctor `{transport}` 兼容、含 dispose） |
| `leaseConversationTransport`（原 mNe） | `import { acquireConversationDataLayer as leaseConversationTransport } from './FeedbackCenter'` | FeedbackCenter.tsx:4223（返回 `{layer, transport, release}`） |
| `unsubscribeTransport`（原 IS） | `import { unsubscribeTransportSafe as unsubscribeTransport } from './QuickPickDeep'` | QuickPickDeep.tsx:962 |
| 本地 TelemetryPlatform（索引签名型） | 删除，`import type { TelemetryPlatform } from './StoresDeep'` + `export type` | StoresDeep:1341（含 reportTelemetryEvent/reportArmsCustomEvent） |
| 本地 TelemetryReport | 删除，`import type { TelemetryReport } from './StoresDeep'` + `export type` | StoresDeep:1354 |
| — | `import type { AgentServiceV4, AttachmentPutInput, AttachmentPutOptions } from './FeedbackCenter'` | FeedbackCenter 3224/3078/3084 |
| — | `import type { TurnStartedFact } from './StoresDeep'` | StoresDeep:3265 |

类型收敛（62 处错误的修复，均不加 @ts-*）：
- V4ConversationApi 按 ConversationTransport 真值改型：fileChanges/fileRewindPreview 形参 `Record<string, unknown>`；attachmentPut `(input: AttachmentPutInput, options?)`；attachmentRead `({sessionId, ref})`；onRuntimeRestart 返回 `() => void`（与 transport 一致）。两处 provider 包装（V4ConversationProviderInner/PanelScopeProviderInner）同步改型；`zcodeAgentService as AgentServiceV4` / `agentService as AgentServiceV4`。
- `recordComposerTextChange(change: { length: number })`（StoresDeep sink 形参；bundle 传原始文本，string 结构兼容 `{length}`）。
- `acceptPromptSeed` 的 `extraDetail?: Record<string, string>`（buildPromptSeedDetail/extractStepSourceDetail 消费面）。
- `attachForeground`/`detachForeground` 首参与 `foregroundOwnerSessions` 键改 `Record<string, unknown>`（bundle 调用面 useRef({})@119305、parity Map 值；Conversation.tsx:7091 接口同证；修复 ARL 1581/1586）。
- `buildNetworkDebugStatus` 返回 `{ statusType: string; [key: string]: unknown }` + `statusType: fact.status as string`。
- `extractPromptSeedFromTurnStarted(fact as unknown as TurnStartedFact)`（TS2352，必需双重断言）。
- `reportVisibleChatError`：`payload.error as { code?; message? }`；sink 载荷 `as unknown as Parameters<typeof reportVisibleChatErrorSink>[1]`（BannerErrorInput 未导出）。
- stream.chunk/tool.lifecycle 事件字面量改 `{ type: string; [key: string]: unknown }`；`messageId: fact.assistantMessageId as string | undefined`。
- recordToolPerformance：`fact.performance` 断言收窄为 21 个目标字段型；fact.* 逐字段 `as`（toolName/messageId/toolCallId/…）。
- handleCompaction timeline 逐字段 `as`（status/trigger 必填 string，其余 `string|number|undefined`）。
- SessionIndex 边界（与 QuickPickDeep 重建型交界处）5 处 `as unknown as`：3713 初始态、4043/4097 复位、4084 applyFrameToIndexState 双参、4087 回填。根因见 §5.1-⑦。

### 1.7 AppRootLeaves.tsx（21 → 0）
| 变更 | 说明 |
|---|---|
| `import { CodingPlanUpgradeDialogProvider } from './PaymentDeep'`（TS2459） | 回退为 declare（§0 provider 区，签名同逐字基准）；属主 PaymentDeep.tsx:10492 未导出 → §5 登记 |
| `import { CLOSE_ACTIVE_CONTEXT_EVENT } from './WorkspaceShell'`（TS2459） | 回退为 `declare const …: string`（§0 平台桥区）；属主 WorkspaceShell.tsx:4859 未导出 → §5 登记 |
| `import { logger, useTaskStore } from './SkillStore'` | 拆分：`import { useTaskStore } from './SkillStore'` + `import { t as logger } from './logger'` |
| — | `import type { AgentFact, TelemetryPlatform } from './services'` |
| groupedDraftPlacement（362/583 两处选项型） | `?: string` → `?: { type: string; groupId?: string }`（bundle 210853/210865、155594/155603；结构对齐 SkillStore GroupedDraftPlacement:422） |
| buildParityEventFact（原 p8t） | 签名改 `(scope, operation: any, patch: Partial<AgentFact> & { kind: string }): AgentFact`（修复 1590–1670 七处 handleFact 传参） |
| runTelemetryParityCase 监督器构造 | `platform: platform as unknown as TelemetryPlatform`（PlatformService 与规范型不可直接比较；noopPlatform@1743 天然满足，无需改） |
| taskRuntimeByWorkspaceKey declare（原 yPt） | 形参 `Record<string, WorkspaceTaskState>` → `Record<string, unknown>`（消费面为 SkillStore workspaces，接口级 declare 放宽） |
| countTotalUnreadTasks 调用 | `state.workspaces as Record<string, WorkspaceTaskState>`（OLL.WSS 经索引签名可赋给 SkillStore.WSS，断言可比成立） |
| DirectoryBrowserDialog services | `services as unknown as React.ComponentProps<typeof DirectoryBrowserDialog>["services"]`（Modals.BaseServices:242 未导出） |
| settingsViewProps.captionWorkspacePath | `activeWorkspacePath as string | undefined`（SettingsViewProps 不收 null；运行时值不变） |
| RootWorkspaceContent workspaceScopedServices | `workspaceScopedServices as unknown as ServicesBundle`（BaseServices↔ServicesBundle 互不可赋） |

B5 账目核对（只接线、未动语义）：
- j6t=useWorkspaceActions 导出完好（ARL:294 `export function useWorkspaceActions`）。
- g8t provider 树 OFFLINE-PATCH-002 块（ARL:2129–2130 `canBootstrapInitialWorkspaceGate = true` 强制放行）逐字保留。
- 死代码逐字保留：`[...TELEMETRY_PARITY_CASES.keys()];` 裸语句（ARL:1383，原 js 212449）；匿名插件市场 store 裸创建（213621–213895）位于 OLL 域外文件，本批未触碰。

## 2. 保留 declare 及原因（114 条）

### services.tsx（21）
| declare | 原因 |
|---|---|
| useTabStoreSelector / isWorkspaceTab（1144/1145） | 属主 F04 TabStore 未重建 |
| isModKey / isModShiftKey / isModAltKey（1295–1297，原 ta/Qi/Rre） | 键盘助手未重建 |
| useTelemetryPlatform（1749，原 S） | App 根注入面，未重建 |
| agentEventSurface（1752，原 sAe） | zcodeAgentService onFact 面，未重建 |
| QueueItemSchema / SessionRowOpSchema / SessionCommandSchemas（3166/3167/3217，原 qOe/cke/Yke） | schema 区未重建 |
| resolveBudgetLimit / assemblyRouteKey / normalizeDeliveryKind / frameEnvelopeMaxBytes / hasCompleteFrameShape / hasFragmentFrameShape / frameMetadataMatches / decodeFrameBase64 / bytesEqual（3291–3299，原 yS/_S/gS/pS/hS+Uke/Kke/vS/Tte/qke） | 帧装配助手区未重建 |
| createWorkspaceSessionIndexTransport / workspaceIdentityOf（4135/4136，原 zS=oAe/WS） | 未重建（QuickPickDeep 274 亦为同 declare） |

### stores-workspace.tsx（17）
| declare | 原因 |
|---|---|
| loadSkillContext（§5 原 HB） | 属主 Composer.tsx:1131 存在但未导出 → §5 登记 |
| MCP 14 条（206–225：DEFAULT_MCP_CONFIG…migrateLegacyCommonMcpServers） | 属主区 24015–25006 未重建 |
| commentsWorkspaceKey（677）/ markCommentRestoredFromAttachment（685） | 属主 CodeViewer 族 / 68500 区未重建 |

### StoresDeep.tsx（6）
| declare | 原因 |
|---|---|
| PROVIDER_IDS（原 q） | 属主 SrcSharedA.providerIds:5680 未导出 → §5 登记 |
| useTaskStoreStatic / useSkillsStoreStatic（原 xe/Ne） | SkillStore 已导出 useTaskStore/useSkillsStore，但静态面型不对齐（getWorkspaceState→slashCommands: SlashCommandEntry[] 等）→ §5.2 域内对齐项 |
| commandsStoreStatic / pluginsStoreStatic / refreshSessionAfterPluginSync | stores-workspace CommandsState.commands 为 CommandDescriptor[]（declare 面为 SlashCommandEntry[]）、PluginsState.refresh 形参 PluginService（declare 面为 PluginsAgentService）→ §5.2 域内对齐项 |

### stores-session.tsx（1）/ stores-tasks.tsx（1）
| declare | 原因 |
|---|---|
| isWorkspaceTab（stores-session） | 属主 F04 TabStore 未重建 |
| sortPinnedTasks（stores-tasks，原 sFt） | bundle 142380 未重建 |

### AppRootLeaves.tsx（68）
全部为域外属主，逐条保留。分类：
- 未重建属主：useTabStoreSelector/useTabStoreApi（原 pc/hc）、useTaskListItems（原 ZS，35727）、mapTasksToListItems（原 h6）、resetTelemetryParityState（原 TPe）、telemetryParityCaseById 等 parity 尾件、DESKTOP_COMMANDS、useIntlContext、setTelemetryReportPlatform/setArmsReportPlatform/setTelemetryPlatform（原 b_e 族）等。
- 属主已重建但未导出：CodingPlanUpgradeDialogProvider（PaymentDeep:10492）、CLOSE_ACTIVE_CONTEXT_EVENT（WorkspaceShell:4859）、TooltipProvider（UsageStatsUiParts:316）、ServicesProvider/StoreProvider/TabStoreProvider/WebRemoteControlFeatureGate 等 provider（ds/Nie/Vse/oRt 族）。
- sessionRouterStore/splitLayoutStore/codeCommentsStore 三个 store 句柄：曾评估按 CI_EXACT 候选接线，但接线会引入新错（clientMode string→ClientMode、WorkbenchGroup→SessionRouterGroup 索引签名不满足、restoreCommentFromAttachment 严格形参对 `{id?: string; [key: string]: any}` 展开），本批只接线不改语义 → 保留。

## 3. tsc 前后对照（域内，`./node_modules/.bin/tsc -p tsconfig.json`）

| 文件 | 前（基线 135） | 后 |
|---|---|---|
| services.tsx | 63 | 0 |
| stores-core.tsx | 1 | 0 |
| stores-session.tsx | 15 | 0 |
| stores-tasks.tsx | 19 | 0 |
| stores-workspace.tsx | 15 | 0 |
| StoresDeep.tsx | 1 | 0 |
| AppRootLeaves.tsx | 21 | 0 |
| 合计 | 135 | 0 |

基线快照 /tmp/tsc-domain-baseline.txt；终态域内过滤为空集。全库总数同步下降（并行批次在域外作业，总数波动不属本批）。域外文件未因本批新增错误（ExtendedViews/SettingsPanelsCapability 相关错误类在基线已存在，且数量下降 261→248）。

## 4. 门禁自验结果
- a. esbuild 逐文件：7/7 通过。
- b. tsc：域内 7 文件 135 → 0（逐文件不增达成，全部归零）。
- c. md5：desktop/src/out/renderer/assets/src-HCld2afU.js = f5edd6a1207c6d20008204829dad3923 ✓；styles-CdEGpc2x.js = 48d71d4874b0868d61fd35a328bf6ad5 ✓。

## 5. 需要的 export（登记）

### 5.1 域外属主未导出（declare 保留，待属主域补 export 后改 import）
| # | 属主文件 | 符号 | 定义行 | 消费方（本域 declare） |
|---|---|---|---|---|
| ① | SrcSharedA.tsx | providerIds | 5680 | StoresDeep PROVIDER_IDS |
| ② | Composer.tsx | loadSkillContext | 1131 | stores-workspace loadSkillContext |
| ③ | PaymentDeep.tsx | CodingPlanUpgradeDialogProvider | 10492 | AppRootLeaves 同名 declare |
| ④ | WorkspaceShell.tsx | CLOSE_ACTIVE_CONTEXT_EVENT | 4859 | AppRootLeaves 同名 declare |
| ⑤ | UsageStatsUiParts.tsx | TooltipProvider | 316 | AppRootLeaves TooltipProvider |
| ⑥ | SkillStore.tsx | GroupedDraftPlacement（interface） | 422 | AppRootLeaves 现以结构型 `{type; groupId?}` 内联对齐，导出后可具名 |
| ⑦ | QuickPickDeep.tsx | SessionIndexRow（interface）+ INITIAL_SESSION_INDEX_STATE.logEpoch 应为 `string \| null`（bundle schema hke@styles33313 `logEpoch: K()`=z.string()；现 935/981 误作 number） | 255 / 935 / 981 | services SessionIndex 边界 5 处 `as unknown as` 可在修复后收窄 |
| ⑧ | Modals.tsx | BaseServices（interface，可选） | 242 | AppRootLeaves DirectoryBrowserDialog 现用 `ComponentProps` 双重断言 |
| ⑨ | SkillStore.tsx | SkillsService（内部型） | 4209 | StoresDeep useTaskStoreStatic/useSkillsStoreStatic 静态面对齐所需 |
| ⑩–⑫ | 未重建属主（无行号可登）：F04 TabStore（pc/oc/hc）、键盘助手 ta/Qi/Rre、useTelemetryPlatform/agentEventSurface、schemas qOe/cke/Yke、帧助手 yS/_S/gS/pS/hS/Kke/vS/Tte/qke、zS/WS、sFt sortPinnedTasks、MCP 24015–25006 区、CodeViewer 68500 区（commentsWorkspaceKey/markCommentRestoredFromAttachment）、ZS useTaskListItems/h6 mapTasksToListItems | — | — | 对应 §2 各保留项 |

### 5.2 域内类型对齐项（属主在域内、型不对齐，留待后续波次统一语义后接线）
| # | 位置 | 差异 |
|---|---|---|
| ① | StoresDeep.useTaskStoreStatic/useSkillsStoreStatic ↔ SkillStore.useTaskStore/useSkillsStore | 静态面 getWorkspaceState().slashCommands 型（SlashCommandEntry[] vs SkillStore 状态型）、refresh 形参 SkillsService 属主⑨ |
| ② | StoresDeep.commandsStoreStatic ↔ stores-workspace.useCommandsStore | CommandsState.commands: CommandDescriptor[] vs declare 面 SlashCommandEntry[] |
| ③ | StoresDeep.pluginsStoreStatic/refreshSessionAfterPluginSync ↔ stores-workspace.usePluginsStore | refresh 形参 PluginService vs declare 面 PluginsAgentService |

## 6. 歧义裁决（AMBIGUOUS，bundle 锚点 + 调用面）
1. **workspaceKey（services 顶部，全应用高频符号）**：属主 = SkillStore.resolveWorkspaceKey（SkillStore.tsx:579，export 4436；bundle b/H）。非 SrcSharedA/B，非 styles 未重建区。已按真实属主接线，未臆造。
2. **providerSyncScopeKey = SrcSharedB.automationsWorkspaceKey**（3048）：bundle 中 Ti 与 ip/to 为同一函数体（`${identity?.trim() || path}` 构造），调用面 875/936/949 传 `{workspacePath, workspaceIdentity}` 对象，`(e: any)` 形参兼容。
3. **normalizeRpcError = SrcSharedA.extractErrorInfo**（448）：bundle ee@100 返回 `{message, code}`，与原 declare `{code?, message}` 一致。
4. **normalizeProvider（stores-workspace 原 ni）= SrcSharedA.resolveDefaultAgentCliProvider**（4662）：bundle 链 src Es@3841 → SrcSharedB `Es as ds` 再导出 → styles `ds as ni` 消费；函数体恒返回 `glm`，与 skillContextKey 消费面一致。
5. **isNewerMeta（stores-session 原 Mo）= StoresDeep.sessionActivityOf**：B5 标注有歧义，按调用面（读会话活动态比较新旧）裁决为 sessionActivityOf，非时间戳比较器。
6. **isZaiProviderFamily = SrcSharedA.isBuiltinProviderId**（非字面 "zai 族"）：bundle jt=_l 实为内置全族判定（调用面 1619 与 GLM_MODEL_IDS 并列为 builtin 作用域判据）。
7. **SessionIndexState.logEpoch 取 string**（services）vs QuickPickDeep 重建的 number：以 bundle schema hke@styles33313（`logEpoch: K()` = z.string()）裁决，services 保留 string，QuickPickDeep 侧登记修复（§5.1-⑦），边界 5 处 `as unknown as` 过渡。
8. **attachForeground 首参 = Record<string, unknown>**（非 string）：bundle 调用面 useRef({})@119305、parity Map 值、Conversation.tsx:7091 接口三方一致；原 declare `paneKey: string` 为重建误差。

## 7. 异常与遗留
1. **stores-tasks 本地 `automationLoadSeq`/`runNowInFlight`（410/411）与 StoresDeep 模块闭包（741/742）重复**：stores-tasks 自增本地序号传入 loadAutomationsIntoStore，而后者比较的是 StoresDeep 自己的闭包序号（StoresDeep 已导出 nextAutomationLoadSeq 供接线）。属语义问题，本批「只接线不改语义」→ 不动，留待后续波次按 bundle 裁决。
2. **services.tsx:64 `import { logger } from './SkillStore'` 保留原样**：并行 Lane-1 已在 SkillStore 增 `export { logger }`（UNIQUE_ADDEXPORT），该 import 已合法；域内其余 6 文件统一改接真属主 './logger'，两种路径并存不冲突。
3. **`declare ... any` 下游传播**：本域已无此类遗留（62 处 services 错误全部收敛）；域外消费面（如 ExtendedViews `unknown → AutomationsAgentService`）为既有错误，非本批引入。
4. **SettingsPanelsCapability 的 HooksService（`{[key: string]: unknown}`）传给收敛后的 store 动作**：该失配在基线即存在（原本地 HooksService 亦要求 loadHooks），非本批新增。
5. 两处 broken import（PaymentDeep/WorkspaceShell）按硬规则 5「属主域外未导出 → 登记并保留」回退为 declare，位置与签名均同逐字基准（src-reconstructed）。

## 8. 完工汇报数字
- 接线数：35 条 declare→真实 import（另 logger 真属主改接 6 处、类型收敛 import 4 组）。
- 保留数：114 条 declare（Lane-4 vendored 0 条在本域；全部为域外属主/未重建/型不对齐）。
- 错误数变化：域内 135 → 0（services 63→0、stores-core 1→0、stores-session 15→0、stores-tasks 19→0、stores-workspace 15→0、StoresDeep 1→0、AppRootLeaves 21→0）。
- 需要的 export 数：9 项具名登记（§5.1 ①–⑨）+ 未重建属主一批（§5.1 ⑩–⑫）+ 域内型对齐 3 项（§5.2）。
