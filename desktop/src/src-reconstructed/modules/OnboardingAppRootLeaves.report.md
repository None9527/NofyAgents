# B5-02 批次报告 —— 尾部块 F18（OnboardingLogin）+ F20（Bootstrap/AppRoot）余量逐字重建

- 输入（主口径，只读）：`desktop/src/out/renderer/assets/styles-CdEGpc2x.js`
  - **现行工作区副本**：213,979 行，md5 `48d71d4874b0868d61fd35a328bf6ad5`（完成后复验未变）
  - 计划口径为 213,695 行（旧 md5 `c9d0d675…`）；现行副本含去品牌化/离线补丁/批注导致的行段增删，见 §0 漂移对照。
- 对照（jsx pretty 孪生）：`desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，无漂移；任务简报所给 6 个 jsx 锚点全部逐字命中，见 §D.3）
- 产物：
  - `desktop/src/src-reconstructed/modules/OnboardingLoginLeaves.tsx`（**5,379 行**，F18 余量）
  - `desktop/src/src-reconstructed/modules/AppRootLeaves.tsx`（**2,726 行**，F20 余量 + j6t）
- 约定标样：`ConversationLeaves.tsx`（文件头映射表 + §0 声明 + 文件尾符号表）；报告格式标样：`Leaves.report.md`
- 行号口径：本报告与文件内注释统一使用**现行副本行号（js）/ jsx 孪生行号**双行号；计划口径行号换算见 §0。

---

## 0. 漂移对照（计划口径 → 现行副本）

| 区段 | 计划口径行段 | 现行副本行段 | 漂移 |
|---|---|---|---|
| F18 主段（login 前缘 → E3t 尾） | 205680–211384（前段） | 205970–211668（前段） | **+290** |
| F20 主段（i8t → g8t/_8t） | 211385–213269 | 211669–213553 | **+284** |
| F18 尾段（v8t → b8t） | 213270–213616 | 213554–213900 | **+284** |
| F20 文件尾（x8t…export 块） | 213617–213695 | 213901–213979 | **+284** |

- 漂移在 F18 主段内部由 +290 变为 +284（差 6 行，位于 209xxx–211xxx 它族区段，系现行副本去品牌删行所致；不影响本批符号定位——所有符号均以现行副本逐字定位）。
- 换算示例：`b4t` 计划 205826 → 现行 **206116**；`k3t` 计划 208549 → 现行 **208839**；`i8t` 计划 211385 → 现行 **211669**；`g8t` 计划 212594 → 现行 **212878**；`v8t` 计划 213270 → 现行 **213554**；`x8t` 计划 213617 → 现行 **213901**；文件尾 213695 → 213979。
- `j6t`（任务要求在 js 中自行定位）：现行 **210776–211054**（jsx 167537）。

---

## A. F18 余量覆盖清单（OnboardingLoginLeaves.tsx，5,379 行）

把握度：**高（逐字）** = 字符串/分支/类名零改动转录；**中（接口级）** = 仅声明消费面。
「文件行」为产物内符号注释所在行；「js 行」为现行副本行号。

### A.1 §A 登录 / OAuth / API Key（js 205995–206343）

| 混淆名 | 语义名 | 文件行 | js 行 / jsx 行 | 把握度 |
|---|---|---|---|---|
| `c4t` | OAUTH_FALLBACK_COPY 常量 | 948 | 205995 / 163717 | 高 |
| `l4t` | `useOAuth` | 951 | 205996 / 163718 | 高 |
| `M9` | providerIdOfFamilyDomain | 1034 | 206077 / 163794 | 高 |
| `u4t` | familyDomainDisplayName | 1039 | 206080 / 163797 | 高 |
| `d4t` | identityDomain（恒等） | 1044 | 206083 / 163800 | 高 |
| `f4t` | apiKeyModePatch | 1049 | 206086 / 163803 | 高 |
| `p4t` | familyDomainPatch | 1054 | 206089 / 163809 | 高 |
| `m4t` | apiKeyUrlOfRegistry | 1067 | 206096 / 163816 | 高 |
| `h4t` | shouldShowApiKeyLink | 1072 | 206099 / 163819 | 高 |
| `g4t` | applyApiKeyToProvider | 1077 | 206102 / 163822 | 高 |
| `_4t` | defaultModelKeyOfProvider | 1082 | 206105 / 163831 | 高 |
| `v4t` | storedApiKeyByDomain | 1088 | 206109 / 163835 | 高 |
| `y4t` | echoStoredApiKeyIfUntouched | 1094 | 206113 / 163839 | 高 |
| `b4t` | `ApiKeyLoginView`（login.apiKey.* 全套） | 1099 | **206116 / 163845** | 高 |

### A.2 §B 登录视图族（js 206410–206757）

| 混淆名 | 语义名 | 文件行 | js 行 / jsx 行 | 把握度 |
|---|---|---|---|---|
| `w4t` | `LoginEntryScreen` | 1290 | 206410 / 164049 | 高 |
| `T4t` | isAttemptedProviderMatched | 1303 | 206425 / 164054 | 高 |
| `E4t` | canAutoCompleteLoginEntry | 1308 | 206428 / 164057 | 高 |
| `D4t` | `OAuthLoginPanel`（providers/apiKey/waiting/error 四态） | 1313 | 206431 / 164060 | 高 |
| `O4t` | LoginHeader | 1526 | 206685 / 164194 | 高 |
| `k4t` | LoginWordmark（REBRAND-011+111 aria-label） | 1540 | 206704 / 164201 | 高 |
| `A4t` | oauthButtonLabelKey | 1553 | 206712 / 164206 | 高 |
| `j4t` | oauthSectionLabelKey | 1565 | 206722 / 164216 | 高 |
| `M4t` | OAuthSectionBadge | 1577 | 206732 / 164226 | 高 |
| `N4t` | providerSortWeight | 1588 | 206742 / 164237 | 高 |
| `P4t` | sortProvidersByWeight | 1600 | 206752 / 164247 | 高 |
| `F4t` | resolveRetryProvider | 1605 | 206755 / 164250 | 高 |

### A.3 §C 启动门控谓词（js 206758–206803）

| 混淆名 | 语义名 | 文件行 | js 行 / jsx 行 | 把握度 |
|---|---|---|---|---|
| `I4t` | `shouldReportLaunchMarks` | 1614 | 206758 / 164257 | 高 |
| `L4t` | `readRendererLaunchMarks` | 1619 | 206761 / 164260 | 高 |
| `R4t` | `countTotalUnreadTasks` | 1633 | 206769 / 164270 | 高 |
| `z4t` | `isResolvingStartupAuthState` | 1650 | 206782 / 164282 | 高（★OFFLINE-PATCH-001 直通 `return false`，注释保留） |
| `B4t` | `isStartupRenderBlocked` | 1665 | 206787 / 164285 | 高 |
| `V4t` | `isProviderAvailabilityGateEnabled` | 1677 | 206790 / 164288 | 高 |
| `H4t` | `isProviderStartupSyncPending` | 1682 | 206793 / 164291 | 高 |
| `U4t` | `needsFallbackWorkspaceBootstrap` | 1693 | 206798 / 164294 | 高 |
| `W4t` | `isProviderStartupHydrationPending` | 1698 | 206801 / 164297 | 高 |

### A.4 §D 设置层 / 根工作区内容（js 206998–207216）

| 混淆名 | 语义名 | 文件行 | js 行 / jsx 行 | 把握度 |
|---|---|---|---|---|
| `J4t` | `SettingsLayer` | 1707 | 206998 / 164401 | 高 |
| `Y4t` | `MemoizedWorkspaceShell`（memo(XJt)；XJt 属 F07） | 1791 | 207063 | 高（壳）/中（XJt 本体它族） |
| `X4t` | `RootWorkspaceContent` | 1794 | 207064 / 164453 | 高 |
| `Z4t` | trimmedOrUndefined | 1930 | 207205 / 164518 | 高 |
| `Q4t` | `resolveActiveWorkspaceShellProps` | 1935 | 207208 / 164521 | 高 |

### A.5 §E 远控工作区恢复/重连编排（js 208827–209942）

| 混淆名 | 语义名 | 文件行 | js 行 / jsx 行 | 把握度 |
|---|---|---|---|---|
| `D3t` | restoreEntryWorkspaceKey | 1954 | 208827 / 165632 | 高 |
| `O3t` | `persistableTabEntries` | 1959 | 208830 / 165635 | 高 |
| `k3t` | `composeWorkspaceSessionRestore` | 1970 | **208839 / 165647** | 高 |
| `A3t` | slugifyWorkspaceName | 2063 | 208929 / 165733 | 高 |
| `j3t` | remoteTargetSeedName | 2068 | 208932 / 165736 | 高 |
| `M3t` | remoteWorkspaceRuntimeLabelPrefix | 2085 | 208947 / 165752 | 高 |
| `N3t` | runtimeLabelMatchesReconnectKey | 2090 | 208950 / 165755 | 高 |
| `P3t` | PER_WORKSPACE_REMOTE_LOG_LIMIT | 2109 | 208963 / 165766 | 高 |
| `F3t` | `useRemoteConnectionLogs` | 2112 | 208964 / 165767 | 高 |
| `I3t` | `reconnectRemoteWorkspaceEntry` | 2173 | 209023 / 165826 | 高 |
| `B9` | activeRuntimeStatus | 2291 | 209132 / 165927 | 高 |
| `L3t` | isTaskRuntimeActive | 2296 | 209135 / 165930 | 高 |
| `R3t` | collectActiveTaskIds | 2302 | 209139 / 165934 | 高 |
| `z3t` | failActiveTabsOnDisconnect | 2315 | 209149 / 165942 | 高 |
| `B3t` | reconnectEventIdentity | 2334 | 209161 / 165959 | 高 |
| `V3t` | deferFailureOnWslClose | 2339 | 209164 / 165962 | 高 |
| `H3t` | reconnectRemoteWorkspaceByKey | 2350 | 209169 / 165965 | 高 |
| `U3t` | sshSameHostReconnectGroup | 2364 | 209181 / 165977 | 高 |
| `W3t` | reconnectGroupSharingSshCredential | 2374 | 209189 / 165985 | 高 |
| `G3t` | isWorkspaceStillTabbed | 2439 | 209247 / 166047 | 高 |
| `K3t` | cancelInflightReconnect | 2452 | 209258 / 166051 | 高 |
| `q3t` | `openRemoteWorkspaceFromHistory` | 2476 | 209275 / 166067 | 高 |
| `J3t` | `selectRemoteProject` | 2537 | 209333 / 166137 | 高 |
| `Y3t` | `useRemoteWorkspaceOrchestrator` | 2599 | 209393 / 166201 | 高 |
| `X3t` | removedTabRemoteIdentities | 3060 | 209851 / 166613 | 高 |
| `Z3t` | `useRemoteTabSessionDisposal` | 3076 | 209865 / 166625 | 高 |
| `Q3t` | `useModelProviderSnapshotRefresher` | 3134 | 209916 / 166671 | 高 |

### A.6 §F provider family 迁移（js 209943–210451）

| 混淆名 | 语义名 | 文件行 | js 行 / jsx 行 | 把握度 |
|---|---|---|---|---|
| `e6t` | presetSelectedKey | 3164 | 209943 / 166688 | 高 |
| `V9` | codingPlanSelectedKey | 3169 | 209946 / 166691 | 高 |
| `t6t` | teamPlanSelectedKey | 3174 | 209949 / 166694 | 高 |
| `n6t` | firstSubscribedTeamPlanKey | 3183 | 209956 / 166701 | 高 |
| `r6t` | isValidSubscribedTeamPlanKey | 3213 | 209984 / 166723 | 高 |
| `i6t` | oauthFamilySelectedKey | 3251 | 210020 / 166747 | 高 |
| `H9` | FAMILY_DEFAULT_SELECTED_KEYS | 3275 | 210036 / 166772 | 高 |
| `a6t` | isFamilySelectionAvailable | 3281 | 210040 / 166782 | 高 |
| `o6t` | findUnavailableFamilyDomain | 3291 | 210048 / 166790 | 高 |
| `s6t` | migrateDefaultFamilySelectedKey | 3305 | 210060 / 166800 | 高 |
| `c6t` | fetchBigModelTeamPlans | 3325 | 210078 / 166820 | 高 |
| `l6t` | upgradeBigModelDefaultToTeamPlan | 3339 | 210090 / 166832 | 高 |
| `u6t` | mergeMigrationAndUpgrade | 3361 | 210110 / 166852 | 高 |
| `U9` | familyPlanProviderPair | 3372 | 210119 / 166859 | 高 |
| `d6t` | codingPlanProviderIdOfKey | 3381 | 210126 / 166862 | 高 |
| `W9` | refreshEntitlementSnapshot | 3391 | 210134 / 166866 | 高 |
| `f6t` | teamPlanListResult | 3406 | 210147 / 166882 | 高 |
| `p6t` | teamPlanListOrEmpty | 3421 | 210160 / 166902 | 高 |
| `m6t` | isCompleteTeamPlanKey | 3427 | 210164 / 166906 | 高 |
| `h6t` | refreshFamilySelectionAfterLogin | 3433 | 210168 / 166910 | 高 |
| `g6t` | refreshFamilySelection | 3465 | 210198 / 166944 | 高 |
| `_6t` | refreshProviderSuiteAfterRestore | 3508 | 210239 / 166986 | 高 |
| `v6t` | applyLocalSessionRestoreResult | 3563 | 210288 / 167031 | 高 |
| `y6t` | applyOAuthCallbackSuccess | 3578 | 210295 / 167034 | 高 |
| `b6t` | `useOAuthSessionBootstrap` | 3655 | 210359 / 167089 | 高 |

### A.7 §G 根桥接 / 工作区动作（js 210452–210775；j6t 行段划归 F20）

| 混淆名 | 语义名 | 文件行 | js 行 | 把握度 |
|---|---|---|---|---|
| `x6t` | `useTitleBarThemeSync` | 3754 | 210452 | 高 |
| `S6t` | `buildWebRemoteControlWorkspaces` | 3781 | 210467 | 高 |
| `C6t` | canSyncWebRemoteTasks | 3817 | 210497 | 高 |
| `w6t` | logDeferredWebRemoteSync（恒等直通） | 3832 | 210510 | 高 |
| `T6t` | `useRootPlatformBridge` | 3837 | 210513 | 高 |
| `E6t` | WSL_UNC_PATH_REGEX | 4053 | 210684 | 高 |
| `D6t` | `parseWslUncPath` | 4057 | 210685 | 高 |
| `G9` | `openWorkspaceFolderEntry` | 4066 | 210692 | 高 |
| `O6t` | `useConversationWorkspaceActions` | 4098 | 210717 | 高 |
| `k6t` | paneWorkspaceScopePatch | 4144 | 210753 | 高 |
| `A6t` | `resolveActiveWorkspaceScope` | 4152 | 210759 | 高 |

### A.8 §H 远控任务同步桥 → 启动加载 → 登录守卫 → TDP 种子（js 211055–211668）

| 混淆名 | 语义名 | 文件行 | js 行 | 把握度 |
|---|---|---|---|---|
| `M6t`…`K6t`（16 件） | 远控任务同步桥件群（`useBotsTaskBroadcastBridge` 等） | 4182–4367 | 211055–211198 | 高 |
| `q6t` | `createDiffsWorker` | 4555 | 211381 | 高 |
| `J6t` | diffs worker 常量 | 4563 | 211387 | 高 |
| `Y6t` | `DiffsPoolOptionsSync` | 4570 | 211392 | 高 |
| `X6t` | `DiffsWorkerPoolProvider` | 4594 | 211414 | 高 |
| `Z6t`/`Q6t` | diffs 池上下文/钩子 | 4621/4636 | 211435/211438 | 高 |
| `$6t` | `RootStartupLoading`（data-testid root-startup-loading） | 4641 | 211441 | 高 |
| `e8t` | `StartupLogoSvg`（REBRAND-013+113） | 4660 | 211454 | 高 |
| `t8t` | `useProviderAvailabilityLoginGuard` | 4690 | 211481 | 高 |
| `n8t` | `inferFamilyDomainFromCache` | 4752 | 211532 | 高 |
| `r8t` | `migrateProviderFamilyDomain` | 4762 | 211540 | 高 |
| `K9` | TDP_SEED_DEFAULTS | 4788 | 211564 | 高（语义属 F20 TDP 域，行段属 F18，留本文件由 AppRootLeaves import） |
| `q9` | tdpNamespacedId | 4796 | 211570 | 高 |
| `J9` | `buildTdpTurnOperations` | 4801 | 211573 | 高 |
| `Y9` | `defineTelemetryParityCase` | 4905 | 211666 | 高 |

### A.9 §I 欢迎门 / 插件市场 store / 通知音（js 213554–213900）

| 混淆名 | 语义名 | 文件行 | js 行 / jsx 行 | 把握度 |
|---|---|---|---|---|
| `v8t` | `WelcomeGate` | 4920 | **213554 / 170001** | 高 |
| `Q9` | pluginInstallationKey | 4989 | 213619 / 170031 | 高 |
| （无赋值） | PluginMarketplaceStoreCreation（裸 `Ae(…)` 死创建，逐字保留） | ~5000 | 213621–213895 / 170035 | 高（死代码注记） |
| `y8t` | TASK_NOTIFICATION_SOUND_URL | 5321 | 213896 / 170364 | 高 |
| `$9` | sharedNotificationAudio | 5325 | 213897 | 高 |
| `b8t` | `getNotificationAudio` | 5328 | 213898 / 170366 | 高 |

### A.10 §0 接口级声明（中把握度，消费面）

外部依赖一律 `declare`（54 个 `export interface` + declare 函数/常量）：`logger`、intl 上下文、settings store（ko）/`useAppSettings`（JM）、tab store（pc/hc）、task store（xe）、session router（A2）、split layout（s2/K0）、平台桥、services 束、遥测（xw/re/YPe/BSt/b_e/iT）、启动服务注册（vFe/Sse/$se/yFe）、会话恢复桥（rYt/iYt）、captcha/配额助手群、`E3t/pOt/MEt/j9/P9/p4` 组件面等。

---

## B. F20 余量覆盖清单（AppRootLeaves.tsx，2,726 行）

### B.1 §J useWorkspaceActions（行段在 F18 范围，按任务指派归 F20）

| 混淆名 | 语义名 | 文件行 | js 行 / jsx 行 | 把握度 |
|---|---|---|---|---|
| `j6t` | `useWorkspaceActions`（workbenchGroupClientMode=`desktop-continuous`、logout 流、WSL UNC 提示） | 311 | **210776–211054 / 167537** | 高 |

### B.2 §K 遥测对测（TDP）域（js 211669–212815）

| 混淆名 | 语义名 | 文件行 | js 行 / jsx 行 | 把握度 |
|---|---|---|---|---|
| `i8t` | `buildTelemetryParityCases`（TDP01–19 全量） | 616 | **211669 / 168266** | 高 |
| `a8t` | `TELEMETRY_PARITY_CASES`（Map caseId→case） | 1397 | **212448** | 高 |
| （裸语句） | `[...TELEMETRY_PARITY_CASES.keys()];` 死语句，逐字保留 | 1401 | **212449** | 高（死代码注记） |
| `o8t` | runTelemetryParityCase 入口 | 1403 | 212450 | 高 |
| `s8t` | parity 断言助手 | 1410 | 212455 | 高 |
| `c8t` | parity scope 工厂 | 1447 | 212490 | 高 |
| `X9` | parity 常量 | 1480 | 212520 | 高 |
| `l8t` | `useLaunchTelemetryMarks` 桥 | 1486 | 212523 | 高 |
| `u8t` | parity 事件 fact 构造 | 1499 | 212534 | 高 |
| `d8t` | `applyTelemetryParityOperation` | 1562 | 212580 | 高 |
| `f8t` | `runTelemetryParityWebNoop` | 1759 | 212775 | 高 |
| `p8t` | parity 收尾 | 1787 | 212803 | 高 |
| `Z9` | parity 全局 scope 句柄 | 1792 | 212806 | 高 |

### B.3 §L 图标常量 / 远控任务同步桥（js 212817–212877）

| 混淆名 | 语义名 | 文件行 | js 行 | 把握度 |
|---|---|---|---|---|
| `m8t` | APP_ROOT_ICON_STROKE_WIDTH = 1.5 | 1810 | 212817 | 高 |
| `h8t` | `WebRemoteControlTaskSyncBridge` | 1813 | 212818 / jsx 169171 | 高 |

### B.4 §M/§N App 根（js 212878–213553）

| 混淆名 | 语义名 | 文件行 | js 行 / jsx 行 | 把握度 |
|---|---|---|---|---|
| `g8t` | `ZCodeApp`（provider 树：Lucide/Tooltip/Services/Platform/Store/TabStore/DiffsPool/FeatureGate/CodingPlanUpgrade/CaptchaHost） | 1885 | **212878 / 169433** | 高 |
| `_8t` | `AppRootContent`（★OFFLINE-PATCH-002 + `[boot-flags]/[boot-restore-pre]/[boot-restore]` console.log，原 JSON 键 `Le…Be`/`bt/xt/fe/ce` 逐字） | 1923 | **212905 / 169450** | 高 |

### B.5 §O/§P 文件尾（js 213901–213979）

| 混淆名 | 语义名 | 文件行 | js 行 | 把握度 |
|---|---|---|---|---|
| `x8t` | `playStartupSound` | 2609 | **213901** | 高 |
| `S8t` | ARMS_E2E_EVENT_LIMIT = 200 | 2619 | 213909 | 高 |
| `C8t` | `recordArmsCustomEventE2E` | 2622 | 213910 | 高 |
| `w8t` | rendererInstanceId | 2635 | 213921 | 高 |
| `T8t` | `setRendererInstanceId` | 2638 | **213922** | 高 |
| export 块 | `export { bAe as A, … }` 50 行逐字注释转录（别名→语义标注：g8t as a、v8t as i、C8t as n、x8t as r、T8t as t 等） | 2747+ | **213930–213979** | 高（注释转录，别名映射对照 rendererEntry.tsx 710–728） |

### B.6 §0 接口级声明（中把握度）

共享类型自 OnboardingLoginLeaves `import type`（20 个：IntlShape/UpdateStateSnapshot/PlatformService/FileServiceLike/SettingServiceLike/AppSettings/OAuthServiceLike/ModelProviderRecord/ModelProviderServiceLike/BroadcastMessage/BroadcastServiceLike/ServicesBundle/WorkspaceTab/TabStoreState/WorkspaceTaskState/TaskStoreState/SessionRouterGroup/PaneLayoutState/UserInfo/LoginEntryRequest）；其余 declare：`logger`、DESKTOP_COMMANDS、CLOSE_ACTIVE_CONTEXT_EVENT、tab/task/session-router/split-layout store 句柄、`Dt` runtimePreferencesSchema、遥测平台族（xw/re/YPe/BSt/b_e/iT）、`vFe/Sse`、`hT` ConversationTelemetrySupervisor、`I0/L0` 配额、captcha 助手群、`Eie` isStartupSoundEnabled、`xi` createRandomId、provider 树组件群（qre/Na/ds/a/Nie/Vse/oRt/krt/wSt）、`pOt/MEt/j9/P9/p4/E3t/w4t` 消费面、window 全局。

---

## C. 边界裁决（只注记不转录）

| # | 对象 | 行段（现行副本） | 裁决 |
|---|---|---|---|
| 1 | `s4t` ZCodeLogoSvg | 205975–205994 | 已在 Modals.tsx（原 205679+）→ OLL 头注记 + `declare const BrandWordmarkSvg` 消费面 |
| 2 | hero 三件 `x4t/S4t/C4t` | 206344–206409（计划口径 206054–206094） | 已在 ModalsLeaves.tsx（Modals.report §5）→ 只注记 |
| 3 | `m3t` ProjectSelectorHero | 207780–207806（计划 207490–207516） | 已在 Modals.tsx 4186（Modals.report §2.4「向导 UI」清单含 m3t）→ 只注记。**任务简报把 m3t 列为余量符号，经与既有产物核对属已抽取段，按纪律不重复转录** |
| 4 | `$4t…E3t` 向导全件 | 207217–208826（计划 206927–208536） | 已在 Modals.tsx → 只注记 |
| 5 | `N9/G4t/K4t/q4t/P9/$3t`（alert-dialog 族） | 206804–209940 散布 | 已在 Modals.tsx §5 → 只注记 |
| 6 | `j9` 设置视图根 | 205174–205974 | 已在 Settings.tsx → 只注记 |
| 7 | `j6t` | 210776–211054 | 行段属 F18，按任务指派归 **F20 → AppRootLeaves.tsx 转录**（唯一跨块搬移件） |
| 8 | `Y4t = memo(XJt)` | 207063 | XJt 本体属 F07 WorkspaceShell.tsx；OLL 只保留 memo 包装 |
| 9 | `K9/q9/J9/Y9`（TDP 种子/构造） | 211564–211668 | 行段属 F18、语义属 F20 TDP 域 → 留 OLL，AppRootLeaves 经 import 消费（交接面见 §E） |
| 10 | 入口 chunk index-ABImDspU.js | 不在 styles js 内 | 已在 rendererEntry.tsx → 只注记 |
| 11 | `j6t.y` 死状态（COVERAGE-LEDGER §f 第 10 项） | — | j6t 转录中保留该解构位（语义名 `webRemoteControlTerminalTransportState` 消费面），死状态注记随符号表 |

另：**MODULE-MAP 勘误** —— §F18 行 207-215 将 `k3t/A3t` 标为「导入向导」有误：`k3t`（208839）实为 `composeWorkspaceSessionRestore`（工作区会话恢复组合），`A3t`（208929）为 `slugifyWorkspaceName`；导入向导件群（`c3t/l3t/u3t/…/E3t`）已在 Modals.tsx。本批按实际代码转录并在 OLL 头注记勘误。

---

## D. 验证记录（四项门禁）

### D.1 门禁 1 —— esbuild（0 错）

```
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/OnboardingLoginLeaves.tsx --loader:.tsx=tsx --jsx=preserve
  → ../../../dev/null 149.0kb  ⚡ Done（0 错）
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/AppRootLeaves.tsx --loader:.tsx=tsx --jsx=preserve
  → ../../../dev/null 81.0kb   ⚡ Done（0 错）
