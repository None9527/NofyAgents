/* eslint-disable */
/**
 * ============================================================================
 * PreviewCards.tsx — F19 预览卡群深部展开（B5-06 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本机实测 213,979 行，未改动，只读）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，170,400 行）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：B5-FULL-DECODE-PLAN 批次表 #6 A 段；MarkdownIntegration.report §8「F19 余量」；
 *       COVERAGE-LEDGER §c #19。
 *
 * 行号口径：本文件行号一律为**本机实测行**（js 行 / jsx 行）。旧登记（MODULE-MAP、
 * MarkdownIntegration.report 等）使用的 213,695 行版口径与本文件存在 **+48 行偏移**
 * （如 MBe 旧登记 49090 → 实测 49138；Qze 旧登记 48221 → 实测 48269）。换算关系在
 * 报告 PreviewTreeRewind.report.md §1 逐锚点列出。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：实测 js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  [Mermaid] Qze 全屏对话框深部（实测 48114–48571；旧登记 48066–48523）：
 *   Uze  → MIN_DIAGRAM_ZOOM            (48114 / 43290)
 *   ek   → clampDiagramZoom            (48115 / 43291)
 *   tk   → zoomDiagramAt               (48118 / 43294)
 *   nk   → panDiagram                  (48125 / 43305)
 *   Wze  → fitDiagramToViewport        (48128 / 43312)
 *   rk   → IDENTITY_DIAGRAM_TRANSFORM  (48143 / 43335)
 *   Gze  → DIAGRAM_ZOOM_PRESETS        (48144 / 43340)
 *   Kze  → SVG_RENDERED_SELECTOR       (48145 / 43341)
 *   qze  → SVG_NON_RENDERED_SELECTOR   (48158 / 43342)
 *   ik   → pointerCenter               (48173 / 43343)
 *   ak   → pointerDistance             (48179 / 43353)
 *   Jze  → isInvisiblePaint            (48183 / 43357)
 *   ok   → svgRootBounds               (48187 / 43361)
 *   sk   → applySvgRootBounds          (48196 / 43379)
 *   ck   → serializeRect               (48209 / 43383)
 *   Yze  → svgBBox                     (48214 / 43393)
 *   Xze  → unionBounds                 (48222 / 43406)
 *   Zze  → isBackgroundRect            (48229 / 43423)
 *   lk   → measureSvgContentBounds     (48244 / 43429)
 *   uk   → toViewportLocalPoint        (48265 / 43457)
 *   Qze  → MermaidFullscreenDialog     (48269 / 43464)
 *   dk   → DiagramToolbarButton        (48558 / 43723)
 *  [Table] MBe 粘性滚动条全量（实测 49138–49770；旧登记 49090–49722）：
 *   MBe  → MarkdownTableStickyScrollbar (49138 / 44247)
 *   Lk   → TableToolbarButton          (49758 / 44688)
 *  [Image] Wk 画廊 / 灯箱族（实测 49801–50176；旧登记 49753–50128）：
 *   Rk   → ORIGIN_POINT                (49801 / 44730)
 *   zk   → LIGHTBOX_DOWNLOAD_MAX_BYTES (49802 / 44734)
 *   RBe  → MIME_TO_DOWNLOAD_EXTENSION  (49803 / 44735)
 *   zBe  → clampPanOffset              (49811 / 44743)
 *   Bk   → downloadBaseName            (49819 / 44751)
 *   Vk   → LightboxDownloadError       (49828 / 44754)
 *   Hk   → isHttpDownloadSource        (49833 / 44759)
 *   Uk   → summarizeDownloadSource     (49836 / 44762)
 *   BBe  → downloadBlobWithSizeLimit   (49845 / 44771)
 *   VBe  → openUrlInNewTab             (49873 / 44804)
 *   Wk   → ImageLightbox               (49882 / 44808)
 *   qk   → ImageGalleryGroup           (50165 / 45007)
 *  [ToolPreview] 工具预览源构建族（实测 50177–50420；旧登记 50129–50372）：
 *   HBe  → TOOL_PREVIEW_TEXT_LIMIT     (50177 / 45015)
 *   Jk   → EXTENSION_LANGUAGE_MAP      (50178 / 45015)
 *   UBe  → EXTENSION_IMAGE_MIME_MAP    (50212 / 45015)
 *   WBe  → isPlainObject               (50224 / 45062)
 *   Yk   → resolvePreviewTitle         (50227 / 45065)
 *   Xk   → pickStringField             (50230 / 45068)
 *   Zk   → looksLikeUnifiedDiff        (50237 / 45074)
 *   Qk   → extractPatchText            (50240 / 45077)
 *   $k   → extractContentText          (50245 / 45080)
 *   eA   → extractPathField            (50250 / 45083)
 *   tA   → buildTextPreview            (50263 / 45086)
 *   nA   → resolvePreviewPath          (50266 / 45095)
 *   rA   → detectPreviewLanguage       (50271 / 45100)
 *   iA   → imageMimeTypeOfPath         (50283 / 45112)
 *   aA   → isImagePath                 (50289 / 45118)
 *   oA   → isPdfPreviewPath            (50292 / 45121)
 *   sA   → isPptxPreviewPath           (50295 / 45124)
 *   cA   → isUsablePreviewPath         (50298 / 45127)
 *   GBe  → unquoteDiffPath             (50302 / 45131)
 *   lA   → stripDiffSidePrefix         (50306 / 45135)
 *   uA   → parseDiffSidePath           (50310 / 45139)
 *   KBe  → parseDiffGitHeaderPath      (50320 / 45149)
 *   qBe  → extractDiffTargetPath       (50329 / 45158)
 *   JBe  → resolvePatchPath            (50345 / 45174)
 *   YBe  → buildDiffPreviewSource      (50348 / 45177)
 *   XBe  → buildToolPreviewSource      (50367 / 45198)
 *   ZBe  → buildToolContentPreview     (50401 / 45250)
 *  [Micro] 预览卡群微件（实测 51221–51233；旧登记 51173–51185）：
 *   ej   → InlineActionRow             (51221 / 46037)
 *   tj   → InlineIconButton            (51223 / 46042)
 *
 * ----------------------------------------------------------------------------
 * 二、边界与双归属注记
 * ----------------------------------------------------------------------------
 *  1. 任务口径 A 段行范围（旧登记 50618–51687 + 49180–49640）实测换算为
 *     50666–51735 + 49228–49688。本文件按任务点名的符号族展开，实际覆盖
 *     48114–48571（Qze 深部）+ 49138–49770（MBe 全量）+ 49801–50176（Wk 画廊）+
 *     50177–50420（工具预览源构建）+ 51221–51233（ej/tj）。
 *  2. 50666–51735 区段内的其余符号处置：
 *     - mVe/dVe/fVe/pVe/Gk/Kk/uVe/hA/gA/aj/oj/IHe/LHe/RHe/sj/$Ve/hVe/eHe/nHe/
 *       EA/DA/OA/kA/QVe/$A/zA/xHe/SHe/CHe/wHe/THe/fHe/pHe…yHe/kHe/AHe/PHe/rHe 族
 *       → 已由 MarkdownIntegration.tsx 逐字重建（不重复抽取）；
 *     - vA…TA URL/状态助手（50760–50890）→ 已由 BrowserPane.tsx §1 重建
 *       （浏览器域横切，消费面优先，见 SYMBOL-INDEX §12 外部依赖跨引用行）；
 *     - AA…UVe/WA…ZVe/QA 文件树模型+编辑器+文件动作（50907–51197）→ 语义归 F04，
 *       随本批 FileTreePanel.tsx 重建（行号在 A 段内、语义属 B 段，内部裁决）；
 *     - 孤立 (0, Q.createContext)(null)（51234）= streamdown 内部 context，vendored 侧。
 *  3. DropdownMenu 原语族（实测 47974–48113；旧登记 47926–48040）= X03 双归属，
 *     按任务排除，只注记（VO/HO/UO/WO/GO/KO/qO/JO/YO/XO/ZO/QO/$O）。
 *  4. qk 的类名常量 Gk/Kk 已在 MarkdownIntegration.tsx §10 重建；本文件 qk 以
 *     declare 挂接该二常量（不重复转录）。
 * ============================================================================
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk / 已在它文件还原者，此处声明接口）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime；2. cn (Z)；3. Button (X)；4. Textarea (j，imeComposition)；
 *  5. useIntlContext (G)；6. logger (J)；7. toast (m，imeComposition)；
 *  8. usePlatform (S，imeComposition：saveFile/openExternal 等)；
 *  9. Dialog 族 (zb/Hb/Ub/Gb/Kb/Vb)；10. DropdownMenu 族 (VO/HO/UO/WO/YO)；
 *  11. Tooltip (Ia，usageStatsUiParts chunk)；
 *  12. 图标：W_ copy / G_ download / mv mermaid-preview / $ve collapse / tye expand /
 *      g x / S_ chevron-left / C_ chevron-right / bv minus / kv plus / hye zoom-out /
 *      L_ zoom-in / N_ chevron-down / Kv trash；
 *  13. MarkdownIntegration.tsx 已重建件：TableEdgeShadow (Ik)、表格几何/序列化助手群
 *      (vBe…jBe → collapseWhitespace/escapeMarkdownCell/escapeCsvCell/tableRowsToMarkdown/
 *      tableRowsToCsv/extractTableRows/tableLayoutRoot/stickyInsetForViewport/
 *      tableLayoutInsets/measureRect/sameRect/cssVarPx/chatDockHeight/backToBottomInset/
 *      findVerticalScroller/shouldShowStickyScrollbar/stickyScrollbarOffset/
 *      tableNeedsStickyScrollbar/stickyTrackGeometry/stickyThumbGeometry/stickyScrollMax)、
 *      IMAGE_THUMBNAIL_CLASS (Gk)、IMAGE_INNER_CLASS (Kk)；
 *  14. 工具身份族（Conversation 域）：classifyToolCall (og)、toolContentFamilyOf (cg)、
 *      toolEditFamilyOf (sg)、parseToolRawPayload (Bh)、extractBeforeAfterEdit (Rh)、
 *      buildUnifiedDiffText (Kh)；
 *  15. 路径助手（横切 1925–1975）：baseName (Go)、isAbsolutePath (Ko)、
 *      resolvePathAgainst (Jo)、decodeUriSafe (qo)。
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/preview/PreviewCards.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  clampDiagramZoom,
  zoomDiagramAt,
  panDiagram,
  fitDiagramToViewport,
  MermaidFullscreenDialog,
  DiagramToolbarButton,
  TableToolbarButton,
  MarkdownTableStickyScrollbar,
  ImageLightbox,
  ImageGalleryGroup,
  TOOL_PREVIEW_TEXT_LIMIT,
  EXTENSION_LANGUAGE_MAP,
  EXTENSION_IMAGE_MIME_MAP,
  resolvePreviewTitle,
  pickStringField,
  looksLikeUnifiedDiff,
  extractPatchText,
  extractContentText,
  extractPathField,
  buildTextPreview,
  resolvePreviewPath,
  detectPreviewLanguage,
  imageMimeTypeOfPath,
  isImagePath,
  isPdfPreviewPath,
  isPptxPreviewPath,
  isUsablePreviewPath,
  unquoteDiffPath,
  stripDiffSidePath,
  parseDiffSidePath,
  parseDiffGitHeaderPath,
  extractDiffTargetPath,
  resolvePatchPath,
  buildDiffPreviewSource,
  buildToolPreviewSource,
  buildToolContentPreview,
  InlineActionRow,
  InlineIconButton,
} from '../components/preview/PreviewCards';
export type {
  DiagramTransform,
  MermaidFullscreenDialogProps,
  MarkdownElementBaseProps,
  LightboxItem,
  ImageLightboxProps,
  ToolTextPreview,
  ToolPatchPreview,
  ToolFilePreview,
  ToolImagePreview,
  ToolPreviewSource,
  CodeViewerSourceInput,
  DiffPreviewFileSource,
} from '../components/preview/PreviewCards';
