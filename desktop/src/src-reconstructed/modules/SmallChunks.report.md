# SmallChunks.report.md — B5-11 小 chunk 三件全量重建报告

批次：**B5-11**（B5-FULL-DECODE-PLAN 批次 12 第 1–3 件）
日期：2026-08-28
产物目录：`desktop/src/src-reconstructed/modules/`（仅写入此目录）
原件（只读，未动）：`desktop/src/out/renderer/assets/{skillStore-BmeKHDBI,usageStatsUiParts-CiR7YEhh,process-monitor-DOlutpPR}.js`
行号口径：各 chunk 的 pretty jsx 孪生文件（`desktop/src/src-reconstructed/renderer/assets/*.jsx`）

| 产物 | 行数 | 对应 chunk | jsx 孪生行数 | 模块内符号数 | 对外导出数 |
|---|---|---|---|---|---|
| `SkillStore.tsx` | 4,569 | skillStore-BmeKHDBI | 2,518 | 204 | 48 |
| `UsageStatsUiParts.tsx` | 1,374 | usageStatsUiParts-CiR7YEhh | 747 | 66 | 16 |
| `ProcessMonitor.tsx` | 310 | process-monitor-DOlutpPR | 94 | 18 | 0（入口 chunk） |

---

## 1. 覆盖清单（符号 → jsx 行号）

### 1.1 skillStore-BmeKHDBI（全 204 符号；详见 `SkillStore.tsx` 文件头映射表与文件尾符号表）

**导入（jsx 1–4）**：e→toEsmInterop、t→reactModuleFactory、src-HCld2afU 8 导入（n=F→formatCustomQualifiedModelId、r=M→formatNativeSupplierKey、i=P→parseCustomQualifiedModelId、a=Y→getDefaultModeOptions、o=ds→resolveAgentProvider、s=ot→createUuid、c=q→formatBuiltinQualifiedModelId、l=us→isGlmProvider）、u→logger。

