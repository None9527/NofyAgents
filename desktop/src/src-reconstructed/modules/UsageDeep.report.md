# UsageDeep 模块抽取报告（F12 用量深层 · D8 Stage B4 · B4-1 第 2 项）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**，md5 `c9d0d675d0b858e6e7711df3e9122e81`）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/UsageDeep.tsx`（6,353 行）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 前序：`SettingsPanels.report.md` §1.1/§7（接口级登记）、`Stores.report.md`、`COVERAGE-LEDGER.md` §c.1 第 2 行；标样 `TopBar.tsx`
- 范围对应 COVERAGE-LEDGER B4-1 #2 的**第一符号组**：`u7/CXt/v7/nZt/rZt/x7/yZt/bZt/MZt/WZt/eQt/tQt`（供应商卡群深叶）+ `q$t/J$t`（用量数据层）+ `s3e/v3e`（配额标签）；第二符号组（`zet/Zet/e5e/Xrt/Zrt/Mq/xnt` 支付深部 77080–90180）仍为接口级，见 §7。

---

## 0. 行号口径与只读核验

与 MODULE-MAP/SettingsPanels 报告一致：所有范围以 **输入 .js** 为准（闭区间），附 jsx 双行号。
本次锚点逐条命中：`u7` js **188376** / jsx **151911** ✅、`rZt` js **189675** / jsx **152873** ✅、
`MZt` js **190703** / jsx **153693** ✅、`q$t` js **195179** / jsx **156996** ✅、`J$t` js **195206** / jsx **157047** ✅、
`s3e` js **76246** / jsx **67506** ✅、`v3e` js **76492** / jsx **67671** ✅、`$j` js **52449** / jsx **47188** ✅。
`out/` 只读核验：会话内对 `out/` 仅有读取操作（read_file/sed/grep）；行数 213,695 不变，
md5 `c9d0d675d0b858e6e7711df3e9122e81` 与前序报告记录一致。

---

## 1. 抽取的符号清单（混淆名 → 语义名 → 行号）

### 1.1 用量数据 hook（js 195171–195258 / jsx 156988–157118）——实体化 SettingsPanelsData 的 q$t/J$t 声明

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `K$t` | usageErrorOf | 195171 | 156988 | Error/message 对象 → 消息字符串 |
| `q$t` | useAppUsageStats | 195179 | 156996 | `usageStatsService.getAppUsageSnapshot({range,timeZone})`；序号防竞态；刷新保留旧快照；`[useAppUsageStats] 读取本地使用统计失败` |
| `J$t` | useCodingPlanUsageStats | 195206 | 157047 | `getCodingPlanUsageSnapshot({range,preferredProviderId,organizationId,projectId,timeZone})`；源键 `providerId\0org\0project` 变更 → 清快照，同键保留 |

