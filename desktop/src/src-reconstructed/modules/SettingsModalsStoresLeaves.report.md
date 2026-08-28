# B4 批次合并报告 —— Settings/Modals/杂项 接口级叶子展开（解混淆重建）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**，只读访问；md5 `c9d0d675d0b858e6e7711df3e9122e81`，批后复验一致）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（pretty-print 版，双行号抽样核对）
- 产物：
  - `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/SettingsLeaves.tsx`（6,663 行）
  - `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/ModalsLeaves.tsx`（1,614 行）
  - `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/StoresDeep.tsx`（3,360 行）
- 登记来源：`SettingsPanels.report.md` §1.2–§1.8、`Modals.report.md`（R7/I2t/v$t/S4t/C4t 接口级）、`Stores.report.md` §2.1/§4/§6（store 深层纯函数助手 + 遥测下沉函数 ×25）、`Settings.report.md`、`COVERAGE-LEDGER.md` §c（B4 队列 #16/#17/#18/#21）
- 标样：同目录 `TopBar.tsx`（头注映射表 + §0 外部依赖声明 + 行号口径）
- 行号口径：与前序各报告一致——所有范围以**输入 .js** 为准（闭区间）；混淆名→语义名映射见各产物头注。

---

## 1. 叶子清单（混淆 → 语义 → js 行 → 展开方式 → 把握度）

### 1.1 SettingsLeaves.tsx

#### §A 子代理分区（F06；js 196654–197541）

| 混淆名 | 语义名 | js 行 | 展开方式 | 把握度 |
|---|---|---|---|---|
| `q7/b1t/x1t/J7/Y7/S1t/C1t` | 颜色表/色类/锁判定/inherit 哨兵/全工具表/关注集 | 196654–196660 | 逐字 | 高 |
| `w1t/X7/T1t/E1t` | collectEditableAgents/isUserManagedSubagent/isBuiltInSubagent/builtInSubagentName | 196661–196675 | 逐字 | 高 |
| `D1t/O1t/k1t` | 工具表拆分（已知/保留）/mergeToolSelections | 196676–196685 | 逐字 | 高 |
| `A1t/j1t` | isInheritAllTools/normalizeSelectedModel | 196686–196692 | 逐字 | 高 |
| `M1t` | isSameModelRef | 196693 | 逐字（**勘误**：原用 `Mg` 解析而非 `se`；已按原文 24358 修正为 parseModelRef） | 高 |
| `N1t/P1t/Z7` | resolveThoughtLevelOption/isThoughtLevelAvailable/isModelAvailableInGroups | 196697–196739 | 全量逐行（工作区域/供应商域双支） | 高 |
| `Q7/F1t/$7` | subagentFormDraftOf/subagentFormKeyOf/resolveModelTriggerLabel | 196740–196764 | 逐字 | 高 |
| `e9/I1t/t9/L1t/R1t` | SubagentFormLabel/SubagentColorDot/SubagentBadge/groupSubagents/subagentScopeI18nId | 196765–196800 | 逐字/逐行 | 高 |
| `z1t` | ToolCheckboxRow | 196801 | 全量逐行 | 高 |
| `n9` | **SubagentRow** | 196839 | 全量逐行（锁态/开关/模型徽标/菜单） | 高 |
| `B1t` | **BuiltInModelOverrideControl** | 196982 | 全量逐行（覆盖态 ↔ 思考级别联动、不可用警示） | 高 |
| `V1t` | **SubagentConfigForm** | 197122 | 全量逐行（四部校验：名称/模型/工具/提示词；草稿键重置侦测） | 高 |

#### §B 插件分区（F06；js 198144–199993）

