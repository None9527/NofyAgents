# SettingsPanels 模块抽取报告（设置视图族 · D8 Stage B3 · 大体量叶子分区）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**，md5 `c9d0d675d0b858e6e7711df3e9122e81`）
- 产物（按分区分节，拆 3 文件，共 10,965 行）：
  1. `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/SettingsPanels.tsx`（4,059 行）— 模型供应商分区（FQt 族）+ MCP 编辑器/导入对话框（HQt/_$t 族）
  2. `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/SettingsPanelsCapability.tsx`（5,230 行）— 技能（y1t）/子代理（H1t）/插件（I0t）/命令（G0t）/Hooks（p2t）/自动化（d6）
  3. `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/SettingsPanelsData.tsx`（1,676 行）— 用量（p1t 图表消费装配）/迁移（V2t）/渲染器（U8/gk）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 前序：`Settings.tsx` / `Settings.report.md`（D8 Stage B，本批实体化其 §1.2 登记的 9 个接口级叶子）；标样 `TopBar.tsx`

---

## 0. 行号口径与只读核验

与 MODULE-MAP/Settings 报告一致：所有范围以 **输入 .js** 为准（闭区间），附 jsx 双行号。
本次锚点逐条命中：`FQt` js **191784** / jsx **154557** ✅、`y1t` js **195992** / jsx **157604** ✅、
`d6` js **138823** / jsx **115911** ✅（任务给定行号全部对上）。
`out/` 只读核验：会话内对 `out/` 仅有读取操作（read_file/sed/grep）；抽验 138823/191784/195992 三行
内容与函数边界一致，行数 213,695 不变，md5 已记录。注：该文件 mtime 为 2026-08-26 11:46
（本会话首次读取之前即如此，应为前序流水线的拷贝动作；同目录其余文件为 2026-08-14），内容完整性以上述锚点+校验和为准。

---

## 1. 分区分节清单（混淆 → 语义 → 行号）

### 1.1 模型供应商分区（FQt 族；Settings.report §1.2 第 1 叶，实体化）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `FQt` | ModelProviderSettingsSection | 191784–192348 | 154557–155115 | 分区根：深链接意图（sw/cw）+ OAuth 同步效果链 + 导航/面板装配 |
| `AZt` | ModelProviderPanel | 190379–191010 | 153409–153689 | 右栏面板：addCustom/preset/codingPlan/teamPlan/custom 五路分派 |
| `nQt` | ModelProviderSectionShell | 191289–191350 | 154091–154110 | 分区壳：描述行+刷新+`grid-cols-[56px_1fr] md:[224px_1fr]`双栏卡 |
| `rQt` | useModelProviderNavigationModel | 191351–191783 | 154111–154250 | 导航模型（分组/条目/选中解析） |
| `iQt…pQt` | presetInFamilyDomain 等 11 纯助手 | — | 154251–154360 | 族域过滤/激活态/缺省键/条目查找 |
| `mQt/hQt/gQt/_Qt/vQt` | 埋点/删除/刷新编排 | — | 154361–154431 | add_model_success 埋点、确认删除、全量缓存刷新 |
| `yQt…PQt` | resolveDomainAfterLogout 等 18 纯助手 | — | 154432–154556 | 解绑域迁移、尝试键、意图归一化、team-plan 订阅校验 |
| `jZt` | resolvePurchaseIntent | — | 153690 尾 | 断开→登录 / 其余→购买 |
| （接口级）`eQt` | ModelProviderNavRail | 191183 | 154042 | 左栏导航轨（拖拽排序） |
| （接口级）`tQt` | isProviderSectionRefreshing | 191286 | 154088 | |
| （接口级）`u7` | ProviderConfigCardForm | 188376 | 151911 | 供应商配置卡表单（F12 族） |
| （接口级）`CXt` | AddCustomProviderDraftForm | 188882 | 152305 | |
| （接口级）`v7` | SectionLoadingPlaceholder | 189650 | 152857 | |
| （接口级）`nZt` | PresetEmptyState | 189662 | 152862 | |
| （接口级）`rZt` | CodingPlanStatusSection | 189675 | 152873 | Coding Plan 状态区（登录/购买/解绑/升级） |
| （接口级）`x7/yZt/bZt` | ProviderCardShell/Header/ConnectionModeNav | 190191/190194/190231 | 153248/153254/153271 | |
| （接口级）`MZt` | CodingPlanPurchaseBanner | 190703 | 153690 | 购买横幅（个人/团队/Start Plan 预览） |
| （接口级）`WZt` | StatusTitleDescription | 191011 | 153927 | |

