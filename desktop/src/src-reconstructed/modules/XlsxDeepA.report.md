# XlsxDeepA.report.md — B5-12a：react-xlsx 私有引擎深部上半（Ru 控制器 + canvas/SVG 图表渲染层）逐字重建

- 批次：**B5-12a**（ZCode 3.7.6 前端逆向重建 · B5 阶段第 12 批上半）
- 产物：`desktop/src/src-reconstructed/modules/XlsxDeepA.tsx`（**8,178 行**）
- 主口径（只读）：`desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`（199,508 行）
  - 基线 MD5：`4193214026dc469cb45056f49795e25e`（完成后抽验一致，见 §6.5）
- jsx 孪生（交叉参照）：`desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx`（49,724 行）
- 上游登记：`XlsxPreview.report.md` §1 结构总图 / §2 边界依据（5 处自称标记）/ §4 子段表；
  `COVERAGE-LEDGER.md` §d 第 24 项、§f.4 第 7 项（react-xlsx 为私有引擎，非 npm 公开同名库）。
  注：任务书所称「XlsxPreview.report §8 深部登记」，其子段表实际位于该报告 **§4**（§8 为后续建议，
  其优先级 1 即本批：Ru 15672–17817 → 画布渲染层 183972–189511）。

## 0. 摘要

| 项 | 值 |
|---|---|
| 范围 A | js **15672–17817**（2,146 行）= `Ru` = useSpreadsheetController（单函数控制器钩子） |
| 范围 B | js **183972–189511**（5,540 行）= 地图特征/名称归一 + 图表常量与助手 + 全部 23 个图表渲染器 + `gm` ChartSvgRenderer（memo）+ 网格主题 |
| 排除 | js 17818–183063 地图数据段（165,246 行纯 TopoJSON，仅注记，见 §2）；183064–183971 地图/图表助手子段（范围外，外部依赖挂接，见 §3） |
| 重建符号 | A 段 1 个 + B 段 153 个 = **154 个顶层符号改语义名**；函数体内局部名一律保留混淆名 |
| 门禁 | 四项全过（§6）；另加两条超门禁验证：**全量逆映射回代 diff 双段逐字节一致**（§6.4）、md5 抽验（§6.5） |
| 把握度 | 字符串/分支/数值 **高**（逐字节可回代）；语义命名 **高**（有 OOXML/d3 语义锚点）；详见 §7 |

## 1. 覆盖清单（符号 → 行号）

行号格式：主口径 js 行 / jsx 孪生行。全表与 `XlsxDeepA.tsx` 文件头「一、映射表」逐字一致。

### 1.1 段 A（js 15672–17817 / jsx 11907–13483）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---:|---:|---|
| `Ru` | `useSpreadsheetController` | 15672 | 11907 | 引擎控制器钩子（2,146 行单函数）：file/src→worker 加载、sheets/tabs/charts/images/formControls 状态机、选区/编辑/剪贴板/缩放/撤销栈、`Ge/We` 持有/释放 `Oc`（XlsxWorkerClient） |

### 1.2 段 B（js 183972–189511 / jsx 38365–41540）：153 个顶层符号

```text
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
```

（jsx 孪生行号取自 pretty-print 版同一声明处；`_m..bm` 四个主题符号的 jsx 行靠近孪生段尾。）

### 1.3 导出符号（`export` 前缀，共 11 个）

`useSpreadsheetController`、`ChartSvgRenderer`、`LIGHT_GRID_THEME`、`DARK_GRID_THEME`、
`isDarkGridTheme`、`resolveGridTheme`、`renderChartBody`、`resolveLegendItems`、
`computeChartLayout`、`resolveChartRenderType`、`SPREADSHEET_FONT_STACK`。
（对应原始 chunk 内跨段消费点；其余符号为段内私有，不加 export。）

### 1.4 外部依赖挂接（56 组，`declare const _: any`）

