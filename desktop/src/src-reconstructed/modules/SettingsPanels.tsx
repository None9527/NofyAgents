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
 *   FQt  → ModelProviderSettingsSection   分区根 (191784 / 154557)
 *   AZt  → ModelProviderPanel             右栏面板（分派 preset/codingPlan/teamPlan/custom/addCustom）(190379 / 153409)
 *   nQt  → ModelProviderSectionShell      分区壳（描述行+刷新+双栏卡）(191289 / 154091)
 *   rQt  → useModelProviderNavigationModel 导航模型（分组/条目/选中解析）(191351 / 154111)
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
 *   eQt  → ModelProviderNavRail           左栏导航轨（拖拽排序）(191183 / 154042)
 *   tQt  → isProviderSectionRefreshing    (191286 / 154088)
 *   u7   → ProviderConfigCardForm         供应商配置卡表单 (188376 / 151911)
 *   CXt  → AddCustomProviderDraftForm     (188882 / 152305)
 *   v7   → SectionLoadingPlaceholder      (189650 / 152857)
 *   nZt  → PresetEmptyState               (189662 / 152862)
 *   rZt  → CodingPlanStatusSection        (189675 / 152873)
 *   x7   → ProviderCardShell              (190191 / 153248)
 *   yZt  → ProviderCardHeader             (190194 / 153254)
 *   bZt  → ConnectionModeNav              (190231 / 153271)
 *   MZt  → CodingPlanPurchaseBanner       (190703 / 153690)
 *   WZt  → StatusTitleDescription         (191011 / 153927)
 *
 * B. MCP 编辑器 / 列表行件（Settings.report §1.2 HQt/W$t/GQt）
 *   HQt  → McpServerEditor                表单/JSON 双模式编辑器 (192533 / 155282)
 *   UQt  → McpStatusIndicator             (192834 / 155435)
 *   WQt  → McpScopeBadge                  (192847 / 155443)
 *   GQt  → McpServerRow                   服务器行件 (192855 / 155454)
 *   KQt  → McpServerList                  列表/空态 (192956 / 155481)
 *   D7   → SettingsFormTextarea           (192349 / 155116)
 *   IQt  → MCP_FORM_DRAFT_DEFAULTS        (192358 / 155125)
 *   O7   → isPlainObject                  (jsx 155138)
 *   LQt  → mcpServerToFormDraft           (192374 / 155141)
 *   RQt  → mcpFormDraftToConfig           (192401 / 155158)
 *   zQt  → parseTimeoutMsInput            (jsx 155195)
 *   k7   → mcpFormDraftToJson             (192441 / 155201)
 *   BQt  → parseMcpJsonToFormDraft        (192445 / 155207)
 *   A7   → SettingsFormFieldLabel         (192489 / 155241)
 *   VQt  → McpStorageLevelSelect          (192495 / 155246)
 *
 * C. 外部 agent 配置导入对话框（Settings.report §1.2 _$t，settingsSync 族）
 *   _$t  → McpImportDialog                category=mcpServers 薄包装 (193344 / 155837)
 *   h$t  → SkillsImportDialog             category=skills 薄包装 (jsx 155825)
 *   g$t  → CommandsImportDialog           category=commands 薄包装 (jsx 155831)
 *   R7   → useExternalAgentImportState    扫描/选择/导入状态机 (193347 / 155843)
 *   z7   → ExternalAgentImportDialog      对话框主体（selection/importing/complete）(193434 / 155926)
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
 *     useAppSettingsStore (ko 1296)、useAppSettings (JM 53440)、
 *     useBigModelProducts (TY 83697)、useSubscriptionSnapshot ($j 52449)、
 *     useCodingPlanEntitlements (sX 88255)、useUpgradeEntry (fX 89052)、
 *     useZapiEnabled (gYt 187295)
 *  8. 服务 context fs()（modelProviderService/oauthService/credentialService/
 *     codingPlanSubscriptionService/settingsSyncService/mcpSyncService）
 *  9. 导航意图：sw() 读 (39377)、cw() 订阅 (39394)、iw() 跳转分区 (35393)
 * 10. F12 族助手（接口级）：iX 预设表 (88174)、oX Coding Plan 预设表 (88190)、
 *     Qnt (88231)、Iq 排序 (77408)、cX/nrt/rrt 键构造 (88433/88436/88439)、
 *     irt (88452)、lX (88442)、lrt (88475)、urt (88607)、tM (52594)、vM (52742)、
 *     PM/IM 升级漏斗 (53205/53229)、dj (51862)、s5e (80321)、JY/HY (87715/87595)、
 *     MXt (189380)、zZt/BZt/NZt/PZt/GZt/_Zt/OZt/DZt/kZt (190947…190363)、
 *     qnt (88170)、hNe (40406)；跨 chunk：dr/zi/ot/gi/Bn/li/vi/fi/xw/Ri/Jnt
 * ============================================================================
 */

import * as React from "react";

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** 类名合并（原 Z，utils-CEEH0K_K.js） */
declare function cn(...inputs: Array<string | false | null | undefined>): string;

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 日志器（原 J，logger-PFDwl5Yq.js） */
declare const logger: {
  debug(msg: string, meta?: unknown): void;
  info(msg: string, meta?: unknown): void;
  warn(msg: string, meta?: unknown): void;
  error(msg: string, ...meta: unknown[]): void;
};

/** 桌面平台服务（原 l()） */
interface PlatformService {
  openExternal(url: string): void | Promise<void>;
  openInFileManager(path: string): Promise<{ success: boolean; error?: string }>;
}
declare function usePlatformService(): PlatformService;

/** toast（原 m） */
declare function toast(message: string, opts?: ToastOptions): string;
interface ToastOptions {
  durationMs?: number;
  position?: "top-center" | "bottom-center";
  variant?: "info" | "success" | "error";
  actionLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
  dismissLabel?: string;
}

/** 确认对话框（原 U2） */
declare function useConfirmDialog(): (options: {
  presentation?: string;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive";
  showKeyboardHints?: boolean;
}) => Promise<boolean>;

/* --- UI 原语（跨 chunk） --- */

declare const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "secondary" | "ghost" | "outline" | "link" | "destructive";
    size?: "xs" | "sm" | "lg" | "icon-sm" | "icon-md";
  }
>;
declare const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
declare const Input: React.FC<Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & { size?: "sm" | "lg" }>;
declare const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>>;
declare const Tooltip: React.FC<{
  title: string;
  description?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}>;
declare const Switch: React.FC<{
  id?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}>;
declare const SelectRoot: React.FC<{
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}>;
declare const SelectTrigger: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "lg"; variant?: "ghost" | "input" }
>;
declare const SelectValue: React.FC<Record<string, never>>;
declare const SelectContent: React.FC<{ align?: "start" | "end"; children: React.ReactNode }>;
declare const SelectItem: React.FC<{ value: string; disabled?: boolean; children: React.ReactNode }>;
declare const Tabs: React.FC<{
  value: string;
  onValueChange: (v: string) => void;
  className?: string;
  children: React.ReactNode;
}>;
declare const TabsList: React.FC<{ className?: string; children: React.ReactNode }>;
declare const TabsTrigger: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; className?: string }
>;
declare const DialogRoot: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}>;
declare const DialogContent: React.FC<{ className?: string; children: React.ReactNode }>;
declare const DialogHeader: React.FC<{ className?: string; children: React.ReactNode }>;
declare const DialogTitle: React.FC<{ className?: string; children: React.ReactNode }>;
declare const Badge: React.FC<{ variant?: "outline" | "secondary"; className?: string; children: React.ReactNode }>;
declare const Progress: React.FC<{ value: number; className?: string }>;
declare const DropdownMenuRoot: React.FC<{ children: React.ReactNode }>;
declare const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }>;
declare const DropdownMenuContent: React.FC<{
  align?: "start" | "end";
  sideOffset?: number;
  className?: string;
  onClick?: React.MouseEventHandler;
  children: React.ReactNode;
}>;
declare const DropdownMenuItem: React.FC<
  { className?: string; disabled?: boolean; onSelect: (e: Event) => void; "data-testid"?: string } & Record<
    string,
    unknown
  >
>;
declare const DropdownMenuSeparator: React.FC<Record<string, never>>;

/* --- 图标（lucide 风格；原符号见各行注释） --- */

declare const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Nv refresh-cw
declare const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>>; // kv plus
declare const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Kv trash
declare const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Dv pencil
declare const ExternalLinkIcon: React.FC<React.SVGProps<SVGSVGElement>>; // q_ external-link
declare const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>>; // N_ chevron-down
declare const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>>; // wa chevron-right
declare const PlugIcon: React.FC<React.SVGProps<SVGSVGElement>>; // A_ plug
declare const CircleIcon: React.FC<React.SVGProps<SVGSVGElement>>; // z_ circle
declare const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>>; // M_ check
declare const MinusIcon: React.FC<React.SVGProps<SVGSVGElement>>; // bv minus（半选）
declare const CircleHelpIcon: React.FC<React.SVGProps<SVGSVGElement>>; // F_ circle-help
declare const AlertIcon: React.FC<React.SVGProps<SVGSVGElement>>; // N triangle-alert
declare const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>>; // G_ download

/* --- 供应商 id 枚举与领域类型（原 q=mo，skillStore-BmeKHDBI.js） --- */

declare const PROVIDER_IDS: {
  zai: string;
  bigmodel: string;
  zapi: string;
  zaiCodingPlan: string;
  zaiStartPlan: string;
  bigmodelCodingPlan: string;
  bigmodelStartPlan: string;
};
/** 原 Ri：bigmodel OAuth provider id 常量（跨 chunk 导入；值即 `bigmodel`） */
declare const BIGMODEL_OAUTH_PROVIDER_ID: "bigmodel";

interface ModelProvider {
  id: string;
  name: string;
  apiKey: string;
  apiKeyUrl?: string;
  endpoints?: string[];
  apiFormat?: string;
  defaultKind?: string;
  headers?: Record<string, string>;
  models?: unknown[];
  modelSupportedFormats?: unknown;
  enabled?: boolean;
  systemDisabledReason?: string | null;
  [key: string]: unknown;
}

interface PresetProviderDefinition {
  id: string;
  providerName: string;
  oauthProviderId: string;
  purchaseUrl?: string;
  [key: string]: unknown;
}

/** 供应商族连接方式（原 dr/zi/ot 等，F12 族，跨 chunk） */
declare function providerFamilyOf(providerId: string): string | null; // dr
declare function familyModeOf(familyId: string, modes: Record<string, string> | undefined): string; // zi
interface ProviderFamilyDescriptor {
  id: string;
  apiKeyProviderId: string;
}
declare function familyDescriptorOf(presetId: string): ProviderFamilyDescriptor | null; // ot
declare function isProviderActive(provider: ModelProvider): boolean; // gi
declare function isPresetProvider(provider: ModelProvider): boolean; // lX
declare function isProviderUsable(provider: ModelProvider): boolean; // vM
declare function isStartPlanPreset(presetId: string): boolean; // Bn
declare function sortProvidersByDisplayOrder(
  providers: ModelProvider[],
  displayOrder: { providerIds: string[]; updatedAt?: number } | null
): ModelProvider[]; // Iq
declare function isBuiltInProviderId(providerId: string): boolean; // irt
declare function parseTeamPlanKey(key: string): { productId?: string; organizationId?: string; projectId?: string } | null; // li
declare function buildTeamPlanKey(parts: { productId?: string; organizationId?: string; projectId?: string }): string; // vi
declare function isSameTeamPlanKey(a: string, b: string): boolean; // fi
declare function presetApiKeyUrl(presetId: string): string | null; // ort
declare function presetRegistrationUrl(presetId: string): string | null; // ort 族
declare function trackEvent(
  platform: PlatformService,
  event: {
    elementName: string;
    eventRegion: string;
    eventType: string;
    eventExtraDetail?: Record<string, string>;
  },
  scope: string
): Promise<void>; // xw
declare function telemetryPresetId(presetId: string): string; // hNe

/* --- stores / hooks（本 chunk 或跨 chunk） --- */

interface ModelProvidersStoreState {
  modelProviders: ModelProvider[];
  displayOrder: { providerIds: string[]; updatedAt?: number } | null;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  saveProvider: (provider: ModelProvider) => Promise<void>;
  deleteProvider: (providerId: string) => Promise<void>;
  saveDisplayOrder: (order: { providerIds: string[]; updatedAt: number }) => Promise<void>;
  testModelConnectivity: (request: {
    endpoints?: string[];
    apiKey: string;
    model: string;
    provider: Partial<ModelProvider>;
  }) => Promise<unknown>;
}
declare function useModelProvidersStore(): ModelProvidersStoreState; // qq（78195）

interface AppSettingsSnapshot {
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  providerFamilyDomain?: string | null;
  providerFamilyDomainUpdatedAt?: number;
  providerFamilyDomainMigrated?: boolean;
  keepAwakeWhileRunning?: boolean;
  [key: string]: unknown;
}
declare function useAppSettings(): {
  settings: AppSettingsSnapshot | null;
  loading: boolean;
  error: unknown;
  update: (patch: Partial<AppSettingsSnapshot>) => Promise<void>;
}; // JM（53440）

interface AppPreferenceStoreState {
  requestLoginEntry: (oauthProviderId: string) => void;
  setUser: (user: unknown) => void;
  oauthError: string | null;
  setOAuthError: (error: string | null) => void;
  markModelProviderFamilyConnectionTransition: (familyId: string) => void;
}
declare function useAppPreferenceStore<T>(selector: (s: AppPreferenceStoreState) => T): T; // ko（1296）

interface BigModelProductsState {
  snapshot: { productList: BigModelProduct[] } | null;
  loading: boolean;
  refresh: (opts?: { force?: boolean }) => Promise<void>;
}
interface BigModelProduct {
  productId?: string;
  subscribed?: boolean;
  organizationId?: string | null;
  projectId?: string | null;
  teamProjects?: Array<{ organizationId?: string | null; projectId?: string | null }>;
  [key: string]: unknown;
}
declare function useBigModelProducts(opts: { enabled: boolean; authenticated: boolean }): BigModelProductsState; // TY（83697）

interface SubscriptionSnapshot {
  quota?: { limits?: unknown[] };
  [key: string]: unknown;
}
declare function useSubscriptionSnapshot(opts: {
  enabled: boolean;
  includeSubscription?: boolean;
  preferredProviderId?: string;
  allowDisabledPreferredProvider?: boolean;
  requirePreferredProvider?: boolean;
  allowEnvApiKey?: boolean;
  organizationId?: string;
  projectId?: string;
  cacheKey?: string;
}): { snapshot: SubscriptionSnapshot | null; refresh?: (opts?: { force?: boolean; silent?: boolean }) => void }; // $j（52449）

interface CodingPlanEntitlement {
  status?: string;
  planLevel?: string;
  currentProductId?: string;
  subscriptionBillingCycle?: string;
  subscriptionRenewTime?: number;
  subscriptionExpireTime?: number;
  quotaLimits?: unknown;
  snapshot?: unknown;
  [key: string]: unknown;
}
declare function useCodingPlanEntitlements(opts: {
  modelProviders: ModelProvider[];
  loading: boolean;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  suppressProviderFingerprintAutoRefresh?: boolean;
}): { entitlements: Record<string, CodingPlanEntitlement>; refresh: () => Promise<void> }; // sX（88255）

declare function useUpgradeEntry(): {
  openCodingPlanUpgrade: (opts: {
    providerId: string;
    initialAudience?: "personal" | "team";
    initialTeamPlanKey?: string;
    funnelContext?: string;
  }) => void;
}; // fX（89052）
declare function useZapiEnabled(): boolean; // gYt（187295）

/** 分区导航意图（原 sw 39377 / cw 39394 / iw 35393） */
declare function readSettingsSectionIntent(): { providerId: string } | null; // sw
declare function subscribeSettingsSectionIntent(
  listener: (section: string, payload?: { modelProviderId?: string }) => void
): () => void; // cw
declare function navigateToSettingsSection(section: string): void; // iw

/** 服务 context（原 fs()，2638） */
interface McpServer {
  id: string;
  name: string;
  enabled: boolean;
  scope: "user" | "workspace";
  status?: "connected" | "connecting" | "error" | "disconnected";
  toolCount?: number;
  error?: string | null;
  authorization?: { authorizationUrl?: string } | null;
  location?: { source: string; directoryPath?: string } | null;
  config: {
    type?: string;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
    oauth?: unknown;
  };
}
interface SettingsSyncService {
  detect(request: {
    workspacePath?: string;
    workspaceIdentity?: string | null;
    categories: string[];
    intent: string;
  }): Promise<ExternalAgentDiscovery>;
  importSelected(request: {
    workspacePath?: string;
    workspaceIdentity?: string | null;
    selections: ExternalAgentImportSelection[];
  }): Promise<ExternalAgentImportResult>;
}
interface ModelProviderService {
  refreshCodingPlanApiKey(providerId: string): Promise<void>;
}
interface OAuthService {
  logout(providerId: string): Promise<void>;
}
interface CredentialService {
  load(key: string): Promise<string | null>;
}
interface CodingPlanSubscriptionService {
  [key: string]: unknown;
}
declare function useServices(): {
  modelProviderService: ModelProviderService;
  oauthService: OAuthService;
  credentialService: CredentialService;
  codingPlanSubscriptionService: CodingPlanSubscriptionService;
  settingsSyncService: SettingsSyncService;
  mcpSyncService: unknown;
}; // fs

/* --- F12 族助手（接口级；行号见头部映射） --- */

interface PresetProviderEntry extends PresetProviderDefinition {
  displayName?: string;
}
declare const PRESET_PROVIDERS: PresetProviderEntry[]; // iX（88174）
declare const CODING_PLAN_PRESETS: PresetProviderEntry[]; // oX（88190）
declare function isPresetVisible(opts: { presetId: string; zapiEnabled: boolean }): boolean; // Qnt（88231）
declare function presetNavKey(presetId: string): string; // cX（88433）`preset:${id}`
declare function codingPlanNavKey(presetId: string): string; // nrt（88436）`coding-plan:${id}`
declare function customNavKey(providerId: string): string; // rrt（88439）`custom:${id}`
declare function resolveCodingPlanStatus(opts: {
  provider: ModelProvider | null;
  entitlement?: CodingPlanEntitlement;
  modelProvidersLoading: boolean;
}): {
  status: string;
  planLevel?: string;
  currentProductId?: string;
  subscriptionBillingCycle?: string;
  subscriptionRenewTime?: number;
  subscriptionExpireTime?: number;
  quotaLimits?: unknown;
}; // lrt（88475）
declare function buildTeamPlanNavItems(opts: {
  items: ModelProviderNavItem[];
  codingPlanEntitlements: Record<string, CodingPlanEntitlement>;
  subscribedTeamProducts: BigModelProduct[];
  showPurchasedTeamPlanFallback: boolean;
  selectedTeamPlanKey?: string;
}): ModelProviderNavItem[]; // urt（88607）
declare function toManagedProvider(provider: ModelProvider | null): ModelProvider | null; // tM（52594）
declare function upgradeFunnelContext(opts: {
  providerId: string;
  upgradeSource: string;
  eventRegion: string;
  eventText: string;
  entryPlanState?: string;
  purchaseAudience?: string;
}): string; // PM（53205）
declare function entryPlanStateOf(opts: {
  displayStatus: string;
  providerId: string;
  planLevel?: string;
}): string; // IM（53229）
declare function useFunnelDiagnostics(): unknown; // dj（51862）
declare function usePlanProductsSnapshot(
  providerId: string,
  opts: { remotePreviewEnabled: boolean }
): { snapshot: { productList: BigModelProduct[] } | null; loading: boolean }; // s5e（80321）
declare function useIntlFormatDate(): (value: unknown) => string; // JY（87715）
declare function buildEnterpriseTeamGroups(
  products: BigModelProduct[],
  opts: { locale: string; formatMessage: (d: { id: string }, v?: Record<string, unknown>) => string }
): unknown[]; // HY（87595）
declare function formatStartPlanPreview(
  preview: unknown,
  intl: IntlShape,
  locale: string
): { title: string; description: string }; // MXt（189380）
declare function resolvePlanProviderId(providerId: string): string; // zZt（190947）
declare function buildPurchaseBannerItems(opts: {
  providerId: string;
  audience: "personal" | "team";
  products: BigModelProduct[];
  soldOutVisible: boolean;
}): unknown[]; // BZt（190950）
declare function resolveEnterpriseVisibility(opts: {
  teamVisible: boolean;
  enterpriseTeamGroupCount: number;
  enterpriseProductsLoading: boolean;
}): unknown; // NZt（190913）
declare function pickFeaturedTeamProducts(products: BigModelProduct[]): unknown[]; // PZt（190922）
declare function purchaseBannerCopy(
  displayStatus: string,
  intl: IntlShape
): { title: string; description: string } | null; // GZt（191023）
declare function codingPlanViewState(opts: {
  status: string;
  loginPending: boolean;
}): { displayStatus: string; actionStatus: string; balanceStatus: string; loginLoading: boolean }; // _Zt（190181）
declare function isTeamPlanNavItem(item: ModelProviderNavItem): item is ModelProviderNavItem & {
  organizationId: string;
  projectId: string;
}; // OZt（190356）
declare function isCodingPlanLikeItem(item: ModelProviderNavItem | null): boolean; // DZt（190353）
declare function mergeItemWithSubscription(
  item: ModelProviderNavItem,
  snapshotState: { snapshot: SubscriptionSnapshot | null }
): ModelProviderNavItem; // kZt（190363）
declare const PRESET_SUBSCRIPTION_LOGIN_TIMEOUT_MS: number; // qnt（88170）
declare const BIGMODEL_REGISTRATION_URL: string; // Jnt（跨 chunk）
declare function resolveCodingPlanProviderHeaders(opts: {
  providerId: string;
  providerConfig: ModelProvider;
  codingPlanSubscriptionService: CodingPlanSubscriptionService;
  modelProviderService: ModelProviderService;
}): Promise<Record<string, string> | null>; // pCt（F12 族）
declare function planStateOfProviders(opts: { providers: ModelProvider[]; loading: boolean }): string; // LM
declare function buildUpgradeFunnelForAutomations(opts: { providerId: string; eventText: string; entryPlanState: string }): string; // FM

