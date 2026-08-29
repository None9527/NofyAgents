# A0-D-Settings 批次报告（Stage A0 · declare 接线 + 类型收敛）

日期：2026-08-29
域：Settings.tsx / SettingsLeaves.tsx / SettingsPanels.tsx / SettingsPanelsCapability.tsx / SettingsPanelsData.tsx

## 0. 总览

| 文件 | declare 基线 | 接线(→import) | 保留 | tsc 基线 | tsc 完工 |
|---|---|---|---|---|---|
| Settings.tsx | 106 | 8 | 98 | 55 | 52 |
| SettingsLeaves.tsx | 121 | 41 | 82 | 25 | 2 |
| SettingsPanels.tsx | 100 | 19 | 83 | 47 | 44 |
| SettingsPanelsCapability.tsx | 116 | 18 | 101 | 175 | 168 |
| SettingsPanelsData.tsx | 43 | 15 | 31 | 13 | 6 |
| 合计 | 486 | **101** | 395 | 315 | **272**（−43） |

- 另修复 5 处破损的 `logger` import（全部 5 文件，原 `import { logger } from './SkillStore'` → `import { t as logger } from './logger'`）。
- 保留的 395 条中含 6 条「破损 import 回退为 declare」（见 §5 异常）。
- 任务书基线 317 与实测基线 315 的差为快照时点不同（其他批次并行改动）；本批次以同机实测前后对照为准。

## 1. 逐文件接线清单（名 → 属主）

### Settings.tsx（8）
| 本地名 | import | 备注 |
|---|---|---|
| cn | `{ cn } from './UtilsCn'` | Z（utils chunk） |
| useIntlContext | `{ useZCodeIntl as useIntlContext } from './I18n'` | G（IntlProvider chunk）；LocalePreference 成员与本地一致 |
| useConfirmDialog | `{ useConfirmDialog } from './Modals'` | U2；Omit<ConfirmDialogRequest,"resolve"> 兼容 |
| Tooltip | `{ InfoTooltip as Tooltip } from './UsageStatsUiParts'` | Ia |
| CodeBlock | `{ CodeBlock } from './SettingsPanelsData'` | gk（48634），裁决见 §4.1 |
| isForbiddenInstallDirError | `{ isDataBaseDirForbiddenError as … } from './SrcSharedB'` | dS（9110/8991） |
| resolveRepoSnapshotIndexingEnabled | `{ isRepoSnapshotIndexingUserEnabled as … } from './SrcSharedA'` | Go（4535） |
| AutomationsMain | `{ AutomationsMain } from './SettingsPanelsCapability'` | d6（F15 族根）；调用点仅传 workspacePath/workspaceIdentity |