| 域 | 符号（jsx 行） |
|---|---|
| §1 zustand 运行时 | f (6) createStoreImpl · p (26) createVanillaStore · m (27) identitySelector · h (28) useStore【J】· g (32) createBoundStore · _ (38) create【q】 |
| §2 环境/E2E | ee (40) readBuildEnvSnapshot · v (50) isE2EStoreBridgeEnabled【K】 |
| §3 任务状态模型 | te (53) · ne (58) DEFAULT_PROVIDER · re (59) · ie (67) · ae (79) · oe (120) · se (121) · ce (124) · le (127) · ue (131) · y (134) mergeTaskMeta【G】· de (150) mergeTaskMetaMany【W】· b (155) resolveWorkspaceKey【H】· x (158) · fe (162) · pe (169) · S (195) getWorkspaceTaskState【V】· C (200) updateWorkspaceTaskState · w (218) getTaskRuntime【F】· me (221) getActiveTaskStatusError【z】· T (232) getTaskUi【I】· E (235) getMergedTaskListItem【P】· he (240) getMergedTaskList【R】· ge (246) isTaskUnread【L】· _e (249) getWorkspaceTaskStateAlias【U】· ve (252) getWorkspaceInit【B】 |
| §4 导航历史 | ye (255) LIMIT=50 · be (256) · xe (262) · Se (265)【N】· Ce (268) · we (271) · Te (287) · Ee (297) · De (309)【j】· Oe (312)【M】· ke (315) · Ae (327) · je (339) · Me (350) createTaskNavActions（含 taskNavHistory 初态 + 4 动作） |
| §5 草稿持久化 | Ne (377) 前缀 · Pe (378) `__draft__` · Fe (379) · Ie (387) · Le (391) · Re (412) |
| §6 等价性 | ze (427) · Be (430) · Ve (436) · He (439) · Ue (445) · We (448) · Ge (453) · Ke (456) · qe (459) · Je (462) |
| §7 运行时动作 | Ye (465) · Xe (476) createTaskRuntimeActions（16 动作，jsx 476–849） |
| §8 供应商/模型持久化 | Ze (850) · Qe (851) · $e (859) · et (862) · tt (863) · nt (872) · rt (878)【k】· D (881)【O】· it (884)【A】· O (887) · at (888) · ot (889) · k (890) · A (891) · st (892) `glm-5.2` · ct (893) 日期模型正则 · lt (894) `max` · ut (895) · j (896) · dt (904) · M (907) · ft (910) · pt (913) · N (916) · P (919) · F (922) · mt (925) · ht (928) · gt (931) · _t (944) · vt (953) · I (958)【w】· yt (962)【T】· bt (966) · xt (981) · St (984) · Ct (996) · L (999)【x】· wt (1014)【S】· R (1018)【E】· Tt (1039)【D】· Et (1042)【C】· Dt (1051)【y】· Ot (1056)【v】· z (1067)【b】· kt (1071) · At (1081) · jt (1084) · Mt (1087) · Nt (1090) · Pt (1093) · B (1097) · Ft (1103)【_】· It (1109) · Lt (1112) |
| §9 模型切换守卫 | Rt (1118) 缓存【只读预留】· V (1119) · zt (1124) · Bt (1127) · Vt (1130) · Ht (1134) · Ut (1139) · Wt (1142) · Gt (1145) · Kt (1148) · qt (1153) · Jt (1157) |
| §10 ID 归一/选项装配 | Yt (1187) · Xt (1198) · Zt (1201) · Qt (1209) · $t (1213) · en (1218) · tn (1230) · nn (1243) · rn (1253) · an (1266) · on (1278) · sn (1294)【g】 |
| §11 分组草稿/模式 | cn (1316) · ln (1317) · un (1320) · H (1330) · dn (1333) · fn (1341) · pn (1344) · mn (1347) · U (1361) · hn (1366) · gn (1378) · _n (1391) |
| §12 状态动作族 | vn (1411) createTaskStateActions（25 动作，jsx 1411–1792） |
| §13 useTaskStore | yn (1794)【h】+ E2E 挂载 (1800) |
| §14 白板 | bn (1802) 1280 · xn (1803) 800 · Sn (1804) `#111827`【c】· Cn (1805) 事件名【s】· wn (1806) `#ffffff` · W (1807)【l】· Tn (1813) · En (1826) · Dn (1833)【d】· On (1842)【p】· kn (1849) · An (1861) · jn (1868)【u】· Mn (1879)【m】· Nn (1882)【f】· Pn (1890) · Fn (1893) · G (1898) · K (1904) · In (1923) useWhiteboardStore【o】+ E2E (2014) |
| §15 子代理上下文 | q (2015) · J (2016) · Ln (2017) · Y (2018)【i】· X (2021) · Rn (2029) · zn (2043) · Bn (2094) useSubagentContextsStore【a】 |
| §16 子代理单例 | Z (2135) · Vn (2136) · Hn (2137) · Un (2140) · Wn (2155) · Q (2158) · Gn (2161) useSubagentsStore【r】+ E2E (2356) · Kn (2357)【n】 |
| §17 技能 | $ (2368) · qn (2369) · Jn (2372) · Yn (2387) useSkillsStore【t】+ E2E (2517) |
| 导出语句 | jsx 2518（48 个） |

### 1.2 usageStatsUiParts-CiR7YEhh（全 66 符号）

**导入（jsx 1–8）**：e→toEsmInterop、t→commonJsModule、n→reactModuleFactory、r→jsxRuntimeModuleFactory、i→isApplePlatform（keyboardShortcuts a）、dist-DJJArJ7D 13 导入（a→createContextScope、o→createPopperScope、s→Portal、c→Primitive、l→PopperRoot、u→DismissableLayer、d→useId、f→PopperArrow、p→useControllableState、m→PopperContent、h→Presence、g→Slot、_→composeEventHandlers）、dist-vnZIbudW（v→useComposedRefs、y→createSlottable）、b→cn。

