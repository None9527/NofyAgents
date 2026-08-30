/* eslint-disable */
/**
 * ============================================================================
 * AppRootLeaves.tsx — F20 Bootstrap/AppRoot 族余量逐字重建（B5-02 批次）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本工作区现行 213,979 行，只读未改动）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，170,400 行）：
 *   desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 解码范围（行号互斥口径，本文件 = F20 余量 + j6t）：
 *   js 211385–213269 + 213617–213695（计划口径/原始文件行号）
 *   ≈ 本工作区现行 out 文件 js 211669–213553 + 213901–213979，
 *     另含 j6t（现行 210776–211054，行段在 F18 范围内但按任务指派归 F20）
 *   （本工作区 out 文件较原始文件存在分段行漂移：i8t 起 +284；
 *     详见 OnboardingAppRootLeaves.report.md §0。本文件行号一律以现行
 *     out 文件为准，便于直接回代核验。）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：现行 out js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 * [J] 工作区动作钩子（行段属 F18，指派归 F20）：
 *   j6t → useWorkspaceActions             (210776 / 167537)
 * [K] 遥测对测（TDP）域：
 *   i8t → buildTelemetryParityCases       (211669 / 168266)  TDP01–19
 *   a8t → TELEMETRY_PARITY_CASES          (212448 / —)       Map(caseId → case)
 *   （裸语句）→ [...a8t.keys()];           (212449 / —)       逐字保留
 *   o8t → telemetryParityCaseById         (212450 / 168803)
 *   s8t → quotaParityAssertions           (212455 / 168808)
 *   c8t → captchaParityAssertions         (212490 / 168843)
 *   X9  → assertParityState               (212520 / 168873)
 *   l8t → exposeTelemetryParityE2E        (212523 / 168876)
 *   u8t → runTelemetryParityCase          (212534 / 168887)
 *   d8t → applyTelemetryParityOperation   (212580 / 168933)
 *   f8t → runTelemetryParityWebNoop       (212775 / 169128)
 *   p8t → pushUniqueParityAssertion       (212803 / 169156)
 *   Z9  → buildParityEventFact            (212806 / 169159)
 * [L] 远控任务同步桥 / 图标常量：
 *   m8t → APP_ROOT_ICON_STROKE_WIDTH      (212817 / —)       = 1.5
 *   h8t → WebRemoteControlTaskSyncBridge  (212818 / 169171)
 * [M] App 根 provider 树：
 *   g8t → ZCodeApp                        (212878 / 169433)
 * [N] App 根内容：
 *   _8t → AppRootContent                  (212905 / 169450)  ★OFFLINE-PATCH-002
 * [O] 启动音 / 遥测尾件：
 *   x8t → playStartupSound                (213901 / 170369)
 *   S8t → ARMS_E2E_EVENT_LIMIT            (213909 / —)       = 200
 *   C8t → recordArmsCustomEventE2E        (213910 / 170378)
 *   w8t → rendererInstanceId              (213921 / —)       模块级 null
 *   T8t → setRendererInstanceId           (213922 / 170390)
 * [P] 文件尾 export 块（213930–213979）→ 逐字注释转录于文件尾
 *   （34+ 别名指向外部 chunk 符号；对照 rendererEntry.tsx 行 710–728）
 *
 * ----------------------------------------------------------------------------
 * 二、边界裁决（范围内已抽取段 / 跨文件交接，只注记不转录）
 * ----------------------------------------------------------------------------
 *  1. K9/q9/J9/Y9（现行 211564–211668）行段属 F18 → 已在 OnboardingLoginLeaves.tsx，
 *     本文件经 import 消费。
 *  2. q6t…r8t、$6t、e8t、t8t、n8t、X6t、Z6t、Q6t、x6t、T6t、b6t、Y3t、Z3t、Q3t、
 *     门控谓词（I4t…W4t）、R4t、w4t、J4t、X4t、Q4t、O6t、D6t、G9、A6t、k6t 等
 *     → 已在 OnboardingLoginLeaves.tsx，本文件经 import 消费。
 *  3. v8t/Q9/匿名插件市场 store/y8t/$9/b8t（现行 213554–213900）行段属 F18
 *     → 已在 OnboardingLoginLeaves.tsx（x8t 经 import 消费 getNotificationAudio）。
 *  4. 入口 chunk index-ABImDspU.js（消费 export 块 A…z 别名）→ 已在 rendererEntry.tsx。
 *  5. E3t OnboardingDialog、pOt RemoteConnectionDialog、MEt DirectoryBrowserDialog、
 *     j9 SettingsView、P9 AppDialogHost、p4 ScopeBoundary 等组件属各家族批次，
 *     本文件仅以 declare 声明消费面（接口级）。
 * ============================================================================
 */

import * as React from "react";
import {
  useConversationWorkspaceActions,
  parseWslUncPath,
  openWorkspaceFolderEntry,
  resolveActiveWorkspaceScope,
  TDP_SEED_DEFAULTS,
  buildTdpTurnOperations,
  defineTelemetryParityCase,
  canSyncWebRemoteTasks,
  logDeferredWebRemoteSync,
  useBotsTaskBroadcastBridge,
  useTitleBarThemeSync,
  useRootPlatformBridge,
  RootStartupLoading,
  useProviderAvailabilityLoginGuard,
  migrateProviderFamilyDomain,
  DiffsWorkerPoolProvider,
  shouldReportLaunchMarks,
  readRendererLaunchMarks,
  countTotalUnreadTasks,
  isResolvingStartupAuthState,
  isStartupRenderBlocked,
  isProviderAvailabilityGateEnabled,
  isProviderStartupSyncPending,
  needsFallbackWorkspaceBootstrap,
  isProviderStartupHydrationPending,
  useRemoteWorkspaceOrchestrator,
  useRemoteTabSessionDisposal,
  useModelProviderSnapshotRefresher,
  useOAuthSessionBootstrap,
  LoginEntryScreen,
  getNotificationAudio,
  RootWorkspaceContent,
  resolveActiveWorkspaceShellProps,
} from "./OnboardingLoginLeaves";
import type {
  IntlShape,
  UpdateStateSnapshot,
  PlatformService,
  FileServiceLike,
  SettingServiceLike,
  AppSettings,
  OAuthServiceLike,
  ModelProviderRecord,
  ModelProviderServiceLike,
  BroadcastMessage,
  ServicesBundle,
  WorkspaceTab,
  TabStoreState,
  WorkspaceTaskState,
  TaskStoreState,
  UserInfo,
  LoginEntryRequest,
} from "./OnboardingLoginLeaves";
import { CaptchaHostContainer, injectArmsReporter as setArmsReportPlatform, buildCaptchaAssertionKeys, captchaAssertionStatus, createCaptchaGatekeeper, isCaptchaDecisionHandled, recordCaptchaFailure, type CaptchaGatekeeper } from './ConversationLeaves'; // +setArmsReportPlatform（A1-R10 项 1c：原 BSt@118240 = y0 置入；canonical = ConversationLeaves injectArmsReporter（RSt/zSt/BSt/VSt/HSt 簇 999–1031 逐字在案；HSt 消费面 118420 = uCt 验证完成簇已接线 1187）；既有边）+A1-R14：ACt/A0/kCt/j0/M0/CaptchaGatekeeper 六 declare 改指（§5b 实体，c8t 消费）
import { setMcpSyncServiceHandle as setTelemetryReportPlatform } from '../stores/mcpStore'; // A1-R10 项 1c：原 b_e@25049 = Hg 置入；canonical = mcpStore setMcpSyncServiceHandle（Hg/mcpSyncServiceHandle 143–149 逐字；Lg=persistMcpChange 225 消费在案）。根装配 212931 以 platform 兼 MCP 同步句柄。环安全：mcpStore 值闭包 = logger/modules-services/zustand，不达本文件（全树无本文件 import 源）
import { PlatformProvider } from './ImeComposition';
import { AppDialogHost, DirectoryBrowserDialog, OnboardingDialog, type BaseServices } from './Modals'; // +type BaseServices（A0-CLEANUP2 item 16：DirectoryBrowserDialog services 断言改具名型）
import { CodingPlanUpgradeDialogProvider } from './PaymentDeep'; // 原 krt（89089；A0-CLEANUP B-30 接线）
import { SettingsView } from './Settings';
import { useTaskStore, type GroupedDraftPlacement } from './SkillStore';
import { t as logger } from './logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { ConversationTelemetrySupervisor, useWorkspaceServices } from './services';
import { useSettingsStore, SettingsStoreProvider as StoreProvider, isStartupSoundEnabled } from './stores-core'; // +StoreProvider/isStartupSoundEnabled（A1-R10 项 2a：原 Nie（1289）/Eie（1091）declare 改指 canonical——SettingsStoreProvider = settingsStore 373 逐字（Oo context/Nie/ko/Ao 1287–1298），isStartupSoundEnabled = yo&&bo 1085–1091；调用点 1893/2604 逐字不变）。环安全：stores-core 值闭包（stores/* + zustand）不达本文件反向，既有边
import { useCodeCommentsStore as codeCommentsStore } from './Composer'; // A1-R8：FH 双实例收敛接线（原 declare 改指 canonical = Composer 6716 区；本文件 2009/2014 消费面 = bundle 212998/213003 广播监听簇）
import { TooltipProvider } from './UsageStatsUiParts'; // 原 Na（A0-CLEANUP 族清理接线）
import { CLOSE_ACTIVE_CONTEXT_EVENT } from './WorkspaceShell'; // 原 r7（A0-CLEANUP B-32 接线）
import { hasUnavailableLocalDirectoryTab, isSettingsTab, isWorkspaceKindTab } from './WorkspaceTabsDeep'; // 原 sc/Pse/oc（A1-R1：styles js 4493/4497/4487 逐字重建改指）
import { EMPTY_PANE_LAYOUT, hasSplitLayoutBindings, isReloadNavigationEntry, sessionRouterStore, splitLayoutStore } from './SplitLayoutDeep'; // 原 K0/jwt/z0/A2/s2（A1-R2：styles js 121301–123510 面板布局引擎逐字重建改指）
import type { AgentFact, TelemetryPlatform } from './services';
import { reportTelemetry as trackTelemetryEvent, reportLaunchToInputPerf as reportLaunchMarks, setUiPerfPlatform as setTelemetryPlatform, clearAllTelemetryTiming as resetTelemetryParityState } from './StoresDeep'; // A1-R9 条件项：platform/遥测引擎族别名改指——原 xw（bundle 40457；StoresDeep H.1 reportTelemetry 逐字）/原 YPe（ui_perf 域 reportLaunchToInputPerf）/原 iT（ui_perf 域 setUiPerfPlatform）/原 TPe（tracker 域 clearAllTelemetryTiming）；调用点 422/1708/2280/1745/1751/1941/1943/1470 逐字不变（PlatformService→TelemetryPlatform 方法双变可赋；launchMarks.marks { createdAt; [key:string]: any }→marks 具形索引可赋）
import { isE2EStoreBridgeEnabled as isTelemetryEnabled } from './SkillStore'; // A1-R9 条件项：原 re = skillStore chunk 之 K 导出（bundle styles 382 `K as re`；消费点 l8t 212526/C8t 213911/uNe 40331 实测），canonical = stores/e2eStoreBridge isE2EStoreBridgeEnabled（原 v jsx 50 逐字）；同型先例 FeedbackCenter isE2eStoreBridgeMode 别名
import { disposeAllSupervisors as disposeStartupServiceRegistry } from './services'; // A1-R9 条件项：原 vFe（bundle 42698）= services/telemetryScopes E.1 disposeAllSupervisors（vT 注册表逐项 xT）；调用点 1951 逐字不变
import { listCodingPlanSources as getModelProvidersCached, hasLoadedCodingPlanSources as isModelProviderSnapshotHydrated, subscribeCodingPlanSources as subscribeModelProviders, useAppSettings, type AppRuntimeSettingsPatch, type ModelProvider } from './UsageDeep'; // A1-R11：fM（52681）/pM（52684）/hM（52695）/JM（53488）改指 canonical（components/usage/UsageDeep.tsx 注册表 + §2c）。双实例收敛证据：bundle 各唯一真身；终端消费实测 1992/1996/1997/2065–2069。注册表返回 ModelProvider[]（fetcher 证据 78266/78272/206174/209921）；环安全：UsageDeep 值闭包不达本文件
/* ── tombstone（A0-CLEANUP）：CodingPlanUpgradeDialogProvider（PaymentDeep krt）/
 *    CLOSE_ACTIVE_CONTEXT_EVENT（WorkspaceShell r7）declare 已删除，改经文件头
 *    真实 import 消费。 ── */

/* ============================================================================
 * §0. 外部依赖声明（接口级；均为本范围外的其它 chunk / 家族符号）
 * ==========================================================================*/


declare function useIntlContext(): { intl: IntlShape; locale: string };

/* --- 平台桥 --- */
declare const DESKTOP_COMMANDS: { RelaunchApp: string; CloseWindow: string; [key: string]: string };

/* --- stores（模块级句柄）--- */
declare function useTabStoreSelector<T>(selector: (state: TabStoreState) => T): T; // 原 pc
declare function useTabStoreApi(): { getState(): TabStoreState; setState(mutator: (state: TabStoreState) => Partial<TabStoreState>): void }; // 原 hc
/* ── tombstone（A1-R1）：isWorkspaceKindTab（原 oc js 4487）/hasUnavailableLocalDirectoryTab（原 sc js 4493）declare 已删除，改经文件头真实 import（./WorkspaceTabsDeep）消费。 ── */
/* ── tombstone（A1-R2）：sessionRouterStore（原 A2 js 122714）/splitLayoutStore（原 s2 js 121720）/
 *    EMPTY_PANE_LAYOUT（原 K0 js 121527）/isReloadNavigationEntry（原 z0 js 121382）/
 *    hasSplitLayoutBindings（原 jwt js 121716）declare 已删除，改经文件头真实 import（./SplitLayoutDeep）消费。
 *    paneById（原 T2 js 121528）/focusedPaneId（原 Z0 js 121533）declare 一并删除：本文件无调用点（死声明）。 ── */
interface SettingsStoreSlice {
  theme: string;
  user: UserInfo | null;
  isRestoringOAuthSession: boolean;
  loginEntryRequest: LoginEntryRequest | null;
  setUser(user: UserInfo | null): void;
  setIsRestoringOAuthSession(value: boolean): void;
  setOAuthError(error: string | null): void;
  markOAuthSuccess(provider: string): void;
  [key: string]: any;
}
/* ── tombstone（A1-R11）：declare useAppSettings（原 JM，53488——普查行漂移，旧注 53440）删除，
 *    改经文件头 ./UsageDeep import 消费（canonical = components/usage/UsageDeep.tsx §2c，JM 53488 逐字）。
 *    型缝：1992 解构 {settings, refresh, update} 三字段逐字不变；settings 读取面 2051/2058
 *    （askUserQuestionAutoResolutionEnabled）与 2130（providerFamilyDomain）均在 AppRuntimeSettings 具名面内；
 *    update 形参 AppRuntimeSettingsPatch（索引面）对 461 补丁（providerFamilyDomain 三键）可赋。 ── */

/* --- 遥测 / 启动标记 --- */
/* ── tombstone（A1-R9）：TelemetryPlatformLike 局部近似面删除——原供 xw/iT 两枚
 *    declare 使用，declare 改指 canonical 后全树零消费（1542 改具 TelemetryPlatform）。 ── */
/* ── tombstone（A1-R9）：trackTelemetryEvent（原 xw）/isTelemetryEnabled（原 re）/
 *    reportLaunchMarks（原 YPe）declare 删除，改经文件头真实 import 别名改指
 *    （./StoresDeep reportTelemetry/reportLaunchToInputPerf；./SkillStore
 *    isE2EStoreBridgeEnabled）。bundle 唯一真形：xw@40457 即 reportTelemetry(platform,
 *    report, scope)；re = skillStore chunk K 导出（styles 382 `K as re`）= E2E 桥门控
 *    isE2EStoreBridgeEnabled（R8 裁决在案）；YPe = ui_perf 域 reportLaunchToInputPerf
 *    （负段/超 300s 整批丢弃真形）。消费面 422（logout 上报）/1456+2592（E2E 门控）/
 *    2280（启动标记）实测逐字通过。环安全：StoresDeep 值导入闭包（logger/SrcSharedA/B/
 *    stores-workspace/SkillStore/stores-*）不达本文件（全树无本文件 import 源）。 ── */

