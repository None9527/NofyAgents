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

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/xlsx/XlsxDeepP.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  reactInterop,
  reglInterop,
  jsxRuntime,
  chartXmlNamespace,
  drawingXmlNamespace,
  chartRelNamespace,
  chartExRelNamespace,
  chartStyleRelNamespace,
  chartColorStyleRelNamespace,
  officeChartPalette,
  chartSeriesFormula,
  updateChartSeriesValues,
  hydrateChartAssets,
  updateChartAnchorInImageAssets,
  updateChartInImageAssets,
  resolveFontColor,
  resolveFillColor,
  normalizeDrawingAnchor,
  syncFormControls,
  disposeImageAssets,
  parseWorkbookImageAssets,
  updateImageRect,
  saveXlsxWithAssets,
  emuToPx,
  pxToColumnWidthUnits,
  columnWidthToPx,
  rowHeightToPx,
  snapGridSize,
  pxFromGridSize,
  rectToDrawingAnchor,
  resizeRectWithHandle,
  ensureWorkbookCalculated,
  setDukeSheetsWasmSource,
  isWasmSourceAvailable,
  loadDukeSheetsWasmModule,
  XlsxWorkerClient,
  normalizeWorkbookBytes,
  saveDebounceMs,
  defaultRowHeight,
  defaultColumnWidth,
  xlsxMimeType,
  csvMimeType,
  minSheetRowHeightPx,
  headerRowHeightPx,
  rowHeaderWidthPx,
  undoEntryLimit,
  rangeClipboardMimeType,
  deferLoadingDefault,
  maxFileSizeDefault,
  maxWorksheetXmlBytes,
  maxSharedStringsBytes,
  maxTotalWorksheetBytes,
  defaultZoomPercent,
  minZoomScale,
  maxZoomScale,
  zoomStepPercent,
  defaultTabId,
  clampZoomScale,
  defaultZoomForSheet,
  stepZoomScale,
  checkSheetLimits,
  sheetLimitError,
  XlsxFileSizeLimitExceededError,
  deriveDisplayFileName,
  buildSheetStates,
  collectSheetOrigins,
  defaultCellStyleAt,
  cellAddress,
  resolveInputRange,
  formControlKindFromInput,
  formControlKindToSpec,
  normalizeDrawing,
  formControlDrawingSpec,
  syncGroupBoxes,
  formControlKindChanged,
  normalizeRange,
  rangeToRef,
  rangeContainsCell,
  worksheetTables,
  fileBaseName,
  pxToRowHeightUnits,
  borderCss,
  normalizeDisplayValue,
  copyBytes,
  workbookSavePayload,
  pushUndoEntry,
  cloneCellValue,
  cloneCellStyle,
  parseCellValueInput,
  applyCellMutation,
  escapeHtml,
  parseClipboardText,
  isAbortError,
  resolveWorkbookSource,
  parseWorkbook,
  scheduleIdleWork,
  shouldSkipXmlParsing,
  buildImageAssets,
  downloadFileSource,
  exportBlob,
  exportTextFile,
  downloadUrlFile,
} from '../components/xlsx/XlsxDeepP';
