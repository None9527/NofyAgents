# A0-S2c 报告 — legacy-doc 域 declare 接线批（PORTING-PLAN A0.1）

日期：2026-08-29 ｜ 工作区：/Users/mac/nofy-build ｜ 编译基座：desktop/src/src（TS 5.9.3）
范围：src/modules/ 17 文件（LegacyDocEngineC1–C5、DocxWasmGlue、LegacyDocEngine1–4、
LegacyDocEngineBThumbnails/BModel/BLayout/BEditorState/BPageRegistry/BPageRenderer、
previewPaneOfficeLegacyDocContent）。src-reconstructed/ 与 out/ 只读未触。

判定依据：jsx 权威件 src-reconstructed/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx
（36,535 行；段带：C1 18106-19541+20231-20943 ｜ C5 19552-20133 ｜ C2 20944-24337 ｜
BEditorState 24338-26660 ｜ BPageRegistry 26661-27339 ｜ BPageRenderer/C3/C4 27340-36416 ｜
BModel 15114-16815 ｜ BLayout 16816-20230 ｜ Engine3 12250-13243 ｜ Engine4 13244-14903），
B5-14-Final.report.md（§1.3/§2.3/§6-4 裁决），/tmp/s2c-obfmap.json、/tmp/s2c-exports.tsv。

---

## §1 总账执行摘要

| 台账条目 | 状态 |
|---|---|
| 1. C4 §0 的 316 项 `declare const X: any` | ✅ 191 导入 + 64 core 解构 + 57 删 + 4 保留 |
| 2. C2 行 300-303 deepCloneModel/newBlockId | ✅ → DocxWasmGlue（cloneDocModel / allocateBlockId as newBlockId，B5-14 §2.3） |
| 3. C3/C4 六个 [E6]b declare（zg/Bg/Vg/Hg/Ug/Wg） | ✅ → C5 六导出（C3 六项全直接；C4 消费 zg/Bg/Vg/Hg 四项，Ug/Wg 仅 C3 消费） |
| 4. C5 canonical（qg…e_/m_/p_ 族）消费点改指 C5 | ✅ C1/C2/BLayout/BPageRegistry 共 7 处源切换；批 B 副本实现未动 |
| 5. B 系 ↔ 1-4 系既有 declare/接缝 | ✅ 两端在批内者全接线（含 BLayout Wv→C2 LIST_INDENT_TWIPS）；跨批者保留并注记 |
| 6. previewPane chunk 包装层 | ✅ buildDocModel/ensureDocModelBlockIds→Glue、createDocxEditor→BEditorState；7 项保留 |
| 7. DocxWasmGlue loadParseDocxModule | ✅ 保留 declare，A0-S2c 注记（src-2FP7IUE6 属他批） |

---

## §2 替换矩阵（按文件）

| 文件 | declare→真实导入 | 删除（无消费） | 保留 | 备注 |
|---|---|---|---|---|
| LegacyDocEngineC4.tsx | **255**（191 顶部导入 + 64 core 解构） | 57 | 4（Kp/Ip/Sp/Rp，属主未转录） | 另：`$`→react/jsx-runtime；2 只接合适配器（§4）；937 处消费点改名 |
| LegacyDocEngineC3.tsx | **85**（72 直接 + 13 桥接垫片） | 9 | 11（§5） | 含六个 [E6]b → C5 直接导入；1 处转录校正（§3.3） |
| LegacyDocEngineC2.tsx | **5**（Glue 2 + Engine4 3） | — | — | deepCloneModel←cloneDocModel（垫片）、newBlockId←allocateBlockId（别名） |
| LegacyDocEngineC1.tsx | **11**（→C2） | — | — | 另：条目4 将 normalizeFontFamily 源 BModel→C5 |
| LegacyDocEngineBModel.ts | **17**（Glue 2 / previewPane 2 / C1 9 / C2 2 / Engine4 1 / BLayout 1） | 1（newBlockId 无消费） | 1（renderToStaticMarkupContract，react-dom/server vendor） | 补导出 2（§6） |
| LegacyDocEngineBLayout.tsx | 前序会话接线 21 桥 + 本会话 **1**（Wv→C2 LIST_INDENT_TWIPS） | — | 0（原 1 已接线） | 条目4：m_/p_ 源 BModel→C5 |
| LegacyDocEngineBEditorState.tsx | 前序会话接线 27 桥 | 多批（dx/yx/hx/vx/xb/lx/bb/sb 等无消费） | 5（replaceParagraphText/replaceCellText/canCoalesceTyping/buildFloatingForWrapMode/resolveWrapMode，归属存疑注记） | — |
| LegacyDocEngineBPageRegistry.tsx | 前序会话接线 5 桥 | — | 1（renderStaticMarkupLocal，react-dom/server vendor） | 条目4：m_/p_/e_ 源→C5（f_ 本已 C5） |
| LegacyDocEngineBPageRenderer.tsx | 前序会话接线 11 桥 | — | 5（tableSpannedRowIndexes/renderDocumentNode/computeVisiblePages/pageSectionInfoFor/contextMenuActionsFor，属主未转录/锚点登记） | — |
| LegacyDocEngine3.tsx | **3**（cloneParagraphNode/cloneDocModel/cloneTableNode ← Glue） | — | — | — |
| LegacyDocEngine4.tsx | **3**（三克隆 ← Glue） | — | 2（packageToWireFormat/serializeDocxWithWasm，chunk-WKBPLHUA 属他批） | — |
| DocxWasmGlue.tsx | 0（本件即 chunk-YE7GQOST 实体） | — | 4（preloadModule/packageToPlainInput/wasmBuildDocModelFromPackage/loadParseDocxModule） | fix4：parseDocx ArrayBuffer 铸 |
| previewPaneOfficeLegacyDocContent.tsx | **3**（buildDocModel、ensureDocModelBlockIds→Glue；createDocxEditor→BEditorState） | — | 7（logger/Buffer/computeOfficeFitMetrics/encodePng/utifCodec/parseDocx/initDocxWasmSync，逐件注记） | 类型桥接 3（§3.4） |
| LegacyDocEngineC5.tsx / BThumbnails.ts / Engine1/2.tsx | 0（canonical/无 declare） | — | — | — |

