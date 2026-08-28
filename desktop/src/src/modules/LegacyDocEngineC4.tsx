/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineC4.tsx — legacy-doc 内部引擎 [E7] 交互回调簇 · 后半：
 * 节区图片交互/图片拖放/包裹段落渲染器/runs 渲染器/拖放导入/单元格切片/
 * fs 节点渲染器/ps 页流渲染器/脚注簇
 * （解混淆重建 · D8 Stage B5 · Office 预览族 · 批次 B5-09 · C4）
 * ============================================================================
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （未修改；行号锚点均指 jsx 还原版 previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx）
 * 覆盖区段：[E7] ES 交互回调簇后半 jsx 31874-35407
 *
 * 与批 B / 批 C3 的关系：
 *  - LegacyDocEngineBPageRenderer.tsx（批 B）覆盖 props/状态骨架/分页 memo 链
 *    （jsx 27340-27888）与最终 JSX（35408-36416）。
 *  - LegacyDocEngineC3.tsx（本批前半）覆盖交互回调簇前半 jsx 27889-31873。
 *  - 本件实体化回调簇后半（31874-35407）。不改动批 B / C3 任何文件；接口面按
 *    DocxEditorViewInteractionCore 对接，契约差异记录于 LegacyDocEngineC34.report.md。
 *
 * 重建口径（本件特化）：
 *  - 类名/字符串常量/data-* 属性/分支结构零改动（逐句对照转录）。
 *  - 本区段以渲染器为主（Yo/Xo/ds/fs/ps），其内部对跨模块助手（[E1]-[E6]、
 *    批 B 布局/文本助手、以及 C3 已实体化的交互回调）的引用，一律保留源混淆
 *    标识符并以 §0 `declare const X: any` 契约挂接，以保证逐字保真、零改写。
 *    语义解析见 §A 映射表与报告；集成时由 DocxEditorView 将 C3 表面/批 B 助手
 *    注入同名绑定。此为渲染密集区段的刻意取舍，已在报告中登记。
 *  - 本件自定义顶层符号同样保留源名于代码中，语义名见 §A / 文件尾符号表。
 *
 * ----------------------------------------------------------------------------
 * §A 混淆名 → 语义名 映射（本件实体化符号，jsx 行）
 * ----------------------------------------------------------------------------
 *  节区图片/拖放面：
 *   Fo → beginSectionImagePointerMove (31877) | zo → selectSectionImageOnTap (31949)
 *   Vo → handleImageDragStart (31952) | Ho → handleImageDragEnd (31959)
 *   Uo → beginCornerResize (31962) | Wo → beginCornerResizeDraft (32011)
 *   Go → beginEmbeddedTableMove (32060) | Ko → tableInteractionContext (32099)
 *   qo → commitImageDrop (32126) | Jo → renderImageDropZone (32146)
 *  渲染器面：
 *   Yo → renderWrappedParagraph (32174) | Xo → renderParagraphRuns (32506)
 *   ds → renderTableCellSlice (33726) | fs → renderNode (33827)
 *   ps → renderPageFlow (35044)
 *  拖放导入面：
 *   Zo → dataTransferHasFiles (33516) | Qo → findDocxFileInTransfer (33517)
 *   $o → handleRootDragEnter (33518) | es → handleRootDragLeave (33533)
 *   ts → handleRootDrop (33536)
 *  单元格切片布局面：
 *   ns → minCellContentWidthPx (33572) | rs → documentFontFamily (33573)
 *   is → pageSurfaceStyle (33574) | ls → cellLayoutSignature (33594)
 *   us → cellSliceLayoutEntries (33600)
 *  脚注簇：
 *   gs → footnoteNumberById (35334) | _s → endnoteNumberById (35335)
 *   vs → footnoteById (35336) | ys → endnoteById (35337)
 *   bs → footnoteRefsByPage (35338) | xs → orderedEndnotes (35348)
 *   Ss → referencedFootnoteIds (35360) | Cs → unreferencedFootnotes (35368)
 *   ws → renderFootnoteParagraphs (35369) | Ts → sectionDraftHandlers (35391)
 *   Es → beginHeaderFooterEdit (35398)
 *
 * 把握度分级：
 *  [高] 字符串/类名/分支逐字对照；[中] 渲染器助手语义名为推断；[低] 待属主批确认。
 * ==========================================================================*/

import React from "react";
import type {
  DocxEditorModel,
  DocxNode,
  DocxLocation,
} from "./LegacyDocEngineBModel";
import type { DocxEditorState } from "./LegacyDocEngineBEditorState";
import type { DocxEditorViewInteractionCore } from "./LegacyDocEngineC3";

/* ============================================================================
 * §0 跨段/跨模块助手契约（源混淆名挂接，集成时注入；详见报告）
 * 说明：本区段渲染器对下列绑定的调用保持源逐字，故以 any 契约声明。
 * ==========================================================================*/
declare const $: any; // jsx 运行时（(0,$.jsx)/(0,$.jsxs)）
declare const fa: any; // 点位边界（boundaryAtPoint，C3）
declare const Jx: any; // 节区图片键（jsx 24230 模块级）
declare const Eh: any; // 单元格行切片几何（jsx 18454 模块级）
declare const Yx: any; // 表格几何助手（jsx 24241 模块级）
declare const tg: any; // 表格助手（jsx 18759 模块级）
declare const wv: any; // 表格助手（jsx 21104 模块级）
declare const up: any; // run 字体判定（jsx 16809 模块级）
declare const Zp: any; // run 字体解析（jsx 17686 模块级）
declare const sp: any; // run 助手（jsx 16791 模块级）
declare const cx: any; // run 助手（jsx 23791 模块级）
declare const j_: any; // 表单域助手（jsx 20269 模块级）
declare const E_: any; // 表单域助手（jsx 20244 模块级）
declare const Xs: string; // data-docx-thumbnail-exclude 属性名（jsx 14902 模块级）
declare const sa: any; // 应用 DOM 选区（applyDomSelection，C3）
declare const xa: any; // 设置包裹段落文本范围（C3）
declare const ya: any; // 选区同步入队（C3）
declare const Sa: any; // 包裹段落选区提交（C3）
declare const Ca: any; // 包裹段落草稿提交（C3）
declare const za: any; // 段落定位光标（focusParagraphAtOffset，C3）
declare const Ru: any; // 帧调度（scheduleFrame）
declare const Ri: any; // 清空表格选区（clearTableSelection，C3）
declare const pa: any; // 读取 DOM 选区（selectionFromDom，C3）
declare const Ji: any; // 设置右键菜单（setContextMenu）
declare const Yi: any; // 设置表格右键菜单（setTableContextMenu）
declare const Ao: any; // 图片指针移动（beginImagePointerMove，C3）
declare const ko: any; // 图片缩放（beginImageResize，C3）
declare const Do: any; // 列缩放（beginColumnResize，C3）
declare const Oo: any; // 行缩放（beginRowResize，C3）
declare const xo: any; // 草稿列宽解析（resolveColumnWidthsDraft，C3）
declare const So: any; // 草稿行高解析（resolveRowHeightsDraft，C3）
declare const To: any; // 列缩放（渲染侧，beginColumnResize）
declare const Eo: any; // 行缩放（渲染侧，beginRowResize）
declare const Gi: any; // 表格移动（beginTableMove）
declare const Qi: any; // 表格边界→单元格定位
declare const Ui: any; // 表格选区锚点
declare const Wi: any; // 表格移动目标命中
declare const Li: any; // 表格选区锚点设置
declare const ka: any; // 表格单元格拖选（beginTableCellDragSelection，C3）
declare const qa: any; // 表格单元格文本范围同步
declare const Ba: any; // 单元格段落定位
declare const Ya: any; // 单元格草稿刷新
declare const Ta: any; // 首字下沉选中（setSelectedDropCap）
declare const Va: any; // 段落端点定位
declare const Ha: any; // 包裹行命中判定
declare const Ga: any; // 折叠光标点
declare const Ja: any; // 光标导航同步
declare const Ma: any; // 快捷键判定（导航）
declare const Fa: any; // 快捷键判定（编辑）
declare const _o: any; // 撤销/重做键
declare const Ia: any; // 输入拦截判定
declare const Ax: any; // 合成键判定（isCompositionKey）
declare const jx: any; // 方向键判定（导航）
declare const xm: any; // 交互元素判定（isInteractiveElement）
declare const Sm: any; // 表格上下文元素判定
declare const wa: any; // 选区会话辅助
declare const na: any; // 部分行选区记录
declare const ba: any; // 段落聚焦
declare const va: any; // 点位光标放置
declare const ha: any; // 光标放置回调
declare const ma: any; // 选区同步
declare const ga: any; // 全选判定
declare const Wa: any; // 宿主选区偏移（selectionOffsetsInHost，C3）
declare const Sf: any; // 元素纯文本（elementToPlainText）
declare const Cf: any; // 元素剪贴板文本（elementToClipboardText）
declare const Ef: any; // 静态标记渲染（renderStaticMarkup）
declare const _f: any; // 段落文本（paragraphEditText）
declare const vy: any; // 段落数组文本
declare const kx: any; // HTML 插入缓存（htmlInsertionContract）
declare const $i: any; // 元素点位光标（placeCaretInHost）
declare const ea: any; // 文本范围设置（setTextRangeInElement）
declare const ca: any; // 编辑后选区恢复
declare const zi: any; // 表格边缘命中
declare const rf: any; // 表格选区断言
declare const kb: any; // 单元格选区判定
declare const tf: any; // 表格选区折叠判定
declare const jf: any; // 单元格段落集
declare const Mf: any; // 单元格段落索引表
declare const Nf: any; // 嵌套表格判定
declare const af: any; // 表格内活动文本范围
declare const Xa: any; // 草稿元素注册
declare const Za: any; // 草稿读取
declare const Qa: any; // 草稿写入
declare const eo: any; // 草稿清除
declare const no: any; // 单元格文本提交
declare const ao: any; // 节区草稿注册
declare const oo: any; // 节区草稿读取
declare const so: any; // 节区草稿写入
declare const co: any; // 节区草稿清除
declare const lo: any; // 节区文本提交
declare const TS: any; // 嵌套表格静态渲染
declare const Tv: any; // 段落静态渲染（runs 静态）
declare const Cv: any; // 脚注/尾注引用标记
declare const Qv: any; // 列表项判定
declare const Zv: any; // 列表样式名解析
declare const Xv: any; // 列表首项判定
declare const ey: any; // 列表缩进偏移
declare const ty: any; // 段落插入偏移
declare const px: any; // 上一可编辑段落位置
declare const mx: any; // 下一可编辑段落位置
declare const Fx: any; // 位置解析（resolveLocationContract）
declare const xx: any; // 位置克隆（cloneLocationContract）
declare const ax: any; // 位置比较（sameLocationContract）
declare const Rx: any; // 位置基（locationBaseContract）
declare const jb: any; // 图片位置键（imageLocationKeyContract）
declare const Px: any; // 图片所在段落位置（paragraphLocationOfImage）
declare const Mb: any; // 拖放区键（imageDropZoneKey）
declare const Ab: any; // 位置键（locationKeyContract）
declare const uf: any; // 位置比较向量
declare const df: any; // 文本位置比较（compareTextPositions）
declare const ff: any; // 文本范围规范化（normalizeTextRange）
declare const bx: any; // 范围偏移（rangeOffsetsInParagraph）
declare const Is: any; // 部分行片段（partialLineRangeIsProper 族）
declare const Fs: any; // 行命中（wrappedLayoutHitOffset 族）
declare const Ps: any; // 布局命中偏移
declare const Kp: any; // 双击词范围
declare const Ip: any; // 草稿文本合并
declare const Hp: any; // 文本布局（layout 文本）
declare const Mp: any; // 预排版文本（pretext source）
declare const Ls: any; // 布局行切片
declare const gp: any; // 布局块高（含障碍）
declare const Sp: any; // 段落源（runs 规范化）
declare const Of: any; // 段落基础样式
declare const Rh: any; // 行高（lineHeightPx）
declare const Th: any; // 编号/制表位上下文
declare const Yp: any; // 页流浮动布局（手动环绕）
declare const bp: any; // 页流浮动布局（自动环绕）
declare const xp: any; // 页流分段（page flow segments）
declare const wp: any; // 页流辅助
declare const Tg: any; // 页流块高
declare const nu: any; // 信头双栏分段
declare const ru: any; // 信头组样式
declare const iu: any; // 信头列样式
declare const au: any; // 信头浮动侧样式
declare const ou: any; // 数值夹取（clampNumber）
declare const zg: any; // 去缩放增量（unscaleDelta）
declare const Fr: any; // 缩放解析（resolveZoomScale）
declare const Jp: any; // 浮动锚点布局（floatingAnchorLayout）
declare const Gg: any; // 图片尺寸归一
declare const $g: any; // 图片帧尺寸
declare const av: any; // 图片帧样式
declare const tv: any; // 图片 src 解析
declare const _i: any; // 图片内联 src
declare const li: any; // 图片占位判定
declare const ui: any; // 图片占位标签
declare const pu: any; // 图片滤镜（cssFilter）
declare const Ng: any; // 内联图片判定
declare const Kg: any; // 浮动图片判定
declare const Jg: any; // 手动环绕图片判定
declare const qg: any; // 页绝对图片判定
declare const Pg: any; // 图片环绕判定
declare const tp: any; // 整页覆盖图片判定
declare const lp: any; // 页绝对图片定位
declare const Rg: any; // 浮动图片定位
declare const Lg: any; // 内联浮动图片定位
declare const Bg: any; // 矩形去缩放（unscaleRect）
declare const Hg: any; // 节区浮动移动补丁（宽高位移）
declare const Vg: any; // 节区浮动移动补丁（包装矩形）
declare const Ug: any; // 节区浮动辅助
declare const Wg: any; // 节区浮动辅助
declare const Sy: any; // 浮动表格定位
declare const Cy: any; // 表格缩进样式
declare const xy: any; // 表格宽度
declare const yy: any; // 表格列数（tableGridColumnCount）
declare const ub: any; // 表格边距
declare const lb: any; // 单元格边框样式
declare const db: any; // 单元格边框辅助
declare const Ry: any; // 单元格外边距样式
declare const Yy: any; // 表格对齐样式
declare const Iy: any; // 列宽解析（渲染）
declare const Ny: any; // 表格有效宽度
declare const Jy: any; // 表格边框宽
declare const qy: any; // 表格边框判定
declare const bo: any; // 行高解析（渲染）
declare const Qh: any; // 表格默认值应用判定
declare const wo: any; // 行高分配（distributeRowHeights）
declare const Py: any; // 列宽缩放
declare const jy: any; // 列宽规范化（normalizeColumnWidths）
declare const Co: any; // 行高解析（角缩放）
declare const zu: any; // 行高取整
declare const wy: any; // 内嵌表宿主解析
declare const im: any; // 制表位累加
declare const am: any; // 制表位宽度
declare const g_: any; // 运行样式（justify 段）
declare const h_: any; // 运行文本渲染
declare const v_: any; // 链接运行样式
declare const __: any; // 运行样式（run style）
declare const u_: any; // 编号标签样式
declare const f_: any; // 段落宿主样式
declare const d_: any; // 段落宿主样式（节区）
declare const Rp: any; // 文本片段规范化
declare const Qp: any; // 制表符文本
declare const om: any; // 表单域宽度
declare const sm: any; // 复选框尺寸
declare const cm: any; // 表单域辅助
declare const Df: any; // 表单域文本
declare const Mi: any; // 表单域字体
declare const m_: any; // 字体族规范化
declare const p_: any; // 颜色解析
declare const Bf: any; // 图片穿透判定
declare const nv: any; // 合成文本框禁用判定
declare const $_: any; // 合成文本框段落
declare const Q_: any; // 合成文本框纯文本
declare const Z_: any; // 合成文本框样式解析
declare const ev: any; // 图片层序（zIndex）
declare const bf: any; // 文档字体族
declare const Ou: any; // 页面基础样式
declare const du: any; // 主题样式表
declare const kf: any; // 段落节点判定
declare const Wh: any; // 单元格内容高
declare const Ly: any; // 单元格边距解析
declare const zy: any; // 单元格边距合并
declare const Ih: any; // 网格对齐判定
declare const Hh: any; // 段落布局规范化
declare const zh: any; // 段落高
declare const Uh: any; // 首段判定
declare const Br: any; // twips 取整
declare const o_: any; // 边框宽
declare const pc: any; // 最小块高（MIN_BLOCK_HEIGHT_PX）
declare const Ah: any; // 布局高
declare const vg: any; // 段落底边
declare const yg: any; // 整段命中判定
declare const _g: any; // 行范围切片
declare const tc: any; // 切片容差
declare const gg: any; // 部分行判定（partialLineRangeIsProper）
declare const bg: any; // 部分行边界（起）
declare const xg: any; // 部分行边界（终）
declare const l_: any; // 编号标签宽
declare const uh: any; // 文本宽测量
declare const Ym: any; // 字体尺寸（px）
declare const ch: any; // 字体回退
declare const Ms: any; // 文本布局（包裹）
declare const Lp: any; // 断词策略
declare const um: any; // 段落合并判定
declare const Pf: any; // 段落渲染判定
declare const pg: any; // 段落占位判定
declare const wg: any; // 部分行跟踪判定
declare const _m: any; // 段前距
declare const gm: any; // 段后距
declare const Hf: any; // 节区分隔判定
declare const ip: any; // 新页判定
declare const Xg: any; // 相对定位判定
declare const Yg: any; // 静态定位判定
declare const Zl: any; // 首字下沉模型（dropCapOfParagraph）
declare const tm: any; // 首字下沉字号
declare const nm: any; // 首字下沉高
declare const Xp: any; // 首字下沉环绕布局
declare const t_: any; // 段落行高
declare const bm: any; // 脚注引用收集
declare const Ai: any; // 脚注运行样式
declare const hn: any; // 浮动表格移动预览辅助
declare const Bu: any; // 表格手柄常量
declare const Hu: any; // 表格手柄常量
declare const Ju: any; // 表格手柄常量
declare const Vu: any; // 表格手柄常量
declare const Ku: any; // 表格手柄常量
declare const Xu: any; // 表格手柄常量
declare const Yu: any; // 表格手柄常量
declare const Zu: any; // 表格手柄常量
declare const ed: any; // 表格手柄常量
declare const td: any; // 图片层序常量
declare const nd: any; // 图片层序常量
declare const rd: any; // 图片层序常量
declare const id: any; // 图片层序常量
declare const ad: any; // 表格手柄样式
declare const od: any; // 表格手柄样式
declare const sd: any; // 表格角手柄样式
declare const cd: any; // 表格角手柄样式
declare const ld: any; // twips→px（可空）
declare const ud: any; // 表格辅助
declare const dd: any; // 表格辅助
declare const fd: any; // 表格辅助
declare const md: any; // 表格辅助
declare const hd: any; // 表格辅助
declare const gd: any; // 表格辅助
declare const _d: any; // 表格辅助
declare const pd: any; // 表格辅助
declare const bd: any; // 表格辅助
declare const xd: any; // 表格辅助
declare const Sd: any; // 表格辅助
declare const Cd: any; // 表格辅助
declare const wd: any; // 表格辅助
declare const Td: any; // 节区规范化
declare const Ed: any; // 表格辅助
declare const Dd: any; // 表格辅助
declare const Od: any; // 表格辅助
declare const kd: any; // 表格辅助
declare const Ad: any; // 表格辅助
declare const Pd: any; // 表格辅助
declare const Bd: any; // 表格辅助
declare const Vd: any; // 表格辅助
declare const Hd: any; // 表格辅助
declare const Ud: any; // 表格辅助
declare const Wd: any; // 表格辅助
declare const Gd: any; // 表格辅助
declare const Kd: any; // 表格辅助
declare const Xd: any; // 表格辅助
declare const Yd: any; // 表格辅助
declare const Zd: any; // 表格辅助
declare const ef: any; // 表格辅助
declare const tf2: any; // 占位（避免与 tf 冲突，未用）
declare const ec: any; // 页栅格间距（PAGE_GRID_GAP_PX）
declare const kc: any; // 表格切片内边距
declare const Zc: any; // 默认运行源
declare const Tu: any; // 表格移动阈值
declare const Eu: any; // 角手柄样式
declare const Du: any; // 移动手柄样式
declare const bu: any; // 表格命中区常量
declare const xu: any; // 表格命中区常量
declare const Su: any; // 表格命中区常量
declare const Cu: any; // 表格命中区常量
declare const hu: any; // 表格边框宽常量
declare const vu: any; // 表格手柄尺寸
declare const wu: any; // 表格边框偏移
declare const gu: any; // 表格边框命中宽
declare const yu: any; // 表格辅助常量

/* ============================================================================
 * §3 交互回调簇后半 hook（原 ES 函数体交互段 jsx 31874-35407 实体化）
 * ==========================================================================*/

/**
 * 原 ES 交互回调簇后半：节区图片交互/图片拖放/包裹段落与 runs 渲染器/
 * 拖放导入/单元格切片布局/fs 节点渲染器/ps 页流渲染器/脚注簇。
 * 函数体内局部变量名从源；顶层符号语义名见文件头 §A。
 */
