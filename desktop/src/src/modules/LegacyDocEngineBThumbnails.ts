/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineBThumbnails.ts — legacy-doc 内部引擎 [E5] 缩略图常量层
 * （解混淆重建 · D8 Stage B4 · Office 预览族 · 批次 B）
 * ============================================================================
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （47,538 行，未修改；JSX 还原版 src-reconstructed/renderer/assets/
 *  previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx，36,535 行，行号锚点均指 jsx）
 *
 * 覆盖区段：[E5] jsx 14902-15113（212 行，本文件全量逐句转录）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（jsx 行）
 * ----------------------------------------------------------------------------
 *  缩略图常量簇：
 *   Xs → THUMBNAIL_EXCLUDE_ATTR        缩略图排除数据属性名 (4351)
 *   —  → （死代码）排除选择器拼接表达式，打包器保留的无赋值语句 (14903)
 *   Zs → THUMBNAIL_HIGHLIGHT_COLORS    缩略图高亮色板（8 色 → hex）(14904-14917)
 *   Qs → THUMBNAIL_HEADING_CSS_STYLES  缩略图标题 1-6 级 CSS 样式 (14918-14956)
 *   $s → THUMBNAIL_HEADING_METRICS     缩略图标题 1-6 级度量（字体/字号/粗体/色）(14957-14988)
 *   ec..wc → THUMBNAIL_LAYOUT_CONSTANTS 缩略图/页面布局常量 22 项 (14989-15015)
 *   Tc → IMPORT_PERF_MARK_PREFIX       性能标记前缀 `react-docx.import` (15015)
 *
 *  性能标记助手：
 *   Ec → markPerf                      performance.mark 安全包装 (15016-15020)
 *   Dc → measurePerf                   performance.measure 安全包装 (15021-15025)
 *   Oc → perfMarkName                  文件名 → 标记名（时间戳+净化）(15026-15029)
 *
 *  编辑器核心常量簇（[E6] 各子系统的阈值/键集/缓存，行区段属 [E5]）：
 *   kc..Dl → EDITOR_CORE_CONSTANTS     48 项：分页忽略属性/页边距/断页正则/
 *                                      缓存容量/布局度量/键集 (15030-15095)
 *   Ol → NAVIGATION_KEYS               光标导航键集 (7007)
 *   kl → MODIFIER_KEYS                 修饰键集 (7010)
 *   Al..Ul → 引擎缓存 14 座            段落断页标记/缩进/首字下沉/文本宽度/
 *                                      断词等 Map/WeakMap 缓存 (15098-15103)
 *
 *  缓存助手：
 *   Wl → boundedCacheSet               容量受限 Map 写入（先进先出淘汰，
 *                                      容量 EDITOR_CACHE_CAPACITY=4000）(15104-15110)
 *   Gl → normalizeRowHeightPx          表格行高归一（非法 → -1，合法 → ≥1 整数）(15111-15113)
 *
 * ----------------------------------------------------------------------------
 * 二、消费方（跨段引用，供接线核对）
 * ----------------------------------------------------------------------------
 *   Zs ← e_（高亮色解析，[E6] jsx 19874）
 *   Qs ← d_（段落 CSS 样式，无 sourceXml 的合成段落标题回退，[E6] jsx 20052）
 *   $s ← Xl（标题样式表展开，[E6] jsx 15134）/ _S（标题度量查询，[E6] jsx 26757）
 *   Ec/Dc/Oc ← tS 导入管线性能埋点（[E6] jsx 24843-24871）
 *   Wl/Gl/缓存簇 ← [E6] 布局/测量/分页各子系统（15114 起）
 * ============================================================================
 */

/* ============================================================================
 * §1 缩略图排除标记（原 Xs + 死代码选择器，jsx 14902-14903）
 * ==========================================================================*/

/** 原 Xs：缩略图渲染时需要排除的元素数据属性名 */
export const THUMBNAIL_EXCLUDE_ATTR = `data-docx-thumbnail-exclude`;

/**
 * 原 jsx 14903：打包器保留的裸表达式（无赋值目标，运行期无副作用）。
 * 语义 = 缩略图排除选择器列表：被标记的元素 + 文本域 + 图片缩放手柄 + 表格移动手柄。
 * 此处按原样登记为常量（原代码未保留其结果）。
 */
export const THUMBNAIL_EXCLUDE_SELECTOR = [
  `[${THUMBNAIL_EXCLUDE_ATTR}="true"]`,
  `textarea`,
  `[data-image-resize-handle="true"]`,
  `[data-docx-table-move-handle="true"]`,
].join(`,`);