### 1.2 MCP 编辑器 + 导入对话框（HQt/_$t/W$t/GQt 族；Settings.report §1.2 第 9 叶，实体化）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `HQt` | McpServerEditor | 192533–192833 | 155282–155434 | 表单/JSON 双模式编辑器（stdio/http/sse；env/headers 折叠区；模式切换双向同步） |
| `UQt` | McpStatusIndicator | 192834 | 155435 | 连接状态（spinner/圆点四色） |
| `WQt` | McpScopeBadge | 192847 | 155443 | user/workspace 徽章 |
| `GQt` | McpServerRow | 192855–192955 | 155454–155480 | 服务器行件（testid `mcp-server-row-${name}`、OAuth 授权按钮、开关、编辑/删除） |
| `KQt` | McpServerList | 192956–193013 | 155481–155499 | 列表/空态（空态含创建按钮） |
| `D7` | SettingsFormTextarea | 192349 | 155116 | 表单 Textarea（类名逐字） |
| `IQt` | MCP_FORM_DRAFT_DEFAULTS | 192358 | 155125 | 草稿缺省（scope=`zcodeagentmcp`） |
| `O7/LQt/RQt/zQt/k7/BQt` | isPlainObject/mcpServerToFormDraft/mcpFormDraftToConfig/parseTimeoutMsInput/mcpFormDraftToJson/parseMcpJsonToFormDraft | 192374–192488 | 155138–155240 | 表单⇄配置⇄JSON 三向转换（含 `{mcpServers:{…}}` 包装识别、宽容解析） |
| `A7` | SettingsFormFieldLabel | 192489 | 155241 | |
| `VQt` | McpStorageLevelSelect | 192495 | 155246 | user/workspace 存储级别 |
| `_$t` | McpImportDialog | 193344 | 155837 | category=mcpServers 薄包装 |
| `h$t/g$t` | Skills/CommandsImportDialog | — | 155825/155831 | category=skills/commands 薄包装 |
| `R7` | useExternalAgentImportState | 193347–193433 | 155843–155925 | 扫描/选择/展开/作用域状态机（detect→importSelected） |
| `z7` | ExternalAgentImportDialog | 193434–193900 区段 | 155926–156033 | 对话框主体（selection/importing/complete 三相；进度 0/62/100） |
| `v$t` | ExternalAgentImportSelectionPane | — | 156034 | 独立选择面板（远程同步复用形态） |
| `y$t/b$t/x$t` | ImportModeSelect/ImportTargetSplitButton/ImportTargetScopeSelect | — | 156074/156112/156138 | symlink\|copy、global\|project 分体按钮 |
| `S$t/B7/C$t/w$t/T$t` | ImportResultSummaryBar/Stat/List/Row/StatusIcon | — | 156178–156244 | 结果汇总+明细（skipReason 本地化） |
| `E$t/D$t/O$t` | ImportSourceScopeSelect/ImportDiscoveryTree/ImportResourceRow | — | 156245/156275/156350 | 源×资源选择树（全选/半选/分组展开） |
| （接口级）`qQt…f$t` 纯助手群 | 键构造/标签/分组 | — | 155522–155824 | F7/i$t/o$t/m$t/I7/L7/n$t/s$t/u$t/a$t 等（行号见文件头注） |

### 1.3 技能分区（y1t；Settings.report §1.2 第 2 叶，实体化）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `y1t` | SkillsSettingsSection | 195992–197541 | 157604–157969 | 分区根：三域列表/诊断/详情/聊天创建/导入/远程同步 |
| `m1t` | skillEnabledFilterMatch | 195926 | 157535 | all/enabled/disabled 过滤 |
| `h1t` | ResourceEnabledFilterSelect | 195930 | 157538 | settings.resourceFilter.* 下拉 |
| `g1t` | workspaceFolderName | — | 157578 | |
| `_1t` | formatPublishedAtIso | — | 157580 | |
| `K7` | DetailField | — | 157585 | |
| `v1t` | DetailPathRow | — | 157593 | 打开文件管理器 |
| （内联）`Ce` | SkillRow | 196900 区段 | 157822 | `grid-cols-[auto_minmax(0,1fr)_auto_auto_auto]` 行件 |
| （接口级）`XQt/XB` | 技能分组 | — | skillStore chunk | local/plugin 分组+搜索 |
| （接口级）`Tj/zV/cLt` | skill-creator 任务接线 | — | 157755/157762/157785 | 聊天创建技能 |