| 混淆名 | 语义名 | js 行 | 展开方式 | 把握度 |
|---|---|---|---|---|
| `r9/i9/W1t/G1t/K1t/a9/o9/q1t` | PluginIcon/hasUpdate/isUpdatable/i18n 回退/pluginDisplayName/pluginDescription/分类表 | 198144–198198 | 逐字/逐行 | 高 |
| `J1t/Y1t/X1t/Z1t/Q1t` | buildStoreItems/collectFeaturedItems/buildCategoryGroups/pluginSearchMatch/sortInstalledItems | 198199–198296 | 全量逐行 | 高 |
| `$1t` | PluginInstalledList | 198297 | 全量逐行 | 高 |
| `e0t/s9/t0t/n0t` | PluginHookDetailsList/PluginDetailField/hookCommandPreview/PluginInfoRow | 198413–198543 | 全量逐行 | 高 |
| `r0t` | AddMarketplaceDialog | 198544 | 全量逐行（URL 校验/忙碌态） | 高 |
| `i0t/a0t/o0t/s0t` | isPluginBusy/PluginEnabledSwitch/PluginItemMenu/PluginInstallButton | 198670–198788 | 全量逐行 | 高 |
| `c0t/l0t/c9/u0t/d0t/f0t/l9/p0t/u9` | PluginStoreCard/精选配置（官方市场+6 插件）/pickRecommendedItems/cache 标签/折叠阈值 6 | 198789–198879 | 逐字/逐行 | 高 |
| `m0t` | **PluginStoreGrid** | 198880 | 全量逐行（搜索/分类/精选/缓存来源三分支） | 高 |
| `h0t/d9/f9/g0t/_0t/v0t` | PluginStoreSegmentButton/PluginStoreSection/PluginCardGrid/PluginStoreGroup/Public/Personal 视图 | 199075–199266 | 全量逐行 | 高 |
| `S0t` | **PluginDetail** | 199276 | 全量逐行（英雄区/组件段/信息区/高级插槽；describe 回退链） | 高 |
| `C0t/w0t/T0t/p9/E0t` | MarketEntryCard/PluginComponentSection/PluginDetailInfo/firstHttpsUrl/PluginAdvancedSection | 199415–199672 | 全量逐行 | 高 |
| `D0t` | **PluginManageList** | 199673 | 全量逐行（启用开关/更新/卸载/来源对话框接线） | 高 |
| `O0t/k0t/A0t/j0t` | isRemovableMarketplace/MarketplaceRefreshFailure/PluginSourcesDialog/formatMarketplaceTime | 199763–199902 | 全量逐行 | 高 |
| `M0t/N0t` | PluginUninstallDialog/useUninstallFlow | 199903–199977 | 全量逐行（两阶段确认 + 忙碌锁） | 高 |
| `P0t/F0t` | 聊天提及引用构造（插件/市场） | 199978–199993 | 逐字 | 高 |

#### §C 自动化编辑器（F15；SettingsPanelsCapability §1.8 / ExtendedViews §7 接口级实体化）