/* ============================================================================
 * §2 缩略图高亮色板（原 Zs，jsx 14904-14917）
 * ==========================================================================*/

/** 原 Zs：DOCX 高亮色名 → 缩略图渲染色（浅色近似值） */
export const THUMBNAIL_HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: `#fff59d`,
  green: `#bbf7d0`,
  cyan: `#a5f3fc`,
  magenta: `#f5d0fe`,
  red: `#fecaca`,
  blue: `#bfdbfe`,
  black: `#111827`,
  white: `#ffffff`,
};

/* ============================================================================
 * §3 缩略图标题样式（原 Qs/$s，jsx 14918-14988）
 * ==========================================================================*/

/** 缩略图标题 CSS 样式（原 Qs 值类型） */
export interface ThumbnailHeadingCssStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  color: string;
}

/** 原 Qs：标题 1-6 级 → 缩略图 CSS 样式（合成段落无 sourceXml 时的回退） */
export const THUMBNAIL_HEADING_CSS_STYLES: Record<number, ThumbnailHeadingCssStyle> = {
  1: { fontFamily: `"Calibri Light", Calibri, sans-serif`, fontSize: `16pt`, fontWeight: 600, color: `#2f5496` },
  2: { fontFamily: `"Calibri Light", Calibri, sans-serif`, fontSize: `13pt`, fontWeight: 600, color: `#2f5496` },
  3: { fontFamily: `"Calibri", sans-serif`, fontSize: `12pt`, fontWeight: 600, color: `#1f3763` },
  4: { fontFamily: `"Calibri", sans-serif`, fontSize: `11pt`, fontWeight: 600, color: `#1f3763` },
  5: { fontFamily: `"Calibri", sans-serif`, fontSize: `11pt`, fontWeight: 600, color: `#1f3763` },
  6: { fontFamily: `"Calibri", sans-serif`, fontSize: `11pt`, fontWeight: 600, color: `#1f3763` },
};

/** 缩略图标题度量（原 $s 值类型） */
export interface ThumbnailHeadingMetrics {
  fontFamily: string;
  fontSizePt: number;
  bold: boolean;
  color: string;
}

/** 原 $s：标题 1-6 级 → run 度量（Xl 展开样式表 / _S 快照渲染用） */
export const THUMBNAIL_HEADING_METRICS: Record<number, ThumbnailHeadingMetrics> = {
  1: { fontFamily: `Calibri Light`, fontSizePt: 16, bold: true, color: `#2f5496` },
  2: { fontFamily: `Calibri Light`, fontSizePt: 13, bold: true, color: `#2f5496` },
  3: { fontFamily: `Calibri`, fontSizePt: 12, bold: true, color: `#1f3763` },
  4: { fontFamily: `Calibri`, fontSizePt: 11, bold: true, color: `#1f3763` },
  5: { fontFamily: `Calibri`, fontSizePt: 11, bold: true, color: `#1f3763` },
  6: { fontFamily: `Calibri`, fontSizePt: 11, bold: true, color: `#1f3763` },
};

/* ============================================================================
 * §4 缩略图/页面布局常量（原 ec..Tc，jsx 14989-15015）
 * ==========================================================================*/

