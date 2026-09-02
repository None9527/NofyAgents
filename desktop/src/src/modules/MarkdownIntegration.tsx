/* eslint-disable */
/**
 * ============================================================================
 * MarkdownIntegration.tsx — ZCode 3.7.6 F19 MarkdownRenderer 集成层（解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，行号格式：融合chunk js 行 / jsx 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 定性：ZCode 自研的 markdown 集成层（MODULE-MAP F19 MarkdownFamily 的消费面）。
 *   本文件重建 `cj` MarkdownRenderer（displayName=MessageResponse，js 51688 / jsx 46461）
 *   以 <Streamdown>（chunk-BO2N2NFS 构建导出 r，已在 MarkdownRenderer.tsx 重建）装配的
 *   完整接线：shiki 高亮注入（wIe/TIe + vendored 100520–104621）、主题（EHe/[light,dark]）、
 *   插件表（$Ve: cjk/code/math/mermaid）、自定义块渲染器（components 映射）、
 *   文件链接/外链/图片/表格/代码块 UI，以及与 Conversation 行（hvt）的耦合点。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  集成层主体：
 *   cj  → MarkdownRenderer(MessageResponse)  会话消息流 markdown 渲染入口 (51688)
 *   sj  → MarkdownHeading                 h1-h6 分级标题渲染器 (51721)
 *   xHe → MarkdownRenderErrorBoundary     渲染失败降级纯文本 (51366)
 *   lo  → DEFAULT_CODE_PREVIEW_SETTINGS   {github-light/github-dark/行号/折行/12px} (1040)
 *   EHe → resolveCodeBlockTheme           system→matchMedia；dark|zai-dark→darkTheme (51437)
 *   DHe → codeBlockScopeKey               主题:字号:折行:工作区三元 → Pre 的 React key (51446)
 *   bHe → resolveStreamdownMode           streaming|static (51363)
 *   fHe → fnv1aLengthHash                 resetKey 用内容指纹 (51255)
 *   oj  → childrenToText                  React children → 纯文本 (51459)
 *   kHe → trimChildrenText (51468) | PHe → trimTrailingNewlines2 (51450)
 *   OHe → languageFromClass               `language-xxx` 提取 (51456)
 *   uVe → collapseSeparatedImageBlocks    孤立图片行间的空行折叠 (50559)
 *   yHe → escapeStrayMathDollars          行内 $ 转义（代码栅栏段豁免）(51337)
 *   aj/vHe/gHe/_He/hHe/ij/mHe/pHe → 数学 $ 转义助手群 (51218–51288)
 *
 *  shiki 高亮注入链：
 *   wIe → createShikiCodeHighlighterPlugin  type=code-highlighter，highlight()→codeToTokens 双主题 (43695)
 *   TIe → SHIKI_CODE_HIGHLIGHTER = wIe()    $Ve.code (43695)
 *   CIe → getOrCreateHighlighter            按 lang+themes 缓存 Id(...) (43679)
 *   SIe → highlightCacheKey                 前100+后100字符采样键 (43673)
 *   eE  → normalizeLanguageAlias            bIe 别名表归一 (43667)
 *   yIe → FORGIVING_ONIG_ENGINE = Ep({forgiving:true})  JS 正则引擎 (43632/15923)
 *   Id  → shiki createHighlighter 单例      langs=Td themes=Ed engine=wasm(wasm-B4ap0Fdc.js) (13191)
 *   wd  → 语言元数据表(别名) (10880) | Td → bundledLanguages 映射 (12440)
 *   dQ  → bundledLanguages 懒加载登记表     ~200 条 import() 动态分包 (100542)
 *   —   → bundledThemes 登记表              github-light 等 (102141–102544)
 *   —   → oniguruma wasm 绑定               fQ OnigError / hQ OnigString / mQ binding (102545–102800)
 *   —   → textmate Registry(_onigLib) + 主题归一尾段 (103150–104621)
 *
 *  插件 / 选项接线：
 *   $Ve → STREAMDOWN_PLUGINS {cjk:vIe, code:TIe, math:xE({singleDollarTextMath:!0}), mermaid:RRe} (51186)
 *   eHe → LINK_SAFETY_DISABLED {enabled:false} (51187)
 *   hVe → STREAMDOWN_CONTROLS {table:{fullscreen:false}} (50760)
 *   THe → REHYPE_PLUGINS [wHe, ...Object.values(Mre)]  文件链接 href 重写 + 默认表 (51388)
 *   wHe → rehypeFileLinksPlugin  a[href]/img[src] 工作区相对路径 → SHe 规范 href (51422)
 *   CHe → isWorkspaceLikeHref (51409) | SHe → buildFileHrefWithLine (51340)
 *   vIe → CJK_PLUGIN _Ie()  remark/micromark CJK 标点粘连修正 (43631)
 *   gIe → cjkTrailingPunctuationAutolinkSplit  visit link 尾标点切分 (43597)
 *   xE  → createMathPlugin(katex)  remarkPlugin=sLe rehypePlugin=XIe (44373)
 *   rO  → createMermaidPlugin  包 mermaid(tO) initialize/render 门面 (45986)
 *   RRe → MERMAID_PLUGIN = rO() (45986) | Fze = rO()（BO 内嵌渲染用）(47763)
 *
 *  自定义块渲染器（components 映射消费）：
 *   gk  → ZCodeCodeBlock              代码块容器：fk ctx + mermaid 内嵌/全屏 + MO 高亮体 (48634)
 *   pk  → ZCodeCodeBlockHeader        语言条：文件图标+语言名+折行/复制（mermaid→预览按钮）(48592)
 *   fk  → CodeBlockUiContext          {code,mermaidPreviewAvailable,openMermaidPreview,toggleWrapLongLines,wrapLongLines} (48623)
 *   nBe → CodeBlockFrame              content-visibility 容器 (48583)
 *   _k  → WrapLongLinesButton (48720) | iBe → MermaidOpenPreviewButton (48745) | vk → CopyCodeButton (48775)
 *   MO  → HighlightedCodeBlock        ZCode 代码查看器高亮体（注释/行选择；本文件仅接口）(47549)
 *   BO  → MermaidInlinePreview        串行队列渲染 mermaid svg，失败降级 pre (47895)
 *   Qze → MermaidFullscreenDialog     (48221，本文件仅接口)
 *   Oze → isMermaidBlock (47725) | Pze → mermaidAutoRenderGate (47717)
 *   Nze/Mze/PO/jze → mermaid 复杂度度量助手 (47690–47716)
 *   NO  → isMermaidLanguage (47709) | eBe → codeHeaderDisplayKey (48553) | $ze → 语言显示名表 (48524)
 *   aBe/oBe/sBe/cBe → blockquote/ul/ol/li 渲染器 (48892/48903/48915/48927 / 44045…)
 *   MBe → MarkdownTableStickyScrollbar 表格+粘性横向滚动条+全屏预览 (49090，本文件仅接口+几何助手)
 *   NBe/PBe/FBe/IBe/LBe → thead/tbody/tr/th/td 渲染器 (49723–49744)
 *   Ik  → TableEdgeShadow (49744)
 *   vBe…Fk/jBe → 表格几何/序列化助手群（markdown/CSV 复制、粘性条几何）(48936–49089)
 *   dVe → MarkdownParagraphImageGallery  全图段落 → qk 画廊组 (50590)
 *   mVe → MarkdownImage  本地图片 readMediaPreview + 灯箱 Wk (50609)
 *   Gk/Kk → 图片缩略类名 (50115) | qk → ImageGalleryGroup (50117，接口) | Wk → ImageLightbox (49834，接口)
 *
 *  文件链接层：
 *   gA  → resolveWorkspaceFileLink    href → 工作区相对/绝对路径判定 (50539)
 *   hA  → parseFileHref               path[:line[:col]] / #L 解析 (50515)
 *   QBe/$Be/eVe → 行号后缀正则 (50455–50457) | tVe/nVe/rVe → file:// / Win 盘 / 系统根目录集 (50458–50466)
 *   dA/iVe/aVe/oVe/sVe/cVe/fA/pA/mA → 路径归一助手群 (50405–50466)
 *   MHe → buildFileLinkModel          pathKind=directory 判定 + relativePath (51478)
 *   NHe → openFileLinkInEditor          stat → pathKind → openInEditor (51490)
 *   RHe → FileLinkWithContextMenu       打开/第三方编辑器菜单 (51585)
 *   LHe → FileLinkButton                forwardRef 图标+label 按钮 (51568)
 *   IHe → ExternalLinkWithContextMenu   app-browser/external-browser 分流 (51509)
 *   FHe → isHttpUrl (51501) | nj/tHe → 链接类名 (51188–51189) | nHe → 标题类名表 (51190)
 *   kVe → isInAppBrowserUrl (50865)
 *   EA/DA/OA/kA → zcode-last-editor-id 记忆 (50846–50856)
 *   zA  → relativePathFromWorkspace (50967) | JA → resolveAvailableEditors (51052) | QA → useWorkspaceFileServices (51093，接口)
 *   $A/QVe → useRemoteWorkspaceInfo     tabs store → isRemoteWorkspace/remoteTarget (51198–51220)
 *
 *  Conversation 耦合点：
 *   hvt → AssistantMessageRow (memo)  cj 的消费方：streaming=row.state==='streaming'，children=row.text (112357)
 *   （Conversation.tsx 已重建该行；本文件导出其消费的 MarkdownRenderer 契约）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk / 横切层；本文件仅声明接口）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime                 react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. Streamdown (Pre) / DEFAULT_REHYPE_PLUGINS (Mre)
 *                                         chunk-BO2N2NFS（构建导出 r/o；MarkdownRenderer.tsx 已重建）
 *  3. visit (Ore)                         chunk-BO2N2NFS（构建导出 f；MarkdownVendored.tsx 已声明）
 *  4. cn (Z)                              utils-CEEH0K_K.js (t 导出)
 *  5. useIntlContext (G) → {intl, locale} IntlProvider-C321H7m8.js (n 导出)
 *  6. usePlatformService (l)              openExternal/getInstalledEditors/openInEditor
 *  7. useWorkspaceServices (ps)           fileService.readMediaPreview/stat
 *  8. logger (J)                          logger-PFDwl5Yq.js (t 导出)
 *  9. Button (X) / Tooltip (Ia)           button-laUijeDG.js / usageStatsUiParts-CiR7YEhh.js
 * 10. ContextMenu 原语 (yk/bk/xk/Sk/Ck)   本 chunk 48800 段（横切 X03）
 * 11. Dialog 原语 (zb/Hb/Ub/Gb/Kb/Bb)     横切原语
 * 12. 图标：M_ check / W_ copy / q_ external / mv mermaid / Tbe wrap /
 *     cv loader / zye image-off / f sparkle / wa chevron-right / Vc FileIcon / Fc folderIconSrc
 * 13. 文件元数据 zc（fileIconSrc/fileName）/ 编辑器目录 JA / 服务 QA / tabs store mc
 * 14. mermaid 本体 tO + 主题助手 Vze/Bze/zze/Hze（X10 库层）
 * 15. remark-math (sLe) / rehype-katex (XIe)（katex-fHRr5Rbn.js 懒加载分包）
 * 16. cjk micromark 扩展 (sIe/cIe)（@streamdown/cjk 宿主侧）
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/markdown/MarkdownIntegration.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  DEFAULT_CODE_PREVIEW_SETTINGS,
  resolveCodeBlockTheme,
  codeBlockScopeKey,
  resolveStreamdownMode,
  childrenToText,
  trimChildrenText,
  trimTrailingNewlines,
  languageFromClass,
  fnv1aLengthHash,
  collapseSeparatedImageBlocks,
  escapeStrayMathDollars,
  normalizeLanguageAlias,
  createShikiCodeHighlighterPlugin,
  SHIKI_CODE_HIGHLIGHTER,
  createCjkPlugin,
  CJK_PLUGIN,
  createMathPlugin,
  createMermaidPlugin,
  MERMAID_PLUGIN,
  STREAMDOWN_PLUGINS,
  LINK_SAFETY_DISABLED,
  STREAMDOWN_CONTROLS,
  baseName,
  parentDirectoryPath, // A1-R10 2b：sae（js 1932）转录于 components/markdown 同段，再导出供 FileTreePanel 695
  decodeUriSafe,
  normalizeRelativeSegments,
  joinWorkspacePath,
  parseFileHref,
  isAbsolutePath,
  resolveWorkspaceRelativePath, // 〔A1-P1-B15〕原 Jo（styles 1952 逐字；PlanToolBlocks qZ 链 + conversation/PreviewCards 收敛消费）
  resolveWorkspaceFileLink,
  buildFileHrefWithLine,
  isWorkspaceLikeHref,
  rehypeFileLinksPlugin,
  REHYPE_PLUGINS,
  MarkdownRenderErrorBoundary,
  relativePathFromWorkspace,
  buildFileLinkModel,
  openFileLinkInEditor,
  isHttpUrl,
  isInAppBrowserUrl,
  readLastUsedEditorId,
  rememberUsedEditorId,
  resolveRemoteWorkspaceInfo,
  useRemoteWorkspaceInfo,
  ExternalLinkWithContextMenu,
  FileLinkButton,
  FileLinkWithContextMenu,
  MarkdownHeading,
  MarkdownBlockquote,
  MarkdownUl,
  MarkdownOl,
  MarkdownLi,
  MarkdownThead,
  MarkdownTbody,
  MarkdownTr,
  MarkdownTh,
  MarkdownTd,
  collapseWhitespace,
  escapeMarkdownCell,
  escapeCsvCell,
  tableRowsToMarkdown,
  tableRowsToCsv,
  extractTableRows,
  tableLayoutRoot,
  tableLayoutInsets,
  measureRect,
  sameRect,
  chatDockHeight,
  backToBottomInset,
  findVerticalScroller,
  shouldShowStickyScrollbar,
  stickyScrollbarOffset,
  tableNeedsStickyScrollbar,
  stickyTrackGeometry,
  stickyThumbGeometry,
  stickyScrollMax,
  TableEdgeShadow,
  CodeBlockUiContext,
  CodeBlockFrame,
  isMermaidLanguage,
  isMermaidBlock,
  documentVisibilityState,
  mermaidComplexityMetrics,
  mermaidAutoRenderGate,
  useDocumentVisibilityTick,
  codeHeaderDisplayKey,
  ZCodeCodeBlockHeader,
  WrapLongLinesButton,
  MermaidOpenPreviewButton,
  CopyCodeButton,
  MermaidInlinePreview,
  ZCodeCodeBlock,
  IMAGE_THUMBNAIL_CLASS,
  IMAGE_INNER_CLASS, // 〔A1-P1-B15〕原 Kk（styles 50164；NodeReplBlocks Emt 消费收敛补 export）
  MarkdownImage,
  MarkdownParagraphWithImageGallery,
  MarkdownRenderer,
  renderAssistantRowMarkdown,
} from '../components/markdown/MarkdownIntegration';
export type {
  CodePreviewSettings,
  ShikiHighlightRequest,
  ParsedFileHref,
  MarkdownErrorBoundaryProps,
  FileLinkModel,
  HeadingLevel,
  MarkdownElementBaseProps,
  CodeBlockUiContextValue,
  MarkdownImageProps,
  MarkdownRendererProps,
  AssistantRowRenderContext,
} from '../components/markdown/MarkdownIntegration';