### 1.4 子代理分区（H1t；第 5 叶，实体化）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `H1t` | SubagentsSettingsSection | 197542–199414 | 158526–158853 | 分区根：用户/插件/内置三组 + 编辑态整页切换 |
| （接口级）`n9` | SubagentRow | — | 158134 | 行件（模型覆盖/开关/编辑/删除） |
| （接口级）`V1t` | SubagentConfigForm | — | 158301 | 配置表单（模型/工具/权限/轮数/颜色） |
| （接口级）`B1t` | BuiltInModelOverrideControl | — | 158196 | |
| （接口级）`w1t/X7/E1t/L1t` 等 | 排序/守卫/分组助手群 | — | 157977–158113 | |

### 1.5 插件分区（I0t；第 4 叶，实体化）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `I0t` | PluginsSettingsSection | 199994–200497 | 159986–160319 | 分区根：商店/管理/详情三视图 + 市场源/远程同步对话框；滚动位置保持 |
| （接口级）`m0t` | PluginStoreGrid | — | 159338 | 商店网格（分类/精选/搜索） |
| （接口级）`S0t` | PluginDetail | — | 159603 | 详情页 |
| （接口级）`C0t` | MarketEntryCard | 199415 | 159658 | 市场条目卡 |
| （接口级）`D0t` | PluginManageList | — | 159768 | 管理列表（更新/卸载） |
| （接口级）`E0t/n0t/e0t/U1t` | 高级信息件/配置表单 | — | 159755/159143/159069/158854 | |
| （接口级）`M0t/A0t/r0t` | 卸载确认/市场源/添加市场对话框 | — | 159877/159831/159149 | |
| （接口级）`N0t` | useUninstallFlow | — | 159932 | |
| （接口级）`J1t/W1t/i9/p0t/F0t/P0t` | 商店条目装配/更新态/来源格式化/聊天提示 | — | 158932–159974 | |

### 1.6 命令分区（G0t；第 6 叶，实体化）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `G0t` | CommandsSettingsSection | 200852–201243 | 160523–160725 | 分区根：列表/搜索/创建/编辑/删除/导入 |
| `L0t` | useCommandsStoreBridge | 200503 | 160320 | F6 store 桥（初始化+动作封装） |
| `m9` | isUserManagedCommand | — | 160369 | 文件型+zcode 来源 |
| `R0t` | CommandScopeBadge | — | 160372 | |
| `z0t` | CommandRow | 200556 | 160383 | 行件（作用域/插件徽章/参数提示） |
| `B0t` | COMMAND_NAME_PATTERN | — | 160404 | `^[a-zA-Z0-9_-]+$`，1–50 长度 |
| `h9` | CommandFormLabel | — | 160407 | |
| `U0t` | CommandStorageLevelSelect | — | 160412 | |
| `W0t` | CommandForm | 200703 | 160448 | 名称/描述/参数提示/prompt 四段 + 校验 |

### 1.7 Hooks 分区（p2t；第 6 叶，实体化）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `p2t` | HooksSettingsSection | 202032–202285 | 161468–161624 | 分区根：列表/搜索/作用域 Tabs/表单切换/插件兼容导入 |
| `t2t` | HookForm | 201390 | 161023 | 事件/类型/匹配/命令/参数/shell/异步 + 高级（超时/状态消息/custom JSON） |
| `Q0t` | FormLabelSlot | — | 161013 | `data-slot="label"` |
| `$0t/n2t` | HOOK_EVENTS/HOOK_EVENT_ORDER | — | 161019/161236 | 7 事件枚举（两处同值） |
| `e2t` | customJsonOf | — | 161020 | |
| `y9` | HookFormField | — | 161229 | |
| `r2t` | HookScopeTabs | — | 161237 | 仅 user 触发器（project 由工作区推导） |
| `i2t` | HookListByEvent | 201771 | 161256 | 按事件分节列表 |
| `a2t` | groupHookRowsByEvent | — | 161289 | 事件序优先，未知事件追加 |
| `b9/x9` | HookRowShell/HookRowBody | — | 161322/161331 | |
| `o2t/s2t/c2t` | Editable/Compatibility/PluginHookRow | — | 161349/161383/161409 | Agents/Claude 兼容导入、插件只读徽章 |
| `l2t` | HookRowActionButton | — | 161443 | |
| `u2t/d2t/f2t/m2t` | isZCodeHook/collectPluginHookRows/filterPluginHooksByScope/hookMatchesQuery | — | 161451–161625 | |
| （接口级）`Z0t` | hooks store | 201244 | 160815 | zustand（initialize/refresh/add/update/delete/toggle/import） |