export function useDocxEditorViewRenderCallbacks(core: DocxEditorViewInteractionCore): any {
  const {
    editor: e,
    className: t,
    isReadOnly: k,
    isEditable: N,
    showTrackedChanges: w,
    showComments: E,
    annotationsVisible: O,
    invertFilter: M,
    tocLinkColorByLevel: F,
    highlightContext: I,
    fallbackLayout: Hn,
    docGridLinePitchPxByNodeIndex: Gn,
    pageContentWidthPxByNodeIndex: Kn,
    pageContentHeightPxByNodeIndex: qn,
    pages: $n,
    locationKey: P,
    onFormFieldDoubleClick: x,
    handleFormFieldTap: nt,
    scrollToBookmark: Pi,
    layoutEpoch: wn,
    partialLineSelection: wt,
    floatingExclusionRects: On,
    resizePreview: Ge,
    setResizePreview: Ke,
    floatingMovePreview: Q,
    setFloatingMovePreview: qe,
    dropCapMovePreview: Je,
    setDropCapMovePreview: Ye,
    dropCapResizePreview: Xe,
    setDropCapResizePreview: Ze,
    selectedDropCap: Re,
    setSelectedDropCap: ze,
    hoveredDropCap: Be,
    setHoveredDropCap: Ve,
    selectedImage: Pe,
    setSelectedImage: Fe,
    selectedSectionImage: Ie,
    setSelectedSectionImage: Le,
    imageDragging: Ae,
    setImageDragging: je,
    imageDropTarget: Me,
    setImageDropTarget: Ne,
    dropOverlayVisible: Oe,
    setDropOverlayVisible: ke,
    wrappedEditState: He,
    setWrappedEditState: Ue,
    cornerResizeSession: Gt,
    setCornerResizeSession: Kt,
    cornerResizePreview: qt,
    setCornerResizePreview: Jt,
    columnWidthOverridesA: Qe,
    setColumnWidthOverridesA: $e,
    columnWidthOverridesB: et,
    setColumnWidthOverridesB: tt,
    rowHeightPreviewA: st,
    setRowHeightPreviewA: ct,
    rowHeightPreviewB: lt,
    setRowHeightPreviewB: ut,
    columnResizeSession: rt,
    columnResizePreview: at,
    rowResizeSession: Vt,
    rowResizePreview: Ut,
    hoveredBoundary: Yt,
    setHoveredBoundary: Xt,
    hoveredTable: Zt,
    setHoveredTable: Qt,
    hoveredHandle: $t,
    setHoveredHandle: en,
    embeddedTableKeyA: tn,
    setEmbeddedTableKeyA: nn,
    embeddedTableKeyB: rn,
    setEmbeddedTableKeyB: an,
    tableMovePreview: mn,
    setTableMovePreview: pn,
    tableSelection: un,
    setTableSelection: dn,
    tableContextMenu: gn,
    setTableContextMenu: _n,
    contextMenu: vn,
    setContextMenu: yn,
    headerFooterSession: bn,
    setHeaderFooterSession: xn,
    measuredTableRowHeights: dt,
    annotationEpoch: Sn,
    runTextBaseStyle: j,
    defaultSectionXml: p,
    numberingLabelCache: Yn,
    rootElementRef: L,
    pageBodyElementMapRef: se,
    paragraphElementMapRef: te,
    floatingTableElementMapRef: G,
    cellHostElementMapRef: ae,
    cellDraftElementMapRef: R,
    cellParagraphDraftElementMapRef: ee,
    cellDraftHostMapRef: B,
    paragraphDraftMapRef: H,
    draftElementMapRef: oe,
    wrappedParagraphRegistryRef: kt,
    wrappedSelectionRestoreRef: Dt,
    wrappedTextareaRef: Et,
    wrappedCaretActiveRef: xe,
    wrappedEditStateMirrorRef: We,
    measurementLatchRef: St,
    paragraphOffsetRestoreRef: ve,
    partialLineRestoreRef: U,
    activeTextRangeRef: be,
    selectionSyncPendingRef: fe,
    dragSessionRef: cn,
    tableDragEnabledRef: ln,
    sectionDraftCaretRestoreRef: pe,
    pointerSessionRef: Se,
    lastTapRef: De,
    revealRequestRef: J,
    blockIdHeightOverridesRef: z,
    importedDocxCountRef: he,
    draggedImageRef: Z,
    wrappedParagraphPointerSessionRef: Ot,
    paginationKick: Pn,
    scheduleAnnotationEpoch: Fn,
    resolveColumnWidthsRender: yo,
    tableParagraphUnderSelection: Ka,
    beginDropCapMove: Mo,
    beginDropCapResize: No,
  } = core;

  /* ---------- 节区图片交互面（jsx 31877-32173） ---------- */
  /* 原 Fo（jsx 31877）：节区图片指针移动/拖拽 */
  const Fo = React.useCallback((t: any, n: any, r: any, i: any, a: any) => {
    if (k || !bn || bn.region !== n.region || bn.partName !== n.partName || t.button !== 0 || t.target.closest(`[data-image-resize-handle='true']`) || !i && !a) return;
    t.preventDefault(), t.stopPropagation();
    let o = Jx(n);
    Fe(void 0), Le(o);
    let s = t.clientX,
      c = t.clientY,
      l = t.currentTarget,
      u = l.getBoundingClientRect(),
      d = l.closest(`[data-docx-page-surface='true']`),
      f = d?.getBoundingClientRect(),
      p = l.closest(`[data-docx-section-paragraph-host='true']`)?.getBoundingClientRect(),
      m = Fr(l, 1),
      h = r.floating ? {
        ...r.floating
      } : {},
      g = 0,
      _ = 0,
      v: any,
      y = () => {
        qe({
          imageKey: o,
          deltaX: g,
          deltaY: _,
          ...(p ? {
            baseLeftPx: Math.round((u.left - p.left) / m),
            baseTopPx: Math.round((u.top - p.top) / m)
          } : void 0)
        });
      },
      b = (e: any) => {
        g = zg(e.clientX - s, m), _ = zg(e.clientY - c, m), v !== void 0 && window.cancelAnimationFrame(v), v = window.requestAnimationFrame(y);
      },
      x = () => {
        if (window.removeEventListener(`pointermove`, b), window.removeEventListener(`pointerup`, x), window.removeEventListener(`pointercancel`, x), v !== void 0 && window.cancelAnimationFrame(v), qe(void 0), !(Math.abs(g) < 1 && Math.abs(_) < 1)) {
          if (i) {
            let t = p ? p.width / m : Hn.pageWidthPx,
              i = r.widthPx ?? Math.max(24, Math.round(u.width / m)),
              a = r.heightPx ?? Math.max(24, Math.round(u.height / m)),
              o = Jp(r, t, {
                widthPx: i,
                heightPx: a,
                ...(p ? {
                  baseLeftPx: Math.round((u.left - p.left) / m),
                  baseTopPx: Math.round((u.top - p.top) / m)
                } : void 0)
              }),
              s = Math.round(ou((o?.imageLeftPx ?? 0) + g, 0, Math.max(0, t - i))),
              c = Math.round((o?.imageTopPx ?? 0) + _);
            e.moveSectionFloatingImage(n, Hg(r, t, s, c, {
              widthPx: i,
              heightPx: a
            }));
            return;
          }
          if (a) {
            let t = d && d.isConnected ? d.getBoundingClientRect() : f;
            e.moveSectionFloatingImage(n, Vg(h, Hn, {
              wrapperRect: Bg(u, m),
              pageSurfaceRect: t ? Bg(t, m) : void 0,
              deltaX: g,
              deltaY: _
            }));
          }
        }
      };
    window.addEventListener(`pointermove`, b), window.addEventListener(`pointerup`, x, {
      once: !0
    }), window.addEventListener(`pointercancel`, x, {
      once: !0
    });
  }, [bn, Hn, e, k, Fr]),
  /* 原 zo（jsx 31949）：节区图片点选 */
  zo = React.useCallback((e: any) => {
    k || !bn || bn.region !== e.region || bn.partName !== e.partName || (Fe(void 0), Le(Jx(e)));
  }, [bn, k]),
  /* 原 Vo（jsx 31952）：图片 dragstart */
  Vo = React.useCallback((e: any, t: any) => {
    if (k) {
      e.preventDefault();
      return;
    }
    Z.current = t, je(!0), Fe(t), Ne(void 0), e.dataTransfer.effectAllowed = `move`, e.dataTransfer.setData(`text/plain`, jb(t));
  }, [k]),
  /* 原 Ho（jsx 31959）：图片 dragend */
  Ho = React.useCallback(() => {
    Z.current = null, je(!1), Ne(void 0);
  }, []),
  /* 原 Uo（jsx 31962）：表格角部缩放（正文表） */
  Uo = React.useCallback((e: any, t: any, n: any, r: any, i: any, a: any) => {
    if (k || (e.preventDefault(), e.stopPropagation(), !Number.isFinite(n) || n <= 0)) return;
    let o = e.currentTarget,
      s = e.pointerId;
    if (o.setPointerCapture) try {
      o.setPointerCapture(s);
    } catch {}
    let c = jy(r, r.length, n, 1),
      l = Co(i),
      u = Math.max(24 * Math.max(1, l.length), 1),
      d = l.reduce((e: any, t: any) => e + t, 0);
    if (!Number.isFinite(d) || d <= 0) return;
    let f = Py(c, n).reduce((e: any, t: any) => e + t, 0),
      p = e.clientY,
      m = e.clientX,
      h = c,
      g = l,
      _: any;
    Kt({
      tableIndex: t
    });
    let v = () => {
        $e((e: any) => ({
          ...e,
          [t]: h
        })), ct((e: any) => ({
          ...e,
          [t]: g
        }));
      },
      y = (e: any) => {
        let t = e.clientX - m,
          n = e.clientY - p,
          r = Math.max(120, ou(f + t, 0, Number.isFinite(a) ? a : 1 / 0)),
          i = Math.max(u, d + n);
        h = Py(c, r), g = wo(l, i), _ !== void 0 && window.cancelAnimationFrame(_), _ = window.requestAnimationFrame(v);
      },
      b = (e: any) => {
        if (window.removeEventListener(`pointermove`, y), window.removeEventListener(`pointerup`, b), window.removeEventListener(`pointercancel`, b), _ !== void 0 && window.cancelAnimationFrame(_), v(), o.releasePointerCapture) try {
          o.releasePointerCapture(e.pointerId ?? s);
        } catch {}
        Kt(void 0);
      };
    window.addEventListener(`pointermove`, y), window.addEventListener(`pointerup`, b, {
      once: !0
    }), window.addEventListener(`pointercancel`, b, {
      once: !0
    });
  }, [k]),
  /* 原 Wo（jsx 32011）：表格角部缩放（草稿表） */
  Wo = React.useCallback((e: any, t: any, n: any, r: any, i: any, a: any) => {
    if (k || (e.preventDefault(), e.stopPropagation(), !Number.isFinite(n) || n <= 0)) return;
    let o = e.currentTarget,
      s = e.pointerId;
    if (o.setPointerCapture) try {
      o.setPointerCapture(s);
    } catch {}
    let c = jy(r, r.length, n, 1),
      l = Co(i),
      u = Math.max(24 * Math.max(1, l.length), 1),
      d = l.reduce((e: any, t: any) => e + t, 0);
    if (!Number.isFinite(d) || d <= 0) return;
    let f = Py(c, n).reduce((e: any, t: any) => e + t, 0),
      p = e.clientY,
      m = e.clientX,
      h = c,
      g = l,
      _: any;
    Jt({
      tableKey: t
    });
    let v = () => {
        tt((e: any) => ({
          ...e,
          [t]: h
        })), ut((e: any) => ({
          ...e,
          [t]: g
        }));
      },
      y = (e: any) => {
        let t = e.clientX - m,
          n = e.clientY - p,
          r = Math.max(120, ou(f + t, 0, Number.isFinite(a) ? a : 1 / 0)),
          i = Math.max(u, d + n);
        h = Py(c, r), g = wo(l, i), _ !== void 0 && window.cancelAnimationFrame(_), _ = window.requestAnimationFrame(v);
      },
      b = (e: any) => {
        if (window.removeEventListener(`pointermove`, y), window.removeEventListener(`pointerup`, b), window.removeEventListener(`pointercancel`, b), _ !== void 0 && window.cancelAnimationFrame(_), v(), o.releasePointerCapture) try {
          o.releasePointerCapture(e.pointerId ?? s);
        } catch {}
        Jt(void 0);
      };
    window.addEventListener(`pointermove`, y), window.addEventListener(`pointerup`, b, {
      once: !0
    }), window.addEventListener(`pointercancel`, b, {
      once: !0
    });
  }, [wo, k, Co]),
  /* 原 Go（jsx 32060）：内嵌表移动 */
  Go = React.useCallback((t: any, n: any) => {
    if (k || t.button !== 0 && t.button !== void 0) return;
    t.preventDefault(), t.stopPropagation(), an(n), nn(n);
    let r = wy(n);
    if (!r) return;
    Qt(r.hostTableIndex), cn.current = {
      pointerId: t.pointerId,
      tableIndex: r.hostTableIndex,
      embeddedTableKey: n,
      startX: t.clientX,
      startY: t.clientY,
      hasMoved: !1
    };
    let i = (e: any) => {
        let t = cn.current;
        !t || t.embeddedTableKey !== n || e.pointerId !== t.pointerId || Math.abs(e.clientX - t.startX) + Math.abs(e.clientY - t.startY) < Tu || (t.hasMoved = !0, pn(Wi(t.tableIndex, {
          x: e.clientX,
          y: e.clientY
        })?.preview), e.preventDefault());
      },
      a = (t: any) => {
        let r = cn.current;
        if (!r || r.embeddedTableKey !== n || t.pointerId !== r.pointerId) return;
        window.removeEventListener(`pointermove`, i), window.removeEventListener(`pointerup`, a), window.removeEventListener(`pointercancel`, a), cn.current = void 0, pn(void 0);
        let o = document.elementFromPoint(t.clientX, t.clientY),
          s = G.current.get(r.tableIndex);
        if (Qt(o && s?.contains(o) ? r.tableIndex : void 0), !r.hasMoved) return;
        let c = Wi(r.tableIndex, {
          x: t.clientX,
          y: t.clientY
        });
        c && (nn(void 0), an(void 0), e.moveEmbeddedTableToBody(n, c.targetNodeIndex));
      };
    window.addEventListener(`pointermove`, i), window.addEventListener(`pointerup`, a, {
      once: !0
    }), window.addEventListener(`pointercancel`, a, {
      once: !0
    });
  }, [e, k, Wi]),
  /* 原 Ko（jsx 32099）：表格交互上下文 */
  Ko = React.useMemo(() => ({
    isReadOnly: k,
    hoveredTableKey: tn,
    focusedTableKey: rn,
    hoveredHandle: $t,
    resolveColumnWidths: (e: any, t: any, n: any) => xo(e, t, n),
    resolveRowHeights: (e: any, t: any) => So(e, t),
    isTableResizing: (e: any) => at?.tableKey === e || Ut?.tableKey === e || qt?.tableKey === e,
    isColumnResizing: (e: any, t: any) => at?.tableKey === e && at.boundaryColumnIndex === t,
    isRowResizing: (e: any, t: any) => Ut?.tableKey === e && Ut.boundaryRowIndex === t,
    isCornerResizing: (e: any) => qt?.tableKey === e,
    setHoveredTableKey: nn,
    setFocusedTableKey: an,
    setHoveredHandle: en,
    beginColumnResize: (e: any, t: any, n: any, r: any, i: any) => {
      Do(e, t, n, r, i);
    },
    beginRowResize: (e: any, t: any, n: any, r: any) => {
      Oo(e, t, n, r);
    },
    beginCornerResize: (e: any, t: any, n: any, r: any, i: any, a: any) => {
      Wo(e, t, n, r, i, a);
    },
    beginTableMove: (e: any, t: any) => {
      Go(e, t);
    }
  }), [at, Ut, qt, Do, Wo, Go, Oo, rn, tn, $t, k, xo, So]),
  /* 原 qo（jsx 32126）：图片拖放提交 */
  qo = React.useCallback((t: any) => {
    if (k) return;
    let n = Z.current;
    if (!n) return;
    e.moveImage(n, t);
    let r = ax(Px(n), t.kind === `paragraph` ? {
      kind: `paragraph`,
      nodeIndex: t.nodeIndex
    } : {
      kind: `table-cell`,
      tableIndex: t.tableIndex,
      rowIndex: t.rowIndex,
      cellIndex: t.cellIndex,
      paragraphIndex: t.paragraphIndex
    }) && n.childIndex < t.childIndex ? t.childIndex - 1 : t.childIndex;
    Fe({
      ...t,
      childIndex: Math.max(0, r)
    }), Ne(void 0), je(!1), Z.current = null;
  }, [e, k]),
  /* 原 Jo（jsx 32146）：图片拖放占位渲染 */
  Jo = React.useCallback((e: any, t: any) => {
    if (k || !Ae) return null;
    let n = Me ? Mb(Me) === Mb(e) : !1;
    return <span key={t} contentEditable={!1} style={{
      display: `inline-block`,
      width: 0,
      height: 0,
      minWidth: 0,
      minHeight: 0,
      margin: 0,
      padding: 0,
      overflow: `visible`,
      verticalAlign: `baseline`,
      position: `relative`
    }}><span contentEditable={!1} data-docx-image-drop-zone="true" data-docx-target-kind={e.kind} data-docx-child-index={e.childIndex} data-docx-node-index={e.kind === `paragraph` ? e.nodeIndex : void 0} data-docx-table-index={e.kind === `table-cell` ? e.tableIndex : void 0} data-docx-row-index={e.kind === `table-cell` ? e.rowIndex : void 0} data-docx-cell-index={e.kind === `table-cell` ? e.cellIndex : void 0} data-docx-paragraph-index={e.kind === `table-cell` ? e.paragraphIndex : void 0} style={{
        position: `absolute`,
        left: -4,
        top: -11,
        width: 8,
        height: 22,
        borderLeft: n ? `2px solid #0f172a` : `2px solid transparent`,
        borderRadius: 999
      }} onDragOver={t => {
        Z.current && (t.preventDefault(), t.dataTransfer.dropEffect = `move`, Ne(e));
      }} onDrop={t => {
        t.preventDefault(), qo(e);
      }} /></span>;
  }, [Me, Ae, k, qo]),
  /* 原 Yo（jsx 32174）：包裹段落渲染器 */
  Yo = (t: any) => {
    let {
        location: n,
        keyPrefix: r,
        source: i,
        layout: a,
        lineHeightPx: o,
        baseTextStyle: s,
        blockHeightPx: c,
        obstacleNodes: l,
        pageAbsoluteObstacleNodes: u
      } = t,
      d = Ab(n),
      f = He?.locationKey === d ? He : void 0,
      p = Fx(e.model, n).paragraph,
      m = e.activeTextRange ? ff(e.activeTextRange) : void 0,
      h = !!(p && m && uf(Rx(m.start.location), n) <= 0 && uf(n, Rx(m.end.location)) <= 0),
      g = p && m && h ? bx(n, m.start, m.end, p) : void 0,
      _ = f?.selectionStart ?? g?.[0],
      v = f?.selectionEnd ?? g?.[1],
      y = _ !== void 0 && v !== void 0 ? Is(a, _, v) : [],
      b = f ? Fs(a, f.selectionEnd) ?? Fs(a, f.selectionStart) : m && g && df(m.start, m.end) === 0 ? Fs(a, g[1]) : void 0,
      x = f && f.selectionStart === f.selectionEnd || !f && m && g && df(m.start, m.end) === 0 ? b : void 0,
      S = (e: any, t: any) => {
        let n = i.runs.map((n: any) => {
          let i = Math.max(e.startOffset, n.startOffset),
            a = Math.min(e.endOffset, n.endOffset);
          if (i >= a) return;
          if (n.kind === `image` && n.image) {
            if (i !== n.startOffset) return;
            let e = tv(n.image, void 0, void 0, void 0, void 0) ?? _i(n.image);
            return e ? <img key={`${r}-fragment-image-${t}-${n.key}-${i}`} src={e} alt={n.image.alt ?? `DOCX image`} draggable={!1} style={{
              width: n.image.widthPx ? `${n.image.widthPx}px` : void 0,
              height: n.image.heightPx ? `${n.image.heightPx}px` : void 0,
              verticalAlign: `middle`,
              display: `inline-block`,
              filter: pu(n.image.cssFilter, M),
              opacity: n.image.cssOpacity
            }} /> : void 0;
          }
          if (n.kind === `tab` && Number.isFinite(n.tabWidthPx)) {
            let e = n.endOffset > n.startOffset ? (a - i) / (n.endOffset - n.startOffset) : 1,
              o = Math.max(1, Math.round(n.tabWidthPx * e));
            return <span key={`${r}-fragment-tab-${t}-${n.key}-${i}`} data-docx-tab-char="true" style={{
              ...__(n.style, j),
              display: `inline-block`,
              width: o,
              minWidth: o,
              whiteSpace: `pre`,
              lineHeight: `1em`
            }}>{`\xA0`}</span>;
          }
          let o = Rp(n.text.slice(i - n.startOffset, a - n.startOffset));
          if (!o) return;
          let s = n.link ? {
            ...v_(n.style, j, o),
            whiteSpace: `pre`
          } : {
            ...__(n.style, j, o),
            whiteSpace: `pre`
          };
          return f ? <span key={`${r}-active-${t}-${n.key}-${i}`} style={s}>{h_(o, n.style, `${r}-active-${t}-${n.key}-${i}`)}</span> : n.link ? <a key={`${r}-fragment-${t}-${n.key}-${i}`} href={n.link} target={n.link.startsWith(`#`) ? void 0 : `_blank`} rel={n.link.startsWith(`#`) ? void 0 : `noreferrer noopener`} onMouseDown={e => {
            n.link?.startsWith(`#`) && (e.preventDefault(), e.stopPropagation());
          }} onClick={e => {
            n.link?.startsWith(`#`) && (e.preventDefault(), e.stopPropagation(), Pi(n.link.slice(1)));
          }} style={s}>{h_(o, n.style, `${r}-fragment-${t}-${n.key}-${i}`)}</a> : <span key={`${r}-fragment-${t}-${n.key}-${i}`} style={s}>{h_(o, n.style, `${r}-fragment-${t}-${n.key}-${i}`)}</span>;
        }).filter(Boolean);
        return <span key={`${r}-frag-${t}-${e.startOffset}-${e.endOffset}`} style={{
          position: `absolute`,
          left: e.x,
          top: a.lines[t]?.y ?? 0,
          display: `inline-block`,
          whiteSpace: `pre`,
          lineHeight: `${o}px`,
          textIndent: 0,
          pointerEvents: f ? `none` : void 0
        }}>{n}</span>;
      },
      C = (t: any) => {
        if (k) return;
        let r = t.currentTarget.getBoundingClientRect(),
          o = f?.text ?? i.text,
          s = Ps(a, t.clientX - r.left, t.clientY - r.top),
          c = t.shiftKey && f != null ? f.anchorOffset : s,
          l = {
            location: xx(n),
            offset: c
          };
        Ot.current = {
          pointerId: t.pointerId,
          locationKey: d,
          anchorOffset: c,
          anchorBoundary: l,
          startX: t.clientX,
          startY: t.clientY
        }, ya(), e.beginSelectionSession(`pointer`, {
          settleAfterMs: 320
        }), t.currentTarget.setPointerCapture(t.pointerId), xa(n, c, s, {
          textOverride: o,
          textLength: o.length,
          anchorOffset: c
        }), Sa();
      };
    return <span data-docx-wrapped-paragraph-root="true" data-docx-wrapped-paragraph-location-key={d} contentEditable={!1} ref={e => {
      e ? kt.current.set(d, {
        location: n,
        element: e,
        layout: a,
        textLength: (f?.text ?? i.text).length
      }) : kt.current.delete(d);
    }} style={{
      display: `block`,
      position: u ? `static` : `relative`,
      minHeight: c ?? a.height,
      overflow: `visible`,
      userSelect: `none`,
      WebkitUserSelect: `none`
    }} onPointerDown={e => {
      let t = e.target;
      xm(t) || t instanceof Element && t.closest(`[data-docx-image-location],[data-docx-drop-cap='true'],[data-docx-table-move-handle='true'],[data-image-resize-handle='true'],[data-docx-form-field='true']`) || (e.preventDefault(), e.stopPropagation(), C(e));
    }} onPointerMove={e => {
      let t = Ot.current;
      if (!t || t.pointerId !== e.pointerId || t.locationKey !== d) return;
      let r = e.clientY < t.startY || e.clientY === t.startY && e.clientX < t.startX ? `start` : `end`,
        a = fa({
          x: e.clientX,
          y: e.clientY
        }, r) ?? t.anchorBoundary;
      if (ax(Rx(t.anchorBoundary.location), n) && ax(Rx(a.location), n)) {
        let e = f?.text ?? i.text;
        xa(n, t.anchorOffset, a.offset, {
          textOverride: e,
          textLength: e.length,
          anchorOffset: t.anchorOffset
        });
        return;
      }
      Dt.current = void 0, Ue(void 0), sa(t.anchorBoundary, a);
    }} onPointerUp={t => {
      Ot.current?.pointerId === t.pointerId && (Ot.current = void 0, t.currentTarget.releasePointerCapture(t.pointerId)), We.current && We.current.locationKey === d ? Sa() : e.clearSelectionSession(`pointer`);
    }} onDoubleClick={e => {
      if (k) return;
      let t = e.currentTarget.getBoundingClientRect(),
        r = f?.text ?? i.text,
        o = Kp(r, Ps(a, e.clientX - t.left, e.clientY - t.top));
      xa(n, o.start, o.end, {
        textOverride: r,
        textLength: r.length
      }), Sa();
    }} onClick={e => {
      if (k || e.detail < 3) return;
      e.preventDefault(), e.stopPropagation();
      let t = f?.text ?? i.text;
      xa(n, 0, t.length, {
        textOverride: t,
        textLength: t.length
      }), Sa();
    }}>{u}<span style={{
        display: `block`,
        position: `relative`,
        minHeight: c ?? a.height
      }}>{l}{y.map((e: any, t: any) => (0, $.jsx)(`span`, {
          contentEditable: !1,
          [Xs]: `true`,
          style: {
            position: `absolute`,
            left: e.left,
            top: e.top,
            width: e.width,
            height: e.height,
            backgroundColor: `rgba(59, 130, 246, 0.25)`,
            pointerEvents: `none`,
            zIndex: 2
          }
        }, `${r}-sel-${t}`))}{a.lines.map((e: any, t: any) => e.fragments.map((e: any) => S(e, t)))}{f && x ? (0, $.jsx)(`span`, {
          contentEditable: !1,
          [Xs]: `true`,
          style: {
            position: `absolute`,
            left: x.left,
            top: x.top,
            width: Math.max(1, x.width),
            height: x.height,
            backgroundColor: `#2563eb`,
            pointerEvents: `none`,
            zIndex: 4,
            animation: `docxWrappedCaretBlink 1s steps(1, end) infinite`
          }
        }) : null}{f && b ? <textarea ref={e => {
          if (f.locationKey === d && (Et.current = e, e)) {
            let t = Dt.current,
              n = Math.max(0, Math.min(t?.locationKey === d ? t.start : f.selectionStart, e.value.length)),
              r = Math.max(n, Math.min(t?.locationKey === d ? t.end : f.selectionEnd, e.value.length));
            try {
              e.setSelectionRange(n, r);
            } catch {}
          }
        }} value={f.text} spellCheck={!1} aria-label="Wrapped paragraph text" onChange={t => {
          ya();
          let r = t.currentTarget.value.replace(/\r\n?/g, `
`),
            i = t.currentTarget.selectionStart ?? r.length,
            a = t.currentTarget.selectionEnd ?? i;
          if ((t.nativeEvent as any)?.isComposing || xe.current) {
            e.beginSelectionSession(`composition`), xa(n, i, a, {
              textOverride: r,
              textLength: r.length
            });
            return;
          }
          e.beginSelectionSession(`keyboard`, {
            settleAfterMs: 220
          }), xa(n, i, a, {
            textOverride: r,
            textLength: r.length
          }), Ca(n, r), Pn();
        }} onSelect={e => {
          ya();
          let t = e.currentTarget.selectionStart ?? 0;
          xa(n, t, e.currentTarget.selectionEnd ?? t, {
            textOverride: e.currentTarget.value,
            textLength: e.currentTarget.value.length
          });
        }} onCompositionStart={() => {
          xe.current = !0, e.beginSelectionSession(`composition`), Ue((e: any) => e && e.locationKey === d ? {
            ...e,
            isComposing: !0
          } : e);
        }} onCompositionEnd={t => {
          xe.current = !1, e.beginSelectionSession(`keyboard`, {
            settleAfterMs: 260
          });
          let r = t.currentTarget.value.replace(/\r\n?/g, `
`),
            i = t.currentTarget.selectionStart ?? r.length;
          xa(n, i, t.currentTarget.selectionEnd ?? i, {
            textOverride: r,
            textLength: r.length,
            isComposing: !1
          }), Ca(n, r), Pn();
        }} onKeyDown={t => {
          if (ya(), Ax(t)) {
            e.beginSelectionSession(`composition`);
            return;
          }
          e.beginSelectionSession(`keyboard`, {
            settleAfterMs: 220
          });
          let r = t.currentTarget,
            i = r.value.replace(/\r\n?/g, `
`),
            c = Fx(e.model, n).paragraph,
            l = r.selectionStart ?? 0,
            u = r.selectionEnd ?? l,
            d = l === u,
            p = a.font ?? ch(s, c ? Ym(c) : 16, i),
            m = a.text === i && a.font === p && a.containerWidthPx !== void 0 && a.lineHeightPx !== void 0 ? a : Ms(i, p, a.containerWidthPx ?? 1, a.lineHeightPx ?? o, a.exclusions, {
              wordBreak: Lp(i)
            }) ?? a,
            h = Fs(m, u),
            g = t.key === `Enter` && !t.metaKey && !t.ctrlKey && !t.altKey,
            _ = n.kind === `paragraph` && c ? Qv(c, i) : !1,
            v = (e: any, t: any) => {
              xa(n, e, t, {
                textOverride: i,
                textLength: i.length,
                preferredCaretX: h?.left
              }), Ru(() => {
                let n = Et.current;
                n && n.setSelectionRange(e, t);
              });
            };
          if ((t.key === `Home` || t.key === `End`) && !t.metaKey && !t.ctrlKey && !t.altKey) {
            t.preventDefault();
            let e = m.lines.find((e: any) => e.fragments.some((e: any) => u >= e.startOffset && u <= e.endOffset)) ?? m.lines[0],
              n = t.key === `Home` ? e?.fragments[0]?.startOffset ?? 0 : e?.fragments[e.fragments.length - 1]?.endOffset ?? i.length;
            v(t.shiftKey ? f?.anchorOffset ?? l : n, n);
            return;
          }
          if ((t.key === `ArrowUp` || t.key === `ArrowDown`) && !t.metaKey && !t.ctrlKey && !t.altKey) {
            t.preventDefault();
            let e = d ? u : t.key === `ArrowUp` ? l : u,
              n = d ? h : Fs(m, e),
              r = Ps(m, (d ? f?.preferredCaretX : void 0) ?? n?.left ?? 0, (n?.top ?? 0) + (t.key === `ArrowUp` ? -(m.lineHeightPx ?? o) : m.lineHeightPx ?? o) + Math.max(1, (m.lineHeightPx ?? o) / 2));
            v(r, r);
            return;
          }
          if (t.key === `Tab` && !t.metaKey && !t.ctrlKey && !t.altKey && _ && n.kind === `paragraph`) {
            t.preventDefault(), e.adjustSelectedListDepth(t.shiftKey ? -1 : 1, i) && v(u, u);
            return;
          }
          if (g && !t.shiftKey && n.kind === `paragraph` && _) {
            t.preventDefault();
            let r = e.insertListItemAfterSelection(i, l, u, n);
            r && (Ue(void 0), za(r.paragraphIndex, r.caretOffset));
            return;
          }
          if (g && !t.shiftKey && n.kind === `paragraph` && !_) {
            t.preventDefault();
            let r = e.splitParagraphAtSelection(i, l, u, n);
            r && (Ue(void 0), za(r.paragraphIndex, r.caretOffset));
            return;
          }
        }} onBlur={e => {
          xe.current && (xe.current = !1, Ca(n, e.currentTarget.value.replace(/\r\n?/g, `
`)));
          let t = e.currentTarget,
            r = t.closest(`[data-docx-wrapped-paragraph-root='true']`);
          window.requestAnimationFrame(() => {
            let e = document.activeElement;
            e && (e === t || r?.contains(e)) || Ue((e: any) => e && e.locationKey === d ? void 0 : e);
          });
        }} style={{
          position: `absolute`,
          left: b.left,
          top: b.top,
          width: 1,
          minWidth: 1,
          height: Math.max(o, b.height),
          opacity: 0,
          color: `transparent`,
          caretColor: `transparent`,
          background: `transparent`,
          border: `none`,
          padding: 0,
          margin: 0,
          resize: `none`,
          overflow: `clip`,
          outline: `none`,
          zIndex: 5
        }} /> : null}</span></span>;
  },
  /* 原 Xo（jsx 32506）：段落 runs 渲染器 */
  Xo = React.useCallback((t: any, n: any, r: any, i?: any) => {
    let a = [],
      o = up(t) ? Zp(t) : Zc,
      s = (t.style?.tabStops ?? []).map((e: any) => Br(e.positionTwips)).filter((e: any) => Number.isFinite(e) && e > 0).sort((e: any, t: any) => e - t),
      c = s.length > 0,
      l = 0,
      u = (e: any, t: any) => {
        l = im(l, e, t);
      },
      d = (e: any) => {
        l += Math.max(0, Math.round(e));
      },
      f = () => am(s, l, o),
      p = (e: any, n: any, r: any, i: any) => {
        if (!(t.style?.align === `justify` && n.includes(`
`))) {
          let t = g_(r, n, i);
          a.push(<span key={e} style={t}>{h_(n, i, e)}</span>), u(n, i);
          return;
        }
        let o = n.split(`
`);
        o.forEach((t: any, n: any) => {
          let s = n === o.length - 1;
          if (n > 0 && a.push(<br key={`${e}-soft-break-${n}`} />), t.length > 0) {
            let o = g_(r, t, i);
            a.push(<span key={`${e}-segment-${n}`} style={s ? {
              ...o,
              display: `inline-block`,
              maxWidth: `100%`,
              whiteSpace: `pre-wrap`,
              verticalAlign: `baseline`
            } : o}>{h_(t, i, `${e}-segment-${n}`)}</span>);
          }
          u(t, i), s || (l = 0);
        });
      },
      m = {
        footnote: new Map(),
        endnote: new Map()
      };
    e.model.metadata.footnotes?.forEach((e: any, t: any) => {
      m.footnote.set(e.id, t + 1);
    }), e.model.metadata.endnotes?.forEach((e: any, t: any) => {
      m.endnote.set(e.id, t + 1);
    });
    let h = Yn.get(Ab(r)),
      g = i?.pageLayout ?? Hn,
      _ = r.kind === `paragraph` ? Kn.get(r.nodeIndex) ?? ns : ns,
      v = t.children.some((e: any) => e.type === `image` && Kg(e) && tp(e, _, g.pageHeightPx - g.marginsPx.top - g.marginsPx.bottom)),
      y = Yg(t) || Hf(t) || v ? {
        left: 0,
        top: 0,
        marginLeft: g.marginsPx.left,
        marginTop: g.marginsPx.top,
        columnLeft: g.marginsPx.left,
        columnTop: g.marginsPx.top,
        pageWidth: g.pageWidthPx
      } : void 0,
      b = Th(t, _, e.model.metadata.numberingDefinitions),
      S = Math.max(0, Math.round(i?.pageFlowTopPx ?? 0)),
      C = y ? g.marginsPx.left : void 0,
      T = y ? ip(t, g) ? g.marginsPx.top + S : 0 : void 0,
      D = new Map(),
      O = new Map(),
      A = new Map();
    t.children.forEach((e: any, t: any) => {
      if (e.type !== `image`) return;
      let n = jb({
          ...r,
          childIndex: t
        }),
        i = Ge?.imageKey === n ? Ge : void 0,
        a = Q?.imageKey === n ? Q : void 0,
        o = i?.widthPx ?? e.widthPx,
        s = i?.heightPx ?? e.heightPx;
      ({
        widthPx: o,
        heightPx: s
      } = Gg(e, o, s, y)), Number.isFinite(o) && D.set(t, Math.round(o)), Number.isFinite(s) && O.set(t, Math.round(s)), a && A.set(t, {
        deltaX: Math.round(a.deltaX),
        deltaY: Math.round(a.deltaY),
        ...(Number.isFinite(a.baseLeftPx) ? {
          baseLeftPx: Math.round(a.baseLeftPx)
        } : void 0),
        ...(Number.isFinite(a.baseTopPx) ? {
          baseTopPx: Math.round(a.baseTopPx)
        } : void 0)
      });
    });
    let N = Sp(t, r, b, {
        floatingMovePreview: Q,
        resizePreview: Ge
      }),
      P = j_(t),
      I = E_(t) || P === `center-right` || P === `center` || P === `right`,
      L = t.children.some((e: any) => e.type === `image` && Pg(e)),
      R = E && /commentRange|commentReference/i.test(t.sourceXml ?? ``);
    if ((w || I || R) && !L) return Tv(t, n, j, h, Pi, y, m, void 0, void 0, {
      showTrackedChanges: w,
      showCommentHighlights: E,
      numberingDefinitions: e.model.metadata.numberingDefinitions,
      tocLinkColorByLevel: F,
      paragraphOriginLeftPx: C,
      paragraphOriginTopPx: T
    });
    let z = Rh(t),
      B = h ? void 0 : Yp(t, b, z, {
        widthPxByImageIndex: D,
        heightPxByImageIndex: O,
        paragraphTopPx: S,
        pageMarginTopPx: g.marginsPx.top,
        foreignExclusions: i?.pageFlowForeignExclusions,
        movePreviewByImageIndex: A,
        allowNegativeImageTop: A.size > 0
      }),
      ee = !h && !B ? bp(t, b, z, i?.pageFlowForeignExclusions ?? []) : void 0,
      V = B ?? ee;
    if (V) {
      let e = new Set(V.geometries.map((e: any) => e.imageIndex)),
        t = (e: any) => {
          let t = N.children[e.imageIndex];
          if (t?.type !== `image`) return null;
          let i = {
              ...r,
              childIndex: e.imageIndex
            },
            a = jb(i),
            o = Pe ? jb(Pe) === a : !1,
            s = e.imageWidthPx,
            c = e.imageHeightPx,
            l = tv(t, void 0, void 0, void 0, void 0) ?? _i(t),
            u = li(t) || t.src && !l,
            d = Ng(t) || !t.floating;
          return <span key={`${n}-manual-image-${e.imageIndex}`} contentEditable={!1} data-docx-image-location={a} style={{
            display: `inline-block`,
            position: `absolute`,
            left: e.imageLeftPx,
            top: e.imageTopPx,
            width: s ? `${s}px` : void 0,
            height: c ? `${c}px` : void 0,
            zIndex: 3
          }} onPointerDown={e => k ? void 0 : Ao(e, i, t, d, !1)} onClick={e => {
            e.stopPropagation(), k || Fe(i);
          }} onContextMenu={e => {
            k || (e.preventDefault(), e.stopPropagation(), Ri(), Le(void 0), Fe(i), Ji({
              kind: `image`,
              activeTextRange: pa(),
              location: xx(Px(i)),
              image: {
                location: i,
                floating: t.floating ? {
                  ...t.floating
                } : void 0
              }
            }, {
              x: e.clientX,
              y: e.clientY
            }));
          }}>{l && !u ? (() => {
              let e = $g(t, s, c),
                n = {
                  filter: pu(t.cssFilter, M),
                  opacity: t.cssOpacity
                },
                r = av(t, {
                  frameWidthPx: e?.frameWidthPx ?? s,
                  frameHeightPx: e?.frameHeightPx ?? c,
                  baseTransform: e ? `translate(${-e.offsetXPx}px, ${-e.offsetYPx}px)` : void 0
                });
              return e ? <span style={{
                width: `${e.frameWidthPx}px`,
                height: `${e.frameHeightPx}px`,
                overflow: `clip`,
                display: `block`
              }}><img src={l} alt={t.alt ?? `DOCX image`} draggable={!1} style={{
                  width: `${e.imageWidthPx}px`,
                  height: `${e.imageHeightPx}px`,
                  maxWidth: `none`,
                  verticalAlign: `middle`,
                  display: `block`,
                  cursor: k ? `default` : `move`,
                  ...n,
                  ...r
                }} /></span> : <img src={l} alt={t.alt ?? `DOCX image`} draggable={!1} style={{
                width: s ? `${s}px` : void 0,
                height: c ? `${c}px` : void 0,
                verticalAlign: `middle`,
                display: `block`,
                cursor: k ? `default` : `move`,
                ...n,
                ...av(t, {
                  frameWidthPx: s,
                  frameHeightPx: c
                })
              }} />;
            })() : u ? <span role="img" aria-label={t.alt ?? `DOCX image`} style={{
              display: `inline-flex`,
              alignItems: `center`,
              justifyContent: `center`,
              width: s ? `${s}px` : `1.8em`,
              height: c ? `${c}px` : `1.8em`,
              minWidth: 16,
              minHeight: 16,
              border: `1px solid #d1d5db`,
              borderRadius: 3,
              backgroundColor: `#ffffff`,
              color: `#0f172a`,
              fontSize: (s ?? 0) <= 56 && (c ?? 0) <= 56 ? 12 : 10,
              fontWeight: 700,
              textTransform: `lowercase`,
              fontFamily: `Arial, sans-serif`,
              lineHeight: 1
            }}>{ui(t, s, c)}</span> : null}{!k && o ? <>{[{
                key: `top-left`,
                left: -5,
                top: -5,
                cursor: `nwse-resize`,
                xDirection: -1,
                yDirection: -1
              }, {
                key: `top-right`,
                right: -5,
                top: -5,
                cursor: `nesw-resize`,
                xDirection: 1,
                yDirection: -1
              }, {
                key: `bottom-left`,
                left: -5,
                bottom: -5,
                cursor: `nesw-resize`,
                xDirection: -1,
                yDirection: 1
              }, {
                key: `bottom-right`,
                right: -5,
                bottom: -5,
                cursor: `nwse-resize`,
                xDirection: 1,
                yDirection: 1
              }].map(t => <span key={`${n}-dual-${e.imageIndex}-${t.key}`} contentEditable={!1} data-image-resize-handle="true" style={{
                position: `absolute`,
                width: 10,
                height: 10,
                borderRadius: 3,
                border: `1px solid #d4d4d8`,
                backgroundColor: `#ffffff`,
                boxShadow: `0 1px 2px rgba(0, 0, 0, 0.14)`,
                cursor: t.cursor,
                ...(t.left === void 0 ? void 0 : {
                  left: t.left
                }),
                ...(t.right === void 0 ? void 0 : {
                  right: t.right
                }),
                ...(t.top === void 0 ? void 0 : {
                  top: t.top
                }),
                ...(t.bottom === void 0 ? void 0 : {
                  bottom: t.bottom
                })
              }} onPointerDown={e => {
                ko(e, i, s, c, t.xDirection, t.yDirection);
              }} />)}</> : null}</span>;
        },
        a = (e: any) => {
          let t = N.children[e.imageIndex];
          if (t?.type !== `image`) return null;
          let i = {
              ...r,
              childIndex: e.imageIndex
            },
            a = jb(i),
            o = Pe ? jb(Pe) === a : !1,
            s = A.get(e.imageIndex),
            c = e.imageWidthPx,
            l = e.imageHeightPx,
            u = tp(t, ns, g.pageHeightPx - g.marginsPx.top - g.marginsPx.bottom) ? lp(t, g, {
              deltaX: s?.deltaX ?? 0,
              deltaY: s?.deltaY ?? 0,
              anchorToPageSurface: !0
            }) : Rg(t, {
              pageOriginLeft: y?.left ?? 0,
              pageOriginTop: y?.top ?? 0,
              marginOriginLeft: y?.marginLeft ?? 0,
              marginOriginTop: y?.marginTop ?? 0,
              columnOriginLeft: y?.columnLeft ?? 0,
              columnOriginTop: y?.columnTop ?? 0,
              paragraphOriginLeft: C,
              paragraphOriginTop: T,
              deltaX: s?.deltaX ?? 0,
              deltaY: s?.deltaY ?? 0
            }),
            d = tv(t, void 0, void 0, void 0, void 0) ?? _i(t),
            f = li(t) || t.src && !d;
          return <span key={`${n}-manual-fixed-wrap-image-${e.imageIndex}`} contentEditable={!1} data-docx-image-location={a} style={{
            display: `inline-block`,
            position: `absolute`,
            width: c ? `${c}px` : void 0,
            height: l ? `${l}px` : void 0,
            ...u
          }} onPointerDown={e => k ? void 0 : Ao(e, i, t, !0, !1)} onClick={e => {
            e.stopPropagation(), k || Fe(i);
          }} onContextMenu={e => {
            k || (e.preventDefault(), e.stopPropagation(), Ri(), Le(void 0), Fe(i), Ji({
              kind: `image`,
              activeTextRange: pa(),
              location: xx(Px(i)),
              image: {
                location: i,
                floating: t.floating ? {
                  ...t.floating
                } : void 0
              }
            }, {
              x: e.clientX,
              y: e.clientY
            }));
          }}>{d && !f ? <img src={d} alt={t.alt ?? `DOCX image`} draggable={!1} style={{
              width: c ? `${c}px` : void 0,
              height: l ? `${l}px` : void 0,
              maxWidth: `none`,
              verticalAlign: `middle`,
              display: `block`,
              cursor: k ? `default` : `move`,
              filter: pu(t.cssFilter, M),
              opacity: t.cssOpacity
            }} /> : f ? <span role="img" aria-label={t.alt ?? `DOCX image`} style={{
              display: `inline-flex`,
              alignItems: `center`,
              justifyContent: `center`,
              width: c ? `${c}px` : `1.8em`,
              height: l ? `${l}px` : `1.8em`,
              minWidth: 16,
              minHeight: 16,
              border: `1px solid #d1d5db`,
              borderRadius: 3,
              backgroundColor: `#ffffff`,
              color: `#0f172a`,
              fontSize: (c ?? 0) <= 56 && (l ?? 0) <= 56 ? 12 : 10,
              fontWeight: 700,
              textTransform: `lowercase`,
              fontFamily: `Arial, sans-serif`,
              lineHeight: 1
            }}>{ui(t, c, l)}</span> : null}{!k && o ? <>{[{
                key: `top-left`,
                left: -5,
                top: -5,
                cursor: `nwse-resize`,
                xDirection: -1,
                yDirection: -1
              }, {
                key: `top-right`,
                right: -5,
                top: -5,
                cursor: `nesw-resize`,
                xDirection: 1,
                yDirection: -1
              }, {
                key: `bottom-left`,
                left: -5,
                bottom: -5,
                cursor: `nesw-resize`,
                xDirection: -1,
                yDirection: 1
              }, {
                key: `bottom-right`,
                right: -5,
                bottom: -5,
                cursor: `nwse-resize`,
                xDirection: 1,
                yDirection: 1
              }].map(t => <span key={`${n}-manual-fixed-wrap-${e.imageIndex}-${t.key}`} contentEditable={!1} data-image-resize-handle="true" style={{
                position: `absolute`,
                width: 10,
                height: 10,
                borderRadius: 3,
                border: `1px solid #d4d4d8`,
                backgroundColor: `#ffffff`,
                boxShadow: `0 1px 2px rgba(0, 0, 0, 0.14)`,
                cursor: t.cursor,
                ...(t.left === void 0 ? void 0 : {
                  left: t.left
                }),
                ...(t.right === void 0 ? void 0 : {
                  right: t.right
                }),
                ...(t.top === void 0 ? void 0 : {
                  top: t.top
                }),
                ...(t.bottom === void 0 ? void 0 : {
                  bottom: t.bottom
                })
              }} onPointerDown={e => {
                ko(e, i, c, l, t.xDirection, t.yDirection);
              }} />)}</> : null}</span>;
        },
        o = (e: any, t: any) => {
          let i = {
              ...r,
              childIndex: t
            },
            a = jb(i),
            o = Pe ? jb(Pe) === a : !1,
            s = A.get(t),
            c = D.get(t) ?? e.widthPx,
            l = O.get(t) ?? e.heightPx,
            u = tp(e, ns, g.pageHeightPx - g.marginsPx.top - g.marginsPx.bottom) ? lp(e, g, {
              deltaX: s?.deltaX ?? 0,
              deltaY: s?.deltaY ?? 0,
              anchorToPageSurface: !0
            }) : Rg(e, {
              pageOriginLeft: y?.left ?? 0,
              pageOriginTop: y?.top ?? 0,
              marginOriginLeft: y?.marginLeft ?? 0,
              marginOriginTop: y?.marginTop ?? 0,
              columnOriginLeft: y?.columnLeft ?? 0,
              columnOriginTop: y?.columnTop ?? 0,
              paragraphOriginLeft: C,
              paragraphOriginTop: T,
              deltaX: s?.deltaX ?? 0,
              deltaY: s?.deltaY ?? 0
            }),
            d = tv(e, void 0, void 0, void 0, void 0) ?? _i(e),
            f = li(e) || e.src && !d;
          return <span key={`${n}-manual-absolute-${t}`} contentEditable={!1} data-docx-image-location={a} style={{
            display: `inline-block`,
            position: `absolute`,
            width: c ? `${c}px` : void 0,
            height: l ? `${l}px` : void 0,
            ...u
          }} onPointerDown={t => k ? void 0 : Ao(t, i, e, !1, !0)} onClick={e => {
            e.stopPropagation(), k || Fe(i);
          }} onContextMenu={t => {
            k || (t.preventDefault(), t.stopPropagation(), Ri(), Le(void 0), Fe(i), Ji({
              kind: `image`,
              activeTextRange: pa(),
              location: xx(Px(i)),
              image: {
                location: i,
                floating: e.floating ? {
                  ...e.floating
                } : void 0
              }
            }, {
              x: t.clientX,
              y: t.clientY
            }));
          }}>{d && !f ? <img src={d} alt={e.alt ?? `DOCX image`} draggable={!1} style={{
              width: c ? `${c}px` : void 0,
              height: l ? `${l}px` : void 0,
              maxWidth: `none`,
              verticalAlign: `middle`,
              display: `block`,
              cursor: k ? `default` : `move`,
              filter: pu(e.cssFilter, M),
              opacity: e.cssOpacity
            }} /> : f ? <span role="img" aria-label={e.alt ?? `DOCX image`} style={{
              display: `inline-flex`,
              alignItems: `center`,
              justifyContent: `center`,
              width: c ? `${c}px` : `1.8em`,
              height: l ? `${l}px` : `1.8em`,
              minWidth: 16,
              minHeight: 16,
              border: `1px solid #d1d5db`,
              borderRadius: 3,
              backgroundColor: `#ffffff`,
              color: `#0f172a`,
              fontSize: (c ?? 0) <= 56 && (l ?? 0) <= 56 ? 12 : 10,
              fontWeight: 700,
              textTransform: `lowercase`,
              fontFamily: `Arial, sans-serif`,
              lineHeight: 1
            }}>{ui(e, c, l)}</span> : null}{!k && o ? <>{[{
                key: `top-left`,
                left: -5,
                top: -5,
                cursor: `nwse-resize`,
                xDirection: -1,
                yDirection: -1
              }, {
                key: `top-right`,
                right: -5,
                top: -5,
                cursor: `nesw-resize`,
                xDirection: 1,
                yDirection: -1
              }, {
                key: `bottom-left`,
                left: -5,
                bottom: -5,
                cursor: `nesw-resize`,
                xDirection: -1,
                yDirection: 1
              }, {
                key: `bottom-right`,
                right: -5,
                bottom: -5,
                cursor: `nwse-resize`,
                xDirection: 1,
                yDirection: 1
              }].map(r => <span key={`${n}-manual-absolute-${t}-${r.key}`} contentEditable={!1} data-image-resize-handle="true" style={{
                position: `absolute`,
                width: 10,
                height: 10,
                borderRadius: 3,
                border: `1px solid #d4d4d8`,
                backgroundColor: `#ffffff`,
                boxShadow: `0 1px 2px rgba(0, 0, 0, 0.14)`,
                cursor: r.cursor,
                ...(r.left === void 0 ? void 0 : {
                  left: r.left
                }),
                ...(r.right === void 0 ? void 0 : {
                  right: r.right
                }),
                ...(r.top === void 0 ? void 0 : {
                  top: r.top
                }),
                ...(r.bottom === void 0 ? void 0 : {
                  bottom: r.bottom
                })
              }} onPointerDown={t => {
                let n = c ?? e.widthPx ?? 240;
                ko(t, i, n, l ?? e.heightPx ?? Math.round(n * 0.62), r.xDirection, r.yDirection);
              }} />)}</> : null}</span>;
        },
        s = He?.locationKey === Ab(r) ? He : void 0,
        c = new Set(V.geometries.filter((e: any) => {
          let t = N.children[e.imageIndex];
          return t?.type === `image` && Jg(t);
        }).map((e: any) => e.imageIndex)),
        l = s ? Ip(s.text, Of(N)) : V.source,
        u = [...(i?.pageFlowForeignExclusions ?? []), ...V.geometries.map((e: any) => e.exclusion)],
        d = s ? Hp(N, l, b, V.lineHeightPx, u) ?? V.layout : V.layout;
      return Yo({
        location: r,
        keyPrefix: `${n}-dual-wrap-manual`,
        source: l,
        layout: d,
        lineHeightPx: V.lineHeightPx,
        blockHeightPx: gp(d, V.geometries, i?.pageFlowForeignExclusions),
        obstacleNodes: <>{V.geometries.map((e: any) => c.has(e.imageIndex) ? null : t(e))}{N.children.map((t: any, n: any) => t.type === `image` && !e.has(n) && Kg(t) && !qg(t) ? o(t, n) : null)}</>,
        pageAbsoluteObstacleNodes: <>{V.geometries.map((e: any) => c.has(e.imageIndex) ? a(e) : null)}{N.children.map((t: any, n: any) => t.type === `image` && !e.has(n) && Kg(t) && qg(t) ? o(t, n) : null)}</>
      });
    }
    if (h) {
      let r = h.style ? __(h.style, j) : void 0;
      a.push(<span key={`${n}-numbering`} contentEditable={!1} data-docx-numbering-label="true" style={u_(t, e.model.metadata.numberingDefinitions, h, r, j)}>{h.imageSrc ? <><img src={h.imageSrc} alt="" aria-hidden="true" draggable={!1} style={{
            display: `inline-block`,
            verticalAlign: `text-bottom`,
            width: h.imageWidthPx ?? 12,
            height: h.imageHeightPx ?? 12,
            marginRight: 2
          }} />{h.trailingText ?? ``}</> : h.text ?? ``}</span>), h.imageSrc ? (d(h.imageWidthPx ?? 12), u(h.trailingText ?? ``, h.style)) : u(h.text ?? ``, h.style);
    }
    return a.push(Jo({
      ...r,
      childIndex: 0
    }, `${n}-drop-0`)), N.children.forEach((o: any, s: any) => {
      let l = `${n}-run-${s}`;
      if (o.type === `image`) {
        let t = sp(cx(r), s),
          n = {
            ...r,
            childIndex: s
          },
          c = jb(n),
          u = Pe ? jb(Pe) === c : !1,
          f = Bf(o, N),
          p = Ge?.imageKey === c ? Ge : void 0,
          m = Q?.imageKey === c ? Q : void 0,
          h = Ng(o),
          _ = Kg(o),
          v = _ && tp(o, ns, g.pageHeightPx - g.marginsPx.top - g.marginsPx.bottom);
        if (v && i?.suppressLikelyFullPageCoverImageKeys?.has(t)) return;
        h && (m?.deltaX, m?.deltaY);
        let x = p?.widthPx ?? o.widthPx,
          S = p?.heightPx ?? o.heightPx;
        ({
          widthPx: x,
          heightPx: S
        } = Gg(o, x, S, y));
        let w = h ? Lg(o, {
            containerWidthPx: b,
            deltaX: m?.deltaX ?? 0,
            deltaY: m?.deltaY ?? 0
          }) : _ ? v ? lp(o, g, {
            deltaX: m?.deltaX ?? 0,
            deltaY: m?.deltaY ?? 0,
            anchorToPageSurface: !0
          }) : Rg(o, {
            pageOriginLeft: y?.left ?? 0,
            pageOriginTop: y?.top ?? 0,
            marginOriginLeft: y?.marginLeft ?? 0,
            marginOriginTop: y?.marginTop ?? 0,
            columnOriginLeft: y?.columnLeft ?? 0,
            columnOriginTop: y?.columnTop ?? 0,
            paragraphOriginLeft: C,
            paragraphOriginTop: T,
            deltaX: m?.deltaX ?? 0,
            deltaY: m?.deltaY ?? 0
          }) : m ? {
            transform: `translate(${m.deltaX}px, ${m.deltaY}px)`,
            position: `relative`,
            zIndex: 4
          } : {},
          E = tv(o, void 0, void 0, void 0, void 0) ?? _i(o),
          D = o.syntheticTextBox && !nv(o),
          O = D ? $_(o) : void 0,
          A = D ? Q_(o) ?? `` : ``,
          P = D ? Z_(o.sourceXml ?? ``) : void 0,
          F = li(o) || o.src && !E,
          I = D && o.floating?.behindDocument === !0,
          L = _ && o.floating?.behindDocument === !0 && !I,
          R = v,
          z = {
            display: `inline-block`,
            position: _ ? `absolute` : `relative`,
            verticalAlign: `middle`,
            marginInline: h || _ ? void 0 : 0,
            width: (h || _) && x ? `${x}px` : void 0,
            height: (h || _) && S ? `${S}px` : void 0
          },
          B = [{
            key: `top-left`,
            left: -5,
            top: -5,
            cursor: `nwse-resize`,
            xDirection: -1,
            yDirection: -1
          }, {
            key: `top-right`,
            right: -5,
            top: -5,
            cursor: `nesw-resize`,
            xDirection: 1,
            yDirection: -1
          }, {
            key: `bottom-left`,
            left: -5,
            bottom: -5,
            cursor: `nesw-resize`,
            xDirection: -1,
            yDirection: 1
          }, {
            key: `bottom-right`,
            right: -5,
            bottom: -5,
            cursor: `nwse-resize`,
            xDirection: 1,
            yDirection: 1
          }];
        a.push(<span key={l} contentEditable={!1} data-docx-image-location={c} style={{
          ...z,
          ...w,
          ...(I ? {
            zIndex: ev(o)
          } : void 0),
          ...(L || f ? {
            pointerEvents: `none`,
            userSelect: `none`
          } : void 0)
        }} onPointerDown={e => k || f || e.target instanceof Element && e.target.closest(`[data-docx-textbox-editor='true']`) ? void 0 : Ao(e, n, o, h, _)} onClick={e => {
          e.stopPropagation(), !k && !f && Fe(n);
        }} onContextMenu={e => {
          k || f || (e.preventDefault(), e.stopPropagation(), Ri(), Le(void 0), Fe(n), Ji({
            kind: `image`,
            activeTextRange: pa(),
            location: xx(Px(n)),
            image: {
              location: n,
              floating: o.floating ? {
                ...o.floating
              } : void 0
            }
          }, {
            x: e.clientX,
            y: e.clientY
          }));
        }}>{D ? <div data-docx-textbox-editor="true" contentEditable={!k} suppressContentEditableWarning={!0} spellCheck={!1} onFocus={e => {
            e.stopPropagation(), k || Fe(n);
          }} onClick={e => {
            e.stopPropagation(), k || Fe(n);
          }} onPointerDown={e => {
            e.stopPropagation(), k || Fe(n);
          }} onBlur={t => {
            k || e.setSyntheticTextBoxText(n, t.currentTarget.innerText);
          }} style={{
            width: x ? `${x}px` : void 0,
            height: S ? `${S}px` : void 0,
            boxSizing: `border-box`,
            overflow: `visible`,
            backgroundColor: P?.backgroundColor,
            ...(P && P.borderWidthPx > 0 && P.borderColor ? {
              border: `${P.borderWidthPx}px solid ${P.borderColor}`
            } : {
              border: `none`
            }),
            paddingTop: P?.paddingTopPx ?? 3,
            paddingRight: P?.paddingRightPx ?? 6,
            paddingBottom: P?.paddingBottomPx ?? 3,
            paddingLeft: P?.paddingLeftPx ?? 6,
            whiteSpace: `pre-wrap`,
            cursor: k ? `default` : `text`,
            outline: `none`,
            display: `block`
          }}>{O && O.length > 0 ? O.map((e: any, t: any) => <div key={`${l}-textbox-paragraph-${t}`} style={{
              minHeight: `${Math.max(1, e.lineHeightPx)}px`,
              lineHeight: `${Math.max(1, e.lineHeightPx)}px`,
              textAlign: e.align ?? `left`,
              whiteSpace: `pre-wrap`
            }}>{e.segments.map((e: any, n: any) => <span key={`${l}-textbox-paragraph-${t}-segment-${n}`} style={e.style ? __(e.style, j) : void 0}>{e.text}</span>)}</div>) : A}</div> : E && !F ? (() => {
            let e = $g(o, x, S),
              t = {
                filter: pu(o.cssFilter, M),
                opacity: o.cssOpacity
              },
              r = av(o, {
                frameWidthPx: R && x ? x : e?.frameWidthPx ?? x,
                frameHeightPx: R && S ? S : e?.frameHeightPx ?? S,
                fillFrame: R,
                baseTransform: e && !R ? `translate(${-e.offsetXPx}px, ${-e.offsetYPx}px)` : void 0
              }),
              i = k || f ? `default` : h || _ ? `move` : Ae ? `grabbing` : `grab`;
            return e ? <span style={{
              width: R ? `100%` : `${e.frameWidthPx}px`,
              height: R ? `100%` : `${e.frameHeightPx}px`,
              overflow: `clip`,
              display: `block`
            }}><img src={E} alt={o.alt ?? `DOCX image`} draggable={!k && !h && !_} onDragStart={!k && !h && !_ ? e => Vo(e, n) : void 0} onDragEnd={!k && !h && !_ ? Ho : void 0} style={{
                width: R ? `100%` : `${e.imageWidthPx}px`,
                height: R ? `100%` : `${e.imageHeightPx}px`,
                maxWidth: `none`,
                verticalAlign: `middle`,
                display: `block`,
                objectFit: R ? `cover` : void 0,
                cursor: i,
                ...(f ? {
                  pointerEvents: `none`,
                  userSelect: `none`
                } : void 0),
                ...t,
                ...r
              }} /></span> : <img src={E} alt={o.alt ?? `DOCX image`} draggable={!k && !h && !_} onDragStart={!k && !h && !_ ? e => Vo(e, n) : void 0} onDragEnd={!k && !h && !_ ? Ho : void 0} style={{
              width: R ? `100%` : x ? `${x}px` : void 0,
              height: R ? `100%` : S ? `${S}px` : void 0,
              maxWidth: R ? `none` : h || _ ? void 0 : `100%`,
              verticalAlign: `middle`,
              display: `block`,
              objectFit: R ? `cover` : void 0,
              cursor: i,
              ...(f ? {
                pointerEvents: `none`,
                userSelect: `none`
              } : void 0),
              ...t,
              ...av(o, {
                frameWidthPx: x,
                frameHeightPx: S,
                fillFrame: R
              })
            }} />;
          })() : F ? <span role="img" aria-label={o.alt ?? `DOCX image`} style={{
            display: `inline-flex`,
            alignItems: `center`,
            justifyContent: `center`,
            width: x ? `${x}px` : `1.8em`,
            height: S ? `${S}px` : `1.8em`,
            minWidth: 16,
            minHeight: 16,
            border: `1px solid #d1d5db`,
            borderRadius: 3,
            backgroundColor: `#ffffff`,
            color: `#0f172a`,
            fontSize: (x ?? 0) <= 56 && (S ?? 0) <= 56 ? 12 : 10,
            fontWeight: 700,
            textTransform: `lowercase`,
            fontFamily: `Arial, sans-serif`,
            lineHeight: 1,
            verticalAlign: `middle`
          }}>{ui(o, x, S)}</span> : <span style={{
            display: `inline-flex`,
            minWidth: 112,
            minHeight: 80,
            alignItems: `center`,
            justifyContent: `center`,
            border: `1px dashed #d1d5db`,
            borderRadius: 4,
            color: `#6b7280`,
            fontSize: 12,
            paddingInline: 8
          }}>{`Missing image`}</span>}{!k && u && !L && !f ? <>{B.map(e => <span key={`${l}-${e.key}`} contentEditable={!1} data-image-resize-handle="true" style={{
              position: `absolute`,
              width: 10,
              height: 10,
              borderRadius: 3,
              border: `1px solid #d4d4d8`,
              backgroundColor: `#ffffff`,
              boxShadow: `0 1px 2px rgba(0, 0, 0, 0.14)`,
              cursor: e.cursor,
              ...(e.left === void 0 ? void 0 : {
                left: e.left
              }),
              ...(e.right === void 0 ? void 0 : {
                right: e.right
              }),
              ...(e.top === void 0 ? void 0 : {
                top: e.top
              }),
              ...(e.bottom === void 0 ? void 0 : {
                bottom: e.bottom
              })
            }} onPointerDown={t => {
              let r = t.currentTarget.parentElement?.querySelector(`img`);
              ko(t, n, r ? Math.round(r.getBoundingClientRect().width) : o.widthPx ?? 240, r ? Math.round(r.getBoundingClientRect().height) : o.heightPx ?? Math.round((o.widthPx ?? 240) * 0.62), e.xDirection, e.yDirection);
            }} />)}</> : null}</span>), L && !k && !f && a.push(<span key={`${l}-hit-target`} contentEditable={!1} aria-hidden="true" style={{
          ...z,
          ...w,
          zIndex: 8,
          backgroundColor: `transparent`,
          cursor: `move`,
          ...(u ? {
            boxShadow: `inset 0 0 0 1px rgba(37, 99, 235, 0.8)`
          } : void 0)
        }} onPointerDown={e => Ao(e, n, o, h, _)} onClick={e => {
          e.stopPropagation(), Fe(n);
        }} onContextMenu={e => {
          e.preventDefault(), e.stopPropagation(), Ri(), Le(void 0), Fe(n), Ji({
            kind: `image`,
            activeTextRange: pa(),
            location: xx(Px(n)),
            image: {
              location: n,
              floating: o.floating ? {
                ...o.floating
              } : void 0
            }
          }, {
            x: e.clientX,
            y: e.clientY
          });
        }}>{u ? B.map(e => <span key={`${l}-hit-${e.key}`} contentEditable={!1} data-image-resize-handle="true" style={{
            position: `absolute`,
            width: 10,
            height: 10,
            borderRadius: 3,
            border: `1px solid #d4d4d8`,
            backgroundColor: `#ffffff`,
            boxShadow: `0 1px 2px rgba(0, 0, 0, 0.14)`,
            cursor: e.cursor,
            ...(e.left === void 0 ? void 0 : {
              left: e.left
            }),
            ...(e.right === void 0 ? void 0 : {
              right: e.right
            }),
            ...(e.top === void 0 ? void 0 : {
              top: e.top
            }),
            ...(e.bottom === void 0 ? void 0 : {
              bottom: e.bottom
            })
          }} onPointerDown={t => {
            let r = x ?? o.widthPx ?? 240;
            ko(t, n, r, S ?? o.heightPx ?? Math.round((r ?? 240) * 0.62), e.xDirection, e.yDirection);
          }} />) : null}</span>), !h && !_ && d(x ?? 0);
      } else if (o.type === `form-field`) {
        let t = {
            ...r,
            childIndex: s
          },
          n = om(o),
          i = c || o.sourceKind === `legacy`,
          f = o.fieldType === `text` || o.fieldType === `date`,
          p = Df(o),
          m = {
            ...__(o.style, j, p),
            fontFamily: m_(Mi(p, o.style)) ?? `inherit`,
            fontSize: o.style?.fontSizePt ? `${o.style.fontSizePt}pt` : `inherit`,
            color: p_(o.style?.color, j) ?? `inherit`,
            backgroundColor: f ? `rgba(148, 163, 184, 0.16)` : i ? `transparent` : `#ffffff`,
            border: f ? `1px solid rgba(148, 163, 184, 0.6)` : i ? `none` : `1px solid #d4d4d8`,
            borderRadius: f ? 4 : i ? 0 : 6,
            paddingInline: i ? f ? 2 : 0 : 6,
            paddingBlock: 0,
            lineHeight: `inherit`,
            minHeight: i ? void 0 : 24,
            height: i ? `1.1em` : void 0,
            margin: 0,
            verticalAlign: `baseline`,
            minWidth: i ? `${n}px` : o.fieldType === `text` ? 120 : void 0,
            width: i ? `${n}px` : void 0,
            boxSizing: `border-box`
          };
        if (o.fieldType === `checkbox`) {
          let n = o.checked ?? o.widget?.checkbox?.defaultChecked ? o.checkedSymbol ?? `☒` : o.uncheckedSymbol ?? `☐`,
            r = sm(o);
          a.push(<span key={l} contentEditable={!1} data-docx-form-field="true" data-docx-form-field-type="checkbox" role="checkbox" aria-checked={!!o.checked} tabIndex={k ? -1 : 0} onMouseDown={e => {
            e.preventDefault(), e.stopPropagation();
          }} onClick={n => {
            k || (n.preventDefault(), n.stopPropagation(), !nt(t) && (e.selectFormField(t), e.toggleFormCheckbox(t)));
          }} onKeyDown={n => {
            k || n.key !== `Enter` && n.key !== ` ` || (n.preventDefault(), n.stopPropagation(), e.selectFormField(t), e.toggleFormCheckbox(t));
          }} onFocus={() => {
            k || e.selectFormField(t);
          }} onDoubleClick={n => {
            k || (n.preventDefault(), n.stopPropagation(), e.selectFormField(t), x?.(t));
          }} style={{
            display: `inline-flex`,
            alignItems: `center`,
            justifyContent: `center`,
            width: `${r}px`,
            marginInline: 0,
            lineHeight: `inherit`,
            cursor: k ? `default` : `pointer`,
            userSelect: `none`,
            outline: `none`,
            ...__(o.style, j, n)
          }}>{h_(n, o.style, l)}</span>), u(n, o.style);
        } else if (o.fieldType === `dropdown`) {
          let r = o.options ?? [],
            i = o.value ?? r[0]?.value ?? r[0]?.displayText ?? ``;
          a.push(<select key={l} contentEditable={!1} data-docx-form-field="true" data-docx-form-field-type="dropdown" value={i} onClick={e => {
            e.stopPropagation();
          }} onChange={n => {
            k || e.setFormFieldValue(t, n.currentTarget.value);
          }} onFocus={() => {
            k || e.selectFormField(t);
          }} onDoubleClick={n => {
            k || (n.preventDefault(), n.stopPropagation(), e.selectFormField(t), x?.(t));
          }} disabled={k} style={m}>{r.length > 0 ? r.map((e: any, t: any) => <option key={`${l}-option-${t}`} value={e.value ?? e.displayText}>{e.displayText}</option>) : <option value={i}>{i}</option>}</select>), d(n);
        } else if (o.fieldType === `date`) {
          let r = wv(o.value);
          r ? (a.push(<input key={l} contentEditable={!1} data-docx-form-field="true" data-docx-form-field-type="date" type={i ? `text` : `date`} value={r} onClick={e => {
            e.stopPropagation();
          }} onChange={n => {
            k || e.setFormFieldValue(t, n.currentTarget.value);
          }} onFocus={() => {
            k || e.selectFormField(t);
          }} onDoubleClick={n => {
            k || (n.preventDefault(), n.stopPropagation(), e.selectFormField(t), x?.(t));
          }} readOnly={k} style={m} />), d(n)) : (a.push(<input key={l} contentEditable={!1} data-docx-form-field="true" data-docx-form-field-type="date" type="text" value={o.value ?? ``} placeholder={o.placeholder ?? o.title ?? `Enter date`} onClick={e => {
            e.stopPropagation();
          }} onChange={n => {
            k || e.setFormFieldValue(t, n.currentTarget.value);
          }} onFocus={() => {
            k || e.selectFormField(t);
          }} onDoubleClick={n => {
            k || (n.preventDefault(), n.stopPropagation(), e.selectFormField(t), x?.(t));
          }} readOnly={k} style={m} />), d(n));
        } else a.push(<input key={l} contentEditable={!1} data-docx-form-field="true" data-docx-form-field-type="text" type="text" value={o.value ?? ``} placeholder={o.placeholder ?? o.title ?? ``} onClick={e => {
          e.stopPropagation();
        }} onChange={n => {
          k || e.setFormFieldValue(t, n.currentTarget.value);
        }} onFocus={() => {
          k || e.selectFormField(t);
        }} onDoubleClick={n => {
          k || (n.preventDefault(), n.stopPropagation(), e.selectFormField(t), x?.(t));
        }} readOnly={k} style={m} />), d(n);
      } else {
        let e = Cv(o.noteReference, m.footnote, m.endnote);
        if (e) {
          a.push(<span key={l} style={{
            ...__(o.style, j, e),
            verticalAlign: `super`,
            fontSize: `0.75em`
          }}>{h_(e, o.style, l)}</span>), u(e, o.style), a.push(Jo({
            ...r,
            childIndex: s + 1
          }, `${n}-drop-${s + 1}`));
          return;
        }
        if (o.link) {
          let e = o.link,
            t = e.startsWith(`#`);
          a.push(<a key={l} href={e} target={t ? void 0 : `_blank`} rel={t ? void 0 : `noreferrer noopener`} contentEditable={t ? !1 : void 0} onMouseDown={e => {
            t && (e.preventDefault(), e.stopPropagation());
          }} onClick={n => {
            t && (n.preventDefault(), n.stopPropagation(), Pi(e.slice(1)));
          }} style={v_(o.style, j, o.text)}>{h_(o.text, o.style, l)}</a>), u(o.text, o.style), a.push(Jo({
            ...r,
            childIndex: s + 1
          }, `${n}-drop-${s + 1}`));
          return;
        }
        let i = Qp(t, s, o.text),
          c = __(o.style, j, i);
        if (i === `	`) {
          let e = f();
          a.push(<span key={l} data-docx-tab-char="true" style={{
            ...c,
            display: `inline-block`,
            width: e,
            minWidth: e,
            whiteSpace: `pre`,
            textDecoration: o.style?.underline ? `none` : c.textDecoration,
            borderBottom: o.style?.underline ? `1px solid currentColor` : void 0,
            lineHeight: `1em`
          }}>{`\xA0`}</span>), d(e);
        } else p(l, i, c, o.style);
      }
      a.push(Jo({
        ...r,
        childIndex: s + 1
      }, `${n}-drop-${s + 1}`));
    }), a;
  }, [Ao, ko, Ri, Q, Ae, Ji, Ho, Vo, Jo, pa, Ge, Pe, Le, M, j, e.selectFormField, e.setFormFieldValue, e.toggleFormCheckbox, nt, x, k, Yn, Pi, Hn, F, w]),
  /* 原 Zo（jsx 33516）：dataTransfer 文件检测 */
  Zo = React.useCallback((e: any) => Array.from(e?.types ?? []).includes(`Files`), []),
  /* 原 Qo（jsx 33517）：docx 文件过滤 */
  Qo = React.useCallback((e: any) => Array.from(e?.files ?? []).find((e: any) => /\.docx?$/i.test(e.name)), []),
  /* 原 $o（jsx 33518）：容器 dragover */
  $o = React.useCallback((e: any) => {
    if (Ae) {
      e.preventDefault(), e.dataTransfer.dropEffect = `move`, ke(!1);
      return;
    }
    if (!N) {
      ke(!1);
      return;
    }
    if (!Zo(e.dataTransfer)) {
      ke(!1);
      return;
    }
    e.preventDefault(), e.dataTransfer.dropEffect = `copy`, ke(!0);
  }, [N, Zo, Ae]),
  /* 原 es（jsx 33533）：容器 dragleave */
  es = React.useCallback((e: any) => {
    e.currentTarget.contains(e.relatedTarget) || ke(!1);
  }, []),
  /* 原 ts（jsx 33536）：容器 drop 导入 */
  ts = React.useCallback(async (t: any) => {
    if (ke(!1), Ae) {
      t.preventDefault();
      return;
    }
    if (!N) return;
    let n = Qo(t.dataTransfer);
    n && (t.preventDefault(), Fe(void 0), await e.importDocxFile(n));
  }, [N, e, Qo, Ae]);
  /* 原 window 级拖放监听 effect（jsx 33545） */
  React.useEffect(() => {
    if (!N) {
      he.current = 0, ke(!1);
      return;
    }
    let t = (e: any) => {
        Ae || !Zo(e.dataTransfer) || (he.current += 1, ke(!0));
      },
      n = (e: any) => {
        Ae || !Zo(e.dataTransfer) || (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = `copy`), ke(!0));
      },
      r = (e: any) => {
        if (e.relatedTarget === null) {
          he.current = 0, ke(!1);
          return;
        }
        Zo(e.dataTransfer) && (he.current = Math.max(0, he.current - 1), he.current === 0 && ke(!1));
      },
      i = (t: any) => {
        if (he.current = 0, ke(!1), t.defaultPrevented || Ae || !Zo(t.dataTransfer)) return;
        let n = Qo(t.dataTransfer);
        n && (t.preventDefault(), Fe(void 0), e.importDocxFile(n));
      };
    return window.addEventListener(`dragenter`, t), window.addEventListener(`dragover`, n), window.addEventListener(`dragleave`, r), window.addEventListener(`drop`, i), () => {
      window.removeEventListener(`dragenter`, t), window.removeEventListener(`dragover`, n), window.removeEventListener(`dragleave`, r), window.removeEventListener(`drop`, i), he.current = 0;
    };
  }, [N, e, Qo, Zo, Ae]);
  /* 原 ns（jsx 33572）：页内容最小宽度 */
  let ns = Math.max(120, Hn.pageWidthPx - Hn.marginsPx.left - Hn.marginsPx.right),
  /* 原 rs（jsx 33573）：文档字体族 */
    rs = React.useMemo(() => bf(e.model), [e.model]),
  /* 原 is（jsx 33574）：页容器样式 */
    is = {
      ...Ou,
      ...du[e.documentTheme],
      ...(rs ? {
        fontFamily: rs
      } : void 0),
      ...(Oe ? {
        boxShadow: `0 0 0 2px rgba(59,130,246,0.4)`
      } : void 0),
      boxSizing: `border-box`,
      overflow: Q || Je ? `visible` : `clip`
    },
  /* 原 as/os/ss/cs（jsx 33586-33589）：布局缓存 refs（as 为 TSX 保留字，改作 as_） */
    as_ = React.useRef(new Map()),
    os = React.useRef(new Map()),
    ss = React.useRef(new Map()),
    cs = React.useRef(new WeakMap());
  /* 原 effect（jsx 33590）：布局缓存清理 */
  React.useEffect(() => {
    as_.current.clear(), os.current.clear(), ss.current.clear(), cs.current = new WeakMap();
  }, [wn]);
  /* 原 ls（jsx 33593）：单元格布局签名 */
  let ls = (e: any) => {
      let t = e,
        n = cs.current.get(t);
      if (n) return n;
      let r = [JSON.stringify(e.style ?? null), ...e.nodes.map((e: any, t: any) => kf(e) ? `${t}:${e.sourceXml ?? _f(e)}` : `${t}:${e.type}`)].join(``);
      return cs.current.set(t, r), r;
    },
  /* 原 us（jsx 33600）：单元格切片布局项 */
    us = (t: any) => {
      let {
        cell: n,
        rowHeightPx: r,
        sliceStartPx: i,
        sliceHeightPx: a,
        cellContentWidthPx: o,
        tableCellMarginTwips: s,
        applyWordTableDefaults: c,
        docGridLinePitchPx: l
      } = t;
      if (!n.nodes.every(kf)) return;
      let u = e.model.metadata.numberingDefinitions,
        d = ls(n),
        f = [o, JSON.stringify(s ?? null), +!!c, l ?? 0, d].join(`:`),
        p = os.current.get(f);
      if (!p) {
        let e = Wh(n.nodes, o, u, c, l),
          t = Ly(zy(s, n.style?.marginTwips)),
          r = t.top,
          i = [];
        for (let e = 0; e < n.nodes.length; e += 1) {
          let t = n.nodes[e];
          if (!t) continue;
          let a = Ih(t) === `disable`,
            s = `${o}:${+!!c}:${l ?? 0}:${e}:${t.sourceXml ?? _f(t)}`,
            d = as_.current.get(s);
          if (!d) {
            let n = Hh(t, c),
              r = zh(n, o, u, l, a),
              i = e === 0 && Uh(t) ? 0 : Br(n.style?.spacing?.beforeTwips) ?? 0,
              f = o_(n.style?.borders?.top),
              p = Math.max(pc, Rh(n, l, a)),
              m = Mp(n, {
                allowExplicitLineBreakText: !0,
                expandTabsForLayout: !0
              }),
              h = Th(n, o, u),
              g = m ? Hp(n, m, h, p, []) : void 0,
              _ = Math.max(1, g?.lineCount ?? Eh(n, o, u));
            d = {
              paragraphForLayout: n,
              paragraphHeightPx: r,
              textTopOffsetPx: i + f,
              lineHeightPx: p,
              lineTopOffsetsPx: g ? g.lines.map((e: any) => Math.max(0, Math.round(e.y))) : Array.from({
                length: _
              }, (e, t) => t * p),
              pretextSource: m ?? void 0,
              pretextLayout: g ?? void 0
            }, as_.current.set(s, d);
          }
          let f = d.paragraphHeightPx,
            p = r + d.textTopOffsetPx,
            m = p + (d.pretextLayout ? Ah(d.pretextLayout) : d.lineHeightPx * d.lineTopOffsetsPx.length),
            h = vg({
              paragraphTopPx: r,
              paragraphHeightPx: f,
              textBottomPx: m
            });
          i.push({
            paragraph: t,
            paragraphIndex: e,
            paragraphTopPx: r,
            textTopPx: p,
            paragraphBottomPx: h,
            layoutEntry: d
          }), r = h;
        }
        p = {
          contentHeightPx: e,
          paddingPx: t,
          entries: i
        }, os.current.set(f, p);
      }
      let m = Math.max(0, r - p.paddingPx.top - p.paddingPx.bottom),
        h = Math.max(0, m - p.contentHeightPx),
        g = n.style?.verticalAlign === `center` ? Math.round(h / 2) : n.style?.verticalAlign === `bottom` ? h : 0,
        _ = i + a,
        v = [f, r, i, a].join(`:`),
        y = ss.current.get(v);
      if (y) return y;
      let b = [],
        x = 0,
        S = 0,
        C = p.entries.length;
      for (; S < C;) {
        let e = Math.floor((S + C) / 2);
        (p.entries[e]?.paragraphBottomPx ?? 0) + g <= i + tc ? S = e + 1 : C = e;
      }
      x = S;
      for (let e = x; e < p.entries.length; e += 1) {
        let t = p.entries[e];
        if (!t) continue;
        let n = t.paragraphTopPx + g,
          r = t.textTopPx + g,
          a = t.paragraphBottomPx + g;
        if (n >= _ - tc) break;
        if (!(_ > n + tc && i < a - tc)) continue;
        if (yg({
          sliceStartPx: i,
          sliceBottomPx: _,
          paragraphTopPx: n,
          paragraphBottomPx: a
        })) {
          b.push({
            paragraph: t.paragraph,
            paragraphIndex: t.paragraphIndex,
            topPx: Math.max(0, Math.round(n - i)),
            layoutEntry: t.layoutEntry
          });
          continue;
        }
        let o = _g(t.layoutEntry.lineTopOffsetsPx, t.layoutEntry.lineHeightPx, i - r, _ - r);
        if (!o) continue;
        let s = o.startLineIndex > 0 ? r + t.layoutEntry.lineTopOffsetsPx[o.startLineIndex] : n;
        b.push({
          paragraph: t.paragraph,
          paragraphIndex: t.paragraphIndex,
          topPx: Math.max(0, Math.round(s - i)),
          layoutEntry: t.layoutEntry,
          paragraphLineRange: o
        });
      }
      return ss.current.set(v, b), b;
    },
  /* 原 ds（jsx 33726）：表格单元格切片渲染器 */
    ds = (t: any) => {
      let {
          paragraph: n,
          paragraphIndex: r,
          tableIndex: i,
          rowIndex: a,
          cellIndex: o,
          contentIndex: s,
          cellContentWidthPx: c,
          applyWordTableDefaults: l,
          docGridLinePitchPx: u,
          layoutEntry: d,
          paragraphLineRange: f
        } = t,
        m = e.model.metadata.numberingDefinitions,
        h = d.paragraphForLayout,
        g = gg(f),
        _ = Math.max(1, f?.lineHeightPx ?? d.lineHeightPx),
        v = f?.startLineIndex ?? 0,
        y = f?.endLineIndex ?? f?.totalLineCount ?? 1,
        b = f?.totalLineCount ?? Math.max(1, y),
        x = Math.max(1, y - v) * _,
        S = v * _,
        C = {
          kind: `table-cell`,
          tableIndex: i,
          rowIndex: a,
          cellIndex: o,
          paragraphIndex: r
        },
        w = Yn.get(Ab(C)),
        T = Th(h, c, m),
        E = g && d.pretextSource ? d.pretextLayout && Math.abs(_ - d.lineHeightPx) <= 1 ? d.pretextLayout : Hp(h, d.pretextSource, T, _, []) : void 0,
        D = Math.max(0, E?.lineCount ?? 0),
        O = g && f && D > 0 ? Math.max(0, Math.min(f.startLineIndex, D)) : void 0,
        k = g && f && D > 0 && O !== void 0 ? Math.max(O, Math.min(f.endLineIndex, D)) : void 0,
        A = g && E && O !== void 0 && k !== void 0 && E.lineCount > 0 ? Ls(E, O, k) : void 0,
        N = g && !!d.pretextSource && !!E && D > 0,
        P = N ? bg(f) : xg(h, f),
        F = P.topPx,
        I = P.bottomPx,
        L = w && v === 0 ? l_(n, m, w) ?? Math.max(16, Math.ceil(uh(w.imageSrc ? w.trailingText ?? `` : w.text ?? ``, w.style, Ym(n))) + (w.imageSrc ? Math.ceil(w.imageWidthPx ?? 12) + 2 : 0) + 4) : void 0,
        R = N && w && v === 0 && Number.isFinite(L) ? <span key={`table-cell-${i}-${a}-${o}-${r}-numbering-marker-${v}`} contentEditable={!1} data-docx-numbering-label="true" style={{
          ...u_(n, m, w, w.style ? __(w.style, j) : void 0, j),
          position: `absolute`,
          left: -Math.round(L),
          top: 0,
          marginRight: 0,
          justifyContent: `flex-start`,
          zIndex: 1,
          pointerEvents: `none`
        }}>{w.imageSrc ? <><img src={w.imageSrc} alt="" aria-hidden="true" draggable={!1} style={{
              display: `inline-block`,
              verticalAlign: `text-bottom`,
              width: w.imageWidthPx ?? 12,
              height: w.imageHeightPx ?? 12,
              marginRight: 2,
              filter: M
            }} />{w.trailingText ?? ``}</> : w.text ?? ``}</span> : void 0,
        z = f_(n, m, p, r, l, u),
        B = {
          ...z,
          ...(g ? {
            marginTop: v === 0 ? z.marginTop : 0,
            marginBottom: y >= b ? z.marginBottom : 0,
            ...(N ? {
              textIndent: 0
            } : void 0)
          } : void 0),
          outline: `none`
        },
        ee: any,
        V = () => (ee === void 0 && (ee = Xo(n, `body-cell-${i}-${a}-${o}-${s}`, C)), ee);
      return <div key={`body-cell-slice-${i}-${a}-${o}-${s}`} data-docx-paragraph-host="true" data-docx-paragraph-kind="table-cell" data-docx-table-index={i} data-docx-row-index={a} data-docx-cell-index={o} data-docx-paragraph-index={r} data-docx-table-paragraph-index={r} style={B}>{N ? <div style={{
          minHeight: x + F + I,
          marginTop: -F,
          marginBottom: -I,
          paddingTop: F,
          paddingBottom: I,
          overflow: `visible`
        }}>{d.pretextSource && A && A.lineCount > 0 ? Yo({
            location: C,
            keyPrefix: `body-cell-${i}-${a}-${o}-${s}-lines-${v}-${y}`,
            source: d.pretextSource,
            layout: A,
            lineHeightPx: _,
            baseTextStyle: Of(n),
            blockHeightPx: A.height,
            obstacleNodes: R
          }) : null}</div> : g ? <div style={{
          height: x + F + I,
          marginTop: -F,
          marginBottom: -I,
          overflow: `hidden`
        }}><div style={{
            transform: `translateY(-${S - F}px)`
          }}>{V()}</div></div> : V()}</div>;
    },
  /* 原 fs（jsx 33824）：节点渲染器（段落/表格分支） */
    fs = (t: any, n: any, r: any, i: any, a: any, o: any) => {
      let s = Gn.get(n),
        c = Math.max(120, Math.round(o?.contentWidthPxOverride ?? Kn.get(n) ?? ns));
      if (t.type === `paragraph`) {
        if (um(t, e.model.nodes[n - 1])) return null;
        let r = Pf(t),
          i = gg(a),
          l = Yn.get(`p:${n}`),
          u = a?.startLineIndex ?? 0,
          d = a?.endLineIndex ?? a?.totalLineCount ?? 1,
          f = a?.totalLineCount ?? Math.max(1, d),
          m = Math.max(1, a?.lineHeightPx ?? Rh(t, s)),
          h = Math.max(1, d - u) * m,
          g = u * m,
          _ = wg(wt, n, a),
          v = wt?.nodeIndex === n,
          y = o?.suppressParagraphElementTracking === !0 ? !1 : !i || _ || !v && u === 0,
          b = pg(t),
          x = c,
          S = Th(t, x, e.model.metadata.numberingDefinitions),
          C = i ? Mp(t, {
            allowExplicitLineBreakText: !0,
            expandTabsForLayout: !0
          }) : void 0,
          w = i && C ? Hp(t, C, S, m, []) : void 0,
          T = Math.max(0, w?.lineCount ?? 0),
          E = i && a && T > 0 ? Math.max(0, Math.min(a.startLineIndex, T)) : void 0,
          D = i && a && T > 0 && E !== void 0 ? Math.max(E, Math.min(a.endLineIndex, T)) : void 0,
          O = i && w && E !== void 0 && D !== void 0 && w.lineCount > 0 ? Ls(w, E, D) : void 0,
          A = i && !!C && !!w && T > 0,
          N = A ? bg(a) : xg(t, a),
          P = N.topPx,
          F = N.bottomPx,
          I = l && u === 0 ? l_(t, e.model.metadata.numberingDefinitions, l) ?? Math.max(16, Math.ceil(uh(l.imageSrc ? l.trailingText ?? `` : l.text ?? ``, l.style, Ym(t))) + (l.imageSrc ? Math.ceil(l.imageWidthPx ?? 12) + 2 : 0) + 4) : void 0,
          L = A && l && u === 0 && Number.isFinite(I) ? <span key={`node-${n}-numbering-marker-${u}`} contentEditable={!1} data-docx-numbering-label="true" style={{
            ...u_(t, e.model.metadata.numberingDefinitions, l, l.style ? __(l.style, j) : void 0, j),
            position: `absolute`,
            left: -Math.round(I),
            top: 0,
            marginRight: 0,
            justifyContent: `flex-start`,
            zIndex: 1,
            pointerEvents: `none`
          }}>{l.imageSrc ? <><img src={l.imageSrc} alt="" aria-hidden="true" draggable={!1} style={{
                display: `inline-block`,
                verticalAlign: `text-bottom`,
                width: l.imageWidthPx ?? 12,
                height: l.imageHeightPx ?? 12,
                marginRight: 2,
                filter: M
              }} />{l.trailingText ?? ``}</> : l.text ?? ``}</span> : void 0,
          B = Number.isFinite(o?.overrideBeforeSpacingPx) ? Math.max(0, Math.round(o?.overrideBeforeSpacingPx)) : void 0,
          V = Number.isFinite(o?.overrideAfterSpacingPx) ? Math.max(0, Math.round(o?.overrideAfterSpacingPx)) : void 0,
          H = !r && !k && o?.forceReadOnly !== !0 && (!i || _) && !b,
          ne = o?.pageLayout ?? Hn,
          re = t.children.some((e: any) => e.type === `image` && Kg(e) && tp(e, x, ne.pageHeightPx - ne.marginsPx.top - ne.marginsPx.bottom)),
          ie = Yg(t) || re,
          ae = Xg(t),
          W = Math.max(0, Math.round(o?.pageFlowTopPx ?? 0)),
          oe = !!(Yp(t, S, m, {
            paragraphTopPx: W,
            pageMarginTopPx: ne.marginsPx.top,
            foreignExclusions: o?.pageFlowForeignExclusions
          }) ?? bp(t, S, m, o?.pageFlowForeignExclusions ?? [])),
          G = _m(e.model, n, t, +(n > 0), !1),
          K = gm(e.model, n, t),
          se = Hf(t),
          ce = ip(t, ne);
        (ie || se) && (ne.marginsPx.left, ne.marginsPx.top, ne.pageWidthPx);
        let le = d_(t, e.model.metadata.numberingDefinitions, p, s),
          q = o?.letterheadFloatSide ? au(o.letterheadFloatSide, o.oppositeLetterheadFloatSide, {
            suppressLetterheadColumnLayout: o.suppressLetterheadColumnLayout === !0
          }) : void 0,
          ue = {
            ...le,
            ...(i ? {
              marginTop: u === 0 ? B ?? G : 0,
              marginBottom: d >= f ? V ?? K : 0,
              ...(A ? {
                textIndent: 0
              } : void 0)
            } : B !== void 0 || V !== void 0 ? {
              ...(B === void 0 ? void 0 : {
                marginTop: B
              }),
              ...(V === void 0 ? void 0 : {
                marginBottom: V
              })
            } : void 0),
            ...(q ?? void 0),
            ...(o?.normalizeParagraphHostFontSize ? {
              fontSize: `${Ym(t)}px`
            } : void 0),
            ...(o?.suppressLetterheadColumnLayout && o?.isFirstInLetterheadColumn ? {
              marginTop: 0
            } : void 0),
            ...(se ? {
              position: `relative`,
              width: ne.pageWidthPx,
              maxWidth: ne.pageWidthPx,
              marginTop: (typeof le.marginTop == `number` ? le.marginTop : 0) - (ce ? ne.marginsPx.top : 0),
              marginLeft: -ne.marginsPx.left,
              marginRight: -ne.marginsPx.right,
              ...(ce ? {
                minHeight: 0,
                height: 0,
                lineHeight: 0
              } : void 0),
              overflow: `visible`
            } : ie ? {
              position: `static`
            } : ae || oe ? {
              position: `relative`
            } : void 0),
            ...(() => {
              let e = m_(Of(t)?.fontFamily);
              return e ? {
                fontFamily: e
              } : {};
            })(),
            outline: `none`
          },
          J: any,
          de = () => (J === void 0 && (J = Xo(t, `node-${n}`, {
            kind: `paragraph`,
            nodeIndex: n
          }, {
            pageFlowTopPx: W,
            pageFlowForeignExclusions: o?.pageFlowForeignExclusions,
            pageLayout: ne,
            suppressLikelyFullPageCoverImageKeys: o?.suppressLikelyFullPageCoverImageKeys
          })), J),
          Y = A ? <div style={{
            minHeight: h + P + F,
            marginTop: -P,
            marginBottom: -F,
            paddingTop: P,
            paddingBottom: F,
            overflow: `visible`
          }}>{C && O && O.lineCount > 0 ? Yo({
              location: {
                kind: `paragraph`,
                nodeIndex: n
              },
              keyPrefix: `node-${n}-lines-${u}-${d}`,
              source: C,
              layout: O,
              lineHeightPx: m,
              baseTextStyle: Of(t),
              blockHeightPx: O.height,
              obstacleNodes: L
            }) : null}</div> : i ? <div style={{
            height: h + P + F,
            marginTop: -P,
            marginBottom: -F,
            overflow: `hidden`
          }}><div style={{
              transform: `translateY(-${g - P}px)`
            }}>{de()}</div></div> : de(),
          X = Ef(Y);
        return <div key={a ? `epoch-${wn}-node-${n}-lines-${u}-${d}${o?.syntheticKeySuffix ? `-${o.syntheticKeySuffix}` : ``}` : `epoch-${wn}-node-${n}${o?.syntheticKeySuffix ? `-${o.syntheticKeySuffix}` : ``}`} data-docx-paragraph-host="true" data-docx-paragraph-kind="paragraph" data-docx-paragraph-node-index={n} data-docx-paragraph-start-line={u} data-docx-paragraph-end-line={d} data-docx-paragraph-partial-line-range={i ? `true` : void 0} style={ue} dangerouslySetInnerHTML={H ? kx(z.current, n, X) : void 0} ref={e => {
          if (y && (e ? te.current.set(n, e) : te.current.delete(n)), !(!e || !H) && gg(a) && wg(U.current, n, a)) {
            let t = U.current;
            U.current = void 0, Ru(() => {
              e!.isConnected && (t?.point ? $i(e, t.point) : $i(e));
            });
          }
        }} onPointerDown={e => {
          xm(e.target) || !H || (i && na(n, a), ba(n));
        }} onClick={t => {
          if (xm(t.target)) return;
          if (ba(n), !H) {
            if (!k && i && !r && !b) {
              na(n, a, {
                x: t.clientX,
                y: t.clientY
              });
              return;
            }
            e.selectParagraph(n);
            return;
          }
          if (t.detail > 1) return;
          i && na(n, a);
          let o = t.currentTarget;
          va(o, {
            x: t.clientX,
            y: t.clientY
          }, ha);
        }} onDoubleClick={e => {
          if (xm(e.target) || !H) return;
          i && na(n, a);
          let t = e.currentTarget;
          va(t, {
            x: e.clientX,
            y: e.clientY
          }, ha);
        }} contentEditable={H} suppressContentEditableWarning={!0} onMouseUp={e => {
          if (!H) return;
          let t = Wa(e.currentTarget);
          if (t && (ve.current = {
            nodeIndex: n,
            start: t.start,
            end: t.end
          }), ga(e.currentTarget)) {
            ma(), ya();
            return;
          }
          i && na(n, a);
          let r = e.currentTarget;
          va(r, {
            x: e.clientX,
            y: e.clientY
          }, ha);
        }} onKeyUp={e => {
          !H || !jx(e) || (i && na(n, a), Ja(e.currentTarget, {
            kind: `paragraph`,
            nodeIndex: n
          }));
        }} onInput={t => {
          if (!H) return;
          if (ya(), (t.nativeEvent as any)?.isComposing || xe.current) {
            e.beginSelectionSession(`composition`);
            return;
          }
          let r = Sf(t.currentTarget),
            i = e.model.nodes[n];
          if (!i || i.type !== `paragraph` || r === _f(i)) return;
          let a = be.current;
          if (a && a.key === `p:${n}` && a.text !== r) return;
          e.beginSelectionSession(`keyboard`, {
            settleAfterMs: 220
          }), Pn();
          let o = Wa(t.currentTarget),
            s = o?.end ?? r.length;
          e.commitParagraphTextAtRange({
            kind: `paragraph`,
            nodeIndex: n
          }, r, {
            start: o?.start ?? s,
            end: s
          }), be.current = {
            key: `p:${n}`,
            text: r,
            caret: s
          };
        }} onCompositionStart={() => {
          H && (ya(), xe.current = !0, e.beginSelectionSession(`composition`));
        }} onCompositionEnd={t => {
          if (!H) return;
          xe.current = !1, e.beginSelectionSession(`keyboard`, {
            settleAfterMs: 260
          }), Pn();
          let r = Sf(t.currentTarget),
            i = Wa(t.currentTarget),
            a = i?.end ?? r.length;
          e.commitParagraphTextAtRange({
            kind: `paragraph`,
            nodeIndex: n
          }, r, {
            start: i?.start ?? a,
            end: a
          }), be.current = {
            key: `p:${n}`,
            text: r,
            caret: a
          }, ve.current = i ? {
            nodeIndex: n,
            start: i.start,
            end: i.end
          } : null;
        }} onPaste={e => {
          let t = e.clipboardData.getData(`text/plain`);
          t && Ia(t) && (e.preventDefault(), e.stopPropagation());
        }} onKeyDown={r => {
          if (!H) return;
          if (ya(), Ax(r)) {
            e.beginSelectionSession(`composition`);
            return;
          }
          if (e.beginSelectionSession(`keyboard`, {
            settleAfterMs: 220
          }), i && na(n, a), Ma(r) || Fa(r) || _o(r, () => {})) return;
          if (r.key.length === 1 && !r.metaKey && !r.ctrlKey && !r.altKey && Ia(r.key)) {
            r.preventDefault(), r.stopPropagation();
            return;
          }
          let o = r.key === `Enter` && !r.metaKey && !r.ctrlKey && !r.altKey;
          if (o && r.shiftKey && Ia(`
  `)) {
            r.preventDefault(), r.stopPropagation();
            return;
          }
          let s = Sf(r.currentTarget),
            c = {
              kind: `paragraph`,
              nodeIndex: n
            },
            l = Wa(r.currentTarget) ?? (() => {
              let t = e.activeTextRange ? ff(e.activeTextRange) : void 0;
              if (!t || !ax(t.start.location, c) || !ax(t.end.location, c)) return;
              let n = Math.max(0, Math.min(Math.round(t.start.offset), s.length));
              return {
                start: n,
                end: Math.max(n, Math.min(Math.round(t.end.offset), s.length))
              };
            })(),
            u = Qv(t, s),
            d = l !== void 0 && l.start === l.end,
            f = l?.start ?? -1,
            p = Xv(t) ? 0 : ey(s),
            m = (r.key === `Backspace` || r.key === `Delete`) && !r.metaKey && !r.ctrlKey && !r.altKey && !r.shiftKey;
          if ((r.key === `ArrowUp` || r.key === `ArrowDown`) && !r.metaKey && !r.ctrlKey && !r.altKey && !r.shiftKey && d && f >= 0) {
            if (r.key === `ArrowUp` && f === 0) {
              let t;
              for (let r = n - 1; r >= 0; --r) {
                let n = px(e.model, r);
                if (n) {
                  t = n;
                  break;
                }
              }
              let i = t ? Fx(e.model, t).paragraph : void 0;
              if (t && i) {
                r.preventDefault(), r.stopPropagation(), be.current = void 0;
                let e = Ga(r.currentTarget);
                if (e && Ha(t, e, 0)) return;
                Va(t, 0);
                return;
              }
            }
            if (r.key === `ArrowDown` && f === s.length) {
              let t = mx(e.model, c),
                n = t ? Fx(e.model, t).paragraph : void 0;
              if (t && n) {
                r.preventDefault(), r.stopPropagation(), be.current = void 0;
                let e = Ga(r.currentTarget),
                  i = _f(n).length;
                if (e && Ha(t, e, i)) return;
                Va(t, _f(n).length);
                return;
              }
            }
          }
          if (m && d && f >= 0) {
            if (r.key === `Backspace` && f === 0) {
              let t;
              for (let r = n - 1; r >= 0; --r) {
                let n = px(e.model, r);
                if (n) {
                  t = n;
                  break;
                }
              }
              let i = t ? Fx(e.model, t).paragraph : void 0;
              if (t && i) {
                r.preventDefault(), r.stopPropagation(), be.current = void 0;
                let n = e.deleteExpandedSelection({
                  start: {
                    location: xx(t),
                    offset: _f(i).length
                  },
                  end: {
                    location: xx(c),
                    offset: 0
                  }
                });
                n && ca(n);
                return;
              }
            }
            if (r.key === `Delete` && f === s.length) {
              let t = mx(e.model, c),
                n = t ? Fx(e.model, t).paragraph : void 0;
              if (t && n) {
                r.preventDefault(), r.stopPropagation(), be.current = void 0;
                let n = e.deleteExpandedSelection({
                  start: {
                    location: xx(c),
                    offset: s.length
                  },
                  end: {
                    location: xx(t),
                    offset: 0
                  }
                });
                n && ca(n);
                return;
              }
            }
          }
          if (r.key === `Backspace` && !r.metaKey && !r.ctrlKey && !r.altKey && !r.shiftKey && u && d && f >= 0 && f <= p) {
            let i = e.adjustSelectedListDepth(-1, s);
            if (!i) {
              let n = Zv(t, e.model.metadata.numberingDefinitions);
              n && (e.toggleList(n), i = !0);
            }
            if (i) {
              r.preventDefault(), r.stopPropagation(), be.current = void 0, za(n, 0);
              return;
            }
          }
          if (o && r.shiftKey) {
            r.preventDefault(), r.stopPropagation();
            let t = Math.max(0, Math.min(l?.start ?? s.length, s.length)),
              i = Math.max(t, Math.min(l?.end ?? t, s.length)),
              a = `${s.slice(0, t)}
  ${s.slice(i)}`;
            be.current = void 0, e.commitParagraphText(n, a), za(n, t + 1);
            return;
          }
          if (r.key === `Tab` && !r.metaKey && !r.ctrlKey && !r.altKey && u) {
            r.preventDefault(), e.adjustSelectedListDepth(r.shiftKey ? -1 : 1, s) && (be.current = void 0, za(n, l?.end ?? s.length));
            return;
          }
          if (r.key === `Enter` && !r.shiftKey && u) {
            r.preventDefault(), r.stopPropagation();
            let t = l?.start ?? s.length,
              i = l?.end ?? t;
            be.current = void 0, R.current.clear(), ee.current.clear();
            let a = e.insertListItemAfterSelection(s, t, i, {
              kind: `paragraph`,
              nodeIndex: n
            });
            a !== void 0 && za(a.paragraphIndex, a.caretOffset);
            return;
          }
          if (o && !r.shiftKey && !u) {
            r.preventDefault(), r.stopPropagation();
            let t = Math.max(0, Math.min(l?.start ?? s.length, s.length)),
              i = Math.max(t, Math.min(l?.end ?? t, s.length));
            be.current = void 0, R.current.clear(), ee.current.clear();
            let a = e.splitParagraphAtSelection(s, t, i, {
              kind: `paragraph`,
              nodeIndex: n
            });
            a !== void 0 && za(a.paragraphIndex, a.caretOffset);
            return;
          }
        }} onBlur={r => {
          if (H && xe.current) {
            xe.current = !1;
            let i = Sf(r.currentTarget);
            i !== _f(t) && (e.suppressNextDomSelectionRestore(), e.commitParagraphText(n, i));
          }
        }}>{H ? null : Y}</div>;
      }
      let l = i ? Math.max(0, Math.round(i.startOffsetPx)) : 0,
        u = i && l > 0 ? kc : 0,
        d = i ? kc : 0,
        f = o?.pageLayout ?? Hn,
        m = t.style?.floating && !r && !i ? Sy(t, c, {
          tableWidthPx: xy(t, c),
          tableHeightPx: 0,
          indentPx: ld(t.style?.indentTwips) ?? 0,
          flowTopPx: o?.pageFlowTopPx ?? 0,
          pageMarginTopPx: f.marginsPx.top,
          pageMarginLeftPx: f.marginsPx.left
        }) : void 0,
        h = <div key={r ? `node-${n}-rows-${r.startRowIndex}-${r.endRowIndex}${i ? `-slice-${Math.max(0, Math.round(i.startOffsetPx))}-${Math.max(pc, Math.round(i.sliceHeightPx))}` : ``}` : `node-${n}`} ref={e => {
          (!r || r.startRowIndex === 0) && (e ? G.current.set(n, e) : G.current.delete(n));
        }} style={{
          ...(m ? {
            position: `absolute`,
            left: m.leftPx,
            top: m.topPx,
            maxWidth: c,
            zIndex: 2
          } : Cy(t, ld(t.style?.indentTwips) ?? 0)),
          ...(mn?.tableIndex === n ? {
            transform: `translate(${mn.deltaX}px, ${mn.deltaY}px)`,
            zIndex: 30,
            opacity: 0.9
          } : void 0),
          ...(i ? {
            height: Math.max(pc, Math.round(i.sliceHeightPx) + u + d),
            paddingTop: u,
            paddingBottom: d,
            boxSizing: `border-box`,
            overflow: `visible`
          } : void 0)
        }} onPointerEnter={() => {
          k || Qt(n);
        }} onPointerLeave={e => {
          if (k || cn.current?.tableIndex === n || zi(n, e.clientX, e.clientY)) return;
          let t = e.relatedTarget;
          t instanceof Node && e.currentTarget.contains(t) || Qt((e: any) => e === n ? void 0 : e);
        }}>{(() => {
            let a = ld(t.style?.indentTwips) ?? 0,
              o = yy(t),
              l = ub(t, o),
              u = Math.max(120, c - a - l),
              d = Br(t.style?.widthTwips),
              f = (Qe[n]?.length ?? 0) === o,
              m = yo(n, t, d),
              h = Ny(f ? m.reduce((e: any, t: any) => e + t, 0) : d ?? m.reduce((e: any, t: any) => e + t, 0), u),
              g = Jy(t),
              {
                columnWidthsPx: _,
                effectiveColumnCount: v
              } = Iy(t, m, qy(t) ? Math.max(1, h - g * Math.max(0, o + 1)) : h),
              y = bo(n, t),
              b = t.style?.cellMarginTwips,
              x = t.style?.borders,
              S = Qh(t),
              C = Math.max(0, r?.startRowIndex ?? 0),
              w = Math.min(t.rows.length, r?.endRowIndex ?? t.rows.length),
              T = t.rows.slice(C, w),
              E = !!i && i.rowIndex >= C && i.rowIndex < w,
              D = E ? Math.max(0, Math.round(i.startOffsetPx)) : 0,
              O = C > 0 || w < t.rows.length,
              A = !O && Gt?.tableIndex === n,
              M = !O && rt?.tableIndex === n,
              N = !O && Vt?.tableIndex === n,
              P = cn.current?.tableIndex === n,
              F = gn?.tableIndex === n,
              L = e.selection.kind === `table-cell` && e.selection.tableIndex === n || un?.tableIndex === n || af(e.activeTextRange, n),
              z = !k && !E && (Zt === n || L || P || M || N || A || F),
              V = _.reduce((e: any, t: any) => {
                let n = e[e.length - 1] ?? 0;
                return e.push(n + t), e;
              }, []),
              H = y.map((e: any) => Number.isFinite(e) && e > 0 ? Math.max(24, e) : 24),
              U = t.blockId ? dt[t.blockId]?.rowHeightsPx : void 0,
              te = U && U.length === t.rows.length ? U.map((e: any) => Number.isFinite(e) && e > 0 ? Math.max(24, e) : 24) : H,
              ne = te.reduce((e: any, t: any) => {
                let n = e[e.length - 1] ?? 0;
                return e.push(n + t), e;
              }, []),
              re = Math.max(0, v - 2),
              ie = Math.max(0, t.rows.length - 2),
              W = z && C === 0,
              oe = e.documentTheme === `dark` ? {
                backgroundColor: `#111827`,
                border: `1px solid #374151`,
                color: `#cbd5e1`,
                boxShadow: `0 1px 2px rgba(2, 6, 23, 0.6)`
              } : {
                backgroundColor: `#ffffff`,
                border: `1px solid #d4d4d8`,
                color: `#4b5563`,
                boxShadow: `0 1px 2px rgba(0, 0, 0, 0.14)`
              };
            return <>{z ? <><span contentEditable={!1} data-docx-pagination-ignore="true" style={{
                  position: `absolute`,
                  top: -bu,
                  left: -xu,
                  width: xu,
                  height: bu,
                  backgroundColor: `transparent`,
                  zIndex: 4
                }} onPointerEnter={() => Qt(n)} onMouseEnter={() => Qt(n)} /><span contentEditable={!1} data-docx-pagination-ignore="true" style={{
                  position: `absolute`,
                  right: -Su,
                  bottom: -Cu,
                  width: hu + Su,
                  height: hu + Cu,
                  backgroundColor: `transparent`,
                  zIndex: 4
                }} onPointerEnter={() => Qt(n)} onMouseEnter={() => Qt(n)} /></> : null}{W ? <span contentEditable={!1} data-docx-table-move-handle="true" title="Select or drag to move table" style={{
                position: `absolute`,
                top: -vu - 4,
                left: -vu - 4,
                width: vu,
                height: vu,
                display: `grid`,
                placeItems: `center`,
                cursor: `move`,
                zIndex: 7,
                touchAction: `none`,
                userSelect: `none`
              }} onPointerDown={e => {
                Gi(e, n);
              }} onContextMenu={e => {
                e.preventDefault(), e.stopPropagation();
                let t = Qi(n, 0, 0);
                Ui(n), Yi(t, {
                  x: e.clientX,
                  y: e.clientY
                });
              }}><span style={{
                  ...Du,
                  ...oe
                }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2v20" /><path d="m7 7 5-5 5 5" /><path d="m7 17 5 5 5-5" /><path d="M2 12h20" /><path d="m7 7-5 5 5 5" /><path d="m17 7 5 5-5 5" /></svg></span></span> : null}<table style={{
                width: h > 0 ? `${h}px` : `100%`,
                ...Yy(t, g),
                tableLayout: t.style?.layout === `autofit` ? `auto` : `fixed`
              }}><colgroup>{_.map((e: any, t: any) => <col key={`table-col-${n}-${t}`} style={{
                    width: `${e}px`
                  }} />)}</colgroup><tbody>{T.map((r: any, a: any) => {
                    let c = C + a,
                      l = E && i !== void 0 && c === i.rowIndex,
                      u = y[c],
                      d = st[n]?.[c] !== void 0,
                      f = typeof u == `number` && Number.isFinite(u) && u > 0,
                      m = l && i ? Math.max(pc, Math.round(i.sliceHeightPx)) : void 0,
                      h = m ? {
                        height: `${m}px`,
                        maxHeight: `${m}px`,
                        overflow: `hidden`
                      } : f ? tg(r, u) : void 0,
                      g = 0;
                    return <tr key={`row-${n}-${c}`} data-docx-table-index={n} data-docx-row-index={c} data-docx-row-sliced={l ? `true` : void 0} style={h}>{r.cells.map((a: any, m: any) => {
                        rf(un, n, c, m);
                        let v = kb(e.selection, n, c, m),
                          C = !!(un && un.tableIndex === n && !tf(un)),
                          w = jf(a.nodes),
                          T = Mf(a.nodes),
                          E = Nf(a.nodes),
                          O = v && !l && !C && !E && !k && w.length > 0,
                          A = new Map();
                        T.forEach((e: any, t: any) => {
                          A.set(e, t);
                        });
                        let M = T.length > 0 && !k && !l && !C && !E ? {
                            isEditable: !0,
                            draftKeyPrefix: `${n}:${c}:${m}`,
                            paragraphIndexesByNode: A,
                            handlers: {
                              registerElement: Xa,
                              readDraftHtml: Za,
                              writeDraftHtml: Qa,
                              clearDraftHtml: eo,
                              commitText: (e: any, t: any) => {
                                no(n, c, m, e, t);
                              }
                            }
                          } : void 0,
                          N = `${n}:${c}:${m}`,
                          P = `cell-${n}-${c}-${m}`,
                          F = a.nodes.some((e: any) => e.type === `table`),
                          L = a.style?.gridSpan && a.style.gridSpan > 1 ? a.style.gridSpan : 1,
                          z = a.style?.rowSpan && a.style.rowSpan > 1 ? a.style.rowSpan : 1,
                          V = L > 1 ? L : void 0,
                          H = z > 1 ? z : void 0,
                          U = t.rows.slice(c, c + z),
                          ne = U.length > 0 && U.every((e: any, t: any) => {
                            let n = y[c + t];
                            return e.style?.heightRule === `exact` && Number.isFinite(n) && n > 0;
                          }) ? U.reduce((e: any, t: any, n: any) => e + Math.max(pc, Math.round(y[c + n])), 0) : void 0,
                          re = g,
                          ie = re + L - 1;
                        if (g += L, a.style?.vMergeContinuation) return null;
                        let W = Br(a.style?.widthTwips),
                          oe = _.slice(re, re + L).reduce((e: any, t: any) => e + t, 0),
                          G = a.style?.backgroundColor ?? r.style?.backgroundColor,
                          K = d || f,
                          se = zy(b, a.style?.marginTwips),
                          ce = Ly(se),
                          le = Math.max(1, (W ?? oe) - ce.left - ce.right),
                          q = Math.max(pc, Math.round(te[c] ?? u ?? pc)),
                          ue = l && i ? Math.max(pc, Math.round(i.sliceHeightPx)) : void 0,
                          J = l && i && !O && ue ? us({
                            cell: a,
                            rowHeightPx: q,
                            sliceStartPx: D,
                            sliceHeightPx: ue,
                            cellContentWidthPx: le,
                            tableCellMarginTwips: b,
                            applyWordTableDefaults: S,
                            docGridLinePitchPx: s
                          }) : void 0,
                          de = O ? (() => {
                            let t = 0;
                            return a.nodes.map((r: any, i: any) => {
                              if (r.type === `paragraph`) {
                                let a = t;
                                return t += 1, <div key={`active-cell-p-${n}-${c}-${m}-${i}`} data-docx-paragraph-host="true" data-docx-paragraph-kind="table-cell" data-docx-table-index={n} data-docx-row-index={c} data-docx-cell-index={m} data-docx-paragraph-index={a} data-docx-table-paragraph-index={a} style={f_(r, e.model.metadata.numberingDefinitions, p, a, S, s)}>{Xo(r, `active-cell-${n}-${c}-${m}-${i}`, {
                                    kind: `table-cell`,
                                    tableIndex: n,
                                    rowIndex: c,
                                    cellIndex: m,
                                    paragraphIndex: a
                                  })}</div>;
                              }
                              return <div key={`active-cell-nested-${n}-${c}-${m}-${i}`} contentEditable={!1} suppressContentEditableWarning={!0}>{TS(r, `active-cell-nested-table-${n}-${c}-${m}-${i}`, j, e.model.metadata.numberingDefinitions, p, oe > 0 ? oe : void 0, Pi, void 0, void 0, void 0, void 0, I, void 0, void 0, void 0, void 0, Ko)}</div>;
                            });
                          })() : void 0,
                          Y = R.current.get(N),
                          X = O ? typeof Y == `string` ? Y : Ef(de) : void 0,
                          pe = () => {
                            let t = 0;
                            return a.nodes.map((r: any, i: any) => {
                              if (r.type === `paragraph`) {
                                let a = t;
                                return t += 1, <div key={`body-cell-p-${n}-${c}-${m}-${i}`} data-docx-paragraph-host="true" data-docx-paragraph-kind="table-cell" data-docx-table-index={n} data-docx-row-index={c} data-docx-cell-index={m} data-docx-paragraph-index={a} data-docx-table-paragraph-index={a} style={f_(r, e.model.metadata.numberingDefinitions, p, a, S, s)}>{Xo(r, `body-cell-${n}-${c}-${m}-${i}`, {
                                    kind: `table-cell`,
                                    tableIndex: n,
                                    rowIndex: c,
                                    cellIndex: m,
                                    paragraphIndex: a
                                  })}</div>;
                              }
                              return TS(r, `body-cell-nested-table-${n}-${c}-${m}-${i}`, j, e.model.metadata.numberingDefinitions, p, oe > 0 ? oe : void 0, Pi, void 0, void 0, void 0, void 0, I, void 0, void 0, M, void 0, Ko);
                            });
                          };
                        return <td key={`cell-${n}-${c}-${m}`} data-docx-table-cell="true" data-docx-table-index={n} data-docx-row-index={c} data-docx-row-sliced={l ? `true` : void 0} data-docx-cell-index={m} colSpan={V} rowSpan={H} style={{
                          ...lb(x, a.style?.borders, c, t.rows.length, re, ie, o),
                          ...db(x, a.style?.borders),
                          ...Ry(se),
                          backgroundColor: G,
                          verticalAlign: a.style?.verticalAlign ?? `top`,
                          minWidth: W ? `${W}px` : oe > 0 ? `${oe}px` : 0,
                          width: W && L === 1 ? `${W}px` : oe > 0 ? `${oe}px` : void 0,
                          ...(K && !l ? h : void 0),
                          wordWrap: `break-word`,
                          overflowWrap: `break-word`,
                          wordBreak: `break-word`,
                          position: `relative`
                        }} onClick={t => {
                          if (k || (t.target instanceof Element ? t.target : t.target instanceof Node ? t.target.parentElement : null)?.closest(`[data-docx-cell-key='${P}']`) || Sm(t.target)) return;
                          if (ln.current) {
                            ln.current = !1, t.preventDefault(), t.stopPropagation();
                            return;
                          }
                          Ri(), Li(n, c, m), e.selectTableCell(n, c, m);
                          let r = {
                              x: t.clientX,
                              y: t.clientY
                            },
                            i = `[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${n}'][data-docx-row-index='${c}'][data-docx-cell-index='${m}'][data-docx-table-paragraph-index]`,
                            a = Array.from(t.currentTarget.querySelectorAll(i)),
                            o = a.length > 0 ? a.reduce((e, t) => {
                              let n = e.getBoundingClientRect(),
                                i = t.getBoundingClientRect(),
                                a = Math.abs(r.y - (n.top + n.height / 2));
                              return Math.abs(r.y - (i.top + i.height / 2)) < a ? t : e;
                            }, a[0]) : void 0,
                            s = o?.getAttribute(`data-docx-table-paragraph-index`) ?? o?.getAttribute(`data-docx-paragraph-index`),
                            l = Number.parseInt(s ?? ``, 10),
                            u = Number.isFinite(l) ? Math.max(0, Math.round(l)) : void 0;
                          window.requestAnimationFrame(() => {
                            let e = ae.current.get(N);
                            if (!e || !e.isConnected) return;
                            e.focus();
                            let t = `[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${n}'][data-docx-row-index='${c}'][data-docx-cell-index='${m}'][data-docx-table-paragraph-index]`,
                              i = Array.from(e.querySelectorAll(t)) as Element[],
                              a = Number.isFinite(u) ? e.querySelector(`[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${n}'][data-docx-row-index='${c}'][data-docx-cell-index='${m}'][data-docx-table-paragraph-index='${u}']`) ?? void 0 : void 0,
                              o = document.elementFromPoint(r.x, r.y)?.closest(t) ?? void 0,
                              s = i.length > 0 ? i.reduce((e, t) => {
                                let n = e.getBoundingClientRect(),
                                  i = t.getBoundingClientRect(),
                                  a = Math.abs(r.y - (n.top + n.height / 2));
                                return Math.abs(r.y - (i.top + i.height / 2)) < a ? t : e;
                              }, i[0]) : void 0;
                            $i(a ?? o ?? s ?? e, r), qa(e, n, c, m);
                          });
                        }} onContextMenu={t => {
                          k || xm(t.target) || Sm(t.target) || (t.preventDefault(), t.stopPropagation(), Ri(), Li(n, c, m), e.selectTableCell(n, c, m), Yi({
                            tableIndex: n,
                            rowIndex: c,
                            cellIndex: m
                          }, {
                            x: t.clientX,
                            y: t.clientY
                          }));
                        }} onPointerDown={e => {
                          if (k) return;
                          if (ln.current = !1, (e.target instanceof Element ? e.target : e.target instanceof Node ? e.target.parentElement : null)?.closest(`[data-docx-cell-key='${P}']`)) {
                            fe.current = void 0;
                            return;
                          }
                          if (Sm(e.target) || e.button !== 0 && e.button !== void 0 || xm(e.target)) return;
                          let t = fa({
                            x: e.clientX,
                            y: e.clientY
                          });
                          ka(e.pointerId, {
                            tableIndex: n,
                            rowIndex: c,
                            cellIndex: m
                          }, e.clientX, e.clientY, t);
                          let r = t?.location.kind === `table-cell` && t.location.tableIndex === n && t.location.rowIndex === c && t.location.cellIndex === m ? {
                              location: xx(t.location),
                              offset: t.offset
                            } : void 0,
                            i = `[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${n}'][data-docx-row-index='${c}'][data-docx-cell-index='${m}'][data-docx-table-paragraph-index]`,
                            a = Array.from(e.currentTarget.querySelectorAll(i)),
                            o = a.length > 0 ? a.reduce((t, n) => {
                              let r = t.getBoundingClientRect(),
                                i = n.getBoundingClientRect(),
                                a = Math.abs(e.clientY - (r.top + r.height / 2));
                              return Math.abs(e.clientY - (i.top + i.height / 2)) < a ? n : t;
                            }, a[0]) : void 0,
                            s = o?.getAttribute(`data-docx-table-paragraph-index`) ?? o?.getAttribute(`data-docx-paragraph-index`),
                            l = Number.parseInt(s ?? ``, 10),
                            u = Number.isFinite(l) ? Math.max(0, Math.round(l)) : void 0;
                          fe.current = {
                            cellElementKey: P,
                            point: {
                              x: e.clientX,
                              y: e.clientY
                            },
                            boundary: r,
                            paragraphIndex: u
                          };
                        }}>{O ? <div contentEditable={!0} suppressContentEditableWarning={!0} data-docx-cell-key={P} style={{
                            minHeight: 0,
                            outline: `none`,
                            padding: 0,
                            borderRadius: 0,
                            display: `grid`,
                            gap: 0,
                            whiteSpace: `pre-wrap`,
                            wordWrap: `break-word`,
                            overflowWrap: `break-word`,
                            wordBreak: `break-word`
                          }} dangerouslySetInnerHTML={X ? kx(B.current, N, X) : void 0} ref={t => {
                            if (t ? ae.current.set(N, t) : ae.current.delete(N), !t || !O) return;
                            let r = R.current.get(N);
                            if (!xe.current && typeof r == `string`) {
                              let i = r;
                              Ru(() => {
                                if (!t!.isConnected || xe.current || R.current.get(N) !== i) return;
                                if (t!.innerHTML !== i) {
                                  let e = document.activeElement,
                                    n = e === t || e instanceof Element && t!.contains(e),
                                    r = n ? Wa(t) : void 0;
                                  if (t!.innerHTML = i, n) if (r) {
                                    let e = Cf(t).length,
                                      n = Math.max(0, Math.min(r.start, e));
                                    ea(t, n, Math.max(n, Math.min(r.end, e)));
                                  } else $i(t);
                                }
                                let r = e.model.nodes[n];
                                if (!r || r.type !== `table`) return;
                                let a = r.rows[c]?.cells[m];
                                a && Cf(t) === vy(jf(a.nodes)) && R.current.delete(N);
                              });
                            }
                            let i = fe.current;
                            if (i?.cellElementKey === P) {
                              if (i.point) {
                                let e = t!.getBoundingClientRect();
                                if (!(i.point.x >= e.left && i.point.x <= e.right && i.point.y >= e.top && i.point.y <= e.bottom)) return;
                              }
                              window.requestAnimationFrame(() => {
                                let e = fe.current;
                                if (!e || e.cellElementKey !== P || !t!.isConnected) return;
                                t!.focus();
                                let r = e.boundary,
                                  i = !!(r && r.location.kind === `table-cell` && r.location.tableIndex === n && r.location.rowIndex === c && r.location.cellIndex === m),
                                  a = Number.isFinite(e.paragraphIndex) ? t!.querySelector(`[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${n}'][data-docx-row-index='${c}'][data-docx-cell-index='${m}'][data-docx-table-paragraph-index='${e.paragraphIndex}']`) ?? void 0 : void 0,
                                  o = `[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${n}'][data-docx-row-index='${c}'][data-docx-cell-index='${m}'][data-docx-table-paragraph-index]`,
                                  s = Array.from(t!.querySelectorAll(o)),
                                  l = e.point ? document.elementFromPoint(e.point.x, e.point.y)?.closest(o) ?? void 0 : void 0,
                                  u = e.point && s.length > 0 ? s.reduce((t, n) => {
                                    let r = t.getBoundingClientRect(),
                                      i = n.getBoundingClientRect(),
                                      a = Math.abs(e.point.y - (r.top + r.height / 2));
                                    return Math.abs(e.point.y - (i.top + i.height / 2)) < a ? n : t;
                                  }, s[0]) : void 0,
                                  d = a ?? l ?? u;
                                i && r ? sa(r, r) : d ? $i(d, e.point) : e.point ? $i(t, e.point) : $i(t), qa(t, n, c, m), fe.current = void 0;
                              });
                            }
                          }} onInput={t => {
                            if (ya(), (t.nativeEvent as any)?.isComposing || xe.current) {
                              e.beginSelectionSession(`composition`);
                              return;
                            }
                            if (F) {
                              e.beginSelectionSession(`keyboard`, {
                                settleAfterMs: 220
                              }), Pn(), R.current.set(N, t.currentTarget.innerHTML), Fn();
                              return;
                            }
                            let r = Ka(t.currentTarget),
                              i = r ? w[r.paragraphIndex] : void 0;
                            if (!r || !i) return;
                            let a = Sf(r.paragraphElement);
                            if (a === _f(i)) return;
                            let o = `c:${n}:${c}:${m}:${r.paragraphIndex}`,
                              s = be.current;
                            if (s && s.key === o && s.text !== a) return;
                            e.beginSelectionSession(`keyboard`, {
                              settleAfterMs: 220
                            }), Pn();
                            let l = Wa(r.paragraphElement),
                              u = l?.end ?? a.length;
                            e.commitParagraphTextAtRange({
                              kind: `table-cell`,
                              tableIndex: n,
                              rowIndex: c,
                              cellIndex: m,
                              paragraphIndex: r.paragraphIndex
                            }, a, {
                              start: l?.start ?? u,
                              end: u
                            }), be.current = {
                              key: o,
                              text: a,
                              caret: u
                            };
                          }} onCompositionStart={() => {
                            ya(), xe.current = !0, e.beginSelectionSession(`composition`);
                          }} onCompositionEnd={t => {
                            if (xe.current = !1, e.beginSelectionSession(`keyboard`, {
                              settleAfterMs: 260
                            }), Pn(), F) {
                              R.current.set(N, t.currentTarget.innerHTML), Fn();
                              return;
                            }
                            let r = Ka(t.currentTarget);
                            if (r && w[r.paragraphIndex]) {
                              let t = Sf(r.paragraphElement),
                                i = Wa(r.paragraphElement),
                                a = i?.end ?? t.length;
                              e.commitParagraphTextAtRange({
                                kind: `table-cell`,
                                tableIndex: n,
                                rowIndex: c,
                                cellIndex: m,
                                paragraphIndex: r.paragraphIndex
                              }, t, {
                                start: i?.start ?? a,
                                end: a
                              }), be.current = {
                                key: `c:${n}:${c}:${m}:${r.paragraphIndex}`,
                                text: t,
                                caret: a
                              };
                              return;
                            }
                            e.commitTableCellText(n, c, m, Cf(t.currentTarget));
                          }} onClick={e => {
                            if (xm(e.target) || Sm(e.target) || e.detail > 1) return;
                            let t = e.currentTarget,
                              r = `[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${n}'][data-docx-row-index='${c}'][data-docx-cell-index='${m}'][data-docx-table-paragraph-index]`,
                              i = e.target instanceof Element ? e.target : e.target instanceof Node ? e.target.parentElement : null,
                              a = i ? i.closest(r) ?? void 0 : void 0,
                              o = (() => {
                                if (a) return a;
                                let t = Array.from(e.currentTarget.querySelectorAll(r));
                                if (t.length !== 0) return t.reduce((t, n) => {
                                  let r = t.getBoundingClientRect(),
                                    i = n.getBoundingClientRect(),
                                    a = Math.abs(e.clientY - (r.top + r.height / 2));
                                  return Math.abs(e.clientY - (i.top + i.height / 2)) < a ? n : t;
                                }, t[0]);
                              })();
                            o && va(o, {
                              x: e.clientX,
                              y: e.clientY
                            }, () => {
                              qa(t, n, c, m);
                            });
                          }} onDoubleClick={e => {
                            let t = e.currentTarget,
                              r = `[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${n}'][data-docx-row-index='${c}'][data-docx-cell-index='${m}'][data-docx-table-paragraph-index]`,
                              i = (e.target instanceof Element ? e.target : e.target instanceof Node ? e.target.parentElement : null)?.closest(r) ?? void 0;
                            i && va(i, {
                              x: e.clientX,
                              y: e.clientY
                            }, () => {
                              qa(t, n, c, m);
                            });
                          }} onPaste={e => {
                            let t = e.clipboardData.getData(`text/plain`);
                            t && Ia(t) && (e.preventDefault(), e.stopPropagation(), R.current.delete(N));
                          }} onMouseUp={e => {
                            let t = e.currentTarget,
                              r = `[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${n}'][data-docx-row-index='${c}'][data-docx-cell-index='${m}'][data-docx-table-paragraph-index]`,
                              i = Array.from(e.currentTarget.querySelectorAll(r)),
                              a = i.length > 0 ? i.reduce((t, n) => {
                                let r = t.getBoundingClientRect(),
                                  i = n.getBoundingClientRect(),
                                  a = Math.abs(e.clientY - (r.top + r.height / 2));
                                return Math.abs(e.clientY - (i.top + i.height / 2)) < a ? n : t;
                              }, i[0]) : void 0;
                            if (a && ga(a)) {
                              qa(t, n, c, m), ya();
                              return;
                            }
                            a && va(a, {
                              x: e.clientX,
                              y: e.clientY
                            }, () => {
                              qa(t, n, c, m);
                            });
                          }} onKeyUp={e => {
                            jx(e) && qa(e.currentTarget, n, c, m);
                          }} onKeyDown={t => {
                            if (ya(), Ax(t)) {
                              e.beginSelectionSession(`composition`);
                              return;
                            }
                            if (e.beginSelectionSession(`keyboard`, {
                              settleAfterMs: 220
                            }), Ma(t) || Fa(t) || _o(t, () => {
                              F && Ya(n, c, m, w, N, t.currentTarget);
                            })) return;
                            if (t.key.length === 1 && !t.metaKey && !t.ctrlKey && !t.altKey && Ia(t.key)) {
                              t.preventDefault(), t.stopPropagation(), R.current.delete(N);
                              return;
                            }
                            if (t.key === `Enter` && !t.metaKey && !t.ctrlKey && !t.altKey && Ia(`
  `)) {
                              t.preventDefault(), t.stopPropagation(), R.current.delete(N);
                              return;
                            }
                            let r = Ka(t.currentTarget),
                              i = r?.paragraphIndex ?? 0,
                              a = w[i];
                            if (!a || !r?.paragraphElement) return;
                            let o = Sf(r.paragraphElement),
                              s = Qv(a, o),
                              l = Wa(r.paragraphElement),
                              u = l !== void 0 && l.start === l.end;
                            if (t.key === `Enter` && !t.metaKey && !t.ctrlKey && !t.altKey && !s) {
                              t.preventDefault(), t.stopPropagation();
                              let r = Math.max(0, Math.min(l?.start ?? o.length, o.length)),
                                a = Math.max(r, Math.min(l?.end ?? r, o.length)),
                                s = `${o.slice(0, r)}
  ${o.slice(a)}`;
                              be.current = void 0, R.current.delete(N), ee.current.delete(Yx(n, c, m, i)), e.commitTableCellParagraphTextRecursive(n, c, m, i, s), Ba(N, i, r + 1);
                              return;
                            }
                            if (t.key === `Backspace` && !t.metaKey && !t.ctrlKey && !t.altKey && !t.shiftKey && s && u && (l?.start ?? -1) === 0) {
                              let n = e.adjustSelectedListDepth(-1, o);
                              if (!n) {
                                let t = Zv(a, e.model.metadata.numberingDefinitions);
                                t && (e.toggleList(t), n = !0);
                              }
                              if (n) {
                                t.preventDefault(), t.stopPropagation(), be.current = void 0, R.current.delete(N), Ba(N, i, 0);
                                return;
                              }
                            }
                            t.key === `Tab` && !t.metaKey && !t.ctrlKey && !t.altKey && s && (t.preventDefault(), e.adjustSelectedListDepth(t.shiftKey ? -1 : 1, o) && (be.current = void 0, R.current.delete(N), Ba(N, i, l?.end ?? o.length)));
                          }} onBlur={t => {
                            if (!F) {
                              if (xe.current) {
                                xe.current = !1;
                                let r = Cf(t.currentTarget);
                                r !== vy(w) && (e.suppressNextDomSelectionRestore(), e.commitTableCellText(n, c, m, r));
                              }
                              return;
                            }
                            xe.current && (xe.current = !1, R.current.set(N, t.currentTarget.innerHTML)), R.current.has(N) && Ya(n, c, m, w, N, t.currentTarget);
                          }} /> : J && ue ? <div style={{
                            position: `relative`,
                            height: ue,
                            overflow: `visible`
                          }}>{J.map((e: any) => {
                              let t = a.nodes.indexOf(e.paragraph);
                              return <div key={`body-cell-slice-host-${n}-${c}-${m}-${t}`} style={{
                                position: `absolute`,
                                left: 0,
                                right: 0,
                                top: e.topPx
                              }}>{ds({
                                  paragraph: e.paragraph,
                                  paragraphIndex: e.paragraphIndex,
                                  tableIndex: n,
                                  rowIndex: c,
                                  cellIndex: m,
                                  contentIndex: t,
                                  cellContentWidthPx: le,
                                  applyWordTableDefaults: S,
                                  docGridLinePitchPx: s,
                                  layoutEntry: e.layoutEntry,
                                  paragraphLineRange: e.paragraphLineRange
                                })}</div>;
                            })}</div> : l && ue ? <div style={{
                            height: ue,
                            overflow: `hidden`,
                            position: `relative`
                          }}><div style={{
                              display: `grid`,
                              gap: 0,
                              transform: `translateY(-${D}px)`
                            }}>{pe()}</div></div> : <div style={{
                            display: `grid`,
                            gap: 0,
                            ...(ne !== void 0 && !l ? {
                              maxHeight: `${ne}px`,
                              overflow: `hidden`
                            } : void 0)
                          }}>{pe()}</div>}</td>;
                      })}</tr>;
                  })}</tbody></table>{z && !O && o > 1 ? _.slice(0, re + 1).map((t: any, r: any) => {
                if (r > re) return null;
                let i = V[r] ?? 0,
                  a = M && rt?.boundaryColumnIndex === r,
                  o = Yt?.tableIndex === n && Yt?.kind === `column` && Yt.boundaryIndex === r,
                  s = a || o;
                return <span key={`column-border-${n}-${r}`} contentEditable={!1} style={{
                  position: `absolute`,
                  top: 0,
                  bottom: 0,
                  left: `${i - hu / 2 + wu}px`,
                  width: hu,
                  cursor: `col-resize`,
                  zIndex: 5,
                  touchAction: `none`,
                  userSelect: `none`,
                  backgroundColor: `transparent`
                }} onMouseEnter={() => Xt({
                  tableIndex: n,
                  kind: `column`,
                  boundaryIndex: r
                })} onPointerEnter={() => Xt({
                  tableIndex: n,
                  kind: `column`,
                  boundaryIndex: r
                })} onMouseLeave={() => {
                  Yt?.tableIndex === n && Yt.kind === `column` && Yt.boundaryIndex === r && Xt(void 0);
                }} onPointerLeave={() => {
                  Yt?.tableIndex === n && Yt.kind === `column` && Yt.boundaryIndex === r && Xt(void 0);
                }} onContextMenu={t => {
                  if (k) return;
                  t.preventDefault(), t.stopPropagation();
                  let i = Qi(n, 0, r);
                  Ri(), Li(i.tableIndex, i.rowIndex, i.cellIndex), e.selectTableCell(i.tableIndex, i.rowIndex, i.cellIndex), Yi(i, {
                    x: t.clientX,
                    y: t.clientY
                  });
                }} onPointerDown={e => {
                  let t = e.currentTarget.parentElement?.querySelector(`table`);
                  To(e, n, r, t ? t.getBoundingClientRect().width : 0, _), Xt(void 0);
                }}><span style={{
                    position: `absolute`,
                    left: `50%`,
                    top: 0,
                    transform: `translateX(-50%)`,
                    width: gu,
                    height: `100%`,
                    backgroundColor: s ? `#3b82f6` : `transparent`
                  }} /></span>;
              }) : null}{z && !O && t.rows.length > 1 ? y.slice(0, ie + 1).map((t: any, r: any) => {
                if (r > ie) return null;
                let i = ne[r] ?? 0,
                  a = N && Vt?.boundaryRowIndex === r,
                  o = Yt?.tableIndex === n && Yt?.kind === `row` && Yt.boundaryIndex === r,
                  s = a || o;
                return <span key={`row-border-${n}-${r}`} contentEditable={!1} style={{
                  position: `absolute`,
                  left: 0,
                  width: `${h}px`,
                  top: `${i - hu / 2 + wu}px`,
                  height: hu,
                  cursor: `row-resize`,
                  zIndex: 5,
                  touchAction: `none`,
                  userSelect: `none`,
                  backgroundColor: `transparent`
                }} onMouseEnter={() => Xt({
                  tableIndex: n,
                  kind: `row`,
                  boundaryIndex: r
                })} onPointerEnter={() => Xt({
                  tableIndex: n,
                  kind: `row`,
                  boundaryIndex: r
                })} onMouseLeave={() => {
                  Yt?.tableIndex === n && Yt.kind === `row` && Yt.boundaryIndex === r && Xt(void 0);
                }} onPointerLeave={() => {
                  Yt?.tableIndex === n && Yt.kind === `row` && Yt.boundaryIndex === r && Xt(void 0);
                }} onContextMenu={t => {
                  if (k) return;
                  t.preventDefault(), t.stopPropagation();
                  let i = Qi(n, r, 0);
                  Ri(), Li(i.tableIndex, i.rowIndex, i.cellIndex), e.selectTableCell(i.tableIndex, i.rowIndex, i.cellIndex), Yi(i, {
                    x: t.clientX,
                    y: t.clientY
                  });
                }} onPointerDown={e => {
                  let t = e.currentTarget.parentElement?.querySelector(`table`),
                    i = t ? Array.from(t.querySelectorAll(`tbody > tr`)).map(e => zu(e.getBoundingClientRect().height)) : [];
                  Eo(e, n, r, i.length > 0 ? i : te), Xt(void 0);
                }}><span style={{
                    position: `absolute`,
                    top: `50%`,
                    left: 0,
                    right: 0,
                    transform: `translateY(-50%)`,
                    width: `100%`,
                    height: gu,
                    backgroundColor: s ? `#3b82f6` : `transparent`
                  }} /></span>;
              }) : null}{z && !O ? <span contentEditable={!1} style={{
                position: `absolute`,
                left: `${Math.max(0, h - hu / 2 + wu)}px`,
                bottom: -8,
                width: hu,
                height: hu,
                display: `flex`,
                alignItems: `flex-start`,
                justifyContent: `flex-start`,
                cursor: `nwse-resize`,
                opacity: 1,
                zIndex: 6,
                touchAction: `none`
              }} onPointerDown={e => {
                let t = e.currentTarget.parentElement?.querySelector(`table`),
                  r = t ? t.getBoundingClientRect().width : 0,
                  i = t ? Array.from(t.querySelectorAll(`tbody > tr`)).map(e => zu(e.getBoundingClientRect().height)) : [];
                Uo(e, n, r, _, i.length > 0 ? i : y.map((e: any) => e ?? 24), u);
              }} onContextMenu={t => {
                if (k) return;
                t.preventDefault(), t.stopPropagation();
                let r = Qi(n, 0, 0);
                Ri(), Li(r.tableIndex, r.rowIndex, r.cellIndex), e.selectTableCell(r.tableIndex, r.rowIndex, r.cellIndex), Yi(r, {
                  x: t.clientX,
                  y: t.clientY
                });
              }}><span style={{
                  ...Eu,
                  position: `absolute`,
                  right: 0,
                  bottom: 0
                }} /></span> : null}</>;
          })()}</div>;
      return m ? <div key={`floating-table-host-${n}`} data-docx-floating-table-host="true" style={{
        height: 0,
        position: `relative`,
        overflow: `visible`
      }}>{h}</div> : h;
    },
  /* 原 ps（jsx 35044）：页流渲染器 */
    ps = React.useCallback((t: any, n: any) => {
      let r = [],
        i = 0,
        a = n?.pageLayout ?? Hn,
        o = xp(t, e.model, ns, e.model.metadata.numberingDefinitions, Gn, Kn, a, {
          floatingMovePreview: Q,
          resizePreview: Ge,
          measuredWrapBands: On
        });
      for (let a = 0; a < t.length; a += 1) {
        let s = nu(e.model.nodes, t, a);
        if (s) {
          let t = (t: any, r: any, i: any, a: any) => {
              let o = e.model.nodes[t.nodeIndex];
              if (!o) return null;
              let s = t.tableRowRange ? `rows-${t.tableRowRange.startRowIndex}-${t.tableRowRange.endRowIndex}${t.tableRowSlice ? `-slice-${Math.max(0, Math.round(t.tableRowSlice.startOffsetPx))}-${Math.max(pc, Math.round(t.tableRowSlice.sliceHeightPx))}` : ``}` : t.paragraphLineRange ? `lines-${t.paragraphLineRange.startLineIndex}-${t.paragraphLineRange.endLineIndex}` : `all`;
              return <>{fs(o, t.nodeIndex, t.tableRowRange, t.tableRowSlice, t.paragraphLineRange, {
                  letterheadFloatSide: r,
                  oppositeLetterheadFloatSide: i,
                  suppressLetterheadColumnLayout: !0,
                  isFirstInLetterheadColumn: a,
                  pageLayout: n?.pageLayout,
                  suppressLikelyFullPageCoverImageKeys: n?.suppressLikelyFullPageCoverImageKeys
                })}</>;
            },
            o = s.leftSegments,
            c = s.rightSegments,
            l = Math.max(o.length, c.length),
            u = (t: any) => {
              let n = e.model.nodes[t.nodeIndex];
              return n ? Tg(n, t, e.model, ns, e.model.metadata.numberingDefinitions, Gn.get(t.nodeIndex)) : 0;
            };
          r.push(<div key={`letterhead-group-${s.startOffset}-${s.endOffset}`} style={ru()}>{Array.from({
              length: l
            }, (e, n) => {
              let r = o[n],
                i = c[n];
              return <><div style={iu()}>{r ? t(r, `left`, `right`, n === 0) : null}</div><div style={iu()}>{i ? t(i, `right`, `left`, n === 0) : null}</div></>;
            })}</div>), i += Array.from({
            length: l
          }, (e, t) => {
            let n = o[t] ? u(o[t]) : 0,
              r = c[t] ? u(c[t]) : 0;
            return Math.max(n, r);
          }).reduce((e, t) => e + t, 0), a = s.endOffset - 1;
          continue;
        }
        let c = t[a],
          l = c.nodeIndex,
          u = e.model.nodes[l];
        if (!u) continue;
        if (u.type === `paragraph` && !c.tableRowRange) {
          let i = gg(c.paragraphLineRange),
            o = Zl(u),
            s = t[a + 1],
            d = gg(s?.paragraphLineRange),
            f = s?.nodeIndex,
            p = f === void 0 ? void 0 : e.model.nodes[f];
          if (o?.type === `drop` && p?.type === `paragraph` && !s?.tableRowRange && !i && !d) {
            let t = Je?.nodeIndex === l ? Je : void 0,
              i = Xe?.nodeIndex === l ? Xe : void 0,
              c = _f(u).replace(/\s+/g, ` `).trim(),
              d = Of(u),
              m = Th(p, ns, e.model.metadata.numberingDefinitions),
              h = t_(p, f === void 0 ? void 0 : Gn.get(f)),
              g = typeof h == `number` ? Math.max(pc, Math.round(h * Ym(p))) : typeof h == `string` && h.endsWith(`px`) ? Math.max(pc, Math.round(Number.parseFloat(h))) : Rh(p, f === void 0 ? void 0 : Gn.get(f)),
              _ = Math.max(2, Math.round(o.lines ?? 3)),
              v = tm(d, g, _, i?.fontSizePx),
              y = nm(d, g, _, v),
              b = {
                ...(d ?? {}),
                fontSizePt: Math.max(1, v * 72 / 96)
              },
              x = Math.max(g, Math.round(uh(c || `A`, b, v) + v * 0.18)),
              S = Math.max(4, Br(o.horizontalSpaceTwips) ?? 6),
              C = Math.max(0, Br(o.xTwips) ?? 0),
              w = Math.max(0, Br(o.yTwips) ?? 0),
              T = ou(C + Math.round(t?.deltaX ?? 0), 0, Math.max(0, m - x)),
              E = Math.max(0, w + Math.round(t?.deltaY ?? 0)),
              D = T + x / 2 > m / 2,
              O = Math.max(0, m - x - T),
              A = Re === l,
              M = !k && (A || Be === l || Je?.nodeIndex === l || Xe?.nodeIndex === l),
              N = Mp(p),
              P = D ? {
                left: Math.max(0, T - S),
                right: Math.min(m, T + x),
                top: E,
                bottom: E + y + Math.max(0, Br(o.verticalSpaceTwips) ?? 0)
              } : {
                left: Math.max(0, T),
                right: Math.min(m, T + x + S),
                top: E,
                bottom: E + y + Math.max(0, Br(o.verticalSpaceTwips) ?? 0)
              },
              F = N ? Xp(p, N, m, g, [P]) : void 0,
              I = Math.max(F?.height ?? 0, P.bottom);
            r.push(<div key={`dropcap-${l}-${f}`} style={{
              display: `flow-root`,
              position: `relative`
            }}>{!F && c.length > 0 ? <span data-docx-drop-cap="true" data-docx-drop-cap-node-index={l} contentEditable={!1} style={{
                float: D ? `right` : `left`,
                marginTop: E,
                marginBottom: Math.max(0, Br(o.verticalSpaceTwips) ?? 0),
                ...(D ? {
                  marginLeft: S,
                  marginRight: O
                } : {
                  marginLeft: T,
                  marginRight: S
                }),
                position: `relative`,
                zIndex: 2,
                width: x,
                minHeight: y,
                display: `inline-flex`,
                alignItems: `stretch`,
                touchAction: `none`,
                userSelect: `none`
              }} onClick={e => {
                e.stopPropagation(), Ta(l);
              }} onPointerEnter={() => {
                k || Ve(l);
              }} onPointerLeave={() => {
                Ve((e: any) => e === l ? void 0 : e);
              }}><input type="text" value={c} readOnly={k} spellCheck={!1} aria-label="Drop cap text" onChange={t => {
                  k || e.setParagraphDropCapText(l, t.currentTarget.value);
                }} onPointerDown={e => {
                  e.stopPropagation(), Ta(l);
                }} onClick={e => {
                  e.stopPropagation();
                }} onFocus={() => {
                  Ta(l);
                }} onKeyDown={e => {
                  e.key === `Enter` && e.preventDefault();
                }} style={{
                  ...__(b, j),
                  width: `100%`,
                  minHeight: y,
                  border: A ? `1px solid rgba(37, 99, 235, 0.8)` : `1px solid transparent`,
                  borderRadius: 4,
                  backgroundColor: `transparent`,
                  outline: `none`,
                  padding: 0,
                  margin: 0,
                  lineHeight: 1,
                  whiteSpace: `pre`,
                  overflow: `visible`,
                  boxSizing: `border-box`,
                  boxShadow: A ? `0 0 0 2px rgba(191, 219, 254, 0.65)` : void 0,
                  color: p_(b.color, j) ?? void 0,
                  fontFamily: m_(b.fontFamily) ?? void 0
                }} />{M ? <span contentEditable={!1} data-docx-table-move-handle="true" title="Move drop cap" style={{
                  position: `absolute`,
                  top: -vu - 4,
                  left: -vu - 4,
                  width: vu,
                  height: vu,
                  display: `grid`,
                  placeItems: `center`,
                  cursor: `move`,
                  zIndex: 7,
                  touchAction: `none`,
                  userSelect: `none`
                }} onPointerDown={e => Mo(e, l, o)}><span style={{
                    ...Du
                  }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2v20" /><path d="m7 7 5-5 5 5" /><path d="m7 17 5 5 5-5" /><path d="M2 12h20" /><path d="m7 7-5 5 5 5" /><path d="m17 7 5 5-5 5" /></svg></span></span> : null}{M ? <span contentEditable={!1} data-image-resize-handle="true" title="Resize drop cap" style={{
                  position: `absolute`,
                  right: -Su,
                  bottom: -Cu,
                  width: hu + Su,
                  height: hu + Cu,
                  display: `grid`,
                  placeItems: `end`,
                  zIndex: 7,
                  cursor: `nwse-resize`,
                  touchAction: `none`,
                  userSelect: `none`
                }} onPointerDown={e => No(e, l, v, x, y)}><span style={{
                    ...Eu,
                    pointerEvents: `auto`
                  }} /></span> : null}</span> : null}{F && N ? (() => {
                let t = He?.locationKey === `p:${f}` ? He : void 0,
                  n = t ? Ip(t.text, Of(p)) : N,
                  r = t ? Hp(p, n, m, g, [P]) ?? F : F;
                return Yo({
                  location: {
                    kind: `paragraph`,
                    nodeIndex: f
                  },
                  keyPrefix: `dropcap-wrap-${l}-${f}`,
                  source: n,
                  layout: r,
                  lineHeightPx: g,
                  blockHeightPx: I,
                  obstacleNodes: c.length > 0 ? <span data-docx-drop-cap="true" data-docx-drop-cap-node-index={l} contentEditable={!1} style={{
                    position: `absolute`,
                    left: T,
                    top: E,
                    zIndex: 3,
                    width: x,
                    minHeight: y,
                    display: `inline-flex`,
                    alignItems: `stretch`,
                    touchAction: `none`,
                    userSelect: `none`
                  }} onClick={e => {
                    e.stopPropagation(), Ta(l);
                  }} onPointerEnter={() => {
                    k || Ve(l);
                  }} onPointerLeave={() => {
                    Ve((e: any) => e === l ? void 0 : e);
                  }}><input type="text" value={c} readOnly={k} spellCheck={!1} aria-label="Drop cap text" onChange={t => {
                      k || e.setParagraphDropCapText(l, t.currentTarget.value);
                    }} onPointerDown={e => {
                      e.stopPropagation(), Ta(l);
                    }} onClick={e => {
                      e.stopPropagation();
                    }} onFocus={() => {
                      Ta(l);
                    }} onKeyDown={e => {
                      e.key === `Enter` && e.preventDefault();
                    }} style={{
                      ...__(b, j),
                      width: `100%`,
                      minHeight: y,
                      border: A ? `1px solid rgba(37, 99, 235, 0.8)` : `1px solid transparent`,
                      borderRadius: 4,
                      backgroundColor: `transparent`,
                      outline: `none`,
                      padding: 0,
                      margin: 0,
                      lineHeight: 1,
                      whiteSpace: `pre`,
                      overflow: `visible`,
                      boxSizing: `border-box`,
                      boxShadow: A ? `0 0 0 2px rgba(191, 219, 254, 0.65)` : void 0,
                      color: p_(b.color, j) ?? void 0,
                      fontFamily: m_(b.fontFamily) ?? void 0
                    }} />{M ? <span contentEditable={!1} data-docx-table-move-handle="true" title="Move drop cap" style={{
                      position: `absolute`,
                      top: -vu - 4,
                      left: -vu - 4,
                      width: vu,
                      height: vu,
                      display: `grid`,
                      placeItems: `center`,
                      cursor: `move`,
                      zIndex: 7,
                      touchAction: `none`,
                      userSelect: `none`
                    }} onPointerDown={e => Mo(e, l, o)}><span style={{
                        ...Du
                      }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2v20" /><path d="m7 7 5-5 5 5" /><path d="m7 17 5 5-5 5" /><path d="M2 12h20" /><path d="m7 7-5 5 5 5" /><path d="m17 7 5 5-5 5" /></svg></span></span> : null}{M ? <span contentEditable={!1} data-image-resize-handle="true" title="Resize drop cap" style={{
                      position: `absolute`,
                      right: -Su,
                      bottom: -Cu,
                      width: hu + Su,
                      height: hu + Cu,
                      display: `grid`,
                      placeItems: `end`,
                      zIndex: 7,
                      cursor: `nwse-resize`,
                      touchAction: `none`,
                      userSelect: `none`
                    }} onPointerDown={e => No(e, l, v, x, y)}><span style={{
                        ...Eu,
                        pointerEvents: `auto`
                      }} /></span> : null}</span> : void 0
                });
              })() : fs(p, f, s?.tableRowRange, s?.tableRowSlice, s?.paragraphLineRange, {
                pageLayout: n?.pageLayout,
                suppressLikelyFullPageCoverImageKeys: n?.suppressLikelyFullPageCoverImageKeys
              })}</div>), a += 1;
            continue;
          }
        }
        let d = c.paragraphLineRange,
          f = u.type === `paragraph` && (!d || d.startLineIndex === 0 && d.endLineIndex >= d.totalLineCount) ? On.get(`para:${l}`)?.topPx : void 0;
        r.push(fs(u, l, c.tableRowRange, c.tableRowSlice, c.paragraphLineRange, {
          pageLayout: n?.pageLayout,
          pageFlowTopPx: f ?? i,
          pageFlowForeignExclusions: o[a],
          suppressLikelyFullPageCoverImageKeys: n?.suppressLikelyFullPageCoverImageKeys
        })), i += Tg(u, c, e.model, ns, e.model.metadata.numberingDefinitions, Gn.get(l));
      }
      return r;
    }, [wt, Mo, No, ba, Gn, ns, Hn, Je, Xe, e, Q, wa, Be, k, On, Kn, fs, Ge, Re]),
  /* 原 ms/hs（jsx 35332-35333）：脚注/尾注数据 */
    ms = e.model.metadata.footnotes ?? [],
    hs = e.model.metadata.endnotes ?? [],
  /* 原 gs/_s/vs/ys（jsx 35334-35337）：脚注/尾注索引 */
    gs = React.useMemo(() => new Map(ms.map((e: any, t: any) => [e.id, t + 1])), [ms]),
    _s = React.useMemo(() => new Map(hs.map((e: any, t: any) => [e.id, t + 1])), [hs]),
    vs = React.useMemo(() => new Map(ms.map((e: any) => [e.id, e])), [ms]),
    ys = React.useMemo(() => new Map(hs.map((e: any) => [e.id, e])), [hs]),
  /* 原 bs（jsx 35338）：逐页脚注分布 */
    bs = React.useMemo(() => ms.length === 0 ? $n.map(() => []) : $n.map((t: any) => {
      let n: any[] = [],
        r = new Set();
      return t.forEach((t: any) => {
        let i = e.model.nodes[t.nodeIndex];
        i && bm(i, `footnote`, t.tableRowRange, t.paragraphLineRange).forEach((e: any) => {
          r.has(e) || (r.add(e), n.push(e));
        });
      }), n.map(e => vs.get(e)).filter(e => !!e);
    }), [e.model.nodes, ms.length, vs, $n]),
  /* 原 xs（jsx 35348）：逐页尾注分布 */
    xs = React.useMemo(() => {
      if (hs.length === 0) return hs;
      let t: any[] = [],
        n = new Set();
      e.model.nodes.forEach((e: any) => {
        bm(e, `endnote`).forEach((e: any) => {
          n.has(e) || (n.add(e), t.push(e));
        });
      });
      let r = t.map(e => ys.get(e)).filter(e => !!e);
      return r.length > 0 ? r : hs;
    }, [e.model.nodes, hs, ys]),
  /* 原 Ss（jsx 35360）：已分布脚注 id 集 */
    Ss = React.useMemo(() => {
      let e = new Set();
      return bs.forEach((t: any) => {
        t.forEach((t: any) => {
          e.add(t.id);
        });
      }), e;
    }, [bs]),
  /* 原 Cs（jsx 35368）：未分布脚注 */
    Cs = React.useMemo(() => ms.filter((e: any) => !Ss.has(e.id)), [ms, Ss]),
  /* 原 ws（jsx 35369）：脚注段落渲染器 */
    ws = React.useCallback((e: any, t: any, n: any, r: any, i: any) => {
      let a = e.nodes?.filter((e: any) => e.type === `paragraph`);
      return !a || a.length === 0 ? e.text : a.map((a: any, o: any) => <span key={`${n}-paragraph-${o}`} style={{
        display: `block`,
        ...(o > 0 ? {
          marginTop: 4
        } : void 0)
      }}>{o === 0 ? <sup style={{
          marginRight: 4,
          verticalAlign: `super`,
          fontSize: `0.75em`,
          ...(t === `endnote` ? {
            opacity: 0.75
          } : void 0)
        }}>{Cv({
            kind: t,
            id: e.id
          }, gs, _s) ?? e.id}{t === `endnote` ? `.` : null}</sup> : null}{Tv(a, `${n}-runs`, j, void 0, Pi, void 0, {
          footnote: gs,
          endnote: _s
        }, r, Ai, i)}</span>);
    }, [j, _s, gs, Tv, Pi, Ai]),
  /* 原 Ts（jsx 35391）：节区草稿编辑句柄 */
    Ts = React.useMemo(() => ({
      registerElement: ao,
      readDraftHtml: oo,
      writeDraftHtml: so,
      clearDraftHtml: co,
      commitText: lo
    }), [co, lo, oo, ao, so]),
  /* 原 Es（jsx 35398）：页眉页脚编辑入口 */
    Es = React.useCallback((t: any, n: any, r: any, i: any) => {
      k || !n || (i?.draftKey ? pe.current = {
        draftKey: i.draftKey,
        point: i.point
      } : pe.current = void 0, Ri(), e.setActiveTextRange(void 0), xn({
        region: t,
        partName: n,
        pageIndex: r
      }));
    }, [Ri, e, k]);

  return {
    Fo, zo, Vo, Ho, Uo, Wo, Go, Ko, qo, Jo, Yo, Xo, Zo, Qo, $o, es, ts,
    ns, rs, is, as_, os, ss, cs, ls, us, ds, fs, ps,
    ms, hs, gs, _s, vs, ys, bs, xs, Ss, Cs, ws, Ts, Es
  };
}

export type DocxEditorViewRenderSurface = ReturnType<typeof useDocxEditorViewRenderCallbacks>;

/* ============================================================================
 * §4 符号表（语义名 ↔ 混淆名 ↔ jsx 行）见文件尾注释。
 * ==========================================================================*/
