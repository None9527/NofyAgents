// A0-S4-4a: 自 modules/SettingsPanels.tsx 模型供应商族（§0 声明群去 McpServer + §1–§4）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 173–373 + 396–2290。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { RefreshCw as RefreshIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button } from '../../modules/button';
import { providerFamilyOf, useCodingPlanEntitlements, useStartPlanPreview } from '../../modules/PaymentDeep';
import { subscribeSettingsSectionIntent } from '../../modules/Settings';
import { consumeModelProviderIntent as readSettingsSectionIntent } from '../../modules/Settings'; // sw（39377）
import { AddCustomProviderDraftForm, CodingPlanPurchaseBanner, CodingPlanStatusSection, ConnectionModeNav, ModelProviderNavRail, PresetEmptyState, ProviderCardHeader, ProviderCardShell, ProviderConfigCardForm, SectionLoadingPlaceholder, StatusTitleDescription, isProviderSectionRefreshing, nullSafe as toManagedProvider, upgradeFunnelContext, entryPlanStateOf, useAppSettings, useSubscriptionSnapshot, useZapiEnabled, type AddProviderDraft, type CodingPlanDisplayStatus, type CodingPlanViewState, type EntitlementQuotaLimit, type FunnelContext, type ModelMetadata, type ProviderEndpoints } from '../../modules/UsageDeep'; // A1-R11：tM（52642）/PM（53253）/IM（53277）/JM（53488）改指 canonical（components/usage/UsageDeep.tsx §2b/§2c）
import { useServices } from '../../modules/services';
import { resolveCodingPlanProviderHeaders, type CaptchaConfig } from '../../modules/ConversationLeaves'; // A1-R16：pCt declare 删碑改指（118459 逐字实体）+ 型缝 CaptchaConfig
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { t as logger } from '../../modules/logger';
import { useConfirmDialog } from '../../modules/Modals';
import { useSettingsStore as useAppPreferenceStore } from '../../modules/stores-core'; // A1-R10 项 2a：原 ko（1296）declare 改指 canonical——普查 useAppPreferenceStore=useSettingsStore（symbol-index x6）；选择器面 1512–1516 五字段（requestLoginEntry/setUser/oauthError/setOAuthError/markModelProviderFamilyConnectionTransition）= SettingsState 实有字段（bundle 192134–192138 同面）。环安全：stores-core 值闭包不达 components/settings
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { isStartPlanProviderId as isStartPlanPreset, providerIds as PROVIDER_IDS } from '../../modules/SrcSharedA'; // Bn / q=mo
import {
  resolveProviderFamilyMode as familyModeOf, // zi
  getOAuthProviderFamilyByProviderId as familyDescriptorOf, // ot
  isProviderEnabled as isProviderActive, // gi
  parseCodingPlanScope as parseTeamPlanKey, // li
  buildCodingPlanScope as buildTeamPlanKey, // vi
  codingPlanScopesOverlap as isSameTeamPlanKey, // fi
} from '../../modules/SrcSharedB';

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/** 桌面平台服务（原 l()） */
interface PlatformService {
  openExternal(url: string): void | Promise<void>;
  openInFileManager(path: string): Promise<{ success: boolean; error?: string }>;
}
declare function usePlatformService(): PlatformService;

/** toast（原 m） */
interface ToastOptions {
  durationMs?: number;
  position?: "top-center" | "bottom-center";
  variant?: "info" | "success" | "error";
  actionLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
  dismissLabel?: string;
}

/* --- UI 原语（跨 chunk） --- */

/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：SpinnerIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/** 原 yq（75986）：进度条 —— 属主 Modals.tsx 未导出，登记需要的 export 后保留 declare */
/* ── tombstone（A0-CLEANUP2 item 15）：Progress（原 yq）declare 删除 → import { Progress } from './Modals'。 ── */
/* ── tombstone（A0-S3c）：DialogContent、DialogHeader、DialogRoot、DialogTitle、DropdownMenuContent、DropdownMenuItem、DropdownMenuRoot、DropdownMenuSeparator、DropdownMenuTrigger、SelectRoot declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */










/* --- 图标（lucide 风格；原符号见各行注释） --- */

/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（14）：RefreshIcon/PlusIcon/TrashIcon/PencilIcon/ExternalLinkIcon/ChevronDownIcon/ChevronRightIcon/PlugIcon/CircleIcon/CheckIcon/MinusIcon/CircleHelpIcon/AlertIcon/DownloadIcon → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* --- 供应商 id 枚举与领域类型（原 q=mo；A0-CLEANUP B-7 改指 SrcSharedA.providerIds） --- */

/* ── tombstone（A0-CLEANUP B-7）：PROVIDER_IDS declare 删除 → import
 *    { providerIds as PROVIDER_IDS } from './SrcSharedA'。 ── */
/** 原 Ri：bigmodel OAuth provider id 常量（跨 chunk 导入；值即 `bigmodel`） */
declare const BIGMODEL_OAUTH_PROVIDER_ID: "bigmodel";

/** A0-CLEANUP3 3b：与 UsageDeep.ModelProvider 双向对齐（endpoints/models 按运行期实形收紧） */
interface ModelProvider {
  id: string;
  name: string;
  apiKey: string;
  apiKeyUrl?: string;
  endpoints: ProviderEndpoints;
  apiFormat?: string;
  defaultKind?: string;
  headers?: Record<string, string>;
  models: ModelMetadata[];
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
interface ProviderFamilyDescriptor {
  id: string;
  apiKeyProviderId: string;
}
declare function isPresetProvider(provider: ModelProvider): boolean; // lX
declare function isProviderUsable(provider: ModelProvider): boolean; // vM
declare function sortProvidersByDisplayOrder(
  providers: ModelProvider[],
  displayOrder: { providerIds: string[]; updatedAt?: number } | null
): ModelProvider[]; // Iq
declare function isBuiltInProviderId(providerId: string): boolean; // irt
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
    endpoints?: ProviderEndpoints; // A0-CLEANUP3 3b：对齐 ModelProvider.endpoints 实形
    apiKey: string;
    model: string;
    provider: Partial<ModelProvider>;
  }) => Promise<{ results: unknown[] }>; // A0-CLEANUP3 3b：对齐 ProviderConfigCardForm.onTestModel 返回面
}
declare function useModelProvidersStore(): ModelProvidersStoreState; // qq（78195）

/* ── tombstone（A1-R11）：interface AppSettingsSnapshot + declare function useAppSettings（原 JM，53440——普查行漂移，bundle 真身 53488）删除，
 *    改经文件头 modules/UsageDeep import 消费（canonical = components/usage/UsageDeep.tsx §2c useAppSettings，JM 53488 逐字）。
 *    型缝：返回面 {settings: AppRuntimeSettings | null; loading; error; update; refresh}；1516 解构四字段与 1526–1537 读取字段
 *    （modelProviderFamilyModes/modelProviderFamilySelectedKeys/providerFamilyDomain）均在 AppRuntimeSettings 具名面内。 ── */

/* ── tombstone（A1-R10 2a）：interface AppPreferenceStoreState + declare function useAppPreferenceStore<T>（原 ko，1296）删除，
 *    改经文件头 stores-core import 消费（canonical = useSettingsStore）。型缝精化（bundle 真形）：
 *    requestLoginEntry (providerId, purpose?) => number（bundle 1215/88869 单参调用）；
 *    setUser (UserInfo | null) => void（bundle 1186）；oauthError string | null（读面 1070/1308/1374 真形）；
 *    setOAuthError (string | null) => void；markModelProviderFamilyConnectionTransition (unknown) => void（bundle 1207）。
 *    1512–1516 选择器逐字不变。 ── */

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
  quota?: { limits?: unknown[] } | null; // A0-CLEANUP3 3b：对齐 UsageDeep.EntitlementSnapshot.quota 可空
  [key: string]: unknown;
}

/** A0-CLEANUP3 3b：renew/expire 为 ISO 字符串（源真 Date.parse 消费）；quotaLimits 具型 */
interface CodingPlanEntitlement {
  status?: string;
  planLevel?: string;
  currentProductId?: string;
  subscriptionBillingCycle?: string;
  subscriptionRenewTime?: string;
  subscriptionExpireTime?: string;
  quotaLimits?: EntitlementQuotaLimit[];
  snapshot?: unknown;
  [key: string]: unknown;
}