### 1.8 自动化分区（d6；第 3 叶，实体化；F15 族根）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `d6` | AutomationsMain | 138823–139924 | 115911–116622 | 分区根：定时+闲时双域；列表/创建/编辑/闲时表单四态；≤20 限额；10s 轮询；配额到期唤醒 |
| `ZNt` | AutomationRowActionMenu | 138713 | 115876 | 行操作菜单（运行/重启/暂停恢复/编辑/删除） |
| `BNt/VNt/HNt` | resolveVisibleTabs/resolveEffectiveTab/resolveTemplateVisibility | — | 115803/115809/115812 | |
| `UNt` | AUTOMATION_STATUS_STYLES | — | 115823 | 4 态图标+颜色 |
| `WNt/GNt/KNt/qNt/u6/JNt/YNt/XNt` | 提示归一化/失败判定/可切换判定/运行结果消息/错误 id/按 id 查找/深链接解析 | — | 115841–115873 | |
| （接口级）`kNt` | AutomationEditor | — | 114854 | 定时任务编辑器（F15 深层） |
| （接口级）`YMt` | OffPeakTaskEditor | — | 114019 | 闲时任务编辑器 |
| （接口级）`tMt/cMt/L3/INt/ANt` | KeepAwakeRow/OffPeakTaskList/CreateSplitButton/OffPeakCreateButton/StatusChip | — | 113438/113500/113451/115771/115689 | |
| （接口级）`Pjt/LNt` | 闲时/定时模板表 | — | 112762/115784 | |
| （接口级）`T3/bX` | automations/offPeak store | — | — | zustand（动作面见类型声明） |

### 1.9 用量分区图表消费面（p1t；第 8 叶，实体化）

> 图表本体（AppUsageDailyModelBarChart / AppUsageModelUsagePieChart / CodingPlanUsageLineChart）
> 位于独立异步 chunk，已在先前批次恢复（`modules/appUsageDailyModelBarChart.tsx` 等）。
> 本节只重建 **styles 内的消费装配**：lazy 包装 + ErrorBoundary/Suspense 壳 + 快照编排。

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `p1t` | UsageSettingsSection | 195890–195991 | 157519–157534 | 分区根：`app`→AppUsageDashboard，其余→CodingPlanUsageDashboard |
| `e1t` | AppUsageDashboard | 195350 | 157165 | 6 统计卡+热力图+日柱状+模型饼图+刷新 |
| `a1t` | CodingPlanUsageDashboard | 195530 | 157259 | 三路订阅快照（zai/bigmodel/team）+配额+趋势 |
| `U7` | UsageChartBoundary | — | 157119 | p4 ErrorBoundary + Suspense（inline） |
| `W7/Y$t/X$t/Z$t` | UsageErrorBanner/凭证错误模式/判定/消息 | — | 157137–157155 | 凭证错误→warning+跳转 modelProvider |
| `G7/s1t` | AppUsageRangeTabs/CodingPlanRangeTabs | — | 157225/157360 | |
| `c1t` | CodingPlanQuotaCards | — | 157378 | 5h/周/月 MCP 三卡（TOKENS_LIMIT/TIME_LIMIT 抽取） |
| `l1t/u1t/d1t/f1t` | 趋势/模型/工具/统计格 | — | 157424–157518 | |
| `t1t/n1t/r1t/o1t` | shortModelName/modelSeriesOf/toolSeriesOf/resolveUsageSourceProviderName | — | 157222–157358 | |
| `Q$t/$$t/i1t` | Lazy 三图 | — | 157159/157161/157256 | ← `AppUsageDailyModelBarChart-037NXfkz.js` / `AppUsageModelUsagePieChart-_KCE1AAL.js` / `CodingPlanUsageLineChart-BpNLwqMV.js`（deps 321/326/327 族） |
| （接口级）`q$t/J$t` | useAppUsageStats/useCodingPlanUsageStats | — | 156996/157047 | 数据层（nge 23920 上游） |

