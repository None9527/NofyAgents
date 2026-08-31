// A1-P1 批 2：XCt 配额块闭包逐字转录（R0 簇卫星域续批）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 映射表（minified → 语义名 → bundle 行）：
//   xNe  → QUOTA_GENERIC_ERROR_CODES        40503
//   SNe  → resolveServerQuotaExhaustedCode  40504–40516（XCt 119105 消费）
//   CNe/wNe/TNe/ENe → CONCURRENT_GENERIC_ERROR_CODES / CONCURRENT_LIMIT_KEYWORDS / MODEL_LIMIT_KEYWORDS / PROVIDER_LIMITED_CODES  40517–40539
//   DNe  → resolveServerConcurrentLimitCode 40540–40548（XCt 119106 消费）
//   ONe  → resolveProviderLimitedCode       40549–40552（XCt 119107 消费）
//   kNe  → concurrentLimitReasonOfMessage   40553–40558（XCt 119130 消费）
//   N0   → normalizeQuotaText               118873–118875
//   FCt  → matchesQuotaWord                 118876–118878
//   P0   → isEnterpriseOrTeamLevel          118879–118882
//   F0   → isMaxLevel                       118883–118885
//   ICt  → hasEnterpriseOrTeamEntitlement   118886–118896（XCt 119175 消费）
//   LCt  → hasMaxLevelEntitlement           118897–118907（XCt 119176 消费）
//   RCt  → HIDDEN_QUOTA_BANNER_STATE        118908–118921
//   zCt  → isPlanFamilyProvider             118922–118931（I0 119009 消费；与 JCt 同形双定义，bundle 两独立真身均逐字保留）
//   BCt  → normalizeModelCode               118932–118934
//   VCt  → quotaLimitMatchesModelCode       118935–118938
//   HCt  → limitRemainingRatio              118939–118945
//   UCt  → snapshotRemainingRatio           118946–118953
//   WCt  → ratioToPercent                   118954–118956
//   GCt  → quotaKindOfRatio                 118957–118971
//   KCt  → extractBracketedBusinessMessage  118972–118977
//   I0   → resolveQuotaAssertion            118978–119068（XCt 119123 + parity 212458/212460 消费）
//   L0   → quotaDismissKey                  119069–119084（XCt 119136 + parity 212486 消费）
//   XCt  → useSessionQuotaViewModel         119101–119190（R0 120941 消费；modules/Conversation D8 消费面改指）
// 跨 chunk：Bn = styles 533 `No as Bn` ← src 9764 `yl as No` ← yl@src4756 ≡ SrcSharedA isStartPlanProviderId。
// eM 改指：bundle 52500 唯一真身 ≡ components/usage/UsageDeep useUsageEntitlementCore（A0 canonical，1167；属主已在树 → 改指收敛）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝带〔A1-P1-B2〕注释。
// 环安全：本叶 → SrcSharedA / modules/UsageDeep(shim) / ConversationPaneHelpers / SessionBanners(型)；
//   UsageDeep 依赖面（QuickPick/Settings/ImeComposition/MarkdownIntegration/PaymentDeep/SkillStore/SrcSharedA/B/services/stores-core/UtilsCn/I18n/button/UsageStatsUiParts）
//   全不反引 modules/Conversation 与 components/conversation（grep 负证据在案）→ 单向 DAG。
/* eslint-disable */
import * as React from "react";
import { providerIds, isStartPlanProviderId } from '../../modules/SrcSharedA'; // 原 q / 原 Bn（跨 chunk 证据链见头表）
import { useUsageEntitlementCore, type EntitlementSnapshot, type EntitlementQuotaLimit } from '../../modules/UsageDeep'; // 原 eM 改指（A0 canonical）+ 型别回取
import { resolveCodingPlanCounterpartId, isCodingPlanFamilyProvider, isActiveTaskPhase } from './ConversationPaneHelpers'; // 原 qCt/JCt/YCt（A1-P1 批 1 逐字）
import { type QuotaBannerState } from './SessionBanners'; // 原 gst 域型（A0-S4-4b；I0 返回面）