/* ── tombstone（A0-CLEANUP B-30）：useCodingPlanEntitlements declare 删除 →
 *    import { useCodingPlanEntitlements } from './PaymentDeep'（sX 88255）。 ── */

declare function useUpgradeEntry(): {
  openCodingPlanUpgrade: (opts: {
    providerId: string;
    initialAudience?: "personal" | "team";
    initialTeamPlanKey?: string;
    funnelContext?: FunnelContext | null; // A1-R11 型缝精化（bundle 真形）：fX 89052 读 e?.funnelContext?.purchaseAudience 并传 e.funnelContext ?? null——对象面非字符串
  }) => void;
}; // fX（89052）

/** 分区导航意图（原 sw 39377 / cw 39394 / iw 35393） */
declare function navigateToSettingsSection(section: string): void; // iw（本文件无调用点，保留 declare）

/** 服务 context（原 fs()，2638） */
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
  /** A1-R16 型缝（pCt 118459 → fCt 118446 → E0 118473 消费面）：captcha 配置取回面 */
  getCaptchaConfig?(): Promise<CaptchaConfig | null>;
  [key: string]: unknown;
}

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
  subscriptionRenewTime?: string; // A0-CLEANUP3 3b：ISO 字符串面
  subscriptionExpireTime?: string;
  quotaLimits?: EntitlementQuotaLimit[];
}; // lrt（88475）
declare function buildTeamPlanNavItems(opts: {
  items: ModelProviderNavItem[];
  codingPlanEntitlements: Record<string, CodingPlanEntitlement>;
  subscribedTeamProducts: BigModelProduct[];
  showPurchasedTeamPlanFallback: boolean;
  selectedTeamPlanKey?: string;
}): ModelProviderNavItem[]; // urt（88607）
/* ── tombstone（A1-R11）：declare toManagedProvider（原 tM，52594——普查行漂移，bundle 真身 52642）删除，
 *    改指 nullSafe as toManagedProvider（canonical = components/usage/UsageDeep.tsx；双归属 tM 同符，854 消费实测单参返回 ModelProvider | null）。 ── */
/* ── tombstone（A1-R11）：declare upgradeFunnelContext（原 PM，53205——普查行漂移，bundle 真身 53253）删除，
 *    改经文件头 import 消费（canonical 逐字 PM 53253；返回 FunnelContext 对象，1254–1275 消费面逐字不变）。 ── */
/* ── tombstone（A1-R11）：declare entryPlanStateOf（原 IM，53229——普查行漂移，bundle 真身 53277）删除，
 *    改经文件头 import 消费（canonical 逐字 IM 53277；返回 EntryPlanState 对象，1267–1271 消费面逐字不变）。 ── */
