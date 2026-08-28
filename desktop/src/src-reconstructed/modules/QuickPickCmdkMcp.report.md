# QuickPickCmdkMcp.report.md — B5-07 覆盖报告

批次：**B5-07 QuickPick 深部（ZS 13 助手）+ zZ cmdk 弹层深部 + MCP 纯助手群 + 协议/杂项常量 逐字重建**
产物：`QuickPickDeep.tsx`（1,697 行）/ `CmdkPaletteDeep.tsx`（1,804 行）/ `McpHelpers.tsx`（529 行）+ 本报告。
主口径：`desktop/src/out/renderer/assets/styles-CdEGpc2x.js`（本机副本 213,979 行，md5 `48d71d4874b0868d61fd35a328bf6ad5`，全程只读，完成后复验未变）。

## §0 口径与行号偏移

旧报告（QuickPick/TopBar/SettingsPanels/WorkspaceShell 等）基于 213,695 行副本；本机副本行号偏移：

| 区域 | 旧→本机偏移 | 例 |
|---|---|---|
| 32k / 95k–96k / 155k / 193k 前段 | +48 | zZ 96589→96637；qQt 193303→193351 |
| 131k（resizable） | +17 | cAt 131422→131439 |
| 193k（SettingsLeaves 头注口径） | +~295 | qQt 193056→193351 |
| 203k（迁移尾部） | +290 | k2t 203136→203426；I2t 203145→203440（SettingsPanelsData 头注 203145 为旧口径） |

本报告与三件产物头注/符号表一律使用**本机 js 行号**；旧口径换算见上表。任务书中的 `155522–155824 / 157977–158525 / 158854–159974` 为 **jsx 行号**（SettingsPanels.report §1.2/§7 口径），对应本机 js `193351–193633 / 196654–197541 / 198144–199993`。

## §A QuickPick 深部（QuickPickDeep.tsx）

### A.1 覆盖清单（符号 → 本机 js 行）

| 段 | 符号（混淆 → 语义） | 本机 js 行 |
|---|---|---|
| §1 事件分类 | nOe→TASK_META_REFRESH_REASONS / rOe→META_ONLY_REFRESH_REASONS / iOe→MEMBERSHIP_TOGGLE_REASONS / nx→isMembershipToggleReason / aOe→isTaskDeletedReason / rx→needsMetaRefresh / oOe→isMembershipRetainReason / ix→isArchivedLikeReason / sOe→shouldSkipMembershipSync | 32249 / 32257 / 32258 / 32259 / 32262 / 32265 / 32273 / 32276 / 32285 |
| §2 未读同步 | dOe→UNREAD_PERSIST_DEDUPE_MS / fOe→UNREAD_PERSIST_DEDUPE_MAX / fx→unreadPersistDedupe / pOe→isTerminalStatus / mOe→unreadPersistDedupeKey / hOe→isUnreadPersistDeduped / gOe→isBackgroundTerminalUnreadEvent / px→syncBackgroundTerminalUnread；Ho 1885 / tae 1905 / nae 1908 / Wo 1911（declare，services §G 口径） | 32330–32412 |
| §3 成员保持 | mx/hx→membershipHold/Stats / _Oe→armMembershipRefreshHold / vOe→releaseMembershipRefreshHold / yOe→membershipHoldEnter / bOe→waitMembershipRelease | 32414–32438 |
| §4 加载 | gx/_x/vx/yx/bx/xx/Sx/xOe/Cx（loadTaskListShard 族，含 throw `tasks-index task 行读取不完整`） | 32439–32527 |
| §5 快照缓存 | wx/SOe/Tx/COe/wOe/Ex/TOe/EOe（SNAPSHOT_CACHE_MAX=8） | 32528–32577 |
| §6 合并 | DOe/Dx/OOe/kOe/Ox/AOe/jOe（ZS 深部合并助手，含 Ex/Ox/sje 族之 Ex/Ox） | 32578–32721 |
| §7 协议常量 | FS→INITIAL_SESSION_INDEX_STATE / UAe→RUNTIME_RESTART_BASE_DELAY_MS=100 / WAe→…MAX=5e3 / GAe→…RESET=3e4 / KAe→SUBSCRIBE_RETRY_BACKOFF_MS=[250,1e3,3e3] / qAe→isLockFileContentionError / JAe→isAgentRuntimeUnavailableError / IS→unsubscribeQuietly / YAe→applyFrameToIndexState | 34986–35028 |
| §8 键助手+主钩 | US/ZAe/GS/$Ae/KS/qS/eje/JS(useSessionIndexShards)/YS/tje/nje/rje/XS/ije | 35443–35662 |
| §9 计划助手 | aje/oje/sje(buildShardPlan)/cje/lje（ZS 13 助手之余 5 件；Ex/Ox 见 §5/§6） | 35663–35775 |
| §10 拖拽碰撞 | Lzt/Rzt/F8/zzt/Bzt/I8/L8/R8/Vzt/Hzt/Uzt/Wzt/Gzt/Kzt(groupedCollisionDetection)/qzt/Jzt/Yzt/Xzt/Zzt/Qzt/$zt/z8/eBt(DROP_ANIMATION_CONFIG)/tBt(AUTO_SCROLL_THRESHOLDS)/nBt/rBt/iBt/aBt/oBt | 155248–155500 |

