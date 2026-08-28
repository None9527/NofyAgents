# LegacyDocEngineC.report.md — B5-08 批次 C 解码报告

批次：**B5-08 legacy-doc 引擎 C 上（测量原语族 + Mg 内层余 + 隙段 + [E6]c 全量）逐字重建**
源 chunk（只读）：`desktop/src/out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js`
主口径（行号基准）：`desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx`（pretty 重建孪生）

---

## §0 批次概览

| 产物 | 覆盖（jsx 行号） | 行数 | 说明 |
|---|---|---|---|
| `LegacyDocEngineC1.tsx` | A：18106–19541；B：20231–20943；+§D 依赖补全 | 3,799 | [E6]b 登记余量（测量原语族 + Mg 分页主循环全量）+ 隙段 |
| `LegacyDocEngineC2.tsx` | C：20944–24337（195 符号）；+§D 依赖补全 | 4,794 | [E6]c 渲染助手与编辑器 reducer 全量实体化 |
| `LegacyDocEngineC.report.md` | — | 本文件 | 覆盖清单 / 边界裁决 / declare 对照 / 验证记录 / 符号表 |

三段互斥，合计 jsx 覆盖 18106–19541 ∪ 20231–20943 ∪ 20944–24337（另 §D 范围外补全，见 §2.8）。

把握度分级：**高** = 逐字对原式（字符串/正则/分支零改动，签名完整）；**中** = 语义确定但参数类型按 unknown 收敛。
统计：C1 高 165 / 中 0；C2 高 204 / 中 2（Ly cellMarginsPx、zy effectiveCellMarginTwips，参数 unknown）。

---

## §1 覆盖清单（符号 → jsx 行号）

### 1.1 C1 §A1 测量原语族（18106–19189）

| 原符号 | 语义名 | jsx | 原符号 | 语义名 | jsx |
|---|---|---|---|---|---|
| Ym | paragraphFontSizePx | 18106 | Xm | paragraphMaxFontPx | 18113 |
| Zm | firstFontFamilyName | 18121 | Qm | paragraphDefaultFontFamily | 18124 |
| $m | denseLineFactorForFont | 18148 | eh | looseLineFactorForFont | 18154 |
| th | paragraphIsCjkLike | 18158 | nh | lineSpacingFactorFor | 18161 |
| rh | paragraphHasHardLineBreak | 18166 | ih | charClassWidthFactor | 18168 |
| ah | heuristicCharClassWidth | 18171 | oh | runFontPx | 18175 |
| sh | fontStringOf | 18180 | ch | runFontString | 18183 |
| lh | splitTextByFont | 18185 | uh | measureTextWidth | 18192 |
| dh | paragraphTabStopsPx | 18214 | fh | paragraphIndentStartPx | 18217 |
| ph | leftTabStopsAfterIndent | 18224 | mh | nextTabStopAfter | 18228 |
| hh | expandTabsToSpaces | 18233 | gh | segmentsWidthPx | 18235 |
| _h | greedyLineCount | 18241 | vh | paragraphTabSegments | 18274 |
| yh | splitTabSegments | 18295 | bh | tocTabLineCount | 18322 |
| xh | lineCountCache | 18343 | Sh | lineCountCacheGet | 18345 |
| Ch | lineCountCacheSet | 18347 | wh | paragraphLineCount | 18352 |
| Th | paragraphContentWidth | 18440 | Eh | paragraphEstimatedLineCount | 18454 |
| Dh | wrappedImageFootprintHeight | 18466 | Oh | layoutBottomPx | 18479 |
| kh | layoutHasFullWidthExclusion | 18484 | Ah | layoutHeightPx | 18493 |
| jh | layoutRangeHeightPx | 18496 | Mh | layoutFitLineEnd | 18505 |
| Nh | lineTwipsToMultiple | 18523 | Ph | doubleLineBlend | 18525 |
| Fh | lineHeightFromMultiple | 18532 | Ih | snapToGridModeOf | 18536 |
| Lh | gridSnapHeight | 18548 | Rh | paragraphLineHeight | 18553 |
| zh | paragraphOuterHeight | 18572 | Bh | xmlHasSpacingBefore | 18602 |
| Vh | xmlHasParagraphSpacing | 18608 | Hh | applyDefaultSpacingForGrid | 18614 |
| Uh | spacingBeforeAbsent | 18630 | Wh | estimateCellContentHeight | 18635 |
| Gh | rowIsSplittable | 18673 | Kh | rowNeedsHeightEstimation | 18676 |
| qh | rowHasNestedTable | 18686 | Jh | rowHeightWithCaps | 18689 |
| Yh | tableStyleIdOf | 18699 | Xh | tableHasVisibleBorders | 18703 |
| Zh | tableHasUnspacedParagraphs | 18707 | Qh | tableIsTableGrid | 18710 |
| $h | tableRowHeights | 18713 | eg | computeTableRowHeights | 18729 |
| tg | tableRowStyle | 18759 | ng | dedupeSafeBoundaries | 18766 |
| rg | paragraphSafeLayout | 18776 | ig | tableSafeLayout | 18803 |
| ag | cellSafeBoundaries | 18812 | og | boundaryIsSafe | 18840 |
| sg | tableRowSliceFitHeight | 18844 | cg | tableOuterHeightPx | 18899 |
| lg | estimateNodeHeight | 18915 | ug | paragraphSpacingBeforeRaw | 18918 |
| dg | paragraphSpacingAfterRaw | 18921 | fg | widowControlEnabled | 18924 |
| pg | isPlainPageBreakSpacer | 18926 | mg | spacingBeforeAfterPageBreak | 18929 |
| hg | paragraphCanSplitLines | 18935 | gg | lineRangeIsPartial | 18939 |
| _g | lineRangeForBand | 18942 | vg | segmentRenderBottomPx | 18957 |
| yg | segmentCoversWholeParagraph | 18961 | bg | splitEdgePadding | 18964 |
| xg | splitEdgeSmoothingPadding | 18974 | Sg | splitSegmentExtraHeight | 18987 |
| Cg | splitSegmentSmoothingExtraHeight | 18994 | wg | segmentMatchesLineRange | 19000 |
| Tg | nodeLayoutHeight | 19003 | Eg | resolveParagraphLineRange | 19025 |
| Dg | trySplitParagraphSegment | 19045 | Og | distributeSegmentsAcrossPages | 19092 |
| kg | rowRangeHeight | 19155 | Ag | fitRowsWithin | 19162 |
| jg | paginateByBreakHints | 19173 | | | |

