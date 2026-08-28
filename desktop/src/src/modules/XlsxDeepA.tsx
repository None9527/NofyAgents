/* eslint-disable */
/**
 * ============================================================================
 * XlsxDeepA.tsx — react-xlsx 私有引擎深部（上）：控制器 + canvas 图表渲染层
 * （B5-12a 批次 · 逐字重建）
 * ============================================================================
 *
 * 来源文件（主口径，199,508 行，未改动，只读）：
 *   desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
 * jsx 孪生交叉参照（同一 chunk 的 pretty-print 版，49,724 行）：
 *   desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx
 *
 * 覆盖区段（js 行号）：
 *   A. 15672–17817  Ru = useSpreadsheetController（引擎控制器钩子，2,146 行单函数）
 *   B. 183972–189511 地图特征/图表常量与助手 + 全部 SVG/canvas 图表渲染器 +
 *                     ChartSvgRenderer（gm memo）+ 网格主题（_m/vm/ym/bm）
 * 排除（仅注记，不转录）：
 *   - 地图数据段 js 17818–183063：zu = us-atlas TopoJSON（states/counties，Albers
 *     投影量化）、Bu = world-atlas TopoJSON（countries，ISO 3166-1 数字 id）——
 *     纯数据 165,246 行，外置资产口径，见 XlsxDeepA.report.md §2。
 *   - 地图/图表选择助手 bd/xd/Sd/Cd/wd/Td/Ed/Dd/Od（js 183890–183971）与
 *     yd SurfaceChartPanel（js 183672）：属「地图/图表助手」子段（183064–183971），
 *     不在本批行号范围，按外部依赖声明挂接（见下 §外部依赖）。
 *
 * 重建口径：
 *   - 逐字转录（把握度高）：字符串常量（含全部模板字面量/类名/数据属性名/日志文案）、
 *     分支结构、数值常量、JSX 调用形态零改动。B 段 JSX 保留原始编译形态
 *     `(0, K.jsx)(...)` / `(0, K.jsxs)(...)`（主口径逐字；jsx 孪生的糖语法形态
 *     仅作交叉参照）。
 *   - 顶层符号全部改语义名（下表）；函数体内局部变量名保留原混淆名不改，
 *     以保证逐字可回代。
 *   - 类型标注：顶层函数参数标 `any`（深层模型 = 私有引擎内部结构，未展开）；
 *     外部依赖一律 `declare const X: any` 挂接（行号在案）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：主口径 js 行 / jsx 孪生行）
 * ----------------------------------------------------------------------------
 *  [A] 控制器（js 15672–17817 / jsx 11907–13483）：
 *   Ru  → useSpreadsheetController       (js 15672 / jsx 11907)
 *  [B] 地图特征/图表助手/渲染层（js 183972–189511 / jsx 38365–41540）：
 *   kd  → WORLD_COUNTRY_FEATURES         (js 183972 / jsx 38365)
 *   Ad  → US_STATE_FIPS_INFO             (js 183973 / jsx 38366)
 *   jd  → US_STATE_FEATURES              (js 184026 / jsx 38572)
 *   Md  → COUNTRY_NAME_ALIASES           (js 184038 / jsx 38584)
 *   Nd  → US_STATE_NAME_ALIASES          (js 184057 / jsx 38585)
 *   Pd  → COUNTRY_FEATURE_BY_NAME        (js 184064 / jsx 38586)
 *   Fd  → US_STATE_FEATURE_BY_NAME       (js 184074 / jsx 38593)
 *   Id  → parseHexColor                  (js 184090 / jsx 38605)
 *   Ld  → mixHexColors                   (js 184100 / jsx 38613)
 *   Rd  → lightenHexColor                (js 184108 / jsx 38621)
 *   zd  → darkenHexColor                 (js 184111 / jsx 38624)
 *   Bd  → clampNumber                    (js 184114 / jsx 38627)
 *   Vd  → normalizeGeoName               (js 184117 / jsx 38630)
 *   Hd  → SPREADSHEET_FONT_STACK         (js 184129 / jsx 38633)
 *   Ud  → DEFAULT_CHART_TEXT_COLOR       (js 184132 / jsx 38634)
 *   Wd  → DEFAULT_AXIS_LABEL_COLOR       (js 184133 / jsx 38635)
 *   Gd  → quoteFontFamilyName            (js 184134 / jsx 38636)
 *   Kd  → resolveFontFamilyStack         (js 184146 / jsx 38640)
 *   qd  → resolveTitleTextColor          (js 184154 / jsx 38645)
 *   Jd  → resolveAxisLabelColor          (js 184157 / jsx 38648)
 *   Yd  → resolveSecondaryTextColor      (js 184160 / jsx 38651)
 *   Xd  → toFiniteNumber                 (js 184163 / jsx 38654)
 *   Zd  → resolveSeriesFillColor         (js 184173 / jsx 38664)
 *   Qd  → resolveSeriesLineColor         (js 184178 / jsx 38669)
 *   $d  → resolveDataPointColor          (js 184183 / jsx 38674)
 *   ef  → hasHistogramBins               (js 184206 / jsx 38695)
 *   tf  → hasHistogramSeries             (js 184210 / jsx 38699)
 *   nf  → findGeoFeature                 (js 184213 / jsx 38702)
 *   rf  → resolveReferenceLineColor      (js 184223 / jsx 38712)
 *   af  → resolveRegionMapBaseColor      (js 184226 / jsx 38715)
 *   of  → extractValueColorScale         (js 184236 / jsx 38725)
 *   sf  → extractCategoryColorLabels     (js 184241 / jsx 38730)
 *   cf  → extractLayoutProperties        (js 184250 / jsx 38735)
 *   lf  → resolveRegionSet               (js 184254 / jsx 38739)
 *   uf  → featuresForRegionSet           (js 184260 / jsx 38745)
 *   df  → sampleColorRamp                (js 184263 / jsx 38748)
 *   ff  → resolveRegionValueColor        (js 184272 / jsx 38757)
 *   pf  → resolveRegionMapStrokeColor    (js 184278 / jsx 38763)
 *   mf  → regionMapLegendItems           (js 184281 / jsx 38766)
 *   hf  → normalizeChartStyleId          (js 184301 / jsx 38786)
 *   gf  → surfaceStyle32Palette          (js 184304 / jsx 38789)
 *   _f  → resolvePieSliceColor           (js 184309 / jsx 38794)
 *   vf  → pickPrimarySeriesIndex         (js 184315 / jsx 38800)
 *   yf  → resolveBarSeriesStyle          (js 184332 / jsx 38814)
 *   bf  → barPaddingFromGapWidth         (js 184351 / jsx 38829)
 *   xf  → normalizeLegendPosition        (js 184356 / jsx 38837)
 *   Sf  → normalizeMarkerSymbol          (js 184378 / jsx 38859)
 *   Cf  → resolveChartRenderType         (js 184381 / jsx 38862)
 *   wf  → toCleanLabel                   (js 184404 / jsx 38865)
 *   Tf  → formulaRowCount                (js 184411 / jsx 38868)
 *   Ef  → resolveCategoryLabels          (js 184421 / jsx 38878)
 *   Df  → isComboChart                   (js 184453 / jsx 38897)
 *   Of  → comboLegendItems               (js 184457 / jsx 38901)
 *   kf  → findAxisByIds                  (js 184467 / jsx 38910)
 *   Af  → resolveTypeGroups              (js 184473 / jsx 38913)
 *   jf  → toAxisNumber                   (js 184492 / jsx 38930)
 *   Mf  → extractNumericValue            (js 184495 / jsx 38933)
 *   Nf  → collectPieDataPoints           (js 184521 / jsx 38959)
 *   Pf  → isSubtotalSeries               (js 184532 / jsx 38968)
 *   Ff  → collectStackedTotals           (js 184537 / jsx 38973)
 *   If  → buildHierarchyTree             (js 184575 / jsx 39002)
 *   Lf  → resolveQuartileMethod          (js 184616 / jsx 39043)
 *   Rf  → resolveBoxWhiskerVisibility    (js 184624 / jsx 39048)
 *   zf  → quantileValue                  (js 184635 / jsx 39059)
 *   Bf  → computeBoxWhiskerStats         (js 184648 / jsx 39072)
 *   Vf  → resolveSunburstFillColor       (js 184681 / jsx 39102)
 *   Hf  → resolveTreemapFillColor        (js 184686 / jsx 39107)
 *   Uf  → tileHierarchyNode              (js 184690 / jsx 39111)
 *   Wf  → resolveSurfaceBaseColor        (js 184699 / jsx 39120)
 *   Gf  → normalizeSurfaceStyleId        (js 184709 / jsx 39123)
 *   Kf  → resolveSurfaceAccentColor      (js 184712 / jsx 39126)
 *   qf  → surfaceStyleRamp               (js 184718 / jsx 39132)
 *   Jf  → resolveSurfaceStylePalette     (js 184723 / jsx 39135)
 *   Yf  → isStyledSurfaceChart           (js 184736 / jsx 39140)
 *   Xf  → resolveSurfaceBandCount        (js 184747 / jsx 39145)
 *   Zf  → resolveSurfaceColorRamp        (js 184765 / jsx 39152)
 *   Qf  → resolveSurfaceBandColor        (js 184774 / jsx 39161)
 *   $f  → computeSurfaceValueScale       (js 184780 / jsx 39167)
 *   ep  → sampleSurfaceRampColor         (js 184809 / jsx 39192)
 *   tp  → resolveSurfaceCellColor        (js 184819 / jsx 39202)
 *   np  → surfaceBandIndexForValue       (js 184822 / jsx 39205)
 *   rp  → pointsToLinePath               (js 184828 / jsx 39210)
 *   ip  → splitDefinedPointRuns          (js 184836 / jsx 39213)
 *   ap  → joinContourSegments            (js 184853 / jsx 39229)
 *   op  → resolveSurfaceLineColors       (js 184886 / jsx 39258)
 *   sp  → resolveSurfaceLineColor        (js 184893 / jsx 39263)
 *   cp  → resolveSurfacePlotRect         (js 184899 / jsx 39269)
 *   lp  → surfaceLegendItems             (js 184918 / jsx 39285)
 *   up  → is2dSurfaceChart               (js 184930 / jsx 39300)
 *   dp  → renderSurface2dFrame           (js 184941 / jsx 39304)
 *   fp  → normalizeHexColor              (js 184993 / jsx 39316)
 *   pp  → resolveStockSeriesRoles        (js 185000 / jsx 39323)
 *   mp  → resolveStockPalette            (js 185022 / jsx 39340)
 *   hp  → stockLegendItems               (js 185045 / jsx 39357)
 *   gp  → resolveLegendItems             (js 185063 / jsx 39369)
 *   _p  → computeChartLayout             (js 185092 / jsx 39406)
 *   vp  → niceTickStep                   (js 185122 / jsx 39432)
 *   yp  → buildTicks                     (js 185128 / jsx 39438)
 *   bp  → buildValueScale                (js 185138 / jsx 39447)
 *   xp  → resolveAxisScale               (js 185151 / jsx 39468)
 *   Sp  → computeBar3dDepth              (js 185165 / jsx 39481)
 *   Cp  → formatTickNumber               (js 185197 / jsx 39513)
 *   wp  → formatPercentTick              (js 185202 / jsx 39520)
 *   Tp  → isDateFormatCode               (js 185205 / jsx 39523)
 *   Ep  → excelSerialToDate              (js 185214 / jsx 39528)
 *   Dp  → formatExcelDate                (js 185219 / jsx 39533)
 *   Op  → formatCategoryValue            (js 185236 / jsx 39539)
 *   kp  → truncateLabel                  (js 185244 / jsx 39547)
 *   Ap  → markerSymbolPath               (js 185250 / jsx 39553)
 *   jp  → TWO_PI                         (js 185276 / jsx 39575)
 *   Mp  → normalizeArcAngles             (js 185277 / jsx 39576)
 *   Np  → arcTopFaceSegments             (js 185283 / jsx 39585)
 *   Pp  → pieArcPoint                    (js 185297 / jsx 39602)
 *   Fp  → roundPathNumber                (js 185300 / jsx 39608)
 *   Ip  → pie3dSidePaths                 (js 185303 / jsx 39611)
 *   Lp  → isArcBackAngle                 (js 185320 / jsx 39622)
 *   Rp  → pie3dSliceWallPath             (js 185324 / jsx 39626)
 *   zp  → renderChartTitle               (js 185338 / jsx 39640)
 *   Bp  → renderChartLegend              (js 185353 / jsx 39646)
 *   Vp  → renderCartesianGrid            (js 185399 / jsx 39668)
 *   Hp  → scalePoint2d                   (js 185522 / jsx 39680)
 *   Up  → ellipseArcPoints               (js 185525 / jsx 39686)
 *   Wp  → closedOutlinePath              (js 185538 / jsx 39699)
 *   Gp  → renderCylinderCone3d           (js 185541 / jsx 39702)
 *   Kp  → renderBar3dShape               (js 185614 / jsx 39777)
 *   qp  → pointsToPath                   (js 185752 / jsx 39839)
 *   Jp  → project3dPoint                 (js 185757 / jsx 39844)
 *   Yp  → renderLine3dChart              (js 185769 / jsx 39860)
 *   Xp  → renderBarChart                 (js 186122 / jsx 40021)
 *   Zp  → renderLineAreaChart            (js 186505 / jsx 40245)
 *   Qp  → renderComboChart               (js 186738 / jsx 40372)
 *   $p  → renderScatterChart             (js 186906 / jsx 40438)
 *   em  → renderBubbleChart              (js 187147 / jsx 40537)
 *   tm  → renderRadarChart               (js 187378 / jsx 40591)
 *   nm  → renderPieChart                 (js 187540 / jsx 40657)
 *   rm  → renderBarOfPieChart            (js 187776 / jsx 40744)
 *   im  → renderSurfaceChart             (js 187927 / jsx 40823)
 *   am  → renderSurfaceHitAreas          (js 188448 / jsx 41137)
 *   om  → findSeriesByNamePattern        (js 188487 / jsx 41154)
 *   sm  → renderStockChart               (js 188491 / jsx 41158)
 *   cm  → renderWaterfallChart           (js 188659 / jsx 41221)
 *   lm  → renderFunnelChart              (js 188793 / jsx 41261)
 *   um  → renderSunburstChart            (js 188844 / jsx 41283)
 *   dm  → renderTreemapChart             (js 188910 / jsx 41311)
 *   fm  → renderBoxWhiskerChart          (js 188972 / jsx 41325)
 *   pm  → renderRegionMapChart           (js 189183 / jsx 41372)
 *   mm  → renderUnsupportedChart         (js 189294 / jsx 41434)
 *   hm  → renderChartBody                (js 189317 / jsx 41437)
 *   gm  → ChartSvgRenderer               (js 189364 / jsx 41440)
 *   _m  → LIGHT_GRID_THEME               (js 189454 / jsx 41485)
 *   vm  → DARK_GRID_THEME                (js 189476 / jsx 41507)
 *   ym  → isDarkGridTheme                (js 189498 / jsx 41529)
 *   bm  → resolveGridTheme               (js 189501 / jsx 41532)
 * ============================================================================
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨段/跨 chunk；括号内 = 定义处 js 行号；
 *      均不属本批 A+B 行号范围。A0-S2b：项 1–2（G/K）、15–20、21–56 已接线为
 *      真实 import（15–19 → ./XlsxDeepC，其余 → ./XlsxDeepP）；
 *      项 3–14（d3/topojson/地图数据）保留 declare）
 * ----------------------------------------------------------------------------
 *  chunk 导入（js 1–27 + 模块头 9111–9130）：
 *   1. G  = React interop（__commonJS 包装，9112）
 *   2. K  = jsx-runtime（9113）
 *   3. v  = d3-shape line（line-B5c9ys_W.js）
 *   4. O  = d3-shape curveCatmullRom（catmullRom-VKG4HBuo.js）
 *   5. g/_ = d3-shape curveLinear / curveLinearClosed（linearClosed-sVKHPf8I.js）
 *   6. u/l = d3-scale scaleBand / scalePoint（band-DeoNU25q.js）
 *   7. c  = d3-scale scaleLinear（linear-lf9nDQy-.js）
 *   8. D/h = d3-shape pie / arc（pie-1vRCKDMq.js / arc-BwHSA3do.js）
 *   9. y/b/x/S/C/w/T/E = d3-shape symbolSquare/symbolCircle/symbolStar/symbolWye/
 *      symbolDiamond/symbolTriangle/symbolCross/symbol 工厂（symbol-DjjK0MCF.js）
 *  10. d/f/m = d3-hierarchy hierarchy / treemapDice / treemap（treemap-DBUS1PbI.js）
 *  chunk 内 vendored d3/topojson 片段（js 28–1834，登记口径）：
 *  11. Pn = topojson-client feature()（1758） | rn = d3-geo geoPath（1075）
 *  12. En = d3-geo geoAlbersUsa（1536） | wn = Miller 圆柱投影（1479）
 *      | On = 默认世界投影（1658） | kn = d3-hierarchy partition（1661）
 *  13. An = d3-hierarchy treemapSlice（1705）
 *  地图数据（js 17818–183063，纯数据外置，见报告 §2）：
 *  14. zu = us-atlas TopoJSON | Bu = world-atlas TopoJSON
 *  地图/图表选择助手（js 183064–183971 子段，本批行号范围外）：
 *  15. bd = chartSeriesDataAttrs（183890） | xd = chartSeriesFirstDataAttrs（183900）
 *  16. Sd = closestChartSeriesElement（183903） | Cd = resolveChartElementTarget（183906）
 *  17. wd = isChartSeriesSelected（183926） | Td = isChartPointSelected（183929）
 *  18. Ed = isChartElementSelected（183932） | Dd = renderRectSelectionHandles（183935）
 *  19. Od = renderSelectionHandles（183947） | yd = SurfaceChartPanel（183672，memo）
 *  wasm 桥（js 14341–14473，已全量重建於 XlsxPreviewWasmBridge.tsx）：
 *  20. wc = isWasmSourceAvailable（14360） | Oc = XlsxWorkerClient（14387）
 *      | Ec = loadDukeSheetsWasmModule（14366）
 *  解析/几何（js 9132–12130）：
 *  21. Yn = chartSeriesFormula（9186） | Zn = updateChartSeriesValues（9220）
 *  22. na = hydrateChartAssets（11661） | fa = updateChartAnchorInImageAssets（11965）
 *  23. pa = updateChartInImageAssets（11980） | Ca = resolveFillColor（12105）
 *  24. xa = resolveFontColor（12082） | is = normalizeDrawingAnchor（13226）
 *  OOXML 写回（js 12131–14130）：
 *  25. Us = syncFormControls（13922） | Ws = disposeImageAssets（13925）
 *  26. Ks = parseWorkbookImageAssets（13948） | Js = updateImageRect（14031）
 *  27. tc = saveXlsxWithAssets（14130） | ic = pxToColumnWidthUnits（14197）
 *  28. ac = columnWidthToPx（14200） | oc = rowHeightToPx（14203）
 *  29. sc = snapGridSize（14206） | cc = pxFromGridSize（14209）
 *  30. uc = rectToDrawingAnchor（14222） | ru = pxToRowHeightUnits（15254）
 *  31. dc = resizeRectWithHandle（14259）
 *  公式/计算（js 14130–14340）：
 *  32. gc = ensureWorkbookCalculated（14331）
 *  模型/错误/常量（js 14474–15671）：
 *  33. Xc = normalizeWorkbookBytes（14608） | Tl = checkSheetLimits（14700）
 *  34. El = sheetLimitError（14721） | Dl = XlsxFileSizeLimitExceededError（14726）
 *  35. Ol = deriveDisplayFileName（14736） | Al = buildSheetStates（14765）
 *  36. jl = collectSheetOrigins（14903） | Ml = defaultCellStyleAt（14906）
 *  37. Pl = cellAddress（14919） | Ll = resolveInputRange（14936）
 *  38. Wl = normalizeDrawing（15075） | Gl = formControlDrawingSpec（15092）
 *  39. Kl = syncGroupBoxes（15105） | ql = formControlKindChanged（15120）
 *  40. Hl = formControlKindFromInput（15028） | Ul = formControlKindToSpec（15061）
 *  41. Xl = normalizeRange（15179） | Zl = rangeToRef（15185）
 *  42. Ql = rangeContainsCell（15191） | $l = worksheetTables（15195）
 *  43. au = borderCss（15262） | ou = normalizeDisplayValue（15266）
 *  44. su = copyBytes（15276） | cu = workbookSavePayload（15280）
 *  45. lu = pushUndoEntry（15297） | uu = cloneCellValue（15300）
 *  46. du = cloneCellStyle（15303） | fu = parseCellValueInput（15315）
 *  47. pu = applyCellMutation（15326） | mu = escapeHtml（15330）
 *  48. hu = parseClipboardText（15338） | _u = isAbortError（15358）
 *  49. vu = resolveWorkbookSource（15361） | yu = parseWorkbook（15381）
 *  50. bu = scheduleIdleWork（15391） | ju = shouldSkipXmlParsing（15595）
 *  51. Nu = buildImageAssets（15617） | Pu = downloadFileSource（15628）
 *  52. Fu = exportBlob（15639） | Iu = exportTextFile（15652）
 *  53. Lu = downloadUrlFile（15663） | nu = fileBaseName（15249）
 *  54. xl = stepZoomScale（14654） | vl = clampZoomScale（14640）
 *  55. yl = defaultZoomForSheet（14643）
 *  56. 常量：rl=24（14623 头部行高）| il=40（14624 行号列宽）| $c=80（14619 默认列宽）
 *      | Qc=24（14618 默认行高）| el（14620 xlsx MIME）| tl（14621 csv MIME）
 *      | ol（14626 `application/x-react-xlsx-range+json`）| sl=0（14627）
 *      | cl=25MiB（14628）| pl=10 / ml=400（14633/14634 缩放上下限）
 *      | gl=`__default__`（14636 默认页签 id）
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 外部依赖挂接（行号在案，见上 §二；深层模型为私有引擎内部结构，类型从宽）
// ----------------------------------------------------------------------------
// chunk 导入与互操作（A0-S2b 已接线：G/K + 解析/写回/常量族 → ./XlsxDeepP；
// 图表选择助手 → ./XlsxDeepC；d3/topojson/地图数据保留 declare）
import {
  chartSeriesDataAttrs, // 原 bd（183890）
  chartSeriesFirstDataAttrs, // 原 xd（183900）
  closestChartSeriesElement, // 原 Sd（183903）
  resolveChartElementTarget, // 原 Cd（183906）
  isChartSeriesSelected, // 原 wd（183926）
  isChartPointSelected, // 原 Td（183929）
  isChartElementSelected, // 原 Ed（183932）
  renderRectSelectionHandles, // 原 Dd（183935）
  renderSelectionHandles, // 原 Od（183947）
  SurfaceChartPanel, // 原 yd（183672）
} from "./XlsxDeepC";
import {
  reactInterop, // 原 G（9112）
  jsxRuntime, // 原 K（9113）
  isWasmSourceAvailable, // 原 wc（14360）
  XlsxWorkerClient, // 原 Oc（14387）
  loadDukeSheetsWasmModule, // 原 Ec（14366）
  chartSeriesFormula, // 原 Yn（9186）
  updateChartSeriesValues, // 原 Zn（9220）
  hydrateChartAssets, // 原 na（11661）
  updateChartAnchorInImageAssets, // 原 fa（11965）
  updateChartInImageAssets, // 原 pa（11980）
  resolveFillColor, // 原 Ca（12105）
  resolveFontColor, // 原 xa（12082）
  normalizeDrawingAnchor, // 原 is（13226）
  syncFormControls, // 原 Us（13922）
  disposeImageAssets, // 原 Ws（13925）
  parseWorkbookImageAssets, // 原 Ks（13948）
  updateImageRect, // 原 Js（14031）
  saveXlsxWithAssets, // 原 tc（14130）
  pxToColumnWidthUnits, // 原 ic（14197）
  columnWidthToPx, // 原 ac（14200）
  rowHeightToPx, // 原 oc（14203）
  snapGridSize, // 原 sc（14206）
  pxFromGridSize, // 原 cc（14209）
  rectToDrawingAnchor, // 原 uc（14222）
  resizeRectWithHandle, // 原 dc（14259）
  pxToRowHeightUnits, // 原 ru（15254）
  ensureWorkbookCalculated, // 原 gc（14331）
  normalizeWorkbookBytes, // 原 Xc（14608）
  checkSheetLimits, // 原 Tl（14700）
  sheetLimitError, // 原 El（14721）
  XlsxFileSizeLimitExceededError, // 原 Dl（14726）
  deriveDisplayFileName, // 原 Ol（14736）
  buildSheetStates, // 原 Al（14765）
  collectSheetOrigins, // 原 jl（14903）
  defaultCellStyleAt, // 原 Ml（14906）
  cellAddress, // 原 Pl（14919）
  resolveInputRange, // 原 Ll（14936）
  formControlKindFromInput, // 原 Hl（15028）
  formControlKindToSpec, // 原 Ul（15061）
  normalizeDrawing, // 原 Wl（15075）
  formControlDrawingSpec, // 原 Gl（15092）
  syncGroupBoxes, // 原 Kl（15105）
  formControlKindChanged, // 原 ql（15120）
  normalizeRange, // 原 Xl（15179）
  rangeToRef, // 原 Zl（15185）
  rangeContainsCell, // 原 Ql（15191）
  worksheetTables, // 原 $l（15195）
  fileBaseName, // 原 nu（15249）
  borderCss, // 原 au（15262）
  normalizeDisplayValue, // 原 ou（15266）
  copyBytes, // 原 su（15276）
  workbookSavePayload, // 原 cu（15280）
  pushUndoEntry, // 原 lu（15297）
  cloneCellValue, // 原 uu（15300）
  cloneCellStyle, // 原 du（15303）
  parseCellValueInput, // 原 fu（15315）
  applyCellMutation, // 原 pu（15326）
  escapeHtml, // 原 mu（15330）
  parseClipboardText, // 原 hu（15338）
  isAbortError, // 原 _u（15358）
  resolveWorkbookSource, // 原 vu（15361）
  parseWorkbook, // 原 yu（15381）
  scheduleIdleWork, // 原 bu（15391）
  shouldSkipXmlParsing, // 原 ju（15595）
  buildImageAssets, // 原 Nu（15617）
  downloadFileSource, // 原 Pu（15628）
  exportBlob, // 原 Fu（15639）
  exportTextFile, // 原 Iu（15652）
  downloadUrlFile, // 原 Lu（15663）
  stepZoomScale, // 原 xl（14654）
  clampZoomScale, // 原 vl（14640）
  defaultZoomForSheet, // 原 yl（14643）
  headerRowHeightPx, // 原 rl（14623）
  rowHeaderWidthPx, // 原 il（14624）
  defaultColumnWidth, // 原 $c（14619）
  defaultRowHeight, // 原 Qc（14618）
  xlsxMimeType, // 原 el（14620）
  csvMimeType, // 原 tl（14621）
  rangeClipboardMimeType, // 原 ol（14626）
  deferLoadingDefault, // 原 sl（14627）
  maxFileSizeDefault, // 原 cl（14628）
  minZoomScale, // 原 pl（14633）
  maxZoomScale, // 原 ml（14634）
  defaultTabId, // 原 gl（14636）
} from "./XlsxDeepP";
declare const v: any; // d3 line
declare const O: any; // d3 curveCatmullRom
declare const g: any; // d3 curveLinear
declare const _: any; // d3 curveLinearClosed
declare const u: any; // d3 scaleBand
declare const l: any; // d3 scalePoint
declare const c: any; // d3 scaleLinear
declare const D: any; // d3 pie
declare const h: any; // d3 arc
declare const y: any; // d3 symbolSquare
declare const b: any; // d3 symbolCircle
declare const x: any; // d3 symbolStar
declare const S: any; // d3 symbolWye
declare const C: any; // d3 symbolDiamond
declare const w: any; // d3 symbolTriangle
declare const T: any; // d3 symbolCross
declare const E: any; // d3 symbol 工厂
declare const d: any; // d3 hierarchy
declare const f: any; // d3 treemapDice
declare const m: any; // d3 treemap
declare const p: any; // treemap chunk 附带导出（本批未消费，保留同名挂接）
// chunk 内 vendored d3/topojson 片段（28–1834）
declare const Pn: any; // topojson feature()（1758）
declare const rn: any; // geoPath（1075）
declare const En: any; // geoAlbersUsa（1536）
declare const wn: any; // Miller 投影（1479）
declare const On: any; // 默认世界投影（1658）
declare const kn: any; // partition（1661）
declare const An: any; // treemapSlice（1705）
// 地图数据（17818–183063，纯数据外置）
declare const zu: any; // us-atlas TopoJSON
declare const Bu: any; // world-atlas TopoJSON
// 地图/图表选择助手（183064–183971 子段）〔A0-S2b 已接线 → ./XlsxDeepC，见上〕
// wasm 桥（14341–14473，规范实现 = XlsxPreviewWasmBridge.tsx）〔已接线 → ./XlsxDeepP〕
// 解析/几何（9132–12130）〔已接线 → ./XlsxDeepP〕
// OOXML 写回（12131–14130）〔已接线 → ./XlsxDeepP〕
// 公式/计算（14130–14340）〔已接线 → ./XlsxDeepP〕
// 模型/错误/常量（14474–15671）〔已接线 → ./XlsxDeepP〕

/* ============================================================================
 * [A] 控制器段（js 15672–17817 / jsx 11907–13483）
 * ==========================================================================*/
export function useSpreadsheetController(e: any) {
  let {
      allowResizeInReadOnly: t = !1,
      deferLoadingAboveBytes: n = deferLoadingDefault,
      file: r,
      fileName: i,
      maxFileSizeBytes: a = maxFileSizeDefault,
      readOnly: o = !1,
      readOnlyAboveBytes: s = 0,
      showHiddenSheets: c = !1,
      skipXmlParsing: l = !1,
      src: u,
      useWorker: d = !0,
    } = e,
    [f, p] = reactInterop.useState(!!(r ?? u)),
    [m, h] = reactInterop.useState(null),
    [g, _] = reactInterop.useState(null),
    [v, y] = reactInterop.useState([]),
    [b, x] = reactInterop.useState([]),
    [S, C] = reactInterop.useState([]),
    [w, T] = reactInterop.useState([]),
    [E, D] = reactInterop.useState(!1),
    [O, k] = reactInterop.useState([]),
    [A, j] = reactInterop.useState([]),
    [M, N] = reactInterop.useState([]),
    [P, F] = reactInterop.useState([]),
    [I, ee] = reactInterop.useState(0),
    [L, te] = reactInterop.useState(0),
    [ne, re] = reactInterop.useState({}),
    [R, ie] = reactInterop.useState(null),
    [z, ae] = reactInterop.useState(null),
    [oe, B] = reactInterop.useState(null),
    [se, ce] = reactInterop.useState(null),
    [le, ue] = reactInterop.useState(null),
    [de, fe] = reactInterop.useState(0),
    pe = reactInterop.useRef(null),
    me = reactInterop.useRef([]),
    he = reactInterop.useRef([]),
    V = reactInterop.useRef(!1),
    [ge, _e] = reactInterop.useState(0),
    [H, ve] = reactInterop.useState(!1),
    [ye, be] = reactInterop.useState(0),
    [xe, Se] = reactInterop.useState(!1),
    [Ce, we] = reactInterop.useState(null),
    [Te, Ee] = reactInterop.useState(!1),
    De = reactInterop.useRef(null),
    [Oe, ke] = reactInterop.useState(null),
    Ae = reactInterop.useRef(null),
    je = reactInterop.useRef(null),
    Me = reactInterop.useRef(0),
    Ne = reactInterop.useRef(null),
    Pe = reactInterop.useRef([]),
    Fe = reactInterop.useRef(null),
    Ie = reactInterop.useRef(new Map()),
    Le = reactInterop.useMemo(() => deriveDisplayFileName(u, i), [i, u]),
    Re = n > 0,
    U = o || Te,
    ze = o && t && !Te,
    Be = d && typeof Worker < `u` && isWasmSourceAvailable(),
    Ve = o,
    He = reactInterop.useCallback((e: any) => !o && s > 0 && e > s, [s, o]),
    Ue = reactInterop.useCallback((e: any) => Be && (e || Ve), [Ve, Be]),
    We = reactInterop.useCallback(() => {
      (Fe.current?.dispose(), (Fe.current = null));
    }, []),
    Ge = reactInterop.useCallback(() => ((Fe.current ||= new XlsxWorkerClient()), Fe.current), []),
    Ke = reactInterop.useCallback(() => {
      (disposeImageAssets(Ae.current), (Ae.current = null), (Pe.current = []), j([]), N([]), F([]));
    }, []),
    qe = reactInterop.useCallback(() => {
      ((Me.current += 1),
        Ne.current?.(),
        (Ne.current = null),
        (je.current = null),
        x([]),
        C([]),
        T([]),
        D(!1));
    }, []),
    Je = reactInterop.useCallback((e: any) => {
      (disposeImageAssets(Ae.current),
        (Ae.current = e),
        (Pe.current = e?.sheetOrigins.slice() ?? []),
        j(e?.formControlsByWorkbookSheetIndex ?? []),
        N(e?.imagesByWorkbookSheetIndex ?? []),
        F(e?.shapesByWorkbookSheetIndex ?? []));
    }, []),
    Ye = reactInterop.useCallback((e: any) => {
      ((je.current = e),
        x(e?.chartsByWorkbookSheetIndex ?? []),
        C(e?.chartsheets ?? []),
        T(e?.tabs ?? []),
        D(!1));
    }, []),
    Xe = reactInterop.useCallback((e: any) => {
      let t = e instanceof Error ? e.message : String(e ?? ``);
      return (
        t.includes(`DOMParser is not defined`) ||
        t.includes(`XMLSerializer is not defined`) ||
        t.includes(`Worker chart payload incomplete`)
      );
    }, []),
    Ze = reactInterop.useCallback((e: any) => {
      for (let t of e.chartsByWorkbookSheetIndex)
        for (let e of t)
          if (e.chartType === `Bubble`)
            for (let t of e.series) {
              let e = Math.max(t.values.length, t.categories.length);
              if (
                !(e <= 1) &&
                (t.bubbleSizes ?? []).filter((e: any) => typeof e == `number` && Number.isFinite(e))
                  .length < e
              )
                return !0;
            }
      return !1;
    }, []),
    Qe = reactInterop.useCallback(
      (e: any, t: any) => {
        let n = je.current;
        if (n && (n.chartOriginsById.size > 0 || !e || !Ae.current)) return n;
        if (!e || !Ae.current) return je.current;
        let r = hydrateChartAssets(e, Ae.current, collectSheetOrigins(t), c);
        return ((je.current = r), r);
      },
      [c],
    ),
    $e = reactInterop.useCallback(
      (e: any, t: any, n: any) => {
        let r = shouldSkipXmlParsing(new Uint8Array(e), l),
          i = collectSheetOrigins(n),
          a = hydrateChartAssets(t, null, i, c);
        if ((Ye(a), r)) return;
        if (!a.chartsByWorkbookSheetIndex.some((e: any) => e.length > 0)) {
          D(!1);
          return;
        }
        D(!0);
        let o = Me.current + 1;
        ((Me.current = o), Ne.current?.(), (Ne.current = null));
        let s = !1,
          u = () => {
            s || o !== Me.current || ((s = !0), p());
          },
          d =
            typeof window < `u`
              ? window.setTimeout(() => {
                  u();
                }, 1500)
              : null,
          f = (e: any) => {
            o === Me.current &&
              (x(e.chartsByWorkbookSheetIndex), C(e.chartsheets), T(e.tabs), D(!1));
          },
          p = () => {
            Ne.current = scheduleIdleWork(() => {
              if (o === Me.current)
                try {
                  let e = hydrateChartAssets(t, Ae.current, i, c);
                  if (o !== Me.current) return;
                  Ye(e);
                } catch {
                  if (o !== Me.current) return;
                  Ye(a);
                } finally {
                  o === Me.current && D(!1);
                }
            });
          };
        if (!Be) {
          p();
          return;
        }
        Ge()
          .parseCharts(e, r, c)
          .then((e: any) => {
            if ((d !== null && window.clearTimeout(d), !s))
              try {
                if (Ze(e)) {
                  u();
                  return;
                }
                f(e);
              } catch {
                u();
              }
          })
          .catch((e: any) => {
            (d !== null && window.clearTimeout(d), !isAbortError(e) && u());
          });
      },
      [Ge, Ze, Ye, c, l, Be],
    ),
    et = reactInterop.useCallback(
      async (e: any) => {
        let t = await parseWorkbook(e),
          n = new Uint8Array(e);
        return { imageAssets: buildImageAssets(n, t.workbook, shouldSkipXmlParsing(n, l)), parsedWorkbook: t };
      },
      [l],
    ),
    tt = reactInterop.useCallback(
      (e: any) => {
        let t = syncFormControls(e, Ae.current?.formControlsByWorkbookSheetIndex ?? [], Ae.current?.themePalette);
        (Ae.current && (Ae.current.formControlsByWorkbookSheetIndex = t), j(t));
        let n = buildSheetStates(
          e,
          Ae.current?.sheetStatesByWorkbookSheetIndex,
          Ae.current?.themePalette,
          Ae.current?.styleById,
          Ae.current?.namedCellStyleByName,
          Ae.current?.tableStyleByName,
          c,
        );
        (y(n), Ye(hydrateChartAssets(e, Ae.current, collectSheetOrigins(n), c)), fe((e: any) => e + 1));
      },
      [Ye, c],
    );
  (reactInterop.useEffect(
    () => () => {
      (Ne.current?.(), (Ne.current = null), disposeImageAssets(Ae.current), We());
    },
    [We],
  ),
    reactInterop.useEffect(() => {
      if (!r && !u) {
        (We(),
          Ee(!1),
          _(null),
          y([]),
          qe(),
          k([]),
          Ke(),
          h(null),
          p(!1),
          Se(!1),
          (De.current = null),
          ke(null),
          ee(0),
          te(0),
          ie(null),
          ae(null),
          B(null),
          ce(null),
          ue(null),
          (pe.current = null),
          (me.current = []),
          (he.current = []),
          _e(0),
          ve(!1),
          Ie.current.clear(),
          be(0),
          we(null),
          re({}),
          fe(0));
        return;
      }
      let e = !0,
        t = new AbortController();
      return (
        p(!0),
        h(null),
        Ke(),
        qe(),
        k([]),
        Se(!1),
        (De.current = null),
        ke(null),
        ee(0),
        te(0),
        ie(null),
        ae(null),
        B(null),
        ce(null),
        ue(null),
        (pe.current = null),
        (me.current = []),
        (he.current = []),
        _e(0),
        ve(!1),
        Ie.current.clear(),
        be(0),
        we(null),
        re({}),
        fe(0),
        We(),
        resolveWorkbookSource({ file: r, src: u }, t.signal)
          .then(async (r: any) => {
            if (!e || t.signal.aborted) return;
            if (a > 0 && r.byteLength > a) throw new XlsxFileSizeLimitExceededError(r.byteLength, a);
            r = normalizeWorkbookBytes(r);
            let i = checkSheetLimits(r);
            if (i?.tooLarge) throw sheetLimitError(i);
            let o = He(r.byteLength);
            Ee(o);
            let s = Ue(o),
              u = shouldSkipXmlParsing(new Uint8Array(r), l);
            if (Re && r.byteLength > n) {
              ((De.current = r), ke(r.byteLength), _(null), y([]), qe(), k([]), p(!1));
              return;
            }
            if (s)
              try {
                let n = await Ge().loadWorkbook(r, u, c);
                if (!e || t.signal.aborted) return;
                if (!u && Ze(n)) throw Error(`Worker chart payload incomplete`);
                let i = u ? null : parseWorkbookImageAssets(new Uint8Array(r));
                if (!e || t.signal.aborted) {
                  disposeImageAssets(i);
                  return;
                }
                (Je(i),
                  j(n.formControlsByWorkbookSheetIndex),
                  _(null),
                  y(n.sheets),
                  x(n.chartsByWorkbookSheetIndex),
                  C(n.chartsheets),
                  T(n.tabs),
                  (je.current = null),
                  k(n.tablesByWorkbookSheetIndex),
                  ve(!1),
                  Se(!0),
                  we(null),
                  D(!1),
                  p(!1));
                return;
              } catch (t) {
                if (!e || isAbortError(t)) return;
                if (!Xe(t)) throw t;
                We();
              }
            let { imageAssets: d, parsedWorkbook: f } = await et(r);
            if (!e || t.signal.aborted) {
              disposeImageAssets(d);
              return;
            }
            (Je(d), _(f.workbook));
            let m = buildSheetStates(
              f.workbook,
              d.sheetStatesByWorkbookSheetIndex,
              d.themePalette,
              d.styleById,
              d.namedCellStyleByName,
              d.tableStyleByName,
              c,
            );
            (y(m), $e(r, f.workbook, m), ve(f.shouldAutoCalculate), k([]), Se(!1), we(null), p(!1));
          })
          .catch((t: any) => {
            !e ||
              isAbortError(t) ||
              (_(null),
              y([]),
              qe(),
              k([]),
              Ke(),
              ve(!1),
              Se(!1),
              we(null),
              h(t instanceof Error ? t : Error(`Could not load workbook.`)),
              p(!1));
          }),
        () => {
          ((e = !1), t.abort(), We());
        }
      );
    }, [qe, Ke, n, We, r, Ge, Ze, et, a, Je, $e, Xe, Re, He, Ue, u, c]));
  let nt = w[L] ?? null,
    W = nt?.kind === `sheet` ? (v[nt.sheetIndex ?? -1] ?? null) : null,
    rt = reactInterop.useDeferredValue(R),
    it = reactInterop.useDeferredValue(W),
    at = nt?.id ?? defaultTabId,
    ot = reactInterop.useMemo(() => defaultZoomForSheet(nt, W), [W, nt]),
    st = reactInterop.useMemo(() => clampZoomScale(ne[at] ?? ot), [at, ot, ne]),
    ct = st < maxZoomScale,
    lt = st > minZoomScale;
  reactInterop.useEffect(() => {
    (ie(null), ae(null), B(null), ce(null), ue(null), (pe.current = null), we(null));
  }, [L]);
  let ut = reactInterop.useCallback(
      (e: any) => {
        ee((t: any) => {
          if (e < 0 || e >= v.length) return t;
          let n = v[e],
            r = w.findIndex(
              (e: any) => e.kind === `sheet` && e.workbookSheetIndex === n?.workbookSheetIndex,
            );
          return (r >= 0 && te(r), e);
        });
      },
      [v, w],
    ),
    dt = reactInterop.useCallback(
      (e: any) => {
        te((t: any) => {
          if (e < 0 || e >= w.length) return t;
          let n = w[e];
          return (n?.kind === `sheet` && typeof n.sheetIndex == `number` && ee(n.sheetIndex), e);
        });
      },
      [w],
    ),
    ft = reactInterop.useCallback(
      (e: any) => {
        let t = clampZoomScale(e);
        re((e: any) => (e[at] === t ? e : { ...e, [at]: t }));
      },
      [at],
    ),
    pt = reactInterop.useCallback(() => {
      re((e: any) => {
        if (e[at] === void 0) return e;
        let t = { ...e };
        return (delete t[at], t);
      });
    }, [at]),
    mt = reactInterop.useCallback(() => {
      ft(stepZoomScale(st, 1));
    }, [ft, st]),
    ht = reactInterop.useCallback(() => {
      ft(stepZoomScale(st, -1));
    }, [ft, st]);
  reactInterop.useEffect(() => {
    te((e: any) => (w.length === 0 ? 0 : Math.min(e, w.length - 1)));
  }, [w.length]);
  let gt = reactInterop.useCallback(() => {
      let e = De.current;
      if (!e) return;
      if ((p(!0), h(null), a > 0 && e.byteLength > a)) {
        ((De.current = null),
          ke(null),
          _(null),
          y([]),
          qe(),
          k([]),
          Ke(),
          ve(!1),
          Se(!1),
          we(null),
          h(new XlsxFileSizeLimitExceededError(e.byteLength, a)),
          p(!1));
        return;
      }
      let t = checkSheetLimits(e);
      if (t?.tooLarge) {
        ((De.current = null),
          ke(null),
          _(null),
          y([]),
          qe(),
          k([]),
          Ke(),
          ve(!1),
          Se(!1),
          we(null),
          h(sheetLimitError(t)),
          p(!1));
        return;
      }
      let n = He(e.byteLength);
      Ee(n);
      let r = Ue(n),
        i = shouldSkipXmlParsing(new Uint8Array(e), l);
      if (r) {
        Ge()
          .loadWorkbook(e, i, c)
          .then((e: any) => {
            if (!i && Ze(e)) throw Error(`Worker chart payload incomplete`);
            ((De.current = null),
              ke(null),
              _(null),
              y(e.sheets),
              x(e.chartsByWorkbookSheetIndex),
              C(e.chartsheets),
              T(e.tabs),
              (je.current = null),
              j(e.formControlsByWorkbookSheetIndex),
              k(e.tablesByWorkbookSheetIndex),
              ve(!1),
              Se(!0),
              we(null),
              D(!1),
              p(!1));
          })
          .catch(async (t: any) => {
            if (isAbortError(t)) return;
            if (!Xe(t)) throw t;
            We();
            let { imageAssets: n, parsedWorkbook: r } = await et(e);
            ((De.current = null), ke(null), Je(n), _(r.workbook));
            let i = buildSheetStates(
              r.workbook,
              n.sheetStatesByWorkbookSheetIndex,
              n.themePalette,
              n.styleById,
              n.namedCellStyleByName,
              n.tableStyleByName,
              c,
            );
            (y(i), $e(e, r.workbook, i), ve(r.shouldAutoCalculate), k([]), Se(!1), we(null), p(!1));
          })
          .catch((e: any) => {
            ((De.current = null),
              ke(null),
              _(null),
              y([]),
              qe(),
              k([]),
              Ke(),
              ve(!1),
              Se(!1),
              we(null),
              h(e instanceof Error ? e : Error(`Could not load workbook.`)),
              p(!1));
          });
        return;
      }
      parseWorkbook(e)
        .then((t: any) => {
          let n = new Uint8Array(e),
            r = buildImageAssets(n, t.workbook, shouldSkipXmlParsing(n, l));
          ((De.current = null), ke(null), Je(r), _(t.workbook));
          let i = buildSheetStates(
            t.workbook,
            r.sheetStatesByWorkbookSheetIndex,
            r.themePalette,
            r.styleById,
            r.namedCellStyleByName,
            r.tableStyleByName,
            c,
          );
          (y(i), $e(e, t.workbook, i), ve(t.shouldAutoCalculate), k([]), Se(!1), we(null), p(!1));
        })
        .catch((e: any) => {
          ((De.current = null),
            ke(null),
            _(null),
            y([]),
            qe(),
            k([]),
            Ke(),
            ve(!1),
            Se(!1),
            we(null),
            h(e instanceof Error ? e : Error(`Could not load workbook.`)),
            p(!1));
        });
    }, [qe, Ke, We, Ge, et, Je, $e, Ze, a, Xe, He, Ue]),
    _t = reactInterop.useCallback(
      (e: any) => {
        H && (ensureWorkbookCalculated(e).calculated || ve(!1));
      },
      [H],
    ),
    vt = reactInterop.useCallback(() => (!g || !W ? null : g.getSheet(W.workbookSheetIndex)), [W, g]),
    yt = reactInterop.useCallback(
      (e = I) => {
        let t = v[e];
        if (!g || !t) return null;
        try {
          return {
            workbookSheetIndex: t.workbookSheetIndex,
            worksheet: g.getSheet(t.workbookSheetIndex),
          };
        } catch {
          return null;
        }
      },
      [I, v, g],
    ),
    bt = reactInterop.useMemo(
      () => (xe ? (O[W?.workbookSheetIndex ?? -1] ?? []) : worksheetTables(vt())),
      [W?.workbookSheetIndex, vt, xe, de, O],
    ),
    xt = reactInterop.useCallback(
      (e: any, t: any, n: any) =>
        xe ? Ge().getCellSnapshot(e, t, n) : Promise.resolve({ displayValue: ``, formula: `` }),
      [Ge, xe],
    ),
    St = reactInterop.useCallback(
      (e: any, t: any, n: any) => (xe ? Ge().getRowsBatch(e, t, n) : Promise.resolve(null)),
      [Ge, xe],
    ),
    Ct = reactInterop.useMemo(() => new Map(v.map((e: any, t: any) => [e.workbookSheetIndex, t])), [v]),
    wt = reactInterop.useCallback(
      (e: any) => {
        let t = Ct.get(e.workbookSheetIndex);
        return { ...e, sheetIndex: t ?? e.workbookSheetIndex };
      },
      [Ct],
    ),
    Tt = reactInterop.useCallback(
      (e: any) => {
        let t = Ct.get(e.workbookSheetIndex);
        return { ...e, sheetIndex: t ?? e.workbookSheetIndex };
      },
      [Ct],
    ),
    Et = reactInterop.useCallback(
      (e: any) => {
        let t = Ct.get(e.workbookSheetIndex);
        return { ...e, sheetIndex: t ?? e.workbookSheetIndex };
      },
      [Ct],
    ),
    Dt = reactInterop.useMemo(() => b.map((e: any) => e.map(wt)), [b, wt]),
    Ot = reactInterop.useMemo(() => {
      let e = new Map();
      for (let t of Dt) for (let n of t) e.set(n.id, n);
      return e;
    }, [Dt]),
    kt = reactInterop.useCallback(
      (e = I) => {
        let t = v[e];
        return t ? (Dt[t.workbookSheetIndex] ?? []) : [];
      },
      [I, Dt, v],
    ),
    At = reactInterop.useCallback((e: any) => Ot.get(e) ?? null, [Ot]),
    jt = reactInterop.useCallback((e: any) => S.find((t: any) => t.id === e) ?? null, [S]),
    Mt = reactInterop.useMemo(
      () =>
        nt?.kind === `chartsheet` && typeof nt.chartsheetIndex == `number`
          ? (S[nt.chartsheetIndex]?.chartIds ?? []).map((e: any) => At(e)).filter((e: any) => !!e)
          : kt(I),
      [I, nt, S, At, kt],
    ),
    Nt = reactInterop.useMemo(() => (oe ? At(oe) : null), [At, oe]);
  reactInterop.useEffect(() => {
    if (!oe) {
      se && ce(null);
      return;
    }
    if (!Nt) {
      (B(null), ce(null));
      return;
    }
    if (!se) {
      ce({ chartId: oe, kind: `chart` });
      return;
    }
    if (se.chartId !== oe) {
      ce({ chartId: oe, kind: `chart` });
      return;
    }
    if (se.kind !== `chart`) {
      let e = Nt.series[se.seriesIndex];
      (!e || e.id !== se.seriesId) && ce({ chartId: oe, kind: `chart` });
    }
  }, [Nt, se, oe]);
  let Pt = reactInterop.useCallback((e: any) => {
      (ue(null), B(e), ce(e ? { chartId: e, kind: `chart` } : null));
    }, []),
    Ft = reactInterop.useCallback(() => {
      (B(null), ce(null));
    }, []),
    It = reactInterop.useCallback(() => {
      ce(oe ? { chartId: oe, kind: `chart` } : null);
    }, [oe]),
    Lt = reactInterop.useCallback((e: any) => {
      (ue(null), B(e?.chartId ?? null), ce(e));
    }, []),
    Rt = reactInterop.useCallback(
      (e = I) => {
        let t = v[e];
        return t ? (M[t.workbookSheetIndex] ?? []).map(Tt) : [];
      },
      [I, M, Tt, v],
    ),
    zt = reactInterop.useMemo(() => Rt(I), [I, Rt]),
    Bt = reactInterop.useCallback(
      (e = I) => {
        let t = v[e];
        return t ? (A[t.workbookSheetIndex] ?? []).map(Et) : [];
      },
      [I, A, Et, v],
    ),
    Vt = reactInterop.useMemo(() => Bt(I), [I, Bt]),
    Ht = reactInterop.useCallback(
      (e: any, t = I) => {
        let n = yt(t);
        if (!g || !n) {
          let n = v[t];
          return n
            ? ((A[n.workbookSheetIndex] ?? []).find((t: any) => t.controlIndex === e)?.items?.slice() ??
                [])
            : [];
        }
        let r = n.worksheet.formControls[e]?.formControl.kind,
          i = r?.kind === `listBox` || r?.kind === `dropdown` ? r.inputRange : void 0;
        if (!i) return [];
        let a = resolveInputRange(g, n.workbookSheetIndex, i);
        if (!a) return [];
        let o = [];
        for (let e = a.range.start.row; e <= a.range.end.row; e += 1)
          for (let t = a.range.start.col; t <= a.range.end.col; t += 1)
            o.push(a.worksheet.getFormattedValueAt(e, t));
        return o;
      },
      [I, A, yt, v, g],
    ),
    Ut = reactInterop.useCallback(
      (e = I) => {
        let t = v[e];
        return t
          ? (P[t.workbookSheetIndex] ?? []).map((e: any) => {
              let t = Ct.get(e.workbookSheetIndex);
              return { ...e, sheetIndex: t ?? e.workbookSheetIndex };
            })
          : [];
      },
      [I, P, v, Ct],
    ),
    Wt = reactInterop.useMemo(() => Ut(I), [I, Ut]),
    Gt = reactInterop.useCallback(
      (e: any) => {
        for (let t of M) {
          let n = t?.find((t: any) => t.id === e);
          if (n) return Tt(n);
        }
        return null;
      },
      [M, Tt],
    ),
    Kt = reactInterop.useMemo(() => (le ? Gt(le) : null), [Gt, le]),
    qt = reactInterop.useCallback((e: any) => {
      (B(null), ce(null), ue(e));
    }, []),
    Jt = reactInterop.useCallback(() => {
      ue(null);
    }, []),
    Yt = reactInterop.useCallback(
      (e: any, t: any) => {
        let n = Ae.current?.sheetStatesByWorkbookSheetIndex[W?.workbookSheetIndex ?? -1] ?? null,
          r = e.getColumnWidth(t),
          i = W?.showGridLines ?? !0;
        return snapGridSize(
          r == null
            ? (n?.colWidthOverridesPx?.[t] ?? n?.defaultColWidthPx ?? defaultColumnWidth)
            : columnWidthToPx(r, n?.columnWidthCharacterWidthPx),
          i,
        );
      },
      [W?.showGridLines, W?.workbookSheetIndex],
    ),
    Xt = reactInterop.useCallback(
      (e: any, t: any) => {
        let n = Ae.current?.sheetStatesByWorkbookSheetIndex[W?.workbookSheetIndex ?? -1] ?? null,
          r = e.getRowHeight(t),
          i = W?.showGridLines ?? !0;
        return snapGridSize(
          r == null ? (n?.rowHeightOverridesPx?.[t] ?? n?.defaultRowHeightPx ?? defaultRowHeight) : rowHeightToPx(r),
          i,
        );
      },
      [W?.showGridLines, W?.workbookSheetIndex],
    ),
    Zt = reactInterop.useCallback(
      (e: any) => {
        if (e && W) {
          let t = Ie.current.get(`${W.workbookSheetIndex}:${e.row}:${e.col}`);
          if (t) return t.displayValue;
        }
        let t = vt();
        if (!t || !e) return ``;
        let n = t.getFormulaAt(e.row, e.col),
          r = n ? W?.cachedFormulaValues?.[cellAddress(e)] : void 0,
          i = t.getFormattedValueAt(e.row, e.col);
        if (i && !(n && r !== void 0 && i.startsWith(`#`))) return normalizeDisplayValue(i);
        let a = t.getCalculatedValueAt(e.row, e.col);
        return n && r !== void 0 && a.is_error
          ? r
          : a.is_error
            ? (a.asError() ?? ``)
            : a.is_empty
              ? ``
              : a.toString();
      },
      [W, vt],
    ),
    Qt = reactInterop.useCallback(
      (e: any) => {
        if (e && W) {
          let t = Ie.current.get(`${W.workbookSheetIndex}:${e.row}:${e.col}`);
          if (t) return t.formula;
        }
        let t = vt();
        return !t || !e ? `` : (t.getFormulaAt(e.row, e.col) ?? ``);
      },
      [W, vt],
    ),
    $t = reactInterop.useCallback(() => {
      let e = vt(),
        t = z ?? (R ? { start: R, end: R } : null);
      if (!e || !t) return null;
      let n = normalizeRange(t),
        r = [],
        i = [],
        a: any = {
          cells: [],
          cols: n.end.col - n.start.col + 1,
          merges: [],
          rows: n.end.row - n.start.row + 1,
        };
      for (let t = n.start.row; t <= n.end.row; t += 1) {
        let o = [],
          s = [];
        for (let r = n.start.col; r <= n.end.col; r += 1) {
          if (e.isMergedSecondary(t, r)) {
            o.push(``);
            continue;
          }
          let i = e.getFormulaAt(t, r) ?? null,
            c = Zt({ row: t, col: r }),
            l = e.getMergeSpan(t, r),
            u = e.getCellStyleAt(t, r) ?? defaultCellStyleAt(W, t, r),
            d = [`padding:2px 4px`, `white-space:pre-wrap`, `vertical-align:top`],
            f = u?.fill;
          if (f) {
            let e = resolveFillColor(f, W?.themePalette);
            (e.backgroundColor &&
              e.backgroundColor.toLowerCase() !== `#ffffff` &&
              d.push(`background-color:${e.backgroundColor}`),
              e.backgroundImage && d.push(`background-image:${e.backgroundImage}`));
          }
          let p = u?.font;
          if (p) {
            (p.bold && d.push(`font-weight:700`),
              p.italic && d.push(`font-style:italic`),
              p.underline && p.underline !== `none` && d.push(`text-decoration:underline`),
              p.strikethrough && d.push(`text-decoration:line-through`));
            let e = resolveFontColor(p.color, W?.themePalette);
            (e && d.push(`color:${e}`),
              typeof p.size == `number` && d.push(`font-size:${p.size}pt`));
          }
          let m = u?.alignment;
          (m?.horizontal &&
            m.horizontal !== `general` &&
            d.push(`text-align:${String(m.horizontal)}`),
            m?.wrapText && (d.push(`white-space:pre-wrap`), d.push(`word-break:break-word`)));
          let h = u?.border;
          (h?.top?.style && h.top.style !== `none` && d.push(`border-top:${borderCss(h.top)}`),
            h?.right?.style && h.right.style !== `none` && d.push(`border-right:${borderCss(h.right)}`),
            h?.bottom?.style &&
              h.bottom.style !== `none` &&
              d.push(`border-bottom:${borderCss(h.bottom)}`),
            h?.left?.style && h.left.style !== `none` && d.push(`border-left:${borderCss(h.left)}`));
          let g = Math.min(l?.rowSpan ?? 1, n.end.row - t + 1),
            _ = Math.min(l?.colSpan ?? 1, n.end.col - r + 1);
          (a.cells.push({
            colOffset: r - n.start.col,
            formula: i,
            rowOffset: t - n.start.row,
            value: c,
          }),
            (g > 1 || _ > 1) &&
              a.merges.push({
                colOffset: r - n.start.col,
                colSpan: _,
                rowOffset: t - n.start.row,
                rowSpan: g,
              }),
            o.push(c),
            s.push(
              `<td${g > 1 ? ` rowspan="${g}"` : ``}${_ > 1 ? ` colspan="${_}"` : ``} style="${escapeHtml(d.join(`;`))}">${escapeHtml(c)}</td>`,
            ));
        }
        (r.push(o.join(`	`)), i.push(`<tr>${s.join(``)}</tr>`));
      }
      return {
        html: `<table style="border-collapse:collapse">${i.join(``)}</table>`,
        structured: JSON.stringify(a),
        text: r.join(`
`),
      };
    }, [R, vt, Zt, z]);
  reactInterop.useEffect(() => {
    if (!xe || !it || !rt) return;
    let e = `${it.workbookSheetIndex}:${rt.row}:${rt.col}`;
    if (Ie.current.has(e)) return;
    let t = !0;
    return (
      xt(it.workbookSheetIndex, rt.row, rt.col)
        .then((n: any) => {
          t && (Ie.current.set(e, n), be((e: any) => e + 1));
        })
        .catch(() => {
          t && (Ie.current.set(e, { displayValue: ``, formula: `` }), be((e: any) => e + 1));
        }),
      () => {
        t = !1;
      }
    );
  }, [rt, it, xt, xe]);
  let en = reactInterop.useMemo(() => (R ? cellAddress(R) : null), [R]),
    tn = reactInterop.useMemo(() => (z ? rangeToRef(z) : null), [z]),
    nn = reactInterop.useMemo(() => Zt(rt), [rt, Zt, de, ye]),
    rn = reactInterop.useMemo(() => Qt(rt), [rt, Qt, de, ye]),
    an = reactInterop.useCallback((e: any, t: any) => chartSeriesFormula(At(e), t), [At]),
    on = reactInterop.useMemo(
      () =>
        !se || se.kind === `chart` || se.seriesIndex < 0 ? null : an(se.chartId, se.seriesIndex),
      [an, se],
    ),
    sn = reactInterop.useMemo(
      () =>
        on && se && se.kind !== `chart`
          ? {
              chartId: se.chartId,
              kind: `chartSeries`,
              seriesId: se.seriesId,
              seriesIndex: se.seriesIndex,
            }
          : { cell: rt, kind: `cell` },
      [rt, se, on],
    ),
    cn = on ?? rn,
    ln = Oe !== null,
    un = !f && ln,
    dn = !U && me.current.length > 0,
    fn = !U && he.current.length > 0,
    pn = reactInterop.useCallback((e: any) => saveXlsxWithAssets(workbookSavePayload(e.saveXlsxBytes()), Ae.current, Pe.current), []),
    mn = reactInterop.useCallback(
      () =>
        g
          ? { kind: `snapshot`, activeCell: R, activeSheetIndex: I, bytes: pn(g), selection: z }
          : null,
      [R, I, pn, z, g],
    ),
    hn = reactInterop.useCallback(
      (e: any) => {
        let t = vt();
        return t
          ? {
              formula: t.getFormulaAt(e.row, e.col) ?? null,
              style: t.getCellStyleAt(e.row, e.col),
              value: t.getCellAt(e.row, e.col).toJs(),
            }
          : null;
      },
      [vt],
    ),
    gn = reactInterop.useCallback(
      async (e: any) => {
        let t = (await loadDukeSheetsWasmModule()).Workbook.fromBytes(copyBytes(e.bytes)),
          n = buildImageAssets(e.bytes, t),
          r = buildSheetStates(
            t,
            n.sheetStatesByWorkbookSheetIndex,
            n.themePalette,
            n.styleById,
            n.namedCellStyleByName,
            n.tableStyleByName,
            c,
          ),
          i = Math.max(0, Math.min(e.activeSheetIndex, Math.max(0, r.length - 1)));
        (h(null), p(!1), Je(n), _(t), y(r));
        let a = hydrateChartAssets(t, n, collectSheetOrigins(r), c);
        (Ye(a), ee(i));
        let o = a.tabs.findIndex((e: any) => e.kind === `sheet` && e.sheetIndex === i);
        (o >= 0 && te(o),
          ie(e.activeCell),
          ae(e.selection),
          (pe.current = e.selection ? normalizeRange(e.selection).start : e.activeCell),
          fe((e: any) => e + 1));
      },
      [Ye, Je],
    ),
    _n = reactInterop.useCallback(
      (e: any, t: any) => {
        if (!g) return;
        let n = g.getSheet(e.sheetIndex),
          r = v.findIndex((t: any) => t.workbookSheetIndex === e.sheetIndex),
          i = t === `undo` ? e.before : e.after;
        ((V.current = !0), applyCellMutation(n, e.cell, i), _t(g), tt(g));
        let a = t === `undo` ? e.activeCellBefore : e.activeCellAfter,
          o = t === `undo` ? e.selectionBefore : e.selectionAfter;
        (r >= 0 && ee(r), ie(a), ae(o), (pe.current = o ? normalizeRange(o).start : a), (V.current = !1));
      },
      [_t, tt, v, g],
    ),
    vn = reactInterop.useCallback(
      (e: any, t: any) => {
        if (!g) return;
        let n = g.getSheet(e.sheetIndex),
          r = v.findIndex((t: any) => t.workbookSheetIndex === e.sheetIndex);
        V.current = !0;
        for (let r of e.mutations) applyCellMutation(n, r.cell, t === `undo` ? r.before : r.after);
        (_t(g), tt(g));
        let i = t === `undo` ? e.activeCellBefore : e.activeCellAfter,
          a = t === `undo` ? e.selectionBefore : e.selectionAfter;
        (r >= 0 && ee(r), ie(i), ae(a), (pe.current = a ? normalizeRange(a).start : i), (V.current = !1));
      },
      [_t, tt, v, g],
    ),
    yn = reactInterop.useCallback(() => {
      if (V.current) return;
      let e = mn();
      e && (pushUndoEntry(me.current, e), (he.current = []), _e((e: any) => e + 1));
    }, [mn]),
    bn = reactInterop.useCallback(
      (e: any, t = I) => {
        let n = yt(t);
        if (U || !g || !n) return null;
        (yn(), n.worksheet.addDrawing(formControlDrawingSpec(e)));
        let r = n.worksheet.formControlCount - 1,
          i = n.worksheet.formControls[r],
          a = i?.formControl.kind;
        return (
          i && (a?.kind === `checkbox` || a?.kind === `optionButton`)
            ? n.worksheet.setFormControlCheckState(i.drawingPath, a.state)
            : a?.kind === `groupBox`
              ? syncGroupBoxes(n.worksheet)
              : a && `cellLink` in a && a.cellLink && g.syncFormControls(),
          _t(g),
          tt(g),
          r
        );
      },
      [I, yt, _t, U, yn, tt, g],
    ),
    xn = reactInterop.useCallback(
      (e: any, t: any, n = I) => {
        let r = yt(n),
          i = r?.worksheet.formControls[e];
        if (U || !g || !r || !i) return !1;
        yn();
        let a = normalizeDrawing(i);
        if (a.kind !== `formControl` || !i.anchor) return !1;
        let o = t.anchor
            ? normalizeDrawingAnchor(t.anchor, t.editAs ?? (i.anchor.type === `twoCell` ? i.anchor.editAs : void 0))
            : t.editAs !== void 0 && i.anchor.type === `twoCell`
              ? { ...i.anchor, editAs: t.editAs }
              : i.anchor,
          s = t.kind ? formControlKindFromInput(t.kind) : formControlKindToSpec(i.formControl.kind);
        i.formControl.kind.kind === `unknown` &&
          s.kind === `unknown` &&
          (s = {
            ...s,
            legacyObjectType: s.legacyObjectType ?? i.formControl.kind.legacyObjectType,
            rawObj: s.rawObj ?? i.formControl.kind.rawObj,
            rawProperties: s.rawProperties ?? i.formControl.kind.rawProperties,
          });
        let c = {
          altText: `altText` in t ? t.altText : i.altText,
          anchor: o,
          formControl: {
            ...a.formControl,
            kind: s,
            macroName: `macroName` in t ? t.macroName : i.formControl.macroName,
            rawClientData: `rawClientData` in t ? t.rawClientData : i.formControl.rawClientData,
          },
          hidden: `hidden` in t ? t.hidden : i.hidden,
          kind: `formControl`,
          locked: `locked` in t ? t.locked : i.locked,
          name: `name` in t ? t.name : i.name,
          printable: `printable` in t ? t.printable : i.printable,
          title: `title` in t ? t.title : i.title,
        };
        r.worksheet.setDrawing(i.drawingPath, c);
        let l = r.worksheet.formControls[e],
          u = l?.formControl.kind,
          d = u ? formControlKindChanged(i.formControl.kind, u) : !1,
          f =
            t.anchor !== void 0 ||
            (u !== void 0 &&
              u.kind !== i.formControl.kind.kind &&
              (u.kind === `groupBox` || i.formControl.kind.kind === `groupBox`));
        return (
          d && l && (u?.kind === `checkbox` || u?.kind === `optionButton`)
            ? r.worksheet.setFormControlCheckState(l.drawingPath, u.state)
            : f
              ? syncGroupBoxes(r.worksheet)
              : d && u && `cellLink` in u && u.cellLink && g.syncFormControls(),
          _t(g),
          tt(g),
          !0
        );
      },
      [I, yt, _t, U, yn, tt, g],
    ),
    Sn = reactInterop.useCallback(
      (e: any, t = I) => {
        let n = yt(t);
        if (U || !g || !n || !n.worksheet.formControls[e]) return !1;
        yn();
        let r = n.worksheet.formControls[e],
          i = r.formControl.kind.kind;
        return (
          n.worksheet.removeDrawing(r.drawingPath),
          (i === `groupBox` || i === `optionButton`) && (syncGroupBoxes(n.worksheet), _t(g)),
          tt(g),
          !0
        );
      },
      [I, yt, _t, U, yn, tt, g],
    ),
    Cn = reactInterop.useCallback(
      (e: any, t: any, n: any) => {
        !W ||
          V.current ||
          (pushUndoEntry(me.current, {
            kind: `cell-edit`,
            activeCellAfter: e,
            activeCellBefore: R,
            after: n,
            before: t,
            cell: e,
            selectionAfter: { start: e, end: e },
            selectionBefore: z,
            sheetIndex: W.workbookSheetIndex,
          }),
          (he.current = []),
          _e((e: any) => e + 1));
      },
      [R, W, z],
    ),
    wn = reactInterop.useCallback(
      (e: any, t: any, n: any) => {
        !W ||
          V.current ||
          e.length === 0 ||
          (pushUndoEntry(me.current, {
            kind: `range-edit`,
            activeCellAfter: n,
            activeCellBefore: R,
            mutations: e,
            selectionAfter: t,
            selectionBefore: z,
            sheetIndex: W.workbookSheetIndex,
          }),
          (he.current = []),
          _e((e: any) => e + 1));
      },
      [R, W, z],
    ),
    Tn = reactInterop.useCallback(
      (e: any, t: any, n: any) => {
        let r = vt(),
          i = bt.find((t: any) => t.name === e || t.displayName === e);
        if (!r || !g || !W || !i) return;
        let a = i.start.row + Math.max(i.headerRowCount, 1),
          o = i.totalsRowShown ? Math.max(i.totalsRowCount, 1) : 0,
          s = i.end.row - o,
          c = i.start.col,
          l = i.end.col,
          u = c + t;
        if (t < 0 || u > l || a > s) return;
        let d = [];
        for (let e = a; e <= s; e += 1) {
          let t = [];
          for (let n = c; n <= l; n += 1)
            t.push({
              formula: r.getFormulaAt(e, n) ?? null,
              style: r.getCellStyleAt(e, n),
              value: r.getCellAt(e, n).toJs(),
            });
          let n = r.getCalculatedValueAt(e, u),
            i = normalizeDisplayValue(r.getFormattedValueAt(e, u) ?? ``);
          d.push({
            cells: t,
            index: e,
            sortBoolean: n.is_boolean ? n.asBoolean() : void 0,
            sortEmpty: n.is_empty || i.length === 0,
            sortNumber: n.is_number ? n.asNumber() : void 0,
            sortText: n.is_text ? (n.asText() ?? i) : i,
          });
        }
        let f = [...d].sort((e, t) => {
          if (e.sortEmpty !== t.sortEmpty) return e.sortEmpty ? 1 : -1;
          if (e.sortNumber !== void 0 && t.sortNumber !== void 0)
            return n === `ascending` ? e.sortNumber - t.sortNumber : t.sortNumber - e.sortNumber;
          if (e.sortBoolean !== void 0 && t.sortBoolean !== void 0) {
            let r = +!!e.sortBoolean,
              i = +!!t.sortBoolean;
            return n === `ascending` ? r - i : i - r;
          }
          let r = e.sortText.localeCompare(t.sortText, void 0, {
            numeric: !0,
            sensitivity: `base`,
          });
          return n === `ascending` ? r : -r;
        });
        if (f.every((e, t) => e.index === d[t]?.index)) {
          we({ columnIndex: t, direction: n, tableName: i.name });
          return;
        }
        let p = [];
        for (let e = 0; e < d.length; e += 1) {
          let t = a + e,
            n = f[e],
            i = d[e];
          if (!(!n || !i))
            for (let e = 0; e <= l - c; e += 1) {
              let a = i.cells[e],
                o = n.cells[e];
              if (!a || !o) continue;
              let s = { row: t, col: c + e };
              (applyCellMutation(r, s, o), p.push({ after: o, before: a, cell: s }));
            }
        }
        (_t(g), tt(g), we({ columnIndex: t, direction: n, tableName: i.name }), wn(p, z, R));
      },
      [R, W, vt, _t, U, wn, tt, z, bt, g],
    ),
    En = reactInterop.useCallback(() => {
      if (r) {
        downloadFileSource(r, Le);
        return;
      }
      u && downloadUrlFile(u, Le);
    }, [Le, r, u]),
    Dn = reactInterop.useCallback(() => {
      g && exportBlob(pn(g), `${fileBaseName(Le)}.xlsx`, xlsxMimeType);
    }, [pn, Le, g]),
    On = reactInterop.useCallback(() => {
      if (!g) return;
      let e = W?.name ?? `sheet`;
      exportTextFile(g.saveCsvString(), `${fileBaseName(Le)}-${e}.csv`, csvMimeType);
    }, [W?.name, Le, g]),
    kn = reactInterop.useCallback(() => {
      if (g) {
        if (ensureWorkbookCalculated(g).calculated) {
          tt(g);
          return;
        }
        ve(!1);
      }
    }, [tt, g]),
    An = reactInterop.useCallback(
      (e: any, t: any, n: any) => {
        if (!W) return;
        let r = pxFromGridSize(n, W.showGridLines),
          i = W.workbookSheetIndex;
        (y((n: any) =>
          n.map((n: any) => {
            if (n.workbookSheetIndex !== i) return n;
            if (e === `column`) {
              let e = { ...n.colWidthOverridesPx, [t]: r },
                i = [...n.colWidths],
                a = n.visibleCols.indexOf(t);
              return (a >= 0 && (i[a] = r), { ...n, colWidthOverridesPx: e, colWidths: i });
            }
            let a = { ...n.rowHeightOverridesPx, [t]: r },
              o = [...n.rowHeights],
              s = n.visibleRows.indexOf(t);
            return (s >= 0 && (o[s] = r), { ...n, rowHeightOverridesPx: a, rowHeights: o });
          }),
        ),
          fe((e: any) => e + 1));
      },
      [W],
    ),
    jn = reactInterop.useCallback(
      (e: any, t: any) => {
        if (!((U && !ze) || !W)) {
          if (xe) {
            An(`column`, e, t);
            return;
          }
          g &&
            (yn(),
            g.getSheet(W.workbookSheetIndex).setColumnWidth(e, pxToColumnWidthUnits(pxFromGridSize(t, W.showGridLines))),
            tt(g));
        }
      },
      [W, An, ze, xe, U, yn, tt, g],
    ),
    Mn = reactInterop.useCallback(
      (e: any, t: any) => {
        if (!((U && !ze) || !W)) {
          if (xe) {
            An(`row`, e, t);
            return;
          }
          g &&
            (yn(),
            g.getSheet(W.workbookSheetIndex).setRowHeight(e, pxToRowHeightUnits(pxFromGridSize(t, W.showGridLines))),
            tt(g));
        }
      },
      [W, An, ze, xe, U, yn, tt, g],
    ),
    Nn = reactInterop.useCallback(
      (e: any, t: any) => {
        let n = (e: any, t: any) => {
          let n = 0;
          for (let r = 0; r < e; r += 1) n += t(r);
          return n;
        };
        if (e.kind === `absolute`)
          return {
            height: e.sizeEmu.cy / 9525,
            left: rowHeaderWidthPx + e.positionEmu.x / 9525,
            top: headerRowHeightPx + e.positionEmu.y / 9525,
            width: e.sizeEmu.cx / 9525,
          };
        let r = rowHeaderWidthPx + n(e.from.col, (e: any) => Yt(t, e)) + e.from.colOffsetEmu / 9525,
          i = headerRowHeightPx + n(e.from.row, (e: any) => Xt(t, e)) + e.from.rowOffsetEmu / 9525;
        if (e.kind === `one-cell`)
          return { height: e.sizeEmu.cy / 9525, left: r, top: i, width: e.sizeEmu.cx / 9525 };
        let a = rowHeaderWidthPx + n(e.to.col, (e: any) => Yt(t, e)) + e.to.colOffsetEmu / 9525,
          o = headerRowHeightPx + n(e.to.row, (e: any) => Xt(t, e)) + e.to.rowOffsetEmu / 9525;
        return { height: Math.max(1, o - i), left: r, top: i, width: Math.max(1, a - r) };
      },
      [Yt, Xt],
    ),
    Pn = reactInterop.useCallback(
      (e: any, t: any) => {
        let n = Qe(g, v);
        if (
          (console.info(`[react-xlsx debug] setChartRect`, {
            hasActiveSheet: !!W,
            hasHydratedChartAssets: !!n,
            hasImageAssets: !!Ae.current,
            hasWorkbook: !!g,
            id: e,
            readOnly: U,
            rect: t,
          }),
          U || !g || !W || !Ae.current || !n)
        )
          return;
        let r = g.getSheet(W.workbookSheetIndex),
          i = At(e);
        if (
          (console.info(`[react-xlsx debug] currentChart`, {
            activeWorkbookSheetIndex: W.workbookSheetIndex,
            editable: i?.editable,
            found: !!i,
            originCount: n.chartOriginsById.size,
            workbookSheetIndex: i?.workbookSheetIndex,
          }),
          !i || i.editable === !1 || i.workbookSheetIndex !== W.workbookSheetIndex)
        )
          return;
        let a = rectToDrawingAnchor(t, i.anchor, {
          contentOffsetLeft: rowHeaderWidthPx,
          contentOffsetTop: headerRowHeightPx,
          getColumnWidthPx: (e: any) => Yt(r, e),
          getRowHeightPx: (e: any) => Xt(r, e),
        });
        yn();
        let o = updateChartAnchorInImageAssets(Ae.current, n, e, a);
        (console.info(`[react-xlsx debug] updateWorkbookChartAnchor`, {
          didUpdateAnchor: o,
          nextAnchor: a,
        }),
          (n.chartsByWorkbookSheetIndex = n.chartsByWorkbookSheetIndex.map((t: any) =>
            t.map((t: any) => (t.id === e ? { ...t, anchor: a } : t)),
          )),
          x((t: any) => t.map((t: any) => t.map((t: any) => (t.id === e ? { ...t, anchor: a } : t)))),
          fe((e: any) => e + 1));
      },
      [W, At, Yt, Xt, Qe, U, yn, v, g],
    ),
    Fn = reactInterop.useCallback(
      (e: any, t: any) => {
        if (U || !g || !W || !Ae.current) return;
        let n = g.getSheet(W.workbookSheetIndex),
          r = Gt(e);
        if (!r || r.editable === !1 || r.workbookSheetIndex !== W.workbookSheetIndex) return;
        let i = rectToDrawingAnchor(t, r.anchor, {
          contentOffsetLeft: rowHeaderWidthPx,
          contentOffsetTop: headerRowHeightPx,
          getColumnWidthPx: (e: any) => Yt(n, e),
          getRowHeightPx: (e: any) => Xt(n, e),
        });
        (yn(),
          updateImageRect(Ae.current, e, i) &&
            (N([...Ae.current.imagesByWorkbookSheetIndex]), fe((e: any) => e + 1)));
      },
      [W, Yt, Gt, Xt, U, yn, g],
    ),
    In = reactInterop.useCallback(
      (e: any, t: any, n: any) => {
        let r = At(e);
        if (!r || r.editable === !1) return;
        let i = vt();
        if (!i) return;
        let a = Nn(r.anchor, i);
        Pn(e, { ...a, left: a.left + t, top: a.top + n });
      },
      [vt, At, Nn, Pn],
    ),
    Ln = reactInterop.useCallback(
      (e: any, t: any, n: any) => {
        let r = Gt(e);
        if (!r || r.editable === !1) return;
        let i = (() => {
          let e = vt();
          if (!e) return null;
          let t = (e: any, t: any) => {
            let n = 0;
            for (let r = 0; r < e; r += 1) n += t(r);
            return n;
          };
          if (r.anchor.kind === `absolute`)
            return {
              height: r.anchor.sizeEmu.cy / 9525,
              left: rowHeaderWidthPx + r.anchor.positionEmu.x / 9525,
              top: headerRowHeightPx + r.anchor.positionEmu.y / 9525,
              width: r.anchor.sizeEmu.cx / 9525,
            };
          let n = rowHeaderWidthPx + t(r.anchor.from.col, (t: any) => Yt(e, t)) + r.anchor.from.colOffsetEmu / 9525,
            i = headerRowHeightPx + t(r.anchor.from.row, (t: any) => Xt(e, t)) + r.anchor.from.rowOffsetEmu / 9525;
          if (r.anchor.kind === `one-cell`)
            return {
              height: r.anchor.sizeEmu.cy / 9525,
              left: n,
              top: i,
              width: r.anchor.sizeEmu.cx / 9525,
            };
          let a = rowHeaderWidthPx + t(r.anchor.to.col, (t: any) => Yt(e, t)) + r.anchor.to.colOffsetEmu / 9525,
            o = headerRowHeightPx + t(r.anchor.to.row, (t: any) => Xt(e, t)) + r.anchor.to.rowOffsetEmu / 9525;
          return { height: Math.max(1, o - i), left: n, top: i, width: Math.max(1, a - n) };
        })();
        i && Fn(e, { ...i, left: i.left + t, top: i.top + n });
      },
      [vt, Yt, Gt, Xt, Fn],
    ),
    Rn = reactInterop.useCallback(
      (e: any, t: any, n: any, r: any) => {
        let i = At(e);
        if (!i || i.editable === !1) return;
        let a = vt();
        a && Pn(e, resizeRectWithHandle(Nn(i.anchor, a), t, n, r, 48));
      },
      [vt, At, Nn, Pn],
    ),
    K = reactInterop.useCallback(
      (e: any, t: any, n: any, r: any) => {
        let i = Gt(e);
        if (!i || i.editable === !1) return;
        let a = vt();
        if (!a) return;
        let o = (e: any, t: any) => {
            let n = 0;
            for (let r = 0; r < e; r += 1) n += t(r);
            return n;
          },
          s =
            i.anchor.kind === `absolute`
              ? rowHeaderWidthPx + i.anchor.positionEmu.x / 9525
              : rowHeaderWidthPx + o(i.anchor.from.col, (e: any) => Yt(a, e)) + i.anchor.from.colOffsetEmu / 9525,
          c =
            i.anchor.kind === `absolute`
              ? headerRowHeightPx + i.anchor.positionEmu.y / 9525
              : headerRowHeightPx + o(i.anchor.from.row, (e: any) => Xt(a, e)) + i.anchor.from.rowOffsetEmu / 9525,
          l =
            i.anchor.kind === `two-cell`
              ? Math.max(
                  1,
                  rowHeaderWidthPx + o(i.anchor.to.col, (e: any) => Yt(a, e)) + i.anchor.to.colOffsetEmu / 9525 - s,
                )
              : i.anchor.sizeEmu.cx / 9525;
        Fn(
          e,
          resizeRectWithHandle(
            {
              height:
                i.anchor.kind === `two-cell`
                  ? Math.max(
                      1,
                      headerRowHeightPx +
                        o(i.anchor.to.row, (e: any) => Xt(a, e)) +
                        i.anchor.to.rowOffsetEmu / 9525 -
                        c,
                    )
                  : i.anchor.sizeEmu.cy / 9525,
              left: s,
              top: c,
              width: l,
            },
            t,
            n,
            r,
          ),
        );
      },
      [vt, Yt, Gt, Xt, Fn],
    ),
    zn = reactInterop.useCallback(
      (e: any, t: any) => {
        let n = At(e),
          r = Qe(g, v);
        U ||
          !n ||
          (yn(),
          t.anchor && Ae.current && r && updateChartAnchorInImageAssets(Ae.current, r, e, t.anchor),
          Ae.current && r && updateChartInImageAssets(Ae.current, r, e, t),
          x((n: any) => n.map((n: any) => n.map((n: any) => (n.id === e ? { ...n, ...t } : n)))),
          fe((e: any) => e + 1));
      },
      [Qe, At, U, yn, v, g],
    ),
    q = reactInterop.useCallback(
      (e: any, t: any, n: any) => {
        if (U) return !1;
        let r = At(e);
        if (!r || r.editable === !1) return !1;
        let i = updateChartSeriesValues(r, t, n, g);
        if (!i) return !1;
        zn(e, { series: i.series });
        let a = i.series[t];
        return (
          a &&
            ce((n: any) =>
              n && n.chartId === e && n.kind !== `chart`
                ? { ...n, seriesId: a.id, seriesIndex: t }
                : n,
            ),
          !0
        );
      },
      [At, U, zn, g],
    ),
    Bn = reactInterop.useCallback((e: any, t: any) => {
      if ((B(null), ce(null), ue(null), ie(e), t?.extend && pe.current)) {
        ae(normalizeRange({ start: pe.current, end: e }));
        return;
      }
      ((pe.current = e), ae({ start: e, end: e }));
    }, []),
    Vn = reactInterop.useCallback((e: any) => {
      let t = normalizeRange(e);
      (B(null), ce(null), ue(null), (pe.current = t.start), ie(t.end), ae(t));
    }, []),
    Hn = reactInterop.useCallback(() => {
      ((pe.current = null), ie(null), ae(null), B(null), ce(null), ue(null));
    }, []),
    Un = reactInterop.useCallback(() => {
      let e = vt(),
        t = z ?? (R ? { start: R, end: R } : null);
      if (U || !e || !g || !t) return;
      let n = normalizeRange(t),
        r = [];
      for (let t = n.start.row; t <= n.end.row; t += 1)
        for (let i = n.start.col; i <= n.end.col; i += 1) {
          if (e.isMergedSecondary(t, i)) continue;
          let n = { row: t, col: i },
            a = hn(n);
          if (!a) continue;
          e.setCell(cellAddress({ row: t, col: i }), ``);
          let o = hn(n);
          o && r.push({ after: o, before: a, cell: n });
        }
      (_t(g), tt(g), wn(r, n, R ?? n.start));
    }, [R, hn, vt, _t, U, wn, tt, z, g]),
    Wn = reactInterop.useCallback(
      (e: any, t: any) => {
        let n = vt();
        if (U || !n || !g) return;
        let r = hn(e);
        if (!r) return;
        let i = parseCellValueInput(t);
        n.setCell(cellAddress(e), i);
        let a = hn(e);
        a && (_t(g), tt(g), Cn(e, r, a));
      },
      [hn, vt, _t, U, Cn, tt, g],
    ),
    Gn = reactInterop.useCallback(
      (e: any, t: any) => {
        let n = vt();
        if (U || !n || !g) return;
        let r = hn(e);
        if (!r) return;
        (t.trim(), t.trim() ? n.setFormula(cellAddress(e), t) : n.setCell(cellAddress(e), ``));
        let i = hn(e);
        i && (_t(g), tt(g), Cn(e, r, i));
      },
      [hn, vt, _t, U, Cn, tt, g],
    ),
    Kn = reactInterop.useCallback(
      (e: any, t: any) => {
        let n = vt();
        if (U || !n || !g) return;
        let r = hn(e);
        if (!r) return;
        n.setCellStyleAt(e.row, e.col, t);
        let i = hn(e);
        i && (tt(g), Cn(e, r, i));
      },
      [hn, vt, U, Cn, tt, g],
    ),
    qn = reactInterop.useCallback(
      (e: any) => {
        R && Wn(R, e);
      },
      [R, Wn],
    ),
    Jn = reactInterop.useCallback(
      (e: any) => {
        R && Gn(R, e);
      },
      [R, Gn],
    ),
    Xn = reactInterop.useCallback(
      (e: any) =>
        sn?.kind === `chartSeries` ? q(sn.chartId, sn.seriesIndex, e) : R ? (Gn(R, e), !0) : !1,
      [R, sn, Gn, q],
    ),
    Qn = reactInterop.useCallback(
      (e: any) => {
        R && Kn(R, e);
      },
      [R, Kn],
    ),
    $n = reactInterop.useCallback(
      (e: any, t: any) => {
        let n = vt();
        if (U || !n || !g) return;
        let r = normalizeRange(e),
          i = [];
        for (let e = r.start.row; e <= r.end.row; e += 1)
          for (let t = r.start.col; t <= r.end.col; t += 1) {
            let n = { row: e, col: t },
              r = hn(n);
            r && i.push({ before: r, cell: n });
          }
        if (i.length === 0) return;
        n.setRangeStyle(rangeToRef(r), t);
        let a = [];
        for (let e of i) {
          let t = hn(e.cell);
          t && a.push({ after: t, before: e.before, cell: e.cell });
        }
        (tt(g), wn(a, z, R));
      },
      [R, hn, vt, U, wn, tt, z, g],
    ),
    er = reactInterop.useCallback(
      (e: any) => {
        let t = vt();
        if (U || !t || !g || !z) return;
        let n = normalizeRange(z),
          r = normalizeRange(e),
          i = n.end.row - n.start.row + 1,
          a = n.end.col - n.start.col + 1;
        if (i <= 0 || a <= 0) return;
        let o = [];
        for (let e = r.start.row; e <= r.end.row; e += 1)
          for (let s = r.start.col; s <= r.end.col; s += 1) {
            if (rangeContainsCell(n, { row: e, col: s })) continue;
            let c = { row: e, col: s },
              l = hn(c);
            if (!l) continue;
            let u = n.start.row + ((e - r.start.row) % i),
              d = n.start.col + ((s - r.start.col) % a),
              f = t.getFormulaAt(u, d),
              p = cloneCellStyle(t.getCellStyleAt(u, d));
            if (f) t.setFormula(cellAddress(c), f);
            else {
              let e = cloneCellValue(t.getCellAt(u, d).toJs());
              t.setCell(cellAddress(c), e);
            }
            p && typeof p == `object` && t.setCellStyleAt(c.row, c.col, p);
            let m = hn(c);
            m && o.push({ after: m, before: l, cell: c });
          }
        (_t(g), tt(g), ae(r), ie(r.end), (pe.current = r.start), wn(o, r, r.end));
      },
      [hn, vt, _t, U, wn, tt, z, g],
    ),
    tr = reactInterop.useCallback(() => {
      let e = vt();
      U || !e || !z || !g || (yn(), e.mergeCells(rangeToRef(z)), tt(g));
    }, [vt, U, yn, tt, z, g]),
    nr = reactInterop.useCallback(() => {
      let e = vt();
      U || !e || !z || !g || (yn(), e.unmergeCells(rangeToRef(z)), tt(g));
    }, [vt, U, yn, tt, z, g]),
    rr = reactInterop.useCallback(
      (e: any) => {
        if (U || !g) return;
        yn();
        let t = e?.trim() || `Sheet`,
          n = t,
          r = 2;
        for (; g.sheetIndex(n) !== void 0;) ((n = `${t} ${r}`), (r += 1));
        (g.addSheet(n),
          (Pe.current = [...Pe.current, null]),
          j((e: any) => [...e, []]),
          N((e: any) => [...e, []]),
          F((e: any) => [...e, []]),
          Ae.current &&
            (Ae.current.formControlsByWorkbookSheetIndex = [
              ...Ae.current.formControlsByWorkbookSheetIndex,
              [],
            ]));
        let i = buildSheetStates(
          g,
          Ae.current?.sheetStatesByWorkbookSheetIndex,
          Ae.current?.themePalette,
          Ae.current?.styleById,
          Ae.current?.namedCellStyleByName,
          Ae.current?.tableStyleByName,
          c,
        );
        y(i);
        let a = Ae.current ? hydrateChartAssets(g, Ae.current, collectSheetOrigins(i), c) : null;
        Ae.current && Ye(a);
        let o = i.findIndex((e: any) => e.name === n);
        ee(o >= 0 ? o : 0);
        let s = a?.tabs.findIndex((e: any) => e.kind === `sheet` && e.name === n) ?? -1;
        (s >= 0 && te(s), fe((e: any) => e + 1));
      },
      [U, yn, Ye, g],
    ),
    ir = reactInterop.useCallback(() => {
      if (U || !g || !W) return;
      (yn(),
        g.removeSheet(W.workbookSheetIndex),
        (Pe.current = Pe.current.filter((e: any, t: any) => t !== W.workbookSheetIndex)),
        j((e: any) => e.filter((e: any, t: any) => t !== W.workbookSheetIndex)),
        N((e: any) => e.filter((e: any, t: any) => t !== W.workbookSheetIndex)),
        F((e: any) => e.filter((e: any, t: any) => t !== W.workbookSheetIndex)),
        Ae.current &&
          ((Ae.current.formControlsByWorkbookSheetIndex =
            Ae.current.formControlsByWorkbookSheetIndex.filter(
              (e: any, t: any) => t !== W.workbookSheetIndex,
            )),
          (Ae.current.sheetStatesByWorkbookSheetIndex =
            Ae.current.sheetStatesByWorkbookSheetIndex.filter(
              (e: any, t: any) => t !== W.workbookSheetIndex,
            ))));
      let e = buildSheetStates(
        g,
        Ae.current?.sheetStatesByWorkbookSheetIndex,
        Ae.current?.themePalette,
        Ae.current?.styleById,
        Ae.current?.namedCellStyleByName,
        Ae.current?.tableStyleByName,
        c,
      );
      (y(e),
        Ae.current && Ye(hydrateChartAssets(g, Ae.current, collectSheetOrigins(e), c)),
        ee((t: any) => Math.max(0, Math.min(t, e.length - 1))),
        fe((e: any) => e + 1));
    }, [W, U, yn, Ye, g]),
    ar = reactInterop.useCallback(
      (e: any, t: any) => {
        if (U || !g) return;
        let n = e.trim();
        if (!n) return;
        let r = t ?? z;
        r && (yn(), g.defineName(n, rangeToRef(r)), fe((e: any) => e + 1));
      },
      [U, yn, z, g],
    ),
    or = reactInterop.useCallback(
      (e: any) => {
        let t = vt(),
          n = R ?? z?.start ?? null;
        if (U || !t || !g || !n || !e) return !1;
        let r = parseClipboardText(e);
        if (r.length === 0 || r.every((e: any) => e.length === 0)) return !1;
        let i = [];
        for (let e = 0; e < r.length; e += 1) {
          let a = r[e] ?? [];
          for (let r = 0; r < a.length; r += 1) {
            let o = a[r] ?? ``,
              s = { col: n.col + r, row: n.row + e },
              c = hn(s);
            if (c)
              if (o.startsWith(`=`) && o.length > 1) {
                t.setFormula(cellAddress(s), o);
                let e = hn(s);
                if (!e) continue;
                i.push({ after: e, before: c, cell: s });
              } else {
                let e = parseCellValueInput(o);
                t.setCell(cellAddress(s), e);
                let n = hn(s);
                if (!n) continue;
                i.push({ after: n, before: c, cell: s });
              }
          }
        }
        (_t(g), tt(g));
        let a = normalizeRange({
          start: n,
          end: {
            col: n.col + Math.max(0, Math.max(...r.map((e: any) => e.length), 1) - 1),
            row: n.row + r.length - 1,
          },
        });
        return (ie(n), ae(a), (pe.current = n), wn(i, a, n), !0);
      },
      [R, hn, vt, _t, U, wn, tt, z, g],
    ),
    sr = reactInterop.useCallback(
      (e: any) => {
        let t = vt(),
          n = R ?? z?.start ?? null;
        if (U || !t || !g || !n || !e) return !1;
        let r;
        try {
          r = JSON.parse(e);
        } catch {
          return !1;
        }
        if (!Array.isArray(r.cells) || r.cells.length === 0) return !1;
        let i =
            Array.isArray(r.merges) &&
            r.merges.some((e: any) => (e.rowSpan ?? 1) > 1 || (e.colSpan ?? 1) > 1),
          a = [];
        i && yn();
        for (let e of r.cells) {
          let r = { col: n.col + e.colOffset, row: n.row + e.rowOffset },
            o = i ? null : hn(r);
          if (e.formula) {
            if ((t.setFormula(cellAddress(r), e.formula), o)) {
              let e = hn(r);
              if (!e) continue;
              a.push({ after: e, before: o, cell: r });
            }
          } else if ((t.setCell(cellAddress(r), e.value), o)) {
            let e = hn(r);
            if (!e) continue;
            a.push({ after: e, before: o, cell: r });
          }
        }
        if (Array.isArray(r.merges))
          for (let e of r.merges) {
            if ((e.rowSpan ?? 1) <= 1 && (e.colSpan ?? 1) <= 1) continue;
            let r = normalizeRange({
              start: { col: n.col + e.colOffset, row: n.row + e.rowOffset },
              end: {
                col: n.col + e.colOffset + e.colSpan - 1,
                row: n.row + e.rowOffset + e.rowSpan - 1,
              },
            });
            t.mergeCells(rangeToRef(r));
          }
        (_t(g), tt(g));
        let o = normalizeRange({
          start: n,
          end: {
            col: n.col + Math.max((r.cols ?? 1) - 1, 0),
            row: n.row + Math.max((r.rows ?? 1) - 1, 0),
          },
        });
        return (ie(n), ae(o), (pe.current = n), i || wn(a, o, n), !0);
      },
      [R, hn, vt, _t, U, yn, wn, tt, z, g],
    ),
    J = reactInterop.useCallback(async () => {
      let e = $t();
      if (!e || typeof navigator > `u` || !navigator.clipboard) return !1;
      if (typeof ClipboardItem == `function` && navigator.clipboard.write) {
        let t = new ClipboardItem({
          [rangeClipboardMimeType]: new Blob([e.structured], { type: rangeClipboardMimeType }),
          "text/html": new Blob([e.html], { type: `text/html` }),
          "text/plain": new Blob([e.text], { type: `text/plain` }),
        });
        return (await navigator.clipboard.write([t]), !0);
      }
      return (await navigator.clipboard.writeText(e.text), !0);
    }, [$t]),
    cr = reactInterop.useCallback(async () => {
      if (U || typeof navigator > `u` || !navigator.clipboard) return !1;
      if (navigator.clipboard.read) {
        let e = await navigator.clipboard.read();
        for (let t of e) if (t.types.includes(rangeClipboardMimeType)) return sr(await (await t.getType(rangeClipboardMimeType)).text());
        for (let t of e)
          if (t.types.includes(`text/plain`))
            return or(await (await t.getType(`text/plain`)).text());
      }
      return or(await navigator.clipboard.readText());
    }, [sr, or, U]),
    lr = reactInterop.useCallback(() => {
      if (U || !g || me.current.length === 0) return;
      let e = me.current.pop();
      if (!e) return;
      if (e.kind === `cell-edit`) {
        (pushUndoEntry(he.current, e), _e((e: any) => e + 1), _n(e, `undo`));
        return;
      }
      if (e.kind === `range-edit`) {
        (pushUndoEntry(he.current, e), _e((e: any) => e + 1), vn(e, `undo`));
        return;
      }
      let t = mn();
      (t && pushUndoEntry(he.current, t), _e((e: any) => e + 1), gn(e));
    }, [_n, vn, mn, U, gn, g]),
    ur = reactInterop.useCallback(() => {
      if (U || !g || he.current.length === 0) return;
      let e = he.current.pop();
      if (!e) return;
      if (e.kind === `cell-edit`) {
        (pushUndoEntry(me.current, e), _e((e: any) => e + 1), _n(e, `redo`));
        return;
      }
      if (e.kind === `range-edit`) {
        (pushUndoEntry(me.current, e), _e((e: any) => e + 1), vn(e, `redo`));
        return;
      }
      let t = mn();
      (t && pushUndoEntry(me.current, t), _e((e: any) => e + 1), gn(e));
    }, [_n, vn, mn, U, gn, g]);
  return reactInterop.useMemo(
    () => ({
      activeCell: R,
      activeCellAddress: en,
      activeSheet: W,
      activeSheetIndex: I,
      activeTab: nt,
      activeTabIndex: L,
      addFormControl: bn,
      addSheet: rr,
      canRedo: fn,
      canDownload: !!(r ?? u),
      canExport: !!g,
      canLoadDeferred: un,
      canUndo: dn,
      canZoomIn: ct,
      canZoomOut: lt,
      charts: Mt,
      chartsheets: S,
      clearSelectedChart: Ft,
      clearSelectedChartElement: It,
      clearSelectedCells: Un,
      clearSelectedImage: Jt,
      clearSelection: Hn,
      continueDeferredLoad: gt,
      copySelectionToClipboard: J,
      defaultZoomScale: ot,
      deferredLoadFileSize: Oe,
      defineNamedRange: ar,
      displayFileName: Le,
      download: En,
      exportCsv: On,
      exportXlsx: Dn,
      error: m,
      fillSelection: er,
      formControls: Vt,
      getChartById: At,
      getChartSeriesFormula: an,
      getChartsheetById: jt,
      getImageById: Gt,
      getSheetCharts: kt,
      getSheetFormControls: Bt,
      getSheetImages: Rt,
      getSheetShapes: Ut,
      file: r,
      getClipboardData: $t,
      getCellDisplayValue: Zt,
      getCellFormula: Qt,
      getFormControlItems: Ht,
      getCellSnapshotAsync: xe ? xt : void 0,
      getActiveWorksheet: vt,
      getRowsBatchAsync: xe ? St : void 0,
      images: zt,
      isLoadDeferred: ln,
      isLoading: f,
      isChartsLoading: E,
      isWorkerBacked: xe,
      mergeSelection: tr,
      maxZoomScale: maxZoomScale,
      minZoomScale: minZoomScale,
      moveChartBy: In,
      moveImageBy: Ln,
      pasteFromClipboard: cr,
      pasteStructuredClipboardData: sr,
      pasteText: or,
      removeActiveSheet: ir,
      removeFormControl: Sn,
      readOnly: U,
      recalculate: kn,
      redo: ur,
      resetZoom: pt,
      revision: de,
      resizeChartBy: Rn,
      resizeImageBy: K,
      resizeColumn: jn,
      resizeRow: Mn,
      setCellFormula: Gn,
      setCellStyle: Kn,
      setCellValue: Wn,
      setRangeStyle: $n,
      setSelectedFormula: Xn,
      setZoomScale: ft,
      setChartRect: Pn,
      setChartSeriesFormula: q,
      setImageRect: Fn,
      selectedChart: Nt,
      selectedChartElement: se,
      selectedChartFormula: on,
      selectedChartId: oe,
      selectedCellFormula: rn,
      selectedFormula: cn,
      selectedFormulaTarget: sn,
      selectedImage: Kt,
      selectedImageId: le,
      selectedRangeAddress: tn,
      selectedValue: nn,
      selectCell: Bn,
      selectChart: Pt,
      selectChartElement: Lt,
      selectImage: qt,
      selectRange: Vn,
      selection: z,
      setActiveSheetIndex: ut,
      setActiveTabIndex: dt,
      setSelectedCellFormula: Jn,
      setSelectedCellStyle: Qn,
      setSelectedCellValue: qn,
      sheets: v,
      shapes: Wt,
      src: u,
      sortState: Ce,
      sortTable: Tn,
      tabs: w,
      tables: bt,
      undo: lr,
      unmergeSelection: nr,
      updateChart: zn,
      updateFormControl: xn,
      workbook: g,
      zoomIn: mt,
      zoomOut: ht,
      zoomScale: st,
    }),
    [
      R,
      en,
      W,
      I,
      nt,
      L,
      bn,
      rr,
      un,
      fn,
      dn,
      ct,
      lt,
      Mt,
      S,
      Ft,
      It,
      Un,
      Jt,
      gt,
      J,
      ot,
      Oe,
      ar,
      Le,
      En,
      m,
      On,
      Dn,
      r,
      er,
      Vt,
      At,
      an,
      jt,
      Gt,
      kt,
      Bt,
      Rt,
      Ut,
      $t,
      Zt,
      Qt,
      Ht,
      xt,
      vt,
      ge,
      Vt,
      zt,
      ln,
      f,
      E,
      xe,
      tr,
      pt,
      In,
      Ln,
      cr,
      sr,
      or,
      ir,
      Sn,
      U,
      kn,
      ur,
      de,
      Rn,
      K,
      jn,
      Mn,
      Gn,
      Kn,
      Wn,
      $n,
      Xn,
      ft,
      Pn,
      q,
      Fn,
      Nt,
      se,
      on,
      oe,
      rn,
      cn,
      sn,
      Kt,
      le,
      tn,
      nn,
      Bn,
      Pt,
      Lt,
      qt,
      Vn,
      z,
      ut,
      dt,
      Jn,
      Qn,
      qn,
      v,
      Wt,
      Ce,
      Tn,
      u,
      St,
      w,
      bt,
      lr,
      nr,
      zn,
      xn,
      g,
      mt,
      ht,
      st,
    ],
  );
}

/* ============================================================================
 * [B] canvas/SVG 图表渲染层段（js 183972–189511 / jsx 38365–41540）
 * ==========================================================================*/
var WORLD_COUNTRY_FEATURES = Pn(Bu, Bu.objects.countries).features,
  US_STATE_FIPS_INFO: Record<string, any> = {
    "01": { code: `AL`, name: `Alabama` },
    "02": { code: `AK`, name: `Alaska` },
    "04": { code: `AZ`, name: `Arizona` },
    "05": { code: `AR`, name: `Arkansas` },
    "06": { code: `CA`, name: `California` },
    "08": { code: `CO`, name: `Colorado` },
    "09": { code: `CT`, name: `Connecticut` },
    10: { code: `DE`, name: `Delaware` },
    11: { code: `DC`, name: `District of Columbia` },
    12: { code: `FL`, name: `Florida` },
    13: { code: `GA`, name: `Georgia` },
    15: { code: `HI`, name: `Hawaii` },
    16: { code: `ID`, name: `Idaho` },
    17: { code: `IL`, name: `Illinois` },
    18: { code: `IN`, name: `Indiana` },
    19: { code: `IA`, name: `Iowa` },
    20: { code: `KS`, name: `Kansas` },
    21: { code: `KY`, name: `Kentucky` },
    22: { code: `LA`, name: `Louisiana` },
    23: { code: `ME`, name: `Maine` },
    24: { code: `MD`, name: `Maryland` },
    25: { code: `MA`, name: `Massachusetts` },
    26: { code: `MI`, name: `Michigan` },
    27: { code: `MN`, name: `Minnesota` },
    28: { code: `MS`, name: `Mississippi` },
    29: { code: `MO`, name: `Missouri` },
    30: { code: `MT`, name: `Montana` },
    31: { code: `NE`, name: `Nebraska` },
    32: { code: `NV`, name: `Nevada` },
    33: { code: `NH`, name: `New Hampshire` },
    34: { code: `NJ`, name: `New Jersey` },
    35: { code: `NM`, name: `New Mexico` },
    36: { code: `NY`, name: `New York` },
    37: { code: `NC`, name: `North Carolina` },
    38: { code: `ND`, name: `North Dakota` },
    39: { code: `OH`, name: `Ohio` },
    40: { code: `OK`, name: `Oklahoma` },
    41: { code: `OR`, name: `Oregon` },
    42: { code: `PA`, name: `Pennsylvania` },
    44: { code: `RI`, name: `Rhode Island` },
    45: { code: `SC`, name: `South Carolina` },
    46: { code: `SD`, name: `South Dakota` },
    47: { code: `TN`, name: `Tennessee` },
    48: { code: `TX`, name: `Texas` },
    49: { code: `UT`, name: `Utah` },
    50: { code: `VT`, name: `Vermont` },
    51: { code: `VA`, name: `Virginia` },
    53: { code: `WA`, name: `Washington` },
    54: { code: `WV`, name: `West Virginia` },
    55: { code: `WI`, name: `Wisconsin` },
    56: { code: `WY`, name: `Wyoming` },
  },
  US_STATE_FEATURES = Pn(zu, zu.objects.states).features.map((e: any) => {
    let t = US_STATE_FIPS_INFO[typeof e.id == `string` ? e.id : String(e.id ?? ``)];
    return {
      ...e,
      properties: {
        ...(e.properties ?? {}),
        name: t?.name,
        regionSet: `us-state`,
        stateCode: t?.code,
      },
    };
  }),
  COUNTRY_NAME_ALIASES = new Map([
    [`us`, `united states of america`],
    [`usa`, `united states of america`],
    [`u s a`, `united states of america`],
    [`united states`, `united states of america`],
    [`united states america`, `united states of america`],
    [`u s`, `united states of america`],
    [`uk`, `united kingdom`],
    [`u k`, `united kingdom`],
    [`uae`, `united arab emirates`],
    [`u a e`, `united arab emirates`],
    [`south korea`, `korea, south`],
    [`north korea`, `korea, north`],
    [`russia`, `russian federation`],
    [`vietnam`, `viet nam`],
    [`czech republic`, `czechia`],
    [`ivory coast`, `cote d'ivoire`],
    [`côte divoire`, `cote d'ivoire`],
  ]),
  US_STATE_NAME_ALIASES = new Map([
    [`district of columbia`, `district of columbia`],
    [`washington dc`, `district of columbia`],
    [`washington d c`, `district of columbia`],
    [`dc`, `district of columbia`],
    [`d c`, `district of columbia`],
  ]),
  COUNTRY_FEATURE_BY_NAME = (() => {
    let e = new Map();
    return (
      WORLD_COUNTRY_FEATURES.forEach((t: any) => {
        let n = normalizeGeoName(typeof t.properties?.name == `string` ? t.properties.name : ``);
        n.length > 0 && e.set(n, t);
      }),
      e
    );
  })(),
  US_STATE_FEATURE_BY_NAME = (() => {
    let e = new Map();
    return (
      US_STATE_FEATURES.forEach((t: any) => {
        let n = normalizeGeoName(typeof t.properties?.name == `string` ? t.properties.name : ``);
        n.length > 0 && e.set(n, t);
        let r = normalizeGeoName(t.properties?.stateCode);
        r.length > 0 && e.set(r, t);
      }),
      US_STATE_NAME_ALIASES.forEach((t, n) => {
        let r = e.get(normalizeGeoName(t));
        r && e.set(normalizeGeoName(n), r);
      }),
      e
    );
  })();
function parseHexColor(e: any) {
  let t = /^#?([0-9a-f]{6})$/i.exec(e);
  return t
    ? {
        blue: Number.parseInt(t[1].slice(4, 6), 16),
        green: Number.parseInt(t[1].slice(2, 4), 16),
        red: Number.parseInt(t[1].slice(0, 2), 16),
      }
    : null;
}
function mixHexColors(e: any, t: any, n: any) {
  let r = parseHexColor(e),
    i = parseHexColor(t);
  if (!r || !i) return e;
  let a = Math.max(0, Math.min(1, n)),
    o = (e: any, t: any) => Math.round(e + (t - e) * a);
  return `#${[o(r.red, i.red), o(r.green, i.green), o(r.blue, i.blue)].map((e) => e.toString(16).padStart(2, `0`)).join(``)}`;
}
function lightenHexColor(e: any, t: any) {
  return mixHexColors(e, `#ffffff`, t);
}
function darkenHexColor(e: any, t: any) {
  return mixHexColors(e, `#000000`, t);
}
function clampNumber(e: any, t: any, n: any) {
  return Math.max(t, Math.min(n, e));
}
function normalizeGeoName(e: any) {
  return typeof e == `string`
    ? e
        .normalize(`NFD`)
        .replace(/[\u0300-\u036f]/g, ``)
        .replace(/&/g, ` and `)
        .replace(/[^a-zA-Z0-9]+/g, ` `)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ` `)
    : ``;
}
export var SPREADSHEET_FONT_STACK = [`"Aptos"`, `Calibri`, `Carlito`, `"Segoe UI"`, `Tahoma`, `Arial`, `sans-serif`].join(
    `, `,
  ),
  DEFAULT_CHART_TEXT_COLOR = `#000000`,
  DEFAULT_AXIS_LABEL_COLOR = `#7f7f7f`;
function quoteFontFamilyName(e: any) {
  let t = e.trim();
  return t
    ? t.startsWith(`"`) ||
      t.startsWith(`'`) ||
      /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|math|emoji|fangsong)$/i.test(t)
      ? t
      : /\s/.test(t)
        ? `"${t.replace(/"/g, `\\"`)}"`
        : t
    : ``;
}
function resolveFontFamilyStack(e: any) {
  if (!e || e.trim().length === 0) return SPREADSHEET_FONT_STACK;
  let t = e
    .split(`,`)
    .map(quoteFontFamilyName)
    .filter((e: any) => e.length > 0);
  return t.length === 0 ? SPREADSHEET_FONT_STACK : [...t, `"Segoe UI"`, `Tahoma`, `Arial`, `sans-serif`].join(`, `);
}
function resolveTitleTextColor(e: any) {
  return e.textColor ?? e.titleColor ?? DEFAULT_CHART_TEXT_COLOR;
}
function resolveAxisLabelColor(e: any) {
  return e.axisLabelColor ?? e.textColor ?? e.titleColor ?? DEFAULT_CHART_TEXT_COLOR;
}
function resolveSecondaryTextColor(e: any) {
  return e.textColor ?? e.axisLabelColor ?? DEFAULT_AXIS_LABEL_COLOR;
}
function toFiniteNumber(e: any) {
  if (typeof e == `number` && Number.isFinite(e)) return e;
  if (typeof e == `string`) {
    let t = e.trim().replace(/,/g, ``);
    if (!t) return null;
    let n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
function resolveSeriesFillColor(e: any, t: any) {
  let n = e.series[t],
    r = e.chartColorPalette?.[t % Math.max(1, e.chartColorPalette.length)];
  return n?.color ?? n?.lineColor ?? r ?? e.textColor ?? `#222222`;
}
function resolveSeriesLineColor(e: any, t: any) {
  let n = e.series[t],
    r = e.chartColorPalette?.[t % Math.max(1, e.chartColorPalette.length)];
  return n?.lineColor ?? n?.color ?? r ?? e.textColor ?? `#222222`;
}
function resolveDataPointColor(e: any, t: any, n: any = 0) {
  let r = e.series[n]?.dataPointStyles?.find((e: any) => e.index === t);
  if (r?.color) return r.color;
  let i = e.series[n]?.dataPoints?.[t];
  if (i && typeof i == `object`) {
    let e = i;
    if (typeof e.color == `string`) return e.color;
    if (typeof e.fillColor == `string`) return e.fillColor;
    if (typeof e.solidFillHex == `string`) {
      let t = e.solidFillHex.replace(/^#/, ``);
      if (/^[0-9a-fA-F]{6}$/.test(t)) return `#${t.toLowerCase()}`;
    }
    let t = e.shapeProperties && typeof e.shapeProperties == `object` ? e.shapeProperties : null;
    if (t && typeof t.solidFillHex == `string`) {
      let e = t.solidFillHex.replace(/^#/, ``);
      if (/^[0-9a-fA-F]{6}$/.test(e)) return `#${e.toLowerCase()}`;
    }
  }
  let a = e.chartColorPalette;
  return a && a.length > 0
    ? (a[(t + (e.chartColorPaletteOffset ?? 0)) % a.length] ?? a[t % a.length])
    : resolveSeriesFillColor(e, n);
}
function hasHistogramBins(e: any) {
  let t = e?.raw && typeof e.raw == `object` ? e.raw : null;
  return Array.isArray(t?.chartExHistogramBins) && t.chartExHistogramBins.length > 0;
}
function hasHistogramSeries(e: any) {
  return e.series.some((e: any) => hasHistogramBins(e));
}
function findGeoFeature(e: any, t: any = `country`) {
  let n = normalizeGeoName(e);
  if (!n) return null;
  if (t === `us-state`) {
    let e = US_STATE_NAME_ALIASES.get(n) ?? n;
    return US_STATE_FEATURE_BY_NAME.get(e) ?? null;
  }
  let r = COUNTRY_NAME_ALIASES.get(n) ?? n;
  return COUNTRY_FEATURE_BY_NAME.get(r) ?? null;
}
function resolveReferenceLineColor(e: any, t: any) {
  return e.series[t]?.color ?? e.series[t]?.lineColor ?? e.chartColorPalette?.[0] ?? `#ff006e`;
}
function resolveRegionMapBaseColor(e: any, t: any) {
  let n = normalizeHexColor(resolveDataPointColor(e, 0, t));
  if (n) return n;
  let r = Array.isArray(e.chartColorPalette) ? e.chartColorPalette : [];
  if (r.length > 0) {
    let t = normalizeHexColor(r[(((e.chartColorPaletteOffset ?? 0) % r.length) + r.length) % r.length]);
    if (t) return t;
  }
  return normalizeHexColor(e.series[t]?.color ?? e.series[t]?.lineColor) ?? `#4f81bd`;
}
function extractValueColorScale(e: any) {
  let t = e?.raw && typeof e.raw == `object` ? e.raw : null,
    n = Array.isArray(t?.valueColors) ? t.valueColors.map((e: any) => normalizeHexColor(e)).filter((e: any) => !!e) : [];
  return n.length >= 2 ? n : null;
}
function extractCategoryColorLabels(e: any) {
  let t = e?.raw && typeof e.raw == `object` ? e.raw : null,
    n = Array.isArray(t?.chartExColorStrings)
      ? t.chartExColorStrings
          .map((e: any) => (typeof e == `string` ? e.trim() : ``))
          .filter((e: any) => e.length > 0)
      : [];
  return n.length > 0 ? n : null;
}
function extractLayoutProperties(e: any) {
  let t = e?.raw && typeof e.raw == `object` ? e.raw : null;
  return t?.layoutProperties && typeof t.layoutProperties == `object` ? t.layoutProperties : null;
}
function resolveRegionSet(e: any, t: any) {
  let n = typeof t?.cultureRegion == `string` ? t.cultureRegion.trim().toUpperCase() : ``,
    r = e.filter((e: any) => findGeoFeature(e, `country`) != null).length,
    i = e.filter((e: any) => findGeoFeature(e, `us-state`) != null).length;
  return n === `US` && i > 0 && i >= r ? `us-state` : `country`;
}
function featuresForRegionSet(e: any) {
  return e === `us-state` ? US_STATE_FEATURES : WORLD_COUNTRY_FEATURES;
}
function sampleColorRamp(e: any, t: any) {
  if (e.length === 0) return `#4f81bd`;
  if (e.length === 1) return e[0];
  let n = clampNumber(t, 0, 1) * (e.length - 1),
    r = Math.floor(n),
    i = Math.min(e.length - 1, r + 1),
    a = n - r;
  return mixHexColors(e[r] ?? e[0], e[i] ?? e[e.length - 1], a);
}
function resolveRegionValueColor(e: any, t: any, n: any) {
  let r = extractValueColorScale(e.series[t] ?? null);
  if (r) return sampleColorRamp(r, n);
  let i = resolveRegionMapBaseColor(e, t);
  return sampleColorRamp([lightenHexColor(i, 0.82), lightenHexColor(i, 0.28), darkenHexColor(i, 0.08)], n);
}
function resolveRegionMapStrokeColor(e: any, t: any) {
  return normalizeHexColor(resolveReferenceLineColor(e, t)) ?? `#ff006e`;
}
function regionMapLegendItems(e: any) {
  let t = Math.max(
      0,
      e.series.findIndex((e: any) => e.hidden !== !0),
    ),
    n = extractCategoryColorLabels(e.series[t] ?? null);
  if (n) return Array.from(new Set(n)).map((n, r) => ({ color: resolveDataPointColor(e, r, t), label: n }));
  let r = (e.series[t]?.values ?? []).map((e: any) => toFiniteNumber(e)).filter((e: any) => e != null);
  if (r.length === 0) return [];
  let i = Math.min(...r),
    a = Math.max(...r),
    o = buildTicks(i, a, void 0).slice(0, 5);
  return o.slice(0, -1).map((n, r) => {
    let s = o[r + 1] ?? a;
    return {
      color: resolveRegionValueColor(e, t, (n + (s - n) * 0.5 - i) / Math.max(1e-6, a - i)),
      label: `${formatTickNumber(n)}-${formatTickNumber(s)}`,
    };
  });
}
function normalizeChartStyleId(e: any) {
  return typeof e != `number` || !Number.isFinite(e) ? null : e >= 100 ? e - 100 : e;
}
function surfaceStyle32Palette(e: any, t: any) {
  if (normalizeChartStyleId(e.chartStyleId) !== 32) return null;
  let n = e.series[t]?.color ?? e.series[t]?.lineColor ?? e.chartColorPalette?.[0] ?? null;
  return n ? [lightenHexColor(n, 0.16), darkenHexColor(n, 0.42), n, darkenHexColor(n, 0.18), lightenHexColor(n, 0.08), darkenHexColor(n, 0.3)] : null;
}
function resolvePieSliceColor(e: any, t: any, n: any = 0) {
  let r = e.series[n]?.dataPointStyles?.find((e: any) => e.index === t);
  if (r?.color) return r.color;
  let i = surfaceStyle32Palette(e, n);
  return i && i.length > 0 ? (i[t % i.length] ?? i[0]) : resolveDataPointColor(e, t, n);
}
function pickPrimarySeriesIndex(e: any) {
  let t = 0,
    n = -1 / 0;
  return (
    e.series.forEach((e: any, r: any) => {
      let i = 0,
        a = 0;
      for (let t of e.values) {
        let e = toFiniteNumber(t);
        e != null && e > 0 && ((i += 1), (a += e));
      }
      let o = i * 1e6 + a;
      o > n && ((n = o), (t = r));
    }),
    t
  );
}
function resolveBarSeriesStyle(e: any, t: any, n: any, r: any) {
  let i = e.series[t],
    a = resolveSeriesFillColor(e, t),
    o = resolveSeriesLineColor(e, t),
    s =
      typeof i?.lineWidthPx == `number` && Number.isFinite(i.lineWidthPx)
        ? Math.max(0.8, Math.min(4, i.lineWidthPx))
        : 1;
  return n < 0 && i?.invertIfNegative
    ? {
        fill:
          r === `none`
            ? `none`
            : (i.negativeColor ?? (r === `chartArea` ? e.chartAreaFillColor : void 0) ?? a),
        stroke: i.negativeLineColor ?? o,
        strokeWidth: s,
      }
    : { fill: a, stroke: o, strokeWidth: s };
}
function barPaddingFromGapWidth(e: any) {
  let t = typeof e == `number` && Number.isFinite(e) ? clampNumber(e, 0, 500) : 150,
    n = clampNumber(t / (100 + t), 0.05, 0.88);
  return { inner: n, outer: clampNumber(n * 0.5, 0, 0.45) };
}
function normalizeLegendPosition(e: any) {
  switch (e) {
    case `bottom`:
      return `bottom`;
    case `left`:
      return `left`;
    case `right`:
      return `right`;
    case `top`:
      return `top`;
    case `b`:
      return `bottom`;
    case `l`:
      return `left`;
    case `r`:
      return `right`;
    case `t`:
      return `top`;
    default:
      return e;
  }
}
function normalizeMarkerSymbol(e: any) {
  return !e || e === `none` ? `none` : e === `auto` ? `circle` : e;
}
export function resolveChartRenderType(e: any) {
  return e.chartType === `ScatterSmooth`
    ? `ScatterSmooth`
    : e.chartType === `Pie` && e.is3d
      ? `Pie3D`
      : e.chartType === `Pie` &&
          e.series.some(
            (e: any) =>
              Array.isArray(e.dataPoints) &&
              e.dataPoints.some(
                (e: any) =>
                  typeof e == `object` &&
                  !!e &&
                  `explosion` in e &&
                  typeof e.explosion == `number` &&
                  (e.explosion ?? 0) > 0,
              ),
          )
        ? `PieExploded`
        : e.chartType === `Unsupported(c:ofPieChart)`
          ? `BarOfPie`
          : e.chartType;
}
function toCleanLabel(e: any) {
  return e == null
    ? ``
    : String(e)
        .replace(/[\u200B-\u200D\uFEFF]/g, ``)
        .trim();
}
function formulaRowCount(e: any) {
  if (!e) return 0;
  let t = e.lastIndexOf(`!`),
    n = (t >= 0 ? e.slice(t + 1) : e).replace(/\$/g, ``),
    r = /^([A-Za-z]+)(\d+):([A-Za-z]+)(\d+)$/.exec(n.trim());
  if (!r) return 0;
  let i = Number(r[2]),
    a = Number(r[4]);
  return !Number.isFinite(i) || !Number.isFinite(a) ? 0 : Math.abs(a - i) + 1;
}
function resolveCategoryLabels(e: any) {
  let t = e.series[0]?.categories ?? [],
    n =
      e.plotVisibleOnly === !0
        ? 0
        : Math.max(
            0,
            ...e.series.map((e: any) =>
              Math.max(formulaRowCount(e.categoriesRef?.formula), formulaRowCount(e.valuesRef?.formula)),
            ),
          ),
    r = Math.max(
      n,
      t.length,
      ...e.series.map((e: any) => Math.max(e.categories.length, e.values.length)),
    );
  if (r <= 0) return [];
  let i = e.series.some((e: any) => e.categories.some((e: any) => toCleanLabel(e).length > 0)),
    a =
      e.series.some((e: any) =>
        e.categories.length === 0 ? !1 : e.categories.every((e: any) => toCleanLabel(e).length === 0),
      ) || !i;
  return Array.from({ length: r }, (n, r) => {
    let i = t[r];
    if (i != null) {
      let t = toCleanLabel(i);
      if (t.length > 0) return formatCategoryValue(e, i, t);
    }
    let o = e.series.map((e: any) => e.categories[r]).find((e: any) => toCleanLabel(e).length > 0);
    return o == null ? (a ? String(r + 1) : ``) : formatCategoryValue(e, o, toCleanLabel(o));
  });
}
function isComboChart(e: any) {
  let t = e.typeGroups ?? [];
  return t.length < 2 ? !1 : new Set(t.map((e: any) => e.chartType)).size > 1;
}
function comboLegendItems(e: any) {
  return isComboChart(e)
    ? (e.typeGroups ?? []).flatMap((t: any) =>
        t.series.map((t: any, n: any) => ({
          color: t.lineColor ?? t.markerColor ?? t.color ?? resolveSeriesFillColor(e, n),
          label: t.name ?? `Series ${n + 1}`,
        })),
      )
    : e.series.map((t: any, n: any) => ({ color: resolveSeriesFillColor(e, n), label: t.name ?? `Series ${n + 1}` }));
}
function findAxisByIds(e: any, t: any, n: any, r: any = !1) {
  return (
    e.axes.find((e: any) => e.id != null && t.includes(e.id) && n(e.position)) ||
    (r ? (e.axes.find((e: any) => e.id != null && t.includes(e.id)) ?? null) : null)
  );
}
function resolveTypeGroups(e: any) {
  return (e.typeGroups ?? [])
    .map((t: any) => {
      let n = t.axisIds ?? [],
        r = findAxisByIds(e, n, (e: any) => e === `b` || e === `t`) ?? e.categoryAxis ?? null,
        i = findAxisByIds(e, n, (e: any) => e === `l` || e === `r`, !0) ?? e.valueAxis ?? null;
      return {
        axisIds: n,
        categoryAxis: r,
        chartType: t.chartType,
        gapWidth: t.gapWidth,
        is3d: t.is3d,
        raw: t.raw,
        series: t.series,
        valueAxis: i,
      };
    })
    .filter((e: any) => e.series.length > 0);
}
function toAxisNumber(e: any, t: any) {
  return toFiniteNumber(e) ?? (t === `zero` ? 0 : null);
}
function extractNumericValue(e: any): any {
  let t = toFiniteNumber(e);
  if (t != null) return t;
  if (Array.isArray(e)) {
    for (let t of e) {
      let e = extractNumericValue(t);
      if (e != null) return e;
    }
    return null;
  }
  if (e && typeof e == `object`) {
    let t = e;
    for (let e of [`x`, `value`, `v`, `num`, `number`, `raw`]) {
      let n = extractNumericValue(t[e]);
      if (n != null) return n;
    }
    return null;
  }
  if (typeof e == `string`) {
    let t = /-?\d+(?:\.\d+)?/.exec(e);
    if (!t) return null;
    let n = Number(t[0]);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
function collectPieDataPoints(e: any, t: any = pickPrimarySeriesIndex(e)) {
  let n = resolveCategoryLabels(e);
  return (e.series[t]?.values ?? [])
    .map((r: any, i: any) => ({
      color: resolvePieSliceColor(e, i, t),
      index: i,
      label: toCleanLabel(n[i]),
      value: Math.max(0, toFiniteNumber(r) ?? 0),
    }))
    .filter((e: any) => e.value > 0);
}
function isSubtotalSeries(e: any) {
  let t = e.raw && typeof e.raw == `object` ? e.raw : null,
    n = t?.layoutProperties && typeof t.layoutProperties == `object` ? t.layoutProperties : null;
  return (Array.isArray(n?.subtotals) ? n.subtotals : []).length > 0 || n?.aggregation === !0;
}
function collectStackedTotals(e: any) {
  if (e.chartType === `Funnel` || e.chartType === `Waterfall`) {
    let t = Math.max(
        0,
        e.series.findIndex((e: any) => e.hidden !== !0),
      ),
      n = e.series[t] ?? null;
    if (!n) return [];
    let r = resolveCategoryLabels(e);
    return n.values
      .map((n: any, i: any) => {
        let a = toFiniteNumber(n);
        return a == null || !Number.isFinite(a)
          ? null
          : {
              color: e.varyColors ? resolveDataPointColor(e, i, t) : resolveSeriesFillColor(e, t),
              isSubtotal: !1,
              label: toCleanLabel(r[i]) || String(i + 1),
              value: a,
            };
      })
      .filter((e: any) => e != null);
  }
  return e.series
    .map((t: any, n: any) => {
      let r = t.values.reduce((e: any, t: any) => e + (toFiniteNumber(t) ?? 0), 0);
      if (!Number.isFinite(r)) return null;
      let i = typeof t.valuesRef?.formula == `string` ? t.valuesRef.formula : ``,
        a = t.name ?? (i.length > 0 ? i.replace(/^.*!/, ``).replace(/\$/g, ``) : `Series ${n + 1}`);
      return {
        color: resolveSeriesFillColor(e, typeof t.formatIdx == `number` ? t.formatIdx : n),
        isSubtotal: isSubtotalSeries(t),
        label: a,
        value: r,
      };
    })
    .filter((e: any) => e != null);
}
function buildHierarchyTree(e: any) {
  let t: any = { children: [], name: e.title ?? e.name ?? `Root` },
    n = t.children ?? [],
    r = new Map(),
    i =
      e.series.find((e: any) => {
        let t = e.raw && typeof e.raw == `object` ? e.raw : null;
        return Array.isArray(t?.chartExHierarchyCategories);
      }) ?? null,
    a = (() => {
      if (!i) return null;
      let e = i.raw;
      return Array.isArray(e.chartExHierarchyCategories)
        ? e.chartExHierarchyCategories.map((e: any) =>
            Array.isArray(e) ? e.map((e) => toCleanLabel(e)).filter((e) => e.length > 0) : [],
          )
        : null;
    })(),
    o = a ? a.length : Math.max(0, ...e.series.map((e: any) => e.values.length));
  for (let n = 0; n < o; n += 1) {
    let o =
      a?.[n] ?? e.series.map((e: any) => toCleanLabel(e.categories[n] ?? e.values[n])).filter((e: any) => e.length > 0);
    if (o.length === 0) continue;
    let s = t;
    o.forEach((e: any, t: any) => {
      s.children = s.children ?? [];
      let n = t === o.length - 1 && o.length === 1 ? void 0 : s.children.find((t: any) => t.name === e);
      if (!n) {
        if (((n = { children: [], name: e }), t === 0)) {
          let t = r.size;
          (r.set(e, t), (n.colorIndex = t));
        } else n.colorIndex = s.colorIndex;
        s.children.push(n);
      }
      s = n;
    });
    let c = i ?? e.series[e.series.length - 1] ?? null;
    s.value = (s.value ?? 0) + Math.max(1e-4, toFiniteNumber(c?.values[n]) ?? 1);
  }
  return n.length > 0 ? t : null;
}
function resolveQuartileMethod(e: any) {
  let t = e.raw && typeof e.raw == `object` ? e.raw : null,
    n = t?.layoutProperties && typeof t.layoutProperties == `object` ? t.layoutProperties : null;
  return (n?.statistics && typeof n.statistics == `object` ? n.statistics : null)
    ?.quartileMethod === `inclusive`
    ? `inclusive`
    : `exclusive`;
}
function resolveBoxWhiskerVisibility(e: any) {
  let t = e.raw && typeof e.raw == `object` ? e.raw : null,
    n = t?.layoutProperties && typeof t.layoutProperties == `object` ? t.layoutProperties : null,
    r = n?.visibility && typeof n.visibility == `object` ? n.visibility : null;
  return {
    meanLine: r?.meanLine === !0,
    meanMarker: r?.meanMarker !== !1,
    nonoutliers: r?.nonoutliers === !0,
    outliers: r?.outliers !== !1,
  };
}
function quantileValue(e: any, t: any, n: any) {
  let r = e.length;
  if (r === 0) return 0;
  if (r === 1) return e[0] ?? 0;
  let i = n === `exclusive` ? t * (r + 1) : 1 + t * (r - 1);
  if (i <= 1) return e[0] ?? 0;
  if (i >= r) return e[r - 1] ?? 0;
  let a = Math.floor(i) - 1,
    o = Math.ceil(i) - 1,
    s = i - Math.floor(i),
    c = e[Math.max(0, a)] ?? e[0] ?? 0;
  return c + ((e[Math.max(0, o)] ?? e[r - 1] ?? 0) - c) * s;
}
function computeBoxWhiskerStats(e: any) {
  let t = e.values
    .map((e: any) => toFiniteNumber(e))
    .filter((e: any) => e != null)
    .sort((e: any, t: any) => e - t);
  if (t.length === 0) return null;
  let n = resolveQuartileMethod(e),
    r = quantileValue(t, 0.25, n),
    i = quantileValue(t, 0.5, n),
    a = quantileValue(t, 0.75, n),
    o = a - r,
    s = r - o * 1.5,
    c = a + o * 1.5,
    l = t.filter((e: any) => e >= s && e <= c),
    u = t.filter((e: any) => e < s || e > c),
    d = l[0] ?? t[0] ?? 0,
    f = l[l.length - 1] ?? t[t.length - 1] ?? 0,
    p = t.reduce((e: any, t: any) => e + t, 0) / t.length;
  return {
    lowerFence: s,
    lowerWhisker: d,
    max: t[t.length - 1] ?? 0,
    mean: p,
    median: i,
    min: t[0] ?? 0,
    outliers: u,
    q1: r,
    q3: a,
    upperFence: c,
    upperWhisker: f,
    visiblePoints: l,
  };
}
function resolveSunburstFillColor(e: any, t: any) {
  let n = resolveSeriesFillColor(e, t.ancestors().reverse()[1]?.data.colorIndex ?? 0),
    r = Math.max(0, t.depth - 1);
  return r === 0 ? n : lightenHexColor(n, clampNumber(r * 0.16, 0, 0.5));
}
function resolveTreemapFillColor(e: any, t: any) {
  let n = t.ancestors().reverse()[1];
  return resolveSeriesFillColor(e, n?.data.colorIndex ?? 0);
}
function tileHierarchyNode(e: any, t: any, n: any, r: any, i: any) {
  if (!(!e.children || e.children.length === 0)) {
    if (e.depth === 0) {
      (f(e, t, n, r, i), e.children.forEach((e: any) => tileHierarchyNode(e, e.x0, e.y0, e.x1, e.y1)));
      return;
    }
    (An(e, t, n, r, i), e.children.forEach((e: any) => tileHierarchyNode(e, e.x0, e.y0, e.x1, e.y1)));
  }
}
function resolveSurfaceBaseColor(e: any, t: any) {
  return (
    e.chartColorPalette?.[0] ??
    e.series[0]?.color ??
    e.series[0]?.lineColor ??
    e.axisLineColor ??
    e.textColor ??
    t.text
  );
}
function normalizeSurfaceStyleId(e: any) {
  return typeof e != `number` || !Number.isFinite(e) ? null : e >= 100 ? e - 100 : e;
}
function resolveSurfaceAccentColor(e: any) {
  let t = normalizeHexColor(e.series[0]?.color ?? e.series[0]?.lineColor);
  if (!t) return null;
  let n = normalizeHexColor(e.chartColorPalette?.[0]);
  return n && n === t ? null : t;
}
function surfaceStyleRamp(e: any, t: any) {
  return t <= 3
    ? [lightenHexColor(e, 0.22), e, darkenHexColor(e, 0.2)]
    : [lightenHexColor(e, 0.3), lightenHexColor(e, 0.14), e, darkenHexColor(e, 0.1), darkenHexColor(e, 0.22)];
}
function resolveSurfaceStylePalette(e: any) {
  let t = normalizeSurfaceStyleId(e.chartStyleId),
    n = resolveSurfaceAccentColor(e);
  return t === 26
    ? surfaceStyleRamp(n ?? `#ff006e`, 3)
    : t === 34 && n
      ? surfaceStyleRamp(n, 3)
      : t === 34 || (e.wireframe === !0 && t == null)
        ? [`#5b9bd5`, `#ed7d31`, `#a5a5a5`]
        : t === 35 || t === 36 || (e.wireframe !== !0 && t == null)
          ? [`#2f5597`, `#4472c4`, `#5b9bd5`, `#8faadc`, `#d9e2f3`]
          : null;
}
function isStyledSurfaceChart(e: any) {
  let t = normalizeSurfaceStyleId(e.chartStyleId),
    n =
      e.raw && typeof e.raw == `object` && typeof e.raw.xmlChartType == `string`
        ? String(e.raw.xmlChartType)
        : ``;
  return (
    (n === `surfaceChart` || n === `surface3DChart`) &&
    (t === 26 || t === 34 || t === 35 || t === 36)
  );
}
function resolveSurfaceBandCount(e: any) {
  let t = e.raw && typeof e.raw == `object` ? e.raw : null,
    n =
      typeof t?.bandFormatCount == `number` && Number.isFinite(t.bandFormatCount)
        ? t.bandFormatCount
        : null;
  if (n != null && n > 0 && !(is2dSurfaceChart(e) && e.wireframe !== !0)) return n;
  let r = resolveSurfaceStylePalette(e);
  return isStyledSurfaceChart(e) && r && r.length > 0
    ? r.length
    : e.chartColorPalette && e.chartColorPalette.length > 1
      ? e.chartColorPalette.length
      : r && r.length > 0
        ? r.length
        : e.wireframe
          ? 3
          : 5;
}
function resolveSurfaceColorRamp(e: any, t: any) {
  let n = resolveSurfaceStylePalette(e);
  if (isStyledSurfaceChart(e) && n && n.length >= 2) return n;
  let r = (e.chartColorPalette ?? []).filter((e: any) => typeof e == `string` && e.length > 0);
  if (r.length >= 2) return r;
  if (n && n.length >= 2) return n;
  let i = resolveSurfaceBaseColor(e, t);
  return [darkenHexColor(i, 0.42), darkenHexColor(i, 0.24), i, lightenHexColor(i, 0.18), lightenHexColor(i, 0.34), lightenHexColor(i, 0.5)];
}
function resolveSurfaceBandColor(e: any, t: any, n: any, r: any) {
  let i = resolveSurfaceColorRamp(e, t);
  if (i.length === 0) return resolveSurfaceBaseColor(e, t);
  let a = surfaceBandIndexForValue(n, r);
  return i[Math.min(i.length - 1, Math.max(0, a))] ?? i[i.length - 1] ?? resolveSurfaceBaseColor(e, t);
}
function computeSurfaceValueScale(e: any) {
  let t = e.series.flatMap((e: any) => e.values.map((e: any) => toFiniteNumber(e)).filter((e: any) => e != null));
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
    o = Math.max(1, resolveSurfaceBandCount(e)),
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
  return { maxValue: p, minValue: f, safeMax: m, ticks: h.length >= 2 ? h : [f, m] };
}
function sampleSurfaceRampColor(e: any, t: any, n: any) {
  let r = resolveSurfaceColorRamp(e, t);
  if (r.length === 0) return resolveSurfaceBaseColor(e, t);
  if (r.length === 1) return r[0];
  let i = clampNumber(n, 0, 1) * (r.length - 1),
    a = Math.floor(i),
    o = Math.min(r.length - 1, a + 1),
    s = i - a;
  return mixHexColors(r[a] ?? r[0], r[o] ?? r[r.length - 1], s);
}
function resolveSurfaceCellColor(e: any, t: any, n: any, r: any) {
  return resolveSurfaceBandColor(e, t, n, r);
}
function surfaceBandIndexForValue(e: any, t: any) {
  let n = e.ticks;
  for (let r = 0; r < n.length - 1; r += 1)
    if (t <= (n[r + 1] ?? e.safeMax) || r === n.length - 2) return r;
  return Math.max(0, n.length - 2);
}
function pointsToLinePath(e: any, t: any) {
  return e.length < 2
    ? ``
    : (v()
        .x((e: any) => e.x)
        .y((e: any) => e.y)
        .curve(e.length >= 3 && t ? O.alpha(0.5) : g)(e) ?? ``);
}
function splitDefinedPointRuns(e: any) {
  let t = [],
    n: any[] = [];
  return (
    e.forEach((e: any) => {
      if (!e.hasValue) {
        (n.length >= 2 && t.push(n), (n = []));
        return;
      }
      let r = { x: e.x, y: e.y },
        i = n[n.length - 1];
      (!i || Math.abs(i.x - r.x) > 0.01 || Math.abs(i.y - r.y) > 0.01) && n.push(r);
    }),
    n.length >= 2 && t.push(n),
    t
  );
}
function joinContourSegments(e: any) {
  let t = [...e],
    n = 0.75,
    r = (e: any, t: any) => Math.abs(e.x - t.x) <= n && Math.abs(e.y - t.y) <= n,
    i = [];
  for (; t.length > 0;) {
    let e = t.shift();
    if (!e) break;
    let n = [e.start, e.end],
      a = !0;
    for (; a;) {
      a = !1;
      for (let e = t.length - 1; e >= 0; --e) {
        let i = t[e];
        if (i) {
          if (r(n[n.length - 1] ?? i.start, i.start)) n.push(i.end);
          else if (r(n[n.length - 1] ?? i.start, i.end)) n.push(i.start);
          else if (r(n[0] ?? i.start, i.end)) n.unshift(i.start);
          else if (r(n[0] ?? i.start, i.start)) n.unshift(i.end);
          else continue;
          (t.splice(e, 1), (a = !0));
        }
      }
    }
    let o = n.filter((e, t) => {
      if (t === 0) return !0;
      let i = n[t - 1];
      return !i || !r(i, e);
    });
    o.length >= 2 && i.push(o);
  }
  return i;
}
function resolveSurfaceLineColors(e: any, t: any) {
  let n = e.raw && typeof e.raw == `object` ? e.raw : null,
    r = Array.isArray(n?.bandFormatLineColors)
      ? n.bandFormatLineColors.filter((e: any) => typeof e == `string` && e.length > 0)
      : [];
  return r.length > 0 ? r : resolveSurfaceColorRamp(e, t);
}
function resolveSurfaceLineColor(e: any, t: any, n: any, r: any) {
  let i = resolveSurfaceLineColors(e, t);
  if (i.length === 0) return resolveSurfaceBandColor(e, t, n, r);
  let a = surfaceBandIndexForValue(n, r);
  return i[Math.min(i.length - 1, Math.max(0, a))] ?? resolveSurfaceBandColor(e, t, n, r);
}
function resolveSurfacePlotRect(e: any, t: any) {
  if (!is2dSurfaceChart(e)) return t.plot;
  let n = Math.max(1, resolveCategoryLabels(e).length),
    r = Math.max(1, e.series.length),
    i = Math.max(0.72, n / Math.max(1, r)),
    a = e.wireframe ? 0.78 : 0.84,
    o = e.wireframe ? 0.72 : 0.8,
    s = t.plot.width * a,
    c = t.plot.height * o;
  return (
    s / Math.max(1e-6, c) > i ? (s = c * i) : (c = s / Math.max(1e-6, i)),
    {
      height: c,
      left: t.plot.left + (t.plot.width - s) / 2,
      top: t.plot.top + (t.plot.height - c) / 2,
      width: s,
    }
  );
}
function surfaceLegendItems(e: any, t: any) {
  let n = computeSurfaceValueScale(e);
  if (!n) return [];
  let r = [];
  for (let i = 0; i < n.ticks.length - 1; i += 1) {
    let a = n.ticks[i] ?? n.minValue,
      o = n.ticks[i + 1] ?? n.safeMax,
      s = (a + (o - a) * 0.5 - n.minValue) / Math.max(1e-6, n.safeMax - n.minValue);
    r.push({ color: sampleSurfaceRampColor(e, t, s), label: `${formatTickNumber(a)}-${formatTickNumber(o)}` });
  }
  return r.reverse();
}
function is2dSurfaceChart(e: any) {
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
function renderSurface2dFrame(e: any, t: any) {
  let n = resolveSurfacePlotRect(e, t),
    r = resolveCategoryLabels(e),
    i = e.series.map((e: any, t: any) => toCleanLabel(e.name) || `Q${t + 1}`),
    a = resolveAxisLabelColor(e),
    o = e.axisLineColor ?? e.chartAreaBorderColor ?? `#888888`,
    s = Math.max(1, i.length),
    c = Math.max(1, r.length),
    l = r.map((e, t) => n.left + (c <= 1 ? n.width / 2 : (t / (c - 1)) * n.width)),
    u = i.map((e: any, t: any) => n.top + n.height - (s <= 1 ? n.height / 2 : (t / (s - 1)) * n.height));
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      (0, jsxRuntime.jsx)(`rect`, {
        fill: `none`,
        height: n.height,
        stroke: lightenHexColor(o, 0.18),
        strokeWidth: 0.8,
        width: n.width,
        x: n.left,
        y: n.top,
      }),
      r.map((e, t) =>
        (0, jsxRuntime.jsx)(
          `text`,
          {
            fill: a,
            fontSize: 10,
            textAnchor: `middle`,
            x: l[t] ?? n.left,
            y: n.top + n.height + 14,
            children: e,
          },
          `surface-x-label-${t}`,
        ),
      ),
      i.map((e: any, t: any) =>
        (0, jsxRuntime.jsx)(
          `text`,
          {
            fill: a,
            fontSize: 10,
            textAnchor: `start`,
            x: n.left + n.width + 8,
            y: (u[t] ?? n.top) + 3,
            children: e,
          },
          `surface-y-label-${t}`,
        ),
      ),
    ],
  });
}
function normalizeHexColor(e: any) {
  if (typeof e != `string`) return null;
  let t = e.trim();
  if (!t) return null;
  let n = t.startsWith(`#`) ? t.slice(1) : t;
  return /^[0-9a-f]{6}$/i.test(n) ? `#${n.toLowerCase()}` : null;
}
function resolveStockSeriesRoles(e: any) {
  let t: any = {
      close: findSeriesByNamePattern(e.series, /close|last|end/),
      high: findSeriesByNamePattern(e.series, /high|max|top/),
      low: findSeriesByNamePattern(e.series, /low|min|bottom/),
      open: findSeriesByNamePattern(e.series, /open|start/),
      volume: findSeriesByNamePattern(e.series, /volume|vol/),
    },
    n = new Set(Object.values(t).filter((e) => e != null)),
    r = e.series.map((e: any, t: any) => t).filter((e: any) => !n.has(e));
  return (
    (e.series.length >= 4 ? [`open`, `high`, `low`, `close`] : [`high`, `low`, `close`]).forEach(
      (e) => {
        if (t[e] == null) {
          let n = r.shift();
          n != null && (t[e] = n);
        }
      },
    ),
    t
  );
}
function resolveStockPalette(e: any, t: any) {
  let n = e.raw && typeof e.raw == `object` ? e.raw : null,
    r = n?.highLowLines && typeof n.highLowLines == `object` ? n.highLowLines : null,
    i =
      normalizeHexColor(
        (r?.shapeProperties && typeof r.shapeProperties == `object` ? r.shapeProperties : null)
          ?.lineColorHex,
      ) ??
      t ??
      `#333333`,
    a = typeof e.chartStyleId == `number` ? e.chartStyleId : null,
    o = a != null && a >= 128 ? `#c0504d` : i,
    s = a != null && a >= 128 ? `#d9a3a0` : lightenHexColor(i, 0.45);
  return {
    closeAccent: o,
    downFill: lightenHexColor(i, 0.4),
    lineColor: i,
    lowAccent: s,
    openAccent: lightenHexColor(i, 0.22),
    upFill: `#ffffff`,
    volumeFill: lightenHexColor(i, 0.26),
  };
}
function stockLegendItems(e: any, t: any) {
  let n = e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    r = resolveStockSeriesRoles(e),
    i = resolveStockPalette(e, n);
  return e.series.map((e: any, t: any) => {
    let n = i.lineColor;
    return (
      r.volume === t
        ? (n = i.volumeFill)
        : r.open === t
          ? (n = i.openAccent)
          : r.low === t
            ? (n = i.lowAccent)
            : r.close === t && (n = i.closeAccent),
      { color: n, label: e.name ?? `Series ${t + 1}` }
    );
  });
}
export function resolveLegendItems(e: any, t: any, n: any) {
  if (!e.legend) return [];
  if (isComboChart(e)) return comboLegendItems(e);
  if (t === `Stock`) return stockLegendItems(e, n);
  if (t === `Surface`) return surfaceLegendItems(e, n);
  if (t === `RegionMap`) return regionMapLegendItems(e);
  if (t === `Sunburst` || t === `Treemap`) {
    let t = buildHierarchyTree(e);
    return t?.children
      ? t.children.map((t: any, n: any) => ({ color: resolveSeriesFillColor(e, t.colorIndex ?? n), label: t.name }))
      : [];
  }
  if (t === `Pie` || t === `Pie3D` || t === `PieExploded` || t === `Doughnut` || t === `BarOfPie`) {
    if (t === `BarOfPie`) {
      let t = resolveCategoryLabels(e),
        n = e.series[0]?.values ?? [];
      return t
        .map((t, r) => ({ color: resolveDataPointColor(e, r), label: toCleanLabel(t), value: toFiniteNumber(n[r]) ?? 0 }))
        .filter((e) => e.value > 0 && e.label.trim().length > 0)
        .map((e) => ({ color: e.color, label: e.label }));
    }
    return collectPieDataPoints(e).map((e: any) => ({ color: e.color, label: e.label }));
  }
  let r = t === `Scatter` || t === `ScatterLines` || t === `ScatterSmooth` || t === `Bubble`;
  return e.series.map((t: any, n: any) => ({
    color: r ? (t.lineColor ?? t.markerColor ?? t.color ?? resolveSeriesFillColor(e, n)) : resolveSeriesFillColor(e, n),
    label: t.name ?? `Series ${n + 1}`,
  }));
}
export function computeChartLayout(e: any, t: any, n: any) {
  let r = Math.max(80, Math.round(t.width)),
    i = Math.max(60, Math.round(t.height)),
    a =
      e.chartType === `Surface` ||
      (e.raw &&
        typeof e.raw == `object` &&
        typeof e.raw.xmlChartType == `string` &&
        String(e.raw.xmlChartType).includes(`surface`)),
    o = e.title ? (a ? 30 : 24) : 8,
    s = normalizeLegendPosition(e.legend?.position),
    c = n.length > 0 && (s === `right` || s === `left`);
  n.length;
  let l = 42 + (s === `left` ? 98 : 0),
    u = 16 + (s === `right` ? 98 : 0),
    d = o + (s === `top` ? 24 : 0),
    f = 28 + (s === `bottom` ? 24 : 0);
  return (
    Math.max(40, r - l - u),
    Math.max(40, i - d - f),
    {
      height: i,
      legendItems: n,
      legendPosition: (r <= 280 || i <= 200) && c ? `bottom` : s,
      plot: { height: Math.max(40, i - d - f), left: l, top: d, width: Math.max(40, r - l - u) },
      titleHeight: o,
      width: r,
    }
  );
}
function niceTickStep(e: any, t: any, n: any = 5) {
  let r = Math.max(1e-6, t - e) / Math.max(1, n),
    i = 10 ** Math.floor(Math.log10(r)),
    a = r / i;
  return (a <= 1 ? 1 : a <= 2 ? 2 : a <= 5 ? 5 : 10) * i;
}
function buildTicks(e: any, t: any, n: any) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= e) return [];
  let r = typeof n == `number` && n > 0 ? n : niceTickStep(e, t, 5);
  if (!Number.isFinite(r) || r <= 0) return [];
  let i = Math.floor(e / r) * r,
    a = [];
  for (let n = i; n <= t + r * 0.001; n += r)
    n >= e - r * 0.001 && n <= t + r * 0.001 && a.push(Number(n.toFixed(8)));
  return a;
}
function buildValueScale(e: any, t: any, n: any, r: any = !1) {
  if (!Number.isFinite(e) || !Number.isFinite(t)) return { max: 1, min: 0, ticks: [0, 1] };
  let i = r ? Math.min(0, e) : e,
    a = r ? Math.max(0, t) : t;
  a <= i && (a = i + 1);
  let o = typeof n == `number` && n > 0 ? n : niceTickStep(i, a, 5),
    s = typeof n == `number` && n > 0 ? i : Math.floor(i / o) * o,
    c = typeof n == `number` && n > 0 ? a : Math.ceil(a / o) * o,
    l = r ? Math.min(0, s) : s,
    u = c <= l ? l + o : c,
    d = buildTicks(l, u, o);
  return { max: u, min: l, ticks: d.length > 0 ? d : [l, u] };
}
function resolveAxisScale(e: any, t: any, n: any, r: any = !1) {
  let i = typeof e?.min == `number` && Number.isFinite(e.min),
    a = typeof e?.max == `number` && Number.isFinite(e.max),
    o = buildValueScale(i ? Number(e?.min) : t, a ? Number(e?.max) : n, e?.majorUnit, r);
  return {
    hasExplicitMax: a,
    hasExplicitMin: i,
    majorUnit: e?.majorUnit,
    max: a ? Number(e?.max) : o.max,
    min: i ? Number(e?.min) : o.min,
    ticks:
      i || a ? buildTicks(i ? Number(e?.min) : o.min, a ? Number(e?.max) : o.max, e?.majorUnit) : o.ticks,
  };
}
function computeBar3dDepth(e: any, t: any = 11, n: any = 8) {
  let r = clampNumber((e.view3d?.depthPercent ?? 100) / 100, 0.35, 3.2),
    i = clampNumber(e.view3d?.rotX ?? 20, -80, 80),
    a = clampNumber(e.view3d?.rotY ?? 20, -80, 80),
    o = e.view3d?.rAngAx === !1,
    s = clampNumber((e.view3d?.perspective ?? (o ? 26 : 0)) / 100, 0, 1),
    c = project3dPoint(0, 0, 0, (Math.PI / 180) * i, (Math.PI / 180) * a, o, s),
    l = project3dPoint(0, 0, 1, (Math.PI / 180) * i, (Math.PI / 180) * a, o, s),
    u = l.x - c.x,
    d = l.y - c.y,
    f = clampNumber(1.42 + Math.abs(a) / 48 + r * 0.06, 1.5, 1.95),
    p = clampNumber(1.18 + Math.abs(i) / 78, 1.22, 1.5),
    m = u * f,
    h = d * p,
    g = Math.hypot(m, h) || 1,
    _ = clampNumber(Math.abs(a) / 22, 0.55, 2.2),
    v = clampNumber(Math.abs(i) / 18, 0.45, 1.9),
    y = Math.max(6, t * r * _) * (a < 0 ? -1 : 1),
    b = -Math.max(4, n * r * v),
    x = Math.max(10, Math.hypot(y, b) * 1.34),
    S = (m / g) * x,
    C = (h / g) * x;
  return {
    depthRatio: r,
    depthX: S,
    depthY: C,
    insetBottom: Math.max(6, Math.abs(C) + 5),
    insetLeft: S < 0 ? Math.abs(S) + 4 : 0,
    insetRight: S > 0 ? S + 4 : 0,
    insetTop: Math.max(4, Math.abs(C) + 2),
  };
}
function formatTickNumber(e: any) {
  return Math.abs(e) >= 1e3
    ? e.toLocaleString(void 0, { maximumFractionDigits: 0 })
    : e.toLocaleString(void 0, { maximumFractionDigits: 2 });
}
function formatPercentTick(e: any) {
  return `${formatTickNumber(e)}%`;
}
function isDateFormatCode(e: any) {
  if (!e) return !1;
  let t = e
    .toLowerCase()
    .replace(/\[[^\]]*]/g, ` `)
    .replace(/"[^"]*"/g, ` `)
    .replace(/\\./g, ` `);
  return /(?:d|m|y)/.test(t);
}
function excelSerialToDate(e: any, t: any) {
  let n = Math.trunc(e),
    r = Math.round((e - n) * 864e5);
  return new Date((t ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30)) + n * 864e5 + r);
}
function formatExcelDate(e: any, t: any, n: any) {
  let r = excelSerialToDate(e, n),
    i = (t ?? ``).toLowerCase(),
    a: any = {};
  return (
    /yyyy/.test(i) ? (a.year = `numeric`) : /yy/.test(i) && (a.year = `2-digit`),
    /mmmm/.test(i)
      ? (a.month = `long`)
      : /mmm/.test(i)
        ? (a.month = `short`)
        : /(^|[^a-z])m([^a-z]|$)|(^|[^a-z])mm([^a-z]|$)/.test(i) && (a.month = `numeric`),
    /dddd/.test(i) ? (a.weekday = `long`) : /ddd/.test(i) && (a.weekday = `short`),
    /d/.test(i) && (a.day = `numeric`),
    Object.keys(a).length === 0 && ((a.month = `short`), (a.day = `numeric`)),
    new Intl.DateTimeFormat(void 0, a).format(r)
  );
}
function formatCategoryValue(e: any, t: any, n: any = ``) {
  let r = e.raw && typeof e.raw == `object` ? e.raw : null,
    i = typeof t == `number` && Number.isFinite(t) ? t : null,
    a = e.categoryAxis?.numberFormat?.formatCode;
  if (i != null && isDateFormatCode(a)) return formatExcelDate(i, a, r?.date1904 === !0);
  let o = toCleanLabel(t);
  return o.length > 0 ? o : n;
}
function truncateLabel(e: any, t: any, n: any = 10) {
  if (!e || t <= 0) return ``;
  let r = Math.max(4.2, n * 0.56),
    i = Math.max(1, Math.floor(t / r));
  return e.length <= i ? e : i <= 1 ? `…` : `${e.slice(0, Math.max(0, i - 1)).trimEnd()}\u2026`;
}
function markerSymbolPath(e: any, t: any) {
  if (e === `none`) return ``;
  let n = (() => {
    switch (e) {
      case `diamond`:
        return C;
      case `square`:
        return y;
      case `triangle`:
      case `triangle-up`:
        return w;
      case `cross`:
      case `plus`:
        return T;
      case `star`:
        return x;
      default:
        return b;
    }
  })();
  return (
    E()
      .type(n)
      .size(t * t * Math.PI)() ?? ``
  );
}
var TWO_PI = Math.PI * 2;
function normalizeArcAngles(e: any, t: any) {
  let n = e,
    r = t;
  for (; r < n;) r += TWO_PI;
  return { end: r, start: n };
}
function arcTopFaceSegments(e: any, t: any) {
  let { start: n, end: r } = normalizeArcAngles(e, t),
    i = [],
    a = Math.floor(n / TWO_PI) - 1,
    o = Math.ceil(r / TWO_PI) + 1;
  for (let e = a; e <= o; e += 1) {
    let t = Math.PI / 2 + e * TWO_PI,
      a = Math.PI * 1.5 + e * TWO_PI,
      o = Math.max(n, t),
      s = Math.min(r, a);
    s - o > 1e-4 && i.push([o, s]);
  }
  return i;
}
function pieArcPoint(e: any, t: any, n: any, r: any, i: any, a: any = 0) {
  return { x: e + Math.sin(i) * n, y: t - Math.cos(i) * n * r + a };
}
function roundPathNumber(e: any) {
  return Number(e.toFixed(3));
}
function pie3dSidePaths(e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any = !1) {
  let c = n * r;
  return (s ? [[a, o]] : arcTopFaceSegments(a, o)).map(([a, o]) => {
    let s = pieArcPoint(e, t, n, r, a, 0),
      l = pieArcPoint(e, t, n, r, o, 0),
      u = pieArcPoint(e, t, n, r, a, i),
      d = pieArcPoint(e, t, n, r, o, i),
      f = +(o - a > Math.PI);
    return [
      `M ${roundPathNumber(s.x)} ${roundPathNumber(s.y)}`,
      `A ${roundPathNumber(n)} ${roundPathNumber(c)} 0 ${f} 1 ${roundPathNumber(l.x)} ${roundPathNumber(l.y)}`,
      `L ${roundPathNumber(d.x)} ${roundPathNumber(d.y)}`,
      `A ${roundPathNumber(n)} ${roundPathNumber(c)} 0 ${f} 0 ${roundPathNumber(u.x)} ${roundPathNumber(u.y)}`,
      `Z`,
    ].join(` `);
  });
}
function isArcBackAngle(e: any) {
  let t = ((e % TWO_PI) + TWO_PI) % TWO_PI;
  return t > Math.PI / 2 && t < Math.PI * 1.5;
}
function pie3dSliceWallPath(e: any, t: any, n: any, r: any, i: any, a: any, o: any = !1) {
  if (!o && !isArcBackAngle(a)) return null;
  let s = { x: e, y: t },
    c = { x: e, y: t + i },
    l = pieArcPoint(e, t, n, r, a, 0),
    u = pieArcPoint(e, t, n, r, a, i);
  return [
    `M ${roundPathNumber(s.x)} ${roundPathNumber(s.y)}`,
    `L ${roundPathNumber(l.x)} ${roundPathNumber(l.y)}`,
    `L ${roundPathNumber(u.x)} ${roundPathNumber(u.y)}`,
    `L ${roundPathNumber(c.x)} ${roundPathNumber(c.y)}`,
    `Z`,
  ].join(` `);
}
function renderChartTitle(e: any, t: any, n: any) {
  if (!e.title) return null;
  let r = truncateLabel(e.title, Math.max(40, t.width - 12), 12),
    i = t.titleHeight >= 30 ? 19 : 16;
  return (0, jsxRuntime.jsx)(`text`, {
    fill: e.titleColor ?? e.textColor ?? DEFAULT_CHART_TEXT_COLOR,
    fontFamily: resolveFontFamilyStack(e.titleFontFamily ?? e.fontFamily),
    fontSize: 12,
    fontWeight: 600,
    textAnchor: `middle`,
    x: t.width / 2,
    y: i,
    children: r,
  });
}
function renderChartLegend(e: any, t: any, n: any) {
  if (!e.legend || t.legendItems.length === 0) return null;
  let r = resolveAxisLabelColor(e),
    i = t.legendPosition,
    a = t.legendItems;
  if (i === `left` || i === `right`) {
    let n = i === `right` ? t.plot.left + t.plot.width + 8 : 8,
      o = t.plot.top + 6;
    return (0, jsxRuntime.jsx)(`g`, {
      children: a.map((t: any, i: any) => {
        let a = o + i * 18;
        return (0, reactInterop.createElement)(
          `g`,
          {
            ...(i < e.series.length ? chartSeriesDataAttrs(i) : {}),
            "data-xlsx-chart-element-kind": i < e.series.length ? `legendEntry` : void 0,
            key: `legend-${i}`,
            transform: `translate(${n}, ${a})`,
          },
          (0, jsxRuntime.jsx)(`rect`, { fill: t.color, height: 8, rx: 1.2, ry: 1.2, width: 8, x: 0, y: -7 }),
          (0, jsxRuntime.jsx)(`text`, { fill: r, fontSize: 10, x: 12, y: 0, children: t.label }),
        );
      }),
    });
  }
  let o = i === `top` ? t.titleHeight + 12 : t.height - 8,
    s = a.reduce((e: any, t: any) => e + 24 + Math.min(96, t.label.length * 5.4), 0),
    c = Math.max(8, (t.width - s) / 2);
  return (0, jsxRuntime.jsx)(`g`, {
    children: a.map((t: any, n: any) => {
      let i = Math.min(96, t.label.length * 5.4),
        a = (0, reactInterop.createElement)(
          `g`,
          {
            ...(n < e.series.length ? chartSeriesDataAttrs(n) : {}),
            "data-xlsx-chart-element-kind": n < e.series.length ? `legendEntry` : void 0,
            key: `legend-${n}`,
            transform: `translate(${c}, ${o})`,
          },
          (0, jsxRuntime.jsx)(`rect`, { fill: t.color, height: 8, rx: 1.2, ry: 1.2, width: 8, x: 0, y: -7 }),
          (0, jsxRuntime.jsx)(`text`, { fill: r, fontSize: 10, x: 12, y: 0, children: t.label }),
        );
      return ((c += 24 + i), a);
    }),
  });
}
function renderCartesianGrid(e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any, c: any = formatTickNumber) {
  let l = e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    u = resolveAxisLabelColor(e),
    d = s(0);
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      o.map((e: any) => {
        let t = s(e);
        return r
          ? (0, jsxRuntime.jsxs)(
              `g`,
              {
                children: [
                  (0, jsxRuntime.jsx)(`line`, {
                    stroke: lightenHexColor(l, 0.7),
                    strokeWidth: 1,
                    x1: t,
                    x2: t,
                    y1: n.top,
                    y2: n.top + n.height,
                  }),
                  (0, jsxRuntime.jsx)(`text`, {
                    fill: u,
                    fontSize: 10,
                    textAnchor: `middle`,
                    x: t,
                    y: n.top + n.height + 14,
                    children: c(e),
                  }),
                ],
              },
              `grid-v-${e}`,
            )
          : (0, jsxRuntime.jsxs)(
              `g`,
              {
                children: [
                  (0, jsxRuntime.jsx)(`line`, {
                    stroke: lightenHexColor(l, 0.7),
                    strokeWidth: 1,
                    x1: n.left,
                    x2: n.left + n.width,
                    y1: t,
                    y2: t,
                  }),
                  (0, jsxRuntime.jsx)(`text`, {
                    fill: u,
                    fontSize: 10,
                    textAnchor: `end`,
                    x: n.left - 6,
                    y: t + 3,
                    children: c(e),
                  }),
                ],
              },
              `grid-h-${e}`,
            );
      }),
      a.map((e: any, t: any) => {
        let a = i[t] ?? ``;
        return r
          ? (0, jsxRuntime.jsx)(
              `text`,
              { fill: u, fontSize: 10, textAnchor: `end`, x: n.left - 6, y: e + 3, children: a },
              `cat-y-${t}`,
            )
          : (0, jsxRuntime.jsx)(
              `text`,
              {
                fill: u,
                fontSize: 10,
                textAnchor: `middle`,
                x: e,
                y: n.top + n.height + 14,
                children: a,
              },
              `cat-x-${t}`,
            );
      }),
      r
        ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
            children: [
              (0, jsxRuntime.jsx)(`line`, {
                stroke: l,
                strokeWidth: 1.2,
                x1: n.left,
                x2: n.left + n.width,
                y1: n.top + n.height,
                y2: n.top + n.height,
              }),
              (0, jsxRuntime.jsx)(`line`, {
                stroke: l,
                strokeWidth: 1.2,
                x1: d,
                x2: d,
                y1: n.top,
                y2: n.top + n.height,
              }),
            ],
          })
        : (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
            children: [
              (0, jsxRuntime.jsx)(`line`, {
                stroke: l,
                strokeWidth: 1.2,
                x1: n.left,
                x2: n.left,
                y1: n.top,
                y2: n.top + n.height,
              }),
              (0, jsxRuntime.jsx)(`line`, {
                stroke: l,
                strokeWidth: 1.2,
                x1: n.left,
                x2: n.left + n.width,
                y1: d,
                y2: d,
              }),
            ],
          }),
    ],
  });
}
function scalePoint2d(e: any, t: any) {
  return { x: e.x * t, y: e.y * t };
}
function ellipseArcPoints(e: any, t: any, n: any, r: any, i: any) {
  let a = Math.max(12, Math.ceil(Math.abs(i - r) / (Math.PI / 14))),
    o = [];
  for (let s = 0; s <= a; s += 1) {
    let c = s / a,
      l = r + (i - r) * c;
    o.push({
      x: e.x + t.x * Math.cos(l) + n.x * Math.sin(l),
      y: e.y + t.y * Math.cos(l) + n.y * Math.sin(l),
    });
  }
  return o;
}
function closedOutlinePath(e: any, t: any) {
  return e.length === 0 || t.length === 0 ? `` : pointsToPath([...e, ...t.slice().reverse()], !0);
}
function renderCylinderCone3d(e: any, t: any, n: any, r: any, i: any) {
  let a = e.depthX ?? (e.isHorizontal ? 10 : 9),
    o = e.depthY ?? -7,
    s = e.left + (e.depthOffsetX ?? 0),
    c = e.top + (e.depthOffsetY ?? 0),
    l = e.width,
    u = e.height,
    d = s + l / 2,
    f = c + u / 2,
    p = e.capStart !== !1,
    m = e.capEnd !== !1,
    h = t === `cone` ? clampNumber(e.bottomScale ?? 1, 0, 1) : 1,
    g = t === `cone` ? clampNumber(e.topScale ?? 1, 0, 1) : 1,
    _ = t === `cylinder` ? (e.isHorizontal ? 0.52 : 0.48) : e.isHorizontal ? 0.7 : 0.58,
    v = scalePoint2d({ x: a / 2, y: o / 2 }, _),
    y = Math.max(0.6, e.strokeWidth * 0.65);
  if (e.isHorizontal) {
    let a = { x: s + v.x, y: f + v.y },
      o = { x: s + l + v.x, y: f + v.y },
      c = { x: 0, y: (u * h) / 2 },
      d = { x: 0, y: (u * g) / 2 },
      _ = scalePoint2d(v, h),
      b = scalePoint2d(v, g),
      x = ellipseArcPoints(a, c, _, 0, Math.PI),
      S = ellipseArcPoints(o, d, b, 0, Math.PI),
      C = ellipseArcPoints(a, c, _, Math.PI, Math.PI * 2),
      w = ellipseArcPoints(o, d, b, Math.PI, Math.PI * 2),
      T = closedOutlinePath(S, x),
      E = closedOutlinePath(w, C),
      D = g > 0.018 ? pointsToPath(ellipseArcPoints(o, d, b, 0, Math.PI * 2), !0) : ``,
      O = h > 0.028 ? pointsToPath(ellipseArcPoints(a, c, _, 0, Math.PI * 2), !0) : ``;
    return (0, jsxRuntime.jsxs)(
      `g`,
      {
        children: [
          T ? (0, jsxRuntime.jsx)(`path`, { d: T, fill: r, stroke: e.stroke, strokeWidth: y }) : null,
          m && D ? (0, jsxRuntime.jsx)(`path`, { d: D, fill: i, stroke: e.stroke, strokeWidth: y }) : null,
          E
            ? (0, jsxRuntime.jsx)(`path`, { d: E, fill: n, stroke: e.stroke, strokeWidth: e.strokeWidth })
            : null,
          p && O ? (0, jsxRuntime.jsx)(`path`, { d: O, fill: n, stroke: e.stroke, strokeWidth: y }) : null,
        ],
      },
      `${e.key}-3d-horizontal-${t}`,
    );
  }
  let b = { x: d + v.x, y: c + u + v.y },
    x = { x: d + v.x, y: c + v.y },
    S = { x: (l * h) / 2, y: 0 },
    C = { x: (l * g) / 2, y: 0 },
    w = scalePoint2d(v, h),
    T = scalePoint2d(v, g),
    E = ellipseArcPoints(b, S, w, 0, Math.PI),
    D = ellipseArcPoints(x, C, T, 0, Math.PI),
    O = ellipseArcPoints(b, S, w, Math.PI, Math.PI * 2),
    k = ellipseArcPoints(x, C, T, Math.PI, Math.PI * 2),
    A = closedOutlinePath(D, E),
    j = closedOutlinePath(k, O),
    M = g > 0.018 ? pointsToPath(ellipseArcPoints(x, C, T, 0, Math.PI * 2), !0) : ``;
  return (0, jsxRuntime.jsxs)(
    `g`,
    {
      children: [
        A ? (0, jsxRuntime.jsx)(`path`, { d: A, fill: r, stroke: e.stroke, strokeWidth: y }) : null,
        m && M ? (0, jsxRuntime.jsx)(`path`, { d: M, fill: i, stroke: e.stroke, strokeWidth: y }) : null,
        j
          ? (0, jsxRuntime.jsx)(`path`, { d: j, fill: n, stroke: e.stroke, strokeWidth: e.strokeWidth })
          : null,
      ],
    },
    `${e.key}-3d-${t}`,
  );
}
function renderBar3dShape(e: any) {
  let t = (() => {
      switch (e.shape3d) {
        case `cone`:
        case `coneToMax`:
          return `cone`;
        case `cylinder`:
          return `cylinder`;
        case `pyramid`:
        case `pyramidToMax`:
          return `pyramid`;
        default:
          return `box`;
      }
    })(),
    n = e.depthX ?? (e.isHorizontal ? 10 : 9),
    r = e.depthY ?? -7,
    i = e.left + (e.depthOffsetX ?? 0),
    a = e.top + (e.depthOffsetY ?? 0),
    o = e.width,
    s = e.height,
    c = i + o,
    l = a + s,
    u = c,
    d = n,
    f = i + o / 2,
    p = clampNumber(e.bottomScale ?? 1, 0.04, 1),
    m = clampNumber(e.topScale ?? 1, 0.04, 1),
    h = (o * p) / 2,
    g = (o * m) / 2,
    _ = f - h,
    v = f + h,
    y = f - g,
    b = f + g;
  e.capStart;
  let x = e.capEnd !== !1,
    S = `${i},${a} ${c},${a} ${c + d},${a + r} ${i + d},${a + r}`,
    C = `${u},${a} ${u},${l} ${u + d},${l + r} ${u + d},${a + r}`,
    w = e.gradientId ? `url(#${e.gradientId})` : e.color,
    T = e.invertedNegative ? e.color : darkenHexColor(e.color, 0.22),
    E = e.invertedNegative ? lightenHexColor(e.color, 0.04) : lightenHexColor(e.color, 0.24);
  if (t === `cylinder` || t === `cone`) return renderCylinderCone3d(e, t, w, T, E);
  if (t === `box`)
    return (0, jsxRuntime.jsxs)(
      `g`,
      {
        children: [
          (0, jsxRuntime.jsx)(`polygon`, {
            fill: T,
            points: C,
            stroke: e.stroke,
            strokeWidth: Math.max(0.6, e.strokeWidth * 0.65),
          }),
          (0, jsxRuntime.jsx)(`polygon`, {
            fill: E,
            points: S,
            stroke: e.stroke,
            strokeWidth: Math.max(0.6, e.strokeWidth * 0.65),
          }),
          (0, jsxRuntime.jsx)(`rect`, {
            fill: w,
            height: s,
            stroke: e.stroke,
            strokeWidth: e.strokeWidth,
            width: o,
            x: i,
            y: a,
          }),
        ],
      },
      `${e.key}-3d`,
    );
  if (e.isHorizontal) {
    let n = a + s / 2,
      o = (s * clampNumber(e.bottomScale ?? 1, 0.04, 1)) / 2,
      l = (s * clampNumber(e.topScale ?? 1, 0.04, 1)) / 2,
      u = n - o,
      f = n + o,
      p = n - l,
      m = n + l,
      h = `${i},${u} ${c},${p} ${c + d},${p + r} ${i + d},${u + r}`;
    `${c}${p}${c}${m}${c + d}${m + r}${c + d}${p + r}`;
    let g = `${c},${p} ${c + d},${p + r} ${c + d},${m + r} ${c},${m}`,
      _ = `${i},${u} ${c},${p} ${c},${m} ${i},${f}`;
    return (0, jsxRuntime.jsxs)(
      `g`,
      {
        children: [
          (0, jsxRuntime.jsx)(`polygon`, {
            fill: T,
            points: g,
            stroke: e.stroke,
            strokeWidth: Math.max(0.6, e.strokeWidth * 0.65),
          }),
          (0, jsxRuntime.jsx)(`polygon`, {
            fill: E,
            points: h,
            stroke: e.stroke,
            strokeWidth: Math.max(0.6, e.strokeWidth * 0.65),
          }),
          (0, jsxRuntime.jsx)(`polygon`, {
            fill: w,
            points: _,
            stroke: e.stroke,
            strokeWidth: e.strokeWidth,
          }),
        ],
      },
      `${e.key}-3d-horizontal-${t}`,
    );
  }
  let D = `${y},${a} ${b},${a} ${b + d},${a + r} ${y + d},${a + r}`,
    O = `${b},${a} ${v},${l} ${v + d},${l + r} ${b + d},${a + r}`,
    k = `${y},${a} ${b},${a} ${v},${l} ${_},${l}`;
  return (0, jsxRuntime.jsxs)(
    `g`,
    {
      children: [
        (0, jsxRuntime.jsx)(`polygon`, {
          fill: T,
          points: O,
          stroke: e.stroke,
          strokeWidth: Math.max(0.6, e.strokeWidth * 0.65),
        }),
        x
          ? (0, jsxRuntime.jsx)(`polygon`, {
              fill: E,
              points: D,
              stroke: e.stroke,
              strokeWidth: Math.max(0.6, e.strokeWidth * 0.65),
            })
          : null,
        (0, jsxRuntime.jsx)(`polygon`, { fill: w, points: k, stroke: e.stroke, strokeWidth: e.strokeWidth }),
      ],
    },
    `${e.key}-3d-${t}`,
  );
}
function pointsToPath(e: any, t: any = !1) {
  if (e.length === 0) return ``;
  let n = e.map((e: any, t: any) => `${t === 0 ? `M` : `L`} ${roundPathNumber(e.x)} ${roundPathNumber(e.y)}`);
  return (t && n.push(`Z`), n.join(` `));
}
function project3dPoint(e: any, t: any, n: any, r: any, i: any, a: any, o: any) {
  let s = Math.cos(r),
    c = Math.sin(r),
    l = Math.cos(i),
    u = Math.sin(i),
    d = e * l + n * u,
    f = -e * u + n * l,
    p = t * s - f * c,
    m = t * c + f * s,
    h = a ? 1 / Math.max(0.22, 1 + m * (0.26 + o * 0.54)) : 1;
  return { depth: m, x: d * h, y: p * h };
}
function renderLine3dChart(e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any, c: any, l: any) {
  let u = n.plot,
    d = resolveAxisScale(e.valueAxis, a, o, s || e.valueAxis?.crosses === `autoZero`);
  ((a = d.min), (o = d.max));
  let f = Math.max(1e-6, o - a),
    p = Math.max(1, e.series.length),
    m = Math.max(1, r.length),
    h = clampNumber((e.view3d?.depthPercent ?? 100) / 100, 0.5, 4),
    g = (p <= 1 ? 0.82 : 1.02) * h,
    _ = g,
    v = -g,
    y = s ? Math.max(a, Math.min(o, 0)) : a,
    b = clampNumber(e.view3d?.rotX ?? 18, -80, 80) * (Math.PI / 180),
    x = clampNumber(e.view3d?.rotY ?? 24, -80, 80) * (Math.PI / 180),
    S = e.view3d?.rAngAx === !1,
    C = clampNumber((e.view3d?.perspective ?? (S ? 26 : 0)) / 100, 0, 1),
    w = (e: any) => (m <= 1 ? 0 : (e / (m - 1) - 0.5) * 2),
    T = (e: any) => -(((e - a) / f - 0.5) * 2),
    E = _ - (s && c ? Math.max(0.18, (_ - v) * 0.56) : 0),
    D = (e: any) => (p <= 1 || (s && c) ? _ * 0.94 : (e / (p - 1) - 0.5) * (_ - v)),
    O = (e: any, t: any, n: any) => project3dPoint(e, T(t), n, b, x, S, C),
    k = [
      { x: -1, y: -1, z: v },
      { x: 1, y: -1, z: v },
      { x: 1, y: 1, z: v },
      { x: -1, y: 1, z: v },
      { x: -1, y: -1, z: _ },
      { x: 1, y: -1, z: _ },
      { x: 1, y: 1, z: _ },
      { x: -1, y: 1, z: _ },
    ].map((e) => project3dPoint(e.x, e.y, e.z, b, x, S, C)),
    A = i.map((e: any, t: any) => {
      let n = D(t);
      return e.map((e: any, t: any) => {
        let r = w(t),
          i = c ? (e.y1 ?? e.y ?? y) : (e.y ?? y),
          a = s && c ? (e.y0 ?? y) : y,
          o = O(r, i, n),
          l = O(r, a, n),
          u = s && c ? O(r, i, E) : null;
        return {
          bottom: l,
          bottomBack: s && c ? O(r, a, E) : null,
          categoryIndex: t,
          defined: e.defined,
          depth: o.depth,
          depthBack: u?.depth ?? o.depth,
          top: o,
          topBack: u,
        };
      });
    }),
    j = [
      ...k,
      ...A.flatMap((e: any) =>
        e.flatMap((e: any) =>
          e.defined
            ? [
                e.top,
                e.bottom,
                ...(e.topBack ? [e.topBack] : []),
                ...(e.bottomBack ? [e.bottomBack] : []),
              ]
            : [],
        ),
      ),
    ],
    M = Math.min(...j.map((e) => e.x)),
    N = Math.max(...j.map((e) => e.x)),
    P = Math.min(...j.map((e) => e.y)),
    F = Math.max(...j.map((e) => e.y)),
    I = Math.min(u.width / Math.max(0.4, N - M), u.height / Math.max(0.4, F - P)) * 0.82,
    ee = (M + N) / 2,
    L = (P + F) / 2,
    te = u.left + u.width / 2,
    ne = u.top + u.height / 2,
    re = (e: any) => ({ depth: e.depth, x: te + (e.x - ee) * I, y: ne + (e.y - L) * I }),
    R = k.map(re),
    ie = A.map((e: any, t: any) => ({
      averageDepth: e.reduce((e: any, t: any) => e + (t.depth + t.depthBack) / 2, 0) / Math.max(1, e.length),
      points: e.map((e: any) => ({
        bottom: re(e.bottom),
        bottomBack: e.bottomBack ? re(e.bottomBack) : null,
        categoryIndex: e.categoryIndex,
        defined: e.defined,
        top: re(e.top),
        topBack: e.topBack ? re(e.topBack) : null,
      })),
      seriesIndex: t,
    })).sort((e: any, t: any) => e.averageDepth - t.averageDepth),
    z = e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    ae = lightenHexColor(z, 0.56),
    oe = resolveAxisLabelColor(e),
    B = [
      [0, 1, !1],
      [1, 2, !1],
      [2, 3, !1],
      [3, 0, !1],
      [4, 5, !0],
      [5, 6, !0],
      [6, 7, !0],
      [7, 4, !0],
      [0, 4, !1],
      [1, 5, !0],
      [2, 6, !0],
      [3, 7, !1],
    ],
    se = d.ticks,
    ce = r.map((e: any, t: any) => ({ label: e, point: re(project3dPoint(w(t), -1.06, _, b, x, S, C)) })),
    le = se.map((e) => ({ point: re(project3dPoint(-1.04, T(e), _, b, x, S, C)), tick: e }));
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      se.map((e) => {
        let t = T(e),
          n = re(project3dPoint(-1, t, v, b, x, S, C)),
          r = re(project3dPoint(1, t, v, b, x, S, C)),
          i = re(project3dPoint(-1, t, _, b, x, S, C));
        return (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              (0, jsxRuntime.jsx)(`line`, {
                stroke: ae,
                strokeWidth: 1,
                x1: n.x,
                x2: r.x,
                y1: n.y,
                y2: r.y,
              }),
              (0, jsxRuntime.jsx)(`line`, {
                stroke: ae,
                strokeWidth: 0.9,
                x1: n.x,
                x2: i.x,
                y1: n.y,
                y2: i.y,
              }),
            ],
          },
          `line3d-grid-${e}`,
        );
      }),
      B.map(([e, t, n]: any, r) => {
        let i = R[e],
          a = R[t];
        return (0, jsxRuntime.jsx)(
          `line`,
          {
            stroke: n ? z : lightenHexColor(z, 0.34),
            strokeWidth: n ? 1.35 : 1,
            x1: i.x,
            x2: a.x,
            y1: i.y,
            y2: a.y,
          },
          `line3d-box-${r}`,
        );
      }),
      ie.map(({ points: n, seriesIndex: r }: any) => {
        let i = n.filter((e: any) => e.defined);
        if (i.length === 0) return null;
        let a = i.map((e: any) => e.top),
          o = s
            ? [
                ...i.map((e: any) => e.top),
                ...i
                  .slice()
                  .reverse()
                  .map((e: any) => e.bottom),
              ]
            : [],
          u =
            s && c
              ? [
                  ...i.map((e: any) => e.topBack ?? e.top),
                  ...i
                    .slice()
                    .reverse()
                    .map((e: any) => e.bottomBack ?? e.bottom),
                ]
              : [],
          d = resolveSeriesLineColor(e, r),
          f = resolveSeriesFillColor(e, r),
          p = markerSymbolPath(normalizeMarkerSymbol(e.series[r]?.markerSymbol), Math.max(4, e.series[r]?.markerSize ?? 6) * 0.52),
          m =
            s && c
              ? i.slice(1).map((e: any, t: any) => {
                  let n = i[t];
                  if (!n?.topBack || !e.topBack || !n.bottomBack || !e.bottomBack) return null;
                  let a = pointsToPath([n.top, e.top, e.topBack, n.topBack], !0),
                    o = pointsToPath([n.bottom, e.bottom, e.bottomBack, n.bottomBack], !0);
                  return (0, jsxRuntime.jsxs)(
                    reactInterop.Fragment,
                    {
                      children: [
                        (0, jsxRuntime.jsx)(`path`, {
                          ...chartSeriesDataAttrs(r),
                          d: a,
                          fill: lightenHexColor(f, 0.08),
                          fillOpacity: 0.8,
                          stroke: darkenHexColor(f, 0.16),
                          strokeWidth: 0.8,
                        }),
                        (0, jsxRuntime.jsx)(`path`, {
                          ...chartSeriesDataAttrs(r),
                          d: o,
                          fill: darkenHexColor(f, 0.2),
                          fillOpacity: 0.34,
                          stroke: darkenHexColor(f, 0.24),
                          strokeWidth: 0.6,
                        }),
                      ],
                    },
                    `line3d-area-face-${r}-${t}`,
                  );
                })
              : [],
          h = i[0] ?? null,
          g = i[i.length - 1] ?? null,
          _ =
            s && c && h?.topBack && h?.bottomBack
              ? pointsToPath([h.top, h.bottom, h.bottomBack, h.topBack], !0)
              : ``,
          v =
            s && c && g?.topBack && g?.bottomBack
              ? pointsToPath([g.top, g.bottom, g.bottomBack, g.topBack], !0)
              : ``;
        return (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              s && c && u.length >= 3
                ? (0, jsxRuntime.jsx)(`path`, {
                    ...chartSeriesDataAttrs(r),
                    d: pointsToPath(u, !0),
                    fill: darkenHexColor(f, 0.18),
                    fillOpacity: 0.44,
                    stroke: darkenHexColor(f, 0.26),
                    strokeWidth: 0.8,
                  })
                : null,
              m,
              _
                ? (0, jsxRuntime.jsx)(`path`, {
                    ...chartSeriesDataAttrs(r),
                    d: _,
                    fill: darkenHexColor(f, 0.24),
                    fillOpacity: 0.54,
                    stroke: darkenHexColor(f, 0.3),
                    strokeWidth: 0.7,
                  })
                : null,
              v
                ? (0, jsxRuntime.jsx)(`path`, {
                    ...chartSeriesDataAttrs(r),
                    d: v,
                    fill: darkenHexColor(f, 0.14),
                    fillOpacity: 0.6,
                    stroke: darkenHexColor(f, 0.24),
                    strokeWidth: 0.7,
                  })
                : null,
              s && o.length >= 3
                ? (0, jsxRuntime.jsx)(`path`, {
                    ...chartSeriesDataAttrs(r),
                    d: pointsToPath(o, !0),
                    fill: f,
                    fillOpacity: 0.74,
                    stroke: darkenHexColor(f, 0.12),
                    strokeWidth: 0.9,
                  })
                : null,
              s
                ? null
                : i.map((e: any, t: any) =>
                    (0, jsxRuntime.jsx)(
                      `line`,
                      {
                        stroke: lightenHexColor(d, 0.44),
                        strokeDasharray: `2 2`,
                        strokeWidth: 0.9,
                        x1: e.top.x,
                        x2: e.bottom.x,
                        y1: e.top.y,
                        y2: e.bottom.y,
                      },
                      `line3d-drop-${r}-${t}`,
                    ),
                  ),
              (0, jsxRuntime.jsx)(`path`, {
                ...chartSeriesDataAttrs(r),
                d: pointsToPath(a),
                fill: `none`,
                stroke: d,
                strokeLinejoin: `round`,
                strokeWidth: Math.max(1.8, e.series[r]?.lineWidthPx ?? 2),
              }),
              p.length > 0
                ? i.map((n: any, i: any) =>
                    (0, jsxRuntime.jsx)(
                      `g`,
                      {
                        transform: `translate(${roundPathNumber(n.top.x)}, ${roundPathNumber(n.top.y)})`,
                        children: (0, jsxRuntime.jsx)(`path`, {
                          ...chartSeriesDataAttrs(r, n.categoryIndex),
                          d: p,
                          fill: e.series[r]?.markerColor ?? f,
                          stroke: e.series[r]?.markerLineColor ?? e.chartAreaFillColor ?? t.surface,
                          strokeWidth: 1,
                        }),
                      },
                      `line3d-marker-${r}-${i}`,
                    ),
                  )
                : null,
              i.map((e: any) =>
                (0, reactInterop.createElement)(`circle`, {
                  ...chartSeriesDataAttrs(r, e.categoryIndex),
                  cx: e.top.x,
                  cy: e.top.y,
                  fill: `transparent`,
                  key: `line3d-hit-${r}-${e.categoryIndex}`,
                  r: 7,
                  stroke: `none`,
                }),
              ),
              i.map((t: any) =>
                isChartElementSelected(l, e.id, r, t.categoryIndex)
                  ? renderSelectionHandles(`line3d-selection-${r}-${t.categoryIndex}`, [{ x: t.top.x, y: t.top.y }])
                  : null,
              ),
            ],
          },
          `line3d-series-${r}`,
        );
      }),
      le.map(({ point: e, tick: t }) =>
        (0, jsxRuntime.jsx)(
          `text`,
          { fill: oe, fontSize: 10, textAnchor: `end`, x: e.x - 6, y: e.y + 3, children: formatTickNumber(t) },
          `line3d-y-label-${t}`,
        ),
      ),
      ce.map(({ label: e, point: t }: any, n: any) =>
        (0, jsxRuntime.jsx)(
          `text`,
          { fill: oe, fontSize: 10, textAnchor: `middle`, x: t.x, y: t.y + 14, children: e },
          `line3d-x-label-${n}`,
        ),
      ),
    ],
  });
}
function renderBarChart(e: any, t: any, n: any, r: any, i: any) {
  if (e.series.length === 0) return null;
  let a = resolveCategoryLabels(e);
  if (a.length === 0) return null;
  let o = r === `ColumnPercentStacked` || r === `BarPercentStacked`,
    s = r === `BarClustered` || r === `BarStacked` || r === `BarPercentStacked`,
    l = hasHistogramSeries(e) && r === `ColumnClustered`,
    d = s && e.categoryAxis?.orientation !== `maxMin`,
    f = d ? a.slice().reverse() : a,
    p = r === `ColumnStacked` || r === `BarStacked` || o,
    m = o ? `chartArea` : r === `ColumnClustered` ? `none` : `series`,
    h = f.length,
    g = e.series.length,
    _ = (() => {
      switch (e.shape3d) {
        case `cone`:
        case `coneToMax`:
          return `cone`;
        case `cylinder`:
          return `cylinder`;
        case `pyramid`:
        case `pyramidToMax`:
          return `pyramid`;
        default:
          return `box`;
      }
    })(),
    v = e.is3d ? computeBar3dDepth(e, s ? 9 : 11, s ? 7 : 8) : null,
    y =
      e.is3d && v
        ? {
            ...n.plot,
            height: Math.max(20, n.plot.height - v.insetBottom - 2),
            left: n.plot.left + v.insetLeft,
            top: n.plot.top + v.insetTop,
            width: Math.max(20, n.plot.width - v.insetLeft - v.insetRight - 2),
          }
        : n.plot,
    b = e.series.map((e: any) => {
      let t = Array.from({ length: h }, (t, n) => toFiniteNumber(e.values[n]) ?? 0);
      return d ? t.reverse() : t;
    }),
    x = b.map((e: any) => e.slice());
  if (o)
    for (let e = 0; e < h; e += 1) {
      let t = b.reduce((t: any, n: any) => t + Math.max(0, n[e] ?? 0), 0);
      for (let n = 0; n < g; n += 1) b[n][e] = t > 0 ? ((b[n][e] ?? 0) / t) * 100 : 0;
    }
  let S = Array.from({ length: h }, (e, t) => b.reduce((e: any, n: any) => e + Math.max(0, n[t] ?? 0), 0)),
    C = Array.from({ length: h }, (e, t) =>
      Math.abs(b.reduce((e: any, n: any) => e + Math.min(0, n[t] ?? 0), 0)),
    ),
    w = 1 / 0,
    T = -1 / 0;
  if (p)
    for (let e = 0; e < h; e += 1) {
      let t = 0,
        n = 0;
      for (let r = 0; r < g; r += 1) {
        let i = b[r][e] ?? 0;
        i >= 0 ? (t += i) : (n += i);
      }
      ((T = Math.max(T, t)), (w = Math.min(w, n)));
    }
  else for (let e of b) for (let t of e) ((T = Math.max(T, t)), (w = Math.min(w, t)));
  (!Number.isFinite(w) || !Number.isFinite(T)) && ((w = 0), (T = 1));
  let E = resolveAxisScale(e.valueAxis, w, T, !0);
  ((w = E.min), (T = E.max));
  let D = l ? { inner: 0, outer: 0 } : barPaddingFromGapWidth(e.gapWidth),
    O = u()
      .domain(f)
      .range(s ? [y.top, y.top + y.height] : [y.left, y.left + y.width])
      .paddingInner(D.inner)
      .paddingOuter(D.outer),
    k = u()
      .domain(Array.from({ length: g }, (e, t) => String(t)))
      .range([0, O.bandwidth()])
      .paddingInner(l ? 0 : 0.16)
      .paddingOuter(l ? 0 : 0.08),
    A = e.is3d === !0 && !s && !p && g > 1 && e.seriesAxis != null,
    j = A ? clampNumber(1.26 + g * 0.16, 1.4, 1.96) : 1,
    M = A && v ? v.depthX * j : 0,
    N = A && v ? v.depthY * j : 0,
    P = A ? M / Math.max(1, g) : 0,
    F = A ? N / Math.max(1, g) : 0,
    I = A ? Math.sign(P || v?.depthX || 1) * Math.max(8, Math.abs(P) * 1.14) : v?.depthX,
    ee = A ? Math.sign(F || v?.depthY || -1) * Math.max(5.5, Math.abs(F) * 1.12) : v?.depthY,
    L = e.valueAxis?.orientation === `maxMin`,
    te = c()
      .domain([w, T])
      .range(
        s
          ? L
            ? [y.left + y.width, y.left]
            : [y.left, y.left + y.width]
          : L
            ? [y.top, y.top + y.height]
            : [y.top + y.height, y.top],
      ),
    ne = o ? buildTicks(w, T, e.valueAxis?.majorUnit ?? 20) : E.ticks,
    re = f.map((e) => (O(e) ?? 0) + O.bandwidth() / 2),
    R = [],
    ie = Array.from({ length: h }, () => 0),
    z = Array.from({ length: h }, () => 0);
  for (let t = 0; t < g; t += 1)
    for (let n = 0; n < h; n += 1) {
      let r = b[t][n] ?? 0,
        i = x[t][n] ?? r,
        a = d ? h - 1 - n : n,
        c = e.series[t]?.dataPointStyles?.find((e: any) => e.index === a),
        u = 0,
        g = r;
      p &&
        (r >= 0 ? ((u = ie[n]), (ie[n] += r), (g = ie[n])) : ((u = z[n]), (z[n] += r), (g = z[n])));
      let y = resolveBarSeriesStyle(e, t, i, m),
        w = i < 0 && e.series[t]?.invertIfNegative === !0;
      (w ||
        (c?.color && ((y.fill = c.color), c.lineColor || (y.stroke = c.color)),
        c?.lineColor && (y.stroke = c.lineColor)),
        w && o && e.is3d && (y.fill = `#ffffff`));
      let T = f[n],
        E = O(T) ?? 0,
        D = A ? Math.max(7, O.bandwidth() * 0.4) : l || p ? O.bandwidth() : k.bandwidth(),
        j = A ? Math.max(0, (O.bandwidth() - D) * 0.5) : l || p ? 0 : (k(String(t)) ?? 0),
        M = A ? P * t : 0,
        N = A ? F * t : 0,
        L = M * (v?.depthX ?? 0) + N * (v?.depthY ?? 0),
        ne = _ === `pyramid` ? 0.94 : +(_ === `cone`),
        re = 1,
        ae = 1;
      if (e.is3d && ne > 0) {
        let e = (e: any) => {
          let t = clampNumber(e, 0, 1);
          return clampNumber(
            1 - (_ === `cone` ? t ** (s ? 1.85 : 1.08) : t) * ne,
            _ === `cone` ? 0 : 0.04,
            1,
          );
        };
        if (i >= 0) {
          let t = Math.max(1e-6, p ? S[n] : Math.abs(i));
          ((ae = e(p ? u / t : 0)), (re = e(p ? g / t : 1)));
        } else {
          let t = Math.max(1e-6, p ? C[n] : Math.abs(i));
          ((re = e(p ? Math.abs(u) / t : 0)), (ae = e(p ? Math.abs(g) / t : 1)));
        }
      }
      if (s) {
        let e = te(u),
          r = te(g),
          a = S[n] ?? 0,
          o = C[n] ?? 0;
        R.push({
          capEnd: !p || (i >= 0 ? Math.abs(g - a) < 1e-6 : Math.abs(g - o) < 1e-6),
          capStart: !p || Math.abs(u) < 1e-6,
          bottomScale: ae,
          categoryIndex: n,
          color: y.fill,
          depthOrder: L,
          depthOffsetX: M,
          depthOffsetY: N,
          height: Math.max(1, D),
          isHorizontal: !0,
          key: `bar-${t}-${n}`,
          left: Math.min(e, r),
          depthX: A ? I : v?.depthX,
          depthY: A ? ee : v?.depthY,
          shape3d: _,
          seriesIndex: t,
          stroke: y.stroke,
          strokeWidth: y.strokeWidth,
          topScale: re,
          top: E + j,
          invertedNegative: w,
          value: i,
          width: Math.max(1, Math.abs(r - e)),
        });
      } else {
        let e = te(u),
          r = te(g),
          a = S[n] ?? 0,
          o = C[n] ?? 0;
        R.push({
          capEnd: !p || (i >= 0 ? Math.abs(g - a) < 1e-6 : Math.abs(g - o) < 1e-6),
          capStart: !p || Math.abs(u) < 1e-6,
          bottomScale: ae,
          categoryIndex: n,
          color: y.fill,
          depthOrder: L,
          depthOffsetX: M,
          depthOffsetY: N,
          height: Math.max(1, Math.abs(r - e)),
          isHorizontal: !1,
          key: `bar-${t}-${n}`,
          left: E + j,
          depthX: A ? I : v?.depthX,
          depthY: A ? ee : v?.depthY,
          shape3d: _,
          seriesIndex: t,
          stroke: y.stroke,
          strokeWidth: y.strokeWidth,
          topScale: re,
          top: Math.min(e, r),
          invertedNegative: w,
          value: i,
          width: Math.max(1, D),
        });
      }
    }
  let ae: any =
      e.is3d && p
        ? R.slice().sort((e, t) => {
            if (e.categoryIndex !== t.categoryIndex) return e.categoryIndex - t.categoryIndex;
            let n = e.value < 0 ? 0 : 1,
              r = t.value < 0 ? 0 : 1;
            return n === r
              ? s
                ? e.left === t.left
                  ? e.seriesIndex - t.seriesIndex
                  : e.left - t.left
                : e.top === t.top
                  ? e.seriesIndex - t.seriesIndex
                  : t.top - e.top
              : n - r;
          })
        : R,
    oe = A
      ? ae
          .slice()
          .sort((e: any, t: any) =>
            (e.depthOrder ?? 0) === (t.depthOrder ?? 0)
              ? e.categoryIndex === t.categoryIndex
                ? e.top - t.top
                : e.categoryIndex - t.categoryIndex
              : (t.depthOrder ?? 0) - (e.depthOrder ?? 0),
          )
      : ae,
    B = e.is3d && !s,
    se = new Map();
  if (B)
    for (let t of ae)
      !t.color ||
        t.color === `none` ||
        t.color.startsWith(`url(`) ||
        (se.has(t.color) ||
          se.set(t.color, `bar3d-front-${e.id}-${se.size}`.replace(/[^A-Za-z0-9_-]/g, `-`)),
        (t.gradientId = se.get(t.color)));
  let ce = renderCartesianGrid(e, t, y, s, f, re, ne, (e: any) => te(e), o ? formatPercentTick : formatTickNumber),
    le = lightenHexColor(e.axisLineColor ?? e.chartAreaBorderColor ?? t.border, 0.48),
    ue = A ? M : (v?.depthX ?? 0),
    de = A ? N : (v?.depthY ?? 0),
    fe =
      A && v
        ? (0, jsxRuntime.jsxs)(`g`, {
            children: [
              Array.from({ length: h + 1 }, (e, t) => {
                let n = y.left + (t / Math.max(1, h)) * y.width;
                return (0, jsxRuntime.jsx)(
                  `line`,
                  {
                    stroke: le,
                    strokeWidth: 0.9,
                    x1: n,
                    x2: n + M,
                    y1: y.top + y.height,
                    y2: y.top + y.height + N,
                  },
                  `bar3d-floor-x-${t}`,
                );
              }),
              Array.from({ length: g + 1 }, (e, t) => {
                let n = t / Math.max(1, g),
                  r = M * n,
                  i = N * n;
                return (0, jsxRuntime.jsx)(
                  `line`,
                  {
                    stroke: le,
                    strokeWidth: 0.9,
                    x1: y.left + r,
                    x2: y.left + y.width + r,
                    y1: y.top + y.height + i,
                    y2: y.top + y.height + i,
                  },
                  `bar3d-floor-z-${t}`,
                );
              }),
              e.series.map((t: any, n: any) => {
                let r = (n + 0.5) / Math.max(1, g),
                  i = y.left + y.width + M * r,
                  a = y.top + y.height + N * r;
                return (0, jsxRuntime.jsx)(
                  `text`,
                  {
                    fill: resolveAxisLabelColor(e),
                    fontSize: 10,
                    textAnchor: `start`,
                    x: i + 7,
                    y: a + 3,
                    children: t.name ?? `Series ${n + 1}`,
                  },
                  `bar3d-ser-label-${n}`,
                );
              }),
            ],
          })
        : null,
    pe =
      e.is3d && v
        ? (0, jsxRuntime.jsxs)(`g`, {
            children: [
              (0, jsxRuntime.jsx)(`polygon`, {
                fill: lightenHexColor(e.chartAreaFillColor ?? t.surface, 0.05),
                points: `${y.left},${y.top + y.height} ${y.left + y.width},${y.top + y.height} ${y.left + y.width + ue},${y.top + y.height + de} ${y.left + ue},${y.top + y.height + de}`,
                stroke: lightenHexColor(e.axisLineColor ?? t.border, 0.2),
                strokeWidth: 1,
              }),
              (0, jsxRuntime.jsx)(`polygon`, {
                fill: lightenHexColor(e.chartAreaFillColor ?? t.surface, 0.12),
                points: `${y.left},${y.top} ${y.left + y.width},${y.top} ${y.left + y.width + ue},${y.top + de} ${y.left + ue},${y.top + de}`,
                stroke: lightenHexColor(e.axisLineColor ?? t.border, 0.2),
                strokeWidth: 1,
              }),
            ],
          })
        : null;
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      B && se.size > 0
        ? (0, jsxRuntime.jsx)(`defs`, {
            children: Array.from(se.entries()).map(([e, t]) =>
              (0, jsxRuntime.jsxs)(
                `linearGradient`,
                {
                  id: t,
                  x1: `0%`,
                  x2: `0%`,
                  y1: `0%`,
                  y2: `100%`,
                  children: [
                    (0, jsxRuntime.jsx)(`stop`, { offset: `0%`, stopColor: lightenHexColor(e, 0.28) }),
                    (0, jsxRuntime.jsx)(`stop`, { offset: `42%`, stopColor: lightenHexColor(e, 0.12) }),
                    (0, jsxRuntime.jsx)(`stop`, { offset: `100%`, stopColor: darkenHexColor(e, 0.1) }),
                  ],
                },
                t,
              ),
            ),
          })
        : null,
      ce,
      pe,
      fe,
      e.is3d
        ? oe.map((e: any) =>
            (0, jsxRuntime.jsx)(
              `g`,
              { ...chartSeriesFirstDataAttrs(e.seriesIndex, e.categoryIndex), children: renderBar3dShape(e) },
              `bar-hit-${e.key}`,
            ),
          )
        : ae.map((e: any) =>
            (0, reactInterop.createElement)(`rect`, {
              ...chartSeriesFirstDataAttrs(e.seriesIndex, e.categoryIndex),
              key: e.key,
              fill: e.color,
              height: e.height,
              stroke: l ? `none` : e.stroke,
              strokeWidth: l ? 0 : e.strokeWidth,
              width: e.width,
              x: e.left,
              y: e.top,
            }),
          ),
      ae.map((t: any) =>
        isChartPointSelected(i, e.id, t.seriesIndex, t.categoryIndex) ||
        (isChartSeriesSelected(i, e.id, t.seriesIndex) && i?.kind !== `point`)
          ? renderRectSelectionHandles(`bar-selection-${t.key}`, t.left, t.top, t.width, t.height)
          : null,
      ),
    ],
  });
}
function renderLineAreaChart(e: any, t: any, n: any, r: any, i: any) {
  if (e.series.length === 0) return null;
  let a = resolveCategoryLabels(e);
  if (a.length === 0) return null;
  let o = n.plot,
    s = e.displayBlanksAs,
    u = r === `Area` || r === `AreaStacked` || r === `AreaPercentStacked`,
    d = r === `AreaStacked` || r === `AreaPercentStacked`,
    f = r === `LineStacked` || r === `LinePercentStacked`,
    p = d || f,
    m = r === `AreaPercentStacked` || r === `LinePercentStacked`,
    h = e.series.map((e: any) => a.map((t, n) => toAxisNumber(e.values[n], s))),
    _ = p
      ? (() => {
          let t = Array.from({ length: a.length }, () => 0),
            n = Array.from({ length: a.length }, () => 0),
            r = m
              ? a.map((e, t) => {
                  let n = h.reduce((e: any, n: any) => e + (n[t] ?? 0), 0);
                  return Math.abs(n) < 1e-9 ? 1 : n;
                })
              : null;
          return e.series.map((e: any, i: any) =>
            a.map((e, a) => {
              let o = h[i]?.[a] ?? null;
              if (o == null) return { defined: !1, y: null, y0: null, y1: null };
              let s = m ? (o / (r?.[a] ?? 1)) * 100 : o;
              if (s >= 0) {
                let e = t[a],
                  n = e + s;
                return ((t[a] = n), { defined: !0, y: n, y0: e, y1: n });
              }
              let c = n[a],
                l = c + s;
              return ((n[a] = l), { defined: !0, y: l, y0: c, y1: l });
            }),
          );
        })()
      : e.series.map((e: any, t: any) =>
          a.map((e, n) => {
            let r = h[t]?.[n] ?? null;
            return { defined: r != null, y: r, y0: null, y1: r };
          }),
        ),
    y = _.flatMap((e: any) =>
      e.flatMap((e: any) =>
        e.defined ? [e.y0, e.y1].filter((e) => e != null && Number.isFinite(e)) : [],
      ),
    );
  if (y.length === 0) return null;
  let b = Math.min(...y),
    x = Math.max(...y);
  if (
    ((u || ((r === `Line` || f) && e.valueAxis?.crosses === `autoZero`)) && (b = Math.min(0, b)), m)
  ) {
    let t =
        typeof e.valueAxis?.min == `number` && Number.isFinite(e.valueAxis.min)
          ? Number(e.valueAxis.min)
          : Math.min(0, b),
      n =
        typeof e.valueAxis?.max == `number` && Number.isFinite(e.valueAxis.max)
          ? Number(e.valueAxis.max)
          : Math.max(100, x);
    ((b = t), (x = n <= t ? t + 1 : n));
  } else {
    let t = resolveAxisScale(e.valueAxis, b, x, u || e.valueAxis?.crosses === `autoZero`);
    ((b = t.min), (x = t.max));
  }
  let C = l()
      .domain(a)
      .range([o.left, o.left + o.width]),
    w = c()
      .domain([b, x])
      .range([o.top + o.height, o.top]),
    T = m
      ? buildTicks(b, x, e.valueAxis?.majorUnit ?? 20)
      : resolveAxisScale(e.valueAxis, b, x, u || e.valueAxis?.crosses === `autoZero`).ticks,
    E = a.map((e) => C(e) ?? o.left),
    D = g,
    O = w(Math.max(b, 0)),
    k = e.series.map((e: any, t: any) =>
      a.map((e, n) => {
        let r = _[t]?.[n] ?? { defined: !1, y: null, y0: null, y1: null };
        return { defined: r.defined, x: C(e) ?? o.left, y: r.y, y0: r.y0, y1: r.y1 };
      }),
    );
  if (e.is3d) return renderLine3dChart(e, t, n, a, _, b, x, u, p, i);
  let A = e.raw && typeof e.raw == `object` ? e.raw : null,
    j = A?.dropLines && typeof A.dropLines == `object` ? A.dropLines : null,
    M = A?.highLowLines && typeof A.highLowLines == `object` ? A.highLowLines : null,
    N = A?.upDownBars && typeof A.upDownBars == `object` ? A.upDownBars : null,
    P =
      normalizeHexColor(j?.shapeProperties?.lineColorHex) ??
      lightenHexColor(e.axisLineColor ?? e.chartAreaBorderColor ?? t.border, 0.45),
    F =
      normalizeHexColor(M?.shapeProperties?.lineColorHex) ?? e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    I = typeof N?.gapWidth == `number` && Number.isFinite(N.gapWidth) ? N.gapWidth : 150,
    ee = clampNumber(
      (E.length >= 2
        ? Math.min(
            ...E.slice(1)
              .map((e, t) => Math.abs(e - (E[t] ?? 0)))
              .filter((e) => e > 0),
          )
        : o.width) *
        (1 - barPaddingFromGapWidth(I).inner) *
        0.82,
      3,
      28,
    );
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      renderCartesianGrid(e, t, o, !1, a, E, T, (e: any) => w(e)),
      !u && !p && M
        ? a.map((e, t) => {
            let n = k.map((e: any) => e[t]?.y).filter((e: any) => e != null && Number.isFinite(e));
            if (n.length < 2) return null;
            let r = E[t] ?? o.left;
            return (0, jsxRuntime.jsx)(
              `line`,
              {
                stroke: F,
                strokeWidth: 1,
                x1: r,
                x2: r,
                y1: w(Math.min(...n)),
                y2: w(Math.max(...n)),
              },
              `high-low-${t}`,
            );
          })
        : null,
      !u && !p && N && k.length >= 2
        ? a.map((e, t) => {
            let n = k[0]?.[t],
              r = k[1]?.[t];
            if (!n || !r || n.y == null || r.y == null) return null;
            let i = w(Math.max(n.y, r.y)),
              a = w(Math.min(n.y, r.y)),
              s = r.y >= n.y ? darkenHexColor(F, 0.12) : `#c0504d`;
            return (0, jsxRuntime.jsx)(
              `rect`,
              {
                fill: s,
                fillOpacity: 0.92,
                height: Math.max(1, a - i),
                stroke: darkenHexColor(s, 0.18),
                strokeWidth: 1,
                width: ee,
                x: (E[t] ?? o.left) - ee / 2,
                y: i,
              },
              `up-down-${t}`,
            );
          })
        : null,
      e.series.map((t: any, n: any) => {
        let r = k[n] ?? [],
          a = s === `span` ? r.filter((e: any) => e.y != null) : r,
          o =
            v()
              .defined((e: any) => e.y != null)
              .x((e: any) => e.x)
              .y((e: any) => w(e.y ?? 0))
              .curve(D)(a) ?? ``,
          c = u
            ? (S()
                .defined((e: any) => (p ? e.y0 != null && e.y1 != null : e.y != null))
                .x((e: any) => e.x)
                .y0((e: any) => (p ? w(e.y0 ?? 0) : O))
                .y1((e: any) => w((p ? e.y1 : e.y) ?? 0))
                .curve(D)(r) ?? ``)
            : ``,
          l =
            typeof t.shapeProperties?.xmlFillColor == `string`
              ? t.shapeProperties.xmlFillColor
              : resolveSeriesFillColor(e, n);
        return (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              !u && !p && j
                ? r.map((e: any, t: any) =>
                    e.y == null
                      ? null
                      : (0, jsxRuntime.jsx)(
                          `line`,
                          { stroke: P, strokeWidth: 1, x1: e.x, x2: e.x, y1: w(e.y), y2: O },
                          `drop-line-${n}-${t}`,
                        ),
                  )
                : null,
              u
                ? (0, jsxRuntime.jsx)(`path`, { ...chartSeriesDataAttrs(n), d: c, fill: l, fillOpacity: 1, stroke: `none` })
                : null,
              (0, jsxRuntime.jsx)(`path`, {
                ...chartSeriesDataAttrs(n),
                d: o,
                fill: `none`,
                stroke: resolveSeriesLineColor(e, n),
                strokeLinecap: `round`,
                strokeLinejoin: `round`,
                strokeWidth: Math.max(1.5, t.lineWidthPx ?? 2),
              }),
              r.map((r: any, i: any) =>
                r.y == null
                  ? null
                  : (0, reactInterop.createElement)(`circle`, {
                      ...chartSeriesDataAttrs(n, i),
                      key: `line-marker-${n}-${i}`,
                      cx: r.x,
                      cy: w(r.y),
                      fill: t.markerColor ?? resolveSeriesFillColor(e, n),
                      r: Math.max(2, (t.markerSize ?? 6) * 0.25),
                      stroke: t.markerLineColor ?? e.chartAreaFillColor ?? resolveSeriesLineColor(e, n),
                      strokeWidth: 1,
                    }),
              ),
              r.map((t: any, r: any) =>
                t.y != null && (isChartPointSelected(i, e.id, n, r) || (isChartSeriesSelected(i, e.id, n) && i?.kind !== `point`))
                  ? u
                    ? renderSelectionHandles(`area-selection-${n}-${r}`, [{ x: t.x, y: w(t.y) }])
                    : renderRectSelectionHandles(`line-selection-${n}-${r}`, t.x - 4, w(t.y) - 4, 8, 8)
                  : null,
              ),
            ],
          },
          `line-series-${n}`,
        );
      }),
    ],
  });
}
function renderComboChart(e: any, t: any, n: any, r: any) {
  let i = resolveTypeGroups(e),
    a = i.find((e: any) => e.chartType.startsWith(`Column`)),
    o = i.find((e: any) => e.chartType.startsWith(`Line`));
  if (!a || !o) return null;
  let s = {
      ...e,
      categoryAxis: a.categoryAxis ?? e.categoryAxis,
      chartType: a.chartType,
      dataLabels: void 0,
      is3d: a.is3d ?? !1,
      series: a.series,
      valueAxis: a.valueAxis ?? e.valueAxis,
    },
    l = resolveCategoryLabels(s);
  if (l.length === 0) return null;
  let d = n.plot,
    f =
      typeof a.raw?.gapWidth == `number` && Number.isFinite(a.raw.gapWidth)
        ? a.raw.gapWidth
        : (a.gapWidth ?? e.gapWidth),
    p = a.series.some((e: any) => hasHistogramBins(e)),
    m = p ? { inner: 0, outer: 0 } : barPaddingFromGapWidth(f),
    h = u()
      .domain(l)
      .range([d.left, d.left + d.width])
      .paddingInner(m.inner)
      .paddingOuter(m.outer),
    _ = u()
      .domain(Array.from({ length: a.series.length }, (e, t) => String(t)))
      .range([0, h.bandwidth()])
      .paddingInner(p ? 0 : 0.16)
      .paddingOuter(p ? 0 : 0.08),
    y = l.map((e) => (h(e) ?? d.left) + h.bandwidth() / 2),
    b = (t: any) => {
      let n = e.series.findIndex((e: any) => e.id === t.id);
      return n >= 0 ? n : 0;
    },
    x = a.series.flatMap((e: any) => e.values.map((e: any) => toFiniteNumber(e)).filter((e: any) => e != null)),
    S = o.series.flatMap((e: any) => e.values.map((e: any) => toFiniteNumber(e)).filter((e: any) => e != null));
  if (x.length === 0 || S.length === 0) return null;
  let C = buildValueScale(
      typeof a.valueAxis?.min == `number` ? a.valueAxis.min : Math.min(...x),
      typeof a.valueAxis?.max == `number` ? a.valueAxis.max : Math.max(...x),
      a.valueAxis?.majorUnit,
      !0,
    ),
    w = buildValueScale(
      typeof o.valueAxis?.min == `number` ? o.valueAxis.min : Math.min(...S),
      typeof o.valueAxis?.max == `number` ? o.valueAxis.max : Math.max(...S),
      o.valueAxis?.majorUnit,
      !1,
    ),
    T = c()
      .domain([C.min, C.max])
      .range([d.top + d.height, d.top]),
    E = c()
      .domain([w.min, w.max])
      .range([d.top + d.height, d.top]),
    D = e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    O = resolveAxisLabelColor(e);
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      renderCartesianGrid(s, t, d, !1, l, y, C.ticks, (e: any) => T(e)),
      w.ticks.map((e) => {
        let t = E(e);
        return (0, jsxRuntime.jsx)(
          `text`,
          {
            fill: O,
            fontSize: 10,
            textAnchor: `start`,
            x: d.left + d.width + 6,
            y: t + 3,
            children: formatTickNumber(e),
          },
          `combo-secondary-tick-${e}`,
        );
      }),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: D,
        strokeWidth: 1.2,
        x1: d.left + d.width,
        x2: d.left + d.width,
        y1: d.top,
        y2: d.top + d.height,
      }),
      a.series.flatMap((t: any, n: any) =>
        l.map((i, a) => {
          let o = b(t),
            c = toFiniteNumber(t.values[a]) ?? 0,
            l = h(i) ?? d.left,
            u = Math.max(1, p ? h.bandwidth() : _.bandwidth()),
            f = l + (p ? 0 : (_(String(n)) ?? 0)),
            m = T(Math.max(0, c)),
            g = T(0),
            v = Math.max(1, Math.abs(g - T(c))),
            y = isChartPointSelected(r, e.id, o, a) || (isChartSeriesSelected(r, e.id, o) && r?.kind !== `point`);
          return (0, jsxRuntime.jsxs)(
            reactInterop.Fragment,
            {
              children: [
                (0, jsxRuntime.jsx)(`rect`, {
                  ...chartSeriesFirstDataAttrs(o, a),
                  fill: t.color ?? t.lineColor ?? resolveSeriesFillColor(s, n),
                  height: v,
                  stroke: y ? `#64748b` : p ? `none` : (t.lineColor ?? t.color ?? resolveSeriesLineColor(s, n)),
                  strokeWidth: y ? 2 : +!p,
                  width: u,
                  x: f,
                  y: Math.min(m, g),
                }),
                y ? renderRectSelectionHandles(`combo-bar-selection-${o}-${a}`, f, Math.min(m, g), u, v) : null,
              ],
            },
            `combo-bar-${n}-${a}`,
          );
        }),
      ),
      o.series.map((t: any, n: any) => {
        let i = b(t),
          o = l.map((e, n) => ({ x: (h(e) ?? d.left) + h.bandwidth() / 2, y: toFiniteNumber(t.values[n]) })),
          s = e.displayBlanksAs === `span` ? o.filter((e) => e.y != null) : o,
          c =
            v()
              .defined((e: any) => e.y != null)
              .x((e: any) => e.x)
              .y((e: any) => E(e.y ?? 0))
              .curve(g)(s) ?? ``;
        return (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              (0, jsxRuntime.jsx)(`path`, {
                ...chartSeriesDataAttrs(i),
                d: c,
                fill: `none`,
                stroke: t.lineColor ?? t.color ?? resolveSeriesLineColor(e, a.series.length + n),
                strokeLinecap: `round`,
                strokeLinejoin: `round`,
                strokeWidth: Math.max(1.5, t.lineWidthPx ?? 2),
              }),
              o.map((r, o) =>
                r.y == null
                  ? null
                  : (0, reactInterop.createElement)(`path`, {
                      ...chartSeriesDataAttrs(i, o),
                      d: markerSymbolPath(normalizeMarkerSymbol(t.markerSymbol), Math.max(4, t.markerSize ?? 7)) || markerSymbolPath(`circle`, 7),
                      fill: t.markerColor ?? t.color ?? t.lineColor ?? resolveSeriesFillColor(e, a.series.length + n),
                      key: `combo-line-marker-${n}-${o}`,
                      stroke: t.markerLineColor ?? e.chartAreaFillColor ?? `#ffffff`,
                      strokeWidth: 1,
                      transform: `translate(${r.x}, ${E(r.y)})`,
                    }),
              ),
              o.map((t, n) =>
                t.y != null && isChartElementSelected(r, e.id, i, n)
                  ? renderRectSelectionHandles(`combo-line-selection-${i}-${n}`, t.x - 4, E(t.y) - 4, 8, 8)
                  : null,
              ),
            ],
          },
          `combo-line-${n}`,
        );
      }),
    ],
  });
}
function renderScatterChart(e: any, t: any, n: any, r: any, i: any) {
  let a = n.plot,
    o = e.raw && typeof e.raw == `object` ? e.raw : null,
    s = typeof e.title == `string` ? e.title.trim().toLowerCase() : ``,
    l =
      typeof e.scatterStyle == `string`
        ? e.scatterStyle
        : o && typeof o.scatterStyle == `string`
          ? o.scatterStyle
          : void 0,
    u = l ? l === `line` || l === `lineMarker` || l === `smooth` || l === `smoothMarker` : !0,
    d = l ? l === `marker` || l === `lineMarker` || l === `smoothMarker` : !0,
    f = l ? l === `smooth` || l === `smoothMarker` : r,
    p = s.includes(`marker only`),
    m = s.includes(`no markers`),
    h = s.includes(`with markers`),
    _ = e.series.map((e: any) => {
      let t = e.values.length,
        n = Array.from({ length: t }, (t, n) => extractNumericValue(e.categories[n])),
        r = n,
        i = !1;
      if (n.filter((e) => e != null).length < Math.max(2, t - 1)) {
        let n = e.categories ?? [],
          a = Array.from({ length: t }, (e, t) => {
            let r = [n[t], n[t * 2], n[t * 2 + 1], n[t + 1]];
            for (let e of r) {
              let t = extractNumericValue(e);
              if (t != null) return t;
            }
            return null;
          });
        if (a.filter((e) => e != null).length >= 2) r = a;
        else {
          let e = n.map((e: any) => extractNumericValue(e)).filter((e: any) => e != null);
          e.length >= 2
            ? (r = Array.from({ length: t }, (t, n) => e[n] ?? e[e.length - 1] ?? null))
            : ((i = !0), (r = Array.from({ length: t }, (e, t) => t + 1)));
        }
      }
      return {
        pointCount: t,
        points: e.values
          .map((e: any, t: any) => {
            let n = extractNumericValue(r[t]),
              i = toFiniteNumber(e);
            return n == null || i == null ? null : { x: n, y: i };
          })
          .filter((e: any) => e != null),
        series: e,
        usesSyntheticIndex: i,
      };
    }),
    y = _.flatMap((e: any) => e.points.map((e: any) => e.x)),
    b = _.flatMap((e: any) => e.points.map((e: any) => e.y));
  if (y.length === 0 || b.length === 0) return null;
  let x = typeof e.categoryAxis?.min == `number` && Number.isFinite(e.categoryAxis.min),
    S = typeof e.categoryAxis?.max == `number` && Number.isFinite(e.categoryAxis.max),
    C = typeof e.valueAxis?.min == `number` && Number.isFinite(e.valueAxis.min),
    w = typeof e.valueAxis?.max == `number` && Number.isFinite(e.valueAxis.max),
    T = _.some((e: any) => e.usesSyntheticIndex),
    E = Math.max(0, ..._.map((e: any) => e.pointCount)),
    D = x ? Number(e.categoryAxis?.min) : Math.min(...y),
    k = S ? Number(e.categoryAxis?.max) : Math.max(...y),
    A = C ? Number(e.valueAxis?.min) : Math.min(...b),
    j = w ? Number(e.valueAxis?.max) : Math.max(...b);
  (x || (D = T ? 0 : e.categoryAxis?.crosses === `autoZero` ? Math.min(0, D) : D),
    S || (k = T ? Math.max(k, E + 1) : e.categoryAxis?.crosses === `autoZero` ? Math.max(0, k) : k),
    !C && e.valueAxis?.crosses === `autoZero` && (A = Math.min(0, A)),
    !w && e.valueAxis?.crosses === `autoZero` && (j = Math.max(0, j)),
    k <= D && (k = D + 1),
    j <= A && (j = A + 1));
  let M =
      typeof e.categoryAxis?.majorUnit == `number` && e.categoryAxis.majorUnit > 0
        ? e.categoryAxis.majorUnit
        : niceTickStep(D, k, 5),
    N =
      typeof e.valueAxis?.majorUnit == `number` && e.valueAxis.majorUnit > 0
        ? e.valueAxis.majorUnit
        : niceTickStep(A, j, 5);
  (!x && !T && Number.isFinite(M) && M > 0 && (D = Math.floor(D / M) * M),
    !S && !T && Number.isFinite(M) && M > 0 && (k = Math.ceil(k / M) * M),
    !C && Number.isFinite(N) && N > 0 && (A = Math.floor(A / N) * N),
    !w && Number.isFinite(N) && N > 0 && (j = Math.ceil(j / N) * N));
  let P = k <= D ? D + 1 : k,
    F = j <= A ? A + 1 : j,
    I = c()
      .domain([D, P])
      .range([a.left, a.left + a.width]),
    ee = c()
      .domain([A, F])
      .range([a.top + a.height, a.top]),
    L =
      typeof e.categoryAxis?.majorUnit == `number` && e.categoryAxis.majorUnit > 0
        ? e.categoryAxis.majorUnit
        : T
          ? 1
          : void 0,
    te =
      typeof e.valueAxis?.majorUnit == `number` && e.valueAxis.majorUnit > 0
        ? e.valueAxis.majorUnit
        : niceTickStep(A, F, 6),
    ne = buildTicks(D, P, L),
    re = buildTicks(A, F, te),
    R = e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    ie = resolveAxisLabelColor(e),
    z = D <= 0 && P >= 0,
    ae = A <= 0 && F >= 0;
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      ne.map((e) =>
        (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              (0, jsxRuntime.jsx)(`line`, {
                stroke: lightenHexColor(R, 0.7),
                strokeWidth: 1,
                x1: I(e),
                x2: I(e),
                y1: a.top,
                y2: a.top + a.height,
              }),
              (0, jsxRuntime.jsx)(`text`, {
                fill: ie,
                fontSize: 10,
                textAnchor: `middle`,
                x: I(e),
                y: a.top + a.height + 14,
                children: formatTickNumber(e),
              }),
            ],
          },
          `scatter-x-${e}`,
        ),
      ),
      re.map((e) =>
        (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              (0, jsxRuntime.jsx)(`line`, {
                stroke: lightenHexColor(R, 0.7),
                strokeWidth: 1,
                x1: a.left,
                x2: a.left + a.width,
                y1: ee(e),
                y2: ee(e),
              }),
              (0, jsxRuntime.jsx)(`text`, {
                fill: ie,
                fontSize: 10,
                textAnchor: `end`,
                x: a.left - 6,
                y: ee(e) + 3,
                children: formatTickNumber(e),
              }),
            ],
          },
          `scatter-y-${e}`,
        ),
      ),
      ae
        ? (0, jsxRuntime.jsx)(`line`, {
            stroke: R,
            strokeWidth: 1.2,
            x1: a.left,
            x2: a.left + a.width,
            y1: ee(0),
            y2: ee(0),
          })
        : null,
      z
        ? (0, jsxRuntime.jsx)(`line`, {
            stroke: R,
            strokeWidth: 1.2,
            x1: I(0),
            x2: I(0),
            y1: a.top,
            y2: a.top + a.height,
          })
        : null,
      _.map((t: any, n: any) => {
        let a = t.series,
          o = Math.max(5, a.markerSize ?? 7),
          s = markerSymbolPath(normalizeMarkerSymbol(a.markerSymbol), o * 0.55),
          c = a.lineColor ?? a.markerColor ?? a.color ?? resolveSeriesLineColor(e, n),
          l = !p && u && a.shapeProperties?.xmlLineHidden !== !0 && t.points.length > 1,
          _ = !m && (p || h || d) && s.length > 0,
          y = r || f || a.smooth === !0 ? O.alpha(0.5) : g,
          b = l
            ? (v()
                .x((e: any) => I(e.x))
                .y((e: any) => ee(e.y))
                .curve(y)(t.points) ?? ``)
            : ``;
        return (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              l && b.length > 0
                ? (0, jsxRuntime.jsx)(`path`, {
                    ...chartSeriesDataAttrs(n),
                    d: b,
                    fill: `none`,
                    stroke: a.lineColor ?? resolveSeriesLineColor(e, n),
                    strokeLinecap: `round`,
                    strokeLinejoin: `round`,
                    strokeWidth: Math.max(1.2, a.lineWidthPx ?? 2),
                  })
                : null,
              t.points.map((e: any, t: any) =>
                _
                  ? (0, jsxRuntime.jsx)(
                      `g`,
                      {
                        transform: `translate(${I(e.x)}, ${ee(e.y)})`,
                        children: (0, jsxRuntime.jsx)(`path`, {
                          ...chartSeriesDataAttrs(n, t, { selectionMode: `seriesFirst` }),
                          d: s,
                          fill: c,
                          stroke: `none`,
                          strokeWidth: 0,
                        }),
                      },
                      `scatter-point-${n}-${t}`,
                    )
                  : null,
              ),
              t.points.map((t: any, r: any) =>
                isChartPointSelected(i, e.id, n, r) || (isChartSeriesSelected(i, e.id, n) && i?.kind !== `point`)
                  ? renderSelectionHandles(`scatter-selection-${n}-${r}`, [{ x: I(t.x), y: ee(t.y) }])
                  : null,
              ),
            ],
          },
          `scatter-series-${n}`,
        );
      }),
    ],
  });
}
function renderBubbleChart(e: any, t: any, n: any, r: any) {
  let i = n.plot,
    a = e.series.map((e: any) =>
      e.values
        .map((t: any, n: any) => {
          let r = toFiniteNumber(e.categories[n]),
            i = toFiniteNumber(t),
            a = toFiniteNumber(e.bubbleSizes?.[n]);
          return r == null || i == null ? null : { bubble: a ?? 1, index: n, x: r, y: i };
        })
        .filter((e: any) => e != null),
    ),
    o = a.flatMap((e: any) => e.map((e: any) => e.x)),
    s = a.flatMap((e: any) => e.map((e: any) => e.y)),
    l = a.flatMap((e: any) => e.map((e: any) => e.bubble));
  if (o.length === 0 || s.length === 0) return null;
  let u = Math.min(...o),
    d = Math.max(...o),
    f = Math.min(...s),
    p = Math.max(...s),
    m = l.map((e: any) => Math.sqrt(Math.max(0, e))),
    h = Math.min(...m),
    g = Math.max(...m),
    _ = clampNumber((e.bubbleScale ?? 100) / 100, 0.2, 4),
    v = Math.max(6, 12 * _),
    y = c()
      .domain([h, g <= h ? h + 1 : g])
      .range([4, v]),
    b = d <= u ? u + 1 : d,
    x = p <= f ? f + 1 : p,
    S = b - u,
    C = x - f,
    w = Math.max(S * 0.04, (S * v) / Math.max(1, i.width)),
    T = Math.max(C * 0.06, (C * v) / Math.max(1, i.height)),
    E = resolveAxisScale(e.categoryAxis, u - w, b + w, e.categoryAxis?.crosses === `autoZero`),
    D = resolveAxisScale(e.valueAxis, f - T, x + T, e.valueAxis?.crosses === `autoZero`),
    O = c()
      .domain([E.min, E.max])
      .range([i.left, i.left + i.width]),
    k = c()
      .domain([D.min, D.max])
      .range([i.top + i.height, i.top]),
    A = E.ticks,
    j = D.ticks,
    M = e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    N = resolveAxisLabelColor(e),
    P = e.bubble3d === !0 || e.is3d === !0,
    F = !!(
      e.dataLabels?.showCategoryName ||
      e.dataLabels?.showSeriesName ||
      e.dataLabels?.showValue ||
      e.dataLabels?.showBubbleSize ||
      e.dataLabels?.showPercent
    ),
    I = a.map((e: any) => e.reduce((e: any, t: any) => e + Math.abs(t.bubble), 0));
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      A.map((e) =>
        (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              (0, jsxRuntime.jsx)(`line`, {
                stroke: lightenHexColor(M, 0.72),
                strokeWidth: 1,
                x1: O(e),
                x2: O(e),
                y1: i.top,
                y2: i.top + i.height,
              }),
              (0, jsxRuntime.jsx)(`text`, {
                fill: N,
                fontSize: 10,
                textAnchor: `middle`,
                x: O(e),
                y: i.top + i.height + 14,
                children: formatTickNumber(e),
              }),
            ],
          },
          `bubble-x-${e}`,
        ),
      ),
      j.map((e) =>
        (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              (0, jsxRuntime.jsx)(`line`, {
                stroke: lightenHexColor(M, 0.72),
                strokeWidth: 1,
                x1: i.left,
                x2: i.left + i.width,
                y1: k(e),
                y2: k(e),
              }),
              (0, jsxRuntime.jsx)(`text`, {
                fill: N,
                fontSize: 10,
                textAnchor: `end`,
                x: i.left - 6,
                y: k(e) + 3,
                children: formatTickNumber(e),
              }),
            ],
          },
          `bubble-y-${e}`,
        ),
      ),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: M,
        strokeWidth: 1.2,
        x1: i.left,
        x2: i.left + i.width,
        y1: i.top + i.height,
        y2: i.top + i.height,
      }),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: M,
        strokeWidth: 1.2,
        x1: i.left,
        x2: i.left,
        y1: i.top,
        y2: i.top + i.height,
      }),
      a.map((t: any, n: any) =>
        (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              P
                ? (0, jsxRuntime.jsx)(`defs`, {
                    children: (0, jsxRuntime.jsxs)(`radialGradient`, {
                      id: `bubble3d-grad-${e.id}-${n}`,
                      cx: `35%`,
                      cy: `30%`,
                      r: `70%`,
                      children: [
                        (0, jsxRuntime.jsx)(`stop`, {
                          offset: `0%`,
                          stopColor: lightenHexColor(
                            e.series[n]?.color ?? e.series[n]?.lineColor ?? resolveSeriesFillColor(e, n),
                            0.42,
                          ),
                        }),
                        (0, jsxRuntime.jsx)(`stop`, {
                          offset: `58%`,
                          stopColor: e.series[n]?.color ?? e.series[n]?.lineColor ?? resolveSeriesFillColor(e, n),
                        }),
                        (0, jsxRuntime.jsx)(`stop`, {
                          offset: `100%`,
                          stopColor: darkenHexColor(
                            e.series[n]?.color ?? e.series[n]?.lineColor ?? resolveSeriesFillColor(e, n),
                            0.18,
                          ),
                        }),
                      ],
                    }),
                  })
                : null,
              [...t]
                .sort((e, t) => (e.bubble === t.bubble ? e.index - t.index : t.bubble - e.bubble))
                .map((t) => {
                  let i = e.series[n],
                    a = i?.color ?? i?.lineColor ?? resolveSeriesFillColor(e, n),
                    o = y(Math.sqrt(Math.max(0, t.bubble))),
                    s = [];
                  return (
                    e.dataLabels?.showSeriesName && i?.name && s.push(i.name),
                    e.dataLabels?.showCategoryName && s.push(formatTickNumber(t.x)),
                    e.dataLabels?.showValue && s.push(formatTickNumber(t.y)),
                    e.dataLabels?.showBubbleSize && s.push(formatTickNumber(t.bubble)),
                    e.dataLabels?.showPercent &&
                      s.push(`${Math.round((Math.abs(t.bubble) / Math.max(1, I[n] ?? 1)) * 100)}%`),
                    (0, jsxRuntime.jsxs)(
                      `g`,
                      {
                        children: [
                          (0, jsxRuntime.jsx)(`circle`, {
                            ...chartSeriesDataAttrs(n, t.index, { selectionMode: `seriesFirst` }),
                            cx: O(t.x),
                            cy: k(t.y),
                            fill: P ? `url(#bubble3d-grad-${e.id}-${n})` : a,
                            fillOpacity: P ? 0.98 : 0.78,
                            r: o,
                            stroke: darkenHexColor(a, 0.18),
                            strokeWidth: P ? 1.2 : 1,
                          }),
                          isChartPointSelected(r, e.id, n, t.index) || (isChartSeriesSelected(r, e.id, n) && r?.kind !== `point`)
                            ? renderRectSelectionHandles(
                                `bubble-selection-${n}-${t.index}`,
                                O(t.x) - o,
                                k(t.y) - o,
                                o * 2,
                                o * 2,
                              )
                            : null,
                          P
                            ? (0, jsxRuntime.jsx)(`ellipse`, {
                                cx: O(t.x) - o * 0.16,
                                cy: k(t.y) - o * 0.22,
                                fill: `#ffffff`,
                                opacity: 0.22,
                                rx: Math.max(1.5, o * 0.34),
                                ry: Math.max(1, o * 0.2),
                              })
                            : null,
                          F && s.length > 0
                            ? (0, jsxRuntime.jsx)(`text`, {
                                fill: resolveTitleTextColor(e),
                                fontSize: 10,
                                textAnchor: `start`,
                                x: O(t.x) + o + 4,
                                y: k(t.y) + 3,
                                children: s.join(`, `),
                              })
                            : null,
                        ],
                      },
                      `bubble-${n}-${t.index}`,
                    )
                  );
                }),
            ],
          },
          `bubble-series-${n}`,
        ),
      ),
    ],
  });
}
function renderRadarChart(e: any, t: any, n: any, r: any) {
  if (e.series.length === 0) return null;
  let i = resolveCategoryLabels(e);
  if (i.length === 0) return null;
  let a = n.plot,
    o = a.left + a.width * 0.5,
    s = a.top + a.height * 0.52,
    c = Math.max(22, Math.min(a.width, a.height) * 0.38),
    l = e.series.flatMap((e: any) =>
      e.values
        .slice(0, i.length)
        .map((e: any) => toFiniteNumber(e))
        .filter((e: any) => e != null),
    ),
    u = typeof e.valueAxis?.min == `number` && Number.isFinite(e.valueAxis.min),
    d = typeof e.valueAxis?.max == `number` && Number.isFinite(e.valueAxis.max),
    f = u ? Number(e.valueAxis?.min) : Math.min(0, ...(l.length ? l : [0])),
    p = d ? Number(e.valueAxis?.max) : Math.max(1, ...(l.length ? l : [1]));
  e.valueAxis?.crosses === `autoZero` && (f = Math.min(0, f));
  let m = p <= f ? f + 1 : p,
    h = Math.max(1e-6, m - f),
    y =
      typeof e.valueAxis?.majorUnit == `number` && e.valueAxis.majorUnit > 0
        ? e.valueAxis.majorUnit
        : void 0,
    b = y && h / y >= 3 ? y : niceTickStep(f, m, 6),
    x = buildTicks(f, m, b),
    S = e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    C = resolveAxisLabelColor(e),
    w = e.radarStyle === `filled`,
    T = e.categoryAxis?.majorGridlines === !0,
    E = (e: any) => (Math.PI * 2 * e) / i.length - Math.PI / 2,
    D = (e: any, t: any) => {
      let n = E(e),
        r = c * t;
      return { x: o + Math.cos(n) * r, y: s + Math.sin(n) * r };
    };
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      x.map((n, r) => {
        let a = (n - f) / (m - f),
          l = i.map((e, t) => D(t, a));
        return (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              (0, jsxRuntime.jsx)(`path`, {
                d:
                  v()
                    .x((e: any) => e.x)
                    .y((e: any) => e.y)
                    .curve(_)(l) ?? ``,
                fill: r % 2 == 0 ? `transparent` : lightenHexColor(e.chartAreaFillColor ?? t.surface, 0.04),
                stroke: lightenHexColor(S, 0.5),
                strokeWidth: 1,
              }),
              (0, jsxRuntime.jsx)(`text`, {
                fill: C,
                fontSize: 9,
                x: o + 4,
                y: s - c * a + 3,
                children: formatTickNumber(n),
              }),
            ],
          },
          `radar-ring-${r}`,
        );
      }),
      i.map((e, t) => {
        let n = D(t, 1);
        return (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              T
                ? (0, jsxRuntime.jsx)(`line`, {
                    stroke: lightenHexColor(S, 0.52),
                    strokeWidth: 1,
                    x1: o,
                    x2: n.x,
                    y1: s,
                    y2: n.y,
                  })
                : null,
              (0, jsxRuntime.jsx)(`text`, {
                fill: C,
                fontSize: 10,
                textAnchor: `middle`,
                x: o + (n.x - o) * 1.1,
                y: s + (n.y - s) * 1.1,
                children: e,
              }),
            ],
          },
          `radar-axis-${t}`,
        );
      }),
      e.series.map((n: any, a: any) => {
        let o = i.map((e, t) => {
            let r = toFiniteNumber(n.values[t]);
            return r == null
              ? { defined: !1, pointIndex: t, ...D(t, 0) }
              : { defined: !0, pointIndex: t, ...D(t, clampNumber((r - f) / (m - f), 0, 1)) };
          }),
          s = o.filter((e) => e.defined);
        if (s.length === 0) return null;
        let c = o.some((e) => !e.defined),
          l =
            v()
              .defined((e: any) => e.defined)
              .x((e: any) => e.x)
              .y((e: any) => e.y)
              .curve(c ? g : _)(o) ?? ``,
          u = resolveSeriesFillColor(e, a),
          d = normalizeMarkerSymbol(n.markerSymbol),
          p = markerSymbolPath(d, Math.max(4, n.markerSize ?? 6) * 0.5),
          h = d !== `none` && p.length > 0;
        return (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              s.length >= 2
                ? (0, jsxRuntime.jsx)(`path`, {
                    ...chartSeriesDataAttrs(a),
                    d: l,
                    fill: w && !c && s.length >= 3 ? u : `none`,
                    fillOpacity: w ? 0.26 : 0,
                    stroke: resolveSeriesLineColor(e, a),
                    strokeWidth: 1.8,
                  })
                : null,
              h
                ? s.map((r) =>
                    (0, jsxRuntime.jsx)(
                      `g`,
                      {
                        transform: `translate(${r.x}, ${r.y})`,
                        children: (0, jsxRuntime.jsx)(`path`, {
                          ...chartSeriesDataAttrs(a, r.pointIndex),
                          d: p,
                          fill: n.markerColor ?? u,
                          stroke: n.markerLineColor ?? e.chartAreaFillColor ?? t.surface,
                          strokeWidth: 1,
                        }),
                      },
                      `radar-point-${a}-${r.pointIndex}`,
                    ),
                  )
                : null,
              s.map((t) =>
                isChartPointSelected(r, e.id, a, t.pointIndex) || (isChartSeriesSelected(r, e.id, a) && r?.kind !== `point`)
                  ? renderSelectionHandles(`radar-selection-${a}-${t.pointIndex}`, [{ x: t.x, y: t.y }])
                  : null,
              ),
            ],
          },
          `radar-series-${a}`,
        );
      }),
    ],
  });
}
function renderPieChart(e: any, t: any, n: any, r: any, i: any) {
  let a = pickPrimarySeriesIndex(e),
    o = e.series[a],
    s = collectPieDataPoints(e, a);
  if (s.length === 0) return null;
  let c =
      n.legendPosition === `right`
        ? n.plot.left + n.plot.width * 0.42
        : n.plot.left + n.plot.width * 0.5,
    l = n.plot.top + n.plot.height * 0.54,
    u = Math.max(16, Math.min(n.plot.width, n.plot.height) * (r === `Doughnut` ? 0.32 : 0.38)),
    d = u * (r === `Doughnut` ? clampNumber((e.holeSize ?? 56) / 100, 0.1, 0.9) : 0),
    f = ((e.firstSliceAngle ?? 0) * Math.PI) / 180,
    p = D()
      .value((e: any) => e.value)
      .sort(null)
      .startAngle(f)
      .endAngle(f + Math.PI * 2)(s),
    m = h().innerRadius(d).outerRadius(u),
    g = r === `Pie3D` || (r === `PieExploded` && e.is3d === !0),
    _ = e.view3d?.rotX ?? 20,
    v = e.view3d?.perspective ?? 30,
    y = clampNumber(0.14 + (_ / 90) * 0.72, 0.12, 0.92),
    b = clampNumber(1 - v / 180, 0.55, 1),
    x = g ? clampNumber(y * b, 0.14, 0.78) : 1,
    S = (e.view3d?.depthPercent ?? 100) / 100,
    C = g ? Math.max(9, u * 0.28 * S) : 0,
    w = !!(e.dataLabels?.showCategoryName || e.dataLabels?.showPercent || e.dataLabels?.showValue),
    T = s.reduce((e: any, t: any) => e + t.value, 0),
    E = `pie3d-shadow-${e.id}`.replace(/[^A-Za-z0-9_-]/g, `-`),
    O = `pie3d-base-shadow-${e.id}`.replace(/[^A-Za-z0-9_-]/g, `-`),
    k = e.chartAreaFillColor ?? `#ffffff`,
    A = { bottom: n.height - 6, left: 6, right: n.width - 6, top: n.plot.top + 8 },
    j: Map<any, any> = new Map((e.dataLabels?.pointLabels ?? []).map((e: any) => [e.index, e])),
    M =
      r === `Doughnut`
        ? ((e.dataLabels?.pointLabels ?? []).find(
            (e: any) =>
              e.deleted !== !0 &&
              e.showValue === !0 &&
              e.showCategoryName !== !0 &&
              e.showPercent !== !0 &&
              e.showSeriesName !== !0 &&
              e.showBubbleSize !== !0,
          ) ?? null)
        : null,
    N = M ? (s.find((e: any) => e.index === M.index) ?? null) : null,
    P = r === `Doughnut` && N != null,
    F = N != null && T > 0 && T <= 1.0000001 && N.value >= 0 && N.value <= 1.0000001,
    I = N == null ? `` : F ? `${Math.round(N.value * 100)}%` : formatTickNumber(N.value),
    ee = P ? Math.max(14, Math.min(Math.max(20, d * 0.72), (M?.fontSizePt ?? 28) * 0.85)) : 0,
    L = (e: any) => {
      let t = o?.dataPointStyles?.find((t: any) => t.index === e),
        n =
          typeof o?.shapeProperties?.xmlExplosion == `number` ? o.shapeProperties.xmlExplosion : 0,
        r = Math.max(0, t?.explosion ?? n ?? 0);
      return r <= 0 ? 0 : u * clampNumber(r / 100, 0, 4);
    },
    te = p.some((e: any) => L(e.data.index) > 0) ? 2 : 1.2;
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      g
        ? (0, jsxRuntime.jsxs)(`defs`, {
            children: [
              (0, jsxRuntime.jsx)(`filter`, {
                id: E,
                x: `-40%`,
                y: `-40%`,
                width: `180%`,
                height: `200%`,
                children: (0, jsxRuntime.jsx)(`feDropShadow`, {
                  dx: `1.2`,
                  dy: `3.6`,
                  floodColor: `#000000`,
                  floodOpacity: `0.28`,
                  stdDeviation: `2.8`,
                }),
              }),
              (0, jsxRuntime.jsx)(`filter`, {
                id: O,
                x: `-50%`,
                y: `-50%`,
                width: `220%`,
                height: `220%`,
                children: (0, jsxRuntime.jsx)(`feGaussianBlur`, { stdDeviation: `3.2` }),
              }),
            ],
          })
        : null,
      g
        ? (0, jsxRuntime.jsx)(`ellipse`, {
            cx: c,
            cy: l + C + 3,
            fill: `#000000`,
            filter: `url(#${O})`,
            opacity: 0.14,
            rx: u * 1.02,
            ry: u * x * 0.68,
          })
        : null,
      g
        ? p.map((e: any) => {
            let t = (e.startAngle + e.endAngle) / 2,
              n = L(e.data.index),
              r = Math.sin(t) * n,
              i = -Math.cos(t) * n * x,
              a = pie3dSidePaths(c, l, u, x, C, e.startAngle, e.endAngle, n > 0);
            return a.length === 0
              ? null
              : (0, jsxRuntime.jsxs)(
                  `g`,
                  {
                    transform: `translate(${r}, ${i})`,
                    children: [
                      a.map((t, n) =>
                        (0, jsxRuntime.jsx)(
                          `path`,
                          {
                            d: t,
                            fill: darkenHexColor(e.data.color, 0.34),
                            stroke: darkenHexColor(e.data.color, 0.5),
                            strokeWidth: 0.8,
                          },
                          `pie-side-path-${e.data.index}-${n}`,
                        ),
                      ),
                      n > 0
                        ? (() => {
                            let t = pie3dSliceWallPath(c, l, u, x, C, e.startAngle, !0),
                              n = pie3dSliceWallPath(c, l, u, x, C, e.endAngle, !0);
                            return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                              children: [
                                t
                                  ? (0, jsxRuntime.jsx)(`path`, {
                                      d: t,
                                      fill: darkenHexColor(e.data.color, 0.26),
                                      stroke: darkenHexColor(e.data.color, 0.44),
                                      strokeWidth: 0.8,
                                    })
                                  : null,
                                n
                                  ? (0, jsxRuntime.jsx)(`path`, {
                                      d: n,
                                      fill: darkenHexColor(e.data.color, 0.2),
                                      stroke: darkenHexColor(e.data.color, 0.4),
                                      strokeWidth: 0.8,
                                    })
                                  : null,
                              ],
                            });
                          })()
                        : null,
                    ],
                  },
                  `pie-side-${e.data.index}`,
                );
          })
        : null,
      p.map((t: any) => {
        let o = L(t.data.index),
          s = (t.startAngle + t.endAngle) / 2,
          f = Math.sin(s) * o,
          p = -Math.cos(s) * o * (g ? x : 1),
          h = isChartPointSelected(i, e.id, a, t.data.index) || (isChartSeriesSelected(i, e.id, a) && i?.kind !== `point`),
          _ = h
            ? [
                pieArcPoint(c, l, u, g ? x : 1, t.startAngle),
                pieArcPoint(c, l, u, g ? x : 1, s),
                pieArcPoint(c, l, u, g ? x : 1, t.endAngle),
                d > 0 ? pieArcPoint(c, l, d, g ? x : 1, s) : { x: c, y: l },
              ].map((e) => ({ x: e.x + f, y: e.y + p }))
            : [],
          v = u + (r === `PieExploded` ? 8 : 12),
          y = c + Math.sin(s) * v + f,
          b = l - Math.cos(s) * v * (g ? x : 1) + p,
          S = [];
        e.dataLabels?.showCategoryName && t.data.label.trim().length > 0 && S.push(t.data.label);
        let C = j.get(t.data.index),
          D = C?.showValue ?? e.dataLabels?.showValue,
          O = C?.showPercent ?? e.dataLabels?.showPercent;
        (D && S.push(formatTickNumber(t.data.value)),
          O && S.push(`${Math.round((t.data.value / Math.max(1, T)) * 100)}%`));
        let M = truncateLabel(S.join(`, `), Math.max(48, n.width * 0.42), 10),
          N = Math.max(12, M.length * 5.6),
          P = y >= c ? `start` : `end`,
          F = y;
        (P === `start` && F + N > A.right && (P = `end`),
          P === `end` && F - N < A.left && (P = `start`),
          (F = clampNumber(F, A.left, A.right)));
        let I = clampNumber(b, A.top, A.bottom);
        return (0, jsxRuntime.jsxs)(
          reactInterop.Fragment,
          {
            children: [
              (0, jsxRuntime.jsx)(`g`, {
                transform: `translate(${f}, ${p})`,
                children: (0, jsxRuntime.jsx)(`path`, {
                  ...chartSeriesDataAttrs(a, t.data.index),
                  d: m(t) ?? ``,
                  fill: t.data.color,
                  filter: g ? `url(#${E})` : void 0,
                  stroke: h ? `#64748b` : k,
                  strokeWidth: h ? Math.max(2, te) : te,
                  transform: `translate(${c}, ${l})${g ? ` scale(1, ${x})` : ``}`,
                }),
              }),
              h ? renderSelectionHandles(`pie-selection-${t.data.index}`, _) : null,
              w && M.length > 0
                ? (0, jsxRuntime.jsx)(`text`, {
                    fill: resolveTitleTextColor(e),
                    fontSize: 10,
                    textAnchor: P,
                    x: F,
                    y: I,
                    children: M,
                  })
                : null,
            ],
          },
          `pie-top-${t.data.index}`,
        );
      }),
      P
        ? (0, jsxRuntime.jsx)(`text`, {
            fill: e.textColor ?? e.titleColor ?? DEFAULT_CHART_TEXT_COLOR,
            fontSize: ee,
            fontWeight: 700,
            textAnchor: `middle`,
            x: c,
            y: l + ee * 0.34,
            children: I,
          })
        : null,
    ],
  });
}
function renderBarOfPieChart(e: any, t: any, n: any, r: any) {
  let i = pickPrimarySeriesIndex(e),
    a = e.series[i],
    o = resolveCategoryLabels(e),
    s = a?.values.map((e: any) => Math.max(0, toFiniteNumber(e) ?? 0)) ?? [];
  if (s.length === 0) return null;
  let c = e.raw ?? {},
    l = c.ofPieType === `pie` ? `pie` : `bar`,
    u = typeof c.splitPos == `number` ? c.splitPos : 0,
    d = s
      .map((e: any, t: any) => ({ index: t, value: e }))
      .filter(({ value: e }: any) => e <= u)
      .map(({ index: e }: any) => e);
  d.length === 0 &&
    (d = s
      .map((e: any, t: any) => ({ index: t, value: e }))
      .sort((e: any, t: any) => e.value - t.value)
      .slice(0, Math.min(2, s.length))
      .map(({ index: e }: any) => e));
  let f = new Set(d),
    p = d.reduce((e: any, t: any) => e + (s[t] ?? 0), 0),
    m = s.flatMap((t: any, n: any) =>
      f.has(n) ? [] : [{ color: resolveDataPointColor(e, n, i), index: n, label: o[n], value: t }],
    );
  p > 0 && m.push({ color: resolveDataPointColor(e, d[0] ?? 0, i), index: d[0] ?? 0, label: `Other`, value: p });
  let g = n.plot.left + n.plot.width * 0.28,
    _ = n.plot.top + n.plot.height * 0.55,
    v = Math.max(16, Math.min(n.plot.height, n.plot.width * 0.45) * 0.3),
    y = h().innerRadius(0).outerRadius(v),
    b = D()
      .value((e: any) => e.value)
      .sort(null)
      .startAngle(((90 - (e.firstSliceAngle ?? 0)) * Math.PI) / 180)
      .endAngle(((90 - (e.firstSliceAngle ?? 0)) * Math.PI) / 180 + Math.PI * 2)(m);
  (d.map((e: any) => o[e] ?? ``), d.map((e: any) => s[e] ?? 0));
  let x = n.plot.left + n.plot.width * 0.69,
    S = d.map((t: any) => ({ color: resolveDataPointColor(e, t, i), index: t, label: o[t] ?? ``, value: s[t] ?? 0 })),
    C = n.plot.left + n.plot.width * 0.79,
    w = _,
    T = v * clampNumber((typeof c.secondPieSize == `number` ? c.secondPieSize : 100) / 100, 0.55, 1.5),
    E = h().innerRadius(0).outerRadius(T),
    O = D()
      .value((e: any) => e.value)
      .sort(null)
      .startAngle(((90 - (e.firstSliceAngle ?? 0)) * Math.PI) / 180)
      .endAngle(((90 - (e.firstSliceAngle ?? 0)) * Math.PI) / 180 + Math.PI * 2)(S),
    k = n.plot.left + n.plot.width * 0.72,
    A = Math.max(20, n.plot.width * 0.13),
    j = n.plot.top + 16,
    M = Math.max(28, n.plot.height - 32),
    N = Math.max(1e-6, p),
    P = j;
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      b.map((n: any, a: any) => {
        let o = isChartElementSelected(r, e.id, i, n.data.index),
          s = (n.startAngle + n.endAngle) / 2,
          c = pieArcPoint(g, _, v * 0.62, 1, s);
        return (0, jsxRuntime.jsxs)(
          reactInterop.Fragment,
          {
            children: [
              (0, jsxRuntime.jsx)(`path`, {
                ...chartSeriesDataAttrs(i, n.data.index),
                d: y(n) ?? ``,
                fill: n.data.color,
                stroke: o ? `#64748b` : (e.chartAreaFillColor ?? t.surface),
                strokeWidth: o ? 2 : 1,
                transform: `translate(${g}, ${_})`,
              }),
              o ? renderSelectionHandles(`bar-of-pie-main-selection-${a}`, [c]) : null,
            ],
          },
          `bar-of-pie-main-${a}`,
        );
      }),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: e.chartAreaBorderColor ?? t.border,
        strokeWidth: 1,
        x1: g + v,
        x2: x,
        y1: _ - v * 0.4,
        y2: n.plot.top + 10,
      }),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: e.chartAreaBorderColor ?? t.border,
        strokeWidth: 1,
        x1: g + v,
        x2: x,
        y1: _ + v * 0.4,
        y2: n.plot.top + n.plot.height - 10,
      }),
      l === `pie`
        ? O.map((n: any, a: any) => {
            let o = isChartElementSelected(r, e.id, i, n.data.index),
              s = (n.startAngle + n.endAngle) / 2,
              c = pieArcPoint(C, w, T * 0.62, 1, s);
            return (0, jsxRuntime.jsxs)(
              reactInterop.Fragment,
              {
                children: [
                  (0, jsxRuntime.jsx)(`path`, {
                    ...chartSeriesDataAttrs(i, n.data.index),
                    d: E(n) ?? ``,
                    fill: n.data.color,
                    stroke: o ? `#64748b` : (e.chartAreaFillColor ?? t.surface),
                    strokeWidth: o ? 2 : 1,
                    transform: `translate(${C}, ${w})`,
                  }),
                  o ? renderSelectionHandles(`bar-of-pie-secondary-pie-selection-${a}`, [c]) : null,
                ],
              },
              `bar-of-pie-secondary-pie-${a}`,
            );
          })
        : S.map((n: any, a: any) => {
            let o = a === S.length - 1 ? Math.max(1, j + M - P) : Math.max(1, (n.value / N) * M),
              s = P;
            P += o;
            let c = isChartElementSelected(r, e.id, i, n.index);
            return (0, jsxRuntime.jsxs)(
              `g`,
              {
                children: [
                  (0, jsxRuntime.jsx)(`rect`, {
                    ...chartSeriesDataAttrs(i, n.index),
                    fill: n.color,
                    height: o,
                    stroke: c ? `#64748b` : (e.chartAreaFillColor ?? t.surface),
                    strokeWidth: c ? 2 : 1,
                    width: A,
                    x: k,
                    y: s,
                  }),
                  c ? renderRectSelectionHandles(`bar-of-pie-secondary-bar-selection-${a}`, k, s, A, o) : null,
                  (0, jsxRuntime.jsx)(`text`, {
                    fill: resolveAxisLabelColor(e),
                    fontSize: 10,
                    textAnchor: `start`,
                    x: k + A + 6,
                    y: s + o * 0.5 + 3,
                    children: n.label,
                  }),
                ],
              },
              `bar-of-pie-secondary-bar-${a}`,
            );
          }),
    ],
  });
}
function renderSurfaceChart(e: any, t: any, n: any, r: any) {
  let i = resolveSurfacePlotRect(e, n),
    a = resolveCategoryLabels(e),
    o = e.series.length,
    s = Math.max(
      a.length,
      e.series.reduce((e: any, t: any) => Math.max(e, t.values.length), 0),
    );
  if (o === 0 || s === 0) return null;
  let c = e.series.map((e: any) => Array.from({ length: s }, (t, n) => toFiniteNumber(e.values[n]))),
    l = computeSurfaceValueScale(e);
  if (!l) return null;
  let u = is2dSurfaceChart(e),
    d = l.minValue,
    f = l.safeMax,
    p = e.backWall?.fillColor ?? `#d9d9df`,
    m =
      e.backWall?.lineColor ??
      e.sideWall?.lineColor ??
      e.floor?.lineColor ??
      e.axisLineColor ??
      lightenHexColor(resolveSurfaceBaseColor(e, t), 0.4);
  if (u) {
    let n = l.ticks.slice(1, -1),
      r = [],
      a = new Map();
    for (let u = 0; u < o - 1; u += 1)
      for (let d = 0; d < s - 1; d += 1) {
        let f = c[u]?.[d],
          p = c[u]?.[d + 1],
          m = c[u + 1]?.[d],
          h = c[u + 1]?.[d + 1];
        if (f == null || p == null || m == null || h == null) continue;
        let g = i.left + (d / Math.max(1, s - 1)) * i.width,
          _ = i.left + ((d + 1) / Math.max(1, s - 1)) * i.width,
          v = i.top + i.height - (u / Math.max(1, o - 1)) * i.height,
          y = i.top + i.height - ((u + 1) / Math.max(1, o - 1)) * i.height,
          b = (f + p + m + h) / 4;
        if (!e.wireframe) {
          let n = (f + p + h) / 3,
            i = (f + h + m) / 3,
            a = (f + p + m) / 3,
            o = (p + h + m) / 3,
            s =
              Math.max(f, p, h) - Math.min(f, p, h) + (Math.max(f, h, m) - Math.min(f, h, m)) <=
              Math.max(f, p, m) - Math.min(f, p, m) + (Math.max(p, h, m) - Math.min(p, h, m)),
            c = s
              ? [
                  {
                    bandColor: resolveSurfaceCellColor(e, t, l, n),
                    bandIndex: surfaceBandIndexForValue(l, n),
                    points: `${g},${v} ${_},${v} ${_},${y}`,
                  },
                  {
                    bandColor: resolveSurfaceCellColor(e, t, l, i),
                    bandIndex: surfaceBandIndexForValue(l, i),
                    points: `${g},${v} ${_},${y} ${g},${y}`,
                  },
                ]
              : [
                  {
                    bandColor: resolveSurfaceCellColor(e, t, l, a),
                    bandIndex: surfaceBandIndexForValue(l, a),
                    points: `${g},${v} ${_},${v} ${g},${y}`,
                  },
                  {
                    bandColor: resolveSurfaceCellColor(e, t, l, o),
                    bandIndex: surfaceBandIndexForValue(l, o),
                    points: `${_},${v} ${_},${y} ${g},${y}`,
                  },
                ],
            x = s ? { x1: g, y1: v, x2: _, y2: y } : { x1: _, y1: v, x2: g, y2: y },
            S = c[0]?.bandIndex !== c[1]?.bandIndex;
          r.push(
            (0, jsxRuntime.jsx)(
              `g`,
              {
                children: S
                  ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                      children: [
                        (0, jsxRuntime.jsx)(`polygon`, {
                          fill: c[0]?.bandColor,
                          points: c[0]?.points,
                          stroke: `none`,
                        }),
                        (0, jsxRuntime.jsx)(`polygon`, {
                          fill: c[1]?.bandColor,
                          points: c[1]?.points,
                          stroke: `none`,
                        }),
                        (0, jsxRuntime.jsx)(`line`, {
                          stroke: darkenHexColor(resolveSurfaceBandColor(e, t, l, b), 0.22),
                          strokeWidth: 0.8,
                          x1: x.x1,
                          x2: x.x2,
                          y1: x.y1,
                          y2: x.y2,
                        }),
                      ],
                    })
                  : (0, jsxRuntime.jsx)(`rect`, {
                      fill: resolveSurfaceCellColor(e, t, l, b),
                      height: Math.abs(y - v),
                      stroke: `none`,
                      width: Math.abs(_ - g),
                      x: Math.min(g, _),
                      y: Math.min(v, y),
                    }),
              },
              `surface-contour-cell-${u}-${d}`,
            ),
          );
        }
        let x = [
            { value: f, x: g, y: v },
            { value: p, x: _, y: v },
            { value: h, x: _, y },
            { value: m, x: g, y },
          ],
          S = [
            [x[0], x[1]],
            [x[1], x[2]],
            [x[2], x[3]],
            [x[3], x[0]],
          ];
        n.forEach((e) => {
          let t: any[] = [];
          if (
            (S.forEach(([n, r]) => {
              let i = r.value - n.value;
              if (i === 0 || !((n.value < e && r.value > e) || (n.value > e && r.value < e)))
                return;
              let a = (e - n.value) / i;
              t.push({ x: n.x + (r.x - n.x) * a, y: n.y + (r.y - n.y) * a });
            }),
            t.length === 2)
          ) {
            let n = a.get(e) ?? [];
            (n.push({ end: t[1] ?? t[0] ?? { x: _, y }, start: t[0] ?? { x: g, y: v } }),
              a.set(e, n));
          } else
            t.length === 4 &&
              (b >= e
                ? [
                    [0, 1],
                    [2, 3],
                  ]
                : [
                    [0, 3],
                    [1, 2],
                  ]
              ).forEach(([n, r], i) => {
                let o = t[n] ?? t[0],
                  s = t[r] ?? t[t.length - 1];
                if (!o || !s) return;
                let c = a.get(e) ?? [];
                (c.push({ end: s, start: o }), a.set(e, c));
              });
        });
      }
    let u = Array.from(a.entries()).flatMap(([n, r], i) =>
        joinContourSegments(r).map((r, a) => {
          let o = pointsToLinePath(r, !0);
          return o
            ? (0, jsxRuntime.jsx)(
                `path`,
                {
                  d: o,
                  fill: `none`,
                  stroke: e.wireframe ? resolveSurfaceLineColor(e, t, l, n) : darkenHexColor(resolveSurfaceCellColor(e, t, l, n), 0.18),
                  strokeLinecap: `round`,
                  strokeLinejoin: `round`,
                  strokeWidth: e.wireframe ? 1.45 : 1.2,
                },
                `surface-contour-line-${i}-${a}`,
              )
            : null;
        }),
      ),
      d = Array.from({ length: s }, (e, t) => {
        let n = Array.from({ length: o }, (e, n) => c[n]?.[t]).filter((e) => e != null);
        return n.length === 0 ? l.minValue : n.reduce((e, t) => e + t, 0) / n.length;
      }),
      f = Array.from({ length: o }, (e, t) => {
        let n = c[t]?.filter((e: any) => e != null) ?? [];
        return n.length === 0 ? l.minValue : n.reduce((e: any, t: any) => e + t, 0) / n.length;
      });
    return (0, jsxRuntime.jsxs)(`g`, {
      children: [
        (0, jsxRuntime.jsx)(`rect`, {
          fill: p,
          height: i.height,
          stroke: lightenHexColor(m, 0.14),
          strokeWidth: 0.8,
          width: i.width,
          x: i.left,
          y: i.top,
        }),
        Array.from({ length: s }, (n, r) => {
          let a = i.left + (s <= 1 ? i.width / 2 : (r / (s - 1)) * i.width);
          return (0, jsxRuntime.jsx)(
            `line`,
            {
              stroke: e.wireframe ? resolveSurfaceLineColor(e, t, l, d[r] ?? l.minValue) : lightenHexColor(m, 0.18),
              strokeLinecap: `round`,
              strokeLinejoin: `round`,
              strokeWidth: e.wireframe ? 1.15 : 0.8,
              x1: a,
              x2: a,
              y1: i.top,
              y2: i.top + i.height,
            },
            `surface-contour-grid-col-${r}`,
          );
        }),
        Array.from({ length: o }, (n, r) => {
          let a = i.top + i.height - (o <= 1 ? i.height / 2 : (r / (o - 1)) * i.height),
            s = e.series[r]?.lineColor ?? e.series[r]?.color ?? resolveSurfaceLineColor(e, t, l, f[r] ?? l.minValue);
          return (0, jsxRuntime.jsx)(
            `line`,
            {
              stroke: e.wireframe ? s : lightenHexColor(m, 0.18),
              strokeLinecap: `round`,
              strokeLinejoin: `round`,
              strokeWidth: e.wireframe ? 1.15 : 0.8,
              x1: i.left,
              x2: i.left + i.width,
              y1: a,
              y2: a,
            },
            `surface-contour-grid-row-${r}`,
          );
        }),
        r,
        u,
        e.wireframe
          ? null
          : (0, jsxRuntime.jsx)(`rect`, {
              fill: `none`,
              height: i.height,
              stroke: lightenHexColor(m, 0.1),
              strokeWidth: 0.8,
              width: i.width,
              x: i.left,
              y: i.top,
            }),
      ],
    });
  }
  let h = clampNumber(e.view3d?.rotX ?? (e.wireframe ? 90 : 25), -88, 88) * (Math.PI / 180),
    g = clampNumber(e.view3d?.rotY ?? (e.wireframe ? 0 : 30), -88, 88) * (Math.PI / 180),
    _ = e.view3d?.rAngAx === !1,
    v = clampNumber((e.view3d?.perspective ?? (_ ? 30 : 0)) / 100, 0, 1),
    y = clampNumber((e.view3d?.depthPercent ?? 100) / 100, 0.2, 4),
    b = Math.cos(h),
    x = Math.sin(h),
    S = Math.cos(g),
    C = Math.sin(g),
    w = Array.from({ length: o }, (e, t) =>
      Array.from({ length: s }, (e, n) => {
        let r = c[t][n],
          i = r != null,
          a = s <= 1 ? 0 : (n / (s - 1) - 0.5) * 2,
          l = i ? -(((r - d) / (f - d) - 0.5) * 1.8) * y : 0.9 * y,
          u = o <= 1 ? 0 : (t / (o - 1) - 0.5) * 2,
          p = a * S + u * C,
          m = -a * C + u * S,
          h = l * b - m * x,
          g = l * x + m * b,
          w = _ ? 1 / Math.max(0.18, 1 + g * (0.24 + v * 0.5)) : 1;
        return { depth: g, hasValue: i, value: r ?? d, x: p * w, y: h * w };
      }),
    ),
    T = w.flat(),
    E = Math.min(...T.map((e) => e.x)),
    D = Math.max(...T.map((e) => e.x)),
    O = Math.min(...T.map((e) => e.y)),
    k = Math.max(...T.map((e) => e.y)),
    A =
      Math.min(n.plot.width / Math.max(0.25, D - E), n.plot.height / Math.max(0.25, k - O)) * 0.82,
    j = n.plot.left + n.plot.width / 2,
    M = n.plot.top + n.plot.height / 2,
    N = (E + D) / 2,
    P = (O + k) / 2,
    F = w.map((e) => e.map((e) => ({ ...e, x: j + (e.x - N) * A, y: M + (e.y - P) * A }))),
    I = resolveSurfaceBaseColor(e, t),
    ee = e.axisLineColor ?? lightenHexColor(I, 0.4),
    L = [];
  for (let n = 0; n < o - 1; n += 1)
    for (let r = 0; r < s - 1; r += 1) {
      let i = F[n][r],
        a = F[n][r + 1],
        o = F[n + 1][r + 1],
        s = F[n + 1][r];
      if (!i.hasValue || !a.hasValue || !o.hasValue || !s.hasValue) continue;
      let c = clampNumber(((i.value + a.value + o.value + s.value) / 4 - d) / (f - d), 0, 1);
      L.push({
        color: sampleSurfaceRampColor(e, t, c),
        depth: (i.depth + a.depth + o.depth + s.depth) / 4,
        key: `surface-quad-${n}-${r}`,
        points: `${i.x},${i.y} ${a.x},${a.y} ${o.x},${o.y} ${s.x},${s.y}`,
        stroke: lightenHexColor(I, 0.18),
      });
    }
  L.sort((e, t) => e.depth - t.depth);
  let te = u
      ? []
      : (() => {
          let n = new Map(),
            r = l.ticks.slice(1, -1);
          for (let e = 0; e < o - 1; e += 1)
            for (let t = 0; t < s - 1; t += 1) {
              let i = F[e][t],
                a = F[e][t + 1],
                o = F[e + 1][t + 1],
                s = F[e + 1][t];
              if (!i.hasValue || !a.hasValue || !o.hasValue || !s.hasValue) continue;
              let c = [
                  { point: i, value: i.value },
                  { point: a, value: a.value },
                  { point: o, value: o.value },
                  { point: s, value: s.value },
                ],
                l = [
                  [c[0], c[1]],
                  [c[1], c[2]],
                  [c[2], c[3]],
                  [c[3], c[0]],
                ];
              r.forEach((e) => {
                let t: any[] = [];
                if (
                  (l.forEach(([n, r]) => {
                    let i = r.value - n.value;
                    if (i === 0 || !((n.value < e && r.value > e) || (n.value > e && r.value < e)))
                      return;
                    let a = (e - n.value) / i;
                    t.push({
                      x: n.point.x + (r.point.x - n.point.x) * a,
                      y: n.point.y + (r.point.y - n.point.y) * a,
                    });
                  }),
                  t.length === 2)
                ) {
                  let r = n.get(e) ?? [];
                  (r.push({
                    end: t[1] ?? t[0] ?? { x: a.x, y: a.y },
                    start: t[0] ?? { x: i.x, y: i.y },
                  }),
                    n.set(e, r));
                } else
                  t.length === 4 &&
                    ((i.value + a.value + o.value + s.value) / 4 >= e
                      ? [
                          [0, 1],
                          [2, 3],
                        ]
                      : [
                          [0, 3],
                          [1, 2],
                        ]
                    ).forEach(([r, i]) => {
                      let a = t[r] ?? t[0],
                        o = t[i] ?? t[t.length - 1];
                      if (!a || !o) return;
                      let s = n.get(e) ?? [];
                      (s.push({ end: o, start: a }), n.set(e, s));
                    });
              });
            }
          return Array.from(n.entries()).flatMap(([n, r], i) =>
            joinContourSegments(r).map((r, a) => {
              let o = pointsToLinePath(r, !0);
              return o
                ? (0, jsxRuntime.jsx)(
                    `path`,
                    {
                      d: o,
                      fill: `none`,
                      stroke: darkenHexColor(resolveSurfaceBandColor(e, t, l, n), 0.26),
                      strokeLinecap: `round`,
                      strokeLinejoin: `round`,
                      strokeWidth: 1.55,
                    },
                    `surface-level-line-${i}-${a}`,
                  )
                : null;
            }),
          );
        })(),
    ne = (t: any, n: any, r: any, i: any) =>
      splitDefinedPointRuns(t).map((t, a) => {
        let o = pointsToLinePath(t, e.wireframe === !0);
        return o
          ? (0, jsxRuntime.jsx)(
              `path`,
              {
                d: o,
                fill: `none`,
                stroke: r,
                strokeLinecap: `round`,
                strokeLinejoin: `round`,
                strokeWidth: i,
              },
              `${n}-${a}`,
            )
          : null;
      });
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      u
        ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
            children: [
              (0, jsxRuntime.jsx)(`rect`, {
                fill: p,
                height: n.plot.height,
                stroke: lightenHexColor(ee, 0.18),
                strokeWidth: 0.8,
                width: n.plot.width,
                x: n.plot.left,
                y: n.plot.top,
              }),
              Array.from({ length: s }, (e, t) => {
                let r = n.plot.left + (s <= 1 ? n.plot.width / 2 : (t / (s - 1)) * n.plot.width);
                return (0, jsxRuntime.jsx)(
                  `line`,
                  {
                    stroke: lightenHexColor(m, 0.12),
                    strokeWidth: 0.8,
                    x1: r,
                    x2: r,
                    y1: n.plot.top,
                    y2: n.plot.top + n.plot.height,
                  },
                  `surface-fallback-column-grid-${t}`,
                );
              }),
              Array.from({ length: o }, (e, t) => {
                let r =
                  n.plot.top +
                  n.plot.height -
                  (o <= 1 ? n.plot.height / 2 : (t / (o - 1)) * n.plot.height);
                return (0, jsxRuntime.jsx)(
                  `line`,
                  {
                    stroke: lightenHexColor(m, 0.12),
                    strokeWidth: 0.8,
                    x1: n.plot.left,
                    x2: n.plot.left + n.plot.width,
                    y1: r,
                    y2: r,
                  },
                  `surface-fallback-row-grid-${t}`,
                );
              }),
            ],
          })
        : null,
      e.wireframe
        ? null
        : L.map((e) =>
            (0, jsxRuntime.jsx)(
              `polygon`,
              {
                fill: e.color,
                fillOpacity: 0.95,
                points: e.points,
                stroke: e.stroke,
                strokeWidth: 0.7,
              },
              e.key,
            ),
          ),
      Array.from({ length: o }, (n, r) => {
        let i = F[r],
          a =
            c[r]
              ?.filter((e: any) => e != null)
              .reduce((e: any, t: any, n: any, r: any) => e + t / Math.max(1, r.length), 0) ?? l.minValue,
          o = e.wireframe
            ? (e.series[r]?.lineColor ?? e.series[r]?.color ?? resolveSurfaceLineColor(e, t, l, a))
            : darkenHexColor(resolveSurfaceCellColor(e, t, l, a), 0.1);
        return (0, jsxRuntime.jsx)(
          `g`,
          {
            children: ne(
              i,
              `surface-row-${r}`,
              o,
              e.wireframe ? Math.max(1.45, e.series[r]?.lineWidthPx ?? 1.8) : 0.8,
            ),
          },
          `surface-row-${r}`,
        );
      }),
      Array.from({ length: s }, (n, r) => {
        let i = Array.from({ length: o }, (e, t) => F[t][r]),
          a = Array.from({ length: o }, (e, t) => c[t]?.[r]).filter((e) => e != null),
          s = a.length > 0 ? a.reduce((e, t) => e + t, 0) / a.length : l.minValue,
          u = e.wireframe ? resolveSurfaceLineColor(e, t, l, s) : darkenHexColor(resolveSurfaceCellColor(e, t, l, s), 0.1);
        return (0, jsxRuntime.jsx)(
          `g`,
          { children: ne(i, `surface-column-${r}`, u, e.wireframe ? 1.35 : 0.8) },
          `surface-column-${r}`,
        );
      }),
      te,
      e.wireframe
        ? (0, jsxRuntime.jsx)(`rect`, {
            fill: `none`,
            height: n.plot.height,
            stroke: lightenHexColor(ee, 0.18),
            strokeWidth: 0.8,
            width: n.plot.width,
            x: n.plot.left,
            y: n.plot.top,
          })
        : null,
    ],
  });
}
function renderSurfaceHitAreas(e: any, t: any, n: any) {
  let r = resolveSurfacePlotRect(e, t),
    i = resolveCategoryLabels(e),
    a = e.series.length,
    o = Math.max(
      i.length,
      e.series.reduce((e: any, t: any) => Math.max(e, t.values.length), 0),
    );
  if (a === 0 || o === 0) return null;
  let s = r.width / o,
    c = r.height / a;
  return (0, jsxRuntime.jsx)(`g`, {
    children: e.series.flatMap((t: any, i: any) =>
      Array.from({ length: o }, (t, a) => {
        let o = r.left + a * s,
          l = r.top + i * c,
          u = isChartElementSelected(n, e.id, i, a);
        return (0, jsxRuntime.jsxs)(
          reactInterop.Fragment,
          {
            children: [
              (0, jsxRuntime.jsx)(`rect`, {
                ...chartSeriesDataAttrs(i, a),
                fill: `transparent`,
                height: c,
                stroke: `none`,
                width: s,
                x: o,
                y: l,
              }),
              u ? renderRectSelectionHandles(`surface-selection-${i}-${a}`, o, l, s, c) : null,
            ],
          },
          `surface-hit-${i}-${a}`,
        );
      }),
    ),
  });
}
function findSeriesByNamePattern(e: any, t: any) {
  let n = e.findIndex((e: any) => t.test((e.name ?? ``).toLowerCase()));
  return n >= 0 ? n : null;
}
function renderStockChart(e: any, t: any, n: any, r: any) {
  let i = resolveCategoryLabels(e);
  if (i.length === 0 || e.series.length < 2) return null;
  let a = resolveStockSeriesRoles(e),
    o = a.high ?? 0,
    s = a.low ?? Math.min(1, e.series.length - 1),
    l = a.close ?? Math.min(2, e.series.length - 1),
    d = a.open,
    f = a.volume != null && ![o, s, l, d].includes(a.volume) ? a.volume : null,
    p = e.series[o],
    m = e.series[s],
    h = e.series[l],
    g = d == null ? null : e.series[d],
    _ = f == null ? null : e.series[f],
    v = i
      .map((e, t) => {
        let n = toFiniteNumber(p.values[t]),
          r = toFiniteNumber(m.values[t]),
          i = toFiniteNumber(h.values[t]),
          a = g ? toFiniteNumber(g.values[t]) : null,
          o = _ ? toFiniteNumber(_.values[t]) : null;
        return n == null || r == null || i == null
          ? null
          : { category: e, close: i, high: n, low: r, open: a, volume: o };
      })
      .filter((e) => e != null);
  if (v.length === 0) return null;
  let y = n.plot,
    b = _ != null && v.some((e) => (e.volume ?? 0) > 0),
    x = e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    S = resolveStockPalette(e, x),
    C = b
      ? Math.min(0, ...v.flatMap((e) => [e.low, e.close, e.open ?? e.close, e.volume ?? 0]))
      : Math.min(...v.map((e) => e.low)),
    w = Math.max(
      ...(b
        ? v.flatMap((e) => [e.high, e.close, e.open ?? e.close, e.volume ?? 0])
        : v.map((e) => e.high)),
    ),
    T = buildValueScale(
      typeof e.valueAxis?.min == `number` && Number.isFinite(e.valueAxis.min) ? e.valueAxis.min : C,
      typeof e.valueAxis?.max == `number` && Number.isFinite(e.valueAxis.max) ? e.valueAxis.max : w,
      e.valueAxis?.majorUnit,
      b,
    ),
    E = c()
      .domain([T.min, T.max])
      .range([y.top + y.height, y.top]),
    D = u()
      .domain(i)
      .range([y.left, y.left + y.width])
      .paddingInner(0.28)
      .paddingOuter(0.18),
    O = T.ticks,
    k = resolveAxisLabelColor(e),
    A = S.openAccent,
    j = d == null ? S.closeAccent : S.lineColor,
    M = Math.max(1, Math.ceil(i.length / Math.max(4, Math.floor(y.width / 68)))),
    N = E(Math.max(T.min, 0));
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      O.map((e) =>
        (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              (0, jsxRuntime.jsx)(`line`, {
                stroke: lightenHexColor(x, 0.72),
                strokeWidth: 1,
                x1: y.left,
                x2: y.left + y.width,
                y1: E(e),
                y2: E(e),
              }),
              (0, jsxRuntime.jsx)(`text`, {
                fill: k,
                fontSize: 10,
                textAnchor: `end`,
                x: y.left - 6,
                y: E(e) + 3,
                children: formatTickNumber(e),
              }),
            ],
          },
          `stock-tick-${e}`,
        ),
      ),
      i.map((e, t) =>
        t % M !== 0 && t !== i.length - 1
          ? null
          : (0, jsxRuntime.jsx)(
              `text`,
              {
                fill: k,
                fontSize: 10,
                textAnchor: `middle`,
                x: (D(e) ?? y.left) + D.bandwidth() * 0.5,
                y: y.top + y.height + 14,
                children: e,
              },
              `stock-cat-${e}`,
            ),
      ),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: x,
        strokeWidth: 1.2,
        x1: y.left,
        x2: y.left,
        y1: y.top,
        y2: y.top + y.height,
      }),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: x,
        strokeWidth: 1.2,
        x1: y.left,
        x2: y.left + y.width,
        y1: y.top + y.height,
        y2: y.top + y.height,
      }),
      v.map((t, n) => {
        let i = (D(t.category) ?? y.left) + D.bandwidth() * 0.5,
          a = n > 0 ? (v[n - 1]?.close ?? t.close) : t.close,
          o = t.open == null ? t.close >= a : t.close >= t.open,
          s = S.lineColor,
          c = Math.max(5, D.bandwidth() * 0.56),
          u = i - c / 2,
          d = t.open == null ? null : E(t.open),
          f = E(t.close),
          p = E(t.high),
          m = E(t.low),
          h = isChartElementSelected(r, e.id, l, n);
        return (0, reactInterop.createElement)(
          `g`,
          { ...chartSeriesDataAttrs(l, n), key: `stock-point-${n}` },
          b && t.volume != null
            ? (0, jsxRuntime.jsx)(`rect`, {
                fill: S.volumeFill,
                height: Math.max(1, N - E(t.volume)),
                opacity: 0.94,
                stroke: `none`,
                width: Math.max(3, D.bandwidth() * 0.64),
                x: i - Math.max(3, D.bandwidth() * 0.64) / 2,
                y: E(t.volume),
              })
            : null,
          (0, jsxRuntime.jsx)(`line`, { stroke: s, strokeWidth: 1.6, x1: i, x2: i, y1: p, y2: m }),
          t.open != null && d != null
            ? Math.abs(d - f) >= 1
              ? (0, jsxRuntime.jsx)(`rect`, {
                  fill: o ? S.upFill : S.downFill,
                  height: Math.max(1.4, Math.abs(f - d)),
                  stroke: s,
                  strokeWidth: 1.3,
                  width: c,
                  x: u,
                  y: Math.min(d, f),
                })
              : (0, jsxRuntime.jsx)(`line`, { stroke: s, strokeWidth: 1.6, x1: u, x2: u + c, y1: f, y2: f })
            : (0, jsxRuntime.jsx)(`line`, { stroke: j, strokeWidth: 1.8, x1: i, x2: i + 7, y1: f, y2: f }),
          t.open != null && d != null
            ? (0, jsxRuntime.jsx)(`line`, { stroke: A, strokeWidth: 1.8, x1: i - 7, x2: i, y1: d, y2: d })
            : null,
          h ? renderSelectionHandles(`stock-selection-${n}`, [{ x: i, y: f }]) : null,
        );
      }),
    ],
  });
}
function renderWaterfallChart(e: any, t: any, n: any, r: any) {
  let i = collectStackedTotals(e);
  if (i.length === 0) return null;
  let a = n.plot,
    o = i.map((e: any) => e.label),
    s = u()
      .domain(o)
      .range([a.left, a.left + a.width])
      .paddingInner(0.34)
      .paddingOuter(0.18),
    l: any[] = [],
    d = 0;
  i.forEach((e: any, t: any) => {
    let n = e.isSubtotal ? 0 : d,
      r = e.isSubtotal ? d : d + e.value;
    (e.isSubtotal || (d = r), l.push({ ...e, end: r, index: t, start: n }));
  });
  let f = l.flatMap((e) => [0, e.start, e.end]),
    p = Math.min(...f),
    m = Math.max(...f);
  m <= p && (m = p + 1);
  let h = c()
      .domain([p, m])
      .range([a.top + a.height, a.top]),
    g = buildTicks(p, m, e.valueAxis?.majorUnit),
    _ = e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    v = resolveAxisLabelColor(e);
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      g.map((e) =>
        (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              (0, jsxRuntime.jsx)(`line`, {
                stroke: lightenHexColor(_, 0.72),
                strokeWidth: 1,
                x1: a.left,
                x2: a.left + a.width,
                y1: h(e),
                y2: h(e),
              }),
              (0, jsxRuntime.jsx)(`text`, {
                fill: v,
                fontSize: 10,
                textAnchor: `end`,
                x: a.left - 6,
                y: h(e) + 3,
                children: formatTickNumber(e),
              }),
            ],
          },
          `waterfall-y-${e}`,
        ),
      ),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: _,
        strokeWidth: 1.2,
        x1: a.left,
        x2: a.left,
        y1: a.top,
        y2: a.top + a.height,
      }),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: _,
        strokeWidth: 1.2,
        x1: a.left,
        x2: a.left + a.width,
        y1: h(0),
        y2: h(0),
      }),
      l.map((t, n) => {
        let i = s(t.label) ?? a.left,
          o = s.bandwidth(),
          c = Math.max(t.start, t.end),
          u = Math.min(t.start, t.end),
          d = h(c),
          f = Math.max(1, h(u) - d),
          p = t.isSubtotal ? darkenHexColor(t.color, 0.18) : t.value >= 0 ? t.color : lightenHexColor(t.color, 0.22),
          m = n > 0 ? l[n - 1] : null,
          g = m ? h(m.end) : 0,
          y = isChartElementSelected(r, e.id, 0, n);
        return (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              m
                ? (0, jsxRuntime.jsx)(`line`, {
                    stroke: lightenHexColor(_, 0.35),
                    strokeDasharray: `3 3`,
                    strokeWidth: 1,
                    x1: (s(m.label) ?? a.left) + s.bandwidth(),
                    x2: i,
                    y1: g,
                    y2: g,
                  })
                : null,
              (0, jsxRuntime.jsx)(`rect`, {
                ...chartSeriesDataAttrs(0, n),
                fill: p,
                rx: 2,
                ry: 2,
                stroke: y ? `#64748b` : darkenHexColor(p, 0.22),
                strokeWidth: y ? 2 : 1,
                x: i,
                y: d,
                width: o,
                height: f,
              }),
              y ? renderRectSelectionHandles(`waterfall-selection-${n}`, i, d, o, f) : null,
              (0, jsxRuntime.jsx)(`text`, {
                fill: v,
                fontSize: 10,
                textAnchor: `middle`,
                x: i + o * 0.5,
                y: a.top + a.height + 14,
                children: t.label,
              }),
              (0, jsxRuntime.jsx)(`text`, {
                fill: v,
                fontSize: 10,
                textAnchor: `middle`,
                x: i + o * 0.5,
                y: d - 6,
                children: formatTickNumber(t.end),
              }),
            ],
          },
          `waterfall-bar-${n}`,
        );
      }),
    ],
  });
}
function renderFunnelChart(e: any, t: any, n: any, r: any) {
  let i = collectStackedTotals(e)
    .map((e: any) => ({ ...e, value: Math.max(0, e.value) }))
    .filter((e: any) => e.value > 0);
  if (i.length === 0) return null;
  let a = n.plot,
    o = Math.max(...i.map((e: any) => e.value)),
    s = a.height / i.length,
    c = a.left + a.width * 0.5,
    l = resolveTitleTextColor(e);
  return (0, jsxRuntime.jsx)(`g`, {
    children: i.map((t: any, n: any) => {
      let i = (t.value / o) * a.width,
        u = a.top + n * s,
        d = Math.max(6, s - 2),
        f = c - i * 0.5,
        p = t.isSubtotal ? darkenHexColor(t.color, 0.14) : t.color,
        m = i > 90,
        h = isChartElementSelected(r, e.id, 0, n);
      return (0, jsxRuntime.jsxs)(
        `g`,
        {
          children: [
            (0, jsxRuntime.jsx)(`rect`, {
              ...chartSeriesDataAttrs(0, n),
              fill: p,
              height: d,
              rx: 0,
              ry: 0,
              stroke: h ? `#64748b` : darkenHexColor(p, 0.2),
              strokeWidth: h ? 2 : 1,
              width: i,
              x: f,
              y: u,
            }),
            h ? renderRectSelectionHandles(`funnel-selection-${n}`, f, u, i, d) : null,
            (0, jsxRuntime.jsx)(`text`, {
              fill: l,
              fontSize: 10,
              textAnchor: m ? `middle` : `start`,
              x: m ? c : c + i * 0.5 + 8,
              y: u + s * 0.5,
              children: `${t.label} ${formatTickNumber(t.value)}`,
            }),
          ],
        },
        `funnel-stage-${n}`,
      );
    }),
  });
}
function renderSunburstChart(e: any, t: any, n: any, r: any) {
  let i = buildHierarchyTree(e);
  if (!i) return null;
  let a = d(i)
      .sum((e: any) => (e.children && e.children.length > 0 ? 0 : Math.max(1e-4, e.value ?? 0)))
      .sort((e: any, t: any) => (t.value ?? 0) - (e.value ?? 0)),
    o = kn().size([Math.PI * 2, a.height + 1])(a),
    s = n.plot,
    c = Math.max(24, Math.min(s.width, s.height) * 0.5),
    l = c * 0.16,
    u = s.left + s.width * 0.5,
    f = s.top + s.height * 0.5,
    p = Math.max(1, o.height || 1),
    m = h()
      .startAngle((e: any) => e.x0)
      .endAngle((e: any) => e.x1)
      .padAngle(0.005)
      .padRadius(c)
      .innerRadius((e: any) => l + ((e.y0 - 1) / p) * (c - l))
      .outerRadius((e: any) => l + ((e.y1 - 1) / p) * (c - l) - 1);
  return (0, jsxRuntime.jsxs)(`g`, {
    transform: `translate(${u}, ${f})`,
    children: [
      o
        .descendants()
        .filter((e: any) => e.depth > 0)
        .map((n: any, i: any) => {
          let a = m(n);
          if (!a) return null;
          let o = (n.x0 + n.x1) * 0.5 - Math.PI * 0.5,
            s = l + (((n.y0 + n.y1) * 0.5 - 1) / p) * (c - l),
            u = Math.cos(o) * s,
            d = Math.sin(o) * s,
            f = (n.x1 - n.x0) * s > 26,
            h = resolveSunburstFillColor(e, n),
            g = isChartElementSelected(r, e.id, 0, i);
          return (0, jsxRuntime.jsxs)(
            `g`,
            {
              children: [
                (0, jsxRuntime.jsx)(`path`, {
                  ...chartSeriesDataAttrs(0, i),
                  d: a,
                  fill: h,
                  stroke: g ? `#64748b` : t.surface,
                  strokeWidth: g ? 2 : 1,
                }),
                g ? renderSelectionHandles(`sunburst-selection-${i}`, [{ x: u, y: d }]) : null,
                f
                  ? (0, jsxRuntime.jsx)(`text`, {
                      fill: darkenHexColor(h, 0.65),
                      fontSize: 9,
                      textAnchor: `middle`,
                      transform: `translate(${u}, ${d}) rotate(${(o * 180) / Math.PI})`,
                      children: n.data.name,
                    })
                  : null,
              ],
            },
            `sunburst-node-${i}`,
          );
        }),
      (0, jsxRuntime.jsx)(`circle`, { fill: e.chartAreaFillColor ?? t.surface, r: l - 2 }),
    ],
  });
}
function renderTreemapChart(e: any, t: any, n: any, r: any) {
  let i = buildHierarchyTree(e);
  if (!i) return null;
  let a = d(i)
      .sum((e: any) => (e.children && e.children.length > 0 ? 0 : Math.max(1e-4, e.value ?? 0)))
      .sort((e: any, t: any) => (t.value ?? 0) - (e.value ?? 0)),
    o = m().size([n.plot.width, n.plot.height]).paddingInner(2).paddingOuter(1).round(!0).tile(tileHierarchyNode)(
      a,
    );
  return (0, jsxRuntime.jsx)(`g`, {
    transform: `translate(${n.plot.left}, ${n.plot.top})`,
    children: o.leaves().map((n: any, i: any) => {
      let a = resolveTreemapFillColor(e, n),
        o = Math.max(0, n.x1 - n.x0),
        s = Math.max(0, n.y1 - n.y0),
        c = o > 48 && s > 22,
        l = isChartElementSelected(r, e.id, 0, i);
      return (0, jsxRuntime.jsxs)(
        `g`,
        {
          children: [
            (0, jsxRuntime.jsx)(`rect`, {
              ...chartSeriesDataAttrs(0, i),
              fill: a,
              rx: 3,
              ry: 3,
              stroke: l ? `#64748b` : t.surface,
              strokeWidth: l ? 2 : 1,
              x: n.x0,
              y: n.y0,
              width: o,
              height: s,
            }),
            l ? renderRectSelectionHandles(`treemap-selection-${i}`, n.x0, n.y0, o, s) : null,
            c
              ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                  children: [
                    (0, jsxRuntime.jsx)(`text`, {
                      fill: darkenHexColor(a, 0.68),
                      fontSize: 10,
                      fontWeight: 600,
                      x: n.x0 + 8,
                      y: n.y0 + 14,
                      children: n.data.name,
                    }),
                    (0, jsxRuntime.jsx)(`text`, {
                      fill: darkenHexColor(a, 0.54),
                      fontSize: 9,
                      x: n.x0 + 8,
                      y: n.y0 + 28,
                      children: formatTickNumber(n.value ?? 0),
                    }),
                  ],
                })
              : null,
          ],
        },
        `treemap-leaf-${i}`,
      );
    }),
  });
}
function renderBoxWhiskerChart(e: any, t: any, n: any, r: any) {
  let i = e.series.filter((e: any) => e.hidden !== !0);
  if (i.length === 0) return null;
  let a = i
    .map((t: any, n: any) => ({
      color: t.color ?? resolveSeriesFillColor(e, typeof t.formatIdx == `number` ? t.formatIdx : n),
      label: toCleanLabel(t.name) || `Series ${n + 1}`,
      lineColor: t.lineColor ?? t.color ?? resolveSeriesFillColor(e, typeof t.formatIdx == `number` ? t.formatIdx : n),
      series: t,
      stats: computeBoxWhiskerStats(t),
      visibility: resolveBoxWhiskerVisibility(t),
    }))
    .filter((e: any) => e.stats != null);
  if (a.length === 0) return null;
  let o = a.flatMap((e: any) => [
      e.stats.min,
      e.stats.lowerWhisker,
      e.stats.q1,
      e.stats.median,
      e.stats.q3,
      e.stats.upperWhisker,
      e.stats.max,
    ]),
    s = Math.min(...o),
    u = Math.max(...o),
    d = resolveAxisScale(e.valueAxis, s, u, !1),
    f = c()
      .domain([d.min, d.max])
      .range([n.plot.top + n.plot.height, n.plot.top]),
    p = l()
      .domain(a.map((e: any, t: any) => t))
      .range([n.plot.left + 24, n.plot.left + n.plot.width - 24]),
    m = clampNumber(
      (a.length > 1 ? Math.abs((p(1) ?? 0) - (p(0) ?? 0)) : n.plot.width * 0.5) * 0.34,
      20,
      54,
    ),
    h = Math.max(8, m * 0.52),
    g = e.axisLineColor ?? e.chartAreaBorderColor ?? t.border,
    _ = resolveAxisLabelColor(e),
    v = a
      .filter((e: any) => e.visibility.meanLine)
      .map((e: any, t: any) => `${p(t) ?? n.plot.left},${f(e.stats.mean)}`);
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      d.ticks.map((e, t) => {
        let r = f(e);
        return (0, jsxRuntime.jsxs)(
          `g`,
          {
            children: [
              (0, jsxRuntime.jsx)(`line`, {
                stroke: lightenHexColor(g, 0.22),
                strokeWidth: 0.8,
                x1: n.plot.left,
                x2: n.plot.left + n.plot.width,
                y1: r,
                y2: r,
              }),
              (0, jsxRuntime.jsx)(`text`, {
                fill: _,
                fontSize: 10,
                textAnchor: `end`,
                x: n.plot.left - 6,
                y: r + 3,
                children: formatTickNumber(e),
              }),
            ],
          },
          `box-whisker-grid-${t}`,
        );
      }),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: g,
        strokeWidth: 1,
        x1: n.plot.left,
        x2: n.plot.left,
        y1: n.plot.top,
        y2: n.plot.top + n.plot.height,
      }),
      (0, jsxRuntime.jsx)(`line`, {
        stroke: g,
        strokeWidth: 1,
        x1: n.plot.left,
        x2: n.plot.left + n.plot.width,
        y1: n.plot.top + n.plot.height,
        y2: n.plot.top + n.plot.height,
      }),
      v.length >= 2
        ? (0, jsxRuntime.jsx)(`polyline`, {
            fill: `none`,
            points: v.join(` `),
            stroke: darkenHexColor(g, 0.2),
            strokeDasharray: `4 3`,
            strokeWidth: 1,
          })
        : null,
      a.map((t: any, i: any) => {
        let a = p(i) ?? n.plot.left,
          o = f(t.stats.q3),
          s = f(t.stats.q1),
          c = f(t.stats.median),
          l = f(t.stats.lowerWhisker),
          u = f(t.stats.upperWhisker),
          d = f(t.stats.mean),
          g = t.visibility.nonoutliers ? t.stats.visiblePoints : [],
          v = t.visibility.outliers ? t.stats.outliers : [],
          y = isChartElementSelected(r, e.id, i, i);
        return (0, reactInterop.createElement)(
          `g`,
          { ...chartSeriesDataAttrs(i), key: `box-whisker-series-${i}` },
          (0, jsxRuntime.jsx)(`line`, { stroke: t.lineColor, strokeWidth: 1.5, x1: a, x2: a, y1: u, y2: o }),
          (0, jsxRuntime.jsx)(`line`, { stroke: t.lineColor, strokeWidth: 1.5, x1: a, x2: a, y1: s, y2: l }),
          (0, jsxRuntime.jsx)(`line`, {
            stroke: t.lineColor,
            strokeWidth: 1.5,
            x1: a - h * 0.5,
            x2: a + h * 0.5,
            y1: u,
            y2: u,
          }),
          (0, jsxRuntime.jsx)(`line`, {
            stroke: t.lineColor,
            strokeWidth: 1.5,
            x1: a - h * 0.5,
            x2: a + h * 0.5,
            y1: l,
            y2: l,
          }),
          (0, jsxRuntime.jsx)(`rect`, {
            ...chartSeriesDataAttrs(i, i),
            fill: lightenHexColor(t.color, 0.35),
            fillOpacity: 0.72,
            height: Math.max(1, s - o),
            stroke: y ? `#64748b` : t.lineColor,
            strokeWidth: y ? 2 : 1.5,
            width: m,
            x: a - m * 0.5,
            y: o,
          }),
          y ? renderRectSelectionHandles(`box-whisker-selection-${i}`, a - m * 0.5, o, m, Math.max(1, s - o)) : null,
          (0, jsxRuntime.jsx)(`line`, {
            stroke: darkenHexColor(t.lineColor, 0.15),
            strokeWidth: 2,
            x1: a - m * 0.5,
            x2: a + m * 0.5,
            y1: c,
            y2: c,
          }),
          t.visibility.meanMarker
            ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                children: [
                  (0, jsxRuntime.jsx)(`line`, {
                    stroke: darkenHexColor(t.lineColor, 0.18),
                    strokeWidth: 1.2,
                    x1: a - 4,
                    x2: a + 4,
                    y1: d - 4,
                    y2: d + 4,
                  }),
                  (0, jsxRuntime.jsx)(`line`, {
                    stroke: darkenHexColor(t.lineColor, 0.18),
                    strokeWidth: 1.2,
                    x1: a - 4,
                    x2: a + 4,
                    y1: d + 4,
                    y2: d - 4,
                  }),
                ],
              })
            : null,
          g.map((e: any, n: any) => {
            let r = f(e),
              o = ((n % 7) - 3) * (m / 16);
            return (0, reactInterop.createElement)(`circle`, {
              ...chartSeriesDataAttrs(i, n),
              key: `box-whisker-visible-${i}-${n}`,
              cx: a + o,
              cy: r,
              fill: t.color,
              fillOpacity: 0.45,
              r: 2,
              stroke: `none`,
            });
          }),
          v.map((e: any, n: any) => {
            let r = f(e);
            return (0, reactInterop.createElement)(`circle`, {
              ...chartSeriesDataAttrs(i, n),
              key: `box-whisker-outlier-${i}-${n}`,
              cx: a,
              cy: r,
              fill: `#ffffff`,
              r: 3,
              stroke: t.lineColor,
              strokeWidth: 1.2,
            });
          }),
          (0, jsxRuntime.jsx)(`text`, {
            fill: _,
            fontSize: 10,
            textAnchor: `middle`,
            x: a,
            y: n.plot.top + n.plot.height + 14,
            children: t.label,
          }),
        );
      }),
    ],
  });
}
function renderRegionMapChart(e: any, t: any, n: any, r: any) {
  let i = Math.max(
      0,
      e.series.findIndex((e: any) => e.hidden !== !0),
    ),
    a = e.series[i] ?? null;
  if (!a) return null;
  let o = resolveCategoryLabels(e),
    s = extractLayoutProperties(a),
    c = s?.geography && typeof s.geography == `object` ? s.geography : null,
    l = resolveRegionSet(o, c),
    u = typeof c?.viewedRegionType == `string` ? c.viewedRegionType : null,
    d = typeof c?.projectionType == `string` ? c.projectionType : null,
    f = l === `us-state` ? En() : d === `miller` ? wn() : On(),
    p = featuresForRegionSet(l),
    m = extractCategoryColorLabels(a),
    h = m ? new Map(Array.from(new Set(m)).map((t, n) => [t, resolveDataPointColor(e, n, i)])) : null,
    g = o
      .map((e, t) => {
        let n = findGeoFeature(e, l),
          r = toFiniteNumber(a.values[t]);
        return { colorLabel: m?.[t] ?? null, feature: n, key: toCleanLabel(e), label: toCleanLabel(e), value: r };
      })
      .filter((e) => e.feature != null && (e.value != null || e.colorLabel != null)),
    _ = g.length > 0 && (u === `dataOnly` || g.length === 1),
    v = _ ? g.map((e) => e.feature) : p;
  f.fitExtent(
    [
      [n.plot.left + 8, n.plot.top + 8],
      [n.plot.left + n.plot.width - 8, n.plot.top + n.plot.height - 8],
    ],
    { type: `FeatureCollection`, features: v },
  );
  let y = rn(f),
    b = _ ? v : p,
    x = resolveRegionMapStrokeColor(e, i),
    S =
      e.chartAreaBorderColor && e.chartAreaBorderColor !== `transparent`
        ? e.chartAreaBorderColor
        : darkenHexColor(x, 0.22),
    C: any[] = g.map((e) => e.value).filter((e) => typeof e == `number` && Number.isFinite(e)),
    w = C.length > 0 ? Math.min(...C) : 0,
    T = C.length > 0 ? Math.max(...C) : 1,
    E = s?.regionLabelLayout !== `none`;
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      b.map((e: any, t: any) => {
        let n = y(e);
        return n
          ? (0, jsxRuntime.jsx)(
              `path`,
              { d: n, fill: x, stroke: S, strokeLinejoin: `round`, strokeWidth: 0.6 },
              `region-map-base-${e.id ?? t}`,
            )
          : null;
      }),
      g.map((t, n) => {
        let a = y(t.feature);
        if (!a) return null;
        let o =
            t.value == null
              ? (h?.get(t.colorLabel ?? ``) ?? resolveRegionMapBaseColor(e, i))
              : resolveRegionValueColor(e, i, T <= w ? 1 : (t.value - w) / Math.max(1e-6, T - w)),
          s = isChartElementSelected(r, e.id, i, n),
          c = y.centroid(t.feature),
          l = Number.isFinite(c[0]) && Number.isFinite(c[1]);
        return (0, jsxRuntime.jsxs)(
          reactInterop.Fragment,
          {
            children: [
              (0, jsxRuntime.jsx)(`path`, {
                ...chartSeriesDataAttrs(i, n),
                d: a,
                fill: o,
                stroke: s ? `#64748b` : darkenHexColor(o, 0.18),
                strokeLinejoin: `round`,
                strokeWidth: s ? 1.8 : 0.85,
              }),
              s && l ? renderSelectionHandles(`region-map-selection-${n}`, [{ x: c[0], y: c[1] }]) : null,
            ],
          },
          `region-map-value-${t.key || n}`,
        );
      }),
      E
        ? g.map((t, n) => {
            let [[r, i], [a, o]] = y.bounds(t.feature),
              s = a - r,
              c = o - i;
            if (!Number.isFinite(s) || !Number.isFinite(c) || s < 26 || c < 12) return null;
            let l = y.centroid(t.feature);
            return !Number.isFinite(l[0]) || !Number.isFinite(l[1])
              ? null
              : (0, jsxRuntime.jsx)(
                  `text`,
                  {
                    fill: resolveTitleTextColor(e),
                    fontSize: 9,
                    fontWeight: 600,
                    textAnchor: `middle`,
                    x: l[0],
                    y: l[1],
                    children: truncateLabel(t.label, Math.max(28, s - 4), 9),
                  },
                  `region-map-label-${t.key || n}`,
                );
          })
        : null,
    ],
  });
}
function renderUnsupportedChart(e: any, t: any, n: any, r: any) {
  return (0, jsxRuntime.jsxs)(`g`, {
    children: [
      (0, jsxRuntime.jsx)(`rect`, {
        fill: lightenHexColor(e.chartAreaFillColor ?? t.surface, 0.02),
        height: n.plot.height,
        stroke: lightenHexColor(e.axisLineColor ?? t.border, 0.2),
        strokeDasharray: `3 3`,
        width: n.plot.width,
        x: n.plot.left,
        y: n.plot.top,
      }),
      (0, jsxRuntime.jsx)(`text`, {
        fill: resolveSecondaryTextColor(e),
        fontSize: 11,
        textAnchor: `middle`,
        x: n.plot.left + n.plot.width / 2,
        y: n.plot.top + n.plot.height / 2,
        children: `Unsupported chart type: ${r}`,
      }),
    ],
  });
}
export function renderChartBody(e: any, t: any, n: any, r: any, i: any) {
  return isComboChart(e)
    ? (renderComboChart(e, t, n, i) ?? renderUnsupportedChart(e, t, n, `Combo`))
    : r === `ColumnClustered` ||
        r === `ColumnStacked` ||
        r === `ColumnPercentStacked` ||
        r === `BarClustered` ||
        r === `BarStacked` ||
        r === `BarPercentStacked`
      ? renderBarChart(e, t, n, r, i)
      : r === `Line` ||
          r === `LineStacked` ||
          r === `LinePercentStacked` ||
          r === `Area` ||
          r === `AreaStacked` ||
          r === `AreaPercentStacked`
        ? renderLineAreaChart(e, t, n, r, i)
        : r === `Scatter` || r === `ScatterLines`
          ? renderScatterChart(e, t, n, !1, i)
          : r === `ScatterSmooth`
            ? renderScatterChart(e, t, n, !0, i)
            : r === `Bubble`
              ? renderBubbleChart(e, t, n, i)
              : r === `Radar`
                ? renderRadarChart(e, t, n, i)
                : r === `Pie` || r === `Pie3D` || r === `PieExploded` || r === `Doughnut`
                  ? renderPieChart(e, t, n, r, i)
                  : r === `BarOfPie`
                    ? renderBarOfPieChart(e, t, n, i)
                    : r === `Surface`
                      ? renderSurfaceChart(e, t, n, i)
                      : r === `Stock`
                        ? renderStockChart(e, t, n, i)
                        : r === `Waterfall`
                          ? renderWaterfallChart(e, t, n, i)
                          : r === `Funnel`
                            ? renderFunnelChart(e, t, n, i)
                            : r === `BoxWhisker`
                              ? renderBoxWhiskerChart(e, t, n, i)
                              : r === `Sunburst`
                                ? renderSunburstChart(e, t, n, i)
                                : r === `Treemap`
                                  ? renderTreemapChart(e, t, n, i)
                                  : r === `RegionMap`
                                    ? renderRegionMapChart(e, t, n, i)
                                    : renderUnsupportedChart(e, t, n, r);
}
export var ChartSvgRenderer = reactInterop.memo(
    function ({
      chart: e,
      onChartElementDoubleClick: t,
      onChartElementPointerDown: n,
      palette: r,
      rect: i,
      selectedChartElement: a,
    }: any) {
      let o = resolveChartRenderType(e),
        s = computeChartLayout(e, i, resolveLegendItems(e, o, r)),
        c = e.raw && typeof e.raw == `object` ? e.raw : null,
        l = c?.chartAreaNoFill === !0 || c?.plotAreaNoFill === !0,
        u = e.chartAreaFillColor ?? (l ? `transparent` : `#ffffff`),
        d = e.chartAreaBorderColor ?? `transparent`,
        f = u.trim().toLowerCase(),
        p = d.trim().toLowerCase(),
        m = f === `transparent` && p === `transparent`,
        h = resolveFontFamilyStack(e.fontFamily),
        g = reactInterop.useCallback(
          (t: any) => {
            let r = resolveChartElementTarget(e, t.target, a);
            r && (closestChartSeriesElement(t.target) && t.stopPropagation(), n?.(r, t));
          },
          [e, n, a],
        ),
        _ = reactInterop.useCallback(
          (n: any) => {
            let r = resolveChartElementTarget(e, n.target, a);
            r && (closestChartSeriesElement(n.target) && n.stopPropagation(), t?.(r, n));
          },
          [e, t, a],
        );
      return o === `Surface`
        ? (0, jsxRuntime.jsx)(SurfaceChartPanel, {
            background: u,
            borderColor: d,
            chart: e,
            fallback: renderSurfaceChart(e, r, s, a),
            fontFamily: h,
            layout: s,
            onDoubleClick: _,
            onPointerDown: g,
            overlay: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
              children: [renderSurfaceHitAreas(e, s, a), renderSurface2dFrame(e, s), renderChartTitle(e, s, r), renderChartLegend(e, s, r)],
            }),
            palette: r,
          })
        : (0, jsxRuntime.jsxs)(`svg`, {
            "aria-label": e.title ?? e.name ?? `Chart`,
            onDoubleClick: _,
            onPointerDown: g,
            role: `img`,
            style: {
              display: `block`,
              fontFamily: h,
              height: `100%`,
              pointerEvents: `auto`,
              width: `100%`,
            },
            viewBox: `0 0 ${s.width} ${s.height}`,
            children: [
              m
                ? null
                : (0, jsxRuntime.jsx)(`rect`, {
                    fill: u,
                    height: s.height,
                    stroke: d,
                    strokeWidth: 1,
                    width: s.width,
                    x: 0,
                    y: 0,
                  }),
              renderChartTitle(e, s, r),
              renderChartLegend(e, s, r),
              renderChartBody(e, r, s, o, a),
            ],
          });
    },
    (e: any, t: any) =>
      e.chart === t.chart &&
      e.onChartElementDoubleClick === t.onChartElementDoubleClick &&
      e.onChartElementPointerDown === t.onChartElementPointerDown &&
      e.palette === t.palette &&
      e.rect.height === t.rect.height &&
      e.rect.width === t.rect.width &&
      e.rect.left === t.rect.left &&
      e.rect.top === t.rect.top &&
      e.selectedChartElement === t.selectedChartElement,
  ),
  LIGHT_GRID_THEME = {
    border: `#e4e4e7`,
    buttonSurface: `#ffffff`,
    buttonText: `#18181b`,
    canvas: `#fafafa`,
    danger: `#dc2626`,
    headerSurface: `#f4f4f5`,
    headerText: `#71717a`,
    mutedSurface: `#f5f5f5`,
    mutedText: `#71717a`,
    rowHeaderSurface: `#f4f4f5`,
    shadow: `0 1px 2px rgba(0, 0, 0, 0.04)`,
    sheetActiveSurface: `#ffffff`,
    sheetActiveText: `#18181b`,
    sheetInactiveSurface: `#e4e4e7`,
    sheetInactiveText: `#52525b`,
    strongBorder: `#d4d4d8`,
    subtleSurface: `#fafafa`,
    surface: `#ffffff`,
    text: `#18181b`,
    toolbarSurface: `#f5f5f5`,
  },
  DARK_GRID_THEME = {
    border: `rgba(255, 255, 255, 0.10)`,
    buttonSurface: `rgba(255, 255, 255, 0.06)`,
    buttonText: `#f4f4f5`,
    canvas: `#09090b`,
    danger: `#f87171`,
    headerSurface: `#18181b`,
    headerText: `#a1a1aa`,
    mutedSurface: `#111113`,
    mutedText: `#a1a1aa`,
    rowHeaderSurface: `#18181b`,
    shadow: `0 1px 2px rgba(0, 0, 0, 0.28)`,
    sheetActiveSurface: `#27272a`,
    sheetActiveText: `#fafafa`,
    sheetInactiveSurface: `#18181b`,
    sheetInactiveText: `#a1a1aa`,
    strongBorder: `rgba(255, 255, 255, 0.16)`,
    subtleSurface: `#101012`,
    surface: `#111113`,
    text: `#f4f4f5`,
    toolbarSurface: `#101012`,
  };
export function isDarkGridTheme(e: any) {
  return e.surface === DARK_GRID_THEME.surface;
}
export function resolveGridTheme(e: any = !1, t: any, n: any) {
  let r = e ? DARK_GRID_THEME : LIGHT_GRID_THEME;
  return t === void 0 && n === void 0
    ? r
    : {
        ...r,
        headerSurface: t ?? r.headerSurface,
        headerText: n ?? r.headerText,
        rowHeaderSurface: t ?? r.rowHeaderSurface,
      };
}
/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → js 行；段 A：Ru → useSpreadsheetController 15672）
 * ============================================================================
 *  [地图特征与名称归一]
 *   kd → WORLD_COUNTRY_FEATURES (183972) | Ad → US_STATE_FIPS_INFO (183973) | jd → US_STATE_FEATURES (184026) |
 *   Md → COUNTRY_NAME_ALIASES (184038) | Nd → US_STATE_NAME_ALIASES (184057) | Pd → COUNTRY_FEATURE_BY_NAME (184064) |
 *   Fd → US_STATE_FEATURE_BY_NAME (184074) | Vd → normalizeGeoName (184117) | nf → findGeoFeature (184213) |
 *   lf → resolveRegionSet (184254) | uf → featuresForRegionSet (184260)
 *  [颜色/字体/数值助手]
 *   Id → parseHexColor (184090) | Ld → mixHexColors (184100) | Rd → lightenHexColor (184108) |
 *   zd → darkenHexColor (184111) | Bd → clampNumber (184114) | Hd → SPREADSHEET_FONT_STACK (184129) |
 *   Ud → DEFAULT_CHART_TEXT_COLOR (184132) | Wd → DEFAULT_AXIS_LABEL_COLOR (184133) |
 *   Gd → quoteFontFamilyName (184134) | Kd → resolveFontFamilyStack (184146) | qd → resolveTitleTextColor (184154) |
 *   Jd → resolveAxisLabelColor (184157) | Yd → resolveSecondaryTextColor (184160) | Xd → toFiniteNumber (184163) |
 *   fp → normalizeHexColor (184993) | Cp → formatTickNumber (185197) | wp → formatPercentTick (185202) |
 *   kp → truncateLabel (185244) | wf → toCleanLabel (184404) | Tf → formulaRowCount (184411) | jp → TWO_PI (185276) |
 *   Fp → roundPathNumber (185300)
 *  [系列/数据点颜色]
 *   Zd → resolveSeriesFillColor (184173) | Qd → resolveSeriesLineColor (184178) | $d → resolveDataPointColor (184183) |
 *   ef → hasHistogramBins (184206) | tf → hasHistogramSeries (184210) | rf → resolveReferenceLineColor (184223) |
 *   af → resolveRegionMapBaseColor (184226) | of → extractValueColorScale (184236) |
 *   sf → extractCategoryColorLabels (184241) | cf → extractLayoutProperties (184250) |
 *   hf → normalizeChartStyleId (184301) | gf → surfaceStyle32Palette (184304) | _f → resolvePieSliceColor (184309) |
 *   vf → pickPrimarySeriesIndex (184315) | yf → resolveBarSeriesStyle (184332) | bf → barPaddingFromGapWidth (184351)
 *  [图例/分类/轴解析]
 *   xf → normalizeLegendPosition (184356) | Sf → normalizeMarkerSymbol (184378) |
 *   Cf → resolveChartRenderType (184381) | Ef → resolveCategoryLabels (184421) | Df → isComboChart (184453) |
 *   Of → comboLegendItems (184457) | kf → findAxisByIds (184467) | Af → resolveTypeGroups (184473) |
 *   jf → toAxisNumber (184492) | Mf → extractNumericValue (184495) | Nf → collectPieDataPoints (184521) |
 *   Pf → isSubtotalSeries (184532) | Ff → collectStackedTotals (184537) | gp → resolveLegendItems (185063) |
 *   _p → computeChartLayout (185092)
 *  [层级/统计]
 *   If → buildHierarchyTree (184575) | Lf → resolveQuartileMethod (184616) |
 *   Rf → resolveBoxWhiskerVisibility (184624) | zf → quantileValue (184635) | Bf → computeBoxWhiskerStats (184648) |
 *   Vf → resolveSunburstFillColor (184681) | Hf → resolveTreemapFillColor (184686) | Uf → tileHierarchyNode (184690)
 *  [曲面图色带与几何]
 *   Wf → resolveSurfaceBaseColor (184699) | Gf → normalizeSurfaceStyleId (184709) |
 *   Kf → resolveSurfaceAccentColor (184712) | qf → surfaceStyleRamp (184718) |
 *   Jf → resolveSurfaceStylePalette (184723) | Yf → isStyledSurfaceChart (184736) |
 *   Xf → resolveSurfaceBandCount (184747) | Zf → resolveSurfaceColorRamp (184765) |
 *   Qf → resolveSurfaceBandColor (184774) | $f → computeSurfaceValueScale (184780) |
 *   ep → sampleSurfaceRampColor (184809) | tp → resolveSurfaceCellColor (184819) |
 *   np → surfaceBandIndexForValue (184822) | op → resolveSurfaceLineColors (184886) |
 *   sp → resolveSurfaceLineColor (184893) | cp → resolveSurfacePlotRect (184899) | lp → surfaceLegendItems (184918) |
 *   up → is2dSurfaceChart (184930) | dp → renderSurface2dFrame (184941)
 *  [路径/轮廓助手]
 *   rp → pointsToLinePath (184828) | ip → splitDefinedPointRuns (184836) | ap → joinContourSegments (184853) |
 *   vp → niceTickStep (185122) | yp → buildTicks (185128) | bp → buildValueScale (185138) |
 *   xp → resolveAxisScale (185151) | Sp → computeBar3dDepth (185165) | Tp → isDateFormatCode (185205) |
 *   Ep → excelSerialToDate (185214) | Dp → formatExcelDate (185219) | Op → formatCategoryValue (185236) |
 *   Ap → markerSymbolPath (185250) | Mp → normalizeArcAngles (185277) | Np → arcTopFaceSegments (185283) |
 *   Pp → pieArcPoint (185297) | Ip → pie3dSidePaths (185303) | Lp → isArcBackAngle (185320) |
 *   Rp → pie3dSliceWallPath (185324) | qp → pointsToPath (185752) | Jp → project3dPoint (185757) |
 *   Hp → scalePoint2d (185522) | Up → ellipseArcPoints (185525) | Wp → closedOutlinePath (185538)
 *  [共享渲染件]
 *   zp → renderChartTitle (185338) | Bp → renderChartLegend (185353) | Vp → renderCartesianGrid (185399) |
 *   pp → resolveStockSeriesRoles (185000) | mp → resolveStockPalette (185022) | hp → stockLegendItems (185045) |
 *   om → findSeriesByNamePattern (188487)
 *  [3D 形状]
 *   Gp → renderCylinderCone3d (185541) | Kp → renderBar3dShape (185614)
 *  [图表渲染器]
 *   Yp → renderLine3dChart (185769) | Xp → renderBarChart (186122) | Zp → renderLineAreaChart (186505) |
 *   Qp → renderComboChart (186738) | $p → renderScatterChart (186906) | em → renderBubbleChart (187147) |
 *   tm → renderRadarChart (187378) | nm → renderPieChart (187540) | rm → renderBarOfPieChart (187776) |
 *   im → renderSurfaceChart (187927) | am → renderSurfaceHitAreas (188448) | sm → renderStockChart (188491) |
 *   cm → renderWaterfallChart (188659) | lm → renderFunnelChart (188793) | um → renderSunburstChart (188844) |
 *   dm → renderTreemapChart (188910) | fm → renderBoxWhiskerChart (188972) | pm → renderRegionMapChart (189183) |
 *   mm → renderUnsupportedChart (189294) | hm → renderChartBody (189317)
 *  [顶层组件与主题]
 *   gm → ChartSvgRenderer (189364) | _m → LIGHT_GRID_THEME (189454) | vm → DARK_GRID_THEME (189476) |
 *   ym → isDarkGridTheme (189498) | bm → resolveGridTheme (189501)
 *  外部依赖 56 组（行号在案）见文件头 §二；地图数据段 17818–183063 仅登记。
 * ============================================================================
 */