### A.2 排除与边界

- **Vo（SearchResultsStore）纯助手块**：已随 StoresDeep §A 抽取 → 本件仅 declare（头注列明）。
- **ux/dx（bumpUnreadRevision 等）**：services.tsx §G.1 已实现 → declare。
- **bS/XAe/QAe/VS/HS/BS**（FrameAssembler/SessionIndexStore/WorkspaceSubscriptionSet 及实现）：services.tsx §G.4–G.6 已实现 → 本件不转录；仅转录 services 未覆盖的协议面（§7）与消费钩（§8）。
- **zS/WS**：services.tsx 4190–4191 已 declare → 本件保持 declare，不重复物化。
- **KAe/GAe/UAe/WAe/YAe/Tte/Ane**：Tte/Ane/zte(=src chunk `ks`) 属 src-HCld2afU.js（B5-10 协议宿主批次）→ declare/注记。
- **KX（92249）dnd 基线碰撞**：vendored dnd-kit 变体 → declare `dndBaselineCollision`，不转录。
- **u8/d8/bIt/xIt/n8/vIt（145103–145128 等）**：Sidebar.tsx 已实现（模块内私有，811–835 区域）→ 本件 declare；集成时需 Sidebar 导出或上提。
- **协议/杂项常量并入说明**：计划原列独立产物 `ProtocolHostConstants.ts`；因常量（FS/UAe/WAe/GAe/KAe/qAe/JAe/IS/YAe）与 §8 钩子同块共生且任务产物清单只列三件 tsx，并入 QuickPickDeep §7，不另出文件。

## §B zZ cmdk 弹层深部（CmdkPaletteDeep.tsx）

### B.1 覆盖清单（符号 → 本机 js 行）

| 段 | 符号（混淆 → 语义） | 本机 js 行 |
|---|---|---|
| §1 助手群 | MZ→resolveBranchDisplayLabel / bst→branchFilterMatches / xst→firstIssue / Sst→isOverwriteIssueCode / Cst→issueErrorI18nKey / wst→successToastI18nKey / Tst→splitVisibleIssuePaths / Dst→filesOfIssuePaths / Ost→checkpointCommitMessage / kst→formatShortList / Ast→buildSwitchAssistState | 95015 / 95020 / 95024 / 95027 / 95032 / 95054 / 95061 / 95097 / 95113 / 95119 / 95127 |
| §2/§3 对话框 | jst→CreateBranchDialog / Mst→SwitchAssistDialog | 95169 / 95262 |
| §4 图谱引擎 | FZ→shortHash / Nst→RefKindIcon / Pst→formatAuthoredAt / Fst→CommitDetailPanel / Ist→MISSING_PARENT_ROW_INDEX / Lst→GraphLine / Rst→GraphVertex / zst→buildGraphVertices / Bst→allocateColourIndex / Vst→connectMergeParent / Hst→walkBranchLine / Ust→processVertex / Wst→layoutCommitGraphBranches / Gst–Yst 常量 / IZ→curvePath / LZ→pointPixels / Xst→buildEdgePath / Zst→buildLaneSegmentPath / Qst→buildTruncatedEdges / $st→computeCommitGraphLayout / ect,tct,nct,rct,ict,act,oct / sct,cct,lct,uct | 95567–95967 |
| §5/§6 图谱视图 | dct→CommitGraphView / RZ→GRAPH_PAGE_SIZE=50 / fct→CommitGraphDialog | 95968 / 96282 / 96283 |
| §7 状态钩 | pct→useGitBranchSwitcher | 96410–96636 |

### B.2 边界裁决