**批合计**：declare→真实导入 ≈ **330** 项（C4 255 + C3 85 为主干），删除无消费 declare ≈ 67，
保留跨批/未转录 declare 36（逐件注记在案）。

---

## §3 重点接线细节

### 3.1 C4 §0（316 项）
- **191 IMPORT**：按 obfmap/导出索引逐项归属——BModel 48 ｜ C2 48 ｜ C1 39 ｜ BLayout 29 ｜
  C5 11 ｜ Engine4 6 ｜ Engine3 1（resolvePrimaryFontFamily←Mi）｜ BThumbnails 4 ｜
  BPageRegistry 1（renderSectionNode←TS）｜ previewPane 3（resolveImageSrc←_i、
  needsImageConversion←li、imagePlaceholderLabel←ui）。行尾均注原混淆名。
- **64 CORE**：C3 `useDocxEditorViewRenderCallbacks(core)` 面键，改经 core 解构（键名逐一
  比对 C3 返回面对象，全部命中）。
- **57 DELETE-UNUSED**：无消费点（含 td/id 改判——代码中仅 `<td>` 内联标签与对象键消费，
  非常量消费点）。
- **4 KEEP**：Kp（双击词范围）/Ip（草稿合并）/Sp（runs 规范化）/Rp（片段规范化）——属主未转录。
- `$`（jsx 运行时）→ `import * as jsxRuntime from "react/jsx-runtime"`，3 处 `(0, $.jsx)` 改 `(0, jsxRuntime.jsx)`。
- 消费点改名 937 处（936 自动 + 1 手改：`< Tu` 比较式 TABLE_HANDLE_BORDER_PX），
  词法感知（模板 `${}` 递归/正则字面量/字符串/注释/属性访问/对象键/展开）。
- 误标校正（以 jsx 函数体实测为准）：paragraphHasDropCap←paragraphHasImage(Pf)、
  paragraphIsTextBox←paragraphHasVisibleText(Yf)、paragraphIsFramed←paragraphHasFormField(qf)、
  estimateFooterHeight←minFloatingImageTop(Md)、pageContentIdentityKey←buildPaginationSnapshot(Hu)、
  sameIdentityKeyList←samePaginationSnapshot(Uu)、floatingImageCreatesExclusion←isInlineImageNode(Ng)、
  TEXT_CONTEXT_MENU_ACTIONS_SOURCE←CLIPBOARD_MENU_ITEMS(Qu)。

### 3.2 C3 §0（105 项）
85 接线（C2 40 ｜ BModel 31 ｜ Engine4 8 ｜ C1 5 ｜ BLayout 1 ｜ BPageRegistry 2 ｜ C5 6）；
13 项桥接垫片（`as unknown as` 类型桥，其中 pageContentIdentityKey 为**运行时参数序适配器**：
jsx 消费序 (segments, nodes, key)，BModel buildPaginationSnapshot 形参序 (nodes, segments, key)）；
9 项无消费删除；11 项保留（useVirtualizerContract/useWindowVirtualizerContract/VirtualizerContract、
imageWrapModel、wrapModeForAction、paragraphEditText、cellParagraphs、cellParagraphArray、
flushSyncContract、pageGeometryOfSection、metadataIdentityHash、pxToTwips——属主在他批/未转录）。

