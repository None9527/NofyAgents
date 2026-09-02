// A0-S4-4c: 自 modules/XlsxDeepC.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/xlsx/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
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
import {
  reactInterop, // 原 G（9112）
  jsxRuntime, // 原 K（9113）
  reglInterop, // 原 Rn（模块头 9111–9130）
  resolveFontColor, // 原 xa（12082）
  resolveFillColor, // 原 Ca（12105）
  emuToPx, // 原 nc（14191）
} from "../../modules/XlsxDeepP";
declare const bm: any; // resolveGridTheme（189501，B5-12a 导出；实体在 XlsxDeepA.tsx，保留 declare 避免 A↔C 环，见 A0-S2b.report §遗留）
declare const ym: any; // isDarkGridTheme（189498，同上）

function clampValue(e: any, t: any, n: any) {
  return Math.max(t, Math.min(n, e));
}
function parseNumericInput(e: any) {
  if (typeof e == `number` && Number.isFinite(e)) return e;
  if (typeof e == `string`) {
    let t = e.trim().replace(/,/g, ``);
    if (!t) return null;
    let n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
function parseSurfaceHexRgb(e: any) {
  let t = /^#?([0-9a-f]{6})$/i.exec(e);
  return t
    ? {
        blue: Number.parseInt(t[1].slice(4, 6), 16),
        green: Number.parseInt(t[1].slice(2, 4), 16),
        red: Number.parseInt(t[1].slice(0, 2), 16),
      }
    : null;
}
function mixSurfaceHexColors(e: any, t: any, n: any) {
  let r = parseSurfaceHexRgb(e),
    i = parseSurfaceHexRgb(t);
  if (!r || !i) return e;
  let a = clampValue(n, 0, 1),
    o = (e: any, t: any) => Math.round(e + (t - e) * a);
  return `#${[o(r.red, i.red), o(r.green, i.green), o(r.blue, i.blue)].map((e) => e.toString(16).padStart(2, `0`)).join(``)}`;
}
function lightenSurfaceHex(e: any, t: any) {
  return mixSurfaceHexColors(e, `#ffffff`, t);
}
function darkenSurfaceHex(e: any, t: any) {
  return mixSurfaceHexColors(e, `#000000`, t);
}
function resolveChartPrimaryColor(e: any, t: any) {
  return (
    e.chartColorPalette?.[0] ??
    e.series[0]?.color ??
    e.series[0]?.lineColor ??
    e.axisLineColor ??
    e.textColor ??
    t.text
  );
}
function unwrapChartStyleId(e: any) {
  return typeof e != `number` || !Number.isFinite(e) ? null : e >= 100 ? e - 100 : e;
}
function normalizeHexColorLiteral(e: any) {
  if (typeof e != `string`) return null;
  let t = e.trim();
  if (!t) return null;
  let n = t.startsWith(`#`) ? t.slice(1) : t;
  return /^[0-9a-f]{6}$/i.test(n) ? `#${n.toLowerCase()}` : null;
}
function resolveSeriesAccentColor(e: any) {
  let t = normalizeHexColorLiteral(e.series[0]?.color ?? e.series[0]?.lineColor);
  if (!t) return null;
  let n = normalizeHexColorLiteral(e.chartColorPalette?.[0]);
  return n && n === t ? null : t;
}
function surfaceStyleTintRamp(e: any, t: any) {
  return t <= 3
    ? [lightenSurfaceHex(e, 0.22), e, darkenSurfaceHex(e, 0.2)]
    : [lightenSurfaceHex(e, 0.3), lightenSurfaceHex(e, 0.14), e, darkenSurfaceHex(e, 0.1), darkenSurfaceHex(e, 0.22)];
}
function surfaceStyleRampFor(e: any) {
  let t = unwrapChartStyleId(e.chartStyleId),
    n = resolveSeriesAccentColor(e);
  return t === 26
    ? surfaceStyleTintRamp(n ?? `#ff006e`, 3)
    : t === 34 && n
      ? surfaceStyleTintRamp(n, 3)
      : t === 34 || (e.wireframe === !0 && t == null)
        ? [`#5b9bd5`, `#ed7d31`, `#a5a5a5`]
        : t === 35 || t === 36 || (e.wireframe !== !0 && t == null)
          ? [`#2f5597`, `#4472c4`, `#5b9bd5`, `#8faadc`, `#d9e2f3`]
          : null;
}
function isSurfaceStyleApplied(e: any) {
  let t = unwrapChartStyleId(e.chartStyleId),
    n =
      e.raw && typeof e.raw == `object` && typeof e.raw.xmlChartType == `string`
        ? String(e.raw.xmlChartType)
        : ``;
  return (
    (n === `surfaceChart` || n === `surface3DChart`) &&
    (t === 26 || t === 34 || t === 35 || t === 36)
  );
}
function resolveSurfaceBandTotal(e: any) {
  let t = e.raw && typeof e.raw == `object` ? e.raw : null,
    n =
      typeof t?.bandFormatCount == `number` && Number.isFinite(t.bandFormatCount)
        ? t.bandFormatCount
        : null;
  if (n != null && n > 0 && !(isFlatSurfaceChart(e) && e.wireframe !== !0)) return n;
  let r = surfaceStyleRampFor(e);
  return isSurfaceStyleApplied(e) && r && r.length > 0
    ? r.length
    : e.chartColorPalette && e.chartColorPalette.length > 1
      ? e.chartColorPalette.length
      : r && r.length > 0
        ? r.length
        : e.wireframe
          ? 3
          : 5;
}
function resolveSurfaceBandRamp(e: any, t: any) {
  let n = surfaceStyleRampFor(e);
  if (isSurfaceStyleApplied(e) && n && n.length >= 2) return n;
  let r = (e.chartColorPalette ?? []).filter((e: any) => typeof e == `string` && e.length > 0);
  if (r.length >= 2) return r;
  if (n && n.length >= 2) return n;
  let i = resolveChartPrimaryColor(e, t);
  return [darkenSurfaceHex(i, 0.42), darkenSurfaceHex(i, 0.24), i, lightenSurfaceHex(i, 0.18), lightenSurfaceHex(i, 0.34), lightenSurfaceHex(i, 0.5)];
}
function computeSurfaceValueTicks(e: any) {
  let t = e.series.flatMap((e: any) => e.values.map((e: any) => parseNumericInput(e)).filter((e: any) => e != null));
  if (t.length === 0) return null;
  let n =
      typeof e.valueAxis?.min == `number` && Number.isFinite(e.valueAxis.min)
        ? e.valueAxis.min
        : null,
    r =
      typeof e.valueAxis?.max == `number` && Number.isFinite(e.valueAxis.max)
        ? e.valueAxis.max
        : null,
    i = Math.min(...t),
    a = Math.max(...t),
    o = Math.max(1, resolveSurfaceBandTotal(e)),
    s = Math.max(1e-6, a - Math.min(0, i)) / o,
    c = 10 ** Math.floor(Math.log10(Math.max(s, 1e-6))),
    l = s / c,
    u = l <= 1 ? 1 : l <= 2 ? 2 : l <= 5 ? 5 : 10,
    d =
      typeof e.valueAxis?.majorUnit == `number` && e.valueAxis.majorUnit > 0
        ? e.valueAxis.majorUnit
        : u * c,
    f = n ?? (i >= 0 ? 0 : Math.floor(i / d) * d),
    p = r ?? Math.ceil(a / d) * d,
    m = p <= f ? f + d : p,
    h = [];
  for (let e = f; e <= m + d * 0.001; e += d) h.push(Number(e.toFixed(8)));
  return { maxValue: p, minValue: f, safeMax: m, ticks: [...new Set(h)].sort((e, t) => e - t) };
}
function surfaceBandColorForValue(e: any, t: any, n: any, r: any) {
  let i = resolveSurfaceBandRamp(e, t);
  if (i.length === 0) return resolveChartPrimaryColor(e, t);
  let a = n.ticks;
  for (let o = 0; o < a.length - 1; o += 1)
    if (r <= (a[o + 1] ?? n.safeMax) || o === a.length - 2)
      return i[Math.min(i.length - 1, Math.max(0, o))] ?? i[i.length - 1] ?? resolveChartPrimaryColor(e, t);
  return i[i.length - 1] ?? resolveChartPrimaryColor(e, t);
}
function surfaceBandColorAlias(e: any, t: any, n: any, r: any) {
  return surfaceBandColorForValue(e, t, n, r);
}
function surfaceLineColorsForChart(e: any, t: any) {
  let n = e.raw && typeof e.raw == `object` ? e.raw : null,
    r = Array.isArray(n?.bandFormatLineColors)
      ? n.bandFormatLineColors.filter((e: any) => typeof e == `string` && e.length > 0)
      : [];
  return r.length > 0 ? r : resolveSurfaceBandRamp(e, t);
}
function surfaceLineColorForValue(e: any, t: any, n: any, r: any) {
  let i = surfaceLineColorsForChart(e, t);
  if (i.length === 0) return surfaceBandColorForValue(e, t, n, r);
  let a = n.ticks;
  for (let o = 0; o < a.length - 1; o += 1)
    if (r <= (a[o + 1] ?? n.safeMax) || o === a.length - 2)
      return i[Math.min(i.length - 1, Math.max(0, o))] ?? surfaceBandColorForValue(e, t, n, r);
  return i[i.length - 1] ?? surfaceBandColorForValue(e, t, n, r);
}
function hexToRgbaTuple(e: any, t: any = 1) {
  let n = parseSurfaceHexRgb(e);
  return n ? [n.red / 255, n.green / 255, n.blue / 255, t] : [0.1, 0.1, 0.1, t];
}
function surfaceLitRgba(e: any, t: any) {
  return hexToRgbaTuple(t >= 1 ? lightenSurfaceHex(e, clampValue((t - 1) * 0.4, 0, 0.22)) : darkenSurfaceHex(e, clampValue((1 - t) * 0.5, 0, 0.28)), 1);
}
function bilinearInterpolateValue(e: any, t: any, n: any, r: any, i: any, a: any) {
  return e * (1 - i) * (1 - a) + t * i * (1 - a) + n * (1 - i) * a + r * i * a;
}
function normalizeGridU(e: any, t: any) {
  return t <= 1 ? 0 : (e / (t - 1) - 0.5) * 2;
}
function normalizeGridV(e: any, t: any) {
  return t <= 1 ? 0 : (e / (t - 1) - 0.5) * 2;
}
function surfaceValueElevation(e: any, t: any, n: any) {
  return -(((e - t.minValue) / (t.safeMax - t.minValue) - 0.5) * 1.8) * n;
}
function projectSurfacePoint3d(e: any, t: any, n: any, r: any, i: any, a: any, o: any) {
  let s = Math.cos(r),
    c = Math.sin(r),
    l = Math.cos(i),
    u = Math.sin(i),
    d = e * l + n * u,
    f = -e * u + n * l,
    p = t * s - f * c,
    m = t * c + f * s,
    h = a ? 1 / Math.max(0.18, 1 + m * (0.24 + o * 0.5)) : 1;
  return { depth: m, x: d * h, y: p * h };
}
function triangleSurfaceNormal(e: any, t: any, n: any) {
  let r = t.worldX - e.worldX,
    i = t.worldY - e.worldY,
    a = t.worldZ - e.worldZ,
    o = n.worldX - e.worldX,
    s = n.worldY - e.worldY,
    c = n.worldZ - e.worldZ,
    l = i * c - a * s,
    u = a * o - r * c,
    d = r * s - i * o,
    f = Math.hypot(l, u, d) || 1;
  return { x: l / f, y: u / f, z: d / f };
}
function withAbsoluteDepth(e: any, t: any) {
  return { ...e, depth: t };
}
function withRelativeDepth(e: any, t: any) {
  return { ...e, depth: e.depth + t };
}
function isFlatSurfaceChart(e: any) {
  let t =
    e.raw && typeof e.raw == `object` && typeof e.raw.xmlChartType == `string`
      ? e.raw.xmlChartType
      : ``;
  return t === `surfaceChart`
    ? !0
    : t === `surface3DChart`
      ? !1
      : e.chartType === `Surface` && e.is3d !== !0;
}
function buildSurfaceGeometry(e: any, t: any, n: any) {
  let r = e.series.length,
    i = e.series.reduce((e: any, t: any) => Math.max(e, t.values.length), 0);
  if (r < 2 || i < 2) return null;
  let a = e.series.map((e: any) => Array.from({ length: i }, (t, n) => parseNumericInput(e.values[n]))),
    o = computeSurfaceValueTicks(e);
  if (!o) return null;
  let s = isFlatSurfaceChart(e),
    c = e.wireframe === !0,
    l = [],
    u: any[] = [],
    d: any[] = [],
    f: any[] = [],
    p = s ? 12 : 24,
    m = clampValue(e.view3d?.rotX ?? (c ? 85 : 25), -88, 88) * (Math.PI / 180),
    h = clampValue(e.view3d?.rotY ?? (c ? 0 : 30), -88, 88) * (Math.PI / 180),
    g = !s && e.view3d?.rAngAx === !1,
    _ = clampValue((e.view3d?.perspective ?? (g ? 30 : 0)) / 100, 0, 1),
    v = s ? 1 : clampValue((e.view3d?.depthPercent ?? 100) / 100, 0.2, 4),
    y = e.surfaceMaterial === `flat`,
    b =
      e.backWall?.lineColor ??
      e.sideWall?.lineColor ??
      e.floor?.lineColor ??
      e.axisLineColor ??
      `#a6a6a6`,
    x = e.backWall?.fillColor ?? `#d9d9df`,
    S = e.sideWall?.fillColor ?? `#d5d7dc`,
    C = e.floor?.fillColor ?? `#d0d2d8`,
    w = (e: any, t: any, n: any) => {
      let a = normalizeGridU(e, i);
      if (s) return { depth: 0, worldX: a, worldY: normalizeGridV(t, r), worldZ: 0, x: a, y: normalizeGridV(t, r) };
      let c = surfaceValueElevation(n, o, v),
        l = normalizeGridV(t, r),
        u = projectSurfacePoint3d(a, c, l, m, h, g, _);
      return { depth: u.depth, worldX: a, worldY: c, worldZ: l, x: u.x, y: u.y };
    },
    T = (e: any, t: any, n: any, r: any, i: any) => {
      u.push({ color: i, points: [e, t, n] }, { color: i, points: [e, n, r] });
    },
    E = (e: any, t: any, n: any) => {
      f.push({ color: n, from: e, to: t });
    };
  for (let n = 0; n < r - 1; n += 1)
    for (let r = 0; r < i - 1; r += 1) {
      let i = a[n]?.[r],
        u = a[n]?.[r + 1],
        f = a[n + 1]?.[r],
        m = a[n + 1]?.[r + 1];
      if (i == null || u == null || f == null || m == null) continue;
      for (let a = 0; a < p; a += 1)
        for (let d = 0; d < p; d += 1) {
          let h = d / p,
            g = (d + 1) / p,
            _ = a / p,
            v = (a + 1) / p,
            y = (a: any, l: any) => {
              let d = bilinearInterpolateValue(i, u, f, m, a, l);
              return {
                bandColor: surfaceBandColorAlias(e, t, o, d),
                point: s ? withAbsoluteDepth(w(r + a, n + l, d), c ? 0.12 : 0.08) : w(r + a, n + l, d),
                value: d,
              };
            },
            b = y(h, _),
            x = y(g, _),
            S = y(g, v),
            C = y(h, v);
          if (!c) {
            let n = (b.value + x.value + S.value) / 3,
              r = (b.value + S.value + C.value) / 3;
            l.push(
              { ...b, bandColor: surfaceBandColorAlias(e, t, o, n) },
              { ...x, bandColor: surfaceBandColorAlias(e, t, o, n) },
              { ...S, bandColor: surfaceBandColorAlias(e, t, o, n) },
              { ...b, bandColor: surfaceBandColorAlias(e, t, o, r) },
              { ...S, bandColor: surfaceBandColorAlias(e, t, o, r) },
              { ...C, bandColor: surfaceBandColorAlias(e, t, o, r) },
            );
          }
        }
      let h = o.ticks.slice(1, -1);
      if (s && c) {
        let a = [
            { value: i, x: r, y: n },
            { value: u, x: r + 1, y: n },
            { value: m, x: r + 1, y: n + 1 },
            { value: f, x: r, y: n + 1 },
          ],
          s = [
            [a[0], a[1]],
            [a[1], a[2]],
            [a[2], a[3]],
            [a[3], a[0]],
          ];
        h.forEach((a) => {
          let c: any[] = [];
          (s.forEach(([e, t]) => {
            let n = t.value - e.value;
            if (n === 0 || !((e.value < a && t.value > a) || (e.value > a && t.value < a))) return;
            let r = (a - e.value) / n;
            c.push({ x: e.x + (t.x - e.x) * r, y: e.y + (t.y - e.y) * r });
          }),
            c.length === 2
              ? d.push({
                  color: darkenSurfaceHex(surfaceBandColorAlias(e, t, o, a), 0.22),
                  from: withAbsoluteDepth(w(c[0]?.x ?? r, c[0]?.y ?? n, a), 0.18),
                  to: withAbsoluteDepth(w(c[1]?.x ?? r + 1, c[1]?.y ?? n + 1, a), 0.18),
                })
              : c.length === 4 &&
                ((i + u + f + m) / 4 >= a
                  ? [
                      [0, 1],
                      [2, 3],
                    ]
                  : [
                      [0, 3],
                      [1, 2],
                    ]
                ).forEach(([n, r]) => {
                  let i = c[n] ?? c[0],
                    s = c[r] ?? c[c.length - 1];
                  !i ||
                    !s ||
                    d.push({
                      color: darkenSurfaceHex(surfaceBandColorAlias(e, t, o, a), 0.22),
                      from: withAbsoluteDepth(w(i.x, i.y, a), 0.18),
                      to: withAbsoluteDepth(w(s.x, s.y, a), 0.18),
                    });
                }));
        });
      } else if (!s) {
        let a = [
            { value: i, x: r, y: n },
            { value: u, x: r + 1, y: n },
            { value: m, x: r + 1, y: n + 1 },
            { value: f, x: r, y: n + 1 },
          ],
          s = [
            [a[0], a[1]],
            [a[1], a[2]],
            [a[2], a[3]],
            [a[3], a[0]],
          ];
        h.forEach((a) => {
          let c: any[] = [];
          (s.forEach(([e, t]) => {
            let n = t.value - e.value;
            if (n === 0 || !((e.value < a && t.value > a) || (e.value > a && t.value < a))) return;
            let r = (a - e.value) / n;
            c.push({ x: e.x + (t.x - e.x) * r, y: e.y + (t.y - e.y) * r });
          }),
            c.length === 2
              ? d.push({
                  color: darkenSurfaceHex(surfaceBandColorForValue(e, t, o, a), 0.26),
                  from: w(c[0]?.x ?? r, c[0]?.y ?? n, a),
                  to: w(c[1]?.x ?? r + 1, c[1]?.y ?? n + 1, a),
                })
              : c.length === 4 &&
                ((i + u + f + m) / 4 >= a
                  ? [
                      [0, 1],
                      [2, 3],
                    ]
                  : [
                      [0, 3],
                      [1, 2],
                    ]
                ).forEach(([n, r]) => {
                  let i = c[n] ?? c[0],
                    s = c[r] ?? c[c.length - 1];
                  !i ||
                    !s ||
                    d.push({
                      color: darkenSurfaceHex(surfaceBandColorForValue(e, t, o, a), 0.26),
                      from: w(i.x, i.y, a),
                      to: w(s.x, s.y, a),
                    });
                }));
        });
      }
    }
  let D = Math.max(1, e.categoryAxis?.tickMarkSkip ?? 1),
    O = Math.max(1, e.seriesAxis?.tickMarkSkip ?? 1);
  if (s) {
    let t = withAbsoluteDepth(w(0, 0, o.minValue), -0.12),
      n = withAbsoluteDepth(w(i - 1, 0, o.minValue), -0.12),
      a = withAbsoluteDepth(w(i - 1, r - 1, o.minValue), -0.12),
      s = withAbsoluteDepth(w(0, r - 1, o.minValue), -0.12);
    e.backWall?.hidden !== !0 && x !== `transparent` && T(t, n, a, s, x);
    for (let e = 0; e < i; e += D)
      E(withAbsoluteDepth(w(e, 0, o.minValue), 0.04), withAbsoluteDepth(w(e, r - 1, o.minValue), 0.04), b);
    for (let e = 0; e < r; e += O)
      E(withAbsoluteDepth(w(0, e, o.minValue), 0.04), withAbsoluteDepth(w(i - 1, e, o.minValue), 0.04), b);
  } else {
    let t = o.minValue,
      n = -0.2;
    (e.floor?.hidden !== !0 &&
      C !== `transparent` &&
      T(
        withRelativeDepth(w(0, 0, t), n),
        withRelativeDepth(w(i - 1, 0, t), n),
        withRelativeDepth(w(i - 1, r - 1, t), n),
        withRelativeDepth(w(0, r - 1, t), n),
        C,
      ),
      e.backWall?.hidden !== !0 &&
        x !== `transparent` &&
        T(
          withRelativeDepth(w(0, 0, o.safeMax), n),
          withRelativeDepth(w(i - 1, 0, o.safeMax), n),
          withRelativeDepth(w(i - 1, 0, t), n),
          withRelativeDepth(w(0, 0, t), n),
          x,
        ),
      e.sideWall?.hidden !== !0 &&
        S !== `transparent` &&
        T(
          withRelativeDepth(w(i - 1, 0, o.safeMax), n),
          withRelativeDepth(w(i - 1, r - 1, o.safeMax), n),
          withRelativeDepth(w(i - 1, r - 1, t), n),
          withRelativeDepth(w(i - 1, 0, t), n),
          S,
        ));
    for (let t of o.ticks)
      (e.backWall?.hidden !== !0 &&
        b !== `transparent` &&
        E(withRelativeDepth(w(0, 0, t), n * 0.75), withRelativeDepth(w(i - 1, 0, t), n * 0.75), b),
        e.sideWall?.hidden !== !0 &&
          b !== `transparent` &&
          E(withRelativeDepth(w(i - 1, 0, t), n * 0.75), withRelativeDepth(w(i - 1, r - 1, t), n * 0.75), b));
    for (let a = 0; a < i; a += D)
      (e.floor?.hidden !== !0 &&
        b !== `transparent` &&
        E(withRelativeDepth(w(a, 0, t), n * 0.75), withRelativeDepth(w(a, r - 1, t), n * 0.75), b),
        e.backWall?.hidden !== !0 &&
          b !== `transparent` &&
          E(withRelativeDepth(w(a, 0, t), n * 0.75), withRelativeDepth(w(a, 0, o.safeMax), n * 0.75), b));
    for (let a = 0; a < r; a += O)
      (e.floor?.hidden !== !0 &&
        b !== `transparent` &&
        E(withRelativeDepth(w(0, a, t), n * 0.75), withRelativeDepth(w(i - 1, a, t), n * 0.75), b),
        e.sideWall?.hidden !== !0 &&
          b !== `transparent` &&
          E(withRelativeDepth(w(i - 1, a, t), n * 0.75), withRelativeDepth(w(i - 1, a, o.safeMax), n * 0.75), b));
  }
  if (!s && c) {
    let n = (n: any, r: any, i: any, a: any, s: any, c: any, l: any) => {
      let u = (s + c) * 0.5;
      E(w(n, r, s), w(i, a, c), l || surfaceLineColorForValue(e, t, o, u));
    };
    for (let s = 0; s < r; s += 1) {
      let r: any = a[s]?.filter((e: any) => e != null) ?? [],
        c = r.length > 0 ? r.reduce((e: any, t: any) => e + t, 0) / r.length : o.minValue,
        l = e.series[s]?.lineColor ?? e.series[s]?.color ?? surfaceLineColorForValue(e, t, o, c);
      for (let e = 0; e < i - 1; e += 1) {
        let t = a[s]?.[e],
          r = a[s]?.[e + 1];
        if (!(t == null || r == null))
          for (let i = 0; i < p; i += 1) {
            let a = i / p,
              o = (i + 1) / p,
              c = e + a,
              u = e + o,
              d = t + (r - t) * a,
              f = t + (r - t) * o;
            n(c, s, u, s, d, f, l);
          }
      }
    }
    for (let s = 0; s < i; s += 1) {
      let i = Array.from({ length: r }, (e, t) => a[t]?.[s]).filter((e) => e != null),
        c = surfaceLineColorForValue(e, t, o, i.length > 0 ? i.reduce((e, t) => e + t, 0) / i.length : o.minValue);
      for (let e = 0; e < r - 1; e += 1) {
        let t = a[e]?.[s],
          r = a[e + 1]?.[s];
        if (!(t == null || r == null))
          for (let i = 0; i < p; i += 1) {
            let a = i / p,
              o = (i + 1) / p,
              l = e + a,
              u = e + o,
              d = t + (r - t) * a,
              f = t + (r - t) * o;
            n(s, l, s, u, d, f, c);
          }
      }
    }
  }
  let k = [
    ...l.map((e) => e.point),
    ...u.flatMap((e) => e.points),
    ...f.flatMap((e) => [e.from, e.to]),
    ...d.flatMap((e) => [e.from, e.to]),
  ];
  if (k.length === 0) return null;
  let A = Math.min(...k.map((e) => e.x)),
    j = Math.max(...k.map((e) => e.x)),
    M = Math.min(...k.map((e) => e.y)),
    N = Math.max(...k.map((e) => e.y)),
    P = Math.min(...k.map((e) => e.depth)),
    F = Math.max(...k.map((e) => e.depth)),
    I =
      Math.min(n.plot.width / Math.max(0.25, j - A), n.plot.height / Math.max(0.25, N - M)) * 0.82,
    ee = n.plot.left + n.plot.width / 2,
    L = n.plot.top + n.plot.height / 2,
    te = (A + j) / 2,
    ne = (M + N) / 2,
    re = (e: any) => ee + (e - te) * I,
    R = (e: any) => L + (e - ne) * I,
    ie = (e: any) => {
      let t = re(e.x),
        r = R(e.y);
      return {
        x: (t / n.width) * 2 - 1,
        y: 1 - (r / n.height) * 2,
        z: clampValue(((e.depth - P) / Math.max(1e-6, F - P)) * 2 - 1, -1, 1),
      };
    },
    z: any[] = [],
    ae: any[] = [],
    oe = [],
    B = [];
  for (let e of u) {
    let t = hexToRgbaTuple(e.color, 1);
    for (let n of e.points) {
      let e = ie(n);
      (oe.push(e.x, e.y, e.z), B.push(t[0], t[1], t[2], t[3] * 0.92));
    }
  }
  for (let e = 0; e < l.length; e += 3) {
    let t = l[e],
      n = l[e + 1],
      r = l[e + 2];
    if (!t || !n || !r) continue;
    let i = triangleSurfaceNormal(t.point, n.point, r.point),
      a = { x: -0.32, y: 0.84, z: 0.44 },
      o = i.x * a.x + i.y * a.y + i.z * a.z,
      s = y ? hexToRgbaTuple(t.bandColor, 1) : surfaceLitRgba(t.bandColor, clampValue(0.8 + o * 0.28, 0.52, 1.08));
    [t, n, r].forEach((e) => {
      let t = ie(e.point);
      (z.push(t.x, t.y, t.z), ae.push(s[0], s[1], s[2], s[3]));
    });
  }
  let se: any[] = [],
    ce: any[] = [];
  return (
    f.forEach((e) => {
      let t = ie(e.from),
        n = ie(e.to),
        r = hexToRgbaTuple(e.color, 1);
      (se.push(t.x, t.y, t.z, n.x, n.y, n.z),
        ce.push(r[0], r[1], r[2], r[3], r[0], r[1], r[2], r[3]));
    }),
    d.forEach((e) => {
      let t = ie(e.from),
        n = ie(e.to),
        r = hexToRgbaTuple(e.color, 1);
      (se.push(t.x, t.y, t.z, n.x, n.y, n.z),
        ce.push(r[0], r[1], r[2], r[3], r[0], r[1], r[2], r[3]));
    }),
    {
      fillColors: new Float32Array(ae),
      fillPositions: new Float32Array(z),
      lineColors: new Float32Array(ce),
      linePositions: new Float32Array(se),
      wallColors: new Float32Array(B),
      wallPositions: new Float32Array(oe),
    }
  );
}
export var SurfaceChartPanel = reactInterop.memo(
  function ({
    background: e,
    borderColor: t,
    chart: n,
    fontFamily: r,
    layout: i,
    onDoubleClick: a,
    onPointerDown: o,
    overlay: s,
    palette: c,
    fallback: l,
  }: any) {
    let u = reactInterop.useRef(null),
      [d, f] = reactInterop.useState(!1),
      [p, m] = reactInterop.useState(!1),
      h = isFlatSurfaceChart(n);
    reactInterop.useEffect(() => {
      if (h) {
        (f(!1), m(!1));
        return;
      }
      let e = u.current;
      if (!e) return;
      let t = !1,
        r: any = null;
      return (
        f(!1),
        m(!1),
        (() => {
          try {
            let a = buildSurfaceGeometry(n, c, i);
            if (!a) {
              t || (m(!0), f(!1));
              return;
            }
            let o = window.devicePixelRatio || 1;
            ((e.width = Math.max(1, Math.round(i.width * o))),
              (e.height = Math.max(1, Math.round(i.height * o))),
              (r = (0, reglInterop.default)({
                attributes: { alpha: !0, antialias: !0, depth: !0, premultipliedAlpha: !0 },
                canvas: e,
              })));
            let s =
                a.fillPositions.length > 0
                  ? r({
                      attributes: { color: a.fillColors, position: a.fillPositions },
                      blend: {
                        enable: !0,
                        func: {
                          dstRGB: `one minus src alpha`,
                          dstAlpha: `one minus src alpha`,
                          srcRGB: `src alpha`,
                          srcAlpha: `src alpha`,
                        },
                      },
                      count: a.fillPositions.length / 3,
                      depth: { enable: !0 },
                      frag: `
                precision mediump float;
                varying vec4 vColor;
                void main() {
                  gl_FragColor = vColor;
                }
              `,
                      primitive: `triangles`,
                      vert: `
                precision mediump float;
                attribute vec3 position;
                attribute vec4 color;
                varying vec4 vColor;
                void main() {
                  gl_Position = vec4(position, 1.0);
                  vColor = color;
                }
              `,
                    })
                  : null,
              l =
                a.wallPositions.length > 0
                  ? r({
                      attributes: { color: a.wallColors, position: a.wallPositions },
                      blend: {
                        enable: !0,
                        func: {
                          dstRGB: `one minus src alpha`,
                          dstAlpha: `one minus src alpha`,
                          srcRGB: `src alpha`,
                          srcAlpha: `src alpha`,
                        },
                      },
                      count: a.wallPositions.length / 3,
                      depth: { enable: !1 },
                      frag: `
                precision mediump float;
                varying vec4 vColor;
                void main() {
                  gl_FragColor = vColor;
                }
              `,
                      primitive: `triangles`,
                      vert: `
                precision mediump float;
                attribute vec3 position;
                attribute vec4 color;
                varying vec4 vColor;
                void main() {
                  gl_Position = vec4(position, 1.0);
                  vColor = color;
                }
              `,
                    })
                  : null,
              u =
                a.linePositions.length > 0
                  ? r({
                      attributes: { color: a.lineColors, position: a.linePositions },
                      blend: {
                        enable: !0,
                        func: {
                          dstRGB: `one minus src alpha`,
                          dstAlpha: `one minus src alpha`,
                          srcRGB: `src alpha`,
                          srcAlpha: `src alpha`,
                        },
                      },
                      count: a.linePositions.length / 3,
                      depth: { enable: !1 },
                      frag: `
                precision mediump float;
                varying vec4 vColor;
                void main() {
                  gl_FragColor = vColor;
                }
              `,
                      lineWidth: 1,
                      primitive: `lines`,
                      vert: `
                precision mediump float;
                attribute vec3 position;
                attribute vec4 color;
                varying vec4 vColor;
                void main() {
                  gl_Position = vec4(position, 1.0);
                  vColor = color;
                }
              `,
                    })
                  : null;
            (r.clear({ color: [0, 0, 0, 0], depth: 1 }), l?.(), s?.(), u?.(), t || (f(!0), m(!1)));
          } catch {
            t || (f(!1), m(!0));
          }
        })(),
        () => {
          ((t = !0), r?.destroy());
        }
      );
    }, [n, h, i, c]);
    let g = h || p || !d;
    return (0, jsxRuntime.jsxs)(`div`, {
      "aria-label": n.title ?? n.name ?? `Chart`,
      role: `img`,
      style: {
        background: e,
        border: t.trim().toLowerCase() === `transparent` ? `none` : `1px solid ${t}`,
        boxSizing: `border-box`,
        fontFamily: r,
        height: `100%`,
        overflow: `hidden`,
        pointerEvents: `auto`,
        position: `relative`,
        width: `100%`,
      },
      children: [
        (0, jsxRuntime.jsx)(`canvas`, {
          ref: u,
          style: {
            display: g ? `none` : `block`,
            height: `100%`,
            inset: 0,
            position: `absolute`,
            width: `100%`,
          },
        }),
        (0, jsxRuntime.jsxs)(`svg`, {
          onDoubleClick: a,
          onPointerDown: o,
          style: {
            display: `block`,
            height: `100%`,
            inset: 0,
            position: `absolute`,
            width: `100%`,
          },
          viewBox: `0 0 ${i.width} ${i.height}`,
          children: [g ? l : null, s],
        }),
      ],
    });
  },
  (e: any, t: any) =>
    e.chart === t.chart &&
    e.palette === t.palette &&
    e.background === t.background &&
    e.borderColor === t.borderColor &&
    e.fontFamily === t.fontFamily &&
    e.onDoubleClick === t.onDoubleClick &&
    e.onPointerDown === t.onPointerDown &&
    e.layout.width === t.layout.width &&
    e.layout.height === t.layout.height &&
    e.layout.plot.left === t.layout.plot.left &&
    e.layout.plot.top === t.layout.plot.top &&
    e.layout.plot.width === t.layout.plot.width &&
    e.layout.plot.height === t.layout.plot.height &&
    e.overlay === t.overlay &&
    e.fallback === t.fallback,
);
// A0-S2b：t/n 改可选（类型唯一，发射不变）——原 bundle 调用点即 1–3 参（XlsxDeepA 728–7854 群）
export function chartSeriesDataAttrs(e: any, t?: any, n?: any) {
  return {
    "data-xlsx-chart-point-index": typeof t == `number` ? String(t) : void 0,
    "data-xlsx-chart-selection-mode": n?.selectionMode,
    "data-xlsx-chart-series-index": String(e),
    style: { cursor: `pointer`, pointerEvents: `all` },
  };
}
export function chartSeriesFirstDataAttrs(e: any, t: any) {
  return chartSeriesDataAttrs(e, t, { selectionMode: `seriesFirst` });
}
export function closestChartSeriesElement(e: any) {
  return e instanceof Element ? e.closest(`[data-xlsx-chart-series-index]`) : null;
}
export function resolveChartElementTarget(e: any, t: any, n: any) {
  let r: any = closestChartSeriesElement(t);
  if (!r) return (n?.chartId, e.id, { chartId: e.id, kind: `chart` });
  let i = Number(r.dataset.xlsxChartSeriesIndex);
  if (!Number.isInteger(i) || i < 0 || i >= e.series.length) return null;
  let a = e.series[i];
  if (!a) return null;
  let o = r.dataset.xlsxChartPointIndex,
    s = r.dataset.xlsxChartElementKind,
    c = r.dataset.xlsxChartSelectionMode,
    l = o == null || o === `` ? null : Number(o),
    u = l != null && Number.isInteger(l) && l >= 0,
    d = n?.chartId === e.id && n.kind !== `chart` && n.seriesIndex === i;
  return u && (c !== `seriesFirst` || d)
    ? { chartId: e.id, kind: `point`, pointIndex: l, seriesId: a.id, seriesIndex: i }
    : {
        chartId: e.id,
        kind: s === `legendEntry` ? `legendEntry` : `series`,
        seriesId: a.id,
        seriesIndex: i,
      };
}
export function isChartSeriesSelected(e: any, t: any, n: any) {
  return e?.chartId === t && e.kind !== `chart` && e.seriesIndex === n;
}
export function isChartPointSelected(e: any, t: any, n: any, r: any) {
  return e?.chartId === t && e.kind === `point` && e.seriesIndex === n && e.pointIndex === r;
}
export function isChartElementSelected(e: any, t: any, n: any, r: any) {
  return isChartPointSelected(e, t, n, r) || (isChartSeriesSelected(e, t, n) && e?.kind !== `point`);
}
export function renderRectSelectionHandles(e: any, t: any, n: any, r: any, i: any, a: any = `#64748b`) {
  return renderSelectionHandles(
    e,
    [
      { x: t, y: n },
      { x: t + r, y: n },
      { x: t, y: n + i },
      { x: t + r, y: n + i },
    ],
    a,
  );
}
export function renderSelectionHandles(e: any, t: any, n: any = `#64748b`) {
  return (0, jsxRuntime.jsx)(
    `g`,
    {
      pointerEvents: `none`,
      children: t.map((t: any, r: any) =>
        (0, jsxRuntime.jsx)(
          `circle`,
          {
            cx: t.x,
            cy: t.y,
            fill: `#ffffff`,
            r: 3,
            stroke: n,
            strokeWidth: 1.1,
            style: { filter: `drop-shadow(0 1px 2px rgba(15, 23, 42, 0.18))` },
            vectorEffect: `non-scaling-stroke`,
          },
          `${e}-handle-${r}`,
        ),
      ),
    },
    e,
  );
}

export var DEFAULT_ROW_HEIGHT = 24,
  DEFAULT_COL_WIDTH = 80,
  HEADER_ROW_HEIGHT = 24,
  ROW_HEADER_WIDTH = 40,
  RANGE_CLIPBOARD_MIME = `application/x-react-xlsx-range+json`,
  MIN_RENDERED_ROWS = 200,
  MIN_RENDERED_COLS = 50,
  ROW_BATCH_SIZE = 120,
  COL_BATCH_SIZE = 24,
  MAX_RENDERED_ROWS = 600,
  MAX_RENDERED_COLS = 120,
  ROW_CAPACITY_STEP = 2e3,
  COL_CAPACITY_STEP = 120,
  ROW_PREFETCH_THRESHOLD = 160,
  COL_PREFETCH_THRESHOLD = 24,
  ROW_SCROLL_GROWTH_STEP = 200,
  COL_SCROLL_GROWTH_STEP = 24,
  ROW_SCROLL_PREFETCH_PX = 600,
  COL_SCROLL_PREFETCH_PX = 480,
  POINTER_MOVE_TOLERANCE_PX = 4,
  SCROLLBAR_PLACEHOLDER_PX = 16,
  RESIZE_HANDLE_SIZE_PX = 10,
  FROZEN_DIVIDER_HIT_TOLERANCE_PX = 8,
  CONTENT_LAYER_MAX_PX = 480,
  VIEWPORT_OVERDRAW_MAX_PX = 480,
  SCROLL_SYNC_INVALIDATE_PX = VIEWPORT_OVERDRAW_MAX_PX - 96,
  SCROLL_JUMP_THRESHOLD_PX = VIEWPORT_OVERDRAW_MAX_PX * 1.5,
  CONTENT_CULL_MARGIN_PX = CONTENT_LAYER_MAX_PX * 2,
  GESTURE_ZOOM_SETTLE_MS = 48,
  WHEEL_ZOOM_FACTOR = 0.0025,
  WHEEL_LINE_DELTA_PX = 16,
  CHART_HIGHLIGHT_PALETTE = [`#2563eb`, `#dc2626`, `#7c3aed`, `#059669`, `#ea580c`, `#db2777`],
  CHART_HIGHLIGHT_ROLE_COLORS: any = {
    bubble: CHART_HIGHLIGHT_PALETTE[3] ?? `#059669`,
    category: CHART_HIGHLIGHT_PALETTE[2] ?? `#7c3aed`,
    name: CHART_HIGHLIGHT_PALETTE[0] ?? `#2563eb`,
    point: CHART_HIGHLIGHT_PALETTE[5] ?? `#db2777`,
    value: CHART_HIGHLIGHT_PALETTE[4] ?? `#ea580c`,
  },
  DEFAULT_EDITOR_BACKGROUND = `#ffffff`,
  MUTED_SLATE_COLOR = `#64748b`,
  LIGHT_CANVAS_SURFACE = `#ffffff`,
  HANDLE_SHADOW_COLOR = `rgba(15, 23, 42, 0.18)`,
  CELL_PADDING = `0 4px`,
  RESIZE_HANDLE_DIRECTIONS = [`nw`, `n`, `ne`, `e`, `se`, `s`, `sw`, `w`],
  STYLE_INFO_CACHE_CAPACITY = 4096,
  TEXT_WIDTH_CACHE_CAPACITY = 2e4,
  TRUNCATE_CACHE_CAPACITY = 4096,
  WRAP_CACHE_CAPACITY = 2048,
  PATH2D_CACHE_CAPACITY = 512,
  EMPTY_VIRTUAL_ITEMS = [],
  RESIZE_CURSOR_BY_DIRECTION: any = {
    e: `ew-resize`,
    n: `ns-resize`,
    ne: `nesw-resize`,
    nw: `nwse-resize`,
    s: `ns-resize`,
    se: `nwse-resize`,
    sw: `nesw-resize`,
    w: `ew-resize`,
  },
  CSS_LENGTH_PROPERTIES = new Set(
    `borderRadius.borderTopLeftRadius.borderTopRightRadius.borderBottomLeftRadius.borderBottomRightRadius.bottom.fontSize.gap.height.left.letterSpacing.margin.marginBottom.marginLeft.marginRight.marginTop.maxHeight.maxWidth.minHeight.minWidth.outlineOffset.outlineWidth.padding.paddingBottom.paddingLeft.paddingRight.paddingTop.right.textIndent.top.width`.split(
      `.`,
    ),
  ),
  STYLE_INFO_CACHE = new Map(),
  TEXT_WIDTH_CACHE = new Map(),
  TRUNCATE_CACHE = new Map(),
  WRAP_CACHE = new Map(),
  PATH2D_CACHE = new Map();
function cachePutEvicting(e: any, t: any, n: any, r: any) {
  if (e.size >= r) {
    let t = e.keys().next().value;
    t !== void 0 && e.delete(t);
  }
  return (e.set(t, n), n);
}
function roundToQuarterPx(e: any) {
  return Math.round(e * 4) / 4;
}
export function measureTextWidthCached(e: any, t: any) {
  if (t.length === 0) return 0;
  let n = `${e.font}\0${t}`,
    r = TEXT_WIDTH_CACHE.get(n);
  return r === void 0 ? cachePutEvicting(TEXT_WIDTH_CACHE, n, e.measureText(t).width, TEXT_WIDTH_CACHE_CAPACITY) : r;
}
export function drawTextDecorations(
  e: any,
  {
    align: t,
    color: n,
    decoration: r,
    ellipsize: i = !1,
    lineThroughY: a,
    maxWidth: o,
    text: s,
    textX: c,
    underlineY: l,
    zoomFactor: u,
  }: any,
) {
  if (!r || s.length === 0) return;
  let d = i && o !== void 0 ? Math.min(o, measureTextWidthCached(e, s)) : measureTextWidthCached(e, s),
    f = t === `right` ? c - d : t === `center` ? c - d / 2 : c;
  ((e.strokeStyle = n),
    (e.lineWidth = Math.max(1, u * 0.75)),
    r.includes(`underline`) && (e.beginPath(), e.moveTo(f, l), e.lineTo(f + d, l), e.stroke()),
    r.includes(`line-through`) && (e.beginPath(), e.moveTo(f, a), e.lineTo(f + d, a), e.stroke()));
}
export function getPath2dCached(e: any) {
  return typeof Path2D > `u` ? null : PATH2D_CACHE.get(e) || cachePutEvicting(PATH2D_CACHE, e, new Path2D(e), PATH2D_CACHE_CAPACITY);
}
export function scaleCssLengths(e: any, t: any) {
  return t === 1
    ? e
    : e.replace(/(-?\d*\.?\d+)(px|pt)\b/g, (e: any, n: any, r: any) => {
        let i = Number.parseFloat(n);
        return Number.isFinite(i) ? `${i * t}${r}` : `${n}${r}`;
      });
}
export function scaleStyleValues(e: any, t: any) {
  if (t === 1) return e;
  let n: any = {};
  return (
    Object.entries(e).forEach(([e, r]) => {
      if (typeof r == `string`) {
        n[e] = scaleCssLengths(r, t);
        return;
      }
      if (typeof r == `number` && CSS_LENGTH_PROPERTIES.has(e)) {
        n[e] = r * t;
        return;
      }
      n[e] = r;
    }),
    n
  );
}
function parseLengthNumber(e: any, t: any = 0) {
  if (typeof e == `number` && Number.isFinite(e)) return e;
  if (typeof e == `string`) {
    let t = e.match(/-?\d*\.?\d+/);
    if (t) {
      let e = Number.parseFloat(t[0]);
      if (Number.isFinite(e)) return e;
    }
  }
  return t;
}
function parseBoxInsets(e: any) {
  if (typeof e == `number`) return { bottom: e, left: e, right: e, top: e };
  if (typeof e == `string`) {
    let t = e
      .trim()
      .split(/\s+/)
      .map((e) => parseLengthNumber(e, 0));
    if (t.length === 1) {
      let [e = 0] = t;
      return { bottom: e, left: e, right: e, top: e };
    }
    if (t.length === 2) {
      let [e = 0, n = 0] = t;
      return { bottom: e, left: n, right: n, top: e };
    }
    if (t.length === 3) {
      let [e = 0, n = 0, r = 0] = t;
      return { bottom: r, left: n, right: n, top: e };
    }
    let [n = 0, r = 0, i = 0, a = 0] = t;
    return { bottom: i, left: a, right: r, top: n };
  }
  return { bottom: 0, left: 0, right: 0, top: 0 };
}
export function resolveTextRotationDeg(e: any) {
  return typeof e != `number` || !Number.isFinite(e) || e < 0 || e > 180
    ? null
    : -(e > 90 ? 90 - e : e);
}
export function resolveFontShorthand(e: any, t: any = 12) {
  if (typeof e.font == `string` && e.font.trim().length > 0) return e.font;
  let n = typeof e.fontStyle == `string` && e.fontStyle.trim().length > 0 ? e.fontStyle : `normal`,
    r =
      typeof e.fontSize == `string` && e.fontSize.trim().length > 0
        ? e.fontSize
        : typeof e.fontSize == `number` && Number.isFinite(e.fontSize)
          ? `${e.fontSize}px`
          : `${t}px`;
  return `${n} ${typeof e.fontWeight == `number` || typeof e.fontWeight == `string` ? String(e.fontWeight) : `400`} ${r} ${typeof e.fontFamily == `string` && e.fontFamily.trim().length > 0 ? e.fontFamily : `ui-sans-serif, system-ui, sans-serif`}`;
}
export function fontShorthandAtSize(e: any, t: any) {
  let n = typeof e.fontStyle == `string` && e.fontStyle.trim().length > 0 ? e.fontStyle : `normal`,
    r =
      typeof e.fontWeight == `number` || typeof e.fontWeight == `string`
        ? String(e.fontWeight)
        : `400`,
    i =
      typeof e.fontFamily == `string` && e.fontFamily.trim().length > 0
        ? e.fontFamily
        : `ui-sans-serif, system-ui, sans-serif`;
  return `${n} ${r} ${Math.max(1, t)}px ${i}`;
}
export function parseBorderShorthand(e: any) {
  if (typeof e != `string`) return null;
  let t = e.trim();
  if (!t || t === `none`) return null;
  let n = t.split(/\s+/);
  if (n.length < 3) return null;
  let r = parseLengthNumber(n[0], 1),
    i = n[1] ?? `solid`,
    a = n.slice(2).join(` `);
  return !Number.isFinite(r) || r <= 0 || !a ? null : { color: a, style: i, width: r };
}
function borderStyleRank(e: any) {
  return e ? e.width * 10 + ((({ dashed: 1, dotted: 0, double: 3, solid: 2 }) as any)[e.style] ?? 0) : -1;
}
export function pickStrongerBorder(e: any, t: any) {
  let n = borderStyleRank(e);
  return borderStyleRank(t) > n ? t : e;
}
function applyLineDashForBorderStyle(e: any, t: any, n: any) {
  if (((e.lineCap = `butt`), t === `dashed`)) {
    e.setLineDash([Math.max(3, n * 3), Math.max(2, n * 2)]);
    return;
  }
  if (t === `dotted`) {
    ((e.lineCap = `round`), e.setLineDash([Math.max(0.01, n * 0.01), Math.max(2, n * 2.2)]));
    return;
  }
  e.setLineDash([]);
}
export function drawCellBorder(e: any, t: any, n: any, r: any) {
  let i = r.width / 2,
    a = n.left,
    o = n.left + n.width,
    s = n.top,
    c = n.top + n.height;
  ((e.strokeStyle = r.color), (e.lineWidth = r.width), applyLineDashForBorderStyle(e, r.style, r.width));
  let l = (n = 0) => {
    (e.beginPath(),
      t === `top`
        ? (e.moveTo(a, s + i + n), e.lineTo(o, s + i + n))
        : t === `bottom`
          ? (e.moveTo(a, c - i - n), e.lineTo(o, c - i - n))
          : t === `left`
            ? (e.moveTo(a + i + n, s), e.lineTo(a + i + n, c))
            : (e.moveTo(o - i - n, s), e.lineTo(o - i - n, c)),
      e.stroke());
  };
  if (r.style === `double`) {
    let t = Math.max(1, r.width);
    ((e.lineWidth = Math.max(1, r.width / 3)), e.setLineDash([]), l(0), l(t));
  } else l(0);
  (e.setLineDash([]), (e.lineCap = `butt`), (e.lineWidth = 1));
}
export function truncateTextToWidth(e: any, t: any, n: any) {
  if (n <= 0 || t.length === 0) return ``;
  let r = roundToQuarterPx(n),
    i = `${e.font}\0${r}\0${t}`,
    a = TRUNCATE_CACHE.get(i);
  if (a !== void 0) return a;
  if (measureTextWidthCached(e, t) <= n) return (cachePutEvicting(TRUNCATE_CACHE, i, t, TRUNCATE_CACHE_CAPACITY), t);
  let o = 0,
    s = t.length;
  for (; o < s;) {
    let r = Math.ceil((o + s) / 2);
    measureTextWidthCached(e, `${t.slice(0, r)}…`) <= n ? (o = r) : (s = r - 1);
  }
  return cachePutEvicting(TRUNCATE_CACHE, i, o <= 0 ? `…` : `${t.slice(0, o)}…`, TRUNCATE_CACHE_CAPACITY);
}
export function resolveFontSizePx(e: any, t: any = 12) {
  let n = e.fontSize;
  if (typeof n == `number` && Number.isFinite(n)) return n;
  if (typeof n == `string`) {
    let e = n.trim(),
      t = Number.parseFloat(e);
    if (Number.isFinite(t))
      return e.endsWith(`pt`) ? (96 / 72) * t : e.endsWith(`em`) || e.endsWith(`rem`) ? t * 16 : t;
  }
  return t;
}
export function resolveLineHeightPx(e: any, t: any = 12) {
  let n = resolveFontSizePx(e, t),
    r = e.lineHeight;
  if (typeof r == `number` && Number.isFinite(r)) return r > 4 ? r : r * n;
  if (typeof r == `string`) {
    let e = r.trim();
    if (!e || e === `normal`) return n * 1.2;
    let t = Number.parseFloat(e);
    if (Number.isFinite(t))
      return /^-?\d*\.?\d+$/.test(e)
        ? t > 4
          ? t
          : t * n
        : e.endsWith(`pt`)
          ? (96 / 72) * t
          : e.endsWith(`em`) || e.endsWith(`rem`)
            ? t * 16
            : t;
  }
  return n * 1.2;
}
export function resolveTextBaselineY(e: any, t: any, n: any, r: any) {
  return e === `top` ? t + r / 2 : e === `middle` ? t + n / 2 : t + n - r / 2;
}
function fitTextCharCount(e: any, t: any, n: any) {
  if (t.length <= 1) return t.length;
  let r = 1,
    i = t.length,
    a = 1;
  for (; r <= i;) {
    let o = Math.floor((r + i) / 2);
    measureTextWidthCached(e, t.slice(0, o)) <= n ? ((a = o), (r = o + 1)) : (i = o - 1);
  }
  return a;
}
export function wrapTextToWidth(e: any, t: any, n: any) {
  if (t.length === 0) return [``];
  if (n <= 0)
    return t.replace(
      /\r\n?/g,
      `
`,
    ).split(`
`);
  let r = t.replace(
      /\r\n?/g,
      `
`,
    ),
    i = roundToQuarterPx(n),
    a = `${e.font}\0${i}\0${r}`,
    o = WRAP_CACHE.get(a);
  if (o) return o;
  let s = r.split(`
`),
    c = [];
  for (let t of s) {
    if (t.length === 0) {
      c.push(``);
      continue;
    }
    let r = t;
    for (; r.length > 0;) {
      if (measureTextWidthCached(e, r) <= n) {
        c.push(r);
        break;
      }
      let t = Math.max(1, fitTextCharCount(e, r, n)),
        i = r.slice(0, t),
        a = t < r.length ? Math.max(i.lastIndexOf(` `), i.lastIndexOf(`	`)) : -1,
        o = a > 0 ? a : t,
        s = r.slice(0, o);
      if (s.length === 0) {
        (c.push(r.slice(0, t)), (r = r.slice(t)));
        continue;
      }
      (c.push(s.replace(/\s+$/g, ``)), (r = r.slice(o).replace(/^\s+/g, ``)));
    }
  }
  return cachePutEvicting(WRAP_CACHE, a, c, WRAP_CACHE_CAPACITY);
}
export function resolveCellStyleInfo(e: any) {
  let t = [
    e.font,
    e.fontStyle,
    e.fontWeight,
    e.fontSize,
    e.fontFamily,
    e.borderTop,
    e.borderRight,
    e.borderBottom,
    e.borderLeft,
    e.padding,
    e.textAlign,
    e.color,
    e.textDecoration,
    e.textOverflow,
    e.whiteSpace,
  ]
    .map((e) => (e == null ? `` : String(e)))
    .join(``);
  return (
    STYLE_INFO_CACHE.get(t) ||
    cachePutEvicting(
      STYLE_INFO_CACHE,
      t,
      {
        baseFont: resolveFontShorthand(e, 12),
        bottomBorder: parseBorderShorthand(e.borderBottom),
        leftBorder: parseBorderShorthand(e.borderLeft),
        padding: parseBoxInsets(e.padding),
        rightBorder: parseBorderShorthand(e.borderRight),
        textAlign: e.textAlign === `right` || e.textAlign === `center` ? e.textAlign : `left`,
        textColor: typeof e.color == `string` ? e.color : `#000000`,
        textDecoration: typeof e.textDecoration == `string` ? e.textDecoration : void 0,
        textOverflowEllipsis: e.textOverflow === `ellipsis`,
        topBorder: parseBorderShorthand(e.borderTop),
        usesWrappedText: e.whiteSpace === `pre-wrap`,
      },
      STYLE_INFO_CACHE_CAPACITY,
    )
  );
}
function splitTopLevelSegments(e: any) {
  let t = [],
    n = ``,
    r = 0;
  for (let i of e) {
    if (i === `(`) {
      ((r += 1), (n += i));
      continue;
    }
    if (i === `)`) {
      ((r = Math.max(0, r - 1)), (n += i));
      continue;
    }
    if (i === `,` && r === 0) {
      (t.push(n.trim()), (n = ``));
      continue;
    }
    n += i;
  }
  return (n.trim().length > 0 && t.push(n.trim()), t);
}
function parseGradientStops(e: any) {
  return splitTopLevelSegments(e)
    .map((e) => {
      let t = e.match(/^(.*?)(?:\s+(-?\d*\.?\d+)%)?$/);
      if (!t) return null;
      let n = t[1]?.trim(),
        r = t[2] ? Number.parseFloat(t[2]) : NaN;
      return n
        ? { color: n, offset: Number.isFinite(r) ? Math.max(0, Math.min(1, r / 100)) : null }
        : null;
    })
    .filter((e) => !!e);
}
export function createGradientFill(e: any, t: any, n: any) {
  let r = n.match(/^linear-gradient\((.*)\)$/i);
  if (r) {
    let n = splitTopLevelSegments(r[1] ?? ``);
    if (n.length >= 2) {
      let r = (n[0]?.trim() ?? `180deg`).match(/(-?\d*\.?\d+)deg/i),
        i = ((90 - (r ? Number.parseFloat(r[1] ?? `180`) : 180)) * Math.PI) / 180,
        a = t.width / 2,
        o = t.height / 2,
        s = t.left + a,
        c = t.top + o,
        l = Math.abs(Math.cos(i) * a) + Math.abs(Math.sin(i) * o),
        u = s - Math.cos(i) * l,
        d = c + Math.sin(i) * l,
        f = s + Math.cos(i) * l,
        p = c - Math.sin(i) * l,
        m = e.createLinearGradient(u, d, f, p),
        h = parseGradientStops(n.slice(1).join(`,`));
      if (h.length > 0)
        return (
          h
            .map((e, t) => ({
              color: e.color,
              offset: e.offset ?? (h.length === 1 ? 0 : t / (h.length - 1)),
            }))
            .forEach((e) => {
              m.addColorStop(e.offset, e.color);
            }),
          m
        );
    }
  }
  let i = n.match(/^radial-gradient\((.*)\)$/i);
  if (i) {
    let n = splitTopLevelSegments(i[1] ?? ``),
      r = n[0]?.startsWith(`circle`) ? n.slice(1) : n,
      a = e.createRadialGradient(
        t.left + t.width / 2,
        t.top + t.height / 2,
        0,
        t.left + t.width / 2,
        t.top + t.height / 2,
        Math.max(t.width, t.height) / 2,
      ),
      o = parseGradientStops(r.join(`,`));
    if (o.length > 0)
      return (
        o
          .map((e, t) => ({
            color: e.color,
            offset: e.offset ?? (o.length === 1 ? 0 : t / (o.length - 1)),
          }))
          .forEach((e) => {
            a.addColorStop(e.offset, e.color);
          }),
        a
      );
  }
  return null;
}
export function createDataBarFill(e: any, t: any, n: any, r: any, i: any, a: any) {
  if (a.gradient === !1) return a.color;
  let o = e.createLinearGradient(t, n, t + r, n);
  return (o.addColorStop(0, lightenHex(a.color, 0.28)), o.addColorStop(1, a.color), o);
}
export function drawConditionalIconGlyph(e: any, t: any, n: any, r: any, i: any) {
  if ((e.save(), t.glyph)) {
    ((e.textAlign = `center`),
      (e.textBaseline = `middle`),
      (e.fillStyle = t.color ?? t.backgroundColor ?? `#6b7280`),
      e.fillText(t.glyph, n, r),
      e.restore());
    return;
  }
  if (t.shape === `arrow`) {
    let a = t.color ?? `#111827`,
      o = t.borderColor ?? darkenHex(a, 0.32),
      s = i / 16;
    (e.translate(n, r),
      e.rotate(((t.rotationDeg ?? 0) * Math.PI) / 180),
      e.translate(-8 * s, -8 * s),
      e.beginPath(),
      e.moveTo(2.5 * s, 8 * s),
      e.lineTo(8.4 * s, 2.4 * s),
      e.lineTo(8.4 * s, 5.2 * s),
      e.lineTo(13.5 * s, 5.2 * s),
      e.lineTo(13.5 * s, 10.8 * s),
      e.lineTo(8.4 * s, 10.8 * s),
      e.lineTo(8.4 * s, 13.6 * s),
      e.closePath(),
      (e.fillStyle = a),
      e.fill(),
      (e.strokeStyle = o),
      (e.lineWidth = Math.max(1, 1.25 * s)),
      (e.lineJoin = `round`),
      e.stroke(),
      e.restore());
    return;
  }
  (e.beginPath(),
    e.arc(n, r, i / 2, 0, Math.PI * 2),
    (e.fillStyle = t.color ?? t.backgroundColor ?? `#6b7280`),
    e.fill(),
    e.restore());
}
function formatZoomPercent(e: any) {
  return `${Math.round(e)}%`;
}
export function clampToBounds(e: any, t: any, n: any) {
  return Math.min(n, Math.max(t, e));
}
export function normalizeWheelDelta(e: any) {
  let t = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  switch (e.deltaMode) {
    case WheelEvent.DOM_DELTA_LINE:
      return t * WHEEL_LINE_DELTA_PX;
    case WheelEvent.DOM_DELTA_PAGE:
      return t * window.innerHeight;
    default:
      return t;
  }
}
export function clampPointToRect(e: any, t: any, n: any) {
  return { x: clampToBounds(e - n.left, 0, n.width), y: clampToBounds(t - n.top, 0, n.height) };
}
export function pointerDistance(e: any, t: any) {
  return Math.hypot(e.clientX - t.clientX, e.clientY - t.clientY);
}
function parseHexRgb(e: any) {
  let t = /^#?([0-9a-f]{6})$/i.exec(e);
  return t
    ? {
        blue: Number.parseInt(t[1].slice(4, 6), 16),
        green: Number.parseInt(t[1].slice(2, 4), 16),
        red: Number.parseInt(t[1].slice(0, 2), 16),
      }
    : null;
}
function blendHexColors(e: any, t: any, n: any) {
  let r = parseHexRgb(e),
    i = parseHexRgb(t);
  if (!r || !i) return e;
  let a = Math.max(0, Math.min(1, n)),
    o = (e: any, t: any) => Math.round(e + (t - e) * a);
  return `#${[o(r.red, i.red), o(r.green, i.green), o(r.blue, i.blue)].map((e) => e.toString(16).padStart(2, `0`)).join(``)}`;
}
function lightenHex(e: any, t: any) {
  return blendHexColors(e, `#ffffff`, t);
}
function darkenHex(e: any, t: any) {
  return blendHexColors(e, `#000000`, t);
}
export var SpreadsheetControllerContext = reactInterop.createContext(null),
  SpreadsheetHeaderThemeContext = reactInterop.createContext({ isDark: !1 });
export function joinClassNames(...e: any[]) {
  return e.filter(Boolean).join(` `);
}
function darkHeaderSurface(e: any, t: any) {
  return `hsl(225 4% 6%)`;
}
export function resolveHeaderSurfaceColor(e: any, t: any) {
  return isDarkTheme(t) ? darkHeaderSurface(e?.themePalette, t) : (e?.themePalette.colorsByIndex[0] ?? DEFAULT_EDITOR_BACKGROUND);
}
export function normalizeRangeBounds(e: any) {
  return {
    start: { col: Math.min(e.start.col, e.end.col), row: Math.min(e.start.row, e.end.row) },
    end: { col: Math.max(e.start.col, e.end.col), row: Math.max(e.start.row, e.end.row) },
  };
}
export function parseCellKey(e: any) {
  if (!e) return null;
  let [t, n] = e.split(`:`),
    r = Number(t),
    i = Number(n);
  return !Number.isInteger(r) || !Number.isInteger(i) || r < 0 || i < 0 ? null : { row: r, col: i };
}
export function isSameCell(e: any, t: any) {
  return !!(e && t && e.row === t.row && e.col === t.col);
}
export function cellInRange(e: any, t: any) {
  if (!t) return !1;
  let n = normalizeRangeBounds(t);
  return e.row >= n.start.row && e.row <= n.end.row && e.col >= n.start.col && e.col <= n.end.col;
}
export function chartHighlightForCell(e: any, t: any) {
  let n = null;
  for (let r of t) {
    if (!cellInRange(e, r.range)) continue;
    let t = normalizeRangeBounds(r.range);
    n = {
      borderBottom: e.row === t.end.row,
      borderLeft: e.col === t.start.col,
      borderRight: e.col === t.end.col,
      borderTop: e.row === t.start.row,
      fillColor: r.fillColor,
      strokeColor: r.strokeColor,
    };
  }
  return n;
}
export function rangesEqual(e: any, t: any) {
  if (!e || !t) return e === t;
  let n = normalizeRangeBounds(e),
    r = normalizeRangeBounds(t);
  return (
    n.start.row === r.start.row &&
    n.start.col === r.start.col &&
    n.end.row === r.end.row &&
    n.end.col === r.end.col
  );
}
export function isPrintableCharKey(e: any) {
  return e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey;
}
export function closestInteractiveElement(e: any) {
  return e instanceof Element
    ? e.closest(
        `a[href], button, input, select, textarea, [contenteditable=''], [contenteditable='true'], [role='button'], [role='menu'], [role='menuitem'], [role='textbox'], [tabindex]:not([tabindex='-1'])`,
      )
    : null;
}
export function isFocusWithinContainer(e: any, t: any) {
  let n = closestInteractiveElement(e);
  return !!(n && n !== t && t.contains(n));
}
export function buildPrefixSums(e: any) {
  let t = Array(e.length + 1).fill(0);
  for (let n = 0; n < e.length; n += 1) t[n + 1] = t[n] + (e[n] ?? 0);
  return t;
}
function rangeHasIndex(e: any, t: any, n: any) {
  for (let r = t; r <= n; r += 1) if (e.has(r)) return !0;
  return !1;
}
export function expandIndicesAcrossMerges(e: any, t: any, n: any) {
  let r: any = new Set(e),
    i: any = new Set(t);
  if (r.size === 0 || i.size === 0 || n.length === 0)
    return {
      colIndices: Array.from(i).sort((e: any, t: any) => e - t),
      rowIndices: Array.from(r).sort((e: any, t: any) => e - t),
    };
  let a = !0;
  for (; a;) {
    a = !1;
    for (let e of n) {
      let t = rangeHasIndex(r, e.startRowIndex, e.endRowIndex),
        n = rangeHasIndex(i, e.startColIndex, e.endColIndex);
      if (!(!t || !n)) {
        for (let t = e.startRowIndex; t <= e.endRowIndex; t += 1) r.has(t) || (r.add(t), (a = !0));
        for (let t = e.startColIndex; t <= e.endColIndex; t += 1) i.has(t) || (i.add(t), (a = !0));
      }
    }
  }
  return {
    colIndices: Array.from(i).sort((e: any, t: any) => e - t),
    rowIndices: Array.from(r).sort((e: any, t: any) => e - t),
  };
}
export function rangesFingerprint(e: any, t: any) {
  return e.map((e: any) => `${t(e)}:${e.start}:${e.size}`).join(`|`);
}
export function rangeBoundsKey(e: any) {
  if (!e) return ``;
  let t = normalizeRangeBounds(e);
  return [t.start.row, t.start.col, t.end.row, t.end.col].join(`:`);
}
export function prefixSpanBetween(e: any, t: any, n: any) {
  return t > n ? 0 : (e[n + 1] ?? 0) - (e[t] ?? 0);
}
export function offsetsByIndices(e: any, t: any, n: any) {
  let r = new Map(),
    i = n;
  for (let n of e) (r.set(n, i), (i += t[n] ?? 0));
  return r;
}
export function findSegmentIndexAt(e: any, t: any) {
  let n = e.length - 1;
  if (n <= 0) return -1;
  if (t <= 0) return 0;
  if (t >= e[n]) return n - 1;
  let r = 0,
    i = n - 1;
  for (; r < i;) {
    let n = Math.floor((r + i) / 2);
    (e[n + 1] ?? 0) <= t ? (r = n + 1) : (i = n);
  }
  return r;
}
export function clampScrollOffset(e: any, t: any) {
  return !Number.isFinite(e) || t <= 0 ? 0 : Math.max(0, Math.min(e, Math.max(0, t - 0.001)));
}
export function minContentExtent(e: any, t: any, n: any) {
  return Math.max(e + 1 + n, t);
}
export function collectRenderIndices(e: any, t: any, n: any, r: any) {
  if (t <= 0) return [];
  if (e.length === 0) {
    let e = [],
      i = Math.min(t, Math.max(0, n + 1));
    for (let t = 0; t < i; t += 1) r?.has(t) || e.push(t);
    for (let n = i; n < t; n += 1) e.push(n);
    return e;
  }
  let i = e.filter((e: any) => e < t),
    a = Math.max(0, n + 1);
  for (let e = a; e < t; e += 1) i.push(e);
  return i;
}
export function resolveRenderCapacity(e: any, t: any, n: any, r: any, i: any) {
  let a = minContentExtent(e, t, n);
  return r ? Math.min(a, Math.max(t, i)) : a;
}
function offsetBeforeIndex(e: any, t: any, n: any) {
  let r = 0;
  for (let i = 0; i < e.length && !((e[i] ?? 0) >= n); i += 1) r += t[i] ?? 0;
  return r;
}
function resolveIndexOffset(e: any, t: any, n: any, r: any, i: any, a: any) {
  if (a && e >= 0 && e < a.length) return a[e] ?? 0;
  let o = r?.get(e);
  return o !== void 0 && i ? (i[o] ?? 0) : offsetBeforeIndex(t, n, e);
}
export function resolveAnchorRectPx(e: any, t: any, n: any, r: any, i: any, a: any) {
  let o = a?.headerHeight ?? HEADER_ROW_HEIGHT,
    s = a?.rowHeaderWidth ?? ROW_HEADER_WIDTH,
    c = a?.zoomFactor ?? 1,
    l = (e: any, t: any) =>
      s + resolveIndexOffset(e, n, i, a?.colIndexByActual, a?.colPrefixSums, a?.actualColPrefixSums) + emuToPx(t) * c,
    u = (e: any, n: any) =>
      o + resolveIndexOffset(e, t, r, a?.rowIndexByActual, a?.rowPrefixSums, a?.actualRowPrefixSums) + emuToPx(n) * c;
  if (e.kind === `absolute`)
    return {
      height: Math.max(1, emuToPx(e.sizeEmu.cy) * c),
      left: s + emuToPx(e.positionEmu.x) * c,
      top: o + emuToPx(e.positionEmu.y) * c,
      width: Math.max(1, emuToPx(e.sizeEmu.cx) * c),
    };
  if (e.kind === `one-cell`)
    return {
      height: Math.max(1, emuToPx(e.sizeEmu.cy) * c),
      left: l(e.from.col, e.from.colOffsetEmu),
      top: u(e.from.row, e.from.rowOffsetEmu),
      width: Math.max(1, emuToPx(e.sizeEmu.cx) * c),
    };
  let d = l(e.from.col, e.from.colOffsetEmu),
    f = u(e.from.row, e.from.rowOffsetEmu),
    p = l(e.to.col, e.to.colOffsetEmu),
    m = u(e.to.row, e.to.rowOffsetEmu);
  return { height: Math.max(1, m - f), left: d, top: f, width: Math.max(1, p - d) };
}
export function drawingRectPx(e: any, t: any, n: any, r: any, i: any, a: any) {
  return resolveAnchorRectPx(e.anchor, t, n, r, i, a);
}
export function imageAnchorMaxCell(e: any) {
  return e.anchor.kind === `absolute`
    ? { maxCol: 0, maxRow: 0 }
    : e.anchor.kind === `one-cell`
      ? { maxCol: e.anchor.from.col, maxRow: e.anchor.from.row }
      : {
          maxCol: Math.max(e.anchor.from.col, e.anchor.to.col),
          maxRow: Math.max(e.anchor.from.row, e.anchor.to.row),
        };
}
export function shapeAnchorMaxCell(e: any) {
  return e.anchor.kind === `absolute`
    ? { maxCol: 0, maxRow: 0 }
    : e.anchor.kind === `one-cell`
      ? { maxCol: e.anchor.from.col, maxRow: e.anchor.from.row }
      : {
          maxCol: Math.max(e.anchor.from.col, e.anchor.to.col),
          maxRow: Math.max(e.anchor.from.row, e.anchor.to.row),
        };
}
export function chartAnchorMaxCell(e: any) {
  return e.anchor.kind === `absolute`
    ? { maxCol: 0, maxRow: 0 }
    : e.anchor.kind === `one-cell`
      ? { maxCol: e.anchor.from.col, maxRow: e.anchor.from.row }
      : {
          maxCol: Math.max(e.anchor.from.col, e.anchor.to.col),
          maxRow: Math.max(e.anchor.from.row, e.anchor.to.row),
        };
}
export function rectsIntersectWithMargin(e: any, t: any, n: any = 240) {
  let r = t.left - n,
    i = t.top - n,
    a = t.left + t.width + n,
    o = t.top + t.height + n,
    s = e.left + e.width,
    c = e.top + e.height;
  return s >= r && e.left <= a && c >= i && e.top <= o;
}
export function resolveScrollRegionKind(e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any, c: any) {
  let l = c?.headerHeight ?? HEADER_ROW_HEIGHT,
    u = c?.rowHeaderWidth ?? ROW_HEADER_WIDTH,
    d = c?.defaultRowHeight ?? DEFAULT_ROW_HEIGHT,
    f = c?.defaultColWidth ?? DEFAULT_COL_WIDTH,
    p =
      a?.row && a.row > 0 && t.length > 0
        ? t.reduce((e: any, t: any) => Math.max(e, (o.get(t) ?? l) + (r[t] ?? d)), l)
        : null,
    m =
      a?.col && a.col > 0 && n.length > 0
        ? n.reduce((e: any, t: any) => Math.max(e, (s.get(t) ?? u) + (i[t] ?? f)), u)
        : null,
    h = p !== null && e.top + e.height <= p + 0.5,
    g = m !== null && e.left + e.width <= m + 0.5;
  return h && g ? `corner` : h ? `top` : g ? `left` : `scroll`;
}
export function shapeContainerStyle(e: any, t: any, n: any = 1) {
  let r = e.stroke?.none ? 0 : Math.max(0, e.stroke?.widthPx ?? 0) * n,
    i = e.stroke?.color ?? `transparent`,
    a = e.fill?.none ? `transparent` : (e.fill?.color ?? `transparent`),
    o = e.paragraphs.some((e: any) => e.runs.some((e: any) => e.text.trim().length > 0)),
    s = [
      e.rotationDeg ? `rotate(${e.rotationDeg}deg)` : ``,
      e.flipH ? `scaleX(-1)` : ``,
      e.flipV ? `scaleY(-1)` : ``,
    ].filter(Boolean),
    c: any = 0;
  return (
    e.geometry === `ellipse` ? (c = `9999px`) : e.geometry === `roundRect` && (c = 12 * n),
    {
      alignItems:
        e.textBox?.verticalAlign === `middle`
          ? `center`
          : e.textBox?.verticalAlign === `bottom`
            ? `flex-end`
            : `flex-start`,
      backgroundColor: a,
      border: r > 0 ? `${r}px solid ${i}` : `none`,
      borderRadius: c,
      boxSizing: `border-box`,
      display: `flex`,
      flexDirection: `column`,
      height: t.height,
      justifyContent: `flex-start`,
      left: t.left,
      opacity: Math.min(e.fill?.opacity ?? 1, e.stroke?.opacity ?? 1),
      overflow: o ? `hidden` : `visible`,
      position: `absolute`,
      top: t.top,
      transform: s.join(` `) || void 0,
      transformOrigin: `center center`,
      width: t.width,
      zIndex: e.zIndex,
    }
  );
}
function clampShapeAdjust(e: any, t: any) {
  return Number.isFinite(e) ? Math.max(0, Math.min(100, e)) : t;
}
function resolveShapeAdjust(e: any, t: any, n: any) {
  let r = e.geometryAdjustments?.[t];
  return typeof r == `number` ? clampShapeAdjust(r / 1e3, n) : n;
}
function pointsToOutlinePath(e: any) {
  return e.length === 0
    ? ``
    : e.map(([e, t]: any, n: any) => `${n === 0 ? `M` : `L`} ${e} ${t}`).join(` `) + ` Z`;
}
function polarPoint(e: any, t: any, n: any = 50) {
  let r = (Math.PI / 180) * t;
  return [n + Math.cos(r) * e, n + Math.sin(r) * e];
}
function regularPolygonPath(e: any, t: any = -90, n: any = 50) {
  return pointsToOutlinePath(Array.from({ length: e }, (r, i) => polarPoint(n, t + (360 / e) * i)));
}
function starPolygonPath(e: any, t: any, n: any = -90, r: any = 50) {
  return pointsToOutlinePath(
    Array.from({ length: e * 2 }, (i, a) => polarPoint(a % 2 == 0 ? r : t, n + (360 / (e * 2)) * a)),
  );
}
function roundedRectPath(e: any) {
  let t = Math.max(0, Math.min(50, e)),
    n = 100 - t;
  return [
    `M ${t} 0`,
    `L ${n} 0`,
    `Q 100 0 100 ${t}`,
    `L 100 ${n}`,
    `Q 100 100 ${n} 100`,
    `L ${t} 100`,
    `Q 0 100 0 ${n}`,
    `L 0 ${t}`,
    `Q 0 0 ${t} 0`,
    `Z`,
  ].join(` `);
}
function ellipsePath() {
  return `M 50 0 A 50 50 0 1 1 49.999 0 Z`;
}
function pieWedgePath(e: any, t: any) {
  let [n, r] = polarPoint(50, e),
    [i, a] = polarPoint(50, t),
    o = +((t >= e ? t - e : 360 - (e - t)) > 180);
  return [`M 50 50`, `L ${n} ${r}`, `A 50 50 0 ${o} 1 ${i} ${a}`, `Z`].join(` `);
}
function chordPath(e: any, t: any) {
  let [n, r] = polarPoint(50, e),
    [i, a] = polarPoint(50, t),
    o = +((t >= e ? t - e : 360 - (e - t)) > 180);
  return [`M ${n} ${r}`, `A 50 50 0 ${o} 1 ${i} ${a}`, `Z`].join(` `);
}
function plusCrossPath(e: any) {
  let t = Math.max(10, Math.min(40, e)),
    n = 50 - t / 2,
    r = 50 + t / 2;
  return pointsToOutlinePath([
    [n, 0],
    [r, 0],
    [r, n],
    [100, n],
    [100, r],
    [r, r],
    [r, 100],
    [n, 100],
    [n, r],
    [0, r],
    [0, n],
    [n, n],
  ]);
}
function pentagonArrowPath() {
  return pointsToOutlinePath([
    [0, 20],
    [70, 20],
    [70, 0],
    [100, 50],
    [70, 100],
    [70, 80],
    [0, 80],
  ]);
}
function chevronArrowPath() {
  return pointsToOutlinePath([
    [0, 20],
    [54, 20],
    [54, 0],
    [100, 50],
    [54, 100],
    [54, 80],
    [0, 80],
    [32, 50],
  ]);
}
function notchedArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj2`, 36),
    n = resolveShapeAdjust(e, `adj1`, 20),
    r = Math.min(24, t * 0.7),
    i = 50 - n,
    a = 50 + n,
    o = 100 - t;
  return pointsToOutlinePath([
    [0, i],
    [o, i],
    [o, 0],
    [100, 50],
    [o, 100],
    [o, a],
    [r, a],
    [0, 50],
    [r, i],
  ]);
}
function stripedArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj2`, 34),
    n = resolveShapeAdjust(e, `adj1`, 20),
    r = 50 - n,
    i = 50 + n,
    a = 100 - t;
  return [
    `M 0 ${r} L 12 ${r} L 12 ${i} L 0 ${i} Z`,
    pointsToOutlinePath([
      [12 * 1.6, r],
      [a, r],
      [a, 0],
      [100, 50],
      [a, 100],
      [a, i],
      [12 * 1.6, i],
    ]),
  ].join(` `);
}
function leftUpArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj1`, 28),
    n = resolveShapeAdjust(e, `adj2`, 34);
  return pointsToOutlinePath([
    [100, 100 - t],
    [t, 100 - t],
    [t, 100],
    [0, 50],
    [t, 0],
    [t, n],
    [100, n],
  ]);
}
function bentUpArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj1`, 26),
    n = resolveShapeAdjust(e, `adj2`, 28),
    r = resolveShapeAdjust(e, `adj3`, 12),
    i = 50 - r,
    a = 50 + r;
  return pointsToOutlinePath([
    [0, i],
    [100 - t, i],
    [100 - t, n],
    [100 - t * 0.5, n],
    [100, 0],
    [100 - t * 1.5, n],
    [100 - t, n],
    [100 - t, 100],
    [100 - t * 2, 100],
    [100 - t * 2, a],
    [0, a],
  ]);
}
function uturnArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj1`, 22);
  return (
    resolveShapeAdjust(e, `adj2`, 28),
    pointsToOutlinePath([
      [100, 100],
      [100, 55],
      [45, 55],
      [45, 100],
      [0, 50],
      [45, 0],
      [45, 45],
      [100 - t, 45],
      [100 - t, 100],
    ])
  );
}
function leftRightUpArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj2`, 22),
    n = resolveShapeAdjust(e, `adj1`, 16),
    r = 50 - n,
    i = 50 + n,
    a = 50 - n,
    o = 50 + n;
  return pointsToOutlinePath([
    [t, r],
    [a, r],
    [a, t],
    [0, t],
    [50, 0],
    [100, t],
    [o, t],
    [o, r],
    [100 - t, r],
    [100 - t, 0],
    [100, 50],
    [100 - t, 100],
    [100 - t, i],
    [t, i],
    [t, 100],
    [0, 50],
    [t, 0],
  ]);
}
function quadArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj2`, 22),
    n = resolveShapeAdjust(e, `adj1`, 14),
    r = 50 - n,
    i = 50 + n,
    a = 50 - n,
    o = 50 + n;
  return pointsToOutlinePath([
    [r, t],
    [t, t],
    [t, a],
    [0, 50],
    [t, 100 - a],
    [t, o],
    [r, o],
    [r, 100 - t],
    [a, 100 - t],
    [50, 100],
    [100 - a, 100 - t],
    [i, 100 - t],
    [i, o],
    [100 - t, o],
    [100 - t, 100 - a],
    [100, 50],
    [100 - t, a],
    [100 - t, t],
    [i, t],
    [i, a],
    [100 - a, t],
    [50, 0],
    [a, t],
    [r, t],
  ]);
}
function heartPath() {
  return [
    `M 50 92`,
    `C 18 72 0 52 0 28`,
    `C 0 10 14 0 28 0`,
    `C 38 0 46 6 50 16`,
    `C 54 6 62 0 72 0`,
    `C 86 0 100 10 100 28`,
    `C 100 52 82 72 50 92`,
    `Z`,
  ].join(` `);
}
function lightningBoltPath() {
  return pointsToOutlinePath([
    [42, 0],
    [10, 58],
    [38, 58],
    [24, 100],
    [90, 36],
    [58, 36],
    [72, 0],
  ]);
}
function teardropPath() {
  return [
    `M 50 0`,
    `C 20 24 0 44 0 68`,
    `C 0 86 14 100 32 100`,
    `C 60 100 82 78 82 50`,
    `C 82 26 68 10 50 0`,
    `Z`,
  ].join(` `);
}
function cloudPath() {
  return [
    `M 22 70`,
    `C 8 70 0 62 0 50`,
    `C 0 40 6 32 18 30`,
    `C 20 16 30 8 44 8`,
    `C 54 8 62 12 68 20`,
    `C 72 14 80 12 88 14`,
    `C 98 18 100 26 100 34`,
    `C 100 44 94 50 88 52`,
    `C 92 66 82 76 68 76`,
    `C 62 84 52 88 42 88`,
    `C 32 88 24 82 22 70`,
    `Z`,
  ].join(` `);
}
function rightArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj2`, 38),
    n = resolveShapeAdjust(e, `adj1`, 20),
    r = 50 - n,
    i = 50 + n,
    a = 100 - t;
  return pointsToOutlinePath([
    [0, r],
    [a, r],
    [a, 0],
    [100, 50],
    [a, 100],
    [a, i],
    [0, i],
  ]);
}
function leftArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj2`, 38),
    n = resolveShapeAdjust(e, `adj1`, 20),
    r = 50 - n,
    i = 50 + n,
    a = t;
  return pointsToOutlinePath([
    [100, r],
    [a, r],
    [a, 0],
    [0, 50],
    [a, 100],
    [a, i],
    [100, i],
  ]);
}
function upArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj2`, 38),
    n = resolveShapeAdjust(e, `adj1`, 20),
    r = 50 - n,
    i = 50 + n,
    a = t;
  return pointsToOutlinePath([
    [r, 100],
    [r, a],
    [0, a],
    [50, 0],
    [100, a],
    [i, a],
    [i, 100],
  ]);
}
function downArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj2`, 38),
    n = resolveShapeAdjust(e, `adj1`, 20),
    r = 50 - n,
    i = 50 + n,
    a = 100 - t;
  return pointsToOutlinePath([
    [r, 0],
    [r, a],
    [0, a],
    [50, 100],
    [100, a],
    [i, a],
    [i, 0],
  ]);
}
function leftRightArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj2`, 24),
    n = resolveShapeAdjust(e, `adj1`, 18),
    r = 50 - n,
    i = 50 + n;
  return pointsToOutlinePath([
    [t, r],
    [100 - t, r],
    [100 - t, 0],
    [100, 50],
    [100 - t, 100],
    [100 - t, i],
    [t, i],
    [t, 100],
    [0, 50],
    [t, 0],
  ]);
}
function upDownArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj2`, 24),
    n = resolveShapeAdjust(e, `adj1`, 18),
    r = 50 - n,
    i = 50 + n;
  return pointsToOutlinePath([
    [r, t],
    [r, 100 - t],
    [0, 100 - t],
    [50, 100],
    [100, 100 - t],
    [i, 100 - t],
    [i, t],
    [100, t],
    [50, 0],
    [0, t],
  ]);
}
function bentArrowPath(e: any) {
  let t = resolveShapeAdjust(e, `adj1`, 25),
    n = resolveShapeAdjust(e, `adj2`, 27),
    r = resolveShapeAdjust(e, `adj3`, 12.5),
    i = resolveShapeAdjust(e, `adj4`, 43.75),
    a = i - r,
    o = i + r,
    s = 100 - n;
  return pointsToOutlinePath([
    [0, a],
    [s, a],
    [s, 0],
    [100, i],
    [s, 100],
    [s, o],
    [t, o],
    [t, 100],
    [0, 100],
  ]);
}
function resolveAutoShapePath(e: any) {
  switch (e.geometry) {
    case `arc`:
      return { path: `M 8 74 C 18 24 82 24 92 74`, viewBox: { width: 100, height: 100 } };
    case `bentArrow`:
      return { path: bentArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `bentUpArrow`:
      return { path: bentUpArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `blockArc`:
      return {
        path: `M 12 78 A 38 38 0 1 1 78 12 L 62 28 A 16 16 0 1 0 28 62 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `can`:
      return {
        path: `M 18 14 C 18 6 82 6 82 14 L 82 86 C 82 94 18 94 18 86 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `chevron`:
      return {
        path: `M 0 0 L 62 0 L 100 50 L 62 100 L 0 100 L 38 50 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `chevronArrow`:
      return { path: chevronArrowPath(), viewBox: { width: 100, height: 100 } };
    case `chord`:
      return { path: chordPath(-30, 210), viewBox: { width: 100, height: 100 } };
    case `cloud`:
    case `cloudCallout`:
      return { path: cloudPath(), viewBox: { width: 100, height: 100 } };
    case `diamond`:
    case `flowChartDecision`:
      return { path: `M 50 0 L 100 50 L 50 100 L 0 50 Z`, viewBox: { width: 100, height: 100 } };
    case `downArrow`:
      return { path: downArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `line`:
      return { path: `M 0 0 L 100 100`, viewBox: { width: 100, height: 100 } };
    case `ellipse`:
    case `flowChartTerminator`:
      return { path: ellipsePath(), viewBox: { width: 100, height: 100 } };
    case `flowChartAlternateProcess`:
    case `flowChartDelay`:
    case `roundRect`:
      return { path: roundedRectPath(resolveShapeAdjust(e, `adj`, 18)), viewBox: { width: 100, height: 100 } };
    case `flowChartCollate`:
      return { path: `M 0 0 L 100 0 L 0 100 Z`, viewBox: { width: 100, height: 100 } };
    case `flowChartData`:
    case `flowChartInputOutput`:
      return { path: `M 24 0 L 100 0 L 76 100 L 0 100 Z`, viewBox: { width: 100, height: 100 } };
    case `flowChartDocument`:
      return {
        path: `M 0 0 L 100 0 L 100 82 C 78 70 60 94 40 82 C 24 72 12 88 0 82 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `flowChartMagneticDisk`:
      return {
        path: `M 18 14 C 18 6 82 6 82 14 L 82 86 C 82 94 18 94 18 86 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `flowChartManualInput`:
      return { path: `M 16 0 L 100 0 L 84 100 L 0 100 Z`, viewBox: { width: 100, height: 100 } };
    case `flowChartPreparation`:
    case `hexagon`:
      return {
        path: `M 25 0 L 75 0 L 100 50 L 75 100 L 25 100 L 0 50 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `flowChartProcess`:
    case `rect`:
      return { path: `M 0 0 L 100 0 L 100 100 L 0 100 Z`, viewBox: { width: 100, height: 100 } };
    case `heart`:
      return { path: heartPath(), viewBox: { width: 100, height: 100 } };
    case `heptagon`:
      return { path: regularPolygonPath(7), viewBox: { width: 100, height: 100 } };
    case `homePlate`:
    case `flowChartOffpageConnector`:
      return {
        path: `M 0 0 L 70 0 L 100 50 L 70 100 L 0 100 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `leftArrow`:
      return { path: leftArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `leftBracket`:
      return { path: `M 72 0 L 28 0 L 28 100 L 72 100`, viewBox: { width: 100, height: 100 } };
    case `leftBrace`:
      return {
        path: `M 82 0 C 46 0 52 24 52 38 C 52 46 46 50 24 50 C 46 50 52 54 52 62 C 52 76 46 100 82 100`,
        viewBox: { width: 100, height: 100 },
      };
    case `leftRightArrowCallout`:
      return { path: leftRightArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `leftRightArrow`:
      return { path: leftRightArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `leftRightUpArrow`:
      return { path: leftRightUpArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `leftUpArrow`:
      return { path: leftUpArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `lightningBolt`:
      return { path: lightningBoltPath(), viewBox: { width: 100, height: 100 } };
    case `mathPlus`:
    case `plus`:
      return { path: plusCrossPath(resolveShapeAdjust(e, `adj`, 26)), viewBox: { width: 100, height: 100 } };
    case `cross`:
      return { path: plusCrossPath(resolveShapeAdjust(e, `adj`, 22)), viewBox: { width: 100, height: 100 } };
    case `mathMinus`:
    case `minus`:
      return { path: `M 0 40 L 100 40 L 100 60 L 0 60 Z`, viewBox: { width: 100, height: 100 } };
    case `mathMultiply`:
    case `multiply`:
      return {
        path: `M 18 0 L 50 32 L 82 0 L 100 18 L 68 50 L 100 82 L 82 100 L 50 68 L 18 100 L 0 82 L 32 50 L 0 18 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `mathDivide`:
      return {
        path: `M 0 42 L 100 42 L 100 58 L 0 58 Z M 50 12 A 8 8 0 1 1 49.999 12 Z M 50 88 A 8 8 0 1 1 49.999 88 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `moon`:
      return {
        path: `M 70 6 C 42 10 22 34 22 62 C 22 80 32 94 48 100 C 20 98 0 76 0 48 C 0 20 20 0 48 0 C 56 0 64 2 70 6 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `notchedRightArrow`:
      return { path: notchedArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `octagon`:
      return {
        path: `M 30 0 L 70 0 L 100 30 L 100 70 L 70 100 L 30 100 L 0 70 L 0 30 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `parallelogram`:
      return { path: `M 24 0 L 100 0 L 76 100 L 0 100 Z`, viewBox: { width: 100, height: 100 } };
    case `pentagon`:
      return {
        path: `M 50 0 L 100 38 L 81 100 L 19 100 L 0 38 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `pie`:
    case `pieWedge`:
      return { path: pieWedgePath(-35, 225), viewBox: { width: 100, height: 100 } };
    case `pentagonArrow`:
      return { path: pentagonArrowPath(), viewBox: { width: 100, height: 100 } };
    case `plaque`:
      return {
        path: `M 12 0 L 88 0 L 100 12 L 100 88 L 88 100 L 12 100 L 0 88 L 0 12 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `quadArrow`:
      return { path: quadArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `rightArrow`:
      return { path: rightArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `rightArrowCallout`:
      return {
        path: `M 0 18 L 62 18 L 62 0 L 100 50 L 62 100 L 62 82 L 0 82 L 0 18 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `rightBracket`:
      return { path: `M 28 0 L 72 0 L 72 100 L 28 100`, viewBox: { width: 100, height: 100 } };
    case `downArrowCallout`:
      return {
        path: `M 18 0 L 82 0 L 82 58 L 100 58 L 50 100 L 0 58 L 18 58 L 18 0 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `rightBrace`:
      return {
        path: `M 18 0 C 54 0 48 24 48 38 C 48 46 54 50 76 50 C 54 50 48 54 48 62 C 48 76 54 100 18 100`,
        viewBox: { width: 100, height: 100 },
      };
    case `round1Rect`:
      return {
        path: `M 18 0 L 100 0 L 100 100 L 18 100 Q 0 100 0 82 L 0 18 Q 0 0 18 0 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `round2DiagRect`:
      return {
        path: `M 18 0 L 100 0 L 100 82 Q 100 100 82 100 L 0 100 L 0 18 Q 0 0 18 0 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `round2SameRect`:
      return {
        path: `M 18 0 L 82 0 Q 100 0 100 18 L 100 82 Q 100 100 82 100 L 0 100 L 0 0 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `decagon`:
      return { path: regularPolygonPath(10), viewBox: { width: 100, height: 100 } };
    case `dodecagon`:
      return { path: regularPolygonPath(12), viewBox: { width: 100, height: 100 } };
    case `rtTriangle`:
      return { path: `M 0 0 L 100 100 L 0 100 Z`, viewBox: { width: 100, height: 100 } };
    case `star4`:
      return { path: starPolygonPath(4, 20), viewBox: { width: 100, height: 100 } };
    case `star5`:
      return { path: starPolygonPath(5, 21), viewBox: { width: 100, height: 100 } };
    case `star6`:
      return { path: starPolygonPath(6, 23), viewBox: { width: 100, height: 100 } };
    case `star7`:
      return { path: starPolygonPath(7, 24), viewBox: { width: 100, height: 100 } };
    case `star8`:
      return { path: starPolygonPath(8, 25), viewBox: { width: 100, height: 100 } };
    case `star10`:
      return { path: starPolygonPath(10, 26), viewBox: { width: 100, height: 100 } };
    case `star12`:
      return { path: starPolygonPath(12, 26), viewBox: { width: 100, height: 100 } };
    case `star16`:
      return { path: starPolygonPath(16, 27), viewBox: { width: 100, height: 100 } };
    case `star24`:
      return { path: starPolygonPath(24, 28), viewBox: { width: 100, height: 100 } };
    case `star32`:
      return { path: starPolygonPath(32, 29), viewBox: { width: 100, height: 100 } };
    case `stripedRightArrow`:
      return { path: stripedArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `sun`:
      return { path: starPolygonPath(12, 36), viewBox: { width: 100, height: 100 } };
    case `teardrop`:
      return { path: teardropPath(), viewBox: { width: 100, height: 100 } };
    case `triangle`:
      return { path: `M 50 0 L 100 100 L 0 100 Z`, viewBox: { width: 100, height: 100 } };
    case `trapezoid`:
      return { path: `M 20 0 L 80 0 L 100 100 L 0 100 Z`, viewBox: { width: 100, height: 100 } };
    case `upArrow`:
      return { path: upArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `upArrowCallout`:
      return {
        path: `M 50 0 L 100 42 L 82 42 L 82 100 L 18 100 L 18 42 L 0 42 L 50 0 Z`,
        viewBox: { width: 100, height: 100 },
      };
    case `upDownArrow`:
      return { path: upDownArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `upDownArrowCallout`:
      return { path: upDownArrowPath(e), viewBox: { width: 100, height: 100 } };
    case `uturnArrow`:
      return { path: uturnArrowPath(e), viewBox: { width: 100, height: 100 } };
    default:
      return null;
  }
}
export function resolveShapeSvgPath(e: any) {
  return e.svgPath && e.svgViewBox ? { path: e.svgPath, viewBox: e.svgViewBox } : resolveAutoShapePath(e);
}
export function traceRoundedRectPath(e: any, t: any, n: any, r: any, i: any, a: any) {
  let o = Math.max(0, Math.min(a, r / 2, i / 2));
  (e.beginPath(),
    e.moveTo(t + o, n),
    e.lineTo(t + r - o, n),
    e.quadraticCurveTo(t + r, n, t + r, n + o),
    e.lineTo(t + r, n + i - o),
    e.quadraticCurveTo(t + r, n + i, t + r - o, n + i),
    e.lineTo(t + o, n + i),
    e.quadraticCurveTo(t, n + i, t, n + i - o),
    e.lineTo(t, n + o),
    e.quadraticCurveTo(t, n, t + o, n),
    e.closePath());
}
export function applyDashPattern(e: any, t: any, n: any) {
  if (!t) {
    e.setLineDash([]);
    return;
  }
  let r = Math.max(1, n);
  switch (t) {
    case `dash`:
      e.setLineDash([4 * r, 3 * r]);
      break;
    case `dashDot`:
      e.setLineDash([4 * r, 2 * r, r, 2 * r]);
      break;
    case `dot`:
      e.setLineDash([r, 2 * r]);
      break;
    case `lgDash`:
      e.setLineDash([8 * r, 3 * r]);
      break;
    default:
      e.setLineDash([]);
      break;
  }
}
export function renderArrowMarkerDef(e: any, t: any, n: any, r: any, i: any, a: any) {
  if (e !== `triangle`) return null;
  let o = (a.width / Math.max(1, i.width) + a.height / Math.max(1, i.height)) / 2,
    s = Math.max(o * 8, o * r * 4);
  return (0, jsxRuntime.jsx)(
    `marker`,
    {
      id: t,
      markerHeight: s,
      markerUnits: `userSpaceOnUse`,
      markerWidth: s,
      orient: `auto-start-reverse`,
      overflow: `visible`,
      refX: s,
      refY: s / 2,
      viewBox: `0 0 ${s} ${s}`,
      children: (0, jsxRuntime.jsx)(`path`, { d: `M 0 0 L ${s} ${s / 2} L 0 ${s} z`, fill: n }),
    },
    t,
  );
}
export function renderTextParagraphRuns(e: any, t: any, n: any = `left`, r: any = 1) {
  return (0, jsxRuntime.jsx)(
    `p`,
    {
      style: { margin: 0, textAlign: e.align ?? n, whiteSpace: `pre-wrap` },
      children: e.runs.map((e: any, t: any) =>
        (0, jsxRuntime.jsx)(
          `span`,
          {
            style: {
              color: e.color,
              fontFamily: e.fontFamily,
              fontSize: e.fontSizePt ? `${e.fontSizePt * r}pt` : void 0,
              fontStyle: e.italic ? `italic` : void 0,
              fontWeight: e.bold ? 700 : void 0,
              textDecoration: e.underline ? `underline` : void 0,
            },
            children: e.text,
          },
          t,
        ),
      ),
    },
    t,
  );
}
export function clampRectToGrid(e: any, t: any) {
  let n = t?.contentOffsetLeft ?? ROW_HEADER_WIDTH,
    r = t?.contentOffsetTop ?? HEADER_ROW_HEIGHT,
    i = t?.minSizePx ?? SCROLLBAR_PLACEHOLDER_PX;
  return {
    height: Math.max(i, e.height),
    left: Math.max(n, e.left),
    top: Math.max(r, e.top),
    width: Math.max(i, e.width),
  };
}
export function resizeHandleStyle(e: any, t: any, n: any, r: any = 1) {
  let i = RESIZE_HANDLE_SIZE_PX * r,
    a = i / 2,
    o: any = {
      backgroundColor: n,
      border: `${Math.max(1, r)}px solid ${t}`,
      borderRadius: 3 * r,
      boxShadow: `0 1px ${3 * r}px ${HANDLE_SHADOW_COLOR}`,
      boxSizing: `border-box`,
      cursor: RESIZE_CURSOR_BY_DIRECTION[e],
      height: i,
      pointerEvents: `auto`,
      position: `absolute`,
      width: i,
    };
  return (
    e.includes(`n`) && (o.top = -a),
    e.includes(`s`) && (o.bottom = -a),
    e.includes(`w`) && (o.left = -a),
    e.includes(`e`) && (o.right = -a),
    (e === `n` || e === `s`) && (o.left = `calc(50% - ${a}px)`),
    (e === `e` || e === `w`) && (o.top = `calc(50% - ${a}px)`),
    o
  );
}
export function useGridTheme(e: any = !1, t: any, n: any) {
  return reactInterop.useMemo(() => bm(e, t, n), [t, n, e]);
}
export function columnIndexToLetters(e: any) {
  let t = ``,
    n = e;
  for (; n >= 0;) ((t = String.fromCharCode(65 + (n % 26)) + t), (n = Math.floor(n / 26) - 1));
  return t;
}
function formatCellRef(e: any) {
  return `${columnIndexToLetters(e.col)}${e.row + 1}`;
}
function parseCellRef(e: any) {
  let t = /^([A-Z]+)(\d+)$/i.exec(e.trim());
  if (!t) return null;
  let [, n, r] = t,
    i = 0;
  for (let e of n.toUpperCase()) i = i * 26 + (e.charCodeAt(0) - 64);
  return { col: i - 1, row: Number(r) - 1 };
}
export function resolveGridCellStyle(e: any, t: any, n: any) {
  if (!e) return null;
  let r = e.colStyleIds[n],
    i = e.rowStyleIds[t];
  return mergeCellStyles(
    r === void 0 ? null : (e.styleById[r] ?? null),
    i === void 0 ? null : (e.styleById[i] ?? null),
    { replaceXfSubtrees: !0 },
  );
}
export function parseExternalCellRef(e: any) {
  if (!e) return null;
  let t = e.startsWith(`#`) ? e.slice(1) : e,
    n = t.lastIndexOf(`!`);
  if (n < 0) return null;
  let r = t.slice(0, n).trim(),
    i = parseCellRef(t.slice(n + 1).trim());
  return i
    ? {
        cell: i,
        sheetName: r.startsWith(`'`) && r.endsWith(`'`) ? r.slice(1, -1).replace(/''/g, `'`) : r,
      }
    : null;
}
function decodeXmlEntities(e: any) {
  return e
    .replace(/&quot;/g, `"`)
    .replace(/&#34;/g, `"`)
    .replace(/&apos;/g, `'`)
    .replace(/&#39;/g, `'`)
    .replace(/&lt;/g, `<`)
    .replace(/&gt;/g, `>`)
    .replace(/&amp;/g, `&`);
}
function borderToCssShorthand(e: any, t: any) {
  let n = resolveFontColor(e.color, t) ?? `#000`;
  return `${({ dashed: `1px`, dotted: `1px`, double: `3px`, hair: `0.5px`, medium: `2px`, thick: `3px`, thin: `1px` } as any)[e.style] ?? `1px`} ${({ dashDot: `dashed`, dashDotDot: `dotted`, dashed: `dashed`, dotted: `dotted`, double: `double`, hair: `solid`, medium: `solid`, mediumDashDot: `dashed`, mediumDashDotDot: `dotted`, mediumDashed: `dashed`, slantDashDot: `dashed`, thick: `solid`, thin: `solid` } as any)[e.style] ?? `solid`} ${n}`;
}
export function isDarkTheme(e: any) {
  return ym(e);
}
function parseColorToRgbTuple(e: any) {
  let t = e.trim().toLowerCase(),
    n = /^#([0-9a-f]{6})$/.exec(t);
  if (n) {
    let e = n[1];
    return [
      Number.parseInt(e.slice(0, 2), 16),
      Number.parseInt(e.slice(2, 4), 16),
      Number.parseInt(e.slice(4, 6), 16),
    ];
  }
  let r = /^rgb\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)$/.exec(t);
  if (r)
    return [
      Math.max(0, Math.min(255, Number.parseInt(r[1], 10))),
      Math.max(0, Math.min(255, Number.parseInt(r[2], 10))),
      Math.max(0, Math.min(255, Number.parseInt(r[3], 10))),
    ];
  let i =
    /^hsl\(\s*(-?\d+(?:\.\d+)?)\s*(?:deg)?(?:\s+|,\s*)(\d+(?:\.\d+)?)%(?:\s+|,\s*)(\d+(?:\.\d+)?)%\s*\)$/.exec(
      t,
    );
  return i
    ? hslToRgbTuple(
        (((Number.parseFloat(i[1]) % 360) + 360) % 360) / 360,
        Math.max(0, Math.min(1, Number.parseFloat(i[2]) / 100)),
        Math.max(0, Math.min(1, Number.parseFloat(i[3]) / 100)),
      )
    : null;
}
function colorWithAlpha(e: any, t: any) {
  let n = parseColorToRgbTuple(e);
  if (!n) return e;
  let [r, i, a] = n;
  return `rgba(${r}, ${i}, ${a}, ${Math.max(0, Math.min(1, t))})`;
}
function relativeLuminance(e: any) {
  let t = parseColorToRgbTuple(e);
  if (!t) return null;
  let [n, r, i] = t.map((e) => {
    let t = e / 255;
    return t <= 0.03928 ? t / 12.92 : ((t + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * n + 0.7152 * r + 0.0722 * i;
}
function contrastRatio(e: any, t: any) {
  let n = relativeLuminance(e),
    r = relativeLuminance(t);
  if (n === null || r === null) return null;
  let i = Math.max(n, r),
    a = Math.min(n, r);
  return (i + 0.05) / (a + 0.05);
}
export function resolveContrastTextColor(e: any, t: any, n: any) {
  if (!isDarkTheme(n)) return e ?? `#000000`;
  if (!e) return n.text;
  let r = contrastRatio(e, t),
    i = contrastRatio(n.text, t);
  return r !== null && r >= 4.5 ? e : i !== null && (r === null || i > r) ? n.text : e;
}
function hueChannel(e: any, t: any, n: any) {
  let r = n;
  return (
    r < 0 && (r += 1),
    r > 1 && --r,
    r < 1 / 6 ? e + (t - e) * 6 * r : r < 1 / 2 ? t : r < 2 / 3 ? e + (t - e) * (2 / 3 - r) * 6 : e
  );
}
function hslToRgbTuple(e: any, t: any, n: any) {
  if (t === 0) {
    let e = Math.round(n * 255);
    return [e, e, e];
  }
  let r = n < 0.5 ? n * (1 + t) : n + t - n * t,
    i = 2 * n - r;
  return [
    Math.round(hueChannel(i, r, e + 1 / 3) * 255),
    Math.round(hueChannel(i, r, e) * 255),
    Math.round(hueChannel(i, r, e - 1 / 3) * 255),
  ];
}
function quoteFontFamily(e: any) {
  return /[\s"'(),]/.test(e) ? `"${e.replace(/\\/g, `\\\\`).replace(/"/g, `\\"`)}"` : e;
}
function resolveSchemeFontFamily(e: any, t: any) {
  let n = typeof e?.scheme == `string` ? e.scheme : null;
  if (n === `major`) return t?.majorLatinFont;
  if (n === `minor`) return t?.minorLatinFont;
}
function resolveFontFamilyStack(e: any, t: any) {
  let n = [typeof e?.name == `string` ? e.name.trim() : ``, resolveSchemeFontFamily(e, t)?.trim() ?? ``].filter(
    (e, t, n) => e.length > 0 && n.indexOf(e) === t,
  );
  if (n.length !== 0)
    return n[0]?.toLowerCase() === `calibri`
      ? [`Calibri`, `Carlito`, `"Aptos"`, `"Segoe UI"`, `Tahoma`, `Arial`, `sans-serif`].join(`, `)
      : [...n.map(quoteFontFamily), `"Segoe UI"`, `Tahoma`, `Arial`, `sans-serif`].join(`, `);
}
function lineHeightMultiplier(e: any) {
  let t = typeof e == `number` && Number.isFinite(e) ? e : 11;
  return t <= 11 ? 1.2 : t <= 14 ? 1.25 : 1.3;
}
export function gridInsetShadow(e: any, t?: any) {
  let n = [];
  return (
    t?.right !== !1 && n.push(`inset -1px 0 0 ${e}`),
    t?.bottom !== !1 && n.push(`inset 0 -1px 0 ${e}`),
    n.join(`, `)
  );
}
export function resolveCellStyleCss(e: any, t: any, n: any, r: any) {
  let i = r?.showGridLines ?? !0,
    a = isDarkTheme(t) ? darkHeaderSurface(n, t) : (n?.colorsByIndex[0] ?? DEFAULT_EDITOR_BACKGROUND),
    o: any = {
      backgroundColor: a,
      borderBottom: `none`,
      borderRight: `none`,
      boxShadow: i ? gridInsetShadow(t.border) : void 0,
      color: resolveContrastTextColor(null, a, t),
      fontFamily: resolveFontFamilyStack({ scheme: `minor` }, n) ?? `"Segoe UI", Tahoma, Arial, sans-serif`,
      fontSize: `12px`,
      lineHeight: String(lineHeightMultiplier(11)),
      overflow: `hidden`,
      padding: CELL_PADDING,
      textOverflow: `clip`,
      verticalAlign: `bottom`,
      whiteSpace: `nowrap`,
    };
  if (!e) return o;
  let s = e.fill,
    c = !1;
  if (s) {
    let e = resolveFillColor(s, n);
    (e.backgroundColor || e.backgroundImage) &&
      ((c = !0),
      e.backgroundColor,
      e.backgroundColor && (o.backgroundColor = e.backgroundColor),
      e.backgroundImage && (o.backgroundImage = e.backgroundImage));
  }
  let l = e.font,
    u = null,
    d = 11;
  if (l) {
    (l.bold && (o.fontWeight = `bold`),
      l.italic && (o.fontStyle = `italic`),
      l.underline && l.underline !== `none` && (o.textDecoration = `underline`),
      l.strikethrough && (o.textDecoration = `${o.textDecoration ?? ``} line-through`.trim()));
    let e = resolveFontColor(l.color, n);
    (e && ((u = e), (o.color = e)),
      typeof l.size == `number` && l.size !== 11
        ? ((d = l.size), (o.fontSize = `${l.size}pt`))
        : typeof l.size == `number` && (d = l.size));
    let t = resolveFontFamilyStack(l, n);
    t && (o.fontFamily = t);
  }
  if (((o.lineHeight = String(lineHeightMultiplier(d))), isDarkTheme(t) && !o.backgroundImage)) {
    let e = typeof o.backgroundColor == `string` ? o.backgroundColor : a;
    o.color = resolveContrastTextColor(u, e, t);
  } else c || (o.color = resolveContrastTextColor(u, a, t));
  let f = e.alignment;
  if (f) {
    if ((f.horizontal && f.horizontal !== `general` && (o.textAlign = f.horizontal), f.vertical)) {
      let e = { bottom: `bottom`, center: `middle`, top: `top` }[String(f.vertical)];
      e && (o.verticalAlign = e);
    }
    f.wrapText && ((o.whiteSpace = `pre-wrap`), (o.wordBreak = `break-word`));
  }
  let p = e.border;
  if (p) {
    let e = !!(p.right?.style && p.right.style !== `none`),
      r = !!(p.bottom?.style && p.bottom.style !== `none`);
    (i && (e || r) && (o.boxShadow = gridInsetShadow(t.border, { bottom: !r, right: !e }) || void 0),
      p.top?.style && p.top.style !== `none` && (o.borderTop = borderToCssShorthand(p.top, n)),
      p.right?.style && p.right.style !== `none` && (o.borderRight = borderToCssShorthand(p.right, n)),
      p.bottom?.style && p.bottom.style !== `none` && (o.borderBottom = borderToCssShorthand(p.bottom, n)),
      p.left?.style && p.left.style !== `none` && (o.borderLeft = borderToCssShorthand(p.left, n)));
  }
  return o;
}
var measureCanvasSingleton: any = null;
export function verticalPaddingPx(e: any) {
  if (typeof e != `string`) return 8;
  let t = e
    .trim()
    .split(/\s+/)
    .map((e) => Number.parseFloat(e))
    .filter((e) => Number.isFinite(e));
  return t.length === 1
    ? t[0] * 2
    : t.length === 2 || t.length === 3
      ? t[1] * 2
      : t.length >= 4
        ? t[1] + t[3]
        : 8;
}
function styleFontShorthand(e: any) {
  return resolveFontShorthand(e, 12);
}
export function measureCellTextWidth(e: any, t: any) {
  if (!e) return 0;
  if (typeof document > `u`) return e.length * 7;
  measureCanvasSingleton ??= document.createElement(`canvas`);
  let n = measureCanvasSingleton.getContext(`2d`, { alpha: !1 });
  return n ? ((n.font = styleFontShorthand(t)), measureTextWidthCached(n, e)) : e.length * 7;
}
export function estimateCellContentHeight(e: any, t: any, n: any) {
  if (!e) return 0;
  let r = Math.max(1, n - verticalPaddingPx(t.padding)),
    i = resolveLineHeightPx(t, 12),
    a = parseBoxInsets(t.padding),
    o = e.replace(
      /\r\n?/g,
      `
`,
    ).split(`
`).length;
  if (typeof document > `u`) return o * i + a.top + a.bottom;
  measureCanvasSingleton ??= document.createElement(`canvas`);
  let s = measureCanvasSingleton.getContext(`2d`, { alpha: !1 });
  return s
    ? ((s.font = styleFontShorthand(t)), wrapTextToWidth(s, e, r).length * i + a.top + a.bottom)
    : o * i + a.top + a.bottom;
}
export function canOverflowRight(e: any) {
  if (!e.value || e.isMergedSecondary || e.shrinkToFit || e.style.whiteSpace === `pre-wrap`)
    return !1;
  let t = e.style.textAlign;
  return !(t && t !== `left` && t !== `start` && t !== `center`);
}
export function isRenderableEmptyCell(e: any) {
  return !e.isMergedSecondary && !e.colSpan && e.value.length === 0;
}
export function resolveCellDisplayText(e: any, t: any, n: any, r: any) {
  let i = e.getFormulaAt(t, n),
    a = i ? r?.cachedFormulaValues?.[formatCellRef({ row: t, col: n })] : void 0,
    o = e.getFormattedValueAt(t, n);
  if (o && !(i && a !== void 0 && o.startsWith(`#`))) return decodeXmlEntities(o);
  let s = e.getCalculatedValueAt(t, n);
  return i && a !== void 0 && s.is_error
    ? a
    : s.is_error
      ? (s.asError() ?? ``)
      : s.is_empty
        ? ``
        : s.toString();
}
export function numericValueAtCell(e: any, t: any, n: any) {
  let r = e.getCalculatedValueAt(t, n);
  if (r.is_number) return r.asNumber() ?? null;
  if (r.is_boolean) return +!!r.asBoolean();
  if (r.is_empty || r.is_error) return null;
  let i = Number(r.asText() ?? r.toString());
  return Number.isFinite(i) ? i : null;
}
export function booleanValueAtCell(e: any, t: any, n: any) {
  let r = e.getCalculatedValueAt(t, n);
  if (r.is_boolean) return r.asBoolean() ?? null;
  if (r.is_number) {
    let e = r.asNumber();
    return e == null ? null : e !== 0;
  }
  let i = (r.asText() ?? r.toString()).trim().toLowerCase();
  return i === `true` ? !0 : i === `false` ? !1 : null;
}
function parseRangeLiteral(e: any) {
  let [t, n = t] = e.split(`:`),
    r = parseCellRef(t ?? ``),
    i = parseCellRef(n ?? ``);
  return r && i ? { end: i, start: r } : null;
}
function unquoteSheetName(e: any) {
  let t = e.trim();
  return t.startsWith(`'`) && t.endsWith(`'`) ? t.slice(1, -1).replace(/''/g, `'`) : t;
}
function splitQualifiedRef(e: any) {
  let t = !1;
  for (let n = 0; n < e.length; n += 1) {
    let r = e[n];
    if (r === `'`) {
      if (t && e[n + 1] === `'`) {
        n += 1;
        continue;
      }
      t = !t;
      continue;
    }
    if (r === `!` && !t) return { range: e.slice(n + 1), sheetName: unquoteSheetName(e.slice(0, n)) };
  }
  return null;
}
function resolveFormulaRangeRef(e: any, t: any, n: any, r: any) {
  let i = e.trim().replace(/^=/, ``);
  if (!i) return null;
  if (!i.includes(`!`) && r)
    try {
      let e = r.getNamedRange(i);
      typeof e == `string` && e.length > 0 && e !== i && (i = e);
    } catch {}
  let a = splitQualifiedRef(i),
    o = parseRangeLiteral((a?.range ?? i).replace(/\$/g, ``));
  if (!o) return null;
  let s = t;
  if (a?.sheetName) {
    let e = r?.sheetIndex(a.sheetName);
    if (typeof e == `number` && Number.isInteger(e) && e >= 0) s = e;
    else {
      let e = n.find((e: any) => e.name === a.sheetName);
      e && (s = e.workbookSheetIndex);
    }
  }
  return { range: normalizeRangeBounds(o), workbookSheetIndex: s };
}
function rangeCellAtOffset(e: any, t: any) {
  let n = normalizeRangeBounds(e),
    r = n.end.row - n.start.row + 1,
    i = n.end.col - n.start.col + 1,
    a = r * i;
  if (t < 0 || t >= a) return null;
  let o = Math.floor(t / i),
    s = t % i,
    c = { col: n.start.col + s, row: n.start.row + o };
  return { start: c, end: c };
}
export function chartSelectionRanges(e: any, t: any, n: any, r: any, i: any) {
  if (!e) return [];
  let a: any[] = [],
    o = new Set(),
    s = t?.chartId === e.id && t.kind !== `chart` ? t.seriesIndex : null,
    c = e.series
      .map((e: any, t: any) => ({ series: e, seriesIndex: t }))
      .filter(({ series: e, seriesIndex: t }: any) => e.hidden !== !0 && (s == null || t === s))
      .flatMap(({ series: e, seriesIndex: t }: any) => [
        {
          formula: typeof e.raw?.name == `string` ? e.raw.name : void 0,
          role: `name`,
          seriesIndex: t,
        },
        { formula: e.categoriesRef?.formula, role: `category`, seriesIndex: t },
        { formula: e.valuesRef?.formula, role: `value`, seriesIndex: t },
        { formula: e.bubbleSizeRef?.formula, role: `bubble`, seriesIndex: t },
      ]);
  return (
    c.forEach((t: any) => {
      if (!t.formula) return;
      let s = resolveFormulaRangeRef(t.formula, e.workbookSheetIndex, n, r);
      if (!s) return;
      let c = [
        s.workbookSheetIndex,
        s.range.start.row,
        s.range.start.col,
        s.range.end.row,
        s.range.end.col,
      ].join(`:`);
      if (o.has(c)) return;
      o.add(c);
      let l = CHART_HIGHLIGHT_ROLE_COLORS[t.role];
      a.push({
        fillColor: colorWithAlpha(l, i ? 0.24 : 0.14),
        range: s.range,
        strokeColor: l,
        workbookSheetIndex: s.workbookSheetIndex,
      });
    }),
    t?.chartId === e.id &&
      t.kind === `point` &&
      c.forEach((o: any) => {
        if (!o.formula || o.role === `name`) return;
        let s = resolveFormulaRangeRef(o.formula, e.workbookSheetIndex, n, r);
        if (!s) return;
        let c = rangeCellAtOffset(s.range, t.pointIndex);
        if (!c) return;
        let l = CHART_HIGHLIGHT_ROLE_COLORS.point;
        a.push({
          fillColor: colorWithAlpha(l, i ? 0.34 : 0.22),
          range: c,
          strokeColor: l,
          workbookSheetIndex: s.workbookSheetIndex,
        });
      }),
    a
  );
}
export function sparklineValueScale(e: any, t: any, n: any) {
  return n <= t ? 0.5 : Math.max(0, Math.min(1, (e - t) / (n - t)));
}
function renderSparklineSvg(e: any, t: any, n: any) {
  let r = t
    .map((e: any, t: any) => ({ index: t, value: e }))
    .filter((e: any) => typeof e.value == `number` && Number.isFinite(e.value));
  if (r.length === 0) return null;
  let i = e.negativeColor ?? `#c2410c`,
    a = e.color ?? `#2563eb`,
    o = e.markerColor ?? a;
  if (e.type === `winLoss`) {
    let e = r.map((e: any) => ({ ...e, value: e.value >= 0 ? 1 : -1 })),
      t = Math.max(4, 98 / Math.max(e.length * 1.9, 1)),
      n = e.length > 1 ? (98 - t * e.length) / (e.length - 1) : 0;
    return (0, jsxRuntime.jsx)(`svg`, {
      "aria-hidden": `true`,
      height: 18,
      style: { display: `block`, overflow: `visible`, width: `100%` },
      viewBox: `0 0 100 18`,
      width: `100%`,
      children: e.map((e: any, r: any) => {
        let i = 1 + r * (t + Math.max(0, n)),
          o = e.value >= 0 ? 4.5 : 13.5;
        return (0, jsxRuntime.jsx)(
          `line`,
          { stroke: a, strokeLinecap: `round`, strokeWidth: 1.8, x1: i, x2: i + t, y1: o, y2: o },
          `spark-winloss-${r}`,
        );
      }),
    });
  }
  if (e.type === `column`) {
    let t = r,
      o = Math.min(0, ...t.map((e: any) => e.value)),
      s = Math.max(0, ...t.map((e: any) => e.value)),
      c = 16 - sparklineValueScale(0, o, s) * 14,
      l = Math.max(2, 98 / Math.max(t.length * 1.8, 1)),
      u = t.length > 1 ? (98 - l * t.length) / (t.length - 1) : 0;
    return (0, jsxRuntime.jsxs)(`svg`, {
      "aria-hidden": `true`,
      height: 18,
      style: { display: `block`, overflow: `visible`, width: `100%` },
      viewBox: `0 0 100 18`,
      width: `100%`,
      children: [
        (0, jsxRuntime.jsx)(`line`, { stroke: n.border, strokeWidth: 1, x1: 1, x2: 99, y1: c, y2: c }),
        t.map((t: any, n: any) => {
          let r = 1 + n * (l + Math.max(0, u)),
            d = 16 - sparklineValueScale(t.value, o, s) * 14,
            f = Math.min(d, c),
            p = Math.max(1, Math.abs(d - c));
          return (0, jsxRuntime.jsx)(
            `rect`,
            {
              fill: t.value < 0 ? i : a,
              height: p,
              rx: e.type === `column` ? 0 : 0.8,
              ry: e.type === `column` ? 0 : 0.8,
              width: l,
              x: r,
              y: f,
            },
            `spark-bar-${n}`,
          );
        }),
      ],
    });
  }
  let s = Math.min(...r.map((e: any) => e.value)),
    c = Math.max(...r.map((e: any) => e.value)),
    l = r.length > 1 ? 98 / (r.length - 1) : 0,
    u = r
      .map((e: any, t: any) => {
        let n = 1 + t * l,
          r = 16 - sparklineValueScale(e.value, s, c) * 14;
        return `${t === 0 ? `M` : `L`} ${n.toFixed(2)} ${r.toFixed(2)}`;
      })
      .join(` `),
    d = Math.max(...r.map((e: any) => e.value)),
    f = Math.min(...r.map((e: any) => e.value));
  return (0, jsxRuntime.jsxs)(`svg`, {
    "aria-hidden": `true`,
    height: 18,
    style: { display: `block`, overflow: `visible`, width: `100%` },
    viewBox: `0 0 100 18`,
    width: `100%`,
    children: [
      (0, jsxRuntime.jsx)(`path`, {
        d: u,
        fill: `none`,
        stroke: a,
        strokeLinecap: `round`,
        strokeLinejoin: `round`,
        strokeWidth: 1.6,
      }),
      e.markers
        ? r.map((t: any, n: any) => {
            let i = 1 + n * l,
              a = 16 - sparklineValueScale(t.value, s, c) * 14,
              u = o;
            return (
              t.value === d && e.highColor
                ? (u = e.highColor)
                : t.value === f && e.lowColor
                  ? (u = e.lowColor)
                  : n === 0 && e.firstColor
                    ? (u = e.firstColor)
                    : n === r.length - 1 && e.lastColor
                      ? (u = e.lastColor)
                      : t.value < 0 && e.negative && e.negativeColor && (u = e.negativeColor),
              (0, jsxRuntime.jsx)(`circle`, { cx: i, cy: a, fill: u, r: 1.75 }, `spark-point-${n}`)
            );
          })
        : null,
    ],
  });
}
export function toNonNegativeInteger(e: any) {
  return typeof e == `number` && Number.isInteger(e) && e >= 0 ? e : null;
}
export function toPlainRecord(e: any) {
  return e && typeof e == `object` && !Array.isArray(e) ? e : null;
}
function parseHyperlinkInfo(e: any) {
  let t = toPlainRecord(e);
  return t
    ? {
        location: typeof t.location == `string` ? t.location : void 0,
        target: typeof t.target == `string` ? t.target : void 0,
        tooltip: typeof t.tooltip == `string` ? t.tooltip : void 0,
      }
    : null;
}
function parseMergeSpan(e: any) {
  let t = toPlainRecord(e);
  if (!t) return null;
  let n = toNonNegativeInteger(t.rowSpan),
    r = toNonNegativeInteger(t.colSpan);
  return n === null && r === null ? null : { colSpan: r ?? void 0, rowSpan: n ?? void 0 };
}
function resolveDisplayValue(e: any, t: any, n: any, r: any, i: any) {
  let a = typeof e == `string` ? decodeXmlEntities(e) : e == null ? `` : String(e),
    o = t ? i?.cachedFormulaValues?.[formatCellRef({ row: n, col: r })] : void 0;
  return t && o !== void 0 && a.startsWith(`#`) ? o : a;
}
export function buildCellBatchMap(e: any, t: any, n: any, r: any) {
  let i = new Map();
  if (Array.isArray(e))
    for (let n of e) {
      let e = toNonNegativeInteger(n.index);
      if (!(e === null || !Array.isArray(n.cells)))
        for (let r of n.cells) {
          let n = toNonNegativeInteger(r.col);
          if (n === null) continue;
          let a = typeof r.formula == `string` ? r.formula : null;
          i.set(`${e}:${n}`, {
            formula: a,
            hyperlink: parseHyperlinkInfo(r.hyperlink),
            isMergedSecondary: r.isMergedSecondary === !0,
            mergeSpan: parseMergeSpan(r.mergeSpan),
            style: toPlainRecord(r.style),
            value: resolveDisplayValue(r.value, a, e, n, t),
          });
        }
    }
  return { cells: i, endRow: r, startRow: n };
}
export function findRangeContaining(e: any, t: any, n: any) {
  return (
    e.find((e: any) => t >= e.start.row && t <= e.end.row && n >= e.start.col && n <= e.end.col) ?? null
  );
}
export function mergeCellStyles(e: any, t: any, n?: any) {
  if (!e && !t) return null;
  let r = { ...(e ?? {}), ...(t ?? {}) },
    i = e?.alignment,
    a = t?.alignment;
  (i || a) && (r.alignment = { ...(i ?? {}), ...(a ?? {}) });
  let o: any = e?.border,
    s = t?.border;
  (o || s) && (r.border = n?.replaceXfSubtrees && s ? s : { ...(o ?? {}), ...(s ?? {}) });
  let c = e?.fill,
    l = t?.fill;
  (c || l) && (r.fill = n?.replaceXfSubtrees && l ? l : (l ?? c));
  let u = e?.font,
    d = t?.font;
  return ((u || d) && (r.font = n?.replaceXfSubtrees && d ? d : { ...(u ?? {}), ...(d ?? {}) }), r);
}
function expandTableBorderSpans(e: any, t: any, n: any, r: any) {
  if (!e) return null;
  let i = e.border;
  if (!i) return e;
  let a = { ...i };
  return (
    a.horizontal && (n < t.end.row && (a.bottom = a.bottom ?? a.horizontal), delete a.horizontal),
    a.vertical && (r < t.end.col && (a.right = a.right ?? a.vertical), delete a.vertical),
    { ...e, border: a }
  );
}
export function resolveTableCellStyle(e: any, t: any, n: any, r: any) {
  if (!e || !r) return null;
  let i = e.styleInfo?.name;
  if (!i) return null;
  let a = r.tableStyleByName[i];
  if (!a) return null;
  let o: any = null,
    s = (r: any, i = !0) => {
      if (!i) return;
      let s = expandTableBorderSpans(a[r] ?? null, e, t, n);
      s && (o = mergeCellStyles(o, s));
    };
  (s(`wholeTable`),
    s(`firstColumn`, !!e.styleInfo?.showFirstColumn && n === e.start.col),
    s(`lastColumn`, !!e.styleInfo?.showLastColumn && n === e.end.col));
  let c = Math.max(e.headerRowCount, 1),
    l = t >= e.start.row && t < e.start.row + c;
  if ((s(`headerRow`, l), l && e.headerRowCellStyle)) {
    let t = r.namedCellStyleByName[e.headerRowCellStyle];
    t && (o = mergeCellStyles(o, t));
  }
  if (e.totalsRowShown) {
    let n = Math.max(e.totalsRowCount, 1);
    s(`totalRow`, t > e.end.row - n);
  }
  return o;
}
export function tableColumnAtHeader(e: any, t: any, n: any) {
  if (!e || t !== e.start.row) return null;
  let r = n - e.start.col;
  return e.columns[r] ?? null;
}
export function SortDirectionMenu({ direction: e, sortAscending: t, sortDescending: n }: any) {
  return (0, jsxRuntime.jsxs)(`div`, {
    style: {
      backgroundColor: `var(--xlsx-menu-surface)`,
      border: `1px solid var(--xlsx-menu-border)`,
      borderRadius: 10,
      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.16)`,
      display: `grid`,
      gap: 4,
      minWidth: 160,
      padding: 6,
    },
    children: [
      (0, jsxRuntime.jsx)(`button`, {
        onClick: t,
        style: {
          background: e === `ascending` ? `var(--xlsx-menu-active)` : `transparent`,
          border: `none`,
          borderRadius: 8,
          color: `inherit`,
          cursor: `pointer`,
          fontSize: 12,
          padding: `8px 10px`,
          textAlign: `left`,
        },
        type: `button`,
        children: `Sort A to Z`,
      }),
      (0, jsxRuntime.jsx)(`button`, {
        onClick: n,
        style: {
          background: e === `descending` ? `var(--xlsx-menu-active)` : `transparent`,
          border: `none`,
          borderRadius: 8,
          color: `inherit`,
          cursor: `pointer`,
          fontSize: 12,
          padding: `8px 10px`,
          textAlign: `left`,
        },
        type: `button`,
        children: `Sort Z to A`,
      }),
    ],
  });
}
export function headerFilterButtonStyle(e: any, t: any) {
  return {
    alignItems: `center`,
    background: `transparent`,
    border: `none`,
    color: e.mutedText,
    cursor: `pointer`,
    display: `inline-flex`,
    fontSize: 10 * t,
    height: 16 * t,
    justifyContent: `center`,
    padding: 0,
    position: `absolute`,
    right: 4 * t,
    top: 3 * t,
    width: 16 * t,
    zIndex: 6,
  };
}
function WorkbookSheetTabStrip({ items: e, onValueChange: t, palette: n, value: r }: any) {
  return (0, jsxRuntime.jsx)(`div`, {
    "aria-label": `Workbook sheets`,
    role: `tablist`,
    style: {
      alignItems: `center`,
      backgroundColor: n.sheetInactiveSurface,
      border: `1px solid ${n.strongBorder}`,
      borderRadius: 10,
      display: `inline-flex`,
      gap: 2,
      minHeight: 36,
      padding: 2,
    },
    children: e.map((e: any) => {
      let i = e.id === r,
        a = e.visibility === `hidden` || e.visibility === `veryHidden`;
      return (0, jsxRuntime.jsx)(
        `button`,
        {
          "aria-selected": i,
          onClick: () => t(e.id),
          role: `tab`,
          style: {
            backgroundColor: i ? n.sheetActiveSurface : `transparent`,
            border: `none`,
            borderRadius: 8,
            boxShadow: i ? n.shadow : `none`,
            color: i ? n.sheetActiveText : n.sheetInactiveText,
            cursor: `pointer`,
            fontSize: 12,
            fontWeight: i ? 600 : 500,
            opacity: a && !i ? 0.68 : 1,
            padding: `7px 12px`,
            transition: `background-color 120ms ease, color 120ms ease, box-shadow 120ms ease`,
            whiteSpace: `nowrap`,
          },
          title: e.title,
          type: `button`,
          children: e.label,
        },
        e.id,
      );
    }),
  });
}
function SpreadsheetToolbar({ controller: e, palette: t }: any) {
  let {
    activeTabIndex: n,
    canDownload: r,
    canZoomIn: i,
    canZoomOut: a,
    defaultZoomScale: o,
    displayFileName: s,
    download: c,
    resetZoom: l,
    setActiveTabIndex: u,
    tabs: d,
    zoomIn: f,
    zoomOut: p,
    zoomScale: m,
  } = e;
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsxs)(`div`, {
        style: {
          alignItems: `center`,
          backgroundColor: t.toolbarSurface,
          borderBottom: `1px solid ${t.border}`,
          color: t.text,
          display: `flex`,
          gap: 12,
          justifyContent: `space-between`,
          minHeight: 48,
          padding: `0 16px`,
        },
        children: [
          (0, jsxRuntime.jsx)(`div`, {
            style: { minWidth: 0 },
            children: (0, jsxRuntime.jsx)(`div`, {
              style: {
                color: t.text,
                fontSize: 14,
                fontWeight: 600,
                overflow: `hidden`,
                textOverflow: `ellipsis`,
                whiteSpace: `nowrap`,
              },
              children: s,
            }),
          }),
          (0, jsxRuntime.jsxs)(`div`, {
            style: { alignItems: `center`, display: `flex`, gap: 8 },
            children: [
              (0, jsxRuntime.jsxs)(`div`, {
                style: {
                  alignItems: `center`,
                  background: t.buttonSurface,
                  border: `1px solid ${t.strongBorder}`,
                  borderRadius: 8,
                  display: `flex`,
                  overflow: `hidden`,
                },
                children: [
                  (0, jsxRuntime.jsx)(`button`, {
                    disabled: !a,
                    onClick: p,
                    style: {
                      background: `transparent`,
                      border: `none`,
                      color: a ? t.buttonText : t.mutedText,
                      cursor: a ? `pointer` : `default`,
                      fontSize: 14,
                      fontWeight: 600,
                      padding: `6px 10px`,
                    },
                    type: `button`,
                    children: `-`,
                  }),
                  (0, jsxRuntime.jsx)(`button`, {
                    onClick: l,
                    style: {
                      background: Math.round(m) === Math.round(o) ? `transparent` : t.subtleSurface,
                      border: `none`,
                      borderLeft: `1px solid ${t.strongBorder}`,
                      borderRight: `1px solid ${t.strongBorder}`,
                      color: t.buttonText,
                      cursor: `pointer`,
                      fontSize: 12,
                      fontWeight: 600,
                      minWidth: 60,
                      padding: `6px 10px`,
                    },
                    type: `button`,
                    children: formatZoomPercent(m),
                  }),
                  (0, jsxRuntime.jsx)(`button`, {
                    disabled: !i,
                    onClick: f,
                    style: {
                      background: `transparent`,
                      border: `none`,
                      color: i ? t.buttonText : t.mutedText,
                      cursor: i ? `pointer` : `default`,
                      fontSize: 14,
                      fontWeight: 600,
                      padding: `6px 10px`,
                    },
                    type: `button`,
                    children: `+`,
                  }),
                ],
              }),
              r
                ? (0, jsxRuntime.jsx)(`button`, {
                    "aria-label": `Download workbook`,
                    onClick: c,
                    style: {
                      alignItems: `center`,
                      background: t.buttonSurface,
                      border: `1px solid ${t.strongBorder}`,
                      borderRadius: 8,
                      color: t.buttonText,
                      cursor: `pointer`,
                      display: `inline-flex`,
                      fontSize: 16,
                      fontWeight: 500,
                      height: 32,
                      justifyContent: `center`,
                      padding: 0,
                      width: 32,
                    },
                    title: `Download workbook`,
                    type: `button`,
                    children: `↓`,
                  })
                : null,
            ],
          }),
        ],
      }),
      d.length > 1
        ? (0, jsxRuntime.jsx)(`div`, {
            style: {
              backgroundColor: t.subtleSurface,
              borderBottom: `1px solid ${t.border}`,
              overflowX: `auto`,
              padding: `8px 12px`,
            },
            children: (0, jsxRuntime.jsx)(WorkbookSheetTabStrip, {
              items: d.map((e: any, t: any) => ({
                id: String(t),
                label: e.name,
                title:
                  e.visibility === `hidden`
                    ? `${e.name} (hidden)`
                    : e.visibility === `veryHidden`
                      ? `${e.name} (very hidden)`
                      : e.name,
                visibility: e.visibility,
              })),
              onValueChange: (e: any) => u(Number(e)),
              palette: t,
              value: String(n),
            }),
          })
        : null,
    ],
  });
}
export function resolveToolbarNode(e: any, t: any, n: any, r: any) {
  return typeof e == `function`
    ? e(n)
    : e === void 0
      ? t
        ? (0, jsxRuntime.jsx)(SpreadsheetToolbar, { controller: n, palette: r })
        : null
      : e;
}
export function resolveErrorNode(e: any, t: any, n: any) {
  return typeof e == `function`
    ? e(t)
    : e === void 0
      ? (0, jsxRuntime.jsx)(`div`, {
          style: {
            alignItems: `center`,
            color: n.danger,
            display: `flex`,
            fontSize: 14,
            height: `100%`,
            justifyContent: `center`,
            padding: 16,
            textAlign: `center`,
          },
          children: t.message,
        })
      : e;
}
export function resolveLoadingNode(e: any, t: any, n: any) {
  return e === void 0
    ? t === void 0
      ? (0, jsxRuntime.jsx)(`div`, {
          style: {
            alignItems: `center`,
            color: n.mutedText,
            display: `flex`,
            fontSize: 14,
            height: `100%`,
            justifyContent: `center`,
          },
          children: `Loading workbook...`,
        })
      : t
    : e;
}
export function resolveEmptyNode(e: any, t: any) {
  return e === void 0
    ? (0, jsxRuntime.jsx)(`div`, {
        style: {
          alignItems: `center`,
          color: t.mutedText,
          display: `flex`,
          fontSize: 14,
          height: `100%`,
          justifyContent: `center`,
          padding: 16,
          textAlign: `center`,
        },
        children: `No workbook loaded.`,
      })
    : e;
}
function formatByteSize(e: any) {
  if (!Number.isFinite(e) || e <= 0) return `0 B`;
  let t = [`B`, `KB`, `MB`, `GB`],
    n = e,
    r = 0;
  for (; n >= 1024 && r < t.length - 1;) ((n /= 1024), (r += 1));
  return `${n >= 10 || r === 0 ? n.toFixed(0) : n.toFixed(1)} ${t[r]}`;
}
export function renderFileSizeLimitState(e: any, t: any, n: any) {
  let r = (0, jsxRuntime.jsxs)(`div`, {
    style: {
      alignItems: `center`,
      color: n.mutedText,
      display: `flex`,
      flexDirection: `column`,
      fontSize: 14,
      gap: 8,
      height: `100%`,
      justifyContent: `center`,
      padding: 24,
      textAlign: `center`,
    },
    children: [
      (0, jsxRuntime.jsx)(`div`, { style: { color: n.text, fontWeight: 600 }, children: t.displayFileName }),
      (0, jsxRuntime.jsxs)(`div`, {
        children: [
          `File size `,
          formatByteSize(t.fileSizeBytes),
          ` exceeds the configured limit of`,
          ` `,
          formatByteSize(t.maxFileSizeBytes),
          `.`,
        ],
      }),
    ],
  });
  return typeof e == `function`
    ? e({
        defaultNode: r,
        displayFileName: t.displayFileName,
        fileSizeBytes: t.fileSizeBytes,
        maxFileSizeBytes: t.maxFileSizeBytes,
      })
    : e === void 0
      ? r
      : e;
}
export function resolveFileTooLargeNode(e: any, t: any, n: any) {
  if (e !== void 0) return renderFileSizeLimitState(e, t, n);
}
function ChartLoadingBars(e: any) {
  let t = [18, 32, 24],
    n = Math.max(8, Math.min(12, Math.round(e.width * 0.018)));
  return (0, jsxRuntime.jsx)(`div`, {
    style: {
      backgroundColor: `#ffffff`,
      border: `1px solid #e5e7eb`,
      borderRadius: 10,
      boxSizing: `border-box`,
      display: `flex`,
      height: `100%`,
      justifyContent: `center`,
      padding: 12,
      width: `100%`,
    },
    children: (0, jsxRuntime.jsx)(`div`, {
      style: { alignItems: `flex-end`, display: `flex`, gap: 8, justifyContent: `center` },
      children: t.map((e, t) =>
        (0, jsxRuntime.jsx)(
          `div`,
          { style: { backgroundColor: `#e5e7eb`, borderRadius: 999, height: e, width: n } },
          t,
        ),
      ),
    }),
  });
}
export function resolveChartLoadingNode(e: any, t: any, n: any) {
  let r = ChartLoadingBars(n);
  return e ? e({ chart: t, defaultNode: r, rect: n }) : r;
}
function formatByteSizeAlias(e: any) {
  if (!Number.isFinite(e) || e <= 0) return `0 B`;
  let t = [`B`, `KB`, `MB`, `GB`],
    n = e,
    r = 0;
  for (; n >= 1024 && r < t.length - 1;) ((n /= 1024), (r += 1));
  return `${n >= 10 || r === 0 ? n.toFixed(0) : n.toFixed(1)} ${t[r]}`;
}
export function DeferredLoadPrompt(e: any, t: any) {
  return (0, jsxRuntime.jsx)(`div`, {
    style: {
      alignItems: `center`,
      color: t.text,
      display: `flex`,
      height: `100%`,
      justifyContent: `center`,
      padding: 24,
    },
    children: (0, jsxRuntime.jsxs)(`div`, {
      style: {
        backgroundColor: t.surface,
        border: `1px solid ${t.strongBorder}`,
        borderRadius: 12,
        boxShadow: t.shadow,
        maxWidth: 420,
        padding: 20,
        width: `100%`,
      },
      children: [
        (0, jsxRuntime.jsx)(`div`, {
          style: { fontSize: 16, fontWeight: 600 },
          children: `Large workbook detected`,
        }),
        (0, jsxRuntime.jsxs)(`div`, {
          style: { color: t.mutedText, fontSize: 13, lineHeight: 1.5, marginTop: 8 },
          children: [
            `This workbook is `,
            formatByteSizeAlias(e.deferredLoadFileSize ?? 0),
            `. Loading it immediately can block the main thread and freeze the page.`,
          ],
        }),
        (0, jsxRuntime.jsx)(`div`, {
          style: { color: t.mutedText, fontSize: 13, lineHeight: 1.5, marginTop: 8 },
          children: `Best practice is to gate large files or move parsing into a worker. You can still load it manually below.`,
        }),
        (0, jsxRuntime.jsx)(`div`, {
          style: { display: `flex`, gap: 10, marginTop: 16 },
          children: (0, jsxRuntime.jsx)(`button`, {
            onClick: e.continueDeferredLoad,
            style: {
              background: t.buttonSurface,
              border: `1px solid ${t.strongBorder}`,
              borderRadius: 8,
              color: t.buttonText,
              cursor: e.canLoadDeferred ? `pointer` : `default`,
              fontSize: 12,
              fontWeight: 600,
              opacity: e.canLoadDeferred ? 1 : 0.6,
              padding: `8px 12px`,
            },
            type: `button`,
            children: `Load Anyway`,
          }),
        }),
      ],
    }),
  });
}
export function resolveSelectionPalette({ palette: e, selectionColor: t, selectionFillColor: n, selectionHeaderColor: r }: any) {
  let i = t ?? (isDarkTheme(e) ? `#60a5fa` : `#2563eb`);
  return {
    fill: n ?? `color-mix(in srgb, ${i} ${isDarkTheme(e) ? `16%` : `10%`}, transparent)`,
    header: r ?? `color-mix(in srgb, ${i} ${isDarkTheme(e) ? `24%` : `16%`}, ${e.headerSurface})`,
    stroke: i,
  };
}
export function fullBleedRects(e: any, t: any) {
  return e <= 0 || t <= 0 ? [] : [{ height: t, left: 0, top: 0, width: e }];
}
export function rectIntersectsAnyRect(e: any, t: any, n: any, r: any, i: any) {
  if (i.length === 0 || n <= 0 || r <= 0) return !1;
  let a = e + n,
    o = t + r;
  return i.some((n: any) => e < n.left + n.width && a > n.left && t < n.top + n.height && o > n.top);
}
export function blitScrolledCanvas(e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any) {
  if (i <= 0 || a <= 0) return [];
  let c = Math.max(-i, Math.min(i, o)),
    l = Math.max(-a, Math.min(a, s));
  if (Math.abs(c) < 0.01 && Math.abs(l) < 0.01) return [];
  if (Math.abs(c) >= i || Math.abs(l) >= a) return null;
  let u = Math.max(1, Math.round(i * r)),
    d = Math.max(1, Math.round(a * r));
  (n.width !== u && (n.width = u), n.height !== d && (n.height = d));
  let f = n.getContext(`2d`, { alpha: !1 });
  if (!f) return null;
  (f.setTransform(1, 0, 0, 1, 0, 0), f.clearRect(0, 0, u, d), f.drawImage(e, 0, 0));
  let p = c * r,
    m = l * r,
    h = u - Math.abs(p),
    g = d - Math.abs(m);
  if (h <= 0 || g <= 0) return null;
  let _ = p > 0 ? p : 0,
    v = m > 0 ? m : 0,
    y = p > 0 ? 0 : -p,
    b = m > 0 ? 0 : -m;
  (t.setTransform(1, 0, 0, 1, 0, 0),
    t.drawImage(n, _, v, h, g, y, b, h, g),
    t.setTransform(r, 0, 0, r, 0, 0));
  let x = [];
  return (
    c > 0
      ? x.push({ height: a, left: Math.max(0, i - c), top: 0, width: Math.min(i, c) })
      : c < 0 && x.push({ height: a, left: 0, top: 0, width: Math.min(i, -c) }),
    l > 0
      ? x.push({ height: Math.min(a, l), left: 0, top: Math.max(0, a - l), width: i })
      : l < 0 && x.push({ height: Math.min(a, -l), left: 0, top: 0, width: i }),
    x
  );
}
function conditionalRuleKey(e: any) {
  return `${e.kind}:${e.priority}:${e.ranges.map((e: any) => `${e.start.row}:${e.start.col}-${e.end.row}:${e.end.col}`).join(`|`)}`;
}
function resolveCfvoThreshold(e: any, t: any) {
  if (!e) return null;
  let n = typeof e.value == `number` ? e.value : null;
  if (e.type === `num` || e.type === `formula` || t.length === 0) return n;
  let r = Math.min(...t),
    i = Math.max(...t);
  return e.type === `min`
    ? r
    : e.type === `max`
      ? i
      : (e.type === `percent` || e.type === `percentile`) && n !== null
        ? r + (i - r) * (n / 100)
        : n;
}
function iconSetAppearanceFor(e: any, t: any) {
  switch (e) {
    case `NoIcons`:
      return null;
    case `4TrafficLights`: {
      let e = [
        { backgroundColor: `#111827`, borderColor: `#6b7280` },
        { backgroundColor: `#22c55e`, borderColor: `#166534` },
        { backgroundColor: `#ef4444`, borderColor: `#991b1b` },
        { backgroundColor: `#facc15`, borderColor: `#a16207` },
      ];
      return e[t] ?? e[e.length - 1] ?? null;
    }
    case `3TrafficLights1`:
    case `3TrafficLights2`: {
      let n = [
        {
          backgroundColor: `#22c55e`,
          borderColor: e === `3TrafficLights2` ? `#111827` : `#166534`,
        },
        {
          backgroundColor: `#facc15`,
          borderColor: e === `3TrafficLights2` ? `#111827` : `#a16207`,
        },
        {
          backgroundColor: `#ef4444`,
          borderColor: e === `3TrafficLights2` ? `#111827` : `#991b1b`,
        },
      ];
      return n[t] ?? n[n.length - 1] ?? null;
    }
    case `4RedToBlack`: {
      let e = [
        { backgroundColor: `#ef4444`, borderColor: `#991b1b` },
        { backgroundColor: `#fca5a5`, borderColor: `#b91c1c` },
        { backgroundColor: `#9ca3af`, borderColor: `#4b5563` },
        { backgroundColor: `#111827`, borderColor: `#6b7280` },
      ];
      return e[t] ?? e[e.length - 1] ?? null;
    }
    case `3Symbols`:
      return (
        [
          { backgroundColor: `#22c55e`, color: `#ffffff`, glyph: `✓` },
          { backgroundColor: `#facc15`, color: `#111827`, glyph: `!` },
          { backgroundColor: `#ef4444`, color: `#ffffff`, glyph: `×` },
        ][t] ?? null
      );
    case `3Symbols2`:
      return (
        [
          { color: `#16a34a`, glyph: `✓` },
          { color: `#ca8a04`, glyph: `!` },
          { color: `#dc2626`, glyph: `×` },
        ][t] ?? null
      );
    case `3Signs`:
      return (
        [
          { backgroundColor: `#22c55e`, borderColor: `#166534` },
          { backgroundColor: `#facc15`, borderColor: `#a16207`, glyph: `▲`, color: `#111827` },
          { backgroundColor: `#ef4444`, borderColor: `#991b1b`, glyph: `◆`, color: `#ffffff` },
        ][t] ?? null
      );
    default:
      if (e.includes(`Arrows`)) {
        let n = e.includes(`Gray`)
            ? [`#9ca3af`, `#9ca3af`, `#9ca3af`, `#9ca3af`, `#9ca3af`]
            : [`#16a34a`, `#ca8a04`, `#ca8a04`, `#ca8a04`, `#dc2626`],
          r = e.startsWith(`3`)
            ? [-90, 0, 90]
            : e.startsWith(`4`)
              ? [-90, -35, 35, 90]
              : [-90, -35, 0, 35, 90],
          i = Math.min(t, n.length - 1, r.length - 1);
        return {
          borderColor: e.includes(`Gray`) ? `#6b7280` : darkenHex(n[i] ?? `#16a34a`, 0.34),
          color: n[i],
          rotationDeg: r[i] ?? 0,
          shape: `arrow`,
        };
      }
      return { backgroundColor: `#111827`, borderColor: `#6b7280` };
  }
}
function renderConditionalIconSvg(e: any, t: any = 1) {
  let n = 14 * t;
  if (e.shape === `arrow`) {
    let t = e.color ?? `#111827`,
      r = e.borderColor ?? darkenHex(t, 0.32);
    return (0, jsxRuntime.jsx)(`svg`, {
      "aria-hidden": `true`,
      height: n,
      style: { display: `block` },
      viewBox: `0 0 16 16`,
      width: n,
      children: (0, jsxRuntime.jsx)(`g`, {
        transform: `rotate(${e.rotationDeg ?? 0} 8 8)`,
        children: (0, jsxRuntime.jsx)(`path`, {
          d: `M2.5 8 L8.4 2.4 L8.4 5.2 L13.5 5.2 L13.5 10.8 L8.4 10.8 L8.4 13.6 Z`,
          fill: t,
          stroke: r,
          strokeLinejoin: `round`,
          strokeWidth: 1.25,
        }),
      }),
    });
  }
  return e.glyph
    ? (0, jsxRuntime.jsx)(`span`, {
        style: {
          alignItems: `center`,
          color: e.color ?? `#111827`,
          display: `inline-flex`,
          fontSize: 13 * t,
          fontWeight: 700,
          height: n,
          justifyContent: `center`,
          lineHeight: 1,
          width: n,
        },
        children: e.glyph,
      })
    : (0, jsxRuntime.jsx)(`span`, {
        style: {
          backgroundColor: e.backgroundColor ?? `#111827`,
          border: e.borderColor ? `1px solid ${e.borderColor}` : `none`,
          borderRadius: `999px`,
          display: `inline-block`,
          height: 12 * t,
          width: 12 * t,
        },
      });
}
export function isCheckboxChecked(e: any) {
  return e.state ? e.state === `checked` : !!e.checked;
}
export function isCheckboxMixed(e: any) {
  return e.state === `mixed`;
}
export function normalizeFormControlModel(e: any) {
  switch (e.kind) {
    case `button`:
      return { caption: e.caption ?? e.label ?? ``, kind: `button` };
    case `checkbox`:
      return {
        caption: e.caption ?? e.label ?? ``,
        cellLink: e.linkedCell,
        kind: `checkbox`,
        no3D: e.no3D ?? !1,
        state: e.state ?? (e.checked ? `checked` : `unchecked`),
      };
    case `radio`:
      return {
        caption: e.caption ?? e.label ?? ``,
        cellLink: e.linkedCell,
        kind: `optionButton`,
        no3D: e.no3D ?? !1,
        state: e.state === `checked` ? `checked` : `unchecked`,
      };
    case `label`:
      return { caption: e.caption ?? e.label ?? ``, kind: `label` };
    case `group-box`:
      return { caption: e.caption ?? e.label ?? ``, kind: `groupBox`, no3D: e.no3D ?? !1 };
    case `listbox`:
      return {
        cellLink: e.linkedCell,
        inputRange: e.inputRange,
        kind: `listBox`,
        no3D: e.no3D ?? !1,
        selected: Array.isArray(e.selected)
          ? e.selected
          : e.selected === void 0
            ? []
            : [e.selected],
        selection: e.selection ?? `single`,
      };
    case `dropdown`:
      return {
        cellLink: e.linkedCell,
        inputRange: e.inputRange,
        kind: `dropdown`,
        lines: e.lines ?? 8,
        no3D: e.no3D ?? !1,
        selected: typeof e.selected == `number` ? e.selected : void 0,
      };
    case `scrollbar`:
      return {
        cellLink: e.linkedCell,
        horizontal: e.horizontal ?? !0,
        increment: e.increment ?? 1,
        kind: `scrollbar`,
        max: e.max ?? 100,
        min: e.min ?? 0,
        page: e.page ?? 10,
        value: e.value ?? e.min ?? 0,
      };
    case `spinner`:
      return {
        cellLink: e.linkedCell,
        increment: e.increment ?? 1,
        kind: `spinner`,
        max: e.max ?? 100,
        min: e.min ?? 0,
        value: e.value ?? e.min ?? 0,
      };
    default:
      return null;
  }
}
export function renderCheckboxIcon(e: any, t: any, n: any = 1, r: any = !1) {
  let i = isDarkTheme(t) ? `#cbd5e1` : `#475569`,
    a = e || r ? (isDarkTheme(t) ? `#60a5fa` : `#2563eb`) : `transparent`,
    o = isDarkTheme(t) ? `#020617` : `#ffffff`;
  return (0, jsxRuntime.jsxs)(`svg`, {
    "aria-hidden": `true`,
    height: 14 * n,
    style: { display: `block` },
    viewBox: `0 0 16 16`,
    width: 14 * n,
    children: [
      (0, jsxRuntime.jsx)(`rect`, {
        fill: a,
        height: 11,
        rx: 2,
        ry: 2,
        stroke: i,
        strokeWidth: 1.2,
        width: 11,
        x: 2.5,
        y: 2.5,
      }),
      r
        ? (0, jsxRuntime.jsx)(`path`, {
            d: `M5 8h6`,
            fill: `none`,
            stroke: o,
            strokeLinecap: `round`,
            strokeWidth: 1.8,
          })
        : e
          ? (0, jsxRuntime.jsx)(`path`, {
              d: `M5 8.1 7.1 10.2 11.3 5.8`,
              fill: `none`,
              stroke: o,
              strokeLinecap: `round`,
              strokeLinejoin: `round`,
              strokeWidth: 1.8,
            })
          : null,
    ],
  });
}
export function renderRadioIcon(e: any, t: any, n: any = 1) {
  let r = isDarkTheme(t) ? `#cbd5e1` : `#475569`,
    i = isDarkTheme(t) ? `#60a5fa` : `#2563eb`;
  return (0, jsxRuntime.jsxs)(`svg`, {
    "aria-hidden": `true`,
    height: 14 * n,
    style: { display: `block` },
    viewBox: `0 0 16 16`,
    width: 14 * n,
    children: [
      (0, jsxRuntime.jsx)(`circle`, {
        cx: 8,
        cy: 8,
        fill: `transparent`,
        r: 5.5,
        stroke: r,
        strokeWidth: 1.2,
      }),
      e ? (0, jsxRuntime.jsx)(`circle`, { cx: 8, cy: 8, fill: i, r: 2.75 }) : null,
    ],
  });
}
export function cleanFormControlCaption(e: any) {
  let t = e.label ?? e.name;
  if (!t) return ``;
  let n = t
    .replace(/\u00a0/g, ` `)
    .replace(/\s+/g, ` `)
    .trim()
    .toLowerCase();
  return /^(option button|group box|check box|drop down|dropdown|list box|edit box|scroll bar|spinner|spin button|button)\s+\d+$/.test(
    n,
  )
    ? ``
    : t.replace(/\u00a0/g, ` `).replace(/^\s+/, ``);
}
export function resolveDataBarAppearance(e: any, t: any, n: any, r: any, i: any) {
  let a = (r?.conditionalFormatRules ?? []).find(
    (n: any) => n.kind === `dataBar` && n.ranges.some((n: any) => cellInRange({ row: e, col: t }, n)),
  );
  if (!a) return null;
  let o = numericValueAtCell(n, e, t);
  if (o === null) return null;
  let s = conditionalRuleKey(a),
    c = i.get(s);
  c ||
    ((c = a.ranges.flatMap((e: any) => {
      let t = [];
      for (let r = e.start.row; r <= e.end.row; r += 1)
        for (let i = e.start.col; i <= e.end.col; i += 1) {
          let e = numericValueAtCell(n, r, i);
          e !== null && t.push(e);
        }
      return t;
    })),
    i.set(s, c));
  let l = resolveCfvoThreshold(a.cfvos[0], c),
    u = resolveCfvoThreshold(a.cfvos[a.cfvos.length - 1], c);
  if (l === null || u === null) return null;
  let d = Number.isFinite(a.minLength ?? NaN) ? (a.minLength ?? 0) : 0,
    f = Number.isFinite(a.maxLength ?? NaN) ? (a.maxLength ?? 100) : 100,
    p = u - l,
    m = p === 0 ? +(o >= u) : (o - l) / p,
    h = d + Math.max(0, Math.min(1, m)) * (f - d),
    g = resolveFontColor(a.color, r?.themePalette);
  return !g || h <= 0
    ? null
    : {
        axisColor: resolveFontColor(a.axisColor, r?.themePalette) ?? void 0,
        border: a.border ?? void 0,
        borderColor: resolveFontColor(a.borderColor, r?.themePalette) ?? void 0,
        color: g,
        gradient: a.gradient ?? void 0,
        negativeBorderColor: resolveFontColor(a.negativeBorderColor, r?.themePalette) ?? void 0,
        negativeFillColor: resolveFontColor(a.negativeFillColor, r?.themePalette) ?? void 0,
        widthPercent: h,
      };
}
export function resolveColorScaleAppearance(e: any, t: any, n: any, r: any, i: any) {
  let a = (r?.conditionalFormatRules ?? []).find(
    (n: any) => n.kind === `colorScale` && n.ranges.some((n: any) => cellInRange({ row: e, col: t }, n)),
  );
  if (!a) return null;
  let o = numericValueAtCell(n, e, t);
  if (o === null) return null;
  let s = conditionalRuleKey(a),
    c = i.get(s);
  c ||
    ((c = a.ranges.flatMap((e: any) => {
      let t = [];
      for (let r = e.start.row; r <= e.end.row; r += 1)
        for (let i = e.start.col; i <= e.end.col; i += 1) {
          let e = numericValueAtCell(n, r, i);
          e !== null && t.push(e);
        }
      return t;
    })),
    i.set(s, c));
  let l = a.colors.map((e: any) => resolveFontColor(e, r?.themePalette)).filter((e: any) => typeof e == `string`),
    u = a.cfvos.map((e: any) => resolveCfvoThreshold(e, c)).filter((e: any) => typeof e == `number` && Number.isFinite(e));
  if (l.length < 2 || u.length < 2) return null;
  let d = Math.min(l.length, u.length) - 1,
    f = l[l.length - 1];
  for (let e = 0; e < d; e += 1) {
    let t = u[e] ?? u[0],
      n = u[e + 1] ?? u[u.length - 1];
    if (o <= n || e === d - 1) {
      let r = n === t ? 1 : (o - t) / (n - t);
      f = blendHexColors(l[e] ?? l[0], l[e + 1] ?? l[l.length - 1], Math.max(0, Math.min(1, r)));
      break;
    }
  }
  return { color: f };
}
export function resolveCellIconSet(e: any, t: any, n: any, r: any, i: any) {
  let a = (r?.conditionalFormatRules ?? []).find(
    (n: any) => n.kind === `iconSet` && n.ranges.some((n: any) => cellInRange({ row: e, col: t }, n)),
  );
  if (!a) return null;
  let o = numericValueAtCell(n, e, t);
  if (o === null) return null;
  let s = conditionalRuleKey(a),
    c = i.get(s);
  c ||
    ((c = a.ranges.flatMap((e: any) => {
      let t = [];
      for (let r = e.start.row; r <= e.end.row; r += 1)
        for (let i = e.start.col; i <= e.end.col; i += 1) {
          let e = numericValueAtCell(n, r, i);
          e !== null && t.push(e);
        }
      return t;
    })),
    i.set(s, c));
  let l = a.cfvos.map((e: any) => resolveCfvoThreshold(e, c)),
    u = 0;
  l.forEach((e: any, t: any) => {
    e !== null && o >= e && (u = t);
  });
  let d = a.reverse ? Math.max(0, a.icons.length - 1 - u) : u,
    f = a.icons[Math.min(d, a.icons.length - 1)];
  return f ? iconSetAppearanceFor(f.iconSet, f.iconId) : null;
}
export function resolveCellValidation(e: any, t: any, n: any) {
  let r = n?.dataValidations.find((n: any) => n.ranges.some((n: any) => cellInRange({ row: e, col: t }, n)));
  return r
    ? {
        message: [r.inputMessage, r.errorMessage].filter(
          (e) => typeof e == `string` && e.trim().length > 0,
        ).join(`
`),
        showDropdown: r.showDropdown !== !1,
        validationType: r.validationType,
      }
    : null;
}
function verticalAlignToFlexAlign(e: any) {
  return e === `middle` ? `center` : e === `top` ? `flex-start` : `flex-end`;
}
function horizontalAlignToFlexAlign(e: any) {
  return e === `center` ? `center` : e === `right` || e === `end` ? `flex-end` : `flex-start`;
}
export function nextIndexAtLeast(e: any, t: any) {
  return e.length === 0 ? -1 : t <= 0 ? (e[0] ?? -1) : (e.find((e: any) => e >= t) ?? e[0] ?? -1);
}
export function lastIndexAtMost(e: any, t: any) {
  if (e.length === 0) return -1;
  if (t < 0) return e[e.length - 1] ?? -1;
  for (let n = e.length - 1; n >= 0; --n) {
    let r = e[n];
    if (r !== void 0 && r <= t) return r;
  }
  return e[e.length - 1] ?? -1;
}
function SpreadsheetRow({
  actualRow: e,
  editingCell: t,
  editingValue: n,
  frozenRowHeaderZIndex: r,
  getCellData: i,
  headerLabelLiveScale: a,
  leadingSpacerWidth: o,
  onCellClick: s,
  onCellDoubleClick: c,
  onCellPointerDown: l,
  onEditingBlur: u,
  onEditingCancel: d,
  onEditingCommit: f,
  onEditingNavigate: p,
  onEditingValueChange: m,
  onRowHeaderRef: h,
  onRowPointerDown: g,
  onRowResizePointerDown: _,
  palette: v,
  readOnly: y,
  renderCellAdornment: b,
  rowHeight: x,
  rowHeaderZIndex: S,
  rowHeaderWidth: C,
  stickyLeftByCol: w,
  stickyTop: T,
  trailingSpacerWidth: E,
  visibleCols: D,
  zoomFactor: O,
}: any) {
  let k = `inset -1px 0 0 ${v.border}, inset 0 -1px 0 ${v.border}`;
  return (0, jsxRuntime.jsxs)(`tr`, {
    "data-xlsx-row": e,
    style: { height: x },
    children: [
      (0, jsxRuntime.jsx)(`td`, {
        ref: (t: any) => h(e, t),
        onPointerDown: (t: any) => g(t, e),
        style: {
          backgroundColor: v.rowHeaderSurface,
          borderBottom: `none`,
          borderRight: `none`,
          boxSizing: `border-box`,
          boxShadow: k,
          color: v.headerText,
          fontSize: scaleCssLengths(`11px`, O),
          height: x,
          left: 0,
          maxHeight: x,
          minWidth: C,
          padding: scaleCssLengths(`2px 4px`, O),
          position: `sticky`,
          top: T,
          textAlign: `center`,
          userSelect: `none`,
          width: C,
          zIndex: T === void 0 ? S : r,
        },
        children: (0, jsxRuntime.jsxs)(`div`, {
          style: { position: `relative` },
          children: [
            (0, jsxRuntime.jsx)(`span`, {
              style: {
                display: `inline-block`,
                transform: a === 1 ? void 0 : `scale(${1 / a})`,
                transformOrigin: `center center`,
              },
              children: e + 1,
            }),
            (0, jsxRuntime.jsx)(`div`, {
              onPointerDown: (t: any) => _(t, e, x),
              style: {
                backgroundColor: `transparent`,
                bottom: -8 * O,
                cursor: `row-resize`,
                height: 16 * O,
                left: 0,
                position: `absolute`,
                width: `100%`,
                zIndex: 5,
              },
            }),
          ],
        }),
      }),
      o > 0
        ? (0, jsxRuntime.jsx)(`td`, {
            "aria-hidden": `true`,
            style: { backgroundColor: `transparent`, border: `none`, padding: 0, width: o },
          })
        : null,
      D.map(({ actualCol: r, key: a }: any) => {
        let o = i(e, r);
        if (o.isMergedSecondary) return null;
        let h = { row: e, col: r },
          g = isSameCell(t, h),
          _ = !!(o.spillWidth && o.spillWidth > 0),
          S = b ? b(h) : null,
          C = w.get(r),
          E = S ? 24 : 4,
          D = {
            ...o.style,
            boxSizing: `border-box`,
            cursor: g ? `text` : o.hyperlink ? `pointer` : `cell`,
          };
        (o.rowSpan || ((D.height = x), (D.maxHeight = x)),
          _ && ((D.position = `relative`), (D.zIndex = 2)),
          o.conditionalColorScale && (D.backgroundColor = o.conditionalColorScale.color),
          (o.conditionalColorScale || o.conditionalDataBar || o.conditionalIcon) &&
            (D.position = `relative`),
          o.chartHighlight && (D.position = D.position ?? `relative`),
          o.isTableHeader &&
            ((D.position = `relative`), (D.zIndex = Math.max(Number(D.zIndex ?? 0), 4))),
          T !== void 0 &&
            ((D.position = `sticky`),
            (D.top = T),
            (D.zIndex = Math.max(Number(D.zIndex ?? 0), 28))),
          C !== void 0 &&
            ((D.left = C),
            (D.position = `sticky`),
            (D.zIndex = Math.max(Number(D.zIndex ?? 0), T === void 0 ? 24 : 30))),
          _ &&
            ((D.overflow = `visible`),
            (D.textOverflow = `clip`),
            (D.position = D.position ?? `relative`),
            (D.zIndex = Math.max(Number(D.zIndex ?? 0), T === void 0 ? 6 : 32))),
          g && (D.padding = 0));
        let k: any = {
            alignItems: `stretch`,
            display: `flex`,
            flexDirection: `column`,
            font: `inherit`,
            height: `100%`,
            justifyContent: verticalAlignToFlexAlign(D.verticalAlign),
            maxHeight: o.rowSpan ? void 0 : x,
            minHeight: 0,
            overflow: `hidden`,
            pointerEvents: `none`,
            textAlign: `inherit`,
            textDecoration: `inherit`,
            textOverflow: `inherit`,
            whiteSpace: `inherit`,
            width: `100%`,
            wordBreak: `inherit`,
          },
          A = (S ? 20 : 0) + (o.conditionalIcon ? 18 : 0);
        (o.conditionalDataBar && ((k.position = `relative`), (k.zIndex = 1)),
          o.chartHighlight &&
            ((k.position = k.position ?? `relative`),
            (k.zIndex = Math.max(Number(k.zIndex ?? 0), 1))),
          A > 0 && (k.paddingRight = (A + 4) * O),
          o.conditionalIcon && ((k.position = `relative`), (k.zIndex = 1)),
          (o.sparkline || o.checkboxState !== null) &&
            ((k.alignItems = `center`), (k.justifyContent = `center`)),
          o.textRotationDeg && ((k.alignItems = horizontalAlignToFlexAlign(D.textAlign)), (k.overflow = `visible`)),
          o.shrinkToFitFontSizePx &&
            ((k.fontSize = o.shrinkToFitFontSizePx),
            (k.lineHeight = `${resolveLineHeightPx(o.style, o.shrinkToFitFontSizePx)}px`)));
        let j = o.textRotationDeg
            ? {
                display: `inline-block`,
                maxWidth: `none`,
                transform: `rotate(${o.textRotationDeg}deg)`,
                transformOrigin: `center center`,
                whiteSpace: `nowrap`,
                width: `max-content`,
              }
            : null,
          M = [o.hyperlink?.tooltip, o.validation?.message, o.value].filter(
            (e, t, n) => typeof e == `string` && e.length > 0 && n.indexOf(e) === t,
          ).join(`
`);
        return (0, jsxRuntime.jsxs)(
          `td`,
          {
            "data-xlsx-cell": `${e}:${r}`,
            colSpan: o.colSpan,
            rowSpan: o.rowSpan,
            onDoubleClick: () => {
              y || c(h);
            },
            onClick: () => s(h, o),
            onPointerDown: (e: any) => l(e, h),
            style: D,
            title: M,
            children: [
              o.chartHighlight
                ? (0, jsxRuntime.jsx)(`div`, {
                    "aria-hidden": `true`,
                    style: {
                      backgroundColor: o.chartHighlight.fillColor,
                      borderBottom: o.chartHighlight.borderBottom
                        ? `${Math.max(1, O)}px solid ${o.chartHighlight.strokeColor}`
                        : void 0,
                      borderLeft: o.chartHighlight.borderLeft
                        ? `${Math.max(1, O)}px solid ${o.chartHighlight.strokeColor}`
                        : void 0,
                      borderRight: o.chartHighlight.borderRight
                        ? `${Math.max(1, O)}px solid ${o.chartHighlight.strokeColor}`
                        : void 0,
                      borderTop: o.chartHighlight.borderTop
                        ? `${Math.max(1, O)}px solid ${o.chartHighlight.strokeColor}`
                        : void 0,
                      boxSizing: `border-box`,
                      inset: Math.max(1, O * 0.5),
                      pointerEvents: `none`,
                      position: `absolute`,
                    },
                  })
                : null,
              o.conditionalDataBar
                ? (0, jsxRuntime.jsx)(`div`, {
                    "aria-hidden": `true`,
                    style: {
                      alignItems: `center`,
                      bottom: 4 * O,
                      display: `flex`,
                      left: 4 * O,
                      pointerEvents: `none`,
                      position: `absolute`,
                      right: 4 * O,
                      top: 4 * O,
                      zIndex: 0,
                    },
                    children: (0, jsxRuntime.jsx)(`div`, {
                      style: {
                        background:
                          o.conditionalDataBar.gradient === !1
                            ? o.conditionalDataBar.color
                            : `linear-gradient(90deg, ${lightenHex(o.conditionalDataBar.color, 0.28)} 0%, ${o.conditionalDataBar.color} 100%)`,
                        border:
                          o.conditionalDataBar.border !== !1 && o.conditionalDataBar.borderColor
                            ? `1px solid ${o.conditionalDataBar.borderColor}`
                            : `none`,
                        borderRadius: 2,
                        height: `100%`,
                        opacity: 1,
                        width: `${o.conditionalDataBar.widthPercent}%`,
                      },
                    }),
                  })
                : null,
              S,
              o.conditionalIcon
                ? (0, jsxRuntime.jsx)(`div`, {
                    "aria-hidden": `true`,
                    style: {
                      alignItems: `center`,
                      display: `inline-flex`,
                      justifyContent: `center`,
                      pointerEvents: `none`,
                      position: `absolute`,
                      right: E * O,
                      top: `50%`,
                      transform: `translateY(-50%)`,
                      zIndex: 2,
                    },
                    children: renderConditionalIconSvg(o.conditionalIcon, O),
                  })
                : null,
              g
                ? (0, jsxRuntime.jsx)(`input`, {
                    autoFocus: !0,
                    onBlur: u,
                    onChange: (e: any) => m(e.target.value),
                    onKeyDown: (e: any) => {
                      if ((e.stopPropagation(), e.key === `Enter`)) {
                        (e.preventDefault(), f());
                        return;
                      }
                      if (e.key === `Escape`) {
                        (e.preventDefault(), d());
                        return;
                      }
                      (e.key === `ArrowDown` ||
                        e.key === `ArrowLeft` ||
                        e.key === `ArrowRight` ||
                        e.key === `ArrowUp`) &&
                        (e.preventDefault(), p(e.key, e.currentTarget.value));
                    },
                    style: {
                      backgroundColor: `transparent`,
                      border: 0,
                      color: `inherit`,
                      font: `inherit`,
                      height: `100%`,
                      margin: 0,
                      outline: `none`,
                      padding: scaleCssLengths(CELL_PADDING, O),
                      width: `100%`,
                    },
                    value: n,
                  })
                : _
                  ? (0, jsxRuntime.jsx)(`div`, {
                      style: {
                        maxWidth: o.spillWidth,
                        overflow: `visible`,
                        pointerEvents: `none`,
                        position: `relative`,
                        whiteSpace: `inherit`,
                        width: o.spillWidth,
                      },
                      children: o.value,
                    })
                  : o.sparkline
                    ? (0, jsxRuntime.jsx)(`div`, {
                        style: {
                          alignItems: `center`,
                          display: `flex`,
                          height: `100%`,
                          justifyContent: `center`,
                          pointerEvents: `none`,
                          width: `100%`,
                        },
                        children: renderSparklineSvg(o.sparkline.config, o.sparkline.values, v),
                      })
                    : o.checkboxState == null
                      ? (0, jsxRuntime.jsx)(`div`, {
                          style: k,
                          children: j
                            ? (0, jsxRuntime.jsx)(`span`, { style: j, children: o.value })
                            : o.value,
                        })
                      : (0, jsxRuntime.jsx)(`div`, {
                          style: {
                            alignItems: `center`,
                            display: `flex`,
                            height: `100%`,
                            justifyContent: `center`,
                            pointerEvents: `none`,
                            width: `100%`,
                          },
                          children: renderCheckboxIcon(o.checkboxState, v, O),
                        }),
            ],
          },
          a,
        );
      }),
      E > 0
        ? (0, jsxRuntime.jsx)(`td`, {
            "aria-hidden": `true`,
            style: { backgroundColor: `transparent`, border: `none`, padding: 0, width: E },
          })
        : null,
    ],
  });
}
export var MemoSpreadsheetRow = reactInterop.memo(SpreadsheetRow, (e: any, t: any) => {
  if (
    e.actualRow !== t.actualRow ||
    e.rowHeight !== t.rowHeight ||
    e.headerLabelLiveScale !== t.headerLabelLiveScale ||
    e.palette !== t.palette ||
    e.readOnly !== t.readOnly ||
    e.visibleCols !== t.visibleCols ||
    e.leadingSpacerWidth !== t.leadingSpacerWidth ||
    e.rowHeaderWidth !== t.rowHeaderWidth ||
    e.stickyLeftByCol !== t.stickyLeftByCol ||
    e.stickyTop !== t.stickyTop ||
    e.trailingSpacerWidth !== t.trailingSpacerWidth ||
    e.zoomFactor !== t.zoomFactor ||
    e.getCellData !== t.getCellData ||
    e.onCellClick !== t.onCellClick ||
    e.onCellDoubleClick !== t.onCellDoubleClick ||
    e.onCellPointerDown !== t.onCellPointerDown ||
    e.onEditingBlur !== t.onEditingBlur ||
    e.onEditingCancel !== t.onEditingCancel ||
    e.onEditingCommit !== t.onEditingCommit ||
    e.onEditingNavigate !== t.onEditingNavigate ||
    e.onEditingValueChange !== t.onEditingValueChange ||
    e.onRowHeaderRef !== t.onRowHeaderRef ||
    e.onRowPointerDown !== t.onRowPointerDown ||
    e.onRowResizePointerDown !== t.onRowResizePointerDown ||
    e.renderCellAdornment !== t.renderCellAdornment
  )
    return !1;
  let n = e.editingCell?.row === e.actualRow ? e.editingCell.col : -1;
  return !(
    n !== (t.editingCell?.row === t.actualRow ? t.editingCell.col : -1) ||
    (n !== -1 && e.editingValue !== t.editingValue)
  );
});

/**
 * ============================================================================
 * 符号表（B5-12c；行号 = 主口径 js 行；分级与语义名同 §一映射表）
 * ----------------------------------------------------------------------------
 *  [曲面图色带/几何]
 *   Vu → clampValue (183064) | Hu → parseNumericInput (183067) | Uu → parseSurfaceHexRgb (183077)
 *   Wu → mixSurfaceHexColors (9400) | Gu → lightenSurfaceHex (183095) | Ku → darkenSurfaceHex (183098)
 *   qu → resolveChartPrimaryColor (9409) | Ju → unwrapChartStyleId (183111) | Yu → normalizeHexColorLiteral (183114)
 *   Xu → resolveSeriesAccentColor (9530) | Zu → surfaceStyleTintRamp (183127) | Qu → surfaceStyleRampFor (183132)
 *   $u → isSurfaceStyleApplied (9552) | ed → resolveSurfaceBandTotal (183156) | td → resolveSurfaceBandRamp (183174)
 *   nd → computeSurfaceValueTicks (183183) | rd → surfaceBandColorForValue (183212) | id → surfaceBandColorAlias (183221)
 *   ad → surfaceLineColorsForChart (5425) | od → surfaceLineColorForValue (183231) | sd → hexToRgbaTuple (183240)
 *   cd → surfaceLitRgba (183244) | ld → bilinearInterpolateValue (183247) | ud → normalizeGridU (183250)
 *   dd → normalizeGridV (183253) | fd → surfaceValueElevation (183256) | pd → projectSurfacePoint3d (183259)
 *   md → triangleSurfaceNormal (183271) | hd → withAbsoluteDepth (183284) | gd → withRelativeDepth (183287)
 *   _d → isFlatSurfaceChart (183290) | vd → buildSurfaceGeometry (183301)
 *  [曲面图面板与选择助手]
 *   yd → SurfaceChartPanel (183672) | bd → chartSeriesDataAttrs (183890) | xd → chartSeriesFirstDataAttrs (183898)
 *   Sd → closestChartSeriesElement (10561) | Cd → resolveChartElementTarget (183904) | wd → isChartSeriesSelected (183926)
 *   Td → isChartPointSelected (183929) | Ed → isChartElementSelected (183932) | Dd → renderRectSelectionHandles (183935)
 *   Od → renderSelectionHandles (183947)
 *  [常量族]
 *   xm → DEFAULT_ROW_HEIGHT (17312) | Sm → DEFAULT_COL_WIDTH (189513) | Cm → HEADER_ROW_HEIGHT (189514)
 *   wm → ROW_HEADER_WIDTH (17337) | Tm → RANGE_CLIPBOARD_MIME (189516) | Em → MIN_RENDERED_ROWS (189517)
 *   Dm → MIN_RENDERED_COLS (17355) | Om → ROW_BATCH_SIZE (189519) | km → COL_BATCH_SIZE (189520)
 *   Am → MAX_RENDERED_ROWS (17378) | jm → MAX_RENDERED_COLS (189522) | Mm → ROW_CAPACITY_STEP (189523)
 *   Nm → COL_CAPACITY_STEP (17405) | Pm → ROW_PREFETCH_THRESHOLD (189525) | Fm → COL_PREFETCH_THRESHOLD (189526)
 *   Im → ROW_SCROLL_GROWTH_STEP (17468) | Lm → COL_SCROLL_GROWTH_STEP (189528) | Rm → ROW_SCROLL_PREFETCH_PX (189529)
 *   zm → COL_SCROLL_PREFETCH_PX (18232) | Bm → POINTER_MOVE_TOLERANCE_PX (189531) | Vm → SCROLLBAR_PLACEHOLDER_PX (189532)
 *   Hm → RESIZE_HANDLE_SIZE_PX (18267) | Um → FROZEN_DIVIDER_HIT_TOLERANCE_PX (189534) | Wm → CONTENT_LAYER_MAX_PX (189535)
 *   Gm → VIEWPORT_OVERDRAW_MAX_PX (18531) | Km → SCROLL_SYNC_INVALIDATE_PX (189537) | qm → SCROLL_JUMP_THRESHOLD_PX (189538)
 *   Jm → CONTENT_CULL_MARGIN_PX (18553) | Ym → GESTURE_ZOOM_SETTLE_MS (189540) | Xm → WHEEL_ZOOM_FACTOR (189541)
 *   Zm → WHEEL_LINE_DELTA_PX (18581) | Qm → CHART_HIGHLIGHT_PALETTE (189543) | $m → CHART_HIGHLIGHT_ROLE_COLORS (189544)
 *   eh → DEFAULT_EDITOR_BACKGROUND (18647) | th → MUTED_SLATE_COLOR (189552) | nh → LIGHT_CANVAS_SURFACE (189553)
 *   rh → HANDLE_SHADOW_COLOR (18782) | ih → CELL_PADDING (189555) | ah → RESIZE_HANDLE_DIRECTIONS (189556)
 *   oh → STYLE_INFO_CACHE_CAPACITY (18957) | sh → TEXT_WIDTH_CACHE_CAPACITY (189558) | ch → TRUNCATE_CACHE_CAPACITY (189559)
 *   lh → WRAP_CACHE_CAPACITY (19280) | uh → PATH2D_CACHE_CAPACITY (189561) | dh → EMPTY_VIRTUAL_ITEMS (189562)
 *   fh → RESIZE_CURSOR_BY_DIRECTION (189563) | ph → CSS_LENGTH_PROPERTIES (189573) | mh → STYLE_INFO_CACHE (189578)
 *   hh → TEXT_WIDTH_CACHE (20352) | gh → TRUNCATE_CACHE (189580) | _h → WRAP_CACHE (189581)
 *   vh → PATH2D_CACHE (189582)
 *  [缓存/文本测量/边框]
 *   yh → cachePutEvicting (189583) | bh → roundToQuarterPx (189590) | xh → measureTextWidthCached (189593)
 *   Sh → drawTextDecorations (7966) | Ch → getPath2dCached (189622) | wh → scaleCssLengths (189625)
 *   Th → scaleStyleValues (22492) | Eh → parseLengthNumber (189651) | Dh → parseBoxInsets (189662)
 *   Oh → resolveTextRotationDeg (22527) | kh → resolveFontShorthand (189691) | Ah → fontShorthandAtSize (189702)
 *   jh → parseBorderShorthand (22558) | Mh → borderStyleRank (189725) | Nh → pickStrongerBorder (189728)
 *   Ph → applyLineDashForBorderStyle (189732) | Fh → drawCellBorder (189743) | Ih → truncateTextToWidth (189767)
 *   Lh → resolveFontSizePx (189782) | Rh → resolveLineHeightPx (189793) | zh → resolveTextBaselineY (189814)
 *   Bh → fitTextCharCount (189817) | Vh → wrapTextToWidth (189828)
 *  [样式解析/条件格式绘制]
 *   Hh → resolveCellStyleInfo (189874) | Uh → splitTopLevelSegments (189916) | Wh → parseGradientStops (189937)
 *   Gh → createGradientFill (22827) | Kh → createDataBarFill (190010) | qh → drawConditionalIconGlyph (190015)
 *   Jh → formatZoomPercent (190055) | Yh → clampToBounds (190058) | Xh → normalizeWheelDelta (190061)
 *   Zh → clampPointToRect (190072) | Qh → pointerDistance (190075) | $h → parseHexRgb (190078)
 *   eg → blendHexColors (190088) | tg → lightenHex (190096) | ng → darkenHex (190099)
 *  [上下文]
 *   rg → SpreadsheetControllerContext (190102) | ig → SpreadsheetHeaderThemeContext (190103)
 *  [区域/布局/锚点助手]
 *   ag → joinClassNames (190104) | og → darkHeaderSurface (190107) | sg → resolveHeaderSurfaceColor (190110)
 *   cg → normalizeRangeBounds (23193) | lg → parseCellKey (190119) | ug → isSameCell (190126)
 *   dg → cellInRange (23351) | fg → chartHighlightForCell (190134) | pg → rangesEqual (190150)
 *   mg → isPrintableCharKey (23393) | hg → closestInteractiveElement (190164) | gg → isFocusWithinContainer (190171)
 *   _g → buildPrefixSums (23686) | vg → rangeHasIndex (190180) | yg → expandIndicesAcrossMerges (190184)
 *   bg → rangesFingerprint (23812) | xg → rangeBoundsKey (190212) | Sg → prefixSpanBetween (190217)
 *   Cg → offsetsByIndices (23863) | wg → findSegmentIndexAt (190226) | Tg → clampScrollOffset (190239)
 *   Eg → minContentExtent (190242) | Dg → collectRenderIndices (190245) | Og → resolveRenderCapacity (190259)
 *   kg → offsetBeforeIndex (24262) | Ag → resolveIndexOffset (190268) | jg → resolveAnchorRectPx (190273)
 *   Mg → drawingRectPx (24406) | Ng → imageAnchorMaxCell (190304) | Pg → shapeAnchorMaxCell (190314)
 *   Fg → chartAnchorMaxCell (24568) | Ig → rectsIntersectWithMargin (190334) | Lg → resolveScrollRegionKind (190343)
 *  [形状路径]
 *   Rg → shapeContainerStyle (24825) | zg → clampShapeAdjust (190400) | Bg → resolveShapeAdjust (190403)
 *   Vg → pointsToOutlinePath (24891) | Hg → polarPoint (190412) | Ug → regularPolygonPath (190416)
 *   Wg → starPolygonPath (25436) | Gg → roundedRectPath (190424) | Kg → ellipsePath (190440)
 *   qg → pieWedgePath (25646) | Jg → chordPath (190449) | Yg → plusCrossPath (190455)
 *   Xg → pentagonArrowPath (25726) | Zg → chevronArrowPath (190485) | Qg → notchedArrowPath (190497)
 *   $g → stripedArrowPath (190516) | e_ → leftUpArrowPath (190535) | t_ → bentUpArrowPath (190548)
 *   n_ → uturnArrowPath (190568) | r_ → leftRightUpArrowPath (190585) | i_ → quadArrowPath (190612)
 *   a_ → heartPath (190646) | o_ → lightningBoltPath (190658) | s_ → teardropPath (190669)
 *   c_ → cloudPath (190679) | l_ → rightArrowPath (190695) | u_ → leftArrowPath (190711)
 *   d_ → upArrowPath (190727) | f_ → downArrowPath (190743) | p_ → leftRightArrowPath (190759)
 *   m_ → upDownArrowPath (190777) | h_ → bentArrowPath (190795) | g_ → resolveAutoShapePath (190815)
 *  [形状 SVG/主题/样式 CSS]
 *   __ → resolveShapeSvgPath (26578) | v_ → traceRoundedRectPath (191054) | y_ → applyDashPattern (191068)
 *   b_ → renderArrowMarkerDef (191092) | x_ → renderTextParagraphRuns (191113) | S_ → clampRectToGrid (191139)
 *   C_ → resizeHandleStyle (191150) | w_ → useGridTheme (191175) | T_ → columnIndexToLetters (191178)
 *   E_ → formatCellRef (191184) | D_ → parseCellRef (191187) | O_ → resolveGridCellStyle (191195)
 *   k_ → parseExternalCellRef (191205) | A_ → decodeXmlEntities (191219) | j_ → borderToCssShorthand (191229)
 *   M_ → isDarkTheme (191233) | N_ → parseColorToRgbTuple (191236) | P_ → colorWithAlpha (191266)
 *   F_ → relativeLuminance (191272) | I_ → contrastRatio (191281) | L_ → resolveContrastTextColor (191289)
 *   R_ → hueChannel (191296) | z_ → hslToRgbTuple (191304) | B_ → quoteFontFamily (191317)
 *   V_ → resolveSchemeFontFamily (191320) | H_ → resolveFontFamilyStack (191325) | U_ → lineHeightMultiplier (191334)
 *   W_ → gridInsetShadow (191338) | G_ → resolveCellStyleCss (191346) | K_ → measureCanvasSingleton (191415)
 *  [单元格显示/区域解析]
 *   q_ → verticalPaddingPx (191416) | J_ → styleFontShorthand (191431) | Y_ → measureCellTextWidth (191434)
 *   X_ → estimateCellContentHeight (191441) | Z_ → canOverflowRight (191459) | Q_ → isRenderableEmptyCell (191465)
 *   $_ → resolveCellDisplayText (191468) | ev → numericValueAtCell (191482) | tv → booleanValueAtCell (191490)
 *   nv → parseRangeLiteral (191500) | rv → unquoteSheetName (191506) | iv → splitQualifiedRef (191510)
 *   av → resolveFormulaRangeRef (191526) | ov → rangeCellAtOffset (191548) | sv → chartSelectionRanges (191559)
 *  [迷你图/单元格批/表格样式]
 *   cv → sparklineValueScale (191618) | lv → renderSparklineSvg (191621) | uv → toNonNegativeInteger (191736)
 *   dv → toPlainRecord (191739) | fv → parseHyperlinkInfo (191742) | pv → parseMergeSpan (191752)
 *   mv → resolveDisplayValue (191759) | hv → buildCellBatchMap (191764) | gv → findRangeContaining (191786)
 *   _v → mergeCellStyles (191791) | vv → expandTableBorderSpans (191807) | yv → resolveTableCellStyle (191818)
 *   bv → tableColumnAtHeader (191845)
 *  [工具栏/页签条]
 *   xv → SortDirectionMenu (191850) | Sv → headerFilterButtonStyle (191896) | Cv → WorkbookSheetTabStrip (191915)
 *   wv → SpreadsheetToolbar (191961) | Tv → resolveToolbarNode (192125) | Ev → resolveErrorNode (192134)
 *   Dv → resolveLoadingNode (192153) | Ov → resolveEmptyNode (192170) | kv → formatByteSize (192187)
 *   Av → renderFileSizeLimitState (192195) | jv → resolveFileTooLargeNode (192234) | Mv → ChartLoadingBars (192237)
 *   Nv → resolveChartLoadingNode (192264) | Pv → formatByteSizeAlias (192268) | Fv → DeferredLoadPrompt (192276)
 *  [选区调色板/条件格式/窗体控件]
 *   Iv → resolveSelectionPalette (192336) | Lv → fullBleedRects (192344) | Rv → rectIntersectsAnyRect (192347)
 *   zv → blitScrolledCanvas (192353) | Bv → conditionalRuleKey (192388) | Vv → resolveCfvoThreshold (192391)
 *   Hv → iconSetAppearanceFor (192405) | Uv → renderConditionalIconSvg (192490) | Wv → isCheckboxChecked (192539)
 *   Gv → isCheckboxMixed (192542) | Kv → normalizeFormControlModel (192545) | qv → renderCheckboxIcon (192615)
 *   Jv → renderRadioIcon (192658) | Yv → cleanFormControlCaption (192680) | Xv → resolveDataBarAppearance (192694)
 *   Zv → resolveColorScaleAppearance (28113) | Qv → resolveCellIconSet (192772) | $v → resolveCellValidation (192801)
 *   ey → verticalAlignToFlexAlign (28213) | ty → horizontalAlignToFlexAlign (192817) | ny → nextIndexAtLeast (192820)
 *   ry → lastIndexAtMost (28252)
 *  [行渲染层]
 *   iy → SpreadsheetRow (28349) | ay → MemoSpreadsheetRow (193182)
 *  外部依赖 8 组（行号在案）见文件头 §二。
 *  边界：上界 193216 与 B5-12b（XlsxDeepB.tsx，193217 起 oy）互斥；
 *  183972–189511 属 B5-12a（XlsxDeepA.tsx）。
 * ============================================================================
 */