/** 原 xNe（js 40503）：配额误报通用错误码集 */
export const QUOTA_GENERIC_ERROR_CODES = new Set([`PROVIDER_BUSINESS_ERROR`, `SEND_FAILED`, `unknown_error`]);
/** 原 SNe（js 40504）：服务端配额耗尽码归一（1005 直通 / 文案命中 + 通用码兜底） */
export function resolveServerQuotaExhaustedCode(e: string | null | undefined, t: string | null | undefined): string | undefined { // 〔A1-P1-B2〕型缝：error.code/message 面
  if (e === `1005`) return `1005`;
  let n = e?.trim(),
    r = t?.trim().toLowerCase();
  if (
    r &&
    (r.includes(`exceed limit`) ||
      r.includes(`exceed quota limit`) ||
      r.includes(`quota exceeded`)) &&
    (!n || QUOTA_GENERIC_ERROR_CODES.has(n))
  )
    return `1005`;
}
/** 原 CNe/wNe/TNe/ENe（js 40517–40539）：并发受限归一常量族 */
export const CONCURRENT_GENERIC_ERROR_CODES = new Set([
    `PROVIDER_BUSINESS_ERROR`,
    `SEND_FAILED`,
    `unknown_error`,
    `MODEL_RATE_LIMITED`,
  ]),
  CONCURRENT_LIMIT_KEYWORDS = [`concurrent`, `concurrency`, `并发`],
  MODEL_LIMIT_KEYWORDS = [`model`, `模型`],
  PROVIDER_LIMITED_CODES = new Set([
    `1308`,
    `1309`,
    `1310`,
    `1311`,
    `1313`,
    `1314`,
    `1315`,
    `1316`,
    `1317`,
    `1318`,
    `1319`,
    `1320`,
    `1321`,
  ]);
