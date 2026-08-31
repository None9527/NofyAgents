// A0-S4-4c: 自 modules/UsageDeep.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/usage/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
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
 *   K$t → usageErrorOf                    错误对象 → 消息字符串 (195171 / 156988)
 *   q$t → useAppUsageStats                app 本地用量快照 hook (195179 / 156996)
 *   J$t → useCodingPlanUsageStats         Coding Plan 用量快照 hook (195206 / 157047)
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
 *   $j  → useSubscriptionSnapshot         权益/订阅快照 hook（薄包装）(52449 / 47188)
 *   eM  → useUsageEntitlementCore         主 hook：缓存/轮询/重置唤醒/去重 (52451 / 47191)
 *   tM  → nullSafe                        e ?? null
 *   nM  → providerApiKeyFingerprint       id:hash(apiKey)
 *   rM  → providerCacheKey                zcode:usage-entitlement:<fp> (52602 / 47401)
 *   jUe → hashApiKey                      31 进制滚动哈希 → 36 进制
 *   iM  → hasActiveEntitlement
 *   AUe → isNoPlanEntitlement
 *   aM  → shouldProbeStartPlanEntitlement
 *   oM/sM/cM/lM/uM/dM → 供应商源注册表模块态（源列表/已加载/失效计数/单飞槽×2/监听集）
 *   fM/pM/mM/hM → listCodingPlanSources/hasLoadedSources/setCodingPlanSources/subscribeCodingPlanSources
 *   MUe/NUe → nextInFlightToken/commitIfCurrent
 *   gM  → refreshCodingPlanSourcesForced  强制刷新（单飞合并）
 *   _M  → ensureCodingPlanSources         惰性加载（单飞合并）
 *   PUe → useProviderFamilyConnectionSettings 双权益（codingPlan/startPlan）→ 连接设置 (52694 / 47475)
 *   vM  → providerFamiliesOf              jte 薄包装
 *   yM  → activeProvidersOf               kr 薄包装
 *   FUe → hasNoUserOrProviders
 *
 * C. 计费折扣簇（js 51857–52041 / jsx 46612–46764）
 *   zHe → BILLING_DISCOUNT_CACHE_TTL_MS   3600*1e3
 *   BHe/VHe → 折扣信息对话框类名常量
 *   lj/uj → 折扣配置缓存/单飞槽
 *   dj  → useBillingDiscount              活动配置 hook (51862 / 46617)
 *   fj  → useBillingDiscountCore
 *   pj  → localizedDiscountCopyOf         locale → {badgeBody/cardTitle/cardBody/infoTitle/infoBody}
 *   mj  → hasDiscountCopy
 *   hj  → BillingDiscountBadge            徽章（gradient/surface/tag）(51911 / 46646 区)
 *   gj  → BillingDiscountBadgeWithInfo    徽章+信息对话框 (51932 / 46660 区)
 *   HHe → BillingDiscountCard             渐变卡 (51946 / 46704)
 *   _j  → BillingDiscountInfoDialog       markdown 信息对话框 (51986 / 46718)
 *   UHe → getCachedBillingDiscount        1h TTL + 单飞
 *   vj  → nonEmptyTrimmed
 *
 * D. 配额助手 + 侧栏计划件（js 76101–76563 / jsx 67394–67700 区）
 *   Sq  → findQuotaLimit                  type/unit/number 三键查找 (76101 / 67394)
 *   Cq  → quotaPercent                    percentage → 已用百分比 (76104 / 67397)
 *   $4e → formatQuotaUsage                `NN%` 或 `--` (76108 / 67400)
 *   wq  → formatQuotaResetTime            date/dateTime（compactToday）(76115 / 67406)
 *   e3e/t3e → bigmodel/zai logo dataURI 表 (76133 / 67426)
 *   Tq  → RegionLogo                      区域 logo img（缺省 log-in 图标）(76135 / 67431)
 *   n3e → codingPlanProviderFallbackName  (76158 / 67437)
 *   Eq  → entitlementSourceId             sourceId ?? providerId
 *   Dq  → hasActiveEntitlementForProvider
 *   Oq  → resolvePlanWidgetModel          多源权益 → 展示模型 (76168 / 67446)
 *   r3e → planWidgetGridCols              1/2/3 列
 *   i3e → hasPlanWidgetModel
 *   a3e → formatResetTimeHm               HH:mm（h23）
 *   o3e → PlanWidgetLimitRow              标签+数值+进度条
 *   s3e → SidebarCodingPlanWidget         侧栏 Coding Plan 配额件 (76246 / 67506)
 *   kq  → modelDisplayName                GLM 特判 + 词首大写 (76370 / 67594)
 *   c3e → limitTotalOf                    number ?? unit ?? 0
 *   l3e → limitRemainingOf                remaining ?? 0
 *   u3e → formatUsedPercent               0–1 → 百分比
 *   d3e → startPlanNextResetTimeOf        subscription.details[0].renewTime → remaining → limits
 *   f3e → formatResetDateTimeCompact      今天=HH:mm，否则 `Mon d HH:mm`
 *   p3e → normalizeModelCode              `model:` 前缀；glm-5-turbo→GLM-5Turbo；其余大写
 *   m3e → limitModelLabel                 usageDetails → 展示名 `/` 连接
 *   h3e → visibleStartPlanLimits          total>0 || remaining>0 过滤
 *   g3e → hasStartPlanBalance
 *   _3e → StartPlanBalanceRow             剩余比进度条
 *   v3e → SidebarStartPlanWidget          侧栏 Start Plan 余额件 (76492 / 67671)
 *
 * E. 供应商环境/内网探测助手（js 187188–187304 / jsx 151029–151160）
 *   i7  → trimmedOrUndefined              (187289 / 151029)
 *   aYt → effectiveEnvOverlay             ZCODE_EFFECTIVE_ENV 等（3.7.6 恒空）
 *   oYt/sYt/cYt/lYt → 探测缺省常量（800/2/22/3）
 *   uYt/dYt/fYt → clampTimeoutMs/clampAttempts/clampRequiredSuccessCount
 *   pYt → normalizeProbeTarget            service|tcp 目标归一化
 *   mYt → probeConfigKey                  JSON 稳定键
 *   a7  → sameRequest                     序号相等
 *   hYt → useIntranetProbe                systemService.probeIntranet (187258 / 151099)
 *   gYt → useZapiEnabled                  环境解析+内网探测 → zapi 可用 (187296 / 151138)
 *
 * F. 供应商草稿/模型机制（js 187305–187630 / jsx 151161–151416）
 *   _Yt → API_FORMATS                     [anthropic-messages, openai-chat-completions, openai-responses]
 *   vYt → endpointsOfFormatSingle         (187306 / 151162)
 *   yYt → firstKnownFormatOf              (187309 / 151165)
 *   bYt → baseUrlOfDraft                  (187314 / 151170)
 *   xYt → normalizeEndpointPath           补 `/` 前缀 (187317 / 151173)
 *   SYt → endpointsOfFormats              (187321 / 151177)
 *   CYt → autoEnableApiKeyProviderDraft   apiKey 模式+系统禁用 → 启用草稿 (187331 / 151187)
 *   wYt → resolvedBaseUrlOf               (187340 / 151201)
 *   TYt → endpointsPatchOf                (187344 / 151205)
 *   o7  → providerDraftDiff               草稿 → 变更供应商 或 null (187345 / 151218)
 *   EYt → providerDraftOrSelf             diff ?? provider (187373 / 151250)
 *   DYt → MODEL_KINDS                     [anthropic, openai-compatible, openai]
 *   s7  → filterKnownKinds                (187377 / 151264)
 *   OYt → filterAllowedKinds              (187381 / 151268)
 *   c7  → modelToDraft                    (187390 / 151277)
 *   kYt → parsePositiveInteger            (187399 / 151286)
 *   AYt → validateModelDraft              invalid(id/kinds/contextWindow/maxOutputTokens)|commit
 *   jYt → selectOnFocus                   (187447 / 151334)
 *   MYt → ModelMetadataDialog             模型编辑/添加对话框（高级=最大输出）(187429 区 / 151337)
 *
 * G. 供应商表单字段件（js 187631–187935 / jsx 151417–151650）
 *   NYt → formatContextWindowCompact      ja(`en-US`, e)（locale 固定）(187631 / 151417)
 *   PYt → GetApiKeyLink                   (187634 / 151420)
 *   FYt → ModelRow                        模型行（id 输入+上下文徽章+测试+编辑+删除）(187649 / 151431)
 *   IYt → ApiKeyInput                     密码/可见切换 (187827 / 151553)
 *   LYt → API_FORMAT_LABELS               3 格式 × label/short/title i18n 表 (187860 / 151570)
 *   RYt → apiFormatTitleOf                (187883 / 151589)
 *   l7  → API_FORMAT_OPTIONS              同 _Yt（本域副本）(187886 / 151595)
 *   zYt → API_FORMAT_DEFAULT_PATHS        /v1/messages、/chat/completions、/responses
 *   BYt → apiFormatOptionLabel            `title (path)` (187892 / 151601)
 *   VYt → ApiFormatSelect                 (187895 / 151604)
 *   HYt → apiFormatOptionsOfProvider      models.kinds ∩ endpoints → 格式表 (187914 / 151630)
 *   UYt → PRESET_PROVIDER_IDS             {zai,bigmodel,zapi} (187922 / 151638)
 *   WYt → CATALOG_SOURCE_ID               `china-llm-zcode-dev` (187923 / 151639)
 *   GYt → MODEL_LOOKUP_DEBOUNCE_MS        300 (187924 / 151640)
 *   KYt → lookupMaxOutputTokens           目录供应商模型 → maxOutputTokens (187925 / 151641)
 *   qYt → isCustomizableProvider          非预设三厂 (187933 / 151648)
 *
 * H. u7 子段（js 187936–188320 / jsx 151651–151854）
 *   JYt → ProviderCardFormHeader          名称编辑+状态徽章+启用/禁用+用量/删除 (187936 / 151651)
 *   YYt → ProviderConnectionSection       baseURL+API 格式（只读/编辑双态）(188051 / 151688)
 *   XYt → ProviderApiKeySection           (188127 / 151715)
 *   ZYt → ApiKeyDisabledHint              (188161 / 151732)
 *   QYt → newModelDraft                   空模型草稿（缺省上下文 kee）(188173 / 151743)
 *   $Yt → ProviderModelsSection           模型列表+添加（目录 maxOutputTokens 300ms 防抖查询）(188178 / 151753)
 *
 * I. u7 根与目录选择（js 188321–188881 / jsx 151855–152304）
 *   eXt → cleanupSaveMode                 skip-delete|commit (188321 / 151855)
 *   tXt → isThenable                      (188324 / 151860)
 *   nXt → runDeleteWithGuard              删除中标志保护（异步复位）(188327 / 151863)
 *   rXt → resolveNameKeyAction            IME 守卫 Enter=commit/Escape=cancel (188346 / 151883)
 *   iXt → normalizeModelEntry             字符串 → 模型对象 (188355 / 151886)
 *   aXt → normalizeProviderModels         过滤 deleted (188360 / 151895)
 *   oXt → normalizeEndpointPaths          paths → 归一化映射 (188363 / 151898)
 *   u7  → ProviderConfigCardForm          供应商配置卡表单根 (188376 / 151911)
 *   sXt → CatalogProviderIcon             radio-tower 方块 (188652 / 152143)
 *   cXt → CatalogProviderSelect           Popover+cmdk 目录选择 (188658 / 152148)
 *   lXt → newCustomProvider               空自定义供应商骨架 (188768 / 152186)
 *   uXt → CUSTOM_CATALOG_SOURCE_ID        `china-llm-zcode-dev` (188782 / 152204)
 *   dXt…gXt → 添加表单控件 id 常量 ×6 (188783 / 152205 区)
 *   d7  → newAddProviderDraft             添加供应商草稿缺省 (188789 / 152211)
 *   f7  → AddFormFieldLabel               (188801 / 152223)
 *   _Xt → defaultKindOfCatalogProvider    (188808 / 152229)
 *   vXt → joinBaseUrlAndPath              `/` 边界拼接 (188811 / 152232)
 *   p7  → catalogEndpointUrlOf            (188824 / 152237)
 *   yXt → catalogProviderToCustom         目录条目 → 自定义供应商 (188828 / 152241)
 *   bXt → primaryFormatOf                 (188851 / 152266)
 *   m7  → dedupeModelsById                (188855 / 152270)
 *   xXt → retargetModelsToFormat          (188862 / 152281)
 *   SXt → customDraftToProvider           自定义草稿 → 供应商 (188866 / 152289)
 *
 * J. CXt 与状态行件（js 188882–189189 / jsx 152305–152528）
 *   CXt → AddCustomProviderDraftForm      新建供应商表单（catalog/custom 双路）(188882 / 152305)
 *   wXt → PlanStatusRow                   续费/到期+管理/解绑（`·` 分隔）(189113 / 152453)
 *   TXt → StartPlanStatusRow              到期+管理/解绑 (189156 / 152495)
 *
 * K. Coding Plan 状态/配额展示簇（js 189190–189649 / jsx 152529–152856）
 *   h7  → StatusDotSeparator              `·` (189190 / 152529)
 *   g7  → StatusActionButton              品牌色下划线按钮 (189193 / 152534)
 *   EXt → resolveRenewOrExpire            renew 优先 (189199 / 152541)
 *   DXt → formatUtcShortDate              UTC 短日期（同年省年）(189205 / 152556)
 *   OXt → formatLocalShortDate            本地短日期（同年省年）(189216 / 152569)
 *   kXt → PlanLoginDisconnectButtons      登录/断开按钮组 (189226 / 152581)
 *   AXt → UpgradePlansButton              升级/收起（折扣渐变态）(189271 / 152605)
 *   jXt → StartPlanPreviewCard            资格+配额数+明细 (189309 / 152628)
 *   MXt → startPlanPreviewSummary         entitlements → {grantUnitsLabel,unitLabel,detailsDescription} (189380 / 152648)
 *   NXt → isVisibleModelUsageEntitlement  meter=model_usage && grantUnits>0 && showName (189395 / 152660)
 *   PXt → formatGrantUnits                ja(locale, e) (189398 / 152663)
 *   FXt → formatGrantUnitsLocalized       en 紧凑长词形首大写 (189401 / 152666)
 *   IXt → entitlementDetailsDescription   分组（each/single）× daily/generic (189416 / 152674)
 *   LXt → groupEntitlementsByGrant        grantUnits → showName[] (189441 / 152695)
 *   RXt → joinModelNames                  zh `、` / 其余 ` / ` (189449 / 152706)
 *   zXt → entitlementUnitLabel            daily → `unit/day` 文案 (189452 / 152709)
 *   BXt → entitlementUnitText             token → tokens 文案 (189458 / 152717)
 *   VXt → StartPlanBalanceCard            余额卡（标题+到期+限额行）(189463 / 152722)
 *   HXt → StartPlanLimitRow               名称+百分比+进度+用量 (189513 / 152753)
 *   UXt → startPlanLimitKey               `${type}:${label}` (189554 / 152766)
 *   WXt → startPlanLimitTotal             number ?? unit ?? 0 (189557 / 152769)
 *   GXt → startPlanLimitRemaining         remaining ?? 0 (189560 / 152772)
 *   KXt → formatRemainingPercent          ≥10% 整数百分比 (189563 / 152775)
 *   qXt → formatLimitAmount               整数千分位 (189569 / 152781)
 *   JXt → earliestRenewOrResetTime        renewTime 优先，否则 limits.nextResetTime 最小 (189572 / 152786)
 *   YXt → formatResetTimeLabel            今天=HH:mm，否则 `Mon d HH:mm` (189581 / 152792)
 *   XXt → expireLabelOf                   expiresAt 文案 (189597 / 152807)
 *   ZXt → startPlanLimitName              usageDetails → kq 展示名 (189603 / 152819)
 *   QXt → normalizeStartPlanModelCode     glm-5-turbo 特判 (189612 / 152826)
 *   $Xt → StartPlanBalanceCardEmbedded    VXt 薄包装 (189616 / 152830)
 *   eZt → BigModelUnregisteredHint        未注册提示+注册按钮 (189619 / 152839)
 *   tZt → isBigModelUnregisteredError     中英文错误模式 (189640 / 152851)
 *   _7  → USAGE_CHART_COLORS              3 色 CSS 变量 (189649 / 152856)
 *
 * L. 加载/空态（js 189650–189674 / jsx 152857–152872）
 *   v7  → SectionLoadingPlaceholder       (189650 / 152857)
 *   nZt → PresetEmptyState                (189662 / 152862)
 *
 * M. rZt 与配额卡簇（js 189675–190190 / jsx 152873–153247）
 *   rZt → CodingPlanStatusSection         状态区根（登录/购买/解绑/升级/配额/对话框）(189675 / 152873)
 *   iZt → resolvePlanCardTitle            (189991 / 153094)
 *   aZt → isStartPlanLevel                start|start plan|* start plan (190002 / 153105)
 *   oZt → isMaxPlanLevel                  MAX 词边界 (190006 / 153109)
 *   sZt → CodingPlanQuotaCardRow          5h/周/月 MCP 三卡（缺省回退通用前 3）(190009 / 153112)
 *   y7  → quotaCardOrNull                 (190062 / 153156)
 *   cZt → hasVisibleQuotaLimits           (190073 / 153165)
 *   lZt → isNumericQuotaLimit             percentage/remaining/currentValue/usage (190081 / 153168)
 *   uZt → genericQuotaLimitLabel          TIME_LIMIT→月 MCP，否则总 token (190089 / 153171)
 *   dZt → QuotaLimitCard                  标签+模型+百分比+重置时间+进度 (190094 / 153178)
 *   b7  → findQuotaLimitStrict            type/unit/number（=Sq 的严格变体）(190140 / 153201)
 *   fZt → quotaUsedPercent                percentage 优先，否则 remaining/number (190143 / 153204)
 *   pZt → clampPercent0to100              (190156 / 153211)
 *   mZt → formatQuotaPercent              `--` 或 `NN%` (190159 / 153214)
 *   hZt → quotaLimitModelsLabel           usageDetails → 去重 `/` 连接 (190164 / 153219)
 *   gZt → normalizeQuotaModelCode         `model:` 前缀；`_-`→空格 (190173 / 153226)
 *   _Zt → resolveViewState                loginPending → checking 覆盖 (190181 / 153229)
 *   vZt → viewStateOf                     三态同步 (190188 / 153240)
 *
 * N. 卡壳/连接模式导航（js 190191–190378 / jsx 153248–153399）
 *   x7  → ProviderCardShell               header+children (190191 / 153248)
 *   yZt → ProviderCardHeader              logo+标题+状态徽章+尾随动作 (190194 / 153254)
 *   bZt → ConnectionModeNav               连接模式下拉（apiKey/startPlan/codingPlan/teamPlan）(190231 / 153271)
 *   xZt → connectionModeOptionsOf         族内导航项 → 有序选项 (190307 / 153331)
 *   SZt → teamPlanLabelOrFallback         (190346 / 153376)
 *   CZt/wZt/TZt/EZt → 购买卡渐变类名 ×4（success/#4099ff/#0ea5e9/#14b8a6）(190349 / 153379)
 *   DZt → isPlanNavItem                   codingPlan|teamPlan (190353 / 153383)
 *   OZt → isResolvedTeamPlanItem          organizationId+projectId 非空 (190356 / 153386)
 *   kZt → mergeTeamPlanSnapshot           team-plan 导航项 × 订阅快照合并 (190363 / 153389)
 *
 * O. 购买横幅（js 190700–191010 / jsx 153690–153926）
 *   jZt → resolvePurchaseIntent           disconnected→login，其余→purchase (190700 / 153690)
 *   MZt → CodingPlanPurchaseBanner        startPlan/personal/team 卡列 (190703 / 153693)
 *   NZt → shouldShowGenericTeamCard       (190913 / 153827)
 *   PZt → hasSubscribedProduct            (190922 / 153836)
 *   FZt → teamCardClassOf                 max/advanced→teal，否则 sky (190925 / 153839)
 *   IZt → teamIconClassOf                 (190929 / 153843)
 *   LZt → teamDescriptionIdOf             (190933 / 153847)
 *   RZt → bannerDiscountConfigOf          personal 或 team×断连 → 折扣 (190939 / 153851)
 *   zZt → productsProviderIdOf            EY ?? e (190947 / 153859)
 *   BZt → resolveBannerPriceState         最低价>0 → price；全 soldOut → soldOut；bigmodel 缺省 49/598 (190950 / 153862)
 *   VZt → resolveTeamGroupPriceState      (190968 / 153888)
 *   HZt → resolveStartPlanTitle           zh 下 `start plan` 回退本地文案 (190975 / 153899)
 *   UZt → PriceFromLabel                  非 zh `from $X`；zh `¥X 起` (190979 / 153907)
 *
 * P. 状态标题/导航轨（js 191011–191288 / jsx 153927–154090）
 *   WZt → StatusTitleDescription          (191011 / 153927)
 *   GZt → statusTitleDescriptionOf        disconnected/notPurchased/unavailable → 标题+描述 (191023 / 153933)
 *   S7  → draggableProviderIdOf           custom|preset → provider.id (191031 / 153943)
 *   KZt → reorderProviderIds              active/over → arrayMove (191034 / 153946)
 *   qZt → groupLoadingOf                  preset→presetLoading，否则 customLoading (191039 / 153951)
 *   JZt → addCustomLoadingOf              (191042 / 153954)
 *   YZt → navItemDisplayLabel             preset → 族 label 覆盖 (191045 / 153957)
 *   XZt → NavRailItem                     普通导航项（选中态/加载/状态点）(191048 / 153960)
 *   ZZt → handleNavRailItemKey            Enter/Space → 选中 (191102 / 153987)
 *   QZt → NavRailDraggableItem            dnd-kit 可拖拽项（grip 手柄）(191105 / 153994)
 *   $Zt → NavRailGroup                    非拖拽分组 (191171 / 154035)
 *   eQt → ModelProviderNavRail            导航轨根（preset 组 + custom 拖拽组）(191183 / 154042)
 *   tQt → isProviderSectionRefreshing     presetLoading || customLoading (191286 / 154088)
 *
 * Q. A1-R11 转录簇（R0 簇 51141–53795 之 UsageDeep 属主成员；行号为 bundle 真身）：
 *   tM → nullSafe                          (52642) 双归属：MPSS 经名 toManagedProvider / PaymentDeep 经名 providerEntryOrNull
 *   nM → providerApiKeyFingerprint        (52645) PaymentDeep 经名 providerFingerprintKeyOf
 *   aM → shouldProbeStartPlanEntitlement  (52661)
 *   fM → listCodingPlanSources            (52681) 消费面经名 getModelProvidersCached（Onboarding/AppRootLeaves）
 *   pM → hasLoadedCodingPlanSources       (52684) 消费面经名 isModelProviderSnapshotHydrated
 *   hM → subscribeCodingPlanSources       (52695) 消费面经名 subscribeModelProviders（AppRootLeaves）
 *   UUe → newPurchaseFunnelId             (53249) | qUe → fallbackPurchaseFunnelId (53417)
 *   PM → upgradeFunnelContext             (53253) 别名 trackPlanCardEvent（本文件 513 区墓碑）
 *   GUe → providerFamilyOfFunnelProvider  (53387) | KUe → funnelChannelOfFamily (53397)
 *   IM → entryPlanStateOf                 (53277) | UM → isStartPlanLevelWordBoundary (53406)
 *   WM/GM/KM/qM/YUe → §2c 模块态/监听/单飞  (53465/53468/53471)
 *   JM → useAppSettings                   (53488)
 *   rN/iN（53790/53795）→ §2d 删碑：双实例收敛至 SubagentLeaves
 *   composeProviderModelLabel/resolveModelFullLabel（A0 期既有转录，jsx 48436/48441）
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
 *   （PM 53253/IM 53277 已于 A1-R11 转录 §2b，旧登记行 53205/53229 为漂移标注）、
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

import * as React from "react";
import { Dialog as DialogRoot, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Command as CommandRoot, CommandItem } from '../../modules/QuickPick'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { CommandInput } from '../ui/command'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Select as SelectRoot } from '../../modules/Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Collapsible as CollapsibleRoot, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { ChevronDownIcon, PencilIcon, Trash2 as TrashIcon, UnplugIcon, RadioTowerIcon, EyeOffIcon, EyeIcon, AstroidIcon, ArrowRightIcon, UsersIcon, CircleIcon, GripVerticalIcon, ArrowLeftIcon, RocketIcon, Sparkles as SparklesIcon, TrendingUpIcon, LogInIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）。A1-R20：+SparklesIcon（原 HHe 52013 消费 f=S=Gt=x('sparkles')，imeComposition 11796/styles 345 导入链实证；A0-S3b 误映 RocketIcon）
import { InfoIcon, Input, Popover as PopoverRoot, PopoverContent, PopoverTrigger, SpinnerIcon, usePlatformService } from '../../modules/ImeComposition'; // PopoverRoot（原 n=T 根）；A0-CLEANUP3 #38：SpinnerIcon/InfoIcon/usePlatformService 改由属主导出
import { MarkdownRenderer, type CodePreviewSettings } from '../../modules/MarkdownIntegration';
import { useCodingPlanProducts, useStartPlanPreview } from '../../modules/PaymentDeep';
import { CommandEmpty, CommandList } from '../../modules/QuickPick';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../modules/Settings';
import { logger } from '../../modules/SkillStore';
import { isStartPlanProviderId, isZaiPlanProviderId } from '../../modules/SrcSharedA'; // +isZaiPlanProviderId（A1-R11：GUe 53391 消费，原 vl/tr）
import { APP_RUNTIME_PREFERENCES_STORAGE_KEY } from '../../modules/SrcSharedB'; // A1-R11：JM 53535 消费 fS 广播道（styles `T as Tr` ← src 导出表 `APP_RUNTIME_PREFERENCES_STORAGE_KEY as T`）；原 rN 53791 之 dr 依赖随 §2d 删碑收敛至 SubagentLeaves（其自持 canonicalProviderIdOf declare = Jx）
import { useBaseServices, useServices, useServicesOptional as useOptionalServices } from '../../modules/services'; // A0-CLEANUP3 #44：ps useOptionalServices 属主为 services.useServicesOptional
import { useSettingsStoreValue } from '../../modules/stores-core'; // A0-CLEANUP3 #44：Ao useSettingsStoreValue 属主为 stores-core（具名导出）
import { cn } from '../../modules/UtilsCn'; // 类名合并（原 Z）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // intl 上下文（原 G()）
import { Button } from '../../modules/button'; // Button（原 X，button-laUijeDG.js）
import { InfoTooltip as Tooltip, formatNumberCompact as formatCompactNumber, type UsageHeatmapWeekInput } from '../../modules/UsageStatsUiParts'; // Tooltip（原 Ia = usageStatsUiParts u）；formatCompactNumber（原 ja = usageStatsUiParts l；A0-D-Misc 裁决：真实签名 (locale, value)，调用面已按 bundle NYt/PXt 翻正）；A0-CLEANUP3 3b：heatmap 具型

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

/** react-intl 风格 intl 对象——A0-D-Misc：useIntlContext 已接线 I18n.useZCodeIntl，此接口仅供本族签名引用 */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}

/* A0-CLEANUP3 #38：SpinnerIcon（w）/InfoIcon（T=Ht）/usePlatformService（l=M）已由 ImeComposition 属主导出，原 declare 移除 */

/* --- Popover 原语（imeComposition：n=T 根 / a=h 触发 / i=x 内容）——A0-D-Misc：PopoverRoot 已接线 ImeComposition.Popover --- */

/* --- Dialog 原语（本 chunk 31943–32034：zb/Bb/Hb/Ub/Gb/Kb/Wb） --- */
/* ── tombstone（A0-S3c）：CollapsibleContent、CollapsibleRoot、CollapsibleTrigger、CommandInput、CommandItem、CommandRoot、DialogContent、DialogDescription、DialogFooter、DialogHeader、DialogRoot、DialogTitle、DialogTrigger、SelectRoot declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */







/* --- Command 原语（本 chunk 32092–32175：Yb/Xb/Zb/Qb/ex，cmdk 封装） --- */




/* --- Select 原语（本 chunk 46009–46072：iO/oO/aO/sO/cO） --- */


/* --- Collapsible 原语（本 chunk 94925–94931：kZ/AZ/jZ） --- */




/* --- dnd-kit（本 chunk vendored 91811–94695：_Z/EZ/DZ/UX/WX/aZ/rZ/ist/KX/TZ/BX） --- */
declare const PointerSensor: unknown; // aZ
declare const KeyboardSensor: unknown; // rZ
declare const sortableKeyboardCoordinates: unknown; // ist（94475）
declare const closestCenterCollision: unknown; // KX（92201）
declare const verticalListSortingStrategy: unknown; // TZ（94194）
declare function useSensor(type: unknown, options?: unknown): unknown; // UX（92145）
declare function useSensors(...sensors: unknown[]): unknown; // WX（92148）
declare const dndTransform: { Transform: { toString(transform: unknown): string } }; // BX（91956）
declare const DndContext: React.FC<{
  sensors: unknown;
  collisionDetection: unknown;
  onDragEnd: (event: { active: { id: string | number }; over: { id: string | number } | null }) => void;
  children: React.ReactNode;
}>; // _Z（93473）
declare const SortableContext: React.FC<{ items: string[]; strategy: unknown; children: React.ReactNode }>; // EZ（94241）
declare function useDraggable(opts: { id: string; disabled?: boolean }): {
  attributes: React.ButtonHTMLAttributes<HTMLButtonElement>;
  listeners: React.ButtonHTMLAttributes<HTMLButtonElement>;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  setNodeRef: (node: HTMLElement | null) => void;
  transform: unknown;
  transition: string | undefined;
  isDragging: boolean;
}; // DZ（94331）

/* --- 图标（本 chunk 26575–28020 vendored lucide 块，Sa 工厂） --- */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（16）：ChevronDownIcon/PencilIcon/TrashIcon/UnplugIcon/RadioTowerIcon/EyeOffIcon/EyeIcon/AstroidIcon/ArrowRightIcon/UsersIcon/CircleIcon/GripVerticalIcon/ArrowLeftIcon/RocketIcon/TrendingUpIcon/LogInIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* --- src-HCld2afU.js：供应商/模型域助手（未重建 chunk，接口级） --- */
interface ModelProviderFamily {
  id: string;
  label: string;
  oauthProviderId: string;
  apiKeyProviderId: string;
  startPlanProviderId?: string;
  codingPlanProviderId?: string;
  [key: string]: unknown;
}
declare function familyOfPresetId(presetId: string): ModelProviderFamily | null; // ot（src 块 B）
declare function apiFormatOfProvider(provider: ModelProvider): string; // hr（Ro）
declare function baseUrlOfProvider(provider: ModelProvider): string; // Vi（zo）
declare function isFullModelEntry(model: unknown): model is ModelMetadata; // nt（Ao）
declare function defaultKindOfProvider(provider: ModelProvider): string; // Vr（Vo）
declare function createModel(opts: {
  id: string;
  kinds: string[];
  defaultKind: string;
  contextWindow?: number;
}): ModelMetadata; // Qr（bo）
declare function kindOfApiFormat(apiFormat: string): string; // Lt（Fo）
declare function defaultPathOfKind(kind: string): string; // Pi（xo）
declare function isBuiltInModelId(modelId: string): boolean; // Mn（Mo）
declare function contextWindowOf(modelId: string, fallback?: number): number; // lt（Bo）
declare const BUILTIN_MODEL_CONTEXT_WINDOW: number; // si（go）
declare const DEFAULT_MODEL_CONTEXT_WINDOW: number; // kee（_o）
declare const BIGMODEL_REGION: string; // Ri（yt，`bigmodel`）
declare function endpointKindsOf(endpoints: ProviderEndpoints): string[]; // Sr（So）
declare function apiFormatOfKind(kind: string): string; // Zt（Ho）
declare function joinTestId(prefix: string, suffix: string): string; // qr（Xa）
declare const PROVIDER_IDS: {
  zai: string;
  bigmodel: string;
  zapi: string;
  zaiCodingPlan: string;
  bigmodelCodingPlan: string;
  zaiStartPlan: string;
  bigmodelStartPlan: string;
}; // q（mo）
declare const API_KEY_INPUT_TESTID: string; // Aee
declare const MODEL_INPUT_TESTID_PREFIX: string; // dre
declare const MODEL_DELETE_TESTID_PREFIX: string; // Vee
declare const ADD_MODEL_BUTTON_TESTID: string; // hte
declare const CONNECTION_MODE_TRIGGER_TESTID: string; // gre
declare const CONNECTION_MODE_ITEM_TESTID_PREFIX: string; // rre
declare const NAV_ITEM_TESTID_PREFIX: string; // Cr

/* --- skillStore-BmeKHDBI.js：族域/连接设置助手（未重建 chunk，接口级） --- */
declare function resolveFamilyConnectionSettings(opts: {
  providerFamilyDomain: unknown;
  modelProviderFamilySelectedKeys: string[];
  codingPlanEntitlement: EntitlementSnapshot | null;
  startPlanEntitlement: EntitlementSnapshot | null;
  now: number;
  entitlementCacheTtlMs: number;
}): unknown; // jee（_t）
declare function providerFamiliesOfList(selectedKeys: string[]): unknown[]; // jte（jo）
declare function activeProvidersOf(providers: unknown[] | undefined): unknown; // kr（To）
declare function providerFamilyDomainOf(workspacePath: string | null): unknown; // xn
declare function familyConnectionSettingsOf(domain: unknown): { codingPlanProviderId?: string; startPlanProviderId?: string } | null; // en

/* --- 本 chunk 跨域符号（接口级；行号见头部映射） --- */
declare function providerDisplayName(provider: ModelProvider): string; // Znt（88222）
declare function summarizeModelTestResults(
  results: unknown[]
): { success: boolean; failureReason?: string; noEndpointResult?: boolean }; // trt（88422）
declare function isApiKeyMissing(apiKey: string): boolean; // srt（88461）
declare function navItemIcon(item: ModelProviderNavItem): React.ReactNode; // crt（88464）
/* ── tombstone（A1-R11）：trackPlanCardEvent（原 PM，js 53253——普查行 53205 为漂移标注）/
 *    entryPlanStateOf（原 IM，js 53277——普查行 53229 同漂移）declare 删除：
 *    PM/IM 真形已逐字转录本文件 §2b（upgradeFunnelContext/entryPlanStateOf，返回 FunnelContext/
 *    EntryPlanState 对象面，非旧注之 string 近似）。190053 区调用面经下方别名逐字不变。 ── */
const trackPlanCardEvent = upgradeFunnelContext; // 原 PM（53253）：本文件 De 调用面（190053 区）别称
declare function arrayMove<T>(items: T[], from: number, to: number): T[]; // xZ（94125）
declare function productsProviderIdOf(providerId: string): string; // EY（83767）
declare function useEnterpriseTeamProducts(opts: { enabled: boolean; authenticated: boolean }): {
  snapshot: { productList: CodingPlanProduct[] } | null;
  loading: boolean;
  error: string | null;
}; // TY（83697）
declare function useMessageFormatter(intl: IntlShape): (id: string, fallback: string) => string; // JY（87715）
declare function enterpriseTeamGroupsOf(
  products: CodingPlanProduct[],
  opts: { locale: string; formatMessage: (id: string, fallback: string) => string }
): Array<{ key: string; title: string; products: CodingPlanProduct[] }>; // HY（87595）
declare function productPriceOf(product: CodingPlanProduct): number | null; // nJ（79685）
declare function formatProductPrice(price: number, currency: string | undefined, locale: string): string; // iJ（79691）
declare const CodingPlanPurchaseDialog: React.FC<{
  open: boolean;
  providerId: string;
  productsProviderId?: string;
  currentPlanLevel?: string;
  currentProductId?: string;
  productsRefreshToken?: number;
  loginLoading?: boolean;
  codingPlanPurchaseTokenAuthenticated?: boolean;
  accountRequirementVisible?: boolean;
  autoRecoverAuthOnOAuthRequired?: boolean;
  initialAudience?: "personal" | "team";
  funnelContext?: FunnelContext | null; // A1-R11 精化：PM 53253 返回对象真形（原 string 近似删除）
  onLogin?: () => void;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: () => void;
  [key: string]: unknown;
}>; // zet（84412）
/* A0-CLEANUP3 #44：Ao useSettingsStoreValue 属主为 stores-core（具名导出），ps useOptionalServices 属主为 services.useServicesOptional，declare 移除 */

/* --- 服务接口（宿主侧实现，经服务解析注入） --- */
interface UsageStatsService {
  getAppUsageSnapshot(opts: { range: string; timeZone: string }): Promise<AppUsageSnapshot>;
  getCodingPlanUsageSnapshot(opts: {
    range: string;
    preferredProviderId: string;
    organizationId: string | null;
    projectId: string | null;
    timeZone: string;
  }): Promise<CodingPlanUsageSnapshot>;
  getEntitlementSnapshot(opts: EntitlementOptions): Promise<EntitlementSnapshot>;
}
interface ModelProviderService {
  getCatalogProviders(sourceId: string): Promise<CatalogProvider[]>;
  [key: string]: unknown;
}
interface OAuthService {
  refreshToken(): Promise<void>;
  logoutAll(): Promise<void>;
  [key: string]: unknown;
}
interface SystemService {
  probeIntranet(config: unknown): Promise<{ isIntranet: boolean } | null>;
  [key: string]: unknown;
}
interface CodingPlanSubscriptionService {
  getBillingDiscount(): Promise<BillingDiscountConfig | undefined>;
  getStartPlanPreview?(): Promise<StartPlanPreview | null>;
  [key: string]: unknown;
}