### SettingsLeaves.tsx（41）
- cn→UtilsCn；useIntlContext→I18n(useZCodeIntl)；Tooltip→UsageStatsUiParts(InfoTooltip) // Ia；useConfirmDialog→Modals // U2；imeGuard→ImeComposition(isComposingText) // A；parseModelValue→SkillStore(parseCustomModelId) // se；parseCustomModelKey→SrcSharedB(parseCustomModelRef) // Zn；isMaxThinkingModel→SrcSharedA(isGlmModelId) // qn；testidTemplate→SrcSharedB(joinTestidParts) // Xa（全 12 处调用均为 2 参）。
- 32 个 TESTID_* → SrcSharedB（全部经 styles jsx import 表 `槽位→本地名` 逐条核验为字符串常量）：
  SUBAGENT_ROW→subagentRowTestid(Ite/ki)、SUBAGENT_MODEL→subagentBuiltInModelTriggerTestid(Gn/Oi)、AUTOMATION_SAVE→automationFormSubmitTestid($t/Ht)、RUN_NOW→automationRunNowTestid(bn/Kt)、ROW_MENU→automationCardMenuTestid(at/At)、TOGGLE→automationActionToggleTestid(Xn/Ot)、DELETE→automationActionDeleteTestid(Et/Dt)、BACK→automationEditBackTestid(dt/Bt)、TITLE→automationFormTitleTestid(Rr/Ut)、SCHEDULE_BOX→automationSchedulePreviewTestid(_ee/Yt)、SCHEDULE_DELETE→automationScheduleDeleteTestid(mn/Jt)、SCHEDULE_ADD→automationScheduleAddTestid(Tne/qt)、FREQUENCY→automationFrequencySelectTestid(Kt/Gt)、CUSTOM_FREQUENCY→automationCustomRepeatEditTestid(Dn/Lt)、PROMPT→automationFormPromptTestid(ree/Vt)、FREQUENCY_OPTION→automationFrequencyOptionTestid(Kr/Wt)、INTERVAL_INPUT→automationCustomIntervalSelectTestid(sn/It)、INC→automationCustomIntervalIncrementTestid(zt/Ft)、DEC→automationCustomIntervalDecrementTestid(ir/Pt)、UNIT→automationCustomUnitSelectTestid(bre/zt)、UNIT_OPTION→automationCustomUnitOptionTestid(_r/Rt)、CONFIRM→automationCustomConfirmTestid(Un/Nt)、ENDDATE_TRIGGER→automationYearMonthdayTestid(wee/Zt)、MONTH_OPTION→automationYearMonthOptionTestid(ur/Qt)、DAY_OPTION→automationYearDayOptionTestid(dee/Xt)、OFFPEAK_SUBMIT→offpeakEditSubmitTestid(Nn/Mr)、OFFPEAK_TITLE→offpeakFormTitleTestid(Rt/Fr)、OFFPEAK_PROMPT→offpeakFormInstructionsTestid(nr/Pr)、OFFPEAK_CREATE→offpeakCreateButtonTestid(Mte/jr)、OFFPEAK_MENU→offpeakCardMenuTestid(rt/Ar)、CREATE_MANUALLY→automationCreateManuallyTestid(Nte/jt)、CREATE_MORE→automationCreateMenuTestid(Fn/Mt)。

### SettingsPanels.tsx（19）
- cn→UtilsCn；useIntlContext→I18n；useConfirmDialog→Modals；Tooltip→UsageStatsUiParts(InfoTooltip)。
- readSettingsSectionIntent→Settings(consumeModelProviderIntent) // sw（39377）；返回 `|undefined`，消费面 normalizeModelProviderIntent 兼容。
- isStartPlanPreset→SrcSharedA(isStartPlanProviderId) // Bn。
- SrcSharedB 六项：familyModeOf→resolveProviderFamilyMode // zi、familyDescriptorOf→getOAuthProviderFamilyByProviderId // ot（返回 any，消费面 .id/.apiKeyProviderId 安全）、isProviderActive→isProviderEnabled // gi、parseTeamPlanKey→parseCodingPlanScope // li、buildTeamPlanKey→buildCodingPlanScope // vi、isSameTeamPlanKey→codingPlanScopesOverlap // fi。
- MCP_SERVER_ROW_TESTID_PREFIX→SrcSharedB(mcpServerRowTestid) // bte（8337）；testidOf→SrcSharedB(joinTestidParts) // qr（全调用 2 参）。
- McpHelpers 五项：importSelectionKey→jsonStringify // F7、sourceGroupKey→syncResourceKey // n$t、agentDisplayName→agentDisplayLabel // s$t、scopeOptionLabel→importScopeI18nKey // u$t、describeImportError→errorMessageText // a$t（ExternalAgentImportScope="global"|"project" ⊆ string ✓）。