/* --- 根装配杂项 --- */
/* ── tombstone（A1-R10）：setArmsReportPlatform（原 BSt）/setTelemetryReportPlatform
 *    （原 b_e）declare 删除，改经文件头真实 import 别名改指（./ConversationLeaves
 *    injectArmsReporter；../stores/mcpStore setMcpSyncServiceHandle）。bundle 唯一
 *    真形：BSt@118240 = `y0 = e`（captcha ARMS 平台引用，HSt@118261 消费）；
 *    b_e@25049 = `Hg = e`（mcpSyncService 句柄，Lg@25090 持久化消费）——R8 注
 *    「遥测上报平台引用」更正为 MCP 同步句柄注入。消费面 1956–1961（根装配注入/
 *    卸载置空）逐字不变；PlatformService 双法（reportArmsCustomEvent 必选、
 *    索引面）对两 canonical 形参均可赋。 ── */
/* ── tombstone（A1-R9）：setTelemetryPlatform（原 iT）/disposeStartupServiceRegistry
 *    （原 vFe）declare 删除，改经文件头真实 import 别名改指（./StoresDeep
 *    setUiPerfPlatform；./services disposeAllSupervisors）。bundle 唯一真形：iT 置
 *    ui_perf 平台引用 rT（StoresDeep H.4 逐字）；vFe@42698 迭代 vT 注册表逐项
 *    xT（telemetryScopes E.1 逐字）。消费面 1745/1751（parity web no-op 置空/还原）/
 *    1941/1943（根装配注入/卸载）/1951（应用退出释放）实测逐字通过。 ── */
declare function registerBaseServices(services: ServicesBundle): void; // 原 Sse
declare function setActiveWorkspacePathE2E(path: string | null): void; // 原 $se
declare function syncRemoteTabsE2E(tabs: Array<{ workspacePath: string; workspaceIdentity?: string; remoteSessionId?: string }>): void; // 原 yFe
declare const runtimePreferencesSchema: {
  safeParse(payload: unknown): { success: true; data: any; error?: undefined } | { success: false; error: { issues: unknown } };
}; // 原 Dt
declare function isCodeCommentRestorePayload(payload: unknown): payload is { id: string; workspacePath: string; workspaceIdentity?: string | null; sourcePath: string; sourceTitle: string; startLine: number; endLine: number; selectedText: string; comment: string }; // 原 NH；A1-R8 精化：谓词型面对齐 canonical restoreCommentFromAttachment 形参（Composer CodeCommentAttachment & { sourcePath: string } 结构面；原 { id?: string; [key: string]: any } 近似面改指后缝合不拢）
declare function isCodeCommentRemovePayload(payload: unknown): boolean; // 原 MH
declare function normalizeCodeCommentRemovePayload(payload: unknown): void; // 原 jH
/* ── tombstone（A1-R8）：codeCommentsStore（原 FH js 68562）declare 删除 → 真实 import
 *    useCodeCommentsStore as codeCommentsStore（./Composer，A1-R8 双实例收敛之 canonical）。
 *    本文件广播监听消费面（2009/2014 = bundle 212998/213003）调用点逐字不变。 ── */
/* ── tombstone（A1-R11）：declare subscribeModelProviders（原 hM，52695）/getModelProvidersCached（原 fM，52681）/
 *    isModelProviderSnapshotHydrated（原 pM，52684）删除，改经文件头 ./UsageDeep import 别名消费
 *    （canonical = components/usage/UsageDeep.tsx subscribeCodingPlanSources/listCodingPlanSources/hasLoadedCodingPlanSources，
 *    hM/fM/pM 52695/52681/52684 逐字）。双实例收敛证据：bundle 各唯一真身（注册表 oM/sM/dM 模块态）；
 *    终端消费实测 1996/1997（useState 初值）/2065–2069（快照订阅效应）。型缝：注册表元素精化为 ModelProvider[]
 *    （fetcher = modelProviderService.getAllCached/getAll，78266/78272/206174/209921 实测），
 *    对 ModelProviderRecord[] 消费面（2131 登录守卫）经 systemDisabledReason 精化（string | null）可赋。 ── */
declare function useSessionRestoreBridge(options: {
  settingService: SettingServiceLike | undefined;
  restoreSession: boolean;
  persistSession: boolean;
  restorePersistedSession: (settings: AppSettings) => Promise<{ excludedRecentProjectPaths?: string[]; deferredRestore?: () => void }>;
  buildPersistPatch: (state: TabStoreState) => { lastWorkspaceSession: unknown[]; lastActiveTabIndex: number };
}): { isRestoring: boolean; hasCompletedInitialRestore: boolean; hasCompletedFullRestore: boolean }; // 原 rYt
declare function useOAuthCredentialsRefresher(): { tryRefresh: (...args: unknown[]) => unknown; clearCredentials: (...args: unknown[]) => unknown }; // 原 iYt
/* ── tombstone（A1-R1）：isSettingsTab（原 Pse js 4497）declare 已删除，改经文件头真实 import（./WorkspaceTabsDeep）消费。 ── */
declare function useConfirmDialog(): (options: { title: string; description: string; confirmLabel: string; cancelLabel: string }) => Promise<boolean>; // 原 U2
declare function resolveFamilyDomainAfterLogout(options: { currentDomain: string | null | undefined; modelProviders: ModelProviderRecord[] }): string | null; // 原 yQt
declare function persistDraftSnippet(workspacePath: string, workspaceIdentity: string | null | undefined, kind: string, payload: { text: string }): void; // 原 hH
declare const DRAFT_SNIPPET_KIND_NEW_TASK: string; // 原 eXe
declare function useWebRemoteControlFeatureFlag(): boolean; // 原 y8
declare function useWebRemoteControlSession(options: { enabled: boolean }): { status: string }; // 原 G6
declare function useRemoteConnectionLogsBridge(state: unknown): { connectionLogs: Array<{ label?: string; level: string; message: string; timestamp: number; requestId?: string; [key: string]: any }>; resetConnectionLogs: () => void }; // 原 bEt

/* --- 任务列表（h8t 消费面）--- */
declare function useTaskListItems(options: { kind: string; workspaceTabs: WorkspaceTab[]; sortBy: string; searchQuery: string; expanded: boolean; collapsedLimit: number }): { items: Array<{ taskId: string; updatedAt: number; createdAt: number; [key: string]: any }>; loading: boolean }; // 原 ZS
declare function taskRuntimeByWorkspaceKey(workspaces: Record<string, unknown>): Record<string, unknown>; // 原 yPt
declare function mapTasksToListItems(options: { workspaceTabs: WorkspaceTab[]; tasks: Array<{ taskId: string; [key: string]: any }>; taskRuntimeByWorkspaceKey: Record<string, unknown>; pinned?: boolean; archived?: boolean }): Array<{ taskId: string; updatedAt: number; createdAt: number; [key: string]: any }>; // 原 h6

/* --- TDP 对测域外部件 --- */
/* ── tombstone（A1-R9）：resetTelemetryParityState（原 TPe）declare 删除，改经文件头
 *    真实 import 别名改指（./StoresDeep clearAllTelemetryTiming）。bundle 唯一真形：
 *    u8t@212536 次行即 TPe()（本文件 1470 调用点逐字对应）；TPe@41453 =
 *    Ow/kw/Aw/jw 四图清空 = StoresDeep TPe 逐字（inputTimingByWorkspace/
 *    promptLifecyclesByTask/activeLifecycleByTask/stepStateByTask）。 ── */
declare const planProviderIds: { zaiStartPlan: string; bigmodelStartPlan: string; [key: string]: string }; // 原 q
interface QuotaAssertion {
  visible: boolean;
  kind: string;
  dismissible: boolean;
  blocksSubmit: boolean;
  priority: number;
  providerLimitedMessage?: string;
  [key: string]: any;
}
declare function resolveQuotaAssertion(options: Record<string, unknown>): QuotaAssertion; // 原 I0
declare function quotaDismissKey(assertion: QuotaAssertion, instance: string): string; // 原 L0
declare function captchaProviderOfTaskMeta(options: { taskMeta: { model: string } }): string; // 原 KSt
/* ── tombstone（A1-R14）：buildCaptchaAssertionKeys（原 ACt，118738）/ CaptchaGatekeeper 接口（kCt 返回面）/
 *    createCaptchaGatekeeper（原 kCt，118735）/ captchaAssertionStatus（原 A0，118765）/
 *    recordCaptchaFailure（原 j0，118772）/ isCaptchaDecisionHandled（原 M0，118776）六枚 declare 删除——
 *    canonical = ConversationLeaves §5b 逐字实体（A1-R14 NCt 3007 恢复链批），经文件头既有边 import；
 *    c8t（captchaParityAssertions，1449–1479 = bundle 212490–212517）调用点逐字不变。
 *    型面校正：ACt 真身返回 ::连接串（string），旧 declare string[] 为 declare 期近似；
 *    A0/j0 第二参真身为单键 string，旧 declare string[] 同属近似——c8t 消费面（单串传参）两形兼容。 ── */

/* --- 启动音 / 渲染器 id --- */
/* ── tombstone（A1-R10 2a）：declare function isStartupSoundEnabled(): boolean（原 Eie，js 1091）删除，
 *    改经文件头 stores-core import 消费（canonical = settingsStore yo/bo/Eie 逐字转录；
 *    2604 调用点逐字不变）。 ── */
declare function createRandomId(): string; // 原 xi

/* --- provider 树组件（各家族批次，接口级消费面）--- */
declare const LucideProvider: React.FC<{ strokeWidth?: number; children?: React.ReactNode }>; // 原 qre（button-laUijeDG.js l）
declare const ServicesProvider: React.FC<{ services: ServicesBundle; children?: React.ReactNode }>; // 原 ds（2672）
/* ── tombstone（A1-R10 2a）：declare const StoreProvider: React.FC<{ broadcastService: BroadcastServiceLike; … }>（原 Nie，1289）删除，
 *    改经文件头 stores-core import 消费（canonical = SettingsStoreProvider，settingsStore 373 逐字）。
 *    型缝精化：broadcastService 真形 = BroadcastService（send + onMessage→{dispose}）——bundle 212887 根注入、
 *    Mie 1259/1261 消费；OnboardingLoginLeaves BroadcastServiceLike 已补 send 同形。1893/1904 JSX 逐字不变。 ── */
declare const TabStoreProvider: React.FC<{ children?: React.ReactNode }>; // 原 Vse（4784）
declare const WebRemoteControlFeatureGate: React.FC<{ enabled?: boolean; children?: React.ReactNode }>; // 原 oRt（150149）
declare const RemoteConnectionDialog: React.FC<Record<string, any>>; // 原 pOt
declare const ScopeBoundary: React.FC<Record<string, any>>; // 原 p4

/* --- window 全局 --- */
declare global {
  interface Window {
    __zcodeConversationTelemetryParityE2E?: { variant: string; run(caseId: string): Promise<unknown> } | undefined;
    __zcodeArmsCustomEventsE2E?: Array<Record<string, unknown>>;
  }
}

/* ============================================================================
 * §J. useWorkspaceActions（原 j6t，js 210776–211054 / jsx 167537）
 * ==========================================================================*/

