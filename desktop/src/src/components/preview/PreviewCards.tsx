// A0-S4-4c: 自 modules/PreviewCards.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/preview/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
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
 *   Uze  → MIN_DIAGRAM_ZOOM            (48114)
 *   ek   → clampDiagramZoom            (48115)
 *   tk   → zoomDiagramAt               (48118)
 *   nk   → panDiagram                  (48125)
 *   Wze  → fitDiagramToViewport        (48128)
 *   rk   → IDENTITY_DIAGRAM_TRANSFORM  (48143)
 *   Gze  → DIAGRAM_ZOOM_PRESETS        (48144)
 *   Kze  → SVG_RENDERED_SELECTOR       (48145)
 *   qze  → SVG_NON_RENDERED_SELECTOR   (48158)
 *   ik   → pointerCenter               (48173)
 *   ak   → pointerDistance             (48179)
 *   Jze  → isInvisiblePaint            (48183)
 *   ok   → svgRootBounds               (48187)
 *   sk   → applySvgRootBounds          (48196)
 *   ck   → serializeRect               (48209)
 *   Yze  → svgBBox                     (48214)
 *   Xze  → unionBounds                 (48222)
 *   Zze  → isBackgroundRect            (48229)
 *   lk   → measureSvgContentBounds     (48244)
 *   uk   → toViewportLocalPoint        (48265)
 *   Qze  → MermaidFullscreenDialog     (48269)
 *   dk   → DiagramToolbarButton        (48558)
 *  [Table] MBe 粘性滚动条全量（实测 49138–49770；旧登记 49090–49722）：
 *   MBe  → MarkdownTableStickyScrollbar (49138)
 *   Lk   → TableToolbarButton          (49758)
 *  [Image] Wk 画廊 / 灯箱族（实测 49801–50176；旧登记 49753–50128）：
 *   Rk   → ORIGIN_POINT                (49801)
 *   zk   → LIGHTBOX_DOWNLOAD_MAX_BYTES (49802)
 *   RBe  → MIME_TO_DOWNLOAD_EXTENSION  (49803)
 *   zBe  → clampPanOffset              (49811)
 *   Bk   → downloadBaseName            (49819)
 *   Vk   → LightboxDownloadError       (49828)
 *   Hk   → isHttpDownloadSource        (49833)
 *   Uk   → summarizeDownloadSource     (49836)
 *   BBe  → downloadBlobWithSizeLimit   (49845)
 *   VBe  → openUrlInNewTab             (49873)
 *   Wk   → ImageLightbox               (49882)
 *   qk   → ImageGalleryGroup           (50165)
 *  [ToolPreview] 工具预览源构建族（实测 50177–50420；旧登记 50129–50372）：
 *   HBe  → TOOL_PREVIEW_TEXT_LIMIT     (50177)
 *   Jk   → EXTENSION_LANGUAGE_MAP      (50178)
 *   UBe  → EXTENSION_IMAGE_MIME_MAP    (50212)
 *   WBe  → isPlainObject               (50224)
 *   Yk   → resolvePreviewTitle         (50227)
 *   Xk   → pickStringField             (50230)
 *   Zk   → looksLikeUnifiedDiff        (50237)
 *   Qk   → extractPatchText            (50240)
 *   $k   → extractContentText          (50245)
 *   eA   → extractPathField            (50250)
 *   tA   → buildTextPreview            (50263)
 *   nA   → resolvePreviewPath          (50266)
 *   rA   → detectPreviewLanguage       (50271)
 *   iA   → imageMimeTypeOfPath         (50283)
 *   aA   → isImagePath                 (50289)
 *   oA   → isPdfPreviewPath            (50292)
 *   sA   → isPptxPreviewPath           (50295)
 *   cA   → isUsablePreviewPath         (50298)
 *   GBe  → unquoteDiffPath             (50302)
 *   lA   → stripDiffSidePrefix         (50306)
 *   uA   → parseDiffSidePath           (50310)
 *   KBe  → parseDiffGitHeaderPath      (50320)
 *   qBe  → extractDiffTargetPath       (50329)
 *   JBe  → resolvePatchPath            (50345)
 *   YBe  → buildDiffPreviewSource      (50348)
 *   XBe  → buildToolPreviewSource      (50367)
 *   ZBe  → buildToolContentPreview     (50401)
 *  [Micro] 预览卡群微件（实测 51221–51233；旧登记 51173–51185）：
 *   ej   → InlineActionRow             (51221)
 *   tj   → InlineIconButton            (51223)
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
 *      buildUnifiedDiffText (Kh)——六名全改指 ../conversation/ToolCallClassification 真实 import〔A1-P1-B18/B19〕；
 *  15. 路径助手（横切 1925–1975）：baseName (Go)、isAbsolutePath (Ko)、
 *      resolvePathAgainst (Jo)、decodeUriSafe (qo)。
 * ============================================================================
 */

import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Copy as IconCopy, Download as IconDownload, X as IconClose, ArrowLeft as IconPrevious, ArrowRight as IconNext, ChevronDown as IconChevronDown } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Button, ZoomOut as IconZoomOut, ZoomIn as IconZoomIn } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk；A0-S3b 增补：ZoomOut as IconZoomOut, ZoomIn as IconZoomIn（button chunk 图标，pass-1 同源）
import { Textarea, toast, usePlatform } from '../../modules/ImeComposition';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：Dialog 族 declare → components/ui/dialog（bundle zb/Hb/Ub/Gb/Kb/Vb）
import { TableEdgeShadow, IMAGE_THUMBNAIL_CLASS, backToBottomInset, baseName, chatDockHeight, decodeUriSafe, extractTableRows, findVerticalScroller, isAbsolutePath, measureRect, resolveWorkspaceRelativePath as resolvePathAgainst, sameRect, shouldShowStickyScrollbar, stickyScrollMax, stickyScrollbarOffset, stickyThumbGeometry, stickyTrackGeometry, tableLayoutInsets, tableLayoutRoot, tableNeedsStickyScrollbar, tableRowsToCsv, tableRowsToMarkdown } from '../../modules/MarkdownIntegration'; // 新增项原 Gk/EBe/qo/Pk/Ko/Ak/jk/Nk/TBe/kk
import { t as logger } from '../../modules/logger'; // 原 J（logger-PFDwl5Yq.js 导出 t）
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js 导出 cn；SrcSharedB 单字母别名为跨块碰撞）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // 原 Ia（first-party 信息浮层件，调用面仅 title/side）
import { classifyToolCall, toolContentFamilyOf, toolEditFamilyOf, parseToolRawPayload, extractBeforeAfterEdit, buildUnifiedDiffText } from '../conversation/ToolCallClassification'; // 原 og（styles 23132）：A1-P1-B18 实体化收敛（工具分类域）；〔A1-P1-B19〕余件五 declare 全闭改指：cg@23193/sg@23187/Bh@22682/Rh@22666 转录并入 + Kh@22830 既有实体

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/


interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape };



interface PlatformService {
  saveFile?(args: {
    sourceUrl?: string;
    suggestedName?: string;
    data?: ArrayBuffer;
  }): Promise<{ canceled: boolean; success: boolean; path?: string; error?: string }>;
  [key: string]: unknown;
}

/* ── tombstone（A0-CLEANUP 族清理）：Button（原 X）declare 删除 → import { Button } from './button'。 ── */

/** 原 j：Textarea（imeComposition chunk） */

/** 原 Ia：Tooltip（usageStatsUiParts chunk；side/align/sideOffset/triggerClassName 按消费面） */

/* 原 zb/Hb/Ub/Gb/Kb/Vb：Dialog 原语族（showCloseButton 按 Wk/Qze 消费面） */
/* ── tombstone（A0-S3c）：Dialog 族 declare 删除 → import from '../components/ui/dialog'；调用面逐字不变。 ── */

/* 原 VO/HO/UO/WO/YO：DropdownMenu 原语族（X03 双归属，接口挂接） */
/* ── tombstone（A0-S3c）：DropdownMenu、DropdownMenuContent、DropdownMenuItem、DropdownMenuSeparator、DropdownMenuTrigger declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */





/* 图标族（lucide 封装，登记见 VENDOR-MANIFEST） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：IconCopy/IconDownload → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconTablePreview: React.FC<{ className?: string }>; // mv
declare const IconCollapseScrollMode: React.FC<{ className?: string }>; // $ve
declare const IconExpandScrollMode: React.FC<{ className?: string }>; // tye
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（5）：IconClose/IconPrevious/IconNext/IconZoomOut/IconZoomIn → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconMermaidZoomOut: React.FC<{ className?: string }>; // hye
declare const IconMermaidZoomIn: React.FC<{ className?: string }>; // L_
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconChevronDown → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* MarkdownIntegration.tsx 已重建件（接口挂接） */
/* 原 kk/TBe/Ak/jk/Nk/EBe/Pk/Gk：表格粘性条助手族 —— 已接线 MarkdownIntegration 真实导出 */

/* 工具身份族（Conversation 域，js 22666–23193；Conversation.tsx 已声明 og） */
interface ToolCallLike {
  toolName?: string;
  kind?: string;
  title?: string;
  input?: unknown;
  output?: unknown;
  raw?: unknown;
  [key: string]: unknown;
}
interface ToolIdentity {
  family: string;
  [key: string]: unknown;
}
/* ── tombstone〔A1-P1-B18〕：classifyToolCall declare（原 og）删除——逐字实体化 →
 * ../conversation/ToolCallClassification（styles og@23132–23186；roundtrip EXACT，/tmp/a1r0-p1-b18/）。
 * canonical 返回面 = og 全形 { toolName, family, source, isLegacy }，对本面 ToolIdentity
 * { family: string; [key: string]: unknown } 结构兼容〔A1-P1-B18〕。消费面改文件头真实 import，
 * 调用面（2185/2221）逐字不变。 ── */
/* ── tombstone〔A1-P1-B19〕：工具身份族余件 5 declare 删除——全闭改指 ../conversation/ToolCallClassification：
 * cg toolContentFamilyOf@styles 23193 / sg toolEditFamilyOf@styles 23187 / Bh parseToolRawPayload@styles 22682 /
 * Rh extractBeforeAfterEdit@styles 22666 逐字转录并入该 canonical（B18 区段切分段闭合，域吻合裁定）；
 * Kh buildUnifiedDiffText@styles 22830 改指 B18 既有实体。返回面核对〔A1-P1-B19〕：bundle Kh 恒返回 string
 * （`a ? Dme(S,o) : S` 双支均 string，Dme@22573 恒返回 string），原 declare 面 string|null 为宽化，本面消费
 * 仅真值判（2195/2203），string 子型直接接通，无投射缝。ToolIdentity 型脚手架保留（B18 墓碑引用在案，
 * canonical 参缝 : any 结构兼容）。消费面改文件头真实 import，调用点（2187/2191/2193/2195/2201/2203/2223/
 * 2227/2229/2232）逐字不变。 ── */

/* ── tombstone〔A1-P1-B15〕：declare resolvePathAgainst（原 Jo）删除——束真身 Jo@1952 已逐字转录为
 * modules/MarkdownIntegration resolveWorkspaceRelativePath（Go/sae/qo/Ko 同连续段 1928–1957，落点随段判例
 * A1-R10 2b）。消费面（2005 图像 src 解析）逐字不变，经下方 import 别名改指。 ── */

/* ============================================================================
 * 1. Qze 深部 —— Mermaid 全屏对话框的缩放/平移几何模型（原 48114–48268）
 * ==========================================================================*/

/** 原 Uze（js 48114 / jsx 43290） */
const MIN_DIAGRAM_ZOOM = 0.25;

/** 原 ek：缩放钳制（有限数 → [0.25, 4]，否则 1） */
export function clampDiagramZoom(scale: number): number {
  return Number.isFinite(scale) ? Math.min(4, Math.max(MIN_DIAGRAM_ZOOM, scale)) : 1;
}

/** 原 tk：以视点 t 为锚点缩放到 n */
export function zoomDiagramAt(
  transform: DiagramTransform,
  point: { x: number; y: number },
  nextScale: number,
): DiagramTransform {
  const currentScale = clampDiagramZoom(transform.scale);
  const clampedScale = clampDiagramZoom(nextScale);
  const contentX = (point.x - transform.translateX) / currentScale;
  const contentY = (point.y - transform.translateY) / currentScale;
  return { scale: clampedScale, translateX: point.x - contentX * clampedScale, translateY: point.y - contentY * clampedScale };
}

/** 原 nk：平移叠加 */
export function panDiagram(transform: DiagramTransform, delta: { x: number; y: number }): DiagramTransform {
  return { ...transform, translateX: transform.translateX + delta.x, translateY: transform.translateY + delta.y };
}

export interface DiagramTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