### 3.3 C3 转录校正（1 处）
jsx 31767 `Jp(r, …)` 传图节点 r；旧转录误传浮动面 g → 校正为 `floatingAnchorLayout(r, t, {…})`。

### 3.4 previewPane 类型桥（3 处）
本文件 DocxPackage/DocxModel/DocxEditor 为按用法还原的最小公共契约（他批文件以 type 导入消费），
与 Glue DocxCore* 型族 / BEditorState DocxEditorState 不同构，以 `as unknown as` 契约桥接：
buildDocModel、ensureDocModelBlockIds、createDocxEditor 三式（零运行时影响）。
环依赖核验：BEditorState 对本文件仅 `import type`（无运行时环）；Glue 无导入。

---

## §4 接合适配器（C4，调用面时序/形参面差异，仅重排传参）

1. **renderSectionNode（原 TS）**：C4 消费点按 jsx 原式 17 参时序；BPageRegistry 转录面 15 参
   （jsx 参 7/8 无承接槽——BPR 内部 renderParagraph 不收 scrollToBookmark/s；jsx 参 13 兼作
   sectionLocation/sectionRenderState；参 16 用作 Number.isFinite 守卫）。适配器按语义映射，
   **参 7 scrollToBookmark（C4 传 Pi）暂弃**——遗留见 §10-3。
2. **layoutWrappedLines（原 xp）**：C4 消费点按 jsx 原式 8 参时序（…, numberingDefs, gridPitch,
   widthOverrides, pageGeometry, options）；BLayout 转录面 7 参、4-6 参顺序不同且无
   pageGeometry 槽（占位体不读页边距）。适配器重排映射，pageGeometry 暂弃（占位体不消费）。

---

## §5 补导出与签名调整（逐件记录）

**补导出（不改实现，2 件）**：
- BModel `export { isBorderVisible, cloneParagraphStyle }`——原 Wy/ay 自 C2
  paragraphBorderVisible/cloneParagraphStyle 转导出，供 BLayout 经本文件消费。

**签名面调整（类型层，零发射语义变化，7 件）**：
- BModel letterheadContainerStyle：补 jsx au(e, t, n) 两个未用首参（_letterheadFloatSide/
  _oppositeLetterheadFloatSide）——恢复原调用面，体内本不读（jsx 15279 实测）。
- BLayout dragPreviewHeight 首参放宽 any——jsx 调用面传行布局对象（C4 dragPreview 消费点实测）。
- BLayout runStyleToCss/runStyleToCssDefaults 第三参放宽 unknown——jsx 亦收表单域展示文本
  等字符串（jsx 33385 实测）。
- C1 segmentRenderBottomPx/segmentCoversWholeParagraph 参数收窄为原式实读字段集（Pick）——
  C4 调用面按原式传部分字段（jsx 18957/18961 实测）。
- C2 ParagraphRenderOptions 增 paragraphOriginLeftPx/paragraphOriginTopPx 可选字段——
  C4 调用面按原式附带（jsx 32609-32610），Tv 本体不消费。

---

## §6 条目4：C5 canonical 族裁决执行（B5-14 §1.3-1/§6-4）

qg/Yg/Xg/Zg/Qg/e_（BLayout §14/§16 副本）与 m_/p_（BModel 459/473 副本）**副本实现保留未动**；
域内消费点改指 C5 导出（7 处源切换）：
- C1：normalizeFontFamily（BModel→C5）。
- C2：themeAwareColor（BModel→C5）。
- BLayout：normalizeFontFamily + themeAwareColor（BModel→C5）。
- BPageRegistry：themeAwareColor + normalizeFontFamily（BModel→C5）、resolveHighlightColor（BLayout→C5）。
- C4 在 §0 接线中本即自 C5 导入 6 符号（qg/f_/m_/p_/Xg/Yg + zg/Bg/Vg/Hg/Pg 共 11）。
环依赖核验：新增 C1→C5、C2→C5、BLayout→C5 三边与 C5→C1/C2/BLayout 成环；双方均为函数体内
消费（无模块顶层调用），ESM 函数声明提升保证时序安全；tsc/esbuild 无环错误。

**条目5 补接线**：BLayout NUMBERING_INDENT_STEP_TWIPS（原 Wv）→ C2 `LIST_INDENT_TWIPS`
（jsx 21878 同主，720），原 declare 删。

---

## §7 错误数前后