/* ============================================================================
 * 1. 模型供应商导航模型（原 rQt 及其纯助手，js 191351–191783 / jsx 154111–154556）
 * ==========================================================================*/

/** 导航条目（原 rQt 内联合类型；键格式：`preset:`/`custom:`/`coding-plan:`/`team-plan:`/`custom:add`） */
export interface ModelProviderNavItem {
  key: string;
  type: "preset" | "custom" | "addCustom" | "codingPlan" | "teamPlan" | "codingPlanLoading";
  presetId?: string;
  oauthProviderId?: string;
  label: string;
  provider?: ModelProvider | null;
  providerName?: string;
  displayName?: string;
  status?: string;
  statusLabelId?: string;
  planLevel?: string;
  currentProductId?: string;
  subscriptionBillingCycle?: string;
  subscriptionRenewTime?: number;
  subscriptionExpireTime?: number;
  quotaLimits?: unknown;
  purchaseUrl?: string;
  statusActive?: boolean;
  inactivePlanTitle?: string;
  organizationId?: string;
  projectId?: string;
}

export interface ModelProviderNavigationGroup {
  id: "preset" | "custom";
  title: string;
  items: ModelProviderNavItem[];
}

/** 原 iQt（jsx 154251）：预设是否属于当前供应商族域 */
function presetInFamilyDomain(presetId: string, domain: string | null): boolean {
  return domain ? providerFamilyOf(presetId) === domain : true;
}

/** 原 aQt（jsx 154253）：预设条目的激活态（族连接方式优先） */
function resolvePresetActiveState(opts: {
  presetId: string;
  provider: ModelProvider | null;
  connectionModeItems: ModelProviderNavItem[];
  modelProviderFamilyModes: Record<string, string>;
  modelProviderFamilySelectedKeys: Record<string, string>;
}): boolean {
  const fallback = opts.provider ? isProviderActive(opts.provider) && isPresetProvider(opts.provider) : false;
  const family = familyDescriptorOf(opts.presetId);
  if (!family || familyModeOf(family.id, opts.modelProviderFamilyModes) !== "oauth") return fallback;
  const selected = resolveFamilyConnectionItem(
    opts.connectionModeItems.filter((item) => item.type !== "codingPlanLoading"),
    family.id,
    opts.modelProviderFamilyModes,
    opts.modelProviderFamilySelectedKeys
  );
  return !selected || !isPlanNavItem(selected) ? false : !!selected.statusActive;
}

/** 原 oQt（jsx 154266）：缺省选中键（计划项优先 → 首条目） */
function resolveDefaultSelectedNodeKey(opts: {
  selectedNodeKey: string | null;
  selectableNavigationItems: ModelProviderNavItem[];
}): string | null {
  const preferred = pickPreferredPlanItem(opts.selectableNavigationItems);
  const preferredKey = preferred ? navItemStorageKey(preferred) : null;
  return isPlanNavKey(opts.selectedNodeKey) && preferredKey ? preferredKey : preferredKey ?? navItemStorageKey(opts.selectableNavigationItems[0] ?? null);
}

/** 原 sQt（jsx 154276）：选中条目解析（preset → 族连接条目投影） */
function resolveSelectedNavItem(opts: {
  selectedNodeKey: string | null;
  navigationItemByKey: Map<string, ModelProviderNavItem>;
  selectableNavigationItems: ModelProviderNavItem[];
  modelProviderFamilyModes: Record<string, string>;
  modelProviderFamilySelectedKeys: Record<string, string>;
  pendingModelProviderFamilySelectedKeys: Record<string, string>;
  familyConnectionSettingsLoading: boolean;
  familyConnectionSettingsFailed: boolean;
}): ModelProviderNavItem | null {
  const item = opts.navigationItemByKey.get(opts.selectedNodeKey ?? "") ?? null;
  if (!item) return null;
  if (item.type !== "preset") return item;
  const family = familyDescriptorOf(item.presetId ?? "");
  if (!family) return item;
  if (opts.familyConnectionSettingsLoading) return null;
  if (opts.familyConnectionSettingsFailed) {
    return (
      opts.selectableNavigationItems.find(
        (candidate) => candidate.type === "preset" && candidate.presetId === family.apiKeyProviderId
      ) ?? item
    );
  }
  const mergedKeys = { ...opts.modelProviderFamilySelectedKeys, ...opts.pendingModelProviderFamilySelectedKeys };
  return (
    resolveFamilyConnectionItem(opts.selectableNavigationItems, family.id, opts.modelProviderFamilyModes, mergedKeys) ||
    (familyModeOf(family.id, opts.modelProviderFamilyModes) === "apiKey" ? item : null)
  );
}

/** 原 cQt（jsx 154299）：条目 → 存储键（计划/预设条目落到其 API Key 供应商键） */
function navItemStorageKey(item: ModelProviderNavItem | null): string | null {
  if (!item) return null;
  if (item.type !== "preset" && item.type !== "codingPlan" && item.type !== "teamPlan") return item.key;
  const family = familyDescriptorOf(item.presetId ?? "");
  return family ? presetNavKey(family.apiKeyProviderId) : item.key;
}

/** 原 lQt（jsx 154308）：优先计划条目挑选（已购非 Start → team → 已购 Start → 任意非 Start → 首个） */
function pickPreferredPlanItem(items: ModelProviderNavItem[]): ModelProviderNavItem | null {
  const planItems = items.filter(isPlanNavItem);
  return (
    planItems.find((item) => item.type === "codingPlan" && !isStartPlanPreset(item.presetId ?? "") && item.status === "purchased") ||
    planItems.find((item) => item.type === "teamPlan") ||
    planItems.find((item) => item.type === "codingPlan" && isStartPlanPreset(item.presetId ?? "") && item.status === "purchased") ||
    planItems.find((item) => item.type === "codingPlan" && !isStartPlanPreset(item.presetId ?? "")) ||
    (planItems[0] ? planItems[0] : items.find((item) => item.type === "preset") ?? null)
  );
}

/** 原 uQt（jsx 154315）：按族模式/选中键解析连接方式条目 */
function resolveFamilyConnectionItem(
  items: ModelProviderNavItem[],
  familyId: string,
  modes: Record<string, string>,
  selectedKeys: Record<string, string> = {}
): ModelProviderNavItem | null {
  const mode = familyModeOf(familyId, modes);
  if (mode === "apiKey") {
    const presetId = familyId === "zai" ? PROVIDER_IDS.zai : PROVIDER_IDS.bigmodel;
    const presetItem = items.find((item) => item.type === "preset" && item.presetId === presetId);
    if (presetItem) return presetItem;
  }
  const familyItems = items.filter((item) => isPlanNavItem(item) && familyDescriptorOf(item.presetId ?? "")?.id === familyId);
  const selectedKey = selectedKeys[familyId]?.trim();
  const selected = selectedKey ? findNavItemByKey(items, selectedKey) : null;
  if (
    selected &&
    (selected.type === "codingPlan" || selected.type === "teamPlan") &&
    familyDescriptorOf(selected.presetId ?? "")?.id === familyId
  ) {
    return selected;
  }
  if (mode === "oauth" && selectedKey) {
    const startPlanKey = codingPlanNavKey(
      familyId === "zai" ? PROVIDER_IDS.zaiStartPlan : PROVIDER_IDS.bigmodelStartPlan
    );
    const codingPlanPresetId = familyId === "zai" ? PROVIDER_IDS.zaiCodingPlan : PROVIDER_IDS.bigmodelCodingPlan;
    return selectedKey === startPlanKey && !hasCheckingPlanItem(familyItems)
      ? familyItems.find((item) => item.type === "codingPlan" && item.presetId === codingPlanPresetId) ?? null
      : null;
  }
  if ((mode === "oauth" && familyItems.length === 0) || (mode === "oauth" && hasCheckingPlanItem(familyItems))) {
    return null;
  }
  const preferred = pickPreferredPlanItem(familyItems);
  if (preferred) return preferred;
  if (mode === "oauth") {
    const presetId = familyId === "zai" ? PROVIDER_IDS.zai : PROVIDER_IDS.bigmodel;
    return items.find((item) => item.type === "preset" && item.presetId === presetId) ?? null;
  }
  return null;
}

/** 原 C7（jsx 154337） */
function isPlanNavItem(item: ModelProviderNavItem): boolean {
  return item.type === "codingPlan" || item.type === "teamPlan";
}

/** 原 dQt（jsx 154338） */
function hasCheckingPlanItem(items: ModelProviderNavItem[]): boolean {
  return items.some((item) => item.status === "checking");
}

/** 原 fQt（jsx 154339）：按键查找（team-plan 键带 projectId 模糊匹配） */
function findNavItemByKey(items: ModelProviderNavItem[], key: string): ModelProviderNavItem | null {
  const exact = items.find((item) => item.key === key);
  if (exact) return exact;
  if (!key.startsWith(`team-plan:${PROVIDER_IDS.bigmodelCodingPlan}:`)) return null;
  const fuzzy = items.find((item) => item.type === "teamPlan" && isSameTeamPlanKey(item.key, key));
  if (fuzzy) return fuzzy;
  const parsed = parseTeamPlanKey(key);
  const projectId = parsed?.projectId ?? null;
  if (!projectId) return null;
  if (projectId === "0") {
    const productId = parsed?.productId ?? null;
    if (productId) {
      const byProduct = items.find(
        (item) => item.type === "teamPlan" && parseTeamPlanKey(item.key)?.productId === productId
      );
      if (byProduct) return byProduct;
    }
  }
  return items.find((item) => item.type === "teamPlan" && isSameTeamPlanKey(item.key, key)) ?? null;
}

/** 原 pQt（jsx 154357） */
function isPlanNavKey(key: string | null): boolean {
  return (
    key?.startsWith("coding-plan:") === true ||
    key?.startsWith("team-plan:") === true ||
    key === `preset:${PROVIDER_IDS.zai}` ||
    key === `preset:${PROVIDER_IDS.bigmodel}`
  );
}

/** 原 mQt（jsx 154361）：埋点 add_model_success */
async function trackAddModelSuccess(opts: { platform: PlatformService; presetId: string }): Promise<void> {
  await trackEvent(
    opts.platform,
    {
      elementName: "add_model_success",
      eventRegion: "app_setting",
      eventType: "ck",
      eventExtraDetail: {
        login_default: "1",
        model_provider: telemetryPresetId(opts.presetId),
      },
    },
    "ModelProviderSection"
  );
}

/** 原 hQt（jsx 154372）：打开预设 API Key 申领页 */
function openPresetApiKeyUrl(opts: { platform: PlatformService; presetId: string }): void {
  const url = presetApiKeyUrl(opts.presetId);
  if (url) opts.platform.openExternal(url);
}

/** 原 gQt（jsx 154375）：确认并删除自定义供应商 */
async function confirmAndDeleteCustomProvider(opts: {
  provider: ModelProvider;
  confirmDialog: ReturnType<typeof useConfirmDialog>;
  intl: IntlShape;
  deleteProvider: (providerId: string) => Promise<void>;
}): Promise<void> {
  if (isBuiltInProviderId(opts.provider.id)) return;
  logger.info("[ModelProviderSection] 请求删除自定义模型供应商", {
    providerId: opts.provider.id,
    providerName: opts.provider.name,
  });
  const confirmed = await opts.confirmDialog({
    title: opts.intl.formatMessage({ id: "settings.modelProvider.deleteConfirmTitle" }, { name: opts.provider.name }),
    description: opts.intl.formatMessage({ id: "settings.modelProvider.deleteConfirmDescription" }),
    confirmLabel: opts.intl.formatMessage({ id: "settings.modelProvider.deleteConfirmAction" }),
    cancelLabel: opts.intl.formatMessage({ id: "common.cancel" }),
  });
  if (!confirmed) {
    logger.info("[ModelProviderSection] 用户取消删除自定义模型供应商", {
      providerId: opts.provider.id,
      providerName: opts.provider.name,
    });
    return;
  }
  try {
    await opts.deleteProvider(opts.provider.id);
  } catch (error) {
    logger.error("[ModelProviderSection] 删除模型供应商失败", error);
  }
}

/** 原 _Qt（jsx 154415） */
async function refreshProvidersAndTeamProducts(opts: {
  refresh: () => Promise<void>;
  refreshTeamPlanProducts?: () => Promise<void>;
}): Promise<void> {
  await Promise.all([opts.refresh(), opts.refreshTeamPlanProducts?.()]);
}

/** 原 vQt（jsx 154419）：全量缓存刷新编排 */
async function refreshAllProviderCaches(opts: {
  refreshModelProviders: () => Promise<void>;
  refreshCodingPlanEntitlements: () => Promise<void>;
  refreshTeamPlanProducts: (opts?: { force?: boolean }) => Promise<void>;
  refreshCodingPlanProducts: () => void;
  refreshPurchaseTokenState: () => Promise<unknown>;
  refreshPlanSnapshots?: boolean;
}): Promise<void> {
  await opts.refreshPurchaseTokenState();
  if (opts.refreshPlanSnapshots ?? true) {
    await Promise.all([opts.refreshModelProviders(), opts.refreshCodingPlanEntitlements(), opts.refreshTeamPlanProducts({ force: true })]);
  } else {
    await opts.refreshModelProviders();
  }
  opts.refreshCodingPlanProducts();
}

/** 原 yQt（jsx 154432）：解绑后按 API Key 现状决定保留的族域 */
function resolveDomainAfterLogout(opts: {
  currentDomain?: string | null;
  modelProviders: ModelProvider[];
}): string | null {
  if (!opts.currentDomain) return null;
  const providerId = { zai: PROVIDER_IDS.zai, bigmodel: PROVIDER_IDS.bigmodel }[
    opts.currentDomain as "zai" | "bigmodel"
  ];
  return (opts.modelProviders.find((provider) => provider.id === providerId)?.apiKey.trim().length ?? 0) > 0
    ? opts.currentDomain
    : null;
}

/** 原 w7（jsx 154449） */
function withFamilyModeOAuth(modes: Record<string, string> | undefined, domain: string): Record<string, string> {
  return { ...modes, [domain]: "oauth" };
}

/** 原 xQt（jsx 154455）：Coding Plan 同步尝试键 `${providerId}:${oauthProviderId}` */
function codingPlanAttemptKey(opts: {
  activeOAuthProvider: string | null;
  oauthProviderId?: string;
  providerId?: string;
}): string | null {
  return opts.activeOAuthProvider === opts.oauthProviderId ? `${opts.providerId}:${opts.activeOAuthProvider}` : null;
}

/** 原 SQt（jsx 154462） */
function shouldRetryFailedTransition(opts: {
  attemptKey: string | null;
  attemptStatus?: string;
  modeUnchanged: boolean;
  selectedKeyUnchanged: boolean;
}): boolean {
  return opts.modeUnchanged && opts.selectedKeyUnchanged && opts.attemptKey !== null && opts.attemptStatus === "failed";
}

/** 原 CQt（jsx 154470） */
function shouldCompleteTransition(opts: {
  isPlanItem: boolean;
  attemptStatus?: string;
  providerUsable: boolean;
}): boolean {
  return !opts.isPlanItem || opts.attemptStatus === "succeeded" || (opts.attemptStatus === undefined && opts.providerUsable);
}

/** 原 wQt（jsx 154477） */
function shouldTrackInFlightAttempt(opts: {
  isPlanItem: boolean;
  attemptKey: string | null;
  attemptStatus?: string;
}): boolean {
  return opts.isPlanItem && opts.attemptKey !== null && opts.attemptStatus === "inFlight";
}

/** 原 TQt（jsx 154484）：深链接意图归一化（仅四个计划预设） */
function normalizeModelProviderIntent(intent?: { providerId: string } | null): string | null {
  switch (intent?.providerId) {
    case PROVIDER_IDS.zaiCodingPlan:
    case PROVIDER_IDS.zaiStartPlan:
    case PROVIDER_IDS.bigmodelCodingPlan:
    case PROVIDER_IDS.bigmodelStartPlan:
      return intent.providerId;
    default:
      return null;
  }
}

/** 原 EQt（jsx 154495）：保存前后 Coding Plan 供应商 API Key 是否变化 */
function codingPlanApiKeyChanged(before: ModelProvider | undefined, after: ModelProvider): boolean {
  return after.id === PROVIDER_IDS.zaiCodingPlan ||
    after.id === PROVIDER_IDS.zaiStartPlan ||
    after.id === PROVIDER_IDS.bigmodelCodingPlan ||
    after.id === PROVIDER_IDS.bigmodelStartPlan
    ? (before?.apiKey.trim() ?? "") !== after.apiKey.trim()
    : false;
}

/** 原 T7（jsx 154498）：供应商 → OAuth 域（zai|bigmodel|null） */
function oauthDomainOfProvider(providerId: string): "zai" | "bigmodel" | null {
  return providerId === PROVIDER_IDS.zai || providerId === PROVIDER_IDS.zaiCodingPlan || providerId === PROVIDER_IDS.zaiStartPlan
    ? "zai"
    : providerId === PROVIDER_IDS.bigmodel || providerId === PROVIDER_IDS.bigmodelCodingPlan || providerId === PROVIDER_IDS.bigmodelStartPlan
      ? BIGMODEL_OAUTH_PROVIDER_ID
      : null;
}

/** 原 DQt（jsx 154501） */
function presetMatchesFamilyDomain(presetId: string, domain: string | null): boolean {
  const providerDomain = oauthDomainOfProvider(presetId);
  return !domain || !providerDomain ? true : providerFamilyOf(presetId) === domain;
}

/** 原 OQt（jsx 154505）：按 oauth_provider_inactive 推断缺省族域 */
function resolveDefaultFamilyDomain(providers: ModelProvider[]): "zai" | "bigmodel" | null {
  const zaiInactive = providers.some(
    (provider) => oauthDomainOfProvider(provider.id) === "zai" && provider.systemDisabledReason === "oauth_provider_inactive"
  );
  const bigmodelInactive = providers.some(
    (provider) => oauthDomainOfProvider(provider.id) === "bigmodel" && provider.systemDisabledReason === "oauth_provider_inactive"
  );
  return bigmodelInactive && !zaiInactive ? "zai" : zaiInactive && !bigmodelInactive ? BIGMODEL_OAUTH_PROVIDER_ID : null;
}

