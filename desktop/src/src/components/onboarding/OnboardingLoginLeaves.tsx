// A0-S4-4c: 自 modules/OnboardingLoginLeaves.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/onboarding/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * OnboardingLoginLeaves.tsx — F18 OnboardingLogin 族余量逐字重建（B5-02 批次）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本工作区现行 213,979 行，只读未改动）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，170,400 行）：
 *   desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 解码范围（行号互斥口径，本文件 = F18 余量）：
 *   js 205680–211384 + 213270–213616（计划口径/原始文件行号）
 *   ≈ 本工作区现行 out 文件 js 205970–211668 + 213554–213900
 *   （本工作区 out 文件较原始文件存在分段行漂移：登录区前段 +296、F18 主体 +290、
 *     i8t 起 +284；详见 OnboardingAppRootLeaves.report.md §0。本文件行号一律
 *     以现行 out 文件为准，便于直接回代核验。）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：现行 out js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 * [A] 登录 / OAuth 域：
 *   c4t → LOGIN_FAILED_MESSAGE            (205995 / 163717)  常量「登录失败，请重试」
 *   l4t → useOAuth                        (205996 / 163718)  OAuth 流程钩子
 *   M9  → familyDomainToProviderId        (206077 / 163794)  zai/bigmodel → providerId
 *   u4t → familyDomainLabel               (206080 / 163797)  Z.ai / BigModel
 *   d4t → identityDomain                  (206083 / 163800)  恒等（保留调用面）
 *   f4t → withFamilyMode                  (206086 / 163803)  modelProviderFamilyModes 置 apiKey
 *   p4t → familyDomainPatch               (206089 / 163809)  providerFamilyDomain 补丁
 *   m4t → apiKeyUrlForDomain              (206096 / 163816)  注册表取 apiKeyUrl
 *   h4t → shouldShowGetApiKeyLink         (206099 / 163819)
 *   g4t → applyApiKeyToProvider           (206102 / 163822)
 *   _4t → defaultModelKeyForProvider      (206105 / 163831)
 *   v4t → findSavedApiKeyForDomain        (206109 / 163835)
 *   y4t → savedApiKeyIfUntouched          (206113 / 163839)
 *   b4t → ApiKeyLoginView                 (206116 / 163845)  API key 登录视图（login.*）
 * [B] 登录流程视图：
 *   w4t → LoginEntryScreen                (206410 / 164049)  登录入口屏（hero 壳 + D4t）
 *   T4t → attemptMatchesSuccessProvider   (206425 / 164054)
 *   E4t → canAutoCompleteOAuth            (206428 / 164057)
 *   D4t → OAuthLoginPanel                 (206431 / 164060)  OAuth 登录面板（login.*）
 *   O4t → LoginHeader                     (206685 / 164194)
 *   k4t → LoginLogoBadge                  (206704 / 164201)  （REBRAND-011+111 aria-label）
 *   A4t → oauthButtonLabelKey             (206712 / 164206)
 *   j4t → oauthRegionTagKey               (206722 / 164216)
 *   M4t → OAuthRegionTag                  (206732 / 164226)
 *   N4t → providerSortRank                (206742 / 164237)
 *   P4t → sortLoginProviders              (206752 / 164247)
 *   F4t → resolveRetryProviderId          (206755 / 164250)
 * [C] 启动门控谓词（行段属 F18，语义为 F20 引导消费面）：
 *   I4t → shouldReportLaunchMarks         (206758 / 164257)
 *   L4t → readRendererLaunchMarks         (206761 / 164260)  __ZCODE_*__ window 标记
 *   R4t → countTotalUnreadTasks           (206769 / 164270)
 *   z4t → isResolvingStartupAuthState     (206782 / 164282)  ★OFFLINE-PATCH-001 直通
 *   B4t → isStartupRenderBlocked          (206787 / 164285)
 *   V4t → isProviderAvailabilityGateEnabled (206790 / 164288)
 *   H4t → isProviderStartupSyncPending    (206793 / 164291)
 *   U4t → needsFallbackWorkspaceBootstrap (206798 / 164294)
 *   W4t → isProviderStartupHydrationPending (206801 / 164297)
 * [D] 应用根组合叶子（行段属 F18，语义为 g8t/_8t 消费面）：
 *   J4t → SettingsLayer                   (206998 / 164401)  设置层（挂 j9）
 *   Y4t → MemoizedWorkspaceShell          (207063 / —)       memo(XJt)
 *   X4t → RootWorkspaceContent            (207064 / 164453)
 *   Z4t → trimmedOrUndefined              (207205 / 164518)
 *   Q4t → resolveActiveWorkspaceShellProps (207208 / 164521)
 * [E] 工作区恢复 / 远程重连域：
 *   D3t → workspaceKeyOfRestoreEntry      (208827 / 165632)
 *   O3t → buildPersistedTabPatch          (208830 / 165635)
 *   k3t → restoreCombinedWorkspaceSessions (208839 / 165647) ★MODULE-MAP「导入向导」为误标
 *   A3t → slugifyRemoteSeed               (208929 / 165733)
 *   j3t → remoteTargetSeedName            (208932 / 165736)
 *   M3t → remoteWorkspaceRuntimeLabelPrefix (208947 / 165752)
 *   N3t → matchReconnectingWorkspaceKeys  (208950 / 165755)
 *   P3t → MAX_REMOTE_LOGS_PER_WORKSPACE   (208963 / 165766)  = 50
 *   F3t → useRemoteConnectionLogs         (208964 / 165767)
 *   I3t → reconnectRemoteWorkspaceEntry   (209023 / 165826)
 *   B9  → isActiveTaskRuntimeStatus       (209132 / 165927)
 *   L3t → isTaskRuntimeActiveInState      (209135 / 165930)
 *   R3t → collectActiveTaskIds            (209139 / 165934)
 *   z3t → failActiveTasksForClosedTabs    (209149 / 165942)
 *   B3t → identityFromReconnectEvent      (209161 / 165959)
 *   V3t → shouldPersistClosedSessionFailure (209164 / 165962)
 *   H3t → reconnectRemoteWorkspaceByKey   (209169 / 165965)
 *   U3t → resolveSshReconnectGroup        (209181 / 165977)
 *   W3t → reconnectGroupWithSshReuse      (209189 / 165985)
 *   G3t → isWorkspacePresentInTabs        (209247 / 166047)
 *   K3t → cancelPendingReconnectRequests  (209258 / 166051)
 *   q3t → openRemoteWorkspaceFromHistory  (209275 / 166067)
 *   J3t → completeRemoteProjectSelection  (209333 / 166137)
 *   Y3t → useRemoteWorkspaceOrchestrator  (209393 / 166201)
 *   X3t → removedRemoteWorkspaceIdentities (209851 / 166613)
 *   Z3t → useRemoteTabSessionDisposal     (209865 / 166625)
 *   Q3t → useModelProviderSnapshotRefresher (209916 / 166671)
 * 〔A1-R6 改指：本节消费面之远程条目域符号 declare → SplitLayoutDeep canonical 真实 import——
 *   remoteWorkspaceKey←R2(sessionEntryWorkspaceKey) | workspaceIdentityOf←I2(buildRemoteWorkspaceKey)
 *   entryIdentity←L2(resolveEntryWorkspaceIdentity) | serializeRemoteTarget←Hn(stripRemoteTargetSecrets)
 *   withRemoteCredentials←z2(remoteTargetWithSecrets) | commitRemoteSessionsMutation←B2(applyRemoteConnectionResult)
 *   removeSessionsByWorkspaceKeys←oEt(removeRemoteSessionEntries)；别名保持，调用面逐字不变。
 *   cancelPendingRemoteConnection 面（K3t/Y3t，209263–209809）为 platform 服务方法直消费，
 *   与 RemoteConnectionDeep uEt 钩子（fOt 专用）无涉，不改指（裁决见 A1-R6.report.md §4）。〕
 * 〔A1-R7 改指（余量 declare 族，tombstone 各就其位）：
 *   serializeRemoteTarget←SrcSharedA.sanitizeWorkspaceDescriptor（R6 误录 SplitLayoutDeep
 *     §F-R6 更正——canonical 为 A0-S4-1 lib/workspaceUtils，facade 登记在案）
 *   sshHostKeyOfTarget←SrcSharedA.sshTargetIdentityKey（Pn，src a/Ms 两跳）
 *   createRequestId←SrcSharedB.generateUuid（xi，src cx/ot 两跳）
 *   normalizeConnectionError←FeedbackCenter.extractErrorMessage（MC 37651）
 *   getRemoteWorkspaceSession←sessionRegistryStore.getSessionById（tc 4428）
 *   unregisterRemoteSession←modules/services.unregisterSessionAndPurgeSyncState（Qs 4404）
 *   bind/unbind 注册族四枚←sessionRegistryStore bindWorkspacePath/…（$s/ec/Cse/wse 4416–4425）
 *   persistableWorkspaceTabs←SplitLayoutDeep.persistedWorkspaceSessions（V2 123475）
 *   normalizePersistedRemoteSessions←SplitLayoutDeep.persistedRemoteSessions（cEt 123478）
 *   resolveLastActiveTabIndex←SplitLayoutDeep 同名（Bne，src VC/BC 两跳）
 *   normalizeTaskBroadcastSessions=幻影删除（O3t 校正）；persistTabsPatch=死声明删除。
 *   附带：connectionTarget 链精化（RemoteSessionTarget）+ RegisteredSession/BaseServices
 *   消费面具型（见 sessionRegistryStore A1-R7 注）。〕
 * 〔A1-R8 改指（log 族余量 declare，tombstone 各就其位；platform 族侦查留批）：
 *   normalizeRemoteLogMessage←RemoteGapSegments.stripRemoteLogPrefixes（hEt 123747）
 *   appendRemoteLog←RemoteGapSegments.mergeRemoteLogProgressEntry（vEt 123762；RGS 导出宽化
 *     + ConnectionLogRow.id? 宽化在案；调用点 209002 无铸，A0 补铸随型面精化删除归真）
 *   syncRemoteWorkspaceModelProviders←modules/services.syncProviderRegistryAndReturn
 *     （Ks 4164 = async (e) => await vse(e)，vse 4237；旧 declare 之 any 面随删归零）
 *   setCurrentPlatform/setCurrentServices=死声明删除（全树零调用点）
 *   codeCommentsStore（FH 68562）死 declare 删除（真实消费面在 AppRootLeaves 广播簇，
 *     同批改指 Composer canonical——A1-R8 stores 普查 FH 四实例收敛）
 *   附带：RemoteConnectionLogEntry 精化（+id?、timestamp 宽化 string|number）
 *   platform/遥测引擎族（xw/re/iT/TPe/YPe/vFe + disposeStartupServiceRegistry 等）
 *   侦查在案；A1-R9 条件项收敛完成——六符号 bundle 真形均已有树内 canonical
 *   （xw=StoresDeep reportTelemetry、re=stores/e2eStoreBridge isE2EStoreBridgeEnabled、
 *   iT=setUiPerfPlatform、TPe=clearAllTelemetryTiming、YPe=reportLaunchToInputPerf、
 *   vFe=telemetryScopes disposeAllSupervisors），本文件 trackTelemetryEvent declare
 *   已改指、余四枚死 declare 删除。〕
 * [F] provider family 迁移域：
 *   e6t → presetSelectedKey               (209943 / 166688)
 *   V9  → codingPlanSelectedKey           (209946 / 166691)
 *   t6t → teamPlanSelectedKey             (209949 / 166694)
 *   n6t → firstSubscribedTeamPlanKey      (209956 / 166701)
 *   r6t → isTeamPlanKeySubscribed         (209984 / 166723)
 *   i6t → resolveOAuthFamilySelection     (210020 / 166747)
 *   H9  → FAMILY_DEFAULT_SELECTED_KEYS    (210036 / 166772)
 *   a6t → isFamilySelectionUsable         (210040 / 166782)
 *   o6t → findUnusableFamilyDomains       (210048 / 166790)
 *   s6t → migrateDefaultFamilySelectedKeys (210060 / 166800)
 *   c6t → fetchBigModelTeamProducts       (210078 / 166820)
 *   l6t → maybeUpgradeBigModelTeamPlan    (210090 / 166832)
 *   u6t → migrateFamilySelectionWithUpgrade (210110 / 166852)
 *   U9  → planProviderIdsForDomain        (210119 / 166859)
 *   d6t → codingPlanProviderFromKey       (210126 / 166862)
 *   W9  → fetchEntitlementSnapshot        (210134 / 166866)
 *   f6t → fetchTeamProductListResult      (210147 / 166882)
 *   p6t → fetchTeamProductListOrEmpty     (210160 / 166902)
 *   m6t → isCompleteTeamPlanKey           (210164 / 166906)
 *   h6t → refreshLatestFamilySelection    (210168 / 166910)
 *   g6t → refreshFamilySelectionKeepTeamPlan (210198 / 166944)
 *   _6t → refreshProvidersAfterStartupRestore (210239 / 166986)
 *   v6t → applyRestoredOAuthSession       (210288 / 167031)
 *   y6t → applyOAuthCallbackSuccess       (210295 / 167034)
 *   b6t → useOAuthSessionBootstrap        (210359 / 167089)
 * [G] 根桥接钩子：
 *   x6t → useTitleBarThemeSync            (210452 / 167192)
 *   S6t → buildWebRemoteControlWorkspaces (210467 / 167212)
 *   C6t → buildConnectedRemoteWorkspaces  (210497 / 167244)
 *   w6t → passThroughFlag                 (210510 / 167256)
 *   T6t → useRootPlatformBridge           (210513 / 167259)
 *   E6t → WSL_UNC_PATH_REGEX              (210684 / 167433)
 *   D6t → parseWslUncPath                 (210685 / 167434)
 *   G9  → openWorkspaceFolderEntry        (210692 / 167445)
 *   O6t → useConversationWorkspaceActions (210717 / 167469)
 *   k6t → paneWorkspaceScopePatch         (210753 / 167507)
 *   A6t → resolveActiveWorkspaceScope     (210759 / 167515)
 * [H] bots 广播桥 / diffs worker / 启动件：
 *   M6t → invalidUsageKeys                (211055 / 167798)  Set
 *   N6t → usageSanityKey                  (211056 / 167799)
 *   P6t → recordInvalidUsage              (211060 / 167803)
 *   F6t → isCompactSlashCommand           (211067 / 167806)
 *   I6t → resolveIncomingUsage            (211073 / 167810)
 *   L6t → isTaskBroadcastPayload          (211089 / 167822)
 *   R6t → matchTaskBroadcast              (211133 / 167828)
 *   z6t → runtimeStateOfBroadcastEvent    (211138 / 167833)
 *   B6t → isStreamEventBody               (211158 / 167853)
 *   V6t → isTaskStreamPayload             (211163 / 167858)
 *   H6t → matchTaskStreamBroadcast        (211175 / 167863)
 *   U6t → storeBroadcastConfigOptions     (211180 / 167868)
 *   W6t → shouldBumpTaskListVersion       (211188 / 167871)
 *   G6t → shouldApplyStreamBroadcast      (211195 / 167874)
 *   K6t → useBotsTaskBroadcastBridge      (211198 / 167877)
 *   q6t → createDiffsWorker               (211381 / 167992)
 *   J6t → resolveDiffsPoolSize            (211387 / 167998)
 *   Y6t → DiffsPoolOptionsSync            (211392 / 168003)
 *   X6t → DiffsWorkerPoolProvider         (211414 / 168021)
 *   Z6t → canSyncWebRemoteTasks           (211435 / 168041)
 *   Q6t → logDeferredWebRemoteSync        (211438 / 168049)
 *   $6t → RootStartupLoading              (211441 / 168052)  data-testid root-startup-loading
 *   e8t → StartupLogoSvg                  (211454 / 168059)  （REBRAND-013+113 + animate）
 *   t8t → useProviderAvailabilityLoginGuard (211481 / 168064)
 *   n8t → inferFamilyDomainFromCache      (211532 / 168119)
 *   r8t → migrateProviderFamilyDomain     (211540 / 168127)
 *   K9  → TDP_SEED_DEFAULTS               (211564 / 168153)  （i8t 消费，语义属 F20）
 *   q9  → tdpNamespacedId                 (211570 / 168159)
 *   J9  → buildTdpTurnOperations          (211573 / 168162)
 *   Y9  → defineTelemetryParityCase       (211666 / 168257)
 * [I] 欢迎门 / 插件市场 store / 通知音（213554–213900）：
 *   v8t → WelcomeGate                     (213554 / 170001)  更新窗 + 语言选择壳
 *   Q9  → pluginInstallationKey           (213619 / 170031)
 *   （无赋值）→ PluginMarketplaceStoreCreation (213621–213895 / 170035)  裸 Ae(...) 死创建
 *   y8t → TASK_NOTIFICATION_SOUND_URL     (213896 / 170364)
 *   $9  → sharedNotificationAudio         (213897 / —)
 *   b8t → getNotificationAudio            (213898 / 170366)
 * [J] A1-R11 携入：任务广播错误归一族（域外行段 52799–52924，DM 簇逐字转录）：
 *   Cw  → messageErrorCodeOverride        (40570)  bundle stub（return void 0）；A1-R12 收敛改指 StoresDeep
 *                                                  normalizeCaptchaCode（唯一真身）；余 3 消费 40680/54293/118783 属域外簇
 *   bM  → GENERIC_ERROR_MESSAGES          (52799)
 *   xM  → isPlainObjectValue              (52806)
 *   SM  → trimmedTextOrNull               (52809)
 *   CM  → parseJsonCandidate              (52813)
 *   wM  → readNestedField                 (52822)
 *   TM  → collectErrorTextsByPaths        (52829)
 *   IUe → collectErrorMessageCandidates   (52853)
 *   EM  → firstErrorTextByPaths           (52877)
 *   DM  → normalizeTaskBroadcastError     (52886)  消费点 4461/4480（task_error/task_warning）
 *
 * ----------------------------------------------------------------------------
 * 二、边界裁决（范围内已抽取段，只注记不转录）
 * ----------------------------------------------------------------------------
 *  1. s4t ZCodeLogoSvg（现行 205975–205994 / jsx 163712）→ 已在 Modals.tsx（原 205679+）。
 *  2. hero 三件 x4t/S4t/C4t（现行 206344–206409 / jsx 206054–206094 为原始口径）
 *     → 已在 ModalsLeaves.tsx。
 *  3. m3t ProjectSelectorHero（现行 207780–207806 / 原 207490–207516）与
 *     h3t…E3t 向导全件（$4t…E3t，现行 207217–208826 / 原 206927–208536）
 *     → 已在 Modals.tsx（Modals.report §2.4）。
 *  4. N9 AlertDialogStore（206804）/G4t（206817）/K4t（206861）/q4t（206862）/
 *     P9 AppDialogHost（206992）/$3t useAlertDialog（209940）→ 已在 Modals.tsx §5。
 *  5. j9 设置视图根（现行 205174–205974 / 原 204878–205679，s4t 前一件）→ 已在 Settings.tsx。
 *  6. j6t useWorkspaceActions（现行 210776–211054）行段在 F18 范围内，按任务指派
 *     归 F20 → AppRootLeaves.tsx 转录。
 *  7. Y4t = memo(XJt)：XJt 属 F07 WorkspaceShell.tsx，本文件仅保留 memo 包装。
 * ============================================================================
 */

import * as React from "react";
import { Select as SelectRoot } from '../../modules/Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { AlertTriangleIcon, LoaderCircle as SpinnerIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { CaptchaHostContainer } from '../../modules/ConversationLeaves';
import { Input, toast, usePlatform } from '../../modules/ImeComposition';
import { AppDialogHost, ConfirmDialog, DirectoryBrowserDialog, OnboardingDialog, useAlertDialog, useConfirmDialog } from '../../modules/Modals'; // +ConfirmDialog（原 q4t，A0-CLEANUP2 item 35 接线）；useConfirmDialog（原 U2，js 123493）
// A0-D-Misc 回滚注记：CodingPlanUpgradeDialogProvider（PaymentDeep）、CLOSE_ACTIVE_CONTEXT_EVENT（WorkspaceShell）
// 的前波 import 曾编译失败恢复基线 declare（本文件无调用面）；两者属主 export 已由 A0-CLEANUP B-30/B-32 落地（A0-CLEANUP2 复核）。
// ConfirmDialog 已由 A0-CLEANUP2 item 35 接入真实 import（上方）。
import { Alert, AlertDescription, SelectContent, SelectItem, SelectTrigger, SelectValue, SettingsView } from '../../modules/Settings';
import { logger, resolveWorkspaceKey as workspaceScopeKey } from '../../modules/SkillStore'; // workspaceScopeKey（原 Io，js 1368：两参实体键；前波误接 stores-session.workspaceScopeKey 单参形，A0-D-Misc 按 bundle R6t 裁决改接 resolveWorkspaceKey）
import { MemoizedWorkspaceRoot, type WorkspaceServices } from '../../modules/WorkspaceShell'; // A0-CLEANUP3 #36：Y4t=memo(XJt)=WorkspaceRoot 属主接线（原误包 yJt=WorkspaceShell）
import { extractErrorMessage as normalizeConnectionError, type FeedbackService } from '../../modules/FeedbackCenter'; // A1-R7：MC=extractErrorMessage 改指（原 normalizeConnectionError declare）
import { type MobileHomeResult, type WebRemoteSwitcherService } from '../../modules/WebRemote';
import { ConversationTelemetrySupervisor, registerBaseServices, syncProviderRegistryAndReturn as syncRemoteWorkspaceModelProviders, unregisterSessionAndPurgeSyncState as unregisterRemoteSession, useServices, useWorkspaceServices } from '../../modules/services'; // registerBaseServices（原 Sse；services/stores-core 双导出同实现，按本文件既有 services 导入面接 services）+ A1-R7：Qs=unregisterSessionAndPurgeSyncState 改指 + A1-R8：Ks@4164（async (e) => await vse(e)，vse@4237）= syncProviderRegistryAndReturn 改指
import { reportTelemetry as trackTelemetryEvent, normalizeCaptchaCode as messageErrorCodeOverride, resolveTelemetryProviderHost } from '../../modules/StoresDeep';
import type { UpdateState } from '../shell/TopBar'; // A1-R48：根面 getUpdateState?/onUpdateStateChanged? 改型同形 canonical（属主 TopBar@212；type-only 边，环安全） // A1-R9 条件项：原 xw（bundle 40457 = StoresDeep H.1 reportTelemetry 逐字）别名改指；调用点 1009（useOAuth startLogin）/3671（OAuth 成功上报）实测逐字通过（platform: PlatformService→TelemetryPlatform 方法双变可赋；TelemetryEventPayload→TelemetryReport 索引可赋）。环安全：StoresDeep 值导入闭包不达本文件（本文件唯一 import 源 = modules/OnboardingLoginLeaves shim，其值 import 源仅 AppRootLeaves 根 + settingsStore type-only）。A1-R12：原 Cw（40570）私有转录删除 → 别名改指 StoresDeep normalizeCaptchaCode（本批改回逐字 stub；DM 调用点逐字不变）。〔A1-R31〕+resolveTelemetryProviderHost（bw 40445/hNe 40454 canonical，StoresDeep@308）：telemetryLoginProviderName declare 收敛改指，见下墓碑
import { mergeRemoteLogProgressEntry as appendRemoteLog, stripRemoteLogPrefixes as normalizeRemoteLogMessage } from '../remote/RemoteGapSegments'; // A1-R8：hEt@123747=stripRemoteLogPrefixes、vEt@123762=mergeRemoteLogProgressEntry 改指（环安全：RemoteGapSegments 仅 import React/button/RemoteWizard/Modals/SrcSharedA/B/stores-core，不反入 onboarding）
import { useSettingsStore } from '../../modules/stores-core';
import { listCodingPlanSources as getModelProvidersCached, hasLoadedCodingPlanSources as isModelProviderSnapshotHydrated, hasActiveEntitlement } from '../../modules/UsageDeep'; // A1-R11：fM（52681）/pM（52684）改指 canonical（components/usage/UsageDeep.tsx 注册表，返回 ModelProvider[]——fetcher 证据 78266/78272/206174/209921 = modelProviderService.getAllCached/getAll）；4757 消费点经 ModelProviderRecord any 索引面双变可赋。〔A1-R27〕+hasActiveEntitlement（iM 52651 canonical；declare hasPlanEntitlement 收敛改指，见下墓碑）
import type { EntitlementSnapshot } from '../../modules/UsageDeep'; // 〔A1-R27〕iM 收敛型缝所依（W9/i6t 快照流精化，行依据见各函数注）
import { DEFAULT_CODE_PREVIEW_SETTINGS as defaultCodePreviewSettings } from '../../modules/MarkdownIntegration'; // 默认代码预览设置（原 lo，1040）
import { cn } from '../../modules/UtilsCn'; // 类名合并（原 Z）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // intl 上下文（原 G()）
import { Button } from '../../modules/button'; // Button（原 X，button-laUijeDG.js）
import { isWorkspaceKindTab } from '../../modules/WorkspaceTabsDeep'; // 原 oc（A1-R1：styles js 4487 逐字重建改指）
import { EMPTY_PANE_LAYOUT, focusedPaneId, hasSplitLayoutBindings, isReloadNavigationEntry, paneBindingById as paneById, persistableTabEntries, sessionEntryMapByKey, sessionRouterStore, splitLayoutStore, type PaneLayoutState as SplitPaneLayoutState, type SessionRouterGroup as SplitSessionRouterGroup, sessionEntryWorkspaceKey as remoteWorkspaceKey, buildRemoteWorkspaceKey as workspaceIdentityOf, resolveEntryWorkspaceIdentity as entryIdentity, remoteTargetWithSecrets as withRemoteCredentials, applyRemoteConnectionResult as commitRemoteSessionsMutation, removeRemoteSessionEntries as removeSessionsByWorkspaceKeys, persistedWorkspaceSessions as persistableWorkspaceTabs, persistedRemoteSessions as normalizePersistedRemoteSessions, resolveLastActiveTabIndex, type PersistedWorkspaceTabRecord, type RemoteSessionTarget } from '../../modules/SplitLayoutDeep'; // 原 K0/Z0/jwt/z0/T2/sEt/lEt/A2/s2（A1-R2：styles js 121301–123510 面板布局引擎逐字重建改指）+ A1-R6：R2/I2/L2/z2/B2/oEt 远程条目域改指 + A1-R7：V2/cEt/Bne 恢复条目域改指（Hn 改指更正迁 SrcSharedA；tombstone 见原 declare 位）
import { sanitizeWorkspaceDescriptor as serializeRemoteTarget, sshTargetIdentityKey as sshHostKeyOfTarget, providerIds } from '../../modules/SrcSharedA'; // A1-R7：Hn（R6 误录更正，canonical 见 lib/workspaceUtils）+ Pn=sshTargetIdentityKey 改指。〔A1-R32〕+providerIds（q ≡ mo ≡ W 4733，builtin: 前缀 7 键实体）：PROVIDER_IDS declare 收敛改指，见 @552 墓碑
import { generateUuid as createRequestId, getOAuthProviderFamilyByProviderId, resolveProviderFamilyMode, joinTestidParts } from '../../modules/SrcSharedB'; // A1-R7：xi=cx=generateUuid 改指（lib/uuid re-export）。〔A1-R28〕+resolveProviderFamilyMode（zi 真身 ≡ Gx / src 10062 `Gx as z` / styles 820 `z as zi` ≡ SrcSharedB@5555）：resolveFamilyMode declare 收敛改指，见下墓碑。〔A1-R30〕+getOAuthProviderFamilyByProviderId（ot ≡ Yx 8933 ≡ SrcSharedB@5576）：providerById declare 收敛改指，见下墓碑。〔A1-R41〕+joinTestidParts（原 qr 收敛改指，见下墓碑）。环安全：本行不新增环边（本文件→SrcSharedB 既有）
import { bindWorkspacePath as bindRemoteWorkspacePath, bindWorkspaceIdentity as bindRemoteWorkspaceIdentity, unbindWorkspacePath as unbindRemoteWorkspacePath, unbindWorkspaceIdentity as unbindRemoteWorkspaceIdentity, getSessionById as getRemoteWorkspaceSession, type RegisteredSession } from '../../stores/sessionRegistryStore'; // A1-R7：$s/ec/Cse/wse/tc registry 包装族改指（环安全：该文件值导入仅 ./zustand，type-only 边无运行时环）

/* ============================================================================
 * 0. 外部依赖的类型声明（跨 chunk / 它族已重建者，此处声明接口）
 * ==========================================================================*/

/** react-intl 风格 intl 对象——A0-D-Misc：useIntlContext 已接线 I18n.useZCodeIntl，此接口仅供本族签名引用 */
export interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}