### SettingsPanelsCapability.tsx（18）
- cn→UtilsCn；useIntlContext→I18n；useConfirmDialog→Modals；Tooltip→UsageStatsUiParts(InfoTooltip)。
- taskStoreStatic→SkillStore(useTaskStore as taskStoreStatic) // xe.getState()（原 import 行扩为 `useTaskStore, useTaskStore as taskStoreStatic`）。
- useMcpStoreStatic→stores-workspace(useMcpStore as useMcpStoreStatic) // Ug；调用改为 `useMcpStoreStatic((state) => state)`（本仓 UseBoundStore 调用签名要求 selector，语义=整态快照，与 bundle 一致）。
- isFileBasedCommand→SrcSharedB(isUserPreferenceSource) // ki；isPluginCommand→SrcSharedB(isPluginPreferenceSource) // ft；COMMANDS_AGENT_SOURCE→SrcSharedA(DEFAULT_AGENT_NAME) // Kte；automationWorkspaceKey→SrcSharedB(automationsWorkspaceKey) // Ti；OFFICIAL_MARKETPLACE_IDS→SrcSharedB(OFFICIAL_PLUGIN_MARKETPLACE_IDS) // cre。
- AUTOMATIONS_CONTENT_CLASS→Settings(SETTINGS_CONTENT_CLASS) // H3。
- 6 testid → SrcSharedB（styles jsx import 表核验）：MORE_ACTIONS→automationCardMenuTestid(at/At)、TOGGLE→automationActionToggleTestid(Xn/Ot)、DELETE→automationActionDeleteTestid(Et/Dt)、GRID→automationsListTestid(jr/Tt)、CARD→automationCardTestid(Bte/kt)、TABS→offpeakTabTestid(on/Ir)。

### SettingsPanelsData.tsx（15）
- cn→UtilsCn；useIntlContext→I18n；Tooltip→UsageStatsUiParts(InfoTooltip)。
- navigateToSettingsSection→Settings(requestSettingsSectionNavigation) // iw（35393）；唯一调用点传字面量 "modelProvider" ∈ SettingsSectionId ✓。
- LoadingPlaceholder→UsageStatsUiParts(UsageEmptyState) // Fa（全部调用点均带 description ✓）；StatCard→UsageStatsUiParts(UsageStatCard) // Pa；formatTokenCount→UsageStatsUiParts(formatTokens) // Da；formatInteger→UsageStatsUiParts(formatCountCompact) // Aa。
- Card→Settings(SettingsCard) // B3；CardContent→Settings(SettingsCardContent) // V3（B5 头注「Settings.tsx 已抽取」+ 135212/135254 锚点）。
- MermaidPreview→MarkdownIntegration(MermaidInlinePreview) // BO；ShikiHighlight→HighlightedCodeBlock(HighlightedCodeBlock) // MO；evaluateMermaidAutoRender→MarkdownIntegration(mermaidAutoRenderGate) // Pze；mermaidAutoRenderDependency→MarkdownIntegration(useDocumentVisibilityTick) // tBe（裁决见 §4.5）；MermaidPreviewDialog→PreviewCards(MermaidFullscreenDialog) // Qze（配套：mermaidSvg 状态 unknown→string|null，收敛非改名）。
- 类型归一：本地 `export interface CodePreviewSettings` 改为 `import { type CodePreviewSettings } from './stores-core'` + `export type { CodePreviewSettings }`（stores-core 与 MarkdownIntegration 形状逐字一致）。

## 2. 保留 declare 及原因

### Lane-4（vendored，S3 换 npm；一律未动）
- 图标族：Settings 30 个 Icon*、SettingsLeaves ~37 个 Icon*、SettingsPanels 14 个 *Icon、SettingsPanelsCapability ~31 个 *Icon/TemplateIcon、SettingsPanelsData 14 个 *Icon（含 SpinnerIcon/WrapLinesIcon/MermaidIcon/CopyIcon/CopiedIcon）。
- shadcn/radix 原语：Settings Radix*×21 + Button；SettingsLeaves DropdownMenu*×5/Dialog*×8/AlertDialogRoot/ScrollArea*×5/Button；SettingsPanels Button/SelectRoot/Dialog*/DropdownMenu*；SettingsPanelsCapability Button/SelectRoot/Dialog*/DropdownMenu*；SettingsPanelsData Button/SelectRoot。

