# B5-MERGE-NOTES — 跨批裁决与合并待办（滚动更新）

b5-merge 阶段消费本文件。每批完成后把跨批事项记在这里。

## 1. 行号偏移基线（台账 213,695 行口径 → 当前 out 213,979 行）

| 区段 | 偏移 | 来源 |
|---|---|---|
| ≤ ~41940（styles 前段） | +48 | B5-03 实测（37067→37115，37093 起点） |
| ~47k–51k（F19/F14/F03 区段） | +48 | B5-06 实测（MBe 49090→49138、MO 47501→47549、v_t 110379→110427） |
| ~110k（v_t） | +48 | B5-06 实测 |
| ≤ ~142k | +17 | B5-05 实测 |
| ~146k（F04 $It） | +46 | B5-06 实测（146089→146135） |
| ≥ ~149k | +46 | B5-05 实测 |
| 尾部 205k–213,979 | +284/+290 两段 | B5-02 实测（213,695→213,979 总差 284；报告 §0 完整换算表） |
| ~160k（F14 预览助手群） | +240 | merge 期实测（台账 160432 lVt → 当前 160672） |

> 偏移非常数，说明 D5b 删除/桩化在不同区段造成的净位移不同。
> merge 时需产出全文件偏移映射（或逐段注记），并回写 COVERAGE-LEDGER/MODULE-MAP 行号。

## 2. 双归属/重叠裁决

| 段 | 争议方 | 裁决 |
|---|---|---|
| 149473–149599（YLt…nRt，rRt 唯一消费族） | B5-05（WebRemote.tsx）vs B5-04（Bots.tsx 尾段） | **双方互让消费面优先 → canonical = WebRemote.tsx**；Bots.tsx 尾段为重复转录，整合期删除或改 import |
| 76848–77167（ConfigSelect/Mq 整闭包，mode.* 消费点） | B5-01（Composer.tsx 整闭包）vs B5-04（PaymentDeep.tsx，Mq@76912 锚点） | **双方均逐字转录 → canonical = Composer.tsx**（B5-01 先收且含 mode.* 消费链）；PaymentDeep 版整合期改 import |
| 77062–77126（U3e/W3e/G3e）+ 76034–76156（popover 原语） | B5-01 转录（U3e@77062 为其锚点）vs B5-04 declare-only | canonical = Composer.tsx，B5-04 声明改 import |
| 77166–77393（思考级别 UI Pq/Fq/Z3e/Q3e/$3e）+ 89415/89978–90179（Zrt/ait/lit/uit chip） | B5-01 越界未转录 | **B5-04 已覆盖**（lit/uit 89989–90179 标注 F08 双归属；余段在 PaymentDeep §1–§10 内） |

## 3. 新发现的未覆盖段（需补抽批或裁决豁免）