### 1.2 C1 §A2 分页主循环（19190–19541）

| 原符号 | 语义名 | jsx | 说明 |
|---|---|---|---|
| Mg | paginateDocument | 19190–19541 | 全量逐字（内层逐节点推进 19230–19541 全量；19190–19229 与批 B 骨架重叠，见 §2.1） |

### 1.3 C1 §B 隙段（20231–20943）

| 原符号 | 语义名 | jsx | 原符号 | 语义名 | jsx |
|---|---|---|---|---|---|
| w_ | tocLevelOf | 20231 | T_ | isTocParagraph | 20241 |
| E_ | paragraphHasTocTab | 20242 | D_ | tocTabStopOf | 20245 |
| O_ | tocFirstTabStopPx | 20254 | k_ | paragraphHasTabChar | 20257 |
| A_ | countTabChars | 20260 | j_ | tabLayoutKindOf | 20269 |
| M_ | tabStopByAlignment | 20279 | N_ | decodeXmlEntities | 20282 |
| P_ | matchXmlRegions | 20291 | F_ | revisionKindOfTag | 20329 |
| I_ | normalizeWhitespace | 20341 | L_ | formatRevisionDateUtc | 20346 |
| R_ | stripTextBoxContentXml | 20357 | z_ | extractRunTextSegments | 20361 |
| B_ | xmlFlagEnabled | 20402 | V_ | xmlColorAttr | 20407 |
| H_ | parseRunStyleXml | 20413 | U_ | extractXmlRegionContents | 20451 |
| W_ | mergeRunStyles | 20454 | G_ | parseParagraphAlign | 20469 |
| K_ | escapeXmlAttrValue | 20474 | q_ | svgDataUrl | 20477 |
| J_ | emuToPxRounded | 20479 | Y_ | resolveFieldDisplayText | 20482 |
| X_ | parseTextBoxLines | 20504 | Z_ | parseTextBoxShapeStyle | 20574 |
| Q_ | textBoxPlainText | 20594 | $_ | textBoxRenderLines | 20600 |
| ev | textBoxZIndex | 20621 | tv | renderTextBoxSvg | 20625 |
| nv | syntheticTextBoxIsGraphicShape | 20674 | rv | parseShapeTransformXml | 20679 |
| iv | joinCssTransforms | 20695 | av | shapeTransformCss | 20699 |
| ov | isTopAnchoredFloating | 20726 | sv | describeFormattingList | 20729 |
| cv | describeRunFormattingXml | 20732 | lv | describeParagraphFormattingXml | 20736 |
| uv | describeTableFormattingXml | 20740 | dv | parseParagraphRevisions | 20746 |
| fv | parseParagraphCommentRanges | 20863 | pv | pageFieldKindOfInstruction | 20913 |
| mv | styleRefTargetOfInstruction | 20920 | hv | paragraphPageFieldKinds | 20930 |

### 1.4 C1 §D 依赖补全（范围外、§A/§B 必需）