全部列于 `XlsxDeepA.tsx` 文件头「二、外部依赖清单」，每组带定义处 js 行号，分 8 类：
chunk 导入（G/K + d3-scale/shape/hierarchy 10 组）、chunk 内 vendored d3/topojson（Pn/rn/En/wn/On/kn/An）、
地图数据（zu/Bu）、地图/图表选择助手（bd/xd/Sd/Cd/wd/Td/Ed/Dd/Od/yd，183064–183971 子段）、
wasm 桥（wc/Oc/Ec）、解析/几何（Yn/Zn/na/fa/pa/Ca/xa/is）、OOXML 写回（Us..dc 11 组）、
公式/计算（gc）、模型/错误/常量（Xc..Lu + xl/vl/yl + 常量 rl/il/$c/Qc/el/tl/ol/sl/cl/pl/ml/gl）。

## 2. 地图数据段注记（js 17818–183063，165,246 行）

- 性质：**纯数据**，两个 TopoJSON 对象字面量，无任何逻辑：
  - `zu`（js 17818 起）= **us-atlas** TopoJSON（Albers USA 预投影、量化坐标），objects 含
    `states`/`counties`（`Pn(zu, zu.objects.states)` 用于美国州级地图图表）。
  - `Bu`（约 js 18290 起）= **world-atlas** TopoJSON（countries，ISO 3166-1 数字 id，量化），
    `Pn(Bu, Bu.objects.countries).features` 即本批 B 段首行 `kd`/WORLD_COUNTRY_FEATURES。
- 处置：按任务口径**不转录**（外置资产口径）；本批以 `declare const zu: any; declare const Bu: any;`
  挂接（文件头外部依赖第 14 组）。
- 与 XlsxPreview.report §1/§4 的「地图数据 17818–183063 仅登记」一致；该段占全 chunk 82.8%。

## 3. 边界裁决（对照 XlsxPreview.report §4 私有引擎子段表）

| # | 裁决 | 依据 |
|---|---|---|
| 1 | **`kd` 归属修正**：§4 子段表「地图/图表助手 183064–183971」行提及 `kd = Pn(Bu, Bu.objects.countries).features`，但该声明实际位于 **js 183972**（`var kd = ...` 是画布渲染子段的第一行）→ 属本批 B 范围，已全量重建（含 Ad/jd/Md/Nd/Pd/Fd 整个 var 链至 184087）。§4 该行对 `kd` 的提及应视为前向引用/笔误。 | 主口径 183972 行实测；锚点 A2（§6.3） |
| 2 | 「地图/图表助手 183064–183971」子段（`Vu` clamp、`yd` memo 图表组件 183672、选择助手 `bd/xd/Sd/Cd/wd/Td/Ed/Dd/Od` 183890–183947）**全部在本批行号范围外**，按外部依赖声明挂接（文件头第 15–19 组），未转录其本体。 | 行号互斥纪律 |
| 3 | 「常量/剪贴板 189512–190103」「工具栏 UI 190104–192831」「行渲染层 192832–193216」：本批范围外（B 段止于 189511），且**不在 B5-12b 范围**（12b 自 193217 起）→ 本波次未分配，留待后续批次。 | 任务书行号划分 |
| 4 | 与并行批次 **B5-12b**（js 193217–199291 + pptx 接线 + CartesianChart）：本批最大行号 189511 < 193217，**零重叠**。 | 行号互斥 |
| 5 | 范围内 vendored 子段核对：B 段内**无**子段表所列其他 vendored 子段（d3/topojson 在 js 28–1834，regl 在 1835–9110，均在本批范围外）；B 段内使用的 `Pn/rn/En/wn/On/kn/An` 等 d3/topojson 符号以声明挂接（第 11–13 组）。A 段（Ru）内无 vendored 子段。 | §4 子段表逐行比对 |
| 6 | 自称标记保全：A 段含 `[react-xlsx debug]` 日志 3 处（js 16983/16998/17016：setChartRect/currentChart/updateWorkbookChartAnchor），产物中逐字保留（3/3）。`application/x-react-xlsx-range+json`（14626）与 `react-xlsx-viewer`（199346）在本批范围外。 | grep 核验 |