| 段（台账口径） | 内容 | 状态 |
|---|---|---|
| 原 123518–123928（12 符号） | F10 隙段 a（mEt 向导状态总钩起、DEt 止；实测当前 123522–123945，登记 12+内部 4+邻接 1） | **已清零**：RemoteGapSegments.tsx §3.2（B5-14，四门禁独立复核全绿） |
| 原 127340–127925（4 符号） | F10 隙段 b（rOt 起、cOt 止；实测当前 127350–127942，登记 4+内部 2+邻接 3） | **已清零**：RemoteGapSegments.tsx §3.3（B5-14，四门禁独立复核全绿） |
| xlsx js 189512–193216（~3,700） | 常量/剪贴板+上下文+工具栏 UI+行渲染层 | B5-12a 发现，B5-12c 补抽（已启动） |
| xlsx js 183064–183971（Vu/yd/bd…Od 助手子段） | 地图/图表助手 | B5-12a declare 挂接 → 已并入 B5-12c 实体化 |
| xlsx js 199292–199508（sy/cy 顶层 SpreadsheetView ~217 行） | 入口层，消费 12c 六个导出 | **已清零**：XlsxDeepT.tsx（331 行，7 符号；B5-12d，四门禁独立复核全绿） |
| xlsx js 9111–15671（前导段 ~6,560 行） | nc/xa/Ca（emuToPx/resolveFontColor/resolveFillColor）所在；性质待裁决 | **已清零**：裁决 = FIRST-PARTY（react-xlsx 私有引擎本体，证据链见 XlsxDeepPT.report §2）；XlsxDeepP.tsx（7,292 行，440 符号/87 导出；B5-12d，逆映射 6,561/6,561 逐字节一致，四门禁独立复核全绿） |
| legacy-doc jsx [E6]b 余带（约 19542–20230，待精确定位） | zg/Bg/Vg/Hg/Ug/Wg + qg/Yg/Xg/Zg/Qg/e_/f_/m_ 族 | **已清零**：LegacyDocEngineC5.tsx（364 行，17 实体；B5-14，四门禁独立复核全绿；C3 六 declare 实体化；批 B 重复转录裁决见 B5-14-Final.report §2） |
| chunk-YE7GQOST-DVtn9d8T.js（428 行）+ src-AEHDFCS5（25 行） | docx-core wasm loader glue（first-party Rust glue，VENDOR-MANIFEST 行 197/199） | **已清零**：DocxWasmGlue.tsx（953 行，30 函数；B5-14，四门禁独立复核全绿；deepCloneModel=cloneDocModel/newBlockId=allocateBlockId 实体化；再导出实测 10 符号非 9） |
| pptx 多区域余量 Ti/Ei/ki/Ai + DEFERRED_MULTI_REGION_ANCHORS（实测 38 项） | 地图数据区余量 | **已清零**：PptxGeometryMultiRegion.ts（B5-16，1,501 行；38 项全转录 + 弯箭头四 V 构建器依赖补录 + ki/Ai/Pi/Mi/Ni；锚点 98；独立复核全绿）；单区域复杂预设 39 项 → **已清零**：PptxGeometryDeferredPresets.ts（B5-17，38 转录 + 1 已覆盖跳过，独立复核全绿） |
| styles 今 124144–124259（原 123518 区台账误差段）NEt/PEt/W2 | 建议输入组件（W2 = ssh host/port/username/keyPath 建议，仅 REt 消费 4 处） | **已清零**：RemoteDirectorySuggestInput.tsx（233 行；B5-15，四门禁独立复核全绿；逆映射 116/116 一致） |
| styles 今 160672–160695 lVt/dVt 两个 React.lazy 包装 | F14 预览助手群仅存的未实体化件（CodeViewer.tsx 304/311 以 declare 挂接 LazyPdfViewer/LazyPptxPreviewViewer；sVt/cVt/uVt/fVt/pVt/mVt/W8/hVt/gVt/_Vt 均已实体化） | **已清零**：LazyPreviewViewers.ts（93 行 + 2 个 .d.ts 垫片；B5-15b，四门禁独立复核全绿；逆映射 15/15 一致；整合期 CodeViewer 两 declare 改指本产物） |

## 4. 台账勘误（merge 时回写）

