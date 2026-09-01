// A0-S4-4c: 自 modules/PaymentDeep.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/payments/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
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
 *  A. 上下文用量弹层（76612–76843 / jsx 67694 区）：〔A1-R23〕副本族删除 → 逐字 canonical
 *     Home §V.6/§V.7（y3e…A3e/j3e，见 §1 墓碑）
 *  B. 工具条配置选择（76844–77061 / jsx 67907 区）：
 *   M3e → isOptionValuePresent (76844) | N3e → FULL_ACCESS_MODES (76847)
 *   P3e → categoryTestidOf (76848) | F3e → optionTestidOf (76852)
 *   I3e → ApiRetryStatusChip (76856) | L3e → modeOptionLabelOf (76874)
 *   R3e → modeLabelKeyOf (76877) | z3e → modeDescriptionKeyOf (76880)
 *   jq  → optionLabelOf (76883) | B3e → optionDescriptionOf (76886)
 *   V3e → isFullAccessMode (76892) | H3e → modeIconOf (76895)
 *   Mq  → ConfigSelect                 工具条 select 触发器 (76912 / 67907)
 *  C. 思考级别机制（77127–77325；U3e/W3e/G3e 见排除注记）：〔A1-R23〕Pq/Fq/Z3e/Q3e/$3e 副本删除
 *     → 逐字 canonical Home §U.2 ComposerThoughtToolbar + §T 快捷键族（见 §3 墓碑）；
 *     Nq…X3e 前半 A0-S2d 已去重（canonical Composer.tsx）
 *  D. 供应商/模型菜单机制（77452–78455）：
 *   e6e → PROVIDER_FAMILY_ORDER (77452 区) | t6e → providerFamilyRankOf
 *   Iq  → sortProvidersByFamilyAndOrder | Lq → teamSourceOrganizationLabel（〔A1-R28〕收敛改指 Home §U.5 逐字 canonical）
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
 *  I. xnt 用量格式化+计划源选择（88047–89988 / jsx 76242/77471）：见 §9 头注；
 *     〔A1-R23〕pX…oit 工具条死簇 33 件删除 → 逐字 canonical Home §T/§U（见 §9 墓碑）
 *  J. lit/uit 上下文 chip（89989–90179 / jsx 78047/78080）：〔A1-R22〕副本删除 → 逐字 canonical
 *     modules/Composer.tsx [B17]（消费面在 Home/Conversation，非支付域；见 §10 墓碑）
 * ============================================================================
 */
import * as React from "react";
import { InfoTooltip as TooltipTriggerWrap, ShadcnTooltip as TooltipRoot, ShadcnTooltipContent as TooltipContent, ShadcnTooltipTrigger as TooltipTriggerAsChild } from '../../modules/UsageStatsUiParts'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
/* ── tombstone（A1-R23）：import Select as SelectRoot（modules/Settings）移出——唯一消费面 §3
 *    ThoughtLevelControl（757/797）同批删除。同批移出：HoverCardTooltip/HoverCardTooltipTrigger
 *    （PopoverRoot/PopoverTriggerAsChild，随 §1 删除后零消费）/SelectContent/SelectItem/SelectTrigger/
 *    SelectValue（modules/Settings，§3 消费面删除）/resolveModelTriggerLabelParts（modules/SettingsLeaves，
 *    §9 iit 死簇 11281 消费面删除；真身 = Home §U.10 逐字族内 nWe 消费面）。 ── */