/** 原 kQt（jsx 154510） */
function replaceProviderInList(providers: ModelProvider[], next: ModelProvider): ModelProvider[] {
  return providers.map((provider) => (provider.id === next.id ? next : provider));
}

/** 原 AQt（jsx 154513） */
function hasActiveProviderInDomain(providers: ModelProvider[], domain: string): boolean {
  return providers.some((provider) => providerFamilyOf(provider.id) === domain && isProviderUsable(provider));
}

/** 原 jQt（jsx 154516）：挂起模式与已存一致时清除 */
function clearPendingModeIfUnchanged(
  pending: Record<string, string>,
  familyId: string,
  mode: string
): Record<string, string> {
  if (pending[familyId] !== mode) return pending;
  const { [familyId]: _removed, ...rest } = pending;
  return rest;
}

/** 原 MQt（jsx 154524）：挂起选中键与已存一致时清除 */
function clearPendingKeyIfUnchanged(
  pending: Record<string, string>,
  familyId: string,
  key: string
): Record<string, string> {
  if (pending[familyId] !== key) return pending;
  const { [familyId]: _removed, ...rest } = pending;
  return rest;
}

/** 原 NQt（jsx 154532）：team-plan 选中键是否仍在订阅内 */
function isTeamPlanKeyStillSubscribed(opts: {
  selectedKey?: string;
  subscribedTeamProducts: BigModelProduct[];
}): boolean {
  const key = opts.selectedKey?.trim() ?? "";
  const parsed = parseTeamPlanKey(key);
  if (!parsed?.projectId) return true;
  return opts.subscribedTeamProducts.some((product) =>
    (product.teamProjects && product.teamProjects.length > 0
      ? product.teamProjects
      : [{ organizationId: product.organizationId ?? null, projectId: product.projectId ?? null }]
    ).some((project) => {
      const organizationId = project.organizationId?.trim() ?? "";
      const projectId = project.projectId?.trim() ?? "";
      return projectId
        ? isSameTeamPlanKey(
            buildTeamPlanKey({ productId: product.productId, organizationId, projectId }),
            key
          )
        : false;
    })
  );
}

/** 原 E7（jsx 154550）：预设 → 其 API Key 供应商导航键 */
function presetNavKeyOf(presetId: string): string | null {
  const family = familyDescriptorOf(presetId);
  return family ? presetNavKey(family.apiKeyProviderId) : null;
}

/** 原 PQt（jsx 154554） */
function resolveNavItemStorageKey(item: ModelProviderNavItem): string {
  return item.type !== "preset" && item.type !== "codingPlan" && item.type !== "teamPlan"
    ? item.key
    : presetNavKeyOf(item.presetId ?? "") ?? item.key;
}

/** 原 rQt（js 191351 / jsx 154111）：导航模型 hook */
export function useModelProviderNavigationModel(opts: {
  presetProviders: Array<PresetProviderEntry & { provider: ModelProvider | null }>;
  modelProviders: ModelProvider[];
  modelProvidersLoading?: boolean;
  displayOrder: { providerIds: string[]; updatedAt?: number } | null;
  codingPlanEntitlements?: Record<string, CodingPlanEntitlement>;
  providerFamilyDomain?: string | null;
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  pendingModelProviderFamilySelectedKeys?: Record<string, string>;
  familyConnectionSettingsLoading?: boolean;
  familyConnectionSettingsFailed?: boolean;
  subscribedTeamProducts?: BigModelProduct[];
  showPurchasedTeamPlanFallback?: boolean;
  selectedNodeKey: string | null;
  setSelectedNodeKey: (key: string | null) => void;
  intl: IntlShape;
}): {
  navigationGroups: ModelProviderNavigationGroup[];
  navigationItems: ModelProviderNavItem[];
  selectedNavItem: ModelProviderNavItem | null;
} {
  const {
    presetProviders,
    modelProviders,
    modelProvidersLoading = false,
    displayOrder,
    codingPlanEntitlements = {},
    providerFamilyDomain = null,
    modelProviderFamilyModes = {},
    modelProviderFamilySelectedKeys = {},
    pendingModelProviderFamilySelectedKeys = {},
    familyConnectionSettingsLoading = false,
    familyConnectionSettingsFailed = false,
    subscribedTeamProducts = [],
    showPurchasedTeamPlanFallback = false,
    selectedNodeKey,
    setSelectedNodeKey,
    intl,
  } = opts;

  const customProviders = React.useMemo(
    () => sortProvidersByDisplayOrder(modelProviders.filter((provider) => !isBuiltInProviderId(provider.id)), displayOrder),
    [displayOrder, modelProviders]
  );

  const codingPlanItems = React.useMemo<ModelProviderNavItem[]>(
    () =>
      CODING_PLAN_PRESETS.filter((preset) => presetInFamilyDomain(preset.oauthProviderId, providerFamilyDomain)).map(
        (preset) => {
          const provider = toManagedProvider(modelProviders.find((candidate) => candidate.id === preset.id) ?? null);
          const entitlement = codingPlanEntitlements[preset.id];
          const status = resolveCodingPlanStatus({ provider, entitlement, modelProvidersLoading });
          return {
            key: codingPlanNavKey(preset.id),
            type: "codingPlan" as const,
            presetId: preset.id,
            oauthProviderId: preset.oauthProviderId,
            label: `${preset.providerName} - ${intl.formatMessage({
              id: isStartPlanPreset(preset.id)
                ? "settings.modelProvider.connectionMode.startPlan"
                : "settings.modelProvider.connectionMode.codingPlan",
            })}`,
            providerName: preset.providerName,
            provider,
            status: status.status,
            planLevel: status.planLevel,
            currentProductId: status.currentProductId,
            subscriptionBillingCycle: status.subscriptionBillingCycle,
            subscriptionRenewTime: status.subscriptionRenewTime,
            subscriptionExpireTime: status.subscriptionExpireTime,
            quotaLimits: status.quotaLimits,
            purchaseUrl: preset.purchaseUrl,
            statusActive: provider ? isProviderActive(provider) : false,
          };
        }
      ),
    [codingPlanEntitlements, intl, modelProviders, modelProvidersLoading, providerFamilyDomain]
  );

  const connectionModeItems = React.useMemo(
    () =>
      buildTeamPlanNavItems({
        items: codingPlanItems,
        codingPlanEntitlements,
        subscribedTeamProducts,
        showPurchasedTeamPlanFallback,
        selectedTeamPlanKey: pendingModelProviderFamilySelectedKeys.bigmodel || modelProviderFamilySelectedKeys.bigmodel,
      }),
    [codingPlanEntitlements, showPurchasedTeamPlanFallback, codingPlanItems, modelProviderFamilySelectedKeys, pendingModelProviderFamilySelectedKeys, subscribedTeamProducts]
  );

  const navigationGroups = React.useMemo<ModelProviderNavigationGroup[]>(
    () => [
      {
        id: "preset",
        title: intl.formatMessage({ id: "settings.modelProvider.presetTitle" }),
        items: presetProviders.map(({ id, displayName, provider }) => ({
          key: presetNavKey(id),
          type: "preset" as const,
          presetId: id,
          label: displayName ?? id,
          provider,
          displayName,
          statusActive: resolvePresetActiveState({
            presetId: id,
            provider,
            connectionModeItems,
            modelProviderFamilyModes,
            modelProviderFamilySelectedKeys: { ...modelProviderFamilySelectedKeys, ...pendingModelProviderFamilySelectedKeys },
          }),
        })),
      },
      {
        id: "custom",
        title: intl.formatMessage({ id: "settings.modelProvider.customTitle" }),
        items: [
          ...customProviders.map((provider) => ({
            key: customNavKey(provider.id),
            type: "custom" as const,
            label: provider.name,
            provider,
            statusActive: isProviderActive(provider) && isPresetProvider(provider),
          })),
          {
            key: "custom:add",
            type: "addCustom" as const,
            label: intl.formatMessage({ id: "settings.modelProvider.add" }),
          },
        ],
      },
    ],
    [customProviders, connectionModeItems, intl, modelProviderFamilyModes, modelProviderFamilySelectedKeys, pendingModelProviderFamilySelectedKeys, presetProviders]
  );

  const navigationItems = React.useMemo(() => {
    const groupItems = navigationGroups.flatMap((group) => group.items);
    const knownKeys = new Set(groupItems.map((item) => item.key));
    return [...groupItems, ...connectionModeItems.filter((item) => !knownKeys.has(item.key))];
  }, [connectionModeItems, navigationGroups]);

  const selectableNavigationItems = React.useMemo(
    () => navigationItems.filter((item) => item.type !== "codingPlanLoading"),
    [navigationItems]
  );
  const selectableGroupItems = React.useMemo(
    () => navigationGroups.flatMap((group) => group.items).filter((item) => item.type !== "codingPlanLoading"),
    [navigationGroups]
  );
  const navigationItemByKey = React.useMemo(
    () => new Map(selectableNavigationItems.map((item) => [item.key, item] as const)),
    [selectableNavigationItems]
  );
  const groupItemByKey = React.useMemo(
    () => new Map(selectableGroupItems.map((item) => [item.key, item] as const)),
    [selectableGroupItems]
  );

  const selectedNavItem = selectedNodeKey
    ? resolveSelectedNavItem({
        selectedNodeKey,
        navigationItemByKey,
        selectableNavigationItems,
        modelProviderFamilyModes,
        modelProviderFamilySelectedKeys,
        pendingModelProviderFamilySelectedKeys,
        familyConnectionSettingsLoading,
        familyConnectionSettingsFailed,
      })
    : null;
  const fallbackKey = resolveDefaultSelectedNodeKey({
    selectedNodeKey,
    selectableNavigationItems,
  });

  React.useEffect(() => {
    if ((selectedNodeKey && groupItemByKey.has(selectedNodeKey)) || selectedNodeKey !== fallbackKey) {
      setSelectedNodeKey(fallbackKey);
    }
  }, [fallbackKey, selectedNavItem, selectedNodeKey, setSelectedNodeKey, groupItemByKey]);

  return { navigationGroups, navigationItems, selectedNavItem };
}

/* --- 分区壳/面板依赖的深层叶子（接口级；行号见头部映射） --- */

declare const ModelProviderNavRail: React.FC<{
  navigationGroups: ModelProviderNavigationGroup[];
  selectedNodeKey: string | null;
  presetLoading: boolean;
  customLoading: boolean;
  onSelectNavItem: (item: ModelProviderNavItem, mode?: string) => void;
  onReorderProviderIds: (providerIds: string[]) => void;
}>; // eQt（191183 / 154042）
declare function isProviderSectionRefreshing(opts: { presetLoading: boolean; customLoading: boolean }): boolean; // tQt（191286 / 154088）
declare const ProviderConfigCardForm: React.FC<{
  provider: ModelProvider;
  onSave: (provider: ModelProvider) => void;
  onDelete?: (provider: ModelProvider) => void;
  onTestModel: (provider: ModelProvider, model: string) => Promise<unknown>;
  readOnlyEndpoints?: boolean;
  readOnlyApiKey?: boolean;
  presetApiKeyUrl?: string | null;
  onOpenPresetApiKey?: () => void;
  usageUrl?: string;
  nameEditable?: boolean;
  headerVisible?: boolean;
  headerActionsVisible?: boolean;
  apiKeyDisabledHintVisible?: boolean;
  startPlanMode?: boolean;
  modelsReadOnly?: boolean;
  statusSection?: React.ReactNode;
  hideConnectionSection?: boolean;
  hideApiKeySection?: boolean;
}>; // u7（188376 / 151911）
declare const AddCustomProviderDraftForm: React.FC<{
  draft: unknown;
  onDraftChange: (draft: unknown) => void;
  onCreateProvider: (provider: ModelProvider) => void;
}>; // CXt（188882 / 152305）
declare const SectionLoadingPlaceholder: React.FC<{ loadingLabel: string }>; // v7（189650 / 152857）
declare const PresetEmptyState: React.FC<{ displayName?: string; messageId?: string }>; // nZt（189662 / 152862）
declare const CodingPlanStatusSection: React.FC<Record<string, unknown>>; // rZt（189675 / 152873）
declare const ProviderCardShell: React.FC<{ header: React.ReactNode; children: React.ReactNode }>; // x7（190191 / 153248）
declare const ProviderCardHeader: React.FC<{
  selectedNavItem: ModelProviderNavItem;
  trailingAction?: React.ReactNode;
}>; // yZt（190194 / 153254）
declare const ConnectionModeNav: React.FC<{
  selectedNavItem: ModelProviderNavItem | null;
  navigationItems: ModelProviderNavItem[];
  connectionSettingsFailed: boolean;
  onSelectNavItem: (item: ModelProviderNavItem, mode?: string) => void;
}>; // bZt（190231 / 153271）
declare const CodingPlanPurchaseBanner: React.FC<{
  providerId: string;
  startPlanPreview?: unknown; // 原 t（MZt 内部经 MXt 189380 格式化）
  personalVisible?: boolean;
  teamVisible?: boolean;
  soldOutVisible?: boolean;
  accountDisconnected?: boolean;
  onSelect: (audience: "personal" | "team", opts?: { eventText?: string; initialTeamPlanKey?: string }) => void;
  onSelectStartPlan: () => void;
}>; // MZt（190703 / 153690）
declare const StatusTitleDescription: React.FC<{ title: string; description: string }>; // WZt（191011 / 153927）

/* ============================================================================
 * 2. 分区壳（原 nQt，js 191289 / jsx 154091）
 * ==========================================================================*/

/** 原 nQt：描述行 + 刷新按钮 + `grid-cols-[56px_1fr] md:[224px_1fr]` 双栏卡 */
export function ModelProviderSectionShell(props: {
  description: string;
  refreshLabel: string;
  loadingLabel: string;
  presetLoading: boolean;
  customLoading: boolean;
  onRefresh: () => void;
  navigationGroups: ModelProviderNavigationGroup[];
  selectedNodeKey: string | null;
  onSelectNavItem: (item: ModelProviderNavItem, mode?: string) => void;
  onReorderProviderIds: (providerIds: string[]) => void;
  children: React.ReactNode;
}) {
  const {
    description,
    refreshLabel,
    loadingLabel,
    presetLoading,
    customLoading,
    onRefresh,
    navigationGroups,
    selectedNodeKey,
    onSelectNavItem,
    onReorderProviderIds,
    children,
  } = props;
  const refreshing = isProviderSectionRefreshing({ presetLoading, customLoading });
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-ui-base leading-6 text-foreground-subtle">{description}</p>
        <Tooltip title={refreshing ? loadingLabel : refreshLabel}>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRefresh}
            disabled={refreshing}
            aria-busy={refreshing}
            aria-label={refreshing ? loadingLabel : refreshLabel}
          >
            <RefreshIcon className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
          </Button>
        </Tooltip>
      </div>
      <div className="rounded-xl border border-border bg-card">
        <div className="grid min-h-[36rem] grid-cols-[56px_minmax(0,1fr)] gap-0 md:grid-cols-[224px_minmax(0,1fr)]">
          <ModelProviderNavRail
            navigationGroups={navigationGroups}
            selectedNodeKey={selectedNodeKey}
            presetLoading={presetLoading}
            customLoading={customLoading}
            onSelectNavItem={onSelectNavItem}
            onReorderProviderIds={onReorderProviderIds}
          />
          <div className="min-w-0 p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. 右栏面板（原 AZt，js 190379 / jsx 153409）
 * ==========================================================================*/