/** 原 Wze：图表内容 → 视口适配变换（32px 内缩；退化尺寸 → 恒等） */
export function fitDiagramToViewport({
  diagramX: x = 0,
  diagramY: y = 0,
  diagramHeight: height,
  diagramWidth: width,
  padding: padding = 32,
  viewportHeight: viewportHeight,
  viewportWidth: viewportWidth,
}: {
  diagramX?: number;
  diagramY?: number;
  diagramHeight: number;
  diagramWidth: number;
  padding?: number;
  viewportHeight: number;
  viewportWidth: number;
}): DiagramTransform {
  if (width <= 0 || height <= 0 || viewportWidth <= 0 || viewportHeight <= 0) return { scale: 1, translateX: 0, translateY: 0 };
  const availableWidth = Math.max(1, viewportWidth - padding * 2);
  const availableHeight = Math.max(1, viewportHeight - padding * 2);
  const scale = clampDiagramZoom(Math.min(availableWidth / width, availableHeight / height));
  return { scale, translateX: (viewportWidth - width * scale) / 2 - x * scale, translateY: (viewportHeight - height * scale) / 2 - y * scale };
}

/** 原 rk（js 48143 / jsx 43335） */
const IDENTITY_DIAGRAM_TRANSFORM: DiagramTransform = { scale: 1, translateX: 0, translateY: 0 };

/** 原 Gze */
const DIAGRAM_ZOOM_PRESETS = [0.5, 1, 2];

/** 原 Kze：参与内容度量的 SVG 元素 */
const SVG_RENDERED_SELECTOR = [
  `circle`,
  `ellipse`,
  `foreignObject`,
  `g`,
  `image`,
  `line`,
  `path`,
  `polygon`,
  `polyline`,
  `rect`,
  `text`,
  `use`,
].join(`,`);

/** 原 qze：非渲染结构元素（排除在内容度量外） */
const SVG_NON_RENDERED_SELECTOR = [
  `clipPath`,
  `defs`,
  `linearGradient`,
  `marker`,
  `mask`,
  `metadata`,
  `pattern`,
  `radialGradient`,
  `script`,
  `style`,
  `symbol`,
  `title`,
].join(`,`);

/** 原 ik：双指中心 */
function pointerCenter(pointers: PointerEvent[]): { x: number; y: number } {
  const [first, second] = pointers;
  return !first || !second
    ? { x: first?.clientX ?? 0, y: first?.clientY ?? 0 }
    : { x: (first.clientX + second.clientX) / 2, y: (first.clientY + second.clientY) / 2 };
}

/** 原 ak：双指距离 */
function pointerDistance(pointers: PointerEvent[]): number {
  const [first, second] = pointers;
  return !first || !second ? 0 : Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

/** 原 Jze：透明/无描边判定（背景矩形识别用） */
function isInvisiblePaint(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized.length === 0 || normalized === `none` || normalized === `transparent` || normalized === `rgba(0, 0, 0, 0)`;
}

interface Bounds {
  height: number;
  width: number;
  x?: number;
  y?: number;
}

/** 原 ok：svg 根边界（viewBox → width/height 属性 → client 尺寸 三级回退） */
function svgRootBounds(svg: SVGSVGElement): Bounds {
  const viewBox = svg.viewBox.baseVal;
  if (viewBox.width > 0 && viewBox.height > 0) return { height: viewBox.height, width: viewBox.width, x: viewBox.x, y: viewBox.y };
  const widthValue = svg.width.baseVal.value;
  const heightValue = svg.height.baseVal.value;
  return widthValue > 0 && heightValue > 0
    ? { height: heightValue, width: widthValue }
    : { height: svg.clientHeight, width: svg.clientWidth };
}

/** 原 sk：把根边界固化到容器样式（内容 100% 填充），返回边界 */
function applySvgRootBounds(content: HTMLElement, svg: SVGSVGElement): Bounds {
  const bounds = svgRootBounds(svg);
  return (
    bounds.width > 0 &&
      bounds.height > 0 &&
      ((content.style.width = `${bounds.width}px`),
      (content.style.height = `${bounds.height}px`),
      (svg.style.width = `100%`),
      (svg.style.height = `100%`),
      (svg.style.maxWidth = `none`)),
    bounds
  );
}

/** 原 ck：rect 序列化（日志用） */
function serializeRect(element: Element | null): { height: number; width: number; x: number; y: number } | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { height: rect.height, width: rect.width, x: rect.x, y: rect.y };
}

/** 原 Yze：getBBox 安全版 */
function svgBBox(svg: SVGSVGElement): { height: number; width: number; x: number; y: number } | null {
  try {
    const box = svg.getBBox();
    return { height: box.height, width: box.width, x: box.x, y: box.y };
  } catch {
    return null;
  }
}

/** 原 Xze：边界并集 */
function unionBounds(accumulated: Bounds | null, next: Bounds): Bounds {
  if (!accumulated) return { height: next.height, width: next.width, x: next.x, y: next.y };
  const minX = Math.min(accumulated.x ?? 0, next.x ?? 0);
  const minY = Math.min(accumulated.y ?? 0, next.y ?? 0);
  const maxX = Math.max((accumulated.x ?? 0) + accumulated.width, (next.x ?? 0) + next.width);
  return { height: Math.max((accumulated.y ?? 0) + accumulated.height, (next.y ?? 0) + next.height) - minY, width: maxX - minX, x: minX, y: minY };
}

/** 原 Zze：与根边界重合的 rect（背景板）⇒ 排除 */
function isBackgroundRect(element: SVGGraphicsElement, box: DOMRect, rootBounds: Bounds): boolean {
  if (element.tagName.toLowerCase() !== `rect` || rootBounds.width <= 0 || rootBounds.height <= 0) return false;
  const style = getComputedStyle(element);
  const className =
    typeof element.className == `object` && `baseVal` in element.className
      ? element.className.baseVal
      : String(element.className ?? ``);
  return (
    Math.abs(box.x - (rootBounds.x ?? 0)) <= 1 &&
    Math.abs(box.y - (rootBounds.y ?? 0)) <= 1 &&
    box.width >= rootBounds.width * 0.95 &&
    box.height >= rootBounds.height * 0.95 &&
    (isInvisiblePaint(style.stroke) || className.includes(`background`))
  );
}

/** 原 lk：svg 内容真实边界（逐可见元素 getBBox 并集；背景 rect/隐藏元素剔除；回退根边界） */
function measureSvgContentBounds(svg: SVGSVGElement | null): Bounds {
  if (!svg) return { height: 0, width: 0 };
  const rootBounds = svgRootBounds(svg);
  let accumulated: Bounds | null = null;
  for (const candidate of svg.querySelectorAll(SVG_RENDERED_SELECTOR)) {
    if (!(candidate instanceof SVGGraphicsElement) || candidate.closest(SVG_NON_RENDERED_SELECTOR)) continue;
    const style = getComputedStyle(candidate);
    if (!(style.display === `none` || style.visibility === `hidden` || Number(style.opacity) === 0))
      try {
        const box = candidate.getBBox();
        if (box.width <= 0 || box.height <= 0 || isBackgroundRect(candidate, box, rootBounds)) continue;
        accumulated = unionBounds(accumulated, box);
      } catch {}
  }
  if (accumulated && accumulated.width > 0 && accumulated.height > 0) return accumulated;
  try {
    const box = svg.getBBox();
    if (box.width > 0 && box.height > 0) return { height: box.height, width: box.width, x: box.x, y: box.y };
  } catch {}
  return rootBounds;
}

/** 原 uk：client 坐标 → 视口局部坐标 */
function toViewportLocalPoint(viewport: HTMLElement, clientX: number, clientY: number): { x: number; y: number } {
  const rect = viewport.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

/* ============================================================================
 * 2. Qze —— MermaidFullscreenDialog（原 48269–48557 / jsx 43464）
 * ----------------------------------------------------------------------------
 * 结构：Dialog（100dvh/86vh 双档）+ 顶部工具条（标题 + 缩小/缩放下拉/放大/关闭）+
 *   手势画布（wheel：ctrl=缩放 否则平移；单指拖拽；双指捏合缩放）+
 *   dangerouslySetInnerHTML 注入 svg（origin-top-left 变换）。
 * 打开即 requestAnimationFrame 度量并适配（p），resize 复测；键盘 +/- 缩放（1.18/0.85）。
 * ==========================================================================*/

export interface MermaidFullscreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  svg: string;
  title: string;
}