export const PAGE_GRID_GAP_PX = 28; // 原 ec：页面网格间距（ES 根容器 gap）
export const ROW_HEIGHT_TOLERANCE_PX = 2; // 原 tc：行高比较容差
export const DEFAULT_FONT_SIZE_PT = 11; // 原 nc：缺省字号（磅）
export const DEFAULT_LINE_SPACING_MULTIPLE = 0.65; // 原 rc：行距比例下限参考
export const SINGLE_LINE_SPACING = 1; // 原 ic：单倍行距
export const COMPACT_LINE_FACTOR = 0.88; // 原 ac：紧凑行系数
export const DENSE_LINE_FACTOR = 0.9; // 原 oc：密集行系数
export const NORMAL_LINE_FACTOR = 1.08; // 原 sc：常规行系数
export const LOOSE_LINE_FACTOR = 1.21; // 原 cc：宽松行系数
export const ONE_POINT_FIVE_LINE = 1.15; // 原 lc：1.5 倍行距近似
export const ONE_POINT_FIVE_LINE_ALT = 1.15; // 原 uc：1.5 倍行距（另一路径）
export const DOUBLE_LINE_FACTOR = 1.08; // 原 dc：双倍行距近似
export const MIN_LINE_SPACING_RATIO = 0.1; // 原 fc：行距比例下限
export const MIN_BLOCK_HEIGHT_PX = 14; // 原 pc：块级最小高度（全引擎通用）
export const FLOATING_IMAGE_CLEARANCE_PX = 18; // 原 mc：浮动图与页眉/页脚净空
export const HEADER_SPACING_ADJUST_PX = 8; // 原 hc：页眉存在时的高度修正
export const FOOTER_OVERLAP_TOLERANCE_PX = 24; // 原 gc：页脚重叠容差
export const FOOTER_CLEARANCE_A_PX = 8; // 原 _c：页脚净空（上）
export const FOOTER_CLEARANCE_B_PX = 8; // 原 vc：页脚净空（中）
export const FOOTER_CLEARANCE_C_PX = 8; // 原 yc：页脚净空（下）
export const PAGINATION_SETTLE_MS = 180; // 原 bc：分页稳定等待缺省值
export const INITIAL_PAGE_NUMBER = 1; // 原 xc：起始页码
export const DEFAULT_LINE_PITCH_TWIPS = 240; // 原 Sc：文档网格行距缺省（twips）
export const ZERO_OFFSET_A = 0; // 原 Cc：零偏移（a）
export const ZERO_OFFSET_B = 0; // 原 wc：零偏移（b）
export const IMPORT_PERF_MARK_PREFIX = `react-docx.import`; // 原 Tc：性能标记前缀

/* ============================================================================
 * §5 性能标记助手（原 Ec/Dc/Oc，jsx 15016-15029）
 * ==========================================================================*/

/** 原 Ec：performance.mark 安全包装（环境缺失/异常静默） */
export function markPerf(name: string): void {
  if (!(typeof performance > `u` || typeof performance.mark != `function`))
    try {
      performance.mark(name);
    } catch {}
}

/** 原 Dc：performance.measure 安全包装（环境缺失/异常静默） */
export function measurePerf(name: string, startMark: string, endMark: string): void {
  if (!(typeof performance > `u` || typeof performance.measure != `function`))
    try {
      performance.measure(name, startMark, endMark);
    } catch {}
}

/** 原 Oc：导入文件名 → 唯一性能标记名（净化 + 时间戳，截断 80 字符） */
export function perfMarkName(fileName: string): string {
  const sanitized = fileName.replace(/[^a-z0-9._-]+/gi, `_`).slice(0, 80);
  return `${IMPORT_PERF_MARK_PREFIX}.${Date.now()}.${sanitized}`;
}

/* ============================================================================
 * §6 编辑器核心常量（原 kc..Dl，jsx 15030-15095）
 * —— [E6] 分页/选区/键盘/缓存各子系统的阈值，区段属 [E5] 范围
 * ==========================================================================*/

export const KEY_CODE_MIN_LAYOUT = 1; // 原 kc：布局键码下限
export const KEY_CODE_PAGE_NAV = 4; // 原 Ac：页面导航键码
export const KEY_CODE_IME_COMPOSITION = 259; // 原 jc：IME 合成键码（229/259 族）
export const KEY_CODE_SHIFT = 160; // 原 Mc：Shift 键码
/** 原 Nc：分页忽略属性名（手柄/浮层等合成元素不参与分页测量） */
export const PAGINATION_IGNORE_ATTR = `data-docx-pagination-ignore`;
/** 原 Pc：分页忽略元素的外扩边距 */
export const PAGINATION_IGNORE_INSET_PX = { top: 4, right: 4, bottom: 4, left: 4 };
export const FALLBACK_FONT_FAMILY = `Times New Roman`; // 原 Fc：无字体信息时的兜底字体
export const NUMBERING_LABEL_FONT_SIZE_PX = 18; // 原 Ic：编号标签字号参考
export const NUMBERING_LABEL_FONT_WEIGHT = 700; // 原 Lc：编号标签字重参考
export const NUMBERING_LABEL_GAP_PX = 2; // 原 Rc：编号标签间距
export const NUMBERING_LABEL_MIN_WIDTH_PX = 8; // 原 zc：编号标签最小宽度