| 段 | 符号（jsx 行） |
|---|---|
| A radix tooltip | x (9) · S (10) · C (11) VISUALLY_HIDDEN_STYLE【g】· w (23) · T (24) VisuallyHidden · E (29) · D (30) shim 工厂 · ee (80) useSyncExternalStoreShim【h】· [O,te] (83) [TooltipScope, useTooltipScopeFactory] · k (84) useTooltipPopperScope · A (85) · ne (86) 700 · j (87) `tooltip.open` · [re,M] (88) · N (89) TooltipProvider · P (122) · [ie,F] (123) · I (124) Tooltip · L (187) · R (188) TooltipTrigger · z (217) · [ae,oe] (218) · B (221) TooltipPortal · V (243) · H (244) TooltipContent · se (261) TooltipContentHoverable · [ce,le] (312) · ue (315) · U (316) TooltipContentBase · W (372) · de (373) TooltipArrow · fe (386) resolveNearestSide · pe (404) getSideOffsetPoints · me (446) getRectCornerPoints · he (467) isPointInPolygon · ge (484) getSortedHullPoints · _e (488) getConvexHull · ve/ye/be/xe/Se (513–517) 五别名 |
| B shadcn 封装 | Ce (518) ShadcnTooltipProvider【p】· G (528) ShadcnTooltip【d】· K (536) ShadcnTooltipTrigger【m】· q (544) ShadcnTooltipContent【f】· J (554) TOOLTIP_KBD_CLASS · Y (555) setRefValue |
| C 用量 UI | X (564) InfoTooltip【u】· Z (599) formatNumberCompact【l】· Q (609) USAGE_HEATMAP_COLORS · we (610) 53 · $ (611) 7 · Te (612) 864e5 · Ee (613) formatCountCompact【i】· De (619) formatTokens【a】· Oe (622) formatPercent【s】· ke (628) formatUtcDateShort【o】· Ae (637) resolveModelLabel【c】· je (642) heatmapCellStyle · Me (647) formatHeatmapCellLabel · Ne (656) UsageStatCard【r】· Pe (669) UsageEmptyState【t】· Fe (675) dayIndexOfDate · Ie (679) dateOfDayIndex · Le (682) createEmptyHeatmapCell · Re (691) normalizeHeatmapWeeks · ze (715) UsageHeatmap【n】· Be (739) UsageHeatmapCell |
| 导出语句 | jsx 747（16 个） |

### 1.3 process-monitor-DOlutpPR（全 18 符号）

**导入（jsx 1–5）**：e→toEsmInterop（chunk-Cq_f4orQ s）、t→watchUiFontSizeStorageChanges（styles J=Tie）、n→applyUiFontSizeCssVariable（styles K=mo）、r→readStoredUiFontSizePx（styles q=po）、i→reactDomClientModule（imeComposition P）、a→reactModuleFactory、o→jsxRuntimeModuleFactory。

| 符号（jsx 行） | 语义名 |
|---|---|
| s (6) | ReactInterop |
| c (7) | ReactDOMClient |
| l (8) | jsxRuntime |
| u (9) | PROCESS_MONITOR_MESSAGES（zh-CN/en-US，8 键×2） |
| d (31) | resolveThemeDarkness |
| f (34) | applyStoredThemeClasses |
| p (40) | resolveStoredLocale |
| m (43) | countProcessTreeNodes |
| h (46) | PROCESS_GRID_TEMPLATE_COLUMNS |
| g (47) | formatMemoryMegabytes |
| _ (52) | ProcessTreeNodeRow（递归） |
| v (61) | ProcessMonitorApp（1s 轮询 window.processMonitor） |
| y (93) | rootElement（#root） |
| 引导 (94) | `createRoot(#root).render(<ProcessMonitorApp/>)` + 主题/字号引导 |

---

## 2. 导出别名表（对外 export 别名 → 内部混淆符号 → 语义名）

### 2.1 skillStore（jsx 2518，48 个；styles 侧局部名见 styles js 372–420 导入块）

| 别名 | 内部 | 语义名 | 别名 | 内部 | 语义名 |
|---|---|---|---|---|---|
| A | it | filterNativeModelOptions | a | Bn | useSubagentContextsStore |
| B | ve | getWorkspaceInit | b | z | hasThoughtLevelOption |
| C | Et | updateLastAgentModel | c | Sn | WHITEBOARD_DARK_COLOR |
| D | Tt | readLastAgentModelOnly | d | Dn | createWhiteboardStroke |
| E | R | readLastAgentModelConfig | f | Nn | dispatchWhiteboardAddToChat |
| F | w | getTaskRuntime | g | sn | buildTaskConfigOptionsFromMeta |
| G | y | mergeTaskMeta | h | yn | useTaskStore（styles `xe`） |
| H | b | resolveWorkspaceKey | i | Y | getSubagentContextScopeKey |
| I | T | getTaskUi | j | De | canGoBackInTaskNav |
| J | h | useStore | k | rt | formatCustomModelId |
| K | v | isE2EStoreBridgeEnabled | l | W | resolveWhiteboardWorkspaceKey |
| L | ge | isTaskUnread | m | Mn | isWhiteboardAddToChatEvent |
| M | Oe | canGoForwardInTaskNav | n | Kn | refreshSubagentStoresForWorkspace |
| N | Se | isTaskNavAutomationsEntry | o | In | useWhiteboardStore |
| O | D | parseCustomModelId | p | On | renderWhiteboardToContext |
| P | E | getMergedTaskListItem | **q** | _ | **create（styles `Ae`，20 store 创建点基础）** |
| R | he | getMergedTaskList | r | Gn | useSubagentsStore |
| S | wt | persistLastAgentConfigIfUnchanged | s | Cn | WHITEBOARD_ADD_TO_CHAT_EVENT |
| T | yt | getCurrentThoughtLevelValue | t | Yn | useSkillsStore（styles `Ne`） |
| U | _e | getWorkspaceTaskStateAlias | u | jn | whiteboardToPngFile |
| V | S | getWorkspaceTaskState | v | Ot | applyStoredModelToOptions |
| W | de | mergeTaskMetaMany | w | I | getCurrentModelValue |
| _ | Ft | applyStoredConfigToOptions | x | L | writeLastAgentConfig |
| | | | y | Dt | clearLastAgentModelConfig |
| | | | z | me | getActiveTaskStatusError |