export function MermaidFullscreenDialog({ open, onOpenChange, svg, title }: MermaidFullscreenDialogProps) {
  const { intl } = useIntlContext();
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const activePointersRef = React.useRef(new Map<number, PointerEvent>());
  const dragStateRef = React.useRef<{ point: { x: number; y: number }; transform: DiagramTransform } | null>(null);
  const pinchStateRef = React.useRef<{ center: { x: number; y: number }; distance: number; transform: DiagramTransform } | null>(null);
  const [transform, setTransform] = React.useState<DiagramTransform>(IDENTITY_DIAGRAM_TRANSFORM);

  /** 原 p：度量内容并适配视口（含一次诊断日志） */
  const measureAndFit = React.useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const svgElement = content?.querySelector(`svg`);
    if (!viewport || !content || !(svgElement instanceof SVGSVGElement)) {
      setTransform(IDENTITY_DIAGRAM_TRANSFORM);
      return;
    }
    const rootBounds = applySvgRootBounds(content, svgElement);
    const contentBounds = measureSvgContentBounds(svgElement);
    const viewportRect = viewport.getBoundingClientRect();
    const fitted = fitDiagramToViewport({
      diagramHeight: contentBounds.height,
      diagramWidth: contentBounds.width,
      diagramX: (contentBounds.x ?? 0) - (rootBounds.x ?? 0),
      diagramY: (contentBounds.y ?? 0) - (rootBounds.y ?? 0),
      viewportHeight: viewportRect.height,
      viewportWidth: viewportRect.width,
    });
    const viewBox = svgElement.viewBox.baseVal;
    const computedStyle = getComputedStyle(svgElement);
    (logger.info(`[DiagramPreviewDialog] preview layout measured`, {
      content: { rect: serializeRect(content), transform: content.style.transform },
      dialog: { rect: serializeRect(dialogRef.current) },
      fit: { bounds: contentBounds, rootBounds: rootBounds, transform: fitted },
      svg: {
        attributes: {
          height: svgElement.getAttribute(`height`),
          style: svgElement.getAttribute(`style`),
          viewBox: svgElement.getAttribute(`viewBox`),
          width: svgElement.getAttribute(`width`),
        },
        bbox: svgBBox(svgElement),
        client: { height: svgElement.clientHeight, width: svgElement.clientWidth },
        computedStyle: {
          height: computedStyle.height,
          maxHeight: computedStyle.maxHeight,
          maxWidth: computedStyle.maxWidth,
          width: computedStyle.width,
        },
        rect: serializeRect(svgElement),
        rootBounds: svgRootBounds(svgElement),
        viewBox: { height: viewBox.height, width: viewBox.width, x: viewBox.x, y: viewBox.y },
      },
      transform: fitted,
      viewport: { rect: serializeRect(viewport) },
    }),
      setTransform(fitted));
  }, []);

  /** 原 m：相对视口中心乘性缩放 */
  const zoomByFactor = React.useCallback((factor: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const center = { x: rect.width / 2, y: rect.height / 2 };
    setTransform((current) => zoomDiagramAt(current, center, current.scale * factor));
  }, []);

  /** 原 h：相对视口中心绝对缩放 */
  const zoomToScale = React.useCallback((scale: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const center = { x: rect.width / 2, y: rect.height / 2 };
    setTransform((current) => zoomDiagramAt(current, center, scale));
  }, []);

  /** 原 _：1:1 居中（不适配） */
  const resetZoom = React.useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const svgElement = content?.querySelector(`svg`);
    if (!viewport || !content || !(svgElement instanceof SVGSVGElement)) {
      setTransform(IDENTITY_DIAGRAM_TRANSFORM);
      return;
    }
    const rootBounds = applySvgRootBounds(content, svgElement);
    const contentBounds = measureSvgContentBounds(svgElement);
    const viewportRect = viewport.getBoundingClientRect();
    setTransform({
      scale: 1,
      translateX: (viewportRect.width - contentBounds.width) / 2 - ((contentBounds.x ?? 0) - (rootBounds.x ?? 0)),
      translateY: (viewportRect.height - contentBounds.height) / 2 - ((contentBounds.y ?? 0) - (rootBounds.y ?? 0)),
    });
  }, []);

  (React.useEffect(() => {
    if (!open) {
      (activePointersRef.current.clear(), (dragStateRef.current = null), (pinchStateRef.current = null));
      return;
    }
    const frame = window.requestAnimationFrame(measureAndFit);
    return () => window.cancelAnimationFrame(frame);
  }, [measureAndFit, open, svg]),
    React.useEffect(() => {
      if (!open) return;
      const handleResize = () => measureAndFit();
      return (window.addEventListener(`resize`, handleResize), () => window.removeEventListener(`resize`, handleResize));
    }, [measureAndFit, open]),
    React.useEffect(() => {
      if (!open) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!event.defaultPrevented) {
          if (event.key === `+` || event.key === `=`) {
            (event.preventDefault(), zoomByFactor(1.18));
            return;
          }
          if (event.key === `-`) {
            (event.preventDefault(), zoomByFactor(0.85));
            return;
          }
        }
      };
      return (
        window.addEventListener(`keydown`, handleKeyDown),
        () => window.removeEventListener(`keydown`, handleKeyDown)
      );
    }, [open, zoomByFactor]));

  /** 原 v：wheel —— ctrl 缩放（指数 -deltaY*0.01），否则平移 */
  const handleWheel = React.useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const viewport = viewportRef.current;
    if (viewport) {
      if (event.ctrlKey) {
        const point = toViewportLocalPoint(viewport, event.clientX, event.clientY);
        const factor = Math.exp(-event.deltaY * 0.01);
        setTransform((current) => zoomDiagramAt(current, point, current.scale * factor));
        return;
      }
      setTransform((current) => panDiagram(current, { x: -event.deltaX, y: -event.deltaY }));
    }
  }, []);

  /** 原 y：pointerdown —— 单指记拖拽锚点，双指记捏合基准 */
  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      (event.currentTarget.setPointerCapture(event.pointerId), activePointersRef.current.set(event.pointerId, event.nativeEvent));
      const pointers = Array.from(activePointersRef.current.values());
      if (pointers.length >= 2) {
        ((pinchStateRef.current = { center: pointerCenter(pointers), distance: pointerDistance(pointers), transform: transform }), (dragStateRef.current = null));
        return;
      }
      dragStateRef.current = { point: toViewportLocalPoint(viewport, event.clientX, event.clientY), transform: transform };
    },
    [transform],
  );

  /** 原 b：pointermove —— 双指捏合（锚点缩放+平移合成），单指拖拽 */
  const handlePointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport || !activePointersRef.current.has(event.pointerId)) return;
    activePointersRef.current.set(event.pointerId, event.nativeEvent);
    const pointers = Array.from(activePointersRef.current.values());
    if (pointers.length >= 2 && pinchStateRef.current) {
      const center = pointerCenter(pointers);
      const distance = pointerDistance(pointers);
      const pinch = pinchStateRef.current;
      const anchor = toViewportLocalPoint(viewport, center.x, center.y);
      const centerDelta = { x: center.x - pinch.center.x, y: center.y - pinch.center.y };
      const nextScale = pinch.transform.scale * (pinch.distance > 0 ? distance / pinch.distance : 1);
      setTransform(panDiagram(zoomDiagramAt(pinch.transform, anchor, nextScale), centerDelta));
      return;
    }
    if (dragStateRef.current) {
      const point = toViewportLocalPoint(viewport, event.clientX, event.clientY);
      setTransform(panDiagram(dragStateRef.current.transform, { x: point.x - dragStateRef.current.point.x, y: point.y - dragStateRef.current.point.y }));
    }
  }, []);

  /** 原 x：pointerup/cancel */
  const handlePointerUp = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    (activePointersRef.current.delete(event.pointerId), (dragStateRef.current = null), (pinchStateRef.current = null));
  }, []);

  const contentStyle = React.useMemo(
    () => ({ transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})` }),
    [transform],
  );
  const zoomPercent = Math.round(transform.scale * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex h-[100dvh] max-h-[100dvh] w-screen max-w-none grid-rows-none flex-col gap-0 rounded-2xl border-0 p-0 sm:h-[86vh] sm:max-h-[86vh] sm:w-[90vw] sm:border sm:border-popover-border`}
        ref={dialogRef}
        showCloseButton={false}
      >
        <DialogTitle className={`sr-only`}>{title}</DialogTitle>
        <DialogDescription className={`sr-only`}>
          {intl.formatMessage({ id: `codeBlock.mermaid.previewDescription` })}
        </DialogDescription>
        <div className={`flex h-12 shrink-0 items-center justify-between gap-2 border-border border-b px-3`}>
          <div className={`min-w-0 truncate text-ui-base font-medium text-foreground`}>{title}</div>
          <div className={`flex shrink-0 items-center gap-1`}>
            <DiagramToolbarButton
              label={intl.formatMessage({ id: `codeBlock.mermaid.zoomOut` })}
              onClick={() => zoomByFactor(0.85)}
            >
              <IconMermaidZoomOut className={`size-3.5`} />
            </DiagramToolbarButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={intl.formatMessage({ id: `codeBlock.mermaid.zoomLevel` })}
                  className={`min-w-14 gap-1 px-1.5 font-mono text-foreground-subtle`}
                  size={`sm`}
                  type="button"
                  variant={`ghost`}
                >
                  <span>{zoomPercent}%</span>
                  <IconChevronDown className={`size-3 text-foreground-subtlest`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={`center`} className={`min-w-36`}>
                {DIAGRAM_ZOOM_PRESETS.map((preset) => {
                  const percent = Math.round(preset * 100);
                  return (
                    <DropdownMenuItem key={percent} onSelect={() => zoomToScale(preset)}>
                      {intl.formatMessage({ id: `codeBlock.mermaid.zoomToPercent` }, { percent: String(percent) })}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={measureAndFit}>
                  {intl.formatMessage({ id: `codeBlock.mermaid.zoomToFit` })}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={resetZoom}>
                  {intl.formatMessage({ id: `codeBlock.mermaid.resetZoom` })}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DiagramToolbarButton
              label={intl.formatMessage({ id: `codeBlock.mermaid.zoomIn` })}
              onClick={() => zoomByFactor(1.18)}
            >
              <IconMermaidZoomIn className={`size-3.5`} />
            </DiagramToolbarButton>
            <DiagramToolbarButton
              label={intl.formatMessage({ id: `codeBlock.mermaid.close` })}
              onClick={() => onOpenChange(false)}
            >
              <IconClose className={`size-3.5`} />
            </DiagramToolbarButton>
          </div>
        </div>
        <div
          ref={viewportRef}
          className={cn(
            `relative min-h-0 flex-1 touch-none overflow-hidden bg-popover`,
            `cursor-grab active:cursor-grabbing`,
          )}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
        >
          <div
            ref={contentRef}
            aria-label={title}
            className={`absolute top-0 left-0 origin-top-left select-none [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-none`}
            dangerouslySetInnerHTML={{ __html: svg }}
            role={`img`}
            style={contentStyle}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** 原 dk（js 48558 / jsx 43723）：图表工具条按钮（Tooltip side=bottom） */
export function DiagramToolbarButton({ children, label, onClick }: { children?: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Tooltip title={label} side={`bottom`}>
      <Button aria-label={label} onClick={onClick} size={`icon-md`} type="button" variant={`ghost`}>
        {children}
      </Button>
    </Tooltip>
  );
}

/* ============================================================================
 * 3. MBe —— MarkdownTableStickyScrollbar 全量（原 49138–49743 / jsx 44247）
 * ----------------------------------------------------------------------------
 * 结构（逐段对照）：
 *  - 工具条（复制 markdown / 下载 CSV / 全屏预览 / 粘性滚动模式切换——仅粘性启用时）；
 *  - frame（group/markdown-table-frame + data-markdown-table-frame）：
 *    外层 max-width 位移容器（粘性展开时左移 scrollLeftOffset）→ 圆角边框容器 →
 *    横向滚动容器（!scrollbar-hide）+ table（data-streamdown=table）+ 左右边缘阴影（Ik）；
 *  - 粘性横向滚动条（sticky 容器 U + 轨道 ee + 拇指）：显隐 = hover/拖拽，
 *    指针/滚轮 → setVirtualScrollLeft 写回 table.scrollLeft；
 *  - 全屏预览 Dialog（sticky 表头 table，data-streamdown=table-preview）。
 * 状态：10×useState + 16×useRef + 10×去抖 setter（re…de）+ 交互 handler 群
 * （fe…je，原 js 49228–49688 区）+ 3×effect（布局度量/滚动接线/粘性纵向吸附）。
 * ==========================================================================*/

export interface MarkdownElementBaseProps {
  className?: string;
  node?: unknown;
  children?: React.ReactNode;
  [prop: string]: unknown;
}

/** 原 Lk（js 49758 / jsx 44688）：表格工具条按钮 */
export function TableToolbarButton({ children, label, onClick }: { children?: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Tooltip title={label}>
      <Button type="button" variant={`ghost`} size={`icon-md`} aria-label={label} onClick={onClick}>
        {children}
      </Button>
    </Tooltip>
  );
}

export function MarkdownTableStickyScrollbar({ className, children, node, ...rest }: MarkdownElementBaseProps) {
  const { intl } = useIntlContext();
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [expandedScrollMode, setExpandedScrollMode] = React.useState(false);
  const [stickyEnabled, setStickyEnabled] = React.useState(false);
  const [edgeShadowState, setEdgeShadowState] = React.useState(`none`);
  const [frameMaxWidth, setFrameMaxWidth] = React.useState(`100%`);
  const [stickyTrackWidth, setStickyTrackWidth] = React.useState(`100%`);
  const [scrollLeftOffset, setScrollLeftOffset] = React.useState(0);
  const [stickyActive, setStickyActive] = React.useState(false);
  const [stickyVisible, setStickyVisible] = React.useState(false);
  const [thumbStyle, setThumbStyle] = React.useState({ transform: `translateX(0px)`, width: `100%` });

  const edgeShadowStateRef = React.useRef(`none`);
  const expandedScrollModeRef = React.useRef(expandedScrollMode);
  const stickyEnabledRef = React.useRef(stickyEnabled);
  const frameMaxWidthRef = React.useRef(frameMaxWidth);
  const stickyTrackWidthRef = React.useRef(stickyTrackWidth);
  const scrollLeftOffsetRef = React.useRef(scrollLeftOffset);
  const stickyActiveRef = React.useRef(stickyActive);
  const stickyVisibleRef = React.useRef(stickyVisible);
  const maxLeftOffsetRef = React.useRef(0);
  const stickyScrollbarWidthRef = React.useRef(0);
  const virtualScrollPositionRef = React.useRef(0);
  const thumbLeftRef = React.useRef(0);
  const thumbStyleRef = React.useRef(thumbStyle);
  const trackDraggingRef = React.useRef(false);
  const thumbGrabOffsetRef = React.useRef<number | null>(null);
  const frameWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const stickyContainerRef = React.useRef<HTMLDivElement | null>(null);
  const stickyTrackRef = React.useRef<HTMLDivElement | null>(null);
  const stickyThumbRef = React.useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const tableRef = React.useRef<HTMLTableElement | null>(null);

  /* --- 去抖 setter 群（原 re…de，js 49171–49199） --- */
  const setEdgeShadowStateDedup = React.useCallback((next: string) => {
    edgeShadowStateRef.current !== next && ((edgeShadowStateRef.current = next), setEdgeShadowState(next));
  }, []);
  const setExpandedScrollModeDedup = React.useCallback((next: boolean) => {
    expandedScrollModeRef.current !== next && ((expandedScrollModeRef.current = next), setExpandedScrollMode(next));
  }, []);
  const setStickyEnabledDedup = React.useCallback((next: boolean) => {
    stickyEnabledRef.current !== next && ((stickyEnabledRef.current = next), setStickyEnabled(next));
  }, []);
  const setFrameMaxWidthDedup = React.useCallback((next: string) => {
    frameMaxWidthRef.current !== next && ((frameMaxWidthRef.current = next), setFrameMaxWidth(next));
  }, []);
  const setStickyTrackWidthDedup = React.useCallback((next: string) => {
    stickyTrackWidthRef.current !== next && ((stickyTrackWidthRef.current = next), setStickyTrackWidth(next));
  }, []);
  const setScrollLeftOffsetDedup = React.useCallback((next: number) => {
    scrollLeftOffsetRef.current !== next && ((scrollLeftOffsetRef.current = next), setScrollLeftOffset(next));
  }, []);
  const setStickyActiveDedup = React.useCallback((next: boolean) => {
    stickyActiveRef.current !== next && ((stickyActiveRef.current = next), setStickyActive(next));
  }, []);
  const setStickyVisibleDedup = React.useCallback((next: boolean) => {
    stickyVisibleRef.current !== next && ((stickyVisibleRef.current = next), setStickyVisible(next));
  }, []);
  const setThumbStyleDedup = React.useCallback((next: { transform: string; width: string }) => {
    const previous = thumbStyleRef.current;
    (previous.width === next.width && previous.transform === next.transform) || ((thumbStyleRef.current = next), setThumbStyle(next));
  }, []);

  /* --- 度量助手（原 fe/W/pe/me，js 49199–49209） --- */
  const measureTableWidth = React.useCallback(
    (scroller: HTMLElement) => tableRef.current?.getBoundingClientRect().width ?? scroller.scrollWidth,
    [],
  );
  const measureTrackWidth = React.useCallback((track: HTMLElement) => stickyScrollbarWidthRef.current || track.clientWidth, []);
  const measureEffectiveTrackWidth = React.useCallback(
    (scroller: HTMLElement) => {
      const rectWidth = stickyTrackRef.current?.getBoundingClientRect().width ?? 0;
      return rectWidth > 0 ? rectWidth : measureTrackWidth(scroller);
    },
    [measureTrackWidth],
  );
  const measureScrollMax = React.useCallback(
    (scroller: HTMLElement) => stickyScrollMax({ tableWidth: measureTableWidth(scroller), trackWidth: measureTrackWidth(scroller) }),
    [measureTableWidth, measureTrackWidth],
  );

  /* --- 原 he：虚拟滚动位置 → table.scrollLeft（js 49210–49224） --- */
  const setVirtualScrollLeft = React.useCallback(
    (next: number) => {
      const scroller = scrollContainerRef.current;
      if (!scroller) {
        virtualScrollPositionRef.current = 0;
        return;
      }
      const scrollMax = measureScrollMax(scroller);
      const clamped = Math.min(Math.max(0, next), scrollMax);
      const offset = Math.min(clamped, maxLeftOffsetRef.current);
      const scrollLeft = clamped - offset;
      ((virtualScrollPositionRef.current = clamped), setScrollLeftOffsetDedup(offset), (scroller.scrollLeft = scrollLeft));
    },
    [setScrollLeftOffsetDedup, measureScrollMax],
  );

  /* --- 原 ge：table.scrollLeft + 偏移 → 虚拟位置回灌 + 拇指几何（js 49225–49249） --- */
  const syncVirtualScroll = React.useCallback(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) {
      (setStickyVisibleDedup(false),
        setThumbStyleDedup({ transform: `translateX(0px)`, width: `100%` }),
        (virtualScrollPositionRef.current = 0),
        (thumbLeftRef.current = 0));
      return;
    }
    const scrollMax = measureScrollMax(scroller);
    setStickyVisibleDedup(scrollMax > 1);
    const combined = scrollLeftOffsetRef.current + scroller.scrollLeft;
    const clamped = Math.min(Math.max(0, combined), scrollMax);
    if (clamped !== combined) {
      setVirtualScrollLeft(clamped);
      return;
    }
    virtualScrollPositionRef.current = clamped;
    const trackWidth = measureEffectiveTrackWidth(scroller);
    const thumb = stickyThumbGeometry({ scrollLeft: clamped, scrollMax: scrollMax, tableWidth: measureTableWidth(scroller), trackWidth: trackWidth });
    (setThumbStyleDedup({
      transform: `translateX(${Math.round(thumb.thumbLeft)}px)`,
      width: `${Math.ceil(thumb.thumbWidth)}px`,
    }),
      (thumbLeftRef.current = thumb.thumbLeft));
  }, [setVirtualScrollLeft, setStickyVisibleDedup, setThumbStyleDedup, measureTableWidth, measureScrollMax, measureEffectiveTrackWidth]);

  /* --- 原 _e：布局总度量（粘性判定 + 最大偏移 + 宽度 + 模式回灌，js 49250–49289） --- */
  const updateLayout = React.useCallback(() => {
    const frame = frameRef.current;
    const root = tableLayoutRoot(frame, frameWrapperRef.current);
    if (!frame) {
      (setFrameMaxWidthDedup(`100%`), setStickyTrackWidthDedup(`100%`), setStickyEnabledDedup(false), setStickyVisibleDedup(false), setStickyActiveDedup(false), (maxLeftOffsetRef.current = 0), (stickyScrollbarWidthRef.current = 0), setScrollLeftOffsetDedup(0));
      return;
    }
    const frameRect = frame.getBoundingClientRect();
    let maxLeftOffset = 0;
    let effectiveWidth = frameRect.width;
    let scrollbarWidth = frameRect.width;
    let trackMaxLeftOffset = 0;
    let trackWidth = frameRect.width;
    if (root) {
      const rootRect = root.getBoundingClientRect();
      const { leftInset, rightInset } = tableLayoutInsets(root);
      const geometry = stickyTrackGeometry({
        frameWidth: frameRect.width,
        frameLeft: frameRect.left,
        frameRight: frameRect.right,
        rootLeft: rootRect.left,
        rootRight: rootRect.right,
        leftInset: leftInset,
        rightInset: rightInset,
      });
      ((trackMaxLeftOffset = geometry.maxLeftOffset),
        (trackWidth = geometry.scrollbarWidth),
        expandedScrollModeRef.current && ((maxLeftOffset = geometry.maxLeftOffset), (effectiveWidth = geometry.maxViewportWidth), (scrollbarWidth = geometry.scrollbarWidth)));
    }
    const tableOverflows = (tableRef.current?.getBoundingClientRect().width ?? 0) > frameRect.width + 1;
    const stickyNeeded = trackWidth > frameRect.width + 1 || trackMaxLeftOffset > 1;
    (setStickyEnabledDedup(expandedScrollModeRef.current || (tableOverflows && stickyNeeded)),
      (maxLeftOffsetRef.current = maxLeftOffset),
      (stickyScrollbarWidthRef.current = scrollbarWidth),
      setFrameMaxWidthDedup(`${Math.ceil(effectiveWidth)}px`),
      setStickyTrackWidthDedup(`${scrollbarWidth}px`),
      setStickyActiveDedup(tableNeedsStickyScrollbar({ root: root, table: tableRef.current })),
      scrollContainerRef.current ? setVirtualScrollLeft(virtualScrollPositionRef.current) : setScrollLeftOffsetDedup(Math.min(scrollLeftOffsetRef.current, maxLeftOffset)),
      syncVirtualScroll());
  }, [setStickyTrackWidthDedup, setStickyEnabledDedup, setVirtualScrollLeft, setStickyActiveDedup, setStickyVisibleDedup, setScrollLeftOffsetDedup, setFrameMaxWidthDedup, syncVirtualScroll]);

  /* --- 原 ve：左右边缘阴影状态（js 49290–49308） --- */
  const updateEdgeShadows = React.useCallback(() => {
    const scroller = scrollContainerRef.current;
    const table = tableRef.current;
    if (!scroller || !table) {
      setEdgeShadowStateDedup(`none`);
      return;
    }
    const scrollMax = measureScrollMax(scroller);
    if (scrollMax <= 1) {
      setEdgeShadowStateDedup(`none`);
      return;
    }
    const position = scrollLeftOffsetRef.current + scroller.scrollLeft;
    const scrolledRight = scroller.scrollLeft > 1;
    const canScrollFurther = position < scrollMax - 1;
    setEdgeShadowStateDedup(scrolledRight && canScrollFurther ? `both` : scrolledRight ? `left` : canScrollFurther ? `right` : `none`);
  }, [measureScrollMax, setEdgeShadowStateDedup]);
  const updateEdgeShadowsRef = React.useRef(updateEdgeShadows);

  (React.useEffect(() => {
    updateEdgeShadowsRef.current = updateEdgeShadows;
  }),
    /* --- effect 一（原 js 49311–49375）：布局度量循环（ResizeObserver + style MutationObserver + 800ms 惯性帧） --- */
    React.useLayoutEffect(() => {
      const frame = frameRef.current;
      const root = tableLayoutRoot(frame, frameWrapperRef.current);
      const scroller = scrollContainerRef.current;
      const table = tableRef.current;
      if (!root || !frame || !scroller || !table) {
        (setFrameMaxWidthDedup(`100%`), setStickyTrackWidthDedup(`100%`));
        return;
      }
      let scheduledFrame: number | null = null;
      let settleFrame: number | null = null;
      let settleUntil = 0;
      let rootRect = measureRect(root);
      let frameRect = measureRect(frame);
      const scheduleUpdate = () => {
        scheduledFrame === null &&
          (scheduledFrame = requestAnimationFrame(() => {
            ((scheduledFrame = null), (rootRect = measureRect(root)), (frameRect = measureRect(frame)), updateLayout(), updateEdgeShadowsRef.current());
          }));
      };
      const settleLoop = () => {
        settleFrame = null;
        const nextRootRect = measureRect(root);
        const nextFrameRect = measureRect(frame);
        ((!sameRect(rootRect, nextRootRect) || !sameRect(frameRect, nextFrameRect)) && ((rootRect = nextRootRect), (frameRect = nextFrameRect), scheduleUpdate()),
          performance.now() < settleUntil && (settleFrame = requestAnimationFrame(settleLoop)));
      };
      const triggerUpdate = () => {
        (scheduleUpdate(), (settleUntil = performance.now() + 800), settleFrame === null && (settleFrame = requestAnimationFrame(settleLoop)));
      };
      const styleObserver = typeof MutationObserver > `u` ? null : new MutationObserver(triggerUpdate);
      if (
        (styleObserver?.observe(root, { attributeFilter: [`style`], attributes: true }),
        updateLayout(),
        triggerUpdate(),
        typeof ResizeObserver > `u`)
      )
        return (
          window.addEventListener(`resize`, triggerUpdate),
          () => {
            (window.removeEventListener(`resize`, triggerUpdate),
              styleObserver?.disconnect(),
              scheduledFrame !== null && cancelAnimationFrame(scheduledFrame),
              settleFrame !== null && cancelAnimationFrame(settleFrame));
          }
        );
      const resizeObserver = new ResizeObserver(triggerUpdate);
      return (
        resizeObserver.observe(root),
        resizeObserver.observe(frame),
        resizeObserver.observe(scroller),
        resizeObserver.observe(table),
        window.addEventListener(`resize`, triggerUpdate),
        () => {
          (resizeObserver.disconnect(),
            window.removeEventListener(`resize`, triggerUpdate),
            styleObserver?.disconnect(),
            scheduledFrame !== null && cancelAnimationFrame(scheduledFrame),
            settleFrame !== null && cancelAnimationFrame(settleFrame));
        }
      );
    }, [setStickyTrackWidthDedup, setFrameMaxWidthDedup, updateLayout]),
    /* --- effect 二（原 js 49376–49428）：滚动/滚轮/尺寸接线 --- */
    React.useEffect(() => {
      const scroller = scrollContainerRef.current;
      const table = tableRef.current;
      if (!scroller || !table) {
        setEdgeShadowStateDedup(`none`);
        return;
      }
      const handleLayout = () => {
        (updateLayout(), updateEdgeShadowsRef.current());
      };
      const handleScroll = () => {
        (syncVirtualScroll(), updateEdgeShadowsRef.current());
      };
      const handleWheel = (event: WheelEvent) => {
        const delta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
        delta !== 0 && (measureScrollMax(scroller) <= 1 || (event.preventDefault(), setVirtualScrollLeft(virtualScrollPositionRef.current + delta), handleLayout()));
      };
      let resizeFrame: number | null = null;
      const scheduleScrollSync = () => {
        resizeFrame === null &&
          (resizeFrame = requestAnimationFrame(() => {
            ((resizeFrame = null), handleScroll());
          }));
      };
      if (
        (handleScroll(),
        scroller.addEventListener(`scroll`, handleScroll, { passive: true }),
        scroller.addEventListener(`wheel`, handleWheel, { passive: false }),
        typeof ResizeObserver > `u`)
      )
        return (
          window.addEventListener(`resize`, scheduleScrollSync),
          () => {
            (scroller.removeEventListener(`scroll`, handleScroll),
              scroller.removeEventListener(`wheel`, handleWheel),
              window.removeEventListener(`resize`, scheduleScrollSync),
              resizeFrame !== null && cancelAnimationFrame(resizeFrame));
          }
        );
      const resizeObserver = new ResizeObserver(() => {
        scheduleScrollSync();
      });
      return (
        resizeObserver.observe(scroller),
        resizeObserver.observe(table),
        window.addEventListener(`resize`, scheduleScrollSync),
        () => {
          (scroller.removeEventListener(`scroll`, handleScroll),
            scroller.removeEventListener(`wheel`, handleWheel),
            resizeObserver.disconnect(),
            window.removeEventListener(`resize`, scheduleScrollSync),
            resizeFrame !== null && cancelAnimationFrame(resizeFrame));
        }
      );
    }, [setVirtualScrollLeft, updateLayout, measureScrollMax, setEdgeShadowStateDedup, syncVirtualScroll]),
    /* --- effect 三（原 js 49429–49486）：粘性条纵向吸附（滚动容器/视口底缘 - dock - 回底按钮） --- */
    React.useLayoutEffect(() => {
      const frame = frameRef.current;
      const table = tableRef.current;
      const stickyContainer = stickyContainerRef.current;
      const root = tableLayoutRoot(frame, frameWrapperRef.current);
      if (!frame || !table || !stickyContainer || !stickyActive) {
        stickyContainer && (stickyContainer.style.transform = ``);
        return;
      }
      const scroller = findVerticalScroller(table, root);
      if (!scroller) return;
      let updateFrame: number | null = null;
      let observedDock: Element | null = null;
      const updatePosition = () => {
        updateFrame = null;
        const frameRect = frame.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const dockHeight = chatDockHeight(root);
        const backToBottomHeight = backToBottomInset(root);
        const offset = stickyScrollbarOffset({
          frameTop: frameRect.top,
          frameBottom: frameRect.bottom,
          scrollbarHeight: stickyContainer.getBoundingClientRect().height,
          viewportBottom: scrollerRect.bottom - dockHeight - backToBottomHeight,
        });
        stickyContainer.style.transform = offset === 0 ? `` : `translateY(${Math.round(offset)}px)`;
      };
      const schedulePositionUpdate = () => {
        updateFrame === null && (updateFrame = requestAnimationFrame(updatePosition));
      };
      const dockObserver = typeof ResizeObserver > `u` ? null : new ResizeObserver(schedulePositionUpdate);
      const resubscribeDock = () => {
        const dock = root?.querySelector(`[data-v4-composer-dock="true"]`) ?? null;
        if (dock === observedDock) {
          schedulePositionUpdate();
          return;
        }
        (observedDock && dockObserver?.unobserve(observedDock), (observedDock = dock), observedDock && dockObserver?.observe(observedDock), schedulePositionUpdate());
      };
      (updatePosition(),
        scroller.addEventListener(`scroll`, schedulePositionUpdate, { passive: true }),
        window.addEventListener(`resize`, schedulePositionUpdate),
        dockObserver?.observe(frame),
        dockObserver?.observe(scroller),
        resubscribeDock());
      const dockWatcher = typeof MutationObserver > `u` || !root ? null : new MutationObserver(resubscribeDock);
      return (
        dockWatcher && root && dockWatcher.observe(root, { childList: true, subtree: true }),
        () => {
          (scroller.removeEventListener(`scroll`, schedulePositionUpdate),
            window.removeEventListener(`resize`, schedulePositionUpdate),
            dockObserver?.disconnect(),
            dockWatcher?.disconnect(),
            updateFrame !== null && cancelAnimationFrame(updateFrame),
            (stickyContainer.style.transform = ``));
        }
      );
    }, [stickyActive, stickyVisible]));

  /* --- 原 be：表格 → 行矩阵（js 49487） --- */
  const readTableRows = React.useCallback(() => extractTableRows(tableRef.current), []);

  /* --- 原 xe：轨道坐标 → 虚拟位置（拖拽共用，js 49488–49501） --- */
  const seekTrackPosition = React.useCallback(
    (clientX: number, grabOffset: number | null = null) => {
      const track = stickyTrackRef.current;
      const scroller = scrollContainerRef.current;
      if (!track || !scroller) return;
      const trackRect = track.getBoundingClientRect();
      const trackWidth = trackRect.width;
      const scrollMax = measureScrollMax(scroller);
      const thumb = stickyThumbGeometry({ scrollLeft: virtualScrollPositionRef.current, scrollMax: scrollMax, tableWidth: measureTableWidth(scroller), trackWidth: trackWidth });
      const freeSpace = Math.max(0, trackWidth - thumb.thumbWidth);
      const thumbLeft = grabOffset === null ? clientX - trackRect.left - thumb.thumbWidth / 2 : clientX - trackRect.left - grabOffset;
      (setVirtualScrollLeft(freeSpace <= 0 ? 0 : (Math.min(freeSpace, Math.max(0, thumbLeft)) / freeSpace) * scrollMax), updateLayout(), updateEdgeShadowsRef.current());
    },
    [setVirtualScrollLeft, updateLayout, measureTableWidth, measureScrollMax],
  );

  /* --- 原 Se/Ce/we：轨道指针（js 49502–49525） --- */
  const handleTrackPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      ((trackDraggingRef.current = true),
        (thumbGrabOffsetRef.current = null),
        event.currentTarget.setPointerCapture(event.pointerId),
        seekTrackPosition(event.clientX));
    },
    [seekTrackPosition],
  );
  const handleTrackPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      trackDraggingRef.current && seekTrackPosition(event.clientX, thumbGrabOffsetRef.current);
    },
    [seekTrackPosition],
  );
  const handleTrackPointerUp = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    ((trackDraggingRef.current = false),
      (thumbGrabOffsetRef.current = null),
      event.currentTarget.hasPointerCapture(event.pointerId) &&
        event.currentTarget.releasePointerCapture(event.pointerId));
  }, []);

  /* --- 原 Te/Ee/De：拇指指针（js 49526–49545） --- */
  const handleThumbPointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const track = stickyTrackRef.current;
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    ((trackDraggingRef.current = true),
      (thumbGrabOffsetRef.current = Math.max(0, event.clientX - trackRect.left - thumbLeftRef.current)),
      event.currentTarget.setPointerCapture(event.pointerId));
  }, []);
  const handleThumbPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      (event.stopPropagation(), trackDraggingRef.current && seekTrackPosition(event.clientX, thumbGrabOffsetRef.current));
    },
    [seekTrackPosition],
  );
  const handleThumbPointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      (event.stopPropagation(), handleTrackPointerUp(event));
    },
    [handleTrackPointerUp],
  );

  /* --- 原 Oe：轨道滚轮（js 49546–49554） --- */
  const handleTrackWheel = React.useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const delta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
      if (delta === 0) return;
      const scroller = scrollContainerRef.current;
      !scroller || measureScrollMax(scroller) <= 1 || (event.preventDefault(), setVirtualScrollLeft(virtualScrollPositionRef.current + delta), updateLayout(), updateEdgeShadowsRef.current());
    },
    [setVirtualScrollLeft, updateLayout, measureScrollMax],
  );

  /* --- 原 ke：复制 markdown（js 49555–49569） --- */
  const copyMarkdown = React.useCallback(async () => {
    if (typeof navigator > `u` || !navigator.clipboard?.writeText) {
      toast(intl.formatMessage({ id: `markdownTable.copyFailed` }, { error: `clipboard-unavailable` }));
      return;
    }
    try {
      (await navigator.clipboard.writeText(tableRowsToMarkdown(readTableRows())),
        toast(intl.formatMessage({ id: `markdownTable.copySucceeded` })));
    } catch (error) {
      toast(
        intl.formatMessage(
          { id: `markdownTable.copyFailed` },
          { error: error instanceof Error ? error.message : String(error) },
        ),
      );
    }
  }, [readTableRows, intl]);

  /* --- 原 Ae：下载 CSV（js 49570–49589） --- */
  const downloadCsv = React.useCallback(() => {
    if (
      typeof document > `u` ||
      typeof Blob > `u` ||
      typeof URL > `u` ||
      typeof URL.createObjectURL != `function`
    ) {
      toast(intl.formatMessage({ id: `markdownTable.downloadFailed` }));
      return;
    }
    const blob = new Blob([tableRowsToCsv(readTableRows())], { type: `text/csv;charset=utf-8` });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement(`a`);
    ((anchor.href = objectUrl),
      (anchor.download = `table.csv`),
      document.body.appendChild(anchor),
      anchor.click(),
      anchor.remove(),
      URL.revokeObjectURL(objectUrl));
  }, [readTableRows, intl]);

  /* --- 原 je：粘性滚动模式切换（js 49590–49601） --- */
  const toggleScrollMode = React.useCallback(() => {
    const next = !expandedScrollModeRef.current;
    if ((setExpandedScrollModeDedup(next), !next)) {
      ((maxLeftOffsetRef.current = 0), setScrollLeftOffsetDedup(0));
      const scroller = scrollContainerRef.current;
      scroller && (scroller.scrollLeft = virtualScrollPositionRef.current);
    }
    requestAnimationFrame(() => {
      (updateLayout(), updateEdgeShadowsRef.current());
    });
  }, [setExpandedScrollModeDedup, setScrollLeftOffsetDedup, updateLayout]);

  const copyMarkdownLabel = intl.formatMessage({ id: `markdownTable.copyMarkdown` });
  const downloadCsvLabel = intl.formatMessage({ id: `markdownTable.downloadCsv` });
  const openPreviewLabel = intl.formatMessage({ id: `markdownTable.openPreview` });
  const toggleScrollModeLabel = intl.formatMessage({
    id: expandedScrollMode ? `markdownTable.collapseScrollMode` : `markdownTable.expandScrollMode`,
  });
  const previewTitle = intl.formatMessage({ id: `markdownTable.previewTitle` });
  const previewDescription = intl.formatMessage({ id: `markdownTable.previewDescription` });
  const maxWidthStyle = scrollLeftOffset > 0 ? `calc(${frameMaxWidth} + ${Math.ceil(scrollLeftOffset)}px)` : frameMaxWidth;

  return (
    <div ref={frameWrapperRef} className={`my-0 flex min-w-0 flex-col gap-2`}>
      <div className={`flex items-center justify-end gap-1`} data-markdown-table-toolbar={`"`}>
        <TableToolbarButton
          label={copyMarkdownLabel}
          onClick={() => {
            copyMarkdown();
          }}
        >
          <IconCopy className={`size-3.5`} />
        </TableToolbarButton>
        <TableToolbarButton label={downloadCsvLabel} onClick={downloadCsv}>
          <IconDownload className={`size-3.5`} />
        </TableToolbarButton>
        <TableToolbarButton label={openPreviewLabel} onClick={() => setPreviewOpen(true)}>
          <IconTablePreview className={`size-3.5`} />
        </TableToolbarButton>
        {stickyEnabled ? (
          <TableToolbarButton label={toggleScrollModeLabel} onClick={toggleScrollMode}>
            {expandedScrollMode ? <IconCollapseScrollMode className={`size-3.5`} /> : <IconExpandScrollMode className={`size-3.5`} />}
          </TableToolbarButton>
        ) : null}
      </div>
      <div
        ref={frameRef}
        className={`group/markdown-table-frame relative w-full`}
        data-markdown-table-frame={``}
        data-markdown-table-virtual-scroll-sticky={stickyActive ? `true` : `false`}
      >
        <div
          className={cn(
            `min-w-full w-max`,
            scrollLeftOffset <= 0 &&
              `transition-[max-width] duration-200 ease-out motion-reduce:transition-none`,
          )}
          style={{ maxWidth: maxWidthStyle, transform: scrollLeftOffset > 0 ? `translateX(-${scrollLeftOffset}px)` : void 0 }}
        >
          <div className={`relative w-full overflow-hidden rounded-xl border border-border`}>
            <div ref={scrollContainerRef} className={`!scrollbar-hide w-full overflow-x-auto overflow-y-visible`}>
              <table
                ref={tableRef}
                className={cn(
                  `w-max min-w-full border-separate border-spacing-0 text-ui-base`,
                  className,
                )}
                {...rest}
                data-streamdown={`table`}
              >
                {children}
              </table>
            </div>
            <TableEdgeShadow side={`left`} state={edgeShadowState} />
            <TableEdgeShadow side={`right`} state={edgeShadowState} />
          </div>
        </div>
        <div
          ref={stickyContainerRef}
          aria-hidden={!stickyVisible}
          data-markdown-table-virtual-scroll-sticky={stickyActive ? `true` : `false`}
          data-markdown-table-virtual-scroll-visible={stickyVisible ? `true` : `false`}
          style={{ width: stickyTrackWidth }}
          className={cn(
            `pointer-events-none py-1 opacity-0 transition-[width,opacity] duration-200 ease-out motion-reduce:transition-none`,
            stickyVisible
              ? `visible group-hover/markdown-table-frame:pointer-events-auto group-hover/markdown-table-frame:opacity-100`
              : `invisible`,
            stickyActive && `relative z-20`,
          )}
        >
          <div
            ref={stickyTrackRef}
            aria-hidden={`true`}
            className={`mt-1 h-3.5 w-full touch-none rounded-full bg-foreground/3`}
            data-markdown-table-virtual-scroll-track={``}
            onPointerCancel={handleTrackPointerUp}
            onPointerDown={handleTrackPointerDown}
            onPointerMove={handleTrackPointerMove}
            onPointerUp={handleTrackPointerUp}
            onWheel={handleTrackWheel}
          >
            <div
              className={`h-3 rounded-full bg-foreground/20 transition-colors hover:bg-foreground/40`}
              onPointerCancel={handleThumbPointerUp}
              onPointerDown={handleThumbPointerDown}
              onPointerMove={handleThumbPointerMove}
              onPointerUp={handleThumbPointerUp}
              style={thumbStyle}
            />
          </div>
        </div>
      </div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className={`flex max-h-[calc(100vh-2rem)] w-max max-w-[calc(100vw-2rem)] flex-col gap-3 overflow-hidden rounded-2xl p-4 sm:max-h-[calc(100vh-8rem)] sm:max-w-[calc(100vw-8rem)] md:min-w-[640px] lg:min-w-[720px]`}
        >
          <DialogHeader className={`pr-8`}>
            <DialogTitle>{previewTitle}</DialogTitle>
            <DialogDescription>{previewDescription}</DialogDescription>
          </DialogHeader>
          <div className={`min-h-0 overflow-auto rounded-xl border border-border bg-background`}>
            <table
              className={cn(
                `w-max min-w-full border-separate border-spacing-0 text-ui-base [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-background`,
                className,
              )}
              {...rest}
              data-streamdown={`table-preview`}
            >
              {children}
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================================
 * 4. Wk 画廊 / 灯箱族（原 49801–50176）
 * ==========================================================================*/

/** 原 Rk（js 49801 / jsx 44730） */
const ORIGIN_POINT = { x: 0, y: 0 };

/** 原 zk：灯箱下载体积上限 50MB */
const LIGHTBOX_DOWNLOAD_MAX_BYTES = 50 * 1024 * 1024;

/** 原 RBe：blob MIME → 下载扩展名 */
const MIME_TO_DOWNLOAD_EXTENSION: Record<string, string> = {
  "image/avif": `avif`,
  "image/gif": `gif`,
  "image/jpeg": `jpg`,
  "image/png": `png`,
  "image/svg+xml": `svg`,
  "image/webp": `webp`,
};

/** 原 zBe：平移钳制（内容居中后各半溢出） */
function clampPanOffset(
  offset: { x: number; y: number },
  scale: number,
  content: { height: number; width: number },
  viewport: { height: number; width: number },
): { x: number; y: number } {
  const overflowX = Math.max(0, (content.width * scale - viewport.width) / 2);
  const overflowY = Math.max(0, (content.height * scale - viewport.height) / 2);
  return {
    x: overflowX === 0 ? 0 : Math.min(overflowX, Math.max(-overflowX, offset.x)),
    y: overflowY === 0 ? 0 : Math.min(overflowY, Math.max(-overflowY, offset.y)),
  };
}

/** 原 Bk：下载文件名（去扩展名/非法字符替换/80 截断，缺省 image） */
function downloadBaseName(item: { alt: string; filename: string }): string {
  return (
    (item.filename || item.alt)
      .trim()
      .replace(/\.[a-z0-9]+$/iu, ``)
      .replace(/[<>:"/\\|?*\u0000-\u001f]/gu, `-`)
      .slice(0, 80) || `image`
  );
}

/** 原 Vk：带错误码的下载失败 */
class LightboxDownloadError extends Error {
  code: string;
  constructor(code: string) {
    (super(code), (this.code = code));
  }
}

/** 原 Hk */
function isHttpDownloadSource(source: string): boolean {
  return source.startsWith(`http://`) || source.startsWith(`https://`);
}

/** 原 Uk：日志用 source 摘要（data-url 归一；URL 去凭据/查询/哈希） */
function summarizeDownloadSource(source: string): string {
  if (source.startsWith(`data:`)) return `data-url`;
  try {
    const url = new URL(source);
    return ((url.username = ``), (url.password = ``), (url.search = ``), (url.hash = ``), url.toString());
  } catch {
    return `invalid-url`;
  }
}

/** 原 BBe：fetch 流式下载（content-length 预检 + 累计字节双保险，超限 abort） */
async function downloadBlobWithSizeLimit(source: string): Promise<Blob> {
  const controller = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  try {
    const response = await fetch(source, { signal: controller.signal });
    if (!response.ok || !response.body) throw new LightboxDownloadError(`download_failed`);
    const declaredLength = Number(response.headers.get(`content-length`));
    if (Number.isFinite(declaredLength) && declaredLength > LIGHTBOX_DOWNLOAD_MAX_BYTES) throw new LightboxDownloadError(`file_too_large`);
    reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (((totalBytes += value.byteLength), totalBytes > LIGHTBOX_DOWNLOAD_MAX_BYTES)) throw (controller.abort(), new LightboxDownloadError(`file_too_large`));
      chunks.push(value);
    }
    if (totalBytes === 0) throw new LightboxDownloadError(`download_failed`);
    const merged = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) (merged.set(chunk, offset), (offset += chunk.byteLength));
    return new Blob([merged.buffer], {
      type: response.headers.get(`content-type`) ?? `application/octet-stream`,
    });
  } finally {
    (controller.abort(), await reader?.cancel().catch(() => void 0));
  }
}

/** 原 VBe：兜底外链打开（noopener + _blank） */
function openUrlInNewTab(source: string): void {
  const anchor = document.createElement(`a`);
  ((anchor.href = source),
    (anchor.rel = `noopener noreferrer`),
    (anchor.target = `_blank`),
    document.body.appendChild(anchor),
    anchor.click(),
    anchor.remove());
}

export interface LightboxItem {
  alt: string;
  filename: string;
  src: string;
}

export interface ImageLightboxProps {
  dialogTestId?: string;
  imageTestId?: string;
  initialIndex: number;
  items: LightboxItem[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

/**
 * 原 Wk（js 49882 / jsx 44808）：图片灯箱。
 * 多图 = 左右切换（ArrowLeft/Right）+ 底部缩放条（0.5–3，步进 0.5）；
 * 手势 = 单指拖拽（钳制）+ 双指捏合缩放；下载 = 平台 saveFile 优先（http 直存 /
 * 否则抓 blob），无 saveFile 且非过大失败 → 外链打开兜底。
 */
export function ImageLightbox({
  dialogTestId,
  imageTestId,
  initialIndex,
  items,
  onOpenChange,
  open,
}: ImageLightboxProps) {
  const { intl } = useIntlContext();
  const platform = usePlatform() as unknown as PlatformService;
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState(ORIGIN_POINT);
  const [downloading, setDownloading] = React.useState(false);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const activePointersRef = React.useRef(new Map<number, { x: number; y: number }>());
  const dragStateRef = React.useRef<{ offset: { x: number; y: number }; pointer: { x: number; y: number } } | null>(null);
  const pinchStateRef = React.useRef<{ distance: number; scale: number } | null>(null);
  const currentItem = items[currentIndex];
  const hasMultiple = items.length > 1;

  /** 原 E：复位视图（释放指针捕获） */
  const resetView = () => {
    const viewport = viewportRef.current;
    if (viewport) for (const pointerId of activePointersRef.current.keys()) viewport.hasPointerCapture(pointerId) && viewport.releasePointerCapture(pointerId);
    (activePointersRef.current.clear(), (dragStateRef.current = null), (pinchStateRef.current = null), setScale(1), setOffset(ORIGIN_POINT));
  };

  /** 原 D：循环切换 */
  const step = (delta: number) => {
    items.length <= 1 || (setCurrentIndex((index) => (index + delta + items.length) % items.length), resetView());
  };

  (React.useEffect(() => {
    open && (setCurrentIndex(Math.min(Math.max(initialIndex, 0), Math.max(items.length - 1, 0))), resetView());
  }, [initialIndex, items.length, open]),
    React.useEffect(() => {
      if (!open) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        event.key === `ArrowLeft` ? step(-1) : event.key === `ArrowRight` && step(1);
      };
      return (
        window.addEventListener(`keydown`, handleKeyDown),
        () => window.removeEventListener(`keydown`, handleKeyDown)
      );
    }, [items.length, open]));

  /** 原 O：按当前缩放钳制平移 */
  const clampOffset = (next: { x: number; y: number }, nextScale: number) => {
    const image = imageRef.current;
    const viewport = viewportRef.current;
    return !image || !viewport
      ? ORIGIN_POINT
      : clampPanOffset(
          next,
          nextScale,
          { height: image.offsetHeight, width: image.offsetWidth },
          { height: viewport.clientHeight, width: viewport.clientWidth },
        );
  };

  React.useEffect(() => {
    if (!open) return;
    const handleResize = () => {
      setOffset((current) => clampOffset(current, scale));
    };
    return (window.addEventListener(`resize`, handleResize), () => window.removeEventListener(`resize`, handleResize));
  }, [open, scale]);

  /** 原 k：步进缩放（0.5–3） */
  const zoomBy = (delta: number) => {
    const nextScale = Math.min(3, Math.max(0.5, scale + delta));
    (setScale(nextScale), setOffset((current) => clampOffset(current, nextScale)));
  };

  /** 原 A：pointerdown */
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    if ((activePointersRef.current.set(event.pointerId, point), activePointersRef.current.size === 1)) {
      ((dragStateRef.current = { offset: offset, pointer: point }), (pinchStateRef.current = null));
      return;
    }
    const [first, second] = Array.from(activePointersRef.current.values());
    if (!first || !second) return;
    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    distance !== 0 && (pinchStateRef.current = { distance: distance, scale: scale });
  };

  /** 原 j：pointermove */
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return;
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pointers = Array.from(activePointersRef.current.values());
    if (pointers.length >= 2) {
      const [first, second] = pointers;
      if (!first || !second || !pinchStateRef.current) return;
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const nextScale = Math.min(3, Math.max(0.5, pinchStateRef.current.scale * (distance / pinchStateRef.current.distance)));
      (setScale(nextScale), setOffset((current) => clampOffset(current, nextScale)));
      return;
    }
    const dragState = dragStateRef.current;
    const pointer = pointers[0];
    !dragState || !pointer || setOffset(clampOffset({ x: dragState.offset.x + pointer.x - dragState.pointer.x, y: dragState.offset.y + pointer.y - dragState.pointer.y }, scale));
  };

  /** 原 M：pointerup/cancel */
  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    (event.currentTarget.hasPointerCapture(event.pointerId) &&
      event.currentTarget.releasePointerCapture(event.pointerId),
      activePointersRef.current.delete(event.pointerId),
      (pinchStateRef.current = null));
    const remaining = Array.from(activePointersRef.current.values())[0];
    dragStateRef.current = remaining ? { offset: offset, pointer: remaining } : null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={void 0}
        className={`pointer-events-auto h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none place-items-center gap-0 overflow-hidden border-0 bg-transparent p-10 shadow-none [app-region:no-drag] sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] platform-linux-desktop:h-[calc(100dvh-4rem)]`}
        data-testid={dialogTestId}
        showCloseButton={false}
      >
        <DialogTitle className={`sr-only`}>
          {currentItem?.alt || intl.formatMessage({ id: `chat.attachments.preview.title` })}
        </DialogTitle>
        <div className={`pointer-events-auto absolute right-4 top-4 z-20 flex items-center gap-2 [app-region:no-drag] platform-mac-desktop:top-12 platform-linux-desktop:right-6 platform-linux-desktop:top-4 platform-windows-desktop:right-6 platform-windows-desktop:top-[calc(env(titlebar-area-height,48px)_+_0.5rem)]`}>
          <Button
            type="button"
            aria-label={intl.formatMessage({ id: `markdownImage.download` })}
            className={`rounded-full border border-border bg-background text-foreground shadow-md hover:bg-background/80`}
            disabled={!currentItem || downloading}
            onClick={async () => {
              if (!(!currentItem || downloading)) {
                setDownloading(true);
                try {
                  if (platform?.saveFile && isHttpDownloadSource(currentItem.src)) {
                    const result = await platform.saveFile({ sourceUrl: currentItem.src, suggestedName: `${downloadBaseName(currentItem)}.png` });
                    if (result.canceled) return;
                    if (!result.success || !result.path) throw Error(result.error || `save_failed`);
                    toast(
                      intl.formatMessage(
                        { id: `markdownImage.downloadSucceeded` },
                        { path: result.path },
                      ),
                    );
                    return;
                  }
                  let blob: Blob;
                  try {
                    blob = await downloadBlobWithSizeLimit(currentItem.src);
                  } catch (error) {
                    if (
                      !platform?.saveFile &&
                      isHttpDownloadSource(currentItem.src) &&
                      !(error instanceof LightboxDownloadError && error.code === `file_too_large`)
                    ) {
                      (openUrlInNewTab(currentItem.src), toast(intl.formatMessage({ id: `markdownImage.downloadStarted` })));
                      return;
                    }
                    throw error;
                  }
                  const extension = MIME_TO_DOWNLOAD_EXTENSION[blob.type.toLowerCase()] ?? `png`;
                  const suggestedName = `${downloadBaseName(currentItem)}.${extension}`;
                  if (platform?.saveFile) {
                    const result = await platform.saveFile({ data: await blob.arrayBuffer(), suggestedName: suggestedName });
                    if (result.canceled) return;
                    if (!result.success || !result.path) throw Error(result.error || `save_failed`);
                    toast(
                      intl.formatMessage(
                        { id: `markdownImage.downloadSucceeded` },
                        { path: result.path },
                      ),
                    );
                    return;
                  }
                  const objectUrl = URL.createObjectURL(blob);
                  const anchor = document.createElement(`a`);
                  ((anchor.href = objectUrl),
                    (anchor.download = suggestedName),
                    document.body.appendChild(anchor),
                    anchor.click(),
                    anchor.remove(),
                    URL.revokeObjectURL(objectUrl),
                    toast(intl.formatMessage({ id: `markdownImage.downloadStarted` })));
                } catch (error) {
                  (logger.warn(`[ImagePreviewDialog] 图片下载失败`, {
                    src: summarizeDownloadSource(currentItem.src),
                    error: error instanceof Error ? error.message : String(error),
                  }),
                    toast(intl.formatMessage({ id: `markdownImage.downloadFailed` })));
                } finally {
                  setDownloading(false);
                }
              }
            }}
            size={`icon-md`}
            variant={`ghost`}
          >
            <IconDownload />
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              aria-label={intl.formatMessage({ id: `common.close` })}
              className={`rounded-full border border-border bg-background text-foreground shadow-md hover:bg-background/80`}
              size={`icon-md`}
              variant={`ghost`}
            >
              <IconClose />
            </Button>
          </DialogClose>
        </div>
        {hasMultiple ? (
          <>
            <Button
              type="button"
              aria-label={intl.formatMessage({ id: `markdownImage.previous` })}
              className={`pointer-events-auto absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border bg-background text-foreground shadow-md [app-region:no-drag] hover:bg-background/80`}
              onClick={() => step(-1)}
              size={`icon-md`}
              variant={`ghost`}
            >
              <IconPrevious />
            </Button>
            <Button
              type="button"
              aria-label={intl.formatMessage({ id: `markdownImage.next` })}
              className={`pointer-events-auto absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border bg-background text-foreground shadow-md [app-region:no-drag] hover:bg-background/80`}
              onClick={() => step(1)}
              size={`icon-md`}
              variant={`ghost`}
            >
              <IconNext />
            </Button>
          </>
        ) : null}
        {currentItem ? (
          <div
            className={`flex size-full min-h-0 min-w-0 touch-none cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing`}
            onPointerCancel={handlePointerUp}
            onPointerDown={handlePointerDown}
            onLostPointerCapture={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            ref={viewportRef}
          >
            <img
              alt={currentItem.alt}
              className={`max-h-full max-w-full select-none rounded-xl border border-border bg-background object-contain shadow-2xl`}
              data-testid={imageTestId}
              draggable={false}
              onLoad={resetView}
              ref={imageRef}
              src={currentItem.src}
              style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})` }}
            />
          </div>
        ) : null}
        <div className={`pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-popover-border bg-popover/95 p-1 shadow-md [app-region:no-drag]`}>
          <Button
            type="button"
            aria-label={intl.formatMessage({ id: `markdownImage.zoomOut` })}
            className={`rounded-full`}
            disabled={scale <= 0.5}
            onClick={() => zoomBy(-0.5)}
            size={`icon-sm`}
            variant={`ghost`}
          >
            <IconZoomOut />
          </Button>
          <span className={`min-w-12 text-center text-ui-base text-foreground`}>{Math.round(scale * 100)}%</span>
          <Button
            type="button"
            aria-label={intl.formatMessage({ id: `markdownImage.zoomIn` })}
            className={`rounded-full`}
            disabled={scale >= 3}
            onClick={() => zoomBy(0.5)}
            size={`icon-sm`}
            variant={`ghost`}
          >
            <IconZoomIn />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 原 qk（js 50165 / jsx 45007）：图片画廊组容器。
 * grouped=true：移动单列网格 → sm 双列 → md 起 flex-wrap（缩略 176px 行高）；
 * grouped=false：contents（透明包装）。
 * （Gk/Kk 类名常量已在 MarkdownIntegration.tsx §10 重建；此处仅组容器。）
 */
export function ImageGalleryGroup({ children, className, grouped = true, ...rest }: React.HTMLAttributes<HTMLDivElement> & { grouped?: boolean }) {
  return (
    <div
      className={cn(
        grouped
          ? `my-4 grid grid-cols-1 gap-2 [&>[data-image-thumbnail-trigger]]:my-0 [&>[data-image-thumbnail-trigger]]:h-32 [&>[data-image-thumbnail-trigger]]:w-full [&>[data-image-thumbnail-trigger]]:max-w-none [&>[data-image-thumbnail-trigger]>img]:size-full [&>[data-image-thumbnail-trigger]>img]:max-h-none sm:grid-cols-2 md:flex md:flex-wrap md:[&>[data-image-thumbnail-trigger]]:h-44 md:[&>[data-image-thumbnail-trigger]]:w-auto md:[&>[data-image-thumbnail-trigger]]:shrink-0 md:[&>[data-image-thumbnail-trigger]>img]:h-44 md:[&>[data-image-thumbnail-trigger]>img]:w-auto md:[&>[data-image-thumbnail-trigger]>img]:max-w-none`
          : `contents`,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ============================================================================
 * 5. 工具预览源构建族（原 50177–50420）—— 聊天工具卡「预览」投影
 * ----------------------------------------------------------------------------
 * 消费面：Glt resolveToolDisplayModel（js 99744，Conversation.tsx 接口级声明）→
 *   15 工具视图的「查看代码/查看 diff」与内联预览；CodeViewer 的 YBe diff 源。
 * ==========================================================================*/

/** 原 HBe：工具预览文本首读上限 256KB（CodeViewer.tsx 头注已登记） */
export const TOOL_PREVIEW_TEXT_LIMIT = 256 * 1024;

/** 原 Jk：扩展名 → shiki 语言 */
export const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  bash: `bash`,
  c: `c`,
  cc: `cpp`,
  cpp: `cpp`,
  css: `css`,
  diff: `diff`,
  go: `go`,
  h: `c`,
  htm: `html`,
  html: `html`,
  java: `java`,
  js: `javascript`,
  json: `json`,
  jsx: `jsx`,
  md: `markdown`,
  mermaid: `mermaid`,
  mmd: `mermaid`,
  mjs: `javascript`,
  py: `python`,
  rb: `ruby`,
  rs: `rust`,
  sh: `bash`,
  sql: `sql`,
  svg: `xml`,
  text: `log`,
  toml: `toml`,
  ts: `typescript`,
  tsx: `tsx`,
  txt: `log`,
  xml: `xml`,
  yaml: `yaml`,
  yml: `yaml`,
};

/** 原 UBe：扩展名 → 图片 MIME */
export const EXTENSION_IMAGE_MIME_MAP: Record<string, string> = {
  apng: `image/apng`,
  avif: `image/avif`,
  bmp: `image/bmp`,
  gif: `image/gif`,
  ico: `image/x-icon`,
  jpeg: `image/jpeg`,
  jpg: `image/jpeg`,
  png: `image/png`,
  svg: `image/svg+xml`,
  webp: `image/webp`,
};

/** 原 WBe */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value == `object` && !!value;
}

/** 原 Yk：标题回退链（工具标题 → 路径 basename → `Tool Preview`） */
export function resolvePreviewTitle(title: unknown, path?: string): string {
  return (typeof title === `string` ? title.trim() : ``) || (path ? baseName(path) : `Tool Preview`);
}

/** 原 Xk：对象多候选字段取第一个非空字符串 */
export function pickStringField(value: unknown, candidates: string[]): string | undefined {
  if (isPlainObject(value))
    for (const key of candidates) {
      const field = value[key];
      if (typeof field == `string` && field.trim()) return field;
    }
}

/** 原 Zk：unified diff 指纹 */
export function looksLikeUnifiedDiff(text: string): boolean {
  return /^(diff --git|--- |\+\+\+ |@@ )/m.test(text);
}

/** 原 Qk：字符串直判，否则对象字段抽取 */
export function extractPatchText(value: unknown): string | undefined {
  return typeof value == `string` && looksLikeUnifiedDiff(value)
    ? value
    : pickStringField(value, [`diff`, `patch`, `unifiedDiff`, `unified_diff`]);
}

/** 原 $k：内容文本字段抽取 */
export function extractContentText(value: unknown): string | undefined {
  return typeof value == `string`
    ? value
    : pickStringField(value, [`content`, `text`, `fileContent`, `contents`, `code`, `result`, `value`]);
}

/** 原 eA：路径字段抽取（9 候选键） */
export function extractPathField(value: unknown): string | undefined {
  return pickStringField(value, [
    `path`,
    `filePath`,
    `file_path`,
    `filename`,
    `targetPath`,
    `target_path`,
    `targetFile`,
    `target_file`,
    `file`,
  ]);
}

export interface ToolTextPreview {
  type: "text";
  title: string;
  path?: string;
  content: string;
  language: string;
}

/** 原 tA */
export function buildTextPreview(title: string, path: string | undefined, content: string): ToolTextPreview {
  return { type: `text`, title: title, path: path, content: content, language: detectPreviewLanguage(path, content) };
}

/** 原 nA：相对路径 → 工作区绝对（先解码；绝对者原样） */
export function resolvePreviewPath(rawPath: string | undefined, workspacePath: string): string | undefined {
  if (!rawPath) return;
  const decoded = decodeUriSafe(rawPath);
  return isAbsolutePath(decoded) ? decoded : resolvePathAgainst(workspacePath, decoded);
}

/** 原 rA：语言探测（扩展名表 → shebang → diff 指纹 → log 兜底） */
export function detectPreviewLanguage(path: string | undefined, content?: string): string {
  if (path) {
    const fileName = baseName(path);
    const extension = fileName.includes(`.`) ? fileName.split(`.`).pop()?.toLowerCase() : void 0;
    if (extension && EXTENSION_LANGUAGE_MAP[extension]) return EXTENSION_LANGUAGE_MAP[extension];
  }
  if (content?.startsWith(`#!/`)) {
    if (content.includes(`python`)) return `python`;
    if (content.includes(`bash`) || content.includes(`sh`)) return `bash`;
  }
  return content && looksLikeUnifiedDiff(content) ? `diff` : `log`;
}