## 4. 重建口径与机械差异（相对主口径的全部允许差异）

1. **顶层符号改名**：154 个（词边界替换；`of` 特殊处理——仅 `function of(` 与 `of(` 调用位改名，
   避免误伤 `typeof`/`.of`/字面量）。
2. **`export ` 前缀**：11 个导出符号的定义行（§1.3）。
3. **类型标注**（纯 TS 增量，回代时整体剥离）：
   - 顶层函数参数 `: any`（含 `e: any = !1` 默认值形态）；
   - 箭头回调参数 `: any`（strict noImplicitAny 要求，共 576 处机械注入 + 级联补注）；
   - 27 处定点标注：`: any[]`（5）、`: Record<string, any>`（1）、`: Map<any, any>`（1）、
     解构参数/模式 `: any`（9）、for-of 元素/变量 `: any`（2）、返回类型 `): any`（1）、
     局部对象 `: any`（8）。
4. **编译态 JSX 保留**：B 段 JSX 一律保留 `(0, K.jsx)(...)` / `(0, K.jsxs)(...)` 编译形态
   （主口径逐字）；jsx 孪生的糖语法仅作交叉参照，不采用。
5. **字面量保全修复（3 处）**：改名管线对正则/字符串字面量内的词边界符号误改，已逐字还原——
   - js 185229：日期格式正则中 `mm`（分钟 token）曾被改为 renderUnsupportedChart，已还原；
   - js 185259：`case \`triangle-up\`:`（marker 符号名）曾被改 `up`→is2dSurfaceChart，已还原；
   - js 186657：模板串 `` `up-down-${t}` ``（KPI 涨跌类名）同上，已还原。
   修复后经全量字面量扫描确认：产物中**无任何语义名泄漏进字符串/模板/正则字面量**
   （模板 `${}` 插值中的语义名是真实代码调用，不属泄漏）。
6. 除上述 1–5 外，**零差异**——由 §6.4 逆映射回代 diff 逐字节证明。

## 5. 产物结构（XlsxDeepA.tsx，8,178 行）

| 区段 | 行号 | 行数 | 内容 |
|---|---|---:|---|
| 文件头（上） | 1–40 | 40 | 来源/口径说明 |
| 一、映射表 | 41–193 | 153 | 混淆名→语义名（js/jsx 双行号） |
| 文件头（下）：二、外部依赖 | 194–414 | 221 | 56 组依赖 + 全部 `declare const X: any;` 桩 |
| 段 A 主体 | 415–2560 | 2,146 | useSpreadsheetController（= js 15672–17817，行序 1:1） |
| 分隔注释 | 2561–2564 | 4 | [B] 段标题 |
| 段 B 主体 | 2565–8104 | 5,540 | 图表渲染层（= js 183972–189511，行序 1:1） |
| 尾符号表 | 8105–8178 | 74 | 按功能族分组（§7） |

## 6. 验证记录

环境与命令均在仓库根 `/Users/mac/nofy-build` 执行。

### 6.1 门禁 1：esbuild（0 错）

```
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/XlsxDeepA.tsx \
  --loader:.tsx=tsx --jsx=preserve
→ ⚡ Done in 10ms（227.5kb，0 errors）
```

### 6.2 门禁 2：tsc strict（0 错）

`/tmp/tsconfig.XlsxDeepA.json`：strict、target/lib ES2022（+DOM/DOM.Iterable）、jsx preserve、
module ESNext、moduleResolution Bundler、noEmit、skipLibCheck、
typeRoots → `web/node_modules/@types`、include 仅产物本体。

```
web/node_modules/.bin/tsc -p /tmp/tsconfig.XlsxDeepA.json
→ 0 输出（0 errors）
```

修复过程（留档）：首轮 656 错 = 576×TS7006（箭头参数隐式 any——`declare const G: any` 的
被调方不传递上下文类型）+ 80 行其他码（TS2345/TS7053/TS2339/TS7034/TS7005/TS2538/TS7031/
TS7022/TS7023/TS18048，均为局部窄推断）。以 tsc 报错坐标机械注入 576 处 `: any`，
再按 §4.3 的 27 处定点标注收敛至 0；级联暴露的 TS7006（any 上下文）同法补注。