/** 原 AZt：按选中条目类型分派（addCustom/preset/codingPlan/teamPlan/custom） */
export function ModelProviderPanel(props: {
  selectedNavItem: ModelProviderNavItem | null;
  navigationItems?: ModelProviderNavItem[];
  connectionSettingsFailed?: boolean;
  presetLoading: boolean;
  codingPlanPurchaseTokenAuthenticatedByProviderId: Record<string, boolean>;
  codingPlanAuthError: string | null;
  presetSubscriptionProviderId: string | null;
  codingPlanStatusSyncProviderId: string | null;
  codingPlanDisconnectProviderId: string | null;
  codingPlanProductsRefreshToken: number;
  addProviderDraft: unknown;
  onAddProviderDraftChange: (draft: unknown) => void;
  onSave: (provider: ModelProvider) => void;
  onDelete: (provider: ModelProvider) => void;
  onTestModel: (provider: ModelProvider, model: string) => Promise<unknown>;
  onCodingPlanLogin: (
    presetId: string,
    oauthProviderId: string | undefined,
    providerName: string | undefined,
    status: string,
    forceOAuth?: { forceOAuth?: boolean }
  ) => void;
  onCodingPlanDisconnect: (presetId: string, oauthProviderId: string | undefined, providerName: string | undefined) => void;
  onCreateProvider: (provider: ModelProvider) => void;
  onOpenPresetApiKey: (presetId: string) => void;
  onOpenApiKeyUrl: (url: string) => void;
  onOpenBigModelRegistration: () => void;
  onCodingPlanPurchaseComplete: () => Promise<void>;
  onSelectNavItem: (item: ModelProviderNavItem, mode?: string) => void;
}) {
  const {
    selectedNavItem,
    navigationItems = selectedNavItem ? [selectedNavItem] : [],
    connectionSettingsFailed = false,
    presetLoading,
    codingPlanPurchaseTokenAuthenticatedByProviderId,
    codingPlanAuthError,
    presetSubscriptionProviderId,
    codingPlanStatusSyncProviderId,
    codingPlanDisconnectProviderId,
    codingPlanProductsRefreshToken,
    addProviderDraft,
    onAddProviderDraftChange,
    onSave,
    onDelete,
    onTestModel,
    onCodingPlanLogin,
    onCodingPlanDisconnect,
    onCreateProvider,
    onOpenPresetApiKey,
    onOpenApiKeyUrl,
    onOpenBigModelRegistration,
    onCodingPlanPurchaseComplete,
    onSelectNavItem,
  } = props;
  const { intl } = useIntlContext();
  const { openCodingPlanUpgrade } = useUpgradeEntry();
  const loadingLabel = intl.formatMessage({ id: "common.loading" });
  const [upgradePlansProviderId, setUpgradePlansProviderId] = React.useState<string | null>(null);
  const [purchaseAudience, setPurchaseAudience] = React.useState<"personal" | "team">("personal");
  const [funnelContext, setFunnelContext] = React.useState<string | null>(null);
  const selectedKey = selectedNavItem?.key ?? null;
  const teamPlanScope = React.useMemo(
    () =>
      selectedNavItem !== null && isTeamPlanNavItem(selectedNavItem)
        ? {
            organizationId: selectedNavItem.organizationId.trim(),
            projectId: selectedNavItem.projectId.trim(),
          }
        : null,
    [selectedNavItem]
  );
  const teamUnavailable =
    selectedNavItem?.type === "teamPlan" &&
    selectedNavItem.statusLabelId === "settings.modelProvider.codingPlan.status.teamUnavailable";
  const subscriptionState = useSubscriptionSnapshot({
    enabled: !!teamPlanScope && !teamUnavailable,
    includeSubscription: true,
    preferredProviderId: selectedNavItem?.type === "teamPlan" ? selectedNavItem.presetId : undefined,
    allowDisabledPreferredProvider: selectedNavItem?.type === "teamPlan",
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    organizationId: teamPlanScope?.organizationId,
    projectId: teamPlanScope?.projectId,
    cacheKey: selectedNavItem?.key ?? undefined,
  });
  const mergedPlanItem =
    selectedNavItem !== null && isCodingPlanLikeItem(selectedNavItem)
      ? mergeItemWithSubscription(selectedNavItem, subscriptionState)
      : null;
  const startPlanPreviewState = useStartPlanPreview({
    enabled:
      mergedPlanItem !== null &&
      (mergedPlanItem.oauthProviderId === "bigmodel" || mergedPlanItem.oauthProviderId === "zai") &&
      mergedPlanItem.status === "disconnected",
  });
  const connectionModeNav = (
    <ConnectionModeNav
      selectedNavItem={selectedNavItem}
      navigationItems={navigationItems}
      connectionSettingsFailed={connectionSettingsFailed}
      onSelectNavItem={onSelectNavItem}
    />
  );

  React.useEffect(() => {
    setUpgradePlansProviderId(null);
    setPurchaseAudience("personal");
    setFunnelContext(null);
  }, [selectedKey]);

  if (!selectedNavItem) return <SectionLoadingPlaceholder loadingLabel={loadingLabel} />;

  if (selectedNavItem.type === "addCustom") {
    return <AddCustomProviderDraftForm draft={addProviderDraft} onDraftChange={onAddProviderDraftChange} onCreateProvider={onCreateProvider} />;
  }

  if (selectedNavItem.type === "preset") {
    if (!selectedNavItem.provider) {
      return presetLoading ? (
        <SectionLoadingPlaceholder loadingLabel={loadingLabel} />
      ) : (
        <PresetEmptyState
          displayName={selectedNavItem.displayName}
          messageId={selectedNavItem.presetId === PROVIDER_IDS.zapi ? "settings.modelProvider.zapiPresetEmpty" : undefined}
        />
      );
    }
    const apiKeyUrl = presetApiKeyUrl(selectedNavItem.presetId ?? "");
    const provider = selectedNavItem.provider;
    const family = familyDescriptorOf(selectedNavItem.presetId ?? "");
    const apiKeyHintVisible = !!family && selectedNavItem.statusActive === false && provider.apiKey.trim().length === 0;
    return (
      <ProviderCardShell
        header={<ProviderCardHeader selectedNavItem={selectedNavItem} trailingAction={family ? connectionModeNav : undefined} />}
      >
        <ProviderConfigCardForm
          provider={provider}
          onSave={onSave}
          onTestModel={onTestModel}
          readOnlyEndpoints={true}
          presetApiKeyUrl={apiKeyUrl}
          onOpenPresetApiKey={apiKeyUrl ? () => onOpenPresetApiKey(selectedNavItem.presetId ?? "") : undefined}
          usageUrl={selectedNavItem.presetId === PROVIDER_IDS.zapi ? "http://192.168.6.166:8080/my" : undefined}
          nameEditable={false}
          headerVisible={!family}
          headerActionsVisible={family ? false : undefined}
          apiKeyDisabledHintVisible={apiKeyHintVisible}
        />
      </ProviderCardShell>
    );
  }

  if (mergedPlanItem) {
    const item = mergedPlanItem;
    const boundProvider = item.provider?.id === item.presetId ? item.provider : null;
    const codingPlanApiKeyAuthenticated = (boundProvider?.apiKey.trim().length ?? 0) > 0;
    const codingPlanPurchaseTokenAuthenticated = codingPlanPurchaseTokenAuthenticatedByProviderId[item.presetId ?? ""] === true;
    const loginPending = presetSubscriptionProviderId === item.presetId;
    const statusSyncPending = codingPlanStatusSyncProviderId === item.presetId;
    const disconnectPending = codingPlanDisconnectProviderId === item.presetId;
    const purchaseStateKnown = item.status === "purchased" || item.status === "notPurchased";
    const viewState =
      disconnectPending || (statusSyncPending && !purchaseStateKnown)
        ? { displayStatus: "checking", actionStatus: "checking", balanceStatus: "checking", loginLoading: statusSyncPending }
        : codingPlanViewState({ status: item.status ?? "", loginPending: loginPending || statusSyncPending });
    const statusLabelId = viewState.displayStatus === "checking" ? undefined : item.statusLabelId;
    const showPurchasedProviderCard = boundProvider !== null && item.status === "purchased";
    const bannerCopy = teamUnavailable ? null : purchaseBannerCopy(viewState.displayStatus, intl);
    const upgradePlansVisible = upgradePlansProviderId === item.presetId;
    const handleUpgradePlansVisibleChange = (visible: boolean) => {
      if (visible) setPurchaseAudience("personal");
      setUpgradePlansProviderId(visible ? item.presetId ?? null : null);
      if (!visible) setFunnelContext(null);
    };
    const soldOutVisible =
      viewState.displayStatus === "notPurchased" &&
      (item.oauthProviderId === "zai" || (item.oauthProviderId === "bigmodel" && codingPlanPurchaseTokenAuthenticated));
    const accountDisconnected =
      (item.oauthProviderId === "bigmodel" || item.oauthProviderId === "zai") && viewState.displayStatus === "disconnected";
    const startPlanPreviewVisible = viewState.displayStatus === "disconnected" && !startPlanPreviewState.loading && startPlanPreviewState.preview !== null;
    const handleLogin = () => {
      onCodingPlanLogin(item.presetId ?? "", item.oauthProviderId, item.providerName, item.status ?? "");
    };
    const handlePurchaseSelect = (audience: "personal" | "team", opts: { eventText?: string; initialTeamPlanKey?: string } = {}) => {
      setPurchaseAudience(audience);
      if (resolvePurchaseIntent(viewState.displayStatus) === "login") {
        onCodingPlanLogin(item.presetId ?? "", item.oauthProviderId, item.providerName, item.status ?? "");
        return;
      }
      const context = upgradeFunnelContext({
        providerId: item.presetId ?? "",
        upgradeSource: audience === "team" ? "setting_team_plan_banner" : "setting_personal_plan_banner",
        eventRegion: "app.setting",
        eventText:
          opts.eventText ??
          intl.formatMessage({
            id:
              audience === "team"
                ? "settings.modelProvider.codingPlan.purchaseBanner.teamTitle"
                : "settings.modelProvider.codingPlan.purchaseBanner.personalTitle",
          }),
        entryPlanState: entryPlanStateOf({
          displayStatus: viewState.displayStatus,
          providerId: item.presetId ?? "",
          planLevel: item.planLevel,
        }),
        purchaseAudience: audience,
      });
      setFunnelContext(context);
      openCodingPlanUpgrade({
        providerId: item.presetId ?? "",
        initialAudience: audience,
        initialTeamPlanKey: opts.initialTeamPlanKey,
        funnelContext: context,
      });
    };
    const startPlanMode = isStartPlanPreset(item.presetId ?? "");
    const header = <ProviderCardHeader selectedNavItem={item} trailingAction={connectionModeNav} />;

    return showPurchasedProviderCard && boundProvider ? (
      <ProviderCardShell header={header}>
        <ProviderConfigCardForm
          provider={boundProvider}
          onSave={onSave}
          onTestModel={onTestModel}
          readOnlyEndpoints={true}
          startPlanMode={startPlanMode}
          modelsReadOnly={startPlanMode}
          readOnlyApiKey={true}
          nameEditable={false}
          statusSection={
            <CodingPlanStatusSection
              providerId={item.presetId}
              providerName={item.providerName}
              status={item.status}
              viewState={viewState}
              planLevel={item.planLevel}
              currentProductId={item.currentProductId}
              productsRefreshToken={codingPlanProductsRefreshToken}
              subscriptionRenewTime={item.subscriptionRenewTime}
              subscriptionExpireTime={item.subscriptionExpireTime}
              quotaLimits={item.quotaLimits}
              authError={codingPlanAuthError}
              onOpenRegistration={onOpenBigModelRegistration}
              purchaseUrl={item.purchaseUrl}
              inactivePlanTitle={item.inactivePlanTitle}
              statusLabelId={statusLabelId}
              onOpenPurchase={onOpenApiKeyUrl}
              onDisconnect={
                (item.oauthProviderId === "bigmodel" || item.oauthProviderId === "zai") && boundProvider.id === item.presetId
                  ? () => onCodingPlanDisconnect(item.presetId ?? "", item.oauthProviderId, item.providerName)
                  : undefined
              }
              disconnectLoading={codingPlanDisconnectProviderId === item.presetId}
              codingPlanApiKeyAuthenticated={codingPlanApiKeyAuthenticated}
              codingPlanPurchaseTokenAuthenticated={codingPlanPurchaseTokenAuthenticated}
              loginActionVisible={true}
              loginActionPlacement="trailing"
              onLogin={(forceOAuth?: { forceOAuth?: boolean }) =>
                onCodingPlanLogin(
                  item.presetId ?? "",
                  item.oauthProviderId,
                  item.providerName,
                  upgradePlansVisible ? "unavailable" : item.status ?? "",
                  forceOAuth
                )
              }
              onPurchaseComplete={onCodingPlanPurchaseComplete}
              onOpenUpgradePlans={(request: { initialAudience: "personal" | "team"; funnelContext?: string }) => {
                openCodingPlanUpgrade({
                  providerId: item.presetId ?? "",
                  initialAudience: request.initialAudience,
                  funnelContext: request.funnelContext ?? undefined,
                });
              }}
              upgradePlansVisible={upgradePlansVisible}
              onUpgradePlansVisibleChange={handleUpgradePlansVisibleChange}
              purchaseInitialAudience={purchaseAudience}
              funnelContext={funnelContext}
              startPlanPreviewVisible={false}
            />
          }
          hideConnectionSection={true}
          hideApiKeySection={true}
          headerActionsVisible={false}
        />
      </ProviderCardShell>
    ) : (
      <ProviderCardShell header={header}>
        <div className="space-y-3">
          <CodingPlanStatusSection
            providerId={item.presetId}
            providerName={item.providerName}
            status={item.status}
            viewState={viewState}
            codingPlanApiKeyAuthenticated={codingPlanApiKeyAuthenticated}
            codingPlanPurchaseTokenAuthenticated={codingPlanPurchaseTokenAuthenticated}
            loginActionVisible={true}
            loginActionPlacement="trailing"
            purchaseUrl={item.purchaseUrl}
            planLevel={item.planLevel}
            inactivePlanTitle={item.inactivePlanTitle}
            statusLabelId={statusLabelId}
            currentProductId={item.currentProductId}
            productsRefreshToken={codingPlanProductsRefreshToken}
            subscriptionRenewTime={item.subscriptionRenewTime}
            subscriptionExpireTime={item.subscriptionExpireTime}
            quotaLimits={item.quotaLimits}
            authError={codingPlanAuthError}
            onOpenRegistration={onOpenBigModelRegistration}
            onLogin={(forceOAuth?: { forceOAuth?: boolean }) =>
              onCodingPlanLogin(item.presetId ?? "", item.oauthProviderId, item.providerName, item.status ?? "", forceOAuth)
            }
            onOpenPurchase={onOpenApiKeyUrl}
            onDisconnect={
              (item.oauthProviderId === "bigmodel" || item.oauthProviderId === "zai") &&
              item.provider?.id === item.presetId &&
              item.status !== "disconnected"
                ? () => onCodingPlanDisconnect(item.presetId ?? "", item.oauthProviderId, item.providerName)
                : undefined
            }
            disconnectLoading={codingPlanDisconnectProviderId === item.presetId}
            onPurchaseComplete={onCodingPlanPurchaseComplete}
            onOpenUpgradePlans={(request: { initialAudience: "personal" | "team"; funnelContext?: string }) => {
              openCodingPlanUpgrade({
                providerId: item.presetId ?? "",
                initialAudience: request.initialAudience,
                funnelContext: request.funnelContext ?? undefined,
              });
            }}
            upgradePlansVisible={upgradePlansVisible}
            onUpgradePlansVisibleChange={handleUpgradePlansVisibleChange}
            purchaseInitialAudience={purchaseAudience}
            funnelContext={funnelContext}
            startPlanPreviewVisible={false}
          />
          {accountDisconnected || soldOutVisible || startPlanPreviewVisible ? (
            <CodingPlanPurchaseBanner
              providerId={item.presetId ?? ""}
              startPlanPreview={startPlanPreviewVisible ? startPlanPreviewState.preview : null}
              soldOutVisible={codingPlanPurchaseTokenAuthenticated}
              accountDisconnected={viewState.displayStatus === "disconnected"}
              onSelect={handlePurchaseSelect}
              onSelectStartPlan={handleLogin}
              teamVisible={item.oauthProviderId !== "zai"}
            />
          ) : bannerCopy ? (
            <StatusTitleDescription title={bannerCopy.title} description={bannerCopy.description} />
          ) : null}
        </div>
      </ProviderCardShell>
    );
  }

  if (selectedNavItem.type === "codingPlanLoading") return null;
  if (!selectedNavItem.provider) return <SectionLoadingPlaceholder loadingLabel={loadingLabel} />;

  const customProvider = selectedNavItem.provider;
  const customApiKeyUrl = customProvider.apiKeyUrl;
  return (
    <ProviderConfigCardForm
      provider={customProvider}
      onSave={onSave}
      onDelete={() => onDelete(customProvider)}
      onTestModel={onTestModel}
      presetApiKeyUrl={customApiKeyUrl}
      onOpenPresetApiKey={customApiKeyUrl ? () => onOpenApiKeyUrl(customApiKeyUrl) : undefined}
    />
  );
}

/** 原 jZt（jsx 153690 尾）：断开 → 登录入口，其余 → 购买入口 */
function resolvePurchaseIntent(displayStatus: string): "login" | "purchase" {
  return displayStatus === "disconnected" ? "login" : "purchase";
}

/** AZt 内 L（MY）：Start Plan 预览态 hook（接口级，F12 族） */
declare function useStartPlanPreview(opts: { enabled: boolean }): { loading: boolean; preview: unknown };

/* ============================================================================
 * 4. 分区根（原 FQt，js 191784–192348 / jsx 154557–155115）
 * ==========================================================================*/

export interface ModelProviderSettingsSectionProps {
  pendingModelProviderTarget?: { providerId: string };
  onConsumePendingModelProviderTarget?: () => void;
}