/** 原 iA：扩展名 → 图片 MIME（CodeViewer.tsx 以 mimeTypeOfPath 声明） */
export function imageMimeTypeOfPath(path: string | undefined): string | null {
  if (!path) return null;
  const fileName = baseName(path);
  const extension = fileName.includes(`.`) ? fileName.split(`.`).pop()?.toLowerCase() : void 0;
  return extension ? (EXTENSION_IMAGE_MIME_MAP[extension] ?? null) : null;
}

/** 原 aA */
export function isImagePath(path: string | undefined): boolean {
  return imageMimeTypeOfPath(path) !== null;
}

/** 原 oA */
export function isPdfPreviewPath(path: string | undefined): boolean {
  return path ? baseName(path).toLowerCase().endsWith(`.pdf`) : false;
}

/** 原 sA */
export function isPptxPreviewPath(path: string | undefined): boolean {
  return path ? baseName(path).toLowerCase().endsWith(`.pptx`) : false;
}

/** 原 cA：可用路径（非空且非 /dev/null） */
export function isUsablePreviewPath(path: string | null | undefined): boolean {
  const trimmed = path?.trim();
  return !!(trimmed && trimmed !== `/dev/null`);
}

/** 原 GBe：去双引号包裹 */
export function unquoteDiffPath(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.length >= 2 && trimmed.startsWith(`"`) && trimmed.endsWith(`"`) ? trimmed.slice(1, -1) : trimmed;
}

