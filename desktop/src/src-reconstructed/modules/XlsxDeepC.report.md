# XlsxDeepC.report.md — B5-12c：react-xlsx 私有引擎深部中段（曲面图助手子段 + 常量族/上下文/工具栏 UI/行渲染层）逐字重建

- 批次：**B5-12c**（补抽：B5-12a 与 B5-12b 之间未分配段 + 12a declare 挂接子段实体化）
- 主口径（只读）：`desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`
  （199,508 行；md5 基线 `4193214026dc469cb45056f49795e25e`，完工抽验未变，§6.5）
- jsx 孪生：`desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx`（49,724 行）
- 产物：`XlsxDeepC.tsx`（5,133 行）+ 本报告；仅写入 `desktop/src/src-reconstructed/modules/`。

## 0. 摘要

| 项 | 结果 |
|---|---|
| 覆盖 | **B. js 183064–183971**（908 行，地图/图表助手子段）+ **A. js 189512–193216**（3,705 行，常量族/上下文/工具栏 UI/行渲染层），合计 **4,613 行逐字** |
| 符号 | 297 个顶层符号全部语义化（161 export / 136 段内私有；export 判据 §3.3） |
| 门禁 1 | esbuild `--loader:.tsx=tsx --jsx=preserve` → **0 错**（§6.1） |
| 门禁 2 | tsc strict（`/tmp/tsconfig.XlsxDeepC.json`，ES2022/Bundler/typeRoots→web）→ **0 错**（§6.2） |
| 门禁 3 | 锚点回代 **10/10 命中**（≥8 达标），全部原文唯一行（§6.3） |
| 门禁 4 | 报告完整（本文件） |
| 超门禁 | 全量逆映射回代 diff：**4,613/4,613 行逐字节一致，0 失配**（§6.4） |
| 纪律 | 未动 `out/`（md5 未变）；未改任何既有 .tsx/.report.md；未派生子代理；与 12b（≥193217）行号互斥 |

## 1. 覆盖清单（符号 → 行号）

行号格式：主口径 js 行 / jsx 孪生行。全表与 `XlsxDeepC.tsx` 文件头「一、映射表」逐字一致；
`·export` = 跨段消费导出；〔中〕 = 语义名中等把握度（§7）。


### 1.1 B1 曲面图色带/几何助手（js 183064–183671）：32 个符号

```text
 *   Vu  → clampValue                       (js 183064 / jsx 37565)
 *   Hu  → parseNumericInput                (js 183067 / jsx 37568)
 *   Uu  → parseSurfaceHexRgb               (js 183077 / jsx 37578)
 *   Wu  → mixSurfaceHexColors              (js 183087 / jsx 37586)
 *   Gu  → lightenSurfaceHex                (js 183095 / jsx 37594)
 *   Ku  → darkenSurfaceHex                 (js 183098 / jsx 37597)
 *   qu  → resolveChartPrimaryColor         (js 183101 / jsx 37600)〔中〕
 *   Ju  → unwrapChartStyleId               (js 183111 / jsx 37603)〔中〕
 *   Yu  → normalizeHexColorLiteral         (js 183114 / jsx 37606)
 *   Xu  → resolveSeriesAccentColor         (js 183121 / jsx 37613)〔中〕
 *   Zu  → surfaceStyleTintRamp             (js 183127 / jsx 37619)〔中〕
 *   Qu  → surfaceStyleRampFor              (js 183132 / jsx 37622)〔中〕
 *   $u  → isSurfaceStyleApplied            (js 183145 / jsx 37627)〔中〕
 *   ed  → resolveSurfaceBandTotal          (js 183156 / jsx 37632)〔中〕
 *   td  → resolveSurfaceBandRamp           (js 183174 / jsx 37639)〔中〕
 *   nd  → computeSurfaceValueTicks         (js 183183 / jsx 37648)〔中〕
 *   rd  → surfaceBandColorForValue         (js 183212 / jsx 37673)
 *   id  → surfaceBandColorAlias            (js 183221 / jsx 37680)
 *   ad  → surfaceLineColorsForChart        (js 183224 / jsx 37683)
 *   od  → surfaceLineColorForValue         (js 183231 / jsx 37688)
 *   sd  → hexToRgbaTuple                   (js 183240 / jsx 37695)
 *   cd  → surfaceLitRgba                   (js 183244 / jsx 37699)〔中〕
 *   ld  → bilinearInterpolateValue         (js 183247 / jsx 37702)〔中〕
 *   ud  → normalizeGridU                   (js 183250 / jsx 37705)
 *   dd  → normalizeGridV                   (js 183253 / jsx 37708)
 *   fd  → surfaceValueElevation            (js 183256 / jsx 37711)
 *   pd  → projectSurfacePoint3d            (js 183259 / jsx 37714)
 *   md  → triangleSurfaceNormal            (js 183271 / jsx 37730)
 *   hd  → withAbsoluteDepth                (js 183284 / jsx 37747)
 *   gd  → withRelativeDepth                (js 183287 / jsx 37753)
 *   _d  → isFlatSurfaceChart               (js 183290 / jsx 37759)
 *   vd  → buildSurfaceGeometry             (js 183301 / jsx 37763)
```

### 1.2 B2 曲面图面板（js 183672–183889）：1 个符号

```text
 *   yd  → SurfaceChartPanel                (js 183672 / jsx 38098) ·export
```

### 1.3 B3 图表选择助手（js 183890–183971）：9 个符号

```text
 *   bd  → chartSeriesDataAttrs             (js 183890 / jsx 38288) ·export
 *   xd  → chartSeriesFirstDataAttrs        (js 183898 / jsx 38299) ·export
 *   Sd  → closestChartSeriesElement        (js 183901 / jsx 38304) ·export
 *   Cd  → resolveChartElementTarget        (js 183904 / jsx 38307) ·export
 *   wd  → isChartSeriesSelected            (js 183926 / jsx 38336) ·export
 *   Td  → isChartPointSelected             (js 183929 / jsx 38339) ·export
 *   Ed  → isChartElementSelected           (js 183932 / jsx 38342) ·export
 *   Dd  → renderRectSelectionHandles       (js 183935 / jsx 38345) ·export
 *   Od  → renderSelectionHandles           (js 183947 / jsx 38360) ·export
```

### 1.4 A1 常量族 var 链（js 189512–189582）：52 个符号