### 1.10 迁移分区（V2t；第 7 叶，实体化）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `V2t` | MigrationSettingsSection | 203587–203929 | 162409–162541 | 分区根：扫描过滤卡（工作区/时间范围/限额）+候选卡 |
| `I2t` | useClaudeMigration | 203145 | 162189 | 扫描/导入状态机（仅桌面；导入后工作区标签登记） |
| `z2t` | MigrationCandidatesCard | 203332 | 162321 | 候选会话卡（计数徽章/全选/导入/结果明细） |
| `R2t/L2t` | MigrationResultItemList/migrationSkipReasonLabel | — | 162310/162301 | |
| `B2t` | MIGRATION_RANGES | — | 162408 | `[7d,30d,90d,all]` |
| （接口级）`F2t/P2t/N2t/k2t` | 过滤/限额/时间助手 | 203136–203144 区段 | 162170–162186 | k2t=100 缺省限额 |

### 1.11 渲染器叶子（U8/gk；Settings.report §1.2 末两行，实体化）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `U8` | MemoryFilePreview | 160323–160338 | 132773–132788 | 记忆文件预览：`min-h-full bg-background p-4` 包装 cj MarkdownRenderer（F14 入口） |
| `gk` | CodeBlock | 48634–48897 区段 | 43829–43897 | 代码块：mermaid 自动渲染判定+换行切换+预览对话框+`--diffs-*` 变量（F19） |
| `_k` | CodeBlockWrapLinesButton | — | 43898 | 工具条：换行切换（aria-pressed） |
| `iBe` | CodeBlockMermaidPreviewButton | — | 43907 | 工具条：mermaid 预览 |
| `vk` | CodeBlockCopyButton | — | 43934 | 工具条：复制（2s 勾选反馈、Clipboard API 守卫） |
| （接口级）`fk/nBe/BO/MO/Qze/Oze/Pze/Mze` | context/壳/预览/高亮/判定 | — | 43775 起 | F19 深层 |

---

## 2. 设置项 key 补登记（对 Settings.report §2 的 43 key 增量）

Settings.report §2 已登记 **43 个行式设置 key**。本批叶子分区新增登记 **约 330 个 i18n key**
（均为直读压缩源码逐字转录；下表按分区给出 key 族，完整清单见各 .tsx 内 `formatMessage` 调用）：