/** 原 j6t — 逐字（行段在 F18 范围内，按任务指派归 F20） */
export function useWorkspaceActions({
  intl,
  platform,
  services,
  tabStoreApi,
  addTab,
  activeWorkspacePath,
  activeWorkspaceIdentity,
  supportsSettings,
  allowOpenWorkspace,
  preferDirectoryBrowser,
  openDirectoryBrowser,
  refreshModelProviderSnapshot,
  updateAppSettings,
  setOAuthError,
  setUser,
  onProviderFamilyDomainClearedAfterLogout,
  userId,
  onOpenRemoteConnection,
  workbenchGroupClientMode = `desktop-continuous`,
}: {
  intl: IntlShape;
  platform: PlatformService;
  services: ServicesBundle;
  tabStoreApi: { getState(): TabStoreState };
  addTab: (path: string, patch?: Record<string, unknown>) => void;
  activeWorkspacePath: string | null;
  activeWorkspaceIdentity: string | null;
  supportsSettings: boolean;
  allowOpenWorkspace: boolean;
  preferDirectoryBrowser: boolean;
  openDirectoryBrowser: () => void;
  refreshModelProviderSnapshot: (options?: { force?: boolean }) => Promise<void>;
  updateAppSettings: (patch: AppRuntimeSettingsPatch) => Promise<void>; // A1-R11 型缝精化：对齐 JM canonical update 面（索引补丁面；461 消费逐字不变）
  setOAuthError: (error: string | null) => void;
  setUser: (user: UserInfo | null) => void;
  onProviderFamilyDomainClearedAfterLogout?: () => void;
  userId: string | undefined;
  onOpenRemoteConnection?: (request: { preferredKind: string; preferredWslDistro: string }) => void;
  workbenchGroupClientMode?: string;
}) {
  let [workspaceActionError, setWorkspaceActionError] = (0, React.useState)<string | null>(null),
    confirmDialog = useConfirmDialog(),
    {
      handleSelectConversationWorkspace,
      handleResolveConversationWorkspace,
      handleEnsureConversationWorkspace,
      handleCreateConversationTask,
    } = useConversationWorkspaceActions({ services, addTab, setWorkspaceActionError });
  (0, React.useEffect)(() => {
    if ((sessionRouterStore.getState().configureClientMode(workbenchGroupClientMode), workbenchGroupClientMode === `desktop-continuous` && !isReloadNavigationEntry())) {
      let routerState = sessionRouterStore.getState(),
        activeGroup = routerState.activeGroupId ? routerState.groups[routerState.activeGroupId] : null;
      (activeGroup &&
        [activeGroup.primaryBinding, ...Object.values(activeGroup.panes)].some((binding) => binding.restoredUnvalidated) &&
        routerState.deactivateActiveGroup(),
        hasSplitLayoutBindings() && splitLayoutStore.getState().resetToPrimaryPane());
    }
  }, [workbenchGroupClientMode]);
  let startDraftInWorkspace = (0, React.useCallback)(
      (path: string, identity?: string | null) => {
        (workbenchGroupClientMode === `desktop-continuous` &&
          (sessionRouterStore.getState().deactivateActiveGroup(), splitLayoutStore.getState().resetToPrimaryPane()),
          useTaskStore.getState().startDraft(path, void 0, identity));
      },
      [workbenchGroupClientMode],
    ),
    startNewTaskFromActiveWorkspace = (0, React.useCallback)(
      (source: string, options?: string | { provider?: string; groupedDraftPlacement?: GroupedDraftPlacement; initialPrompt?: string; initialPromptMention?: unknown }) => {
        let tabState = tabStoreApi.getState(),
          { activeWorkspacePath: currentPath, activeWorkspaceIdentity: currentIdentity, activateTabByPath } = tabState,
          routerState = sessionRouterStore.getState(),
          activeScope = resolveActiveWorkspaceScope({
            activeWorkspacePath: currentPath,
            activeWorkspaceIdentity: currentIdentity,
            activeGroup:
              workbenchGroupClientMode === `desktop-continuous` && routerState.activeGroupId
                ? (routerState.groups[routerState.activeGroupId] ?? null)
                : null,
            paneLayout: workbenchGroupClientMode === `desktop-continuous` ? splitLayoutStore.getState() : EMPTY_PANE_LAYOUT,
          });
        if (!activeScope) {
          (logger.error(`[Root] ${source} failed: no active workspace`),
            setWorkspaceActionError(intl.formatMessage({ id: `workspace.noActiveForNewTask` })));
          return;
        }
        if (hasUnavailableLocalDirectoryTab(tabState, activeScope.workspacePath, activeScope.workspaceIdentity ?? void 0)) return;
        (activateTabByPath(
          activeScope.workspacePath,
          activeScope.workspaceIdentity ? { workspaceIdentity: activeScope.workspaceIdentity } : void 0,
        ) ||
          addTab(
            activeScope.workspacePath,
            activeScope.workspaceIdentity ? { workspaceIdentity: activeScope.workspaceIdentity } : void 0,
          ),
          setWorkspaceActionError(null));
        let providerId = typeof options == `string` ? options : options?.provider,
          groupedDraftPlacement = typeof options == `string` ? void 0 : options?.groupedDraftPlacement,
          initialPrompt = typeof options == `string` ? void 0 : options?.initialPrompt?.trim(),
          initialPromptMention = typeof options == `string` ? void 0 : options?.initialPromptMention;
        (logger.info(`[Root] ${source}:`, activeScope.workspacePath, providerId ?? `default-provider`),
          sessionRouterStore.getState().deactivateActiveGroup(),
          splitLayoutStore.getState().resetToPrimaryPane(),
          useTaskStore
            .getState()
            .startDraft(
              activeScope.workspacePath,
              providerId,
              activeScope.workspaceIdentity ?? void 0,
              groupedDraftPlacement ? { groupedDraftPlacement } : void 0,
            ),
          initialPrompt &&
            (persistDraftSnippet(activeScope.workspacePath, activeScope.workspaceIdentity ?? void 0, DRAFT_SNIPPET_KIND_NEW_TASK, { text: initialPrompt }),
            useTaskStore
              .getState()
              .requestComposerTextInsert(activeScope.workspacePath, initialPrompt, activeScope.workspaceIdentity ?? void 0, initialPromptMention)));
      },
      [addTab, intl, tabStoreApi, workbenchGroupClientMode],
    ),
    handleLogout = (0, React.useCallback)(async () => {
      let runningSessionCount: number | null = null;
      try {
        let activity = await platform.getDesktopSessionActivity?.();
        runningSessionCount = typeof activity?.runningAgentSessionCount == `number` ? activity.runningAgentSessionCount : null;
      } catch (error) {
        logger.warn(`[Root] 查询桌面运行中会话数量失败，使用保守退出登录文案`, { error });
      }
      if (
        !(await confirmDialog({
          title: intl.formatMessage({ id: `logout.confirm.title` }),
          description:
            runningSessionCount !== null && runningSessionCount > 0
              ? intl.formatMessage(
                  { id: `logout.confirm.descriptionWithRunningSessions` },
                  { count: String(runningSessionCount) },
                )
              : intl.formatMessage({ id: `logout.confirm.descriptionDefault` }),
          confirmLabel: intl.formatMessage({ id: `logout.confirm.ok` }),
          cancelLabel: intl.formatMessage({ id: `logout.confirm.cancel` }),
        }))
      )
        return;
      await trackTelemetryEvent(
        platform,
        {
          elementName: `app_user_logout`,
          eventRegion: `app_profile`,
          eventType: `ck`,
          eventExtraDetail: {},
          userId,
        },
        `Root`,
      );
      let [settings, modelProviders] = await Promise.all([services.settingService.get(), services.modelProviderService.getAll()]),
        domainAfterLogout = resolveFamilyDomainAfterLogout({ currentDomain: settings.providerFamilyDomain, modelProviders });
      (await services.oauthService.logout(),
        await updateAppSettings({
          providerFamilyDomain: domainAfterLogout ?? ``,
          providerFamilyDomainUpdatedAt: Date.now(),
          providerFamilyDomainMigrated: true,
        }),
        domainAfterLogout || onProviderFamilyDomainClearedAfterLogout?.(),
        setOAuthError(null),
        setUser(null),
        await refreshModelProviderSnapshot({ force: true }),
        await platform.executeDesktopCommand(DESKTOP_COMMANDS.RelaunchApp));
    }, [intl, confirmDialog, refreshModelProviderSnapshot, onProviderFamilyDomainClearedAfterLogout, platform, services.oauthService, services.modelProviderService, services.settingService, setOAuthError, setUser, updateAppSettings, userId]),
    handleSelectProject = (0, React.useCallback)(
      async (path: string) => {
        logger.info(`[Root] handleSelectProject called with path:`, path);
        try {
          let wslUncPath = parseWslUncPath(path);
          if (
            wslUncPath &&
            onOpenRemoteConnection &&
            (await confirmDialog({
              title: intl.formatMessage({ id: `workspace.wslUncPrompt.title` }),
              description: intl.formatMessage(
                { id: `workspace.wslUncPrompt.description` },
                { path },
              ),
              confirmLabel: intl.formatMessage({ id: `workspace.wslUncPrompt.openWsl` }),
              cancelLabel: intl.formatMessage({ id: `workspace.wslUncPrompt.continuePath` }),
            }))
          ) {
            (logger.info(`[Root] 用户选择通过 WSL 远程连接打开 UNC 工作区`, {
              distro: wslUncPath.distro,
              path,
            }),
              onOpenRemoteConnection({ preferredKind: `wsl`, preferredWslDistro: wslUncPath.distro }));
            return;
          }
          if ((await platform.activateOrSetWorkspace(path)).activated) {
            logger.info(`[Root] 目录已在其他窗口打开，已激活该窗口对应 tab，跳过重复打开`);
            return;
          }
          if ((addTab(path), startDraftInWorkspace(path), setWorkspaceActionError(null), supportsSettings)) {
            logger.info(`[Root] calling settingService.get()...`);
            let recentProjects = [
              path,
              ...(await services.settingService.get()).recentProjects.filter((entry) => entry !== path),
            ].slice(0, 10);
            (await services.settingService.update({ recentProjects }),
              logger.info(`[Root] settingService.update() done`));
          }
        } catch (error) {
          logger.error(`[Root] handleSelectProject error:`, error);
        }
      },
      [addTab, intl, onOpenRemoteConnection, platform, confirmDialog, services.settingService, startDraftInWorkspace, supportsSettings],
    );
  return {
    workspaceActionError,
    setWorkspaceActionError,
    startDraftInWorkspace,
    startNewTaskFromActiveWorkspace,
    handleLogout,
    handleSelectProject,
    handleSelectConversationWorkspace,
    handleResolveConversationWorkspace,
    handleEnsureConversationWorkspace,
    handleCreateConversationTask,
    handleOpenWorkspace: (0, React.useCallback)(() => {
      if (!allowOpenWorkspace) {
        logger.info(`[Root] 当前模式不支持打开其他工作区，已忽略请求`);
        return;
      }
      if ((setWorkspaceActionError(null), preferDirectoryBrowser)) {
        openWorkspaceFolderEntry({
          preferDirectoryBrowser,
          openDirectoryBrowser,
          selectDirectory: () => platform.selectDirectory(),
          onSelectProject: (selected) => {
            handleSelectProject(selected);
          },
        });
        return;
      }
      if (!supportsSettings) {
        handleEnsureConversationWorkspace().catch((error) => {
          logger.error(`[Root] 创建对话 workspace 失败`, { error });
        });
        return;
      }
      openWorkspaceFolderEntry({
        selectDirectory: () => platform.selectDirectory(),
        onSelectProject: (selected) => {
          handleSelectProject(selected);
        },
      });
    }, [allowOpenWorkspace, handleEnsureConversationWorkspace, handleSelectProject, openDirectoryBrowser, platform, preferDirectoryBrowser, supportsSettings]),
    handleOpenFolderFromWorkspaceMenu: (0, React.useCallback)(() => {
      if (!allowOpenWorkspace) {
        logger.info(`[Root] 当前模式不支持从空态菜单打开文件夹，已忽略请求`);
        return;
      }
      if (preferDirectoryBrowser) {
        openWorkspaceFolderEntry({
          preferDirectoryBrowser,
          openDirectoryBrowser,
          selectDirectory: () => platform.selectDirectory(),
          onSelectProject: (selected) => {
            handleSelectProject(selected);
          },
        });
        return;
      }
      if (!supportsSettings) {
        handleEnsureConversationWorkspace().catch((error) => {
          logger.error(`[Root] 从空态菜单创建对话 workspace 失败`, { error });
        });
        return;
      }
      openWorkspaceFolderEntry({
        selectDirectory: () => platform.selectDirectory(),
        onSelectProject: (selected) => {
          handleSelectProject(selected);
        },
      });
    }, [allowOpenWorkspace, handleEnsureConversationWorkspace, handleSelectProject, openDirectoryBrowser, platform, preferDirectoryBrowser, supportsSettings]),
    handleCreateScratchWorkspace: (0, React.useCallback)(
      async (name: string) => {
        if (!allowOpenWorkspace) return (logger.info(`[Root] 当前模式不支持从空态菜单创建工作区，已忽略请求`), null);
        let workspace = await services.fileService.createScratchWorkspace({ name });
        return (await handleSelectProject(workspace.path), workspace.path);
      },
      [allowOpenWorkspace, handleSelectProject, services.fileService],
    ),
    handleCreateTask: (0, React.useCallback)(
      (options?: string | { provider?: string; groupedDraftPlacement?: GroupedDraftPlacement; initialPrompt?: string; initialPromptMention?: unknown }) => {
        startNewTaskFromActiveWorkspace(`sidebar new task`, options);
      },
      [startNewTaskFromActiveWorkspace],
    ),
    handleBackFromSettings: (0, React.useCallback)(() => {
      activeWorkspacePath && tabStoreApi.getState().activateTabByPath(activeWorkspacePath, activeWorkspaceIdentity ? { workspaceIdentity: activeWorkspaceIdentity } : void 0);
    }, [activeWorkspaceIdentity, activeWorkspacePath, tabStoreApi]),
  };
}

/* ============================================================================
 * §K. 遥测对测（TDP）域（原 js 211669–212815）
 * ==========================================================================*/