```text
 *   xm  → DEFAULT_ROW_HEIGHT               (js 189512 / jsx 41541) ·export
 *   Sm  → DEFAULT_COL_WIDTH                (js 189513 / jsx 41542) ·export
 *   Cm  → HEADER_ROW_HEIGHT                (js 189514 / jsx 41543) ·export
 *   wm  → ROW_HEADER_WIDTH                 (js 189515 / jsx 41544) ·export
 *   Tm  → RANGE_CLIPBOARD_MIME             (js 189516 / jsx 41545) ·export
 *   Em  → MIN_RENDERED_ROWS                (js 189517 / jsx 41546) ·export
 *   Dm  → MIN_RENDERED_COLS                (js 189518 / jsx 41547) ·export
 *   Om  → ROW_BATCH_SIZE                   (js 189519 / jsx 41548) ·export
 *   km  → COL_BATCH_SIZE                   (js 189520 / jsx 41549) ·export
 *   Am  → MAX_RENDERED_ROWS                (js 189521 / jsx 41550) ·export
 *   jm  → MAX_RENDERED_COLS                (js 189522 / jsx 41551) ·export
 *   Mm  → ROW_CAPACITY_STEP                (js 189523 / jsx 41552) ·export
 *   Nm  → COL_CAPACITY_STEP                (js 189524 / jsx 41553) ·export
 *   Pm  → ROW_PREFETCH_THRESHOLD           (js 189525 / jsx 41554) ·export
 *   Fm  → COL_PREFETCH_THRESHOLD           (js 189526 / jsx 41555) ·export
 *   Im  → ROW_SCROLL_GROWTH_STEP           (js 189527 / jsx 41556) ·export
 *   Lm  → COL_SCROLL_GROWTH_STEP           (js 189528 / jsx 41557) ·export
 *   Rm  → ROW_SCROLL_PREFETCH_PX           (js 189529 / jsx 41558) ·export
 *   zm  → COL_SCROLL_PREFETCH_PX           (js 189530 / jsx 41559) ·export
 *   Bm  → POINTER_MOVE_TOLERANCE_PX        (js 189531 / jsx 41560) ·export
 *   Vm  → SCROLLBAR_PLACEHOLDER_PX         (js 189532 / jsx 41561) ·export
 *   Hm  → RESIZE_HANDLE_SIZE_PX            (js 189533 / jsx 41562)
 *   Um  → FROZEN_DIVIDER_HIT_TOLERANCE_PX  (js 189534 / jsx 41563) ·export
 *   Wm  → CONTENT_LAYER_MAX_PX             (js 189535 / jsx 41564) ·export
 *   Gm  → VIEWPORT_OVERDRAW_MAX_PX         (js 189536 / jsx 41565) ·export
 *   Km  → SCROLL_SYNC_INVALIDATE_PX        (js 189537 / jsx 41566) ·export
 *   qm  → SCROLL_JUMP_THRESHOLD_PX         (js 189538 / jsx 41567) ·export
 *   Jm  → CONTENT_CULL_MARGIN_PX           (js 189539 / jsx 41568) ·export
 *   Ym  → GESTURE_ZOOM_SETTLE_MS           (js 189540 / jsx 41569) ·export
 *   Xm  → WHEEL_ZOOM_FACTOR                (js 189541 / jsx 41570) ·export
 *   Zm  → WHEEL_LINE_DELTA_PX              (js 189542 / jsx 41571)
 *   Qm  → CHART_HIGHLIGHT_PALETTE          (js 189543 / jsx 41572)
 *   $m  → CHART_HIGHLIGHT_ROLE_COLORS      (js 189544 / jsx 41573)
 *   eh  → DEFAULT_EDITOR_BACKGROUND        (js 189551 / jsx 41580) ·export
 *   th  → MUTED_SLATE_COLOR                (js 189552 / jsx 41581) ·export
 *   nh  → LIGHT_CANVAS_SURFACE             (js 189553 / jsx 41582) ·export
 *   rh  → HANDLE_SHADOW_COLOR              (js 189554 / jsx 41583)
 *   ih  → CELL_PADDING                     (js 189555 / jsx 41584) ·export
 *   ah  → RESIZE_HANDLE_DIRECTIONS         (js 189556 / jsx 41585) ·export
 *   oh  → STYLE_INFO_CACHE_CAPACITY        (js 189557 / jsx 41586)
 *   sh  → TEXT_WIDTH_CACHE_CAPACITY        (js 189558 / jsx 41587)
 *   ch  → TRUNCATE_CACHE_CAPACITY          (js 189559 / jsx 41588)
 *   lh  → WRAP_CACHE_CAPACITY              (js 189560 / jsx 41589)
 *   uh  → PATH2D_CACHE_CAPACITY            (js 189561 / jsx 41590)
 *   dh  → EMPTY_VIRTUAL_ITEMS              (js 189562 / jsx 41591) ·export
 *   fh  → RESIZE_CURSOR_BY_DIRECTION       (js 189563 / jsx 41592) ·export
 *   ph  → CSS_LENGTH_PROPERTIES            (js 189573 / jsx 41602)
 *   mh  → STYLE_INFO_CACHE                 (js 189578 / jsx 41603)
 *   hh  → TEXT_WIDTH_CACHE                 (js 189579 / jsx 41604)
 *   gh  → TRUNCATE_CACHE                   (js 189580 / jsx 41605)
 *   _h  → WRAP_CACHE                       (js 189581 / jsx 41606)
 *   vh  → PATH2D_CACHE                     (js 189582 / jsx 41607)
```

### 1.5 A2 缓存/文本测量/边框解析（js 189583–189873）：23 个符号

```text
 *   yh  → cachePutEvicting                 (js 189583 / jsx 41608)
 *   bh  → roundToQuarterPx                 (js 189590 / jsx 41615)
 *   xh  → measureTextWidthCached           (js 189593 / jsx 41618) ·export
 *   Sh  → drawTextDecorations              (js 189599 / jsx 41624) ·export
 *   Ch  → getPath2dCached                  (js 189622 / jsx 41641) ·export
 *   wh  → scaleCssLengths                  (js 189625 / jsx 41644) ·export
 *   Th  → scaleStyleValues                 (js 189633 / jsx 41650) ·export
 *   Eh  → parseLengthNumber                (js 189651 / jsx 41665)〔中〕
 *   Dh  → parseBoxInsets                   (js 189662 / jsx 41676)〔中〕
 *   Oh  → resolveTextRotationDeg           (js 189686 / jsx 41727) ·export〔中〕
 *   kh  → resolveFontShorthand             (js 189691 / jsx 41730) ·export〔中〕
 *   Ah  → fontShorthandAtSize              (js 189702 / jsx 41736) ·export〔中〕
 *   jh  → parseBorderShorthand             (js 189714 / jsx 41742) ·export
 *   Mh  → borderStyleRank                  (js 189725 / jsx 41757)〔中〕
 *   Nh  → pickStrongerBorder               (js 189728 / jsx 41765) ·export
 *   Ph  → applyLineDashForBorderStyle      (js 189732 / jsx 41769)〔中〕
 *   Fh  → drawCellBorder                   (js 189743 / jsx 41780) ·export
 *   Ih  → truncateTextToWidth              (js 189767 / jsx 41796) ·export
 *   Lh  → resolveFontSizePx                (js 189782 / jsx 41811) ·export
 *   Rh  → resolveLineHeightPx              (js 189793 / jsx 41821) ·export
 *   zh  → resolveTextBaselineY             (js 189814 / jsx 41833) ·export〔中〕
 *   Bh  → fitTextCharCount                 (js 189817 / jsx 41836)〔中〕
 *   Vh  → wrapTextToWidth                  (js 189828 / jsx 41847) ·export
```