| 混淆名 | 语义名 | js 行 | 展开方式 | 把握度 |
|---|---|---|---|---|
| `Rjt` | resolveTitleOnDefaultChange（hasInitialTitle 字段） | 134026 | 逐字 | 高 |
| `Gjt/tMt/eMt/L3/$jt` | KeepAwakeSwitch/KeepAwakeRow/EditorTabSwitcher/CreateSplitButton/AutomationsEmptyState | 134428–134638 | 全量逐行 | 高 |
| `E3…F3`（16 件） | 图标尺寸常量 + 包装族 | 134452–134510 | 逐字（注：源 `k3`/`A3` 同渲 `R_`，Play/Pause 同图标为源行为，已如实保留） | 高 |
| `pMt/mMt/hMt` | PromptCard/AutoGrowTextarea（116/156 阈值）/PromptCardFooter | 134945–134997 | 全量逐行 | 高 |
| `gMt/yMt/_Mt/vMt` | OffPeakTaskMenu/OffPeakHistoryTable/状态样式/归一 | 134998–135265 | 全量逐行 | 高 |
| `OMt…LMt` | 模型/思考助手群（isThoughtPreviewReady/buildModeOption/模型组查找/resolveModelLabel/normalizeThoughtOption/resolveThoughtLevelPayload/resolveThoughtPreviewOption/fetchModelThoughtOption 临时会话探测） | 135380–135495 | 全量逐行 | 高 |
| `RMt…KMt/qMt/JMt` | 工作区选项助手群（本地/远程页签判定、选项收集、useWorkspaceOptions、pathTailName、允许思考级别、OffPeak 思考项、neverLocked） | 135496–135575 | 全量逐行 | 高 |
| `qht/q$/J$/Jht/Yht` | automationStatusOf/周序/补零/30 天阈值/isChatCreatedAutomation | 109250–109264 | 逐字 | 高 |
| `Y$/X$/Z$` | scheduleBuilderToCron/cronToScheduleBuilder/weekdayLabel | 109265–109375 | 全量逐行（7 频率分支 + custom 全子支） | 高 |
| `Q$/Xht/Zht/Qht/$$/$ht/egt/tgt` | schedulePreviewText/cronPreviewText（星号/N 直通）/isRepresentableCron/gmtOffsetLabel/formatDateTime/relativeTimeLabel/resolveNextRunLabel/formatRunDuration | 109376–109510 | 全量逐行 | 高 |
| `Y3/XMt` | AutomationScrollArea/Scrollbar | 136026–136057 | 逐行 | 高 |
| `ZMt` | resolveDraftTitleOnDefaultChange（hasInitialDraft 字段；与 Rjt 为源码重复实现，已如实分列） | 136058 | 逐字 | 高 |
| `QMt/$Mt/eNt` | changedFieldsOf/missingRequiredFields/removeFromSet | 136068–136086 | 逐字 | 高 |
| `X3/Z3/tNt` | workspaceOptionKey/findWorkspaceOption/resolveWorkspaceOptionKey | 136087–136099 | 逐字（**勘误**：原用 `Ti`=src `ip` 对象参，已修正 declare `workspaceKey`） | 高 |
| `Q3/nNt/$3/rNt/e6/t6/iNt/n4…` | inherit 哨兵/频率表/页大小 8/区间常量 | 136101–136108 | 逐字 | 高 |
| `aNt/r6/oNt/sNt/cNt` | paginationWindow/pathTailName2/模型组缺省/当前模型/思考项提取 | 136109–136140 | 全量逐行 | 高 |
| `lNt/a6/uNt/dNt` | Select 类名常量/Select 指示器/ScheduleCalendarIcon | 136141–136152 | 逐字（`dNt` 与图标包装族 `qjt` 为不同源符号，语义名已分立避免重名） | 高 |
| `fNt/pNt/mNt/hNt/gNt/_Nt/o6/vNt/yNt/bNt/xNt` | HourMinuteColumn/TimePicker/ValueColumn/daysInMonth/MonthDayPicker/WeekdayPicker/EndDatePicker/CustomRepeatDialog | 136153–136937 | 全量逐行（滚动居中/翻页窗口/月历网格） | 高 |
| `SNt/CNt/s6/wNt/TNt/ENt/DNt/ONt` | runIfSaved/defaultScheduleBuilder/scheduleBuilderOf/automationRunStatusOf/状态色表 ×3/scheduleRulePayload | 136937–137004 | 全量逐行 | 高 |
| `YMt` | **OffPeakTaskEditor** | 135576–136025 | 全量逐行（标题缺省联动/调度删除遗留支/工作区三级回退/思考预览探测缓存/必填校验/变更追踪/未保存确认） | 高 |
| `kNt` | **AutomationEditor** | 137005–138512 | 全量逐行（同 YMt 状态机 + 保存即运行链 + 历史页签 5s 轮询分页） | 高 |

### 1.2 ModalsLeaves.tsx

| 混淆名 | 语义名 | js 行 | 展开方式 | 把握度 |
|---|---|---|---|---|
| `x4t` | resolveHeroThemeStyles（四分支渐变逐字） | 206054 | 逐字 | 高 |
| `S4t` | useHeroTextSizes（system 走暗判定） | 206090 | 逐行 | 高 |
| `C4t` | HeroCard（双光晕卡片壳） | 206094 | 逐行 | 高 |
| `Mc/$se/ece/Pc/tce/Fc/Ic/Lc` | 文件夹 data-uri/material-icons 基址注水/路径/别名/降级链 | 5113–5137 | 逐字 | 高 |
| `Rc/nce/zc` | relativeDisplayPath/displayDirectoryPrefix/resolveFileDisplayInfo | 5138–5156 | 逐字 | 高 |
| `Bc` | **FilePathInline** | 5157 | 全量逐行 | 高 |
| `Vc` | FileIconImg | 5196 | 逐行 | 高 |
| `ahe/dhe` | DIFF_TRUNCATED_MARKER 正则/parseTruncatedMarker | 23153/23226 | 逐字（正则 `^\\ __ZCODE_DIFF_TRUNCATED__:(\d+)$` 逐字） | 高 |
| `mut/hut` | parseDiffLine/diffKindStyles | 100417/100426 | 逐字 | 高 |
| `gut` | **PlainTextDiffPreview**（行号粘性列+截断提示+换行模式） | 100459–100519 | 全量逐行 | 高 |
| `El` | **DiffInteractionManager**（gutter 交互控制器，~820 源行） | 6062–6880 | 全量逐行（指针会话/行选择 shift·pendingSingleLineUnselect·gutterSelecting/renderSelection data-selected-line/ensureGutterUtilityNode slot·button） | 高 |
| `nl/hce/rl/il/al/mce` | isSameSelectionRange/isSameSelectionPoint/hast text·element·icon/gutterUtilityButtonTree | 5249–5313 | 逐字 | 高 |
| `Tl` | serializeHast（vendored hast-util-to-html） | 6020 | 接口级 declare（vendor 件，VENDOR-MANIFEST-LIBS 辖） | 中（接口级） |
| `Ol/kl/Al/vle/yle/ble/jl/Ml/Nl/Pl/Fl` | 指针目标守卫与助手族 | 6959–7012 | 逐字（含 kind:"line"/"token" 双变体联合类型） | 高 |