/** 原 FQt：模型供应商分区根（深链接意图 + OAuth 同步效果链 + 导航/面板装配） */
export function ModelProviderSettingsSection({
  pendingModelProviderTarget,
  onConsumePendingModelProviderTarget,
}: ModelProviderSettingsSectionProps = {}) {
  const { intl } = useIntlContext();
  const confirmDialog = useConfirmDialog();
  const platform = usePlatformService();
  const { modelProviderService, oauthService, credentialService, codingPlanSubscriptionService } = useServices();
  const zapiEnabled = useZapiEnabled();
  const {
    modelProviders,
    displayOrder,
    loading,
    refreshing,
    refresh,
    saveProvider,
    deleteProvider,
    saveDisplayOrder,
    testModelConnectivity,
  } = useModelProvidersStore();
  const [initialIntent] = React.useState(() => readSettingsSectionIntent());
  const [selectedNodeKey, setSelectedNodeKey] = React.useState<string | null>(() => {
    const normalized = normalizeModelProviderIntent(initialIntent);
    return normalized ? presetNavKeyOf(normalized) : null;
  });
  const [presetSubscriptionProviderId, setPresetSubscriptionProviderId] = React.useState<string | null>(null);
  const [codingPlanStatusSyncProviderId, setCodingPlanStatusSyncProviderId] = React.useState<string | null>(null);
  const [codingPlanDisconnectProviderId, setCodingPlanDisconnectProviderId] = React.useState<string | null>(null);
  const [codingPlanProductsRefreshToken, bumpCodingPlanProductsRefreshToken] = React.useState(0);
  const [addProviderDraft, setAddProviderDraft] = React.useState<unknown>(createEmptyProviderDraft());
  const applyIntent = React.useCallback((intent?: { providerId: string }): boolean => {
    const normalized = normalizeModelProviderIntent(intent);
    if (!normalized) return false;
    setSelectedNodeKey(presetNavKeyOf(normalized));
    return true;
  }, []);
  React.useEffect(() => {
    if (pendingModelProviderTarget && applyIntent(pendingModelProviderTarget)) {
      onConsumePendingModelProviderTarget?.();
    }
  }, [applyIntent, onConsumePendingModelProviderTarget, pendingModelProviderTarget]);
  React.useEffect(
    () =>
      subscribeSettingsSectionIntent((section, payload) => {
        if (section === "modelProvider") {
          applyIntent(payload?.modelProviderId ? { providerId: payload.modelProviderId } : undefined);
        }
      }),
    [applyIntent]
  );

  const [purchaseTokenAuthenticatedByProviderId, setPurchaseTokenAuthenticatedByProviderId] = React.useState<Record<string, boolean>>({});
  const [activeOAuthProvider, setActiveOAuthProvider] = React.useState<string | null>(null);
  const [pendingFamilyModes, setPendingFamilyModes] = React.useState<Record<string, string>>({});
  const [pendingFamilySelectedKeys, setPendingFamilySelectedKeys] = React.useState<Record<string, string>>({});
  const presetSubscriptionLoginGuard = React.useRef<string | null>(null);
  const attemptStatusByProvider = React.useRef(new Map<string, string>());
  const pendingFamilyTransitionByAttempt = React.useRef(new Map<string, string>());
  const requestLoginEntry = useAppPreferenceStore((state) => state.requestLoginEntry);
  const setUser = useAppPreferenceStore((state) => state.setUser);
  const codingPlanAuthError = useAppPreferenceStore((state) => state.oauthError);
  const setOAuthError = useAppPreferenceStore((state) => state.setOAuthError);
  const markFamilyConnectionTransition = useAppPreferenceStore((state) => state.markModelProviderFamilyConnectionTransition);
  const { settings, loading: settingsLoading, error: settingsError, update: updateSettings } = useAppSettings();
  const bigModelProducts = useBigModelProducts({
    enabled: purchaseTokenAuthenticatedByProviderId[PROVIDER_IDS.bigmodelCodingPlan] === true,
    authenticated: true,
  });
  const refreshTeamPlanProducts = bigModelProducts.refresh;
  const subscribedTeamProducts = React.useMemo(
    () => bigModelProducts.snapshot?.productList.filter((product) => product.subscribed === true) ?? [],
    [bigModelProducts.snapshot?.productList]
  );
  const familyModes = settings?.modelProviderFamilyModes ?? {};
  const familySelectedKeys = settings?.modelProviderFamilySelectedKeys ?? {};
  const connectionSettingsFailed = settingsError !== null && settings === null;
  const effectiveFamilyModes = React.useMemo(() => ({ ...familyModes, ...pendingFamilyModes }), [familyModes, pendingFamilyModes]);
  const effectiveFamilySelectedKeys = React.useMemo(
    () => ({ ...familySelectedKeys, ...pendingFamilySelectedKeys }),
    [familySelectedKeys, pendingFamilySelectedKeys]
  );
  const showPurchasedTeamPlanFallback = !!parseTeamPlanKey(effectiveFamilySelectedKeys.bigmodel ?? "")?.projectId;
  /* 原 154628：ve = oe?.providerFamilyDomain ?? zr(I ?? OQt(d)) */
  const providerFamilyDomain =
    settings?.providerFamilyDomain ?? normalizeOAuthDomain(activeOAuthProvider ?? resolveDefaultFamilyDomain(modelProviders));
  const { entitlements, refresh: refreshCodingPlanEntitlements } = useCodingPlanEntitlements({
    modelProviders,
    loading,
    modelProviderFamilySelectedKeys: effectiveFamilySelectedKeys,
    suppressProviderFingerprintAutoRefresh: codingPlanStatusSyncProviderId !== null,
  });

  /* 失效 Team Plan 连接方式清理（原 154650–154704 两段等价效果，此处合并为一段） */
  React.useEffect(() => {
    if (!bigModelProducts.snapshot) return;
    const selectedKey = familySelectedKeys.bigmodel;
    if (!parseTeamPlanKey(selectedKey ?? "") || isTeamPlanKeyStillSubscribed({ selectedKey, subscribedTeamProducts })) return;
    setPendingFamilySelectedKeys((previous) => {
      const { bigmodel: _removed, ...rest } = previous;
      return rest;
    });
    const { bigmodel: _removedStored, ...restStored } = familySelectedKeys;
    updateSettings({ modelProviderFamilySelectedKeys: restStored }).catch((error) => {
      logger.warn("[ModelProviderSection] 清理失效 Team Plan 连接方式失败", { selectedTeamPlanKey: selectedKey, error });
    });
  }, [bigModelProducts.snapshot, familySelectedKeys, subscribedTeamProducts, updateSettings]);

  /* 挂起态与已存态收敛（原 154705–154716） */
  React.useEffect(() => {
    setPendingFamilyModes((previous) => {
      let next = previous;
      for (const [familyId, mode] of Object.entries(previous)) {
        if (familyModes[familyId] === mode) next = clearPendingModeIfUnchanged(next, familyId, mode);
      }
      return next;
    });
    setPendingFamilySelectedKeys((previous) => {
      let next = previous;
      for (const [familyId, key] of Object.entries(previous)) {
        if (familySelectedKeys[familyId] === key) next = clearPendingKeyIfUnchanged(next, familyId, key);
      }
      return next;
    });
  }, [familyModes, familySelectedKeys]);

  const bumpCodingPlanProducts = React.useCallback(() => {
    bumpCodingPlanProductsRefreshToken((token) => token + 1);
  }, []);

  /** 原 Se（154717）：读取购买令牌/登录态 */
  const refreshPurchaseTokenState = React.useCallback(
    async (opts: { shouldApply?: () => boolean; clearUserWhenLoggedOut?: boolean } = {}) => {
      const [activeProvider, zaiToken, bigmodelToken] = await Promise.all([
        credentialService.load("oauth:active_provider"),
        credentialService.load("oauth:zai:access_token"),
        credentialService.load(`oauth:${BIGMODEL_OAUTH_PROVIDER_ID}:access_token`),
      ]);
      if (opts.shouldApply && !opts.shouldApply()) return null;
      const resolved = activeProvider === "zai" || activeProvider === "bigmodel" ? activeProvider : null;
      setActiveOAuthProvider(resolved);
      setPurchaseTokenAuthenticatedByProviderId({
        [PROVIDER_IDS.zaiCodingPlan]: resolved === "zai" && (zaiToken?.trim().length ?? 0) > 0,
        [PROVIDER_IDS.zaiStartPlan]: resolved === "zai" && (zaiToken?.trim().length ?? 0) > 0,
        [PROVIDER_IDS.bigmodelCodingPlan]: resolved === "bigmodel" && (bigmodelToken?.trim().length ?? 0) > 0,
        [PROVIDER_IDS.bigmodelStartPlan]: resolved === "bigmodel" && (bigmodelToken?.trim().length ?? 0) > 0,
      });
      if (!resolved && opts.clearUserWhenLoggedOut) {
        setUser(null);
        setOAuthError(null);
      }
      return resolved;
    },
    [credentialService, setOAuthError, setUser]
  );

  /** 原 Ce（154728）：刷新 Coding Plan provider 缓存 + 全量编排 */
  const refreshCodingPlanProviderCache = React.useCallback(
    async (opts: { providerId?: string; reason: string; refreshPlanSnapshots?: boolean } = { reason: "unspecified" }) => {
      let refreshError: unknown = null;
      if (opts.providerId) {
        try {
          await modelProviderService.refreshCodingPlanApiKey(opts.providerId);
        } catch (error) {
          refreshError = error;
          logger.warn("[ModelProviderSection] 刷新 Coding Plan provider 缓存失败", {
            providerId: opts.providerId,
            reason: opts.reason,
            error,
          });
        }
      }
      await refreshAllProviderCaches({
        refreshModelProviders: refresh,
        refreshCodingPlanEntitlements,
        refreshTeamPlanProducts,
        refreshCodingPlanProducts: bumpCodingPlanProducts,
        refreshPurchaseTokenState,
        refreshPlanSnapshots: opts.refreshPlanSnapshots ?? true,
      });
      return { providerKeyRefreshed: refreshError === null, providerKeyRefreshError: refreshError };
    },
    [modelProviderService, refresh, refreshTeamPlanProducts, refreshCodingPlanEntitlements, bumpCodingPlanProducts, refreshPurchaseTokenState]
  );

  /** 原 we（154752）：Coding Plan provider 同步（含尝试状态机） */
  const syncCodingPlanProvider = React.useCallback(
    async (
      item: ModelProviderNavItem,
      reason: string,
      opts: { userTransition?: boolean; refreshPlanSnapshots?: boolean } = {}
    ) => {
      const attemptKey = codingPlanAttemptKey({
        activeOAuthProvider,
        oauthProviderId: item.oauthProviderId,
        providerId: item.presetId,
      });
      if (!attemptKey || (opts.userTransition !== true && attemptStatusByProvider.current.has(attemptKey))) return;
      attemptStatusByProvider.current.set(attemptKey, "inFlight");
      setCodingPlanStatusSyncProviderId(item.presetId ?? null);
      try {
        const result = await refreshCodingPlanProviderCache({
          providerId: item.presetId,
          reason,
          refreshPlanSnapshots: opts.refreshPlanSnapshots,
        });
        if (!result.providerKeyRefreshed) throw result.providerKeyRefreshError;
        attemptStatusByProvider.current.set(attemptKey, "succeeded");
        const pendingFamilyId = pendingFamilyTransitionByAttempt.current.get(attemptKey);
        if (pendingFamilyId) {
          pendingFamilyTransitionByAttempt.current.delete(attemptKey);
          markFamilyConnectionTransition(pendingFamilyId);
        }
      } catch (error) {
        attemptStatusByProvider.current.set(attemptKey, "failed");
        pendingFamilyTransitionByAttempt.current.delete(attemptKey);
        throw error;
      } finally {
        setCodingPlanStatusSyncProviderId((previous) => (previous === item.presetId ? null : previous));
      }
    },
    [activeOAuthProvider, markFamilyConnectionTransition, refreshCodingPlanProviderCache]
  );

  /* 初次加载购买令牌态（原 154780） */
  React.useEffect(() => {
    let cancelled = false;
    refreshPurchaseTokenState({ shouldApply: () => !cancelled });
    return () => {
      cancelled = true;
    };
  }, [modelProviders, refreshPurchaseTokenState]);

  /** 原 Te（154788）：可见预设（zapi 门控 + 族域过滤） */
  const presetProviders = React.useMemo(
    () =>
      PRESET_PROVIDERS.filter(
        (preset) => isPresetVisible({ presetId: preset.id, zapiEnabled }) && presetMatchesFamilyDomain(preset.id, providerFamilyDomain)
      ).map((preset) => ({
        ...preset,
        provider: modelProviders.find((provider) => provider.id === preset.id) ?? null,
      })),
    [providerFamilyDomain, modelProviders, zapiEnabled]
  );

  /* 预设订阅自动登录（原 154796–154820） */
  React.useEffect(() => {
    if (
      presetSubscriptionProviderId &&
      (modelProviders.find((provider) => provider.id === presetSubscriptionProviderId) ??
        presetProviders.find((preset) => preset.id === presetSubscriptionProviderId)?.provider)?.apiKey.trim()
    ) {
      if (presetSubscriptionLoginGuard.current === presetSubscriptionProviderId) return;
      presetSubscriptionLoginGuard.current = presetSubscriptionProviderId;
      void (async () => {
        trackAddModelSuccess({ platform, presetId: presetSubscriptionProviderId });
        try {
          await refreshCodingPlanProviderCache({ reason: "preset-subscription-login" });
        } finally {
          presetSubscriptionLoginGuard.current = null;
          setCodingPlanStatusSyncProviderId((previous) => (previous === presetSubscriptionProviderId ? null : previous));
          setPresetSubscriptionProviderId((previous) => (previous === presetSubscriptionProviderId ? null : previous));
        }
      })();
    }
  }, [modelProviders, platform, presetProviders, presetSubscriptionProviderId, refreshCodingPlanProviderCache]);
  React.useEffect(() => {
    if (!presetSubscriptionProviderId) return;
    const timer = setTimeout(() => {
      setCodingPlanStatusSyncProviderId((previous) => (previous === presetSubscriptionProviderId ? null : previous));
      setPresetSubscriptionProviderId((previous) => (previous === presetSubscriptionProviderId ? null : previous));
    }, PRESET_SUBSCRIPTION_LOGIN_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [presetSubscriptionProviderId]);

  const { navigationGroups, navigationItems, selectedNavItem } = useModelProviderNavigationModel({
    presetProviders,
    modelProviders,
    modelProvidersLoading: loading,
    displayOrder,
    codingPlanEntitlements: entitlements,
    subscribedTeamProducts,
    providerFamilyDomain,
    modelProviderFamilyModes: effectiveFamilyModes,
    modelProviderFamilySelectedKeys: effectiveFamilySelectedKeys,
    pendingModelProviderFamilySelectedKeys: pendingFamilySelectedKeys,
    showPurchasedTeamPlanFallback,
    familyConnectionSettingsLoading: settingsLoading && settings === null,
    familyConnectionSettingsFailed: connectionSettingsFailed,
    selectedNodeKey,
    setSelectedNodeKey,
    intl,
  });

  /* 激活 OAuth 与选中计划项的自动同步（原 154844） */
  React.useEffect(() => {
    if (
      (selectedNavItem?.type === "codingPlan" || selectedNavItem?.type === "teamPlan") &&
      activeOAuthProvider === selectedNavItem.oauthProviderId &&
      presetSubscriptionProviderId !== selectedNavItem.presetId &&
      codingPlanDisconnectProviderId !== selectedNavItem.presetId &&
      (selectedNavItem.provider?.apiKey.trim() ?? "").length > 0
    ) {
      return;
    }
    if (selectedNavItem?.type !== "codingPlan" && selectedNavItem?.type !== "teamPlan") return;
    if (activeOAuthProvider !== selectedNavItem.oauthProviderId) return;
    if (presetSubscriptionProviderId === selectedNavItem.presetId || codingPlanDisconnectProviderId === selectedNavItem.presetId) return;
    if ((selectedNavItem.provider?.apiKey.trim() ?? "").length > 0) return;
    syncCodingPlanProvider(selectedNavItem, "coding-plan-active-oauth-sync").catch((error) => {
      logger.warn("[ModelProviderSection] 自动同步 Coding Plan provider 失败", {
        providerId: selectedNavItem.presetId,
        error,
      });
    });
  }, [activeOAuthProvider, codingPlanDisconnectProviderId, presetSubscriptionProviderId, selectedNavItem, syncCodingPlanProvider]);

  /** 原 ke（154850）：保存供应商（含族域迁移清理） */
  const handleSaveProvider = React.useCallback(
    async (provider: ModelProvider) => {
      try {
        const previous = modelProviders.find((candidate) => candidate.id === provider.id);
        const familyId = providerFamilyOf(provider.id);
        const restored =
          restoreApiKeyProviderState({ provider, mode: familyId ? familyModeOf(familyId, effectiveFamilyModes) : null, now: Date.now }) ??
          provider;
        await saveProvider(restored);
        if (codingPlanApiKeyChanged(previous, restored)) refreshCodingPlanEntitlements();
        if (
          providerFamilyDomain &&
          familyId === providerFamilyDomain &&
          !hasActiveProviderInDomain(replaceProviderInList(modelProviders, restored), providerFamilyDomain)
        ) {
          await updateSettings({
            providerFamilyDomain: "",
            providerFamilyDomainUpdatedAt: Date.now(),
            providerFamilyDomainMigrated: true,
          });
        }
      } catch (error) {
        logger.error("[ModelProviderSection] 保存模型供应商失败", error);
      }
    },
    [providerFamilyDomain, effectiveFamilyModes, modelProviders, refreshCodingPlanEntitlements, saveProvider, updateSettings]
  );

  /** 原 Ae（154868）：删除自定义供应商 */
  const handleDeleteProvider = React.useCallback(
    async (provider: ModelProvider) => {
      await confirmAndDeleteCustomProvider({ provider, confirmDialog, intl, deleteProvider });
    },
    [confirmDialog, deleteProvider, intl]
  );

  /** 原 je（154877）：打开预设 API Key 申领页 */
  const handleOpenPresetApiKey = React.useCallback(
    (presetId: string) => {
      openPresetApiKeyUrl({ platform, presetId });
    },
    [platform]
  );

  /** 原 Me（154883）：打开外部 URL */
  const handleOpenApiKeyUrl = React.useCallback(
    (url: string) => {
      const trimmed = url.trim();
      if (trimmed) platform.openExternal(trimmed);
    },
    [platform]
  );

  /** 原 Ne（154888）：统一登录入口 → 连接 Coding Plan */
  const handleCodingPlanLogin = React.useCallback(
    (
      presetId: string,
      oauthProviderId: string | undefined,
      providerName: string | undefined,
      status: string,
      forceOAuth?: { forceOAuth?: boolean }
    ) => {
      setPresetSubscriptionProviderId(presetId);
      setCodingPlanStatusSyncProviderId(presetId);
      logger.info("[ModelProviderSection] 请求通过统一登录入口登录并连接 Coding Plan", {
        presetId,
        providerId: oauthProviderId,
        providerName,
        status,
        forceOAuth: forceOAuth?.forceOAuth === true,
      });
      if (activeOAuthProvider === oauthProviderId && forceOAuth?.forceOAuth !== true) {
        refreshCodingPlanProviderCache({ providerId: presetId, reason: "coding-plan-active-oauth-connect" }).finally(() => {
          setPresetSubscriptionProviderId((previous) => (previous === presetId ? null : previous));
          setCodingPlanStatusSyncProviderId((previous) => (previous === presetId ? null : previous));
        });
        return;
      }
      return requestLoginEntry(oauthProviderId ?? "");
    },
    [activeOAuthProvider, refreshCodingPlanProviderCache, requestLoginEntry]
  );

  /** 原 Pe（154905）：解绑 Coding Plan provider */
  const handleCodingPlanDisconnect = React.useCallback(
    async (presetId: string, oauthProviderId: string | undefined, providerName: string | undefined) => {
      if (oauthProviderId !== "bigmodel" && oauthProviderId !== "zai") return;
      setCodingPlanDisconnectProviderId(presetId);
      setCodingPlanStatusSyncProviderId(presetId);
      try {
        logger.info("[ModelProviderSection] 请求解绑 Coding Plan provider", { presetId, providerId: oauthProviderId, providerName });
        const nextDomain = resolveDomainAfterLogout({
          currentDomain: settings?.providerFamilyDomain,
          modelProviders,
        });
        await oauthService.logout(oauthProviderId);
        await updateSettings({
          providerFamilyDomain: nextDomain ?? "",
          providerFamilyDomainUpdatedAt: Date.now(),
          providerFamilyDomainMigrated: true,
        });
        await refreshPurchaseTokenState({ clearUserWhenLoggedOut: true });
        await refresh();
        bumpCodingPlanProducts();
      } catch (error) {
        logger.error("[ModelProviderSection] 解绑 Coding Plan provider 失败", {
          presetId,
          providerId: oauthProviderId,
          providerName,
          error,
        });
      } finally {
        setCodingPlanDisconnectProviderId((previous) => (previous === presetId ? null : previous));
        setCodingPlanStatusSyncProviderId((previous) => (previous === presetId ? null : previous));
      }
    },
    [oauthService, updateSettings, settings?.providerFamilyDomain, modelProviders, refresh, refreshCodingPlanEntitlements, bumpCodingPlanProducts, refreshPurchaseTokenState]
  );

  /** 原 Fe（154936）：新建自定义供应商 */
  const handleCreateProvider = React.useCallback(
    async (provider: ModelProvider) => {
      try {
        await saveProvider(provider);
        setSelectedNodeKey(customNavKey(provider.id));
        setAddProviderDraft(createEmptyProviderDraft());
      } catch (error) {
        logger.error("[ModelProviderSection] 新建自定义供应商失败", error);
      }
    },
    [saveProvider]
  );

  /** 原 Ie（154944）：族连接方式切换（模式/选中键持久化 + 转换重试） */
  const handleSelectConnectionMode = React.useCallback(
    async (item: ModelProviderNavItem, mode: string) => {
      if (item.type !== "preset" && item.type !== "codingPlan" && item.type !== "teamPlan" || !mode) return;
      const family = familyDescriptorOf(item.presetId ?? "");
      if (!family) return;
      const storedSelectedKeys = settings?.modelProviderFamilySelectedKeys ?? {};
      const modeUnchanged = familyModes[family.id] === mode;
      const selectedKeyUnchanged = storedSelectedKeys[family.id] === item.key;
      const attemptKey =
        mode === "oauth" && (item.type === "codingPlan" || item.type === "teamPlan")
          ? codingPlanAttemptKey({ activeOAuthProvider, oauthProviderId: item.oauthProviderId, providerId: item.presetId })
          : null;
      if (modeUnchanged && selectedKeyUnchanged) {
        const isPlanItem = item.type === "codingPlan" || item.type === "teamPlan";
        const attemptStatus = attemptKey ? attemptStatusByProvider.current.get(attemptKey) : undefined;
        const providerUsable = !!(item.provider && isProviderUsable(item.provider));
        if (isPlanItem && shouldRetryFailedTransition({ attemptKey, attemptStatus, modeUnchanged, selectedKeyUnchanged })) {
          try {
            await syncCodingPlanProvider(item, "provider-family-mode-transition-retry", {
              userTransition: true,
              refreshPlanSnapshots: false,
            });
            markFamilyConnectionTransition(family.id);
          } catch (error) {
            logger.warn("[ModelProviderSection] 重试同步 Coding Plan provider 失败", { providerId: item.presetId, error });
          }
        } else if (shouldTrackInFlightAttempt({ isPlanItem, attemptKey, attemptStatus })) {
          if (attemptKey) pendingFamilyTransitionByAttempt.current.set(attemptKey, family.id);
        } else if (shouldCompleteTransition({ isPlanItem, attemptStatus, providerUsable })) {
          markFamilyConnectionTransition(family.id);
        }
        return;
      }
      const apiKeyProvider =
        mode === "apiKey" ? modelProviders.find((candidate) => candidate.id === family.apiKeyProviderId) ?? null : null;
      setPendingFamilyModes((previous) => ({ ...previous, [family.id]: mode }));
      setPendingFamilySelectedKeys((previous) => ({ ...previous, [family.id]: item.key }));
      if (attemptKey) attemptStatusByProvider.current.set(attemptKey, "inFlight");
      try {
        await updateSettings({
          modelProviderFamilyModes: { ...familyModes, [family.id]: mode },
          modelProviderFamilySelectedKeys: { ...storedSelectedKeys, [family.id]: item.key },
        });
        const restored = restoreApiKeyProviderState({ provider: apiKeyProvider, mode, now: Date.now });
        if (restored) {
          try {
            await saveProvider(restored);
          } catch (error) {
            logger.warn("[ModelProviderSection] 恢复 API Key 供应商启用状态失败", {
              providerId: restored.id,
              familyId: family.id,
              error,
            });
          }
        }
        if (mode === "oauth" && (item.type === "codingPlan" || item.type === "teamPlan")) {
          await syncCodingPlanProvider(item, "provider-family-mode-transition", {
            userTransition: true,
            refreshPlanSnapshots: false,
          });
        }
        markFamilyConnectionTransition(family.id);
      } catch (error) {
        if (attemptKey) attemptStatusByProvider.current.set(attemptKey, "failed");
        logger.warn("[ModelProviderSection] 保存模型供应商连接方式失败", { familyId: family.id, mode, error });
        setPendingFamilyModes((previous) => clearPendingModeIfUnchanged(previous, family.id, mode));
        setPendingFamilySelectedKeys((previous) => clearPendingKeyIfUnchanged(previous, family.id, item.key));
      }
    },
    [activeOAuthProvider, markFamilyConnectionTransition, familyModes, modelProviders, saveProvider, settings?.modelProviderFamilySelectedKeys, syncCodingPlanProvider, updateSettings]
  );

  /** 原 Le（155031）：导航选择（键解析 + 连接方式联动） */
  const handleSelectNavItem = React.useCallback(
    (item: ModelProviderNavItem, mode?: string) => {
      setSelectedNodeKey(resolveNavItemStorageKey(item));
      if (mode) handleSelectConnectionMode(item, mode);
    },
    [handleSelectConnectionMode]
  );

  /** 原 Re（155036）：拖拽排序 → 显示顺序持久化 */
  const handleReorderProviderIds = React.useCallback(
    (movedIds: string[]) => {
      const moved = new Set(movedIds);
      const orderedIds = sortProvidersByDisplayOrder(modelProviders, displayOrder).map((provider) => provider.id);
      const firstMovedIndex = orderedIds.findIndex((id) => moved.has(id));
      if (firstMovedIndex < 0) return;
      const remaining = orderedIds.filter((id) => !moved.has(id));
      remaining.splice(firstMovedIndex, 0, ...movedIds);
      saveDisplayOrder({ providerIds: remaining, updatedAt: Date.now() });
    },
    [displayOrder, modelProviders, saveDisplayOrder]
  );

  /** 原 ze（155046）：模型连通性测试（Coding Plan 头注入） */
  const handleTestModel = React.useCallback(
    async (provider: ModelProvider, model: string) => {
      let headers = provider.headers;
      if (isStartPlanPreset(provider.id)) {
        const codingPlanHeaders = await resolveCodingPlanProviderHeaders({
          providerId: provider.id,
          providerConfig: provider,
          codingPlanSubscriptionService,
          modelProviderService,
        });
        headers = codingPlanHeaders ? { ...headers, ...codingPlanHeaders } : headers;
      }
      return testModelConnectivity({
        endpoints: provider.endpoints,
        apiKey: provider.apiKey,
        model,
        provider: {
          apiFormat: provider.apiFormat,
          defaultKind: provider.defaultKind,
          endpoints: provider.endpoints,
          headers,
          id: provider.id,
          modelSupportedFormats: provider.modelSupportedFormats,
          models: provider.models,
        },
      });
    },
    [codingPlanSubscriptionService, modelProviderService, testModelConnectivity]
  );

  const presetLoading = loading || refreshing;
  const customLoading = loading || refreshing;

  return (
    <ModelProviderSectionShell
      description={intl.formatMessage({ id: "settings.modelProviderDescription" })}
      refreshLabel={intl.formatMessage({ id: "settings.modelProvider.refresh" })}
      loadingLabel={intl.formatMessage({ id: "common.loading" })}
      presetLoading={presetLoading}
      customLoading={customLoading}
      onRefresh={() => {
        refreshProvidersAndTeamProducts({
          refresh,
          refreshTeamPlanProducts: () => bigModelProducts.refresh({ force: true }),
        });
        refreshCodingPlanEntitlements();
      }}
      navigationGroups={navigationGroups}
      selectedNodeKey={selectedNodeKey}
      onSelectNavItem={handleSelectNavItem}
      onReorderProviderIds={handleReorderProviderIds}
    >
      <ModelProviderPanel
        selectedNavItem={selectedNavItem}
        navigationItems={navigationItems}
        connectionSettingsFailed={connectionSettingsFailed}
        presetLoading={presetLoading}
        codingPlanAuthError={codingPlanAuthError}
        codingPlanPurchaseTokenAuthenticatedByProviderId={purchaseTokenAuthenticatedByProviderId}
        presetSubscriptionProviderId={presetSubscriptionProviderId}
        codingPlanStatusSyncProviderId={codingPlanStatusSyncProviderId}
        codingPlanDisconnectProviderId={codingPlanDisconnectProviderId}
        codingPlanProductsRefreshToken={codingPlanProductsRefreshToken}
        addProviderDraft={addProviderDraft}
        onAddProviderDraftChange={setAddProviderDraft}
        onSave={handleSaveProvider}
        onDelete={handleDeleteProvider}
        onTestModel={handleTestModel}
        onCodingPlanLogin={handleCodingPlanLogin}
        onCodingPlanDisconnect={handleCodingPlanDisconnect}
        onCreateProvider={handleCreateProvider}
        onOpenPresetApiKey={handleOpenPresetApiKey}
        onOpenApiKeyUrl={handleOpenApiKeyUrl}
        onSelectNavItem={handleSelectNavItem}
        onOpenBigModelRegistration={() => {
          setOAuthError(null);
          setPresetSubscriptionProviderId((previous) =>
            previous === PROVIDER_IDS.bigmodelCodingPlan ? null : previous
          );
          platform.openExternal(BIGMODEL_REGISTRATION_URL);
        }}
        onCodingPlanPurchaseComplete={async () => {
          if (selectedNavItem?.type === "codingPlan" || selectedNavItem?.type === "teamPlan") {
            await refreshCodingPlanProviderCache({
              providerId: selectedNavItem.presetId,
              reason: "coding-plan-purchase-complete",
            });
            return;
          }
          await refreshCodingPlanProviderCache({ reason: "coding-plan-purchase-complete" });
        }}
      />
    </ModelProviderSectionShell>
  );
}

/** 原 d7（F12 族）：空供应商草稿构造（接口级） */
declare function createEmptyProviderDraft(): unknown;
/** 原 CYt（F12 族，154856 引用）：按模式恢复 API Key 供应商启用态（接口级） */
declare function restoreApiKeyProviderState(opts: {
  provider: ModelProvider | null;
  mode: string | null;
  now: () => number;
}): ModelProvider | null;
/** 原 zr（F12 族，跨 chunk）：OAuth provider id/域归一化（zai|bigmodel|null） */
declare function normalizeOAuthDomain(value: string | null): string | null;

/* ============================================================================
 * 5. MCP 表单原语（原 D7/IQt/O7/LQt/RQt/zQt/k7/BQt/A7/VQt，
 *    js 192349–192532 / jsx 155116–155281）
 * ==========================================================================*/

/** 原 D7（js 192349）：设置表单 Textarea（类名逐字） */
export function SettingsFormTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Textarea
      className={cn(
        "rounded-lg border border-input-border bg-input px-2 py-2 text-ui-base shadow-none placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0",
        className
      )}
      {...props}
    />
  );
}