### 1.6 A3 样式解析与条件格式绘制（js 189874–190101）：15 个符号

```text
 *   Hh  → resolveCellStyleInfo             (js 189874 / jsx 41886) ·export
 *   Uh  → splitTopLevelSegments            (js 189916 / jsx 41902)〔中〕
 *   Wh  → parseGradientStops               (js 189937 / jsx 41923)〔中〕
 *   Gh  → createGradientFill               (js 189950 / jsx 41935) ·export
 *   Kh  → createDataBarFill                (js 190010 / jsx 41976) ·export
 *   qh  → drawConditionalIconGlyph         (js 190015 / jsx 41981) ·export
 *   Jh  → formatZoomPercent                (js 190055 / jsx 41995)
 *   Yh  → clampToBounds                    (js 190058 / jsx 41998) ·export
 *   Xh  → normalizeWheelDelta              (js 190061 / jsx 42001) ·export
 *   Zh  → clampPointToRect                 (js 190072 / jsx 42012) ·export
 *   Qh  → pointerDistance                  (js 190075 / jsx 42018) ·export〔中〕
 *   $h  → parseHexRgb                      (js 190078 / jsx 42021)
 *   eg  → blendHexColors                   (js 190088 / jsx 42029)
 *   tg  → lightenHex                       (js 190096 / jsx 42037)
 *   ng  → darkenHex                        (js 190099 / jsx 42040)
```

### 1.7 A4 上下文（js 190102–190103）：2 个符号

```text
 *   rg  → SpreadsheetControllerContext     (js 190102 / jsx 42043) ·export
 *   ig  → SpreadsheetHeaderThemeContext    (js 190103 / jsx 42044) ·export
```

### 1.8 A5 区域/布局/锚点助手（js 190104–190359）：33 个符号

```text
 *   ag  → joinClassNames                   (js 190104 / jsx 42047) ·export
 *   og  → darkHeaderSurface                (js 190107 / jsx 42050)〔中〕
 *   sg  → resolveHeaderSurfaceColor        (js 190110 / jsx 42053) ·export〔中〕
 *   cg  → normalizeRangeBounds             (js 190113 / jsx 42056) ·export
 *   lg  → parseCellKey                     (js 190119 / jsx 42068) ·export〔中〕
 *   ug  → isSameCell                       (js 190126 / jsx 42078) ·export
 *   dg  → cellInRange                      (js 190129 / jsx 42081) ·export
 *   fg  → chartHighlightForCell            (js 190134 / jsx 42086) ·export〔中〕
 *   pg  → rangesEqual                      (js 190150 / jsx 42102) ·export
 *   mg  → isPrintableCharKey               (js 190161 / jsx 42108) ·export〔中〕
 *   hg  → closestInteractiveElement        (js 190164 / jsx 42111) ·export〔中〕
 *   gg  → isFocusWithinContainer           (js 190171 / jsx 42114) ·export〔中〕
 *   _g  → buildPrefixSums                  (js 190175 / jsx 42118) ·export
 *   vg  → rangeHasIndex                    (js 190180 / jsx 42123)〔中〕
 *   yg  → expandIndicesAcrossMerges        (js 190184 / jsx 42127) ·export
 *   bg  → rangesFingerprint                (js 190209 / jsx 42151) ·export
 *   xg  → rangeBoundsKey                   (js 190212 / jsx 42154) ·export〔中〕
 *   Sg  → prefixSpanBetween                (js 190217 / jsx 42159) ·export〔中〕
 *   Cg  → offsetsByIndices                 (js 190220 / jsx 42162) ·export〔中〕
 *   wg  → findSegmentIndexAt               (js 190226 / jsx 42168) ·export〔中〕
 *   Tg  → clampScrollOffset                (js 190239 / jsx 42181) ·export
 *   Eg  → minContentExtent                 (js 190242 / jsx 42184) ·export〔中〕
 *   Dg  → collectRenderIndices             (js 190245 / jsx 42187) ·export
 *   Og  → resolveRenderCapacity            (js 190259 / jsx 42201) ·export
 *   kg  → offsetBeforeIndex                (js 190263 / jsx 42205)〔中〕
 *   Ag  → resolveIndexOffset               (js 190268 / jsx 42210)〔中〕
 *   jg  → resolveAnchorRectPx              (js 190273 / jsx 42215) ·export〔中〕
 *   Mg  → drawingRectPx                    (js 190301 / jsx 42244) ·export
 *   Ng  → imageAnchorMaxCell               (js 190304 / jsx 42247) ·export〔中〕
 *   Pg  → shapeAnchorMaxCell               (js 190314 / jsx 42259) ·export〔中〕
 *   Fg  → chartAnchorMaxCell               (js 190324 / jsx 42271) ·export〔中〕
 *   Ig  → rectsIntersectWithMargin         (js 190334 / jsx 42283) ·export
 *   Lg  → resolveScrollRegionKind          (js 190343 / jsx 42292) ·export〔中〕
```

### 1.9 A6 形状容器与预置几何路径（js 190360–191050）：33 个符号