| 原符号 | 语义名 | jsx | 原符号 | 语义名 | jsx |
|---|---|---|---|---|---|
| Br | twipsToPxNonNegative | 12019 | _o | PAGE_BREAK_RUN_RE | 13983 |
| vo | PAGE_BREAK_BEFORE_TAG_RE | 13984 | xo | paragraphHasPageBreakRun | 13993 |
| So | paragraphPageBreakBeforeOf | 13997 | Mo | nodePageBreakStarts | 14061 |
| Cp/wp/Tp | layoutTextCache/fragmentCache/singleFontCache | 17137–17139 | jp | tabPlaceholderSpaces | 17233 |
| Mp | paragraphLayoutText | 17248 | Np | splitParagraphByLineBreaks | 17330 |
| Pp | splitPartContentHeight | 17373 | Fp | fitSplitPartsHeight | 17380 |
| zp | layoutTextFragments | 17418 | Bp | singleFontOfLayoutText | 17440 |
| Vp | fragmentsForRuns | 17465 | Hp | paragraphLineLayout | 17480 |
| Gm | pageBreakHintMap | 18049 | Km | paragraphIsKeepNextCandidate | 18055 |
| qm | keepNextChainFitsPageTail | 18058 | Jm | paragraphDominantFontSizePt | 18088 |
| Ng | isInlineImageNode | 19542 | Fg | isPageMarginCornerAnchoredFloating | 19555 |
| Kg | isFloatingImageNode | 19817 | | | |

### 1.5 C2 §C [E6]c 全量（20944–24337，195 符号）

权威映射表在 `LegacyDocEngineC2.tsx` 文件头（行 20–138）与文件尾符号表；此处按段摘录。