（无 Q/e 导出；共 48。）

### 2.2 usageStatsUiParts（jsx 747，16 个；styles 侧局部名见 styles js 902–918 导入块）

| 别名 | 内部 | 语义名 | styles 侧局部名 |
|---|---|---|---|
| a | De | formatTokens | Da |
| c | Ae | resolveModelLabel | Jre |
| d | G | ShadcnTooltip | Oa |
| f | q | ShadcnTooltipContent | ka |
| g | C | VISUALLY_HIDDEN_STYLE | Yre |
| h | ee | useSyncExternalStoreShim | Xre |
| i | Ee | formatCountCompact | Aa |
| l | Z | formatNumberCompact | ja |
| m | K | ShadcnTooltipTrigger | Ma |
| n | ze | UsageHeatmap | Zre |
| o | ke | formatUtcDateShort | Na |
| p | Ce | ShadcnTooltipProvider | Na |
| r | Ne | UsageStatCard | Pa |
| s | Oe | formatPercent | Qre |
| t | Pe | UsageEmptyState | Fa |
| u | X | InfoTooltip | Ia |

styles 侧逐字对照（styles js 902–918）：`a as Da, c as Jre, d as Oa, f as ka, g as Yre, h as Xre, i as Aa, l as ja, m as Ma, n as Zre, p as Na, r as Pa, s as Qre, t as Fa, u as Ia`。

### 2.3 process-monitor（入口 chunk，无导出）

末行 `y && createRoot(y).render(<ProcessMonitorApp/>)`（y = `#root`）；副作用 = 主题类 + 字号 CSS 变量引导 + 渲染。

---

## 3. 边界裁决（只记录，不改既有文件）

1. **MODULE-MAP §3「Na/Oa/Ma/ka → Popover」勘误**：实测 styles js 902–918，`Na/Oa/Ma/ka` = 本 chunk 导出 `p/d/m/f` = ShadcnTooltipProvider/ShadcnTooltip/ShadcnTooltipTrigger/ShadcnTooltipContent，全部属 **Tooltip 族**，与 Popover 无关。建议 MODULE-MAP 维护方更正 §3 该行。
2. **E2E window 全局类型口径**：本批 `SkillStore.tsx` 将 `__zcodeSessionStoreE2E/__whiteboardStoreE2E/__subagentsStoreE2E/__skillStoreE2E` 声明为 `unknown`（挂载点与 `e2eStoreBridgeBootstrap.tsx` 完全相同，运行时一致）；后者声明为 `AnyZustandStore`。两文件各自独立通过门禁；**集成编译时需统一为单一 `declare global`**（建议沿用 e2eStoreBridgeBootstrap 的 `AnyZustandStore` 口径）。
3. **导出 U（内部 `_e`）命名冲突**：QuickPick 侧称 `getWorkspaceState`、ExtendedViews 侧称 `selectProviderConfigState`——本重建取规范名 **getWorkspaceTaskStateAlias**（函数体即 `S`/getWorkspaceTaskState 的身份别名，jsx 249）。
4. **styles 账目漂移（非本批引入）**：COVERAGE-LEDGER §a 记 styles-CdEGpc2x.js 为 213,695 行；当前 `out/` 快照实测 **213,979 行，md5 `48d71d4874b0868d61fd35a328bf6ad5`**（B4 之后 out/ 快照有更新）。本批三件为独立 chunk，不依赖 styles 行号（仅引用 styles js 372–420/902–918/1040–1062 导入块与字号助手段，均已按当前快照核对）。建议账目维护方刷新 §a 基数。
5. **vendored radix 定性**：usageStatsUiParts jsx 10–517 是 radix-ui/react-tooltip 的内联实现（createContextScope/Popper 作用域/Presence/DismissableLayer 等），被打包进 first-party 注册的 chunk。本重建逐字转录并按 VENDOR-MANIFEST-LIBS 口径标注上游（radix-ui tooltip），不视为 first-party 逻辑。
6. **process-monitor 文案副本**：该 chunk 自带 zh-CN/en-US 双语文案表（8 键），与 IntlProvider 词典 chunk 的 `processMonitor.*` 前缀条目为**同源副本**（独立 BrowserWindow 不走 IntlProvider）。两处文案逐字一致，重建时以本 chunk 为准。
7. **useSkillsStore 命名**：SYMBOL-INDEX 曾按 e2eStoreBridgeBootstrap 口径登记 `Yn`→useSkillStore（无 s）；MODULE-MAP §2.1 登记为 useSkillsStore。本重建从 MODULE-MAP（store 内部字段为 `skills`，服务为 skillsService，复数语义更强）；两处登记待索引维护方合一。
8. **modelSwitchGuardCache（Rt）只读预留**：全 chunk 无 `Rt.set(...)` 调用（仅 get/过期 delete），即 3.7.6 中守卫条目恒空、`reconcileConfigOptionsWithGuard` 恒返回 `nextOptions` 副本。结构逐字保留，语义标注为预留钩子。
9. **createTaskNavActions 含状态初值**：`Me` 返回对象首键为 `taskNavHistory: be()`（状态字段与动作混在同一工厂，经 spread 并入 useTaskStore 初态）——逐字保留该结构。