```text
 *   Rg  → shapeContainerStyle              (js 190360 / jsx 42303) ·export
 *   zg  → clampShapeAdjust                 (js 190400 / jsx 42331)〔中〕
 *   Bg  → resolveShapeAdjust               (js 190403 / jsx 42334)〔中〕
 *   Vg  → pointsToOutlinePath              (js 190407 / jsx 42338)
 *   Hg  → polarPoint                       (js 190412 / jsx 42341)
 *   Ug  → regularPolygonPath               (js 190416 / jsx 42345)
 *   Wg  → starPolygonPath                  (js 190419 / jsx 42350)
 *   Gg  → roundedRectPath                  (js 190424 / jsx 42355)
 *   Kg  → ellipsePath                      (js 190440 / jsx 42360)
 *   qg  → pieWedgePath                     (js 190443 / jsx 42363)
 *   Jg  → chordPath                        (js 190449 / jsx 42369)
 *   Yg  → plusCrossPath                    (js 190455 / jsx 42375)
 *   Xg  → pentagonArrowPath                (js 190474 / jsx 42381)
 *   Zg  → chevronArrowPath                 (js 190485 / jsx 42384)
 *   Qg  → notchedArrowPath                 (js 190497 / jsx 42387)
 *   $g  → stripedArrowPath                 (js 190516 / jsx 42396)
 *   e_  → leftUpArrowPath                  (js 190535 / jsx 42404)
 *   t_  → bentUpArrowPath                  (js 190548 / jsx 42409)
 *   n_  → uturnArrowPath                   (js 190568 / jsx 42417)
 *   r_  → leftRightUpArrowPath             (js 190585 / jsx 42421)
 *   i_  → quadArrowPath                    (js 190612 / jsx 42430)
 *   a_  → heartPath                        (js 190646 / jsx 42439)
 *   o_  → lightningBoltPath                (js 190658 / jsx 42442)
 *   s_  → teardropPath                     (js 190669 / jsx 42445)
 *   c_  → cloudPath                        (js 190679 / jsx 42448)
 *   l_  → rightArrowPath                   (js 190695 / jsx 42451)
 *   u_  → leftArrowPath                    (js 190711 / jsx 42459)
 *   d_  → upArrowPath                      (js 190727 / jsx 42467)
 *   f_  → downArrowPath                    (js 190743 / jsx 42475)
 *   p_  → leftRightArrowPath               (js 190759 / jsx 42483)
 *   m_  → upDownArrowPath                  (js 190777 / jsx 42490)
 *   h_  → bentArrowPath                    (js 190795 / jsx 42497)
 *   g_  → resolveAutoShapePath             (js 190815 / jsx 42507)
```

### 1.10 A7 形状 SVG/文本 run/主题与样式 CSS（js 191051–191415）：30 个符号

```text
 *   __  → resolveShapeSvgPath              (js 191051 / jsx 43142) ·export
 *   v_  → traceRoundedRectPath             (js 191054 / jsx 43148) ·export〔中〕
 *   y_  → applyDashPattern                 (js 191068 / jsx 43152) ·export〔中〕
 *   b_  → renderArrowMarkerDef             (js 191092 / jsx 43176) ·export〔中〕
 *   x_  → renderTextParagraphRuns          (js 191113 / jsx 43182) ·export
 *   S_  → clampRectToGrid                  (js 191139 / jsx 43196) ·export〔中〕
 *   C_  → resizeHandleStyle                (js 191150 / jsx 43207) ·export
 *   w_  → useGridTheme                     (js 191175 / jsx 43224) ·export
 *   T_  → columnIndexToLetters             (js 191178 / jsx 43227) ·export
 *   E_  → formatCellRef                    (js 191184 / jsx 43233)
 *   D_  → parseCellRef                     (js 191187 / jsx 43236)
 *   O_  → resolveGridCellStyle             (js 191195 / jsx 43247) ·export
 *   k_  → parseExternalCellRef             (js 191205 / jsx 43255) ·export〔中〕
 *   A_  → decodeXmlEntities                (js 191219 / jsx 43267)
 *   j_  → borderToCssShorthand             (js 191229 / jsx 43270)
 *   M_  → isDarkTheme                      (js 191233 / jsx 43296) ·export
 *   N_  → parseColorToRgbTuple             (js 191236 / jsx 43299)〔中〕
 *   P_  → colorWithAlpha                   (js 191266 / jsx 43311)〔中〕
 *   F_  → relativeLuminance                (js 191272 / jsx 43317)〔中〕
 *   I_  → contrastRatio                    (js 191281 / jsx 43326)〔中〕
 *   L_  → resolveContrastTextColor         (js 191289 / jsx 43334) ·export
 *   R_  → hueChannel                       (js 191296 / jsx 43341)〔中〕
 *   z_  → hslToRgbTuple                    (js 191304 / jsx 43345)〔中〕
 *   B_  → quoteFontFamily                  (js 191317 / jsx 43354)〔中〕
 *   V_  → resolveSchemeFontFamily          (js 191320 / jsx 43357)〔中〕
 *   H_  → resolveFontFamilyStack           (js 191325 / jsx 43362)
 *   U_  → lineHeightMultiplier             (js 191334 / jsx 43366)〔中〕
 *   W_  → gridInsetShadow                  (js 191338 / jsx 43370) ·export〔中〕
 *   G_  → resolveCellStyleCss              (js 191346 / jsx 43374) ·export
 *   K_  → measureCanvasSingleton           (js 191415 / jsx 43438)
```

### 1.11 A8 文本测量与单元格显示/区域解析（js 191416–191617）：15 个符号

```text
 *   q_  → verticalPaddingPx                (js 191416 / jsx 43439) ·export〔中〕
 *   J_  → styleFontShorthand               (js 191431 / jsx 43444)〔中〕
 *   Y_  → measureCellTextWidth             (js 191434 / jsx 43447) ·export〔中〕
 *   X_  → estimateCellContentHeight        (js 191441 / jsx 43456) ·export〔中〕
 *   Z_  → canOverflowRight                 (js 191459 / jsx 43471) ·export〔中〕
 *   Q_  → isRenderableEmptyCell            (js 191465 / jsx 43476) ·export〔中〕
 *   $_  → resolveCellDisplayText           (js 191468 / jsx 43479) ·export
 *   ev  → numericValueAtCell               (js 191482 / jsx 43490) ·export〔中〕
 *   tv  → booleanValueAtCell               (js 191490 / jsx 43498) ·export〔中〕
 *   nv  → parseRangeLiteral                (js 191500 / jsx 43508)
 *   rv  → unquoteSheetName                 (js 191506 / jsx 43517)〔中〕
 *   iv  → splitQualifiedRef                (js 191510 / jsx 43521)
 *   av  → resolveFormulaRangeRef           (js 191526 / jsx 43540)〔中〕
 *   ov  → rangeCellAtOffset                (js 191548 / jsx 43563)〔中〕
 *   sv  → chartSelectionRanges             (js 191559 / jsx 43580) ·export
```

### 1.12 A9 迷你图/单元格批/表格样式（js 191618–191849）：13 个符号

```text
 *   cv  → sparklineValueScale              (js 191618 / jsx 43640) ·export〔中〕
 *   lv  → renderSparklineSvg               (js 191621 / jsx 43643)
 *   uv  → toNonNegativeInteger             (js 191736 / jsx 43709) ·export〔中〕
 *   dv  → toPlainRecord                    (js 191739 / jsx 43712) ·export〔中〕
 *   fv  → parseHyperlinkInfo               (js 191742 / jsx 43715)〔中〕
 *   pv  → parseMergeSpan                   (js 191752 / jsx 43723)〔中〕
 *   mv  → resolveDisplayValue              (js 191759 / jsx 43733)〔中〕
 *   hv  → buildCellBatchMap                (js 191764 / jsx 43741) ·export
 *   gv  → findRangeContaining              (js 191786 / jsx 43765) ·export〔中〕
 *   _v  → mergeCellStyles                  (js 191791 / jsx 43768) ·export
 *   vv  → expandTableBorderSpans           (js 191807 / jsx 43796)〔中〕
 *   yv  → resolveTableCellStyle            (js 191818 / jsx 43808) ·export
 *   bv  → tableColumnAtHeader              (js 191845 / jsx 43833) ·export〔中〕
```