| 段 | 原符号 → 语义名（jsx） |
|---|---|
| §1 域结果解析 | gv→pageFieldResultsCache (20944) · _v→paragraphPageFieldResults (20945) · vv→styleRefFieldResultsCache (20998) · yv→paragraphStyleRefFieldResults (20999) · bv→normalizeStyleName (21052) · xv→tocFieldFallback (21055) |
| §2 引导符/脚注/日期 | Sv→leaderBackgroundStyle (21074) · Cv→noteReferenceMark (21094) · wv→normalizeDateToIso (21104) |
| §3 段落 run 渲染器 | Tv→renderParagraphRuns (21113–21684，JSX，10 参) |
| §4 编号格式与标签 | Ev→romanNumeralOf (21685) · Dv→letterOrdinalOf (21693) · Ov→numberInFormat (21703) · kv→formatPageNumber (21728) · Av→numberingLevelOf (21732) · jv→numberingLevelHasVisibleBullet (21736) · Mv→numberingLevelIsBullet (21739) · Nv→numberingLevelsOf (21742) · Pv→effectiveNumIdOfParagraph (21746) · Fv→numberingLevelStart (21771) · Iv→numberingSuffixText (21777) · Lv→BULLET_GLYPH_REPLACEMENTS (21780) · Rv→replaceBulletGlyphs (21785) · zv→numberingLabelsForModel (21792) |
| §5 列表文本族 | Bv→UNORDERED_BULLET_PREFIX_REGEX · Vv→ORDERED_DOT_PREFIX_REGEX · Hv→ANY_LIST_PREFIX_REGEX · Uv→ORDERED_PREFIX_REGEX · Wv→LIST_INDENT_TWIPS=720 · Gv→LIST_HANGING_TWIPS=360 · Kv→MAX_NUMBERING_DEPTH_DEFAULT=8（均 21878） · qv→looksUnordered (21885) · Jv→looksOrdered (21888) · Yv→textIsBulletGlyphs (21891) · Xv→paragraphHasNumbering (21895) · Zv→numberingKindOf (21898) · Qv→isNumberedParagraph (21913) · $v→stripListPrefix (21917) · ey→listPrefixLength (21920) · ty→orderedSuccessor (21922) · ny→applyListPrefix (21928) |
| §6 结构克隆 | ry→cloneBorderSide (21933) · iy→cloneParagraphBorders (21938) · ay→cloneParagraphStyle (21948) · oy→cloneParagraphStyleWithDefaultSpacing (21969) · sy→cloneMarginTwips (21983) · cy→cloneTableBorderSide (21991) · ly→cloneTableBorders (21998) · uy→cloneCellStyle (22011) · dy→cloneRowStyle (22018) · fy→emptyParagraph (22024) · py→cloneCell (22037) · my→maxNumberingDepth (22048) · hy→shiftIndent (22057) · gy→applyListIndent (22066) · _y→removeListIndent (22081) · vy→cellParagraphsSignature (22099) |
| §7 表格几何 | yy→tableMaxColumnCount (22103) · by→floatingTableSide (22106) · xy→floatingTableWidthPx (22112) · Sy→floatingTableLayout (22118) · Cy→floatingTableStyle (22150) · wy→locateNestedTable (22173) · Ty→tableGridWidthsCache (22207) · Ey→tableGridWidthsCached (22208) · Dy→tableGridWidthsTwips (22215) · Oy→gridWidthsDivergeFromCells (22222) · ky→gridWidthsFromCellWidths (22240) · Ay→normalizeGridWidthsTwips (22266) · jy→normalizeGridWidthsPx (22276) · My→evenGridWidthsPx (22285) · Ny→clampTableContentWidthPx (22291) · Py→scaleGridWidthsToPx (22294) · Fy→rowColumnSpanCount (22336) · Iy→effectiveColumnWidthsPx (22339) · Ly→cellMarginsPx (22378，中) · Ry→cellPaddingStyle (22385) · zy→effectiveCellMarginTwips (22400，中) · db→diagonalBordersBackground (22884) |
| §8 边框预设 | By→borderTypeNormalized (22408) · Vy→borderSideCss (22411) · Hy→borderSideWidthPx (22421) · Uy→borderTypeVisible (22427) · Wy→paragraphBorderVisible (22431) · Gy→tableBorderVisible (22434) · Ky→cellBordersVisible (22437) · qy→tableUsesCellBorders (22440) · Jy→tableBorderSpacingPx (22446) · Yy→tableBorderCollapseStyle (22451) · Xy→firstParagraphBorder (22458) · Zy→firstTableBorder (22461) · Qy→normalizeParagraphBorderSpec (22464) · $y→normalizeTableBorderSpec (22472) · eb→nilParagraphBorder (22481) · tb→nilTableBorder (22486) · nb→paragraphBorderPresets (22491) · rb→paragraphsMatchBorderPreset (22514) · ib→toggleTableCellBorder (22553) · ab→tableBorderPresets (22619) · ob→toggleParagraphBorder (22644) · sb→toggleTableBorder (22727) · cb→cellBorderForSide (22839) · lb→cellBorderCss (22848) · ub→tableOuterBorderWidthPx (22868) |
| §9 run/表单域/文本编辑 | fb→cloneRunStyle (22901) · pb→withFontFamily (22906) · mb→cloneFormFieldWidget (22913) · hb→mergeFormFieldWidget (22934) · gb→cloneFormField (22970) · _b→sameJson (22993) · vb→normalizeParagraphChildren (22996) · yb→paragraphChildrenAllText (23027) · bb→cloneTextNode (23030) · xb→splitChildrenAt (23041) · Sb→runStyleAt (23074) · Cb→linkFrom (23088) · wb→linkWithin (23102) · Tb→expandLinkAt (23122) · Eb→applyRunStyleToRange (23154) · Db→applyLinkToRange (23216) · Ob→bytesToBase64Inline (23278) |
| §10 位置/批注/修订 | kb→selectionCoversCell (23288) · Ab→locationKeyContract (23291) · jb→imageLocationKeyContract (23294) · Mb→childLocationKey (23297) · Nb→locationFromDataset (23300) · Pb→firstTableCellLocation (23328) · Fb→tableFormattingRevisions (23342) · Ib→extractTrackedChanges (23379) · Lb→xmlTextPreview (23454) · Rb→commentAnchorText (23460) · zb→extractComments (23468) · Bb→colorWithAlpha (23537) · Vb→annotationColorFor (23541) · Hb→commentHighlightStyle (23550) · Ub→commentCardHeight (23557) · Wb→trackedChangeKindLabel (23562) · Gb→trackedChangeColor (23580) · Kb→trackedChangeIsAnnotatable (23610) · qb→locationSortVector (23613) · Jb→locationInPages (23616) · Yb→pageIndexForLocation (23619) · Xb→locationElement (23623) · Zb→annotationAnchorRect (23626) · Qb→elementWithClassToken (23644) · $b→annotationLocationElement (23652) · ex→elementByDataAttr (23655) · tx→annotationAnchorElement (23663) · nx→trackedChangeCardHeight (23679) · rx→assignConnectorLanes (23684) · ix→layoutGutterAnnotations (23712) · ax→sameLocation (23754) |
| §11 导航与选区 | ox→firstEditableCellLocation (23757) · sx→lastEditableCellLocation (23773) · cx→locationNodeIndex (23791) · lx→shiftLocationAfterTableRemoval (23794) · ux→tableFullTextRange (23813) · dx→emptiedTableIndexes (23830) · fx→firstLocationOfNode (23847) · px→previousEditableParagraphLocation (23854) · mx→nextEditableParagraphLocation (23861) · hx→firstEditableLocation (23899) · gx→lastLocation (23905) · _x→enumerateRangeLocations (23931) · vx→caretOffsetIn (23941) · yx→documentIsSingleParagraph (23945) · bx→rangeOffsetsInParagraph (23957) · xx→cloneLocation (23965) · Sx→cloneTextRange (23977) · Cx→cloneSelection (23989) · wx→sameSelection (24000) · Tx→sameTextPosition (24006) · Ex→sameTextRange (24009) · Dx→modelChangedBroadcastable (24016) · Ox→selectionRestoreArbitration (24019) · kx→htmlInsertionContract (24022) · Ax→isCompositionKey (24030) · jx→isNavigationOrEditKey (24033) · Mx→caretBeforeBlockText (24042) · Nx→caretXOutOfRange (24053) · Px→paragraphLocationOfImage (24056) · Fx→resolveLocation (24068) · Ix→locationFirstParagraph (24085) · Lx→toMutableLocation (24097) · Rx→locationBase (24108) · zx→locationFor (24120) · Bx→selectionRunStyle (24124) · Vx→nearestEditableLocation (24133) · Hx→normalizeRangeToEditable (24172) · Ux→selectionFromLocation (24191) · Wx→normalizeCursorState (24198) |
| §12 reducer 与节区草稿 | Gx→editorReducer (24208，Uo 工厂实例) · Kx→replaceTextAtLocation (24217) · qx→sectionParagraphDraftKey (24220) · Jx→sectionImageKey (24230) · Yx→cellParagraphDraftKey (24241) · Xx→parseSectionDraftKey (24244) · Zx→sectionNodeTextAt (24263) · Qx→sectionParagraphAt (24274) · $x→replaceSectionParagraphText (24290) · eS→moveSectionFloatingImage (24313) |