/** 原 i8t（js 211669 / jsx 168266）— 逐字：TDP01–19 用例构造 */
export function buildTelemetryParityCases() {
  let tdp01Operations = buildTdpTurnOperations({ caseId: `TDP01` }),
    tdp02Operations = [
      ...buildTdpTurnOperations({ caseId: `TDP02A`, sessionId: `tdp02-session` }),
      ...buildTdpTurnOperations({
        caseId: `TDP02B`,
        sessionId: `tdp02-session`,
        sendAt: 400,
        chunkAt: 500,
        terminalAt: 600,
      }),
    ],
    tdp03AOperations = buildTdpTurnOperations({
      caseId: `TDP03A`,
      sessionId: `tdp03-session`,
      commandId: `tdp03-command-1`,
      terminalAt: 500,
    }),
    tdp03BOperations = buildTdpTurnOperations({
      caseId: `TDP03B`,
      sessionId: `tdp03-session`,
      commandId: `tdp03-command-2`,
      sendAt: 150,
      chunkAt: 600,
      terminalAt: 700,
    }),
    tdp03Operations = [
      ...tdp03AOperations.slice(0, 7),
      ...tdp03BOperations.slice(0, 4),
      ...tdp03AOperations.slice(7),
      {
        kind: `seed`,
        sessionId: `tdp03-session`,
        commandId: `tdp03-command-2`,
        now: 550,
        duplicate: true,
        ...TDP_SEED_DEFAULTS,
      },
      ...tdp03BOperations.slice(4),
    ],
    tdp05Operations: Array<Record<string, unknown>> = [];
  for (let [index, includeUsage] of [true, false].entries()) {
    let suffix = String(index + 1),
      sessionId = `tdp05-session-${suffix}`,
      commandId = `tdp05-command-${suffix}`,
      turnId = `tdp05-turn-${suffix}`;
    tdp05Operations.push(
      { kind: `foreground.attach`, sessionId, owner: `tdp05-owner-${suffix}` },
      { kind: `seed`, sessionId, commandId, now: 100 + index * 400, ...TDP_SEED_DEFAULTS },
      {
        kind: `turn.started`,
        now: 110 + index * 400,
        eventId: `tdp05-start-${suffix}`,
        sessionId,
        commandId,
        turnId,
      },
      {
        kind: `model.status`,
        now: 120 + index * 400,
        eventId: `tdp05-request-start-${suffix}`,
        sessionId,
        commandId,
        turnId,
        requestId: `tdp05-request-${suffix}`,
        status: `model_request_started`,
        providerId: `glm`,
        modelId: `glm-model`,
      },
      {
        kind: `chunk`,
        now: 150 + index * 400,
        eventId: `tdp05-chunk-${suffix}`,
        sessionId,
        commandId,
        turnId,
        channel: `text`,
        firstChunk: true,
      },
      ...(includeUsage
        ? [
            {
              kind: `usage`,
              now: 170,
              eventId: `tdp05-usage-1`,
              sessionId,
              commandId,
              turnId,
              inputTokens: 9,
              outputTokens: 3,
            },
          ]
        : []),
      {
        kind: `model.status`,
        now: 180 + index * 400,
        eventId: `tdp05-request-fail-${suffix}`,
        sessionId,
        commandId,
        turnId,
        requestId: `tdp05-request-${suffix}`,
        status: `model_request_failed`,
        providerId: `glm`,
        modelId: `glm-model`,
        reason: index === 0 ? `provider failed` : ``,
        statusCode: 500,
      },
      {
        kind: `terminal`,
        now: 200 + index * 400,
        eventId: `tdp05-terminal-${suffix}`,
        sessionId,
        commandId,
        turnId,
        status: `failed`,
        errorCode: index === 0 ? `PROVIDER_ERROR` : void 0,
        errorMessage: index === 0 ? `provider failed` : void 0,
      },
    );
  }
  let tdp06Operations = [
      ...buildTdpTurnOperations({ caseId: `TDP06A`, includeNetwork: false }).map((operation) =>
        operation.kind === `terminal` ? { ...operation, status: `interrupted`, errorCode: `USER_INTERRUPT` } : operation,
      ),
      { kind: `foreground.attach`, sessionId: `tdp06-no-terminal`, owner: `tdp06-owner-2` },
      {
        kind: `seed`,
        sessionId: `tdp06-no-terminal`,
        commandId: `tdp06-no-terminal-command`,
        now: 500,
        ...TDP_SEED_DEFAULTS,
      },
      {
        kind: `turn.started`,
        now: 510,
        eventId: `tdp06-no-terminal-start`,
        sessionId: `tdp06-no-terminal`,
        commandId: `tdp06-no-terminal-command`,
        turnId: `tdp06-no-terminal-turn`,
      },
    ],
    tdp07Operations = buildTdpTurnOperations({ caseId: `TDP07`, includeNetwork: false }),
    tdp07ChunkIndex = tdp07Operations.findIndex((operation) => operation.kind === `chunk`);
  tdp07Operations.splice(tdp07ChunkIndex, 0, {
    kind: `chunk`,
    now: 150,
    eventId: `tdp07-thought`,
    sessionId: `tdp07-session`,
    commandId: `tdp07-command`,
    turnId: `tdp07-turn`,
    channel: `thought`,
    firstChunk: true,
  });
  let tdp08Operations: Array<Record<string, unknown>> = [];
  [`success`, `failed`, `permission`, `parented`].forEach((variant, variantIndex) => {
    let sessionId = `tdp08-${variant}-session`,
      commandId = `tdp08-${variant}-command`,
      turnId = `tdp08-${variant}-turn`,
      baseAt = 100 + variantIndex * 500;
    (tdp08Operations.push(
      { kind: `foreground.attach`, sessionId, owner: `tdp08-${variant}-owner` },
      { kind: `seed`, sessionId, commandId, now: baseAt, ...TDP_SEED_DEFAULTS },
      {
        kind: `turn.started`,
        now: baseAt + 10,
        eventId: `tdp08-${variant}-start`,
        sessionId,
        commandId,
        turnId,
      },
    ),
      variant === `parented`
        ? tdp08Operations.push(
            {
              kind: `chunk`,
              now: baseAt + 30,
              eventId: `tdp08-parented-thought`,
              sessionId,
              commandId,
              turnId,
              channel: `thought`,
              firstChunk: true,
              parentToolCallId: `parent-agent`,
            },
            {
              kind: `chunk`,
              now: baseAt + 40,
              eventId: `tdp08-parented-text`,
              sessionId,
              commandId,
              turnId,
              channel: `text`,
              firstChunk: false,
              parentToolCallId: `parent-agent`,
            },
            {
              kind: `chunk`,
              now: baseAt + 60,
              eventId: `tdp08-main-text`,
              sessionId,
              commandId,
              turnId,
              channel: `text`,
              firstChunk: false,
            },
          )
        : (variant === `permission` &&
            tdp08Operations.push({
              kind: `permission`,
              now: baseAt + 20,
              eventId: `tdp08-permission-request`,
              sessionId,
              commandId,
              turnId,
              phase: `requested`,
              requestId: `tdp08-permission`,
              toolCallId: `tdp08-permission-tool`,
            }),
          tdp08Operations.push(
            {
              kind: `tool`,
              now: baseAt + 30,
              eventId: `tdp08-${variant}-tool-start`,
              sessionId,
              commandId,
              turnId,
              phase: `started`,
              toolCallId: `tdp08-${variant}-tool`,
              toolName: variant === `failed` ? `Bash` : `Read`,
            },
            ...(variant === `permission`
              ? [
                  {
                    kind: `permission`,
                    now: baseAt + 80,
                    eventId: `tdp08-permission-resolved`,
                    sessionId,
                    commandId,
                    turnId,
                    phase: `resolved`,
                    requestId: `tdp08-permission`,
                    toolCallId: `tdp08-permission-tool`,
                    decision: `allow`,
                  },
                ]
              : []),
            {
              kind: `tool`,
              now: baseAt + 120,
              eventId: `tdp08-${variant}-tool-terminal`,
              sessionId,
              commandId,
              turnId,
              phase: variant === `failed` ? `failed` : `completed`,
              toolCallId: `tdp08-${variant}-tool`,
              toolName: variant === `failed` ? `Bash` : `Read`,
              errorCode: variant === `failed` ? `TOOL_EXEC_ERROR` : void 0,
              errorMessage: variant === `failed` ? `exit 2` : void 0,
              performance: {
                totalMs: 90,
                permissionWaitMs: variant === `permission` ? 60 : 0,
                commandRunMs: variant === `permission` ? 30 : 90,
                exitCode: variant === `failed` ? 2 : 0,
                timedOut: false,
                outputBytes: 12,
                commandCategory: `read`,
                commandHash: `0123456789abcdef`,
                workspaceKind: `local`,
              },
            },
          )),
      tdp08Operations.push({
        kind: `terminal`,
        now: baseAt + 200,
        eventId: `tdp08-${variant}-terminal`,
        sessionId,
        commandId,
        turnId,
        status: `success`,
      }));
  });
  let tdp09Operations = buildTdpTurnOperations({ caseId: `TDP09`, includeNetwork: true }),
    tdp09TerminalIndex = tdp09Operations.findIndex((operation) => operation.kind === `terminal`);
  (tdp09Operations.splice(tdp09TerminalIndex, 0, { kind: `foreground.detach`, owner: `tdp09-owner` }),
    tdp09Operations.push({ kind: `foreground.attach`, sessionId: `tdp09-session`, owner: `tdp09-reopen` }));
  let tdp10Operations: Array<Record<string, unknown>> = [];
  [
    { name: `negative`, sendAt: 200, firstAt: 100, secondAt: void 0 },
    { name: `no-token`, sendAt: 500, firstAt: void 0, secondAt: void 0 },
    { name: `gap-3000`, sendAt: 800, firstAt: 900, secondAt: 3900 },
    { name: `gap-3001`, sendAt: 4200, firstAt: 4300, secondAt: 7301 },
    { name: `tool-clear`, sendAt: 7600, firstAt: 7700, secondAt: 13e3 },
    { name: `split`, sendAt: 13300, firstAt: 13400, secondAt: void 0 },
  ].forEach((entry) => {
    let sessionId = `tdp10-${entry.name}-session`,
      commandId = `tdp10-${entry.name}-command`,
      turnId = `tdp10-${entry.name}-turn`;
    (tdp10Operations.push(
      { kind: `foreground.attach`, sessionId, owner: `tdp10-${entry.name}-owner-1` },
      ...(entry.name === `split`
        ? [{ kind: `foreground.attach`, sessionId, owner: `tdp10-split-owner-2` }]
        : []),
      { kind: `seed`, sessionId, commandId, now: entry.sendAt, ...TDP_SEED_DEFAULTS },
      {
        kind: `turn.started`,
        now: entry.sendAt + 1,
        eventId: `tdp10-${entry.name}-start`,
        sessionId,
        commandId,
        turnId,
      },
    ),
      entry.firstAt !== void 0 &&
        tdp10Operations.push({
          kind: `chunk`,
          now: entry.firstAt,
          eventId: `tdp10-${entry.name}-chunk-1`,
          sessionId,
          commandId,
          turnId,
          channel: `text`,
          firstChunk: true,
        }),
      entry.name === `tool-clear` &&
        tdp10Operations.push(
          {
            kind: `tool`,
            now: 11500,
            eventId: `tdp10-tool-clear-start`,
            sessionId,
            commandId,
            turnId,
            phase: `started`,
            toolCallId: `tdp10-tool-clear-tool`,
            toolName: `Read`,
          },
          {
            kind: `tool`,
            now: 12e3,
            eventId: `tdp10-tool-clear-complete`,
            sessionId,
            commandId,
            turnId,
            phase: `completed`,
            toolCallId: `tdp10-tool-clear-tool`,
            toolName: `Read`,
          },
        ),
      entry.secondAt !== void 0 &&
        tdp10Operations.push({
          kind: `chunk`,
          now: entry.secondAt,
          eventId: `tdp10-${entry.name}-chunk-2`,
          sessionId,
          commandId,
          turnId,
          channel: `text`,
          firstChunk: false,
        }),
      tdp10Operations.push({
        kind: `terminal`,
        now: Math.max(entry.sendAt + 200, (entry.secondAt ?? entry.firstAt ?? entry.sendAt) + 100),
        eventId: `tdp10-${entry.name}-terminal`,
        sessionId,
        commandId,
        turnId,
        status: `success`,
      }));
  });
  let tdp11Operations = [
      ...[`completed`, `failed`, `interrupted`].map((status) => ({
        kind: `foreground.attach`,
        sessionId: `tdp11-${status}-session`,
        owner: `tdp11-${status}-owner`,
      })),
      ...[`completed`, `failed`, `interrupted`].map((status, statusIndex) => ({
        kind: `compaction`,
        now: 200 + statusIndex * 100,
        eventId: `tdp11-${status}`,
        sessionId: `tdp11-${status}-session`,
        operationId: `tdp11-${status}-operation`,
        summaryMessageId: `tdp11-${status}-summary`,
        status,
        trigger: statusIndex === 0 ? `manual` : `auto`,
        reason: statusIndex === 0 ? `manual request` : void 0,
        compactReason: statusIndex === 1 ? `context_limit` : void 0,
        modelName: statusIndex === 2 ? `glm-model` : `anthropic/model`,
        modelProvider: statusIndex === 2 ? `glm` : `anthropic`,
        startedAt: 100,
        endedAt: 150 + statusIndex * 10,
        preCompactTokenCount: 100,
        postCompactTokenCount: 40,
        truePostCompactTokenCount: 35,
      })),
      {
        kind: `compaction`,
        now: 600,
        eventId: `tdp11-duplicate`,
        sessionId: `tdp11-completed-session`,
        operationId: `tdp11-completed-operation`,
        status: `failed`,
        trigger: `manual`,
        duplicate: true,
      },
      {
        kind: `compaction`,
        now: 700,
        eventId: `tdp11-background`,
        sessionId: `tdp11-background-session`,
        operationId: `tdp11-background-operation`,
        status: `completed`,
        trigger: `auto`,
        modelName: `glm-model`,
        modelProvider: `glm`,
      },
    ],
    tdp12Operations = [
      `model_request_started`,
      `model_request_completed`,
      `model_request_failed`,
      `model_retry_scheduled`,
      `model_stream_stalled`,
    ].flatMap((status, statusIndex) =>
      [`foreground`, `background`].map((surface, surfaceIndex) => ({
        kind: `model.status`,
        now: 100 + statusIndex * 20 + surfaceIndex,
        eventId: `tdp12-${status}-${surface}`,
        sessionId: `tdp12-${surface}-session`,
        requestId: `tdp12-request-${surface}`,
        status,
        providerId: `custom-provider`,
        modelId: `custom-model`,
        providerHostname: `safe.example.com`,
        durationMs: status === `model_request_started` ? void 0 : 20 + statusIndex,
        reason: status === `model_request_failed` ? `failed` : void 0,
        retryable: status === `model_retry_scheduled` ? true : void 0,
        delayMs: status === `model_retry_scheduled` ? 500 : void 0,
        idleMs: status === `model_stream_stalled` ? 3001 : void 0,
        timeoutMs: status === `model_stream_stalled` ? 3e3 : void 0,
      })),
    ),
    tdp13Operations: Array<Record<string, unknown>> = [];
  [
    { name: `valid`, sendAt: 100, chunkAt: 180, provider: `glm`, foreground: true },
    { name: `negative`, sendAt: 400, chunkAt: 350, provider: `glm`, foreground: true },
    { name: `missing`, sendAt: 700, chunkAt: 780, provider: ``, foreground: true },
    { name: `background`, sendAt: 1e3, chunkAt: 1080, provider: `glm`, foreground: false },
  ].forEach((entry) => {
    let sessionId = `tdp13-${entry.name}-session`,
      commandId = `tdp13-${entry.name}-command`,
      turnId = `tdp13-${entry.name}-turn`;
    (entry.foreground &&
      tdp13Operations.push({ kind: `foreground.attach`, sessionId, owner: `tdp13-${entry.name}-owner` }),
      tdp13Operations.push(
        {
          kind: `seed`,
          sessionId,
          commandId,
          now: entry.sendAt,
          askMode: `build`,
          modelName: `glm-model`,
          modelProvider: entry.provider,
        },
        {
          kind: `turn.started`,
          now: entry.sendAt + 1,
          eventId: `tdp13-${entry.name}-start`,
          sessionId,
          commandId,
          turnId,
        },
        {
          kind: `chunk`,
          now: entry.chunkAt,
          eventId: `tdp13-${entry.name}-chunk`,
          sessionId,
          commandId,
          turnId,
          channel: `text`,
          firstChunk: true,
        },
        {
          kind: `terminal`,
          now: entry.sendAt + 200,
          eventId: `tdp13-${entry.name}-terminal`,
          sessionId,
          commandId,
          turnId,
          status: `success`,
        },
      ));
  });
  let tdp14Operations = [
      {
        kind: `visible.error`,
        errorKey: `tdp14-key-1`,
        displayMessage: `Visible provider failure`,
        code: `PROVIDER_ERROR`,
        traceId: `tdp14-trace-1`,
        sessionId: `tdp14-session`,
        detail: `bounded detail`,
      },
      {
        kind: `visible.error`,
        errorKey: `tdp14-key-1`,
        displayMessage: `Visible provider failure`,
        code: `PROVIDER_ERROR`,
        traceId: `tdp14-trace-1`,
        sessionId: `tdp14-session`,
        duplicate: true,
      },
      {
        kind: `visible.error`,
        errorKey: `tdp14-suppressed`,
        displayMessage: `Suppressed local error`,
        code: `LOCAL_ERROR`,
        traceId: `tdp14-trace-suppressed`,
        sessionId: `tdp14-session`,
        suppressed: true,
      },
      {
        kind: `visible.error`,
        errorKey: `tdp14-key-2`,
        displayMessage: `Second visible provider failure`,
        code: `SECOND_ERROR`,
        traceId: `tdp14-trace-2`,
        sessionId: `tdp14-session`,
      },
    ],
    tdp15Operations = [
      {
        kind: `feedback`,
        sessionId: `tdp15-session`,
        messageId: `tdp15-assistant`,
        reaction: `like`,
      },
      {
        kind: `feedback`,
        sessionId: `tdp15-session`,
        messageId: `tdp15-assistant`,
        reaction: `dislike`,
      },
      {
        kind: `feedback`,
        sessionId: `tdp15-session`,
        messageId: `tdp15-assistant`,
        reaction: `none`,
      },
    ],
    tdp17Operations = [
      {
        kind: `visible.error`,
        errorKey: `tdp17-3007`,
        displayMessage: `Captcha verification failed. Please try again.`,
        code: `3007`,
        traceId: `tdp17-trace`,
        sessionId: `tdp17-session`,
      },
    ],
    tdp18Operations = buildTdpTurnOperations({ caseId: `TDP18`, includeNetwork: true }),
    tdp18Chunk = tdp18Operations.find((operation) => operation.kind === `chunk`),
    tdp18Terminal = tdp18Operations.find((operation) => operation.kind === `terminal`);
  (tdp18Chunk && tdp18Operations.push({ ...tdp18Chunk }), tdp18Terminal && tdp18Operations.push({ ...tdp18Terminal, duplicate: true }), tdp18Operations.push({ kind: `scope.dispose` }));
  let tdp19Operations = [
    ...buildTdpTurnOperations({ caseId: `TDP19A`, scope: `identity-a` }),
    ...buildTdpTurnOperations({ caseId: `TDP19B`, scope: `identity-b` }),
    { kind: `scope.dispose`, scope: `identity-a` },
    { kind: `web.noop`, operations: buildTdpTurnOperations({ caseId: `TDP19WEB`, scope: `web` }) },
  ];
  return [
    defineTelemetryParityCase(
      `TDP01`,
      tdp01Operations,
      { send_btn: 1, agent_step: 1, message_completion: 1 },
      {
        plan_request: 2,
        plan_ttft: 1,
        perf_ui_first_token: 1,
        perf_ui_message_complete: 1,
        perf_ui_turn_breakdown: 1,
      },
      [`draft-create-ack`, `source-command-link`],
    ),
    defineTelemetryParityCase(
      `TDP02`,
      tdp02Operations,
      { send_btn: 2, agent_step: 2, message_completion: 2 },
      {
        plan_request: 4,
        plan_ttft: 2,
        perf_ui_first_token: 2,
        perf_ui_message_complete: 2,
        perf_ui_turn_breakdown: 2,
      },
      [`same-talk-id`, `message-scope-reset`],
    ),
    defineTelemetryParityCase(
      `TDP03`,
      tdp03Operations,
      { send_btn: 2, agent_step: 2, message_completion: 2 },
      {
        plan_request: 4,
        plan_ttft: 2,
        perf_ui_first_token: 2,
        perf_ui_message_complete: 2,
        perf_ui_turn_breakdown: 2,
      },
      [`queued-before-first-terminal`, `promotion-seed-deduped`],
    ),
    defineTelemetryParityCase(
      `TDP04`,
      buildTdpTurnOperations({ caseId: `TDP04` }),
      { send_btn: 1, agent_step: 1, message_completion: 1 },
      {
        plan_request: 2,
        plan_ttft: 1,
        perf_ui_first_token: 1,
        perf_ui_message_complete: 1,
        perf_ui_turn_breakdown: 1,
      },
      [`success-usage`, `runtime-model-hostname`],
    ),
    defineTelemetryParityCase(
      `TDP05`,
      tdp05Operations,
      { send_btn: 2, agent_step: 2, message_completion: 2 },
      {
        plan_request: 4,
        plan_ttft: 2,
        perf_ui_first_token: 2,
        perf_ui_message_complete: 2,
        perf_ui_turn_breakdown: 2,
      },
      [`failed-with-usage`, `failed-without-usage`],
    ),
    defineTelemetryParityCase(
      `TDP06`,
      tdp06Operations,
      { send_btn: 2, agent_step: 1, message_completion: 1 },
      {
        plan_ttft: 1,
        perf_ui_first_token: 1,
        perf_ui_message_complete: 1,
        perf_ui_turn_breakdown: 1,
      },
      [`interrupted-terminal`, `stop-without-terminal-zero-completion`],
    ),
    defineTelemetryParityCase(
      `TDP07`,
      tdp07Operations,
      { send_btn: 1, agent_step: 2, message_completion: 1 },
      {
        plan_ttft: 1,
        perf_ui_first_token: 1,
        perf_ui_message_complete: 1,
        perf_ui_turn_breakdown: 1,
      },
      [`thought-before-text`, `tail-finalize`],
    ),
    defineTelemetryParityCase(
      `TDP08`,
      tdp08Operations,
      { send_btn: 4, agent_step: 5, message_completion: 4 },
      {
        plan_ttft: 4,
        perf_ui_first_token: 4,
        perf_ui_message_complete: 4,
        perf_ui_turn_breakdown: 4,
        perf_ui_tool_call_detail: 3,
      },
      [`tool-success`, `tool-failed`, `permission-wait`, `parented-child`],
    ),
    defineTelemetryParityCase(`TDP09`, tdp09Operations, { send_btn: 1, agent_step: 1, message_completion: 1 }, { plan_request: 2 }, [
      `terminal-after-detach`,
      `reopen-no-replay`,
      `background-ui-arms-zero`,
    ]),
    defineTelemetryParityCase(
      `TDP10`,
      tdp10Operations,
      { send_btn: 6, agent_step: 6, message_completion: 6 },
      {
        plan_ttft: 4,
        perf_ui_first_token: 6,
        perf_ui_message_complete: 6,
        perf_ui_turn_breakdown: 6,
        perf_ui_stream_stall: 1,
      },
      [
        `negative-ttft-clamped`,
        `no-token`,
        `stall-3000-zero`,
        `stall-3001-one`,
        `tool-clears-stall`,
        `split-pane-once`,
      ],
    ),
    defineTelemetryParityCase(`TDP11`, tdp11Operations, { context_compaction: 3 }, {}, [
      `three-terminal-statuses`,
      `nonterminal-zero`,
      `duplicate-operation-zero`,
      `background-zero`,
      `legacy-model-encoding`,
    ]),
    defineTelemetryParityCase(`TDP12`, tdp12Operations, {}, { plan_request: 10 }, [
      `five-network-statuses`,
      `foreground-background`,
      `accepted-queued-apiRetry-zero`,
      `hostname-only`,
    ]),
    defineTelemetryParityCase(
      `TDP13`,
      tdp13Operations,
      { send_btn: 4, agent_step: 4, message_completion: 4 },
      {
        plan_ttft: 1,
        perf_ui_first_token: 3,
        perf_ui_message_complete: 3,
        perf_ui_turn_breakdown: 3,
      },
      [`valid-ttft`, `negative-no-plan-ttft`, `missing-provider-no-plan-ttft`, `background-zero`],
    ),
    defineTelemetryParityCase(`TDP14`, tdp14Operations, {}, { chat_error_banner: 2 }, [
      `visible`,
      `suppressed-zero`,
      `same-key-once`,
      `new-key-new-event`,
    ]),
    defineTelemetryParityCase(`TDP15`, tdp15Operations, { assistant_message_feedback: 3 }, {}, [
      `like`,
      `dislike`,
      `toggle-none`,
      `command-failure-rollback`,
      `reopen-persisted`,
    ]),
    defineTelemetryParityCase(`TDP16`, [{ kind: `quota.assert` }], {}, {}, [
      `quota-banner`,
      `dismiss`,
      `blocking-and-nonblocking`,
      `entitlement-refresh`,
      `upgrade-context`,
      `purchase-events-pruned`,
    ]),
    defineTelemetryParityCase(`TDP17`, [{ kind: `captcha.assert` }, ...tdp17Operations], {}, { chat_error_banner: 1 }, [
      `visible-3007`,
      `exact-zcode-plan-provider`,
      `one-shot-header`,
      `accepted-duplicate-handled`,
      `failure-retryable`,
      `non-zcode-plan-skipped`,
    ]),
    defineTelemetryParityCase(
      `TDP18`,
      tdp18Operations,
      { send_btn: 1, agent_step: 1, message_completion: 1 },
      {
        plan_request: 2,
        plan_ttft: 1,
        perf_ui_first_token: 1,
        perf_ui_message_complete: 1,
        perf_ui_turn_breakdown: 1,
      },
      [`duplicate-live-once`, `initial-hydration-recovery-zero`, `reload-zero-replay`],
    ),
    defineTelemetryParityCase(
      `TDP19`,
      tdp19Operations,
      { send_btn: 2, agent_step: 2, message_completion: 2 },
      {
        plan_request: 4,
        plan_ttft: 2,
        perf_ui_first_token: 2,
        perf_ui_message_complete: 2,
        perf_ui_turn_breakdown: 2,
      },
      [`workspace-identity-isolated`, `remote-session-isolated`, `generation-disposed`, `web-noop`],
    ),
  ];
}