### 1.13 A10 工具栏与页签条 UI（js 191850–192335）：15 个符号

```text
 *   xv  → SortDirectionMenu                (js 191850 / jsx 43838) ·export
 *   Sv  → headerFilterButtonStyle          (js 191896 / jsx 43872) ·export〔中〕
 *   Cv  → WorkbookSheetTabStrip            (js 191915 / jsx 43891)
 *   wv  → SpreadsheetToolbar               (js 191961 / jsx 43925)
 *   Tv  → resolveToolbarNode               (js 192125 / jsx 44027) ·export〔中〕
 *   Ev  → resolveErrorNode                 (js 192134 / jsx 44033) ·export〔中〕
 *   Dv  → resolveLoadingNode               (js 192153 / jsx 44045) ·export〔中〕
 *   Ov  → resolveEmptyNode                 (js 192170 / jsx 44055) ·export〔中〕
 *   kv  → formatByteSize                   (js 192187 / jsx 44067)
 *   Av  → renderFileSizeLimitState         (js 192195 / jsx 44075) ·export
 *   jv  → resolveFileTooLargeNode          (js 192234 / jsx 44098) ·export〔中〕
 *   Mv  → ChartLoadingBars                 (js 192237 / jsx 44101)〔中〕
 *   Nv  → resolveChartLoadingNode          (js 192264 / jsx 44126) ·export〔中〕
 *   Pv  → formatByteSizeAlias              (js 192268 / jsx 44134)〔中〕
 *   Fv  → DeferredLoadPrompt               (js 192276 / jsx 44142) ·export
```

### 1.14 A11 选区调色板/canvas blit/条件格式与窗体控件（js 192336–192831）：22 个符号

```text
 *   Iv  → resolveSelectionPalette          (js 192336 / jsx 44187) ·export〔中〕
 *   Lv  → fullBleedRects                   (js 192344 / jsx 44200) ·export〔中〕
 *   Rv  → rectIntersectsAnyRect            (js 192347 / jsx 44208) ·export〔中〕
 *   zv  → blitScrolledCanvas               (js 192353 / jsx 44214) ·export〔中〕
 *   Bv  → conditionalRuleKey               (js 192388 / jsx 44261)〔中〕
 *   Vv  → resolveCfvoThreshold             (js 192391 / jsx 44264)
 *   Hv  → iconSetAppearanceFor             (js 192405 / jsx 44272)
 *   Uv  → renderConditionalIconSvg         (js 192490 / jsx 44383)
 *   Wv  → isCheckboxChecked                (js 192539 / jsx 44411) ·export〔中〕
 *   Gv  → isCheckboxMixed                  (js 192542 / jsx 44414) ·export〔中〕
 *   Kv  → normalizeFormControlModel        (js 192545 / jsx 44417) ·export〔中〕
 *   qv  → renderCheckboxIcon               (js 192615 / jsx 44493) ·export
 *   Jv  → renderRadioIcon                  (js 192658 / jsx 44501) ·export
 *   Yv  → cleanFormControlCaption          (js 192680 / jsx 44508) ·export〔中〕
 *   Xv  → resolveDataBarAppearance         (js 192694 / jsx 44514) ·export
 *   Zv  → resolveColorScaleAppearance      (js 192736 / jsx 44552) ·export
 *   Qv  → resolveCellIconSet               (js 192772 / jsx 44588) ·export
 *   $v  → resolveCellValidation            (js 192801 / jsx 44615) ·export
 *   ey  → verticalAlignToFlexAlign         (js 192814 / jsx 44627)〔中〕
 *   ty  → horizontalAlignToFlexAlign       (js 192817 / jsx 44630)〔中〕
 *   ny  → nextIndexAtLeast                 (js 192820 / jsx 44633) ·export〔中〕
 *   ry  → lastIndexAtMost                  (js 192823 / jsx 44636) ·export〔中〕
```

### 1.15 A12 行渲染层（js 192832–193216）：2 个符号

```text
 *   iy  → SpreadsheetRow                   (js 192832 / jsx 44645)
 *   ay  → MemoSpreadsheetRow               (js 193182 / jsx 44857) ·export
```

## 2. 子段结构（与 XlsxPreview.report §1/§4 对齐）

| 子段 | js 行 | 本文件分组 | 说明 |
|---|---|---|---|
| 曲面图助手（色带/几何/面板/选择） | 183064–183971 | B1/B2/B3 | XlsxPreview.report §4「地图/图表助手」子段；B5-12a 仅 declare 挂接（其报告 §3/§9 组 15–19），本批实体化 |
| 常量/剪贴板 | 189512–190101 | A1/A2/A3 | §4 子段表「常量/剪贴板」行；实测常量族止于 189582（vh），189583–190101 为缓存/文本/边框/样式解析/条件格式绘制助手 |
| 上下文 | 190102–190103 | A4 | `rg` = SpreadsheetControllerContext、`ig` = SpreadsheetHeaderThemeContext（与 XlsxPreview.report §2.1 五个自称标记口径一致的命名复用） |
| 工具栏 UI | 190104–192831 | A5–A11 | 区域/布局/形状路径/主题/样式 CSS/单元格解析/迷你图/表格样式/工具栏与页签条/选区调色板/条件格式与窗体控件解析 |
| 行渲染层 | 192832–193216 | A12 | `iy` = SpreadsheetRow（351 行单函数）+ `ay` = MemoSpreadsheetRow（memo 比较器） |

## 3. 边界裁决

### 3.1 对 XlsxDeepA（B5-12a）