### 1.2 订阅权益数据层（js 52266–52745 / jsx 47016–47522）——实体化 SettingsPanelsData 的 $j 声明

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `uUe/dUe` | USAGE_ENTITLEMENT_CACHE_PREFIX/_TTL_MS | 52266 | 47016 区 | `zcode:usage-entitlement:` / 600s |
| `zj/Bj` | entitlementCacheStorage/entitlementFreshnessKey | 52268/52270 | — | localStorage 守卫；`前缀+id:指纹` 键 |
| `fUe/pUe` | read/writeCachedEntitlementSnapshot | 52276/52292 | 47024/47040 | TTL 过期清除；静默写 |
| `mUe/hUe/Vj/Hj` | 轮询/宽限/退避常量 | 52299 | — | 5min/30min/10s/[30,60,120,300]s |
| `Uj/Wj/Gj` | 快照缓存/监听集/失败表 | 52302 | — | WeakMap×3（按服务） |
| `Kj/gUe` | entitlementOptionsKey/entitlementFreshnessKeyOf | 52306/52317 | 47056/47067 | 选项 JSON 稳定键 |
| `qj/Jj/_Ue/vUe` | snapshotCacheOf/failureCacheOf/get/setCachedSnapshot | 52320–52331 | 47073–47084 | 写入时广播监听集 |
| `yUe/bUe` | recordFailureBackoff/subscribeCachedSnapshots | 52340/52352 | 47094/47110 | 阶梯退避；空集/空表回收 |
| `Yj/xUe/Xj` | freshCachedSnapshot/isFailureBackoffActive/isDocumentVisible | 52366/52370/52373 | 47118/47122/47126 | 新鲜度/退避/可见性 |
| `SUe/CUe/wUe` | earliestNextResetTimeOf/resolveEntitlementStatus/shouldApplyRefreshResult | 52375/52383/52393 | 47129/47133/47136 | 最早重置时间；active/none/unavailable/unknown；reason×status 过滤 |
| `Zj/TUe/Qj` | 初始态/超时 20s/in-flight 去重表 | 52401 | 47141 区 | |
| `EUe/DUe/OUe/kUe` | dedupedGetEntitlementSnapshot/entitlementErrorOf/entitlementTimeoutError/withTimeout | 52406–52436 | 47147–47177 | 单飞去重；`usage_entitlement_request_timeout:${ms}`；Promise.race |
| `$j` | useSubscriptionSnapshot | 52449 | 47188 | 薄包装（服务取自 useBaseServices） |
| `eM` | useUsageEntitlementCore | 52451 | 47191 | 主 hook：缓存命中→静默校验/强制首读、可见性轮询、重置唤醒（+10s 宽限，≤2^31-1）、跨实例广播；日志 `[useUsageEntitlement]`×3 |
| `tM/nM/rM/jUe` | nullSafe/providerApiKeyFingerprint/providerCacheKey/hashApiKey | 52597–52620 | 47395–47416 | rM = `zcode:usage-entitlement:<id>:<len:hash36>`（jsx 47401，与 SettingsPanelsData 登记对上） |
| `iM/AUe/aM` | hasActiveEntitlement/isNoPlanEntitlement/shouldProbeStartPlanEntitlement | 52604/52608/52612 | 47407/47410/47413 | |
| `oM…NUe` | 供应商源注册表模块态 + fM/pM/mM/hM/MUe/NUe | 52626–52662 | 47420–47446 | 源列表/已加载/失效计数/单飞槽×2/监听集 |
| `gM/_M` | refreshCodingPlanSourcesForced/ensureCodingPlanSources | 52665/52681 | 47449/47462 | 单飞合并刷新 |
| `PUe` | useProviderFamilyConnectionSettings | 52694 | 47475 | 双权益（codingPlan/startPlan，aM 门控）→ jee 连接设置解析器 |
| `vM/yM/FUe` | providerFamiliesOfListWrapper/activeProvidersOfList/hasNoUserOrProviders | 52739–52744 | 47516–47522 | jte/kr 薄包装（**逐字**：对 kr 结果直接取反） |

### 1.3 计费折扣簇（js 51857–52041 / jsx 46612–46764）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `zHe/BHe/VHe/lj/uj` | TTL 1h/对话框类名×2/缓存槽 | 51857 | 46612 | |
| `dj/fj` | useBillingDiscount/useBillingDiscountCore | 51862/51865 | 46617/46620 | `codingPlanSubscriptionService.getBillingDiscount`；日志 `[CodingPlanBillingDiscount]` |
| `pj/mj/vj` | localizedDiscountCopyOf/hasDiscountCopy/nonEmptyTrimmed | 51881 区/51891 区/52036 | 46668/46678/46764 | locale → 5 字段文案 |
| `hj/gj/HHe/_j` | BillingDiscountBadge/BadgeWithInfo/Card/InfoDialog | 51911/51932/51946/51986 | 46646 区/46660 区/46704/46718 | gradient/surface/tag 三变体；markdown 信息对话框（主题取设置 store） |
| `UHe` | getCachedBillingDiscount | 52025 | 46752 区 | 1h TTL + 单飞 |