### 1.6 C2 §D 依赖补全（[E6]b 余带，范围外）

| 原符号 | 语义名 | jsx |
|---|---|---|
| Ig | floatingWrapSide | 19564 |
| Lg | floatingWrapStyle | 19576 |
| Rg | floatingAbsoluteStyle | 19649 |
| Gg | behindDocImageFrameSize | 19788 |
| Jg | imageIsPageAnchoredFloating | 19829（批 B 未实体化，见 §2.9） |

---

## §2 边界裁决（与批 A/B 及 C3）

1. **Mg 全量 vs 批 B 骨架**：批 B `BLayout.paginateDocumentReconstructed` 为骨架（内层 19230–19541 仅锚点登记）；C1 `paginateDocument` 为 19190–19541 逐字全量实体。两者并存，批 B 文件不改。
2. **_m/gm 间距族差异**（17851±）：批 B `spacingBeforeWithContext` 第 4 参为 `gridPitchPx` 且缺 mg 页断空格抑制；C1 按原式实体化 `spacingBeforeForPagination`/`spacingAfterForPagination`（直连 dg）。差异仅记录。
3. **BLayout declare 族实体化**：批 B BLayout 以 declare 登记的测量依赖（Ym/Qm/ch/lh/uh/Nh/Fh/Rh/zh/lg/Tg/Ng/Kg/Mo/Gm 等）由 C1 §D 按同名实体化，签名对齐。
4. **C1 declare → C2 实体**：C1 文件内 §0 登记的 11 项契约（zv/kv + 9 项表格几何：yy/Ey/jy/My/Ny/Py/Ly/zy/ub）全部由 C2 同名实体化，签名对齐（见 §3.1）。
5. **C3 Contract 名**：C3（批 B5-09）declare 的 Contract 后缀名由 C2 以「语义名 + 契约别名」双出（见 §3.2）；批 B BEditorState declare 的同源符号以语义名导出，差异名以别名双出（见 §3.3）。
6. **BLayout g_/__/x_ 第 3 参差异**：批 B 转录第 3 参为 `paragraph`，原式为 `text`（`Mi(text, style)` 语义）——C2 调用点以 cast 对接，差异仅记录，不改批 B。
7. **Engine4/Engine3 类型族冲突**：Engine4 公共面类型族出自 Engine3（DocxBlockNode 族），与 BModel 的 DocxNode 族不同构；按批 B 口径（BEditorState 先例：零 Engine4 导入），C2 将 `replaceModelParagraphText`/`replaceTableCellParagraphText`/`createEditorHistoryReducer` 改挂文件内 declare 契约（§0），并本地定义 `ParagraphTextOptions`；仅导入 `cachedStructuralHash`（参数 unknown，无冲突）。与批 B declare 的差异：批 B 以 `DocxEditorInternalState`/`DocxEditorAction` 描述 reducer 面，C2 契约以 `EditorReducerStateView`/`EditorReducerActionView`（model + unknown 扩展面）描述——语义同源，类型面更宽，兼容。
8. **[E6]b 余带 19542–20230 裁决**：C1 实体化 Ng/Fg (19542–19563) + Kg (19817–19820)；C2 §D 实体化 Ig/Lg/Rg/Gg/Jg（Tv 渲染必需）。**遗留未实体化**：zg (19680) / Bg (19683) / Vg (19696) / Hg (19724) / Ug (19761) / Wg (19783) + qg/Yg/Xg/Zg/Qg/e_/f_/m_ 族——C3 已按 declare 登记（含 jsx 行号注记），留待后续批次（不在本批三段互斥范围内）。
9. **批 B `paragraphHasPageAnchoredFloatingImage` 归属更正**：该函数实为 Yg/Zg 族段落级谓词（批 B 注释「原 Zg」），非图级 Jg (19829)。原式 Tv 在 21308 对图片子节点调用 `Jg(r)`；C2 §D 新增 `imageIsPageAnchoredFloating(image)` 并在 Tv 直连。批 B 文件不改，仅此处记录。

---

## §3 declare 契约实体化对照

### 3.1 C1 文件内 declare（11 项）→ C2 实体