/** 原 a8t（js 212448）— 逐字 */
export const TELEMETRY_PARITY_CASES = new Map(buildTelemetryParityCases().map((entry) => [entry.caseId, entry]));

/* 原 js 212449：裸语句 `[...a8t.keys()];` — 逐字保留（无副作用，原样执行） */
[...TELEMETRY_PARITY_CASES.keys()];

/** 原 o8t（js 212450）— 逐字 */
export function telemetryParityCaseById(caseId: string) {
  let parityCase = TELEMETRY_PARITY_CASES.get(caseId);
  if (!parityCase) throw Error(`Unknown conversation telemetry parity case: ${caseId}`);
  return parityCase;
}

/** 原 s8t（js 212455）— 逐字 */
export function quotaParityAssertions() {
  let assertions: string[] = [],
    activeProviderId = planProviderIds.zaiStartPlan,
    dailyExhausted = resolveQuotaAssertion({ activeProviderId, snapshot: null, modelId: `glm-5.2`, serverQuotaExhausted: true });
  assertParityState(dailyExhausted.visible && dailyExhausted.kind === `daily-exhausted` && !dailyExhausted.dismissible, `quota:daily-exhausted`, assertions);
  let concurrentLimited = resolveQuotaAssertion({
    activeProviderId,
    snapshot: null,
    modelId: `glm-5.2`,
    serverConcurrentLimited: true,
    serverConcurrentLimitBusinessCode: `3010`,
    serverConcurrentLimitReason: `retry-exhausted-busy`,
  });
  assertParityState(
    concurrentLimited.kind === `concurrent-limit` && concurrentLimited.dismissible && !concurrentLimited.blocksSubmit && concurrentLimited.priority === 60,
    `quota:concurrent-dismissible-nonblocking`,
    assertions,
  );
  let providerLimited = resolveQuotaAssertion({
    activeProviderId,
    snapshot: null,
    modelId: `glm-5.2`,
    serverProviderLimitedBusinessCode: `1308`,
    serverProviderLimitedMessage: `[1308][余额不足][request-id]`,
  });
  return (
    assertParityState(
      providerLimited.kind === `provider-limited` && providerLimited.providerLimitedMessage === `余额不足`,
      `quota:provider-limited-message`,
      assertions,
    ),
    assertParityState(quotaDismissKey(concurrentLimited, `error-a`) !== quotaDismissKey(concurrentLimited, `error-b`), `quota:dismiss-key-instance`, assertions),
    assertions
  );
}

/** 原 c8t（js 212490）— 逐字 */
export function captchaParityAssertions() {
  let assertions: string[] = [],
    providerOfTaskMeta = captchaProviderOfTaskMeta({ taskMeta: { model: `${planProviderIds.zaiStartPlan}/glm-5.2` } }),
    assertionKeys = buildCaptchaAssertionKeys({
      workspacePath: `/workspace/app`,
      workspaceIdentity: `ssh://host/workspace/app`,
      sessionId: `captcha-session`,
      providerId: planProviderIds.zaiStartPlan,
      providerBusinessCode: `3007`,
      rootSourceCommandId: `root-command`,
    });
  assertParityState(
    providerOfTaskMeta === planProviderIds.zaiStartPlan && assertionKeys.includes(planProviderIds.zaiStartPlan) && assertionKeys.includes(`root-command`),
    `captcha:exact-provider-and-root-key`,
    assertions,
  );
  let gatekeeper = createCaptchaGatekeeper();
  (assertParityState(captchaAssertionStatus(gatekeeper, assertionKeys) === `started` && captchaAssertionStatus(gatekeeper, assertionKeys) === `in-flight`, `captcha:in-flight-deduped`, assertions),
    recordCaptchaFailure(gatekeeper, assertionKeys, false),
    assertParityState(captchaAssertionStatus(gatekeeper, assertionKeys) === `started`, `captcha:failure-retryable`, assertions),
    recordCaptchaFailure(gatekeeper, assertionKeys, true));
  let decisionEntry = (status: string) => ({ commandId: `captcha-${status}`, status, revisionAtDecision: 1 });
  return (
    assertParityState(
      captchaAssertionStatus(gatekeeper, assertionKeys) === `handled` && isCaptchaDecisionHandled(decisionEntry(`accepted`)) && isCaptchaDecisionHandled(decisionEntry(`duplicate`)),
      `captcha:accepted-duplicate-handled`,
      assertions,
    ),
    assertions
  );
}

/** 原 X9（js 212520）— 逐字 */
export function assertParityState(condition: boolean, label: string, assertions: string[]) {
  if (!condition) throw Error(`conversation telemetry parity state assertion failed: ${label}`);
  assertions.push(label);
}

/** 原 l8t（js 212523）— 逐字 */
export function exposeTelemetryParityE2E(options: { platform: PlatformService; isDesktop: boolean }) {
  if (!options.isDesktop || !isTelemetryEnabled()) return () => void 0;
  let handle = { variant: `current`, run: (caseId: string) => runTelemetryParityCase(options.platform, caseId) };
  return (
    (window.__zcodeConversationTelemetryParityE2E = handle),
    () => {
      window.__zcodeConversationTelemetryParityE2E === handle &&
        delete window.__zcodeConversationTelemetryParityE2E;
    }
  );
}

/** 原 u8t（js 212534）— 逐字 */
export async function runTelemetryParityCase(platform: PlatformService, caseId: string) {
  let parityCase = telemetryParityCaseById(caseId);
  resetTelemetryParityState();
  let scopes = new Map<string, ParityScope>(),
    visibleErrorKeys = new Set<string>(),
    stateAssertions: string[] = [],
    getScope = (scopeName = `default`) => {
      let existing = scopes.get(scopeName);
      if (existing) return existing;
      let scope: ParityScope = { now: 0, sequence: 0, foregroundOwners: new Map(), supervisor: void 0 as unknown as ConversationTelemetrySupervisor };
      return (
        (scope.supervisor = new ConversationTelemetrySupervisor({
          platform: platform as unknown as TelemetryPlatform,
          workspaceScopeKey: `telemetry-parity\u0000${caseId}\u0000${scopeName}`,
          now: () => scope.now,
        })),
        scopes.set(scopeName, scope),
        scope
      );
    };
  try {
    for (let operation of parityCase.operations)
      await applyTelemetryParityOperation({
        caseId,
        getScope,
        operation,
        platform,
        stateAssertions,
        visibleErrorKeys,
      });
    return (
      await Promise.all([...scopes.values()].map((scope) => scope.supervisor.flushReportsForTest())),
      {
        caseId,
        minimumArmsInventory: parityCase.minimumArmsInventory,
        minimumReportInventory: parityCase.minimumReportInventory,
        operationCount: parityCase.operations.length,
        proof: parityCase.proof,
        stateAssertions,
      }
    );
  } finally {
    for (let scope of scopes.values()) (await scope.supervisor.flushReportsForTest(), scope.supervisor.dispose());
  }
}

interface ParityScope {
  now: number;
  sequence: number;
  foregroundOwners: Map<string, Record<string, unknown>>;
  supervisor: ConversationTelemetrySupervisor;
  [key: string]: any;
}
interface ParityOperationContext {
  caseId: string;
  getScope: (scopeName?: string) => ParityScope;
  operation: any;
  /** A1-R9 精化：TelemetryPlatformLike → TelemetryPlatform（canonical 型面，'./services'
   *  已导入）。bundle 真形：d8t 之 context.platform 均自 u8t/f8t 传入（PlatformService
   *  实体或 f8t noopPlatform 双法具足），reportTelemetryEvent/reportArmsCustomEvent
   *  必选；1726/1768 调用点（xw 改指 reportTelemetry）实测通过。 */
  platform: TelemetryPlatform;
  stateAssertions: string[];
  visibleErrorKeys: Set<string>;
}

/** 原 d8t（js 212580）— 逐字 */
export async function applyTelemetryParityOperation(context: ParityOperationContext) {
  let { operation } = context;
  if (operation.kind === `web.noop`) {
    (await runTelemetryParityWebNoop(context, operation.operations), pushUniqueParityAssertion(context.stateAssertions, `web:no-final-output`));
    return;
  }
  if (operation.kind === `quota.assert`) {
    context.stateAssertions.push(...quotaParityAssertions());
    return;
  }
  if (operation.kind === `captcha.assert`) {
    context.stateAssertions.push(...captchaParityAssertions());
    return;
  }
  let scope = context.getScope(operation.scope);
  switch ((`now` in operation && (scope.now = operation.now), operation.kind)) {
    case `focus`:
      scope.supervisor.recordComposerFocus();
      return;
    case `text`:
      scope.supervisor.recordComposerTextChange(operation.value);
      return;
    case `seed`:
      scope.supervisor.acceptPromptSeed({
        sessionId: operation.sessionId,
        sourceCommandId: operation.commandId,
        sendTime: operation.now,
        extraDetail: {
          ask_mode: operation.askMode ?? ``,
          model_name: operation.modelName ?? ``,
          model_provider: operation.modelProvider ?? ``,
          ...(operation.providerHostname ? { provider_name: operation.providerHostname } : {}),
          agent: `glm`,
          plan_status: `unknown`,
          plan_product_id: ``,
        },
      });
      return;
    case `foreground.attach`: {
      let owner = scope.foregroundOwners.get(operation.owner) ?? {};
      (scope.foregroundOwners.set(operation.owner, owner), scope.supervisor.attachForeground(owner, operation.sessionId));
      return;
    }
    case `foreground.detach`: {
      let owner = scope.foregroundOwners.get(operation.owner);
      owner && scope.supervisor.attachForeground(owner, `detached:${operation.owner}`);
      return;
    }
    case `turn.started`:
      scope.supervisor.handleFact(buildParityEventFact(scope, operation, { kind: `turn.started`, executionKind: `agent` }));
      return;
    case `model.status`:
      scope.supervisor.handleFact(
        buildParityEventFact(scope, operation, {
          kind: `model.request.status`,
          requestId: operation.requestId,
          status: operation.status,
          providerId: operation.providerId,
          modelId: operation.modelId,
          providerHostname: operation.providerHostname,
          transport: `fetch`,
          querySource: `main_turn`,
          queryId: `${operation.requestId}-query`,
          attempt: 1,
          maxAttempts: 3,
          durationMs: operation.durationMs,
          reason: operation.reason,
          retryable: operation.retryable,
          statusCode: operation.statusCode,
          delayMs: operation.delayMs,
          nextAttempt: operation.nextAttempt,
          idleMs: operation.idleMs,
          timeoutMs: operation.timeoutMs,
        }),
      );
      return;
    case `chunk`:
      scope.supervisor.handleFact(
        buildParityEventFact(scope, operation, {
          kind: `stream.chunk`,
          channel: operation.channel,
          chunkLength: 1,
          firstChunk: operation.firstChunk,
          assistantMessageId: `${operation.commandId}-assistant`,
          parentToolCallId: operation.parentToolCallId,
        }),
      );
      return;
    case `permission`:
      scope.supervisor.handleFact(
        buildParityEventFact(scope, operation, {
          kind: `permission.lifecycle`,
          phase: operation.phase,
          requestId: operation.requestId,
          toolCallId: operation.toolCallId,
          toolName: `Bash`,
          decision: operation.decision,
        }),
      );
      return;
    case `tool`:
      scope.supervisor.handleFact(
        buildParityEventFact(scope, operation, {
          kind: `tool.lifecycle`,
          phase: operation.phase,
          toolCallId: operation.toolCallId,
          toolName: operation.toolName,
          errorCode: operation.errorCode,
          errorMessage: operation.errorMessage,
          parentToolCallId: operation.parentToolCallId,
          performance: operation.performance,
        }),
      );
      return;
    case `usage`:
      scope.supervisor.handleFact(
        buildParityEventFact(scope, operation, {
          kind: `usage.delta`,
          inputTokens: operation.inputTokens,
          outputTokens: operation.outputTokens,
          totalTokens: operation.inputTokens + operation.outputTokens,
          reasoningTokens: operation.reasoningTokens ?? 0,
          cacheReadTokens: operation.cacheReadTokens ?? 0,
          cacheWriteTokens: operation.cacheWriteTokens ?? 0,
        }),
      );
      return;
    case `terminal`:
      scope.supervisor.handleFact(
        buildParityEventFact(scope, operation, {
          kind: `turn.terminal`,
          status: operation.status,
          errorCode: operation.errorCode,
          errorMessage: operation.errorMessage,
        }),
      );
      return;
    case `compaction`:
      scope.supervisor.handleFact({
        version: 1,
        eventId: operation.eventId,
        eventSeq: scope.sequence++,
        occurredAt: operation.now,
        sessionId: operation.sessionId,
        kind: `compaction.terminal`,
        operationId: operation.operationId,
        summaryMessageId: operation.summaryMessageId,
        status: operation.status,
        trigger: operation.trigger,
        compactReason: operation.compactReason,
        reason: operation.reason,
        attempt: 1,
        startedAt: operation.startedAt,
        endedAt: operation.endedAt,
        preCompactTokenCount: operation.preCompactTokenCount,
        postCompactTokenCount: operation.postCompactTokenCount,
        truePostCompactTokenCount: operation.truePostCompactTokenCount,
        modelName: operation.modelName,
        modelProvider: operation.modelProvider,
      });
      return;
    case `visible.error`:
      if (operation.suppressed || context.visibleErrorKeys.has(operation.errorKey)) return;
      (context.visibleErrorKeys.add(operation.errorKey),
        scope.supervisor.reportVisibleChatError({
          errorKey: operation.errorKey,
          displayMessage: operation.displayMessage,
          error: {
            code: operation.code,
            message: operation.displayMessage,
            traceId: operation.traceId,
            taskId: operation.sessionId,
            detail: operation.detail,
          },
        }));
      return;
    case `feedback`:
      await trackTelemetryEvent(
        context.platform,
        {
          elementName: `assistant_message_feedback`,
          eventRegion: `chat`,
          eventType: `ck`,
          eventExtraDetail: { reaction: operation.reaction },
          talkId: operation.sessionId,
          messageId: operation.messageId,
        },
        `conversation-telemetry-parity-e2e`,
      );
      return;
    case `scope.dispose`:
      (await scope.supervisor.flushReportsForTest(), scope.supervisor.dispose());
      return;
  }
}