```

### D.2 门禁 2 —— tsc strict（0 错）

- `/tmp/tsconfig.OnboardingLoginLeaves.json` / `/tmp/tsconfig.AppRootLeaves.json`：`strict、target ES2022、module ESNext、moduleResolution Bundler、jsx preserve、lib [ES2022,DOM,DOM.Iterable]、typeRoots → web/node_modules/@types、paths.react → web/node_modules/@types/react、noEmit、skipLibCheck`，include 仅该产物。
- `web/node_modules/.bin/tsc -p /tmp/tsconfig.OnboardingLoginLeaves.json` → **0 错**
- `web/node_modules/.bin/tsc -p /tmp/tsconfig.AppRootLeaves.json` → **0 错**
- 类型手段说明：未用任何 `@ts-expect-error`；跨文件同名接口经「OLL 导出 54 接口 + AppRootLeaves `import type` 20 接口」统一；两处 `supervisor: void 0` 初始位以 `void 0 as unknown as ConversationTelemetrySupervisor` 就位（原码紧随赋值，语义不变）；`inert` 属性（@types/react 18 缺）以条件 spread 表达。

### D.3 门禁 3 —— 锚点回代（13 处 ≥ 8，全部逐字命中）

对照文件：`desktop/src/out/renderer/assets/styles-CdEGpc2x.js`（现行副本）。

| # | 现行行号 | 原文（逐字摘录） | 产物对应 |
|---|---|---|---|
| 1 | 206116 | `function b4t({ onCancel: e, onSaved: t, onSkipped: n }) {` | OLL L1100 `ApiKeyLoginView` |
| 2 | 208839 | `function k3t({` | OLL L1970 `composeWorkspaceSessionRestore` |
| 3 | 210776 | `function j6t({` | ARL L311 `useWorkspaceActions` |
| 4 | 211669 | `function i8t() {` | ARL L616 `buildTelemetryParityCases` |
| 5 | 212448 | `var a8t = new Map(i8t().map((e) => [e.caseId, e]));` | ARL L1398 `TELEMETRY_PARITY_CASES` |
| 6 | 212449 | `[...a8t.keys()];` | ARL L1401 `[...TELEMETRY_PARITY_CASES.keys()];`（死语句保留） |
| 7 | 212878 | `function g8t(e) {` | ARL L1886 `ZCodeApp` |
| 8 | 212905 | `function _8t({` | ARL L1924 `AppRootContent` |
| 9 | 213106–213108 | `// OFFLINE-PATCH-002: 离线时 auth/provider 校验不 resolve，强制放行初始 workspace bootstrap。` / `Ue = !0;` / `` console.log(`[boot-flags]`, JSON.stringify({ Le, Ve, He, Ue, Fe, Ie, Re, Be })); `` | ARL L2147–2150（注释与补丁逐字；JSON 键保留混淆键名、值换语义名） |
| 10 | 213554 | `function v8t({ platform: e, initialLocale: t, onRequestClose: n }) {` | OLL L4921 `WelcomeGate` |
| 11 | 213901 | `async function x8t() {` | ARL L2610 `playStartupSound` |
| 12 | 213922 | `function T8t(e) {` | ARL L2639 `setRendererInstanceId` |
| 13 | 213930–213931 | `export {` / `bAe as A,` | ARL §P L2747+ 逐字注释转录 |

补充（jsx 孪生锚点，任务简报 6 处全部命中）：jsx 164996 `function m3t() {`、163845 `function b4t({`、170001 `function v8t({`、169433 `function g8t(e) {`、168266 `function i8t() {`、167537 `function j6t({`。
补充（`[boot-restore-pre]` @213224 / `[boot-restore]` @213242 与 ARL L2266/L2285 逐字对应，JSON 键 `bt/xt/fe/ce` 保留）。

### D.4 门禁 4 —— 报告完整性

本报告含：覆盖清单（§A/§B 符号→行号）、边界裁决（§C）、验证记录（§D）、交接面（§E）、遗留问题（§F）；两产物文件头映射表 + 文件尾符号表齐备。

### D.5 只读纪律 —— md5 抽验

- 开工前基线：`48d71d4874b0868d61fd35a328bf6ad5`
- 完成后复验：`md5 desktop/src/out/renderer/assets/styles-CdEGpc2x.js` = **`48d71d4874b0868d61fd35a328bf6ad5`**（未变）

---

## E. 与既有文件的交接面

1. **rendererEntry.tsx**（入口 chunk）：经 export 块别名消费本批 5 件 —— `g8t as a`（ZCodeApp，调用点 L636 传 services/platform/isDesktop/isMacDesktop/isWindowsDesktop/restoreSession/supportsSettings/initialWorkspaceAbsPath/…）、`v8t as i`（WelcomeGate）、`C8t as n`（recordArmsCustomEventE2E）、`x8t as r`（playStartupSound）、`T8t as t`（setRendererInstanceId）。
2. **AppRootLeaves → OnboardingLoginLeaves**：35 个值导入（useConversationWorkspaceActions、parseWslUncPath、openWorkspaceFolderEntry、resolveActiveWorkspaceScope、TDP_SEED_DEFAULTS、buildTdpTurnOperations、defineTelemetryParityCase、canSyncWebRemoteTasks、logDeferredWebRemoteSync、useBotsTaskBroadcastBridge、useTitleBarThemeSync、useRootPlatformBridge、RootStartupLoading、useProviderAvailabilityLoginGuard、migrateProviderFamilyDomain、DiffsWorkerPoolProvider、门控谓词 7 件、countTotalUnreadTasks、useRemoteWorkspaceOrchestrator、useRemoteTabSessionDisposal、useModelProviderSnapshotRefresher、useOAuthSessionBootstrap、LoginEntryScreen、getNotificationAudio、RootWorkspaceContent、resolveActiveWorkspaceShellProps）+ 20 个 `import type`（见 B.6）。**拆分/重构时此共享类型层必须保留。**
3. **Modals.tsx / ModalsLeaves.tsx**：E3t/pOt/MEt/P9/p4 等在 AppRootLeaves 仅 declare 消费面；其实体已在 Modals 批次。
4. **Settings.tsx / WorkspaceShell.tsx（F07）**：j9、XJt 实体在它族；本批保留 J4t/Y4t 薄壳与 declare。
5. **COVERAGE-LEDGER**：§a F18/F20 行、§c 第 7/8 项（行 126-127）、§f 第 10 项（j6t.y 死状态，行 208）所登记范围已由本批两产物覆盖，可按本报告 §A/§B 回勾。

---

## F. 遗留问题

1. **计划口径漂移**：计划基准（213,695 行 / 旧 md5）与现行副本（213,979 行 / `48d71d48…`）存在 +290/+284 两段漂移；后续批次若引用计划行号须先按 §0 换算。
2. **接口级 declare 待接管**：`hT` ConversationTelemetrySupervisor、`Dt` runtimePreferencesSchema、captcha/配额助手群、provider 树组件群（qre/Na/ds/a/Nie/Vse/oRt/krt/wSt）等在本批为接口级声明，待对应家族批次重建后接管。
3. **死代码两处**（逐字保留并注记）：匿名插件市场 store 裸创建（OLL，213621–213895）、`[...TELEMETRY_PARITY_CASES.keys()];` 裸语句（ARL，212449）。
4. **MODULE-MAP 勘误待回写**：k3t/A3t 非「导入向导」（见 §C 末）；j6t 跨块归属（F18 行段 → F20 产物）建议在 MODULE-MAP §F20 补锚点 210776–211054。
5. **类型放宽记录**（为过 strict 门禁，语义不变）：OLL 侧 `TaskStoreState.startDraft` workspaceIdentity 放宽 `string | null`、`addTab/activateTabByPath` patch/opts 放宽 `any`、`onCloseActiveContextRequest` handler 放宽 `() => void`、RootWorkspaceContent 五个远控 handler 放宽 `(...args: any[]) => any`、`t8t.providerFamilyDomain` 放宽 `string | null | undefined`。
6. i18n 键（`onboarding.*`/`login.*`/`projectSelector.*`）全部保留原键名，动态键报告并入 I18nDynamicKeys 既有登记。