---

## 4. 验证记录（四项门禁）

### 4.1 门禁 1 — esbuild（`--loader:.tsx=tsx --jsx=preserve`）

| 产物 | 命令 | 结果 |
|---|---|---|
| SkillStore.tsx | `web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/SkillStore.tsx --loader:.tsx=tsx --jsx=preserve` | ✅ 0 错（109.1kb） |
| UsageStatsUiParts.tsx | 同上（换文件名） | ✅ 0 错 |
| ProcessMonitor.tsx | 同上（换文件名） | ✅ 0 错 |

### 4.2 门禁 2 — tsc strict（每件独立 tsconfig）

`/tmp/tsconfig.{skillstore,usagestatsuiparts,processmonitor}.json`：`strict`、`target/lib ES2022(+DOM)`、`jsx: preserve`、`moduleResolution: Bundler`、`typeRoots → web/node_modules/@types`、include 仅该产物；另以 `paths` 将 react 指向 `web/node_modules/@types/react`（desktop/src/node_modules 内 react@19.2.8 无类型且遮蔽解析，详见既有批次同法）。

| 产物 | 命令 | 结果 |
|---|---|---|
| SkillStore.tsx | `web/node_modules/.bin/tsc -p /tmp/tsconfig.skillstore.json` | ✅ 0 错 |
| UsageStatsUiParts.tsx | `... /tmp/tsconfig.usagestatsuiparts.json` | ✅ 0 错 |
| ProcessMonitor.tsx | `... /tmp/tsconfig.processmonitor.json` | ✅ 0 错 |

（SkillStore 首轮 6 错已修复：`createBoundStore` 返回类型补 `BoundStoreHook<T>`（getState 静态可见）；`createTaskNavActions` 补 `taskNavHistory` 初态（此亦为逐字性修正）；`normalizeContextWindow` 入参收窄 `number | null`；`parseLastAgentConfig` 入参放宽 `string | null`（原码即以 `!raw` 拦截）。）

### 4.3 门禁 3 — 锚点回代（≥8/件；字符串在产物与 jsx 孪生双向逐字命中）

**SkillStore.tsx（15 锚点）**