| # | 裁决 | 依据 |
|---|---|---|
| 1 | 12a declare 组 15–19 的 10 个挂接对象（`bd/xd/Sd/Cd/wd/Td/Ed/Dd/Od/yd`）**全部在本批 B 段实体化并导出**；`XlsxDeepA.tsx` 314–323 行的 10 条 `declare const X: any` 可替换为对本文件的 import（替换清单 §4.1）。按纪律**未改动** XlsxDeepA.tsx。 | 消费扫描：10 符号均被 12a 区（183972–189511）消费 |
| 2 | **行号勘误**（以本批实测定义行为准）：12a declare 注释 `xd`（183900）/`Sd`（183903）/`Cd`（183906）应为 **183898 / 183901 / 183904**（函数定义首行；12a 注释所列为函数体末行附近）。另 XlsxPreview.report §4 `kd` 行位笔误已由 B5-12a 裁决（§3 条 1），本批不重复。 | 主口径实测 |
| 3 | `kd = Pn(Bu, …)` 声明在 js 183972 属 12a（本批上界 183971 = `Od` 收尾 `);`），与 12a 报告 §3/§9 一致，零重叠。 | 183971/183972 行实测 |
| 4 | 本批消费 12a 导出 2 个：`bm` = resolveGridTheme（189501）、`ym` = isDarkGridTheme（189498），以 declare 挂接（文件头 §二 组 6/7）。 | 消费扫描（仅 `w_`/`M_` 内） |

### 3.2 对 XlsxDeepB（B5-12b）

| # | 裁决 | 依据 |
|---|---|---|
| 1 | 行号互斥：本批最大行 193216（`ay` 收尾 `});`），193217 = `function oy({` 属 12b。锚点 §6.3 A10 锁定 193182（ay），逆映射 diff 覆盖至 193216 逐字节一致。 | 主口径实测 + §6.4 |
| 2 | 12b 文件头 152 个 declare 名中 **145 个属本批 A 段符号，全部为我方导出**，可替换为 import（§4.2）；**0 冲突**（12b 未消费任何本批私有符号）。 | 全量 declare 抽取 × 导出表比对 |
| 3 | **12b declare 语义标签勘误**（其注释为推测，多处与函数体不符；替换时以本批语义名为准）：`dv`（191739）12b 注「合并区域解析」，实测为 `toPlainRecord`（对象守卫，`fv` 解析 hyperlink 前置）；`Sh`（189599）12b 注「文本度量」，实测为 `drawTextDecorations`；`Ch`（189622）12b 注「字体族归一」，实测为 `getPath2dCached`；`Mg`（190301）12b 注「像素→行列索引」，实测为 `drawingRectPx`（委托 `jg`）；`Lg`（190343）12b 注「编辑框几何」，实测为 `resolveScrollRegionKind`。 | 各函数体实测（§6.3 方法同） |
| 4 | 本批导出但 12b 未 declare 的 16 个符号：10 个 B 段图表选择助手（消费方为 12a 区，§3.1 条 1）+ `ag/ig/jv/rg/Tv/w_` 6 个——消费点在 **js 199325–199407**，属未分配尾段 199292–199508（`sy` = 顶层 SpreadsheetView 组件，12b 止于 199291），留待后续批次。 | 消费扫描 + 尾段实测 |

### 3.3 export 判据与链式过导出

- 判据：符号在 **本批两段之外** 的第一方区（9111–199508：12a 区 15672–189511、12b 区 193217–199291、前导 9111–15671、尾段 199292–199508）存在真实消费 → `export`；否则段内私有。扫描时排除属性访问（`.` 前缀）、对象键（`id:`/`ry:` 等）、字符串/模板/正则字面量内的伪命中（`` `td` ``/`` `gd` ``/`rounded-md`/`bg-*`/TopoJSON `id:` 等），并对 `...` 展开语法单独放行。
- 结果：**161 export / 136 私有**。
- **链式过导出**（语法约束，非语义）：`export var` 链首导出即全链导出。`xm` 常量链（52 名）中有 16 名按判据为私有（`Hm Zm Qm $m rh oh sh ch lh uh ph mh hh gh _h vh`），`rg/ig` 链中 `ig` 随 `rg` 语句导出——共 17 名过导出，系 `export var` 链语法不可分割所致，逆映射时整链还原，不影响逐字性。物理 `export ` 前缀共 125 处（对应 161 个导出名）。

### 3.4 外部依赖裁决

- `nc`（js 14191，`e / ja` EMU→px）：前导段 9111–15671 **尚无任何批次认领**（12a 覆盖自 15672 起），本批以 `declare const nc: any` 挂接并注记语义名 `emuToPx`（待前导段批次认领后替换）。
- `xa`（12082）/`Ca`（12105）：同属未认领前导段，沿用 12a §二 组 23/24 的挂接口径与语义名。
- `Rn`（模块头 9111–9130）：regl 互操作，仅 `yd` SurfaceChartPanel 消费（WebGL 曲面绘制）。

## 4. declare 替换清单（本批实体化后，供后续整合批次执行；本批不改他文件）

### 4.1 XlsxDeepA.tsx（314–323 行，10 条）

| 原 declare | 替换为（自 XlsxDeepC 导入） |
|---|---|

| `declare const bd: any` | `chartSeriesDataAttrs` |
| `declare const xd: any` | `chartSeriesFirstDataAttrs` |
| `declare const Sd: any` | `closestChartSeriesElement` |
| `declare const Cd: any` | `resolveChartElementTarget` |
| `declare const wd: any` | `isChartSeriesSelected` |
| `declare const Td: any` | `isChartPointSelected` |
| `declare const Ed: any` | `isChartElementSelected` |
| `declare const Dd: any` | `renderRectSelectionHandles` |
| `declare const Od: any` | `renderSelectionHandles` |
| `declare const yd: any` | `SurfaceChartPanel` |

### 4.2 XlsxDeepB.tsx（145 条；混淆 declare 名 → 本批导出语义名）