1. **范围延展**：任务严格区间为本机 96637–97748（旧 96589–97700），其中 zZ 本体（96637–96942）已随 **TopBar.tsx §5.6 GitBranchChip** 语义重建（类名逐字），96943 起为 GitReview 族。为兑现 TopBar.report §7 登记的“zZ 深部”欠账，本件向后延展至 **95015–96636**，逐字物化 TopBar.tsx 以 declare 挂起的全部深部（pct/MZ/jst/Mst/fct/dct + 图谱引擎 + §1 助手群）。
2. **zZ 本体不重复转录**：TopBar.tsx 2511+ 已有完整 GitBranchChip；其 declare 组（2690–2718：useGitBranchSwitcher/resolveBranchDisplayLabel/Popover 三件/Command 六件/CreateBranchDialog/CommitGraphViewer/SwitchAssistDialog）与本件导出同名对应，集成时改指本件。
3. **NZ/Est/PZ（95065/95091/95124）**：行号落在 F00 区间但语义属提交对话框，已随 GitReview.tsx 抽取（mapChangeFilesToRows/summarizeFileRows/hasGitIdentity，2956/2982/2990）→ 本件仅 declare（MODULE-MAP §F00 备注同判）。
4. **mct 起点 96943（旧 96895）起的 Git 审查族段（至 98056）**：已随 GitReview.tsx 抽取 → 本件止于 96942，仅注记。
5. **cmdk 封装 Yb/Xb/Zb/Qb/$b/ex、Popover T/h/x、XH/ZH、N_/kv**：仅被 zZ 本体消费，zZ 既在 TopBar.tsx 物化，本件不声明（避免双重 declare）。

## §C MCP 纯助手群 + 迁移助手尾部（McpHelpers.tsx）

### C.1 覆盖清单（符号 → 本机 js 行）

| 段 | 符号（混淆 → 语义） | 本机 js 行 |
|---|---|---|
| §1 | qQt→PLUGIN_COMPONENT_KIND_SEQUENCE | 193351 |
| §2 | N7→matchesScopedQuery / XQt→splitSkillsByScope / ZQt→splitCommandsByScope / QQt→filterZcodeAgentMcpServers | 193380 / 193384 / 193397 / 193409 |
| §3 | $Qt→pluginMcpServerRows / P7→unwrapPluginServerName / e$t→resolveRuntimeServerName / t$t→runtimeStateProjection | 193414 / 193440 / 193444 / 193447 |
| §4 | n$t→syncResourceKey / F7→jsonStringify / r$t→parseSyncResourceKey / i$t→groupImportPlans / a$t→errorMessageText / o$t→taskResultsOfCategory | 193471 / 193474 / 193477 / 193494 / 193525 / 193528 |
| §5 | s$t→agentDisplayLabel / I7→categoryOfAgentResult / c$t→SYNC_SCOPES / l$t→SYNC_IMPORT_MODES / u$t→importScopeI18nKey / L7→itemsOfCategory / d$t→normalizeSlashes / f$t→scopeOfPath / p$t→sourceRootsOfAgent / m$t→scopeRowsOfAgents | 193541–193633 |
| §6 迁移尾 | k2t→MIGRATION_DEFAULT_LIMIT=100 / A2t→MIGRATION_MAX_LIMIT=500 / j2t→MIGRATION_UNLIMITED / M2t→MIGRATION_RANGE_DURATIONS / N2t→modifiedSinceOfRange / P2t→parseScanLimit / F2t→resolveWorkspaceFilterMode | 203426–203439 |

### C.2 排除与边界

- **JQt/YQt（193352/193366）**：SettingsLeaves.tsx 2706/2692 已实现（extractComponentsFromDescribe/extractComponentsFromInfo，qQt 数组已内联）→ 仅注记。
- **h$t/g$t/_$t（193634–193642）+ R7/z7/M7**：导入对话框族，SettingsPanels.tsx §8 已实现（4047–4056、3153、3764）；三薄包装位于本件区段终点 193633 之后 → 仅注记。
- **I2t（203440）**：SettingsPanelsData.tsx 843 已实现（useClaudeMigration）→ 仅注记；其 declare 组（SettingsPanelsData 820–823：resolveWorkspaceFilterMode/parseScanLimit/modifiedSinceOfRange/MIGRATION_DEFAULT_LIMIT）与本件 §6 导出重名，**集成时改指本件**。COVERAGE-LEDGER 行 245 已预裁决“R7/I2t/v$t 不重复抽取”。
- **子代理段（jsx 157977–158525 = js 196654–197541）/插件段（jsx 158854–159974 = js 198144–199993）**：SettingsLeaves §A/§B 全量抽取 → 不转录。
- **XQt/ZQt 双重存在**：SettingsPanelsCapability.tsx 537/2435 以 splitSkillsByScope/splitCommandsByScope declare 挂起；本件逐字物化（二者不在已抽取段内），集成时改指。
- **ki/ft（命令类型守卫）**：跨 chunk（src 侧）→ declare。