### 1.3 StoresDeep.tsx

| 混淆名 | 语义名 | js 行 | 展开方式 | 把握度 |
|---|---|---|---|---|
| `Ao…Xie`（§A，28 件） | Vo SearchResultsStore 纯助手块（useSessionActivityStore/withSessionActivity/比较器/键构造/去重/搜索归一/订阅广播/快照固化/成员匹配/排序/浅比较/合并/等价判定/mergeIncomingTaskKeys） | 1297–1552 | 全量逐行 | 高 |
| `pe` | pickBestTaskMetadata（跨 chunk：skillStore `de`+合并器 `y`） | skillStore | declare + 合并语义注释 | 中高（跨 chunk 接口级） |
| `y3/b3/S3/C3/w3` | T3：automationErrorMessage/automationLoadSeq/isSameAutomationWorkspace/findAutomation/loadAutomationsIntoStore | 134084–134110 | 全量逐行 | 高 |
| `ri` | isAutomationLimitError（跨 chunk：src `et`=hx） | src chunk | declare + 常量语义注释 | 中高（跨 chunk 接口级） |
| `Eit` | isTakeNumberFailure（quota_3103） | 91354 | 逐字（与 ExtendedViews 5739 局部 isQuota3103Result 同语义；本文件 canonical） | 高 |
| `K0t/q0t/_9/J0t/Y0t/X0t/v9` | Z0t：hooksWorkspaceKey/hookLocationForScope/isHookEditable/buildNewHook/mergeHookPatch/reloadHooks/saveHooksList | 201185–201243 | 全量逐行 | 高 |
| `N6/uFt/dFt/fFt/pFt/P6/mFt` | F6：refreshSkillsAfterCommandsChange/trimLeadingSlashes/commandNameKey/userCommandToSlashCommand/mergeCommandsIntoSlashCommands/commandsInFlight/commandsWorkspaceKey | 142700–142753 | 全量逐行（`enabled` 可选性按原 `!e.enabled` 语义修正） | 高 |
| `hFt/gFt/I6/L6/R6/_Ft/z6` | B6：pluginErrorMessage/pluginsWorkspaceKey/in-flight 表/runPluginOperation/loadPluginsListDeduped/loadPluginsList（回退链） | 142873–142984 | 全量逐行 | 高 |
| `bFt/V6/yFt` | refreshCommandsAfterPluginSync/refreshPluginsAfterRemoteSync/pluginErrorMessage(局部) | 143135–143180 | 全量逐行（loadedWorkspacePath/Identity 字段按原文保留，补入 store 状态声明） | 高 |
| §H 遥测块（见 §2） | 遥测下沉函数全集 | 40397–41807 | 全量逐行（5 子域） | 高 |

---

## 2. 遥测下沉函数 ×25（Stores.report §2.1/§6 登记项）对照

Stores.report §4 登记“遥测下沉函数（`xw/Zw/dPe/…` 约 25 个）按接口声明（本体分散在 41500–41800）”，
本批在 StoresDeep.tsx §H 将 services.tsx 的 **29 个**下沉函数声明**全部实体化**（40397–41807 全区），覆盖并超出 ×25 登记：