### 属主未导出（已登记「需要的 export」，见 §3）
ModelSelector(Composer)、Progress(Modals)、useCodingPlanEntitlements(PaymentDeep)、OffPeakCreateButton/SCHEDULED_TEMPLATES/buildAutomationModelSelectGroups/OffPeakTaskList(ExtendedViews)、PROVIDER_IDS 族(providerIds@SrcSharedA)、MAX_THINKING_LEVELS(GLM_REASONING_LEVELS@SrcSharedA)、APP_USAGE_RANGES(USAGE_REPORT_RANGES@SrcSharedA)、canOpenRemoteSessionSource(canOpenRemoteSessionSourceCheck@Modals)、Lazy 图表包装 ×3。

### 属主已导出但接线会新增错误（保留，待属主侧类型收敛）
- useZCodeStore(Settings)：属主 stores-core.useSettingsStore 已导出，但 SettingsState.theme: string 宽于本地 ThemeMode，接线会在 SidebarFooter theme 消费面新增错误 → 待 stores-core 将 theme 收敛为 ThemeMode。
- pluginsStoreStatic(Capability)：实际 PluginsState.installedPlugins: unknown[]，L1906 `.filter(meta => isUpdateAvailableStatus(meta.updateStatus))` 将变 TS18046。
- automationsStoreStatic(Capability)：实际 AutomationRun 仅 `{[key:string]:unknown}`，runsCache→sessionId 流（L4424–4435）将变 unknown 传播。
- useOffPeakStore/offPeakStoreStatic(Capability)：实际 OffPeakState 动作要求 OffPeakTaskService 等类型化服务，而调用面服务来自 BaseServices 索引签名 unknown → 将新增 ~10 处 TS2345。
- 其余 useAppSettings/useWorkspaceTabsStore/useModelProviders/useBigModelProducts/useUpgradeEntry/preset 族/coding-plan 视图模型族/MCP 助手块(Settings 3612–3673)/PluginMcpServerList/远端族/遥测族等：属主未物化或符号未定位（UNRESOLVED），保留。

## 3. 需要的 export（属主文件、符号、定义行号）

| 属主文件 | 符号 | 定义行 | 消费方（本地名） |
|---|---|---|---|
| modules/Composer.tsx | ModelSelector | 8248 | SettingsLeaves: ModelSelector |
| modules/Modals.tsx | Progress | 617 | SettingsPanels: Progress |
| modules/Modals.tsx | canOpenRemoteSessionSourceCheck | 673 | Settings: canOpenRemoteSessionSource |
| modules/PaymentDeep.tsx | useCodingPlanEntitlements | 9910 | SettingsPanels: useCodingPlanEntitlements |
| modules/ExtendedViews.tsx | OffPeakCreateButton | 5154 | SettingsPanelsCapability |
| modules/ExtendedViews.tsx | SCHEDULED_TEMPLATES | 5332 | SettingsPanelsCapability |
| modules/ExtendedViews.tsx | buildAutomationModelSelectGroups | 5642 | SettingsPanelsCapability |
| modules/ExtendedViews.tsx | OffPeakTaskList | 1007 | SettingsPanelsCapability: OffPeakTaskList |
| modules/SrcSharedA.tsx | providerIds | 5680 | Settings/SettingsPanels/SettingsPanelsData: PROVIDER_IDS；Capability: PROVIDER_IDS_ZAI/BIGMODEL_CODING_PLAN |
| modules/SrcSharedA.tsx | GLM_REASONING_LEVELS | 5708 | SettingsLeaves: MAX_THINKING_LEVELS |
| modules/SrcSharedA.tsx | USAGE_REPORT_RANGES | 4571 | SettingsPanelsData: APP_USAGE_RANGES（styles 本地名 ai=src 块槽 fs） |
| modules/appUsageDailyModelBarChart.tsx | Lazy 包装（图表本体 L1238） | — | SettingsPanelsData: LazyAppUsageDailyModelBarChart |
| modules/appUsageModelUsagePieChart.tsx | Lazy 包装 | — | SettingsPanelsData: LazyAppUsageModelUsagePieChart |
| modules/codingPlanUsageLineChart.tsx | Lazy 包装 | — | SettingsPanelsData: LazyCodingPlanUsageLineChart |

