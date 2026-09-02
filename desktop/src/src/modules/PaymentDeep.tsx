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
 *     Home §V.6/§V.7（y3e…A3e/j3e，见 components 侧 §1 墓碑）
 *  B. 工具条配置选择（76844–77061 / jsx 67907 区）：
 *   M3e → isOptionValuePresent (76844) | N3e → FULL_ACCESS_MODES (76847)
 *   P3e → categoryTestidOf (76848) | F3e → optionTestidOf (76852)
 *   I3e → ApiRetryStatusChip (76856) | L3e → modeOptionLabelOf (76874)
 *   R3e → modeLabelKeyOf (76877) | z3e → modeDescriptionKeyOf (76880)
 *   jq  → optionLabelOf (76883) | B3e → optionDescriptionOf (76886)
 *   V3e → isFullAccessMode (76892) | H3e → modeIconOf (76895)
 *   Mq  → ConfigSelect                 工具条 select 触发器 (76912)
 *  C. 思考级别机制（77127–77325；U3e/W3e/G3e 见排除注记）：〔A1-R23〕Pq/Fq/Z3e/Q3e/$3e 副本删除
 *     → 逐字 canonical Home §U.2 ComposerThoughtToolbar + §T 快捷键族（见 components 侧 §3 墓碑）；
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
 *  I. xnt 用量格式化+计划源选择（88047–89988 / jsx 76242/77471）：见 components 侧 §9 头注；
 *     〔A1-R23〕pX…oit 工具条死簇 33 件删除 → 逐字 canonical Home §T/§U（见 components 侧 §9 墓碑）
 *  J. lit/uit 上下文 chip（89989–90179 / jsx 78047/78080）：〔A1-R22〕副本删除 → 逐字 canonical
 *     modules/Composer.tsx [B17]（消费面在 Home/Conversation，非支付域；见 components 侧 §10 墓碑）
 * ============================================================================
 */

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/payments/PaymentDeep.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  /* ── 〔A1-R23〕移出 19 符：closeThenRun/USAGE_CHART_COLORS/PERCENT_SCALE/CACHE_HIT_DISPLAY_THRESHOLD/
   *    formatCompactNumberLocale/formatUsedOfTotal/formatPercentOrNull/segmentStyleOfIndex/
   *    CONTEXT_BREAKDOWN_LABEL_KEYS/CONTEXT_BREAKDOWN_ORDER/aggregateContextBreakdown/
   *    toBreakdownSegments/validTaskUsageOrNull/ContextUsagePopover（§1，y3e…j3e）+
   *    ThoughtLevelControl/shortcutKeyOfCategory/nextSelectValue/resolveToolbarShortcut/
   *    useToolbarShortcuts（§3，Pq…$3e）——j3e 叠层专项裁定：真身逐字 canonical = Home §V.6/§V.7 +
   *    §U.2/§T 族；本再导出面全树零消费（负证据在案），随 components 侧副本删除。见 components 侧墓碑。 ── */
  PROVIDER_FAMILY_ORDER,
  providerFamilyRankOf,
  sortProvidersByFamilyAndOrder,
  /* ── 〔A1-R28〕移出 1 符：teamOrganizationLabelOf（Lq A0 副本删除 → Home §U.5 teamSourceOrganizationLabel
   *    逐字 canonical；本转导出面全树零消费，负证据在案，见 components 侧墓碑）。 ── */
  providerDisplayLabelsOf,
  alwaysFalse,
  agentModelFormatsOf,
  isModelEntryWithModified,
  modelsForAgent,
  hasProviderCredentials,
  providerSupportsFormat,
  providerSupportsAnyFormat,
  providerUsableForAgent,
  isPresetDirectProvider,
  modelItemsOfProvider,
  providerGroupOf,
  presetOptionKey,
  codingPlanOptionKey,
  teamPlanOptionKey,
  teamPlanOptionsOf,
  isTeamPlanKeyAllUnavailable,
  savedBigmodelTeamPlanKeyOf,
  isBigmodelTeamPlanSelected,
  resolveFamilyDefaultOption,
  familyGroupOf,
  familyOptionBadgeOf,
  teamPlanOptionKeysMatch,
  inactiveOAuthFamilyOf,
  modelMenuGroupsForAgent,
  glmMenuGroupsOf,
  modelMenuGroupsOf,
  modelNameOfValue,
  isModelSelectorEnabled,
  isSyntheticModel,
  shortModelNameOf,
  groupsContainValue,
  resolveModelSelectState,
  hasActiveEntitlementAlias,
  isProviderEntitlementVisible,
  isStartPlanVisible,
  filterUsableProviders,
  trimOrEmpty,
  positiveIntegerOrNull,
  normalizeModelMetadata,
  normalizeEndpointPathsTrim,
  normalizeEndpoints,
  providerFingerprintOf,
  providersDiffer,
  ghostModelProviderIdOf,
  isGhostModelValue,
  supplierKeyOfConfigOptions,
  activeTaskProviderOf,
  resolveTaskProviderAndSupplier,
  currentModelValueOf,
  ZCODE_PROXY_PREFIXES,
  proxyModelNameOf,
  canonicalModelNameOf,
  isClaudeAliasModel,
  claudeAliasKindOf,
  retargetModelValue,
  modelValuesMatchForAgent,
  reconcileConfigOptionsModel,
  normalizeDescriptionItems,
  productTitleOf,
  productBulletLinesOf,
  primaryAmountOf,
  normalizeCurrency,
  formatMoney,
  periodOfProduct,
  AmountSummaryCard,
  AmountRow,
  buildAmountSummary,
  resolvePayAmount,
  pickRenewAmount,
  sumCampaignDiscounts,
  campaignDiscountRowsOf,
  currentPlanCreditRowOf,
  firstPositive,
  firstNonNegative,
  residualCreditOf,
  CodingPlanPaymentQrHost,
  CodingPlanPaymentQrDialog,
  paymentDialogTitleOf,
  PolicyLink,
  currencyOfProduct,
  Badge,
  useCodingPlanProducts,
  fetchPreviewSnapshot,
  loadPreviewSnapshot,
  snapshotFallback,
  bumpPreviewEpoch,
  batchPreviewWithCatalog,
  emptySnapshotOf,
  freeStartPlanProductsOf,
  entitlementDetailOf,
  isZaiStartFreeProductId,
  snapshotOfProducts,
  hydrateStaticProducts,
  remoteStaticProductsOf,
  filterStartFreeForProvider,
  staticProductsConfigOf,
  mergePreviewIntoProduct,
  normalizeProductError,
  isOAuthRequiredError,
  isSystemBusyError,
  errorMessageOf,
  isHtmlBlockedMessage,
  isOAuthLikeMessage,
  InfoNoticeCard,
  productErrorMessageOf,
  enterpriseProductsToCatalog,
  mergeStaticAndEnterprise,
  enterpriseOrMergedProducts,
  enterprisePayAmountOf,
  enterpriseOrderParamsOf,
  enterpriseEstimateParamsOf,
  payUrlOf,
  requiresThirdPartyPayment,
  estimateSummaryOf,
  pricingSummaryOf,
  discountDetailsOf,
  enterpriseCampaignDiscountOf,
  enterpriseImplicitDiscountOf,
  allocateCampaignDetails,
  allocatedDiscountAmountOf,
  isPositiveNumber,
  isNonNegativeNumber,
  round2,
  isOrderSuccess,
  isOrderTerminal,
  capitalizeTier,
  periodOfSubscribePeriod,
  StripeCardDialogEntry,
  StripeCardDialog,
  PaymentMethodOptionRow,
  CardBrandLabel,
  CardBrandImage,
  cardBrandImageOf,
  StripeCardManageDialog,
  SavedCardRow,
  AddStripeCardForm,
  FieldLabel,
  BillingTextInput,
  CountrySelect,
  CardBrandRow,
  OverseasPolicyLink,
  rawPeriodOfProduct,
  stripePublishableKeyOf,
  purchaseAttemptIdOf,
  personalFunnelSnapshotOf,
  teamFunnelSnapshotOf,
  funnelWithOrderNoOf,
  funnelClickEventOf,
  funnelResultEventOf,
  trackFunnelClick,
  trackFunnelResult,
  orderOutcomeOf,
  enterpriseTerminalOutcomeOf,
  outcomeOf,
  timeoutOutcome,
  cancelledOutcome,
  funnelDetailOf,
  funnelProductNameOf,
  funnelPeriodLabelOf,
  stringifyFunnelDetail,
  providerFamilyOf,
  channelOfFamily,
  defaultPaymentMethodOf,
  personalTierOf,
  teamTierOf,
  billingPeriodKeyOf,
  enterprisePeriodOf,
  purchaseMethodOf,
  normalizeOrderStatus,
  isTerminalOrderStatus,
  amountFieldOf,
  sanitizeFunnelErrorMessage,
  stringFieldOf,
  slugOf,
  fallbackAttemptId,
  runSecurityCaptcha,
  captchaPointerEventsGuard,
  captchaAppIdOf,
  ensureCaptchaScript,
  envStringOf,
  isStyleCapableElement,
  useCodingPlanPurchase,
  estimatePayAmountsOf,
  paypalReturnUrl,
  paypalCancelUrl,
  normalizePaypalError,
  paymentCallbackUrlOf,
  parsePaymentCallbackUrl,
  previewWithSecurityVerification,
  pollPaymentStatus,
  isSecurityVerificationRequiredError,
  paymentSignKindOf,
  isSuccessLikeStatus,
  needsStatusPollAfterStripe,
  isFailureLikeStatus,
  isPurchaseCancelledError,
  throwIfAborted,
  abortableDelay,
  snapshotMatchesAuth,
  enterpriseSnapshotFallback,
  useEnterpriseCodingPlanProducts,
  codingPlanProviderOfStart,
  oauthRecoveryOptionOf,
  isAccountRequirementVisible,
  useEnterpriseCodingPlanPanelPurchase,
  resumeOrderStateOf,
  effectiveEstimateOf,
  openEnterprisePaymentDialog,
  enterpriseBalanceDeductionsOf,
  enterprisePaymentDialogStateOf,
  pollEnterpriseOrderStatus,
  isEnterprisePurchaseCancelledError,
  throwIfEnterpriseAborted,
  enterpriseAbortableDelay,
  useStartPlanPreview,
  startPlanPreviewOf,
  raceWithTimeout,
  isPendingPlanResumable,
  isLoginAttemptMatchingPending,
  isPlanSelectLoginError,
  resumablePendingProductOf,
  CodingPlanPurchasePanel,
  useCodingPlanEntitlements,
  CodingPlanUpgradeDialogProvider,
  useCodingPlanUpgradeDialog, // 〔A1-R23〕补 export：Home declare useCodingPlanUpgradeDialog 收敛（原 fX，89100；消费面 Home §U.10 ComposerConfigToolbarBody ≡ bundle 89522）
  useCodingPlanUpgradeDialogOptional, // 〔A1-R24〕补 export：Home declare useUpgradeActions 收敛（原 Art，89106；消费面 91644 ≡ Home OffPeakNewTaskBanner）
  useModelProvidersStore, // 〔A1-R35〕补 export：qq 78243-78403 逐字转录（components 侧 §11 尾部）；settings 六件 declare 收敛改指（R34 留批 2/3 闭合）
  PLAN_DOMAINS, // 〔A1-P3-B11〕原 Gnt（88214）转导出：USt≡Gnt.zcodePlanOpenAiBaseUrl 收敛接引面（ConversationLeaves@1022 接引）
} from '../components/payments/PaymentDeep';
export type { ModelProvider } from '../components/payments/PaymentDeep'; // 〔A1-R29〕Hq/N6e/ot 簇收敛型缝所依：各脸本地供应商型面窄化依此（类型面，零运行时影响）