| 子域 | js 范围 | 实体化内容（混淆名摘） |
|---|---|---|
| H.1 供应商域 | 40397–40744 | `bw/hNe` 主机归一、`xw` reportTelemetry、`gNe/_Ne/vNe` 业务错误表、`Sw/yNe/bNe` 错误码→i18n/恢复动作、`SNe/DNe/ONe/kNe/ANe/Cw/jNe` 归一族、`MNe…GNe` chat_error_banner 常量族、`KNe/qNe` 作用域/脱敏、`JNe/YNe/XNe` 恢复动作/截断/归类、`Dw/ZNe/QNe/$Ne` 键与载荷、`ePe` reportVisibleChatError |
| H.2 会话步骤域 | 40752–41420 | 闭包四表 `Ow/kw/Aw/jw`、`tPe…Fw` 供应商/主机/状态工厂、`Iw` createStep、`nPe/rPe` 归一、`Lw` 首 token、`Rw` agent_step 载荷、`zw/Bw` 推理/生成收尾、`Vw/Hw/iPe/Uw/Ww/Gw` 权限等待结算、`Kw` 模型请求公共字段、`oPe/sPe` 压缩、`cPe/qw` 用量、`Jw/lPe` 输入计时、`uPe` 文件变更行数、`dPe/fPe` composer 下沉 ×2、`pPe` 种子明细、`mPe` recordTurnStarted、`hPe` recordModelRequestStatus、`gPe/_Pe` 用量合并、`vPe` 子代理归因、`Yw/Xw` 归属/补收尾、`Zw` finalizeConversationSteps（事件分派状态机）、`yPe/bPe/xPe` 当前模型/消息/用量增量、`SPe/CPe` 权限请求/解决、`wPe` 完成明细、`TPe/EPe/DPe` 全清/会话清/种子清 |
| H.3 plan_usage | 41421–41541 | `Qw/OPe/kPe` 事件名、`$w/APe` 去重集、`jPe` 事件键、`eT/tT` 数值归一、`MPe` 状态映射、`NPe` 去 undefined、`PPe` plan_request 上报、`FPe` recordProviderTtft |
| H.4 ui_perf | 41542–41760 | `nT` 组名、`IPe…qPe` 事件名、`rT/iT/aT` 平台引用/上报、`JPe/oT` 取整、`YPe` 启动链路、`XPe` recordTtft、`ZPe` recordDuration、`QPe` recordConversationResult、`$Pe` recordToolPerformance、`sT/eFe` recordStreamChunkForeground、`cT` clearConversationWaitState、`tFe/nFe/rFe` 输入延迟、`iFe/aFe` 模型名解析、`oFe` chat 公共字段 |
| H.5 监督常量与提取器 | 41761–41807 | `lT/sFe/cFe`=2000/128/200、`lFe` extractPromptSeedFromTurnStarted、`uFe/dFe` 步骤源字段提取 |

---

## 3. 边界裁决记录（与并行 B4 批：F12/Sidebar/Conversation/legacy-doc）

按任务约定，冲突以 **MODULE-MAP 族归属**裁决：

| # | 符号 | 冲突/重叠 | 裁决 | 依据 |
|---|---|---|---|---|
| 1 | `R7` useExternalAgentImportState | Modals.report 接口级登记 | **不重复抽取**：已由 SettingsPanels.tsx 3153 全量抽取 | F06 族既有产物；ModalsLeaves §E 记录 |
| 2 | `v$t` ExternalAgentImportSelectionPane | 同上 | **不重复抽取**：SettingsPanels.tsx 3953 | 同上 |
| 3 | `I2t` useClaudeMigration | 同上 | **不重复抽取**：SettingsPanelsData.tsx 844 | 同上 |
| 4 | `W8` DiffViewer(memo) | 任务清单列名 | **不重复抽取**：CodeViewer.tsx 1124 已实现 | F14 族既有产物 |
| 5 | `q$t/J$t`（+`K$t`） | 本批 StoresDeep §G 曾实体化，与 **B4-1 批 UsageDeep.tsx**（F12 族，18:28 完成，锚点 js 195179/195206 命中）重叠 | **让位**：StoresDeep §G 已改为边界注记，UsageDeep.tsx 为唯一规范实现 | 任务条件“若未被 F12 批覆盖则你做”——F12 批已覆盖；MODULE-MAP F12 归属 |
| 6 | `Eit` isTakeNumberFailure | ExtendedViews.tsx 5739 存在同语义局部 `isQuota3103Result` | StoresDeep.tsx 为 **canonical**（store 层登记位）；ExtendedViews 局部件整合期可改引用 | Stores.report §4 登记在 store 层 |
| 7 | `El/gut/Bc`（F14 族符号） | MODULE-MAP 172 行记“tHt/El/W8/gut 本体仍待 F14 抽取” | 本批按**任务清单直接指派**抽取（杂项接口级叶子）；族归属仍记 F14，整合期并入 CodeViewer 族文件不产生冲突（并行批无 F14 认领） | 任务清单优先；无并行批争议 |
| 8 | cron 域 109250–109510 | 行号落在 F03 段（双归属） | 按消费面归 **F15**（kNt/YMt 直接消费）；F03 报告仅占位 | 与 Conversation 批（Leaves.report.md）无重叠——该批未触碰此区 |
| 9 | F15 尾部助手（ZNt/UNt/BNt…XNt 等） | ExtendedViews.tsx/SettingsPanelsCapability.tsx 已有 declare | 本批仅实体化清单内助手；清单外尾部助手不重复 | 前序批声明位保留 |