/* --- 领域模型类型 --- */
export interface ModelMetadata {
  id: string;
  name?: string;
  kinds: string[];
  defaultKind?: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  modified?: boolean;
  deleted?: boolean;
  [key: string]: unknown;
}
export interface ProviderEndpoints {
  baseURL?: string;
  anthropic?: string;
  openai?: string;
  gemini?: string;
  paths?: Record<string, string>;
  [key: string]: unknown;
}
export interface ModelProvider {
  id: string;
  name: string;
  apiFormat?: string;
  defaultKind?: string;
  source?: string;
  endpoints: ProviderEndpoints;
  apiKey: string;
  apiKeyRequired?: boolean;
  catalogProviderId?: string;
  catalogSourceId?: string;
  models: ModelMetadata[];
  headers?: Record<string, string>;
  enabled?: boolean;
  systemDisabledReason?: string | null; // A0-CLEANUP3 3b：与 SettingsPanels 本地 ModelProvider 互指
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}
export interface CatalogProvider {
  id: string;
  name: string;
  endpoints: { baseURL: string; paths?: Record<string, string> };
  models: ModelMetadata[];
  defaultKind?: string;
  [key: string]: unknown;
}
export interface AppUsageSnapshot {
  range: string;
  generatedAt: number;
  summary: {
    totalTokens: number;
    totalSessions: number;
    totalTurns: number;
    activeDays: number;
    currentStreakDays: number;
    favoriteModel?: { modelId: string; share: number } | null;
  };
  heatmap: { weeks: UsageHeatmapWeekInput[] }; // A0-CLEANUP3 3b：对齐 UsageHeatmap 消费面
  [key: string]: unknown;
}
export interface CodingPlanUsageSnapshot {
  range: string;
  generatedAt: number;
  quota?: { limits?: EntitlementQuotaLimit[] };
  sourceProvider: { id: string; name: string };
  modelUsage: {
    totalTokensUsage: number;
    xTime: unknown[];
    granularity: string;
    modelSummaryList: Array<{ modelName: string; totalTokens: number }>;
    modelDataList: Array<{ modelName: string; tokensUsage: number[] }>;
  };
  toolUsage: {
    xTime: unknown[];
    granularity: string;
    toolSummaryList: Array<{ toolName: string; totalUsageCount: number }>;
    toolDataList: Array<{ toolName: string; usageCount: number[] }>;
  };
  [key: string]: unknown;
}
export interface EntitlementQuotaLimit {
  type: string;
  unit?: number;
  number?: number;
  percentage?: number;
  remaining?: number;
  currentValue?: number;
  usage?: number;
  nextResetTime?: number;
  usageDetails?: Array<{ displayName?: string; modelCode: string }>;
  [key: string]: unknown;
}
export interface EntitlementSnapshot {
  provider?: { id: string; name?: string } | null;
  context?: { scope?: string; organizationId?: string; projectId?: string } | null;
  quota?: { level?: string; limits?: EntitlementQuotaLimit[] } | null;
  // A1-R11 精化：details 元素补 productName/productId（bundle IM 53280–53281 读面真形）
  subscription?: { details?: Array<{ renewTime?: string; expireTime?: string; productName?: string; productId?: string }> } | null;
  remaining?: { nextResetTime?: number } | null;
  unavailableReason?: string | null;
  [key: string]: unknown;
}
export interface EntitlementOptions {
  includeSubscription?: boolean;
  preferredProviderId?: string;
  allowDisabledPreferredProvider?: boolean;
  requirePreferredProvider?: boolean;
  allowEnvApiKey?: boolean;
  organizationId?: string | null;
  projectId?: string | null;
}
export interface BillingDiscountConfig {
  [locale: string]: {
    badgeBody?: string;
    cardTitle?: string;
    cardBody?: string;
    infoTitle?: string;
    infoBody?: string;
  };
}
export interface StartPlanPreview {
  name: string;
  entitlements: Array<{
    meter: string;
    grantUnits: number;
    showName: string;
    period: string;
    unitType: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}
export interface CodingPlanProduct {
  productId: string;
  productName?: string;
  tier: string;
  priceCurrency?: string;
  soldOut?: boolean;
  subscribed?: boolean;
  payAmount?: number;
  discountAmount?: number;
  renewAmount?: number;
  priceUnit?: string;
  staticCatalogAvailable?: boolean;
  [key: string]: unknown;
}
export type ModelProviderNavItem = {
  key: string;
  label: string;
  type: "preset" | "codingPlan" | "teamPlan" | "custom" | "addCustom" | "codingPlanLoading";
  presetId?: string;
  provider?: ModelProvider;
  teamPlanName?: string;
  organizationId?: string;
  projectId?: string;
  statusActive?: boolean;
  status?: string;
  planLevel?: string;
  [key: string]: unknown;
};
export interface ModelProviderNavigationGroup {
  id: string;
  title: string;
  items: ModelProviderNavItem[];
}

/* ============================================================================
 * 1. 用量数据 hook（原 K$t/q$t/J$t，js 195171–195258 / jsx 156988–157118）
 * ==========================================================================*/

/** 原 K$t（js 195171）：错误对象 → 消息字符串 */
export function usageErrorOf(error: unknown): string {
  if (error instanceof Error) return error.message || error.name || String(error);
  if (typeof error == `object` && error && `message` in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message == `string` && message.length > 0) return message;
  }
  return String(error);
}

/** 原 q$t（js 195179）：app 本地用量快照 hook（序号防竞态；保留旧快照刷新） */
export function useAppUsageStats(range: string): {
  snapshot: AppUsageSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const { usageStatsService } = useServices() as unknown as { usageStatsService: UsageStatsService }; // A0-D-Misc 类型收敛：BaseServices 索引签名为 unknown；A0-CLEANUP3 3b：交集型不再直接可比，二段断言
  const [state, setState] = React.useState<{ snapshot: AppUsageSnapshot | null; loading: boolean; error: string | null }>({
    snapshot: null,
    loading: false,
    error: null,
  });
  const requestSeq = React.useRef(0);
  const refresh = React.useCallback(async () => {
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setState((previous) => ({ snapshot: previous.snapshot, loading: true, error: null }));
    try {
      const snapshot = await usageStatsService.getAppUsageSnapshot({ range, timeZone });
      if (requestSeq.current !== seq) return;
      setState({ snapshot, loading: false, error: null });
    } catch (error) {
      if (requestSeq.current !== seq) return;
      const message = usageErrorOf(error);
      logger.warn(`[useAppUsageStats] 读取本地使用统计失败`, { range, timeZone, error: message });
      setState((previous) => ({ snapshot: previous.snapshot, loading: false, error: message }));
    }
  }, [range, usageStatsService]);
  React.useEffect(() => {
    refresh();
  }, [refresh]);
  return { ...state, refresh };
}

/** 原 J$t（js 195206）：Coding Plan 用量快照 hook（源键变更 → 清快照；同键保留） */
export function useCodingPlanUsageStats(
  range: string,
  opts: { enabled?: boolean; preferredProviderId?: string; organizationId?: string; projectId?: string }
): { snapshot: CodingPlanUsageSnapshot | null; loading: boolean; error: string | null; refresh: () => void } {
  const { usageStatsService } = useServices() as unknown as { usageStatsService: UsageStatsService }; // A0-D-Misc 类型收敛：BaseServices 索引签名为 unknown；A0-CLEANUP3 3b：交集型不再直接可比，二段断言
  const [state, setState] = React.useState<{ snapshot: CodingPlanUsageSnapshot | null; loading: boolean; error: string | null }>({
    snapshot: null,
    loading: false,
    error: null,
  });
  const requestSeq = React.useRef(0);
  const enabled = opts.enabled ?? true;
  const preferredProviderId = opts.preferredProviderId;
  const organizationId = opts.organizationId?.trim() || null;
  const projectId = opts.projectId?.trim() || null;
  const sourceKey = [preferredProviderId ?? ``, organizationId ?? ``, projectId ?? ``].join(`\0`);
  const lastSourceKey = React.useRef(sourceKey);
  const refresh = React.useCallback(async () => {
    if (!enabled || !preferredProviderId) {
      setState({ snapshot: null, loading: false, error: null });
      return;
    }
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const sameSource = lastSourceKey.current === sourceKey;
    lastSourceKey.current = sourceKey;
    setState((previous) => ({ snapshot: sameSource ? previous.snapshot : null, loading: true, error: null }));
    try {
      const snapshot = await usageStatsService.getCodingPlanUsageSnapshot({
        range,
        preferredProviderId,
        organizationId,
        projectId,
        timeZone,
      });
      if (requestSeq.current !== seq) return;
      setState({ snapshot, loading: false, error: null });
    } catch (error) {
      if (requestSeq.current !== seq) return;
      const message = usageErrorOf(error);
      logger.warn(`[useCodingPlanUsageStats] 读取 Coding Plan 使用统计失败`, {
        range,
        preferredProviderId,
        organizationId,
        projectId,
        timeZone,
        error: message,
      });
      setState({ snapshot: null, loading: false, error: message });
    }
  }, [enabled, organizationId, preferredProviderId, projectId, range, sourceKey, usageStatsService]);
  React.useEffect(() => {
    refresh();
  }, [refresh]);
  return { ...state, refresh };
}

/* ============================================================================
 * 2. 订阅权益数据层（原 $j/eM 簇，js 52266–52745 / jsx 47016–47522）
 * ==========================================================================*/

/** 原 uUe/dUe（js 52266–52267）：权益 localStorage 缓存前缀与 TTL */
const USAGE_ENTITLEMENT_CACHE_PREFIX = `zcode:usage-entitlement:`;
const USAGE_ENTITLEMENT_CACHE_TTL_MS = 600 * 1e3;

/** 原 zj（js 52268）：localStorage 守卫（`typeof window > "u"` = undefined 判定，压缩器惯用法） */
function entitlementCacheStorage(): Storage | null {
  return typeof window === `undefined` ? null : (window.localStorage ?? null);
}

/** 原 Bj（js 52270）：providerId+指纹 → 缓存键（任一为空 → 空键） */
function entitlementFreshnessKey(opts: { providerId: string; providerFingerprint: string }): string {
  const providerId = opts.providerId.trim();
  const fingerprint = opts.providerFingerprint.trim();
  return !providerId || !fingerprint ? `` : `${USAGE_ENTITLEMENT_CACHE_PREFIX}${providerId}:${fingerprint}`;
}

/** 原 fUe（js 52276）：localStorage 读（TTL 过期 → 删除并返回 null） */
function readCachedEntitlementSnapshot(opts: {
  cacheKey: string;
  now?: () => number;
  ttlMs?: number;
}): EntitlementSnapshot | null {
  const cacheKey = opts.cacheKey.trim();
  if (!cacheKey) return null;
  try {
    const storage = entitlementCacheStorage();
    const raw = storage?.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { cachedAt?: unknown; snapshot?: EntitlementSnapshot | null };
    const cachedAt = typeof parsed.cachedAt == `number` ? parsed.cachedAt : 0;
    const snapshot = parsed.snapshot;
    const now = opts.now?.() ?? Date.now();
    if (!snapshot || now - cachedAt > (opts.ttlMs ?? 6e5)) {
      storage?.removeItem(cacheKey);
      return null;
    }
    return snapshot;
  } catch {
    return null;
  }
}

/** 原 pUe（js 52292）：localStorage 写（静默失败） */
function writeCachedEntitlementSnapshot(opts: { cacheKey: string; snapshot: EntitlementSnapshot; now?: () => number }): void {
  const cacheKey = opts.cacheKey.trim();
  if (cacheKey)
    try {
      entitlementCacheStorage()?.setItem(cacheKey, JSON.stringify({ cachedAt: opts.now?.() ?? Date.now(), snapshot: opts.snapshot }));
    } catch {}
}

/** 原 mUe/hUe/Vj/Hj/Uj/Wj/Gj（js 52299–52305）：轮询间隔/重置宽限/退避阶梯/缓存表 */
const ACTIVE_AUTO_REFRESH_INTERVAL_MS = 5 * 6e4;
const IDLE_AUTO_REFRESH_INTERVAL_MS = 30 * 6e4;
const RESET_REFRESH_SLACK_MS = 1e4;
const FAILURE_BACKOFF_STEPS_MS = [3e4, 6e4, 12e4, 3e5];
const snapshotCacheByService = new WeakMap<object, Map<string, { failureCount: number; nextAllowedAt: number; snapshot: EntitlementSnapshot | null; updatedAt: number }>>();
const snapshotListenersByService = new WeakMap<object, Map<string, Set<(snapshot: EntitlementSnapshot) => void>>>();
const failureCacheByService = new WeakMap<object, Map<string, { failureCount: number; nextAllowedAt: number }>>();

/** 原 Kj（js 52306）：选项 → 稳定 JSON 键 */
function entitlementOptionsKey(options: EntitlementOptions): string {
  return JSON.stringify({
    includeSubscription: options.includeSubscription,
    preferredProviderId: options.preferredProviderId ?? ``,
    allowDisabledPreferredProvider: options.allowDisabledPreferredProvider,
    requirePreferredProvider: options.requirePreferredProvider,
    allowEnvApiKey: options.allowEnvApiKey ?? null,
    organizationId: options.organizationId ?? null,
    projectId: options.projectId ?? null,
  });
}

/** 原 gUe（js 52317）：cacheKey+选项 → 新鲜度键 */
function entitlementFreshnessKeyOf(opts: { cacheKey: string; options: EntitlementOptions }): string {
  return JSON.stringify({ cacheKey: opts.cacheKey, request: JSON.parse(entitlementOptionsKey(opts.options)) });
}

/** 原 qj（js 52320）：服务 → 快照缓存表（惰性建表） */
function snapshotCacheOf(service: object) {
  let cache = snapshotCacheByService.get(service);
  if (!cache) {
    cache = new Map();
    snapshotCacheByService.set(service, cache);
  }
  return cache;
}

/** 原 Jj（js 52324）：服务 → 失败退避表（惰性建表） */
function failureCacheOf(service: object) {
  let cache = failureCacheByService.get(service);
  if (!cache) {
    cache = new Map();
    failureCacheByService.set(service, cache);
  }
  return cache;
}

/** 原 _Ue（js 52328）：读缓存快照 */
function getCachedSnapshot(opts: { usageStatsService: object; freshnessKey: string }): EntitlementSnapshot | null {
  return snapshotCacheOf(opts.usageStatsService).get(opts.freshnessKey)?.snapshot ?? null;
}

/** 原 vUe（js 52331）：写缓存快照（清失败表 + 广播监听集） */
function setCachedSnapshot(opts: { usageStatsService: object; freshnessKey: string; snapshot: EntitlementSnapshot }): void {
  snapshotCacheOf(opts.usageStatsService).set(opts.freshnessKey, {
    failureCount: 0,
    nextAllowedAt: 0,
    snapshot: opts.snapshot,
    updatedAt: Date.now(),
  });
  failureCacheOf(opts.usageStatsService).delete(opts.freshnessKey);
  const listeners = snapshotListenersByService.get(opts.usageStatsService)?.get(opts.freshnessKey);
  if (listeners) for (const listener of listeners) listener(opts.snapshot);
}

/** 原 yUe（js 52340）：失败计数 → 阶梯退避（30s/60s/120s/300s） */
function recordFailureBackoff(opts: { usageStatsService: object; freshnessKey: string }): void {
  const snapshotCache = snapshotCacheOf(opts.usageStatsService);
  const failureCache = failureCacheOf(opts.usageStatsService);
  const cached = snapshotCache.get(opts.freshnessKey);
  const failureCount = (cached?.failureCount ?? failureCache.get(opts.freshnessKey)?.failureCount ?? 0) + 1;
  const backoffMs = FAILURE_BACKOFF_STEPS_MS[Math.min(failureCount - 1, FAILURE_BACKOFF_STEPS_MS.length - 1)] ?? FAILURE_BACKOFF_STEPS_MS[FAILURE_BACKOFF_STEPS_MS.length - 1];
  const nextAllowedAt = Date.now() + backoffMs;
  failureCache.set(opts.freshnessKey, { failureCount, nextAllowedAt });
  if (cached) snapshotCache.set(opts.freshnessKey, { ...cached, failureCount, nextAllowedAt });
}

/** 原 bUe（js 52352）：监听集注册（空集回收 → 空表回收） */
function subscribeCachedSnapshots(opts: {
  usageStatsService: object;
  freshnessKey: string;
  listener: (snapshot: EntitlementSnapshot) => void;
}): () => void {
  let byKey = snapshotListenersByService.get(opts.usageStatsService);
  if (!byKey) {
    byKey = new Map();
    snapshotListenersByService.set(opts.usageStatsService, byKey);
  }
  let listeners = byKey.get(opts.freshnessKey);
  if (!listeners) {
    listeners = new Set();
    byKey.set(opts.freshnessKey, listeners);
  }
  listeners.add(opts.listener);
  return () => {
    listeners?.delete(opts.listener);
    if (listeners?.size === 0) byKey?.delete(opts.freshnessKey);
    if (byKey?.size === 0) snapshotListenersByService.delete(opts.usageStatsService);
  };
}

/** 原 Yj（js 52366）：新鲜缓存判定（退避未到期 或 更新间隔内 → 返回快照） */
function freshCachedSnapshot(opts: {
  usageStatsService: object;
  freshnessKey: string;
  intervalMs: number;
  now: number;
}): EntitlementSnapshot | null {
  const cached = snapshotCacheOf(opts.usageStatsService).get(opts.freshnessKey);
  return cached && (cached.nextAllowedAt > opts.now || opts.now - cached.updatedAt <= opts.intervalMs) ? cached.snapshot : null;
}

/** 原 xUe（js 52370）：失败退避是否生效 */
function isFailureBackoffActive(opts: { usageStatsService: object; freshnessKey: string; now: number }): boolean {
  const failure = failureCacheOf(opts.usageStatsService).get(opts.freshnessKey);
  return !!(failure && failure.nextAllowedAt > opts.now);
}

/** 原 Xj（js 52373）：页面可见性（非浏览器环境视为可见） */
function isDocumentVisible(): boolean {
  return typeof document === `undefined` ? true : document.visibilityState !== `hidden`;
}

/** 原 SUe（js 52375）：remaining/quota.limits 中最早的 nextResetTime */
function earliestNextResetTimeOf(snapshot: EntitlementSnapshot | null): number | null {
  const candidates = [
    snapshot?.remaining?.nextResetTime,
    ...(snapshot?.quota?.limits ?? []).map((limit) => limit.nextResetTime),
  ].filter((value): value is number => typeof value == `number` && Number.isFinite(value));
  return candidates.length === 0 ? null : Math.min(...candidates);
}

/** 原 CUe（js 52383）：权益状态判定（active/none/unavailable/unknown） */
function resolveEntitlementStatus(snapshot: EntitlementSnapshot | null): `active` | `none` | `unavailable` | `unknown` {
  if (!snapshot) return `unknown`;
  if ((snapshot.quota || snapshot.subscription || snapshot.remaining) && snapshot.unavailableReason !== `no_plan`) return `active`;
  if (snapshot.unavailableReason === `no_plan`) return `none`;
  if (snapshot.unavailableReason) return `unavailable`;
  return `unknown`;
}

/** 原 wUe（js 52393）：刷新结果应用过滤（poll/task/reset 仅 active；initial 仅 unknown） */
function shouldApplyRefreshResult(opts: { reason: string; snapshot: EntitlementSnapshot | null }): boolean {
  const status = resolveEntitlementStatus(opts.snapshot);
  if (opts.reason === `poll` || opts.reason === `task` || opts.reason === `reset`) return status === `active`;
  if (opts.reason === `initial`) return status === `unknown`;
  return true;
}

/** 原 Zj/TUe/Qj（js 52401–52404）：初始态/请求超时/in-flight 去重表 */
const ENTITLEMENT_INITIAL_STATE = { snapshot: null as EntitlementSnapshot | null, loading: false, error: null as string | null };
const ENTITLEMENT_REQUEST_TIMEOUT_MS = 2e4;
const inFlightEntitlementByService = new WeakMap<object, Map<string, Promise<EntitlementSnapshot>>>();

/** 原 EUe（js 52406）：getEntitlementSnapshot 单飞去重（同选项共享 Promise） */
function dedupedGetEntitlementSnapshot(opts: {
  usageStatsService: UsageStatsService;
  options: EntitlementOptions;
}): Promise<EntitlementSnapshot> {
  let byKey = inFlightEntitlementByService.get(opts.usageStatsService);
  if (!byKey) {
    byKey = new Map();
    inFlightEntitlementByService.set(opts.usageStatsService, byKey);
  }
  const optionsKey = entitlementOptionsKey(opts.options);
  const inFlight = byKey.get(optionsKey);
  if (inFlight) return inFlight;
  const request = withEntitlementTimeout(
    opts.usageStatsService.getEntitlementSnapshot({
      includeSubscription: opts.options.includeSubscription,
      preferredProviderId: opts.options.preferredProviderId,
      allowDisabledPreferredProvider: opts.options.allowDisabledPreferredProvider,
      requirePreferredProvider: opts.options.requirePreferredProvider,
      allowEnvApiKey: opts.options.allowEnvApiKey,
      organizationId: opts.options.organizationId,
      projectId: opts.options.projectId,
    })
  ).finally(() => {
    if (byKey.get(optionsKey) === request) {
      byKey.delete(optionsKey);
      if (byKey.size === 0) inFlightEntitlementByService.delete(opts.usageStatsService);
    }
  });
  byKey.set(optionsKey, request);
  return request;
}

/** 原 DUe（js 52427）：权益错误 → 消息（与 K$t 同构） */
function entitlementErrorOf(error: unknown): string {
  if (error instanceof Error) return error.message || error.name || String(error);
  if (typeof error == `object` && error && `message` in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message == `string` && message.length > 0) return message;
  }
  return String(error);
}

/** 原 OUe（js 52434）：超时错误 */
function entitlementTimeoutError(timeoutMs: number): Error {
  return Error(`usage_entitlement_request_timeout:${timeoutMs}`);
}