/** MCP 表单草稿（原 IQt 结构，js 192358） */
export interface McpFormDraft {
  name: string;
  scope: string;
  storageLevel: "user" | "workspace";
  type: "stdio" | "http" | "sse" | "streamableHttp";
  command: string;
  args: string;
  env: string;
  url: string;
  headers: string;
  timeoutMs: string;
  oauth: string;
}

/** 原 IQt（js 192358）：表单草稿缺省值（scope 固定 `zcodeagentmcp`） */
export const MCP_FORM_DRAFT_DEFAULTS: McpFormDraft = {
  name: "",
  scope: "zcodeagentmcp",
  storageLevel: "user",
  type: "stdio",
  command: "",
  args: "",
  env: "",
  url: "",
  headers: "",
  timeoutMs: "",
  oauth: "",
};

/** 原 O7（jsx 155138） */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && !!value && !Array.isArray(value);
}

/** 原 LQt（js 192374）：McpServer → 表单草稿 */
export function mcpServerToFormDraft(server: McpServer): McpFormDraft {
  const config = server.config;
  let type: McpFormDraft["type"];
  if (config.type === "sse") type = "sse";
  else if (config.type === "streamableHttp") type = "streamableHttp";
  else if (config.command) type = "stdio";
  else type = "http";
  return {
    name: server.name,
    scope: "zcodeagentmcp",
    storageLevel: server.scope === "workspace" ? "workspace" : "user",
    type,
    command: config.command ?? "",
    args: (config.args ?? []).join(" "),
    env: config.env ? JSON.stringify(config.env, null, 2) : "",
    url: config.url ?? "",
    headers: config.headers ? JSON.stringify(config.headers, null, 2) : "",
    timeoutMs: typeof config.timeoutMs === "number" ? String(config.timeoutMs) : "",
    oauth: isPlainObject(config.oauth) ? JSON.stringify(config.oauth, null, 2) : "",
  };
}

/** 原 zQt（jsx 155195） */
function parseTimeoutMsInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

/** 原 RQt（js 192401）：表单草稿 → server config（env/headers/oauth 宽容解析） */
export function mcpFormDraftToConfig(draft: McpFormDraft): Record<string, unknown> {
  const timeoutMs = parseTimeoutMsInput(draft.timeoutMs);
  if (draft.type === "stdio") {
    let env: Record<string, unknown> | undefined;
    if (draft.env.trim()) {
      try {
        env = JSON.parse(draft.env);
      } catch {
        /* 宽容：解析失败则丢弃 */
      }
    }
    return {
      type: "stdio",
      command: draft.command,
      args: draft.args.trim() ? draft.args.trim().split(/\s+/) : [],
      env,
      ...(timeoutMs === undefined ? {} : { timeoutMs }),
    };
  }
  let headers: Record<string, unknown> | undefined;
  if (draft.headers.trim()) {
    try {
      headers = JSON.parse(draft.headers);
    } catch {
      /* 宽容 */
    }
  }
  let oauth: Record<string, unknown> | undefined;
  if (draft.oauth?.trim()) {
    try {
      oauth = JSON.parse(draft.oauth);
    } catch {
      /* 宽容 */
    }
  }
  return {
    type: draft.type,
    url: draft.url,
    headers,
    ...(oauth === undefined ? {} : { oauth }),
    ...(timeoutMs === undefined ? {} : { timeoutMs }),
  };
}

/** 原 k7（js 192441）：表单草稿 → JSON 文本（`{"name": {...config}}`） */
export function mcpFormDraftToJson(draft: McpFormDraft): string {
  const name = draft.name.trim() || "my-mcp-server";
  return JSON.stringify({ [name]: mcpFormDraftToConfig(draft) }, null, 2);
}

/** 原 BQt（js 192445）：JSON 文本 → 表单草稿（支持 `{name:{...}}` 与 `{mcpServers:{name:{...}}}`） */
export function parseMcpJsonToFormDraft(json: string, previous: McpFormDraft): McpFormDraft {
  const parsed: unknown = JSON.parse(json);
  let name = previous.name.trim();
  let config: unknown = parsed;
  if (isPlainObject(parsed) && isPlainObject(parsed.mcpServers)) {
    const entries = Object.entries(parsed.mcpServers).filter(([, value]) => isPlainObject(value));
    if (entries.length !== 1) throw new Error("JSON 模式暂时只支持一次编辑一个 MCP server");
    const [entryName, entryConfig] = entries[0];
    name = entryName;
    config = entryConfig;
  } else if (isPlainObject(parsed)) {
    const entries = Object.entries(parsed).filter(([, value]) => isPlainObject(value));
    if (entries.length === 1 && !("type" in parsed) && !("command" in parsed) && !("url" in parsed)) {
      const [entryName, entryConfig] = entries[0];
      name = entryName;
      config = entryConfig;
    }
  }
  if (!isPlainObject(config)) throw new Error("JSON 内容不是有效的 MCP server 配置对象");
  if (!name) throw new Error("JSON 模式需要提供 server 名称");
  const record = config;
  let type: McpFormDraft["type"];
  if (record.type === "sse") type = "sse";
  else if (record.type === "streamableHttp") type = "streamableHttp";
  else if (record.command) type = "stdio";
  else type = "http";
  return {
    name,
    scope: previous.scope,
    storageLevel: previous.storageLevel,
    type,
    command: (record.command as string | undefined) ?? "",
    args: Array.isArray(record.args) ? (record.args as string[]).join(" ") : "",
    env: record.env ? JSON.stringify(record.env, null, 2) : "",
    url: (record.url as string | undefined) ?? "",
    headers: record.headers ? JSON.stringify(record.headers, null, 2) : "",
    timeoutMs: typeof record.timeoutMs === "number" ? String(record.timeoutMs) : "",
    oauth: isPlainObject(record.oauth) ? JSON.stringify(record.oauth, null, 2) : "",
  };
}

/** 原 A7（js 192489）：表单字段 label（类名逐字） */
export function SettingsFormFieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-ui-base font-medium text-foreground-subtle">{children}</label>;
}

/** 原 VQt（js 192495）：MCP 存储级别选择（user|workspace） */
export function McpStorageLevelSelect(props: {
  disabled: boolean;
  storageLevel: "user" | "workspace";
  workspaceAvailable: boolean;
  onChange: (level: "user" | "workspace") => void;
}) {
  const { disabled, storageLevel, workspaceAvailable, onChange } = props;
  const { intl } = useIntlContext();
  return (
    <label className="flex min-w-0 flex-wrap items-center justify-end gap-2">
      <span className="shrink-0 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.scope.label" })}</span>
      <SelectRoot value={storageLevel} onValueChange={(value) => onChange(value as "user" | "workspace")} disabled={disabled}>
        <SelectTrigger size="lg" className="justify-between">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="user">{intl.formatMessage({ id: "settings.scope.user" })}</SelectItem>
          <SelectItem value="workspace" disabled={!workspaceAvailable}>
            {intl.formatMessage({ id: "settings.scope.workspace" })}
          </SelectItem>
        </SelectContent>
      </SelectRoot>
    </label>
  );
}

/* ============================================================================
 * 6. MCP 行件/列表（原 UQt/WQt/GQt/KQt，js 192834–193013 / jsx 155435–155499）
 * ==========================================================================*/

/** 原 UQt（js 192834）：连接状态指示（spinner/圆点 + 颜色） */
export function McpStatusIndicator({ status }: { status?: string }) {
  const colorClass =
    status === "connected"
      ? "text-green-500"
      : status === "connecting"
        ? "text-yellow-500"
        : status === "error"
          ? "text-red-500"
          : "text-muted-foreground";
  return status === "connecting" ? (
    <SpinnerIcon className={`size-3 animate-spin ${colorClass}`} />
  ) : (
    <CircleIcon className={`size-2 fill-current ${colorClass}`} />
  );
}

/** 原 WQt（js 192847）：作用域徽章 */
export function McpScopeBadge({ scope }: { scope: "user" | "workspace" }) {
  const { intl } = useIntlContext();
  const messageId = scope === "workspace" ? "settings.scope.workspace" : "settings.scope.user";
  return (
    <span className="inline-flex items-center rounded-md bg-surface px-2 py-0.5 text-ui-xs text-foreground-subtle ring-1 ring-border">
      {intl.formatMessage({ id: messageId })}
    </span>
  );
}

/** MCP 行件 testid 前缀（原 bte，src chunk）与模板（原 qr） */
declare const MCP_SERVER_ROW_TESTID_PREFIX: string; // bte = "mcp-server-row"（src-HCld2afU.js 8337）
declare function testidOf(prefix: string, value: string): string; // qr