### 1.4 配额助手 + 侧栏计划件（js 76101–76563 / jsx 67394–67700 区）——实体化 SettingsPanelsData 的 Sq/Cq/wq/$4e 声明

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `Sq/Cq/$4e/wq` | findQuotaLimit/quotaPercent/formatQuotaUsage/formatQuotaResetTime | 76101/76104/76108/76115 | 67394/67397/67400/67406 | 三键查找；剩余→已用换算；`--`/`NN%`；date/dateTime（compactToday） |
| `e3e/t3e/Tq` | bigmodel/zai logo dataURI 表 + RegionLogo | 76133/76135 | 67426/67431 | 两段 dataURI **自源码逐字拼入**（3,344/2,349 字符）；缺省 log-in 图标 |
| `n3e/Eq/Dq` | codingPlanProviderFallbackName/entitlementSourceId/hasActiveEntitlementForProvider | 76158/76161/76163 | 67437/67440/67443 | |
| `Oq/r3e/i3e` | resolvePlanWidgetModel/planWidgetGridCols/hasPlanWidgetModel | 76168/76227/76230 | 67446/67476/67479 | 多源权益 → 展示模型（选中活跃优先/任一活跃/标签回退链） |
| `a3e/o3e` | formatResetTimeHm/PlanWidgetLimitRow | 76232/76241 | 67482/67494 | |
| `s3e` | SidebarCodingPlanWidget | 76246 | 67506 | 侧栏 Coding Plan 件：标题+折扣徽章+用量入口+5h/周/月 MCP 网格；`sidebar.usage.plan.*` 12 key |
| `kq` | modelDisplayName | 76370 | 67594 | GLM-* 保留；turbo→Turbo；GLM/API/MCP/AI 大写；词首大写 |
| `c3e/l3e/u3e` | limitTotalOf/limitRemainingOf/formatUsedPercent | 76398/76401/76403 | 67600/67603/67606 | |
| `d3e/f3e/p3e/m3e/h3e/g3e/_3e` | startPlanNextResetTimeOf/formatResetDateTimeCompact/normalizeStartPlanModelCode/limitModelLabel/visibleStartPlanLimits/hasStartPlanBalance/StartPlanBalanceRow | 76413–76458 区 | 67613–67659 区 | |
| `v3e` | SidebarStartPlanWidget | 76492 | 67671 | 侧栏 Start Plan 余额件：升级按钮（折扣渐变态）+限额网格 |

### 1.5 供应商环境/内网探测助手（js 187188–187304 / jsx 151029–151160）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `i7/aYt` | trimmedOrUndefined/effectiveEnvOverlay | 187289/187293 | 151029/151033 | 3.7.6 三注入点恒空 |
| `oYt/sYt/cYt/lYt/uYt/dYt/fYt/pYt/mYt/a7` | 探测常量 800/2/22/3 + 钳制×3 + 目标归一化 + 配置键 + 序号相等 | 187304–187359 | 151044 区 | tcp 端口缺省 22，超时 100–10000 |
| `hYt` | useIntranetProbe | 187362 | 151099 | `systemService.probeIntranet`；日志 `[IntranetProbe] 内网探测失败` |
| `gYt` | useZapiEnabled | 187296 | 151138 | 实体化 SettingsPanels 的 useZapiEnabled 声明（Ene/Mee/xte/hi 接口级） |

### 1.6 供应商草稿/模型机制（js 187305–187630 / jsx 151161–151416）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `_Yt/vYt/yYt/bYt/xYt/SYt` | API_FORMATS/endpointsOfFormatSingle/firstKnownFormatOf/baseUrlOfDraft/normalizeEndpointPath/endpointsOfFormats | 187305–187321 | 151161–151177 | |
| `CYt` | autoEnableApiKeyProviderDraft | 187331 | 151187 | apiKey 模式+系统禁用 → 启用草稿 |
| `wYt/TYt` | resolvedBaseUrlOf/endpointsPatchOf | 187340/187344 | 151201/151205 | |
| `o7/EYt` | providerDraftDiff/providerDraftOrSelf | 187345/187373 | 151218/151250 | 草稿差异（名/端点/格式/key/headers 清除）→ 变更或 null |
| `DYt/s7/OYt/c7/kYt/AYt/jYt` | MODEL_KINDS/filterKnownKinds/filterAllowedKinds/modelToDraft/parsePositiveInteger/validateModelDraft/selectOnFocus | 187376–187447 | 151263–151334 | 校验四字段 invalid/commit |
| `MYt` | ModelMetadataDialog | 187429 | 151337 | edit/add 双模；高级=最大输出；内置模型上下文只读（`si`）；add 态查询挂起禁用 |

### 1.7 供应商表单字段件（js 187631–187935 / jsx 151417–151650）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `NYt/PYt` | formatContextWindowCompact/GetApiKeyLink | 187631/187634 | 151417/151420 | locale 参数存在但实现固定 `en-US`（逐字） |
| `FYt` | ModelRow | 187649 | 151431 | id 输入+上下文徽章（`contextWindowBadgeLabel`）+测试（`testModel.*` 5 key）+编辑+删除 |
| `IYt` | ApiKeyInput | 187827 | 151553 | testid `Aee`；eye/eye-off 切换 |
| `LYt/RYt/l7/zYt/BYt/VYt` | API_FORMAT_LABELS/apiFormatTitleOf/API_FORMAT_OPTIONS/API_FORMAT_DEFAULT_PATHS/apiFormatOptionLabel/ApiFormatSelect | 187860–187895 | 151570–151604 | 3 格式×3 文案；`title (path)` |
| `HYt` | apiFormatOptionsOfProvider | 187914 | 151630 | 端点 kind ∩ 模型 kind → 格式 |
| `UYt/WYt/GYt/KYt/qYt` | PRESET_PROVIDER_ID_SET/CATALOG_SOURCE_ID/MODEL_LOOKUP_DEBOUNCE_MS/lookupMaxOutputTokens/isCustomizableProvider | 187922–187933 | 151638–151648 | `china-llm-zcode-dev`/300ms |