import { Slot } from '@radix-ui/react-slot'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Dialog as DialogRoot, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { DropdownMenu as SelectShell, DropdownMenuContent as SelectPopup, DropdownMenuRadioGroup as SelectControl, DropdownMenuRadioItem as SelectOption, DropdownMenuTrigger as SelectTriggerAsChild } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { ChevronDownIcon, RefreshCw as RefreshIcon, X as CloseIcon, Trash2 as TrashIcon, CheckIcon, ArrowLeft as BackIcon, CircleCheck as SuccessIcon, MinusIcon, PlusIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）；〔A1-R22〕GlobeIcon 随 §10 chip 副本删除移出（唯一消费面已删）。〔A1-R23〕ThoughtLevelIcon（Lightbulb）随 §3 ThoughtLevelControl 删除移出（真身 = Home §U.2 ComposerThoughtToolbar 逐字消费面）
import * as qrcode from 'qrcode'; // A0-S3a：vendored qrcode（78456–79690，Qq）→ npm qrcode@1.5.4
// A0-S3a：vendored Stripe（80955–81731）→ npm @stripe/react-stripe-js@6.4.0 + @stripe/stripe-js@9.6.0（bundle 双版本锚定）
import { Elements as StripeElementsProvider, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import * as stripeLoader from '@stripe/stripe-js';
import { Button, ChevronRight as ChevronRightIcon } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk；A0-S3b 增补：ChevronRight as ChevronRightIcon（button chunk 图标，pass-1 同源）
/* ── A0-S2d 接线（§2 裁决去重 76848–77167 / 76034–76156）：原本地重复转录与
 *    declare 挂接删除，canonical 在 Composer.tsx，真实 import 消费；混淆名注释随迁。
 *    〔A1-R23〕ConfigSelect（Mq）/ContextUsageProvider（J4e）/ContextRingTrigger（X4e）/
 *    ContextRingTooltipContent（Z4e）/ContextRingTooltipBody（Q4e）/SegmentedProgress（yq）/
 *    isDisabledThoughtOption（K3e）/nextThoughtLevelValue（Y3e）/sortThoughtOptions（J3e）/
 *    thoughtOptionLabel（X3e）+ ConfigSelectOption/ConfigSelectSpec 型别 import 全数移出——
 *    唯一消费面 §1/§3/§9 副本族同批删除（见各墓碑）；Composer canonical 导出面不变。 ── */
// 〔A1-R26〕§U.8 漏斗遥测族收敛：trackFunnelStart（WUe）/trackPlanSelectEvent（RM/zM 合并面）declare 删除，
// 改接 Home §U.8 逐字真身（bundle WUe 53313/RM 53328/zM 53349 唯一真身；RM/zM 分流依据见原 declare 位墓碑）。
// 环安全：二环 Home→PaymentDeep shim→components/payments→modules/Home 既有判例（函数声明提升，渲染期调用）。
import { Spinner, trackCodingPlanFunnelStart, trackCodingPlanProductSelect, trackCodingPlanBillingCycleSelect, teamSourceOrganizationLabel } from '../../modules/Home'; // 〔A1-R28〕+teamSourceOrganizationLabel（Lq 77476 逐字 canonical；teamOrganizationLabelOf A0 副本删除改指，见下墓碑）。环安全：二环 Home→PaymentDeep shim→components/payments→modules/Home 既有判例（函数声明提升，渲染期调用），本行不新增环边
import { resolveProviderFamilyMode, getOAuthProviderFamilyByProviderId, isProviderAllowedForFamilyMode, activeOAuthProviderMatchesFamily, isObjectRecord, normalizeProviderId, listProviderModelIds, mapModelFormatToKind, resolveModelSupportedKinds, resolveProviderKindEndpointUrl, listEndpointKinds, isProviderEnabled, buildCodingPlanScope, parseCodingPlanScope, codingPlanScopesOverlap, buildStableModelId, nativeProviderRef, resolveProviderRefFromCustomModelRef, automationsWorkspaceKey, GHOST_PROVIDER_REF_PREFIX, CODING_PLAN_SECURITY_VERIFICATION_REQUIRED, CODING_PLAN_SYSTEM_BUSY, joinTestidParts } from '../../modules/SrcSharedB'; // 〔A1-R28〕zi 真身（styles 820 `z as zi` ← src 10062 `Gx as z` ≡ SrcSharedB@5555）：familyConnectionModeOf declare 收敛改指，见下墓碑。〔A1-R29〕+getOAuthProviderFamilyByProviderId（ot ≡ Yx 8933）/isProviderAllowedForFamilyMode（Mr ≡ Kx 8919）/activeOAuthProviderMatchesFamily（qt ≡ eS 8951）：三 declare 收敛改指，见各墓碑。〔A1-R31〕+base family 七件（nt/gt/an/Ai/Wr/Ir/Sr ≡ tu/eu/ou/ru/Tu/vu/yu ≡ SrcSharedB §1 逐字实体）：七 declare 收敛改指，见下墓碑。〔A1-R32〕+isProviderEnabled（gi ≡ ko ≡ 612）/buildCodingPlanScope（vi ≡ mt ≡ Wb）/parseCodingPlanScope（li ≡ gt ≡ Gb）/codingPlanScopesOverlap（fi ≡ ht ≡ Kb）：残件四 declare 收敛改指，见各墓碑。〔A1-R33〕+buildStableModelId（bne ≡ q ≡ Fx 8857 ≡ stableIds §28）/nativeProviderRef（On ≡ M ≡ cS 8981）/resolveProviderRefFromCustomModelRef（In ≡ N ≡ uS 8987）（§28/§31/§32 实体已迁 lib/，SrcSharedB@475 具名转导出）：三 declare 收敛改指，见各墓碑。〔A1-R35〕+automationsWorkspaceKey（Ti ≡ to ≡ SrcSharedB@3079，尾部 e8e 消费）/GHOST_PROVIDER_REF_PREFIX（Pte 真身：styles 705 `k as Pte` ← src `GHOST_PROVIDER_REF_PREFIX as k` ≡ lib/providerRefs@49，SrcSharedB@471 转导出）/CODING_PLAN_SECURITY_VERIFICATION_REQUIRED（one 真身：styles 736 `o as one` ≡ SrcSharedB@6252）：尾部 hook 族转录 + 双死链 declare 收敛改指，见各墓碑。〔A1-R36〕+CODING_PLAN_SYSTEM_BUSY（Pne 真身：styles 767 `s as Pne` ← src 10006 `EC as s` ≡ EC 9547 ≡ SrcSharedB@6255）/joinTestidParts（qr 真身：styles 601 `Xa as qr` ← src 9836 `Nb as Xa` ≡ Nb 8464 ≡ SrcSharedB@5015）：双 declare 收敛改指，见各墓碑。环安全：SrcSharedB 值闭包不达 components/payments
import { isStartPlanProviderId, isZaiPlanProviderId, GLM_MODEL_IDS, providerIds, isBuiltinProviderId, isGlmAgentCliProvider, RESOLVED_BUILD_ENV, codingPlanPersonalOverviewUrl, codingPlanTeamPlansUrl, buildBigmodelApiUrl } from '../../modules/SrcSharedA'; // 〔A1-R28〕Bn 真身（styles 533 `No as Bn` ← src 9764 `yl as No` ≡ yl ≡ SrcSharedA@2026）：isProviderSystemEnabled declare 收敛改指，见下墓碑。〔A1-R30〕+isZaiPlanProviderId（tr ≡ vl 4753 ≡ SrcSharedA@2022）：isOAuthFamilyProvider/isZaiCodingPlanProvider 双 tr 脸收敛改指，见各墓碑。〔A1-R32〕+providerIds（q ≡ mo ≡ W 4733，builtin: 前缀 7 键实体）/isBuiltinProviderId（jt ≡ Eo ≡ _l 4833）/isGlmAgentCliProvider（Ei ≡ us ≡ Ds 3844）：q 实体化 + 残件双 declare 收敛改指，见各墓碑。〔A1-R36〕+env 族四件（hi≡RESOLVED_BUILD_ENV（lib/buildEnv@9，SrcSharedA@310 转导出）/Si≡codingPlanPersonalOverviewUrl（SrcSharedA@1618）/fn≡codingPlanTeamPlansUrl（SrcSharedA@1622）/vn≡buildBigmodelApiUrl（SrcSharedA@1613）；★js/★qo/★Jo/★Ko A0 期既判）：四 declare 收敛改指，见各墓碑。环安全：SrcSharedA 值闭包不达 components/payments
import { reportTelemetry, type TelemetryPlatform } from '../../modules/StoresDeep'; // 〔A1-R26〕usePlatformService 型缝所依（xw≡reportTelemetry 消费面）。〔A1-R35〕type-only → 值导入 + reportTelemetry：xw declare 收敛改指（xw 真身：styles 40457-40466 ≡ StoresDeep@323 reportTelemetry，StoresDeep@321 行注「原 xw（40409）」为漂移实测 40457；消费 @3651/@3655 改名改指）
import type { EntitlementSnapshot } from '../../modules/UsageDeep'; // 〔A1-R27〕iM 52651 收敛型缝所依（A6e/j6e/M6e/N6e 快照流由 unknown 精化，行依据见各函数注）
import { Input, PopoverContent, toast } from '../../modules/ImeComposition';
import { logger, formatCustomModelId, parseCustomModelId, getCurrentModelValue, useTaskStore } from '../../modules/SkillStore'; // 〔A1-R28〕+formatCustomModelId（we 真身：styles 404 `k as we` ← skillStore-BmeKHDBI.js 导出 k ≡ taskStore@1412，SkillStore@169 转导出；StoresDeep@147 joinModelName 别名先例）：composeModelValue declare 收敛改指，见下墓碑。〔A1-R32〕+parseCustomModelId（se 真身：styles 386 `O as se` ← skillStore-BmeKHDBI.js 导出 2497 `D as O` ≡ D 903 ≡ taskStore@1418，SkillStore 转导出）：modelEntryOf declare 收敛改指，见下墓碑。〔A1-R33〕+getCurrentModelValue（Ie 真身：styles 416 `w as Ie` ← skillStore-BmeKHDBI 导出 2527 `I as w` ≡ I 982 ≡ taskStore@1543，SkillStore@262 转导出）：resolveModelCatalogEntry declare 收敛改指，见下墓碑。〔A1-R35〕+useTaskStore（xe 真身：styles 侧 xe ≡ taskStore@2950 useTaskStore，SkillStore@247 转导出）：尾部 qq 转录面 `xe.getState()` 消费接引
import { useSettingsStore as useAppStore, useSessionRegistryStore } from '../../modules/stores-core'; // A1-R10 项 2a：原 ko（1296）declare 改指 canonical——普查 useAppStore=useSettingsStore（symbol-index x6）；调用点 3680/10307–10311 逐字不变（(state: any) 选择器对 (state: SettingsState) 双变可赋）。〔A1-R35〕+useSessionRegistryStore（Zs 真身：styles-local 4357 `var Zs = Ae()(...)` 会话注册表 store ≡ stores/sessionRegistryStore@175 useSessionRegistryStore，stores-core@90 转导出）：尾部 qq 转录面消费接引。环安全：stores-core 值闭包（stores/* + zustand）不达 components/payments
import { formatGrantUnits, useBillingDiscount, BillingDiscountCard, RegionLogo, nullSafe as providerEntryOrNull, providerApiKeyFingerprint as providerFingerprintKeyOf, shouldProbeStartPlanEntitlement, hasActiveEntitlement, listCodingPlanSources, hasLoadedCodingPlanSources, setCodingPlanSources, subscribeCodingPlanSources, refreshCodingPlanSourcesForced, ensureCodingPlanSources } from '../../modules/UsageDeep'; // A1-R11：tM（52642）/nM（52645）/aM（52661）/IM（53277）改指 canonical（components/usage/UsageDeep.tsx；tM/nM 双归属收敛，bundle 唯一真身）。〔A1-R27〕+hasActiveEntitlement（iM 52651 canonical，declare hasActiveEntitlementCore 收敛改指，见下墓碑）。A1-R20：+BillingDiscountCard（原 HHe 51994–52033 收敛，见下墓碑）。A1-R21：+RegionLogo（原 Tq 76183 收敛，见下墓碑）。〔A1-R23〕SidebarCodingPlanWidget/SidebarStartPlanWidget（s3e/v3e）/hasPlanWidgetModel（i3e）/hasStartPlanBalance（g3e）/entryPlanStateOf（IM）移出——消费面 §1/§9 死簇同批删除；Oq/i3e/g3e 真身裁定见 components/usage/UsageDeep.tsx 墓碑（Home §U.3/§V 逐字 canonical）。〔A1-R35〕+注册表六件（fM/pM/mM/hM/gM/_M ≡ listCodingPlanSources/hasLoadedCodingPlanSources/setCodingPlanSources/subscribeCodingPlanSources/refreshCodingPlanSourcesForced/ensureCodingPlanSources，UsageDeep@1404-1476；R34 墓碑改指面，本批尾部 qq 族转录首次实消费；后三件同批补 export）
import { useServices, useBaseServices, syncProviderRegistryAndReturn } from '../../modules/services'; // 〔A1-R35〕+useBaseServices（Ec 真身：styles-local 4945 ≡ services/remoteServices@177，services@109 转导出）/syncProviderRegistryAndReturn（Ks 真身：styles 4164 ≡ services/providerRegistrySync@132，services@105 转导出；R33 墓碑改指面，本批尾部 qq 族转录首次实消费）

/* ----------------------------------------------------------------------------
 * §0 外部依赖声明（跨 chunk / 横切 / 他族已抽取件，接口级）
 * -------------------------------------------------------------------------- */
declare function cn(...inputs: Array<string | false | null | undefined>): string; // Z
/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */
interface IntlShape {
  formatMessage(desc: { id: string }, values?: Record<string, string | number>): string;
}
declare function useZCodeIntl(): { intl: IntlShape; locale: string }; // G
// 〔A1-R26〕型缝：漏斗遥测族消费面 5504/5676/5713/5976/6009 将 platform 直通 reportTelemetry（xw≡StoresDeep@323），
// 消费 reportTelemetryEvent——bundle l 返回完整 platform 服务（xw 40457 `e.reportTelemetryEvent(r)` 实测），旧注仅 A0 部分面（openExternal）
declare const usePlatformService: () => TelemetryPlatform & { openExternal(url: string): void }; // l
/* ── tombstone（A1-R23）：declare formatCompactNumber（usageStatsUiParts ja 紧凑数字）删除——唯一消费面
 *    §1 formatCompactNumberLocale（S3e 76623 A0 副本）同批删除；真身 = Home §V.6 formatUsageTokenCountCompact 逐字。 ── */
/** 本 chunk 原语：Tooltip 触发包装（Ia）/Select 五件（iO/oO/aO/sO/cO）/chevron（N_）/弹层关闭守卫（ZH/XH） */
/* ── tombstone（A0-S3c）：DialogClose、DialogContent、DialogDescription、DialogFooter、DialogHeader、DialogRoot、DialogTitle、PopoverRoot、PopoverTriggerAsChild、SelectControl、SelectOption、SelectPopup、SelectRoot、SelectShell、SelectTriggerAsChild、Slot、TooltipContent、TooltipRoot、TooltipTriggerAsChild、TooltipTriggerWrap declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */

/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：ChevronDownIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone（A1-R23）：declare isCoarseTouchDeviceGuard（ZH）/detectCoarseTouchDevice（XH）删除——
 *    唯一消费面 §3 ThoughtLevelControl（Pq 77166 A0 副本）同批删除；真身 = Home §U.2 ComposerThoughtToolbar
 *    逐字（其 isCoarseTouchDevice/shouldRestoreFocus 消费面经 modules/Composer 真实 import，XH 69346/ZH 69351 属主）。 ── */
/** src-HCld2afU / skillStore / stores 横切助手（按调用面接口级） */
/* ── tombstone〔A1-R32〕：declare PROVIDER_IDS（原 q）删除 → 改指 SrcSharedA@2008 providerIds（q 真身：styles 725 `mo as q` ← src 9963 `W as mo` ≡ W 4733，体逐字同构：builtin: 前缀 7 键；链闭合；本文件 98 消费点改名改指。负证据：styles 213969 `po as q` 为遮蔽，po=McpServerConfigSchema 别 import 块）。 ── */
/* ── tombstone〔A1-R29〕：declare familySpecOfProviderId（原 ot）删除 → 改指 getOAuthProviderFamilyByProviderId
 *    （ot 真身：styles 445 `B as ot` ← src 9672 `Yx as B` ≡ Yx 8933 ≡ SrcSharedB@5576，链闭合）。
 *    消费面实测（本文件 5 处改名改指）：@815（v6e familyGroupOf@805）≡ bundle 77716、@943/@952/@959（S6e
 *    modelMenuGroupsForAgent@929 体内）≡ bundle 77813/77822/77829、@9631（drt filterStartPlanMenuItems@9627）≡ bundle 88674。
 *    其余 bundle ot 消费：MPSS familyDescriptorOf 面 8 处既接 canonical（190758/191803/191831/191841/191861/
 *    191864/192072/192470，SrcSharedB 真实 import）；CYt 簇 5 消费（187624/190496/190538/190614/191342 ≡ UsageDeep familyOfPresetId 面）R30 已收敛；128519 `await ot()` 遮蔽局部符（无参异步，非本 ot）。
 *    FamilySpec 型别保留（familyOptionBadgeOf@878 仍消费）。型缝：canonical 返回 any，五消费点各依原 declare
 *    契据（FamilySpec | null）窄化（行依据见各点注；@959 点随 flatMap@958 由 AgentModelMenuGroup@920 定锚，见该型缝注）。
 *    负证据：bundle 内 ot 无第二真身。 ── */
/* ── tombstone〔A1-R30〕：declare isOAuthFamilyProvider（原 tr 脸 A）删除 → 改指 isZaiPlanProviderId
 *    （tr 真身：styles 548 `Po as tr` ← src 9780 `vl as Po` ≡ vl 4753 ≡ SrcSharedA@2022 isZaiPlanProviderId，
 *    体逐字同形（`e === zaiCodingPlan || e === zaiStartPlan`），链闭合）。
 *    取证（R28 §6.3 疑 bl 形误标，本批逐点 bundle 取证全 = tr，零 bl 形，疑销）：
 *    消费面实测（本文件 10 处改名改指）：@522（n6e providerDisplayLabelsOf）≡ 77483、@581（o6e hasProviderCredentials）≡ 77532、
 *    @1080（j6e isProviderEntitlementVisible）≡ 77900、@1941（s5e useCodingPlanProducts，`=== bigmodelCodingPlan || tr` 内联析取形）≡ 80371、
 *    @3751（h9e providerFamilyOf）≡ 83001、@3947（M9e captchaAppIdOf）≡ 83178、@4087（H9e useCodingPlanPurchase）≡ 83303、
 *    @4515（Z9e needsStatusPollAfterStripe）≡ 83708、@5483/@5919（zet CodingPlanPurchasePanel）≡ 84552/84979。
 *    负证据：styles tr 消费全集 17 处全分流（本文件 B 脸 5 处 + GUe 53393 R11 既收敛 + bw 40446 留批归属）。 ── */
/* ── tombstone〔A1-R29〕：declare isProviderFamilyModeAllowed（原 Mr）删除 → 改指 isProviderAllowedForFamilyMode
 *    （Mr 真身：styles 579 `U as Mr` ← src 9814 `Kx as U` ≡ Kx 8919 ≡ SrcSharedB@5560，链闭合；体逐字同形）。
 *    消费面实测：@947（S6e 体内）≡ bundle 77817，改名改指；另一消费 133906（hjt 体内）≡ ExtendedViews@1372
 *    isProviderVisible declare 面，同批收敛（见该处墓碑）。负证据：bundle 内 Mr 无第二真身。 ── */
/* ── tombstone〔A1-R29〕：declare isProviderOAuthGateActive（原 qt）删除 → 改指 activeOAuthProviderMatchesFamily
 *    （qt 真身：styles 487 `H as qt` ← src 9717 `eS as H` ≡ eS 8951 ≡ SrcSharedB@5607，链闭合；体逐字同形）。
 *    消费面实测：@946（S6e 体内）≡ bundle 77816（唯一消费），改名改指。负证据：bundle 内 qt 无第二真身。 ── */
/* ── tombstone〔A1-R32〕：declare isExternalAgentName（原 Ei）删除 → 改指 SrcSharedA@994 isGlmAgentCliProvider（Ei 真身：styles 788 `us as Ei` ← src 10028 `Ds as us` ≡ Ds 3844，体逐字同构 `e === \`glm\``；链闭合；消费 @1006 改名改指。负证据：bundle 余 Ei 消费 54156/120735/185925 属外部域留批）。 ── */
/* ── tombstone〔A1-R32〕：declare modelEntryOf（原 se）删除 → 改指 taskStore@1418 parseCustomModelId（modules/SkillStore 转导出；se 真身：styles 386 `O as se` ← skillStore-BmeKHDBI.js 导出 2497 `D as O` ≡ D 903 `return i(e)`，与 taskStore 实体同形（同委 parseCustomQualifiedModelId）；链闭合；消费 @1017/1033/1059/1280/1315/1323/1345/1346/1350 共 9 处改名改指。型缝：canonical 返 {providerId: string; modelName?: string} | null，较原 declare 双可选契据窄化，消费面仅 ?. 访问，安全。 ── */
/* ── tombstone〔A1-R28〕：declare composeModelValue（原 we）删除 → 改指 formatCustomModelId（we 真身：styles 404
 *    `k as we` ← skillStore-BmeKHDBI.js 导出 k ≡ taskStore@1412 formatCustomModelId，modules/SkillStore@169 转导出）。
 *    消费面实测：@619（l6e modelItemsOfProvider）/ @1316（Z6e retargetModelValue）/ @1353（$6e
 *    reconcileConfigOptionsModel）改名改指。负证据：bundle 内 we 无第二真身。 ── */
/* ── tombstone〔A1-R31〕：base family 七 declare 删除 → 改指 SrcSharedB §1 canonical（链：styles 441/455/498/802/597/583/569 ← src 9668/9683/9728/10042/9832/9818/9802 ≡ tu/eu/ou/ru/Tu/vu/yu，链闭合；体逐字同形，校验器新段取证）。
 *    nt isModelEntry→isObjectRecord（SrcSharedB@659；消费 @553/@561/@563）｜gt modelIdOfEntry→normalizeProviderId（@654；消费 @1142）｜an normalizeFormat→mapModelFormatToKind（@685；消费 @566/@586/@9435；@566 型缝 !== null→!= null：canonical 返回含 undefined 面，真值表逐字等价）
 *    Ai modelKindsOfProvider→listProviderModelIds（@669；消费 @569/@571/@9432）｜Wr formatsOfModelName→resolveModelSupportedKinds（@915；消费 @565/@573/@9434，对象参 {provider, modelName} 与 Tu 同形）
 *    Ir formatsOfEndpoints→resolveProviderKindEndpointUrl（@862；消费 @587/@9436；canonical 返回 string（种类端点 URL），消费面 .length>0 与 bundle Ir 面逐字同效）
 *    Sr endpointsOfProvider→listEndpointKinds（@869；消费 @581/@9478 改传 provider.endpoints）
 *    Sr 签名分歧定形：yu 真身参为端点对象 {baseURL?, paths?}（src 5083 体取证），bundle 消费形 Sr(e.endpoints) 实证 o6e 77532/lrt 88525/HYt 188211；树 declare 单 provider 参形为 A0 误读面，同批收敛对齐，分歧一次闭合
 *    负证据：bundle 内 tu/eu/ou/ru/Tu/vu/yu 各唯一真身；外部消费 118305（Ir）/120695（Ai）/188211（Sr+nt）/188652（nt）域留批。 ── */
/* ── tombstone〔A1-R32〕：PD declare 块残件五件删除 → 改指（逐件链闭合，消费面改名改指）：
 *    gi isProviderConfigurable→isProviderEnabled（SrcSharedB@612；gi 真身：styles 709 `ko as gi` ← src `isProviderEnabled as ko` ≡ 612，体逐字同构 `e?.enabled !== !1`；消费 @597）
 *    jt isPresetProviderId→isBuiltinProviderId（SrcSharedA@2018；jt 真身：styles 470 `Eo as jt` ≡ _l 4833 七键析取；消费 @612）
 *    vi teamPlanKeyOf→buildCodingPlanScope（SrcSharedB@5097；vi 真身：styles 728 `mt as vi` ≡ Wb jsx 8631/js 8526；消费 @649/9692/9754/9778）｜li parseTeamPlanKey→parseCodingPlanScope（SrcSharedB@5106；li 真身：styles 680 `gt as li` ≡ Gb js 8533；消费 @731/895/896/9213/9772/9795）
 *    fi teamPlanKeysPrefixEqual→codingPlanScopesOverlap（SrcSharedB@5128；fi 真身：styles 688 `ht as fi` ≡ Kb js 8545；消费 @894；语义证：CODING_PLAN_SCOPE_PREFIX@5094 = `team-plan:${W.bigmodelCodingPlan}:` 与 teamPlanKey 契据前缀形吻合）。 ── */
/* ── tombstone〔A1-R28〕：declare familyConnectionModeOf（原 zi）删除 → 改指 resolveProviderFamilyMode（zi 真身：
 *    styles 820 `z as zi` ← src 10062 `Gx as z` ≡ SrcSharedB@5555 `return t?.[e] ?? \`oauth\``，链闭合）。
 *    消费面实测：@787（_6e resolveFamilyDefaultOption 内）≡ bundle 77699，改名改指。
 *    负证据：bundle 内 zi 无第二真身（其余消费面分流见 Home 侧 zi 墓碑）。 ── */
/* ── tombstone〔A1-R33〕：declare resolveModelCatalogEntry（原 Ie）删除 → 改指 taskStore@1543 getCurrentModelValue（SkillStore 转导出；Ie 真身：styles 416 `w as Ie` ← skillStore-BmeKHDBI 导出 2527 `I as w` ≡ I 982，与 taskStore 实体逐字同形；链闭合；SkillStore@143 `w=I getCurrentModelValue(Ie)` 登记在案。消费 @1334 改名改指 + `as unknown as string` 误铸剥离（canonical 参为选项数组，bundle $6e 78091 `Ie(e)` e=configOptions 实证）。 ── */
/* ── tombstone〔A1-R34〕：declare settingsConfigOptionsOf（原 Ng）删除 → 实体化新叶 modules/SettingsConfigOptions.ts（styles 24440-24494 逐字转录 + Nge 24495-24500 resolveThoughtLevelCurrentValue，checker 新段在案）。裁决异构（R33 留批闭合）：thoughtLevel 现值经 Set 成员裁决（Nge：current∈available → defaultLevel∈available → 首项），jx≡SrcSharedB@5425 buildSessionSettingsViewModel 取原值不校验，政策实异，见报告 §二；助手族值同构（Tge/Dge/Ege≡MODEL/MODE/THOUGHT_LEVEL_SETTING_ID、jg≡buildModelSettingOptionValue、Lge≡normalizeSessionModeId、Rge≡listSessionModeOptions）。bundle 消费 53106/53145/53204/53221（HUe 52984）/53438（qUe 53409）/78157（e8e 78119）属他域/未转录。 ── */
/* ── tombstone〔A1-R33〕：declare workspaceTargetKeyOf（原 Ti）删除（本树零消费死 declare；Ti 真身：styles 778 `to as Ti` ← src 10018 `ip as to` ≡ ip 6913 ≡ SrcSharedB@3079 automationsWorkspaceKey「原 ip（jsx 7034 / js 6913）」，体逐字同形，链闭合；bundle 消费 4174/4230/4238/78124/128564/136105/137110/137242/138988/139095 属他域）。 ── */
/* ── tombstone〔A1-R33〕：declare syncProviderRegistryToWorkspace（原 Ks）删除（本树零消费死 declare；Ks 真身：styles 4164 `async (e) => await vse(e)` ≡ services/providerRegistrySync syncProviderRegistryAndReturn，OLL@255 A1-R8 改指先例 + ConversationPaneCore@22 登记在案，链闭合；bundle 消费 78137/78327/120417 属他域）。 ── */
/* ── tombstone〔A1-R33〕：declare proxyModelValueOf（原 bne）删除 → 改指 lib/stableIds@23 buildStableModelId（bne 真身：styles 752 `q as bne` ← src 9991 `Fx as q` ≡ Fx 8857 ≡ stableIds「原 Fx（jsx 8967 / js 8857）」逐字同形，链闭合；消费 @1326 改名改指（try/catch 守卫面与 bundle Q6e 78085 同形）。负证据：styles q 符三用——725 mo（providerIds）/752 Fx（本件）/213969 po 遮蔽，各属别 import 块。 ── */
/* ── tombstone〔A1-R33〕：declare defaultSupplierKeyOf（原 On）删除 → 改指 lib/providerRefs@52 nativeProviderRef（On 真身：styles 521 `M as On` ← src 9752 `cS as M` ≡ cS 8981 ≡ providerRefs「原 cS（jsx 9100 / js 8981）」逐字同形 `native:${e}`，链闭合；taskStore@6 `nativeProviderRef as formatNativeSupplierKey` 别名先例在案。消费 @1251 改名改指；型缝：canonical 返 string，原契据 string | null，消费面 supplierKey 联合字段宽化兼容。 ── */
/* ── tombstone〔A1-R33〕：declare supplierKeyOfModel（原 In）删除 → 改指 lib/providerRefs@62 resolveProviderRefFromCustomModelRef（In 真身：styles 529 `N as In` ← src 9760 `uS as N` ≡ uS 8987 ≡ providerRefs「原 uS（jsx 9106 / js 8987）」逐字同形，链闭合。消费 @1218 改名改指 + 参形定形：bundle H6e 78003 `In(t, n)` t=provider/n=currentModelValue，A0 误录首参 configOptions，见 supplierKeyOfConfigOptions 行注。 ── */
/* ── tombstone（A1-R23）：declare shortcutOf（ea）/ctrlShiftShortcutOf（zre）删除——唯一消费面 §3
 *    resolveToolbarShortcut/useToolbarShortcuts（Q3e/$3e A0 副本）同批删除；真身 = Home §T
 *    resolveComposerToolbarShortcutAction/useComposerToolbarShortcuts 逐字（快捷键判定内联同构）。 ── */
/* ── tombstone〔A1-R35〕：declare GHOST_MODEL_PREFIX（原 Pte）删除 → 改指 lib/providerRefs@49 GHOST_PROVIDER_REF_PREFIX（Pte 真身：styles 705 `k as Pte` ← src 9943 `sS as k` ≡ sS 8980 `ghost:` ≡ providerRefs@49 GHOST_PROVIDER_REF_PREFIX 逐字同值，SrcSharedB@471 具名转导出，链闭合）。消费面实测：@1190（ghostModelProviderIdOf 体内）≡ bundle 77979，改名改指。负证据：styles Pte 消费全集 1 处（77979）。 ── */
/* ── tombstone〔A1-R36〕：declare testidOf（原 qr）删除 → 改指 modules/SrcSharedB@5015 joinTestidParts（qr 真身：styles 601 `Xa as qr` ← src 9836 `Nb as Xa` ≡ Nb 8464 `return \`${e}-${t}\`` ≡ joinTestidParts 逐字同形，链闭合；Home@509/Composer@781 局部同形面双归属在案）。消费面实测：@6568/@6572（PersonalPlanCard 体内）≡ bundle 85736/85739（qr(Net, e.key)），改名改指。负证据：本文件 qr 消费仅 2 处；余 bundle 消费 92 处属他域（settings nav/locale/oauth 等）。 ── */
/* ── tombstone（A1-R23）：declare MODEL_OPTION_TESTID_PREFIX（Xt）/MODE_OPTION_TESTID_PREFIX（rn）/
 *    MODEL_MENU_TESTID（Fr）删除——消费面 §3 ThoughtLevelControl（751/774/792/806）同批删除（rn 自 A0-S2d
 *    §2 删除后已零消费）；testid 拼装真身 = Home §U.2/§T 逐字族内联（configOptionTestId/configSelectTestId，
 *    Composer [D] 段 Mq 76911 canonical）。 ── */
/* ── tombstone（A0-S2d）：wn THOUGHT_TRIGGER_TESTID / av ModeIconDefault /
 *    Sv ModeIconPlan / Bv ModeIconAgent declare 删除——唯一消费面在 §2 重复转录段
 *    （canonical 在 Composer.tsx），随段删除后无引用。zv ModeIconFullAccess 保留
 *    （§5/§7 等正文章节仍有消费）。 ── */
declare const ModeIconFullAccess: React.FC<React.SVGProps<SVGSVGElement>>; // zv
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：ThoughtLevelIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const TruncateLabel: React.FC<{ label: string }>; // _q〔A1-R35〕留批：bundle 75520 JSX 组件面（真身未转录），树内零消费负证据在案，待真身批收敛
/* ── tombstone〔A1-R30〕：declare const KNOWN_MODEL_FORMATS（原 Di）删除 → 改指 GLM_MODEL_IDS
 *    （Di 真身：styles 794 `vo as Di` ← src 10034 `xl as vo` ≡ xl 4762 [`GLM-5.2`, `GLM-5-Turbo`] ≡
 *    SrcSharedA@2034 GLM_MODEL_IDS（A0 既实化，jsx 4854 vo 同表），链闭合）。
 *    消费面实测（本文件 2 处改名改指）：@559（Rq 体内 `new Set(Di)` 面）≡ bundle 77512、
 *    @9186（Knt 体内 `[...Di]` 面）≡ 88268。负证据：styles Di 消费全集 2 处（460 `Di as xt` 为转出面，非消费）。 ── */
/* ── tombstone〔A1-R28〕：declare isProviderSystemEnabled（原 Bn）删除 → 改指 isStartPlanProviderId（Bn 真身：
 *    styles 533 `No as Bn` ← src 9764 `yl as No` ≡ yl ≡ SrcSharedA@2026；与 HM 53403 面 body-identical）。
 *    消费面实测：@561（Rq modelsForAgent isAllowed）≡ bundle 77514、@9630（drt filterStartPlanMenuItems）
 *    ≡ bundle 88673，经文件头 SrcSharedA import 改名消费。负证据：bundle 内 Bn 无第二真身。 ── */
/* ── tombstone（A1-R27）：declare hasActiveEntitlementCore（原 iM，52651–52655）删除，改经文件头 modules/UsageDeep
 *    import hasActiveEntitlement 消费（canonical = components/usage/UsageDeep.tsx hasActiveEntitlement，A1-R11 转录）。
 *    双实例收敛证据：bundle iM 唯一真身 52651（定义 1 处）；消费 4 处全实测——52663 aM 内（≡ UsageDeep
 *    shouldProbeStartPlanEntitlement，R11 已收敛）、77897 A6e `return iM(e)`（≡ 本文件 hasActiveEntitlementAlias@1072，
 *    单参形）、210023/210032 i6t 内（≡ OnboardingLoginLeaves resolveOAuthFamilySelection@3448，本批同收敛其
 *    hasPlanEntitlement declare）。负证据：bundle 内 iM 无第二定义；全树无其他 iM 面。 ── */
declare const BIGMODEL_REGION_ID: string; // Ri
/* ── tombstone（A1-R23）：declare workspaceStore（xe）/selectWorkspaceSlice（co）/useWorkspaceStore（Zs）/
 *    useTabsStore（pc）/useBaseServicesAny（Ec）/workspaceStateOf（fe）/taskMetaOf（ce）/
 *    buildConfigOptionsFromTaskMeta（be）/isWorkspaceTab（oc）/remoteSessionIdOfTab（gc）删除——
 *    iit 工具条域 store 选择器族，消费面 §9 iit/Xrt 死簇同批删除（此前已零消费，负证据在案）；
 *    真身 = Home §U.10 ComposerConfigToolbarBody 逐字（其 useTabStoreSelector/useCatalogConfigOptions 等
 *    消费面经 Home §0 declare 分层）。 ── */
/* ── tombstone〔A1-R34〕：provider 注册表簇六 declare（fM/mM/gM/pM/hM/_M）删除——真身 = UsageDeep@1392-1476 供应商源注册表（A1-R11 转录；oM/sM/cM/lM/uM/dM 模块态 + MUe/NUe 内部件），bundle styles 52675-52742 自包含块（MUe 52703/NUe 52706 仅块内消费，负证据在案）。R11 注引行漂登记：注释层 52626-52660/52641 等 → 实际 52675-52742/52681 等（UsageDeep@320 头注 52681 为正）。本树零消费（六 declare 全量 grep 负证据在案）；bundle 消费属主：a8e 78189/qq 78243（PD-local 未转录面）、hit 90228/R0 119236/AJt 185910/b4t 206116/s3t 207309/Q3t 209916/t8t 211481/_8t 212905（他域）。逐字子证：fM/pM 二件 checker 新段 PASS；余四件 R11 语义归一（逗号表达式→语句形），见报告 §一。 ── */
/* ── tombstone〔A1-R34〕：declare listCachedProviders（原 fM）删除 → 改指 UsageDeep@1404 listCodingPlanSources（bundle 52681-52683 逐字同形，checker 新段在案）。 ── */
/* ── tombstone〔A1-R34〕：declare publishProviders（原 mM）删除 → 改指 UsageDeep@1412 setCodingPlanSources（bundle 52687-52694；R11 语义归一：逗号表达式→语句形，见簇头注）。 ── */
/* ── tombstone〔A1-R34〕：declare refreshProviders（原 gM）删除 → 改指 UsageDeep@1442 refreshCodingPlanSourcesForced（bundle 52709-52725 单飞去重同形；R11 语义归一，见簇头注）。 ── */
/* ── tombstone〔A1-R34〕：declare isProvidersSnapshotHydrated（原 pM）删除 → 改指 UsageDeep@1408 hasLoadedCodingPlanSources（bundle 52684-52686 逐字同形，checker 新段在案）。 ── */
/* ── tombstone〔A1-R34〕：declare subscribeProviders（原 hM）删除 → 改指 UsageDeep@1421 subscribeCodingPlanSources（bundle 52695-52702；R11 语义归一，见簇头注）。 ── */
/* ── tombstone〔A1-R34〕：declare withProvidersHydration（原 _M）删除 → 改指 UsageDeep@1460 ensureCodingPlanSources（bundle 52726-52742 单飞水合同形；R11 语义归一，见簇头注）。 ── */
/* ── tombstone（A0-S2d · 去重 c）：U3e THOUGHT_OFF_VALUES / G3e THOUGHT_LEVEL_LABEL_KEYS
 *    declare 删除（唯一消费面 Nq…X3e 重复转录段已删，接线空转）；
 *    yq/J4e/X4e/Z4e/Q4e 用量弹层原语（76034–76156）declare 删除，
 *    canonical 在 Composer.tsx（SegmentedProgress / ContextUsageProvider /
 *    ContextRingTrigger / ContextRingTooltipContent / ContextRingTooltipBody），
 *    经文件头真实 import 消费。 ── */
/* ── tombstone（A1-R21）：declare hasPlanWidgetModel/hasStartPlanBalance（原 i3e/g3e，76249/76502；
 *    旧注 76230 区/76455 区为漂移行）删除——canonical 属主 components/usage/UsageDeep.tsx
 *    （A0 已重建，本批补 export），改指文件头 import（modules/UsageDeep）；
 *    消费面 485/486/11094/11184 逐字不变。
 *    〔A1-R23〕叠层再裁定：UsageDeep hasPlanWidgetModel/hasStartPlanBalance 亦为 A0 副本，
 *    真身逐字 canonical = Home §U.3 hasCodingPlanUsageRemaining（i3e 76249）/§V.5
 *    hasStartPlanBalanceDisplay（g3e 76502）；UsageDeep 副本删除（见其墓碑），本文件
 *    485/486 消费面随 §1 删除、11094/11184 随 §9 死簇删除，import 面同步移出。 ── */
/* ── tombstone（A1-R23）：declare CONTEXT_USAGE_TRIGGER_TESTID（原 Lte，src-HCld2afU testid 常量）删除——
 *    唯一消费面 §1 ContextUsagePopover（j3e 76678 A0 副本）同批删除；真身 = Home §V.7 CodingPlanUsageToolbar
 *    逐字（Lte 消费面 76706 区在证）。 ── */
/* ── tombstone（A0-S3a）：vendored qrcode（78456–79690，Qq）declare 删除，
 *    改 npm qrcode@1.5.4 真实 import（文件头 `import * as qrcode from 'qrcode'`）；
 *    toDataURL(text, { margin, width }) 调用面逐字不变。 ── */
/** §5 支付/产品域外部依赖 */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：ChevronRightIcon/RefreshIcon → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

declare function classVariance(
  base: string,
  config: { variants?: Record<string, Record<string, string>>; defaultVariants?: Record<string, string> },
): (props?: { variant?: string }) => string; // Ta（cva 风格）
/* ── tombstone〔A1-R36〕：declare ZCODE_ENV_VALUE（原 hi）删除 → 改指 lib/buildEnv@9 RESOLVED_BUILD_ENV（SrcSharedA@310 转导出；hi 真身：styles 703 `js as hi` ← src 9941 `s as js` ≡ s 73 `o(\`production\`)` ≡ RESOLVED_BUILD_ENV 逐字同值，链闭合）。消费面实测（本文件 9 处改名改指）：@1654/5259/5260/5261/9113/9129/9130/9131/9145 ≡ bundle 79986/84359-84361/88209/88219-88221/88233。负证据：余 bundle 消费 2 处属他域（141843 $Pt 默认参 / 187593 gYt 内网探针）。 ── */
/* ── tombstone〔A1-R36〕：declare envConsoleUrlOf（原 Si）删除 → 改指 modules/SrcSharedA@1618 codingPlanPersonalOverviewUrl（Si 真身：styles 756 `qo as Si` ← src 9995 `Bc as qo` ≡ Bc 4391 `zc(e, \`/coding-plan/personal/overview\`)` ≡ codingPlanPersonalOverviewUrl 逐字同形，链闭合）。消费面实测（本文件 3 处改名改指）：@1654/5259/9130 ≡ bundle 79986/84359/88220。负证据：本文件外零消费。 ── */
/* ── tombstone〔A1-R36〕：declare envSiteUrlOf（原 fn）删除 → 改指 modules/SrcSharedA@1622 codingPlanTeamPlansUrl（fn 真身：styles 505 `Jo as fn` ← src 9735 `Vc as Jo` ≡ Vc 4394 `zc(e, \`/coding-plan/team/plans\`)` ≡ codingPlanTeamPlansUrl 逐字同形，链闭合）。消费面实测（本文件 2 处改名改指）：@5260/9131 ≡ bundle 84360/88221。负证据：余 `fn(` 命中 7373 为属性面（this.fn）、119850 区为局部遮蔽符，皆非本符。 ── */
/* ── tombstone〔A1-R36〕：declare envPathUrlOf（原 vn）删除 → 改指 modules/SrcSharedA@1613 buildBigmodelApiUrl（vn 真身：styles 511 `Ko as vn` ← src 9742 `zc as Ko` ≡ zc 4387（前导 / 归一 + BigModel 基址拼接）≡ buildBigmodelApiUrl 逐字同形，链闭合）。消费面实测（本文件 3 处改名改指）：@5261/9129/9145 ≡ bundle 84361/88219/88233。负证据：余 `vn(` 命中 119997-120802 为局部遮蔽符（多参面），非本符。 ── */
/* ── tombstone〔A1-R36〕：declare NETWORK_BLOCKED_ERROR_CODE（原 Pne）删除 → 改指 modules/SrcSharedB@6255 CODING_PLAN_SYSTEM_BUSY（Pne 真身：styles 767 `s as Pne` ← src 10006 `EC as s` ≡ EC 9547 `coding_plan_system_busy` ≡ CODING_PLAN_SYSTEM_BUSY 逐字同值，链闭合；语义名与值域不合为 bundle 实测——xJ 错误归一以系统忙码承载 HTML 拦截面）。消费面实测：@2188（normalizeProductError 体内）≡ bundle 80594 `C5e(t) ? Pne : ...`，改名改指。负证据：styles Pne 消费全集 1 处（80594）。 ── */
/** §6 Stripe/验证码/遥测 外部依赖 */





/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（3）：CloseIcon/TrashIcon/CheckIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone（A1-R10 2a）：declare function useAppStore<T>(selector: (state: any) => T): T（原 ko，1296）删除，
 *    改经文件头 stores-core import 消费（canonical = useSettingsStore；theme/user/OAuth 状态同一 settings store，
 *    bundle 206446–206448/212950 等 ko 消费面同证）。 ── */
/* ── tombstone（A0-S3a）：vendored @stripe/react-stripe-js 6.4.0 + @stripe/stripe-js 9.6.0
 *    原语（80955–81731，u7e/v7e/f7e/y7e/b7e/x7e/F7e）declare 删除，改 npm 真实 import（文件头）：
 *    StripeElementsProvider=Elements、useStripe/useElements、CardNumberElement/CardExpiryElement/
 *    CardCvcElement ← @stripe/react-stripe-js@6.4.0；stripeLoader.loadStripe ← @stripe/stripe-js@9.6.0。
 *    调用面（stripe={stripePromise} / elements.getElement / createPaymentMethod /
 *    confirmCardPayment / confirmCardSetup）逐字不变。 ── */
/** 横切：遥测上报（40457）/ 远断错误守卫（4894）/ 验证码错误码（736 导入）/ 平台桥（S） */
/* ── tombstone〔A1-R35〕：declare trackTelemetry（原 xw）删除 → 改指 modules/StoresDeep@323 reportTelemetry（xw 真身：styles-local 40457-40466 逐字 ≡ StoresDeep@323；StoresDeep@321 行注「原 xw（40409）」为行漂移，实测 40457，登记在案）。消费面实测：@3651（trackFunnelClick）≡ bundle 82912、@3655（trackFunnelResult）≡ 82915，改名改指（service: any 面双变可赋）。负证据：本文件 xw 消费仅 2 处；余 bundle 消费 42190/53316/53331/53352/112332 属他域（Conversation P1 泳道 / Home §U.8 R26 已收敛 / iit 死簇已删）。 ── */
declare function isBenignRemoteError(error: unknown): boolean; // Sc
/* ── tombstone〔A1-R35〕：declare SECURITY_VERIFICATION_REQUIRED_CODE（原 one）删除 → 改指 modules/SrcSharedB@6252 CODING_PLAN_SECURITY_VERIFICATION_REQUIRED（one 真身：styles 736 `o as one` ← src 9975 `TC as o` ≡ TC 9546 `coding_plan_security_verification_required` ≡ SrcSharedB@6252 CODING_PLAN_SECURITY_VERIFICATION_REQUIRED 逐字同值，链闭合）。消费面实测：@4494（isSecurityVerificationRequiredError）≡ bundle 83690 `xJ(e) === one`，改名改指。负证据：styles one 消费全集 1 处（83690；6074/6107 为同名局部属性面，非本符）。 ── */
declare function usePlatformBridge(): any; // S（openExternal/onPaymentCallback）
/** §7–§10 外部依赖（对话框原语/图标/遥测/供应商机制横切件，接口级） */












/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：BackIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone（A1-R23）：declare EquityCheckIcon（E_）删除——随 §9 死簇删除后全树零消费（负证据在案）。 ── */
declare const HelpIcon: React.FC<React.SVGProps<SVGSVGElement>>; // p
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（4）：SuccessIcon/MinusIcon/PlusIcon/GlobeIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone（A1-R22）：WebElementIcon declare 删除（原 wye，Sa('earth') vendored，js 26983）——唯一消费面
 *    §10 lit 副本同批删除；真身逐字 canonical = modules/Composer.tsx [B17]（lucide Earth as WebElementIcon）。 ── */
/* ── tombstone（A1-R22）：SelectionIcon declare 删除（原 fbe，Sa('quote') vendored，js 27690）——唯一消费面
 *    §10 uit 副本同批删除；真身逐字 canonical = modules/Composer.tsx [B17]（lucide Quote as SelectionGlyphIcon）。 ── */
declare const GenericProviderIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Cv
declare const ZapiProviderIcon: React.FC<React.SVGProps<SVGSVGElement>>; // zbe
declare const ModeLeadingIcon: React.FC<React.SVGProps<SVGSVGElement>>; // bbe〔A1-R35〕留批：bundle 27837 `bbe = Sa(\`sliders-horizontal\`, [...])` 图标面（真身未转录），树内零消费负证据在案，待真身批收敛
/* ── tombstone（A1-R21）：declare providerLogoOf（原 Tq，76183）删除——canonical 属主
 *    components/usage/UsageDeep.tsx RegionLogo（A0 已重建；bundle Tq 二参函数形
 *    `Tq(providerId, className)` 与本 declare 同形，收敛改组件形消费）。
 *    证据：bundle Tq 体 = REGION_LOGO_BY_ID 查表 → img(`shrink-0 object-contain`+cn 合并) |
 *    缺省 pv=log-in 图标(`shrink-0`)，与 RegionLogo 体逐字同构；消费面 88517/88520（本文件
 *    providerEntryIconOf=crt 88512 区）改 `<RegionLogo region={…} className={…}/>`，语义不变。 ── */
/* ── tombstone（A1-R20）：declare const BillingDiscountBanner（原 HHe，js 51994–52033）删除——canonical 属主
 *    components/usage/UsageDeep.tsx BillingDiscountCard（A0 已重建；A1-R20 sparkles 图标勘误后与 bundle 逐字一致）；
 *    bundle HHe 唯一真身，消费面 85417（本文件 6229）逐字不变，改指文件头 import（modules/UsageDeep）。 ── */
/* ── tombstone（A1-R26）：declare trackFunnelStart（原 WUe 53313–53327）+ declare trackPlanSelectEvent
 *    （原 RM 53328–53348 / zM 53349–53375 合并面）删除 → 文件头 ../../modules/Home import 改接
 *    Home §U.8 逐字真身（bundle 三符唯一真身；负证据：bundle 内无第二定义）。
 *    终端消费实测：WUe 5507 ≡ bundle 84644；RM/zM 分流实测——5679/5716 传 productGroupId 面 ≡ bundle
 *    84816/84853 RM 调用，5979/6012 传 productId/billingPeriod/purchaseMethod/paymentMethod 面 ≡ bundle
 *    85159/85191 zM 调用；四处调用点按分流改名（5679/5716 → trackCodingPlanProductSelect、
 *    5979/6012 → trackCodingPlanBillingCycleSelect、5507 → trackCodingPlanFunnelStart），参数逐字不变。 ── */
/* ── tombstone（A1-R22）：declare isStructuredSelection（原 Ds，2827）删除——唯一消费面 §10 uit 副本同批删除；
 *    真身逐字 canonical = modules/Composer.tsx [B17] isConversationSelectionReference（型别守护形）。 ── */
/* ── tombstone〔A1-R30〕：declare isZaiCodingPlanProvider（原 tr 脸 B）删除 → 改指 isZaiPlanProviderId
 *    （tr 真身：同脸 A 墓碑，styles 548 `Po as tr` ← src 9780 `vl as Po` ≡ SrcSharedA@2022，链闭合）。
 *    消费面实测（本文件 5 处改名改指）：@7484（dtt PersonalPaymentConfirm）≡ 86696、@8731（dnt subscribeUrlOf）≡ 87912、
 *    @8881（bnt startPlanCardCopyOf）≡ 88035、@9060（znt providerDisplayNameOf）≡ 88166、@9477（lrt codingPlanEntryStatusOf）≡ 88524。
 *    行为更正注：原 A0 语义名示「仅判 codingPlan」，bundle tr 实测兼判 zaiStartPlan（vl 体双判）；
 *    收敛改指 canonical，运行时行为回归 bundle 逐字。负证据：本文件该 declare 无第二消费。 ── */
/** 供应商/工具条横切机制（接口级） */
/* ── tombstone〔A1-R35〕：declare useModelProviders（原 qq）删除 → 逐字转录本文件尾部 §11 useModelProvidersStore（bundle 78243-78403 唯一真身；主攻三件 a8e/e8e/qq 族，见尾部映射表）。消费面实测：@9893（CodingPlanUpgradeDialog 体内）≡ bundle 88902，改名改指。负证据：本文件 qq 消费仅 1 处；余 bundle 消费 89525/91643/138853/150304/192101/197843 属他域（Home §U.10/Automations/OLL 等，R23-R24 收敛面或留批面）。 ── */
/* ── tombstone（A1-R23）：declare useSettingsState（JM）/useTabsStoreActions（pc）/useWorkspaceConfigOptions（Jq）/
 *    openSettingsSection（ow）/invalidateSettingsCache（aw）/buildUpgradeFunnel（PM）/ModelSelectMenu（vq）删除——
 *    唯一消费面 §9 iit 死簇（11030/11038/11068/11263/11081/11436 等）同批删除；真身 = Home §U.10
 *    ComposerConfigToolbarBody 逐字（useSettingsSnapshot/useCatalogConfigOptions/openSettingsUsageSection/
 *    buildCodingPlanPurchaseFunnelContext 等消费面经 Home §0 declare 分层）。 ── */
declare function useCoreServices(): { modelProviderService: any; credentialService: any }; // fs
/* ── tombstone（A1-R11）：declare entryPlanStateOf（原 IM，53277）删除，改经文件头 modules/UsageDeep import 消费
 *    （canonical 逐字 IM 53277；返回 EntryPlanState 对象——11056 消费点仅透传 buildUpgradeFunnel（any 面），逐字不变）。
 *    〔A1-R23〕11056 消费点随 §9 iit 死簇删除，本件 import 面同步移出（UsageDeep canonical 导出保留）。 ── */
/* ── tombstone（A1-R11）：declare providerEntryOrNull（原 tM，52642）删除，改指 nullSafe as providerEntryOrNull。
 *    双实例收敛证据：bundle tM 唯一真身 52642（`return e ?? null`），本名与 MPSS toManagedProvider 同符双归属；
 *    终端消费实测 9668–9671/10325（单参，返回 ModelProvider | null）。 ── */
/* ── tombstone（A1-R11）：declare providerFingerprintKeyOf（原 nM，52645）删除，改指 providerApiKeyFingerprint as providerFingerprintKeyOf。
 *    双实例收敛证据：bundle nM 唯一真身 52645（`${e.id}:${jUe(e.apiKey.trim())}`，!e 守卫），终端消费实测 9672–9675（返回 string）。 ── */
/* ── tombstone〔A1-R29〕：declare connectionModeContextOf（A0 误标「原 N6e」）删除——树内零消费（负证据在案）；
 *    N6e 真身 = 本文件 filterUsableProviders@1097（A0 已逐字实化，bundle N6e 77910–77929 唯一真身；
 *    消费 89703 ≡ Home filterEntitledModelProviders 面 / 135402 ≡ Automations buildEntitledProviderList 面，
 *    同批收敛，见各墓碑）。误标依据：签名 (args: Record<string, unknown>): any 与 N6e 对象参形不合。 ── */
/* ── tombstone〔A1-R35〕：declare normalizedModelOptionsOf（原 L）删除 → 改指 stores/taskStore@1422 filterNativeModelOptions（L 真身唯一锁定：styles 372 `A as L` ← skillStore-BmeKHDBI 导出 2483 `it as A` ≡ it 906-908 `return e.filter((e) => !nt(e))`（nt 894-899 ≡ isCustomModelOption）≡ taskStore@1422-1424 逐字同形（二三参未使用，A1-R18 型缝宽化在案），SkillStore 转导出）。三参消费面实测：bundle 89709（iit 89503 体内，非 89600——行漂移登记在案）`L(V.options ?? [], V.currentValue, e)` ≡ Home@4815 `filterNativeModelOptions(V.options ?? [], V.currentValue, e)`。负证据：本文件 L 零消费（仅 declare）；styles 2986/3094/26307/29014 等单参 L( 调用皆为函数域局部遮蔽符（事件域面），非模块级 L。 ── */
/* ── tombstone〔A1-R29〕：declare modelGroupsOf（原 Hq，A0 文件内第二脸）删除——树内零消费（负证据在案）；
 *    Hq 真身 = 本文件 modelMenuGroupsOf@993（A0 已逐字实化，bundle Hq 77850 唯一真身）；bundle Hq 消费 4 处
 *    （89710/135408/133909/197861）全属文件外四面（Home@375/Automations@151/ExtendedViews@427/
 *    SubagentsSettingsSection@248），同批收敛改指，见各墓碑。 ── */
/* ── tombstone〔A1-R34〕：declare isModelMenuStructured（原 r6e）删除 → 改指 Home@4572 isModelSelectConnectionModeEnabled（bundle 77491；消费 89712 属 iit/Home 转录面；本树零消费，负证据在案）。 ── */
/* ── tombstone〔A1-R34〕：declare useManageModelsAvailable（原 T6e）删除 → 改指 Home@4540 isManageModelsActionVisible（bundle 77864；消费 89761 属 Home 转录面；A0 误名 hook 形，本树零消费，负证据在案）。 ── */
/* ── tombstone〔A1-R34〕：declare normalizeModelSelectionValue（原 k6e）删除 → 改指 Home@4560 normalizeModelSelectState（bundle 77884；消费 89772 属 Home 转录面；本树零消费，负证据在案）。 ── */
/* ── tombstone（A1-R11）：declare shouldProbeStartPlanEntitlement（原 aM，52661）删除，改经文件头 modules/UsageDeep import 消费
 *    （canonical = components/usage/UsageDeep.tsx aM 52661 逐字）。双实例收敛证据：bundle aM 唯一真身 52661；
 *    终端消费实测 9704/9714（codingPlanSnapshot 传 zai/bigmodelCodingSubscription.snapshot——$j 面 any，对 EntitlementSnapshot | null 双变可赋）。 ── */
declare function useEntitlementSubscription(args: Record<string, unknown>): { snapshot: any; loading: boolean; error: unknown; refresh: (opts?: any) => Promise<void> }; // $j
declare function entitlementCacheKeyOf(args: { providerId: string; providerFingerprint: string | null }): string; // Bj
/* ── tombstone〔A1-R34〕：declare parseModelProjection（原 Mg）删除 → 改指 Home@3826 parseLooseModelValue（bundle 24406；R25 行漂校正在案（ExtendedViews@442 declare 层同族注）；消费 53061/53096/53180/53418/53648/53757/89249 属他域；本树零消费，负证据在案）。 ── */
/* ── tombstone（A1-R23）：declare defaultSessionModeOf（$M/Krt）/sessionModeCatalog（cn 无参）/
 *    shortcutLabelOf（Bre/Zi）/isThoughtCapableModel（qn）/DEFAULT_THOUGHT_LEVELS（ui）删除——
 *    消费面 §3/§9 死簇（10780/10855/10844/11382/11383/10687/10698）同批删除；真身 = Home §T
 *    getLastDraftCollaborationMode（Krt 89303，委托 $M 末稿协作模式族 53562–53577，Home  header YM/XM/ZUe/ZM/QM/$M）/
 *    §T listSessionModePresets（cn 消费面 89366 区）/§T formatCtrlShiftShortcut（Bre/Zi）/
 *    §U.9 buildThoughtLevelOptionFromCatalog（zrt 89222，qn/ui 经 modules/SrcSharedA GLM_REASONING_LEVELS 等真实 import）。
 *    随附：phaseAutoRefreshModeOf（l8e）/registerSessionRefresh（d8e）同删——死簇删除后零消费
 *    （真身 = Home §U 逐字族 entitlementAutoRefreshModeOfPhase/useEntitlementRefreshOnTaskTransition，78407/78418）。 ── */
/* ── tombstone（A1-R23）：declare MODE_TRIGGER_TESTID（un）/MODEL_TOOLBAR_TESTID（Uee）删除——
 *    消费面 §9 死簇（10828/10908/11400）同批删除；真身 = Home §T/§U.10 逐字族内联
 *    （un=v4-composer-input，src-HCld2afU Ji；Uee 消费面 89875 区 iit 内）。 ── */
declare function planDomainsOf(cfg: any): any; // hee
declare function authSessionOf(): any; // xi

// 〔A1-R29〕补 export：Hq/N6e/ot 簇收敛型缝所依（Home/Subagents/Automations/ExtendedViews 各脸本地供应商型面
// 依此窄化；行依据：本接口为 canonical 各函数签名所依，导出为类型面，零运行时影响）。
export interface ModelProvider {
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
 * §1 tombstone（A1-R23 · j3e 叠层专项裁定，R21 模式直接套用）：
 *    原 y3e closeThenRun / Aq USAGE_CHART_COLORS / b3e PERCENT_SCALE / x3e CACHE_HIT_DISPLAY_THRESHOLD /
 *    S3e formatCompactNumberLocale / C3e formatUsedOfTotal / w3e formatPercentOrNull / T3e segmentStyleOfIndex /
 *    E3e CONTEXT_BREAKDOWN_LABEL_KEYS / D3e CONTEXT_BREAKDOWN_ORDER / O3e aggregateContextBreakdown /
 *    k3e toBreakdownSegments / A3e validTaskUsageOrNull / j3e ContextUsagePopover（A0 语义重建形，
 *    76612–76847）删除——与 Home §V.6/§V.7 逐字族并行重建叠层。
 *    裁定证据：bundle y3e…A3e/j3e 各唯一真身（76612–76847，各一定义）；j3e 唯一消费 = 89918
 *    （iit composer 工具条 89503–89977 内），树内对应 = Home §U.10 ComposerConfigToolbarBody 逐字
 *    （消费 CodingPlanUsageToolbar=j3e 逐字，机械校验器在证）；本件 ContextUsagePopover 唯一消费点 11416
 *    位于本文件 iit 死副本簇内（同批删除，见 §9 墓碑）= 死代码，负证据记录。
 *    真身归属：Home §V.6/§V.7 逐字族（runActionAndClose=y3e 76612 / USAGE_CHART_SEGMENT_COLORS=Aq 76615 /
 *    USAGE_CONTEXT_PROGRESS_MAX=b3e 76621 / CACHE_HIT_RATE_DISPLAY_THRESHOLD=x3e 76622 /
 *    formatUsageTokenCountCompact=S3e 76623 / formatContextUsageSummary=C3e 76627 /
 *    formatCacheHitRatePercent=w3e 76631 / resolveUsageChartSegmentStyle=T3e 76638 /
 *    CONTEXT_USAGE_BREAKDOWN_LABEL_I18N_IDS=E3e 76640 / CONTEXT_USAGE_BREAKDOWN_SOURCE_ORDER=D3e 76648 /
 *    aggregateContextUsageBreakdown=O3e 76656 / buildContextUsageProgressSegments=k3e 76667 /
 *    sanitizeContextTaskUsage=A3e 76670 / CodingPlanUsageToolbar=j3e 76678–76847）。
 *    modules/PaymentDeep shim 再导出面同步移除（全树零消费，负证据在案）。 ────────────────── */

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
 *    语义不变。〔A1-R23〕ModePickerTrigger（qrt 89306 A0 副本）随 §9 死簇删除——
 *    真身 = Home §T ComposerModeTrigger 逐字，ConfigSelect 消费面在证。
 * -------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * §3 tombstone（A1-R23 · j3e 叠层专项随附清理）：
 *    (a) A0-S2d · 去重 b/c（77127–77163）原注保留：Nq normalizeOptionKey / K3e isThoughtOffOption /
 *        q3e thoughtRankOf / J3e sortThoughtOptions / Y3e nextThoughtLevelValue / X3e thoughtOptionLabelOf
 *        为重复转录，canonical 在 Composer.tsx（normalizeThoughtLevelKey / isDisabledThoughtOption /
 *        thoughtOptionRank / sortThoughtOptions / nextThoughtLevelValue / thoughtOptionLabel）；
 *        W3e THOUGHT_LEVEL_RANKS import 随段删除（唯一消费 q3e）。
 *    (b) 原 Pq ThoughtLevelControl / Fq shortcutKeyOfCategory / Z3e nextSelectValue /
 *        Q3e resolveToolbarShortcut / $3e useToolbarShortcuts（A0 语义重建形，77166–77451 区）删除——
 *        与 Home 逐字族并行重建叠层。裁定证据：bundle Pq/Fq/Z3e/Q3e/$3e 各唯一真身
 *        （Pq 77166 / Fq 77348 / Z3e 77360 / Q3e 77367 / $3e 77393）；Pq 消费 89959（iit 内）及其余
 *        消费面均在 iit/Xrt composer 工具条域，树内逐字对应 = Home §U.2 ComposerThoughtToolbar（Pq）+
 *        §T shortcutKeyOfConfigCategory（Fq）/ cycleSelectOptionValue（Z3e）/
 *        resolveComposerToolbarShortcutAction（Q3e）/ useComposerToolbarShortcuts（$3e）（机械校验器在证）；
 *        本件副本唯一消费面（ThoughtLevelControl@11466 / useToolbarShortcuts@10877+11387 /
 *        nextSelectValue@10873 / shortcutKeyOfCategory@856–902 / resolveToolbarShortcut@890）
 *        全在同批删除死簇（§9 墓碑）内或本段互引 = 死代码，负证据记录。
 *        modules/PaymentDeep shim 再导出面同步移除（全树零消费，负证据在案）。 ────────────────── */

/* ----------------------------------------------------------------------------
 * §4 供应商/模型菜单机制（原 e6e…Jq，77452–78455）
 * -------------------------------------------------------------------------- */

/** 原 e6e（77452 区）：供应商族序 */
export const PROVIDER_FAMILY_ORDER = new Map<string, number>([
  [providerIds.zaiStartPlan, 0],
  [providerIds.zaiCodingPlan, 1],
  [providerIds.zai, 2],
  [providerIds.bigmodelStartPlan, 3],
  [providerIds.bigmodelCodingPlan, 4],
  [providerIds.bigmodel, 5],
  [providerIds.zapi, 6],
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

/* ── tombstone〔A1-R28〕：teamOrganizationLabelOf（原 Lq，A0 语义副本）删除 → 收敛改指 Home §U.5 逐字 canonical
 *    teamSourceOrganizationLabel（components/shell/Home.tsx，bundle Lq 77476–77478 唯一真身；本副本 body 逐字
 *    同形 `(e.organizationName?.trim() ?? \`\`) || null`）。双实例收敛证据：消费面实测——@683（p6e
 *    teamPlanOptionsOf）≡ bundle 77608、@9682（frt mergeTeamPlanMenuItems）≡ bundle 88723（其 prt 面为
 *    同体内联调用，见下 prt 墓碑），本批改名改指；modules/PaymentDeep 转导出面全树零消费（负证据在案，
 *    随删）。负证据：bundle 内 Lq 无第二定义。改指经 modules/Home（二环判例，见文件头导入行注）。 ── */

/** 原 n6e（77489 区）：供应商展示标签（Z.ai/BigModel + 徽章） */
export function providerDisplayLabelsOf(provider: ModelProvider, options: { codingPlanBadgeLabel?: string } = {}) {
  const codingPlanBadgeLabel = options.codingPlanBadgeLabel ?? `Individual`;
  return provider.id === providerIds.zai
    ? { label: `Z.ai` }
    : isZaiPlanProviderId(provider.id)
      ? { label: `Z.ai`, labelBadge: codingPlanBadgeLabel }
      : provider.id === providerIds.bigmodel
        ? { label: `BigModel` }
        : provider.id === providerIds.bigmodelCodingPlan || provider.id === providerIds.bigmodelStartPlan
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
  return isObjectRecord(entry) && ((entry as any).modified === !1 || (entry as any).modified === !0);
}

/** 原 Rq（77518 区）：agent 可用模型（格式过滤+kind 重定向） */
export function modelsForAgent(agent: string, provider: ModelProvider): string[] {
  const formats = agentModelFormatsOf(agent),
    known = new Set(GLM_MODEL_IDS),
    isAllowed = (format: string) =>
      isStartPlanProviderId(provider.id) ? known.has(format) || provider.models.some((model) => isObjectRecord(model) && (model as any).id.trim() === format && isModelEntryWithModified(model)) : !0,
    retarget = (format: string) => {
      const entry = provider.models.find((model) => isObjectRecord(model) && (model as any).id.trim() === format);
      if (!entry) return format;
      const entryFormats = resolveModelSupportedKinds({ provider, modelName: format });
      const matched = (formats ?? entryFormats).map(mapModelFormatToKind).find((normalized) => normalized != null && ((entry as any).kinds).includes(normalized)); // 〔A1-R31〕型缝：canonical mapModelFormatToKind 返回面含 undefined，!== null→!= null（真值表逐字等价，见 @166 墓碑）；kinds 面 string[] cast 随 nt 谓词收窄删除移出
      return (matched && ((entry as any).modelIdByKind)?.[matched]?.trim()) || format; // 〔A1-R31〕modelIdByKind 面 cast 随 nt 谓词收窄删除移出
    },
    all = listProviderModelIds(provider).filter(isAllowed).map(retarget);
  return formats
    ? listProviderModelIds(provider).flatMap((format) => {
        if (!isAllowed(format)) return [];
        const entryFormats = resolveModelSupportedKinds({ provider, modelName: format });
        return formats.some((wanted) => entryFormats.includes(wanted)) ? [retarget(format)] : [];
      })
    : all;
}

/** 原 o6e（77541 区）：凭据就绪（apiKey 或预设端点） */
export function hasProviderCredentials(provider: ModelProvider): boolean {
  return provider.apiKey.trim().length > 0 ? !0 : isZaiPlanProviderId(provider.id) ? listEndpointKinds(provider.endpoints).length > 0 : !1; // 〔A1-R31〕Sr 收敛：参改 provider.endpoints（yu 真身签名，见 @166 墓碑）
}

/** 原 s6e（77544 区）：供应商支持单格式 */
export function providerSupportsFormat(provider: ModelProvider, format: string): boolean {
  const normalized = mapModelFormatToKind(format);
  return normalized ? resolveProviderKindEndpointUrl(provider, normalized).length > 0 : !1;
}

/** 原 zq（77548 区）：任一格式支持 */
export function providerSupportsAnyFormat(provider: ModelProvider, formats: string[]): boolean {
  return formats.some((format) => providerSupportsFormat(provider, format));
}

/** 原 Bq（77551 区）：agent × 供应商可用性 */
export function providerUsableForAgent(agent: string, provider: ModelProvider): boolean {
  return !isProviderEnabled(provider) || modelsForAgent(agent, provider).length === 0 || !hasProviderCredentials(provider)
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
  return isBuiltinProviderId(id) && id !== providerIds.zapi;
}

/** 原 l6e（77566 区）：供应商模型项（key/value/name） */
export function modelItemsOfProvider(context: { selectedProvider: string; provider: ModelProvider }) {
  return modelsForAgent(context.selectedProvider, context.provider).map((model, index) => ({
    key: `provider:${context.provider.id}:${index}:${model}`,
    value: formatCustomModelId(context.provider.id, model),
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
  return buildCodingPlanScope({ productId: product.productId, organizationId: product.organizationId, projectId: product.projectKey });
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
        const label = teamSourceOrganizationLabel({
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
  if (!parseCodingPlanScope(savedKey)) return !1;
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
  return saved.startsWith(`team-plan:${providerIds.bigmodelCodingPlan}:`) ? saved : null;
}

/** 原 g6e（77681 区）：bigmodel 团队计划选中态 */
export function isBigmodelTeamPlanSelected(context: { providerId: string; familySelectedKeys?: Record<string, string> | null }): boolean {
  const saved = context.familySelectedKeys?.bigmodel?.trim() ?? ``;
  return (
    context.providerId === providerIds.bigmodelCodingPlan && saved.startsWith(`team-plan:${providerIds.bigmodelCodingPlan}:`)
  );
}

/** 原 _6e（77687 区）：族内缺省选项解析（apiKey 直取/已存键/回退链） */
export function resolveFamilyDefaultOption(context: {
  familyId: string;
  options: any[];
  familyModes: unknown;
  familySelectedKeys?: Record<string, string> | null;
}) {
  if (resolveProviderFamilyMode(context.familyId, context.familyModes) === `apiKey`)
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
  const familySpec = getOAuthProviderFamilyByProviderId(context.familyId === `zai` ? providerIds.zai : providerIds.bigmodel) as FamilySpec | null; // 〔A1-R29〕型缝：canonical 返回 any，消费面依原 declare 契据（FamilySpec | null）窄化（行依据：本行 + FamilySpec@394）
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
  const prefix = `team-plan:${providerIds.bigmodelCodingPlan}:`;
  if (!optionKey.startsWith(prefix) || !savedKey.startsWith(prefix)) return !1;
  if (codingPlanScopesOverlap(optionKey, savedKey)) return !0;
  const optionParsed = parseCodingPlanScope(optionKey),
    savedParsed = parseCodingPlanScope(savedKey);
  return !!(optionParsed?.productId && savedParsed?.projectId === `0` && optionParsed.productId === savedParsed.productId);
}

/** 原 x6e（77781 区）：OAuth 不活跃族判定 */
export function inactiveOAuthFamilyOf(providers: ModelProvider[]): string | null {
  const zaiInactive = providers.some(
      (provider) =>
        provider.systemDisabledReason === `oauth_provider_inactive` &&
        (provider.id === providerIds.zai || provider.id === providerIds.zaiStartPlan || provider.id === providerIds.zaiCodingPlan),
    ),
    bigmodelInactive = providers.some(
      (provider) =>
        provider.systemDisabledReason === `oauth_provider_inactive` &&
        (provider.id === providerIds.bigmodel || provider.id === providerIds.bigmodelStartPlan || provider.id === providerIds.bigmodelCodingPlan),
    );
  return bigmodelInactive && !zaiInactive ? `zai` : zaiInactive && !bigmodelInactive ? BIGMODEL_REGION_ID : null;
}

/** ── 型缝〔A1-R29〕：AgentModelMenuGroup——S6e flatMap 返回面分组元素公共上界（familyGroupOf 面 labelBadge any /
 *    directItems 必备；providerGroupOf 面 labelBadge?: string / directItems 可选）。引入缘由：tsc 对 flatMap@958
 *    `[] | A[] | (B1|B2)[]` → `U | ReadonlyArray<U>` 的 U 推断在文件微扰下不稳（实测：本批收敛 SrcSharedB 导入行
 *    即令 U 钉死 familyGroupOf 面报 TS2345；HEAD 插入无关语句亦复现，负证据在案）。显式 flatMap<AgentModelMenuGroup>
 *    定锚 U；仅类型面，零运行时影响。行依据：本接口 + flatMap@958。 ── */
interface AgentModelMenuGroup {
  key: string;
  label: string;
  labelBadge?: unknown;
  directItems?: boolean;
  items: { key: string; value: string; name: string }[];
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
      const spec = getOAuthProviderFamilyByProviderId(provider.id) as FamilySpec | null; // 〔A1-R29〕型缝：同上（原 declare 契据窄化）
      return spec && domain && spec.id !== domain
        ? !1
        : activeOAuthProviderMatchesFamily({ providerId: provider.id, activeOAuthProvider: inactiveFamily }) &&
            isProviderAllowedForFamilyMode({ providerId: provider.id, familyModes }) &&
            (providerUsableForAgent(agent, provider) || (isBigmodelTeamPlanSelected({ providerId: provider.id, familySelectedKeys }) && modelsForAgent(agent, provider).length > 0));
    }),
    byFamily = new Map<string, ModelProvider[]>();
  for (const provider of usable) {
    const spec = getOAuthProviderFamilyByProviderId(provider.id) as FamilySpec | null; // 〔A1-R29〕型缝：同上（原 declare 契据窄化）
    if (!spec) continue;
    const group = byFamily.get(spec.id) ?? [];
    (group.push(provider), byFamily.set(spec.id, group));
  }
  const emitted = new Set<string>();
  return usable.flatMap<AgentModelMenuGroup>((provider) => {
    const spec = getOAuthProviderFamilyByProviderId(provider.id) as FamilySpec | null; // 〔A1-R29〕型缝：同上（原 declare 契据窄化；flatMap U 由 AgentModelMenuGroup@920 定锚，见该型缝注）
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
  if (isGlmAgentCliProvider(agent)) return glmMenuGroupsOf(providers, labels, displayOrder, familyModes, familySelectedKeys, teamPlanProducts, showPurchasedTeamPlanFallback, options.providerFamilyDomain);
  const own = modelMenuGroupsForAgent(agent, providers, labels, displayOrder, familyModes, familySelectedKeys, teamPlanProducts, showPurchasedTeamPlanFallback, options.providerFamilyDomain);
  return (groups.push(...own), groups);
}

/** 原 w6e（77839 区）：值 → 模型名（分组查 ?? 目录查） */
export function modelNameOfValue(groups: any[], value: string): string | null {
  for (const group of groups) {
    const item = group.items.find((item: any) => item.value === value);
    if (item) return item.name;
  }
  const catalog = parseCustomModelId(value);
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
  const catalog = parseCustomModelId(value);
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
  const catalog = parseCustomModelId(value);
  return options?.allowUnavailableCustomModelPlaceholder && catalog?.modelName?.trim()
    ? { value: void 0, placeholder: catalog.modelName.trim() }
    : options?.allowUnavailableModelPlaceholder && value.trim()
      ? { value: void 0, placeholder: shortModelNameOf(value) }
      : groups.length === 0 && hasModelOption
        ? { value: void 0, placeholder }
        : { value: void 0, placeholder: void 0 };
}

/** 原 A6e（77896–77898）：iM 单参包装（77897 `return iM(e)`）
 *  〔A1-R27〕declare hasActiveEntitlementCore 收敛改指 UsageDeep canonical（见上墓碑）；
 *  snapshot 由 unknown 精化为 EntitlementSnapshot | null（bundle A6e 唯一消费 j6e 77905 / M6e 77908 均传权益快照流）。 */
export function hasActiveEntitlementAlias(snapshot: EntitlementSnapshot | null) {
  return hasActiveEntitlement(snapshot);
}

/** 原 j6e（77899–77906）：供应商权益可见性
 *  〔A1-R27〕entitlementSnapshot 型缝精化 unknown → EntitlementSnapshot | null（行依据：bundle j6e 消费面仅 N6e 77918，
 *  快照流经 getEntitlementSnapshot ≡ 下方 filterUsableProviders 型缝；canonical iM 52651 读面 provider/unavailableReason/quota/subscription/remaining 全合）。 */
export function isProviderEntitlementVisible({ providerId, entitlementSnapshot, modelProviderFamilySelectedKeys }: { providerId: string; entitlementSnapshot: EntitlementSnapshot | null; modelProviderFamilySelectedKeys?: Record<string, string> | null }) {
  return isZaiPlanProviderId(providerId)
    ? (entitlementSnapshot as any)?.authenticated === !0 || entitlementSnapshot === null
    : providerId !== providerIds.bigmodelCodingPlan ||
        (modelProviderFamilySelectedKeys?.bigmodel?.trim() ?? ``).startsWith(`team-plan:${providerIds.bigmodelCodingPlan}:`)
      ? !0
      : hasActiveEntitlementAlias(entitlementSnapshot);
}

/** 原 M6e（77907–77909）：Start Plan 可见性（权益未激活才显）
 *  〔A1-R27〕codingPlanEntitlementSnapshot 型缝精化 unknown → EntitlementSnapshot | null（行依据：bundle M6e 唯一消费 N6e 77927，快照来源同 j6e 注）。 */
export function isStartPlanVisible({ providerId, codingPlanEntitlementSnapshot }: { providerId: string; codingPlanEntitlementSnapshot: EntitlementSnapshot | null }) {
  return providerId !== providerIds.zaiStartPlan && providerId !== providerIds.bigmodelStartPlan ? !0 : !hasActiveEntitlementAlias(codingPlanEntitlementSnapshot);
}

/** 原 N6e（77910–77929）：可用供应商过滤
 *  〔A1-R27〕getEntitlementSnapshot 返回面型缝精化 unknown → EntitlementSnapshot | null（行依据：bundle N6e 消费 89703 ≡ Home@370 declare 面
 *  EntitlementSnapshotLike | null、135402 ≡ AMt R0 域留批；快照读面与 EntitlementSnapshot 全合）。 */
export function filterUsableProviders({
  providers,
  selectedProvider,
  getEntitlementSnapshot,
  modelProviderFamilySelectedKeys,
}: {
  providers: ModelProvider[];
  selectedProvider: string;
  getEntitlementSnapshot: (providerId: string) => EntitlementSnapshot | null;
  modelProviderFamilySelectedKeys?: Record<string, string> | null;
}) {
  return providers.filter((provider) => {
    if (
      !isProviderEntitlementVisible({ providerId: provider.id, entitlementSnapshot: getEntitlementSnapshot(provider.id), modelProviderFamilySelectedKeys })
    )
      return !1;
    const codingPlanSnapshot =
      provider.id === providerIds.zaiStartPlan
        ? getEntitlementSnapshot(providerIds.zaiCodingPlan)
        : provider.id === providerIds.bigmodelStartPlan
          ? getEntitlementSnapshot(providerIds.bigmodelCodingPlan)
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
      modelId: normalizeProviderId(model as Record<string, unknown>),
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

/** 原 B6e（77970）：指纹差异（〔A1-R36〕行注清扫：旧注 77952 区为漂移，实测 77970） */
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
  const first = trimmed.indexOf(`:`, GHOST_PROVIDER_REF_PREFIX.length), // 〔A1-R35〕Pte declare 收敛改指（≡ bundle 77979 `Pte.length`）
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
export function supplierKeyOfConfigOptions(configOptions: ConfigOptionEntry[] | undefined, provider: string) { // 〔A1-R33〕二参定形：bundle H6e(e, t) 次参 t=provider（W6e 78017 `H6e(e.configOptions, t)` t=taskProvider 实证），A0 误名 modelValue/误传 configOptions，同批对齐
  const current = currentModelValueOf(configOptions);
  return current ? resolveProviderRefFromCustomModelRef(provider, current) : null;
}

/** 原 U6e（77983 区）：活动任务供应商 */
export function activeTaskProviderOf(state: { activeTaskId?: string | null; optimisticTaskListByTaskId: Record<string, { provider?: string | null }>; taskListCache: Array<{ taskId: string; provider?: string | null }> }) {
  const taskId = state.activeTaskId?.trim();
  return taskId
    ? (state.optimisticTaskListByTaskId[taskId]?.provider ??
      state.taskListCache?.find((task) => task.taskId === taskId)?.provider ??
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
        : { provider: taskProvider, supplierKey: nativeProviderRef(taskProvider) };
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
  const catalog = parseCustomModelId(trimmed);
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
  const catalog = parseCustomModelId(trimmed);
  return catalog?.providerId ? (catalog.modelName ? trimmed : formatCustomModelId(catalog.providerId, modelName)) : trimmed;
}

/** 原 Q6e（78048 区）：agent 模型值匹配（opencode 代理宽匹配） */
export function modelValuesMatchForAgent(left: string, right: string, originalValue: string, agent: string) {
  if (left === right) return !0;
  if (agent === `opencode`) {
    const catalog = parseCustomModelId(originalValue.trim());
    if (catalog?.providerId && catalog.modelName)
      try {
        if (right === buildStableModelId(catalog.providerId, catalog.modelName)) return !0;
      } catch {}
  }
  return !1;
}

/** 原 $6e（78058 区）：配置选项模型值调和 */
export function reconcileConfigOptionsModel(configOptions: ConfigOptionEntry[] | undefined, nextOptions: ConfigOptionEntry[], agent: string) {
  const catalog = getCurrentModelValue(configOptions);
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
          currentCatalog = parseCustomModelId(currentValue),
          optionCatalog = parseCustomModelId(trimmed),
          crossProvider = !!(currentCatalog?.providerId && optionCatalog?.providerId) && currentCatalog?.providerId !== optionCatalog?.providerId;
        let next: string | null = null;
        return (
          !next && agent === `claude` && parseCustomModelId(currentValue)?.providerId && isClaudeAliasModel(trimmed) && (next = currentValue.trim()), // 〔A1-R33〕参形定形：bundle $6e 78107 `Y6e(t)` t=option.currentValue.trim() 实证，A0 误传 option 对象（as unknown as string 铸），同批对齐
          !next && !crossProvider && currentCanonical && optionCanonical && modelValuesMatchForAgent(currentCanonical, optionCanonical, currentValue, agent)
            ? (next = retargetModelValue(currentValue, optionCanonical))
            : currentCatalog?.providerId && !currentCatalog.modelName && optionCanonical && (next = formatCustomModelId(currentCatalog.providerId, optionCanonical)),
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
const PLAN_OVERVIEW_URL = codingPlanPersonalOverviewUrl({ ZCODE_ENV: RESOLVED_BUILD_ENV });
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
    isSupported = providerId === providerIds.bigmodelCodingPlan || isZaiPlanProviderId(providerId),
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
    if (providerId === providerIds.zaiCodingPlan) return filterStartFreeForProvider(providerId, byProvider);
    if (providerId !== providerIds.zaiStartPlan) return byProvider;
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
  return providerId === providerIds.zaiCodingPlan ? products.filter((product) => !isZaiStartFreeProductId(product.productId)) : products;
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
  return isHtmlBlockedMessage(message) ? CODING_PLAN_SYSTEM_BUSY : isOAuthLikeMessage(message) ? OAUTH_REQUIRED_ERROR : message; // 〔A1-R36〕Pne declare 收敛改指（≡ bundle 80594）
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
    /* A0-S3a：原逗号守卫 `if ((event.preventDefault(), setFormError(null), !stripe || !elements))`
       拆分为等价顺序语句——副作用次序逐字不变，真实 @stripe 类型（Stripe | null /
       StripeElements | null）须经显式收窄方可调用，逗号表达式不触发 TS 收窄。 */
    event.preventDefault();
    setFormError(null);
    if (!stripe || !elements) {
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
  service && reportTelemetry(service, funnelClickEventOf(snapshot), `codingPlanPurchaseTelemetry`); // 〔A1-R35〕xw declare 收敛改指（≡ bundle 82912）
}
/** 原 oY（82829 区） */
export function trackFunnelResult(service: any, snapshot: any, outcome: any) {
  !service || !snapshot || reportTelemetry(service, funnelResultEventOf(snapshot, outcome), `codingPlanPurchaseTelemetry`); // 〔A1-R35〕xw declare 收敛改指（≡ bundle 82915）
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
    providerId === providerIds.bigmodel ||
    providerId === providerIds.bigmodelCodingPlan ||
    providerId === providerIds.bigmodelStartPlan
    ? `bigmodel`
    : providerId === `zai` || providerId === providerIds.zai || isZaiPlanProviderId(providerId)
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
    (isZaiPlanProviderId(providerId)
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
          if (isZaiPlanProviderId(providerId)) {
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
  return normalizeProductError(error) === CODING_PLAN_SECURITY_VERIFICATION_REQUIRED; // 〔A1-R35〕one declare 收敛改指（≡ bundle 83690 `xJ(e) === one`）
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
  return isZaiPlanProviderId(providerId) ? !1 : !isSuccessLikeStatus(status ?? ``);
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
              Object.prototype.hasOwnProperty.call(staticResult.value, providerIds.bigmodelCodingPlan)
                ? (staticResult.value as any)[providerIds.bigmodelCodingPlan]
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
  return providerId === providerIds.zaiStartPlan
    ? providerIds.zaiCodingPlan
    : providerId === providerIds.bigmodelStartPlan
      ? providerIds.bigmodelCodingPlan
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
const CONSOLE_HOME_URL = codingPlanPersonalOverviewUrl({ ZCODE_ENV: RESOLVED_BUILD_ENV }); // bet
const SITE_HOME_URL = codingPlanTeamPlansUrl({ ZCODE_ENV: RESOLVED_BUILD_ENV }); // xet
const FINANCE_PAY_URL = buildBigmodelApiUrl({ ZCODE_ENV: RESOLVED_BUILD_ENV }, `/finance-center/finance/pay`); // Cet
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
    authRecoverySubscribeAvailable = isZaiPlanProviderId(providerId) && codingPlanPurchaseTokenAuthenticated === !0 && productsOAuthRequired && !!onLogin,
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
        (funnelIdRef.current !== funnelContext.purchaseFunnelId && ((funnelIdRef.current = funnelContext.purchaseFunnelId), trackCodingPlanFunnelStart(platform, funnelContext)));
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
        trackCodingPlanProductSelect(platform, funnelContext, {
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
      trackCodingPlanProductSelect(platform, funnelContext, {
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
  return effectiveProviderId !== providerIds.bigmodelCodingPlan && !isZaiPlanProviderId(effectiveProviderId) ? null : (
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
                              trackCodingPlanBillingCycleSelect(platform, funnelContext, {
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
                            (trackCodingPlanBillingCycleSelect(platform, funnelContext, {
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
      {billingDiscountActive ? <BillingDiscountCard config={billingDiscountConfig} /> : null}
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
          <UnavailableProductButton providerId={providerId} buttonTestId={joinTestidParts(PERSONAL_PLAN_BUTTON_TESTID as unknown as string, group.key)} />
        ) : (
          <Button
            type={`button`}
            data-testid={joinTestidParts(PERSONAL_PLAN_BUTTON_TESTID as unknown as string, group.key)}
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
  const overseas = isZaiPlanProviderId(providerId);
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
  return isZaiPlanProviderId(providerId) ? `https://z.ai/subscribe` : `https://bigmodel.cn/glm-coding`;
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
  const overseas = isZaiPlanProviderId(providerId);
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
  return isZaiPlanProviderId(providerId) ? `Z.ai` : `BigModel`;
}

// Bnt → isBigmodelCodingPlanProvider（本地 88181）
function isBigmodelCodingPlanProvider(providerId: string) {
  return providerId === providerIds.bigmodelCodingPlan;
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
      ? !enterprise && providerId === providerIds.bigmodelCodingPlan
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
    ZCODE_ENV: RESOLVED_BUILD_ENV,
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
const LOGIN_URL = buildBigmodelApiUrl({ ZCODE_ENV: RESOLVED_BUILD_ENV }, `/login`);
const CONSOLE_URL_FOR_PURCHASE = codingPlanPersonalOverviewUrl({ ZCODE_ENV: RESOLVED_BUILD_ENV }); // Ynt
const SITE_URL_FOR_PURCHASE = codingPlanTeamPlansUrl({ ZCODE_ENV: RESOLVED_BUILD_ENV }); // rX

// iX → API_KEY_PROVIDER_ENTRIES（本地 88239）
const API_KEY_PROVIDER_ENTRIES = [
  {
    id: providerIds.zai,
    displayName: `Z.ai - API Key`,
    oauthProviderId: `zai`,
    apiKeyUrl: `https://z.ai/manage-apikey/apikey-list`,
  },
  {
    id: providerIds.bigmodel,
    displayName: `BigModel - API Key`,
    oauthProviderId: BIGMODEL_REGION_ID,
    apiKeyUrl: buildBigmodelApiUrl({ ZCODE_ENV: RESOLVED_BUILD_ENV }, `/apikey/platform`),
  },
  { id: providerIds.zapi, displayName: `ZAPI` },
];

// aX → API_KEY_PROVIDER_ENTRY_MAP（本地 88255）
const API_KEY_PROVIDER_ENTRY_MAP = new Map(API_KEY_PROVIDER_ENTRIES.map((entry) => [entry.id, entry]));

// oX → CODING_PLAN_PROVIDER_ENTRIES（本地 88256）
const CODING_PLAN_PROVIDER_ENTRIES = [
  {
    id: providerIds.zaiStartPlan,
    oauthProviderId: `zai`,
    label: `Z.ai - Coding Plan`,
    providerName: `Z.ai`,
    purchaseUrl: `https://z.ai/manage-apikey/subscription`,
  },
  {
    id: providerIds.zaiCodingPlan,
    oauthProviderId: `zai`,
    label: `Z.ai - Coding Plan`,
    providerName: `Z.ai`,
    purchaseUrl: `https://z.ai/manage-apikey/subscription`,
  },
  {
    id: providerIds.bigmodelCodingPlan,
    oauthProviderId: BIGMODEL_REGION_ID,
    label: `BigModel - Coding Plan`,
    providerName: `BigModel`,
    purchaseUrl: CONSOLE_URL_FOR_PURCHASE,
  },
  {
    id: providerIds.bigmodelStartPlan,
    oauthProviderId: BIGMODEL_REGION_ID,
    label: `BigModel- Coding Plan`,
    providerName: `BigModel`,
    purchaseUrl: CONSOLE_URL_FOR_PURCHASE,
  },
];

// 源 88289：模块装载期遗留的逗号表达式（无副作用，逐字保留）
(providerIds.zaiStartPlan, PLAN_DOMAINS.zcodePlanAnthropicBaseUrl, [...GLM_MODEL_IDS]);

// Xnt → KNOWN_PROVIDER_ENTRY_IDS（本地 88290）
const KNOWN_PROVIDER_ENTRY_IDS = new Set([
  ...API_KEY_PROVIDER_ENTRIES.map((entry) => entry.id),
  ...CODING_PLAN_PROVIDER_ENTRIES.map((entry) => entry.id),
]);

// Znt → providerDisplayNameOfEntry（本地 88291）
function providerDisplayNameOfEntry(entry: any) {
  return entry.id === providerIds.zai
    ? `Z.ai - API Key`
    : entry.id === providerIds.zaiCodingPlan || entry.id === providerIds.zaiStartPlan
      ? `Z.ai - Coding Plan`
      : entry.id === providerIds.bigmodelStartPlan
        ? `BigModel- Coding Plan`
        : entry.name;
}

// Qnt → isPresetEntryEnabled（本地 88301）
function isPresetEntryEnabled(entry: any) {
  return entry.presetId === providerIds.zapi ? entry.zapiEnabled : true;
}

// $nt → teamPlanSelectionOf（本地 88304）
function teamPlanSelectionOf(selectedKeys: any = {}) {
  const raw = selectedKeys.bigmodel?.trim() ?? ``;
  const parsed = parseCodingPlanScope(raw);
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
  const zaiCodingEntry = modelProviders.find((entry: any) => entry.id === providerIds.zaiCodingPlan);
  const zaiStartEntry = modelProviders.find((entry: any) => entry.id === providerIds.zaiStartPlan);
  const bigmodelCodingEntry = modelProviders.find((entry: any) => entry.id === providerIds.bigmodelCodingPlan);
  const bigmodelStartEntry = modelProviders.find((entry: any) => entry.id === providerIds.bigmodelStartPlan);
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
    preferredProviderId: zaiCodingEntryResolved?.id ?? providerIds.zaiCodingPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: entitlementCacheKeyOf({ providerId: providerIds.zaiCodingPlan, providerFingerprint: zaiCodingFingerprint }),
  });
  const bigmodelCodingSubscription = useEntitlementSubscription({
    enabled: bigmodelCodingEnabled,
    autoRefreshMode: autoRefreshMode,
    includeSubscription: true,
    preferredProviderId: bigmodelCodingEntryResolved?.id ?? providerIds.bigmodelCodingPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    organizationId: teamSelection?.organizationId,
    projectId: teamSelection?.projectId,
    cacheKey: entitlementCacheKeyOf({ providerId: providerIds.bigmodelCodingPlan, providerFingerprint: teamCacheKey || bigmodelCodingFingerprint }),
  });
  const zaiStartEnabled =
    !!zaiStartFingerprint &&
    shouldProbeStartPlanEntitlement({
      codingPlanProviderFingerprint: zaiCodingFingerprint,
      codingPlanProviderId: providerIds.zaiCodingPlan,
      codingPlanSnapshot: zaiCodingSubscription.snapshot,
      codingPlanLoading: zaiCodingSubscription.loading,
      codingPlanError: zaiCodingSubscription.error,
    });
  const bigmodelStartEnabled =
    !teamSelection &&
    !!bigmodelStartFingerprint &&
    shouldProbeStartPlanEntitlement({
      codingPlanProviderFingerprint: bigmodelCodingFingerprint,
      codingPlanProviderId: providerIds.bigmodelCodingPlan,
      codingPlanSnapshot: bigmodelCodingSubscription.snapshot,
      codingPlanLoading: bigmodelCodingSubscription.loading,
      codingPlanError: bigmodelCodingSubscription.error,
    });
  const zaiStartSubscription = useEntitlementSubscription({
    enabled: zaiStartEnabled,
    autoRefreshMode: autoRefreshMode,
    includeSubscription: true,
    preferredProviderId: zaiStartEntryResolved?.id ?? providerIds.zaiStartPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: entitlementCacheKeyOf({ providerId: providerIds.zaiStartPlan, providerFingerprint: zaiStartFingerprint }),
  });
  const bigmodelStartSubscription = useEntitlementSubscription({
    enabled: bigmodelStartEnabled,
    autoRefreshMode: autoRefreshMode,
    includeSubscription: true,
    preferredProviderId: bigmodelStartEntryResolved?.id ?? providerIds.bigmodelStartPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: entitlementCacheKeyOf({ providerId: providerIds.bigmodelStartPlan, providerFingerprint: bigmodelStartFingerprint }),
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
      [providerIds.zaiCodingPlan, providerIds.zaiStartPlan, providerIds.bigmodelCodingPlan, providerIds.bigmodelStartPlan]
        .flatMap((id: string) => {
          const part =
            id === providerIds.zaiCodingPlan
              ? zaiCodingFingerprint
              : id === providerIds.zaiStartPlan
                ? zaiStartEnabled
                  ? zaiStartFingerprint
                  : ``
                : id === providerIds.bigmodelCodingPlan
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
        [providerIds.zaiCodingPlan]: { snapshot: zaiCodingSubscription.snapshot, loading: zaiCodingSubscription.loading, error: zaiCodingSubscription.error },
        [providerIds.zaiStartPlan]: {
          snapshot: zaiStartEnabled ? zaiStartSubscription.snapshot : null,
          loading: zaiStartEnabled ? zaiStartSubscription.loading : false,
          error: zaiStartEnabled ? zaiStartSubscription.error : null,
        },
        [providerIds.bigmodelCodingPlan]: { snapshot: bigmodelCodingSubscription.snapshot, loading: bigmodelCodingSubscription.loading, error: bigmodelCodingSubscription.error },
        [providerIds.bigmodelStartPlan]: {
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
  const kinds = listProviderModelIds(provider);
  const hasFormatEndpoint = kinds.some((kind: any) =>
    resolveModelSupportedKinds({ provider: provider, modelName: kind }).some((format: any) => {
      const normalized = mapModelFormatToKind(format);
      return normalized ? resolveProviderKindEndpointUrl(provider, normalized).length > 0 : false;
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
    if (item.presetId === providerIds.zapi) return <ZapiProviderIcon className={`size-4 shrink-0`} />;
    const oauthProviderId = oauthProviderIdOfEntry(item.presetId);
    return oauthProviderId ? <RegionLogo region={oauthProviderId} className={`size-4`} /> : <GenericProviderIcon className={`size-4 shrink-0`} />; // A1-R21：providerLogoOf declare 改指（Tq 76183，组件形）
  }
  return item.type === `codingPlanLoading` && item.oauthProviderId
    ? <RegionLogo region={item.oauthProviderId} className={`size-4`} /> // A1-R21：同上
    : <GenericProviderIcon className={`size-4 shrink-0`} />;
}

// lrt → codingPlanEntryStatusOf（本地 88501）
function codingPlanEntryStatusOf({ provider, entitlement, modelProvidersLoading }: any) {
  const zaiCoding = !!(provider && isZaiPlanProviderId(provider.id));
  const ready = !!(provider && (isCustomProviderReady(provider) || (zaiCoding && listEndpointKinds(provider.endpoints).length > 0 && provider.models.length > 0))); // 〔A1-R31〕Sr 收敛：参改 provider.endpoints（yu 真身签名，见 @166 墓碑）
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
    if (!isStartPlanProviderId(item.presetId)) return true;
    const family = getOAuthProviderFamilyByProviderId(item.presetId) as FamilySpec | null; // 〔A1-R29〕型缝：同上（原 declare 契据窄化）
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
  const anchor = items.find((item: any) => item.presetId === providerIds.bigmodelCodingPlan);
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
      const organizationLabel = teamSourceOrganizationLabel({
        ...product,
        organizationName: project.organizationName ?? product.organizationName,
        projectName: project.projectName ?? product.projectName,
      });
      if (!organizationLabel) return [];
      const unavailable = project.apiKeyStatus === `unavailable`;
      return [
        {
          ...anchor,
          key: buildCodingPlanScope({ productId: product.productId, organizationId: organizationId, projectId: projectId }),
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

// ── tombstone〔A1-R28〕：teamPlanOrganizationOf（原 prt，88764–88766 `return Lq(e)`）删除——树内零消费
//    （负证据在案；唯一 bundle 消费 88723 ≡ 本文件 frt@9648 已为同体内联调用）。死码删除按 R25 nWe 判例。 ──

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
  const snapshot = entitlements[providerIds.bigmodelCodingPlan]?.snapshot ?? null;
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
      key: buildCodingPlanScope({ productId: productId, organizationId: organizationId, projectId: projectId }),
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
  const parsed = parseCodingPlanScope(selectedTeamPlanKey);
  if (!parsed?.organizationId || !parsed.projectId) return [];
  const planName = codingPlanItem.planLevel?.trim() || `Team`;
  return [
    {
      ...codingPlanItem,
      key: buildCodingPlanScope({ productId: parsed.productId, organizationId: parsed.organizationId, projectId: parsed.projectId }),
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
  const parsed = parseCodingPlanScope(item.key);
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
    [providerIds.zaiCodingPlan]: provider === `zai` && !!zaiToken?.trim(),
    [providerIds.zaiStartPlan]: provider === `zai` && !!zaiToken?.trim(),
    [providerIds.bigmodelCodingPlan]: provider === `bigmodel` && !!bigmodelToken?.trim(),
    [providerIds.bigmodelStartPlan]: provider === `bigmodel` && !!bigmodelToken?.trim(),
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
  return providerId === providerIds.zaiCodingPlan || providerId === providerIds.zaiStartPlan ? `zai` : BIGMODEL_REGION_ID;
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
  const { modelProviders, loading, refresh } = useModelProvidersStore(); // 〔A1-R35〕qq declare 收敛改指（≡ bundle 88902；真身本文件 §11 尾部）
  const { entitlements, refresh: refreshEntitlements } = useCodingPlanEntitlements({ modelProviders: modelProviders, loading: loading });
  const [authStates, setAuthStates] = React.useState<Record<string, string>>({});
  const [productsRefreshToken, setProductsRefreshToken] = React.useState(0);
  const lastSuccessSeqRef = React.useRef(oauthSuccessSeq);
  const attemptSeqRef = React.useRef(0);
  const pendingLoginRef = React.useRef<any>(null);
  const providerId = codingPlanProviderIdOfTarget(target?.providerId);
  const productsProviderId = providerId ? codingPlanProviderOfStart(providerId) : null;
  const enterpriseProducts = useEnterpriseCodingPlanProducts({ enabled: !!target && productsProviderId === providerIds.bigmodelCodingPlan, authenticated: true });
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
          productsProviderId === providerIds.bigmodelCodingPlan ? () => enterpriseProducts.refresh({ force: true }) : undefined,
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

// fX → useCodingPlanUpgradeDialog（js 89100；A1-R24 行漂校正，旧注「本地 89153」为漂移）
// 〔A1-R23〕补 export：Home declare useCodingPlanUpgradeDialog 收敛（原 fX，js 89100；消费面 Home §U.10
// ComposerConfigToolbarBody 4243 ≡ bundle 89522），经 modules/PaymentDeep shim 再导出；环安全：函数声明
// 提升，调用在渲染期（bundle 本同模块）。
export function useCodingPlanUpgradeDialog() {
  const context = React.useContext(CodingPlanUpgradeDialogContext);
  if (!context)
    throw Error(`useCodingPlanUpgradeDialog must be used within CodingPlanUpgradeDialogProvider`);
  return context;
}

// Art → useCodingPlanUpgradeDialogOptional（js 89106；A1-R24 行号校正，旧注「本地 89159」为漂移）
// 〔A1-R24〕补 export：Home declare useUpgradeActions 收敛（bundle Art 89106 唯一真身；消费面 91644
// ≡ Home OffPeakNewTaskBanner；119444 面属 R0 ConversationPane 119219 未重建，留批），经 modules/PaymentDeep shim 再导出
export function useCodingPlanUpgradeDialogOptional() {
  return React.useContext(CodingPlanUpgradeDialogContext);
}

/* ----------------------------------------------------------------------------
 * §9 tombstone（A1-R23 · j3e 叠层专项：iit/Xrt 死簇 + 依赖闭包删除，R21 模式）：
 *    删除 33 件（A0 语义重建形；全树零消费死代码，负证据：grep 全树仅定义与簇内互引，无外部消费；
 *    bundle 各符消费面均在 iit/Xrt composer 工具条域，树内逐字对应全在 Home）：
 *    pX planSourceOptionsOf | jrt teamSourceOptionsOf | Mrt resolvePurchaseAudience（零消费）|
 *    mX teamSourceIdMatches | Nrt teamSourceLabelOf | Prt SIDEBAR_CODING_PLAN_PROVIDER_PREFERENCE_KEY 89186 |
 *    Frt SIDEBAR_CODING_PLAN_PROVIDER_IDS 89187 | hX eligibleSidebarCodingPlanProviders 89188 |
 *    Irt sidebarPreferenceStorageOf 89195 | Lrt writeSidebarCodingPlanProviderPreference 89208 |
 *    Rrt modelEntryMatchesValue 89219 | zrt thoughtOptionOfModel 89222（bundle 197021 消费面树内归属留批）|
 *    Brt currentOptionValueOf 89242 | Vrt projectionConfigOfOptions 89246 | Hrt configMatchesModel 89260 |
 *    Urt resolveEffectiveConfig 89263 | Wrt draftThoughtOptionOfModel 89291 | Grt resolvedThoughtLevelOf 89292 |
 *    Krt defaultModeOf 89303 | qrt ModePickerTrigger 89306 | Jrt noopToolbarAction 89341 |
 *    Yrt MODE_TRIGGER_SELECTOR 89342 | Xrt SessionModePicker 89343 | Zrt SessionModePickerMemo 89415 |
 *    Qrt MODEL_FOCUS_SELECTOR 89416 | $rt noopSessionModeCycle 89417 | eit providerFamilyKindOf 89418 |
 *    tit purchaseAudienceStateOf 89438 | nit teamSourceOfEntitlementSnapshot 89469 |
 *    rit resolveTeamSourceSelection 89490 | iit SessionModelToolbar 89503 | ait SessionModelToolbarMemo 89978 |
 *    oit diffValueOf 89979（bundle 90293 消费面树内归属留批，树内暂无逐字真身）
 *    真身归属（Home 逐字族，机械校验器在证）：
 *    iit/ait → §U.10 ComposerConfigToolbarBody/ComposerConfigToolbar（消费面 Home 6445 ≡ bundle 90971）；
 *    Xrt/Zrt → §T ComposerModeToolbarBody/ComposerModeToolbar（消费面 Home 6532 ≡ bundle 91036）；
 *    qrt/Jrt/Yrt/Qrt/$rt → §T ComposerModeTrigger/composerToolbarShortcutNoop/COMPOSER_INPUT_FOCUS_SELECTOR/
 *    COMPOSER_MODE_TRIGGER_FOCUS_SELECTOR/composerSessionModeCycleNoop；
 *    Rrt/zrt/Wrt/Brt/Vrt/Hrt/Urt/Grt → §U.9 modelCatalogEntryMatchesModelId/buildThoughtLevelOptionFromCatalog/
 *    buildThoughtLevelOptionForDraft/readConfigOptionCurrentValue/projectDraftConfigFromOptions/
 *    configMatchesProviderModel/resolveDraftEffectiveConfig/resolveEffectiveThoughtLevel；
 *    Krt → §T getLastDraftCollaborationMode 89303（消费面 Home 3186 ≡ bundle 89366）；
 *    pX/jrt/mX/Nrt/hX/Irt/Lrt/eit/tit/nit/rit → §U.9 listCodingPlanAudienceSources/teamSourcesFromSubscribedProducts/
 *    codingPlanSourceIdsMatch/teamSourceDisplayName/listConfiguredCodingPlanProviders/
 *    getSidebarUsagePreferenceStorage/writeSidebarUsageCodingPlanProviderPreference/
 *    classifyCodingPlanProviderId/resolveCodingPlanFamilySelection/teamSourceFromEntitlementSnapshot/
 *    resolveSelectedTeamSource。
 *    保留：krt CodingPlanUpgradeDialogProvider / dX context / Ort 对话框（AppRootLeaves 1912 活消费）+
 *    fX useCodingPlanUpgradeDialog（本批补 export，Home fX declare 收敛，见下）+
 *    Art useCodingPlanUpgradeDialogOptional（bundle 91644/119444 消费面树内归属留批）。 ────────── */

/* ── tombstone（A1-R22）：sit/cit 本地副本删除（原 accessibleLabelOf/elementDescriptorOf，A0 语义重建形；
 *    唯一消费面 §10 chip 副本同批删除）。真身 sit 89982 / cit 89985 逐字 canonical =
 *    modules/Composer.tsx [B17] webElementAccessibleLabel/webElementDescriptor。 ── */

/* ── tombstone（A1-R22）：§10 lit/uit 本地副本删除（原 WebElementsChip/SelectionsChip，
 *    A0 语义重建形，非逐字；本文件内零消费面 = 死代码，负证据：grep 全文件仅定义无调用）。
 *    真身归属裁定：bundle 唯一真身 lit 89989 / uit 90087（+sit 89982 / cit 89985 / Ds 2827），
 *    消费面 = composer topContent（90782/90789）+ 用户消息行（112242/112244），
 *    逐字 canonical 收归 modules/Composer.tsx [B17]（本批转录并补 export）。
 *    原「pay_range 13378–13568 / F08 Home 族双归属」登记作废（区域实为 composer 域 89982–90178）。 ── */

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → 本机 js 行；A 段 76612–90179 全量）
 * ============================================================================
 *  §1 上下文用量弹层（76612–76843）：〔A1-R23〕y3e/Aq/b3e/x3e/S3e/C3e/w3e/T3e/E3e/D3e/O3e/k3e/A3e/j3e
 *   副本族删除 → 逐字 canonical Home §V.6/§V.7（runActionAndClose…CodingPlanUsageToolbar）；见 §1 墓碑
 *  §2 工具条配置选择（76844–77061）：
 *   M3e → isOptionValuePresent 76844 | N3e → FULL_ACCESS_MODES 76847 | P3e → categoryTestidOf 76848
 *   F3e → optionTestidOf 76852 | I3e → ApiRetryStatusChip 76856 | L3e → modeOptionLabelOf 76874
 *   R3e → modeLabelKeyOf 76877 | z3e → modeDescriptionKeyOf 76880 | jq → optionLabelOf 76883
 *   B3e → optionDescriptionOf 76886 | V3e → isFullAccessMode 76892 | H3e → modeIconOf 76895
 *   Mq → ConfigSelect 76912
 *  §3 思考级别机制（77127–77451）：
 *   Nq → normalizeOptionKey 77127 | K3e → isThoughtOffOption 77130 | q3e → thoughtRankOf 77133
 *   J3e → sortThoughtOptions 77141 | Y3e → nextThoughtLevelValue 77153 | X3e → thoughtOptionLabelOf 77160
 *   （以上 A0-S2d 去重 → canonical Composer.tsx）
 *   〔A1-R23〕Pq ThoughtLevelControl / Fq shortcutKeyOfCategory / Z3e nextSelectValue /
 *   Q3e resolveToolbarShortcut / $3e useToolbarShortcuts 副本删除 → 逐字 canonical
 *   Home §U.2 ComposerThoughtToolbar + §T 快捷键族；见 §3 墓碑
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
 *   fX → useCodingPlanUpgradeDialog（〔A1-R23〕补 export，Home declare 收敛）| Art → useCodingPlanUpgradeDialogOptional
 *   〔A1-R23〕pX/jrt/Mrt/mX/Nrt/Prt/Frt/hX/Irt/Lrt/Rrt/zrt/Brt/Vrt/Hrt/Urt/Wrt/Grt/Krt/qrt/Jrt/Yrt/Xrt/
 *   Zrt/Qrt/$rt/eit/tit/nit/rit/iit/ait/oit 33 件副本删除（iit/Xrt 死簇 + 依赖闭包）→ 逐字 canonical
 *   Home §T/§U（ComposerModeToolbar/ComposerConfigToolbar/§U.9 助手族等）；见 §9 墓碑
 *  §10 上下文芯片（89989–90179）：〔A1-R22〕lit/uit/sit/cit/Ds 副本删除 → 逐字 canonical
 *   modules/Composer.tsx [B17]（lit→WebElementsChip / uit→SelectionsChip / Ds→守护）；见墓碑
 *  排除（只注记）：77062–77126 U3e/W3e/G3e（F08）| 78456–79690 qrcode vendored
 *   | 80955–81731 Stripe vendored | 90180–90227 dit/fit/pit/mit（Home.tsx）
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
 * §11 useModelProvidersStore hook 族（A1-R35 主攻：PD §4 hook 域转录批）
 * ----------------------------------------------------------------------------
 * 来源：styles-CdEGpc2x.js 78119-78403（bundle 唯一真身）。尾部安置以保本文件
 * 行引用零漂（文件内绝对行注记 >1366 处在案，中段插入不可行）。
 * 混淆名 → 语义名 映射表（行号 = bundle 行）：
 *   e8e → dedupeWorkspaceTargets (78119-78128)
 *   t8e → syncProviderRegistryToAgentWorkspaces (78129-78171)
 *   n8e → ENDPOINT_SUGGESTIONS_FALLBACK (78172) | Wq → displayOrderSnapshot (78173)
 *   r8e → displayOrderHydrated (78174) | Gq → displayOrderListeners (78175)
 *   Kq → publishDisplayOrder (78176-78179) | i8e → subscribeDisplayOrder (78180-78188)
 *   a8e → needsProvidersHydration (78189-78191) | o8e → saveProviderToRegistry (78192-78219)
 *   s8e → resolveWorkspaceSyncTargets (78220-78242)
 *   qq → useModelProvidersStore (78243-78403 / jsx 69033；本族唯一导出面)
 * 接口级（declare 层，真身链未闭合留批）：
 *   pc ≡ useTabStoreSelector（Home@341/AppRootLeaves@163 declare 先例）
 *   oc → isWorkspaceTab (4487-4489) | gc → resolveTabSessionId (4814-4821)
 *   co → useShallowSelector (1033-1039；〔A1-R36〕真身链 wie/ao/oo/so/Cie 逐字转录 §12 尾部，留批闭合)
 * 横切改指（树内实体）：
 *   Ti ≡ automationsWorkspaceKey（SrcSharedB@3079）| Ks ≡ syncProviderRegistryAndReturn（services@105 转导出）
 *   Ng ≡ settingsConfigOptionsOf（modules/SettingsConfigOptions，R34 新叶；78157 消费面接引，R34 留批 2 闭合）
 *   $6e ≡ reconcileConfigOptionsModel@1333（本文件；R33 定形勘误在案）| B6e ≡ providersDiffer@1179（本文件）
 *   J ≡ logger（SkillStore@186 转导出）| Ec ≡ useBaseServices（styles-local 4945）
 *   Zs ≡ useSessionRegistryStore（styles-local 4357）| xe ≡ useTaskStore（SkillStore@247 转导出）
 *   fM/pM/mM/hM/gM/_M ≡ UsageDeep@1404-1476 注册表六件（R34 墓碑改指面，本批首次实消费；
 *   注册表簇 PD-local 面接引，R34 留批 3 闭合）
 * 模块态四符（n8e/Wq/r8e/Gq）走语义归一（R34 注册表簇先例），不入逐字段段。
 * -------------------------------------------------------------------------- */
import { settingsConfigOptionsOf } from '../../modules/SettingsConfigOptions'; // 〔A1-R35〕Ng 真身（R34 实体化新叶，styles 24440-24494 逐字）：t8e 转录面 78157 消费接引（R34 留批 2 闭合）。尾部 import：ES 模块提升，等价文件头，行引用零漂

declare function useTabStoreSelector(selector: (state: any) => any): any; // 原 pc（接口级；Home@341/AppRootLeaves@163 同名 declare 先例）
declare function isWorkspaceTab(tab: any): boolean; // 原 oc（4487-4489：kind === `workspace`）
declare function resolveTabSessionId(tab: any, ctx: any): string | undefined; // 原 gc（4814-4821：remoteSessionId/identity/path 三路查表）
/* ── tombstone〔A1-R36〕：declare useShallowSelector（原 co，1033-1039）删除 → 逐字转录本文件尾部 §12（含真身链 wie/ao/oo/so/Cie 五符，R35 留批闭合；§11 qq 消费面不变）。 ── */

/** 展示序模块态（78172-78175；语义归一，R34 注册表簇先例）：原 n8e/Wq/r8e/Gq */
let ENDPOINT_SUGGESTIONS_FALLBACK: Record<string, string[]> = { anthropic: [], openai: [], gemini: [] };
let displayOrderSnapshot: { providerIds: string[]; updatedAt: number } = { providerIds: [], updatedAt: 0 };
let displayOrderHydrated = !1;
let displayOrderListeners = new Set<any>();

/** 原 e8e（78119-78128）：按 workspace 键去重同步目标 */
function dedupeWorkspaceTargets(e: any) {
  let t = new Set(),
    n = [];
  for (let r of e) {
    if (!r.workspacePath.trim()) continue;
    let e = automationsWorkspaceKey(r);
    t.has(e) || (t.add(e), n.push(r));
  }
  return n;
}
/** 原 t8e（78129-78171）：provider registry 回填各 agent workspace 的 configOptions */
async function syncProviderRegistryToAgentWorkspaces(e: any) {
  let t = dedupeWorkspaceTargets(e.targets);
  for (let n of t) {
    let t = e.zcodeSessionStore.getWorkspaceState(
      n.workspacePath,
      n.workspaceIdentity,
    ).selectedProvider;
    try {
      let r = await syncProviderRegistryAndReturn({
        workspacePath: n.workspacePath,
        workspaceIdentity: n.workspaceIdentity,
        remoteSessionId: n.remoteSessionId,
        localModelProviderService: e.modelProviderService,
        remoteZCodeSessionService: n.zcodeSessionService ?? e.zcodeSessionService,
        force: !0,
        includeWorkspaceState: !0,
        runtimePolicy: `existing-only`,
      });
      if (r.status === `runtime-unavailable`) continue;
      let i = r.workspaceState as any;
      if (!i) continue;
      let a = e.zcodeSessionStore.getWorkspaceState(n.workspacePath, n.workspaceIdentity);
      if (a.selectedProvider !== t) {
        logger.info(
          `[useModelProviders] 丢弃过期 provider registry 回填 workspace=${n.workspacePath} provider=${t} currentProvider=${a.selectedProvider}`,
        );
        continue;
      }
      let o = settingsConfigOptionsOf(i.settings),
        s = reconcileConfigOptionsModel(a.configOptions ?? [], o, t);
      (e.zcodeSessionStore.setConfigOptions(n.workspacePath, s, n.workspaceIdentity),
        e.zcodeSessionStore.setConfigOptionsStatus(n.workspacePath, `ready`, n.workspaceIdentity),
        logger.info(
          `[useModelProviders] provider registry 已同步到 agent workspace=${n.workspacePath} revision=${r.appliedProviderRegistryRevision} providers=${r.providerCount}`,
        ));
    } catch (e) {
      logger.warn(
        `[useModelProviders] 同步 provider registry 到 agent 失败 workspace=${n.workspacePath}`,
        e,
      );
    }
  }
}
/** 原 Kq（78176-78179）：发布展示序 */
function publishDisplayOrder(e: any) {
  ((displayOrderSnapshot = e), (displayOrderHydrated = !0));
  for (let t of displayOrderListeners) t(e);
}
/** 原 i8e（78180-78188）：订阅展示序（即回当前值 + 退订闭包） */
function subscribeDisplayOrder(e: any) {
  return (
    displayOrderListeners.add(e),
    e(displayOrderSnapshot),
    () => {
      displayOrderListeners.delete(e);
    }
  );
}
/** 原 a8e（78189-78191）：需水合判定 */
function needsProvidersHydration(e: any) {
  return !e.snapshotHydrated;
}
/** 原 o8e（78192-78219）：保存供应商（乐观注册表写入 + 后台同步守卫） */
async function saveProviderToRegistry(e: any) {
  let t = listCodingPlanSources(),
    n = t.find((t: any) => t.id === e.provider.id) ?? null,
    r = t.findIndex((t: any) => t.id === e.provider.id),
    i = [...t];
  if (
    (r >= 0 ? (i[r] = e.provider) : i.push(e.provider),
    setCodingPlanSources(i, { invalidateInFlightRefresh: !0 }),
    await e.modelProviderService.save(e.provider),
    providersDiffer(n, e.provider))
  )
    try {
      let t = e.scheduleRuntimeSync();
      t &&
        typeof t.catch == `function` &&
        t.catch((t: any) => {
          logger.warn(`[useModelProviders] 后台同步模型供应商到当前 agent 失败`, {
            providerId: e.provider.id,
            error: t,
          });
        });
    } catch (t) {
      logger.warn(`[useModelProviders] 启动模型供应商后台同步失败`, {
        providerId: e.provider.id,
        error: t,
      });
    }
}
/** 原 s8e（78220-78242）：自 tabs 收集同步目标 */
function resolveWorkspaceSyncTargets(e: any) {
  let t = [];
  for (let n of e.tabs) {
    if (!isWorkspaceTab(n)) continue;
    let r = resolveTabSessionId(n, e);
    if (n.remoteSessionId || n.workspaceIdentity || n.remoteTarget) {
      if (!r) continue;
      t.push({
        workspacePath: n.workspacePath,
        workspaceIdentity: n.workspaceIdentity,
        remoteSessionId: r,
        zcodeSessionService: e.sessionsById[r].services.zcodeSessionService,
      });
      continue;
    }
    t.push({
      workspacePath: n.workspacePath,
      workspaceIdentity: n.workspaceIdentity,
      zcodeSessionService: e.baseZCodeSessionService,
    });
  }
  return t;
}
/** 原 qq（78243-78403 / jsx 69033）：模型供应商 store hook（注册表读写 + 展示序 + 保存/删除/同步） */
export function useModelProvidersStore() {
  let { modelProviderService: e, zcodeSessionService: t } = useBaseServices() as any,
    n = useSessionRegistryStore(
      useShallowSelector((e: any) => ({
        sessionIdByWorkspaceIdentity: e.sessionIdByWorkspaceIdentity,
        sessionIdByWorkspacePath: e.sessionIdByWorkspacePath,
        sessionsById: e.sessionsById,
      })),
    ),
    r = useTabStoreSelector((e: any) => e.tabs),
    [i, a] = (0, React.useState)(() => listCodingPlanSources()),
    [o, s] = (0, React.useState)(() => displayOrderSnapshot),
    [c, l] = (0, React.useState)(() => !hasLoadedCodingPlanSources()),
    [u, d] = (0, React.useState)(!1),
    f = (0, React.useRef)(0),
    p = (0, React.useCallback)(async () => {
      let t = needsProvidersHydration({ snapshotHydrated: hasLoadedCodingPlanSources() });
      t && l(!0);
      let n = f.current + 1;
      ((f.current = n), d(!0));
      try {
        if (t)
          try {
            await ensureCodingPlanSources(() => e.getAllCached());
          } catch (e) {
            logger.warn(`[useModelProviders] 本地模型供应商缓存读取失败，继续远端刷新`, e);
          } finally {
            l(!1);
          }
        await refreshCodingPlanSourcesForced(() => e.getAll());
      } catch (e) {
        logger.error(`[useModelProviders] 加载模型供应商失败`, e);
      } finally {
        (t && !hasLoadedCodingPlanSources() && l(!1), n === f.current && d(!1));
      }
    }, [e]);
  return (
    (0, React.useEffect)(() => {
      let e = subscribeCodingPlanSources((e: any) => {
        (a(e), l(!1));
      });
      return (hasLoadedCodingPlanSources() || p(), e);
    }, [p]),
    (0, React.useEffect)(() => {
      let t = subscribeDisplayOrder(s);
      return (
        displayOrderHydrated ||
          e
            .getDisplayOrder()
            .then(publishDisplayOrder)
            .catch((e: any) => {
              logger.warn(`[useModelProviders] 加载模型供应商展示顺序失败`, e);
            }),
        t
      );
    }, [e]),
    {
      modelProviders: i,
      displayOrder: o,
      loading: c,
      refreshing: u,
      refresh: p,
      saveProvider: (0, React.useCallback)(
        async (i: any) => {
          await saveProviderToRegistry({
            provider: i,
            modelProviderService: e,
            scheduleRuntimeSync: async () => {
              let a = resolveWorkspaceSyncTargets({ tabs: r, baseZCodeSessionService: t, ...n });
              (await syncProviderRegistryToAgentWorkspaces({
                targets: a,
                modelProviderService: e,
                zcodeSessionService: t,
                zcodeSessionStore: useTaskStore.getState(),
              }),
                await Promise.allSettled(
                  a.map(
                    async ({
                      remoteSessionId: n,
                      workspaceIdentity: r,
                      workspacePath: a,
                      zcodeSessionService: o,
                    }) => {
                      try {
                        await syncProviderRegistryAndReturn({
                          workspacePath: a,
                          workspaceIdentity: r,
                          remoteSessionId: n,
                          localModelProviderService: e,
                          remoteZCodeSessionService: o ?? t,
                          runtimePolicy: `existing-only`,
                        });
                      } catch (e) {
                        logger.warn(`[useModelProviders] 同步模型供应商到当前 agent 失败`, {
                          workspacePath: a,
                          workspaceIdentity: r ?? null,
                          providerId: i.id,
                          error: e,
                        });
                      }
                    },
                  ),
                ));
            },
          });
        },
        [e, n, r, t],
      ),
      deleteProvider: (0, React.useCallback)(
        async (i: any) => {
          (setCodingPlanSources(
            listCodingPlanSources().filter((e: any) => e.id !== i),
            { invalidateInFlightRefresh: !0 },
          ),
            await e.delete(i),
            await syncProviderRegistryToAgentWorkspaces({
              targets: resolveWorkspaceSyncTargets({ tabs: r, baseZCodeSessionService: t, ...n }),
              modelProviderService: e,
              zcodeSessionService: t,
              zcodeSessionStore: useTaskStore.getState(),
            }));
        },
        [e, n, r, t],
      ),
      saveDisplayOrder: (0, React.useCallback)(
        async (t: any) => {
          let n = {
              providerIds: [...new Set(t.providerIds.map((e: any) => e.trim()).filter(Boolean))],
              updatedAt: t.updatedAt,
            },
            r = displayOrderSnapshot;
          publishDisplayOrder(n);
          try {
            await e.saveDisplayOrder(n);
          } catch (e) {
            throw (publishDisplayOrder(r), logger.warn(`[useModelProviders] 保存模型供应商展示顺序失败`, e), e);
          }
        },
        [e],
      ),
      getEndpointSuggestions: (0, React.useCallback)(async () => {
        try {
          return await e.getEndpointSuggestions();
        } catch (e) {
          return (logger.error(`[useModelProviders] 加载 endpoint 建议失败`, e), ENDPOINT_SUGGESTIONS_FALLBACK);
        }
      }, [e]),
      getModelsByEndpoint: (0, React.useCallback)(
        async (t: any) => {
          try {
            return await e.getModelsByEndpoint(t);
          } catch (e) {
            return (logger.error(`[useModelProviders] 按 endpoint 加载模型列表失败`, e), []);
          }
        },
        [e],
      ),
      testModelConnectivity: (0, React.useCallback)(async (t: any) => e.testModelConnectivity(t), [e]),
    }
  );
}

/* ----------------------------------------------------------------------------
 * §12 co 浅比较选择器工厂真身链（A1-R36：R35 接口级 useShallowSelector 闭合）
 * ----------------------------------------------------------------------------
 * 来源：styles-CdEGpc2x.js 998-1039（bundle 唯一真身）。尾部安置，行引用零漂。
 * 混淆名 → 语义名 映射表（行号 = bundle 行）：
 *   ao → isIterableValue (998) | oo → hasEntriesMember (999)
 *   so → entriesMapsEqual (1000-1006) | Cie → iterableSequencesEqual (1007-1017)
 *   wie → shallowObjectEqual (1018-1032) | co → useShallowSelector (1033-1039)
 * 消费面实测：ao/oo/so/Cie 仅簇内互消费（1027-1031）；wie 唯一消费 1037（co 内）；
 *   co 消费 9 处——78246（qq ≡ 本文件 §11）为本树接引面；余 63494/63523/63684/63713
 *   （settings 域）/78441（相位刷新族）/132376/181126/186147（他域）留批。
 * -------------------------------------------------------------------------- */
/** 原 ao（998）：可迭代判定 */
const isIterableValue = (e: any) => Symbol.iterator in e;
/** 原 oo（999）：entries 成员判定 */
const hasEntriesMember = (e: any) => `entries` in e;
/** 原 so（1000-1006）：Map/entries 逐项相等 */
const entriesMapsEqual = (e: any, t: any) => {
  let n = e instanceof Map ? e : new Map(e.entries()),
    r = t instanceof Map ? t : new Map(t.entries());
  if (n.size !== r.size) return !1;
  for (let [e, t] of n) if (!r.has(e) || !Object.is(t, r.get(e))) return !1;
  return !0;
};
/** 原 Cie（1007-1017）：迭代器序列逐项相等 */
const iterableSequencesEqual = (e: any, t: any) => {
  let n = e[Symbol.iterator](),
    r = t[Symbol.iterator](),
    i = n.next(),
    a = r.next();
  for (; !i.done && !a.done;) {
    if (!Object.is(i.value, a.value)) return !1;
    ((i = n.next()), (a = r.next()));
  }
  return !!i.done && !!a.done;
};
/** 原 wie（1018-1032）：浅比较（Object.is → 原型同 → iterable/entries 分支） */
function shallowObjectEqual(e: any, t: any) {
  return Object.is(e, t)
    ? !0
    : typeof e != `object` ||
        !e ||
        typeof t != `object` ||
        !t ||
        Object.getPrototypeOf(e) !== Object.getPrototypeOf(t)
      ? !1
      : isIterableValue(e) && isIterableValue(t)
        ? hasEntriesMember(e) && hasEntriesMember(t)
          ? entriesMapsEqual(e, t)
          : iterableSequencesEqual(e, t)
        : entriesMapsEqual({ entries: () => Object.entries(e) }, { entries: () => Object.entries(t) });
}
/** 原 co（1033-1039）：useRef 浅比较选择器工厂（§11 qq 消费） */
function useShallowSelector(e: any) {
  let t = React.useRef(void 0);
  return (n: any) => {
    let r = e(n);
    return shallowObjectEqual(t.current, r) ? t.current : (t.current = r);
  };
}