/* ── tombstone（A1-R11）：declare useFunnelDiagnostics（原 dj，51862——普查行漂移，bundle 真身 51910）删除。
 *    负证据：本文件无活调用点（仅存 declare）；bundle dj 调用实测 76295/76541/84520/190007 均落于已重建组件域，
 *    各该处已直调 canonical useBillingDiscount（components/usage/UsageDeep.tsx:1892，dj 51910 逐字）。无改指对象，纯删碑。 ── */
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
}): CodingPlanViewState; // _Zt（190181）；A0-CLEANUP3 3b：返回面收紧为 UsageDeep.CodingPlanViewState
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
/* ── tombstone（A1-R16）：declare function resolveCodingPlanProviderHeaders（原 pCt，js 118459）删除——
 *    canonical = ConversationLeaves resolveCodingPlanProviderHeaders（逐字实体化：`(await fCt(e))?.headers`
 *    投影；bundle 唯一真身 118459，本文件 handleTestModel 1987 = bundle 192570 ze 回调唯一消费）。
 *    经新 import 边取回（环安全：ConversationLeaves 不引 components/settings，grep 实证）。 ── */
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
  provider?: ModelProvider; // A0-CLEANUP3 3b：去 null（与 UsageDeep.ModelProviderNavItem 互指；调用面均以真值守卫）
  providerName?: string;
  displayName?: string;
  status?: string;
  statusLabelId?: string;
  planLevel?: string;
  currentProductId?: string;
  subscriptionBillingCycle?: string;
  subscriptionRenewTime?: string; // A0-CLEANUP3 3b：ISO 字符串面（对齐 UsageDeep.CodingPlanStatusSectionProps）
  subscriptionExpireTime?: string;
  quotaLimits?: EntitlementQuotaLimit[];
  purchaseUrl?: string;
  statusActive?: boolean;
  inactivePlanTitle?: string;
  organizationId?: string;
  projectId?: string;
  [key: string]: unknown; // A0-CLEANUP3 3b：与 UsageDeep.ModelProviderNavItem 互指（接口无隐式索引签名）
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
            provider: provider ?? undefined, // A0-CLEANUP3 3b：NavItem.provider 去 null（真值守卫消费）
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
          provider: provider ?? undefined, // A0-CLEANUP3 3b：NavItem.provider 去 null（真值守卫消费）
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
  addProviderDraft: AddProviderDraft; // A0-CLEANUP3 3b：对齐 UsageDeep.AddCustomProviderDraftForm 面
  onAddProviderDraftChange: React.Dispatch<React.SetStateAction<AddProviderDraft>>;
  onSave: (provider: ModelProvider) => void;
  onDelete: (provider: ModelProvider) => void;
  onTestModel: (provider: ModelProvider, model: string) => Promise<{ results: unknown[] }>; // A0-CLEANUP3 3b：对齐 UsageDeep.ProviderConfigCardForm 面
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
  const [funnelContext, setFunnelContext] = React.useState<FunnelContext | null>(null); // A1-R11 型缝精化：PM 53253 返回 FunnelContext 对象（1276 setFunnelContext(context) 实测）
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
    const viewState: CodingPlanViewState = // A0-CLEANUP3 3b：字面量分支按具型收敛
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
              providerId={item.presetId ?? "" /* A0-CLEANUP3 3b：运行期恒有值 */}
              providerName={item.providerName ?? "" /* A0-CLEANUP3 3b：运行期恒有值 */}
              status={(item.status ?? "disconnected") as CodingPlanDisplayStatus /* A0-CLEANUP3 3b：状态值域为 CodingPlanDisplayStatus（边界收敛） */}
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
              onOpenUpgradePlans={(request: { initialAudience: "personal" | "team"; funnelContext: FunnelContext | null }) => { // A1-R11 型缝精化：对齐 CodingPlanStatusSection.onOpenUpgradePlans 真形面（PM 53253 对象面）
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
            providerId={item.presetId ?? "" /* A0-CLEANUP3 3b：运行期恒有值 */}
            providerName={item.providerName ?? "" /* A0-CLEANUP3 3b：运行期恒有值 */}
            status={(item.status ?? "disconnected") as CodingPlanDisplayStatus /* A0-CLEANUP3 3b：状态值域为 CodingPlanDisplayStatus（边界收敛） */}
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
            onOpenUpgradePlans={(request: { initialAudience: "personal" | "team"; funnelContext: FunnelContext | null }) => { // A1-R11 型缝精化：对齐 CodingPlanStatusSection.onOpenUpgradePlans 真形面（PM 53253 对象面）
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
  const [addProviderDraft, setAddProviderDraft] = React.useState<AddProviderDraft>(createEmptyProviderDraft()); // A0-CLEANUP3 3b：具型
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
declare function createEmptyProviderDraft(): AddProviderDraft; // A0-CLEANUP3 3b：具型（源真 newAddProviderDraft）
/** 原 CYt（F12 族，154856 引用）：按模式恢复 API Key 供应商启用态（接口级） */
declare function restoreApiKeyProviderState(opts: {
  provider: ModelProvider | null;
  mode: string | null;
  now: () => number;
}): ModelProvider | null;
/** 原 zr（F12 族，跨 chunk）：OAuth provider id/域归一化（zai|bigmodel|null） */
declare function normalizeOAuthDomain(value: string | null): string | null;