## §D resizable-panels（vendored，不转录）

- 位置：本机 js **131439–131820**（旧 131422–131631，+17）：`cAt`（PanelGroup 引擎，displayName=`Group`，131439/131615）、`J4`（存储键前缀 `react-resizable-panels:`，131615）、`lAt`（布局读取，131619）、`uAt`（持久化 Group，debounceSaveMs 缺省 100、storage 缺省 localStorage，131648）、`pAt`（Panel，displayName=`Panel`，131732/131818）。
- 版本：bundle 内**无上游版本字符串**；为 react-resizable-panels（bvaughn）API 风格的 vendored 变体（Group/Panel/separator + 布局持久化 + `resizeTargetMinimumSize={coarse:20,fine:10}`、`orientation` 缺省 `horizontal`）。VENDOR-MANIFEST-LIBS.md 53–55 已登记（`Z4`=SplitPanel 包装层 131943、`cAt` 引擎、`uAt` 100ms 防抖写回）。
- 替换策略（沿用 WorkspaceShell.report §6 裁决）：集成时以 npm `react-resizable-panels` 依赖替换引擎本体，保留 X4/Z4（=pAt 包装）与 uAt 持久化薄层；存储键 `react-resizable-panels:*`（如 184126 的 `react-resizable-panels:workspace-shell-layout:sidebar:content`）需保持兼容。本批次不转录引擎内部。

## §E 锚点回代（16/8，逐字命中）

| # | 锚点（产物内字符串） | 产物 | 原始 chunk 行 | 命中 |
|---|---|---|---|---|
| 1 | `task list membership refresh hold 已经启动` | QuickPickDeep §3 | 32417 | ✓ 逐字 |
| 2 | `tasks-index task 行读取不完整` | QuickPickDeep §4 | 32495 | ✓ 逐字 |
| 3 | `[taskStatusUnreadSync] 持久化后台终态未读失败` | QuickPickDeep §2 | 32404 | ✓ 逐字 |
| 4 | `[v4-sessions-index] unsubscribe ${…} 失败（忽略）` | QuickPickDeep §7 | 35008 | ✓ 逐字 |
| 5 | `ZCODE_AGENT_RUNTIME_UNAVAILABLE` | QuickPickDeep §7 | 35001 | ✓ 逐字 |
| 6 | `session.upserted`（YAe 分支） | QuickPickDeep §7 | 35026 | ✓ 逐字 |
| 7 | `cubic-bezier(0.2, 0, 0, 1)` + duration 150 | QuickPickDeep §10 | 155407/155483 | ✓ 逐字 |
| 8 | `chore: checkpoint before switching to ${…}` | CmdkPaletteDeep §1 | 95116 | ✓ 逐字 |
| 9 | `git.branchSwitcher.blockedDialog.description.untracked` | CmdkPaletteDeep §3 | 95278 | ✓ 逐字 |
| 10 | `minmax(260px,1fr) 128px 112px 84px` | CmdkPaletteDeep §4 | 95963 | ✓ 逐字 |
| 11 | `__zcode_missing_parent__` | CmdkPaletteDeep §4 | 95760 | ✓ 逐字 |
| 12 | `[GitGraphDialog] 读取 Git Graph 失败` | CmdkPaletteDeep §6 | 96304 | ✓ 逐字 |
| 13 | `settingsSync.agent.nofy`（zcode 分支） | McpHelpers §5 | 193578 | ✓ 逐字 |
| 14 | `Project MCP server requires explicit connection before use.` | McpHelpers §3 | 193465 | ✓ 逐字 |
| 15 | `10080 * 60 * 1e3`（M2t 7d） | McpHelpers §6 | 203429 | ✓ 逐字 |
| 16 | `react-resizable-panels:` 键前缀 | （§D 注记） | 131617 | ✓ 逐字 |

