/* eslint-disable */
/**
 * ============================================================================
 * SettingsPanels.tsx — ZCode 3.7.6 Settings 大体量叶子分区（D8 Stage B3 · 第一批）
 *                      模型供应商分区（FQt 族） + MCP 编辑器/导入对话框（HQt/_$t 族）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 前序产物（本文件将其「接口级叶子」实体化）：
 *   Settings.tsx / Settings.report.md（D8 Stage B）、TopBar.tsx（标样）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 * A. 模型供应商分区（Settings.report §1.2 登记的接口级叶子 FQt，js 191784–194644）
 *   FQt  → ModelProviderSettingsSection   分区根 (191784)
 *   AZt  → ModelProviderPanel             右栏面板（分派 preset/codingPlan/teamPlan/custom/addCustom）(190379)
 *   nQt  → ModelProviderSectionShell      分区壳（描述行+刷新+双栏卡）(191289)
 *   rQt  → useModelProviderNavigationModel 导航模型（分组/条目/选中解析）(191351)
 *   iQt  → presetInFamilyDomain           (jsx 154251)
 *   aQt  → resolvePresetActiveState       (jsx 154253)
 *   oQt  → resolveDefaultSelectedNodeKey  (jsx 154266)
 *   sQt  → resolveSelectedNavItem         (jsx 154276)
 *   cQt  → navItemStorageKey              (jsx 154299)
 *   lQt  → pickPreferredPlanItem          (jsx 154308)
 *   uQt  → resolveFamilyConnectionItem    (jsx 154315)
 *   C7   → isPlanNavItem                  (jsx 154337)
 *   dQt  → hasCheckingPlanItem            (jsx 154338)
 *   fQt  → findNavItemByKey               (jsx 154339)
 *   pQt  → isPlanNavKey                   (jsx 154357)
 *   mQt  → trackAddModelSuccess           埋点 (jsx 154361)
 *   hQt  → openPresetApiKeyUrl            (jsx 154372)
 *   gQt  → confirmAndDeleteCustomProvider (jsx 154375)
 *   _Qt  → refreshProvidersAndTeamProducts (jsx 154415)
 *   vQt  → refreshAllProviderCaches       (jsx 154419)
 *   yQt  → resolveDomainAfterLogout      (jsx 154432)
 *   bQt  → applyProviderFamilyDomainMigration (jsx 154440)
 *   w7   → withFamilyModeOAuth            (jsx 154449)
 *   xQt  → codingPlanAttemptKey           (jsx 154455)
 *   SQt  → shouldRetryFailedTransition    (jsx 154462)
 *   CQt  → shouldCompleteTransition       (jsx 154470)
 *   wQt  → shouldTrackInFlightAttempt     (jsx 154477)
 *   TQt  → normalizeModelProviderIntent   (jsx 154484)
 *   EQt  → codingPlanApiKeyChanged        (jsx 154495)
 *   T7   → oauthDomainOfProvider          (jsx 154498)
 *   DQt  → presetMatchesFamilyDomain      (jsx 154501)
 *   OQt  → resolveDefaultFamilyDomain     (jsx 154505)
 *   kQt  → replaceProviderInList          (jsx 154510)
 *   AQt  → hasActiveProviderInDomain      (jsx 154513)
 *   jQt  → clearPendingModeIfUnchanged    (jsx 154516)
 *   MQt  → clearPendingKeyIfUnchanged     (jsx 154524)
 *   NQt  → isTeamPlanKeyStillSubscribed   (jsx 154532)
 *   E7   → presetNavKeyOf                (jsx 154550)
 *   PQt  → resolveNavItemStorageKey       (jsx 154554)
 *   （接口级，F12 族深层叶子，仅声明）：
 *   eQt  → ModelProviderNavRail           左栏导航轨（拖拽排序）(191183)
 *   tQt  → isProviderSectionRefreshing    (191286)
 *   u7   → ProviderConfigCardForm         供应商配置卡表单 (188376)
 *   CXt  → AddCustomProviderDraftForm     (188882)
 *   v7   → SectionLoadingPlaceholder      (189650)
 *   nZt  → PresetEmptyState               (189662)
 *   rZt  → CodingPlanStatusSection        (189675)
 *   x7   → ProviderCardShell              (190191)
 *   yZt  → ProviderCardHeader             (190194)
 *   bZt  → ConnectionModeNav              (190231)
 *   MZt  → CodingPlanPurchaseBanner       (190703)
 *   WZt  → StatusTitleDescription         (191011)
 *
 * B. MCP 编辑器 / 列表行件（Settings.report §1.2 HQt/W$t/GQt）
 *   HQt  → McpServerEditor                表单/JSON 双模式编辑器 (192533)
 *   UQt  → McpStatusIndicator             (192834)
 *   WQt  → McpScopeBadge                  (192847)
 *   GQt  → McpServerRow                   服务器行件 (192855)
 *   KQt  → McpServerList                  列表/空态 (192956)
 *   D7   → SettingsFormTextarea           (192349)
 *   IQt  → MCP_FORM_DRAFT_DEFAULTS        (192358)
 *   O7   → isPlainObject                  (jsx 155138)
 *   LQt  → mcpServerToFormDraft           (192374)
 *   RQt  → mcpFormDraftToConfig           (192401)
 *   zQt  → parseTimeoutMsInput            (jsx 155195)
 *   k7   → mcpFormDraftToJson             (192441)
 *   BQt  → parseMcpJsonToFormDraft        (192445)
 *   A7   → SettingsFormFieldLabel         (192489)
 *   VQt  → McpStorageLevelSelect          (192495)
 *
 * C. 外部 agent 配置导入对话框（Settings.report §1.2 _$t，settingsSync 族）
 *   _$t  → McpImportDialog                category=mcpServers 薄包装 (193344)
 *   h$t  → SkillsImportDialog             category=skills 薄包装 (jsx 155825)
 *   g$t  → CommandsImportDialog           category=commands 薄包装 (jsx 155831)
 *   R7   → useExternalAgentImportState    扫描/选择/导入状态机 (193347)
 *   z7   → ExternalAgentImportDialog      对话框主体（selection/importing/complete）(193434)
 *   v$t  → ExternalAgentImportSelectionPane (jsx 156034)
 *   y$t  → ImportModeSelect               symlink|copy (jsx 156074)
 *   b$t  → ImportTargetSplitButton        global|project 导入按钮 (jsx 156112)
 *   x$t  → ImportTargetScopeSelect        (jsx 156138)
 *   S$t  → ImportResultSummaryBar         (jsx 156178)
 *   B7   → ImportResultStat               (jsx 156193)
 *   C$t  → ImportResultList               (jsx 156199)
 *   w$t  → ImportResultRow                (jsx 156215)
 *   T$t  → ImportResultStatusIcon         (jsx 156225)
 *   E$t  → ImportSourceScopeSelect        (jsx 156245)
 *   D$t  → ImportDiscoveryTree            源×资源选择树 (jsx 156275)
 *   O$t  → ImportResourceRow              (jsx 156350)
 *   （纯助手，接口级声明）：qQt 类别集(155522)、JQt/YQt/N7/XQt/ZQt/QQt/$Qt/P7/e$t/t$t/
 *    n$t/F7/r$t/i$t/a$t/o$t/s$t(155523–155783)、I7/L7(155784/155794)、u$t(155789)、
 *    c$t=[global,project](155787)、l$t 导入模式集(156096 附近)、m$t(155816)、o$t(156371 附近)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk；与 Settings.tsx §二 一致处从略）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime
 *  2. cn() (Z)                       utils-CEEH0K_K.js
 *  3. Button (X) / Textarea (j) / Input (P) / Spinner (M) / Tooltip (Ia)
 *  4. useIntlContext (G)             IntlProvider-C321H7m8.js
 *  5. usePlatformService (l)、toast (m)、useConfirmDialog (U2)
 *  6. logger (J)                     logger-PFDwl5Yq.js
 *  7. 供应商 id 枚举 (q)、useModelProvidersStore (qq 78195)、
 *     useAppSettingsStore (ko 1296)、useAppSettings (JM 53488)、
 *     useBigModelProducts (TY 83745)、useSubscriptionSnapshot ($j 52497)、
 *     useCodingPlanEntitlements (sX 88303)、useUpgradeEntry (fX 89100)、
 *     useZapiEnabled (gYt 187591)
 *     （A1-R24 cn 行漂移专项：JM/TY/$j/sX/fX/gYt 行号按当前 bundle 实测校正）
 *  8. 服务 context fs()（modelProviderService/oauthService/credentialService/
 *     codingPlanSubscriptionService/settingsSyncService/mcpSyncService）
 *  9. 导航意图：sw() 读 (js 39425)、cw() 订阅 (js 39442)、iw() 跳转分区 (js 39375 / jsx 35393)
 *     （A1-R24 cn 行漂移专项：旧注 39377/39394 为漂移）
 * 10. F12 族助手（接口级）：iX 预设表 (88174)、oX Coding Plan 预设表 (88190)、
 *     Qnt (88231)、Iq 排序 (77408)、cX/nrt/rrt 键构造 (88433/88436/88439)、
 *     irt (88452)、lX (88442)、lrt (88475)、urt (88607)、tM (52594)、vM (52742)、
 *     PM/IM 升级漏斗 (53205/53229)、dj (51862)、s5e (80321)、JY/HY (87715/87595)、
 *     MXt (189380)、zZt/BZt/NZt/PZt/GZt/_Zt/OZt/DZt/kZt (190947…190363)、
 *     qnt (88170)、hNe (40406)；跨 chunk：dr/zi/ot/gi/Bn/li/vi/fi/xw/Ri/Jnt
 * ============================================================================
 */