/** 原 lA：去 a/ b/ 前缀 */
export function stripDiffSidePath(raw: string): string {
  const unquoted = unquoteDiffPath(raw);
  return unquoted.startsWith(`a/`) || unquoted.startsWith(`b/`) ? unquoted.slice(2) : unquoted;
}

/** 原 uA：--- / +++ 行单侧路径解析（引号转义或 TAB 截断） */
export function parseDiffSidePath(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith(`"`)) {
    const match = trimmed.match(/^"((?:\\.|[^"\\])+)"/);
    return match?.[1] ? stripDiffSidePath(match[1]) : null;
  }
  const head = trimmed.split(`	`, 1)[0]?.trim();
  return head ? stripDiffSidePath(head) : null;
}

/** 原 KBe：diff --git 头解析（新路径优先，回退旧路径） */
export function parseDiffGitHeaderPath(line: string): string | null {
  const match = line.match(/^diff --git (?:"((?:\\.|[^"\\])*)"|(\S+)) (?:"((?:\\.|[^"\\])*)"|(\S+))$/);
  const newSide = match?.[3] ?? match?.[4];
  const oldSide = match?.[1] ?? match?.[2];
  const fromNew = newSide ? stripDiffSidePath(newSide) : null;
  if (isUsablePreviewPath(fromNew)) return fromNew;
  const fromOld = oldSide ? stripDiffSidePath(oldSide) : null;
  return isUsablePreviewPath(fromOld) ? fromOld : null;
}