| C1 declare（原符号） | C2 导出 | 状态 |
|---|---|---|
| numberingLabelsForModel (zv) | `numberingLabelsForModel` | ✓ 同名，签名对齐 |
| formatPageNumber (kv) | `formatPageNumber` | ✓ 同名，签名对齐 |
| tableMaxColumnCount (yy) | `tableMaxColumnCount` | ✓ 同名，签名对齐 |
| tableGridWidthsCached (Ey) | `tableGridWidthsCached` | ✓ 同名，签名对齐 |
| normalizeGridWidthsPx (jy) | `normalizeGridWidthsPx` | ✓ 同名，签名对齐 |
| evenGridWidthsPx (My) | `evenGridWidthsPx` | ✓ 同名，签名对齐 |
| clampTableContentWidthPx (Ny) | `clampTableContentWidthPx` | ✓ 同名，签名对齐 |
| scaleGridWidthsToPx (Py) | `scaleGridWidthsToPx` | ✓ 同名，签名对齐 |
| cellMarginsPx (Ly) | `cellMarginsPx` | ✓ 同名，签名对齐 |
| effectiveCellMarginTwips (zy) | `effectiveCellMarginTwips` | ✓ 同名（C1 declare 返回 unknown，C2 实体返回 `CellMarginTwips \| undefined`，更精确，兼容） |
| tableOuterBorderWidthPx (ub) | `tableOuterBorderWidthPx` | ✓ 同名，签名对齐 |

### 3.2 C3（批 B5-09）declare → C2 实体（[E6]c 范围项）

| C3 declare（原符号） | C2 导出 | 状态 / 差异 |
|---|---|---|
| locationKeyContract (Ab) | `locationKeyContract` | ✓ 同名 |
| imageLocationKeyContract (jb) | `imageLocationKeyContract` | ✓ 同名 |
| sameLocationContract (ax) | `sameLocation` + 别名 `sameLocationContract` | 差异：C3 参数允许 undefined；原式要求已定义位置 |
| cloneLocationContract (xx) | `cloneLocation` + 别名 `cloneLocationContract` | ✓ |
| htmlInsertionContract (kx) | `htmlInsertionContract` | 差异：cache 类型原式为 `Map<string, {__html: string}>`，C3 declare 写作 `Map<string, string>`；C2 按原式 |
| paragraphLocationOfImage (Px) | `paragraphLocationOfImage` | ✓ 同名 |
| locationBaseContract (Rx) | `locationBase` + 别名 `locationBaseContract` | ✓ |
| pageIndexForLocation (Yb) | `pageIndexForLocation` | ✓ 同名 |
| trackedChangeIsAnnotatable (Kb) | `trackedChangeIsAnnotatable` | 差异：原式参数 `{ kind: string }`，C3 declare 写作 unknown |
| locationSortVector (qb) | `locationSortVector` | ✓ 同名 |
| annotationAnchorElement (tx) | `annotationAnchorElement` | ✓ 同名 |
| annotationAnchorRect (Zb) | `annotationAnchorRect` | 差异：原式返回不含 `bottom`（不计算），C3 declare 含 bottom；参数序 (element, pageElement) |
| layoutGutterAnnotationsContract (ix) | `layoutGutterAnnotations` + 别名 `layoutGutterAnnotationsContract` | ✓ |
| paragraphBorderVisible (Wy) | `paragraphBorderVisible` | ✓ 同名 |
| enumerateRangeLocationsContract (_x) | `enumerateRangeLocations` + 别名 `enumerateRangeLocationsContract` | ✓ |
| rangeOffsetsInParagraph (bx) | `rangeOffsetsInParagraph` | ✓ 同名 |
| paragraphInsertOffset (vx) | 别名 `paragraphInsertOffset` = `caretOffsetIn` | ✓ |
| resolveLocationContract (Fx) | `resolveLocation` + 别名 `resolveLocationContract` | 差异：原式返回含 `tableNode?: DocxTableNode`，C3 declare 仅 `{ paragraph? }`（更宽，兼容） |
| tocFieldFallback (xv) | `tocFieldFallback` | ✓ 同名 |
| normalizeStyleName (bv) | `normalizeStyleName` | ✓ 同名 |
| selectionRestoreArbitration (Ox) | `selectionRestoreArbitration` | ✓ 同名 |
| caretXOutOfRange (Nx) | `caretXOutOfRange` | ✓ 同名 |
| sameTextRangeApprox (Ex) | 别名 `sameTextRangeApprox` = `sameTextRange` | ✓ |
| collapsedRangeToRestore (Sx) | 别名 `collapsedRangeToRestore` = `cloneTextRange` | ✓ |
| isNavigationOrEditKey (jx) | `isNavigationOrEditKey` | ✓ 同名 |
| isCompositionKey (Ax) | `isCompositionKey` | ✓ 同名 |
| previousEditableParagraphLocation (px) | `previousEditableParagraphLocation` | ✓ 同名（语义为节点末位可编辑段落；契约名已定，不改） |
| nextEditableParagraphLocation (mx) | `nextEditableParagraphLocation` | ✓ 同名 |
| paragraphIsListItem (Qv) | 别名 `paragraphIsListItem` = `isNumberedParagraph` | ✓ 签名对齐（均 (paragraph, text?)） |
| cellParagraphDraftKey (Yx) | `cellParagraphDraftKey` | ✓ 同名 |
| sectionParagraphDraftKey (qx) | `sectionParagraphDraftKey` | ✓ 同名 |
| parseSectionDraftKey (Xx) | `parseSectionDraftKey` | ✓ 同名 |
| sectionNodeTextAt (Zx) | `sectionNodeTextAt` | ✓ 同名 |
| replaceSectionParagraphText ($x) | `replaceSectionParagraphText` | ✓ 同名 |
| cloneRunStyleContract (fb) | 别名 `cloneRunStyleContract` = `cloneRunStyle` | ✓ |
| cellParagraphsSignature (vy) | `cellParagraphsSignature` | ✓ 同名（参数 DocxParagraphNode[]） |
| sectionImageKey (Jx) | `sectionImageKey` | ✓ 同名 |
| selectionCoversCell (kb) | `selectionCoversCell` | ✓ 同名 |
| parseImageDropZoneDataset (Nb) | 别名 `parseImageDropZoneDataset` = `locationFromDataset` | 差异：C3 返回 `DocxLocation & { childIndex }`，原式返回 `DocxLocation \| undefined`（运行期含 childIndex） |
| imageDropZoneKey (Mb) | 别名 `imageDropZoneKey` = `childLocationKey` | ✓ |
| tableGridColumnCount (yy) | 别名 `tableGridColumnCount` = `tableMaxColumnCount` | ✓ |
| tableGridColumnsCached (Ey) | 别名 `tableGridColumnsCached` = `tableGridWidthsCached` | ✓ |
| normalizeColumnWidths (jy) | 别名 `normalizeColumnWidths` = `normalizeGridWidthsPx` | 差异：C3 widths 参数 `(number\|undefined)[]`，原式 `number[]`（调用点先 map 归一） |
| defaultColumnWidths (My) | 别名 `defaultColumnWidths` = `evenGridWidthsPx` | ✓ |