符号起点抽查（全部命中）：nOe 32249 / rOe 32257 / iOe 32258 / dOe 32330 / pOe 32333 / mOe 32336 / hOe 32344 / gOe 32354 / px 32364 / mx 32414 / _Oe 32416 / vOe 32428 / gx 32439 / wOe 32532 / Ex 32536 / DOe 32578 / UAe–KAe 34987–34990 / qAe 34991 / JAe 35000 / IS 35003 / US 35443 / ZAe 35446 / GS 35529 / JS 35552 / YS 35625 / aje 35663 / sje 35700 / cje 35730 / lje 35745 / Lzt 155248 / Rzt 155253 / eBt 155407；MZ 95015 / jst 95169 / Mst 95262 / FZ 95567 / Ist 95686 / dct 95968 / RZ 96282 / fct 96283 / pct 96410 / zZ 96637 / mct 96943；qQt 193351 / N7 193380 / XQt 193384 / ZQt 193397 / QQt 193409 / $Qt 193414 / t$t 193447 / i$t 193494 / s$t 193541 / c$t 193586 / m$t 193623 / h$t 193634 / k2t–F2t 203426–203437 / I2t 203440；Ho 1885 / tae 1905 / nae 1908 / Wo 1911。

## §F 验证记录（四项门禁）

1. **esbuild（0 错 ×3）**：
   - `web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/QuickPickDeep.tsx --loader:.tsx=tsx --jsx=preserve` → 41.3kb，0 错
   - 同参 `CmdkPaletteDeep.tsx` → 49.4kb，0 错
   - 同参 `McpHelpers.tsx` → 10.6kb，0 错
2. **tsc strict（0 错 ×3）**：`/tmp/tsconfig.QuickPickDeep.json`、`/tmp/tsconfig.CmdkPaletteDeep.json`、`/tmp/tsconfig.McpHelpers.json`（strict、target/lib ES2022、jsx preserve、module ESNext + moduleResolution Bundler、typeRoots→`web/node_modules/@types`、paths react→@types/react、include 仅该产物），`web/node_modules/.bin/tsc -p` 三件均 0 错。修复过程记录：QuickPickDeep 首轮 7 错（react 解析改 paths；YAe 联合判别 kind 改 `deltas`（33489 实证）；mOe updatedAt 放宽 `string|number`；Yzt 分支改回原序 u8(before)/d8）；McpHelpers 首轮 1 错（o$t 的 taskResults 改必选以合原 JS 抛错语义）。
3. **锚点回代**：§E 16 项 ≥ 8，全部逐字命中。
4. **报告完整**：本件。
- **md5 复验**：`desktop/src/out/renderer/assets/styles-CdEGpc2x.js` = `48d71d4874b0868d61fd35a328bf6ad5`（与开工基线一致，out/ 未动）。

## §G 把握度分级

| 级别 | 内容 |
|---|---|
| 高（逐字回代） | 三件全部函数体：类名/字符串/分支结构零改动；§E 锚点与符号起点抽查命中 |
| 中（推断类型） | 所有 TS 类型签名（服务请求/响应形、事件形）——按调用点反推，集成时以服务层类型为准；`useSessionIndexShards` 内 `WorkspaceSubscriptionSet` 构造参数按 services §G.6 口径 |
| 低 | 无 |

## §H 遗留问题

1. **Tte/Ane/zte(=src `ks`)**：协议宿主侧判定函数，属 `src-HCld2afU.js`（B5-10）→ QuickPickDeep §7 以 declare 挂起。
2. **传输接线 oAe/NS/MS/AS**（SessionIndex 传输装配）：仍为 services.tsx 接口级，未在本批次范围。
3. **集成改指清单**：TopBar.tsx 2690–2718 declare 组 → CmdkPaletteDeep 导出；SettingsPanelsData.tsx 820–823 → McpHelpers §6；SettingsPanelsCapability.tsx 537/2435 → McpHelpers §2；Sidebar.tsx 私有 u8/d8/bIt/xIt/n8/vIt 需导出或上提以供 QuickPickDeep §10。
4. **resizable-panels 依赖替换**：按 §D 策略在集成阶段执行；`react-resizable-panels:workspace-shell-layout:*` 存储键需兼容迁移。
5. **dct 行内 `Nst(t, 'size-2.5')` 以组件 `<RefKindIcon>` 转录**（原为函数调用返回元素，语义等价）；同类转录见 Fst。
6. **Mst `step` 判别**：原 JS `e === 'blocked' / 'commit'` 双分支，本件类型化为 `blocked|commit|null`；若服务侧引入新步态需同步。