/** 原 f8t（js 212775）— 逐字 */
export async function runTelemetryParityWebNoop(context: ParityOperationContext, operations: unknown[]) {
  let noopPlatform = { reportTelemetryEvent: async () => void 0, reportArmsCustomEvent: async () => void 0 },
    scopes = new Map<string, ParityScope>(),
    getScope = (scopeName = `web`) => {
      let existing = scopes.get(scopeName);
      if (existing) return existing;
      let scope: ParityScope = { now: 0, sequence: 0, foregroundOwners: new Map(), supervisor: void 0 as unknown as ConversationTelemetrySupervisor };
      return (
        (scope.supervisor = new ConversationTelemetrySupervisor({
          platform: noopPlatform,
          workspaceScopeKey: `telemetry-parity\u0000${context.caseId}\u0000web\u0000${scopeName}`,
          now: () => scope.now,
        })),
        scopes.set(scopeName, scope),
        scope
      );
    };
  setTelemetryPlatform(null);
  try {
    for (let operation of operations) await applyTelemetryParityOperation({ ...context, getScope, operation, platform: noopPlatform });
    await Promise.all([...scopes.values()].map((scope) => scope.supervisor.flushReportsForTest()));
  } finally {
    for (let scope of scopes.values()) (await scope.supervisor.flushReportsForTest(), scope.supervisor.dispose());
    setTelemetryPlatform(context.platform);
  }
}

/** 原 p8t（js 212803）— 逐字 */
export function pushUniqueParityAssertion(assertions: string[], label: string) {
  assertions.includes(label) || assertions.push(label);
}

/** 原 Z9（js 212806）— 逐字 */
export function buildParityEventFact(scope: ParityScope, operation: any, patch: Partial<AgentFact> & { kind: string }): AgentFact {
  return {
    version: 1,
    eventId: operation.eventId,
    eventSeq: scope.sequence++,
    occurredAt: operation.now,
    sessionId: operation.sessionId,
    ...(operation.commandId ? { sourceCommandId: operation.commandId } : {}),
    ...(operation.turnId ? { turnId: operation.turnId } : {}),
    ...patch,
  };
}

/* ============================================================================
 * §L. 远控任务同步桥 / 图标常量（原 js 212817–212877）
 * ==========================================================================*/

/** 原 m8t（js 212817）— 逐字（g8t LucideProvider strokeWidth） */
export const APP_ROOT_ICON_STROKE_WIDTH = 1.5;

/** 原 h8t（js 212818 / jsx 169171）— 逐字 */
export function WebRemoteControlTaskSyncBridge({
  syncWebRemoteControlTasks,
  workspaceTabs,
}: {
  syncWebRemoteControlTasks: (tasks: unknown[]) => void;
  workspaceTabs: WorkspaceTab[];
}) {
  let workspaces = useTaskStore((state) => state.workspaces),
    timelineList = useTaskListItems({
      kind: `timeline`,
      workspaceTabs,
      sortBy: `updated`,
      searchQuery: ``,
      expanded: true,
      collapsedLimit: 100,
    }),
    pinnedList = useTaskListItems({
      kind: `pinned`,
      workspaceTabs,
      sortBy: `updated`,
      searchQuery: ``,
      expanded: true,
      collapsedLimit: 100,
    }),
    archivedList = useTaskListItems({
      kind: `archived`,
      workspaceTabs,
      sortBy: `updated`,
      searchQuery: ``,
      expanded: true,
      collapsedLimit: 100,
    }),
    mergedTasks = (0, React.useMemo)(() => {
      let runtimeByWorkspaceKey = taskRuntimeByWorkspaceKey(workspaces),
        pinnedItems = mapTasksToListItems({ workspaceTabs, tasks: pinnedList.items, taskRuntimeByWorkspaceKey: runtimeByWorkspaceKey, pinned: true }),
        timelineItems = mapTasksToListItems({ workspaceTabs, tasks: timelineList.items, taskRuntimeByWorkspaceKey: runtimeByWorkspaceKey }),
        archivedItems = mapTasksToListItems({ workspaceTabs, tasks: archivedList.items, taskRuntimeByWorkspaceKey: runtimeByWorkspaceKey, archived: true });
      return [...pinnedItems, ...timelineItems, ...archivedItems].sort((left, right) =>
        right.updatedAt === left.updatedAt
          ? right.createdAt === left.createdAt
            ? right.taskId.localeCompare(left.taskId)
            : right.createdAt - left.createdAt
          : right.updatedAt - left.updatedAt,
      );
    }, [archivedList.items, pinnedList.items, timelineList.items, workspaces, workspaceTabs]),
    canSync = canSyncWebRemoteTasks({
      archivedLoading: archivedList.loading,
      enabled: true,
      pinnedLoading: pinnedList.loading,
      timelineLoading: timelineList.loading,
    });
  return (
    (0, React.useEffect)(() => {
      if (!canSync) {
        logDeferredWebRemoteSync(logger, {
          pinnedLoading: pinnedList.loading,
          archivedLoading: archivedList.loading,
          timelineLoading: timelineList.loading,
        });
        return;
      }
      syncWebRemoteControlTasks(mergedTasks);
    }, [archivedList.loading, pinnedList.loading, canSync, syncWebRemoteControlTasks, mergedTasks, timelineList.loading]),
    null
  );
}

/* ============================================================================
 * §M. App 根 provider 树（原 g8t，js 212878–212904 / jsx 169433）
 * ==========================================================================*/

/** 原 g8t — 逐字（入口 chunk 以 `a` 别名消费：ZCodeApp） */
export function ZCodeApp(props: {
  services: ServicesBundle;
  platform: PlatformService;
  isDesktop: boolean;
  isMacDesktop: boolean;
  isWindowsDesktop: boolean;
  webRemoteControlFeatureEnabled: boolean;
  [key: string]: any;
}) {
  return (
    <LucideProvider strokeWidth={APP_ROOT_ICON_STROKE_WIDTH}>
      <TooltipProvider>
        <ServicesProvider services={props.services}>
          <PlatformProvider platform={props.platform}>
            <StoreProvider broadcastService={props.services.broadcastService} initialIsRestoringOAuthSession={true}>
              <TabStoreProvider>
                <DiffsWorkerPoolProvider>
                  <WebRemoteControlFeatureGate enabled={props.webRemoteControlFeatureEnabled}>
                    <CodingPlanUpgradeDialogProvider>
                      <CaptchaHostContainer />
                      <AppRootContent {...props} />
                    </CodingPlanUpgradeDialogProvider>
                  </WebRemoteControlFeatureGate>
                </DiffsWorkerPoolProvider>
              </TabStoreProvider>
            </StoreProvider>
          </PlatformProvider>
        </ServicesProvider>
      </TooltipProvider>
    </LucideProvider>
  );
}

/* ============================================================================
 * §N. App 根内容（原 _8t，js 212905–213553 / jsx 169450）★OFFLINE-PATCH-002
 * ==========================================================================*/