| 分区 | key 族（前缀） | 数量级 | 代表 key |
|---|---|---|---|
| 模型供应商 | `settings.modelProvider.*`、`settings.modelProviderDescription`、`settings.modelProvider.connectionMode.*` | ~20 | `settings.modelProvider.presetTitle/customTitle/add/deleteConfirmTitle/deleteConfirmDescription/deleteConfirmAction/refresh/zapiPresetEmpty/presetEmpty`、`connectionMode.codingPlan/startPlan/apiKeyBadge/codingPlanBadge/startPlanBadge/teamPlanBadge/teamPlan`、`codingPlan.status.teamUnavailable`、`codingPlan.purchaseBanner.teamTitle/personalTitle`、`apiKey` |
| MCP 编辑器 | `settings.mcp.form.*`、`settings.scope.*`、`settings.mcp.oauth.*`、`settings.mcp.status.*` | ~20 | `settings.mcp.form.name/type/type.stdio/type.sse/timeoutMs/command/args/envOptional/headersOptional/fullConfig/pasteHintPrefix/pasteHintMiddle/pasteHintSuffix/jsonParseError/add`、`settings.scope.label/user/workspace`、`settings.mcp.oauth.openAuthorization`、`settings.mcp.status.toolCount` |
| 外部导入 | `settings.{skills\|commands\|mcpServers}.import.*`、`settingsSync.action.*` | ~75（25×3 类） | `import.title/scanning/importing/empty/summary/finish/modeLabel/mode.symlink/mode.copy/mode.symlink.description/mode.copy.description/modeHelp/targetLabel/target.global/target.project/scope.global/scope.project/scopeLabel/selectAll/clearAll/selectionCount/itemCount/scopeEmpty/selectSource/deselectSource/expandSource/collapseSource/imported/skipped/failed/resultList/resultEmpty/skipReason.*`、`settingsSync.action.rescan/skip` |
| 技能 | `settings.skills.*`、`settings.resourceFilter.*`、`settings.pluginManaged.*` | ~35 | `settings.skills.description/create.open/import.open/remoteSync.open/remoteContext/refresh/refreshing/searchPlaceholder/filter.enabled.label/diagnostics.summary/diagnostics.collapse/diagnostics.expand/diagnostics.code.<code>/userScopeDesktopOnly/empty/group.local/group.plugin/noDescription/scope.workspaceFallback/scope.plugin/scope.personal/delete.title/delete.description/detail.description/scope/status/enabled/disabled/version/slug/publishedAt/ownerId/path/openPath/create.taskCreateFailed`、`settings.resourceFilter.label/all/enabled/disabled`、`settings.pluginManaged.modifyInPlugin/badge` |
| 子代理 | `settings.subagents.*` | ~18 | `description/addNew/edit/addDescription/editDescription/backToList/searchPlaceholder/filter.all/enabled/disabled/userScopeDesktopOnly/empty/group.user/group.plugin/group.plugin.hint/group.builtIn/group.builtIn.hint/delete.title/delete.description/openUserAgentsFolder` |
| 插件 | `settings.plugins.*` | ~16 | `noWorkspace/store.subtitle/store.create/store.sources.title/refresh/refreshing/remoteContext/checkForUpdates.found/checkForUpdates.none/source.builtin/source.fromMarketplace/marketplace.claudeCodePlugins/detail.updateAvailable/detail.versionChanged/detail.updateNewSessionsNote/detail.update/detail.rootPath/marketplaces.add` |
| 命令 | `settings.commands.*`、`forms.validation.fileExists` | ~26 | `description/addNew/edit/addDescription/editDescription/backToList/import.open/openUserCommandsFolder/searchPlaceholder/empty/group.local/group.plugin/noDescription/delete.title/delete.description/form.name.label/placeholder/form.description.label/placeholder/form.argumentHint.label/placeholder/form.prompt.label/placeholder/form.validation.nameLength/nameCharacters/promptRequired` |
| Hooks | `settings.hooks.*` | ~32 | `description/add/edit/delete/deleteDescription/backToList/imported/import/searchPlaceholder/sessionSnapshot/empty/matchAll/event/type/type.process/type.command/matcher/matcherPlaceholder/matcherHint/command/commandPlaceholder/args/argsPlaceholder/argsHint/shell/shellPlaceholder/async/advanced/timeout/timeoutHint/statusMessage/statusMessagePlaceholder/customJson/customJsonObjectError/customJsonParseError/scopeUnknown/enabled/disabled` |
| 自动化 | `settings.automations.title`、`automations.*`、`offPeak.*`、`scheduledPreview.toast.*` | ~60 | `settings.automations.title`、`automations.description/populated/refresh/refreshing/createdLabel/empty.title/moreIdeas/template.<id>.title/description/prompt/schedule/runNow/restart/pause/resume/delete/moreActions/form.editTitle/lifecycle.active/paused/completed/failed/runCount/nextRun/runNowQueued/runNowAlreadyRunning/runNowFailed/error.createLimit/error.create/update/toggle/restart/delete/error.targetNotFound/noWorkspace/createViaChat.prompt/delete.title/delete.description`、`offPeak.tabs.scheduled/idle/create.codingPlanOnly/create.availabilityUnavailable/create.limitReachedAt/create.codingPlanToast/templates.sectionTitle/newTask.template.<id>.title/prompt/description/form.soonestAvailable/cancel.title/cancel.description/action.cancel/delete.title/delete.description/delete.confirm/error.unavailable/error.quota/error.generic`、`scheduledPreview.toast.running/view` |
| 用量 | `settings.usage.*`、`usage.error.stats.*` | ~35 | `loadingTitle/appUsageRangeTitle/appUsageLoadingDescription/emptyTitle/emptyDescription/totalTokens/sessions/messages/activeDays/currentStreak/favoriteModel/favoriteModelShare/checkApiKey/refresh/range.<r>/codingPlanRange.today/7d/30d/codingPlanLoadingDescription/codingPlanCurrentConnectionTitle/codingPlanCurrentConnectionDescription/quotaTitle/entitlementFiveHourUsage/entitlementWeeklyUsage/entitlementMonthlyMcpUsage/trendsTitle/modelUsageTitle/tokenTotal/toolUsageTitle/toolCallsTotal/timesUnit`、`usage.error.stats.credential/generic` |
| 迁移 | `settings.migration.*` | ~30 | `scan/filtersTitle/filtersDescription/unsupported.title/unsupported.desktopOnly/workspaceFilterLabel/workspaceFilter.all/current/rangeLabel/range.7d/30d/90d/all/limitLabel/limitHint/scanFailedTitle/scanFailedDescription/candidatesTitle/candidatesCount/selectedCount/candidatesDescription/selectAll/clearSelection/importSelected/importFailedTitle/importFailedDescription/resultTitle/resultSummary/emptyTitle/emptyDescription/workspacePathLabel/updatedAt/skippedTitle/failedTitle/reason.session_not_found_or_workspace_mismatch` |
| 代码块 | `codeBlock.mermaid.*` | 2 | `codeBlock.mermaid.ariaLabel/openPreview` |