C3 declare 中属范围外者（vi/uu/useVirtualizer 族/菜单表族/节区版式族/zg..Wg 等）不在本批对照内，维持 declare 状态。

### 3.3 批 B BEditorState declare → C2 实体

**同名命中（56 项）**：editorReducer · linkWithin · linkFrom · resolveLocation · normalizeCursorState · sameSelection · sameTextRange · cloneSelection · cloneTextRange · locationFor · sameLocation · selectionFromLocation · toMutableLocation · selectionRunStyle · replaceTextAtLocation · enumerateRangeLocations · applyRunStyleToRange · expandLinkAt · applyLinkToRange · runStyleAt · cloneParagraphStyle · applyListPrefix · listPrefixLength · stripListPrefix · looksUnordered · looksOrdered · orderedSuccessor · ORDERED_PREFIX_REGEX · maxNumberingDepth · shiftIndent · numberingKindOf · isNumberedParagraph · emptyParagraph · cloneCell · cloneRowStyle · firstTableCellLocation · locateNestedTable · moveSectionFloatingImage · bytesToBase64Inline · mergeFormFieldWidget · emptiedTableIndexes · documentIsSingleParagraph · lastLocation · caretOffsetIn · splitChildrenAt · shiftLocationAfterTableRemoval · cloneTextNode · extractTrackedChanges · extractComments · paragraphBorderPresets · tableBorderPresets · toggleParagraphBorder · toggleTableBorder · toggleTableCellBorder · cloneCellStyle · withFontFamily

**别名双出（2 项）**：`commitSectionParagraphText` = replaceSectionParagraphText ($x) · `clonePendingStyle` = cloneRunStyle (fb)

**差异名（记录，不改批 B）**：
- `rangeSplitOffsets`（批 B 名）→ C2 `rangeOffsetsInParagraph` (bx)
- `cloneBorders`（批 B 名）→ C2 `cloneTableBorders` (ly) / `cloneParagraphBorders` (iy)

**范围外（[E6]c 无对应实体，维持批 B declare）**：contentSignatureOf（Engine4 qs）· replaceParagraphText/replaceCellText（Engine4 Qa/eo）· childLocation · stripNumberingPrefix · renumberParagraph · canCommitParagraphText · splitParagraph · cellHasContent · clearDiagonalBorders · inheritableBorder · firstDefinedBorder · acceptRevision · rejectRevision · addComment · setCommentResolvedOnModel · serializeDocx · renderTextBoxImage · buildFloatingForWrapMode · resolveWrapMode · normalizeFormField · canCoalesceTyping

---

## §4 验证记录

### 4.1 门禁 1 — esbuild（两件各跑，0 错）

```
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/LegacyDocEngineC1.tsx --loader:.tsx=tsx --jsx=preserve
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/LegacyDocEngineC2.tsx --loader:.tsx=tsx --jsx=preserve
```
结果：两件均 `✓ Done`，0 error / 0 warning。

### 4.2 门禁 2 — tsc strict（0 错）

`/tmp/tsconfig.LegacyDocEngineC1.json`、`/tmp/tsconfig.LegacyDocEngineC2.json`（strict、target/lib ES2022+DOM、module ESNext、moduleResolution Bundler、jsx preserve、noEmit、skipLibCheck、typeRoots `web/node_modules/@types`、include 仅该产物）：