/* --- 断页/分节检测正则（原 Bc..Jc） --- */
export const PAGE_BREAK_BR_REGEX = /<w:br\b[^>]*w:type="page"[^>]*\/?>/i; // 原 Bc
export const COLUMN_BREAK_BR_REGEX = /<w:br\b[^>]*w:type="column"[^>]*\/?>/i; // 原 Vc
export const LAST_RENDERED_PAGE_BREAK_REGEX = /<w:lastRenderedPageBreak\b[^>]*\/?>/i; // 原 Hc
export const PAGE_BREAK_BEFORE_REGEX = /<w:pageBreakBefore\b[^>]*\/?>/i; // 原 Uc
export const SECTION_PROPS_REGEX = /<w:sectPr\b[\s\S]*?<\/w:sectPr>/i; // 原 Wc
export const SECTION_TYPE_REGEX = /<w:type\b[^>]*w:val="([^"]+)"/i; // 原 Gc
export const BOOKMARK_START_REGEX = /<w:bookmarkStart\b[^>]*w:name="([^"]+)"/gi; // 原 Kc
export const FOOTNOTE_REFERENCE_REGEX = /<w:footnoteReference\b[^>]*w:id="(-?\d+)"/gi; // 原 qc
export const ENDNOTE_REFERENCE_REGEX = /<w:endnoteReference\b[^>]*w:id="(-?\d+)"/gi; // 原 Jc

/* --- 缓存容量与布局度量（原 Yc..Dl） --- */
export const EDITOR_CACHE_CAPACITY = 4000; // 原 Yc：boundedCacheSet 容量
export const TEXT_MEASURE_CACHE_LIMIT = 12000; // 原 Xc：文本测量缓存上限
export const ANNOTATION_GUTTER_WIDTH_PX = 48; // 原 Zc：批注槽宽度
export const ANNOTATION_GUTTER_MIN_PX = 20; // 原 Qc：批注槽最小值
export const ANNOTATION_ANCHOR_OFFSET_PX = 0; // 原 $c：批注锚点偏移
export const ANNOTATION_CARD_MIN_HEIGHT_PX = 22; // 原 el：批注卡最小高
export const ANNOTATION_CARD_GAP_PX = 6; // 原 tl：批注卡间距
export const ANNOTATION_LANE_HEIGHT_PX = 24; // 原 nl：批注泳道高
export const PAGE_TAIL_REMAIN_RATIO = 0.18; // 原 rl：页尾剩余判定比例
export const PAGE_TAIL_REMAIN_MIN_PX = MIN_BLOCK_HEIGHT_PX * 3; // 原 il=pc*3：页尾剩余下限
export const PAGE_TAIL_REMAIN_MAX_PX = 120; // 原 al：页尾剩余上限
export const GUTTER_PADDING_A_PX = 4; // 原 ol
export const GUTTER_PADDING_B_PX = 0; // 原 sl
export const GUTTER_PADDING_C_PX = 4; // 原 cl
export const GUTTER_PADDING_D_PX = 8; // 原 ll
export const GUTTER_CONNECTOR_WIDTH_PX = 2; // 原 ul
export const GUTTER_CONNECTOR_GAP_PX = 4; // 原 dl
export const DRAG_SCROLL_ZONE_PX = 96; // 原 fl：拖拽滚动触发区
export const DRAG_SCROLL_STEP_PX = 2; // 原 pl
export const DRAG_SCROLL_MIN_PX = 0; // 原 ml
export const DRAG_SCROLL_PAGE_PX = 1; // 原 hl
export const DOUBLE_CLICK_INTERVAL_MS = 350; // 原 gl：双击判定间隔
export const CONTEXT_MENU_WIDTH_PX = 220; // 原 _l：右键菜单宽度参考
export const ENABLE_LAYOUT_SMOOTHING = true; // 原 vl：布局平滑开关
export const LINE_HEIGHT_FALLBACK_FACTOR = 1.08; // 原 yl：行高兜底系数
export const TWIPS_PER_POINT_REF = 15; // 原 bl：twips 参考换算
export const DOUBLE_MIN_BLOCK_HEIGHT_PX = MIN_BLOCK_HEIGHT_PX * 2; // 原 xl=pc*2
export const LETTERHEAD_COLUMN_MIN_COUNT = 2; // 原 Sl：信头双栏判定
export const INACTIVE_REGION_OPACITY = 0.5; // 原 Cl：非激活页眉/页脚透明度
export const LETTERHEAD_INDENT_MIN_TWIPS = 900; // 原 wl：信头缩进下限（twips）
export const LETTERHEAD_INDENT_MAX_TWIPS = 4200; // 原 Tl：信头缩进上限（twips）
export const LETTERHEAD_TEXT_MAX_CHARS = 96; // 原 El：信头判定文本长度上限
export const FRAME_PR_NEIGHBOR_RADIUS = 3; // 原 Dl：framePr 邻域扫描半径