另需属主侧「类型收敛」（非缺 export）：stores-core SettingsState.theme→ThemeMode；stores-tasks AutomationRun 增补 trigger/sessionId；stores-workspace PluginsState.installedPlugins 收窄；stores-core BaseServices 服务类型化（消解全部 TS18046 族）。

## 4. 歧义裁决（bundle 锚点 + 调用面）
1. **CodeBlock（Settings.tsx）**：候选 MarkdownCodeBlock.tsx(CodeBlock) vs SettingsPanelsData.CodeBlock。锚点 gk=js 48634（与 MarkdownIntegration.ZCodeCodeBlock 同实体），SettingsPanelsData 头注与重建基准均置 gk 于此；调用面（code/language/theme/showLineNumbers/wrapLongLines/fontSizePx）与 CodeBlockProps 全合 → 取 SettingsPanelsData。
2. **Card/CardContent（B3/V3）**：lane4-classify.json 按名归 radix，误判；bundle 135212/135254 = Settings.tsx SettingsCard/SettingsCardContent（data-slot=card），B5 头注明示「Settings.tsx 已抽取」→ 接线，偏离 lane4 已登记。
3. **Tooltip（Ia）**：chunkmap Ia=usageStatsUiParts 槽 u=InfoTooltip（非 radix Tooltip）→ 接线。
4. **AUTOMATIONS_GRID_TESTID 标签 "jr"**：SrcSharedB export 块 `jr=offpeakCreateButtonTestid` 是槽名冲突假象；以 styles jsx import 表 `Tt as jr`（槽 Tt=automationsListTestid）为准 → automationsListTestid。六条 automation testid 同法逐条核验。
5. **mermaidAutoRenderDependency（tBe）**：MarkdownIntegration L1880 注 tBe=useDocumentVisibilityTick，且 ZCodeCodeBlock 在 useMemo deps 以 `useDocumentVisibilityTick(isMermaid)` 消费——与重建调用面 `mermaidAutoRenderDependency(mermaidCandidate)` 同形 → 接线（渲染期无条件调用，语义忠实）。
6. **modelDisplayName（Jre）**：UsageDeep.modelDisplayName 为 1 参，调用面 2 参冲突；chunkmap Jre=usageStatsUiParts 槽 c=resolveModelLabel(intl, model) → 改指（同时消 L353 TS2554）。
7. **isMermaidLanguage→isMermaidBlock**：调用面 `(language, code)` 2 参与 bundle Oze=isMermaidBlock(47677) 一致；isMermaidLanguage 仅 1 参（TS2554 根因）→ 修正。
8. **filterMcpServersByQuery/buildPluginMcpItems（Settings MCP 块）**：B5 标签 QQt/$Qt 经 bundle js 193409/193414 核验实为 filterZcodeAgentMcpServers/pluginMcpServerRows（不同符号）→ 不接线，整块保留。