/** 原 kUe（js 52436）：Promise.race 超时包装 */
function withEntitlementTimeout<T>(promise: Promise<T>, timeoutMs: number = ENTITLEMENT_REQUEST_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(entitlementTimeoutError(timeoutMs));
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export interface UseSubscriptionSnapshotOptions {
  enabled?: boolean;
  includeSubscription?: boolean;
  preferredProviderId?: string;
  allowDisabledPreferredProvider?: boolean;
  requirePreferredProvider?: boolean;
  allowEnvApiKey?: boolean;
  organizationId?: string | null;
  projectId?: string | null;
  cacheKey?: string;
  refreshOnMount?: boolean;
  autoRefreshMode?: `idle` | `active`;
}
export interface UseSubscriptionSnapshotResult {
  snapshot: EntitlementSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: (opts?: { force?: boolean; silent?: boolean; reason?: string }) => Promise<void>;
}

/** 原 $j（js 52449）：权益/订阅快照 hook（薄包装；服务取自 useBaseServices） */
export function useSubscriptionSnapshot(options: UseSubscriptionSnapshotOptions = {}): UseSubscriptionSnapshotResult {
  return useUsageEntitlementCore(useBaseServices()?.usageStatsService as UsageStatsService | undefined, options); // A0-D-Misc 类型收敛：BaseServices 索引签名为 unknown
}

/** 原 eM（js 52451）：权益主 hook —— 缓存命中/单飞去重/失败退避/可见性轮询/重置唤醒/跨实例广播 */
export function useUsageEntitlementCore(
  service: UsageStatsService | undefined,
  options: UseSubscriptionSnapshotOptions = {}
): UseSubscriptionSnapshotResult {
  const [state, setState] = React.useState(ENTITLEMENT_INITIAL_STATE);
  const requestSeq = React.useRef(0);
  const mountedFreshnessKey = React.useRef<string | null>(null);
  const lastSnapshot = React.useRef<EntitlementSnapshot | null>(null);
  const enabled = (options.enabled ?? true) && !!service;
  const includeSubscription = options.includeSubscription ?? false;
  const preferredProviderId = options.preferredProviderId;
  const allowDisabledPreferredProvider = options.allowDisabledPreferredProvider === true;
  const requirePreferredProvider = options.requirePreferredProvider === true;
  const allowEnvApiKey = options.allowEnvApiKey;
  const organizationId = options.organizationId?.trim() || null;
  const projectId = options.projectId?.trim() || null;
  const cacheKey = options.cacheKey?.trim() ?? ``;
  const refreshOnMount = options.refreshOnMount ?? true;
  const autoRefreshIntervalMs = (options.autoRefreshMode ?? `idle`) === `active` ? ACTIVE_AUTO_REFRESH_INTERVAL_MS : IDLE_AUTO_REFRESH_INTERVAL_MS;
  const entitlementOptions = React.useMemo<EntitlementOptions>(
    () => ({
      includeSubscription,
      preferredProviderId,
      allowDisabledPreferredProvider,
      requirePreferredProvider,
      allowEnvApiKey,
      organizationId,
      projectId,
    }),
    [allowDisabledPreferredProvider, allowEnvApiKey, includeSubscription, organizationId, preferredProviderId, projectId, requirePreferredProvider]
  );
  const freshnessKey = React.useMemo(() => entitlementFreshnessKeyOf({ cacheKey, options: entitlementOptions }), [cacheKey, entitlementOptions]);
  const refresh = React.useCallback(
    async (opts: { force?: boolean; silent?: boolean; reason?: string } = {}) => {
      if (!enabled || !service) return;
      const reason = opts.reason ?? `manual`;
      if (!shouldApplyRefreshResult({ reason, snapshot: lastSnapshot.current })) {
        setState((previous) => ({ ...previous, loading: false }));
        return;
      }
      const cached =
        opts.force === true
          ? null
          : reason === `initial`
            ? freshCachedSnapshot({ freshnessKey, intervalMs: 1 / 0, now: Date.now(), usageStatsService: service })
            : reason === `poll`
              ? freshCachedSnapshot({ freshnessKey, intervalMs: autoRefreshIntervalMs, now: Date.now(), usageStatsService: service })
              : null;
      if (cached) {
        setState({ snapshot: cached, loading: false, error: null });
        lastSnapshot.current = cached;
        return;
      }
      if (opts.force !== true && isFailureBackoffActive({ freshnessKey, now: Date.now(), usageStatsService: service })) {
        setState((previous) => ({ ...previous, loading: false }));
        return;
      }
      const seq = requestSeq.current + 1;
      requestSeq.current = seq;
      logger.debug(`[useUsageEntitlement] 开始读取权益信息`, {
        reason,
        includeSubscription,
        preferredProviderId,
        organizationId,
        projectId,
        cacheKey,
        freshnessKey,
      });
      setState((previous) => ({ snapshot: previous.snapshot, loading: !(opts.silent && previous.snapshot), error: null }));
      try {
        const snapshot = await dedupedGetEntitlementSnapshot({ usageStatsService: service, options: entitlementOptions });
        if (requestSeq.current !== seq) return;
        setCachedSnapshot({ usageStatsService: service, freshnessKey, snapshot });
        logger.debug(`[useUsageEntitlement] 权益信息已更新`, {
          reason,
          providerId: snapshot.provider?.id ?? null,
          scope: snapshot.context?.scope ?? null,
          organizationId: snapshot.context?.organizationId ?? organizationId,
          projectId: snapshot.context?.projectId ?? projectId,
          cacheKey,
          freshnessKey,
        });
        lastSnapshot.current = snapshot;
        setState({ snapshot, loading: false, error: null });
        writeCachedEntitlementSnapshot({ cacheKey, snapshot });
      } catch (error) {
        if (requestSeq.current !== seq) return;
        recordFailureBackoff({ usageStatsService: service, freshnessKey });
        const message = entitlementErrorOf(error);
        logger.warn(`[useUsageEntitlement] 读取权益信息失败`, { includeSubscription, error: message });
        if (!(opts.silent && lastSnapshot.current)) lastSnapshot.current = null;
        setState((previous) =>
          opts.silent && previous.snapshot
            ? { snapshot: previous.snapshot, loading: false, error: message }
            : { snapshot: null, loading: false, error: message }
        );
      }
    },
    [cacheKey, enabled, freshnessKey, autoRefreshIntervalMs, entitlementOptions, service]
  );
  /* 跨实例快照广播订阅 */
  React.useEffect(() => {
    if (!enabled || !service) return;
    return subscribeCachedSnapshots({
      usageStatsService: service,
      freshnessKey,
      listener: (snapshot) => {
        lastSnapshot.current = snapshot;
        setState({ snapshot, loading: false, error: null });
      },
    });
  }, [enabled, freshnessKey, service]);
  /* 挂载/键切换：缓存命中 → 静默校验；未命中 → 强制首读 */
  React.useEffect(() => {
    if (!enabled) {
      setState({ snapshot: null, loading: false, error: null });
      mountedFreshnessKey.current = null;
      lastSnapshot.current = null;
      return;
    }
    if (mountedFreshnessKey.current !== freshnessKey) {
      requestSeq.current += 1;
      mountedFreshnessKey.current = freshnessKey;
      lastSnapshot.current = null;
      setState(ENTITLEMENT_INITIAL_STATE);
    }
    const persisted = readCachedEntitlementSnapshot({ cacheKey });
    const cached = (service ? getCachedSnapshot({ usageStatsService: service, freshnessKey }) : null) ?? persisted;
    if (cached) {
      setState({ snapshot: cached, loading: false, error: null });
      lastSnapshot.current = cached;
    }
    if (refreshOnMount) refresh({ silent: !!cached, force: !cached, reason: `initial` });
  }, [cacheKey, enabled, freshnessKey, refresh, refreshOnMount, service]);
  /* 可见性轮询（active 5min / idle 30min） */
  React.useEffect(() => {
    if (!enabled || !service || typeof window === `undefined`) return;
    const timer = window.setInterval(() => {
      if (isDocumentVisible()) refresh({ silent: true, reason: `poll` });
    }, autoRefreshIntervalMs);
    return () => {
      window.clearInterval(timer);
    };
  }, [enabled, refresh, autoRefreshIntervalMs, service]);
  /* 配额重置唤醒：最早 nextResetTime + 10s 宽限（≤2^31-1） */
  React.useEffect(() => {
    if (!enabled || !service || typeof window === `undefined`) return;
    const nextResetTime = earliestNextResetTimeOf(state.snapshot);
    if (!nextResetTime) return;
    const delayMs = Math.min(Math.max(nextResetTime - Date.now() + RESET_REFRESH_SLACK_MS, RESET_REFRESH_SLACK_MS), 2147483647);
    const timer = window.setTimeout(() => {
      if (isDocumentVisible()) refresh({ silent: true, force: true, reason: `reset` });
    }, delayMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled, refresh, state.snapshot, service]);
  return { snapshot: state.snapshot, loading: state.loading, error: state.error, refresh };
}

/** 原 tM（js 52597）：null 兜底 */
export function nullSafe<T>(value: T | null | undefined): T | null {
  return value ?? null;
}

/** 原 jUe（js 52620）：apiKey 滚动哈希（31 进制，长度前缀 + 36 进制） */
function hashApiKey(apiKey: string): string {
  let hash = 0;
  for (let index = 0; index < apiKey.length; index += 1) hash = (hash * 31 + apiKey.charCodeAt(index)) | 0;
  return `${apiKey.length}:${(hash >>> 0).toString(36)}`;
}

/** 原 nM（js 52599）：供应商指纹（无效供应商/空 key → 空串） */
// A1-R11 宽化：入参补 null（bundle nM 52645 `!e` 守卫真形；PaymentDeep 9672 传 ModelProvider | null）
export function providerApiKeyFingerprint(provider: ModelProvider | null | undefined): string {
  if (!provider || !provider.id || provider.apiKey.trim().length === 0) return ``;
  return `${provider.id}:${hashApiKey(provider.apiKey.trim())}`;
}

/** 原 rM（js 52602）：供应商 → 权益缓存键（对应 SettingsPanelsData 的 providerCacheKey 声明） */
export function providerCacheKey(provider: ModelProvider | undefined): string {
  return entitlementFreshnessKey({ providerId: provider?.id ?? ``, providerFingerprint: providerApiKeyFingerprint(provider) });
}

/** 原 iM（js 52604）：权益是否活跃（供应商匹配 + 非 no_plan + 有 quota/subscription/remaining） */
function hasActiveEntitlement(snapshot: EntitlementSnapshot | null, providerId: string | undefined): boolean {
  if (!snapshot || (providerId && snapshot.provider?.id && snapshot.provider.id !== providerId)) return false;
  return snapshot.unavailableReason !== `no_plan` && (!!snapshot.quota || !!snapshot.subscription || !!snapshot.remaining);
}

/** 原 AUe（js 52608）：是否 no_plan 且无任何额度 */
function isNoPlanEntitlement(snapshot: EntitlementSnapshot | null, providerId: string | undefined): boolean {
  if (!snapshot || (providerId && snapshot.provider?.id && snapshot.provider.id !== providerId)) return false;
  return snapshot.unavailableReason === `no_plan` && !snapshot.quota && !snapshot.subscription && !snapshot.remaining;
}

/** 原 aM（js 52612）：是否应继续探测 Start Plan（指纹缺失→是；codingPlan 活跃→否；no_plan→是；加载中/错误→否）
 *  A1-R11 宽化：codingPlanLoading/codingPlanError 在 bundle 52668 仅 `(…, …, !1)` 并读真形，
 *  故 loading 保留 boolean、error 宽化 unknown（PaymentDeep 305 declare error: unknown 消费面兼容）。 */
export function shouldProbeStartPlanEntitlement(opts: {
  codingPlanProviderFingerprint: string | null;
  codingPlanProviderId: string;
  codingPlanSnapshot: EntitlementSnapshot | null;
  codingPlanLoading: boolean;
  codingPlanError: unknown;
}): boolean {
  if (!opts.codingPlanProviderFingerprint) return true;
  if (hasActiveEntitlement(opts.codingPlanSnapshot, opts.codingPlanProviderId)) return false;
  if (isNoPlanEntitlement(opts.codingPlanSnapshot, opts.codingPlanProviderId)) return true;
  void opts.codingPlanLoading;
  void opts.codingPlanError;
  return false;
}

/* --- 供应商源注册表（原 oM…NUe，js 52626–52660） --- */
// A1-R11：oM 元素真形 = modelProviderService.getAll()/getAllCached() 之供应商记录
// （bundle 78266/78272/206174/209921 fetcher 实测；LM 53300 读 id/enabled/systemDisabledReason），
// 故注册表全链由 unknown[] 精化为 ModelProvider[]（消费侧 OnboardingLoginLeaves/AppRootLeaves 真形）。
let codingPlanSources: ModelProvider[] = [];
let codingPlanSourcesLoaded = false;
let codingPlanSourcesInvalidation = 0;
let forcedRefreshInFlight: Promise<unknown> | null = null;
let ensureSourcesInFlight: Promise<unknown> | null = null;
const codingPlanSourcesListeners = new Set<(sources: ModelProvider[]) => void>();

/** 原 fM（js 52641） */
export function listCodingPlanSources(): ModelProvider[] {
  return codingPlanSources;
}
/** 原 pM（js 52644） */
export function hasLoadedCodingPlanSources(): boolean {
  return codingPlanSourcesLoaded;
}
/** 原 mM（js 52646）：提交源列表（可选作废在途刷新）并广播 */
function setCodingPlanSources(sources: ModelProvider[], opts?: { invalidateInFlightRefresh?: boolean }): void {
  if (opts?.invalidateInFlightRefresh) codingPlanSourcesInvalidation += 1;
  codingPlanSources = sources;
  codingPlanSourcesLoaded = true;
  codingPlanSourcesListeners.forEach((listener) => {
    listener(codingPlanSources);
  });
}
/** 原 hM（js 52654） */
export function subscribeCodingPlanSources(listener: (sources: ModelProvider[]) => void): () => void {
  codingPlanSourcesListeners.add(listener);
  return () => {
    codingPlanSourcesListeners.delete(listener);
  };
}
/** 原 MUe（js 52659） */
function nextSourcesInvalidationToken(): number {
  codingPlanSourcesInvalidation += 1;
  return codingPlanSourcesInvalidation;
}
/** 原 NUe（js 52662）：令牌仍有效才提交 */
function commitSourcesIfCurrent(token: number, sources: ModelProvider[]): boolean {
  if (token === codingPlanSourcesInvalidation) {
    setCodingPlanSources(sources);
    return true;
  }
  return false;
}

/** 原 gM（js 52665）：强制刷新源列表（force 缺省且已有结果 → 直接复用；单飞合并） */
function refreshCodingPlanSourcesForced(fetcher: () => Promise<ModelProvider[]>, opts?: { force?: boolean }): Promise<ModelProvider[]> {
  if (opts?.force !== true && forcedRefreshInFlight) return forcedRefreshInFlight as Promise<ModelProvider[]>;
  const token = nextSourcesInvalidationToken();
  let request!: Promise<ModelProvider[]>;
  request = (async () => {
    try {
      const sources = await fetcher();
      commitSourcesIfCurrent(token, sources);
      return sources;
    } finally {
      if (forcedRefreshInFlight === request) forcedRefreshInFlight = null;
    }
  })();
  forcedRefreshInFlight = request;
  return request;
}

/** 原 _M（js 52681）：惰性确保源列表已加载（单飞合并） */
function ensureCodingPlanSources(fetcher: () => Promise<ModelProvider[]>): Promise<ModelProvider[]> {
  if (codingPlanSourcesLoaded) return Promise.resolve(codingPlanSources);
  if (ensureSourcesInFlight) return ensureSourcesInFlight as Promise<ModelProvider[]>;
  let request!: Promise<ModelProvider[]>;
  request = (async () => {
    try {
      const sources = await fetcher();
      if (!codingPlanSourcesLoaded) setCodingPlanSources(sources);
      return sources;
    } finally {
      if (ensureSourcesInFlight === request) ensureSourcesInFlight = null;
    }
  })();
  ensureSourcesInFlight = request;
  return request;
}

/** 原 PUe（js 52694）：族域双权益（codingPlan/startPlan）→ 连接设置解析器 */
export function useProviderFamilyConnectionSettings(
  workspacePath: string | null,
  modelProviderFamilySelectedKeys: string[],
  usageStatsService: UsageStatsService | undefined
): () => unknown {
  const familyDomain = providerFamilyDomainOf(workspacePath);
  const sources = React.useSyncExternalStore(subscribeCodingPlanSources, listCodingPlanSources, listCodingPlanSources);
  const connectionSettings = familyDomain ? familyConnectionSettingsOf(familyDomain) : null;
  const codingPlanSource = nullSafe(sources.find((source) => (source as { id?: string }).id === connectionSettings?.codingPlanProviderId)) as ModelProvider | null;
  const startPlanSource = nullSafe(sources.find((source) => (source as { id?: string }).id === connectionSettings?.startPlanProviderId)) as ModelProvider | null;
  const codingPlanFingerprint = providerApiKeyFingerprint(codingPlanSource ?? undefined);
  const startPlanFingerprint = providerApiKeyFingerprint(startPlanSource ?? undefined);
  const codingPlanEntitlement = useUsageEntitlementCore(usageStatsService, {
    enabled: !!(familyDomain && codingPlanFingerprint),
    includeSubscription: true,
    preferredProviderId: codingPlanSource?.id ?? connectionSettings?.codingPlanProviderId ?? PROVIDER_IDS.zaiCodingPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: providerCacheKey(codingPlanSource ?? undefined),
  });
  const startPlanEntitlement = useUsageEntitlementCore(usageStatsService, {
    enabled:
      !!(familyDomain && startPlanFingerprint) &&
      shouldProbeStartPlanEntitlement({
        codingPlanProviderFingerprint: codingPlanFingerprint,
        codingPlanProviderId: connectionSettings?.codingPlanProviderId ?? PROVIDER_IDS.zaiCodingPlan,
        codingPlanSnapshot: codingPlanEntitlement.snapshot,
        codingPlanLoading: codingPlanEntitlement.loading,
        codingPlanError: codingPlanEntitlement.error,
      }),
    includeSubscription: true,
    preferredProviderId: startPlanSource?.id ?? connectionSettings?.startPlanProviderId ?? PROVIDER_IDS.zaiStartPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: providerCacheKey(startPlanSource ?? undefined),
  });
  return React.useCallback(
    () =>
      resolveFamilyConnectionSettings({
        providerFamilyDomain: familyDomain,
        modelProviderFamilySelectedKeys,
        codingPlanEntitlement: codingPlanEntitlement.snapshot,
        startPlanEntitlement: startPlanEntitlement.snapshot,
        now: Date.now(),
        entitlementCacheTtlMs: USAGE_ENTITLEMENT_CACHE_TTL_MS,
      }),
    [codingPlanEntitlement.snapshot, modelProviderFamilySelectedKeys, familyDomain, startPlanEntitlement.snapshot]
  );
}

/** 原 vM（js 52739）：jte 薄包装 */
export function providerFamiliesOfListWrapper(selectedKeys: string[]): unknown[] {
  return providerFamiliesOfList(selectedKeys);
}

/** 原 yM（js 52742）：kr 薄包装（入参 = providers 数组） */
function activeProvidersOfList(providers: unknown[] | undefined): unknown {
  return activeProvidersOf(providers);
}

/** 原 FUe（js 52744）：无用户且无活跃供应商（对 kr 结果直接取反，逐字保留） */
export function hasNoUserOrProviders(state: { user?: unknown; providers?: unknown[] }): boolean {
  return !state.user && !activeProvidersOfList(state.providers);
}

/* ============================================================================
 * 2b. 购买漏斗簇（原 PM/IM/GUe/KUe/UUe/qUe/UM，js 53249–53420；A1-R11 项 2 转录）
 *     消费面：本文件 trackUpgradeEvent（190053 区）、ModelProviderSettingsSection 1254、
 *     PaymentDeep 11049（entryPlanState 对象真形）。
 * ==========================================================================*/

/** 漏斗上下文（原 PM 返回面，js 53254–53265） */
export interface FunnelContext {
  purchaseFunnelId: string;
  upgradeSource: string;
  eventRegion: string;
  eventText: string;
  entryPlanStatus: string;
  entryPlanLevel: string;
  purchaseAudience: string;
  providerFamily: string;
  channel: string;
}

/** 入口计划态（原 IM 返回面，js 53283–53296） */
export interface EntryPlanState {
  entryPlanStatus: string;
  entryPlanLevel: string;
}

/** 原 qUe（js 53417）：crypto.randomUUID 缺省时的兜底漏斗 id */
function fallbackPurchaseFunnelId(): string {
  return (
    logger.warn(`[codingPlanFunnelTelemetry] crypto.randomUUID unavailable, using fallback id`),
    `funnel_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
}

/** 原 UUe（js 53249）：漏斗 id（crypto.randomUUID，缺省兜底） */
function newPurchaseFunnelId(): string {
  return globalThis.crypto?.randomUUID?.() ?? fallbackPurchaseFunnelId();
}

/** 原 GUe（js 53387）：供应商 id → 漏斗族域（bigmodel|zai|unknown） */
function providerFamilyOfFunnelProvider(providerId: string): "bigmodel" | "zai" | "unknown" {
  return providerId === `bigmodel` ||
    providerId === PROVIDER_IDS.bigmodel ||
    providerId === PROVIDER_IDS.bigmodelCodingPlan ||
    providerId === PROVIDER_IDS.bigmodelStartPlan
    ? `bigmodel`
    : providerId === `zai` || providerId === PROVIDER_IDS.zai || isZaiPlanProviderId(providerId)
      ? `zai`
      : `unknown`;
}

/** 原 KUe（js 53397）：族域 → 渠道标 */
function funnelChannelOfFamily(family: "bigmodel" | "zai" | "unknown"): string {
  return { bigmodel: `MaaS`, zai: `Z_AI`, unknown: `` }[family];
}

/** 原 UM（js 53406）：计划级别含 start 词界（大小写不敏感）。
 *  与 aZt isStartPlanLevel（190002，精确三判）为 bundle 并存双真身，各自逐字。 */
function isStartPlanLevelWordBoundary(planLevel: string): boolean {
  return /\bstart\b/i.test(planLevel.trim());
}

/** 原 IM（js 53277）：入口计划态（snapshot 优先 → displayStatus/providerId 兜底） */
export function entryPlanStateOf(opts: {
  displayStatus?: string;
  providerId?: string;
  planLevel?: string;
  snapshot?: EntitlementSnapshot | null;
}): EntryPlanState {
  let t = opts.planLevel?.trim() ?? ``,
    n =
      opts.snapshot?.subscription?.details?.[0]?.productName?.trim() ||
      opts.snapshot?.subscription?.details?.[0]?.productId?.trim() ||
      opts.snapshot?.quota?.level?.trim() ||
      ``,
    r = t || n;
  if (opts.snapshot) {
    if (opts.snapshot.unavailableReason === `no_plan`) return { entryPlanStatus: `no_plan`, entryPlanLevel: `` };
    if (opts.snapshot.subscription || opts.snapshot.quota || opts.snapshot.remaining)
      return { entryPlanStatus: isStartPlanLevelWordBoundary(r) ? `start_plan` : `coding_plan`, entryPlanLevel: r };
  }
  return opts.displayStatus === `notPurchased`
    ? { entryPlanStatus: `no_plan`, entryPlanLevel: `` }
    : opts.displayStatus === `purchased`
      ? { entryPlanStatus: isStartPlanLevelWordBoundary(r) ? `start_plan` : `coding_plan`, entryPlanLevel: r }
      : opts.providerId && isStartPlanProviderId(opts.providerId) && r
        ? { entryPlanStatus: `start_plan`, entryPlanLevel: r }
        : { entryPlanStatus: `unknown`, entryPlanLevel: `` };
}

/** 原 PM（js 53253）：构造购买漏斗上下文（entryPlanState 展平入面）。
 *  消费侧别名：本文件 trackUpgradeEvent 调用面（原 De，190053）、
 *  ModelProviderSettingsSection upgradeFunnelContext（1254）。 */
export function upgradeFunnelContext(opts: {
  providerId: string;
  upgradeSource: string;
  eventRegion: string;
  eventText: string;
  entryPlanState?: EntryPlanState | null;
  purchaseAudience?: string;
}): FunnelContext {
  let t = providerFamilyOfFunnelProvider(opts.providerId);
  return {
    purchaseFunnelId: newPurchaseFunnelId(),
    upgradeSource: opts.upgradeSource,
    eventRegion: opts.eventRegion,
    eventText: opts.eventText,
    entryPlanStatus: opts.entryPlanState?.entryPlanStatus ?? `unknown`,
    entryPlanLevel: opts.entryPlanState?.entryPlanLevel ?? ``,
    purchaseAudience: opts.purchaseAudience ?? ``,
    providerFamily: t,
    channel: funnelChannelOfFamily(t),
  };
}

/* ============================================================================
 * 2c. 应用设置钩子（原 WM/GM/KM/qM/YUe/JM，js 53465–53548；A1-R11 项 2 转录）
 *     消费面 12 域：settings 六分区 + automations×2 + OnboardingLoginLeaves +
 *     AppRootLeaves + modules/Settings（declare 改指在案）。
 * ==========================================================================*/

/** 应用设置快照（bundle settingService.get() 真形消费面：JM 53488 起、12 消费域读面） */
export interface AppRuntimeSettings {
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  providerFamilyDomain?: string | null;
  providerFamilyDomainUpdatedAt?: number;
  providerFamilyDomainMigrated?: boolean;
  keepAwakeWhileRunning?: boolean;
  askUserQuestionAutoResolutionEnabled?: boolean;
  // A1-R11 型缝精化：JM get() 真形 = settingService 全量快照；modules/Settings.tsx 1372–1377 具型消费面（受控态初值）
  optimizeAgentExperienceEnabled?: boolean;
  messageStreamShowReasoning?: boolean;
  messageStreamShowTodos?: boolean;
  zcodeInteractionBehavior?: "queue" | "guide";
  receivePreviewUpdates?: boolean;
  autoDownloadAndInstallUpdates?: boolean;
  [key: string]: unknown;
}

/** 应用设置更新补丁（JM update 入参真形：53516 读 askUserQuestionAutoResolutionEnabled，余键透传） */
export interface AppRuntimeSettingsPatch {
  askUserQuestionAutoResolutionEnabled?: boolean;
  [key: string]: unknown;
}

interface AppRuntimeSettingsState {
  settings: AppRuntimeSettings | null;
  loading: boolean;
  error: unknown;
}

/** 原 WM（js 53465）：模块级快照初态 */
let appSettingsState: AppRuntimeSettingsState = { settings: null, loading: true, error: null };
/** 原 GM（js 53466）：刷新单飞槽 */
let appSettingsRefreshInFlight: Promise<void> | null = null;
/** 原 KM（js 53467）：监听集 */
const appSettingsListeners = new Set<(state: AppRuntimeSettingsState) => void>();

/** 原 qM（js 53468）：广播当前快照 */
function notifyAppSettingsListeners(): void {
  for (const listener of appSettingsListeners) listener(appSettingsState);
}

/** 原 YUe（js 53471）：单飞合并刷新（loading/error 态迁移 + 广播） */
function refreshAppSettingsDeduped(fetchSettings: () => Promise<AppRuntimeSettings>): Promise<void> {
  return (
    appSettingsRefreshInFlight ||
    ((appSettingsState = { ...appSettingsState, loading: true, error: null }),
    notifyAppSettingsListeners(),
    (appSettingsRefreshInFlight = (async () => {
      try {
        ((appSettingsState = { settings: await fetchSettings(), loading: false, error: null }), notifyAppSettingsListeners());
      } catch (e) {
        ((appSettingsState = { settings: appSettingsState.settings, loading: false, error: e }), notifyAppSettingsListeners());
      }
    })().finally(() => {
      appSettingsRefreshInFlight = null;
    })),
    appSettingsRefreshInFlight)
  );
}

/** 原 JM（js 53488）：应用设置钩子（模块级快照 + 平台变更订阅 + 运行时偏好同步广播）。
 *  环安全：值闭包 = modules/services + ImeComposition(usePlatformService) + SrcSharedB 常量 + react，
 *  12 消费域经 modules/UsageDeep shim import 本函数不构成新环（函数声明提升）。 */
export function useAppSettings(): {
  settings: AppRuntimeSettings | null;
  loading: boolean;
  error: unknown;
  update: (patch: AppRuntimeSettingsPatch) => Promise<void>;
  refresh: () => Promise<void>;
} {
  const { botsService, broadcastService, settingService, zcodeAgentService } = useServices();
  const platform = usePlatformService();
  const [state, setState] = React.useState(appSettingsState);
  const refresh = React.useCallback(async () => {
    await refreshAppSettingsDeduped(() => settingService.get());
  }, [settingService]);
  React.useEffect(() => {
    const listener = (next: AppRuntimeSettingsState) => {
      setState(next);
    };
    return (
      appSettingsListeners.add(listener),
      setState(appSettingsState),
      void refresh(),
      () => {
        appSettingsListeners.delete(listener);
      }
    );
  }, [refresh]);
  React.useEffect(
    () =>
      platform.onSettingsChanged?.(() => {
        void refresh();
      }) ?? (() => {}),
    [platform, refresh],
  );
  const update = React.useCallback(
    async (patch: AppRuntimeSettingsPatch) => {
      if (
        (await settingService.update(patch),
        platform.syncAppSettings?.(patch),
        await refresh(),
        typeof patch.askUserQuestionAutoResolutionEnabled == `boolean`)
      ) {
        let n = (
          await Promise.allSettled([
            zcodeAgentService.syncAppRuntimePreferences({
              askUserQuestionAutoResolutionEnabled: patch.askUserQuestionAutoResolutionEnabled,
            }),
            botsService.syncAppRuntimePreferences({
              askUserQuestionAutoResolutionEnabled: patch.askUserQuestionAutoResolutionEnabled,
            }),
          ])
        ).find((e) => e.status === `rejected`)?.reason;
        if (
          (await broadcastService.send({
            channel: APP_RUNTIME_PREFERENCES_STORAGE_KEY,
            payload: {
              askUserQuestionAutoResolutionEnabled: patch.askUserQuestionAutoResolutionEnabled,
            },
          }),
          n)
        )
          throw n;
      }
    },
    [botsService, broadcastService, settingService, zcodeAgentService, platform, refresh],
  );
  return { settings: state.settings, loading: state.loading, error: state.error, update: update, refresh: refresh };
}

/* ============================================================================
 * 2d. 模型组标签（原 rN/iN，js 53790–53795）
 * ==========================================================================*/

/* ── tombstone（A1-R11）：prefixModelLabelWithProvider（rN，53790）/resolveModelGroupLabel（iN，53795）
 *    本批转录删除——双实例收敛：rN/iN 之既有属主 = components/settings/SubagentLeaves.tsx
 *    composeProviderModelLabel / resolveModelFullLabel（A0 期转录，注 jsx 48436/48441 = 本簇 js 53790/53795，
 *    逐字同构：dr 守卫 + 前缀拼接 / 组×项定位 + 回退）。本 §2d 为 R11 期不知既有转录而作之重复，
 *    依「一符一家」删碑改指：AutomationEditor 1015 消费面改经 SubagentLeaves resolveModelFullLabel
 *    （别名保留 resolveModelGroupLabel，调用点逐字不变）。ExtendedViews 438 之双参面真形为
 *    w6e（77856，wiki 域），不属本簇，维持留批。 ── */

/* ============================================================================
 * 3. 计费折扣簇（原 dj 簇，js 51857–52041 / jsx 46612–46764）
 * ==========================================================================*/

/** 原 zHe/BHe/VHe/lj/uj（js 51857–51860）：折扣缓存 TTL/对话框类名/缓存槽 */
const BILLING_DISCOUNT_CACHE_TTL_MS = 3600 * 1e3;
const BILLING_DISCOUNT_DIALOG_CLASS = `max-h-[min(82vh,640px)] max-w-lg grid-rows-[auto_minmax(0,1fr)] overflow-hidden`;
const BILLING_DISCOUNT_DIALOG_BODY_CLASS = `p-3 !space-y-3`;
let billingDiscountCache: { value: BillingDiscountConfig | undefined; expiresAt: number } | null = null;
let billingDiscountInFlight: Promise<BillingDiscountConfig | undefined> | null = null;

interface BillingDiscountCopy {
  badgeBody?: string;
  cardTitle?: string;
  cardBody?: string;
  infoTitle?: string;
  infoBody?: string;
}

/** 原 vj（js 52036）：非空 trim 字符串 */
function nonEmptyTrimmed(value: unknown): string | undefined {
  if (typeof value != `string`) return;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : void 0;
}

/** 原 pj（js 51881 区）：locale → 本地化文案组 */
function localizedDiscountCopyOf(config: BillingDiscountConfig | undefined, locale: string): BillingDiscountCopy {
  const entry = config?.[locale];
  if (!entry || typeof entry != `object`) return {};
  return {
    badgeBody: nonEmptyTrimmed(entry.badgeBody),
    cardTitle: nonEmptyTrimmed(entry.cardTitle),
    cardBody: nonEmptyTrimmed(entry.cardBody),
    infoTitle: nonEmptyTrimmed(entry.infoTitle),
    infoBody: nonEmptyTrimmed(entry.infoBody),
  };
}

/** 原 mj（js 51891 区）：必需字段齐备判定 */
function hasDiscountCopy(config: BillingDiscountConfig | undefined, locale: string, requiredFields: Array<keyof BillingDiscountCopy>): boolean {
  const copy = localizedDiscountCopyOf(config, locale);
  return requiredFields.every((field) => !!copy[field]);
}

/** 原 UHe（js 52025）：1h TTL + 单飞的折扣配置读取 */
async function getCachedBillingDiscount(service: CodingPlanSubscriptionService): Promise<BillingDiscountConfig | undefined> {
  const now = Date.now();
  if (billingDiscountCache && billingDiscountCache.expiresAt > now) return billingDiscountCache.value;
  if (billingDiscountInFlight) return billingDiscountInFlight;
  const request = service.getBillingDiscount();
  billingDiscountInFlight = request;
  try {
    const value = await request;
    billingDiscountCache = { value, expiresAt: now + BILLING_DISCOUNT_CACHE_TTL_MS };
    return value;
  } finally {
    if (billingDiscountInFlight === request) billingDiscountInFlight = null;
  }
}

/** 原 fj（js 51865）：折扣配置 hook 主体（服务缺省/无 getBillingDiscount → 静默关闭） */
function useBillingDiscountCore(service: CodingPlanSubscriptionService | undefined): {
  active: boolean;
  config: BillingDiscountConfig | undefined;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { locale } = useIntlContext();
  const [state, setState] = React.useState<{ active: boolean; config: BillingDiscountConfig | undefined; loading: boolean }>({
    active: hasDiscountCopy(billingDiscountCache?.value, locale, [`badgeBody`]),
    config: billingDiscountCache?.value,
    loading: !!service && !billingDiscountCache,
  });
  const refresh = React.useCallback(async () => {
    if (!service || typeof service.getBillingDiscount != `function`) {
      setState({ active: false, config: void 0, loading: false });
      return;
    }
    setState((previous) => ({ ...previous, loading: true }));
    try {
      const config = await getCachedBillingDiscount(service);
      setState({ active: hasDiscountCopy(config, locale, [`badgeBody`]), config, loading: false });
    } catch (error) {
      logger.warn(`[CodingPlanBillingDiscount] 读取 Coding Plan 活动配置失败`, {
        error: error instanceof Error ? error.message : String(error),
      });
      setState({ active: false, config: void 0, loading: false });
    }
  }, [locale, service]);
  React.useEffect(() => {
    refresh();
  }, [refresh]);
  return { active: state.active, config: state.config, loading: state.loading, refresh };
}

/** 原 dj（js 51862）：折扣配置 hook（服务取自 useOptionalServices） */
export function useBillingDiscount(): { active: boolean; config: BillingDiscountConfig | undefined; loading: boolean; refresh: () => Promise<void> } {
  return useBillingDiscountCore(useOptionalServices()?.codingPlanSubscriptionService as unknown as CodingPlanSubscriptionService | undefined); // A0-CLEANUP3 3b：宽 Record 面与本地 CodingPlanSubscriptionService 不重叠，双重收敛
}

/** 原 hj（js 51911）：折扣徽章（gradient 缺省 / surface / tag；compact 尺寸） */
export function BillingDiscountBadge(props: {
  config: BillingDiscountConfig | undefined;
  iconVisible?: boolean;
  size?: "default" | "compact";
  variant?: "gradient" | "surface" | "tag";
}): React.ReactElement | null {
  const { config, iconVisible = true, size = `default`, variant = `gradient` } = props;
  const { locale } = useIntlContext();
  const copy = localizedDiscountCopyOf(config, locale);
  return copy.badgeBody ? (
    <div
      className={cn(
        `inline-flex items-center py-0.5`,
        size === `compact` ? `gap-0.5 px-1.5 text-ui-sm leading-none` : `gap-1 px-2 text-ui-xs`,
        variant === `surface`
          ? `rounded-full bg-white text-[#191A1D]`
          : variant === `tag`
            ? `rounded-full bg-tag text-foreground`
            : `rounded-full text-white button-gradient dark:bg-[#484A58]`
      )}
    >
      {iconVisible ? <TrendingUpIcon className={size === `compact` ? `size-2.5` : `size-3`} /> : null}
      {copy.badgeBody}
    </div>
  ) : null;
}

/** 原 _j（js 51986）：折扣信息对话框（markdown 正文；主题取自设置 store） */
export function BillingDiscountInfoDialog(props: { config: BillingDiscountConfig | undefined; tone?: "default" | "onGradient" }): React.ReactElement | null {
  const { config, tone = `default` } = props;
  const { intl, locale } = useIntlContext();
  const copy = localizedDiscountCopyOf(config, locale);
  const theme = useSettingsStoreValue((state) => state.theme, `system`);
  const codePreviewSettings = useSettingsStoreValue((state) => state.codePreviewSettings, null) as CodePreviewSettings | undefined; // A0-D-Misc 类型收敛：设置态该字段为 unknown
  const openLabel = intl.formatMessage({ id: `settings.modelProvider.codingPlan.billingDiscountInfo.open` });
  if (!copy.infoTitle || !copy.infoBody) return null;
  const markdown = `## ${copy.infoTitle}\n\n${copy.infoBody}`;
  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <InfoIcon
          role={`button`}
          tabIndex={0}
          aria-label={openLabel}
          className={cn(
            `size-3.5 shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50`,
            tone === `onGradient` ? `text-white/90 hover:text-white` : `text-foreground-subtle hover:text-foreground`
          )}
        />
      </DialogTrigger>
      <DialogContent className={cn(BILLING_DISCOUNT_DIALOG_CLASS, `block`)}>
        <div className={BILLING_DISCOUNT_DIALOG_BODY_CLASS}>
          <MarkdownRenderer className={`min-h-0 overflow-y-auto pr-1 text-foreground`} theme={theme} codePreviewSettings={codePreviewSettings}>
            {markdown}
          </MarkdownRenderer>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}

/** 原 gj（js 51932）：徽章 + 信息对话框组合（无文案 → 整体隐藏） */
export function BillingDiscountBadgeWithInfo(props: {
  config: BillingDiscountConfig | undefined;
  iconVisible?: boolean;
  size?: "default" | "compact";
  variant?: "gradient" | "surface" | "tag";
}): React.ReactElement | null {
  const { locale } = useIntlContext();
  return localizedDiscountCopyOf(props.config, locale).badgeBody ? (
    <>
      <BillingDiscountBadge {...props} />
      <BillingDiscountInfoDialog config={props.config} tone={props.variant === `surface` ? `onGradient` : `default`} />
    </>
  ) : null;
}

/** 原 HHe（js 51946）：折扣渐变卡（标题+正文+surface 徽章；缺文案 → 隐藏） */
export function BillingDiscountCard(props: { config: BillingDiscountConfig | undefined }): React.ReactElement | null {
  const { locale } = useIntlContext();
  const copy = localizedDiscountCopyOf(props.config, locale);
  if (!copy.cardTitle || !copy.cardBody) return null;
  return (
    <div className={`rounded-xl border border-transparent button-gradient px-3 py-2.5 text-white dark:bg-[#484A58]`}>
      <div className={`flex min-w-0 items-center justify-between gap-3`}>
        <div className={`flex min-w-0 items-start gap-2`}>
          <div className={`flex h-6 shrink-0 items-center`}>
            {/* A1-R20 图标勘误：bundle HHe 52013 = f = sparkles（非 rocket） */}
            <SparklesIcon className={`size-4 text-white`} />
          </div>
          <div className={`min-w-0`}>
            <div className={`text-ui-lg font-medium leading-6 text-white`}>{copy.cardTitle}</div>
            <div className={`mt-0.5 text-ui-base leading-5 text-white/80`}>{copy.cardBody}</div>
          </div>
        </div>
        <div className={`flex shrink-0 items-center gap-1`}>
          <BillingDiscountBadgeWithInfo config={props.config} variant={`surface`} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. 配额助手 + 侧栏计划件（原 Sq…v3e，js 76101–76563 / jsx 67394–67700 区）
 * ==========================================================================*/

/** 原 Sq（js 76101）：type/unit/number 三键查找（宽松：number 可省） */
export function findQuotaLimit(
  limits: EntitlementQuotaLimit[] | undefined,
  type: string,
  unit?: number,
  number?: number
): EntitlementQuotaLimit | null {
  return limits?.find((limit) => limit.type === type && limit.unit === unit && (number == null || limit.number === number)) ?? null;
}

/** 原 Cq（js 76104）：percentage（剩余）→ 已用百分比（0–100，非数 → null） */
export function quotaPercent(limit: EntitlementQuotaLimit | null | undefined): number | null {
  if (typeof limit?.percentage != `number` || !Number.isFinite(limit.percentage)) return null;
  return Math.max(0, Math.min(100, 100 - limit.percentage));
}

/** 原 $4e（js 76108）：已用百分比文案（`--` 或 `NN%`） */
export function formatQuotaUsage(locale: string, limit: EntitlementQuotaLimit | null | undefined): string {
  const percent = quotaPercent(limit);
  if (percent == null) return `--`;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: percent >= 10 ? 0 : 1 }).format(percent)}%`;
}

/** 原 wq（js 76115）：配额重置时间格式化（date=`Mon d`；dateTime=今天可省日期） */
export function formatQuotaResetTime(opts: {
  locale: string;
  value: unknown;
  format: "dateTime" | "date";
  compactToday?: boolean;
}): string | undefined {
  if (!opts.value) return;
  const date = new Date(opts.value as number | string | Date);
  if (Number.isNaN(date.getTime())) return;
  if (opts.format === `date`) return new Intl.DateTimeFormat(opts.locale, { month: `short`, day: `numeric` }).format(date);
  const now = new Date();
  const isToday = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  return new Intl.DateTimeFormat(opts.locale, {
    ...(opts.compactToday && isToday ? {} : { month: `short`, day: `numeric` }),
    hour: `2-digit`,
    minute: `2-digit`,
    hourCycle: `h23`,
  }).format(date);
}

/** 原 e3e/t3e（js 76133）：区域 logo dataURI 表（bigmodel 菱形渐变 / zai 方块） */
const BIGMODEL_LOGO_DATA_URI = `data:image/svg+xml,%3csvg%20width='16'%20height='16'%20viewBox='0%200%2016%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_4966_14195)'%3e%3cpath%20d='M8.00351%200.142578L14.9084%208.01458L8.00351%2015.883L1.10217%208.01458L8.00351%200.142578Z'%20fill='white'%20style='fill:white;fill-opacity:1;'/%3e%3cpath%20d='M14.9084%204.07858V8.01102H13.8417C13.8417%208.01102%2011.7013%208.12124%209.87372%206.25813C7.96083%204.30613%208.0035%201.78169%208.0035%201.78169V0.142578L14.9084%204.07858Z'%20fill='url(%23paint0_linear_4966_14195)'%20style=''/%3e%3cpath%20d='M1.10217%204.07858V8.01102H2.16884C2.16884%208.01102%204.30928%208.12124%206.13684%206.25813C8.04973%204.30613%208.00706%201.78169%208.00706%201.78169V0.142578L1.10217%204.07858Z'%20fill='url(%23paint1_linear_4966_14195)'%20style=''/%3e%3cpath%20d='M1.10217%2011.9474V8.01491H2.16884C2.16884%208.01491%204.30928%207.90468%206.13684%209.76779C8.04973%2011.7198%208.00706%2014.2442%208.00706%2014.2442V15.8833L1.10217%2011.9474Z'%20fill='url(%23paint2_linear_4966_14195)'%20style=''/%3e%3cpath%20d='M14.9084%2011.9474V8.01491H13.8417C13.8417%208.01491%2011.7013%207.90468%209.87372%209.76779C7.96083%2011.7198%208.0035%2014.2442%208.0035%2014.2442V15.8833L14.9084%2011.9474Z'%20fill='url(%23paint3_linear_4966_14195)'%20style=''/%3e%3c/g%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_4966_14195'%20x1='8.00484'%20y1='4.07834'%20x2='14.9077'%20y2='4.07834'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%238C8AF4'%20style='stop-color:%238C8AF4;stop-color:color(display-p3%200.5490%200.5412%200.9569);stop-opacity:1;'/%3e%3cstop%20offset='1'%20stop-color='%232556D3'%20style='stop-color:%232556D3;stop-color:color(display-p3%200.1451%200.3373%200.8275);stop-opacity:1;'/%3e%3c/linearGradient%3e%3clinearGradient%20id='paint1_linear_4966_14195'%20x1='1.10217'%20y1='4.07834'%20x2='8.00501'%20y2='4.07834'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%238C8AF4'%20style='stop-color:%238C8AF4;stop-color:color(display-p3%200.5490%200.5412%200.9569);stop-opacity:1;'/%3e%3cstop%20offset='1'%20stop-color='%232556D3'%20style='stop-color:%232556D3;stop-color:color(display-p3%200.1451%200.3373%200.8275);stop-opacity:1;'/%3e%3c/linearGradient%3e%3clinearGradient%20id='paint2_linear_4966_14195'%20x1='1.10217'%20y1='11.9478'%20x2='8.00501'%20y2='11.9478'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%233091D6'%20style='stop-color:%233091D6;stop-color:color(display-p3%200.1882%200.5686%200.8392);stop-opacity:1;'/%3e%3cstop%20offset='1'%20stop-color='%2389A2F4'%20style='stop-color:%2389A2F4;stop-color:color(display-p3%200.5373%200.6353%200.9569);stop-opacity:1;'/%3e%3c/linearGradient%3e%3clinearGradient%20id='paint3_linear_4966_14195'%20x1='8.00484'%20y1='11.9478'%20x2='14.9077'%20y2='11.9478'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%232362D2'%20style='stop-color:%232362D2;stop-color:color(display-p3%200.1373%200.3843%200.8235);stop-opacity:1;'/%3e%3cstop%20offset='1'%20stop-color='%238898F3'%20style='stop-color:%238898F3;stop-color:color(display-p3%200.5333%200.5961%200.9529);stop-opacity:1;'/%3e%3c/linearGradient%3e%3cclipPath%20id='clip0_4966_14195'%3e%3crect%20width='16'%20height='16'%20fill='white'%20style='fill:white;fill-opacity:1;'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e`;
const ZAI_LOGO_DATA_URI = `data:image/svg+xml,%3csvg%20width='18'%20height='18'%20viewBox='0%200%2018%2018'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M2.91528%2017.32C1.40918%2017.32%200.183716%2016.0946%200.183716%2014.5885V2.91906C0.183716%201.41296%201.40918%200.1875%202.91528%200.1875H14.5847C16.0908%200.1875%2017.3163%201.41296%2017.3163%202.91906V14.5885C17.3163%2016.0946%2016.0908%2017.32%2014.5847%2017.32H2.91528Z'%20fill='url(%23paint0_linear_11758_79291)'%20style=''%20/%3e%3cpath%20d='M14.5847%200.367454C15.9918%200.367454%2017.1325%201.50817%2017.1325%202.91529V14.5847C17.1325%2015.9918%2015.9918%2017.1325%2014.5847%2017.1325H2.91529C1.50817%2017.1325%200.367454%2015.9918%200.367454%2014.5847V2.91529C0.367454%201.50817%201.50817%200.367454%202.91529%200.367454H14.5847ZM14.5847%200H2.91529C2.13652%200%201.40459%200.303149%200.853871%200.853871C0.303149%201.40459%200%202.13652%200%202.91529V14.5847C0%2015.3635%200.303149%2016.0954%200.853871%2016.6461C1.40459%2017.1969%202.13652%2017.5%202.91529%2017.5H14.5847C15.3635%2017.5%2016.0954%2017.1969%2016.6461%2016.6461C17.1969%2016.0954%2017.5%2015.3635%2017.5%2014.5847V2.91529C17.5%202.13652%2017.1969%201.40459%2016.6461%200.853871C16.0954%200.303149%2015.3635%200%2014.5847%200Z'%20fill='%23B7BCBF'%20style='fill:%23B7BCBF;fill:color(display-p3%200.7176%200.7373%200.7490);fill-opacity:1;'%20/%3e%3cpath%20d='M5%2014.5%20L5%208.2%20A4%204%200%200%201%2013%208.2%20L13%2014.5'%20stroke='white'%20stroke-width='2.8'%20fill='none'%20/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_11758_79291'%20x1='8.74999'%20y1='17.32'%20x2='8.74999'%20y2='0.187504'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20style='stop-color:black;stop-opacity:1;'%20/%3e%3cstop%20offset='1'%20stop-color='%23151718'%20style='stop-color:%23151718;stop-color:color(display-p3%200.0824%200.0902%200.0941);stop-opacity:1;'%20/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e`; // REBRAND-041+141
const REGION_LOGO_BY_ID: Record<string, string> = { [BIGMODEL_REGION]: BIGMODEL_LOGO_DATA_URI, zai: ZAI_LOGO_DATA_URI };

/** 原 Tq（js 76135）：区域 logo（缺省 log-in 图标占位） */
export function RegionLogo(props: { region: string; className?: string }): React.ReactElement {
  const logo = REGION_LOGO_BY_ID[props.region];
  return logo ? (
    <img src={logo} alt="" aria-hidden="true" className={cn(`shrink-0 object-contain`, props.className)} />
  ) : (
    <LogInIcon className={cn(`shrink-0`, props.className)} />
  );
}

/** 原 n3e（js 76158）：Coding Plan 供应商缺省名 */
function codingPlanProviderFallbackName(providerId: string): string {
  return providerId === PROVIDER_IDS.zaiCodingPlan ? `Z.ai Coding Plan` : `BigModel Coding Plan`;
}

/** 原 Eq（js 76161）：权益源 id（sourceId 优先） */
function entitlementSourceId(entitlement: { sourceId?: string; providerId: string }): string {
  return entitlement.sourceId ?? entitlement.providerId;
}

/** 原 Dq（js 76163）：供应商匹配且活跃（非 no_plan + 有额度） */
function hasActiveEntitlementForProvider(snapshot: EntitlementSnapshot | null | undefined, providerId: string): boolean {
  return (
    snapshot?.provider?.id === providerId &&
    snapshot.unavailableReason !== `no_plan` &&
    (!!snapshot.quota || !!snapshot.subscription || !!snapshot.remaining)
  );
}

export interface PlanWidgetEntitlementEntry {
  providerId: string;
  sourceId?: string;
  label?: string;
  loading: boolean;
  error?: string | null;
  snapshot: EntitlementSnapshot | null;
}
export interface PlanWidgetConfig {
  selectedProviderId: string;
  availableProviders: Array<{ id: string; name?: string }>;
  entitlements: PlanWidgetEntitlementEntry[];
  modelProvidersLoading: boolean;
  onUsageClick?: () => void;
}
export interface PlanWidgetModel {
  activeProviderId: string | undefined;
  displayedEntitlement: PlanWidgetEntitlementEntry | null;
  displayedProviderId: string | undefined;
  hasAnyActiveCodingPlan: boolean;
  loading: boolean;
  providerEntitlements: PlanWidgetEntitlementEntry[];
  tabProviders: Array<{ id: string; providerId: string; label: string }>;
  visibleSnapshot: EntitlementSnapshot | null;
}

/** 原 Oq（js 76168）：多源权益 → 展示模型（选中源活跃优先；否则任一活跃源；标签回退链） */
export function resolvePlanWidgetModel(config: PlanWidgetConfig): PlanWidgetModel | null {
  const entries = config.entitlements.filter(
    (entry) => entitlementSourceId(entry).startsWith(`team-plan:`) || config.availableProviders.some((provider) => provider.id === entry.providerId)
  );
  const selectedEntry = entries.find((entry) => entitlementSourceId(entry) === config.selectedProviderId);
  const activeEntry =
    (selectedEntry && hasActiveEntitlementForProvider(selectedEntry.snapshot, selectedEntry.providerId) ? selectedEntry : void 0) ??
    entries.find((entry) => hasActiveEntitlementForProvider(entry.snapshot, entry.providerId));
  const displayedEntitlement = activeEntry ?? selectedEntry ?? entries[0] ?? null;
  const activeProviderId = activeEntry ? entitlementSourceId(activeEntry) : void 0;
  const displayedProviderId = activeProviderId ?? config.selectedProviderId;
  const loading = config.modelProvidersLoading || entries.some((entry) => entry.loading);
  const visibleSnapshot = displayedEntitlement && hasActiveEntitlementForProvider(displayedEntitlement.snapshot, displayedEntitlement.providerId) ? displayedEntitlement.snapshot : null;
  const activeProviderIds = entries.filter((entry) => hasActiveEntitlementForProvider(entry.snapshot, entry.providerId)).map((entry) => entitlementSourceId(entry));
  const hasAnyActiveCodingPlan = !!activeEntry;
  const tabProviders = entries
    .filter((entry) => activeProviderIds.includes(entitlementSourceId(entry)))
    .map((entry) => {
      const provider = config.availableProviders.find((candidate) => candidate.id === entry.providerId);
      return {
        id: entitlementSourceId(entry),
        providerId: entry.providerId,
        label: entry.label ?? provider?.name ?? codingPlanProviderFallbackName(entry.providerId),
      };
    });
  if ((!config.modelProvidersLoading && entries.length === 0) || (!loading && !hasAnyActiveCodingPlan)) return null;
  return {
    activeProviderId,
    displayedEntitlement,
    displayedProviderId,
    hasAnyActiveCodingPlan,
    loading,
    providerEntitlements: entries,
    tabProviders,
    visibleSnapshot,
  };
}

/** 原 r3e（js 76227）：1/2/3 列网格 */
function planWidgetGridCols(count: number): string {
  return count <= 1 ? `grid-cols-1` : count === 2 ? `grid-cols-2` : `grid-cols-3`;
}

/** 原 i3e（js 76230）：展示模型存在判定 */
function hasPlanWidgetModel(config: PlanWidgetConfig): boolean {
  return !!resolvePlanWidgetModel(config);
}

/** 原 a3e（js 76232）：HH:mm（h23） */
function formatResetTimeHm(opts: { locale: string; value: unknown }): string | undefined {
  if (!opts.value) return;
  const date = new Date(opts.value as number | string | Date);
  if (!Number.isNaN(date.getTime()))
    return new Intl.DateTimeFormat(opts.locale, {
      hour: `2-digit`,
      minute: `2-digit`,
      hourCycle: `h23`,
    }).format(date);
}

/** 原 o3e（js 76241）：侧栏配额行（标签+数值·重置时间+进度条） */
function PlanWidgetLimitRow(props: { color: string; label: string; percentage: number | null; resetTime?: string; value: string }): React.ReactElement {
  return (
    <div className={`min-w-0 space-y-1.5`}>
      <div className={`min-w-0 space-y-0.5 text-ui-sm`}>
        <div className={`min-w-0 truncate text-foreground-subtle`}>{props.label}</div>
        <div className={`min-w-0 text-ui-sm tabular-nums`}>
          <span className={`font-mono text-foreground`}>{props.value}</span>
          {props.resetTime ? <span className={`text-foreground-subtle`}>{` · `}{props.resetTime}</span> : null}
        </div>
      </div>
      <div className={`h-1.5 overflow-hidden rounded-full bg-surface-hover`}>
        <div
          className={`h-full rounded-full`}
          style={{
            backgroundColor: props.color,
            width: `${Number.isFinite(props.percentage) ? Math.max(0, Math.min(100, props.percentage ?? 0)) : 0}%`,
          }}
        />
      </div>
    </div>
  );
}

/** 原 s3e（js 76246）：侧栏 Coding Plan 配额件（标题+折扣徽章+用量入口+三限额网格） */
export function SidebarCodingPlanWidget(props: { config: PlanWidgetConfig; intl: IntlShape; locale: string; separated?: boolean }): React.ReactElement | null {
  const { config, intl, locale, separated = false } = props;
  const billingDiscount = useBillingDiscount();
  const model = React.useMemo(() => resolvePlanWidgetModel(config), [config]);
  if (!model) return null;
  const planLevel = model.visibleSnapshot?.quota?.level ?? null;
  const remaining = model.visibleSnapshot?.remaining;
  const unavailableReason = model.visibleSnapshot?.unavailableReason;
  const limits = model.visibleSnapshot?.quota?.limits ?? [];
  const fiveHourLimit = findQuotaLimit(limits, `TOKENS_LIMIT`, 3, 5);
  const weeklyLimit = findQuotaLimit(limits, `TOKENS_LIMIT`, 6);
  const monthlyToolLimit = findQuotaLimit(limits, `TIME_LIMIT`, 5, 1);
  const fiveHourReset = fiveHourLimit?.nextResetTime ? formatResetTimeHm({ locale, value: fiveHourLimit.nextResetTime }) : void 0;
  const weeklyReset = weeklyLimit?.nextResetTime ? formatQuotaResetTime({ locale, value: weeklyLimit.nextResetTime, format: `date` }) : void 0;
  const monthlyToolReset = monthlyToolLimit?.nextResetTime ? formatQuotaResetTime({ locale, value: monthlyToolLimit.nextResetTime, format: `date` }) : void 0;
  const unavailableLabel =
    unavailableReason === `not_configured`
      ? intl.formatMessage({ id: `sidebar.usage.plan.notConfigured` })
      : unavailableReason === `not_authenticated`
        ? intl.formatMessage({ id: `sidebar.usage.plan.loginRequired` })
        : unavailableReason === `no_plan`
          ? intl.formatMessage({ id: `sidebar.usage.plan.noPlan` })
          : intl.formatMessage({ id: `sidebar.usage.plan.unavailable` });
  const isEmptyState = !model.loading && !remaining && limits.length === 0 && !planLevel;
  const rows = [
    fiveHourLimit
      ? {
          color: `var(--color-usage-chart-1)`,
          key: `fiveHour`,
          label: intl.formatMessage({ id: `sidebar.usage.plan.fiveHour` }),
          limit: fiveHourLimit,
          resetTime: fiveHourReset,
        }
      : null,
    weeklyLimit
      ? {
          color: `var(--color-usage-chart-2)`,
          key: `weekly`,
          label: intl.formatMessage({ id: `sidebar.usage.plan.weekly` }),
          limit: weeklyLimit,
          resetTime: weeklyReset,
        }
      : null,
    monthlyToolLimit
      ? {
          color: `var(--color-usage-chart-3)`,
          key: `monthlyTool`,
          label: intl.formatMessage({ id: `sidebar.usage.plan.toolCalls` }),
          limit: monthlyToolLimit,
          resetTime: monthlyToolReset,
        }
      : null,
  ].filter((row): row is NonNullable<typeof row> => row !== null);
  return (
    <div className={separated ? `border-t border-border pt-2` : void 0}>
      <div className={`flex min-w-0 items-center mb-2 gap-3`}>
        <div className={`flex min-w-0 flex-1 items-center gap-1`}>
          <span className={`min-w-0 truncate text-ui-base font-medium text-foreground`}>
            {intl.formatMessage({ id: `sidebar.usage.plan.title` })}
          </span>
          {billingDiscount.active ? <BillingDiscountBadgeWithInfo config={billingDiscount.config} size={`compact`} /> : null}
        </div>
        {config.onUsageClick ? (
          <button
            type={`button`}
            aria-label={intl.formatMessage({ id: `sidebar.usage.plan.open` })}
            className={`inline-flex h-6 shrink-0 items-center gap-0.5 text-ui-sm text-foreground-subtle hover:text-foreground hover:underline`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              config.onUsageClick?.();
            }}
          >
            <span>{intl.formatMessage({ id: `sidebar.usage.plan.open` })}</span>
            <ArrowRightIcon className={`size-3.5`} />
          </button>
        ) : null}
      </div>
      <div className={cn(`grid gap-2`, planWidgetGridCols(rows.length))}>
        {model.loading && !model.visibleSnapshot ? (
          <div className={`flex items-center gap-2 p-2 text-ui-base text-foreground-subtle`}>
            <SpinnerIcon className={`size-3.5 animate-spin`} />
            {intl.formatMessage({ id: `sidebar.usage.plan.loading` })}
          </div>
        ) : model.displayedEntitlement?.error ? (
          <div className={`rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-base text-destructive`}>
            {model.displayedEntitlement.error}
          </div>
        ) : isEmptyState ? (
          <div className={`p-2 text-ui-base leading-relaxed text-foreground-subtle`}>{unavailableLabel}</div>
        ) : (
          rows.map((row) => (
            <PlanWidgetLimitRow
              key={row.key}
              color={row.color}
              label={row.label}
              percentage={quotaPercent(row.limit)}
              value={formatQuotaUsage(locale, row.limit)}
              resetTime={row.resetTime}
            />
          ))
        )}
      </div>
    </div>
  );
}