/** 原 GQt（js 192855）：MCP 服务器行件 */
export function McpServerRow(props: {
  server: McpServer;
  onEdit: (server: McpServer) => void;
  onDelete: (server: McpServer) => void;
  onToggle: (serverId: string, enabled: boolean) => void;
  onOpenAuthorization?: (server: McpServer) => void;
}) {
  const { server, onEdit, onDelete, onToggle, onOpenAuthorization } = props;
  const { intl } = useIntlContext();
  const typeLabel = server.config.command
    ? "stdio"
    : server.config.type ?? (server.config.url ? "http" : "?");
  const isZcodeManaged = !server.location || server.location.source === "zcode";
  const editable = isZcodeManaged;
  const hasAuthorization = !!server.authorization?.authorizationUrl;
  const authorizationLabel = intl.formatMessage({ id: "settings.mcp.oauth.openAuthorization" });
  const detailLine = server.config.url
    ? `${typeLabel} · ${server.config.url}`
    : server.config.command
      ? `${typeLabel} · ${server.config.command} ${(server.config.args ?? []).join(" ")}`
      : typeLabel;
  return (
    <div
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
      data-mcp-status={server.status ?? ""}
      data-mcp-tool-count={server.toolCount}
      data-testid={testidOf(MCP_SERVER_ROW_TESTID_PREFIX, server.name)}
    >
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle"
        aria-hidden="true"
      >
        <PlugIcon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 truncate text-ui-base font-medium text-foreground">
            <McpStatusIndicator status={server.status} />
            {server.name}
          </span>
          <McpScopeBadge scope={server.scope} />
          {typeof server.toolCount === "number" && (
            <span className="inline-flex rounded-md bg-surface px-1.5 py-0.5 text-ui-xs text-foreground-subtle ring-1 ring-border">
              {intl.formatMessage({ id: "settings.mcp.status.toolCount" }, { count: String(server.toolCount) })}
            </span>
          )}
        </div>
        <div className="mt-1 truncate text-ui-base text-foreground-subtle">{detailLine}</div>
        {server.error && <div className="mt-0.5 text-ui-base text-destructive">{server.error}</div>}
        {server.location?.directoryPath && (
          <div className="mt-0.5 truncate font-mono text-ui-base text-foreground-subtle/60">{server.location.directoryPath}</div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {hasAuthorization && (
          <Button
            variant="outline"
            size="sm"
            aria-label={authorizationLabel}
            data-testid={testidOf("mcp-open-authorization-button", server.name)}
            title={authorizationLabel}
            onClick={() => onOpenAuthorization?.(server)}
          >
            <ExternalLinkIcon className="size-3" aria-hidden="true" />
            <span className="hidden sm:inline">{authorizationLabel}</span>
          </Button>
        )}
        <Switch checked={server.enabled} onCheckedChange={(enabled) => onToggle(server.id, enabled)} />
        <div className="flex items-center gap-1">
          {editable && (
            <Button variant="ghost" size="icon-md" onClick={() => onEdit(server)}>
              <PencilIcon className="size-3.5" />
            </Button>
          )}
          {isZcodeManaged && (
            <Button variant="ghost" size="icon-md" onClick={() => onDelete(server)}>
              <TrashIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** 原 KQt（js 192956）：MCP 服务器列表/空态 */
export function McpServerList(props: {
  servers: McpServer[];
  onCreate: () => void;
  onEdit: (server: McpServer) => void;
  onDelete: (server: McpServer) => void;
  onToggle: (serverId: string, enabled: boolean) => void;
  onOpenAuthorization?: (server: McpServer) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const { servers, onCreate, onEdit, onDelete, onToggle, onOpenAuthorization, emptyTitle, emptyDescription } = props;
  const { intl } = useIntlContext();
  return servers.length === 0 ? (
    <div className="overflow-hidden rounded-xl border border-dashed border-border">
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
        <div className="space-y-1">
          <div className="text-ui-base font-medium text-foreground">{emptyTitle}</div>
          <div className="text-ui-base text-foreground-subtle">{emptyDescription}</div>
        </div>
        <Button variant="outline" size="sm" onClick={onCreate}>
          <PlusIcon className="size-4" />
          <span>{intl.formatMessage({ id: "settings.mcp.create.open" })}</span>
        </Button>
      </div>
    </div>
  ) : (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="divide-y divide-border">
        {servers.map((server) => (
          <McpServerRow
            key={server.id}
            server={server}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onOpenAuthorization={onOpenAuthorization}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * 7. MCP 服务器编辑器（原 HQt，js 192533–192833 / jsx 155282–155434）
 * ==========================================================================*/

export interface McpServerEditorProps {
  initial?: McpServer;
  editingId?: string;
  editorMode: "form" | "json";
  onEditorModeChange: (mode: "form" | "json") => void;
  onSave: (server: McpFormDraft, initial?: McpServer) => void;
  onCancel: () => void;
  workspaceAvailable?: boolean;
}

/** 原 HQt：表单/JSON 双模式编辑器（stdio/http/sse；env/headers 折叠区） */
export function McpServerEditor(props: McpServerEditorProps) {
  const { initial, editingId, editorMode, onEditorModeChange, onSave, onCancel, workspaceAvailable = false } = props;
  const { intl } = useIntlContext();
  const initialDraft = initial ? mcpServerToFormDraft(initial) : { ...MCP_FORM_DRAFT_DEFAULTS };
  const [draft, setDraft] = React.useState<McpFormDraft>(initialDraft);
  const [jsonText, setJsonText] = React.useState(() => mcpFormDraftToJson(initialDraft));
  const [jsonError, setJsonError] = React.useState<string | null>(null);
  const [envExpanded, setEnvExpanded] = React.useState(false);
  const draftRef = React.useRef(draft);
  const jsonRef = React.useRef(jsonText);
  const modeRef = React.useRef(editorMode);
  React.useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  React.useEffect(() => {
    jsonRef.current = jsonText;
  }, [jsonText]);
  React.useEffect(() => {
    const previousMode = modeRef.current;
    if (previousMode !== editorMode) {
      if (editorMode === "json") {
        setJsonText(mcpFormDraftToJson(draftRef.current));
        setJsonError(null);
        modeRef.current = editorMode;
        return;
      }
      try {
        setDraft(parseMcpJsonToFormDraft(jsonRef.current, draftRef.current));
        setJsonError(null);
        modeRef.current = editorMode;
      } catch (error) {
        setJsonError(
          error instanceof Error ? error.message : intl.formatMessage({ id: "settings.mcp.form.jsonParseError" })
        );
        onEditorModeChange(previousMode);
      }
    }
  }, [editorMode, intl, onEditorModeChange]);

  function patchDraft(patch: Partial<McpFormDraft>) {
    setDraft((previous) => {
      const next = { ...previous, ...patch };
      if (editorMode === "json") setJsonText(mcpFormDraftToJson(next));
      return next;
    });
  }

  function handleSave() {
    if (editorMode === "json") {
      try {
        const parsed = parseMcpJsonToFormDraft(jsonText, draft);
        setDraft(parsed);
        setJsonError(null);
        onSave(parsed, initial);
      } catch (error) {
        setJsonError(
          error instanceof Error ? error.message : intl.formatMessage({ id: "settings.mcp.form.jsonParseError" })
        );
      }
      return;
    }
    onSave(draft, initial);
  }

  const canSave =
    editorMode === "json"
      ? jsonText.trim().length > 0
      : !!(draft.name.trim() && (draft.type === "stdio" ? draft.command.trim() : draft.url.trim()));
  const envToggleLabel =
    draft.type === "stdio"
      ? intl.formatMessage({ id: "settings.mcp.form.envOptional" })
      : intl.formatMessage({ id: "settings.mcp.form.headersOptional" });
  const keyValueText = draft.type === "stdio" ? draft.env : draft.headers;
  const keyValuePlaceholder =
    draft.type === "stdio"
      ? `{
  "MY_API_KEY": "your-key"
}`
      : `{
  "Authorization": "Bearer your-token"
}`;
  const handleKeyValueChange = (value: string) =>
    patchDraft(draft.type === "stdio" ? { env: value } : { headers: value });
  const storageLevelSelect = (
    <McpStorageLevelSelect
      disabled={!!initial}
      storageLevel={draft.storageLevel}
      workspaceAvailable={workspaceAvailable}
      onChange={(level) => patchDraft({ storageLevel: level })}
    />
  );

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      {editorMode === "json" ? (
        <div className="space-y-3">
          <div className="flex justify-end">{storageLevelSelect}</div>
          <div className="space-y-1.5">
            <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.fullConfig" })}</SettingsFormFieldLabel>
            <SettingsFormTextarea
              rows={16}
              className="font-mono text-ui-base"
              placeholder={`{
  "my-mcp-server": {
    "type": "http",
    "url": "https://example.com/mcp"
  }
}`}
              value={jsonText}
              onChange={(event) => {
                setJsonText(event.target.value);
                if (jsonError) setJsonError(null);
              }}
            />
            <p className="text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: "settings.mcp.form.pasteHintPrefix" })}{" "}
              <code>{`{"server-name": {...}}`}</code>{" "}
              {intl.formatMessage({ id: "settings.mcp.form.pasteHintMiddle" })}{" "}
              <code>{`{"mcpServers": {"server-name": {...}}}`}</code>
              {intl.formatMessage({ id: "settings.mcp.form.pasteHintSuffix" })}
            </p>
            {jsonError && <p className="text-ui-base text-destructive">{jsonError}</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="w-full min-w-0 space-y-1.5 md:w-48">
              <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.name" })}</SettingsFormFieldLabel>
              <Input
                size="lg"
                placeholder="my-mcp-server"
                value={draft.name}
                disabled={!!editingId}
                onChange={(event) => patchDraft({ name: event.target.value })}
              />
            </div>
            <div>{storageLevelSelect}</div>
          </div>
          <div className="space-y-1.5">
            <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.type" })}</SettingsFormFieldLabel>
            <SelectRoot value={draft.type} onValueChange={(value) => patchDraft({ type: value as McpFormDraft["type"] })}>
              <SelectTrigger size="lg" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stdio">{intl.formatMessage({ id: "settings.mcp.form.type.stdio" })}</SelectItem>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="sse">{intl.formatMessage({ id: "settings.mcp.form.type.sse" })}</SelectItem>
              </SelectContent>
            </SelectRoot>
          </div>
          <div className="w-full space-y-1.5 md:w-48">
            <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.timeoutMs" })}</SettingsFormFieldLabel>
            <Input
              size="lg"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="30000"
              value={draft.timeoutMs}
              onChange={(event) => patchDraft({ timeoutMs: event.target.value })}
            />
          </div>
          {draft.type === "stdio" ? (
            <>
              <div className="space-y-1.5">
                <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.command" })}</SettingsFormFieldLabel>
                <Input
                  size="lg"
                  placeholder="npx"
                  value={draft.command}
                  onChange={(event) => patchDraft({ command: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.args" })}</SettingsFormFieldLabel>
                <Input
                  size="lg"
                  placeholder="-y @modelcontextprotocol/server-memory"
                  value={draft.args}
                  onChange={(event) => patchDraft({ args: event.target.value })}
                />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <SettingsFormFieldLabel>URL</SettingsFormFieldLabel>
              <Input
                size="lg"
                placeholder="https://mcp.example.com/mcp"
                value={draft.url}
                onChange={(event) => patchDraft({ url: event.target.value })}
              />
            </div>
          )}
          <div>
            <button
              type="button"
              className="flex items-center gap-1 text-ui-base text-foreground-subtle hover:text-foreground"
              onClick={() => setEnvExpanded((expanded) => !expanded)}
            >
              {envExpanded ? <ChevronDownIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />}
              {envToggleLabel}
            </button>
            {envExpanded && (
              <div className="mt-2 space-y-1.5">
                <SettingsFormTextarea
                  rows={4}
                  className="font-mono text-ui-base"
                  placeholder={keyValuePlaceholder}
                  value={keyValueText}
                  onChange={(event) => handleKeyValueChange(event.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button size="lg" disabled={!canSave} onClick={handleSave}>
          {initial ? intl.formatMessage({ id: "common.save" }) : intl.formatMessage({ id: "settings.mcp.form.add" })}
        </Button>
        <Button variant="ghost" size="lg" onClick={onCancel}>
          {intl.formatMessage({ id: "common.cancel" })}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================================
 * 8. 外部 agent 配置导入对话框（原 z7/R7/_$t/h$t/g$t 及子件，
 *    js 193344–193900 区段 / jsx 155825–156370；settingsSync 族）
 * ==========================================================================*/

export type ExternalAgentImportCategory = "skills" | "commands" | "mcpServers";
export type ExternalAgentImportScope = "global" | "project";
export type ExternalAgentImportMode = "symlink" | "copy";

export interface ExternalAgentDiscoveryAgent {
  agent: string;
  categories: Array<{ category: string; importableCount: number }>;
  [key: string]: unknown;
}
export interface ExternalAgentDiscovery {
  agents: ExternalAgentDiscoveryAgent[];
}
export interface ExternalAgentImportSelection {
  agent: string;
  category: string;
  sourceScope: ExternalAgentImportScope;
  resourcePath: string;
}
export interface ExternalAgentImportResource {
  path: string;
  name: string;
  version?: string;
  importable?: boolean;
}
export interface ExternalAgentImportResultItem {
  status: "imported" | "skipped" | "failed";
  sourceScope: ExternalAgentImportScope;
  path: string;
  name: string;
  version?: string;
  skipReason?: string;
}
export interface ExternalAgentImportResult {
  successCount?: number;
  skippedCount?: number;
  failedCount?: number;
  items?: ExternalAgentImportResultItem[];
  [key: string]: unknown;
}
export interface ExternalAgentSourceRow {
  agent: ExternalAgentDiscoveryAgent;
  sourceRoot: { scope: ExternalAgentImportScope; path: string };
}
export interface ExternalAgentScopeGroup {
  scope: ExternalAgentImportScope;
  rows: ExternalAgentSourceRow[];
}

/* 纯助手（原 155522–155824 区段；此处接口级声明，行号见头部映射 §C） */
declare function importSelectionKey(selection: {
  agent: string;
  category: string;
  sourceScope: ExternalAgentImportScope;
  resourcePath: string;
}): string; // F7（jsx 155654）
declare function buildImportSelections(
  selectedKeys: string[],
  targetScope: ExternalAgentImportScope,
  importMode: ExternalAgentImportMode
): ExternalAgentImportSelection[]; // i$t（jsx 155672）
declare function flattenImportResults(result: ExternalAgentImportResult | null, category: string): ExternalAgentImportResultItem[]; // o$t（jsx 155706）
declare function groupDiscoveryByScope(
  agents: ExternalAgentDiscoveryAgent[],
  workspacePath: string | null | undefined,
  category: string
): ExternalAgentScopeGroup[]; // m$t（jsx 155816）
declare function agentHasCategory(agent: ExternalAgentDiscoveryAgent, category: string): boolean; // I7（jsx 155784）
declare function listImportableResources(
  sourceRoot: { scope: ExternalAgentImportScope; path: string },
  category: string
): ExternalAgentImportResource[]; // L7（jsx 155794）
declare function sourceGroupKey(agent: string, category: string, scope: ExternalAgentImportScope): string; // n$t（jsx 155651）
declare function agentDisplayName(agent: string, intl: IntlShape): string; // s$t（jsx 155703）
declare function scopeOptionLabel(scope: ExternalAgentImportScope, intl: IntlShape, category: string): string; // u$t（jsx 155789）
declare function describeImportError(error: unknown): string; // a$t（jsx 155700）

/** 原 c$t（jsx 155787）：源/目标作用域枚举 */
const IMPORT_SCOPES: ExternalAgentImportScope[] = ["global", "project"];
/** 原 l$t（y$t 内引用）：导入模式枚举 */
const IMPORT_MODES: ExternalAgentImportMode[] = ["symlink", "copy"];

/** 原 R7（js 193347 / jsx 155843）：导入状态机 hook（扫描/选择/展开/作用域） */
export function useExternalAgentImportState(opts: {
  category: ExternalAgentImportCategory;
  enabled: boolean;
  workspaceIdentity?: string | null;
  workspacePath?: string | null;
}) {
  const { category, enabled, workspaceIdentity, workspacePath } = opts;
  const { settingsSyncService } = useServices();
  const [loading, setLoading] = React.useState(false);
  const [discovery, setDiscovery] = React.useState<ExternalAgentDiscovery | null>(null);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [expandedSourceKeys, setExpandedSourceKeys] = React.useState<string[]>([]);
  const [activeScope, setActiveScope] = React.useState<ExternalAgentImportScope>("global");
  const [importTargetScope, setImportTargetScope] = React.useState<ExternalAgentImportScope>("global");
  const [importMode, setImportMode] = React.useState<ExternalAgentImportMode>("symlink");
  const [error, setError] = React.useState<string | null>(null);
  const totalImportableCount = React.useMemo(
    () =>
      discovery?.agents.reduce(
        (sum, agent) => sum + agent.categories.reduce((inner, entry) => inner + entry.importableCount, 0),
        0
      ) ?? 0,
    [discovery]
  );

  const loadDiscovery = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDiscovery(
        await settingsSyncService.detect({
          workspacePath: workspacePath ?? undefined,
          workspaceIdentity,
          categories: [category],
          intent: "manualImport",
        })
      );
      setSelectedKeys([]);
      setExpandedSourceKeys([]);
      setActiveScope("global");
      setImportTargetScope("global");
    } catch (err) {
      const message = describeImportError(err);
      logger.error("[ExternalAgentImportDialog] scan failed", { category, error: message });
      setError(message);
      setDiscovery({ agents: [] });
      setSelectedKeys([]);
    } finally {
      setLoading(false);
    }
  }, [category, settingsSyncService, workspaceIdentity, workspacePath]);

  React.useEffect(() => {
    if (enabled && !discovery && !loading) loadDiscovery();
  }, [discovery, enabled, loadDiscovery, loading]);

  const toggleSelection = React.useCallback((key: string) => {
    setSelectedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return [...next];
    });
  }, []);

  const setResourceSelection = React.useCallback((keys: string[], selected: boolean) => {
    setSelectedKeys((previous) => {
      const next = new Set(previous);
      for (const key of keys) {
        if (selected) next.add(key);
        else next.delete(key);
      }
      return [...next];
    });
  }, []);

  const toggleExpanded = React.useCallback((key: string) => {
    setExpandedSourceKeys((previous) => (previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key]));
  }, []);

  const setActiveSourceScope = React.useCallback((scope: ExternalAgentImportScope) => {
    setActiveScope(scope);
    setImportTargetScope(scope);
  }, []);

  const selections = React.useMemo(
    () => buildImportSelections(selectedKeys, importTargetScope, importMode),
    [importMode, importTargetScope, selectedKeys]
  );

  return {
    activeScope,
    discovery,
    error,
    expandedSourceKeys,
    importMode,
    importTargetScope,
    loading,
    selectedCount: selectedKeys.length,
    selectedKeys,
    selections,
    totalImportableCount,
    loadDiscovery,
    setActiveSourceScope,
    setImportMode,
    setImportTargetScope,
    setResourceSelection,
    toggleExpanded,
    toggleSelection,
  };
}

export type ExternalAgentImportState = ReturnType<typeof useExternalAgentImportState>;

/** 原 E$t（jsx 156245）：源作用域选择 */
export function ImportSourceScopeSelect(props: {
  category: ExternalAgentImportCategory;
  activeScope: ExternalAgentImportScope;
  onActiveScopeChange: (scope: ExternalAgentImportScope) => void;
}) {
  const { category, activeScope, onActiveScopeChange } = props;
  const { intl } = useIntlContext();
  return (
    <SelectRoot value={activeScope} onValueChange={(value) => onActiveScopeChange(value as ExternalAgentImportScope)}>
      <SelectTrigger
        size="sm"
        variant="ghost"
        aria-label={intl.formatMessage({ id: `settings.${category}.import.scopeLabel` })}
        className="w-fit shrink-0 justify-end text-right text-foreground-subtle hover:text-foreground *:data-[slot=select-value]:justify-end"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {IMPORT_SCOPES.map((scope) => (
          <SelectItem key={scope} value={scope}>
            {scopeOptionLabel(scope, intl, category)}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}

/** 原 y$t（jsx 156074）：导入模式选择（symlink|copy + 帮助 tooltip） */
export function ImportModeSelect(props: {
  category: ExternalAgentImportCategory;
  importMode: ExternalAgentImportMode;
  onImportModeChange: (mode: ExternalAgentImportMode) => void;
}) {
  const { category, importMode, onImportModeChange } = props;
  const { intl } = useIntlContext();
  return (
    <div className="flex items-center gap-1 text-ui-base text-foreground-subtle">
      <SelectRoot value={importMode} onValueChange={(value) => onImportModeChange(value as ExternalAgentImportMode)}>
        <SelectTrigger
          size="sm"
          variant="ghost"
          aria-label={intl.formatMessage({ id: `settings.${category}.import.modeLabel` })}
          className="w-fit shrink-0 justify-end border-border bg-surface text-right font-medium text-foreground hover:bg-surface-hover hover:text-foreground aria-expanded:bg-selected *:data-[slot=select-value]:justify-end"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {IMPORT_MODES.map((mode) => (
            <SelectItem key={mode} value={mode}>
              {intl.formatMessage({ id: `settings.${category}.import.mode.${mode}` })}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      <Tooltip
        title={intl.formatMessage({ id: `settings.${category}.import.modeLabel` })}
        description={intl.formatMessage({
          id:
            importMode === "symlink"
              ? `settings.${category}.import.mode.symlink.description`
              : `settings.${category}.import.mode.copy.description`,
        })}
        side="top"
        align="start"
      >
        <span
          role="img"
          aria-label={intl.formatMessage({ id: `settings.${category}.import.modeHelp` })}
          className="inline-flex size-4 items-center justify-center rounded-full text-foreground-subtlest hover:bg-hover hover:text-foreground"
        >
          <CircleHelpIcon className="size-3" aria-hidden="true" />
        </span>
      </Tooltip>
    </div>
  );
}

/** 原 b$t（jsx 156112）：目标作用域分体按钮（主动作 + ⌄ 切换 global/project） */
export function ImportTargetSplitButton(props: {
  category: ExternalAgentImportCategory;
  targetScope: ExternalAgentImportScope;
  disabled: boolean;
  workspacePath?: string | null;
  onTargetScopeChange: (scope: ExternalAgentImportScope) => void;
  onImport: (scope: ExternalAgentImportScope) => void;
}) {
  const { category, targetScope, disabled, workspacePath, onTargetScopeChange, onImport } = props;
  const { intl } = useIntlContext();
  const workspaceAvailable = !!workspacePath;
  const actionEnabled = targetScope === "global" || workspaceAvailable;
  const actionLabelId =
    targetScope === "project" ? `settings.${category}.import.target.project` : `settings.${category}.import.target.global`;
  return (
    <div className="flex items-center">
      <Button
        type="button"
        size="lg"
        disabled={disabled || !actionEnabled}
        aria-label={intl.formatMessage({ id: actionLabelId })}
        className="rounded-r-none border-r-0"
        onClick={() => onImport(targetScope)}
      >
        {intl.formatMessage({ id: actionLabelId })}
      </Button>
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="lg"
            className="rounded-l-none border-l-0 px-2"
            disabled={disabled}
            aria-label={intl.formatMessage({ id: `settings.${category}.import.targetLabel` })}
          >
            <ChevronDownIcon className="size-3.5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => onTargetScopeChange("global")}>
            {intl.formatMessage({ id: `settings.${category}.import.target.global` })}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!workspaceAvailable} onSelect={() => onTargetScopeChange("project")}>
            {intl.formatMessage({ id: `settings.${category}.import.target.project` })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </div>
  );
}

/** 原 x$t（jsx 156138）：目标作用域下拉（v$t 选择面板用） */
export function ImportTargetScopeSelect(props: {
  category: ExternalAgentImportCategory;
  targetScope: ExternalAgentImportScope;
  workspacePath?: string | null;
  onTargetScopeChange: (scope: ExternalAgentImportScope) => void;
}) {
  const { category, targetScope, workspacePath, onTargetScopeChange } = props;
  const { intl } = useIntlContext();
  const workspaceAvailable = !!workspacePath;
  return (
    <SelectRoot value={targetScope} onValueChange={(value) => onTargetScopeChange(value as ExternalAgentImportScope)}>
      <SelectTrigger
        size="sm"
        variant="ghost"
        aria-label={intl.formatMessage({ id: `settings.${category}.import.targetLabel` })}
        className="w-fit shrink-0 justify-end border-border bg-surface text-right font-medium text-foreground hover:bg-surface-hover hover:text-foreground aria-expanded:bg-selected *:data-[slot=select-value]:justify-end"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="global">{intl.formatMessage({ id: `settings.${category}.import.scope.global` })}</SelectItem>
        <SelectItem value="project" disabled={!workspaceAvailable}>
          {intl.formatMessage({ id: `settings.${category}.import.scope.project` })}
        </SelectItem>
      </SelectContent>
    </SelectRoot>
  );
}

/** 原 B7（jsx 156193）：结果统计项 */
export function ImportResultStat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-ui-base font-medium text-foreground">{value}</span>
      <span>{label}</span>
    </span>
  );
}

/** 原 S$t（jsx 156178）：结果汇总条（imported/skipped/failed） */
export function ImportResultSummaryBar(props: {
  category: ExternalAgentImportCategory;
  result: ExternalAgentImportResult | null;
}) {
  const { category, result } = props;
  const { intl } = useIntlContext();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-surface px-3 py-2 text-ui-xs text-foreground-subtle">
      <ImportResultStat label={intl.formatMessage({ id: `settings.${category}.import.imported` })} value={result?.successCount ?? 0} />
      <ImportResultStat label={intl.formatMessage({ id: `settings.${category}.import.skipped` })} value={result?.skippedCount ?? 0} />
      <ImportResultStat label={intl.formatMessage({ id: `settings.${category}.import.failed` })} value={result?.failedCount ?? 0} />
    </div>
  );
}

/** 原 T$t（jsx 156225）：结果状态圆标 */
export function ImportResultStatusIcon(props: {
  category: ExternalAgentImportCategory;
  result: ExternalAgentImportResultItem;
}) {
  const { category, result } = props;
  const { intl } = useIntlContext();
  const statusLabel = intl.formatMessage({
    id:
      result.status === "imported"
        ? `settings.${category}.import.imported`
        : result.status === "skipped"
          ? `settings.${category}.import.skipped`
          : `settings.${category}.import.failed`,
  });
  const skipReasonLabel = result.skipReason
    ? intl.formatMessage({ id: `settings.${category}.import.skipReason.${result.skipReason}` })
    : null;
  const fullLabel = skipReasonLabel ? `${statusLabel}: ${skipReasonLabel}` : statusLabel;
  const Icon = result.status === "imported" ? CheckIcon : result.status === "skipped" ? CircleHelpIcon : AlertIcon;
  return (
    <span
      aria-label={fullLabel}
      role="img"
      className={cn(
        "flex size-3 shrink-0 items-center justify-center rounded-full",
        result.status === "imported" && "bg-success text-success-foreground",
        result.status === "skipped" && "bg-warning text-warning-foreground",
        result.status === "failed" && "bg-destructive text-destructive-foreground"
      )}
      title={fullLabel}
    >
      <Icon className="size-2" aria-hidden="true" />
    </span>
  );
}

/** 原 w$t（jsx 156215）：结果行 */
export function ImportResultRow(props: {
  category: ExternalAgentImportCategory;
  result: ExternalAgentImportResultItem;
}) {
  const { category, result } = props;
  return (
    <div className="flex min-w-0 items-center gap-2.5 px-3 py-2">
      <ImportResultStatusIcon category={category} result={result} />
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-ui-base font-medium text-foreground">{result.name}</span>
        {"version" in result && result.version ? (
          <Badge
            variant="outline"
            className="h-5 border-border bg-surface px-1.5 font-mono text-ui-xs font-normal text-foreground-subtle"
          >
            {result.version.startsWith("v") ? result.version : `v${result.version}`}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

/** 原 C$t（jsx 156199）：结果列表 */
export function ImportResultList(props: {
  category: ExternalAgentImportCategory;
  results: ExternalAgentImportResultItem[];
}) {
  const { category, results } = props;
  const { intl } = useIntlContext();
  return (
    <div className="space-y-2">
      <div className="text-ui-base font-medium text-foreground">
        {intl.formatMessage({ id: `settings.${category}.import.resultList` })}
      </div>
      <div className="overflow-hidden rounded-lg bg-card">
        {results.length === 0 ? (
          <div className="px-3 py-3 text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: `settings.${category}.import.resultEmpty` })}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results.map((result) => (
              <ImportResultRow key={`${result.status}:${result.sourceScope}:${result.path}`} category={category} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 原 O$t（jsx 156350）：资源行（单项勾选） */
export function ImportResourceRow(props: {
  agent: ExternalAgentDiscoveryAgent;
  category: ExternalAgentImportCategory;
  sourceScope: ExternalAgentImportScope;
  selected: Set<string>;
  item: ExternalAgentImportResource;
  onToggleSelection: (key: string) => void;
}) {
  const { agent, category, sourceScope, selected, item, onToggleSelection } = props;
  const key = importSelectionKey({ agent: agent.agent, category, sourceScope, resourcePath: item.path });
  const isSelected = selected.has(key);
  return (
    <button
      type="button"
      onClick={() => onToggleSelection(key)}
      className="flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-hover/50"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm border border-border",
            isSelected && "border-primary bg-primary text-primary-foreground"
          )}
        >
          {isSelected ? <CheckIcon className="size-3.5" /> : null}
        </span>
        <span className="min-w-0 truncate text-ui-base text-foreground">{item.name}</span>
        {"version" in item && item.version ? (
          <Badge
            variant="outline"
            className="h-5 border-border bg-surface px-1.5 font-mono text-ui-xs font-normal text-foreground-subtle"
          >
            {item.version.startsWith("v") ? item.version : `v${item.version}`}
          </Badge>
        ) : null}
      </span>
    </button>
  );
}

/** 原 D$t（jsx 156275）：发现结果选择树（全选行 + 源分组 + 资源子项） */
export function ImportDiscoveryTree(props: {
  category: ExternalAgentImportCategory;
  discovery: ExternalAgentDiscovery;
  workspacePath?: string | null;
  activeScope: ExternalAgentImportScope;
  selectedKeys: string[];
  expandedSourceKeys: string[];
  onToggleSelection: (key: string) => void;
  onSetResourceSelection: (keys: string[], selected: boolean) => void;
  onToggleExpanded: (key: string) => void;
}) {
  const {
    category,
    discovery,
    workspacePath,
    activeScope,
    selectedKeys,
    expandedSourceKeys,
    onToggleSelection,
    onSetResourceSelection,
    onToggleExpanded,
  } = props;
  const { intl } = useIntlContext();
  const selectedSet = React.useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const expandedSet = React.useMemo(() => new Set(expandedSourceKeys), [expandedSourceKeys]);
  const scopeGroup = React.useMemo(
    () => groupDiscoveryByScope(discovery.agents, workspacePath, category).find((group) => group.scope === activeScope),
    [category, discovery.agents, workspacePath]
  );
  const allResourceKeys = React.useMemo(
    () =>
      scopeGroup?.rows.flatMap(({ agent, sourceRoot }) =>
        agentHasCategory(agent, category)
          ? listImportableResources(sourceRoot, category)
              .filter((resource) => resource.importable)
              .map((resource) =>
                importSelectionKey({ agent: agent.agent, category, sourceScope: sourceRoot.scope, resourcePath: resource.path })
              )
          : []
      ) ?? [],
    [scopeGroup, category]
  );
  const selectedCount = allResourceKeys.filter((key) => selectedSet.has(key)).length;
  const allSelected = allResourceKeys.length > 0 && selectedCount === allResourceKeys.length;
  const partiallySelected = selectedCount > 0 && selectedCount < allResourceKeys.length;
  const selectAllLabel = intl.formatMessage({
    id: allSelected ? `settings.${category}.import.clearAll` : `settings.${category}.import.selectAll`,
  });

  return (
    <div className="flex w-full flex-col gap-1">
      {allResourceKeys.length > 0 ? (
        <div className="mb-1 flex min-w-0 items-center justify-between gap-2 px-2">
          <button
            type="button"
            role="checkbox"
            aria-checked={partiallySelected ? "mixed" : allSelected}
            aria-label={selectAllLabel}
            onClick={() => onSetResourceSelection(allResourceKeys, !allSelected)}
            className="flex min-w-0 items-center gap-2 rounded-md py-1 pr-2 text-left text-ui-base text-foreground-subtle transition-colors hover:text-foreground"
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-sm border border-border",
                (allSelected || partiallySelected) && "border-primary bg-primary text-primary-foreground"
              )}
            >
              {allSelected ? <CheckIcon className="size-3.5" aria-hidden="true" /> : null}
              {partiallySelected ? <MinusIcon className="size-3.5" aria-hidden="true" /> : null}
            </span>
            <span className="shrink-0">{selectAllLabel}</span>
          </button>
          <div className="min-w-0 text-right text-ui-xs text-foreground-subtle">
            {intl.formatMessage(
              { id: `settings.${category}.import.selectionCount` },
              { selected: String(selectedCount), total: String(allResourceKeys.length) }
            )}
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        {scopeGroup?.rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card px-3 py-6 text-center text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: `settings.${category}.import.scopeEmpty` })}
          </div>
        ) : null}
        {scopeGroup?.rows.map(({ agent, sourceRoot }) => {
          if (!agentHasCategory(agent, category)) return null;
          const groupKey = `${sourceGroupKey(agent.agent, category, sourceRoot.scope)}:${sourceRoot.path}`;
          const resources = listImportableResources(sourceRoot, category).filter((resource) => resource.importable);
          const resourceKeys = resources.map((resource) =>
            importSelectionKey({ agent: agent.agent, category, sourceScope: sourceRoot.scope, resourcePath: resource.path })
          );
          const groupSelectedCount = resourceKeys.filter((key) => selectedSet.has(key)).length;
          const groupAllSelected = resourceKeys.length > 0 && groupSelectedCount === resourceKeys.length;
          const groupPartiallySelected = groupSelectedCount > 0 && groupSelectedCount < resourceKeys.length;
          const groupEmpty = resourceKeys.length === 0;
          const expanded = expandedSet.has(groupKey);
          return (
            <div key={groupKey} className="rounded-lg">
              <div
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                  groupEmpty ? "opacity-70" : "hover:bg-surface-hover/50"
                )}
              >
                <button
                  type="button"
                  disabled={groupEmpty}
                  aria-label={intl.formatMessage({
                    id: groupAllSelected ? `settings.${category}.import.deselectSource` : `settings.${category}.import.selectSource`,
                  })}
                  onClick={() => onSetResourceSelection(resourceKeys, !groupAllSelected)}
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md",
                    groupEmpty ? "cursor-default" : "cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-sm border border-border",
                      (groupAllSelected || groupPartiallySelected) && !groupEmpty && "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {groupAllSelected && !groupEmpty ? <CheckIcon className="size-3.5" /> : null}
                    {groupPartiallySelected && !groupEmpty ? <MinusIcon className="size-3.5" /> : null}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleExpanded(groupKey)}
                  className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1 text-left"
                >
                  <span className="text-ui-base font-medium text-foreground">{agentDisplayName(agent.agent, intl)}</span>
                  <span className="min-w-0 break-all font-mono text-ui-xs text-foreground-subtle">{sourceRoot.path}</span>
                  {resources.length > 0 ? (
                    <span className="text-ui-xs text-foreground-subtlest">
                      {intl.formatMessage({ id: `settings.${category}.import.itemCount` }, { count: String(resources.length) })}
                    </span>
                  ) : null}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={intl.formatMessage({
                    id: expanded ? `settings.${category}.import.collapseSource` : `settings.${category}.import.expandSource`,
                  })}
                  onClick={() => onToggleExpanded(groupKey)}
                  className="shrink-0"
                >
                  {expanded ? <ChevronDownIcon className="size-3" /> : <ChevronRightIcon className="size-3" />}
                </Button>
              </div>
              {expanded ? (
                <div className="ml-9 border-l border-border pl-3">
                  {resources.map((resource) => (
                    <ImportResourceRow
                      key={`${groupKey}:${resource.path}`}
                      agent={agent}
                      category={category}
                      sourceScope={sourceRoot.scope}
                      selected={selectedSet}
                      item={resource}
                      onToggleSelection={onToggleSelection}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 原 z7（js 193434 / jsx 155926）：外部 agent 配置导入对话框主体 */
export function ExternalAgentImportDialog(props: {
  category: ExternalAgentImportCategory;
  open: boolean;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  onOpenChange: (open: boolean) => void;
  onImported: () => Promise<void>;
}) {
  const { category, open, workspacePath, workspaceIdentity, onOpenChange, onImported } = props;
  const { intl } = useIntlContext();
  const { settingsSyncService } = useServices();
  const [phase, setPhase] = React.useState<"selection" | "importing" | "complete">("selection");
  const [importing, setImporting] = React.useState(false);
  const [importResult, setImportResult] = React.useState<ExternalAgentImportResult | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const state = useExternalAgentImportState({ category, enabled: open, workspacePath, workspaceIdentity });
  const {
    activeScope,
    discovery,
    error,
    expandedSourceKeys,
    importMode,
    importTargetScope,
    loading,
    selectedCount,
    selectedKeys,
    totalImportableCount,
  } = state;
  const progressValue = phase === "complete" ? 100 : importing ? 62 : 0;
  const flattenedResults = React.useMemo(() => flattenImportResults(importResult, category), [category, importResult]);
  const visibleError = error ?? importError;

  React.useEffect(() => {
    if (open) {
      setImportResult(null);
      setImportError(null);
      setPhase("selection");
    }
  }, [open]);

  const runImport = React.useCallback(
    async (targetScope: ExternalAgentImportScope) => {
      if (selectedKeys.length === 0) return;
      setImporting(true);
      setPhase("importing");
      setImportError(null);
      try {
        logger.debug("[ExternalAgentImportDialog] import start", {
          category,
          targetScope,
          importMode,
          selectedCount: selectedKeys.length,
        });
        setImportResult(
          await settingsSyncService.importSelected({
            workspacePath: workspacePath ?? undefined,
            workspaceIdentity,
            selections: buildImportSelections(selectedKeys, targetScope, importMode),
          })
        );
        setPhase("complete");
        await onImported();
      } catch (err) {
        const message = describeImportError(err);
        logger.error("[ExternalAgentImportDialog] import failed", { category, error: message });
        setImportError(message);
        setPhase("selection");
      } finally {
        setImporting(false);
      }
    },
    [onImported, category, importMode, selectedKeys, settingsSyncService, workspaceIdentity, workspacePath]
  );

  const finishLabel =
    phase === "complete"
      ? intl.formatMessage({ id: `settings.${category}.import.finish` })
      : intl.formatMessage({ id: "settingsSync.action.skip" });

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(84vh,640px)] max-h-[calc(100vh-2rem)] max-w-2xl overflow-hidden rounded-2xl p-0">
        <div className="flex h-full min-h-0 min-w-0 flex-col">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-5">
            <DialogHeader className="shrink-0 sm:-mt-1">
              <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-center sm:justify-between">
                <DialogTitle className="flex min-w-0 items-center text-ui-lg">
                  <span className="min-w-0 truncate">{intl.formatMessage({ id: `settings.${category}.import.title` })}</span>
                </DialogTitle>
                {phase === "selection" && !loading && discovery?.agents.length ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <ImportSourceScopeSelect category={category} activeScope={activeScope} onActiveScopeChange={state.setActiveSourceScope} />
                    <Tooltip title={intl.formatMessage({ id: "settingsSync.action.rescan" })}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={intl.formatMessage({ id: "settingsSync.action.rescan" })}
                        onClick={() => void state.loadDiscovery()}
                        disabled={loading}
                      >
                        <RefreshIcon className="size-3" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                  </div>
                ) : null}
              </div>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-full overflow-auto p-3">
                {visibleError ? (
                  <div className="mb-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-ui-base text-foreground">
                    {visibleError}
                  </div>
                ) : null}
                {loading ? (
                  <div className="flex h-full min-h-48 items-center justify-center gap-2 rounded-lg bg-surface px-4 py-10 text-ui-base text-foreground-subtle">
                    <SpinnerIcon className="size-4 animate-spin" />
                    {intl.formatMessage({ id: `settings.${category}.import.scanning` })}
                  </div>
                ) : phase === "importing" ? (
                  <div className="space-y-4 rounded-lg bg-surface px-4 py-5">
                    <div className="flex items-center justify-between gap-3 text-ui-base text-foreground-subtle">
                      <span>{intl.formatMessage({ id: `settings.${category}.import.importing` })}</span>
                      <span>{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2 rounded-full bg-background" />
                  </div>
                ) : phase === "complete" ? (
                  <div className="space-y-4">
                    <ImportResultSummaryBar category={category} result={importResult} />
                    <ImportResultList category={category} results={flattenedResults} />
                  </div>
                ) : discovery && discovery.agents.length > 0 ? (
                  <ImportDiscoveryTree
                    category={category}
                    discovery={discovery}
                    workspacePath={workspacePath}
                    activeScope={activeScope}
                    selectedKeys={selectedKeys}
                    expandedSourceKeys={expandedSourceKeys}
                    onToggleSelection={state.toggleSelection}
                    onSetResourceSelection={state.setResourceSelection}
                    onToggleExpanded={state.toggleExpanded}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-10 text-center text-ui-base text-foreground-subtle">
                    {intl.formatMessage({ id: `settings.${category}.import.empty` })}
                  </div>
                )}
              </div>
            </div>
            <div className={cn("flex shrink-0 flex-wrap items-center gap-3", phase === "complete" ? "justify-end" : "justify-between")}>
              {phase === "complete" ? null : (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="text-ui-base text-foreground-subtle">
                    {intl.formatMessage({ id: `settings.${category}.import.summary` }, { count: String(totalImportableCount) })}
                  </div>
                  {phase === "selection" && category !== "mcpServers" ? (
                    <ImportModeSelect category={category} importMode={importMode} onImportModeChange={state.setImportMode} />
                  ) : null}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {phase === "complete" ? (
                  <Button type="button" size="lg" onClick={() => onOpenChange(false)}>
                    {finishLabel}
                  </Button>
                ) : null}
                {phase === "selection" ? (
                  <ImportTargetSplitButton
                    category={category}
                    targetScope={importTargetScope}
                    disabled={selectedCount === 0 || loading}
                    workspacePath={workspacePath}
                    onTargetScopeChange={state.setImportTargetScope}
                    onImport={(scope) => void runImport(scope)}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}

/** 原 v$t（jsx 156034）：独立选择面板（远程同步对话框复用形态） */
export function ExternalAgentImportSelectionPane(props: {
  category: ExternalAgentImportCategory;
  state: ExternalAgentImportState;
  workspacePath?: string | null;
}) {
  const { category, state, workspacePath } = props;
  const { intl } = useIntlContext();
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: `settings.${category}.import.summary` }, { count: String(state.totalImportableCount) })}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ImportSourceScopeSelect category={category} activeScope={state.activeScope} onActiveScopeChange={state.setActiveSourceScope} />
          <Tooltip title={intl.formatMessage({ id: "settingsSync.action.rescan" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={intl.formatMessage({ id: "settingsSync.action.rescan" })}
              onClick={() => void state.loadDiscovery()}
              disabled={state.loading}
            >
              <RefreshIcon className="size-3" aria-hidden="true" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <div className="h-full overflow-auto p-3">
          {state.error ? (
            <div className="mb-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-ui-base text-foreground">
              {state.error}
            </div>
          ) : null}
          {state.loading ? (
            <div className="flex h-full min-h-48 items-center justify-center gap-2 rounded-lg bg-surface px-4 py-10 text-ui-base text-foreground-subtle">
              <SpinnerIcon className="size-4 animate-spin" />
              {intl.formatMessage({ id: `settings.${category}.import.scanning` })}
            </div>
          ) : state.discovery && state.discovery.agents.length > 0 ? (
            <ImportDiscoveryTree
              category={category}
              discovery={state.discovery}
              workspacePath={workspacePath}
              activeScope={state.activeScope}
              selectedKeys={state.selectedKeys}
              expandedSourceKeys={state.expandedSourceKeys}
              onToggleSelection={state.toggleSelection}
              onSetResourceSelection={state.setResourceSelection}
              onToggleExpanded={state.toggleExpanded}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-10 text-center text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: `settings.${category}.import.empty` })}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="text-ui-base text-foreground-subtle">
          {intl.formatMessage(
            { id: `settings.${category}.import.selectionCount` },
            { selected: String(state.selectedCount), total: String(state.totalImportableCount) }
          )}
        </div>
        <div className="flex items-center gap-3">
          {category === "mcpServers" ? null : (
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-ui-base text-foreground-subtlest">
                {intl.formatMessage({ id: `settings.${category}.import.modeLabel` })}
              </span>
              <ImportModeSelect category={category} importMode={state.importMode} onImportModeChange={state.setImportMode} />
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-ui-base text-foreground-subtlest">
              {intl.formatMessage({ id: `settings.${category}.import.targetLabel` })}
            </span>
            <ImportTargetScopeSelect
              category={category}
              targetScope={state.importTargetScope}
              workspacePath={workspacePath}
              onTargetScopeChange={state.setImportTargetScope}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** 原 _$t（js 193344）：MCP 导入对话框（category=mcpServers 薄包装） */
export function McpImportDialog(props: Omit<ExternalAgentImportDialogProps, "category">) {
  return <ExternalAgentImportDialog {...props} category="mcpServers" />;
}
/** 原 h$t（jsx 155825）：技能导入对话框（category=skills 薄包装） */
export function SkillsImportDialog(props: Omit<ExternalAgentImportDialogProps, "category">) {
  return <ExternalAgentImportDialog {...props} category="skills" />;
}
/** 原 g$t（jsx 155831）：命令导入对话框（category=commands 薄包装） */
export function CommandsImportDialog(props: Omit<ExternalAgentImportDialogProps, "category">) {
  return <ExternalAgentImportDialog {...props} category="commands" />;
}
export type ExternalAgentImportDialogProps = React.ComponentProps<typeof ExternalAgentImportDialog>;