/* ============================================================================
 * 〔A0-S4-4a：components 拆分（settings 域）——本文件现为薄 re-export shim〕
 * 组件单元已按族原样迁入 components/settings/，导入方零改动（仍从本文件取符号）：
 *   模型供应商族（§0 声明群去 McpServer + §1–§4） → components/settings/ModelProviderSettingsSection.tsx
 *   MCP 族（§0 局部接口 McpServer + §5–§7）        → components/settings/McpSettingsEditor.tsx
 *   外部 agent 配置导入对话框（§8）                → components/settings/ExternalAgentImportDialog.tsx
 * 三族互不引用；§0 声明群随主消费族（模型供应商）迁入，McpServer 私有接口随 MCP 族迁入。
 * ==========================================================================*/

export {
  useModelProviderNavigationModel,
  ModelProviderSectionShell,
  ModelProviderPanel,
  ModelProviderSettingsSection,
} from '../components/settings/ModelProviderSettingsSection';
export type {
  ModelProviderNavItem,
  ModelProviderNavigationGroup,
  ModelProviderSettingsSectionProps,
} from '../components/settings/ModelProviderSettingsSection';

export {
  SettingsFormTextarea,
  MCP_FORM_DRAFT_DEFAULTS,
  mcpServerToFormDraft,
  mcpFormDraftToConfig,
  mcpFormDraftToJson,
  parseMcpJsonToFormDraft,
  SettingsFormFieldLabel,
  McpStorageLevelSelect,
  McpStatusIndicator,
  McpScopeBadge,
  McpServerRow,
  McpServerList,
  McpServerEditor,
} from '../components/settings/McpSettingsEditor';
export type { McpFormDraft, McpServerEditorProps } from '../components/settings/McpSettingsEditor';

export {
  useExternalAgentImportState,
  ImportSourceScopeSelect,
  ImportModeSelect,
  ImportTargetSplitButton,
  ImportTargetScopeSelect,
  ImportResultStat,
  ImportResultSummaryBar,
  ImportResultStatusIcon,
  ImportResultRow,
  ImportResultList,
  ImportResourceRow,
  ImportDiscoveryTree,
  ExternalAgentImportDialog,
  ExternalAgentImportSelectionPane,
  McpImportDialog,
  SkillsImportDialog,
  CommandsImportDialog,
} from '../components/settings/ExternalAgentImportDialog';
export type {
  ExternalAgentImportCategory,
  ExternalAgentImportScope,
  ExternalAgentImportMode,
  ExternalAgentDiscoveryAgent,
  ExternalAgentDiscovery,
  ExternalAgentImportSelection,
  ExternalAgentImportResource,
  ExternalAgentImportResultItem,
  ExternalAgentImportResult,
  ExternalAgentSourceRow,
  ExternalAgentScopeGroup,
  ExternalAgentImportState,
  ExternalAgentImportDialogProps,
} from '../components/settings/ExternalAgentImportDialog';