与 Sidebar 批（SidebarLeaves.tsx）、Conversation 批（ConversationLeaves.tsx）、legacy-doc 批（LegacyDocEngine*.report.md）：**零行号交集**（各自区段 144351–153205 / F03 三段 / 文档引擎段，均不与 196654–199993、134026–138512、109250–109510、40397–41807、5113–7012、201185–206119 相交），未发生需裁决的冲突；第 5/7/8 条为预防性记录。

---

## 4. 把握度评估（汇总）

| 部分 | 把握度 | 依据 |
|---|---|---|
| SettingsLeaves §A/§B/§C 全部叶子（含 kNt/YMt/m0t/S0t/D0t/n9/V1t 七大根组件） | **高（逐行转录）** | 直接从压缩源码逐句还原；类名、i18n key、日志文案、常量（116/156、页大小 8、2000/128/200 等）逐字核对 |
| ModalsLeaves §A–§D（hero/Bc/gut/El） | **高（逐行转录）** | El 类 ~820 源行全量转录；指针目标联合类型按源 kind 值（line/token/line-info/merge-conflict-action）重建 |
| StoresDeep §A–§F store 深层助手 | **高（逐行转录）** | 与 stores-*.tsx 声明签名逐一吻合；跨 chunk 依赖（skillStore/src）按导入块 336–995 别名核对 |
| StoresDeep §H 遥测 29 下沉函数 | **高（逐行转录）** | 40397–41807 全区转录；闭包四表与状态机分支与 services.tsx 声明一致 |
| 跨 chunk `declare` 件（pe/ri/Tl/Mg/workspaceKey/testid 常量等） | **中（接口级）** | 签名 + 行为注释；值/本体在源 chunk，整合期按 §0 映射接线（testid 值待 src-HCld2afU.js 三级查表） |
| 类型修正项（本轮验证所改） | **高** | 均回溯原文核对：`Mg` vs `se`（196693/196697）、`Ti` 对象参（136087）、`fFt` enabled falsy（142725）、`bFt` loadedWorkspace* 字段（143146–143147）、`s9` 值直渲（198520）、Rjt/ZMt 双实现字段名（134026/136058） |

---

## 5. 验证记录

- **esbuild**（`/home/none/grok-build/web/node_modules/.bin/esbuild --loader:.tsx=tsx --jsx=preserve`）：
  StoresDeep.tsx / ModalsLeaves.tsx / SettingsLeaves.tsx **三件全部 0 错**。
- **tsc**（`--noEmit --strict --jsx react-jsx --skipLibCheck`，target/lib ES2023 + DOM，
  @types/react 取自 `/home/none/grok-build/web/node_modules`，临时目录 `.tmp-b4-check/` 用后即删）：
  **0 错**（首轮 72 错 → 逐项按原文修正后归零；修正清单见 §4“类型修正项”）。
- **out/ 只读核验**：批后 `md5sum` = `c9d0d675d0b858e6e7711df3e9122e81`、`wc -l` = 213,695，与批前一致；会话内对 `out/` 仅读取。

---

## 6. 后续建议

1. 整合期将 Modals.tsx / SettingsPanelsCapability.tsx / stores-*.tsx / services.tsx 中对应 `declare` 存根
   改为自本三文件导入（映射见各文件头注 §一）。
2. testid 常量现为 `declare const TESTID_*` 占位，需按 src-HCld2afU.js 三级查表回填字面值。
3. `Tl`（serializeHast）为 vendored hast-util-to-html，按 VENDOR-MANIFEST-LIBS 流程单独建卡，不并入族文件。
4. `El`/`gut`/`Bc` 族归属 F14：F14 族正式抽取时自 ModalsLeaves.tsx 迁移（勿重录）。
5. q$t/J$t 唯一规范实现为 UsageDeep.tsx；SettingsPanelsData.tsx 的对应 declare 整合期改指向 UsageDeep。