### 6.3 门禁 3：锚点回代（12/12 命中，≥8 达标）

方法：取主口径指定行的原文，按重建规则（改名/标注/export）推导产物行，要求在产物中**唯一命中**；
`verbatim` 锚点要求与主口径**逐字节相同**。

| # | js 行 | 模式 | 主口径原文 | 产物行（命中） |
|---:|---:|---|---|---|
| 1 | 15672 | rename | `function Ru(e) {` | `export function useSpreadsheetController(e: any) {`（415） |
| 2 | 183972 | rename | `var kd = Pn(Bu, Bu.objects.countries).features,` | `var WORLD_COUNTRY_FEATURES = Pn(Bu, Bu.objects.countries).features,`（2565） |
| 3 | 184090 | rename | `function Id(e) {` | `function parseHexColor(e: any) {`（2683） |
| 4 | 184129 | rename | ``var Hd = [`"Aptos"`, `Calibri`, …].join(`` | ``export var SPREADSHEET_FONT_STACK = [`"Aptos"`, `Calibri`, …].join(``（2722） |
| 5 | 185229 | verbatim | ``: /(^|[^a-z])m([^a-z]|$)\|(^|[^a-z])mm([^a-z]|$)/.test(i) && (a.month = `numeric`),`` | 逐字节（3822） |
| 6 | 185259 | verbatim | ``case `triangle-up`:`` | 逐字节（3852） |
| 7 | 185276 | rename | `var jp = Math.PI * 2;` | `var TWO_PI = Math.PI * 2;`（3869） |
| 8 | 186122 | rename | `function Xp(e, t, n, r, i) {` | `function renderBarChart(e: any, t: any, n: any, r: any, i: any) {`（4715） |
| 9 | 186657 | verbatim | `` `up-down-${t}`,`` | 逐字节（5250） |
| 10 | 187147 | rename | `function em(e, t, n, r) {` | `function renderBubbleChart(e: any, t: any, n: any, r: any) {`（5740） |
| 11 | 189364 | rename | `var gm = G.memo(` | `export var ChartSvgRenderer = G.memo(`（7957） |
| 12 | 189501 | rename | `function bm(e = !1, t, n) {` | `export function resolveGridTheme(e: any = !1, t: any, n: any) {`（8094） |

### 6.4 超门禁验证：全量逆映射回代 diff（逐字节）

对产物两个主体段（415–2560、2565–8104）执行逆变换：语义名→混淆名（含 `of` 特殊逆映射）→
剥离全部类型标注与 `export ` 前缀，与原始段逐字节比对：

```
segA: BYTE-IDENTICAL after reverse transform (2146 lines)   ← js 15672–17817
segB: BYTE-IDENTICAL after reverse transform (5540 lines)   ← js 183972–189511
```

即：除 §4 所列五类允许差异外，两段共 7,686 行**无任何其他改动**（字符串、分支、数值、
空白、行序全部逐字）。

### 6.5 md5 抽验（out/ 只读纪律）

```
md5 desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
= 4193214026dc469cb45056f49795e25e   （与开工基线一致，未改动）
```

### 6.6 门禁 4：报告完整

本报告含：覆盖清单（§1）、地图数据段注记（§2）、边界裁决（§3）、口径与差异（§4）、
产物结构（§5）、验证记录（§6）、符号表（§7）、把握度（§8）、遗留问题（§9）。

## 7. 尾符号表（已嵌入产物 8105–8178 行，按功能族分组）

- [地图特征与名称归一] kd/Ad/jd/Md/Nd/Pd/Fd/Vd/nf/lf/uf（11）
- [颜色/字体/数值助手] Id/Ld/Rd/zd/Bd/Hd/Ud/Wd/Gd/Kd/qd/Jd/Yd/Xd/fp/Cp/wp/kp/wf/Tf/jp/Fp（21）
- [系列/数据点颜色] Zd/Qd/$d/ef/tf/rf/af/of/sf/cf/hf/gf/_f/vf/yf/bf（16）
- [图例/分类/轴解析] xf/Sf/Cf/Ef/Df/Of/kf/Af/jf/Mf/Nf/Pf/Ff/gp/_p（15）
- [层级/统计] If/Lf/Rf/zf/Bf/Vf/Hf/Uf（8）
- [曲面图色带与几何] Wf/Gf/Kf/qf/Jf/Yf/Xf/Zf/Qf/$f/ep/tp/np/op/sp/cp/lp/up/dp（19）
- [路径/轮廓助手] rp/ip/ap/vp/yp/bp/xp/Sp/Tp/Ep/Dp/Op/Ap/Mp/Np/Pp/Ip/Lp/Rp/qp/Jp/Hp/Up/Wp（23）
- [共享渲染件] zp/Bp/Vp/pp/mp/hp/om（7）
- [3D 形状] Gp/Kp（2）
- [图表渲染器] Yp/Xp/Zp/Qp/$p/em/tm/nm/rm/im/am/sm/cm/lm/um/dm/fm/pm/mm/hm（19）
- [顶层组件与主题] gm/_m/vm/ym/bm（5）
- 段 A：Ru → useSpreadsheetController（15672）

合计 153（B）+ 1（A）= 154，与 §1 覆盖清单一致。

## 8. 把握度分级

| 项 | 级别 | 依据 |
|---|---|---|
| 字符串常量/类名/日志文案/分支结构/数值 | **高** | §6.4 逆映射 diff 逐字节一致；3 处字面量误改已还原并全量复扫 |
| 顶层符号语义命名（图表渲染族/颜色族/几何族） | **高** | 有 OOXML 图表类型名（`BarOfPie`/`Sunburst`/`RegionMap`…）、d3 API 形态、字符串常量（`triangle-up`、字体名、MIME）等硬锚点 |
| 语义命名（A 段 Ru 内部状态机引用的少数助手名，如 `vt/Xl` 等外部依赖） | **中** | 依赖名来自 XlsxPreview.report §4 子段表与调用形态推断；本体不在本批，未逐行验证 |
| 子段边界归属 | **高** | 顶层声明行号定界（§3），`kd` 修正有行号实证 |
| 类型标注 | **高（仅语法层面）** | 全部为 `any` 系标注，不承载语义断言；strict tsc 0 错 |

## 9. 遗留问题

1. **189512–193216 未分配**：常量/剪贴板（189512–190103）、上下文（190102–190103）、
   工具栏 UI（190104–192831）、行渲染层（192832–193216）四个子段本波次无批次覆盖，
   建议列入下一波次（可作 B5-12c）。
2. **地图数据外置资产未落盘**：zu/Bu（js 17818–183063）按口径仅注记；若后续要运行级重建，
   需将两段 TopoJSON 外置为资产文件并改接线（本批以 `declare const` 挂接）。
3. **VENDOR-MANIFEST-LIBS 回写**：react-xlsx 私有引擎条目仍为「待回写」；本批可直接引用
   XlsxPreview.report §2 的 5 处自称标记与 §4 子段表（本批覆盖其中「控制器」「画布渲染」两行）。
4. **XlsxPreview.report §4 的 `kd` 行位笔误**（§3 裁决 1）：按纪律未改动既有报告文件，
   仅在此记录——建议下次修订该行时将 `kd` 移至「画布渲染 183972–189511」行。
5. **jsx 孪生行号复核**：交稿前对 154 个符号的 jsx 孪生行号做过一次全量重算与抽查
   （`function NAME(` / var 链 `NAME = ` 定义模式 + 段区间过滤），修正了初稿表格中
   若干 jsx 行号漂移（主口径 js 行号不受影响）；现表与产物文件头逐字一致。
6. 本批未做运行级验证（私有引擎依赖链超出本文件范围）；门禁为静态双工具链 + 回代验证。