/* --- 服务束（fs = useServices）--- */
export interface OAuthProviderInfo {
  id: string;
  displayName: string;
  order?: number;
  [key: string]: any;
}
export interface OAuthServiceLike {
  getProviders(): Promise<OAuthProviderInfo[]>;
  getActiveProvider(): Promise<string | null>;
  startOAuth(provider: string): Promise<{ authorizeUrl: string; state: string; provider: string }>;
  cancelPending(provider: string | null | undefined): Promise<void>;
  restoreCachedSessionState(): Promise<OAuthSessionRestoreResult>;
  handleCallback(url: string): Promise<OAuthCallbackResult>;
  logout(): Promise<void>;
}
export interface OAuthSessionRestoreResult {
  status: "authenticated" | "reauthentication-required" | string;
  userInfo: UserInfo | null;
  provider: string;
  [key: string]: any;
}
export interface OAuthCallbackResult {
  kind: "login" | "attribution" | string;
  provider: string;
  userInfo: UserInfo;
  [key: string]: any;
}
export interface UserInfo {
  id?: string;
  username?: string;
  displayName?: string;
  [key: string]: any;
}
export interface ModelProviderRecord {
  id: string;
  apiKey: string;
  enabled?: boolean;
  systemDisabledReason?: string | null; // A1-R11 型缝精化（bundle 真形）：对齐 UsageDeep.ModelProvider 及各族本地面（均 string | null）；fM 52681 返回 ModelProvider[] 对本面可赋
  updatedAt?: number;
  [key: string]: any;
}
export interface ModelProviderServiceLike {
  getAll(): Promise<ModelProviderRecord[]>;
  getAllCached(): ModelProviderRecord[];
  save(provider: ModelProviderRecord): Promise<void>;
  refreshCodingPlanApiKey(providerId: string): Promise<unknown>;
}
export interface AppSettings {
  providerFamilyDomain?: string | null;
  providerFamilyDomainUpdatedAt?: number;
  providerFamilyDomainMigrated?: boolean;
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  recentProjects: string[];
  askUserQuestionAutoResolutionEnabled?: boolean;
  [key: string]: any;
}
export interface SettingServiceLike {
  get(): Promise<AppSettings>;
  update(patch: Partial<AppSettings>): Promise<void>;
}
export interface FileServiceLike {
  ensureConversationWorkspace(): Promise<{ path: string }>;
  createScratchWorkspace(options: { name: string }): Promise<{ path: string }>;
  resolvePath(options: { path: string }): Promise<string>;
}
export interface CredentialServiceLike {
  load(key: string): Promise<string | null>;
  save(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}
export interface CodingPlanSubscriptionServiceLike {
  getEnterprisePricing(options: { authenticated: boolean }): Promise<{ productList: TeamProduct[] }>;
}
export interface TeamProduct {
  productId: string;
  organizationId?: string | null;
  projectId?: string | null;
  subscribed?: boolean;
  apiKeyStatus?: string;
  teamProjects?: Array<{ organizationId?: string | null; projectId?: string | null; apiKeyStatus?: string }>;
  [key: string]: any;
}
export interface UsageStatsServiceLike {
  // 〔A1-R27〕型缝精化 Promise<unknown> → Promise<EntitlementSnapshot>（行依据：同一 bundle 服务面 UsageDeep@580
  // `getEntitlementSnapshot(opts): Promise<EntitlementSnapshot>`；W9 210134 直返其结果，catch 归 null）。
  getEntitlementSnapshot(options: Record<string, unknown>): Promise<EntitlementSnapshot>;
}
export interface PluginsServiceLike {
  getOverview(options: { workspacePath: string; workspaceIdentity?: string }): Promise<{
    marketplaces: unknown[];
    availablePlugins: unknown[];
    installedPlugins: unknown[];
    capability: unknown;
  }>;
  addMarketplace(options: { workspacePath: string; workspaceIdentity?: string; source: string }): Promise<void>;
  removeMarketplace(options: { workspacePath: string; workspaceIdentity?: string; marketplace: string }): Promise<void>;
  updateMarketplace(options: { workspacePath: string; workspaceIdentity?: string; marketplace?: string }): Promise<{
    diagnostics?: Array<{ severity: string; message: string }>;
  }>;
  installPlugin(options: { workspacePath: string; workspaceIdentity?: string; pluginName: string; marketplace: string; scope: string }): Promise<void>;
  uninstallPlugin(options: { workspacePath: string; workspaceIdentity?: string; pluginName: string; marketplace: string; scope: string }): Promise<void>;
  setPluginEnabled(options: { workspacePath: string; workspaceIdentity?: string; pluginName: string; marketplace: string; scope: string; nativeScope?: string; enabled: boolean }): Promise<void>;
}
export interface ZcodeAgentServiceLike {
  syncAppRuntimePreferences(preferences: Record<string, unknown>): Promise<void>;
}
export interface BotsServiceLike {
  syncAppRuntimePreferences(preferences: Record<string, unknown>): Promise<void>;
}
export interface BroadcastMessage {
  channel: string;
  payload: any;
  [key: string]: any;
}
export interface BroadcastServiceLike {
  send(message: BroadcastMessage): Promise<unknown>; // A1-R10 2a 精化：bundle 真形——212886–212888 根装配以 services.broadcastService 注入 Nie（StoreProvider），Mie 1259 消费 e.send({channel,payload})；I18n BroadcastServiceLike 231–234 同面
  onMessage(handler: (message: BroadcastMessage) => void): { dispose(): void };
}
export interface ServicesBundle {
  oauthService: OAuthServiceLike;
  modelProviderService: ModelProviderServiceLike;
  settingService: SettingServiceLike;
  fileService: FileServiceLike;
  credentialService: CredentialServiceLike;
  codingPlanSubscriptionService: CodingPlanSubscriptionServiceLike;
  usageStatsService: UsageStatsServiceLike;
  broadcastService: BroadcastServiceLike;
  zcodeAgentService: ZcodeAgentServiceLike;
  botsService: BotsServiceLike;
  feedbackService: any;
  [key: string]: any;
}

/* --- 平台桥（l = usePlatform）--- */
export interface RemoteConnectionResult {
  success: boolean;
  sessionId?: string;
  error?: string;
  [key: string]: any;
}
export interface RemoteSessionClosedEvent {
  sessionId: string;
  reason?: string;
  exitCode?: number | null;
  signal?: string | null;
}
export interface BotRemoteWorkspaceReconnectedEvent {
  sessionId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
}
/** A1-R8 精化：+id?（bundle 209002 追加点以 `${label}-${timestamp}-${len}` 自造 id，型面须容缺失）、
 * timestamp 宽化 number → string | number（与 RemoteGapSegments.ConnectionLogRow 并集面对齐，
 * 双向可指派，改指 appendRemoteLog=mergeRemoteLogProgressEntry 所需）；消费面实测仅 2162/2165 两处。 */
export interface RemoteConnectionLogEntry {
  label?: string;
  level: string;
  message: string;
  timestamp: string | number;
  requestId?: string;
  id?: string;
}
export interface UpdateStateSnapshot {
  [key: string]: any;
}
export interface PlatformService {
  registerOAuthState(options: { state: string; provider: string }): void;
  openExternal(url: string): void;
  connectRemote(target: unknown, credentials: unknown, options?: Record<string, unknown>): Promise<RemoteConnectionResult>;
  disposeRemoteSession(sessionId: string): Promise<void>;
  cancelPendingRemoteConnection?(requestId: string): Promise<void> | void;
  onRemoteConnectionLog(handler: (entry: RemoteConnectionLogEntry) => void): () => void;
  onRemoteSessionClosed(handler: (event: RemoteSessionClosedEvent) => void): () => void;
  onBotRemoteWorkspaceReconnected(handler: (event: BotRemoteWorkspaceReconnectedEvent) => void): () => void;
  bindRemoteWorkspaceSessionContext?(options: { remoteSessionId: string; workspacePath: string; workspaceIdentity?: string | null }): Promise<void>;
  onFocusTab(handler: (path: string) => void): () => void;
  onNewTab(handler: () => void): () => void;
  onNewTask(handler: () => void): () => void;
  onOpenWorkspace(handler: () => void): () => void;
  onOpenWorkspacePath?(handler: (path: string) => void): () => void;
  onTaskNotificationClick(handler: (taskId: string) => void): () => void;
  onUpdateCheckResult?(handler: (result: any) => void): () => void;
  onCloseActiveContextRequest?(handler: () => void): () => void;
  onPostUpdateReleaseNotes(handler: (info: { version: string; title: string }) => void): () => void;
  acknowledgePostUpdateReleaseNotes(version: string): Promise<void>;
  onWebRemoteControlReconnectWorkspace?(handler: (request: { requestId: string; workspaceKey: string }) => Promise<{ requestId: string; workspaceKey: string; success: boolean; error?: string }>): () => void;
  syncWindowTabs(paths: string[]): void;
  syncWindowUnreadCount(count: number): void;
  syncWebRemoteControlTasks?(tasks: unknown[]): void;
  syncWebRemoteControlWorkspaces?(workspaces: unknown[]): void;
  setTitleBarTheme(theme: string): Promise<void>;
  setApplicationLocale(locale: string): Promise<void>;
  selectDirectory(): Promise<string | null>;
  activateOrSetWorkspace(path: string): Promise<{ activated: boolean }>;
  executeDesktopCommand(command: string): Promise<void>;
  /* A1-R48：canonical 富面增补联动——根 props 面须覆 canonical 必选员（AppRootLeaves@1901 PlatformProvider
   * 赋值链；索引签名不具名补足）。签名同形 canonical（源 = TopBar@164-190 转录；桥接字面量
   * desktopPlatformBridge@454- 全员在案，rendererEntry@107 DesktopBridge=any 推断）。 */
  openInFileManager(path: string): Promise<{ success: boolean; error?: string }>;
  openInEditor(editorId: string, path: string, opts?: unknown): Promise<{ success: boolean; error?: string }>;
  getInstalledEditors(): Promise<{ id: string; name: string; iconDataUrl?: string; [key: string]: unknown }[]>;
  canOpenCommunity(locale: string): Promise<boolean>;
  openCommunity(): void;
  exportLogs(): Promise<{ success: boolean; error?: string }>;
  /* A1-R48：canonical 富面增补联动——三员改型同形 canonical（赋值链 AppRootLeaves@1901）：
   * getDesktopSessionActivity 原弱形 {runningAgentSessionCount?} 窄于 canonical 全形（消费
   * AppRootLeaves@432-433 typeof 守卫相容）；getUpdateState/onUpdateStateChanged 原 UpdateStateSnapshot
   * 弱形与 canonical UpdateState 判别并不相赋，改型后 WelcomeGate@5141 useState<UpdateStateSnapshot | null>
   * 消费仍相容（UpdateState 对象形 → {[key: string]: any} 可赋；null 支同名）。 */
  getDesktopSessionActivity?(): Promise<{ runningAgentSessionCount: number; runningRepoWikiTaskCount: number }>;
  getUpdateState?(): Promise<UpdateState | null>;
  onUpdateStateChanged?(handler: (state: UpdateState | null) => void): () => void;
  onUpdateReady(handler: (version: string | null) => void): () => void;
  onApplicationLocaleChanged?(handler: (locale: string) => void): () => void;
  reportTelemetryEvent(...args: unknown[]): Promise<void>;
  reportArmsCustomEvent(...args: unknown[]): Promise<void>;
  [key: string]: any;
}

/* --- 遥测 / 追踪 --- */
export interface TelemetryEventPayload {
  elementName: string;
  eventRegion: string;
  eventType: string;
  eventExtraDetail?: Record<string, unknown>;
  userId?: string;
  talkId?: string;
  messageId?: string;
  [key: string]: any;
}
/* ── tombstone（A1-R9）：trackTelemetryEvent（原 xw）declare 删除，改经文件头真实
 *    import 别名改指（../../modules/StoresDeep reportTelemetry）；isTelemetryEnabled
 *    （原 re）死 declare 一并删除（全树零调用点；本文件之 re 消费面不存在，canonical
 *    isE2EStoreBridgeEnabled 消费面在 AppRootLeaves/WorkspaceTabsDeep/WorkspaceShell/
 *    FeedbackCenter）。TelemetryEventPayload 型面保留（modules/OnboardingLoginLeaves
 *    shim 362 仍在再导出）。 ── */

/* --- 设置 store（ko，stores-core.tsx）--- */
export interface LoginEntryRequest {
  id: string;
  providerId: string;
  purpose?: string;
}
export interface SettingsStoreState {
  user: UserInfo | null;
  theme: string;
  codePreviewSettings?: CodePreviewSettings;
  oauthError: string | null;
  oauthSuccessSeq: number;
  lastOAuthSuccessProvider: string | null;
  isRestoringOAuthSession: boolean;
  loginEntryRequest: LoginEntryRequest | null;
  setUser(user: UserInfo | null): void;
  setIsRestoringOAuthSession(value: boolean): void;
  setOAuthError(error: string | null): void;
  markOAuthSuccess(provider: string): void;
  markApiKeyLoginSuccess(modelKey: string | null): void;
  clearLoginEntryRequest(id?: string): void;
  markLoginEntryAttemptStatus(id: string, status: string): void;
  [key: string]: any;
}

export interface CodePreviewSettings {
  lightTheme: string;
  darkTheme: string;
  [key: string]: any;
}

/* --- UI 原语（横切层）--- */
/* ── tombstone（A0-S3c）：SelectRoot declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：AlertTriangleIcon/SpinnerIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const OrbitSpinnerIcon: React.FC<{ className?: string }>;
declare function ProviderIcon(providerId: string, className: string): React.ReactNode;
/* ── tombstone〔A1-R41〕：declare joinTestId（原 qr）删除 → 改指 SrcSharedB@5017 joinTestidParts（qr 真身：styles 601 `Xa as qr` ← src 9836 `Nb as Xa` ≡ Nb js 8464 ≡ joinTestidParts 逐字 `${e}-${t}`）。消费面实测 3 处改名改指：@1387/@1391（≡ bundle 206238/206247）/@1629（≡ 206590）；@268 导入面 +joinTestidParts。 ── */
declare const TESTID_LOGIN_API_KEY_PROVIDER: string;
declare const TESTID_LOGIN_API_KEY_INPUT: string;
declare const TESTID_LOGIN_API_KEY_ERROR: string;
declare const TESTID_LOGIN_API_KEY_CONTINUE: string;
declare const TESTID_LOGIN_API_KEY_CANCEL: string;
declare const TESTID_LOGIN_API_KEY_SKIP: string;
declare const TESTID_LOGIN_API_KEY_OPTION_BASE: string;

/* --- provider 常量与注册表 --- */
/* ── tombstone〔A1-R32〕：declare PROVIDER_IDS（原 q）删除 → 改指 SrcSharedA@2008 providerIds
 *    （q 真身：styles 725 `mo as q` ← src 9963 `W as mo` ≡ W 4733-4741，体逐字同构：
 *    builtin: 前缀 7 键 zai/zaiCodingPlan/zaiStartPlan/bigmodel/bigmodelCodingPlan/
 *    bigmodelStartPlan/zapi；链闭合）。
 *    本 declare 面 6 具名键 + [key: string] 索引契；canonical 无索引契，惟本文件消费
 *    全为静态键取（@1218/3369/3455/3473/3474/3480/3546/3572/3574/3583/3584 共 11 行
 *    17 处改名改指），零动态索引，收敛安全。
 *    负证据：styles 213969 `po as q` 为遮蔽（po=McpServerConfigSchema，别 import 块，
 *    异体）。 ── */
declare const BIGMODEL_PROVIDER_ID: string;
export interface ProviderFamilyDefinition {
  apiKeyUrl?: string;
  models?: Array<{ modelId: string }>;
  [key: string]: any;
}
declare const providerFamilyRegistry: Map<string, ProviderFamilyDefinition>;
declare function providerFamilyDefinitionOf(provider: ModelProviderRecord): ProviderFamilyDefinition | undefined;
declare function providerModelKey(providerId: string, modelId: string): string;
declare function setDefaultModelChoice(providerId: string, group: string, modelKey: string): void;
declare function isMissingCredentialsError(error: unknown): boolean;

/* --- 确认对话框 / 模态（Modals.tsx 已重建）--- */
export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
}
/* ── tombstone（A0-CLEANUP2 item 35）：ConfirmDialog（原 q4t）declare 删除 → import { ConfirmDialog } from './Modals'。 ── */
/* ── 墓碑〔A1-R24〕：declare CodingPlanUpgradeDialogProvider / CLOSE_ACTIVE_CONTEXT_EVENT 删除（基线残留）。
 *    证据：本文件零消费（grep 仅 247 回滚注记与本两位；无调用面）；属主 export 已落地——
 *    CodingPlanUpgradeDialogProvider ≡ components/payments/PaymentDeep.tsx 9998（原 krt，89141，已 export）；
 *    CLOSE_ACTIVE_CONTEXT_EVENT ≡ components/shell/WorkspaceShell.tsx 4736（原 r7，186215/150092，已 export）。
 *    原注：「基线 declare：PaymentDeep/WorkspaceShell 未导出，需要的 export 已登记」（247 回滚注记同证）。 ── */
/* ── tombstone〔A1-R44〕：declare RemoteConnectionDialog（原 pOt 族）删除——活消费面在 modules/AppRootLeaves.tsx（其本地 declare + 消费暂代式）；本文件为零消费重复 declare（全文 grep 实测仅本 declare 行），纯删碑。证据见 A1-R44.report.md §二。 ── */
declare const UpdateStatusWindow: React.FC<{
  platform: PlatformService;
  version: string | null;
  updateState: UpdateStateSnapshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edgeToEdge?: boolean;
  showOverlay?: boolean;
}>;
declare const IntlProviderShell: React.FC<{ initialLocale: string | null; children?: React.ReactNode }>;

/* --- 工作区 shell / 边界件 --- */
declare const ScopeBoundary: React.FC<{ scope: string; resetKeys: unknown[]; variant: string; className?: string; children?: React.ReactNode }>;
declare const WorkspaceTelemetryProvider: React.FC<{
  enabled: boolean;
  foregroundEnabled: boolean;
  services: ServicesBundle;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string;
  children?: React.ReactNode;
}>;
declare const ServicesProvider: React.FC<{ services: ServicesBundle; children?: React.ReactNode }>;

/* --- tab / 任务 store 层 --- */
export interface WorkspaceTab {
  id: string;
  label?: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspacePurpose?: string;
  remoteSessionId?: string;
  remoteTarget?: unknown;
  kind?: string;
  [key: string]: any;
}
/* ── tombstone〔A1-R41〕：declare isWorkspaceTab 删除——另形型卫（null 容忍 + workspacePath 窄化）为 declare 期接口近似，非 oc 真身（R40 §四.3 留批闭合）。消费语义取证：10 消费面（2237/2558/2636/2690/2760/2914/3077/3084/3278/3279）全传 WorkspaceTab[] 非空元素（null 容忍为死语义）；窄化面 `& { workspacePath: string }` 空转（WorkspaceTab.workspacePath 本就必填）。bundle 逐点真身 = oc（208915 filter / 209184 flatMap / 209676 filter / 209683 map 等，逐字对照在案）≡ WorkspaceTabsDeep isWorkspaceKindTab@328（A1-R1 逐字重建，res judicata；本文件 @265 既有 import，@3992/@4020/@4198 同式消费先例）→ 一符一家收敛改指：10 消费面改名 isWorkspaceKindTab，不保留 declare、不实体化助手（真身在位，无虚构代码）。 ── */
export interface TabStoreState {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  activeWorkspacePath: string | null;
  activeWorkspaceIdentity: string | null;
  addTab(path: string, patch?: { workspaceIdentity?: string; workspacePurpose?: string; remoteSessionId?: string; remoteTarget?: unknown; localWorkspacePath?: string }): void;
  activateTabByPath(path: string, options?: { workspaceIdentity?: string }): boolean;
  ensureWorkspaceTab(path: string, patch?: { remoteSessionId?: string; remoteTarget?: unknown; workspaceIdentity?: string | null; localWorkspacePath?: string }): void;
  restoreTabs(entries: unknown[], activeIndex: number): void;
  completeTabRestore(entries: unknown[]): void;
  setState(mutator: (state: TabStoreState) => Partial<TabStoreState>): void;
  getState(): TabStoreState;
  [key: string]: any;
}
/* ── tombstone〔A1-R41〕：declare useTabStore（原 pc）/useTabStoreApi（原 hc）删除——本文件零消费（死 declare；全文 grep 实测）。
 * 真身 = WorkspaceTabsDeep useWorkspaceTabStore@686 / useWorkspaceTabStoreApi@698（A1-R1 逐字；一符一家，R40/R41 PD-α 簇同链；Sidebar@1129 死碑先例）。 ── */
export interface TaskStoreState {
  workspaces: Record<string, WorkspaceTaskState>;
  activeTaskId: string | null;
  getWorkspaceState(workspacePath: string, workspaceIdentity?: string | null): WorkspaceTaskState;
  setTaskRuntimeState(workspacePath: string, taskId: string, state: string | undefined, error?: string | undefined, workspaceIdentity?: string | null): void;
  setTaskPermissionRequest(workspacePath: string, taskId: string, request: unknown, workspaceIdentity?: string | null): void;
  removeTaskPermissionRequest(workspacePath: string, taskId: string, requestId: string, workspaceIdentity?: string | null): void;
  setTaskElicitationRequest(workspacePath: string, taskId: string, request: unknown, workspaceIdentity?: string | null): void;
  removeTaskElicitationRequest(workspacePath: string, taskId: string, requestId: string, workspaceIdentity?: string | null): void;
  setTaskError(workspacePath: string, taskId: string, error: unknown, workspaceIdentity?: string | null): void;
  setTaskContextWindow(workspacePath: string, taskId: string, size: number, workspaceIdentity?: string | null): void;
  setTaskUsage(workspacePath: string, taskId: string, usage: unknown, workspaceIdentity?: string | null): void;
  setTaskApiRetryStatus(workspacePath: string, taskId: string, status: unknown, workspaceIdentity?: string | null): void;
  bindRuntimeProvider(workspacePath: string, provider: string, workspaceIdentity?: string | null): void;
  bumpTaskListVersion(workspacePath: string, workspaceIdentity?: string | null): void;
  setActiveTaskId(workspacePath: string, taskId: string, workspaceIdentity?: string | null): void;
  startDraft(workspacePath: string, providerId?: string, workspaceIdentity?: string | null, options?: { groupedDraftPlacement?: string }): void;
  requestComposerTextInsert(workspacePath: string, text: string, workspaceIdentity?: string, mention?: unknown): void;
  deactivateActiveGroup?(): void;
  [key: string]: any;
}
export interface WorkspaceTaskState {
  activeTaskId: string | null;
  taskRuntimeByTaskId: Record<string, TaskRuntimeEntry>;
  taskListCache?: Array<{ taskId: string; workspacePath: string; status?: string; [key: string]: any }>;
  optimisticTaskListByTaskId: Record<string, { status: string; [key: string]: any }>;
  [key: string]: any;
}
export interface TaskRuntimeEntry {
  status: string;
  usage?: TaskUsage | null;
  [key: string]: any;
}
export interface TaskUsage {
  used: number;
  size: number;
  cost?: number;
  cache?: unknown;
  breakdown?: unknown;
  [key: string]: any;
}
declare const taskStore: { getState(): TaskStoreState };
/* ── tombstone（A1-R2）：sessionRouterStore（原 A2 js 122714）declare 已删除，改经文件头真实 import（../../modules/SplitLayoutDeep）消费。 ── */
export interface SessionRouterGroup {
  primaryBinding: { restoredUnvalidated?: boolean; [key: string]: any };
  panes: Record<string, { restoredUnvalidated?: boolean; [key: string]: any }>;
  [key: string]: any;
}
/* ── tombstone（A1-R2）：splitLayoutStore（原 s2 js 121720）declare 已删除，改经文件头真实 import（../../modules/SplitLayoutDeep）消费。 ── */
/* ── tombstone（A1-R8）：codeCommentsStore（原 FH js 68562）死 declare 删除——本文件零调用点
 *    （实测 grep 仅余声明位）；FH 真实消费面在 AppRootLeaves 广播监听簇（212998/213003），
 *    该处已改指 canonical（modules/Composer useCodeCommentsStore，A1-R8 双实例收敛）。 ── */
/* ── tombstone（A1-R6）：remoteWorkspaceKey（原 R2=sessionEntryWorkspaceKey，js 123306，
 *    §E 邻接域）declare 删除 → 真实 import（sessionEntryWorkspaceKey as remoteWorkspaceKey，
 *    参型/返回逐字同形：`workspaceIdentity?.trim() || workspacePath`）。 ── */
/* ── tombstone（A1-R6）：workspaceIdentityOf（原 I2=buildRemoteWorkspaceKey，js 123297）/
 *    entryIdentity（原 L2=resolveEntryWorkspaceIdentity，js 123305）/
 *    serializeRemoteTarget（原 Hn，src-HCld2afU.js 2–13；A1-R6 改指 SplitLayoutDeep，
 *    A1-R7 更正为 SrcSharedA.sanitizeWorkspaceDescriptor——重复 canonical 删除，见 SplitLayoutDeep §F-R6 更正注）/
 *    withRemoteCredentials（原 z2=remoteTargetWithSecrets，js 123362）declare 删除 →
 *    真实 import（SplitLayoutDeep §F canonical / SrcSharedA，别名保持调用面，见文件头）。
 *    型别注：L2 参型含 target: RemoteSessionTarget——本文件消费面多传含 target 之条目
 *    （本地 RemoteSessionEntry.target: any），可赋值；唯一 WorkspaceTab 面无具名 target 之
 *    消费点（restoreCombinedWorkspaceSessions 远程分支）以行注 cast 达参型（见调用点）；
 *    identityFromReconnectEvent 之 options.target 由 unknown 精化为 RemoteSessionTarget
 *    （调用点传 session.target: any，行注在案）。 ── */
export interface RemoteSessionMutation {
  entry?: unknown;
  nextRemoteSessions: RemoteSessionEntry[];
  credentialsToSave: Array<{ key: string; value: string }>;
  credentialKeysToDelete: string[];
}
/* ── tombstone（A1-R6）：commitRemoteSessionsMutation（原 B2=applyRemoteConnectionResult，
 *    js 123416）declare 删除 → 真实 import（applyRemoteConnectionResult as …，见文件头）。
 *    型别注：canonical 入参 RemoteConnectionResultInput.remoteSessions 为 SplitLayoutDeep
 *    RemoteSessionEntry[]（含 kind/lastOpenedAt 必具面）——本文件局部 RemoteSessionEntry
 *    经 A1-R6 精化补 kind/lastOpenedAt 二必具面（见接口注），可赋值；返回 RemoteConnectionResult →
 *    本文件 RemoteSessionMutation（commitRemoteWorkspaceSessionMutation 参型）亦可赋值
 *    （entry?: unknown / nextRemoteSessions 经索引签名回收）。 ── */
/** A1-R6 型别精化：按 bundle 真实面补 kind/lastOpenedAt 二必具面（与 SplitLayoutDeep §E
 *  RemoteSessionEntry 基准对齐），满足 B2/oEt canonical 参型可赋值性；树内无字面量构造点
 *  （值皆自 declare 归一化器与 canonical 返回流入），精化安全。target 仍 A0 期 any
 *  （connectionTarget 链已于 A1-R7 精化，见各调用点行注；本接口 target 精化仍候选）。 */
export interface RemoteSessionEntry {
  kind: `remote`;
  workspacePath: string;
  workspaceIdentity?: string | null;
  localWorkspacePath?: string;
  target: any;
  lastOpenedAt: number;
  lastConnectionStatus?: string;
  lastConnectionError?: string;
  [key: string]: any;
}
/* ── tombstone（A1-R7）：sshHostKeyOfTarget（原 Pn=sshTargetIdentityKey，src-HCld2afU.js
 *    60–68 本地 a，导出 a as Ms@9758，styles `Ms as Pn`@527 两跳）declare 删除 →
 *    真实 import（SrcSharedA re-export lib/workspaceUtils，A0-S4-1 已转录；别名保持）。 ── */
/* ── tombstone（A1-R7）：getRemoteWorkspaceSession（原 tc，js 4428）declare 删除 →
 *    真实 import（sessionRegistryStore.getSessionById as …）。返回 RegisteredSession | null：
 *    A1-R7 具型 RegisteredSession.target?: RemoteSessionTarget + BaseServices.fileService?
 *    （均按消费面，见 sessionRegistryStore 注）。原局部 RemoteWorkspaceSession 接口
 *    （A0 期本地代理型）随之删除——消费面型别改以 RegisteredSession 为准。 ── */
/* ── tombstone（A1-R7）：unregisterRemoteSession（原 Qs，js 4404）declare 删除 →
 *    真实 import（modules/services unregisterSessionAndPurgeSyncState as …；
 *    实现在 services/providerRegistrySync.ts，Qs+_se 逐字同形）。 ── */
/* ── tombstone（A1-R7）：bindRemoteWorkspacePath/bindRemoteWorkspaceIdentity/
 *    unbindRemoteWorkspacePath/unbindRemoteWorkspaceIdentity（原 $s/ec/Cse/wse，
 *    js 4416/4422/4419/4425，皆 Zs registry store 之薄包装）declare 删除 →
 *    真实 import（sessionRegistryStore bindWorkspacePath/bindWorkspaceIdentity/
 *    unbindWorkspacePath/unbindWorkspaceIdentity as …，A0-S4-3 已转录；别名保持）。 ── */
/* ── tombstone（A1-R7）：createRequestId（原 xi=generateUuid，src-HCld2afU.js 8710–8719
 *    本地 cx，导出 cx as ot@9982，styles `ot as xi`@743 两跳；sx/ox 助手随）declare 删除 →
 *    真实 import（SrcSharedB re-export lib/uuid，A0-S4-1 已转录；别名保持）。 ── */
/* ── tombstone（A1-R7）：normalizeConnectionError（原 MC，js 37651）declare 删除 →
 *    真实 import（FeedbackCenter.extractErrorMessage as …，A0 期已转录）。
 *    型别注：canonical 参型 unknown 宽于旧 declare（string | undefined），调用面兼容。 ── */
/* ── tombstone（A1-R7）：normalizeTaskBroadcastSessions declare 删除——幻影符号：
 *    bundle O3t（js 208830）真形无此归一化步（直以原始 sessions 入 lEt/filter），
 *    A0 期转录误插。buildPersistedTabPatch 已按 bundle 校正（本批），
 *    该 declare 无对应 bundle 符号，不立改指。 ── */
/* ── tombstone（A1-R7）：normalizePersistedRemoteSessions（原 cEt，js 123478）declare 删除 →
 *    真实 import（SplitLayoutDeep.persistedRemoteSessions as …，本批 §F-R7 转录）。 ── */
/* ── tombstone（A1-R6）：removeSessionsByWorkspaceKeys（原 oEt=removeRemoteSessionEntries，
 *    js 123403）declare 删除 → 真实 import（removeRemoteSessionEntries as …，见文件头）。
 *    参型/返回同形（条目数组 + 工作区键列表 → {nextRemoteSessions, credentialKeysToDelete}）；
 *    条目可赋值性同 commitRemoteSessionsMutation 碑注。 ── */
/* ── tombstone（A1-R7）：persistableWorkspaceTabs（原 V2，js 123475）declare 删除 →
 *    真实 import（SplitLayoutDeep.persistedWorkspaceSessions as …，本批 §F-R7 转录）。
 *    型别注：返回 PersistedWorkspaceTabRecord[]（A0 declare 作 WorkspaceTab[]）；
 *    恢复循环消费面（kind/workspacePath/workspacePurpose/workspaceIdentity/
 *    remoteTarget）皆在记录面具名，1983 行 entryIdentity 调用以交叉 cast 达参型。
 *    附带裁决（R6 §7 项 4 疑点）：V2 ≢ sEt——V2 读 lastWorkspaceSession，
 *    sEt=persistableTabEntries 为页签→条目映射，两符号不同源。 ── */
/* ── tombstone（A1-R7）：resolveLastActiveTabIndex（原 Bne，src 9624–9628 VC，
 *    经 t-as-Bne 两跳；BC 助手随）declare 删除 → 真实 import（SplitLayoutDeep
 *    本批 §F-R7 转录，同名无需别名）。型别注：返回 number | null（A0 declare 误作
 *    number；bundle 空数组返 null），调用面皆相等比较，兼容。 ── */
/* ── tombstone（A1-R7）：persistTabsPatch declare 删除——死声明：A0 期对 O3t 之
 *    冗余前置声明，O3t 真形已以 buildPersistedTabPatch 转录在案（本文件，208830），
 *    此 declare 从未被消费。 ── */
/* ── tombstone（A1-R2）：persistableTabEntries（原 sEt js 123457）declare 已删除，改经文件头真实 import（../../modules/SplitLayoutDeep）消费。
 *    改指附带校正：bundle sEt 第二参为 Map（调用方 O3t 先以 lEt 建键值映射），
 *    旧 declare 误作数组面；调用点按 bundle js 208830 补 sessionEntryMapByKey（原 lEt js 123481）包裹。 ── */
/* ── tombstone（A1-R8）：normalizeRemoteLogMessage（原 hEt js 123747）declare 删除 → 真实 import
 *    stripRemoteLogPrefixes as normalizeRemoteLogMessage（../remote/RemoteGapSegments，canonical 已就位）。 ── */
/* ── tombstone（A1-R8）：appendRemoteLog（原 vEt js 123762）declare 删除 → 真实 import
 *    mergeRemoteLogProgressEntry as appendRemoteLog（../remote/RemoteGapSegments；RGS 侧导出宽化 + 行注在案）。
 *    调用点附带校正：bundle 209002 无 `as RemoteConnectionLogEntry` 铸（A0 期补铸，型面精化后删除归真）。 ── */
/* ── tombstone（A1-R8）：syncRemoteWorkspaceModelProviders（原 Ks js 4164 = async (e) => await vse(e)，
 *    vse@4237）declare 删除 → 真实 import syncProviderRegistryAndReturn as syncRemoteWorkspaceModelProviders
 *    （../../modules/services 105 行 re-export，实体在 services/providerRegistrySync.ts，A0-S4-3 逐字转录）。
 *    附带收益：旧 declare 之 remoteZCodeSessionService: any 随删归零。 ── */
declare function refreshPinnedTasks(options: { sessionId: string; workspacePath: string; workspaceIdentity?: string | null }): Promise<void>;
declare function refreshTimelineTasks(options: { sessionId: string; workspacePath: string; workspaceIdentity?: string | null }): Promise<void>;
/* ── tombstone〔A1-R44〕：死 declare 簇（4 件）删除：isSameWorkspace / persistDraftSnippet（原 hH 族）/ DRAFT_SNIPPET_KIND_NEW_TASK / isWebRemoteControlRuntime。
 * 活消费面在 modules/AppRootLeaves.tsx（其本地 declare + 消费暂代式）；本文件为零消费重复 declare（全文 grep 实测仅本 declare 行），纯删碑。证据见 A1-R44.report.md §二。 ── */


/* ── tombstone（A1-R2）：hasSplitLayoutBindings（原 jwt js 121716）/paneById（原 T2 js 121528，改指经别名 paneBindingById as paneById）/
 *    focusedPaneId（原 Z0 js 121533）/EMPTY_PANE_LAYOUT（原 K0 js 121527）declare 已删除，
 *    改经文件头真实 import（../../modules/SplitLayoutDeep）消费。 ── */
declare function isKeyCombo(event: React.KeyboardEvent | KeyboardEvent, key: string): boolean;
/* ── tombstone〔A1-R44〕：declare DESKTOP_COMMANDS 删除——活消费面在 modules/AppRootLeaves.tsx（其本地 declare + 消费暂代式）；本文件为零消费重复 declare（全文 grep 实测仅本 declare 行），纯删碑。证据见 A1-R44.report.md §二。 ── */
export interface PaneWorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string | null;
}
export interface PaneLayoutState {
  panes: Record<string, { workspaceScope: PaneWorkspaceScope; [key: string]: any }>;
  [key: string]: any;
}

/* --- 模型 provider 快照 / 权益 --- */
/* ── tombstone（A1-R11）：declare getModelProvidersCached（原 fM，52681）删除，改经文件头 modules/UsageDeep import 消费
 *    （canonical = components/usage/UsageDeep.tsx listCodingPlanSources，`return oM` 逐字；返回 ModelProvider[]）。
 *    双实例收敛证据：bundle fM 唯一真身 52681；终端消费实测 4757（forceRefresh 分支）。 ── */
/* ── tombstone（A1-R11）：declare isModelProviderSnapshotHydrated（原 pM，52684）删除，改经文件头 modules/UsageDeep import 消费
 *    （canonical = components/usage/UsageDeep.tsx hasLoadedCodingPlanSources，`return sM` 逐字）。
 *    双实例收敛证据：bundle pM 唯一真身 52684；终端消费实测 3179/3194。 ── */
/* ── tombstone（A1-R11）：declare subscribeModelProviders（原 hM，52695）删除。负证据：本文件无活调用点（仅存 declare）；
 *    canonical = components/usage/UsageDeep.tsx subscribeCodingPlanSources（hM 52695 逐字），活消费面在 modules/AppRootLeaves（本批另行改指）。 ── */
declare function setModelProvidersFallback(providers: ModelProviderRecord[]): void;
declare function hasUsableProvider(providers: ModelProviderRecord[]): boolean;
declare function shouldForceLoginEntry(options: { providers: ModelProviderRecord[]; user: UserInfo | null }): boolean;
declare function refreshModelProviderSnapshot(loader: () => Promise<ModelProviderRecord[]> | ModelProviderRecord[], options?: { force?: boolean; cachedOnly?: boolean }): Promise<void>;
/* ── tombstone〔A1-R30〕：declare providerById（原 ot 面）删除 → 改指 getOAuthProviderFamilyByProviderId
 *    （ot 真身：styles 445 `B as ot` ← src 9672 `Yx as B` ≡ Yx 8933 ≡ SrcSharedB@5576，链闭合（R29 立链））。
 *    消费面实测：@3455（i6t resolveOAuthFamilySelection 体内）≡ bundle 210021
 *    （`let t = ot(e.providerFamilyDomain === \`zai\` ? q.zai : q.bigmodel)`），改名改指。
 *    型缝：canonical 返回 any，消费面依原 declare 契据（ModelProviderRecord | undefined）窄化（见该点注）。
 *    负证据：本文件 providerById 无第二消费。 ── */
/* ── tombstone（A1-R27）：declare hasPlanEntitlement（原 iM 双参面，52651–52655）删除，改经文件头
 *    modules/UsageDeep import hasActiveEntitlement 消费（canonical = components/usage/UsageDeep.tsx，A1-R11 转录）。
 *    双实例收敛证据：bundle iM 唯一真身 52651；本面消费实测 = i6t 210023/210032 ≡ 本文件
 *    resolveOAuthFamilySelection@3448 两处（3457/3466，双参形）；同批 PaymentDeep@214 墓碑（A6e 单参面）同收敛。
 *    负证据：bundle 内 iM 无第二定义。 ── */
declare function bigmodelTeamPlanKey(parts: { productId: string; organizationId: string; projectId: string }): string;
declare function parseTeamPlanKey(key: string): { productId: string; organizationId?: string; projectId?: string } | null;
declare function isSameTeamPlanKey(a: string, b: string): boolean;
/* ── tombstone〔A1-R28〕：declare resolveFamilyMode（原 zi）删除 → 改指 resolveProviderFamilyMode（zi 真身：
 *    styles 820 `z as zi` ← src 10062 `Gx as z` ≡ Gx ≡ SrcSharedB@5555 `return t?.[e] ?? \`oauth\``，链闭合）。
 *    消费面实测：@3509（s6t migrateDefaultFamilySelectedKeys）≡ bundle 210066、@3541（l6t
 *    maybeUpgradeBigModelTeamPlan）≡ bundle 210094，改名改指。负证据：bundle 内 zi 无第二真身
 *    （其余消费面分流见 Home 侧 zi 墓碑）。 ── */
declare function familyModesPatch(domain: string, modes: Record<string, string> | undefined): Record<string, string>;
declare function familyDomainOfProvider(provider: string | null): "zai" | "bigmodel" | null;
declare function familyDomainOfProviderId(providerId: string): "zai" | "bigmodel" | null;
declare function isProviderEnabledForFamily(provider: ModelProviderRecord): boolean;
/* ── tombstone〔A1-R44〕：declare resolveFamilyDomainAfterLogout（原 yQt 族）删除——活消费面在 modules/AppRootLeaves.tsx（其本地 declare + 消费暂代式）；本文件为零消费重复 declare（全文 grep 实测仅本 declare 行），纯删碑。证据见 A1-R44.report.md §二。 ── */
declare function persistProviderFamilyDomain(settingService: SettingServiceLike, domain: string): Promise<void>;
/* ── tombstone〔A1-R31〕：declare telemetryLoginProviderName（原 bw）删除 → 改指 StoresDeep resolveTelemetryProviderHost（bw 真身：styles 40445，q=PROVIDER_IDS declare 面 + tr≡isZaiPlanProviderId 消费；StoresDeep@308 A0 实体逐字同构，含 ??`` 空串型缝；消费 @3791 改指，@3841/@3848 面不变。负证据：bundle 内 bw 唯一真身）。 ── */

/* --- quota / captcha 助手（i8t 断言消费，它族已建）--- */
/* ── tombstone（A1-P1-B2）：declare resolveQuotaBannerModel（原 I0，js 118978）/ quotaDismissKey（原 L0，js 119069）
 *    + QuotaBannerModel 接口删除——双实例裁定：bundle 唯一真身 = components/conversation/ConversationQuotaModel
 *    resolveQuotaAssertion/quotaDismissKey（本批逐字）；本件双 declare 全树零消费（负证据），
 *    parity 消费面在 AppRootLeaves（s8t 域，同批改指真身）。 ── */
/* ── tombstone（A1-R14）：captchaProviderOfTaskMeta（原 KSt，118284）/ captchaEventKeys（ACt 118738 之
 *    declare 期误读面：真身返回 ::连接串而非键数组）/ CaptchaGatekeeper 接口（kCt 返回面）/
 *    createCaptchaGatekeeper（原 kCt，118735）/ captchaPhase（原 A0，118765）/
 *    recordCaptchaFailure（原 j0，118772）/ isCaptchaDecisionHandled（原 M0，118776）——
 *    六 declare + 一接口全删：本文件零调用点（实测 grep 仅余声明位，A1-R8/R9 死 declare 先例同律）。
 *    kCt/ACt/A0/j0/M0/CaptchaGatekeeper canonical = ConversationLeaves §5b 逐字实体（A1-R14）；
 *    KSt 真身未转录（依赖 GSt/Ie/Uq），活 declare 面独存于 AppRootLeaves（c8t 212492 消费），留批。
 *    modules/OnboardingLoginLeaves.tsx 对本文件 CaptchaGatekeeper 的 type import 同批撤除（零用）。 ── */

/* --- 遥测监督器（横切 services）--- */
/* ── tombstone（A1-R9）：resetTelemetryParityState（原 TPe）/setTelemetryPlatform
 *    （原 iT）/reportLaunchMarks（原 YPe）三枚死 declare 删除——本文件零调用点
 *    （实测 grep 仅余声明位）；各符号 bundle 唯一真形之消费面均在 AppRootLeaves
 *    （A1-R9 条件项已改指 StoresDeep clearAllTelemetryTiming/setUiPerfPlatform/
 *    reportLaunchToInputPerf）。 ── */

/* --- 根装配杂项 --- */
/* ── tombstone（A1-R8）：setCurrentPlatform / setCurrentServices 两枚死 declare 删除——全树零调用点
 *    （实测：本文件及全仓 grep 仅余声明位）；其 bundle 对应面属根装配 currentPlatform/currentServices
 *    模块槽（iT@41604 族），本文件从未消费。 ── */
/* ── tombstone（A1-R9）：disposeStartupServiceRegistry（原 vFe）死 declare 删除——
 *    本文件零调用点；canonical = services/telemetryScopes disposeAllSupervisors，
 *    消费面在 AppRootLeaves 1951（A1-R9 条件项已改指）。R8 留批之 platform/遥测
 *    引擎族（xw/re/iT/TPe/YPe/vFe）至此全部落位（侦查+改指，见 A1-R9 报告）。 ── */
/* ── tombstone（A1-R11）：declare useAppSettings（原 JM，53488）删除。负证据：本文件无活调用点（仅存 declare；
 *    refreshAppSettings 一律经 props 传入，见 3553/3626/3701）。canonical = components/usage/UsageDeep.tsx §2c useAppSettings（JM 53488 逐字），
 *    活消费面在 AppRootLeaves/settings 六区/AutomationEditor/AutomationsMain/IndexingSettingsSection/modules/Settings（本批另行改指）。 ── */
declare function useWebRemoteControlFeatureEnabled(): boolean;
/* ── tombstone〔A1-R44〕：死 declare 簇（6 件）删除：useWebRemoteControlFeatureFlag（原 y8 族）/ useWebRemoteControlSession（原 G6 族）/ useSessionRestoreBridge /
 * useOAuthCredentialsRefresher（原 iYt 族）/ syncRemoteTabsE2E（原 yFe 族）/ setActiveWorkspacePathE2E（原 $se 族）。活消费面在 modules/AppRootLeaves.tsx（其本地 declare + 消费暂代式）；本文件为零消费重复 declare（全文 grep 实测仅本 declare 行），纯删碑。证据见 A1-R44.report.md §二。 ── */










