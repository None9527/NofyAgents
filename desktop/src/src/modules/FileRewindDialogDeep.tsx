/* eslint-disable */
/**
 * ============================================================================
 * FileRewindDialogDeep.tsx — F14 MO 代码查看器深部 + F03 FileRewindDialog 深部
 * （B5-06 批次 · C+D 段 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本机实测 213,979 行，未改动，只读）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，170,400 行）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：B5-FULL-DECODE-PLAN 批次表 #6 C/D 段；MarkdownIntegration.report §8（MO 47501–47660）；
 *       Conversation.report §5/§7（v_t/__t/p1/yg 散段）。
 *
 * 行号口径：本文件行号一律为**本机实测行**（js 行 / jsx 行）。旧登记使用的 213,695 行版
 * 口径与本文件存在 **+48 行偏移**（MO 旧登记 47501 → 实测 47549；b_t 旧登记 110632 →
 * 实测 110680）。换算在报告 PreviewTreeRewind.report.md §1 逐锚点列出。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：实测 js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  [C] MO 代码查看器深部（实测 47354–47712；任务口径 47501–47660 → 实测 47549–47708；
 *      依赖簇 47354–47548 为 MO 自洽纳入，内部裁决见报告 §3.3）：
 *   cze  → resolveColorScheme            (47354 / 42631)
 *   lze  → assignRef                     (47363 / 42634)
 *   uze  → CODE_COMMENT_DEFAULT_LABELS   (47372 / 42643)
 *   dze  → CODE_COMMENT_GUTTER_CSS       (47382 / 42643，同 var)
 *   fze  → cssVarJsonEscape              (47390 / 42654)
 *   pze  → hashStringBase36              (47393 / 42657)
 *   mze  → navigatorFingerprint          (47398 / 42662)
 *   hze  → isSubmitCommentShortcut       (47403 / 42668)
 *   gze  → isEscapeKey                   (47406 / 42671)
 *   _ze  → submitShortcutLabel           (47409 / 42674)
 *   vze  → cancelShortcutLabel           (47412 / 42677)
 *   DO   → setUtilityButtonTitles         (47415 / 42680)
 *   OO   → walkShadowRoots               (47419 / 42683)
 *   yze  → buildCodeViewerFileSource     (47422 / 42686)
 *   kO   → normalizeLineRange            (47433 / 42697)
 *   AO   → selectionToLineRange          (47436 / 42703)
 *   bze  → rangeToRelativeLines          (47439 / 42709)
 *   xze  → extractRangeText              (47443 / 42716)
 *   jO   → formatCommentRangeLabel       (47454 / 42725)
 *   Sze  → CodeCommentComposer           (47462 / 42729)
 *   Cze  → CodeCommentCard               (47518 / 42766)
 *   MO   → CodeViewerWithComments        (47549 / 42773)
 *   NO   → isMermaidLanguage             (47709 / 42910)
 *  [D] FileRewindDialog 深部（实测 110410–110634；旧登记 110362–110586）：
 *   __t  → buildFilePreviewSource        (110410 / 94426)
 *   v_t  → FileOpenWithMenu              (110427 / 94447)
 *
 * ----------------------------------------------------------------------------
 * 二、边界与双归属注记
 * ----------------------------------------------------------------------------
 *  1. C 段任务口径（旧 47501–47660 → 实测 47549–47708）= MO 主体；依赖簇
 *     47354–47548（cze…Cze）数值在其前，为 MO 自洽纳入（报告 §3.3 裁决）。
 *  2. oze（47343）= 暗色主题探测，横切层，接口级声明（不重复转录）。
 *  3. D 段 p1（openFileChangeInViewer，110841）/ yg（toWorkspaceRelativePath，23765）
 *     已由 GitReview.tsx 逐字重建，本文件仅接口级声明并注记（不重复）；
 *     b_t（FileRewindDialog，110680）/ f1（RewindDialogFileList，110647）/
 *     y_t（formatRewindSkipReason，110635）/ x_t（buildUnifiedPatch，110833）
 *     同归 GitReview.tsx，排除只注记。
 *  4. v_t 消费的 QA（useFileContextActions，51141）/ JA（resolveAvailableEditors，51100）
 *     由本批 FileTreePanel.tsx 重建；$A/zA/OA/kA 由 MarkdownIntegration.tsx 重建；
 *     本文件均以 declare 挂接。
 * ============================================================================
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk / 已在它文件还原者，此处声明接口）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime；2. cn (Z)；3. useIntlContext (G)；4. logger (J)；
 *  5. usePlatform (l：getInstalledEditors/openInEditor/openExternal)；
 *  6. Textarea (j，imeComposition)；7. Button (X)；
 *  8. 暗色探测 oze（47343）；9. 键盘助手 $i/Lre（keyboardShortcuts-BGHopxr9.js）；
 *  10. vendored diff 组件 $Re（X09，DiffViewer）；
 *  11. FileTreePanel.tsx 已重建件：useFileContextActions (QA)、resolveAvailableEditors (JA)；
 *  12. MarkdownIntegration.tsx 已重建件：useRemoteWorkspaceInfo ($A)、
 *      relativePathFromWorkspace (zA)、getLastEditorId (OA)、setLastEditorId (kA)；
 *  13. GitReview.tsx 已重建件：openFileChangeInViewer (p1)、toWorkspaceRelativePath (yg)；
 *  14. DropdownMenu 族 (VO/HO/UO/WO/YO，X03 双归属接口挂接)；
 *  15. 图标：Kv trash / N_ chevron-down / q_ open-external / W_ copy。
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/modals/FileRewindDialogDeep.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  buildFilePreviewSource,
  FileOpenWithMenu,
} from '../components/modals/FileRewindDialogDeep';
