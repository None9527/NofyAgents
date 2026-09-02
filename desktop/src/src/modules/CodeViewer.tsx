/* eslint-disable */
/**
 * ============================================================================
 * CodeViewer.tsx — ZCode 3.7.6 代码查看/文件预览族（解混淆重建 · D8 Stage B3 / F14）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 本族 = 代码查看面板：breadcrumb 头（滚动渐隐遮罩）+ 更多菜单（markdown/svg 视图切换、
 * 换行、复制路径）+ 外部编辑器打开；内容分派（text/image/svg/pdf/office/pptx/patch/
 * multi-file-diff）；256KB 文本上限 + 2MB/64MB PDF/PPTX 阈值 + PPTX 残缺读取守卫；
 * 重内容延迟渲染占位（骨架 + 滚动位恢复）；行级代码评论 store（FH）。
 * shiki/diff 引擎（X08/X09）与 office/pdf/pptx 懒加载分包按依赖挂接，不逐行还原。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  预览视图群（160323–161140 / jsx 132770 起）：
 *   U8   → MarkdownPreviewView       cj 渲染 markdown 内容 (160323)
 *   iVt  → CodeViewDispatcher        纯文本语言→BO，否则 MO（高亮+评论+gutter）(160344)
 *   aVt  → CHECKERBOARD_BG_CLASS     透明图棋盘底 (160393)
 *   oVt  → imageScaleFromFilename    @2x 后缀解析 (160396)
 *   sVt  → ImageView                 自然尺寸×@Nx 缩放 / fitToContainer (160404)
 *   cVt  → SvgView                   svg 文本→data-url 复用 ImageView (160424)
 *   lVt/uVt → LazyPdfViewer/PdfPreviewSuspense (160432,160438)
 *   dVt/fVt → LazyPptxViewer/PptxPreviewSuspense (160445,160454)
 *   pVt/mVt/W8 → DIFF_UNSAFE_CSS=''/DiffViewerImpl/DiffViewer(memo)（vendored diff 封装）(160478,160479,160541)
 *   hVt/gVt/_Vt → isPatchSource/rest-props 透传助手 (160543,160546,160561)
 *   vVt  → PatchPreview              patch→纯文本行(Oft) 或 W8 (160578)
 *   yVt/bVt/xVt → LazyXlsx/LazyDocx/LazyLegacyDoc (160607–160636)
 *   SVt  → OfficePreviewErrorBoundary（resetKey 复位）(160633)
 *   CVt/wVt/TVt → OfficePending/Error/Dispatcher（excel/docx/legacy 三分派）(160654,160663,160670)
 *   EVt/G8 → isSvgPath/resolveErrorColor（fileMissing→destructive）(160696,160700)
 *   DVt  → CodeViewerContentDispatcher  全型分派+加载/错误/二进制/空态 (160699)
 *
 *  PPTX 残缺读取守卫（160926–160963）：
 *   OVt=256*1024 分块；kVt/K8 → 错误码/错误类；AVt isIncomplete；jVt assertComplete；MVt readWholeFileInChunks
 *
 *  头/占位/助手（160966–161140）：
 *   NVt  → SCROLL_FADE_MASKS         none/left/right/both 渐隐遮罩 (160966)
 *   PVt  → SKELETON_ROW_WIDTHS       12 行骨架宽度% (160970)
 *   FVt/q8/J8/Y8/Z8 → splitPath/isMarkdownSource/isSvgSource/md 扩展/svg 扩展 (160973–160986)
 *   X8   → isEnoentError             code|message 双判 (160982)
 *   IVt/LVt/RVt/zVt → pptx 引用缺失/too-large 判/错误文案绝对路径相对化/总解析 (160994–161014)
 *   BVt/VVt → scrollSnapshot/resolveFilePreviewState（isBinary|truncated）(161016,161018)
 *   HVt  → imageMediaTypeOf          mime≠svg 才作图片 (161027)
 *   UVt/WVt/GVt/KVt → 256KB/2MB/64MB/pptx-too-large (161032,161033,161036)
 *   qVt  → HeavyContentDeferredPlaceholder  骨架 12 行 (161038)
 *   JVt/YVt/XVt/ZVt/QVt/$Vt → 图片/PDF/PPTX 投影/重预览判/纯代码判/更多菜单能力 (161064–161114)
 *   eHt  → resolveBreadcrumb         工作区内相对分段/外绝对 (161111)
 *
 *  根组件：
 *   tHt  → CodeViewerPanel           aside data-testid=preview-pane (161141)
 *
 *  行级代码评论 store（68511–68579 / jsx 60720）：
 *   kH/PH → workspaceKeyOf/bucketKeyOf（`${ws}\0${path}`）(68508,68511)
 *   FH   → useCodeCommentsStore      getComments/addComment/removeComment/removeCommentBySource/restore/clearSource
 *
 *  常量：HBe=256*1024 文本首读上限（50129）；EA=`zcode-last-editor-id`（50856）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单
 * ----------------------------------------------------------------------------
 *  1. react；2. cn (Z)；3. Button (X)/图标；4. useIntlContext (G)；5. logger (J)；
 *  6. toast (m) imeComposition；7. 设置 store (ko) + resolveTheme (xo)；
 *  8. useWorkspaceServices (Oc) → fileService；9. 远程工作区信息 ($A)；
 * 10. 编辑器安装列表/打开 (getInstalledEditors/openInEditor，PlatformService)；
 * 11. JA resolveSelectedEditor（Settings 域）；12. 文件动作 g（copyAbsolutePath/copyRelativePath）；
 * 13. zA relativePath、Go basename、zc/Vc 文件图标、rA detectLanguage、fg patchToPlainTextLines、
 *     NO isPlainTextLanguage、BO PlainCodeBlock、MO HighlightedCodeBlockWithComments、
 *     gut PlainTextDiffPreview、Oft PatchPlainTextPreview、cj MarkdownRenderer、
 *     nze/rze vendored diff 组件（X09）、no base64ToArrayBuffer、iA/oA/sA/ro 文件类型判定、
 *     Ko isAbsolutePath、cae normalizeDecodedSource（SidePanel 族）、YBe diffSourceOf、
 *     OXe/_Xe/kXe 代码评论聊天附件、QV uid —— 同 chunk 他族/横切，接口声明挂接
 * 14. 懒加载分包：pdf-viewer / pptx-preview-viewer / previewPaneOffice* （动态 import 登记）
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/code-viewer/CodeViewer.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  workspaceKeyOf,
  commentBucketKey,
  useCodeCommentsStore,
  SCROLL_FADE_MASKS,
  SKELETON_ROW_WIDTHS,
  splitPathSegments,
  isMarkdownSource,
  isSvgSource,
  hasMarkdownExtension,
  hasSvgExtension,
  isEnoentError,
  isPptxReferenceMissing,
  isLegacyFileTooLargeError,
  relativizeErrorMessage,
  resolvePreviewErrorMessage,
  scrollSnapshot,
  resolveFilePreviewState,
  imageMediaTypeOf,
  PPTX_READ_CHUNK_BYTES,
  PptxPreviewIncompleteFileError,
  isPptxIncompleteFileError,
  assertPptxReadComplete,
  readWholeFileInChunks,
  TEXT_PREVIEW_MAX_BYTES,
  PDF_INLINE_MAX_BYTES,
  PPTX_MAX_BYTES,
  isPptxTooLarge,
  HeavyContentDeferredPlaceholder,
  projectImageSource,
  projectPdfSource,
  projectPptxSource,
  hasHeavyPreview,
  isCodeOnlySource,
  resolveViewerToggles,
  resolveBreadcrumb,
  MarkdownPreviewView,
  CodeViewDispatcher,
  imageScaleFromFilename,
  ImageView,
  SvgView,
  PdfPreviewSuspense,
  PptxPreviewSuspense,
  DiffViewerImpl,
  DiffViewer,
  PatchPreview,
  OfficePreviewErrorBoundary,
  OfficePendingPlaceholder,
  OfficePreviewErrorAlert,
  OfficePreviewDispatcher,
  isSvgPath,
  resolveErrorColor,
  CodeViewerContentDispatcher,
  readLastEditorId,
  rememberLastEditorId,
  CodeViewerPanel,
} from '../components/code-viewer/CodeViewer';
export type {
  CodePreviewSettings,
  CodeComment,
  CodeViewerSourceType,
  DecodedCodeViewerSource,
  CodeViewerSourceInput,
  PptxReferenceSource,
  PptxReferenceNavigation,
  PreviewErrorLabels,
  BreadcrumbModel,
  CodeCommentLabels,
  DiffViewerProps,
  CodeViewerPanelProps,
} from '../components/code-viewer/CodeViewer';