- COVERAGE-LEDGER §c 记「MEt 已抽取（原 123942–124266）」：实测 Modals.tsx 止于原 124126；**NEt/PEt/W2 未抽取**（B5-05 发现，仅接口级登记）。
- 反馈中心真实起点 = 今 37093（台账 39107 为 RMe 根而非族起点；37067–39106 表单原语群此前未入账）。
- `feedback.*` i18n 唯一键 85 个（台账「25 处」低估）。
- 41808–41892 尾段非「RMe 收尾导出」，实为遥测 fact 助手 uT..mT（已随 services/StoresDeep 抽取）。
- StoresDeep §H 遥测区实际为 40445–41855（今行号，+48 后）。
- B5-07：台账给的 MCP 助手群行号（155522–155824 等）与实测不符，实际位置 193351–193633（qQt…m$t）+ 203426–203439（迁移尾部）；拖拽碰撞实测 155248–155500；resizable-panels 实测 131439–131820（vendored 不转录，替换策略沿用 WorkspaceShell.report §6）。
- B5-07：zZ 本体 96637–96942 已在 TopBar.tsx §5.6 语义重建，CmdkPaletteDeep 只物化其 declare 深部（95015–96410：分支切换/提交图谱引擎）。
- B5-07 集成改指清单（报告 §H.3）：TopBar 2690–2718、SettingsPanelsData 820–823、SettingsPanelsCapability 537/2435 的 declare 组改指新产物；Sidebar 私有拖拽函数需导出。
- B5-11：MODULE-MAP §3 勘误——`Na/Oa/Ma/ka` 实为 ShadcnTooltipProvider/Tooltip/Trigger/Content（Tooltip 族），非 Popover（styles js 902–918 实证）。
- B5-11：COVERAGE-LEDGER §a styles 基数需刷新 213,695→213,979（out/ 快照在 B4 后有更新；三件小 chunk 独立不受影响）。
- B5-11：SkillStore 的 8 个 `src-HCld2afU` 导入以 declare 挂接，待 B5-10a/b 落地后替换；`SubagentsService/SkillsService/Descriptor` 接口为调用面归纳，随 B5-10 确认真实形状。
- B5-11：导出 `U` 规范名定为 `getWorkspaceTaskStateAlias`（QuickPick/ExtendedViews 旧名只记录）。
- B5-11：`Rt`（modelSwitchGuardCache）3.7.6 中恒空（无 .set），结构逐字保留。
- B5-10a：src-HCld2afU jsx 1–4901 中 §2–§8（约 3,260 行）为**捆绑 zod v4.3.6 vendored 库体**（ZOD_VERSION 锚定）——已逐字转录，内核移植时可整体换 npm `zod@4.3.6`。
- B5-10a/b 切割：jsx 4900 落在 `Ll`（providerEndpointsSchema，4898–4901）声明符内部，按声明符原子性归 B5-10a（收至 4901），B5-10b 自 `Rl`（4902）起。
- B5-10a：`e`→DEFAULT_LOCALE（导出 Ps）、`W`→providerIds（导出 mo/styles 侧 q）与既有登记逐字一致；Vte/Xr/testid×9/parseModelString/isCreateLimitError/reportTelemetry(xw)/repoWiki/automations/OFFPEAK 等已登记符号全部落在 B5-10b 范围（jsx 4902+）。
- B5-10a：匿名装配/丢弃语句（jsx 3432/3434/3742/3856/3858/3931/4375/4738–4830）与 `jo` 空命名空间 = 原件死代码，逐字保留，精简需另行裁决。
- B5-06：MO 代码查看器深部实测 47354–47712（台账 47501–47660 偏窄）；文件树模型层 50907–51197 数值在 F19 行范围、语义归 F04，由 FileTreePanel 重建。
- B5-06：任务缓存助手 iLt/aLt/oLt/sLt/cLt 语义属 F01、物理在 F04 范围，实现方 = FileTreePanel（F01 消费方以本文件为基准）。
- B5-06：QA/JA 实现在 FileTreePanel，被 Conversation/MarkdownIntegration 消费——集成期以 FileTreePanel 为基准去重；横切路径助手 Go/sae/Yo 与跨块任务态 xe/ce/pe 仍接口级，待横切批次。
- B5-02：MODULE-MAP 勘误——k3t/A3t 标为「导入向导」有误，实为工作区会话恢复组合与 slug 助手；m3t 已在 Modals.tsx L4186 抽取（台账误列为余量）。
- B5-02：j6t（行段 210776–211054 属 F18）按语义归 F20 → AppRootLeaves.tsx；K9/q9/J9/Y9 留 OLL 由 AppRootLeaves import。
- B5-02：死代码两处逐字保留——匿名插件市场 store 裸创建（213621–213895）、`[...TELEMETRY_PARITY_CASES.keys()];` 裸语句（212449）。
- B5-02：g8t provider 树含 **OFFLINE-PATCH-002** 块（213106–213108，_8t AppRootContent 内），移植阶段需核对其语义。
- B5-10b 更正既有报告登记错误（只记录未改动，merge 时回写）：
  - ExtendedViews.report 行 64 的 9 个 testid 混淆名与值绑定有误——实际内部名 `Ky/qy/Jy/Yy/Xy/ob/sb/cb/lb`（jsx 8530–8547 逐字命中）；`Bte/Mte/Nte` 全文 0 命中。
  - GitReview.report 的 `ine`（git-pane testid）实为 `wg`→别名 `nr`；`Xr` LCS 计数实为 `bS`→别名 `b`（`Xr` 是 `y_`=server-token-input 的别名）。
