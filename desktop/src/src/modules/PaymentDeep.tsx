/* eslint-disable */
/**
 * ============================================================================
 * PaymentDeep.tsx — F12 支付深部第二符号组逐字重建（B5-04 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,979 行本机口径，未改动）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（pretty 版）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：MODULE-MAP §F12、COVERAGE-LEDGER §c.1 #2/#4（第二符号组，接口级 → 本批逐字）。
 * 前序：UsageDeep.tsx（第一符号组；76101–76563 已抽取，本件不重复）。
 *
 * 行号口径：本机 js 行（主口径）/ jsx 行。本机文件较旧账（213,695 行）在 A 段
 * 偏移 +48（s3e 旧 76246 → 本机 76294；zet 旧 84412 → 本机 84460），见报告 §2。
 *
 * 解码范围（本机 js）：76612–90228，排除：
 *  - 77062–77126  U3e/W3e/G3e 思考级别表（F08 Composer 认领段 77014–77079 旧账；
 *    唯一消费者在本段，双归属注记，本件仅 declare）
 *  - 78456–79690  vendored qrcode 生成库（p8e 包装；VENDOR 登记，不转录）
 *  - 80955–81731  vendored @stripe/react-stripe-js 6.4.0 + @stripe/stripe-js 9.6.0
 *    （V5e…F7e；版本登记，不转录）
 *  - 90180–90227  dit/fit/pit/mit（已随 Home.tsx 抽取，只注记）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  A. 上下文用量弹层（76612–76843 / jsx 67694 区）：
 *   y3e → closeThenRun                 先关弹层再执行动作 (76612 / 67694)
 *   Aq  → USAGE_CHART_COLORS           5 段用量图色 (76615)
 *   b3e → PERCENT_SCALE=100 / x3e → CACHE_HIT_DISPLAY_THRESHOLD=0.78 (76621/76622)
 *   S3e → formatCompactNumberLocale    ja 包装 (76623)
 *   C3e → formatUsedOfTotal            `used/total (pct)` (76626)
 *   w3e → formatPercentOrNull          阈值下隐 (76630 区)
 *   T3e → segmentStyleOfIndex          Aq 取色 (76637)
 *   E3e → CONTEXT_BREAKDOWN_LABEL_KEYS 7 源 i18n 键 (76640)
 *   D3e → CONTEXT_BREAKDOWN_ORDER      7 源序 (76648)
 *   O3e → aggregateContextBreakdown    chars 聚合+排序 (76656)
 *   k3e → toBreakdownSegments          → id/percent/style (76667)
 *   A3e → validTaskUsageOrNull         used/size 正数守卫 (76670)
 *   j3e → ContextUsagePopover          弹层根 (76678 / 67769)
 *  B. 工具条配置选择（76844–77061 / jsx 67907 区）：
 *   M3e → isOptionValuePresent (76844) | N3e → FULL_ACCESS_MODES (76847)
 *   P3e → categoryTestidOf (76848) | F3e → optionTestidOf (76852)
 *   I3e → ApiRetryStatusChip (76856) | L3e → modeOptionLabelOf (76874)
 *   R3e → modeLabelKeyOf (76877) | z3e → modeDescriptionKeyOf (76880)
 *   jq  → optionLabelOf (76883) | B3e → optionDescriptionOf (76886)
 *   V3e → isFullAccessMode (76892) | H3e → modeIconOf (76895)
 *   Mq  → ConfigSelect                 工具条 select 触发器 (76912 / 67907)
 *  C. 思考级别机制（77127–77325；U3e/W3e/G3e 见排除注记）：
 *   Nq → normalizeOptionKey (77127) | K3e → isThoughtOffOption (77130)
 *   q3e → thoughtRankOf (77133) | J3e → sortThoughtOptions (77141)
 *   Y3e → nextThoughtLevelValue (77153) | X3e → thoughtOptionLabelOf (77160)
 *   Pq  → ThoughtLevelControl          三态触发器 (77164 / 68111)
 *   Fq  → shortcutKeyOfCategory (77337 区) | Z3e → nextSelectValue
 *   Q3e → resolveToolbarShortcut | $3e → useToolbarShortcuts (Ctrl+M 族)
 *  D. 供应商/模型菜单机制（77452–78455）：
 *   e6e → PROVIDER_FAMILY_ORDER (77452 区) | t6e → providerFamilyRankOf
 *   Iq  → sortProvidersByFamilyAndOrder | Lq → teamOrganizationLabelOf
 *   n6e → providerDisplayLabelsOf | r6e → alwaysFalse | i6e → agentModelFormatsOf
 *   a6e → isModelEntryWithModified | Rq → modelsForAgent | o6e → hasProviderCredentials
 *   s6e → providerSupportsFormat | zq → providerSupportsAnyFormat | Bq → providerUsableForAgent
 *   c6e → isPresetDirectProvider | l6e → modelItemsOfProvider | u6e → providerGroupOf
 *   d6e/f6e → preset/codingPlan 选项键 | Vq → teamPlanOptionKey
 *   p6e → teamPlanOptionsOf | m6e → isTeamPlanKeyAllUnavailable | h6e → savedBigmodelTeamPlanKeyOf
 *   g6e → isBigmodelTeamPlanSelected | _6e → resolveFamilyDefaultOption
 *   v6e → familyGroupOf | y6e → familyOptionBadgeOf | b6e → teamPlanOptionKeysMatch
 *   x6e → inactiveOAuthFamilyOf | S6e → modelMenuGroupsForAgent | C6e → glmMenuGroupsOf
 *   Hq  → modelMenuGroupsOf | w6e → modelNameOfValue | T6e → isModelSelectorEnabled
 *   E6e → isSyntheticModel | D6e → shortModelNameOf | O6e → groupsContainValue
 *   k6e → resolveModelSelectState | A6e → hasActiveEntitlementAlias
 *   j6e → isProviderEntitlementVisible | M6e → isStartPlanVisible | N6e → filterUsableProviders
 *   P6e/F6e/I6e/L6e/R6e/z6e/B6e → 供应商指纹族 | Uq/V6e → ghost 模型解析
 *   H6e/U6e/W6e/G6e → 任务供应商解析 | K6e/q6e → 代理前缀模型
 *   J6e → canonicalModelNameOf | Y6e/X6e → claude 别名 | Z6e/Q6e/$6e → 选项调和
 *   e8e/t8e → agent 同步 | n8e/Wq/r8e/Gq/Kq/i8e → 展示序模块态
 *   a8e/o8e/s8e → 保存与目标收集 | qq → useModelProviders (— / 69033)
 *   c8e/l8e/u8e/d8e/f8e/Jq → 任务驱动刷新与配置选项钩
 *  E. 支付/产品域（79691–80954）：见 §5 头注
 *  F. Stripe 卡/验证码/PayPal/产品/订单（81732–84459）：见 §6 头注
 *  G. zet Coding Plan 对话框（84460–85995 / jsx 74125）：见 §7 头注
 *  H. Zet 结账面板+政策子组件群（85996–88046）：见 §8 头注
 *  I. xnt 用量格式化+计划源选择（88047–89988 / jsx 76242/77471）：见 §9 头注
 *  J. lit/uit 上下文 chip（89989–90179 / jsx 78047/78080）：见 §10 头注
 * ============================================================================
 */
import * as React from "react";
import { Button } from './button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
/* ── A0-S2d 接线（§2 裁决去重 76848–77167 / 76034–76156）：原本地重复转录与
 *    declare 挂接删除，canonical 在 Composer.tsx，真实 import 消费；混淆名注释随迁 ── */
import {
  ConfigSelect, // 原 Mq（76911）：工具条配置 Select（mode/thought_level/通用）
  ContextUsageProvider as ContextUsagePopoverRoot, // 原 J4e（76079）
  ContextRingTrigger as ContextUsagePopoverTrigger, // 原 X4e（76125）
  ContextRingTooltipContent as ContextUsagePopoverContent, // 原 Z4e（76139）
  ContextRingTooltipBody as ContextUsagePopoverBody, // 原 Q4e（76147）
  SegmentedProgress as SegmentedProgressBar, // 原 yq（76034）
  isDisabledThoughtOption as isThoughtOffOption, // 原 K3e（77130）：off 系选项判定
  nextThoughtLevelValue, // 原 Y3e（77155）：下一思考级别值（循环）
  sortThoughtOptions, // 原 J3e（77141）：秩稳定排序
  thoughtOptionLabel as thoughtOptionLabelOf // 原 X3e（77163）：思考选项标签
} from './Composer';
import type { ConfigSelectOption, ConfigSelectSpec } from './Composer'; // 类型垫片引用（A0-S2d）
import { Spinner } from './Home';
import { Input, PopoverContent, toast } from './ImeComposition';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from './Settings';
import { resolveModelTriggerLabel } from './SettingsLeaves';
import { logger } from './SkillStore';
import { SidebarCodingPlanWidget, SidebarStartPlanWidget, formatGrantUnits, useBillingDiscount } from './UsageDeep';
import { useServices } from './services';

/* ----------------------------------------------------------------------------
 * §0 外部依赖声明（跨 chunk / 横切 / 他族已抽取件，接口级）
 * -------------------------------------------------------------------------- */
declare function cn(...inputs: Array<string | false | null | undefined>): string; // Z
/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */
interface IntlShape {
  formatMessage(desc: { id: string }, values?: Record<string, string | number>): string;
}
declare function useZCodeIntl(): { intl: IntlShape; locale: string }; // G
declare const usePlatformService: () => { openExternal(url: string): void }; // l
/** usageStatsUiParts：ja 紧凑数字 */
declare function formatCompactNumber(value: number, locale: string, options?: Record<string, unknown>): string;
/** 本 chunk 原语：Tooltip 触发包装（Ia）/Select 五件（iO/oO/aO/sO/cO）/chevron（N_）/弹层关闭守卫（ZH/XH） */
declare const TooltipTriggerWrap: React.FC<{ title?: string; description?: string; shortcut?: string; className?: string; side?: string; align?: string; triggerRef?: React.RefObject<unknown> | null; children?: React.ReactNode }>; // Ia
declare const SelectRoot: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; value?: string; onValueChange?: (value: string) => void; disabled?: boolean; children?: React.ReactNode }>; // iO
declare const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>>; // N_
declare function isCoarseTouchDeviceGuard(args: { isCoarseTouchDevice: boolean }): boolean; // ZH
declare function detectCoarseTouchDevice(): boolean; // XH
/** src-HCld2afU / skillStore / stores 横切助手（按调用面接口级） */
declare const PROVIDER_IDS: Record<string, string>; // q（zai/bigmodel/… 族 id 表）
declare function familySpecOfProviderId(id: string): FamilySpec | null; // ot
declare function isOAuthFamilyProvider(id: string): boolean; // tr
declare function isProviderFamilyModeAllowed(args: { providerId: string; familyModes: unknown }): boolean; // Mr
declare function isProviderOAuthGateActive(args: { providerId: string; activeOAuthProvider: string | null }): boolean; // qt
declare function isExternalAgentName(name: string): boolean; // Ei
declare function modelEntryOf(value: string): { providerId?: string; modelName?: string } | null; // se
declare function composeModelValue(providerId: string, modelName: string): string; // we
declare function modelKindsOfProvider(provider: ModelProvider): string[]; // Ai
declare function formatsOfModelName(args: { provider: ModelProvider; modelName: string }): string[]; // Wr
declare function normalizeFormat(format: string): string | null; // an
declare function isModelEntry(value: unknown): value is Record<string, unknown>; // nt
declare function modelIdOfEntry(entry: Record<string, unknown>): string; // gt
declare function endpointsOfProvider(provider: ModelProvider): string[]; // Sr
declare function formatsOfEndpoints(provider: ModelProvider, format: string): unknown[]; // Ir
declare function isProviderConfigurable(provider: ModelProvider): boolean; // gi
declare function isPresetProviderId(id: string): boolean; // jt
declare function teamPlanKeyOf(args: { productId?: string | null; organizationId?: string | null; projectId?: string | null }): string; // vi
declare function parseTeamPlanKey(key: string): { organizationId?: string; productId?: string; projectId?: string } | null; // li
declare function teamPlanKeysPrefixEqual(left: string, right: string): boolean; // fi
declare function familyConnectionModeOf(familyId: string, familyModes: unknown): string; // zi
declare function resolveModelCatalogEntry(value: string): unknown; // Ie
declare function settingsConfigOptionsOf(settings: unknown): unknown[]; // Ng
declare function workspaceTargetKeyOf(target: { workspacePath: string; workspaceIdentity?: string | null }): string; // Ti
declare function syncProviderRegistryToWorkspace(args: Record<string, unknown>): Promise<Record<string, any>>; // Ks
declare function proxyModelValueOf(providerId: string, modelName: string): string; // bne
declare function defaultSupplierKeyOf(provider: string): string | null; // On
declare function supplierKeyOfModel(configOptions: unknown, model: string): string | null; // In
declare function shortcutOf(args: unknown, key: string): boolean; // ea
declare function ctrlShiftShortcutOf(args: unknown, key: string): boolean; // zre
declare const GHOST_MODEL_PREFIX: string; // Pte
declare function testidOf(prefix: string, value: string): string; // qr
declare const MODEL_OPTION_TESTID_PREFIX: string; // Xt
declare const MODE_OPTION_TESTID_PREFIX: string; // rn
declare const MODEL_MENU_TESTID: string; // Fr
/* ── tombstone（A0-S2d）：wn THOUGHT_TRIGGER_TESTID / av ModeIconDefault /
 *    Sv ModeIconPlan / Bv ModeIconAgent declare 删除——唯一消费面在 §2 重复转录段
 *    （canonical 在 Composer.tsx），随段删除后无引用。zv ModeIconFullAccess 保留
 *    （§5/§7 等正文章节仍有消费）。 ── */
declare const ModeIconFullAccess: React.FC<React.SVGProps<SVGSVGElement>>; // zv
declare const ThoughtLevelIcon: React.FC<React.SVGProps<SVGSVGElement>>; // O_
declare const TruncateLabel: React.FC<{ label: string }>; // _q
declare const KNOWN_MODEL_FORMATS: string[]; // Di
declare function isProviderSystemEnabled(id: string): boolean; // Bn
declare function hasActiveEntitlementCore(snapshot: unknown): boolean; // iM
declare const BIGMODEL_REGION_ID: string; // Ri
/** stores：workspace/session store 选择器与动作（xe/co/pc/Zs/Ec/fe/ce/be/oc/gc） */
declare const workspaceStore: { getState(): any; (selector: (state: any) => unknown): any }; // xe
declare function selectWorkspaceSlice(selector: (state: any) => unknown): (state: any) => unknown; // co
declare function useWorkspaceStore<T>(selector: (state: any) => T): T; // Zs 风格
declare function useTabsStore<T>(selector: (state: any) => T): T; // pc
declare function useBaseServicesAny(): any; // Ec
declare function workspaceStateOf(state: any, workspacePath: string, workspaceIdentity?: string | null): any; // fe
declare function taskMetaOf(state: any, taskId: string): any; // ce
declare function buildConfigOptionsFromTaskMeta(args: { taskMeta: { provider?: string | null; model?: string | null } }): any[]; // be
declare function isWorkspaceTab(tab: any): boolean; // oc
declare function remoteSessionIdOfTab(tab: any, ctx: any): string | null; // gc
/** 模型供应商缓存模块助手（fM/mM/gM/pM/hM/_M，F12 域模块态，接口级） */
declare function listCachedProviders(): ModelProvider[]; // fM
declare function publishProviders(providers: ModelProvider[], opts?: { invalidateInFlightRefresh?: boolean }): void; // mM
declare function refreshProviders(getter: () => Promise<ModelProvider[]>): Promise<void>; // gM
declare function isProvidersSnapshotHydrated(): boolean; // pM
declare function subscribeProviders(listener: (providers: ModelProvider[]) => void): () => void; // hM
declare function withProvidersHydration<T>(getter: () => Promise<T>): Promise<T>; // _M
/* ── tombstone（A0-S2d · 去重 c）：U3e THOUGHT_OFF_VALUES / G3e THOUGHT_LEVEL_LABEL_KEYS
 *    declare 删除（唯一消费面 Nq…X3e 重复转录段已删，接线空转）；
 *    yq/J4e/X4e/Z4e/Q4e 用量弹层原语（76034–76156）declare 删除，
 *    canonical 在 Composer.tsx（SegmentedProgress / ContextUsageProvider /
 *    ContextRingTrigger / ContextRingTooltipContent / ContextRingTooltipBody），
 *    经文件头真实 import 消费。 ── */
/** UsageDeep.tsx 已抽取件（s3e/v3e 侧栏件，76294/76540） */
/** UsageDeep 已抽取：hasPlanWidgetModel/hasStartPlanBalance（i3e/g3e，76230 区/76455 区） */
declare function hasPlanWidgetModel(config: any): boolean; // i3e
declare function hasStartPlanBalance(config: any): boolean; // g3e
/** src-HCld2afU testid 常量：Lte（上下文用量触发器） */
declare const CONTEXT_USAGE_TRIGGER_TESTID: string; // Lte
/** vendored qrcode（78456–79690，VENDOR 登记） */
declare const qrcode: { toDataURL(text: string, opts: { margin: number; width: number }): Promise<string> }; // Qq
/** §5 支付/产品域外部依赖 */
declare const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>>; // wa
declare const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Nv
declare const Slot: React.FC<Record<string, unknown> & { children?: React.ReactNode }>; // Gre（dist-vnZIbudW.js 导入，asChild 槽）
declare function classVariance(
  base: string,
  config: { variants?: Record<string, Record<string, string>>; defaultVariants?: Record<string, string> },
): (props?: { variant?: string }) => string; // Ta（cva 风格）
declare const ZCODE_ENV_VALUE: string; // hi
declare function envConsoleUrlOf(cfg: { ZCODE_ENV: string }): string; // Si
declare function envSiteUrlOf(cfg: { ZCODE_ENV: string }): string; // fn
declare function envPathUrlOf(cfg: { ZCODE_ENV: string }, path: string): string; // vn
declare const NETWORK_BLOCKED_ERROR_CODE: string; // Pne（跨 chunk 导入的错误码常量）
/** §6 Stripe/验证码/遥测 外部依赖 */
declare const DialogRoot: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }>; // zb
declare const DialogContent: React.FC<{ className?: string; showCloseButton?: boolean; children?: React.ReactNode }>; // Hb
declare const DialogHeader: React.FC<{ className?: string; children?: React.ReactNode }>; // Ub
declare const DialogTitle: React.FC<{ className?: string; children?: React.ReactNode }>; // Gb
declare const DialogClose: React.FC<{ asChild?: boolean; children?: React.ReactNode }>; // Vb
declare const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>>; // g
declare const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Kv
declare const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>>; // M_
declare function useAppStore<T>(selector: (state: any) => T): T; // ko（同一 store：theme + OAuth/user 状态）
/** vendored @stripe/react-stripe-js 6.4.0 原语（80955–81731 不转录，接口级 declare） */
declare const StripeElementsProvider: React.FC<{ stripe: any; options?: any; children?: React.ReactNode }>; // u7e
declare function useStripe(): any; // v7e
declare function useElements(): any; // f7e
declare const CardNumberElement: any; // y7e
declare const CardExpiryElement: any; // b7e
declare const CardCvcElement: any; // x7e
declare const stripeLoader: { loadStripe(key: string): Promise<any> }; // F7e
/** 横切：遥测上报（40457）/ 远断错误守卫（4894）/ 验证码错误码（736 导入）/ 平台桥（S） */
declare function trackTelemetry(service: any, event: Record<string, unknown>, scope: string): void; // xw
declare function isBenignRemoteError(error: unknown): boolean; // Sc
declare const SECURITY_VERIFICATION_REQUIRED_CODE: string; // one
declare function usePlatformBridge(): any; // S（openExternal/onPaymentCallback）
/** §7–§10 外部依赖（对话框原语/图标/遥测/供应商机制横切件，接口级） */
declare const DialogDescription: React.FC<{ className?: string; children?: React.ReactNode }>; // Kb
declare const DialogFooter: React.FC<{ className?: string; children?: React.ReactNode }>; // Wb
declare const TooltipRoot: React.FC<{ children?: React.ReactNode }>; // Oa
declare const TooltipTriggerAsChild: React.FC<{ asChild?: boolean; children?: React.ReactNode }>; // Ma
declare const TooltipContent: React.FC<{ sideOffset?: number; className?: string; children?: React.ReactNode }>; // ka
declare const PopoverRoot: React.FC<{ children?: React.ReactNode }>; // CN
declare const PopoverTriggerAsChild: React.FC<{ asChild?: boolean; children?: React.ReactNode }>; // wN
declare const SelectShell: React.FC<Record<string, unknown> & { children?: React.ReactNode }>; // VO
declare const SelectTriggerAsChild: React.FC<{ asChild?: boolean; children?: React.ReactNode }>; // HO
declare const SelectPopup: React.FC<{ align?: string; className?: string; children?: React.ReactNode }>; // UO
declare const SelectControl: React.FC<{ value: string; onValueChange: (value: string) => void; children?: React.ReactNode }>; // KO
declare const SelectOption: React.FC<{ value: string; className?: string; children?: React.ReactNode }>; // qO
declare const BackIcon: React.FC<React.SVGProps<SVGSVGElement>>; // S_
declare const EquityCheckIcon: React.FC<React.SVGProps<SVGSVGElement>>; // E_
declare const HelpIcon: React.FC<React.SVGProps<SVGSVGElement>>; // p
declare const SuccessIcon: React.FC<React.SVGProps<SVGSVGElement>>; // I_
declare const MinusIcon: React.FC<React.SVGProps<SVGSVGElement>>; // bv
declare const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>>; // kv
declare const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>>; // o
declare const WebElementIcon: React.FC<React.SVGProps<SVGSVGElement>>; // wye
declare const SelectionIcon: React.FC<React.SVGProps<SVGSVGElement>>; // fbe
declare const GenericProviderIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Cv
declare const ZapiProviderIcon: React.FC<React.SVGProps<SVGSVGElement>>; // zbe
declare const ModeLeadingIcon: React.FC<React.SVGProps<SVGSVGElement>>; // bbe
declare function providerLogoOf(providerId: string, className: string): React.ReactNode; // Tq
declare const BillingDiscountBanner: React.FC<{ config: any }>; // HHe
declare function trackFunnelStart(platform: any, funnel: any): void; // WUe
declare function trackPlanSelectEvent(platform: any, funnel: any, meta: Record<string, unknown>): void; // RM/zM
declare function isStructuredSelection(entry: any): boolean; // Ds
declare function isZaiCodingPlanProvider(providerId: string): boolean; // tr（跨 chunk 导入，Z.ai 编码计划供应商判定）
/** 供应商/工具条横切机制（接口级） */
declare function useModelProviders(): { modelProviders: ModelProvider[]; displayOrder?: string[]; loading: boolean; refresh: (opts?: any) => Promise<void> }; // qq
declare function useSettingsState(): { settings: any }; // JM
declare function useTabsStoreActions<T>(selector: (state: any) => T): T; // pc
declare function useWorkspaceConfigOptions(workspacePath: string, arg2: null, workspaceIdentity?: string | null): { configOptions: any[]; error: unknown }; // Jq
declare function useCoreServices(): { modelProviderService: any; credentialService: any }; // fs
declare function openSettingsSection(section: string): void; // ow
declare function invalidateSettingsCache(): void; // aw
declare function buildUpgradeFunnel(args: Record<string, unknown>): any; // PM
declare function entryPlanStateOf(args: Record<string, unknown>): string; // IM
declare const ModelSelectMenu: React.FC<Record<string, any>>; // vq
declare function providerEntryOrNull(entry: ModelProvider | null): ModelProvider | null; // tM（UsageDeep 52642，双归属）
declare function providerFingerprintKeyOf(entry: any): string; // nM（UsageDeep 52645，双归属；指纹串 id:hash）
declare function connectionModeContextOf(args: Record<string, unknown>): any; // N6e
declare function normalizedModelOptionsOf(options: any[], currentValue: unknown, context: any): any[]; // L
declare function modelGroupsOf(provider: string, options: any[], context: any, labels: Record<string, string>, displayOrder: string[] | undefined, familyModes: unknown, selectedKeys: unknown, extra: unknown[], flag: boolean, a: unknown, b: unknown, opts: Record<string, unknown>): any[]; // Hq
declare function isModelMenuStructured(provider: string): boolean; // r6e
declare function useManageModelsAvailable(onManage: () => void): boolean; // T6e
declare function normalizeModelSelectionValue(value: string, groups: any[], manageAvailable: boolean, manageLabel: string): { value?: string; placeholder?: string }; // k6e
declare function shouldProbeStartPlanEntitlement(args: { codingPlanProviderFingerprint: string | null; codingPlanProviderId: string; codingPlanSnapshot: any; codingPlanLoading: boolean; codingPlanError: unknown }): boolean; // aM（UsageDeep/F08 已抽取，双归属）
declare function useEntitlementSubscription(args: Record<string, unknown>): { snapshot: any; loading: boolean; error: unknown; refresh: (opts?: any) => Promise<void> }; // $j
declare function entitlementCacheKeyOf(args: { providerId: string; providerFingerprint: string | null }): string; // Bj
declare function parseModelProjection(value: string): { providerId?: string; modelId?: string; variant?: string } | null; // Mg
declare function defaultSessionModeOf(config?: unknown): string; // $M/Krt
declare function sessionModeCatalog(): Array<{ id: string; name: string; description?: string }>; // cn（无参，模式目录）
declare function shortcutLabelOf(key: string): string; // Bre/Zi
declare function isThoughtCapableModel(model: string): boolean; // qn
declare const DEFAULT_THOUGHT_LEVELS: string[]; // ui
declare function phaseAutoRefreshModeOf(phase: string): string; // l8e
declare function registerSessionRefresh(args: { phase: string; refresh: (opts?: any) => Promise<void>; sessionId: string }): void; // d8e
declare const MODE_TRIGGER_TESTID: string; // un
declare const MODEL_TOOLBAR_TESTID: string; // Uee
declare function planDomainsOf(cfg: any): any; // hee
declare function authSessionOf(): any; // xi

interface ModelProvider {
  id: string;
  name: string;
  models: unknown[];
  endpoints: { baseURL?: string; paths?: Record<string, string> };
  apiKey: string;
  organizationName?: string | null;
  [key: string]: any;
}
interface FamilySpec {
  id: string;
  label: string;
  startPlanProviderId: string;
  codingPlanProviderId: string;
  apiKeyProviderId: string;
}
interface ConfigOptionEntry {
  category: string;
  type: string;
  value?: string;
  name?: string;
  description?: string;
  currentValue?: unknown;
  options?: Array<{ value: string; name?: string; description?: string }>;
}

/* ----------------------------------------------------------------------------
 * §1 上下文用量弹层（原 y3e…j3e，76612–76843 / jsx 67694–67906）
 * -------------------------------------------------------------------------- */

/** 原 y3e（76612 / 67694）：先关弹层再执行动作 */
export function closeThenRun({ action, close }: { action?: () => void; close: () => void }) {
  (close(), action?.());
}

/** 原 Aq（76615）：用量图 5 段色 */
export const USAGE_CHART_COLORS = [
    `var(--color-usage-chart-1)`,
    `color-mix(in oklab, var(--color-usage-chart-1) 78%, var(--color-surface))`,
    `color-mix(in oklab, var(--color-usage-chart-1) 58%, var(--color-surface))`,
    `color-mix(in oklab, var(--color-usage-chart-1) 42%, var(--color-surface))`,
    `color-mix(in oklab, var(--color-usage-chart-1) 28%, var(--color-surface))`,
  ];
/** 原 b3e（76621） */
export const PERCENT_SCALE = 100;
/** 原 x3e（76622） */
export const CACHE_HIT_DISPLAY_THRESHOLD = 0.78;

/** 原 S3e（76623）：ja 紧凑数字（locale 序参） */
export function formatCompactNumberLocale(value: number, locale: string, options: Record<string, unknown> = {}) {
  return formatCompactNumber(value, locale, options);
}

/** 原 C3e（76626）：`used/total (percent)` */
export function formatUsedOfTotal({ locale, percent, size, used }: { locale: string; percent: number; size: number; used: number }) {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: `percent` });
  return `${formatCompactNumberLocale(used, locale)}/${formatCompactNumberLocale(size, locale, { maximumFractionDigits: 0 })} (${formatter.format(percent)})`;
}

/** 原 w3e（76630 区）：百分比格式化（阈值下可隐） */
export function formatPercentOrNull(value: number | null | undefined, locale: string, options: { showBelowThreshold?: boolean } = {}) {
  return value == null || !Number.isFinite(value) || (!options.showBelowThreshold && value < CACHE_HIT_DISPLAY_THRESHOLD)
    ? null
    : new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: `percent` }).format(
        Math.max(0, value),
      );
}

/** 原 T3e（76637）：段样式取色 */
export function segmentStyleOfIndex(index: number): { backgroundColor: string } {
  return { backgroundColor: USAGE_CHART_COLORS[Math.min(index, USAGE_CHART_COLORS.length - 1)] ?? USAGE_CHART_COLORS[0] };
}

/** 原 E3e（76640）：上下文分解 7 源 i18n 键 */
export const CONTEXT_BREAKDOWN_LABEL_KEYS = {
    messages: `chat.contextUsage.breakdown.messages`,
    system_prompt: `chat.contextUsage.breakdown.systemPrompt`,
    meta_user_context: `chat.contextUsage.breakdown.metaUserContext`,
    skills: `chat.contextUsage.breakdown.skills`,
    tool_prompt: `chat.contextUsage.breakdown.toolPrompt`,
    system_tool_schemas: `chat.contextUsage.breakdown.systemTools`,
    mcp_tool_schemas: `chat.contextUsage.breakdown.mcpTools`,
  };
/** 原 D3e（76648）：上下文分解 7 源序 */
export const CONTEXT_BREAKDOWN_ORDER: Record<string, number> = {
    messages: 0,
    system_prompt: 1,
    meta_user_context: 2,
    skills: 3,
    tool_prompt: 4,
    system_tool_schemas: 5,
    mcp_tool_schemas: 6,
  };

/** 原 O3e（76656）：chars 聚合 → 占比+序 */
export function aggregateContextBreakdown(entries: Array<{ chars: number; source: string }> | null | undefined) {
  const totals = new Map<string, number>();
  for (const entry of entries ?? [])
    !Number.isFinite(entry.chars) || entry.chars <= 0 || totals.set(entry.source, (totals.get(entry.source) ?? 0) + entry.chars);
  const sum = [...totals.values()].reduce((left, right) => left + right, 0);
  return sum <= 0
    ? []
    : [...totals.entries()]
        .map(([source, chars]) => ({ chars, percent: chars / sum, source }))
        .sort((left, right) => right.chars - left.chars || CONTEXT_BREAKDOWN_ORDER[left.source] - CONTEXT_BREAKDOWN_ORDER[right.source]);
}

/** 原 k3e（76667）：分解 → 段（id/percent/style） */
export function toBreakdownSegments(entries: Array<{ source: string; percent: number }>) {
  return entries.map((entry, index) => ({ id: entry.source, percent: entry.percent, style: segmentStyleOfIndex(index) }));
}

/** 原 A3e（76670）：used/size 正数守卫 */
export function validTaskUsageOrNull(usage: { used: number; size: number; cache?: any; breakdown?: any } | null | undefined) {
  return !usage || !Number.isFinite(usage.used) || !Number.isFinite(usage.size) || usage.used <= 0 || usage.size <= 0
    ? null
    : usage;
}

/** 原 j3e（76678 / 67769）：上下文用量弹层根（分解+缓存命中+侧栏计划件） */
export function ContextUsagePopover({
  codingPlanUsageRemaining,
  startPlanBalance,
  taskUsage,
  selectedProvider,
  intl,
  locale,
}: {
  codingPlanUsageRemaining: any;
  startPlanBalance: any;
  taskUsage: any;
  selectedProvider: any;
  intl: IntlShape;
  locale: string;
  onSendCompressionCommand?: any; // iit 调用端透传（j3e 本体不消费）
  compressionDisabled?: boolean; // 同上
}) {
  const [open, setOpen] = React.useState(!1);
  const usage = validTaskUsageOrNull(taskUsage);
  const codingPlanConfig = React.useMemo(
    () =>
      codingPlanUsageRemaining?.onUsageClick
        ? { ...codingPlanUsageRemaining, onUsageClick: () => closeThenRun({ action: codingPlanUsageRemaining.onUsageClick, close: () => setOpen(!1) }) }
        : codingPlanUsageRemaining,
    [codingPlanUsageRemaining],
  );
  const startPlanConfig = React.useMemo(() => {
    if (startPlanBalance)
      return startPlanBalance.onUpgradeClick
        ? {
            ...startPlanBalance,
            onUpgradeClick: () => {
              (setOpen(!1), startPlanBalance.onUpgradeClick?.());
            },
          }
        : startPlanBalance;
  }, [startPlanBalance]);
  const showCodingPlan = codingPlanConfig ? hasPlanWidgetModel(codingPlanConfig) : !1;
  const showStartPlan = hasStartPlanBalance(startPlanConfig);
  const numberFormat = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const titleWithUsage = React.useMemo(
    () =>
      usage
        ? intl.formatMessage(
            { id: `chat.contextUsage` },
            { used: numberFormat.format(usage.used), total: numberFormat.format(usage.size) },
          )
        : null,
    [intl, numberFormat, usage],
  );
  const cacheHitRate = React.useMemo(() => formatPercentOrNull(usage?.cache?.hitRate, locale, { showBelowThreshold: !1 }), [locale, usage]);
  const breakdown = React.useMemo(() => aggregateContextBreakdown(usage?.breakdown), [usage?.breakdown]);
  const segments = React.useMemo(() => toBreakdownSegments(breakdown), [breakdown]);
  const percentFormat = React.useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: `percent` }),
    [locale],
  );
  if ((!usage || !titleWithUsage) && !showCodingPlan && !showStartPlan) return null;
  const ratio = usage ? Math.min(Math.max(usage.used / usage.size, 0), 1) : 0;
  const usedOfTotal = usage ? formatUsedOfTotal({ locale, percent: ratio, size: usage.size, used: usage.used }) : null;
  const triggerLabel =
    titleWithUsage ??
    (showCodingPlan
      ? intl.formatMessage({ id: `sidebar.usage.plan.title` })
      : intl.formatMessage({ id: `settings.modelProvider.startPlan.balance.title` }));
  return (
    <ContextUsagePopoverRoot
      usedTokens={usage?.used ?? 0}
      maxTokens={usage?.size ?? 1}
      open={open}
      onOpenChange={setOpen}
    >
      <ContextUsagePopoverTrigger
        aria-label={triggerLabel}
        className={`text-foreground-subtle`}
        data-chat-toolbar-popover-trigger={`true`}
        data-testid={CONTEXT_USAGE_TRIGGER_TESTID}
      />
      <ContextUsagePopoverContent className={`!w-80 !rounded-xl !shadow-md`} side={`top`} sideOffset={2}>
        <ContextUsagePopoverBody className={`space-y-3`}>
          {usage && usedOfTotal ? (
            <div className={`space-y-2`}>
              <div className={`flex min-w-0 mb-3 items-center gap-3`}>
                <span className={`shrink-0 text-ui-base font-medium text-foreground`}>
                  {intl.formatMessage({ id: `chat.contextUsage.title` })}
                </span>
                <span className={`ml-auto shrink-0 text-right font-mono text-ui-sm text-foreground-subtle`}>
                  {usedOfTotal}
                </span>
              </div>
              <SegmentedProgressBar
                className={`h-2 bg-surface`}
                indicatorClassName={`min-w-2`}
                segments={segments}
                value={ratio * PERCENT_SCALE}
              />
            </div>
          ) : null}
          {usage && (breakdown.length > 0 || cacheHitRate) ? (
            <>
              {breakdown.length > 0 ? (
                <div aria-label={intl.formatMessage({ id: `chat.contextUsage.breakdown` })} className={`space-y-1.5`}>
                  <div className={`grid gap-1.5`}>
                    {breakdown.map((entry, index) => (
                      <div key={entry.source} className={`flex min-w-0 items-center gap-2 text-ui-sm`}>
                        <span aria-hidden={`true`} className={`size-2 shrink-0 rounded-sm border border-border`} style={segmentStyleOfIndex(index)} />
                        <span className={`min-w-0 truncate text-foreground-subtle`}>
                          {intl.formatMessage({ id: (CONTEXT_BREAKDOWN_LABEL_KEYS as Record<string, string>)[entry.source] })}
                        </span>
                        <span className={`ml-auto min-w-10 shrink-0 text-right font-mono text-ui-sm tabular-nums text-foreground`}>
                          {percentFormat.format(entry.percent)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {cacheHitRate ? (
                <div
                  className={cn(
                    `flex items-center justify-between gap-3 text-ui-sm`,
                    breakdown.length > 0 && `border-t border-border pt-3`,
                  )}
                >
                  <span className={`text-foreground-subtle`}>
                    {intl.formatMessage({ id: `chat.contextUsage.cacheHitRate` })}
                  </span>
                  <span className={`font-mono text-ui-sm text-foreground`}>{cacheHitRate}</span>
                </div>
              ) : null}
            </>
          ) : null}
          {codingPlanConfig && showCodingPlan ? (
            <SidebarCodingPlanWidget config={codingPlanConfig} intl={intl} locale={locale} separated={!!(usage && usedOfTotal)} />
          ) : null}
          {startPlanConfig && showStartPlan ? (
            <SidebarStartPlanWidget config={startPlanConfig} intl={intl} locale={locale} separated={!!((usage && usedOfTotal) || showCodingPlan)} />
          ) : null}
        </ContextUsagePopoverBody>
      </ContextUsagePopoverContent>
    </ContextUsagePopoverRoot>
  );
}

/* ----------------------------------------------------------------------------
 * §2 tombstone（A0-S2d · §2 裁决「重复转录件删除」，76848–77167）：
 *    原 M3e…Mq ConfigSelect 整闭包（isOptionValuePresent / FULL_ACCESS_MODES /
 *    categoryTestidOf / optionTestidOf / ApiRetryStatusChip / MODE_LABEL_KEYS /
 *    MODE_DESCRIPTION_KEYS / modeOptionLabelOf / modeLabelKeyOf /
 *    modeDescriptionKeyOf / optionLabelOf / optionDescriptionOf /
 *    isFullAccessMode / modeIconOf / ConfigSelect，242 行）为 PaymentDeep
 *    重复转录；canonical 在 Composer.tsx [D] 段（isOptionValue /
 *    DANGEROUS_MODE_VALUES / configSelectTestId / configOptionTestId /
 *    ApiRetryIndicator / modeOptionLabel / modeLabelI18nId /
 *    modeDescriptionI18nId / configOptionLabel / configOptionDescription /
 *    isDangerousModeValue / modeOptionIcon / ConfigSelect，js 76849–77167）。
 *    消费面（ModePickerTrigger 的 <ConfigSelect>）改自 Composer 真实 import，
 *    语义不变。
 * -------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * §3 思考级别机制（原 Pq…$3e，77164–77451；Nq…X3e 前半已去重删除，见下方 tombstone）
 * -------------------------------------------------------------------------- */

/* ── tombstone（A0-S2d · 去重 b/c，77127–77163）：Nq normalizeOptionKey /
 *    K3e isThoughtOffOption / q3e thoughtRankOf / J3e sortThoughtOptions /
 *    Y3e nextThoughtLevelValue / X3e thoughtOptionLabelOf 为重复转录，
 *    canonical 在 Composer.tsx（normalizeThoughtLevelKey /
 *    isDisabledThoughtOption / thoughtOptionRank / sortThoughtOptions /
 *    nextThoughtLevelValue / thoughtOptionLabel）；消费面（sortThoughtOptions /
 *    thoughtOptionLabelOf / isThoughtOffOption / nextThoughtLevelValue 调用点）
 *    改自 Composer 真实 import。W3e THOUGHT_LEVEL_RANKS 的 import（原 88 行）
 *    随段删除（唯一消费为 q3e thoughtRankOf）。 ── */

/** 原 Pq（77164 / 68111）：思考级别三态触发器（固定/Select/循环按钮） */
export function ThoughtLevelControl({
  disabled,
  disabledReason,
  interactionMode = `select`,
  indicatorClassName,
  intl,
  labelVisibilityClassName = `hidden @xl/composer:inline-flex`,
  option,
  provider,
  showInvalidCurrentValue = !1,
  restoreFocusSelector = `[data-testid="chat-input"]`,
  shortcutLabel,
  triggerClassName,
  triggerRef,
  open,
  onOpenChange,
  onValueChange,
}: {
  disabled?: boolean;
  disabledReason?: string | null;
  interactionMode?: string;
  indicatorClassName?: string;
  intl: IntlShape;
  labelVisibilityClassName?: string;
  option: ConfigOptionEntry;
  provider?: string | null;
  showInvalidCurrentValue?: boolean;
  restoreFocusSelector?: string;
  shortcutLabel?: string;
  triggerClassName?: string;
  triggerRef?: React.RefObject<unknown> | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onValueChange: (value: string) => void;
}) {
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const [labelVisible, setLabelVisible] = React.useState(!0);
  const measureVisibility = React.useCallback((node: HTMLSpanElement | null) => {
    if (!node) return;
    const style = window.getComputedStyle(node);
    setLabelVisible(style.display !== `none` && style.visibility !== `hidden` && node.getClientRects().length > 0);
  }, []);
  let frame: number | null = null;
  const scheduleMeasure = () => {
    frame === null &&
      (frame = requestAnimationFrame(() => {
        ((frame = null), measureVisibility(labelRef.current));
      }));
  };
  const sorted = option.type === `select` ? sortThoughtOptions((option.options ?? []) as ConfigSelectOption[]) : [];
  const currentIndex = sorted.findIndex((item) => item.value === option.currentValue);
  const hasCurrent = currentIndex >= 0;
  const showInvalid = showInvalidCurrentValue && !hasCurrent;
  const effectiveIndex = Math.max(0, currentIndex);
  const effectiveOption = sorted[effectiveIndex] ?? sorted[0];
  const singleFixed = sorted.length === 1 && hasCurrent;
  const label = showInvalid ? String(option.currentValue) : effectiveOption ? thoughtOptionLabelOf(intl, provider ?? undefined, option as unknown as ConfigSelectSpec, effectiveOption) : ``;
  const tooltipDefault = intl.formatMessage({ id: `chat.toolbar.thoughtLevel.tooltip` });
  const tooltipTitle = disabledReason ?? (labelVisible ? tooltipDefault : label);
  React.useEffect(() => {
    const node = labelRef.current;
    if (!node) return;
    measureVisibility(node);
    const observer =
      typeof ResizeObserver > `u`
        ? null
        : new ResizeObserver(() => {
            scheduleMeasure();
          });
    return (
      observer?.observe(node),
      node.parentElement && observer?.observe(node.parentElement),
      window.addEventListener(`resize`, scheduleMeasure),
      () => {
        (observer?.disconnect(),
          window.removeEventListener(`resize`, scheduleMeasure),
          frame !== null && cancelAnimationFrame(frame));
      }
    );
  }, [label, labelVisibilityClassName, measureVisibility]);
  const offCount = sorted.filter(isThoughtOffOption).length;
  const levelPercent = ((showInvalid ? 0 : Math.max(0, effectiveIndex + 1 - offCount)) / Math.max(1, sorted.length - offCount)) * 100;
  if (option.type !== `select` || sorted.length === 0 || !effectiveOption) return null;
  const cycle = () => {
    const next = sorted[showInvalid ? 0 : (effectiveIndex + 1) % sorted.length];
    next && onValueChange(next.value);
  };
  const triggerInner = (
    <>
      <ThoughtLevelIcon className={cn(`pointer-events-none size-4 text-current`)} />
      <span
        className={cn(
          `relative w-1 self-stretch overflow-hidden rounded-full bg-current/10`,
          `hidden @sm/composer:inline-flex @xl/composer:hidden`,
        )}
        aria-hidden={`true`}
      >
        <span
          className={cn(
            `absolute bottom-0 left-0 w-full rounded-full bg-success transition-[height] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]`,
            levelPercent > 0 ? `min-h-1` : void 0,
          )}
          style={{ height: `${levelPercent}%` }}
        />
      </span>
      <span ref={labelRef} className={cn(`min-w-0 whitespace-nowrap`, labelVisibilityClassName)}>
        <TruncateLabel label={label} />
      </span>
    </>
  );
  return singleFixed ? (
    <TooltipTriggerWrap title={tooltipTitle} triggerRef={triggerRef}>
      <span
        className={cn(
          `inline-flex h-7 items-center gap-1 rounded-lg px-1.5 py-1.5 text-ui-base text-foreground`,
          triggerClassName,
        )}
        aria-label={label}
        data-thought-level-fixed={`true`}
        data-testid={MODEL_MENU_TESTID}
      >
        {triggerInner}
      </span>
    </TooltipTriggerWrap>
  ) : interactionMode === `select` ? (
    <SelectRoot
      open={open}
      onOpenChange={onOpenChange}
      value={String(option.currentValue)}
      onValueChange={(value) => {
        sorted.some((item) => item.value === value) && onValueChange(value);
      }}
      disabled={disabled}
    >
      <TooltipTriggerWrap title={tooltipTitle} shortcut={shortcutLabel} triggerRef={triggerRef}>
        <SelectTrigger
          variant={`ghost`}
          size={`default`}
          indicator={<ChevronDownIcon className={cn(`pointer-events-none size-3.5 text-foreground-subtle`, indicatorClassName)} />}
          className={cn(`gap-1 rounded-lg px-1.5 py-1.5 text-ui-base`, triggerClassName)}
          aria-label={label}
          data-chat-toolbar-popover-trigger={`true`}
          data-testid={MODEL_MENU_TESTID}
        >
          {triggerInner}
        </SelectTrigger>
      </TooltipTriggerWrap>
      <SelectContent
        position={`popper`}
        side={`top`}
        align={`start`}
        sideOffset={4}
        collisionPadding={8}
        onCloseAutoFocus={(event: Event) => {
          restoreFocusSelector &&
            (event.preventDefault(),
            isCoarseTouchDeviceGuard({ isCoarseTouchDevice: detectCoarseTouchDevice() }) && (document.querySelector(restoreFocusSelector) as HTMLElement | null)?.focus());
        }}
      >
        {sorted.map((item) => (
          <SelectItem key={item.value} value={item.value} data-testid={testidOf(MODEL_OPTION_TESTID_PREFIX as unknown as string, item.value) as unknown as string}>
            <span className={`first-letter:uppercase`}>{thoughtOptionLabelOf(intl, provider ?? undefined, option as unknown as ConfigSelectSpec, item)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  ) : (
    <TooltipTriggerWrap title={tooltipTitle} shortcut={shortcutLabel} triggerRef={triggerRef}>
      <Button
        type={`button`}
        variant={`ghost`}
        size={`default`}
        disabled={disabled}
        data-chat-toolbar-popover-trigger={`true`}
        data-testid={MODEL_MENU_TESTID}
        className={cn(`gap-1 rounded-lg px-1.5 py-1.5 text-ui-base`, triggerClassName)}
        aria-label={label}
        onClick={cycle}
      >
        {triggerInner}
      </Button>
    </TooltipTriggerWrap>
  );
}

/** 原 Fq（77337 区）：类别快捷键键位 */
export function shortcutKeyOfCategory(category: string | undefined): string | null {
  switch (category) {
    case `model`:
      return `m`;
    case `mode`:
      return `ctrlShiftM`;
    case `thought_level`:
      return `t`;
    default:
      return null;
  }
}

/** 原 Z3e（77348 区）：通用下一选项值 */
export function nextSelectValue(option: ConfigOptionEntry): string | null {
  if (option.type !== `select` || !option.options?.length) return null;
  const current = String(option.currentValue);
  const index = option.options.findIndex((item) => item.value === current);
  const next = index === -1 ? 0 : (index + 1) % option.options.length;
  return option.options[next]?.value ?? null;
}

interface ToolbarShortcutContext {
  hasAnyOption: boolean;
  toolbarDisabled?: boolean;
  modelMenuDisabled?: boolean;
  modelOption?: ConfigOptionEntry | null;
  modeOption?: ConfigOptionEntry | null;
  thoughtOption?: ConfigOptionEntry | null;
}

/** 原 Q3e（77355 区）：工具条快捷键意图解析 */
export function resolveToolbarShortcut(
  event: KeyboardEvent,
  { hasAnyOption, toolbarDisabled, modelMenuDisabled, modelOption, modeOption, thoughtOption }: ToolbarShortcutContext,
): "openModelMenu" | "cycleSessionMode" | "cycleThoughtLevel" | null {
  if (!hasAnyOption || toolbarDisabled || event.defaultPrevented || event.repeat || event.isComposing) return null;
  if (shortcutOf(event, `m`)) {
    const key = shortcutKeyOfCategory(modelOption?.category);
    return !modelOption || key !== `m` || modelMenuDisabled ? null : `openModelMenu`;
  }
  if (ctrlShiftShortcutOf(event, `m`)) {
    const key = shortcutKeyOfCategory(modeOption?.category);
    return !modeOption || key !== `ctrlShiftM` ? null : `cycleSessionMode`;
  }
  if (shortcutOf(event, `t`)) {
    const key = shortcutKeyOfCategory(thoughtOption?.category);
    return !thoughtOption || key !== `t` ? null : `cycleThoughtLevel`;
  }
  return null;
}

/** 原 $3e（77370 区）：工具条快捷键钩（capture keydown） */
export function useToolbarShortcuts(context: ToolbarShortcutContext & {
  onOpenModelMenu: () => void;
  onCycleSessionMode: () => void;
  onCycleThoughtLevel: () => void;
}) {
  const {
    hasAnyOption,
    toolbarDisabled,
    modelMenuDisabled,
    modelOption,
    modeOption,
    thoughtOption,
    onOpenModelMenu,
    onCycleSessionMode,
    onCycleThoughtLevel,
  } = context;
  React.useEffect(() => {
    if (!hasAnyOption) return;
    function handleKeydown(event: KeyboardEvent) {
      const intent = resolveToolbarShortcut(event, {
        hasAnyOption,
        toolbarDisabled,
        modelMenuDisabled,
        modelOption,
        modeOption,
        thoughtOption,
      });
      if (!intent) {
        shortcutOf(event, `m`) &&
          logger.debug(`[V4ComposerToolbar] Ctrl+M 未打开模型菜单`, {
            hasModelOption: !!modelOption,
            shortcutKey: shortcutKeyOfCategory(modelOption?.category),
            modelMenuDisabled,
          });
        return;
      }
      if ((event.preventDefault(), intent === `openModelMenu`)) {
        (logger.debug(`[V4ComposerToolbar] Ctrl+M 打开模型菜单`), onOpenModelMenu());
        return;
      }
      if (intent === `cycleSessionMode`) {
        onCycleSessionMode();
        return;
      }
      intent === `cycleThoughtLevel` && onCycleThoughtLevel();
    }
    return (
      window.addEventListener(`keydown`, handleKeydown, !0),
      () => {
        window.removeEventListener(`keydown`, handleKeydown, !0);
      }
    );
  }, [hasAnyOption, toolbarDisabled, modelMenuDisabled, modeOption, modelOption, onOpenModelMenu, onCycleSessionMode, onCycleThoughtLevel, thoughtOption]);
}

/* ----------------------------------------------------------------------------
 * §4 供应商/模型菜单机制（原 e6e…Jq，77452–78455）
 * -------------------------------------------------------------------------- */

/** 原 e6e（77452 区）：供应商族序 */
export const PROVIDER_FAMILY_ORDER = new Map<string, number>([
  [PROVIDER_IDS.zaiStartPlan, 0],
  [PROVIDER_IDS.zaiCodingPlan, 1],
  [PROVIDER_IDS.zai, 2],
  [PROVIDER_IDS.bigmodelStartPlan, 3],
  [PROVIDER_IDS.bigmodelCodingPlan, 4],
  [PROVIDER_IDS.bigmodel, 5],
  [PROVIDER_IDS.zapi, 6],
]);

/** 原 t6e（77461 区）：族秩（缺省 200） */
export function providerFamilyRankOf(provider: { id: string }): number {
  const rank = PROVIDER_FAMILY_ORDER.get(provider.id);
  return rank === void 0 ? 200 : rank;
}

/** 原 Iq（77465 区）：族序+自定义展示序双级排序 */
export function sortProvidersByFamilyAndOrder(providers: ModelProvider[], displayOrder?: { providerIds: string[] } | null) {
  const byFamily = providers
      .map((provider, index) => ({ provider, index }))
      .sort((left, right) => {
        const delta = providerFamilyRankOf(left.provider) - providerFamilyRankOf(right.provider);
        return delta === 0 ? left.index - right.index : delta;
      }),
    familyRank = new Map(byFamily.map(({ provider }, index) => [provider.id, index])),
    customRank = new Map((displayOrder?.providerIds ?? []).map((id, index) => [id, index]));
  return byFamily
    .sort((left, right) => {
      const leftCustom = customRank.get(left.provider.id),
        rightCustom = customRank.get(right.provider.id);
      return (
        ((leftCustom !== void 0 || rightCustom !== void 0) && (leftCustom ?? 2 ** 53 - 1) - (rightCustom ?? 2 ** 53 - 1)) ||
        (familyRank.get(left.provider.id) ?? left.index) - (familyRank.get(right.provider.id) ?? right.index)
      );
    })
    .map(({ provider }) => provider);
}

/** 原 Lq（77486 区）：团队组织标签 */
export function teamOrganizationLabelOf(product: { organizationName?: string | null }): string | null {
  return (product.organizationName?.trim() ?? ``) || null;
}

/** 原 n6e（77489 区）：供应商展示标签（Z.ai/BigModel + 徽章） */
export function providerDisplayLabelsOf(provider: ModelProvider, options: { codingPlanBadgeLabel?: string } = {}) {
  const codingPlanBadgeLabel = options.codingPlanBadgeLabel ?? `Individual`;
  return provider.id === PROVIDER_IDS.zai
    ? { label: `Z.ai` }
    : isOAuthFamilyProvider(provider.id)
      ? { label: `Z.ai`, labelBadge: codingPlanBadgeLabel }
      : provider.id === PROVIDER_IDS.bigmodel
        ? { label: `BigModel` }
        : provider.id === PROVIDER_IDS.bigmodelCodingPlan || provider.id === PROVIDER_IDS.bigmodelStartPlan
          ? { label: `BigModel`, labelBadge: codingPlanBadgeLabel }
          : { label: provider.name };
}

/** 原 r6e（77501 区）：恒 false（3.7.6 死开关，逐字保留） */
export function alwaysFalse(_value: unknown): boolean {
  return !1;
}

/** 原 i6e（77504 区）：agent → 模型格式序表 */
export function agentModelFormatsOf(agent: string): string[] | null {
  return agent === `claude`
    ? [`anthropic`]
    : agent === `opencode`
      ? [`openai`]
      : agent === `glm`
        ? [`anthropic`, `responses`, `openai`]
        : agent === `codex`
          ? [`responses`, `openai`, `gemini`]
          : agent === `gemini`
            ? [`openai`]
            : null;
}

/** 原 a6e（77515 区）：模型条目 modified 布尔守卫 */
export function isModelEntryWithModified(entry: unknown): boolean {
  return isModelEntry(entry) && ((entry as any).modified === !1 || (entry as any).modified === !0);
}

/** 原 Rq（77518 区）：agent 可用模型（格式过滤+kind 重定向） */
export function modelsForAgent(agent: string, provider: ModelProvider): string[] {
  const formats = agentModelFormatsOf(agent),
    known = new Set(KNOWN_MODEL_FORMATS),
    isAllowed = (format: string) =>
      isProviderSystemEnabled(provider.id) ? known.has(format) || provider.models.some((model) => isModelEntry(model) && (model as any).id.trim() === format && isModelEntryWithModified(model)) : !0,
    retarget = (format: string) => {
      const entry = provider.models.find((model) => isModelEntry(model) && (model as any).id.trim() === format);
      if (!entry) return format;
      const entryFormats = formatsOfModelName({ provider, modelName: format });
      const matched = (formats ?? entryFormats).map(normalizeFormat).find((normalized) => normalized !== null && ((entry as any).kinds as string[]).includes(normalized));
      return (matched && ((entry as any).modelIdByKind as Record<string, string> | undefined)?.[matched]?.trim()) || format;
    },
    all = modelKindsOfProvider(provider).filter(isAllowed).map(retarget);
  return formats
    ? modelKindsOfProvider(provider).flatMap((format) => {
        if (!isAllowed(format)) return [];
        const entryFormats = formatsOfModelName({ provider, modelName: format });
        return formats.some((wanted) => entryFormats.includes(wanted)) ? [retarget(format)] : [];
      })
    : all;
}

/** 原 o6e（77541 区）：凭据就绪（apiKey 或预设端点） */
export function hasProviderCredentials(provider: ModelProvider): boolean {
  return provider.apiKey.trim().length > 0 ? !0 : isOAuthFamilyProvider(provider.id) ? endpointsOfProvider(provider).length > 0 : !1;
}

/** 原 s6e（77544 区）：供应商支持单格式 */
export function providerSupportsFormat(provider: ModelProvider, format: string): boolean {
  const normalized = normalizeFormat(format);
  return normalized ? formatsOfEndpoints(provider, normalized).length > 0 : !1;
}

/** 原 zq（77548 区）：任一格式支持 */
export function providerSupportsAnyFormat(provider: ModelProvider, formats: string[]): boolean {
  return formats.some((format) => providerSupportsFormat(provider, format));
}

/** 原 Bq（77551 区）：agent × 供应商可用性 */
export function providerUsableForAgent(agent: string, provider: ModelProvider): boolean {
  return !isProviderConfigurable(provider) || modelsForAgent(agent, provider).length === 0 || !hasProviderCredentials(provider)
    ? !1
    : agent === `claude`
      ? providerSupportsAnyFormat(provider, [`anthropic`])
      : agent === `codex` || agent === `opencode`
        ? providerSupportsAnyFormat(provider, [`responses`, `openai`])
        : agent === `gemini`
          ? providerSupportsAnyFormat(provider, [`openai`])
          : agent === `glm`
            ? providerSupportsAnyFormat(provider, [`anthropic`, `responses`, `openai`])
            : !1;
}

/** 原 c6e（77563 区）：预设直连供应商（非 zapi） */
export function isPresetDirectProvider(id: string): boolean {
  return isPresetProviderId(id) && id !== PROVIDER_IDS.zapi;
}

/** 原 l6e（77566 区）：供应商模型项（key/value/name） */
export function modelItemsOfProvider(context: { selectedProvider: string; provider: ModelProvider }) {
  return modelsForAgent(context.selectedProvider, context.provider).map((model, index) => ({
    key: `provider:${context.provider.id}:${index}:${model}`,
    value: composeModelValue(context.provider.id, model),
    name: model,
  }));
}

/** 原 u6e（77573 区）：单供应商分组 */
export function providerGroupOf(selectedProvider: string, provider: ModelProvider, labels: { codingPlanBadgeLabel?: string }) {
  const items = modelItemsOfProvider({ selectedProvider, provider });
  return items.length === 0
    ? []
    : [
        {
          key: `provider:${provider.id}`,
          ...providerDisplayLabelsOf(provider, labels),
          ...(isPresetDirectProvider(provider.id) ? { directItems: !0 } : {}),
          items,
        },
      ];
}

/** 原 d6e（77586 区） */
export function presetOptionKey(id: string): string {
  return `preset:${id}`;
}
/** 原 f6e（77589 区） */
export function codingPlanOptionKey(id: string): string {
  return `coding-plan:${id}`;
}
/** 原 Vq（77592 区）：team-plan 选项键 */
export function teamPlanOptionKey(product: { productId: string; organizationId?: string | null; projectKey?: string | null }) {
  return teamPlanKeyOf({ productId: product.productId, organizationId: product.organizationId, projectId: product.projectKey });
}

/** 原 p6e（77595 区）：团队计划选项（项目级去重+回退链） */
export function teamPlanOptionsOf(context: {
  codingPlanProvider: ModelProvider | null;
  familyId: string;
  badgeLabel: string;
  familySelectedKeys?: Record<string, string> | null;
  teamPlanProducts: any[];
  showPurchasedTeamPlanFallback: boolean;
  fallbackLabel: string;
}) {
  if (!context.codingPlanProvider || context.familyId !== `bigmodel`) return [];
  const subscribed = context.teamPlanProducts.filter((product) => product.subscribed === !0),
    seen = new Set<string>(),
    projectOptions = subscribed.flatMap((product) =>
      (product.teamProjects && product.teamProjects.length > 0
        ? product.teamProjects
        : [
            {
              organizationId: product.organizationId ?? null,
              organizationName: product.organizationName ?? null,
              projectId: product.projectId ?? null,
              projectName: product.projectName ?? null,
              apiKeyStatus: product.apiKeyStatus,
            },
          ]
      ).flatMap((project: any) => {
        if (project.apiKeyStatus === `unavailable`) return [];
        const projectId = project.projectId?.trim() || void 0,
          organizationId = project.organizationId?.trim() || void 0,
          dedupeKey = `${product.productId}:${organizationId ?? `current`}:${projectId ?? `current`}`;
        if (seen.has(dedupeKey)) return [];
        const label = teamOrganizationLabelOf({
          ...product,
          organizationId,
          projectId,
          organizationName: project.organizationName ?? product.organizationName,
          projectName: project.projectName ?? product.projectName,
        });
        return label
          ? (seen.add(dedupeKey),
            [
              {
                key: teamPlanOptionKey({ productId: product.productId, organizationId, projectKey: projectId }),
                label,
                badgeLabel: context.badgeLabel,
                providerId: context.codingPlanProvider!.id,
                mode: `oauth`,
              },
            ])
          : [];
      }),
    );
  if (projectOptions.length > 0) return projectOptions;
  const savedTeamKey = savedBigmodelTeamPlanKeyOf(context.familySelectedKeys);
  return savedTeamKey && !isTeamPlanKeyAllUnavailable(savedTeamKey, context.teamPlanProducts)
    ? [
        {
          key: savedTeamKey,
          label: context.fallbackLabel,
          badgeLabel: context.badgeLabel,
          providerId: context.codingPlanProvider.id,
          mode: `oauth`,
        },
      ]
    : context.showPurchasedTeamPlanFallback
      ? [
          {
            key: teamPlanOptionKey({ productId: `current` }),
            label: context.fallbackLabel,
            badgeLabel: context.badgeLabel,
            providerId: context.codingPlanProvider.id,
            mode: `oauth`,
          },
        ]
      : [];
}

/** 原 m6e（77646 区）：键全 unavailable 判定 */
export function isTeamPlanKeyAllUnavailable(savedKey: string, products: any[]): boolean {
  if (!parseTeamPlanKey(savedKey)) return !1;
  let hasUnavailable = !1,
    hasAvailable = !1;
  for (const product of products) {
    const productId = product.productId.trim();
    if (!productId) continue;
    const projects =
      product.teamProjects && product.teamProjects.length > 0
        ? product.teamProjects
        : [
            {
              organizationId: product.organizationId ?? null,
              projectId: product.projectId ?? null,
              apiKeyStatus: product.apiKeyStatus,
            },
          ];
    for (const project of projects) {
      if (
        !teamPlanOptionKeysMatch({
          optionKey: teamPlanOptionKey({
            productId,
            organizationId: project.organizationId?.trim() || void 0,
            projectKey: project.projectId?.trim() || void 0,
          }),
          savedKey,
        })
      )
        continue;
      const status = project.apiKeyStatus ?? product.apiKeyStatus;
      ((hasUnavailable ||= status === `unavailable`), (hasAvailable ||= status === `available` || status === `unknown`));
    }
  }
  return hasUnavailable && !hasAvailable;
}

/** 原 h6e（77677 区）：已存 bigmodel 团队键 */
export function savedBigmodelTeamPlanKeyOf(selectedKeys?: Record<string, string> | null): string | null {
  const saved = selectedKeys?.bigmodel?.trim() ?? ``;
  return saved.startsWith(`team-plan:${PROVIDER_IDS.bigmodelCodingPlan}:`) ? saved : null;
}

/** 原 g6e（77681 区）：bigmodel 团队计划选中态 */
export function isBigmodelTeamPlanSelected(context: { providerId: string; familySelectedKeys?: Record<string, string> | null }): boolean {
  const saved = context.familySelectedKeys?.bigmodel?.trim() ?? ``;
  return (
    context.providerId === PROVIDER_IDS.bigmodelCodingPlan && saved.startsWith(`team-plan:${PROVIDER_IDS.bigmodelCodingPlan}:`)
  );
}

/** 原 _6e（77687 区）：族内缺省选项解析（apiKey 直取/已存键/回退链） */
export function resolveFamilyDefaultOption(context: {
  familyId: string;
  options: any[];
  familyModes: unknown;
  familySelectedKeys?: Record<string, string> | null;
}) {
  if (familyConnectionModeOf(context.familyId, context.familyModes) === `apiKey`)
    return context.options.find((option) => option.mode === `apiKey`) ?? context.options[0] ?? null;
  const saved = context.familySelectedKeys?.[context.familyId]?.trim();
  if (saved) {
    const matched =
      context.options.find((option) => option.key === saved) ??
      context.options.find((option) => teamPlanOptionKeysMatch({ optionKey: option.key, savedKey: saved }));
    if (matched) return matched;
  }
  return (
    context.options.find((option) => option.key.includes(`-start-plan`)) ??
    context.options.find((option) => option.mode === `oauth`) ??
    context.options[0] ??
    null
  );
}

/** 原 v6e（77706 区）：族分组（start/coding/team/apiKey 选项装配） */
export function familyGroupOf(context: {
  selectedProvider: string;
  familyId: string;
  providers: ModelProvider[];
  labels: Record<string, string>;
  familyModes: unknown;
  familySelectedKeys?: Record<string, string> | null;
  teamPlanProducts: any[];
  showPurchasedTeamPlanFallback: boolean;
}) {
  const familySpec = familySpecOfProviderId(context.familyId === `zai` ? PROVIDER_IDS.zai : PROVIDER_IDS.bigmodel);
  if (!familySpec) return [];
  const byId = new Map(context.providers.map((provider) => [provider.id, provider])),
    startPlanProvider = byId.get(familySpec.startPlanProviderId),
    codingPlanProvider = byId.get(familySpec.codingPlanProviderId),
    apiKeyProvider = byId.get(familySpec.apiKeyProviderId),
    savedTeamKey = savedBigmodelTeamPlanKeyOf(context.familySelectedKeys);
  if ((savedTeamKey && isTeamPlanKeyAllUnavailable(savedTeamKey, context.teamPlanProducts)) || (familySpec.id === `bigmodel` && savedTeamKey && !codingPlanProvider)) return [];
  const options = [
    startPlanProvider && !savedTeamKey
      ? {
          key: codingPlanOptionKey(startPlanProvider.id),
          label: context.labels.startPlanLabel ?? `Start Plan`,
          providerId: startPlanProvider.id,
          mode: `oauth`,
          badgeLabel: context.labels.startPlanBadgeLabel ?? `Start`,
        }
      : null,
    codingPlanProvider
      ? {
          key: codingPlanOptionKey(codingPlanProvider.id),
          label: context.labels.codingPlanLabel ?? `Individual Plan`,
          providerId: codingPlanProvider.id,
          mode: `oauth`,
          badgeLabel: context.labels.codingPlanBadgeLabel ?? `Individual`,
        }
      : null,
    ...teamPlanOptionsOf({
      codingPlanProvider: codingPlanProvider ?? null,
      familyId: familySpec.id,
      badgeLabel: context.labels.teamPlanBadgeLabel ?? `Team`,
      familySelectedKeys: context.familySelectedKeys,
      teamPlanProducts: context.teamPlanProducts,
      showPurchasedTeamPlanFallback: context.showPurchasedTeamPlanFallback,
      fallbackLabel: context.labels.teamPlanFallbackLabel ?? `Team Plan`,
    }),
    apiKeyProvider
      ? {
          key: presetOptionKey(apiKeyProvider.id),
          label: context.labels.apiKeyLabel ?? `API Key`,
          providerId: apiKeyProvider.id,
          mode: `apiKey`,
          badgeLabel: context.labels.apiKeyBadgeLabel ?? `API`,
        }
      : null,
  ].filter((option) => !!option);
  if (options.length === 0) return [];
  const resolved =
      resolveFamilyDefaultOption({
        familyId: familySpec.id,
        options,
        familyModes: context.familyModes,
        familySelectedKeys: context.familySelectedKeys,
      }) ?? options[0],
    resolvedProvider = byId.get(resolved.providerId);
  if (!resolvedProvider) return [];
  const items = modelItemsOfProvider({ selectedProvider: context.selectedProvider, provider: resolvedProvider });
  if (items.length === 0) return [];
  const badge = familyOptionBadgeOf({ familySpec, labels: context.labels, option: resolved });
  return [{ key: `family:${familySpec.id}`, label: familySpec.label, labelBadge: badge, directItems: !0, items }];
}

/** 原 y6e（77760 区）：族选项徽章 */
export function familyOptionBadgeOf(context: { familySpec: FamilySpec; labels: Record<string, string>; option: any }) {
  return context.option.providerId === context.familySpec.startPlanProviderId
    ? (context.labels.startPlanBadgeLabel ?? `Start`)
    : context.option.key.startsWith(`team-plan:${context.familySpec.codingPlanProviderId}:`)
      ? (context.labels.teamPlanBadgeLabel ?? `Team`)
      : context.option.providerId === context.familySpec.codingPlanProviderId
        ? (context.labels.codingPlanBadgeLabel ?? `Individual`)
        : context.option.providerId === context.familySpec.apiKeyProviderId
          ? (context.labels.apiKeyBadgeLabel ?? `API`)
          : context.option.label;
}

/** 原 b6e（77771 区）：团队键匹配（前缀+productId 宽匹配） */
export function teamPlanOptionKeysMatch({ optionKey, savedKey }: { optionKey: string; savedKey: string }) {
  const prefix = `team-plan:${PROVIDER_IDS.bigmodelCodingPlan}:`;
  if (!optionKey.startsWith(prefix) || !savedKey.startsWith(prefix)) return !1;
  if (teamPlanKeysPrefixEqual(optionKey, savedKey)) return !0;
  const optionParsed = parseTeamPlanKey(optionKey),
    savedParsed = parseTeamPlanKey(savedKey);
  return !!(optionParsed?.productId && savedParsed?.projectId === `0` && optionParsed.productId === savedParsed.productId);
}

/** 原 x6e（77781 区）：OAuth 不活跃族判定 */
export function inactiveOAuthFamilyOf(providers: ModelProvider[]): string | null {
  const zaiInactive = providers.some(
      (provider) =>
        provider.systemDisabledReason === `oauth_provider_inactive` &&
        (provider.id === PROVIDER_IDS.zai || provider.id === PROVIDER_IDS.zaiStartPlan || provider.id === PROVIDER_IDS.zaiCodingPlan),
    ),
    bigmodelInactive = providers.some(
      (provider) =>
        provider.systemDisabledReason === `oauth_provider_inactive` &&
        (provider.id === PROVIDER_IDS.bigmodel || provider.id === PROVIDER_IDS.bigmodelStartPlan || provider.id === PROVIDER_IDS.bigmodelCodingPlan),
    );
  return bigmodelInactive && !zaiInactive ? `zai` : zaiInactive && !bigmodelInactive ? BIGMODEL_REGION_ID : null;
}

/** 原 S6e（77794 区）：agent 模型菜单分组主装配 */
export function modelMenuGroupsForAgent(
  agent: string,
  providers: ModelProvider[],
  labels: Record<string, string> = {},
  displayOrder: { providerIds: string[] } | null | undefined,
  familyModes: unknown,
  familySelectedKeys: Record<string, string> | null | undefined,
  teamPlanProducts: any[] = [],
  showPurchasedTeamPlanFallback = !1,
  providerFamilyDomain?: string | null,
) {
  const inactiveFamily = inactiveOAuthFamilyOf(providers),
    domain = providerFamilyDomain?.trim() || null,
    usable = sortProvidersByFamilyAndOrder(providers, displayOrder).filter((provider) => {
      const spec = familySpecOfProviderId(provider.id);
      return spec && domain && spec.id !== domain
        ? !1
        : isProviderOAuthGateActive({ providerId: provider.id, activeOAuthProvider: inactiveFamily }) &&
            isProviderFamilyModeAllowed({ providerId: provider.id, familyModes }) &&
            (providerUsableForAgent(agent, provider) || (isBigmodelTeamPlanSelected({ providerId: provider.id, familySelectedKeys }) && modelsForAgent(agent, provider).length > 0));
    }),
    byFamily = new Map<string, ModelProvider[]>();
  for (const provider of usable) {
    const spec = familySpecOfProviderId(provider.id);
    if (!spec) continue;
    const group = byFamily.get(spec.id) ?? [];
    (group.push(provider), byFamily.set(spec.id, group));
  }
  const emitted = new Set<string>();
  return usable.flatMap((provider) => {
    const spec = familySpecOfProviderId(provider.id);
    return spec
      ? emitted.has(spec.id)
        ? []
        : (emitted.add(spec.id),
          familyGroupOf({
            selectedProvider: agent,
            familyId: spec.id,
            providers: byFamily.get(spec.id) ?? [],
            labels,
            familyModes,
            familySelectedKeys,
            teamPlanProducts,
            showPurchasedTeamPlanFallback,
          }))
      : providerGroupOf(agent, provider, labels);
  });
}

/** 原 C6e（77828 区）：glm 菜单分组 */
export function glmMenuGroupsOf(
  providers: ModelProvider[],
  labels: Record<string, string> = {},
  displayOrder: { providerIds: string[] } | null | undefined,
  familyModes: unknown,
  familySelectedKeys: Record<string, string> | null | undefined,
  teamPlanProducts: any[] = [],
  showPurchasedTeamPlanFallback = !1,
  providerFamilyDomain?: string | null,
) {
  return modelMenuGroupsForAgent(`glm`, providers, labels, displayOrder, familyModes, familySelectedKeys, teamPlanProducts, showPurchasedTeamPlanFallback, providerFamilyDomain);
}

/** 原 Hq（77831 区）：菜单分组入口（外部 agent 走 glm 路） */
export function modelMenuGroupsOf(
  agent: string,
  providers: ModelProvider[],
  labels: Record<string, string> = {},
  displayOrder: { providerIds: string[] } | null | undefined,
  familyModes: unknown,
  familySelectedKeys: Record<string, string> | null | undefined,
  teamPlanProducts: any[] = [],
  showPurchasedTeamPlanFallback = !1,
  selectedProvider: string | null = null,
  options: { providerFamilyDomain?: string | null } = {},
) {
  const groups: any[] = [];
  if (isExternalAgentName(agent)) return glmMenuGroupsOf(providers, labels, displayOrder, familyModes, familySelectedKeys, teamPlanProducts, showPurchasedTeamPlanFallback, options.providerFamilyDomain);
  const own = modelMenuGroupsForAgent(agent, providers, labels, displayOrder, familyModes, familySelectedKeys, teamPlanProducts, showPurchasedTeamPlanFallback, options.providerFamilyDomain);
  return (groups.push(...own), groups);
}

/** 原 w6e（77839 区）：值 → 模型名（分组查 ?? 目录查） */
export function modelNameOfValue(groups: any[], value: string): string | null {
  for (const group of groups) {
    const item = group.items.find((item: any) => item.value === value);
    if (item) return item.name;
  }
  const catalog = modelEntryOf(value);
  return catalog?.modelName ? catalog.modelName : null;
}

/** 原 T6e（77848 区）：模型选择启用判定 */
export function isModelSelectorEnabled(onOpenModelMenu: unknown, context: { isWebRemoteControl?: boolean } = {}) {
  return context.isWebRemoteControl ? !1 : typeof onOpenModelMenu == `function`;
}

/** 原 E6e（77851 区） */
export function isSyntheticModel(value: string) {
  return value.trim().toLocaleLowerCase() === `<synthetic>`;
}

/** 原 D6e（77854 区）：短模型名（目录 ?? 斜杠后段） */
export function shortModelNameOf(value: string) {
  const catalog = modelEntryOf(value);
  if (catalog?.modelName?.trim()) return catalog.modelName.trim();
  const trimmed = value.trim(),
    slash = trimmed.indexOf(`/`);
  if (slash > 0 && slash < trimmed.length - 1) {
    const tail = trimmed.slice(slash + 1).trim();
    if (tail) return tail;
  }
  return trimmed;
}

/** 原 O6e（77865 区） */
export function groupsContainValue(groups: any[], value: string) {
  return groups.some((group) => group.items.some((item: any) => item.value === value));
}

/** 原 k6e（77868 区）：模型 Select 值/占位解析 */
export function resolveModelSelectState(
  value: string,
  groups: any[],
  hasModelOption: boolean,
  placeholder: string,
  options?: { allowUnavailableCustomModelPlaceholder?: boolean; allowUnavailableModelPlaceholder?: boolean } | null,
) {
  if (isSyntheticModel(value)) return { value: void 0, placeholder: void 0 };
  if (groupsContainValue(groups, value)) return { value, placeholder: void 0 };
  const catalog = modelEntryOf(value);
  return options?.allowUnavailableCustomModelPlaceholder && catalog?.modelName?.trim()
    ? { value: void 0, placeholder: catalog.modelName.trim() }
    : options?.allowUnavailableModelPlaceholder && value.trim()
      ? { value: void 0, placeholder: shortModelNameOf(value) }
      : groups.length === 0 && hasModelOption
        ? { value: void 0, placeholder }
        : { value: void 0, placeholder: void 0 };
}

/** 原 A6e（77882 区） */
export function hasActiveEntitlementAlias(snapshot: unknown) {
  return hasActiveEntitlementCore(snapshot);
}

/** 原 j6e（77885 区）：供应商权益可见性 */
export function isProviderEntitlementVisible({ providerId, entitlementSnapshot, modelProviderFamilySelectedKeys }: { providerId: string; entitlementSnapshot: unknown; modelProviderFamilySelectedKeys?: Record<string, string> | null }) {
  return isOAuthFamilyProvider(providerId)
    ? (entitlementSnapshot as any)?.authenticated === !0 || entitlementSnapshot === null
    : providerId !== PROVIDER_IDS.bigmodelCodingPlan ||
        (modelProviderFamilySelectedKeys?.bigmodel?.trim() ?? ``).startsWith(`team-plan:${PROVIDER_IDS.bigmodelCodingPlan}:`)
      ? !0
      : hasActiveEntitlementAlias(entitlementSnapshot);
}

/** 原 M6e（77894 区）：Start Plan 可见性（权益未激活才显） */
export function isStartPlanVisible({ providerId, codingPlanEntitlementSnapshot }: { providerId: string; codingPlanEntitlementSnapshot: unknown }) {
  return providerId !== PROVIDER_IDS.zaiStartPlan && providerId !== PROVIDER_IDS.bigmodelStartPlan ? !0 : !hasActiveEntitlementAlias(codingPlanEntitlementSnapshot);
}

/** 原 N6e（77897 区）：可用供应商过滤 */
export function filterUsableProviders({
  providers,
  selectedProvider,
  getEntitlementSnapshot,
  modelProviderFamilySelectedKeys,
}: {
  providers: ModelProvider[];
  selectedProvider: string;
  getEntitlementSnapshot: (providerId: string) => unknown;
  modelProviderFamilySelectedKeys?: Record<string, string> | null;
}) {
  return providers.filter((provider) => {
    if (
      !isProviderEntitlementVisible({ providerId: provider.id, entitlementSnapshot: getEntitlementSnapshot(provider.id), modelProviderFamilySelectedKeys })
    )
      return !1;
    const codingPlanSnapshot =
      provider.id === PROVIDER_IDS.zaiStartPlan
        ? getEntitlementSnapshot(PROVIDER_IDS.zaiCodingPlan)
        : provider.id === PROVIDER_IDS.bigmodelStartPlan
          ? getEntitlementSnapshot(PROVIDER_IDS.bigmodelCodingPlan)
          : null;
    return isStartPlanVisible({ providerId: provider.id, codingPlanEntitlementSnapshot: codingPlanSnapshot }) ? providerUsableForAgent(selectedProvider, provider) : !1;
  });
}

/** 原 P6e（77912 区） */
export function trimOrEmpty(value: string | null | undefined) {
  return value?.trim() ?? ``;
}

/** 原 F6e（77915 区） */
export function positiveIntegerOrNull(value: unknown): number | null {
  if (typeof value != `number` || !Number.isFinite(value)) return null;
  const floored = Math.floor(value);
  return floored > 0 ? floored : null;
}

/** 原 I6e（77919 区）：模型元数据归一+排序 */
export function normalizeModelMetadata(provider: ModelProvider) {
  return provider.models
    .filter((model) => typeof model != `string`)
    .map((model) => ({
      contextWindow: positiveIntegerOrNull((model as any).contextWindow),
      maxOutputTokens: positiveIntegerTokensOrNullSafe((model as any).maxOutputTokens),
      modelId: modelIdOfEntry(model as Record<string, unknown>),
      ...((model as any).reasoning ? { reasoning: (model as any).reasoning } : {}),
      ...((model as any).supportsStructuredOutput === void 0
        ? {}
        : { supportsStructuredOutput: (model as any).supportsStructuredOutput }),
      ...((model as any).supportsTools === void 0 ? {} : { supportsTools: (model as any).supportsTools }),
    }))
    .sort((left, right) => left.modelId.localeCompare(right.modelId));
}
function positiveIntegerTokensOrNullSafe(value: unknown) {
  return positiveIntegerOrNull(value);
}

/** 原 L6e（77936 区）：端点路径归一（trim+键序） */
export function normalizeEndpointPathsTrim(paths: Record<string, string | null | undefined> | undefined) {
  if (!paths) return;
  const normalized = Object.fromEntries(
    Object.entries(paths)
      .map(([key, value]) => [key, trimOrEmpty(value)])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  return Object.keys(normalized).length > 0 ? normalized : void 0;
}

/** 原 R6e（77945 区） */
export function normalizeEndpoints(provider: ModelProvider) {
  const paths = normalizeEndpointPathsTrim(provider.endpoints.paths),
    baseURL = trimOrEmpty(provider.endpoints.baseURL);
  return { ...(baseURL ? { baseURL } : {}), ...(paths ? { paths } : {}) };
}

/** 原 z6e（77949 区）：供应商指纹对象 */
export function providerFingerprintOf(provider: ModelProvider | null | undefined) {
  return provider ? { endpoints: normalizeEndpoints(provider), apiKey: provider.apiKey, modelMetadata: normalizeModelMetadata(provider) } : null;
}

/** 原 B6e（77952 区）：指纹差异 */
export function providersDiffer(left: ModelProvider | null, right: ModelProvider | null) {
  const leftFingerprint = providerFingerprintOf(left),
    rightFingerprint = providerFingerprintOf(right);
  return JSON.stringify(leftFingerprint) !== JSON.stringify(rightFingerprint);
}

/** 原 Uq（77956 区）：ghost 模型值 → provider id */
export function ghostModelProviderIdOf(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.startsWith(`custom:`)) return trimmed.slice(7).trim() || null;
  if (!trimmed.startsWith(`ghost:`)) return null;
  const first = trimmed.indexOf(`:`, GHOST_MODEL_PREFIX.length),
    second = first >= 0 ? trimmed.indexOf(`:`, first + 1) : -1;
  if (second < 0) return null;
  const encoded = trimmed.slice(second + 1);
  let decoded = encoded;
  try {
    decoded = decodeURIComponent(encoded);
  } catch {
    decoded = encoded;
  }
  return (
    decoded
      .split(`,`)
      .map((part) => part.trim())
      .find((part) => part.startsWith(`provider=`))
      ?.slice(9)
      .trim() || null
  );
}

/** 原 V6e（77976 区） */
export function isGhostModelValue(value: string) {
  return ghostModelProviderIdOf(value) !== null;
}

/** 原 H6e（77979 区）：配置选项 → 任务供应商键 */
export function supplierKeyOfConfigOptions(configOptions: ConfigOptionEntry[] | undefined, modelValue: string) {
  const current = currentModelValueOf(configOptions);
  return current ? supplierKeyOfModel(configOptions, current) : null;
}

/** 原 U6e（77983 区）：活动任务供应商 */
export function activeTaskProviderOf(state: { activeTaskId?: string | null; optimisticTaskListByTaskId: Record<string, { provider?: string | null }>; taskListCache: Array<{ taskId: string; provider?: string | null }> }) {
  const taskId = state.activeTaskId?.trim();
  return taskId
    ? (state.optimisticTaskListByTaskId[taskId]?.provider ??
      state.taskListCache?.find((task) => task.taskId === taskId)?.provider ??
      null ??
      null)
    : null;
}

/** 原 W6e（77991 区）：任务供应商+供应商键解析 */
export function resolveTaskProviderAndSupplier(context: {
  activeTaskId?: string | null;
  optimisticTaskListByTaskId: Record<string, { provider?: string | null }>;
  taskListCache: Array<{ taskId: string; provider?: string | null }>;
  configOptions?: ConfigOptionEntry[];
  selectedProvider: string;
  selectedSupplierKey: string | null;
}) {
  const taskProvider = activeTaskProviderOf(context);
  if (!taskProvider) return { provider: context.selectedProvider, supplierKey: context.selectedSupplierKey };
  const supplierKey = supplierKeyOfConfigOptions(context.configOptions, taskProvider);
  return supplierKey && isGhostModelValue(supplierKey)
    ? { provider: taskProvider, supplierKey }
    : taskProvider === context.selectedProvider
      ? taskProvider === `codex` && supplierKey
        ? { provider: taskProvider, supplierKey }
        : { provider: taskProvider, supplierKey: context.selectedSupplierKey }
      : supplierKey
        ? { provider: taskProvider, supplierKey }
        : { provider: taskProvider, supplierKey: defaultSupplierKeyOf(taskProvider) };
}

/** 原 G6e（78006 区）：当前模型值 */
export function currentModelValueOf(configOptions: ConfigOptionEntry[] | undefined): string | null {
  const modelOption = configOptions?.find((option) => option.category === `model` && option.type === `select`);
  if (!modelOption) return null;
  const current = modelOption.currentValue,
    trimmed = typeof current == `string` ? current.trim() : String(current ?? ``).trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** 原 K6e（78013 区）：代理前缀集 */
export const ZCODE_PROXY_PREFIXES = new Set([`zcode-anthropic`, `zcode-openai-compatible`]);

/** 原 q6e（78014 区）：代理模型名解析 */
export function proxyModelNameOf(value: string): string | null {
  const slash = value.indexOf(`/`);
  if (slash <= 0 || slash >= value.length - 1) return null;
  const prefix = value.slice(0, slash);
  if (!ZCODE_PROXY_PREFIXES.has(prefix)) return null;
  const model = value.slice(slash + 1).trim();
  return model.length > 0 ? model : null;
}

/** 原 J6e（78021 区）：规范模型名（目录 ?? 代理 ?? 原值） */
export function canonicalModelNameOf(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  const catalog = modelEntryOf(trimmed);
  if (!catalog) return proxyModelNameOf(trimmed) || trimmed;
  if (!catalog.modelName) return null;
  const modelName = catalog.modelName.trim();
  return modelName.length > 0 ? modelName : null;
}

/** 原 Y6e（78030 区）：claude 别名判定 */
export function isClaudeAliasModel(value: string) {
  const kind = claudeAliasKindOf(value);
  return kind === `default` || kind === `opus` || kind === `sonnet` || kind === `haiku` || kind === `reasoning`;
}

/** 原 X6e（78033 区）：claude 别名类 */
export function claudeAliasKindOf(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed
    ? trimmed === `default`
      ? `default`
      : trimmed.includes(`opus`)
        ? `opus`
        : trimmed.includes(`sonnet`)
          ? `sonnet`
          : trimmed.includes(`haiku`)
            ? `haiku`
            : trimmed.includes(`reasoning`)
              ? `reasoning`
              : null
    : null;
}

/** 原 Z6e（78043 区）：模型值重定向（目录 provider 重组） */
export function retargetModelValue(value: string, modelName: string) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  const catalog = modelEntryOf(trimmed);
  return catalog?.providerId ? (catalog.modelName ? trimmed : composeModelValue(catalog.providerId, modelName)) : trimmed;
}

/** 原 Q6e（78048 区）：agent 模型值匹配（opencode 代理宽匹配） */
export function modelValuesMatchForAgent(left: string, right: string, originalValue: string, agent: string) {
  if (left === right) return !0;
  if (agent === `opencode`) {
    const catalog = modelEntryOf(originalValue.trim());
    if (catalog?.providerId && catalog.modelName)
      try {
        if (right === proxyModelValueOf(catalog.providerId, catalog.modelName)) return !0;
      } catch {}
  }
  return !1;
}

/** 原 $6e（78058 区）：配置选项模型值调和 */
export function reconcileConfigOptionsModel(configOptions: ConfigOptionEntry[] | undefined, nextOptions: ConfigOptionEntry[], agent: string) {
  const catalog = resolveModelCatalogEntry(configOptions as unknown as string);
  if (!catalog) return [...nextOptions];
  const currentValue = String(configOptions?.find((option) => option.category === `model` && option.type === `select`)?.currentValue ?? ``);
  let changed = !1;
  const reconciled = nextOptions.map((option) => {
    if (option.category !== `model` || option.type !== `select`) return option;
    if (typeof option.currentValue == `string`) {
      const trimmed = option.currentValue.trim();
      if (trimmed.length > 0) {
        const currentCanonical = canonicalModelNameOf(currentValue),
          optionCanonical = canonicalModelNameOf(trimmed),
          currentCatalog = modelEntryOf(currentValue),
          optionCatalog = modelEntryOf(trimmed),
          crossProvider = !!(currentCatalog?.providerId && optionCatalog?.providerId) && currentCatalog?.providerId !== optionCatalog?.providerId;
        let next: string | null = null;
        return (
          !next && agent === `claude` && modelEntryOf(currentValue)?.providerId && isClaudeAliasModel(option as unknown as string) && (next = currentValue.trim()),
          !next && !crossProvider && currentCanonical && optionCanonical && modelValuesMatchForAgent(currentCanonical, optionCanonical, currentValue, agent)
            ? (next = retargetModelValue(currentValue, optionCanonical))
            : currentCatalog?.providerId && !currentCatalog.modelName && optionCanonical && (next = composeModelValue(currentCatalog.providerId, optionCanonical)),
          next && next !== option.currentValue ? ((changed = !0), { ...option, currentValue: next }) : option
        );
      }
    }
    return ((changed = !0), { ...option, currentValue });
  });
  return changed ? reconciled : [...nextOptions];
}

/* ----------------------------------------------------------------------------
 * §5 支付/产品域（79693–80954；排除 vendored qrcode 78456–79690）
 * -------------------------------------------------------------------------- */
/** 原 L8e（79693）：支付宝 logo 图资（打包占位） */
const ALIPAY_LOGO_SRC = `[image content will be provided separately]`;
/** 原 $q（79694）：描述/权益条目归一（string | {text,tooltip}） */
export function normalizeDescriptionItems(entries: unknown): Array<{ text: string; tooltip?: string }> {
  return Array.isArray(entries)
    ? entries.flatMap((entry) => {
        if (typeof entry != `string` && (!entry || typeof entry != `object`)) return [];
        let text = typeof entry == `string` ? entry.trim() : typeof (entry as any).text == `string` ? (entry as any).text.trim() : ``;
        if (!text) return [];
        let tooltip = typeof entry == `string` || typeof (entry as any).tooltip != `string` ? `` : (entry as any).tooltip.trim();
        return [{ text, ...(tooltip ? { tooltip } : {}) }];
      })
    : [];
}
/** 原 R8e（79705） */
const CURRENCY_LABELS: Record<string, string> = { CNY: `人民币`, USD: `美元` };
/** 原 eJ（79706）：周期 i18n 键表 */
const PERIOD_LABEL_KEYS: Record<string, string> = {
  monthly: `settings.modelProvider.codingPlan.period.monthly`,
  quarterly: `settings.modelProvider.codingPlan.period.quarterly`,
  yearly: `settings.modelProvider.codingPlan.period.yearly`,
};
/** 原 tJ（79711） */
export function productTitleOf(product: any): string {
  return product.productName?.trim() || product.productBigTitle?.trim() || product.productId;
}
/** 原 z8e（79714）：产品要点行（描述/简介拆行，回退权益列表） */
export function productBulletLinesOf(product: any): string[] {
  let lines = [product.productDescription?.trim(), product.productIntroduction?.trim()]
    .filter((item) => !!item)
    .flatMap((item) =>
      item
        .split(/\r?\n/)
        .map((line: any) => line.trim())
        .filter(Boolean),
    )
    .slice(0, 4);
  return lines.length > 0
    ? lines
    : (product.productEquityList ?? [])
        .map((equity: any) =>
          [equity.productEquityTitle?.trim(), equity.productEquityDetails?.trim()].filter(Boolean).join(`：`),
        )
        .filter(Boolean)
        .slice(0, 4);
}
/** 原 nJ（79733） */
export function primaryAmountOf(product: any): number | null {
  return product.payAmount ?? product.discountAmount ?? product.renewAmount ?? null;
}
/** 原 rJ（79736） */
export function normalizeCurrency(currency?: string): `CNY` | `USD` {
  return currency?.trim().toUpperCase() === `USD` ? `USD` : `CNY`;
}
/** 原 iJ（79739）：金额本地化（zh 前缀符号+中文名） */
export function formatMoney(amount: number, currency: string | undefined, locale: string): string {
  let code = normalizeCurrency(currency),
    isZh = locale.toLowerCase().startsWith(`zh`),
    formatted = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount),
    out = `${isZh ? (code === `USD` ? `$` : `¥`) : code === `USD` ? `US$` : `CN¥`}${formatted}`;
  return isZh ? `${out} ${CURRENCY_LABELS[code]}` : out;
}
/** 原 aJ（79746）：周期推断（priceUnit → 名称正则 → 月均倍率） */
export function periodOfProduct(product: any): string {
  let unit = product.priceUnit;
  if (unit) return unit === `year` ? `yearly` : unit === `quarter` ? `quarterly` : `monthly`;
  let pack = product.relateResourcePack ?? ``;
  if (/包年|-\s*年|year/i.test(pack)) return `yearly`;
  if (/包季|-\s*季|quarter/i.test(pack)) return `quarterly`;
  if (/包月|-\s*月|month/i.test(pack)) return `monthly`;
  let monthly = product.monthlyOriginalAmount ?? product.monthlyPayAmount,
    total = product.originalAmount ?? product.payAmount;
  if (typeof monthly == `number` && typeof total == `number`) {
    let ratio = Math.round(total / monthly);
    if (ratio >= 10) return `yearly`;
    if (ratio >= 2) return `quarterly`;
  }
  return `monthly`;
}
/** 原 oJ（79762 / jsx 区）：金额汇总卡（原价/折扣展开/应付） */
export function AmountSummaryCard({
  amountSummary,
  purchaseLabel,
  purchaseValue,
  className,
  initialAdjustmentsExpanded = !1,
}: {
  amountSummary: any;
  purchaseLabel?: string;
  purchaseValue?: string | null;
  className?: string;
  initialAdjustmentsExpanded?: boolean;
}) {
  let [expanded, setExpanded] = React.useState(initialAdjustmentsExpanded),
    originalRow = amountSummary.rows.find((row: any) => row.kind === `original`),
    payRow = amountSummary.rows.find((row: any) => row.kind === `pay`),
    adjustmentRows = amountSummary.rows.filter((row: any) => row.kind === `discount` || row.kind === `credit`),
    adjustmentTotal = adjustmentRows.reduce((sum: number, row: any) => sum + (row.amount ?? 0), 0),
    hasAdjustment = adjustmentRows.length > 0;
  return (
    <div className={cn(`rounded-xl border border-border bg-surface p-3`, className)}>
      {purchaseValue ? (
        <>
          <div className={`flex min-w-0 items-center justify-between gap-3 text-ui-base`}>
            <span className={`text-foreground-subtle`}>{purchaseLabel}</span>
            <span className={`min-w-0 truncate text-right font-semibold text-foreground`}>{purchaseValue}</span>
          </div>
          <div className={`mb-2 mt-2 h-px bg-border`} />
        </>
      ) : null}
      {originalRow ? <AmountRow label={originalRow.label} value={originalRow.value} /> : null}
      {hasAdjustment ? (
        <>
          <button
            type={`button`}
            className={`mt-1.5 flex w-full items-center justify-between gap-3 rounded-lg py-0.5 text-left text-ui-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
          >
            <span className={`flex min-w-0 items-center gap-1 text-foreground-subtle`}>
              <span className={`min-w-0 truncate`}>{adjustmentSummaryLabelOf(amountSummary)}</span>
              <ChevronRightIcon className={cn(`size-3.5 shrink-0 transition-transform`, expanded ? `rotate-90` : null)} />
            </span>
            {expanded ? null : <span className={`shrink-0 font-medium text-foreground`}>{formatNegatedTotal(adjustmentTotal, adjustmentRows[0]?.value)}</span>}
          </button>
          {expanded ? (
            <div className={`mt-1.5 space-y-1.5`}>
              {adjustmentRows.map((row: any, index: number) => (
                <AmountRow key={`${row.kind}-${row.label}-${index}`} label={row.label} badge={row.badge} value={row.value} nested />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      {payRow ? (
        <>
          <div className={`mb-2 mt-3 h-px bg-border`} />
          <AmountRow label={payRow.label} value={payRow.value} strong />
        </>
      ) : null}
    </div>
  );
}
/** 原 sJ（79851）：金额行（label/badge/value，strong/nested 变体） */
export function AmountRow({ label, badge, value, strong, nested }: { label: string; badge?: string; value: string; strong?: boolean; nested?: boolean }) {
  return (
    <div className={`grid grid-cols-[minmax(8rem,1fr)_minmax(0,auto)] items-center gap-3 text-ui-base`}>
      <span className={cn(`min-w-0 text-foreground-subtle`, nested ? `pl-5` : null, strong ? `font-medium text-foreground-subtle` : null)}>{label}</span>
      <span className={cn(`flex min-w-0 flex-wrap items-center justify-end gap-2 text-right font-medium text-foreground`, strong ? `text-lg font-semibold` : null)}>
        {badge ? <span className={`button-gradient min-w-0 rounded-full px-2 py-0.5 text-ui-xs font-medium text-white dark:bg-[#484A58]`}>{badge}</span> : null}
        <span className={`shrink-0`}>{value}</span>
      </span>
    </div>
  );
}
/** 原 B8e（79881） */
function adjustmentSummaryLabelOf(summary: any): string {
  return summary.adjustmentSummaryLabel;
}
/** 原 V8e（79884）：折叠态合计（按首行小数位格式化） */
function formatNegatedTotal(total: number, firstValue?: string): string {
  return firstValue
    ? `-${firstValue.replace(/^-/, ``).replace(/[\d,.]+(?:\.\d+)?/, (match) => {
        let decimals = match.includes(`.`) ? match.length - match.indexOf(`.`) - 1 : 0;
        return total.toLocaleString(void 0, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      })}`
    : `-`;
}
/** 原 cJ（79892）：金额汇总构建（原价/活动折扣/当前计划抵扣/应付） */
export function buildAmountSummary({
  preview,
  product,
  currency,
  locale,
  labels,
  deriveCreditFromPayAmount,
}: {
  preview: any;
  product: any;
  currency: string;
  locale: string;
  labels: { originalAmount: string; discountActivity: string; currentPlanCredit: string; payAmount: string; deductions: string };
  deriveCreditFromPayAmount: boolean;
}) {
  let originalAmount = preview.originalAmount ?? product.originalAmount,
    payAmount = resolvePayAmount(preview, product),
    campaignDiscountRows = campaignDiscountRowsOf(preview.campaignDiscountDetails, currency, locale, labels.discountActivity),
    currentPlanCreditRow = currentPlanCreditRowOf({
      preview,
      originalAmount,
      payAmount,
      campaignDiscountAmount: sumCampaignDiscounts(campaignDiscountRows),
      currency,
      locale,
      label: labels.currentPlanCredit,
      deriveCreditFromPayAmount,
    }),
    rows = [
      {
        label: labels.originalAmount,
        amount: originalAmount,
        value: typeof originalAmount == `number` ? formatMoney(originalAmount, currency, locale) : `-`,
        kind: `original`,
      },
      ...campaignDiscountRows,
      ...(currentPlanCreditRow ? [currentPlanCreditRow] : []),
      {
        label: labels.payAmount,
        amount: payAmount ?? void 0,
        value: typeof payAmount == `number` ? formatMoney(payAmount, currency, locale) : `-`,
        kind: `pay`,
      },
    ];
  return {
    originalAmount,
    payAmount,
    campaignDiscountRows,
    currentPlanCreditRow,
    adjustmentSummaryLabel: labels.deductions,
    rows,
    hasAdjustment: campaignDiscountRows.length > 0 || !!currentPlanCreditRow,
  };
}
/** 原 H8e（79939） */
export function resolvePayAmount(preview: any, product: any): number | null {
  return preview.thirdPartyAmount ?? primaryAmountOf(preview) ?? primaryAmountOf(product);
}
/** 原 U8e（79942） */
export function pickRenewAmount(left: any, right: any): number | null {
  return firstNonNegative(left.renewAmount, right.renewAmount);
}
/** 原 W8e（79945） */
export function sumCampaignDiscounts(rows: Array<{ amount?: number | null }>): number {
  return rows.reduce((sum, row) => sum + (row.amount ?? 0), 0);
}
/** 原 G8e（79948）：活动折扣行 */
export function campaignDiscountRowsOf(details: any[] | undefined, currency: string, locale: string, label: string) {
  return (details ?? []).flatMap((detail) => {
    let amount = detail.campaignDiscountAmount ?? detail.rewardAmount ?? null,
      name = detail.campaignName?.trim() || detail.rewardDetail?.trim();
    return typeof amount != `number` || amount <= 0 || !name
      ? []
      : [{ label, badge: name, amount, value: `-${formatMoney(amount, currency, locale)}`, kind: `discount` }];
  });
}
/** 原 K8e（79957）：当前计划抵扣行（refund/residual 或差额推导） */
export function currentPlanCreditRowOf({
  preview,
  originalAmount,
  payAmount,
  campaignDiscountAmount,
  currency,
  locale,
  label,
  deriveCreditFromPayAmount,
}: {
  preview: any;
  originalAmount: number | undefined;
  payAmount: number | null;
  campaignDiscountAmount: number;
  currency: string;
  locale: string;
  label: string;
  deriveCreditFromPayAmount: boolean;
}) {
  let source = preview,
    credit = firstPositive(source.refundAmount, source.residualAmount) ?? (deriveCreditFromPayAmount ? residualCreditOf(originalAmount, campaignDiscountAmount, payAmount) : null);
  return typeof credit != `number` || credit <= 0
    ? null
    : { label, amount: credit, value: `-${formatMoney(credit, currency, locale)}`, kind: `credit` };
}
/** 原 q8e（79973） */
export function firstPositive(...values: unknown[]): number | null {
  for (let value of values) if (typeof value == `number` && value > 0) return value;
  return null;
}
/** 原 J8e（79977） */
export function firstNonNegative(...values: unknown[]): number | null {
  for (let value of values) if (typeof value == `number` && value >= 0) return value;
  return null;
}
/** 原 Y8e（79981）：原价-活动折扣-应付 差额抵扣 */
export function residualCreditOf(originalAmount: unknown, campaignDiscount: number, payAmount: unknown): number | null {
  if (typeof originalAmount != `number` || typeof payAmount != `number`) return null;
  let delta = originalAmount - campaignDiscount - payAmount;
  return delta <= 0.005 ? null : Math.round(delta * 100) / 100;
}
/** 原 X8e/Z8e/Q8e（79986–79988）：计划总览/服务协议/订阅协议 URL */
const PLAN_OVERVIEW_URL = envConsoleUrlOf({ ZCODE_ENV: ZCODE_ENV_VALUE });
const SERVICE_AGREEMENT_URL = `https://docs.bigmodel.cn/cn/terms/service-agreement`;
const SUBSCRIPTION_AGREEMENT_URL = `https://docs.bigmodel.cn/cn/terms/subscription-agreement`;

/** 原 $8e（79989）：QR 宿主（生成 dataURL 后内嵌 e5e） */
export function CodingPlanPaymentQrHost({
  state,
  polling,
  expired,
  policyVisible = !0,
  onRefresh,
}: {
  state: any;
  polling: boolean;
  expired: boolean;
  policyVisible?: boolean;
  onRefresh: () => void;
}) {
  let [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null),
    [qrError, setQrError] = React.useState(!1),
    paymentContent = state.paymentContent;
  return (
    React.useEffect(() => {
      if (!paymentContent) {
        (setQrDataUrl(null), setQrError(!1));
        return;
      }
      let cancelled = !1;
      return (
        setQrDataUrl(null),
        setQrError(!1),
        qrcode
          .toDataURL(paymentContent, { margin: 1, width: 512 })
          .then((url) => {
            cancelled || setQrDataUrl(url);
          })
          .catch((error) => {
            cancelled || (logger.warn(`[CodingPlanPaymentQrDialog] 生成支付二维码失败`, { error }), setQrError(!0));
          }),
        () => {
          cancelled = !0;
        }
      );
    }, [paymentContent]),
    (
      <CodingPlanPaymentQrDialog
        state={state}
        polling={polling}
        expired={expired}
        embedded
        policyVisible={policyVisible}
        qrDataUrl={qrDataUrl}
        qrError={qrError}
        onRefresh={onRefresh}
      />
    )
  );
}
/** 原 e5e（80027 / jsx 70564）：支付 QR 对话框主体 */
export function CodingPlanPaymentQrDialog({
  state,
  polling,
  expired,
  embedded,
  policyVisible,
  qrDataUrl,
  qrError,
  onRefresh,
}: {
  state: any;
  polling: boolean;
  expired: boolean;
  embedded: boolean;
  policyVisible: boolean;
  qrDataUrl: string | null;
  qrError: boolean;
  onRefresh: () => void;
}) {
  let { intl, locale } = useZCodeIntl(),
    currency = currencyOfProduct(state.product),
    payAmount = resolvePayAmount(state.preview, state.product),
    payText = typeof payAmount == `number` ? formatMoney(payAmount, currency, locale) : `-`,
    isEnterprise = state.kind === `enterprise`,
    amountSummary = buildAmountSummary({
      preview: state.preview,
      product: state.product,
      currency,
      locale,
      labels: {
        originalAmount: intl.formatMessage({
          id: `settings.modelProvider.codingPlan.paymentDialog.originalAmount`,
        }),
        discountActivity: intl.formatMessage({
          id: `settings.modelProvider.codingPlan.paymentDialog.discountActivity`,
        }),
        currentPlanCredit: intl.formatMessage({
          id: `settings.modelProvider.codingPlan.paymentDialog.currentPlanCredit`,
        }),
        payAmount: intl.formatMessage({
          id: `settings.modelProvider.codingPlan.paymentDialog.payAmount`,
        }),
        deductions: intl.formatMessage({
          id: `settings.modelProvider.codingPlan.paymentDialog.deductions`,
        }),
      },
      deriveCreditFromPayAmount: !isEnterprise,
    });
  return (
    <>
      <div className={embedded ? `flex h-full min-h-0 flex-col gap-4 px-0 py-0 max-sm:h-auto` : `space-y-4 px-4 py-4`}>
        <div className={`flex min-h-0 flex-1 items-center justify-center max-sm:min-h-0`}>
          <div className={`flex w-full max-w-[48rem] items-center gap-6 max-sm:flex-col`}>
            <div className={`relative order-1 flex w-[min(56%,24rem)] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background p-2 max-sm:order-2 max-sm:w-full`}>
              <div className={`relative flex aspect-square w-full items-center justify-center`}>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.qrAlt` })}
                    className={`size-full max-h-full max-w-full object-contain`}
                  />
                ) : qrError ? (
                  <div className={`text-center text-ui-base text-foreground-subtle`}>
                    {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.qrError` })}
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 text-ui-base text-foreground-subtle`}>
                    <Spinner className={`size-4 animate-spin`} />
                    {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.qrLoading` })}
                  </div>
                )}
                {expired ? (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 p-4 text-center backdrop-blur-sm`}>
                    <div className={`text-ui-base font-medium text-foreground`}>
                      {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.qrExpired` })}
                    </div>
                    <Button type={`button`} variant={`outline`} size={`sm`} className={`gap-2`} onClick={onRefresh}>
                      <RefreshIcon className={`size-4`} />
                      {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.refreshQr` })}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className={`order-2 flex min-w-0 flex-1 flex-col justify-center space-y-3 max-sm:order-1`}>
              <h4 className={`text-ui-base font-medium leading-5 text-foreground`}>{paymentDialogTitleOf(state, intl)}</h4>
              <div className={`flex flex-wrap items-center gap-2 text-ui-base leading-5 text-foreground-subtle`}>
                <img src={ALIPAY_LOGO_SRC} alt={``} aria-hidden={`true`} className={`size-6 shrink-0`} />
                <span>{intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.alipayScan` })}</span>
                <span className={`font-medium text-foreground`}>{payText}</span>
              </div>
              <AmountSummaryCard amountSummary={amountSummary} className={`bg-card`} initialAdjustmentsExpanded />
              {polling ? (
                <p className={`flex items-center gap-1.5 text-ui-base text-foreground-subtle`}>
                  <Spinner className={`size-3 animate-spin`} />
                  {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.polling` })}
                </p>
              ) : null}
              {policyVisible ? (
                <>
                  <ul className={`list-disc space-y-1 pl-5 text-ui-base leading-6 text-foreground-subtle marker:text-foreground-subtlest`}>
                    {isEnterprise ? (
                      <>
                        <li>{intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.paymentDialog.tipTotal` })}</li>
                        <li>{intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.paymentDialog.tipDeduction` })}</li>
                        <li>{intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.paymentDialog.tipComplete` })}</li>
                      </>
                    ) : (
                      <>
                        <li>
                          {intl.formatMessage(
                            { id: `settings.modelProvider.codingPlan.paymentDialog.tipAutoRenew` },
                            { price: payText },
                          )}
                        </li>
                        <li>{intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.tipDeduction` })}</li>
                        <li>{intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.tipPeriodic` })}</li>
                        <li>
                          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.tipCancelPrefix` })}
                          <PolicyLink href={PLAN_OVERVIEW_URL}>
                            {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.planOverviewLink` })}
                          </PolicyLink>
                          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.tipCancelSuffix` })}
                        </li>
                      </>
                    )}
                  </ul>
                  {isEnterprise ? null : (
                    <div className={`flex gap-2 rounded-lg border border-warning/30 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-warning)_18%,var(--color-background)_82%)_0%,var(--color-background)_72%)] p-3`}>
                      <div className={`flex size-6 items-center justify-center`}>
                        <ModeIconFullAccess className={`size-4 shrink-0 text-warning`} />
                      </div>
                      <div className={`min-w-0 space-y-1`}>
                        <p className={`text-ui-base font-medium leading-5 text-foreground`}>
                          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.ruleTitle` })}
                        </p>
                        <p className={`text-ui-base leading-6 text-foreground-subtle`}>
                          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.ruleDescription` })}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {policyVisible ? (
        <p className={embedded ? `pt-0 text-center text-ui-base leading-5 text-foreground-subtle` : `p-4 pt-0 pb-6 text-center text-ui-base leading-5 text-foreground-subtle`}>
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.agreementPrefix` })}
          <PolicyLink href={SERVICE_AGREEMENT_URL}>
            {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.serviceAgreementLink` })}
          </PolicyLink>
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.agreementBetween` })}
          <PolicyLink href={SUBSCRIPTION_AGREEMENT_URL}>
            {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.subscriptionAgreementLink` })}
          </PolicyLink>
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.agreementSuffix` })}
        </p>
      ) : null}
    </>
  );
}
/** 原 t5e（80311）：对话框标题（企业/个人 i18n） */
export function paymentDialogTitleOf(state: any, intl: IntlShape): string {
  let isEnterprise = state.kind === `enterprise`;
  return intl.formatMessage(
    {
      id: isEnterprise
        ? `settings.modelProvider.codingPlan.enterprise.paymentDialog.title`
        : `settings.modelProvider.codingPlan.paymentDialog.title`,
    },
    { product: productTitleOf(state.product) },
  );
}
/** 原 lJ（80322）：政策外链 */
export function PolicyLink({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <a href={href} target={`_blank`} rel={`noreferrer`} className={`text-primary underline-offset-3 hover:underline`}>
      {children}
    </a>
  );
}
/** 原 n5e（80331） */
export function currencyOfProduct(product: any): `CNY` | `USD` {
  let currency = product.priceCurrency;
  return normalizeCurrency(currency);
}
/** 原 r5e（80335）：badge 变体表（cva） */
const BADGE_VARIANTS = classVariance(
  `group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-ui-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-2.5!`,
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground [a]:hover:bg-primary/80`,
        secondary: `bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80`,
        destructive: `bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20`,
        outline: `border-border bg-input/20 text-foreground dark:bg-input/30 [a]:hover:bg-muted [a]:hover:text-muted-foreground`,
        ghost: `hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50`,
        link: `text-primary underline-offset-4 hover:underline`,
      },
    },
    defaultVariants: { variant: `default` },
  },
);
/** 原 uJ（80351）：Badge */
export function Badge({ className, variant = `default`, asChild = !1, ...rest }: Record<string, any>) {
  return <Slot {...(asChild ? {} : {})} data-slot={`badge`} data-variant={variant} className={cn(BADGE_VARIANTS({ variant }), className)} {...rest} />;
}
/** 原 i5e…_J（80359–80368）：产品域常量与模块态 */
const OAUTH_REQUIRED_ERROR = `coding_plan_oauth_required`;
const ZAI_START_FREE_PREFIX = `zai-start-free`;
const ZAI_START_FREE_PRODUCT_IDS: Record<string, string> = {
  month: `${ZAI_START_FREE_PREFIX}-monthly`,
  quarter: `${ZAI_START_FREE_PREFIX}-quarterly`,
  year: `${ZAI_START_FREE_PREFIX}-yearly`,
};
const PRODUCT_PREVIEW_TTL_MS = 3e4;
const STATIC_PRODUCTS_TTL_MS = 1440 * 60 * 1e3;
const previewInFlight = new Map<string, Promise<any>>(); // pJ
const previewCache = new Map<string, { snapshot: any; expiresAt: number }>(); // mJ
const previewEpochs = new Map<string, number>(); // hJ
let staticProductsCache: { config: any; expiresAt: number } | null = null; // gJ
let staticProductsInFlight: Promise<any> | null = null; // _J
/** 原 s5e（80369 / jsx 区）：useCodingPlanProducts */
export function useCodingPlanProducts(providerId: string, options?: { remotePreviewEnabled?: boolean }) {
  let service = useServices()?.codingPlanSubscriptionService,
    isSupported = providerId === PROVIDER_IDS.bigmodelCodingPlan || isOAuthFamilyProvider(providerId),
    isRemote = isSupported && options?.remotePreviewEnabled !== !1,
    fallback = React.useMemo(() => emptySnapshotOf(providerId), [providerId]),
    [state, setState] = React.useState<{ snapshot: any; loading: boolean; error: string | null }>(() => ({
      snapshot: null,
      loading: isSupported,
      error: null,
    })),
    refresh = React.useCallback(
      async (opts?: { force?: boolean }) => {
        if (!isSupported) {
          setState({ snapshot: fallback, loading: !1, error: `unsupported` });
          return;
        }
        if (!isRemote) {
          setState({ snapshot: service ? await loadPreviewSnapshot(providerId, service) : fallback, loading: !1, error: null });
          return;
        }
        if (!service) {
          setState({ snapshot: fallback, loading: !1, error: `service_unavailable` });
          return;
        }
        setState((prev) => ({ snapshot: opts?.force === !0 ? prev.snapshot : null, loading: !0, error: null }));
        let interim = fallback;
        try {
          let statics = await remoteStaticProductsOf(providerId, service);
          ((interim = snapshotOfProducts(providerId, statics)),
            setState({ snapshot: await fetchPreviewSnapshot(providerId, service, opts?.force === !0, statics), loading: !1, error: null }));
        } catch (error) {
          let normalized = normalizeProductError(error);
          (logger.warn(`[useCodingPlanProducts] 读取 Coding Plan 套餐失败`, { providerId, error: normalized }),
            setState((prev) => ({ snapshot: snapshotFallback(prev.snapshot, interim), loading: !1, error: normalized })));
        }
      },
      [isRemote, providerId, service, fallback, isSupported],
    );
  return (
    (React.useEffect(() => {
      refresh();
    }, [refresh]),
    { ...state, refresh })
  );
}
/** 原 c5e（80410）：预览快照取数（缓存/在途/epoch 守卫） */
export async function fetchPreviewSnapshot(providerId: string, service: any, force: boolean, statics?: any[]) {
  let stamp = Date.now(),
    epoch = force ? bumpPreviewEpoch(providerId) : (previewEpochs.get(providerId) ?? 0),
    cached = previewCache.get(providerId);
  if (!force && cached && cached.expiresAt > stamp) return cached.snapshot;
  let inflight = previewInFlight.get(providerId);
  if (!force && inflight) return inflight;
  let promise = batchPreviewWithCatalog(providerId, service, statics ?? []);
  previewInFlight.set(providerId, promise);
  try {
    let snapshot = await promise;
    return ((previewEpochs.get(providerId) ?? 0) === epoch && previewCache.set(providerId, { snapshot, expiresAt: stamp + PRODUCT_PREVIEW_TTL_MS }), snapshot);
  } finally {
    previewInFlight.get(providerId) === promise && previewInFlight.delete(providerId);
  }
}
/** 原 l5e（80426） */
export async function loadPreviewSnapshot(providerId: string, service: any) {
  return snapshotOfProducts(providerId, await remoteStaticProductsOf(providerId, service));
}
/** 原 u5e（80429）= c5e 别名 */
const previewSnapshotAsync = fetchPreviewSnapshot;
void previewSnapshotAsync;
/** 原 d5e（80430） */
export function snapshotFallback(current: any, interim: any) {
  return current ?? interim;
}
/** 原 f5e（80433）：epoch 自增并清缓存 */
export function bumpPreviewEpoch(providerId: string): number {
  let next = (previewEpochs.get(providerId) ?? 0) + 1;
  return (previewEpochs.set(providerId, next), previewInFlight.delete(providerId), previewCache.delete(providerId), next);
}
/** 原 p5e（80437）：batchPreview + 静态目录合并 */
export async function batchPreviewWithCatalog(providerId: string, service: any, statics: any[]) {
  let result = await service.batchPreview({ providerId }),
    byId = new Map(result.productList.map((product: any) => [product.productId, product])),
    list =
      statics.length > 0
        ? hydrateStaticProducts(statics).map((product) => mergePreviewIntoProduct(product, byId.get(product.productId)))
        : result.productList.map((product: any) => ({ ...product, hasPreview: !0 }));
  return { ...result, productList: filterStartFreeForProvider(providerId, list) };
}
/** 原 m5e（80446） */
export function emptySnapshotOf(providerId: string) {
  return snapshotOfProducts(providerId, []);
}
/** 原 h5e（80449）：Z.ai Start 免费计划三档静态产品 */
export function freeStartPlanProductsOf(preview: any) {
  let isZh = typeof navigator < `u` && navigator.language.toLowerCase().startsWith(`zh`),
    name = preview.name.trim() || `Z.ai Start`,
    equityList = preview.entitlements.map((entitlement: any) => ({
      productEquityTitle: entitlement.showName,
      productEquityDetails: entitlementDetailOf(entitlement, isZh),
    }));
  return [
    {
      productId: ZAI_START_FREE_PRODUCT_IDS.month,
      productName: name,
      productSmallTitle: `Free Coding Plan`,
      description: `Free Coding Plan entry for connected Z.ai users.`,
      productEquityList: equityList,
      priceUnit: `month`,
      displayOrder: 0,
      priceCurrency: `USD`,
      originalAmount: 0,
      payAmount: 0,
      monthlyPayAmount: 0,
    },
    {
      productId: ZAI_START_FREE_PRODUCT_IDS.quarter,
      productName: name,
      productSmallTitle: `Free Coding Plan`,
      description: `Free Coding Plan entry for signed-in Z.ai users.`,
      productEquityList: equityList,
      priceUnit: `quarter`,
      displayOrder: 0,
      priceCurrency: `USD`,
      originalAmount: 0,
      payAmount: 0,
      monthlyPayAmount: 0,
    },
    {
      productId: ZAI_START_FREE_PRODUCT_IDS.year,
      productName: name,
      productSmallTitle: `Free Coding Plan`,
      description: `Free Coding Plan entry for signed-in Z.ai users.`,
      productEquityList: equityList,
      priceUnit: `year`,
      displayOrder: 0,
      priceCurrency: `USD`,
      originalAmount: 0,
      payAmount: 0,
      monthlyPayAmount: 0,
    },
  ];
}
/** 原 g5e（80498） */
export function entitlementDetailOf(entitlement: any, isZh: boolean): string {
  return [
    new Intl.NumberFormat(isZh ? `zh-CN` : `en-US`).format(entitlement.grantUnits),
    entitlement.unitType.trim(),
    entitlement.period.trim(),
  ]
    .filter(Boolean)
    .join(` `);
}
/** 原 vJ（80507） */
export function isZaiStartFreeProductId(productId?: string): boolean {
  return productId ? productId === `zai-start-free` || productId.startsWith(`zai-start-free-`) : !1;
}
/** 原 yJ（80510） */
export function snapshotOfProducts(providerId: string, products: any[]) {
  return { productList: filterStartFreeForProvider(providerId, hydrateStaticProducts(products)), isSubscribed: !1, isAuthenticated: null };
}
/** 原 _5e（80513）：静态产品水合（description 拆行/equity 归一） */
export function hydrateStaticProducts(products: any[]) {
  return products.map((product) => {
    let items = normalizeDescriptionItems(typeof product.description == `string` ? product.description.split(/\r?\n/) : product.description);
    return {
      ...product,
      productDescription:
        items.length > 0
          ? items.map((item) => item.text).join(`
`)
          : typeof product.description == `string`
            ? product.description
            : void 0,
      descriptionItems: items,
      equity: normalizeDescriptionItems(product.equity ?? []),
      hasPreview: !1,
    };
  });
}
/** 原 v5e（80531）：远端静态套餐（zai 族特判 + Start 预览合并） */
export async function remoteStaticProductsOf(providerId: string, service: any): Promise<any[]> {
  try {
    let byProvider = (await staticProductsConfigOf(service))[providerId] ?? [];
    if (providerId === PROVIDER_IDS.zaiCodingPlan) return filterStartFreeForProvider(providerId, byProvider);
    if (providerId !== PROVIDER_IDS.zaiStartPlan) return byProvider;
    let startPreview = typeof service.getStartPlanPreview == `function` ? await service.getStartPlanPreview() : null;
    if (!startPreview) return byProvider;
    let seen = new Set<string>();
    return [...freeStartPlanProductsOf(startPreview), ...byProvider].filter((product: any) =>
      seen.has(product.productId) ? !1 : (seen.add(product.productId), !0),
    );
  } catch (error) {
    return (
      logger.warn(`[useCodingPlanProducts] 读取远端 Coding Plan 静态套餐失败`, {
        providerId,
        error: normalizeProductError(error),
      }),
      []
    );
  }
}
/** 原 bJ（80550）：zaiCodingPlan 过滤免费档 */
export function filterStartFreeForProvider(providerId: string, products: any[]) {
  return providerId === PROVIDER_IDS.zaiCodingPlan ? products.filter((product) => !isZaiStartFreeProductId(product.productId)) : products;
}
/** 原 y5e（80553）：静态产品配置（TTL 缓存+在途去重） */
export async function staticProductsConfigOf(service: any) {
  let stamp = Date.now();
  if (staticProductsCache && staticProductsCache.expiresAt > stamp) return staticProductsCache.config;
  if (staticProductsInFlight) return staticProductsInFlight;
  if (typeof service.getStaticProducts != `function`) return {};
  let promise = service.getStaticProducts();
  staticProductsInFlight = promise;
  try {
    let config = await promise;
    return ((staticProductsCache = { config, expiresAt: stamp + STATIC_PRODUCTS_TTL_MS }), config);
  } finally {
    staticProductsInFlight === promise && (staticProductsInFlight = null);
  }
}
/** 原 b5e（80567）：预览字段并入静态产品 */
export function mergePreviewIntoProduct(product: any, preview?: any) {
  return preview
    ? {
        ...product,
        inCurrentPeriod: preview.inCurrentPeriod,
        lastValid: preview.lastValid,
        effectiveTime: preview.effectiveTime,
        originalAmount: preview.originalAmount,
        discountAmount: preview.discountAmount,
        payAmount: preview.payAmount,
        monthlyOriginalAmount: preview.monthlyOriginalAmount,
        monthlyRenewAmount: preview.monthlyRenewAmount,
        monthlyPayAmount: preview.monthlyPayAmount,
        renewAmount: preview.renewAmount,
        canPurchase: preview.canPurchase,
        soldOut: preview.soldOut,
        hasFirstTimeSubscriptionPromo: preview.hasFirstTimeSubscriptionPromo,
        delay: preview.delay,
        canRepurchase: preview.canRepurchase,
        forbidden: preview.forbidden,
        campaignDiscountDetails: preview.campaignDiscountDetails,
        hasPreview: !0,
      }
    : { ...product, hasPreview: !1 };
}
/** 原 xJ（80592）：错误归一（HTML 拦截 → 网络码；oauth 族 → oauth 码） */
export function normalizeProductError(error: unknown): string {
  let message = errorMessageOf(error);
  return isHtmlBlockedMessage(message) ? NETWORK_BLOCKED_ERROR_CODE : isOAuthLikeMessage(message) ? OAUTH_REQUIRED_ERROR : message;
}
/** 原 SJ（80596） */
export function isOAuthRequiredError(code: string): boolean {
  return code === OAUTH_REQUIRED_ERROR || code === `bigmodel_oauth_required` || code === `zai_oauth_required` || isOAuthLikeMessage(code);
}
/** 原 x5e（80599） */
export function isSystemBusyError(code: string): boolean {
  return code === `coding_plan_system_busy` || isHtmlBlockedMessage(code);
}
/** 原 S5e（80602） */
export function errorMessageOf(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  if (typeof error == `object` && error && `message` in error) {
    let message = (error as { message?: unknown }).message;
    if (typeof message == `string` && message.trim()) return message;
  }
  return String(error);
}
/** 原 C5e（80610）：HTML/拦截响应识别 */
export function isHtmlBlockedMessage(message: string): boolean {
  let lowered = message.trim().toLowerCase();
  return lowered
    ? lowered.startsWith(`<!doctype`) ||
        /<\s*(html|head|body|script|style|title|meta)\b/.test(lowered) ||
        lowered.includes(`errors.aliyun.com`) ||
        lowered.includes(`request has been blocked`) ||
        lowered.includes(`unexpected token '<'`) ||
        lowered.includes(`unexpected end of json input`) ||
        lowered.includes(`invalid json response`)
    : !1;
}
/** 原 w5e（80622）：oauth 族错误文案识别 */
export function isOAuthLikeMessage(message: string): boolean {
  let lowered = message.toLowerCase();
  return (
    lowered === `bigmodel_oauth_required` ||
    lowered === `zai_oauth_required` ||
    lowered.includes(`oauth_required`) ||
    /\b401\b|\b403\b/.test(lowered) ||
    lowered.includes(`unauthorized`) ||
    lowered.includes(`forbidden`) ||
    lowered.includes(`token expired`) ||
    lowered.includes(`expired or incorrect`) ||
    lowered.includes(`invalid token`) ||
    lowered.includes(`access token`)
  );
}
/** 原 CJ（80637）：图标+标题+描述+动作 卡 */
export function InfoNoticeCard({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-4`}>
      <div className={`flex items-center justify-between gap-3`}>
        <div className={`flex min-w-0 items-start gap-2`}>
          {icon ? <div className={`mt-0.5 shrink-0 text-foreground-subtle`}>{icon}</div> : null}
          <div className={`min-w-0`}>
            <h3 className={`text-ui-base font-medium text-foreground`}>{title}</h3>
            <p className={`mt-1 text-ui-base text-foreground-subtle`}>{description}</p>
          </div>
        </div>
        {action ? <div className={`shrink-0`}>{action}</div> : null}
      </div>
    </div>
  );
}
/** 原 wJ（80672）：产品错误码 → i18n 文案 */
export function productErrorMessageOf(code: string, intl: IntlShape): string {
  return isSystemBusyError(code) || code === `coding_plan_system_busy`
    ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.systemBusy` })
    : code === `coding_plan_has_pending_orders`
      ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.pendingOrder` })
      : code === `coding_plan_payment_check_timeout` || code === `enterprise_coding_plan_payment_check_timeout`
        ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentTimeout` })
        : code === `coding_plan_zai_overseas_payment_required`
          ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.zaiOverseasPaymentRequired` })
          : code === `coding_plan_paypal_setup_required`
            ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.paypalSetupRequired` })
            : code === `coding_plan_paypal_approve_url_missing`
              ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.paypalApproveUrlMissing` })
              : code === `coding_plan_paypal_unsupported`
                ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.paypalUnsupported` })
                : code === `coding_plan_paypal_cancelled`
                  ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.paypalCancelled` })
                  : code === `coding_plan_paypal_subscribe_failed`
                    ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.paypalSubscribeFailed` })
                    : isOAuthRequiredError(code)
                      ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchaseLoginRequired` })
                      : code === `coding_plan_security_verification_required`
                        ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.securityVerificationRequired` })
                        : code === `coding_plan_security_verification_cancelled`
                          ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.securityVerificationCancelled` })
                          : code === `coding_plan_security_verification_failed` ||
                              code === `coding_plan_security_verification_script_failed` ||
                              code === `coding_plan_security_verification_unavailable` ||
                              code === `coding_plan_security_verification_unconfigured`
                            ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.securityVerificationFailed` })
                            : code;
}
/** 原 T5e（80715）：终态订单状态 */
const TERMINAL_ORDER_STATES = [`FAIL`, `CLOSED`, `CANCELLED`];
/** 原 TJ（80716）：企业产品 → 目录产品 */
export function enterpriseProductsToCatalog(products: any[]) {
  return products.map((product) => {
    let methodName = product.purchaseMethodName?.trim() ?? ``;
    return {
      productId: product.productId,
      productName: capitalizeTier(product.tier),
      productBigTitle: capitalizeTier(product.tier),
      originalAmount: product.originalAmount,
      payAmount: enterprisePayAmountOf(product),
      renewAmount: product.renewAmount,
      canRepurchase: product.canRepurchase,
      inCurrentPeriod: product.subscribed === !0,
      campaignDiscountDetails: product.campaignDiscountDetails,
      priceUnit: periodOfSubscribePeriod(product.subscribePeriod),
      priceCurrency: `CNY`,
      productEquityList: [],
      hasPreview: !0,
      enterpriseProduct: product,
      tier: product.tier,
      subscribeMode: product.subscribeMode,
      subscribePeriod: product.subscribePeriod,
      purchaseMethodName: methodName,
      organizationId: product.organizationId,
      organizationName: product.organizationName,
      projectId: product.projectId,
      projectName: product.projectName,
      teamProjects: product.teamProjects,
      apiKeyStatus: product.apiKeyStatus,
      apiKeyUnavailableReason: product.apiKeyUnavailableReason,
      apiKeyUnavailableMessage: product.apiKeyUnavailableMessage,
      subscribed: product.subscribed,
      dynamicPricingAvailable: !0,
    };
  });
}
/** 原 E5e（80751）：静态目录 × 企业动态价 合并 */
export function mergeStaticAndEnterprise(staticCatalog: any[], enterpriseProducts: any[]) {
  let byId = new Map(enterpriseProducts.map((product) => [product.productId, product])),
    staticIds = new Set(staticCatalog.map((product) => product.productId)),
    merged = staticCatalog.map((product) => {
      let dynamic = byId.get(product.productId),
        base = enterpriseProductsToCatalog([
          dynamic ?? {
            productId: product.productId,
            tier: product.tier,
            subscribeMode: product.subscribeMode,
            subscribePeriod: product.subscribePeriod,
            purchaseMethodName: product.purchaseMethodName,
            originalAmount: product.originalAmount,
            discountAmount: product.discountAmount,
            payAmount: product.payAmount,
            renewAmount: product.renewAmount,
            canRepurchase: !1,
          },
        ])[0];
      return {
        ...base,
        productName: product.productName,
        productBigTitle: product.productName,
        originalAmount: dynamic?.originalAmount ?? product.originalAmount,
        payAmount: dynamic ? base.payAmount : (product.payAmount ?? product.renewAmount),
        renewAmount: dynamic?.renewAmount ?? product.renewAmount,
        priceCurrency: product.priceCurrency,
        equity: normalizeDescriptionItems(product.equity ?? []),
        descriptionItems: normalizeDescriptionItems(product.description ?? []),
        dynamicPricingAvailable: dynamic !== void 0,
        staticCatalogAvailable: !0,
      };
    }),
    subscribedOnly = enterpriseProducts
      .filter((product) => product.subscribed === !0 && !staticIds.has(product.productId))
      .map((product) => ({ ...enterpriseProductsToCatalog([product])[0], staticCatalogAvailable: !1 }));
  return [...merged, ...subscribedOnly];
}
/** 原 D5e（80789）：静态目录存在则合并，否则纯企业目录 */
export function enterpriseOrMergedProducts(staticCatalog: unknown, enterpriseProducts: any[]) {
  return Array.isArray(staticCatalog) ? mergeStaticAndEnterprise(staticCatalog, enterpriseProducts) : enterpriseProductsToCatalog(enterpriseProducts);
}
/** 原 O5e（80792）：企业应付（pay/renew 最小，回退原价-折扣） */
export function enterprisePayAmountOf(product: any): number | undefined {
  let candidates = [product.payAmount, product.renewAmount].filter(isNonNegativeNumber);
  if (candidates.length > 0) return Math.min(...candidates);
  if (isNonNegativeNumber(product.originalAmount) && isPositiveNumber(product.discountAmount))
    return round2(Math.max(0, product.originalAmount - product.discountAmount));
}
/** 原 k5e（80798）：企业下单参数 */
export function enterpriseOrderParamsOf({
  product,
  maxSeats,
  duration,
  giveAmount = 0,
  balanceDeductAmount = 0,
}: {
  product: any;
  maxSeats: number;
  duration: number;
  giveAmount?: number;
  balanceDeductAmount?: number;
}) {
  return {
    productId: product.productId,
    maxSeats,
    subscribePeriod: product.subscribePeriod,
    subscribeMode: product.subscribeMode,
    duration: product.subscribeMode === `ONE_TIME` ? duration : void 0,
    giveAmount,
    balanceDeductAmount,
  };
}
/** 原 A5e（80815）：企业估价参数 */
export function enterpriseEstimateParamsOf({
  product,
  maxSeats,
  duration,
  estimate,
  giveAmount = 0,
  balanceDeductAmount = 0,
}: {
  product: any;
  maxSeats: number;
  duration: number;
  estimate: any;
  giveAmount?: number;
  balanceDeductAmount?: number;
}) {
  return {
    productId: product.productId,
    maxSeats,
    subscribePeriod: product.subscribePeriod,
    subscribeMode: product.subscribeMode,
    purchaseType: `PAY`,
    duration: product.subscribeMode === `ONE_TIME` ? duration : void 0,
    giveAmount,
    balanceDeductAmount,
    totalOriginalAmount: estimate.totalOriginalAmount,
    totalPayAmount: estimate.totalPayAmount,
    thirdPayAmount: estimate.thirdPayAmount,
  };
}
/** 原 EJ（80837） */
export function payUrlOf(result: any): string {
  return result.payUrl?.trim() || result.alipayJumpSchema?.trim() || ``;
}
/** 原 j5e（80840） */
export function requiresThirdPartyPayment(result: any): boolean {
  return result.thirdPayAmount > 0 || payUrlOf(result) !== ``;
}
/** 原 M5e（80843）：估价摘要（抵扣=总额-应付 回退） */
export function estimateSummaryOf(estimate: any) {
  let campaignDiscountAmount = isPositiveNumber(estimate.deductionAmount) ? estimate.deductionAmount : Math.max(0, estimate.totalAmount - estimate.amount);
  return {
    totalOriginalAmount: estimate.totalAmount,
    campaignDiscountAmount,
    totalPayAmount: estimate.amount,
    thirdPayAmount: estimate.amount,
  };
}
/** 原 N5e（80852） */
export function pricingSummaryOf(estimate: any) {
  return {
    totalOriginalAmount: estimate.totalOriginalAmount,
    campaignDiscountAmount: estimate.campaignDiscountAmount,
    discountDetails: estimate.discountDetails,
    totalPayAmount: estimate.totalPayAmount,
    thirdPayAmount: estimate.thirdPayAmount,
  };
}
/** 原 P5e（80861）：折扣明细（定价明细优先，回退估价明细/总额） */
export function discountDetailsOf({
  campaignDiscountAmount,
  discountDetails,
  pricingCampaignDiscountDetails,
}: {
  campaignDiscountAmount?: number;
  discountDetails?: any[];
  pricingCampaignDiscountDetails?: any[];
}) {
  let fromPricing = allocateCampaignDetails(pricingCampaignDiscountDetails, campaignDiscountAmount);
  if (fromPricing.length > 0) return fromPricing;
  let fromEstimate = (discountDetails ?? []).flatMap((detail) => {
    if (typeof detail.discountAmount != `number` || detail.discountAmount <= 0) return [];
    let name = detail.discountName?.trim();
    return [
      {
        campaignName: name || void 0,
        campaignDiscountAmount: detail.discountAmount,
        rewardDetail: name || void 0,
        applyScene: detail.discountType,
      },
    ];
  });
  return fromEstimate.length > 0
    ? fromEstimate
    : typeof campaignDiscountAmount == `number` && campaignDiscountAmount > 0
      ? [{ campaignDiscountAmount }]
      : [];
}
/** 原 F5e（80878）：企业活动折扣（discountAmount 或原价-应付，按座席×周期） */
export function enterpriseCampaignDiscountOf({ product, maxSeats, duration }: { product: any; maxSeats: number; duration: number }) {
  let declared = product.enterpriseProduct.discountAmount,
    perUnit = isPositiveNumber(declared) ? declared : enterpriseImplicitDiscountOf(product);
  if (!isPositiveNumber(perUnit)) return;
  let periods = product.subscribeMode === `ONE_TIME` ? Math.max(1, duration) : 1;
  return round2(perUnit * Math.max(1, maxSeats) * periods);
}
/** 原 I5e（80885） */
export function enterpriseImplicitDiscountOf(product: any): number | undefined {
  let payAmount = enterprisePayAmountOf(product);
  if (!isPositiveNumber(product.enterpriseProduct.originalAmount) || !isNonNegativeNumber(payAmount)) return;
  let delta = product.enterpriseProduct.originalAmount - payAmount;
  return delta > 0 ? round2(delta) : void 0;
}
/** 原 L5e（80891）：活动明细金额分摊（总额校准） */
export function allocateCampaignDetails(details: any[] | undefined, totalDiscount?: number) {
  let valid = (details ?? []).filter(
    (detail) => isPositiveNumber(detail.campaignDiscountAmount) || !!detail.campaignName?.trim() || !!detail.rewardDetail?.trim(),
  );
  if (valid.length === 0) return [];
  let total = isPositiveNumber(totalDiscount) ? totalDiscount : void 0,
    sourceSum = valid.reduce((sum, detail) => sum + (isPositiveNumber(detail.campaignDiscountAmount) ? detail.campaignDiscountAmount : 0), 0),
    allocated = 0;
  return valid.flatMap((detail, index) => {
    let amount = allocatedDiscountAmountOf({
      detail,
      index,
      count: valid.length,
      totalDiscountAmount: total,
      sourceAmountSum: sourceSum,
      allocatedAmount: allocated,
    });
    return ((allocated += amount), isPositiveNumber(amount) ? [{ ...detail, campaignDiscountAmount: amount }] : []);
  });
}
/** 原 R5e（80911）：单条分摊额（末条收尾差） */
export function allocatedDiscountAmountOf({
  detail,
  index,
  count,
  totalDiscountAmount,
  sourceAmountSum,
  allocatedAmount,
}: {
  detail: any;
  index: number;
  count: number;
  totalDiscountAmount?: number;
  sourceAmountSum: number;
  allocatedAmount: number;
}) {
  return isPositiveNumber(totalDiscountAmount)
    ? count === 1
      ? totalDiscountAmount
      : sourceAmountSum <= 0
        ? index === 0
          ? totalDiscountAmount
          : 0
        : index === count - 1
          ? round2(totalDiscountAmount - allocatedAmount)
          : round2((totalDiscountAmount * (isPositiveNumber(detail.campaignDiscountAmount) ? detail.campaignDiscountAmount : 0)) / sourceAmountSum)
    : isPositiveNumber(detail.campaignDiscountAmount)
      ? detail.campaignDiscountAmount
      : 0;
}
/** 原 DJ（80933） */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value == `number` && Number.isFinite(value) && value > 0;
}
/** 原 OJ（80936） */
export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value == `number` && Number.isFinite(value) && value >= 0;
}
/** 原 kJ（80939）：分位舍入 */
export function round2(value: number): number {
  return Math.round((value + 2 ** -52) * 100) / 100;
}
/** 原 AJ（80942） */
export function isOrderSuccess(state: string): boolean {
  return state === `SUCCESS`;
}
/** 原 jJ（80945） */
export function isOrderTerminal(state: string): boolean {
  return TERMINAL_ORDER_STATES.includes(state);
}
/** 原 z5e（80948） */
export function capitalizeTier(tier: string): string {
  let trimmed = tier.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase() : tier;
}
/** 原 B5e（80952） */
export function periodOfSubscribePeriod(period: string): string {
  return period === `YEARLY` ? `year` : period === `QUARTERLY` ? `quarter` : `month`;
}

/* ----------------------------------------------------------------------------
 * §6 Stripe 卡/验证码/PayPal/产品/订单（81732–84459；排除 vendored Stripe 80955–81731）
 * -------------------------------------------------------------------------- */
/** 原 $J/I7e/L7e/R7e/z7e（81733–81737）：卡品牌图资（base64 逐字保留，脚本抽取） */
const AMEX_CARD_IMG = `data:image/webp;base64,UklGRpoKAABXRUJQVlA4WAoAAAAQAAAAcwAAPwAAQUxQSGEAAAABV0AgQJlkgSZ4YIqICEHveBRMa21b8mLdV9DuyRaAyghExvhH+KOgq76dE9H/CQDm9yMUKYDxI43hPyzCGj5aV/H0F8/28Mjvl/rLI06eXfOUC4/nPyzCwsqSADgeBlkBAFZQOCASCgAA0CkAnQEqdABAAD6JNpZHpSMiITAY/figEQlsAMRd0V6eYf4XzIuX+wx5DpoiTV8PUBzaf8B+u3uL/q/+O9QH8f/sn7Je676BPQA/pPpP+oT/dP+L7AH7KemZ7G/9s/8npdf////9vPlXfCPx0+u/ajk99HeZfzwfC/a/88v4D/I+D/wK1AvVH943wMAH5l/Sv9x/Y/Xo+H8wPrv/o/VF/Rf9b6z+A9QD/lf9z8/f6N8930r/5v838Cf63dXH9zS2EHq876JGqWzA+eWcoLwYZMJzuH5C3Wol/3I96ACxKTcLlRdQlhfvDiXENJHCe8nWjPUinpM9S/VDGoTq74HwYu9KVBwUQkyeQZXHFE1daSrqmSDWoCNVgWROXj1/eUjmQk7aI5QvXQpOHbMOEz1EHp3vXJUgf+NwoFPOzH4Turj+kjhfRHzMmsWKZSdCSZift6qGq7QmmAD+6LEoAS7zbvCJkPMFjT1K0xPQy4kBMjYpoLZqt4CipCcq4fxCZvNS/qeeC73qCjuE24bf+hfxNv7/x1P4j9hmGtFsQbV6oXYf59t88VP+D/+V0GTBvlXf+hbQZ9oFV/u/yaPuKOtPvhwyG0f+SDIK+03jGuOiNIfU3JX6qpq8rGl/pbETamAk/0llfHbwVqwOD6Ij/h/cwxVSnENNhuFXuwuviPXWZCuRXEOnVjof86aNC5P85XuVwMRllahgXJZge5ARjrZMJ49S92+Cdnw6PDZ3zjdHfcXmQ5XwW/c7Fbf7CLUX4SmsTv8ep/7cWcgQcNbNx3G4QPve4lSm07BA5N0y05B4Dg3XRJL1bXd/UzLXzXpszzIgGmJ7qjCYQ76xg1BbtBAG32U/3AyxwvQtKiCQkAMo3mXF/qCyCqreo7xp9j2Ou587OJ/GL3+Y7k/+A9/vugq5noqdrPRHwoZhVAzsCQn2SWngzShqopKQO/xBsxj3vsQNMeeQ/eIc/TEmxAVQb9ghXvbxLFkq6rCUQS7i91sAPVypDwbu2/D5UKr7J1e0M4Q6mPPH2TgoRNxWu+mQS/+V+4IjLWFsfBtHfL9dksOBA+qNvBYLJ+I2uM9fdoO5ggUtinoQ2Yd8dS7KLBz3yuMKu/Z+IZZfh9N7bQQGgpPd8p0Ndle8GA6bDHC/FEpwiUoQoQpp8xbo70GKY39neOkQD8r4lxD8hCEaSTKU8/koAKX1lEeFWfKz8whoG7Ey7r/4Xh2IEMv2CpBek4vD0XseXfBwRxa1zfLiagrPFtyCLTfNf7GyhrxfVG4F2uXlXpMr47BOfgrm5vQN10KiI/ZR0/YcnPVY69gO/+gfbl28nZLuYDFVJHsCxrm8szzTGAP8tOf5WuHzt/HXRhh5P9/2eQkatjWbKdPEXmZ2YJ9V6EftkU1eHel4w9Rp48+TCX7Dp2+G5CBprdp02fyv8cKJb2YqEkD7rtPY/zGxPz183ASTKh/itQtfO+kFSbEXKrflg/O7Mot0oQ5q5S/dvnDT8AoyxeXAKvUWZiAGCdcDsdbnUmT5OQhxJuVVZ99k5jF5JispB/VePk3hnmiLxdo6gEF8j0Vjbg3IuwpC0mzYo3Jy/zNK7fLrctfRumdchQMnrhMw0oB8855EHeczjypsuTjEJWCNBGQlK+ePV1dcYDnvQkjrk5MM+qkw836Rj4dkV8vrgmtqGW/KClrdy4eMYLFKL8b/hRkk0QGdaoks9y3Lr2hetECRRlQ18+8OvGcZ+bXzeVMqgStJK872uDmL/BLESc7LlGMSssgS0m8mqbWQctQ9O96XG8qGGxRJvIaIWWLxeOkYNE2NmdeAPED7thrHX1HHv8MiRbaqxDOz5VZvx51wNI9QxpAlry2te7fWT1D1zgMcdLxkaR2y6ms4G/Av9QZ2ybNpbDk3F9h52/ytJvFq1DcHTkjD7Yihp6FWUOsWpM2n6wkS2nAvBEArhJa6/6HkJI479H5PQCms0bo8CktaRLmueBKS0W5pm73DdCP7/8f970Bpr3sRpeP1Em4ukvlUNsNCPyRbD2so8INLoeWb/o1RqrJkkfMHGV8en+6WlrGL/E951T7hEP5CtCHjtGPDiolmH68fjeu7IWMBzRcadRsFicl91BeoF8Uo09xA93pK8T38W/anLgQUdEU7hSCDU6O+uYfVfVYKiPEUDIfQD7+cR9WR85S32Z/OvH3gzmrQfOXzwoI7t8E0df88eNclrOTWlZ9b7ltf9H7lK59/kUxIxZG/VvI0/jMJ124Fk3ruxroWKBi76w989mDD08s43U7b1aveHhCl2hV7z0r50qR1RDZFJTiHPhFgOYCeW779xh9RNJ4pX/dFL2596cCWiaTUGDQ+nu+/9jeN8Qb5ev6Sc5uQY1Ceips8n5LRAUTQlw9tR58dAvgbQt02meN+qFHY7y4m39nGNnlNkR0Rjw8L4Ho6I5h/kP6iJu0pKWGtXrXBOKOW3ObdBFqCdA+WH6V7P1Kp2bTtJWSrcH+T02VVxFng+JqFD+mRxpmizAHaJtwBtZngq+/SeNMu85ZaGbYv2mkWlfB26dcwfnwgS2STZTqHx8X6vu3eUvpfqZCOS0pLilNsOQGfyHJgwV7/syPjfFrJJ+dRdSrXKv3WuN8UHfTAs4tvrHjlU837FQWrcpe0oG9i4jaBF73tq5dAQF92zt4egXwV5feUi0KyUyf9G0XCU2S1fTvG5dVSZnmMoi969MyOHP7dMzwQE7E8vXS4ReyFaICd8affOT/owkS2oczLjVAgYcbTArfVokT4oJk/KfzwpzjltiXR3270f0t7cskRr18U+sNzUUpkclHxqvvlmmjMD2tDHfVzQGaVQ7fZKsvF5q4ocHwOq222XOCUrhy1aMfBM9ycTDGcjSzqGhIXOV6/0lNU16B5ndkHpMJzuR26WHzphq+sPp7uPBYI6OsbWcWplaI8ypnKgstMi3rO/ViYUDSFh5FsmyJZMPl4aBscDT/P8xe+NxPmTnaALf+I3y4Zp5+ycR32c0mhaO/npUOhUgE4gLFL2TbO6w28BFRpmopQI3rsLti3CpTepmTvnjxmdV3kTW88koJJ92BSunyZVDSy/STNtesjAdwF9XdCQfeP9DE0GAGPwO878KE1ddiTiHwsO4K0qFnAfoge115Km5Oy68Zx7PPKjLqMpi9i+NozZMsQgkAr4G7K34j3/KF+mtWjnlFLOs19xIWeV5/wrPL0BruCU5HyDY6lea6HrpI9QOp68mblPMlmntsG3VsRKbx1wRTdHxJy8m/fCbxXyTOBuBaV8dLzaMOW7zLou6fK++bs7//9HCENAV14TRjqf6MOS5OIWP+iy71WOjEeWgV8iwJmMy6LRAZviteSPmDM9jH5CS1ET/1pEXVQ4UJLnvUwwjg4hbFs8wb4t/kROAivg2fsgtuejWd6XwHe54BPbAyhVg1XZm7WZEtTjpnayAAAAA==`;
const JCB_CARD_IMG = `data:image/webp;base64,UklGRlIFAABXRUJQVlA4WAoAAAAQAAAAcwAAPwAAQUxQSGEAAAABV0AgQJlkgSZ4YIqICEHveBRMa21b8mLdV9DuyRaAyghExvhH+KOgq76dE9H/CQDm9yMUKYDxI43hPyzCGj5aV/H0F8/28Mjvl/rLI06eXfOUC4/nPyzCwsqSADgeBlkBAFZQOCDKBAAAUBkAnQEqdABAAD6RPJhHpaOioTL0OTiwEgloAM6uINsek1HV4ffRScdvmSH1ueYBzv/MB5sX+w9YvnAdTX6AHlve0H/iP9RXlK830Ddre0TvJGTeIjTDTLv+95sPqfgQ+iMmlBFKQnDv4faKtw2uFx/8Rlryru9cVoi+fUKeTU2bR9I1elcW4Wsk/cZZyKZZafgrVbsFsQ4Bcboggxplgc+PMYfTEVbKlE6cCo83cnlK+sWGQzaJaqOLxcgSViZyUa9gFJndfzG5x5axu9pt36NjgAD++/Y6YAd3Zc+aun+s2v1n/GvysZe7kp5lPf2p7RVfn0z5qehc5DBiZlUCBgKezpu+13Sl5sJzv5iEwhUUl/zJhrZxFB+aN56lZqbTomAGmNwJIi+eqqe3nADBUYY/JHVpJeFlM9zDs+LCcCrn7DVJ5UJ0b/EjXXt//gMCcBmGp4Jwq2wq7QfRYat782YfqcwntKxuMf/pRwH+GsittPaveJj55ZDarY4OrF3G7XsAdaUWHlbCJikHb9m9ziS9fP/l6utxPW8WmvP+A47oVGVHuvUEXdWi7peJV1+ZelYlZYpQjtnJZz1glqR13MerzjyzX/LIX7xO/9B7EQsFN0gG8SLtMK1FKttyrYbhZZrtvRl2KZV5I+55fHBFDTC69yo4sSO+C4gPNdzyLwG7ZU+CQvmbdCQGfOzplOjvpZACt1mH2l2VcTM1u4bqnJ2NhLdWILjoxhYlAI0mdwwW5cY3mkvJyIDwrM/k/HB+BFhNlstCgM3np7DhQ1EsaeLNBo3Nd/cnhlgQK1eqZsL/v/lsxfF9mzqis517OqTm5oD4B1DaggtNy3LvI9WDxKg1sZvgnIkPV++pEWq8/W9bH4jOFyU80Bog3vQEvO0Z0DijpRhgnKcMCk+aTarg1O9j2DYE8FiEaMCgmNMK/hqusmvGkYHdLkVN1fDIiYoAeDrvjUN2VwFJ/2LT1Ypu2Ezev7/xk+3/fAJl+OnAogp2myLJm+VH9pvo/aCmUpb6n41320OBLXSJdGsQu+GA2fZ7CEtSvteK4Sjh5WIoSa1/2q3SFTVx/OrTp5Dqtf9sTp/A3DaT9VQugCazYqRRp2f90d1aLaxD2nEXujhfCF6G2fjny6FGwOytVcFj5YKodLR+u5VHN/nS+AV3LOARq6Pn8ay4pvX3CdWXAj80//v4CGVstyTIwhW8cGPt2uY+MTM9/hyH6c3YQYY12uEF9edp+/xayG4Tb6f/qwmI0Nk9Ap68GEaLG+kYg+8dmQQMorPdQlH6v/mzRo0NhuJjh1ksMME1McFA2KTbyRuMnCbkGayUNI+nZZ5jpnmZ5X4KLH7vm9801FoMAc35svQQXsccWxAEYC3yDwWlcaFx0WCuxwt6Kww9/4KqWwNOU/z+wtQSAEEAf8uGoKZz/v03kR3KHCHa8HGTzaZ3YA8DEdT6jPzpxvWtDo/QYPu+YWfCWYkjWHxtsZmZndElQADx+jnKJ248Hq/41vD/hCj7yU9cz9u5HDY2i5PBt96alcBhWuk4nmbnvhQimE1RnPHvdO8bp4ft60NBfDlWl0r89vAT8zwA4GlI7Elp4qArfPlW8a8Xdj0yqPv2vm85oiIsbmSW/1Zy0AAAAAA=`;
const MASTERCARD_CARD_IMG = `data:image/webp;base64,UklGRvQCAABXRUJQVlA4WAoAAAAQAAAAcwAAPwAAQUxQSGEAAAABV0AgQJlkgSZ4YIqICEHveBRMa21b8mLdV9DuyRaAyghExvhH+KOgq76dE9H/CQDm9yMUKYDxI43hPyzCGj5aV/H0F8/28Mjvl/rLI06eXfOUC4/nPyzCwsqSADgeBlkBAFZQOCBsAgAA8BAAnQEqdABAAD6RQJlIpaQioTDx6IiwEglkANVv/vzPKh8aGUnYnOA+wDfMeYDzyfQ1/nPUA/wHUgegB5b/sjftd+1TGBWgywNIEznuzf1uQLFtCTZ1GtBPbO14P/3Kma4LBLbWgCSpe2TXoEIxzlBY+oIkx9lNdjYFY9EFFKWUqH/0S+iPJ8OgzLw2HjaAAP76gZqQ8VnbzihS14gL/db7097qgQ5pC7pdeKHmAnkDvWRBZ/RH80RtXASt7AZ/IfgZXDi8/GLW6OQkJD46WjspZJus3vcuHTukqqVLhy1GgcakUeaFxNra54PLQhPksuI8M0HHcQ/2P+lxOv/cleuwgNZ+0oja6wiEglHRpVriVBIqndye5Twto0rj7HcXO3P7QL8SclHk28dSGb6DznwATW2g1c4uTHBIXWYGhwo/1N/+eCXk0dt6mnZYAi/XUTRiFdlhmY35KUCA2/0i9puvFacAbvWtmpegACvTBTfKwo602ew26ajDpF7qq9wsxDwCU0NKLbEx5X5bPJnEALTcfTF6FtEnJt8oGCO8mOVLeatcMFLx42d/TTJ0dsbGxn6PiR/urYZXU2EvTv5FLN04wNUoQKpQPXsAABc70HxdYtXfm7WLuAlQgbaRO8RkZdUNNgUz8Q0C8ExciJU/hjsLOXboOSKAzdREJNq7yHdYpQSw57tOSM/bPiCKBpdJzahvrTk6w3OdHuAbAHj6Ai8S3j28Z3pn8I+eS+dPwZG36x5SvSdHAG+A/oBQkSMoaUMU9hh6NCUSnB5NKcL76BSbwEUMSI963sN31l0Km1QwPZbMHB9PrPD/gAA=`;
const UNIONPAY_CARD_IMG = `data:image/webp;base64,UklGRjAHAABXRUJQVlA4WAoAAAAQAAAAcwAAPwAAQUxQSGEAAAABV0AgQJlkgSZ4YIqICEHveBRMa21b8mLdV9DuyRaAyghExvhH+KOgq76dE9H/CQDm9yMUKYDxI43hPyzCGj5aV/H0F8/28Mjvl/rLI06eXfOUC4/nPyzCwsqSADgeBlkBAFZQOCCoBgAAECEAnQEqdABAAD6RPJlIpaMioSkY7TCwEglsAM+YGEQf1HnDV3/D/iH8Y+TcPTyk9DvqU26XmA8470JeUZ1rvoAfrv6a/7c/DZ/ff+X6Tl4V/juhP8nykOYDuJvh/6J5799u0/lgXdL/beCxqX4H/6D/qeM++k/3H2AP5T/WvOO/5/8j57voL/we4X+tXpQewP9qvZi/Ypv653Oj6yGjiU/HhxvwsI2y5Ts/R9FbFxaKzasQaP9vdn3dXcE8e0KhZ/TqDgkA3mETAHvlx8u+z1kYiMteP2IkdaNwPvuKWYHGcCM9MLye7XegradpBhsSD7nNiJhyV3/prNVkY79qDsia5c3xwx4Wyza5RVhA7DoAAP79Ody/heT2peRX1OmLH1roXuAOhlUHzA1Cv92iEhGs03DUUH/vDPsEkChtCuuzonnE0EW+fs/l9AU1WkHdz4c6ffR4i1Wnd98/XgmFPCxSOz5/x2Md77JKnk43B0hjeoGM9hzxXQSdoHhO7SnmmG6EREEihOKztUCsDyObpp2DjTuTojzqB4NSSVYpdaWvi5Sl7JZ7pAhGQ/8CDbqupurG0ckEn56VD4A98zUS9HLviZbUvQvmxBD/xl6Ff+OkJA9Pe7KpDuaj8Ol5uh1RVdvU88ZaKJA5cGyuacxGEoDbZAuv/+WJvYQl39xUpffbS8IM3nZwT4957KmIoLxu7QcqP/JNqnN/h9UhsOxc3MqjtJhuUaup/e8lhHyJc3r33iSwQB3jhvo+ZgCYfqTWolLUzG/IFJsoYlqA8Rss2jtiy5OUd2b7zqjC7z6m9apD4XZsVvgIJApqMFwbWKl4FRy3PjEAqLe/M60hRje9v7OrEMFJlHHj//zT7+8M+0nWfRf3Q18ghY8wTO+Qt6QQX8iQisZpneCbSF2qkbJIj42RI/s3X2YMO/9gr/MIVvLzmwgAPzbnsrc20pjTW3rEuj4dFRf8huJa6weR96a/BEUm0f97Ihf/2gj1PzrkamqK4nHCAPrIeRXewv8W328V+eclncq4PfPnryS+O4+8f3WjOCi5PP1o9N2kUq3TnNfphVeTMaGAjR3OOdhPAxulrT/HryV8Jw2CyHgnQLjLW9F3CzIvpxG5ridIIWfF3ZdGWcRlSZq00MQJJXKRwtevjsnoQwfOqxuW6L3OZXYl5UO4Qb5gXIYhiSZIs3abpywaDE8aSBDKu8Z741A86SMqgnf821ZLrH2v+IiSlwPlJlPQLAk8NAkWgR32n4333VOqTC2FA8H8se4RcpqPfK5tbdiC3a+AnqC9bekEzf65prEMvR9+UI9QQyRLnF+IMwEDNW8RBJ8WbDvvfG702XV98WvFQGQbmJsiYsI+/NQ0z3K+BNCIBp/eQcW/Kc/63bxy7VfYkmXEF1tYLKecOW4AHAWwWngqBIYnCHIP5VZhjROX1Gbn7AFuVOX5z9/nn36cU++0zbwf/sNhU9Acf20ArXg49kn+F2psm9pd+wMZrD4onFwPIqeHbvxJoZcVnd9eglT5vDm0gYui5YtGwB+etnrRZ5qGgpjr1dd63RJ+qfrP1Az/Dig5tG6gKODF5Oq+r9RSKRFy/SNlXUqAg51SmJen9XLgtqowZTqfDob+RUYoeE0yDzvofYEsicuKL8VSPKSZV2BHKbjr/5u6x3z+3nINSOUot20eZgF993IE0DygicOmPmi2mt2eeXL/tv3pjTYLu3CbvHseaxrPtDL3wWb5dRD09/VX8Cd7tlTmaxFTv9lgwZPz0hXReZiOMz6KB8CAJGKAL5l1G7kGlFc++1e9f45olJCRYhVbCXajEEwQRFLTllhEMyXz2tinXY6BGb1IzUCwflNbSP1P+rGiuVNPiF95BNNOx94W5CDVfIW3vVLtgurReaSUuMqFRJxAdWFhguTe0HljCWUVOnkTBUYRX+z41uixJSq816tu1c2WBO/r9x4H3lnjoyPxO82xcIdS7MZZIvu8BWACGvSTGMIDLnldfrIx9E4/GA7S5osLRtgPGM+rzCjDObZ/daJ762b+kK2D84Gz1P1fnEAkhvHVl0Iissvs46DPirIdjnojttbJmAO9f2Rfebn5PWKIo1nvAzu82t51sEvItwyao8a5uC3FbEf/Bdp+57o+2xAOqMfEEfM8Hq/gudWOds3n9NIO5iXHJz0KEMJx8eK07Eqm1RdUtmRbJzv4vzvlFm3ocdtMvoCB5AFlx2Whi+4QrixURv+G63ZtHbjT7WPf08OcZWnlQhH1O2mXHJxMUncNK0moAAAA`;
const VISA_CARD_IMG = `data:image/webp;base64,UklGRuAEAABXRUJQVlA4WAoAAAAQAAAAcwAAPwAAQUxQSGEAAAABV0AgQJlkgSZ4YIqICEHveBRMa21b8mLdV9DuyRaAyghExvhH+KOgq76dE9H/CQDm9yMUKYDxI43hPyzCGj5aV/H0F8/28Mjvl/rLI06eXfOUC4/nPyzCwsqSADgeBlkBAFZQOCBYBAAAEBUAnQEqdABAAD6RQppJpaQiISobOXCwEglmAHez+L8wSs/3nXsyI9pk4DbLeYD9kN8A/Z3rhPQP8t32R78A1LsLIkbft2q95lgB3lv6FxTMafoK6CXp7gDluEvlJZz3P9USpQ6+rh4KnPbGL5zzuTHhRJg976K3MTTUwhSi6pDO4RtIujC1RB5EAeHe4QvB0zUPC+MRtZdV8XeWo4Jk1Io1xCv4kv+SoDgq/zKyDwwAAP77lAKCprvgrguR1j2IEmFThc9pGjapIjrdEqMVjl8FCsdmUYJt+8GuP3foJDtBITGyfNCJhlsJ280WGUZ7W7+YUBzpkboQmoj38LhYd/8AS8Yqt2GNf9zrX7mRgbsYgcITDR/sSyaJKqda9IBAH+u/TlxoHMqMQ1kOPchZr3IGepRoGdUe/MHrHG3KovONxeQ49DzI2+9zvl9+DogoYEGDLS+IXX6zPMwnq+oP9DE+i8n2klpnxAW7+oYHnt2EQxlDcpRPW6JaU2QYKSP+/917/EHX3Lcz7OQgoDeQhv3wPrLN4+w6w6aYICjzSGuyBTbbOwm/dP0v4X1Uzrq8XSusTwnQGBMZfhrlHix7YAtwTdL3azF/58IWn870ZP2O59BtEcYoGFq3NA4mpIxWAzUsfjl50vuwQ1P8nEy5Vfms8HdK+ziN+6x/prCn7M+maoxkXxlipsUn/pf48J/5AMVMLi4IdtJKZESzXcd/5OPAxhoYgE/IsJ5/J8RsO8kE7aZGDasqWQeIjEH0UvxAkTTkTgqTm+ey9QAXoJg9pUbrzKf/alChvSIaVB7Zbh33p7qg9BDKy2Dwx15JRVLmxUDZPsbrCxVA/6h36gq6Lj/PV/9qqxAcW1+Y67Ob0WkX/qdEj6r7lVZ5dJogBFxkQhGnPxDmfW9XR0hplMSzTTTRXPBYp3Ac1ePuPwxMu2XBkSJH/za9DqhqU7t2zQVNNgfxTnU24C51ncn+9XJzepUfUBqI6qh1zqLWWTKcZchlXIzQ3FZJXd1Jx17xrUHMQXrzNLmzRFQwAO5GTj5uPPRP8kRYpcwOhtG8z0+FafOwbUTQqsJSqb6DtPuOlVxpEKxAcBWTfnCMe5tzMFZGf2ftsD731HfOxK6GnOrEuXbEnPMbU+fbFaCerm306TuMuJ85orWUzXh8yblLrRTtgrwR7bqclrGTL1fcrKPQq7PCBOIqnpJgCCIrATuYi08+KZHkKtlL8Lak6lv8tWXU6iBZX6KW9ffeObQeOHM9lCQ/qt3mrDgEsg+SCFWQuNq1DVDl37WX+9NDMPPDUb44/Mpy7nibbpWAg/d5Upsf0PDEXy0JDFAy/GjApPyR0aYPqbIbf+Rb2ZS6cJRTzYFdS9xjbX8D2IGDnz/VdCcUDpUx6pGmmN2z+/wSpEns8XnUosLBWneKj/sR3Ldth0bxvnLeQRuOeEfXuyPGOlRKIBZOR9/pxZCdj5kSI+0uFXzPAGAAAAAAAAA=`;
/** 原 B7e…W7e（81738–81742）：z.ai 管理/文档/法务 URL 与 Stripe 生产 publishable key */
const ZAI_MANAGE_APIKEY_SUBSCRIPTION_URL = `https://z.ai/manage-apikey/subscription`;
const ZAI_DEVPACK_OTHERS_URL = `https://docs.z.ai/devpack/tool/others#step-1-supported-tools`;
const ZAI_TERMS_OF_USE_URL = `https://docs.z.ai/legal-agreement/terms-of-use`;
const ZAI_SUBSCRIPTION_TERMS_URL = `https://docs.z.ai/legal-agreement/subscription-terms`;
const STRIPE_LIVE_PUBLISHABLE_KEY = `pk_live_51Rh0IhRp8MKof9WnGB8dFxbhuL4rEXjb1o4XuhLdYmslZ20h1M38j1N6Q3zfCjS39mRnkIckhIKeV7zxnT0Dnlh000rGfUFImB`;

/** 原 G7e（81743）：卡品牌 → 图资 */
const CARD_BRAND_IMAGES: Record<string, string> = {
  amex: AMEX_CARD_IMG,
  "american express": AMEX_CARD_IMG,
  americanexpress: AMEX_CARD_IMG,
  jcb: JCB_CARD_IMG,
  master: MASTERCARD_CARD_IMG,
  mastercard: MASTERCARD_CARD_IMG,
  unionpay: UNIONPAY_CARD_IMG,
  visa: VISA_CARD_IMG,
};
/** 原 K7e（81753）：国家/地区选项表 */
const COUNTRY_OPTIONS: Array<[string, string]> = [
  [``, `Select country`],
  [`AU`, `Australia`],
  [`BR`, `Brazil`],
  [`CA`, `Canada`],
  [`CN`, `China`],
  [`FR`, `France`],
  [`DE`, `Germany`],
  [`HK`, `Hong Kong`],
  [`IN`, `India`],
  [`ID`, `Indonesia`],
  [`IE`, `Ireland`],
  [`IT`, `Italy`],
  [`JP`, `Japan`],
  [`KR`, `South Korea`],
  [`MO`, `Macao`],
  [`MY`, `Malaysia`],
  [`MX`, `Mexico`],
  [`NL`, `Netherlands`],
  [`NZ`, `New Zealand`],
  [`PH`, `Philippines`],
  [`SG`, `Singapore`],
  [`ES`, `Spain`],
  [`TW`, `Taiwan`],
  [`TH`, `Thailand`],
  [`GB`, `United Kingdom`],
  [`US`, `United States`],
  [`VN`, `Vietnam`],
];
/** 原 q7e（81782）：Stripe Elements 外观（明/暗） */
const stripeElementAppearanceOf = (dark: boolean) => {
  let base = dark ? `#e5e7eb` : `#0A0A0A`,
    muted = dark ? `#9ca3af` : `#737373`;
  return {
    style: {
      base: {
        color: base,
        iconColor: muted,
        fontFamily: `inherit`,
        fontSize: `14px`,
        "::placeholder": { color: muted },
      },
      invalid: { color: `#dc2626`, iconColor: `#dc2626` },
    },
  };
};
/** 原 J7e（81798 / jsx 71912）：Stripe 卡对话框入口（内嵌包装） */
export function StripeCardDialogEntry(props: any) {
  return (
    <StripeCardDialog
      {...props}
      onClose={props.onClose ?? (() => {})}
      embedded
      policyVisible={props.policyVisible ?? !0}
      termsAcceptedOverride={props.termsAccepted}
    />
  );
}
/** 原 Y7e（81807 / jsx 71915）：海外支付（Stripe）对话框根 */
export function StripeCardDialog({
  state,
  embedded,
  policyVisible,
  termsAcceptedOverride,
  onClose,
  onQueryStripeCards,
  onBindStripePaymentMethod,
  onUnbindStripeCard,
  onPayWithStripePaymentMethod,
}: {
  state: any;
  embedded: boolean;
  policyVisible: boolean;
  termsAcceptedOverride?: boolean;
  onClose: () => void;
  onQueryStripeCards: () => Promise<any[]>;
  onBindStripePaymentMethod: (paymentMethodId: string) => Promise<any>;
  onUnbindStripeCard: (paymentMethodId: string) => Promise<void>;
  onPayWithStripePaymentMethod: (paymentMethodId: string, confirm3ds: (clientSecret: string) => Promise<void>) => void;
}) {
  let { intl, locale } = useZCodeIntl(),
    [addCardOpen, setAddCardOpen] = React.useState(!1),
    [cards, setCards] = React.useState<any[]>([]),
    [selectedCardId, setSelectedCardId] = React.useState<string | null>(null),
    [loadingCards, setLoadingCards] = React.useState(!1),
    [localError, setLocalError] = React.useState<string | null>(null),
    [termsAccepted, setTermsAccepted] = React.useState(!1),
    product = state?.product,
    preview = state?.preview,
    productTitle = product ? productTitleOf(product) : ``,
    renewAmount = preview && product ? pickRenewAmount(preview, product) : null,
    renewText = typeof renewAmount == `number` ? formatMoney(renewAmount, `USD`, locale) : null,
    amountSummary =
      preview && product
        ? buildAmountSummary({
            preview,
            product,
            currency: `USD`,
            locale,
            labels: {
              originalAmount: intl.formatMessage({
                id: `settings.modelProvider.codingPlan.overseasPayment.amount.originalAmount`,
              }),
              discountActivity: intl.formatMessage({
                id: `settings.modelProvider.codingPlan.overseasPayment.amount.discountActivity`,
              }),
              currentPlanCredit: intl.formatMessage({
                id: `settings.modelProvider.codingPlan.overseasPayment.amount.currentPlanCredit`,
              }),
              payAmount: intl.formatMessage({
                id: `settings.modelProvider.codingPlan.overseasPayment.amount.payAmount`,
              }),
              deductions: intl.formatMessage({
                id: `settings.modelProvider.codingPlan.overseasPayment.amount.deductions`,
              }),
            },
            deriveCreditFromPayAmount: !1,
          })
        : null,
    isBinding = state?.submittingAction === `stripe-bind`,
    isBusy = !!state?.submittingAction,
    publishableKey = stripePublishableKeyOf(),
    stripePromise = React.useMemo(() => (publishableKey ? stripeLoader.loadStripe(publishableKey) : null), [publishableKey]),
    period = rawPeriodOfProduct(product),
    periodLabel = intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.period.${period}` }),
    recurringLabel = intl.formatMessage({
      id: `settings.modelProvider.codingPlan.overseasPayment.recurringPeriod.${period}`,
    }),
    selectedCard = cards.find((card) => card.paymentMethodId === selectedCardId) ?? null,
    loadCards = async () => {
      (setLoadingCards(!0), setLocalError(null));
      try {
        let list = (await onQueryStripeCards()).filter((card) => !card.isDeleted);
        (setCards(list),
          setSelectedCardId((current) =>
            current && list.some((card) => card.paymentMethodId === current)
              ? current
              : (list.find((card) => card.isDefault)?.paymentMethodId ?? list[0]?.paymentMethodId ?? null),
          ));
      } catch (error) {
        setLocalError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoadingCards(!1);
      }
    };
  React.useEffect(() => {
    state && (setTermsAccepted(!1), loadCards());
  }, [state?.preview.bizId]);
  let handleClose = () => {
      (setAddCardOpen(!1), onClose());
    },
    confirm3ds = async (clientSecret: string) => {
      let stripe = stripePromise ? await stripePromise : null;
      if (!stripe)
        throw Error(
          intl.formatMessage({
            id: `settings.modelProvider.codingPlan.overseasPayment.stripeNotReady`,
          }),
        );
      let result = await stripe.confirmCardPayment(clientSecret);
      if (result.error)
        throw Error(
          result.error.message ??
            intl.formatMessage({
              id: `settings.modelProvider.codingPlan.overseasPayment.stripe3dsFailed`,
            }),
        );
    },
    handlePay = () => {
      selectedCardId && onPayWithStripePaymentMethod(selectedCardId, confirm3ds);
    },
    handleSelectTrigger = () => {
      selectedCardId || setAddCardOpen(!0);
    },
    confirmDisabled = isBusy || !(termsAcceptedOverride === !0 || termsAccepted) || !selectedCardId,
    payLabel = intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.payWithCard` }),
    body = (
      <div className={embedded ? `flex h-full min-h-0 flex-col gap-4 max-sm:h-auto` : `min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5`}>
        {amountSummary ? <AmountSummaryCard amountSummary={amountSummary} initialAdjustmentsExpanded /> : null}
        <h3 className={`text-ui-base font-medium text-foreground`}>
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.selectPaymentMethod` })}
        </h3>
        {localError ? <div className={`rounded-md border border-destructive/30 bg-destructive/10 p-2 text-ui-base text-foreground`}>{localError}</div> : null}
        <div className={`space-y-3`}>
          <PaymentMethodOptionRow
            disabled={isBusy}
            selected
            onClick={handleSelectTrigger}
            trailing={
              <button
                type={`button`}
                className={`inline-flex items-center gap-1 text-ui-base text-foreground-subtle hover:text-foreground`}
                onClick={(event) => {
                  (event.stopPropagation(), setAddCardOpen(!0));
                }}
              >
                {loadingCards ? (
                  <Spinner className={`size-3.5 animate-spin`} />
                ) : selectedCard ? (
                  intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.changeCard` })
                ) : (
                  intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.addCard` })
                )}
                <ChevronRightIcon className={`size-3.5`} />
              </button>
            }
          >
            <CardBrandLabel card={selectedCard} />
          </PaymentMethodOptionRow>
        </div>
        {policyVisible === !1 ? null : (
          <>
            <section className={`space-y-3`}>
              <h3 className={`text-ui-base font-medium text-foreground`}>
                {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.renewalPolicyTitle` })}
              </h3>
              <ul className={`list-disc space-y-1 pl-5 text-ui-base leading-6 text-foreground-subtle marker:text-foreground-subtlest`}>
                <li>
                  {renewText
                    ? intl.formatMessage(
                        { id: `settings.modelProvider.codingPlan.overseasPayment.renewalCharge` },
                        { price: renewText, period: periodLabel },
                      )
                    : intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.renewalChargeFallback` })}
                </li>
                <li>{intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.renewalDeduction` })}</li>
                <li>{intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.renewalMinimum` })}</li>
                <li>
                  {intl.formatMessage(
                    { id: `settings.modelProvider.codingPlan.overseasPayment.renewalRecurring` },
                    { period: recurringLabel },
                  )}
                </li>
                <li>
                  {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.renewalCancelPrefix` })}
                  <OverseasPolicyLink href={ZAI_MANAGE_APIKEY_SUBSCRIPTION_URL}>
                    {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.subscriptionSettingLink` })}
                  </OverseasPolicyLink>
                  {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.renewalCancelSuffix` })}
                </li>
              </ul>
            </section>
            <div className={`flex gap-3 rounded-lg border border-warning/30 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-warning)_18%,var(--color-background)_82%)_0%,var(--color-background)_72%)] p-4`}>
              <div className={`flex size-6 items-center justify-center`}>
                <ModeIconFullAccess className={`size-4 shrink-0 text-warning`} />
              </div>
              <div className={`min-w-0 space-y-1`}>
                <p className={`text-ui-base font-medium leading-5 text-foreground`}>
                  {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.accountPolicyTitle` })}
                </p>
                <p className={`text-ui-base leading-6 text-foreground-subtle`}>
                  {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.accountPolicyPrefix` })}
                  <OverseasPolicyLink href={ZAI_DEVPACK_OTHERS_URL}>
                    {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.supportedProductsLink` })}
                  </OverseasPolicyLink>
                  {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.accountPolicyAfterSupportedProducts` })}
                  <OverseasPolicyLink href={ZAI_TERMS_OF_USE_URL}>
                    {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.termsLink` })}
                  </OverseasPolicyLink>
                  {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.accountPolicyBetween` })}
                  <OverseasPolicyLink href={ZAI_SUBSCRIPTION_TERMS_URL}>
                    {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.policyLink` })}
                  </OverseasPolicyLink>
                  {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.accountPolicySuffix` })}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 text-ui-base leading-6 text-foreground-subtle`}>
              <button
                type={`button`}
                role={`checkbox`}
                aria-checked={termsAccepted}
                onClick={() => setTermsAccepted((prev) => !prev)}
                className={`flex size-5 shrink-0 items-center justify-center`}
              >
                <span
                  className={
                    termsAccepted
                      ? `flex size-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground`
                      : `flex size-4 items-center justify-center rounded-sm border border-border bg-background text-transparent`
                  }
                >
                  <CheckIcon className={`size-3.5`} />
                </span>
              </button>
              <span className={`min-w-0 flex-1`}>
                {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.authorizationPrefix` })}
                <OverseasPolicyLink href={ZAI_SUBSCRIPTION_TERMS_URL}>
                  {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.authorizationTermsLink` })}
                </OverseasPolicyLink>
                {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.authorizationSuffix` })}
              </span>
            </div>
          </>
        )}
        {state?.error ? (
          <div className={`rounded-md border border-destructive/30 bg-destructive/10 p-3 text-ui-base text-foreground`}>
            {productErrorMessageOf(state.error, intl)}
          </div>
        ) : null}
        <Button type={`button`} size={`lg`} className={`h-10 w-full rounded-full text-ui-base`} disabled={confirmDisabled} onClick={handlePay}>
          {isBusy ? <Spinner className={`size-3.5 animate-spin`} /> : null}
          {payLabel}
        </Button>
        {selectedCardId ? null : (
          <p className={`text-center text-ui-base text-warning`}>
            {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.addCardBeforeConfirm` })}
          </p>
        )}
      </div>
    ),
    addCardDialog = (
      <StripeCardManageDialog
        open={!!(state && addCardOpen)}
        busy={isBusy}
        binding={isBinding}
        stripePromise={stripePromise}
        cards={cards}
        selectedCardId={selectedCardId}
        loadingCards={loadingCards}
        localError={localError}
        onClose={() => setAddCardOpen(!1)}
        onRefreshCards={loadCards}
        onSelectCard={(card) => {
          (setSelectedCardId(card.paymentMethodId), setAddCardOpen(!1));
        }}
        onBindStripePaymentMethod={onBindStripePaymentMethod}
        onUnbindStripeCard={onUnbindStripeCard}
      />
    );
  return (
    <>
      {embedded ? null : (
        <DialogRoot open={!!state} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent showCloseButton={false} className={`flex h-[calc(100vh-8rem)] max-h-160 max-w-3xl flex-col overflow-hidden rounded-2xl gap-0 p-0`}>
            <DialogHeader className={`flex-row items-center justify-between gap-4 border-b border-border px-4 py-3`}>
              <DialogTitle className={`min-w-0 text-ui-lg font-medium leading-6 text-foreground`}>
                {intl.formatMessage(
                  { id: `settings.modelProvider.codingPlan.overseasPayment.title` },
                  { product: productTitle },
                )}
              </DialogTitle>
              <DialogClose asChild>
                <Button
                  type={`button`}
                  variant={`ghost`}
                  size={`icon-sm`}
                  aria-label={intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.close` })}
                  className={`shrink-0 hover:bg-surface-hover`}
                >
                  <CloseIcon className={`size-4`} />
                </Button>
              </DialogClose>
            </DialogHeader>
            {body}
          </DialogContent>
        </DialogRoot>
      )}
      {embedded ? body : null}
      {addCardDialog}
    </>
  );
}
/** 原 X7e（82160 区）：支付方式选项行（radio 风格） */
export function PaymentMethodOptionRow({
  disabled,
  selected,
  trailing,
  onClick,
  children,
}: {
  disabled?: boolean;
  selected?: boolean;
  trailing?: React.ReactNode;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      role={`button`}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={onClick}
      onKeyDown={(event) => {
        disabled || ((event.key === `Enter` || event.key === ` `) && (event.preventDefault(), onClick()));
      }}
      className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-border-hover hover:bg-hover ${disabled ? `pointer-events-none opacity-50` : `cursor-pointer`}`}
    >
      <span className={`flex min-w-0 flex-wrap items-center gap-3`}>
        <span
          className={
            selected
              ? `flex size-4 shrink-0 items-center justify-center rounded-full border border-primary bg-primary`
              : `flex size-4 shrink-0 items-center justify-center rounded-full border border-border bg-background`
          }
        >
          {selected ? <span className={`size-2 rounded-full bg-primary-foreground`} /> : null}
        </span>
        {children}
      </span>
      {trailing ? <span className={`shrink-0`}>{trailing}</span> : null}
    </div>
  );
}
/** 原 Z7e（82196 区）：已选卡/品牌占位标签 */
export function CardBrandLabel({ card }: { card: any }) {
  let { intl } = useZCodeIntl();
  return card ? (
    <>
      <CardBrandImage brand={card.brand} label={card.brand || `Card`} />
      <span className={`min-w-0`}>
        <span className={`block truncate font-medium text-foreground`}>{[`****`, card.last4 || `----`]}</span>
        <span className={`block text-ui-base text-foreground-subtle`}>
          {intl.formatMessage(
            { id: `settings.modelProvider.codingPlan.overseasPayment.cardExpires` },
            {
              month: card.expMonth ? String(card.expMonth) : `--`,
              year: card.expYear ? String(card.expYear) : `----`,
            },
          )}
        </span>
      </span>
    </>
  ) : (
    <>
      <CardBrandImage brand={`visa`} label={`Visa`} />
      <CardBrandImage brand={`mastercard`} label={`Mastercard`} />
      <CardBrandImage brand={`amex`} label={`American Express`} />
      <CardBrandImage brand={`jcb`} label={`JCB`} />
      <CardBrandImage brand={`unionpay`} label={`UnionPay`} />
      <span className={`font-medium text-foreground`}>
        {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.cardPayment` })}
      </span>
    </>
  );
}
/** 原 eY（82246 区）：品牌图或文字徽标 */
export function CardBrandImage({ brand, label }: { brand: string; label: string }) {
  let src = cardBrandImageOf(brand);
  return src ? (
    <img src={src} alt={label} className={`h-8 object-contain`} />
  ) : (
    <span className={`rounded-md border border-border bg-surface px-2 py-1 text-ui-xs font-semibold text-foreground`}>{label}</span>
  );
}
/** 原 Q7e（82256 区）：品牌键归一查表 */
export function cardBrandImageOf(brand: string): string | null {
  let key = (brand ?? ``)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ``);
  return key ? (CARD_BRAND_IMAGES[key] ?? null) : null;
}

/** 原 $7e（82266 区）：卡管理对话框（已存卡列表+绑卡表单） */
export function StripeCardManageDialog({
  open,
  busy,
  binding,
  stripePromise,
  cards,
  selectedCardId,
  loadingCards,
  localError,
  onClose,
  onRefreshCards,
  onSelectCard,
  onBindStripePaymentMethod,
  onUnbindStripeCard,
}: {
  open: boolean;
  busy: boolean;
  binding: boolean;
  stripePromise: Promise<any> | null;
  cards: any[];
  selectedCardId: string | null;
  loadingCards: boolean;
  localError: string | null;
  onClose: () => void;
  onRefreshCards: () => void;
  onSelectCard: (card: any) => void;
  onBindStripePaymentMethod: (paymentMethodId: string) => Promise<any>;
  onUnbindStripeCard: (paymentMethodId: string) => Promise<void>;
}) {
  let { intl } = useZCodeIntl();
  return (
    (React.useEffect(() => {
      open && onRefreshCards();
    }, [open]),
    (
      <DialogRoot open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent showCloseButton={false} className={`flex h-[calc(100vh-8rem)] max-h-160 max-w-2xl flex-col overflow-hidden rounded-2xl gap-0 p-0`}>
          <DialogHeader className={`flex-row items-center justify-between gap-4 p-6 pb-0`}>
            <DialogTitle className={`text-ui-lg font-medium text-foreground`}>
              {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.cardPayment` })}
            </DialogTitle>
            <DialogClose asChild>
              <Button
                type={`button`}
                variant={`ghost`}
                size={`icon-lg`}
                aria-label={intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.close` })}
                className={`shrink-0 rounded-xl hover:bg-surface-hover`}
              >
                <CloseIcon className={`size-4`} />
              </Button>
            </DialogClose>
          </DialogHeader>
          {stripePromise ? (
            <StripeElementsProvider stripe={stripePromise}>
              <div className={`min-h-0 flex-1 space-y-4 overflow-y-auto p-6 pt-4`}>
                {localError ? <div className={`rounded-md border border-destructive/30 bg-destructive/10 p-2 text-ui-base text-foreground`}>{localError}</div> : null}
                <section className={`overflow-hidden rounded-xl border border-border bg-card`}>
                  <div className={`flex items-center justify-between gap-2 border-b border-border px-4 py-3`}>
                    <span className={`text-ui-base font-medium text-foreground`}>
                      {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.savedCards` })}
                    </span>
                    <Button type={`button`} variant={`ghost`} size={`sm`} disabled={loadingCards || busy} onClick={() => void onRefreshCards()}>
                      {loadingCards ? <Spinner className={`size-3.5 animate-spin`} /> : null}
                      {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.refreshCards` })}
                    </Button>
                  </div>
                  {cards.length > 0 ? (
                    <div className={`space-y-2 p-3`}>
                      {cards.map((card) => (
                        <SavedCardRow
                          key={card.paymentMethodId}
                          card={card}
                          selected={card.paymentMethodId === selectedCardId}
                          busy={busy}
                          onUnbind={async () => {
                            (await onUnbindStripeCard(card.paymentMethodId), await onRefreshCards());
                          }}
                          onSelect={() => onSelectCard(card)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={`px-4 py-5 text-ui-base text-foreground-subtle`}>
                      {loadingCards
                        ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.cardsLoading` })
                        : intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.noSavedCards` })}
                    </div>
                  )}
                </section>
                <AddStripeCardForm
                  busy={busy}
                  binding={binding}
                  onBindStripePaymentMethod={onBindStripePaymentMethod}
                  onCardSaved={async (card) => {
                    (await onRefreshCards(), onSelectCard(card));
                  }}
                />
              </div>
            </StripeElementsProvider>
          ) : (
            <div className={`min-h-0 flex-1 overflow-y-auto p-4`}>
              <div className={`rounded-md border border-border bg-surface p-3 text-ui-base text-foreground-subtle`}>
                {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.stripePublishableKeyMissing` })}
              </div>
            </div>
          )}
        </DialogContent>
      </DialogRoot>
    ))
  );
}
/** 原 e9e（82382 区）：已存卡行（选择+解绑） */
export function SavedCardRow({
  card,
  selected,
  busy,
  onUnbind,
  onSelect,
}: {
  card: any;
  selected: boolean;
  busy: boolean;
  onUnbind: () => Promise<void>;
  onSelect: () => void;
}) {
  let { intl } = useZCodeIntl(),
    [action, setAction] = React.useState<string | null>(null),
    [rowError, setRowError] = React.useState<string | null>(null);
  return (
    <div className={`space-y-2 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-surface-hover/50`}>
      <div className={`flex items-center justify-between gap-3`}>
        <button type={`button`} className={`flex min-w-0 flex-1 items-center gap-3 text-left`} onClick={onSelect}>
          <span
            className={
              selected
                ? `flex size-4 shrink-0 items-center justify-center rounded-full border border-primary bg-primary`
                : `flex size-4 shrink-0 items-center justify-center rounded-full border border-border bg-background`
            }
          >
            {selected ? <span className={`size-2 rounded-full bg-primary-foreground`} /> : null}
          </span>
          <CardBrandImage brand={card.brand} label={card.brand || `Card`} />
          <div className={`min-w-0`}>
            <div className={`text-ui-base font-medium text-foreground`}>{[`**** `, card.last4 || `----`]}</div>
            <div className={`text-ui-base text-foreground-subtle`}>
              {intl.formatMessage(
                { id: `settings.modelProvider.codingPlan.overseasPayment.cardExpires` },
                {
                  month: card.expMonth ? String(card.expMonth) : `--`,
                  year: card.expYear ? String(card.expYear) : `----`,
                },
              )}
            </div>
          </div>
        </button>
        <div className={`flex shrink-0 items-center gap-2`}>
          <Button
            type={`button`}
            variant={`ghost`}
            size={`icon-lg`}
            className={`rounded-xl`}
            aria-label={intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.deleteCard` })}
            disabled={busy || !!action}
            onClick={async () => {
              (setRowError(null), setAction(`delete`));
              try {
                await onUnbind();
              } catch (error) {
                setRowError(error instanceof Error ? error.message : String(error));
              } finally {
                setAction(null);
              }
            }}
          >
            {action === `delete` ? <Spinner className={`size-3.5 animate-spin`} /> : <TrashIcon className={`size-3.5`} />}
          </Button>
        </div>
      </div>
      {rowError ? <div className={`text-ui-base text-destructive`}>{rowError}</div> : null}
    </div>
  );
}
/** 原 t9e（82467 区）：绑卡表单（Stripe Elements + 账单地址） */
export function AddStripeCardForm({
  busy,
  binding,
  onBindStripePaymentMethod,
  onCardSaved,
}: {
  busy: boolean;
  binding: boolean;
  onBindStripePaymentMethod: (paymentMethodId: string) => Promise<any>;
  onCardSaved: (card: any) => Promise<void>;
}) {
  let stripe = useStripe(),
    elements = useElements(),
    { intl } = useZCodeIntl(),
    theme = useAppStore((state: any) => state.theme),
    elementOptions = React.useMemo(() => stripeElementAppearanceOf(theme === `dark` || theme === `zai-dark`), [theme]),
    [name, setName] = React.useState(``),
    [country, setCountry] = React.useState(``),
    [line1, setLine1] = React.useState(``),
    [city, setCity] = React.useState(``),
    [postalCode, setPostalCode] = React.useState(``),
    [formError, setFormError] = React.useState<string | null>(null),
    submitting = busy || binding;
  async function handleSubmit(event: React.FormEvent) {
    if ((event.preventDefault(), setFormError(null), !stripe || !elements)) {
      setFormError(
        intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.stripeNotReady` }),
      );
      return;
    }
    let cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setFormError(
        intl.formatMessage({
          id: `settings.modelProvider.codingPlan.overseasPayment.cardElementMissing`,
        }),
      );
      return;
    }
    if (!country) {
      setFormError(
        intl.formatMessage({
          id: `settings.modelProvider.codingPlan.overseasPayment.countryRequired`,
        }),
      );
      return;
    }
    let result = await stripe.createPaymentMethod({
      type: `card`,
      card: cardElement,
      billing_details: {
        name: name.trim() || void 0,
        address: {
          country,
          line1: line1.trim() || void 0,
          city: city.trim() || void 0,
          postal_code: postalCode.trim() || void 0,
        },
      },
    });
    if (result.error || !result.paymentMethod?.id) {
      setFormError(
        result.error?.message ??
          intl.formatMessage({
            id: `settings.modelProvider.codingPlan.overseasPayment.stripePaymentMethodFailed`,
          }),
      );
      return;
    }
    try {
      let bound = await onBindStripePaymentMethod(result.paymentMethod.id);
      if (bound.requiresAction && bound.clientSecret) {
        let confirmed = await stripe.confirmCardSetup(bound.clientSecret);
        if (confirmed.error)
          throw Error(
            confirmed.error.message ??
              intl.formatMessage({
                id: `settings.modelProvider.codingPlan.overseasPayment.stripe3dsFailed`,
              }),
          );
      }
      await onCardSaved({ ...bound, paymentMethodId: bound.paymentMethodId || result.paymentMethod.id });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : String(error));
    }
  }
  return (
    <form className={`space-y-4 rounded-xl border border-border bg-card p-4`} onSubmit={handleSubmit}>
      <div className={`flex flex-wrap items-center justify-between gap-3`}>
        <div className={`text-ui-base font-medium text-foreground`}>
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.addCard` })}
        </div>
        <CardBrandRow />
      </div>
      {formError ? <div className={`rounded-md border border-destructive/30 bg-destructive/10 p-2 text-ui-base text-foreground`}>{formError}</div> : null}
      <div className={`space-y-2`}>
        <FieldLabel required>
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.cardInformation` })}
        </FieldLabel>
        <div className={`grid overflow-hidden rounded-lg border border-input-border bg-input transition-colors hover:border-input-border-hover focus-within:border-input-border-focused focus-within:bg-input-focused grid-cols-[minmax(0,1fr)_7rem_6rem]`}>
          <div className={`px-3 py-3`}>
            <CardNumberElement options={elementOptions} />
          </div>
          <div className={`border-t border-input-border px-3 py-3 border-l border-t-0`}>
            <CardExpiryElement options={elementOptions} />
          </div>
          <div className={`border-t border-input-border px-3 py-3 border-l border-t-0`}>
            <CardCvcElement options={elementOptions} />
          </div>
        </div>
      </div>
      <div className={`space-y-2`}>
        <FieldLabel required>
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.nameOnCard` })}
        </FieldLabel>
        <BillingTextInput
          value={name}
          onChange={setName}
          placeholder={intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.nameOnCard` })}
        />
      </div>
      <div className={`space-y-2`}>
        <FieldLabel required>
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.billingAddress` })}
        </FieldLabel>
        <CountrySelect value={country} onChange={setCountry} />
        <BillingTextInput
          value={line1}
          onChange={setLine1}
          placeholder={intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.addressLine1` })}
        />
        <div className={`grid grid-cols-2 gap-2`}>
          <BillingTextInput
            value={city}
            onChange={setCity}
            placeholder={intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.city` })}
          />
          <BillingTextInput
            value={postalCode}
            onChange={setPostalCode}
            placeholder={intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.postalCode` })}
          />
        </div>
      </div>
      <Button type={`submit`} disabled={submitting || !stripe} className={`h-10 w-full rounded-full text-ui-base`}>
        {binding ? <Spinner className={`size-3.5 animate-spin`} /> : null}
        {intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.saveCard` })}
      </Button>
    </form>
  );
}
/** 原 tY（82601 区）：字段标签（* 必填前缀） */
export function FieldLabel({ required = !1, children }: { required?: boolean; children?: React.ReactNode }) {
  return (
    <label className={`block text-ui-base font-medium text-foreground`}>
      {required ? <span className={`text-destructive`}>{`* `}</span> : null}
      {children}
    </label>
  );
}
/** 原 nY（82608 区）：账单文本输入 */
export function BillingTextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`h-10 w-full rounded-lg border border-input-border bg-input px-3 text-ui-base text-foreground outline-none placeholder:text-foreground-subtlest focus:border-input-border-focused focus:bg-input-focused`}
    />
  );
}
/** 原 n9e（82622 区）：国家选择 */
export function CountrySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  let { intl } = useZCodeIntl();
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-10 w-full rounded-lg border border-input-border bg-input px-3 text-ui-base text-foreground outline-none focus:border-input-border-focused focus:bg-input-focused`}
    >
      {COUNTRY_OPTIONS.map(([code, label]) => (
        <option key={code || `placeholder`} value={code}>
          {code ? `${label} (${code})` : intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.country` })}
        </option>
      ))}
    </select>
  );
}
/** 原 r9e（82645 区）：支持卡品牌行 */
export function CardBrandRow() {
  return (
    <div className={`flex items-center gap-1.5`}>
      <CardBrandImage brand={`visa`} label={`Visa`} />
      <CardBrandImage brand={`mastercard`} label={`Mastercard`} />
      <CardBrandImage brand={`amex`} label={`American Express`} />
      <CardBrandImage brand={`jcb`} label={`JCB`} />
      <CardBrandImage brand={`unionpay`} label={`UnionPay`} />
    </div>
  );
}
/** 原 rY（82660 区）：海外政策外链 */
export function OverseasPolicyLink({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <a href={href} target={`_blank`} rel={`noreferrer`} className={`text-primary underline-offset-3 hover:underline`}>
      {children}
    </a>
  );
}
/** 原 i9e（82670 区）：原始周期（priceUnit → 包名正则） */
export function rawPeriodOfProduct(product: any): string {
  let unit = product?.priceUnit;
  if (unit) return unit;
  let pack = product?.relateResourcePack ?? ``;
  return /包年|-\s*年|year/i.test(pack)
    ? `year`
    : /包季|-\s*季|quarter/i.test(pack)
      ? `quarter`
      : `month`;
}
/** 原 a9e（82682 区）：Stripe publishable key（env 优先，回退内嵌 live key） */
export function stripePublishableKeyOf(): string | null {
  let value = ({
    BASE_URL: `./`,
    DEV: !1,
    MODE: `production`,
    PROD: !0,
    SSR: !1,
    VITE_ZCODE_BASE_URL: `https://zcode.z.ai`,
    VITE_ZCODE_E2E_STORE_BRIDGE: ``,
    VITE_ZCODE_ENDPOINT_ORIGIN: `https://zcode.z.ai`,
  } as Record<string, unknown>).VITE_ZAI_STRIPE_PUBLISHABLE_KEY as unknown as string | undefined;
  return typeof value == `string` && value.trim() ? value.trim() : STRIPE_LIVE_PUBLISHABLE_KEY;
}
/** 原 o9e（82696 区）：购买尝试 id */
export function purchaseAttemptIdOf(): string {
  return globalThis.crypto?.randomUUID?.() ?? fallbackAttemptId();
}
/** 原 iY（82699 区）：个人购买漏斗快照 */
export function personalFunnelSnapshotOf({
  providerId,
  product,
  preview,
  locale = `en-US`,
  now = Date.now(),
  paymentMethod,
  funnelContext,
}: {
  providerId: string;
  product: any;
  preview: any;
  locale?: string;
  now?: number;
  paymentMethod?: string;
  funnelContext?: any;
}) {
  let family = providerFamilyOf(providerId),
    period = billingPeriodKeyOf(periodOfProduct({ ...product, ...preview }));
  return {
    purchaseAttemptId: purchaseAttemptIdOf(),
    purchaseFunnelId: funnelContext?.purchaseFunnelId ?? ``,
    upgradeSource: funnelContext?.upgradeSource ?? ``,
    purchaseStartAt: now,
    entryPlanStatus: funnelContext?.entryPlanStatus ?? ``,
    entryPlanLevel: funnelContext?.entryPlanLevel ?? ``,
    purchaseAudience: `personal`,
    providerFamily: family,
    channel: channelOfFamily(family),
    productId: product.productId || preview.productId || ``,
    productName: funnelProductNameOf(product, preview, period, locale),
    planTier: personalTierOf(product.productName ?? preview.productName ?? product.productId),
    billingPeriod: period,
    purchaseMethod: `continuous`,
    paymentMethod: paymentMethod ?? defaultPaymentMethodOf(family),
    seatCount: ``,
    durationMonths: ``,
    currency: stringFieldOf(preview.priceCurrency ?? product.priceCurrency),
    cashAmount: amountFieldOf(preview.cashAmount),
    giveAmount: amountFieldOf(preview.giveAmount),
    thirdPartyAmount: amountFieldOf(preview.thirdPartyAmount),
    refundAmount: amountFieldOf(preview.refundAmount),
    residualAmount: amountFieldOf(preview.residualAmount),
    totalOriginalAmount: ``,
    campaignDiscountAmount: ``,
    totalPayAmount: ``,
    bizId: preview.bizId,
    orderNo: ``,
  };
}
/** 原 s9e（82745 区）：团队/企业购买漏斗快照 */
export function teamFunnelSnapshotOf({
  productId,
  productName,
  tier,
  subscribePeriod,
  subscribeMode,
  seatCount,
  duration,
  cashAmount,
  giveAmount,
  thirdPartyAmount,
  totalOriginalAmount,
  campaignDiscountAmount,
  totalPayAmount,
  orderNo = ``,
  now = Date.now(),
  funnelContext,
}: {
  productId: string;
  productName: string;
  tier: string;
  subscribePeriod: string;
  subscribeMode: string;
  seatCount: number;
  duration: number;
  cashAmount?: number;
  giveAmount?: number;
  thirdPartyAmount?: number;
  totalOriginalAmount?: number;
  campaignDiscountAmount?: number;
  totalPayAmount?: number;
  orderNo?: string;
  now?: number;
  funnelContext?: any;
}) {
  let method = purchaseMethodOf(subscribeMode);
  return {
    purchaseAttemptId: purchaseAttemptIdOf(),
    purchaseFunnelId: funnelContext?.purchaseFunnelId ?? ``,
    upgradeSource: funnelContext?.upgradeSource ?? ``,
    purchaseStartAt: now,
    entryPlanStatus: funnelContext?.entryPlanStatus ?? ``,
    entryPlanLevel: funnelContext?.entryPlanLevel ?? ``,
    purchaseAudience: `team`,
    providerFamily: `bigmodel`,
    channel: `MaaS`,
    productId,
    productName,
    planTier: teamTierOf(tier),
    billingPeriod: enterprisePeriodOf(subscribePeriod),
    purchaseMethod: method,
    paymentMethod: `alipay`,
    seatCount: String(Math.max(0, Math.round(seatCount))),
    durationMonths: method === `one_time` ? String(Math.max(0, Math.round(duration))) : ``,
    currency: `CNY`,
    cashAmount: amountFieldOf(cashAmount),
    giveAmount: amountFieldOf(giveAmount),
    thirdPartyAmount: amountFieldOf(thirdPartyAmount),
    refundAmount: ``,
    residualAmount: ``,
    totalOriginalAmount: amountFieldOf(totalOriginalAmount),
    campaignDiscountAmount: amountFieldOf(campaignDiscountAmount),
    totalPayAmount: amountFieldOf(totalPayAmount),
    bizId: ``,
    orderNo,
  };
}
/** 原 c9e（82796 区） */
export function funnelWithOrderNoOf(snapshot: any, orderNo: string) {
  return { ...snapshot, orderNo };
}
/** 原 l9e（82799 区）：漏斗 ck 事件 */
export function funnelClickEventOf(snapshot: any) {
  return {
    eventType: `ck`,
    eventRegion: `app.purchase`,
    elementName: `purchase_pay_ck`,
    eventExtraDetail: stringifyFunnelDetail(funnelDetailOf(snapshot)),
  };
}
/** 原 u9e（82806 区）：漏斗 result 事件 */
export function funnelResultEventOf(snapshot: any, outcome: any) {
  return {
    eventType: `result`,
    eventRegion: `app.purchase`,
    elementName: `purchase_result`,
    eventExtraDetail: stringifyFunnelDetail({
      ...funnelDetailOf({ ...snapshot, bizId: outcome.bizId ?? snapshot.bizId, orderNo: outcome.orderNo ?? snapshot.orderNo }),
      failure_stage: outcome.failureStage ?? ``,
      error_code: outcome.errorCode ?? ``,
      error_message: sanitizeFunnelErrorMessage(outcome.errorMessage),
      order_status: stringFieldOf(outcome.orderStatus),
      biz_id: outcome.bizId ?? snapshot.bizId,
      order_no: outcome.orderNo ?? snapshot.orderNo,
      elapsed_ms: Math.max(0, Math.round((outcome.endedAt ?? Date.now()) - snapshot.purchaseStartAt)),
    }),
  };
}
/** 原 aY（82826 区） */
export function trackFunnelClick(service: any, snapshot: any) {
  service && trackTelemetry(service, funnelClickEventOf(snapshot), `codingPlanPurchaseTelemetry`);
}
/** 原 oY（82829 区） */
export function trackFunnelResult(service: any, snapshot: any, outcome: any) {
  !service || !snapshot || trackTelemetry(service, funnelResultEventOf(snapshot, outcome), `codingPlanPurchaseTelemetry`);
}
/** 原 sY（82832 区）：轮询终态结果归一 */
export function orderOutcomeOf(status: string) {
  let normalized = normalizeOrderStatus(status);
  return isTerminalOrderStatus(normalized)
    ? {
        orderStatus: normalized,
        errorCode: normalized === `CANCELLED` ? `payment_status_cancelled` : `payment_status_failed`,
        failureStage: `terminal_status`,
        errorMessage: `payment terminal status failed`,
      }
    : { orderStatus: normalized || `SUCCESS`, errorCode: ``, failureStage: ``, errorMessage: `` };
}
/** 原 cY（82843 区）：企业终态结果归一 */
export function enterpriseTerminalOutcomeOf(status: string) {
  let normalized = normalizeOrderStatus(status);
  if (normalized === `SUCCESS`)
    return { orderStatus: `SUCCESS`, errorCode: ``, failureStage: ``, errorMessage: `` };
  let code =
    {
      CANCELLED: `payment_status_cancelled`,
      CLOSED: `payment_status_closed`,
      FAIL: `payment_status_failed`,
    }[normalized] ?? `payment_status_failed`;
  return normalized === `CLOSED` || normalized === `CANCELLED`
    ? outcomeOf(code, `terminal_status`, `payment terminal status ${normalized.toLowerCase()}`, normalized)
    : outcomeOf(code, `terminal_status`, `payment terminal status failed`);
}
/** 原 lY（82856 区） */
export function outcomeOf(errorCode: string, failureStage: string, errorMessage: string, orderStatus = `FAIL`) {
  return { orderStatus, errorCode, failureStage, errorMessage };
}
/** 原 uY（82859 区） */
export function timeoutOutcome() {
  return outcomeOf(`payment_check_timeout`, `timeout`, `payment polling timeout`, `TIMEOUT`);
}
/** 原 dY（82862 区） */
export function cancelledOutcome() {
  return outcomeOf(`user_cancelled`, `user_cancel`, `user cancelled purchase`, `CANCELLED`);
}
/** 原 d9e（82865 区）：漏斗明细字段映射 */
export function funnelDetailOf(snapshot: any) {
  return stringifyFunnelDetail({
    purchase_attempt_id: snapshot.purchaseAttemptId,
    purchase_funnel_id: snapshot.purchaseFunnelId,
    upgrade_source: snapshot.upgradeSource,
    entry_plan_status: snapshot.entryPlanStatus,
    entry_plan_level: snapshot.entryPlanLevel,
    purchase_audience: snapshot.purchaseAudience,
    provider_family: snapshot.providerFamily,
    channel: snapshot.channel,
    product_id: snapshot.productId,
    product_name: snapshot.productName,
    plan_tier: snapshot.planTier,
    billing_period: snapshot.billingPeriod,
    purchase_method: snapshot.purchaseMethod,
    payment_method: snapshot.paymentMethod,
    seat_count: snapshot.seatCount,
    duration_months: snapshot.durationMonths,
    currency: snapshot.currency,
    cashAmount: snapshot.cashAmount,
    giveAmount: snapshot.giveAmount,
    thirdPartyAmount: snapshot.thirdPartyAmount,
    refundAmount: snapshot.refundAmount,
    residualAmount: snapshot.residualAmount,
    totalOriginalAmount: snapshot.totalOriginalAmount,
    campaignDiscountAmount: snapshot.campaignDiscountAmount,
    totalPayAmount: snapshot.totalPayAmount,
  });
}
/** 原 f9e（82896 区）：漏斗产品名（标题 / 周期标签） */
export function funnelProductNameOf(product: any, preview: any, period: string, locale: string): string {
  let title = productTitleOf(preview.productName ? preview : product),
    periodLabel = funnelPeriodLabelOf(period, locale);
  return periodLabel ? `${title} / ${periodLabel}` : title;
}
/** 原 p9e（82901 区） */
export function funnelPeriodLabelOf(period: string, locale: string): string {
  return period === `unknown`
    ? ``
    : locale.toLowerCase().startsWith(`zh`)
      ? ({ month: `月`, quarter: `季`, year: `年` } as Record<string, string>)[period]
      : period;
}
/** 原 m9e（82908 区）：明细值字符串化 */
export function stringifyFunnelDetail(detail: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(detail).map(([key, value]) => [key, stringFieldOf(value)]));
}
/** 原 h9e（82911 区）：供应商族归一 */
export function providerFamilyOf(providerId: string): string {
  return providerId === `bigmodel` ||
    providerId === PROVIDER_IDS.bigmodel ||
    providerId === PROVIDER_IDS.bigmodelCodingPlan ||
    providerId === PROVIDER_IDS.bigmodelStartPlan
    ? `bigmodel`
    : providerId === `zai` || providerId === PROVIDER_IDS.zai || isOAuthFamilyProvider(providerId)
      ? `zai`
      : `unknown`;
}
/** 原 g9e（82921 区） */
export function channelOfFamily(family: string): string {
  return ({ bigmodel: `MaaS`, zai: `Z_AI`, unknown: `` } as Record<string, string>)[family];
}
/** 原 _9e（82924 区） */
export function defaultPaymentMethodOf(family: string): string {
  return family === `bigmodel` ? `alipay` : `unknown`;
}
/** 原 v9e（82927 区）：个人档 tier */
export function personalTierOf(name: string): string {
  let slug = slugOf(name);
  for (let tier of [`lite`, `pro`, `max`]) if (slug.includes(tier)) return tier;
  return slug || `unknown`;
}
/** 原 y9e（82932 区）：团队档 tier */
export function teamTierOf(tier: string): string {
  let slug = slugOf(tier);
  return slug.includes(`max`) || slug.includes(`advanced`)
    ? `team_advanced`
    : slug.includes(`pro`) || slug.includes(`standard`)
      ? `team_standard`
      : slug
        ? `team_${slug}`
        : `unknown`;
}
/** 原 b9e（82940 区） */
export function billingPeriodKeyOf(period: string): string {
  return ({ monthly: `month`, quarterly: `quarter`, yearly: `year` } as Record<string, string>)[period] ?? `unknown`;
}
/** 原 x9e（82943 区） */
export function enterprisePeriodOf(period: string): string {
  let slug = slugOf(period);
  return slug.includes(`month`)
    ? `month`
    : slug.includes(`quarter`)
      ? `quarter`
      : slug.includes(`year`)
        ? `year`
        : `unknown`;
}
/** 原 S9e（82952 区） */
export function purchaseMethodOf(mode: string): string {
  let slug = slugOf(mode);
  return slug === `continuous` || slug === `one_time` ? slug : `unknown`;
}
/** 原 C9e（82957 区）：订单状态归一 */
export function normalizeOrderStatus(status: string): string {
  let raw = status.trim(),
    upper = raw.toUpperCase();
  return upper.includes(`SUCCESS`) ||
    upper.includes(`SUCCEED`) ||
    upper.includes(`PAID`) ||
    upper.includes(`COMPLETE`) ||
    raw.includes(`成功`) ||
    raw.includes(`已支付`)
    ? `SUCCESS`
    : upper.includes(`CLOSED`)
      ? `CLOSED`
      : upper.includes(`CANCEL`) || raw.includes(`取消`)
        ? `CANCELLED`
        : upper.includes(`FAIL`) || raw.includes(`失败`)
          ? `FAIL`
          : raw;
}
/** 原 w9e（82972 区） */
export function isTerminalOrderStatus(status: string): boolean {
  return status === `FAIL` || status === `CANCELLED` || status === `CLOSED`;
}
/** 原 fY（82975 区）：金额字段两位小数字符串 */
export function amountFieldOf(value: unknown): string {
  return typeof value != `number` || !Number.isFinite(value) ? `` : value.toFixed(2);
}
/** 原 T9e（82978 区）：漏斗错误文案脱敏 */
export function sanitizeFunnelErrorMessage(message: unknown): string {
  let cleaned = stringFieldOf(message).replace(/\s+/g, ` `).trim();
  return cleaned
    ? /<(?:html|body|script|form|!doctype)\b/i.test(cleaned)
      ? `unsafe error payload`
      : /token|authorization|alipays?:\/\/|payurl|card|password/i.test(cleaned)
        ? `sensitive error redacted`
        : cleaned.slice(0, 160)
    : ``;
}
/** 原 pY（82987 区） */
export function stringFieldOf(value: unknown): string {
  return value == null ? `` : String(value);
}
/** 原 mY（82990 区）：slug 归一 */
export function slugOf(value: string): string {
  return (value ?? ``)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, `_`)
    .replace(/^_+|_+$/g, ``);
}
/** 原 E9e（82997 区）：randomUUID 回退 id */
export function fallbackAttemptId(): string {
  return (
    logger.warn(`[codingPlanPurchaseTelemetry] crypto.randomUUID unavailable, using fallback id`),
    `purchase_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
}

/** 原 D9e…hY（83105–83108）：腾讯验证码脚本/默认 appId/宿主选择器 */
const TCAPTCHA_SCRIPT_URL = `https://turing.captcha.qcloud.com/TCaptcha.js`;
const DEFAULT_CAPTCHA_APP_ID = `196026326`;
const TCAPTCHA_HOST_SELECTORS = [`.tcaptcha-transform`, `[id^='tcaptcha']`, `iframe[src*='captcha.qcloud.com']`].join(`,`);
let captchaScriptPromise: Promise<void> | null = null; // hY
/** 原 A9e（83109 区）：触发腾讯验证码并取 ticket/randstr */
export async function runSecurityCaptcha(providerId: string): Promise<{ ticket: string; randstr: string }> {
  let appId = captchaAppIdOf(providerId);
  if (!appId) throw Error(`coding_plan_security_verification_unconfigured`);
  return (
    await ensureCaptchaScript(),
    new Promise((resolve, reject) => {
      let Ctor = (window as any).TencentCaptcha;
      if (!Ctor) {
        reject(Error(`coding_plan_security_verification_unavailable`));
        return;
      }
      let instance: any = null,
        restorePointerEvents = captchaPointerEventsGuard(),
        cleanup = () => {
          (restorePointerEvents(), instance?.destroy?.());
        };
      try {
        ((instance = new Ctor(
          appId,
          (result: any) => {
            if ((cleanup(), result.ret === 0 && result.ticket && result.randstr)) {
              resolve({ ticket: result.ticket, randstr: result.randstr });
              return;
            }
            if (result.ret === 2) {
              reject(Error(`coding_plan_security_verification_cancelled`));
              return;
            }
            reject(Error(`coding_plan_security_verification_failed`));
          },
          { mode: `bind`, type: `popup`, enableDarkMode: !1, timeout: 6e4 },
        )),
          instance.show());
      } catch (error) {
        (cleanup(), reject(error));
      }
    })
  );
}
/** 原 j9e（83146 区）：验证码宿主 pointer-events 修复守卫 */
export function captchaPointerEventsGuard(): () => void {
  if (typeof document > `u` || !document.body) return () => {};
  let restored = new Map<Element, string>(),
    stopped = !1,
    apply = () => {
      if (!stopped)
        for (let node of document.querySelectorAll(TCAPTCHA_HOST_SELECTORS))
          isStyleCapableElement(node) && (restored.has(node) || restored.set(node, (node as HTMLElement).style.pointerEvents), ((node as HTMLElement).style.pointerEvents = `auto`));
    },
    observer = typeof MutationObserver > `u` ? null : new MutationObserver(apply);
  return (
    observer?.observe(document.body, {
      attributes: !0,
      attributeFilter: [`class`, `id`, `src`, `style`],
      childList: !0,
      subtree: !0,
    }),
    apply(),
    () => {
      ((stopped = !0), observer?.disconnect());
      for (let [node, pointerEvents] of restored) (node as HTMLElement).style.pointerEvents = pointerEvents;
      restored.clear();
    }
  );
}
/** 原 M9e（83173 区）：验证码 appId 解析（window 注入 → env → 默认） */
export function captchaAppIdOf(providerId: string): string | null {
  let injected = typeof window > `u` ? void 0 : (window as any).__ZCODE_CODING_PLAN_CAPTCHA_APP_IDS__,
    byProvider = injected?.[providerId]?.trim();
  if (byProvider) return byProvider;
  let fallback = injected?.default?.trim();
  if (fallback) return fallback;
  let env = {
    BASE_URL: `./`,
    DEV: !1,
    MODE: `production`,
    PROD: !0,
    SSR: !1,
    VITE_ZCODE_BASE_URL: `https://zcode.z.ai`,
    VITE_ZCODE_E2E_STORE_BRIDGE: ``,
    VITE_ZCODE_ENDPOINT_ORIGIN: `https://zcode.z.ai`,
  };
  return (
    (isOAuthFamilyProvider(providerId)
      ? envStringOf(env, `VITE_ZAI_CODING_PLAN_CAPTCHA_APP_ID`)
      : envStringOf(env, `VITE_BIGMODEL_CODING_PLAN_CAPTCHA_APP_ID`)) ||
    envStringOf(env, `VITE_CODING_PLAN_CAPTCHA_APP_ID`) ||
    DEFAULT_CAPTCHA_APP_ID
  );
}
/** 原 N9e（83196 区）：验证码脚本懒加载 */
export function ensureCaptchaScript(): Promise<void> {
  return typeof window > `u` || typeof document > `u`
    ? Promise.reject(Error(`coding_plan_security_verification_unavailable`))
    : (window as any).TencentCaptcha
      ? Promise.resolve()
      : captchaScriptPromise ||
        ((captchaScriptPromise = new Promise((resolve, reject) => {
          let script = document.createElement(`script`);
          ((script.src = TCAPTCHA_SCRIPT_URL),
            (script.async = !0),
            (script.onload = () => {
              resolve();
            }),
            (script.onerror = () => {
              ((captchaScriptPromise = null), reject(Error(`coding_plan_security_verification_script_failed`)));
            }),
            document.head.appendChild(script));
        })),
        captchaScriptPromise);
}
/** 原 gY（83215 区） */
export function envStringOf(env: Record<string, unknown>, key: string): string | null {
  let value = env[key];
  return typeof value == `string` && value.trim() ? value.trim() : null;
}
/** 原 P9e（83218 区） */
export function isStyleCapableElement(node: unknown): boolean {
  return typeof HTMLElement > `u` ? `style` in (node as object) : node instanceof HTMLElement;
}
/** 原 F9e…V9e（83221–83231）：购买漏斗常量 */
const PAYMENT_POLL_INTERVAL_MS = 2e3; // F9e
const PAYMENT_POLL_ATTEMPTS = 60; // I9e
const PURCHASE_CANCELLED_MESSAGE = `coding_plan_purchase_cancelled`; // _Y
const PAYMENT_CHECK_TIMEOUT_CODE = `coding_plan_payment_check_timeout`; // vY
const PAYPAL_SETUP_REQUIRED_CODE = `coding_plan_paypal_setup_required`; // L9e
const PAYPAL_APPROVE_URL_MISSING_CODE = `coding_plan_paypal_approve_url_missing`; // R9e
const PAYPAL_UNSUPPORTED_CODE = `coding_plan_paypal_unsupported`; // z9e
const PAYPAL_SUBSCRIBE_FAILED_CODE = `coding_plan_paypal_subscribe_failed`; // yY
const STRIPE_ACTION_REQUIRED_CODE = `coding_plan_stripe_action_required`; // B9e
const PAYMENT_CALLBACK_SCHEME = `nofy://payment/callback`; // V9e
/** 原 H9e（83232 / jsx 72861 区）：useCodingPlanPurchase 个人购买漏斗 */
export function useCodingPlanPurchase({
  providerId,
  batchPreview,
  funnelContext,
  onComplete,
}: {
  providerId: string;
  batchPreview?: any;
  funnelContext?: any;
  onComplete?: () => void;
}) {
  let services = useServices(),
    platform = usePlatformBridge(),
    { locale } = useZCodeIntl(),
    subscriptionService = services?.codingPlanSubscriptionService,
    [purchasingProductId, setPurchasingProductId] = React.useState<string | null>(null),
    [securityVerificationLoading, setSecurityVerificationLoading] = React.useState(!1),
    [paymentPolling, setPaymentPolling] = React.useState(!1),
    [paymentExpired, setPaymentExpired] = React.useState(!1),
    [paymentDialog, setPaymentDialog] = React.useState<any>(null),
    [overseasPaymentDialog, setOverseasPaymentDialog] = React.useState<any>(null),
    [preparedPaymentPreview, setPreparedPaymentPreview] = React.useState<any>(null),
    [previewingProductId, setPreviewingProductId] = React.useState<string | null>(null),
    [error, setError] = React.useState<string | null>(null),
    abortRef = React.useRef<AbortController | null>(null),
    epochRef = React.useRef(0),
    funnelRef = React.useRef<any>(null),
    clearPreparedPaymentPreview = React.useCallback(() => {
      ((epochRef.current += 1), setPreparedPaymentPreview(null), setError(null));
    }, []),
    closePaymentDialog = React.useCallback(() => {
      (abortRef.current?.abort(PURCHASE_CANCELLED_MESSAGE), setPaymentDialog(null), setOverseasPaymentDialog(null), setPaymentExpired(!1));
    }, []),
    closeOverseasPaymentDialog = React.useCallback(() => {
      (trackFunnelResult(platform, funnelRef.current, cancelledOutcome()), (funnelRef.current = null), setOverseasPaymentDialog(null));
    }, [platform]),
    preparePaymentPreview = React.useCallback(
      async (product: any) => {
        if (!subscriptionService) return (setError(`service_unavailable`), null);
        let epoch = epochRef.current + 1;
        ((epochRef.current = epoch), setPreviewingProductId(product.productId), setPreparedPaymentPreview(null), setError(null), setPaymentDialog(null), setOverseasPaymentDialog(null), setPaymentExpired(!1));
        try {
          if ((await subscriptionService.checkPendingOrders({ providerId })).hasPendingOrders)
            throw Error(`coding_plan_has_pending_orders`);
          let preview = await previewWithSecurityVerification({
            service: subscriptionService,
            providerId,
            product,
            onSecurityVerificationStart: () => {
              setSecurityVerificationLoading(!0);
            },
            onSecurityVerificationEnd: () => {
              setSecurityVerificationLoading(!1);
            },
          });
          return (epochRef.current === epoch && setPreparedPaymentPreview({ product, preview }), preview);
        } catch (previewError) {
          let normalized = normalizeProductError(previewError);
          return (
            logger.warn(`[useCodingPlanPurchase] Coding Plan 支付试算失败`, {
              providerId,
              productId: product.productId,
              error: normalized,
            }),
            epochRef.current === epoch && setError(normalized),
            null
          );
        } finally {
          epochRef.current === epoch && setPreviewingProductId(null);
        }
      },
      [providerId, subscriptionService],
    ),
    purchase = React.useCallback(
      async (product: any, previewOverride?: any) => {
        if (!subscriptionService) {
          setError(`service_unavailable`);
          return;
        }
        (setPurchasingProductId(product.productId),
          setError(null),
          setPaymentDialog(null),
          setOverseasPaymentDialog(null),
          setPaymentExpired(!1),
          abortRef.current?.abort(PURCHASE_CANCELLED_MESSAGE),
          (abortRef.current = null));
        let localAbort: AbortController | null = null,
          stage = `unknown`;
        try {
          let preview = previewOverride ?? (await preparePaymentPreview(product));
          if (!preview) return;
          if (isOAuthFamilyProvider(providerId)) {
            setOverseasPaymentDialog({ product, preview, submittingAction: null, error: null });
            return;
          }
          let snapshot = personalFunnelSnapshotOf({ providerId, product, preview, locale, funnelContext });
          ((funnelRef.current = snapshot), trackFunnelClick(platform, snapshot));
          let isUpgrade =
            batchPreview?.isSubscribed === !0 &&
            !preview.renew &&
            preview.lastSubscriptionSummary?.productId !== preview.productId;
          stage = isUpgrade ? `update_sign` : `create_sign`;
          let agreement = isUpgrade
            ? await subscriptionService.updateSign({ providerId, bizId: preview.bizId, payType: `ALI` })
            : await subscriptionService.createSign({
                providerId,
                bizId: preview.bizId,
                payType: `ALI`,
                renew: preview.renew === !0 || product.canRepurchase === !0 ? !0 : null,
                isDelay: 0,
                effectiveTime: null,
              });
          logger.debug(`[useCodingPlanPurchase] Coding Plan 签约返回`, {
            providerId,
            productId: product.productId,
            bizId: preview.bizId,
            signType: agreement.signType,
            signLength: agreement.sign.length,
            signKind: paymentSignKindOf(agreement.sign),
          });
          let paymentContent = agreement.sign.trim();
          if (!paymentContent) throw Error(`coding_plan_empty_payment_sign`);
          setPaymentDialog({ product, preview, agreement, paymentContent });
          let controller = new AbortController();
          ((localAbort = controller), (abortRef.current = controller), setPaymentPolling(!0), (stage = `terminal_status`));
          let finalStatus = await pollPaymentStatus(subscriptionService, providerId, preview.bizId, controller.signal);
          (trackFunnelResult(platform, funnelRef.current, orderOutcomeOf(finalStatus)), (funnelRef.current = null), setPaymentDialog(null), onComplete?.());
        } catch (purchaseError) {
          if (isPurchaseCancelledError(purchaseError)) {
            (trackFunnelResult(platform, funnelRef.current, cancelledOutcome()),
              (funnelRef.current = null),
              logger.debug(`[useCodingPlanPurchase] Coding Plan 套餐购买已取消`, {
                providerId,
                productId: product.productId,
              }));
            return;
          }
          let normalized = normalizeProductError(purchaseError);
          if (normalized === PAYMENT_CHECK_TIMEOUT_CODE) {
            (trackFunnelResult(platform, funnelRef.current, timeoutOutcome()), (funnelRef.current = null), setPaymentExpired(!0), setError(null));
            return;
          }
          (trackFunnelResult(
            platform,
            funnelRef.current,
            stage === `terminal_status` && isFailureLikeStatus(normalized)
              ? orderOutcomeOf(normalized)
              : outcomeOf(
                  stage === `update_sign`
                    ? `update_sign_failed`
                    : stage === `create_sign`
                      ? `create_sign_failed`
                      : `unknown_error`,
                  stage,
                  normalized || `purchase request failed`,
                ),
          ),
            (funnelRef.current = null),
            logger.warn(`[useCodingPlanPurchase] Coding Plan 套餐购买失败`, {
              providerId,
              productId: product.productId,
              error: normalized,
            }),
            setError(normalized));
        } finally {
          (abortRef.current === localAbort && (abortRef.current = null),
            setPurchasingProductId((current) => (current === product.productId ? null : current)),
            setPaymentPolling(!1));
        }
      },
      [batchPreview?.isSubscribed, onComplete, preparePaymentPreview, platform, providerId, funnelContext, locale, subscriptionService],
    ),
    startPaypalAuthorization = React.useCallback(async () => {
      if (!subscriptionService || !overseasPaymentDialog) return;
      let { product, preview } = overseasPaymentDialog,
        snapshot = personalFunnelSnapshotOf({
          providerId,
          product,
          preview,
          locale,
          paymentMethod: `paypal`,
          funnelContext,
        });
      ((funnelRef.current = snapshot),
        trackFunnelClick(platform, snapshot),
        setOverseasPaymentDialog((current: any) => current && { ...current, submittingAction: `paypal-setup`, error: null }));
      try {
        let support = await subscriptionService.checkPaypalSupport({ providerId });
        if (support.isSupport === !1 || isFailureLikeStatus(support.resultStatus ?? ``)) throw Error(PAYPAL_UNSUPPORTED_CODE);
        let setup = await subscriptionService.createPaypalSetupToken({
          providerId,
          returnUrl: paymentCallbackUrlOf(`paypal`, `return`),
          cancelUrl: paymentCallbackUrlOf(`paypal`, `cancel`),
        });
        if (!setup.setupTokenId) throw Error(PAYPAL_SETUP_REQUIRED_CODE);
        if (!setup.approveUrl) throw Error(PAYPAL_APPROVE_URL_MISSING_CODE);
        (platform?.openExternal(setup.approveUrl),
          setOverseasPaymentDialog(
            (current: any) =>
              current && {
                ...current,
                paypalSetupTokenId: setup.setupTokenId,
                paypalApproveUrl: setup.approveUrl,
                submittingAction: null,
                error: null,
              },
          ));
      } catch (setupError) {
        let normalized = normalizeProductError(setupError);
        (trackFunnelResult(platform, funnelRef.current, outcomeOf(`paypal_setup_failed`, `paypal_setup`, normalized || `paypal setup failed`)),
          (funnelRef.current = null),
          logger.warn(`[useCodingPlanPurchase] PayPal 授权启动失败`, { providerId, error: normalized }),
          setOverseasPaymentDialog((current: any) => current && { ...current, submittingAction: null, error: normalized }));
      }
    }, [funnelContext, locale, overseasPaymentDialog, platform, providerId, subscriptionService]),
    completePaypalPayment = React.useCallback(async () => {
      if (!subscriptionService || !overseasPaymentDialog) return;
      let setupTokenId = overseasPaymentDialog.paypalSetupTokenId;
      if (!setupTokenId) {
        setOverseasPaymentDialog((current: any) => current && { ...current, error: PAYPAL_SETUP_REQUIRED_CODE });
        return;
      }
      setOverseasPaymentDialog((current: any) => current && { ...current, submittingAction: `paypal-subscribe`, error: null });
      try {
        let { product, preview } = overseasPaymentDialog,
          result = await subscriptionService.subscribePaypal({
            providerId,
            productId: product.productId,
            productDesc: product.productName ?? product.productBigTitle,
            setupTokenId,
            amount: preview.thirdPartyAmount,
            isSubscribe: !0,
            estimatePayAmount: estimatePayAmountsOf(preview),
            bizId: preview.bizId,
          });
        if (isFailureLikeStatus(result.resultStatus ?? result.payStatus ?? ``)) throw Error(PAYPAL_SUBSCRIBE_FAILED_CODE);
        let status = result.resultStatus ?? result.payStatus ?? `SUCCESS`;
        (isSuccessLikeStatus(result.resultStatus ?? result.payStatus ?? ``) ||
          (status = await pollPaymentStatus(subscriptionService, providerId, preview.bizId, new AbortController().signal)),
          trackFunnelResult(platform, funnelRef.current, orderOutcomeOf(status)),
          (funnelRef.current = null),
          setOverseasPaymentDialog(null),
          onComplete?.());
      } catch (subscribeError) {
        let normalized = normalizePaypalError(subscribeError);
        (trackFunnelResult(
          platform,
          funnelRef.current,
          normalized === PAYMENT_CHECK_TIMEOUT_CODE
            ? timeoutOutcome()
            : outcomeOf(`paypal_subscribe_failed`, `paypal_subscribe`, normalized || `paypal subscribe failed`),
        ),
          (funnelRef.current = null),
          logger.warn(`[useCodingPlanPurchase] PayPal 订阅失败`, { providerId, error: normalized }),
          setOverseasPaymentDialog((current: any) => current && { ...current, submittingAction: null, error: normalized }));
      }
    }, [locale, onComplete, overseasPaymentDialog, platform, providerId, subscriptionService]);
  React.useEffect(() => {
    let unsubscribe = platform?.onPaymentCallback((url: string) => {
      let parsed = parsePaymentCallbackUrl(url);
      if (!(!parsed || parsed.provider !== `zai` || parsed.channel !== `paypal`)) {
        if (parsed.status === `cancel`) {
          (trackFunnelResult(platform, funnelRef.current, cancelledOutcome()),
            (funnelRef.current = null),
            setOverseasPaymentDialog((current: any) => current && { ...current, submittingAction: null, error: `coding_plan_paypal_cancelled` }));
          return;
        }
        completePaypalPayment();
      }
    });
    return () => {
      unsubscribe?.();
    };
  }, [completePaypalPayment, platform]);
  let queryStripeCards = React.useCallback(async () => {
      if (!subscriptionService) throw Error(`service_unavailable`);
      return subscriptionService.queryStripeCards({ providerId });
    }, [providerId, subscriptionService]),
    bindStripePaymentMethod = React.useCallback(
      async (paymentMethodId: string) => {
        if (!subscriptionService || !overseasPaymentDialog) throw Error(`service_unavailable`);
        setOverseasPaymentDialog((current: any) => current && { ...current, submittingAction: `stripe-bind`, error: null });
        try {
          return await subscriptionService.bindStripeCard({
            providerId,
            paymentMethodId,
            returnUrl: paymentCallbackUrlOf(`stripe`, `return`),
          });
        } catch (bindError) {
          let normalized = normalizeProductError(bindError);
          throw (
            logger.warn(`[useCodingPlanPurchase] Stripe 绑卡失败`, { providerId, error: normalized }),
            setOverseasPaymentDialog((current: any) => current && { ...current, submittingAction: null, error: normalized }),
            bindError
          );
        } finally {
          setOverseasPaymentDialog((current: any) => (current?.submittingAction === `stripe-bind` ? { ...current, submittingAction: null } : current));
        }
      },
      [overseasPaymentDialog, providerId, subscriptionService],
    ),
    unbindStripeCard = React.useCallback(
      async (paymentMethodId: string) => {
        if (!subscriptionService) throw Error(`service_unavailable`);
        await subscriptionService.unbindStripeCard({ providerId, paymentMethodId });
      },
      [funnelContext, providerId, subscriptionService],
    ),
    payWithStripePaymentMethod = React.useCallback(
      async (paymentMethodId: string, confirm3ds: (clientSecret: string) => Promise<void>) => {
        if (!subscriptionService || !overseasPaymentDialog) return;
        let { product, preview } = overseasPaymentDialog,
          snapshot = personalFunnelSnapshotOf({
            providerId,
            product,
            preview,
            locale,
            paymentMethod: `stripe`,
            funnelContext,
          });
        ((funnelRef.current = snapshot),
          trackFunnelClick(platform, snapshot),
          setOverseasPaymentDialog((current: any) => current && { ...current, submittingAction: `stripe-pay`, error: null }));
        try {
          let result = await subscriptionService.payStripe({
            providerId,
            productId: product.productId,
            paymentMethodId,
            isSubscribe: !0,
            returnUrl: paymentCallbackUrlOf(`stripe`, `return`),
            estimatePayAmount: estimatePayAmountsOf(preview),
            bizId: preview.bizId,
            renew: preview.renew === !0 || product.canRepurchase === !0,
          });
          if (
            (logger.debug(`[useCodingPlanPurchase] Stripe 支付返回`, {
              providerId,
              productId: product.productId,
              bizId: preview.bizId,
              status: result.status,
              requiresAction: result.requiresAction,
              hasClientSecret: !!result.clientSecret,
            }),
            result.requiresAction && result.clientSecret)
          ) {
            if (!confirm3ds) throw Error(STRIPE_ACTION_REQUIRED_CODE);
            await confirm3ds(result.clientSecret);
          } else if (result.requiresAction) throw Error(STRIPE_ACTION_REQUIRED_CODE);
          if (isFailureLikeStatus(result.status ?? ``)) throw Error(result.status || `stripe_failed`);
          let status = result.status ?? `SUCCESS`;
          (needsStatusPollAfterStripe(providerId, result.status) &&
            (status = await pollPaymentStatus(subscriptionService, providerId, preview.bizId, new AbortController().signal)),
            trackFunnelResult(platform, funnelRef.current, orderOutcomeOf(status)),
            (funnelRef.current = null),
            setOverseasPaymentDialog(null),
            onComplete?.());
        } catch (payError) {
          let normalized = normalizeProductError(payError);
          throw (
            trackFunnelResult(
              platform,
              funnelRef.current,
              normalized === PAYMENT_CHECK_TIMEOUT_CODE ? timeoutOutcome() : outcomeOf(`stripe_pay_failed`, `stripe_pay`, normalized || `stripe pay failed`),
            ),
            (funnelRef.current = null),
            logger.warn(`[useCodingPlanPurchase] Stripe 支付失败`, { providerId, error: normalized }),
            setOverseasPaymentDialog((current: any) => current && { ...current, submittingAction: null, error: normalized }),
            payError
          );
        }
      },
      [funnelContext, locale, onComplete, overseasPaymentDialog, platform, providerId, subscriptionService],
    );
  return {
    purchasingProductId,
    previewingProductId,
    securityVerificationLoading,
    preparedPaymentPreview,
    paymentDialog,
    overseasPaymentDialog,
    paymentPolling,
    paymentExpired,
    error,
    closePaymentDialog,
    closeOverseasPaymentDialog,
    refreshPaymentDialog: React.useCallback(() => {
      let product = paymentDialog?.product;
      product && purchase(product);
    }, [paymentDialog?.product, purchase]),
    preparePaymentPreview,
    clearPreparedPaymentPreview,
    startPaypalAuthorization,
    completePaypalPayment,
    queryStripeCards,
    bindStripePaymentMethod,
    unbindStripeCard,
    payWithStripePaymentMethod,
    purchase,
  };
}
/** 原 U9e（83560 区）：估价金额三元组 */
export function estimatePayAmountsOf(preview: any) {
  return {
    cashPayAmount: preview.cashAmount ?? 0,
    givePayAmount: preview.giveAmount ?? 0,
    thirdPartyPayAmount: preview.thirdPartyAmount ?? preview.payAmount ?? 0,
  };
}
/** 原 bY（83567 区） */
export function paypalReturnUrl(channel = `paypal`): string {
  return paymentCallbackUrlOf(channel, `return`);
}
/** 原 W9e（83570 区） */
export function paypalCancelUrl(channel = `paypal`): string {
  return paymentCallbackUrlOf(channel, `cancel`);
}
/** 原 G9e（83573 区）：PayPal 错误归一 */
export function normalizePaypalError(error: unknown): string {
  let normalized = normalizeProductError(error);
  return normalized === `paypal_failed` || normalized === PAYPAL_SUBSCRIBE_FAILED_CODE || /paypal subscribe failed/i.test(normalized)
    ? PAYPAL_SUBSCRIBE_FAILED_CODE
    : normalized;
}
/** 原 K9e（83576 区）：回调 URL 构造 */
export function paymentCallbackUrlOf(channel: string, status: string): string {
  let url = new URL(PAYMENT_CALLBACK_SCHEME);
  return (
    url.searchParams.set(`provider`, `zai`),
    url.searchParams.set(`channel`, channel),
    url.searchParams.set(`status`, status),
    url.toString()
  );
}
/** 原 q9e（83586 区）：回调 URL 解析（zcode://payment） */
export function parsePaymentCallbackUrl(value: string): { provider: string; channel: string; status: string } | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  return url.protocol !== `zcode:` || url.hostname !== `payment`
    ? null
    : {
        provider: url.searchParams.get(`provider`) ?? ``,
        channel: url.searchParams.get(`channel`) ?? ``,
        status: url.searchParams.get(`status`) ?? ``,
      };
}
/** 原 J9e（83601 区）：preview + 验证码重试 */
export async function previewWithSecurityVerification({
  service,
  providerId,
  product,
  onSecurityVerificationStart,
  onSecurityVerificationEnd,
}: {
  service: any;
  providerId: string;
  product: any;
  onSecurityVerificationStart: () => void;
  onSecurityVerificationEnd: () => void;
}) {
  try {
    return await service.preview({ providerId, productId: product.productId });
  } catch (error) {
    if (!isSecurityVerificationRequiredError(error)) throw error;
  }
  onSecurityVerificationStart();
  let verification: { ticket: string; randstr: string };
  try {
    verification = await runSecurityCaptcha(providerId);
  } finally {
    onSecurityVerificationEnd();
  }
  return service.preview({ providerId, productId: product.productId, ticket: verification.ticket, randstr: verification.randstr });
}
/** 原 xY（83618 区）：支付状态轮询（60×2s，abort 即取消） */
export async function pollPaymentStatus(service: any, providerId: string, bizId: string, signal: AbortSignal): Promise<string> {
  for (let attempt = 0; attempt < PAYMENT_POLL_ATTEMPTS; attempt += 1) {
    (throwIfAborted(signal), await abortableDelay(PAYMENT_POLL_INTERVAL_MS, signal), throwIfAborted(signal));
    let result = await service.checkPayment({ providerId, bizId });
    if (
      (logger.debug(`[useCodingPlanPurchase] Coding Plan 支付轮询状态`, {
        providerId,
        bizId,
        attempt: attempt + 1,
        status: result.status,
      }),
      isSuccessLikeStatus(result.status))
    )
      return result.status;
    if (isFailureLikeStatus(result.status)) throw Error(result.status);
  }
  throw Error(PAYMENT_CHECK_TIMEOUT_CODE);
}
/** 原 Y9e（83640 区） */
export function isSecurityVerificationRequiredError(error: unknown): boolean {
  return normalizeProductError(error) === SECURITY_VERIFICATION_REQUIRED_CODE;
}
/** 原 X9e（83643 区）：签约内容类型识别 */
export function paymentSignKindOf(sign: string): string {
  let trimmed = sign.trim();
  return /^https?:\/\//i.test(trimmed) ? `url` : /<form\b/i.test(trimmed) ? `html-form` : `text`;
}
/** 原 SY（83646 区） */
export function isSuccessLikeStatus(status: string): boolean {
  let lowered = status.toLowerCase();
  return (
    lowered.includes(`success`) ||
    lowered.includes(`succeed`) ||
    lowered.includes(`paid`) ||
    lowered.includes(`complete`) ||
    status.includes(`成功`) ||
    status.includes(`已支付`)
  );
}
/** 原 Z9e（83657 区）：stripe 后需轮询（oauth 族除外） */
export function needsStatusPollAfterStripe(providerId: string, status: string | undefined): boolean {
  return isOAuthFamilyProvider(providerId) ? !1 : !isSuccessLikeStatus(status ?? ``);
}
/** 原 CY（83660 区） */
export function isFailureLikeStatus(status: string): boolean {
  let lowered = status.toLowerCase();
  return lowered.includes(`fail`) || lowered.includes(`cancel`) || status.includes(`失败`) || status.includes(`取消`);
}
/** 原 Q9e（83665 区） */
export function isPurchaseCancelledError(error: unknown): boolean {
  return error instanceof Error && error.message === PURCHASE_CANCELLED_MESSAGE;
}
/** 原 $9e（83668 区） */
export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw Error(PURCHASE_CANCELLED_MESSAGE);
}
/** 原 eet（83671 区）：可 abort 延迟 */
export function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(Error(PURCHASE_CANCELLED_MESSAGE));
      return;
    }
    let timer = window.setTimeout(resolve, ms);
    signal.addEventListener(
      `abort`,
      () => {
        (window.clearTimeout(timer), reject(Error(PURCHASE_CANCELLED_MESSAGE)));
      },
      { once: !0 },
    );
  });
}

/** 原 wY（83687 区）：快照认证态一致 */
export function snapshotMatchesAuth(snapshot: any, authenticated: unknown): boolean {
  return snapshot?.authenticated === authenticated;
}
/** 原 tet（83690 区）：企业快照回退（静态目录） */
export function enterpriseSnapshotFallback({
  currentSnapshot,
  authenticated,
  staticProducts,
}: {
  currentSnapshot: any;
  authenticated: unknown;
  staticProducts: unknown;
}) {
  if (snapshotMatchesAuth(currentSnapshot, authenticated)) return currentSnapshot;
  if (!Array.isArray(staticProducts)) return null;
  let raw = { productList: [] as any[] };
  return { raw, productList: enterpriseOrMergedProducts(staticProducts, raw.productList), authenticated };
}
/** 原 TY（83745 / jsx 73389）：useEnterpriseCodingPlanProducts */
export function useEnterpriseCodingPlanProducts({ enabled, authenticated }: { enabled: boolean; authenticated: unknown }) {
  let subscriptionService = useServices()?.codingPlanSubscriptionService,
    [state, setState] = React.useState<{ snapshot: any; loading: boolean; error: string | null }>({
      snapshot: null,
      loading: enabled,
      error: null,
    }),
    refresh = React.useCallback(
      async (opts?: any) => {
        if (!enabled) {
          setState((current) => ({ snapshot: current.snapshot, loading: !1, error: null }));
          return;
        }
        if (!subscriptionService) {
          setState({ snapshot: null, loading: !1, error: `service_unavailable` });
          return;
        }
        setState((current) => ({
          snapshot: snapshotMatchesAuth(current.snapshot, authenticated) ? current.snapshot : null,
          loading: !0,
          error: null,
        }));
        try {
          let [staticResult, pricingResult] = await Promise.allSettled([
              subscriptionService.getStaticTeamProducts(),
              subscriptionService.getEnterprisePricing({ authenticated }),
            ]),
            staticCatalog =
              staticResult.status === `fulfilled` &&
              Object.prototype.hasOwnProperty.call(staticResult.value, PROVIDER_IDS.bigmodelCodingPlan)
                ? (staticResult.value as any)[PROVIDER_IDS.bigmodelCodingPlan]
                : void 0,
            pricing = pricingResult.status === `fulfilled` ? pricingResult.value : { productList: [] },
            pricingError = pricingResult.status === `rejected` ? pricingResult.reason : null;
          if (pricingError) {
            let normalized = normalizeProductError(pricingError);
            (setState((current) => ({
              snapshot: enterpriseSnapshotFallback({ currentSnapshot: current.snapshot, authenticated, staticProducts: staticCatalog }),
              loading: !1,
              error: normalized,
            })),
              isBenignRemoteError(pricingError) ||
                logger.warn(`[useEnterpriseCodingPlanProducts] 读取企业实时定价失败`, {
                  authenticated,
                  error: normalized,
                }));
            return;
          }
          (setState({
            snapshot: { raw: pricing, productList: enterpriseOrMergedProducts(staticCatalog, pricing.productList), authenticated },
            loading: !1,
            error: pricingError ? normalizeProductError(pricingError) : null,
          }),
            staticResult.status === `rejected` &&
              !isBenignRemoteError(staticResult.reason) &&
              logger.warn(`[useEnterpriseCodingPlanProducts] 读取团队静态配置失败，回退实时 pricing`, {
                authenticated,
                error: normalizeProductError(staticResult.reason),
              }));
        } catch (readError) {
          let normalized = normalizeProductError(readError);
          (isBenignRemoteError(readError) ||
            logger.warn(`[useEnterpriseCodingPlanProducts] 读取企业 Coding Plan 套餐失败`, {
              authenticated,
              error: normalized,
            }),
            setState((current) => ({
              snapshot: snapshotMatchesAuth(current.snapshot, authenticated) ? current.snapshot : null,
              loading: !1,
              error: normalized,
            })));
        }
      },
      [authenticated, enabled, subscriptionService],
    );
  return (
    (React.useEffect(() => {
      refresh();
    }, [refresh]),
    React.useMemo(() => ({ ...state, refresh }), [refresh, state]))
  );
}
/** 原 EY（83815 / jsx 73477）：Start → Coding 计划源映射 */
export function codingPlanProviderOfStart(providerId: string): string {
  return providerId === PROVIDER_IDS.zaiStartPlan
    ? PROVIDER_IDS.zaiCodingPlan
    : providerId === PROVIDER_IDS.bigmodelStartPlan
      ? PROVIDER_IDS.bigmodelCodingPlan
      : providerId;
}
/** 原 DY（83824 区）：oauth 强制恢复选项 */
export function oauthRecoveryOptionOf(error: string | null | undefined): { forceOAuth: boolean } | undefined {
  if (!(!error || !isOAuthRequiredError(error))) return { forceOAuth: !0 };
}
/** 原 net（83827 / jsx 73496 区）：账号要求可见性 */
export function isAccountRequirementVisible({
  accountRequirementVisible,
  productsOAuthRequired,
  authRecoverySubscribeAvailable,
}: {
  accountRequirementVisible: boolean;
  productsOAuthRequired: boolean;
  authRecoverySubscribeAvailable: boolean;
}): boolean {
  return accountRequirementVisible || (productsOAuthRequired && !authRecoverySubscribeAvailable);
}
/** 原 ret…kY（83837–83840）：企业购买常量 */
const ENTERPRISE_POLL_INTERVAL_MS = 2e3; // ret
const ENTERPRISE_POLL_ATTEMPTS = 60; // iet
const ENTERPRISE_PURCHASE_CANCELLED_MESSAGE = `enterprise_coding_plan_purchase_cancelled`; // OY
const ENTERPRISE_PAYMENT_CHECK_TIMEOUT_CODE = `enterprise_coding_plan_payment_check_timeout`; // kY
/** 原 aet（83841 / jsx 73496 区）：useEnterpriseCodingPlanPanelPurchase */
export function useEnterpriseCodingPlanPanelPurchase({
  selection,
  funnelContext,
  onComplete,
}: {
  selection: any;
  funnelContext?: any;
  onComplete?: () => void;
}) {
  let services = useServices(),
    platform = usePlatformBridge(),
    subscriptionService = services?.codingPlanSubscriptionService,
    [panelState, setPanelState] = React.useState<{
      balance: any;
      balanceLoading: boolean;
      balanceError: string | null;
      estimate: any;
      estimating: boolean;
      estimateError: string | null;
    }>({
      balance: null,
      balanceLoading: !1,
      balanceError: null,
      estimate: null,
      estimating: !1,
      estimateError: null,
    }),
    [paymentDialog, setPaymentDialog] = React.useState<any>(null),
    [paymentPolling, setPaymentPolling] = React.useState(!1),
    [paymentExpired, setPaymentExpired] = React.useState(!1),
    [purchasing, setPurchasing] = React.useState(!1),
    [pendingOrderLoading, setPendingOrderLoading] = React.useState(!1),
    [pendingOrderCancelling, setPendingOrderCancelling] = React.useState(!1),
    [createdOrder, setCreatedOrder] = React.useState<any>(null),
    [error, setError] = React.useState<string | null>(null),
    abortRef = React.useRef<AbortController | null>(null),
    funnelRef = React.useRef<any>(null),
    refreshBalance = React.useCallback(async () => {
      if (!subscriptionService) {
        setPanelState((current) => ({
          ...current,
          balance: null,
          balanceLoading: !1,
          balanceError: `service_unavailable`,
        }));
        return;
      }
      setPanelState((current) => ({ ...current, balanceLoading: !0, balanceError: null }));
      try {
        let balance = await subscriptionService.getEnterpriseBalance();
        setPanelState((current) => ({ ...current, balance, balanceLoading: !1, balanceError: null }));
      } catch (balanceError) {
        let normalized = normalizeProductError(balanceError);
        (logger.warn(`[useEnterpriseCodingPlanPanelPurchase] 读取企业余额失败`, { error: normalized }),
          setPanelState((current) => ({ ...current, balance: null, balanceLoading: !1, balanceError: normalized })));
      }
    }, [subscriptionService]);
  (React.useEffect(() => {
    selection && refreshBalance();
  }, [refreshBalance, selection?.product.productId]),
    React.useEffect(() => {
      if (!subscriptionService || !selection) {
        setPanelState((current) => ({ ...current, estimate: null, estimating: !1, estimateError: null }));
        return;
      }
      let cancelled = !1,
        balanceAmounts = enterpriseBalanceDeductionsOf(selection, panelState.balance);
      return (
        setPanelState((current) => ({ ...current, estimating: !0, estimateError: null })),
        subscriptionService
          .calculateEnterpriseOrder(
            enterpriseOrderParamsOf({
              product: selection.product,
              maxSeats: selection.maxSeats,
              duration: selection.duration,
              giveAmount: balanceAmounts.giveAmount,
              balanceDeductAmount: balanceAmounts.balanceDeductAmount,
            }),
          )
          .then((estimate: any) => {
            cancelled || setPanelState((current) => ({ ...current, estimate, estimating: !1, estimateError: null }));
          })
          .catch((estimateError: unknown) => {
            if (cancelled) return;
            let normalized = normalizeProductError(estimateError);
            (logger.warn(`[useEnterpriseCodingPlanPanelPurchase] 企业订单试算失败`, {
              productId: selection.product.productId,
              error: normalized,
            }),
              setPanelState((current) => ({ ...current, estimate: null, estimating: !1, estimateError: normalized })));
          }),
        () => {
          cancelled = !0;
        }
      );
    }, [
      panelState.balance,
      selection?.duration,
      selection?.maxSeats,
      selection?.product.productId,
      selection?.useCashBalance,
      selection?.useGiftBalance,
      subscriptionService,
    ]));
  let closePaymentDialog = React.useCallback(() => {
    (abortRef.current?.abort(ENTERPRISE_PURCHASE_CANCELLED_MESSAGE), setPaymentDialog(null), setPaymentExpired(!1), setPurchasing(!1));
  }, []);
  React.useEffect(() => {
    (!selection ||
      !createdOrder ||
      createdOrder.productId !== selection.product.productId ||
      createdOrder.maxSeats !== selection.maxSeats ||
      createdOrder.duration !== selection.duration) &&
      setCreatedOrder(null);
  }, [createdOrder, selection?.duration, selection?.maxSeats, selection?.product.productId]);
  let confirmPurchase = React.useCallback(async () => {
      if (!subscriptionService || !selection || !panelState.estimate) return;
      (setPurchasing(!0), setError(null), setPaymentExpired(!1), abortRef.current?.abort(ENTERPRISE_PURCHASE_CANCELLED_MESSAGE), (abortRef.current = null));
      let localAbort: AbortController | null = null,
        stage = `create_order`,
        resumeState = resumeOrderStateOf({ resumeState: createdOrder, selection, estimate: panelState.estimate }),
        estimate = effectiveEstimateOf({ resumeState, estimate: panelState.estimate }),
        snapshot = teamFunnelSnapshotOf({
          productId: selection.product.productId,
          productName: selection.product.productName ?? selection.product.productId,
          tier: selection.product.tier,
          subscribePeriod: selection.product.subscribePeriod,
          subscribeMode: selection.product.subscribeMode,
          seatCount: selection.maxSeats,
          duration: selection.duration,
          cashAmount: estimate.balanceDeductAmount,
          giveAmount: estimate.giveDeductAmount,
          thirdPartyAmount: estimate.thirdPayAmount,
          totalOriginalAmount: estimate.totalOriginalAmount,
          campaignDiscountAmount: estimate.campaignDiscountAmount,
          totalPayAmount: estimate.totalPayAmount,
          funnelContext,
        });
      ((funnelRef.current = snapshot), trackFunnelClick(platform, snapshot));
      let balanceAmounts = enterpriseBalanceDeductionsOf(selection, panelState.balance);
      try {
        let order: any,
          estimateForDialog = panelState.estimate;
        if (
          (resumeState
            ? ((stage = `continue_order_payment`),
              (order = await subscriptionService.continueEnterpriseOrderPayment({ orderNo: resumeState.orderNo })),
              (estimateForDialog = pricingSummaryOf(order)))
            : ((stage = `create_order`),
              (order = await subscriptionService.createEnterpriseOrder(
                enterpriseEstimateParamsOf({
                  product: selection.product,
                  maxSeats: selection.maxSeats,
                  duration: selection.duration,
                  estimate: panelState.estimate,
                  giveAmount: balanceAmounts.giveAmount,
                  balanceDeductAmount: balanceAmounts.balanceDeductAmount,
                }),
              )),
              setCreatedOrder({
                orderNo: order.orderNo,
                productId: selection.product.productId,
                maxSeats: selection.maxSeats,
                duration: selection.duration,
                estimate: panelState.estimate,
              })),
          (funnelRef.current = funnelWithOrderNoOf(snapshot, order.orderNo)),
          !requiresThirdPartyPayment(order))
        ) {
          stage = `terminal_status`;
          let status = await subscriptionService.checkEnterpriseOrderStatus({ orderNo: order.orderNo });
          if (!isOrderSuccess(status.paymentStatus)) throw Error(status.paymentStatus);
          (trackFunnelResult(platform, funnelRef.current, { ...enterpriseTerminalOutcomeOf(status.paymentStatus), orderNo: order.orderNo }),
            (funnelRef.current = null),
            setCreatedOrder(null),
            setPaymentDialog(null),
            onComplete?.());
          return;
        }
        openEnterprisePaymentDialog({
          order,
          product: selection.product,
          maxSeats: selection.maxSeats,
          duration: selection.duration,
          estimate: estimateForDialog,
          setPaymentDialog,
        });
        let controller = new AbortController();
        ((localAbort = controller), (abortRef.current = controller), setPaymentPolling(!0), (stage = `terminal_status`));
        let finalStatus = await pollEnterpriseOrderStatus(subscriptionService, order.orderNo, controller.signal);
        (trackFunnelResult(platform, funnelRef.current, { ...enterpriseTerminalOutcomeOf(finalStatus), orderNo: order.orderNo }),
          (funnelRef.current = null),
          setCreatedOrder(null),
          setPaymentDialog(null),
          onComplete?.());
      } catch (orderError) {
        if (isEnterprisePurchaseCancelledError(orderError)) {
          (trackFunnelResult(platform, funnelRef.current, cancelledOutcome()),
            (funnelRef.current = null),
            logger.debug(`[useEnterpriseCodingPlanPanelPurchase] 企业套餐购买已取消`, {
              productId: selection.product.productId,
            }));
          return;
        }
        let normalized = normalizeProductError(orderError);
        if (normalized === ENTERPRISE_PAYMENT_CHECK_TIMEOUT_CODE) {
          (trackFunnelResult(platform, funnelRef.current, timeoutOutcome()), (funnelRef.current = null), setPaymentExpired(!0), setError(null));
          return;
        }
        (trackFunnelResult(
          platform,
          funnelRef.current,
          stage === `terminal_status` && isOrderTerminal(normalized)
            ? enterpriseTerminalOutcomeOf(normalized)
            : outcomeOf(
                stage === `continue_order_payment`
                  ? `continue_order_payment_failed`
                  : `create_order_failed`,
                stage,
                normalized || `enterprise order request failed`,
              ),
        ),
          (funnelRef.current = null),
          logger.warn(`[useEnterpriseCodingPlanPanelPurchase] 企业套餐购买失败`, {
            productId: selection.product.productId,
            error: normalized,
          }),
          setError(normalized));
      } finally {
        (abortRef.current === localAbort && (abortRef.current = null), setPaymentPolling(!1), setPurchasing(!1));
      }
    }, [createdOrder, panelState.balance, panelState.estimate, funnelContext, onComplete, platform, selection, subscriptionService]),
    checkPendingOrder = React.useCallback(async () => {
      if (!subscriptionService) return null;
      (setPendingOrderLoading(!0), setError(null));
      try {
        return (
          (await subscriptionService.getEnterprisePendingOrders()).find((order: any) => order.paymentStatus === `WAIT_PAY`) ?? null
        );
      } catch (pendingError) {
        let normalized = normalizeProductError(pendingError);
        return (
          logger.warn(`[useEnterpriseCodingPlanPanelPurchase] 查询企业待支付订单失败`, { error: normalized }),
          setError(normalized),
          null
        );
      } finally {
        setPendingOrderLoading(!1);
      }
    }, [subscriptionService]),
    cancelPendingOrder = React.useCallback(
      async (orderNo: string) => {
        if (!subscriptionService) return !1;
        (setPendingOrderCancelling(!0), setError(null));
        try {
          return (await subscriptionService.cancelEnterpriseOrder({ orderNo }), !0);
        } catch (cancelError) {
          let normalized = normalizeProductError(cancelError);
          return (
            logger.warn(`[useEnterpriseCodingPlanPanelPurchase] 取消企业待支付订单失败`, {
              orderNo,
              error: normalized,
            }),
            setError(normalized),
            !1
          );
        } finally {
          setPendingOrderCancelling(!1);
        }
      },
      [subscriptionService],
    ),
    confirmPendingOrderPayment = React.useCallback(
      async ({ pendingOrder, product }: { pendingOrder: any; product: any }) => {
        if (!subscriptionService) return;
        (setPurchasing(!0), setError(null), setPaymentExpired(!1), abortRef.current?.abort(ENTERPRISE_PURCHASE_CANCELLED_MESSAGE), (abortRef.current = null));
        let localAbort: AbortController | null = null,
          stage = `continue_order_payment`,
          snapshot = teamFunnelSnapshotOf({
            productId: product.productId,
            productName: product.productName ?? product.productId,
            tier: product.tier,
            subscribePeriod: product.subscribePeriod,
            subscribeMode: product.subscribeMode,
            seatCount: pendingOrder.seatCount,
            duration: 1,
            cashAmount: void 0,
            giveAmount: void 0,
            thirdPartyAmount: pendingOrder.amount,
            totalOriginalAmount: void 0,
            campaignDiscountAmount: void 0,
            totalPayAmount: void 0,
            orderNo: pendingOrder.orderNo,
            funnelContext,
          });
        ((funnelRef.current = snapshot), trackFunnelClick(platform, snapshot));
        try {
          let order = await subscriptionService.continueEnterpriseOrderPayment({ orderNo: pendingOrder.orderNo });
          if (((funnelRef.current = funnelWithOrderNoOf(snapshot, order.orderNo)), !requiresThirdPartyPayment(order))) {
            stage = `terminal_status`;
            let status = await subscriptionService.checkEnterpriseOrderStatus({ orderNo: order.orderNo });
            if (!isOrderSuccess(status.paymentStatus)) throw Error(status.paymentStatus);
            (trackFunnelResult(platform, funnelRef.current, { ...enterpriseTerminalOutcomeOf(status.paymentStatus), orderNo: order.orderNo }),
              (funnelRef.current = null),
              setCreatedOrder(null),
              setPaymentDialog(null),
              onComplete?.());
            return;
          }
          openEnterprisePaymentDialog({
            order,
            product,
            maxSeats: pendingOrder.seatCount,
            duration: 1,
            estimate: pricingSummaryOf(order),
            setPaymentDialog,
          });
          let controller = new AbortController();
          ((localAbort = controller), (abortRef.current = controller), setPaymentPolling(!0), (stage = `terminal_status`));
          let finalStatus = await pollEnterpriseOrderStatus(subscriptionService, order.orderNo, controller.signal);
          (trackFunnelResult(platform, funnelRef.current, { ...enterpriseTerminalOutcomeOf(finalStatus), orderNo: order.orderNo }),
            (funnelRef.current = null),
            setCreatedOrder(null),
            setPaymentDialog(null),
            onComplete?.());
        } catch (orderError) {
          if (isEnterprisePurchaseCancelledError(orderError)) {
            (trackFunnelResult(platform, funnelRef.current, cancelledOutcome()),
              (funnelRef.current = null),
              logger.debug(`[useEnterpriseCodingPlanPanelPurchase] 企业待支付订单继续支付已取消`, {
                orderNo: pendingOrder.orderNo,
              }));
            return;
          }
          let normalized = normalizeProductError(orderError);
          if (normalized === ENTERPRISE_PAYMENT_CHECK_TIMEOUT_CODE) {
            (trackFunnelResult(platform, funnelRef.current, timeoutOutcome()), (funnelRef.current = null), setPaymentExpired(!0), setError(null));
            return;
          }
          (trackFunnelResult(
            platform,
            funnelRef.current,
            stage === `terminal_status` && isOrderTerminal(normalized)
              ? enterpriseTerminalOutcomeOf(normalized)
              : outcomeOf(
                  `continue_order_payment_failed`,
                  `continue_order_payment`,
                  normalized || `continue order payment failed`,
                ),
          ),
            (funnelRef.current = null),
            logger.warn(`[useEnterpriseCodingPlanPanelPurchase] 企业待支付订单继续支付失败`, {
              orderNo: pendingOrder.orderNo,
              productId: product.productId,
              error: normalized,
            }),
            setError(normalized));
        } finally {
          (abortRef.current === localAbort && (abortRef.current = null), setPaymentPolling(!1), setPurchasing(!1));
        }
      },
      [funnelContext, onComplete, platform, subscriptionService],
    ),
    refreshPaymentDialog = React.useCallback(() => {
      (closePaymentDialog(), confirmPurchase());
    }, [closePaymentDialog, confirmPurchase]),
    clearCreatedOrderResumeState = React.useCallback(() => {
      setCreatedOrder(null);
    }, []);
  return {
    ...panelState,
    paymentDialog,
    paymentPolling,
    paymentExpired,
    purchasing,
    pendingOrderLoading,
    pendingOrderCancelling,
    createdOrderNo: createdOrder?.orderNo ?? null,
    error,
    refreshBalance,
    checkPendingOrder,
    cancelPendingOrder,
    confirmPurchase,
    confirmPendingOrderPayment,
    clearCreatedOrderResumeState,
    closePaymentDialog,
    refreshPaymentDialog,
  };
}
/** 原 oet（84082 区）：续单状态有效性 */
export function resumeOrderStateOf({ resumeState, selection, estimate }: { resumeState: any; selection: any; estimate: any }) {
  return !resumeState ||
    resumeState.productId !== selection.product.productId ||
    resumeState.maxSeats !== selection.maxSeats ||
    resumeState.duration !== selection.duration ||
    resumeState.estimate.totalOriginalAmount !== estimate.totalOriginalAmount ||
    resumeState.estimate.totalPayAmount !== estimate.totalPayAmount ||
    resumeState.estimate.thirdPayAmount !== estimate.thirdPayAmount
    ? null
    : resumeState;
}
/** 原 set（84096 区） */
export function effectiveEstimateOf({ resumeState, estimate }: { resumeState: any; estimate: any }) {
  return resumeState?.estimate ?? estimate;
}
/** 原 cet（84099 区）：企业支付对话框开启（空内容即错） */
export function openEnterprisePaymentDialog({
  order,
  product,
  maxSeats,
  duration,
  estimate,
  setPaymentDialog,
}: {
  order: any;
  product: any;
  maxSeats: number;
  duration: number;
  estimate: any;
  setPaymentDialog: (dialog: any) => void;
}) {
  if (!payUrlOf(order)) throw Error(`enterprise_coding_plan_empty_payment_content`);
  setPaymentDialog(enterprisePaymentDialogStateOf({ product, maxSeats, duration, estimate, order }));
}
/** 原 uet（84104 区）：余额抵扣额 */
export function enterpriseBalanceDeductionsOf(selection: any, balance: any) {
  return {
    giveAmount: selection.useGiftBalance ? (balance?.giveBalance ?? 0) : 0,
    balanceDeductAmount: selection.useCashBalance ? (balance?.cashBalance ?? 0) : 0,
  };
}
/** 原 det（84109 区）：企业支付对话框状态（preview 合成） */
export function enterprisePaymentDialogStateOf({
  product,
  maxSeats,
  duration,
  estimate,
  order,
}: {
  product: any;
  maxSeats: number;
  duration: number;
  estimate: any;
  order: any;
}) {
  let content = payUrlOf(order);
  return {
    product,
    preview: {
      ...product,
      bizId: order.orderNo,
      originalAmount: estimate.totalOriginalAmount,
      payAmount: estimate.totalPayAmount,
      thirdPartyAmount: estimate.thirdPayAmount,
      giveAmount: estimate.giveDeductAmount,
      cashAmount: estimate.balanceDeductAmount,
      campaignDiscountDetails: discountDetailsOf({
        ...order,
        campaignDiscountAmount:
          order.campaignDiscountAmount ??
          estimate.campaignDiscountAmount ??
          enterpriseCampaignDiscountOf({ product, maxSeats, duration }),
        pricingCampaignDiscountDetails: product.campaignDiscountDetails,
      }),
    },
    agreement: { orderId: order.orderNo, sign: content, signType: `ALI` },
    paymentContent: content,
    kind: `enterprise`,
  };
}
/** 原 fet（84137 区）：企业订单轮询 */
export async function pollEnterpriseOrderStatus(service: any, orderNo: string, signal: AbortSignal): Promise<string> {
  for (let attempt = 0; attempt < ENTERPRISE_POLL_ATTEMPTS; attempt += 1) {
    (throwIfEnterpriseAborted(signal), await enterpriseAbortableDelay(ENTERPRISE_POLL_INTERVAL_MS, signal), throwIfEnterpriseAborted(signal));
    let result = await service.checkEnterpriseOrderStatus({ orderNo });
    if (
      (logger.debug(`[useEnterpriseCodingPlanPanelPurchase] 企业订单支付轮询状态`, {
        orderNo,
        attempt: attempt + 1,
        status: result.paymentStatus,
      }),
      isOrderSuccess(result.paymentStatus))
    )
      return result.paymentStatus;
    if (isOrderTerminal(result.paymentStatus)) throw Error(result.paymentStatus);
  }
  throw Error(ENTERPRISE_PAYMENT_CHECK_TIMEOUT_CODE);
}
/** 原 pet（84156 区） */
export function isEnterprisePurchaseCancelledError(error: unknown): boolean {
  return error instanceof Error && error.message === ENTERPRISE_PURCHASE_CANCELLED_MESSAGE;
}
/** 原 met（84159 区） */
export function throwIfEnterpriseAborted(signal: AbortSignal): void {
  if (signal.aborted) throw Error(ENTERPRISE_PURCHASE_CANCELLED_MESSAGE);
}
/** 原 het（84162 区） */
export function enterpriseAbortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(Error(ENTERPRISE_PURCHASE_CANCELLED_MESSAGE));
      return;
    }
    let timer = window.setTimeout(resolve, ms);
    signal.addEventListener(
      `abort`,
      () => {
        (window.clearTimeout(timer), reject(Error(ENTERPRISE_PURCHASE_CANCELLED_MESSAGE)));
      },
      { once: !0 },
    );
  });
}
/** 原 get…jY（84179–84181）：Start Plan 预览缓存 */
const START_PLAN_PREVIEW_TTL_MS = 1440 * 60 * 1e3; // get
let startPlanPreviewCache: { preview: any; expiresAt: number } | null = null; // AY
let startPlanPreviewInFlight: Promise<any> | null = null; // jY
/** 原 MY（84302 / jsx 73953）：useStartPlanPreview */
export function useStartPlanPreview(options?: { enabled?: boolean }) {
  let subscriptionService = useServices()?.codingPlanSubscriptionService,
    enabled = options?.enabled !== !1,
    [state, setState] = React.useState<{ preview: any; loading: boolean; error: string | null }>({
      preview: startPlanPreviewCache?.preview ?? null,
      loading: enabled && !!subscriptionService && !startPlanPreviewCache,
      error: null,
    }),
    refresh = React.useCallback(async () => {
      if (!enabled) {
        setState({ preview: startPlanPreviewCache?.preview ?? null, loading: !1, error: null });
        return;
      }
      if (!subscriptionService || typeof subscriptionService.getStartPlanPreview != `function`) {
        setState({ preview: null, loading: !1, error: `service_unavailable` });
        return;
      }
      setState((current) => ({ preview: current.preview, loading: !0, error: null }));
      try {
        setState({ preview: await startPlanPreviewOf(subscriptionService), loading: !1, error: null });
      } catch (previewError) {
        let normalized = normalizeProductError(previewError);
        (logger.warn(`[useStartPlanPreview] 读取 Start Plan 预览失败`, { error: normalized }),
          setState({ preview: null, loading: !1, error: normalized }));
      }
    }, [enabled, subscriptionService]);
  return (
    (React.useEffect(() => {
      refresh();
    }, [refresh]),
    { ...state, refresh })
  );
}
/** 原 _et（84333 区）：Start Plan 预览取数（TTL+在途去重） */
export async function startPlanPreviewOf(service: any) {
  let stamp = Date.now();
  if (startPlanPreviewCache && startPlanPreviewCache.expiresAt > stamp) return startPlanPreviewCache.preview;
  if (startPlanPreviewInFlight) return startPlanPreviewInFlight;
  startPlanPreviewInFlight = service.getStartPlanPreview();
  try {
    let preview = await startPlanPreviewInFlight;
    return ((startPlanPreviewCache = { preview, expiresAt: stamp + START_PLAN_PREVIEW_TTL_MS }), preview);
  } finally {
    startPlanPreviewInFlight = null;
  }
}
/** 原 vet（84347 区）：竞态超时默认 10s */
const LOGIN_RACE_TIMEOUT_MS = 1e4; // vet
/** 原 yet（84348 区）：promise 竞态超时 */
export async function raceWithTimeout(promise: Promise<unknown>, timeout = LOGIN_RACE_TIMEOUT_MS): Promise<string> {
  let timer: ReturnType<typeof setTimeout> | undefined,
    timeoutPromise = new Promise<string>((resolve) => {
      timer = setTimeout(() => resolve(`timeout`), timeout);
    });
  try {
    return await Promise.race([promise.then(() => `completed`), timeoutPromise]);
  } finally {
    timer !== void 0 && clearTimeout(timer);
  }
}
/** 原 bet…jet（84359–84368）：结账/政策 URL 表 */
const CONSOLE_HOME_URL = envConsoleUrlOf({ ZCODE_ENV: ZCODE_ENV_VALUE }); // bet
const SITE_HOME_URL = envSiteUrlOf({ ZCODE_ENV: ZCODE_ENV_VALUE }); // xet
const FINANCE_PAY_URL = envPathUrlOf({ ZCODE_ENV: ZCODE_ENV_VALUE }, `/finance-center/finance/pay`); // Cet
const BIGMODEL_USER_AGREEMENT_URL = `https://docs.bigmodel.cn/cn/terms/user-agreement`; // wet
const BIGMODEL_SERVICE_AGREEMENT_URL = `https://docs.bigmodel.cn/cn/terms/service-agreement`; // Tet
const BIGMODEL_SUBSCRIPTION_AGREEMENT_URL = `https://docs.bigmodel.cn/cn/terms/subscription-agreement`; // Eet
const BIGMODEL_SUBSCRIPTION_AGREEMENT_TEAM_URL = `https://docs.bigmodel.cn/cn/terms/subscription-agreement-team`; // Det
const ZAI_MANAGE_APIKEY_URL = `https://z.ai/manage-apikey/subscription`; // Oet
const ZAI_DEVPACK_TOOLS_URL = `https://docs.z.ai/devpack/tool/others#step-1-supported-tools`; // ket
const ZAI_TERMS_URL = `https://docs.z.ai/legal-agreement/terms-of-use`; // Aet
const ZAI_SUBSCRIPTION_TERMS_URL2 = `https://docs.z.ai/legal-agreement/subscription-terms`; // jet
/** 原 Met/Net/Pet（84369–84371） */
const SEAT_COUNT_OPTIONS = [1, 3, 6, 12]; // Met
const PERSONAL_PLAN_BUTTON_TESTID = `coding-plan-purchase-personal-plan-button`; // Net
const DEFAULT_ZH_LOCALE = `zh-CN`; // Pet
/** 原 NY（84372）：zh-CN 结账政策文案表 */
const ZH_CHECKOUT_POLICY_COPY = {
  amountLabels: {
    originalAmount: `新套餐原价`,
    discountActivity: `优惠活动`,
    currentPlanCredit: `现有套餐剩余价值`,
    payAmount: `实付金额`,
    deductions: `抵扣费用`,
  },
  periodLabels: { monthly: `月付`, quarterly: `季付`, yearly: `年付` } as Record<string, string>,
  renewalTitle: `续费政策`,
  renewalChargePrefix: `续订将按照「`,
  renewalChargeSuffix: `」发起自动扣费。`,
  renewalChargeFallback: `后续将按所选套餐周期自动续费，实际扣费以续费时账单为准。`,
  renewalDeduction: `扣费优先级：优先扣除赠金，再扣余额，再采用支付宝扣费。`,
  renewalPeriodicBody: `将持续定期扣款，直至您根据我们的服务条款取消服务。`,
  renewalCancelPrefix: `您可在续费日前至少3天，前往「`,
  planOverviewLink: `个人套餐概览页`,
  renewalCancelSuffix: `」关闭自动续费。`,
  accountPolicyTitle: `账号使用规范`,
  accountPolicyDescription: `仅限订阅人在官方许可的产品范围内使用。严禁将账号出借、转让或以任何形式提供给第三方使用，亦不得用于非正当或违反法律法规及平台规则的行为。如发现平台将限制或封禁账号，且不予退款。`,
  accountPolicySections: [
    {
      title: `专享限制`,
      content: [
        `套餐仅限订阅人个人在 Coding 工具中使用。若发现账号出现多人使用等异常情形，用于非编程开发、非正当的或违反法律法规及平台规则的用途，将限制账号权益。`,
      ],
    },
    {
      title: `风控处置`,
      content: [
        `违反`,
        { type: `link`, label: `《用户协议》`, href: BIGMODEL_USER_AGREEMENT_URL },
        `、`,
        { type: `link`, label: `《服务协议》`, href: BIGMODEL_SERVICE_AGREEMENT_URL },
        `、`,
        { type: `link`, label: `《订阅服务协议》`, href: BIGMODEL_SUBSCRIPTION_AGREEMENT_URL },
        `及平台上其他相关规则及约定的，将触发限流或冻结。累计 3 次违规将被永久封禁。`,
      ],
    },
    {
      title: `退款说明`,
      content: [`因违规使用导致账号被封禁的，已支付的套餐费用一律不予退款。`],
    },
  ],
  agreementPrefix: `同意`,
  serviceAgreementLink: `《服务协议》`,
  agreementBetween: `、`,
  subscriptionAgreementLink: `《订阅及自动续费协议》`,
  agreementSuffix: ``,
};
/** 原 Fet（84417 区）：待选计划可在登录后续跑 */
export function isPendingPlanResumable(state: {
  pendingPlanKey: string | null;
  authenticated: boolean;
  productsLoading: boolean;
  productsError: unknown;
  availablePlanKeys: string[];
}): boolean {
  return !!(
    state.pendingPlanKey &&
    state.authenticated &&
    !state.productsLoading &&
    !state.productsError &&
    state.availablePlanKeys.includes(state.pendingPlanKey)
  );
}
/** 原 Iet（84427 区）= Fet 别名 */
const isPendingPlanResumableAlias = isPendingPlanResumable;
void isPendingPlanResumableAlias;
/** 原 PY（84428 区）：登录尝试匹配待选 */
export function isLoginAttemptMatchingPending(state: {
  pending: any;
  loginAttempt: any;
  loginProviderId?: string | null;
}): boolean {
  return !!(
    state.pending &&
    state.loginAttempt?.id === state.pending.loginAttemptId &&
    (!state.loginProviderId || state.loginAttempt.providerId === state.loginProviderId) &&
    state.loginAttempt.status === `succeeded`
  );
}
/** 原 Let（84436 区） */
export function isPlanSelectLoginError(state: { page: string; loginError?: boolean }): boolean {
  return state.page === `planSelect` && state.loginError === !0;
}
/** 原 Ret（84439 区）：登录后续跑的可购产品 */
export function resumablePendingProductOf(state: {
  pendingSelection: any;
  loginAttempt: any;
  loginProviderId?: string | null;
  authenticated: boolean;
  productsLoading: boolean;
  productsError: unknown;
  products: any[];
}): any | null {
  if (
    !state.pendingSelection ||
    !isLoginAttemptMatchingPending({
      pending: state.pendingSelection,
      loginAttempt: state.loginAttempt,
      loginProviderId: state.loginProviderId,
    }) ||
    !state.authenticated ||
    state.productsLoading ||
    state.productsError
  )
    return null;
  let product = state.products.find((candidate) => candidate.productId === state.pendingSelection?.productId);
  return product && hasProductPreview(product) === !0 ? product : null;
}

/* ----------------------------------------------------------------------------
 * §7 zet Coding Plan 购买面板（84460–85995 / jsx 74125）
 * -------------------------------------------------------------------------- */
/** 原 zet（84460 / jsx 74125）：Coding Plan 购买面板（全屏分步） */
export function CodingPlanPurchasePanel({
  open,
  providerId,
  productsProviderId,
  currentPlanLevel,
  currentProductId,
  loginLoading,
  loginError,
  loginAttempt,
  loginProviderId,
  codingPlanPurchaseTokenAuthenticated,
  accountRequirementVisible,
  autoRecoverAuthOnOAuthRequired,
  initialAudience = `personal`,
  initialTeamPlanKey,
  funnelContext,
  productsRefreshToken,
  onOpenChange,
  onLogin,
  onPlanLogin,
  onRetryLoginState,
  onPurchaseComplete,
}: Record<string, any>) {
  let { intl, locale } = useZCodeIntl(),
    platform = usePlatformService(),
    effectiveProviderId = productsProviderId ?? providerId,
    isBigmodelCodingPlan = isBigmodelCodingPlanProvider(effectiveProviderId),
    effectiveAudience = initialAudience === `team` && !isBigmodelCodingPlan ? `personal` : initialAudience,
    providerDisplayName = providerDisplayNameOf(providerId),
    [page, setPage] = React.useState(`planSelect`),
    [audience, setAudience] = React.useState(effectiveAudience),
    [selectedPlanKey, setSelectedPlanKey] = React.useState<string | null>(null),
    [selectedPeriod, setSelectedPeriod] = React.useState(`quarterly`),
    [selectedTeamPlanKey, setSelectedTeamPlanKey] = React.useState<string | null>(null),
    [selectedOptionKey, setSelectedOptionKey] = React.useState<string | null>(null),
    [maxSeats, setMaxSeats] = React.useState(2),
    [duration, setDuration] = React.useState(1),
    [useGiftBalance, setUseGiftBalance] = React.useState(!1),
    [useCashBalance, setUseCashBalance] = React.useState(!1),
    [pendingOrder, setPendingOrder] = React.useState<any>(null),
    [pendingOrderResume, setPendingOrderResume] = React.useState<any>(null),
    [pendingOrderError, setPendingOrderError] = React.useState<string | null>(null),
    [cancelConfirmOpen, setCancelConfirmOpen] = React.useState(!1),
    [cancelConfirmError, setCancelConfirmError] = React.useState<string | null>(null),
    [termsAccepted, setTermsAccepted] = React.useState(!1),
    [refreshPending, setRefreshPending] = React.useState(!1),
    productsRefreshTokenRef = React.useRef(productsRefreshToken),
    autoRecoverErrorRef = React.useRef<string | null>(null),
    purchaseCompletedRef = React.useRef(!1),
    funnelIdRef = React.useRef<string | null>(null),
    teamLoginPendingRef = React.useRef<any>(null),
    requestEpochRef = React.useRef(0),
    panelOpenRef = React.useRef(open),
    selectedTeamPlanKeyRef = React.useRef(selectedTeamPlanKey),
    personalLoginPendingRef = React.useRef<any>(null),
    paymentConfirmPendingRef = React.useRef<any>(null),
    pendingSelectionRef = React.useRef<any>(null);
  ((panelOpenRef.current = open), (selectedTeamPlanKeyRef.current = selectedTeamPlanKey));
  let products = useCodingPlanProducts(effectiveProviderId, { remotePreviewEnabled: accountRequirementVisible !== !0 }),
    startPlanPreview = useStartPlanPreview({ enabled: open }),
    billingDiscount = useBillingDiscount(),
    productList = products.snapshot?.productList ?? [],
    planGroups = React.useMemo(() => personalPlanGroupsOf(productList), [productList]),
    selectedPlan = planGroups.find((group) => group.key === selectedPlanKey) ?? planGroups[0] ?? null,
    selectedProduct =
      (selectedPlan ? selectedPlan.products.filter((product: any) => periodOfProduct(product) === selectedPeriod) : [])[0] ??
      selectedPlan?.products.find((product: any) => periodOfProduct(product) === `quarterly`) ??
      selectedPlan?.products[0] ??
      null,
    currentProduct = React.useMemo(() => currentProductOfId(currentProductId, productList), [currentProductId, productList]),
    startPlanChoiceState = startPlanChoiceStateOf({
      previewAvailable: !!startPlanPreview.preview,
      previewLoading: startPlanPreview.loading,
      currentPlanLevel,
      currentProduct,
      purchaseAuthenticated: codingPlanPurchaseTokenAuthenticated,
    }),
    purchase = useCodingPlanPurchase({
      providerId: effectiveProviderId,
      batchPreview: products.snapshot,
      funnelContext,
      onComplete: () => {
        (setPage(`success`),
          setRefreshPending(!1),
          (personalLoginPendingRef.current = null),
          (teamLoginPendingRef.current = null),
          (pendingSelectionRef.current = null),
          products.refresh({ force: !0 }));
      },
    }),
    productsOAuthRequired = isOAuthRequiredError(products.error ?? ``),
    systemBusyError = products.error && isSystemBusyError(products.error) ? products.error : null,
    authRecoverySubscribeAvailable = isOAuthFamilyProvider(providerId) && codingPlanPurchaseTokenAuthenticated === !0 && productsOAuthRequired && !!onLogin,
    accountRequirementActive = isAccountRequirementVisible({
      accountRequirementVisible: accountRequirementVisible === !0,
      productsOAuthRequired,
      authRecoverySubscribeAvailable,
    }),
    previewGateActive = productsOAuthRequired || (accountRequirementActive && products.error === null && productList.some((product: any) => product.hasPreview !== !0)),
    teamEnabled = isBigmodelCodingPlan,
    publicTeamProducts = useEnterpriseCodingPlanProducts({ enabled: teamEnabled && open, authenticated: !1 }),
    authenticatedTeamProducts = useEnterpriseCodingPlanProducts({
      enabled: teamEnabled && open && (audience === `team` || codingPlanPurchaseTokenAuthenticated === !0),
      authenticated: !0,
    }),
    publicTeamProductList = publicTeamProducts.snapshot?.productList ?? [],
    authenticatedTeamProductList = authenticatedTeamProducts.snapshot?.productList ?? [],
    mergedTeamProducts = mergePublicAndAuthenticatedProducts({
      publicProducts: publicTeamProductList,
      authenticatedProducts: authenticatedTeamProductList,
    }),
    tierFormatter = tierMessageFormatterOf(intl),
    teamPlanGroups = React.useMemo(() => teamPlanGroupsOf(mergedTeamProducts, { locale, formatMessage: tierFormatter }), [tierFormatter, locale, mergedTeamProducts]),
    isTeam = audience === `team`,
    authenticatedTeamPlanGroups = React.useMemo(
      () => teamPlanGroupsOf(authenticatedTeamProductList, { locale, formatMessage: tierFormatter }),
      [authenticatedTeamProductList, tierFormatter, locale],
    ),
    selectedTeamPlan = authenticatedTeamPlanGroups.find((group) => group.key === selectedTeamPlanKey) ?? null,
    enterpriseSelection = resolveEnterpriseSelection(selectedTeamPlan, selectedOptionKey),
    enterprisePurchase = useEnterpriseCodingPlanPanelPurchase({
      selection: enterpriseSelection
        ? { product: enterpriseSelection, maxSeats, duration, useGiftBalance, useCashBalance }
        : null,
      funnelContext,
      onComplete: () => {
        (setPage(`success`),
          setRefreshPending(!1),
          authenticatedTeamProducts.refresh({ force: !0 }),
          publicTeamProducts.refresh({ force: !0 }),
          products.refresh({ force: !0 }));
      },
    });
  React.useEffect(() => {
    let balance = enterprisePurchase.balance;
    (useGiftBalance && !isBalanceUsable(enterprisePurchase.balanceLoading, balance?.giveBalance) && setUseGiftBalance(!1),
      useCashBalance && !isBalanceUsable(enterprisePurchase.balanceLoading, balance?.cashBalance) && setUseCashBalance(!1));
  }, [enterprisePurchase.balance, enterprisePurchase.balanceLoading, useCashBalance, useGiftBalance]);
  let pendingOrderEstimate = pendingOrderResume ? estimateSummaryOf(pendingOrderResume.order) : null,
    pendingOrderProduct = pendingOrderResume?.product ?? enterpriseSelection,
    pendingOrderSeats = pendingOrderResume?.order.seatCount ?? maxSeats,
    pendingOrderDuration = pendingOrderResume && pendingOrderProduct ? orderDurationOf(pendingOrderResume.order, pendingOrderProduct) : duration,
    effectiveEstimate = pendingOrderEstimate ?? enterprisePurchase.estimate,
    effectiveEstimating = pendingOrderResume ? !1 : enterprisePurchase.estimating,
    effectiveEstimateError = pendingOrderResume ? null : enterprisePurchase.estimateError,
    teamSummary =
      isTeam && pendingOrderProduct
        ? {
            seats: pendingOrderSeats,
            purchaseMethodName: pendingOrderProduct.purchaseMethodName,
            servicePeriod: enterpriseServicePeriodOf(pendingOrderProduct, pendingOrderDuration, intl),
            payAmount: effectiveEstimate?.thirdPayAmount ?? null,
          }
        : null,
    teamLoading = publicTeamProducts.loading || (publicTeamProductList.length === 0 && authenticatedTeamProducts.loading),
    teamError = publicTeamProducts.error ?? authenticatedTeamProducts.error;
  (React.useEffect(() => {
    open ||
      ((requestEpochRef.current += 1),
      (funnelIdRef.current = null),
      setPage(`planSelect`),
      setAudience(effectiveAudience),
      setSelectedPlanKey(null),
      setSelectedPeriod(`quarterly`),
      setSelectedTeamPlanKey(null),
      setSelectedOptionKey(null),
      setMaxSeats(2),
      setDuration(1),
      setUseGiftBalance(!1),
      setUseCashBalance(!1),
      setPendingOrder(null),
      setPendingOrderResume(null),
      setPendingOrderError(null),
      setCancelConfirmOpen(!1),
      setCancelConfirmError(null),
      setTermsAccepted(!1),
      setRefreshPending(!1),
      (purchaseCompletedRef.current = !1),
      purchase.clearPreparedPaymentPreview(),
      purchase.closePaymentDialog(),
      purchase.closeOverseasPaymentDialog(),
      enterprisePurchase.closePaymentDialog());
  }, [
    enterprisePurchase.closePaymentDialog,
    effectiveAudience,
    open,
    purchase.clearPreparedPaymentPreview,
    purchase.closeOverseasPaymentDialog,
    purchase.closePaymentDialog,
  ]),
    React.useEffect(() => {
      !open ||
        !funnelContext ||
        (funnelIdRef.current !== funnelContext.purchaseFunnelId && ((funnelIdRef.current = funnelContext.purchaseFunnelId), trackFunnelStart(platform, funnelContext)));
    }, [funnelContext, open, platform]),
    React.useEffect(() => {
      if (!open) {
        teamLoginPendingRef.current = null;
        return;
      }
      setAudience(effectiveAudience);
    }, [effectiveAudience, open]),
    React.useEffect(() => {
      let key = initialTeamPlanKey?.trim() ?? ``;
      if (!open || effectiveAudience !== `team` || !key || loginLoading || teamLoginPendingRef.current === key || !teamPlanGroups.find((group) => group.key === key)) return;
      ((teamLoginPendingRef.current = key), setAudience(`team`), setSelectedTeamPlanKey(key), (selectedTeamPlanKeyRef.current = key), setPendingOrderResume(null), setPendingOrder(null), setPendingOrderError(null), setTermsAccepted(!1));
      let requestId = ++requestEpochRef.current;
      enterprisePurchase.checkPendingOrder().then((order) => {
        if (
          isPendingRequestCurrent({
            requestId,
            currentRequestId: requestEpochRef.current,
            panelOpen: panelOpenRef.current,
            requestedPlanKey: key,
            currentSelectedPlanKey: selectedTeamPlanKeyRef.current,
          })
        ) {
          if (order) {
            setPendingOrder({ order, selectedPlanKey: key });
            return;
          }
          setPage(`billingCycleSelect`);
        }
      });
    }, [effectiveAudience, enterprisePurchase, initialTeamPlanKey, loginLoading, open, teamPlanGroups]),
    React.useEffect(() => {
      isBigmodelCodingPlan || audience !== `team` || setAudience(`personal`);
    }, [audience, isBigmodelCodingPlan]),
    React.useEffect(() => {
      !open || planGroups.length === 0 || selectedPlanKey || setSelectedPlanKey(planGroups[0]?.key ?? null);
    }, [open, planGroups, selectedPlanKey]),
    React.useEffect(() => {
      if (!selectedTeamPlan) {
        setSelectedOptionKey(null);
        return;
      }
      let options = purchaseOptionsOf(selectedTeamPlan.products);
      (selectedOptionKey && options.some((option) => option.key === selectedOptionKey)) || setSelectedOptionKey(options[0]?.key ?? null);
    }, [selectedTeamPlan, selectedOptionKey]),
    React.useEffect(() => {
      if (!selectedPlan || selectedPlan.products.some((product: any) => periodOfProduct(product) === selectedPeriod)) return;
      let fallback = selectedPlan.products[0];
      fallback && setSelectedPeriod(periodOfProduct(fallback));
    }, [selectedPeriod, selectedPlan]),
    React.useEffect(() => {
      productsRefreshToken === void 0 ||
        productsRefreshTokenRef.current === productsRefreshToken ||
        ((productsRefreshTokenRef.current = productsRefreshToken), products.refresh({ force: !0 }), authenticatedTeamProducts.refresh({ force: !0 }));
    }, [authenticatedTeamProducts, products, productsRefreshToken]),
    React.useEffect(() => {
      let pending = pendingSelectionRef.current,
        product = resumablePendingProductOf({
          pendingSelection: pending,
          loginAttempt,
          loginProviderId,
          authenticated: codingPlanPurchaseTokenAuthenticated === !0,
          productsLoading: products.loading,
          productsError: products.error,
          products: productList,
        });
      if (!open || !pending || !product) return;
      if (pending.kind === `paymentConfirm`) {
        ((pendingSelectionRef.current = null), setPage(`paymentConfirm`), purchase.preparePaymentPreview(product));
        return;
      }
      let preview =
        purchase.preparedPaymentPreview?.product.productId === product.productId
          ? purchase.preparedPaymentPreview.preview
          : void 0;
      if (!preview) {
        purchase.preparePaymentPreview(product);
        return;
      }
      ((pendingSelectionRef.current = null), setPage(`payment`), purchase.purchase(product, preview));
    }, [codingPlanPurchaseTokenAuthenticated, loginAttempt, loginProviderId, open, productList, products.error, products.loading, purchase]),
    React.useEffect(() => {
      autoRecoverAuthOnOAuthRequired !== !0 ||
        !open ||
        !products.error ||
        !productsOAuthRequired ||
        !onLogin ||
        (autoRecoverErrorRef.current !== products.error && ((autoRecoverErrorRef.current = products.error), onLogin(oauthRecoveryOptionOf(products.error))));
    }, [autoRecoverAuthOnOAuthRequired, onLogin, open, products.error, productsOAuthRequired]),
    React.useEffect(() => {
      (!products.error || !productsOAuthRequired) && (autoRecoverErrorRef.current = null);
    }, [products.error, productsOAuthRequired]));
  let handleDone = () => {
      if (page === `success`) {
        handleSuccessClose();
        return;
      }
      ((requestEpochRef.current += 1),
        purchase.closePaymentDialog(),
        purchase.closeOverseasPaymentDialog(),
        enterprisePurchase.closePaymentDialog(),
        onOpenChange(!1));
    },
    handleSuccessClose = () => {
      if (!purchaseCompletedRef.current) {
        purchaseCompletedRef.current = !0;
        let completion = onPurchaseComplete?.();
        if (completion && typeof completion.finally == `function`) {
          (setRefreshPending(!0),
            raceWithTimeout(completion)
              .then((outcome) => {
                outcome === `timeout` &&
                  logger.warn(`[CodingPlanPurchasePanel] 完成购买后刷新权益超时，先关闭成功页`);
              })
              .catch((error) => {
                logger.warn(`[CodingPlanPurchasePanel] 完成购买后刷新权益失败`, error);
              })
              .finally(() => {
                (setRefreshPending(!1), onOpenChange(!1));
              }));
          return;
        }
      }
      onOpenChange(!1);
    },
    handleSelectPersonalProduct = (product: any) => {
      if (!product || loginLoading) return;
      if (accountRequirementActive || (previewGateActive && (products.error || hasProductPreview(product) !== !0))) {
        let attemptId = onLogin?.(oauthRecoveryOptionOf(products.error));
        pendingSelectionRef.current =
          typeof attemptId == `number`
            ? { kind: `payment`, productId: product.productId, loginAttemptId: attemptId }
            : null;
        return;
      }
      let preview =
        purchase.preparedPaymentPreview?.product.productId === product.productId
          ? purchase.preparedPaymentPreview.preview
          : void 0;
      if (!preview) {
        purchase.preparePaymentPreview(product);
        return;
      }
      (setPage(`payment`), purchase.purchase(product, preview));
    },
    handleConfirmPersonalProduct = (product: any) => {
      if (!(!product || loginLoading)) {
        if (accountRequirementActive || (previewGateActive && (products.error || hasProductPreview(product) !== !0))) {
          let attemptId = onLogin?.(oauthRecoveryOptionOf(products.error));
          pendingSelectionRef.current =
            typeof attemptId == `number`
              ? { kind: `paymentConfirm`, productId: product.productId, loginAttemptId: attemptId }
              : null;
          return;
        }
        (setPage(`paymentConfirm`), purchase.preparePaymentPreview(product));
      }
    },
    handleSelectPlan = (planKey: string) => {
      if (loginLoading) return;
      if (subscriptionGateActionOf({ subscriptionBusy: !!systemBusyError, authenticated: codingPlanPurchaseTokenAuthenticated === !0 }) === `login`) {
        if (onPlanLogin) {
          onPlanLogin({ audience: `personal`, planKey });
          return;
        }
        let attemptId = onLogin?.(systemBusyError ? { forceOAuth: !0 } : void 0);
        personalLoginPendingRef.current = typeof attemptId == `number` ? { planKey, loginAttemptId: attemptId } : null;
        return;
      }
      let group = planGroups.find((candidate) => candidate.key === planKey);
      (group &&
        trackPlanSelectEvent(platform, funnelContext, {
          eventText: actionLabelOf(personalPlanActionStateOf(group, planGroups, currentPlanLevel, currentProduct, !!systemBusyError), intl),
          purchaseAudience: `personal`,
          productGroupId: group.key,
          productName: group.title,
          planTier: funnelTierOf(group.key || group.title),
        }),
        setAudience(`personal`),
        setSelectedPlanKey(planKey),
        setPage(`billingCycleSelect`));
    };
  React.useEffect(() => {
    let pending = personalLoginPendingRef.current;
    !open ||
      !isLoginAttemptMatchingPending({ pending, loginAttempt, loginProviderId }) ||
      !isPendingPlanResumable({
        pendingPlanKey: pending?.planKey ?? null,
        authenticated: codingPlanPurchaseTokenAuthenticated === !0,
        productsLoading: products.loading,
        productsError: products.error,
        availablePlanKeys: planGroups.map((group) => group.key),
      }) ||
      ((personalLoginPendingRef.current = null), handleSelectPlan(pending.planKey));
  }, [codingPlanPurchaseTokenAuthenticated, loginAttempt, loginProviderId, open, planGroups, products.error, products.loading]);
  let handleSelectTeamPlan = (planKey: string) => {
    if (loginLoading) return;
    if (codingPlanPurchaseTokenAuthenticated !== !0) {
      if (onPlanLogin) {
        onPlanLogin({ audience: `team`, planKey });
        return;
      }
      let attemptId = onLogin?.();
      teamLoginPendingRef.current = typeof attemptId == `number` ? { planKey, loginAttemptId: attemptId } : null;
      return;
    }
    let group = teamPlanGroups.find((candidate) => candidate.key === planKey);
    (group &&
      trackPlanSelectEvent(platform, funnelContext, {
        eventText: intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.selectPlan` }),
        purchaseAudience: `team`,
        productGroupId: group.key,
        productName: group.title,
        planTier: funnelTeamTierOf(group.key || group.title),
      }),
      setAudience(`team`),
      setSelectedTeamPlanKey(planKey),
      (selectedTeamPlanKeyRef.current = planKey),
      setPendingOrderResume(null),
      setPendingOrder(null),
      setPendingOrderError(null),
      setTermsAccepted(!1));
    let requestId = ++requestEpochRef.current;
    enterprisePurchase.checkPendingOrder().then((order) => {
      if (
        isPendingRequestCurrent({
          requestId,
          currentRequestId: requestEpochRef.current,
          panelOpen: panelOpenRef.current,
          requestedPlanKey: planKey,
          currentSelectedPlanKey: selectedTeamPlanKeyRef.current,
        })
      ) {
        if (order) {
          setPendingOrder({ order, selectedPlanKey: planKey });
          return;
        }
        setPage(`billingCycleSelect`);
      }
    });
  };
  (React.useEffect(() => {
    let pending = teamLoginPendingRef.current;
    !open ||
      !isLoginAttemptMatchingPending({ pending, loginAttempt, loginProviderId }) ||
      !isPendingPlanResumable({
        pendingPlanKey: pending?.planKey ?? null,
        authenticated: codingPlanPurchaseTokenAuthenticated === !0,
        productsLoading: authenticatedTeamProducts.loading,
        productsError: authenticatedTeamProducts.error,
        availablePlanKeys: teamPlanGroups.map((group) => group.key),
      }) ||
      ((teamLoginPendingRef.current = null), handleSelectTeamPlan(pending.planKey));
  }, [authenticatedTeamProducts.error, authenticatedTeamProducts.loading, codingPlanPurchaseTokenAuthenticated, loginAttempt, loginProviderId, open, teamPlanGroups]),
    React.useEffect(() => {
      for (let ref of [personalLoginPendingRef, teamLoginPendingRef, pendingSelectionRef]) {
        let pending = ref.current;
        pending &&
          (loginAttempt?.id !== pending.loginAttemptId || loginAttempt.status === `cancelled` || loginAttempt.status === `failed`) &&
          (ref.current = null);
      }
    }, [loginAttempt]));
  let handleCancelPendingOrder = () => {
      let pending = pendingOrder;
      pending &&
        (setPendingOrderError(null),
        enterprisePurchase.cancelPendingOrder(pending.order.orderNo).then((cancelled) => {
          if (!cancelled) {
            setPendingOrderError(enterprisePurchase.error);
            return;
          }
          (setPendingOrder(null), setPendingOrderResume(null), setSelectedTeamPlanKey(pending.selectedPlanKey), setTermsAccepted(!1), setPage(`billingCycleSelect`));
        }));
    },
    handleContinuePendingOrder = () => {
      let pending = pendingOrder;
      if (!pending) return;
      let found = teamProductOfId(authenticatedTeamPlanGroups, pending.order.productId);
      if (!found) {
        setPendingOrderError(
          intl.formatMessage({
            id: `settings.modelProvider.codingPlan.enterprise.pendingOrderProductMissing`,
          }),
        );
        return;
      }
      (setPendingOrder(null),
        setPendingOrderError(null),
        setPendingOrderResume({ order: pending.order, product: found.product }),
        setSelectedTeamPlanKey(found.group.key),
        setSelectedOptionKey(purchaseOptionKeyOf(found.product)),
        setMaxSeats(pending.order.seatCount),
        setTermsAccepted(!1),
        setPage(`paymentConfirm`));
    },
    handleCancelCreatedOrder = () => {
      let orderNo = enterprisePurchase.createdOrderNo;
      if (!orderNo) {
        (setCancelConfirmOpen(!1), setPage(`billingCycleSelect`));
        return;
      }
      (setCancelConfirmError(null),
        enterprisePurchase.cancelPendingOrder(orderNo).then((cancelled) => {
          if (!cancelled) {
            setCancelConfirmError(enterprisePurchase.error);
            return;
          }
          (enterprisePurchase.clearCreatedOrderResumeState(),
            enterprisePurchase.closePaymentDialog(),
            setCancelConfirmOpen(!1),
            setCancelConfirmError(null),
            setPendingOrderResume(null),
            setTermsAccepted(!1),
            setPage(`billingCycleSelect`));
        }));
    },
    handleContinueCreatedOrder = () => {
      (setCancelConfirmOpen(!1), setCancelConfirmError(null), setTermsAccepted(!1));
    },
    preparedPreview = purchase.preparedPaymentPreview,
    personalPreview = preparedPreview && preparedPreview.product.productId === selectedProduct?.productId ? preparedPreview.preview : null,
    securityErrorVisible = purchase.error !== `coding_plan_security_verification_cancelled` || page === `paymentConfirm`,
    panelTitle = panelTitleOf(page, intl, isTeam, effectiveProviderId),
    isFullHeight = page !== `planSelect` && (page !== `billingCycleSelect` || isTeam) && (page !== `paymentConfirm` || isTeam),
    summaryProduct = isTeam ? enterpriseSelection : selectedProduct,
    personalSummary =
      !isTeam && selectedProduct
        ? {
            purchaseMethodName: intl.formatMessage({ id: PERIOD_LABEL_KEYS[periodOfProduct(selectedProduct)] }),
            servicePeriod: personalServicePeriodOf(selectedProduct, intl),
            payAmount: personalPreview?.thirdPartyAmount ?? personalPreview?.payAmount ?? null,
          }
        : null,
    panelMaxWidth = `max-w-5xl`;
  return effectiveProviderId !== PROVIDER_IDS.bigmodelCodingPlan && !isOAuthFamilyProvider(effectiveProviderId) ? null : (
    <>
      {open ? (
        <section className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-background pt-12 text-foreground`}>
          <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto`}>
            <header className={`bg-background px-6 py-4 max-sm:px-4`}>
              <div className={cn(`mx-auto flex w-full items-center justify-between gap-3`, panelMaxWidth)}>
                <div className={`flex min-w-0 items-center gap-2`}>
                  {page !== `planSelect` && page !== `success` ? (
                    <Button
                      type={`button`}
                      variant={`ghost`}
                      size={`icon-lg`}
                      className={`rounded-xl`}
                      aria-label={intl.formatMessage({ id: `common.back` })}
                      onClick={() => {
                        if (page === `payment`) {
                          (purchase.closePaymentDialog(),
                            purchase.closeOverseasPaymentDialog(),
                            enterprisePurchase.closePaymentDialog(),
                            setPage(`paymentConfirm`));
                          return;
                        }
                        if (page === `paymentConfirm`) {
                          if (isTeam && enterprisePurchase.createdOrderNo && !pendingOrderResume) {
                            (setCancelConfirmOpen(!0), setCancelConfirmError(null));
                            return;
                          }
                          if (isTeam && pendingOrderResume) {
                            (setPendingOrderResume(null), setTermsAccepted(!1), setPage(`planSelect`));
                            return;
                          }
                          (purchase.clearPreparedPaymentPreview(), setPage(`billingCycleSelect`));
                          return;
                        }
                        setPage(`planSelect`);
                      }}
                    >
                      <BackIcon className={`size-4`} />
                    </Button>
                  ) : null}
                  <h2 className={`truncate text-ui-lg font-medium`}>{panelTitle}</h2>
                </div>
                <Button
                  type={`button`}
                  variant={`ghost`}
                  size={`icon-lg`}
                  className={`rounded-xl`}
                  aria-label={intl.formatMessage({ id: `common.close` })}
                  onClick={handleDone}
                >
                  <CloseIcon className={`size-4`} />
                </Button>
              </div>
            </header>
            <main className={cn(`mx-auto flex w-full flex-1 flex-col px-6 py-8 max-sm:px-4 max-sm:py-5`, panelMaxWidth)}>
              <div className={cn(`min-h-0`, isFullHeight ? `flex-1` : null)}>
                {isPlanSelectLoginError({ page, loginError }) ? (
                  <div className={`mb-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-ui-base text-foreground-subtle`}>
                    <span>{intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.authStateError` })}</span>
                    <Button size={`sm`} variant={`outline`} onClick={onRetryLoginState}>
                      <RefreshIcon className={`size-3.5`} />
                      {intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.authStateRetry` })}
                    </Button>
                  </div>
                ) : null}
                {products.loading && !products.snapshot ? (
                  <InfoNoticeCard
                    icon={<Spinner className={`size-4 animate-spin`} />}
                    title={intl.formatMessage({ id: `settings.modelProvider.codingPlan.productsLoading` })}
                    description={intl.formatMessage(
                      { id: `settings.modelProvider.codingPlan.productsLoadingDescription` },
                      { provider: providerDisplayName },
                    )}
                  />
                ) : productList.length === 0 ? (
                  <InfoNoticeCard
                    title={intl.formatMessage({ id: `settings.modelProvider.codingPlan.productsEmpty` })}
                    description={intl.formatMessage(
                      { id: `settings.modelProvider.codingPlan.productsEmptyDescription` },
                      { provider: providerDisplayName },
                    )}
                  />
                ) : (
                  <>
                    {page === `planSelect` && systemBusyError ? (
                      <div className={`mb-3 rounded-xl border border-border bg-surface p-3 text-ui-base text-foreground-subtle`}>
                        {productErrorMessageOf(systemBusyError, intl)}
                      </div>
                    ) : null}
                    {purchase.error && securityErrorVisible ? (
                      <div className={`mb-3 rounded-xl border border-border bg-surface p-3 text-ui-base text-foreground-subtle`}>
                        {productErrorMessageOf(purchase.error, intl)}
                      </div>
                    ) : null}
                    {page === `planSelect` ? (
                      <PlanSelectSections
                        providerId={effectiveProviderId}
                        teamAudienceAvailable={isBigmodelCodingPlan}
                        planGroups={planGroups}
                        startPlanChoiceState={startPlanChoiceState}
                        startPlanPreview={startPlanPreview.preview}
                        currentPlanLevel={currentPlanLevel}
                        currentProduct={currentProduct}
                        subscriptionBusy={!!systemBusyError}
                        teamPlanGroups={teamPlanGroups}
                        teamLoading={teamLoading}
                        teamError={teamError}
                        billingDiscountActive={billingDiscount.active}
                        billingDiscountConfig={billingDiscount.config}
                        onSelectPlan={handleSelectPlan}
                        onSelectTeamPlan={handleSelectTeamPlan}
                      />
                    ) : page === `billingCycleSelect` ? (
                      isTeam ? (
                        <EnterpriseCheckoutPanel
                          selectedPlan={selectedTeamPlan}
                          selectedOptionKey={selectedOptionKey}
                          maxSeats={maxSeats}
                          duration={duration}
                          balance={enterprisePurchase.balance}
                          balanceLoading={enterprisePurchase.balanceLoading}
                          balanceError={enterprisePurchase.balanceError}
                          estimate={enterprisePurchase.estimate}
                          estimating={enterprisePurchase.estimating}
                          useGiftBalance={useGiftBalance}
                          useCashBalance={useCashBalance}
                          loading={authenticatedTeamProducts.loading || !!loginLoading}
                          locale={locale}
                          onSelectedOptionChange={setSelectedOptionKey}
                          onMaxSeatsChange={setMaxSeats}
                          onDurationChange={setDuration}
                          onRefreshBalance={enterprisePurchase.refreshBalance}
                          onUseGiftBalanceChange={setUseGiftBalance}
                          onUseCashBalanceChange={setUseCashBalance}
                          onContinue={() => {
                            (pendingOrderProduct &&
                              trackPlanSelectEvent(platform, funnelContext, {
                                eventText: intl.formatMessage({
                                  id: `settings.modelProvider.codingPlan.purchase.continueToPayment`,
                                }),
                                purchaseAudience: `team`,
                                productId: pendingOrderProduct.productId,
                                productName: pendingOrderProduct.productName ?? pendingOrderProduct.productId,
                                planTier: funnelTeamTierOf(pendingOrderProduct.tier),
                                billingPeriod: funnelSubscribePeriodOf(pendingOrderProduct.subscribePeriod),
                                purchaseMethod: funnelSubscribeModeOf(pendingOrderProduct.subscribeMode),
                                paymentMethod: `alipay`,
                                seatCount: String(pendingOrderSeats),
                                durationMonths:
                                  funnelSubscribeModeOf(pendingOrderProduct.subscribeMode) === `one_time`
                                    ? String(pendingOrderDuration)
                                    : ``,
                                currency: `CNY`,
                                amount: funnelAmountOf(effectiveEstimate?.thirdPayAmount),
                              }),
                              setPendingOrderResume(null),
                              setTermsAccepted(!1),
                              setPage(`paymentConfirm`));
                          }}
                        />
                      ) : (
                        <BillingCycleSelectPersonal
                          selectedPlan={selectedPlan}
                          currentPlanLevel={currentPlanLevel}
                          currentProduct={currentProduct}
                          loading={products.loading || !!loginLoading}
                          locale={locale}
                          onSelectProduct={(product: any) => {
                            let current = currentPlanEntryOf(productList, currentPlanLevel, currentProduct);
                            (trackPlanSelectEvent(platform, funnelContext, {
                              eventText: billingCycleActionLabelOf(product, personalActionStateOf(product, !!current, current, currentProduct), intl),
                              purchaseAudience: `personal`,
                              productId: product.productId,
                              productName: productTitleOf(product),
                              planTier: funnelTierOf(product.productName ?? product.productId),
                              billingPeriod: funnelPeriodOf(periodOfProduct(product)),
                              purchaseMethod: `continuous`,
                              paymentMethod: ``,
                              currency: normalizeCurrency(product.priceCurrency),
                              amount: funnelAmountOf(primaryAmountOf(product)),
                            }),
                              setSelectedPeriod(periodOfProduct(product)),
                              setTermsAccepted(!1),
                              handleConfirmPersonalProduct(product));
                          }}
                          onRefresh={() => void products.refresh({ force: !0 })}
                        />
                      )
                    ) : page === `paymentConfirm` ? (
                      isTeam ? (
                        <EnterprisePaymentConfirm
                          selectedProduct={pendingOrderProduct}
                          maxSeats={pendingOrderSeats}
                          estimate={effectiveEstimate}
                          estimating={effectiveEstimating}
                          estimateError={effectiveEstimateError}
                          purchasing={enterprisePurchase.purchasing}
                          locale={locale}
                          termsAccepted={termsAccepted}
                          onTermsAcceptedChange={setTermsAccepted}
                          onConfirm={() => {
                            if ((setPage(`payment`), pendingOrderResume)) {
                              enterprisePurchase.confirmPendingOrderPayment({
                                pendingOrder: pendingOrderResume.order,
                                product: pendingOrderResume.product,
                              });
                              return;
                            }
                            enterprisePurchase.confirmPurchase();
                          }}
                        />
                      ) : (
                        <PersonalPaymentConfirm
                          providerId={effectiveProviderId}
                          selectedProduct={selectedProduct}
                          preview={personalPreview}
                          previewLoading={
                            purchase.previewingProductId === selectedProduct?.productId ||
                            purchase.securityVerificationLoading
                          }
                          confirming={!!loginLoading}
                          termsAccepted={termsAccepted}
                          onTermsAcceptedChange={setTermsAccepted}
                          onConfirm={() => handleSelectPersonalProduct(selectedProduct)}
                        />
                      )
                    ) : page === `payment` ? (
                      <PaymentStage
                        purchasing={isTeam ? enterprisePurchase.purchasing : !!purchase.purchasingProductId}
                        polling={isTeam ? enterprisePurchase.paymentPolling : purchase.paymentPolling}
                        paymentDialog={isTeam ? enterprisePurchase.paymentDialog : purchase.paymentDialog}
                        paymentExpired={isTeam ? enterprisePurchase.paymentExpired : purchase.paymentExpired}
                        overseasPaymentDialog={isTeam ? null : purchase.overseasPaymentDialog}
                        securityVerificationLoading={isTeam ? !1 : purchase.securityVerificationLoading}
                        onRefreshPayment={
                          isTeam
                            ? () => {
                                if (pendingOrderResume) {
                                  enterprisePurchase.confirmPendingOrderPayment({
                                    pendingOrder: pendingOrderResume.order,
                                    product: pendingOrderResume.product,
                                  });
                                  return;
                                }
                                enterprisePurchase.refreshPaymentDialog();
                              }
                            : purchase.refreshPaymentDialog
                        }
                        onStartPaypalAuthorization={purchase.startPaypalAuthorization}
                        onCompletePaypalPayment={purchase.completePaypalPayment}
                        onQueryStripeCards={purchase.queryStripeCards}
                        onBindStripePaymentMethod={purchase.bindStripePaymentMethod}
                        onUnbindStripeCard={purchase.unbindStripeCard}
                        onPayWithStripePaymentMethod={purchase.payWithStripePaymentMethod}
                      />
                    ) : (
                      <PurchaseSuccessView
                        selectedProduct={summaryProduct}
                        personalSummary={isTeam ? null : personalSummary}
                        teamSummary={isTeam ? teamSummary : null}
                        onManageTeamPlan={isTeam ? () => platform.openExternal(SITE_HOME_URL) : void 0}
                        refreshPending={refreshPending}
                        onDone={handleDone}
                      />
                    )}
                  </>
                )}
              </div>
            </main>
          </div>
        </section>
      ) : null}
      <PendingOrderDialog
        open={!!pendingOrder}
        error={pendingOrderError ?? enterprisePurchase.error}
        checking={enterprisePurchase.pendingOrderLoading}
        cancelling={enterprisePurchase.pendingOrderCancelling}
        onOpenChange={(next: any) => {
          next || enterprisePurchase.pendingOrderLoading || enterprisePurchase.pendingOrderCancelling || (setPendingOrder(null), setPendingOrderError(null));
        }}
        onCancelOrder={handleCancelPendingOrder}
        onContinuePayment={handleContinuePendingOrder}
      />
      <PendingOrderDialog
        open={cancelConfirmOpen}
        error={cancelConfirmError ?? enterprisePurchase.error}
        checking={!1}
        cancelling={enterprisePurchase.pendingOrderCancelling}
        onOpenChange={(next: any) => {
          next || enterprisePurchase.pendingOrderCancelling || (setCancelConfirmOpen(!1), setCancelConfirmError(null));
        }}
        onCancelOrder={handleCancelCreatedOrder}
        onContinuePayment={handleContinueCreatedOrder}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// §7b 本地 85328–85995（pay_range 8717–9384）：待支付订单对话框 + 套餐选择区 + 个人计费周期选择
// 把握度：高（逐字转录）
// ─────────────────────────────────────────────────────────────────────────────

// Bet → PendingOrderDialog（本地 85328）
function PendingOrderDialog({
  open,
  error,
  checking,
  cancelling,
  onOpenChange,
  onCancelOrder,
  onContinuePayment,
}: any) {
  const { intl } = useZCodeIntl();
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-sm gap-4 rounded-xl p-5`}>
        <DialogHeader className={`gap-2`}>
          <DialogTitle className={`text-ui-lg font-medium`}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.enterprise.pendingOrderTitle`,
            })}
          </DialogTitle>
          <DialogDescription className={`text-ui-base leading-5 text-foreground-subtle`}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.enterprise.pendingOrderDescription`,
            })}
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <div className={`rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-base text-destructive`}>
            {productErrorMessageOf(error, intl)}
          </div>
        ) : null}
        <DialogFooter className={`gap-2 sm:justify-end`}>
          <Button type={`button`} variant={`outline`} disabled={checking || cancelling} onClick={onCancelOrder}>
            {cancelling ? <Spinner className={`size-3.5 animate-spin`} /> : null}
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.enterprise.pendingOrderCancel`,
            })}
          </Button>
          <Button type={`button`} disabled={checking || cancelling} onClick={onContinuePayment}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.enterprise.pendingOrderContinue`,
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

// Vet → PlanSelectSections（本地 85384）
function PlanSelectSections({
  providerId,
  teamAudienceAvailable,
  planGroups,
  startPlanChoiceState,
  startPlanPreview,
  currentPlanLevel,
  currentProduct,
  subscriptionBusy = false,
  teamPlanGroups,
  teamLoading,
  teamError,
  billingDiscountActive,
  billingDiscountConfig,
  onSelectPlan,
  onSelectTeamPlan,
}: any) {
  const { intl } = useZCodeIntl();
  const personalSection = (
    <section className={`flex flex-col gap-3`}>
      {billingDiscountActive ? <BillingDiscountBanner config={billingDiscountConfig} /> : null}
      <h3 className={`text-lg font-medium text-foreground`}>
        {intl.formatMessage({
          id: `settings.modelProvider.codingPlan.purchase.individualsSectionTitle`,
        })}
      </h3>
      <div className={planGridClassName()}>
        <StartPlanCard providerId={providerId} preview={startPlanPreview} state={startPlanChoiceState} />
        {planGroups.map((group: any) => (
          <PersonalPlanCard
            key={group.key}
            group={group}
            providerId={providerId}
            actionState={personalPlanActionStateOf(group, planGroups, currentPlanLevel, currentProduct, subscriptionBusy)}
            onSelect={() => onSelectPlan(group.key)}
          />
        ))}
      </div>
    </section>
  );
  return (
    <div className={planSectionsClassName()}>
      {personalSection}
      {teamAudienceAvailable ? (
        <section className={`flex flex-col gap-3`}>
          <h3 className={`text-lg font-medium text-foreground`}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.purchase.teamsSectionTitle`,
            })}
          </h3>
          {teamError ? (
            <InfoNoticeCard
              title={intl.formatMessage({
                id: `settings.modelProvider.codingPlan.enterprise.productsError`,
              })}
              description={productErrorMessageOf(teamError, intl)}
            />
          ) : null}
          {teamLoading && teamPlanGroups.length === 0 ? (
            <InfoNoticeCard
              icon={<Spinner className={`size-4 animate-spin`} />}
              title={intl.formatMessage({
                id: `settings.modelProvider.codingPlan.productsLoading`,
              })}
              description={intl.formatMessage({
                id: `settings.modelProvider.codingPlan.enterprise.productsLoadingDescription`,
              })}
            />
          ) : teamPlanGroups.length === 0 ? (
            <InfoNoticeCard
              title={intl.formatMessage({
                id: `settings.modelProvider.codingPlan.productsEmpty`,
              })}
              description={intl.formatMessage({
                id: `settings.modelProvider.codingPlan.enterprise.productsEmptyDescription`,
              })}
            />
          ) : (
            <div className={planGridClassName()}>
              {teamPlanGroups.map((group: any) => (
                <TeamPlanCard
                  key={group.key}
                  group={group}
                  providerId={providerId}
                  actionState={teamGroupActionStateOf(group)}
                  onSelect={() => onSelectTeamPlan(group.key)}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

// Het → planSectionsClassName（本地 85487）
function planSectionsClassName() {
  return `flex flex-col gap-8`;
}

// Uet → planGridClassName（本地 85490）
function planGridClassName() {
  return [`grid gap-3`, `min-[480px]:grid-cols-2 min-[480px]:items-stretch`, `md:grid-cols-4`].join(
    ` `,
  );
}

// Wet → TeamPlanCard（本地 85495）
function TeamPlanCard({ group, providerId, actionState, onSelect }: any) {
  const { intl, locale } = useZCodeIntl();
  const cheapest = cheapestMonthlyProductOf(group.products);
  const price = cheapest ? primaryAmountOf(cheapest) : null;
  const currency = normalizeCurrency(cheapest?.priceCurrency);
  const equity = cheapest?.equity ?? [];
  const descriptionItems = cheapest?.descriptionItems ?? [];
  const passive = actionState === `current` || actionState === `included` || actionState === `unavailable`;
  const disabled = passive;
  return (
    <div
      className={cn(
        `flex min-h-44 flex-col rounded-xl border border-border bg-card p-4 text-left md:h-full`,
      )}
    >
      <div className={`flex min-w-0 items-center justify-between gap-2`}>
        <h4 className={`truncate text-ui-base font-medium text-foreground`}>{group.title}</h4>
        {actionState === `current` ? (
          <span className={`shrink-0 rounded-full border border-border bg-surface px-2 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
            {intl.formatMessage({ id: `settings.modelProvider.codingPlan.currentPlan` })}
          </span>
        ) : null}
      </div>
      <div className={`mt-3`}>
        {typeof price == `number` ? (
          <FromPriceLabel price={price} currency={currency} locale={locale} />
        ) : (
          <span className={`text-foreground-subtle`}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.priceUnavailable`,
            })}
          </span>
        )}
      </div>
      {equity.length > 0 ? (
        <div className={`mt-3 space-y-1 text-ui-base leading-5`}>
          {equity.map((item: any) => (
            <div key={item.text} className={`flex min-w-0 items-center gap-2 text-foreground`}>
              <CheckIcon className={`size-4 shrink-0 text-foreground-subtle`} />
              <EquityItemLabel item={item} />
            </div>
          ))}
        </div>
      ) : null}
      <div className={`my-3 h-px bg-border`} />
      {descriptionItems.length > 0 ? (
        <div className={`space-y-1 text-ui-base leading-5 text-foreground-subtle`}>
          {descriptionItems.map((item: any) => (
            <div key={item.text}>
              <EquityItemLabel item={item} />
            </div>
          ))}
        </div>
      ) : null}
      <div className={`mt-auto pt-4`}>
        {actionState === `unavailable` ? (
          <UnavailableProductButton providerId={providerId} />
        ) : (
          <Button
            type={`button`}
            size={`lg`}
            variant={disabled ? `outline` : `default`}
            disabled={passive}
            className={`h-9 w-full rounded-full text-ui-base`}
            onClick={onSelect}
          >
            {actionLabelOf(actionState, intl)}
          </Button>
        )}
      </div>
    </div>
  );
}

// Get → StartPlanCard（本地 85581）
function StartPlanCard({ providerId, preview, state }: any) {
  const { intl, locale } = useZCodeIntl();
  if (state === `loading` || state === `unavailable`) return null;
  const copy = startPlanCardCopyOf(providerId, preview, locale);
  const expired = state === `expired`;
  const active = state === `active`;
  return (
    <div className={`flex min-h-44 flex-col rounded-xl border border-border bg-card p-4 text-left md:h-full`}>
      <div className={`flex min-w-0 items-center justify-between gap-2`}>
        <h4 className={`truncate text-ui-base font-medium text-foreground`}>{copy.title}</h4>
        {active || expired ? (
          <span className={`shrink-0 rounded-full border border-border bg-surface px-2 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
            {active
              ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.currentPlan` })
              : intl.formatMessage({
                  id: `settings.modelProvider.codingPlan.startPlan.expiredBadge`,
                })}
          </span>
        ) : null}
      </div>
      <div className={`mt-3`}>
        <span className={`text-xl font-semibold text-black dark:text-white`}>
          {formatMoney(0, copy.currency, locale)}
        </span>
      </div>
      <div className={`mt-3 flex min-w-0 items-center gap-2 text-ui-base leading-5 text-foreground`}>
        <CheckIcon className={`size-4 shrink-0 text-foreground-subtle`} />
        <span className={`min-w-0 line-clamp-1`}>{copy.description}</span>
      </div>
      <div className={`my-3 h-px bg-border`} />
      <div className={`space-y-1 text-ui-base leading-5 text-foreground-subtle`}>
        {copy.detailRows.map((row: any) => (
          <div key={row}>{row}</div>
        ))}
      </div>
      <div className={`mt-auto pt-4`}>
        <Button
          type={`button`}
          size={`lg`}
          variant={`outline`}
          className={`h-9 w-full rounded-full text-ui-base`}
          disabled={true}
        >
          {expired
            ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.startPlan.expiredAction` })
            : actionLabelOf(active ? `current` : `included`, intl)}
        </Button>
      </div>
    </div>
  );
}

// Ket → PersonalPlanCard（本地 85656）
function PersonalPlanCard({ group, providerId, actionState, onSelect }: any) {
  const { intl, locale } = useZCodeIntl();
  const firstProduct = group.products[0];
  if (!firstProduct) return null;
  const copy = planCardCopyOf(group, providerId);
  const cheapest = cheapestProductOf(group.products);
  const price = cheapest ? primaryAmountOf(cheapest) : null;
  const currency = normalizeCurrency(firstProduct.priceCurrency);
  const passive =
    actionState === `current` || actionState === `included` || actionState === `soldOut` || actionState === `unavailable`;
  const disabled = passive;
  return (
    <div
      className={cn(
        `flex min-h-44 flex-col rounded-xl border border-border bg-card p-4 text-left md:h-full`,
      )}
    >
      <div className={`flex min-w-0 items-center justify-between gap-2`}>
        <h4 className={`truncate text-ui-base font-medium text-foreground`}>{group.title}</h4>
        {actionState === `current` || actionState === `upgradeCurrent` ? (
          <span className={`shrink-0 rounded-full border border-border bg-surface px-2 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
            {intl.formatMessage({ id: `settings.modelProvider.codingPlan.currentPlan` })}
          </span>
        ) : null}
      </div>
      <div className={`mt-3`}>
        {typeof price == `number` ? (
          <FromPriceLabel price={price} currency={currency} locale={locale} />
        ) : (
          <span className={`text-foreground-subtle`}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.priceUnavailable`,
            })}
          </span>
        )}
      </div>
      {copy.equity.length > 0 ? (
        <div className={`mt-3 space-y-1`}>
          {copy.equity.map((item: any) => (
            <div key={item.text} className={`flex min-w-0 items-center gap-2 text-ui-base leading-5 text-foreground`}>
              <CheckIcon className={`size-4 shrink-0 text-foreground-subtle`} />
              <EquityItemLabel item={item} truncate={true} />
            </div>
          ))}
        </div>
      ) : null}
      <div className={`my-3 h-px bg-border`} />
      {copy.description.length > 0 ? (
        <div className={`space-y-1 text-ui-base leading-5 text-foreground-subtle`}>
          {copy.description.map((item: any) => (
            <div key={item.text}>
              <EquityItemLabel item={item} />
            </div>
          ))}
        </div>
      ) : null}
      <div className={`mt-auto pt-4`}>
        {actionState === `unavailable` ? (
          <UnavailableProductButton providerId={providerId} buttonTestId={testidOf(PERSONAL_PLAN_BUTTON_TESTID as unknown as string, group.key)} />
        ) : (
          <Button
            type={`button`}
            data-testid={testidOf(PERSONAL_PLAN_BUTTON_TESTID as unknown as string, group.key)}
            size={`lg`}
            variant={disabled ? `outline` : `default`}
            disabled={passive}
            className={`h-9 w-full rounded-full text-ui-base`}
            onClick={onSelect}
          >
            {actionLabelOf(actionState, intl)}
          </Button>
        )}
      </div>
    </div>
  );
}

// qet → UnavailableProductButton（本地 85749）
function UnavailableProductButton({ providerId, buttonTestId }: any) {
  const { intl } = useZCodeIntl();
  const platform = usePlatformBridge();
  const subscribeUrl = subscribeUrlOf(providerId);
  return (
    <TooltipRoot>
      <TooltipTriggerAsChild asChild={true}>
        <span tabIndex={0} className={`block w-full rounded-full`}>
          <Button
            type={`button`}
            data-testid={buttonTestId}
            size={`lg`}
            variant={`outline`}
            disabled={true}
            className={`pointer-events-none h-9 w-full rounded-full text-ui-base`}
          >
            {actionLabelOf(`unavailable`, intl)}
          </Button>
        </span>
      </TooltipTriggerAsChild>
      <TooltipContent sideOffset={4} className={`max-w-72 text-ui-sm`}>
        <span>
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.product.unavailableTooltipPrefix`,
          })}
        </span>
        <a
          href={subscribeUrl}
          target={`_blank`}
          rel={`noreferrer`}
          className={`font-medium underline underline-offset-2`}
          onClick={(event) => {
            (event.preventDefault(), platform.openExternal(subscribeUrl));
          }}
        >
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.product.unavailableTooltipLink`,
          })}
        </a>
      </TooltipContent>
    </TooltipRoot>
  );
}

// Jet → FromPriceLabel（本地 85796）
function FromPriceLabel({ price, currency, locale }: any) {
  const { intl } = useZCodeIntl();
  const formatted = formatMoney(price, currency, locale);
  if (!locale.toLowerCase().startsWith(`zh`))
    return (
      <span className={`text-xl font-semibold text-black dark:text-white`}>
        {intl.formatMessage(
          { id: `settings.modelProvider.codingPlan.purchase.fromPrice` },
          { price: formatted },
        )}
      </span>
    );
  const [head, ...rest] = formatted.split(` `);
  const tail = rest.join(` `).trim();
  return (
    <div className={`flex flex-wrap items-baseline gap-x-1.5 gap-y-1`}>
      <span className={`text-xl font-semibold text-black dark:text-white`}>{head}</span>
      <span className={`text-ui-base font-medium text-foreground-subtle`}>
        {[
          tail,
          intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.fromPriceSuffix` }),
        ]
          .filter(Boolean)
          .join(` `)}
      </span>
    </div>
  );
}

// Yet → BillingCycleSelectPersonal（本地 85830）
function BillingCycleSelectPersonal({
  selectedPlan,
  currentPlanLevel,
  currentProduct,
  loading,
  locale,
  onSelectProduct,
  onRefresh,
}: any) {
  const { intl } = useZCodeIntl();
  if (!selectedPlan) return null;
  const periods = availablePeriodsOf(selectedPlan.products);
  const currentEntry = currentPlanEntryOf(selectedPlan.products, currentPlanLevel, currentProduct);
  const hasCurrent = !!currentEntry;
  return (
    <div className={`flex flex-col gap-4`}>
      <div className={`flex items-start justify-between gap-3`}>
        <div>
          <h3 className={`text-ui-base font-medium text-foreground`}>
            {intl.formatMessage(
              { id: `settings.modelProvider.codingPlan.purchase.chooseBillingCycle` },
              { plan: selectedPlan.title },
            )}
          </h3>
          <p className={`mt-1 text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.purchase.billingCycleDescription`,
            })}
          </p>
        </div>
        <Button
          type={`button`}
          variant={`ghost`}
          size={`icon-sm`}
          disabled={loading}
          aria-label={intl.formatMessage({ id: `settings.modelProvider.codingPlan.recheck` })}
          onClick={onRefresh}
        >
          {loading ? (
            <Spinner className={`size-3.5 animate-spin`} />
          ) : (
            <RefreshIcon className={`size-3.5`} />
          )}
        </Button>
      </div>
      <div className={`grid gap-3 md:auto-rows-fr`}>
        {periods.map((period: any) => {
          const product = selectedPlan.products.find((entry: any) => periodOfProduct(entry) === period);
          return product ? (
            <BillingCycleOptionRow
              key={period}
              product={product}
              actionState={personalActionStateOf(product, hasCurrent, currentEntry, currentProduct)}
              loading={loading}
              locale={locale}
              onSelect={() => onSelectProduct(product)}
            />
          ) : null;
        })}
      </div>
    </div>
  );
}

// Xet → BillingCycleOptionRow（本地 85905）
function BillingCycleOptionRow({ product, actionState, loading, locale, onSelect }: any) {
  const { intl } = useZCodeIntl();
  const period = periodOfProduct(product);
  const currency = normalizeCurrency(product.priceCurrency);
  const price = primaryAmountOf(product);
  const strikethrough = strikethroughPriceOf(product, price);
  const monthlyPayAmount = product.monthlyPayAmount;
  const unitLabel = priceUnitLabelOf(period, product, currency, locale, intl);
  const disabled = loading || !isActionSelectable(product, actionState);
  return (
    <div
      className={cn(
        `flex items-center justify-between gap-3 rounded-xl border p-4 text-left md:h-full max-sm:flex-col max-sm:items-stretch`,
        `border-border bg-card`,
      )}
    >
      <div className={`min-w-0`}>
        <div className={`text-ui-base font-medium text-foreground`}>
          {intl.formatMessage({ id: PERIOD_LABEL_KEYS[period] })}
        </div>
        <div className={`mt-2`}>
          <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1`}>
            {typeof price == `number` ? (
              <PriceWithUnit
                price={price}
                currency={currency}
                locale={locale}
                unit={typeof strikethrough == `number` ? null : unitLabel}
              />
            ) : (
              <span className={`text-xl font-semibold text-black dark:text-white`}>
                {intl.formatMessage({
                  id: `settings.modelProvider.codingPlan.priceUnavailable`,
                })}
              </span>
            )}
            {typeof strikethrough == `number` ? (
              <span className={`text-ui-base text-foreground-subtle line-through`}>
                {formatMoney(strikethrough, currency, locale)}
              </span>
            ) : null}
            {typeof price != `number` || typeof strikethrough == `number` ? (
              <span className={`text-ui-base text-foreground-subtle`}>{unitLabel}</span>
            ) : null}
          </div>
          {period === `monthly` ? (
            <div className={`mt-1 text-ui-base text-foreground-subtle`}>
              {intl.formatMessage({
                id: `settings.modelProvider.codingPlan.monthlyFlexibleBilling`,
              })}
            </div>
          ) : typeof monthlyPayAmount == `number` ? (
            <div className={`mt-1 text-ui-base text-foreground-subtle`}>
              {intl.formatMessage(
                { id: `settings.modelProvider.codingPlan.monthlyEquivalent` },
                { price: formatMoney(monthlyPayAmount, currency, locale) },
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className={`flex shrink-0 items-center gap-3 max-sm:w-full`}>
        <Button
          type={`button`}
          size={`lg`}
          variant={disabled ? `outline` : `default`}
          disabled={disabled}
          onClick={onSelect}
          className={`min-w-24 rounded-full max-sm:w-full`}
        >
          {loading ? <Spinner className={`size-3.5 animate-spin`} /> : null}
          {billingCycleActionLabelOf(product, actionState, intl)}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// §8 本地 85996–88046（pay_range 9385–11435）：团队结账面板 + 支付确认 + 政策块 + 团队产品推导
// 把握度：高（逐字转录）
// ─────────────────────────────────────────────────────────────────────────────

// Zet → EnterpriseCheckoutPanel（本地 85996）
function EnterpriseCheckoutPanel({
  selectedPlan,
  selectedOptionKey,
  maxSeats,
  duration,
  balance,
  balanceLoading,
  balanceError,
  estimate,
  estimating,
  useGiftBalance,
  useCashBalance,
  loading,
  locale,
  onSelectedOptionChange,
  onMaxSeatsChange,
  onDurationChange,
  onRefreshBalance,
  onUseGiftBalanceChange,
  onUseCashBalanceChange,
  onContinue,
}: any) {
  const { intl } = useZCodeIntl();
  const options = selectedPlan ? purchaseOptionsOf(selectedPlan.products) : [];
  const selection = resolveEnterpriseSelection(selectedPlan, selectedOptionKey);
  const purchasable = selection ? isProductPurchasable(selection) : false;
  const currency = normalizeCurrency(selection?.priceCurrency);
  const oneTime = selection?.subscribeMode === `ONE_TIME`;
  const stickyRef = React.useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = React.useState(true);
  React.useEffect(() => {
    if (!oneTime) return;
    const normalized = selection ? normalizedDurationOf(selection, duration) : 1;
    normalized !== duration && onDurationChange(normalized);
  }, [duration, oneTime, onDurationChange, selection]);
  React.useEffect(() => {
    const node = stickyRef.current;
    if (!node) return;
    const scroller = scrollableAncestorOf(node);
    if (!scroller) return;
    const update = () => {
      const overflowing = scroller.scrollHeight > scroller.clientHeight + 1;
      const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      setAtBottom(!overflowing || atEnd);
    };
    (update(), scroller.addEventListener(`scroll`, update, { passive: true }), window.addEventListener(`resize`, update));
    const observer = typeof ResizeObserver > `u` ? null : new ResizeObserver(update);
    return (
      observer?.observe(scroller),
      observer?.observe(node),
      () => {
        (scroller.removeEventListener(`scroll`, update),
          window.removeEventListener(`resize`, update),
          observer?.disconnect());
      }
    );
  }, [selection, balance, estimate, oneTime]);
  if (!selectedPlan)
    return (
      <InfoNoticeCard
        icon={loading ? <Spinner className={`size-4 animate-spin`} /> : undefined}
        title={intl.formatMessage({
          id: loading
            ? `settings.modelProvider.codingPlan.productsLoading`
            : `settings.modelProvider.codingPlan.productsEmpty`,
        })}
        description={intl.formatMessage({
          id: loading
            ? `settings.modelProvider.codingPlan.enterprise.productsLoadingDescription`
            : `settings.modelProvider.codingPlan.enterprise.productsEmptyDescription`,
        })}
      />
    );
  const continuous = selection?.subscribeMode === `CONTINUOUS`;
  const autoRenewLabel = intl.formatMessage({
    id: `settings.modelProvider.codingPlan.enterprise.autoRenewAuthorization`,
  });
  return (
    <div className={`flex flex-col gap-4`}>
      <CheckoutSection
        title={intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.packageSeats` })}
      >
        <SeatsRow group={selectedPlan} maxSeats={maxSeats} locale={locale} onMaxSeatsChange={onMaxSeatsChange} />
      </CheckoutSection>
      <CheckoutSection
        title={
          <span className={`inline-flex items-center gap-2`}>
            {intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.purchaseMethod` })}
            <TooltipTriggerWrap
              title={intl.formatMessage({
                id: `settings.modelProvider.codingPlan.enterprise.purchaseMethodTooltipTitle`,
              })}
              description={intl.formatMessage({
                id: `settings.modelProvider.codingPlan.enterprise.purchaseMethodTooltipDescription`,
              })}
              className={`[&>span]:whitespace-pre-line`}
              side={`top`}
              align={`start`}
            >
              <HelpIcon className={`size-3.5 text-foreground-subtle`} />
            </TooltipTriggerWrap>
          </span>
        }
        action={
          <span
            aria-hidden={continuous ? undefined : true}
            className={cn(`block min-h-5 text-ui-base text-foreground-subtle`, continuous ? null : `invisible`)}
          >
            {autoRenewLabel}
          </span>
        }
      >
        <div className={`space-y-3`}>
          <div className={`grid gap-3 sm:grid-cols-3`}>
            {options.map((option: any) => (
              <PurchaseOptionCard
                key={option.key}
                product={option.product}
                selected={selectedOptionKey === option.key}
                disabled={!isProductPurchasable(option.product)}
                duration={duration}
                onSelect={() => onSelectedOptionChange(option.key)}
                onDurationChange={onDurationChange}
              />
            ))}
          </div>
        </div>
      </CheckoutSection>
      <BalanceSection
        balance={balance}
        balanceLoading={balanceLoading}
        balanceError={balanceError}
        estimate={estimate}
        currency={currency}
        locale={locale}
        useGiftBalance={useGiftBalance}
        useCashBalance={useCashBalance}
        onRefreshBalance={onRefreshBalance}
        onUseGiftBalanceChange={onUseGiftBalanceChange}
        onUseCashBalanceChange={onUseCashBalanceChange}
      />
      <div
        ref={stickyRef}
        className={cn(
          `sticky bottom-0 z-10 -mx-6 -mb-6 flex flex-col gap-3 border-t bg-background px-6 pb-6 pt-3`,
          atBottom ? `border-transparent` : `border-border`,
        )}
      >
        {selection ? (
          <EstimateSummaryBar
            product={selection}
            maxSeats={maxSeats}
            duration={duration}
            estimate={estimate}
            estimating={estimating}
            currency={currency}
            locale={locale}
          />
        ) : null}
        <Button
          type={`button`}
          size={`lg`}
          className={`h-10 w-full shrink-0 rounded-full px-8 text-ui-base`}
          disabled={!purchasable || loading}
          onClick={onContinue}
        >
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.purchase.continueToPayment`,
          })}
        </Button>
      </div>
    </div>
  );
}

// FY → CheckoutSection（本地 86181）
function CheckoutSection({ title, action, children }: any) {
  return (
    <section className={`space-y-3`}>
      <div className={`flex min-w-0 items-center justify-between gap-3`}>
        <h3 className={`min-w-0 text-ui-base font-medium text-foreground`}>{title}</h3>
        {action ? <div className={`shrink-0`}>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

// Qet → scrollableAncestorOf（本地 86197）
function scrollableAncestorOf(node: HTMLElement) {
  let parent = node.parentElement;
  for (; parent; ) {
    const overflow = window.getComputedStyle(parent).overflowY;
    if (overflow === `auto` || overflow === `scroll`) return parent;
    parent = parent.parentElement;
  }
  return null;
}

// $et → SeatsRow（本地 86207）
function SeatsRow({ group, maxSeats, locale, onMaxSeatsChange }: any) {
  const { intl } = useZCodeIntl();
  const tierFormatter = tierMessageFormatterOf(intl);
  const cheapest = cheapestMonthlyProductOf(group.products);
  const currency = normalizeCurrency(cheapest?.priceCurrency);
  const price = cheapest ? primaryAmountOf(cheapest) : null;
  return (
    <div className={`flex min-h-20 w-full flex-col gap-3 rounded-xl border border-border bg-card py-3 pl-4 pr-3 sm:flex-row sm:items-center sm:justify-between`}>
      <span className={`min-w-0`}>
        <span className={`block truncate text-ui-base font-medium text-foreground`}>
          {teamTierLabelOf(group.products[0]?.tier ?? group.title, locale, tierFormatter)}
        </span>
        <span className={`mt-1 block text-ui-base text-foreground-subtle`}>
          {typeof price == `number` && cheapest
            ? seatMonthlyPriceOf({ price: price, currency: currency, locale: locale, intl: intl })
            : intl.formatMessage({ id: `settings.modelProvider.codingPlan.priceUnavailable` })}
        </span>
      </span>
      <div className={`w-full sm:w-52`}>
        <SeatCountInput
          value={maxSeats}
          min={2}
          max={1e4}
          unitLabel={intl.formatMessage({
            id: `settings.modelProvider.codingPlan.enterprise.seatInputUnit`,
          })}
          unitPrefix={``}
          className={`rounded-lg`}
          inputClassName={`text-center`}
          onChange={onMaxSeatsChange}
        />
      </div>
    </div>
  );
}

// ett → DurationSelect（本地 86245）
function DurationSelect({ value, disabled = false, onChange }: any) {
  const { intl } = useZCodeIntl();
  const label = durationOptionLabelOf(value, intl);
  const promoActive = isPromoDisabled();
  return (
    <SelectShell>
      <SelectTriggerAsChild asChild={true}>
        <button
          type={`button`}
          disabled={disabled}
          aria-label={intl.formatMessage({
            id: `settings.modelProvider.codingPlan.enterprise.duration`,
          })}
          className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-transparent bg-transparent px-2 text-ui-sm font-medium text-foreground outline-none transition-colors hover:bg-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span>{label}</span>
          <ChevronDownIcon className={`size-3.5 text-foreground-subtle`} />
        </button>
      </SelectTriggerAsChild>
      <SelectPopup align={`end`} className={`min-w-max`}>
        <SelectControl
          value={String(value)}
          onValueChange={(next) => {
            const parsed = Number.parseInt(next, 10);
            Number.isFinite(parsed) && onChange(parsed);
          }}
        >
          {durationOptionsOf().map((option: any) => (
            <SelectOption key={option} value={String(option)} className={`gap-2 pr-8`}>
              <span>{durationOptionLabelOf(option, intl)}</span>
              {option === 12 && promoActive ? (
                <DurationDiscountBadge label={durationDiscountLabelOf(intl)} className={`text-ui-sm`} />
              ) : null}
            </SelectOption>
          ))}
        </SelectControl>
      </SelectPopup>
    </SelectShell>
  );
}

// ttt → SeatCountInput（本地 86299）
function SeatCountInput({
  value,
  min,
  max,
  unitLabel,
  unitPrefix = `/ `,
  className,
  inputClassName,
  onChange,
}: any) {
  const [draft, setDraft] = React.useState(() => String(value));
  const atMin = value <= min;
  const atMax = value >= max;
  React.useEffect(() => {
    setDraft(String(value));
  }, [value]);
  const commitDraft = () => {
    const next = commitSeatDraft({ draftValue: draft, currentValue: value, min: min, max: max });
    (setDraft(String(next)), next !== value && onChange(next));
  };
  const commitValue = (raw: number) => {
    const next = clampInt(raw, min, max);
    (setDraft(String(next)), next !== value && onChange(next));
  };
  return (
    <div
      className={cn(
        `flex h-12 items-center gap-3 rounded-xl border border-input-border bg-input px-3 transition-colors hover:border-input-border-hover focus-within:border-input-border-focused focus-within:bg-input-focused`,
        className,
      )}
    >
      <span className={`flex min-w-0 flex-1 items-baseline gap-1.5`}>
        <input
          type={`text`}
          inputMode={`numeric`}
          pattern={`[0-9]*`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            event.key === `Enter` && event.currentTarget.blur();
          }}
          className={cn(
            `min-w-0 w-10 bg-transparent text-ui-base font-medium text-foreground outline-none`,
            inputClassName,
          )}
        />
        {unitLabel ? (
          <span className={`shrink-0 text-ui-base font-medium text-foreground-subtle`}>
            {unitPrefix}
            {unitLabel}
          </span>
        ) : null}
      </span>
      <Button type={`button`} variant={`ghost`} size={`icon-sm`} disabled={atMin} onClick={() => commitValue(value - 1)}>
        <MinusIcon className={`size-4`} />
      </Button>
      <Button type={`button`} variant={`ghost`} size={`icon-sm`} disabled={atMax} onClick={() => commitValue(value + 1)}>
        <PlusIcon className={`size-4`} />
      </Button>
    </div>
  );
}

// ntt → PurchaseOptionCard（本地 86370）
function PurchaseOptionCard({
  product,
  selected,
  disabled,
  duration,
  onSelect,
  onDurationChange,
}: any) {
  const { intl } = useZCodeIntl();
  const yearlyBadge = yearlyDiscountBadgeOf(product);
  const oneTimeMonthly = isOneTimeMonthly(product);
  const durationPromo = oneTimeMonthly && duration === 12 && isPromoDisabled();
  return (
    <div
      role={`button`}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        `flex min-h-16 w-full cursor-pointer items-center rounded-xl border bg-card px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`,
        disabled
          ? `cursor-not-allowed border-border opacity-60`
          : selected
            ? `border-primary bg-card-selected`
            : `border-border hover:border-border-hover hover:bg-hover`,
      )}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(event) => {
        disabled || ((event.key === `Enter` || event.key === ` `) && (event.preventDefault(), onSelect()));
      }}
    >
      <div className={`flex min-h-6 min-w-0 flex-1 items-center gap-2`}>
        <span className={`min-w-0 truncate text-ui-base font-medium text-foreground`}>
          {product.purchaseMethodName}
        </span>
        {durationPromo ? <DurationDiscountBadge label={durationDiscountLabelOf(intl)} /> : null}
        {yearlyBadge ? <DurationDiscountBadge label={yearlyBadge} /> : null}
      </div>
      {oneTimeMonthly ? (
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <DurationSelect
            value={duration}
            disabled={disabled}
            onChange={(next: any) => {
              (selected || onSelect(), onDurationChange(next));
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

// IY → DurationDiscountBadge（本地 86432）
function DurationDiscountBadge({ label, className }: any) {
  return (
    <span
      className={cn(
        `shrink-0 rounded-md bg-destructive/10 px-1.5 py-0.5 text-ui-base font-medium text-destructive`,
        className,
      )}
    >
      {label}
    </span>
  );
}

// rtt → BalanceSection（本地 86443）
function BalanceSection({
  balance,
  balanceLoading,
  balanceError,
  estimate,
  currency,
  locale,
  useGiftBalance,
  useCashBalance,
  onRefreshBalance,
  onUseGiftBalanceChange,
  onUseCashBalanceChange,
}: any) {
  const { intl } = useZCodeIntl();
  return hasAnyBalance({ balance: balance, balanceLoading: balanceLoading }) ? (
    <CheckoutSection
      title={intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.balanceTitle` })}
      action={
        <Button
          type={`button`}
          variant={`link`}
          size={`sm`}
          className={`h-auto px-0 text-ui-base`}
          disabled={balanceLoading}
          onClick={onRefreshBalance}
        >
          {balanceLoading ? <Spinner className={`size-3.5 animate-spin`} /> : null}
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.refresh` })}
        </Button>
      }
    >
      <div className={`space-y-2 rounded-xl border border-border bg-card p-3`}>
        <BalanceCheckboxRow
          label={intl.formatMessage({
            id: `settings.modelProvider.codingPlan.enterprise.useGiftBalance`,
          })}
          amountLabel={intl.formatMessage(
            { id: `settings.modelProvider.codingPlan.enterprise.currentGiftBalance` },
            { amount: formatMoney(balance?.giveBalance ?? 0, currency, locale) },
          )}
          deductedAmount={estimate?.giveDeductAmount}
          currency={currency}
          locale={locale}
          checked={useGiftBalance}
          disabled={!isBalanceUsable(balanceLoading, balance?.giveBalance)}
          onCheckedChange={onUseGiftBalanceChange}
        />
        <BalanceCheckboxRow
          label={intl.formatMessage({
            id: `settings.modelProvider.codingPlan.enterprise.useCashBalance`,
          })}
          amountLabel={intl.formatMessage(
            { id: `settings.modelProvider.codingPlan.enterprise.currentCashBalance` },
            { amount: formatMoney(balance?.cashBalance ?? 0, currency, locale) },
          )}
          extraMeta={intl.formatMessage({
            id: `settings.modelProvider.codingPlan.enterprise.recharge`,
          })}
          extraMetaHref={FINANCE_PAY_URL}
          deductedAmount={estimate?.balanceDeductAmount}
          currency={currency}
          locale={locale}
          checked={useCashBalance}
          disabled={!isBalanceUsable(balanceLoading, balance?.cashBalance)}
          onCheckedChange={onUseCashBalanceChange}
        />
        {balanceError ? (
          <p className={`text-ui-base text-foreground-subtle`}>
            {productErrorMessageOf(balanceError, intl)}
          </p>
        ) : null}
      </div>
    </CheckoutSection>
  ) : null;
}

// itt → BalanceCheckboxRow（本地 86523）
function BalanceCheckboxRow({
  label,
  amountLabel,
  extraMeta,
  extraMetaHref,
  deductedAmount,
  currency,
  locale,
  checked,
  disabled,
  onCheckedChange,
}: any) {
  const meta = extraMeta ? (
    extraMetaHref ? (
      <a
        href={extraMetaHref}
        target={`_blank`}
        rel={`noreferrer`}
        className={`text-ui-base text-primary underline-offset-3 hover:underline`}
      >
        {extraMeta}
      </a>
    ) : (
      <span className={`text-ui-base text-primary`}>{extraMeta}</span>
    )
  ) : null;
  return (
    <div className={`flex w-full flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg px-0.5 py-0.5 text-ui-base leading-5`}>
      <button
        type={`button`}
        role={`checkbox`}
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          `flex min-w-0 items-center gap-2 rounded-md text-left`,
          disabled ? `cursor-not-allowed opacity-60` : `hover:bg-surface-hover`,
        )}
        onClick={() => onCheckedChange(!checked)}
      >
        <span className={`flex min-w-0 items-center gap-2`}>
          <span
            className={cn(
              `flex size-4 shrink-0 items-center justify-center rounded-sm border`,
              checked
                ? `border-primary bg-primary text-primary-foreground`
                : `border-border bg-background text-transparent`,
            )}
          >
            <CheckIcon className={`size-3.5`} />
          </span>
          <span className={`flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5`}>
            <span className={`text-ui-base font-medium text-foreground`}>{label}</span>
            <span className={`text-ui-base text-foreground-subtle`}>{amountLabel}</span>
          </span>
        </span>
      </button>
      {meta}
      {typeof deductedAmount == `number` && deductedAmount > 0 ? (
        <span className={`ml-auto shrink-0 text-ui-base font-medium text-foreground`}>
          {`-`}
          {formatMoney(deductedAmount, currency, locale)}
        </span>
      ) : null}
    </div>
  );
}

// att → EstimateSummaryBar（本地 86601）
function EstimateSummaryBar({
  product,
  maxSeats,
  duration,
  estimate,
  estimating,
  currency,
  locale,
}: any) {
  const { intl } = useZCodeIntl();
  const line = enterpriseSummaryLineOf({ product: product, maxSeats: maxSeats, duration: duration, locale: locale, intl: intl });
  const value = enterprisePayTextOf({
    product: product,
    maxSeats: maxSeats,
    duration: duration,
    estimate: estimate,
    estimating: estimating,
    currency: currency,
    locale: locale,
    intl: intl,
  });
  return (
    <div className={`flex min-h-9 min-w-0 flex-1 items-center justify-between gap-3 rounded-xl bg-surface px-4 py-2 text-ui-base`}>
      <span className={`min-w-0 truncate text-foreground`}>{line}</span>
      <EstimatePriceLabel value={value} locale={locale} />
    </div>
  );
}

// ott → EstimatePriceLabel（本地 86632）
function EstimatePriceLabel({ value, locale }: any) {
  const { intl } = useZCodeIntl();
  const parts = zhPricePartsOf(value, locale);
  return parts ? (
    <span className={`inline-flex shrink-0 flex-wrap items-baseline justify-end gap-x-1.5 gap-y-1`}>
      <span className={`text-xl font-semibold text-black dark:text-white`}>{parts.amount}</span>
      <span className={`text-ui-base font-medium text-foreground-subtle`}>
        {[
          parts.label,
          intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.fromPriceSuffix` }),
        ]
          .filter(Boolean)
          .join(` `)}
      </span>
    </span>
  ) : (
    <span className={`shrink-0 text-xl font-semibold text-black dark:text-white`}>{value}</span>
  );
}

// LY → teamTierLabelOf（本地 86659）
function teamTierLabelOf(tier: any, locale: string, formatMessage: any) {
  const label = tierLabelOf(tier, { locale: locale, formatMessage: formatMessage });
  return locale.toLowerCase().startsWith(`zh`) ? `团队${label}` : `Team ${label}`;
}

// stt → seatMonthlyPriceOf（本地 86663）
function seatMonthlyPriceOf({ price, currency, locale, intl }: any) {
  return intl.formatMessage(
    { id: `settings.modelProvider.codingPlan.enterprise.seatMonthlyPrice` },
    { price: formatMoney(price, currency, locale).split(` `)[0] ?? `` },
  );
}

// ctt → yearlyDiscountBadgeOf（本地 86670）
function yearlyDiscountBadgeOf(product: any) {
  const original = product.originalAmount;
  const renew = product.renewAmount;
  if (
    product.subscribePeriod !== `YEARLY` ||
    typeof original != `number` ||
    typeof renew != `number` ||
    original <= 0 ||
    renew >= original
  )
    return null;
  const tenths = Math.round((renew / original) * 10);
  return tenths > 0 && tenths < 10 ? `${tenths}折` : null;
}

// ltt → PriceWithUnit（本地 86684）
function PriceWithUnit({ price, currency, locale, unit }: any) {
  const { amount, suffix } = priceUnitPartsOf({ price: price, currency: currency, locale: locale, unit: unit });
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-1`}>
      <span className={`text-xl font-semibold text-black dark:text-white`}>{amount}</span>
      {suffix ? (
        <span className={`text-ui-base font-medium text-foreground-subtle`}>{suffix}</span>
      ) : null}
    </span>
  );
}

// utt → priceUnitPartsOf（本地 86701）
function priceUnitPartsOf({ price, currency, locale, unit }: any) {
  const formatted = formatMoney(price, currency, locale);
  if (!locale.toLowerCase().startsWith(`zh`)) return { amount: formatted, suffix: unit ?? `` };
  const [head = ``, ...rest] = formatted.split(` `);
  return { amount: head, suffix: `${rest.join(` `).trim()}${unit ?? ``}` };
}

// dtt → PersonalPaymentConfirm（本地 86707）
function PersonalPaymentConfirm({
  providerId,
  selectedProduct,
  preview,
  previewLoading,
  confirming,
  termsAccepted,
  onTermsAcceptedChange,
  onConfirm,
}: any) {
  const { intl, locale } = useZCodeIntl();
  const overseas = isZaiCodingPlanProvider(providerId);
  const currency = normalizeCurrency(preview?.priceCurrency ?? selectedProduct?.priceCurrency);
  const summaryLocale = overseas ? locale : `zh-CN`;
  const labels = overseas
    ? {
        originalAmount: intl.formatMessage({
          id: `settings.modelProvider.codingPlan.overseasPayment.amount.originalAmount`,
        }),
        discountActivity: intl.formatMessage({
          id: `settings.modelProvider.codingPlan.overseasPayment.amount.discountActivity`,
        }),
        currentPlanCredit: intl.formatMessage({
          id: `settings.modelProvider.codingPlan.overseasPayment.amount.currentPlanCredit`,
        }),
        payAmount: intl.formatMessage({
          id: `settings.modelProvider.codingPlan.overseasPayment.amount.payAmount`,
        }),
        deductions: intl.formatMessage({
          id: `settings.modelProvider.codingPlan.overseasPayment.amount.deductions`,
        }),
      }
    : ZH_CHECKOUT_POLICY_COPY.amountLabels;
  const amountSummary =
    selectedProduct && preview
      ? buildAmountSummary({
          preview: preview,
          product: selectedProduct,
          currency: currency,
          locale: summaryLocale,
          labels: labels,
          deriveCreditFromPayAmount: !overseas,
        })
      : null;
  const renewAmount = selectedProduct && preview ? pickRenewAmount(preview, selectedProduct) : null;
  const formattedRenewalAmount = typeof renewAmount == `number` ? formatMoney(renewAmount, currency, summaryLocale) : null;
  const purchaseValue = selectedProduct
    ? `${productTitleOf(selectedProduct)} · ${overseas ? intl.formatMessage({ id: PERIOD_LABEL_KEYS[periodOfProduct(selectedProduct)] }) : ZH_CHECKOUT_POLICY_COPY.periodLabels[periodOfProduct(selectedProduct)]}`
    : undefined;
  return amountSummary ? (
    <div className={`flex flex-col space-y-3`}>
      <AmountSummaryCard
        amountSummary={amountSummary}
        purchaseLabel={
          overseas
            ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.summaryPlan` })
            : `套餐`
        }
        purchaseValue={purchaseValue}
      />
      {overseas ? (
        <OverseasPolicyBlock
          selectedProduct={selectedProduct}
          formattedRenewalAmount={formattedRenewalAmount}
          termsAccepted={termsAccepted}
          onTermsAcceptedChange={onTermsAcceptedChange}
        />
      ) : (
        <PersonalPolicyBlock
          selectedProduct={selectedProduct}
          formattedRenewalAmount={formattedRenewalAmount}
          termsAccepted={termsAccepted}
          onTermsAcceptedChange={onTermsAcceptedChange}
        />
      )}
      <Button
        type={`button`}
        size={`lg`}
        className={`h-10 w-full rounded-full text-ui-base`}
        disabled={!selectedProduct || !preview || previewLoading || confirming || !termsAccepted}
        onClick={onConfirm}
      >
        {confirming || previewLoading ? <Spinner className={`size-3.5 animate-spin`} /> : null}
        {overseas
          ? intl.formatMessage({
              id: `settings.modelProvider.codingPlan.purchase.continueToPayment`,
            })
          : `继续支付`}
      </Button>
    </div>
  ) : (
    <div className={`flex flex-col`}>
      <InfoNoticeCard
        icon={previewLoading ? <Spinner className={`size-4 animate-spin`} /> : undefined}
        title={intl.formatMessage({
          id: previewLoading
            ? `settings.modelProvider.codingPlan.purchase.previewLoading`
            : `settings.modelProvider.codingPlan.priceUnavailable`,
        })}
        description={intl.formatMessage({
          id: previewLoading
            ? `settings.modelProvider.codingPlan.purchase.previewLoadingDescription`
            : `settings.modelProvider.codingPlan.purchase.previewUnavailableDescription`,
        })}
      />
    </div>
  );
}

// ftt → EnterprisePaymentConfirm（本地 86807）
function EnterprisePaymentConfirm({
  selectedProduct,
  maxSeats,
  estimate,
  estimating,
  estimateError,
  purchasing,
  locale,
  termsAccepted,
  onTermsAcceptedChange,
  onConfirm,
}: any) {
  const { intl } = useZCodeIntl();
  return selectedProduct ? (
    <div className={`flex h-full min-h-0 flex-1 flex-col space-y-3`}>
      {estimate ? (
        <EnterpriseEstimateSummary estimate={estimate} product={selectedProduct} maxSeats={maxSeats} locale={locale} />
      ) : (
        <InfoNoticeCard
          icon={estimating ? <Spinner className={`size-4 animate-spin`} /> : undefined}
          title={intl.formatMessage({
            id: estimating
              ? `settings.modelProvider.codingPlan.enterprise.calculating`
              : `settings.modelProvider.codingPlan.priceUnavailable`,
          })}
          description={
            estimateError
              ? productErrorMessageOf(estimateError, intl)
              : intl.formatMessage({
                  id: `settings.modelProvider.codingPlan.enterprise.calculateDescription`,
                })
          }
        />
      )}
      <div className={`px-3`}>
        <TermsCheckbox checked={termsAccepted} onCheckedChange={onTermsAcceptedChange}>
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.enterprise.teamAgreementPrefix`,
          })}
          <PolicyInlineLink href={BIGMODEL_SUBSCRIPTION_AGREEMENT_TEAM_URL}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.enterprise.teamAgreementLink`,
            })}
          </PolicyInlineLink>
        </TermsCheckbox>
      </div>
      <Button
        type={`button`}
        size={`lg`}
        className={`h-10 w-full rounded-full text-ui-base`}
        disabled={!estimate || estimating || purchasing || !!estimateError || !termsAccepted}
        onClick={onConfirm}
      >
        {estimating || purchasing ? <Spinner className={`size-3.5 animate-spin`} /> : null}
        {intl.formatMessage({
          id: `settings.modelProvider.codingPlan.purchase.continueToPayment`,
        })}
      </Button>
    </div>
  ) : null;
}

// ptt → EnterpriseEstimateSummary（本地 86875）
function EnterpriseEstimateSummary({ estimate, product, maxSeats, locale }: any) {
  const { intl } = useZCodeIntl();
  const discount = discountSummaryOf(estimate);
  const tierLabel = teamTierLabelOf(product.tier, locale, tierMessageFormatterOf(intl));
  const currency = normalizeCurrency(product.priceCurrency);
  return (
    <section className={`rounded-xl border border-border bg-surface p-3`}>
      <SummaryRow
        label={intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.summaryPlan` })}
        value={tierLabel}
      />
      <div className={`mb-2 mt-2 h-px bg-border`} />
      <div className={`space-y-1.5`}>
        <SummaryRow
          label={intl.formatMessage({
            id: `settings.modelProvider.codingPlan.enterprise.seatQuantity`,
          })}
          value={intl.formatMessage(
            { id: `settings.modelProvider.codingPlan.enterprise.seatCountValue` },
            { count: String(maxSeats) },
          )}
        />
        <SummaryRow
          label={intl.formatMessage({
            id: `settings.modelProvider.codingPlan.enterprise.purchaseMethod`,
          })}
          value={product.purchaseMethodName}
        />
        <SummaryRow
          label={intl.formatMessage({
            id: `settings.modelProvider.codingPlan.enterprise.orderOriginalAmount`,
          })}
          value={formatEnterpriseAmount(estimate.totalOriginalAmount, locale)}
        />
        {discount.amount > 0 ? (
          <SummaryRow
            label={intl.formatMessage(
              { id: `settings.modelProvider.codingPlan.enterprise.orderDiscount` },
              { discount: discount.label },
            )}
            value={`-${formatEnterpriseAmount(discount.amount, locale)}`}
          />
        ) : null}
      </div>
      <div className={`my-2 h-px bg-border`} />
      <SummaryRow
        label={intl.formatMessage({ id: `settings.modelProvider.codingPlan.paymentDialog.payAmount` })}
        value={<StrongAmount amount={estimate.thirdPayAmount} currency={currency} locale={locale} />}
        strong={true}
      />
    </section>
  );
}

// RY → SummaryRow（本地 86942）
function SummaryRow({ label, value, strong }: any) {
  return (
    <div className={`grid grid-cols-[minmax(8rem,1fr)_minmax(0,auto)] items-center gap-3 text-ui-base`}>
      <span className={cn(`min-w-0 text-foreground-subtle`, strong ? `font-medium` : null)}>{label}</span>
      <span
        className={cn(
          `min-w-0 text-right font-medium text-foreground`,
          strong ? `text-lg font-semibold` : null,
        )}
      >
        {value}
      </span>
    </div>
  );
}

// mtt → StrongAmount（本地 86959）
function StrongAmount({ amount, currency, locale }: any) {
  const formatted = formatMoney(amount, currency, locale);
  if (!locale.toLowerCase().startsWith(`zh`))
    return <span className={`text-xl font-semibold text-black dark:text-white`}>{formatted}</span>;
  const [head, ...rest] = formatted.split(` `);
  const tail = rest.join(` `).trim();
  return (
    <span className={`inline-flex flex-wrap items-baseline justify-end gap-x-1.5 gap-y-1`}>
      <span className={`text-xl font-semibold text-black dark:text-white`}>{head}</span>
      {tail ? (
        <span className={`text-ui-base font-medium text-foreground-subtle`}>{tail}</span>
      ) : null}
    </span>
  );
}

// htt → PersonalPolicyBlock（本地 86980）
function PersonalPolicyBlock({
  selectedProduct,
  formattedRenewalAmount,
  termsAccepted,
  onTermsAcceptedChange,
}: any) {
  const copy = ZH_CHECKOUT_POLICY_COPY;
  const periodSlash = periodSlashLabelOf(selectedProduct);
  const periodEvery = periodEveryLabelOf(selectedProduct);
  const yenAmount = formattedRenewalAmount ? yenNormalizeOf(formattedRenewalAmount) : null;
  return (
    <PolicyLayout
      policy={
        <section className={`space-y-1.5`}>
          <h3 className={`text-ui-base font-medium text-foreground`}>{copy.renewalTitle}</h3>
          <ul className={`list-disc space-y-0 pl-5 text-ui-base leading-5 text-foreground-subtle marker:text-foreground-subtlest`}>
            <li>
              {yenAmount
                ? `${copy.renewalChargePrefix}${yenAmount}${periodSlash}${copy.renewalChargeSuffix}`
                : copy.renewalChargeFallback}
            </li>
            <li>{copy.renewalDeduction}</li>
            <li>{`${periodEvery}${copy.renewalPeriodicBody}`}</li>
            <li>
              {copy.renewalCancelPrefix}
              <PolicyInlineLink href={CONSOLE_HOME_URL}>{copy.planOverviewLink}</PolicyInlineLink>
              {copy.renewalCancelSuffix}
            </li>
          </ul>
        </section>
      }
      account={<AccountPolicyCollapsible copy={copy} />}
      footer={
        <TermsCheckbox checked={termsAccepted} onCheckedChange={onTermsAcceptedChange}>
          {copy.agreementPrefix}
          <PolicyInlineLink href={BIGMODEL_SERVICE_AGREEMENT_URL}>{copy.serviceAgreementLink}</PolicyInlineLink>
          {copy.agreementBetween}
          <PolicyInlineLink href={BIGMODEL_SUBSCRIPTION_AGREEMENT_URL}>{copy.subscriptionAgreementLink}</PolicyInlineLink>
          {copy.agreementSuffix}
        </TermsCheckbox>
      }
    />
  );
}

// gtt → AccountPolicyCollapsible（本地 87037）
function AccountPolicyCollapsible({ copy }: any) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <section className={`rounded-xl bg-accent p-3`}>
      <button
        type={`button`}
        className={`flex w-full items-center gap-2 text-left`}
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <ModeIconFullAccess className={`size-4 shrink-0 text-brand`} />
        <span className={`min-w-0 flex-1 text-ui-base font-medium leading-5 text-foreground`}>
          {copy.accountPolicyTitle}
        </span>
        <ChevronDownIcon
          className={cn(
            `size-4 shrink-0 text-foreground-subtle transition-transform`,
            expanded && `rotate-180`,
          )}
        />
      </button>
      <p className={`mt-2 text-ui-base leading-5 text-foreground-subtle`}>
        {copy.accountPolicyDescription}
      </p>
      {expanded ? (
        <>
          <div className={`my-3 h-px bg-border`} />
          <div className={`space-y-3`}>
            {copy.accountPolicySections.map((section: any) => (
              <section key={section.title} className={`space-y-1`}>
                <h4 className={`text-ui-base font-medium leading-5 text-foreground`}>{section.title}</h4>
                <p className={`text-ui-base leading-5 text-foreground-subtle`}>
                  {section.content.map((part: any, index: number) =>
                    typeof part == `string` ? (
                      <span key={`${section.title}-text-${index}`}>{part}</span>
                    ) : (
                      <PolicyInlineLink key={`${section.title}-link-${part.label}`} href={part.href}>
                        {part.label}
                      </PolicyInlineLink>
                    ),
                  )}
                </p>
              </section>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

// _tt → yenNormalizeOf（本地 87100）
function yenNormalizeOf(text: string) {
  return (text.split(` `)[0] || text).replace(/^¥/, `￥`);
}

// vtt → periodEveryLabelOf（本地 87103）
function periodEveryLabelOf(product: any) {
  const period = product ? periodOfProduct(product) : `monthly`;
  return period === `yearly` ? `每年` : period === `quarterly` ? `每季` : `每月`;
}

// ytt → periodSlashLabelOf（本地 87107）
function periodSlashLabelOf(product: any) {
  const period = product ? periodOfProduct(product) : `monthly`;
  return period === `yearly` ? `/年` : period === `quarterly` ? `/季` : `/月`;
}

// btt → OverseasPolicyBlock（本地 87111）
function OverseasPolicyBlock({
  selectedProduct,
  formattedRenewalAmount,
  termsAccepted,
  onTermsAcceptedChange,
}: any) {
  const { intl } = useZCodeIntl();
  const unit = rawPeriodUnitOf(selectedProduct);
  const periodMessage = intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.period.${unit}` });
  const recurringPeriodMessage = intl.formatMessage({
    id: `settings.modelProvider.codingPlan.overseasPayment.recurringPeriod.${unit}`,
  });
  return (
    <PolicyLayout
      policy={
        <section className={`space-y-1.5`}>
          <h3 className={`text-ui-base font-medium text-foreground`}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.overseasPayment.renewalPolicyTitle`,
            })}
          </h3>
          <ul className={`list-disc space-y-0 pl-5 text-ui-base leading-5 text-foreground-subtle marker:text-foreground-subtlest`}>
            <li>
              {formattedRenewalAmount
                ? intl.formatMessage(
                    { id: `settings.modelProvider.codingPlan.overseasPayment.renewalCharge` },
                    { price: formattedRenewalAmount, period: periodMessage },
                  )
                : intl.formatMessage({
                    id: `settings.modelProvider.codingPlan.overseasPayment.renewalChargeFallback`,
                  })}
            </li>
            <li>
              {intl.formatMessage({
                id: `settings.modelProvider.codingPlan.overseasPayment.renewalDeduction`,
              })}
            </li>
            <li>
              {intl.formatMessage({
                id: `settings.modelProvider.codingPlan.overseasPayment.renewalMinimum`,
              })}
            </li>
            <li>
              {intl.formatMessage(
                { id: `settings.modelProvider.codingPlan.overseasPayment.renewalRecurring` },
                { period: recurringPeriodMessage },
              )}
            </li>
            <li>
              {intl.formatMessage({
                id: `settings.modelProvider.codingPlan.overseasPayment.renewalCancelPrefix`,
              })}
              <PolicyInlineLink href={ZAI_MANAGE_APIKEY_URL}>
                {intl.formatMessage({
                  id: `settings.modelProvider.codingPlan.overseasPayment.subscriptionSettingLink`,
                })}
              </PolicyInlineLink>
              {intl.formatMessage({
                id: `settings.modelProvider.codingPlan.overseasPayment.renewalCancelSuffix`,
              })}
            </li>
          </ul>
        </section>
      }
      account={
        <AccountPolicyNote
          title={intl.formatMessage({
            id: `settings.modelProvider.codingPlan.overseasPayment.accountPolicyTitle`,
          })}
        >
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.overseasPayment.accountPolicyPrefix`,
          })}
          <PolicyInlineLink href={ZAI_DEVPACK_TOOLS_URL}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.overseasPayment.supportedProductsLink`,
            })}
          </PolicyInlineLink>
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.overseasPayment.accountPolicyAfterSupportedProducts`,
          })}
          <PolicyInlineLink href={ZAI_TERMS_URL}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.overseasPayment.termsLink`,
            })}
          </PolicyInlineLink>
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.overseasPayment.accountPolicyBetween`,
          })}
          <PolicyInlineLink href={ZAI_SUBSCRIPTION_TERMS_URL2}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.overseasPayment.policyLink`,
            })}
          </PolicyInlineLink>
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.overseasPayment.accountPolicySuffix`,
          })}
        </AccountPolicyNote>
      }
      footer={
        <TermsCheckbox checked={termsAccepted} onCheckedChange={onTermsAcceptedChange}>
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.overseasPayment.authorizationPrefix`,
          })}
          <PolicyInlineLink href={ZAI_SUBSCRIPTION_TERMS_URL2}>
            {intl.formatMessage({
              id: `settings.modelProvider.codingPlan.overseasPayment.authorizationTermsLink`,
            })}
          </PolicyInlineLink>
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.overseasPayment.authorizationSuffix`,
          })}
        </TermsCheckbox>
      }
    />
  );
}

// xtt → PolicyLayout（本地 87246）
function PolicyLayout({ policy, account, footer }: any) {
  return (
    <>
      {policy}
      {account}
      <div className={`mb-3 px-3 md:mt-auto`}>{footer}</div>
    </>
  );
}

// Stt → AccountPolicyNote（本地 87251）
function AccountPolicyNote({ title, children }: any) {
  return (
    <div className={`flex gap-2 rounded-xl bg-accent p-2`}>
      <div className={`flex size-6 items-center justify-center`}>
        <ModeIconFullAccess className={`size-4 shrink-0 text-foreground-subtle`} />
      </div>
      <div className={`min-w-0 space-y-0.5`}>
        <p className={`text-ui-base font-medium leading-5 text-foreground`}>{title}</p>
        <p className={`text-ui-base leading-5 text-foreground-subtle`}>{children}</p>
      </div>
    </div>
  );
}

// zY → TermsCheckbox（本地 87271）
function TermsCheckbox({ checked, onCheckedChange, children }: any) {
  return (
    <button
      type={`button`}
      role={`checkbox`}
      aria-checked={checked}
      className={`flex w-full items-start gap-2 text-left text-ui-base leading-5 text-foreground-subtle`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={cn(
          `mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border`,
          checked
            ? `border-primary bg-primary text-primary-foreground`
            : `border-border bg-background text-transparent`,
        )}
      >
        <CheckIcon className={`size-3.5`} />
      </span>
      <span className={`min-w-0 flex-1`}>{children}</span>
    </button>
  );
}

// BY → PolicyInlineLink（本地 87292）
function PolicyInlineLink({ href, children }: any) {
  return (
    <a
      href={href}
      target={`_blank`}
      rel={`noreferrer`}
      className={`text-primary underline-offset-3 hover:underline`}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </a>
  );
}

// Ctt → rawPeriodUnitOf（本地 87304）
function rawPeriodUnitOf(product: any) {
  const unit = product?.priceUnit;
  if (unit) return unit;
  const period = product ? periodOfProduct(product) : `monthly`;
  return period === `yearly` ? `year` : period === `quarterly` ? `quarter` : `month`;
}

// wtt → personalServicePeriodOf（本地 87310）
function personalServicePeriodOf(product: any, intl: any) {
  return intl.formatMessage(
    { id: `settings.modelProvider.codingPlan.purchase.autoRenewPeriod` },
    { period: periodMessageOf(periodOfProduct(product), intl) },
  );
}

// Ttt → enterpriseServicePeriodOf（本地 87317）
function enterpriseServicePeriodOf(product: any, duration: number, intl: any) {
  const unitLabel = durationUnitLabelOf(product.subscribePeriod, intl);
  return product.subscribeMode === `CONTINUOUS`
    ? intl.formatMessage(
        { id: `settings.modelProvider.codingPlan.purchase.autoRenewPeriod` },
        { period: unitLabel },
      )
    : intl.formatMessage(
        { id: `settings.modelProvider.codingPlan.purchase.durationValue` },
        { duration: String(duration), unit: unitLabel },
      );
}

// Ett → orderDurationOf（本地 87330）
function orderDurationOf(order: any, product: any) {
  if (product.subscribeMode === `CONTINUOUS`) return 1;
  const unitPrice =
    product.payAmount ??
    product.renewAmount ??
    product.originalAmount ??
    product.enterpriseProduct.payAmount ??
    product.enterpriseProduct.renewAmount ??
    product.enterpriseProduct.originalAmount;
  const seats = Math.max(1, order.seatCount);
  const total = order.totalAmount || order.amount;
  if (typeof unitPrice == `number` && Number.isFinite(unitPrice) && unitPrice > 0 && Number.isFinite(total) && total > 0) {
    const ratio = total / (unitPrice * seats);
    const rounded = Math.round(ratio);
    if (rounded >= 1 && Math.abs(ratio - rounded) < 0.01) return rounded;
  }
  return 1;
}

// Dtt → periodMessageOf（本地 87349）
function periodMessageOf(period: string, intl: any) {
  return period === `yearly`
    ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.period.year` })
    : period === `quarterly`
      ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.period.quarter` })
      : intl.formatMessage({ id: `settings.modelProvider.codingPlan.overseasPayment.period.month` });
}

// Ott → PaymentStage（本地 87357）
function PaymentStage({
  purchasing,
  polling,
  paymentDialog,
  paymentExpired,
  overseasPaymentDialog,
  securityVerificationLoading,
  onRefreshPayment,
  onStartPaypalAuthorization,
  onCompletePaypalPayment,
  onQueryStripeCards,
  onBindStripePaymentMethod,
  onUnbindStripeCard,
  onPayWithStripePaymentMethod,
}: any) {
  const { intl } = useZCodeIntl();
  const body = paymentDialog ? (
    <CodingPlanPaymentQrHost
      state={paymentDialog}
      polling={polling}
      expired={paymentExpired}
      policyVisible={false}
      onRefresh={onRefreshPayment}
    />
  ) : overseasPaymentDialog ? (
    <StripeCardDialogEntry
      state={overseasPaymentDialog}
      onStartPaypalAuthorization={onStartPaypalAuthorization}
      onCompletePaypalPayment={onCompletePaypalPayment}
      onQueryStripeCards={onQueryStripeCards}
      onBindStripePaymentMethod={onBindStripePaymentMethod}
      onUnbindStripeCard={onUnbindStripeCard}
      onPayWithStripePaymentMethod={onPayWithStripePaymentMethod}
      policyVisible={false}
      termsAccepted={true}
    />
  ) : null;
  const fullHeight = !!(paymentDialog || overseasPaymentDialog);
  return (
    <div className={cn(fullHeight ? `flex h-full min-h-0 flex-col` : `space-y-4`)}>
      {body ? (
        fullHeight ? (
          <div className={`flex min-h-0 flex-1 flex-col`}>{body}</div>
        ) : (
          <div className={`rounded-xl border border-border bg-background p-4`}>{body}</div>
        )
      ) : (
        <div className={`rounded-xl border border-border bg-background p-4`}>
          <div className={`flex items-start gap-3`}>
            <Spinner className={`mt-0.5 size-4 shrink-0 animate-spin text-foreground-subtle`} />
            <div className={`min-w-0`}>
              <h3 className={`text-ui-base font-medium text-foreground`}>
                {intl.formatMessage({
                  id: securityVerificationLoading
                    ? `settings.modelProvider.codingPlan.purchase.securityChecking`
                    : polling
                      ? `settings.modelProvider.codingPlan.purchase.paymentPolling`
                      : purchasing
                        ? `settings.modelProvider.codingPlan.purchase.paymentPreparing`
                        : `settings.modelProvider.codingPlan.purchase.paymentStarted`,
                })}
              </h3>
              <p className={`mt-1 text-ui-base leading-6 text-foreground-subtle`}>
                {intl.formatMessage({
                  id: `settings.modelProvider.codingPlan.purchase.paymentStartedDescription`,
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ktt → PurchaseSuccessView（本地 87436）
function PurchaseSuccessView({
  selectedProduct,
  personalSummary,
  teamSummary,
  onManageTeamPlan,
  refreshPending,
  onDone,
}: any) {
  const { intl, locale } = useZCodeIntl();
  const currency = normalizeCurrency(selectedProduct?.priceCurrency);
  const summary = teamSummary ?? personalSummary ?? null;
  return (
    <div className={`flex h-full flex-col justify-center px-12 max-sm:h-auto max-sm:px-0`}>
      <div className={`flex flex-col items-center text-center`}>
        <SuccessIcon className={`size-8 text-success`} />
        <h3 className={`mt-3 text-ui-lg font-medium text-foreground`}>
          {intl.formatMessage({
            id: `settings.modelProvider.codingPlan.purchase.successTitle`,
          })}
        </h3>
      </div>
      <div className={`mt-8 rounded-xl border border-border bg-background p-4`}>
        <SuccessSummaryRow
          label={intl.formatMessage({
            id: `settings.modelProvider.codingPlan.purchase.summaryPlan`,
          })}
          value={selectedProduct ? productTitleOf(selectedProduct) : `-`}
        />
        {teamSummary ? (
          <>
            <div className={`mt-3`}>
              <SuccessSummaryRow
                label={intl.formatMessage({
                  id: `settings.modelProvider.codingPlan.enterprise.seatQuantity`,
                })}
                value={`${teamSummary.seats} ${intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.seatsUnit` })}`}
              />
            </div>
            <div className={`mt-3`}>
              <SuccessSummaryRow
                label={intl.formatMessage({
                  id: `settings.modelProvider.codingPlan.enterprise.purchaseMethod`,
                })}
                value={teamSummary.purchaseMethodName || `-`}
              />
            </div>
            <div className={`mt-3`}>
              <SuccessSummaryRow
                label={intl.formatMessage({
                  id: `settings.modelProvider.codingPlan.purchase.servicePeriod`,
                })}
                value={teamSummary.servicePeriod}
              />
            </div>
          </>
        ) : null}
        {summary && !teamSummary ? (
          <>
            <div className={`mt-3`}>
              <SuccessSummaryRow
                label={intl.formatMessage({
                  id: `settings.modelProvider.codingPlan.enterprise.purchaseMethod`,
                })}
                value={summary.purchaseMethodName || `-`}
              />
            </div>
            <div className={`mt-3`}>
              <SuccessSummaryRow
                label={intl.formatMessage({
                  id: `settings.modelProvider.codingPlan.purchase.servicePeriod`,
                })}
                value={summary.servicePeriod}
              />
            </div>
          </>
        ) : null}
        {summary ? (
          <div className={`mt-3`}>
            <SuccessSummaryRow
              label={intl.formatMessage({
                id: `settings.modelProvider.codingPlan.paymentDialog.payAmount`,
              })}
              value={typeof summary.payAmount == `number` ? formatMoney(summary.payAmount, currency, locale) : `-`}
            />
          </div>
        ) : null}
        <div className={`mt-3`}>
          <SuccessSummaryRow
            label={intl.formatMessage({
              id: `settings.modelProvider.codingPlan.purchase.summaryStatus`,
            })}
            value={intl.formatMessage({
              id: refreshPending
                ? `settings.modelProvider.codingPlan.purchase.statusSyncing`
                : `settings.modelProvider.codingPlan.purchase.statusActive`,
            })}
          />
        </div>
      </div>
      <div className={`mt-4 space-y-3`}>
        {teamSummary ? (
          <div className={`rounded-xl border border-border bg-surface p-4 text-left`}>
            <div className={`flex gap-3`}>
              <div className={`flex h-[18px] w-4 shrink-0 items-center justify-center text-foreground-subtle`}>
                <HelpIcon className={`size-3.5`} />
              </div>
              <div className={`min-w-0 flex-1`}>
                <p className={`text-ui-base font-medium text-foreground`}>
                  {intl.formatMessage({
                    id: `settings.modelProvider.codingPlan.purchase.teamMemberNoticeTitle`,
                  })}
                </p>
                <p className={`mt-1 text-ui-base/relaxed text-foreground-subtle`}>
                  {intl.formatMessage({
                    id: `settings.modelProvider.codingPlan.purchase.teamMemberNoticeDescription`,
                  })}
                </p>
                {onManageTeamPlan ? (
                  <Button
                    type={`button`}
                    variant={`outline`}
                    size={`sm`}
                    className={`mt-3 rounded-lg`}
                    onClick={onManageTeamPlan}
                  >
                    {intl.formatMessage({
                      id: `settings.modelProvider.codingPlan.purchase.manageTeamPlan`,
                    })}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        <Button
          type={`button`}
          size={`lg`}
          className={`h-10 w-full rounded-full text-ui-base`}
          onClick={onDone}
          disabled={refreshPending}
          aria-busy={refreshPending}
        >
          {refreshPending ? <RefreshIcon className={`size-3.5 animate-spin`} /> : null}
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.done` })}
        </Button>
      </div>
    </div>
  );
}

// VY → SuccessSummaryRow（本地 87594）
function SuccessSummaryRow({ label, value }: any) {
  return (
    <div className={`flex min-w-0 items-center justify-between gap-3`}>
      <span className={`text-ui-base text-foreground-subtle`}>{label}</span>
      <span className={`min-w-0 truncate text-ui-base font-medium text-foreground`}>{value}</span>
    </div>
  );
}

// Att → enterpriseSummaryLineOf（本地 87604）
function enterpriseSummaryLineOf({ product, maxSeats, duration, locale, intl }: any) {
  const tierLabel = teamTierLabelOf(product.tier, locale, tierMessageFormatterOf(intl));
  const seatsLabel = `${maxSeats} ${intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.seatsUnit` })}`;
  const durationSuffix = product.subscribeMode === `ONE_TIME` ? ` · ${duration}${durationUnitLabelOf(product.subscribePeriod, intl)}` : ``;
  return `${tierLabel} · ${product.purchaseMethodName} · ${seatsLabel}${durationSuffix}`;
}

// jtt → zhPricePartsOf（本地 87610）
function zhPricePartsOf(value: string, locale: string) {
  if (!locale.toLowerCase().startsWith(`zh`)) return null;
  const match = /^(?<amount>[¥$][\d,.]+)(?:\s+(?<label>.+))?$/.exec(value.trim());
  return match?.groups?.amount
    ? { amount: match.groups.amount, label: match.groups.label?.trim() ?? `` }
    : null;
}

// Mtt → enterprisePayTextOf（本地 87616）
function enterprisePayTextOf({
  product,
  maxSeats,
  duration,
  estimate,
  estimating,
  currency,
  locale,
  intl,
}: any) {
  if (estimating) return intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.calculating` });
  if (typeof estimate?.thirdPayAmount == `number`) return formatMoney(estimate.thirdPayAmount, currency, locale);
  const unitPrice = primaryAmountOf(product);
  if (typeof unitPrice != `number`)
    return intl.formatMessage({ id: `settings.modelProvider.codingPlan.priceUnavailable` });
  const multiplier = product.subscribeMode === `ONE_TIME` ? duration : 1;
  return formatMoney(unitPrice * maxSeats * multiplier, currency, locale);
}

// Ntt → discountSummaryOf（本地 87630）
function discountSummaryOf(estimate: any) {
  const saved = roundEnterpriseAmount(Math.max(0, estimate.totalOriginalAmount - estimate.totalPayAmount));
  if (saved <= 0 || estimate.totalOriginalAmount <= 0) return { amount: 0, label: `` };
  const tenths = Math.round((estimate.totalPayAmount / estimate.totalOriginalAmount) * 10);
  return { amount: saved, label: tenths > 0 && tenths < 10 ? `${tenths}折` : `` };
}

// Ptt → roundEnterpriseAmount（本地 87636）
function roundEnterpriseAmount(value: number) {
  return Math.round((value + 2 ** -52) * 100) / 100;
}

// Ftt → formatEnterpriseAmount（本地 87639）
function formatEnterpriseAmount(amount: number, locale: string) {
  return locale.toLowerCase().startsWith(`zh`)
    ? `￥${new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)}`
    : formatMoney(amount, `CNY`, locale);
}

// HY → teamPlanGroupsOf（本地 87644）
function teamPlanGroupsOf(products: any[], options: any) {
  const normalized = normalizeTierFormatArg(options);
  const groups = new Map<string, any>();
  for (const product of products) {
    const key = product.tier.trim().toLowerCase() || product.productId;
    const existing = groups.get(key);
    if (existing) {
      existing.products.push(product);
      continue;
    }
    groups.set(key, {
      key: key,
      title: (product.staticCatalogAvailable ? product.productName?.trim() : undefined) || tierLabelOf(product.tier, normalized),
      products: [product],
    });
  }
  return [...groups.values()].sort((a, b) => teamGroupRankOf(a.key) - teamGroupRankOf(b.key));
}

// Itt → teamPlanGroupsOfDefaultLocale（本地 87665）
function teamPlanGroupsOfDefaultLocale(products: any[], locale: any = DEFAULT_ZH_LOCALE) {
  return teamPlanGroupsOf(products, locale);
}

// Ltt → mergePublicAndAuthenticatedProducts（本地 87668）
function mergePublicAndAuthenticatedProducts({ publicProducts, authenticatedProducts }: any) {
  if (publicProducts.length === 0) return authenticatedProducts;
  if (authenticatedProducts.length === 0) return publicProducts;
  const byId = new Map<string, any>(authenticatedProducts.map((product: any) => [product.productId, product]));
  return publicProducts.map((product: any) => {
    const match = byId.get(product.productId);
    return match ? { ...product, subscribed: match.subscribed, canRepurchase: match.canRepurchase } : product;
  });
}

// Rtt → teamGroupActionStateOf（本地 87678）
function teamGroupActionStateOf(group: any) {
  const subscribed = group.products.filter((product: any) => product.subscribed === true);
  return subscribed.length === 0
    ? group.products.some(isProductPurchasable)
      ? `subscribe`
      : `unavailable`
    : subscribed.some((product: any) => product.canRepurchase === true)
      ? `renew`
      : `current`;
}

// UY → purchaseOptionsOf（本地 87688）
function purchaseOptionsOf(products: any[]) {
  const options = new Map<string, any>();
  for (const product of products) {
    if (!isOptionEligible(product)) continue;
    const key = purchaseOptionKeyOf(product);
    options.has(key) || options.set(key, { key: key, product: product });
  }
  return [...options.values()].sort((a, b) => purchaseOptionRankOf(a.key) - purchaseOptionRankOf(b.key));
}

// ztt → isOptionEligible（本地 87698）
function isOptionEligible(product: any) {
  return !(product.subscribeMode === `ONE_TIME` && product.subscribePeriod === `YEARLY`);
}

// WY → isProductPurchasable（本地 87701）
function isProductPurchasable(product: any) {
  return !(
    product.dynamicPricingAvailable === false ||
    !isOptionEligible(product) ||
    (product.subscribed === true && product.canRepurchase !== true)
  );
}

// Btt → isOneTimeMonthly（本地 87709）
function isOneTimeMonthly(product: any) {
  return product.subscribeMode === `ONE_TIME` && product.subscribePeriod === `MONTHLY`;
}

// Vtt → isPromoDisabled（本地 87712）
function isPromoDisabled() {
  return false;
}

// GY → isBalanceUsable（本地 87715）
function isBalanceUsable(loading: boolean, amount: unknown) {
  return !loading && typeof amount == `number` && amount > 0;
}

// Htt → hasAnyBalance（本地 87718）
function hasAnyBalance({ balance, balanceLoading }: any) {
  return isBalanceUsable(balanceLoading, balance?.giveBalance) || isBalanceUsable(balanceLoading, balance?.cashBalance);
}

// Utt → cheapestMonthlyProductOf（本地 87721）
function cheapestMonthlyProductOf(products: any[]) {
  const monthly = products.filter((product: any) => product.subscribePeriod === `MONTHLY`);
  return (monthly.length > 0 ? monthly : products).reduce((best: any, product: any) => {
    const price = primaryAmountOf(product);
    if (typeof price != `number`) return best;
    if (!best) return product;
    const bestPrice = primaryAmountOf(best);
    return typeof bestPrice == `number` ? (bestPrice === price ? (purchaseOptionRankOf(purchaseOptionKeyOf(best)) <= purchaseOptionRankOf(purchaseOptionKeyOf(product)) ? best : product) : bestPrice <= price ? best : product) : product;
  }, null);
}

// Wtt → resolveEnterpriseSelection（本地 87731）
function resolveEnterpriseSelection(plan: any, optionKey: any) {
  if (!plan) return null;
  const options = purchaseOptionsOf(plan.products);
  const selected = options.find((option: any) => option.key === optionKey)?.product ?? null;
  return selected && isProductPurchasable(selected) ? selected : (options.find((option: any) => isProductPurchasable(option.product))?.product ?? null);
}

// Gtt → teamProductOfId（本地 87738）
function teamProductOfId(groups: any[], productId: string) {
  for (const group of groups) {
    const product = group.products.find((entry: any) => entry.productId === productId);
    if (product) return { group: group, product: product };
  }
  return null;
}

// KY → purchaseOptionKeyOf（本地 87746）
function purchaseOptionKeyOf(product: any) {
  return `${product.subscribeMode}:${product.subscribePeriod}`;
}

// qY → purchaseOptionRankOf（本地 87749）
function purchaseOptionRankOf(key: string) {
  const order = [`CONTINUOUS:MONTHLY`, `CONTINUOUS:YEARLY`, `ONE_TIME:MONTHLY`];
  const index = order.indexOf(key);
  return index >= 0 ? index : order.length;
}

// Ktt → tierLabelOf（本地 87754）
function tierLabelOf(tier: string, options: any = `en-US`) {
  const text = tier.trim();
  if (!text) return tier;
  const { formatMessage } = normalizeTierFormatArg(options);
  const upper = text.toUpperCase();
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  const key = tierMessageKeyOf(upper);
  return key && formatMessage ? formatMessage(key, capitalized) : capitalized;
}

// qtt → tierMessageKeyOf（本地 87764）
function tierMessageKeyOf(tier: string) {
  const key = tier.trim().toLowerCase();
  return key === `lite` || key === `pro` || key === `max`
    ? `settings.modelProvider.codingPlan.enterprise.tier.${key}`
    : null;
}

// Jtt → normalizeTierFormatArg（本地 87770）
function normalizeTierFormatArg(options: any) {
  return typeof options == `string` ? { locale: options } : options;
}

// JY → tierMessageFormatterOf（本地 87773）
function tierMessageFormatterOf(intl: any) {
  return (id: string, fallback: string) => {
    const message = intl.formatMessage({ id: id });
    return message === id ? fallback : message;
  };
}

// Ytt → teamGroupRankOf（本地 87779）
function teamGroupRankOf(key: string) {
  const text = key.trim().toLowerCase();
  return text === `lite` ? 0 : text === `pro` ? 1 : text === `max` ? 2 : 99;
}

// Xtt → durationUnitLabelOf（本地 87783）
function durationUnitLabelOf(period: string, intl: any) {
  return period === `YEARLY`
    ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.durationUnit.year` })
    : period === `QUARTERLY`
      ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.durationUnit.quarter` })
      : intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.durationUnit.month` });
}

// Ztt → normalizedDurationOf（本地 87791）
function normalizedDurationOf(product: any, duration: number) {
  return product.subscribeMode !== `ONE_TIME` || product.subscribePeriod !== `MONTHLY`
    ? 1
    : durationOptionsOf().includes(duration)
      ? duration
      : 1;
}

// Qtt → durationOptionsOf（本地 87798）
function durationOptionsOf() {
  return [...SEAT_COUNT_OPTIONS];
}

// $tt → durationOptionLabelOf（本地 87801）
function durationOptionLabelOf(duration: number, intl: any) {
  return `${duration}${intl.formatMessage({ id: `settings.modelProvider.codingPlan.enterprise.durationInputUnit.month` })}`;
}

// ent → durationDiscountLabelOf（本地 87804）
function durationDiscountLabelOf(intl: any) {
  return intl.formatMessage({
    id: `settings.modelProvider.codingPlan.enterprise.durationDiscountOption`,
  });
}

// tnt → clampInt（本地 87809）
function clampInt(value: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.trunc(value))) : min;
}

// nnt → parseIntOrNull（本地 87812）
function parseIntOrNull(text: string) {
  const trimmed = text.trim();
  return /^\d+$/.test(trimmed) ? Number.parseInt(trimmed, 10) : null;
}

// rnt → commitSeatDraft（本地 87816）
function commitSeatDraft({ draftValue, currentValue, min, max }: any) {
  const parsed = parseIntOrNull(draftValue);
  return parsed === null ? currentValue : clampInt(parsed, min, max);
}

// int → personalActionStateOf（本地 87820）
function personalActionStateOf(product: any, hasCurrent: boolean, currentEntry: any, currentProduct: any) {
  return product.inCurrentPeriod === true || (currentProduct && product.productId === currentProduct.productId)
    ? product.canRepurchase === true
      ? `renew`
      : `current`
    : product.lastValid === true
      ? `purchased`
      : hasCurrent && currentEntry && !isAbovePlan(product, currentEntry)
        ? `unavailable`
        : hasCurrent
          ? `upgrade`
          : `subscribe`;
}

// ant → isActionSelectable（本地 87835）
function isActionSelectable(product: any, actionState: string) {
  return !(
    product.soldOut ||
    product.forbidden ||
    product.canPurchase === false ||
    actionState === `current` ||
    actionState === `purchased` ||
    actionState === `unavailable`
  );
}

// ont → billingCycleActionLabelOf（本地 87846）
function billingCycleActionLabelOf(product: any, actionState: string, intl: any) {
  return actionState === `current`
    ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.currentPlan` })
    : actionState === `purchased`
      ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchased` })
      : product.soldOut
        ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.product.soldOut` })
        : product.forbidden || product.canPurchase === false
          ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.product.unavailable` })
          : actionState === `unavailable`
            ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.product.included` })
            : actionState === `upgrade`
              ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.upgrade` })
              : actionState === `renew`
                ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.renew` })
                : intl.formatMessage({ id: `settings.modelProvider.codingPlan.subscribe` });
}

// snt → personalPlanActionStateOf（本地 87868）
function personalPlanActionStateOf(group: any, planGroups: any[], currentPlanLevel: any, currentProduct: any, subscriptionBusy = false) {
  if (subscriptionBusy) return `subscriptionBusy`;
  const currentEntry = currentPlanEntryOf(
    planGroups.flatMap((entry: any) => entry.products),
    currentPlanLevel,
    currentProduct,
  );
  const groupCurrent = isGroupCurrentOf(group, currentPlanLevel, currentProduct);
  if (!currentEntry) return groupAvailabilityOf(group.products, `subscribe`);
  const above = group.products.filter((product: any) => isAbovePlan(product, currentEntry));
  return groupCurrent
    ? isMaxGroup(group)
      ? groupAvailabilityOf(group.products, `renew`)
      : above.length === 0
        ? `current`
        : groupAvailabilityOf(above, `upgradeCurrent`)
    : above.length > 0
      ? groupAvailabilityOf(above, `upgrade`)
      : `included`;
}

// cnt → startPlanCurrentStateOf（本地 87890）
function startPlanCurrentStateOf(currentPlanLevel: any, currentProduct: any) {
  return (currentProduct && (isZaiStartFreeProductId(currentProduct.productId) || /\bstart\b/i.test(productTitleOf(currentProduct)))) || /\bstart\b/i.test(currentPlanLevel ?? ``)
    ? `current`
    : `included`;
}

// lnt → startPlanChoiceStateOf（本地 87896）
function startPlanChoiceStateOf({
  previewAvailable,
  previewLoading,
  currentPlanLevel,
  currentProduct,
  purchaseAuthenticated,
}: any) {
  return previewLoading
    ? `loading`
    : previewAvailable
      ? startPlanCurrentStateOf(currentPlanLevel, currentProduct) === `current`
        ? `active`
        : purchaseAuthenticated === true
          ? `expired`
          : `notStarted`
      : `unavailable`;
}

// YY → actionLabelOf（本地 87910）
function actionLabelOf(actionState: string, intl: any) {
  return actionState === `current`
    ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.currentPlan` })
    : actionState === `included`
      ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.product.included` })
      : actionState === `soldOut`
        ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.product.soldOut` })
        : actionState === `subscriptionBusy`
          ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.upgrade` })
          : actionState === `unavailable`
            ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.product.subscribeNow` })
            : actionState === `upgrade` || actionState === `upgradeCurrent`
              ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.upgrade` })
              : actionState === `renew`
                ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.renew` })
                : intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.selectPlan` });
}

// unt → subscriptionGateActionOf（本地 87932）
function subscriptionGateActionOf({ subscriptionBusy, authenticated }: any) {
  return subscriptionBusy || !authenticated ? `login` : `select`;
}

// dnt → subscribeUrlOf（本地 87935）
function subscribeUrlOf(providerId: string) {
  return isZaiCodingPlanProvider(providerId) ? `https://z.ai/subscribe` : `https://bigmodel.cn/glm-coding`;
}

// XY → groupAvailabilityOf（本地 87938）
function groupAvailabilityOf(products: any[], fallback: string) {
  return products.length === 0 || products.some(isAnyPurchasable)
    ? fallback
    : products.every((product: any) => product.soldOut === true)
      ? `soldOut`
      : `unavailable`;
}

// fnt → isMaxGroup（本地 87945）
function isMaxGroup(group: any) {
  return (
    wordBoundaryTest(group.key, `max`) ||
    wordBoundaryTest(group.title, `max`) ||
    group.products.some((product: any) =>
      wordBoundaryTest(
        [product.productId, product.productName, product.productBigTitle, product.productSmallTitle]
          .filter(Boolean)
          .join(` `),
        `max`,
      ),
    )
  );
}

// ZY → wordBoundaryTest（本地 87959）
function wordBoundaryTest(text: string, word: string) {
  return RegExp(`(^|[\\s_-])${word}($|[\\s_-])`, `i`).test(text);
}

// pnt → isAnyPurchasable（本地 87962）
function isAnyPurchasable(product: any) {
  return product.soldOut !== true && product.forbidden !== true && product.canPurchase !== false;
}

// mnt → strikethroughPriceOf（本地 87965）
function strikethroughPriceOf(product: any, price: any) {
  const original = product.originalAmount ?? null;
  return typeof original == `number` && typeof price == `number` && original > price ? original : null;
}

// hnt → priceUnitLabelOf（本地 87969）
function priceUnitLabelOf(period: string, product: any, currency: string, locale: string, intl: any) {
  const unit = product.priceUnit;
  return unit
    ? locale.toLowerCase().startsWith(`zh`) && normalizeCurrency(currency) === `CNY`
      ? unit === `year`
        ? `/年`
        : unit === `quarter`
          ? `/季`
          : `/月`
      : intl.formatMessage({
          id: `settings.modelProvider.codingPlan.unit.${normalizeCurrency(currency).toLowerCase()}.${unit}`,
        })
    : locale.toLowerCase().startsWith(`zh`) && normalizeCurrency(currency) === `CNY`
      ? period === `yearly`
        ? `/年`
        : period === `quarterly`
          ? `/季`
          : `/月`
      : `/${period === `yearly` ? `year` : period === `quarterly` ? `quarter` : `month`}`;
}

// QY → currentPlanEntryOf（本地 87991）
function currentPlanEntryOf(products: any[], currentPlanLevel: any, currentProduct: any) {
  const inPeriod = products.find((product: any) => product.inCurrentPeriod === true);
  if (inPeriod) return planEntryRankOf(inPeriod);
  if (currentProduct) return planEntryRankOf(currentProduct);
  const tierRank = tierRankOf(currentPlanLevel);
  return tierRank === null ? null : { planRank: tierRank, periodRank: -1 };
}

// gnt → isAbovePlan（本地 87999）
function isAbovePlan(product: any, entry: any) {
  const rank = planEntryRankOf(product);
  return rank.planRank === entry.planRank
    ? entry.periodRank < 0
      ? true
      : rank.periodRank > entry.periodRank
    : rank.planRank > entry.planRank;
}

// $Y → planEntryRankOf（本地 88007）
function planEntryRankOf(product: any) {
  return { planRank: tierRankOf(productTitleOf(product)) ?? 0, periodRank: periodRankOf(product) };
}

// _nt → tierRankOf（本地 88010）
function tierRankOf(title: any) {
  const text = title?.trim().toLowerCase() ?? ``;
  return /\bmax\b/.test(text) ? 2 : /\bpro\b/.test(text) ? 1 : /\blite\b/.test(text) ? 0 : null;
}

// vnt → periodRankOf（本地 88014）
function periodRankOf(product: any) {
  const period = periodOfProduct(product);
  return period === `yearly` ? 2 : +(period === `quarterly`);
}

// eX → EquityItemLabel（本地 88018）
function EquityItemLabel({ item, truncate = false }: any) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-1`}>
      <span className={truncate ? `min-w-0 line-clamp-1` : undefined}>{item.text}</span>
      {item.tooltip ? (
        <TooltipTriggerWrap title={item.tooltip}>
          <button
            type={`button`}
            className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full text-foreground-subtle`}
            aria-label={item.tooltip}
          >
            <HelpIcon className={`size-3`} />
          </button>
        </TooltipTriggerWrap>
      ) : null}
    </span>
  );
}

// ynt → planCardCopyOf（本地 88038）
function planCardCopyOf(group: any, providerId: string) {
  const first = group.products[0];
  const equity = first?.equity ?? [];
  if (equity.length > 0 && first) {
    const items = first.descriptionItems ?? [];
    return {
      equity: equity,
      description:
        items.length > 0
          ? items.slice(0, 4)
          : productBulletLinesOf(first)
              .slice(0, 4)
              .map((line: any) => ({ text: line })),
    };
  }
  return {
    equity: [],
    description: first
      ? productBulletLinesOf(first)
          .slice(0, 5)
          .map((line: any) => ({ text: line }))
      : [],
  };
}

// bnt → startPlanCardCopyOf（本地 88064）
function startPlanCardCopyOf(providerId: string, preview: any, locale: any) {
  const overseas = isZaiCodingPlanProvider(providerId);
  const summaryLocale = locale ? (locale.startsWith(`zh`) ? `zh-CN` : `en-US`) : overseas ? `en-US` : `zh-CN`;
  const title = preview?.name.trim() ?? ``;
  const detailRows = preview ? startPlanEntitlementRowsOf(preview, summaryLocale) : [];
  return {
    title: title,
    description: (preview ? startPlanSummaryOf(preview, summaryLocale) : null) ?? ``,
    detailRows: detailRows,
    currency: overseas ? `USD` : `CNY`,
    locale: summaryLocale,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §9 本地 88047–89988（pay_range 11436–13377）：Start Plan 权益文案 + 供应商条目表 + 权益钩子
//   + 团队菜单注入 + 升级对话框 + 计划源选择 + 会话模式/模型工具条
// 把握度：高（逐字转录）
// ─────────────────────────────────────────────────────────────────────────────

// xnt → startPlanEntitlementRowsOf（本地 88047）
function startPlanEntitlementRowsOf(preview: any, locale: string) {
  return modelUsageEntitlementsOf(preview).map((entry: any) => {
    const name = entry.showName.trim();
    const units = formatGrantUnits(entry.grantUnits, locale); // A0-CLEANUP2 item 50：(value, locale) 序（bundle PXt）
    const unitName = normalizeUnitName(entry.unitType);
    const suffix = periodSuffixOf(entry.period, locale);
    return locale === `zh-CN` ? `${name}${suffix} ${units} ${unitName}` : `${name} · ${units} ${unitName}${suffix}`;
  });
}

// Snt → startPlanSummaryOf（本地 88056）
function startPlanSummaryOf(preview: any, locale: string) {
  const entries = modelUsageEntitlementsOf(preview);
  if (entries.length === 0) return null;
  const total = entries.reduce((sum: number, entry: any) => sum + entry.grantUnits, 0);
  const daily = entries.every((entry: any) => entry.period.trim() === `daily`);
  const units = formatGrantUnits(total, locale); // A0-CLEANUP2 item 50：(value, locale) 序（bundle PXt）
  return locale === `zh-CN`
    ? `GLM 模型${daily ? `每日` : ``} ${units} tokens`
    : `${units} GLM tokens${daily ? ` daily` : ``}`;
}

// Cnt → modelUsageEntitlementsOf（本地 88068）
function modelUsageEntitlementsOf(preview: any) {
  return preview.entitlements.filter(
    (entry: any) => entry.meter === `model_usage` && entry.grantUnits > 0 && entry.showName.trim().length > 0,
  );
}

// wnt → normalizeUnitName（本地 88074）
function normalizeUnitName(unitType: string) {
  return unitType === `token` ? `tokens` : unitType.trim();
}

// Tnt → periodSuffixOf（本地 88077）
function periodSuffixOf(period: string, locale: string) {
  const text = period.trim();
  return text ? (text === `daily` ? (locale === `zh-CN` ? ` 每日` : ` daily`) : ` ${text}`) : ``;
}

// Ent → personalPlanGroupsOf（本地 88081）
function personalPlanGroupsOf(products: any[]) {
  const groups = new Map<string, any>();
  for (const product of products) {
    if (isZaiStartFreeProductId(product.productId)) continue;
    const title = productTitleOf(product);
    const key = planGroupKeyOf(title);
    const existing = groups.get(key);
    if (existing) {
      existing.products.push(product);
      continue;
    }
    groups.set(key, { key: key, title: title, products: [product] });
  }
  return Array.from(groups.values()).sort((a, b) => planGroupRankOf(a.title) - planGroupRankOf(b.title));
}

// tX → hasProductPreview（本地 88098）
function hasProductPreview(state: any) {
  return state.hasPreview;
}

// Dnt → planGroupKeyOf（本地 88101）
function planGroupKeyOf(title: string) {
  return title.trim().toLowerCase().replace(/\s+/g, `-`) || `coding-plan`;
}

// Ont → planGroupRankOf（本地 88104）
function planGroupRankOf(title: string) {
  const text = title.toLowerCase();
  return /\blite\b/.test(text) ? 0 : /\bpro\b/.test(text) ? 1 : /\bmax\b/.test(text) ? 2 : 99;
}

// knt → availablePeriodsOf（本地 88108）
function availablePeriodsOf(products: any[]) {
  const order = [`monthly`, `quarterly`, `yearly`];
  const present = new Set(products.map(periodOfProduct));
  return order.filter((period) => present.has(period));
}

// Ant → cheapestProductOf（本地 88113）
function cheapestProductOf(products: any[]) {
  return products.reduce((best: any, product: any) => {
    const price = primaryAmountOf(product);
    if (typeof price != `number`) return best;
    if (!best) return product;
    const bestPrice = primaryAmountOf(best);
    return typeof bestPrice == `number` && bestPrice <= price ? best : product;
  }, null);
}

// jnt → currentProductOfId（本地 88121）
function currentProductOfId(productId: any, products: any[]) {
  return productId ? (products.find((entry: any) => entry.productId === productId) ?? null) : null;
}

// Mnt → funnelTierOf（本地 88124）
function funnelTierOf(text: any) {
  const slug = funnelSlugOf(text);
  for (const tier of [`lite`, `pro`, `max`]) if (slug.includes(tier)) return tier;
  return slug || `unknown`;
}

// Nnt → funnelTeamTierOf（本地 88130）
function funnelTeamTierOf(text: any) {
  const slug = funnelSlugOf(text);
  return slug.includes(`advanced`) || slug.includes(`max`)
    ? `team_advanced`
    : slug.includes(`standard`) || slug.includes(`pro`)
      ? `team_standard`
      : slug
        ? `team_${slug}`
        : `unknown`;
}

// Pnt → funnelPeriodOf（本地 88139）
function funnelPeriodOf(period: string) {
  return ({ monthly: `month`, quarterly: `quarter`, yearly: `year` } as Record<string, string>)[period] ?? `unknown`;
}

// Fnt → funnelSubscribePeriodOf（本地 88142）
function funnelSubscribePeriodOf(text: any) {
  const slug = funnelSlugOf(text);
  return slug.includes(`month`)
    ? `month`
    : slug.includes(`quarter`)
      ? `quarter`
      : slug.includes(`year`)
        ? `year`
        : `unknown`;
}

// Int → funnelSubscribeModeOf（本地 88153）
function funnelSubscribeModeOf(text: any) {
  const slug = funnelSlugOf(text);
  return slug === `continuous` || slug === `one_time` ? slug : `unknown`;
}

// Lnt → funnelAmountOf（本地 88164）
function funnelAmountOf(amount: unknown) {
  return typeof amount == `number` && Number.isFinite(amount) ? amount.toFixed(2) : ``;
}

// nX → funnelSlugOf（本地 88167）
function funnelSlugOf(text: any) {
  return (text ?? ``)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, `_`)
    .replace(/^_+|_+$/g, ``);
}

// Rnt → isGroupCurrentOf（本地 88175）
function isGroupCurrentOf(group: any, currentPlanLevel: any, currentProduct: any) {
  return currentProduct && group.products.some((product: any) => product.productId === currentProduct.productId) ? true : currentPlanLevel ? planGroupKeyOf(currentPlanLevel) === group.key : false;
}

// znt → providerDisplayNameOf（本地 88178）
function providerDisplayNameOf(providerId: string) {
  return isZaiCodingPlanProvider(providerId) ? `Z.ai` : `BigModel`;
}

// Bnt → isBigmodelCodingPlanProvider（本地 88181）
function isBigmodelCodingPlanProvider(providerId: string) {
  return providerId === PROVIDER_IDS.bigmodelCodingPlan;
}

// Vnt → isPendingRequestCurrent（本地 88184）
function isPendingRequestCurrent(state: any) {
  return (
    state.panelOpen &&
    state.requestId === state.currentRequestId &&
    state.requestedPlanKey === state.currentSelectedPlanKey
  );
}

// Hnt → panelTitleOf（本地 88191）
function panelTitleOf(stage: string, intl: any, enterprise = false, providerId?: string) {
  return stage === `billingCycleSelect`
    ? intl.formatMessage({
        id: enterprise
          ? `settings.modelProvider.codingPlan.enterprise.configTitle`
          : `settings.modelProvider.codingPlan.purchase.billingCycleTitle`,
      })
    : stage === `paymentConfirm`
      ? !enterprise && providerId === PROVIDER_IDS.bigmodelCodingPlan
        ? `确认支付`
        : intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.paymentConfirmTitle` })
      : stage === `payment`
        ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.paymentTitle` })
        : stage === `success`
          ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.successTitle` })
          : intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.title` });
}

// Unt → buildEnvSnapshot（本地 88209）
function buildEnvSnapshot() {
  return {
    BASE_URL: `./`,
    DEV: false,
    MODE: `production`,
    PROD: true,
    SSR: false,
    VITE_ZCODE_BASE_URL: `https://zcode.z.ai`,
    VITE_ZCODE_E2E_STORE_BRIDGE: ``,
    VITE_ZCODE_ENDPOINT_ORIGIN: `https://zcode.z.ai`,
  };
}

// Wnt → envConfigOf（本地 88222）
function envConfigOf(env = buildEnvSnapshot()) {
  return {
    ZCODE_ENV: ZCODE_ENV_VALUE,
    ZCODE_BASE_URL: env.VITE_ZCODE_BASE_URL,
    ZCODE_ENDPOINT_ORIGIN: env.VITE_ZCODE_ENDPOINT_ORIGIN,
  };
}

// Gnt → PLAN_DOMAINS（本地 88230）
const PLAN_DOMAINS = planDomainsOf(envConfigOf());

// Knt → authSessionOf（本地 88233，xi 的本地别名）
function authSessionSnapshotOf() {
  return authSessionOf();
}

// qnt/Jnt/Ynt/rX（本地 88236–88238）
const PURCHASE_TOKEN_TTL = 120 * 1e3;
const LOGIN_URL = envPathUrlOf({ ZCODE_ENV: ZCODE_ENV_VALUE }, `/login`);
const CONSOLE_URL_FOR_PURCHASE = envConsoleUrlOf({ ZCODE_ENV: ZCODE_ENV_VALUE }); // Ynt
const SITE_URL_FOR_PURCHASE = envSiteUrlOf({ ZCODE_ENV: ZCODE_ENV_VALUE }); // rX

// iX → API_KEY_PROVIDER_ENTRIES（本地 88239）
const API_KEY_PROVIDER_ENTRIES = [
  {
    id: PROVIDER_IDS.zai,
    displayName: `Z.ai - API Key`,
    oauthProviderId: `zai`,
    apiKeyUrl: `https://z.ai/manage-apikey/apikey-list`,
  },
  {
    id: PROVIDER_IDS.bigmodel,
    displayName: `BigModel - API Key`,
    oauthProviderId: BIGMODEL_REGION_ID,
    apiKeyUrl: envPathUrlOf({ ZCODE_ENV: ZCODE_ENV_VALUE }, `/apikey/platform`),
  },
  { id: PROVIDER_IDS.zapi, displayName: `ZAPI` },
];

// aX → API_KEY_PROVIDER_ENTRY_MAP（本地 88255）
const API_KEY_PROVIDER_ENTRY_MAP = new Map(API_KEY_PROVIDER_ENTRIES.map((entry) => [entry.id, entry]));

// oX → CODING_PLAN_PROVIDER_ENTRIES（本地 88256）
const CODING_PLAN_PROVIDER_ENTRIES = [
  {
    id: PROVIDER_IDS.zaiStartPlan,
    oauthProviderId: `zai`,
    label: `Z.ai - Coding Plan`,
    providerName: `Z.ai`,
    purchaseUrl: `https://z.ai/manage-apikey/subscription`,
  },
  {
    id: PROVIDER_IDS.zaiCodingPlan,
    oauthProviderId: `zai`,
    label: `Z.ai - Coding Plan`,
    providerName: `Z.ai`,
    purchaseUrl: `https://z.ai/manage-apikey/subscription`,
  },
  {
    id: PROVIDER_IDS.bigmodelCodingPlan,
    oauthProviderId: BIGMODEL_REGION_ID,
    label: `BigModel - Coding Plan`,
    providerName: `BigModel`,
    purchaseUrl: CONSOLE_URL_FOR_PURCHASE,
  },
  {
    id: PROVIDER_IDS.bigmodelStartPlan,
    oauthProviderId: BIGMODEL_REGION_ID,
    label: `BigModel- Coding Plan`,
    providerName: `BigModel`,
    purchaseUrl: CONSOLE_URL_FOR_PURCHASE,
  },
];

// 源 88289：模块装载期遗留的逗号表达式（无副作用，逐字保留）
(PROVIDER_IDS.zaiStartPlan, PLAN_DOMAINS.zcodePlanAnthropicBaseUrl, [...KNOWN_MODEL_FORMATS]);

// Xnt → KNOWN_PROVIDER_ENTRY_IDS（本地 88290）
const KNOWN_PROVIDER_ENTRY_IDS = new Set([
  ...API_KEY_PROVIDER_ENTRIES.map((entry) => entry.id),
  ...CODING_PLAN_PROVIDER_ENTRIES.map((entry) => entry.id),
]);

// Znt → providerDisplayNameOfEntry（本地 88291）
function providerDisplayNameOfEntry(entry: any) {
  return entry.id === PROVIDER_IDS.zai
    ? `Z.ai - API Key`
    : entry.id === PROVIDER_IDS.zaiCodingPlan || entry.id === PROVIDER_IDS.zaiStartPlan
      ? `Z.ai - Coding Plan`
      : entry.id === PROVIDER_IDS.bigmodelStartPlan
        ? `BigModel- Coding Plan`
        : entry.name;
}

// Qnt → isPresetEntryEnabled（本地 88301）
function isPresetEntryEnabled(entry: any) {
  return entry.presetId === PROVIDER_IDS.zapi ? entry.zapiEnabled : true;
}

// $nt → teamPlanSelectionOf（本地 88304）
function teamPlanSelectionOf(selectedKeys: any = {}) {
  const raw = selectedKeys.bigmodel?.trim() ?? ``;
  const parsed = parseTeamPlanKey(raw);
  const organizationId = parsed?.organizationId?.trim() ?? ``;
  const projectId = parsed?.projectId?.trim() ?? ``;
  return !organizationId || !projectId ? null : { organizationId: organizationId, projectId: projectId, cacheKey: raw };
}

// ert → autoRefreshDecisionOf（本地 88311）
function autoRefreshDecisionOf({
  loading,
  providerFingerprint,
  skippedProviderFingerprint,
  suppressAutoRefresh,
}: any) {
  return loading || !providerFingerprint
    ? { shouldRefresh: false, skippedProviderFingerprint: skippedProviderFingerprint }
    : suppressAutoRefresh
      ? { shouldRefresh: false, skippedProviderFingerprint: providerFingerprint }
      : skippedProviderFingerprint === providerFingerprint
        ? { shouldRefresh: false, skippedProviderFingerprint: `` }
        : { shouldRefresh: true, skippedProviderFingerprint: `` };
}

// sX → useCodingPlanEntitlements（本地 88323）
export function useCodingPlanEntitlements({
  modelProviders,
  loading,
  modelProviderFamilySelectedKeys = {},
  autoRefreshMode,
  suppressProviderFingerprintAutoRefresh = false,
}: any) {
  const skippedRef = React.useRef(``);
  const zaiCodingEntry = modelProviders.find((entry: any) => entry.id === PROVIDER_IDS.zaiCodingPlan);
  const zaiStartEntry = modelProviders.find((entry: any) => entry.id === PROVIDER_IDS.zaiStartPlan);
  const bigmodelCodingEntry = modelProviders.find((entry: any) => entry.id === PROVIDER_IDS.bigmodelCodingPlan);
  const bigmodelStartEntry = modelProviders.find((entry: any) => entry.id === PROVIDER_IDS.bigmodelStartPlan);
  const zaiCodingEntryResolved = providerEntryOrNull(zaiCodingEntry);
  const zaiStartEntryResolved = providerEntryOrNull(zaiStartEntry);
  const bigmodelCodingEntryResolved = providerEntryOrNull(bigmodelCodingEntry);
  const bigmodelStartEntryResolved = providerEntryOrNull(bigmodelStartEntry);
  const zaiCodingFingerprint = providerFingerprintKeyOf(zaiCodingEntryResolved);
  const zaiStartFingerprint = providerFingerprintKeyOf(zaiStartEntryResolved);
  const bigmodelCodingFingerprint = providerFingerprintKeyOf(bigmodelCodingEntryResolved);
  const bigmodelStartFingerprint = providerFingerprintKeyOf(bigmodelStartEntryResolved);
  const zaiCodingEnabled = !!zaiCodingFingerprint;
  const teamSelection = teamPlanSelectionOf(modelProviderFamilySelectedKeys);
  const teamCacheKey = teamSelection?.cacheKey ?? ``;
  const bigmodelCodingEnabled = !!bigmodelCodingFingerprint || !!(bigmodelCodingEntry && teamSelection);
  const zaiCodingSubscription = useEntitlementSubscription({
    enabled: zaiCodingEnabled,
    autoRefreshMode: autoRefreshMode,
    includeSubscription: true,
    preferredProviderId: zaiCodingEntryResolved?.id ?? PROVIDER_IDS.zaiCodingPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: entitlementCacheKeyOf({ providerId: PROVIDER_IDS.zaiCodingPlan, providerFingerprint: zaiCodingFingerprint }),
  });
  const bigmodelCodingSubscription = useEntitlementSubscription({
    enabled: bigmodelCodingEnabled,
    autoRefreshMode: autoRefreshMode,
    includeSubscription: true,
    preferredProviderId: bigmodelCodingEntryResolved?.id ?? PROVIDER_IDS.bigmodelCodingPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    organizationId: teamSelection?.organizationId,
    projectId: teamSelection?.projectId,
    cacheKey: entitlementCacheKeyOf({ providerId: PROVIDER_IDS.bigmodelCodingPlan, providerFingerprint: teamCacheKey || bigmodelCodingFingerprint }),
  });
  const zaiStartEnabled =
    !!zaiStartFingerprint &&
    shouldProbeStartPlanEntitlement({
      codingPlanProviderFingerprint: zaiCodingFingerprint,
      codingPlanProviderId: PROVIDER_IDS.zaiCodingPlan,
      codingPlanSnapshot: zaiCodingSubscription.snapshot,
      codingPlanLoading: zaiCodingSubscription.loading,
      codingPlanError: zaiCodingSubscription.error,
    });
  const bigmodelStartEnabled =
    !teamSelection &&
    !!bigmodelStartFingerprint &&
    shouldProbeStartPlanEntitlement({
      codingPlanProviderFingerprint: bigmodelCodingFingerprint,
      codingPlanProviderId: PROVIDER_IDS.bigmodelCodingPlan,
      codingPlanSnapshot: bigmodelCodingSubscription.snapshot,
      codingPlanLoading: bigmodelCodingSubscription.loading,
      codingPlanError: bigmodelCodingSubscription.error,
    });
  const zaiStartSubscription = useEntitlementSubscription({
    enabled: zaiStartEnabled,
    autoRefreshMode: autoRefreshMode,
    includeSubscription: true,
    preferredProviderId: zaiStartEntryResolved?.id ?? PROVIDER_IDS.zaiStartPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: entitlementCacheKeyOf({ providerId: PROVIDER_IDS.zaiStartPlan, providerFingerprint: zaiStartFingerprint }),
  });
  const bigmodelStartSubscription = useEntitlementSubscription({
    enabled: bigmodelStartEnabled,
    autoRefreshMode: autoRefreshMode,
    includeSubscription: true,
    preferredProviderId: bigmodelStartEntryResolved?.id ?? PROVIDER_IDS.bigmodelStartPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: entitlementCacheKeyOf({ providerId: PROVIDER_IDS.bigmodelStartPlan, providerFingerprint: bigmodelStartFingerprint }),
  });
  const refresh = React.useCallback(
    (opts: any = {}) => {
      const tasks: Promise<unknown>[] = [];
      return (
        zaiCodingEnabled && tasks.push(zaiCodingSubscription.refresh(opts)),
        zaiStartEnabled && tasks.push(zaiStartSubscription.refresh(opts)),
        bigmodelCodingEnabled && tasks.push(bigmodelCodingSubscription.refresh(opts)),
        bigmodelStartEnabled && tasks.push(bigmodelStartSubscription.refresh(opts)),
        Promise.all(tasks).then(() => undefined)
      );
    },
    [bigmodelCodingSubscription.refresh, bigmodelCodingEnabled, bigmodelStartSubscription.refresh, bigmodelStartEnabled, zaiCodingSubscription.refresh, zaiCodingEnabled, zaiStartSubscription.refresh, zaiStartEnabled],
  );
  const fingerprintKey = React.useMemo(
    () =>
      [PROVIDER_IDS.zaiCodingPlan, PROVIDER_IDS.zaiStartPlan, PROVIDER_IDS.bigmodelCodingPlan, PROVIDER_IDS.bigmodelStartPlan]
        .flatMap((id: string) => {
          const part =
            id === PROVIDER_IDS.zaiCodingPlan
              ? zaiCodingFingerprint
              : id === PROVIDER_IDS.zaiStartPlan
                ? zaiStartEnabled
                  ? zaiStartFingerprint
                  : ``
                : id === PROVIDER_IDS.bigmodelCodingPlan
                  ? teamCacheKey || bigmodelCodingFingerprint
                  : bigmodelStartEnabled
                    ? bigmodelStartFingerprint
                    : ``;
          return part ? [part] : [];
        })
        .join(`|`),
    [bigmodelCodingFingerprint, teamCacheKey, bigmodelStartFingerprint, bigmodelStartEnabled, zaiCodingFingerprint, zaiStartFingerprint, zaiStartEnabled],
  );
  React.useEffect(() => {
    const decision = autoRefreshDecisionOf({
      loading: loading,
      providerFingerprint: fingerprintKey,
      skippedProviderFingerprint: skippedRef.current,
      suppressAutoRefresh: suppressProviderFingerprintAutoRefresh,
    });
    (skippedRef.current = decision.skippedProviderFingerprint), decision.shouldRefresh && refresh({ silent: true });
  }, [fingerprintKey, loading, refresh, suppressProviderFingerprintAutoRefresh]);
  return React.useMemo(
    () => ({
      entitlements: {
        [PROVIDER_IDS.zaiCodingPlan]: { snapshot: zaiCodingSubscription.snapshot, loading: zaiCodingSubscription.loading, error: zaiCodingSubscription.error },
        [PROVIDER_IDS.zaiStartPlan]: {
          snapshot: zaiStartEnabled ? zaiStartSubscription.snapshot : null,
          loading: zaiStartEnabled ? zaiStartSubscription.loading : false,
          error: zaiStartEnabled ? zaiStartSubscription.error : null,
        },
        [PROVIDER_IDS.bigmodelCodingPlan]: { snapshot: bigmodelCodingSubscription.snapshot, loading: bigmodelCodingSubscription.loading, error: bigmodelCodingSubscription.error },
        [PROVIDER_IDS.bigmodelStartPlan]: {
          snapshot: bigmodelStartEnabled ? bigmodelStartSubscription.snapshot : null,
          loading: bigmodelStartEnabled ? bigmodelStartSubscription.loading : false,
          error: bigmodelStartEnabled ? bigmodelStartSubscription.error : null,
        },
      },
      refresh: refresh,
    }),
    [
      bigmodelCodingSubscription.error,
      bigmodelCodingSubscription.loading,
      bigmodelCodingSubscription.snapshot,
      bigmodelStartSubscription.error,
      bigmodelStartSubscription.loading,
      bigmodelStartSubscription.snapshot,
      bigmodelStartEnabled,
      refresh,
      zaiCodingSubscription.error,
      zaiCodingSubscription.loading,
      zaiCodingSubscription.snapshot,
      zaiStartSubscription.error,
      zaiStartSubscription.loading,
      zaiStartSubscription.snapshot,
      zaiStartEnabled,
    ],
  );
}

// trt → mergeRefreshResults（本地 88447）
function mergeRefreshResults(results: any[]) {
  return results.some((entry: any) => entry.success)
    ? { success: true }
    : {
        success: false,
        failureReason:
          [...new Set(results.map((entry: any) => entry.error?.message?.trim()).filter((text: any) => !!text))].join(`; `) ||
          undefined,
        noEndpointResult: results.length === 0,
      };
}

// cX → presetSourceIdOf（本地 88457）
function presetSourceIdOf(presetId: string) {
  return `preset:${presetId}`;
}

// nrt → codingPlanSourceIdOf（本地 88460）
function codingPlanSourceIdOf(providerId: string) {
  return `coding-plan:${providerId}`;
}

// rrt → customSourceIdOf（本地 88463）
function customSourceIdOf(providerId: string) {
  return `custom:${providerId}`;
}

// lX → isCustomProviderReady（本地 88466）
function isCustomProviderReady(provider: any) {
  const kinds = modelKindsOfProvider(provider);
  const hasFormatEndpoint = kinds.some((kind: any) =>
    formatsOfModelName({ provider: provider, modelName: kind }).some((format: any) => {
      const normalized = normalizeFormat(format);
      return normalized ? formatsOfEndpoints(provider, normalized).length > 0 : false;
    }),
  );
  return provider.apiKey.trim().length > 0 && kinds.length > 0 && hasFormatEndpoint;
}

// irt → isKnownProviderEntryId（本地 88477）
function isKnownProviderEntryId(id: string) {
  return KNOWN_PROVIDER_ENTRY_IDS.has(id);
}

// art → oauthProviderIdOfEntry（本地 88480）
function oauthProviderIdOfEntry(id: string) {
  return API_KEY_PROVIDER_ENTRY_MAP.get(id)?.oauthProviderId ?? CODING_PLAN_PROVIDER_ENTRIES.find((entry: any) => entry.id === id)?.oauthProviderId ?? null;
}

// ort → apiKeyUrlOfEntry（本地 88483）
function apiKeyUrlOfEntry(id: string) {
  return API_KEY_PROVIDER_ENTRY_MAP.get(id)?.apiKeyUrl;
}

// srt → isEmptyText（本地 88486）
function isEmptyText(text: string) {
  return text.trim().length === 0;
}

// crt → providerEntryIconOf（本地 88489）
function providerEntryIconOf(item: any) {
  if (item.type === `addCustom`) return <PlusIcon className={`size-4 shrink-0`} />;
  if (item.type === `preset` || item.type === `codingPlan`) {
    if (item.presetId === PROVIDER_IDS.zapi) return <ZapiProviderIcon className={`size-4 shrink-0`} />;
    const oauthProviderId = oauthProviderIdOfEntry(item.presetId);
    return oauthProviderId ? providerLogoOf(oauthProviderId, `size-4`) : <GenericProviderIcon className={`size-4 shrink-0`} />;
  }
  return item.type === `codingPlanLoading` && item.oauthProviderId
    ? providerLogoOf(item.oauthProviderId, `size-4`)
    : <GenericProviderIcon className={`size-4 shrink-0`} />;
}

// lrt → codingPlanEntryStatusOf（本地 88501）
function codingPlanEntryStatusOf({ provider, entitlement, modelProvidersLoading }: any) {
  const zaiCoding = !!(provider && isZaiCodingPlanProvider(provider.id));
  const ready = !!(provider && (isCustomProviderReady(provider) || (zaiCoding && endpointsOfProvider(provider).length > 0 && provider.models.length > 0)));
  if (!ready && modelProvidersLoading)
    return {
      status: `checking`,
      planLevel: null,
      currentProductId: null,
      subscriptionBillingCycle: null,
      subscriptionRenewTime: null,
      subscriptionExpireTime: null,
      quotaLimits: [],
    };
  if (!ready)
    return {
      status: `disconnected`,
      planLevel: null,
      currentProductId: null,
      subscriptionBillingCycle: null,
      subscriptionRenewTime: null,
      subscriptionExpireTime: null,
      quotaLimits: [],
    };
  const hasApiKey = (provider?.apiKey.trim().length ?? 0) > 0;
  if (zaiCoding && !hasApiKey)
    return {
      status: `disconnected`,
      planLevel: null,
      currentProductId: null,
      subscriptionBillingCycle: null,
      subscriptionRenewTime: null,
      subscriptionExpireTime: null,
      quotaLimits: [],
    };
  const snapshot = entitlement?.snapshot ?? null;
  if (snapshot?.unavailableReason === `not_configured` && provider && provider.apiKey.trim().length === 0)
    return {
      status: `disconnected`,
      planLevel: null,
      currentProductId: null,
      subscriptionBillingCycle: null,
      subscriptionRenewTime: null,
      subscriptionExpireTime: null,
      quotaLimits: [],
    };
  if (entitlement?.loading && !snapshot?.quota && !snapshot?.subscription)
    return {
      status: `checking`,
      planLevel: null,
      currentProductId: null,
      subscriptionBillingCycle: null,
      subscriptionRenewTime: null,
      subscriptionExpireTime: null,
      quotaLimits: [],
    };
  if (!snapshot && entitlement?.error)
    return {
      status: `unavailable`,
      planLevel: null,
      currentProductId: null,
      subscriptionBillingCycle: null,
      subscriptionRenewTime: null,
      subscriptionExpireTime: null,
      quotaLimits: [],
    };
  const details = snapshot?.subscription?.details[0] ?? null;
  const productId = details?.productId ?? null;
  const planLevel = details?.productName ?? snapshot?.quota?.level ?? productId ?? null;
  const billingCycle = details?.billingCycle ?? null;
  const renewTime = details?.renewTime ?? null;
  const expireTime = details?.expireTime ?? null;
  return details
    ? {
        status: `purchased`,
        planLevel: planLevel,
        currentProductId: productId,
        subscriptionBillingCycle: billingCycle,
        subscriptionRenewTime: renewTime,
        subscriptionExpireTime: expireTime,
        quotaLimits: snapshot?.quota?.limits ?? [],
      }
    : (zaiCoding && hasApiKey && !snapshot?.quota && !snapshot?.subscription && snapshot?.unavailableReason === `no_plan`) ||
        snapshot?.unavailableReason === `no_plan`
      ? {
          status: `notPurchased`,
          planLevel: null,
          currentProductId: null,
          subscriptionBillingCycle: null,
          subscriptionRenewTime: null,
          subscriptionExpireTime: null,
          quotaLimits: [],
        }
      : snapshot?.unavailableReason === `not_configured`
        ? {
            status: `disconnected`,
            planLevel: null,
            currentProductId: null,
            subscriptionBillingCycle: null,
            subscriptionRenewTime: null,
            subscriptionExpireTime: null,
            quotaLimits: [],
          }
        : snapshot?.unavailableReason === `unavailable`
          ? {
              status: `unavailable`,
              planLevel: null,
              currentProductId: null,
              subscriptionBillingCycle: null,
              subscriptionRenewTime: null,
              subscriptionExpireTime: null,
              quotaLimits: [],
            }
          : snapshot?.quota
            ? {
                status: `purchased`,
                planLevel: planLevel,
                currentProductId: productId,
                subscriptionBillingCycle: billingCycle,
                subscriptionRenewTime: renewTime,
                subscriptionExpireTime: expireTime,
                quotaLimits: snapshot.quota.limits ?? [],
              }
            : {
                status: `notPurchased`,
                planLevel: null,
                currentProductId: null,
                subscriptionBillingCycle: null,
                subscriptionRenewTime: null,
                subscriptionExpireTime: null,
                quotaLimits: [],
              };
}

// urt → injectTeamPlanMenuItems（本地 88653）
function injectTeamPlanMenuItems({
  items,
  codingPlanEntitlements = {},
  subscribedTeamProducts,
  selectedTeamPlanKey,
  showPurchasedTeamPlanFallback,
}: any) {
  return mergeTeamPlanMenuItems({
    items: filterStartPlanMenuItems({ items: items, codingPlanEntitlements: codingPlanEntitlements, subscribedTeamProducts: subscribedTeamProducts }),
    codingPlanEntitlements: codingPlanEntitlements,
    selectedTeamPlanKey: selectedTeamPlanKey,
    showPurchasedTeamPlanFallback: showPurchasedTeamPlanFallback,
    subscribedTeamProducts: subscribedTeamProducts,
  });
}

// drt → filterStartPlanMenuItems（本地 88666）
function filterStartPlanMenuItems({ items, codingPlanEntitlements, subscribedTeamProducts }: any) {
  const teamScoped = hasTeamScopedEntitlement(codingPlanEntitlements) || subscribedTeamProducts.length > 0;
  return items.filter((item: any) => {
    if (!isProviderSystemEnabled(item.presetId)) return true;
    const family = familySpecOfProviderId(item.presetId);
    if (!family) return false;
    const codingPlanItem = items.find((entry: any) => entry.presetId === family.codingPlanProviderId);
    const purchased = item.status === `purchased`;
    const codingPlanPurchased = codingPlanItem?.status === `purchased`;
    const bigmodelTeamScoped = family.id === `bigmodel` && teamScoped;
    return hasApiKey(item.provider) ||
      hasApiKey(codingPlanItem?.provider ?? null) ||
      isStatusVisible(item.status) ||
      isStatusVisible(codingPlanItem?.status ?? `disconnected`) ||
      bigmodelTeamScoped
      ? purchased && !codingPlanPurchased && !bigmodelTeamScoped
      : false;
  });
}

// frt → mergeTeamPlanMenuItems（本地 88688）
function mergeTeamPlanMenuItems({
  items,
  codingPlanEntitlements,
  selectedTeamPlanKey,
  showPurchasedTeamPlanFallback,
  subscribedTeamProducts,
}: any) {
  const anchor = items.find((item: any) => item.presetId === PROVIDER_IDS.bigmodelCodingPlan);
  if (!anchor) return items;
  const entitlementItems = teamMenuItemsOfEntitlement(anchor, codingPlanEntitlements);
  const fallbackItems = fallbackTeamMenuItemOf({ codingPlanItem: anchor, selectedTeamPlanKey: selectedTeamPlanKey, showPurchasedTeamPlanFallback: showPurchasedTeamPlanFallback });
  if (entitlementItems.length === 0 && fallbackItems.length === 0 && subscribedTeamProducts.length === 0) return items;
  const seen = new Set<string>();
  const productItems = subscribedTeamProducts.flatMap((product: any) =>
    (product.teamProjects && product.teamProjects.length > 0
      ? product.teamProjects
      : [
          {
            organizationId: product.organizationId ?? null,
            organizationName: product.organizationName ?? null,
            projectId: product.projectId ?? null,
            projectName: product.projectName ?? null,
            apiKeyStatus: product.apiKeyStatus,
            apiKeyUnavailableReason: product.apiKeyUnavailableReason,
            apiKeyUnavailableMessage: product.apiKeyUnavailableMessage,
          },
        ]
    ).flatMap((project: any) => {
      const organizationId = project.organizationId?.trim() ?? ``;
      const projectId = project.projectId?.trim() ?? ``;
      if (!organizationId || !projectId) return [];
      const dedupeKey = `${product.productId}:${organizationId}:${projectId}`;
      if (seen.has(dedupeKey)) return [];
      seen.add(dedupeKey);
      const organizationLabel = teamOrganizationLabelOf({
        ...product,
        organizationName: project.organizationName ?? product.organizationName,
        projectName: project.projectName ?? product.projectName,
      });
      if (!organizationLabel) return [];
      const unavailable = project.apiKeyStatus === `unavailable`;
      return [
        {
          ...anchor,
          key: teamPlanKeyOf({ productId: product.productId, organizationId: organizationId, projectId: projectId }),
          type: `teamPlan`,
          label: `${anchor.providerName} - ${organizationLabel}`,
          teamPlanName: organizationLabel,
          organizationId: organizationId,
          projectId: projectId,
          planLevel: organizationLabel,
          inactivePlanTitle: organizationLabel,
          currentProductId: product.productId,
          purchaseUrl: SITE_URL_FOR_PURCHASE,
          status: unavailable ? `unavailable` : `purchased`,
          statusLabelId: unavailable ? `settings.modelProvider.codingPlan.status.teamUnavailable` : undefined,
          statusActive: !unavailable,
        },
      ];
    }),
  );
  const byIdentity = new Map(productItems.map((item: any) => [teamMenuItemKeyOf(item), item]));
  const mergedEntitlementItems = entitlementItems.map((item: any) => byIdentity.get(teamMenuItemKeyOf(item)) ?? item);
  const mergedFallbackItems = fallbackItems.map((item: any) => byIdentity.get(teamMenuItemKeyOf(item)) ?? item);
  const entitlementKeys = new Set(mergedEntitlementItems.map(teamMenuItemKeyOf));
  const fallbackKeys = new Set(mergedFallbackItems.map(teamMenuItemKeyOf));
  const injected = [
    ...mergedEntitlementItems,
    ...mergedFallbackItems.filter((item: any) => !entitlementKeys.has(teamMenuItemKeyOf(item))),
    ...productItems.filter((item: any) => !entitlementKeys.has(teamMenuItemKeyOf(item)) && !fallbackKeys.has(teamMenuItemKeyOf(item))),
  ];
  if (injected.length === 0) return items;
  const anchorIndex = items.findIndex((item: any) => item.key === anchor.key);
  return anchorIndex < 0 ? [...items, ...injected] : [...items.slice(0, anchorIndex + 1), ...injected, ...items.slice(anchorIndex + 1)];
}

// prt → teamPlanOrganizationOf（本地 88767，委托 Lq）
function teamPlanOrganizationOf(product: any) {
  return teamOrganizationLabelOf(product);
}

// mrt → hasTeamScopedEntitlement（本地 88770）
function hasTeamScopedEntitlement(entitlements: any) {
  return Object.values(entitlements).some(
    (entry: any) =>
      entry?.snapshot?.context?.scope === `team` &&
      !!entry.snapshot.context.organizationId?.trim() &&
      !!entry.snapshot.context.projectId?.trim(),
  );
}

// hrt → teamMenuItemsOfEntitlement（本地 88778）
function teamMenuItemsOfEntitlement(item: any, entitlements: any) {
  const snapshot = entitlements[PROVIDER_IDS.bigmodelCodingPlan]?.snapshot ?? null;
  if (snapshot?.context?.scope !== `team`) return [];
  const organizationId = snapshot.context.organizationId?.trim() ?? ``;
  const projectId = snapshot.context.projectId?.trim() ?? ``;
  if (!organizationId || !projectId) return [];
  const details = snapshot.subscription?.details[0] ?? null;
  const productId =
    snapshot.context.productId?.trim() ||
    details?.productId?.trim() ||
    item.currentProductId?.trim() ||
    `current`;
  const planName = snapshot.context.displayName?.trim() || details?.productName?.trim() || item.planLevel?.trim() || `Team`;
  return [
    {
      ...item,
      key: teamPlanKeyOf({ productId: productId, organizationId: organizationId, projectId: projectId }),
      type: `teamPlan`,
      label: `${item.providerName} - ${planName}`,
      teamPlanName: planName,
      organizationId: organizationId,
      projectId: projectId,
      status: `purchased`,
      planLevel: planName,
      currentProductId: productId,
      purchaseUrl: SITE_URL_FOR_PURCHASE,
      statusActive: true,
    },
  ];
}

// grt → fallbackTeamMenuItemOf（本地 88807）
function fallbackTeamMenuItemOf({ codingPlanItem, selectedTeamPlanKey, showPurchasedTeamPlanFallback }: any) {
  if (!showPurchasedTeamPlanFallback) return [];
  const parsed = parseTeamPlanKey(selectedTeamPlanKey);
  if (!parsed?.organizationId || !parsed.projectId) return [];
  const planName = codingPlanItem.planLevel?.trim() || `Team`;
  return [
    {
      ...codingPlanItem,
      key: teamPlanKeyOf({ productId: parsed.productId, organizationId: parsed.organizationId, projectId: parsed.projectId }),
      type: `teamPlan`,
      label: `${codingPlanItem.providerName} - ${planName}`,
      teamPlanName: planName,
      organizationId: parsed.organizationId,
      projectId: parsed.projectId,
      status: `purchased`,
      planLevel: planName,
      currentProductId: parsed.productId,
      purchaseUrl: SITE_URL_FOR_PURCHASE,
      statusActive: true,
    },
  ];
}

// uX → teamMenuItemKeyOf（本地 88831）
function teamMenuItemKeyOf(item: any) {
  const parsed = parseTeamPlanKey(item.key);
  const organizationId = item.organizationId?.trim() || parsed?.organizationId || ``;
  const projectId = item.projectId?.trim() || parsed?.projectId || ``;
  return organizationId && projectId ? `${organizationId}:${projectId}` : item.key;
}

// _rt → isStatusVisible（本地 88837）
function isStatusVisible(status: string) {
  return status !== `checking` && status !== `disconnected`;
}

// vrt → hasApiKey（本地 88840）
function hasApiKey(provider: any) {
  return (provider?.apiKey.trim().length ?? 0) > 0;
}

// yrt → CODING_PLAN_ENTRY_ID_SET（本地 88843）
const CODING_PLAN_ENTRY_ID_SET = new Set(CODING_PLAN_PROVIDER_ENTRIES.map((entry) => entry.id));

// brt → isLoginStatePending（本地 88844）
function isLoginStatePending(state: string) {
  return state === `unknown` || state === `loading`;
}

// xrt → loadPurchaseAuthState（本地 88847）
async function loadPurchaseAuthState(credentialService: any) {
  const [activeProvider, zaiToken, bigmodelToken] = await Promise.all([
    credentialService.load(`oauth:active_provider`),
    credentialService.load(`oauth:zai:access_token`),
    credentialService.load(`oauth:${BIGMODEL_REGION_ID}:access_token`),
  ]);
  const provider = activeProvider === `zai` || activeProvider === `bigmodel` ? activeProvider : null;
  return {
    [PROVIDER_IDS.zaiCodingPlan]: provider === `zai` && !!zaiToken?.trim(),
    [PROVIDER_IDS.zaiStartPlan]: provider === `zai` && !!zaiToken?.trim(),
    [PROVIDER_IDS.bigmodelCodingPlan]: provider === `bigmodel` && !!bigmodelToken?.trim(),
    [PROVIDER_IDS.bigmodelStartPlan]: provider === `bigmodel` && !!bigmodelToken?.trim(),
  };
}

// Srt → codingPlanProviderIdOfTarget（本地 88862）
function codingPlanProviderIdOfTarget(providerId: any) {
  const trimmed = providerId?.trim();
  return trimmed && CODING_PLAN_ENTRY_ID_SET.has(trimmed) ? trimmed : null;
}

// Crt → isNonEmpty（本地 88867）
function isNonEmpty(value: any) {
  return !!value;
}

// wrt → oauthProviderIdOfCodingPlan（本地 88870）
function oauthProviderIdOfCodingPlan(providerId: string) {
  return providerId === PROVIDER_IDS.zaiCodingPlan || providerId === PROVIDER_IDS.zaiStartPlan ? `zai` : BIGMODEL_REGION_ID;
}

// Trt → beginUpgradeLoginAttempt（本地 88873）
function beginUpgradeLoginAttempt(args: any) {
  const attempt = {
    loginAttemptId: args.requestLoginEntry(args.oauthProviderId),
    target: { ...args.target, initialAudience: args.audience },
  };
  return (args.onClose(), attempt);
}

// Ert → resolveLoginAttemptAction（本地 88880）
function resolveLoginAttemptAction(state: any) {
  return !state.pending || !state.loginAttempt
    ? { action: `wait` }
    : state.loginAttempt.id === state.pending.loginAttemptId
      ? state.loginAttempt.status === `requested` || state.loginAttempt.status === `waiting`
        ? { action: `wait` }
        : state.loginAttempt.status === `succeeded`
          ? { action: `reopen`, target: state.pending.target }
          : { action: `discard` }
      : { action: `discard` };
}

// Drt → refreshAfterPurchase（本地 88893）
async function refreshAfterPurchase(args: any) {
  const providerIds = Array.from(new Set([args.providerId, args.productsProviderId].filter(isNonEmpty)));
  (await Promise.allSettled(providerIds.map((id: any) => args.modelProviderService.refreshCodingPlanApiKey(id)))),
    await Promise.all([
      args.refreshPurchaseTokenState(),
      args.refreshModelProviders(),
      args.refreshCodingPlanEntitlements(),
      args.refreshTeamPlanProducts?.(),
    ]);
}

// Ort → CodingPlanUpgradeDialog（本地 88903）
function CodingPlanUpgradeDialog({ target, onClose, onReopen }: any) {
  const { modelProviderService, credentialService } = useCoreServices();
  const requestLoginEntry = useAppStore((state: any) => state.requestLoginEntry);
  const loginEntryAttempt = useAppStore((state: any) => state.loginEntryAttempt);
  const user = useAppStore((state: any) => state.user);
  const oauthSuccessSeq = useAppStore((state: any) => state.oauthSuccessSeq);
  const lastOAuthSuccessProvider = useAppStore((state: any) => state.lastOAuthSuccessProvider);
  const { modelProviders, loading, refresh } = useModelProviders();
  const { entitlements, refresh: refreshEntitlements } = useCodingPlanEntitlements({ modelProviders: modelProviders, loading: loading });
  const [authStates, setAuthStates] = React.useState<Record<string, string>>({});
  const [productsRefreshToken, setProductsRefreshToken] = React.useState(0);
  const lastSuccessSeqRef = React.useRef(oauthSuccessSeq);
  const attemptSeqRef = React.useRef(0);
  const pendingLoginRef = React.useRef<any>(null);
  const providerId = codingPlanProviderIdOfTarget(target?.providerId);
  const productsProviderId = providerId ? codingPlanProviderOfStart(providerId) : null;
  const enterpriseProducts = useEnterpriseCodingPlanProducts({ enabled: !!target && productsProviderId === PROVIDER_IDS.bigmodelCodingPlan, authenticated: true });
  const providerEntry = providerEntryOrNull(providerId ? (modelProviders.find((entry: any) => entry.id === providerId) ?? null) : null);
  const entryStatus = providerId ? codingPlanEntryStatusOf({ provider: providerEntry, entitlement: entitlements[providerId], modelProvidersLoading: loading }) : null;
  const oauthProviderId = providerId ? oauthProviderIdOfCodingPlan(providerId) : null;
  const loginState = providerId ? (authStates[providerId] ?? `unknown`) : `unknown`;
  const authenticated = loginState === `authenticated`;
  const loginLoading = isLoginStatePending(loginState);
  const loginError = loginState === `error`;
  const accountRequirementVisible = entryStatus?.status === `disconnected` || entryStatus?.status === `unavailable`;
  const readAuthState = React.useCallback(async () => loadPurchaseAuthState(credentialService), [credentialService]);
  const applyAuthState = React.useCallback((state: any) => {
    setAuthStates(
      Object.fromEntries(
        Object.entries(state).map(([key, value]) => [key, value ? `authenticated` : `unauthenticated`]),
      ),
    );
  }, []);
  const refreshAuthState = React.useCallback(async () => {
    applyAuthState(await readAuthState());
  }, [applyAuthState, readAuthState]);
  const retryLoginState = React.useCallback(() => {
    if (!providerId) return;
    const seq = attemptSeqRef.current + 1;
    (attemptSeqRef.current = seq),
      setAuthStates((prev) => ({ ...prev, [providerId]: `loading` })),
      readAuthState()
        .then((state) => {
          attemptSeqRef.current === seq && applyAuthState(state);
        })
        .catch((error) => {
          attemptSeqRef.current === seq &&
            (setAuthStates((prev) => ({ ...prev, [providerId]: `error` })),
            logger.warn(`[CodingPlanUpgradeDialog] 读取购买登录态失败`, { providerId: providerId, error: error }));
        });
  }, [applyAuthState, providerId, readAuthState]);
  (React.useEffect(() => {
    if (!target || !providerId) {
      (attemptSeqRef.current += 1), setAuthStates({});
      return;
    }
    return (
      retryLoginState(),
      () => {
        attemptSeqRef.current += 1;
      }
    );
  }, [providerId, retryLoginState, target, user]),
  React.useEffect(() => {
    if (lastSuccessSeqRef.current === oauthSuccessSeq) return;
    if (!target || !providerId || !oauthProviderId || lastOAuthSuccessProvider !== oauthProviderId) {
      pendingLoginRef.current || (lastSuccessSeqRef.current = oauthSuccessSeq);
      return;
    }
    lastSuccessSeqRef.current = oauthSuccessSeq;
    const seq = attemptSeqRef.current + 1;
    attemptSeqRef.current = seq;
    let cancelled = false;
    return (
      setAuthStates((prev) => ({ ...prev, [providerId]: `loading` })),
      (async () => {
        await Promise.allSettled([modelProviderService.refreshCodingPlanApiKey(providerId), refresh()]);
        const state = await readAuthState();
        if (!(cancelled || attemptSeqRef.current !== seq)) {
          if ((applyAuthState(state), state[providerId] !== true)) {
            logger.warn(`[CodingPlanUpgradeDialog] OAuth 成功后购买凭据仍不可用`, {
              providerId: providerId,
              oauthProviderId: oauthProviderId,
            });
            return;
          }
          (logger.info(`[CodingPlanUpgradeDialog] OAuth 成功后购买登录态已确认`, {
            providerId: providerId,
            oauthProviderId: oauthProviderId,
          }),
            setProductsRefreshToken((prev) => prev + 1));
        }
      })().catch((error) => {
        cancelled ||
          attemptSeqRef.current !== seq ||
          (setAuthStates((prev) => ({ ...prev, [providerId]: `error` })),
          logger.warn(`[CodingPlanUpgradeDialog] OAuth 成功后刷新购买登录态失败`, {
            providerId: providerId,
            oauthProviderId: oauthProviderId,
            error: error,
          }));
      }),
      () => {
        cancelled = true;
      }
    );
  }, [applyAuthState, lastOAuthSuccessProvider, modelProviderService, oauthProviderId, oauthSuccessSeq, providerId, refresh, readAuthState, target]),
  React.useEffect(() => {
    const action = resolveLoginAttemptAction({ pending: pendingLoginRef.current, loginAttempt: loginEntryAttempt });
    action.action !== `wait` &&
      ((pendingLoginRef.current = null),
      action.action === `reopen` &&
        (logger.info(`[CodingPlanUpgradeDialog] OAuth 成功后重新打开升级页面`, {
          providerId: action.target.providerId,
          initialAudience: action.target.initialAudience,
          loginAttemptId: loginEntryAttempt?.id,
        }),
        onReopen(action.target)));
  }, [loginEntryAttempt, onReopen]));
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      open || onClose();
    },
    [onClose],
  );
  const handleLogin = React.useCallback(() => {
    if (oauthProviderId) return requestLoginEntry(oauthProviderId);
  }, [oauthProviderId, requestLoginEntry]);
  const handlePlanLogin = React.useCallback(
    (args: any) => {
      if (!oauthProviderId || !target) return;
      const attempt = beginUpgradeLoginAttempt({
        target: target,
        oauthProviderId: oauthProviderId,
        audience: args.audience,
        requestLoginEntry: requestLoginEntry,
        onClose: onClose,
      });
      return (pendingLoginRef.current = attempt, attempt.loginAttemptId);
    },
    [oauthProviderId, onClose, requestLoginEntry, target],
  );
  const handlePurchaseComplete = React.useCallback(async () => {
    try {
      await refreshAfterPurchase({
        modelProviderService: modelProviderService,
        productsProviderId: productsProviderId,
        providerId: providerId,
        refreshCodingPlanEntitlements: refreshEntitlements,
        refreshModelProviders: refresh,
        refreshPurchaseTokenState: refreshAuthState,
        refreshTeamPlanProducts:
          productsProviderId === PROVIDER_IDS.bigmodelCodingPlan ? () => enterpriseProducts.refresh({ force: true }) : undefined,
      });
    } catch (error) {
      logger.warn(`[CodingPlanUpgradeDialog] 刷新 Coding Plan 购买状态失败`, {
        providerId: providerId,
        productsProviderId: productsProviderId,
        error: error,
      });
    }
  }, [enterpriseProducts, modelProviderService, productsProviderId, providerId, refreshEntitlements, refresh, refreshAuthState]);
  const initialAudience = React.useMemo(
    () =>
      target?.initialAudience ?? (target?.funnelContext?.purchaseAudience === `team` ? `team` : `personal`),
    [target?.funnelContext?.purchaseAudience, target?.initialAudience],
  );
  return !target || !providerId || !productsProviderId ? null : (
    <CodingPlanPurchasePanel
      open={true}
      providerId={providerId}
      productsProviderId={productsProviderId}
      currentPlanLevel={entryStatus?.planLevel}
      currentProductId={entryStatus?.currentProductId}
      codingPlanPurchaseTokenAuthenticated={authenticated}
      loginLoading={loginLoading}
      loginError={loginError}
      loginAttempt={loginEntryAttempt}
      loginProviderId={oauthProviderId}
      accountRequirementVisible={accountRequirementVisible}
      autoRecoverAuthOnOAuthRequired={true}
      initialAudience={initialAudience}
      initialTeamPlanKey={target.initialTeamPlanKey}
      funnelContext={target.funnelContext ?? null}
      productsRefreshToken={productsRefreshToken}
      onLogin={handleLogin}
      onPlanLogin={handlePlanLogin}
      onRetryLoginState={retryLoginState}
      onOpenChange={handleOpenChange}
      onPurchaseComplete={handlePurchaseComplete}
    />
  );
}

// dX → CodingPlanUpgradeDialogContext（本地 89140）
const CodingPlanUpgradeDialogContext = React.createContext<any>(null);

// krt → CodingPlanUpgradeDialogProvider（本地 89141）
export function CodingPlanUpgradeDialogProvider({ children }: any) {
  const [target, setTarget] = React.useState<any>(undefined);
  const openCodingPlanUpgrade = React.useCallback((next: any) => {
    setTarget(next);
  }, []);
  const value = React.useMemo(() => ({ openCodingPlanUpgrade: openCodingPlanUpgrade }), [openCodingPlanUpgrade]);
  return (
    <CodingPlanUpgradeDialogContext.Provider value={value}>
      {children}
      <CodingPlanUpgradeDialog target={target} onClose={() => setTarget(undefined)} onReopen={setTarget} />
    </CodingPlanUpgradeDialogContext.Provider>
  );
}

// fX → useCodingPlanUpgradeDialog（本地 89153）
function useCodingPlanUpgradeDialog() {
  const context = React.useContext(CodingPlanUpgradeDialogContext);
  if (!context)
    throw Error(`useCodingPlanUpgradeDialog must be used within CodingPlanUpgradeDialogProvider`);
  return context;
}

// Art → useCodingPlanUpgradeDialogOptional（本地 89159）
function useCodingPlanUpgradeDialogOptional() {
  return React.useContext(CodingPlanUpgradeDialogContext);
}

// pX → planSourceOptionsOf（本地 89163）
function planSourceOptionsOf({
  activeCodingPlanProviderIds,
  availableCodingPlanProviders,
  subscribedTeamProducts,
}: any) {
  const providerOptions = availableCodingPlanProviders
    .filter((provider: any) => activeCodingPlanProviderIds.includes(provider.id))
    .map((provider: any) => ({ id: provider.id, providerId: provider.id, label: provider.name }));
  const teamOptions = teamSourceOptionsOf(subscribedTeamProducts);
  return [...providerOptions, ...teamOptions];
}

// jrt → teamSourceOptionsOf（本地 89172）
function teamSourceOptionsOf(subscribedTeamProducts: any[]) {
  const seen = new Set<string>();
  return subscribedTeamProducts.flatMap((product: any) =>
    (product.teamProjects && product.teamProjects.length > 0
      ? product.teamProjects
      : [
          {
            organizationId: product.organizationId ?? null,
            organizationName: product.organizationName ?? null,
            projectId: product.projectId ?? null,
            projectName: product.projectName ?? null,
          },
        ]
    ).flatMap((project: any, index: number) => {
      const organizationId = project.organizationId?.trim() ?? ``;
      const projectId = project.projectId?.trim() ?? ``;
      if (!organizationId || !projectId) return [];
      const label = teamSourceLabelOf({
        product: product,
        organizationId: organizationId,
        organizationName: project.organizationName ?? product.organizationName,
        projectId: projectId,
        projectName: project.projectName ?? product.projectName,
      });
      if (!label) return [];
      const projectKey = projectId || String(index);
      const id = teamPlanKeyOf({ productId: product.productId, organizationId: organizationId, projectId: projectKey });
      return seen.has(id)
        ? []
        : (seen.add(id),
          [{ id: id, providerId: PROVIDER_IDS.bigmodelCodingPlan, label: label, organizationId: organizationId, projectId: projectId }]);
    }),
  );
}

// Mrt → resolvePurchaseAudience（本地 89210）
function resolvePurchaseAudience({ bigmodelSelectedKey, selectedProviderId, teamSources }: any) {
  if (selectedProviderId === PROVIDER_IDS.zaiCodingPlan)
    return { audience: `individual`, providerId: PROVIDER_IDS.zaiCodingPlan, sourceId: PROVIDER_IDS.zaiCodingPlan };
  if (selectedProviderId !== PROVIDER_IDS.bigmodelCodingPlan) return null;
  const key = bigmodelSelectedKey?.trim() ?? ``;
  if (key.startsWith(`team-plan:${PROVIDER_IDS.bigmodelCodingPlan}:`)) {
    const match = teamSources.find((source: any) => teamSourceIdMatches(source.id, key));
    return match
      ? { audience: `team`, providerId: PROVIDER_IDS.bigmodelCodingPlan, sourceId: match.id, teamSource: match }
      : null;
  }
  return {
    audience: `individual`,
    providerId: PROVIDER_IDS.bigmodelCodingPlan,
    sourceId: PROVIDER_IDS.bigmodelCodingPlan,
  };
}

// mX → teamSourceIdMatches（本地 89227）
function teamSourceIdMatches(sourceId: string, selectedKey: string) {
  if (teamPlanKeysPrefixEqual(sourceId, selectedKey)) return true;
  const sourceParsed = parseTeamPlanKey(sourceId);
  const selectedParsed = parseTeamPlanKey(selectedKey);
  return !!(
    sourceParsed?.projectId &&
    selectedParsed?.projectId &&
    sourceParsed.projectId === selectedParsed.projectId &&
    (!sourceParsed.organizationId || !selectedParsed.organizationId || sourceParsed.organizationId === selectedParsed.organizationId)
  );
}

// Nrt → teamSourceLabelOf（本地 89238）
function teamSourceLabelOf({ product, organizationId, organizationName, projectId, projectName }: any) {
  const label = teamOrganizationLabelOf({ ...product, organizationId: organizationId, organizationName: organizationName, projectId: projectId, projectName: projectName });
  return label ? `BigModel - ${label}` : null;
}

// Prt/Frt（本地 89242–89243）
const SIDEBAR_CODING_PLAN_PROVIDER_PREFERENCE_KEY = `zcode:sidebar-usage-coding-plan-provider`;
const SIDEBAR_CODING_PLAN_PROVIDER_IDS = [PROVIDER_IDS.zaiCodingPlan, PROVIDER_IDS.bigmodelCodingPlan];

// hX → eligibleSidebarCodingPlanProviders（本地 89244）
function eligibleSidebarCodingPlanProviders(modelProviders: any[]) {
  return SIDEBAR_CODING_PLAN_PROVIDER_IDS.flatMap((id: string) => {
    const provider = modelProviders.find((entry: any) => entry.id === id);
    const notEntitled = provider?.systemDisabledReason === `coding_plan_not_entitled`;
    return provider && (isProviderConfigurable(provider) || notEntitled) && provider.apiKey.trim().length > 0 ? [provider] : [];
  });
}

// Irt → sidebarPreferenceStorageOf（本地 89252）
function sidebarPreferenceStorageOf() {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch (error) {
    return (
      logger.warn(`[sidebarUsageCodingPlanProviderPreference] localStorage 不可用`, {
        error: error instanceof Error ? error.message : String(error),
      }),
      null
    );
  }
}

// Lrt → writeSidebarCodingPlanProviderPreference（本地 89263）
function writeSidebarCodingPlanProviderPreference(providerId: string) {
  const storage = sidebarPreferenceStorageOf();
  if (storage)
    try {
      storage.setItem(SIDEBAR_CODING_PLAN_PROVIDER_PREFERENCE_KEY, providerId);
    } catch (error) {
      logger.warn(`[sidebarUsageCodingPlanProviderPreference] 写入偏好失败`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
}

// Rrt → modelEntryMatchesValue（本地 89275）
function modelEntryMatchesValue(entry: any, value: string) {
  return entry.id === value || Object.values(entry.modelIdByKind ?? {}).includes(value);
}

// zrt → thoughtOptionOfModel（本地 89278）
function thoughtOptionOfModel(modelProviders: any[], providerId: string | undefined, modelId: string) {
  const model = modelProviders.find((entry: any) => entry.id === providerId)?.models.find((entry: any) => typeof entry != `string` && modelEntryMatchesValue(entry, modelId));
  const reasoningLevels = model?.reasoning ? Object.keys(model.reasoning.levels) : [];
  const levels = reasoningLevels.length > 0 ? reasoningLevels : isThoughtCapableModel(modelId) ? [...DEFAULT_THOUGHT_LEVELS] : [];
  return levels.length === 0
    ? null
    : {
        id: `thought_level`,
        name: `Thought Level`,
        category: `thought_level`,
        type: `select`,
        currentValue:
          model?.reasoning?.defaultLevel && levels.includes(model.reasoning.defaultLevel)
            ? model.reasoning.defaultLevel
            : isThoughtCapableModel(modelId)
              ? `max`
              : (levels[0] ?? ``),
        options: levels.map((level: any) => ({ value: level, name: level })),
      };
}

// Brt → currentOptionValueOf（本地 89302）
function currentOptionValueOf(configOptions: any[], category: string) {
  const option = configOptions.find((entry: any) => entry.category === category && entry.type === `select`);
  return String(option?.currentValue ?? ``).trim();
}

// Vrt → projectionConfigOfOptions（本地 89306）
function projectionConfigOfOptions(configOptions: any[]) {
  const modelValue = currentOptionValueOf(configOptions, `model`);
  if (!modelValue) return null;
  const projection = parseModelProjection(modelValue)!;
  const thought = currentOptionValueOf(configOptions, `thought_level`);
  return {
    provider: projection.providerId,
    model: projection.modelId,
    thought: thought || projection.variant || ``,
    thoughtLevels: [],
    followupMode: `queue`,
    mode: `build`,
  };
}

// Hrt → configMatchesModel（本地 89320）
function configMatchesModel(config: any, providerId: string, modelId: string) {
  return config?.provider === providerId && config.model === modelId;
}

// Urt → resolveEffectiveConfig（本地 89323）
function resolveEffectiveConfig(args: any) {
  const { configOptions, projectionConfig, desiredConfig } = args;
  const optionConfig = projectionConfigOfOptions(configOptions);
  const provider = desiredConfig.provider?.trim() ?? ``;
  const model = desiredConfig.model?.trim() ?? ``;
  if (provider && model) {
    const match = configMatchesModel(projectionConfig, provider, model) ? projectionConfig : configMatchesModel(optionConfig, provider, model) ? optionConfig : null;
    return {
      provider: provider,
      model: model,
      thought: Object.prototype.hasOwnProperty.call(desiredConfig, `thought`)
        ? (desiredConfig.thought ?? ``)
        : (match?.thought ?? ``),
      thoughtLevels: desiredConfig.thoughtLevels ?? match?.thoughtLevels ?? [],
      followupMode: desiredConfig.followupMode ?? match?.followupMode ?? `queue`,
      mode: desiredConfig.mode ?? match?.mode ?? `build`,
    };
  }
  const fallback = projectionConfig ?? optionConfig;
  return fallback
    ? {
        ...fallback,
        ...(Object.prototype.hasOwnProperty.call(desiredConfig, `thought`) ? { thought: desiredConfig.thought ?? `` } : {}),
        ...(desiredConfig.followupMode ? { followupMode: desiredConfig.followupMode } : {}),
        ...(desiredConfig.mode ? { mode: desiredConfig.mode } : {}),
      }
    : null;
}

// Wrt → draftThoughtOptionOfModel（本地 89347，zrt 别名）
const draftThoughtOptionOfModel = thoughtOptionOfModel;

// Grt → resolvedThoughtLevelOf（本地 89348）
function resolvedThoughtLevelOf(args: any) {
  const thought = args.thought?.trim() ?? ``;
  return thought && args.thoughtLevels.includes(thought)
    ? thought
    : (args.modelThoughtOption?.type === `select` &&
      typeof args.modelThoughtOption.currentValue == `string` &&
      args.thoughtLevels.includes(args.modelThoughtOption.currentValue)
        ? args.modelThoughtOption.currentValue
        : ``) ||
        (args.thoughtLevels[0] ?? ``);
}

// Krt → defaultModeOf（本地 89362，委托 $M）
function defaultModeOf(config?: any) {
  return defaultSessionModeOf(config);
}

// qrt → ModePickerTrigger（本地 89306 区，pay_range 12695）
function ModePickerTrigger({
  compactIconOnly = false,
  disabled,
  disabledReason,
  intl,
  labelVisibilityClassName,
  modeOption,
  modeShortcutLabel,
  modeTriggerRef,
  onConfigValueChange,
  open,
  onOpenChange,
  restoreFocusSelector,
  selectedProvider,
}: any) {
  return (
    <ConfigSelect
      option={modeOption}
      onValueChange={(value: any) => onConfigValueChange(modeOption, value)}
      open={open}
      onOpenChange={onOpenChange}
      disabled={disabled}
      tooltipTitle={disabledReason ?? intl.formatMessage({ id: `chat.toolbar.mode.label` })}
      shortcutLabel={modeShortcutLabel}
      triggerRef={modeTriggerRef}
      triggerSize={`default`}
      triggerClassName={
        compactIconOnly
          ? `size-7 justify-center gap-0 rounded-lg p-0 text-ui-base @xl/composer:h-7 @xl/composer:w-fit @xl/composer:justify-between @xl/composer:gap-1 @xl/composer:pl-2 @xl/composer:pr-1.5`
          : `gap-1 rounded-lg pl-2 pr-1.5 text-ui-base`
      }
      indicatorClassName={compactIconOnly ? `hidden @xl/composer:block` : undefined}
      leadingIcon={ModeLeadingIcon}
      labelVisibilityClassName={labelVisibilityClassName}
      provider={selectedProvider}
      restoreFocusSelector={restoreFocusSelector}
    />
  );
}

// Jrt → noopToolbarAction（本地 89340）
function noopToolbarAction() {}

// Yrt → MODE_TRIGGER_SELECTOR（本地 89341）
const MODE_TRIGGER_SELECTOR = `[data-testid="${MODE_TRIGGER_TESTID}"]`;

// Xrt → SessionModePicker（本地 89343）
function SessionModePicker({
  provider,
  config,
  draftMode = false,
  draftConfig,
  disabled,
  activeConfigPicker,
  onConfigPickerOpenChange,
  onSwitchMode,
}: any) {
  const { intl } = useZCodeIntl();
  const selectedProvider = provider ?? `glm`;
  const triggerRef = React.useRef(null);
  const shortcutLabel = React.useMemo(() => shortcutLabelOf(`M`), []);
  const modeOption = React.useMemo(
    () =>
      !config && !draftMode
        ? null
        : {
            id: `mode`,
            name: `Mode`,
            category: `mode`,
            type: `select`,
            currentValue: draftMode ? (draftConfig?.mode ?? defaultModeOf()) : config?.mode || `build`,
            options: sessionModeCatalog().map((entry: any) => ({ value: entry.id, name: entry.name, description: entry.description })),
          },
    [config, draftConfig?.mode, draftMode],
  );
  const handleConfigValueChange = React.useCallback(
    (option: any, value: any) => {
      onSwitchMode(value);
    },
    [onSwitchMode],
  );
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      onConfigPickerOpenChange(`mode`, open);
    },
    [onConfigPickerOpenChange],
  );
  const handleCycleSessionMode = React.useCallback(() => {
    if (!modeOption || modeOption.type !== `select`) return;
    const next = nextSelectValue(modeOption);
    next != null && onSwitchMode(next);
  }, [modeOption, onSwitchMode]);
  return (
    useToolbarShortcuts({
      hasAnyOption: !!modeOption,
      toolbarDisabled: disabled,
      modelMenuDisabled: true,
      modeOption: modeOption ?? undefined,
      onCycleSessionMode: handleCycleSessionMode,
      onOpenModelMenu: noopToolbarAction,
      onCycleThoughtLevel: noopToolbarAction,
    }),
    modeOption ? (
      <ModePickerTrigger
        compactIconOnly={true}
        disabled={disabled}
        intl={intl}
        modeOption={modeOption}
        modeShortcutLabel={shortcutLabel}
        modeTriggerRef={triggerRef}
        onConfigValueChange={handleConfigValueChange}
        open={activeConfigPicker === `mode`}
        onOpenChange={handleOpenChange}
        restoreFocusSelector={MODE_TRIGGER_SELECTOR}
        selectedProvider={selectedProvider}
      />
    ) : null
  );
}

// Zrt → SessionModePickerMemo（本地 89415）
const SessionModePickerMemo = React.memo(SessionModePicker);

// Qrt → MODEL_FOCUS_SELECTOR（本地 89416）
const MODEL_FOCUS_SELECTOR = `[data-testid="${MODE_TRIGGER_TESTID}"]`;

// $rt → noopSessionModeCycle（本地 89417）
function noopSessionModeCycle() {}

// eit → providerFamilyKindOf（本地 89418）
function providerFamilyKindOf(providerId: any) {
  switch (providerId?.trim()) {
    case PROVIDER_IDS.zai:
      return { family: `zai`, kind: `apiKey` };
    case PROVIDER_IDS.zaiCodingPlan:
      return { family: `zai`, kind: `personalCoding` };
    case PROVIDER_IDS.zaiStartPlan:
      return { family: `zai`, kind: `start` };
    case PROVIDER_IDS.bigmodel:
      return { family: `bigmodel`, kind: `apiKey` };
    case PROVIDER_IDS.bigmodelCodingPlan:
      return { family: `bigmodel`, kind: `personalCoding` };
    case PROVIDER_IDS.bigmodelStartPlan:
      return { family: `bigmodel`, kind: `start` };
    case PROVIDER_IDS.zapi:
      return { family: `zai`, kind: `zapi` };
    default:
      return null;
  }
}

// tit → purchaseAudienceStateOf（本地 89441）
function purchaseAudienceStateOf(args: any) {
  const familyKind = providerFamilyKindOf(args.providerId);
  if (
    !familyKind ||
    familyKind.kind === `apiKey` ||
    familyKind.kind === `zapi` ||
    familyConnectionModeOf(familyKind.family, args.modelProviderFamilyModes ?? {}) !== `oauth`
  )
    return { kind: `none` };
  const selectedKey = args.modelProviderFamilySelectedKeys?.[familyKind.family]?.trim() ?? ``;
  if (!selectedKey) return { kind: `none` };
  if (familyKind.kind === `start`) {
    const providerId = args.providerId?.trim();
    return (providerId !== PROVIDER_IDS.zaiStartPlan && providerId !== PROVIDER_IDS.bigmodelStartPlan) || selectedKey !== `coding-plan:${providerId}`
      ? { kind: `none` }
      : { family: familyKind.family, kind: `start`, providerId: providerId };
  }
  const providerId = args.providerId?.trim();
  return providerId !== PROVIDER_IDS.zaiCodingPlan && providerId !== PROVIDER_IDS.bigmodelCodingPlan
    ? { kind: `none` }
    : providerId === PROVIDER_IDS.bigmodelCodingPlan && selectedKey.startsWith(`team-plan:${PROVIDER_IDS.bigmodelCodingPlan}:`)
      ? {
          family: `bigmodel`,
          kind: `teamCoding`,
          providerId: PROVIDER_IDS.bigmodelCodingPlan,
          selectedSourceKey: selectedKey,
        }
      : selectedKey === `coding-plan:${providerId}`
        ? { family: familyKind.family, kind: `personalCoding`, providerId: providerId }
        : { kind: `none` };
}

// nit → teamSourceOfEntitlementSnapshot（本地 89477）
function teamSourceOfEntitlementSnapshot({ selectedSourceKey, snapshot }: any) {
  if (snapshot?.context?.scope !== `team`) return null;
  const organizationId = snapshot.context.organizationId?.trim() ?? ``;
  const projectId = snapshot.context.projectId?.trim() ?? ``;
  if (!organizationId || !projectId) return null;
  const details = snapshot.subscription?.details[0] ?? null;
  const sourceId = teamPlanKeyOf({
    productId: snapshot.context.productId?.trim() || details?.productId?.trim() || `current`,
    organizationId: organizationId,
    projectId: projectId,
  });
  if (!teamSourceIdMatches(sourceId, selectedSourceKey)) return null;
  const planName = snapshot.context.displayName?.trim() || details?.productName?.trim() || `Team`;
  return {
    id: sourceId,
    providerId: PROVIDER_IDS.bigmodelCodingPlan,
    label: `BigModel - ${planName}`,
    organizationId: organizationId,
    projectId: projectId,
  };
}

// rit → resolveTeamSourceSelection（本地 89499）
function resolveTeamSourceSelection(args: any) {
  const selectedSourceKey = args.selectedSourceKey?.trim() ?? ``;
  return args.providerId !== PROVIDER_IDS.bigmodelCodingPlan ||
    !selectedSourceKey.startsWith(`team-plan:${PROVIDER_IDS.bigmodelCodingPlan}:`)
    ? null
    : (planSourceOptionsOf({
        activeCodingPlanProviderIds: [],
        availableCodingPlanProviders: [],
        subscribedTeamProducts: args.subscribedTeamProducts,
      }).find((source: any) => teamSourceIdMatches(source.id, selectedSourceKey)) ??
        args.cachedTeamSources?.find((source: any) => teamSourceIdMatches(source.id, selectedSourceKey)) ??
        teamSourceOfEntitlementSnapshot({ selectedSourceKey: selectedSourceKey, snapshot: args.entitlementSnapshot }));
}

// iit → SessionModelToolbar（本地 89503）
function SessionModelToolbar({
  workspacePath,
  workspaceIdentity,
  sessionId,
  phase,
  provider,
  config,
  draftMode = false,
  draftConfig,
  usage,
  disabled,
  activeConfigPicker,
  onConfigPickerOpenChange,
  onSelectModel,
  onSelectThought,
  onSendCompressionCommand,
  onRecoverCustomModelSelection,
}: any) {
  const { intl, locale } = useZCodeIntl();
  const { openCodingPlanUpgrade } = useCodingPlanUpgradeDialog();
  const selectedProvider = provider ?? `glm`;
  const { configOptions, error } = useWorkspaceConfigOptions(workspacePath, null, workspaceIdentity);
  const { modelProviders, displayOrder, loading } = useModelProviders();
  const { settings } = useSettingsState();
  const autoRefreshMode = phaseAutoRefreshModeOf(phase);
  const { entitlements, refresh: refreshEntitlements } = useCodingPlanEntitlements({
    autoRefreshMode: autoRefreshMode,
    modelProviders: modelProviders,
    loading: loading,
    modelProviderFamilySelectedKeys: settings?.modelProviderFamilySelectedKeys,
  });
  const openSettingsTab = useTabsStoreActions((state: any) => state.openSettingsTab);
  const getEntitlementSnapshot = React.useCallback((id: string) => entitlements[id]?.snapshot ?? null, [entitlements]);
  const modelTriggerRef = React.useRef(null);
  const thoughtTriggerRef = React.useRef(null);
  const [openRequestKey, setOpenRequestKey] = React.useState(0);
  const [recovering, setRecovering] = React.useState(false);
  const handleOpenModelMenu = React.useCallback(() => {
    setOpenRequestKey((prev) => prev + 1);
  }, []);
  const handleModelPickerOpenChange = React.useCallback(
    (open: boolean) => {
      onConfigPickerOpenChange(`model`, open);
    },
    [onConfigPickerOpenChange],
  );
  const handleThoughtPickerOpenChange = React.useCallback(
    (open: boolean) => {
      onConfigPickerOpenChange(`thought`, open);
    },
    [onConfigPickerOpenChange],
  );
  const modelOption = configOptions.find((entry: any) => entry.category === `model`);
  const effectiveConfig = React.useMemo(
    () => (draftMode ? resolveEffectiveConfig({ configOptions: configOptions, projectionConfig: config, desiredConfig: draftConfig ?? {} }) : config),
    [config, configOptions, draftConfig, draftMode],
  );
  const handleUpgradeClick = React.useCallback(
    (providerId: string) => {
      openCodingPlanUpgrade({
        providerId: providerId,
        funnelContext: buildUpgradeFunnel({
          providerId: providerId,
          upgradeSource: `session_token_usage`,
          eventRegion: `app.session`,
          eventText: intl.formatMessage({ id: `chat.quota.action.upgrade` }),
          entryPlanState: entryPlanStateOf({ providerId: providerId, displayStatus: `purchased`, planLevel: `start` }),
        }),
      });
    },
    [intl, openCodingPlanUpgrade],
  );
  const handleUsageClick = React.useCallback(
    (providerId: any) => {
      (providerId && writeSidebarCodingPlanProviderPreference(providerId), invalidateSettingsCache(), openSettingsTab());
    },
    [openSettingsTab],
  );
  const audienceState = React.useMemo(
    () =>
      purchaseAudienceStateOf({
        modelProviderFamilyModes: settings?.modelProviderFamilyModes,
        modelProviderFamilySelectedKeys: settings?.modelProviderFamilySelectedKeys,
        providerId: effectiveConfig?.provider,
      }),
    [effectiveConfig?.provider, settings?.modelProviderFamilyModes, settings?.modelProviderFamilySelectedKeys],
  );
  const startPlanBalance = React.useMemo(() => {
    if (audienceState.kind !== `start`) return;
    const entry = entitlements[audienceState.providerId];
    return {
      loading: entry?.loading ?? loading,
      onUpgradeClick: () => handleUpgradeClick(audienceState.providerId),
      snapshot: entry?.snapshot?.provider?.id === audienceState.providerId ? entry.snapshot : null,
    };
  }, [audienceState, entitlements, handleUpgradeClick, loading]);
  const startPlanBalanceProp = hasStartPlanBalance(startPlanBalance) ? startPlanBalance : undefined;
  const sidebarProviders = React.useMemo(() => eligibleSidebarCodingPlanProviders(modelProviders), [modelProviders]);
  const teamProducts = useEnterpriseCodingPlanProducts({ enabled: !loading && audienceState.kind === `teamCoding`, authenticated: true });
  const subscribedTeamProducts = React.useMemo(
    () => teamProducts.snapshot?.productList.filter((product: any) => product.subscribed === true) ?? [],
    [teamProducts.snapshot?.productList],
  );
  const cachedTeamSources = React.useRef<any[]>([]);
  const codingPlanProviderId = audienceState.kind === `personalCoding` || audienceState.kind === `teamCoding` ? audienceState.providerId : undefined;
  const teamSource = React.useMemo(
    () =>
      audienceState.kind === `teamCoding`
        ? resolveTeamSourceSelection({
            cachedTeamSources: cachedTeamSources.current,
            entitlementSnapshot: entitlements[PROVIDER_IDS.bigmodelCodingPlan]?.snapshot ?? null,
            providerId: audienceState.providerId,
            selectedSourceKey: audienceState.selectedSourceKey,
            subscribedTeamProducts: subscribedTeamProducts,
          })
        : null,
    [audienceState, entitlements, subscribedTeamProducts],
  );
  React.useEffect(() => {
    if (!teamSource) return;
    const rest = cachedTeamSources.current.filter((source: any) => !teamSourceIdMatches(source.id, teamSource.id));
    (rest.unshift(teamSource), (cachedTeamSources.current = rest.slice(0, 8)));
  }, [teamSource]);
  const selectedSourceId = audienceState.kind === `teamCoding` ? teamSource?.id : codingPlanProviderId;
  const teamSubscription = useEntitlementSubscription({
    autoRefreshMode: autoRefreshMode,
    enabled: !loading && !!teamSource,
    includeSubscription: true,
    preferredProviderId: PROVIDER_IDS.bigmodelCodingPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    organizationId: teamSource?.organizationId,
    projectId: teamSource?.projectId,
    cacheKey: teamSource?.id,
  });
  registerSessionRefresh({
    phase: phase,
    refresh: React.useCallback(
      async (opts: any) => {
        await Promise.all([refreshEntitlements(opts), teamSubscription.refresh(opts)]);
      },
      [refreshEntitlements, teamSubscription.refresh],
    ),
    sessionId: sessionId,
  });
  const availableProviders = React.useMemo(
    () => (audienceState.kind === `personalCoding` && codingPlanProviderId ? sidebarProviders.filter((entry: any) => entry.id === codingPlanProviderId) : []),
    [sidebarProviders, codingPlanProviderId, audienceState.kind],
  );
  const entitlementSources = React.useMemo(() => {
    if (teamSource)
      return [
        {
          sourceId: teamSource.id,
          providerId: teamSource.providerId,
          label: teamSource.label,
          snapshot: teamSubscription.snapshot,
          loading: teamSubscription.loading,
          error: teamSubscription.error,
        },
      ];
    if (audienceState.kind !== `personalCoding` || !codingPlanProviderId) return [];
    const id = codingPlanProviderId;
    const entry = entitlements[id];
    return [
      {
        sourceId: id,
        providerId: id,
        snapshot: entry?.snapshot ?? null,
        loading: entry?.loading ?? loading,
        error: entry?.error ?? null,
      },
    ];
  }, [codingPlanProviderId, teamSource, audienceState.kind, entitlements, loading, teamSubscription.error, teamSubscription.loading, teamSubscription.snapshot]);
  const handleUsageClickCurrent = React.useCallback(() => handleUsageClick(selectedSourceId), [selectedSourceId, handleUsageClick]);
  const codingPlanUsageRemaining = React.useMemo(() => {
    if (!(audienceState.kind !== `personalCoding` && !teamSource))
      return {
        availableProviders: availableProviders,
        entitlements: entitlementSources,
        modelProvidersLoading: loading,
        onUsageClick: handleUsageClickCurrent,
        selectedProviderId: selectedSourceId,
      };
  }, [availableProviders, selectedSourceId, teamSource, audienceState.kind, entitlementSources, handleUsageClickCurrent, loading]);
  const codingPlanUsageRemainingProp = codingPlanUsageRemaining && hasPlanWidgetModel(codingPlanUsageRemaining) ? codingPlanUsageRemaining : undefined;
  React.useEffect(() => {
    draftMode &&
      logger.debug(`[v4-toolbar] draft effectiveConfig changed`, {
        provider: effectiveConfig?.provider ?? null,
        model: effectiveConfig?.model ?? null,
        thought: effectiveConfig?.thought ?? null,
        catalogModelCurrentValue: String(
          configOptions.find((entry: any) => entry.category === `model` && entry.type === `select`)?.currentValue ?? ``,
        ),
        catalogOptionCount: configOptions.length,
      });
  }, [configOptions, draftMode, effectiveConfig]);
  const modelGroups = React.useMemo(() => {
    const context = connectionModeContextOf({
      providers: modelProviders,
      selectedProvider: selectedProvider,
      getEntitlementSnapshot: getEntitlementSnapshot,
      modelProviderFamilySelectedKeys: settings?.modelProviderFamilySelectedKeys,
    });
    const options = modelOption?.type === `select` ? normalizedModelOptionsOf(modelOption.options ?? [], modelOption.currentValue, context) : [];
    return modelGroupsOf(
      selectedProvider,
      modelOption?.type === `select` && isModelMenuStructured(selectedProvider) ? options : [],
      context,
      {
        apiKeyLabel: intl.formatMessage({ id: `settings.modelProvider.apiKey` }),
        apiKeyBadgeLabel: intl.formatMessage({
          id: `settings.modelProvider.connectionMode.apiKeyBadge`,
        }),
        codingPlanLabel: intl.formatMessage({
          id: `settings.modelProvider.connectionMode.codingPlan`,
        }),
        codingPlanBadgeLabel: intl.formatMessage({
          id: `settings.modelProvider.connectionMode.codingPlanBadge`,
        }),
        startPlanLabel: intl.formatMessage({
          id: `settings.modelProvider.connectionMode.startPlan`,
        }),
        startPlanBadgeLabel: intl.formatMessage({
          id: `settings.modelProvider.connectionMode.startPlanBadge`,
        }),
        teamPlanBadgeLabel: intl.formatMessage({
          id: `settings.modelProvider.connectionMode.teamPlanBadge`,
        }),
        teamPlanFallbackLabel: intl.formatMessage({
          id: `settings.modelProvider.connectionMode.teamPlan`,
        }),
      },
      displayOrder,
      settings?.modelProviderFamilyModes,
      settings?.modelProviderFamilySelectedKeys,
      [],
      false,
      undefined,
      undefined,
      { providerFamilyDomain: settings?.providerFamilyDomain },
    );
  }, [
    displayOrder,
    selectedProvider,
    getEntitlementSnapshot,
    intl,
    modelOption,
    modelProviders,
    settings?.modelProviderFamilyModes,
    settings?.modelProviderFamilySelectedKeys,
    settings?.providerFamilyDomain,
  ]);
  const handleManageModels = React.useCallback(() => {
    (openSettingsSection(`modelProvider`), openSettingsTab());
  }, [openSettingsTab]);
  const manageModelsAvailable = useManageModelsAvailable(handleManageModels);
  const manageModelsLabel = intl.formatMessage({ id: `chat.toolbar.model.manageModels` });
  const normalizedModelValue = React.useMemo(
    () =>
      !effectiveConfig || !effectiveConfig.model
        ? ``
        : modelProviders.some((entry: any) => entry.id === effectiveConfig.provider)
          ? composeModelValue(effectiveConfig.provider, effectiveConfig.model)
          : effectiveConfig.model,
    [effectiveConfig, modelProviders],
  );
  const normalizedSelection = React.useMemo(() => normalizeModelSelectionValue(normalizedModelValue, modelGroups, manageModelsAvailable, manageModelsLabel), [manageModelsLabel, modelGroups, normalizedModelValue, manageModelsAvailable]);
  const normalizedValue = normalizedSelection.value ?? ``;
  const triggerLabel = React.useMemo(() => {
    const fallbackLabel = normalizedSelection.placeholder ?? intl.formatMessage({ id: `chat.toolbar.model.label` });
    const providerName = modelProviders.find((entry: any) => entry.id === effectiveConfig?.provider)?.name;
    return resolveModelTriggerLabel({
      modelGroups: modelGroups,
      normalizedValue: normalizedValue,
      fallbackLabel: fallbackLabel,
      providerId: effectiveConfig?.provider,
      providerName: providerName,
    });
  }, [effectiveConfig?.provider, intl, modelProviders, modelGroups, normalizedValue, normalizedSelection.placeholder]);
  const handleModelValueChange = React.useCallback(
    (value: string) => {
      const decoded = modelEntryOf(value);
      const previous = effectiveConfig?.provider && effectiveConfig.model ? { provider: effectiveConfig.provider, model: effectiveConfig.model } : null;
      logger.debug(`[v4-toolbar] model select onValueChange`, {
        value: value,
        decodedProviderId: decoded?.providerId ?? null,
        decodedModelName: decoded?.modelName ?? null,
        draftMode: draftMode,
      });
      const decodedProvider = decoded?.providerId ? modelProviders.find((entry: any) => entry.id === decoded.providerId) : undefined;
      const customRecoverable = !!(decodedProvider && !isPresetProviderId(decodedProvider.id) && decodedProvider.source !== `builtin`);
      if (error && decoded?.providerId && customRecoverable && onRecoverCustomModelSelection) {
        (setRecovering(true),
          Promise.resolve(onRecoverCustomModelSelection(value, previous))
            .catch((recoveryError) => {
              logger.warn(`[v4-toolbar] custom provider recovery failed`, {
                error: recoveryError instanceof Error ? recoveryError.message : String(recoveryError),
                providerId: decoded.providerId,
              });
            })
            .finally(() => {
              setRecovering(false);
            }));
        return;
      }
      if (decoded) {
        onSelectModel(decoded.providerId, decoded.modelName ?? ``, previous);
        return;
      }
      const separatorIndex = value.indexOf(`/`);
      if (separatorIndex > 0) {
        onSelectModel(value.slice(0, separatorIndex), value.slice(separatorIndex + 1), previous);
        return;
      }
      onSelectModel(``, value, previous);
    },
    [error, selectedProvider, draftMode, effectiveConfig?.model, effectiveConfig?.provider, onRecoverCustomModelSelection, onSelectModel, modelProviders, workspaceIdentity, workspacePath],
  );
  const modelThoughtOption = React.useMemo(() => (draftMode && effectiveConfig ? draftThoughtOptionOfModel(modelProviders, effectiveConfig.provider, effectiveConfig.model) : null), [draftMode, effectiveConfig, modelProviders]);
  const thoughtOption = React.useMemo(
    () =>
      effectiveConfig
        ? effectiveConfig.thoughtLevels.length > 0
          ? {
              id: `thought_level`,
              name: `Thought Level`,
              category: `thought_level`,
              type: `select`,
              currentValue: resolvedThoughtLevelOf({
                thought: effectiveConfig.thought,
                thoughtLevels: effectiveConfig.thoughtLevels,
                modelThoughtOption: modelThoughtOption,
              }),
              options: effectiveConfig.thoughtLevels.map((level: any) => ({ value: level, name: level })),
            }
          : !draftMode || !modelThoughtOption
            ? null
            : { ...modelThoughtOption, currentValue: effectiveConfig.thought || modelThoughtOption.currentValue }
        : null,
    [draftMode, modelThoughtOption, effectiveConfig],
  );
  const handleThoughtValueChange = React.useCallback(
    (value: string) => {
      if (effectiveConfig) {
        if (!value.trim()) {
          logger.debug(`[v4-toolbar] ignore synthetic empty thought change`, {
            model: effectiveConfig.model,
            provider: effectiveConfig.provider,
          });
          return;
        }
        onSelectThought(value, { provider: effectiveConfig.provider, model: effectiveConfig.model });
      }
    },
    [effectiveConfig, onSelectThought],
  );
  const handleCycleThoughtLevel = React.useCallback(() => {
    if (!thoughtOption || thoughtOption.type !== `select`) return;
    const next = nextThoughtLevelValue(thoughtOption);
    next != null && effectiveConfig && onSelectThought(next, { provider: effectiveConfig.provider, model: effectiveConfig.model });
  }, [effectiveConfig, onSelectThought, thoughtOption]);
  const taskUsage = React.useMemo(() => {
    const contextWindow = usage?.contextWindow;
    return contextWindow
      ? {
          used: contextWindow.usedTokens,
          size: contextWindow.maxTokens,
          ...(contextWindow.cache ? { cache: contextWindow.cache } : {}),
          ...(contextWindow.breakdown ? { breakdown: contextWindow.breakdown } : {}),
        }
      : null;
  }, [usage?.contextWindow]);
  const modelShortcutLabel = React.useMemo(() => shortcutLabelOf(`M`), []);
  const thoughtShortcutLabel = React.useMemo(() => shortcutLabelOf(`T`), []);
  const isItemLocked = React.useCallback(() => false, []);
  const menuAvailable = (!!effectiveConfig || draftMode) && (modelGroups.length > 0 || manageModelsAvailable);
  return (
    useToolbarShortcuts({
      hasAnyOption: !!modelOption || !!thoughtOption,
      toolbarDisabled: disabled || recovering,
      modelMenuDisabled: disabled || recovering || !menuAvailable,
      modelOption: modelOption,
      thoughtOption: thoughtOption ?? undefined,
      onOpenModelMenu: handleOpenModelMenu,
      onCycleThoughtLevel: handleCycleThoughtLevel,
      onCycleSessionMode: noopSessionModeCycle,
    }),
    (
      <>
        <span
          data-testid={MODEL_TOOLBAR_TESTID}
          data-source={
            draftMode
              ? draftConfig?.provider && draftConfig.model
                ? `draft-intent`
                : config
                  ? `prewarm-projection`
                  : effectiveConfig
                    ? `workspace-default`
                    : ``
              : config
                ? `projection`
                : ``
          }
          data-provider={effectiveConfig?.provider ?? ``}
          data-model={effectiveConfig?.model ?? ``}
          data-thought={effectiveConfig?.thought ?? ``}
          data-thought-levels={
            thoughtOption?.type === `select` ? (thoughtOption.options ?? []).map((entry: any) => entry.value).join(`,`) : ``
          }
          data-mode={effectiveConfig?.mode ?? ``}
          data-usage-used={usage?.contextWindow?.usedTokens ?? ``}
          data-usage-max={usage?.contextWindow?.maxTokens ?? ``}
          className={`hidden`}
        />
        <ContextUsagePopover
          codingPlanUsageRemaining={codingPlanUsageRemainingProp}
          taskUsage={taskUsage}
          startPlanBalance={startPlanBalanceProp}
          selectedProvider={selectedProvider}
          intl={intl}
          locale={locale}
          onSendCompressionCommand={onSendCompressionCommand}
          compressionDisabled={disabled || recovering}
        />
        {menuAvailable ? (
          <ModelSelectMenu
            modelGroups={modelGroups}
            normalizedValue={normalizedValue}
            triggerLabel={triggerLabel.fullLabel}
            triggerLabelPrefix={triggerLabel.providerPrefix}
            triggerLabelValue={triggerLabel.modelLabel}
            triggerLabelPrefixClassName={`hidden @xl/composer:inline`}
            showManageModelsAction={manageModelsAvailable}
            manageModelsLabel={manageModelsLabel}
            onManageModels={handleManageModels}
            lockReasonMessage={intl.formatMessage({
              id: `chat.toolbar.modelSwitch.lockedByRunningTask`,
            })}
            isItemLocked={isItemLocked}
            onValueChange={handleModelValueChange}
            disabled={disabled || recovering}
            tooltipTitle={intl.formatMessage({ id: `chat.toolbar.model.label` })}
            shortcutLabel={modelShortcutLabel}
            triggerRef={modelTriggerRef}
            open={activeConfigPicker === `model`}
            onOpenChange={handleModelPickerOpenChange}
            openRequestKey={openRequestKey}
            labelVisibilityClassName={`hidden @sm/composer:inline-flex`}
            indicatorClassName={`hidden @sm/composer:block`}
            triggerClassName={`@max-sm/composer:size-7 @max-sm/composer:justify-center @max-sm/composer:gap-0 @max-sm/composer:p-0`}
            triggerIconClassName={`inline-flex @sm/composer:hidden`}
            focusSelectorOnClose={MODEL_FOCUS_SELECTOR}
          />
        ) : null}
        {thoughtOption ? (
          <ThoughtLevelControl
            indicatorClassName={`hidden @xl/composer:block`}
            triggerClassName={`@max-sm/composer:size-7 @max-sm/composer:justify-center @max-sm/composer:p-0`}
            option={thoughtOption}
            onValueChange={handleThoughtValueChange}
            disabled={disabled || recovering}
            intl={intl}
            provider={selectedProvider}
            shortcutLabel={thoughtShortcutLabel}
            triggerRef={thoughtTriggerRef}
            open={activeConfigPicker === `thought`}
            onOpenChange={handleThoughtPickerOpenChange}
            restoreFocusSelector={MODEL_FOCUS_SELECTOR}
          />
        ) : null}
      </>
    )
  );
}

// ait → SessionModelToolbarMemo（本地 89958）
const SessionModelToolbarMemo = React.memo(SessionModelToolbar);

// oit → diffValueOf（本地 89959）
function diffValueOf(previous: any, current: any, hasOverride: any) {
  return hasOverride ? current : previous === current ? null : previous;
}

// sit → accessibleLabelOf（本地 89962）
function accessibleLabelOf(element: any) {
  return element.accessibleName || element.text || element.selector || element.tagName.toLowerCase();
}

// cit → elementDescriptorOf（本地 89965）
function elementDescriptorOf(element: any) {
  const role = element.role ? `role=${element.role}` : null;
  return [element.tagName.toLowerCase(), role].filter(Boolean).join(` · `);
}

// ─────────────────────────────────────────────────────────────────────────────
// §10 本地 89989–90179（pay_range 13378–13568）：会话上下文芯片（Web 元素 / 选区引用）
// 归属：F08 Home 族双归属（消费方在 Home/Composer 场景）
// 把握度：高（逐字转录）
// ─────────────────────────────────────────────────────────────────────────────

// lit → WebElementsChip（本地 89989）
function WebElementsChip({ contexts, contentAlign = `start`, onRemove, onRemoveAll }: any) {
  const { intl } = useZCodeIntl();
  if (contexts.length === 0) return null;
  const countLabel = intl.formatMessage(
    { id: contexts.length === 1 ? `chat.webElements.one` : `chat.webElements.many` },
    { count: String(contexts.length) },
  );
  const removeLabel = intl.formatMessage({ id: `chat.webElements.remove` });
  return (
    <PopoverRoot>
      <PopoverTriggerAsChild asChild={true}>
        <div
          className={cn(
            `group flex h-8 max-w-full cursor-pointer select-none items-center gap-1.5`,
            `rounded-md border border-border bg-surface p-1`,
            `font-medium text-ui-base text-foreground transition-all hover:bg-surface-hover`,
            `outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`,
          )}
          aria-label={countLabel}
          role={`button`}
          tabIndex={0}
        >
          <span className={`flex min-w-0 items-center gap-1.5 rounded-sm px-1`}>
            <GlobeIcon className={`size-4 shrink-0 text-foreground-subtle`} />
            <span className={`truncate`}>{countLabel}</span>
          </span>
          {onRemoveAll ? (
            <Button
              type={`button`}
              variant={`ghost`}
              size={`icon-xs`}
              className={`size-5 shrink-0 rounded-sm text-foreground-subtle opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100`}
              aria-label={removeLabel}
              title={removeLabel}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                (event.stopPropagation(), onRemoveAll());
              }}
            >
              <CloseIcon className={`size-3.5`} />
            </Button>
          ) : null}
        </div>
      </PopoverTriggerAsChild>
      <PopoverContent
        align={contentAlign}
        side={`top`}
        className={`w-80 rounded-xl border border-popover-border bg-menu p-1 text-foreground shadow-md ring-0`}
      >
        <div className={`max-h-64 overflow-y-auto`}>
          {contexts.map((context: any) => (
            <div
              key={context.id}
              className={`group/context flex min-h-7 cursor-default gap-2 rounded-lg px-2 py-1 text-ui-base/relaxed text-foreground hover:bg-menu-hover`}
            >
              <WebElementIcon className={`mt-1 size-4 shrink-0 text-foreground-subtle`} />
              <div className={`min-w-0 flex-1`}>
                <div className={`truncate font-medium`}>{accessibleLabelOf(context)}</div>
                <div className={`truncate font-mono text-ui-base text-foreground-subtle`}>
                  {elementDescriptorOf(context)}
                </div>
                <div className={`truncate text-ui-base text-foreground-subtlest`}>
                  {context.pageTitle || context.pageUrl}
                </div>
              </div>
              {onRemove ? (
                <Button
                  type={`button`}
                  variant={`ghost`}
                  size={`icon-xs`}
                  className={`mt-0.5 size-5 shrink-0 rounded-sm text-foreground-subtle opacity-0 transition-opacity hover:text-foreground group-hover/context:opacity-100`}
                  aria-label={removeLabel}
                  title={removeLabel}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    (event.stopPropagation(), onRemove(context.id));
                  }}
                >
                  <TrashIcon className={`size-3.5`} />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}

// uit → SelectionsChip（本地 90097）
function SelectionsChip({ references, onRemove, onRemoveAll }: any) {
  const { intl } = useZCodeIntl();
  if (references.length === 0) return null;
  const countLabel = intl.formatMessage({ id: `chat.selections.count` }, { count: String(references.length) });
  const removeLabel = intl.formatMessage({ id: `chat.selections.remove` });
  return (
    <PopoverRoot>
      <PopoverTriggerAsChild asChild={true}>
        <div
          role={`button`}
          tabIndex={0}
          aria-label={countLabel}
          data-conversation-selection-reference-count={references.length}
          className={`group flex h-8 max-w-full cursor-pointer select-none items-center gap-1.5 rounded-md border border-border bg-surface p-1 text-ui-base font-medium text-foreground transition-all hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`}
        >
          <span className={`flex min-w-0 items-center gap-1.5 rounded-sm px-1`}>
            <SelectionIcon className={`size-4 shrink-0 text-foreground-subtle`} />
            <span className={`truncate`}>{countLabel}</span>
          </span>
          {onRemoveAll ? (
            <Button
              type={`button`}
              variant={`ghost`}
              size={`icon-xs`}
              className={`size-5 shrink-0 rounded-sm text-foreground-subtle opacity-0 transition-opacity group-hover:opacity-100`}
              aria-label={removeLabel}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                (event.stopPropagation(), onRemoveAll());
              }}
            >
              <CloseIcon className={`size-3.5`} />
            </Button>
          ) : null}
        </div>
      </PopoverTriggerAsChild>
      <PopoverContent
        align={`start`}
        side={`top`}
        className={`w-80 rounded-xl border border-popover-border bg-menu p-1 text-foreground shadow-md ring-0`}
      >
        <div className={`max-h-64 overflow-y-auto`}>
          {references.map((reference: any, index: number) => (
            <div
              key={isStructuredSelection(reference) ? reference.id : `${index}:${reference.text}`}
              className={`group/reference flex gap-2 rounded-lg px-2 py-1.5 text-ui-base hover:bg-menu-hover`}
            >
              <SelectionIcon className={`mt-0.5 size-4 shrink-0 text-foreground-subtle`} />
              <div className={`min-w-0 flex-1`}>
                <div className={`line-clamp-3 whitespace-pre-wrap break-words`}>{reference.text}</div>
                {isStructuredSelection(reference) ? (
                  <div className={`mt-0.5 text-ui-sm text-foreground-subtlest`}>
                    {intl.formatMessage({ id: `chat.selections.type.${reference.contentType}` })}
                    {` `}
                    {`· #`}
                    {reference.sourceRowId}
                  </div>
                ) : null}
              </div>
              {onRemove && isStructuredSelection(reference) ? (
                <Button
                  type={`button`}
                  variant={`ghost`}
                  size={`icon-xs`}
                  className={`size-5 shrink-0 text-foreground-subtle opacity-0 group-hover/reference:opacity-100`}
                  aria-label={removeLabel}
                  onClick={() => onRemove(reference.id)}
                >
                  <TrashIcon className={`size-3.5`} />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → 本机 js 行；A 段 76612–90179 全量）
 * ============================================================================
 *  §1 上下文用量弹层（76612–76843）：
 *   y3e → closeThenRun 76612 | Aq → USAGE_CHART_COLORS 76615 | b3e → PERCENT_SCALE 76621
 *   x3e → CACHE_HIT_DISPLAY_THRESHOLD 76622 | S3e → formatCompactNumberLocale 76623
 *   C3e → formatUsedOfTotal 76626 | w3e → formatPercentOrNull 76630 区
 *   T3e → segmentStyleOfIndex 76637 | E3e → CONTEXT_BREAKDOWN_LABEL_KEYS 76640
 *   D3e → CONTEXT_BREAKDOWN_ORDER 76648 | O3e → aggregateContextBreakdown 76656
 *   k3e → toBreakdownSegments 76667 | A3e → validTaskUsageOrNull 76670
 *   j3e → ContextUsagePopover 76678
 *  §2 工具条配置选择（76844–77061）：
 *   M3e → isOptionValuePresent 76844 | N3e → FULL_ACCESS_MODES 76847 | P3e → categoryTestidOf 76848
 *   F3e → optionTestidOf 76852 | I3e → ApiRetryStatusChip 76856 | L3e → modeOptionLabelOf 76874
 *   R3e → modeLabelKeyOf 76877 | z3e → modeDescriptionKeyOf 76880 | jq → optionLabelOf 76883
 *   B3e → optionDescriptionOf 76886 | V3e → isFullAccessMode 76892 | H3e → modeIconOf 76895
 *   Mq → ConfigSelect 76912
 *  §3 思考级别机制（77127–77451）：
 *   Nq → normalizeOptionKey 77127 | K3e → isThoughtOffOption 77130 | q3e → thoughtRankOf 77133
 *   J3e → sortThoughtOptions 77141 | Y3e → nextThoughtLevelValue 77153 | X3e → thoughtOptionLabelOf 77160
 *   Pq → ThoughtLevelControl 77164 | Fq → shortcutKeyOfCategory | Z3e → nextSelectValue
 *   Q3e → resolveToolbarShortcut | $3e → useToolbarShortcuts
 *  §4 供应商/模型菜单机制（77452–78455）：
 *   e6e/t6e/Iq/Lq/n6e/r6e/i6e/a6e/Rq/o6e/s6e/zq/Bq/c6e/l6e/u6e/d6e/f6e/Vq/p6e/m6e/h6e/g6e/_6e
 *   v6e/y6e/b6e/x6e/S6e/C6e/Hq/w6e/T6e/E6e/D6e/O6e/k6e/A6e/j6e/M6e/N6e/P6e/F6e/I6e/L6e/R6e/z6e
 *   B6e/Uq/V6e/H6e/U6e/W6e/G6e/K6e/q6e/J6e/Y6e/X6e/Z6e/Q6e/$6e/e8e/t8e/n8e/Wq/r8e/Gq/Kq/i8e
 *   a8e/o8e/s8e/c8e/l8e/u8e/d8e/f8e/Jq/qq → 见 §4 内联注释（77452–78455）
 *  §5 支付/产品域（79693–80954）：
 *   L8e → ALIPAY_LOGO_SRC | $q → normalizeDescriptionItems | R8e → CURRENCY_LABELS
 *   eJ → PERIOD_LABEL_KEYS | tJ → productTitleOf | z8e → productBulletLinesOf | nJ → primaryAmountOf
 *   rJ → normalizeCurrency | iJ → formatMoney | aJ → periodOfProduct | oJ → AmountSummaryCard
 *   sJ → AmountRow | B8e → adjustmentSummaryLabelOf | V8e → formatNegatedTotal | cJ → buildAmountSummary
 *   H8e → resolvePayAmount | U8e → pickRenewAmount | W8e → sumCampaignDiscounts | G8e → campaignDiscountRowsOf
 *   K8e → currentPlanCreditRowOf | q8e → firstPositive | J8e → firstNonNegative | Y8e → residualCreditOf
 *   X8e/Z8e/Q8e → PLAN_OVERVIEW/SERVICE_AGREEMENT/SUBSCRIPTION_AGREEMENT_URL
 *   $8e → CodingPlanPaymentQrHost | e5e → CodingPlanPaymentQrDialog 80027 | t5e → paymentDialogTitleOf
 *   lJ → PolicyLink | n5e → currencyOfProduct | r5e → BADGE_VARIANTS | uJ → Badge
 *   i5e → OAUTH_REQUIRED_ERROR | dJ/fJ → ZAI_START_FREE 文案 | a5e/o5e → TTL + 模块映射
 *   s5e → useCodingPlanProducts 80369 | c5e/l5e/d5e/f5e/p5e/m5e → 预览快照机制
 *   h5e/g5e/vJ/yJ/_5e/v5e/bJ/y5e/b5e/xJ/SJ/x5e/S5e/C5e/w5e → Start-Free 与错误归一
 *   CJ → InfoNoticeCard | wJ → productErrorMessageOf 80672
 *   T5e → TERMINAL_ORDER_STATES | TJ/E5e/D5e/O5e/k5e/A5e/EJ/j5e/M5e/N5e/P5e/F5e/I5e/L5e/R5e
 *   DJ/OJ/kJ/AJ/jJ/z5e/B5e → 企业目录/估算/折扣/订单判定
 *  §6 Stripe/验证码/PayPal/产品/订单（81732–84459）：
 *   $J…z7e → 卡品牌/资产图（含 AMEX/VISA 等）| B7e…U7e → ZAI_*_URL | W7e → STRIPE_LIVE_PUBLISHABLE_KEY
 *   G7e → CARD_BRAND_IMAGES | K7e → COUNTRY_OPTIONS | q7e → stripeElementAppearanceOf
 *   J7e → StripeCardDialogEntry 81798 | Y7e → StripeCardDialog 81807 | X7e → PaymentMethodOptionRow
 *   Z7e → CardBrandLabel | eY → CardBrandImage | Q7e → cardBrandImageOf | $7e → StripeCardManageDialog
 *   e9e → SavedCardRow | t9e → AddStripeCardForm | tY → FieldLabel | nY → BillingTextInput
 *   n9e → CountrySelect | r9e → CardBrandRow | rY → OverseasPolicyLink | i9e → rawPeriodOfProduct
 *   a9e → stripePublishableKeyOf | o9e → purchaseAttemptIdOf | iY/s9e/c9e/l9e/u9e/aY/oY → 漏斗快照/埋点
 *   sY/cY/lY/uY/dY/d9e/f9e/p9e/m9e/h9e/g9e/_9e/v9e/y9e/b9e/x9e/S9e/C9e/w9e/fY/T9e/pY/mY/E9e
 *   → 订单结果/漏斗明细/支付通道/状态归一
 *   D9e/O9e/k9e/A9e/j9e/M9e/N9e/gY/P9e → TCaptcha 验证码块（appId 196026326）
 *   F9e…V9e → 漏斗常量 | H9e → useCodingPlanPurchase 83232
 *   U9e/bY/W9e/G9e/K9e/q9e/J9e/xY/Y9e/X9e/SY/Z9e/CY/Q9e/$9e/eet → PayPal/回调/轮询
 *   wY/tet/TY 83745/EY 83815/DY/net/ret/iet/OY/kY/aet 83841/oet/set/cet/uet/det/fet/pet/met/het
 *   → 企业产品/面板购买 | get → START_PLAN_PREVIEW_TTL_MS | MY 84302 → useStartPlanPreview
 *   _et/vet/yet → 预览回退/登录竞态 | bet…jet → 结账/政策 URL 表
 *   Met → SEAT_COUNT_OPTIONS | Net → PERSONAL_PLAN_BUTTON_TESTID | Pet → DEFAULT_ZH_LOCALE
 *   NY → ZH_CHECKOUT_POLICY_COPY | Fet/PY/Let/Ret → 待支付恢复判定
 *  §7 zet 对话框族（84460–85995）：
 *   zet → CodingPlanPurchasePanel 84460 | Bet → PendingOrderDialog | Vet → PlanSelectSections
 *   Het → planSectionsClassName | Uet → planGridClassName | Wet → TeamPlanCard | Get → StartPlanCard
 *   Ket → PersonalPlanCard | qet → UnavailableProductButton | Jet → FromPriceLabel
 *   Yet → BillingCycleSelectPersonal | Xet → BillingCycleOptionRow
 *  §8 Zet 结账+政策（85996–88046）：
 *   Zet → EnterpriseCheckoutPanel 85996 | FY → CheckoutSection | Qet → scrollableAncestorOf
 *   $et → SeatsRow | ett → DurationSelect | ttt → SeatCountInput | ntt → PurchaseOptionCard
 *   IY → DurationDiscountBadge | rtt → BalanceSection | itt → BalanceCheckboxRow
 *   att → EstimateSummaryBar | ott → EstimatePriceLabel | LY → teamTierLabelOf | stt → seatMonthlyPriceOf
 *   ctt → yearlyDiscountBadgeOf | ltt → PriceWithUnit | utt → priceUnitPartsOf
 *   dtt → PersonalPaymentConfirm | ftt → EnterprisePaymentConfirm | ptt → EnterpriseEstimateSummary
 *   RY → SummaryRow | mtt → StrongAmount | htt → PersonalPolicyBlock | gtt → AccountPolicyCollapsible
 *   _tt → yenNormalizeOf | vtt → periodEveryLabelOf | ytt → periodSlashLabelOf | btt → OverseasPolicyBlock
 *   xtt → PolicyLayout | Stt → AccountPolicyNote | zY → TermsCheckbox | BY → PolicyInlineLink
 *   Ctt → rawPeriodUnitOf | wtt → personalServicePeriodOf | Ttt → enterpriseServicePeriodOf
 *   Ett → orderDurationOf | Dtt → periodMessageOf | Ott → PaymentStage | ktt → PurchaseSuccessView
 *   VY → SuccessSummaryRow | Att → enterpriseSummaryLineOf | jtt → zhPricePartsOf | Mtt → enterprisePayTextOf
 *   Ntt → discountSummaryOf | Ptt → roundEnterpriseAmount | Ftt → formatEnterpriseAmount
 *   HY → teamPlanGroupsOf | Itt → teamPlanGroupsOfDefaultLocale | Ltt → mergePublicAndAuthenticatedProducts
 *   Rtt → teamGroupActionStateOf | UY → purchaseOptionsOf | ztt → isOptionEligible | WY → isProductPurchasable
 *   Btt → isOneTimeMonthly | Vtt → isPromoDisabled | GY → isBalanceUsable | Htt → hasAnyBalance
 *   Utt → cheapestMonthlyProductOf | Wtt → resolveEnterpriseSelection | Gtt → teamProductOfId
 *   KY → purchaseOptionKeyOf | qY → purchaseOptionRankOf | Ktt → tierLabelOf | qtt → tierMessageKeyOf
 *   Jtt → normalizeTierFormatArg | JY → tierMessageFormatterOf | Ytt → teamGroupRankOf
 *   Xtt → durationUnitLabelOf | Ztt → normalizedDurationOf | Qtt → durationOptionsOf
 *   $tt → durationOptionLabelOf | ent → durationDiscountLabelOf | tnt → clampInt | nnt → parseIntOrNull
 *   rnt → commitSeatDraft | int → personalActionStateOf | ant → isActionSelectable
 *   ont → billingCycleActionLabelOf | snt → personalPlanActionStateOf | cnt → startPlanCurrentStateOf
 *   lnt → startPlanChoiceStateOf | YY → actionLabelOf | unt → subscriptionGateActionOf
 *   dnt → subscribeUrlOf | XY → groupAvailabilityOf | fnt → isMaxGroup | ZY → wordBoundaryTest
 *   pnt → isAnyPurchasable | mnt → strikethroughPriceOf | hnt → priceUnitLabelOf
 *   QY → currentPlanEntryOf | gnt → isAbovePlan | $Y → planEntryRankOf | _nt → tierRankOf
 *   vnt → periodRankOf | eX → EquityItemLabel | ynt → planCardCopyOf | bnt → startPlanCardCopyOf
 *  §9 权益/条目/工具条（88047–89988）：
 *   xnt → startPlanEntitlementRowsOf 88047 | Snt → startPlanSummaryOf | Cnt → modelUsageEntitlementsOf
 *   wnt → normalizeUnitName | Tnt → periodSuffixOf | Ent → personalPlanGroupsOf | tX → hasProductPreview
 *   Dnt → planGroupKeyOf | Ont → planGroupRankOf | knt → availablePeriodsOf | Ant → cheapestProductOf
 *   jnt → currentProductOfId | Mnt → funnelTierOf | Nnt → funnelTeamTierOf | Pnt → funnelPeriodOf
 *   Fnt → funnelSubscribePeriodOf | Int → funnelSubscribeModeOf | Lnt → funnelAmountOf | nX → funnelSlugOf
 *   Rnt → isGroupCurrentOf | znt → providerDisplayNameOf | Bnt → isBigmodelCodingPlanProvider
 *   Vnt → isPendingRequestCurrent | Hnt → panelTitleOf | Unt → buildEnvSnapshot | Wnt → envConfigOf
 *   Gnt → PLAN_DOMAINS | Knt → authSessionSnapshotOf | qnt → PURCHASE_TOKEN_TTL | Jnt → LOGIN_URL
 *   Ynt → CONSOLE_URL_FOR_PURCHASE | rX → SITE_URL_FOR_PURCHASE
 *   iX → API_KEY_PROVIDER_ENTRIES | aX → API_KEY_PROVIDER_ENTRY_MAP | oX → CODING_PLAN_PROVIDER_ENTRIES
 *   Xnt → KNOWN_PROVIDER_ENTRY_IDS | Znt → providerDisplayNameOfEntry | Qnt → isPresetEntryEnabled
 *   $nt → teamPlanSelectionOf | ert → autoRefreshDecisionOf | sX → useCodingPlanEntitlements
 *   trt → mergeRefreshResults | cX/nrt/rrt → preset/codingPlan/customSourceIdOf | lX → isCustomProviderReady
 *   irt → isKnownProviderEntryId | art → oauthProviderIdOfEntry | ort → apiKeyUrlOfEntry | srt → isEmptyText
 *   crt → providerEntryIconOf | lrt → codingPlanEntryStatusOf
 *   urt → injectTeamPlanMenuItems | drt → filterStartPlanMenuItems | frt → mergeTeamPlanMenuItems
 *   prt → teamPlanOrganizationOf | mrt → hasTeamScopedEntitlement | hrt → teamMenuItemsOfEntitlement
 *   grt → fallbackTeamMenuItemOf | uX → teamMenuItemKeyOf | _rt → isStatusVisible | vrt → hasApiKey
 *   yrt → CODING_PLAN_ENTRY_ID_SET | brt → isLoginStatePending | xrt → loadPurchaseAuthState
 *   Srt → codingPlanProviderIdOfTarget | Crt → isNonEmpty | wrt → oauthProviderIdOfCodingPlan
 *   Trt → beginUpgradeLoginAttempt | Ert → resolveLoginAttemptAction | Drt → refreshAfterPurchase
 *   Ort → CodingPlanUpgradeDialog | dX → CodingPlanUpgradeDialogContext | krt → CodingPlanUpgradeDialogProvider
 *   fX → useCodingPlanUpgradeDialog | Art → useCodingPlanUpgradeDialogOptional
 *   pX → planSourceOptionsOf | jrt → teamSourceOptionsOf | Mrt → resolvePurchaseAudience
 *   mX → teamSourceIdMatches | Nrt → teamSourceLabelOf
 *   Prt → SIDEBAR_CODING_PLAN_PROVIDER_PREFERENCE_KEY | Frt → SIDEBAR_CODING_PLAN_PROVIDER_IDS
 *   hX → eligibleSidebarCodingPlanProviders | Irt → sidebarPreferenceStorageOf
 *   Lrt → writeSidebarCodingPlanProviderPreference
 *   Rrt → modelEntryMatchesValue | zrt → thoughtOptionOfModel | Brt → currentOptionValueOf
 *   Vrt → projectionConfigOfOptions | Hrt → configMatchesModel | Urt → resolveEffectiveConfig
 *   Wrt → draftThoughtOptionOfModel | Grt → resolvedThoughtLevelOf | Krt → defaultModeOf
 *   qrt → ModePickerTrigger | Jrt → noopToolbarAction | Yrt → MODE_TRIGGER_SELECTOR
 *   Xrt → SessionModePicker 89343 | Zrt → SessionModePickerMemo | Qrt → MODEL_FOCUS_SELECTOR
 *   $rt → noopSessionModeCycle | eit → providerFamilyKindOf | tit → purchaseAudienceStateOf
 *   nit → teamSourceOfEntitlementSnapshot | rit → resolveTeamSourceSelection
 *   iit → SessionModelToolbar 89503 | ait → SessionModelToolbarMemo
 *   oit → diffValueOf | sit → accessibleLabelOf | cit → elementDescriptorOf
 *  §10 上下文芯片（89989–90179）：
 *   lit → WebElementsChip 89989 | uit → SelectionsChip 90097
 *  排除（只注记）：77062–77126 U3e/W3e/G3e（F08）| 78456–79690 qrcode vendored
 *   | 80955–81731 Stripe vendored | 90180–90227 dit/fit/pit/mit（Home.tsx）
 * ============================================================================
 */