```
web/node_modules/.bin/tsc -p /tmp/tsconfig.LegacyDocEngineC1.json   # 0 错
web/node_modules/.bin/tsc -p /tmp/tsconfig.LegacyDocEngineC2.json   # 0 错
```

### 4.3 门禁 3 — 锚点回代（11 ≥ 8，逐字双向命中）

| jsx 行 | 纯字面量片段 | 产物 | jsx | 产物 |
|---|---|---|---|---|
| 20235 | `/^toc(?:[\s_-]*(\d+))?$/i` | C1 | HIT | HIT |
| 20288 | `.replace(/&quot;/g, `"`).replace(/&apos;/g, `'`)` | C1 | HIT | HIT |
| 18151 | `` `book antiqua` `` | C1 | HIT | HIT |
| 18457 | `/\r?\n/` | C1 | HIT | HIT |
| 21687 | `[[1e3, `M`], [900, `CM`], [500, `D`], [400, `CD`], …` | C2 | HIT | HIT |
| 21880 | `/^\s*(?:•\s+|\d+\.\s+)/` | C2 | HIT | HIT |
| 23456 | `/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi` | C2 | HIT | HIT |
| 23475 | `/<w:commentReference\b[^>]*w:id="(-?\d+)"/gi` | C2 | HIT | HIT |
| 23542 | `` [`#5b9bd5`, `#d65f5f`, `#8f6ac8`, `#70ad47`, `#d9872b`] `` | C2 | HIT | HIT |
| 23624 | `[data-docx-paragraph-kind="paragraph"][data-docx-paragraph-node-index=` | C2 | HIT | HIT |
| 19672 | `translateX(-50%)` | C2 | HIT | HIT |

### 4.4 门禁 4 — 报告完整性

本文件（覆盖清单 §1 / 边界裁决 §2 / declare 对照 §3 / 验证 §4 / 符号表 §5 / 遗留 §6）。

### 4.5 out/ 只读抽验

`md5 desktop/src/out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js`
= `cfa43c9f7be31ca608214e29ea1419ea`（与批次开工基线一致，完成后复验未变）。

---

## §5 符号表

权威符号表随产物落盘（体例同批 B）：

- `LegacyDocEngineC1.tsx` 文件头「混淆名→语义名」映射表 + 文件尾符号表（含把握度分级与常量复用登记：Lr(11997)=15 并入 TWIPS_PER_POINT_REF(bl=15)；Zc/Qc/Ac/el/tl/nl/ol/sl/cl/nd 常量双用登记）。
- `LegacyDocEngineC2.tsx` 文件头 195 符号映射表（行 20–138，权威）+ 文件尾符号表（含别名注记）。

把握度统计：C1 高 165 / 中 0；C2 高 204 / 中 2（Ly、zy，参数 unknown 收敛）。
别名汇总（C2 导出）：sameLocationContract · layoutGutterAnnotationsContract · cloneLocationContract · collapsedRangeToRestore · sameTextRangeApprox · enumerateRangeLocationsContract · paragraphInsertOffset · resolveLocationContract · locationBaseContract · cloneRunStyleContract · clonePendingStyle · parseImageDropZoneDataset · imageDropZoneKey · commitSectionParagraphText · paragraphIsListItem · tableGridColumnCount · tableGridColumnsCached · normalizeColumnWidths · defaultColumnWidths。

---

## §6 遗留问题

1. **chunk-YE7GQOST 未解码**：`deepCloneModel`（原 h）、`newBlockId`（原 v）在 C2 以 declare 登记，待该 chunk 批次实体化。
2. **[E6]b 余带未实体化**：zg (19680) / Bg (19683) / Vg (19696) / Hg (19724) / Ug (19761) / Wg (19783) 及 qg/Yg/Xg/Zg/Qg/e_/f_/m_ 族（19542–20230 内除 C1/C2 §D 已覆盖者）；C3 已 declare 登记，留待后续批次。
3. **C3 declare 签名差异**（按原式实体化，差异见 §3.2）：htmlInsertionContract cache 类型、sameLocationContract undefined 参数、trackedChangeIsAnnotatable 参数、annotationAnchorRect 返回缺 bottom、normalizeColumnWidths widths 参数、parseImageDropZoneDataset 返回。装配批次（接线）时以 C2 实体签名为准。
4. **px 语义**：原式 `previousEditableParagraphLocation` 语义为「节点末位可编辑段落」，契约名已按 C3 declare 固定，未改名。
5. **批 B 差异未回改**（纪律：不改既有产物）：§2.2（_m/gm）、§2.6（g_/__/x_ 第 3 参）、§2.9（paragraphHasPageAnchoredFloatingImage 归属）。
6. **Engine4 契约本地化**：replaceModelParagraphText/replaceTableCellParagraphText/createEditorHistoryReducer 在 C2 为文件内 declare；若后续 Engine4 批次统一类型族，可改直连导入。