/** 原 _8t — 逐字（含 OFFLINE-PATCH-002 与 [boot-flags]/[boot-restore-pre]/[boot-restore] console.log） */
export function AppRootContent({
  services,
  platform,
  initialWorkspaceAbsPath,
  unavailableWorkspacePath,
  initialWorkspaceIdentity,
  initialWorkspacePurpose,
  initialTaskId,
  isDesktop,
  isMacDesktop,
  isWindowsDesktop,
  restoreSession = true,
  supportsSettings = true,
  allowOpenWorkspace = true,
  preferDirectoryBrowser,
  supportsEmbeddedBrowser,
  allowRemoteWorkspace = true,
  webRemoteControlWorkspaceSwitcher,
  initialWebRemoteControlMobileNavigationIntent,
  initialWebRemoteControlWorkspaceList,
  webRemoteControlTerminalTransportState,
  initialWorkspaceLoadingFallback,
}: {
  services: ServicesBundle;
  platform: PlatformService;
  initialWorkspaceAbsPath?: string | null;
  unavailableWorkspacePath?: string;
  initialWorkspaceIdentity?: string | null;
  initialWorkspacePurpose?: string | null;
  initialTaskId?: string | null;
  isDesktop: boolean;
  isMacDesktop: boolean;
  isWindowsDesktop: boolean;
  restoreSession?: boolean;
  supportsSettings?: boolean;
  allowOpenWorkspace?: boolean;
  preferDirectoryBrowser?: boolean;
  supportsEmbeddedBrowser?: boolean;
  allowRemoteWorkspace?: boolean;
  webRemoteControlWorkspaceSwitcher?: unknown;
  initialWebRemoteControlMobileNavigationIntent?: unknown;
  initialWebRemoteControlWorkspaceList?: unknown;
  webRemoteControlTerminalTransportState?: unknown;
  initialWorkspaceLoadingFallback?: React.ReactNode;
}) {
  ((0, React.useEffect)(
    () => (
      setArmsReportPlatform(platform),
      setTelemetryReportPlatform(platform),
      setTelemetryPlatform(isDesktop ? platform : null),
      () => {
        (setArmsReportPlatform(null), setTelemetryReportPlatform(null), setTelemetryPlatform(null));
      }
    ),
    [isDesktop, platform],
  ),
    (0, React.useEffect)(() => exposeTelemetryParityE2E({ platform, isDesktop: isDesktop === true }), [isDesktop, platform]),
    (0, React.useEffect)(
      () => () => {
        disposeStartupServiceRegistry();
      },
      [],
    ));
  let { intl, locale } = useIntlContext(),
    theme = useSettingsStore((state) => state.theme),
    user = useSettingsStore((state) => state.user),
    isRestoringOAuthSession = useSettingsStore((state) => state.isRestoringOAuthSession),
    setUser = useSettingsStore((state) => state.setUser),
    setIsRestoringOAuthSession = useSettingsStore((state) => state.setIsRestoringOAuthSession),
    setOAuthError = useSettingsStore((state) => state.setOAuthError),
    markOAuthSuccess = useSettingsStore((state) => state.markOAuthSuccess),
    { settings, refresh: refreshAppSettings, update: updateAppSettings } = useAppSettings(),
    [welcomeScreenReason, setWelcomeScreenReason] = (0, React.useState)<string | null>(null),
    [providerFamilyDomainMigrationComplete, setProviderFamilyDomainMigrationComplete] = (0, React.useState)(false),
    loginEntryRequest = useSettingsStore((state) => state.loginEntryRequest),
    [modelProviders, setModelProviders] = (0, React.useState)(() => getModelProvidersCached()),
    [modelProvidersHydrated, setModelProvidersHydrated] = (0, React.useState)(() => isModelProviderSnapshotHydrated()),
    [remoteConnectionOpen, setRemoteConnectionOpen] = (0, React.useState)(false),
    [remoteConnectionPreference, setRemoteConnectionPreference] = (0, React.useState)<{ preferredKind: string; preferredWslDistro: string } | null>(null),
    [directoryBrowserOpen, setDirectoryBrowserOpen] = (0, React.useState)(false),
    [remoteConnectionInProgress, setRemoteConnectionInProgress] = (0, React.useState)(false),
    [remoteConnectionFlowRequestId, setRemoteConnectionFlowRequestId] = (0, React.useState)<string | null>(null),
    [fallbackWorkspaceBootstrapping, setFallbackWorkspaceBootstrapping] = (0, React.useState)(false),
    { connectionLogs, resetConnectionLogs } = useRemoteConnectionLogsBridge(remoteConnectionFlowRequestId),
    [isBootstrappingInitialWorkspace, setIsBootstrappingInitialWorkspace] = (0, React.useState)(!!initialWorkspaceAbsPath),
    acknowledgedReleaseNotesVersionRef = (0, React.useRef)<string | null>(null),
    didSyncConnectionLogsRef = (0, React.useRef)(false),
    didStartFallbackBootstrapRef = (0, React.useRef)(false),
    isMountedRef = (0, React.useRef)(true),
    [workspaceSurfaceVisible, setWorkspaceSurfaceVisible] = (0, React.useState)(false);
  ((0, React.useEffect)(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  ),
    (0, React.useEffect)(() => {
      let subscription = services.broadcastService.onMessage((message) => {
        if (message.channel === `settings:app-runtime-preferences`) {
          let parsed = runtimePreferencesSchema.safeParse(message.payload);
          if (!parsed.success) {
            logger.warn(`[settings] 丢弃无效的运行时偏好广播`, { issues: parsed.error.issues });
            return;
          }
          (refreshAppSettings(),
            services.zcodeAgentService.syncAppRuntimePreferences(parsed.data).catch((error) => {
              logger.warn(`[settings] 同步跨窗口运行时偏好失败`, error);
            }),
            services.botsService.syncAppRuntimePreferences(parsed.data).catch((error) => {
              logger.warn(`[settings] 同步跨窗口 Bot 运行时偏好失败`, error);
            }));
          return;
        }
        if (message.channel === `code-comment:restore-preview`) {
          if (!isCodeCommentRestorePayload(message.payload) || !message.payload.id) return;
          codeCommentsStore.getState().restoreCommentFromAttachment({ ...message.payload, id: message.payload.id });
          return;
        }
        message.channel === `code-comment:remove-from-chat` &&
          isCodeCommentRemovePayload(message.payload) &&
          (normalizeCodeCommentRemovePayload(message.payload), codeCommentsStore.getState().removeCommentBySource(message.payload));
      });
      return () => {
        subscription.dispose();
      };
    }, [refreshAppSettings, services.botsService, services.broadcastService, services.zcodeAgentService]),
    (0, React.useEffect)(() => {
      settings &&
        (services.zcodeAgentService
          .syncAppRuntimePreferences({
            askUserQuestionAutoResolutionEnabled: settings.askUserQuestionAutoResolutionEnabled !== false,
          })
          .catch((error) => {
            logger.warn(`[settings] 初始化运行时偏好失败`, error);
          }),
        services.botsService
          .syncAppRuntimePreferences({
            askUserQuestionAutoResolutionEnabled: settings.askUserQuestionAutoResolutionEnabled !== false,
          })
          .catch((error) => {
            logger.warn(`[settings] 初始化 Bot 运行时偏好失败`, error);
          }));
    }, [settings?.askUserQuestionAutoResolutionEnabled, services.botsService, services.zcodeAgentService]),
    (0, React.useEffect)(() => {
      let handleSnapshot = (providers: ModelProvider[]) => { // A1-R11 型缝精化：hM 监听器收注册表真形 ModelProvider[]（对 2131 ModelProviderRecord[] 面可赋）
          (setModelProviders(providers), setModelProvidersHydrated(isModelProviderSnapshotHydrated()));
        },
        unsubscribe = subscribeModelProviders(handleSnapshot);
      return (handleSnapshot(getModelProvidersCached()), unsubscribe);
    }, []));
  let tabs = useTabStoreSelector((state) => state.tabs),
    workspaceTabs = (0, React.useMemo)(() => tabs.filter(isWorkspaceKindTab), [tabs]),
    activeTabId = useTabStoreSelector((state) => state.activeTabId),
    activeWorkspacePath = useTabStoreSelector((state) => state.activeWorkspacePath),
    activeWorkspaceIdentity = useTabStoreSelector((state) => state.activeWorkspaceIdentity),
    conversationBootstrapWorkspacePath = useTabStoreSelector((state) => {
      let activeTab = state.activeTabId ? state.tabs.find((tab) => tab.id === state.activeTabId) : null;
      if (!(
        !activeTab ||
        !isWorkspaceKindTab(activeTab) ||
        activeTab.remoteSessionId ||
        activeTab.remoteTarget ||
        activeTab.workspaceIdentity ||
        activeTab.workspacePurpose === `conversation`
      ))
        return activeTab.workspacePath;
    }),
    totalUnreadTaskCount = useTaskStore((state) => countTotalUnreadTasks(state.workspaces as Record<string, WorkspaceTaskState>)),
    addTab = useTabStoreSelector((state) => state.addTab),
    activateTabByPath = useTabStoreSelector((state) => state.activateTabByPath),
    tabStoreApi = useTabStoreApi(),
    webRemoteControlFeatureEnabled = useWebRemoteControlFeatureFlag(),
    webRemoteControlSession = useWebRemoteControlSession({ enabled: !!(webRemoteControlFeatureEnabled && isDesktop && platform.syncWebRemoteControlTasks) }),
    webRemoteControlSessionActive = webRemoteControlSession.status === `running` || webRemoteControlSession.status === `active`,
    canSyncWebRemoteSnapshot = !!(webRemoteControlFeatureEnabled && webRemoteControlSessionActive && isDesktop && platform.syncWebRemoteControlTasks),
    refreshModelProviderSnapshot = useModelProviderSnapshotRefresher(services);
  (0, React.useEffect)(() => {
    let cancelled = false;
    return (
      (async () => {
        try {
          await migrateProviderFamilyDomain(services);
        } catch (error) {
          logger.warn(`[Root] provider family domain 迁移失败，继续启动`, { error });
        } finally {
          if (!cancelled) {
            setProviderFamilyDomainMigrationComplete(true);
            try {
              (await refreshAppSettings(), await refreshModelProviderSnapshot({ force: true }));
            } catch (error) {
              logger.warn(`[Root] provider family domain 迁移后刷新状态失败`, { error });
            }
          }
        }
      })(),
      () => {
        cancelled = true;
      }
    );
  }, [refreshAppSettings, refreshModelProviderSnapshot, services]);
  let preferDirectoryBrowserFlag = !!preferDirectoryBrowser,
    supportsEmbeddedBrowserResolved = supportsEmbeddedBrowser ?? !!isDesktop,
    resolvingOAuthSession = isRestoringOAuthSession,
    providerStartupHydrationPending = isProviderStartupHydrationPending({ providerFamilyDomainMigrationComplete: providerFamilyDomainMigrationComplete, modelProviderSnapshotHydrated: modelProvidersHydrated }),
    isWebRemoteControlRoot = !!webRemoteControlWorkspaceSwitcher,
    { startupCheckCompleted: providerAvailabilityStartupCheckCompleted } = useProviderAvailabilityLoginGuard({
      enabled: isProviderAvailabilityGateEnabled({ isWebRemoteControlRoot }),
      user,
      isRestoringOAuthSession: resolvingOAuthSession || providerStartupHydrationPending,
      providerFamilyDomain: settings?.providerFamilyDomain,
      modelProviders,
      modelProvidersHydrated,
      refreshModelProviderSnapshot,
      setLoginEntryOpen: (open) => {
        setWelcomeScreenReason((current) => (open ? `startup-provider-required` : current === `startup-provider-required` ? null : current));
      },
    }),
    providerStartupSyncPending = isProviderStartupSyncPending({
      isWebRemoteControlRoot,
      providerStartupSyncPending: providerStartupHydrationPending,
      providerAvailabilityStartupCheckCompleted,
    }),
    startupProviderRequired = welcomeScreenReason === `startup-provider-required`,
    // OFFLINE-PATCH-002: 离线时 auth/provider 校验不 resolve，强制放行初始 workspace bootstrap。
    canBootstrapInitialWorkspaceGate = true;
  /* 原 JSON 键为混淆名 Le/Ve/He/Ue/Fe/Ie/Re/Be — 逐字保留键名，值以语义名代入 */
  console.log(`[boot-flags]`, JSON.stringify({ Le: resolvingOAuthSession, Ve: providerStartupSyncPending, He: startupProviderRequired, Ue: canBootstrapInitialWorkspaceGate, Fe: preferDirectoryBrowserFlag, Ie: supportsEmbeddedBrowserResolved, Re: providerStartupHydrationPending, Be: providerAvailabilityStartupCheckCompleted }));
  ((0, React.useEffect)(() => {
    registerBaseServices(services);
  }, [services]),
    useBotsTaskBroadcastBridge(services, tabStoreApi));
  let handleOpenRemoteConnection = (0, React.useCallback)((request: { preferredKind: string; preferredWslDistro: string }) => {
      (setRemoteConnectionPreference(request ?? null), setRemoteConnectionOpen(true));
    }, []),
    openDirectoryBrowser = (0, React.useCallback)(() => {
      setDirectoryBrowserOpen(true);
    }, []),
    handleReauthenticationRequired = (0, React.useCallback)(() => {
      setWelcomeScreenReason(`session-expired`);
    }, []),
    {
      setWorkspaceActionError,
      startDraftInWorkspace,
      startNewTaskFromActiveWorkspace,
      handleLogout,
      handleSelectProject,
      handleSelectConversationWorkspace,
      handleResolveConversationWorkspace,
      handleEnsureConversationWorkspace,
      handleCreateConversationTask,
      handleOpenWorkspace,
      handleOpenFolderFromWorkspaceMenu,
      handleCreateScratchWorkspace,
      handleCreateTask,
      handleBackFromSettings,
    } = useWorkspaceActions({
      intl,
      platform,
      services,
      tabStoreApi,
      addTab,
      activeWorkspacePath,
      activeWorkspaceIdentity,
      supportsSettings,
      allowOpenWorkspace,
      preferDirectoryBrowser: preferDirectoryBrowserFlag,
      openDirectoryBrowser,
      refreshModelProviderSnapshot,
      updateAppSettings,
      setOAuthError,
      setUser,
      onProviderFamilyDomainClearedAfterLogout: () => {
        setWelcomeScreenReason(`logout-provider-required`);
      },
      userId: user?.id,
      onOpenRemoteConnection: allowRemoteWorkspace ? handleOpenRemoteConnection : void 0,
      workbenchGroupClientMode: isWebRemoteControlRoot ? `web-remote-replayable` : `desktop-continuous`,
    }),
    handleWorkspaceActivated = (0, React.useCallback)(
      ({ workspacePath, workspaceIdentity }: { workspacePath: string; workspaceIdentity?: string | null }) => {
        startDraftInWorkspace(workspacePath, workspaceIdentity);
      },
      [startDraftInWorkspace],
    ),
    {
      remoteWorkspaceSessions,
      reconnectingRemoteWorkspaceKeys,
      remoteWorkspaceErrorByWorkspaceKey,
      reconnectingRemoteWorkspaceLogsByWorkspaceKey,
      buildPersistedTabPatch,
      restorePersistedSession,
      handleCancelRemoteProject,
      handleSelectRemoteProject,
      handleConnectRemote,
      handleReconnectRemoteWorkspace,
      handleRemoteWorkspaceTabsClosed,
    } = useRemoteWorkspaceOrchestrator({
      intl,
      services,
      platform,
      supportsSettings,
      allowRemoteWorkspace,
      ensureConversationWorkspaceOnRestore: isDesktop && restoreSession && !initialWorkspaceIdentity,
      deferInactiveWorkspaceRestore: isDesktop && restoreSession && !initialWorkspaceIdentity,
      unavailableWorkspacePath,
      tabStoreApi,
      activateTabByPath,
      addTab,
      onWorkspaceActivated: handleWorkspaceActivated,
    });
  ((0, React.useEffect)(() => {
    if (platform.onWebRemoteControlReconnectWorkspace)
      return platform.onWebRemoteControlReconnectWorkspace(async (request) => {
        try {
          return (
            await handleReconnectRemoteWorkspace(request.workspaceKey, {
              activateWorkspaceAfterReconnect: false,
              showErrorToast: false,
              throwOnFailure: true,
            }),
            { requestId: request.requestId, workspaceKey: request.workspaceKey, success: true }
          );
        } catch (error) {
          return {
            requestId: request.requestId,
            workspaceKey: request.workspaceKey,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      });
  }, [handleReconnectRemoteWorkspace, platform]),
    (0, React.useEffect)(() => {
      setActiveWorkspacePathE2E(activeWorkspacePath);
    }, [activeWorkspacePath]),
    (0, React.useEffect)(() => {
      activeWorkspacePath && setWorkspaceActionError(null);
    }, [activeWorkspacePath, setWorkspaceActionError]));
  let {
    isRestoring,
    hasCompletedInitialRestore,
    hasCompletedFullRestore,
  } = (console.log(`[boot-restore-pre]`), useSessionRestoreBridge({
    settingService: supportsSettings ? services.settingService : void 0,
    restoreSession: restoreSession && canBootstrapInitialWorkspaceGate,
    persistSession: restoreSession && canBootstrapInitialWorkspaceGate,
    restorePersistedSession,
    buildPersistPatch: buildPersistedTabPatch,
  }));
  (0, React.useEffect)(() => {
    !isDesktop ||
      !hasCompletedFullRestore ||
      syncRemoteTabsE2E(
        workspaceTabs.map((tab) => ({
          workspacePath: tab.workspacePath,
          ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}),
          ...(tab.remoteSessionId ? { remoteSessionId: tab.remoteSessionId } : {}),
        })),
      );
  }, [hasCompletedFullRestore, isDesktop, workspaceTabs]);
  /* 原 JSON 键为混淆名 bt/xt/fe/ce — 逐字保留键名，值以语义名代入 */
  console.log(`[boot-restore]`, JSON.stringify({ bt: hasCompletedInitialRestore, xt: hasCompletedFullRestore, fe: isBootstrappingInitialWorkspace, ce: fallbackWorkspaceBootstrapping }));
  let webRemoteControlTaskSyncBridge =
      hasCompletedFullRestore && canSyncWebRemoteSnapshot && platform.syncWebRemoteControlTasks
        ? (
            <WebRemoteControlTaskSyncBridge
              syncWebRemoteControlTasks={platform.syncWebRemoteControlTasks}
              workspaceTabs={workspaceTabs}
            />
          )
        : null,
    { tryRefresh, clearCredentials } = useOAuthCredentialsRefresher(),
    startupRenderBlocked = isStartupRenderBlocked({
      isDesktop,
      welcomeScreenOpen: !!welcomeScreenReason,
      isResolvingStartupAuthState: resolvingOAuthSession,
      isResolvingProviderStartupState: providerStartupSyncPending,
      isRestoring,
      isBootstrappingInitialWorkspace: isBootstrappingInitialWorkspace || fallbackWorkspaceBootstrapping,
    }),
    didReportLaunchMarksRef = (0, React.useRef)(false);
  ((0, React.useEffect)(() => {
    if (!shouldReportLaunchMarks({ isStartupRenderBlocked: startupRenderBlocked, welcomeScreenOpen: !!welcomeScreenReason, alreadyReported: didReportLaunchMarksRef.current }))
      return;
    didReportLaunchMarksRef.current = true;
    let launchMarks = readRendererLaunchMarks();
    !launchMarks ||
      !launchMarks.marks ||
      reportLaunchMarks({
        marks: launchMarks.marks,
        rendererStart: launchMarks.rendererStart,
        reactCommit: launchMarks.reactCommit,
        inputReady: Date.now(),
        sessionId: `launch-${launchMarks.marks.createdAt}`,
      });
  }, [startupRenderBlocked, welcomeScreenReason]),
    useRootPlatformBridge({
      initialWorkspaceAbsPath,
      initialWorkspaceIdentity,
      initialWorkspacePurpose,
      initialTaskId,
      canBootstrapInitialWorkspace: canBootstrapInitialWorkspaceGate && hasCompletedInitialRestore,
      addTab,
      setIsBootstrappingInitialWorkspace,
      platform,
      activateTabByPath,
      startDraftInWorkspace,
      startNewTaskFromActiveWorkspace,
      openWorkspace: handleOpenWorkspace,
      openWorkspacePath: (path) => {
        handleSelectProject(path);
      },
      setWorkspaceActionError,
      allowOpenWorkspace,
      isDesktop,
      locale,
      tabs,
      reconnectingRemoteWorkspaceKeys,
      remoteWorkspaceErrorByWorkspaceKey,
      totalUnreadTaskCount,
      webRemoteControlFeatureEnabled,
      webRemoteControlSessionActive,
      hasCompletedFullTabRestore: hasCompletedFullRestore,
      intl,
    }),
    (0, React.useEffect)(() => {
      if (platform.onCloseActiveContextRequest)
        return platform.onCloseActiveContextRequest(() => {
          let event = new Event(CLOSE_ACTIVE_CONTEXT_EVENT, { cancelable: true });
          (window.dispatchEvent(event), !event.defaultPrevented && platform.executeDesktopCommand(DESKTOP_COMMANDS.CloseWindow));
        });
    }, [platform]),
    useOAuthSessionBootstrap({
      platform,
      services,
      refreshModelProviderSnapshot,
      refreshAppSettings,
      setUser,
      setIsRestoringOAuthSession,
      setOAuthError,
      markOAuthSuccess,
      onReauthenticationRequired: handleReauthenticationRequired,
    }),
    (0, React.useEffect)(
      () =>
        platform.onPostUpdateReleaseNotes((info) => {
          (logger.info(`[Root] 收到更新说明，改为静默确认`, { version: info.version, title: info.title }),
            acknowledgedReleaseNotesVersionRef.current !== info.version &&
              ((acknowledgedReleaseNotesVersionRef.current = info.version),
              platform
                .acknowledgePostUpdateReleaseNotes(info.version)
                .then(() => {
                  logger.info(`[Root] 更新说明已静默确认`, { version: info.version });
                })
                .catch((error) => {
                  logger.error(`[Root] 更新说明静默确认失败`, { version: info.version, error });
                })
                .finally(() => {
                  acknowledgedReleaseNotesVersionRef.current === info.version && (acknowledgedReleaseNotesVersionRef.current = null);
                })));
        }),
      [platform],
    ));
  let activeTab = activeTabId ? (tabs.find((tab) => tab.id === activeTabId) ?? null) : null,
    activeWorkspaceTab = activeTab && isWorkspaceKindTab(activeTab) ? activeTab : null,
    isSettingsTabActive = activeTab ? isSettingsTab(activeTab) : false,
    {
      workspaceShellPath,
      workspaceIdentity,
      workspaceRemoteSessionId,
    } = resolveActiveWorkspaceShellProps({ activeWorkspaceTab, activeWorkspacePath, activeWorkspaceIdentity }),
    workspaceScopedServices = useWorkspaceServices(workspaceShellPath, workspaceRemoteSessionId, workspaceIdentity),
    shouldShowWorkspaceSurface = !!(!startupRenderBlocked && !welcomeScreenReason && (workspaceShellPath || isSettingsTabActive));
  ((0, React.useEffect)(() => {
    shouldShowWorkspaceSurface && setWorkspaceSurfaceVisible(true);
  }, [shouldShowWorkspaceSurface]),
    useTitleBarThemeSync({ enabled: workspaceSurfaceVisible, isDesktop, platform, theme }),
    useRemoteTabSessionDisposal({ tabs, activeWorkspaceTab, platform, onRemoteWorkspaceTabsClosed: handleRemoteWorkspaceTabsClosed }),
    (0, React.useEffect)(() => {
      isResolvingStartupAuthState({
        isResolvingStartupAuthState: resolvingOAuthSession,
        isResolvingProviderStartupState: providerStartupSyncPending,
        isRestoring,
        isBootstrappingInitialWorkspace,
      }) ||
        startupProviderRequired ||
        workspaceShellPath ||
        isSettingsTabActive ||
        !allowOpenWorkspace ||
        didStartFallbackBootstrapRef.current ||
        ((didStartFallbackBootstrapRef.current = true),
        setFallbackWorkspaceBootstrapping(true),
        services.fileService
          .ensureConversationWorkspace()
          .then((workspace) => {
            needsFallbackWorkspaceBootstrap({
              isMounted: isMountedRef.current,
              activeWorkspacePath: tabStoreApi.getState().activeWorkspacePath,
            }) && handleSelectConversationWorkspace(workspace.path);
          })
          .catch((error) => {
            isMountedRef.current &&
              (logger.error(`[Root] 启动兜底创建默认 workspace 失败`, { error }),
              setWorkspaceActionError(error instanceof Error ? error.message : String(error)));
          })
          .finally(() => {
            isMountedRef.current && setFallbackWorkspaceBootstrapping(false);
          }));
    }, [allowOpenWorkspace, handleSelectConversationWorkspace, isBootstrappingInitialWorkspace, providerStartupSyncPending, resolvingOAuthSession, isRestoring, isSettingsTabActive, startupProviderRequired, services.fileService, setWorkspaceActionError, tabStoreApi, workspaceShellPath]),
    (0, React.useEffect)(() => {
      workspaceShellPath && logger.info(`[Root] settings view ${isSettingsTabActive ? `open` : `closed`} workspace=${workspaceShellPath}`);
    }, [isSettingsTabActive, workspaceShellPath]),
    (0, React.useEffect)(() => {
      loginEntryRequest && setWelcomeScreenReason(`provider-request`);
    }, [loginEntryRequest]));
  let handleLoginManual = () => {
      setWelcomeScreenReason(`manual-login`);
    },
    handleLoginComplete = (0, React.useCallback)(
      async (reason: string) => {
        if ((await refreshAppSettings(), welcomeScreenReason !== `startup-provider-required` || workspaceShellPath || !allowOpenWorkspace)) {
          setWelcomeScreenReason(null);
          return;
        }
        try {
          await handleEnsureConversationWorkspace();
        } catch (error) {
          logger.error(`[Root] 登录后创建默认 workspace 失败`, { error, reason });
        } finally {
          setWelcomeScreenReason(null);
        }
      },
      [allowOpenWorkspace, handleEnsureConversationWorkspace, refreshAppSettings, welcomeScreenReason, workspaceShellPath],
    ),
    handleRemoteConnectionOpenChange = (0, React.useCallback)((open: boolean) => {
      (setRemoteConnectionOpen(open), open || setRemoteConnectionPreference(null));
    }, []),
    remoteConnectionDialog = allowRemoteWorkspace
      ? (
          <RemoteConnectionDialog
            onConnect={handleConnectRemote}
            onSelectProject={handleSelectRemoteProject}
            onCancelSession={handleCancelRemoteProject}
            localWorkspacePath={conversationBootstrapWorkspacePath}
            isWindowsDesktop={isWindowsDesktop}
            remoteWorkspaceSessions={remoteWorkspaceSessions}
            open={remoteConnectionOpen}
            onOpenChange={handleRemoteConnectionOpenChange}
            onFlowActiveChange={setRemoteConnectionInProgress}
            onFlowRequestIdChange={setRemoteConnectionFlowRequestId}
            preferredKind={remoteConnectionPreference?.preferredKind}
            preferredWslDistro={remoteConnectionPreference?.preferredWslDistro}
            hideTriggerWhenClosed={true}
          />
        )
      : null,
    directoryBrowserLayer = directoryBrowserOpen
      ? (
          <ScopeBoundary
            scope={`directory-browser`}
            resetKeys={[`directory-browser`]}
            variant={`silent`}
          >
            <DirectoryBrowserDialog
              services={services as unknown as BaseServices}
              onCancel={() => setDirectoryBrowserOpen(false)}
              onSelect={(path: string) => {
                (setDirectoryBrowserOpen(false), handleSelectProject(path));
              }}
            />
          </ScopeBoundary>
        )
      : null;
  (0, React.useEffect)(() => {
    (!didSyncConnectionLogsRef.current && remoteConnectionInProgress && resetConnectionLogs(), (didSyncConnectionLogsRef.current = remoteConnectionInProgress));
  }, [remoteConnectionInProgress, resetConnectionLogs]);
  let settingsViewProps = {
    isDesktop,
    isMacDesktop,
    isWindowsDesktop,
    isWebRemoteControl: !!webRemoteControlWorkspaceSwitcher,
    captionWorkspacePath: activeWorkspacePath as string | undefined,
    onBack: activeWorkspacePath ? handleBackFromSettings : void 0,
    onCreateTask: handleCreateTask,
    onOpenWorkspace: handleOpenWorkspace,
    allowOpenWorkspace,
    onLogin: user ? void 0 : handleLoginManual,
    onLogout: user ? handleLogout : void 0,
    user,
  };
  return startupRenderBlocked ? (
    <AppDialogHost>
      {webRemoteControlTaskSyncBridge}
      {remoteConnectionDialog}
      {directoryBrowserLayer}
      <RootStartupLoading label={intl.formatMessage({ id: `common.loading` })} />
    </AppDialogHost>
  ) : welcomeScreenReason ? (
    <AppDialogHost>
      {webRemoteControlTaskSyncBridge}
      {remoteConnectionDialog}
      {directoryBrowserLayer}
      <LoginEntryScreen onComplete={handleLoginComplete} />
    </AppDialogHost>
  ) : !workspaceShellPath && isSettingsTabActive ? (
    <AppDialogHost>
      {webRemoteControlTaskSyncBridge}
      {remoteConnectionDialog}
      {directoryBrowserLayer}
      <ScopeBoundary scope={`settings-page`} resetKeys={[`settings-root`]} variant={`panel`} className={`h-full`}>
        <SettingsView {...settingsViewProps} />
      </ScopeBoundary>
    </AppDialogHost>
  ) : !workspaceShellPath && !isDesktop && initialWorkspaceAbsPath && initialWorkspaceLoadingFallback ? (
    <AppDialogHost>
      {webRemoteControlTaskSyncBridge}
      {initialWorkspaceLoadingFallback}
      {directoryBrowserLayer}
    </AppDialogHost>
  ) : workspaceShellPath ? (
    <AppDialogHost>
      {webRemoteControlTaskSyncBridge}
      {remoteConnectionDialog}
      {directoryBrowserLayer}
      <RootWorkspaceContent
        workspaceScopedServices={workspaceScopedServices as unknown as ServicesBundle}
        baseFeedbackService={services.feedbackService}
        workspaceShellPath={workspaceShellPath}
        workspaceIdentity={workspaceIdentity}
        workspaceRemoteSessionId={workspaceRemoteSessionId}
        activeWorkspacePath={activeWorkspacePath}
        isSettingsTabActive={isSettingsTabActive}
        handleConnectRemote={handleConnectRemote}
        handleSelectRemoteProject={handleSelectRemoteProject}
        handleCancelRemoteProject={handleCancelRemoteProject}
        handleReconnectRemoteWorkspace={handleReconnectRemoteWorkspace}
        handleCreateTask={handleCreateTask}
        handleCreateConversationTask={handleCreateConversationTask}
        handleResolveConversationWorkspace={handleResolveConversationWorkspace}
        handleOpenWorkspace={handleOpenWorkspace}
        handleOpenFolderFromWorkspaceMenu={handleOpenFolderFromWorkspaceMenu}
        handleOpenRemoteWorkspace={allowRemoteWorkspace ? handleOpenRemoteConnection : void 0}
        handleCreateScratchWorkspace={handleCreateScratchWorkspace}
        remoteConnectionInProgress={remoteConnectionInProgress}
        remoteWorkspaceSessions={remoteWorkspaceSessions}
        allowRemoteWorkspace={allowRemoteWorkspace}
        handleBackFromSettings={handleBackFromSettings}
        handleLogout={user ? handleLogout : void 0}
        onLogin={user ? void 0 : handleLoginManual}
        user={user}
        reconnectingRemoteWorkspaceKeys={reconnectingRemoteWorkspaceKeys}
        remoteWorkspaceErrorByWorkspaceKey={remoteWorkspaceErrorByWorkspaceKey}
        reconnectingRemoteWorkspaceLogsByWorkspaceKey={reconnectingRemoteWorkspaceLogsByWorkspaceKey}
        remoteConnectionLogs={connectionLogs}
        allowOpenWorkspace={allowOpenWorkspace}
        webRemoteControlWorkspaceSwitcher={webRemoteControlWorkspaceSwitcher}
        initialWebRemoteControlMobileNavigationIntent={initialWebRemoteControlMobileNavigationIntent}
        initialWebRemoteControlWorkspaceList={initialWebRemoteControlWorkspaceList}
        webRemoteControlTerminalTransportState={webRemoteControlTerminalTransportState}
        isDesktop={isDesktop}
        isMacDesktop={isMacDesktop}
        isWindowsDesktop={isWindowsDesktop}
        supportsEmbeddedBrowser={supportsEmbeddedBrowserResolved}
      />
      <ScopeBoundary scope={`onboarding-dialog`} resetKeys={[workspaceIdentity?.trim() || workspaceShellPath]} variant={`silent`}>
        <OnboardingDialog
          workspacePath={workspaceShellPath}
          workspaceIdentity={workspaceIdentity}
          isDesktop={isDesktop}
        />
      </ScopeBoundary>
    </AppDialogHost>
  ) : remoteConnectionOpen || directoryBrowserOpen || webRemoteControlTaskSyncBridge ? (
    <AppDialogHost>
      {webRemoteControlTaskSyncBridge}
      {remoteConnectionOpen ? remoteConnectionDialog : null}
      {directoryBrowserLayer}
    </AppDialogHost>
  ) : null;
}