/* ============================================================================
 * §7 键盘键集（原 Ol/kl，jsx 15096-15097）
 * ==========================================================================*/

/** 原 Ol：光标导航/编辑键集（选区会话判定用） */
export const NAVIGATION_KEYS = new Set([
  `ArrowLeft`,
  `ArrowRight`,
  `ArrowUp`,
  `ArrowDown`,
  `Home`,
  `End`,
  `PageUp`,
  `PageDown`,
  `Backspace`,
  `Delete`,
  `Enter`,
  `Tab`,
]);

/** 原 kl：修饰键集（不单独触发选区会话） */
export const MODIFIER_KEYS = new Set([`Shift`, `Control`, `Meta`, `Alt`, `CapsLock`]);

/* ============================================================================
 * §8 引擎缓存簇（原 Al..Ul，jsx 15098-15103）
 * —— 键多为段落 sourceXml（字符串）或节点对象；容量见 §6
 * ==========================================================================*/

/** 段落断页标记缓存（原 Al：sourceXml → 断页/分节标记集，消费方 wm..Lm） */
export const paragraphBreakFlagsCache = new Map<string, {
  explicitPageBreak: boolean;
  explicitColumnBreak: boolean;
  lastRenderedPageBreak: boolean;
  pageBreakBefore: boolean;
  sectionBreakStartsNewPage: boolean;
}>();
/** 引擎缓存（原 jl：布局子系统，锚点 18040+ 区域消费） */
export const engineCacheJl = new Map<string, unknown>();
/** 引擎缓存（原 Ml：布局子系统，锚点 18040+ 区域消费） */
export const engineCacheMl = new Map<string, unknown>();
/** 引擎缓存（原 Nl：节点级 WeakMap，锚点 18040+ 区域消费） */
export const engineCacheNl = new WeakMap<object, unknown>();
/** 段落缩进缓存（原 Pl：sourceXml → w:ind 解析结果，消费方 s_） */
export const paragraphIndentCache = new Map<
  string,
  { leftTwips?: number; firstLineTwips?: number; hangingTwips?: number } | null
>();
/** 首字下沉缓存（原 Fl：sourceXml → framePr 解析结果，消费方 Zl） */
export const dropCapCache = new Map<string, unknown | null>();
/** 引擎缓存（原 Il：渲染子系统，锚点 20944+ 区域消费） */
export const engineCacheIl = new Map<string, unknown>();
/** 引擎缓存（原 Ll：渲染子系统，锚点 20944+ 区域消费） */
export const engineCacheLl = new Map<string, unknown>();
/** 引擎暂存（原 Rl：模块级可变暂存位，初始 undefined） */
export let engineScratchRl: unknown = undefined;
/** 引擎缓存（原 zl：渲染子系统，锚点 20944+ 区域消费） */
export const engineCacheZl = new Map<string, unknown>();
/** 启发式文本宽度缓存（原 Bl：`字号\0文本` → 估算像素宽，消费方 rm） */
export const heuristicTextWidthCache = new Map<string, number>();
/** 断词策略缓存（原 Vl：文本 → keep-all/normal，消费方 Lp） */
export const wordBreakCache = new Map<string, `keep-all` | `normal`>();
/** 引擎缓存（原 Hl：节点级 WeakMap，锚点 20944+ 区域消费） */
export const engineCacheHl = new WeakMap<object, unknown>();
/** 引擎缓存（原 Ul：节点级 WeakMap，锚点 20944+ 区域消费） */
export const engineCacheUl = new WeakMap<object, unknown>();

/* ============================================================================
 * §9 缓存助手（原 Wl/Gl，jsx 15104-15113）
 * ==========================================================================*/

/**
 * 原 Wl：容量受限 Map 写入——超容量时淘汰最早插入键（先进先出），
 * 容量 = EDITOR_CACHE_CAPACITY（4000）。
 */
export function boundedCacheSet<K, V>(cache: Map<K, V>, key: K, value: V): void {
  if (!cache.has(key) && cache.size >= EDITOR_CACHE_CAPACITY) {
    const oldest = cache.keys().next().value;
    oldest !== void 0 && cache.delete(oldest);
  }
  cache.set(key, value);
}

/** 原 Gl：表格行高归一——非有限/≤0 → -1（未测量），否则 ≥1 的整数像素 */
export function normalizeRowHeightPx(height: number): number {
  return !Number.isFinite(height) || height <= 0 ? -1 : Math.max(1, Math.round(height));
}