/** 原 kq（js 76370）：模型展示名（GLM-* 保留；turbo→Turbo；GLM/API/MCP/AI 大写；词首大写） */
export function modelDisplayName(rawName: string): string {
  const normalized = rawName.replace(/\s+/g, ` `).trim();
  if (/^GLM-\S+$/i.test(normalized))
    return normalized
      .split(`-`)
      .map((part, index) => (index === 0 ? `GLM` : /^turbo$/i.test(part) ? `Turbo` : part))
      .join(`-`);
  const spaced = normalized.replace(/[_-]+/g, ` `);
  return spaced
    ? spaced
        .split(` `)
        .map((word) =>
          /^(GLM|API|MCP|AI)$/i.test(word)
            ? word.toUpperCase()
            : /^\d+(\.\d+)?$/.test(word)
              ? word
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(` `)
    : ``;
}

/** 原 c3e（js 76398）：限额总量（number ?? unit ?? 0） */
function limitTotalOf(limit: EntitlementQuotaLimit): number {
  return limit.number ?? limit.unit ?? 0;
}

/** 原 l3e（js 76401）：限额剩余（remaining ?? 0） */
function limitRemainingOf(limit: EntitlementQuotaLimit): number {
  return limit.remaining ?? 0;
}

/** 原 u3e（js 76403）：0–1 比值 → 整数百分比 */
function formatUsedPercent(ratio: number, locale: string): string {
  const clamped = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
  return new Intl.NumberFormat(locale || void 0, { maximumFractionDigits: 0, style: `percent` }).format(clamped);
}

/** 原 d3e（js 76613 区 / jsx 67613）：Start Plan 下一重置时间（renewTime → remaining → limits 最早） */
function startPlanNextResetTimeOf(snapshot: EntitlementSnapshot | null): number | undefined {
  const renewTime = snapshot?.subscription?.details?.[0]?.renewTime?.trim();
  if (renewTime) {
    const parsed = Date.parse(renewTime);
    if (Number.isFinite(parsed)) return parsed;
  }
  const remainingReset = snapshot?.remaining?.nextResetTime;
  if (typeof remainingReset == `number` && Number.isFinite(remainingReset)) return remainingReset;
  return (snapshot?.quota?.limits ?? [])
    .map((limit) => limit.nextResetTime)
    .filter((value): value is number => typeof value == `number` && Number.isFinite(value))
    .sort((a, b) => a - b)[0];
}

/** 原 f3e（js 76417 区）：重置时间紧凑格式（今天=HH:mm，否则 `Mon d HH:mm`） */
function formatResetDateTimeCompact(value: number | undefined, locale: string): string | undefined {
  if (!value) return;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return;
  const datePart = new Intl.DateTimeFormat(locale || void 0, { month: `short`, day: `numeric` }).format(date);
  const timePart = new Intl.DateTimeFormat(locale || void 0, {
    hour: `2-digit`,
    minute: `2-digit`,
    hourCycle: `h23`,
  }).format(date);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
    ? timePart
    : `${datePart} ${timePart}`;
}

/** 原 p3e（js 76437 区）：`model:` 前缀剥离；glm-5-turbo 特判；其余大写 */
function normalizeStartPlanModelCode(modelCode: string): string {
  const stripped = modelCode.replace(/^model:/i, ``);
  return stripped.toLowerCase() === `glm-5-turbo` ? `GLM-5Turbo` : stripped.toUpperCase();
}

/** 原 m3e（js 76440 区）：限额模型标签（usageDetails 展示名 `/` 连接；空 → type） */
function limitModelLabel(limit: EntitlementQuotaLimit): string {
  const names = (limit.usageDetails ?? [])
    .map((detail) => {
      const displayName = detail.displayName?.trim();
      return modelDisplayName(displayName || normalizeStartPlanModelCode(detail.modelCode.trim()));
    })
    .filter((name) => name.length > 0);
  return names.length === 0 ? limit.type : names.join(` / `);
}

/** 原 h3e（js 76449 区）：可见限额过滤（总量>0 或 剩余>0） */
function visibleStartPlanLimits(snapshot: EntitlementSnapshot | null): EntitlementQuotaLimit[] {
  return (snapshot?.quota?.limits ?? []).filter((limit) => {
    const total = limitTotalOf(limit);
    const remaining = limitRemainingOf(limit);
    return total > 0 || remaining > 0;
  });
}

/** 原 g3e（js 76456 区）：余额件可见判定 */
function hasStartPlanBalance(state: { loading: boolean; snapshot: EntitlementSnapshot | null } | undefined): boolean {
  return state ? state.loading || visibleStartPlanLimits(state.snapshot).length > 0 : false;
}

/** 原 _3e（js 76458 区）：Start Plan 余额行（剩余比进度条，bg-success） */
function StartPlanBalanceRow(props: { limit: EntitlementQuotaLimit; locale: string; renewTime?: string }): React.ReactElement {
  const total = limitTotalOf(props.limit);
  const remaining = limitRemainingOf(props.limit);
  const usedRatio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  return (
    <div className={`min-w-0 space-y-1.5`}>
      <div className={`min-w-0 space-y-0.5 text-ui-sm`}>
        <div className={`min-w-0 truncate text-foreground-subtle`}>{limitModelLabel(props.limit)}</div>
        <div className={`min-w-0 text-ui-sm tabular-nums`}>
          <span className={`font-mono text-foreground`}>{formatUsedPercent(usedRatio, props.locale)}</span>
          {props.renewTime ? <span className={`text-foreground-subtle`}>{` · `}{props.renewTime}</span> : null}
        </div>
      </div>
      <div className={`h-1.5 overflow-hidden rounded-full bg-surface-hover`}>
        <div className={`h-full rounded-full bg-success`} style={{ width: `${usedRatio * 100}%` }} />
      </div>
    </div>
  );
}

export interface StartPlanWidgetConfig {
  loading: boolean;
  snapshot: EntitlementSnapshot | null;
  onUpgradeClick?: () => void;
}

/** 原 v3e（js 76492）：侧栏 Start Plan 余额件（标题+升级按钮（折扣渐变态）+限额网格） */
export function SidebarStartPlanWidget(props: { config: StartPlanWidgetConfig; intl: IntlShape; locale: string; separated?: boolean }): React.ReactElement | null {
  const { config, intl, locale, separated = false } = props;
  const billingDiscount = useBillingDiscount();
  const discountActive = billingDiscount.active === true;
  const limits = visibleStartPlanLimits(config.snapshot);
  const renewLabel = formatResetDateTimeCompact(startPlanNextResetTimeOf(config.snapshot), locale);
  if (!config.loading && limits.length === 0) return null;
  return (
    <div className={separated ? `border-t border-border pt-2` : void 0}>
      <div className={`mb-2 flex min-w-0 items-center gap-3`}>
        <div className={`flex min-w-0 flex-1 items-center gap-1.5`}>
          <span className={`min-w-0 truncate text-ui-base font-medium text-foreground`}>
            {intl.formatMessage({ id: `settings.modelProvider.startPlan.balance.title` })}
          </span>
          {config.loading ? <SpinnerIcon className={`size-3.5 shrink-0 animate-spin text-foreground-subtle`} /> : null}
        </div>
        {config.onUpgradeClick ? (
          <div className={`inline-flex shrink-0 items-center gap-1`}>
            <Button
              type={`button`}
              size={`xs`}
              className={cn(
                `h-6 shrink-0 gap-1 px-2 text-ui-sm`,
                discountActive && `button-gradient rounded-full pr-[5px] text-white hover:bg-transparent hover:opacity-90 dark:bg-[#484A58] dark:hover:bg-[#484A58]`
              )}
              onClick={(event: any) => {
                event.preventDefault();
                event.stopPropagation();
                config.onUpgradeClick?.();
              }}
            >
              <RocketIcon className={`size-3`} />
              {intl.formatMessage({ id: `chat.quota.action.upgrade` })}
              {discountActive ? (
                <BillingDiscountBadge config={billingDiscount.config} iconVisible={false} size={`compact`} variant={`surface`} />
              ) : null}
            </Button>
            {discountActive ? <BillingDiscountInfoDialog config={billingDiscount.config} /> : null}
          </div>
        ) : null}
      </div>
      <div className={cn(`grid gap-2`, planWidgetGridCols(limits.length))}>
        {limits.map((limit) => (
          <StartPlanBalanceRow key={`${limit.type}:${limitModelLabel(limit)}`} limit={limit} locale={locale} renewTime={renewLabel} />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * 5. 供应商环境/内网探测助手（原 i7…gYt，js 187188–187304 / jsx 151029–151160）
 * ==========================================================================*/

/** 原 i7（js 187289）：trim 非空 → 字符串，否则 undefined */
function trimmedOrUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : void 0;
}

/** 原 aYt（js 187293）：环境覆盖（3.7.6 三个注入点恒空 → 原样返回） */
function effectiveEnvOverlay(env: Record<string, string> = {}): Record<string, string> {
  const effectiveEnv = trimmedOrUndefined(``);
  const networkEnv = trimmedOrUndefined(``);
  const simulatePublicProd = trimmedOrUndefined(``);
  return {
    ...env,
    ...(effectiveEnv ? { ZCODE_EFFECTIVE_ENV: effectiveEnv } : {}),
    ...(networkEnv ? { ZCODE_NETWORK_ENV: networkEnv } : {}),
    ...(simulatePublicProd ? { ZCODE_SIMULATE_PUBLIC_PROD: simulatePublicProd } : {}),
  };
}

/** 原 oYt/sYt/cYt/lYt（js 187304 区）：探测缺省常量 */
const INTRANET_PROBE_DEFAULT_TIMEOUT_MS = 800;
const INTRANET_PROBE_DEFAULT_ATTEMPTS = 2;
const INTRANET_PROBE_DEFAULT_TCP_PORT = 22;
const INTRANET_PROBE_MAX_ATTEMPTS = 3;

/** 原 uYt（js 187308）：超时钳制（100–10000，缺省 800） */
function clampTimeoutMs(value: unknown): number {
  return typeof value == `number` && Number.isFinite(value) ? Math.min(1e4, Math.max(100, Math.floor(value))) : INTRANET_PROBE_DEFAULT_TIMEOUT_MS;
}

/** 原 dYt（js 187313）：尝试次数钳制（1–3，缺省 2） */
function clampAttempts(value: unknown): number {
  if (typeof value != `number` || !Number.isFinite(value)) return INTRANET_PROBE_DEFAULT_ATTEMPTS;
  return Math.min(INTRANET_PROBE_MAX_ATTEMPTS, Math.max(1, Math.floor(value)));
}

/** 原 fYt（js 187318）：所需成功数钳制（1–目标数，缺省 1） */
function clampRequiredSuccessCount(value: unknown, targetCount: number): number {
  if (targetCount <= 0 || typeof value != `number` || !Number.isFinite(value)) return 1;
  return Math.min(targetCount, Math.max(1, Math.floor(value)));
}

type IntranetProbeTarget =
  | { kind: "service"; id: string; url: string; expectedMarker?: string; token?: string; timeoutMs: number }
  | { kind: "tcp"; id: string; host: string; port: number; timeoutMs: number };

/** 原 pYt（js 187323）：service|tcp 目标归一化（端口 1–65535，缺省 22） */
function normalizeProbeTarget(target: {
  kind: "service" | "tcp";
  id?: string;
  url?: string;
  expectedMarker?: string;
  token?: string;
  host?: string;
  port?: number;
  timeoutMs?: number;
}): IntranetProbeTarget {
  if (target.kind === `service`) {
    const url = (target.url ?? ``).trim();
    const expectedMarker = target.expectedMarker?.trim();
    const token = target.token?.trim();
    return {
      kind: `service`,
      id: target.id?.trim() || url,
      url,
      expectedMarker: expectedMarker && expectedMarker.length > 0 ? expectedMarker : void 0,
      token: token && token.length > 0 ? token : void 0,
      timeoutMs: clampTimeoutMs(target.timeoutMs),
    };
  }
  const host = (target.host ?? ``).trim();
  const port =
    typeof target.port == `number` && Number.isInteger(target.port) && target.port >= 1 && target.port <= 65535
      ? target.port
      : INTRANET_PROBE_DEFAULT_TCP_PORT;
  return {
    kind: `tcp`,
    id: target.id?.trim() || `${host}:${port}`,
    host,
    port,
    timeoutMs: clampTimeoutMs(target.timeoutMs),
  };
}

/** 原 mYt（js 187350）：探测配置稳定 JSON 键 */
function probeConfigKey(config: { attempts?: number; requiredSuccessCount?: number; targets?: unknown[] } | null): string {
  if (!config) return `null`;
  const targets = (config.targets ?? []).map((target) => normalizeProbeTarget(target as Parameters<typeof normalizeProbeTarget>[0]));
  return JSON.stringify({
    attempts: clampAttempts(config.attempts),
    requiredSuccessCount: clampRequiredSuccessCount(config.requiredSuccessCount, targets.length),
    targets,
  });
}

/** 原 a7（js 187359）：请求序号相等判定 */
function sameRequest(seqA: number, seqB: number): boolean {
  return seqA === seqB;
}

/** 原 hYt（js 187362）：内网探测 hook（自动/手动；序号防竞态） */
export function useIntranetProbe(
  probeConfig: { attempts?: number; requiredSuccessCount?: number; targets?: unknown[] } | null,
  opts: { enabled?: boolean; autoProbe?: boolean } = {}
): {
  result: { isIntranet: boolean } | null;
  isIntranet: boolean;
  probing: boolean;
  error: Error | null;
  probeNow: () => Promise<{ isIntranet: boolean } | null>;
} {
  const { systemService } = useServices() as unknown as { systemService: SystemService }; // A0-CLEANUP3 3b：BaseServices 收敛后与本地 SystemService 面不重叠，边界双断言
  const [result, setResult] = React.useState<{ isIntranet: boolean } | null>(null);
  const [probing, setProbing] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const enabled = opts.enabled ?? true;
  const autoProbe = opts.autoProbe ?? true;
  const requestSeq = React.useRef(0);
  const latestConfig = React.useRef(probeConfig);
  latestConfig.current = probeConfig;
  const configKey = probeConfigKey(probeConfig);
  const probeNow = React.useCallback(async () => {
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    const config = latestConfig.current;
    if (!enabled || !config) {
      setResult(null);
      setProbing(false);
      setError(null);
      return null;
    }
    setProbing(true);
    setError(null);
    try {
      const probeResult = await systemService.probeIntranet(config);
      if (sameRequest(seq, requestSeq.current)) setResult(probeResult);
      return probeResult;
    } catch (error) {
      const normalized = error instanceof Error ? error : Error(String(error));
      if (sameRequest(seq, requestSeq.current)) {
        setError(normalized);
        logger.warn(`[IntranetProbe] 内网探测失败`, normalized);
      }
      return null;
    } finally {
      if (sameRequest(seq, requestSeq.current)) setProbing(false);
    }
  }, [enabled, systemService]);
  React.useEffect(() => {
    if (autoProbe) probeNow();
  }, [autoProbe, enabled, probeNow, configKey]);
  return { result, isIntranet: result?.isIntranet ?? false, probing, error, probeNow };
}

/** 原 gYt（js 187296）：zapi 可用判定（环境解析 + 内网探测；对应 SettingsPanels 的 useZapiEnabled 声明） */
export function useZapiEnabled(): boolean {
  const env = effectiveEnvOverlay({});
  const preProbe = resolveZapiEnvironment({ rawEnv: RAW_RUNTIME_ENV, probedIsIntranet: false, env });
  const { isIntranet } = useIntranetProbe(preProbe.shouldProbe ? INTRANET_PROBE_PRESET_CONFIG : null, {
    enabled: preProbe.shouldProbe,
    autoProbe: preProbe.shouldProbe,
  });
  const resolved = resolveZapiEnvironment({ rawEnv: RAW_RUNTIME_ENV, probedIsIntranet: preProbe.shouldProbe ? isIntranet : preProbe.isIntranet, env });
  return zapiEnabledOf({ env: resolved.env, isIntranet: resolved.isIntranet });
}

/* 环境解析宿主面（Ene/Mee/xte/hi，src chunk 与宿主常量，接口级） */
declare const RAW_RUNTIME_ENV: Record<string, string>; // hi（src-HCld2afU.js 运行环境常量）
declare const INTRANET_PROBE_PRESET_CONFIG: { attempts?: number; requiredSuccessCount?: number; targets?: unknown[] } | null; // xte
declare function resolveZapiEnvironment(opts: {
  rawEnv: Record<string, string>;
  probedIsIntranet: boolean;
  env: Record<string, string>;
}): { shouldProbe: boolean; isIntranet: boolean; env: Record<string, string> }; // Ene
declare function zapiEnabledOf(opts: { env: Record<string, string>; isIntranet: boolean }): boolean; // Mee

/* ============================================================================
 * 6. 供应商草稿/模型机制（原 _Yt…MYt，js 187305–187630 / jsx 151161–151416）
 * ==========================================================================*/

/** 原 _Yt（js 187305）：API 格式三枚举 */
const API_FORMATS = [`anthropic-messages`, `openai-chat-completions`, `openai-responses`];

/** 原 yYt（js 187309）：格式集合 → 首个已知格式（单元素表） */
function firstKnownFormatOf(formats: string[]): string[] {
  const known = new Set(formats);
  const first = API_FORMATS.find((format) => known.has(format));
  return first ? [first] : [];
}

/** 原 bYt（js 187314）：baseURL 草稿解析（原实现委托 Tn；此处按调用面保留签名） */
function baseUrlOfDraft(baseUrl: string, _format?: string, _path?: string): string {
  return resolveDraftBaseUrl(baseUrl);
}
declare function resolveDraftBaseUrl(baseUrl: string): string; // Tn（src chunk）

/** 原 xYt（js 187317）：端点路径归一化（缺省路径 + `/` 前缀） */
function normalizeEndpointPath(kind: string, path: string | undefined): string {
  const normalized = (path?.trim() ?? ``) || defaultPathOfKind(kind);
  return normalized.startsWith(`/`) ? normalized : `/${normalized}`;
}

/** 原 SYt（js 187321）：格式表 → {baseURL, paths}（缺省 anthropic-messages） */
function endpointsOfFormats(
  provider: ModelProvider,
  formats: string[],
  baseUrl: string,
  _paths?: Record<string, string>
): { baseURL: string; paths: Record<string, string> } {
  const format = firstKnownFormatOf(formats)[0] ?? `anthropic-messages`;
  const kind = kindOfApiFormat(format);
  const path = defaultPathOfKind(kind);
  return { baseURL: baseUrlOfDraft(baseUrl, kind, path), paths: { [kind]: path } };
}

/** 原 vYt（js 187306）：单格式端点（baseUrl 未编辑时的回退） */
function endpointsOfFormatSingle(provider: ModelProvider, format: string, baseUrl: string): { baseURL: string; paths: Record<string, string> } {
  return endpointsOfFormats(provider, [format], baseUrl);
}

/** 原 CYt（js 187331）：apiKey 模式 + 系统禁用 → 自动启用草稿（族匹配且当前禁用） */
function autoEnableApiKeyProviderDraft(opts: {
  provider: ModelProvider | null;
  mode: string;
  now: () => number;
}): ModelProvider | null {
  const { provider, mode, now } = opts;
  if (!provider || mode !== `apiKey` || provider.apiKey.trim().length === 0) return null;
  const family = familyOfPresetId(provider.id);
  if (
    !family ||
    provider.id !== family.apiKeyProviderId ||
    (provider.enabled !== false && provider.systemDisabledReason === void 0)
  )
    return null;
  return { ...provider, enabled: true, systemDisabledReason: void 0, updatedAt: now() };
}

/** 原 wYt（js 187340）：baseURL 草稿 → 解析值 */
function resolvedBaseUrlOf(_provider: ModelProvider, format: string, baseUrl: string, _path?: string): string {
  const kind = kindOfApiFormat(format);
  return baseUrlOfDraft(baseUrl.trim(), kind, defaultPathOfKind(kind));
}

/** 原 TYt（js 187344）：端点补丁（baseURL 可省 + 单路径表） */
function endpointsPatchOf(
  provider: ModelProvider,
  format: string,
  baseUrl: string,
  paths?: Record<string, string>
): { baseURL?: string; paths: Record<string, string> } {
  const kind = kindOfApiFormat(format);
  const path = defaultPathOfKind(kind);
  const resolved = resolvedBaseUrlOf(provider, format, baseUrl, path);
  void paths;
  return { ...(resolved ? { baseURL: resolved } : {}), paths: { [kind]: path } };
}

export interface ProviderFormDraft {
  nameValue: string;
  apiFormat?: string;
  anthropicValue?: string;
  openaiValue?: string;
  baseUrlValue?: string;
  endpointPathsValue?: Record<string, string>;
  apiKeyValue: string;
}

/** 原 o7（js 187345）：草稿差异 → 变更供应商（无变更 → null；headers 恒清除） */
export function providerDraftDiff(opts: {
  provider: ModelProvider;
  draft: ProviderFormDraft;
  readOnlyEndpoints?: boolean;
  now: () => number;
}): ModelProvider | null {
  const { provider, draft, readOnlyEndpoints, now } = opts;
  const trimmedName = draft.nameValue.trim();
  const name = trimmedName.length > 0 ? trimmedName : provider.name;
  const fallbackFormat = draft.anthropicValue?.trim() ? `anthropic-messages` : `openai-chat-completions`;
  const apiFormat = draft.apiFormat ?? fallbackFormat;
  const baseUrlValue = draft.baseUrlValue ?? (apiFormat === `anthropic-messages` ? draft.anthropicValue : draft.openaiValue) ?? ``;
  const endpoints = readOnlyEndpoints
    ? provider.endpoints
    : draft.baseUrlValue === void 0
      ? endpointsOfFormatSingle(provider, apiFormat, baseUrlValue.trim())
      : endpointsPatchOf(provider, apiFormat, baseUrlValue, draft.endpointPathsValue);
  const nameChanged = name !== provider.name;
  const endpointsChanged = JSON.stringify(endpoints) !== JSON.stringify(provider.endpoints);
  const formatChanged = !readOnlyEndpoints && apiFormat !== apiFormatOfProvider(provider);
  const apiKeyChanged = draft.apiKeyValue !== provider.apiKey;
  const hasLegacyHeaders = provider.headers !== void 0;
  if (!nameChanged && !endpointsChanged && !formatChanged && !apiKeyChanged && !hasLegacyHeaders) return null;
  return {
    ...provider,
    ...(readOnlyEndpoints ? {} : { apiFormat, defaultKind: kindOfApiFormat(apiFormat) }),
    name,
    endpoints,
    ...(provider.headers === void 0 ? {} : { headers: void 0 }),
    apiKey: draft.apiKeyValue,
    updatedAt: now(),
  };
}

/** 原 EYt（js 187373）：差异 ?? 原供应商（测试用草稿） */
function providerDraftOrSelf(opts: { provider: ModelProvider; draft: ProviderFormDraft; readOnlyEndpoints?: boolean; now: () => number }): ModelProvider {
  return providerDraftDiff(opts) ?? opts.provider;
}

/** 原 DYt（js 187376）：模型 kind 三枚举 */
const MODEL_KINDS = [`anthropic`, `openai-compatible`, `openai`];

/** 原 s7（js 187378）：过滤已知 kind（保持枚举序） */
function filterKnownKinds(kinds: string[]): string[] {
  const known = new Set(kinds);
  return MODEL_KINDS.filter((kind) => known.has(kind));
}

/** 原 OYt（js 187381）：允许集过滤（未给 → 原样） */
function filterAllowedKinds(opts: { kinds: string[]; allowedKinds?: string[] }): string[] {
  const known = filterKnownKinds(opts.kinds);
  if (opts.allowedKinds === void 0) return known;
  const allowed = new Set(filterKnownKinds(opts.allowedKinds));
  return known.filter((kind) => allowed.has(kind));
}

export interface ModelDraft {
  idValue: string;
  nameValue: string;
  kindsValue: string[];
  contextWindowValue: string;
  maxOutputTokensValue: string;
}

/** 原 c7（js 187390）：模型 → 草稿 */
function modelToDraft(model: ModelMetadata): ModelDraft {
  return {
    idValue: model.id,
    nameValue: model.name ?? ``,
    kindsValue: filterKnownKinds(model.kinds),
    contextWindowValue: String(contextWindowOf(model.id, model.contextWindow)),
    maxOutputTokensValue: model.maxOutputTokens === void 0 ? `` : String(model.maxOutputTokens),
  };
}

/** 原 kYt（js 187399）：正整数字符串 → number（否则 null） */
function parsePositiveInteger(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** 原 AYt（js 187403）：模型草稿校验（invalid 四字段 / commit） */
function validateModelDraft(opts: {
  currentModel: ModelMetadata;
  draft: ModelDraft;
  preferredDefaultKind?: string;
  allowedKinds?: string[];
}): { status: "invalid"; field: "id" | "kinds" | "contextWindow" | "maxOutputTokens" } | { status: "commit"; model: ModelMetadata } {
  const { currentModel, draft, preferredDefaultKind, allowedKinds } = opts;
  const modelId = draft.idValue.trim();
  if (!modelId) return { status: `invalid`, field: `id` };
  const kinds = filterAllowedKinds({ kinds: draft.kindsValue, allowedKinds });
  if (kinds.length === 0) return { status: `invalid`, field: `kinds` };
  const defaultKind = preferredDefaultKind && kinds.includes(preferredDefaultKind) ? preferredDefaultKind : kinds[0];
  const contextWindow = isBuiltInModelId(modelId) ? contextWindowOf(modelId, void 0) : parsePositiveInteger(draft.contextWindowValue);
  if (contextWindow === null) return { status: `invalid`, field: `contextWindow` };
  const maxOutputTokens = draft.maxOutputTokensValue.trim() ? parsePositiveInteger(draft.maxOutputTokensValue) : void 0;
  if (maxOutputTokens === null) return { status: `invalid`, field: `maxOutputTokens` };
  return {
    status: `commit`,
    model: {
      ...currentModel,
      id: modelId,
      name: draft.nameValue.trim() || void 0,
      kinds,
      defaultKind,
      contextWindow,
      maxOutputTokens,
    },
  };
}

/** 原 jYt（js 187447）：聚焦全选 */
function selectOnFocus(event: React.FocusEvent<HTMLInputElement>): void {
  event.currentTarget.select();
}

/** 原 MYt（js 187429）：模型元数据对话框（edit=铅笔触发 / add=按钮触发；高级=最大输出） */
export function ModelMetadataDialog(props: {
  mode?: "edit" | "add";
  open: boolean;
  draft: ModelDraft;
  draftErrorMessage: string | null;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (patch: Partial<ModelDraft>) => void;
  onCommit: () => boolean;
  maxOutputTokensLookupPending?: boolean;
}): React.ReactElement {
  const { mode = `edit`, open, draft, draftErrorMessage, onOpenChange, onDraftChange, onCommit, maxOutputTokensLookupPending = false } = props;
  const { intl } = useIntlContext();
  const editLabel = intl.formatMessage({ id: `settings.modelProvider.editModel` });
  const isBuiltIn = isBuiltInModelId(draft.idValue);
  const contextWindowValue = isBuiltIn ? String(BUILTIN_MODEL_CONTEXT_WINDOW) : draft.contextWindowValue;
  const autoFocusId = mode === `add` || isBuiltIn;
  const autoFocusContextWindow = mode === `edit` && !isBuiltIn;
  const builtInInputClass = isBuiltIn
    ? `cursor-not-allowed border-border bg-surface text-foreground-subtle hover:border-border focus-visible:border-border focus-visible:bg-surface`
    : void 0;
  const lookupPending = mode === `add` && maxOutputTokensLookupPending;
  const maxOutputDisabled = mode === `add` && (!draft.idValue.trim() || lookupPending);
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      {mode === `edit` ? (
        <DialogTrigger asChild>
          <Button type={`button`} variant={`ghost`} size={`icon-sm`} className={`shrink-0 p-0`} aria-label={editLabel} title={editLabel}>
            <PencilIcon className={`size-3.5 text-foreground-subtle`} />
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className={`max-h-[calc(100vh-2rem)] max-w-xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden`}>
        <DialogHeader className={`pr-8`}>
          <DialogTitle className={`truncate`}>
            {intl.formatMessage({ id: mode === `add` ? `settings.modelProvider.addModel` : `settings.modelProvider.editModel` })}
          </DialogTitle>
          <DialogDescription className={`sr-only`}>
            {intl.formatMessage({ id: `settings.modelProvider.editModelDescription` })}
          </DialogDescription>
        </DialogHeader>
        <div className={`min-h-0 space-y-3 overflow-y-auto pr-1`}>
          <div>
            <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
              {intl.formatMessage({ id: `settings.modelProvider.modelId` })}
            </label>
            <Input
              type={`text`}
              autoFocus={autoFocusId}
              size={`lg`}
              className={`font-mono`}
              value={draft.idValue}
              placeholder={intl.formatMessage({ id: `settings.modelProvider.modelId` })}
              onChange={(event) => {
                const value = event.target.value;
                onDraftChange({ idValue: value, ...(isBuiltInModelId(value) ? { contextWindowValue: String(BUILTIN_MODEL_CONTEXT_WINDOW) } : {}) });
              }}
              onKeyDown={(event) => {
                if (event.key === `Enter`) {
                  event.preventDefault();
                  onCommit();
                }
              }}
            />
          </div>
          <div>
            <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
              {intl.formatMessage({ id: `settings.modelProvider.contextWindow` })}
            </label>
            <Input
              type={`text`}
              autoFocus={autoFocusContextWindow}
              inputMode={`numeric`}
              pattern={`[0-9]*`}
              size={`lg`}
              className={builtInInputClass}
              value={contextWindowValue}
              readOnly={isBuiltIn}
              onChange={(event) => {
                if (!isBuiltIn) onDraftChange({ contextWindowValue: event.target.value });
              }}
              onFocus={isBuiltIn ? void 0 : selectOnFocus}
              onKeyDown={(event) => {
                if (event.key === `Enter`) {
                  event.preventDefault();
                  onCommit();
                }
              }}
            />
          </div>
          <CollapsibleRoot>
            <CollapsibleTrigger
              className={`group flex w-full items-center gap-2 rounded-md py-1 text-left text-ui-base font-medium text-foreground-subtle outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50`}
            >
              <ArrowRightIcon className={`size-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-90`} aria-hidden={`true`} />
              <span className={`min-w-0 flex-1`}>{intl.formatMessage({ id: `settings.modelProvider.advanced` })}</span>
              {lookupPending ? (
                <span className={`inline-flex shrink-0 items-center text-foreground-subtlest`} role={`status`}>
                  <SpinnerIcon className={`size-3.5 animate-spin`} aria-hidden={`true`} />
                  <span className={`sr-only`}>{intl.formatMessage({ id: `common.loading` })}</span>
                </span>
              ) : null}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className={`pt-3`}>
                <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
                  {intl.formatMessage({ id: `settings.modelProvider.maxOutputTokens` })}
                </label>
                <Input
                  type={`text`}
                  inputMode={`numeric`}
                  pattern={`[0-9]*`}
                  size={`lg`}
                  value={draft.maxOutputTokensValue}
                  disabled={maxOutputDisabled}
                  aria-label={intl.formatMessage({ id: `settings.modelProvider.maxOutputTokens` })}
                  aria-busy={lookupPending}
                  onChange={(event) => {
                    onDraftChange({ maxOutputTokensValue: event.target.value });
                  }}
                  onFocus={selectOnFocus}
                  onKeyDown={(event) => {
                    if (event.key === `Enter`) {
                      event.preventDefault();
                      onCommit();
                    }
                  }}
                />
              </div>
            </CollapsibleContent>
          </CollapsibleRoot>
          {draftErrorMessage ? <div className={`text-ui-base text-destructive`}>{draftErrorMessage}</div> : null}
        </div>
        <DialogFooter>
          <Button type={`button`} variant={`outline`} onClick={() => onOpenChange(false)}>
            {intl.formatMessage({ id: `common.cancel` })}
          </Button>
          <Button type={`button`} disabled={lookupPending} onClick={onCommit}>
            {intl.formatMessage({ id: `common.save` })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

/* ============================================================================
 * 7. 供应商表单字段件（原 NYt…qYt，js 187631–187935 / jsx 151417–151650）
 * ==========================================================================*/

/** 原 NYt（js 187631）：上下文窗口紧凑格式（locale 参数存在但实现固定 en-US） */
function formatContextWindowCompact(value: number, _locale: string = `en-US`): string {
  return formatCompactNumber(`en-US`, value);
}

/** 原 PYt（js 187634）：获取 API Key 链接（仅缺 key 时显示） */
function GetApiKeyLink(props: { apiKey: string; onOpenApiKey: () => void }): React.ReactElement | null {
  const { intl } = useIntlContext();
  return isApiKeyMissing(props.apiKey) ? (
    <div className={`text-foreground-subtlest flex items-center text-ui-base`}>
      <button type={`button`} className={`text-primary cursor-pointer font-medium hover:underline`} onClick={props.onOpenApiKey}>
        {intl.formatMessage({ id: `settings.modelProvider.getApiKey` })}
      </button>
    </div>
  ) : null;
}

/** 原 FYt（js 187649）：模型行（id 输入 + 上下文徽章 + 测试 + 编辑对话框 + 删除） */
export function ModelRow(props: {
  model: ModelMetadata;
  autoFocus?: boolean;
  inputTestId?: string;
  deleteTestId?: string;
  allowedKinds?: string[];
  currentKind?: string | null;
  onCommit: (model: ModelMetadata) => void;
  onDelete: () => void;
  showTestButton?: boolean;
  onTest?: (modelId: string) => Promise<{ results: unknown[] }>;
  readOnly?: boolean;
}): React.ReactElement {
  const { model, autoFocus, inputTestId, deleteTestId, allowedKinds, currentKind, onCommit, onDelete, showTestButton, onTest, readOnly } = props;
  const { intl, locale } = useIntlContext();
  const [draft, setDraft] = React.useState<ModelDraft>(() => modelToDraft(model));
  const [testing, setTesting] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [invalidField, setInvalidField] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<{ success: boolean; failureReason?: string; noEndpointResult?: boolean } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    setDraft(modelToDraft(model));
    setInvalidField(null);
    setTestResult(null);
  }, [model]);
  React.useEffect(() => {
    if (autoFocus && !readOnly) inputRef.current?.focus();
  }, [autoFocus, readOnly]);
  const patchDraft = React.useCallback((patch: Partial<ModelDraft>) => {
    setDraft((previous) => ({ ...previous, ...patch }));
    setInvalidField(null);
    setTestResult(null);
  }, []);
  const commitDraft = React.useCallback((): boolean => {
    if (readOnly) return true;
    const result = validateModelDraft({ currentModel: model, draft, preferredDefaultKind: currentKind ?? undefined, allowedKinds });
    if (result.status === `invalid`) {
      setInvalidField(result.field);
      return false;
    }
    setInvalidField(null);
    onCommit(result.model);
    return true;
  }, [allowedKinds, currentKind, draft, model, onCommit, readOnly]);
  const resetDraft = React.useCallback(() => {
    setDraft(modelToDraft(model));
    setInvalidField(null);
    setEditOpen(false);
  }, [model]);
  const openEdit = React.useCallback(() => {
    setDraft(modelToDraft(model));
    setInvalidField(null);
    setEditOpen(true);
  }, [model]);
  const handleEditOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        resetDraft();
        return;
      }
      openEdit();
    },
    [resetDraft, openEdit]
  );
  const commitFromDialog = React.useCallback((): boolean => {
    if (commitDraft()) {
      setEditOpen(false);
      return true;
    }
    return false;
  }, [commitDraft]);
  const runTest = React.useCallback(async () => {
    if (!onTest || testing) return;
    setTestResult(null);
    setTesting(true);
    try {
      setTestResult(summarizeModelTestResults((await onTest(draft.idValue.trim())).results));
    } catch (error) {
      setTestResult({ success: false, failureReason: error instanceof Error ? error.message : void 0 });
    } finally {
      setTesting(false);
    }
  }, [onTest, testing, draft.idValue]);
  const testIcon = testing ? (
    <SpinnerIcon className={`size-3.5 text-foreground-subtle animate-spin`} />
  ) : (
    <UnplugIcon className={`size-3.5 text-foreground-subtle`} />
  );
  let testMessage: string | null = null;
  if (testResult?.success) {
    testMessage = intl.formatMessage({ id: `settings.modelProvider.testModel.success` });
  } else if (testResult) {
    const failureReason =
      testResult.failureReason ??
      (testResult.noEndpointResult ? intl.formatMessage({ id: `settings.modelProvider.testModel.error.noEndpoint` }) : null);
    testMessage = failureReason
      ? intl.formatMessage({ id: `settings.modelProvider.testModel.failedWithReason` }, { reason: failureReason })
      : intl.formatMessage({ id: `settings.modelProvider.testModel.failed` });
  }
  const invalidMessage = invalidField ? intl.formatMessage({ id: `settings.modelProvider.modelMetadata.invalid.${invalidField}` }) : null;
  const testVisible = showTestButton || !!onTest;
  const testDisabled = testing || !draft.idValue.trim() || !onTest;
  const contextWindowLabel = formatContextWindowCompact(contextWindowOf(model.id, model.contextWindow), locale);
  const contextWindowBadgeLabel = intl.formatMessage({ id: `settings.modelProvider.contextWindowBadgeLabel` }, { value: contextWindowLabel });
  return (
    <div className={`space-y-2 p-2`}>
      <div className={`flex items-center gap-2`}>
        <div className={`relative min-w-0 flex-1`}>
          <Input
            ref={inputRef}
            type={`text`}
            data-testid={inputTestId}
            size={`lg`}
            className={`min-w-0 rounded-md pr-20 font-mono`}
            value={draft.idValue}
            placeholder={intl.formatMessage({ id: `settings.modelProvider.modelId` })}
            readOnly={readOnly}
            onChange={(event) => {
              if (!readOnly) patchDraft({ idValue: event.target.value });
            }}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (!readOnly && event.key === `Enter`) (event.target as HTMLInputElement).blur();
            }}
          />
          <span
            className={`pointer-events-none absolute right-2 top-1/2 inline-flex h-5 max-w-20 -translate-y-1/2 items-center truncate rounded-md border border-border bg-surface px-1.5 font-mono text-ui-sm text-foreground-subtle`}
            aria-label={contextWindowBadgeLabel}
            title={contextWindowBadgeLabel}
          >
            {contextWindowLabel}
          </span>
        </div>
        {testVisible ? (
          <Button
            type={`button`}
            variant={`ghost`}
            size={`icon-sm`}
            className={`shrink-0 p-0`}
            disabled={testDisabled}
            title={intl.formatMessage({ id: `settings.modelProvider.testModel` })}
            onMouseDown={(event: any) => {
              event.preventDefault();
            }}
            onClick={runTest}
          >
            {testIcon}
          </Button>
        ) : null}
        {readOnly ? null : (
          <ModelMetadataDialog
            mode={`edit`}
            open={editOpen}
            draft={draft}
            draftErrorMessage={invalidMessage}
            onOpenChange={handleEditOpenChange}
            onDraftChange={patchDraft}
            onCommit={commitFromDialog}
          />
        )}
        {readOnly ? null : (
          <Button
            type={`button`}
            variant={`ghost`}
            size={`icon-sm`}
            className={`shrink-0 text-foreground-subtle`}
            data-testid={deleteTestId}
            aria-label={intl.formatMessage({ id: `settings.modelProvider.delete` })}
            title={intl.formatMessage({ id: `settings.modelProvider.delete` })}
            onMouseDown={(event: any) => {
              event.preventDefault();
            }}
            onClick={onDelete}
          >
            <TrashIcon className={`size-3.5`} />
          </Button>
        )}
      </div>
      {testResult ? (
        <div className={`px-2.5 pb-2 pt-1 text-ui-base`}>
          <span
            className={
              testResult.success
                ? `inline-flex max-w-full items-center rounded-md border border-success/30 bg-success/10 px-1.5 py-0.5 text-success`
                : `inline-flex max-w-full items-center rounded-md border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-destructive`
            }
          >
            <span className={`min-w-0 whitespace-pre-wrap break-words`}>{testMessage}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** 原 IYt（js 187827）：API Key 输入（密码/明文切换；只读禁用） */
function ApiKeyInput(props: {
  value: string;
  visible: boolean;
  readOnly?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onToggleVisibility: () => void;
}): React.ReactElement {
  const { value, visible, readOnly, onChange, onBlur, onToggleVisibility } = props;
  const { intl } = useIntlContext();
  return (
    <div className={`relative`}>
      <Input
        type={visible && !readOnly ? `text` : `password`}
        size={`lg`}
        data-testid={API_KEY_INPUT_TESTID}
        className={`pr-10 h-9`}
        placeholder={intl.formatMessage({ id: `settings.modelProvider.apiKeyPlaceholder` })}
        value={value}
        readOnly={readOnly}
        disabled={readOnly}
        onChange={(event) => {
          if (!readOnly) onChange(event.target.value);
        }}
        onBlur={readOnly ? void 0 : onBlur}
      />
      <Button
        type={`button`}
        variant={`ghost`}
        size={`icon-sm`}
        disabled={readOnly}
        className={`absolute top-1/2 right-1.5 -translate-y-1/2`}
        onClick={onToggleVisibility}
      >
        {visible ? <EyeOffIcon className={`size-3.5`} /> : <EyeIcon className={`size-3.5`} />}
      </Button>
    </div>
  );
}

/** 原 LYt（js 187860）：API 格式 × i18n 标签表 */
const API_FORMAT_LABELS = [
  {
    format: `anthropic-messages`,
    kind: `anthropic`,
    labelId: `settings.modelProvider.apiFormat.anthropicMessages`,
    shortLabelId: `settings.modelProvider.apiFormat.short.anthropicMessages`,
    titleLabelId: `settings.modelProvider.apiFormat.title.anthropicMessages`,
  },
  {
    format: `openai-chat-completions`,
    kind: `openai-compatible`,
    labelId: `settings.modelProvider.apiFormat.chatCompletions`,
    shortLabelId: `settings.modelProvider.apiFormat.short.chatCompletions`,
    titleLabelId: `settings.modelProvider.apiFormat.title.chatCompletions`,
  },
  {
    format: `openai-responses`,
    kind: `openai`,
    labelId: `settings.modelProvider.apiFormat.responses`,
    shortLabelId: `settings.modelProvider.apiFormat.short.responses`,
    titleLabelId: `settings.modelProvider.apiFormat.title.responses`,
  },
];

/** 原 RYt（js 187883）：格式标题（未登记 → 原样） */
function apiFormatTitleOf(intl: IntlShape, format: string): string {
  const entry = API_FORMAT_LABELS.find((candidate) => candidate.format === format);
  return entry ? intl.formatMessage({ id: entry.titleLabelId }) : format;
}

/** 原 l7（js 187886）：格式选项表（与 _Yt 同值的本域副本） */
const API_FORMAT_OPTIONS = [`anthropic-messages`, `openai-chat-completions`, `openai-responses`];

/** 原 zYt（js 187887 区）：格式缺省路径表 */
const API_FORMAT_DEFAULT_PATHS: Record<string, string> = {
  "anthropic-messages": `/v1/messages`,
  "openai-chat-completions": `/chat/completions`,
  "openai-responses": `/responses`,
};

/** 原 BYt（js 187892）：选项标签 `标题 (路径)` */
function apiFormatOptionLabel(intl: IntlShape, format: string): string {
  return `${apiFormatTitleOf(intl, format)} (${API_FORMAT_DEFAULT_PATHS[format] ?? format})`;
}

/** 原 VYt（js 187895）：API 格式下拉 */
function ApiFormatSelect(props: { apiFormatOptions?: string[]; triggerId?: string; value: string; onChange: (format: string) => void }): React.ReactElement {
  const { apiFormatOptions = API_FORMAT_OPTIONS, triggerId, value, onChange } = props;
  const { intl } = useIntlContext();
  return (
    <SelectRoot value={value} onValueChange={(next) => onChange(next)}>
      <SelectTrigger id={triggerId} size={`lg`} className={`w-full justify-between`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align={`start`}>
        {apiFormatOptions.map((format) => (
          <SelectItem key={format} value={format}>
            {apiFormatOptionLabel(intl, format)}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}

/** 原 HYt（js 187914）：供应商可选格式（端点 kind ∩ 模型 kind；空 → 全量） */
export function apiFormatOptionsOfProvider(provider: ModelProvider): string[] {
  const endpointKinds = endpointKindsOf(provider.endpoints);
  if (endpointKinds.length === 0) return [...API_FORMAT_OPTIONS];
  const modelKinds = new Set<string>();
  for (const model of provider.models) if (isFullModelEntry(model)) for (const kind of model.kinds) modelKinds.add(kind);
  const formats = (modelKinds.size > 0 ? endpointKinds.filter((kind) => modelKinds.has(kind)) : endpointKinds).map(apiFormatOfKind);
  return formats.length > 0 ? [...new Set(formats)] : [...API_FORMAT_OPTIONS];
}

/** 原 UYt/WYt/GYt（js 187922–187924）：预设三厂集 / 目录源 id / 查询防抖 */
const PRESET_PROVIDER_ID_SET = new Set([PROVIDER_IDS.zai, PROVIDER_IDS.bigmodel, PROVIDER_IDS.zapi]);
const CATALOG_SOURCE_ID = `china-llm-zcode-dev`;
const MODEL_LOOKUP_DEBOUNCE_MS = 300;

/** 原 KYt（js 187925）：目录供应商模型 → maxOutputTokens（id 不区分大小写） */
function lookupMaxOutputTokens(catalog: CatalogProvider[], modelId: string): number | undefined {
  const needle = modelId.trim().toLowerCase();
  if (needle)
    for (const provider of catalog) {
      const found = provider.models.find((model) => model.id.trim().toLowerCase() === needle)?.maxOutputTokens;
      if (found !== void 0) return found;
    }
}

/** 原 qYt（js 187933）：非预设三厂才可自定义 baseURL/格式 */
function isCustomizableProvider(provider: ModelProvider): boolean {
  return !PRESET_PROVIDER_ID_SET.has(provider.id);
}

/* ============================================================================
 * 8. u7 子段（原 JYt…$Yt，js 187936–188320 / jsx 151651–151854）
 * ==========================================================================*/

/** 原 JYt（js 187936）：卡头（名称内联编辑 + 状态徽章 + 启用/禁用 + 用量链接 + 删除） */
export function ProviderCardFormHeader(props: {
  provider: ModelProvider;
  providerName: string;
  editingName: boolean;
  nameValue: string;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  usageUrl?: string;
  nameEditable?: boolean;
  onNameChange: (value: string) => void;
  onNameBlur: () => void;
  onNameKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onNameCompositionEnd: () => void;
  onNameCompositionStart: () => void;
  onStartEditName: () => void;
  onEnabledChange: (enabled: boolean) => void;
  onDelete?: () => void;
  actionsVisible?: boolean;
  statusVisible?: boolean;
}): React.ReactElement {
  const {
    provider,
    providerName,
    editingName,
    nameValue,
    nameInputRef,
    usageUrl,
    nameEditable = true,
    onNameChange,
    onNameBlur,
    onNameKeyDown,
    onNameCompositionEnd,
    onNameCompositionStart,
    onStartEditName,
    onEnabledChange,
    onDelete,
    actionsVisible = true,
    statusVisible = true,
  } = props;
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const enabled = provider.enabled !== false && provider.systemDisabledReason === void 0;
  const statusLabel = intl.formatMessage({
    id: enabled ? `settings.modelProvider.enabledStatus` : `settings.modelProvider.disabledStatus`,
  });
  const toggleLabel = intl.formatMessage({
    id: enabled ? `settings.modelProvider.disableAction` : `settings.modelProvider.enableAction`,
  });
  const actionsVisibleResolved = actionsVisible && (!!usageUrl || !!onDelete);
  const statusBadgeVisible = statusVisible && !editingName;
  const toggleVisible = actionsVisible && !editingName;
  return (
    <div className={`flex items-start justify-between gap-3`}>
      <div className={`flex min-w-0 items-center gap-2`}>
        {editingName ? (
          <Input
            ref={nameInputRef}
            type={`text`}
            size={`lg`}
            className={`w-auto min-w-0 text-ui-lg font-semibold`}
            value={nameValue}
            onChange={(event) => onNameChange(event.target.value)}
            onCompositionEnd={onNameCompositionEnd}
            onCompositionStart={onNameCompositionStart}
            onBlur={onNameBlur}
            onKeyDown={onNameKeyDown}
          />
        ) : (
          <>
            <div className={`min-w-0 truncate text-ui-lg font-semibold text-foreground`}>{providerName}</div>
            {nameEditable ? (
              <Button type={`button`} variant={`ghost`} size={`icon-sm`} onClick={onStartEditName}>
                <PencilIcon className={`size-3.5`} />
              </Button>
            ) : null}
          </>
        )}
        {statusBadgeVisible ? (
          <span
            className={[
              `shrink-0 rounded-full px-2 py-0.5 text-ui-base font-medium`,
              enabled ? `bg-success text-success-foreground` : `bg-secondary text-foreground-subtle`,
            ].join(` `)}
          >
            {statusLabel}
          </span>
        ) : null}
        {toggleVisible ? (
          <Button
            type={`button`}
            variant={`outline`}
            size={`sm`}
            className={`rounded-lg px-2.5 hover:bg-hover hover:border-border-hover`}
            onClick={() => onEnabledChange(!enabled)}
          >
            {toggleLabel}
          </Button>
        ) : null}
      </div>
      {actionsVisibleResolved ? (
        <div className={`flex items-center gap-2`}>
          {usageUrl ? (
            <button
              type={`button`}
              onClick={() => platform.openExternal(usageUrl)}
              className={`text-ui-base text-primary hover:underline cursor-pointer bg-transparent border-none p-0`}
            >
              {intl.formatMessage({ id: `settings.modelProvider.viewUsage` })}
            </button>
          ) : null}
          {onDelete ? (
            <Button type={`button`} variant={`ghost`} size={`icon-sm`} onClick={onDelete}>
              <TrashIcon className={`size-3.5`} />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** 原 YYt（js 188051）：连接段（baseURL + API 格式；只读/编辑双态；预设厂隐藏格式） */
export function ProviderConnectionSection(props: {
  provider: ModelProvider;
  readOnly?: boolean;
  apiFormat: string;
  baseUrlValue: string;
  onApiFormatChange: (format: string) => void;
  onBaseUrlChange: (value: string) => void;
  onBaseUrlBlur: () => void;
}): React.ReactElement {
  const { provider, readOnly, apiFormat, baseUrlValue, onApiFormatChange, onBaseUrlChange, onBaseUrlBlur } = props;
  const { intl } = useIntlContext();
  const customizable = isCustomizableProvider(provider);
  const baseUrl = baseUrlOfProvider(provider);
  const currentFormat = apiFormatOfProvider(provider);
  return readOnly ? (
    <>
      <div>
        <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
          {intl.formatMessage({ id: `settings.modelProvider.baseUrl` })}
        </label>
        <div className={`break-all rounded-lg border border-input-border bg-input px-3 py-1.5 text-ui-base text-foreground`}>
          {baseUrl || `-`}
        </div>
      </div>
      {customizable ? (
        <div>
          <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `settings.modelProvider.apiFormat` })}
          </label>
          <div className={`rounded-lg border border-input-border bg-input px-3 py-1.5 text-ui-base text-foreground`}>
            {apiFormatOptionLabel(intl, currentFormat)}
          </div>
        </div>
      ) : null}
    </>
  ) : (
    <>
      <div>
        <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
          {intl.formatMessage({ id: `settings.modelProvider.baseUrl` })}
        </label>
        <Input
          type={`text`}
          size={`lg`}
          value={baseUrlValue}
          placeholder={intl.formatMessage({ id: `settings.modelProvider.baseUrlPlaceholder` })}
          onChange={(event) => onBaseUrlChange(event.target.value)}
          onBlur={onBaseUrlBlur}
        />
      </div>
      {customizable ? (
        <div>
          <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `settings.modelProvider.apiFormat` })}
          </label>
          <ApiFormatSelect value={apiFormat} onChange={onApiFormatChange} />
        </div>
      ) : null}
    </>
  );
}

/** 原 XYt（js 188127）：API Key 段（标签行 + 获取链接 + 输入） */
function ProviderApiKeySection(props: {
  apiKeyValue: string;
  apiKeyVisible: boolean;
  readOnly?: boolean;
  presetApiKeyUrl?: string | null;
  onOpenPresetApiKey?: () => void;
  onApiKeyChange: (value: string) => void;
  onApiKeyBlur: () => void;
  onToggleApiKeyVisibility: () => void;
}): React.ReactElement {
  const { apiKeyValue, apiKeyVisible, readOnly, presetApiKeyUrl, onOpenPresetApiKey, onApiKeyChange, onApiKeyBlur, onToggleApiKeyVisibility } = props;
  const { intl } = useIntlContext();
  return (
    <div>
      <div className={`mb-1 flex items-center justify-between gap-2`}>
        <label className={`block text-ui-base text-foreground-subtle`}>
          {intl.formatMessage({ id: `settings.modelProvider.apiKey` })}
        </label>
        {presetApiKeyUrl && onOpenPresetApiKey ? <GetApiKeyLink apiKey={apiKeyValue} onOpenApiKey={onOpenPresetApiKey} /> : null}
      </div>
      <ApiKeyInput
        value={apiKeyValue}
        visible={apiKeyVisible}
        readOnly={readOnly}
        onChange={onApiKeyChange}
        onBlur={onApiKeyBlur}
        onToggleVisibility={onToggleApiKeyVisibility}
      />
    </div>
  );
}

/** 原 ZYt（js 188161）：API Key 禁用提示（info 图标 + 文案） */
function ApiKeyDisabledHint(): React.ReactElement {
  const { intl } = useIntlContext();
  return (
    <div className={`flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-ui-base text-foreground-subtle`}>
      <InfoIcon className={`mt-0.5 size-3.5 shrink-0`} aria-hidden={`true`} />
      <span>{intl.formatMessage({ id: `settings.modelProvider.apiKeyDisabledHint` })}</span>
    </div>
  );
}

/** 原 QYt（js 188173）：新模型草稿（格式回退链；缺省上下文 kee） */
function newModelDraft(currentFormat: string | null, apiFormatOptions?: string[]): ModelDraft {
  const options = apiFormatOptions && apiFormatOptions.length > 0 ? apiFormatOptions : API_FORMAT_OPTIONS;
  const kind = kindOfApiFormat(currentFormat && options.includes(currentFormat) ? currentFormat : (options[0] ?? `openai-chat-completions`));
  return modelToDraft(createModel({ id: ``, kinds: [kind], defaultKind: kind, contextWindow: DEFAULT_MODEL_CONTEXT_WINDOW }));
}

/** 原 $Yt（js 188178）：模型段（列表 + 添加对话框 + 目录 maxOutputTokens 300ms 防抖查询） */
export function ProviderModelsSection(props: {
  models: ModelMetadata[];
  apiKeyValue: string;
  currentApiFormat: string | null;
  apiFormatOptions?: string[];
  /** 原 $Yt 的 onTestModel（i）：由 u7 以草稿绑定后的 (modelId) => {results} 形态传入 */
  onTestModel?: (modelId: string) => Promise<{ results: unknown[] }>;
  onModelCommit: (index: number, model: ModelMetadata) => void;
  onDeleteModel: (index: number) => void;
  onAddModel: (model: ModelMetadata) => void;
  readOnly?: boolean;
}): React.ReactElement {
  const { models, apiKeyValue, currentApiFormat, apiFormatOptions, onModelCommit, onDeleteModel, onAddModel, readOnly } = props;
  const { intl } = useIntlContext();
  const { modelProviderService } = useServices() as unknown as { modelProviderService: ModelProviderService }; // A0-CLEANUP3 3b：modelProviderService 已具型（facet），本地 ModelProviderService 与之不重叠，双重收敛
  const preferredKind = currentApiFormat ? kindOfApiFormat(currentApiFormat) : null;
  const allowedKinds = apiFormatOptions?.map(kindOfApiFormat);
  const preferredDefaultKind = preferredKind ?? `openai-compatible`;
  const createFreshDraft = React.useCallback(() => newModelDraft(currentApiFormat, apiFormatOptions), [apiFormatOptions, currentApiFormat]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [addDraft, setAddDraft] = React.useState<ModelDraft>(() => createFreshDraft());
  const [invalidField, setInvalidField] = React.useState<string | null>(null);
  const [lookupPending, setLookupPending] = React.useState(false);
  const openAdd = React.useCallback(() => {
    setAddDraft(createFreshDraft());
    setInvalidField(null);
    setLookupPending(false);
    setAddOpen(true);
  }, [createFreshDraft]);
  const patchAddDraft = React.useCallback((patch: Partial<ModelDraft>) => {
    const idChanged = patch.idValue !== void 0;
    setAddDraft((previous) => ({ ...previous, ...patch, ...(idChanged ? { maxOutputTokensValue: `` } : {}) }));
    if (idChanged) setLookupPending(!!patch.idValue?.trim());
    setInvalidField(null);
  }, []);
  const closeAdd = React.useCallback(() => {
    setAddOpen(false);
    setAddDraft(createFreshDraft());
    setInvalidField(null);
    setLookupPending(false);
  }, [createFreshDraft]);
  const handleAddOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        closeAdd();
        return;
      }
      setAddOpen(true);
    },
    [closeAdd]
  );
  React.useEffect(() => {
    const modelId = addDraft.idValue.trim();
    if (!addOpen || !modelId) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      modelProviderService
        .getCatalogProviders(CATALOG_SOURCE_ID)
        .then((catalog) => {
          if (cancelled) return;
          const maxOutputTokens = lookupMaxOutputTokens(catalog, modelId);
          setAddDraft((previous) =>
            previous.idValue.trim() === modelId ? { ...previous, maxOutputTokensValue: maxOutputTokens === void 0 ? `` : String(maxOutputTokens) } : previous
          );
        })
        .catch(() => {
          if (!cancelled) setAddDraft((previous) => (previous.idValue.trim() === modelId ? { ...previous, maxOutputTokensValue: `` } : previous));
        })
        .finally(() => {
          if (!cancelled) setLookupPending(false);
        });
    }, MODEL_LOOKUP_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [addOpen, addDraft.idValue, modelProviderService]);
  const commitAdd = React.useCallback((): boolean => {
    if (lookupPending) return false;
    const result = validateModelDraft({
      currentModel: createModel({ id: addDraft.idValue, kinds: addDraft.kindsValue, defaultKind: preferredDefaultKind }),
      draft: addDraft,
      preferredDefaultKind,
      allowedKinds,
    });
    if (result.status === `invalid`) {
      setInvalidField(result.field);
      return false;
    }
    onAddModel(result.model);
    setAddOpen(false);
    setAddDraft(createFreshDraft());
    return true;
  }, [preferredDefaultKind, addDraft, lookupPending, allowedKinds, createFreshDraft, onAddModel]);
  const invalidMessage = invalidField ? intl.formatMessage({ id: `settings.modelProvider.modelMetadata.invalid.${invalidField}` }) : null;
  const onTestModel = props.onTestModel;
  return (
    <div>
      <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
        {intl.formatMessage({ id: `settings.modelProvider.models` })}
      </label>
      {models.length > 0 ? (
        <div className={`mt-1 rounded-lg bg-input border border-input-border divide-y divide-input-border overflow-hidden`}>
          {models.map((model, index) => {
            const testEnabled = !readOnly && !!onTestModel;
            const canTest = testEnabled && apiKeyValue.trim().length > 0;
            return (
              <ModelRow
                key={`${index}`}
                inputTestId={joinTestId(MODEL_INPUT_TESTID_PREFIX, String(index))}
                deleteTestId={joinTestId(MODEL_DELETE_TESTID_PREFIX, String(index))}
                model={model}
                autoFocus={!readOnly && model.id.trim() === ``}
                allowedKinds={allowedKinds}
                currentKind={preferredKind}
                onCommit={(next) => onModelCommit(index, next)}
                onDelete={() => onDeleteModel(index)}
                readOnly={readOnly}
                showTestButton={testEnabled}
                onTest={canTest ? onTestModel : void 0}
              />
            );
          })}
        </div>
      ) : null}
      {readOnly ? null : (
        <>
          <ModelMetadataDialog
            mode={`add`}
            open={addOpen}
            draft={addDraft}
            draftErrorMessage={invalidMessage}
            onOpenChange={handleAddOpenChange}
            onDraftChange={patchAddDraft}
            onCommit={commitAdd}
            maxOutputTokensLookupPending={lookupPending}
          />
          <Button type={`button`} variant={`secondary`} size={`lg`} data-testid={ADD_MODEL_BUTTON_TESTID} className={`mt-1`} onClick={openAdd}>
            <AstroidIcon className={`mr-1 size-3.5`} />
            {intl.formatMessage({ id: `settings.modelProvider.addModel` })}
          </Button>
        </>
      )}
    </div>
  );
}

/* ============================================================================
 * 9. u7 根与目录选择（原 eXt…SXt，js 188321–188881 / jsx 151855–152304）
 * ==========================================================================*/

/** 原 eXt（js 188321）：卸载保存模式（删除中 → 跳过） */
function cleanupSaveMode(opts: { deleteRequested: boolean }): `skip-delete` | `commit` {
  return opts.deleteRequested ? `skip-delete` : `commit`;
}

/** 原 tXt（js 188324）：thenable 判定 */
function isThenable(value: unknown): value is PromiseLike<unknown> {
  return typeof value == `object` && !!value && `then` in value && typeof (value as { then: unknown }).then == `function`;
}

/** 原 nXt（js 188327）：删除守卫（置位 → 执行 → 异步/同步复位；同步异常先复位再抛） */
function runDeleteWithGuard(opts: { deleteRequestedRef: React.MutableRefObject<boolean>; onDelete?: (() => unknown) | null }): void {
  const { deleteRequestedRef, onDelete } = opts;
  if (onDelete) {
    deleteRequestedRef.current = true;
    try {
      const result = onDelete();
      if (isThenable(result)) {
        Promise.resolve(result)
          .catch(() => void 0)
          .finally(() => {
            deleteRequestedRef.current = false;
          });
        return;
      }
    } catch (error) {
      deleteRequestedRef.current = false;
      throw error;
    }
    deleteRequestedRef.current = false;
  }
}

/** 原 rXt（js 188346）：名称输入键动作（IME 组词中 → 忽略；Enter=commit/Escape=cancel） */
function resolveNameKeyAction(event: {
  key: string;
  compositionActive: boolean;
  isComposing?: boolean;
  nativeEvent?: { isComposing?: boolean };
}): `commit` | `cancel` | null {
  if (event.compositionActive || event.isComposing || event.nativeEvent?.isComposing) return null;
  if (event.key === `Enter`) return `commit`;
  if (event.key === `Escape`) return `cancel`;
  return null;
}

/** 原 iXt（js 188355）：模型条目归一化（对象原样；字符串 → 缺省 kind 模型） */
function normalizeModelEntry(provider: ModelProvider, model: ModelMetadata | string): ModelMetadata {
  if (isFullModelEntry(model)) return model;
  const kind = defaultKindOfProvider(provider);
  return createModel({ id: model, kinds: [kind], defaultKind: kind });
}

/** 原 aXt（js 188360）：供应商模型归一化（过滤 deleted） */
function normalizeProviderModels(provider: ModelProvider): ModelMetadata[] {
  return provider.models.map((model) => normalizeModelEntry(provider, model)).filter((model) => model.deleted !== true);
}

/** 原 oXt（js 188363）：端点路径表归一化（缺省 → 单条缺省路径） */
function normalizeEndpointPaths(provider: ModelProvider): Record<string, string> {
  const paths = provider.endpoints.paths;
  if (!paths) {
    const kind = defaultKindOfProvider(provider);
    return { [kind]: normalizeEndpointPath(kind, void 0) };
  }
  return Object.fromEntries(
    Object.entries(paths).map(([kind, path]) => {
      const key = kind;
      return [key, normalizeEndpointPath(key, path)];
    })
  );
}

export interface ProviderConfigCardFormProps {
  provider: ModelProvider;
  onSave: (provider: ModelProvider) => void;
  onDelete?: (provider: ModelProvider) => void;
  onTestModel?: (provider: ModelProvider, model: string) => Promise<{ results: unknown[] }>;
  readOnlyEndpoints?: boolean;
  presetApiKeyUrl?: string | null;
  onOpenPresetApiKey?: () => void;
  usageUrl?: string;
  hideApiKeySection?: boolean;
  hideConnectionSection?: boolean;
  startPlanMode?: boolean;
  readOnlyApiKey?: boolean;
  statusSection?: React.ReactNode;
  nameEditable?: boolean;
  headerVisible?: boolean;
  headerActionsVisible?: boolean;
  modelsReadOnly?: boolean;
  apiKeyDisabledHintVisible?: boolean;
}

/** 原 u7（js 188376）：供应商配置卡表单根 —— 草稿引用 + 失焦/切换提交 + 卸载清理保存 + 删除守卫 */
export function ProviderConfigCardForm(props: ProviderConfigCardFormProps): React.ReactElement {
  const {
    provider,
    onSave,
    onDelete,
    onTestModel,
    readOnlyEndpoints,
    presetApiKeyUrl,
    onOpenPresetApiKey,
    usageUrl,
    hideApiKeySection,
    hideConnectionSection,
    startPlanMode,
    readOnlyApiKey,
    statusSection,
    nameEditable,
    headerVisible = true,
    headerActionsVisible,
    modelsReadOnly,
    apiKeyDisabledHintVisible,
  } = props;
  const { intl } = useIntlContext();
  const [editingName, setEditingName] = React.useState(false);
  const [nameValue, setNameValue] = React.useState(provider.name);
  const [apiFormat, setApiFormat] = React.useState(apiFormatOfProvider(provider));
  const [baseUrlValue, setBaseUrlValue] = React.useState(baseUrlOfProvider(provider));
  const [apiKeyValue, setApiKeyValue] = React.useState(provider.apiKey);
  const [apiKeyVisible, setApiKeyVisible] = React.useState(false);
  const [models, setModels] = React.useState<ModelMetadata[]>(() => normalizeProviderModels(provider));
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const composingRef = React.useRef(false);
  const deleteRequestedRef = React.useRef(false);
  const internalSaveRef = React.useRef(false);
  const draftRef = React.useRef<ProviderFormDraft>({
    nameValue: provider.name,
    apiFormat: apiFormatOfProvider(provider),
    baseUrlValue: baseUrlOfProvider(provider),
    endpointPathsValue: normalizeEndpointPaths(provider),
    apiKeyValue: provider.apiKey,
  });
  /* provider 切换 → 全量重置草稿 */
  React.useEffect(() => {
    const nextFormat = apiFormatOfProvider(provider);
    const nextBaseUrl = baseUrlOfProvider(provider);
    const nextPaths = normalizeEndpointPaths(provider);
    setNameValue(provider.name);
    setApiFormat(nextFormat);
    setBaseUrlValue(nextBaseUrl);
    setApiKeyValue(provider.apiKey);
    setModels(normalizeProviderModels(provider));
    draftRef.current = {
      nameValue: provider.name,
      apiFormat: nextFormat,
      baseUrlValue: nextBaseUrl,
      endpointPathsValue: nextPaths,
      apiKeyValue: provider.apiKey,
    };
  }, [provider]);
  const mergeProviderPatch = React.useCallback(
    (patch: Partial<ModelProvider>): ModelProvider => ({
      ...(provider.headers === void 0 ? provider : { ...provider, headers: void 0 }),
      ...patch,
      updatedAt: Date.now(),
    }),
    [provider]
  );
  const saveInternally = React.useCallback(
    (next: ModelProvider) => {
      internalSaveRef.current = true;
      try {
        onSave(next);
      } catch (error) {
        internalSaveRef.current = false;
        throw error;
      }
      queueMicrotask(() => {
        internalSaveRef.current = false;
      });
    },
    [onSave]
  );
  const saveUncommittedDraft = React.useCallback(
    (reason: string) => {
      const diff = providerDraftDiff({ provider, draft: draftRef.current, readOnlyEndpoints, now: Date.now });
      if (diff) {
        logger.info(`[ModelProviderSection] 切换前保存未提交的供应商草稿`, {
          providerId: provider.id,
          reason,
        });
        onSave(diff);
      }
    },
    [provider, readOnlyEndpoints, onSave]
  );
  /* 卸载清理：删除中/内部保存刷新 → 跳过；否则提交未保存草稿 */
  React.useEffect(
    () => () => {
      if (cleanupSaveMode({ deleteRequested: deleteRequestedRef.current }) === `skip-delete`) {
        logger.info(`[ModelProviderSection] 删除中的供应商跳过 cleanup 草稿保存`, { providerId: provider.id });
        return;
      }
      if (internalSaveRef.current) {
        internalSaveRef.current = false;
        logger.info(`[ModelProviderSection] 内部保存触发的刷新跳过 cleanup 草稿保存`, {
          providerId: provider.id,
        });
        return;
      }
      saveUncommittedDraft(`cleanup`);
    },
    [saveUncommittedDraft, provider.id]
  );
  const handleNameChange = React.useCallback((value: string) => {
    draftRef.current.nameValue = value;
    setNameValue(value);
  }, []);
  const handleBaseUrlChange = React.useCallback((value: string) => {
    draftRef.current.baseUrlValue = value;
    setBaseUrlValue(value);
  }, []);
  const handleApiKeyChange = React.useCallback((value: string) => {
    draftRef.current.apiKeyValue = value;
    setApiKeyValue(value);
  }, []);
  const handleNameBlur = React.useCallback(() => {
    setEditingName(false);
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== provider.name) {
      saveInternally(mergeProviderPatch({ name: trimmed }));
    } else {
      draftRef.current.nameValue = provider.name;
      setNameValue(provider.name);
    }
  }, [nameValue, provider.name, saveInternally, mergeProviderPatch]);
  const handleNameKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const action = resolveNameKeyAction({ key: event.key, compositionActive: composingRef.current, nativeEvent: event.nativeEvent });
      if (action === `commit`) {
        (event.target as HTMLInputElement).blur();
      } else if (action === `cancel`) {
        handleNameChange(provider.name);
        setEditingName(false);
      }
    },
    [provider.name, handleNameChange]
  );
  const startEditName = React.useCallback(() => {
    setEditingName(true);
    requestAnimationFrame(() => nameInputRef.current?.focus());
  }, []);
  const handleBaseUrlBlur = React.useCallback(() => {
    const diff = providerDraftDiff({ provider, draft: draftRef.current, readOnlyEndpoints, now: Date.now });
    if (diff) saveInternally(diff);
  }, [provider, readOnlyEndpoints, saveInternally]);
  const handleApiFormatChange = React.useCallback(
    (format: string) => {
      draftRef.current.apiFormat = format;
      setApiFormat(format);
      const diff = providerDraftDiff({ provider, draft: draftRef.current, readOnlyEndpoints, now: Date.now });
      if (diff) saveInternally(diff);
    },
    [provider, readOnlyEndpoints, saveInternally]
  );
  const handleApiKeyBlur = React.useCallback(() => {
    if (apiKeyValue !== provider.apiKey) saveInternally(mergeProviderPatch({ apiKey: apiKeyValue }));
  }, [apiKeyValue, provider.apiKey, saveInternally, mergeProviderPatch]);
  const handleTestModel = React.useCallback(
    (modelId: string) =>
      onTestModel
        ? onTestModel(providerDraftOrSelf({ provider, draft: draftRef.current, readOnlyEndpoints, now: Date.now }), modelId)
        : Promise.resolve({ results: [] }),
    [onTestModel, provider, readOnlyEndpoints]
  );
  const handleEnabledChange = React.useCallback(
    (enabled: boolean) => {
      saveInternally(mergeProviderPatch({ enabled, systemDisabledReason: void 0 }));
    },
    [saveInternally, mergeProviderPatch]
  );
  const commitModels = React.useCallback(
    (nextModels: ModelMetadata[]) => {
      const seen = new Set<string>();
      const normalized = nextModels.flatMap((model) => {
        const id = model.id.trim();
        if (!id || seen.has(id)) return [];
        seen.add(id);
        return [{ ...model, id, name: model.name?.trim() || void 0 }];
      });
      setModels(normalized.filter((model) => model.deleted !== true));
      saveInternally(mergeProviderPatch({ models: normalized }));
    },
    [saveInternally, mergeProviderPatch]
  );
  const handleModelCommit = React.useCallback(
    (index: number, model: ModelMetadata) => {
      const modelId = model.id.trim();
      const next = [...models];
      if (modelId) {
        next[index] = { ...model, id: modelId, modified: true };
      } else {
        next.splice(index, 1);
      }
      if (JSON.stringify(next) !== JSON.stringify(models)) commitModels(next);
    },
    [models, commitModels]
  );
  const handleDeleteModel = React.useCallback(
    (index: number) => {
      const next = [...models];
      const target = next[index];
      if (target) {
        next[index] = { ...target, modified: true, deleted: true };
        commitModels(next);
      }
    },
    [models, commitModels]
  );
  const handleAddModel = React.useCallback(
    (model: ModelMetadata) => {
      commitModels([...models, { ...model, modified: true }]);
    },
    [models, commitModels]
  );
  const handleDelete = React.useCallback(() => {
    /* 原实现：nXt 内部以零参调用 onDelete（provider 运行时为 undefined），逐字保留该调用面 */
    runDeleteWithGuard({ deleteRequestedRef, onDelete: onDelete as (() => unknown) | undefined });
  }, [onDelete]);
  const displayName = startPlanMode
    ? intl.formatMessage({ id: `settings.modelProvider.startPlan.title` }, { provider: providerDisplayName(provider).split(` - `)[0] ?? providerDisplayName(provider) })
    : providerDisplayName(provider);
  return (
    <div className={`space-y-3`}>
      {headerVisible && statusSection === void 0 ? (
        <ProviderCardFormHeader
          provider={provider}
          providerName={displayName}
          editingName={editingName}
          nameValue={nameValue}
          nameInputRef={nameInputRef}
          usageUrl={usageUrl}
          nameEditable={nameEditable}
          onNameChange={handleNameChange}
          onNameBlur={handleNameBlur}
          onNameKeyDown={handleNameKeyDown}
          onNameCompositionStart={() => {
            composingRef.current = true;
          }}
          onNameCompositionEnd={() => {
            composingRef.current = false;
          }}
          onStartEditName={startEditName}
          onEnabledChange={handleEnabledChange}
          onDelete={onDelete ? handleDelete : void 0}
          actionsVisible={headerActionsVisible}
        />
      ) : null}
      {statusSection}
      {apiKeyDisabledHintVisible ? <ApiKeyDisabledHint /> : null}
      <div className={`space-y-3`}>
        {hideConnectionSection || startPlanMode ? null : (
          <ProviderConnectionSection
            provider={provider}
            readOnly={readOnlyEndpoints}
            apiFormat={apiFormat}
            baseUrlValue={baseUrlValue}
            onApiFormatChange={handleApiFormatChange}
            onBaseUrlChange={handleBaseUrlChange}
            onBaseUrlBlur={handleBaseUrlBlur}
          />
        )}
        {hideApiKeySection || startPlanMode ? null : (
          <ProviderApiKeySection
            apiKeyValue={apiKeyValue}
            apiKeyVisible={apiKeyVisible}
            readOnly={readOnlyApiKey}
            presetApiKeyUrl={presetApiKeyUrl}
            onOpenPresetApiKey={onOpenPresetApiKey}
            onApiKeyChange={handleApiKeyChange}
            onApiKeyBlur={handleApiKeyBlur}
            onToggleApiKeyVisibility={() => setApiKeyVisible((previous) => !previous)}
          />
        )}
        <ProviderModelsSection
          models={models}
          apiKeyValue={apiKeyValue}
          currentApiFormat={apiFormat}
          apiFormatOptions={apiFormatOptionsOfProvider(provider)}
          onTestModel={onTestModel ? handleTestModel : void 0}
          onModelCommit={handleModelCommit}
          onDeleteModel={handleDeleteModel}
          onAddModel={handleAddModel}
          readOnly={modelsReadOnly}
        />
      </div>
    </div>
  );
}

/** 原 sXt（js 188652）：目录供应商图标（radio-tower 圆角方块） */
function CatalogProviderIcon(): React.ReactElement {
  return (
    <span className={`flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground-subtle`}>
      <RadioTowerIcon className={`size-3.5`} />
    </span>
  );
}

/** 原 cXt（js 188658）：目录供应商选择（Popover + cmdk 搜索；`--radix-popover-trigger-width`） */
function CatalogProviderSelect(props: {
  catalog: CatalogProvider[];
  loading: boolean;
  selectedProvider: CatalogProvider | undefined;
  selectedProviderId: string;
  triggerId: string;
  onSelectProvider: (providerId: string) => void;
}): React.ReactElement {
  const { catalog, loading, selectedProvider, selectedProviderId, triggerId, onSelectProvider } = props;
  const { intl } = useIntlContext();
  const [open, setOpen] = React.useState(false);
  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={triggerId} type={`button`} variant={`outline`} className={`h-auto min-h-9 w-full justify-between gap-3 px-3 py-2 text-left`}>
          {selectedProvider ? (
            <span className={`flex min-w-0 items-center gap-2`}>
              <CatalogProviderIcon />
              <span className={`min-w-0`}>
                <span className={`block truncate text-ui-base font-medium text-foreground`}>{selectedProvider.name}</span>
                <span className={`block truncate font-mono text-ui-base text-foreground-subtle`}>{selectedProvider.endpoints.baseURL}</span>
              </span>
            </span>
          ) : (
            <span className={`text-ui-base text-foreground-subtle`}>
              {loading ? intl.formatMessage({ id: `common.loading` }) : intl.formatMessage({ id: `settings.modelProvider.catalogProviderSelect` })}
            </span>
          )}
          <ChevronDownIcon className={`size-4 shrink-0 text-foreground-subtle`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={`start`} className={`w-(--radix-popover-trigger-width) p-0`}>
        <CommandRoot>
          <CommandInput
            inputGroupClassName={`h-9 rounded-xl`}
            placeholder={intl.formatMessage({ id: `settings.modelProvider.catalogProviderSearch` })}
          />
          <CommandList className={`max-h-72`}>
            <CommandEmpty>
              {loading ? intl.formatMessage({ id: `common.loading` }) : intl.formatMessage({ id: `settings.modelProvider.catalogProviderEmpty` })}
            </CommandEmpty>
            {catalog.map((entry) => (
              <CommandItem
                key={entry.id}
                data-checked={entry.id === selectedProviderId}
                value={`${entry.name} ${entry.id} ${entry.endpoints.baseURL}`}
                onSelect={() => {
                  onSelectProvider(entry.id);
                  setOpen(false);
                }}
              >
                <CatalogProviderIcon />
                <span className={`min-w-0 flex-1`}>
                  <span className={`block truncate text-ui-base font-medium text-foreground`}>{entry.name}</span>
                  <span className={`block truncate font-mono text-ui-base text-foreground-subtle`}>{entry.endpoints.baseURL}</span>
                </span>
                <span className={`shrink-0 pr-5 text-ui-base text-foreground-subtle`}>{entry.models.length}</span>
              </CommandItem>
            ))}
          </CommandList>
        </CommandRoot>
      </PopoverContent>
    </PopoverRoot>
  );
}

/** 原 lXt（js 188768）：空自定义供应商骨架 */
function newCustomProvider(name: string): ModelProvider {
  const now = Date.now();
  return {
    id: newProviderId(),
    name,
    apiFormat: `anthropic-messages`,
    source: `custom`,
    endpoints: { anthropic: ``, openai: ``, gemini: `` },
    apiKey: ``,
    models: [],
    createdAt: now,
    updatedAt: now,
  };
}
declare function newProviderId(): string; // Knt（src chunk id 工厂）

/** 原 uXt/dXt…gXt（js 188782–188788）：目录源 id 与表单控件 id 常量 */
const CUSTOM_CATALOG_SOURCE_ID = `china-llm-zcode-dev`;
const ADD_CATALOG_PROVIDER_CONTROL_ID = `model-provider-add-catalog-provider`;
const ADD_CATALOG_API_KEY_CONTROL_ID = `model-provider-add-catalog-api-key`;
const ADD_CUSTOM_NAME_CONTROL_ID = `model-provider-add-custom-name`;
const ADD_CUSTOM_BASE_URL_CONTROL_ID = `model-provider-add-custom-base-url`;
const ADD_CUSTOM_API_KEY_CONTROL_ID = `model-provider-add-custom-api-key`;
const ADD_CUSTOM_API_FORMAT_CONTROL_ID = `model-provider-add-custom-api-format`;

export interface AddProviderDraft {
  mode: "custom" | "catalog";
  selectedProviderId: string;
  apiKey: string;
  customName: string;
  customBaseURL: string;
  customModels: ModelMetadata[];
  customApiFormats: string[];
  customEndpointPaths: Record<string, string>;
}

/** 原 d7（js 188789）：添加供应商草稿缺省 */
function newAddProviderDraft(): AddProviderDraft {
  return {
    mode: `custom`,
    selectedProviderId: ``,
    apiKey: ``,
    customName: ``,
    customBaseURL: ``,
    customModels: [],
    customApiFormats: [`anthropic-messages`],
    customEndpointPaths: {},
  };
}

/** 原 f7（js 188801）：添加表单字段标签 */
function AddFormFieldLabel(props: { children: React.ReactNode; htmlFor?: string }): React.ReactElement {
  return (
    <label className={`mb-1 block text-ui-base font-medium text-foreground-subtle`} htmlFor={props.htmlFor}>
      {props.children}
    </label>
  );
}

/** 原 _Xt（js 188808）：目录供应商缺省 kind（defaultKind → 首模型 → openai-compatible） */
function defaultKindOfCatalogProvider(provider: CatalogProvider): string {
  return provider.defaultKind ?? provider.models[0]?.defaultKind ?? provider.models[0]?.kinds[0] ?? `openai-compatible`;
}

/** 原 vXt（js 188811）：baseURL 与路径拼接（`/` 边界去重/补齐） */
function joinBaseUrlAndPath(baseUrl: string, path: string | undefined): string {
  const base = baseUrl.trim();
  const suffix = path?.trim() ?? ``;
  if (!suffix) return base;
  if (!base) return suffix;
  if (base.endsWith(`/`) && suffix.startsWith(`/`)) return `${base.slice(0, -1)}${suffix}`;
  if (!base.endsWith(`/`) && !suffix.startsWith(`/`)) return `${base}/${suffix}`;
  return `${base}${suffix}`;
}

/** 原 p7（js 188824）：目录端点 URL（paths[kind] 缺失 → 空串） */
function catalogEndpointUrlOf(provider: CatalogProvider, kind: string): string {
  const path = provider.endpoints.paths?.[kind];
  return path === void 0 ? `` : joinBaseUrlAndPath(provider.endpoints.baseURL, path);
}

/** 原 yXt（js 188828）：目录条目 → 自定义供应商（id=`源:条目`；openai 双 kind 回退） */
function catalogProviderToCustom(entry: CatalogProvider, apiKey: string): ModelProvider {
  const base = newCustomProvider(entry.name);
  const kind = defaultKindOfCatalogProvider(entry);
  return {
    ...base,
    apiFormat: apiFormatOfKind(kind),
    apiKey,
    apiKeyRequired: apiKey.trim().length > 0,
    catalogProviderId: entry.id,
    catalogSourceId: CUSTOM_CATALOG_SOURCE_ID,
    defaultKind: kind,
    endpoints: {
      anthropic: catalogEndpointUrlOf(entry, `anthropic`),
      baseURL: entry.endpoints.baseURL,
      gemini: ``,
      openai: catalogEndpointUrlOf(entry, `openai-compatible`) || catalogEndpointUrlOf(entry, `openai`),
      paths: entry.endpoints.paths,
    },
    id: `${CUSTOM_CATALOG_SOURCE_ID}:${entry.id}`,
    models: entry.models.map((model) => ({ ...model })),
    source: `custom`,
  };
}

/** 原 bXt（js 188851）：格式集 → 主格式（首个已知，缺省 anthropic-messages） */
function primaryFormatOf(formats: string[]): string[] {
  const known = new Set(formats);
  return [API_FORMAT_OPTIONS.find((format) => known.has(format)) ?? `anthropic-messages`];
}

/** 原 m7（js 188855）：模型去重（按 id；trim；空名 → undefined） */
function dedupeModelsById(models: ModelMetadata[] | undefined): ModelMetadata[] {
  const seen = new Set<string>();
  return (models ?? []).flatMap((model) => {
    const id = model.id.trim();
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [{ ...model, id, name: model.name?.trim() || void 0 }];
  });
}

/** 原 xXt（js 188862）：模型表重定向到单一格式 kind */
function retargetModelsToFormat(models: ModelMetadata[], format: string): ModelMetadata[] {
  const kind = kindOfApiFormat(format);
  return models.map((model) => ({ ...model, kinds: [kind], defaultKind: kind }));
}

/** 原 SXt（js 188866）：自定义草稿 → 供应商 */
function customDraftToProvider(draft: { name: string; baseURL: string; apiKey: string; apiFormats: string[]; models: ModelMetadata[] }): ModelProvider {
  const base = newCustomProvider(draft.name);
  const formats = primaryFormatOf(draft.apiFormats);
  const primaryFormat = formats[0] ?? `anthropic-messages`;
  const kind = kindOfApiFormat(primaryFormat);
  return {
    ...base,
    apiFormat: primaryFormat,
    apiKey: draft.apiKey,
    apiKeyRequired: draft.apiKey.trim().length > 0,
    defaultKind: kind,
    endpoints: endpointsOfFormats(base, formats, draft.baseURL),
    models: dedupeModelsById(draft.models),
    source: `custom`,
  };
}

/* ============================================================================
 * 10. CXt 与状态行件（原 CXt/wXt/TXt，js 188882–189189 / jsx 152305–152528）
 * ==========================================================================*/

/** 原 CXt 的 g（js 188898 区）：添加模式（3.7.6 恒 `custom`；catalog 分支为保留的死代码） */
function resolveAddProviderMode(): `custom` | `catalog` {
  return `custom`;
}

/** 原 CXt（js 188882）：新建供应商表单（3.7.6 恒 custom 路；catalog 分支保留） */
export function AddCustomProviderDraftForm(props: {
  draft?: AddProviderDraft | null;
  onDraftChange?: React.Dispatch<React.SetStateAction<AddProviderDraft>>;
  onCreateProvider: (provider: ModelProvider) => Promise<void> | void;
}): React.ReactElement {
  const { draft: externalDraft, onDraftChange, onCreateProvider } = props;
  const { intl } = useIntlContext();
  const { modelProviderService } = useServices() as unknown as { modelProviderService: ModelProviderService }; // A0-CLEANUP3 3b：modelProviderService 已具型（facet），本地 ModelProviderService 与之不重叠，双重收敛
  const [localDraft, setLocalDraft] = React.useState<AddProviderDraft>(newAddProviderDraft);
  const [catalog, setCatalog] = React.useState<CatalogProvider[]>([]);
  const [catalogLoading, setCatalogLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const draft = externalDraft ?? localDraft;
  const setDraft = onDraftChange ?? setLocalDraft;
  const patchDraft = React.useCallback(
    (patch: Partial<AddProviderDraft>) => {
      setDraft((previous) => ({ ...previous, ...patch }));
    },
    [setDraft]
  );
  const mode = resolveAddProviderMode();
  React.useEffect(() => {}, [modelProviderService, setDraft]);
  const selectedCatalogProvider = catalog.find((entry) => entry.id === draft.selectedProviderId);
  const createProvider = React.useCallback(async () => {
    setCreating(true);
    try {
      if (mode === `catalog`) {
        if (!selectedCatalogProvider) return;
        await onCreateProvider(catalogProviderToCustom(selectedCatalogProvider, draft.apiKey));
        return;
      }
      await onCreateProvider(
        customDraftToProvider({
          apiFormats: draft.customApiFormats,
          apiKey: draft.apiKey,
          baseURL: draft.customBaseURL,
          models: draft.customModels,
          name: draft.customName.trim() || intl.formatMessage({ id: `settings.modelProvider.newProviderName` }),
        })
      );
    } catch (error) {
      logger.error(`[ModelProviderSection] 新建模型供应商失败`, error);
    } finally {
      setCreating(false);
    }
  }, [draft.apiKey, draft.customApiFormats, draft.customBaseURL, draft.customModels, draft.customName, mode, intl, onCreateProvider, selectedCatalogProvider]);
  const createDisabled =
    creating ||
    (mode === `catalog`
      ? !selectedCatalogProvider
      : draft.customBaseURL.trim().length === 0 || dedupeModelsById(draft.customModels).length === 0);
  const primaryFormat = primaryFormatOf(draft.customApiFormats)[0] ?? `anthropic-messages`;
  const handleFormatChange = React.useCallback(
    (format: string) => {
      setDraft((previous) => ({
        ...previous,
        customApiFormats: [format],
        customEndpointPaths: {},
        customModels: retargetModelsToFormat(previous.customModels, format),
      }));
    },
    [setDraft]
  );
  const syncCustomModels = React.useCallback(
    (nextModels: ModelMetadata[]) => {
      patchDraft({ customModels: dedupeModelsById(nextModels) });
    },
    [patchDraft]
  );
  const handleModelCommit = React.useCallback(
    (index: number, model: ModelMetadata) => {
      const next = [...draft.customModels];
      if (model.id.trim()) {
        next[index] = model;
      } else {
        next.splice(index, 1);
      }
      syncCustomModels(next);
    },
    [draft.customModels, syncCustomModels]
  );
  const handleDeleteModel = React.useCallback(
    (index: number) => {
      const next = [...draft.customModels];
      next.splice(index, 1);
      syncCustomModels(next);
    },
    [draft.customModels, syncCustomModels]
  );
  const handleAddModel = React.useCallback(
    (model: ModelMetadata) => {
      syncCustomModels([...draft.customModels, model]);
    },
    [draft.customModels, syncCustomModels]
  );
  void catalogLoading;
  void setCatalogLoading;
  return (
    <div className={`space-y-4`}>
      <div>
        <div className={`text-ui-lg font-semibold text-foreground`}>
          {intl.formatMessage({ id: `settings.modelProvider.addProviderTitle` })}
        </div>
        <p className={`mt-1 text-ui-base text-foreground-subtle`}>
          {intl.formatMessage({ id: `settings.modelProvider.addProviderDescription` })}
        </p>
      </div>
      {null}
      {mode === `catalog` ? (
        <div className={`space-y-3`}>
          <div>
            <AddFormFieldLabel htmlFor={ADD_CATALOG_PROVIDER_CONTROL_ID}>
              {intl.formatMessage({ id: `settings.modelProvider.catalogProviderSelect` })}
            </AddFormFieldLabel>
            <CatalogProviderSelect
              catalog={catalog}
              loading={catalogLoading}
              selectedProvider={selectedCatalogProvider}
              selectedProviderId={draft.selectedProviderId}
              triggerId={ADD_CATALOG_PROVIDER_CONTROL_ID}
              onSelectProvider={(providerId) => patchDraft({ selectedProviderId: providerId })}
            />
          </div>
          <div>
            <AddFormFieldLabel htmlFor={ADD_CATALOG_API_KEY_CONTROL_ID}>
              {intl.formatMessage({ id: `settings.modelProvider.apiKey` })}
            </AddFormFieldLabel>
            <Input
              id={ADD_CATALOG_API_KEY_CONTROL_ID}
              type={`password`}
              size={`lg`}
              value={draft.apiKey}
              placeholder={intl.formatMessage({ id: `settings.modelProvider.apiKeyPlaceholder` })}
              onChange={(event) => patchDraft({ apiKey: event.target.value })}
            />
          </div>
        </div>
      ) : (
        <div className={`space-y-3`}>
          <div>
            <AddFormFieldLabel htmlFor={ADD_CUSTOM_NAME_CONTROL_ID}>
              {intl.formatMessage({ id: `settings.modelProvider.name` })}
            </AddFormFieldLabel>
            <Input
              id={ADD_CUSTOM_NAME_CONTROL_ID}
              type={`text`}
              size={`lg`}
              value={draft.customName}
              placeholder={intl.formatMessage({ id: `settings.modelProvider.namePlaceholder` })}
              onChange={(event) => patchDraft({ customName: event.target.value })}
            />
          </div>
          <div>
            <AddFormFieldLabel htmlFor={ADD_CUSTOM_BASE_URL_CONTROL_ID}>
              {intl.formatMessage({ id: `settings.modelProvider.baseUrl` })}
            </AddFormFieldLabel>
            <Input
              id={ADD_CUSTOM_BASE_URL_CONTROL_ID}
              type={`text`}
              size={`lg`}
              value={draft.customBaseURL}
              placeholder={intl.formatMessage({ id: `settings.modelProvider.baseUrlPlaceholder` })}
              onChange={(event) => patchDraft({ customBaseURL: event.target.value })}
            />
          </div>
          <div>
            <AddFormFieldLabel htmlFor={ADD_CUSTOM_API_KEY_CONTROL_ID}>
              {intl.formatMessage({ id: `settings.modelProvider.apiKey` })}
            </AddFormFieldLabel>
            <Input
              id={ADD_CUSTOM_API_KEY_CONTROL_ID}
              type={`password`}
              size={`lg`}
              value={draft.apiKey}
              placeholder={intl.formatMessage({ id: `settings.modelProvider.apiKeyPlaceholder` })}
              onChange={(event) => patchDraft({ apiKey: event.target.value })}
            />
          </div>
          <div>
            <AddFormFieldLabel htmlFor={ADD_CUSTOM_API_FORMAT_CONTROL_ID}>
              {intl.formatMessage({ id: `settings.modelProvider.apiFormat` })}
            </AddFormFieldLabel>
            <ApiFormatSelect apiFormatOptions={API_FORMAT_OPTIONS} triggerId={ADD_CUSTOM_API_FORMAT_CONTROL_ID} value={primaryFormat} onChange={handleFormatChange} />
          </div>
          <ProviderModelsSection
            models={draft.customModels}
            apiKeyValue={draft.apiKey}
            currentApiFormat={primaryFormat}
            apiFormatOptions={[primaryFormat]}
            onModelCommit={handleModelCommit}
            onDeleteModel={handleDeleteModel}
            onAddModel={handleAddModel}
          />
        </div>
      )}
      <Button
        type={`button`}
        size={`lg`}
        disabled={createDisabled}
        onClick={() => {
          createProvider();
        }}
      >
        {intl.formatMessage({ id: `settings.modelProvider.addProviderAction` })}
      </Button>
    </div>
  );
}

/** 原 wXt（js 189113）：计划状态行（状态/续期/到期 · 管理 · 解绑；`·` 分隔） */
export function PlanStatusRow(props: {
  renewTime?: string;
  expireTime?: string;
  extraAction?: React.ReactNode;
  statusLabel?: React.ReactNode;
  manageLabel?: string | null;
  unlinkLabel?: string | null;
  unlinkLoading?: boolean;
  onManage?: (() => void) | null;
  onUnlink?: (() => void) | null;
}): React.ReactElement {
  const { renewTime, expireTime, extraAction, statusLabel, manageLabel, unlinkLabel, unlinkLoading, onManage, onUnlink } = props;
  const { intl, locale } = useIntlContext();
  const renewOrExpire = resolveRenewOrExpire({ renewTime, expireTime });
  const renewOrExpireLabel = renewOrExpire
    ? intl.formatMessage(
        {
          id:
            renewOrExpire.kind === `renew`
              ? `settings.modelProvider.codingPlan.renewsAt`
              : `settings.modelProvider.codingPlan.expiresAt`,
        },
        { date: formatUtcShortDate(renewOrExpire.value, locale) }
      )
    : null;
  const resolvedStatusLabel =
    statusLabel ??
    (statusLabel || renewOrExpireLabel || extraAction || (manageLabel && onManage) || (unlinkLabel && onUnlink)
      ? null
      : intl.formatMessage({ id: `settings.modelProvider.codingPlan.status.purchased` }));
  return (
    <span className={`flex flex-wrap items-center gap-1.5 text-ui-base text-foreground-subtle`}>
      {resolvedStatusLabel ? <span>{resolvedStatusLabel}</span> : null}
      {renewOrExpireLabel ? <span>{renewOrExpireLabel}</span> : null}
      <StatusDotSeparator visible={!!(renewOrExpireLabel && extraAction)} />
      {extraAction}
      <StatusDotSeparator visible={!!((renewOrExpireLabel || extraAction) && manageLabel)} />
      {manageLabel && onManage ? <StatusActionButton label={manageLabel} onClick={onManage} /> : null}
      <StatusDotSeparator visible={!!((renewOrExpireLabel || extraAction || manageLabel || resolvedStatusLabel) && unlinkLabel)} />
      {unlinkLabel && onUnlink ? <StatusActionButton label={unlinkLabel} loading={unlinkLoading} onClick={onUnlink} /> : null}
    </span>
  );
}

/** 原 TXt（js 189156）：Start Plan 状态行（到期 · 附加动作 · 管理 · 解绑） */
export function StartPlanStatusRow(props: {
  expireTime?: string;
  extraAction?: React.ReactNode;
  manageLabel?: string | null;
  unlinkLabel?: string | null;
  unlinkLoading?: boolean;
  onManage?: (() => void) | null;
  onUnlink?: (() => void) | null;
}): React.ReactElement {
  const { expireTime, extraAction, manageLabel, unlinkLabel, unlinkLoading, onManage, onUnlink } = props;
  const { intl, locale } = useIntlContext();
  const trimmedExpire = expireTime?.trim();
  const expireLabel = trimmedExpire
    ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.expiresAt` }, { date: formatLocalShortDate(trimmedExpire, locale) })
    : null;
  return (
    <span className={`flex flex-wrap items-center gap-1.5 text-ui-base text-foreground-subtle`}>
      {expireLabel ? (
        <>
          <span className={`whitespace-nowrap`}>{expireLabel}</span>
        </>
      ) : null}
      <StatusDotSeparator visible={!!(expireLabel && extraAction)} />
      {extraAction}
      <StatusDotSeparator visible={!!((expireLabel || extraAction) && manageLabel)} />
      {manageLabel && onManage ? <StatusActionButton label={manageLabel} onClick={onManage} /> : null}
      <StatusDotSeparator visible={!!((expireLabel || extraAction || manageLabel) && unlinkLabel)} />
      {unlinkLabel && onUnlink ? <StatusActionButton label={unlinkLabel} loading={unlinkLoading} onClick={onUnlink} /> : null}
    </span>
  );
}

/* ============================================================================
 * 11. Coding Plan 状态/配额展示簇（原 h7…tZt/_7，js 189190–189649 / jsx 152529–152856）
 * ==========================================================================*/

/** 原 h7（js 189190）：`·` 分隔点（隐藏时占位 null） */
export function StatusDotSeparator(props: { visible: boolean }): React.ReactElement | null {
  return props.visible ? <span aria-hidden={`true`}>{`·`}</span> : null;
}

/** 原 g7（js 189193）：状态动作按钮（品牌色 + 悬停下划线；加载禁用） */
export function StatusActionButton(props: { label: string; loading?: boolean; onClick: () => void }): React.ReactElement {
  return (
    <button
      type={`button`}
      className={`text-ui-base font-medium text-brand underline-offset-2 hover:text-brand/80 hover:underline disabled:pointer-events-none disabled:opacity-50`}
      disabled={props.loading}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );
}

/** 原 EXt（js 189199）：续期优先，其次到期 */
function resolveRenewOrExpire(opts: { renewTime?: string; expireTime?: string }): { kind: `renew` | `expire`; value: string } | null {
  const renew = opts.renewTime?.trim();
  if (renew) return { kind: `renew`, value: renew };
  const expire = opts.expireTime?.trim();
  return expire ? { kind: `expire`, value: expire } : null;
}

/** 原 DXt（js 189205）：UTC 短日期（同年省年；非法 → 原样） */
function formatUtcShortDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const sameYear = date.getUTCFullYear() === new Date().getUTCFullYear();
  return new Intl.DateTimeFormat(locale, {
    ...(sameYear ? {} : { year: `numeric` }),
    month: `short`,
    day: `numeric`,
    timeZone: `UTC`,
  }).format(date);
}

/** 原 OXt（js 189216）：本地短日期（同年省年；非法 → 原样） */
function formatLocalShortDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat(locale, {
    ...(sameYear ? {} : { year: `numeric` }),
    month: `short`,
    day: `numeric`,
  }).format(date);
}

/** 原 kXt（js 189226）：登录/断开按钮组（登录：断连或不可用态；断开：未购买态） */
export function PlanLoginDisconnectButtons(props: {
  providerName: string;
  isDisconnected: boolean;
  isUnavailable: boolean;
  isPurchased: boolean;
  loginLoading?: boolean;
  loginButtonId: string;
  loginVisible: boolean;
  canDisconnectProvider: boolean;
  disconnectLoading?: boolean;
  onLogin?: () => void;
  onDisconnect?: () => void;
}): React.ReactElement {
  const { providerName, isDisconnected, isUnavailable, isPurchased, loginLoading, loginButtonId, loginVisible, canDisconnectProvider, disconnectLoading, onLogin, onDisconnect } = props;
  const { intl } = useIntlContext();
  return (
    <div className={`flex shrink-0 flex-wrap justify-start gap-2`}>
      {loginVisible && (isDisconnected || isUnavailable) && onLogin ? (
        <Button
          type={`button`}
          size={`lg`}
          onClick={() => onLogin()}
          disabled={loginLoading}
        >
          {loginLoading ? <SpinnerIcon className={`size-3.5 animate-spin`} /> : null}
          {intl.formatMessage({ id: loginButtonId }, { provider: providerName })}
        </Button>
      ) : null}
      {canDisconnectProvider && onDisconnect && !isPurchased ? (
        <Button type={`button`} variant={`outline`} size={`lg`} disabled={disconnectLoading} onClick={onDisconnect}>
          {disconnectLoading ? <SpinnerIcon className={`size-3.5 animate-spin`} /> : null}
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.disconnect` })}
        </Button>
      ) : null}
    </div>
  );
}

/** 原 AXt（js 189271）：升级/收起按钮（折扣激活且收起态 → 渐变胶囊 + 徽章 + 信息钮） */
export function UpgradePlansButton(props: {
  loginLoading?: boolean;
  upgradePlansVisible: boolean;
  actionLabelId?: string;
  billingDiscountActive?: boolean;
  billingDiscountConfig?: BillingDiscountConfig;
  onUpgradePlansVisibleChange: (visible: boolean) => void;
}): React.ReactElement {
  const { loginLoading, upgradePlansVisible, actionLabelId = `settings.modelProvider.codingPlan.upgrade`, billingDiscountActive, billingDiscountConfig, onUpgradePlansVisibleChange } = props;
  const { intl } = useIntlContext();
  const gradientPillActive = billingDiscountActive === true && !upgradePlansVisible;
  const button = (
    <Button
      type={`button`}
      size={`lg`}
      className={cn(
        gradientPillActive &&
          `button-gradient dark:bg-[#484A58] text-white hover:bg-transparent hover:opacity-90 dark:hover:bg-[#484A58] pr-[5px] rounded-full`
      )}
      onClick={() => {
        onUpgradePlansVisibleChange(!upgradePlansVisible);
      }}
      disabled={loginLoading}
    >
      {loginLoading ? (
        <SpinnerIcon className={`size-3.5 animate-spin`} />
      ) : upgradePlansVisible ? (
        <ArrowLeftIcon className={`size-3.5`} />
      ) : (
        <RocketIcon className={`size-3.5`} />
      )}
      {intl.formatMessage({ id: upgradePlansVisible ? `settings.modelProvider.codingPlan.cancelUpgrade` : actionLabelId })}
      {gradientPillActive ? <BillingDiscountBadge config={billingDiscountConfig} iconVisible={false} variant={`surface`} /> : null}
    </Button>
  );
  return gradientPillActive ? (
    <div className={`inline-flex shrink-0 items-center gap-1`}>
      {button}
      <BillingDiscountInfoDialog config={billingDiscountConfig} />
    </div>
  ) : (
    button
  );
}

/** 原 jXt（js 189309）：Start Plan 预览卡（新用户资格徽章 + 配额数 + 明细 + 动作） */
export function StartPlanPreviewCard(props: { preview: StartPlanPreview; actions?: React.ReactNode }): React.ReactElement | null {
  const { preview, actions } = props;
  const { intl, locale } = useIntlContext();
  const summary = startPlanPreviewSummary(preview, intl, locale);
  if (!summary) return null;
  const planName = preview.name.trim();
  const grantUnitsLabel = summary.grantUnitsLabel;
  const unitLabel = summary.unitLabel;
  const detailsDescription = summary.detailsDescription;
  return (
    <div className={`space-y-3`}>
      <h3 className={`text-ui-base font-semibold text-foreground`}>
        {intl.formatMessage({ id: `settings.modelProvider.startPlan.quotaSectionTitle` })}
      </h3>
      <div className={`min-h-20 overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_14%_12%,color-mix(in_srgb,var(--color-success)_24%,var(--color-background)_76%)_0%,color-mix(in_srgb,var(--color-success)_10%,var(--color-surface)_90%)_64%,var(--color-surface)_300%)] p-4`}>
        <div className={`flex min-w-0 flex-col gap-1.5`}>
          <div className={`flex min-w-0 items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch`}>
            <div className={`flex min-w-0 flex-1 flex-col gap-1.5`}>
              <div className={`flex min-w-0 flex-wrap items-center gap-1.5`}>
                <span className={`w-fit shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-ui-sm font-medium text-foreground-subtle`}>
                  {intl.formatMessage({ id: `settings.modelProvider.startPlan.eligibleNewUser` })}
                </span>
                <span className={`min-w-0 truncate text-ui-base font-medium text-foreground`}>{planName}</span>
              </div>
              <div className={`flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5`}>
                <span className={`text-2xl font-bold leading-none text-foreground`}>{grantUnitsLabel}</span>
                <span className={`text-ui-base font-medium text-foreground-subtle`}>{unitLabel}</span>
              </div>
            </div>
            {actions ? <div className={`max-sm:[&>button]:w-full`}>{actions}</div> : null}
          </div>
          <p className={`max-w-2xl text-ui-base leading-5 text-foreground-subtle`}>{detailsDescription}</p>
        </div>
      </div>
    </div>
  );
}

/** 原 MXt（js 189380）：预览摘要（可见权益求和 + 单位 + 明细描述；空 → null） */
export function startPlanPreviewSummary(
  preview: StartPlanPreview | null,
  intl: IntlShape,
  locale: string
): { grantUnitsLabel: string; detailsDescription: string; unitLabel: string } | null {
  const visible = (preview?.entitlements ?? []).filter(isVisibleModelUsageEntitlement);
  if (visible.length === 0) return null;
  const first = visible[0];
  if (!first) return null;
  const detailsDescription = entitlementDetailsDescription(visible, first, intl, locale);
  return {
    grantUnitsLabel: formatGrantUnitsLocalized(
      visible.reduce((sum, entry) => sum + entry.grantUnits, 0),
      locale
    ),
    detailsDescription,
    unitLabel: entitlementUnitLabel(first, intl),
  };
}

/** 原 NXt（js 189395）：可见模型用量权益（meter/grantUnits/showName 三条件） */
function isVisibleModelUsageEntitlement(entitlement: StartPlanPreview["entitlements"][number]): boolean {
  return entitlement.meter === `model_usage` && entitlement.grantUnits > 0 && entitlement.showName.trim().length > 0;
}

/** 原 PXt（js 189398）：配额数紧凑格式（A0-D-Misc 补 export：PaymentDeep 跨模块消费，恢复 bundle 拓扑） */
export function formatGrantUnits(value: number, locale: string): string {
  return formatCompactNumber(locale, value);
}

/** 原 FXt（js 189401）：en 紧凑长词形（thousand/million… 首大写）；其余语言走紧凑数字 */
function formatGrantUnitsLocalized(value: number, locale: string): string {
  if (!locale.toLowerCase().startsWith(`en`)) return formatCompactNumber(locale, value);
  return new Intl.NumberFormat(locale || `en-US`, {
    notation: Math.abs(value) >= 1e3 ? `compact` : `standard`,
    compactDisplay: `long`,
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })
    .format(value)
    .replace(/\b(thousand|million|billion|trillion)\b/g, (word) => word.slice(0, 1).toUpperCase() + word.slice(1));
}

/** 原 IXt（js 189416）：权益明细描述（按 grantUnits 分组；多模型 each / 单模型 single；daily/generic 汇总） */
function entitlementDetailsDescription(
  entitlements: StartPlanPreview["entitlements"],
  first: StartPlanPreview["entitlements"][number],
  intl: IntlShape,
  locale: string
): string {
  const unitText = entitlementUnitText(first, intl);
  const groups = groupEntitlementsByGrant(entitlements)
    .map((group) =>
      group.modelNames.length > 1
        ? intl.formatMessage(
            { id: `settings.modelProvider.startPlan.preview.entitlementGroup.each` },
            { models: joinModelNames(group.modelNames, locale), quota: formatGrantUnits(group.grantUnits, locale), unit: unitText }
          )
        : intl.formatMessage(
            { id: `settings.modelProvider.startPlan.preview.entitlementGroup.single` },
            { model: group.modelNames[0] ?? ``, quota: formatGrantUnits(group.grantUnits, locale), unit: unitText }
          )
    )
    .join(` · `);
  return intl.formatMessage(
    {
      id:
        first.period === `daily`
          ? `settings.modelProvider.startPlan.preview.entitlementSummary.daily`
          : `settings.modelProvider.startPlan.preview.entitlementSummary.generic`,
    },
    { details: groups }
  );
}

/** 原 LXt（js 189441）：按 grantUnits 分组（保持出现序） */
function groupEntitlementsByGrant(entitlements: StartPlanPreview["entitlements"]): Array<{ grantUnits: number; modelNames: string[] }> {
  const byGrant = new Map<number, string[]>();
  for (const entitlement of entitlements) {
    const names = byGrant.get(entitlement.grantUnits) ?? [];
    names.push(entitlement.showName);
    byGrant.set(entitlement.grantUnits, names);
  }
  return [...byGrant.entries()].map(([grantUnits, modelNames]) => ({ grantUnits, modelNames }));
}

/** 原 RXt（js 189449）：模型名连接（zh `、`；其余 ` / `） */
function joinModelNames(names: string[], locale: string): string {
  if (locale.toLowerCase().startsWith(`zh`)) return names.join(`、`);
  void names.length;
  return names.join(` / `);
}

/** 原 zXt（js 189452）：单位标签（daily → `每天` 文案包裹） */
function entitlementUnitLabel(entitlement: StartPlanPreview["entitlements"][number], intl: IntlShape): string {
  const unitText = entitlementUnitText(entitlement, intl);
  if (entitlement.period === `daily`)
    return intl.formatMessage({ id: `settings.modelProvider.startPlan.preview.period.daily` }, { unit: unitText });
  return unitText;
}

/** 原 BXt（js 189458）：token → tokens 文案；其余原样 */
function entitlementUnitText(entitlement: StartPlanPreview["entitlements"][number], intl: IntlShape): string {
  return entitlement.unitType === `token` ? intl.formatMessage({ id: `settings.modelProvider.startPlan.preview.unit.tokens` }) : entitlement.unitType;
}

/** 原 VXt（js 189463）：Start Plan 余额卡（标题 + 检查态 + 到期 + 限额行；嵌入式去边框） */
export function StartPlanBalanceCard(props: {
  isChecking?: boolean;
  limits: StartPlanLimit[];
  expireTime?: string;
  renewTime?: string;
  embedded?: boolean;
}): React.ReactElement | null {
  const { isChecking, limits, expireTime, renewTime, embedded = false } = props;
  const { intl, locale } = useIntlContext();
  const visibleLimits = limits.filter((limit) => {
    const total = startPlanLimitTotal(limit);
    const remaining = startPlanLimitRemaining(limit);
    return total > 0 || remaining > 0;
  });
  const rows = visibleLimits;
  if (!isChecking && rows.length === 0) return null;
  const expireLabel = expireLabelOf({ expireTime, intl, locale });
  const renewTimeLabel = formatResetTimeLabel(earliestRenewOrResetTime({ limits: rows, renewTime }), locale);
  return (
    <div className={embedded ? `` : `rounded-lg border border-border bg-card p-4`}>
      <div className={`flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1`}>
        <div className={`flex min-w-0 items-center gap-2`}>
          <h4 className={`min-w-0 truncate text-ui-base font-medium text-foreground`}>
            {intl.formatMessage({ id: `settings.modelProvider.startPlan.balance.title` })}
          </h4>
          {isChecking ? <SpinnerIcon className={`size-3.5 shrink-0 animate-spin text-foreground-subtle`} /> : null}
        </div>
        {expireLabel ? <span className={`shrink-0 text-ui-xs text-foreground-subtle`}>{expireLabel}</span> : null}
      </div>
      {rows.length > 0 ? (
        <div className={`mt-3 flex gap-2 max-sm:flex-col`}>
          {rows.map((limit) => (
            <StartPlanLimitRowInternal key={startPlanLimitKey(limit)} limit={limit} locale={locale} renewTimeLabel={renewTimeLabel} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export interface StartPlanLimit {
  type: string;
  number?: number;
  unit?: number;
  remaining?: number;
  nextResetTime?: number;
  usageDetails?: Array<{ displayName?: string; modelCode: string }>;
  [key: string]: unknown;
}

/** 原 HXt（js 189513）：限额行（名称 + 剩余百分比 + 进度条 + 用量/总量） */
function StartPlanLimitRowInternal(props: { limit: StartPlanLimit; locale: string; renewTimeLabel?: string }): React.ReactElement {
  const { limit, locale, renewTimeLabel } = props;
  const total = startPlanLimitTotal(limit);
  const remaining = startPlanLimitRemaining(limit);
  const remainingRatio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const percentLabel = formatRemainingPercent(locale, remainingRatio);
  return (
    <div className={`min-w-0 flex-1 rounded-lg bg-surface p-3`}>
      <div className={`truncate text-ui-base font-medium text-foreground`}>{startPlanLimitName(limit)}</div>
      <div className={`mt-2 flex min-w-0 items-baseline justify-between gap-3`}>
        <span className={`shrink-0 text-ui-lg font-semibold leading-none text-foreground`}>{percentLabel}</span>
        {renewTimeLabel ? (
          <span className={`min-w-0 truncate text-right text-ui-xs text-foreground-subtle`}>{renewTimeLabel}</span>
        ) : null}
      </div>
      <div className={`mt-2 h-1.5 overflow-hidden rounded-full bg-secondary`}>
        <div className={`h-full rounded-full bg-success`} style={{ width: `${remainingRatio * 100}%` }} />
      </div>
      <div className={`mt-2 truncate text-ui-xs text-foreground-subtle`}>
        {formatLimitAmount(locale, remaining)}{` / `}{formatLimitAmount(locale, total)}
      </div>
    </div>
  );
}

/** 原 UXt（js 189554）：限额键 `${type}:${名称}` */
function startPlanLimitKey(limit: StartPlanLimit): string {
  return `${limit.type}:${startPlanLimitName(limit)}`;
}

/** 原 WXt（js 189557）：总量（number ?? unit ?? 0） */
function startPlanLimitTotal(limit: StartPlanLimit): number {
  return limit.number ?? limit.unit ?? 0;
}

/** 原 GXt（js 189560）：剩余（remaining ?? 0） */
function startPlanLimitRemaining(limit: StartPlanLimit): number {
  return limit.remaining ?? 0;
}

/** 原 KXt（js 189563）：剩余百分比（≥10% 整数，否则 1 位小数） */
function formatRemainingPercent(locale: string, ratio: number): string {
  return new Intl.NumberFormat(locale || void 0, {
    maximumFractionDigits: ratio >= 0.1 ? 0 : 1,
    style: `percent`,
  }).format(ratio);
}

/** 原 qXt（js 189569）：整数千分位 */
function formatLimitAmount(locale: string, value: number): string {
  return new Intl.NumberFormat(locale || void 0, { maximumFractionDigits: 0 }).format(value);
}

/** 原 JXt（js 189572）：最早重置时间（renewTime 字符串优先，否则 limits.nextResetTime 最小） */
function earliestRenewOrResetTime(opts: { limits: StartPlanLimit[]; renewTime?: string }): string | number | undefined {
  return (
    opts.renewTime?.trim() ||
    opts.limits
      .map((limit) => limit.nextResetTime)
      .filter((value): value is number => typeof value == `number` && Number.isFinite(value))
      .sort((a, b) => a - b)[0]
  );
}

/** 原 YXt（js 189581）：重置时间标签（今天=HH:mm；否则 `Mon d HH:mm`；非法字符串原样） */
function formatResetTimeLabel(value: string | number | undefined, locale: string): string | undefined {
  if (!value) return;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value == `string` ? value : void 0;
  const timePart = new Intl.DateTimeFormat(locale || void 0, {
    hour: `2-digit`,
    minute: `2-digit`,
    hourCycle: `h23`,
  }).format(date);
  const now = new Date();
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) return timePart;
  return `${new Intl.DateTimeFormat(locale || void 0, { month: `short`, day: `numeric` }).format(date)} ${timePart}`;
}

/** 原 XXt（js 189597）：到期文案（expiresAt） */
function expireLabelOf(opts: { expireTime?: string; intl: IntlShape; locale: string }): string | null {
  const trimmed = opts.expireTime?.trim();
  return trimmed
    ? opts.intl.formatMessage({ id: `settings.modelProvider.codingPlan.expiresAt` }, { date: formatLocalShortDate(trimmed, opts.locale) })
    : null;
}

/** 原 ZXt（js 189603）：限额名称（usageDetails 展示名 `/` 连接；空 → type） */
function startPlanLimitName(limit: StartPlanLimit): string {
  const names = (limit.usageDetails ?? [])
    .map((detail) => {
      const displayName = detail.displayName?.trim();
      return modelDisplayName(displayName || normalizeStartPlanLimitModelCode(detail.modelCode.trim()));
    })
    .filter((name) => name.length > 0);
  return names.length === 0 ? limit.type : names.join(` / `);
}

/** 原 QXt（js 189612）：`model:` 前缀剥离 + glm-5-turbo 特判 + 大写 */
function normalizeStartPlanLimitModelCode(modelCode: string): string {
  const stripped = modelCode.replace(/^model:/i, ``);
  return stripped.toLowerCase() === `glm-5-turbo` ? `GLM-5Turbo` : stripped.toUpperCase();
}

/** 原 $Xt（js 189616）：嵌入式余额卡（VXt 薄包装） */
export function StartPlanBalanceCardEmbedded(props: {
  isChecking?: boolean;
  limits: StartPlanLimit[];
  expireTime?: string;
  renewTime?: string;
  embedded?: boolean;
}): React.ReactElement | null {
  const { isChecking, limits, expireTime, renewTime, embedded = false } = props;
  return <StartPlanBalanceCard isChecking={isChecking} limits={limits} expireTime={expireTime} renewTime={renewTime} embedded={embedded} />;
}

/** 原 eZt（js 189619）：BigModel 未注册提示 + 注册入口 */
function BigModelUnregisteredHint(props: { onOpenRegistration?: () => void }): React.ReactElement {
  const { onOpenRegistration } = props;
  const { intl } = useIntlContext();
  return (
    <span className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: `settings.modelProvider.codingPlan.bigmodel.unregisteredHint` })}
      {onOpenRegistration ? (
        <Button type={`button`} variant={`link`} size={`xs`} className={`h-auto p-0 text-ui-base/relaxed`} onClick={onOpenRegistration}>
          {intl.formatMessage({ id: `settings.modelProvider.codingPlan.bigmodel.registerAction` })}
        </Button>
      ) : null}
    </span>
  );
}

/** 原 tZt（js 189640）：BigModel 未注册错误模式（中英文） */
function isBigModelUnregisteredError(error: string | null | undefined): boolean {
  if (!error) return false;
  const lowered = error.toLowerCase();
  return (
    error.includes(`BigModel 账号未注册`) ||
    lowered.includes(`bigmodel account is not registered`) ||
    lowered.includes(`not registered`)
  );
}

/** 原 _7（js 189649）：配额卡三色（用量图表 CSS 变量） */
const USAGE_QUOTA_CARD_COLORS = [`var(--color-usage-chart-1)`, `var(--color-usage-chart-2)`, `var(--color-usage-chart-3)`];

/* ============================================================================
 * 12. 加载/空态（原 v7/nZt，js 189650–189674 / jsx 152857–152872）
 * ==========================================================================*/

/** 原 v7（js 189650）：分区加载占位（spinner + 文案） */
export function SectionLoadingPlaceholder(props: { loadingLabel: string }): React.ReactElement {
  return (
    <div className={`flex flex-col gap-2 rounded-xl border border-border bg-surface p-3`}>
      <div className={`flex items-center gap-2 text-ui-base text-foreground-subtle`}>
        <SpinnerIcon className={`size-4 animate-spin`} />
        <span>{props.loadingLabel}</span>
      </div>
    </div>
  );
}

/** 原 nZt（js 189662）：预设空态（名称 + 文案） */
export function PresetEmptyState(props: { displayName?: string; messageId?: string }): React.ReactElement {
  const { displayName, messageId = `settings.modelProvider.presetEmpty` } = props;
  const { intl } = useIntlContext();
  return (
    <div className={`bg-background/50 rounded-2xl p-3`}>
      <div className={`text-ui-lg font-semibold text-foreground`}>{displayName}</div>
      <div className={`mt-1 text-ui-base text-foreground-subtle`}>{intl.formatMessage({ id: messageId })}</div>
    </div>
  );
}

/* ============================================================================
 * 13. rZt 与配额卡簇（原 rZt…vZt，js 189675–190190 / jsx 152873–153247）
 * ==========================================================================*/

export type CodingPlanDisplayStatus = `disconnected` | `checking` | `unavailable` | `unsupported` | `purchased` | `notPurchased`;
export interface CodingPlanViewState {
  displayStatus: CodingPlanDisplayStatus;
  actionStatus: CodingPlanDisplayStatus;
  balanceStatus: CodingPlanDisplayStatus;
  loginLoading: boolean;
}

export interface CodingPlanStatusSectionProps {
  providerId: string;
  providerName: string;
  status: CodingPlanDisplayStatus;
  viewState?: CodingPlanViewState | null;
  loginLoading?: boolean;
  codingPlanApiKeyAuthenticated?: boolean;
  codingPlanPurchaseTokenAuthenticated?: boolean;
  disconnectLoading?: boolean;
  purchaseUrl?: string;
  planLevel?: string;
  inactivePlanTitle?: string;
  currentProductId?: string;
  productsRefreshToken?: number;
  subscriptionRenewTime?: string;
  subscriptionExpireTime?: string;
  quotaLimits?: EntitlementQuotaLimit[];
  authError?: string | null;
  onOpenRegistration?: () => void;
  onLogin?: () => void;
  onOpenPurchase?: (url: string) => void;
  onDisconnect?: () => void;
  onPurchaseComplete?: () => void;
  onOpenUpgradePlans?: (opts: { initialAudience: "personal" | "team"; funnelContext: FunnelContext | null }) => void; // A1-R11 精化：同上
  loginActionPlacement?: "inline" | "trailing";
  loginActionVisible?: boolean;
  usageDetailsVisible?: boolean;
  upgradePlansVisible?: boolean;
  onUpgradePlansVisibleChange?: (visible: boolean) => void;
  purchaseInitialAudience?: "personal" | "team";
  funnelContext?: FunnelContext | null; // A1-R11 精化：同上
  startPlanPreviewVisible?: boolean;
  pricingCardsVisible?: boolean;
  statusLabelId?: string;
}

/** 原 rZt（js 189675）：Coding Plan 状态区根 —— 标题/状态行/登录解绑/升级订阅/配额/预览/购买对话框 */
export function CodingPlanStatusSection(props: CodingPlanStatusSectionProps): React.ReactElement {
  const {
    providerId,
    providerName,
    status,
    viewState,
    loginLoading,
    codingPlanApiKeyAuthenticated,
    codingPlanPurchaseTokenAuthenticated,
    disconnectLoading,
    purchaseUrl,
    planLevel,
    inactivePlanTitle,
    currentProductId,
    productsRefreshToken,
    subscriptionRenewTime,
    subscriptionExpireTime,
    quotaLimits = [],
    authError,
    onOpenRegistration,
    onLogin,
    onOpenPurchase,
    onDisconnect,
    onPurchaseComplete,
    onOpenUpgradePlans,
    loginActionPlacement = `inline`,
    loginActionVisible = false,
    usageDetailsVisible = true,
    upgradePlansVisible: upgradePlansVisibleProp,
    onUpgradePlansVisibleChange,
    purchaseInitialAudience = `personal`,
    funnelContext: funnelContextProp,
    startPlanPreviewVisible = true,
    pricingCardsVisible = true,
    statusLabelId,
  } = props;
  const { intl } = useIntlContext();
  const billingDiscount = useBillingDiscount();
  const [upgradePlansLocal, setUpgradePlansLocal] = React.useState(false);
  const [funnelContextLocal, setFunnelContextLocal] = React.useState<FunnelContext | null>(null); // A1-R11 精化：同上
  const upgradePlansVisible = upgradePlansVisibleProp ?? upgradePlansLocal;
  const setUpgradePlansVisible = onUpgradePlansVisibleChange ?? setUpgradePlansLocal;
  const funnelContext = funnelContextProp ?? funnelContextLocal;
  const state = viewState ?? { displayStatus: status, actionStatus: status, balanceStatus: status, loginLoading: loginLoading === true };
  const isDisconnected = state.displayStatus === `disconnected`;
  const isChecking = state.displayStatus === `checking`;
  const isUnavailable = state.displayStatus === `unavailable`;
  const isUnsupported = state.displayStatus === `unsupported`;
  const isPurchased = state.displayStatus === `purchased`;
  const isNotPurchased = state.displayStatus === `notPurchased`;
  const actionDisconnected = state.actionStatus === `disconnected`;
  const isStartPlanProvider = isStartPlanProviderId(providerId);
  const loginRegion = providerName.toLowerCase() === `bigmodel` ? BIGMODEL_REGION : `zai`;
  const canDisconnect = !!onDisconnect && !isDisconnected && !isChecking && !isUnavailable && !isUnsupported;
  const loginButtonId = `settings.modelProvider.codingPlan.connect`;
  const resolvedStatusLabelId =
    statusLabelId ??
    (isUnsupported
      ? `settings.modelProvider.codingPlan.status.unsupported`
      : isDisconnected
        ? `settings.modelProvider.codingPlan.status.disconnected`
        : isChecking
          ? `settings.modelProvider.codingPlan.status.checking`
          : isUnavailable
            ? `settings.modelProvider.codingPlan.status.unavailable`
            : isPurchased
              ? `settings.modelProvider.codingPlan.status.purchased`
              : `settings.modelProvider.codingPlan.status.notPurchased`);
  const isTeamUnavailable = resolvedStatusLabelId === `settings.modelProvider.codingPlan.status.teamUnavailable`;
  const actionUnavailable = state.actionStatus === `unavailable` && !isTeamUnavailable;
  const trailingLoginVisible = loginActionVisible && loginActionPlacement === `trailing` && (actionDisconnected || actionUnavailable) && !!onLogin;
  const rawPlanLevel = planLevel?.trim() ?? ``;
  const upperPlanLevel = rawPlanLevel.toUpperCase();
  const isMaxLevel = isMaxPlanLevel(rawPlanLevel);
  const displayPlanLevel = /^GLM[\s_-]+CODING\b/i.test(rawPlanLevel) ? modelDisplayName(rawPlanLevel) : upperPlanLevel;
  const upgradeActive = isPurchased && !isChecking && !isUnsupported;
  const manageVisible = !isDisconnected && !isChecking && !isUnsupported && isPurchased && !!purchaseUrl && !!onOpenPurchase;
  const startPlanPreviewShown = startPlanPreviewVisible && isStartPlanProvider && isDisconnected && !upgradePlansVisible;
  const startPlanPreview = useStartPlanPreview({ enabled: startPlanPreviewShown });
  const productsProviderId = isStartPlanProvider ? productsProviderIdOf(providerId) : void 0;
  const pricingCardsShown = pricingCardsVisible && !isUnsupported && upgradePlansVisible;
  const accountRequirementVisible = loginRegion === `zai` ? !codingPlanApiKeyAuthenticated && (isDisconnected || actionUnavailable) : isDisconnected || actionUnavailable;
  const bigmodelUnregistered = isChecking && loginRegion === `bigmodel` && isBigModelUnregisteredError(authError);
  const trackUpgradeEvent = (eventText: string) =>
    trackPlanCardEvent({
      providerId,
      upgradeSource: `setting_plan_card`,
      eventRegion: `app.setting`,
      eventText,
      entryPlanState: entryPlanStateOf({ displayStatus: state.displayStatus, providerId, planLevel }),
    });
  const openUpgradePlans = (audience: "personal" | "team", context: FunnelContext | null) => { // A1-R11 精化：同上
    setFunnelContextLocal(context);
    if (onOpenUpgradePlans) {
      onOpenUpgradePlans({ initialAudience: audience, funnelContext: context });
      return;
    }
    setUpgradePlansVisible(true);
  };
  const upgradeButton = upgradeActive ? (
    <UpgradePlansButton
      loginLoading={state.loginLoading}
      upgradePlansVisible={upgradePlansVisible}
      actionLabelId={isMaxLevel ? `settings.modelProvider.codingPlan.renew` : `settings.modelProvider.codingPlan.upgrade`}
      billingDiscountActive={isStartPlanProvider && billingDiscount.active}
      billingDiscountConfig={billingDiscount.config}
      onUpgradePlansVisibleChange={(visible) => {
        if (visible) {
          openUpgradePlans(
            `personal`,
            trackUpgradeEvent(
              intl.formatMessage({
                id: isMaxLevel ? `settings.modelProvider.codingPlan.renew` : `settings.modelProvider.codingPlan.upgrade`,
              })
            )
          );
          return;
        }
        setUpgradePlansVisible(visible);
      }}
    />
  ) : null;
  const subscribeButton =
    !upgradeActive && isNotPurchased && !isChecking && !isUnsupported ? (
      <Button
        type={`button`}
        size={`lg`}
        onClick={() => {
          openUpgradePlans(`personal`, trackUpgradeEvent(intl.formatMessage({ id: `settings.modelProvider.codingPlan.subscribe` })));
        }}
      >
        {intl.formatMessage({ id: `settings.modelProvider.codingPlan.subscribe` })}
      </Button>
    ) : null;
  const disconnectVisible = canDisconnect && !isPurchased;
  const planCardTitle = resolvePlanCardTitle({
    isPurchased,
    isStartPlanProvider,
    inactivePlanTitle,
    rawPlanLevel,
    displayPlanLevel,
    startPlanTitle: intl.formatMessage({ id: `settings.modelProvider.planCard.startPlan` }),
    codingPlanTitle: intl.formatMessage({ id: `settings.modelProvider.planCard.codingPlan` }),
  });
  const discountBadgeBesideTitle = !isStartPlanProvider && billingDiscount.active;
  const notPurchasedHint = isNotPurchased ? (
    <span className={`flex w-fit items-center gap-1.5 text-foreground-subtle`}>
      <InfoIcon className={`size-3 shrink-0`} aria-hidden={`true`} />
      <span>{intl.formatMessage({ id: resolvedStatusLabelId })}</span>
    </span>
  ) : null;
  const statusRow =
    isPurchased && isStartPlanProvider ? (
      <StartPlanStatusRow
        expireTime={subscriptionExpireTime}
        manageLabel={manageVisible ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.manage` }) : null}
        unlinkLabel={canDisconnect ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.disconnect` }) : null}
        unlinkLoading={disconnectLoading}
        onManage={manageVisible && purchaseUrl && onOpenPurchase ? () => onOpenPurchase(purchaseUrl) : void 0}
        onUnlink={disconnectVisible ? onDisconnect : void 0}
      />
    ) : isPurchased ? (
      <PlanStatusRow
        renewTime={subscriptionRenewTime}
        expireTime={subscriptionExpireTime}
        manageLabel={manageVisible ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.manage` }) : null}
        unlinkLabel={canDisconnect ? intl.formatMessage({ id: `settings.modelProvider.codingPlan.disconnect` }) : null}
        unlinkLoading={disconnectLoading}
        onManage={manageVisible && purchaseUrl && onOpenPurchase ? () => onOpenPurchase(purchaseUrl) : void 0}
        onUnlink={disconnectVisible ? onDisconnect : void 0}
      />
    ) : bigmodelUnregistered ? (
      <BigModelUnregisteredHint onOpenRegistration={onOpenRegistration} />
    ) : disconnectVisible ? (
      <PlanStatusRow
        statusLabel={notPurchasedHint ?? intl.formatMessage({ id: resolvedStatusLabelId })}
        unlinkLabel={intl.formatMessage({ id: `settings.modelProvider.codingPlan.disconnect` })}
        unlinkLoading={disconnectLoading}
        onUnlink={onDisconnect}
      />
    ) : (
      <span
        className={
          isTeamUnavailable
            ? `flex w-fit items-center gap-1.5 text-ui-base text-warning`
            : `flex w-fit items-center gap-1.5 text-ui-base text-foreground-subtle`
        }
      >
        {isChecking ? <SpinnerIcon className={`size-3 animate-spin`} /> : null}
        {isNotPurchased || isTeamUnavailable ? <InfoIcon className={`size-3 shrink-0`} aria-hidden={`true`} /> : null}
        {intl.formatMessage({ id: resolvedStatusLabelId })}
      </span>
    );
  const usageDetailsShown = usageDetailsVisible && isPurchased && (isStartPlanProvider || hasVisibleQuotaLimits(quotaLimits));
  const trailingAction = trailingLoginVisible ? (
    <Button
      type={`button`}
      size={`lg`}
      onClick={() => onLogin?.()}
      disabled={state.loginLoading}
    >
      {state.loginLoading ? <SpinnerIcon className={`size-3.5 animate-spin`} /> : null}
      {intl.formatMessage({ id: loginButtonId }, { provider: providerName })}
    </Button>
  ) : (
    upgradeButton || subscribeButton || null
  );
  return (
    <div className={`space-y-3`}>
      <div className={`rounded-xl border border-border bg-surface p-4`}>
        <div className={`flex min-w-0 items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch`}>
          <div className={`min-w-0 space-y-1`}>
            <div className={`flex min-w-0 flex-wrap items-center gap-1`}>
              <h3 className={`min-w-0 truncate text-lg font-semibold leading-5 text-foreground`}>{planCardTitle}</h3>
              {discountBadgeBesideTitle ? <BillingDiscountBadgeWithInfo config={billingDiscount.config} size={`compact`} /> : null}
            </div>
            <div className={`mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1`}>
              {statusRow}
              <PlanLoginDisconnectButtons
                providerName={providerName}
                isDisconnected={actionDisconnected}
                isUnavailable={actionUnavailable}
                isPurchased={isPurchased}
                loginLoading={state.loginLoading}
                loginButtonId={loginButtonId}
                loginVisible={loginActionVisible && !trailingLoginVisible}
                canDisconnectProvider={disconnectVisible ? false : canDisconnect}
                disconnectLoading={disconnectLoading}
                onLogin={onLogin}
                onDisconnect={onDisconnect}
              />
            </div>
          </div>
          {trailingAction ? (
            <div className={`shrink-0 max-sm:flex max-sm:w-full max-sm:[&>button]:w-full`}>{trailingAction}</div>
          ) : null}
        </div>
        {usageDetailsShown ? (
          <>
            <div className={`my-4 border-t border-border`} />
            {isStartPlanProvider ? (
              <StartPlanBalanceCardEmbedded
                isChecking={state.balanceStatus === `checking`}
                limits={quotaLimits}
                expireTime={subscriptionExpireTime}
                renewTime={subscriptionRenewTime}
                embedded={true}
              />
            ) : (
              <CodingPlanQuotaCardRow limits={quotaLimits} />
            )}
          </>
        ) : null}
      </div>
      {startPlanPreviewShown && !startPlanPreview.loading && startPlanPreview.preview ? (
        <StartPlanPreviewCard preview={startPlanPreview.preview} />
      ) : null}
      {pricingCardsShown && !onOpenUpgradePlans ? (
        <CodingPlanPurchaseDialog
          open={upgradePlansVisible}
          providerId={providerId}
          productsProviderId={productsProviderId}
          currentPlanLevel={planLevel}
          currentProductId={currentProductId}
          productsRefreshToken={productsRefreshToken}
          loginLoading={state.loginLoading}
          codingPlanPurchaseTokenAuthenticated={codingPlanPurchaseTokenAuthenticated}
          accountRequirementVisible={accountRequirementVisible}
          autoRecoverAuthOnOAuthRequired={upgradePlansVisible}
          initialAudience={purchaseInitialAudience}
          funnelContext={funnelContext}
          onLogin={onLogin}
          onOpenChange={(open) => {
            if (!open) setFunnelContextLocal(null);
            setUpgradePlansVisible(open);
          }}
          onPurchaseComplete={() => {
            setFunnelContextLocal(null);
            onPurchaseComplete?.();
          }}
        />
      ) : null}
    </div>
  );
}

/** 原 iZt（js 189991）：计划卡标题（已购买×Start Plan×start 级 → start 标题；未购买 → 非活跃标题回退） */
function resolvePlanCardTitle(opts: {
  isPurchased: boolean;
  isStartPlanProvider: boolean;
  inactivePlanTitle?: string;
  rawPlanLevel: string;
  displayPlanLevel: string;
  startPlanTitle: string;
  codingPlanTitle: string;
}): string {
  const { isPurchased, isStartPlanProvider, inactivePlanTitle, rawPlanLevel, displayPlanLevel, startPlanTitle, codingPlanTitle } = opts;
  if (isPurchased) return isStartPlanProvider ? (isStartPlanLevel(rawPlanLevel) ? startPlanTitle : displayPlanLevel || startPlanTitle) : displayPlanLevel || codingPlanTitle;
  return inactivePlanTitle?.trim() || codingPlanTitle;
}

/** 原 aZt（js 190002）：start 级判定（start | start plan | * start plan） */
function isStartPlanLevel(rawPlanLevel: string): boolean {
  const lowered = rawPlanLevel.trim().toLowerCase();
  return lowered === `start` || lowered === `start plan` || lowered.endsWith(` start plan`);
}

/** 原 oZt（js 190006）：MAX 级判定（词边界） */
function isMaxPlanLevel(rawPlanLevel: string): boolean {
  return /(^|[\s_-])MAX($|[\s_-])/i.test(rawPlanLevel);
}

/** 原 sZt（js 190009）：配额卡行（5h/周/月 MCP 三卡；无命中 → 通用数值限额前 3） */
export function CodingPlanQuotaCardRow(props: { limits: EntitlementQuotaLimit[] }): React.ReactElement {
  const { limits } = props;
  const { intl } = useIntlContext();
  const cards = [
    quotaCardOrNull({
      key: `fiveHour`,
      label: intl.formatMessage({ id: `settings.usage.entitlementFiveHourUsage` }),
      limit: findQuotaLimitStrict(limits, `TOKENS_LIMIT`, 3, 5),
      progressColor: USAGE_QUOTA_CARD_COLORS[0],
      resetTimeFormat: `dateTime`,
    }),
    quotaCardOrNull({
      key: `weekly`,
      label: intl.formatMessage({ id: `settings.usage.entitlementWeeklyUsage` }),
      limit: findQuotaLimitStrict(limits, `TOKENS_LIMIT`, 6),
      progressColor: USAGE_QUOTA_CARD_COLORS[1],
      resetTimeFormat: `date`,
    }),
    quotaCardOrNull({
      key: `monthlyTool`,
      label: intl.formatMessage({ id: `settings.usage.entitlementMonthlyMcpUsage` }),
      limit: findQuotaLimitStrict(limits, `TIME_LIMIT`, 5, 1),
      progressColor: USAGE_QUOTA_CARD_COLORS[2],
      resetTimeFormat: `date`,
    }),
  ].filter((card): card is NonNullable<typeof card> => card !== null);
  const resolved =
    cards.length > 0
      ? cards
      : limits
          .filter(isNumericQuotaLimit)
          .slice(0, 3)
          .map((limit, index) => ({
            key: `generic-${index}`,
            label: genericQuotaLimitLabel(limit, intl),
            limit,
            progressColor: USAGE_QUOTA_CARD_COLORS[index % USAGE_QUOTA_CARD_COLORS.length] ?? USAGE_QUOTA_CARD_COLORS[0],
            resetTimeFormat: `date` as const,
          }));
  return (
    <div className={`flex w-full gap-2 max-sm:flex-col`}>
      {resolved.map((card) => (
        <QuotaLimitCard
          key={card.key}
          label={card.label}
          limit={card.limit}
          progressColor={card.progressColor}
          resetTimeFormat={card.resetTimeFormat}
        />
      ))}
    </div>
  );
}

/** 原 y7（js 190062）：限额存在才出卡 */
function quotaCardOrNull(card: {
  key: string;
  label: string;
  limit: EntitlementQuotaLimit | undefined;
  progressColor: string | undefined;
  resetTimeFormat: "dateTime" | "date";
}): { key: string; label: string; limit: EntitlementQuotaLimit; progressColor: string | undefined; resetTimeFormat: "dateTime" | "date" } | null {
  if (!card.limit) return null;
  return { key: card.key, label: card.label, limit: card.limit, progressColor: card.progressColor, resetTimeFormat: card.resetTimeFormat };
}

/** 原 cZt（js 190073）：可见配额判定（三键任一 或 数值限额存在） */
export function hasVisibleQuotaLimits(limits: EntitlementQuotaLimit[]): boolean {
  return !!(
    findQuotaLimitStrict(limits, `TOKENS_LIMIT`, 3, 5) ||
    findQuotaLimitStrict(limits, `TOKENS_LIMIT`, 6) ||
    findQuotaLimitStrict(limits, `TIME_LIMIT`, 5, 1) ||
    limits.some(isNumericQuotaLimit)
  );
}

/** 原 lZt（js 190081）：数值限额判定（percentage/remaining/currentValue/usage 任一为数值） */
function isNumericQuotaLimit(limit: EntitlementQuotaLimit): boolean {
  return (
    typeof limit.percentage == `number` ||
    typeof limit.remaining == `number` ||
    typeof limit.currentValue == `number` ||
    typeof limit.usage == `number`
  );
}

/** 原 uZt（js 190089）：通用限额标签（TIME_LIMIT → 月 MCP；否则总 token） */
function genericQuotaLimitLabel(limit: EntitlementQuotaLimit, intl: IntlShape): string {
  return limit.type === `TIME_LIMIT`
    ? intl.formatMessage({ id: `settings.usage.entitlementMonthlyMcpUsage` })
    : intl.formatMessage({ id: `settings.modelProvider.planCard.usage.totalTokens` });
}

/** 原 dZt（js 190094）：配额卡（标签 + 模型行 + 百分比 + 重置时间 + 彩色进度） */
export function QuotaLimitCard(props: {
  label?: string;
  limit: EntitlementQuotaLimit;
  progressColor: string | undefined;
  resetTimeFormat: "dateTime" | "date";
}): React.ReactElement {
  const { label, limit, progressColor, resetTimeFormat } = props;
  const { locale } = useIntlContext();
  const usedPercent = quotaUsedPercent(limit);
  const percentOrZero = usedPercent ?? 0;
  const modelsLabel = limit && limit.type !== `TIME_LIMIT` ? quotaLimitModelsLabel(limit) : ``;
  const resetLabel = formatQuotaResetTime({ locale, value: limit?.nextResetTime, format: resetTimeFormat, compactToday: resetTimeFormat === `dateTime` });
  return (
    <div className={`min-w-0 flex-1 rounded-lg bg-surface p-3`}>
      {label ? <div className={`truncate text-ui-base font-medium text-foreground`}>{label}</div> : null}
      {modelsLabel ? (
        <div className={`truncate text-ui-xs text-foreground-subtle ${label ? `mt-1` : ``}`}>{modelsLabel}</div>
      ) : null}
      <div className={`mt-2 flex min-w-0 items-baseline gap-1.5`}>
        <span className={`text-ui-lg font-semibold leading-none text-foreground`}>{formatQuotaPercent(locale, usedPercent)}</span>
        {resetLabel ? <span className={`min-w-0 truncate text-ui-xs text-foreground-subtle`}>{resetLabel}</span> : null}
      </div>
      <div className={`mt-2 h-1.5 overflow-hidden rounded-full bg-secondary`}>
        <div className={`h-full rounded-full`} style={{ width: `${percentOrZero}%`, backgroundColor: progressColor }} />
      </div>
    </div>
  );
}

/** 原 b7（js 190140）：严格三键查找（=Sq，返回 undefined 变体） */
export function findQuotaLimitStrict(
  limits: EntitlementQuotaLimit[],
  type: string,
  unit?: number,
  number?: number
): EntitlementQuotaLimit | undefined {
  return limits.find((limit) => limit.type === type && limit.unit === unit && (number == null || limit.number === number));
}

/** 原 fZt（js 190143）：已用百分比（percentage 剩余换算优先；否则 remaining/number） */
function quotaUsedPercent(limit: EntitlementQuotaLimit | undefined): number | null {
  const clampedPercentage = clampPercent0to100(limit?.percentage);
  if (clampedPercentage !== null) return Math.max(0, Math.min(100, 100 - clampedPercentage));
  const remaining = limit?.remaining;
  const total = limit?.number;
  if (typeof remaining == `number` && Number.isFinite(remaining) && typeof total == `number` && Number.isFinite(total) && total > 0)
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  return null;
}

/** 原 pZt（js 190156）：百分比钳制（非数 → null） */
function clampPercent0to100(value: number | undefined | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, value));
}

/** 原 mZt（js 190159）：百分比文案（`--` 或 `NN%`；≥10 整数） */
function formatQuotaPercent(locale: string, value: number | null): string {
  if (value == null || !Number.isFinite(value)) return `--`;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: value >= 10 ? 0 : 1 }).format(Math.max(0, Math.min(100, value)))}%`;
}

/** 原 hZt（js 190164）：限额模型标签（去重 `/` 连接） */
function quotaLimitModelsLabel(limit: EntitlementQuotaLimit): string {
  const names = (limit.usageDetails ?? [])
    .map((detail) => {
      const displayName = detail.displayName?.trim();
      return modelDisplayName(displayName || normalizeQuotaModelCode(detail.modelCode.trim()));
    })
    .filter((name) => name.length > 0);
  return Array.from(new Set(names)).join(` / `);
}

/** 原 gZt（js 190173）：`model:` 前缀剥离；`_-` → 空格 */
function normalizeQuotaModelCode(modelCode: string): string {
  return (
    modelCode
      .replace(/^model:/i, ``)
      .replace(/[_-]+/g, ` `)
      .trim() || modelCode
  );
}

/** 原 _Zt（js 190181）：视图态解析（登录中：购买/未购买态 → 保持，其余 → checking 覆盖） */
export function resolveCodingPlanViewState(opts: { status: CodingPlanDisplayStatus; loginPending?: boolean }): CodingPlanViewState {
  const { status, loginPending } = opts;
  if (!loginPending) return codingPlanViewStateOf(status, false);
  if (status === `purchased` || status === `notPurchased`) return codingPlanViewStateOf(status, true);
  return { displayStatus: `checking`, actionStatus: status, balanceStatus: status, loginLoading: true };
}

/** 原 vZt（js 190188）：三态同步视图态 */
function codingPlanViewStateOf(status: CodingPlanDisplayStatus, loginLoading: boolean): CodingPlanViewState {
  return { displayStatus: status, actionStatus: status, balanceStatus: status, loginLoading };
}

/* ============================================================================
 * 14. 卡壳/连接模式导航（原 x7…kZt，js 190191–190378 / jsx 153248–153399）
 * ==========================================================================*/

/** 原 x7（js 190191）：卡壳（有 header → gap-4 列布局） */
export function ProviderCardShell(props: { header?: React.ReactNode; children: React.ReactNode }): React.ReactElement {
  const { header, children } = props;
  return header ? (
    <div className={`flex min-w-0 flex-col gap-4`}>
      {header}
      {children}
    </div>
  ) : (
    <>{children}</>
  );
}

/** 原 yZt（js 190194）：卡头（区域 logo + 族标题 + 启用徽章 + 尾随动作；无族/非计划项 → null） */
export function ProviderCardHeader(props: { selectedNavItem: ModelProviderNavItem | null; trailingAction?: React.ReactNode }): React.ReactElement | null {
  const { selectedNavItem, trailingAction } = props;
  const { intl } = useIntlContext();
  if (!selectedNavItem) return null;
  const presetId =
    selectedNavItem.type === `preset` || selectedNavItem.type === `codingPlan` || selectedNavItem.type === `teamPlan` ? selectedNavItem.presetId : null;
  if (!presetId) return null;
  const family = familyOfPresetId(presetId);
  if (!family) return null;
  const statusActive = `statusActive` in selectedNavItem && selectedNavItem.statusActive === true;
  return (
    <div className={`flex min-w-0 flex-wrap items-center justify-between gap-2`}>
      <div className={`flex min-w-0 flex-wrap items-center gap-2`}>
        <RegionLogo region={family.oauthProviderId === `bigmodel` ? BIGMODEL_REGION : `zai`} className={`size-5 shrink-0`} />
        <h3 className={`truncate text-ui-lg font-medium text-foreground`}>{family.label}</h3>
        <span
          className={[
            `shrink-0 rounded-full px-2 py-0.5 text-ui-base font-medium`,
            statusActive ? `bg-success text-success-foreground` : `bg-secondary text-foreground-subtle`,
          ].join(` `)}
        >
          {intl.formatMessage({ id: statusActive ? `settings.modelProvider.enabledStatus` : `settings.modelProvider.disabledStatus` })}
        </span>
      </div>
      {trailingAction ? <div className={`shrink-0`}>{trailingAction}</div> : null}
    </div>
  );
}

/** 原 bZt（js 190231）：连接模式导航（<2 选项隐藏；当前项回退链；加载失败警示态） */
export function ConnectionModeNav(props: {
  selectedNavItem: ModelProviderNavItem | null;
  navigationItems: ModelProviderNavItem[];
  connectionSettingsFailed?: boolean;
  onSelectNavItem?: (item: ModelProviderNavItem, mode?: string) => void;
}): React.ReactElement | null {
  const { selectedNavItem, navigationItems, connectionSettingsFailed = false, onSelectNavItem } = props;
  const { intl } = useIntlContext();
  if (!selectedNavItem || !onSelectNavItem) return null;
  const presetId =
    selectedNavItem.type === `preset` || selectedNavItem.type === `codingPlan` || selectedNavItem.type === `teamPlan` ? selectedNavItem.presetId : null;
  if (!presetId) return null;
  const family = familyOfPresetId(presetId);
  if (!family) return null;
  const options = connectionModeOptionsOf({
    familyId: family.id,
    navigationItems,
    apiKeyLabel: intl.formatMessage({ id: `settings.modelProvider.apiKey` }),
    startPlanLabel: intl.formatMessage({ id: `settings.modelProvider.connectionMode.startPlan` }),
    codingPlanLabel: intl.formatMessage({ id: `settings.modelProvider.connectionMode.codingPlan` }),
    teamPlanFallbackLabel: intl.formatMessage({ id: `settings.modelProvider.connectionMode.teamPlan` }),
  });
  if (options.length < 2) return null;
  const current =
    options.find((option) => option.key === selectedNavItem.key) ??
    options.find((option) => (selectedNavItem.type === `preset` ? option.mode === `apiKey` : option.mode === `oauth`)) ??
    options[0];
  const caption = intl.formatMessage({
    id: connectionSettingsFailed ? `settings.modelProvider.connectionMode.loadFailed` : `settings.modelProvider.connectionMode`,
  });
  return (
    <label className={`flex min-w-0 flex-wrap items-center justify-end gap-2`}>
      <span
        className={[
          `inline-flex min-w-0 shrink-0 items-center gap-1 text-ui-base`,
          connectionSettingsFailed ? `text-warning` : `text-foreground-subtle`,
        ].join(` `)}
      >
        {connectionSettingsFailed ? <InfoIcon className={`size-3.5 shrink-0`} /> : null}
        <span className={`truncate`}>{caption}</span>
      </span>
      <SelectRoot
        value={current.key}
        onValueChange={(value) => {
          const option = options.find((candidate) => candidate.key === value);
          if (option) onSelectNavItem(option.item, option.mode);
        }}
      >
        <SelectTrigger size={`lg`} className={`max-w-full justify-between`} aria-label={caption} data-testid={CONNECTION_MODE_TRIGGER_TESTID}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align={`end`} className={`min-w-40 max-w-[calc(100vw-2rem)]`}>
          {options.map((option) => (
            <SelectItem key={option.key} value={option.key} data-testid={joinTestId(CONNECTION_MODE_ITEM_TESTID_PREFIX, option.key)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </label>
  );
}

interface ConnectionModeOption {
  key: string;
  item: ModelProviderNavItem;
  mode: `apiKey` | `oauth`;
  label: string;
  order: number;
}

/** 原 xZt（js 190307）：族内连接模式选项（startPlan 0 < codingPlan 10 < teamPlan 100+n < apiKey 1000） */
function connectionModeOptionsOf(opts: {
  familyId: string;
  navigationItems: ModelProviderNavItem[];
  apiKeyLabel: string;
  startPlanLabel: string;
  codingPlanLabel: string;
  teamPlanFallbackLabel: string;
}): ConnectionModeOption[] {
  const options: ConnectionModeOption[] = [];
  for (const item of opts.navigationItems) {
    if (item.type !== `preset` && item.type !== `codingPlan` && item.type !== `teamPlan`) continue;
    if (!item.presetId) continue;
    const family = familyOfPresetId(item.presetId);
    if (!family || family.id !== opts.familyId) continue;
    if (item.type === `preset`) {
      if (item.presetId !== family.apiKeyProviderId) continue;
      options.push({ key: item.key, item, mode: `apiKey`, label: opts.apiKeyLabel, order: 1e3 });
      continue;
    }
    if (item.type === `teamPlan`) {
      options.push({
        key: item.key,
        item,
        mode: `oauth`,
        label: teamPlanLabelOrFallback(item.teamPlanName, opts.teamPlanFallbackLabel),
        order: 100 + options.length,
      });
      continue;
    }
    options.push({
      key: item.key,
      item,
      mode: `oauth`,
      label: item.presetId === family.startPlanProviderId ? opts.startPlanLabel : opts.codingPlanLabel,
      order: item.presetId === family.startPlanProviderId ? 0 : 10,
    });
  }
  return options.sort((a, b) => a.order - b.order);
}

/** 原 SZt（js 190346）：团队计划名回退 */
function teamPlanLabelOrFallback(teamPlanName: string | undefined, fallback: string): string {
  return teamPlanName?.trim() || fallback;
}

/** 原 CZt/wZt/TZt/EZt（js 190349–190352）：购买卡径向渐变类名 ×4（success/#4099ff/#0ea5e9/#14b8a6） */
const PURCHASE_CARD_CLASS_START_PLAN = `min-h-20 w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_14%_12%,color-mix(in_srgb,var(--color-success)_24%,var(--color-background)_76%)_0%,color-mix(in_srgb,var(--color-success)_10%,var(--color-surface)_90%)_64%,var(--color-surface)_300%)] p-4 text-left transition-colors hover:border-border-hover`;
const PURCHASE_CARD_CLASS_PERSONAL = `min-h-20 w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_14%_12%,color-mix(in_srgb,#4099ff_24%,var(--color-background)_76%)_0%,color-mix(in_srgb,#4099ff_10%,var(--color-surface)_90%)_64%,var(--color-surface)_300%)] p-4 text-left transition-colors hover:border-border-hover`;
const PURCHASE_CARD_CLASS_TEAM = `min-h-20 w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_14%_12%,color-mix(in_srgb,#0ea5e9_24%,var(--color-background)_76%)_0%,color-mix(in_srgb,#0ea5e9_10%,var(--color-surface)_90%)_64%,var(--color-surface)_300%)] p-4 text-left transition-colors hover:border-border-hover`;
const PURCHASE_CARD_CLASS_TEAM_ADVANCED = `min-h-20 w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_14%_12%,color-mix(in_srgb,#14b8a6_24%,var(--color-background)_76%)_0%,color-mix(in_srgb,#14b8a6_10%,var(--color-surface)_90%)_64%,var(--color-surface)_300%)] p-4 text-left transition-colors hover:border-border-hover`;

/** 原 DZt（js 190353）：计划导航项判定 */
function isPlanNavItem(item: ModelProviderNavItem | undefined): boolean {
  return item?.type === `codingPlan` || item?.type === `teamPlan`;
}

/** 原 OZt（js 190356）：已解析团队计划项（organizationId+projectId 齐备） */
function isResolvedTeamPlanItem(item: ModelProviderNavItem | undefined): boolean {
  return (
    item?.type === `teamPlan` &&
    (item.organizationId?.trim().length ?? 0) > 0 &&
    (item.projectId?.trim().length ?? 0) > 0
  );
}

/** 原 kZt（js 190363）：团队计划导航项 × 订阅快照合并（检查态/购买态/配额回填） */
export function mergeTeamPlanSnapshot(
  item: ModelProviderNavItem,
  snapshotState: { snapshot: EntitlementSnapshot | null; loading: boolean }
): ModelProviderNavItem {
  if (item.type !== `teamPlan` || !isResolvedTeamPlanItem(item)) return item;
  const snapshot = snapshotState.snapshot;
  if (!snapshot) return snapshotState.loading ? { ...item, status: `checking`, quotaLimits: [] } : item;
  const subscriptionDetail = snapshot.subscription?.details?.[0] ?? null;
  return {
    ...item,
    status: subscriptionDetail || snapshot.quota ? `purchased` : item.status,
    planLevel: item.teamPlanName?.trim() || item.planLevel,
    currentProductId: item.currentProductId,
    subscriptionBillingCycle: item.subscriptionBillingCycle,
    subscriptionRenewTime: item.subscriptionRenewTime,
    subscriptionExpireTime: item.subscriptionExpireTime,
    quotaLimits: snapshot.quota?.limits ?? item.quotaLimits,
  };
}

/* ============================================================================
 * 15. 购买横幅（原 jZt…UZt，js 190700–191010 / jsx 153690–153926）
 * ==========================================================================*/

/** 原 jZt（js 190700）：断开 → 登录；其余 → 购买 */
export function resolvePurchaseIntent(status: string): `login` | `purchase` {
  return status === `disconnected` ? `login` : `purchase`;
}

type BannerPriceState = { kind: "price"; price: number; currency: string } | { kind: "soldOut" } | null;

interface BannerCardModel {
  key: string;
  label: string;
  description: string;
  metric: string | null;
  metricUnit: string | null;
  priceState: BannerPriceState;
  billingDiscountConfig: BillingDiscountConfig | undefined;
  className: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  iconClassName: string;
  onClick: () => void;
}

/** 原 MZt（js 190703）：购买横幅（startPlan/personal/team 分组卡 × 渐变底 + 价格态 + 折扣徽章） */
export function CodingPlanPurchaseBanner(props: {
  providerId: string;
  startPlanPreview?: StartPlanPreview | null;
  personalVisible?: boolean;
  teamVisible?: boolean;
  soldOutVisible?: boolean;
  accountDisconnected?: boolean;
  onSelect: (audience: "personal" | "team", opts?: { eventText?: string; initialTeamPlanKey?: string }) => void;
  onSelectStartPlan: () => void;
}): React.ReactElement {
  const {
    providerId,
    startPlanPreview = null,
    personalVisible = true,
    teamVisible = true,
    soldOutVisible = false,
    accountDisconnected = false,
    onSelect,
    onSelectStartPlan,
  } = props;
  const { intl, locale } = useIntlContext();
  const billingDiscount = useBillingDiscount();
  const startPlanSummary = startPlanPreview ? startPlanPreviewSummary(startPlanPreview, intl, locale) : null;
  const resolvedProviderId = productsProviderIdOfBanner(providerId);
  const products = useCodingPlanProducts(resolvedProviderId, { remotePreviewEnabled: false });
  const enterpriseProducts = useEnterpriseTeamProducts({ enabled: soldOutVisible && teamVisible && resolvedProviderId === PROVIDER_IDS.bigmodelCodingPlan, authenticated: true });
  const formatMessageWithFallback = useMessageFormatter(intl);
  const personalPriceState = resolveBannerPriceState({
    providerId: resolvedProviderId,
    audience: `personal`,
    products: products.snapshot?.productList ?? [],
    soldOutVisible,
  });
  const teamPriceState = resolveBannerPriceState({
    providerId: resolvedProviderId,
    audience: `team`,
    products: products.snapshot?.productList ?? [],
    soldOutVisible,
  });
  const enterpriseTeamGroups = React.useMemo(
    () => enterpriseTeamGroupsOf(enterpriseProducts.snapshot?.productList ?? [], { locale, formatMessage: formatMessageWithFallback }),
    [enterpriseProducts.snapshot?.productList, formatMessageWithFallback, locale]
  );
  const hasSubscribedTeamPlan = hasSubscribedProduct(enterpriseProducts.snapshot?.productList ?? []);
  const genericTeamVisible = shouldShowGenericTeamCard({
    teamVisible,
    enterpriseTeamGroupCount: enterpriseTeamGroups.length,
    enterpriseProductsLoading: enterpriseProducts.loading,
    authenticatedEnterpriseProductsEnabled: soldOutVisible && resolvedProviderId === PROVIDER_IDS.bigmodelCodingPlan,
    hasSubscribedTeamPlan,
  });
  const startPlanTitle = resolveStartPlanTitle({
    fallbackTitle: intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchaseBanner.startPlanTitle` }),
    locale,
    remoteTitle: startPlanPreview?.name,
  });
  const cards: BannerCardModel[] = [
    ...(startPlanPreview && startPlanSummary
      ? [
          {
            key: `startPlan`,
            label: startPlanTitle,
            description: startPlanSummary.detailsDescription,
            metric: startPlanSummary.grantUnitsLabel,
            metricUnit: startPlanSummary.unitLabel,
            priceState: null,
            billingDiscountConfig: void 0,
            className: PURCHASE_CARD_CLASS_START_PLAN,
            Icon: AstroidIcon,
            iconClassName: `text-success`,
            onClick: onSelectStartPlan,
          },
        ]
      : []),
    ...(personalVisible
      ? [
          {
            key: `personal`,
            label: intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchaseBanner.personalTitle` }),
            description: intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchaseBanner.personalDescription` }),
            metric: null,
            metricUnit: null,
            priceState: personalPriceState,
            billingDiscountConfig: bannerDiscountConfigOf({
              audience: `personal`,
              accountDisconnected,
              billingDiscountActive: billingDiscount.active,
              billingDiscountConfig: billingDiscount.config,
            }),
            className: PURCHASE_CARD_CLASS_PERSONAL,
            Icon: AstroidIcon,
            iconClassName: `text-[#4099ff]`,
            onClick: () => onSelect(`personal`),
          },
        ]
      : []),
    ...(teamVisible && !hasSubscribedTeamPlan && enterpriseTeamGroups.length > 0
      ? enterpriseTeamGroups.map((group) => ({
          key: `team:${group.key}`,
          label: group.title,
          description: intl.formatMessage({ id: teamDescriptionIdOf(group.key) }),
          metric: null,
          metricUnit: null,
          priceState: resolveTeamGroupPriceState(group),
          billingDiscountConfig: void 0,
          className: teamCardClassOf(group.key),
          Icon: UsersIcon,
          iconClassName: teamIconClassOf(group.key),
          onClick: () => onSelect(`team`, { initialTeamPlanKey: group.key, eventText: group.title }),
        }))
      : []),
    ...(genericTeamVisible
      ? [
          {
            key: `team`,
            label: intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchaseBanner.teamTitle` }),
            description: intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchaseBanner.teamDescription` }),
            metric: null,
            metricUnit: null,
            priceState: teamPriceState,
            billingDiscountConfig: bannerDiscountConfigOf({
              audience: `team`,
              accountDisconnected,
              billingDiscountActive: billingDiscount.active,
              billingDiscountConfig: billingDiscount.config,
            }),
            className: PURCHASE_CARD_CLASS_TEAM,
            Icon: UsersIcon,
            iconClassName: `text-warning`,
            onClick: () => onSelect(`team`),
          },
        ]
      : []),
  ];
  return (
    <div className={`space-y-3`}>
      {cards.map((card) => (
        <button key={card.key} type={`button`} className={card.className} onClick={card.onClick}>
          <span className={`flex min-w-0 items-start gap-3`}>
            <card.Icon className={`mt-1 size-4 shrink-0 ${card.iconClassName}`} />
            <span className={`min-w-0 flex-1`}>
              <span className={`flex min-w-0 flex-wrap items-center gap-2`}>
                <span className={`text-ui-lg font-medium leading-6 text-foreground`}>{card.label}</span>
                {card.billingDiscountConfig ? (
                  <BillingDiscountBadgeWithInfo config={card.billingDiscountConfig} size={`compact`} />
                ) : null}
              </span>
              {card.metric ? (
                <span className={`mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5`}>
                  <span className={`text-2xl font-bold leading-none text-foreground`}>{card.metric}</span>
                  {card.metricUnit ? (
                    <span className={`text-ui-base font-medium text-foreground-subtle`}>{card.metricUnit}</span>
                  ) : null}
                </span>
              ) : null}
              {card.priceState?.kind === `price` ? (
                <PriceFromLabel price={card.priceState.price} currency={card.priceState.currency} locale={locale} />
              ) : card.priceState?.kind === `soldOut` ? (
                <span className={`mt-1 block text-lg font-semibold leading-6 text-foreground`}>
                  {intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchaseBanner.temporarilySoldOut` })}
                </span>
              ) : null}
              <span className={`mt-0.5 block text-ui-base leading-5 text-foreground-subtle`}>{card.description}</span>
            </span>
            <span className={`flex h-6 shrink-0 items-center`}>
              <ArrowRightIcon className={`size-4 text-foreground-subtle`} />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

/** 原 NZt（js 190913）：通用团队卡可见（无分组、非订阅、非加载中） */
function shouldShowGenericTeamCard(opts: {
  teamVisible: boolean;
  enterpriseTeamGroupCount: number;
  enterpriseProductsLoading: boolean;
  authenticatedEnterpriseProductsEnabled: boolean;
  hasSubscribedTeamPlan?: boolean;
}): boolean {
  const { teamVisible, enterpriseTeamGroupCount, enterpriseProductsLoading, authenticatedEnterpriseProductsEnabled, hasSubscribedTeamPlan = false } = opts;
  if (!teamVisible || hasSubscribedTeamPlan || enterpriseTeamGroupCount > 0) return false;
  if (authenticatedEnterpriseProductsEnabled && enterpriseProductsLoading) return false;
  return true;
}

/** 原 PZt（js 190922）：任一产品已订阅 */
function hasSubscribedProduct(products: CodingPlanProduct[]): boolean {
  return products.some((product) => product.subscribed === true);
}

/** 原 FZt（js 190925）：max/advanced → teal 卡，否则 sky 卡 */
function teamCardClassOf(groupKey: string): string {
  const lowered = groupKey.trim().toLowerCase();
  return lowered === `max` || lowered.includes(`advanced`) ? PURCHASE_CARD_CLASS_TEAM_ADVANCED : PURCHASE_CARD_CLASS_TEAM;
}

/** 原 IZt（js 190929）：max/advanced → teal 图标色，否则 sky */
function teamIconClassOf(groupKey: string): string {
  const lowered = groupKey.trim().toLowerCase();
  return lowered === `max` || lowered.includes(`advanced`) ? `text-[#14b8a6]` : `text-[#0ea5e9]`;
}

/** 原 LZt（js 190933）：团队描述 i18n（advanced/standard） */
function teamDescriptionIdOf(groupKey: string): string {
  const lowered = groupKey.trim().toLowerCase();
  return lowered === `max` || lowered.includes(`advanced`)
    ? `settings.modelProvider.codingPlan.purchaseBanner.teamAdvancedDescription`
    : `settings.modelProvider.codingPlan.purchaseBanner.teamStandardDescription`;
}

/** 原 RZt（js 190939）：横幅折扣配置（personal 恒给；team 仅断连时给） */
function bannerDiscountConfigOf(opts: {
  audience: "personal" | "team";
  accountDisconnected: boolean;
  billingDiscountActive: boolean;
  billingDiscountConfig: BillingDiscountConfig | undefined;
}): BillingDiscountConfig | undefined {
  if (opts.billingDiscountActive && (opts.audience === `personal` || (opts.audience === `team` && opts.accountDisconnected)))
    return opts.billingDiscountConfig;
  return undefined;
}

/** 原 zZt（js 190947）：产品源供应商（start → coding 映射；无映射原样） */
function productsProviderIdOfBanner(providerId: string): string {
  return productsProviderIdOf(providerId) ?? providerId;
}

/** 原 BZt（js 190950）：横幅价格态（personal：最低在售价；全售罄 → soldOut；bigmodel 缺省 49/598） */
function resolveBannerPriceState(opts: {
  providerId: string;
  audience: "personal" | "team";
  products: CodingPlanProduct[];
  soldOutVisible?: boolean;
}): BannerPriceState {
  const { providerId, audience, products, soldOutVisible = true } = opts;
  if (audience === `personal`) {
    const cheapest = products
      .map((product) => ({ product, price: productPriceOf(product) }))
      .filter((entry) => entry.product.soldOut !== true && typeof entry.price == `number` && entry.price > 0)
      .sort((a, b) => (a.price as number) - (b.price as number))[0];
    if (cheapest)
      return {
        kind: `price`,
        price: cheapest.price as number,
        currency: cheapest.product.priceCurrency ?? (providerId === PROVIDER_IDS.bigmodelCodingPlan ? `CNY` : `USD`),
      };
    if (soldOutVisible && products.length > 0 && products.every((product) => product.soldOut === true)) return { kind: `soldOut` };
  }
  if (providerId === PROVIDER_IDS.bigmodelCodingPlan)
    return { kind: `price`, price: audience === `team` ? 598 : 49, currency: `CNY` };
  return null;
}

/** 原 VZt（js 190968）：团队分组价格态（组内最低价；缺省 null） */
function resolveTeamGroupPriceState(group: { products: CodingPlanProduct[] }): BannerPriceState {
  const cheapest = group.products
    .map((product) => ({ product, price: productPriceOf(product) }))
    .filter((entry) => typeof entry.price == `number` && entry.price > 0)
    .sort((a, b) => (a.price as number) - (b.price as number))[0];
  return cheapest ? { kind: `price`, price: cheapest.price as number, currency: cheapest.product.priceCurrency ?? `CNY` } : null;
}

/** 原 HZt（js 190975）：Start Plan 标题（zh 下远端 `start plan` 原文 → 回退本地文案） */
function resolveStartPlanTitle(opts: { fallbackTitle: string; locale: string; remoteTitle?: string }): string {
  const title = opts.remoteTitle?.trim() || opts.fallbackTitle;
  return opts.locale.startsWith(`zh`) && /^start\s+plan$/i.test(title) ? opts.fallbackTitle : title;
}

/** 原 UZt（js 190979）：起价标签（非 zh：`from $X`；zh：`¥X 起` 拆段） */
function PriceFromLabel(props: { price: number; currency: string; locale: string }): React.ReactElement {
  const { price, currency, locale } = props;
  const { intl } = useIntlContext();
  const formatted = formatProductPrice(price, currency, locale);
  if (!locale.toLowerCase().startsWith(`zh`))
    return (
      <span className={`mt-1 block text-lg font-semibold leading-6 text-foreground`}>
        {intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.fromPrice` }, { price: formatted })}
      </span>
    );
  const [amount, ...rest] = formatted.split(` `);
  const suffix = rest.join(` `).trim();
  return (
    <span className={`mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5`}>
      <span className={`text-lg font-semibold leading-6 text-foreground`}>{amount}</span>
      <span className={`text-ui-base font-medium text-foreground-subtle`}>
        {[suffix, intl.formatMessage({ id: `settings.modelProvider.codingPlan.purchase.fromPriceSuffix` })].filter(Boolean).join(` `)}
      </span>
    </span>
  );
}

/* ============================================================================
 * 16. 状态标题/导航轨（原 WZt…tQt，js 191011–191288 / jsx 153927–154090）
 * ==========================================================================*/

/** 原 WZt（js 191011）：状态标题+描述卡 */
export function StatusTitleDescription(props: { title: string; description: string }): React.ReactElement {
  return (
    <div className={`rounded-xl border border-border bg-surface p-4`}>
      <div className={`text-ui-base font-medium text-foreground`}>{props.title}</div>
      <p className={`mt-1 text-ui-sm leading-6 text-foreground-subtle`}>{props.description}</p>
    </div>
  );
}

/** 原 GZt（js 191023）：三态 → 标题+描述（其余态 → null） */
export function statusTitleDescriptionOf(status: string, intl: IntlShape): { title: string; description: string } | null {
  if (status !== `disconnected` && status !== `notPurchased` && status !== `unavailable`) return null;
  return {
    title: intl.formatMessage({ id: `settings.modelProvider.codingPlan.status.${status}` }),
    description: intl.formatMessage({ id: `settings.modelProvider.codingPlan.description.${status}` }),
  };
}

/** 原 S7（js 191031）：可拖拽供应商 id（仅 custom/preset 且有 provider） */
function draggableProviderIdOf(item: ModelProviderNavItem): string | null {
  return (item.type === `custom` || item.type === `preset`) && item.provider ? item.provider.id : null;
}

/** 原 KZt（js 191034）：拖拽排序（active/over → arrayMove；无效 → 原序） */
function reorderProviderIds(opts: { activeProviderId: string; overProviderId: string; providerIds: string[] }): string[] {
  const from = opts.providerIds.indexOf(opts.activeProviderId);
  const to = opts.providerIds.indexOf(opts.overProviderId);
  if (from < 0 || to < 0 || from === to) return [...opts.providerIds];
  return arrayMove([...opts.providerIds], from, to);
}

/** 原 qZt（js 191039）：分组加载态（preset 组 → presetLoading；其余 → customLoading） */
function groupLoadingOf(opts: { groupId: string; presetLoading: boolean; customLoading: boolean }): boolean {
  return opts.groupId === `preset` ? opts.presetLoading : opts.customLoading;
}

/** 原 JZt（js 191042）：addCustom 项加载态 */
function addCustomLoadingOf(opts: { item: ModelProviderNavItem; customLoading: boolean }): boolean {
  return opts.item.type === `addCustom` ? opts.customLoading : false;
}

/** 原 YZt（js 191045）：导航项显示标签（preset → 族 label 覆盖） */
function navItemDisplayLabel(item: ModelProviderNavItem): string {
  if (item.type === `preset`) return familyOfPresetId(item.presetId ?? ``)?.label ?? item.label;
  return item.label;
}

/** 原 XZt（js 191048）：导航轨普通项（选中/加载/禁用/状态点；md 以下图标态） */
export function NavRailItem(props: {
  item: ModelProviderNavItem;
  label: string;
  selectedNodeKey: string | null;
  customLoading: boolean;
  onSelectNavItem: (item: ModelProviderNavItem) => void;
  showIcon?: boolean;
}): React.ReactElement {
  const { item, label, selectedNodeKey, customLoading, onSelectNavItem, showIcon = true } = props;
  const { intl } = useIntlContext();
  const selected = item.key === selectedNodeKey;
  const isCodingPlanLoading = item.type === `codingPlanLoading`;
  const itemLoading = addCustomLoadingOf({ item, customLoading });
  const idleClass =
    item.type === `addCustom`
      ? `border-transparent text-primary hover:border-border-hover/60 hover:text-primary`
      : `border-transparent text-foreground hover:border-border-hover/60`;
  return (
    <Tooltip title={label} side={`right`}>
      <button
        type={`button`}
        disabled={itemLoading || isCodingPlanLoading}
        aria-label={label}
        aria-selected={selected}
        data-state={selected ? `selected` : `idle`}
        data-testid={joinTestId(NAV_ITEM_TESTID_PREFIX, item.key)}
        onClick={() => {
          if (!isCodingPlanLoading) onSelectNavItem(item);
        }}
        className={`relative box-border flex h-8 w-full items-center gap-2 rounded-lg border px-2 py-1 text-left text-ui-base font-medium transition-colors max-md:size-8 max-md:justify-center max-md:gap-0 max-md:px-0 ${selected ? `border-border-hover bg-card-selected text-foreground` : idleClass} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isCodingPlanLoading ? (
          <SpinnerIcon className={`size-4 shrink-0 animate-spin text-foreground-subtlest`} />
        ) : showIcon ? (
          <span className={`shrink-0 text-current`}>{navItemIcon(item)}</span>
        ) : null}
        <span className={`flex min-w-0 flex-1 items-center gap-1.5 max-md:sr-only`}>
          <span className={`min-w-0 truncate`}>{label}</span>
        </span>
        {`statusActive` in item ? (
          <CircleIcon
            aria-label={intl.formatMessage({
              id: item.statusActive ? `settings.modelProvider.enabledStatus` : `settings.modelProvider.disabledStatus`,
            })}
            className={`size-2 shrink-0 fill-current max-md:absolute max-md:right-1 max-md:bottom-1 max-md:rounded-full max-md:ring-2 max-md:ring-card ${item.statusActive ? `text-success` : `text-foreground-subtlest`}`}
          />
        ) : null}
      </button>
    </Tooltip>
  );
}

/** 原 ZZt（js 191102）：Enter/Space 键选中 */
function handleNavRailItemKey(opts: {
  event: React.KeyboardEvent;
  item: ModelProviderNavItem;
  onSelectNavItem: (item: ModelProviderNavItem) => void;
}): void {
  if (opts.event.key !== `Enter` && opts.event.key !== ` `) return;
  opts.event.preventDefault();
  opts.onSelectNavItem(opts.item);
}

/** 原 QZt（js 191105）：导航轨可拖拽项（dnd-kit；grip 手柄悬停显现；拖拽态半透明） */
export function NavRailDraggableItem(props: {
  item: ModelProviderNavItem;
  label: string;
  selectedNodeKey: string | null;
  onSelectNavItem: (item: ModelProviderNavItem) => void;
  dragLabel: string;
}): React.ReactElement {
  const { item, label, selectedNodeKey, onSelectNavItem, dragLabel } = props;
  const { intl } = useIntlContext();
  const providerId = draggableProviderIdOf(item);
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useDraggable({
    id: providerId ?? item.key,
    disabled: !providerId,
  });
  const dragStyle = { transform: dndTransform.Transform.toString(transform), transition };
  const selected = item.key === selectedNodeKey;
  return (
    <Tooltip title={label} side={`right`}>
      <div
        ref={setNodeRef}
        style={dragStyle}
        role={`button`}
        tabIndex={0}
        aria-label={label}
        aria-selected={selected}
        data-state={selected ? `selected` : `idle`}
        data-testid={joinTestId(NAV_ITEM_TESTID_PREFIX, item.key)}
        onClick={() => onSelectNavItem(item)}
        onKeyDown={(event) => handleNavRailItemKey({ event, item, onSelectNavItem })}
        className={`group relative box-border flex h-8 w-full items-center gap-2 rounded-lg border px-2 py-1 text-left text-ui-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 max-md:size-8 max-md:justify-center max-md:gap-0 max-md:px-0 ${selected ? `border-border-hover bg-card-selected text-foreground` : `border-transparent text-foreground hover:border-border-hover/60`} ${isDragging ? `z-20 opacity-70` : ``}`}
      >
        <button
          ref={setActivatorNodeRef}
          type={`button`}
          aria-label={dragLabel}
          className={`relative flex size-4 shrink-0 items-center justify-center text-foreground-subtlest hover:text-foreground focus-visible:outline-none`}
          onClick={(event) => event.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <span className={`absolute inset-0 flex items-center justify-center text-foreground opacity-100 transition-opacity group-hover:opacity-0`}>
            {navItemIcon(item)}
          </span>
          <GripVerticalIcon className={`size-4 opacity-0 transition-opacity group-hover:opacity-100`} />
        </button>
        <span className={`flex min-w-0 flex-1 items-center gap-1.5 max-md:sr-only`}>
          <span className={`min-w-0 truncate`}>{label}</span>
        </span>
        {`statusActive` in item ? (
          <CircleIcon
            aria-label={intl.formatMessage({
              id: item.statusActive ? `settings.modelProvider.enabledStatus` : `settings.modelProvider.disabledStatus`,
            })}
            className={`size-2 shrink-0 fill-current max-md:absolute max-md:right-1 max-md:bottom-1 max-md:rounded-full max-md:ring-2 max-md:ring-card ${item.statusActive ? `text-success` : `text-foreground-subtlest`}`}
          />
        ) : null}
      </div>
    </Tooltip>
  );
}

/** 原 $Zt（js 191171）：非拖拽分组（preset 组） */
function NavRailGroup(props: {
  group: ModelProviderNavigationGroup;
  selectedNodeKey: string | null;
  onSelectNavItem: (item: ModelProviderNavItem) => void;
}): React.ReactElement {
  return (
    <div className={`flex flex-col gap-2 max-md:items-center max-md:gap-1`}>
      {props.group.items.map((item) => (
        <NavRailItem
          key={item.key}
          item={item}
          label={navItemDisplayLabel(item)}
          selectedNodeKey={props.selectedNodeKey}
          customLoading={false}
          onSelectNavItem={props.onSelectNavItem}
        />
      ))}
    </div>
  );
}

/** 原 eQt（js 191183）：导航轨根（分组标题+加载；preset 组静态；其余组 dnd-kit 排序，距离 6px 触发） */
export function ModelProviderNavRail(props: {
  navigationGroups: ModelProviderNavigationGroup[];
  selectedNodeKey: string | null;
  presetLoading: boolean;
  customLoading: boolean;
  onSelectNavItem: (item: ModelProviderNavItem) => void;
  onReorderProviderIds?: (providerIds: string[]) => void;
}): React.ReactElement {
  const { navigationGroups, selectedNodeKey, presetLoading, customLoading, onSelectNavItem, onReorderProviderIds } = props;
  const { intl } = useIntlContext();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  return (
    <aside className={`border-r border-border px-1.5 py-3 md:py-2 md:px-2`}>
      <div className={`flex min-h-0 flex-col gap-3 max-md:gap-1`}>
        {navigationGroups.map((group) => (
          <div key={group.id} className={`flex flex-col gap-2 max-md:gap-1`}>
            <div className={`flex h-7 items-center justify-between px-2 py-1 max-md:hidden`}>
              <h3 className={`text-ui-sm font-semibold text-foreground-subtlest`}>{group.title}</h3>
              {groupLoadingOf({ groupId: group.id, presetLoading, customLoading }) ? (
                <SpinnerIcon className={`size-3 animate-spin text-foreground-subtlest`} />
              ) : null}
            </div>
            {group.items.length === 0 ? (
              <p className={`px-2 py-1 text-center text-ui-base text-foreground-subtlest`}>{`-`}</p>
            ) : null}
            {group.id === `preset` ? (
              <NavRailGroup group={group} selectedNodeKey={selectedNodeKey} onSelectNavItem={onSelectNavItem} />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenterCollision}
                onDragEnd={(event) => {
                  const activeId = String(event.active.id);
                  const overId = event.over ? String(event.over.id) : ``;
                  if (!overId || activeId === overId) return;
                  const reordered = reorderProviderIds({
                    activeProviderId: activeId,
                    overProviderId: overId,
                    providerIds: group.items.flatMap((item) => {
                      const providerId = draggableProviderIdOf(item);
                      return providerId ? [providerId] : [];
                    }),
                  });
                  onReorderProviderIds?.(reordered);
                }}
              >
                <SortableContext
                  items={group.items.flatMap((item) => {
                    const providerId = draggableProviderIdOf(item);
                    return providerId ? [providerId] : [];
                  })}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={`flex flex-col gap-1 max-md:items-center`}>
                    {group.items.map((item) =>
                      draggableProviderIdOf(item) ? (
                        <NavRailDraggableItem
                          key={item.key}
                          item={item}
                          label={item.label}
                          selectedNodeKey={selectedNodeKey}
                          onSelectNavItem={onSelectNavItem}
                          dragLabel={intl.formatMessage({ id: `settings.modelProvider.reorderProvider` })}
                        />
                      ) : (
                        <NavRailItem
                          key={item.key}
                          item={item}
                          label={item.label}
                          selectedNodeKey={selectedNodeKey}
                          customLoading={customLoading}
                          onSelectNavItem={onSelectNavItem}
                        />
                      )
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

/** 原 tQt（js 191286）：分区刷新态（preset || custom） */
export function isProviderSectionRefreshing(opts: { presetLoading: boolean; customLoading: boolean }): boolean {
  return opts.presetLoading || opts.customLoading;
}