### 1.8 u7 子段（js 187936–188320 / jsx 151651–151854）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `JYt` | ProviderCardFormHeader | 187936 | 151651 | 名称内联编辑（IME 守卫）+状态徽章+启用/禁用+用量链接+删除 |
| `YYt` | ProviderConnectionSection | 188051 | 151688 | baseURL+格式（只读/编辑双态；预设厂隐藏格式） |
| `XYt` | ProviderApiKeySection | 188127 | 151715 | |
| `ZYt` | ApiKeyDisabledHint | 188161 | 151732 | info 图标 + `apiKeyDisabledHint` |
| `QYt` | newModelDraft | 188173 | 151743 | 缺省上下文 `kee` |
| `$Yt` | ProviderModelsSection | 188178 | 151753 | 列表+添加；目录 maxOutputTokens 300ms 防抖查询（`getCatalogProviders(china-llm-zcode-dev)`） |

### 1.9 u7 根与目录选择（js 188321–188881 / jsx 151855–152304）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `eXt/tXt/nXt/rXt` | cleanupSaveMode/isThenable/runDeleteWithGuard/resolveNameKeyAction | 188321–188346 | 151855–151883 | 删除守卫异步复位；IME 守卫 Enter/Escape |
| `iXt/aXt/oXt` | normalizeModelEntry/normalizeProviderModels/normalizeEndpointPaths | 188355–188363 | 151886–151898 | |
| `u7` | ProviderConfigCardForm | 188376 | 151911 | **卡群核心**：草稿引用+失焦/切换提交+卸载清理保存+删除守卫；日志 `[ModelProviderSection]`×3 |
| `sXt/cXt` | CatalogProviderIcon/CatalogProviderSelect | 188652/188658 | 152143/152148 | Popover+cmdk；`w-(--radix-popover-trigger-width) p-0` |
| `lXt/uXt/dXt…gXt` | newCustomProvider/CUSTOM_CATALOG_SOURCE_ID/控件 id ×6 | 188768–188788 | 152186–152205 | `model-provider-add-*` |
| `d7/f7` | newAddProviderDraft/AddFormFieldLabel | 188789/188801 | 152211/152223 | |
| `_Xt/vXt/p7/yXt` | defaultKindOfCatalogProvider/joinBaseUrlAndPath/catalogEndpointUrlOf/catalogProviderToCustom | 188808–188828 | 152229–152241 | id=`源:条目`；openai 双 kind 回退 |
| `bXt/m7/xXt/SXt` | primaryFormatOf/dedupeModelsById/retargetModelsToFormat/customDraftToProvider | 188851–188866 | 152266–152289 | |

### 1.10 CXt 与状态行件（js 188882–189189 / jsx 152305–152528）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `CXt` | AddCustomProviderDraftForm | 188882 | 152305 | 3.7.6 恒 custom 路（catalog 分支死代码保留，`resolveAddProviderMode` 注记）；日志 `[ModelProviderSection] 新建模型供应商失败` |
| `wXt/TXt` | PlanStatusRow/StartPlanStatusRow | 189113/189156 | 152453/152495 | 状态/续期/到期 · 管理 · 解绑（`·` 分隔） |