- B5-10b：SrcSharedB §0 的 90 条 ambient declare 为对 SrcSharedA 的接口级依赖，集成期换真实 import（不影响发射代码）；导出块 53 个上半内部名以原混淆名再导出。
- B5-10b：jsx 9266 匿名逗号表达式 = 原 bundle 死代码，逐字保留。
- **4 个未重建 first-party chunk 全部落定**：skillStore（B5-11）/src-HCld2afU（B5-10a/b）/usageStatsUiParts（B5-11）/process-monitor（B5-11）。
- B5-12c：对 12a 的 declare 组 15–19（bd…Od/yd 10 对象）全部实体化导出，替换清单在报告 §4；勘误 12a 注释行号 xd/Sd/Cd=183898/183901/183904。
- B5-12c：勘误 12b 五处语义标签（dv=toPlainRecord、Sh=drawTextDecorations、Ch=getPath2dCached、Mg=drawingRectPx、Lg=resolveScrollRegionKind，函数体实测）；12b 的 152 declare 中 145 个属 12c 导出，0 冲突。
- B5-12c：`export var` 链语法致 17 名链式过导出，保持现状（拆链破坏逐字口径）。
- xlsx declare 替换总账（整合期执行）：12a 10 条 + 12b 145 条 → 指向 XlsxDeepC 导出；SkillStore 8 条 → 指向 SrcSharedA/B。
- B5-12d：declare 替换新增——XlsxDeepA 84 条 + XlsxDeepC 6 条（G/K/Rn/xa/Ca/nc）+ XlsxDeepB 1 条（Dl）→ 指向 XlsxDeepP 导出（均核对在 87 导出集内）。
- B5-12d：双归属待整合期裁决——14341–14474（vs XlsxPreviewWasmBridge.tsx）、199415–199508（vs XlsxPreview.tsx）；XlsxDeepC §二 G 行号标签偏移一行（实测 G=9111/Rn=9112/K=9113，仅报告 §7.3 更正）。
- B5-12d：前导段性质裁决 = FIRST-PARTY（react-xlsx 私有引擎；`[react-xlsx]` 自称日志 ×3、duke_sheets_wasm 动态 import、私有 MIME、OOXML 常量族；vendored 特征零命中）；与 XlsxPreview.report §2.1「私有 vendored」旧标签口径差异见 XlsxDeepPT.report §2.2。
- B5-14：整合期改指清单（B5-14-Final.report §6-4）——RemoteWizard.tsx 234–363 declare → RemoteGapSegments；C3 442–480/C4 登记 → C5；C2 301/303 declare → DocxWasmGlue；Modals 需再导出 `$2`、SrcSharedA 需补导出 `DEFAULT_ASSET_INSTALL_MODE`；批 B 的 qg…e_/m_/p_ 副本改自 C5 导入。
- B5-14：Glue 结构偏差 1 处——`import('./src-2FP7IUE6-...')` 契约化为 `loadParseDocxModule` declare（该 chunk 属另行批次）；类型垫片 6 处（零运行时影响）。
- B5-14：NEt/PEt/W2（B5-05 账实差异段，当前 124144–124259）仍未抽取，沿用接口级登记（整合期候选）。
- B5-14：两 glue chunk md5 基线新登记——chunk-YE7GQOST `bbd574fd826831cd3e03798ae32e3196`、src-AEHDFCS5 `c200d53acfca1db99e9c649f0f4a971c`（批前批后一致，独立复验）。
- B5-04：`ko` 裁决为同一 store（theme + OAuth/user 字段，证据行 82520/88897–88901/140676）；`tr`（isZaiCodingPlanProvider）跨 chunk 导入仅 declare。
- B5-04：vendored 新登记——Stripe 80955–81731（6.4.0/9.6.0 双版本）、qrcode 78456–79690；`W7e` pk_live 107 字符全量比对。
- B5-04：`Hq/L/N6e/r6e/T6e/k6e` 跨 chunk 部分仅接口级 declare + 调用点逐字，内部实现归他批次（整合期核销）。
- B5-09：批 B 未登记的两个 ref——`Z`（jsx 27416，拖拽图片引用）与 `Ot`（jsx 27487，包裹段落指针会话引用）由 C3/C4 以 core 字段消费，集成时注入。
- B5-09：C4 §0 共 316 项 `declare const X: any` 契约，集成时替换为属主模块类型化导入；批 B 最终 JSX 对 C4 返回面（41 符号）的接线为下游集成任务。
- B5-09：C4 唯一非逐字行 = Xo 第 4 参可选化（jsx 32506）；`as`→`as_` 4 处（TSX 保留字）——均已登记，运行时行为不变。
- B5-09：[E7] 交互回调簇实际行范围 jsx 27889–35407（骨架区 27340–27888 与最终 JSX 35408–36416 归批 B）。

## 5. i18n 孤儿键（B5-13 结论，阶段 C 清理候选）

35 个孤儿键：mode 3（default/plan/acceptEdits）、forms 16（被 settings.subagents.form.* 取代）、
notification 3（command/file/taskWaiting）、usage 4（chatPlan/entitlement 系）等。
`postUpdateReleaseNotes.*`/`forceUpdate.*` 全部证伪（静默 ack / React 同名误报）。

## 6. 已完成批次产物登记