/* ============================================================================
 * §O. 启动音 / 遥测尾件（原 js 213901–213929）
 * ==========================================================================*/

/** 原 x8t（js 213901）— 逐字 */
export async function playStartupSound() {
  if (!isStartupSoundEnabled()) return;
  let audio = getNotificationAudio();
  if (audio)
    try {
      (audio.pause(), (audio.currentTime = 0), await audio.play());
    } catch {}
}

/** 原 S8t（js 213909）— 逐字 */
export const ARMS_E2E_EVENT_LIMIT = 200;

/** 原 C8t（js 213910）— 逐字 */
export function recordArmsCustomEventE2E(event: Record<string, any>, options: { enabled?: boolean; host?: { __zcodeArmsCustomEventsE2E?: Array<Record<string, unknown>> }; now?: () => number } = {}) {
  if (!(options.enabled ?? isTelemetryEnabled()) || (typeof window > `u` && !options.host)) return;
  let host = options.host ?? window,
    events = (host.__zcodeArmsCustomEventsE2E ??= []);
  (events.push({
    ...event,
    ...(event.properties ? { properties: { ...event.properties } } : {}),
    recordedAt: (options.now ?? Date.now)(),
  }),
    events.length > ARMS_E2E_EVENT_LIMIT && events.splice(0, events.length - ARMS_E2E_EVENT_LIMIT));
}

/** 原 w8t（js 213921）— 逐字 */
let rendererInstanceId: string | null = null;

/** 原 T8t（js 213922）— 逐字 */
export function setRendererInstanceId(rawId: string) {
  let trimmedId = rawId.trim();
  if (!trimmedId) {
    rendererInstanceId ??= `renderer:fallback-${createRandomId()}`;
    return;
  }
  rendererInstanceId = `renderer:${trimmedId}`;
}

/* ============================================================================
 * §P. 文件尾 export 块（原 js 213930–213979）— 逐字注释转录
 * ----------------------------------------------------------------------------
 * 该块把 34+ 个别名导出给入口 chunk（index-ABImDspU.js，已在 rendererEntry.tsx
 * 重建，行 710–728 有别名对照）。多数别名指向本范围外符号，故不生成真实
 * export，仅逐字保留原文备查。本批次符号：g8t as a / v8t as i / C8t as n /
 * x8t as r / T8t as t。
 * ----------------------------------------------------------------------------
 * export {
 *   bAe as A,   // zcodeSessionChannel 族（rendererEntry 对照）
 *   cAe as B,
 *   DAe as C,
 *   CAe as D,
 *   wAe as E,
 *   pAe as F,
 *   ise as G,
 *   xse as H,
 *   fAe as I,
 *   Tie as J,   // js 1053
 *   mo as K,    // js 1053–1062
 *   dAe as L,
 *   gAe as M,
 *   hAe as N,
 *   SAe as O,
 *   mAe as P,
 *   uAe as R,
 *   OAe as S,
 *   TAe as T,
 *   Us as U,
 *   Sse as V,   // registerBaseServices（本文件 §0 声明）
 *   ase as W,
 *   NAe as _,
 *   g8t as a,   // ★ ZCodeApp（本文件 §M）
 *   AAe as b,
 *   HAe as c,
 *   zAe as d,
 *   RAe as f,
 *   PAe as g,
 *   FAe as h,
 *   v8t as i,   // ★ WelcomeGate（OnboardingLoginLeaves §I）
 *   _Ae as j,
 *   xAe as k,
 *   VAe as l,
 *   IAe as m,
 *   C8t as n,   // ★ recordArmsCustomEventE2E（本文件 §O）
 *   ekt as o,   // js 129937
 *   LAe as p,
 *   po as q,    // js 1053–1062
 *   x8t as r,   // ★ playStartupSound（本文件 §O）
 *   WOt as s,   // js 129687
 *   T8t as t,   // ★ setRendererInstanceId（本文件 §O）
 *   BAe as u,
 *   MAe as v,
 *   EAe as w,
 *   kAe as x,
 *   jAe as y,
 *   lAe as z,
 * };
 * ==========================================================================*/

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → 现行 out js 行 / jsx 行；F20 余量 + j6t）
 * ============================================================================
 *  工作区动作：j6t 210776/167537
 *  TDP 对测：i8t 211669/168266 | a8t 212448 | （[...keys()] 212449）
 *   o8t 212450/168803 | s8t 212455/168808 | c8t 212490/168843 | X9 212520/168873
 *   l8t 212523/168876 | u8t 212534/168887 | d8t 212580/168933 | f8t 212775/169128
 *   p8t 212803/169156 | Z9 212806/169159
 *  同步桥/根：m8t 212817 | h8t 212818/169171 | g8t 212878/169433
 *   _8t 212905/169450（OFFLINE-PATCH-002 @ 213107–213109）
 *  尾件：x8t 213901/170369 | S8t 213909 | C8t 213910/170378 | w8t 213921
 *   T8t 213922/170390 | export 块 213930–213979（注释转录）
 *  经 import 消费（OnboardingLoginLeaves.tsx）：K9/q9/J9/Y9 211564–211668 |
 *   O6t/D6t/G9/A6t 210717–210775 | K6t/Z6t/Q6t 211198–211440 | $6t/e8t/t8t
 *   211441–211531 | r8t 211540 | X6t 211414 | x6t/T6t 210452–210683 |
 *   I4t…W4t 206758–206801 | R4t 206769 | Y3t/Z3t/Q3t 209393–209939 |
 *   b6t 210359 | w4t 206410 | X4t/Q4t 207064–207214 | b8t 213898
 * ============================================================================
 */