/** 原 qBe：全文扫描目标路径（先 ++ 侧，后 -- 侧兜底） */
export function extractDiffTargetPath(patch: string): string | null {
  for (const line of patch.split(/\r?\n/)) {
    const headerPath = parseDiffGitHeaderPath(line);
    if (headerPath) return headerPath;
    if (line.startsWith(`+++ `)) {
      const sidePath = parseDiffSidePath(line.slice(4));
      if (isUsablePreviewPath(sidePath)) return sidePath;
    }
  }
  for (const line of patch.split(/\r?\n/)) {
    if (!line.startsWith(`--- `)) continue;
    const sidePath = parseDiffSidePath(line.slice(4));
    if (isUsablePreviewPath(sidePath)) return sidePath;
  }
  return null;
}

export interface ToolPatchPreview {
  type: "patch";
  title: string;
  path?: string;
  patch: string;
}

export interface ToolFilePreview {
  type: "file";
  title: string;
  path: string;
}

export interface ToolImagePreview {
  type: "image";
  title: string;
  path: string;
  mediaType: string;
}

export type ToolPreviewSource = ToolTextPreview | ToolPatchPreview | ToolFilePreview | ToolImagePreview;

/** 原 JBe：patch 源路径（显式 path 优先，否则解析 patch 文本） */
export function resolvePatchPath(source: { path?: string; type?: string; patch?: string }): string | null {
  return isUsablePreviewPath(source.path) ? source.path! : source.type === `patch` ? extractDiffTargetPath(source.patch ?? ``) : null;
}