### 1.11 Coding Plan 状态/配额展示簇（js 189190–189649 / jsx 152529–152856）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `h7/g7` | StatusDotSeparator/StatusActionButton | 189190/189193 | 152529/152534 | |
| `EXt/DXt/OXt` | resolveRenewOrExpire/formatUtcShortDate/formatLocalShortDate | 189199/189205/189216 | 152541/152556/152569 | 同年省年；UTC/本地 |
| `kXt` | PlanLoginDisconnectButtons | 189226 | 152581 | |
| `AXt` | UpgradePlansButton | 189271 | 152605 | 折扣激活收起态 → 渐变胶囊+徽章+信息钮 |
| `jXt/MXt/NXt/PXt/FXt/IXt/LXt/RXt/zXt/BXt` | StartPlanPreviewCard/startPlanPreviewSummary/isVisibleModelUsageEntitlement/formatGrantUnits/formatGrantUnitsLocalized/entitlementDetailsDescription/groupEntitlementsByGrant/joinModelNames/entitlementUnitLabel/entitlementUnitText | 189309–189458 | 152628–152717 | 预览聚合：求和+分组（each/single）+daily/generic；en 紧凑长词形首大写；zh `、` |
| `VXt/HXt/UXt/WXt/GXt/KXt/qXt/JXt/YXt/XXt/ZXt/QXt/$Xt` | StartPlanBalanceCard/StartPlanLimitRowInternal/startPlanLimitKey/startPlanLimitTotal/startPlanLimitRemaining/formatRemainingPercent/formatLimitAmount/earliestRenewOrResetTime/formatResetTimeLabel/expireLabelOf/startPlanLimitName/normalizeStartPlanLimitModelCode/StartPlanBalanceCardEmbedded | 189463–189616 | 152722–152830 | 余额聚合：总量/剩余/百分比/进度/重置标签；`glm-5-turbo`→`GLM-5Turbo` |
| `eZt/tZt/_7` | BigModelUnregisteredHint/isBigModelUnregisteredError/USAGE_QUOTA_CARD_COLORS | 189619/189640/189649 | 152839/152851/152856 | 中英文未注册模式；3 色 CSS 变量 |

### 1.12 加载/空态 + rZt（js 189650–190190 / jsx 152857–153247）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `v7/nZt` | SectionLoadingPlaceholder/PresetEmptyState | 189650/189662 | 152857/152862 | |
| `rZt` | CodingPlanStatusSection | 189675 | 152873 | **状态区根**：36 props；标题/状态行/登录解绑/升级订阅/配额/预览/购买对话框编排 |
| `iZt/aZt/oZt` | resolvePlanCardTitle/isStartPlanLevel/isMaxPlanLevel | 189991/190002/190006 | 153094/153105/153109 | |
| `sZt/y7/cZt/lZt/uZt/dZt` | CodingPlanQuotaCardRow/quotaCardOrNull/hasVisibleQuotaLimits/isNumericQuotaLimit/genericQuotaLimitLabel/QuotaLimitCard | 190009–190094 | 153112–153178 | 5h/周/月 MCP 三卡（`TOKENS_LIMIT` 3/5、6；`TIME_LIMIT` 5/1）；缺省回退通用前 3 |
| `b7/fZt/pZt/mZt/hZt/gZt` | findQuotaLimitStrict/quotaUsedPercent/clampPercent0to100/formatQuotaPercent/quotaLimitModelsLabel/normalizeQuotaModelCode | 190140–190173 | 153201–153226 | b7=严格变体（与 Sq 同逻辑） |
| `_Zt/vZt` | resolveCodingPlanViewState/codingPlanViewStateOf | 190181/190188 | 153229/153240 | loginPending → checking 覆盖 |

### 1.13 卡壳/连接模式导航（js 190191–190378 / jsx 153248–153399）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `x7/yZt` | ProviderCardShell/ProviderCardHeader | 190191/190194 | 153248/153254 | logo+标题+徽章+尾随动作 |
| `bZt/xZt/SZt` | ConnectionModeNav/connectionModeOptionsOf/teamPlanLabelOrFallback | 190231/190307/190346 | 153271/153331/153376 | 选项序：startPlan 0 < codingPlan 10 < teamPlan 100+n < apiKey 1000；<2 隐藏；testid `gre`/`rre` |
| `CZt/wZt/TZt/EZt` | 购买卡渐变类名 ×4 | 190349 | 153379 | success/#4099ff/#0ea5e9/#14b8a6 径向渐变 |
| `DZt/OZt/kZt` | isPlanNavItem/isResolvedTeamPlanItem/mergeTeamPlanSnapshot | 190353/190356/190363 | 153383/153386/153389 | team-plan 导航项 × 订阅快照合并 |