与规格 §9 的关系：Settings.report §2.8 的八段对照维持不变；本批补全的是各分区**内部**的
设置项/文案键（分区根之下的行件、表单、对话框、空态、错误态）。
另补记两个**非 i18n 的存储/常量**：`zcodeagentmcp`（MCP 表单 scope 常量，原 `V7`，jsx 156371）、
testid `plugin-store-root/plugin-store-refresh/plugin-store-sources-open/plugin-store-create/plugin-store-add-source-menu-item/plugin-store-error/plugin-store-detail-update`（I0t 内字面量）、`hooks-settings-section/configured-hook-row/plugin-hook-row/hooks-form`（p2t/t2t 内字面量）、`data-automations-content/task-grid/empty-state/idle-templates/scheduled-templates/task-template-separator`（d6 data 属性）。

---

## 3. 边界判定依据

1. **函数体边界**：以 jsx 顶层声明边界表（7,113 条）切分；每个分区根的行号范围见 §1。
   例：`FQt` 154557 起，至 155116 `function D7` 前；`y1t` 157604 起，至 157970 `var q7` 前。
2. **归属切分**：157970–158525 的助手群（w1t…V1t）归子代理族（H1t 消费）；155522–156541 的
   settingsSync 助手群归 MCP 导入族；154432–154556 归模型供应商族（仅 FQt 消费）。
3. **接口级判定**：跨族深层叶子（F12 供应商卡 `u7/rZt/MZt` 等、F15 编辑器 `kNt/YMt`、
   插件子视图 `m0t/S0t/D0t` 等、子代理 `n9/V1t`、stores `T3/bX/Z0t/F6/B6`）保留
   `declare` 接口 + 行号，行为注释标注调用面；与 Settings.tsx 的接口级约定一致。
4. **用量消费面**：`Q$t/$$t/i1t` 三个 `React.lazy` 的 chunk 文件名与 deps 索引（321/326/327 族）
   逐字记录；图表本体不重复重建（已在 appUsage*/codingPlanUsageLineChart 模块恢复）。
5. **效果链合并**：FQt 内 154650–154704 两段**完全等价**的失效 Team Plan 清理效果
   （依赖数组相同、函数体相同）在重建中合并为一段，注释标注原行号（压缩器复制产物，
   运行语义不变）。
6. **testid/图标/常量**：沿用 Settings.tsx 的三级反查结论；本批新增的 testid 均为源码字面量
   （§2 末），无需反查。

## 4. 外部依赖清单（跨 chunk）