export interface CodeViewerSourceInput {
  type?: string;
  title?: string;
  path?: string;
  patch?: string;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  [key: string]: unknown;
}

/** 原 YBe 返回面（bundle js 50348–50365 字面）：type:"file" 回看源 */
export interface DiffPreviewFileSource {
  type: "file";
  title: string;
  path: string;
  workspacePath?: string;
  workspaceIdentity?: string;
  workspaceRemoteSessionId?: string;
  [key: string]: unknown;
}

/** 原 YBe：patch/multi-file-diff → 可回看文件源（CodeViewer.tsx 以 buildDiffPreviewSource 声明） */
export function buildDiffPreviewSource(source: CodeViewerSourceInput, workspacePath: string | null): DiffPreviewFileSource | null {
  const targetPath = resolvePatchPath(source);
  if (!targetPath) return null;
  const baseWorkspace = source.workspacePath ?? workspacePath;
  if (!isAbsolutePath(targetPath) && !baseWorkspace) return null;
  const resolved = resolvePreviewPath(targetPath, baseWorkspace ?? ``);
  return resolved
    ? {
        type: `file`,
        title: baseName(resolved),
        path: resolved,
        ...(baseWorkspace ? { workspacePath: baseWorkspace } : {}),
        ...(source.workspaceIdentity ? { workspaceIdentity: source.workspaceIdentity } : {}),
        ...(source.workspaceRemoteSessionId
          ? { workspaceRemoteSessionId: source.workspaceRemoteSessionId }
          : {}),
      }
    : null;
}