### 1.14 购买横幅（js 190700–191010 / jsx 153690–153926）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `jZt` | resolvePurchaseIntent | 190700 | 153690 | disconnected→login，其余→purchase |
| `MZt` | CodingPlanPurchaseBanner | 190703 | 153693 | startPlan/personal/team 分组卡列；产品快照×2（`s5e`/`TY`）；企业分组（`HY`） |
| `NZt/PZt/FZt/IZt/LZt/RZt/zZt` | shouldShowGenericTeamCard/hasSubscribedProduct/teamCardClassOf/teamIconClassOf/teamDescriptionIdOf/bannerDiscountConfigOf/productsProviderIdOfBanner | 190913–190947 | 153827–153859 | max/advanced→teal；折扣：personal 恒给、team 仅断连 |
| `BZt/VZt` | resolveBannerPriceState/resolveTeamGroupPriceState | 190950/190968 | 153862/153888 | 最低在售价；全售罄→soldOut；bigmodel 缺省 **49/598 CNY** |
| `HZt/UZt` | resolveStartPlanTitle/PriceFromLabel | 190975/190979 | 153899/153907 | zh 下 `start plan` 原文回退；`¥X 起` 拆段 |

### 1.15 状态标题/导航轨（js 191011–191288 / jsx 153927–154090）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `WZt/GZt` | StatusTitleDescription/statusTitleDescriptionOf | 191011/191023 | 153927/153933 | 三态 → 标题+描述 |
| `S7/KZt/qZt/JZt/YZt` | draggableProviderIdOf/reorderProviderIds/groupLoadingOf/addCustomLoadingOf/navItemDisplayLabel | 191031–191045 | 153943–153957 | |
| `XZt/ZZt/QZt/$Zt` | NavRailItem/handleNavRailItemKey/NavRailDraggableItem/NavRailGroup | 191048–191171 | 153960–154035 | 普通项/可拖拽项（grip 悬停显现）；testid `Cr` 前缀 |
| `eQt` | ModelProviderNavRail | 191183 | 154042 | preset 组静态 + 其余组 dnd-kit 排序（距离 6px 触发） |
| `tQt` | isProviderSectionRefreshing | 191286 | 154088 | presetLoading \|\| customLoading |

---

## 2. i18n key / testid / 常量登记

- **i18n key**：源五区段（51857–52041、52266–52745、76101–76563、187188–191288、195171–195258）共 **80 个静态 key**，
  重建版 **80/80 全数命中、无增无减**（脚本比对）；动态 key 3 族逐字保留：
  `settings.modelProvider.modelMetadata.invalid.${field}`、`settings.modelProvider.codingPlan.status.${status}`、
  `settings.modelProvider.codingPlan.description.${status}`。key 族：`settings.modelProvider.*`（~45，
  含 `apiFormat.*`×9、`startPlan.*`×10、`codingPlan.*`×14、`purchaseBanner.*`×9、`testModel.*`×5、`connectionMode.*`×2）、
  `settings.usage.entitlement*`×3、`sidebar.usage.plan.*`×12、`chat.quota.action.upgrade`、`common.*`×3。
- **testid**：`Aee`（api-key 输入）、`dre/Vee`（模型输入/删除前缀）、`hte`（添加模型）、`gre`（连接模式触发）、
  `rre`（连接模式项前缀）、`Cr`（导航项前缀）——均为 src-HCld2afU.js 导出，经 `qr`（Xa）拼接，接口级声明。
- **常量**：`zcode:usage-entitlement:`、TTL 600s/3600s、轮询 5min/30min、退避 [30,60,120,300]s、请求超时 20s、
  重置宽限 10s、`usage_entitlement_request_timeout:`、`china-llm-zcode-dev`×2、`model-provider-add-*`×6、
  探测缺省 800/2/22/3、目录查询防抖 300ms、bigmodel 缺省价 49/598 CNY、3 段购买卡渐变类名、
  2 段 logo dataURI（3,344/2,349 字符逐字）、`[useAppUsageStats]`/`[useCodingPlanUsageStats]`/`[useUsageEntitlement]`×3/
  `[CodingPlanBillingDiscount]`/`[IntranetProbe]`/`[ModelProviderSection]`×4 日志文案。

---

## 3. 边界判定依据

1. **函数体边界**：以 jsx 顶层声明边界切分；每个符号的行号见 §1（js/jsx 双行号）。深叶区实际起点为
   **187188**（i7，u7 族环境助手）而非台账所记 188376——u7 的子段（JYt/$Yt 等 187936 起）与草稿机制
   （o7 等 187305 起）结构上属卡群，一并实体化；台账行号 188376–191288 为卡群**根件**范围，两者不冲突。
2. **归属切分**：187020–187187（ZJt…rYt useTabPersistence）属工作区标签持久化（F20/boot 消费 212940），
   **不在本批**；52042–52265（yj…Cj markdown 链接构造）属技能创建聊天域，**不在本批**；
   76564–77080（y3e/j3e/Mq 配额弹层与供应商选择）属 F12 主体深部，**接口级**（§7）。
