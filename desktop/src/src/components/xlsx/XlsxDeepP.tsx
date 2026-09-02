// A0-S4-4c: 自 modules/XlsxDeepP.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/xlsx/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * XlsxDeepP.tsx — react-xlsx 私有引擎深部（前导段）：模块头常量 +
 * OOXML 解析/几何 + 写回 + 公式计算 + wasm 桥 + 模型层
 * （B5-12p 批次 · 逐字重建）
 * ============================================================================
 *
 * 来源文件（主口径，199,508 行，未改动，只读；md5 基线 4193214026dc469cb45056f49795e25e）：
 *   desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
 * jsx 孪生交叉参照（同一 chunk 的 pretty-print 版，49,724 行）：
 *   desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx
 *
 * 覆盖区段：js 9111–15671（6,561 行）——此前各批未解码的「前导段」。
 * 性质裁决：FIRST-PARTY（react-xlsx 私有引擎本体），全量逐字转录；
 * 证据链见 XlsxDeepPT.report.md §2（[react-xlsx] 自称日志 14318/14326/14336、
 * import('./duke_sheets_wasm-WTFY9Nh4.js') @14370、
 * application/x-react-xlsx-range+json @14626、OOXML 命名空间常量与 Office
 * 图表色板 9114–9131、xl/theme/theme1.xml 解析；VENDOR-MANIFEST-LIBS.md
 * 行 200 已将该区段登记为 react-xlsx 私有引擎；全段无任何 vendored 特征）。
 * 子段划分（与 XlsxPreview.report.md §2/§4/§8 对齐）：
 *   P0. 9111–9131（21 行）模块头：interop/jsx-runtime 装载 + OOXML 命名空间
 *       常量族 + Office 图表色板 officeChartPalette
 *   P1. 9132–12130（3,000 行）解析/几何：workbook/sheet/style/theme/条件格式/
 *       drawing/chart 的 OOXML XML 解析、EMU 几何换算、字体/填充色解析
 *       （xa=resolveFontColor / Ca=resolveFillColor 实体在此）
 *   P2. 12131–14130（2,000 行）写回/序列化：zip 写入器 + 字节序列化导出
 *   P3. 14131–14340（210 行）公式/计算与网格助手（nc=emuToPx 实体在此）
 *   P4. 14341–14474（134 行）wasm 桥：@dukelib/sheets-wasm 动态 import +
 *       worker 请求协议（D8 语义口径 XlsxPreviewWasmBridge.tsx 亦覆盖此段，
 *       双归属登记见 XlsxDeepPT.report.md §7）
 *   P5. 14475–15671（1,197 行）模型/错误/常量：工作簿模型、解析错误态、
 *       窗体控件、常量族
 * 排除（边界互斥，仅注记）：
 *   - 9111 以下 28–1834 为 d3/topojson、1835–9110 为 regl（均 vendored，
 *     VENDOR-MANIFEST-LIBS.md 在案）；15672 起控制器 Ru 属 B5-12a（XlsxDeepA.tsx）。
 *
 * 重建口径（与 XlsxDeepA/B/C 一致）：
 *   - 逐字转录：字符串常量（含全部模板字面量/命名空间 URI/类名/样式键）、
 *     分支结构、数值常量、JSX 调用形态零改动。JSX 保留原始编译形态
 *     `(0, K.jsx)(...)` / `(0, K.jsxs)(...)`（jsx 孪生糖语法仅作交叉参照）。
 *   - 顶层符号全部改语义名（下表，440 名）；函数体内局部变量名保留原混淆名
 *     不改，以保证逐字可回代。语义名均取自字面量/API/调用位点直接证据
 *     （裁决过程见报告 §4）。
 *   - 类型标注（可机械剥离，原文件不含字面 `any`）：顶层函数参数标 `: any`；
 *     箭头回调/解构形参按 tsc strict 报错坐标机械注入 `: any`；对象字面量
 *     动态索引以 `(... as any)` 断言（3 处：schemeColorFromTheme、borderCss×2）；
 *     `Array.from(<any>)` 统一 `(... as any[])` 收口（45 处，规避 TS 5.6
 *     unknown[] 推断）；可选/默认形参 `?: any` / `: any = ...`。
 *   - 结构修复（可机械还原，目录见报告 §5）：
 *     1. 体首行（js 9111）原为 chunk 级 var 链续行 `  G = e(n(), 1),`，
 *        独立成文时前补 `var ` 并左对齐；
 *     2. 同级 chunk 资产动态 import 行上加整行可剥离 `// @ts-expect-error`。
 *   - 外部依赖一律 `declare const X: any` 挂接（行号在案，见 §二）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：主口径 js 行 / jsx 孪生行；
 *     ·export = 跨段消费导出，判据见报告 §3）
 * ----------------------------------------------------------------------------
 * [P0] 模块头（js 9111–9131 / jsx 5975–5984；9121–9131 为该 var 链未具名续行成员）：
 *   G    → reactInterop                   (js 9111 / jsx 5975) ·export
 *   Rn   → reglInterop                    (js 9112 / jsx 5976) ·export
 *   K    → jsxRuntime                     (js 9113 / jsx 5977) ·export
 *   zn   → chartXmlNamespace              (js 9114 / jsx 5978)
 *   q    → drawingXmlNamespace            (js 9115 / jsx 5979)
 *   Bn   → chartRelNamespace              (js 9116 / jsx 5980)
 *   Vn   → chartExRelNamespace            (js 9117 / jsx 5981)
 *   Hn   → chartStyleRelNamespace         (js 9118 / jsx 5982)
 *   Un   → chartColorStyleRelNamespace    (js 9119 / jsx 5983)
 *   Wn   → officeChartPalette             (js 9120 / jsx 5984)
 * [P1] OOXML 解析/几何（js 9132–12130 / jsx 5985–8446）：
 *   Gn   → quoteFormulaString             (js 9132 / jsx 5985)
 *   Kn   → unquoteFormulaString           (js 9135 / jsx 5988)
 *   qn   → splitFormulaArgs               (js 9141 / jsx 5992)
 *   Jn   → seriesRawName                  (js 9182 / jsx 6033)
 *   Yn   → chartSeriesFormula             (js 9186 / jsx 6037) ·export
 *   Xn   → parseSeriesFormula             (js 9198 / jsx 6047)
 *   Zn   → updateChartSeriesValues        (js 9220 / jsx 6069) ·export
 *   Qn   → normalizeSheetVisibility       (js 9256 / jsx 6105)
 *   $n   → emuPerPx                       (js 9259 / jsx 6108)
 *   er   → themeColorIndices              (js 9260 / jsx 6109)
 *   tr   → chartElementTagNames           (js 9278 / jsx 6127)
 *   nr   → clampUnitValue                 (js 9296 / jsx 6128)
 *   rr   → isElementNode                  (js 9299 / jsx 6131)
 *   ir   → normalizeHexColor              (js 9302 / jsx 6134)
 *   ar   → fillColorFromXml               (js 9310 / jsx 6138)
 *   or   → shapePaintFromXml              (js 9338 / jsx 6156)
 *   sr   → seriesPaintColorsFromXml       (js 9346 / jsx 6159)
 *   J    → dataPointOverridesFromXml      (js 9355 / jsx 6169)
 *   cr   → numericPointValuesFromXml      (js 9399 / jsx 6211)
 *   lr   → bubbleSizeValuesFromXml        (js 9420 / jsx 6232)
 *   ur   → decodeXmlEntities              (js 9429 / jsx 6239)
 *   dr   → normalizeTitleText             (js 9437 / jsx 6242)
 *   fr   → chartTitleFromXml              (js 9440 / jsx 6245)
 *   pr   → matchBubbleChartValues         (js 9446 / jsx 6251)
 *   mr   → chartTypeTagFromXml            (js 9467 / jsx 6267)
 *   hr   → chartTypeElement               (js 9471 / jsx 6271)
 *   gr   → scatterChartSubtype            (js 9479 / jsx 6279)
 *   _r   → matchDataPointOverrides        (js 9491 / jsx 6291)
 *   Y    → hexToRgb                       (js 9523 / jsx 6309)
 *   X    → rgbToHsl                       (js 9535 / jsx 6315)
 *   vr   → hueToRgbChannel                (js 9559 / jsx 6339)
 *   yr   → hslToRgb                       (js 9567 / jsx 6343)
 *   br   → rgbToHex                       (js 9580 / jsx 6352)
 *   xr   → adjustColorLuminance           (js 9589 / jsx 6355)
 *   Sr   → resolveSchemeColor             (js 9596 / jsx 6362)
 *   Cr   → resolveThemeTypeface           (js 9601 / jsx 6367)
 *   wr   → defaultRunFontFromXml          (js 9610 / jsx 6370)
 *   Tr   → colorFromXmlElement            (js 9624 / jsx 6377)
 *   Er   → isColorElement                 (js 9651 / jsx 6389)
 *   Dr   → findColorElement               (js 9657 / jsx 6392)
 *   Or   → resolveShapeFillColor          (js 9663 / jsx 6398)
 *   kr   → resolveShapeLineProperties     (js 9692 / jsx 6409)
 *   Ar   → normalizeChartLegend           (js 9705 / jsx 6430)
 *   jr   → legendPositionCode             (js 9714 / jsx 6439)
 *   Z    → childNumericVal                (js 9729 / jsx 6453)
 *   Mr   → childBooleanVal                (js 9734 / jsx 6458)
 *   Nr   → runFontSizePt                  (js 9741 / jsx 6465)
 *   Pr   → dataLabelSpecs                 (js 9747 / jsx 6471)
 *   Fr   → normalizeDataLabels            (js 9770 / jsx 6494)
 *   Ir   → partRelationshipMap            (js 9793 / jsx 6509)
 *   Lr   → themeColorList                 (js 9807 / jsx 6523)
 *   Rr   → chartStyleColors               (js 9818 / jsx 6529)
 *   zr   → accentColorPalette             (js 9848 / jsx 6559)
 *   Br   → normalizeChartStyleId          (js 9852 / jsx 6563)
 *   Vr   → surfaceChartPalette            (js 9855 / jsx 6566)
 *   Hr   → applySurfaceChartDefaults      (js 9863 / jsx 6570)
 *   Ur   → applyChartStyleDefaults        (js 9886 / jsx 6590)
 *   Wr   → dataPointOverridesFromElement  (js 9933 / jsx 6621)
 *   Gr   → invertedPointStyle             (js 9949 / jsx 6637)
 *   Kr   → referencePointsFromElement     (js 9956 / jsx 6650)
 *   qr   → multiLevelRefPoints            (js 9975 / jsx 6671)
 *   Jr   → applySeriesXmlStyles           (js 10001 / jsx 6700)
 *   Yr   → hydrateChartFromPartXml        (js 10071 / jsx 6758)
 *   Xr   → normalizePartPath              (js 10501 / jsx 7105)
 *   Zr   → partDirectory                  (js 10504 / jsx 7108)
 *   Qr   → resolvePartTarget              (js 10509 / jsx 7113)
 *   $r   → partText                       (js 10535 / jsx 7138)
 *   ei   → parseXmlDocument               (js 10540 / jsx 7143)
 *   ti   → serializeXmlDocument           (js 10548 / jsx 7151)
 *   ni   → childElements                  (js 10551 / jsx 7154)
 *   ri   → removeChildElements            (js 10556 / jsx 7157)
 *   ii   → descendantElements             (js 10559 / jsx 7160)
 *   Q    → firstChild                     (js 10562 / jsx 7163)
 *   ai   → firstDescendant                (js 10565 / jsx 7166)
 *   oi   → ensureChildElement             (js 10568 / jsx 7169)
 *   si   → ensureChildTextElement         (js 10574 / jsx 7175)
 *   ci   → ensureBooleanChildElement      (js 10578 / jsx 7179)
 *   li   → ensureIntegerChildElement      (js 10582 / jsx 7183)
 *   ui   → unquoteSheetName               (js 10586 / jsx 7187)
 *   di   → splitSheetReference            (js 10590 / jsx 7191)
 *   fi   → parseCellRef                   (js 10603 / jsx 7206)
 *   pi   → parseRangeRef                  (js 10610 / jsx 7216)
 *   mi   → columnLetters                  (js 10621 / jsx 7231)
 *   hi   → formatAbsoluteRangeRef         (js 10630 / jsx 7240)
 *   gi   → resolveFormulaRange            (js 10633 / jsx 7243)
 *   _i   → resolveRangeTitle              (js 10649 / jsx 7274)
 *   vi   → readRangeStrings               (js 10669 / jsx 7288)
 *   yi   → normalizeLegendModel           (js 10692 / jsx 7307)
 *   bi   → titleCaseLabel                 (js 10698 / jsx 7317)
 *   xi   → normalizeAxisModel             (js 10706 / jsx 7320)
 *   Si   → chartExLayoutType              (js 10733 / jsx 7345)
 *   Ci   → chartExLayoutId                (js 10755 / jsx 7367)
 *   wi   → chartExAxisIds                 (js 10764 / jsx 7372)
 *   Ti   → niceBinSize                    (js 10781 / jsx 7377)
 *   Ei   → formatBinInterval              (js 10787 / jsx 7383)
 *   Di   → computeHistogramBins           (js 10792 / jsx 7388)
 *   Oi   → applyHistogramBinning          (js 10844 / jsx 7430)
 *   ki   → buildParetoSeries              (js 10867 / jsx 7449)
 *   Ai   → chartExTextValue               (js 10889 / jsx 7471)
 *   ji   → chartExTitleText               (js 10897 / jsx 7479)
 *   Mi   → hierarchyCategoryRef           (js 10906 / jsx 7485)
 *   Ni   → buildChartExSeries             (js 10919 / jsx 7498)
 *   Pi   → filterChartExSeries            (js 10995 / jsx 7564)
 *   Fi   → buildChartExModel              (js 11010 / jsx 7585)
 *   Ii   → cellValueToNumber              (js 11112 / jsx 7688)
 *   Li   → cellValueToString              (js 11135 / jsx 7708)
 *   Ri   → readFormulaValues              (js 11149 / jsx 7720)
 *   zi   → resolveFormulaText             (js 11171 / jsx 7736)
 *   Bi   → normalizeSeriesRef             (js 11182 / jsx 7741)
 *   Vi   → normalizeChartExAxis           (js 11192 / jsx 7751)
 *   Hi   → mergeAxisModel                 (js 11234 / jsx 7784)
 *   Ui   → axisModelFromElement           (js 11237 / jsx 7790)
 *   Wi   → wallModelFromElement           (js 11279 / jsx 7820)
 *   Gi   → normalizeDataLabelsModel       (js 11290 / jsx 7831)
 *   Ki   → normalizeAnchorModel           (js 11338 / jsx 7859)
 *   qi   → anchorMarkerFromElement        (js 11398 / jsx 7926)
 *   Ji   → anchorFromElement              (js 11413 / jsx 7939)
 *   Yi   → isAnchorInverted               (js 11446 / jsx 7981)
 *   Xi   → buildJsonChartSeries           (js 11456 / jsx 7987)
 *   Zi   → buildJsonChartTypeGroup        (js 11501 / jsx 8022)
 *   Qi   → buildChartsheetTab             (js 11519 / jsx 8038)
 *   $i   → buildSheetTabList              (js 11531 / jsx 8050)
 *   ea   → drawingChartRefs               (js 11584 / jsx 8089)
 *   ta   → assignChartOrigins             (js 11636 / jsx 8129)
 *   na   → hydrateChartAssets             (js 11661 / jsx 8148) ·export
 *   ra   → chartAnchorElements            (js 11786 / jsx 8255)
 *   ia   → writeAnchorMarker              (js 11800 / jsx 8261)
 *   aa   → writeAnchorGeometry            (js 11807 / jsx 8264)
 *   oa   → writeChartTitle                (js 11829 / jsx 8280)
 *   sa   → writeRefFormula                (js 11851 / jsx 8297)
 *   ca   → writeSeriesName                (js 11858 / jsx 8304)
 *   la   → writeSeriesFormulas            (js 11869 / jsx 8315)
 *   ua   → writeAxisProperties            (js 11911 / jsx 8329)
 *   da   → writeDataLabelFlags            (js 11955 / jsx 8345)
 *   fa   → updateChartAnchorInImageAssets (js 11965 / jsx 8350) ·export
 *   pa   → updateChartInImageAssets       (js 11980 / jsx 8360) ·export
 *   ma   → normalizeStyleHex              (js 12007 / jsx 8372)
 *   ha   → styleHexToRgb                  (js 12015 / jsx 8376)
 *   ga   → styleRgbToHsl                  (js 12026 / jsx 8383)
 *   _a   → styleHueChannel                (js 12050 / jsx 8407)
 *   va   → styleHslToRgb                  (js 12058 / jsx 8411)
 *   ya   → styleRgbToHex                  (js 12071 / jsx 8420)
 *   ba   → adjustColorTint                (js 12074 / jsx 8423)
 *   xa   → resolveFontColor               (js 12082 / jsx 8431) ·export
 *   Sa   → resolveSolidFillColor          (js 12096 / jsx 8443)
 *   Ca   → resolveFillColor               (js 12105 / jsx 8446) ·export
 * [P2] OOXML 写回/序列化（js 12131–14130 / jsx 8474–10419）：
 *   wa   → officeRelationshipsNamespace   (js 12131 / jsx 8474)
 *   Ta   → packageRelationshipsNamespace  (js 12132 / jsx 8475)
 *   Ea   → spreadsheetMlNamespace         (js 12133 / jsx 8476)
 *   Da   → contentTypesNamespace          (js 12134 / jsx 8477)
 *   Oa   → drawingRelNamespace            (js 12135 / jsx 8478)
 *   ka   → imageRelNamespace              (js 12136 / jsx 8479)
 *   Aa   → drawingContentType             (js 12137 / jsx 8480)
 *   ja   → emuPerPixel                    (js 12138 / jsx 8481)
 *   Ma   → minColumnWidthPx               (js 12139 / jsx 8482)
 *   Na   → minRowHeightPx                 (js 12140 / jsx 8483)
 *   Pa   → maxColumnWidthEmu              (js 12141 / jsx 8484)
 *   Fa   → defaultRowHeightEmu            (js 12142 / jsx 8485)
 *   Ia   → defaultCharWidthPx             (js 12143 / jsx 8486)
 *   La   → charWidthCache                 (js 12144 / jsx 8487)
 *   Ra   → devicePixelSnap                (js 12145 / jsx 8488)
 *   za   → measureCharWidth               (js 12150 / jsx 8493)
 *   Ba   → columnWidthToPixels            (js 12171 / jsx 8509)
 *   Va   → defaultColumnWidthPx           (js 12177 / jsx 8515)
 *   Ha   → defaultRowHeightPx             (js 12181 / jsx 8519)
 *   Ua   → hiddenRowIndices               (js 12185 / jsx 8523)
 *   Wa   → hiddenColumnIndices            (js 12191 / jsx 8529)
 *   Ga   → mergeSpanSummary               (js 12197 / jsx 8535)
 *   Ka   → themePaletteModel              (js 12231 / jsx 8566)
 *   qa   → copyToUint8Array               (js 12259 / jsx 8578)
 *   Ja   → normalizeZipPath               (js 12263 / jsx 8582)
 *   Ya   → joinZipPath                    (js 12266 / jsx 8585)
 *   Xa   → zipPathDir                     (js 12269 / jsx 8588)
 *   Za   → resolveZipPath                 (js 12274 / jsx 8593)
 *   Qa   → relativeZipPath                (js 12289 / jsx 8607)
 *   $a   → zipRelsPath                    (js 12298 / jsx 8616)
 *   eo   → parseXmlStrict                 (js 12302 / jsx 8620)
 *   to   → serializeXmlWb                 (js 12306 / jsx 8624)
 *   no   → zipEntryTextWb                 (js 12309 / jsx 8627)
 *   ro   → columnLettersToIndex           (js 12313 / jsx 8631)
 *   io   → parseCellAddress               (js 12321 / jsx 8639)
 *   ao   → parseRangeAddress              (js 12328 / jsx 8649)
 *   oo   → stripSheetPrefix               (js 12334 / jsx 8658)
 *   so   → rangeStartCell                 (js 12339 / jsx 8663)
 *   co   → rangeAddressPart               (js 12342 / jsx 8666)
 *   lo   → isElementNodeWb                (js 12345 / jsx 8669)
 *   uo   → descendantElementsWb           (js 12348 / jsx 8672)
 *   fo   → childElementsWb                (js 12351 / jsx 8675)
 *   $    → firstChildWb                   (js 12354 / jsx 8678)
 *   po   → firstDescendantWb              (js 12357 / jsx 8681)
 *   mo   → featurePropertyBagTypes        (js 12360 / jsx 8684)
 *   ho   → relationIdAttr                 (js 12392 / jsx 8704)
 *   go   → relationEmbedAttr              (js 12395 / jsx 8707)
 *   _o   → setChildText                   (js 12398 / jsx 8710)
 *   vo   → writeMarkerText                (js 12402 / jsx 8714)
 *   yo   → contentTypeMaps                (js 12409 / jsx 8717)
 *   bo   → contentTypeForPart             (js 12428 / jsx 8745)
 *   xo   → relationshipMapForPart         (js 12435 / jsx 8752)
 *   So   → workbookSheetEntries           (js 12452 / jsx 8771)
 *   Co   → parseTheme                     (js 12467 / jsx 8789)
 *   wo   → parseColorAttributes           (js 12515 / jsx 8817)
 *   To   → booleanFlagAttr                (js 12530 / jsx 8826)
 *   Eo   → parseSparklineGroups           (js 12535 / jsx 8831)
 *   Do   → parseFontElement               (js 12576 / jsx 8869)
 *   Oo   → parseFillElement               (js 12605 / jsx 8881)
 *   ko   → parseBorderSide                (js 12638 / jsx 8913)
 *   Ao   → parseBorderElement             (js 12644 / jsx 8922)
 *   jo   → parseAlignmentElement          (js 12655 / jsx 8930)
 *   Mo   → parseDxfElement                (js 12677 / jsx 8945)
 *   No   → resolveXfStyle                 (js 12686 / jsx 8954)
 *   Po   → parseStylesPart                (js 12700 / jsx 8967)
 *   Fo   → parseSqrefRanges               (js 12762 / jsx 9036)
 *   Io   → parseCfvo                      (js 12773 / jsx 9042)
 *   Lo   → optionalBooleanAttr            (js 12781 / jsx 9053)
 *   Ro   → parseConditionalRule           (js 12786 / jsx 9058)
 *   zo   → parseConditionalRuleExt        (js 12834 / jsx 9110)
 *   Bo   → mergeConditionalRules          (js 12894 / jsx 9163)
 *   Vo   → parseConditionalFormatting     (js 12932 / jsx 9192)
 *   Ho   → parseSheetLayout               (js 12967 / jsx 9222)
 *   Uo   → clampColorChannel              (js 13057 / jsx 9301)
 *   Wo   → normalizeArgbHex               (js 13060 / jsx 9304)
 *   Go   → hexToRgbObject                 (js 13068 / jsx 9308)
 *   Ko   → rgbChannelsToHex               (js 13076 / jsx 9316)
 *   qo   → applyColorTransforms           (js 13079 / jsx 9319)
 *   Jo   → schemeColorFromTheme           (js 13112 / jsx 9355)
 *   Yo   → drawingColorFromElement        (js 13117 / jsx 9365)
 *   Xo   → drawingSolidFill               (js 13135 / jsx 9370)
 *   Zo   → resolveSchemeTypefaceWb        (js 13140 / jsx 9375)
 *   Qo   → isSchemeTypeface               (js 13148 / jsx 9378)
 *   $o   → runTypefaceFromElement         (js 13151 / jsx 9381)
 *   es   → textRunStyleFromElement        (js 13160 / jsx 9386)
 *   ts   → mergeRunStyles                 (js 13173 / jsx 9401)
 *   ns   → markerPointFromText            (js 13189 / jsx 9411)
 *   rs   → anchorModelToXml               (js 13200 / jsx 9422)
 *   is   → normalizeDrawingAnchor         (js 13226 / jsx 9458) ·export
 *   as   → captionColorSpec               (js 13255 / jsx 9489)
 *   os   → captionFontSpec                (js 13270 / jsx 9523)
 *   ss   → captionSpec                    (js 13286 / jsx 9538)
 *   cs   → resolveCaptionTextColor        (js 13293 / jsx 9548)
 *   ls   → captionDisplayProps            (js 13312 / jsx 9567)
 *   us   → formControlDisplayProps        (js 13326 / jsx 9581)
 *   ds   → buildFormControlModel          (js 13402 / jsx 9667)
 *   fs   → buildFormControlsBySheet       (js 13422 / jsx 9687)
 *   ps   → normalizeLabelText             (js 13432 / jsx 9699)
 *   ms   → legacyAnchorFromElement        (js 13440 / jsx 9704)
 *   hs   → anchorEmuRect                  (js 13472 / jsx 9749)
 *   gs   → columnWidthPxAt                (js 13484 / jsx 9767)
 *   _s   → rowHeightPxAt                  (js 13487 / jsx 9770)
 *   vs   → columnOffsetPx                 (js 13490 / jsx 9773)
 *   ys   → rowOffsetPx                    (js 13495 / jsx 9778)
 *   bs   → anchorRectPx                   (js 13500 / jsx 9783)
 *   xs   → rectToAbsoluteAnchor           (js 13515 / jsx 9802)
 *   Ss   → xfrmFromElement                (js 13518 / jsx 9815)
 *   Cs   → applyChildTransform            (js 13534 / jsx 9829)
 *   ws   → resolveGroupChildTransform     (js 13542 / jsx 9837)
 *   Ts   → shapeTransformFromXfrm         (js 13578 / jsx 9865)
 *   Es   → textAlignFromDrawing           (js 13601 / jsx 9888)
 *   Ds   → verticalAlignFromDrawing       (js 13615 / jsx 9902)
 *   Os   → drawingAnchorElements          (js 13625 / jsx 9912)
 *   ks   → bytesToObjectUrl               (js 13636 / jsx 9915)
 *   As   → isConnectorGeometry            (js 13645 / jsx 9926)
 *   js   → drawingLineProps               (js 13648 / jsx 9929)
 *   Ms   → drawingFillProps               (js 13665 / jsx 9948)
 *   Ns   → pathPointAttr                  (js 13672 / jsx 9961)
 *   Ps   → customGeometryPath             (js 13678 / jsx 9970)
 *   Fs   → geometryAdjustValues           (js 13709 / jsx 10004)
 *   Is   → drawingParagraphs              (js 13724 / jsx 10016)
 *   Ls   → drawingTextBoxProps            (js 13785 / jsx 10068)
 *   Rs   → drawingHyperlinkTarget         (js 13799 / jsx 10087)
 *   zs   → drawingImageFromPic            (js 13804 / jsx 10092)
 *   Bs   → drawingShapeFromSp             (js 13831 / jsx 10119)
 *   Vs   → collectDrawingShapes           (js 13863 / jsx 10151)
 *   Hs   → parseDrawingPart               (js 13899 / jsx 10188)
 *   Us   → syncFormControls               (js 13922 / jsx 10222) ·export
 *   Ws   → disposeImageAssets             (js 13925 / jsx 10225) ·export
 *   Gs   → parseWorkbookMetadata          (js 13928 / jsx 10228)
 *   Ks   → parseWorkbookImageAssets       (js 13948 / jsx 10255) ·export
 *   qs   → writeAnchorGeometryWb          (js 14009 / jsx 10314)
 *   Js   → updateImageRect                (js 14031 / jsx 10330) ·export
 *   Ys   → ensureRelsDocument             (js 14049 / jsx 10351)
 *   Xs   → ensureContentTypesDocument     (js 14059 / jsx 10359)
 *   Zs   → ensureContentTypeEntry         (js 14067 / jsx 10367)
 *   Qs   → removeDrawingRefs              (js 14102 / jsx 10398)
 *   $s   → nextDrawingRelationId          (js 14108 / jsx 10401)
 *   ec   → appendDrawingElement           (js 14118 / jsx 10407)
 *   tc   → saveXlsxWithAssets             (js 14130 / jsx 10419) ·export
 * [P3] 公式/计算与网格助手（js 14131–14340 / jsx 10465–10625）：
 *   nc   → emuToPx                        (js 14191 / jsx 10465) ·export
 *   rc   → pxToEmu                        (js 14194 / jsx 10468)
 *   ic   → pxToColumnWidthUnits           (js 14197 / jsx 10471) ·export
 *   ac   → columnWidthToPx                (js 14200 / jsx 10474) ·export
 *   oc   → rowHeightToPx                  (js 14203 / jsx 10477) ·export
 *   sc   → snapGridSize                   (js 14206 / jsx 10480) ·export
 *   cc   → pxFromGridSize                 (js 14209 / jsx 10483) ·export
 *   lc   → pixelToGridIndex               (js 14212 / jsx 10486)
 *   uc   → rectToDrawingAnchor            (js 14222 / jsx 10499) ·export
 *   dc   → resizeRectWithHandle           (js 14259 / jsx 10548) ·export
 *   fc   → sheetReferenceRegex            (js 14274 / jsx 10560)
 *   pc   → collectFormulaSheetRefs        (js 14275 / jsx 10561)
 *   mc   → hasUnresolvedSheetRefs         (js 14299 / jsx 10584)
 *   hc   → calculateWorkbookSafe          (js 14311 / jsx 10596)
 *   gc   → ensureWorkbookCalculated       (js 14331 / jsx 10625) ·export
 * [P4] wasm 桥（js 14341–14474 / jsx 10638–10770）：
 *   _c   → cachedWasmModulePromise        (js 14341 / jsx 10638)
 *   vc   → wasmSourceExplicitlySet        (js 14342 / jsx 10639)
 *   yc   → rawWasmSource                  (js 14343 / jsx 10640)
 *   bc   → resolvedWasmSource             (js 14344 / jsx 10641)
 *   xc   → copyToStandaloneBuffer         (js 14345 / jsx 10642)
 *   Sc   → normalizeWasmSource            (js 14350 / jsx 10647)
 *   Cc   → setDukeSheetsWasmSource        (js 14357 / jsx 10654) ·export
 *   wc   → isWasmSourceAvailable          (js 14360 / jsx 10657) ·export
 *   Tc   → getDukeSheetsWasmSource        (js 14363 / jsx 10660)
 *   Ec   → loadDukeSheetsWasmModule       (js 14366 / jsx 10663) ·export
 *   Dc   → createAbortError               (js 14382 / jsx 10668)
 *   Oc   → XlsxWorkerClient               (js 14387 / jsx 10673) ·export
 *   kc   → cloneArrayBuffer               (js 14474 / jsx 10770)
 * [P5] 模型/错误/常量（js 14475–15671 / jsx 10773–11903）：
 *   Ac   → backslashCharCode              (js 14477 / jsx 10773)
 *   jc   → slashCharCode                  (js 14478 / jsx 10774)
 *   Mc   → zipEndOfCentralDirSignature    (js 14479 / jsx 10775)
 *   Nc   → zipCentralDirSignature         (js 14480 / jsx 10776)
 *   Pc   → zipLocalHeaderSignature        (js 14481 / jsx 10777)
 *   Fc   → zipEndOfCentralDirSize         (js 14482 / jsx 10778)
 *   Ic   → zipCentralDirEntrySize         (js 14483 / jsx 10779)
 *   Lc   → zipLocalHeaderSize             (js 14484 / jsx 10780)
 *   Rc   → zipMaxCommentLength            (js 14485 / jsx 10781)
 *   zc   → zipMaxEntryCount               (js 14486 / jsx 10782)
 *   Bc   → zip64MagicValue                (js 14487 / jsx 10783)
 *   Vc   → findEndOfCentralDir            (js 14488 / jsx 10784)
 *   Hc   → readEndOfCentralDir            (js 14497 / jsx 10793)
 *   Uc   → readCentralDirEntry            (js 14511 / jsx 10811)
 *   Wc   → entryNameHasBackslash          (js 14529 / jsx 10827)
 *   Gc   → hasBackslashEntries            (js 14533 / jsx 10831)
 *   Kc   → zipEntryName                   (js 14543 / jsx 10841)
 *   qc   → validateZipStructure           (js 14551 / jsx 10849)
 *   Jc   → sanitizeBackslashNames         (js 14586 / jsx 10877)
 *   Yc   → sanitizeZipBytes               (js 14601 / jsx 10892)
 *   Xc   → normalizeWorkbookBytes         (js 14608 / jsx 10899) ·export
 *   Zc   → saveDebounceMs                 (js 14617 / jsx 10907)
 *   Qc   → defaultRowHeight               (js 14618 / jsx 10908) ·export
 *   $c   → defaultColumnWidth             (js 14619 / jsx 10909) ·export
 *   el   → xlsxMimeType                   (js 14620 / jsx 10910) ·export
 *   tl   → csvMimeType                    (js 14621 / jsx 10911) ·export
 *   nl   → minSheetRowHeightPx            (js 14622 / jsx 10912)
 *   rl   → headerRowHeightPx              (js 14623 / jsx 10913) ·export
 *   il   → rowHeaderWidthPx               (js 14624 / jsx 10914) ·export
 *   al   → undoEntryLimit                 (js 14625 / jsx 10915)
 *   ol   → rangeClipboardMimeType         (js 14626 / jsx 10916) ·export
 *   sl   → deferLoadingDefault            (js 14627 / jsx 10917) ·export
 *   cl   → maxFileSizeDefault             (js 14628 / jsx 10918) ·export
 *   ll   → maxWorksheetXmlBytes           (js 14629 / jsx 10919)
 *   ul   → maxSharedStringsBytes          (js 14630 / jsx 10920)
 *   dl   → maxTotalWorksheetBytes         (js 14631 / jsx 10921)
 *   fl   → defaultZoomPercent             (js 14632 / jsx 10922)
 *   pl   → minZoomScale                   (js 14633 / jsx 10923) ·export
 *   ml   → maxZoomScale                   (js 14634 / jsx 10924) ·export
 *   hl   → zoomStepPercent                (js 14635 / jsx 10925)
 *   gl   → defaultTabId                   (js 14636 / jsx 10926) ·export
 *   _l   → normalizeVisibility            (js 14637 / jsx 10927)
 *   vl   → clampZoomScale                 (js 14640 / jsx 10930) ·export
 *   yl   → defaultZoomForSheet            (js 14643 / jsx 10933) ·export
 *   bl   → resolveZoomScale               (js 14646 / jsx 10936)
 *   xl   → stepZoomScale                  (js 14654 / jsx 10939) ·export
 *   Sl   → formatByteSize                 (js 14659 / jsx 10942)
 *   Cl   → findEocdrOffset                (js 14667 / jsx 10950)
 *   wl   → readZipCentralDirectory        (js 14674 / jsx 10956)
 *   Tl   → checkSheetLimits               (js 14700 / jsx 10985) ·export
 *   El   → sheetLimitError                (js 14721 / jsx 11006) ·export
 *   Dl   → XlsxFileSizeLimitExceededError (js 14726 / jsx 11009) ·export
 *   Ol   → deriveDisplayFileName          (js 14736 / jsx 11016) ·export
 *   kl   → expandUsedRange                (js 14748 / jsx 11028)
 *   Al   → buildSheetStates               (js 14765 / jsx 11038) ·export
 *   jl   → collectSheetOrigins            (js 14903 / jsx 11181) ·export
 *   Ml   → defaultCellStyleAt             (js 14906 / jsx 11184) ·export
 *   Nl   → columnIndexToLetters           (js 14913 / jsx 11191)
 *   Pl   → cellAddress                    (js 14919 / jsx 11197) ·export
 *   Fl   → parseCellAddressString         (js 14922 / jsx 11200)
 *   Il   → parseRangeString               (js 14930 / jsx 11211)
 *   Ll   → resolveInputRange              (js 14936 / jsx 11220) ·export
 *   Rl   → hexToRgbArray                  (js 14961 / jsx 11248)
 *   zl   → normalizeColorSpec             (js 14967 / jsx 11252)
 *   Bl   → normalizeFontSpec              (js 15004 / jsx 11295)
 *   Vl   → normalizeCaptionSpec           (js 15019 / jsx 11310)
 *   Hl   → formControlKindFromInput       (js 15028 / jsx 11324) ·export
 *   Ul   → formControlKindToSpec          (js 15061 / jsx 11371) ·export
 *   Wl   → normalizeDrawing               (js 15075 / jsx 11386) ·export
 *   Gl   → formControlDrawingSpec         (js 15092 / jsx 11407) ·export
 *   Kl   → syncGroupBoxes                 (js 15105 / jsx 11424) ·export
 *   ql   → formControlKindChanged         (js 15120 / jsx 11431) ·export
 *   Jl   → normalizeFreezePanes           (js 15143 / jsx 11448)
 *   Yl   → normalizeDataValidations       (js 15149 / jsx 11457)
 *   Xl   → normalizeRange                 (js 15179 / jsx 11481) ·export
 *   Zl   → rangeToRef                     (js 15185 / jsx 11493) ·export
 *   Ql   → rangeContainsCell              (js 15191 / jsx 11499) ·export
 *   $l   → worksheetTables                (js 15195 / jsx 11503) ·export
 *   eu   → nonNegativeIntParam            (js 15231 / jsx 11529)
 *   tu   → booleanParam                   (js 15239 / jsx 11537)
 *   nu   → fileBaseName                   (js 15249 / jsx 11547) ·export
 *   ru   → pxToRowHeightUnits             (js 15254 / jsx 11552) ·export
 *   iu   → colorHexOnly                   (js 15257 / jsx 11555)
 *   au   → borderCss                      (js 15262 / jsx 11560) ·export
 *   ou   → normalizeDisplayValue          (js 15266 / jsx 11586) ·export
 *   su   → copyBytes                      (js 15276 / jsx 11589) ·export
 *   cu   → workbookSavePayload            (js 15280 / jsx 11593) ·export
 *   lu   → pushUndoEntry                  (js 15297 / jsx 11604) ·export
 *   uu   → cloneCellValue                 (js 15300 / jsx 11607) ·export
 *   du   → cloneCellStyle                 (js 15303 / jsx 11610) ·export
 *   fu   → parseCellValueInput            (js 15315 / jsx 11621) ·export
 *   pu   → applyCellMutation              (js 15326 / jsx 11632) ·export
 *   mu   → escapeHtml                     (js 15330 / jsx 11635) ·export
 *   hu   → parseClipboardText             (js 15338 / jsx 11638) ·export
 *   gu   → createAbortErrorLocal          (js 15353 / jsx 11645)
 *   _u   → isAbortError                   (js 15358 / jsx 11650) ·export
 *   vu   → resolveWorkbookSource          (js 15361 / jsx 11653) ·export
 *   yu   → parseWorkbook                  (js 15381 / jsx 11673) ·export
 *   bu   → scheduleIdleWork               (js 15391 / jsx 11691) ·export
 *   xu   → mimeTypeFromImageUrl           (js 15411 / jsx 11710)
 *   Su   → imageFormatMimeType            (js 15427 / jsx 11718)
 *   Cu   → bytesToBlobUrl                 (js 15440 / jsx 11731)
 *   wu   → worksheetImageModel            (js 15453 / jsx 11741)
 *   Tu   → worksheetImagesBySheet         (js 15480 / jsx 11768)
 *   Eu   → anchorSignature                (js 15494 / jsx 11781)
 *   Du   → hiddenImageAnchorSignatures    (js 15525 / jsx 11784)
 *   Ou   → mergeImageAssets               (js 15534 / jsx 11789)
 *   ku   → isZipSignature                 (js 15579 / jsx 11826)
 *   Au   → isOleSignature                 (js 15582 / jsx 11829)
 *   ju   → shouldSkipXmlParsing           (js 15595 / jsx 11832) ·export
 *   Mu   → emptyImageAssets               (js 15598 / jsx 11835)
 *   Nu   → buildImageAssets               (js 15617 / jsx 11864) ·export
 *   Pu   → downloadFileSource             (js 15628 / jsx 11877) ·export
 *   Fu   → exportBlob                     (js 15639 / jsx 11885) ·export
 *   Iu   → exportTextFile                 (js 15652 / jsx 11895) ·export
 *   Lu   → downloadUrlFile                (js 15663 / jsx 11903) ·export
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨段/跨 chunk；本文件以 `declare const _: any` 挂接，
 *     括号内 = 定义处行号；均不属本批 9111–15671 范围）
 * ----------------------------------------------------------------------------
 *  chunk 导入（chunk 行号）：
 *   1. e  = interop require（chunk-Cq_f4orQ.js 导出 s，chunk 行 1）
 *   2. n  = react 装载器（react-BQLj9xdT.js 导出 t，chunk 行 2）
 *   3. Ln = regl 惰性 CommonJS 包装器（vendored 顶层，js 1835）
 *   4. i  = jsx-runtime 装载器（jsx-runtime-B5yMD3-t.js 导出 t，chunk 行 4）
 *   5. o  = preload-helper 惰性 import 记忆化（preload-helper-BHSF1fZ9.js
 *           导出 t，chunk 行 6）
 *   6. N  = 字节→字符串（browser-BrD0k0WI.js 导出 t，chunk 行 27）
 *   7. M  = zip 读取器（browser-BrD0k0WI.js 导出 r，chunk 行 27）
 *   8. j  = 字符串→字节（browser-BrD0k0WI.js 导出 n，chunk 行 27）
 *   9. A  = zip 写入器（browser-BrD0k0WI.js 导出 i，chunk 行 27）
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 外部依赖挂接（行号在案，见上 §二；深层模型为私有引擎内部结构，类型从宽）
// ----------------------------------------------------------------------------
declare const e: any; // interop require（chunk-Cq_f4orQ.js 导出 s，chunk 行 1）
declare const n: any; // react 装载器（react-BQLj9xdT.js 导出 t，chunk 行 2）
declare const Ln: any; // regl 惰性 CommonJS 包装器（vendored 顶层，js 1835，t(...) 包装）
declare const i: any; // jsx-runtime 装载器（jsx-runtime-B5yMD3-t.js 导出 t，chunk 行 4）
declare const o: any; // preload-helper 惰性 import 记忆化（preload-helper-BHSF1fZ9.js 导出 t，chunk 行 6）
declare const N: any; // 字节→字符串（browser-BrD0k0WI.js 导出 t，chunk 行 27）
declare const M: any; // zip 读取器（browser-BrD0k0WI.js 导出 r，chunk 行 27）
declare const j: any; // 字符串→字节（browser-BrD0k0WI.js 导出 n，chunk 行 27）
declare const A: any; // zip 写入器（browser-BrD0k0WI.js 导出 i，chunk 行 27）

export var reactInterop = e(n(), 1),
  reglInterop = e(Ln(), 1),
  jsxRuntime = i(),
  chartXmlNamespace = `http://schemas.openxmlformats.org/drawingml/2006/chart`,
  drawingXmlNamespace = `http://schemas.openxmlformats.org/drawingml/2006/main`,
  chartRelNamespace = `http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart`,
  chartExRelNamespace = `http://schemas.microsoft.com/office/2014/relationships/chartEx`,
  chartStyleRelNamespace = `http://schemas.microsoft.com/office/2011/relationships/chartStyle`,
  chartColorStyleRelNamespace = `http://schemas.microsoft.com/office/2011/relationships/chartColorStyle`,
  officeChartPalette = [
    `#4472c4`,
    `#ed7d31`,
    `#a5a5a5`,
    `#ffc000`,
    `#5b9bd5`,
    `#70ad47`,
    `#264478`,
    `#9e480e`,
    `#636363`,
    `#997300`,
  ];
function quoteFormulaString(e: any) {
  return `"${e.replace(/"/g, `""`)}"`;
}
function unquoteFormulaString(e: any) {
  let t = e.trim();
  return t.length < 2 || !t.startsWith(`"`) || !t.endsWith(`"`)
    ? null
    : t.slice(1, -1).replace(/""/g, `"`);
}
function splitFormulaArgs(e: any) {
  let t = [],
    n: any = ``,
    r: any = !1,
    i = !1,
    a = 0;
  for (let o = 0; o < e.length; o += 1) {
    let s = e[o] ?? ``,
      c = e[o + 1] ?? ``;
    if (r) {
      ((n += s), s === `"` && c === `"` ? ((n += c), (o += 1)) : s === `"` && (r = !1));
      continue;
    }
    if (i) {
      ((n += s), s === `'` && c === `'` ? ((n += c), (o += 1)) : s === `'` && (i = !1));
      continue;
    }
    if (s === `"`) {
      ((r = !0), (n += s));
      continue;
    }
    if (s === `'`) {
      ((i = !0), (n += s));
      continue;
    }
    if (s === `(`) {
      ((a += 1), (n += s));
      continue;
    }
    if (s === `)`) {
      ((a = Math.max(0, a - 1)), (n += s));
      continue;
    }
    if (s === `,` && a === 0) {
      (t.push(n.trim()), (n = ``));
      continue;
    }
    n += s;
  }
  return (t.push(n.trim()), t);
}
function seriesRawName(e: any) {
  let t = e.raw && typeof e.raw == `object` ? e.raw : null;
  return typeof t?.name == `string` && t.name.length > 0 ? t.name : null;
}
export function chartSeriesFormula(e: any, t: any) {
  let n = e?.series[t];
  if (!e || !n) return ``;
  let r = seriesRawName(n) ?? quoteFormulaString(n.name ?? `Series ${t + 1}`),
    i = n.categoriesRef?.formula ?? ``,
    a = n.valuesRef?.formula ?? ``,
    o = String(t + 1),
    s = n.bubbleSizeRef?.formula;
  return (
    [`=SERIES(${r}`, i, a, o, ...(e.chartType === `Bubble` || s ? [s ?? ``] : [])].join(`,`) + `)`
  );
}
function parseSeriesFormula(e: any, t: any) {
  let n = e.trim(),
    r: any = n.startsWith(`=`) ? n.slice(1).trim() : n,
    i = /^SERIES\s*\(([\s\S]*)\)$/i.exec(r);
  if (!i) return null;
  let a = splitFormulaArgs(i[1]),
    o = t?.chartType === `Bubble`;
  if (a.length < 4 || a.length > 5 || (o && a.length !== 5)) return null;
  let [s = ``, c = ``, l = ``, u = ``, d] = a;
  if (!c || !l) return null;
  let f = Number(u);
  if (!Number.isFinite(f)) return null;
  let p = unquoteFormulaString(s);
  return {
    bubbleSizeFormula: d && d.length > 0 ? d : void 0,
    categoryFormula: c,
    nameFormula: p == null && s.length > 0 ? s : void 0,
    nameLiteral: p ?? void 0,
    order: f,
    valueFormula: l,
  };
}
export function updateChartSeriesValues(e: any, t: any, n: any, r: any) {
  let i = parseSeriesFormula(n, e),
    a = e.series[t];
  if (!i || !a) return null;
  let o = { ...(a.categoriesRef ?? {}), formula: i.categoryFormula },
    s = { ...(a.valuesRef ?? {}), formula: i.valueFormula },
    c =
      e.chartType === `Bubble` || i.bubbleSizeFormula
        ? { ...(a.bubbleSizeRef ?? {}), formula: i.bubbleSizeFormula }
        : (a.bubbleSizeRef ?? null),
    l = { ...(a.raw ?? {}) };
  i.nameFormula ? (l.name = i.nameFormula) : delete l.name;
  let u = {
    ...a,
    bubbleSizeRef: c,
    bubbleSizes:
      r && c?.formula
        ? readFormulaValues(r, e.workbookSheetIndex, c, `value`).map((e: any) =>
            typeof e == `number` && Number.isFinite(e) ? e : null,
          )
        : a.bubbleSizes,
    categories: r ? readFormulaValues(r, e.workbookSheetIndex, o, `category`) : a.categories,
    categoriesRef: o,
    name:
      i.nameLiteral ??
      (i.nameFormula && r ? resolveFormulaText(r, e.workbookSheetIndex, i.nameFormula) : (i.nameFormula ?? a.name)),
    raw: l,
    values: r
      ? readFormulaValues(r, e.workbookSheetIndex, s, `value`).map((e: any) =>
          typeof e == `number` && Number.isFinite(e) ? e : null,
        )
      : a.values,
    valuesRef: s,
  };
  return { ...e, series: e.series.map((e: any, n: any) => (n === t ? u : e)) };
}
function normalizeSheetVisibility(e: any) {
  return e === `hidden` || e === `veryHidden` ? e : `visible`;
}
var emuPerPx = 9525,
  themeColorIndices: any = {
    accent1: 4,
    accent2: 5,
    accent3: 6,
    accent4: 7,
    accent5: 8,
    accent6: 9,
    dk1: 1,
    dk2: 3,
    folHlink: 11,
    hlink: 10,
    lt1: 0,
    lt2: 2,
    tx1: 1,
    tx2: 3,
    bg1: 0,
    bg2: 2,
  },
  chartElementTagNames = [
    `barChart`,
    `lineChart`,
    `line3DChart`,
    `stockChart`,
    `radarChart`,
    `scatterChart`,
    `pieChart`,
    `pie3DChart`,
    `doughnutChart`,
    `areaChart`,
    `area3DChart`,
    `bar3DChart`,
    `ofPieChart`,
    `bubbleChart`,
    `surfaceChart`,
    `surface3DChart`,
  ];
function clampUnitValue(e: any) {
  return Math.max(0, Math.min(1, e));
}
function isElementNode(e: any) {
  return e != null && e.nodeType === 1;
}
function normalizeHexColor(e: any) {
  let t = e.replace(/^#/, ``);
  return t.length === 8
    ? `#${t.slice(2).toLowerCase()}`
    : t.length === 6
      ? `#${t.toLowerCase()}`
      : null;
}
function fillColorFromXml(e: any, t: any) {
  if (!e) return;
  let n = e.match(/<a:srgbClr\b[^>]*\bval="([0-9a-fA-F]{6,8})"/i);
  if (n?.[1]) return normalizeHexColor(n[1]) ?? void 0;
  let r =
    e.match(/<a:schemeClr\b[^>]*\bval="([^"]+)"[^>]*>([\s\S]*?)<\/a:schemeClr>/i) ??
    e.match(/<a:schemeClr\b[^>]*\bval="([^"]+)"[^>]*/i);
  if (!r?.[1]) return;
  let i = resolveSchemeColor(r[1], t);
  if (!i) return;
  let a = r[2] ?? ``,
    o: any = 1,
    s = 0;
  for (let e of a.matchAll(/<a:(lumMod|lumOff|tint|shade)\b[^>]*\bval="(-?\d+(?:\.\d+)?)"/gi)) {
    let t = e[1]?.toLowerCase(),
      n: any = Number(e[2] ?? NaN);
    !t ||
      !Number.isFinite(n) ||
      (t === `lummod`
        ? (o *= n / 1e5)
        : t === `lumoff`
          ? (s += n / 1e5)
          : t === `tint`
            ? (s += (1 - s) * (n / 1e5))
            : t === `shade` && (o *= n / 1e5));
  }
  return adjustColorLuminance(i, o, s) ?? void 0;
}
function shapePaintFromXml(e: any, t = !1, n: any) {
  return fillColorFromXml(
    t
      ? (e.match(/<a:ln\b[\s\S]*?<\/a:ln>/i)?.[0] ?? ``)
      : (e.match(/<a:solidFill\b[\s\S]*?<\/a:solidFill>/i)?.[0] ?? ``),
    n,
  );
}
function seriesPaintColorsFromXml(e: any, t: any) {
  let n = e.match(/<c:ser\b[\s\S]*?<\/c:ser>/gi) ?? [];
  return n.length === 0
    ? []
    : n.map((e: any) => {
        let n = e.match(/<c:spPr\b[\s\S]*?<\/c:spPr>/i)?.[0] ?? ``;
        return { color: shapePaintFromXml(n, !1, t), lineColor: shapePaintFromXml(n, !0, t) };
      });
}
function dataPointOverridesFromXml(e: any, t: any) {
  let n = parseXmlDocument(e);
  if (n) {
    let e = descendantElements(n, `ser`).map((e) => {
      let n = [];
      for (let r of childElements(e, `dPt`)) {
        let e = childNumericVal(r, `idx`);
        if (e === void 0) continue;
        let i = firstChild(r, `spPr`),
          a = resolveShapeLineProperties(i, t);
        n.push({
          color: resolveShapeFillColor(i, t) ?? void 0,
          explosion: childNumericVal(r, `explosion`),
          index: e,
          lineColor: a.color ?? void 0,
        });
      }
      return n;
    });
    if (e.some((e) => e.length > 0)) return e;
  }
  let r = e.match(/<c:ser\b[\s\S]*?<\/c:ser>/gi) ?? [];
  return r.length === 0
    ? []
    : r.map((e: any) => {
        let n = e.match(/<c:dPt\b[\s\S]*?<\/c:dPt>/gi) ?? [];
        if (n.length === 0) return [];
        let r = [];
        for (let e of n) {
          let n = e.match(/<c:idx\b[^>]*\bval="(-?\d+)"/i),
            i: any = n?.[1] ? Number(n[1]) : NaN;
          if (!Number.isFinite(i)) continue;
          let a = e.match(/<c:explosion\b[^>]*\bval="(-?\d+(?:\.\d+)?)"/i),
            o: any = a?.[1] ? Number(a[1]) : NaN;
          r.push({
            color: shapePaintFromXml(e, !1, t),
            explosion: Number.isFinite(o) ? o : void 0,
            index: i,
            lineColor: shapePaintFromXml(e, !0, t),
          });
        }
        return r;
      });
}
function numericPointValuesFromXml(e: any) {
  let t = (Array.from(
    e.matchAll(/<c:pt\b[^>]*\bidx="(-?\d+)"[^>]*>[\s\S]*?<c:v>([^<]*)<\/c:v>[\s\S]*?<\/c:pt>/gi),
  ) as any[]);
  if (t.length === 0) return [];
  let n = e.match(/<c:ptCount\b[^>]*\bval="(\d+)"/i),
    r: any = n?.[1] ? Number(n[1]) : NaN,
    i: any = t.reduce((e, t) => {
      let n = Number(t[1] ?? NaN);
      return Number.isFinite(n) ? Math.max(e, n) : e;
    }, -1),
    a = Math.max(t.length, Number.isFinite(r) ? r : 0, i + 1),
    o = (Array.from({ length: a }, () => null) as any[]);
  for (let e of t) {
    let t = Number(e[1] ?? NaN),
      n: any = (e[2] ?? ``).trim(),
      r: any = Number(n);
    !Number.isFinite(t) || t < 0 || !Number.isFinite(r) || (o[t] = r);
  }
  return o;
}
function bubbleSizeValuesFromXml(e: any) {
  let t = e.match(/<c:ser\b[\s\S]*?<\/c:ser>/gi) ?? [];
  return t.length === 0
    ? []
    : t.map((e: any) => {
        let t = e.match(/<c:bubbleSize\b[\s\S]*?<\/c:bubbleSize>/i)?.[0] ?? ``;
        return t ? numericPointValuesFromXml(t) : [];
      });
}
function decodeXmlEntities(e: any) {
  return e
    .replace(/&lt;/g, `<`)
    .replace(/&gt;/g, `>`)
    .replace(/&amp;/g, `&`)
    .replace(/&quot;/g, `"`)
    .replace(/&apos;/g, `'`);
}
function normalizeTitleText(e: any) {
  return (e ?? ``).trim().replace(/\s+/g, ` `).toLowerCase();
}
function chartTitleFromXml(e: any) {
  let t = e.match(/<c:title\b[\s\S]*?<a:t>([\s\S]*?)<\/a:t>/i);
  if (!t?.[1]) return null;
  let n = decodeXmlEntities(t[1]).trim();
  return n.length > 0 ? n : null;
}
function matchBubbleChartValues(e: any, t: any) {
  let n = normalizeTitleText(t),
    r: any = -1 / 0,
    i: any = [];
  for (let [t, a] of Object.entries(e)) {
    if (!/\/charts\/chart\d+\.xml$/i.test(t)) continue;
    let e = N(a);
    if (!/<c:bubbleChart\b/i.test(e)) continue;
    let o = bubbleSizeValuesFromXml(e);
    if (!o.some((e: any) => e.some((e: any) => e != null))) continue;
    let s = 0,
      c = normalizeTitleText(chartTitleFromXml(e));
    if (
      (n.length > 0 && c.length > 0 && n === c && (s += 100),
      i.length === 0 && (s += 1),
      s > r && ((r = s), (i = o), s >= 100))
    )
      break;
  }
  return i;
}
function chartTypeTagFromXml(e: any) {
  for (let t of chartElementTagNames) if (RegExp(`<c:${t}\\b`, `i`).test(e)) return t;
  return ``;
}
function chartTypeElement(e: any) {
  if (!e) return null;
  for (let t of chartElementTagNames) {
    let n = childElements(e, t)[0];
    if (n) return n;
  }
  return null;
}
function scatterChartSubtype(e: any) {
  switch (e) {
    case `line`:
    case `lineMarker`:
      return `ScatterLines`;
    case `smooth`:
    case `smoothMarker`:
      return `ScatterSmooth`;
    default:
      return `Scatter`;
  }
}
function matchDataPointOverrides(e: any, t: any, n: any, r: any) {
  let i = normalizeTitleText(t),
    a = (n ?? ``).trim(),
    o = -1 / 0,
    s = [];
  for (let [t, n] of Object.entries(e)) {
    if (!/\/charts\/chart\d+\.xml$/i.test(t)) continue;
    let e = N(n),
      c = chartTypeTagFromXml(e);
    if (!c) continue;
    let l = dataPointOverridesFromXml(e, r);
    if (
      !l.some((e: any) =>
        e.some(
          (e: any) =>
            (typeof e.color == `string` && e.color.length > 0) || typeof e.explosion == `number`,
        ),
      )
    )
      continue;
    let u = 0,
      d = normalizeTitleText(chartTitleFromXml(e));
    if (
      (i.length > 0 && d.length > 0 && i === d && (u += 100),
      a && c === a && (u += 20),
      s.length === 0 && (u += 1),
      u > o && ((o = u), (s = l), u >= 120))
    )
      break;
  }
  return s;
}
function hexToRgb(e: any) {
  let t = normalizeHexColor(e);
  if (!t) return null;
  let n = /^#([0-9a-f]{6})$/.exec(t);
  return n
    ? [
        Number.parseInt(n[1].slice(0, 2), 16),
        Number.parseInt(n[1].slice(2, 4), 16),
        Number.parseInt(n[1].slice(4, 6), 16),
      ]
    : null;
}
function rgbToHsl(e: any, t: any, n: any) {
  let r = e / 255,
    i: any = t / 255,
    a = n / 255,
    o = Math.max(r, i, a),
    s = Math.min(r, i, a),
    c = (o + s) / 2;
  if (o === s) return [0, 0, c];
  let l = o - s,
    u = c > 0.5 ? l / (2 - o - s) : l / (o + s),
    d = 0;
  switch (o) {
    case r:
      d = (i - a) / l + (i < a ? 6 : 0);
      break;
    case i:
      d = (a - r) / l + 2;
      break;
    default:
      d = (r - i) / l + 4;
      break;
  }
  return [d / 6, u, c];
}
function hueToRgbChannel(e: any, t: any, n: any) {
  let r = n;
  return (
    r < 0 && (r += 1),
    r > 1 && --r,
    r < 1 / 6 ? e + (t - e) * 6 * r : r < 1 / 2 ? t : r < 2 / 3 ? e + (t - e) * (2 / 3 - r) * 6 : e
  );
}
function hslToRgb(e: any, t: any, n: any) {
  if (t === 0) {
    let e = Math.round(n * 255);
    return [e, e, e];
  }
  let r = n < 0.5 ? n * (1 + t) : n + t - n * t,
    i: any = 2 * n - r;
  return [
    Math.round(hueToRgbChannel(i, r, e + 1 / 3) * 255),
    Math.round(hueToRgbChannel(i, r, e) * 255),
    Math.round(hueToRgbChannel(i, r, e - 1 / 3) * 255),
  ];
}
function rgbToHex(e: any, t: any, n: any) {
  return `#${[e, t, n]
    .map((e) =>
      Math.max(0, Math.min(255, Math.round(e)))
        .toString(16)
        .padStart(2, `0`),
    )
    .join(``)}`;
}
function adjustColorLuminance(e: any, t = 1, n = 0) {
  let r = hexToRgb(e);
  if (!r) return normalizeHexColor(e);
  let [i, a, o] = rgbToHsl(r[0], r[1], r[2]),
    [s, c, l] = hslToRgb(i, a, clampUnitValue(o * t + n));
  return rgbToHex(s, c, l);
}
function resolveSchemeColor(e: any, t: any) {
  if (!e) return null;
  let n = themeColorIndices[e];
  return n === void 0 ? null : (t?.colorsByIndex[n] ?? null);
}
function resolveThemeTypeface(e: any, t: any) {
  return e
    ? e === `+mn-lt` || e === `+mn-ea` || e === `+mn-cs`
      ? (t?.minorLatinFont ?? null)
      : e === `+mj-lt` || e === `+mj-ea` || e === `+mj-cs`
        ? (t?.majorLatinFont ?? null)
        : e
    : null;
}
function defaultRunFontFromXml(e: any, t: any) {
  if (!e) return null;
  let n = firstDescendant(e, `defRPr`) ?? firstDescendant(e, `rPr`);
  if (!n) return null;
  let r =
    resolveThemeTypeface(
      firstChild(n, `latin`)?.getAttribute(`typeface`) ??
        firstChild(n, `ea`)?.getAttribute(`typeface`) ??
        firstChild(n, `cs`)?.getAttribute(`typeface`) ??
        null,
      t,
    )?.trim() ?? ``;
  return r.length > 0 ? r : null;
}
function colorFromXmlElement(e: any, t: any) {
  if (!e) return null;
  let n = null;
  if (
    (e.localName === `srgbClr`
      ? (n = normalizeHexColor(`#${e.getAttribute(`val`) ?? ``}`))
      : e.localName === `schemeClr`
        ? (n = resolveSchemeColor(e.getAttribute(`val`), t))
        : e.localName === `sysClr` && (n = normalizeHexColor(`#${e.getAttribute(`lastClr`) ?? ``}`)),
    !n)
  )
    return null;
  let r = 1,
    i: any = 0;
  for (let t of (Array.from(e.childNodes) as any[]).filter(isElementNode)) {
    let e = Number(t.getAttribute(`val`) ?? NaN);
    Number.isFinite(e) &&
      (t.localName === `lumMod`
        ? (r *= e / 1e5)
        : t.localName === `lumOff`
          ? (i += e / 1e5)
          : t.localName === `tint`
            ? (i += (1 - i) * (e / 1e5))
            : t.localName === `shade` && (r *= e / 1e5));
  }
  return adjustColorLuminance(n, r, i);
}
function isColorElement(e: any) {
  return !!(
    e &&
    (e.localName === `schemeClr` || e.localName === `srgbClr` || e.localName === `sysClr`)
  );
}
function findColorElement(e: any) {
  if (!e) return null;
  if (isColorElement(e)) return e;
  for (let t of [`srgbClr`, `schemeClr`, `sysClr`]) for (let n of descendantElements(e, t)) if (isColorElement(n)) return n;
  return null;
}
function resolveShapeFillColor(e: any, t: any) {
  if (!e || firstChild(e, `noFill`)) return null;
  let n = firstChild(e, `solidFill`);
  if (n) return colorFromXmlElement(findColorElement((Array.from(n.childNodes) as any[]).find(isElementNode) ?? null), t);
  let r = firstChild(e, `gradFill`),
    i: any = r
      ? descendantElements(r, `gs`)
          .map((e) => ({
            colorNode: (Array.from(e.childNodes) as any[]).find(isElementNode) ?? null,
            position: Number(e.getAttribute(`pos`) ?? NaN),
          }))
          .filter((e) => !!e.colorNode)
      : [];
  return i.length === 0
    ? null
    : (i.sort(
        (e: any, t: any) =>
          (Number.isFinite(e.position) ? e.position : 0) -
          (Number.isFinite(t.position) ? t.position : 0),
      ),
      colorFromXmlElement(
        (
          i.find((e: any) => Number.isFinite(e.position) && e.position >= 5e4) ??
          i[Math.floor(i.length / 2)] ??
          i[0]
        ).colorNode,
        t,
      ));
}
function resolveShapeLineProperties(e: any, t: any) {
  let n = e?.localName === `ln` ? e : e ? firstChild(e, `ln`) : null;
  if (!n) return { color: null, hidden: !1, widthPx: void 0 };
  if (firstChild(n, `noFill`)) return { color: null, hidden: !0, widthPx: void 0 };
  let r = firstChild(n, `solidFill`),
    i: any = r ? findColorElement((Array.from(r.childNodes) as any[]).find(isElementNode) ?? null) : null,
    a = Number(n.getAttribute(`w`) ?? NaN);
  return {
    color: colorFromXmlElement(i, t),
    hidden: !1,
    widthPx: Number.isFinite(a) ? Math.max(1, a / emuPerPx) : void 0,
  };
}
function normalizeChartLegend(e: any) {
  if (!e || typeof e != `object`) return null;
  let t = e;
  return {
    overlay: typeof t.overlay == `boolean` ? t.overlay : void 0,
    position: typeof t.position == `string` ? t.position : void 0,
    raw: t,
  };
}
function legendPositionCode(e: any) {
  if (e)
    switch (e) {
      case `bottom`:
        return `b`;
      case `left`:
        return `l`;
      case `right`:
        return `r`;
      case `top`:
        return `t`;
      default:
        return e;
    }
}
function childNumericVal(e: any, t: any) {
  let n = e ? firstChild(e, t) : null,
    r: any = Number(n?.getAttribute(`val`) ?? NaN);
  return Number.isFinite(r) ? r : void 0;
}
function childBooleanVal(e: any, t: any) {
  let n = e ? firstChild(e, t) : null;
  if (!n) return;
  let r = n.getAttribute(`val`);
  if (r == null || r === `1` || r === `true`) return !0;
  if (r === `0` || r === `false`) return !1;
}
function runFontSizePt(e: any) {
  if (!e) return;
  let t = firstDescendant(e, `defRPr`) ?? firstDescendant(e, `rPr`),
    n = Number(t?.getAttribute(`sz`) ?? NaN);
  if (!(!Number.isFinite(n) || n <= 0)) return n / 100;
}
function dataLabelSpecs(e: any) {
  let t = runFontSizePt(firstChild(e, `txPr`)),
    n = [];
  for (let r of childElements(e, `dLbl`)) {
    let e = childNumericVal(r, `idx`);
    if (typeof e != `number` || !Number.isFinite(e)) continue;
    let i = firstChild(r, `layout`),
      a = i ? firstChild(i, `manualLayout`) : null;
    n.push({
      deleted: childBooleanVal(r, `delete`),
      fontSizePt: runFontSizePt(firstChild(r, `txPr`)) ?? t,
      index: e,
      showBubbleSize: childBooleanVal(r, `showBubbleSize`),
      showCategoryName: childBooleanVal(r, `showCatName`),
      showPercent: childBooleanVal(r, `showPercent`),
      showSeriesName: childBooleanVal(r, `showSerName`),
      showValue: childBooleanVal(r, `showVal`),
      x: childNumericVal(a, `x`),
      y: childNumericVal(a, `y`),
    });
  }
  return n;
}
function normalizeDataLabels(e: any) {
  if (!e) return null;
  let t = dataLabelSpecs(e),
    n = {
      pointLabels: t.length > 0 ? t : void 0,
      raw: {},
      showBubbleSize: childBooleanVal(e, `showBubbleSize`),
      showCategoryName: childBooleanVal(e, `showCatName`),
      showLegendKey: childBooleanVal(e, `showLegendKey`),
      showPercent: childBooleanVal(e, `showPercent`),
      showSeriesName: childBooleanVal(e, `showSerName`),
      showValue: childBooleanVal(e, `showVal`),
    };
  return n.showBubbleSize !== void 0 ||
    n.showCategoryName !== void 0 ||
    n.showLegendKey !== void 0 ||
    n.showPercent !== void 0 ||
    (n.pointLabels?.length ?? 0) > 0 ||
    n.showSeriesName !== void 0 ||
    n.showValue !== void 0
    ? n
    : null;
}
function partRelationshipMap(e: any, t: any) {
  let n = normalizePartPath(`${partDirectory(t)}/_rels/${t.split(`/`).pop()}.rels`),
    r: any = partText(e, n);
  if (!r) return new Map();
  let i = parseXmlDocument(r);
  if (!i) return new Map();
  let a = new Map();
  for (let e of descendantElements(i, `Relationship`)) {
    let t = e.getAttribute(`Type`),
      r: any = e.getAttribute(`Target`);
    !t || !r || a.set(t, resolvePartTarget(n, r));
  }
  return a;
}
function themeColorList(e: any, t: any, n: any) {
  let r = partText(e, t);
  if (!r) return [];
  let i = parseXmlDocument(r);
  return i?.documentElement
    ? (Array.from(i.documentElement.childNodes) as any[])
        .filter((e) => isElementNode(e) && e.localName !== `variation`)
        .map((e) => colorFromXmlElement(e, n) ?? colorFromXmlElement(findColorElement(e), n))
        .filter((e) => typeof e == `string`)
    : [];
}
function chartStyleColors(e: any, t: any, n: any) {
  let r = partText(e, t);
  if (!r) return {};
  let i = parseXmlDocument(r);
  if (!i) return {};
  let a = firstDescendant(i, `dataPoint`),
    o = a ? firstChild(a, `fillRef`) : null,
    s = Number(o?.getAttribute(`idx`) ?? NaN),
    c = firstDescendant(i, `chartArea`),
    l = c ? firstChild(c, `spPr`) : null,
    u: any = c ? firstChild(c, `fontRef`) : null,
    d = u ? colorFromXmlElement((Array.from(u.childNodes) as any[]).find(isElementNode) ?? null, n) : null,
    f = firstDescendant(i, `title`),
    p: any = f ? firstChild(f, `fontRef`) : null,
    m = p ? colorFromXmlElement((Array.from(p.childNodes) as any[]).find(isElementNode) ?? null, n) : null,
    h = firstDescendant(i, `categoryAxis`) ?? firstDescendant(i, `valueAxis`),
    g: any = h ? firstChild(h, `spPr`) : null,
    _: any = h ? firstChild(h, `fontRef`) : null,
    v = l ? firstChild(l, `noFill`) != null : !1;
  return {
    axisLabelColor: _ ? (colorFromXmlElement((Array.from(_.childNodes) as any[]).find(isElementNode) ?? null, n) ?? void 0) : void 0,
    axisLineColor: resolveShapeLineProperties(g, n).color ?? void 0,
    chartAreaBorderColor: resolveShapeLineProperties(l, n).color ?? void 0,
    chartAreaFillColor: resolveShapeFillColor(l, n) ?? void 0,
    chartAreaNoFill: v,
    paletteOffset: Number.isFinite(s) ? s : void 0,
    textColor: d ?? void 0,
    titleColor: m ?? d ?? void 0,
  };
}
function accentColorPalette(e: any) {
  let t = [4, 5, 6, 7, 8, 9].map((t) => e?.colorsByIndex[t] ?? null).filter((e) => !!e);
  return t.length > 0 ? t : officeChartPalette;
}
function normalizeChartStyleId(e: any) {
  return typeof e != `number` || !Number.isFinite(e) ? null : e >= 100 ? e - 100 : e;
}
function surfaceChartPalette(e: any, t: any) {
  let n = normalizeChartStyleId(e);
  return n === 34 || (t === !0 && n == null)
    ? [`#5b9bd5`, `#ed7d31`, `#a5a5a5`]
    : n === 35 || n === 36 || (t !== !0 && n == null)
      ? [`#2f5597`, `#4472c4`, `#5b9bd5`, `#8faadc`, `#d9e2f3`]
      : null;
}
function applySurfaceChartDefaults(e: any) {
  if (e.chartType !== `Surface`) return;
  let t = surfaceChartPalette(e.chartStyleId, e.wireframe);
  (!e.chartColorPalette || e.chartColorPalette.length === 0) && t && (e.chartColorPalette = t);
  let n = e.wireframe ? `#d0d0d0` : `#d9d9df`,
    r: any = e.wireframe ? `#a6a6a6` : `#a8adb7`;
  ((e.floor = {
    ...(e.floor ?? {}),
    fillColor: e.floor?.fillColor ?? n,
    lineColor: e.floor?.lineColor ?? r,
  }),
    (e.sideWall = {
      ...(e.sideWall ?? {}),
      fillColor: e.sideWall?.fillColor ?? n,
      lineColor: e.sideWall?.lineColor ?? r,
    }),
    (e.backWall = {
      ...(e.backWall ?? {}),
      fillColor: e.backWall?.fillColor ?? n,
      lineColor: e.backWall?.lineColor ?? r,
    }),
    !e.surfaceMaterial && e.wireframe !== !0 && (e.surfaceMaterial = `flat`));
}
function applyChartStyleDefaults(e: any, t: any) {
  let n = typeof e.chartStyleId == `number` && e.chartStyleId >= 140 && e.chartStyleId < 150,
    r: any = t?.colorsByIndex[1] ?? t?.colorsByIndex[3] ?? null,
    i: any = t?.minorLatinFont?.trim() || void 0,
    a = r ? adjustColorLuminance(r, 0.35, 0.55) : null,
    o = r ? adjustColorLuminance(r, e.is3d ? 0.28 : 0.22, e.is3d ? 0.6 : 0.7) : null;
  (n &&
    ((e.chartAreaFillColor = e.chartAreaFillColor ?? `#1f1f1f`),
    (e.chartAreaBorderColor = e.chartAreaBorderColor ?? `#1f1f1f`),
    (e.textColor = e.textColor ?? `#f5f5f5`),
    (e.titleColor = e.titleColor ?? `#f5f5f5`),
    (e.axisLabelColor = e.axisLabelColor ?? `#d9d9d9`),
    (e.axisLineColor = e.axisLineColor ?? `#8c8c8c`)),
    (e.chartAreaBorderColor = e.chartAreaBorderColor ?? o ?? void 0),
    (e.textColor = e.textColor ?? r ?? void 0),
    (e.titleColor = e.titleColor ?? r ?? void 0),
    (e.axisLabelColor = e.axisLabelColor ?? a ?? r ?? void 0),
    (e.axisLineColor = e.axisLineColor ?? a ?? r ?? void 0),
    (e.fontFamily = e.fontFamily ?? i),
    (e.titleFontFamily = e.titleFontFamily ?? e.fontFamily ?? i));
  let s = e.chartColorPalette && e.chartColorPalette.length > 0 ? e.chartColorPalette : accentColorPalette(t);
  ((!e.chartColorPalette || e.chartColorPalette.length === 0) && (e.chartColorPalette = s),
    (e.series = e.series.map((e: any, t: any) => {
      let n = s[t % s.length];
      return {
        ...e,
        color: e.color ?? e.lineColor ?? n,
        lineColor: e.lineColor ?? e.color ?? n,
        markerColor: e.markerColor ?? e.color ?? e.lineColor ?? n,
        markerLineColor: e.markerLineColor ?? e.lineColor ?? e.color ?? n,
      };
    })),
    (e.typeGroups = e.typeGroups?.map((e: any, t: any) => ({
      ...e,
      series: e.series.map((e: any, n: any) => {
        let r = s[(t + n) % s.length];
        return {
          ...e,
          color: e.color ?? e.lineColor ?? r,
          lineColor: e.lineColor ?? e.color ?? r,
          markerColor: e.markerColor ?? e.color ?? e.lineColor ?? r,
          markerLineColor: e.markerLineColor ?? e.lineColor ?? e.color ?? r,
        };
      }),
    }))),
    applySurfaceChartDefaults(e));
}
function dataPointOverridesFromElement(e: any, t: any) {
  let n = [];
  for (let r of childElements(e, `dPt`)) {
    let e = childNumericVal(r, `idx`);
    if (e === void 0) continue;
    let i = firstChild(r, `spPr`),
      a = resolveShapeLineProperties(i, t);
    n.push({
      color: resolveShapeFillColor(i, t) ?? void 0,
      explosion: childNumericVal(r, `explosion`),
      index: e,
      lineColor: a.color ?? void 0,
    });
  }
  return n;
}
function invertedPointStyle(e: any, t: any) {
  let n = firstDescendant(e, `invertSolidFillFmt`),
    r: any = n ? firstChild(n, `spPr`) : null;
  if (!r) return { color: void 0, lineColor: void 0 };
  let i = resolveShapeLineProperties(r, t);
  return { color: resolveShapeFillColor(r, t) ?? void 0, lineColor: i.color ?? void 0 };
}
function referencePointsFromElement(e: any, t: any, n: any) {
  if (!e) return null;
  let r = firstChild(firstChild(e, `numRef`) ?? firstChild(e, `strRef`) ?? e, t);
  if (!r) return null;
  let i = childNumericVal(r, `ptCount`),
    a = childElements(r, `pt`)
      .map((e) => {
        let t: any = Number(e.getAttribute(`idx`) ?? NaN);
        return { index: Number.isFinite(t) ? t : 0, value: firstChild(e, `v`)?.textContent ?? `` };
      })
      .sort((e, t) => e.index - t.index);
  if (a.length === 0) return null;
  let o = a.reduce((e, t) => Math.max(e, t.index), 0),
    s = Math.max(a.length, Number.isFinite(i ?? NaN) ? Number(i) : 0, o + 1),
    c: any = (Array.from({ length: s }, () => null) as any[]);
  for (let e of a)
    n === `value` ? (c[e.index] = cellValueToNumber(e.value)) : (c[e.index] = e.value.length > 0 ? e.value : null);
  return c;
}
function multiLevelRefPoints(e: any, t: any) {
  if (!e) return null;
  let n = firstChild(firstChild(e, `multiLvlStrRef`) ?? e, `multiLvlStrCache`);
  if (!n) return null;
  let r = childElements(n, `lvl`);
  if (r.length === 0) return null;
  let i = childNumericVal(n, `ptCount`),
    a = childElements(t === `category` ? (r[r.length - 1] ?? r[0]) : r[0], `pt`)
      .map((e) => {
        let t: any = Number(e.getAttribute(`idx`) ?? NaN);
        return { index: Number.isFinite(t) ? t : 0, value: firstChild(e, `v`)?.textContent ?? `` };
      })
      .sort((e, t) => e.index - t.index);
  if (a.length === 0) return null;
  let o = a.reduce((e, t) => Math.max(e, t.index), 0),
    s = Math.max(a.length, Number.isFinite(i ?? NaN) ? Number(i) : 0, o + 1),
    c: any = (Array.from({ length: s }, () => null) as any[]);
  for (let e of a) {
    if (t === `value`) {
      c[e.index] = cellValueToNumber(e.value);
      continue;
    }
    c[e.index] = e.value.length > 0 ? e.value : null;
  }
  return c;
}
function applySeriesXmlStyles(e: any, t: any, n: any) {
  let r = childElements(t, `ser`);
  e.series = e.series.map((i: any, a: any) => {
    let o = r[a];
    if (!o) return i;
    let s = firstChild(o, `spPr`),
      c = firstChild(o, `marker`),
      l = firstChild(c ?? t, `spPr`),
      u = resolveShapeLineProperties(s, n),
      d = resolveShapeLineProperties(l, n),
      f = resolveShapeFillColor(s, n),
      p = childNumericVal(c, `size`),
      m = (c ? firstChild(c, `symbol`) : null)?.getAttribute(`val`) ?? void 0,
      h = dataPointOverridesFromElement(o, n),
      g: any = childNumericVal(o, `explosion`),
      _ = invertedPointStyle(o, n),
      v = childBooleanVal(o, `invertIfNegative`),
      y =
        e.chartType === `Scatter` ||
        e.chartType === `ScatterLines` ||
        e.chartType === `ScatterSmooth` ||
        e.chartType === `Bubble`,
      b = y
        ? (referencePointsFromElement(firstChild(o, `xVal`), `numCache`, `value`) ?? multiLevelRefPoints(firstChild(o, `xVal`), `category`))
        : (referencePointsFromElement(firstChild(o, `cat`), `strCache`, `category`) ??
          referencePointsFromElement(firstChild(o, `cat`), `numCache`, `category`) ??
          multiLevelRefPoints(firstChild(o, `cat`), `category`)),
      x = referencePointsFromElement(y ? firstChild(o, `yVal`) : firstChild(o, `val`), `numCache`, `value`),
      S = e.chartType === `Bubble` ? referencePointsFromElement(firstChild(o, `bubbleSize`), `numCache`, `value`) : null,
      C = i.shapeProperties && typeof i.shapeProperties == `object` ? i.shapeProperties : null,
      w = typeof C?.solidFillHex == `string` ? normalizeHexColor(C.solidFillHex) : null,
      T = typeof C?.lineColorHex == `string` ? normalizeHexColor(C.lineColorHex) : null,
      E = u.hidden ? void 0 : (T ?? u.color ?? w ?? f ?? i.lineColor ?? i.color),
      D = typeof i.categoriesRef?.formula == `string` && i.categoriesRef.formula.length > 0,
      O = typeof i.valuesRef?.formula == `string` && i.valuesRef.formula.length > 0,
      k = typeof i.bubbleSizeRef?.formula == `string` && i.bubbleSizeRef.formula.length > 0;
    return {
      ...i,
      bubbleSizes:
        !k && S
          ? S.map((e: any) => (typeof e == `number` && Number.isFinite(e) ? e : null))
          : i.bubbleSizes,
      categories: !D && b ? b : i.categories,
      color: w ?? T ?? f ?? u.color ?? i.color,
      dataPointStyles: h.length > 0 ? h : i.dataPointStyles,
      lineColor: E,
      lineWidthPx: u.hidden ? void 0 : (u.widthPx ?? i.lineWidthPx),
      markerColor: w ?? T ?? resolveShapeFillColor(l, n) ?? f ?? u.color ?? void 0,
      markerLineColor: T ?? w ?? d.color ?? u.color ?? f ?? void 0,
      markerSize: p ?? i.markerSize,
      markerSymbol: m,
      smooth: childBooleanVal(o, `smooth`) ?? i.smooth,
      invertIfNegative: v ?? i.invertIfNegative,
      shapeProperties: {
        ...i.shapeProperties,
        xmlExplosion: g ?? void 0,
        xmlFillColor: f ?? void 0,
        xmlLineHidden: u.hidden ? !0 : void 0,
        xmlLineColor: u.color ?? void 0,
        xmlLineWidthPx: u.widthPx ?? void 0,
        xmlNegativeFillColor: _.color ?? void 0,
        xmlNegativeLineColor: _.lineColor ?? void 0,
      },
      negativeColor: _.color ?? i.negativeColor,
      negativeLineColor: _.lineColor ?? i.negativeLineColor,
      values:
        !O && x ? x.map((e: any) => (typeof e == `number` && Number.isFinite(e) ? e : null)) : i.values,
    };
  });
}
function hydrateChartFromPartXml(e: any, t: any, n: any, r: any) {
  let i = partText(n, t);
  if (!i) return;
  let a = t ? partRelationshipMap(n, t) : new Map(),
    o = dataPointOverridesFromXml(i, r),
    s = seriesPaintColorsFromXml(i, r),
    c = bubbleSizeValuesFromXml(i),
    l = () => {
      (c.length > 0 &&
        (e.series = e.series.map((e: any, t: any) => {
          let n = c[t] ?? [];
          return n.length === 0 ||
            (e.bubbleSizes ?? []).filter((e: any) => typeof e == `number` && Number.isFinite(e))
              .length >= n.filter((e: any) => typeof e == `number` && Number.isFinite(e)).length
            ? e
            : { ...e, bubbleSizes: n };
        })),
        o.length > 0 &&
          (e.series = e.series.map((e: any, t: any) => {
            let n = o[t] ?? [];
            if (n.length === 0) return e;
            let r = new Map((e.dataPointStyles ?? []).map((e: any) => [e.index, e]));
            for (let e of n) {
              let t: any = r.get(e.index);
              r.set(e.index, {
                color: t?.color ?? e.color,
                explosion: t?.explosion ?? e.explosion,
                index: e.index,
                lineColor: t?.lineColor ?? e.lineColor,
              });
            }
            return {
              ...e,
              dataPointStyles: (Array.from(r.values()) as any[]).sort((e: any, t) => e.index - t.index),
            };
          })),
        s.length > 0 &&
          (e.series = e.series.map((e: any, t: any) => {
            let n = s[t];
            if (!n) return e;
            let r = n.color ?? n.lineColor;
            return {
              ...e,
              color: e.color ?? r,
              lineColor: e.lineColor ?? n.lineColor ?? r,
              markerColor: e.markerColor ?? r ?? e.color,
              markerLineColor: e.markerLineColor ?? n.lineColor ?? r ?? e.lineColor,
            };
          })));
    },
    u = () => {
      e.chartColorPalette = themeColorList(n, a.get(chartColorStyleRelNamespace), r);
      let t = chartStyleColors(n, a.get(chartStyleRelNamespace), r);
      return (
        (e.axisLabelColor = t.axisLabelColor ?? e.axisLabelColor),
        (e.axisLineColor = t.axisLineColor ?? e.axisLineColor),
        (e.chartAreaBorderColor = t.chartAreaBorderColor ?? e.chartAreaBorderColor),
        (e.chartAreaFillColor = t.chartAreaFillColor ?? e.chartAreaFillColor),
        (e.chartColorPaletteOffset = t.paletteOffset ?? e.chartColorPaletteOffset),
        (e.textColor = t.textColor ?? e.textColor),
        (e.titleColor = t.titleColor ?? e.titleColor),
        t
      );
    },
    d = () => {
      let t = f?.documentElement ? firstDescendant(f.documentElement, `plotArea`) : null;
      if (!t) return;
      let n = (e: any) => {
          let t = firstChild(e, `layoutPr`),
            n: any = t ? firstChild(t, `binning`) : null;
          if (!n) return null;
          let r: any = {};
          for (let e of (Array.from(n.attributes) as any[])) {
            let t = e.value,
              n = Number(t);
            r[e.localName || e.name] = Number.isFinite(n) && t.trim() !== `` ? n : t;
          }
          return Object.keys(r).length > 0 ? r : {};
        },
        i = firstChild(t, `spPr`);
      if (i) {
        let t = resolveShapeFillColor(i, r),
          n = resolveShapeLineProperties(i, r);
        (t && (e.chartAreaFillColor = e.chartAreaFillColor ?? t),
          n.color && (e.chartAreaBorderColor = e.chartAreaBorderColor ?? n.color));
      }
      let a = descendantElements(t, `series`);
      if (a.length === 0) return;
      e.series = e.series.map((e: any, t: any) => {
        let n = a[t] ?? null;
        if (!n) return e;
        let i = firstChild(n, `valueColors`),
          o = i
            ? (Array.from(i.childNodes) as any[])
                .filter((e: any) => e.nodeType === Node.ELEMENT_NODE)
                .map((e) => colorFromXmlElement(findColorElement(e) ?? e, r))
                .filter((e) => typeof e == `string` && e.length > 0)
            : [],
          s =
            o.length > 0
              ? { ...(e.raw && typeof e.raw == `object` ? e.raw : {}), valueColors: o }
              : e.raw,
          c = firstChild(n, `spPr`);
        if (!c) return s === e.raw ? e : { ...e, raw: s };
        let l = resolveShapeFillColor(c, r),
          u = resolveShapeLineProperties(c, r),
          d = l ?? u.color ?? void 0;
        return {
          ...e,
          color: e.color ?? d,
          lineColor: e.lineColor ?? u.color ?? l ?? d,
          lineWidthPx: e.lineWidthPx ?? (typeof u.widthPx == `number` ? u.widthPx : void 0),
          markerColor: e.markerColor ?? d ?? e.color,
          markerLineColor: e.markerLineColor ?? u.color ?? d ?? e.lineColor,
          raw: s,
        };
      });
      let o = a.map((e: any) => e.getAttribute(`layoutId`) ?? e.getAttribute(`layout`)),
        s = o.findIndex((e) => e === `clusteredColumn`);
      if (s >= 0) {
        let t = a[s] ?? null,
          r = t ? n(t) : null;
        if (r) {
          let t = { layoutId: `clusteredColumn`, layoutPr: { binning: r } },
            n = o.includes(`paretoLine`),
            i = (e: any) => (e ? applyHistogramBinning(e, t, n) : null);
          if (e.typeGroups && e.typeGroups.length > 0) {
            let t = e.typeGroups.map((e: any) => ({ ...e, series: [...e.series] })),
              n = t.findIndex((e: any) => e.chartType === `ColumnClustered`);
            if (n >= 0) {
              let r = i(t[n]?.series[0] ?? null);
              if (r) {
                t[n].series = [r];
                let i = t.findIndex((e: any) => e.chartType === `Line`);
                if (i >= 0 && t[i]?.series[0]) {
                  let n = t[i].series[0],
                    a = buildParetoSeries(
                      r,
                      { text: n.name, ...(n.raw && typeof n.raw == `object` ? n.raw : {}) },
                      0,
                    );
                  ((t[i].series = [
                    {
                      ...n,
                      categories: a.categories,
                      categoriesRef: a.categoriesRef,
                      raw: a.raw,
                      values: a.values,
                    },
                  ]),
                    (e.series = [r, t[i].series[0]]));
                } else e.series = [r];
                e.typeGroups = t;
              }
            } else if (e.series[0]) {
              let t = i(e.series[0]);
              t && (e.series = [t]);
            }
          } else if (e.series[0]) {
            let t = i(e.series[0]);
            t && (e.series = [t]);
          }
        }
      }
    },
    f = parseXmlDocument(i),
    p = f ? firstDescendant(f, `chart`) : null,
    m = p ? firstChild(p, `plotArea`) : null,
    h = f?.documentElement ? firstDescendant(f.documentElement, `style`) : null,
    g = chartTypeElement(m);
  if (!p || !g) {
    u();
    let t = childNumericVal(h, `style`);
    (typeof t == `number` && Number.isFinite(t) && (e.chartStyleId = t), d(), l(), applyChartStyleDefaults(e, r));
    return;
  }
  let _ = m;
  if (!_) {
    (u(), l(), applyChartStyleDefaults(e, r));
    return;
  }
  switch (g.localName) {
    case `barChart`:
    case `bar3DChart`: {
      let t = firstChild(g, `grouping`)?.getAttribute(`val`),
        n = firstChild(g, `barDir`)?.getAttribute(`val`) === `bar`;
      ((e.is3d = g.localName === `bar3DChart` ? !0 : e.is3d),
        t === `percentStacked`
          ? (e.chartType = n ? `BarPercentStacked` : `ColumnPercentStacked`)
          : t === `stacked`
            ? (e.chartType = n ? `BarStacked` : `ColumnStacked`)
            : (e.chartType = n ? `BarClustered` : `ColumnClustered`));
      break;
    }
    case `areaChart`:
    case `area3DChart`: {
      let t = firstChild(g, `grouping`)?.getAttribute(`val`);
      ((e.is3d = g.localName === `area3DChart` ? !0 : e.is3d),
        t === `stacked`
          ? (e.chartType = `AreaStacked`)
          : t === `percentStacked`
            ? (e.chartType = `AreaPercentStacked`)
            : (e.chartType = `Area`));
      break;
    }
    case `lineChart`:
    case `line3DChart`: {
      let t = firstChild(g, `grouping`)?.getAttribute(`val`);
      ((e.is3d = g.localName === `line3DChart` ? !0 : e.is3d),
        t === `stacked`
          ? (e.chartType = `LineStacked`)
          : t === `percentStacked`
            ? (e.chartType = `LinePercentStacked`)
            : (e.chartType = `Line`));
      break;
    }
    case `pieChart`:
      e.chartType = `Pie`;
      break;
    case `pie3DChart`:
      ((e.chartType = `Pie3D`), (e.is3d = !0));
      break;
    case `doughnutChart`:
      e.chartType = `Doughnut`;
      break;
    case `ofPieChart`:
      e.chartType = `BarOfPie`;
      break;
    case `scatterChart`:
      e.chartType = scatterChartSubtype(firstChild(g, `scatterStyle`)?.getAttribute(`val`));
      break;
    case `radarChart`:
      e.chartType = `Radar`;
      break;
    case `surfaceChart`:
      ((e.chartType = `Surface`), (e.is3d = !1));
      break;
    case `surface3DChart`:
      ((e.chartType = `Surface`), (e.is3d = !0));
      break;
    case `stockChart`:
      e.chartType = `Stock`;
      break;
    case `bubbleChart`:
      e.chartType = `Bubble`;
      break;
    default:
      break;
  }
  let v = firstChild(p, `legend`),
    y = v ? (firstChild(v, `legendPos`)?.getAttribute(`val`) ?? void 0) : void 0,
    b = v ? firstChild(v, `overlay`)?.getAttribute(`val`) : void 0;
  e.legend = v ? { overlay: b === `1`, position: legendPositionCode(y), raw: e.legend?.raw } : e.legend;
  let x = childBooleanVal(p, `plotVisOnly`);
  (x !== void 0 && (e.plotVisibleOnly = x),
    (e.displayBlanksAs = firstChild(p, `dispBlanksAs`)?.getAttribute(`val`) ?? e.displayBlanksAs));
  let S = Number(h?.getAttribute(`val`) ?? NaN);
  ((e.chartStyleId = Number.isFinite(S) ? S : e.chartStyleId),
    (e.firstSliceAngle = childNumericVal(g, `firstSliceAng`) ?? e.firstSliceAngle),
    (e.gapWidth = childNumericVal(g, `gapWidth`) ?? e.gapWidth),
    (e.overlap = childNumericVal(g, `overlap`) ?? e.overlap),
    (e.bubbleScale = childNumericVal(g, `bubbleScale`) ?? e.bubbleScale),
    (e.varyColors = childBooleanVal(g, `varyColors`) ?? e.varyColors));
  let C = firstChild(g, `bubble3D`);
  ((e.bubble3d = C ? C.getAttribute(`val`) !== `0` : e.bubble3d),
    (e.holeSize = childNumericVal(g, `holeSize`) ?? e.holeSize),
    (e.radarStyle = firstChild(g, `radarStyle`)?.getAttribute(`val`) ?? e.radarStyle),
    (e.scatterStyle = firstChild(g, `scatterStyle`)?.getAttribute(`val`) ?? e.scatterStyle),
    (e.shape3d = firstChild(g, `shape`)?.getAttribute(`val`) ?? e.shape3d));
  let w = firstChild(g, `wireframe`);
  e.wireframe = w ? w.getAttribute(`val`) !== `0` : e.wireframe;
  let T = normalizeDataLabels(firstChild(g, `dLbls`)),
    E: any = childElements(g, `ser`)[0] ?? null,
    D = normalizeDataLabels(firstChild(E, `dLbls`));
  ((e.dataLabels = T ?? D ?? e.dataLabels),
    (e.surfaceMaterial =
      (E ? firstDescendant(E, `sp3d`) : null)?.getAttribute(`prstMaterial`) ?? e.surfaceMaterial));
  let O = childElements(g, `bandFmts`)[0] ?? null,
    k = O ? childElements(O, `bandFmt`) : [],
    A = k
      .map((e) => resolveShapeFillColor(firstChild(e, `spPr`), r) ?? void 0)
      .filter((e) => typeof e == `string` && e.length > 0),
    j = k
      .map((e) => resolveShapeLineProperties(firstChild(e, `spPr`), r).color ?? void 0)
      .filter((e) => typeof e == `string` && e.length > 0);
  e.raw = {
    ...(e.raw ?? {}),
    bandFormatCount: k.length > 0 ? k.length : void 0,
    bandFormatColors: A.length > 0 ? A : void 0,
    bandFormatLineColors: j.length > 0 ? j : void 0,
    date1904: childBooleanVal(f?.documentElement ?? null, `date1904`),
    bubble3d: e.bubble3d,
    grouping: firstChild(g, `grouping`)?.getAttribute(`val`) ?? void 0,
    ofPieType: firstChild(g, `ofPieType`)?.getAttribute(`val`) ?? void 0,
    shape: firstChild(g, `shape`)?.getAttribute(`val`) ?? void 0,
    secondPieSize: childNumericVal(g, `secondPieSize`),
    scatterStyle: e.scatterStyle,
    splitPos: childNumericVal(g, `splitPos`),
    splitType: firstChild(g, `splitType`)?.getAttribute(`val`) ?? void 0,
    xmlChartType: g.localName,
  };
  let M = firstDescendant(p, `view3D`);
  (M &&
    (e.view3d = {
      depthPercent: childNumericVal(M, `depthPercent`),
      perspective: childNumericVal(M, `perspective`),
      rAngAx: firstChild(M, `rAngAx`)?.getAttribute(`val`) === `1`,
      rotX: childNumericVal(M, `rotX`),
      rotY: childNumericVal(M, `rotY`),
    }),
    (e.floor = wallModelFromElement(firstChild(p, `floor`), r) ?? e.floor),
    (e.sideWall = wallModelFromElement(firstChild(p, `sideWall`), r) ?? e.sideWall),
    (e.backWall = wallModelFromElement(firstChild(p, `backWall`), r) ?? e.backWall));
  let N = u(),
    P = defaultRunFontFromXml(firstChild(p, `txPr`), r),
    F = defaultRunFontFromXml(firstDescendant(p, `title`), r);
  ((e.fontFamily = P ?? e.fontFamily),
    (e.titleFontFamily = F ?? e.titleFontFamily ?? e.fontFamily));
  let I = f?.documentElement ? firstChild(f.documentElement, `spPr`) : null,
    ee = firstChild(_, `spPr`),
    L = I ? firstChild(I, `noFill`) != null : !1,
    te = ee ? firstChild(ee, `noFill`) != null : !1;
  if (
    ((e.raw = {
      ...(e.raw ?? {}),
      chartAreaNoFill: N.chartAreaNoFill === !0 || L,
      plotAreaNoFill: te,
    }),
    I)
  ) {
    let t = resolveShapeFillColor(I, r);
    t ? (e.chartAreaFillColor = t) : firstChild(I, `noFill`) && (e.chartAreaFillColor = `transparent`);
    let n = resolveShapeLineProperties(I, r);
    n.hidden
      ? (e.chartAreaBorderColor = `transparent`)
      : n.color && (e.chartAreaBorderColor = n.color);
  }
  !e.chartAreaFillColor &&
    (N.chartAreaNoFill === !0 || te) &&
    (e.chartAreaFillColor = `transparent`);
  let ne = [...childElements(_, `catAx`), ...childElements(_, `dateAx`)],
    re = childElements(_, `valAx`),
    R = childElements(_, `serAx`)[0] ?? null,
    ie =
      e.chartType === `Scatter` ||
      e.chartType === `ScatterLines` ||
      e.chartType === `ScatterSmooth` ||
      e.chartType === `Bubble`,
    z = ne[0] ?? null,
    ae = re[0] ?? null;
  if (
    (!z &&
      ie &&
      re.length >= 2 &&
      ((z =
        re.find((e) => {
          let t = firstChild(e, `axPos`)?.getAttribute(`val`);
          return t === `b` || t === `t`;
        }) ?? re[0]),
      (ae =
        re.find((e) => {
          let t = firstChild(e, `axPos`)?.getAttribute(`val`);
          return t === `l` || t === `r`;
        }) ??
        re[1] ??
        re[0])),
    (e.categoryAxis = mergeAxisModel(e.categoryAxis, axisModelFromElement(z))),
    (e.valueAxis = mergeAxisModel(e.valueAxis, axisModelFromElement(ae))),
    (e.seriesAxis = mergeAxisModel(e.seriesAxis, axisModelFromElement(R))),
    (e.axes =
      e.axes.length > 0
        ? e.axes.map((e: any, t: any) =>
            t === 0 && z ? { ...e, ...axisModelFromElement(z) } : t === 1 && ae ? { ...e, ...axisModelFromElement(ae) } : e,
          )
        : e.axes),
    R)
  ) {
    let t = axisModelFromElement(R);
    t && !e.axes.some((e: any) => e.id != null && e.id === t.id) && (e.axes = [...e.axes, t]);
  }
  if ((applySeriesXmlStyles(e, g, r), l(), e.chartType === `Bubble`)) {
    let t: any = matchBubbleChartValues(n, e.title);
    t.length > 0 &&
      (e.series = e.series.map((e: any, n: any) => {
        let r = Math.max(e.values.length, e.categories.length);
        if (
          r <= 1 ||
          (e.bubbleSizes ?? []).filter((e: any) => typeof e == `number` && Number.isFinite(e)).length >=
            r
        )
          return e;
        let i = t[n] ?? t[0] ?? [];
        return i.filter((e: any) => typeof e == `number` && Number.isFinite(e)).length < r
          ? e
          : { ...e, bubbleSizes: i };
      }));
  }
  if (
    (e.chartType === `Pie` ||
      e.chartType === `Pie3D` ||
      e.chartType === `PieExploded` ||
      e.chartType === `Doughnut` ||
      e.chartType === `BarOfPie`) &&
    e.series.some((e: any) =>
      Math.max(e.values.length, e.categories.length) <= 0
        ? !1
        : (e.dataPointStyles ?? []).filter((e: any) => typeof e.color == `string` && e.color.length > 0)
            .length === 0,
    )
  ) {
    let t: any = matchDataPointOverrides(n, e.title, g.localName, r);
    t.length > 0 &&
      (e.series = e.series.map((e: any, n: any) => {
        let r = t[n] ?? t[0] ?? [];
        if (r.length === 0) return e;
        let i = new Map((e.dataPointStyles ?? []).map((e: any) => [e.index, e]));
        for (let e of r) {
          let t: any = i.get(e.index);
          i.set(e.index, {
            color: t?.color ?? e.color,
            explosion: t?.explosion ?? e.explosion,
            index: e.index,
            lineColor: t?.lineColor ?? e.lineColor,
          });
        }
        return { ...e, dataPointStyles: (Array.from(i.values()) as any[]).sort((e: any, t) => e.index - t.index) };
      }));
  }
  applyChartStyleDefaults(e, r);
}
function normalizePartPath(e: any) {
  return e.replace(/^\/+/, ``).replace(/\\/g, `/`);
}
function partDirectory(e: any) {
  let t = normalizePartPath(e),
    n = t.lastIndexOf(`/`);
  return n >= 0 ? t.slice(0, n) : ``;
}
function resolvePartTarget(e: any, t: any) {
  if (!t) return ``;
  let n = t.replace(/\\/g, `/`);
  if (n.startsWith(`/`)) return normalizePartPath(n);
  let r = normalizePartPath(e),
    i: any = partDirectory(r);
  if (r.endsWith(`.rels`)) {
    let e = r.lastIndexOf(`/_rels/`);
    if (e >= 0) {
      let t = r.slice(0, e),
        n = r.slice(e + 7);
      i = partDirectory(`${t}/${n.endsWith(`.rels`) ? n.slice(0, -5) : n}`);
    }
  }
  let a = [...i.split(`/`).filter(Boolean), ...n.split(`/`).filter(Boolean)],
    o = [];
  for (let e of a)
    if (e !== `.`) {
      if (e === `..`) {
        o.pop();
        continue;
      }
      o.push(e);
    }
  return o.join(`/`);
}
function partText(e: any, t: any) {
  if (!t) return null;
  let n = e[normalizePartPath(t)];
  return n ? N(n) : null;
}
function parseXmlDocument(e: any) {
  if (typeof DOMParser > `u`) return null;
  try {
    return new DOMParser().parseFromString(e, `application/xml`);
  } catch {
    return null;
  }
}
function serializeXmlDocument(e: any) {
  return new XMLSerializer().serializeToString(e);
}
function childElements(e: any, t: any) {
  return (Array.from(e.childNodes) as any[]).filter(
    (e: any) => e.nodeType === Node.ELEMENT_NODE && e.localName === t,
  );
}
function removeChildElements(e: any, t: any) {
  childElements(e, t).forEach((e: any) => e.parentNode?.removeChild(e));
}
function descendantElements(e: any, t: any) {
  return (Array.from(e.getElementsByTagName(`*`)) as any[]).filter((e: any) => e.localName === t);
}
function firstChild(e: any, t: any) {
  return childElements(e, t)[0] ?? null;
}
function firstDescendant(e: any, t: any) {
  return descendantElements(e, t)[0] ?? null;
}
function ensureChildElement(e: any, t: any, n = e.namespaceURI ?? chartXmlNamespace, r = `c`) {
  let i: any = firstChild(e, t);
  if (i) return i;
  let a = e.ownerDocument.createElementNS(n, `${r}:${t}`);
  return (e.appendChild(a), a);
}
function ensureChildTextElement(e: any, t: any, n: any, r = e.namespaceURI ?? chartXmlNamespace, i = `c`) {
  let a = ensureChildElement(e, t, r, i);
  return ((a.textContent = n), a);
}
function ensureBooleanChildElement(e: any, t: any, n: any) {
  let r = ensureChildElement(e, t);
  return (r.setAttribute(`val`, n ? `1` : `0`), r);
}
function ensureIntegerChildElement(e: any, t: any, n: any) {
  let r = ensureChildElement(e, t);
  return (r.setAttribute(`val`, String(Math.round(n))), r);
}
function unquoteSheetName(e: any) {
  let t = e.trim();
  return t.startsWith(`'`) && t.endsWith(`'`) ? t.slice(1, -1).replace(/''/g, `'`) : t;
}
function splitSheetReference(e: any) {
  let t = -1,
    n = !1;
  for (let r = 0; r < e.length; r += 1) {
    let i: any = e[r];
    if (i === `'`) n = !n;
    else if (i === `!` && !n) {
      t = r;
      break;
    }
  }
  return t < 0 ? null : { range: e.slice(t + 1), sheetName: unquoteSheetName(e.slice(0, t)) };
}
function parseCellRef(e: any) {
  let t = /^\$?([A-Z]+)\$?(\d+)$/i.exec(e.trim());
  if (!t) return null;
  let n = 0;
  for (let e of t[1].toUpperCase()) n = n * 26 + (e.charCodeAt(0) - 64);
  return { col: n - 1, row: Number(t[2]) - 1 };
}
function parseRangeRef(e: any) {
  let [t, n = t] = e.split(`:`),
    r = parseCellRef(t ?? ``),
    i: any = parseCellRef(n ?? ``);
  return !r || !i
    ? null
    : {
        end: { col: Math.max(r.col, i.col), row: Math.max(r.row, i.row) },
        start: { col: Math.min(r.col, i.col), row: Math.min(r.row, i.row) },
      };
}
function columnLetters(e: any) {
  let t = e + 1,
    n = ``;
  for (; t > 0;) {
    let e = (t - 1) % 26;
    ((n = String.fromCharCode(65 + e) + n), (t = Math.floor((t - 1) / 26)));
  }
  return n;
}
function formatAbsoluteRangeRef(e: any, t: any, n: any) {
  return `'${e.replace(/'/g, `''`)}'!$${columnLetters(t.col)}$${t.row + 1}:$${columnLetters(n.col)}$${n.row + 1}`;
}
function resolveFormulaRange(e: any, t: any, n: any) {
  if (!n) return { range: null, sheet: e.getSheet(t), sheetName: e.getSheet(t)?.name ?? `` };
  let r = n.trim();
  if (r.length > 0 && !r.includes(`!`))
    try {
      let n = e.getNamedRange(r);
      if (typeof n == `string` && n.length > 0 && n !== r) return resolveFormulaRange(e, t, n);
    } catch {}
  let i: any = splitSheetReference(r);
  if (!i) return { range: parseRangeRef(r), sheet: e.getSheet(t), sheetName: e.getSheet(t)?.name ?? `` };
  try {
    return { range: parseRangeRef(i.range), sheet: e.getSheetByName(i.sheetName), sheetName: i.sheetName };
  } catch {
    return { range: parseRangeRef(i.range), sheet: e.getSheet(t), sheetName: e.getSheet(t)?.name ?? `` };
  }
}
function resolveRangeTitle(e: any, t: any, n: any, r: any) {
  if (!n?.formula) return r;
  let i: any = resolveFormulaRange(e, t, n.formula);
  if (!i.sheet || !i.range) return r;
  let { start: a } = i.range;
  if (a.row > 0) {
    let e = cellValueToString(
      typeof i.sheet.getFormattedValueAt == `function`
        ? i.sheet.getFormattedValueAt(a.row - 1, a.col)
        : null,
    );
    if (e.length > 0) return e;
  }
  let o = cellValueToString(
    typeof i.sheet.getFormattedValueAt == `function`
      ? i.sheet.getFormattedValueAt(a.row, a.col)
      : null,
  );
  return o.length > 0 ? o : r;
}
function readRangeStrings(e: any, t: any, n: any) {
  if (!n?.formula) return [];
  let r = resolveFormulaRange(e, t, n.formula);
  if (!r.sheet || !r.range) return [];
  let i: any = [];
  for (let e = r.range.start.row; e <= r.range.end.row; e += 1) {
    let t = [];
    for (let n = r.range.start.col; n <= r.range.end.col; n += 1) {
      let i: any =
          typeof r.sheet.getCalculatedValueAt == `function`
            ? r.sheet.getCalculatedValueAt(e, n)
            : null,
        a =
          typeof r.sheet.getFormattedValueAt == `function` ? r.sheet.getFormattedValueAt(e, n) : i,
        o = cellValueToString(a ?? i),
        s = cellValueToNumber(i ?? a),
        c = o.length > 0 ? o : s == null ? `` : String(s);
      c.length > 0 && t.push(c);
    }
    i.push(t);
  }
  return i;
}
function normalizeLegendModel(e: any) {
  if (!e || typeof e != `object`) return null;
  let t = e,
    n = typeof t.position == `string` ? legendPositionCode(String(t.position)) : void 0;
  return { overlay: typeof t.overlay == `boolean` ? t.overlay : void 0, position: n, raw: t };
}
function titleCaseLabel(e: any) {
  if (e)
    return e
      .replace(/([a-z0-9])([A-Z])/g, `$1 $2`)
      .replace(/[-_]+/g, ` `)
      .trim()
      .replace(/\b\w/g, (e: any) => e.toUpperCase());
}
function normalizeAxisModel(e: any) {
  if (!e || typeof e != `object`) return null;
  let t = e,
    n = t.scaling && typeof t.scaling == `object` ? t.scaling : null,
    r = t.numberFormat && typeof t.numberFormat == `object` ? t.numberFormat : null;
  return {
    delete: typeof t.hidden == `boolean` ? t.hidden : void 0,
    id: typeof t.id == `number` && Number.isFinite(t.id) ? t.id : void 0,
    crossId: typeof t.crossId == `number` && Number.isFinite(t.crossId) ? t.crossId : void 0,
    majorGridlines: t.majorGridlines == null ? void 0 : !0,
    majorUnit: typeof n?.majorUnit == `number` ? n.majorUnit : void 0,
    max: typeof n?.max == `number` ? n.max : void 0,
    min: typeof n?.min == `number` ? n.min : void 0,
    minorGridlines: t.minorGridlines == null ? void 0 : !0,
    minorUnit: typeof n?.minorUnit == `number` ? n.minorUnit : void 0,
    numberFormat: r
      ? {
          formatCode: typeof r.formatCode == `string` ? r.formatCode : void 0,
          sourceLinked: typeof r.sourceLinked == `boolean` ? r.sourceLinked : void 0,
        }
      : void 0,
    raw: t,
    position: typeof t.position == `string` ? t.position : void 0,
    tickLabelSkip: typeof t.tickLabelSkip == `number` ? t.tickLabelSkip : void 0,
    tickMarkSkip: typeof t.tickMarkSkip == `number` ? t.tickMarkSkip : void 0,
  };
}
function chartExLayoutType(e: any) {
  switch (e) {
    case `boxWhisker`:
      return `BoxWhisker`;
    case `clusteredColumn`:
      return `ColumnClustered`;
    case `funnel`:
      return `Funnel`;
    case `paretoLine`:
      return `Line`;
    case `regionMap`:
      return `RegionMap`;
    case `sunburst`:
      return `Sunburst`;
    case `treemap`:
      return `Treemap`;
    case `waterfall`:
      return `Waterfall`;
    default:
      return e ? `Unsupported(cx:${e})` : `ColumnClustered`;
  }
}
function chartExLayoutId(e: any) {
  if (!e || typeof e != `object`) return;
  let t = e;
  return typeof t.layout == `string`
    ? t.layout
    : typeof t.layoutId == `string`
      ? t.layoutId
      : void 0;
}
function chartExAxisIds(e: any) {
  if (!e || typeof e != `object`) return [];
  let t = e;
  return Array.isArray(t.axisIds)
    ? t.axisIds.filter((e: any) => typeof e == `number` && Number.isFinite(e))
    : Array.isArray(t.axisId)
      ? t.axisId.flatMap((e: any) =>
          typeof e == `number` && Number.isFinite(e)
            ? [e]
            : e && typeof e == `object` && typeof e.val == `number`
              ? [e.val]
              : [],
        )
      : typeof t.axisId == `number` && Number.isFinite(t.axisId)
        ? [t.axisId]
        : [];
}
function niceBinSize(e: any) {
  if (!Number.isFinite(e) || e <= 0) return 1;
  let t = 10 ** Math.floor(Math.log10(e)),
    n = e / t;
  return n <= 1 ? t : n <= 2 ? t * 2 : n <= 5 ? t * 5 : t * 10;
}
function formatBinInterval(e: any, t: any, n: any, r: any) {
  let i: any = r ? (n === 0 ? `[` : `(`) : `[`,
    a = r ? `]` : `)`;
  return `${i}${Number(e.toFixed(6))},${Number(t.toFixed(6))}${a}`;
}
function computeHistogramBins(e: any, t: any, n: any) {
  if (e.length === 0) return [];
  let r = t && typeof t == `object` ? t : null,
    i: any = r?.layoutProperties && typeof r.layoutProperties == `object` ? r.layoutProperties : null,
    a = i?.binning && typeof i.binning == `object` ? i.binning : null,
    o = Math.min(...e),
    s = Math.max(...e),
    c =
      typeof a?.binSize == `number` && Number.isFinite(a.binSize) && a.binSize > 0
        ? a.binSize
        : void 0,
    l =
      typeof a?.binCount == `number` && Number.isFinite(a.binCount) && a.binCount > 0
        ? a.binCount
        : typeof a?.count == `number` && Number.isFinite(a.count) && a.count > 0
          ? a.count
          : void 0,
    u = a?.intervalClosed === `r` || a?.intervalClosed === `right`,
    d = e.reduce((e: any, t: any) => e + t, 0) / e.length,
    f = e.reduce((e: any, t: any) => e + (t - d) ** 2, 0) / Math.max(1, e.length),
    p = Math.sqrt(Math.max(0, f)),
    m = e.every((e: any) => Math.abs(e - Math.round(e)) < 1e-9),
    h = p > 0 ? (3.49 * p) / Math.cbrt(e.length) : void 0,
    g =
      l == null
        ? (h ?? (s - o) / Math.max(1, Math.ceil(Math.log2(e.length) + 1)))
        : (s - o) / Math.max(1, l),
    _ = c ?? (m ? Math.max(1, Math.ceil(Math.max(g, 1e-6))) : niceBinSize(Math.max(g, 1e-6))),
    v = Math.max(_, 1e-6),
    y = c != null || l != null ? Math.floor(o / v) * v : o,
    b = Math.max(y + v, y + Math.ceil((s - y) / v) * v),
    x = Math.max(1, Math.ceil((b - y) / v)),
    S = (Array.from({ length: x }, (e, t) => {
      let n = y + v * t,
        r = n + v;
      return { count: 0, label: formatBinInterval(n, r, t, u), lower: n, upper: r };
    }) as any[]);
  return (
    e.forEach((e: any) => {
      if (!Number.isFinite(e)) return;
      let t = (e - y) / v,
        n = Math.floor(t);
      (u && Math.abs(t - Math.round(t)) < 1e-9 && e > y && --n,
        e >= b && (n = S.length - 1),
        e <= y && (n = 0));
      let r = S[Math.max(0, Math.min(S.length - 1, n))];
      r && (r.count += 1);
    }),
    n && S.sort((e, t) => t.count - e.count || e.lower - t.lower),
    S
  );
}
function applyHistogramBinning(e: any, t: any, n: any) {
  let r = chartExLayoutId(t),
    i: any = t && typeof t == `object` ? t : null;
  if (!(
    r === `clusteredColumn` &&
    i?.layoutProperties &&
    typeof i.layoutProperties == `object` &&
    i.layoutProperties.binning != null
  ))
    return e;
  let a = e.values.filter((e: any) => typeof e == `number` && Number.isFinite(e));
  if (a.length === 0) return e;
  let o = computeHistogramBins(a, t, n);
  return o.length === 0
    ? e
    : {
        ...e,
        categories: o.map((e) => e.label),
        categoriesRef: null,
        raw: { ...e.raw, chartExHistogramBins: o, chartExSourceValues: a },
        values: o.map((e) => e.count),
      };
}
function buildParetoSeries(e: any, t: any, n: any) {
  let r = e.values.map((e: any) => (typeof e == `number` && Number.isFinite(e) ? e : 0)),
    i: any = r.reduce((e: any, t: any) => e + t, 0),
    a = 0,
    o = r.map((e: any) => ((a += e), i > 0 ? (a / i) * 100 : 0));
  return {
    ...e,
    color: void 0,
    lineColor: void 0,
    markerColor: void 0,
    markerLineColor: void 0,
    markerSize: 7,
    markerSymbol: `circle`,
    name: typeof t?.text == `string` ? t.text : `Pareto`,
    raw: {
      ...(e.raw ?? {}),
      chartExLayout: `paretoLine`,
      source: t && typeof t == `object` ? t : void 0,
    },
    values: o,
  };
}
function chartExTextValue(e: any) {
  if (typeof e == `string` && e.length > 0) return e;
  if (!e || typeof e != `object`) return;
  let t = e;
  if (typeof t.formula == `string` && t.formula.length > 0) return t.formula;
  if (typeof t.text == `string` && t.text.length > 0) return t.text;
  if (typeof t.value == `string` && t.value.length > 0) return t.value;
}
function chartExTitleText(e: any) {
  if (typeof e == `string` && e.length > 0) return e;
  if (!e || typeof e != `object`) return;
  let t = e;
  return typeof t.text == `string` && t.text.length > 0
    ? t.text
    : (t.text && typeof t.text == `object` ? chartExTextValue(t.text) : void 0) ||
        (typeof t.value == `string` && t.value.length > 0 ? t.value : void 0);
}
function hierarchyCategoryRef(e: any, t: any, n: any) {
  if (!n) return null;
  let r = resolveFormulaRange(e, t, n);
  return !r.sheet || !r.range || r.range.start.col <= 0
    ? null
    : normalizeSeriesRef({
        formula: formatAbsoluteRangeRef(
          r.sheetName,
          { col: r.range.start.col - 1, row: r.range.start.row },
          { col: r.range.start.col - 1, row: r.range.end.row },
        ),
      });
}
function buildChartExSeries(e: any, t: any, n: any, r: any, i: any, a: any, o: any) {
  let s = r && typeof r == `object` ? r : {},
    c: any = typeof s.dataId == `number` ? s.dataId : null,
    l = c == null ? null : (i.get(c) ?? null),
    u = Array.isArray(l?.dimensions)
      ? l.dimensions.filter((e: any) => !!(e && typeof e == `object`))
      : [],
    d = u.find((e: any) => e.dimType === `cat`) ?? u.find((e: any) => e.dimType === `name`) ?? null,
    f =
      u.find(
        (e: any) =>
          e.dimType === `val` ||
          e.dimType === `y` ||
          e.dimType === `colorVal` ||
          e.dimType === `size`,
      ) ??
      u.find((e: any) => e !== d) ??
      d,
    p = typeof d?.formula == `string` ? d.formula : void 0,
    m = typeof f?.formula == `string` ? f.formula : void 0,
    h = (o === `Sunburst` || o === `Treemap`) && !d && typeof m == `string` ? hierarchyCategoryRef(e, t, m) : null,
    g = d ? normalizeSeriesRef({ formula: p }) : h,
    _ = f ? normalizeSeriesRef({ formula: m }) : null,
    v = readFormulaValues(e, t, _, `value`),
    y = v.map((e: any) => (typeof e == `number` && Number.isFinite(e) ? e : null)),
    b =
      o === `RegionMap` && f?.dimType === `colorStr`
        ? v.map((e: any) => {
            if (typeof e == `string`) {
              let t = e.trim();
              return t.length > 0 ? t : null;
            }
            return typeof e == `number` && Number.isFinite(e) ? String(e) : null;
          })
        : [],
    x = readFormulaValues(e, t, g, `category`),
    S = o === `Sunburst` || o === `Treemap` ? readRangeStrings(e, t, g) : [],
    C = chartExTextValue(s.text),
    w = s.shapeProperties && typeof s.shapeProperties == `object` ? s.shapeProperties : void 0,
    T = typeof w?.solidFillHex == `string` ? normalizeHexColor(w.solidFillHex) : null,
    E = typeof w?.lineColorHex == `string` ? normalizeHexColor(w.lineColorHex) : null;
  return {
    bubbleSizeRef: null,
    bubbleSizes: [],
    categories: x,
    categoriesRef: g,
    color: T ?? void 0,
    dataPoints: Array.isArray(s.dataPoints) ? s.dataPoints : [],
    dataPointStyles: void 0,
    formatIdx: typeof s.formatIdx == `number` ? s.formatIdx : void 0,
    hidden: typeof s.hidden == `boolean` ? s.hidden : void 0,
    id: `${n}-series-${a}`,
    invertIfNegative: void 0,
    lineColor: E ?? T ?? void 0,
    lineWidthPx: typeof w?.lineWidth == `number` ? Math.max(1, Number(w.lineWidth) / emuPerPx) : void 0,
    marker: void 0,
    markerColor: T ?? void 0,
    markerLineColor: E ?? T ?? void 0,
    markerSize: void 0,
    markerSymbol: void 0,
    name: typeof s.text == `string` ? s.text : C ? resolveFormulaText(e, t, C) : resolveRangeTitle(e, t, _, `Series ${a + 1}`),
    negativeColor: void 0,
    negativeLineColor: void 0,
    raw: {
      ...s,
      chartExColorStrings: b,
      chartExHierarchyCategories: S,
      data: l,
      dimType: typeof f?.dimType == `string` ? f.dimType : void 0,
    },
    shapeProperties: w,
    smooth: void 0,
    values: y,
    valuesRef: _,
  };
}
function filterChartExSeries(e: any, t: any) {
  if (e !== `Funnel` && e !== `Waterfall`) {
    if (
      (e === `Sunburst` || e === `Treemap`) &&
      t.length > 1 &&
      t.every((e: any) => (e.raw && typeof e.raw == `object` ? e.raw : null)?.dimType === `size`)
    ) {
      let e = t.find((e: any) => e.hidden !== !0) ?? t[0] ?? null;
      return e ? [{ ...e, dataPoints: [], hidden: !1 }] : t;
    }
    return t;
  }
  let n = t.find((e: any) => e.hidden !== !0) ?? t[0] ?? null;
  return n ? [{ ...n, categories: [], categoriesRef: null, dataPoints: [], hidden: !1 }] : t;
}
function buildChartExModel(e: any, t: any, n: any, r: any, i: any, a: any) {
  let o = r && typeof r == `object` ? r : {},
    s = o.chartEx && typeof o.chartEx == `object` ? o.chartEx : {},
    c: any = s.plotArea && typeof s.plotArea == `object` ? s.plotArea : {},
    l = Array.isArray(c.series) ? c.series : [],
    u = l.map(chartExLayoutId),
    d = Array.isArray(s.data) ? s.data : [],
    f = new Map();
  d.forEach((e: any) => {
    if (!e || typeof e != `object`) return;
    let t = e;
    typeof t.id == `number` && f.set(t.id, t);
  });
  let p: any[] = Array.isArray(c.axes) ? c.axes.map(normalizeAxisModel).filter((e: any) => !!e) : [],
    m =
      typeof s.layout == `string` ? s.layout : u.find((e: any) => typeof e == `string` && e.length > 0),
    h = titleCaseLabel(m),
    g = chartExTitleText(s.title) ?? (s.title == null ? h : `Chart Title`),
    _ = chartExLayoutType(m),
    v = l.map((n: any, r: any) => buildChartExSeries(e, t, `chart-ex-${t}-${i}`, n, f, r, _)),
    y = u.findIndex((e: any) => e === `clusteredColumn`),
    b = u.includes(`paretoLine`),
    x = y >= 0 ? chartExAxisIds(l[y]) : [],
    S = u.findIndex((e: any) => e === `paretoLine`),
    C = S >= 0 ? chartExAxisIds(l[S]) : [],
    w = y >= 0 ? applyHistogramBinning(v[y] ?? v[0], l[y], b) : null,
    T = b && w && w.values.length > 0 ? buildParetoSeries(w, l[S], S) : null,
    E = T ? [w, T] : w ? [w, ...v.filter((e: any, t: any) => t !== y)] : filterChartExSeries(_, v),
    D = w ? `ColumnClustered` : _,
    O = w ? 0 : void 0,
    k = T
      ? [
          {
            axisIds: x,
            chartType: `ColumnClustered`,
            gapWidth: 0,
            raw: { gapWidth: 0, layout: `clusteredColumn` },
            series: [w],
          },
          { axisIds: C, chartType: `Line`, raw: { layout: `paretoLine` }, series: [T] },
        ]
      : [],
    A = {
      anchor: normalizeAnchorModel(o.anchor),
      autoTitleDeleted: void 0,
      axes: p,
      axisLabelColor: void 0,
      axisLineColor: void 0,
      categoryAxis: p[0] ?? null,
      chartAreaBorderColor: void 0,
      chartAreaFillColor: void 0,
      chartColorPalette: void 0,
      chartColorPaletteOffset: void 0,
      chartExLayout: m,
      chartPath: void 0,
      chartStyleId: void 0,
      chartType: D,
      dataLabels: l.length > 0 && l[0] && typeof l[0] == `object` ? normalizeDataLabelsModel(l[0].dataLabels) : null,
      displayBlanksAs: void 0,
      editable: !0,
      firstSliceAngle: void 0,
      fontFamily: void 0,
      gapWidth: O,
      holeSize: void 0,
      id: `chart-ex-${t}-${i}`,
      is3d: void 0,
      legend: normalizeLegendModel(s.legend),
      name: typeof o.name == `string` ? o.name : g,
      overlap: void 0,
      plotVisibleOnly: void 0,
      raw: s,
      radarStyle: void 0,
      scatterStyle: void 0,
      roundedCorners: void 0,
      shape3d: void 0,
      seriesAxis: null,
      series: E,
      sheetIndex: n,
      showDlblsOverMax: void 0,
      sideWall: null,
      backWall: null,
      bubbleScale: void 0,
      bubble3d: void 0,
      floor: null,
      surfaceMaterial: void 0,
      textColor: void 0,
      title: g,
      titleColor: void 0,
      titleFontFamily: void 0,
      typeGroups: k,
      valueAxis: p.find((e: any) => e.numberFormat || e.majorGridlines) ?? p[1] ?? null,
      varyColors: typeof s.valueColors == `boolean` ? s.valueColors : void 0,
      view3d: void 0,
      wireframe: void 0,
      workbookSheetIndex: t,
      zIndex:
        Array.isArray(o.drawingPath) && typeof o.drawingPath[0] == `number`
          ? o.drawingPath[0] + 1
          : i + 1,
    };
  return (applyChartStyleDefaults(A, a), A);
}
function cellValueToNumber(e: any) {
  if (typeof e == `number` && Number.isFinite(e)) return e;
  if (e && typeof e == `object`) {
    if (e.is_empty) return null;
    let t = [];
    (typeof e.asNumber == `function` && t.push(e.asNumber()),
      typeof e.toJs == `function` && t.push(e.toJs()),
      typeof e.asText == `function` && t.push(e.asText()),
      typeof e.toString == `function` && t.push(e.toString()));
    for (let e of t) {
      if (typeof e == `number` && Number.isFinite(e)) return e;
      if (typeof e == `string`) {
        let t = Number(e.replace(/,/g, ``));
        if (Number.isFinite(t)) return t;
      }
    }
  }
  if (typeof e == `string`) {
    let t = Number(e.replace(/,/g, ``));
    return Number.isFinite(t) ? t : null;
  }
  return null;
}
function cellValueToString(e: any) {
  if (e == null) return ``;
  if (typeof e == `string`) return e;
  if (typeof e == `number` || typeof e == `boolean`) return String(e);
  if (e && typeof e == `object`) {
    if (e.is_empty) return ``;
    let t = [];
    (typeof e.asText == `function` && t.push(e.asText()),
      typeof e.toJs == `function` && t.push(e.toJs()),
      typeof e.toString == `function` && t.push(e.toString()));
    for (let e of t) if (e != null) return typeof e == `string` ? e : String(e);
  }
  return String(e);
}
function readFormulaValues(e: any, t: any, n: any, r: any) {
  if (!n?.formula) return n?.values ?? [];
  let i: any = resolveFormulaRange(e, t, n.formula);
  if (!i.sheet || !i.range) return n.values ?? [];
  let a = [];
  for (let e = i.range.start.row; e <= i.range.end.row; e += 1)
    for (let t = i.range.start.col; t <= i.range.end.col; t += 1) {
      let n =
          typeof i.sheet.getCalculatedValueAt == `function`
            ? i.sheet.getCalculatedValueAt(e, t)
            : null,
        o =
          typeof i.sheet.getFormattedValueAt == `function` ? i.sheet.getFormattedValueAt(e, t) : n;
      if (r === `value`) a.push(cellValueToNumber(n ?? o));
      else {
        let e = cellValueToString(o ?? n),
          t: any = cellValueToNumber(n ?? o);
        a.push(e.length > 0 ? e : t === null ? null : t);
      }
    }
  return a;
}
function resolveFormulaText(e: any, t: any, n: any) {
  if (typeof n != `string` || !n) return;
  let r = resolveFormulaRange(e, t, n);
  return !r.sheet || !r.range
    ? n
    : cellValueToString(
        typeof r.sheet.getFormattedValueAt == `function`
          ? r.sheet.getFormattedValueAt(r.range.start.row, r.range.start.col)
          : null,
      ) || n;
}
function normalizeSeriesRef(e: any) {
  if (!e || typeof e != `object`) return null;
  let t = e,
    n: any = Array.isArray(t.numbers) ? t.numbers : Array.isArray(t.strings) ? t.strings : void 0;
  return {
    formula: typeof t.formula == `string` ? t.formula : void 0,
    refType: typeof t.refType == `string` ? t.refType : void 0,
    values: n,
  };
}
function normalizeChartExAxis(e: any) {
  if (!e || typeof e != `object`) return null;
  let t = e,
    n: any = t.axis && typeof t.axis == `object` ? t.axis : t,
    r: any = n.numberFormat && typeof n.numberFormat == `object` ? n.numberFormat : null;
  return {
    crossId: typeof t.crossId == `number` && Number.isFinite(t.crossId) ? t.crossId : void 0,
    crosses: typeof n.crosses == `string` ? n.crosses : void 0,
    crossBetween: typeof n.crossBetween == `string` ? n.crossBetween : void 0,
    delete: typeof n.delete == `boolean` ? n.delete : void 0,
    id: typeof t.id == `number` && Number.isFinite(t.id) ? t.id : void 0,
    labelPosition: typeof n.labelPosition == `string` ? n.labelPosition : void 0,
    logBase: typeof n.logBase == `number` ? n.logBase : void 0,
    orientation: typeof n.orientation == `string` ? n.orientation : void 0,
    majorUnit: typeof n.majorUnit == `number` ? n.majorUnit : void 0,
    max: typeof n.maximum == `number` ? n.maximum : void 0,
    min: typeof n.minimum == `number` ? n.minimum : void 0,
    majorGridlines: typeof n.majorGridlines == `boolean` ? n.majorGridlines : void 0,
    majorTickMark: typeof n.majorTickMark == `string` ? n.majorTickMark : void 0,
    minorUnit: typeof n.minorUnit == `number` ? n.minorUnit : void 0,
    minorGridlines: typeof n.minorGridlines == `boolean` ? n.minorGridlines : void 0,
    minorTickMark: typeof n.minorTickMark == `string` ? n.minorTickMark : void 0,
    numberFormat: r
      ? {
          formatCode: typeof r.formatCode == `string` ? r.formatCode : void 0,
          sourceLinked: typeof r.sourceLinked == `boolean` ? r.sourceLinked : void 0,
        }
      : void 0,
    position: typeof n.position == `string` ? n.position : void 0,
    raw: n,
    shapeProperties:
      n.shapeProperties && typeof n.shapeProperties == `object` ? n.shapeProperties : void 0,
    tickLabelSkip:
      typeof n.tickLabelSkip == `number` && Number.isFinite(n.tickLabelSkip)
        ? n.tickLabelSkip
        : void 0,
    tickMarkSkip:
      typeof n.tickMarkSkip == `number` && Number.isFinite(n.tickMarkSkip)
        ? n.tickMarkSkip
        : void 0,
  };
}
function mergeAxisModel(e: any, t: any) {
  return t ? { ...(e ?? {}), ...t } : (e ?? null);
}
function axisModelFromElement(e: any) {
  if (!e) return null;
  let t = firstChild(e, `numFmt`),
    n: any = firstChild(e, `scaling`);
  return {
    crossId: childNumericVal(e, `crossAx`),
    crosses: firstChild(e, `crosses`)?.getAttribute(`val`) ?? void 0,
    crossBetween: firstChild(e, `crossBetween`)?.getAttribute(`val`) ?? void 0,
    delete:
      firstChild(e, `delete`)?.getAttribute(`val`) === `1`
        ? !0
        : firstChild(e, `delete`)?.getAttribute(`val`) === `0`
          ? !1
          : void 0,
    id: childNumericVal(e, `axId`),
    labelPosition: firstChild(e, `tickLblPos`)?.getAttribute(`val`) ?? void 0,
    logBase: childNumericVal(firstChild(e, `scaling`), `logBase`),
    orientation: firstChild(n ?? e, `orientation`)?.getAttribute(`val`) ?? void 0,
    majorGridlines: !!firstChild(e, `majorGridlines`),
    majorTickMark: firstChild(e, `majorTickMark`)?.getAttribute(`val`) ?? void 0,
    majorUnit: childNumericVal(e, `majorUnit`),
    max: childNumericVal(n, `max`),
    min: childNumericVal(n, `min`),
    minorGridlines: !!firstChild(e, `minorGridlines`),
    minorTickMark: firstChild(e, `minorTickMark`)?.getAttribute(`val`) ?? void 0,
    minorUnit: childNumericVal(e, `minorUnit`),
    numberFormat: t
      ? {
          formatCode: t.getAttribute(`formatCode`) ?? void 0,
          sourceLinked:
            t.getAttribute(`sourceLinked`) === `1`
              ? !0
              : t.getAttribute(`sourceLinked`) === `0`
                ? !1
                : void 0,
        }
      : void 0,
    position: firstChild(e, `axPos`)?.getAttribute(`val`) ?? void 0,
    tickLabelSkip: childNumericVal(e, `tickLblSkip`),
    tickMarkSkip: childNumericVal(e, `tickMarkSkip`),
  };
}
function wallModelFromElement(e: any, t: any) {
  if (!e) return null;
  let n = firstChild(e, `spPr`),
    r: any = resolveShapeLineProperties(n, t);
  return {
    fillColor: resolveShapeFillColor(n, t) ?? void 0,
    hidden: n ? firstChild(n, `noFill`) != null : void 0,
    lineColor: r.color ?? void 0,
    thickness: childNumericVal(e, `thickness`),
  };
}
function normalizeDataLabelsModel(e: any) {
  if (!e || typeof e != `object`) return null;
  let t = e,
    n: any = Array.isArray(t.pointLabels)
      ? (() => {
          let e = [];
          for (let n of t.pointLabels) {
            if (!n || typeof n != `object`) continue;
            let t = n,
              r: any = typeof t.index == `number` && Number.isFinite(t.index) ? t.index : null;
            if (r == null) continue;
            let i: any = { index: r };
            (typeof t.deleted == `boolean` && (i.deleted = t.deleted),
              typeof t.fontSizePt == `number` &&
                Number.isFinite(t.fontSizePt) &&
                (i.fontSizePt = t.fontSizePt),
              typeof t.showBubbleSize == `boolean` && (i.showBubbleSize = t.showBubbleSize),
              typeof t.showCategoryName == `boolean` && (i.showCategoryName = t.showCategoryName),
              typeof t.showPercent == `boolean` && (i.showPercent = t.showPercent),
              typeof t.showSeriesName == `boolean` && (i.showSeriesName = t.showSeriesName),
              typeof t.showValue == `boolean` && (i.showValue = t.showValue),
              typeof t.x == `number` && Number.isFinite(t.x) && (i.x = t.x),
              typeof t.y == `number` && Number.isFinite(t.y) && (i.y = t.y),
              e.push(i));
          }
          return e;
        })()
      : void 0;
  return {
    pointLabels: n && n.length > 0 ? n : void 0,
    raw: t,
    showBubbleSize: typeof t.showBubbleSize == `boolean` ? t.showBubbleSize : void 0,
    showCategoryName:
      typeof (t.showCategoryName ?? t.visibilityCategoryName) == `boolean`
        ? !!(t.showCategoryName ?? t.visibilityCategoryName)
        : void 0,
    showLegendKey: typeof t.showLegendKey == `boolean` ? t.showLegendKey : void 0,
    showPercent: typeof t.showPercent == `boolean` ? t.showPercent : void 0,
    showSeriesName:
      typeof (t.showSeriesName ?? t.visibilitySeriesName) == `boolean`
        ? !!(t.showSeriesName ?? t.visibilitySeriesName)
        : void 0,
    showValue:
      typeof (t.showValue ?? t.visibilityValue) == `boolean`
        ? !!(t.showValue ?? t.visibilityValue)
        : void 0,
  };
}
function normalizeAnchorModel(e: any) {
  if (!e || typeof e != `object`)
    return {
      kind: `two-cell`,
      from: { col: 0, colOffsetEmu: 0, row: 0, rowOffsetEmu: 0 },
      to: { col: 8, colOffsetEmu: 0, row: 15, rowOffsetEmu: 0 },
    };
  let t = e,
    n: any = t.from && typeof t.from == `object` ? t.from : null;
  if (t.type === `oneCell`)
    return {
      from: {
        col: typeof n?.col == `number` ? n.col : 0,
        colOffsetEmu: typeof n?.colOffsetEmu == `number` ? n.colOffsetEmu : 0,
        row: typeof n?.row == `number` ? n.row : 0,
        rowOffsetEmu: typeof n?.rowOffsetEmu == `number` ? n.rowOffsetEmu : 0,
      },
      kind: `one-cell`,
      sizeEmu: {
        cx: typeof t.widthEmu == `number` ? t.widthEmu : 0,
        cy: typeof t.heightEmu == `number` ? t.heightEmu : 0,
      },
    };
  if (t.type === `absolute`)
    return {
      kind: `absolute`,
      positionEmu: {
        x: typeof t.xEmu == `number` ? t.xEmu : 0,
        y: typeof t.yEmu == `number` ? t.yEmu : 0,
      },
      sizeEmu: {
        cx: typeof t.widthEmu == `number` ? t.widthEmu : 0,
        cy: typeof t.heightEmu == `number` ? t.heightEmu : 0,
      },
    };
  let r = t.to && typeof t.to == `object` ? t.to : null,
    i = n?.col,
    a = n?.colOffsetEmu,
    o = n?.row,
    s = n?.rowOffsetEmu,
    c: any = r?.col,
    l = r?.colOffsetEmu,
    u = r?.row,
    d = r?.rowOffsetEmu;
  return {
    kind: `two-cell`,
    from: {
      col: typeof i == `number` ? i : 0,
      colOffsetEmu: typeof a == `number` ? a : 0,
      row: typeof o == `number` ? o : 0,
      rowOffsetEmu: typeof s == `number` ? s : 0,
    },
    to: {
      col: typeof c == `number` ? c : 0,
      colOffsetEmu: typeof l == `number` ? l : 0,
      row: typeof u == `number` ? u : 0,
      rowOffsetEmu: typeof d == `number` ? d : 0,
    },
  };
}
function anchorMarkerFromElement(e: any) {
  if (!e) return null;
  let t = Number(firstChild(e, `col`)?.textContent ?? NaN),
    n: any = Number(firstChild(e, `row`)?.textContent ?? NaN),
    r: any = Number(firstChild(e, `colOff`)?.textContent ?? 0),
    i = Number(firstChild(e, `rowOff`)?.textContent ?? 0);
  return !Number.isFinite(t) || !Number.isFinite(n)
    ? null
    : {
        col: Math.max(0, Math.round(t)),
        colOffsetEmu: Number.isFinite(r) ? Math.max(0, Math.round(r)) : 0,
        row: Math.max(0, Math.round(n)),
        rowOffsetEmu: Number.isFinite(i) ? Math.max(0, Math.round(i)) : 0,
      };
}
function anchorFromElement(e: any) {
  if (e.localName === `twoCellAnchor`) {
    let t = anchorMarkerFromElement(firstChild(e, `from`)),
      n: any = anchorMarkerFromElement(firstChild(e, `to`));
    return t && n ? { from: t, kind: `two-cell`, to: n } : null;
  }
  if (e.localName === `oneCellAnchor`) {
    let t = anchorMarkerFromElement(firstChild(e, `from`)),
      n: any = firstChild(e, `ext`),
      r: any = Number(n?.getAttribute(`cx`) ?? NaN),
      i = Number(n?.getAttribute(`cy`) ?? NaN);
    return t && Number.isFinite(r) && Number.isFinite(i)
      ? {
          from: t,
          kind: `one-cell`,
          sizeEmu: { cx: Math.max(0, Math.round(r)), cy: Math.max(0, Math.round(i)) },
        }
      : null;
  }
  let t = firstChild(e, `pos`),
    n: any = firstChild(e, `ext`),
    r: any = Number(t?.getAttribute(`x`) ?? NaN),
    i = Number(t?.getAttribute(`y`) ?? NaN),
    a = Number(n?.getAttribute(`cx`) ?? NaN),
    o = Number(n?.getAttribute(`cy`) ?? NaN);
  return Number.isFinite(r) && Number.isFinite(i) && Number.isFinite(a) && Number.isFinite(o)
    ? {
        kind: `absolute`,
        positionEmu: { x: Math.round(r), y: Math.round(i) },
        sizeEmu: { cx: Math.max(0, Math.round(a)), cy: Math.max(0, Math.round(o)) },
      }
    : null;
}
function isAnchorInverted(e: any) {
  if (e.kind !== `two-cell`) return !1;
  let t =
      e.to.col < e.from.col ||
      (e.to.col === e.from.col && e.to.colOffsetEmu <= e.from.colOffsetEmu),
    n =
      e.to.row < e.from.row ||
      (e.to.row === e.from.row && e.to.rowOffsetEmu <= e.from.rowOffsetEmu);
  return t || n;
}
function buildJsonChartSeries(e: any, t: any, n: any, r: any, i: any) {
  let a = r && typeof r == `object` ? r : {},
    o = normalizeSeriesRef(a.categories),
    s = normalizeSeriesRef(a.values),
    c: any = a.shapeProperties && typeof a.shapeProperties == `object` ? a.shapeProperties : void 0,
    l = typeof c?.solidFillHex == `string` ? normalizeHexColor(c.solidFillHex) : null,
    u = typeof c?.lineColorHex == `string` ? normalizeHexColor(c.lineColorHex) : null,
    d = normalizeSeriesRef(a.bubbleSize ?? a.bubbleSizes ?? a.bubbles);
  return {
    bubbleSizeRef: d,
    bubbleSizes: readFormulaValues(e, t, d, `value`).map((e: any) =>
      typeof e == `number` && Number.isFinite(e) ? e : null,
    ),
    categories: readFormulaValues(e, t, o, `category`),
    categoriesRef: o,
    color: l ?? void 0,
    dataPoints: Array.isArray(a.dataPoints) ? a.dataPoints : [],
    dataPointStyles: void 0,
    id: `${n}-series-${i}`,
    invertIfNegative: typeof a.invertIfNegative == `boolean` ? a.invertIfNegative : void 0,
    lineColor: u ?? l ?? void 0,
    lineWidthPx: typeof c?.lineWidth == `number` ? Math.max(1, Number(c.lineWidth) / emuPerPx) : void 0,
    marker: a.marker && typeof a.marker == `object` ? a.marker : void 0,
    markerColor: void 0,
    markerLineColor: void 0,
    markerSize:
      a.marker && typeof a.marker == `object` && typeof a.marker.size == `number`
        ? Number(a.marker.size)
        : void 0,
    markerSymbol:
      a.marker && typeof a.marker == `object` && typeof a.marker.symbol == `string`
        ? String(a.marker.symbol)
        : void 0,
    name: resolveFormulaText(e, t, a.name),
    negativeColor: void 0,
    negativeLineColor: void 0,
    raw: a,
    shapeProperties: c,
    smooth: typeof a.smooth == `boolean` ? a.smooth : void 0,
    values: readFormulaValues(e, t, s, `value`).map((e: any) =>
      typeof e == `number` && Number.isFinite(e) ? e : null,
    ),
    valuesRef: s,
  };
}
function buildJsonChartTypeGroup(e: any, t: any, n: any, r: any, i: any) {
  if (!r || typeof r != `object`) return null;
  let a = r,
    o = Array.isArray(a.series) ? a.series : [];
  return {
    axisIds: Array.isArray(a.axisIds)
      ? a.axisIds.filter((e: any) => typeof e == `number` && Number.isFinite(e))
      : void 0,
    chartType: typeof a.chartType == `string` ? a.chartType : `ColumnClustered`,
    dataLabels: normalizeDataLabelsModel(a.dataLabels),
    gapWidth: typeof a.gapWidth == `number` && Number.isFinite(a.gapWidth) ? a.gapWidth : void 0,
    is3d: typeof a.is3D == `boolean` ? a.is3D : void 0,
    overlap: typeof a.overlap == `number` && Number.isFinite(a.overlap) ? a.overlap : void 0,
    raw: a,
    series: o.map((r: any, a: any) => buildJsonChartSeries(e, t, `${n}-group-${i}`, r, a)),
    varyColors: typeof a.varyColors == `boolean` ? a.varyColors : void 0,
  };
}
function buildChartsheetTab(e: any, t: any) {
  let n = e && typeof e == `object` ? e : {};
  return {
    chartIds: Array.isArray(n.chartIds) ? n.chartIds.filter((e: any) => typeof e == `string`) : [],
    chartPath: typeof n.chartPath == `string` ? n.chartPath : void 0,
    id: `chartsheet-${t}`,
    index: t,
    name: typeof n.name == `string` ? n.name : `Chart ${t + 1}`,
    raw: n,
    workbookSheetIndex: typeof n.workbookSheetIndex == `number` ? n.workbookSheetIndex : void 0,
  };
}
function buildSheetTabList(e: any, t: any, n: any, r = !1) {
  let i = Array.isArray(e.sheetOrder) ? e.sheetOrder : [];
  return i.length === 0
    ? e.sheetNames.flatMap((t: any, i: any) => {
        let a = normalizeSheetVisibility(e.getSheet(i).visibility);
        return !r && a !== `visible`
          ? []
          : [
              {
                id: `sheet-${i}`,
                index: i,
                kind: `sheet`,
                name: t,
                sheetIndex: n.get(i) ?? i,
                visibility: a,
                workbookSheetIndex: i,
              },
            ];
      })
    : i.flatMap((i: any, a: any) => {
        let o = typeof i.slotType == `string` ? i.slotType : `worksheet`,
          s = typeof i.index == `number` ? i.index : a;
        if (o === `chartsheet`) {
          let e = t[s];
          return e
            ? [
                {
                  chartsheetIndex: s,
                  id: `chartsheet-${s}`,
                  index: a,
                  kind: `chartsheet`,
                  name: e.name,
                },
              ]
            : [];
        }
        let c: any = e.getSheet(s),
          l = normalizeSheetVisibility(c.visibility);
        return !r && l !== `visible`
          ? []
          : [
              {
                id: `sheet-${s}`,
                index: a,
                kind: `sheet`,
                name: c.name,
                sheetIndex: n.get(s) ?? s,
                visibility: l,
                workbookSheetIndex: s,
              },
            ];
      });
}
function drawingChartRefs(e: any, t: any) {
  if (!t) return [];
  let n = [];
  for (let r of t.attachments) {
    let i = partText(e, r.drawingPath),
      a = partText(e, r.drawingRelsPath);
    if (!i || !a) continue;
    let o = parseXmlDocument(i),
      s: any = parseXmlDocument(a);
    if (!o || !s) continue;
    let c: any = new Map();
    for (let e of descendantElements(s, `Relationship`)) {
      let t = e.getAttribute(`Id`),
        n: any = e.getAttribute(`Target`),
        i = e.getAttribute(`Type`);
      t && n && c.set(t, { target: resolvePartTarget(r.drawingRelsPath ?? r.drawingPath, n), type: i });
    }
    let l = (Array.from(o.documentElement.childNodes) as any[]).filter(
        (e) =>
          e.nodeType === Node.ELEMENT_NODE &&
          (e.localName === `twoCellAnchor` ||
            e.localName === `oneCellAnchor` ||
            e.localName === `absoluteAnchor`),
      ),
      u = 0;
    for (let e of l) {
      let i = firstDescendant(e, `graphicFrame`),
        a = i ? firstDescendant(i, `chart`) : null,
        o =
          a?.getAttributeNS(
            `http://schemas.openxmlformats.org/officeDocument/2006/relationships`,
            `id`,
          ) ??
          a?.getAttribute(`r:id`) ??
          a?.getAttribute(`id`);
      if (!o) continue;
      let s = c.get(o);
      !s ||
        (s.type !== chartRelNamespace && s.type !== chartExRelNamespace) ||
        (n.push({
          anchorIndex: u,
          anchor: anchorFromElement(e),
          chartKind: s.type === chartExRelNamespace ? `modern` : `classic`,
          chartPath: s.target,
          drawingPath: r.drawingPath,
          workbookSheetIndex: t.workbookSheetIndex,
        }),
        (u += 1));
    }
  }
  return n;
}
function assignChartOrigins(e: any, t: any, n: any, r: any) {
  for (let i = 0; i < e.length; i += 1) {
    let a = e[i] ?? [],
      o = drawingChartRefs(n, r[i] ?? null),
      s: any = {
        classic: o.filter((e) => e.chartKind === `classic`),
        modern: o.filter((e) => e.chartKind === `modern`),
      },
      c: any = { classic: 0, modern: 0 };
    a.forEach((e: any) => {
      let n = e.id.startsWith(`chart-ex-`) ? `modern` : `classic`,
        r: any = s[n][c[n]];
      ((c[n] += 1),
        r &&
          (((r.anchor && isAnchorInverted(e.anchor)) ||
            (r.anchor &&
              e.anchor.kind === `two-cell` &&
              e.anchor.from.col === 0 &&
              e.anchor.from.row === 0)) &&
            (e.anchor = r.anchor),
          (e.chartPath = r.chartPath ?? void 0),
          t.set(e.id, r)));
    });
  }
}
export function hydrateChartAssets(e: any, t: any, n: any, r = !1) {
  let i = new Set(),
    a = (Array.from({ length: e.sheetCount }, (r, a) => {
      let o = e.getSheet(a),
        s: any = o.charts,
        c = o.chartsEx,
        l = n.get(a) ?? a,
        u = s.map((t: any, n: any) => {
          let r = `chart-${a}-${n}`;
          (t.hidden || !t.anchor) && i.add(r);
          let o = t && typeof t == `object` ? t : {},
            s: any = o.chart && typeof o.chart == `object` ? o.chart : {},
            c = s.view3D && typeof s.view3D == `object` ? s.view3D : null,
            u = Array.isArray(s.series) ? s.series : [],
            d = normalizeDataLabelsModel(s.dataLabels),
            f = u.length > 0 && u[0] && typeof u[0] == `object` ? normalizeDataLabelsModel(u[0].dataLabels) : null;
          return {
            anchor: normalizeAnchorModel(o.anchor),
            autoTitleDeleted: typeof s.autoTitleDeleted == `boolean` ? s.autoTitleDeleted : void 0,
            axes: Array.isArray(s.axes) ? s.axes.map(normalizeChartExAxis).filter((e: any) => !!e) : [],
            axisLabelColor: void 0,
            axisLineColor: void 0,
            categoryAxis: normalizeChartExAxis(s.categoryAxis),
            chartAreaBorderColor: void 0,
            chartAreaFillColor: void 0,
            chartColorPalette: void 0,
            chartColorPaletteOffset: void 0,
            chartPath: void 0,
            chartStyleId: void 0,
            chartType: typeof s.chartType == `string` ? s.chartType : `ColumnClustered`,
            dataLabels: d ?? f,
            displayBlanksAs: typeof s.displayBlanksAs == `string` ? s.displayBlanksAs : void 0,
            editable: !0,
            firstSliceAngle: typeof s.firstSliceAngle == `number` ? s.firstSliceAngle : void 0,
            fontFamily: void 0,
            gapWidth: typeof s.gapWidth == `number` ? s.gapWidth : void 0,
            holeSize: typeof s.holeSize == `number` ? s.holeSize : void 0,
            id: r,
            is3d: typeof s.is3D == `boolean` ? s.is3D : void 0,
            legend: normalizeChartLegend(s.legend) ? { ...normalizeChartLegend(s.legend), position: legendPositionCode(normalizeChartLegend(s.legend)?.position) } : null,
            name: typeof o.name == `string` ? o.name : void 0,
            overlap: typeof s.overlap == `number` ? s.overlap : void 0,
            plotVisibleOnly: typeof s.plotVisibleOnly == `boolean` ? s.plotVisibleOnly : void 0,
            raw: s,
            radarStyle: typeof s.radarStyle == `string` ? s.radarStyle : void 0,
            scatterStyle: typeof s.scatterStyle == `string` ? s.scatterStyle : void 0,
            roundedCorners: typeof s.roundedCorners == `boolean` ? s.roundedCorners : void 0,
            shape3d:
              typeof s.shape == `string`
                ? s.shape
                : typeof s.shape3d == `string`
                  ? s.shape3d
                  : void 0,
            seriesAxis: null,
            series: u.map((t: any, n: any) => buildJsonChartSeries(e, a, r, t, n)),
            sheetIndex: l,
            showDlblsOverMax: typeof s.showDlblsOverMax == `boolean` ? s.showDlblsOverMax : void 0,
            sideWall: null,
            backWall: null,
            bubbleScale: typeof s.bubbleScale == `number` ? s.bubbleScale : void 0,
            bubble3d: typeof s.bubble3d == `boolean` ? s.bubble3d : void 0,
            floor: null,
            surfaceMaterial: void 0,
            textColor: void 0,
            title: typeof s.title == `string` ? s.title : void 0,
            titleColor: void 0,
            titleFontFamily: void 0,
            typeGroups: Array.isArray(s.typeGroups)
              ? s.typeGroups.map((t: any, n: any) => buildJsonChartTypeGroup(e, a, r, t, n)).filter((e: any) => e != null)
              : [],
            valueAxis: normalizeChartExAxis(s.valueAxis),
            varyColors: typeof s.varyColors == `boolean` ? s.varyColors : void 0,
            view3d: c
              ? {
                  depthPercent: typeof c.depthPercent == `number` ? c.depthPercent : void 0,
                  perspective: typeof c.perspective == `number` ? c.perspective : void 0,
                  rAngAx:
                    typeof c.rAngAx == `boolean`
                      ? c.rAngAx
                      : typeof c.rightAngleAxes == `boolean`
                        ? c.rightAngleAxes
                        : void 0,
                  rotX:
                    typeof c.rotX == `number`
                      ? c.rotX
                      : typeof c.rotateX == `number`
                        ? c.rotateX
                        : void 0,
                  rotY:
                    typeof c.rotY == `number`
                      ? c.rotY
                      : typeof c.rotateY == `number`
                        ? c.rotateY
                        : void 0,
                }
              : void 0,
            wireframe: typeof s.wireframe == `boolean` ? s.wireframe : void 0,
            workbookSheetIndex: a,
            zIndex:
              Array.isArray(o.drawingPath) && typeof o.drawingPath[0] == `number`
                ? o.drawingPath[0] + 1
                : n + 1,
          };
        }),
        d = c.map((n: any, r: any) => {
          let o = `chart-ex-${a}-${r}`;
          return ((n.hidden || !n.anchor) && i.add(o), buildChartExModel(e, a, l, n, r, t?.themePalette ?? null));
        });
      return [...u, ...d];
    }) as any[]),
    o = Array.isArray(e.chartsheets) ? e.chartsheets.map((e: any, t: any) => buildChartsheetTab(e, t)) : [],
    s = buildSheetTabList(e, o, n, r),
    c = new Map();
  if (t) {
    assignChartOrigins(a, c, t.archive, t.sheetOrigins);
    for (let e = 0; e < a.length; e += 1) a[e] = (a[e] ?? []).filter((e: any) => !i.has(e.id));
    for (let e of i) c.delete(e);
    for (let e of a)
      for (let n of e) (hydrateChartFromPartXml(n, n.chartPath, t.archive, t.themePalette), applyChartStyleDefaults(n, t.themePalette));
  } else {
    for (let e = 0; e < a.length; e += 1) a[e] = (a[e] ?? []).filter((e: any) => !i.has(e.id));
    for (let e of a) for (let t of e) applyChartStyleDefaults(t, null);
  }
  return { chartOriginsById: c, chartsByWorkbookSheetIndex: a, chartsheets: o, tabs: s };
}
function chartAnchorElements(e: any) {
  return (Array.from(e.documentElement.childNodes) as any[])
    .filter(
      (e) =>
        e.nodeType === Node.ELEMENT_NODE &&
        (e.localName === `twoCellAnchor` ||
          e.localName === `oneCellAnchor` ||
          e.localName === `absoluteAnchor`),
    )
    .filter((e) => {
      let t = firstChild(e, `graphicFrame`);
      return !!(t && firstDescendant(t, `chart`));
    });
}
function writeAnchorMarker(e: any, t: any) {
  e &&
    (ensureChildTextElement(e, `col`, String(Math.max(0, Math.round(t.col)))),
    ensureChildTextElement(e, `colOff`, String(Math.max(0, Math.round(t.colOffsetEmu)))),
    ensureChildTextElement(e, `row`, String(Math.max(0, Math.round(t.row)))),
    ensureChildTextElement(e, `rowOff`, String(Math.max(0, Math.round(t.rowOffsetEmu)))));
}
function writeAnchorGeometry(e: any, t: any) {
  if (t.kind === `two-cell`) {
    (writeAnchorMarker(firstChild(e, `from`), t.from), writeAnchorMarker(firstChild(e, `to`), t.to));
    return;
  }
  if (t.kind === `one-cell`) {
    writeAnchorMarker(firstChild(e, `from`), t.from);
    let n = firstChild(e, `ext`);
    n &&
      (n.setAttribute(`cx`, String(Math.max(0, Math.round(t.sizeEmu.cx)))),
      n.setAttribute(`cy`, String(Math.max(0, Math.round(t.sizeEmu.cy)))));
    return;
  }
  let n = firstChild(e, `pos`);
  n &&
    (n.setAttribute(`x`, String(Math.max(0, Math.round(t.positionEmu.x)))),
    n.setAttribute(`y`, String(Math.max(0, Math.round(t.positionEmu.y)))));
  let r = firstChild(e, `ext`);
  r &&
    (r.setAttribute(`cx`, String(Math.max(0, Math.round(t.sizeEmu.cx)))),
    r.setAttribute(`cy`, String(Math.max(0, Math.round(t.sizeEmu.cy)))));
}
function writeChartTitle(e: any, t: any) {
  let n = firstChild(e, `title`);
  if (!t) {
    n?.remove();
    return;
  }
  let r = n ?? e.insertBefore(e.ownerDocument.createElementNS(chartXmlNamespace, `c:title`), e.firstChild);
  for (; r.firstChild;) r.removeChild(r.firstChild);
  let i = r.ownerDocument.createElementNS(chartXmlNamespace, `c:tx`),
    a = r.ownerDocument.createElementNS(chartXmlNamespace, `c:rich`),
    o = r.ownerDocument.createElementNS(drawingXmlNamespace, `a:bodyPr`),
    s: any = r.ownerDocument.createElementNS(drawingXmlNamespace, `a:lstStyle`),
    c = r.ownerDocument.createElementNS(drawingXmlNamespace, `a:p`),
    l = r.ownerDocument.createElementNS(drawingXmlNamespace, `a:r`),
    u = r.ownerDocument.createElementNS(drawingXmlNamespace, `a:t`);
  ((u.textContent = t),
    l.appendChild(u),
    c.appendChild(l),
    a.append(o, s, c),
    i.appendChild(a),
    r.appendChild(i));
}
function writeRefFormula(e: any, t: any, n: any) {
  if (!n) {
    removeChildElements(e, t);
    return;
  }
  ensureChildTextElement(ensureChildElement(e, t), `f`, n);
}
function writeSeriesName(e: any, t: any) {
  let n = t.raw && typeof t.raw == `object` ? t.raw : null,
    r: any = typeof n?.name == `string` && n.name.length > 0 ? n.name : void 0;
  if (!r && t.name === void 0) return;
  let i = ensureChildElement(e, `tx`);
  if ((removeChildElements(i, `strRef`), removeChildElements(i, `v`), r)) {
    ensureChildTextElement(ensureChildElement(i, `strRef`), `f`, r);
    return;
  }
  ensureChildTextElement(i, `v`, t.name ?? ``);
}
function writeSeriesFormulas(e: any, t: any) {
  if (!t.series) return;
  let n = descendantElements(e, `ser`);
  t.series.forEach((e: any, r: any) => {
    let i = n[r];
    if (i) {
      if ((writeSeriesName(i, e), e.categoriesRef?.formula)) {
        let n =
          firstChild(i, `xVal`) ??
          firstChild(i, `cat`) ??
          (t.chartType === `Scatter` ||
          t.chartType === `ScatterLines` ||
          t.chartType === `ScatterSmooth` ||
          t.chartType === `Bubble`
            ? ensureChildElement(i, `xVal`)
            : ensureChildElement(i, `cat`));
        writeRefFormula(
          n,
          n.localName === `xVal` || firstChild(n, `numRef`) ? `numRef` : `strRef`,
          e.categoriesRef.formula,
        );
      }
      (e.valuesRef?.formula &&
        writeRefFormula(
          firstChild(i, `yVal`) ??
            firstChild(i, `val`) ??
            (t.chartType === `Scatter` ||
            t.chartType === `ScatterLines` ||
            t.chartType === `ScatterSmooth` ||
            t.chartType === `Bubble`
              ? ensureChildElement(i, `yVal`)
              : ensureChildElement(i, `val`)),
          `numRef`,
          e.valuesRef.formula,
        ),
        e.bubbleSizeRef &&
          writeRefFormula(firstChild(i, `bubbleSize`) ?? ensureChildElement(i, `bubbleSize`), `numRef`, e.bubbleSizeRef.formula),
        e.invertIfNegative !== void 0 && ensureBooleanChildElement(i, `invertIfNegative`, e.invertIfNegative),
        e.smooth !== void 0 && ensureBooleanChildElement(i, `smooth`, e.smooth));
    }
  });
}
function writeAxisProperties(e: any, t: any) {
  if (!(!e || !t)) {
    if (
      (t.position &&
        (ensureChildTextElement(ensureChildElement(e, `axPos`), `val`, t.position), firstChild(e, `axPos`)?.setAttribute(`val`, t.position)),
      t.majorGridlines !== void 0)
    ) {
      let n = firstChild(e, `majorGridlines`);
      t.majorGridlines && !n
        ? e.appendChild(e.ownerDocument.createElementNS(chartXmlNamespace, `c:majorGridlines`))
        : t.majorGridlines || n?.remove();
    }
    if (t.minorGridlines !== void 0) {
      let n = firstChild(e, `minorGridlines`);
      t.minorGridlines && !n
        ? e.appendChild(e.ownerDocument.createElementNS(chartXmlNamespace, `c:minorGridlines`))
        : t.minorGridlines || n?.remove();
    }
    if (
      (t.majorTickMark &&
        (firstChild(e, `majorTickMark`)?.setAttribute(`val`, t.majorTickMark) ??
          ensureBooleanChildElement(e, `majorTickMark`, !1).setAttribute(`val`, t.majorTickMark)),
      t.minorTickMark &&
        (firstChild(e, `minorTickMark`)?.setAttribute(`val`, t.minorTickMark) ??
          ensureBooleanChildElement(e, `minorTickMark`, !1).setAttribute(`val`, t.minorTickMark)),
      t.labelPosition &&
        (firstChild(e, `tickLblPos`)?.setAttribute(`val`, t.labelPosition) ??
          ensureBooleanChildElement(e, `tickLblPos`, !1).setAttribute(`val`, t.labelPosition)),
      t.crosses &&
        (firstChild(e, `crosses`)?.setAttribute(`val`, t.crosses) ??
          ensureBooleanChildElement(e, `crosses`, !1).setAttribute(`val`, t.crosses)),
      t.crossBetween &&
        (firstChild(e, `crossBetween`)?.setAttribute(`val`, t.crossBetween) ??
          ensureBooleanChildElement(e, `crossBetween`, !1).setAttribute(`val`, t.crossBetween)),
      t.delete !== void 0 && ensureBooleanChildElement(e, `delete`, t.delete),
      t.numberFormat?.formatCode)
    ) {
      let n = ensureChildElement(e, `numFmt`);
      (n.setAttribute(`formatCode`, t.numberFormat.formatCode),
        t.numberFormat.sourceLinked !== void 0 &&
          n.setAttribute(`sourceLinked`, t.numberFormat.sourceLinked ? `1` : `0`));
    }
  }
}
function writeDataLabelFlags(e: any, t: any) {
  if (!t) return;
  let n = ensureChildElement(e, `dLbls`);
  (t.showLegendKey !== void 0 && ensureBooleanChildElement(n, `showLegendKey`, t.showLegendKey),
    t.showValue !== void 0 && ensureBooleanChildElement(n, `showVal`, t.showValue),
    t.showCategoryName !== void 0 && ensureBooleanChildElement(n, `showCatName`, t.showCategoryName),
    t.showSeriesName !== void 0 && ensureBooleanChildElement(n, `showSerName`, t.showSeriesName),
    t.showPercent !== void 0 && ensureBooleanChildElement(n, `showPercent`, t.showPercent),
    t.showBubbleSize !== void 0 && ensureBooleanChildElement(n, `showBubbleSize`, t.showBubbleSize));
}
export function updateChartAnchorInImageAssets(e: any, t: any, n: any, r: any) {
  let i = t.chartOriginsById.get(n);
  if (!i) return !1;
  let a: any = partText(e.archive, i.drawingPath);
  if (!a) return !1;
  let o = parseXmlDocument(a);
  if (!o) return !1;
  let s = chartAnchorElements(o)[i.anchorIndex];
  return s
    ? (writeAnchorGeometry(s, r),
      (e.archive[normalizePartPath(i.drawingPath)] = j(serializeXmlDocument(o))),
      e.dirtyArchivePaths.add(normalizePartPath(i.drawingPath)),
      !0)
    : !1;
}
export function updateChartInImageAssets(e: any, t: any, n: any, r: any) {
  let i = t.chartOriginsById.get(n);
  if (!i?.chartPath) return !1;
  let a: any = partText(e.archive, i.chartPath);
  if (!a) return !1;
  let o = parseXmlDocument(a);
  if (!o) return !1;
  let s = firstDescendant(o, `chart`),
    c = s ? firstChild(s, `plotArea`) : null,
    l = chartTypeElement(c);
  return !s || !c || !l
    ? !1
    : (r.title !== void 0 && writeChartTitle(s, r.title),
      r.displayBlanksAs && ensureChildElement(s, `dispBlanksAs`).setAttribute(`val`, r.displayBlanksAs),
      r.roundedCorners !== void 0 && ensureBooleanChildElement(s, `roundedCorners`, r.roundedCorners),
      r.showDlblsOverMax !== void 0 && ensureBooleanChildElement(s, `showDLblsOverMax`, r.showDlblsOverMax),
      r.varyColors !== void 0 && ensureBooleanChildElement(l, `varyColors`, r.varyColors),
      r.gapWidth !== void 0 && ensureIntegerChildElement(l, `gapWidth`, r.gapWidth),
      r.overlap !== void 0 && ensureChildElement(l, `overlap`).setAttribute(`val`, String(Math.round(r.overlap))),
      r.dataLabels && writeDataLabelFlags(l, r.dataLabels),
      writeSeriesFormulas(c, r),
      writeAxisProperties(childElements(c, `catAx`)[0] ?? childElements(c, `dateAx`)[0] ?? childElements(c, `serAx`)[0] ?? null, r.categoryAxis),
      writeAxisProperties(childElements(c, `valAx`)[0] ?? null, r.valueAxis),
      (e.archive[normalizePartPath(i.chartPath)] = j(serializeXmlDocument(o))),
      e.dirtyArchivePaths.add(normalizePartPath(i.chartPath)),
      !0);
}
function normalizeStyleHex(e: any) {
  let t = e.replace(/^#/, ``);
  return t.length === 8
    ? `#${t.slice(2).toLowerCase()}`
    : t.length === 6
      ? `#${t.toLowerCase()}`
      : null;
}
function styleHexToRgb(e: any) {
  let t: any = normalizeStyleHex(e),
    n: any = t ? /^#([0-9a-f]{6})$/.exec(t) : null;
  if (!n) return null;
  let r = n[1];
  return [
    Number.parseInt(r.slice(0, 2), 16),
    Number.parseInt(r.slice(2, 4), 16),
    Number.parseInt(r.slice(4, 6), 16),
  ];
}
function styleRgbToHsl(e: any, t: any, n: any) {
  let r = e / 255,
    i = t / 255,
    a: any = n / 255,
    o = Math.max(r, i, a),
    s: any = Math.min(r, i, a),
    c = (o + s) / 2;
  if (o === s) return [0, 0, c];
  let l = o - s,
    u = c > 0.5 ? l / (2 - o - s) : l / (o + s),
    d = 0;
  switch (o) {
    case r:
      d = (i - a) / l + (i < a ? 6 : 0);
      break;
    case i:
      d = (a - r) / l + 2;
      break;
    default:
      d = (r - i) / l + 4;
      break;
  }
  return [d / 6, u, c];
}
function styleHueChannel(e: any, t: any, n: any) {
  let r = n;
  return (
    r < 0 && (r += 1),
    r > 1 && --r,
    r < 1 / 6 ? e + (t - e) * 6 * r : r < 1 / 2 ? t : r < 2 / 3 ? e + (t - e) * (2 / 3 - r) * 6 : e
  );
}
function styleHslToRgb(e: any, t: any, n: any) {
  if (t === 0) {
    let e = Math.round(n * 255);
    return [e, e, e];
  }
  let r = n < 0.5 ? n * (1 + t) : n + t - n * t,
    i = 2 * n - r;
  return [
    Math.round(styleHueChannel(i, r, e + 1 / 3) * 255),
    Math.round(styleHueChannel(i, r, e) * 255),
    Math.round(styleHueChannel(i, r, e - 1 / 3) * 255),
  ];
}
function styleRgbToHex(e: any, t: any, n: any) {
  return `#${[e, t, n].map((e) => Math.max(0, Math.min(255, e)).toString(16).padStart(2, `0`)).join(``)}`;
}
function adjustColorTint(e: any, t: any) {
  let n = styleHexToRgb(e);
  if (!n || !Number.isFinite(t) || t === 0) return normalizeStyleHex(e);
  let [r, i, a] = styleRgbToHsl(n[0], n[1], n[2]),
    o = t < 0 ? a * (1 + t) : a * (1 - t) + t,
    [s, c, l] = styleHslToRgb(r, i, Math.max(0, Math.min(1, o)));
  return styleRgbToHex(s, c, l);
}
export function resolveFontColor(e: any, t?: any) {
  if (!e) return null;
  let n = [`hex`, `rgb`, `argb`]
    .map((t) => e[t])
    .find((e) => typeof e == `string` && e.trim().length > 0);
  if (n) return normalizeStyleHex(n);
  let r = e.theme,
    i = typeof r == `number` ? r : typeof r == `string` && r.trim().length > 0 ? Number(r) : NaN,
    a: any = Number.isFinite(i) ? (t?.colorsByIndex[i] ?? null) : null;
  if (!a) return null;
  let o = e.tint,
    s: any = typeof o == `number` ? o : typeof o == `string` && o.trim().length > 0 ? Number(o) : NaN;
  return Number.isFinite(s) ? adjustColorTint(a, s) : a;
}
function resolveSolidFillColor(e: any, t: any) {
  return e
    ? e.fillType === `solid`
      ? resolveFontColor(e.color ?? e.foreground ?? e.background, t)
      : e.fillType === `pattern`
        ? resolveFontColor(e.foreground ?? e.color ?? e.background, t)
        : null
    : null;
}
export function resolveFillColor(e: any, t: any) {
  if (!e) return { backgroundColor: null, backgroundImage: null };
  if (e.fillType === `gradient`) {
    let n = (Array.isArray(e.stops) ? e.stops : [])
      .map((e: any) => ({
        color: resolveFontColor(e.color, t),
        position: typeof e.position == `number` ? e.position : Number(e.position),
      }))
      .filter((e: any) => !!e.color && Number.isFinite(e.position))
      .sort((e: any, t: any) => e.position - t.position);
    if (n.length > 0) {
      if ((typeof e.gradientType == `string` ? e.gradientType : `linear`) === `path`)
        return {
          backgroundColor: n[n.length - 1]?.color ?? null,
          backgroundImage: `radial-gradient(circle at center, ${n.map((e: any) => `${e.color} ${Math.max(0, Math.min(100, e.position * 100))}%`).join(`, `)})`,
        };
      let t: any = typeof e.degree == `number` ? e.degree : Number(e.degree ?? 0),
        r: any = Number.isFinite(t) ? 90 - t : 90;
      return {
        backgroundColor: n[n.length - 1]?.color ?? null,
        backgroundImage: `linear-gradient(${r}deg, ${n.map((e: any) => `${e.color} ${Math.max(0, Math.min(100, e.position * 100))}%`).join(`, `)})`,
      };
    }
  }
  return { backgroundColor: resolveSolidFillColor(e, t), backgroundImage: null };
}
var officeRelationshipsNamespace = `http://schemas.openxmlformats.org/officeDocument/2006/relationships`,
  packageRelationshipsNamespace = `http://schemas.openxmlformats.org/package/2006/relationships`,
  spreadsheetMlNamespace = `http://schemas.openxmlformats.org/spreadsheetml/2006/main`,
  contentTypesNamespace = `http://schemas.openxmlformats.org/package/2006/content-types`,
  drawingRelNamespace = `http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing`,
  imageRelNamespace = `http://schemas.openxmlformats.org/officeDocument/2006/relationships/image`,
  drawingContentType = `application/vnd.openxmlformats-officedocument.drawing+xml`,
  emuPerPixel = 9525,
  minColumnWidthPx = 30,
  minRowHeightPx = 16,
  maxColumnWidthEmu = 64 * emuPerPixel,
  defaultRowHeightEmu = 20 * emuPerPixel,
  defaultCharWidthPx = 7,
  charWidthCache = new Map();
function devicePixelSnap() {
  if (typeof window > `u`) return 1;
  let e = window.devicePixelRatio;
  return !Number.isFinite(e) || e <= 0 ? 1 : 1 / e;
}
function measureCharWidth(e: any, t: any) {
  let n: any = typeof e == `string` && e.trim().length > 0 ? e.trim() : `Calibri`,
    r: any = typeof t == `number` && Number.isFinite(t) && t > 0 ? t : 11,
    i = `${n}|${r}`,
    a: any = charWidthCache.get(i);
  if (a !== void 0) return a;
  let o = `${(96 / 72) * r}px "${n}"`,
    s: any = defaultCharWidthPx;
  try {
    let e =
      typeof document < `u`
        ? document.createElement(`canvas`).getContext(`2d`)
        : typeof OffscreenCanvas < `u`
          ? new OffscreenCanvas(32, 32).getContext(`2d`)
          : null;
    e && ((e.font = o), (s = Math.max(1, e.measureText(`0`).width)));
  } catch {
    s = defaultCharWidthPx;
  }
  return (charWidthCache.set(i, s), s);
}
function columnWidthToPixels(e: any, t = defaultCharWidthPx) {
  if (!Number.isFinite(e) || e <= 0) return minColumnWidthPx;
  let n: any = Math.max(1, t),
    r: any = Math.floor(e < 1 ? e * (n + 5) + 0.5 : ((256 * e + Math.floor(128 / n)) / 256) * n);
  return Math.max(minColumnWidthPx, r);
}
function defaultColumnWidthPx(e: any, t = defaultCharWidthPx, n = columnWidthToPixels(8.43, t)) {
  let r = typeof e.defaultColumnWidth == `number` ? e.defaultColumnWidth : NaN;
  return Number.isFinite(r) && r > 0 ? columnWidthToPixels(r, t) : n;
}
function defaultRowHeightPx(e: any, t = Math.max(minRowHeightPx, 20)) {
  let n: any = typeof e.defaultRowHeight == `number` ? e.defaultRowHeight : NaN;
  return Number.isFinite(n) && n > 0 ? Math.max(minRowHeightPx, Math.round(n * 1.33)) : t;
}
function hiddenRowIndices(e: any, t: any) {
  if (!Number.isFinite(t) || t < 0 || typeof e.isRowHidden != `function`) return [];
  let n: any = [];
  for (let r = 0; r <= t; r += 1) e.isRowHidden(r) && n.push(r);
  return n;
}
function hiddenColumnIndices(e: any, t: any) {
  if (!Number.isFinite(t) || t < 0 || typeof e.isColumnHidden != `function`) return [];
  let n: any = [];
  for (let r = 0; r <= t; r += 1) e.isColumnHidden(r) && n.push(r);
  return n;
}
function mergeSpanSummary(e: any) {
  let t: any = {
      hasHorizontalMerges: !1,
      hasVerticalMerges: !1,
      maxHorizontalMergeEndCol: -1,
      maxVerticalMergeEndRow: -1,
    },
    n = Array.isArray(e.mergedRegions) ? e.mergedRegions : [];
  for (let e of n) {
    let n: any = null;
    if (typeof e == `string`) n = parseRangeAddress(e);
    else if (e && typeof e == `object`) {
      let t: any = e,
        r: any = typeof t.startRow == `number` ? t.startRow : NaN,
        i = typeof t.startCol == `number` ? t.startCol : NaN,
        a: any = typeof t.endRow == `number` ? t.endRow : NaN,
        o = typeof t.endCol == `number` ? t.endCol : NaN;
      [r, i, a, o].every((e) => Number.isFinite(e) && e >= 0)
        ? (n = {
            end: { col: Math.max(i, o), row: Math.max(r, a) },
            start: { col: Math.min(i, o), row: Math.min(r, a) },
          })
        : typeof t.range == `string` && (n = parseRangeAddress(t.range));
    }
    n &&
      (n.end.col > n.start.col &&
        ((t.hasHorizontalMerges = !0),
        (t.maxHorizontalMergeEndCol = Math.max(t.maxHorizontalMergeEndCol, n.end.col))),
      n.end.row > n.start.row &&
        ((t.hasVerticalMerges = !0),
        (t.maxVerticalMergeEndRow = Math.max(t.maxVerticalMergeEndRow, n.end.row))));
  }
  return t;
}
function themePaletteModel(e: any) {
  let t: any = [
      `lt1`,
      `dk1`,
      `lt2`,
      `dk2`,
      `accent1`,
      `accent2`,
      `accent3`,
      `accent4`,
      `accent5`,
      `accent6`,
      `hlink`,
      `folHlink`,
    ],
    n: any = {};
  return (
    t.forEach((t: any, r: any) => {
      let i = e.colors.get(t);
      i && (n[r] = i);
    }),
    {
      colorsByIndex: n,
      majorLatinFont: e.majorLatinFont ?? void 0,
      minorLatinFont: e.minorLatinFont ?? void 0,
    }
  );
}
function copyToUint8Array(e: any) {
  let t: any = new Uint8Array(e.byteLength);
  return (t.set(e), t);
}
function normalizeZipPath(e: any) {
  return e.replace(/\\/g, `/`).replace(/^\/+/, ``);
}
function joinZipPath(...e: any[]) {
  return normalizeZipPath(e.join(`/`));
}
function zipPathDir(e: any) {
  let t: any = normalizeZipPath(e),
    n: any = t.lastIndexOf(`/`);
  return n >= 0 ? t.slice(0, n) : ``;
}
function resolveZipPath(e: any, t: any) {
  if (!t) return normalizeZipPath(e);
  if (t.startsWith(`#`)) return t;
  if (t.startsWith(`/`)) return normalizeZipPath(t);
  let n = zipPathDir(e).split(`/`).filter(Boolean);
  for (let e of t.split(`/`))
    if (!(!e || e === `.`)) {
      if (e === `..`) {
        n.pop();
        continue;
      }
      n.push(e);
    }
  return normalizeZipPath(n.join(`/`));
}
function relativeZipPath(e: any, t: any) {
  let n = zipPathDir(e).split(`/`).filter(Boolean),
    r: any = normalizeZipPath(t).split(`/`).filter(Boolean),
    i = 0;
  for (; i < n.length && i < r.length && n[i] === r[i];) i += 1;
  let a: any = n.slice(i).map(() => `..`),
    o = r.slice(i);
  return [...a, ...o].join(`/`) || `.`;
}
function zipRelsPath(e: any) {
  let t: any = e.split(`/`).pop();
  return joinZipPath(zipPathDir(e), `_rels`, `${t}.rels`);
}
function parseXmlStrict(e: any) {
  let t: any = new DOMParser().parseFromString(e, `application/xml`);
  return t.querySelector(`parsererror`) ? null : t;
}
function serializeXmlWb(e: any) {
  return new XMLSerializer().serializeToString(e);
}
function zipEntryTextWb(e: any, t: any) {
  let n = e[t];
  return n ? N(n) : null;
}
function columnLettersToIndex(e: any) {
  let t: any = 0;
  for (let n of e.toUpperCase()) {
    if (n < `A` || n > `Z`) return null;
    t = t * 26 + (n.charCodeAt(0) - 64);
  }
  return t > 0 ? t - 1 : null;
}
function parseCellAddress(e: any) {
  let t: any = /^\$?([A-Za-z]+)\$?(\d+)$/.exec(e.trim());
  if (!t) return null;
  let n = columnLettersToIndex(t[1] ?? ``),
    r: any = Number(t[2] ?? NaN) - 1;
  return n === null || !Number.isFinite(r) || r < 0 ? null : { col: n, row: r };
}
function parseRangeAddress(e: any) {
  let [t, n] = e.split(`:`),
    r: any = parseCellAddress(t ?? ``),
    i = parseCellAddress(n ?? t ?? ``);
  return r && i ? { end: i, start: r } : null;
}
function stripSheetPrefix(e: any) {
  let t: any = e.trim(),
    n: any = t.lastIndexOf(`!`);
  return n >= 0 ? t.slice(n + 1) : t;
}
function rangeStartCell(e: any) {
  return parseCellAddress(stripSheetPrefix(e).split(/\s+/)[0] ?? ``);
}
function rangeAddressPart(e: any) {
  return parseRangeAddress(stripSheetPrefix(e));
}
function isElementNodeWb(e: any) {
  return !!(e && e.nodeType === 1);
}
function descendantElementsWb(e: any, t: any) {
  return (Array.from(e.getElementsByTagName(`*`)) as any[]).filter((e: any) => isElementNodeWb(e) && e.localName === t);
}
function childElementsWb(e: any, t: any) {
  return (Array.from(e.childNodes) as any[]).filter((e: any) => isElementNodeWb(e) && e.localName === t);
}
function firstChildWb(e: any, t: any) {
  return childElementsWb(e, t)[0] ?? null;
}
function firstDescendantWb(e: any, t: any) {
  return descendantElementsWb(e, t)[0] ?? null;
}
function featurePropertyBagTypes(e: any) {
  let t: any = zipEntryTextWb(e, `xl/featurePropertyBag/featurePropertyBag.xml`);
  if (!t) return new Set();
  let n = parseXmlStrict(t);
  if (!n?.documentElement) return new Set();
  let r = childElementsWb(n.documentElement, `bag`),
    i = r.map((e: any) => e.getAttribute(`type`) ?? ``),
    a: any = new Set(),
    o = r.find((e: any) => e.getAttribute(`type`) === `XFComplements`) ?? null;
  return (
    (o
      ? descendantElementsWb(o, `bagId`)
          .map((e: any) => Number(e.textContent ?? NaN))
          .filter((e) => Number.isFinite(e))
      : []
    ).forEach((e, t) => {
      let n = r[e];
      if (!n || i[e] !== `XFComplement`) return;
      let o = descendantElementsWb(n, `bagId`)
        .map((e: any) => Number(e.textContent ?? NaN))
        .find((e) => Number.isFinite(e));
      if (o === void 0) return;
      let s: any[] = r[o];
      if (!s || i[o] !== `XFControls`) return;
      let c = descendantElementsWb(s, `bagId`)
        .map((e: any) => Number(e.textContent ?? NaN))
        .find((e) => Number.isFinite(e));
      c !== void 0 && i[c] === `Checkbox` && a.add(t);
    }),
    a
  );
}
function relationIdAttr(e: any) {
  return e.getAttributeNS(officeRelationshipsNamespace, `id`) ?? e.getAttribute(`r:id`) ?? e.getAttribute(`id`);
}
function relationEmbedAttr(e: any) {
  return e.getAttributeNS(officeRelationshipsNamespace, `embed`) ?? e.getAttribute(`r:embed`) ?? e.getAttribute(`embed`);
}
function setChildText(e: any, t: any, n: any) {
  let r = firstChildWb(e, t);
  r && (r.textContent = n);
}
function writeMarkerText(e: any, t: any) {
  e &&
    (setChildText(e, `col`, String(Math.max(0, t.col))),
    setChildText(e, `colOff`, String(Math.max(0, Math.round(t.colOffsetEmu)))),
    setChildText(e, `row`, String(Math.max(0, t.row))),
    setChildText(e, `rowOff`, String(Math.max(0, Math.round(t.rowOffsetEmu)))));
}
function contentTypeMaps(e: any) {
  let t: any = zipEntryTextWb(e, `[Content_Types].xml`),
    n: any = new Map(),
    r: any = new Map();
  if (!t) return { defaultEntries: n, overrideEntries: r };
  let i = parseXmlStrict(t);
  if (!i) return { defaultEntries: n, overrideEntries: r };
  for (let e of descendantElementsWb(i, `Default`)) {
    let t: any = e.getAttribute(`Extension`),
      r: any = e.getAttribute(`ContentType`);
    t && r && n.set(t.toLowerCase(), r);
  }
  for (let e of descendantElementsWb(i, `Override`)) {
    let t: any = e.getAttribute(`PartName`),
      n: any = e.getAttribute(`ContentType`);
    t && n && r.set(normalizeZipPath(t), n);
  }
  return { defaultEntries: n, overrideEntries: r };
}
function contentTypeForPart(e: any, t: any) {
  let n = normalizeZipPath(t),
    r: any = e.overrideEntries.get(n);
  if (r) return r;
  let i = n.split(`.`).pop()?.toLowerCase();
  return i ? (e.defaultEntries.get(i) ?? `application/octet-stream`) : `application/octet-stream`;
}
function relationshipMapForPart(e: any, t: any, n: any) {
  let r = zipEntryTextWb(e, t),
    i = new Map();
  if (!r) return i;
  let a: any = parseXmlStrict(r);
  if (!a) return i;
  for (let e of descendantElementsWb(a, `Relationship`)) {
    let t: any = e.getAttribute(`Id`),
      r: any = e.getAttribute(`Target`),
      a: any = e.getAttribute(`Type`);
    !t ||
      !r ||
      !a ||
      i.set(t, { id: t, target: resolveZipPath(n, r), targetMode: e.getAttribute(`TargetMode`), type: a });
  }
  return i;
}
function workbookSheetEntries(e: any) {
  let t: any = zipEntryTextWb(e, `xl/workbook.xml`);
  if (!t) return [];
  let n: any = parseXmlStrict(t);
  if (!n) return [];
  let r = relationshipMapForPart(e, `xl/_rels/workbook.xml.rels`, `xl/workbook.xml`),
    i = [];
  for (let e of descendantElementsWb(n, `sheet`)) {
    let t: any = relationIdAttr(e);
    if (!t) continue;
    let n: any = r.get(t);
    n && i.push({ name: e.getAttribute(`name`) ?? `Sheet ${i.length + 1}`, path: n.target });
  }
  return i;
}
function parseTheme(e: any) {
  let t: any = {
      colors: new Map([
        [`accent1`, `#5b9bd5`],
        [`accent2`, `#ed7d31`],
        [`accent3`, `#a5a5a5`],
        [`accent4`, `#ffc000`],
        [`accent5`, `#4472c4`],
        [`accent6`, `#70ad47`],
        [`bg1`, `#ffffff`],
        [`bg2`, `#e7e6e6`],
        [`dk1`, `#000000`],
        [`dk2`, `#6e747a`],
        [`folHlink`, `#993366`],
        [`hlink`, `#085296`],
        [`lt1`, `#ffffff`],
        [`lt2`, `#e7e6e6`],
        [`tx1`, `#000000`],
        [`tx2`, `#6e747a`],
      ]),
      majorLatinFont: null,
      minorLatinFont: null,
    },
    n = zipEntryTextWb(e, `xl/theme/theme1.xml`);
  if (!n) return t;
  let r = parseXmlStrict(n);
  if (!r) return t;
  let i = new Map(t.colors),
    a: any = descendantElementsWb(r, `clrScheme`)[0] ?? null;
  if (a)
    for (let e of (Array.from(a.childNodes) as any[]).filter(isElementNodeWb)) {
      let t: any = e.localName,
        n: any = firstChildWb(e, `srgbClr`),
        r: any = firstChildWb(e, `sysClr`),
        a: any = n?.getAttribute(`val`) ?? r?.getAttribute(`lastClr`);
      a && i.set(t, normalizeArgbHex(a));
    }
  let o = descendantElementsWb(r, `fontScheme`)[0] ?? null,
    s = firstChildWb(firstChildWb(o, `majorFont`), `latin`)?.getAttribute(`typeface`) ?? null,
    c = firstChildWb(firstChildWb(o, `minorFont`), `latin`)?.getAttribute(`typeface`) ?? null;
  return (
    i.set(`bg1`, i.get(`lt1`) ?? t.colors.get(`bg1`) ?? `#ffffff`),
    i.set(`tx1`, i.get(`dk1`) ?? t.colors.get(`tx1`) ?? `#000000`),
    i.set(`bg2`, i.get(`lt2`) ?? t.colors.get(`bg2`) ?? `#e7e6e6`),
    i.set(`tx2`, i.get(`dk2`) ?? t.colors.get(`tx2`) ?? `#6e747a`),
    { colors: i, majorLatinFont: s, minorLatinFont: c }
  );
}
function parseColorAttributes(e: any) {
  if (!e) return;
  let t: any = {},
    n: any = e.getAttribute(`rgb`),
    r: any = e.getAttribute(`theme`),
    i = e.getAttribute(`tint`),
    a: any = e.getAttribute(`indexed`);
  return (
    n && (t.rgb = normalizeArgbHex(n)),
    r !== null && (t.theme = Number(r)),
    i !== null && (t.tint = Number(i)),
    a !== null && (t.indexed = Number(a)),
    Object.keys(t).length > 0 ? t : void 0
  );
}
function booleanFlagAttr(e: any) {
  if (!e) return !1;
  let t: any = e.getAttribute(`val`);
  return t === null || (t !== `0` && t !== `false`);
}
function parseSparklineGroups(e: any, t: any) {
  let n: any = [];
  for (let r of descendantElementsWb(e, `sparklineGroup`)) {
    let e = r.getAttribute(`type`),
      i = e === `column` ? `column` : e === `stacked` ? `winLoss` : `line`,
      a: any = firstChildWb(r, `markers`),
      o = firstChildWb(r, `negative`),
      s = resolveFontColor(parseColorAttributes(firstChildWb(r, `colorSeries`)), t),
      c = resolveFontColor(parseColorAttributes(firstChildWb(r, `colorNegative`)), t),
      l = resolveFontColor(parseColorAttributes(firstChildWb(r, `colorMarkers`)), t),
      u = resolveFontColor(parseColorAttributes(firstChildWb(r, `colorFirst`)), t),
      d = resolveFontColor(parseColorAttributes(firstChildWb(r, `colorLast`)), t),
      f = resolveFontColor(parseColorAttributes(firstChildWb(r, `colorHigh`)), t),
      p = resolveFontColor(parseColorAttributes(firstChildWb(r, `colorLow`)), t),
      m = firstChildWb(r, `sparklines`);
    if (m)
      for (let e of childElementsWb(m, `sparkline`)) {
        let t: any = firstChildWb(e, `f`)?.textContent ?? ``,
          r: any = firstChildWb(e, `sqref`)?.textContent ?? ``,
          m = rangeAddressPart(t),
          h = rangeStartCell(r);
        !m ||
          !h ||
          n.push({
            color: s ?? void 0,
            firstColor: u ?? void 0,
            highColor: f ?? void 0,
            lastColor: d ?? void 0,
            lowColor: p ?? void 0,
            markerColor: l ?? void 0,
            markers: booleanFlagAttr(a),
            negative: booleanFlagAttr(o),
            negativeColor: c ?? void 0,
            range: m,
            target: h,
            type: i,
          });
      }
  }
  return n;
}
function parseFontElement(e: any) {
  if (!e) return;
  let t: any = {},
    n: any = firstChildWb(e, `sz`)?.getAttribute(`val`),
    r: any = firstChildWb(e, `name`)?.getAttribute(`val`),
    i = firstChildWb(e, `family`)?.getAttribute(`val`),
    a: any = firstChildWb(e, `scheme`)?.getAttribute(`val`),
    o = firstChildWb(e, `charset`)?.getAttribute(`val`),
    s = firstChildWb(e, `vertAlign`)?.getAttribute(`val`),
    c = parseColorAttributes(firstChildWb(e, `color`));
  return (
    booleanFlagAttr(firstChildWb(e, `b`)) && (t.bold = !0),
    booleanFlagAttr(firstChildWb(e, `i`)) && (t.italic = !0),
    booleanFlagAttr(firstChildWb(e, `strike`)) && (t.strikethrough = !0),
    firstChildWb(e, `u`) && (t.underline = firstChildWb(e, `u`)?.getAttribute(`val`) ?? `single`),
    n != null && (t.size = Number(n)),
    r && (t.name = r),
    i != null && (t.family = Number(i)),
    a && (t.scheme = a),
    o != null && (t.charset = Number(o)),
    s && (t.verticalAlign = s),
    booleanFlagAttr(firstChildWb(e, `shadow`)) && (t.shadow = !0),
    booleanFlagAttr(firstChildWb(e, `outline`)) && (t.outline = !0),
    booleanFlagAttr(firstChildWb(e, `condense`)) && (t.condense = !0),
    booleanFlagAttr(firstChildWb(e, `extend`)) && (t.extend = !0),
    c && (t.color = c),
    Object.keys(t).length > 0 ? t : void 0
  );
}
function parseFillElement(e: any) {
  if (!e) return;
  let t: any = firstChildWb(e, `gradientFill`);
  if (t) {
    let e = (Array.from(t.childNodes) as any[])
      .filter(isElementNodeWb)
      .filter((e: any) => e.localName === `stop`)
      .map((e) => ({
        color: parseColorAttributes((Array.from(e.childNodes) as any[]).find(isElementNodeWb) ?? null),
        position: Number(e.getAttribute(`position`) ?? NaN),
      }))
      .filter((e) => e.color && Number.isFinite(e.position));
    if (e.length > 0)
      return {
        degree: Number(t.getAttribute(`degree`) ?? 0),
        fillType: `gradient`,
        gradientType: t.getAttribute(`type`) ?? `linear`,
        stops: e,
      };
  }
  let n: any = firstChildWb(e, `patternFill`);
  if (!n) return;
  let r = n.getAttribute(`patternType`) ?? `none`,
    i = parseColorAttributes(firstChildWb(n, `fgColor`)),
    a: any = parseColorAttributes(firstChildWb(n, `bgColor`)),
    o = i ?? a;
  if (r === `solid` && o) return { color: o, fillType: `solid` };
  if (
    ((r === `none` || r === `gray125`) && (i || a)) ||
    (r !== `none` && r !== `gray125` && (i || a))
  )
    return { background: a, fillType: `pattern`, foreground: i, patternType: r };
}
function parseBorderSide(e: any) {
  if (!e) return;
  let t: any = e.getAttribute(`style`),
    n: any = parseColorAttributes(firstChildWb(e, `color`));
  if (!(!t || t === `none`)) return { color: n, style: t };
}
function parseBorderElement(e: any) {
  if (!e) return;
  let t: any = {};
  return (
    [`top`, `right`, `bottom`, `left`, `horizontal`, `vertical`].forEach((n) => {
      let r: any = parseBorderSide(firstChildWb(e, n));
      r && (t[n] = r);
    }),
    Object.keys(t).length > 0 ? t : void 0
  );
}
function parseAlignmentElement(e: any) {
  if (!e) return;
  let t: any = {},
    n: any = e.getAttribute(`horizontal`),
    r: any = e.getAttribute(`vertical`),
    i = e.getAttribute(`wrapText`),
    a: any = e.getAttribute(`indent`),
    o = e.getAttribute(`shrinkToFit`),
    s = e.getAttribute(`textRotation`);
  if (
    (n && (t.horizontal = n),
    r && (t.vertical = r),
    i !== null && (t.wrapText = i === `1`),
    o !== null && (t.shrinkToFit = o === `1`),
    a !== null && (t.indent = Number(a)),
    s !== null)
  ) {
    let e = Number(s);
    Number.isFinite(e) && (t.textRotation = e);
  }
  return Object.keys(t).length > 0 ? t : void 0;
}
function parseDxfElement(e: any) {
  if (!e) return {};
  let t: any = {},
    n: any = parseFontElement(firstChildWb(e, `font`)),
    r: any = parseFillElement(firstChildWb(e, `fill`)),
    i = parseBorderElement(firstChildWb(e, `border`)),
    a: any = parseAlignmentElement(firstChildWb(e, `alignment`));
  return (n && (t.font = n), r && (t.fill = r), i && (t.border = i), a && (t.alignment = a), t);
}
function resolveXfStyle(e: any, t: any, n: any, r: any, i: any) {
  let a: any = {},
    o = Number(e.getAttribute(`fontId`) ?? NaN),
    s = Number(e.getAttribute(`fillId`) ?? NaN),
    c = Number(e.getAttribute(`borderId`) ?? NaN),
    l = parseAlignmentElement(firstChildWb(e, `alignment`));
  (Number.isFinite(o) && t[o] && (a.font = t[o]),
    Number.isFinite(s) && n[s] && (a.fill = n[s]),
    Number.isFinite(c) && r[c] && (a.border = r[c]),
    l && (a.alignment = l));
  let u = firstDescendantWb(e, `xfComplement`),
    d = Number(u?.getAttribute(`i`) ?? NaN);
  return (Number.isFinite(d) && i?.has(d) && (a.cellControl = { kind: `checkbox` }), a);
}
function parseStylesPart(e: any) {
  let t = zipEntryTextWb(e, `xl/styles.xml`);
  if (!t)
    return { defaultFont: null, namedCellStyleByName: {}, styleById: {}, tableStyleByName: {} };
  let n: any = parseXmlStrict(t);
  if (!n)
    return { defaultFont: null, namedCellStyleByName: {}, styleById: {}, tableStyleByName: {} };
  let r: any = firstDescendantWb(n, `fonts`),
    i = firstDescendantWb(n, `fills`),
    a = firstDescendantWb(n, `borders`),
    o = firstDescendantWb(n, `cellStyleXfs`),
    s = firstDescendantWb(n, `cellStyles`),
    c = firstDescendantWb(n, `cellXfs`),
    l = firstDescendantWb(n, `dxfs`),
    u = firstDescendantWb(n, `tableStyles`);
  if (!c)
    return { defaultFont: null, namedCellStyleByName: {}, styleById: {}, tableStyleByName: {} };
  let d = featurePropertyBagTypes(e),
    f = childElementsWb(r ?? n.documentElement, `font`).map((e) => parseFontElement(e)),
    p = childElementsWb(i ?? n.documentElement, `fill`).map((e) => parseFillElement(e)),
    m = childElementsWb(a ?? n.documentElement, `border`).map((e) => parseBorderElement(e)),
    h = childElementsWb(l ?? n.documentElement, `dxf`).map((e) => parseDxfElement(e)),
    g = childElementsWb(o ?? n.documentElement, `xf`).map((e) => resolveXfStyle(e, f, p, m, d)),
    _: any = {},
    v: any = {},
    y: any = {};
  (childElementsWb(c, `xf`).forEach((e, t) => {
    v[t] = resolveXfStyle(e, f, p, m, d);
  }),
    childElementsWb(s ?? n.documentElement, `cellStyle`).forEach((e) => {
      let t = e.getAttribute(`name`),
        n: any = Number(e.getAttribute(`xfId`) ?? NaN);
      if (!t || !Number.isFinite(n)) return;
      let r: any = g[n];
      r && (_[t] = r);
    }),
    childElementsWb(u ?? n.documentElement, `tableStyle`).forEach((e) => {
      let t = e.getAttribute(`name`);
      if (!t) return;
      let n: any = {};
      (childElementsWb(e, `tableStyleElement`).forEach((e) => {
        let t = e.getAttribute(`type`),
          r: any = Number(e.getAttribute(`dxfId`) ?? NaN);
        if (!t || !Number.isFinite(r)) return;
        let i = h[r];
        i && (n[t] = i);
      }),
        (y[t] = n));
    }));
  let b = _.Normal?.font ?? v[0]?.font ?? f[0];
  return {
    defaultFont: b
      ? {
          family: typeof b.name == `string` ? b.name : void 0,
          sizePt: typeof b.size == `number` ? b.size : void 0,
        }
      : null,
    namedCellStyleByName: _,
    styleById: v,
    tableStyleByName: y,
  };
}
function parseSqrefRanges(e: any) {
  return e
    ? e
        .trim()
        .split(/\s+/)
        .flatMap((e: any) => {
          let t = parseRangeAddress(e);
          return t ? [t] : [];
        })
    : [];
}
function parseCfvo(e: any) {
  if (!e) return null;
  let t = e.getAttribute(`type`);
  if (!t) return null;
  let n: any = e.getAttribute(`val`) ?? firstChildWb(e, `f`)?.textContent ?? void 0,
    r: any = n === void 0 ? NaN : Number(n);
  return { type: t, value: Number.isFinite(r) ? r : void 0 };
}
function optionalBooleanAttr(e: any, t: any) {
  if (!e) return;
  let n: any = e.getAttribute(t);
  if (n !== null) return n !== `0` && n !== `false`;
}
function parseConditionalRule(e: any, t: any) {
  let n: any = e.getAttribute(`type`),
    r: any = Number(e.getAttribute(`priority`) ?? NaN),
    i = Number.isFinite(r) ? r : 2 ** 53 - 1;
  if (n === `colorScale`) {
    let n: any = firstChildWb(e, `colorScale`);
    if (!n) return null;
    let r: any = childElementsWb(n, `cfvo`)
        .map((e) => parseCfvo(e))
        .filter((e) => !!e),
      a = childElementsWb(n, `color`)
        .map((e) => parseColorAttributes(e))
        .filter((e) => !!e);
    return r.length === 0 || a.length === 0
      ? null
      : { cfvos: r, colors: a, kind: `colorScale`, priority: i, ranges: t };
  }
  if (n === `dataBar`) {
    let n: any = firstChildWb(e, `dataBar`);
    if (!n) return null;
    let r: any = childElementsWb(n, `cfvo`)
      .map((e) => parseCfvo(e))
      .filter((e) => !!e);
    if (r.length === 0) return null;
    let a = firstDescendantWb(e, `id`)?.textContent?.trim() || void 0;
    return { cfvos: r, color: parseColorAttributes(firstChildWb(n, `color`)), kind: `dataBar`, priority: i, ranges: t, id: a };
  }
  if (n === `iconSet`) {
    let n: any = firstChildWb(e, `iconSet`);
    if (!n) return null;
    let r: any = n.getAttribute(`iconSet`),
      a = childElementsWb(n, `cfvo`)
        .map((e) => parseCfvo(e))
        .filter((e) => !!e);
    return !r || a.length === 0
      ? null
      : {
          cfvos: a,
          icons: a.map((e, t) => ({ iconId: t, iconSet: r })),
          kind: `iconSet`,
          priority: i,
          ranges: t,
          reverse: optionalBooleanAttr(n, `reverse`),
          showValue: optionalBooleanAttr(n, `showValue`),
        };
  }
  return null;
}
function parseConditionalRuleExt(e: any, t: any) {
  let n: any = e.getAttribute(`type`),
    r: any = e.getAttribute(`id`) ?? void 0,
    i = Number(e.getAttribute(`priority`) ?? NaN),
    a = Number.isFinite(i) ? i : 2 ** 53 - 1;
  if (n === `dataBar`) {
    let n: any = firstChildWb(e, `dataBar`);
    if (!n) return null;
    let i = childElementsWb(n, `cfvo`)
      .map((e) => parseCfvo(e))
      .filter((e) => !!e);
    return i.length === 0
      ? null
      : {
          axisColor: parseColorAttributes(firstChildWb(n, `axisColor`)),
          border: optionalBooleanAttr(n, `border`),
          borderColor: parseColorAttributes(firstChildWb(n, `borderColor`)),
          cfvos: i,
          color: parseColorAttributes(firstChildWb(n, `fillColor`)),
          gradient: optionalBooleanAttr(n, `gradient`),
          kind: `dataBar`,
          maxLength: Number(n.getAttribute(`maxLength`) ?? NaN),
          minLength: Number(n.getAttribute(`minLength`) ?? NaN),
          negativeBarBorderColorSameAsPositive: optionalBooleanAttr(n, `negativeBarBorderColorSameAsPositive`),
          negativeBorderColor: parseColorAttributes(firstChildWb(n, `negativeBorderColor`)),
          negativeFillColor: parseColorAttributes(firstChildWb(n, `negativeFillColor`)),
          priority: a,
          ranges: t,
          showValue: optionalBooleanAttr(n, `showValue`),
          id: r,
        };
  }
  if (n === `iconSet`) {
    let n: any[] = firstChildWb(e, `iconSet`);
    if (!n) return null;
    let i = childElementsWb(n, `cfvo`)
        .map((e) => parseCfvo(e))
        .filter((e) => !!e),
      o = childElementsWb(n, `cfIcon`)
        .map((e) => {
          let t: any[] = e.getAttribute(`iconSet`),
            n: any = Number(e.getAttribute(`iconId`) ?? NaN);
          return !t || !Number.isFinite(n) ? null : { iconId: n, iconSet: t };
        })
        .filter((e) => !!e);
    return i.length === 0 || o.length === 0
      ? null
      : {
          cfvos: i,
          icons: o,
          kind: `iconSet`,
          priority: a,
          ranges: t,
          reverse: optionalBooleanAttr(n, `reverse`),
          showValue: optionalBooleanAttr(n, `showValue`),
          id: r,
        };
  }
  return null;
}
function mergeConditionalRules(e: any, t: any) {
  return e.kind === t.kind
    ? e.kind === `colorScale` && t.kind === `colorScale`
      ? {
          ...e,
          ...t,
          cfvos: t.cfvos.length > 0 ? t.cfvos : e.cfvos,
          colors: t.colors.length > 0 ? t.colors : e.colors,
          priority: Number.isFinite(t.priority) ? t.priority : e.priority,
          ranges: t.ranges.length > 0 ? t.ranges : e.ranges,
        }
      : e.kind === `dataBar` && t.kind === `dataBar`
        ? {
            ...e,
            ...t,
            axisColor: t.axisColor ?? e.axisColor,
            border: t.border ?? e.border,
            cfvos: t.cfvos.length > 0 ? t.cfvos : e.cfvos,
            color: t.color ?? e.color,
            negativeBarBorderColorSameAsPositive:
              t.negativeBarBorderColorSameAsPositive ?? e.negativeBarBorderColorSameAsPositive,
            negativeBorderColor: t.negativeBorderColor ?? e.negativeBorderColor,
            negativeFillColor: t.negativeFillColor ?? e.negativeFillColor,
            priority: Number.isFinite(t.priority) ? t.priority : e.priority,
            ranges: t.ranges.length > 0 ? t.ranges : e.ranges,
          }
        : e.kind === `iconSet` && t.kind === `iconSet`
          ? {
              ...e,
              ...t,
              cfvos: t.cfvos.length > 0 ? t.cfvos : e.cfvos,
              icons: t.icons.length > 0 ? t.icons : e.icons,
              priority: Number.isFinite(t.priority) ? t.priority : e.priority,
              ranges: t.ranges.length > 0 ? t.ranges : e.ranges,
            }
          : e
    : e;
}
function parseConditionalFormatting(e: any) {
  let t: any[] = [],
    n: any[] = [];
  descendantElementsWb(e, `conditionalFormatting`).forEach((e) => {
    let r: any = e.namespaceURI !== spreadsheetMlNamespace,
      i = parseSqrefRanges(r ? (firstChildWb(e, `sqref`)?.textContent ?? ``) : e.getAttribute(`sqref`));
    childElementsWb(e, `cfRule`).forEach((e) => {
      let a = r ? parseConditionalRuleExt(e, i) : parseConditionalRule(e, i);
      a && (r ? n.push(a) : t.push(a));
    });
  });
  let r: any[] = [],
    i = new Set(),
    a = new Map(n.filter((e) => typeof e.id == `string` && e.id.length > 0).map((e) => [e.id, e]));
  return (
    t.forEach((e) => {
      let t = e.id ? a.get(e.id) : void 0;
      if (t) {
        (i.add(e.id), r.push(mergeConditionalRules(e, t)));
        return;
      }
      r.push(e);
    }),
    n.forEach((e) => {
      (e.id && i.has(e.id)) || r.push(e);
    }),
    r
      .map((e) => {
        let t = { ...e };
        return (delete t.id, t);
      })
      .filter((e) => e.ranges.length > 0)
      .sort((e, t) => e.priority - t.priority)
  );
}
function parseSheetLayout(e: any, t: any, n: any) {
  let r = zipEntryTextWb(e, t);
  if (!r) return null;
  let i = parseXmlStrict(r);
  if (!i) return null;
  let a = n?.includeCachedFormulaValues ?? !0,
    o: any = {},
    s = parseConditionalFormatting(i),
    c = parseSparklineGroups(i, n?.themePalette),
    l = descendantElementsWb(i, `sheetFormatPr`)[0] ?? null,
    u = descendantElementsWb(i, `sheetView`)[0] ?? null,
    d: any = {},
    f: any = {},
    p: any = {},
    m: any = {},
    h = 1 / 0,
    g = 1 / 0,
    _ = -1,
    v = -1,
    y = measureCharWidth(n?.defaultFont?.family, n?.defaultFont?.sizePt),
    b = Number(l?.getAttribute(`defaultRowHeight`) ?? 15),
    x = Number(l?.getAttribute(`defaultColWidth`) ?? l?.getAttribute(`baseColWidth`) ?? 8.43),
    S = Number(u?.getAttribute(`zoomScale`) ?? u?.getAttribute(`zoomScaleNormal`) ?? NaN),
    C = Number.isFinite(S) && S > 0 ? S : 100,
    w = (e: any) => {
      if (!e) return;
      let t = parseCellAddress(e);
      t &&
        ((h = Math.min(h, t.col)),
        (g = Math.min(g, t.row)),
        (_ = Math.max(_, t.col)),
        (v = Math.max(v, t.row)));
    },
    T = (e: any) => {
      if (firstChildWb(e, `f`) || firstChildWb(e, `is`)) return !0;
      let t = firstChildWb(e, `v`);
      return !!(t && (t.textContent ?? ``).length > 0);
    };
  descendantElementsWb(i, `row`).forEach((e) => {
    let t = Number(e.getAttribute(`r`) ?? 0) - 1,
      n: any = Number(e.getAttribute(`ht`) ?? NaN),
      r = Number(e.getAttribute(`s`) ?? NaN);
    (t >= 0 && Number.isFinite(n) && (d[t] = Math.max(minRowHeightPx, Math.round(n * 1.33))),
      t >= 0 && Number.isFinite(r) && (p[t] = r),
      childElementsWb(e, `c`).forEach((e) => {
        let t = e.getAttribute(`r`);
        if ((T(e) && w(t), a)) {
          let n = firstChildWb(e, `f`),
            r: any = firstChildWb(e, `v`);
          n && r && t && (o[t] = r.textContent ?? ``);
        }
      }));
  });
  let E: any = Math.max(_, 0) + 256;
  return (
    descendantElementsWb(i, `col`).forEach((e) => {
      let t = Number(e.getAttribute(`min`) ?? 0) - 1,
        n: any = Number(e.getAttribute(`max`) ?? 0) - 1,
        r = Number(e.getAttribute(`width`) ?? NaN),
        i = Number(e.getAttribute(`style`) ?? NaN);
      if (!(!Number.isFinite(r) && !Number.isFinite(i)))
        for (let e = t; e <= Math.min(n, E); e += 1)
          e >= 0 && (Number.isFinite(r) && (f[e] = columnWidthToPixels(r, y)), Number.isFinite(i) && (m[e] = i));
    }),
    {
      cachedFormulaValues: o,
      columnWidthCharacterWidthPx: y,
      colWidthOverridesPx: f,
      colStyleIds: m,
      conditionalFormatRules: s,
      defaultColWidthPx: columnWidthToPixels(x, y),
      defaultRowHeightPx: Math.max(minRowHeightPx, Math.round(b * 1.33)),
      hasHorizontalMerges: !1,
      hasVerticalMerges: !1,
      maxHorizontalMergeEndCol: -1,
      maxVerticalMergeEndRow: -1,
      maxContentCol: _,
      maxContentRow: v,
      minContentCol: Number.isFinite(h) ? h : -1,
      minContentRow: Number.isFinite(g) ? g : -1,
      hiddenCols: [],
      hiddenRows: [],
      rowHeightOverridesPx: d,
      rowStyleIds: p,
      showGridLines: (u?.getAttribute(`showGridLines`) ?? `1`) !== `0`,
      sparklines: c,
      zoomScale: C,
    }
  );
}
function clampColorChannel(e: any) {
  return Math.max(0, Math.min(255, Math.round(e)));
}
function normalizeArgbHex(e: any) {
  let t = e.replace(/^#/, ``);
  return t.length === 8
    ? `#${t.slice(2).toLowerCase()}`
    : t.length === 6
      ? `#${t.toLowerCase()}`
      : `#000000`;
}
function hexToRgbObject(e: any) {
  let t = normalizeArgbHex(e);
  return {
    b: Number.parseInt(t.slice(5, 7), 16),
    g: Number.parseInt(t.slice(3, 5), 16),
    r: Number.parseInt(t.slice(1, 3), 16),
  };
}
function rgbChannelsToHex(e: any, t: any, n: any) {
  return `#${[e, t, n].map((e) => clampColorChannel(e).toString(16).padStart(2, `0`)).join(``)}`;
}
function applyColorTransforms(e: any, t: any) {
  let { r: n, g: r, b: i } = hexToRgbObject(e),
    a = 1,
    o = 1,
    s = 0;
  return (
    t.forEach((e: any) => {
      let t = Number(e.getAttribute(`val`) ?? 0),
        c = Number.isFinite(t) ? t / 1e5 : 0;
      switch (e.localName) {
        case `alpha`:
          a *= c;
          break;
        case `lumMod`:
          o *= c;
          break;
        case `lumOff`:
          s += c;
          break;
        case `shade`:
          ((n *= c), (r *= c), (i *= c));
          break;
        case `tint`:
          ((n += (255 - n) * c), (r += (255 - r) * c), (i += (255 - i) * c));
          break;
        default:
          break;
      }
    }),
    (o !== 1 || s !== 0) && ((n = n * o + 255 * s), (r = r * o + 255 * s), (i = i * o + 255 * s)),
    { color: rgbChannelsToHex(n, r, i), opacity: Math.max(0, Math.min(1, a)) }
  );
}
function schemeColorFromTheme(e: any, t: any) {
  if (!t) return null;
  let n = ({ bg1: `bg1`, bg2: `bg2`, tx1: `tx1`, tx2: `tx2` } as any)[t] ?? t;
  return e.colors.get(n) ?? null;
}
function drawingColorFromElement(e: any, t: any) {
  if (!e) return null;
  let n = null;
  return (
    e.localName === `srgbClr`
      ? (n = normalizeArgbHex(e.getAttribute(`val`) ?? ``))
      : e.localName === `schemeClr`
        ? (n = schemeColorFromTheme(t, e.getAttribute(`val`)))
        : e.localName === `scrgbClr`
          ? (n = rgbChannelsToHex(
              (Number(e.getAttribute(`r`) ?? 0) * 255) / 1e5,
              (Number(e.getAttribute(`g`) ?? 0) * 255) / 1e5,
              (Number(e.getAttribute(`b`) ?? 0) * 255) / 1e5,
            ))
          : e.localName === `sysClr` && (n = normalizeArgbHex(e.getAttribute(`lastClr`) ?? ``)),
    n ? applyColorTransforms(n, (Array.from(e.childNodes) as any[]).filter(isElementNodeWb)) : null
  );
}
function drawingSolidFill(e: any, t: any) {
  if (!e) return null;
  let n = firstChildWb(e, `solidFill`);
  return n ? drawingColorFromElement((Array.from(n.childNodes) as any[]).filter(isElementNodeWb)[0] ?? null, t) : null;
}
function resolveSchemeTypefaceWb(e: any, t: any) {
  if (e)
    return e === `+mn-lt` || e === `+mn-ea` || e === `+mn-cs`
      ? (t.minorLatinFont ?? void 0)
      : e === `+mj-lt` || e === `+mj-ea` || e === `+mj-cs`
        ? (t.majorLatinFont ?? void 0)
        : e;
}
function isSchemeTypeface(e: any) {
  return !!(e && e.startsWith(`+`));
}
function runTypefaceFromElement(e: any, t: any) {
  if (!e) return;
  let n = [
    firstChildWb(e, `latin`)?.getAttribute(`typeface`) ?? null,
    firstChildWb(e, `ea`)?.getAttribute(`typeface`) ?? null,
    firstChildWb(e, `cs`)?.getAttribute(`typeface`) ?? null,
  ];
  return n.find((e) => e && !isSchemeTypeface(e)) || resolveSchemeTypefaceWb(n.find(Boolean) ?? null, t);
}
function textRunStyleFromElement(e: any, t: any, n: any) {
  if (!e) return { color: n?.color };
  let r = drawingSolidFill(e, t) ?? n ?? null,
    i = e.getAttribute(`u`);
  return {
    bold: e.getAttribute(`b`) === `1` || void 0,
    color: r?.color,
    fontFamily: runTypefaceFromElement(e, t),
    fontSizePt: e.getAttribute(`sz`) ? Number(e.getAttribute(`sz`)) / 100 : void 0,
    italic: e.getAttribute(`i`) === `1` || void 0,
    underline: i && i !== `none` ? !0 : void 0,
  };
}
function mergeRunStyles(...e: any[]) {
  return e.reduce(
    (e, t) =>
      t
        ? {
            bold: t.bold ?? e.bold,
            color: t.color ?? e.color,
            fontFamily: t.fontFamily ?? e.fontFamily,
            fontSizePt: t.fontSizePt ?? e.fontSizePt,
            italic: t.italic ?? e.italic,
            underline: t.underline ?? e.underline,
          }
        : e,
    {},
  );
}
function markerPointFromText(e: any) {
  if (!e) return null;
  let t = Number(firstChildWb(e, `col`)?.textContent ?? 0),
    n: any = Number(firstChildWb(e, `row`)?.textContent ?? 0);
  return {
    col: t,
    colOffsetEmu: Number(firstChildWb(e, `colOff`)?.textContent ?? 0),
    row: n,
    rowOffsetEmu: Number(firstChildWb(e, `rowOff`)?.textContent ?? 0),
  };
}
function anchorModelToXml(e: any) {
  if (e.type === `absolute`)
    return {
      kind: `absolute`,
      positionEmu: { x: e.xEmu, y: e.yEmu },
      sizeEmu: { cx: e.widthEmu, cy: e.heightEmu },
    };
  let t = {
    col: e.from.col,
    colOffsetEmu: e.from.colOffsetEmu ?? 0,
    row: e.from.row,
    rowOffsetEmu: e.from.rowOffsetEmu ?? 0,
  };
  return e.type === `oneCell`
    ? { from: t, kind: `one-cell`, sizeEmu: { cx: e.widthEmu, cy: e.heightEmu } }
    : {
        from: t,
        kind: `two-cell`,
        to: {
          col: e.to.col,
          colOffsetEmu: e.to.colOffsetEmu ?? 0,
          row: e.to.row,
          rowOffsetEmu: e.to.rowOffsetEmu ?? 0,
        },
      };
}
export function normalizeDrawingAnchor(e: any, t: any) {
  if (e.kind === `absolute`)
    return {
      heightEmu: e.sizeEmu.cy,
      type: `absolute`,
      widthEmu: e.sizeEmu.cx,
      xEmu: e.positionEmu.x,
      yEmu: e.positionEmu.y,
    };
  let n = {
    col: e.from.col,
    colOffsetEmu: e.from.colOffsetEmu,
    row: e.from.row,
    rowOffsetEmu: e.from.rowOffsetEmu,
  };
  return e.kind === `one-cell`
    ? { from: n, heightEmu: e.sizeEmu.cy, type: `oneCell`, widthEmu: e.sizeEmu.cx }
    : {
        editAs: t,
        from: n,
        to: {
          col: e.to.col,
          colOffsetEmu: e.to.colOffsetEmu,
          row: e.to.row,
          rowOffsetEmu: e.to.rowOffsetEmu,
        },
        type: `twoCell`,
      };
}
function captionColorSpec(e: any) {
  if (e)
    switch (e.colorType) {
      case `auto`:
        return { colorType: `auto` };
      case `rgb`:
        return { b: e.b, colorType: `rgb`, g: e.g, r: e.r };
      case `argb`:
        return { a: e.a, b: e.b, colorType: `argb`, g: e.g, r: e.r };
      case `theme`:
        return { colorType: `theme`, themeIndex: e.index, tint: e.tint };
      case `indexed`:
        return { colorType: `indexed`, paletteIndex: e.index };
    }
}
function captionFontSpec(e: any) {
  if (e)
    return {
      bold: e.bold,
      charset: e.charset,
      color: captionColorSpec(e.color),
      family: e.family,
      italic: e.italic,
      name: e.name,
      scheme: e.scheme,
      size: e.size,
      strikethrough: e.strikethrough,
      underline: e.underline,
      verticalAlign: e.verticalAlign,
    };
}
function captionSpec(e: any) {
  return {
    horizontalAlignment: e.horizontalAlignment,
    runs: e.runs.map((e: any) => ({ font: captionFontSpec(e.font), text: e.text })),
    verticalAlignment: e.verticalAlignment,
  };
}
function resolveCaptionTextColor(e: any, t: any) {
  if (e)
    switch (e.colorType) {
      case `rgb`:
        return (
          resolveFontColor({ rgb: [e.r, e.g, e.b].map((e) => e.toString(16).padStart(2, `0`)).join(``) }) ??
          void 0
        );
      case `argb`:
        return (
          resolveFontColor({ argb: [e.a, e.r, e.g, e.b].map((e) => e.toString(16).padStart(2, `0`)).join(``) }) ??
          void 0
        );
      case `theme`:
        return resolveFontColor({ theme: e.index, tint: e.tint }, t) ?? void 0;
      default:
        return;
    }
}
function captionDisplayProps(e: any, t: any) {
  let n = captionSpec(e),
    r: any = normalizeLabelText(e.runs.map((e: any) => e.text).join(``)),
    i = e.runs.find((e: any) => e.font)?.font,
    a = e.horizontalAlignment;
  return {
    caption: n,
    fontFamily: i?.name,
    fontSizePt: i?.size,
    label: r,
    textAlign: a === `left` || a === `center` || a === `right` ? a : void 0,
    textColor: resolveCaptionTextColor(i?.color, t),
  };
}
function formControlDisplayProps(e: any, t: any) {
  switch (e.kind) {
    case `button`:
      return { ...captionDisplayProps(e.caption, t), kind: `button` };
    case `checkbox`:
      return {
        ...captionDisplayProps(e.caption, t),
        checked: e.state === `checked`,
        kind: `checkbox`,
        linkedCell: e.cellLink,
        no3D: e.no3D,
        state: e.state,
      };
    case `optionButton`:
      return {
        ...captionDisplayProps(e.caption, t),
        checked: e.state === `checked`,
        firstInGroup: e.firstInGroup,
        kind: `radio`,
        linkedCell: e.cellLink,
        no3D: e.no3D,
        state: e.state,
      };
    case `label`:
      return { ...captionDisplayProps(e.caption, t), kind: `label` };
    case `groupBox`:
      return { ...captionDisplayProps(e.caption, t), kind: `group-box`, no3D: e.no3D };
    case `listBox`:
      return {
        inputRange: e.inputRange,
        kind: `listbox`,
        linkedCell: e.cellLink,
        no3D: e.no3D,
        selected: [...e.selected],
        selection: e.selection,
      };
    case `dropdown`:
      return {
        inputRange: e.inputRange,
        kind: `dropdown`,
        lines: e.lines,
        linkedCell: e.cellLink,
        no3D: e.no3D,
        selected: e.selected,
      };
    case `scrollbar`:
      return {
        horizontal: e.horizontal,
        increment: e.increment,
        kind: `scrollbar`,
        linkedCell: e.cellLink,
        max: e.max,
        min: e.min,
        page: e.page,
        value: e.value,
      };
    case `spinner`:
      return {
        increment: e.increment,
        kind: `spinner`,
        linkedCell: e.cellLink,
        max: e.max,
        min: e.min,
        value: e.value,
      };
    case `unknown`:
      return {
        ...captionDisplayProps(e.caption, t),
        kind: e.objectType.toLowerCase() === `editbox` ? `editbox` : `unknown`,
        legacyObjectType: e.legacyObjectType,
        objectType: e.objectType,
        rawObj: e.rawObj,
        rawProperties: e.rawProperties,
      };
  }
}
function buildFormControlModel(e: any, t: any, n: any, r: any) {
  return {
    altText: e.altText,
    anchor: anchorModelToXml(e.anchor),
    controlIndex: t,
    editAs: e.anchor.type === `twoCell` ? e.anchor.editAs : void 0,
    hidden: e.hidden,
    id: `form-control-${n}-${t}`,
    locked: e.locked,
    macroName: e.formControl.macroName,
    name: e.name,
    printable: e.printable,
    rawClientData: e.formControl.rawClientData,
    sheetIndex: n,
    title: e.title,
    workbookSheetIndex: n,
    zIndex: (e.drawingPath[0] ?? t) + 1,
    ...formControlDisplayProps(e.formControl.kind, r),
  };
}
function buildFormControlsBySheet(e: any, t?: any) {
  return (Array.from({ length: e.sheetCount }, (n, r) => {
    try {
      let n = e.getSheet(r).formControls;
      return Array.isArray(n) ? n.flatMap((e, n) => (e.anchor ? [buildFormControlModel(e, n, r, t)] : [])) : [];
    } catch {
      return [];
    }
  }) as any[]);
}
function normalizeLabelText(e: any) {
  if (!e) return;
  let t = e
    .replace(/\u00a0/g, ` `)
    .replace(/\s+/g, ` `)
    .trim();
  return t.length > 0 ? t : void 0;
}
function legacyAnchorFromElement(e: any) {
  if (e.localName === `anchor`) {
    let t = markerPointFromText(firstChildWb(e, `from`)),
      n: any = markerPointFromText(firstChildWb(e, `to`));
    return t && n ? { from: t, kind: `two-cell`, to: n } : null;
  }
  if (e.localName === `twoCellAnchor`) {
    let t = markerPointFromText(firstChildWb(e, `from`)),
      n: any = markerPointFromText(firstChildWb(e, `to`));
    return t && n ? { from: t, kind: `two-cell`, to: n } : null;
  }
  if (e.localName === `oneCellAnchor`) {
    let t = markerPointFromText(firstChildWb(e, `from`)),
      n: any = firstChildWb(e, `ext`);
    return t && n
      ? {
          from: t,
          kind: `one-cell`,
          sizeEmu: { cx: Number(n.getAttribute(`cx`) ?? 0), cy: Number(n.getAttribute(`cy`) ?? 0) },
        }
      : null;
  }
  let t = firstChildWb(e, `pos`),
    n: any = firstChildWb(e, `ext`);
  return t && n
    ? {
        kind: `absolute`,
        positionEmu: { x: Number(t.getAttribute(`x`) ?? 0), y: Number(t.getAttribute(`y`) ?? 0) },
        sizeEmu: { cx: Number(n.getAttribute(`cx`) ?? 0), cy: Number(n.getAttribute(`cy`) ?? 0) },
      }
    : null;
}
function anchorEmuRect(e: any) {
  return e.kind === `absolute`
    ? { cx: e.sizeEmu.cx, cy: e.sizeEmu.cy, x: e.positionEmu.x, y: e.positionEmu.y }
    : e.kind === `one-cell`
      ? { cx: e.sizeEmu.cx, cy: e.sizeEmu.cy, x: e.from.colOffsetEmu, y: e.from.rowOffsetEmu }
      : {
          cx: Math.max(0, (e.to.col - e.from.col) * maxColumnWidthEmu + e.to.colOffsetEmu - e.from.colOffsetEmu),
          cy: Math.max(0, (e.to.row - e.from.row) * defaultRowHeightEmu + e.to.rowOffsetEmu - e.from.rowOffsetEmu),
          x: e.from.colOffsetEmu,
          y: e.from.rowOffsetEmu,
        };
}
function columnWidthPxAt(e: any, t: any) {
  return t < 0 ? 0 : (e?.colWidthOverridesPx[t] ?? e?.defaultColWidthPx ?? emuToPx(maxColumnWidthEmu));
}
function rowHeightPxAt(e: any, t: any) {
  return t < 0 ? 0 : (e?.rowHeightOverridesPx[t] ?? e?.defaultRowHeightPx ?? emuToPx(defaultRowHeightEmu));
}
function columnOffsetPx(e: any, t: any) {
  let n = 0;
  for (let r = 0; r < t; r += 1) n += pxToEmu(columnWidthPxAt(e, r));
  return n;
}
function rowOffsetPx(e: any, t: any) {
  let n = 0;
  for (let r = 0; r < t; r += 1) n += pxToEmu(rowHeightPxAt(e, r));
  return n;
}
function anchorRectPx(e: any, t: any) {
  if (e.kind === `absolute`) return anchorEmuRect(e);
  if (e.kind === `one-cell`)
    return {
      cx: e.sizeEmu.cx,
      cy: e.sizeEmu.cy,
      x: columnOffsetPx(t, e.from.col) + e.from.colOffsetEmu,
      y: rowOffsetPx(t, e.from.row) + e.from.rowOffsetEmu,
    };
  let n = columnOffsetPx(t, e.from.col) + e.from.colOffsetEmu,
    r: any = rowOffsetPx(t, e.from.row) + e.from.rowOffsetEmu,
    i = columnOffsetPx(t, e.to.col) + e.to.colOffsetEmu,
    a = rowOffsetPx(t, e.to.row) + e.to.rowOffsetEmu;
  return { cx: Math.max(0, i - n), cy: Math.max(0, a - r), x: n, y: r };
}
function rectToAbsoluteAnchor(e: any) {
  return { kind: `absolute`, positionEmu: { x: e.x, y: e.y }, sizeEmu: { cx: e.cx, cy: e.cy } };
}
function xfrmFromElement(e: any) {
  if (!e) return null;
  let t = firstChildWb(e, `off`),
    n: any = firstChildWb(e, `ext`);
  return !t || !n
    ? null
    : {
        cx: Number(n.getAttribute(`cx`) ?? 0),
        cy: Number(n.getAttribute(`cy`) ?? 0),
        flipH: e.getAttribute(`flipH`) === `1`,
        flipV: e.getAttribute(`flipV`) === `1`,
        rot: Number(e.getAttribute(`rot`) ?? 0) / 6e4,
        x: Number(t.getAttribute(`x`) ?? 0),
        y: Number(t.getAttribute(`y`) ?? 0),
      };
}
function applyChildTransform(e: any, t: any) {
  return {
    cx: e.cx * t.scaleX,
    cy: e.cy * t.scaleY,
    x: t.x + (e.x - t.chX) * t.scaleX,
    y: t.y + (e.y - t.chY) * t.scaleY,
  };
}
function resolveGroupChildTransform(e: any, t: any, n: any, r: any) {
  let i = firstDescendantWb(firstChildWb(e, `grpSpPr`) ?? e, `xfrm`),
    a = anchorRectPx(n, r),
    o = xfrmFromElement(i) ?? a,
    s = Math.abs(o.x - a.x) <= emuPerPixel && Math.abs(o.y - a.y) <= emuPerPixel,
    c = firstChildWb(i ?? e, `chOff`),
    l = firstChildWb(i ?? e, `chExt`),
    u = o.cx === 0 ? 1 : a.cx / o.cx,
    d = o.cy === 0 ? 1 : a.cy / o.cy,
    f = !t && (u < 0.85 || u > 1.15 || d < 0.85 || d > 1.15),
    p: any = t ? applyChildTransform(o, t) : s ? o : a,
    m = t ? Number(c?.getAttribute(`x`) ?? 0) : f ? o.x : Number(c?.getAttribute(`x`) ?? 0),
    h: any = t ? Number(c?.getAttribute(`y`) ?? 0) : f ? o.y : Number(c?.getAttribute(`y`) ?? 0),
    g: any = t
      ? Number(l?.getAttribute(`cx`) ?? o.cx)
      : f
        ? o.cx
        : Number(l?.getAttribute(`cx`) ?? o.cx),
    _ = t
      ? Number(l?.getAttribute(`cy`) ?? o.cy)
      : f
        ? o.cy
        : Number(l?.getAttribute(`cy`) ?? o.cy);
  return {
    chCx: g,
    chCy: _,
    chX: m,
    chY: h,
    cx: p.cx,
    cy: p.cy,
    scaleX: g === 0 ? (t?.scaleX ?? 1) : p.cx / g,
    scaleY: _ === 0 ? (t?.scaleY ?? 1) : p.cy / _,
    x: p.x,
    y: p.y,
  };
}
function shapeTransformFromXfrm(e: any, t: any, n: any) {
  let r = xfrmFromElement(firstDescendantWb(e, `xfrm`));
  if (r) {
    let e = n?.scaleX ?? 1,
      i = n?.scaleY ?? 1;
    return {
      anchor: n ? rectToAbsoluteAnchor(applyChildTransform(r, n)) : t,
      flipH: r.flipH,
      flipV: r.flipV,
      rotationDeg: r.rot,
      scaleX: e,
      scaleY: i,
    };
  }
  return {
    anchor: t,
    flipH: !1,
    flipV: !1,
    rotationDeg: 0,
    scaleX: n?.scaleX ?? 1,
    scaleY: n?.scaleY ?? 1,
  };
}
function textAlignFromDrawing(e: any) {
  switch (e) {
    case `ctr`:
      return `center`;
    case `just`:
      return `justify`;
    case `r`:
      return `right`;
    case `l`:
      return `left`;
    default:
      return;
  }
}
function verticalAlignFromDrawing(e: any) {
  switch (e) {
    case `b`:
      return `bottom`;
    case `ctr`:
      return `middle`;
    default:
      return `top`;
  }
}
function drawingAnchorElements(e: any) {
  return e.documentElement
    ? (Array.from(e.documentElement.childNodes) as any[]).filter(
        (e) =>
          isElementNodeWb(e) &&
          (e.localName === `twoCellAnchor` ||
            e.localName === `oneCellAnchor` ||
            e.localName === `absoluteAnchor`),
      )
    : [];
}
function bytesToObjectUrl(e: any, t: any, n: any) {
  if (typeof URL < `u` && typeof Blob < `u`) {
    let r: any = URL.createObjectURL(new Blob([copyToUint8Array(e)], { type: t }));
    return (n.push(r), r);
  }
  let r: any = ``;
  for (let t of e) r += String.fromCharCode(t);
  return `data:${t};base64,${typeof btoa == `function` ? btoa(r) : ``}`;
}
function isConnectorGeometry(e: any) {
  return e === `line` || e === `arc` || e === `leftBrace`;
}
function drawingLineProps(e: any, t: any, n: any) {
  let r: any = firstDescendantWb(e, `ln`),
    i = t ? firstChildWb(t, `lnRef`) : null;
  if (!r && !i) return;
  if (r && firstChildWb(r, `noFill`)) return { none: !0 };
  let a = drawingSolidFill(r, n) ?? drawingColorFromElement((Array.from(i?.childNodes ?? []) as any[]).filter(isElementNodeWb)[0] ?? null, n),
    o = Number(r?.getAttribute(`w`) ?? 0);
  return {
    color: a?.color,
    dash: firstChildWb(r ?? e, `prstDash`)?.getAttribute(`val`) ?? void 0,
    headEndType: firstChildWb(r ?? e, `headEnd`)?.getAttribute(`type`) ?? void 0,
    none: !1,
    opacity: a?.opacity,
    tailEndType: firstChildWb(r ?? e, `tailEnd`)?.getAttribute(`type`) ?? void 0,
    widthPx: o > 0 ? emuToPx(o) : void 0,
  };
}
function drawingFillProps(e: any, t: any, n: any, r: any) {
  let i = firstChildWb(e, `spPr`) ?? e;
  if (firstChildWb(i, `noFill`) || isConnectorGeometry(r)) return { none: !0 };
  let a = t ? firstChildWb(t, `fillRef`) : null,
    o = drawingSolidFill(i, n) ?? drawingColorFromElement((Array.from(a?.childNodes ?? []) as any[]).filter(isElementNodeWb)[0] ?? null, n);
  if (o) return { color: o.color, none: !1, opacity: o.opacity };
}
function pathPointAttr(e: any) {
  if (!e) return null;
  let t = Number(e.getAttribute(`x`) ?? NaN),
    n: any = Number(e.getAttribute(`y`) ?? NaN);
  return Number.isFinite(t) && Number.isFinite(n) ? { x: t, y: n } : null;
}
function customGeometryPath(e: any) {
  let t = firstDescendantWb(e, `path`);
  if (!t) return;
  let n = Number(t.getAttribute(`w`) ?? NaN),
    r: any = Number(t.getAttribute(`h`) ?? NaN);
  if (!Number.isFinite(n) || !Number.isFinite(r) || n <= 0 || r <= 0) return;
  let i = [],
    a = null;
  for (let e of (Array.from(t.childNodes) as any[]).filter(isElementNodeWb)) {
    if (e.localName === `moveTo`) {
      let t = pathPointAttr(firstChildWb(e, `pt`));
      t && (i.push(`M ${t.x} ${t.y}`), (a = t));
      continue;
    }
    if (e.localName === `lnTo`) {
      let t: any = pathPointAttr(firstChildWb(e, `pt`));
      t && (!a || t.x !== a.x || t.y !== a.y) && (i.push(`L ${t.x} ${t.y}`), (a = t));
      continue;
    }
    if (e.localName === `cubicBezTo`) {
      let t: any = childElementsWb(e, `pt`)
        .map(pathPointAttr)
        .filter((e) => e !== null);
      t.length === 3 &&
        (i.push(`C ${t[0].x} ${t[0].y} ${t[1].x} ${t[1].y} ${t[2].x} ${t[2].y}`), (a = t[2]));
      continue;
    }
    e.localName === `close` && (i.push(`Z`), (a = null));
  }
  if (i.length !== 0) return { path: i.join(` `), viewBox: { height: r, width: n } };
}
function geometryAdjustValues(e: any) {
  let t: any = firstDescendantWb(e, `prstGeom`);
  if (!t) return;
  let n: any = {};
  return (
    childElementsWb(firstChildWb(t, `avLst`), `gd`).forEach((e) => {
      let t: any = e.getAttribute(`name`),
        r: any = (e.getAttribute(`fmla`) ?? ``).match(/^val\s+(-?\d+(?:\.\d+)?)$/);
      if (!t || !r) return;
      let i = Number.parseFloat(r[1] ?? ``);
      Number.isFinite(i) && (n[t] = i);
    }),
    Object.keys(n).length > 0 ? n : void 0
  );
}
function drawingParagraphs(e: any, t: any, n: any) {
  let r: any = firstChildWb(e, `txBody`);
  if (!r) return [];
  let i = t ? firstChildWb(t, `fontRef`) : null,
    a = drawingColorFromElement((Array.from(i?.childNodes ?? []) as any[]).filter(isElementNodeWb)[0] ?? null, n),
    o = firstChildWb(r, `lstStyle`),
    s: any[] = [];
  return (
    childElementsWb(r, `p`).forEach((e) => {
      let t: any = firstChildWb(e, `pPr`),
        i = Number(t?.getAttribute(`lvl`) ?? 0),
        c = mergeRunStyles(
          textRunStyleFromElement(firstChildWb(firstChildWb(o ?? r, `lvl${i + 1}pPr`) ?? r, `defRPr`), n, a),
          textRunStyleFromElement(firstChildWb(t ?? e, `defRPr`), n, a),
        ),
        l = [],
        u = !1;
      if (
        ((Array.from(e.childNodes) as any[])
          .filter(isElementNodeWb)
          .forEach((e) => {
            if (e.localName === `br`) {
              ((u = !0),
                l.push({
                  text: `
`,
                }));
              return;
            }
            if (e.localName !== `r`) return;
            u = !0;
            let t: any = firstChildWb(e, `t`)?.textContent ?? ``,
              r: any = mergeRunStyles(c, textRunStyleFromElement(firstChildWb(e, `rPr`), n, a));
            l.push({
              bold: r.bold,
              color: r.color,
              fontFamily: r.fontFamily,
              fontSizePt: r.fontSizePt,
              italic: r.italic,
              text: t,
              underline: r.underline,
            });
          }),
        l.length === 0)
      ) {
        if (!u && !firstChildWb(e, `endParaRPr`)) return;
        l.push({
          bold: c.bold,
          color: c.color,
          fontFamily: c.fontFamily,
          fontSizePt: c.fontSizePt,
          italic: c.italic,
          text: ` `,
          underline: c.underline,
        });
      }
      s.push({ align: textAlignFromDrawing(t?.getAttribute(`algn`)), runs: l });
    }),
    s
  );
}
function drawingTextBoxProps(e: any) {
  let t: any = firstChildWb(e, `txBody`);
  if (!t) return;
  let n = firstChildWb(t, `bodyPr`),
    r: any = emuToPx(Number(n?.getAttribute(`lIns`) ?? 91440)),
    i = emuToPx(Number(n?.getAttribute(`rIns`) ?? 91440)),
    a = emuToPx(Number(n?.getAttribute(`tIns`) ?? 45720)),
    o = emuToPx(Number(n?.getAttribute(`bIns`) ?? 45720));
  return {
    horizontalAlign: n?.getAttribute(`anchorCtr`) === `1` ? `center` : `left`,
    insetPx: { bottom: o, left: r, right: i, top: a },
    verticalAlign: verticalAlignFromDrawing(n?.getAttribute(`anchor`)),
  };
}
function drawingHyperlinkTarget(e: any, t: any) {
  let n = (e ? firstDescendantWb(e, `hlinkClick`) : null) ?? e,
    r: any = n ? relationIdAttr(n) : null;
  return r ? (t.get(r)?.target ?? void 0) : void 0;
}
function drawingImageFromPic(e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any, c: any, l: any) {
  let u = firstDescendantWb(e, `blip`),
    d = u ? firstDescendantWb(u, `svgBlip`) : null,
    f = (d ? relationEmbedAttr(d) : null) ?? (u ? relationEmbedAttr(u) : null);
  if (!f) return null;
  let p: any = n.get(f);
  if (!p || p.type !== imageRelNamespace) return null;
  let m: any[] = r[p.target];
  if (!m) return null;
  let h: any = firstDescendantWb(e, `cNvPr`);
  return {
    image: {
      anchor: shapeTransformFromXfrm(e, t, l).anchor,
      description: h?.getAttribute(`descr`) ?? void 0,
      hyperlink: drawingHyperlinkTarget(h ?? e, n),
      id: s,
      mediaPath: p.target,
      mimeType: contentTypeForPart(i, p.target),
      name: h?.getAttribute(`name`) ?? void 0,
      sheetIndex: o,
      src: bytesToObjectUrl(m, contentTypeForPart(i, p.target), a),
      workbookSheetIndex: o,
      zIndex: c,
    },
    mediaPath: p.target,
  };
}
function drawingShapeFromSp(e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any) {
  let c = firstDescendantWb(e, `cNvPr`),
    l = firstChildWb(e, `style`),
    u = shapeTransformFromXfrm(e, t, s),
    d = firstDescendantWb(e, `prstGeom`)?.getAttribute(`prst`) ?? (firstDescendantWb(e, `custGeom`) ? `custom` : `rect`),
    f = d === `custom` ? customGeometryPath(e) : void 0,
    p = geometryAdjustValues(e);
  return {
    anchor: u.anchor,
    description: c?.getAttribute(`descr`) ?? void 0,
    fill: drawingFillProps(e, l, r, d),
    flipH: u.flipH,
    flipV: u.flipV,
    geometry: d,
    geometryAdjustments: p,
    hidden: c?.getAttribute(`hidden`) === `1` || void 0,
    hyperlink: drawingHyperlinkTarget(c ?? e, n),
    id: a,
    name: c?.getAttribute(`name`) ?? void 0,
    paragraphs: drawingParagraphs(e, l, r),
    rotationDeg: u.rotationDeg,
    scaleX: u.scaleX,
    scaleY: u.scaleY,
    sheetIndex: i,
    svgPath: f?.path,
    svgViewBox: f?.viewBox,
    stroke: drawingLineProps(e, l, r),
    textBox: drawingTextBoxProps(e),
    workbookSheetIndex: i,
    zIndex: o,
  };
}
function collectDrawingShapes(e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any, c: any, l: any, u: any, d: any, f = null) {
  let p: any[] = [],
    m: any[] = [],
    h = new Set();
  return (
    (Array.from(e.childNodes) as any[])
      .filter(isElementNodeWb)
      .forEach((e) => {
        if (e.localName === `pic`) {
          let s = `sheet-${o}-${c.image}`,
            d = drawingImageFromPic(e, t, n, r, i, a, o, s, c.z++, f);
          ((c.image += 1),
            d &&
              (p.push(d.image),
              h.add(d.mediaPath),
              l.set(s, { anchorIndex: u, workbookSheetIndex: o })));
          return;
        }
        if (e.localName === `sp`) {
          m.push(drawingShapeFromSp(e, t, n, s, o, `shape-${o}-${c.shape++}`, c.z++, f));
          return;
        }
        if (e.localName === `cxnSp`) {
          m.push(drawingShapeFromSp(e, t, n, s, o, `shape-${o}-${c.shape++}`, c.z++, f));
          return;
        }
        if (e.localName !== `grpSp`) return;
        let g: any = resolveGroupChildTransform(e, f, t, d),
          _ = collectDrawingShapes(e, rectToAbsoluteAnchor({ cx: g.cx, cy: g.cy, x: g.x, y: g.y }), n, r, i, a, o, s, c, l, u, d, g);
        (_.images.forEach((e) => p.push(e)),
          _.shapes.forEach((e) => m.push(e)),
          _.mediaPaths.forEach((e) => h.add(e)));
      }),
    { images: p, mediaPaths: h, shapes: m }
  );
}
function parseDrawingPart(e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any, c: any) {
  let l = zipEntryTextWb(e, n);
  if (!l) return { images: [], mediaPaths: [], shapes: [] };
  let u = parseXmlStrict(l);
  if (!u) return { images: [], mediaPaths: [], shapes: [] };
  let d = relationshipMapForPart(e, zipRelsPath(n), n),
    f: any[] = [],
    p: any[] = [],
    m = new Set(),
    h = drawingAnchorElements(u),
    g = { image: a, shape: a, z: a };
  return (
    h.forEach((n, a) => {
      let l = legacyAnchorFromElement(n);
      if (!l) return;
      let u = collectDrawingShapes(n, l, d, e, t, r, i, o, g, c, a, s);
      (u.images.forEach((e) => f.push(e)),
        u.shapes.forEach((e) => p.push(e)),
        u.mediaPaths.forEach((e) => m.add(e)));
    }),
    { images: f, mediaPaths: [...m], shapes: p }
  );
}
export function syncFormControls(e: any, t: any, n: any) {
  return buildFormControlsBySheet(e, n);
}
export function disposeImageAssets(e: any) {
  if (e) for (let t of e.objectUrls) t.startsWith(`blob:`) && URL.revokeObjectURL(t);
}
function parseWorkbookMetadata(e: any, t?: any) {
  let n = contentTypeMaps(e),
    r: any = workbookSheetEntries(e),
    i = parseTheme(e),
    a = themePaletteModel(i),
    { defaultFont: o, namedCellStyleByName: s, styleById: c, tableStyleByName: l } = parseStylesPart(e);
  return {
    contentTypes: n,
    namedCellStyleByName: s,
    sheetStatesByWorkbookSheetIndex: r.map((n: any) =>
      parseSheetLayout(e, n.path, { ...t, defaultFont: o, themePalette: a }),
    ),
    styleById: c,
    tableMetadataByWorkbookSheetIndex: r.map(() => []),
    tableStyleByName: l,
    theme: i,
    themePalette: a,
    workbookSheets: r,
  };
}
// A0-S2b：t 改可选（类型唯一，发射不变）——原 bundle 调用点即单参（XlsxDeepA 728）
export function parseWorkbookImageAssets(e: any, t?: any) {
  let n = M(e),
    {
      contentTypes: r,
      namedCellStyleByName: i,
      sheetStatesByWorkbookSheetIndex: a,
      styleById: o,
      tableMetadataByWorkbookSheetIndex: s,
      tableStyleByName: c,
      theme: l,
      themePalette: u,
      workbookSheets: d,
    } = parseWorkbookMetadata(n),
    f: any[] = [],
    p: any[] = [],
    m: any[] = [],
    h: any[] = [],
    g: any[] = [],
    _ = new Map(),
    v = t ? buildFormControlsBySheet(t, u) : [];
  return (
    d.forEach((e: any, t: any) => {
      let i = relationshipMapForPart(n, zipRelsPath(e.path), e.path),
        o = [],
        s = [],
        c = [],
        u = 1;
      for (let e of i.values()) {
        if (e.type !== drawingRelNamespace) continue;
        let i = e.target,
          d = zipRelsPath(i),
          p = parseDrawingPart(n, r, i, f, t, u, l, a[t] ?? null, _);
        (s.push(...p.images),
          c.push(...p.shapes),
          (u += p.images.length + p.shapes.length + 10),
          o.push({ drawingPath: i, drawingRelsPath: n[d] ? d : null, mediaPaths: p.mediaPaths }));
      }
      let d = c.filter((e) => !e.hidden);
      ((p[t] = v[t] ?? []),
        (m[t] = s),
        (h[t] = d),
        (g[t] = o.length > 0 ? { attachments: o, workbookSheetIndex: t } : null));
    }),
    {
      archive: n,
      dirtyArchivePaths: new Set(),
      formControlsByWorkbookSheetIndex: p,
      imageOriginsById: _,
      imagesByWorkbookSheetIndex: m,
      namedCellStyleByName: i,
      objectUrls: f,
      shapesByWorkbookSheetIndex: h,
      sheetOrigins: g,
      sheetStatesByWorkbookSheetIndex: a,
      styleById: o,
      tableMetadataByWorkbookSheetIndex: s,
      tableStyleByName: c,
      themePalette: u,
    }
  );
}
function writeAnchorGeometryWb(e: any, t: any) {
  if (t.kind === `two-cell`) {
    (writeMarkerText(firstChildWb(e, `from`), t.from), writeMarkerText(firstChildWb(e, `to`), t.to));
    return;
  }
  if (t.kind === `one-cell`) {
    writeMarkerText(firstChildWb(e, `from`), t.from);
    let n = firstChildWb(e, `ext`);
    n &&
      (n.setAttribute(`cx`, String(Math.max(0, Math.round(t.sizeEmu.cx)))),
      n.setAttribute(`cy`, String(Math.max(0, Math.round(t.sizeEmu.cy)))));
    return;
  }
  let n = firstChildWb(e, `pos`);
  n &&
    (n.setAttribute(`x`, String(Math.max(0, Math.round(t.positionEmu.x)))),
    n.setAttribute(`y`, String(Math.max(0, Math.round(t.positionEmu.y)))));
  let r: any = firstChildWb(e, `ext`);
  r &&
    (r.setAttribute(`cx`, String(Math.max(0, Math.round(t.sizeEmu.cx)))),
    r.setAttribute(`cy`, String(Math.max(0, Math.round(t.sizeEmu.cy)))));
}
export function updateImageRect(e: any, t: any, n: any) {
  let r: any = e.imageOriginsById.get(t);
  if (!r) return !1;
  let i = e.sheetOrigins[r.workbookSheetIndex]?.attachments ?? [];
  for (let a of i) {
    let i = zipEntryTextWb(e.archive, a.drawingPath);
    if (!i) continue;
    let o = parseXmlStrict(i);
    if (!o) continue;
    let s = drawingAnchorElements(o)[r.anchorIndex];
    if (!s || !firstChildWb(s, `pic`)) continue;
    (writeAnchorGeometryWb(s, n), (e.archive[a.drawingPath] = j(serializeXmlWb(o))), e.dirtyArchivePaths.add(normalizeZipPath(a.drawingPath)));
    let c = e.imagesByWorkbookSheetIndex[r.workbookSheetIndex] ?? [],
      l = c.findIndex((e: any) => e.id === t);
    return (l >= 0 && (c[l] = { ...c[l], anchor: n }), !0);
  }
  return !1;
}
function ensureRelsDocument(e: any, t: any) {
  let n = zipEntryTextWb(e, t);
  if (n) {
    let e = parseXmlStrict(n);
    if (e) return e;
  }
  return parseXmlStrict(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${packageRelationshipsNamespace}"></Relationships>`,
  );
}
function ensureContentTypesDocument(e: any) {
  let t: any = zipEntryTextWb(e, `[Content_Types].xml`);
  if (t) {
    let e = parseXmlStrict(t);
    if (e) return e;
  }
  return parseXmlStrict(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="${contentTypesNamespace}"></Types>`);
}
function ensureContentTypeEntry(e: any, t: any, n: any) {
  let r: any = `/${normalizeZipPath(n)}`,
    i = e.documentElement;
  if (!i) return;
  if (!descendantElementsWb(e, `Override`).find((e: any) => e.getAttribute(`PartName`) === r) && t) {
    let e = descendantElementsWb(t, `Override`).find((e: any) => e.getAttribute(`PartName`) === r);
    if (e) {
      i.appendChild(e.cloneNode(!0));
      return;
    }
  }
  let a = r.split(`.`).pop()?.toLowerCase();
  if (a && !descendantElementsWb(e, `Default`).find((e: any) => (e.getAttribute(`Extension`) ?? ``).toLowerCase() === a)) {
    if (t) {
      let e = descendantElementsWb(t, `Default`).find((e: any) => (e.getAttribute(`Extension`) ?? ``).toLowerCase() === a);
      if (e) {
        i.appendChild(e.cloneNode(!0));
        return;
      }
    }
    if (a === `xml`) {
      let t: any = e.createElementNS(contentTypesNamespace, `Default`);
      (t.setAttribute(`Extension`, a),
        t.setAttribute(`ContentType`, `application/xml`),
        i.appendChild(t));
      return;
    }
    if (a === `rels`) {
      let t: any = e.createElementNS(contentTypesNamespace, `Default`);
      (t.setAttribute(`Extension`, a),
        t.setAttribute(`ContentType`, `application/vnd.openxmlformats-package.relationships+xml`),
        i.appendChild(t));
    }
  }
}
function removeDrawingRefs(e: any, t: any) {
  (descendantElementsWb(e, `drawing`).forEach((e: any) => e.remove()),
    descendantElementsWb(t, `Relationship`)
      .filter((e: any) => e.getAttribute(`Type`) === drawingRelNamespace)
      .forEach((e: any) => e.remove()));
}
function nextDrawingRelationId(e: any) {
  let t: any = new Set(
      descendantElementsWb(e, `Relationship`)
        .map((e: any) => e.getAttribute(`Id`))
        .filter((e) => !!e),
    ),
    n = 1;
  for (; t.has(`rIdReactXlsxImage${n}`);) n += 1;
  return `rIdReactXlsxImage${n}`;
}
function appendDrawingElement(e: any, t: any) {
  let n = e.documentElement;
  if (!n) return;
  let r: any = e.createElementNS(spreadsheetMlNamespace, `drawing`);
  r.setAttributeNS(officeRelationshipsNamespace, `r:id`, t);
  let i = firstChildWb(n, `extLst`);
  if (i) {
    n.insertBefore(r, i);
    return;
  }
  n.appendChild(r);
}
export function saveXlsxWithAssets(e: any, t: any, n: any) {
  if (!t || t.dirtyArchivePaths.size === 0) return copyToUint8Array(e);
  try {
    let r: any = M(e),
      i = workbookSheetEntries(r),
      a = parseXmlStrict(zipEntryTextWb(t.archive, `[Content_Types].xml`) ?? ``),
      o = ensureContentTypesDocument(r);
    if (!o) return copyToUint8Array(e);
    n.forEach((e: any, n: any) => {
      let s = e?.attachments.some(
        (e: any) =>
          t.dirtyArchivePaths.has(normalizeZipPath(e.drawingPath)) ||
          (e.drawingRelsPath && t.dirtyArchivePaths.has(normalizeZipPath(e.drawingRelsPath))) ||
          e.mediaPaths.some((e: any) => t.dirtyArchivePaths.has(normalizeZipPath(e))),
      );
      if (!e?.attachments.length || !s) return;
      let c = i[n];
      if (!c) return;
      let l = zipEntryTextWb(r, c.path);
      if (!l) return;
      let u = parseXmlStrict(l),
        d = zipRelsPath(c.path),
        f = ensureRelsDocument(r, d);
      !u ||
        !f ||
        (removeDrawingRefs(u, f),
        e.attachments.forEach((e: any) => {
          let n = t.archive[e.drawingPath];
          if (!n) return;
          if (((r[e.drawingPath] = copyToUint8Array(n)), ensureContentTypeEntry(o, a, e.drawingPath), e.drawingRelsPath)) {
            let n = t.archive[e.drawingRelsPath];
            n && ((r[e.drawingRelsPath] = copyToUint8Array(n)), ensureContentTypeEntry(o, a, e.drawingRelsPath));
          }
          e.mediaPaths.forEach((e: any) => {
            let n = t.archive[e];
            n && ((r[e] = copyToUint8Array(n)), ensureContentTypeEntry(o, a, e));
          });
          let i = nextDrawingRelationId(f),
            s = f.createElementNS(packageRelationshipsNamespace, `Relationship`);
          (s.setAttribute(`Id`, i),
            s.setAttribute(`Type`, drawingRelNamespace),
            s.setAttribute(`Target`, relativeZipPath(c.path, e.drawingPath)),
            f.documentElement?.appendChild(s),
            appendDrawingElement(u, i));
        }),
        (r[c.path] = j(serializeXmlWb(u))),
        (r[d] = j(serializeXmlWb(f))),
        ensureContentTypeEntry(o, a, d));
    });
    for (let e of t.dirtyArchivePaths) {
      let n = t.archive[e];
      n && ((r[e] = copyToUint8Array(n)), ensureContentTypeEntry(o, a, e));
    }
    if (!descendantElementsWb(o, `Override`).some((e: any) => e.getAttribute(`ContentType`) === drawingContentType))
      for (let e of Object.keys(r))
        e.startsWith(`xl/drawings/`) && e.endsWith(`.xml`) && ensureContentTypeEntry(o, a, e);
    return ((r[`[Content_Types].xml`] = j(serializeXmlWb(o))), A(r, { level: 6 }));
  } catch {
    return copyToUint8Array(e);
  }
}
export function emuToPx(e: any) {
  return e / emuPerPixel;
}
function pxToEmu(e: any) {
  return e * emuPerPixel;
}
export function pxToColumnWidthUnits(e: any) {
  return (Math.max(e, minColumnWidthPx) - 5) / 7;
}
export function columnWidthToPx(e: any, t: any) {
  return columnWidthToPixels(e, t);
}
export function rowHeightToPx(e: any) {
  return Math.max(Math.round(e * 1.33), minRowHeightPx);
}
export function snapGridSize(e: any, t = !0) {
  return Math.max(0, e) + (t ? devicePixelSnap() : 0);
}
export function pxFromGridSize(e: any, t = !0) {
  return Math.max(0, e - (t ? devicePixelSnap() : 0));
}
function pixelToGridIndex(e: any, t: any) {
  let n = Math.max(0, e),
    r: any = 0;
  for (; n > 0;) {
    let e = Math.max(1, t(r));
    if (n < e) break;
    ((n -= e), (r += 1));
  }
  return { index: r, offsetPx: n };
}
export function rectToDrawingAnchor(e: any, t: any, n: any) {
  let r: any = Math.max(0, e.left - n.contentOffsetLeft),
    i = Math.max(0, e.top - n.contentOffsetTop),
    a = Math.max(r + 1, e.left + e.width - n.contentOffsetLeft),
    o = Math.max(i + 1, e.top + e.height - n.contentOffsetTop);
  if (t.kind === `absolute`)
    return {
      kind: `absolute`,
      positionEmu: { x: pxToEmu(r), y: pxToEmu(i) },
      sizeEmu: { cx: pxToEmu(e.width), cy: pxToEmu(e.height) },
    };
  let s = pixelToGridIndex(r, n.getColumnWidthPx),
    c = pixelToGridIndex(i, n.getRowHeightPx);
  if (t.kind === `one-cell`)
    return {
      from: {
        col: s.index,
        colOffsetEmu: pxToEmu(s.offsetPx),
        row: c.index,
        rowOffsetEmu: pxToEmu(c.offsetPx),
      },
      kind: `one-cell`,
      sizeEmu: { cx: pxToEmu(e.width), cy: pxToEmu(e.height) },
    };
  let l = pixelToGridIndex(a, n.getColumnWidthPx),
    u = pixelToGridIndex(o, n.getRowHeightPx);
  return {
    from: {
      col: s.index,
      colOffsetEmu: pxToEmu(s.offsetPx),
      row: c.index,
      rowOffsetEmu: pxToEmu(c.offsetPx),
    },
    kind: `two-cell`,
    to: { col: l.index, colOffsetEmu: pxToEmu(l.offsetPx), row: u.index, rowOffsetEmu: pxToEmu(u.offsetPx) },
  };
}
export function resizeRectWithHandle(e: any, t: any, n: any, r: any, i = 16) {
  let a = e.left,
    o = e.top,
    s = e.width,
    c = e.height;
  return (
    t.includes(`w`) && ((a += n), (s -= n)),
    t.includes(`e`) && (s += n),
    t.includes(`n`) && ((o += r), (c -= r)),
    t.includes(`s`) && (c += r),
    s < i && (t.includes(`w`) && (a -= i - s), (s = i)),
    c < i && (t.includes(`n`) && (o -= i - c), (c = i)),
    { height: c, left: a, top: o, width: s }
  );
}
var sheetReferenceRegex = /'((?:[^']|'')+)'!|([A-Za-z_\u0080-\uFFFF][\w.\u0080-\uFFFF]*)!/g;
function collectFormulaSheetRefs(e: any) {
  let t: any = new Set();
  for (let n = 0; n < e.sheetCount; n += 1) {
    let r: any;
    try {
      r = e.getSheet(n);
    } catch {
      continue;
    }
    let i = r.formulaCells;
    if (Array.isArray(i))
      for (let e of i) {
        let n = e?.formula;
        if (!n) continue;
        sheetReferenceRegex.lastIndex = 0;
        let r: any;
        for (; (r = sheetReferenceRegex.exec(n)) !== null;) {
          let e = r[1] ?? r[2];
          e && t.add(e.replace(/''/g, `'`));
        }
      }
  }
  return t;
}
function hasUnresolvedSheetRefs(e: any) {
  let t: any;
  try {
    t = e.sheetNames;
  } catch {
    return !1;
  }
  let n = new Set(t),
    r: any = collectFormulaSheetRefs(e);
  for (let e of r) if (!n.has(e)) return !0;
  return !1;
}
function calculateWorkbookSafe(e: any, t: any = {}) {
  if (hasUnresolvedSheetRefs(e)) return { workbook: e, calculated: !1, skipReason: `unresolved-sheet-refs` };
  try {
    return (e.calculate(), { workbook: e, calculated: !0, skipReason: null });
  } catch (n) {
    if (
      (console.warn(
        `[react-xlsx] workbook.calculate() trapped; falling back to cached formula values`,
        n,
      ),
      t.reparse)
    )
      try {
        return { workbook: t.reparse(), calculated: !1, skipReason: `calculate-trapped` };
      } catch (e) {
        console.warn(`[react-xlsx] workbook reparse after calculate trap failed`, e);
      }
    return { workbook: e, calculated: !1, skipReason: `calculate-trapped` };
  }
}
export function ensureWorkbookCalculated(e: any) {
  try {
    return (e.calculate(), { calculated: !0, error: null });
  } catch (e) {
    return (
      console.warn(`[react-xlsx] workbook.calculate() trapped during recalculation`, e),
      { calculated: !1, error: e }
    );
  }
}
var cachedWasmModulePromise = null,
  wasmSourceExplicitlySet = !1,
  rawWasmSource: any,
  resolvedWasmSource: any;
function copyToStandaloneBuffer(e: any) {
  if (e instanceof ArrayBuffer) return e.slice(0);
  let t = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  return new Uint8Array(t).buffer;
}
function normalizeWasmSource(e: any) {
  if (typeof e == `string`) return e;
  if (typeof URL < `u` && e instanceof URL) return e.href;
  if (typeof Request < `u` && e instanceof Request) return e.url;
  if (e instanceof ArrayBuffer || ArrayBuffer.isView(e)) return copyToStandaloneBuffer(e);
  if (typeof WebAssembly < `u` && e instanceof WebAssembly.Module) return e;
}
export function setDukeSheetsWasmSource(e: any) {
  ((wasmSourceExplicitlySet = !0), (rawWasmSource = e), (resolvedWasmSource = normalizeWasmSource(e)));
}
export function isWasmSourceAvailable() {
  return !wasmSourceExplicitlySet || resolvedWasmSource !== void 0;
}
function getDukeSheetsWasmSource() {
  return resolvedWasmSource;
}
export function loadDukeSheetsWasmModule() {
  return (
    (cachedWasmModulePromise ||= o(
      () =>
        // 原 @ts-expect-error（TS2307）：A0-S2b 新增 duke_sheets_wasm-WTFY9Nh4.d.ts 垫片后已可解析，指令移除
        import(`../../modules/duke_sheets_wasm-WTFY9Nh4.js`).then(
          async (e) => (
            rawWasmSource === void 0 ? await e.default() : await e.default({ module_or_path: rawWasmSource }),
            e
          ),
        ),
      [],
      import.meta.url,
    )),
    cachedWasmModulePromise
  );
}
function createAbortError() {
  if (typeof DOMException < `u`) return new DOMException(`Aborted`, `AbortError`);
  let e = Error(`Aborted`);
  return ((e.name = `AbortError`), e);
}
export var XlsxWorkerClient = class {
  worker: any;
  nextRequestId = 1;
  pendingRequests = new Map();
  disposed = !1;
  constructor() {
    ((this.worker = new Worker(
      new URL(`` + new URL(`xlsx-worker-DJiDdvsD.js`, import.meta.url).href, `` + import.meta.url),
      { type: `module` },
    )),
      this.worker.addEventListener(`message`, this.handleMessage),
      this.worker.addEventListener(`error`, this.handleError));
  }
  dispose() {
    if (this.disposed) return;
    ((this.disposed = !0),
      this.worker.removeEventListener(`message`, this.handleMessage),
      this.worker.removeEventListener(`error`, this.handleError),
      this.worker.terminate());
    let e = createAbortError();
    for (let t of this.pendingRequests.values()) t.reject(e);
    this.pendingRequests.clear();
  }
  loadWorkbook(e: any, t = !1, n = !1) {
    let r: any = cloneArrayBuffer(e);
    return this.request(
      {
        id: 0,
        payload: { buffer: r, showHiddenSheets: n, skipXmlParsing: t, wasmSource: getDukeSheetsWasmSource() },
        type: `load`,
      },
      [r],
    );
  }
  getCellSnapshot(e: any, t: any, n: any) {
    return this.request({
      id: 0,
      payload: { col: n, row: t, workbookSheetIndex: e },
      type: `getCellSnapshot`,
    });
  }
  parseCharts(e: any, t = !1, n = !1) {
    let r: any = cloneArrayBuffer(e);
    return this.request(
      {
        id: 0,
        payload: { buffer: r, showHiddenSheets: n, skipXmlParsing: t, wasmSource: getDukeSheetsWasmSource() },
        type: `parseCharts`,
      },
      [r],
    );
  }
  getRowsBatch(e: any, t: any, n: any) {
    return this.request({
      id: 0,
      payload: { rowCount: n, startRow: t, workbookSheetIndex: e },
      type: `getRowsBatch`,
    });
  }
  request(e: any, t: any[] = []) {
    return new Promise((n, r) => {
      if (this.disposed) {
        r(createAbortError());
        return;
      }
      let i = this.nextRequestId;
      ((this.nextRequestId += 1),
        this.pendingRequests.set(i, { reject: r, resolve: n }),
        this.worker.postMessage({ ...e, id: i }, t));
    });
  }
  handleError = () => {
    for (let e of this.pendingRequests.values()) e.reject(Error(`Worker request failed.`));
    this.pendingRequests.clear();
  };
  handleMessage = (e: any) => {
    let t = e.data,
      n = this.pendingRequests.get(t.id);
    if (n) {
      if ((this.pendingRequests.delete(t.id), !t.success)) {
        n.reject(Error(t.error));
        return;
      }
      n.resolve(t.result);
    }
  };
};
function cloneArrayBuffer(e: any) {
  return e.slice(0);
}
var backslashCharCode = 92,
  slashCharCode = 47,
  zipEndOfCentralDirSignature = 101010256,
  zipCentralDirSignature = 33639248,
  zipLocalHeaderSignature = 67324752,
  zipEndOfCentralDirSize = 22,
  zipCentralDirEntrySize = 46,
  zipLocalHeaderSize = 30,
  zipMaxCommentLength = 65535,
  zipMaxEntryCount = 65535,
  zip64MagicValue = 4294967295;
function findEndOfCentralDir(e: any) {
  let t = Math.max(0, e.byteLength - zipEndOfCentralDirSize - zipMaxCommentLength);
  for (let n = e.byteLength - zipEndOfCentralDirSize; n >= t; --n) {
    if (e.getUint32(n, !0) !== zipEndOfCentralDirSignature) continue;
    let t = e.getUint16(n + 20, !0);
    if (n + zipEndOfCentralDirSize + t === e.byteLength) return n;
  }
  return null;
}
function readEndOfCentralDir(e: any) {
  if (e.byteLength < zipEndOfCentralDirSize) return null;
  let t = findEndOfCentralDir(e);
  if (t === null) return null;
  let n = e.getUint16(t + 4, !0),
    r = e.getUint16(t + 6, !0),
    i = e.getUint16(t + 8, !0),
    a = e.getUint16(t + 10, !0),
    o = e.getUint32(t + 12, !0),
    s = e.getUint32(t + 16, !0);
  if (n !== 0 || r !== 0 || i !== a || a === zipMaxEntryCount || o === zip64MagicValue || s === zip64MagicValue) return null;
  let c = s + o;
  return s > t || c > t || c > e.byteLength ? null : { endOffset: c, entryCount: a, offset: s };
}
function readCentralDirEntry(e: any, t: any, n: any) {
  if (n < 0 || n + zipCentralDirEntrySize > t || n + zipCentralDirEntrySize > e.byteLength || e.getUint32(n, !0) !== zipCentralDirSignature) return null;
  let r = e.getUint16(n + 28, !0),
    i = e.getUint16(n + 30, !0),
    a = e.getUint16(n + 32, !0),
    o = n + zipCentralDirEntrySize,
    s = o + r,
    c = s + i + a;
  return s > t || c > t
    ? null
    : {
        diskNumberStart: e.getUint16(n + 34, !0),
        localHeaderOffset: e.getUint32(n + 42, !0),
        nameEnd: s,
        nameStart: o,
        nextOffset: c,
      };
}
function entryNameHasBackslash(e: any, t: any) {
  for (let n = t.nameStart; n < t.nameEnd; n += 1) if (e[n] === backslashCharCode) return !0;
  return !1;
}
function hasBackslashEntries(e: any, t: any, n: any) {
  let r = n.offset;
  for (let i = 0; i < n.entryCount; i += 1) {
    let i = readCentralDirEntry(t, n.endOffset, r);
    if (!i) return null;
    if (entryNameHasBackslash(e, i)) return !0;
    r = i.nextOffset;
  }
  return !1;
}
function zipEntryName(e: any, t: any) {
  let n = ``;
  for (let r = t.nameStart; r < t.nameEnd; r += 1) {
    let t = e[r] === backslashCharCode ? slashCharCode : e[r];
    n += String.fromCharCode(t);
  }
  return n;
}
function validateZipStructure(e: any, t: any, n: any) {
  let r = new Set(),
    i = new Set(),
    a = n.offset;
  for (let o = 0; o < n.entryCount; o += 1) {
    let o = readCentralDirEntry(t, n.endOffset, a);
    if (
      !o ||
      o.diskNumberStart !== 0 ||
      o.localHeaderOffset === zip64MagicValue ||
      o.localHeaderOffset + zipLocalHeaderSize > n.offset ||
      i.has(o.localHeaderOffset)
    )
      return !1;
    i.add(o.localHeaderOffset);
    let s = zipEntryName(e, o);
    if (r.has(s)) return !1;
    if ((r.add(s), !entryNameHasBackslash(e, o))) {
      a = o.nextOffset;
      continue;
    }
    if (t.getUint32(o.localHeaderOffset, !0) !== zipLocalHeaderSignature) return !1;
    let c = t.getUint16(o.localHeaderOffset + 26, !0),
      l = o.localHeaderOffset + zipLocalHeaderSize,
      u = l + c;
    if (c !== o.nameEnd - o.nameStart || u > n.offset) return !1;
    for (let t = 0; t < c; t += 1) {
      let n = o.nameStart + t,
        r = l + t;
      if (e[n] !== e[r]) return !1;
    }
    a = o.nextOffset;
  }
  return !0;
}
function sanitizeBackslashNames(e: any, t: any, n: any) {
  let r = n.offset;
  for (let i = 0; i < n.entryCount; i += 1) {
    let i = readCentralDirEntry(t, n.endOffset, r);
    if (!i) return;
    if (entryNameHasBackslash(e, i)) {
      let t = i.localHeaderOffset + zipLocalHeaderSize;
      for (let n = 0; n < i.nameEnd - i.nameStart; n += 1) {
        let r = i.nameStart + n;
        e[r] === backslashCharCode && ((e[r] = slashCharCode), (e[t + n] = slashCharCode));
      }
    }
    r = i.nextOffset;
  }
}
function sanitizeZipBytes(e: any) {
  let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
    n = readEndOfCentralDir(t);
  if (!n || hasBackslashEntries(e, t, n) !== !0 || !validateZipStructure(e, t, n)) return e;
  let r = new Uint8Array(e.byteLength);
  return (r.set(e), sanitizeBackslashNames(r, new DataView(r.buffer, r.byteOffset, r.byteLength), n), r);
}
export function normalizeWorkbookBytes(e: any) {
  let t = new Uint8Array(e),
    n = sanitizeZipBytes(t);
  if (n === t) return e;
  if (n.byteOffset === 0 && n.byteLength === n.buffer.byteLength && n.buffer instanceof ArrayBuffer)
    return n.buffer;
  let r = new ArrayBuffer(n.byteLength);
  return (new Uint8Array(r).set(n), r);
}
export var saveDebounceMs = 1e3,
  defaultRowHeight = 24,
  defaultColumnWidth = 80,
  xlsxMimeType = `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
  csvMimeType = `text/csv;charset=utf-8`,
  minSheetRowHeightPx = 16,
  headerRowHeightPx = 24,
  rowHeaderWidthPx = 40,
  undoEntryLimit = 100,
  rangeClipboardMimeType = `application/x-react-xlsx-range+json`,
  deferLoadingDefault = 0,
  maxFileSizeDefault = 25 * 1024 * 1024,
  maxWorksheetXmlBytes = 200 * 1024 * 1024,
  maxSharedStringsBytes = 50 * 1024 * 1024,
  maxTotalWorksheetBytes = 256 * 1024 * 1024,
  defaultZoomPercent = 100,
  minZoomScale = 10,
  maxZoomScale = 400,
  zoomStepPercent = 10,
  defaultTabId = `__default__`;
function normalizeVisibility(e: any) {
  return e === `hidden` || e === `veryHidden` ? e : `visible`;
}
export function clampZoomScale(e: any) {
  return Number.isFinite(e) ? Math.min(maxZoomScale, Math.max(minZoomScale, Math.round(e))) : defaultZoomPercent;
}
export function defaultZoomForSheet(e: any, t: any) {
  return e?.kind === `sheet` ? clampZoomScale(t?.zoomScale ?? defaultZoomPercent) : defaultZoomPercent;
}
function resolveZoomScale(e: any, t: any) {
  return clampZoomScale(
    [
      typeof t?.zoomScale == `number` ? t.zoomScale : void 0,
      typeof e.zoomScale == `number` ? e.zoomScale : void 0,
    ].find((e) => typeof e == `number` && Number.isFinite(e) && e > 0) ?? defaultZoomPercent,
  );
}
export function stepZoomScale(e: any, t: any) {
  return t > 0
    ? Math.min(maxZoomScale, e % zoomStepPercent === 0 ? e + zoomStepPercent : Math.ceil(e / zoomStepPercent) * zoomStepPercent)
    : Math.max(minZoomScale, e % zoomStepPercent === 0 ? e - zoomStepPercent : Math.floor(e / zoomStepPercent) * zoomStepPercent);
}
function formatByteSize(e: any) {
  if (!Number.isFinite(e) || e <= 0) return `0 B`;
  let t = [`B`, `KB`, `MB`, `GB`],
    n = e,
    r = 0;
  for (; n >= 1024 && r < t.length - 1;) ((n /= 1024), (r += 1));
  return `${n >= 10 || r === 0 ? n.toFixed(0) : n.toFixed(1)} ${t[r]}`;
}
function findEocdrOffset(e: any) {
  if (e.byteLength < 22) return -1;
  let t = Math.max(0, e.byteLength - 65557);
  for (let n = e.byteLength - 22; n >= t; --n)
    if (e[n] === 80 && e[n + 1] === 75 && e[n + 2] === 5 && e[n + 3] === 6) return n;
  return -1;
}
function readZipCentralDirectory(e: any) {
  let t = new Uint8Array(e),
    n = findEocdrOffset(t);
  if (n < 0) return null;
  let r = new DataView(e, t.byteOffset, t.byteLength),
    i = r.getUint32(n + 12, !0),
    a = r.getUint32(n + 16, !0),
    o = new TextDecoder(),
    s = [],
    c = a,
    l = a + i;
  for (; c + 46 <= l && c + 46 <= t.byteLength;) {
    if (r.getUint32(c, !0) !== 33639248) return null;
    let e = r.getUint32(c + 20, !0),
      n = r.getUint32(c + 24, !0),
      i = r.getUint16(c + 28, !0),
      a = r.getUint16(c + 30, !0),
      l = r.getUint16(c + 32, !0),
      u = c + 46,
      d = u + i;
    if (d > t.byteLength) return null;
    (s.push({ compressedSize: e, name: o.decode(t.subarray(u, d)), uncompressedSize: n }),
      (c = d + a + l));
  }
  return s;
}
export function checkSheetLimits(e: any) {
  let t = readZipCentralDirectory(e);
  if (!t) return null;
  let n = 0,
    r = 0,
    i = 0;
  for (let e of t) {
    if (/^xl\/worksheets\/[^/]+\.xml$/i.test(e.name)) {
      ((n = Math.max(n, e.uncompressedSize)), (r += e.uncompressedSize));
      continue;
    }
    e.name === `xl/sharedStrings.xml` && (i = e.uncompressedSize);
  }
  let a = n > maxWorksheetXmlBytes || i > maxSharedStringsBytes || r + i > maxTotalWorksheetBytes;
  return {
    largestWorksheetXmlBytes: n,
    sharedStringsBytes: i,
    tooLarge: a,
    totalWorksheetXmlBytes: r,
  };
}
export function sheetLimitError(e: any) {
  return Error(
    `XLSX is too large to preview interactively. Largest worksheet XML: ${formatByteSize(e.largestWorksheetXmlBytes)}; shared strings: ${formatByteSize(e.sharedStringsBytes)}.`,
  );
}
export var XlsxFileSizeLimitExceededError = class extends Error {
  fileSizeBytes;
  maxFileSizeBytes;
  constructor(e: any, t: any) {
    (super(`XLSX file size ${formatByteSize(e)} exceeds the configured limit of ${formatByteSize(t)}.`),
      (this.name = `XlsxFileSizeLimitExceededError`),
      (this.fileSizeBytes = e),
      (this.maxFileSizeBytes = t));
  }
};
export function deriveDisplayFileName(e: any, t: any) {
  if (typeof t == `string` && t.trim().length > 0) return t.trim();
  if (!e) return `Workbook.xlsx`;
  let n = (e.split(`?`)[0] ?? ``).split(`/`),
    r = n[n.length - 1] ?? ``;
  if (!r) return `Workbook.xlsx`;
  try {
    return decodeURIComponent(r);
  } catch {
    return r;
  }
}
function expandUsedRange(e: any, t: any) {
  let [n, r, i, a] = e,
    o = t?.maxContentRow ?? -1,
    s = t?.maxContentCol ?? -1,
    c = t?.maxVerticalMergeEndRow ?? -1,
    l = t?.maxHorizontalMergeEndCol ?? -1,
    u = Math.max(o, c),
    d = Math.max(s, l);
  return u < 0 && d < 0
    ? e
    : [
        t?.minContentRow !== void 0 && t.minContentRow >= 0 ? Math.min(n, t.minContentRow) : n,
        t?.minContentCol !== void 0 && t.minContentCol >= 0 ? Math.min(r, t.minContentCol) : r,
        u >= 0 ? (o >= 0 ? Math.min(i, u) : Math.max(i, u)) : i,
        d >= 0 ? (s >= 0 ? Math.min(a, d) : Math.max(a, d)) : a,
      ];
}
export function buildSheetStates(e: any, t: any, n: any, r: any, i: any, a: any, o = !1) {
  let s = [];
  for (let c = 0; c < e.sheetCount; c += 1) {
    let l = e.getSheet(c),
      u = t?.[c] ?? null,
      d = mergeSpanSummary(l),
      f = { ...u, ...d },
      p = defaultColumnWidthPx(l, u?.columnWidthCharacterWidthPx, u?.defaultColWidthPx ?? defaultColumnWidth),
      m = defaultRowHeightPx(l, u?.defaultRowHeightPx ?? defaultRowHeight),
      h = normalizeVisibility(l.visibility);
    if (!o && h !== `visible`) continue;
    let g = (e: any) => {
        let t: any = l.getColumnWidth(e);
        return t == null
          ? (u?.colWidthOverridesPx?.[e] ?? p)
          : columnWidthToPx(t, u?.columnWidthCharacterWidthPx);
      },
      _ = (e: any) => {
        let t: any = l.getRowHeight(e);
        return t == null ? (u?.rowHeightOverridesPx?.[e] ?? m) : Math.max(Math.round(t * 1.33), minSheetRowHeightPx);
      },
      v = l.usedRange();
    if (!v) {
      s.push({
        cachedFormulaValues: u?.cachedFormulaValues ?? {},
        columnWidthCharacterWidthPx: u?.columnWidthCharacterWidthPx,
        colWidthOverridesPx: u?.colWidthOverridesPx ?? {},
        colStyleIds: u?.colStyleIds ?? {},
        conditionalFormatRules: u?.conditionalFormatRules ?? [],
        dataValidations: normalizeDataValidations(l),
        defaultColWidthPx: p,
        defaultRowHeightPx: m,
        freezePanes: normalizeFreezePanes(l),
        hasHorizontalMerges: d.hasHorizontalMerges,
        hasVerticalMerges: d.hasVerticalMerges,
        maxHorizontalMergeEndCol: d.maxHorizontalMergeEndCol,
        maxVerticalMergeEndRow: d.maxVerticalMergeEndRow,
        hiddenCols: [],
        hiddenRows: [],
        minUsedCol: -1,
        minUsedRow: -1,
        maxUsedCol: -1,
        maxUsedRow: -1,
        name: l.name,
        visibility: h,
        namedCellStyleByName: i ?? {},
        rowCount: 0,
        colCount: 0,
        rowHeightOverridesPx: u?.rowHeightOverridesPx ?? {},
        rowStyleIds: u?.rowStyleIds ?? {},
        styleById: r ?? {},
        sparklines: u?.sparklines ?? [],
        tableStyleByName: a ?? {},
        visibleRows: [],
        visibleCols: [],
        colWidths: [],
        rowHeights: [],
        showGridLines: u?.showGridLines ?? !0,
        themePalette: n ?? { colorsByIndex: {} },
        workbookSheetIndex: c,
        zoomScale: resolveZoomScale(l, u),
      });
      continue;
    }
    let [y, b, x, S] = expandUsedRange(v, f),
      C: any = null,
      w: any = null,
      T: any = null,
      E: any = null,
      D = () => {
        if (C) return C;
        let e = [];
        for (let t: any = 0; t <= x; t += 1) l.isRowHidden(t) || e.push(t);
        return ((C = e), e);
      },
      O = () => {
        if (w) return w;
        let e = [];
        for (let t: any = 0; t <= S; t += 1) l.isColumnHidden(t) || e.push(t);
        return ((w = e), e);
      },
      k = () => T || ((T = D().map(_)), T),
      A = () => E || ((E = O().map(g)), E),
      j = {
        cachedFormulaValues: u?.cachedFormulaValues ?? {},
        columnWidthCharacterWidthPx: u?.columnWidthCharacterWidthPx,
        colWidthOverridesPx: u?.colWidthOverridesPx ?? {},
        colStyleIds: u?.colStyleIds ?? {},
        conditionalFormatRules: u?.conditionalFormatRules ?? [],
        dataValidations: normalizeDataValidations(l),
        defaultColWidthPx: p,
        defaultRowHeightPx: m,
        freezePanes: normalizeFreezePanes(l),
        hasHorizontalMerges: d.hasHorizontalMerges,
        hasVerticalMerges: d.hasVerticalMerges,
        maxHorizontalMergeEndCol: d.maxHorizontalMergeEndCol,
        maxVerticalMergeEndRow: d.maxVerticalMergeEndRow,
        hiddenCols: hiddenColumnIndices(l, S),
        hiddenRows: hiddenRowIndices(l, x),
        minUsedCol: b,
        minUsedRow: y,
        maxUsedCol: S,
        maxUsedRow: x,
        name: l.name,
        visibility: h,
        namedCellStyleByName: i ?? {},
        rowHeightOverridesPx: u?.rowHeightOverridesPx ?? {},
        rowStyleIds: u?.rowStyleIds ?? {},
        showGridLines: u?.showGridLines ?? !0,
        styleById: r ?? {},
        sparklines: u?.sparklines ?? [],
        tableStyleByName: a ?? {},
        themePalette: n ?? { colorsByIndex: {} },
        workbookSheetIndex: c,
        zoomScale: resolveZoomScale(l, u),
        get rowCount() {
          return D().length;
        },
        get colCount() {
          return O().length;
        },
        get visibleRows() {
          return D();
        },
        get visibleCols() {
          return O();
        },
        get colWidths() {
          return A();
        },
        get rowHeights() {
          return k();
        },
      };
    s.push(j);
  }
  return s;
}
export function collectSheetOrigins(e: any) {
  return new Map(e.map((e: any, t: any) => [e.workbookSheetIndex, t]));
}
export function defaultCellStyleAt(e: any, t: any, n: any) {
  if (!e) return null;
  let r = e.rowStyleIds[t];
  if (r !== void 0) return e.styleById[r] ?? null;
  let i = e.colStyleIds[n];
  return i === void 0 ? null : (e.styleById[i] ?? null);
}
function columnIndexToLetters(e: any) {
  let t: any = ``,
    n = e;
  for (; n >= 0;) ((t = String.fromCharCode(65 + (n % 26)) + t), (n = Math.floor(n / 26) - 1));
  return t;
}
export function cellAddress(e: any) {
  return `${columnIndexToLetters(e.col)}${e.row + 1}`;
}
function parseCellAddressString(e: any) {
  let t: any = /^([A-Z]+)(\d+)$/i.exec(e.trim());
  if (!t) return null;
  let [, n, r] = t,
    i = 0;
  for (let e of n.toUpperCase()) i = i * 26 + (e.charCodeAt(0) - 64);
  return { col: i - 1, row: Number(r) - 1 };
}
function parseRangeString(e: any) {
  let [t, n = t] = e.split(`:`),
    r = parseCellAddressString(t ?? ``),
    i = parseCellAddressString(n ?? ``);
  return !r || !i ? null : normalizeRange({ start: r, end: i });
}
export function resolveInputRange(e: any, t: any, n: any, r = !1) {
  let i = n.trim().replace(/^=/, ``);
  if (!i) return null;
  let a = t,
    o = i,
    s = i.lastIndexOf(`!`);
  if (s >= 0) {
    let t: any = i.slice(0, s).trim();
    ((o = i.slice(s + 1).trim()),
      t.startsWith(`'`) && t.endsWith(`'`) && (t = t.slice(1, -1).replace(/''/g, `'`)));
    let n = e.sheetIndex(t);
    if (n === void 0) return null;
    a = n;
  } else if (!r) {
    let n = e.getNamedRange(i);
    if (n) return resolveInputRange(e, t, n, !0);
  }
  let c = parseRangeString(o.replace(/\$/g, ``));
  if (!c || a < 0 || a >= e.sheetCount) return null;
  try {
    return { range: c, workbookSheetIndex: a, worksheet: e.getSheet(a) };
  } catch {
    return null;
  }
}
function hexToRgbArray(e: any) {
  let t: any = e?.replace(/^#/, ``);
  return t && /^[0-9a-f]{6}$/i.test(t)
    ? [0, 2, 4].map((e) => Number.parseInt(t.slice(e, e + 2), 16))
    : null;
}
function normalizeColorSpec(e: any) {
  if (!e) return;
  let t: any = e.hex?.replace(/^#/, ``);
  switch (
    e.colorType ??
    // 末支原 `void 0`：TS 5.9 判其型变（TS2881），改 `undefined`（运行时等价，发射语义不变）
    (t?.length === 8 ? `argb` : t?.length === 6 ? `rgb` : undefined) ??
    (e.r !== void 0 && e.g !== void 0 && e.b !== void 0
      ? e.a === void 0
        ? `rgb`
        : `argb`
      : undefined) ??
    (e.themeIndex === void 0 ? (e.paletteIndex === void 0 ? void 0 : `indexed`) : `theme`)
  ) {
    case `auto`:
      return { colorType: `auto` };
    case `rgb`: {
      let t: any = e.r !== void 0 && e.g !== void 0 && e.b !== void 0 ? [e.r, e.g, e.b] : hexToRgbArray(e.hex);
      return t ? { b: t[2], colorType: `rgb`, g: t[1], r: t[0] } : void 0;
    }
    case `argb`: {
      let t: any = e.hex?.replace(/^#/, ``),
        n =
          t && /^[0-9a-f]{8}$/i.test(t)
            ? [0, 2, 4, 6].map((e) => Number.parseInt(t.slice(e, e + 2), 16))
            : e.a !== void 0 && e.r !== void 0 && e.g !== void 0 && e.b !== void 0
              ? [e.a, e.r, e.g, e.b]
              : null;
      return n ? { a: n[0], b: n[3], colorType: `argb`, g: n[2], r: n[1] } : void 0;
    }
    case `theme`:
      return e.themeIndex === void 0
        ? void 0
        : { colorType: `theme`, index: e.themeIndex, tint: e.tint ?? 0 };
    case `indexed`:
      return e.paletteIndex === void 0 ? void 0 : { colorType: `indexed`, index: e.paletteIndex };
  }
}
function normalizeFontSpec(e: any) {
  return {
    bold: e.bold,
    charset: e.charset,
    color: normalizeColorSpec(e.color),
    family: e.family,
    italic: e.italic,
    name: e.name,
    scheme: e.scheme,
    size: e.size,
    strikethrough: e.strikethrough,
    underline: e.underline,
    verticalAlign: e.verticalAlign,
  };
}
function normalizeCaptionSpec(e: any) {
  return typeof e == `string`
    ? { runs: [{ text: e }] }
    : {
        horizontalAlignment: e.horizontalAlignment,
        runs: e.runs.map((e: any) => ({ font: e.font ? normalizeFontSpec(e.font) : void 0, text: e.text })),
        verticalAlignment: e.verticalAlignment,
      };
}
export function formControlKindFromInput(e: any) {
  switch (e.kind) {
    case `button`:
    case `label`:
      return { caption: normalizeCaptionSpec(e.caption), kind: e.kind };
    case `checkbox`:
      return { ...e, caption: normalizeCaptionSpec(e.caption) };
    case `optionButton`:
      return { ...e, caption: normalizeCaptionSpec(e.caption) };
    case `groupBox`:
      return { ...e, caption: normalizeCaptionSpec(e.caption) };
    case `editbox`:
      return {
        caption: normalizeCaptionSpec(e.caption),
        kind: `unknown`,
        legacyObjectType: e.legacyObjectType,
        objectType: `EditBox`,
        rawObj: e.rawObj,
        rawProperties: e.rawProperties,
      };
    case `unknown`:
      return {
        caption: e.caption ? normalizeCaptionSpec(e.caption) : void 0,
        kind: `unknown`,
        legacyObjectType: e.legacyObjectType,
        objectType: e.objectType,
        rawObj: e.rawObj,
        rawProperties: e.rawProperties,
      };
    default:
      return { ...e };
  }
}
export function formControlKindToSpec(e: any) {
  return e.kind === `optionButton`
    ? { ...e, state: e.state === `checked` ? `checked` : `unchecked` }
    : e.kind === `unknown`
      ? {
          caption: e.caption,
          kind: `unknown`,
          legacyObjectType: e.legacyObjectType,
          objectType: e.objectType,
          rawObj: e.rawObj,
          rawProperties: e.rawProperties,
        }
      : { ...e };
}
export function normalizeDrawing(e: any) {
  return {
    altText: e.altText,
    ...(e.anchor ? { anchor: e.anchor } : { transform: e.transform }),
    formControl: {
      kind: formControlKindToSpec(e.formControl.kind),
      macroName: e.formControl.macroName,
      rawClientData: e.formControl.rawClientData,
    },
    hidden: e.hidden,
    kind: `formControl`,
    locked: e.locked,
    name: e.name,
    printable: e.printable,
    title: e.title,
  };
}
export function formControlDrawingSpec(e: any) {
  return {
    altText: e.altText,
    anchor: normalizeDrawingAnchor(e.anchor, e.editAs),
    formControl: { kind: formControlKindFromInput(e.kind), macroName: e.macroName, rawClientData: e.rawClientData },
    hidden: e.hidden,
    kind: `formControl`,
    locked: e.locked,
    name: e.name,
    printable: e.printable,
    title: e.title,
  };
}
export function syncGroupBoxes(e: any) {
  let t: any = e.formControls.flatMap((e: any) =>
    e.formControl.kind.kind === `optionButton` && e.formControl.kind.state === `checked`
      ? [e.drawingPath]
      : [],
  );
  for (let n of t) {
    let t: any = e.formControls.find(
      (e: any) => e.drawingPath.length === n.length && e.drawingPath.every((e: any, t: any) => e === n[t]),
    );
    t?.formControl.kind.kind === `optionButton` &&
      t.formControl.kind.state === `checked` &&
      e.setFormControlCheckState(t.drawingPath, `checked`);
  }
}
export function formControlKindChanged(e: any, t: any) {
  if (e.kind !== t.kind || (`cellLink` in e && `cellLink` in t && e.cellLink !== t.cellLink))
    return !0;
  switch (e.kind) {
    case `checkbox`:
    case `optionButton`:
      return t.kind === e.kind && e.state !== t.state;
    case `dropdown`:
      return t.kind === `dropdown` && e.selected !== t.selected;
    case `listBox`:
      return (
        t.kind === `listBox` &&
        (e.selection !== t.selection ||
          e.selected.length !== t.selected.length ||
          e.selected.some((e: any, n: any) => e !== t.selected[n]))
      );
    case `scrollbar`:
    case `spinner`:
      return t.kind === e.kind && e.value !== t.value;
    default:
      return !1;
  }
}
function normalizeFreezePanes(e: any) {
  let t: any = e.freezePanes,
    n = typeof t?.row == `number` && t.row >= 0 ? t.row : null,
    r = typeof t?.col == `number` && t.col >= 0 ? t.col : null;
  return n === null && r === null ? null : { col: r ?? 0, row: n ?? 0 };
}
function normalizeDataValidations(e: any) {
  return (Array.isArray(e.dataValidations) ? e.dataValidations : []).flatMap((e: any) => {
    if (!e || typeof e != `object`) return [];
    let t: any = e,
      n = Array.isArray(t.ranges)
        ? t.ranges.flatMap((e: any) => {
            if (typeof e != `string`) return [];
            let t: any = parseRangeString(e);
            return t ? [t] : [];
          })
        : [],
      r = typeof t.validationType == `string` ? t.validationType : null;
    return !r || n.length === 0
      ? []
      : [
          {
            allowBlank: typeof t.allowBlank == `boolean` ? t.allowBlank : void 0,
            errorMessage: typeof t.errorMessage == `string` ? t.errorMessage : void 0,
            errorStyle: typeof t.errorStyle == `string` ? t.errorStyle : void 0,
            inputMessage: typeof t.inputMessage == `string` ? t.inputMessage : void 0,
            listSource: typeof t.listSource == `string` ? t.listSource : void 0,
            ranges: n,
            showDropdown: typeof t.showDropdown == `boolean` ? t.showDropdown : void 0,
            showErrorAlert: typeof t.showErrorAlert == `boolean` ? t.showErrorAlert : void 0,
            showInputMessage: typeof t.showInputMessage == `boolean` ? t.showInputMessage : void 0,
            validationType: r,
          },
        ];
  });
}
export function normalizeRange(e: any) {
  return {
    start: { row: Math.min(e.start.row, e.end.row), col: Math.min(e.start.col, e.end.col) },
    end: { row: Math.max(e.start.row, e.end.row), col: Math.max(e.start.col, e.end.col) },
  };
}
export function rangeToRef(e: any) {
  let t: any = normalizeRange(e),
    n = cellAddress(t.start),
    r = cellAddress(t.end);
  return n === r ? n : `${n}:${r}`;
}
export function rangeContainsCell(e: any, t: any) {
  let n = normalizeRange(e);
  return t.row >= n.start.row && t.row <= n.end.row && t.col >= n.start.col && t.col <= n.end.col;
}
export function worksheetTables(e: any) {
  return (e?.tables ?? []).flatMap((e: any, t: any) => {
    let n = Array.isArray(e.columns) ? e.columns : [],
      r = typeof e.name == `string` ? e.name : `Table${t + 1}`,
      i =
        typeof e.displayName == `string`
          ? e.displayName
          : typeof e.name == `string`
            ? e.name
            : `Table ${t + 1}`,
      a = typeof e.reference == `string` ? e.reference : ``,
      o = parseRangeString(a);
    return o
      ? [
          {
            columns: n.map((e: any, t: any) => ({
              id: typeof e.id == `number` ? (e.id ?? t + 1) : t + 1,
              index: t,
              name: typeof e.name == `string` ? (e.name ?? `Column ${t + 1}`) : `Column ${t + 1}`,
            })),
            displayName: i,
            end: o.end,
            headerRowCount: nonNegativeIntParam(e.headerRowCount, 1),
            headerRowCellStyle:
              typeof e.headerRowCellStyle == `string` ? e.headerRowCellStyle : void 0,
            name: r,
            reference: a,
            start: o.start,
            styleInfo: e.styleInfo,
            totalsRowCount: nonNegativeIntParam(e.totalsRowCount, 0),
            totalsRowShown: booleanParam(e.totalsRowShown),
          },
        ]
      : [];
  });
}
function nonNegativeIntParam(e: any, t: any) {
  if (typeof e == `number` && Number.isFinite(e) && e >= 0) return e;
  if (typeof e == `string`) {
    let t: any = Number.parseInt(e, 10);
    if (Number.isFinite(t) && t >= 0) return t;
  }
  return t;
}
function booleanParam(e: any) {
  if (typeof e == `boolean`) return e;
  if (typeof e == `number`) return e !== 0;
  if (typeof e == `string`) {
    let t: any = e.trim().toLowerCase();
    if (t === `0` || t === `false` || t === ``) return !1;
    if (t === `1` || t === `true`) return !0;
  }
  return !1;
}
export function fileBaseName(e: any) {
  let t: any = e.trim(),
    n = t.lastIndexOf(`.`);
  return n > 0 ? t.slice(0, n) : t;
}
export function pxToRowHeightUnits(e: any) {
  return Math.max(e, minSheetRowHeightPx) / 1.33;
}
function colorHexOnly(e: any) {
  if (!e?.hex) return null;
  let t: any = String(e.hex);
  return `#${t.length === 8 ? t.slice(2) : t}`;
}
export function borderCss(e: any) {
  let t: any = colorHexOnly(e.color) ?? `#000000`;
  return `${({ dashed: `1px`, dotted: `1px`, double: `3px`, hair: `1px`, medium: `2px`, thick: `3px`, thin: `1px` } as any)[e.style] ?? `1px`} ${({ dashDot: `dashed`, dashDotDot: `dotted`, dashed: `dashed`, dotted: `dotted`, double: `double`, hair: `solid`, medium: `solid`, mediumDashDot: `dashed`, mediumDashDotDot: `dotted`, mediumDashed: `dashed`, slantDashDot: `dashed`, thick: `solid`, thin: `solid` } as any)[e.style] ?? `solid`} ${t}`;
}
export function normalizeDisplayValue(e: any) {
  return e
    .replace(/&quot;/g, `"`)
    .replace(/&#34;/g, `"`)
    .replace(/&apos;/g, `'`)
    .replace(/&#39;/g, `'`)
    .replace(/&lt;/g, `<`)
    .replace(/&gt;/g, `>`)
    .replace(/&amp;/g, `&`);
}
export function copyBytes(e: any) {
  let t: any = new Uint8Array(e.byteLength);
  return (t.set(e), t);
}
export function workbookSavePayload(e: any) {
  try {
    let t: any = M(e),
      n = t[`xl/styles.xml`];
    return (
      n &&
        (t[`xl/styles.xml`] = j(
          N(n)
            .replace(/&amp;quot;/g, `&quot;`)
            .replace(/&amp;apos;/g, `&apos;`),
        )),
      A(t, { level: 6 })
    );
  } catch {
    return copyBytes(e);
  }
}
export function pushUndoEntry(e: any, t: any) {
  (e.push(t), e.length > undoEntryLimit && e.shift());
}
export function cloneCellValue(e: any) {
  return e ?? ``;
}
export function cloneCellStyle(e: any) {
  if (!e || typeof e != `object`) return e;
  if (typeof structuredClone == `function`)
    try {
      return structuredClone(e);
    } catch {}
  try {
    return JSON.parse(JSON.stringify(e));
  } catch {
    return e;
  }
}
export function parseCellValueInput(e: any) {
  let t: any = e.trim();
  if (!t) return ``;
  if (t.startsWith(`'`)) return t.slice(1);
  if (/^(true|false)$/i.test(t)) return t.toLowerCase() === `true`;
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(t)) {
    let e = Number(t);
    if (Number.isFinite(e)) return e;
  }
  return e;
}
export function applyCellMutation(e: any, t: any, n: any) {
  (n.formula ? e.setFormula(cellAddress(t), n.formula) : e.setCell(cellAddress(t), cloneCellValue(n.value)),
    n.style && typeof n.style == `object` && e.setCellStyleAt(t.row, t.col, n.style));
}
export function escapeHtml(e: any) {
  return e
    .replace(/&/g, `&amp;`)
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`)
    .replace(/"/g, `&quot;`)
    .replace(/'/g, `&#39;`);
}
export function parseClipboardText(e: any) {
  let t: any = e
    .replace(
      /\r\n/g,
      `
`,
    )
    .replace(
      /\r/g,
      `
`,
    ).split(`
`);
  return (t.length > 1 && t[t.length - 1] === `` && t.pop(), t.map((e: any) => e.split(`	`)));
}
function createAbortErrorLocal() {
  if (typeof DOMException < `u`) return new DOMException(`Aborted`, `AbortError`);
  let e = Error(`Aborted`);
  return ((e.name = `AbortError`), e);
}
export function isAbortError(e: any) {
  return e instanceof Error && e.name === `AbortError`;
}
export async function resolveWorkbookSource({ file: e, src: t }: any, n: any) {
  let r;
  if (n?.aborted) throw createAbortErrorLocal();
  if (e) r = e;
  else if (t) {
    let e;
    try {
      e = await fetch(t, { signal: n });
    } catch (e) {
      throw isAbortError(e)
        ? e
        : Error(
            `Failed to fetch workbook. The remote URL may be blocked by CORS, unavailable, or not directly downloadable from the browser.`,
          );
    }
    if (!e.ok) throw Error(`Failed to fetch workbook (status ${e.status})`);
    r = await e.arrayBuffer();
  } else throw Error("Either `file` or `src` must be provided.");
  return r;
}
export async function parseWorkbook(e: any) {
  let t: any = await loadDukeSheetsWasmModule(),
    n = t.Workbook.fromBytes(new Uint8Array(e)),
    r = 0;
  for (let e = 0; e < n.sheetCount; e += 1) r += n.getSheet(e).formulaCount;
  let i = r <= saveDebounceMs;
  if (!i) return { shouldAutoCalculate: i, workbook: n };
  let a = calculateWorkbookSafe(n, { reparse: () => t.Workbook.fromBytes(new Uint8Array(e)) });
  return { shouldAutoCalculate: a.calculated, workbook: a.workbook };
}
export function scheduleIdleWork(e: any) {
  if (typeof window > `u`) {
    let t: any = setTimeout(e, 0);
    return () => clearTimeout(t);
  }
  let t: any = window;
  if (typeof t.requestIdleCallback == `function`) {
    let n = t.requestIdleCallback(
      () => {
        e();
      },
      { timeout: 120 },
    );
    return () => {
      t.cancelIdleCallback?.(n);
    };
  }
  let n = window.setTimeout(e, 0);
  return () => window.clearTimeout(n);
}
function mimeTypeFromImageUrl(e: any) {
  if (e.startsWith(`data:`)) {
    let t: any = e.indexOf(`;`);
    if (t > 5) return e.slice(5, t);
  }
  let t: any = e.split(`?`)[0]?.toLowerCase() ?? ``;
  return t.endsWith(`.gif`)
    ? `image/gif`
    : t.endsWith(`.jpg`) || t.endsWith(`.jpeg`)
      ? `image/jpeg`
      : t.endsWith(`.svg`)
        ? `image/svg+xml`
        : t.endsWith(`.webp`)
          ? `image/webp`
          : `image/png`;
}
function imageFormatMimeType(e: any) {
  let t: any = e.format;
  if (t === `gif`) return `image/gif`;
  if (t === `jpeg`) return `image/jpeg`;
  if (t === `svg`) return `image/svg+xml`;
  if (t === `bmp`) return `image/bmp`;
  if (t === `tiff`) return `image/tiff`;
  if (t === `emf`) return `image/emf`;
  if (t === `wmf`) return `image/wmf`;
  if (t === `png`) return `image/png`;
  let n = typeof e.mediaPath == `string` ? e.mediaPath : ``;
  return n ? mimeTypeFromImageUrl(n) : `image/png`;
}
function bytesToBlobUrl(e: any, t: any, n: any) {
  let r =
    e instanceof Uint8Array
      ? e
      : Array.isArray(e)
        ? Uint8Array.from(e.filter((e) => typeof e == `number`))
        : null;
  if (!r || r.byteLength === 0) return null;
  let i = new Uint8Array(r.byteLength);
  i.set(r);
  let a = URL.createObjectURL(new Blob([i.buffer], { type: t }));
  return (n.push(a), a);
}
function worksheetImageModel(e: any, t: any, n: any, r: any) {
  let i = !!n.image.svgMediaPath,
    a = imageFormatMimeType(n.image),
    o;
  try {
    let t: any = n.image.format === `svg` || i ? e.drawingSvgData(n.drawingPath) : void 0;
    t ? ((o = t), (a = `image/svg+xml`)) : (o = e.drawingImageData(n.drawingPath));
  } catch {
    return null;
  }
  let s = bytesToBlobUrl(o, a, r);
  if (!s) return null;
  let c = (n.drawingPath[0] ?? 0) + 1;
  return {
    anchor: anchorModelToXml(n.anchor),
    description: n.altText,
    editable: !1,
    id: `worksheet-image-${t}-${n.drawingPath.join(`-`)}`,
    mediaPath: n.image.mediaPath || void 0,
    mimeType: a,
    name: n.name,
    sheetIndex: t,
    src: s,
    workbookSheetIndex: t,
    zIndex: c,
  };
}
function worksheetImagesBySheet(e: any, t: any) {
  let n = (Array.from({ length: e.sheetCount }, () => []) as any[]);
  for (let r = 0; r < e.sheetCount; r += 1) {
    let i = e.getSheet(r),
      a = i.images;
    if (a.length === 0) continue;
    let o = a
      .filter((e: any) => !e.hidden && !!e.anchor)
      .map((e: any) => worksheetImageModel(i, r, e, t))
      .filter((e: any) => !!e);
    o.length > 0 && (n[r] = o);
  }
  return n;
}
function anchorSignature(e: any) {
  return e.kind === `absolute`
    ? [
        `absolute`,
        Math.round(e.positionEmu.x),
        Math.round(e.positionEmu.y),
        Math.round(e.sizeEmu.cx),
        Math.round(e.sizeEmu.cy),
      ].join(`:`)
    : e.kind === `one-cell`
      ? [
          `one`,
          e.from.col,
          e.from.row,
          Math.round(e.from.colOffsetEmu),
          Math.round(e.from.rowOffsetEmu),
          Math.round(e.sizeEmu.cx),
          Math.round(e.sizeEmu.cy),
        ].join(`:`)
      : [
          `two`,
          e.from.col,
          e.from.row,
          Math.round(e.from.colOffsetEmu),
          Math.round(e.from.rowOffsetEmu),
          e.to.col,
          e.to.row,
          Math.round(e.to.colOffsetEmu),
          Math.round(e.to.rowOffsetEmu),
        ].join(`:`);
}
function hiddenImageAnchorSignatures(e: any) {
  return (Array.from(
    { length: e.sheetCount },
    (t, n) =>
      new Set(
        e.getSheet(n).images.flatMap((e: any) => (e.hidden && e.anchor ? [anchorSignature(anchorModelToXml(e.anchor))] : [])),
      ),
  ) as any[]);
}
function mergeImageAssets(e: any, t: any, n: any) {
  let r = e.filter((e: any) => !n.has(anchorSignature(e.anchor)));
  if (r.length === 0) return t;
  if (t.length === 0) return r;
  let i = (e: any) => e?.trim().toLowerCase() ?? ``,
    a = (e: any) => {
      let t: any[] = [
        `${i(e.mediaPath)}|${i(e.name)}|${anchorSignature(e.anchor)}`,
        `${i(e.mediaPath)}|${anchorSignature(e.anchor)}`,
        `${i(e.name)}|${anchorSignature(e.anchor)}`,
        `${anchorSignature(e.anchor)}`,
      ];
      return t.filter((e, n) => e && t.indexOf(e) === n);
    },
    o = new Map();
  for (let e of t)
    for (let t of a(e)) {
      let n = o.get(t);
      n ? n.push(e) : o.set(t, [e]);
    }
  let s = new Set(),
    c = (e: any) => {
      for (let t of a(e)) {
        let e = o.get(t);
        if (!e) continue;
        let n = e.find((e: any) => !s.has(e));
        if (n) return (s.add(n), n);
      }
      return null;
    };
  return r.map((e: any) => {
    let t: any = c(e);
    return t
      ? {
          ...e,
          anchor: t.anchor,
          mediaPath: t.mediaPath ?? e.mediaPath,
          mimeType: t.mimeType,
          name: t.name ?? e.name,
          src: t.src,
          zIndex: t.zIndex,
        }
      : e;
  });
}
function isZipSignature(e: any) {
  return e.byteLength >= 4 && e[0] === 80 && e[1] === 75;
}
function isOleSignature(e: any) {
  return (
    e.byteLength >= 8 &&
    e[0] === 208 &&
    e[1] === 207 &&
    e[2] === 17 &&
    e[3] === 224 &&
    e[4] === 161 &&
    e[5] === 177 &&
    e[6] === 26 &&
    e[7] === 225
  );
}
export function shouldSkipXmlParsing(e: any, t = !1) {
  return t || isOleSignature(e);
}
function emptyImageAssets(e: any) {
  let t: any[] = [];
  return {
    archive: {},
    dirtyArchivePaths: new Set(),
    formControlsByWorkbookSheetIndex: buildFormControlsBySheet(e),
    imageOriginsById: new Map(),
    imagesByWorkbookSheetIndex: worksheetImagesBySheet(e, t),
    namedCellStyleByName: {},
    objectUrls: t,
    shapesByWorkbookSheetIndex: (Array.from({ length: e.sheetCount }, () => []) as any[]),
    sheetOrigins: (Array.from({ length: e.sheetCount }, () => null) as any[]),
    sheetStatesByWorkbookSheetIndex: (Array.from({ length: e.sheetCount }, () => null) as any[]),
    styleById: {},
    tableMetadataByWorkbookSheetIndex: (Array.from({ length: e.sheetCount }, () => []) as any[]),
    tableStyleByName: {},
    themePalette: { colorsByIndex: {} },
  };
}
export function buildImageAssets(e: any, t: any, n = !1) {
  if (shouldSkipXmlParsing(e, n) || !isZipSignature(e)) return emptyImageAssets(t);
  let r = parseWorkbookImageAssets(e, t),
    i = worksheetImagesBySheet(t, r.objectUrls),
    a = hiddenImageAnchorSignatures(t),
    o = (Array.from(
      { length: Math.max(t.sheetCount, r.imagesByWorkbookSheetIndex.length, i.length) },
      (e, t) => mergeImageAssets(r.imagesByWorkbookSheetIndex[t] ?? [], i[t] ?? [], a[t] ?? new Set()),
    ) as any[]);
  return { ...r, imagesByWorkbookSheetIndex: o };
}
export function downloadFileSource(e: any, t: any) {
  let n = new Blob([e], { type: xlsxMimeType }),
    r = URL.createObjectURL(n),
    i = document.createElement(`a`);
  ((i.href = r),
    (i.download = t),
    document.body.append(i),
    i.click(),
    i.remove(),
    setTimeout(() => URL.revokeObjectURL(r), 0));
}
export function exportBlob(e: any, t: any, n: any) {
  let r = new Uint8Array(e.byteLength);
  r.set(e);
  let i = new Blob([r], { type: n }),
    a = URL.createObjectURL(i),
    o = document.createElement(`a`);
  ((o.href = a),
    (o.download = t),
    document.body.append(o),
    o.click(),
    o.remove(),
    setTimeout(() => URL.revokeObjectURL(a), 0));
}
export function exportTextFile(e: any, t: any, n: any) {
  let r = new Blob([e], { type: n }),
    i = URL.createObjectURL(r),
    a = document.createElement(`a`);
  ((a.href = i),
    (a.download = t),
    document.body.append(a),
    a.click(),
    a.remove(),
    setTimeout(() => URL.revokeObjectURL(i), 0));
}
export function downloadUrlFile(e: any, t: any) {
  let n = document.createElement(`a`);
  ((n.href = e),
    (n.download = t),
    (n.rel = `noreferrer`),
    document.body.append(n),
    n.click(),
    n.remove());
}

/*
 * ============================================================================
 * 符号表（B5-12p；行号 = 主口径 js 行；语义名与 ·export 分级同 §一映射表）
 * ============================================================================
 * [模块头]
 * G → reactInterop (9111) | Rn → reglInterop (9112) | K → jsxRuntime (9113)
 *  zn → chartXmlNamespace (9114) | q → drawingXmlNamespace (9115) | Bn → chartRelNamespace (9116)
 *  Vn → chartExRelNamespace (9117) | Hn → chartStyleRelNamespace (9118)
 *  Un → chartColorStyleRelNamespace (9119) | Wn → officeChartPalette (9120)
 * [解析/几何]
 * Gn → quoteFormulaString (1681) | Kn → unquoteFormulaString (9135) | qn → splitFormulaArgs (9141)
 *  Jn → seriesRawName (9182) | Yn → chartSeriesFormula (9186) | Xn → parseSeriesFormula (9198)
 *  Zn → updateChartSeriesValues (1847) | Qn → normalizeSheetVisibility (9256) | $n → emuPerPx (9259)
 *  er → themeColorIndices (9260) | tr → chartElementTagNames (9278) | nr → clampUnitValue (9296)
 *  rr → isElementNode (1902) | ir → normalizeHexColor (9302) | ar → fillColorFromXml (9310)
 *  or → shapePaintFromXml (1930) | sr → seriesPaintColorsFromXml (9346)
 *  J → dataPointOverridesFromXml (9355) | cr → numericPointValuesFromXml (9399)
 *  lr → bubbleSizeValuesFromXml (9420) | ur → decodeXmlEntities (9429)
 *  dr → normalizeTitleText (1998) | fr → chartTitleFromXml (9440)
 *  pr → matchBubbleChartValues (9446) | mr → chartTypeTagFromXml (9467)
 *  hr → chartTypeElement (2059) | gr → scatterChartSubtype (9479)
 *  _r → matchDataPointOverrides (2064) | Y → hexToRgb (9523) | X → rgbToHsl (9535)
 *  vr → hueToRgbChannel (2067) | yr → hslToRgb (9567) | br → rgbToHex (9580)
 *  xr → adjustColorLuminance (2076) | Sr → resolveSchemeColor (9596)
 *  Cr → resolveThemeTypeface (2096) | wr → defaultRunFontFromXml (9610)
 *  Tr → colorFromXmlElement (2109) | Er → isColorElement (9651) | Dr → findColorElement (9657)
 *  Or → resolveShapeFillColor (2118) | kr → resolveShapeLineProperties (9692)
 *  Ar → normalizeChartLegend (2124) | jr → legendPositionCode (9714) | Z → childNumericVal (9729)
 *  Mr → childBooleanVal (2130) | Nr → runFontSizePt (9741) | Pr → dataLabelSpecs (9747)
 *  Fr → normalizeDataLabels (2139) | Ir → partRelationshipMap (9793) | Lr → themeColorList (9807)
 *  Rr → chartStyleColors (2148) | zr → accentColorPalette (9848) | Br → normalizeChartStyleId (9852)
 *  Vr → surfaceChartPalette (2165) | Hr → applySurfaceChartDefaults (9863)
 *  Ur → applyChartStyleDefaults (2177) | Wr → dataPointOverridesFromElement (9933)
 *  Gr → invertedPointStyle (2183) | Kr → referencePointsFromElement (9956)
 *  qr → multiLevelRefPoints (2189) | Jr → applySeriesXmlStyles (10001)
 *  Yr → hydrateChartFromPartXml (2195) | Xr → normalizePartPath (10501) | Zr → partDirectory (10504)
 *  Qr → resolvePartTarget (2204) | $r → partText (10535) | ei → parseXmlDocument (10540)
 *  ti → serializeXmlDocument (2213) | ni → childElements (10551) | ri → removeChildElements (10556)
 *  ii → descendantElements (2222) | Q → firstChild (10562) | ai → firstDescendant (10565)
 *  oi → ensureChildElement (2228) | si → ensureChildTextElement (10574)
 *  ci → ensureBooleanChildElement (2234) | li → ensureIntegerChildElement (10582)
 *  ui → unquoteSheetName (2240) | di → splitSheetReference (10590) | fi → parseCellRef (10603)
 *  pi → parseRangeRef (2249) | mi → columnLetters (10621) | hi → formatAbsoluteRangeRef (10630)
 *  gi → resolveFormulaRange (2258) | _i → resolveRangeTitle (10649) | vi → readRangeStrings (10669)
 *  yi → normalizeLegendModel (2267) | bi → titleCaseLabel (10698) | xi → normalizeAxisModel (10706)
 *  Si → chartExLayoutType (2343) | Ci → chartExLayoutId (10755) | wi → chartExAxisIds (10764)
 *  Ti → niceBinSize (10781) | Ei → formatBinInterval (10787) | Di → computeHistogramBins (10792)
 *  Oi → applyHistogramBinning (10844) | ki → buildParetoSeries (10867)
 *  Ai → chartExTextValue (10889) | ji → chartExTitleText (10897) | Mi → hierarchyCategoryRef (10906)
 *  Ni → buildChartExSeries (10919) | Pi → filterChartExSeries (10995)
 *  Fi → buildChartExModel (11010) | Ii → cellValueToNumber (11112) | Li → cellValueToString (11135)
 *  Ri → readFormulaValues (11149) | zi → resolveFormulaText (11171) | Bi → normalizeSeriesRef (11182)
 *  Vi → normalizeChartExAxis (11192) | Hi → mergeAxisModel (11234)
 *  Ui → axisModelFromElement (11237) | Wi → wallModelFromElement (11279)
 *  Gi → normalizeDataLabelsModel (11290) | Ki → normalizeAnchorModel (11338)
 *  qi → anchorMarkerFromElement (11398) | Ji → anchorFromElement (11413)
 *  Yi → isAnchorInverted (11446) | Xi → buildJsonChartSeries (11456)
 *  Zi → buildJsonChartTypeGroup (2793) | Qi → buildChartsheetTab (11519)
 *  $i → buildSheetTabList (2799) | ea → drawingChartRefs (11584) | ta → assignChartOrigins (11636)
 *  na → hydrateChartAssets (2808) | ra → chartAnchorElements (11786)
 *  ia → writeAnchorMarker (2814) | aa → writeAnchorGeometry (11807) | oa → writeChartTitle (11829)
 *  sa → writeRefFormula (11851) | ca → writeSeriesName (11858) | la → writeSeriesFormulas (11869)
 *  ua → writeAxisProperties (11911) | da → writeDataLabelFlags (11955)
 *  fa → updateChartAnchorInImageAssets (11965) | pa → updateChartInImageAssets (11980)
 *  ma → normalizeStyleHex (12007) | ha → styleHexToRgb (12015) | ga → styleRgbToHsl (12026)
 *  _a → styleHueChannel (12050) | va → styleHslToRgb (12058) | ya → styleRgbToHex (12071)
 *  ba → adjustColorTint (12074) | xa → resolveFontColor (12082) | Sa → resolveSolidFillColor (12096)
 *  Ca → resolveFillColor (12105)
 * [写回/序列化]
 * wa → officeRelationshipsNamespace (12131) | Ta → packageRelationshipsNamespace (12132)
 *  Ea → spreadsheetMlNamespace (12133) | Da → contentTypesNamespace (12134)
 *  Oa → drawingRelNamespace (12135) | ka → imageRelNamespace (12136)
 *  Aa → drawingContentType (12137) | ja → emuPerPixel (12138) | Ma → minColumnWidthPx (12139)
 *  Na → minRowHeightPx (12140) | Pa → maxColumnWidthEmu (12141) | Fa → defaultRowHeightEmu (12142)
 *  Ia → defaultCharWidthPx (12143) | La → charWidthCache (12144) | Ra → devicePixelSnap (12145)
 *  za → measureCharWidth (3076) | Ba → columnWidthToPixels (12171)
 *  Va → defaultColumnWidthPx (3082) | Ha → defaultRowHeightPx (12181)
 *  Ua → hiddenRowIndices (3091) | Wa → hiddenColumnIndices (12191) | Ga → mergeSpanSummary (12197)
 *  Ka → themePaletteModel (3103) | qa → copyToUint8Array (12259) | Ja → normalizeZipPath (12263)
 *  Ya → joinZipPath (3119) | Xa → zipPathDir (12269) | Za → resolveZipPath (12274)
 *  Qa → relativeZipPath (3164) | $a → zipRelsPath (12298) | eo → parseXmlStrict (12302)
 *  to → serializeXmlWb (3176) | no → zipEntryTextWb (12309) | ro → columnLettersToIndex (12313)
 *  io → parseCellAddress (3219) | ao → parseRangeAddress (12328) | oo → stripSheetPrefix (12334)
 *  so → rangeStartCell (3259) | co → rangeAddressPart (12342) | lo → isElementNodeWb (12345)
 *  uo → descendantElementsWb (3274) | fo → childElementsWb (12351) | $ → firstChildWb (12354)
 *  po → firstDescendantWb (12357) | mo → featurePropertyBagTypes (12360)
 *  ho → relationIdAttr (12392) | go → relationEmbedAttr (12395) | _o → setChildText (12398)
 *  vo → writeMarkerText (12402) | yo → contentTypeMaps (12409) | bo → contentTypeForPart (12428)
 *  xo → relationshipMapForPart (12435) | So → workbookSheetEntries (12452) | Co → parseTheme (12467)
 *  wo → parseColorAttributes (12515) | To → booleanFlagAttr (12530)
 *  Eo → parseSparklineGroups (12535) | Do → parseFontElement (12576) | Oo → parseFillElement (12605)
 *  ko → parseBorderSide (12638) | Ao → parseBorderElement (12644)
 *  jo → parseAlignmentElement (1308) | Mo → parseDxfElement (12677) | No → resolveXfStyle (12686)
 *  Po → parseStylesPart (1324) | Fo → parseSqrefRanges (12762) | Io → parseCfvo (12773)
 *  Lo → optionalBooleanAttr (1371) | Ro → parseConditionalRule (12786)
 *  zo → parseConditionalRuleExt (1407) | Bo → mergeConditionalRules (12894)
 *  Vo → parseConditionalFormatting (1553) | Ho → parseSheetLayout (12967)
 *  Uo → clampColorChannel (1895) | Wo → normalizeArgbHex (13060) | Go → hexToRgbObject (13068)
 *  Ko → rgbChannelsToHex (1941) | qo → applyColorTransforms (13079)
 *  Jo → schemeColorFromTheme (1952) | Yo → drawingColorFromElement (13117)
 *  Xo → drawingSolidFill (2051) | Zo → resolveSchemeTypefaceWb (13140)
 *  Qo → isSchemeTypeface (2162) | $o → runTypefaceFromElement (13151)
 *  es → textRunStyleFromElement (2174) | ts → mergeRunStyles (13173)
 *  ns → markerPointFromText (2464) | rs → anchorModelToXml (13200)
 *  is → normalizeDrawingAnchor (2504) | as → captionColorSpec (13255) | os → captionFontSpec (13270)
 *  ss → captionSpec (2599) | cs → resolveCaptionTextColor (13293) | ls → captionDisplayProps (13312)
 *  us → formControlDisplayProps (2671) | ds → buildFormControlModel (13402)
 *  fs → buildFormControlsBySheet (13422) | ps → normalizeLabelText (13432)
 *  ms → legacyAnchorFromElement (2683) | hs → anchorEmuRect (13472) | gs → columnWidthPxAt (13484)
 *  _s → rowHeightPxAt (13487) | vs → columnOffsetPx (13490) | ys → rowOffsetPx (13495)
 *  bs → anchorRectPx (13500) | xs → rectToAbsoluteAnchor (13515) | Ss → xfrmFromElement (13518)
 *  Cs → applyChildTransform (2741) | ws → resolveGroupChildTransform (13542)
 *  Ts → shapeTransformFromXfrm (2751) | Es → textAlignFromDrawing (13601)
 *  Ds → verticalAlignFromDrawing (13615) | Os → drawingAnchorElements (13625)
 *  ks → bytesToObjectUrl (3660) | As → isConnectorGeometry (13645) | js → drawingLineProps (13648)
 *  Ms → drawingFillProps (3765) | Ns → pathPointAttr (13672) | Ps → customGeometryPath (13678)
 *  Fs → geometryAdjustValues (3797) | Is → drawingParagraphs (13724)
 *  Ls → drawingTextBoxProps (13785) | Rs → drawingHyperlinkTarget (13799)
 *  zs → drawingImageFromPic (3830) | Bs → drawingShapeFromSp (13831)
 *  Vs → collectDrawingShapes (13863) | Hs → parseDrawingPart (13899) | Us → syncFormControls (13922)
 *  Ws → disposeImageAssets (4129) | Gs → parseWorkbookMetadata (13928)
 *  Ks → parseWorkbookImageAssets (4164) | qs → writeAnchorGeometryWb (14009)
 *  Js → updateImageRect (14031) | Ys → ensureRelsDocument (14049)
 *  Xs → ensureContentTypesDocument (4351) | Zs → ensureContentTypeEntry (14067)
 *  Qs → removeDrawingRefs (4404) | $s → nextDrawingRelationId (14108)
 *  ec → appendDrawingElement (4422) | tc → saveXlsxWithAssets (14130)
 * [公式/计算+网格]
 * nc → emuToPx (4437) | rc → pxToEmu (14194) | ic → pxToColumnWidthUnits (14197)
 *  ac → columnWidthToPx (14200) | oc → rowHeightToPx (14203) | sc → snapGridSize (14206)
 *  cc → pxFromGridSize (14209) | lc → pixelToGridIndex (14212) | uc → rectToDrawingAnchor (14222)
 *  dc → resizeRectWithHandle (4551) | fc → sheetReferenceRegex (14274)
 *  pc → collectFormulaSheetRefs (4801) | mc → hasUnresolvedSheetRefs (14299)
 *  hc → calculateWorkbookSafe (4809) | gc → ensureWorkbookCalculated (14331)
 * [wasm 桥]
 * _c → cachedWasmModulePromise (4822) | vc → wasmSourceExplicitlySet (14342)
 *  yc → rawWasmSource (4834) | bc → resolvedWasmSource (14344) | xc → copyToStandaloneBuffer (14345)
 *  Sc → normalizeWasmSource (14350) | Cc → setDukeSheetsWasmSource (14357)
 *  wc → isWasmSourceAvailable (14360) | Tc → getDukeSheetsWasmSource (14363)
 *  Ec → loadDukeSheetsWasmModule (4945) | Dc → createAbortError (14382)
 *  Oc → XlsxWorkerClient (4993) | kc → cloneArrayBuffer (14474)
 * [模型/错误/常量]
 * Ac → backslashCharCode (5135) | jc → slashCharCode (14478)
 *  Mc → zipEndOfCentralDirSignature (14479) | Nc → zipCentralDirSignature (14480)
 *  Pc → zipLocalHeaderSignature (14481) | Fc → zipEndOfCentralDirSize (14482)
 *  Ic → zipCentralDirEntrySize (4366) | Lc → zipLocalHeaderSize (14484)
 *  Rc → zipMaxCommentLength (14485) | zc → zipMaxEntryCount (14486) | Bc → zip64MagicValue (14487)
 *  Vc → findEndOfCentralDir (14488) | Hc → readEndOfCentralDir (14497)
 *  Uc → readCentralDirEntry (5268) | Wc → entryNameHasBackslash (14529)
 *  Gc → hasBackslashEntries (14533) | Kc → zipEntryName (14543) | qc → validateZipStructure (14551)
 *  Jc → sanitizeBackslashNames (14586) | Yc → sanitizeZipBytes (14601)
 *  Xc → normalizeWorkbookBytes (14608) | Zc → saveDebounceMs (14617) | Qc → defaultRowHeight (14618)
 *  $c → defaultColumnWidth (4431) | el → xlsxMimeType (14620) | tl → csvMimeType (14621)
 *  nl → minSheetRowHeightPx (5297) | rl → headerRowHeightPx (14623) | il → rowHeaderWidthPx (14624)
 *  al → undoEntryLimit (5308) | ol → rangeClipboardMimeType (14626)
 *  sl → deferLoadingDefault (14627) | cl → maxFileSizeDefault (14628)
 *  ll → maxWorksheetXmlBytes (4511) | ul → maxSharedStringsBytes (14630)
 *  dl → maxTotalWorksheetBytes (4525) | fl → defaultZoomPercent (14632) | pl → minZoomScale (14633)
 *  ml → maxZoomScale (14634) | hl → zoomStepPercent (14635) | gl → defaultTabId (14636)
 *  _l → normalizeVisibility (14637) | vl → clampZoomScale (14640) | yl → defaultZoomForSheet (14643)
 *  bl → resolveZoomScale (14646) | xl → stepZoomScale (14654) | Sl → formatByteSize (14659)
 *  Cl → findEocdrOffset (5912) | wl → readZipCentralDirectory (14674)
 *  Tl → checkSheetLimits (14700) | El → sheetLimitError (14721)
 *  Dl → XlsxFileSizeLimitExceededError (6929) | Ol → deriveDisplayFileName (14736)
 *  kl → expandUsedRange (7010) | Al → buildSheetStates (14765) | jl → collectSheetOrigins (14903)
 *  Ml → defaultCellStyleAt (7029) | Nl → columnIndexToLetters (14913) | Pl → cellAddress (14919)
 *  Fl → parseCellAddressString (7056) | Il → parseRangeString (14930)
 *  Ll → resolveInputRange (14936) | Rl → hexToRgbArray (14961) | zl → normalizeColorSpec (14967)
 *  Bl → normalizeFontSpec (15004) | Vl → normalizeCaptionSpec (15019)
 *  Hl → formControlKindFromInput (7278) | Ul → formControlKindToSpec (15061)
 *  Wl → normalizeDrawing (7289) | Gl → formControlDrawingSpec (15092) | Kl → syncGroupBoxes (15105)
 *  ql → formControlKindChanged (15120) | Jl → normalizeFreezePanes (15143)
 *  Yl → normalizeDataValidations (15149) | Xl → normalizeRange (15179) | Zl → rangeToRef (15185)
 *  Ql → rangeContainsCell (15191) | $l → worksheetTables (15195) | eu → nonNegativeIntParam (15231)
 *  tu → booleanParam (4912) | nu → fileBaseName (15249) | ru → pxToRowHeightUnits (15254)
 *  iu → colorHexOnly (4926) | au → borderCss (15262) | ou → normalizeDisplayValue (15266)
 *  su → copyBytes (15276) | cu → workbookSavePayload (15280) | lu → pushUndoEntry (15297)
 *  uu → cloneCellValue (15300) | du → cloneCellStyle (15303) | fu → parseCellValueInput (15315)
 *  pu → applyCellMutation (15326) | mu → escapeHtml (15330) | hu → parseClipboardText (15338)
 *  gu → createAbortErrorLocal (15353) | _u → isAbortError (15358)
 *  vu → resolveWorkbookSource (15361) | yu → parseWorkbook (15381) | bu → scheduleIdleWork (15391)
 *  xu → mimeTypeFromImageUrl (5096) | Su → imageFormatMimeType (15427) | Cu → bytesToBlobUrl (15440)
 *  wu → worksheetImageModel (5131) | Tu → worksheetImagesBySheet (15480)
 *  Eu → anchorSignature (5147) | Du → hiddenImageAnchorSignatures (15525)
 *  Ou → mergeImageAssets (15534) | ku → isZipSignature (15579) | Au → isOleSignature (15582)
 *  ju → shouldSkipXmlParsing (8748) | Mu → emptyImageAssets (15598) | Nu → buildImageAssets (15617)
 *  Pu → downloadFileSource (8807) | Fu → exportBlob (15639) | Iu → exportTextFile (15652)
 *  Lu → downloadUrlFile (15663)
 *  外部依赖 9 组（行号在案）见文件头 §二。
 *  边界：下界 9111 与 vendored regl（1835–9110）互斥；上界 15671 与
 *  B5-12a（XlsxDeepA.tsx，15672 起控制器 Ru）互斥。
 * ============================================================================
 */