/** 原 DNe（js 40540）：服务端并发受限码归一（3008/3009/3010 直通 / 关键词 + 通用码兜底） */
export function resolveServerConcurrentLimitCode(e: string | null | undefined, t: string | null | undefined): string | undefined { // 〔A1-P1-B2〕型缝：同 SNe
  if (e === `3008`) return `3008`;
  if (e === `3009`) return `3009`;
  if (e === `3010`) return `3010`;
  let n = e?.trim(),
    r = t?.trim().toLowerCase();
  if (r && CONCURRENT_LIMIT_KEYWORDS.some((e) => r.includes(e)) && (!n || CONCURRENT_GENERIC_ERROR_CODES.has(n)))
    return MODEL_LIMIT_KEYWORDS.some((e) => r.includes(e)) ? `3009` : `3008`;
}
/** 原 ONe（js 40549）：供应商受限码归一（1308–1321 白名单） */
export function resolveProviderLimitedCode(e: string | null | undefined): string | undefined { // 〔A1-P1-B2〕型缝：error.code 面
  let t = e?.trim();
  if (t && PROVIDER_LIMITED_CODES.has(t)) return t;
}
/** 原 kNe（js 40553）：并发受限细分原因（重试耗尽文案 → retry-exhausted-busy） */
export function concurrentLimitReasonOfMessage(e: string | null | undefined): string { // 〔A1-P1-B2〕型缝：error.message 面
  return e?.trim() ===
    `Start Plan is busy and automatic model stream recovery reached the maximum retry count.`
    ? `retry-exhausted-busy`
    : `initial-busy`;
}
/** 原 N0（js 118873）：配额文本归一（trim + 小写） */
export function normalizeQuotaText(e: string | null | undefined): string { // 〔A1-P1-B2〕型缝：quota.level/productId/productName 可空面
  return e?.trim().toLowerCase() ?? ``;
}
/** 原 FCt（js 118876）：词界匹配（[\s_-] 边界，大小写不敏） */
export function matchesQuotaWord(e: string | null | undefined, t: string): boolean { // 〔A1-P1-B2〕型缝：同 N0 首参面
  return RegExp(`(^|[\\s_-])${t}($|[\\s_-])`, `i`).test(e?.trim() ?? ``);
}
/** 原 P0（js 118879）：enterprise/team 档位判定 */
export function isEnterpriseOrTeamLevel(e: string | null | undefined): boolean {
  let t = normalizeQuotaText(e);
  return t.includes(`enterprise`) || t.includes(`team`);
}
/** 原 F0（js 118883）：max 档位判定（等值或词界） */
export function isMaxLevel(e: string | null | undefined): boolean {
  return normalizeQuotaText(e) === `max` || matchesQuotaWord(e, `max`);
}
/** 原 ICt（js 118886）：企业/团队权益判定（quota.level 或订阅明细 productId/productName） */
export function hasEnterpriseOrTeamEntitlement(e: EntitlementSnapshot | null): boolean { // 〔A1-P1-B2〕型缝：usage 域 EntitlementSnapshot 回取
  return e
    ? isEnterpriseOrTeamLevel(e.quota?.level)
      ? !0
      : (e.subscription?.details ?? []).some((e) => {
          let t = normalizeQuotaText(e.productId),
            n = normalizeQuotaText(e.productName);
          return isEnterpriseOrTeamLevel(t) || isEnterpriseOrTeamLevel(n);
        })
    : !1;
}
/** 原 LCt（js 118897）：max 权益判定（续订门） */
export function hasMaxLevelEntitlement(e: EntitlementSnapshot | null): boolean {
  return e
    ? isMaxLevel(e.quota?.level)
      ? !0
      : (e.subscription?.details ?? []).some((e) => {
          let t = e.productId,
            n = e.productName;
          return isMaxLevel(t) || isMaxLevel(n);
        })
    : !1;
}
/** 原 RCt（js 118908）：隐藏配额横幅态（I0 兜底）；〔A1-P1-B2〕as 缝：null 面宽化入 QuotaBannerState */
export const HIDDEN_QUOTA_BANNER_STATE = {
  visible: !1,
  kind: null,
  concurrentLimitBusinessCode: null,
  concurrentLimitReason: null,
  providerLimitedBusinessCode: null,
  providerLimitedMessage: null,
  modelName: null,
  remainingTokens: null,
  remainingPercent: null,
  dismissible: !1,
  blocksSubmit: !1,
  priority: 0,
} as QuotaBannerState;
/** 原 zCt（js 118922）：计划族六键判定（I0 provider-limited 门；与 JCt 同形，bundle 双定义逐字各留） */
export function isPlanFamilyProvider(e: string | null): boolean { // 〔A1-P1-B2〕型缝：activeProviderId 面
  return (
    e === providerIds.zai ||
    e === providerIds.zaiCodingPlan ||
    e === providerIds.zaiStartPlan ||
    e === providerIds.bigmodel ||
    e === providerIds.bigmodelCodingPlan ||
    e === providerIds.bigmodelStartPlan
  );
}
/** 原 BCt（js 118932）：模型码归一（小写 + 下划线转连字符） */
export function normalizeModelCode(e: string): string { // 〔A1-P1-B2〕型缝：usageDetails.modelCode 非空面
  return e.trim().toLowerCase().replace(/_/gu, `-`);
}
/** 原 VCt（js 118935）：配额限额项命中模型码（usageDetails 逐条归一比） */
export function quotaLimitMatchesModelCode(e: EntitlementQuotaLimit, t: string): boolean { // 〔A1-P1-B2〕型缝：limits 元素面回取
  let n = normalizeModelCode(t);
  return e.usageDetails!.some((e) => normalizeModelCode(e.modelCode) === n); // 〔A1-P1-B2〕! 缝：usageDetails 域型可空（UsageDeep 685）/ bundle 直读（118937），运行期同形
}
/** 原 HCt（js 118939）：限额剩余比例（percentage 优先 / remaining÷number 兜底） */
export function limitRemainingRatio(e: EntitlementQuotaLimit): number | null { // 〔A1-P1-B2〕型缝：同上
  return typeof e.percentage == `number` && Number.isFinite(e.percentage)
    ? e.percentage
    : typeof e.remaining == `number` && typeof e.number == `number` && e.number > 0
      ? e.remaining / e.number
      : null;
}
/** 原 UCt（js 118946）：快照整体剩余比例（remaining.percentage 优先 / limits 聚合兜底） */
export function snapshotRemainingRatio(e: QuotaSnapshotLike): number | null { // 〔A1-P1-B2〕型缝：快照最小读面（remaining.count/percentage + quota.limits.number/remaining）
  if (typeof e.remaining?.percentage == `number` && Number.isFinite(e.remaining.percentage))
    return e.remaining.percentage;
  let t = e.quota?.limits ?? [],
    n = t.reduce((e, t) => e + (t.number ?? 0), 0),
    r = t.reduce((e, t) => e + (t.remaining ?? 0), 0);
  return n > 0 ? r / n : null;
}
/** 原 WCt（js 118954）：比例 → 百分比整数（clamp 0–100） */
export function ratioToPercent(e: number | null): number | null { // 〔A1-P1-B2〕型缝：HCt/UCt 返回面
  return e === null || !Number.isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e * 100)));
}
/** 原 GCt（js 118957）：比例 → 配额种类阈值映射（daily 前缀不报耗尽外） */
export function quotaKindOfRatio(e: { ratio: number | null; exhaustedKind: string; prefix: string }): string | null { // 〔A1-P1-B2〕型缝：I0 调用面三键
  return e.ratio === null
    ? null
    : e.ratio <= 0
      ? e.exhaustedKind
      : e.prefix === `daily`
        ? null
        : e.ratio <= 0.1
          ? `model-very-low`
          : e.ratio <= 0.2
            ? `model-low`
            : e.ratio <= 0.5
              ? `model-half-used`
              : null;
}
/** 原 KCt（js 118972）：方括号业务文案提取（≥3 段取第二段，否则原文） */
export function extractBracketedBusinessMessage(e: string | null | undefined): string | null { // 〔A1-P1-B2〕型缝：serverProviderLimitedMessage 可空面
  let t = e?.trim();
  if (!t) return null;
  let n = [...t.matchAll(/\[([^\]]*)\]/gu)].map((e) => e[1]?.trim() ?? ``);
  return n.length >= 3 && n[1] ? n[1] : t;
}
/** 原 I0 入参面〔A1-P1-B2〕：XCt useMemo 装配面 + parity s8t 调用面之并 */
interface QuotaBannerInputLike {
  activeProviderId: string | null;
  snapshot: QuotaSnapshotLike | null;
  modelId: string | null;
  serverQuotaExhausted?: boolean;
  serverConcurrentLimited?: boolean;
  serverConcurrentLimitBusinessCode?: string | null;
  serverConcurrentLimitReason?: string | null;
  serverProviderLimitedBusinessCode?: string | null;
  serverProviderLimitedMessage?: string | null;
}
/** 原快照读面〔A1-P1-B2〕：EntitlementSnapshot 之 I0/UCt 最小读面（remaining.count/percentage 为 bundle 真读面，域型未登） */
interface QuotaSnapshotLike {
  provider?: { id: string } | null;
  quota?: { level?: string; limits?: EntitlementQuotaLimit[] } | null;
  remaining?: { count?: number; percentage?: number; nextResetTime?: number } | null;
  [key: string]: unknown;
}
/** 原 I0（js 118978）：配额横幅状态合成（服务端三码优先 / 快照比例阈值兜底 / RCt 隐藏态） */
export function resolveQuotaAssertion(e: QuotaBannerInputLike): QuotaBannerState { // 〔A1-P1-B2〕型缝：入参/返回面（返回 = SessionBanners QuotaBannerState）
  if (e.serverConcurrentLimited === !0 && e.activeProviderId && isStartPlanProviderId(e.activeProviderId))
    return {
      visible: !0,
      kind: `concurrent-limit`,
      concurrentLimitBusinessCode: e.serverConcurrentLimitBusinessCode ?? null,
      concurrentLimitReason: e.serverConcurrentLimitReason ?? `initial-busy`,
      providerLimitedBusinessCode: null,
      providerLimitedMessage: null,
      modelName: e.modelId,
      remainingTokens: null,
      remainingPercent: null,
      dismissible: !0,
      blocksSubmit: !1,
      priority: 60,
    };
  if (e.serverQuotaExhausted === !0 && e.activeProviderId && isStartPlanProviderId(e.activeProviderId))
    return {
      visible: !0,
      kind: `daily-exhausted`,
      concurrentLimitBusinessCode: null,
      concurrentLimitReason: null,
      providerLimitedBusinessCode: null,
      providerLimitedMessage: null,
      modelName: null,
      remainingTokens: null,
      remainingPercent: 0,
      dismissible: !1,
      blocksSubmit: !1,
      priority: 50,
    };
  if (e.serverProviderLimitedBusinessCode && e.activeProviderId && isPlanFamilyProvider(e.activeProviderId))
    return {
      visible: !0,
      kind: `provider-limited`,
      concurrentLimitBusinessCode: null,
      concurrentLimitReason: null,
      providerLimitedBusinessCode: e.serverProviderLimitedBusinessCode,
      providerLimitedMessage: extractBracketedBusinessMessage(e.serverProviderLimitedMessage),
      modelName: e.modelId,
      remainingTokens: null,
      remainingPercent: null,
      dismissible: !0,
      blocksSubmit: !1,
      priority: 45,
    };
  if (
    !e.activeProviderId ||
    !isStartPlanProviderId(e.activeProviderId) ||
    e.snapshot?.provider?.id !== e.activeProviderId
  )
    return HIDDEN_QUOTA_BANNER_STATE;
  let t = snapshotRemainingRatio(e.snapshot),
    n = quotaKindOfRatio({ ratio: t, exhaustedKind: `daily-exhausted`, prefix: `daily` });
  if (n === `daily-exhausted`)
    return {
      visible: !0,
      kind: n,
      concurrentLimitBusinessCode: null,
      concurrentLimitReason: null,
      providerLimitedBusinessCode: null,
      providerLimitedMessage: null,
      modelName: null,
      remainingTokens: e.snapshot.remaining?.count ?? null,
      remainingPercent: ratioToPercent(t),
      dismissible: !1,
      blocksSubmit: !1,
      priority: 50,
    };
  let r = e.modelId?.trim() ?? ``,
    i = r ? e.snapshot.quota?.limits!.find((e) => quotaLimitMatchesModelCode(e, r)) : void 0, // 〔A1-P1-B2〕! 缝：limits 域型可空 / bundle 直读（119048），运行期同形
    a = i ? limitRemainingRatio(i) : null,
    o = quotaKindOfRatio({ ratio: a, exhaustedKind: `model-exhausted`, prefix: `model` });
  return o
    ? {
        visible: !0,
        kind: o,
        concurrentLimitBusinessCode: null,
        concurrentLimitReason: null,
        providerLimitedBusinessCode: null,
        providerLimitedMessage: null,
        modelName: r,
        remainingTokens: i?.remaining ?? null,
        remainingPercent: ratioToPercent(a),
        dismissible: o === `model-half-used` || o === `model-low`,
        blocksSubmit: !1,
        priority:
          o === `model-exhausted` ? 40 : o === `model-very-low` ? 30 : o === `model-low` ? 20 : 10,
      }
    : HIDDEN_QUOTA_BANNER_STATE;
}
/** 原 L0（js 119069）：配额横幅 dismiss 键（visible+kind 门 / 十元 :: 串） */
export function quotaDismissKey(e: QuotaBannerState, t: string | null): string | null { // 〔A1-P1-B2〕型缝：I0 返回面 + errorKey 面
  return !e.visible || !e.kind
    ? null
    : [
        e.kind,
        e.concurrentLimitBusinessCode ?? ``,
        e.concurrentLimitReason ?? ``,
        e.providerLimitedBusinessCode ?? ``,
        e.providerLimitedMessage ?? ``,
        e.modelName ?? ``,
        e.remainingTokens ?? ``,
        e.remainingPercent ?? ``,
        e.blocksSubmit ? `blocked` : `unblocked`,
        t ?? ``,
      ].join(`:`);
}
/** 原 XCt（js 119101）：会话配额视图模型（错误码归一 + 双权益快照 + dismiss 态机 + 升级门） */
export function useSessionQuotaViewModel(e: { error: { code?: string; message?: string } | null; errorKey: string | null; phase: string | null; providerId: string | null; modelId: string | null; usageStatsService: unknown }) { // 〔A1-P1-B2〕型缝：modules/Conversation D8 调用面（control.lastError/usageStatsService unknown）
  let t = e.providerId?.trim() || null,
    n = e.modelId?.trim() || null,
    r = !!(t && isStartPlanProviderId(t)),
    i = resolveServerQuotaExhaustedCode(e.error?.code, e.error?.message),
    a = resolveServerConcurrentLimitCode(e.error?.code, e.error?.message),
    o = resolveProviderLimitedCode(e.error?.code),
    s = i === `1005` && r,
    c = !!a && r,
    l = !!(o && isCodingPlanFamilyProvider(t)),
    u = s || c || l,
    d = useUsageEntitlementCore(e.usageStatsService as Parameters<typeof useUsageEntitlementCore>[0], {
      enabled: r,
      includeSubscription: !1,
      preferredProviderId: t ?? providerIds.zaiStartPlan,
      allowDisabledPreferredProvider: !0,
      requirePreferredProvider: !0,
      allowEnvApiKey: !1,
      refreshOnMount: !1,
    }),
    f = (0, React.useMemo)(
      () =>
        resolveQuotaAssertion({
          activeProviderId: t,
          snapshot: d.snapshot,
          modelId: n,
          serverQuotaExhausted: s,
          serverConcurrentLimited: c,
          ...(a ? { serverConcurrentLimitBusinessCode: a } : {}),
          ...(a ? { serverConcurrentLimitReason: concurrentLimitReasonOfMessage(e.error?.message) } : {}),
          ...(o ? { serverProviderLimitedBusinessCode: o } : {}),
          ...(l ? { serverProviderLimitedMessage: e.error?.message ?? null } : {}),
        }),
      [t, a, d.snapshot, n, e.error?.message, o, c, l, s],
    ),
    p = quotaDismissKey(f, u ? e.errorKey : null),
    [m, h] = React.useState<string | null>(null), // 〔A1-P1-B2〕泛型缝：bundle (0, Q.useState)(null)
    g = p !== null && m === p,
    _ = resolveCodingPlanCounterpartId(t),
    v = f.visible && _ !== null && !isStartPlanProviderId(_),
    y = useUsageEntitlementCore(e.usageStatsService as Parameters<typeof useUsageEntitlementCore>[0], {
      enabled: v,
      includeSubscription: !0,
      preferredProviderId: _ ?? void 0,
      allowDisabledPreferredProvider: !0,
      requirePreferredProvider: !0,
      allowEnvApiKey: !1,
      refreshOnMount: !0,
    }),
    b =
      d.snapshot?.provider?.id === _
        ? d.snapshot
        : y.snapshot?.provider?.id === _
          ? y.snapshot
          : null,
    x = b !== null && hasEnterpriseOrTeamEntitlement(b),
    S = b !== null && hasMaxLevelEntitlement(b),
    C = (0, React.useRef)(e.phase);
  (0, React.useEffect)(() => {
    let t = C.current;
    ((C.current = e.phase),
      !(!r || t === e.phase) &&
        isActiveTaskPhase(t) !== isActiveTaskPhase(e.phase) &&
        d.refresh({ force: !0, silent: !0, reason: `task` }));
  }, [d.refresh, r, e.phase]);
  let w = (0, React.useRef)(!1),
    T = React.useRef<string | null>(null); // 〔A1-P1-B2〕泛型缝：bundle (0, Q.useRef)(null)
  return (
    (0, React.useEffect)(() => {
      let e = r && n ? `${t}:${n}` : null,
        i = T.current;
      if (((T.current = e), !w.current)) {
        w.current = !0;
        return;
      }
      e && e !== i && d.refresh({ reason: `initial` });
    }, [t, d.refresh, r, n]),
    {
      state: f,
      dismissKey: p,
      dismissed: g,
      dismiss: (0, React.useCallback)(() => {
        h(p);
      }, [p]),
      takesOverError: u,
      upgradeProviderId: x ? null : _,
      upgradeActionLabelId: S ? `chat.quota.action.renew` : `chat.quota.action.upgrade`,
    }
  );
}