/* ── tombstone（A1-R1）：isSettingsTab（原 Pse js 4497）declare 已删除；本文件无调用点，canonical 属主 = modules/WorkspaceTabsDeep。 ── */
/* ── tombstone〔A1-R44〕：死 declare 簇（5 件）删除：runtimePreferencesSchema / isCodeCommentRestorePayload（原 NH 族）/ isCodeCommentRemovePayload（原 MH 族）/
 * normalizeCodeCommentRemovePayload（原 jH 族）/ useRemoteConnectionLogsBridge（原 bEt 族）。活消费面在 modules/AppRootLeaves.tsx（其本地 declare + 消费暂代式）；本文件为零消费重复 declare（全文 grep 实测仅本 declare 行），纯删碑。证据见 A1-R44.report.md §二。 ── */



/* ── tombstone〔A1-R44〕：declare useTaskListItems（原 ZS 族）删除——本文件零消费（grep 实测仅本 declare 行）。活消费面：modules/AppRootLeaves@1824/1832/1840（本地 declare@252 + 消费）；
 * shell/TopBar、Sidebar、SidebarLeaves、TaskListQueryCore 等活面属 P2/P3 泳道域，本批不触。纯删碑，证据见 A1-R44.report.md §二。 ── */






/* ── tombstone〔A1-R45〕：declare taskRuntimeByWorkspaceKey（原 yPt 族）删除——本文件零消费（grep 实测仅本 declare 行；R44 扫描因 mapTasksToListItems 签名参数名同形误判活面，本批勘误收）。活消费面 = modules/AppRootLeaves@1849（其本地 declare@253 + 消费暂代式）。纯删碑，证据见 A1-R45.report.md §二。 ── */
/* ── tombstone〔A1-R44〕：declare mapTasksToListItems（原 h6 族）删除——活消费面在 modules/AppRootLeaves.tsx（其本地 declare + 消费暂代式）；本文件为零消费重复 declare（全文 grep 实测仅本 declare 行），纯删碑。证据见 A1-R44.report.md §二。 ── */






declare function insertCreatedTaskFromBroadcast(options: { workspacePath: string; workspaceIdentity?: string | null; task: any; membership: { pinned: boolean; archived: boolean } }): void; // 原 cLt（js 146839）
declare function upsertTaskFromBroadcast(options: { workspacePath: string; workspaceIdentity?: string | null; task: any; membership: { pinned: boolean; archived: boolean }; ensureInWorkspaceTaskCache: boolean }): void; // 原 oLt（js 146788）
declare function useDiffsWorkerPool(): { setRenderOptions(options: Record<string, unknown>): Promise<void> } | null;
declare const DiffsWorkerPoolProviderElement: React.FC<{
  poolOptions: { workerFactory: () => Worker; poolSize: number };
  highlighterOptions: Record<string, unknown>;
  children?: React.ReactNode;
}>;
declare function resolveThemeForTitleBar(theme: string): string; // 原 xo（js 1103）
/* ── tombstone〔A1-R44〕：declare useWebRemoteControlTaskSyncFeature 删除——活消费面在 modules/AppRootLeaves.tsx（其本地 declare + 消费暂代式）；本文件为零消费重复 declare（全文 grep 实测仅本 declare 行），纯删碑。证据见 A1-R44.report.md §二。 ── */

/* --- B5-02 §G–§I 追加声明 --- */
/* ── tombstone（A1-R1）：isWorkspaceKindTab（原 oc js 4487）declare 已删除，改经文件头真实 import（../../modules/WorkspaceTabsDeep）消费。 ── */
/* ── tombstone（A1-R2）：isReloadNavigationEntry（原 z0 js 121382）declare 已删除，改经文件头真实 import（../../modules/SplitLayoutDeep）消费。 ── */
/* ── tombstone（A1-R11）：declare normalizeTaskBroadcastError（原 DM，js 52886）删除——本批逐字转录（见下）。
 *    转录族（bundle 52799–52924 逐字；顶层语义名，函数体内局部变量保留混淆名）：
 *      bM → GENERIC_ERROR_MESSAGES (52799) | xM → isPlainObjectValue (52806) | SM → trimmedTextOrNull (52809)
 *      CM → parseJsonCandidate (52813) | wM → readNestedField (52822) | TM → collectErrorTextsByPaths (52829)
 *      IUe → collectErrorMessageCandidates (52853) | EM → firstErrorTextByPaths (52877) | DM → normalizeTaskBroadcastError (52886)
 *    域外携入：Cw（40570）= bundle stub（`return void 0`），DM 52906 唯一本簇消费；其余三消费 40680/54293/118783
 *    属域外簇。A1-R12 收敛：Cw 双归属（本文件私有副本 + StoresDeep normalizeCaptchaCode 前代语义体）
 *    → StoresDeep 唯一真身（本批改回逐字 stub）；本文件经文件头别名 import 消费，私有副本删除。 ── */
/* ── tombstone（A1-R12）：私有 messageErrorCodeOverride（原 Cw，40570）删除 → 文件头
 *    ../../modules/StoresDeep import 别名消费（canonical = normalizeCaptchaCode，bundle 唯一真身；
 *    DM 调用点逐字不变）。 ── */
