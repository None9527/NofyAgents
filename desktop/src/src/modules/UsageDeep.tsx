/* eslint-disable */
/**
 * ============================================================================
 * UsageDeep.tsx — ZCode 3.7.6 F12 用量深层（D8 Stage B4 · B4-1 第 2 项）
 *   用量数据 hook（q$t/J$t）+ 订阅权益数据层（$j/eM 簇）+ 计费折扣簇（dj 簇）
 *   + 配额/计划展示件（s3e/v3e 族）+ 供应商卡群深层叶子（u7/rZt/MZt 族）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 与前序批次的对接：
 *   - SettingsPanelsData.tsx（B3）以 `declare` 挂接的 q$t/J$t/$j/Sq/Cq/wq/$4e/rM 等
 *     在本文件实体化（行号见 §1/§2/§4）。
 *   - SettingsPanels.tsx（B3）以 `declare` 挂接的 u7/CXt/v7/nZt/rZt/x7/yZt/bZt/MZt/
 *     WZt/eQt/tQt 在本文件实体化（§9–§16）。
 *   - 图表本体（AppUsageDailyModelBarChart / AppUsageModelUsagePieChart /
 *     CodingPlanUsageLineChart）已在 modules/appUsageDailyModelBarChart.tsx /
 *     appUsageModelUsagePieChart.tsx / codingPlanUsageLineChart.tsx 恢复；
 *     本文件的 useAppUsageStats/useCodingPlanUsageStats 产出的 snapshot 即其消费面
 *     （snapshot.summary/heatmap/modelUsage/toolUsage 字段与图表 chunk 的
 *      first-party 段数据组装一一对应：日柱状=heatmap.weeks+modelDataList 前 6 模型、
 *      饼图=modelSummaryList 前 6+Other、折线=xTime/granularity/series）。
 *   - 支付对话框深部（zet/Zet/e5e/Xrt/Zrt/Mq，js 77080–90180）仍为接口级，
 *     行号登记见本文件 §10 与报告 §1。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 * A. 用量数据 hook（js 195171–195258 / jsx 156988–157118）
 *   K$t → usageErrorOf                    错误对象 → 消息字符串 (195467)
 *   q$t → useAppUsageStats                app 本地用量快照 hook (195475)
 *   J$t → useCodingPlanUsageStats         Coding Plan 用量快照 hook (195502)
 *
 * B. 订阅权益数据层（js 52266–52745 / jsx 47016–47522）
 *   uUe → USAGE_ENTITLEMENT_CACHE_PREFIX  `zcode:usage-entitlement:` (52266 / 47016 区)
 *   dUe → USAGE_ENTITLEMENT_CACHE_TTL_MS  600*1e3
 *   zj  → entitlementCacheStorage         localStorage 守卫
 *   Bj  → entitlementFreshnessKey         providerId+fingerprint → 缓存键
 *   fUe → readCachedEntitlementSnapshot   localStorage 读（TTL 过期清除）
 *   pUe → writeCachedEntitlementSnapshot  localStorage 写
 *   mUe → ACTIVE_AUTO_REFRESH_INTERVAL_MS 5*6e4
 *   hUe → IDLE_AUTO_REFRESH_INTERVAL_MS   30*6e4
 *   Vj  → RESET_REFRESH_SLACK_MS          1e4
 *   Hj  → FAILURE_BACKOFF_STEPS_MS        [3e4,6e4,12e4,3e5]
 *   Uj/Wj/Gj → 快照缓存/监听集/失败表（WeakMap×3）
 *   Kj  → entitlementOptionsKey           选项 JSON 键
 *   gUe → entitlementFreshnessKeyOf       cacheKey+选项 → 新鲜度键
 *   qj/Jj → snapshotCacheOf/failureCacheOf
 *   _Ue/vUe → getCachedSnapshot/setCachedSnapshot（写入时广播监听集）
 *   yUe → recordFailureBackoff            失败计数 → 指数退避
 *   bUe → subscribeCachedSnapshots        监听集注册/清理
 *   Yj  → freshCachedSnapshot             nextAllowedAt/intervalMs 新鲜度判定
 *   xUe → isFailureBackoffActive
 *   Xj  → isDocumentVisible
 *   SUe → earliestNextResetTimeOf         remaining/quota.limits 最早重置时间
 *   CUe → resolveEntitlementStatus        active/none/unavailable/unknown
 *   wUe → shouldApplyRefreshResult        reason×status 过滤
 *   Zj  → ENTITLEMENT_INITIAL_STATE       {snapshot:null,loading:false,error:null}
 *   TUe → ENTITLEMENT_REQUEST_TIMEOUT_MS  2e4
 *   Qj  → in-flight 去重表（WeakMap）
 *   EUe → dedupedGetEntitlementSnapshot   getEntitlementSnapshot 单飞去重
 *   DUe → entitlementErrorOf
 *   OUe → entitlementTimeoutError         `usage_entitlement_request_timeout:${ms}`
 *   kUe → withTimeout                     Promise.race 超时
 *   $j  → useSubscriptionSnapshot         权益/订阅快照 hook（薄包装）(52497)
 *   eM  → useUsageEntitlementCore         主 hook：缓存/轮询/重置唤醒/去重 (52500)
 *   tM  → nullSafe                        e ?? null
 *   nM  → providerApiKeyFingerprint       id:hash(apiKey)
 *   rM  → providerCacheKey                zcode:usage-entitlement:<fp> (52648)
 *   jUe → hashApiKey                      31 进制滚动哈希 → 36 进制
 *   iM  → hasActiveEntitlement
 *   AUe → isNoPlanEntitlement
 *   aM  → shouldProbeStartPlanEntitlement
 *   oM/sM/cM/lM/uM/dM → 供应商源注册表模块态（源列表/已加载/失效计数/单飞槽×2/监听集）
 *   fM/pM/mM/hM → listCodingPlanSources/hasLoadedSources/setCodingPlanSources/subscribeCodingPlanSources
 *   MUe/NUe → nextInFlightToken/commitIfCurrent
 *   gM  → refreshCodingPlanSourcesForced  强制刷新（单飞合并）
 *   _M  → ensureCodingPlanSources         惰性加载（单飞合并）
 *   PUe → useProviderFamilyConnectionSettings 双权益（codingPlan/startPlan）→ 连接设置 (52743)
 *   vM  → providerFamiliesOf              jte 薄包装
 *   yM  → activeProvidersOf               kr 薄包装
 *   FUe → hasNoUserOrProviders
 *
 * C. 计费折扣簇（js 51857–52041 / jsx 46612–46764）
 *   zHe → BILLING_DISCOUNT_CACHE_TTL_MS   3600*1e3
 *   BHe/VHe → 折扣信息对话框类名常量
 *   lj/uj → 折扣配置缓存/单飞槽
 *   dj  → useBillingDiscount              活动配置 hook (51910)
 *   fj  → useBillingDiscountCore
 *   pj  → localizedDiscountCopyOf         locale → {badgeBody/cardTitle/cardBody/infoTitle/infoBody}
 *   mj  → hasDiscountCopy
 *   hj  → BillingDiscountBadge            徽章（gradient/surface/tag）(51911 / 46646 区)
 *   gj  → BillingDiscountBadgeWithInfo    徽章+信息对话框 (51932 / 46660 区)
 *   HHe → BillingDiscountCard             渐变卡 (51994)
 *   _j  → BillingDiscountInfoDialog       markdown 信息对话框 (52034)
 *   UHe → getCachedBillingDiscount        1h TTL + 单飞
 *   vj  → nonEmptyTrimmed
 *
 * D. 配额助手 + 侧栏计划件（js 76101–76563 / jsx 67394–67700 区）
 *   Sq  → findQuotaLimit                  type/unit/number 三键查找 (76149)
 *   Cq  → quotaPercent                    percentage → 已用百分比 (76152)
 *   $4e → formatQuotaUsage                `NN%` 或 `--` (76157)
 *   wq  → formatQuotaResetTime            date/dateTime（compactToday）(76163)
 *   e3e/t3e → bigmodel/zai logo dataURI 表 (76133)
 *   Tq  → RegionLogo                      区域 logo img（缺省 log-in 图标）(76183)
 *   〔A1-R23 Oq 叠层专项裁定〕n3e/Eq/Dq/Oq/i3e/c3e/l3e/h3e/g3e 并行副本删除：真身逐字 canonical =
 *     Home §U.3（codingPlanProviderFallbackLabel/entitlementEntrySourceId/hasUsableEntitlementSnapshot/
 *     resolveCodingPlanUsageRemaining/hasCodingPlanUsageRemaining）+ §V（quotaLimitTotal/
 *     quotaLimitRemaining/listActiveQuotaLimits/hasStartPlanBalanceDisplay）；本 shim 再导出面
 *     resolvePlanWidgetModel/hasPlanWidgetModel/hasStartPlanBalance 同步移除（全树零消费，负证据在案）。
 *   〔A1-R21 双实例叠层专项裁定〕s3e/v3e 并行副本（含闭包 r3e/a3e/o3e/u3e/d3e/f3e/p3e/m3e/_3e）删除：
 *     bundle 唯一真身 76294/76540（唯一消费 j3e@76837/76840），逐字真身 = Home §V.3/§V.5。
 *     〔A1-R23〕SidebarCodingPlanWidget/SidebarStartPlanWidget shim 别名再导出随最后消费面
 *     （PaymentDeep §1）删除而同步移除（见文件尾墓碑）。
 *   kq  → modelDisplayName                GLM 特判 + 词首大写 (76418)
 *
 * E. 供应商环境/内网探测助手（js 187188–187304 / jsx 151029–151160）
 *   i7  → trimmedOrUndefined              (187484)
 *   aYt → effectiveEnvOverlay             ZCODE_EFFECTIVE_ENV 等（3.7.6 恒空）
 *   oYt/sYt/cYt/lYt → 探测缺省常量（800/2/22/3）
 *   uYt/dYt/fYt → clampTimeoutMs/clampAttempts/clampRequiredSuccessCount
 *   pYt → normalizeProbeTarget            service|tcp 目标归一化
 *   mYt → probeConfigKey                  JSON 稳定键
 *   a7  → sameRequest                     序号相等
 *   hYt → useIntranetProbe                systemService.probeIntranet (187557)
 *   gYt → useZapiEnabled                  环境解析+内网探测 → zapi 可用 (187591)
 *
 * F. 供应商草稿/模型机制（js 187305–187630 / jsx 151161–151416）
 *   _Yt → API_FORMATS                     [anthropic-messages, openai-chat-completions, openai-responses]
 *   vYt → endpointsOfFormatSingle         (187602)
 *   yYt → firstKnownFormatOf              (187605)
 *   bYt → baseUrlOfDraft                  (187610)
 *   xYt → normalizeEndpointPath           补 `/` 前缀 (187613)
 *   SYt → endpointsOfFormats              (187617)
 *   CYt → autoEnableApiKeyProviderDraft   apiKey 模式+系统禁用 → 启用草稿 (187622)
 *   wYt → resolvedBaseUrlOf               (187631)
 *   TYt → endpointsPatchOf                (187635)
 *   o7  → providerDraftDiff               草稿 → 变更供应商 或 null (187641)
 *   EYt → providerDraftOrSelf             diff ?? provider (187669)
 *   DYt → MODEL_KINDS                     [anthropic, openai-compatible, openai]
 *   s7  → filterKnownKinds                (187673)
 *   OYt → filterAllowedKinds              (187677)
 *   c7  → modelToDraft                    (187683)
 *   kYt → parsePositiveInteger            (187692)
 *   AYt → validateModelDraft              invalid(id/kinds/contextWindow/maxOutputTokens)|commit
 *   jYt → selectOnFocus                   (187722)
 *   MYt → ModelMetadataDialog             模型编辑/添加对话框（高级=最大输出）(187429 区 / 151337)
 *
 * G. 供应商表单字段件（js 187631–187935 / jsx 151417–151650）
 *   NYt → formatContextWindowCompact      ja(`en-US`, e)（locale 固定）(187631)
 *   PYt → GetApiKeyLink                   (187930)
 *   FYt → ModelRow                        模型行（id 输入+上下文徽章+测试+编辑+删除）(187944)
 *   IYt → ApiKeyInput                     密码/可见切换 (188122)
 *   LYt → API_FORMAT_LABELS               3 格式 × label/short/title i18n 表 (188155)
 *   RYt → apiFormatTitleOf                (188178)
 *   l7  → API_FORMAT_OPTIONS              同 _Yt（本域副本）(188182)
 *   zYt → API_FORMAT_DEFAULT_PATHS        /v1/messages、/chat/completions、/responses
 *   BYt → apiFormatOptionLabel            `title (path)` (187892)
 *   VYt → ApiFormatSelect                 (188191)
 *   HYt → apiFormatOptionsOfProvider      models.kinds ∩ endpoints → 格式表 (188210)
 *   UYt → PRESET_PROVIDER_IDS             {zai,bigmodel,zapi} (188218)
 *   WYt → CATALOG_SOURCE_ID               `china-llm-zcode-dev` (187923)
 *   GYt → MODEL_LOOKUP_DEBOUNCE_MS        300 (187924)
 *   KYt → lookupMaxOutputTokens           目录供应商模型 → maxOutputTokens (188221)
 *   qYt → isCustomizableProvider          非预设三厂 (188229)
 *
 * H. u7 子段（js 187936–188320 / jsx 151651–151854）
 *   JYt → ProviderCardFormHeader          名称编辑+状态徽章+启用/禁用+用量/删除 (188232)
 *   YYt → ProviderConnectionSection       baseURL+API 格式（只读/编辑双态）(188347)
 *   XYt → ProviderApiKeySection           (188423)
 *   ZYt → ApiKeyDisabledHint              (188457)
 *   QYt → newModelDraft                   空模型草稿（缺省上下文 kee）(188469)
 *   $Yt → ProviderModelsSection           模型列表+添加（目录 maxOutputTokens 300ms 防抖查询）(188474)
 *
 * I. u7 根与目录选择（js 188321–188881 / jsx 151855–152304）
 *   eXt → cleanupSaveMode                 skip-delete|commit (188617)
 *   tXt → isThenable                      (188620)
 *   nXt → runDeleteWithGuard              删除中标志保护（异步复位）(188623)
 *   rXt → resolveNameKeyAction            IME 守卫 Enter=commit/Escape=cancel (188642)
 *   iXt → normalizeModelEntry             字符串 → 模型对象 (188651)
 *   aXt → normalizeProviderModels         过滤 deleted (188656)
 *   oXt → normalizeEndpointPaths          paths → 归一化映射 (188659)
 *   u7  → ProviderConfigCardForm          供应商配置卡表单根 (188672)
 *   sXt → CatalogProviderIcon             radio-tower 方块 (188948)
 *   cXt → CatalogProviderSelect           Popover+cmdk 目录选择 (188954)
 *   lXt → newCustomProvider               空自定义供应商骨架 (189064)
 *   uXt → CUSTOM_CATALOG_SOURCE_ID        `china-llm-zcode-dev` (189078)
 *   dXt…gXt → 添加表单控件 id 常量 ×6 (188783 / 152205 区)
 *   d7  → newAddProviderDraft             添加供应商草稿缺省 (189085)
 *   f7  → AddFormFieldLabel               (189097)
 *   _Xt → defaultKindOfCatalogProvider    (189104)
 *   vXt → joinBaseUrlAndPath              `/` 边界拼接 (189107)
 *   p7  → catalogEndpointUrlOf            (189120)
 *   yXt → catalogProviderToCustom         目录条目 → 自定义供应商 (189124)
 *   bXt → primaryFormatOf                 (189147)
 *   m7  → dedupeModelsById                (189151)
 *   xXt → retargetModelsToFormat          (189158)
 *   SXt → customDraftToProvider           自定义草稿 → 供应商 (189162)
 *
 * J. CXt 与状态行件（js 188882–189189 / jsx 152305–152528）
 *   CXt → AddCustomProviderDraftForm      新建供应商表单（catalog/custom 双路）(189178)
 *   wXt → PlanStatusRow                   续费/到期+管理/解绑（`·` 分隔）(189409)
 *   TXt → StartPlanStatusRow              到期+管理/解绑 (189452)
 *
 * K. Coding Plan 状态/配额展示簇（js 189190–189649 / jsx 152529–152856）
 *   h7  → StatusDotSeparator              `·` (189483)
 *   g7  → StatusActionButton              品牌色下划线按钮 (189486)
 *   EXt → resolveRenewOrExpire            renew 优先 (189495)
 *   DXt → formatUtcShortDate              UTC 短日期（同年省年）(189501)
 *   OXt → formatLocalShortDate            本地短日期（同年省年）(189512)
 *   kXt → PlanLoginDisconnectButtons      登录/断开按钮组 (189522)
 *   AXt → UpgradePlansButton              升级/收起（折扣渐变态）(189567)
 *   jXt → StartPlanPreviewCard            资格+配额数+明细 (189605)
 *   MXt → startPlanPreviewSummary         entitlements → {grantUnitsLabel,unitLabel,detailsDescription} (189676)
 *   NXt → isVisibleModelUsageEntitlement  meter=model_usage && grantUnits>0 && showName (189691)
 *   PXt → formatGrantUnits                ja(locale, e) (189398)
 *   FXt → formatGrantUnitsLocalized       en 紧凑长词形首大写 (189697)
 *   IXt → entitlementDetailsDescription   分组（each/single）× daily/generic (189712)
 *   LXt → groupEntitlementsByGrant        grantUnits → showName[] (189737)
 *   RXt → joinModelNames                  zh `、` / 其余 ` / ` (189745)
 *   zXt → entitlementUnitLabel            daily → `unit/day` 文案 (189748)
 *   BXt → entitlementUnitText             token → tokens 文案 (189754)
 *   VXt → StartPlanBalanceCard            余额卡（标题+到期+限额行）(189759)
 *   HXt → StartPlanLimitRow               名称+百分比+进度+用量 (189809)
 *   UXt → startPlanLimitKey               `${type}:${label}` (189850)
 *   WXt → startPlanLimitTotal             number ?? unit ?? 0 (189853)
 *   GXt → startPlanLimitRemaining         remaining ?? 0 (189856)
 *   KXt → formatRemainingPercent          ≥10% 整数百分比 (189859)
 *   qXt → formatLimitAmount               整数千分位 (189865)
 *   JXt → earliestRenewOrResetTime        renewTime 优先，否则 limits.nextResetTime 最小 (189868)
 *   YXt → formatResetTimeLabel            今天=HH:mm，否则 `Mon d HH:mm` (189877)
 *   XXt → expireLabelOf                   expiresAt 文案 (189893)
 *   ZXt → startPlanLimitName              usageDetails → kq 展示名 (189899)
 *   QXt → normalizeStartPlanModelCode     glm-5-turbo 特判 (189908)
 *   $Xt → StartPlanBalanceCardEmbedded    VXt 薄包装 (189912)
 *   eZt → BigModelUnregisteredHint        未注册提示+注册按钮 (189915)
 *   tZt → isBigModelUnregisteredError     中英文错误模式 (189936)
 *   _7  → USAGE_CHART_COLORS              3 色 CSS 变量 (189945)
 *
 * L. 加载/空态（js 189650–189674 / jsx 152857–152872）
 *   v7  → SectionLoadingPlaceholder       (189946)
 *   nZt → PresetEmptyState                (189958)
 *
 * M. rZt 与配额卡簇（js 189675–190190 / jsx 152873–153247）
 *   rZt → CodingPlanStatusSection         状态区根（登录/购买/解绑/升级/配额/对话框）(189971)
 *   iZt → resolvePlanCardTitle            (190287)
 *   aZt → isStartPlanLevel                start|start plan|* start plan (190298)
 *   oZt → isMaxPlanLevel                  MAX 词边界 (190302)
 *   sZt → CodingPlanQuotaCardRow          5h/周/月 MCP 三卡（缺省回退通用前 3）(190305)
 *   y7  → quotaCardOrNull                 (190358)
 *   cZt → hasVisibleQuotaLimits           (190369)
 *   lZt → isNumericQuotaLimit             percentage/remaining/currentValue/usage (190377)
 *   uZt → genericQuotaLimitLabel          TIME_LIMIT→月 MCP，否则总 token (190385)
 *   dZt → QuotaLimitCard                  标签+模型+百分比+重置时间+进度 (190390)
 *   b7  → findQuotaLimitStrict            type/unit/number（=Sq 的严格变体）(190436)
 *   fZt → quotaUsedPercent                percentage 优先，否则 remaining/number (190439)
 *   pZt → clampPercent0to100              (190452)
 *   mZt → formatQuotaPercent              `--` 或 `NN%` (190455)
 *   hZt → quotaLimitModelsLabel           usageDetails → 去重 `/` 连接 (190460)
 *   gZt → normalizeQuotaModelCode         `model:` 前缀；`_-`→空格 (190469)
 *   _Zt → resolveViewState                loginPending → checking 覆盖 (190477)
 *   vZt → viewStateOf                     三态同步 (190484)
 *
 * N. 卡壳/连接模式导航（js 190191–190378 / jsx 153248–153399）
 *   x7  → ProviderCardShell               header+children (190487)
 *   yZt → ProviderCardHeader              logo+标题+状态徽章+尾随动作 (190490)
 *   bZt → ConnectionModeNav               连接模式下拉（apiKey/startPlan/codingPlan/teamPlan）(190527)
 *   xZt → connectionModeOptionsOf         族内导航项 → 有序选项 (190603)
 *   SZt → teamPlanLabelOrFallback         (190642)
 *   CZt/wZt/TZt/EZt → 购买卡渐变类名 ×4（success/#4099ff/#0ea5e9/#14b8a6）(190349)
 *   DZt → isPlanNavItem                   codingPlan|teamPlan (190649)
 *   OZt → isResolvedTeamPlanItem          organizationId+projectId 非空 (190652)
 *   kZt → mergeTeamPlanSnapshot           team-plan 导航项 × 订阅快照合并 (190659)
 *
 * O. 购买横幅（js 190700–191010 / jsx 153690–153926）
 *   jZt → resolvePurchaseIntent           disconnected→login，其余→purchase (190996)
 *   MZt → CodingPlanPurchaseBanner        startPlan/personal/team 卡列 (190999)
 *   NZt → shouldShowGenericTeamCard       (191209)
 *   PZt → hasSubscribedProduct            (191218)
 *   FZt → teamCardClassOf                 max/advanced→teal，否则 sky (191221)
 *   IZt → teamIconClassOf                 (191225)
 *   LZt → teamDescriptionIdOf             (191229)
 *   RZt → bannerDiscountConfigOf          personal 或 team×断连 → 折扣 (191235)
 *   zZt → productsProviderIdOf            EY ?? e (191243)
 *   BZt → resolveBannerPriceState         最低价>0 → price；全 soldOut → soldOut；bigmodel 缺省 49/598 (191246)
 *   VZt → resolveTeamGroupPriceState      (191264)
 *   HZt → resolveStartPlanTitle           zh 下 `start plan` 回退本地文案 (191271)
 *   UZt → PriceFromLabel                  非 zh `from $X`；zh `¥X 起` (191275)
 *
 * P. 状态标题/导航轨（js 191011–191288 / jsx 153927–154090）
 *   WZt → StatusTitleDescription          (191307)
 *   GZt → statusTitleDescriptionOf        disconnected/notPurchased/unavailable → 标题+描述 (191319)
 *   S7  → draggableProviderIdOf           custom|preset → provider.id (191327)
 *   KZt → reorderProviderIds              active/over → arrayMove (191330)
 *   qZt → groupLoadingOf                  preset→presetLoading，否则 customLoading (191335)
 *   JZt → addCustomLoadingOf              (191338)
 *   YZt → navItemDisplayLabel             preset → 族 label 覆盖 (191341)
 *   XZt → NavRailItem                     普通导航项（选中态/加载/状态点）(191344)
 *   ZZt → handleNavRailItemKey            Enter/Space → 选中 (191398)
 *   QZt → NavRailDraggableItem            dnd-kit 可拖拽项（grip 手柄）(191401)
 *   $Zt → NavRailGroup                    非拖拽分组 (191467)
 *   eQt → ModelProviderNavRail            导航轨根（preset 组 + custom 拖拽组）(191479)
 *   tQt → isProviderSectionRefreshing     presetLoading || customLoading (191582)
 *
 * （接口级，行号登记，不在本批重建）：
 *   zet CodingPlanPurchaseDialog (84412)、Zet 结账面板 (85948)、e5e 支付 QR (79979)、
 *   Xrt/Zrt 计划源选择 (89295)、Mq 供应商选择 (76864)、j3e 配额弹层内容 (76630)、
 *   MY useStartPlanPreview (84254)、EY productsProviderIdOf (83767)、
 *   s5e useCodingPlanProducts (80321)、TY useEnterpriseTeamProducts (83697)、
 *   JY useMessageFormatter (87715)、HY enterpriseTeamGroupsOf (87595)、
 *   nJ productPriceOf (79685)、iJ formatProductPrice (79691)、
 *   Znt providerDisplayName (88222)、trt summarizeModelTestResults (88422)、
 *   srt isApiKeyMissing (88461)、crt navItemIcon (88464)、
 *   （PM 53253/IM 53277 已于 A1-R11 转录 components/usage/UsageDeep.tsx §2b 并经本 shim 导出；旧登记 53205/53229 为漂移标注）、
 *   xZ arrayMove (94125)、cj MarkdownRenderer（Markdown.tsx 已抽取）、
 *   Ao useSettingsStoreValue (1301)、fs useServices (2638)、ps useOptionalServices (2643)、
 *   qse useBaseServices（services.tsx 已抽取）；
 *   src-HCld2afU.js：ot/hr/Vi/nt/Vr/Qr/Lt/Pi/Mn/lt/si/kee/Bn/Ri/Sr/Zt/qr/q/testid 族；
 *   skillStore-BmeKHDBI.js：jee/jte/kr/xn/en；
 *   本 chunk vendored 原语：Dialog(31943)/Command(32092)/Select(46009)/Collapsible(94925)/
 *   dnd-kit(91811–94695)、图标块(26575–28020)。
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() (Z)                       utils-CEEH0K_K.js
 *  3. Button (X)                     button-laUijeDG.js
 *  4. useIntlContext (G)             IntlProvider-C321H7m8.js
 *  5. usePlatformService (l)、Input (P)、Spinner (M)、Popover (T/h/x)、info 图标 (p)
 *                                    imeComposition-DEYFkwWm.js
 *  6. Tooltip (Ia)、formatCompactNumber (ja)
 *                                    usageStatsUiParts-CiR7YEhh.js
 *  7. logger (J)                     logger-PFDwl5Yq.js
 *  8. 供应商/模型助手与 testid（ot/hr/Vi/nt/Vr/Qr/Lt/Pi/Mn/lt/si/kee/Bn/Ri/Sr/Zt/qr/q/…）
 *                                    src-HCld2afU.js
 *  9. 族域/连接设置助手（jee/jte/kr/xn/en）
 *                                    skillStore-BmeKHDBI.js
 * 10. 本 chunk vendored 原语：Dialog/Command/Select/Collapsible/dnd-kit/图标（行号见上）
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/usage/UsageDeep.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  usageErrorOf,
  useAppUsageStats,
  useCodingPlanUsageStats,
  useSubscriptionSnapshot,
  useUsageEntitlementCore,
  providerCacheKey,
  useProviderFamilyConnectionSettings,
  providerFamiliesOfListWrapper,
  hasNoUserOrProviders,
  useBillingDiscount,
  BillingDiscountBadge,
  BillingDiscountInfoDialog,
  BillingDiscountBadgeWithInfo,
  BillingDiscountCard,
  findQuotaLimit,
  quotaPercent,
  formatQuotaUsage,
  formatQuotaResetTime,
  RegionLogo,
  /* 〔A1-R23〕resolvePlanWidgetModel/hasPlanWidgetModel/hasStartPlanBalance 移出——Oq 叠层裁定：
   * 真身逐字 canonical = Home §U.3/§V（见 components/usage/UsageDeep.tsx 墓碑）。 */
  modelDisplayName,
  useIntranetProbe,
  useZapiEnabled,
  providerDraftDiff,
  ModelMetadataDialog,
  ModelRow,
  apiFormatOptionsOfProvider,
  ProviderCardFormHeader,
  ProviderConnectionSection,
  ProviderModelsSection,
  ProviderConfigCardForm,
  AddCustomProviderDraftForm,
  PlanStatusRow,
  StartPlanStatusRow,
  StatusDotSeparator,
  StatusActionButton,
  PlanLoginDisconnectButtons,
  UpgradePlansButton,
  StartPlanPreviewCard,
  startPlanPreviewSummary,
  formatGrantUnits,
  StartPlanBalanceCard,
  StartPlanBalanceCardEmbedded,
  SectionLoadingPlaceholder,
  PresetEmptyState,
  CodingPlanStatusSection,
  CodingPlanQuotaCardRow,
  hasVisibleQuotaLimits,
  QuotaLimitCard,
  findQuotaLimitStrict,
  resolveCodingPlanViewState,
  ProviderCardShell,
  ProviderCardHeader,
  ConnectionModeNav,
  mergeTeamPlanSnapshot,
  resolvePurchaseIntent,
  CodingPlanPurchaseBanner,
  StatusTitleDescription,
  statusTitleDescriptionOf,
  NavRailItem,
  NavRailDraggableItem,
  ModelProviderNavRail,
  isProviderSectionRefreshing,
  // A1-R11（R0 簇 51141–53795 收敛）：供应商源注册表 + 漏斗簇 + 应用设置钩子
  nullSafe,
  providerApiKeyFingerprint,
  shouldProbeStartPlanEntitlement,
  hasActiveEntitlement, // 〔A1-R27〕iM 52651 canonical 导出：PaymentDeep A6e 面 / OnboardingLoginLeaves i6t 面双实例收敛改指
  listCodingPlanSources,
  hasLoadedCodingPlanSources,
  subscribeCodingPlanSources,
  setCodingPlanSources, // 〔A1-R35〕补转导出：PD §11 useModelProvidersStore 族消费接引（原 mM，52687-52694；components 侧同批补 export）
  refreshCodingPlanSourcesForced, // 〔A1-R35〕补转导出：同上（原 gM，52709-52725）
  ensureCodingPlanSources, // 〔A1-R35〕补转导出：同上（原 _M，52726-52742）
  upgradeFunnelContext,
  entryPlanStateOf,
  useAppSettings,
  entitlementFreshnessKey, // 〔A1-R38〕补转导出：PD entitlementCacheKeyOf（Bj）declare 收敛改指（原 Bj，52319-52323；components 侧同批补 export）
} from '../components/usage/UsageDeep'; // resolveModelGroupLabel（iN 53795）A1-R11 删碑：双实例收敛至 SubagentLeaves resolveModelFullLabel（A0 期既有转录）
export type {
  FunnelContext,
  EntryPlanState,
  AppRuntimeSettings,
  AppRuntimeSettingsPatch,
  ModelMetadata,
  ProviderEndpoints,
  ModelProvider,
  CatalogProvider,
  AppUsageSnapshot,
  CodingPlanUsageSnapshot,
  EntitlementQuotaLimit,
  EntitlementSnapshot,
  EntitlementOptions,
  BillingDiscountConfig,
  StartPlanPreview,
  CodingPlanProduct,
  ModelProviderNavItem,
  ModelProviderNavigationGroup,
  UseSubscriptionSnapshotOptions,
  UseSubscriptionSnapshotResult,
  // 〔A1-R23〕PlanWidgetEntitlementEntry/PlanWidgetConfig/PlanWidgetModel 移出——Oq 叠层裁定：三型随
  // components/usage/UsageDeep resolvePlanWidgetModel 副本簇同批删除（全树零消费，负证据在案）
  ProviderFormDraft,
  ModelDraft,
  ProviderConfigCardFormProps,
  AddProviderDraft,
  StartPlanLimit,
  CodingPlanDisplayStatus,
  CodingPlanViewState,
  CodingPlanStatusSectionProps,
} from '../components/usage/UsageDeep';

/* 〔A1-R21〕双实例叠层专项裁定（编排方委托）：s3e/v3e 并行重建——bundle 唯一真身 76294/76540
 * （唯一消费 j3e@76837/76840），树内逐字真身 = Home §V.3/§V.5（A1-R19 机械校验在案）。
 * components/usage/UsageDeep A0 副本（SidebarCodingPlanWidget/SidebarStartPlanWidget）删除，
 * 本 shim 改指 Home 逐字面；别名与导出形不变，PaymentDeep 581/584 消费面零改动
 * （函数声明提升，环安全：Home→本文件→Home 二环，渲染期访问）。证据见 A1-R21.report.md §三。
 * 〔A1-R23〕j3e 叠层专项续：PaymentDeep §1（581/584 消费面）随批删除后，SidebarCodingPlanWidget/
 * SidebarStartPlanWidget shim 别名再导出全树零消费，同批移除（Home CodingPlanUsagePanel/
 * StartPlanBalancePanel 逐字导出面不变；s3e/v3e 的 bundle 消费链 = j3e 76837/76840 → iit 89918，
 * 树内对应 Home §U.10 逐字族直连本面）。 */