| # | chunk | 提供的符号 |
|---|---|---|
| 1 | react / jsx-runtime | React、Suspense、lazy、jsx |
| 2 | utils-CEEH0K_K.js | `cn()`（Z） |
| 3 | button-laUijeDG.js | Button（X）、图标族（lucide 风格） |
| 4 | IntlProvider-C321H7m8.js | useIntlContext（G） |
| 5 | imeComposition-DEYFkwWm.js | usePlatformService（l）、toast（m/l6）、Input（P）、Textarea（j）、Spinner（M） |
| 6 | usageStatsUiParts-CiR7YEhh.js | Tooltip（Ia）、Fa/Pa/Zre/Da/Aa/Qre/Jre/ai 用量展示助手 |
| 7 | logger-PFDwl5Yq.js | logger（J） |
| 8 | skillStore-BmeKHDBI.js | 供应商 id 枚举（q）、useTaskStore（xe）、XB/XQt 技能分组 |
| 9 | src-HCld2afU.js | testid 常量（at/Xn/jr/Bte/on/Et/bte…）、Kte agentSource |
| 10 | 本 chunk 横切 | stores：`ko`(1296)/`B6`(142985)/`T3`/`bX`/`Z0t`(201244)/`F6`(142754)；hooks：`qq`(78195)/`JM`(53440)/`TY`(83697)/`$j`(52449)/`sX`(88255)/`fX`(89052)/`gYt`(187295)/`q$t`(156996)/`J$t`(157047)；意图：`sw`(39377)/`cw`(39394)/`iw`(35393)；原语：`p4`(129952)/`hC/gC/_C` Tabs/`iO/aO/oO/sO/cO` Select/`zb/Hb/Ub/Gb` Dialog |
| 11 | 已抽取族组件 | Settings.tsx：j7 ResourceGroupHeader、M7 BackLinkButton、B3/V3 Card、S9/w9 Alert、r4 RemoteSyncDialogs；Markdown.tsx：cj MarkdownRenderer |
| 12 | 异步图表 chunk | AppUsageDailyModelBarChart-037NXfkz.js、AppUsageModelUsagePieChart-_KCE1AAL.js、CodingPlanUsageLineChart-BpNLwqMV.js（已恢复模块对应） |

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| 9 个分区根的 hooks/effects/回调/JSX 装配（FQt/AZt/nQt/rQt、y1t、d6、I0t、H1t、G0t、p2t、V2t、p1t） | **高（逐字转录）** | 类名/i18n key/testid/分支条件/日志文案直读压缩源码；关键处经 jsx 双向核对；数值常量（20 限额、10s 轮询、62% 进度、1–50 名称长度、60s 超时缺省、100 扫描限额）逐一对上 |
| MCP 编辑器/导入对话框全族（HQt…O$t、R7/z7）与纯助手（IQt…BQt） | **高（逐字转录）** | 表单⇄JSON 双向转换逻辑、三相进度、选择树半选态均按源码重建 |
| 分区内中小型子件（ZNt、z0t、W0t、t2t、HookRow 三件、MigrationCandidatesCard、UsageDashboard 全族、gk/U8/工具条三按钮） | **高（逐字转录）** | 同上 |
| TS props/服务接口类型 | **中高（推断）** | 由解构默认值与调用面归纳；store 动作签名取自实际调用点，真实接口可能有冗余字段 |
| 接口级深层叶子（u7/rZt/MZt、kNt/YMt、m0t/S0t/D0t、n9/V1t、T3/bX/Z0t/F6/B6、q$t/J$t 等） | **中（接口级）** | 保留 props + 行为注释 + 行号，可按同法后续批次补全 |
| 用量 lazy deps 索引（`__vite__mapDeps([321,…])`） | **记录未重建** | 打包器产物，重建版以声明代替，chunk 文件名已逐字保留 |

## 6. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`（web/node_modules/.bin，三文件逐一）：**0 错误**
  （106.7kb + 150.2kb + 41.7kb 输出）。
- `tsc --noEmit --strict --jsx react-jsx --skipLibCheck`（@types/react 环境，临时副本于
  `/home/none/grok-build/web/.tmp-settingspanels-check/`，验证后已清理）：**0 错误**。
  过程中修复 12 处类型问题：Input `size` 与 HTML 原生属性冲突（Omit 处理，3 文件）、
  `BIGMODEL_OAUTH_PROVIDER_ID` 字面量收窄、`groupDiscoveryByScope` 可空参数、
  `PluginsStoreState.refresh` 缺字段、`collectPluginHookRows` hookDetails 类型、
  `AutomationEditor.onSubmit` 签名、`supportState.reason` 联合收窄、`workspaceFolderName` 参数域。
- `out/` 目录未做任何修改（只读访问；锚点行 138823/191784/195992 抽验一致；
  行数 213,695 不变；md5 `c9d0d675d0b858e6e7711df3e9122e81` 记录在案）。

## 7. 后续建议

1. 二批补全接口级深层叶子：优先 `u7/rZt/MZt`（供应商卡/状态区/购买横幅，F12 族核心）、
   `kNt/YMt`（自动化编辑器）、`m0t/S0t/D0t`（插件商店三视图）。
2. Settings.tsx 内本批已实体化符号的 `declare` 存根（FQt/y1t/d6/I0t/H1t/G0t/p2t/V2t/p1t/
   HQt/_$t/W$t/GQt/U8/gk）可改为自本三文件导入，消除重复声明（下一阶段整合时执行）。
3. MODULE-MAP 建议补记：用量分区消费面三 lazy 与已恢复图表模块的对应关系（本报告 §1.9）。