| 批次 | 产物 | 行数 | 门禁 |
|---|---|---:|---|
| B5-03 | FeedbackCenter.tsx + report | 4,334 + 286 | 4/4（独立复核） |
| B5-05 | WebRemote.tsx + RemoteWizard.tsx + report | 2,063 + 1,637 + 309 | 4/4（独立复核） |
| B5-07 | QuickPickDeep.tsx + CmdkPaletteDeep.tsx + McpHelpers.tsx + report | 1,697 + 1,804 + 529 + 145 | 4/4（独立复核；16 锚点） |
| B5-11 | SkillStore.tsx + UsageStatsUiParts.tsx + ProcessMonitor.tsx + report | 4,569 + 1,374 + 310 + 261 | 4/4（独立复核；36 锚点；三原件 md5 一致） |
| B5-01 | Composer.tsx + report | 9,321 + 127 | 4/4（独立复核；16 锚点；351 符号映射；余量无） |
| B5-02 | OnboardingLoginLeaves.tsx + AppRootLeaves.tsx + report | 5,379 + 2,726 + 356 | 4/4（独立复核；13+6 锚点） |
| B5-06 | PreviewCards.tsx + FileTreePanel.tsx + FileRewindDialogDeep.tsx + report | 2,385 + 2,718 + 950 + 113 | 4/4（独立复核；14 锚点） |
| B5-10a | SrcSharedA.tsx + report | 6,358 + 802 | 4/4（独立复核；14 锚点；AST 双行号 1,336 声明 1:1 对齐） |
| B5-10b | SrcSharedB.tsx + report | 7,009 + 1,580 | 4/4（独立复核；21 锚点；骨架差分 16/16 MATCH）——src-HCld2afU 全量落定（567+769=1,336 符号） |
| B5-04 | PaymentDeep.tsx + Bots.tsx + report | 12,066 + 2,209 + 152 | 4/4（独立复核；16 锚点；bots.* 键多重集 uniq -c diff 一致） |
| B5-08 | LegacyDocEngineC1.tsx + C2.tsx + report | 3,799 + 4,794 + 321 | 4/4（独立复核；11 锚点；[E6]c 195 符号全量实体化；C1→C2/C3 契约闭环） |
| B5-09 | LegacyDocEngineC3.tsx + C4.tsx + report | 5,317 + 4,110 + 214 | 4/4（独立复核；13+14 锚点；C4 回代 3530/3531=99.97% 逐字；C3 74.35% 逐字+映射表可复核） |
| B5-12c | XlsxDeepC.tsx + report | 5,133 + 620 | 4/4（独立复核；10 锚点；逆映射回代 908+3,705 行逐字节一致） |
| B5-12b | XlsxDeepB.tsx + OfficeWiring.tsx + report（CartesianChart 免产出：纯 recharts 3.8.0 vendor，版本登记） | 6,530 + 1,662 + 306 | 4/4（独立复核；15 锚点；三原件 md5 一致） |
| B5-12a | XlsxDeepA.tsx + report | 8,178 + 378 | 4/4（独立复核；逆映射回代逐字节一致） |
| B5-13 | I18nDynamicKeys.report.md | 192 | 分析批（12 锚点） |
| B5-12d | XlsxDeepP.tsx + XlsxDeepT.tsx + XlsxDeepPT.report.md | 7,292 + 331 + 238 | 4/4（独立复核；锚点 7/7 抽查逐字命中；逆映射 6,561+217 行逐字节一致；前导段裁决 FIRST-PARTY） |
| B5-14 | LegacyDocEngineC5.tsx + DocxWasmGlue.tsx + RemoteGapSegments.tsx + B5-14-Final.report.md | 364 + 953 + 1,435 + 351 | 4/4（独立复核；C5 锚点 3/3、Glue 3/3、RGS 6/6 抽查逐字命中；三缺口清零） |
| B5-15 | RemoteDirectorySuggestInput.tsx + B5-15.report.md | 233 + 112 | 4/4（独立复核；锚点 8/8；逆映射 116/116 一致；W2 消费方 = REt 4 处） |
| B5-15b | LazyPreviewViewers.ts + 2×.d.ts 垫片 + B5-15b.report.md | 93 + — | 4/4（独立复核；锚点 6/6；逆映射 15/15 一致；styles 接口级 declare 残留清零） |
| B5-17 | PptxGeometryDeferredPresets.ts + B5-17.report.md | 1,170 + 194 | 4/4（独立复核；38 预设注册精确对齐；锚点 38/38；逆映射抽查 212/212 + 全量块 795/803（8 行=助手名映射）；borderCallout1 已覆盖跳过） |
| B5-16 | PptxGeometryMultiRegion.ts + B5-16.report.md | 1,501 + 271 | 4/4（独立复核；38 多区域条目全转录；锚点 98；逆映射 6/6；运行时冒烟 38/38；bordercallout1/bevel 多区域版实为真缺已补） |