const GENERIC_ERROR_MESSAGES = new Set([
  `Internal error`,
  `Turn execution failed`,
  `Compact failed`,
  `Rewind failed`,
  `ZCode session failed`,
]);
function isPlainObjectValue(e: unknown): e is Record<string, unknown> {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function trimmedTextOrNull(e: unknown): string | null {
  if (typeof e != `string`) return null;
  let t = e.trim();
  return t.length > 0 ? t : null;
}
function parseJsonCandidate(e: string): unknown {
  let t = e.trim();
  if (!t.startsWith(`{`) && !t.startsWith(`[`)) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
function readNestedField(e: unknown, t: string[]): unknown {
  let n = e;
  for (let e of t) {
    if (!isPlainObjectValue(n)) return;
    n = n[e];
  }
  return n;
}
function collectErrorTextsByPaths(e: Record<string, unknown>): string[] {
  let t: string[] = [],
    n = (e: unknown) => {
      let n = trimmedTextOrNull(e);
      !n || t.includes(n) || t.push(n);
    };
  for (let t of [
    [`message`],
    [`detail`],
    [`data`, `message`],
    [`data`, `detail`],
    [`data`, `details`],
    [`data`, `reason`],
    [`data`, `error`, `message`],
    [`data`, `error`, `detail`],
    [`data`, `error`, `details`],
    [`data`, `zcode`, `error`, `message`],
    [`data`, `zcode`, `error`, `detail`],
    [`data`, `zcode`, `error`, `details`],
  ])
    n(readNestedField(e, t));
  return t;
}
function collectErrorMessageCandidates(e: unknown): string[] {
  let t: string[] = [],
    n = (e: unknown) => {
      let n = trimmedTextOrNull(e);
      !n || t.includes(n) || t.push(n);
    };
  if ((e instanceof Error && n(e.message), typeof e == `string`)) {
    let r = parseJsonCandidate(e);
    if (isPlainObjectValue(r)) {
      for (let e of collectErrorTextsByPaths(r)) n(e);
      if (t.length > 0) return t;
    }
    return (n(e), t);
  }
  if (isPlainObjectValue(e)) {
    for (let t of collectErrorTextsByPaths(e)) {
      n(t);
      let e = parseJsonCandidate(t);
      if (isPlainObjectValue(e)) for (let t of collectErrorTextsByPaths(e)) n(t);
    }
    return t;
  }
  return (n(String(e)), t);
}
function firstErrorTextByPaths(e: unknown, t: string[][]): string | undefined {
  let n = isPlainObjectValue(e) ? e : typeof e == `string` ? parseJsonCandidate(e) : null;
  if (isPlainObjectValue(n))
    for (let e of t) {
      let t = trimmedTextOrNull(readNestedField(n, e));
      if (t) return t;
    }
}
export function normalizeTaskBroadcastError(
  e: unknown,
  t: { fallbackCode?: string; fallbackMessage?: string; traceId?: string; taskId?: string } = {},
): { code: string; message: string; detail: string | undefined; traceId: string | undefined; taskId: string | undefined } {
  let n = collectErrorMessageCandidates(e),
    r = n.find((e) => !GENERIC_ERROR_MESSAGES.has(e)) ?? n[0] ?? t.fallbackMessage ?? `Internal error`,
    i = n.find((e) => e !== r && !GENERIC_ERROR_MESSAGES.has(e)),
    a = firstErrorTextByPaths(e, [
      [`code`],
      [`providerCode`],
      [`data`, `code`],
      [`data`, `error`, `code`],
      [`data`, `zcode`, `error`, `code`],
      [`data`, `zcode`, `error`, `context`, `providerCode`],
      [`data`, `error`, `context`, `providerCode`],
      [`context`, `providerCode`],
    ]),
    o = firstErrorTextByPaths(e, [
      [`detail`],
      [`data`, `detail`],
      [`data`, `error`, `detail`],
      [`data`, `zcode`, `error`, `detail`],
    ])?.match(/provider_code=([0-9]+)/)?.[1],
    s = messageErrorCodeOverride(a ?? o, r),
    c = firstErrorTextByPaths(e, [
      [`traceId`],
      [`data`, `traceId`],
      [`data`, `error`, `traceId`],
      [`data`, `zcode`, `error`, `traceId`],
    ]),
    l = firstErrorTextByPaths(e, [
      [`taskId`],
      [`data`, `taskId`],
      [`data`, `error`, `taskId`],
      [`data`, `zcode`, `error`, `taskId`],
    ]);
  return {
    code: s ?? o ?? a ?? t.fallbackCode ?? `UNKNOWN`,
    message: r,
    detail: i,
    traceId: t.traceId ?? c,
    taskId: t.taskId ?? l,
  };
}
declare function createExternalStore<T>(
  initializer: (set: (partial: Partial<T>) => void, get: () => T) => T,
): { getState(): T }; // 原 Ae（外部 skillStore chunk 之 zustand create）
export interface DiffsHighlighterOptions {
  theme: { light: string; dark: string };
  lineDiffType: string;
  maxLineDiffLength: number;
  tokenizeMaxLineLength: number;
  useTokenTransformer: boolean;
  [key: string]: any;
}
export interface TaskBroadcastPayload {
  workspacePath: string;
  taskId: string;
  updatedAt: number;
  workspaceIdentity?: string;
  event: string;
  task?: { taskId: string; workspacePath: string; provider?: string; [key: string]: any };
  provider?: string;
  configOptions?: unknown[];
  permissionRequest?: Record<string, unknown> | null;
  elicitationRequest?: Record<string, unknown> | null;
  prompt?: { content: string; messageId: string; sentAt: number };
  requestId?: string;
  error?: string;
  [key: string]: any;
}
export interface TaskStreamPayload {
  workspacePath: string;
  taskId: string;
  updatedAt: number;
  workspaceIdentity?: string;
  event: { type: string; taskId: string; [key: string]: any };
  [key: string]: any;
}
declare const HeroCardShell: React.FC<{ className?: string; contentClassName?: string; children?: React.ReactNode }>; // 原 C4t → 已在 ModalsLeaves.tsx
declare const BrandWordmarkSvg: React.FC<{ className?: string }>; // 原 s4t → 已在 Modals.tsx

/* --- 它族组件（F17/F12/F03 消费面）--- */
/* ── tombstone〔A1-R44〕：declare WebRemoteControlFeatureGate（原 oRt 族）删除——活消费面在 modules/AppRootLeaves.tsx（其本地 declare + 消费暂代式）；本文件为零消费重复 declare（全文 grep 实测仅本 declare 行），纯删碑。证据见 A1-R44.report.md §二。 ── */

/* --- window 全局 --- */
declare global {
  interface Window {
    __ZCODE_RENDERER_START__?: number;
    __ZCODE_REACT_COMMIT_AT__?: number;
    __ZCODE_LAUNCH_MARKS__?: { createdAt: number; mainStart: number; appReady: number; loadUrl: number; [key: string]: any } | null; // A1-R9 精化：四键必选（写端 SrcSharedB parseLaunchMarks 逐键校验 number/finite，缺一即 null；读端 YPe@41625 逐段消费）
    __zcodeArmsCustomEventsE2E?: Array<Record<string, unknown>>;
  }
}

/* ============================================================================
 * §A. 登录 / OAuth 域（原 js 205995–206343）
 * ==========================================================================*/

/** 原 c4t（205995 / 163717）：OAuth 失败兜底文案常量 */
export const LOGIN_FAILED_MESSAGE = `登录失败，请重试`;

/** 原 l4t（205996 / 163718）：useOAuth —— provider 列表/活动 provider/startOAuth/cancel/reset */
export function useOAuth() {
  const { oauthService } = useServices() as unknown as { oauthService: OAuthServiceLike }; // A0-CLEANUP3 3b：oauthService 已具型（facet），本地 OAuthServiceLike 与之不重叠，双重收敛
  const platform = usePlatform() as unknown as PlatformService; // A0-D-Misc 类型收敛：ImeComposition.PlatformService 索引签名为 unknown
  const [status, setStatus] = React.useState<string>(`idle`);
  const [error, setError] = React.useState<string | null>(null);
  const [providers, setProviders] = React.useState<OAuthProviderInfo[]>([]);
  const [activeProvider, setActiveProvider] = React.useState<string | null>(null);
  const [loadingProviders, setLoadingProviders] = React.useState<boolean>(!0);
  const [pendingProvider, setPendingProvider] = React.useState<string | null>(null);
  const refreshProviders = React.useCallback(async () => {
    try {
      (setLoadingProviders(!0), setProviders(await oauthService.getProviders()));
      try {
        setActiveProvider(await oauthService.getActiveProvider());
      } catch (error) {
        if (!isMissingCredentialsError(error)) throw error;
        (logger.warn(`[useOAuth] 加载 active provider 凭据失败，已按未登录处理:`, error), setActiveProvider(null));
      }
    } catch (error) {
      (logger.error(`[useOAuth] 加载 provider 列表失败:`, error), setProviders([]), setActiveProvider(null));
    } finally {
      setLoadingProviders(!1);
    }
  }, [oauthService]);
  return (
    React.useEffect(() => {
      refreshProviders();
    }, [refreshProviders]),
    {
      startLogin: React.useCallback(
        async (providerId: string, options: { purpose?: string } = {}) => {
          try {
            (setStatus(`waiting`), setError(null), setPendingProvider(providerId));
            const { authorizeUrl, state, provider } = await oauthService.startOAuth(providerId);
            (platform.registerOAuthState({ state, provider }),
              platform.openExternal(authorizeUrl),
              trackTelemetryEvent(
                platform,
                {
                  elementName: `app_login_ck`,
                  eventRegion: `app`,
                  eventType: `ck`,
                  eventExtraDetail: { login_url: authorizeUrl },
                },
                `useOAuth`,
              ),
              logger.info(`[useOAuth] OAuth 流程已启动，等待浏览器回调`, {
                provider,
                purpose: options.purpose ?? `app-login`,
              }));
          } catch (error) {
            (logger.error(`[useOAuth] 启动 OAuth 失败:`, error), setStatus(`error`), setError(LOGIN_FAILED_MESSAGE), setPendingProvider(null));
          }
        },
        [oauthService, platform],
      ),
      cancel: React.useCallback(
        async (providerId: string | null | undefined) => {
          (await oauthService.cancelPending(providerId), setStatus(`idle`), setError(null), setPendingProvider(null));
        },
        [oauthService],
      ),
      reset: React.useCallback(() => {
        (setStatus(`idle`), setError(null), setPendingProvider(null));
      }, []),
      status,
      error,
      providers,
      activeProvider,
      loadingProviders,
      pendingProvider,
      refreshProviders,
      setOAuthError: React.useCallback((message: string) => {
        (setStatus(`error`), setError(message), setPendingProvider(null));
      }, []),
      setOAuthSuccess: React.useCallback(async () => {
        (setStatus(`idle`), setError(null), setPendingProvider(null), await refreshProviders());
      }, [refreshProviders]),
    }
  );
}

/** 原 M9（206077 / 163794）：family domain → providerId */
export function familyDomainToProviderId(domain: string): string {
  return domain === `zai` ? providerIds.zai : providerIds.bigmodel;
}

/** 原 u4t（206080 / 163797）：family domain → 展示名 */
export function familyDomainLabel(domain: string): string {
  return domain === `zai` ? `Z.ai` : `BigModel`;
}

/** 原 d4t（206083 / 163800）：恒等（保留调用面） */
export function identityDomain(domain: string): string {
  return domain;
}

/** 原 f4t（206086 / 163803）：modelProviderFamilyModes 置 apiKey 模式 */
export function withFamilyMode(domain: string, modes: Record<string, string>): Record<string, string> {
  return { ...modes, [domain]: `apiKey` };
}

/** 原 p4t（206089 / 163809）：providerFamilyDomain 迁移补丁 */
export function familyDomainPatch(domain: string, updatedAt: number): {
  providerFamilyDomain: string;
  providerFamilyDomainUpdatedAt: number;
  providerFamilyDomainMigrated: boolean;
} {
  return {
    providerFamilyDomain: identityDomain(domain),
    providerFamilyDomainUpdatedAt: updatedAt,
    providerFamilyDomainMigrated: !0,
  };
}

/** 原 m4t（206096 / 163816）：注册表取 apiKeyUrl */
export function apiKeyUrlForDomain(domain: string): string | undefined {
  return providerFamilyRegistry.get(familyDomainToProviderId(domain))?.apiKeyUrl;
}

/** 原 h4t（206099 / 163819）：输入为空且有 apiKeyUrl 时显示「获取 API Key」链接 */
export function shouldShowGetApiKeyLink(apiKey: string, apiKeyUrl: string | undefined): boolean {
  return !!apiKeyUrl && apiKey.trim().length === 0;
}

/** 原 g4t（206102 / 163822）：把 API Key 写入 provider 记录 */
export function applyApiKeyToProvider(provider: ModelProviderRecord, apiKey: string, updatedAt: number): ModelProviderRecord {
  return { ...provider, apiKey, enabled: !0, systemDisabledReason: void 0, updatedAt };
}

/** 原 _4t（206105 / 163831）：provider 缺省模型 key */
export function defaultModelKeyForProvider(provider: ModelProviderRecord): string | null {
  const modelId = providerFamilyDefinitionOf(provider)?.models?.[0]?.modelId;
  return modelId ? providerModelKey(provider.id, modelId) : null;
}

/** 原 v4t（206109 / 163835）：按 domain 查已存 API Key */
export function findSavedApiKeyForDomain(providers: ModelProviderRecord[], domain: string): string {
  const providerId = familyDomainToProviderId(domain);
  return providers.find((entry) => entry.id === providerId)?.apiKey.trim() ?? ``;
}

/** 原 y4t（206113 / 163839）：用户未编辑时回显已存 key */
export function savedApiKeyIfUntouched(options: { savedApiKey: string; userEdited: boolean }): string | null {
  return options.userEdited ? null : options.savedApiKey.trim();
}

/** 原 b4t（206116 / 163845）：API Key 登录视图（login.apiKey.* 全套） */
export function ApiKeyLoginView({ onCancel, onSaved, onSkipped }: { onCancel: () => void; onSaved: () => void | Promise<void>; onSkipped: () => void | Promise<void> }) {
  const { intl } = useIntlContext();
  const platform = usePlatform() as unknown as PlatformService; // A0-D-Misc 类型收敛：ImeComposition.PlatformService 索引签名为 unknown
  const { modelProviderService, settingService } = useServices() as unknown as { modelProviderService: ModelProviderServiceLike; settingService: SettingServiceLike }; // A0-CLEANUP3 3b：BaseServices 服务面收敛后本地 Like 面与规范型不重叠，边界双断言
  const markApiKeyLoginSuccess = useSettingsStore((state) => state.markApiKeyLoginSuccess);
  const [providerChoice, setProviderChoice] = React.useState<string>(`zai`);
  const [apiKey, setApiKey] = React.useState<string>(``);
  const [saving, setSaving] = React.useState<boolean>(!1);
  const [skipping, setSkipping] = React.useState<boolean>(!1);
  const [formError, setFormError] = React.useState<string | null>(null);
  const userEditedRef = React.useRef<boolean>(!1);
  const providerLabel = familyDomainLabel(providerChoice);
  const apiKeyUrl = apiKeyUrlForDomain(providerChoice);
  const showGetApiKey = shouldShowGetApiKeyLink(apiKey, apiKeyUrl);
  React.useEffect(() => {
    let cancelled = !1;
    return (
      (userEditedRef.current = !1),
      setFormError(null),
      modelProviderService
        .getAll()
        .then((providers) => {
          if (cancelled) return;
          const saved = savedApiKeyIfUntouched({ savedApiKey: findSavedApiKeyForDomain(providers, providerChoice), userEdited: userEditedRef.current });
          saved !== null && setApiKey(saved);
        })
        .catch((error) => {
          logger.warn(`[LoginEntry] 读取已保存 API Key provider 失败`, { providerChoice, error });
        }),
      () => {
        cancelled = !0;
      }
    );
  }, [modelProviderService, providerChoice]);
  const saveApiKey = async () => {
      const trimmed = apiKey.trim();
      if (!trimmed) {
        setFormError(intl.formatMessage({ id: `login.apiKey.emptyError` }));
        return;
      }
      const providerId = familyDomainToProviderId(providerChoice);
      (setSaving(!0), setFormError(null));
      try {
        const existing = (await modelProviderService.getAll()).find((entry) => entry.id === providerId);
        if (!existing) {
          setFormError(intl.formatMessage({ id: `login.apiKey.providerMissingError` }, { provider: providerLabel }));
          return;
        }
        const updated = applyApiKeyToProvider(existing, trimmed, Date.now());
        const settings = await settingService.get();
        (await modelProviderService.save(updated),
          await settingService.update({
            providerFamilyDomain: providerChoice,
            providerFamilyDomainUpdatedAt: Date.now(),
            providerFamilyDomainMigrated: !0,
            modelProviderFamilyModes: withFamilyMode(providerChoice, settings.modelProviderFamilyModes ?? {}),
          }));
        const modelKey = defaultModelKeyForProvider(updated);
        (modelKey && setDefaultModelChoice(`glm`, ``, modelKey), await refreshModelProviderSnapshot(() => modelProviderService.getAll(), { force: !0 }), markApiKeyLoginSuccess(modelKey), await onSaved());
      } catch (error) {
        (logger.error(`[LoginEntry] 保存 API Key provider 失败`, { providerId, error }),
          setFormError(
            intl.formatMessage(
              { id: `login.apiKey.saveError` },
              { error: error instanceof Error ? error.message : String(error) },
            ),
          ));
      } finally {
        setSaving(!1);
      }
    },
    skipLogin = async () => {
      (setSkipping(!0), setFormError(null));
      try {
        (await settingService.update(familyDomainPatch(providerChoice, Date.now())), await onSkipped());
      } catch (error) {
        (logger.error(`[LoginEntry] 跳过 API Key 登录失败`, { providerChoice, error }),
          setFormError(
            intl.formatMessage(
              { id: `login.apiKey.skipError` },
              { error: error instanceof Error ? error.message : String(error) },
            ),
          ));
      } finally {
        setSkipping(!1);
      }
    },
    busy = saving || skipping;
  return (
    <div className={`space-y-4`}>
      <div className={`space-y-2`}>
        <h2 className={`text-ui-base font-medium text-foreground`}>{intl.formatMessage({ id: `login.apiKey.title` })}</h2>
        <div className={`space-y-2`}>
          <div>
            <SelectRoot value={providerChoice} onValueChange={(value) => setProviderChoice(value)} disabled={busy}>
              <SelectTrigger
                id={`login-api-key-provider`}
                size={`lg`}
                className={`h-10 w-full text-ui-base`}
                data-testid={TESTID_LOGIN_API_KEY_PROVIDER}
                aria-label={intl.formatMessage({ id: `login.apiKey.providerLabel` })}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align={`end`} className={`rounded-lg`}>
                <SelectItem value={`zai`} className={`rounded-md`} data-testid={joinTestidParts(TESTID_LOGIN_API_KEY_OPTION_BASE, `zai`)}>
                  {ProviderIcon(`zai`, `size-4`)}
                  {intl.formatMessage({ id: `login.apiKey.provider.zai` })}
                </SelectItem>
                <SelectItem value={`bigmodel`} className={`rounded-md`} data-testid={joinTestidParts(TESTID_LOGIN_API_KEY_OPTION_BASE, `bigmodel`)}>
                  {ProviderIcon(BIGMODEL_PROVIDER_ID, `size-4`)}
                  {intl.formatMessage({ id: `login.apiKey.provider.bigmodel` })}
                </SelectItem>
              </SelectContent>
            </SelectRoot>
          </div>
          <div className={`relative`}>
            <Input
              id={`login-api-key`}
              type={`password`}
              size={`lg`}
              className={`h-10 w-full text-ui-base ${showGetApiKey ? `pr-28` : ``}`}
              data-testid={TESTID_LOGIN_API_KEY_INPUT}
              aria-label={intl.formatMessage({ id: `login.apiKey.placeholder` })}
              value={apiKey}
              placeholder={intl.formatMessage({ id: `login.apiKey.placeholder` })}
              autoComplete={`off`}
              onChange={(event) => {
                ((userEditedRef.current = !0), setApiKey(event.target.value), setFormError(null));
              }}
              onKeyDown={(event) => {
                event.key === `Enter` && apiKey.trim() && !busy && saveApiKey();
              }}
            />
            {showGetApiKey ? (
              <button
                type={`button`}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-ui-base font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50`}
                disabled={busy}
                onClick={() => {
                  apiKeyUrl && platform.openExternal(apiKeyUrl);
                }}
              >
                {intl.formatMessage({ id: `login.apiKey.getApiKey` })}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {formError ? (
        <Alert variant={`destructive`} data-testid={TESTID_LOGIN_API_KEY_ERROR}>
          <AlertTriangleIcon className={`size-4`} />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <div className={`space-y-2`}>
        <Button
          type={`button`}
          className={`h-10 w-full text-ui-base`}
          size={`lg`}
          data-testid={TESTID_LOGIN_API_KEY_CONTINUE}
          disabled={!apiKey.trim() || busy}
          onClick={() => void saveApiKey()}
        >
          {saving ? <SpinnerIcon className={`size-4 animate-spin`} /> : null}
          {intl.formatMessage({ id: `login.apiKey.continue` })}
        </Button>
        <Button type={`button`} variant={`outline`} className={`h-10 w-full text-ui-base`} size={`lg`} data-testid={TESTID_LOGIN_API_KEY_CANCEL} disabled={busy} onClick={onCancel}>
          {intl.formatMessage({ id: `login.apiKey.cancel` })}
        </Button>
        <Button
          type={`button`}
          variant={`link`}
          className={`h-7 w-full text-ui-base text-foreground-subtle hover:text-foreground`}
          data-testid={TESTID_LOGIN_API_KEY_SKIP}
          disabled={busy}
          onClick={() => void skipLogin()}
        >
          {skipping ? <SpinnerIcon className={`size-4 animate-spin`} /> : null}
          {intl.formatMessage({ id: `login.skip` })}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================================
 * §B. 登录流程视图（原 js 206410–206757）
 * ==========================================================================*/

/** 原 w4t（206410 / 164049）：登录入口屏（hero 卡片壳 + OAuth 面板） */
export function LoginEntryScreen({ onComplete }: { onComplete: (reason: string) => void }) {
  return (
    <main className={`relative flex h-full min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-6 text-foreground sm:px-6`}>
      <HeroCardShell className={`absolute inset-0`} />
      <div className={`pointer-events-none absolute left-0 top-0 right-0 z-10 flex h-12 w-full items-center [app-region:drag]`} />
      <section className={`relative z-10 w-full flex flex-col gap-10 max-w-sm rounded-2xl border border-popover-border bg-background p-8 text-ui-base/relaxed shadow-md sm:p-10`}>
        <OAuthLoginPanel active={!0} onComplete={onComplete} />
      </section>
    </main>
  );
}

/** 原 T4t（206425 / 164054）：尝试 provider 与成功 provider 一致 */
export function attemptMatchesSuccessProvider(options: { attempt: { providerId: string } | null; successProvider: string | null }): boolean {
  return !options.attempt || options.successProvider === options.attempt.providerId;
}

/** 原 E4t（206428 / 164057）：已有用户且无在途尝试 → 可自动完成 */
export function canAutoCompleteOAuth(options: { hasUser: boolean; attempt: unknown }): boolean {
  return options.hasUser && !options.attempt;
}

/** 原 D4t（206431 / 164060）：OAuth 登录面板（providers/apiKey/waiting/error 四态） */
export function OAuthLoginPanel({ active, onComplete }: { active: boolean; onComplete: (reason: string) => void }) {
  const { intl } = useIntlContext();
  const {
    startLogin,
    cancel,
    reset,
    status,
    error,
    providers,
    activeProvider,
    loadingProviders,
    pendingProvider,
    refreshProviders,
  } = useOAuth();
  const user = useSettingsStore((state) => state.user);
  const oauthError = useSettingsStore((state) => state.oauthError) as string | null; // A0-D-Misc 类型收敛：stores-core oauthError 为 unknown，渲染面按文案字符串使用
  const setOAuthError = useSettingsStore((state) => state.setOAuthError);
  const oauthSuccessSeq = useSettingsStore((state) => state.oauthSuccessSeq);
  const lastOAuthSuccessProvider = useSettingsStore((state) => state.lastOAuthSuccessProvider);
  const loginEntryRequest = useSettingsStore((state) => state.loginEntryRequest);
  const clearLoginEntryRequest = useSettingsStore((state) => state.clearLoginEntryRequest);
  const markLoginEntryAttemptStatus = useSettingsStore((state) => state.markLoginEntryAttemptStatus);
  const [view, setView] = React.useState<string>(`providers`);
  const activeRef = React.useRef(active);
  const handledRequestIdRef = React.useRef<number | null>(null); // A0-D-Misc 类型收敛：stores-core LoginEntryRequest.id 为 number
  const successSeqRef = React.useRef(oauthSuccessSeq);
  const lastStartedProviderRef = React.useRef<string | null>(null);
  const pendingAttemptRef = React.useRef<{ id: number; providerId: string } | null>(null);
  const settlePendingAttempt = React.useCallback(
    (outcome: string) => {
      const attempt = pendingAttemptRef.current;
      attempt && ((pendingAttemptRef.current = null), markLoginEntryAttemptStatus(attempt.id, outcome));
    },
    [markLoginEntryAttemptStatus],
  );
  const startLoginTracked = React.useCallback(
    (providerId: string, options: { purpose?: string } = {}, requestId?: number) => {
      const attempt = pendingAttemptRef.current;
      return (
        attempt && attempt.id !== requestId && settlePendingAttempt(`cancelled`),
        requestId !== void 0 && ((pendingAttemptRef.current = { id: requestId, providerId }), markLoginEntryAttemptStatus(requestId, `waiting`)),
        (lastStartedProviderRef.current = providerId),
        startLogin(providerId, options)
      );
    },
    [settlePendingAttempt, markLoginEntryAttemptStatus, startLogin],
  );
  const displayNameById = React.useMemo(() => new Map(providers.map((entry) => [entry.id, entry.displayName])), [providers]);
  const activeProviderLabel = user && activeProvider ? (displayNameById.get(activeProvider) ?? activeProvider) : null;
  const pendingProviderLabel = pendingProvider ? (displayNameById.get(pendingProvider) ?? pendingProvider) : null;
  const sortedProviders = React.useMemo(() => sortLoginProviders(providers), [providers]);
  (React.useEffect(() => {
    active && refreshProviders();
  }, [active, refreshProviders]),
    React.useEffect(() => {
      !active ||
        !loginEntryRequest?.providerId ||
        handledRequestIdRef.current === loginEntryRequest.id ||
        ((handledRequestIdRef.current = loginEntryRequest.id), clearLoginEntryRequest(loginEntryRequest.id), startLoginTracked(loginEntryRequest.providerId, { purpose: loginEntryRequest.purpose }, loginEntryRequest.id));
    }, [active, clearLoginEntryRequest, loginEntryRequest, startLoginTracked]),
    React.useEffect(() => {
      oauthError && active && (settlePendingAttempt(`failed`), reset());
    }, [active, settlePendingAttempt, oauthError, reset]),
    React.useEffect(() => {
      active && status === `error` && settlePendingAttempt(`failed`);
    }, [active, settlePendingAttempt, status]),
    React.useEffect(() => {
      active && canAutoCompleteOAuth({ hasUser: !!user, attempt: pendingAttemptRef.current }) && (reset(), setOAuthError(null), onComplete(`oauth`));
    }, [active, settlePendingAttempt, onComplete, reset, setOAuthError, user]),
    React.useEffect(() => {
      if (!active) {
        successSeqRef.current = oauthSuccessSeq;
        return;
      }
      if (oauthSuccessSeq > successSeqRef.current) successSeqRef.current = oauthSuccessSeq;
      else return;
      status === `waiting` &&
        attemptMatchesSuccessProvider({ attempt: pendingAttemptRef.current, successProvider: lastOAuthSuccessProvider }) &&
        (settlePendingAttempt(`succeeded`), reset(), setOAuthError(null), onComplete(`oauth`));
    }, [active, settlePendingAttempt, lastOAuthSuccessProvider, oauthSuccessSeq, onComplete, reset, setOAuthError, status]));
  const resetViewToProviders = React.useCallback(() => {
    setView(`providers`);
  }, []);
  return (
    (React.useEffect(() => {
      if (active) {
        activeRef.current = !0;
        return;
      }
      activeRef.current &&
        ((activeRef.current = !1),
        status === `waiting` && cancel(pendingProvider ?? void 0),
        settlePendingAttempt(`cancelled`),
        reset(),
        setOAuthError(null),
        clearLoginEntryRequest(),
        resetViewToProviders());
    }, [active, cancel, clearLoginEntryRequest, settlePendingAttempt, pendingProvider, reset, resetViewToProviders, setOAuthError, status]),
    (
      <>
        <LoginHeader
          title={intl.formatMessage({ id: `login.title` })}
          description={intl.formatMessage({ id: `login.description` })}
        >
          {activeProviderLabel ? (
            <p className={`rounded-full bg-tag/50 px-3 py-1 text-ui-base text-foreground-subtle`}>
              {intl.formatMessage({ id: `login.oauth.activeProviderHint` }, { provider: activeProviderLabel })}
            </p>
          ) : null}
        </LoginHeader>
        <div className={`space-y-6`}>
          {status === `idle` && view === `providers` && (
            <div className={`space-y-4`}>
              {loadingProviders ? (
                <div className={`flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-6 text-ui-base text-foreground-subtle`}>
                  <SpinnerIcon className={`size-4 animate-spin`} />
                  {intl.formatMessage({ id: `login.oauth.loadingProviders` })}
                </div>
              ) : null}
              {!loadingProviders && providers.length === 0 ? (
                <Alert variant="warning" /* A0-CLEANUP3 #37：Settings.Alert 已补 warning 变体（bundle g2t，styles 202627） */ className={`flex items-center justify-center gap-2 text-center`} data-testid={`oauth-error`}>
                  <AlertTriangleIcon className={`size-4`} />
                  <AlertDescription className={`text-center`}>{intl.formatMessage({ id: `login.oauth.noProviders` })}</AlertDescription>
                </Alert>
              ) : null}
              {loadingProviders ? null : (
                <div className={`space-y-2`}>
                  {sortedProviders.map((entry) => (
                    <Button
                      key={entry.id}
                      variant={`default`}
                      className={`h-10 w-full text-ui-base`}
                      size={`lg`}
                      data-testid={entry.id === `bigmodel` ? `oauth-login-button` : joinTestidParts(`oauth-login-button`, entry.id)}
                      onClick={() => void startLoginTracked(entry.id)}
                    >
                      {ProviderIcon(entry.id, `size-4`)}
                      <span className={`min-w-0 truncate`}>
                        {intl.formatMessage({ id: oauthButtonLabelKey(entry.id) }, { provider: entry.displayName })}
                      </span>
                      <OAuthRegionTag providerId={entry.id} />
                    </Button>
                  ))}
                  <Button
                    variant={`outline`}
                    className={`h-10 w-full text-ui-base`}
                    size={`lg`}
                    data-testid={`login-use-api-key-button`}
                    onClick={() => {
                      setView(`apiKey`);
                    }}
                  >
                    {intl.formatMessage({ id: `login.useApiKey` })}
                  </Button>
                </div>
              )}
            </div>
          )}
          {status === `idle` && view === `apiKey` ? (
            <ApiKeyLoginView
              onCancel={() => setView(`providers`)}
              onSaved={() => (resetViewToProviders(), onComplete(`apiKey`))}
              onSkipped={() => (resetViewToProviders(), onComplete(`skip`))}
            />
          ) : null}
          {status === `waiting` && (
            <div className={`space-y-4`}>
              <div className={`flex items-center justify-center gap-2 rounded-lg border border-border bg-surface p-2 text-ui-base text-foreground-subtle`}>
                <OrbitSpinnerIcon className={`size-4 animate-spin`} />
                {intl.formatMessage({ id: `login.oauth.waiting` }, { provider: pendingProviderLabel ?? `OAuth` })}
              </div>
              <Button
                variant={`outline`}
                className={`h-10 w-full text-ui-base`}
                size={`lg`}
                data-testid={`oauth-cancel`}
                onClick={() => {
                  (settlePendingAttempt(`cancelled`), cancel(pendingProvider ?? void 0));
                }}
              >
                {intl.formatMessage({ id: `login.oauth.cancel` })}
              </Button>
            </div>
          )}
          {(status === `error` || oauthError) && (
            <div className={`space-y-4`}>
              <Alert variant="warning" /* A0-CLEANUP3 #37：Settings.Alert 已补 warning 变体（bundle g2t，styles 202627） */ className={`flex items-center justify-center gap-2 text-center`} data-testid={`oauth-error`}>
                <AlertTriangleIcon className={`size-4`} />
                <AlertDescription className={`text-center`}>{oauthError || error}</AlertDescription>
              </Alert>
              <Button
                className={`h-10 w-full text-ui-base`}
                size={`lg`}
                onClick={() => {
                  const retryProvider = resolveRetryProviderId({
                    pendingProvider,
                    lastAttemptProvider: lastStartedProviderRef.current,
                    providers,
                  });
                  retryProvider && (setOAuthError(null), startLoginTracked(retryProvider));
                }}
              >
                {intl.formatMessage({ id: `login.oauth.retry` })}
              </Button>
            </div>
          )}
        </div>
      </>
    ))
  );
}

/** 原 O4t（206685 / 164194）：登录页头（徽标 + 标题 + 描述 + 附加） */
export function LoginHeader({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <header className={`flex flex-col items-center gap-3 text-center`}>
      <LoginLogoBadge />
      <div className={`flex flex-col items-center gap-1 text-center`}>
        <h1 className={`text-3xl font-semibold tracking-tight`}>{title}</h1>
        <p className={`text-ui-base/relaxed text-foreground-subtle`}>{description}</p>
      </div>
      {children}
    </header>
  );
}

/** 原 k4t（206704 / 164201）：登录页字标徽标（REBRAND-011+111 aria-label） */
export function LoginLogoBadge() {
  return (
    <div
      className={`relative mb-1 flex size-16 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#000000_0%,#151718_100%)] text-[#ffffff] shadow-lg/20 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:border before:border-[rgba(255,255,255,0.1)]`}
      aria-label={`nofy`} // REBRAND-011+111
      role={`img`}
    >
      <BrandWordmarkSvg className={`h-auto w-10`} />
    </div>
  );
}

/** 原 A4t（206712 / 164206）：OAuth 按钮文案 key */
export function oauthButtonLabelKey(providerId: string): string {
  switch (providerId) {
    case `zai`:
      return `login.oauth.button.zai`;
    case BIGMODEL_PROVIDER_ID:
      return `login.oauth.button.bigmodel`;
    default:
      return `login.oauth.button`;
  }
}

/** 原 j4t（206722 / 164216）：OAuth 区域标签 key */
export function oauthRegionTagKey(providerId: string): string | null {
  switch (providerId) {
    case `zai`:
      return `login.oauth.regionTag.zai`;
    case BIGMODEL_PROVIDER_ID:
      return `login.oauth.regionTag.bigmodel`;
    default:
      return null;
  }
}

/** 原 M4t（206732 / 164226）：OAuth 区域标签徽章 */
export function OAuthRegionTag({ providerId }: { providerId: string }) {
  const { intl } = useIntlContext();
  const tagKey = oauthRegionTagKey(providerId);
  return tagKey ? (
    <span className={`ml-1 inline-flex h-5 shrink-0 items-center rounded-full border border-primary-foreground/30 px-2 text-ui-xs font-medium leading-none text-primary-foreground/60`}>
      {intl.formatMessage({ id: tagKey })}
    </span>
  ) : null;
}

/** 原 N4t（206742 / 164237）：provider 排序权重（zai 0 / bigmodel 1 / 其余 10+order） */
export function providerSortRank(provider: OAuthProviderInfo): number {
  switch (provider.id) {
    case `zai`:
      return 0;
    case BIGMODEL_PROVIDER_ID:
      return 1;
    default:
      return 10 + (provider.order ?? 0);
  }
}

/** 原 P4t（206752 / 164247）：按权重排序 provider 列表 */
export function sortLoginProviders(providers: OAuthProviderInfo[]): OAuthProviderInfo[] {
  return [...providers].sort((a, b) => providerSortRank(a) - providerSortRank(b));
}

/** 原 F4t（206755 / 164250）：重试目标 provider 解析 */
export function resolveRetryProviderId(options: { pendingProvider: string | null; lastAttemptProvider: string | null; providers: OAuthProviderInfo[] }): string | null {
  return options.pendingProvider ?? options.lastAttemptProvider ?? options.providers[0]?.id ?? null;
}

/* ============================================================================
 * §C. 启动门控谓词（原 js 206758–206803；行段属 F18，语义为 F20 引导消费面）
 * ==========================================================================*/

/** 原 I4t（206758 / 164257）：可上报启动标记 */
export function shouldReportLaunchMarks(options: { alreadyReported: boolean; isStartupRenderBlocked: boolean; welcomeScreenOpen: boolean }): boolean {
  return !options.alreadyReported && !options.isStartupRenderBlocked && !options.welcomeScreenOpen;
}

/** 原 L4t（206761 / 164260）：读取 window 上的渲染器启动标记
 *  A1-R9 精化：marks 型面 { createdAt } + any 索引 → 增列 mainStart/appReady/loadUrl
 *  必选（bundle 唯一真形：YPe@41625 逐段消费 t.createdAt/mainStart/appReady/loadUrl；
 *  消费点 AppRootLeaves reportLaunchMarks 改指 reportLaunchToInputPerf 后 2298 实测通过）。 */
export function readRendererLaunchMarks(): {
  marks: { createdAt: number; mainStart: number; appReady: number; loadUrl: number; [key: string]: any } | null;
  rendererStart: number;
  reactCommit: number;
} | null {
  const win = window;
  const rendererStart = win.__ZCODE_RENDERER_START__;
  const reactCommit = win.__ZCODE_REACT_COMMIT_AT__;
  return typeof rendererStart != `number` || typeof reactCommit != `number`
    ? null
    : { marks: win.__ZCODE_LAUNCH_MARKS__ ?? null, rendererStart, reactCommit };
}

/** 原 R4t（206769 / 164270）：跨工作区未读任务总数 */
export function countTotalUnreadTasks(workspaces: Record<string, WorkspaceTaskState>): number {
  const keys = new Set<string>();
  const seen = new WeakSet<object>();
  for (const [workspaceKey, state] of Object.entries(workspaces)) {
    if (seen.has(state)) continue;
    seen.add(state);
    const entries = taskListOfWorkspaceState(state);
    for (const entry of entries)
      entry.unreadAt && keys.add(`${entry.workspaceIdentity?.trim() || entry.workspacePath}::${entry.taskId}`);
    if (!(entries.length > 0)) for (const taskId of Object.keys(state.taskUnreadByTaskId ?? {})) keys.add(`${workspaceKey}::${taskId}`);
  }
  return keys.size;
}
declare function taskListOfWorkspaceState(state: WorkspaceTaskState): Array<{ unreadAt?: number | null; workspaceIdentity?: string | null; workspacePath: string; taskId: string }>;

/**
 * 原 z4t（206782 / 164282）：启动期 auth/provider 解析状态判定。
 * ★ OFFLINE-PATCH-001（现行 out 文件已应用）：离线环境 oauth/provider 网络校验永不
 *   resolve，启动门控直通 —— 函数体被替换为 `return false`。以下按现行 out 逐字转录。
 */
export function isResolvingStartupAuthState(_options: {
  isResolvingStartupAuthState?: boolean;
  isResolvingProviderStartupState?: boolean;
  isRestoring?: boolean;
  isBootstrappingInitialWorkspace?: boolean;
}): boolean {
  // OFFLINE-PATCH-001: 离线环境 oauth/provider 网络校验永不 resolve，启动门控直通。
  // 原始逻辑见 git 历史（isResolvingStartupAuthState || isResolvingProviderStartupState || isRestoring || isBootstrappingInitialWorkspace）。
  return false;
}

/** 原 B4t（206787 / 164285）：启动渲染阻塞（桌面 + 欢迎屏未开 + 解析中） */
export function isStartupRenderBlocked(options: {
  isDesktop: boolean;
  welcomeScreenOpen: boolean;
  isResolvingStartupAuthState: boolean;
  isResolvingProviderStartupState: boolean;
  isRestoring: boolean;
  isBootstrappingInitialWorkspace: boolean;
}): boolean {
  return !!options.isDesktop && !options.welcomeScreenOpen && isResolvingStartupAuthState(options);
}

/** 原 V4t（206790 / 164288）：非远控根才启用 provider 可用性门 */
export function isProviderAvailabilityGateEnabled(options: { isWebRemoteControlRoot: boolean }): boolean {
  return !options.isWebRemoteControlRoot;
}

/** 原 H4t（206793 / 164291）：provider 启动同步挂起 */
export function isProviderStartupSyncPending(options: {
  isWebRemoteControlRoot: boolean;
  providerStartupSyncPending: boolean;
  providerAvailabilityStartupCheckCompleted: boolean;
}): boolean {
  return options.isWebRemoteControlRoot
    ? !1
    : options.providerStartupSyncPending || !options.providerAvailabilityStartupCheckCompleted;
}

/** 原 U4t（206798 / 164294）：挂载中且无活动工作区 → 需兜底 bootstrap */
export function needsFallbackWorkspaceBootstrap(options: { isMounted: boolean; activeWorkspacePath: string | null }): boolean {
  return options.isMounted && !options.activeWorkspacePath;
}

/** 原 W4t（206801 / 164297）：provider family 迁移或快照水合未完成 */
export function isProviderStartupHydrationPending(options: { providerFamilyDomainMigrationComplete: boolean; modelProviderSnapshotHydrated: boolean }): boolean {
  return !options.providerFamilyDomainMigrationComplete || !options.modelProviderSnapshotHydrated;
}

/* ============================================================================
 * §D. 应用根组合叶子（原 js 206998–207216；行段属 F18，语义为 g8t/_8t 消费面）
 * ==========================================================================*/

/** 原 J4t（206998 / 164401）：设置层（工作区服务上下文内挂 j9 设置视图） */
export function SettingsLayer({
  workspaceScopedServices,
  isDesktop,
  isMacDesktop,
  isWindowsDesktop,
  isWebRemoteControl,
  windowsWindowControlsRightPaddingPx,
  captionWorkspacePath,
  onBack,
  onCreateTask,
  onOpenWorkspace,
  allowOpenWorkspace,
  onLogin,
  onLogout,
  user,
}: {
  workspaceScopedServices: ServicesBundle | null;
  isDesktop: boolean;
  isMacDesktop: boolean;
  isWindowsDesktop: boolean;
  isWebRemoteControl?: boolean;
  windowsWindowControlsRightPaddingPx?: number;
  captionWorkspacePath: string | null;
  onBack?: () => void;
  onCreateTask: (options?: unknown) => void;
  onOpenWorkspace: () => void;
  allowOpenWorkspace: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  user: UserInfo | null;
}) {
  return (
    React.useEffect(
      () => (
        logger.info(`[Root] settings layer mounted`),
        () => {
          logger.info(`[Root] settings layer unmounted`);
        }
      ),
      [],
    ),
    (
      <div className={`absolute inset-0 z-10`}>
        {workspaceScopedServices ? (
          <ServicesProvider services={workspaceScopedServices}>
            <SettingsView
              isDesktop={isDesktop}
              isMacDesktop={isMacDesktop}
              isWindowsDesktop={isWindowsDesktop}
              isWebRemoteControl={isWebRemoteControl}
              windowsWindowControlsRightPaddingPx={windowsWindowControlsRightPaddingPx}
              captionWorkspacePath={captionWorkspacePath ?? undefined} // A0-D-Misc 类型收敛：SettingsView 侧为 string | undefined
              onBack={onBack}
              onCreateTask={onCreateTask}
              onOpenWorkspace={onOpenWorkspace}
              allowOpenWorkspace={allowOpenWorkspace}
              onLogin={onLogin}
              onLogout={onLogout}
              user={user}
            />
          </ServicesProvider>
        ) : (
          <SettingsView
            isDesktop={isDesktop}
            isMacDesktop={isMacDesktop}
            isWindowsDesktop={isWindowsDesktop}
            isWebRemoteControl={isWebRemoteControl}
            windowsWindowControlsRightPaddingPx={windowsWindowControlsRightPaddingPx}
            captionWorkspacePath={captionWorkspacePath ?? undefined} // A0-D-Misc 类型收敛：SettingsView 侧为 string | undefined
            onBack={onBack}
            onCreateTask={onCreateTask}
            onOpenWorkspace={onOpenWorkspace}
            allowOpenWorkspace={allowOpenWorkspace}
            onLogin={onLogin}
            onLogout={onLogout}
            user={user}
          />
        )}
      </div>
    )
  );
}

/** 原 Y4t（207063）：memo(XJt) —— XJt = WorkspaceRoot（工作区根；束 7039025 实证
 *  baseFeedbackService/remoteConnectionLogs/remoteConnectionInProgress/onReturnToWorkspace
 *  由该层收取）。A0-CLEANUP3 #36：前版误包 yJt=WorkspaceShell，改指属主导出。 */
export const MemoizedWorkspaceShell = MemoizedWorkspaceRoot;

/** 原 X4t（207064 / 164453）：根工作区内容（工作区壳 + 设置层双表面） */
export function RootWorkspaceContent(args: {
  workspaceScopedServices: ServicesBundle | null;
  baseFeedbackService: FeedbackService | null;
  workspaceShellPath: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string;
  activeWorkspacePath: string | null;
  isSettingsTabActive: boolean;
  handleConnectRemote: (...args: any[]) => any;
  handleSelectRemoteProject: (...args: any[]) => any;
  handleCancelRemoteProject: (...args: any[]) => any;
  handleReconnectRemoteWorkspace: (...args: any[]) => any;
  handleCreateTask: (options?: any) => void;
  handleCreateConversationTask: () => Promise<void>;
  handleResolveConversationWorkspace: () => Promise<string>;
  handleOpenWorkspace: () => void;
  handleOpenFolderFromWorkspaceMenu: () => void;
  handleOpenRemoteWorkspace?: (...args: any[]) => any;
  handleCreateScratchWorkspace: (name: string) => Promise<string | null>;
  remoteConnectionInProgress: boolean;
  remoteWorkspaceSessions: RemoteSessionEntry[];
  allowRemoteWorkspace: boolean;
  handleBackFromSettings: () => void;
  handleLogout?: () => void;
  onLogin?: () => void;
  user: UserInfo | null;
  reconnectingRemoteWorkspaceKeys: string[];
  remoteWorkspaceErrorByWorkspaceKey: Record<string, string>;
  reconnectingRemoteWorkspaceLogsByWorkspaceKey: Record<string, RemoteConnectionLogEntry[]>;
  remoteConnectionLogs: RemoteConnectionLogEntry[];
  allowOpenWorkspace: boolean;
  webRemoteControlWorkspaceSwitcher?: unknown;
  initialWebRemoteControlMobileNavigationIntent?: unknown;
  initialWebRemoteControlWorkspaceList?: unknown;
  webRemoteControlTerminalTransportState?: unknown;
  isDesktop: boolean;
  isMacDesktop: boolean;
  isWindowsDesktop: boolean;
  supportsEmbeddedBrowser: boolean;
  windowsWindowControlsRightPaddingPx?: number;
}) {
  const resetKey = args.workspaceIdentity?.trim() || args.workspaceShellPath;
  return (
    React.useEffect(() => {
      logger.info(`[RootWorkspaceContent] settings layer visibility changed`, {
        isSettingsTabActive: args.isSettingsTabActive,
        workspaceShellPath: args.workspaceShellPath,
        workspaceHiddenByLayout: !1,
      });
    }, [args.isSettingsTabActive, args.workspaceShellPath]),
    (
      <>
        <div
          className={args.isSettingsTabActive ? `h-full opacity-0 pointer-events-none` : `h-full`}
          aria-hidden={args.isSettingsTabActive}
          data-root-workspace-surface={args.isSettingsTabActive ? `inert` : `interactive`}
          {...(args.isSettingsTabActive ? { inert: true } : {})} /* 原 inert: o ? !0 : void 0（@types/react 18 无 inert 属性，经 spread 保持逐字语义） */
        >
          <WorkspaceTelemetryProvider
            enabled={args.isDesktop === !0}
            foregroundEnabled={!args.isSettingsTabActive}
            services={args.workspaceScopedServices as ServicesBundle}
            workspacePath={args.workspaceShellPath}
            workspaceIdentity={args.workspaceIdentity}
            remoteSessionId={args.workspaceRemoteSessionId}
          >
            <ServicesProvider services={args.workspaceScopedServices as ServicesBundle}>
              <ScopeBoundary scope={`workspace-app`} resetKeys={[resetKey]} variant={`panel`} className={`h-full`}>
                <MemoizedWorkspaceRoot
                  services={args.workspaceScopedServices as unknown as WorkspaceServices} /* A0-CLEANUP3 #36：WorkspaceServices 已由属主导出；ServicesBundle 与 WorkspaceServices 无结构重叠，边界处双断言 */
                  baseFeedbackService={args.baseFeedbackService}
                  onConnectRemote={args.handleConnectRemote}
                  onSelectRemoteProject={args.handleSelectRemoteProject}
                  onCancelRemoteProject={args.handleCancelRemoteProject}
                  onReconnectRemoteWorkspace={args.handleReconnectRemoteWorkspace}
                  onLogout={args.handleLogout}
                  onLogin={args.onLogin}
                  user={args.user}
                  reconnectingRemoteWorkspaceKeys={args.reconnectingRemoteWorkspaceKeys}
                  remoteWorkspaceErrorByWorkspaceKey={args.remoteWorkspaceErrorByWorkspaceKey}
                  reconnectingRemoteWorkspaceLogsByWorkspaceKey={args.reconnectingRemoteWorkspaceLogsByWorkspaceKey}
                  remoteConnectionLogs={args.remoteConnectionLogs}
                  workspaceAbsPath={args.workspaceShellPath}
                  workspaceRemoteSessionId={args.workspaceRemoteSessionId}
                  workspaceIdentity={args.workspaceIdentity ?? undefined} // A0-D-Misc 类型收敛：WorkspaceShell 侧为 string | undefined
                  onCreateTask={args.handleCreateTask}
                  onCreateConversationTask={args.handleCreateConversationTask}
                  onResolveConversationWorkspace={args.handleResolveConversationWorkspace}
                  onOpenWorkspace={args.handleOpenWorkspace}
                  onOpenFolderFromWorkspaceMenu={args.handleOpenFolderFromWorkspaceMenu}
                  onOpenRemoteWorkspace={args.handleOpenRemoteWorkspace}
                  onCreateScratchWorkspace={args.handleCreateScratchWorkspace}
                  remoteConnectionInProgress={args.remoteConnectionInProgress}
                  onReturnToWorkspace={args.handleBackFromSettings}
                  allowOpenWorkspace={args.allowOpenWorkspace}
                  webRemoteControlWorkspaceSwitcher={args.webRemoteControlWorkspaceSwitcher as WebRemoteSwitcherService | undefined}
                  initialWebRemoteControlMobileNavigationIntent={args.initialWebRemoteControlMobileNavigationIntent as string | undefined}
                  initialWebRemoteControlWorkspaceList={args.initialWebRemoteControlWorkspaceList as MobileHomeResult | undefined}
                  webRemoteControlTerminalTransportState={args.webRemoteControlTerminalTransportState as string | undefined}
                  allowRemoteWorkspace={args.allowRemoteWorkspace}
                  remoteWorkspaceSessions={args.remoteWorkspaceSessions}
                  isWorkspaceVisible={!args.isSettingsTabActive}
                  isDesktop={args.isDesktop}
                  isMacDesktop={args.isMacDesktop}
                  isWindowsDesktop={args.isWindowsDesktop}
                  supportsEmbeddedBrowser={args.supportsEmbeddedBrowser}
                />
              </ScopeBoundary>
            </ServicesProvider>
          </WorkspaceTelemetryProvider>
        </div>
        {args.isSettingsTabActive ? (
          <ScopeBoundary scope={`workspace-settings-layer`} resetKeys={[resetKey, args.isSettingsTabActive]} variant={`panel`} className={`absolute inset-0 z-10`}>
            <SettingsLayer
              workspaceScopedServices={args.workspaceScopedServices}
              isDesktop={args.isDesktop}
              isMacDesktop={args.isMacDesktop}
              isWindowsDesktop={args.isWindowsDesktop}
              windowsWindowControlsRightPaddingPx={args.windowsWindowControlsRightPaddingPx}
              captionWorkspacePath={args.activeWorkspacePath}
              onBack={args.activeWorkspacePath ? args.handleBackFromSettings : void 0}
              onCreateTask={args.handleCreateTask}
              onOpenWorkspace={args.handleOpenWorkspace}
              allowOpenWorkspace={args.allowOpenWorkspace}
              onLogin={args.onLogin}
              onLogout={args.handleLogout}
              user={args.user}
            />
          </ScopeBoundary>
        ) : null}
      </>
    )
  );
}

/** 原 Z4t（207205 / 164518）：trim 后空串归一 undefined */
export function trimmedOrUndefined(value: string | null | undefined): string | undefined {
  return value?.trim() || void 0;
}

/** 原 Q4t（207208 / 164521）：解析活动工作区壳三元组 */
export function resolveActiveWorkspaceShellProps(options: {
  activeWorkspaceTab: (WorkspaceTab & { remoteSessionId?: string }) | null;
  activeWorkspacePath: string | null;
  activeWorkspaceIdentity: string | null;
}): { workspaceShellPath: string | null; workspaceIdentity: string | undefined; workspaceRemoteSessionId: string | undefined } {
  return options.activeWorkspaceTab
    ? {
        workspaceShellPath: options.activeWorkspaceTab.workspacePath,
        workspaceIdentity: trimmedOrUndefined(options.activeWorkspaceTab.workspaceIdentity),
        workspaceRemoteSessionId: options.activeWorkspaceTab.remoteSessionId,
      }
    : { workspaceShellPath: options.activeWorkspacePath, workspaceIdentity: trimmedOrUndefined(options.activeWorkspaceIdentity), workspaceRemoteSessionId: void 0 };
}

/* ============================================================================
 * §E. 工作区恢复 / 远程重连域（原 js 208827–209939）
 * ==========================================================================*/

/** 原 D3t（208827 / 165632）：恢复条目的工作区 key */
export function workspaceKeyOfRestoreEntry(entry: string | { workspaceIdentity?: string | null; workspacePath: string }): string {
  return typeof entry == `string` ? entry : entry.workspaceIdentity?.trim() || entry.workspacePath;
}

/** 原 O3t（208830 / 165635）：构建持久化 tab 补丁（最近会话 + 活动索引）
 *  A1-R7 逐字校正：bundle O3t 直以原始 sessions 入 lEt/filter，无归一化步；
 *  A0 期误插之 normalizeTaskBroadcastSessions（幻影符号）调用删除。 */
export function buildPersistedTabPatch(state: TabStoreState, sessions: RemoteSessionEntry[]): { lastWorkspaceSession: unknown[]; lastActiveTabIndex: number } {
  const persisted = persistableTabEntries(state.tabs, sessionEntryMapByKey(sessions)); // A1-R2：bundle O3t（js 208830）先 lEt 建 Map 再传 sEt
  const remoteKeys = new Set(persisted.flatMap((entry: any) => (entry.kind === `remote` ? [remoteWorkspaceKey(entry)] : [])));
  const remaining = sessions.filter((entry) => !remoteKeys.has(remoteWorkspaceKey(entry)));
  const workspaceTabs = state.tabs.filter((tab) => tab.kind === `workspace`);
  const activeIndex = state.activeWorkspacePath ? workspaceTabs.findIndex((tab) => tab.workspacePath === state.activeWorkspacePath) : 0;
  return { lastWorkspaceSession: [...persisted, ...remaining], lastActiveTabIndex: Math.max(activeIndex, 0) };
}

/** 原 k3t（208839 / 165647）：组合工作区会话恢复（本地去重/远控身份去重/active-first 两段恢复） */
export function restoreCombinedWorkspaceSessions(options: {
  settings: AppSettings;
  tabStoreApi: { getState(): TabStoreState };
  allowRemoteWorkspaceRestore?: boolean;
  unavailableWorkspacePath?: string;
  conversationWorkspacePath?: string;
  restoreMode?: string;
}): { deferredRestore: () => void } | undefined {
  const { settings, tabStoreApi, allowRemoteWorkspaceRestore = !0, unavailableWorkspacePath, conversationWorkspacePath, restoreMode = `all` } = options;
  const entries = persistableWorkspaceTabs(settings);
  if (entries.length === 0 && !conversationWorkspacePath) return;
  const restoreEntries: unknown[] = [];
  const localPaths = new Set<string>();
  const remoteIdentities = new Set<string>();
  const lastActiveIndex = resolveLastActiveTabIndex(entries, settings.lastActiveTabIndex as number | undefined);
  let activeRestoreIndex = 0;
  let conversationIndex: number | null = null;
  let conversationSkipped = !1;
  for (const [index, entry] of entries.entries()) {
    if (entry.kind === `local`) {
      if (conversationWorkspacePath && entry.workspacePurpose === `conversation` && entry.workspacePath !== conversationWorkspacePath) {
        (logger.warn(`[Root] 跳过非 canonical conversation workspace 恢复`, {
          workspacePath: entry.workspacePath,
          conversationWorkspacePath,
        }),
          index === lastActiveIndex && ((conversationSkipped = !0), conversationIndex !== null && (activeRestoreIndex = conversationIndex)));
        continue;
      }
      if (localPaths.has(entry.workspacePath)) {
        logger.warn(`[Root] 跳过重复的本地 workspace 恢复`, { workspacePath: entry.workspacePath });
        continue;
      }
      const isConversation = entry.workspacePath === conversationWorkspacePath;
      const purpose = isConversation ? `conversation` : entry.workspacePurpose;
      const availability = !isConversation && entry.workspacePath === unavailableWorkspacePath ? `unavailable-local-directory` : void 0;
      (restoreEntries.push(
        purpose || availability
          ? { workspacePath: entry.workspacePath, workspacePurpose: purpose, availability }
          : entry.workspacePath,
      ),
        localPaths.add(entry.workspacePath));
      const restoreIndex = restoreEntries.length - 1;
      (isConversation && (conversationIndex = restoreIndex), (index === lastActiveIndex || (isConversation && conversationSkipped)) && (activeRestoreIndex = restoreIndex));
      continue;
    }
    // A1-R6 宽化行注（A1-R7 随 V2 改指更新：entry 型随 persistedWorkspaceSessions 为 PersistedWorkspaceTabRecord）：持久化远程条目运行时有 target（bundle 209045 L2 直参），交叉 cast 达 canonical 参型。
    const identity = entryIdentity(entry as PersistedWorkspaceTabRecord & { target: RemoteSessionTarget });
    const dedupeKey = identity?.trim() || entry.workspacePath;
    if (remoteIdentities.has(dedupeKey)) {
      logger.warn(`[Root] 跳过身份冲突的远程 workspace 恢复`, {
        workspacePath: entry.workspacePath,
        workspaceIdentity: identity,
      });
      continue;
    }
    allowRemoteWorkspaceRestore &&
      (restoreEntries.push({ workspacePath: entry.workspacePath, remoteTarget: entry.remoteTarget, workspaceIdentity: identity }),
      remoteIdentities.add(dedupeKey));
  }
  if (
    (conversationWorkspacePath &&
      !localPaths.has(conversationWorkspacePath) &&
      (restoreEntries.push({ workspacePath: conversationWorkspacePath, workspacePurpose: `conversation` }),
      (conversationIndex = restoreEntries.length - 1),
      conversationSkipped && (activeRestoreIndex = conversationIndex)),
    restoreEntries.length > 0)
  ) {
    if (restoreMode === `active-first` && restoreEntries.length > 1) {
      const activeEntry = restoreEntries[activeRestoreIndex];
      if (activeEntry) {
        const activeKey = workspaceKeyOfRestoreEntry(activeEntry as string | { workspaceIdentity?: string | null; workspacePath: string });
        return (
          logger.info(`[Root] 优先恢复 active workspace`, { deferredCount: restoreEntries.length - 1 }),
          tabStoreApi.getState().restoreTabs([activeEntry], 0),
          {
            deferredRestore: () => {
              const alreadyRestored = tabStoreApi
                  .getState()
                  .tabs.filter(isWorkspaceKindTab)
                  .some((tab) => (tab.workspaceIdentity?.trim() || tab.workspacePath) === activeKey);
              const deferred = alreadyRestored ? restoreEntries : restoreEntries.filter((entry) => workspaceKeyOfRestoreEntry(entry as string | { workspaceIdentity?: string | null; workspacePath: string }) !== activeKey);
              (logger.info(`[Root] 首帧后补齐 inactive workspace`, { count: deferred.length - +!!alreadyRestored }),
                tabStoreApi.getState().completeTabRestore(deferred));
            },
          }
        );
      }
    }
    (logger.info(`[Root] 恢复组合 workspace 会话`, { count: restoreEntries.length, activeIndex: activeRestoreIndex }),
      tabStoreApi.getState().restoreTabs(restoreEntries, activeRestoreIndex));
  }
}

/** 原 A3t（208929 / 165733）：slug 化（非单词字符 → -） */
export function slugifyRemoteSeed(value: string): string {
  return value.replace(/[^\w.-]+/g, `-`);
}

/** 原 j3t（208932 / 165736）：远控目标种子名（ssh=host / wsl=distro-user / docker=container / server=name） */
export function remoteTargetSeedName(target: any): string | undefined {
  switch (target.kind) {
    case `ssh`:
      return target.host;
    case `wsl`: {
      const user = target.user?.trim();
      const distro = target.distro ?? `default`;
      return user ? `${distro}-${user}` : distro;
    }
    case `docker`:
      return target.container;
    case `server`:
      return target.name?.trim() || target.serverId?.trim() || target.url;
  }
}

/** 原 M3t（208947 / 165752）：远控工作区运行时标签前缀 */
export function remoteWorkspaceRuntimeLabelPrefix(target: any): string {
  return `remote-workspace-${target.kind}-${slugifyRemoteSeed(remoteTargetSeedName(target)!)}-`;
}

/** 原 N3t（208950 / 165755）：运行时标签 → 重连中的工作区 key 匹配 */
export function matchReconnectingWorkspaceKeys(options: {
  runtimeLabel: string;
  runtimeRequestId?: string | null;
  reconnectingEntries: Array<{ requestId?: string; workspaceKey: string; target: any }>;
}): string[] {
  if (!options.runtimeLabel.startsWith(`remote-workspace-`)) return [];
  const requestId = options.runtimeRequestId?.trim();
  if (requestId)
    return options.reconnectingEntries
      .filter((entry) => entry.requestId?.trim() === requestId)
      .map((entry) => entry.workspaceKey ?? ``)
      .filter((key) => key.length > 0);
  const matched = options.reconnectingEntries.filter((entry) => options.runtimeLabel.startsWith(remoteWorkspaceRuntimeLabelPrefix(entry.target)));
  return matched.length === 1
    ? matched.map((entry) => entry.workspaceKey ?? ``).filter((key) => key.length > 0)
    : [];
}

/** 原 P3t（208963 / 165766）：每工作区远控日志上限 */
export const MAX_REMOTE_LOGS_PER_WORKSPACE = 50;

/** 原 F3t（208964 / 165767）：useRemoteConnectionLogs —— 订阅平台远控日志按工作区分流 */
export function useRemoteConnectionLogs(options: {
  platform: PlatformService;
  reconnectingWorkspaceKeys: string[];
  resolveWorkspaceTargetByKey: (key: string) => any;
  resolveWorkspaceRequestIdByKey?: (key: string) => string | null;
}): { logsByWorkspaceKey: Record<string, RemoteConnectionLogEntry[]>; resetLogsForWorkspaceKey: (key: string) => void } {
  const keysRef = React.useRef<string[]>([]);
  const [logsByWorkspaceKey, setLogsByWorkspaceKey] = React.useState<Record<string, RemoteConnectionLogEntry[]>>({});
  return (
    React.useEffect(() => {
      keysRef.current = options.reconnectingWorkspaceKeys;
      const keep = new Set(options.reconnectingWorkspaceKeys);
      setLogsByWorkspaceKey((current) => {
        const kept = Object.entries(current).filter(([key]) => keep.has(key));
        return kept.length === Object.keys(current).length ? current : Object.fromEntries(kept);
      });
    }, [options.reconnectingWorkspaceKeys]),
    React.useEffect(
      () =>
        options.platform.onRemoteConnectionLog((entry) => {
          const message = normalizeRemoteLogMessage(entry.message);
          if (!message) return;
          const keys = keysRef.current;
          if (keys.length === 0) return;
          const candidates = keys.flatMap((key) => {
              const target = options.resolveWorkspaceTargetByKey(key);
              return target ? [{ workspaceKey: key, requestId: options.resolveWorkspaceRequestIdByKey?.(key) ?? void 0, target }] : [];
            });
          const matched = matchReconnectingWorkspaceKeys({
              runtimeLabel: entry.label!,
              runtimeRequestId: entry.requestId,
              reconnectingEntries: candidates,
            });
          matched.length !== 0 &&
            setLogsByWorkspaceKey((current) => {
              let next = current;
              for (const key of matched) {
                const existing = next[key] ?? [];
                const appended = appendRemoteLog(existing, {
                    id: `${entry.label}-${entry.timestamp}-${existing.length}`,
                    level: entry.level,
                    message,
                    timestamp: entry.timestamp,
                  }).slice(-MAX_REMOTE_LOGS_PER_WORKSPACE);
                (next === current && (next = { ...current }), (next[key] = appended));
              }
              return next;
            });
        }),
      [options.platform, options.resolveWorkspaceRequestIdByKey, options.resolveWorkspaceTargetByKey],
    ),
    {
      logsByWorkspaceKey,
      resetLogsForWorkspaceKey: React.useCallback((key: string) => {
        setLogsByWorkspaceKey((current) => ({ ...current, [key]: [] }));
      }, []),
    }
  );
}

/** 原 I3t（209023 / 165826）：单条远控工作区重连（凭据装载 → 连接 → 规范化路径 → 提交） */
export async function reconnectRemoteWorkspaceEntry(options: {
  sessionEntry: RemoteSessionEntry;
  activateTabByPath: (path: string, options?: { workspaceIdentity?: string | null }) => boolean;
  setReconnectingRemoteWorkspaceKeys: React.Dispatch<React.SetStateAction<string[]>>;
  loadCredential: (key: string) => Promise<string | null>;
  connectRemoteWorkspaceTarget: (target: RemoteSessionTarget, requestId?: string, context?: Record<string, unknown>) => Promise<string>; // A1-R7 链精化：bundle k 参为 x=RemoteSessionTarget
  resolveRemoteWorkspaceCanonicalPath: (sessionId: string, path: string) => Promise<string>;
  syncRemoteWorkspaceModelProviders: (sessionId: string, path: string, identity: string) => Promise<void>;
  disposeRemoteWorkspaceSession: (sessionId: string) => Promise<void>;
  bindRemoteWorkspacePath: (path: string, sessionId: string) => void;
  bindRemoteWorkspaceIdentity: (identity: string, sessionId: string) => void;
  upsertWorkspaceTab: (path: string, patch: Record<string, unknown>) => void;
  commitRemoteWorkspaceSessionMutation: (mutation: RemoteSessionMutation) => Promise<unknown>;
  getRemoteSessions: () => RemoteSessionEntry[];
  logger: typeof logger;
  toast: (message: string) => void;
  shouldKeepReconnectedWorkspace?: (context: { workspacePath: string; workspaceIdentity?: string | null }) => boolean;
  onWorkspaceActivated?: (context: { workspacePath: string; workspaceIdentity?: string | null }) => void;
  options?: {
    activateWorkspaceAfterReconnect?: boolean;
    showErrorToast?: boolean;
    sshCredentialsOverride?: { password: string | null; privateKeyPassphrase: string | null };
    requestId?: string;
    onSshHostReady?: (credentials: { password: string | null; privateKeyPassphrase: string | null }) => void;
    throwOnFailure?: boolean;
  };
}): Promise<void> {
  const activateAfterReconnect = options.options?.activateWorkspaceAfterReconnect ?? !0;
  const showErrorToast = options.options?.showErrorToast ?? !0;
  const identity = entryIdentity(options.sessionEntry);
  const workspaceKey = identity?.trim() || options.sessionEntry.workspacePath;
  options.setReconnectingRemoteWorkspaceKeys((keys) => (keys.includes(workspaceKey) ? keys : [...keys, workspaceKey]));
  let target = withRemoteCredentials(options.sessionEntry.target, { password: null, privateKeyPassphrase: null, token: null });
  let canonicalPath = options.sessionEntry.workspacePath;
  let canonicalIdentity: string | null = identity;
  try {
    const sshOverride = options.options?.sshCredentialsOverride ?? {
        password:
          options.sessionEntry.target.kind === `ssh` && options.sessionEntry.target.passwordCredentialKey
            ? await options.loadCredential(options.sessionEntry.target.passwordCredentialKey)
            : null,
        privateKeyPassphrase:
          options.sessionEntry.target.kind === `ssh` && options.sessionEntry.target.privateKeyPassphraseCredentialKey
            ? await options.loadCredential(options.sessionEntry.target.privateKeyPassphraseCredentialKey)
            : null,
      };
    const token =
      options.sessionEntry.target.kind === `server` && options.sessionEntry.target.tokenCredentialKey
        ? await options.loadCredential(options.sessionEntry.target.tokenCredentialKey)
        : null;
    target = withRemoteCredentials(options.sessionEntry.target, { ...sshOverride, token });
    const sessionId = await options.connectRemoteWorkspaceTarget(target, options.options?.requestId, {
      workspacePath: options.sessionEntry.workspacePath,
      workspaceIdentity: identity,
      connectTrigger: `reconnect`,
    });
    if (
      (target.kind === `ssh` && options.options?.onSshHostReady?.(sshOverride),
      (canonicalPath = await options.resolveRemoteWorkspaceCanonicalPath(sessionId, options.sessionEntry.workspacePath)),
      (canonicalIdentity = workspaceIdentityOf(canonicalPath, target)),
      await options.syncRemoteWorkspaceModelProviders(sessionId, canonicalPath, canonicalIdentity),
      options.shouldKeepReconnectedWorkspace && !options.shouldKeepReconnectedWorkspace({ workspacePath: canonicalPath, workspaceIdentity: canonicalIdentity }))
    ) {
      (options.logger.warn(`[Root] 远程 workspace 在重连过程中已被移除，跳过恢复并回收 session`, {
        workspacePath: canonicalPath,
      }),
        await options.disposeRemoteWorkspaceSession(sessionId));
      return;
    }
    (options.bindRemoteWorkspacePath(canonicalPath, sessionId),
      options.bindRemoteWorkspaceIdentity(canonicalIdentity, sessionId),
      options.upsertWorkspaceTab(canonicalPath, {
        remoteSessionId: sessionId,
        remoteTarget: serializeRemoteTarget(target),
        workspaceIdentity: canonicalIdentity,
        localWorkspacePath: options.sessionEntry.localWorkspacePath,
      }),
      activateAfterReconnect && options.activateTabByPath(canonicalPath, { workspaceIdentity: canonicalIdentity }) && options.onWorkspaceActivated?.({ workspacePath: canonicalPath, workspaceIdentity: canonicalIdentity }),
      await options.commitRemoteWorkspaceSessionMutation(
        commitRemoteSessionsMutation({
          remoteSessions: options.getRemoteSessions(),
          workspacePath: canonicalPath,
          localWorkspacePath: options.sessionEntry.localWorkspacePath,
          workspaceIdentity: canonicalIdentity,
          target,
          lastConnectionStatus: `connected`,
          touchOpenedAt: !0,
        }),
      ),
      await Promise.all([
        refreshPinnedTasks({ sessionId, workspacePath: canonicalPath, workspaceIdentity: canonicalIdentity }),
        refreshTimelineTasks({ sessionId, workspacePath: canonicalPath, workspaceIdentity: canonicalIdentity }),
      ]));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      (options.logger.warn(`[Root] 手动重连远程 workspace 失败`, { workspacePath: canonicalPath, error: message }),
      await options.commitRemoteWorkspaceSessionMutation(
        commitRemoteSessionsMutation({
          remoteSessions: options.getRemoteSessions(),
          workspacePath: canonicalPath,
          workspaceIdentity: canonicalIdentity,
          target,
          lastConnectionStatus: `failed`,
          lastConnectionError: message,
          touchOpenedAt: !1,
        }),
      ),
      showErrorToast && options.toast(message),
      options.options?.throwOnFailure)
    )
      throw error;
  } finally {
    options.setReconnectingRemoteWorkspaceKeys((keys) => keys.filter((key) => key !== workspaceKey));
  }
}

/** 原 B9（209132 / 165927）：活动态运行时状态判定 */
export function isActiveTaskRuntimeStatus(status: string): boolean {
  return status === `creating` || status === `restoring` || status === `streaming`;
}

/** 原 L3t（209135 / 165930）：任务运行时是否活动（缺省视为活动） */
export function isTaskRuntimeActiveInState(state: WorkspaceTaskState, taskId: string): boolean {
  const runtime = state.taskRuntimeByTaskId[taskId];
  return runtime ? isActiveTaskRuntimeStatus(runtime.status) : !0;
}

/** 原 R3t（209139 / 165934）：收集工作区内活动任务 id */
export function collectActiveTaskIds(state: WorkspaceTaskState): string[] {
  const ids = new Set<string>();
  state.activeTaskId && isActiveTaskRuntimeStatus(activeTaskRuntimeOf(state).taskStatus) && ids.add(state.activeTaskId);
  for (const [taskId, runtime] of Object.entries(state.taskRuntimeByTaskId)) isActiveTaskRuntimeStatus(runtime.status) && ids.add(taskId);
  for (const entry of state.taskListCache ?? [])
    entry.status === `running` && isTaskRuntimeActiveInState(state, entry.taskId) && ids.add(entry.taskId);
  for (const entry of Object.values(state.optimisticTaskListByTaskId))
    entry.status === `running` && isTaskRuntimeActiveInState(state, entry.taskId) && ids.add(entry.taskId);
  return [...ids];
}
declare function activeTaskRuntimeOf(state: WorkspaceTaskState): { taskStatus: string };

/** 原 z3t（209149 / 165942）：断连时把相关 tab 的活动任务落败 */
export function failActiveTasksForClosedTabs(options: {
  tabs: WorkspaceTab[];
  getWorkspaceState: (workspacePath: string, workspaceIdentity?: string | null) => WorkspaceTaskState;
  setTaskRuntimeState: (workspacePath: string, taskId: string, state: string, reason: string, workspaceIdentity?: string | null) => void;
  reason: string;
}): number {
  const failed = new Set<string>();
  for (const tab of options.tabs) {
    const state = options.getWorkspaceState(tab.workspacePath, tab.workspaceIdentity);
    const scopeKey = tab.workspaceIdentity?.trim() || tab.workspacePath;
    for (const taskId of collectActiveTaskIds(state)) {
      const key = `${scopeKey}\0${taskId}`;
      failed.has(key) || (failed.add(key), options.setTaskRuntimeState(tab.workspacePath, taskId, `failed`, options.reason, tab.workspaceIdentity));
    }
  }
  return failed.size;
}

/** 原 B3t（209161 / 165959）：重连事件 → 工作区身份 */
// A1-R6 型别精化：options.target unknown → RemoteSessionTarget（I2 参型所需；调用点传 session.target: any，bundle B3t 即消费连接目标）。
export function identityFromReconnectEvent(options: { event: { workspaceIdentity: string }; resolvedWorkspacePath: string; target: RemoteSessionTarget }): string {
  return options.event.workspaceIdentity.trim() || workspaceIdentityOf(options.resolvedWorkspacePath, options.target);
}

/** 原 V3t（209164 / 165962）：WSL 会话关闭时若有在途重连则暂缓失败落盘 */
export function shouldPersistClosedSessionFailure(options: {
  sessionEntry: RemoteSessionEntry;
  pendingReconnectRequestIds: Map<string, string>;
  workspaceKey: string;
}): boolean {
  return options.sessionEntry.target.kind === `wsl`
    ? !options.pendingReconnectRequestIds.has(options.workspaceKey)
    : !0;
}

/** 原 H3t（209169 / 165965）：按 key 重连远控工作区 */
export async function reconnectRemoteWorkspaceByKey(options: {
  workspaceKey: string;
  canUseRemoteWorkspace: boolean;
  getRemoteSessions: () => RemoteSessionEntry[];
  runReconnectRemoteWorkspace: (entry: RemoteSessionEntry, opts?: Record<string, unknown>) => Promise<void>;
  options?: Record<string, unknown>;
}): Promise<boolean> {
  if (!options.canUseRemoteWorkspace) throw Error(`Remote workspace is disabled in this mode`);
  const entry = options.getRemoteSessions().find((session) => remoteWorkspaceKey(session) === options.workspaceKey);
  if (!entry) throw Error(`远程 workspace 不在当前窗口中，无法重连: ${options.workspaceKey}`);
  return (await options.runReconnectRemoteWorkspace(entry, options.options), !0);
}

/** 原 U3t（209181 / 165977）：SSH 同主机多工作区重连组 */
export function resolveSshReconnectGroup(options: { selected: RemoteSessionEntry; sessions: RemoteSessionEntry[]; tabs: WorkspaceTab[] }): RemoteSessionEntry[] {
  if (options.selected.target.kind !== `ssh`) return [options.selected];
  const hostKey = sshHostKeyOfTarget(options.selected.target);
  const localKeys = new Set(options.tabs.flatMap((tab) => (!isWorkspaceKindTab(tab) || tab.remoteSessionId ? [] : [remoteWorkspaceKey(tab)])));
  const sameHost = options.sessions.filter((session) => session.target.kind === `ssh` && sshHostKeyOfTarget(session.target) === hostKey && localKeys.has(remoteWorkspaceKey(session)));
  const selectedKey = remoteWorkspaceKey(options.selected);
  return sameHost.some((session) => remoteWorkspaceKey(session) === selectedKey) ? [options.selected, ...sameHost.filter((session) => remoteWorkspaceKey(session) !== selectedKey)] : [options.selected];
}

/** 原 W3t（209189 / 165985）：SSH 凭据复用的组重连（主机 ready 后并发其余） */
export async function reconnectGroupWithSshReuse(options: {
  selected: RemoteSessionEntry;
  reconnectGroup: RemoteSessionEntry[];
  reconnectEntry: (entry: RemoteSessionEntry, opts?: Record<string, unknown>) => Promise<boolean>;
  options?: { throwOnFailure?: boolean; [key: string]: unknown };
}): Promise<void> {
  const selectedKey = remoteWorkspaceKey(options.selected);
  const others = options.reconnectGroup.filter((entry) => remoteWorkspaceKey(entry) !== selectedKey);
  if (options.selected.target.kind !== `ssh`) {
    try {
      await options.reconnectEntry(options.selected, { ...options.options, throwOnFailure: !0 });
    } catch (error) {
      if (options.options?.throwOnFailure) throw error;
    }
    return;
  }
  let hostCredentials: { password: string | null; privateKeyPassphrase: string | null } | undefined;
  let resolveReady: (value: { status: string; credentials?: typeof hostCredentials }) => void;
  const readySignal = new Promise<{ status: string; credentials?: typeof hostCredentials }>((resolve) => {
    resolveReady = resolve;
  });
  const initiator = options.reconnectEntry(options.selected, {
      ...options.options,
      throwOnFailure: !0,
      onSshHostReady: (credentials: { password: string | null; privateKeyPassphrase: string | null }) => {
        hostCredentials || ((hostCredentials = credentials), resolveReady!({ status: `ready`, credentials }));
      },
    });
  const outcome = initiator.then(
      (done) =>
        hostCredentials
          ? { status: `ready`, credentials: hostCredentials }
          : done
            ? {
                status: `failed`,
                error: Error(`SSH initiator completed without reporting Host ready`),
              }
            : { status: `skipped` },
      (error) => (hostCredentials ? { status: `ready`, credentials: hostCredentials } : { status: `failed`, error }),
    );
  const raced = await Promise.race([readySignal, outcome]);
  if (raced.status !== `ready`) {
    if (raced.status === `failed` && options.options?.throwOnFailure) throw (raced as { error?: unknown }).error;
    return;
  }
  const followers = Promise.allSettled(
      others.map((entry) =>
        options.reconnectEntry(entry, {
          ...options.options,
          activateWorkspaceAfterReconnect: !1,
          sshCredentialsOverride: raced.credentials,
        }),
      ),
    );
  const [initiatorOutcome] = await Promise.all([
      initiator.then(
        () => ({ status: `fulfilled` as const }),
        (error) => ({ status: `rejected` as const, error }),
      ),
      followers,
    ]);
  if (initiatorOutcome.status === `rejected` && options.options?.throwOnFailure) throw initiatorOutcome.error;
}

/** 原 G3t（209247 / 166047）：工作区是否仍在 tab 中 */
export function isWorkspacePresentInTabs(options: { tabStoreApi: { getState(): TabStoreState }; workspacePath: string; workspaceIdentity?: string | null }): boolean {
  const key = options.workspaceIdentity?.trim() || options.workspacePath;
  return options.tabStoreApi
    .getState()
    .tabs.some(
      (tab) =>
        isWorkspaceKindTab(tab) &&
        ((tab.workspaceIdentity?.trim() || tab.workspacePath) === key ||
          tab.workspacePath === options.workspacePath),
    );
}

/** 原 K3t（209258 / 166051）：取消在途重连请求 */
export async function cancelPendingReconnectRequests(options: {
  workspaceKeys: string[];
  pendingRequestIds: Map<string, string>;
  cancelPendingRemoteConnection?: (requestId: string) => Promise<void>;
  logger: typeof logger;
}): Promise<void> {
  const requestIds = options.workspaceKeys.flatMap((key) => {
    const requestId = options.pendingRequestIds.get(key);
    return requestId ? (options.pendingRequestIds.delete(key), [requestId]) : [];
  });
  !options.cancelPendingRemoteConnection ||
    requestIds.length === 0 ||
    (await Promise.all(
      requestIds.map(async (requestId) => {
        try {
          await options.cancelPendingRemoteConnection?.(requestId);
        } catch (error) {
          options.logger.warn(`[Root] 取消远程 workspace 重连失败`, { requestId, error });
        }
      }),
    ));
}

/** 原 q3t（209275 / 166067）：从历史打开远控工作区（已连接则激活，否则重连） */
export async function openRemoteWorkspaceFromHistory(options: {
  workspaceKey: string;
  tabStoreApi: { getState(): TabStoreState };
  getRemoteSessions: () => RemoteSessionEntry[];
  inflightReconnectWorkspaceKeys: Set<string>;
  activateTabByPath: (path: string, opts?: any) => boolean;
  setReconnectingRemoteWorkspaceKeys: React.Dispatch<React.SetStateAction<string[]>>;
  loadCredential: (key: string) => Promise<string | null>;
  connectRemoteWorkspaceTarget: (target: RemoteSessionTarget, requestId?: string, context?: Record<string, unknown>) => Promise<string>; // A1-R7 链精化：bundle k 参为 x=RemoteSessionTarget
  resolveRemoteWorkspaceCanonicalPath: (sessionId: string, path: string) => Promise<string>;
  syncRemoteWorkspaceModelProviders: (sessionId: string, path: string, identity: string) => Promise<void>;
  disposeRemoteWorkspaceSession: (sessionId: string) => Promise<void>;
  addTab: (path: string, patch?: any) => void;
  commitRemoteWorkspaceSessionMutation: (mutation: RemoteSessionMutation) => Promise<unknown>;
  resetLogsForWorkspaceKey: (key: string) => void;
  createReconnectRequestId?: () => string;
  pendingReconnectRequestIds?: Map<string, string>;
  reconnectImpl?: typeof reconnectRemoteWorkspaceEntry;
  onWorkspaceActivated?: (context: { workspacePath: string; workspaceIdentity?: string | null }) => void;
}): Promise<void> {
  const reconnectImpl = options.reconnectImpl ?? reconnectRemoteWorkspaceEntry;
  const entry = options.getRemoteSessions().find((session) => remoteWorkspaceKey(session) === options.workspaceKey);
  if (!entry || options.inflightReconnectWorkspaceKeys.has(options.workspaceKey)) return;
  const tab = options.tabStoreApi.getState().tabs.find((candidate) => isWorkspaceKindTab(candidate) && remoteWorkspaceKey(candidate) === options.workspaceKey);
  if (tab?.remoteSessionId) {
    options.activateTabByPath(tab.workspacePath, { workspaceIdentity: tab.workspaceIdentity });
    return;
  }
  (options.resetLogsForWorkspaceKey(options.workspaceKey), options.inflightReconnectWorkspaceKeys.add(options.workspaceKey));
  const requestId = options.createReconnectRequestId?.();
  requestId && options.pendingReconnectRequestIds?.set(options.workspaceKey, requestId);
  try {
    await reconnectImpl({
      sessionEntry: entry,
      activateTabByPath: options.activateTabByPath,
      setReconnectingRemoteWorkspaceKeys: options.setReconnectingRemoteWorkspaceKeys,
      loadCredential: options.loadCredential,
      connectRemoteWorkspaceTarget: options.connectRemoteWorkspaceTarget,
      resolveRemoteWorkspaceCanonicalPath: options.resolveRemoteWorkspaceCanonicalPath,
      syncRemoteWorkspaceModelProviders: options.syncRemoteWorkspaceModelProviders,
      disposeRemoteWorkspaceSession: options.disposeRemoteWorkspaceSession,
      bindRemoteWorkspacePath,
      bindRemoteWorkspaceIdentity,
      upsertWorkspaceTab: options.addTab,
      commitRemoteWorkspaceSessionMutation: options.commitRemoteWorkspaceSessionMutation,
      getRemoteSessions: options.getRemoteSessions,
      logger,
      toast,
      shouldKeepReconnectedWorkspace: ({ workspacePath, workspaceIdentity }) =>
        isWorkspacePresentInTabs({ tabStoreApi: options.tabStoreApi, workspacePath, workspaceIdentity }),
      onWorkspaceActivated: (context) => {
        (logger.debug(`[Root] 远程历史 workspace ready，提交 tab 与 draft 激活`, context), options.onWorkspaceActivated?.(context));
      },
      options: { activateWorkspaceAfterReconnect: !0, showErrorToast: !0, requestId },
    });
  } finally {
    (options.inflightReconnectWorkspaceKeys.delete(options.workspaceKey), requestId && options.pendingReconnectRequestIds?.get(options.workspaceKey) === requestId && options.pendingReconnectRequestIds.delete(options.workspaceKey));
  }
}

/** 原 J3t（209333 / 166137）：远控项目选择完成（规范化 → 同步 → 提交 → 激活） */
export async function completeRemoteProjectSelection(options: {
  canUseRemoteWorkspace: boolean;
  sessionId: string;
  path: string;
  localWorkspacePath?: string;
  loadingMessage: string;
  getRemoteWorkspaceSession: (sessionId: string) => RegisteredSession | null; // A1-R7：tc 改指 getSessionById，参型随 canonical（原局部 RemoteWorkspaceSession 已删）
  connectionTarget?: RemoteSessionTarget; // A1-R7 链精化（bundle J3t：o ?? b.target，二者皆 RemoteSessionTarget 面）
  getWorkspaceTabs: () => WorkspaceTab[];
  resolveRemoteWorkspaceCanonicalPath: (sessionId: string, path: string) => Promise<string>;
  activateTabByPath: (path: string, opts?: any) => boolean;
  handleCancelRemoteProject: (sessionId: string) => Promise<void>;
  syncRemoteWorkspaceModelProviders: (sessionId: string, path: string, identity: string) => Promise<void>;
  commitRemoteWorkspaceSessionMutation: (mutation: RemoteSessionMutation) => Promise<unknown>;
  getRemoteSessions: () => RemoteSessionEntry[];
  bindRemoteWorkspacePath: (path: string, sessionId: string) => void;
  bindRemoteWorkspaceIdentity: (identity: string, sessionId: string) => void;
  addTab: (path: string, patch?: any) => void;
  onWorkspaceActivated?: (context: { workspacePath: string; workspaceIdentity?: string | null }) => void;
  refreshPinnedTasks: (context: { sessionId: string; workspacePath: string; workspaceIdentity?: string | null }) => Promise<void>;
  refreshTimelineTasks: (context: { sessionId: string; workspacePath: string; workspaceIdentity?: string | null }) => Promise<void>;
}): Promise<void> {
  if (!options.canUseRemoteWorkspace) throw Error(`Remote workspace is disabled in this mode`);
  const session = options.getRemoteWorkspaceSession(options.sessionId);
  if (!session) throw Error(options.loadingMessage);
  const target = options.connectionTarget ?? session.target;
  if (!target) throw Error(`远程 workspace session 缺少连接目标: ${options.sessionId}`);
  const canonicalPath = await options.resolveRemoteWorkspaceCanonicalPath(options.sessionId, options.path);
  const identity = workspaceIdentityOf(canonicalPath, target);
  if (
    options.getWorkspaceTabs().find(
      (tab) =>
        isWorkspaceKindTab(tab) && tab.workspacePath === canonicalPath && (tab.workspaceIdentity?.trim() || tab.workspacePath) === identity,
    )?.remoteSessionId &&
    options.activateTabByPath(canonicalPath, { workspaceIdentity: identity })
  ) {
    (options.onWorkspaceActivated?.({ workspacePath: canonicalPath, workspaceIdentity: identity }), await options.handleCancelRemoteProject(options.sessionId));
    return;
  }
  (await options.syncRemoteWorkspaceModelProviders(options.sessionId, canonicalPath, identity),
    await options.commitRemoteWorkspaceSessionMutation(
      commitRemoteSessionsMutation({
        remoteSessions: options.getRemoteSessions(),
        workspacePath: canonicalPath,
        localWorkspacePath: options.localWorkspacePath,
        workspaceIdentity: identity,
        target,
        lastConnectionStatus: `connected`,
        touchOpenedAt: !0,
      }),
    ),
    options.bindRemoteWorkspacePath(canonicalPath, options.sessionId),
    options.bindRemoteWorkspaceIdentity(identity, options.sessionId),
    options.addTab(canonicalPath, { remoteSessionId: options.sessionId, remoteTarget: serializeRemoteTarget(target), workspaceIdentity: identity, localWorkspacePath: options.localWorkspacePath }),
    options.onWorkspaceActivated?.({ workspacePath: canonicalPath, workspaceIdentity: identity }),
    await Promise.all([
      options.refreshPinnedTasks({ sessionId: options.sessionId, workspacePath: canonicalPath, workspaceIdentity: identity }),
      options.refreshTimelineTasks({ sessionId: options.sessionId, workspacePath: canonicalPath, workspaceIdentity: identity }),
    ]));
}

/** 原 Y3t（209393 / 166201）：useRemoteWorkspaceOrchestrator —— 远控工作区编排总钩子 */
export function useRemoteWorkspaceOrchestrator(options: {
  intl: IntlShape;
  services: ServicesBundle;
  platform: PlatformService;
  supportsSettings: boolean;
  allowRemoteWorkspace?: boolean;
  ensureConversationWorkspaceOnRestore?: boolean;
  deferInactiveWorkspaceRestore?: boolean;
  unavailableWorkspacePath?: string;
  tabStoreApi: { getState(): TabStoreState; setState(mutator: (state: TabStoreState) => Partial<TabStoreState>): void };
  activateTabByPath: (path: string, opts?: any) => boolean;
  addTab: (path: string, patch?: any) => void;
  onWorkspaceActivated?: (context: { workspacePath: string; workspaceIdentity?: string | null }) => void;
}) {
  const { intl, services, platform, supportsSettings, allowRemoteWorkspace = !0, ensureConversationWorkspaceOnRestore = !1, deferInactiveWorkspaceRestore = !1, unavailableWorkspacePath, tabStoreApi, activateTabByPath, addTab, onWorkspaceActivated } = options;
  const featureEnabled = useWebRemoteControlFeatureEnabled();
  const canUseRemoteWorkspace = allowRemoteWorkspace && featureEnabled;
  const allowRestore = canUseRemoteWorkspace;
  const [remoteWorkspaceSessions, setRemoteWorkspaceSessions] = React.useState<RemoteSessionEntry[]>([]);
  const sessionsRef = React.useRef<RemoteSessionEntry[]>([]);
  const [reconnectingKeys, setReconnectingKeys] = React.useState<string[]>([]);
  const inflightKeysRef = React.useRef(new Set<string>());
  const pendingRequestIdsRef = React.useRef(new Map<string, string>());
  const connectTargetBySessionRef = React.useRef(new Map<string, RemoteSessionTarget>()); // A1-R7 链精化：Map 值型随 connectionTarget 链
  React.useRef(null);
  const { logsByWorkspaceKey, resetLogsForWorkspaceKey } = useRemoteConnectionLogs({
      platform,
      reconnectingWorkspaceKeys: reconnectingKeys,
      resolveWorkspaceTargetByKey: (key) => sessionsRef.current.find((entry) => remoteWorkspaceKey(entry) === key)?.target ?? null,
      resolveWorkspaceRequestIdByKey: (key) => pendingRequestIdsRef.current.get(key) ?? null,
    });
  const commitSessionsMutation = React.useCallback(
      async (nextSessions: RemoteSessionEntry[]) => {
        (setRemoteWorkspaceSessions([...nextSessions]),
          (sessionsRef.current = [...nextSessions]),
          supportsSettings && (await services.settingService.update(buildPersistedTabPatch(tabStoreApi.getState(), nextSessions))));
      },
      [services.settingService, supportsSettings, tabStoreApi],
    );
  const commitWithCredentials = React.useCallback(
      async (mutation: { credentialKeysToDelete: string[]; credentialsToSave: Array<{ key: string; value: string }>; nextRemoteSessions: RemoteSessionEntry[]; entry?: unknown }) => {
        for (const key of mutation.credentialKeysToDelete)
          try {
            await services.credentialService.delete(key);
          } catch (error) {
            logger.warn(`[Root] 删除远程 workspace 凭据失败`, { credentialKey: key, error });
          }
        for (const credential of mutation.credentialsToSave) await services.credentialService.save(credential.key, credential.value);
        return (await commitSessionsMutation(mutation.nextRemoteSessions), mutation.entry);
      },
      [services.credentialService, commitSessionsMutation],
    );
  const awaitSessionReady = React.useCallback(async (sessionId: string) => {
      getRemoteWorkspaceSession(sessionId) ||
        (await new Promise<void>((resolve, reject) => {
          const startedAt = Date.now();
          const timer = window.setInterval(() => {
            if (getRemoteWorkspaceSession(sessionId)) {
              (window.clearInterval(timer), resolve());
              return;
            }
            Date.now() - startedAt >= 3e3 &&
              (window.clearInterval(timer), reject(Error(`等待远程 workspace session 就绪超时: ${sessionId}`)));
          }, 50);
        }));
    }, []);
  const connectRemoteTarget = React.useCallback(
      // A1-R7 链精化：target unknown → RemoteSessionTarget（bundle k 消费 x=connectionTarget ?? session.target）
      async (target: RemoteSessionTarget, credentials: unknown, context?: Record<string, unknown>) => {
        const result = await platform.connectRemote(target, credentials, context);
        if (!result.success) throw Error(normalizeConnectionError(result.error || `Connection failed`));
        if (!result.sessionId) throw Error(`Remote session was not created`);
        return (await awaitSessionReady(result.sessionId), context || connectTargetBySessionRef.current.set(result.sessionId, target), result.sessionId);
      },
      [platform, awaitSessionReady],
    );
  const resolveCanonicalPath = React.useCallback(async (sessionId: string, path: string) => {
      const session = getRemoteWorkspaceSession(sessionId);
      if (!session) return path;
      try {
        // A1-R7 行注：fileService 于 BaseServices 为可选面（消费面具型），运行期缺失时抛错入 catch 返 path，与 bundle 209465–209470 try/catch 行为逐字一致，故非空断言。
        return await session.services.fileService!.resolvePath({ path });
      } catch {
        return path;
      }
    }, []);
  const buildPersistPatch = React.useCallback((state: TabStoreState) => buildPersistedTabPatch(state, sessionsRef.current), []);
  const disposeRemoteSession = React.useCallback(
      async (sessionId: string) => {
        try {
          await platform.disposeRemoteSession(sessionId);
        } finally {
          (connectTargetBySessionRef.current.delete(sessionId), unregisterRemoteSession(sessionId));
        }
      },
      [platform],
    );
  const syncModelProviders = React.useCallback(
      async (sessionId: string, workspacePath: string, workspaceIdentity?: string | null) => {
        const session = getRemoteWorkspaceSession(sessionId);
        if (!session) throw Error(`远程 workspace session 不存在: ${sessionId}`);
        try {
          (await platform.bindRemoteWorkspaceSessionContext?.({
            remoteSessionId: sessionId,
            workspacePath,
            workspaceIdentity,
          }),
            await syncRemoteWorkspaceModelProviders({
              workspacePath,
              workspaceIdentity,
              remoteSessionId: sessionId,
              localModelProviderService: services.modelProviderService,
              remoteZCodeSessionService: session.services.zcodeSessionService,
            }));
        } catch (error) {
          throw (await disposeRemoteSession(sessionId), error);
        }
      },
      [disposeRemoteSession, platform, services.modelProviderService],
    );
  const reconnectRemoteWorkspace = React.useCallback(
      async (entry: RemoteSessionEntry, reconnectOptions?: Record<string, unknown>) => {
        const key = remoteWorkspaceKey(entry);
        if (inflightKeysRef.current.has(key)) return !1;
        const tab = tabStoreApi.getState().tabs.find((candidate) => isWorkspaceKindTab(candidate) && remoteWorkspaceKey(candidate) === key);
        if (!tab || tab.remoteSessionId) return !1;
        (resetLogsForWorkspaceKey(key), inflightKeysRef.current.add(key));
        const requestId = createRequestId();
        pendingRequestIdsRef.current.set(key, requestId);
        try {
          const ensureWorkspaceTab = tabStoreApi.getState().ensureWorkspaceTab;
          return (
            logger.debug(`[Root] 远程 workspace 重连中，保留当前 conversation`, { workspaceKey: key }),
            await reconnectRemoteWorkspaceEntry({
              sessionEntry: entry,
              activateTabByPath,
              setReconnectingRemoteWorkspaceKeys: setReconnectingKeys,
              loadCredential: services.credentialService.load,
              connectRemoteWorkspaceTarget: connectRemoteTarget,
              resolveRemoteWorkspaceCanonicalPath: resolveCanonicalPath,
              syncRemoteWorkspaceModelProviders: syncModelProviders,
              disposeRemoteWorkspaceSession: disposeRemoteSession,
              bindRemoteWorkspacePath,
              bindRemoteWorkspaceIdentity,
              upsertWorkspaceTab: ensureWorkspaceTab,
              commitRemoteWorkspaceSessionMutation: commitWithCredentials,
              getRemoteSessions: () => sessionsRef.current,
              logger,
              toast,
              shouldKeepReconnectedWorkspace: ({ workspacePath, workspaceIdentity }) =>
                isWorkspacePresentInTabs({ tabStoreApi, workspacePath, workspaceIdentity }),
              onWorkspaceActivated: (context) => {
                (logger.debug(`[Root] 远程 workspace ready，提交 tab 与 draft 激活`, context), onWorkspaceActivated?.(context));
              },
              options: { ...reconnectOptions, requestId },
            }),
            !0
          );
        } finally {
          (inflightKeysRef.current.delete(key), pendingRequestIdsRef.current.get(key) === requestId && pendingRequestIdsRef.current.delete(key));
        }
      },
      [activateTabByPath, commitWithCredentials, connectRemoteTarget, disposeRemoteSession, onWorkspaceActivated, resolveCanonicalPath, resetLogsForWorkspaceKey, services.credentialService, syncModelProviders, tabStoreApi],
    );
  const reconnectRemoteWorkspaceGroup = React.useCallback(
      async (entry: RemoteSessionEntry, reconnectOptions?: Record<string, unknown>) => {
        await reconnectGroupWithSshReuse({
          selected: entry,
          reconnectGroup: resolveSshReconnectGroup({ selected: entry, sessions: sessionsRef.current, tabs: tabStoreApi.getState().tabs }),
          reconnectEntry: reconnectRemoteWorkspace,
          options: reconnectOptions,
        });
      },
      [reconnectRemoteWorkspace, tabStoreApi],
    );
  React.useEffect(() => {}, []);
  const restorePersistedSession = React.useCallback(
      async (settings: AppSettings) => {
        const normalized = normalizePersistedRemoteSessions(settings);
        (setRemoteWorkspaceSessions(normalized), (sessionsRef.current = normalized));
        let conversationWorkspacePath: string | undefined;
        if (ensureConversationWorkspaceOnRestore)
          try {
            conversationWorkspacePath = (await services.fileService.ensureConversationWorkspace()).path;
          } catch (error) {
            logger.warn(`[Root] 恢复阶段解析 conversation workspace 失败`, { error });
          }
        const restored = restoreCombinedWorkspaceSessions({
          settings,
          tabStoreApi,
          allowRemoteWorkspaceRestore: allowRestore,
          unavailableWorkspacePath,
          conversationWorkspacePath,
          restoreMode: deferInactiveWorkspaceRestore ? `active-first` : `all`,
        });
        return {
          ...(conversationWorkspacePath ? { excludedRecentProjectPaths: [conversationWorkspacePath] } : {}),
          ...(restored?.deferredRestore ? { deferredRestore: restored.deferredRestore } : {}),
        };
      },
      [allowRestore, deferInactiveWorkspaceRestore, ensureConversationWorkspaceOnRestore, services.fileService, tabStoreApi, unavailableWorkspacePath],
    );
  const selectRemoteProject = React.useCallback(
      async (sessionId: string, path: string, localWorkspacePath?: string) => {
        try {
          await completeRemoteProjectSelection({
            canUseRemoteWorkspace,
            sessionId,
            path,
            localWorkspacePath,
            loadingMessage: intl.formatMessage({ id: `common.loading` }),
            getRemoteWorkspaceSession,
            connectionTarget: connectTargetBySessionRef.current.get(sessionId),
            getWorkspaceTabs: () => tabStoreApi.getState().tabs,
            resolveRemoteWorkspaceCanonicalPath: resolveCanonicalPath,
            activateTabByPath,
            handleCancelRemoteProject: disposeRemoteSession,
            syncRemoteWorkspaceModelProviders: syncModelProviders,
            commitRemoteWorkspaceSessionMutation: commitWithCredentials,
            getRemoteSessions: () => sessionsRef.current,
            bindRemoteWorkspacePath,
            bindRemoteWorkspaceIdentity,
            addTab,
            onWorkspaceActivated,
            refreshPinnedTasks,
            refreshTimelineTasks,
          });
        } finally {
          connectTargetBySessionRef.current.delete(sessionId);
        }
      },
      [activateTabByPath, addTab, tabStoreApi, commitWithCredentials, disposeRemoteSession, intl, onWorkspaceActivated, resolveCanonicalPath, syncModelProviders, canUseRemoteWorkspace],
    );
  const connectRemote = React.useCallback(
      // A1-R7 链精化：同 connectRemoteTarget（包装层透传面）
      async (target: RemoteSessionTarget, credentials: unknown, context?: Record<string, unknown>) => {
        if (!canUseRemoteWorkspace) throw Error(`Remote workspace is disabled in this mode`);
        return connectRemoteTarget(target, credentials, context);
      },
      [canUseRemoteWorkspace, connectRemoteTarget],
    );
  const reconnectByKey = React.useCallback(
      async (workspaceKey: string, reconnectOptions?: Record<string, unknown>) => {
        await reconnectRemoteWorkspaceByKey({
          workspaceKey,
          canUseRemoteWorkspace,
          getRemoteSessions: () => sessionsRef.current,
          runReconnectRemoteWorkspace: reconnectRemoteWorkspaceGroup,
          options: {
            activateWorkspaceAfterReconnect: !0,
            showErrorToast: !0,
            throwOnFailure: !1,
            ...reconnectOptions,
          },
        });
      },
      [canUseRemoteWorkspace, reconnectRemoteWorkspaceGroup],
    );
  const openFromHistory = React.useCallback(
      async (workspaceKey: string) => {
        canUseRemoteWorkspace &&
          (await openRemoteWorkspaceFromHistory({
            workspaceKey,
            tabStoreApi,
            getRemoteSessions: () => sessionsRef.current,
            inflightReconnectWorkspaceKeys: inflightKeysRef.current,
            activateTabByPath,
            setReconnectingRemoteWorkspaceKeys: setReconnectingKeys,
            loadCredential: services.credentialService.load,
            connectRemoteWorkspaceTarget: connectRemoteTarget,
            resolveRemoteWorkspaceCanonicalPath: resolveCanonicalPath,
            syncRemoteWorkspaceModelProviders: syncModelProviders,
            disposeRemoteWorkspaceSession: disposeRemoteSession,
            addTab,
            commitRemoteWorkspaceSessionMutation: commitWithCredentials,
            createReconnectRequestId: createRequestId,
            pendingReconnectRequestIds: pendingRequestIdsRef.current,
            resetLogsForWorkspaceKey,
            onWorkspaceActivated,
          }));
      },
      [activateTabByPath, addTab, commitWithCredentials, connectRemoteTarget, disposeRemoteSession, resolveCanonicalPath, resetLogsForWorkspaceKey, onWorkspaceActivated, services.credentialService, syncModelProviders, tabStoreApi, canUseRemoteWorkspace],
    );
  const handleRemoteSessionClosed = React.useCallback(
      async (event: RemoteSessionClosedEvent) => {
        const sessionId = event.sessionId.trim();
        if (!sessionId) return;
        const affectedTabs = tabStoreApi.getState().tabs.filter((tab) => isWorkspaceKindTab(tab) && tab.remoteSessionId === sessionId);
        if (affectedTabs.length === 0) {
          unregisterRemoteSession(sessionId);
          return;
        }
        (tabStoreApi.setState((state) => ({
          tabs: state.tabs.map((tab) =>
            isWorkspaceKindTab(tab) && tab.remoteSessionId === sessionId ? { ...tab, remoteSessionId: void 0 } : tab,
          ),
        })),
          unregisterRemoteSession(sessionId));
        const affectedKeys = [...new Set(affectedTabs.map((tab) => remoteWorkspaceKey(tab)))];
        const reason = [
            `远程连接已断开`,
            event.exitCode == null ? null : `exitCode=${event.exitCode}`,
            event.signal ? `signal=${event.signal}` : null,
          ]
            .filter(Boolean)
            .join(` `);
        const taskState = taskStore.getState();
        const failedTaskCount = failActiveTasksForClosedTabs({
            tabs: affectedTabs,
            getWorkspaceState: taskState.getWorkspaceState,
            setTaskRuntimeState: taskState.setTaskRuntimeState,
            reason,
          });
        logger.warn(`[Root] 远程 workspace session 已关闭`, {
          sessionId,
          reason: event.reason,
          exitCode: event.exitCode,
          signal: event.signal,
          matchedWorkspaceKeys: affectedKeys,
          failedTaskCount,
        });
        for (const key of affectedKeys) {
          const entry = sessionsRef.current.find((session) => remoteWorkspaceKey(session) === key);
          if (!entry) continue;
          const pendingRequestId = pendingRequestIdsRef.current.get(key);
          if (!shouldPersistClosedSessionFailure({ pendingReconnectRequestIds: pendingRequestIdsRef.current, sessionEntry: entry, workspaceKey: key })) {
            logger.info(`[Root] WSL workspace session 关闭时跳过失败落盘，等待重连结果`, {
              pendingReconnectRequestId: pendingRequestId,
              sessionId,
              workspaceIdentity: entry.workspaceIdentity ?? null,
              workspacePath: entry.workspacePath,
              workspaceKey: key,
            });
            continue;
          }
          await commitWithCredentials(
            commitRemoteSessionsMutation({
              remoteSessions: sessionsRef.current,
              workspacePath: entry.workspacePath,
              workspaceIdentity: entry.workspaceIdentity,
              target: withRemoteCredentials(entry.target, { password: null, privateKeyPassphrase: null }),
              lastConnectionStatus: `failed`,
              lastConnectionError: reason,
              touchOpenedAt: !1,
            }) as unknown as { credentialKeysToDelete: string[]; credentialsToSave: Array<{ key: string; value: string }>; nextRemoteSessions: RemoteSessionEntry[] },
          );
        }
      },
      [commitWithCredentials, tabStoreApi],
    );
  const handleBotRemoteWorkspaceReconnected = React.useCallback(
      async (event: BotRemoteWorkspaceReconnectedEvent) => {
        if (!canUseRemoteWorkspace) return;
        const sessionId = event.sessionId.trim();
        if (sessionId)
          try {
            await awaitSessionReady(sessionId);
            const session = getRemoteWorkspaceSession(sessionId);
            if (!session) throw Error(`远程 workspace session 不存在: ${sessionId}`);
            if (!session.target) throw Error(`远程 workspace session 缺少连接目标: ${sessionId}`);
            const canonicalPath = await resolveCanonicalPath(sessionId, event.workspacePath);
            const identity = identityFromReconnectEvent({ event: event as unknown as { workspaceIdentity: string }, resolvedWorkspacePath: canonicalPath, target: session.target });
            (await syncModelProviders(sessionId, canonicalPath, identity),
              bindRemoteWorkspacePath(canonicalPath, sessionId),
              bindRemoteWorkspaceIdentity(identity, sessionId),
              tabStoreApi
                .getState()
                .ensureWorkspaceTab(canonicalPath, {
                  remoteSessionId: sessionId,
                  remoteTarget: session.target,
                  workspaceIdentity: identity,
                }),
              await commitWithCredentials(
                commitRemoteSessionsMutation({
                  remoteSessions: sessionsRef.current,
                  workspacePath: canonicalPath,
                  workspaceIdentity: identity,
                  target: session.target,
                  lastConnectionStatus: `connected`,
                  touchOpenedAt: !0,
                }) as unknown as { credentialKeysToDelete: string[]; credentialsToSave: Array<{ key: string; value: string }>; nextRemoteSessions: RemoteSessionEntry[] },
              ),
              await Promise.all([
                refreshPinnedTasks({ sessionId, workspacePath: canonicalPath, workspaceIdentity: identity }),
                refreshTimelineTasks({ sessionId, workspacePath: canonicalPath, workspaceIdentity: identity }),
              ]));
          } catch (error) {
            logger.warn(`[Root] Bot 远端 workspace 重连成功后同步 UI 状态失败`, {
              sessionId,
              workspacePath: event.workspacePath,
              workspaceIdentity: event.workspaceIdentity,
              error: error instanceof Error ? error.message : String(error),
            });
          }
      },
      [canUseRemoteWorkspace, commitWithCredentials, resolveCanonicalPath, syncModelProviders, tabStoreApi, awaitSessionReady],
    );
  (React.useEffect(
    () =>
      platform.onRemoteSessionClosed((event) => {
        handleRemoteSessionClosed(event);
      }),
    [handleRemoteSessionClosed, platform],
  ),
    React.useEffect(
      () =>
        platform.onBotRemoteWorkspaceReconnected((event) => {
          handleBotRemoteWorkspaceReconnected(event);
        }),
      [handleBotRemoteWorkspaceReconnected, platform],
    ));
  const handleRemoteWorkspaceTabsClosed = React.useCallback(
    (workspaceKeys: string[]) => {
      if (workspaceKeys.length === 0) return;
      const removed = new Set(workspaceKeys);
      (async () => {
        (await cancelPendingReconnectRequests({
          workspaceKeys,
          pendingRequestIds: pendingRequestIdsRef.current,
          cancelPendingRemoteConnection: platform.cancelPendingRemoteConnection
            ? (requestId) => platform.cancelPendingRemoteConnection?.(requestId) ?? Promise.resolve()
            : void 0,
          logger,
        }),
          setReconnectingKeys((keys) => keys.filter((key) => !removed.has(key))));
        const diff = removeSessionsByWorkspaceKeys(sessionsRef.current, workspaceKeys);
        if (!(
          diff.nextRemoteSessions.length === sessionsRef.current.length && diff.credentialKeysToDelete.length === 0
        )) {
          await commitSessionsMutation(diff.nextRemoteSessions);
          for (const key of diff.credentialKeysToDelete)
            try {
              await services.credentialService.delete(key);
            } catch (error) {
              logger.warn(`[Root] 删除已移除远程 workspace 凭据失败`, { credentialKey: key, error });
            }
        }
      })();
    },
    [platform, services.credentialService, commitSessionsMutation],
  );
  return {
    remoteWorkspaceSessions,
    reconnectingRemoteWorkspaceKeys: reconnectingKeys,
    remoteWorkspaceErrorByWorkspaceKey: React.useMemo(
      () =>
        Object.fromEntries(
          remoteWorkspaceSessions.flatMap((entry) => (entry.lastConnectionError?.trim() ? [[remoteWorkspaceKey(entry), entry.lastConnectionError]] : [])),
        ),
      [remoteWorkspaceSessions],
    ),
    reconnectingRemoteWorkspaceLogsByWorkspaceKey: logsByWorkspaceKey,
    buildPersistedTabPatch: buildPersistPatch,
    restorePersistedSession,
    handleCancelRemoteProject: disposeRemoteSession,
    handleSelectRemoteProject: selectRemoteProject,
    handleConnectRemote: connectRemote,
    handleReconnectRemoteWorkspace: reconnectByKey,
    handleOpenRemoteWorkspaceFromHistory: openFromHistory,
    handleRemoteWorkspaceTabsClosed,
  };
}

/** 原 X3t（209851 / 166613）：被移除 tab 中的远控身份集 */
export function removedRemoteWorkspaceIdentities(previousTabs: WorkspaceTab[], currentTabs: WorkspaceTab[]): string[] {
  const currentIdentities = new Set(
      currentTabs.flatMap((tab) => {
        const identity = tab.workspaceIdentity?.trim();
        return identity ? [identity] : [];
      }),
    );
  const removed = new Set<string>();
  for (const tab of previousTabs) {
    const identity = tab.workspaceIdentity?.trim();
    !identity || currentIdentities.has(identity) || removed.add(identity);
  }
  return [...removed];
}

/** 原 Z3t（209865 / 166625）：远控 tab 移除时的 session 回收与绑定迁移 */
export function useRemoteTabSessionDisposal(options: {
  tabs: WorkspaceTab[];
  activeWorkspaceTab: (WorkspaceTab & { remoteSessionId?: string }) | null;
  platform: PlatformService;
  onRemoteWorkspaceTabsClosed?: (workspaceKeys: string[]) => void;
}): void {
  const previousTabsRef = React.useRef<WorkspaceTab[]>([]);
  (React.useEffect(() => {
    const previousWorkspaceTabs = previousTabsRef.current.filter(isWorkspaceKindTab);
    const currentWorkspaceTabs = options.tabs.filter(isWorkspaceKindTab);
    const removedIdentities = removedRemoteWorkspaceIdentities(previousWorkspaceTabs, currentWorkspaceTabs);
    removedIdentities.length > 0 && options.onRemoteWorkspaceTabsClosed?.(removedIdentities);
    const liveSessionIds = new Set(currentWorkspaceTabs.map((tab) => tab.remoteSessionId).filter((sessionId) => !!sessionId));
    for (const previous of previousWorkspaceTabs) {
      if (currentWorkspaceTabs.some((tab) => tab.id === previous.id) || !previous.remoteSessionId) continue;
      const replacement = currentWorkspaceTabs.find((tab) =>
        tab.remoteSessionId
          ? previous.workspaceIdentity && tab.workspaceIdentity
            ? tab.workspaceIdentity === previous.workspaceIdentity
            : tab.workspacePath === previous.workspacePath
          : !1,
      );
      replacement?.remoteSessionId
        ? (bindRemoteWorkspacePath(replacement.workspacePath, replacement.remoteSessionId),
          replacement.workspaceIdentity && bindRemoteWorkspaceIdentity(replacement.workspaceIdentity, replacement.remoteSessionId))
        : (unbindRemoteWorkspacePath(previous.workspacePath), previous.workspaceIdentity && unbindRemoteWorkspaceIdentity(previous.workspaceIdentity));
    }
    const disposed = new Set<string>();
    for (const previous of previousWorkspaceTabs) {
      const sessionId = previous.remoteSessionId;
      if (!sessionId || liveSessionIds.has(sessionId) || disposed.has(sessionId)) continue;
      disposed.add(sessionId);
      const workspacePath = previous.workspacePath;
      (async () => {
        try {
          (logger.info(`[Root] remote workspace tab 已移除，主动释放远程 session`, {
            workspacePath,
            workspaceIdentity: previous.workspaceIdentity,
            sessionId,
          }),
            await options.platform.disposeRemoteSession(sessionId));
        } catch (error) {
          logger.warn(`[Root] 释放远程 session 失败:`, { sessionId, error });
        } finally {
          unregisterRemoteSession(sessionId);
        }
      })();
    }
    previousTabsRef.current = currentWorkspaceTabs;
  }, [options.onRemoteWorkspaceTabsClosed, options.platform, options.tabs]),
    React.useEffect(() => {
      options.activeWorkspaceTab?.remoteSessionId &&
        (bindRemoteWorkspacePath(options.activeWorkspaceTab.workspacePath, options.activeWorkspaceTab.remoteSessionId),
        options.activeWorkspaceTab.workspaceIdentity && bindRemoteWorkspaceIdentity(options.activeWorkspaceTab.workspaceIdentity, options.activeWorkspaceTab.remoteSessionId));
    }, [options.activeWorkspaceTab?.remoteSessionId, options.activeWorkspaceTab?.workspaceIdentity, options.activeWorkspaceTab?.workspacePath]));
}

/** 原 Q3t（209916 / 166671）：模型供应商快照刷新钩子 */
export function useModelProviderSnapshotRefresher(services: ServicesBundle) {
  return React.useCallback(
    async (refreshOptions?: { cachedOnly?: boolean; force?: boolean }) => {
      if (!isModelProviderSnapshotHydrated())
        try {
          await refreshModelProviderSnapshot(() => services.modelProviderService.getAllCached());
        } catch (error) {
          logger.warn(`[Root] 读取本地模型供应商缓存失败，继续远端刷新:`, error);
        }
      try {
        await refreshModelProviderSnapshot(
          () =>
            refreshOptions?.cachedOnly === !0
              ? services.modelProviderService.getAllCached()
              : services.modelProviderService.getAll(),
          refreshOptions,
        );
      } catch (error) {
        (logger.error(`[Root] 刷新模型供应商快照失败:`, error), isModelProviderSnapshotHydrated() || setModelProvidersFallback([]));
      }
    },
    [services.modelProviderService],
  );
}

/* ============================================================================
 * §F. provider family 迁移域（原 js 209943–210451）
 * ==========================================================================*/

/** 原 e6t（209943 / 166688）：preset selectedKey */
export function presetSelectedKey(providerId: string): string {
  return `preset:${providerId}`;
}

/** 原 V9（209946 / 166691）：coding-plan selectedKey */
export function codingPlanSelectedKey(providerId: string): string {
  return `coding-plan:${providerId}`;
}

/** 原 t6t（209949 / 166694）：team-plan selectedKey（bigmodel 走 vi() 编码） */
export function teamPlanSelectedKey(options: { providerId: string; productId: string; organizationId: string; projectKey: string }): string {
  return options.providerId === providerIds.bigmodelCodingPlan
    ? bigmodelTeamPlanKey({ productId: options.productId, organizationId: options.organizationId, projectId: options.projectKey })
    : options.projectKey
      ? `team-plan:${options.providerId}:${options.productId}:${options.projectKey}`
      : `team-plan:${options.providerId}:${options.productId}`;
}

/** 原 n6t（209956 / 166701）：首个已订阅团队套餐 key */
export function firstSubscribedTeamPlanKey(options: { codingPlanProviderId: string; teamProducts: TeamProduct[] }): string | null {
  for (const product of options.teamProducts) {
    if (product.subscribed !== !0) continue;
    const projects =
      product.teamProjects && product.teamProjects.length > 0
        ? product.teamProjects
        : [
            {
              organizationId: product.organizationId ?? ``,
              projectId: product.projectId ?? ``,
              apiKeyStatus: product.apiKeyStatus,
            },
          ];
    for (const project of projects) {
      if (project.apiKeyStatus === `unavailable`) continue;
      const organizationId = project.organizationId?.trim() ?? ``;
      const projectId = project.projectId?.trim() ?? ``;
      if (!(!organizationId || !projectId))
        return teamPlanSelectedKey({
          providerId: options.codingPlanProviderId,
          productId: product.productId,
          organizationId,
          projectKey: projectId,
        });
    }
  }
  return null;
}

/** 原 r6t（209984 / 166723）：selectedKey 是否为有效订阅团队套餐 */
export function isTeamPlanKeySubscribed(options: { selectedKey: string | null | undefined; codingPlanProviderId: string; teamProducts: TeamProduct[] }): boolean {
  const selected = options.selectedKey?.trim() ?? ``;
  if (!selected) return !1;
  for (const product of options.teamProducts) {
    if (product.subscribed !== !0) continue;
    const projects =
      product.teamProjects && product.teamProjects.length > 0
        ? product.teamProjects
        : [
            {
              organizationId: product.organizationId ?? ``,
              projectId: product.projectId ?? ``,
              apiKeyStatus: product.apiKeyStatus,
            },
          ];
    for (const project of projects) {
      if (project.apiKeyStatus === `unavailable`) continue;
      const organizationId = project.organizationId?.trim() ?? ``;
      const projectId = project.projectId?.trim() ?? ``;
      if (
        !(!organizationId || !projectId) &&
        isSameTeamPlanKey(
          teamPlanSelectedKey({
            providerId: options.codingPlanProviderId,
            productId: product.productId,
            organizationId,
            projectKey: projectId,
          }),
          selected,
        )
      )
        return !0;
    }
  }
  return !1;
}

/** 原 i6t（210020 / 166747）：OAuth 侧 family selectedKey 解析
 *  〔A1-R27〕codingPlanEntitlement/startPlanEntitlement 型缝精化 unknown → EntitlementSnapshot | null
 *  （行依据：实参来源 W9 ≡ 下方 fetchEntitlementSnapshot，bundle W9 210134 返回 service 快照或 null；
 *  iM 消费 210023/210032 改指 canonical，见 @831 墓碑）。 */
export function resolveOAuthFamilySelection(options: {
  providerFamilyDomain: string;
  modelProviders: ModelProviderRecord[];
  codingPlanEntitlement: EntitlementSnapshot | null;
  startPlanEntitlement: EntitlementSnapshot | null;
  teamProducts?: TeamProduct[];
}): { mode: string; selectedKey: string } | null {
  const provider = getOAuthProviderFamilyByProviderId(options.providerFamilyDomain === `zai` ? providerIds.zai : providerIds.bigmodel) as ModelProviderRecord | undefined; // 〔A1-R30〕型缝：canonical 返回 any，消费面依原 declare 契据窄化（行依据：本行 + 碑 @825）
  if (!provider) return null;
  if (hasActiveEntitlement(options.codingPlanEntitlement, provider.codingPlanProviderId))
    return { mode: `oauth`, selectedKey: codingPlanSelectedKey(provider.codingPlanProviderId) };
  if (provider.id === `bigmodel`) {
    const teamKey = firstSubscribedTeamPlanKey({
      codingPlanProviderId: provider.codingPlanProviderId,
      teamProducts: options.teamProducts ?? [],
    });
    if (teamKey) return { mode: `oauth`, selectedKey: teamKey };
  }
  return hasActiveEntitlement(options.startPlanEntitlement, provider.startPlanProviderId)
    ? { mode: `oauth`, selectedKey: codingPlanSelectedKey(provider.startPlanProviderId) }
    : { mode: `oauth`, selectedKey: codingPlanSelectedKey(provider.codingPlanProviderId) };
}

/** 原 H9（210036 / 166772）：family 缺省 selectedKey 表 */
export const FAMILY_DEFAULT_SELECTED_KEYS: Record<string, { apiKey: string; oauth: string }> = {
  zai: { apiKey: presetSelectedKey(providerIds.zai), oauth: codingPlanSelectedKey(providerIds.zaiCodingPlan) },
  bigmodel: { apiKey: presetSelectedKey(providerIds.bigmodel), oauth: codingPlanSelectedKey(providerIds.bigmodelCodingPlan) },
};

/** 原 a6t（210040 / 166782）：family 选择是否可用 */
export function isFamilySelectionUsable(options: { domain: string; mode: string; selectedKey: string }): boolean {
  if (options.mode === `apiKey`) return options.selectedKey === FAMILY_DEFAULT_SELECTED_KEYS[options.domain].apiKey;
  const startPlanProviderId = options.domain === `zai` ? providerIds.zaiStartPlan : providerIds.bigmodelStartPlan;
  if (options.selectedKey === codingPlanSelectedKey(startPlanProviderId) || options.selectedKey === FAMILY_DEFAULT_SELECTED_KEYS[options.domain].oauth) return !0;
  if (options.domain !== `bigmodel`) return !1;
  const parsed = parseTeamPlanKey(options.selectedKey);
  return !!(parsed?.productId.trim() && parsed.organizationId?.trim() && parsed.projectId?.trim());
}

/** 原 o6t（210048 / 166790）：找出选择不可用的 family domain */
export function findUnusableFamilyDomains(options: { settings: AppSettings }): string[] {
  return [`zai`, `bigmodel`].filter((domain) => {
    const mode = options.settings.modelProviderFamilyModes?.[domain];
    return mode === void 0
      ? !1
      : !isFamilySelectionUsable({
          domain,
          mode,
          selectedKey: options.settings.modelProviderFamilySelectedKeys?.[domain]?.trim() ?? ``,
        });
  });
}

/** 原 s6t（210060 / 166800）：迁移缺省 family selectedKey */
export async function migrateDefaultFamilySelectedKeys(options: { services: ServicesBundle }): Promise<string[]> {
  const settings = await options.services.settingService.get();
  const unusable = findUnusableFamilyDomains({ settings });
  if (unusable.length === 0) return [];
  const selectedKeys = { ...settings.modelProviderFamilySelectedKeys };
  for (const domain of unusable) {
    // 〔A1-R28〕型缝：zi canonical 返回 any（`t?.[e] ?? \`oauth\``）；旧 declare 面为 "apiKey" | "oauth"，bundle family-mode 值域仅二值（行依据：本行 + 下键表索引）。
    const mode = resolveProviderFamilyMode(domain, settings.modelProviderFamilyModes) as "apiKey" | "oauth";
    selectedKeys[domain] = FAMILY_DEFAULT_SELECTED_KEYS[domain][mode];
  }
  return (
    await options.services.settingService.update({ modelProviderFamilySelectedKeys: selectedKeys }),
    logger.info(`[Root] 已迁移默认 provider family selectedKey`, {
      domains: unusable,
      selectedKeys: Object.fromEntries(unusable.map((domain) => [domain, selectedKeys[domain]])),
    }),
    unusable
  );
}

/** 原 c6t（210078 / 166820）：取 BigModel 团队套餐列表（失败归空） */
export async function fetchBigModelTeamProducts(services: ServicesBundle, domain: string): Promise<TeamProduct[]> {
  if (domain !== `bigmodel`) return [];
  try {
    return (await services.codingPlanSubscriptionService.getEnterprisePricing({ authenticated: !0 }))
      .productList;
  } catch (error) {
    return (
      logger.warn(`[Root] 迁移 provider family selectedKey 时获取 BigModel 团队套餐失败`, { error }),
      []
    );
  }
}

/** 原 l6t（210090 / 166832）：BigModel 缺省 key 升级为 Team Plan */
export async function maybeUpgradeBigModelTeamPlan(options: { allowUpgrade: boolean; services: ServicesBundle }): Promise<boolean> {
  if (!options.allowUpgrade) return !1;
  const settings = await options.services.settingService.get();
  if (
    resolveProviderFamilyMode(`bigmodel`, settings.modelProviderFamilyModes) !== `oauth` ||
    (settings.modelProviderFamilySelectedKeys?.bigmodel?.trim() ?? ``) !== FAMILY_DEFAULT_SELECTED_KEYS.bigmodel.oauth
  )
    return !1;
  const products = await fetchBigModelTeamProducts(options.services, BIGMODEL_PROVIDER_ID);
  const teamKey = firstSubscribedTeamPlanKey({ codingPlanProviderId: providerIds.bigmodelCodingPlan, teamProducts: products });
  if (!teamKey) return !1;
  const latest = await options.services.settingService.get();
  return (latest.modelProviderFamilySelectedKeys?.bigmodel?.trim() ?? ``) === FAMILY_DEFAULT_SELECTED_KEYS.bigmodel.oauth
    ? (await options.services.settingService.update({
        modelProviderFamilySelectedKeys: { ...latest.modelProviderFamilySelectedKeys, [BIGMODEL_PROVIDER_ID]: teamKey },
      }),
      logger.info(`[Root] 已把 BigModel 默认 selectedKey 迁移为 Team Plan`, { selectedKey: teamKey }),
      !0)
    : !1;
}

/** 原 u6t（210110 / 166852）：迁移 + 条件升级合并 */
export async function migrateFamilySelectionWithUpgrade(options: { services: ServicesBundle; upgradeBigModelTeamPlan?: boolean }): Promise<string[]> {
  const migrated = await migrateDefaultFamilySelectedKeys(options);
  return (await maybeUpgradeBigModelTeamPlan({
    allowUpgrade: options.upgradeBigModelTeamPlan === !0 && migrated.includes(`bigmodel`),
    services: options.services,
  })) && !migrated.includes(`bigmodel`)
    ? [...migrated, BIGMODEL_PROVIDER_ID]
    : migrated;
}

/** 原 U9（210119 / 166859）：family → 计划 providerId 对 */
export function planProviderIdsForDomain(domain: string): string[] {
  return domain === `zai`
    ? [providerIds.zaiCodingPlan, providerIds.zaiStartPlan]
    : domain === `bigmodel`
      ? [providerIds.bigmodelCodingPlan, providerIds.bigmodelStartPlan]
      : [];
}

/** 原 d6t（210126 / 166862）：selectedKey → coding plan providerId */
export function codingPlanProviderFromKey(selectedKey: string): string | null {
  const trimmed = selectedKey.trim();
  return trimmed.startsWith(`coding-plan:`)
    ? trimmed.slice(12).trim() || null
    : trimmed.startsWith(`team-plan:${providerIds.bigmodelCodingPlan}:`)
      ? providerIds.bigmodelCodingPlan
      : null;
}

/** 原 W9（210134 / 166866）：权益快照刷新（失败归 null）
 *  〔A1-R27〕返回面型缝精化 Promise<unknown> → Promise<EntitlementSnapshot | null>（行依据：bundle W9 直返
 *  usageStatsService.getEntitlementSnapshot 结果（≡ UsageDeep@580 Promise<EntitlementSnapshot> 面），catch 归 null；
 *  消费面仅本文件 3650/3651/3683/3684 → resolveOAuthFamilySelection 型缝）。 */
export async function fetchEntitlementSnapshot(options: { services: ServicesBundle; providerId: string }): Promise<EntitlementSnapshot | null> {
  try {
    return await options.services.usageStatsService.getEntitlementSnapshot({
      includeSubscription: !0,
      preferredProviderId: options.providerId,
      allowDisabledPreferredProvider: !0,
      requirePreferredProvider: !0,
      allowEnvApiKey: !1,
    });
  } catch (error) {
    return (logger.warn(`[Root] 刷新登录后权益快照失败`, { providerId: options.providerId, error }), null);
  }
}

/** 原 f6t（210147 / 166882）：团队套餐列表结果（success/error 两态） */
export async function fetchTeamProductListResult(services: ServicesBundle, domain: string): Promise<{ status: string; productList?: TeamProduct[] }> {
  if (domain !== `bigmodel`) return { status: `success`, productList: [] };
  try {
    return {
      status: `success`,
      productList: (
        await services.codingPlanSubscriptionService.getEnterprisePricing({ authenticated: !0 })
      ).productList,
    };
  } catch (error) {
    return (logger.warn(`[Root] 刷新登录后 BigModel 团队套餐失败`, { error }), { status: `error` });
  }
}

/** 原 p6t（210160 / 166902）：团队套餐列表或空 */
export async function fetchTeamProductListOrEmpty(services: ServicesBundle, domain: string): Promise<TeamProduct[]> {
  const result = await fetchTeamProductListResult(services, domain);
  return result.status === `success` ? result.productList ?? [] : [];
}

/** 原 m6t（210164 / 166906）：team-plan key 三段齐备判定 */
export function isCompleteTeamPlanKey(selectedKey: string): boolean {
  const parsed = parseTeamPlanKey(selectedKey);
  return !!(parsed?.productId.trim() && parsed.organizationId?.trim() && parsed.projectId?.trim());
}

/** 原 h6t（210168 / 166910）：登录后刷新最新 family 选择并落盘 */
export async function refreshLatestFamilySelection(options: { provider: string; services: ServicesBundle }): Promise<{ mode: string; selectedKey: string } | null> {
  const domain = familyDomainOfProvider(options.provider);
  if (!domain) return null;
  const planProviderIds = planProviderIdsForDomain(options.provider);
  const codingPlanProviderId = planProviderIds[0];
  const startPlanProviderId = planProviderIds[1];
  if (!codingPlanProviderId || !startPlanProviderId) return null;
  const [modelProviders, codingPlanEntitlement, startPlanEntitlement, teamProducts] = await Promise.all([
      options.services.modelProviderService.getAllCached(),
      fetchEntitlementSnapshot({ services: options.services, providerId: codingPlanProviderId }),
      fetchEntitlementSnapshot({ services: options.services, providerId: startPlanProviderId }),
      fetchTeamProductListOrEmpty(options.services, domain),
    ]);
  const selection = resolveOAuthFamilySelection({
      providerFamilyDomain: domain,
      modelProviders,
      codingPlanEntitlement,
      startPlanEntitlement,
      teamProducts,
    });
  if (!selection) return null;
  const settings = await options.services.settingService.get();
  return (
    await options.services.settingService.update({
      modelProviderFamilyModes: { ...familyModesPatch(domain, settings.modelProviderFamilyModes), [domain]: selection.mode },
      modelProviderFamilySelectedKeys: { ...settings.modelProviderFamilySelectedKeys, [domain]: selection.selectedKey },
    }),
    selection
  );
}

/** 原 g6t（210198 / 166944）：刷新 family 选择（保留有效 Team Plan） */
export async function refreshFamilySelectionKeepTeamPlan(options: { provider: string; services: ServicesBundle }): Promise<{ mode: string; selectedKey: string } | null> {
  const domain = familyDomainOfProvider(options.provider);
  if (!domain) return null;
  const planProviderIds = planProviderIdsForDomain(options.provider);
  const codingPlanProviderId = planProviderIds[0];
  const startPlanProviderId = planProviderIds[1];
  if (!codingPlanProviderId || !startPlanProviderId) return null;
  const [settings, modelProviders, codingPlanEntitlement, startPlanEntitlement, teamResult] = await Promise.all([
      options.services.settingService.get(),
      options.services.modelProviderService.getAllCached(),
      fetchEntitlementSnapshot({ services: options.services, providerId: codingPlanProviderId }),
      fetchEntitlementSnapshot({ services: options.services, providerId: startPlanProviderId }),
      fetchTeamProductListResult(options.services, domain),
    ]);
  const teamProducts = teamResult.status === `success` ? teamResult.productList ?? [] : [];
  const currentKey = settings.modelProviderFamilySelectedKeys?.[domain]?.trim() ?? ``;
  if (
    domain === `bigmodel` &&
    ((teamResult.status === `success` &&
      isTeamPlanKeySubscribed({ selectedKey: currentKey, codingPlanProviderId: codingPlanProviderId, teamProducts })) ||
      (teamResult.status === `error` && isCompleteTeamPlanKey(currentKey)))
  )
    return { mode: `oauth`, selectedKey: currentKey };
  const selection = resolveOAuthFamilySelection({
    providerFamilyDomain: domain,
    modelProviders,
    codingPlanEntitlement,
    startPlanEntitlement,
    teamProducts,
  });
  return selection
    ? (await options.services.settingService.update({
        modelProviderFamilyModes: { ...familyModesPatch(domain, settings.modelProviderFamilyModes), [domain]: selection.mode },
        modelProviderFamilySelectedKeys: {
          ...settings.modelProviderFamilySelectedKeys,
          [domain]: selection.selectedKey,
        },
      }),
      selection)
    : null;
}

/** 原 _6t（210239 / 166986）：启动恢复后刷新 provider 全家桶 */
export async function refreshProvidersAfterStartupRestore(options: {
  activeProvider: string | null;
  services: ServicesBundle;
  refreshAppSettings?: () => Promise<void>;
}): Promise<{ mode: string; selectedKey: string } | null> {
  if (!options.activeProvider) return null;
  const planProviderIds = planProviderIdsForDomain(options.activeProvider);
  if (planProviderIds.length > 0) {
    const failures = (
      await Promise.allSettled(
        planProviderIds.map((providerId) => options.services.modelProviderService.refreshCodingPlanApiKey(providerId)),
      )
    ).filter((outcome) => outcome.status === `rejected`);
    failures.length > 0 &&
      logger.warn(`[Root] 启动恢复后刷新 Coding Plan 失败`, {
        provider: options.activeProvider,
        failures: failures.map((outcome) => ((outcome as PromiseRejectedResult).reason instanceof Error ? (outcome as PromiseRejectedResult).reason.message : String((outcome as PromiseRejectedResult).reason))),
      });
  }
  let selection: { mode: string; selectedKey: string } | null = null;
  try {
    selection = await refreshFamilySelectionKeepTeamPlan({ provider: options.activeProvider, services: options.services });
  } catch (error) {
    logger.warn(`[Root] 启动恢复后刷新 provider family selectedKey 失败`, {
      provider: options.activeProvider,
      error,
    });
  }
  const selectedKey = selection?.selectedKey ?? ``;
  if (selection && options.refreshAppSettings)
    try {
      await options.refreshAppSettings();
    } catch (error) {
      logger.warn(`[Root] 启动恢复后刷新 App settings 快照失败`, {
        provider: options.activeProvider,
        selectedKey,
        error,
      });
    }
  const codingPlanProviderId = selectedKey ? codingPlanProviderFromKey(selectedKey) : null;
  if (codingPlanProviderId)
    try {
      await options.services.modelProviderService.refreshCodingPlanApiKey(codingPlanProviderId);
    } catch (error) {
      logger.warn(`[Root] 启动恢复后按最终 selectedKey 刷新 Coding Plan 失败`, {
        provider: options.activeProvider,
        selectedKey,
        selectedProviderId: codingPlanProviderId,
        error,
      });
    }
  return selection;
}

/** 原 v6t（210288 / 167031）：应用本地会话恢复结果 */
export async function applyRestoredOAuthSession(options: {
  result: OAuthSessionRestoreResult;
  setUser: (user: UserInfo | null) => void;
  requestAlert: (copy: ConfirmDialogOptions) => Promise<void>;
  onReauthenticationRequired: () => void;
  copy: ConfirmDialogOptions;
}): Promise<boolean> {
  return options.result.status === `authenticated`
    ? (options.setUser(options.result.userInfo), !0)
    : (options.result.status === `reauthentication-required` &&
        (options.setUser(null), await options.requestAlert(options.copy), options.onReauthenticationRequired()),
      !1);
}

/** 原 y6t（210295 / 167034）：应用 OAuth 回调成功结果（family 刷新 + 遥测） */
export async function applyOAuthCallbackSuccess(options: {
  result: OAuthCallbackResult;
  url: string;
  platform: PlatformService;
  refreshCodingPlanApiKey: (providerId: string) => Promise<unknown>;
  refreshLatestModelProviderFamilySelection?: (provider: string) => Promise<{ mode: string; selectedKey: string } | null>;
  refreshAppSettings?: () => Promise<void>;
  refreshModelProviderSnapshot: (opts: { force: boolean; cachedOnly: boolean }) => Promise<void>;
  setProviderFamilyDomain: (domain: string) => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  setOAuthError: (error: string | null) => void;
}): Promise<void> {
  const telemetryProvider = resolveTelemetryProviderHost(options.result.provider); // 〔A1-R31〕bw 收敛改指（原 declare telemetryLoginProviderName，见 @850 墓碑）
  (options.setUser(options.result.userInfo),
    options.setOAuthError(null),
    await options.setProviderFamilyDomain(options.result.provider));
  const planProviderIds = planProviderIdsForDomain(options.result.provider);
  if (planProviderIds.length > 0) {
    const failures = (await Promise.allSettled(planProviderIds.map((providerId) => options.refreshCodingPlanApiKey(providerId)))).filter(
      (outcome) => outcome.status === `rejected`,
    );
    failures.length > 0 &&
      logger.warn(`[Root] OAuth 登录后刷新 Coding Plan 失败`, {
        provider: options.result.provider,
        failures: failures.map((outcome) => ((outcome as PromiseRejectedResult).reason instanceof Error ? (outcome as PromiseRejectedResult).reason.message : String((outcome as PromiseRejectedResult).reason))),
      });
  }
  if (options.refreshLatestModelProviderFamilySelection) {
    let selection: { mode: string; selectedKey: string } | null = null;
    try {
      selection = await options.refreshLatestModelProviderFamilySelection(options.result.provider);
    } catch (error) {
      logger.warn(`[Root] OAuth 登录后刷新 provider family selectedKey 失败`, {
        provider: options.result.provider,
        error,
      });
    }
    const selectedKey = selection?.selectedKey ?? ``;
    if (selection && options.refreshAppSettings)
      try {
        await options.refreshAppSettings();
      } catch (error) {
        logger.warn(`[Root] OAuth 登录后刷新 App settings 快照失败`, {
          provider: options.result.provider,
          selectedKey,
          error,
        });
      }
    const codingPlanProviderId = selectedKey ? codingPlanProviderFromKey(selectedKey) : null;
    if (codingPlanProviderId)
      try {
        await options.refreshCodingPlanApiKey(codingPlanProviderId);
      } catch (error) {
        logger.warn(`[Root] OAuth 登录后按最终 selectedKey 刷新 Coding Plan 失败`, {
          provider: options.result.provider,
          selectedKey,
          selectedProviderId: codingPlanProviderId,
          error,
        });
      }
  }
  (await options.refreshModelProviderSnapshot({ force: !0, cachedOnly: !0 }),
    telemetryProvider &&
      trackTelemetryEvent(
        options.platform,
        {
          elementName: `app_login_success`,
          eventRegion: `app_profile`,
          eventType: `view`,
          eventExtraDetail: { login_provider: telemetryProvider },
        },
        `Root`,
      ),
    logger.info(`[Root] OAuth 登录成功:`, options.result.userInfo.username));
}

/** 原 b6t（210359 / 167089）：useOAuthSessionBootstrap —— 启动恢复 + 回调订阅 */
export function useOAuthSessionBootstrap(options: {
  platform: PlatformService;
  services: ServicesBundle;
  refreshModelProviderSnapshot: (opts: { force: boolean }) => Promise<void>;
  refreshAppSettings?: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  setIsRestoringOAuthSession: (value: boolean) => void;
  setOAuthError: (error: string | null) => void;
  markOAuthSuccess: (provider: string) => void;
  onReauthenticationRequired: () => void;
}): void {
  const requestAlert = useAlertDialog();
  const { intl } = useIntlContext();
  (React.useEffect(() => {
    let cancelled = !1;
    async function restore() {
      logger.info(`[Root] 后台启动 OAuth 本地会话恢复`);
      let restored = !1;
      try {
        const result = await options.services.oauthService.restoreCachedSessionState();
        if (cancelled) return;
        restored = await applyRestoredOAuthSession({
          result,
          setUser: options.setUser,
          requestAlert,
          onReauthenticationRequired: options.onReauthenticationRequired,
          copy: {
            title: intl.formatMessage({ id: `login.expired.title` }),
            description: intl.formatMessage({ id: `login.expired.description` }),
            actionLabel: intl.formatMessage({ id: `login.expired.action` }),
          } as unknown as ConfirmDialogOptions,
        });
      } catch (error) {
        if ((logger.error(`[Root] 恢复 OAuth 本地登录态失败:`, error), cancelled)) return;
      }
      options.setIsRestoringOAuthSession(!1);
      let activeProvider: string | null = null;
      restored &&
        ((activeProvider = await options.services.oauthService.getActiveProvider()),
        await refreshProvidersAfterStartupRestore({ activeProvider, services: options.services, refreshAppSettings: options.refreshAppSettings }));
      try {
        (await migrateFamilySelectionWithUpgrade({ services: options.services, upgradeBigModelTeamPlan: restored })).length > 0 && options.refreshAppSettings && (await options.refreshAppSettings());
      } catch (error) {
        logger.warn(`[Root] 启动恢复后迁移 provider family selectedKey 失败`, {
          activeProvider,
          error,
        });
      }
      await options.refreshModelProviderSnapshot({ force: restored });
    }
    return (
      restore(),
      () => {
        cancelled = !0;
      }
    );
  }, [intl, options.onReauthenticationRequired, options.refreshAppSettings, options.refreshModelProviderSnapshot, requestAlert, options.services, options.setIsRestoringOAuthSession, options.setUser]),
    React.useEffect(() => {
      const unsubscribe = options.platform.onOAuthCallback(async (url: string) => {
        try {
          const result = await options.services.oauthService.handleCallback(url);
          if (result.kind === `attribution`) {
            logger.info(`[Root] OAuth 登录归因参数已缓存:`, result.provider);
            return;
          }
          (await applyOAuthCallbackSuccess({
            result,
            url,
            platform: options.platform,
            refreshCodingPlanApiKey: (providerId) => options.services.modelProviderService.refreshCodingPlanApiKey(providerId),
            refreshLatestModelProviderFamilySelection: (provider) => refreshLatestFamilySelection({ provider, services: options.services }),
            refreshAppSettings: options.refreshAppSettings,
            refreshModelProviderSnapshot: options.refreshModelProviderSnapshot,
            setProviderFamilyDomain: async (provider) => {
              const domain = familyDomainOfProvider(provider);
              domain && (await persistProviderFamilyDomain(options.services.settingService, domain));
            },
            setUser: options.setUser,
            setOAuthError: options.setOAuthError,
          }),
            options.markOAuthSuccess(result.provider));
        } catch (error) {
          (options.setOAuthError(LOGIN_FAILED_MESSAGE), logger.error(`[Root] OAuth 回调处理失败:`, error));
        }
      });
      return (
        options.platform.notifyRendererReady(),
        () => {
          unsubscribe();
        }
      );
    }, [options.platform, options.refreshAppSettings, options.refreshModelProviderSnapshot, options.services, options.markOAuthSuccess, options.setUser, options.setOAuthError]));
}

// =====================================================================
// §G 根桥接钩子（原 js 210452–210775）
// =====================================================================

/** 原 x6t（js 210452）— 逐字 */
export function useTitleBarThemeSync({
  enabled,
  isDesktop,
  platform,
  theme,
}: {
  enabled: boolean;
  isDesktop: boolean;
  platform: PlatformService;
  theme: string;
}) {
  (0, React.useEffect)(() => {
    if (!enabled || !isDesktop) return;
    let cancelled = false,
      resolvedTheme = theme === `system` ? `system` : resolveThemeForTitleBar(theme);
    return (
      platform.setTitleBarTheme(resolvedTheme).catch((error) => {
        cancelled || logger.error(`[Root] 同步标题栏主题失败`, { titleBarTheme: resolvedTheme, error });
      }),
      () => {
        cancelled = true;
      }
    );
  }, [enabled, isDesktop, platform, theme]);
}

/** 原 S6t（js 210467）— 逐字 */
export function buildWebRemoteControlWorkspaces({
  tabs,
  reconnectingRemoteWorkspaceKeys: reconnectingKeys = [],
  remoteWorkspaceErrorByWorkspaceKey: errorByWorkspaceKey = {},
}: {
  tabs: WorkspaceTab[];
  reconnectingRemoteWorkspaceKeys?: string[];
  remoteWorkspaceErrorByWorkspaceKey?: Record<string, string | undefined>;
}) {
  let reconnectingSet = new Set(reconnectingKeys);
  return tabs.filter(isWorkspaceKindTab).map((tab) => {
    let isRemote = !!(tab.workspaceIdentity || tab.remoteTarget || tab.remoteSessionId),
      workspaceKey = tab.workspaceIdentity?.trim() || tab.workspacePath,
      lastError = errorByWorkspaceKey[workspaceKey]?.trim();
    return {
      workspacePath: tab.workspacePath,
      label: tab.label,
      kind: isRemote ? `remote` : `local`,
      ...(isRemote
        ? {
            connectionState: reconnectingSet.has(workspaceKey)
              ? `reconnecting`
              : tab.remoteSessionId
                ? `connected`
                : `disconnected`,
          }
        : {}),
      ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}),
      ...(tab.workspacePurpose ? { workspacePurpose: tab.workspacePurpose } : {}),
      ...(tab.remoteSessionId ? { remoteSessionId: tab.remoteSessionId } : {}),
      ...(isRemote && lastError ? { lastConnectionError: lastError } : {}),
    };
  });
}

/** 原 C6t（js 210497）— 逐字 */
export function buildConnectedRemoteWorkspaces({ tabs }: { tabs: WorkspaceTab[] }) {
  return tabs
    .filter(isWorkspaceKindTab)
    .filter((tab) => tab.remoteSessionId && tab.workspaceIdentity)
    .map((tab) => ({
      workspacePath: tab.workspacePath,
      label: tab.label,
      kind: `remote`,
      connectionState: `connected`,
      workspaceIdentity: tab.workspaceIdentity,
      remoteSessionId: tab.remoteSessionId,
    }));
}

/** 原 w6t（js 210510）— 逐字（恒等直通，保留调用面） */
export function passThroughFlag(flag: boolean) {
  return flag;
}

/** 原 T6t（js 210513）— 逐字 */
export function useRootPlatformBridge({
  initialWorkspaceAbsPath,
  initialWorkspaceIdentity,
  initialWorkspacePurpose,
  initialTaskId,
  canBootstrapInitialWorkspace = true,
  addTab,
  setIsBootstrappingInitialWorkspace,
  platform,
  activateTabByPath,
  startDraftInWorkspace,
  startNewTaskFromActiveWorkspace,
  openWorkspace,
  openWorkspacePath,
  setWorkspaceActionError,
  allowOpenWorkspace = true,
  isDesktop,
  locale,
  tabs,
  reconnectingRemoteWorkspaceKeys: reconnectingKeys = [],
  remoteWorkspaceErrorByWorkspaceKey: errorByWorkspaceKey = {},
  totalUnreadTaskCount,
  webRemoteControlFeatureEnabled = false,
  webRemoteControlSessionActive = false,
  hasCompletedFullTabRestore = true,
  intl,
}: {
  initialWorkspaceAbsPath: string | null | undefined;
  initialWorkspaceIdentity: string | null | undefined;
  initialWorkspacePurpose: string | null | undefined;
  initialTaskId: string | null | undefined;
  canBootstrapInitialWorkspace?: boolean;
  addTab: (path: string, patch?: { workspaceIdentity?: string; workspacePurpose?: string }) => void;
  setIsBootstrappingInitialWorkspace: (value: boolean) => void;
  platform: PlatformService;
  activateTabByPath: (path: string, options?: { workspaceIdentity?: string }) => boolean;
  startDraftInWorkspace: (path: string, providerId?: string | null) => void;
  startNewTaskFromActiveWorkspace: (source: string) => void;
  openWorkspace: () => void;
  openWorkspacePath: (path: string) => void;
  setWorkspaceActionError: (error: string | null) => void;
  allowOpenWorkspace?: boolean;
  isDesktop: boolean;
  locale: string;
  tabs: WorkspaceTab[];
  reconnectingRemoteWorkspaceKeys?: string[];
  remoteWorkspaceErrorByWorkspaceKey?: Record<string, string | undefined>;
  totalUnreadTaskCount: number;
  webRemoteControlFeatureEnabled?: boolean;
  webRemoteControlSessionActive?: boolean;
  hasCompletedFullTabRestore?: boolean;
  intl: IntlShape;
}) {
  let didBootstrap = (0, React.useRef)(false);
  ((0, React.useEffect)(() => {
    !canBootstrapInitialWorkspace ||
      didBootstrap.current ||
      ((didBootstrap.current = true),
      initialWorkspaceAbsPath &&
        (addTab(
          initialWorkspaceAbsPath,
          initialWorkspaceIdentity || initialWorkspacePurpose
            ? {
                ...(initialWorkspaceIdentity ? { workspaceIdentity: initialWorkspaceIdentity } : {}),
                ...(initialWorkspacePurpose ? { workspacePurpose: initialWorkspacePurpose } : {}),
              }
            : void 0,
        ),
        initialTaskId
          ? taskStore.getState().setActiveTaskId(initialWorkspaceAbsPath, initialTaskId, initialWorkspaceIdentity)
          : isReloadNavigationEntry() || startDraftInWorkspace(initialWorkspaceAbsPath, initialWorkspaceIdentity)),
      setIsBootstrappingInitialWorkspace(false));
  }, [
    addTab,
    canBootstrapInitialWorkspace,
    initialTaskId,
    initialWorkspaceAbsPath,
    initialWorkspaceIdentity,
    initialWorkspacePurpose,
    setIsBootstrappingInitialWorkspace,
    startDraftInWorkspace,
  ]),
    (0, React.useEffect)(() => {
      let offFocusTab = platform.onFocusTab((path) => {
          (logger.info(`[Root] onFocusTab:`, path), activateTabByPath(path) && startDraftInWorkspace(path));
        }),
        offNewTab = platform.onNewTab(() => {
          (logger.info(`[Root] onNewTab`), setWorkspaceActionError(null), openWorkspace());
        }),
        offNewTask = platform.onNewTask(() => {
          startNewTaskFromActiveWorkspace(`onNewTask`);
        }),
        offOpenWorkspace = platform.onOpenWorkspace(() => {
          (logger.info(`[Root] onOpenWorkspace`), openWorkspace());
        }),
        offOpenWorkspacePath = platform.onOpenWorkspacePath
          ? platform.onOpenWorkspacePath((path) => {
              if (!allowOpenWorkspace) {
                logger.info(`[Root] 当前模式不支持通过 deep link 打开文件夹，已忽略请求`);
                return;
              }
              (logger.info(`[Root] onOpenWorkspacePath:`, path), openWorkspacePath(path));
            })
          : () => {},
        offTaskNotificationClick = platform.onTaskNotificationClick((taskId) => {
          logger.info(`[Root] onTaskNotificationClick:`, taskId);
          let workspaces = taskStore.getState().workspaces;
          for (let [workspaceKey, workspaceState] of Object.entries(workspaces)) {
            let cachedTask = workspaceState.taskListCache?.find((entry) => entry.taskId === taskId);
            if (workspaceState.activeTaskId === taskId || cachedTask) {
              let targetPath = cachedTask?.workspacePath ?? workspaceKey,
                targetIdentity = cachedTask?.workspaceIdentity;
              (activateTabByPath(targetPath, targetIdentity ? { workspaceIdentity: targetIdentity } : void 0),
                taskStore.getState().setActiveTaskId(targetPath, taskId, targetIdentity));
              return;
            }
          }
          logger.warn(`[Root] onTaskNotificationClick: task not found in any workspace:`, taskId);
        }),
        offUpdateCheckResult = platform.onUpdateCheckResult
          ? platform.onUpdateCheckResult((result) => {
              switch ((logger.info(`[Root] onUpdateCheckResult:`, result.kind), result.kind)) {
                case `up-to-date`:
                  toast(
                    intl.formatMessage({ id: `update.toast.upToDate` }, { version: result.currentVersion }),
                  );
                  return;
                case `downloading`:
                  toast(intl.formatMessage({ id: `update.toast.downloading` }, { version: result.version }));
                  return;
                case `available`:
                  toast(intl.formatMessage({ id: `update.toast.available` }, { version: result.version }));
                  return;
                case `already-downloading`:
                  toast(
                    intl.formatMessage(
                      { id: `update.toast.alreadyDownloading` },
                      { progress: result.progress },
                    ),
                  );
                  return;
                case `ready`:
                  toast(intl.formatMessage({ id: `update.toast.ready` }, { version: result.version }));
                  return;
                case `dev-skipped`:
                  toast(intl.formatMessage({ id: `update.toast.devSkipped` }));
                  return;
                case `error`:
                  toast(intl.formatMessage({ id: `update.toast.error` }, { error: result.message }));
                  return;
              }
            })
          : () => {};
      return () => {
        (offFocusTab(), offNewTab(), offNewTask(), offOpenWorkspace(), offOpenWorkspacePath(), offTaskNotificationClick(), offUpdateCheckResult());
      };
    }, []),
    (0, React.useEffect)(() => {
      if (!isDesktop || !passThroughFlag(hasCompletedFullTabRestore)) return;
      let localPaths = tabs
        .filter(isWorkspaceKindTab)
        .filter((tab) => !tab.remoteSessionId && !tab.workspaceIdentity && !tab.remoteTarget)
        .map((tab) => tab.workspacePath);
      platform.syncWindowTabs(localPaths);
    }, [hasCompletedFullTabRestore, isDesktop, platform, tabs]),
    (0, React.useEffect)(() => {
      if (!isDesktop || !passThroughFlag(hasCompletedFullTabRestore) || !platform.syncWebRemoteControlWorkspaces)
        return;
      let connected = buildConnectedRemoteWorkspaces({ tabs });
      if ((connected.length > 0 && platform.syncWebRemoteControlWorkspaces(connected), !webRemoteControlFeatureEnabled || !webRemoteControlSessionActive))
        return;
      let all = buildWebRemoteControlWorkspaces({
        tabs,
        reconnectingRemoteWorkspaceKeys: reconnectingKeys,
        remoteWorkspaceErrorByWorkspaceKey: errorByWorkspaceKey,
      });
      platform.syncWebRemoteControlWorkspaces(all);
    }, [hasCompletedFullTabRestore, isDesktop, platform, reconnectingKeys, errorByWorkspaceKey, tabs, webRemoteControlFeatureEnabled, webRemoteControlSessionActive]),
    (0, React.useEffect)(() => {
      if (isDesktop) return;
      function handleKeydown(event: KeyboardEvent) {
        let isNewTask = isKeyCombo(event, `n`),
          isOpenWorkspace = isKeyCombo(event, `o`);
        if (!(!isNewTask && !isOpenWorkspace)) {
          if ((event.preventDefault(), isOpenWorkspace)) {
            openWorkspace();
            return;
          }
          startNewTaskFromActiveWorkspace(`web CmdOrCtrl+N`);
        }
      }
      return (
        window.addEventListener(`keydown`, handleKeydown, true),
        () => {
          window.removeEventListener(`keydown`, handleKeydown, true);
        }
      );
    }, [isDesktop, openWorkspace, startNewTaskFromActiveWorkspace]),
    (0, React.useEffect)(() => {
      if (!isDesktop) return;
      let cancelled = false;
      return (
        platform.setApplicationLocale(locale).catch((error) => {
          cancelled || logger.error(`[Root] 同步应用菜单语言失败`, { locale, error });
        }),
        () => {
          cancelled = true;
        }
      );
    }, [isDesktop, locale, platform]),
    (0, React.useEffect)(() => {
      platform.syncWindowUnreadCount(totalUnreadTaskCount);
    }, [platform, totalUnreadTaskCount]));
}

/** 原 E6t（js 210684）— 逐字 */
export const WSL_UNC_PATH_REGEX =
  /^[\\/]{2}(?:wsl\.localhost|wsl\$)[\\/]([^\\/]+)(?:[\\/](.*))?$/iu;

/** 原 D6t（js 210685）— 逐字 */
export function parseWslUncPath(path: string) {
  let match = path.trim().match(WSL_UNC_PATH_REGEX),
    distro = match?.[1]?.trim();
  if (!match || !distro) return null;
  let linuxPath = (match[2] ?? ``).replaceAll(`\\`, `/`).replace(/^\/+/, ``);
  return { distro, linuxPath: linuxPath ? `/${linuxPath}` : `/`, originalPath: path };
}

/** 原 G9（js 210692）— 逐字 */
export async function openWorkspaceFolderEntry({
  selectDirectory,
  openDirectoryBrowser,
  preferDirectoryBrowser = false,
  onSelectProject,
}: {
  selectDirectory?: (() => Promise<string | null>) | null;
  openDirectoryBrowser?: (() => void) | null;
  preferDirectoryBrowser?: boolean;
  onSelectProject: (path: string) => void;
}) {
  if (preferDirectoryBrowser) {
    if (!openDirectoryBrowser) {
      logger.warn(`[openWorkspaceFolderEntry] directory browser preferred but unavailable`);
      return;
    }
    (logger.info(`[openWorkspaceFolderEntry] opening service directory browser...`), openDirectoryBrowser());
    return;
  }
  if (selectDirectory) {
    logger.info(`[openWorkspaceFolderEntry] calling selectDirectory...`);
    try {
      let selected = await selectDirectory();
      (logger.info(`[openWorkspaceFolderEntry] selectDirectory returned:`, selected),
        selected ? onSelectProject(selected) : logger.info(`[openWorkspaceFolderEntry] user cancelled or dir is null`));
    } catch (error) {
      logger.error(`[openWorkspaceFolderEntry] selectDirectory threw:`, error);
    }
  }
}

/** 原 O6t（js 210717）— 逐字 */
export function useConversationWorkspaceActions({
  services,
  addTab,
  setWorkspaceActionError,
}: {
  services: ServicesBundle;
  addTab: (path: string, patch?: { workspacePurpose?: string }) => void;
  setWorkspaceActionError: (error: string | null) => void;
}) {
  let handleSelectConversationWorkspace = (0, React.useCallback)(
      (path: string) => {
        (logger.info(`[Root] select conversation workspace`, { path }),
          addTab(path, { workspacePurpose: `conversation` }),
          setWorkspaceActionError(null));
      },
      [addTab, setWorkspaceActionError],
    ),
    handleResolveConversationWorkspace = (0, React.useCallback)(async () => {
      try {
        let workspace = await services.fileService.ensureConversationWorkspace();
        return (setWorkspaceActionError(null), workspace.path);
      } catch (error) {
        let message = error instanceof Error ? error.message : String(error);
        throw (logger.error(`[Root] ensure conversation workspace failed`, { error }), setWorkspaceActionError(message), error);
      }
    }, [services.fileService, setWorkspaceActionError]);
  return {
    handleSelectConversationWorkspace,
    handleResolveConversationWorkspace,
    handleEnsureConversationWorkspace: (0, React.useCallback)(async () => {
      let path = await handleResolveConversationWorkspace();
      return (handleSelectConversationWorkspace(path), path);
    }, [handleResolveConversationWorkspace, handleSelectConversationWorkspace]),
    handleCreateConversationTask: (0, React.useCallback)(async () => {
      try {
        let path = await handleResolveConversationWorkspace();
        (handleSelectConversationWorkspace(path),
          sessionRouterStore.getState().deactivateActiveGroup(),
          splitLayoutStore.getState().resetToPrimaryPane(),
          taskStore.getState().startDraft(path));
      } catch {}
    }, [handleResolveConversationWorkspace, handleSelectConversationWorkspace]),
  };
}

/** 原 k6t（js 210753）— 逐字 */
export function paneWorkspaceScopePatch(scope: PaneWorkspaceScope) {
  return {
    workspacePath: scope.workspacePath,
    ...(scope.workspaceIdentity?.trim() ? { workspaceIdentity: scope.workspaceIdentity } : {}),
  };
}

/** 原 A6t（js 210759）— 逐字 */
export function resolveActiveWorkspaceScope({
  activeWorkspacePath,
  activeWorkspaceIdentity,
  activeGroup,
  paneLayout,
}: {
  activeWorkspacePath: string | null;
  activeWorkspaceIdentity: string | null;
  activeGroup: SplitSessionRouterGroup | null; // A1-R2 型注：改指 SplitLayoutDeep 严格面（唯一调用方 AppRootLeaves 以 A2/s2 严格态流入）
  paneLayout: SplitPaneLayoutState; // A1-R2 型注：同上
}) {
  if (activeGroup) {
    let focusedPane = paneById(activeGroup, activeGroup.focusedPaneId);
    if (focusedPane) return paneWorkspaceScopePatch(focusedPane.workspaceScope);
  }
  let activePaneIdValue = focusedPaneId(paneLayout);
  if (activePaneIdValue !== `workspace-main`) {
    let pane = paneLayout.panes[activePaneIdValue];
    if (pane) return paneWorkspaceScopePatch(pane.workspaceScope);
  }
  return activeWorkspacePath
    ? { workspacePath: activeWorkspacePath, ...(activeWorkspaceIdentity?.trim() ? { workspaceIdentity: activeWorkspaceIdentity } : {}) }
    : null;
}

// =====================================================================
// §H bots 广播桥 / diffs worker / 启动件（原 js 211055–211668）
// =====================================================================

/** 原 M6t（js 211055）— 逐字 */
export const invalidUsageKeys = new Set<string>();

/** 原 N6t（js 211056）— 逐字 */
export function usageSanityKey(entry: { workspacePath: string; workspaceIdentity?: string | null; taskId: string }) {
  let key = entry.workspaceIdentity?.trim() || entry.workspacePath;
  return `${entry.workspacePath}::${key}::${entry.taskId}`;
}

/** 原 P6t（js 211060）— 逐字 */
export function recordInvalidUsage(entry: { workspacePath: string; workspaceIdentity?: string | null; taskId: string; used: number; size: number }) {
  !Number.isFinite(entry.used) ||
    entry.used <= 0 ||
    !Number.isFinite(entry.size) ||
    entry.size <= 0 ||
    invalidUsageKeys.add(usageSanityKey(entry));
}

/** 原 F6t（js 211067）— 逐字 */
export function isCompactSlashCommand(text: string | null | undefined) {
  let trimmed = text?.trim() ?? ``;
  return (
    trimmed === `/compact` || trimmed.startsWith(`/compact `) || trimmed === `/compress` || trimmed.startsWith(`/compress `)
  );
}

/** 原 I6t（js 211073）— 逐字 */
export function resolveIncomingUsage(options: {
  currentUsage: TaskUsage | null | undefined;
  incomingUsage: TaskUsage;
  latestUserPrompt?: string;
}) {
  let { currentUsage, incomingUsage, latestUserPrompt } = options,
    mergedUsage =
      !incomingUsage.breakdown && currentUsage?.breakdown && currentUsage.used === incomingUsage.used && currentUsage.size === incomingUsage.size
        ? { ...incomingUsage, breakdown: currentUsage.breakdown }
        : incomingUsage;
  return currentUsage &&
    Number.isFinite(currentUsage.used) &&
    currentUsage.used > 0 &&
    Number.isFinite(currentUsage.size) &&
    currentUsage.size > 0 &&
    (!Number.isFinite(incomingUsage.used) || incomingUsage.used <= 0) &&
    !isCompactSlashCommand(latestUserPrompt)
    ? currentUsage
    : mergedUsage;
}

/** 原 L6t（js 211089）— 逐字 */
export function isTaskBroadcastPayload(payload: unknown): payload is TaskBroadcastPayload {
  if (typeof payload != `object` || !payload) return false;
  let candidate = payload as TaskBroadcastPayload,
    knownEvents = new Set([
      `created`,
      `prompt_sent`,
      `resumed`,
      `streaming`,
      `permission_request`,
      `permission_resolved`,
      `elicitation_request`,
      `elicitation_resolved`,
      `updated`,
      `completed`,
      `error`,
    ]);
  return (
    typeof candidate.workspacePath == `string` &&
    typeof candidate.taskId == `string` &&
    typeof candidate.updatedAt == `number` &&
    (candidate.workspaceIdentity === void 0 || typeof candidate.workspaceIdentity == `string`) &&
    typeof candidate.event == `string` &&
    knownEvents.has(candidate.event) &&
    (candidate.task === void 0 ||
      (typeof candidate.task == `object` &&
        candidate.task !== null &&
        typeof candidate.task.taskId == `string` &&
        typeof candidate.task.workspacePath == `string`)) &&
    (candidate.provider === void 0 || typeof candidate.provider == `string`) &&
    (candidate.configOptions === void 0 || Array.isArray(candidate.configOptions)) &&
    (candidate.permissionRequest === void 0 ||
      (typeof candidate.permissionRequest == `object` && candidate.permissionRequest !== null)) &&
    (candidate.elicitationRequest === void 0 ||
      (typeof candidate.elicitationRequest == `object` && candidate.elicitationRequest !== null)) &&
    (candidate.prompt === void 0 ||
      (typeof candidate.prompt == `object` &&
        candidate.prompt !== null &&
        typeof candidate.prompt.content == `string` &&
        typeof candidate.prompt.messageId == `string` &&
        typeof candidate.prompt.sentAt == `number`)) &&
    (candidate.requestId === void 0 || typeof candidate.requestId == `string`) &&
    (candidate.error === void 0 || typeof candidate.error == `string`)
  );
}

/** 原 R6t（js 211133）— 逐字 */
export function matchTaskBroadcast(message: BroadcastMessage, tabs: WorkspaceTab[]) {
  if (message.channel !== `bots:task` || !isTaskBroadcastPayload(message.payload)) return null;
  let scopeKey = workspaceScopeKey(message.payload.workspacePath, message.payload.workspaceIdentity);
  return tabs.some((tab) => isWorkspaceKindTab(tab) && workspaceScopeKey(tab.workspacePath, tab.workspaceIdentity) === scopeKey)
    ? message.payload
    : null;
}

/** 原 z6t（js 211138）— 逐字 */
export function runtimeStateOfBroadcastEvent(event: string) {
  switch (event) {
    case `created`:
      return `creating`;
    case `completed`:
      return `completed`;
    case `error`:
      return `failed`;
    case `prompt_sent`:
    case `resumed`:
    case `streaming`:
    case `permission_request`:
    case `permission_resolved`:
    case `elicitation_request`:
    case `elicitation_resolved`:
      return `streaming`;
    case `updated`:
      return `ready`;
  }
}

/** 原 B6t（js 211158）— 逐字 */
export function isStreamEventBody(event: unknown): event is { type: string; taskId: string } {
  if (typeof event != `object` || !event) return false;
  let candidate = event as { type?: unknown; taskId?: unknown };
  return typeof candidate.type == `string` && typeof candidate.taskId == `string`;
}

/** 原 V6t（js 211163）— 逐字 */
export function isTaskStreamPayload(payload: unknown): payload is TaskStreamPayload {
  if (typeof payload != `object` || !payload) return false;
  let candidate = payload as TaskStreamPayload;
  return (
    typeof candidate.workspacePath == `string` &&
    typeof candidate.taskId == `string` &&
    typeof candidate.updatedAt == `number` &&
    (candidate.workspaceIdentity === void 0 || typeof candidate.workspaceIdentity == `string`) &&
    isStreamEventBody(candidate.event) &&
    candidate.event.taskId === candidate.taskId
  );
}

/** 原 H6t（js 211175）— 逐字 */
export function matchTaskStreamBroadcast(message: BroadcastMessage, tabs: WorkspaceTab[]) {
  if (message.channel !== `bots:task-stream` || !isTaskStreamPayload(message.payload)) return null;
  let scopeKey = workspaceScopeKey(message.payload.workspacePath, message.payload.workspaceIdentity);
  return tabs.some((tab) => isWorkspaceKindTab(tab) && workspaceScopeKey(tab.workspacePath, tab.workspaceIdentity) === scopeKey)
    ? message.payload
    : null;
}

/** 原 U6t（js 211180）— 逐字 */
export function storeBroadcastConfigOptions(options: {
  zcodeSessionStore: TaskStoreState;
  workspacePath: string;
  taskId: string;
  configOptions: unknown[];
  workspaceIdentity?: string | null;
}) {
  options.zcodeSessionStore.setTaskConfigOptions(
    options.workspacePath,
    options.taskId,
    options.configOptions,
    options.workspaceIdentity,
  );
}

/** 原 W6t（js 211188）— 逐字 */
export function shouldBumpTaskListVersion(event: string, hasTask: boolean) {
  return event === `created`
    ? true
    : hasTask
      ? false
      : event === `created` || event === `updated` || event === `completed` || event === `error`;
}

/** 原 G6t（js 211195）— 逐字 */
export function shouldApplyStreamBroadcast(entry: { activeTaskId: string | null; taskId: string; workspaceIdentity?: string | null }) {
  return entry.activeTaskId === entry.taskId ? !!entry.workspaceIdentity?.trim() : true;
}

/** 原 K6t（js 211198）— 逐字 */
export function useBotsTaskBroadcastBridge(
  services: ServicesBundle,
  tabStoreApi: { getState(): TabStoreState },
) {
  (0, React.useEffect)(() => {
    let subscription = services.broadcastService.onMessage((message) => {
      let streamPayload = matchTaskStreamBroadcast(message, tabStoreApi.getState().tabs);
      if (streamPayload) {
        let store = taskStore.getState();
        if (
          !shouldApplyStreamBroadcast({
            activeTaskId: store.getWorkspaceState(streamPayload.workspacePath, streamPayload.workspaceIdentity).activeTaskId,
            taskId: streamPayload.taskId,
            workspaceIdentity: streamPayload.workspaceIdentity,
          })
        )
          return;
        let event = streamPayload.event;
        switch (event.type) {
          case `agent_message_chunk`:
          case `agent_thought_chunk`:
          case `tool_call`:
            store.setTaskRuntimeState(
              streamPayload.workspacePath,
              streamPayload.taskId,
              `streaming`,
              void 0,
              streamPayload.workspaceIdentity,
            );
            break;
          case `permission_request`:
            (store.setTaskPermissionRequest(streamPayload.workspacePath, streamPayload.taskId, event, streamPayload.workspaceIdentity),
              store.setTaskRuntimeState(
                streamPayload.workspacePath,
                streamPayload.taskId,
                `streaming`,
                void 0,
                streamPayload.workspaceIdentity,
              ));
            break;
          case `task_complete`:
            (store.setTaskRuntimeState(
              streamPayload.workspacePath,
              streamPayload.taskId,
              `completed`,
              void 0,
              streamPayload.workspaceIdentity,
            ),
              store.setTaskPermissionRequest(streamPayload.workspacePath, streamPayload.taskId, null, streamPayload.workspaceIdentity),
              store.setTaskError(streamPayload.workspacePath, streamPayload.taskId, null, streamPayload.workspaceIdentity));
            break;
          case `task_error`: {
            let normalizedError = normalizeTaskBroadcastError(
              { message: event.error, detail: event.detail, code: event.code },
              { fallbackCode: event.code ?? `UNKNOWN`, traceId: event.traceId, taskId: event.taskId },
            );
            (store.setTaskRuntimeState(
              streamPayload.workspacePath,
              streamPayload.taskId,
              `failed`,
              normalizedError.message,
              streamPayload.workspaceIdentity,
            ),
              store.setTaskPermissionRequest(streamPayload.workspacePath, streamPayload.taskId, null, streamPayload.workspaceIdentity),
              store.setTaskError(streamPayload.workspacePath, streamPayload.taskId, normalizedError, streamPayload.workspaceIdentity));
            break;
          }
          case `task_warning`:
            store.setTaskError(
              streamPayload.workspacePath,
              streamPayload.taskId,
              normalizeTaskBroadcastError(
                { message: event.warning, detail: event.detail, code: event.code },
                { fallbackCode: event.code ?? `WARNING`, traceId: event.traceId, taskId: event.taskId },
              ),
              streamPayload.workspaceIdentity,
            );
            break;
          case `usage_update`:
            {
              let resolvedUsage = resolveIncomingUsage({
                currentUsage:
                  store.getWorkspaceState(streamPayload.workspacePath, streamPayload.workspaceIdentity).taskRuntimeByTaskId[
                    streamPayload.taskId
                  ]?.usage ?? null,
                incomingUsage: {
                  size: event.size,
                  used: event.used,
                  cost: event.cost,
                  ...(event.cache ? { cache: event.cache } : {}),
                  ...(event.breakdown ? { breakdown: event.breakdown } : {}),
                },
              });
              (recordInvalidUsage({
                workspacePath: streamPayload.workspacePath,
                workspaceIdentity: streamPayload.workspaceIdentity,
                taskId: streamPayload.taskId,
                size: event.size,
                used: event.used,
              }),
                store.setTaskContextWindow(streamPayload.workspacePath, streamPayload.taskId, event.size, streamPayload.workspaceIdentity),
                store.setTaskUsage(streamPayload.workspacePath, streamPayload.taskId, resolvedUsage, streamPayload.workspaceIdentity));
            }
            break;
          case `session_info_update`:
            event.apiRetry !== void 0 &&
              store.setTaskApiRetryStatus(
                streamPayload.workspacePath,
                streamPayload.taskId,
                event.apiRetry ?? null,
                streamPayload.workspaceIdentity,
              );
            break;
        }
        return;
      }
      let taskPayload = matchTaskBroadcast(message, tabStoreApi.getState().tabs);
      if (!taskPayload) return;
      let store = taskStore.getState(),
        workspaceState = store.getWorkspaceState(taskPayload.workspacePath, taskPayload.workspaceIdentity),
        provider = taskPayload.task?.provider ?? taskPayload.provider,
        isActiveTask = workspaceState.activeTaskId === taskPayload.taskId;
      if (
        (provider && isActiveTask && store.bindRuntimeProvider(taskPayload.workspacePath, provider, taskPayload.workspaceIdentity),
        taskPayload.configOptions &&
          storeBroadcastConfigOptions({
            zcodeSessionStore: store,
            workspacePath: taskPayload.workspacePath,
            workspaceIdentity: taskPayload.workspaceIdentity,
            taskId: taskPayload.taskId,
            configOptions: taskPayload.configOptions,
          }),
        store.setTaskRuntimeState(taskPayload.workspacePath, taskPayload.taskId, runtimeStateOfBroadcastEvent(taskPayload.event), void 0, taskPayload.workspaceIdentity),
        taskPayload.task)
      ) {
        let membership = { pinned: false, archived: false };
        taskPayload.event === `created`
          ? insertCreatedTaskFromBroadcast({
              workspacePath: taskPayload.workspacePath,
              workspaceIdentity: taskPayload.workspaceIdentity,
              task: taskPayload.task,
              membership,
            })
          : upsertTaskFromBroadcast({
              workspacePath: taskPayload.workspacePath,
              workspaceIdentity: taskPayload.workspaceIdentity,
              task: taskPayload.task,
              membership,
              ensureInWorkspaceTaskCache: true,
            });
      }
      (taskPayload.event === `permission_request` && taskPayload.permissionRequest
        ? store.setTaskPermissionRequest(
            taskPayload.workspacePath,
            taskPayload.taskId,
            taskPayload.permissionRequest,
            taskPayload.workspaceIdentity,
          )
        : taskPayload.event === `permission_resolved` && taskPayload.requestId
          ? store.removeTaskPermissionRequest(
              taskPayload.workspacePath,
              taskPayload.taskId,
              taskPayload.requestId,
              taskPayload.workspaceIdentity,
            )
          : taskPayload.event === `elicitation_request` && taskPayload.elicitationRequest
            ? store.setTaskElicitationRequest(
                taskPayload.workspacePath,
                taskPayload.taskId,
                taskPayload.elicitationRequest,
                taskPayload.workspaceIdentity,
              )
            : taskPayload.event === `elicitation_resolved` && taskPayload.requestId
              ? store.removeTaskElicitationRequest(
                  taskPayload.workspacePath,
                  taskPayload.taskId,
                  taskPayload.requestId,
                  taskPayload.workspaceIdentity,
                )
              : (taskPayload.event === `completed` || taskPayload.event === `error`) &&
                store.setTaskPermissionRequest(taskPayload.workspacePath, taskPayload.taskId, null, taskPayload.workspaceIdentity),
        shouldBumpTaskListVersion(taskPayload.event, !!taskPayload.task) && store.bumpTaskListVersion(taskPayload.workspacePath, taskPayload.workspaceIdentity));
    });
    return () => subscription.dispose();
  }, [services.broadcastService, tabStoreApi]);
}

/** 原 q6t（js 211381）— 逐字 */
export function createDiffsWorker() {
  return new Worker(
    new URL(`` + new URL(`diffs.worker-CAavpt0L.js`, import.meta.url).href, `` + import.meta.url),
    { type: `module`, name: `zcode-diffs-worker` },
  );
}

/** 原 J6t（js 211387）— 逐字 */
export function resolveDiffsPoolSize() {
  if (typeof navigator > `u`) return 2;
  let cores = navigator.hardwareConcurrency;
  return !Number.isFinite(cores) || cores <= 0 ? 2 : Math.max(1, Math.min(4, Math.floor(cores / 2)));
}

/** 原 Y6t（js 211392）— 逐字 */
export function DiffsPoolOptionsSync({ highlighterOptions }: { highlighterOptions: DiffsHighlighterOptions }) {
  let highlighter = useDiffsWorkerPool();
  return (
    (0, React.useEffect)(() => {
      highlighter &&
        highlighter
          .setRenderOptions({
            theme: highlighterOptions.theme,
            lineDiffType: highlighterOptions.lineDiffType,
            maxLineDiffLength: highlighterOptions.maxLineDiffLength,
            tokenizeMaxLineLength: highlighterOptions.tokenizeMaxLineLength,
            useTokenTransformer: highlighterOptions.useTokenTransformer,
          })
          .catch((error) => {
            logger.warn(`[DiffsWorkerPoolProvider] 同步渲染参数失败`, {
              error: error instanceof Error ? error.message : String(error),
            });
          });
    }, [highlighterOptions, highlighter]),
    null
  );
}

/** 原 X6t（js 211414）— 逐字（AppRootLeaves 消费：provider 树节点） */
export function DiffsWorkerPoolProvider({ children }: { children?: React.ReactNode }) {
  let codePreviewSettings = useSettingsStore((state) => state.codePreviewSettings ?? defaultCodePreviewSettings),
    highlighterOptions = (0, React.useMemo)(
      () => ({
        theme: { light: codePreviewSettings.lightTheme, dark: codePreviewSettings.darkTheme },
        lineDiffType: `word-alt`,
        maxLineDiffLength: 1e3,
        tokenizeMaxLineLength: 1e3,
        useTokenTransformer: false,
      }),
      [codePreviewSettings.darkTheme, codePreviewSettings.lightTheme],
    ),
    poolSize = (0, React.useMemo)(() => resolveDiffsPoolSize(), []);
  return typeof window < `u` && typeof Worker < `u` ? (
    <DiffsWorkerPoolProviderElement
      poolOptions={{ workerFactory: createDiffsWorker, poolSize }}
      highlighterOptions={highlighterOptions}
    >
      <DiffsPoolOptionsSync highlighterOptions={highlighterOptions} />
      {children}
    </DiffsWorkerPoolProviderElement>
  ) : (
    <>{children}</>
  );
}

/** 原 Z6t（js 211435）— 逐字 */
export function canSyncWebRemoteTasks({
  archivedLoading,
  enabled,
  pinnedLoading,
  timelineLoading,
}: {
  archivedLoading: boolean;
  enabled: boolean;
  pinnedLoading: boolean;
  timelineLoading: boolean;
}) {
  return !(!enabled || archivedLoading || pinnedLoading || timelineLoading);
}

/** 原 Q6t（js 211438）— 逐字 */
export function logDeferredWebRemoteSync(loggerLike: { debug(message: string, context?: unknown): void }, context: unknown) {
  loggerLike.debug(`[Root] 暂缓同步 Web 远控任务快照，等待任务列表加载完成`, context);
}

/** 原 $6t（js 211441）— 逐字（data-testid root-startup-loading） */
export function RootStartupLoading({ label }: { label: string }) {
  return (
    <div
      className={`flex h-full min-h-dvh items-center justify-center bg-background text-foreground`}
      role={`status`}
      aria-busy={`true`}
      aria-label={label}
      data-testid={`root-startup-loading`}
    >
      <div
        className={`relative flex size-24 items-center justify-center rounded-3xl bg-[linear-gradient(180deg,#000000_0%,#151718_100%)] text-[#ffffff] shadow-xl/20 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-[rgba(255,255,255,0.1)] before:content-['']`}
      >
        <StartupLogoSvg className={`h-auto w-14`} />
      </div>
    </div>
  );
}

/** 原 e8t（js 211454）— 逐字（REBRAND-013+113） */
export function StartupLogoSvg({ className }: { className?: string }) {
  return (
    <svg
      xmlns={`http://www.w3.org/2000/svg`}
      width={`118`}
      height={`100`}
      fill={`none`}
      viewBox={`0 0 256 218`}
      className={cn(`shrink-0 text-current`, className)}
      aria-hidden={`true`}
      focusable={`false`}
    >
      <animate
        attributeName={`opacity`}
        begin={`3s`}
        dur={`1.8s`}
        repeatCount={`indefinite`}
        values={`1;0.4;1`}
      />
      <path // REBRAND-013+113
        stroke={`currentColor`}
        strokeWidth={`40`}
        fill={`none`}
        d={`M78 187 L78 95 A50 50 0 0 1 178 95 L178 187`}
      />
    </svg>
  );
}

/** 原 t8t（js 211481）— 逐字 */
export function useProviderAvailabilityLoginGuard({
  enabled = true,
  user,
  isRestoringOAuthSession,
  providerFamilyDomain,
  modelProviders,
  modelProvidersHydrated,
  refreshModelProviderSnapshot,
  setLoginEntryOpen,
}: {
  enabled?: boolean;
  user: UserInfo | null;
  isRestoringOAuthSession: boolean;
  providerFamilyDomain: string | null | undefined;
  modelProviders: ModelProviderRecord[];
  modelProvidersHydrated: boolean;
  refreshModelProviderSnapshot: (options?: { force?: boolean }) => Promise<void>;
  setLoginEntryOpen: (open: boolean) => void;
}) {
  let [startupCheckCompleted, setStartupCheckCompleted] = (0, React.useState)(!enabled),
    didRun = (0, React.useRef)(false),
    syncLoginEntryWithProviderAvailability = (0, React.useCallback)(
      async (request: { reason: string; forceRefresh?: boolean }) => {
        if (!enabled) return { hasUsableProvider: true, providerCount: modelProviders.length, shouldOpenLoginEntry: false };
        request.forceRefresh && (await refreshModelProviderSnapshot({ force: true }));
        let providers = request.forceRefresh ? getModelProvidersCached() : modelProviders,
          usable = hasUsableProvider(providers),
          shouldOpenLoginEntry = !providerFamilyDomain || shouldForceLoginEntry({ providers, user });
        return (
          logger.info(`[Root] provider 可用性登录入口守卫完成检查`, {
            reason: request.reason,
            providerCount: providers.length,
            hasUsableProvider: usable,
            hasUser: !!user,
            hasProviderFamilyDomain: !!providerFamilyDomain,
            shouldOpenLoginEntry,
          }),
          setLoginEntryOpen(shouldOpenLoginEntry),
          { hasUsableProvider: usable, providerCount: providers.length, shouldOpenLoginEntry }
        );
      },
      [enabled, modelProviders, providerFamilyDomain, refreshModelProviderSnapshot, setLoginEntryOpen, user],
    );
  return (
    (0, React.useEffect)(() => {
      if (!enabled) {
        ((didRun.current = true), setStartupCheckCompleted(true));
        return;
      }
      didRun.current ||
        isRestoringOAuthSession ||
        !modelProvidersHydrated ||
        ((didRun.current = true),
        syncLoginEntryWithProviderAvailability({ reason: `startup` }).finally(() => {
          setStartupCheckCompleted(true);
        }));
    }, [enabled, isRestoringOAuthSession, modelProvidersHydrated, syncLoginEntryWithProviderAvailability]),
    { startupCheckCompleted, syncLoginEntryWithProviderAvailability }
  );
}

/** 原 n8t（js 211532）— 逐字 */
export function inferFamilyDomainFromCache(providers: ModelProviderRecord[]): "zai" | "bigmodel" | null {
  let domains = new Set<"zai" | "bigmodel">();
  for (let provider of providers) {
    let domain = familyDomainOfProviderId(provider.id);
    !domain || !isProviderEnabledForFamily(provider) || domains.add(domain);
  }
  return domains.size === 1 ? ([...domains][0] ?? null) : null;
}

/** 原 r8t（js 211540）— 逐字 */
export async function migrateProviderFamilyDomain(services: ServicesBundle) {
  let settings = await services.settingService.get();
  if (settings.providerFamilyDomain || settings.providerFamilyDomainMigrated) return;
  let inferredDomain = familyDomainOfProvider(await services.oauthService.getActiveProvider()),
    cachedProviders: ModelProviderRecord[] | null = null;
  if (!inferredDomain)
    try {
      ((cachedProviders = await services.modelProviderService.getAllCached()), (inferredDomain = inferFamilyDomainFromCache(cachedProviders)));
    } catch (error) {
      logger.warn(`[providerFamilyDomainMigration] 读取 provider 缓存失败`, { error });
    }
  if (!inferredDomain && cachedProviders?.length === 0) {
    logger.info(`[providerFamilyDomainMigration] provider family domain 迁移等待 provider 缓存恢复`);
    return;
  }
  (await services.settingService.update({
    ...(inferredDomain ? { providerFamilyDomain: inferredDomain } : {}),
    providerFamilyDomainUpdatedAt: Date.now(),
    providerFamilyDomainMigrated: true,
  }),
    logger.info(`[providerFamilyDomainMigration] provider family domain 迁移完成`, {
      inferredDomain,
    }));
}

/** 原 K9（js 211564）— 逐字（i8t 消费，语义属 F20 遥测对测域） */
export const TDP_SEED_DEFAULTS = {
  askMode: `build`,
  modelName: `glm-model`,
  modelProvider: `glm`,
  providerHostname: `api.example.com`,
};

/** 原 q9（js 211570）— 逐字 */
export function tdpNamespacedId(caseId: string, suffix: string) {
  return `${caseId.toLowerCase()}-${suffix}`;
}

/** 原 J9（js 211573）— 逐字 */
export function buildTdpTurnOperations(options: {
  caseId: string;
  scope?: string;
  sessionId?: string;
  commandId?: string;
  sendAt?: number;
  chunkAt?: number;
  terminalAt?: number;
  includeNetwork?: boolean;
}): Array<Record<string, unknown>> {
  let sessionId = options.sessionId ?? tdpNamespacedId(options.caseId, `session`),
    commandId = options.commandId ?? tdpNamespacedId(options.caseId, `command`),
    turnId = tdpNamespacedId(options.caseId, `turn`),
    sendAt = options.sendAt ?? 100,
    chunkAt = options.chunkAt ?? 200,
    terminalAt = options.terminalAt ?? 300,
    scope = options.scope;
  return [
    { kind: `foreground.attach`, sessionId, owner: tdpNamespacedId(options.caseId, `owner`), scope },
    { kind: `focus`, now: sendAt - 20, scope },
    { kind: `text`, now: sendAt - 10, value: `x`, scope },
    { kind: `seed`, sessionId, commandId, now: sendAt, ...TDP_SEED_DEFAULTS, scope },
    {
      kind: `turn.started`,
      now: sendAt + 5,
      eventId: tdpNamespacedId(options.caseId, `started`),
      sessionId,
      commandId,
      turnId,
      scope,
    },
    ...(options.includeNetwork === false
      ? []
      : [
          {
            kind: `model.status`,
            now: sendAt + 10,
            eventId: tdpNamespacedId(options.caseId, `request-started`),
            sessionId,
            commandId,
            turnId,
            requestId: tdpNamespacedId(options.caseId, `request`),
            status: `model_request_started`,
            providerId: `glm`,
            modelId: `glm-model`,
            providerHostname: `api.example.com`,
            scope,
          },
        ]),
    {
      kind: `chunk`,
      now: chunkAt,
      eventId: tdpNamespacedId(options.caseId, `chunk`),
      sessionId,
      commandId,
      turnId,
      channel: `text`,
      firstChunk: true,
      scope,
    },
    {
      kind: `usage`,
      now: terminalAt - 10,
      eventId: tdpNamespacedId(options.caseId, `usage`),
      sessionId,
      commandId,
      turnId,
      inputTokens: 10,
      outputTokens: 5,
      scope,
    },
    ...(options.includeNetwork === false
      ? []
      : [
          {
            kind: `model.status`,
            now: terminalAt - 5,
            eventId: tdpNamespacedId(options.caseId, `request-completed`),
            sessionId,
            commandId,
            turnId,
            requestId: tdpNamespacedId(options.caseId, `request`),
            status: `model_request_completed`,
            providerId: `glm`,
            modelId: `glm-model`,
            providerHostname: `api.example.com`,
            durationMs: terminalAt - sendAt - 15,
            scope,
          },
        ]),
    {
      kind: `terminal`,
      now: terminalAt,
      eventId: tdpNamespacedId(options.caseId, `terminal`),
      sessionId,
      commandId,
      turnId,
      status: `success`,
      scope,
    },
  ];
}

/** 原 Y9（js 211666）— 逐字 */
export function defineTelemetryParityCase(
  caseId: string,
  operations: unknown[],
  minimumReportInventory: Record<string, number>,
  minimumArmsInventory: Record<string, number>,
  proof: string[],
) {
  return { caseId, operations, minimumReportInventory, minimumArmsInventory, proof };
}

// =====================================================================
// §I 欢迎门 / 插件市场 store / 通知音（原 js 213554–213900）
// =====================================================================

/** 原 v8t（js 213554）— 逐字（F18 尾段；入口 chunk 消费） */
export function WelcomeGate({
  platform,
  initialLocale,
  onRequestClose,
}: {
  platform: PlatformService;
  initialLocale: string | null;
  onRequestClose: () => void;
}) {
  let [open, setOpen] = (0, React.useState)(true),
    [locale, setLocale] = (0, React.useState)(initialLocale),
    [updateState, setUpdateState] = (0, React.useState)<UpdateStateSnapshot | null>(null),
    [readyVersion, setReadyVersion] = (0, React.useState)<string | null>(null),
    updateStateSeq = (0, React.useRef)(0),
    handleOpenChange = (0, React.useCallback)(
      (nextOpen: boolean) => {
        (setOpen(nextOpen), nextOpen || onRequestClose());
      },
      [onRequestClose],
    );
  return (
    (0, React.useEffect)(() => {
      let disposers: Array<() => void> = [],
        bumpSeq = () => ((updateStateSeq.current += 1), updateStateSeq.current),
        initialSeq = updateStateSeq.current;
      return (
        platform.getUpdateState?.().then((state) => {
          updateStateSeq.current === initialSeq && setUpdateState(state);
        }),
        disposers.push(
          platform.onUpdateStateChanged?.((state) => {
            (bumpSeq(), setUpdateState(state));
          }) ?? (() => {}),
        ),
        disposers.push(
          platform.onUpdateReady((version) => {
            setReadyVersion(version);
          }),
        ),
        disposers.push(
          platform.onApplicationLocaleChanged?.((nextLocale) => {
            setLocale(nextLocale);
          }) ?? (() => {}),
        ),
        () => {
          for (let dispose of disposers) dispose();
        }
      );
    }, [platform]),
    (
      <div className={`min-h-screen bg-transparent text-foreground`}>
        <IntlProviderShell initialLocale={locale} key={locale}>
          <UpdateStatusWindow
            platform={platform}
            version={readyVersion}
            updateState={updateState}
            open={open}
            onOpenChange={handleOpenChange}
            edgeToEdge={true}
            showOverlay={false}
          />
          {/* A0-CLEANUP2 item 35：Modals.AppDialogHost children 已改可选（bundle P9 @styles 206992），{null} 垫片移除 */}
          <AppDialogHost />
        </IntlProviderShell>
      </div>
    )
  );
}

/** 原 Q9（js 213619）— 逐字 */
export function pluginInstallationKey(scope: string, pluginName: string, marketplace: string) {
  return `${scope}:${pluginName}@${marketplace}`;
}

/* 原 js 213621–213895：匿名 Ae(...) 裸创建（未赋值任何变量，死状态创建）。
 * 按逐字口径转录；Ae = 外部 skillStore chunk 之 zustand create。
 * 把握度：逐字（结构/字符串零改动，仅混淆参数名 e/t/n… → set/get/… 语义化）。 */
export interface PluginMarketplaceEntry {
  [key: string]: any;
}
export interface PluginEntry {
  [key: string]: any;
}
export interface PluginsServiceLike {
  getOverview(options: { workspacePath: string; workspaceIdentity?: string }): Promise<{
    marketplaces: PluginMarketplaceEntry[];
    availablePlugins: PluginEntry[];
    installedPlugins: PluginEntry[];
    capability: unknown;
  }>;
  addMarketplace(options: { workspacePath: string; workspaceIdentity?: string; source: string }): Promise<unknown>;
  removeMarketplace(options: { workspacePath: string; workspaceIdentity?: string; marketplace: string }): Promise<unknown>;
  updateMarketplace(options: { workspacePath: string; workspaceIdentity?: string; marketplace?: string }): Promise<{ diagnostics?: Array<{ severity: string; message: string }> } | null>;
  installPlugin(options: { workspacePath: string; workspaceIdentity?: string; pluginName: string; marketplace: string; scope: string }): Promise<unknown>;
  uninstallPlugin(options: { workspacePath: string; workspaceIdentity?: string; pluginName: string; marketplace: string; scope: string }): Promise<unknown>;
  setPluginEnabled(options: { workspacePath: string; workspaceIdentity?: string; pluginName: string; marketplace: string; scope: string; nativeScope?: string; enabled: boolean }): Promise<unknown>;
}
export interface PluginMarketplaceStoreState {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  loadedWorkspacePath: string | null;
  loadedWorkspaceIdentity: string | null;
  marketplaces: PluginMarketplaceEntry[];
  availablePlugins: PluginEntry[];
  installedPlugins: PluginEntry[];
  capability: unknown;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  addingMarketplaceSource: string | null;
  removingMarketplaceName: string | null;
  updatingMarketplaceName: string | null;
  installingPluginId: string | null;
  uninstallingPluginId: string | null;
  settingPluginEnabledId: string | null;
  settingPluginEnabledValue: boolean | null;
  resetWorkspaceContext(): void;
  initialize(workspacePath: string, pluginsService: PluginsServiceLike, workspaceIdentity?: string | null): Promise<void>;
  refresh(pluginsService: PluginsServiceLike, workspaceIdentity?: string | null): Promise<void>;
  addMarketplace(source: string, pluginsService: PluginsServiceLike, workspaceIdentity?: string | null): Promise<boolean>;
  removeMarketplace(marketplace: string, pluginsService: PluginsServiceLike, workspaceIdentity?: string | null): Promise<boolean>;
  updateMarketplace(marketplace: string | null, pluginsService: PluginsServiceLike, workspaceIdentity?: string | null): Promise<boolean>;
  installPlugin(pluginName: string, marketplace: string, scopeOrService: string | PluginsServiceLike, service?: PluginsServiceLike, workspaceIdentity?: string | null): Promise<boolean>;
  uninstallPlugin(pluginName: string, marketplace: string, scopeOrService: string | PluginsServiceLike, service?: PluginsServiceLike, workspaceIdentity?: string | null): Promise<boolean>;
  setPluginEnabled(pluginName: string, marketplace: string, scopeOrEnabled: string | boolean, enabledOrService: boolean | PluginsServiceLike, service?: PluginsServiceLike, workspaceIdentity?: string | null, nativeScope?: string): Promise<boolean>;
}
createExternalStore<PluginMarketplaceStoreState>((set, get) => ({
  workspacePath: null,
  workspaceIdentity: null,
  loadedWorkspacePath: null,
  loadedWorkspaceIdentity: null,
  marketplaces: [],
  availablePlugins: [],
  installedPlugins: [],
  capability: null,
  loading: false,
  refreshing: false,
  error: null,
  addingMarketplaceSource: null,
  removingMarketplaceName: null,
  updatingMarketplaceName: null,
  installingPluginId: null,
  uninstallingPluginId: null,
  settingPluginEnabledId: null,
  settingPluginEnabledValue: null,
  resetWorkspaceContext() {
    set({
      workspacePath: null,
      workspaceIdentity: null,
      loadedWorkspacePath: null,
      loadedWorkspaceIdentity: null,
      marketplaces: [],
      availablePlugins: [],
      installedPlugins: [],
      capability: null,
      loading: false,
      refreshing: false,
      error: null,
      addingMarketplaceSource: null,
      removingMarketplaceName: null,
      updatingMarketplaceName: null,
      installingPluginId: null,
      uninstallingPluginId: null,
      settingPluginEnabledId: null,
      settingPluginEnabledValue: null,
    });
  },
  async initialize(workspacePath, pluginsService, workspaceIdentity) {
    let currentState = get(),
      normalizedIdentity = workspaceIdentity?.trim() || null,
      isSameWorkspaceLoaded =
        currentState.loadedWorkspacePath === workspacePath &&
        currentState.loadedWorkspaceIdentity === normalizedIdentity &&
        (currentState.marketplaces.length > 0 ||
          currentState.availablePlugins.length > 0 ||
          currentState.installedPlugins.length > 0 ||
          currentState.capability !== null);
    set({
      workspacePath,
      workspaceIdentity: normalizedIdentity,
      marketplaces: isSameWorkspaceLoaded ? currentState.marketplaces : [],
      availablePlugins: isSameWorkspaceLoaded ? currentState.availablePlugins : [],
      installedPlugins: isSameWorkspaceLoaded ? currentState.installedPlugins : [],
      capability: isSameWorkspaceLoaded ? currentState.capability : null,
      loading: !isSameWorkspaceLoaded,
      refreshing: false,
      error: null,
    });
    try {
      let overview = await pluginsService.getOverview({ workspacePath, ...(normalizedIdentity ? { workspaceIdentity: normalizedIdentity } : {}) });
      set({
        marketplaces: overview.marketplaces,
        availablePlugins: overview.availablePlugins,
        installedPlugins: overview.installedPlugins,
        capability: overview.capability,
        loading: false,
        refreshing: false,
        loadedWorkspacePath: workspacePath,
        loadedWorkspaceIdentity: normalizedIdentity,
      });
    } catch (error) {
      set({
        loading: false,
        refreshing: false,
        error: error instanceof Error ? error.message : String(error),
        loadedWorkspacePath: workspacePath,
        loadedWorkspaceIdentity: normalizedIdentity,
      });
    }
  },
  async refresh(pluginsService, workspaceIdentity) {
    let currentWorkspacePath = get().workspacePath;
    if (!currentWorkspacePath) return;
    let normalizedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0,
      currentState = get();
    set({
      loading: !(
        currentState.marketplaces.length > 0 ||
        currentState.availablePlugins.length > 0 ||
        currentState.installedPlugins.length > 0
      ),
      refreshing: true,
      error: null,
    });
    try {
      let overview = await pluginsService.getOverview({ workspacePath: currentWorkspacePath, ...(normalizedIdentity ? { workspaceIdentity: normalizedIdentity } : {}) });
      set({
        marketplaces: overview.marketplaces,
        availablePlugins: overview.availablePlugins,
        installedPlugins: overview.installedPlugins,
        capability: overview.capability,
        loading: false,
        refreshing: false,
        loadedWorkspacePath: currentWorkspacePath,
        loadedWorkspaceIdentity: normalizedIdentity ?? null,
      });
    } catch (error) {
      set({
        loading: false,
        refreshing: false,
        error: error instanceof Error ? error.message : String(error),
        loadedWorkspacePath: currentWorkspacePath,
        loadedWorkspaceIdentity: normalizedIdentity ?? null,
      });
    }
  },
  async addMarketplace(source, pluginsService, workspaceIdentity) {
    let currentWorkspacePath = get().workspacePath,
      trimmedSource = source.trim();
    if (!currentWorkspacePath || !trimmedSource) return false;
    let normalizedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0;
    set({ error: null, addingMarketplaceSource: trimmedSource });
    try {
      return (
        await pluginsService.addMarketplace({
          workspacePath: currentWorkspacePath,
          ...(normalizedIdentity ? { workspaceIdentity: normalizedIdentity } : {}),
          source: trimmedSource,
        }),
        await get().refresh(pluginsService, normalizedIdentity),
        true
      );
    } catch (error) {
      return (set({ error: error instanceof Error ? error.message : String(error) }), false);
    } finally {
      set({ addingMarketplaceSource: null });
    }
  },
  async removeMarketplace(marketplace, pluginsService, workspaceIdentity) {
    let currentWorkspacePath = get().workspacePath;
    if (!currentWorkspacePath) return false;
    let normalizedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0;
    set({ error: null, removingMarketplaceName: marketplace });
    try {
      return (
        await pluginsService.removeMarketplace({
          workspacePath: currentWorkspacePath,
          ...(normalizedIdentity ? { workspaceIdentity: normalizedIdentity } : {}),
          marketplace,
        }),
        await get().refresh(pluginsService, normalizedIdentity),
        true
      );
    } catch (error) {
      return (set({ error: error instanceof Error ? error.message : String(error) }), false);
    } finally {
      set({ removingMarketplaceName: null });
    }
  },
  async updateMarketplace(marketplace, pluginsService, workspaceIdentity) {
    let currentWorkspacePath = get().workspacePath;
    if (!currentWorkspacePath) return false;
    let normalizedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0;
    set({ error: null, updatingMarketplaceName: marketplace ?? `__all__` });
    try {
      let result = await pluginsService.updateMarketplace({
        workspacePath: currentWorkspacePath,
        ...(normalizedIdentity ? { workspaceIdentity: normalizedIdentity } : {}),
        marketplace: marketplace || void 0,
      });
      await get().refresh(pluginsService, normalizedIdentity);
      let errorDiagnostic = result?.diagnostics?.find((diagnostic) => diagnostic.severity === `error`);
      return errorDiagnostic ? (set({ error: errorDiagnostic.message }), false) : true;
    } catch (error) {
      return (set({ error: error instanceof Error ? error.message : String(error) }), false);
    } finally {
      set({ updatingMarketplaceName: null });
    }
  },
  async installPlugin(pluginName, marketplace, scopeOrService, service, workspaceIdentity) {
    let currentWorkspacePath = get().workspacePath;
    if (!currentWorkspacePath) return (set({ error: `请先打开一个工作区后再安装插件` }), false);
    let normalizedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0,
      scope = typeof scopeOrService == `string` ? scopeOrService : `user`,
      pluginsService = typeof scopeOrService == `string` ? service : scopeOrService;
    if (!pluginsService) return (set({ error: `pluginsService is required` }), false);
    let installationKey = pluginInstallationKey(scope, pluginName, marketplace);
    (set({ error: null, installingPluginId: installationKey }),
      logger.info(`[Plugins] install start`, { pluginId: installationKey, workspacePath: currentWorkspacePath }));
    try {
      return (
        await pluginsService.installPlugin({
          workspacePath: currentWorkspacePath,
          ...(normalizedIdentity ? { workspaceIdentity: normalizedIdentity } : {}),
          pluginName,
          marketplace,
          scope,
        }),
        await get().refresh(pluginsService, normalizedIdentity),
        logger.info(`[Plugins] install success`, { pluginId: installationKey, workspacePath: currentWorkspacePath }),
        true
      );
    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      return (
        logger.error(`[Plugins] install failed`, { pluginId: installationKey, workspacePath: currentWorkspacePath, message }),
        set({ error: message }),
        false
      );
    } finally {
      set({ installingPluginId: null });
    }
  },
  async uninstallPlugin(pluginName, marketplace, scopeOrService, service, workspaceIdentity) {
    let currentWorkspacePath = get().workspacePath;
    if (!currentWorkspacePath) return (set({ error: `请先打开一个工作区后再卸载插件` }), false);
    let normalizedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0,
      scope = typeof scopeOrService == `string` ? scopeOrService : `user`,
      pluginsService = typeof scopeOrService == `string` ? service : scopeOrService;
    if (!pluginsService) return (set({ error: `pluginsService is required` }), false);
    set({ error: null, uninstallingPluginId: pluginInstallationKey(scope, pluginName, marketplace) });
    try {
      return (
        await pluginsService.uninstallPlugin({
          workspacePath: currentWorkspacePath,
          ...(normalizedIdentity ? { workspaceIdentity: normalizedIdentity } : {}),
          pluginName,
          marketplace,
          scope,
        }),
        await get().refresh(pluginsService, normalizedIdentity),
        true
      );
    } catch (error) {
      return (set({ error: error instanceof Error ? error.message : String(error) }), false);
    } finally {
      set({ uninstallingPluginId: null });
    }
  },
  async setPluginEnabled(pluginName, marketplace, scopeOrEnabled, enabledOrService, service, workspaceIdentity, nativeScope) {
    let currentWorkspacePath = get().workspacePath;
    if (!currentWorkspacePath) return (set({ error: `请先打开一个工作区后再修改插件状态` }), false);
    let normalizedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0,
      enabledIsFirstArg = typeof scopeOrEnabled == `boolean`,
      scope = enabledIsFirstArg ? `user` : (scopeOrEnabled as string),
      enabled = enabledIsFirstArg ? (scopeOrEnabled as boolean) : (enabledOrService as boolean),
      pluginsService = (enabledIsFirstArg ? enabledOrService : service) as PluginsServiceLike | undefined;
    if (!pluginsService) return (set({ error: `pluginsService is required` }), false);
    set({ error: null, settingPluginEnabledId: pluginInstallationKey(scope, pluginName, marketplace), settingPluginEnabledValue: enabled });
    try {
      return (
        await pluginsService.setPluginEnabled({
          workspacePath: currentWorkspacePath,
          ...(normalizedIdentity ? { workspaceIdentity: normalizedIdentity } : {}),
          pluginName,
          marketplace,
          scope,
          ...(nativeScope ? { nativeScope } : {}),
          enabled,
        }),
        await get().refresh(pluginsService, normalizedIdentity),
        true
      );
    } catch (error) {
      return (set({ error: error instanceof Error ? error.message : String(error) }), false);
    } finally {
      set({ settingPluginEnabledId: null, settingPluginEnabledValue: null });
    }
  },
}));

/** 原 y8t（js 213896）— 逐字 */
export const TASK_NOTIFICATION_SOUND_URL =
  `` + new URL(`task-notification-pop-qiQ1Ge3C.mp3`, import.meta.url).href;

/** 原 $9（js 213897）— 逐字 */
let sharedNotificationAudio: HTMLAudioElement | null = null;

/** 原 b8t（js 213898）— 逐字 */
export function getNotificationAudio() {
  return typeof Audio > `u` ? null : (sharedNotificationAudio || ((sharedNotificationAudio = new Audio(TASK_NOTIFICATION_SOUND_URL)), (sharedNotificationAudio.preload = `auto`)), sharedNotificationAudio);
}

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → 现行 out js 行 / jsx 行；F18 余量）
 * ============================================================================
 *  登录/OAuth：c4t 205995/163717 | l4t 205996/163718 | M9 206077/163794
 *   u4t 206080/163797 | d4t 206083/163800 | f4t 206086/163803 | p4t 206089/163809
 *   m4t 206096/163816 | h4t 206099/163819 | g4t 206102/163822 | _4t 206105/163831
 *   v4t 206109/163835 | y4t 206113/163839 | b4t 206116/163845
 *  登录视图：w4t 206410/164049 | T4t 206425/164054 | E4t 206428/164057
 *   D4t 206431/164060 | O4t 206685/164194 | k4t 206704/164201 | A4t 206712/164206
 *   j4t 206722/164216 | M4t 206732/164226 | N4t 206742/164237 | P4t 206752/164247
 *   F4t 206755/164250
 *  启动门控：I4t 206758/164257 | L4t 206761/164260 | R4t 206769/164270
 *   z4t 206782/164282（OFFLINE-PATCH-001）| B4t 206787/164285 | V4t 206790/164288
 *   H4t 206793/164291 | U4t 206798/164294 | W4t 206801/164297
 *  根组合叶：J4t 206998/164401 | Y4t 207063（memo XJt）| X4t 207064/164453
 *   Z4t 207205/164518 | Q4t 207208/164521
 *  恢复/重连：D3t 208827/165632 | O3t 208830/165635 | k3t 208839/165647
 *   A3t 208929/165733 | j3t 208932/165736 | M3t 208947/165752 | N3t 208950/165755
 *   P3t 208963/165766 | F3t 208964/165767 | I3t 209023/165826 | B9 209132/165927
 *   L3t 209135/165930 | R3t 209139/165934 | z3t 209149/165942 | B3t 209161/165959
 *   V3t 209164/165962 | H3t 209169/165965 | U3t 209181/165977 | W3t 209189/165985
 *   G3t 209247/166047 | K3t 209258/166051 | q3t 209275/166067 | J3t 209333/166137
 *   Y3t 209393/166201 | X3t 209851/166613 | Z3t 209865/166625 | Q3t 209916/166671
 *  family 迁移：e6t 209943/166688 | V9 209946/166691 | t6t 209949/166694
 *   n6t 209956/166701 | r6t 209984/166723 | i6t 210020/166747 | H9 210036/166772
 *   a6t 210040/166782 | o6t 210048/166790 | s6t 210060/166800 | c6t 210078/166820
 *   l6t 210090/166832 | u6t 210110/166852 | U9 210119/166859 | d6t 210126/166862
 *   W9 210134/166866 | f6t 210147/166882 | p6t 210160/166902 | m6t 210164/166906
 *   h6t 210168/166910 | g6t 210198/166944 | _6t 210239/166986 | v6t 210288/167031
 *   y6t 210295/167034 | b6t 210359/167089
 *  根桥接：x6t 210452/167192 | S6t 210467/167212 | C6t 210497/167244
 *   w6t 210510/167256 | T6t 210513/167259 | E6t 210684/167433 | D6t 210685/167434
 *   G9 210692/167445 | O6t 210717/167469 | k6t 210753/167507 | A6t 210759/167515
 *  bots/启动件：M6t 211055/167798 | N6t 211056/167799 | P6t 211060/167803
 *   F6t 211067/167806 | I6t 211073/167810 | L6t 211089/167822 | R6t 211133/167828
 *   z6t 211138/167833 | B6t 211158/167853 | V6t 211163/167858 | H6t 211175/167863
 *   U6t 211180/167868 | W6t 211188/167871 | G6t 211195/167874 | K6t 211198/167877
 *   q6t 211381/167992 | J6t 211387/167998 | Y6t 211392/168003 | X6t 211414/168021
 *   Z6t 211435/168041 | Q6t 211438/168049 | $6t 211441/168052 | e8t 211454/168059
 *   t8t 211481/168064 | n8t 211532/168119 | r8t 211540/168127 | K9 211564/168153
 *   q9 211570/168159 | J9 211573/168162 | Y9 211666/168257
 *  欢迎门/尾段：v8t 213554/170001 | Q9 213619/170031 | （匿名 Ae store）213621–213895/170035
 *   y8t 213896/170364 | $9 213897 | b8t 213898/170366
 *  A1-R11 DM 簇（域外携入）：Cw 40570 | bM 52799 | xM 52806 | SM 52809 | CM 52813
 *   wM 52822 | TM 52829 | IUe 52853 | EM 52877 | DM 52886
 *  排除（只注记）：s4t 205975–205994 | x4t/S4t/C4t 206344–206409
 *   m3t 207780–207806 | $4t…E3t 207217–208826 | N9/G4t/K4t/q4t/P9/$3t | j6t 210776–211054（→AppRootLeaves）
 * ============================================================================
 */