| 口径 | 前 | 后 |
|---|---|---|
| tsc 全项目（`-p tsconfig.json`） | 364（基线文件；语义通道被 appUsageDailyModelBarChart 语法错部分抑制）→ 开工时实测已因并行批修复语法错而暴露至 ~798 | **777**（收工复测；期间 798→795→777 随并行批收敛，full 与探针口径已重合） |
| tsc 本批 17 文件（探针口径） | 开工时 4 件既有错（fix4 已修）+ 接线过程瞬时 | **0** |
| esbuild 本批 17 文件（--jsx=automatic） | — | **17/17 0 错** |

归属说明：全项目 364→777 的增量全部来自**他批文件**（并行批修复语法错后语义通道全开，
暴露 SettingsPanelsCapability/ExtendedViews/WorkspaceShell 等 33 个他批文件的既有语义错）；
与 S2b 报告 §4.1 同口径。核验：现存错误文件中仅 TerminalPane.tsx 提及本批文件，其错为
ContextMenuItem（interface）作值使用——该符号在 HEAD 与本批 diff 中均未变动，属他批既有。
本批净贡献：批内 17 文件清零、他文件 0 新增、全项目较开工时 −21（798→777，含本批接线消解
与并行批收敛）。

---

## §8 门禁记录

1. **tsc**：本批文件相关错误 0（探针：排除他批语法错文件后全量语义通道）；全项目只减不增（−3，见 §7）。✅
2. **esbuild**：17 文件逐个 0 错（--jsx=automatic）。✅
3. **抽查 3 处**（对报告行号）：
   - jsx 34499 `TS(` ↔ C4 3222 `renderSectionNode(`（17 参原式一致）✅
   - jsx 33894 `au(o.letterheadFloatSide, o.oppositeLetterheadFloatSide, {` ↔ C4 2617 `letterheadContainerStyle(…` ✅
   - jsx 21878 `Wv = 720` ↔ C2 1473 `LIST_INDENT_TWIPS = 720` ↔ BLayout 导入别名 ✅
   （另验：C2 303 Glue 导入、C3 307/312 C5 六导入。）
4. **out/ md5**：legacy-doc cfa43c9f7be31ca608214e29ea1419ea ✅ ｜ YE7GQOST bbd574fd826831cd3e03798ae32e3196 ✅ ｜ AEHDFCS5 c200d53acfca1db99e9c649f0f4a971c ✅
5. **报告**：本件。✅

---

## §9 遗留（如实）

1. **C4 四项属主未转录**：Kp（双击词范围）/Ip（草稿合并）/Sp（runs 规范化）/Rp（片段规范化）保留 declare。
2. **跨批/他 chunk declare 36 项保留**（逐件注记在文件内）：
   - C3 11 项（虚拟化契约 ×3、imageWrapModel、wrapModeForAction、paragraphEditText、
     cellParagraphs、cellParagraphArray、flushSyncContract、pageGeometryOfSection、
     metadataIdentityHash、pxToTwips）；
   - BEditorState 5 项（replaceParagraphText/replaceCellText 归属存疑——原标注 Qa/eo 实为
     C3 草稿面；canCoalesceTyping 原 ho 非模块导出；buildFloatingForWrapMode/resolveWrapMode）；
   - BPageRenderer 5 项（tableSpannedRowIndexes/renderDocumentNode/computeVisiblePages/
     pageSectionInfoFor/contextMenuActionsFor，属主未转录/锚点登记）；
   - previewPane 7 项（logger、Buffer、computeOfficeFitMetrics、encodePng、utifCodec、
     parseDocx←src-2FP7IUE6 属他批、initDocxWasmSync←chunk-WKBPLHUA 属他批）；
   - DocxWasmGlue 4 项（preloadModule/packageToPlainInput/wasmBuildDocModelFromPackage/
     loadParseDocxModule←src-2FP7IUE6 属他批）；
   - Engine4 2 项（packageToWireFormat/serializeDocxWithWasm←chunk-WKBPLHUA 属他批）；
   - BModel 1 项（renderToStaticMarkupContract）、BPageRegistry 1 项（renderStaticMarkupLocal）
     ——react-dom/server vendor 段。
3. **适配器暂弃参数 2 处**：renderSectionNode 适配器弃 jsx 参 7（C4 传入的 scrollToBookmark=Pi；
   BPR 转录面无承接槽，节区段落内书签跳转待 BPR 补转录后接通）；layoutWrappedLines 适配器弃
   jsx 参 7 pageGeometry（BLayout 占位体不读页边距）。
4. **批 B 副本最终处置**：BLayout §14/§16 与 BModel 459/473 的 qg…e_/m_/p_ 副本按 B5-14 §6-4
   终态应改为自 C5 再导入（副本删除）——按任务书本批不动副本实现，留待整合批。
5. **全项目错误存量 777**：全部属他批文件（见 §7 归属说明），非本批欠账。
