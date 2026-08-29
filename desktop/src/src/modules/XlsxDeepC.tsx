/* eslint-disable */
/**
 * ============================================================================
 * XlsxDeepC.tsx — react-xlsx 私有引擎深部（中）：曲面图助手子段 +
 * 常量族 / 上下文 / 工具栏 UI / 行渲染层
 * （B5-12c 批次 · 逐字重建）
 * ============================================================================
 *
 * 来源文件（主口径，199,508 行，未改动，只读；md5 基线 4193214026dc469cb45056f49795e25e）：
 *   desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
 * jsx 孪生交叉参照（同一 chunk 的 pretty-print 版，49,724 行）：
 *   desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx
 *
 * 覆盖区段（js 行号；子段划分与 XlsxPreview.report.md §1/§4 对齐）：
 *   B. 183064–183971（908 行）地图/图表助手子段：
 *      - 曲面图色带/几何助手 Vu…vd（183064–183671）
 *      - yd = SurfaceChartPanel（183672，regl WebGL 曲面渲染，Rn 互操作）
 *      - 图表选择助手 bd…Od（183890–183971）——B5-12a 仅以 declare 挂接（其报告
 *        §3/§9 组 15–19），本批实体化；替换清单见 XlsxDeepC.report.md §4。
 *   A. 189512–193216（3,705 行）：
 *      - 常量族 xm var 链（189512–189582，52 名）+ 缓存/文本测量/边框/样式解析/
 *        条件格式绘制助手（189583–190101）
 *      - 上下文 rg/ig（190102–190103）
 *      - 区域/布局/形状路径/主题/样式 CSS/单元格解析/迷你图/表格样式/工具栏与
 *        页签条 UI/选区调色板/条件格式与窗体控件解析（190104–192831）
 *      - 行渲染层 iy = SpreadsheetRow + ay = MemoSpreadsheetRow（192832–193216）
 * 排除（边界互斥，仅注记）：
 *   - js 183972–189511 属 B5-12a（XlsxDeepA.tsx）；js 193217 起 function oy 属
 *     B5-12b（XlsxDeepB.tsx）。本文件终止于 193216（ay 收尾 `});`）。
 *
 * 重建口径（与 XlsxDeepA/B 一致）：
 *   - 逐字转录（把握度高）：字符串常量（含全部模板字面量/类名/数据属性名/样式键）、
 *     分支结构、数值常量、JSX 调用形态零改动。JSX 保留原始编译形态
 *     `(0, K.jsx)(...)` / `(0, K.jsxs)(...)`（jsx 孪生糖语法仅作交叉参照）。
 *   - 顶层符号全部改语义名（下表，297 名）；函数体内局部变量名保留原混淆名不改，
 *     以保证逐字可回代。把握度分级：未标注 = 语义名有字面量/API/结构直接证据；
 *     〔中〕 = 语义名由调用上下文与行为推断（完整分级见报告 §6）。
 *   - 类型标注（可机械剥离，原文件不含字面 `any`）：顶层函数参数标 `: any`；
 *     箭头回调参数按 tsc strict 报错坐标机械注入 `: any`；对象字面量索引以
 *     `as any` 断言（3 处：borderStyleRank / borderToCssShorthand×2）；
 *     可变样式对象局部变量标 `: any`；可选形参 `?: any`（2 处：
 *     gridInsetShadow / mergeCellStyles，对应原始调用存在少参形式）。
 *   - 外部依赖一律 `declare const X: any` 挂接（行号在案，见 §二）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：主口径 js 行 / jsx 孪生行；
 *     ·export = 跨段消费导出，判据见报告 §3；〔中〕 = 语义名中等把握度）
 * ----------------------------------------------------------------------------
 *  [B1] 曲面图色带/几何助手（js 183064–183671 / jsx 37565–38097）：
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
 *  [B2] 曲面图面板（js 183672–183889 / jsx 38098–38287）：
 *   yd  → SurfaceChartPanel                (js 183672 / jsx 38098) ·export
 *  [B3] 图表选择助手（js 183890–183971 / jsx 38288–38364；B5-12a declare 挂接对象，本批实体化）：
 *   bd  → chartSeriesDataAttrs             (js 183890 / jsx 38288) ·export
 *   xd  → chartSeriesFirstDataAttrs        (js 183898 / jsx 38299) ·export
 *   Sd  → closestChartSeriesElement        (js 183901 / jsx 38304) ·export
 *   Cd  → resolveChartElementTarget        (js 183904 / jsx 38307) ·export
 *   wd  → isChartSeriesSelected            (js 183926 / jsx 38336) ·export
 *   Td  → isChartPointSelected             (js 183929 / jsx 38339) ·export
 *   Ed  → isChartElementSelected           (js 183932 / jsx 38342) ·export
 *   Dd  → renderRectSelectionHandles       (js 183935 / jsx 38345) ·export
 *   Od  → renderSelectionHandles           (js 183947 / jsx 38360) ·export
 *  [A1] 常量族 var 链（js 189512–189582 / jsx 41541–41607；链首 export，52 名全链导出）：
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
 *  [A2] 缓存/文本测量/边框解析（js 189583–189873 / jsx 41608–41885）：
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
 *  [A3] 单元格样式解析与条件格式绘制（js 189874–190101 / jsx 41886–42042）：
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
 *  [A4] 上下文（js 190102–190103 / jsx 42043–42044）：
 *   rg  → SpreadsheetControllerContext     (js 190102 / jsx 42043) ·export
 *   ig  → SpreadsheetHeaderThemeContext    (js 190103 / jsx 42044) ·export
 *  [A5] 区域/布局/锚点助手（js 190104–190359 / jsx 42047–42302）：
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
 *  [A6] 形状容器与预置几何路径（js 190360–191050 / jsx 42303–43141）：
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
 *  [A7] 形状 SVG/文本 run/主题与单元格样式 CSS（js 191051–191415 / jsx 43142–43438）：
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
 *  [A8] 文本测量与单元格显示/区域解析（js 191416–191617 / jsx 43439–43639）：
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
 *  [A9] 迷你图/单元格批/表格样式（js 191618–191849 / jsx 43640–43837）：
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
 *  [A10] 工具栏与页签条 UI（js 191850–192335 / jsx 43838–44186）：
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
 *  [A11] 选区调色板/canvas blit/条件格式与窗体控件解析（js 192336–192831 / jsx 44187–44644）：
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
 *  [A12] 行渲染层（js 192832–193216 / jsx 44645–44861）：
 *   iy  → SpreadsheetRow                   (js 192832 / jsx 44645)
 *   ay  → MemoSpreadsheetRow               (js 193182 / jsx 44857) ·export
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨段/跨 chunk；括号内 = 定义处 js 行号；
 *     均不属本批 A+B 行号范围。A0-S2b：1/2/3/4/5/8 已接线为真实 import）
 * ----------------------------------------------------------------------------
 *  chunk 导入（模块头 9111–9130）：
 *   1. G  = React interop（__commonJS 包装，9112）〔已接线 → reactInterop @ ./XlsxDeepP〕
 *   2. K  = jsx-runtime（9113）〔已接线 → jsxRuntime @ ./XlsxDeepP〕
 *   3. Rn = regl 互操作（模块头 9111–9130；仅 yd SurfaceChartPanel 消费，
 *           WebGL 曲面绘制上下文/缓冲区/程序工厂）〔已接线 → reglInterop @ ./XlsxDeepP〕
 *  同 chunk 跨段（解析/几何段 9132–12130，未属任何已重建批次）：
 *   4. xa = resolveFontColor（12082）〔已接线 → resolveFontColor @ ./XlsxDeepP〕
 *   5. Ca = resolveFillColor（12105）〔已接线 → resolveFillColor @ ./XlsxDeepP〕
 *  同 chunk 跨段（B5-12a 导出，实体已在 XlsxDeepA.tsx）：
 *   6. bm = resolveGridTheme（189501） | 7. ym = isDarkGridTheme（189498）
 *      〔保留 declare：实体在 XlsxDeepA，接线将成 A↔C 环；A0-S2b 任务清单未列〕
 *  同 chunk 未解码前导段（9111–15671，尚无任何批次认领）：
 *   8. nc = emuToPx（14191，`e / ja` EMU→px 换算；本批 jg/O_ 等消费）
 *      〔已接线 → emuToPx @ ./XlsxDeepP〕
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 外部依赖挂接（行号在案，见上 §二；深层模型为私有引擎内部结构，类型从宽）
// A0-S2b 已接线：1/2/3/4/5/8 项改真实 import（./XlsxDeepP 导出）；6/7 保留 declare
// ----------------------------------------------------------------------------

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/xlsx/XlsxDeepC.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  SurfaceChartPanel,
  chartSeriesDataAttrs,
  chartSeriesFirstDataAttrs,
  closestChartSeriesElement,
  resolveChartElementTarget,
  isChartSeriesSelected,
  isChartPointSelected,
  isChartElementSelected,
  renderRectSelectionHandles,
  renderSelectionHandles,
  DEFAULT_ROW_HEIGHT,
  DEFAULT_COL_WIDTH,
  HEADER_ROW_HEIGHT,
  ROW_HEADER_WIDTH,
  RANGE_CLIPBOARD_MIME,
  MIN_RENDERED_ROWS,
  MIN_RENDERED_COLS,
  ROW_BATCH_SIZE,
  COL_BATCH_SIZE,
  MAX_RENDERED_ROWS,
  MAX_RENDERED_COLS,
  ROW_CAPACITY_STEP,
  COL_CAPACITY_STEP,
  ROW_PREFETCH_THRESHOLD,
  COL_PREFETCH_THRESHOLD,
  ROW_SCROLL_GROWTH_STEP,
  COL_SCROLL_GROWTH_STEP,
  ROW_SCROLL_PREFETCH_PX,
  COL_SCROLL_PREFETCH_PX,
  POINTER_MOVE_TOLERANCE_PX,
  SCROLLBAR_PLACEHOLDER_PX,
  RESIZE_HANDLE_SIZE_PX,
  FROZEN_DIVIDER_HIT_TOLERANCE_PX,
  CONTENT_LAYER_MAX_PX,
  VIEWPORT_OVERDRAW_MAX_PX,
  SCROLL_SYNC_INVALIDATE_PX,
  SCROLL_JUMP_THRESHOLD_PX,
  CONTENT_CULL_MARGIN_PX,
  GESTURE_ZOOM_SETTLE_MS,
  WHEEL_ZOOM_FACTOR,
  WHEEL_LINE_DELTA_PX,
  CHART_HIGHLIGHT_PALETTE,
  CHART_HIGHLIGHT_ROLE_COLORS,
  DEFAULT_EDITOR_BACKGROUND,
  MUTED_SLATE_COLOR,
  LIGHT_CANVAS_SURFACE,
  HANDLE_SHADOW_COLOR,
  CELL_PADDING,
  RESIZE_HANDLE_DIRECTIONS,
  STYLE_INFO_CACHE_CAPACITY,
  TEXT_WIDTH_CACHE_CAPACITY,
  TRUNCATE_CACHE_CAPACITY,
  WRAP_CACHE_CAPACITY,
  PATH2D_CACHE_CAPACITY,
  EMPTY_VIRTUAL_ITEMS,
  RESIZE_CURSOR_BY_DIRECTION,
  CSS_LENGTH_PROPERTIES,
  STYLE_INFO_CACHE,
  TEXT_WIDTH_CACHE,
  TRUNCATE_CACHE,
  WRAP_CACHE,
  PATH2D_CACHE,
  measureTextWidthCached,
  drawTextDecorations,
  getPath2dCached,
  scaleCssLengths,
  scaleStyleValues,
  resolveTextRotationDeg,
  resolveFontShorthand,
  fontShorthandAtSize,
  parseBorderShorthand,
  pickStrongerBorder,
  drawCellBorder,
  truncateTextToWidth,
  resolveFontSizePx,
  resolveLineHeightPx,
  resolveTextBaselineY,
  wrapTextToWidth,
  resolveCellStyleInfo,
  createGradientFill,
  createDataBarFill,
  drawConditionalIconGlyph,
  clampToBounds,
  normalizeWheelDelta,
  clampPointToRect,
  pointerDistance,
  SpreadsheetControllerContext,
  SpreadsheetHeaderThemeContext,
  joinClassNames,
  resolveHeaderSurfaceColor,
  normalizeRangeBounds,
  parseCellKey,
  isSameCell,
  cellInRange,
  chartHighlightForCell,
  rangesEqual,
  isPrintableCharKey,
  closestInteractiveElement,
  isFocusWithinContainer,
  buildPrefixSums,
  expandIndicesAcrossMerges,
  rangesFingerprint,
  rangeBoundsKey,
  prefixSpanBetween,
  offsetsByIndices,
  findSegmentIndexAt,
  clampScrollOffset,
  minContentExtent,
  collectRenderIndices,
  resolveRenderCapacity,
  resolveAnchorRectPx,
  drawingRectPx,
  imageAnchorMaxCell,
  shapeAnchorMaxCell,
  chartAnchorMaxCell,
  rectsIntersectWithMargin,
  resolveScrollRegionKind,
  shapeContainerStyle,
  resolveShapeSvgPath,
  traceRoundedRectPath,
  applyDashPattern,
  renderArrowMarkerDef,
  renderTextParagraphRuns,
  clampRectToGrid,
  resizeHandleStyle,
  useGridTheme,
  columnIndexToLetters,
  resolveGridCellStyle,
  parseExternalCellRef,
  isDarkTheme,
  resolveContrastTextColor,
  gridInsetShadow,
  resolveCellStyleCss,
  verticalPaddingPx,
  measureCellTextWidth,
  estimateCellContentHeight,
  canOverflowRight,
  isRenderableEmptyCell,
  resolveCellDisplayText,
  numericValueAtCell,
  booleanValueAtCell,
  chartSelectionRanges,
  sparklineValueScale,
  toNonNegativeInteger,
  toPlainRecord,
  buildCellBatchMap,
  findRangeContaining,
  mergeCellStyles,
  resolveTableCellStyle,
  tableColumnAtHeader,
  SortDirectionMenu,
  headerFilterButtonStyle,
  resolveToolbarNode,
  resolveErrorNode,
  resolveLoadingNode,
  resolveEmptyNode,
  renderFileSizeLimitState,
  resolveFileTooLargeNode,
  resolveChartLoadingNode,
  DeferredLoadPrompt,
  resolveSelectionPalette,
  fullBleedRects,
  rectIntersectsAnyRect,
  blitScrolledCanvas,
  isCheckboxChecked,
  isCheckboxMixed,
  normalizeFormControlModel,
  renderCheckboxIcon,
  renderRadioIcon,
  cleanFormControlCaption,
  resolveDataBarAppearance,
  resolveColorScaleAppearance,
  resolveCellIconSet,
  resolveCellValidation,
  nextIndexAtLeast,
  lastIndexAtMost,
  MemoSpreadsheetRow,
} from '../components/xlsx/XlsxDeepC';