3. **接口级判定**：跨域深部（zet 支付对话框 84412、MY/EY/s5e/TY/JY/HY/nJ/iJ 产品域、Znt/trt/srt/crt/PM/IM/xZ、
   src chunk 供应商/模型助手 17 个、skillStore jee/jte/kr/xn/en、dnd-kit/Radix 封装/图标块）保留 `declare` + 行号；
   与 SettingsPanels.tsx 既有声明的 props 面**逐一兼容**（u7/CXt/v7/nZt/rZt/x7/yZt/bZt/MZt/WZt/eQt/tQt 12 件）。
4. **死代码保留**：CXt 的 catalog 分支（3.7.6 恒 custom）与 `NYt` 的固定 en-US 实现按源码保留，
   以 `resolveAddProviderMode` 注释与参数下划线标注；`nXt` 零参调用 onDelete 的调用面以 cast 注释逐字保留。
5. **压缩器惯用法归一**：`typeof window > "u"` → `typeof window === "undefined"`（等价，报告登记）；
   逗号表达式展开为语句（与 TopBar 试点口径一致，无可观察差异）。

---

## 4. 外部依赖清单（跨 chunk）

| # | chunk | 提供的符号 |
|---|---|---|
| 1 | react / jsx-runtime | React、Suspense、jsx |
| 2 | utils-CEEH0K_K.js | `cn()`（Z） |
| 3 | button-laUijeDG.js | Button（X） |
| 4 | IntlProvider-C321H7m8.js | useIntlContext（G） |
| 5 | imeComposition-DEYFkwWm.js | usePlatformService（l）、Input（P）、Spinner（M=w）、Popover（T/h/x=n/a/i）、info 图标（p=Ht） |
| 6 | usageStatsUiParts-CiR7YEhh.js | Tooltip（Ia）、formatCompactNumber（ja=l） |
| 7 | logger-PFDwl5Yq.js | logger（J） |
| 8 | src-HCld2afU.js | ot/hr/Vi/nt/Vr/Qr/Lt/Pi/Mn/lt/si/kee/Bn/Ri/Sr/Zt/qr/q/Knt/hi + testid Aee/dre/Vee/hte/gre/rre/Cr |
| 9 | skillStore-BmeKHDBI.js | jee/jte/kr/xn/en |
| 10 | 本 chunk vendored 原语 | Dialog（31943–32034）、Command/cmdk（32092–32175）、Select（46009–46072）、Collapsible（94925–94931）、dnd-kit（91811–94695）、图标块（26575–28020） |
| 11 | 本 chunk 跨域（接口级） | zet（84412）、MY（84254）、EY（83767）、s5e（80321）、TY（83697）、JY（87715）、HY（87595）、nJ（79685）、iJ（79691）、Znt（88222）、trt（88422）、srt（88461）、crt（88464）、PM（53205）、IM（53229）、xZ（94125）、Ao（1301）、fs（2638）、ps（2643）、cj（Markdown.tsx）、qse（services.tsx）、Ene/Mee/xte（宿主环境面）、Tn（src 域 baseUrl 解析） |
| 12 | 已恢复图表模块对接 | 见 §5 |

---

## 5. 与已恢复 appUsage*/codingPlan 图表 chunk 的消费面对接

| 消费面 | 数据契约（本文件产出侧） | 图表模块（已恢复） |
|---|---|---|
| app 日柱状 | `useAppUsageStats.snapshot`（AppUsageSnapshot：summary/heatmap.weeks/modelUsage/toolUsage） | appUsageDailyModelBarChart.tsx（前 6 模型+逐日累加+日期字典序） |
| app 模型饼图 | 同上（modelSummaryList/modelDataList） | appUsageModelUsagePieChart.tsx（前 6+Other、防 0 除占比） |
| Coding Plan 折线 | `useCodingPlanUsageStats.snapshot.modelUsage/toolUsage.{xTime,granularity,*DataList}`；SettingsPanelsData 的 `modelSeriesOf/toolSeriesOf`（n1t/r1t）将其装配为 `series:[{name,values}]` | codingPlanUsageLineChart.tsx（前 6 系列、小时 `HH:MM`/日 `Mon d`、token/count 双格式化） |
| 配额展示 | `findQuotaLimit/quotaPercent/formatQuotaUsage/formatQuotaResetTime`（Sq/Cq/$4e/wq，本文件 §1.4） | SettingsPanelsData `CodingPlanQuotaCards`（c1t）声明面的实现补齐 |
| 侧栏件 | `SidebarCodingPlanWidget/SidebarStartPlanWidget`（s3e/v3e）消费 Oq 展示模型 + 同一配额助手族 | —（侧栏消费点属 F01，后续批次接线） |