```text

xm → DEFAULT_ROW_HEIGHT; Sm → DEFAULT_COL_WIDTH; Cm → HEADER_ROW_HEIGHT; wm → ROW_HEADER_WIDTH;
Tm → RANGE_CLIPBOARD_MIME; Em → MIN_RENDERED_ROWS; Dm → MIN_RENDERED_COLS; Om → ROW_BATCH_SIZE;
km → COL_BATCH_SIZE; Am → MAX_RENDERED_ROWS; jm → MAX_RENDERED_COLS; Mm → ROW_CAPACITY_STEP;
Nm → COL_CAPACITY_STEP; Pm → ROW_PREFETCH_THRESHOLD; Fm → COL_PREFETCH_THRESHOLD; Im → ROW_SCROLL_GROWTH_STEP;
Lm → COL_SCROLL_GROWTH_STEP; Rm → ROW_SCROLL_PREFETCH_PX; zm → COL_SCROLL_PREFETCH_PX; Bm → POINTER_MOVE_TOLERANCE_PX;
Vm → SCROLLBAR_PLACEHOLDER_PX; Um → FROZEN_DIVIDER_HIT_TOLERANCE_PX; Wm → CONTENT_LAYER_MAX_PX; Gm → VIEWPORT_OVERDRAW_MAX_PX;
Km → SCROLL_SYNC_INVALIDATE_PX; qm → SCROLL_JUMP_THRESHOLD_PX; Jm → CONTENT_CULL_MARGIN_PX; Ym → GESTURE_ZOOM_SETTLE_MS;
Xm → WHEEL_ZOOM_FACTOR; eh → DEFAULT_EDITOR_BACKGROUND; th → MUTED_SLATE_COLOR; nh → LIGHT_CANVAS_SURFACE;
ih → CELL_PADDING; ah → RESIZE_HANDLE_DIRECTIONS; dh → EMPTY_VIRTUAL_ITEMS; fh → RESIZE_CURSOR_BY_DIRECTION;
ay → MemoSpreadsheetRow; xh → measureTextWidthCached; Sh → drawTextDecorations; Th → scaleStyleValues;
wh → scaleCssLengths; Ch → getPath2dCached; Oh → resolveTextRotationDeg; Ah → fontShorthandAtSize;
jh → parseBorderShorthand; Nh → pickStrongerBorder; kh → resolveFontShorthand; Lh → resolveFontSizePx;
Rh → resolveLineHeightPx; zh → resolveTextBaselineY; Vh → wrapTextToWidth; Gh → createGradientFill;
Hh → resolveCellStyleInfo; Fh → drawCellBorder; Ih → truncateTextToWidth; Kh → createDataBarFill;
qh → drawConditionalIconGlyph; Zh → clampPointToRect; Qh → pointerDistance; Xh → normalizeWheelDelta;
Yh → clampToBounds; sg → resolveHeaderSurfaceColor; cg → normalizeRangeBounds; lg → parseCellKey;
ug → isSameCell; dg → cellInRange; fg → chartHighlightForCell; pg → rangesEqual;
mg → isPrintableCharKey; hg → closestInteractiveElement; gg → isFocusWithinContainer; _g → buildPrefixSums;
yg → expandIndicesAcrossMerges; bg → rangesFingerprint; xg → rangeBoundsKey; Sg → prefixSpanBetween;
Cg → offsetsByIndices; wg → findSegmentIndexAt; Tg → clampScrollOffset; Eg → minContentExtent;
Dg → collectRenderIndices; Og → resolveRenderCapacity; jg → resolveAnchorRectPx; Mg → drawingRectPx;
Ng → imageAnchorMaxCell; Pg → shapeAnchorMaxCell; Fg → chartAnchorMaxCell; Ig → rectsIntersectWithMargin;
Lg → resolveScrollRegionKind; Rg → shapeContainerStyle; __ → resolveShapeSvgPath; v_ → traceRoundedRectPath;
y_ → applyDashPattern; b_ → renderArrowMarkerDef; x_ → renderTextParagraphRuns; S_ → clampRectToGrid;
C_ → resizeHandleStyle; T_ → columnIndexToLetters; O_ → resolveGridCellStyle; k_ → parseExternalCellRef;
M_ → isDarkTheme; L_ → resolveContrastTextColor; W_ → gridInsetShadow; G_ → resolveCellStyleCss;
X_ → estimateCellContentHeight; Y_ → measureCellTextWidth; Z_ → canOverflowRight; Q_ → isRenderableEmptyCell;
q_ → verticalPaddingPx; $_ → resolveCellDisplayText; ev → numericValueAtCell; tv → booleanValueAtCell;
sv → chartSelectionRanges; cv → sparklineValueScale; bv → tableColumnAtHeader; yv → resolveTableCellStyle;
_v → mergeCellStyles; gv → findRangeContaining; hv → buildCellBatchMap; dv → toPlainRecord;
uv → toNonNegativeInteger; Sv → headerFilterButtonStyle; xv → SortDirectionMenu; Av → renderFileSizeLimitState;
Dv → resolveLoadingNode; Ev → resolveErrorNode; Ov → resolveEmptyNode; Nv → resolveChartLoadingNode;
Fv → DeferredLoadPrompt; Iv → resolveSelectionPalette; Lv → fullBleedRects; Rv → rectIntersectsAnyRect;
zv → blitScrolledCanvas; Wv → isCheckboxChecked; Gv → isCheckboxMixed; Kv → normalizeFormControlModel;
qv → renderCheckboxIcon; Jv → renderRadioIcon; Yv → cleanFormControlCaption; Xv → resolveDataBarAppearance;
Zv → resolveColorScaleAppearance; Qv → resolveCellIconSet; $v → resolveCellValidation; ny → nextIndexAtLeast;
ry → lastIndexAtMost;
```

## 5. 类型标注清单（全部可机械剥离；原文不含字面 `any`，剥离后逐字节还原）

剥离规则（按序）：① 3 处定点字面量修复（`as any` 断言还原括号形态，见下）；② 去 `: any[]` / `?: any` / `: any` / ` as any`；③ 去 `export ` 前缀；④ 语义名→混淆名逆映射（词界、长名优先）。

| 类别 | 数量 | 说明 |
|---|---:|---|
| 顶层函数参数 `: any`（含 `e: any = 默认值`、解构 `}: any`、rest） | 全部顶层函数 | 与 12a/12b 同口径 |
| 箭头回调参数 `: any`（按 tsc strict 报错坐标机械注入） | 见产物 | TS7006/TS7031 坐标注入 |
| 局部变量 `: any` / `: any[]`（TS7034/TS7005/TS2339 定点） | 见产物 | 如 `u/d/f/z/ae/se/ce/c` 数组、`o`/`k` 可变样式对象、`r/i` Set 等 |
| `as any` 对象字面量索引断言 | 3 处 | 产物 1516（`borderStyleRank`）、3021（`borderToCssShorthand` 双字面量同行）行；`(({…}) as any)[key]` 形态，逆映射还原为原 `{…}[key]`（含 1 对新增括号） |
| 可选形参 `?: any` | 2 处 | `gridInsetShadow`（3128 行，原始调用存在 1 参形式）、`mergeCellStyles`（3581 行，存在 2 参形式）——建模 JS 少参调用，不改分支 |

完整逐行清单：产物行号级审计共 **100 处标注行 + 4 处结构差异行**（2 行 `as any` 断言：
1516/3021，其中 3021 行含双字面量 2 处断言；2 行可选形参：3128/3581），另有 1 行 B/A 段间
空行分隔（不属 4,613 代码行）；其余 **4,509 行**与主口径逐字节一致（§6.4）。

## 6. 验证记录

### 6.1 门禁 1：esbuild（0 错）

```
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/XlsxDeepC.tsx \
  --loader:.tsx=tsx --jsx=preserve
→ exit 0（139.3kb，0 errors）
```

### 6.2 门禁 2：tsc strict（0 错）

`/tmp/tsconfig.XlsxDeepC.json`：`strict`、`target ES2022`、`jsx preserve`、`moduleResolution Bundler`、
`typeRoots → web/node_modules/@types`、include 仅 `XlsxDeepC.tsx`。