| # | jsx 行 | 锚点字符串（逐字） |
|---|---|---|
| 1 | 377 | `zcode-chat-composer-drafts:v1:` |
| 2 | 893 | `/^glm-\d{4}(?:$|[^0-9a-z])/` |
| 3 | 1318 | `` `grouped-draft-${ `` |
| 4 | 1696 | `[store] setConfigOptions` |
| 5 | 1805 | `zcode:add-whiteboard-to-chat` |
| 6 | 1865 | `Canvas context is unavailable.` |
| 7 | 1871 | `Whiteboard image data is invalid.` |
| 8 | 1890 | `/[<>:"/\\|?*]+/gu` |
| 9 | 2075 | `[subagents] workspace context load failed` |
| 10 | 2292 | `` `new:${ `` |
| 11 | 1199 | `<synthetic>` |
| 12 | 1173 | `authoritativeConfig` |
| 13 | 1462 | `` `session-${ `` |
| 14 | 2406 | `skillsService is required` |
| 15 | 2181 | `subagentsService is required` |

**UsageStatsUiParts.tsx（10 锚点）**

| # | jsx 行 | 锚点字符串（逐字） |
|---|---|---|
| 1 | 87 | `tooltip.open` |
| 2 | 355 | `"--radix-tooltip-content-transform-origin"` |
| 3 | 551 | `origin-(--radix-tooltip-content-transform-origin)` |
| 4 | 523 | `tooltip-provider` |
| 5 | 540 | `tooltip-trigger` |
| 6 | 639 | `settings.usage.unknownModel` |
| 7 | 649 | `settings.usage.heatmapCell` |
| 8 | 732 | `settings.usage.heatmapTitle` |
| 9 | 612 | `864e5` |
| 10 | 358 | `var(--radix-popper-anchor-width)` |

**ProcessMonitor.tsx（11 锚点）**

| # | jsx 行 | 锚点字符串（逐字） |
|---|---|---|
| 1 | 46 | `minmax(180px, 1fr) 84px 84px 96px` |
| 2 | 35 | `zcode-theme` |
| 3 | 32 | `zai-dark` |
| 4 | 41 | `zcode-locale-preference` |
| 5 | 32 | `(prefers-color-scheme: dark)` |
| 6 | 11 | `进程监控` |
| 7 | 16 | `个进程` |
| 8 | 17 | `正在读取进程指标...` |
| 9 | 18 | `进程监控接口不可用` |
| 10 | 21 | `Process Monitor` |
| 11 | 38 | `theme-zai-light` |

36/36 全部双向命中（`grep -F` 产物与 jsx 孪生各一次）。

### 4.4 门禁 4 — 报告完整性

本报告含：覆盖清单（§1）、导出别名表（§2）、边界裁决（§3）、验证记录（§4）、把握度分级（§5）。

### 4.5 原件未动抽验（md5）

| 原件 | 基线（开工前） | 完工后 | 判定 |
|---|---|---|---|
| skillStore-BmeKHDBI.js | `cf645294bd15465fddbc5609008796a7` | `cf645294bd15465fddbc5609008796a7` | ✅ 未变 |
| usageStatsUiParts-CiR7YEhh.js | `c43768a66e01e7f5d37c2452ce17c0eb` | `c43768a66e01e7f5d37c2452ce17c0eb` | ✅ 未变 |
| process-monitor-DOlutpPR.js | `55357b5f3dd4ef9c1e2f1a823d2df223` | `55357b5f3dd4ef9c1e2f1a823d2df223` | ✅ 未变 |

---

## 5. 把握度分级

| 件 | 高 | 中高 | 中 |
|---|---|---|---|
| SkillStore.tsx | 字符串常量/正则/分支结构/存储键/动作族全件逐字；48 导出逐一核对 | 状态字段类型（按调用面归纳，字段名逐字）；`SubagentDescriptor/SkillDescriptor/SubagentsService/SkillsService` 接口（服务真实形状在未重建 src-HCld2afU） | — |
| UsageStatsUiParts.tsx | A 段 vendored radix 逐字转录；B/C 段类名/键名/分支零改动 | — | — |
| ProcessMonitor.tsx | 全件高（94 行全量逐字） | — | — |

## 6. 遗留问题

1. E2E window 全局的 `unknown` vs `AnyZustandStore` 类型统一（集成编译时处理；见 §3.2）。
2. SYMBOL-INDEX 中 `Yn` 命名合一（useSkillStore vs useSkillsStore；见 §3.7）。
3. COVERAGE-LEDGER §a styles 基数刷新（213,695 → 213,979；见 §3.4）。
4. MODULE-MAP §3 Popover→Tooltip 勘误回写（见 §3.1）。
5. `src-HCld2afU` 未重建：本批 8 个导入（模型限定 ID/供应商键/缺省模式表/uuid 等）以 `declare` 挂接，待该 chunk 批次落地后替换为真实引用。
6. `modelSwitchGuardCache` 写入方缺失（3.7.6 即如此）：若后续版本出现 set 调用，需在本文件补对应动作。
