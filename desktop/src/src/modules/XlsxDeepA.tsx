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

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/xlsx/XlsxDeepA.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  useSpreadsheetController,
  SPREADSHEET_FONT_STACK,
  DEFAULT_CHART_TEXT_COLOR,
  DEFAULT_AXIS_LABEL_COLOR,
  resolveChartRenderType,
  resolveLegendItems,
  computeChartLayout,
  renderChartBody,
  ChartSvgRenderer,
  LIGHT_GRID_THEME,
  DARK_GRID_THEME,
  isDarkGridTheme,
  resolveGridTheme,
} from '../components/xlsx/XlsxDeepA';
