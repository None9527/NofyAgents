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


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/onboarding/OnboardingLoginLeaves.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  LOGIN_FAILED_MESSAGE,
  useOAuth,
  familyDomainToProviderId,
  familyDomainLabel,
  identityDomain,
  withFamilyMode,
  familyDomainPatch,
  apiKeyUrlForDomain,
  shouldShowGetApiKeyLink,
  applyApiKeyToProvider,
  defaultModelKeyForProvider,
  findSavedApiKeyForDomain,
  savedApiKeyIfUntouched,
  ApiKeyLoginView,
  LoginEntryScreen,
  attemptMatchesSuccessProvider,
  canAutoCompleteOAuth,
  OAuthLoginPanel,
  LoginHeader,
  LoginLogoBadge,
  oauthButtonLabelKey,
  oauthRegionTagKey,
  OAuthRegionTag,
  providerSortRank,
  sortLoginProviders,
  resolveRetryProviderId,
  shouldReportLaunchMarks,
  readRendererLaunchMarks,
  countTotalUnreadTasks,
  isResolvingStartupAuthState,
  isStartupRenderBlocked,
  isProviderAvailabilityGateEnabled,
  isProviderStartupSyncPending,
  needsFallbackWorkspaceBootstrap,
  isProviderStartupHydrationPending,
  SettingsLayer,
  MemoizedWorkspaceShell,
  RootWorkspaceContent,
  trimmedOrUndefined,
  resolveActiveWorkspaceShellProps,
  workspaceKeyOfRestoreEntry,
  buildPersistedTabPatch,
  restoreCombinedWorkspaceSessions,
  slugifyRemoteSeed,
  remoteTargetSeedName,
  remoteWorkspaceRuntimeLabelPrefix,
  matchReconnectingWorkspaceKeys,
  MAX_REMOTE_LOGS_PER_WORKSPACE,
  useRemoteConnectionLogs,
  reconnectRemoteWorkspaceEntry,
  isActiveTaskRuntimeStatus,
  isTaskRuntimeActiveInState,
  collectActiveTaskIds,
  failActiveTasksForClosedTabs,
  identityFromReconnectEvent,
  shouldPersistClosedSessionFailure,
  reconnectRemoteWorkspaceByKey,
  resolveSshReconnectGroup,
  reconnectGroupWithSshReuse,
  isWorkspacePresentInTabs,
  cancelPendingReconnectRequests,
  openRemoteWorkspaceFromHistory,
  completeRemoteProjectSelection,
  useRemoteWorkspaceOrchestrator,
  removedRemoteWorkspaceIdentities,
  useRemoteTabSessionDisposal,
  useModelProviderSnapshotRefresher,
  presetSelectedKey,
  codingPlanSelectedKey,
  teamPlanSelectedKey,
  firstSubscribedTeamPlanKey,
  isTeamPlanKeySubscribed,
  resolveOAuthFamilySelection,
  FAMILY_DEFAULT_SELECTED_KEYS,
  isFamilySelectionUsable,
  findUnusableFamilyDomains,
  migrateDefaultFamilySelectedKeys,
  fetchBigModelTeamProducts,
  maybeUpgradeBigModelTeamPlan,
  migrateFamilySelectionWithUpgrade,
  planProviderIdsForDomain,
  codingPlanProviderFromKey,
  fetchEntitlementSnapshot,
  fetchTeamProductListResult,
  fetchTeamProductListOrEmpty,
  isCompleteTeamPlanKey,
  refreshLatestFamilySelection,
  refreshFamilySelectionKeepTeamPlan,
  refreshProvidersAfterStartupRestore,
  applyRestoredOAuthSession,
  applyOAuthCallbackSuccess,
  useOAuthSessionBootstrap,
  useTitleBarThemeSync,
  buildWebRemoteControlWorkspaces,
  buildConnectedRemoteWorkspaces,
  passThroughFlag,
  useRootPlatformBridge,
  WSL_UNC_PATH_REGEX,
  parseWslUncPath,
  openWorkspaceFolderEntry,
  useConversationWorkspaceActions,
  paneWorkspaceScopePatch,
  resolveActiveWorkspaceScope,
  invalidUsageKeys,
  usageSanityKey,
  recordInvalidUsage,
  isCompactSlashCommand,
  resolveIncomingUsage,
  isTaskBroadcastPayload,
  matchTaskBroadcast,
  runtimeStateOfBroadcastEvent,
  isStreamEventBody,
  isTaskStreamPayload,
  matchTaskStreamBroadcast,
  storeBroadcastConfigOptions,
  shouldBumpTaskListVersion,
  shouldApplyStreamBroadcast,
  useBotsTaskBroadcastBridge,
  createDiffsWorker,
  resolveDiffsPoolSize,
  DiffsPoolOptionsSync,
  DiffsWorkerPoolProvider,
  canSyncWebRemoteTasks,
  logDeferredWebRemoteSync,
  RootStartupLoading,
  StartupLogoSvg,
  useProviderAvailabilityLoginGuard,
  inferFamilyDomainFromCache,
  migrateProviderFamilyDomain,
  TDP_SEED_DEFAULTS,
  tdpNamespacedId,
  buildTdpTurnOperations,
  defineTelemetryParityCase,
  WelcomeGate,
  pluginInstallationKey,
  TASK_NOTIFICATION_SOUND_URL,
  getNotificationAudio,
} from '../components/onboarding/OnboardingLoginLeaves';
export type {
  IntlShape,
  OAuthProviderInfo,
  OAuthServiceLike,
  OAuthSessionRestoreResult,
  OAuthCallbackResult,
  UserInfo,
  ModelProviderRecord,
  ModelProviderServiceLike,
  AppSettings,
  SettingServiceLike,
  FileServiceLike,
  CredentialServiceLike,
  CodingPlanSubscriptionServiceLike,
  TeamProduct,
  UsageStatsServiceLike,
  PluginsServiceLike,
  ZcodeAgentServiceLike,
  BotsServiceLike,
  BroadcastMessage,
  BroadcastServiceLike,
  ServicesBundle,
  RemoteConnectionResult,
  RemoteSessionClosedEvent,
  BotRemoteWorkspaceReconnectedEvent,
  RemoteConnectionLogEntry,
  UpdateStateSnapshot,
  PlatformService,
  TelemetryEventPayload,
  LoginEntryRequest,
  SettingsStoreState,
  CodePreviewSettings,
  ProviderFamilyDefinition,
  ConfirmDialogOptions,
  WorkspaceTab,
  TabStoreState,
  TaskStoreState,
  WorkspaceTaskState,
  TaskRuntimeEntry,
  TaskUsage,
  SessionRouterGroup,
  RemoteSessionMutation,
  RemoteSessionEntry,
  PaneWorkspaceScope,
  PaneLayoutState,
  // QuotaBannerModel 撤除（A1-P1-B2）：components/onboarding/OnboardingLoginLeaves 侧型别已随死 declare
  // 批删除（零消费负证据见该叶 tombstone）；canonical 面 = ConversationQuotaModel QuotaBannerState。
  // CaptchaGatekeeper type import 撤除（A1-R14）：本文件零使用；原导出面（components/onboarding
  // OnboardingLoginLeaves）随死 declare 批删除，canonical = ConversationLeaves §5b。
  DiffsHighlighterOptions,
  TaskBroadcastPayload,
  TaskStreamPayload,
  PluginMarketplaceEntry,
  PluginEntry,
  PluginMarketplaceStoreState,
} from '../components/onboarding/OnboardingLoginLeaves';