字段级核对：`CodingPlanUsageSnapshot.modelUsage.modelDataList[].tokensUsage` ↔ 折线图 `series[].values`；
`toolUsage.toolDataList[].usageCount` ↔ 次数系列；`heatmap.weeks` ↔ 柱状图逐日分桶——与三图表模块
first-party 段的解混淆注释（前 6 模型/逐日累加/tick 14/45 阈值）一致。

---

## 6. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| 用量数据 hook（K$t/q$t/J$t）与权益数据层全簇（§1.1/§1.2，~480 源码行） | **高（逐字转录）** | 缓存/退避/去重/超时/轮询/重置唤醒/广播逐句还原；日志文案、键构造、常量（600s/20s/[30,60,120,300]s/10s/2^31-1）逐一核对 |
| 计费折扣簇（§1.3）与配额助手+侧栏件（§1.4） | **高（逐字转录）** | i18n key 脚本比对 80/80；聚合逻辑（Oq 展示模型、LXt 分组、fZt 百分比换算、bigmodel 49/598 缺省）直读源码；2 段 logo dataURI 自源码字节级拼入 |
| 供应商卡群全族（§1.5–§1.15，~2,600 源码行） | **高（逐字转录）** | 类名/分支/回调/依赖数组逐字；草稿差异五条件、删除守卫异步复位、连接模式选项序（0/10/100+n/1000）、渐变类名 4 段、`49/598` 等数值常量逐一对上；与 SettingsPanels.tsx 12 个声明 props 面兼容 |
| TS props/服务接口类型 | **中高（推断）** | 由解构默认值与调用面归纳；宿主服务（usageStatsService/modelProviderService/codingPlanSubscriptionService）签名取自调用点，真实接口可能有冗余字段 |
| 接口级深部（zet/MY/EY/s5e/TY/JY/HY/nJ/iJ/Znt/trt/srt/crt/PM/IM/xZ、src/skillStore 助手、dnd-kit/Radix/图标） | **中（接口级）** | 保留声明 + 行号 + 行为注释，可按同法后续批次补全 |

---

## 7. 验证记录与遗留

- `esbuild --loader:.tsx=tsx --jsx=preserve`（web/node_modules/.bin）：**0 错误**（176.4kb 输出）。
- `tsc --noEmit --strict --jsx react-jsx --skipLibCheck`（@types/react 18.3.31 / typescript 5.6.3，
  临时副本于 `/home/none/grok-build/web/.tmp-usagedeep-check/`，验证后已清理）：**0 错误**。
  过程中修复 9 处类型问题：单飞 Promise 自引用（`!` 定赋值，2 处）、`probeConfigKey` targets 可空、
  Input ref（RefObject 收窄）、`runDeleteWithGuard` 零参调用面（cast+注释）、CXt 死分支比较
  （`resolveAddProviderMode` 联合返回，3 处）、`PlanStatusRow.statusLabel` 改 ReactNode。
- **i18n 保真脚本比对**：源区段 80 静态 key = 重建 80 静态 key（0 缺失 / 0 多余）；动态 key 3 族逐字。
- `out/` 目录未做任何修改（只读访问；行数 213,695 不变；md5 `c9d0d675d0b858e6e7711df3e9122e81` 复核一致）。

**遗留（下一子批次，B4-1 #2 第二符号组）**：
1. `zet`（84412）/`Zet`（85948）/`e5e`（79979）支付对话框与 QR 轮询、`Xrt/Zrt`（89295）计划源选择、
   `Mq`（76864）供应商选择、`j3e`（76630）配额弹层内容、77080–90180 余段（含 QR 生成库 78408–79978，vendored 1,571 行）。
2. SettingsPanels.tsx / SettingsPanelsData.tsx 内本批已实体化符号的 `declare` 存根可改为自本文件导入
   （u7/CXt/v7/nZt/rZt/x7/yZt/bZt/MZt/WZt/eQt/tQt/gYt + q$t/J$t/$j/Sq/Cq/wq/$4e/rM），消除重复声明（整合阶段执行）。
3. `SidebarCodingPlanWidget/SidebarStartPlanWidget` 的侧栏消费点（F01/F03 域）与 `useZapiEnabled` 的
   FQt 消费面待整合阶段接线；`Ene/Mee/xte` 宿主环境面待 F20 批次落定。