```
web/node_modules/.bin/tsc -p /tmp/tsconfig.XlsxDeepC.json
→ exit 0，0 errors
```

（收敛过程：首轮 223 错 → 按报错坐标机械注入 `: any`（TS7006/TS7031）+ 定点标注
（TS7034/TS7005/TS2339/TS7053/TS18046/TS2322/TS2554）→ 0 错。其中 5 处 TS7005 反向定位
误标阴影变量（`c/d/u/a` 的循环/块内阴影声明），已逐一撤销改回原形并复验。）

### 6.3 门禁 3：锚点回代（10/10 命中，≥8 达标）

方法：产物行经逆映射（§5 剥离规则）回代后与主口径对应行逐字比对；`unique` = 该行在主口径全文出现次数。

| # | js 行 | 产物行 | 回代结果（= 主口径原文，逐字） | unique |
|---|---:|---:|---|---:|
| A1 | 183064 | 393 | `function Vu(e, t, n) {` | 1 |
| A2 | 183672 | 1001 | `var yd = G.memo(` | 1 |
| A3 | 183947 | 1276 | `` function Od(e, t, n = `#64748b`) { `` | 1 |
| A4 | 189512 | 1302 | `var xm = 24,` | 1 |
| A5 | 189516 | 1306 | `` Tm = `application/x-react-xlsx-range+json`, `` | 1 |
| A6 | 189543 | 1333 | `` Qm = [`#2563eb`, `#dc2626`, `#7c3aed`, `#059669`, `#ea580c`, `#db2777`], `` | 1 |
| A7 | 190102 | 1892 | `var rg = G.createContext(null),` | 1 |
| A8 | 191850 | 3640 | `function xv({ direction: e, sortAscending: t, sortDescending: n }) {` | 1 |
| A9 | 192832 | 4622 | `function iy({` | 1 |
| A10 | 193182 | 4972 | `var ay = G.memo(iy, (e, t) => {` | 1 |

### 6.4 超门禁验证：全量逆映射回代 diff（逐字节）

对产物全部 4,613 行代码执行 §5 逆映射，与主口径逐行 diff：

| 段 | 行范围 | 行数 | 逐字节一致 | 失配 |
|---|---|---:|---:|---:|
| B | 183064–183971 | 908 | 908 | 0 |
| A | 189512–193216 | 3,705 | 3,705 | 0 |
| 合计 | — | 4,613 | 4,613 | **0** |

物理剥离 `export ` 前缀 125 处；3 处断言行与 2 处可选形参行按定点规则还原；无其他差异。

### 6.5 md5 抽验（out/ 只读纪律）

```
md5 desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
→ 4193214026dc469cb45056f49795e25e   （开工基线一致，完工复验未变）
```

### 6.6 门禁 4：报告完整

本文件含：覆盖清单（§1）、子段结构（§2）、边界裁决（§3）、declare 替换清单（§4）、
类型标注清单（§5）、验证记录（§6）、把握度分级（§7）、符号表（§8）、遗留问题（§9）。

## 7. 把握度分级

- **逐字转录层（高）**：字符串常量（模板字面量/类名/数据属性名/样式键/日志文案）、分支结构、
  数值常量、JSX 编译形态 `(0, K.jsx)(…)` —— 4,613/4,613 行逆映射逐字节一致（§6.4），机械可证。
- **语义命名层**：
  - **高**（字面量/API/结构直接证据）：常量族 52 名（数值自证）、上下文 2 名（`createContext`/
    `Provider` 形态）、形状路径 32 名（OOXML preset geometry switch 分支名）、组件名
    （`SortDirectionMenu`/`WorkbookSheetTabStrip`/`SpreadsheetToolbar`/`SpreadsheetRow`/
    `MemoSpreadsheetRow`/`DeferredLoadPrompt`/`SurfaceChartPanel`）、颜色/几何助手（`clampValue`/
    `parseNumericInput`/`projectSurfacePoint3d`/`triangleSurfaceNormal` 等，函数体自证）。
  - **中**〔中〕（调用上下文与行为推断，共 102 名）：映射表中标注者，如 `resolve*`/`parse*` 族中
    无字面量自证者；不影响逐字性，仅供后续整合时参考。
- **外部依赖语义名**：`bm/ym/xa/Ca` 沿用 12a 在案口径；`nc` 语义名 `emuToPx` 为本批新拟（函数体
  `e / ja` 自证，中等以上把握度）。

## 8. 符号表（摘要；全表见产物文件尾注释与 §1）

- B 段 42 符号：色带/几何助手 32（`Vu…vd`）+ 面板 1（`yd`）+ 选择助手 9（`bd…Od`）
- A 段 255 符号：常量族 52（`xm…vh`）+ 缓存/文本/边框 23（`yh…Vh`）+ 样式/条件格式绘制 15
  （`Hh…ng`）+ 上下文 2（`rg/ig`）+ 区域/布局/锚点 33（`ag…Lg`）+ 形状路径 33（`Rg…g_`）+
  形状 SVG/主题/样式 CSS 30（`__…K_`）+ 单元格显示/区域解析 15（`q_…sv`）+ 迷你图/单元格批/
  表格样式 13（`cv…bv`）+ 工具栏/页签条 15（`xv…Fv`）+ 选区/blit/条件格式/窗体控件 22
  （`Iv…ry`）+ 行渲染层 2（`iy/ay`）
- 导出 161 / 私有 136；物理 `export ` 前缀 125 处（链式过导出 17 名，§3.3）。

## 9. 遗留问题

1. **`nc`/`xa`/`Ca` 归属**：前导段 9111–15671 尚无批次认领；三符号目前以 declare 挂接（语义名
   在案：`emuToPx`/`resolveFontColor`/`resolveFillColor`），待前导段批次产出后替换。
2. **尾段 199292–199508 未分配**：`sy`（顶层 SpreadsheetView）等消费本批 6 个导出
   （`ag/ig/jv/rg/Tv/w_`），留待后续批次；本批已按真实消费导出。
3. **12a/12b 的 declare 替换未执行**（纪律：不改既有文件）：清单见 §4（12a 10 条 + 12b 145 条），
   由后续整合批次统一落地；12b 侧 5 处语义标签勘误见 §3.2 条 3。
4. **链式过导出 17 名**（§3.3）：`export var` 链语法约束，保持现状；若后续要求精确导出面，
   需拆链（将改变主口径语句结构，超出逐字口径，暂不执行）。
5. **`SurfaceChartPanel` 运行时依赖**：`Rn`（regl）为 WebGL 互操作，tsc 以 `any` 挂接；
   实际渲染行为验证需运行时环境，不在本批静态门禁范围。