## 5. 异常
1. **破损 import 回退为 declare（6 处）**：SettingsPanelsData L76–78 `./157159|157161|157256`（TS2307×3）→ 按重建基准回退为 3 条 Lazy declare；SettingsLeaves `ModelSelector from './Composer'`（TS2459）→ declare；SettingsPanels `Progress from './Modals'`、`useCodingPlanEntitlements from './PaymentDeep'`（TS2459×2）→ declare；SettingsPanelsCapability `OffPeakCreateButton/SCHEDULED_TEMPLATES/buildAutomationModelSelectGroups from './ExtendedViews'`（TS2459×3）→ declare。全部登记 §3。
2. **registerWorkspaceTask**：基线为 TS2459（FileTreePanel 未导出）；本批次期间并行批次已补 export（FileTreePanel L2632），import 现可解析，但其 `task: TaskRecord` 形参比重建 declare 严格，调用面产生 1 处 TS2739（1:1 替换基线 TS2459，总数不增）。
3. **showToast prop**：三个模块各自持有不同 ToastOptions（SettingsLeaves 本地/ImeComposition/SettingsPanelsCapability 本地），默认值 `= toast` 与父级传入 `showToastWithAction` 无法同时满足参数逆变；收敛为 `(message: string, options?: any) => string | number`（唯一 any 引入点，未用任何 @ts-* 抑制）。
4. **SettingsPanels navigateToSettingsSection**：文件内无调用点，保留 declare（不制造死 import）。
5. **Settings.tsx 4962 "header-borderless" 错误**：接线后随 Tooltip/useIntlContext 类型归一自动消解（未单独改动）。
6. **SettingsPanelsData CodeBlockProps.language**：由 `?:` 收敛为必填（真实 gk 即必填），唯一调用点已传值；同时消去 isMermaidBlock/ShikiHighlight 两处 string|undefined 新错。
7. B5-MERGE-NOTES §4 改指（SettingsPanelsData 820–823、SettingsPanelsCapability 537/2435 → B5-07 产物）经核验**前波已完成**：SettingsPanelsData L81 已 import McpHelpers 迁移四件（MIGRATION_DEFAULT_LIMIT/modifiedSinceOfRange/parseScanLimit/resolveWorkspaceFilterMode），SettingsPanelsCapability L121 已 import splitSkillsByScope/splitCommandsByScope，无残留。

## 6. tsc 前后对照（项目级 `tsc -p tsconfig.json`）

| 文件 | 前 | 后 | Δ |
|---|---|---|---|
| Settings.tsx | 55 | 52 | −3 |
| SettingsLeaves.tsx | 25 | 2 | −23 |
| SettingsPanels.tsx | 47 | 44 | −3 |
| SettingsPanelsCapability.tsx | 175 | 168 | −7 |
| SettingsPanelsData.tsx | 13 | 6 | −7 |
| 合计 | 315 | 272 | **−43** |

已消错误类别：破损 import（TS2307/TS2459）×13、toSorted（TS2550+TS7006）×18、SelectContent 透传属性（TS2322）×2、showToast 返回型×1、CodePreviewSettings 双型（TS2322/TS2739）×2、modelDisplayName/isMermaidLanguage 参差（TS2554）×2、header-borderless×1、CodeBlockProps language×2（新增即消）。

### 待属主接线后消解（剩余 272，全部为基线遗留，未新增）
- TS18046/TS2345 unknown 服务传播（settingService/systemService/credentialService/oauthService/modelProviderService/settingsSyncService/skillsService/subagentsService/hooksStore/commandsService/pluginsStore 等）：待 BaseServices 类型化。
- 类型同一性冲突（本地重建型 vs 属主型）：ModelProvider/ModelProviderNavItem/ModelProviderNavigationGroup/CodingPlanViewState（SettingsPanels×~30）、McpServer/PluginRecord（Settings×~15）、SubagentItem（Capability↔Leaves×~10）、Automation vs AutomationTask（×5）、RemoteTarget/BaseServices/CodingPlanSource/ModelProvider@UsageDeep（Settings/SettingsPanelsData 零星）。
- SettingsPanelsData 6 处：unknown[]→UsageHeatmapWeekInput[]/EntitlementQuotaLimit[]×4、本地 ModelProvider→UsageDeep.ModelProvider×2。

## 7. 门禁
- a. esbuild 逐文件：5/5 通过（`--loader:.tsx=tsx --jsx=preserve`）。
- b. tsc：5 文件逐文件不增（见 §6）。
- c. out md5：src-HCld2afU.js = f5edd6a1207c6d20008204829dad3923 ✓；styles-CdEGpc2x.js = 48d71d4874b0868d61fd35a328bf6ad5 ✓。
- 未新增任何 @ts-expect-error/@ts-ignore；未做语义改名；各文件头 B5 注释块与尾部符号表未动；域外文件零编辑。