/**
 * 原 XBe（js 50367 / jsx 45198）：工具调用 → 预览源。
 * 优先级：raw 载荷（old/new → diff，否则全文）→ output/input 内嵌 diff →
 * 编辑族 before/after → 文本内容（读族 output 优先 / 写族 input 优先）→
 * 图片路径 → 纯文件路径。
 */
export function buildToolPreviewSource(toolCall: ToolCallLike, workspacePath?: string | null): ToolPreviewSource | null {
  const rawPayload = parseToolRawPayload(toolCall.raw);
  const resolvedPath = resolvePreviewPath(rawPayload?.path ?? extractPathField(toolCall.input) ?? extractPathField(toolCall.output), workspacePath ?? ``);
  const title = resolvePreviewTitle(toolCall.title ?? toolCall.kind, resolvedPath);
  const identity = classifyToolCall(toolCall);
  const isEditFamily = toolContentFamilyOf(toolCall, identity);
  const isReadFamily = identity.family === `file-read`;
  const isWriteFamily = toolEditFamilyOf(toolCall, identity);
  if (rawPayload) {
    const diffText = buildUnifiedDiffText(rawPayload.oldText ?? ``, rawPayload.newText ?? ``, resolvedPath ? baseName(resolvedPath) : `preview`);
    return diffText ? { type: `patch`, title: title, path: resolvedPath, patch: diffText } : { ...buildTextPreview(title, resolvedPath, rawPayload.newText ?? ``) };
  }
  const inlinePatch = extractPatchText(toolCall.output) ?? extractPatchText(toolCall.input);
  if (inlinePatch) return { type: `patch`, title: title, path: resolvedPath, patch: inlinePatch };
  if (isEditFamily) {
    const editPair = extractBeforeAfterEdit(toolCall.input) ?? extractBeforeAfterEdit(toolCall.output);
    if (editPair) {
      const diffText = buildUnifiedDiffText(editPair.before, editPair.after, resolvedPath ? baseName(resolvedPath) : `preview`);
      return diffText ? { type: `patch`, title: title, path: resolvedPath, patch: diffText } : { ...buildTextPreview(title, resolvedPath, editPair.after) };
    }
  }
  const contentText = isReadFamily
    ? (extractContentText(toolCall.output) ?? extractContentText(toolCall.input))
    : isWriteFamily
      ? (extractContentText(toolCall.input) ?? extractContentText(toolCall.output))
      : (extractContentText(toolCall.output) ?? extractContentText(toolCall.input));
  return contentText
    ? buildTextPreview(title, resolvedPath, contentText)
    : resolvedPath && (isEditFamily || isReadFamily || isWriteFamily) && isImagePath(resolvedPath)
      ? { type: `image`, title: title, path: resolvedPath, mediaType: imageMimeTypeOfPath(resolvedPath) ?? `application/octet-stream` }
      : resolvedPath
        ? { type: `file`, title: title, path: resolvedPath }
        : null;
}

/** 原 ZBe（js 50401 / jsx 45250）：工具调用 → 纯文本内容预览（无 diff/图片/文件降级） */
export function buildToolContentPreview(toolCall: ToolCallLike, workspacePath?: string | null): ToolTextPreview | null {
  const rawPayload = parseToolRawPayload(toolCall.raw);
  const resolvedPath = resolvePreviewPath(rawPayload?.path ?? extractPathField(toolCall.input) ?? extractPathField(toolCall.output), workspacePath ?? ``);
  const title = resolvePreviewTitle(toolCall.title ?? toolCall.kind, resolvedPath);
  const identity = classifyToolCall(toolCall);
  const isEditFamily = toolContentFamilyOf(toolCall, identity);
  const isReadFamily = identity.family === `file-read`;
  const isWriteFamily = toolEditFamilyOf(toolCall, identity);
  if (rawPayload) return buildTextPreview(title, resolvedPath, rawPayload.newText ?? ``);
  if (isEditFamily) {
    const editPair = extractBeforeAfterEdit(toolCall.input) ?? extractBeforeAfterEdit(toolCall.output);
    if (editPair) return buildTextPreview(title, resolvedPath, editPair.after);
  }
  const contentText = isReadFamily
    ? (extractContentText(toolCall.output) ?? extractContentText(toolCall.input))
    : isWriteFamily
      ? (extractContentText(toolCall.input) ?? extractContentText(toolCall.output))
      : (extractContentText(toolCall.output) ?? extractContentText(toolCall.input));
  return contentText ? buildTextPreview(title, resolvedPath, contentText) : null;
}

/* ============================================================================
 * 6. 预览卡群微件（原 51221–51233）
 * ==========================================================================*/

/** 原 ej：行内动作行（flex + gap-1） */
export const InlineActionRow: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <div className={cn(`flex items-center gap-1`, className)} {...rest}>
    {children}
  </div>
);

/** 原 tj：行内图标按钮（sr-only 标签 + 可选 Tooltip side=bottom） */
export const InlineIconButton: React.FC<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    tooltip?: string;
    label?: string;
    variant?: string;
    size?: string;
    children?: React.ReactNode;
  }
> = ({ tooltip, children, label, variant = `ghost`, size = `icon-sm`, ...rest }) => {
  const button = (
    <Button size={size} type="button" variant={variant} {...rest}>
      {children}
      <span className={`sr-only`}>{label || tooltip}</span>
    </Button>
  );
  return tooltip ? (
    <Tooltip title={tooltip} side={`bottom`}>
      {button}
    </Tooltip>
  ) : (
    button
  );
};

/* ============================================================================
 * 尾：符号表（混淆名 → 语义名 → 实测 js 行 / jsx 行，便于反查）
 * ----------------------------------------------------------------------------
 *  Uze MIN_DIAGRAM_ZOOM 48114/43290 | ek clampDiagramZoom 48115/43291
 *  tk zoomDiagramAt 48118/43294 | nk panDiagram 48125/43305
 *  Wze fitDiagramToViewport 48128/43312 | rk IDENTITY_DIAGRAM_TRANSFORM 48143/43335
 *  Gze DIAGRAM_ZOOM_PRESETS 48144/43340 | Kze SVG_RENDERED_SELECTOR 48145/43341
 *  qze SVG_NON_RENDERED_SELECTOR 48158/43342 | ik pointerCenter 48173/43343
 *  ak pointerDistance 48179/43353 | Jze isInvisiblePaint 48183/43357
 *  ok svgRootBounds 48187/43361 | sk applySvgRootBounds 48196/43379
 *  ck serializeRect 48209/43383 | Yze svgBBox 48214/43393 | Xze unionBounds 48222/43406
 *  Zze isBackgroundRect 48229/43423 | lk measureSvgContentBounds 48244/43429
 *  uk toViewportLocalPoint 48265/43457 | Qze MermaidFullscreenDialog 48269/43464
 *  dk DiagramToolbarButton 48558/43723
 *  MBe MarkdownTableStickyScrollbar 49138/44247 | Lk TableToolbarButton 49758/44688
 *  Rk ORIGIN_POINT 49801/44730 | zk LIGHTBOX_DOWNLOAD_MAX_BYTES 49802/44734
 *  RBe MIME_TO_DOWNLOAD_EXTENSION 49803/44735 | zBe clampPanOffset 49811/44743
 *  Bk downloadBaseName 49819/44751 | Vk LightboxDownloadError 49828/44754
 *  Hk isHttpDownloadSource 49833/44759 | Uk summarizeDownloadSource 49836/44762
 *  BBe downloadBlobWithSizeLimit 49845/44771 | VBe openUrlInNewTab 49873/44804
 *  Wk ImageLightbox 49882/44808 | qk ImageGalleryGroup 50165/45007
 *  HBe TOOL_PREVIEW_TEXT_LIMIT 50177/45015 | Jk EXTENSION_LANGUAGE_MAP 50178/45015
 *  UBe EXTENSION_IMAGE_MIME_MAP 50212/45015 | WBe isPlainObject 50224/45062
 *  Yk resolvePreviewTitle 50227/45065 | Xk pickStringField 50230/45068
 *  Zk looksLikeUnifiedDiff 50237/45074 | Qk extractPatchText 50240/45077
 *  $k extractContentText 50245/45080 | eA extractPathField 50250/45083
 *  tA buildTextPreview 50263/45086 | nA resolvePreviewPath 50266/45095
 *  rA detectPreviewLanguage 50271/45100 | iA imageMimeTypeOfPath 50283/45112
 *  aA isImagePath 50289/45118 | oA isPdfPreviewPath 50292/45121
 *  sA isPptxPreviewPath 50295/45124 | cA isUsablePreviewPath 50298/45127
 *  GBe unquoteDiffPath 50302/45131 | lA stripDiffSidePrefix 50306/45135
 *  uA parseDiffSidePath 50310/45139 | KBe parseDiffGitHeaderPath 50320/45149
 *  qBe extractDiffTargetPath 50329/45158 | JBe resolvePatchPath 50345/45174
 *  YBe buildDiffPreviewSource 50348/45177 | XBe buildToolPreviewSource 50367/45198
 *  ZBe buildToolContentPreview 50401/45250
 *  ej InlineActionRow 51221/46037 | tj InlineIconButton 51223/46042
 *
 *  双归属/已覆盖注记：
 *   - DropdownMenu 原语族 47974–48113（旧登记 47926–48040）= X03，排除只注记；
 *   - Ik/vBe…jBe/Gk/Kk = MarkdownIntegration.tsx；vA…TA = BrowserPane.tsx §1；
 *   - AA…QA（50907–51197）= FileTreePanel.tsx（本批 B 段）；
 *   - HBe…ZBe 行号（旧登记 50129–50372）位于 A 段两行范围间隙，按任务点名
 *     「预览卡群」语义纳入（报告 §3.4 裁决）。
 * ============================================================================
 */
