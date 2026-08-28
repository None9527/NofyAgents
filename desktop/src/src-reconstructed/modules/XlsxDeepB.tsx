/* eslint-disable */
/**
 * ============================================================================
 * XlsxDeepB.tsx — react-xlsx 深部下半：oy 网格主组件（B5-12b · 逐字重建）
 * ============================================================================
 *
 * 源 chunk（只读）：
 *   desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
 *   （199,508 行；本文件覆盖 **js 193217–199291**，6,075 行，单一符号 oy）
 * jsx 孪生（交叉参照）：
 *   desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx
 *   （49,724 行；oy = jsx 44862–49526）
 *
 * 登记：XlsxPreview.report.md §1 子段表「Spreadsheet 主体 193217–199291」；
 *       COVERAGE-LEDGER §c #24（react-xlsx 深部 Ru→oy→canvas 渲染层）下半。
 * 并行批次：B5-12a（XlsxDeepA.tsx）= js 15672–17817（Ru 控制器）+
 *           183972–189511（canvas 渲染层）；与本批行号互斥。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表
 * ----------------------------------------------------------------------------
 *   oy → SpreadsheetGrid（网格主组件：虚拟滚动 + 画布绘制 + 图表/图片/表单控件
 *        覆盖层 + 选区/编辑/剪贴板/缩放/手势 + 冻结窗格 + 排序/筛选接线）
 *        （jsx 44862–49526 / js 193217–199291；chunk 内唯一顶层声明）
 *
 * 局部变量约定：oy 体内约 436 个嵌套函数、数百个混淆局部名（We/Ge/Ke…）
 *   **全部按原样保留**——逐字转录零漂移；语义索引见文件尾符号表与
 *   XlsxOfficeChart.report.md §2（关键局部名语义注记）。
 *   类型注解 `: any` 为机器补注（满足 strict 检查，不改变运行时行为）。
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖（oy 自由变量 148 个，按源段分组登记；行号 = js）
 * ----------------------------------------------------------------------------
 *   [H1] G = React 互操作（原 9111 `G = e(n(), 1)`）→ import * as G
 *   [H2] K = jsx-runtime（原 9113 `K = i()`）→ import * as K
 *   [H3] k = useVirtualizer —— @tanstack/react-virtual 3.13.23（vendored，
 *        esm-BY6T6pIH.js；VENDOR-MANIFEST-LIBS.md 已登记）
 *   [C]  常量段 189512–189563（尺寸/限额/色板/光标；值见各行注记）
 *   [P]  解析/几何助手 ac/oc/sc（14200–14206）、dc（14259）
 *   [E]  Dl = XlsxFileSizeLimitExceededError（14726–14735）
 *   [R]  gm = canvas 网格 memo 组件（189364；canonical 属 B5-12a XlsxDeepA.tsx）
 *   [L]  ay = G.memo(iy) 行渲染器（193182；iy = 行渲染层 192832–193216）
 *   [S]  选区/测量/布局/编辑/工具条助手群（189593–192831，逐条行号见下）
 * ============================================================================
 */

/* 全局：画布性能剖析开关（原 193243 window.__xlsxCanvasProfile 读取） */
declare global {
  interface Window {
    __xlsxCanvasProfile?: any;
  }
}

/** React 组件类型（本文件登记口径） */
type ReactComponent = any;

/* ============================================================================
 * [H1]/[H2] vendored 互操作面（原 js 9111/9113；按本文件消费面声明）
 * ==========================================================================*/

/** 原 G = React 互操作（`G = e(n(), 1)`，react-BQLj9xdT.js）；
 *  返回面按 vendored 互操作口径放宽（any），不改变运行时行为。 */
declare namespace G {
  function useMemo(factory: (...args: any[]) => any, deps?: any[]): any;
  function useRef(initial?: any): { current: any };
  function useState(initial?: any): [any, any];
  function useCallback(fn: (...args: any[]) => any, deps?: any[]): (...args: any[]) => any;
  function useEffect(effect: (...args: any[]) => any, deps?: any[]): void;
  function useLayoutEffect(effect: (...args: any[]) => any, deps?: any[]): void;
  function useTransition(): [any, (callback: (...args: any[]) => any) => void];
  function createElement(type: any, props?: any, ...children: any[]): any;
  function memo(component: any, compare?: (...args: any[]) => any): any;
  const Fragment: any;
}

/** 原 K = jsx-runtime（`K = i()`，jsx-runtime-B5yMD3-t.js） */
declare namespace K {
  function jsx(type: any, props: any, key?: any): any;
  function jsxs(type: any, props: any, key?: any): any;
  const Fragment: any;
}

/* ============================================================================
 * [H3] @tanstack/react-virtual useVirtualizer（vendored esm-BY6T6pIH.js）
 * ==========================================================================*/

/** 原 k：useVirtualizer（行/列虚拟滚动；参数 = virtualizer options） */
declare function k(options: {
  count: number;
  enabled?: boolean;
  estimateSize: (index: number) => number;
  getScrollElement: () => HTMLElement | null;
  getItemKey: (index: number) => number;
  horizontal?: boolean;
  overscan?: number;
}): any;

/* ============================================================================
 * [C] 常量段（原 js 189512–189563；逐值登记，不转录段本体）
 * ==========================================================================*/

declare const xm: number; // = 24        默认行高 px
declare const Sm: number; // = 80        默认列宽 px
declare const Cm: number; // = 24        列头高度 px
declare const wm: number; // = 40        行头宽度 px
declare const Tm: string; // = `application/x-react-xlsx-range+json` 区域剪贴板 MIME
declare const Em: number; // = 200       行数上限档位（非 worker）
declare const Dm: number; // = 50        列数上限档位（非 worker）
declare const Om: number; // = 120       行数上限档位（worker）
declare const km: number; // = 24        列数上限档位（worker）
declare const Am: number; // = 600       行限额阈值（延迟加载判定）
declare const jm: number; // = 120       列限额阈值（延迟加载判定）
declare const Mm: number; // = 2e3       批量行取数上限
declare const Nm: number; // = 120       行渲染窗口上限
declare const Pm: number; // = 160       列渲染窗口上限
declare const Fm: number; // = 24        行头最小高度 px
declare const Im: number; // = 200       列头菜单触达的表尺寸阈值
declare const Lm: number; // = 24        编辑框行高基准 px
declare const Rm: number; // = 600       图表渲染上限（宽/高 px）
declare const zm: number; // = 480       图片渲染上限 px
declare const Bm: number; // = 4         选区手柄半径 px
declare const Vm: number; // = 16        滚动条占位 px
declare const Um: number; // = 8         冻结窗格分隔线宽 px
declare const Wm: number; // = 480       内容层最大尺寸档位 px
declare const Gm: number; // = 480       视口层最大尺寸档位 px
declare const Km: number; // = Gm - 96   滚动同步阈值 px
declare const qm: number; // = Gm * 1.5  画布过绘裕量 px
declare const Jm: number; // = Wm * 2    内容层扩展档位 px
declare const Ym: number; // = 48        手势缩放收尾延迟 ms
declare const Xm: number; // = 0.0025    缩放动画步长系数
declare const eh: string; // = `#ffffff` 画布底色
declare const th: string; // = `#64748b` 网格线色
declare const nh: string; // = `#ffffff` 表头底色
declare const ih: string; // = `0 4px`   冻结阴影偏移
declare const ah: string[]; // = [`nw`,`n`,`ne`,`e`,`se`,`s`,`sw`,`w`] 手柄方位序
declare const dh: never[]; // = []       虚拟项空回退
declare const fh: Record<string, string>; // 方位 → resize 光标映射（189563–189572）

/* ============================================================================
 * [P] 解析/几何助手（原 js 14200–14259，解析/几何子段）
 * ==========================================================================*/

/** 原 ac（14200）：列宽字符数 → px（characterWidthPx 折算） */
declare function ac(e?: any, t?: any): any;
/** 原 oc（14203）：行高 twips → px */
declare function oc(e?: any): any;
/** 原 sc（14206）：尺寸取整（showGridLines 时 +1 网格线补偿） */
declare function sc(e?: any, t?: any): any;
/** 原 dc（14259）：区域剪贴板载荷解析（Tm MIME，16 进制网格） */
declare function dc(e?: any, t?: any, n?: any, r?: any, i?: any): any;

/* ============================================================================
 * [E] 限额错误（原 js 14726–14735，模型/错误子段）
 * ==========================================================================*/

/** 原 Dl：XlsxFileSizeLimitExceededError（name 串逐字在案） */
declare const Dl: {
  new (fileSizeBytes: number, maxFileSizeBytes: number): Error & {
    fileSizeBytes: number;
    maxFileSizeBytes: number;
  };
};

/* ============================================================================
 * [R] canvas 渲染层（原 js 189364；canonical = B5-12a XlsxDeepA.tsx）
 * ==========================================================================*/

/** 原 gm：画布网格 memo 组件（189364–189511；B5-12a 范围，整合期改 import） */
declare const gm: ReactComponent;

/* ============================================================================
 * [L] 行渲染层（原 js 192832–193216）
 * ==========================================================================*/

/** 原 ay = G.memo(iy)（193182）：行渲染组件（editingCell/getCellData/onCell* 事件族） */
declare const ay: ReactComponent;

/* ============================================================================
 * [S] 选区/测量/布局/编辑/工具条助手群（原 js 189593–192831）
 * ----------------------------------------------------------------------------
 * 测量与字体（189593–190057）
 * ==========================================================================*/

/** 原 xh（189593）：文本宽度测量（font+text 缓存） */
declare function xh(e?: any, t?: any): any;
/** 原 Sh（189599）：文本度量（行高/基线，缓存） */
declare function Sh(e?: any, t?: any): any;
/** 原 Th（189633）：富文本段宽度 */
declare function Th(e?: any, t?: any): any;
/** 原 wh（189625）：字体串构造 */
declare function wh(e?: any, t?: any): any;
/** 原 Ch（189622）：字体族归一 */
declare function Ch(e?: any): any;
/** 原 Oh（189686）：数值格式判定 */
declare function Oh(e?: any): any;
/** 原 Ah（189702）：对齐解析 */
declare function Ah(e?: any, t?: any): any;
/** 原 jh（189714）：垂直对齐解析 */
declare function jh(e?: any): any;
/** 原 Nh（189728）：边框优先级选择（按 Mh 权重取大） */
declare function Nh(e?: any, t?: any): any;
/** 原 kh（189691）：缩进量计算 */
declare function kh(e?: any, t?: any): any;
/** 原 Lh（189782）：单元格文本折行分段 */
declare function Lh(e?: any, t?: any): any;
/** 原 Rh（189793）：富文本折行分段 */
declare function Rh(e?: any, t?: any): any;
/** 原 zh（189814）：文本块布局（行盒） */
declare function zh(e?: any, t?: any, n?: any, r?: any): any;
/** 原 Vh（189828）：文本绘制指令 */
declare function Vh(e?: any, t?: any, n?: any): any;
/** 原 Gh（189950）：单元格装饰（边框/填充）绘制 */
declare function Gh(e?: any, t?: any, n?: any): any;
/** 原 Hh（189874）：条件格式判定 */
declare function Hh(e?: any): any;
/** 原 Fh（189743）：超链接/校验/注记标记位 */
declare function Fh(e?: any, t?: any, n?: any, r?: any): any;
/** 原 Ih（189767）：单元格注记（批注角标） */
declare function Ih(e?: any, t?: any, n?: any): any;

/* --- 几何/命中（190010–190075） --- */

/** 原 Kh（190010）：点-矩形命中 */
declare function Kh(e?: any, t?: any, n?: any, r?: any, i?: any, a?: any): any;
/** 原 qh（190015）：选区矩形求交 */
declare function qh(e?: any, t?: any, n?: any, r?: any, i?: any): any;
/** 原 Zh（190072）：矩形并集 */
declare function Zh(e?: any, t?: any, n?: any): any;
/** 原 Qh（190075）：矩形裁剪 */
declare function Qh(e?: any, t?: any): any;
/** 原 Xh（190061）：空矩形判定 */
declare function Xh(e?: any): any;
/** 原 Yh（190058）：clamp */
declare function Yh(e?: any, t?: any, n?: any): any;

/* --- 选区模型（190110–190232） --- */

/** 原 sg（190110）：单元格 → 区域 */
declare function sg(e?: any, t?: any): any;
/** 原 cg（190113）：选区归一（anchor/focus → start/end） */
declare function cg(e?: any): any;
/** 原 lg（190119）：选区包含判定 */
declare function lg(e?: any): any;
/** 原 ug（190126）：选区交判定 */
declare function ug(e?: any, t?: any): any;
/** 原 dg（190129）：选区并 */
declare function dg(e?: any, t?: any): any;
/** 原 fg（190134）：选区平移 */
declare function fg(e?: any, t?: any): any;
/** 原 pg（190150）：选区扩展（Shift 导航） */
declare function pg(e?: any, t?: any): any;
/** 原 mg（190161）：全选区域 */
declare function mg(e?: any): any;
/** 原 hg（190164）：最近可交互元素（a[href]/button/input/… closest 选择子） */
declare function hg(e?: any): any;
/** 原 gg（190171）：区域 → 剪贴板文本 */
declare function gg(e?: any, t?: any): any;
/** 原 _g（190175）：区域尺寸 */
declare function _g(e?: any): any;
/** 原 yg（190184）：区域枚举单元格 */
declare function yg(e?: any, t?: any, n?: any): any;
/** 原 bg（190209）：区域边界 */
declare function bg(e?: any, t?: any): any;
/** 原 xg（190212）：单格区域判定 */
declare function xg(e?: any): any;
/** 原 Sg（190217）：行选区构造 */
declare function Sg(e?: any, t?: any, n?: any): any;
/** 原 Cg（190220）：列选区构造 */
declare function Cg(e?: any, t?: any, n?: any): any;
/** 原 wg（190226）：选区序列化（Tm 载荷） */
declare function wg(e?: any, t?: any): any;

/* --- 可见索引/容量（190239–190360） --- */

/** 原 Tg（190239）：可见索引映射 */
declare function Tg(e?: any, t?: any): any;
/** 原 Eg（190242）：可见索引反查 */
declare function Eg(e?: any, t?: any, n?: any): any;
/** 原 Dg（190245）：可见行/列索引表（隐藏行/列剔除 + 容量上限） */
declare function Dg(e?: any, t?: any, n?: any, r?: any): any;
/** 原 Og（190259）：行/列容量估算（限额 + worker 档位） */
declare function Og(e?: any, t?: any, n?: any, r?: any, i?: any): any;
/** 原 jg（190273）：区域 → 像素矩形（行/列累计） */
declare function jg(e?: any, t?: any, n?: any, r?: any, i?: any, a?: any): any;
/** 原 Mg（190301）：像素 → 行列索引（二分） */
declare function Mg(e?: any, t?: any, n?: any, r?: any, i?: any, a?: any): any;
/** 原 Ng（190304）：索引夹取 */
declare function Ng(e?: any): any;
/** 原 Pg（190314）：滚动目标计算 */
declare function Pg(e?: any): any;
/** 原 Fg（190324）：导航方向向量 */
declare function Fg(e?: any): any;
/** 原 Ig（190334）：导航节流（240ms 缺省） */
declare function Ig(e?: any, t?: any, n?: any): any;
/** 原 Lg（190343）：编辑框几何（单元格 → 输入框矩形） */
declare function Lg(e?: any, t?: any, n?: any, r?: any, i?: any, a?: any, o?: any, s?: any, c?: any): any;
/** 原 Rg（190360）：编辑提交解析 */
declare function Rg(e?: any, t?: any, n?: any): any;

/* --- 绘制管线/脏区（191051–191468） --- */

/** 原 __（191051）：脏区构造 */
declare function __(e?: any): any;
/** 原 v_（191054）：脏区并 */
declare function v_(e?: any, t?: any, n?: any, r?: any, i?: any, a?: any): any;
/** 原 y_（191068）：脏区裁剪 */
declare function y_(e?: any, t?: any, n?: any): any;
/** 原 b_（191092）：脏区枚举 */
declare function b_(e?: any, t?: any, n?: any, r?: any, i?: any, a?: any): any;
/** 原 x_（191113）：粘滞定位（冻结窗格） */
declare function x_(e?: any, t?: any, n?: any, r?: any): any;
/** 原 S_（191139）：窗格分区判定 */
declare function S_(e?: any, t?: any): any;
/** 原 C_（191150）：窗格偏移（缩放补偿，缺省 ×1） */
declare function C_(e?: any, t?: any, n?: any, r?: any): any;
/** 原 T_（191178）：窗格矩形 */
declare function T_(e?: any): any;
/** 原 O_（191195）：窗格裁剪区 */
declare function O_(e?: any, t?: any, n?: any): any;
/** 原 k_（191205）：窗格可见判定 */
declare function k_(e?: any): any;
/** 原 M_（191233）：窗格尺寸 */
declare function M_(e?: any): any;
/** 原 L_（191289）：表头几何 */
declare function L_(e?: any, t?: any, n?: any): any;
/** 原 W_（191338）：表头命中 */
declare function W_(e?: any, t?: any): any;
/** 原 G_（191346）：单元格样式解析（主题/调色板/网格线选项） */
declare function G_(e?: any, t?: any, n?: any, r?: any): any;
/** 原 X_（191441）：文本测量宽度（样式 + 可用宽） */
declare function X_(e?: any, t?: any, n?: any): any;
/** 原 Y_（191434）：行内文本截断 */
declare function Y_(e?: any, t?: any): any;
/** 原 Z_（191459）：数值显示格式 */
declare function Z_(e?: any): any;
/** 原 Q_（191465）：百分比显示格式 */
declare function Q_(e?: any): any;
/** 原 q_（191416）：日期序列号判定 */
declare function q_(e?: any): any;
/** 原 $_（191468）：显示值格式化（格式代码 + 区域） */
declare function $_(e: any, t: any, n: any, r: any): any;

/* --- 编辑/导航/事件（191482–191896） --- */

/** 原 ev（191482）：编辑导航目标（方向键/Tab/Enter） */
declare function ev(e?: any, t?: any, n?: any): any;
/** 原 tv（191490）：编辑导航夹取 */
declare function tv(e?: any, t?: any, n?: any): any;
/** 原 sv（191559）：选区键盘操作（方向/翻页/Home/End） */
declare function sv(e?: any, t?: any, n?: any, r?: any, i?: any): any;
/** 原 cv（191618）：剪贴板写入（copy/cut） */
declare function cv(e?: any, t?: any, n?: any): any;
/** 原 bv（191845）：剪贴板读取分派 */
declare function bv(e?: any, t?: any, n?: any): any;
/** 原 yv（191818）：粘贴区域计算 */
declare function yv(e?: any, t?: any, n?: any, r?: any): any;
/** 原 _v（191791）：粘贴文本解析 */
declare function _v(e?: any, t?: any, n?: any): any;
/** 原 gv（191786）：粘贴目标夹取 */
declare function gv(e?: any, t?: any, n?: any): any;
/** 原 hv（191764）：粘贴源区域 */
declare function hv(e?: any, t?: any, n?: any, r?: any): any;
/** 原 dv（191739）：合并区域解析（`A1:B2` → 行列） */
declare function dv(e?: any): any;
/** 原 uv（191736）：索引归一（负值/空 → null） */
declare function uv(e?: any): any;
/** 原 Sv（191896）：拖拽填充目标 */
declare function Sv(e?: any, t?: any): any;

/* --- 工具条/排序/控件（191850–192831） --- */

/** 原 xv（191850）：排序菜单（direction + sortAscending/sortDescending 回调） */
declare const xv: ReactComponent;
/** 原 Av（192195）：图表命中测试 */
declare function Av(e?: any, t?: any, n?: any): any;
/** 原 Dv（192153）：图表元素命中 */
declare function Dv(e?: any, t?: any, n?: any): any;
/** 原 Ev（192134）：图表包围盒 */
declare function Ev(e?: any, t?: any, n?: any): any;
/** 原 Ov（192170）：图表选区矩形 */
declare function Ov(e?: any, t?: any): any;
/** 原 Nv（192264）：图片命中测试 */
declare function Nv(e?: any, t?: any, n?: any): any;
/** 原 Fv（192276）：图片选区矩形 */
declare function Fv(e?: any, t?: any): any;
/** 原 Iv（192336）：选区配色（palette + selectionColor/Fill/Header） */
declare const Iv: ReactComponent;
/** 原 Lv（192344）：选区边框样式 */
declare function Lv(e?: any, t?: any): any;
/** 原 Rv（192347）：矩形相交判定 */
declare function Rv(e?: any, t?: any, n?: any, r?: any, i?: any): any;
/** 原 zv（192353）：表单控件布局 */
declare function zv(e?: any, t?: any, n?: any, r?: any, i?: any, a?: any, o?: any, s?: any): any;
/** 原 Wv（192539）：控件值归一 */
declare function Wv(e?: any): any;
/** 原 Gv（192542）：控件启用判定 */
declare function Gv(e?: any): any;
/** 原 Kv（192545）：控件尺寸 */
declare function Kv(e?: any): any;
/** 原 qv（192615）：下拉/列表控件项（缺省 1 列、非多选） */
declare function qv(e?: any, t?: any, n?: any, r?: any): any;
/** 原 Jv（192658）：复选/单选控件值（缺省 ×1） */
declare function Jv(e?: any, t?: any, n?: any): any;
/** 原 Yv（192680）：旋钮控件角度 */
declare function Yv(e?: any): any;
/** 原 Xv（192694）：控件命中测试 */
declare function Xv(e?: any, t?: any, n?: any, r?: any, i?: any): any;
/** 原 Zv（192736）：控件焦点环 */
declare function Zv(e?: any, t?: any, n?: any, r?: any, i?: any): any;
/** 原 Qv（192772）：控件键盘交互 */
declare function Qv(e?: any, t?: any, n?: any, r?: any, i?: any): any;
/** 原 $v（192801）：表头菜单定位 */
declare function $v(e: any, t: any, n: any): any;
/** 原 ny（192820）：行高拖拽目标 */
declare function ny(e?: any, t?: any): any;
/** 原 ry（192823）：列宽拖拽目标 */
declare function ry(e?: any, t?: any): any;

/* ============================================================================
 * oy —— SpreadsheetGrid 网格主组件（原 js 193217–199291 逐字；局部名原样保留）
 * ==========================================================================*/
function oy({
  allowResizeInReadOnly: e = !1,
  controller: t,
  emptyState: n,
  enableCanvasSelectionAnimation: r = !0,
  errorState: i,
  fileTooLargeState: a,
  getCellStyle: o,
  loadingComponent: s,
  loadingState: c,
  onFormControlAction: l,
  onFormControlChange: u,
  renderChartLoading: d,
  renderFormControl: f,
  palette: p,
  renderImage: m,
  renderImageSelection: h,
  renderTableHeaderMenu: g,
  renderScroller: _,
  enableGestureZoom: v = !0,
  experimentalCanvas: y = !0,
  selectionColor: b,
  selectionFillColor: x,
  selectionHeaderColor: S,
  showImages: C = !0,
}: any) {
  let w = typeof window < `u` && window.__xlsxCanvasProfile ? performance.now() : 0,
    {
      activeCell: T,
      activeSheet: E,
      activeSheetIndex: D,
      activeTab: O,
      activeTabIndex: A,
      canLoadDeferred: j,
      charts: M,
      clearSelectedChart: N,
      clearSelectedImage: P,
      clearSelectedCells: F,
      continueDeferredLoad: I,
      deferredLoadFileSize: ee,
      displayFileName: L,
      error: te,
      fillSelection: ne,
      formControls: re,
      getActiveWorksheet: R,
      getChartById: ie,
      getRowsBatchAsync: z,
      getClipboardData: ae,
      getCellDisplayValue: oe,
      getFormControlItems: B,
      images: se,
      shapes: ce,
      isLoadDeferred: le,
      isLoading: ue,
      isChartsLoading: de,
      isWorkerBacked: fe,
      maxZoomScale: pe,
      minZoomScale: me,
      copySelectionToClipboard: he,
      pasteFromClipboard: V,
      pasteStructuredClipboardData: ge,
      pasteText: _e,
      readOnly: H,
      redo: ve,
      revision: ye,
      selectedChart: be,
      selectedChartElement: xe,
      selectedChartId: Se,
      selectedImage: Ce,
      selectedImageId: we,
      selectCell: Te,
      selectChart: Ee,
      selectChartElement: De,
      selectImage: Oe,
      selectRange: ke,
      selection: Ae,
      setActiveSheetIndex: je,
      setChartRect: Me,
      setImageRect: Ne,
      setCellValue: Pe,
      setZoomScale: Fe,
      sheets: Ie,
      tabs: Le,
      sortState: Re,
      sortTable: U,
      tables: ze,
      undo: Be,
      updateFormControl: Ve,
      workbook: He,
      zoomScale: Ue,
    } = t,
    We = G.useMemo(
      () =>
        new Map(
          re.flatMap((e: any) =>
            e.controlIndex !== void 0 && (e.kind === `dropdown` || e.kind === `listbox`)
              ? [[e.id, B(e.controlIndex, e.sheetIndex)]]
              : [],
          ),
        ),
      [re, B],
    ),
    Ge = !H || e,
    Ke = G.useRef(null),
    qe = G.useRef(null),
    Je = G.useRef(null),
    Ye = G.useRef(!1),
    Xe = G.useRef(null),
    Ze = G.useRef(null),
    Qe = G.useRef(null),
    $e = G.useRef(null),
    et = G.useRef(null),
    tt = G.useRef(null),
    nt = G.useRef({ corner: null, left: null, scroll: null, top: null }),
    W = G.useRef({ left: null, top: null }),
    rt = G.useRef(null),
    it = G.useRef(null),
    at = G.useRef(null),
    ot = G.useRef(null),
    st = G.useRef(null),
    ct = G.useRef(null),
    lt = G.useRef(null),
    ut = G.useRef(null),
    dt = G.useRef(null),
    ft = G.useRef(new Map()),
    pt = G.useRef(null),
    mt = G.useRef(null),
    ht = G.useRef(null),
    gt = G.useRef(null),
    _t = G.useRef(null),
    vt = G.useRef(new Map()),
    yt = G.useRef(new Map()),
    bt = G.useRef(new Map()),
    xt = G.useRef(new Map()),
    St = G.useRef(null),
    Ct = G.useRef(null),
    wt = G.useRef(T),
    Tt = G.useRef(Se),
    Et = G.useRef(we),
    Dt = G.useRef(null),
    Ot = G.useRef(null),
    kt = G.useRef(null),
    At = G.useRef(null),
    jt = G.useRef(() => {}),
    Mt = G.useRef(null),
    Nt = G.useRef(H),
    Pt = G.useRef(Ue),
    Ft = G.useRef(Ue),
    It = G.useRef(null),
    Lt = G.useRef(null),
    Rt = G.useRef(null),
    zt = G.useRef(null),
    Bt = G.useRef(null),
    Vt = G.useRef(null),
    Ht = G.useRef(null),
    Ut = G.useRef(null),
    Wt = G.useRef(null),
    Gt = G.useRef(null),
    Kt = G.useRef(new WeakMap()),
    qt = G.useRef(null),
    Jt = G.useRef(void 0),
    Yt = G.useRef(void 0),
    Xt = G.useRef(void 0),
    Zt = G.useRef(void 0),
    Qt = G.useRef(new Map()),
    $t = G.useRef(new Map()),
    en = G.useRef(null),
    tn = G.useRef(null),
    nn = G.useRef(null),
    rn = G.useRef(null),
    an = G.useRef(null),
    on = G.useRef(null),
    sn = G.useRef(null),
    cn = G.useRef(null),
    ln = G.useRef(null),
    un = G.useRef(null),
    dn = G.useRef(null),
    fn = G.useRef(null),
    pn = G.useRef(null),
    mn = G.useRef(null),
    [hn, gn] = G.useState(null),
    [_n, vn] = G.useState(``),
    [yn, bn] = G.useState(null),
    [xn, Sn] = G.useState(null),
    [Cn, wn] = G.useState(null),
    [Tn, En] = G.useState(null),
    [Dn, On] = G.useState(0),
    kn = G.useRef({ height: 0, left: 0, top: 0, width: 0 }),
    An = G.useRef({
      displayHeaderHeight: Cm,
      displayRowHeaderWidth: wm,
      frozenPaneBottom: Cm,
      frozenPaneRight: wm,
    }),
    jn = G.useRef({ height: 0, left: 0, top: 0, width: 0 }),
    Mn = G.useRef(null),
    Nn = G.useRef(null),
    Pn = G.useRef(null),
    Fn = G.useRef(null),
    In = G.useRef(null),
    Ln = G.useRef(null),
    Rn = G.useRef(null),
    zn = G.useRef(null),
    [q, Bn] = G.useState({ height: 0, left: 0, top: 0, width: 0 }),
    Vn = G.useRef({ height: 0, left: 0, top: 0, width: 0 }),
    [Hn, Un] = G.useState(null),
    Wn = G.useRef(null),
    [Gn, Kn] = G.useState(null),
    qn = G.useRef(null),
    Jn = G.useRef(null),
    Yn = G.useRef(null),
    Xn = G.useRef(null),
    Zn = G.useRef(null),
    Qn = G.useRef(null),
    [$n, er] = G.useState(null),
    tr = G.useRef(`idle`),
    nr = G.useCallback((e: any) => {
      tr.current = e;
    }, []),
    rr = G.useMemo(() => R(), [D, R, ye]),
    ir = G.useMemo(() => {
      let e = [],
        t = Array.isArray(rr?.mergedRegions) ? rr.mergedRegions : [];
      for (let n of t) {
        let t = dv(n),
          r = uv(t?.startRow),
          i = uv(t?.startCol),
          a = uv(t?.endRow),
          o = uv(t?.endCol);
        r === null ||
          i === null ||
          a === null ||
          o === null ||
          e.push({ end: { col: o, row: a }, start: { col: i, row: r } });
      }
      return e;
    }, [rr]),
    ar = G.useMemo(() => {
      let e = new Map();
      for (let t of ir)
        for (let n = t.start.row; n <= t.end.row; n += 1)
          for (let r = t.start.col; r <= t.end.col; r += 1)
            (n === t.start.row && r === t.start.col) ||
              e.set(`${n}:${r}`, { row: t.start.row, col: t.start.col });
      return e;
    }, [ir]),
    or = G.useCallback((e: any) => ar.get(`${e.row}:${e.col}`) ?? e, [ar]),
    sr = G.useMemo(() => (Ae ? cg(Ae) : null), [Ae]),
    J = G.useMemo(() => Math.max(0.1, Ue / 100), [Ue]),
    cr = G.useRef(J),
    lr = ze,
    [ur, dr] = G.useState(() => Og(E?.maxUsedRow ?? -1, Em, Om, !!fe, Am)),
    [fr, pr] = G.useState(() => Og(E?.maxUsedCol ?? -1, Dm, km, !!fe, jm)),
    mr = G.useMemo(() => new Set(E?.hiddenRows ?? []), [E?.hiddenRows]),
    hr = G.useMemo(() => new Set(E?.hiddenCols ?? []), [E?.hiddenCols]),
    gr = xm * J,
    _r = Sm * J,
    Y = Cm * J,
    X = wm * J,
    vr = Vm * J,
    yr = G.useCallback(
      (e: any) => {
        let t = e ?? kn.current,
          n = jn.current,
          {
            displayHeaderHeight: r,
            displayRowHeaderWidth: i,
            frozenPaneBottom: a,
            frozenPaneRight: o,
          } = An.current,
          s = It.current,
          c = s !== null && Ue === s.baseZoomScale,
          l = c ? Math.max(0.1, s.targetZoomScale / s.baseZoomScale) : 1,
          u = n.left - t.left,
          d = n.top - t.top,
          f = (e: any, t: any, n: any, r: any) => {
            if (!c || l === 1) return r;
            let i = Math.max(t, n * l),
              a = Yh((e + r) * l - r, 0, Math.max(0, i - t));
            return (e * l - a) / (1 - l);
          },
          p = Ke.current,
          m = f(t.left, t.width, p?.scrollWidth ?? t.width, s?.anchor.x ?? 0),
          h = f(t.top, t.height, p?.scrollHeight ?? t.height, s?.anchor.y ?? 0),
          g = (e: any, t: any, n: any, r: any = null) => {
            if (!e) return;
            let i = Kt.current.get(e);
            ((i?.transform !== t || e.style.transform !== t) && (e.style.transform = t),
              (i?.willChange !== n || e.style.willChange !== n) && (e.style.willChange = n),
              r !== null &&
                (i?.transformOrigin !== r || e.style.transformOrigin !== r) &&
                (e.style.transformOrigin = r),
              Kt.current.set(e, { transform: t, transformOrigin: r, willChange: n }));
          },
          _ = (e: any, t: any, n: any) => e * l + (t - n) * (1 - l),
          v = (e: any, t: any, n: any, r: any, i: any, a: any, o: any) => {
            let s = _(t, a, r),
              c = _(n, o, i),
              u = s !== 0 || c !== 0 || l !== 1;
            g(e, u ? `translate3d(${s}px, ${c}px, 0) scale(${l})` : ``, u ? `transform` : ``);
          },
          b = (e: any, t: any, n: any, r: any, i: any, a: any, o: any) => {
            let s = _(t, a, r),
              c = _(n, o, i);
            g(
              e,
              l === 1
                ? `translate3d(${t}px, ${n}px, 0)`
                : `translate3d(${s}px, ${c}px, 0) scale(${l})`,
              `transform`,
              `0 0`,
            );
          },
          x = Math.max(0, t.width - o),
          S = Math.max(0, t.height - a),
          C = o - Math.min(Gm, x),
          w = a - Math.min(Gm, S),
          T = (t.left + m) * (1 - l),
          E = (t.top + h) * (1 - l),
          D = y && c && l !== 1;
        (g(
          mt.current,
          D ? `translate3d(${T}px, ${E}px, 0) scale(${l})` : ``,
          D ? `transform` : ``,
          `0 0`,
        ),
          v(Qe.current, u, d, C, w, m, h),
          v($e.current, u, 0, C, r, m, 0),
          v(et.current, 0, d, i, w, 0, h),
          v(tt.current, 0, 0, i, r, 0, 0),
          v(it.current, u, 0, C, 0, m, 0),
          v(rt.current, 0, 0, i, 0, 0, 0),
          v(ot.current, 0, d, 0, w, 0, h),
          v(at.current, 0, 0, 0, r, 0, 0),
          v(st.current, 0, 0, 0, 0, 0, 0),
          b(ct.current, -t.left - o, -t.top - a, o, a, m, h),
          b(lt.current, -t.left - o, -r, o, r, m, 0),
          b(ut.current, -i, -t.top - a, i, a, 0, h),
          b(dt.current, -i, -r, i, r, 0, 0));
      },
      [y, Ue],
    ),
    br = G.useCallback(
      (e: any) => {
        let t = It.current,
          n = typeof e == `function` ? e(t) : e;
        ((It.current = n),
          !y || t === null || n === null
            ? (zt.current !== null &&
                (window.cancelAnimationFrame(zt.current), (zt.current = null)),
              yr())
            : zt.current === null &&
              (zt.current = window.requestAnimationFrame(() => {
                ((zt.current = null), yr());
              })),
          (!y || (t === null) != (n === null)) &&
            ((Lt.current = n),
            Rt.current === null &&
              (Rt.current = window.requestAnimationFrame(() => {
                Rt.current = null;
                let e = Lt.current;
                ((Lt.current = null), En(e));
              }))));
      },
      [yr, y],
    ),
    xr = G.useCallback(() => {
      Vt.current !== null && (window.clearTimeout(Vt.current), (Vt.current = null));
    }, []),
    Sr = G.useCallback(() => {
      (xr(),
        (Ht.current = null),
        (Bt.current = null),
        (Wt.current = null),
        (Gt.current = null),
        (Ut.current = null),
        (Ft.current = Pt.current),
        br(null));
    }, [xr, br]),
    Cr = G.useCallback(
      (e: any, t: any) => {
        let n = Yh(e, me, pe);
        ((Ft.current = n),
          (Ht.current = null),
          br((e: any) => ({
            anchor: t,
            baseZoomScale: e?.baseZoomScale ?? Pt.current,
            targetZoomScale: n,
          })));
      },
      [pe, me, br],
    ),
    wr = G.useCallback(() => {
      xr();
      let e = It.current;
      if (!e) return;
      let t = Yh(Math.round(e.targetZoomScale), me, pe);
      if (t === Pt.current) {
        Sr();
        return;
      }
      Ht.current !== t && ((Ht.current = t), (Bt.current = e.anchor), (Ft.current = t), Fe(t));
    }, [Sr, xr, pe, me, Fe]),
    Tr = G.useCallback(() => {
      (xr(),
        (Vt.current = window.setTimeout(() => {
          ((Vt.current = null), wr());
        }, Ym)));
    }, [xr, wr]),
    Er = G.useCallback(
      (e: any, t: any) => {
        if (!e) return;
        let n = {
            height: e.clientHeight,
            left: e.scrollLeft,
            top: e.scrollTop,
            width: e.clientWidth,
          },
          r = Vn.current,
          i = r.left === n.left && r.top === n.top && r.width === n.width && r.height === n.height,
          a = kn.current,
          o = a.left === n.left && a.top === n.top && a.width === n.width && a.height === n.height;
        if (((kn.current = n), yr(n), t?.immediate)) {
          if (
            ((Pn.current = null),
            Fn.current !== null && (window.cancelAnimationFrame(Fn.current), (Fn.current = null)),
            i)
          )
            return;
          Bn((e: any) =>
            e.left === n.left && e.top === n.top && e.width === n.width && e.height === n.height
              ? e
              : n,
          );
          return;
        }
        if (!(o && i)) {
          if (!(
            !i &&
            (r.width !== n.width ||
              r.height !== n.height ||
              Math.abs(n.left - r.left) >= Km ||
              Math.abs(n.top - r.top) >= Km)
          )) {
            Pn.current = null;
            return;
          }
          ((Pn.current = n),
            Fn.current === null &&
              (Fn.current = window.requestAnimationFrame(() => {
                Fn.current = null;
                let e = Pn.current;
                ((Pn.current = null),
                  e &&
                    Bn((t: any) =>
                      t.left === e.left &&
                      t.top === e.top &&
                      t.width === e.width &&
                      t.height === e.height
                        ? t
                        : e,
                    ));
              })));
        }
      },
      [yr],
    ),
    Dr = G.useCallback((e: any) => {
      ((document.body.style.cursor = e),
        (document.documentElement.style.cursor = e),
        Ke.current && (Ke.current.style.cursor = e));
    }, []),
    Or = G.useCallback(() => {
      ((document.body.style.cursor = ``),
        (document.documentElement.style.cursor = ``),
        Ke.current && (Ke.current.style.cursor = ``));
    }, []),
    kr = G.useCallback((e: any) => {
      let t = nt.current[e];
      return (
        !t &&
          typeof document < `u` &&
          ((t = document.createElement(`canvas`)), (nt.current[e] = t)),
        t
      );
    }, []),
    Ar = G.useCallback((e: any) => {
      let t = W.current[e];
      return (
        !t && typeof document < `u` && ((t = document.createElement(`canvas`)), (W.current[e] = t)),
        t
      );
    }, []),
    jr = G.useMemo(
      () => Dg(E?.visibleRows ?? [], ur, E?.maxUsedRow ?? -1, mr),
      [E?.maxUsedRow, E?.visibleRows, ur, mr],
    ),
    Z = G.useMemo(
      () => Dg(E?.visibleCols ?? [], fr, E?.maxUsedCol ?? -1, hr),
      [E?.maxUsedCol, E?.visibleCols, fr, hr],
    ),
    Mr = G.useMemo(() => {
      let e = E?.freezePanes?.row ?? 0;
      return e <= 0 ? [] : jr.filter((t: any) => t < e);
    }, [E?.freezePanes?.row, jr]),
    Nr = G.useMemo(() => {
      let e = E?.freezePanes?.col ?? 0;
      return e <= 0 ? [] : Z.filter((t: any) => t < e);
    }, [E?.freezePanes?.col, Z]),
    Pr = G.useMemo(() => {
      let e = Array(fr).fill(0),
        t = E?.showGridLines ?? !0,
        n = Math.max(sc(E?.defaultColWidthPx ?? Sm, t), Sm / 2);
      if (rr) {
        for (let n = 0; n < fr; n += 1) {
          if (rr.isColumnHidden(n)) continue;
          let r = rr.getColumnWidth(n);
          if (r != null) {
            e[n] = Math.max(sc(ac(r, E?.columnWidthCharacterWidthPx), t), Sm / 2);
            continue;
          }
          e[n] = Math.max(sc(E?.colWidthOverridesPx[n] ?? E?.defaultColWidthPx ?? Sm, t), Sm / 2);
        }
        return e;
      }
      let r = E?.visibleCols ?? [],
        i = E?.colWidths ?? [];
      for (let n = 0; n < r.length; n += 1) {
        let a = r[n];
        a === void 0 ||
          a >= fr ||
          (e[a] = Math.max(
            sc(E?.colWidthOverridesPx[a] ?? i[n] ?? E?.defaultColWidthPx ?? Sm, t),
            Sm / 2,
          ));
      }
      for (let r = Math.max(0, (E?.maxUsedCol ?? -1) + 1); r < fr; r += 1) {
        let i = E?.colWidthOverridesPx[r];
        e[r] = i === void 0 ? n : Math.max(sc(i, t), Sm / 2);
      }
      return e;
    }, [
      E?.colWidthOverridesPx,
      E?.colWidths,
      E?.defaultColWidthPx,
      E?.maxUsedCol,
      E?.showGridLines,
      E?.visibleCols,
      fr,
      rr,
      ye,
    ]),
    Fr = G.useMemo(() => {
      let e = Array(ur).fill(0),
        t = E?.showGridLines ?? !0,
        n = Math.max(sc(E?.defaultRowHeightPx ?? xm, t), xm / 1.5);
      if (rr) {
        for (let r = 0; r < ur; r += 1) {
          if (rr.isRowHidden(r)) continue;
          let i = rr.getRowHeight(r);
          if (i != null) {
            e[r] = Math.max(sc(oc(i), t), xm / 1.5);
            continue;
          }
          let a = Math.min(fr - 1, E?.maxUsedCol ?? -1),
            o = 0;
          if (a >= 0)
            for (let e = 0; e <= a; e += 1) {
              if (rr.isColumnHidden(e) || rr.isMergedSecondary(r, e)) continue;
              let t = rr.getFormattedValueAt(r, e);
              if (!t) continue;
              let n = G_(rr.getCellStyleAt(r, e) ?? null, p, E?.themePalette, {
                showGridLines: E?.showGridLines,
              });
              if (
                n.whiteSpace !== `pre-wrap` &&
                !t.includes(`
`) &&
                !t.includes(`\r`)
              )
                continue;
              let i = rr.getMergeSpan(r, e),
                a = Math.max(1, i?.colSpan ?? 1),
                s = 0;
              for (let t = e; t < Math.min(fr, e + a); t += 1)
                s += Pr[t] ?? E?.defaultColWidthPx ?? Sm;
              o = Math.max(o, X_(t, n, s));
            }
          if (o > 0) {
            e[r] = Math.max(sc(Math.ceil(o), t), n);
            continue;
          }
          e[r] = Math.max(
            sc(E?.rowHeightOverridesPx[r] ?? E?.defaultRowHeightPx ?? xm, t),
            xm / 1.5,
          );
        }
        return e;
      }
      let r = E?.visibleRows ?? [],
        i = E?.rowHeights ?? [];
      for (let n = 0; n < r.length; n += 1) {
        let a = r[n];
        a === void 0 ||
          a >= ur ||
          (e[a] = Math.max(
            sc(E?.rowHeightOverridesPx[a] ?? i[n] ?? E?.defaultRowHeightPx ?? xm, t),
            xm / 1.5,
          ));
      }
      for (let r = Math.max(0, (E?.maxUsedRow ?? -1) + 1); r < ur; r += 1) {
        let i = E?.rowHeightOverridesPx[r];
        e[r] = i === void 0 ? n : Math.max(sc(i, t), xm / 1.5);
      }
      return e;
    }, [
      E?.defaultRowHeightPx,
      E?.maxUsedRow,
      E?.maxUsedCol,
      E?.rowHeightOverridesPx,
      E?.rowHeights,
      E?.showGridLines,
      E?.themePalette,
      E?.visibleRows,
      Pr,
      ur,
      fr,
      p,
      rr,
      ye,
    ]),
    Ir = G.useMemo(() => Pr.map((e: any) => e * J), [Pr, J]),
    Lr = G.useMemo(() => Fr.map((e: any) => e * J), [Fr, J]),
    Rr = G.useMemo(() => Z.map((e: any) => Ir[e] ?? _r), [Ir, _r, Z]),
    zr = G.useMemo(() => jr.map((e: any) => Lr[e] ?? gr), [Lr, gr, jr]),
    Br = G.useMemo(() => new Map(jr.map((e: any, t: any) => [e, t])), [jr]),
    Vr = G.useMemo(() => new Map(Z.map((e: any, t: any) => [e, t])), [Z]),
    Hr = G.useRef(jr),
    Ur = G.useRef(Z),
    Wr = G.useRef(zr),
    Gr = G.useRef(Rr),
    Kr = G.useMemo(() => _g(zr), [zr]),
    qr = G.useMemo(() => _g(Rr), [Rr]),
    Jr = G.useMemo(() => _g(Lr), [Lr]),
    Yr = G.useMemo(() => _g(Ir), [Ir]),
    Xr = G.useMemo(() => Cg(Mr, Lr, Y), [Lr, Y, Mr]),
    Zr = G.useMemo(() => Cg(Nr, Ir, X), [Ir, X, Nr]),
    Qr = G.useMemo(
      () =>
        Mr.length > 0 ? Mr.reduce((e: any, t: any) => Math.max(e, (Xr.get(t) ?? Y) + (Lr[t] ?? gr)), Y) : Y,
      [Lr, gr, Y, Mr, Xr],
    ),
    $r = G.useMemo(
      () =>
        Nr.length > 0 ? Nr.reduce((e: any, t: any) => Math.max(e, (Zr.get(t) ?? X) + (Ir[t] ?? _r)), X) : X,
      [Ir, _r, X, Nr, Zr],
    );
  An.current = {
    displayHeaderHeight: Y,
    displayRowHeaderWidth: X,
    frozenPaneBottom: Qr,
    frozenPaneRight: $r,
  };
  let ei = G.useRef(Kr),
    ti = G.useRef(qr),
    ni = jr[0],
    ri = jr[jr.length - 1],
    ii = Z[0],
    Q = Z[Z.length - 1],
    ai = xn ?? sr,
    oi = G.useCallback(
      (e: any) => ({ height: e.height / J, left: e.left / J, top: e.top / J, width: e.width / J }),
      [J],
    ),
    si = G.useMemo(() => {
      let e = se.reduce(
          (e: any, t: any) => {
            let n = Ng(t);
            return { maxCol: Math.max(e.maxCol, n.maxCol), maxRow: Math.max(e.maxRow, n.maxRow) };
          },
          { maxCol: -1, maxRow: -1 },
        ),
        t = ce.reduce(
          (e: any, t: any) => {
            let n = Pg(t);
            return { maxCol: Math.max(e.maxCol, n.maxCol), maxRow: Math.max(e.maxRow, n.maxRow) };
          },
          { maxCol: -1, maxRow: -1 },
        ),
        n = M.reduce(
          (e: any, t: any) => {
            let n = Fg(t);
            return { maxCol: Math.max(e.maxCol, n.maxCol), maxRow: Math.max(e.maxRow, n.maxRow) };
          },
          { maxCol: -1, maxRow: -1 },
        );
      return {
        maxCol: Math.max(e.maxCol, t.maxCol, n.maxCol),
        maxRow: Math.max(e.maxRow, t.maxRow, n.maxRow),
      };
    }, [M, se, ce]),
    ci = jr.length > 0,
    li = Z.length > 0 && Nr.length === 0,
    ui = !y,
    di = G.useCallback(() => Ke.current, []),
    fi = G.useCallback((e: any) => zr[e] ?? gr, [gr, zr]),
    pi = G.useCallback((e: any) => jr[e] ?? e, [jr]),
    mi = G.useCallback((e: any) => Rr[e] ?? _r, [_r, Rr]),
    hi = G.useCallback((e: any) => Z[e] ?? e, [Z]),
    gi = k({
      count: jr.length,
      enabled: ui,
      estimateSize: fi,
      getScrollElement: di,
      getItemKey: pi,
      overscan: 10,
    }),
    _i = k({
      count: Z.length,
      enabled: ui,
      estimateSize: mi,
      getScrollElement: di,
      getItemKey: hi,
      horizontal: !0,
      overscan: 6,
    }),
    vi = ui ? gi.getVirtualItems() : dh,
    yi = ui ? _i.getVirtualItems() : dh,
    bi = G.useMemo(() => Mr.map((e: any) => Br.get(e)).filter((e: any) => e !== void 0), [Mr, Br]),
    xi = G.useMemo(() => Nr.map((e: any) => Vr.get(e)).filter((e: any) => e !== void 0), [Vr, Nr]),
    Si = G.useMemo(
      () =>
        ir.flatMap((e: any) => {
          let t = Br.get(e.start.row),
            n = Br.get(e.end.row),
            r = Vr.get(e.start.col),
            i = Vr.get(e.end.col);
          return t === void 0 || n === void 0 || r === void 0 || i === void 0
            ? []
            : [{ endColIndex: i, endRowIndex: n, startColIndex: r, startRowIndex: t }];
        }),
      [Vr, ir, Br],
    ),
    Ci = G.useMemo(
      () => Array.from(new Set([...vi.map((e: any) => e.index), ...bi])).sort((e: any, t: any) => e - t),
      [vi, bi],
    ),
    wi = G.useMemo(
      () =>
        Array.from(new Set([...(li ? yi.map((e: any) => e.index) : Z.map((e: any, t: any) => t)), ...xi])).sort(
          (e: any, t: any) => e - t,
        ),
      [yi, xi, li, Z],
    ),
    Ti = G.useMemo(() => yg(Ci, wi, Si), [wi, Ci, Si]),
    Ei = G.useMemo(() => new Map(vi.map((e: any) => [e.index, e])), [vi]),
    Di = G.useMemo(() => new Map(yi.map((e: any) => [e.index, e])), [yi]),
    Oi = G.useMemo(() => Eg(E?.maxUsedRow ?? -1, Em, Om), [E?.maxUsedRow]),
    ki = G.useMemo(() => Eg(E?.maxUsedCol ?? -1, Dm, km), [E?.maxUsedCol]);
  (G.useEffect(() => {
    if (!fe) return;
    let e = vi[vi.length - 1]?.index ?? -1,
      t = yi[yi.length - 1]?.index ?? -1;
    (e >= jr.length - Pm && ur < Oi && dr((e: any) => Math.min(Oi, e + Mm)),
      t >= Z.length - Fm && fr < ki && pr((e: any) => Math.min(ki, e + Nm)));
  }, [yi, vi, fr, ur, fe, ki, Oi, Z.length, jr.length]),
    G.useEffect(() => {
      wt.current = T;
    }, [T]),
    G.useEffect(() => {
      Tt.current = Se;
    }, [Se]),
    G.useEffect(() => {
      Et.current = we;
    }, [we]),
    G.useEffect(() => {
      if (((Pt.current = Ue), Ht.current !== null && Ue === Ht.current)) {
        ((Ht.current = null),
          (Wt.current = null),
          (Gt.current = null),
          xr(),
          br(null),
          (Ft.current = Ue));
        return;
      }
      let e = It.current;
      if (e && Ue !== e.baseZoomScale) {
        Sr();
        return;
      }
      e === null && (Ft.current = Ue);
    }, [Sr, xr, br, Ue]),
    G.useLayoutEffect(() => {
      ((Vn.current = q), yr());
    }, [yr, q]),
    G.useEffect(() => {
      kt.current = sr;
    }, [sr]),
    G.useEffect(() => {
      At.current = hn;
    }, [hn]),
    G.useLayoutEffect(() => {
      if (!hn) return;
      let e = Mt.current;
      if (!e) return;
      e.focus();
      let t = e.value.length;
      e.setSelectionRange(t, t);
    }, [hn]),
    G.useEffect(() => {
      Nt.current = H;
    }, [H]),
    G.useEffect(() => {
      Ln.current = Cn;
    }, [Cn]),
    G.useEffect(() => {
      qn.current = Gn;
    }, [Gn]),
    G.useEffect(
      () => () => {
        (Ot.current !== null && (window.cancelAnimationFrame(Ot.current), (Ot.current = null)),
          Rt.current !== null && (window.cancelAnimationFrame(Rt.current), (Rt.current = null)),
          zt.current !== null && (window.cancelAnimationFrame(zt.current), (zt.current = null)),
          Fn.current !== null && (window.cancelAnimationFrame(Fn.current), (Fn.current = null)),
          xr(),
          Jn.current !== null && (window.cancelAnimationFrame(Jn.current), (Jn.current = null)),
          Xn.current !== null && (window.cancelAnimationFrame(Xn.current), (Xn.current = null)));
      },
      [xr],
    ));
  let Ai = G.useCallback((e: any) => {
      ((Yn.current = e),
        Jn.current === null &&
          (Jn.current = window.requestAnimationFrame(() => {
            Jn.current = null;
            let e = Yn.current;
            ((Yn.current = null), e && ((qn.current = e), Kn(e)));
          })));
    }, []),
    ji = G.useCallback((e: any) => {
      ((Zn.current = e),
        Xn.current === null &&
          (Xn.current = window.requestAnimationFrame(() => {
            Xn.current = null;
            let e = Zn.current;
            ((Zn.current = null), e && ((Ln.current = e), wn(e)));
          })));
    }, []);
  (G.useEffect(() => {
    qt.current = Wn.current ?? ai;
  }, [ai]),
    G.useEffect(() => {
      let e = Wn.current;
      if (!(!e || an.current || rn.current || on.current)) {
        if (sr && pg(e, sr)) {
          ((Wn.current = null), (qt.current = ai));
          return;
        }
        !sr && !ai && ((Wn.current = null), (qt.current = null));
      }
    }, [ai, sr]),
    G.useEffect(() => {
      ((Jt.current = ii), (Yt.current = Q), (Xt.current = ni), (Zt.current = ri));
    }, [ii, ni, Q, ri]),
    G.useEffect(() => {
      ((Hr.current = jr),
        (Ur.current = Z),
        (Wr.current = zr),
        (Gr.current = Rr),
        (ei.current = Kr),
        (ti.current = qr));
    }, [qr, Rr, zr, Kr, Z, jr]),
    G.useLayoutEffect(() => {
      let e = Ke.current,
        t = cr.current;
      if (!e || t === J) {
        cr.current = J;
        return;
      }
      let n = Bt.current;
      (n
        ? ((e.scrollLeft = ((e.scrollLeft + n.x) / t) * J - n.x),
          (e.scrollTop = ((e.scrollTop + n.y) / t) * J - n.y),
          (Bt.current = null))
        : ((e.scrollLeft = (e.scrollLeft / t) * J), (e.scrollTop = (e.scrollTop / t) * J)),
        (cr.current = J),
        ui && (gi.measure(), _i.measure()),
        Er(e, { immediate: !0 }));
    }, [ui, Er, J]),
    G.useLayoutEffect(() => {
      Er(Ke.current, { immediate: !0 });
    }, [E, A, fr, ur, Er, J]),
    G.useLayoutEffect(() => {
      let e = Ke.current;
      if (!e || (Er(e, { immediate: !0 }), typeof ResizeObserver > `u`)) return;
      let t = new ResizeObserver(() => {
        Er(e, { immediate: !0 });
      });
      return (
        t.observe(e),
        () => {
          t.disconnect();
        }
      );
    }, [E, Er]),
    G.useEffect(() => {
      (dr(Og(E?.maxUsedRow ?? -1, Em, Om, !!fe, Am)),
        pr(Og(E?.maxUsedCol ?? -1, Dm, km, !!fe, jm)));
    }, [E?.maxUsedCol, E?.maxUsedRow, D, fe]),
    G.useEffect(() => {
      let e = sr?.end.row ?? -1,
        t = sr?.end.col ?? -1,
        n = Math.max(
          Og(E?.maxUsedRow ?? -1, Em, Om, !1, Am),
          (T?.row ?? -1) + Om + 1,
          e + Om + 1,
          si.maxRow + Om + 1,
        ),
        r = Math.max(
          Og(E?.maxUsedCol ?? -1, Dm, km, !1, jm),
          (T?.col ?? -1) + km + 1,
          t + km + 1,
          si.maxCol + km + 1,
        );
      (dr((e: any) => (e < n ? n : e)), pr((e: any) => (e < r ? r : e)));
    }, [T, E?.maxUsedCol, E?.maxUsedRow, si.maxCol, si.maxRow, sr?.end.col, sr?.end.row]),
    G.useEffect(() => {
      let e = [
        L,
        D,
        E?.workbookSheetIndex ?? -1,
        E?.name ?? ``,
        E?.minUsedRow ?? -1,
        E?.minUsedCol ?? -1,
        fe ? `worker` : `main`,
      ].join(`|`);
      if (In.current === e) return;
      let t = ny(jr, E?.minUsedRow ?? -1),
        n = ny(Z, E?.minUsedCol ?? -1),
        r = t > 0 ? Sg(Jr, 0, t - 1) : 0,
        i = n > 0 ? Sg(Yr, 0, n - 1) : 0;
      (ui && ci ? gi.scrollToOffset(r) : Ke.current && (Ke.current.scrollTop = r),
        Ke.current && (Ke.current.scrollLeft = i),
        ui && li && Nr.length === 0 && _i.scrollToOffset(i),
        Ke.current && Er(Ke.current, { immediate: !0 }),
        (In.current = e));
    }, [
      E?.minUsedCol,
      E?.minUsedRow,
      E?.name,
      E?.workbookSheetIndex,
      D,
      Yr,
      Jr,
      _i,
      L,
      Nr.length,
      fe,
      li,
      ci,
      ui,
      Er,
      gi,
      Z,
      jr,
    ]),
    G.useEffect(() => {
      Sr();
    }, [A, Sr]),
    G.useEffect(() => {
      bn(null);
    }, [E, D]),
    G.useEffect(() => {
      !$n || $n.sheetIndex !== D || (Te($n.cell), er(null));
    }, [D, $n, Te]),
    G.useEffect(() => {
      (ui && ci && gi.measure(), ui && li && _i.measure());
    }, [D, ye, ui, li, ci, Z.length, jr.length]));
  let Mi = G.useCallback(
    (e: any) => {
      let t = e.currentTarget;
      ((un.current = null), (Ut.current = null));
      let n = jn.current;
      (Er(t, {
        immediate: Math.abs(t.scrollLeft - n.left) > qm || Math.abs(t.scrollTop - n.top) > qm,
      }),
        t.scrollHeight - (t.scrollTop + t.clientHeight) < Rm &&
          dr((e: any) => {
            let t = e + Im;
            return H && e < Oi ? Math.min(Oi, t) : t;
          }),
        t.scrollWidth - (t.scrollLeft + t.clientWidth) < zm &&
          pr((e: any) => {
            let t = e + Lm;
            return H && e < ki ? Math.min(ki, t) : t;
          }));
    },
    [ki, Oi, H, Er],
  );
  (G.useEffect(() => {
    let e = Ke.current;
    if (!e || !v) {
      Sr();
      return;
    }
    let t = (t: any) => {
        if (!y || (!t.ctrlKey && !t.metaKey)) return;
        let n = Xh(t);
        if (n === 0) return;
        t.preventDefault();
        let r = Ut.current ?? e.getBoundingClientRect();
        Ut.current = r;
        let i = Zh(t.clientX, t.clientY, r);
        (Cr(Ft.current * Math.exp(-n * Xm), i), Tr());
      },
      n = (t: any) => {
        if (t.touches.length !== 2) return;
        let [n, r] = [t.touches[0], t.touches[1]];
        if (!n || !r) return;
        let i = Qh(n, r);
        if (i <= 0) return;
        t.preventDefault();
        let a = e.getBoundingClientRect();
        Ut.current = a;
        let o = Zh((n.clientX + r.clientX) / 2, (n.clientY + r.clientY) / 2, a);
        (xr(),
          br({ anchor: o, baseZoomScale: Pt.current, targetZoomScale: Pt.current }),
          (Ft.current = Pt.current),
          (Wt.current = { startDistance: i, startZoomScale: Pt.current }));
      },
      r = (t: any) => {
        let n = Wt.current;
        if (!n || t.touches.length !== 2) return;
        let [r, i] = [t.touches[0], t.touches[1]];
        if (!r || !i) return;
        let a = Qh(r, i);
        if (a <= 0) return;
        t.preventDefault();
        let o = Ut.current ?? e.getBoundingClientRect();
        Ut.current = o;
        let s = Zh((r.clientX + i.clientX) / 2, (r.clientY + i.clientY) / 2, o);
        Cr((n.startZoomScale * a) / n.startDistance, s);
      },
      i = () => {
        Wt.current && ((Wt.current = null), wr());
      },
      a = () => {
        Wt.current && Sr();
      },
      o = (t: any) => {
        let n = t;
        t.preventDefault();
        let r = e.getBoundingClientRect();
        Ut.current = r;
        let i = Zh(n.clientX, n.clientY, r);
        (xr(),
          (Gt.current = Pt.current),
          br({ anchor: i, baseZoomScale: Pt.current, targetZoomScale: Pt.current }),
          (Ft.current = Pt.current));
      },
      s = (t: any) => {
        let n = t,
          r = Gt.current;
        if (r === null || !Number.isFinite(n.scale) || n.scale <= 0) return;
        t.preventDefault();
        let i = Ut.current ?? e.getBoundingClientRect();
        Ut.current = i;
        let a = Zh(n.clientX, n.clientY, i);
        Cr(r * n.scale, a);
      },
      c = () => {
        Gt.current !== null && ((Gt.current = null), wr());
      },
      l = () => {
        Gt.current !== null && Sr();
      };
    return (
      e.addEventListener(`wheel`, t, { passive: !1 }),
      e.addEventListener(`touchstart`, n, { passive: !1 }),
      e.addEventListener(`touchmove`, r, { passive: !1 }),
      e.addEventListener(`touchend`, i),
      e.addEventListener(`touchcancel`, a),
      e.addEventListener(`gesturestart`, o, { passive: !1 }),
      e.addEventListener(`gesturechange`, s, { passive: !1 }),
      e.addEventListener(`gestureend`, c),
      () => {
        (e.removeEventListener(`wheel`, t),
          e.removeEventListener(`touchstart`, n),
          e.removeEventListener(`touchmove`, r),
          e.removeEventListener(`touchend`, i),
          e.removeEventListener(`touchcancel`, a),
          e.removeEventListener(`gesturestart`, o),
          e.removeEventListener(`gesturechange`, s),
          e.removeEventListener(`gestureend`, c),
          l());
      }
    );
  }, [Sr, xr, wr, v, y, Tr, br, Cr]),
    G.useEffect(() => {
      if (!yn) return;
      function e(e: any) {
        _t.current?.contains(e.target) || bn(null);
      }
      function t(e: any) {
        e.key === `Escape` && bn(null);
      }
      return (
        window.addEventListener(`pointerdown`, e),
        window.addEventListener(`keydown`, t),
        () => {
          (window.removeEventListener(`pointerdown`, e), window.removeEventListener(`keydown`, t));
        }
      );
    }, [yn]));
  let Ni = G.useCallback(
      (e: any, t: any) => {
        let n = qe.current,
          r = Ke.current,
          i = Hr.current,
          a = Ur.current,
          o = ei.current,
          s = ti.current;
        if (!n || !r || i.length === 0 || a.length === 0) return null;
        let c = un.current ?? r.getBoundingClientRect();
        if (e < c.left || e > c.right || t < c.top || t > c.bottom) return null;
        let l = e - c.left,
          u = t - c.top,
          d = l + (l >= $r ? r.scrollLeft : 0),
          f = u + (u >= Qr ? r.scrollTop : 0),
          p = f - Y,
          m = d - X,
          h = null;
        if (f >= Y && d < X) {
          let e = i[wg(o, p)];
          e !== void 0 && Jt.current !== void 0 && (h = { row: e, col: Jt.current });
        } else if (f < Y && d >= X) {
          let e = a[wg(s, m)];
          e !== void 0 && Xt.current !== void 0 && (h = { row: Xt.current, col: e });
        } else if (f >= Y && d >= X) {
          let e = wg(o, p),
            t = wg(s, m),
            n = i[e],
            r = a[t];
          n !== void 0 && r !== void 0 && (h = { row: n, col: r });
        }
        return h;
      },
      [Y, X, Qr, $r],
    ),
    Pi = G.useCallback((e: any, t: any) => {
      let n =
        typeof document.elementsFromPoint == `function`
          ? document.elementsFromPoint(e, t)
          : [document.elementFromPoint(e, t)].filter((e: any) => !!e);
      for (let e of n) {
        if (!(e instanceof HTMLElement)) continue;
        let t = lg(e.closest(`[data-xlsx-cell]`)?.getAttribute(`data-xlsx-cell`) ?? null);
        if (t) return t;
        let n = e.closest(`[data-xlsx-col-header]`);
        if (n && Xt.current !== void 0) {
          let e = Number(n.getAttribute(`data-xlsx-col-header`));
          if (Number.isInteger(e) && e >= 0) return { row: Xt.current, col: e };
        }
        let r = e.closest(`tr[data-xlsx-row]`);
        if (r && Jt.current !== void 0) {
          let e = Number(r.getAttribute(`data-xlsx-row`));
          if (Number.isInteger(e) && e >= 0) return { row: e, col: Jt.current };
        }
      }
      return null;
    }, []),
    Fi = G.useCallback(
      (e: any, t: any) => {
        let n = Ni(e, t);
        if (n) return n;
        let r = Pi(e, t);
        return r ? or(r) : null;
      },
      [or, Ni, Pi],
    ),
    Ii = G.useCallback(
      (e: any, t: any, n: any) => {
        let r = Ni(t, n),
          i = Pi(t, n),
          a = r?.row ?? (i && Br.has(i.row) ? i.row : void 0),
          o = r?.col ?? i?.col;
        return a === void 0 || o === void 0
          ? null
          : e.axis === `row`
            ? { row: a, col: e.originCell.col }
            : e.axis === `column`
              ? { row: e.originCell.row, col: o }
              : { row: a, col: o };
      },
      [Ni, Pi, Br],
    ),
    Li = G.useCallback(
      (e: any, t: any, n: any, r: any) => {
        let i = Br.get(e.row),
          a = Vr.get(e.col);
        if (i === void 0 || a === void 0) return null;
        let o = Rr[a] ?? _r,
          s = zr[i] ?? gr,
          c = Math.max(1e-4, t.width > 0 ? t.width / o : 1),
          l = Math.max(1e-4, t.height > 0 ? t.height / s : 1);
        return {
          contentScaleX: c,
          contentScaleY: l,
          originContentX: (qr[a] ?? 0) + Tg((n - t.left) / c, o),
          originContentY: (Kr[i] ?? 0) + Tg((r - t.top) / l, s),
        };
      },
      [Vr, qr, _r, gr, Rr, zr, Br, Kr],
    ),
    Ri = G.useCallback(
      (e: any, t: any, n: any) => {
        let r = Ke.current,
          i = Br.get(e.row),
          a = Vr.get(e.col);
        if (!r || i === void 0 || a === void 0) return null;
        let o = un.current ?? r.getBoundingClientRect(),
          s = t - o.left,
          c = n - o.top,
          l = s + (s >= $r ? r.scrollLeft : 0),
          u = c + (c >= Qr ? r.scrollTop : 0),
          d = Rr[a] ?? _r,
          f = zr[i] ?? gr;
        return {
          contentScaleX: 1,
          contentScaleY: 1,
          originContentX: (qr[a] ?? 0) + Tg(l - X - (qr[a] ?? 0), d),
          originContentY: (Kr[i] ?? 0) + Tg(u - Y - (Kr[i] ?? 0), f),
        };
      },
      [Vr, qr, _r, gr, Rr, zr, Y, X, Qr, $r, Br, Kr],
    ),
    zi = G.useCallback(
      (e: any, t: any, n: any) => {
        let r = Br.get(e);
        if (r === void 0) return null;
        let i = zr[r] ?? gr,
          a = Math.max(1e-4, t.height > 0 ? t.height / i : 1);
        return {
          contentScaleX: 1,
          contentScaleY: a,
          originContentX: qr[0] ?? 0,
          originContentY: (Kr[r] ?? 0) + Tg((n - t.top) / a, i),
        };
      },
      [qr, gr, zr, Br, Kr],
    ),
    Bi = G.useCallback(
      (e: any, t: any, n: any) => {
        let r = Vr.get(e);
        if (r === void 0) return null;
        let i = Rr[r] ?? _r,
          a = Math.max(1e-4, t.width > 0 ? t.width / i : 1);
        return {
          contentScaleX: a,
          contentScaleY: 1,
          originContentX: (qr[r] ?? 0) + Tg((n - t.left) / a, i),
          originContentY: Kr[0] ?? 0,
        };
      },
      [Vr, qr, _r, Rr, Kr],
    );
  (G.useCallback(
    (e: any, t: any) => {
      let n = vt.current.get(e);
      n && (n.style.width = t === null ? `` : `${t}px`);
      let r = Z.indexOf(e),
        i = r >= 0 ? (Rr[r] ?? _r) : _r,
        a = t ?? i,
        o = Rr.reduce((e: any, t: any) => e + t, 0) + X,
        s = a - i;
      Je.current && (Je.current.style.width = `${o + s}px`);
    },
    [_r, Rr, X, Z],
  ),
    G.useCallback((e: any, t: any) => {
      let n = bt.current.get(e) ?? qe.current?.querySelector(`tr[data-xlsx-row="${e}"]`) ?? null;
      n && (bt.current.set(e, n), (n.style.height = t === null ? `` : `${t}px`));
    }, []),
    G.useEffect(() => {
      (cn.current?.(),
        sn.current?.(),
        ln.current?.(),
        pn.current?.(),
        dn.current?.(),
        (cn.current = null),
        (sn.current = null),
        (ln.current = null),
        (pn.current = null),
        (dn.current = null),
        (an.current = null),
        (rn.current = null),
        (on.current = null),
        (mn.current = null),
        (fn.current = null),
        (nn.current = null),
        (St.current = null),
        (Ct.current = null),
        Un(null),
        Or(),
        gn(null),
        vn(``),
        Sn(null),
        (Ln.current = null),
        wn(null),
        (qn.current = null),
        Kn(null),
        (Wn.current = null),
        nr(`idle`));
    }, [D, Or, ye]));
  let Vi = G.useCallback((e: any, t: any) => {
      document.activeElement !== e && e.focus(t ?? { preventScroll: !0 });
    }, []),
    Hi = G.useCallback(
      (e: any) => {
        let t = Ke.current;
        t && ((Ye.current = !0), Vi(t, e));
      },
      [Vi],
    );
  G.useEffect(() => {
    let e = (e: any) => {
        let t = Ke.current;
        if (!t || !(e.target instanceof Node) || !t.contains(e.target)) {
          Ye.current = !1;
          return;
        }
        if (gg(e.target, t)) {
          Ye.current = !1;
          return;
        }
        ((Ye.current = !0), Vi(t));
      },
      t = (e: any) => {
        if (!Ye.current || e.defaultPrevented) return;
        let t = Ke.current,
          n = hg(e.target);
        !t || (n && n !== t) || Xe.current?.(e);
      };
    return (
      document.addEventListener(`pointerdown`, e, !0),
      document.addEventListener(`keydown`, t),
      () => {
        (document.removeEventListener(`pointerdown`, e, !0),
          document.removeEventListener(`keydown`, t));
      }
    );
  }, [Vi]);
  let Ui = G.useCallback(
      (e: any, t: any) => {
        let n = k_(t ?? e);
        if (n) {
          let e = Ie.findIndex((e: any) => e.name === n.sheetName);
          if (e >= 0) {
            e === D ? Te(n.cell) : (er({ cell: n.cell, sheetIndex: e }), je(e));
            return;
          }
        }
        let r = e && !e.startsWith(`#`) ? e : null;
        r && typeof window < `u` && window.open(r, `_blank`, `noopener,noreferrer`);
      },
      [D, Te, je, Ie],
    ),
    Wi = G.useCallback(
      (e: any, t: any) => {
        H || (Te(e), gn(e), vn(t ?? oe(e)));
      },
      [oe, H, Te],
    ),
    Gi = G.useCallback(() => {
      if (hn) {
        if (H) {
          ((At.current = null), gn(null), vn(``), Hi());
          return;
        }
        (Pe(hn, _n), (At.current = null), gn(null), vn(``), Hi());
      }
    }, [hn, _n, Hi, H, Pe]),
    Ki = G.useCallback(() => {
      ((At.current = null), gn(null), vn(``), Hi());
    }, [Hi]),
    qi = G.useCallback(() => {
      At.current && Gi();
    }, [Gi]),
    Ji = G.useCallback(
      (e: any, t: any) => {
        let n = At.current;
        if (!n) return;
        let r = Br.get(n.row),
          i = Vr.get(n.col);
        if (r === void 0 || i === void 0) {
          (Nt.current || Pe(n, t), (At.current = null), gn(null), vn(``), Hi());
          return;
        }
        let a = r,
          o = i;
        switch (e) {
          case `ArrowDown`:
            a += 1;
            break;
          case `ArrowLeft`:
            --o;
            break;
          case `ArrowRight`:
            o += 1;
            break;
          case `ArrowUp`:
            --a;
            break;
          default:
            return;
        }
        (Nt.current || Pe(n, t), (At.current = null), gn(null), vn(``), xc(a, o, !1), Hi());
      },
      [Vr, Hi, Br, Pe, Z, jr],
    );
  G.useEffect(() => {
    jt.current = Gi;
  }, [Gi]);
  let [, Yi] = G.useTransition(),
    [, Xi] = G.useTransition(),
    [Zi, Qi] = G.useState(null),
    $i = G.useMemo(() => {
      let e = y
          ? (() => {
              if (jr.length === 0 || q.height <= 0) return [];
              let e = new Set(bi),
                t = Math.max(0, q.top - Y - Wm),
                n = Math.max(t, q.top + q.height - Y + Wm),
                r = wg(Kr, t),
                i = wg(Kr, n);
              for (let t = Math.max(0, r); t <= Math.max(r, i); t += 1) e.add(t);
              return Array.from(e).sort((e: any, t: any) => e - t);
            })()
          : Ti.rowIndices,
        t = e[0],
        n = e[e.length - 1],
        r = t === void 0 ? void 0 : jr[t],
        i = n === void 0 ? void 0 : jr[n];
      if (r === void 0 || i === void 0 || i < r) return null;
      let a = Math.max(0, r - 48);
      return { endRow: i + 48, startRow: a };
    }, [Y, Ti.rowIndices, q.height, q.top, y, bi, Kr, jr]),
    ea = G.useMemo(() => {
      if (!ci || !rr || z || !$i) return null;
      let e = rr;
      if (typeof e.getRowsBatch != `function`) return null;
      try {
        return hv(
          e.getRowsBatch($i.startRow, $i.endRow - $i.startRow + 1, {
            includeFormulas: !0,
            includeHyperlinks: !0,
            includeMergeInfo: !0,
            includeStyles: !0,
            useFormattedValues: !0,
          }),
          E ?? null,
          $i.startRow,
          $i.endRow,
        );
      } catch {
        return null;
      }
    }, [E, z, ci, $i, rr]);
  G.useEffect(() => {
    if (!ci || !z || !E || !$i) {
      Qi(null);
      return;
    }
    if (Zi && $i.startRow >= Zi.startRow && $i.endRow <= Zi.endRow) return;
    let e = !0;
    return (
      z(E.workbookSheetIndex, $i.startRow, $i.endRow - $i.startRow + 1)
        .then((t: any) => {
          if (!e) return;
          let n = hv(t, E, $i.startRow, $i.endRow);
          Yi(() => {
            Qi(n);
          });
        })
        .catch(() => {
          e &&
            Yi(() => {
              Qi(null);
            });
        }),
      () => {
        e = !1;
      }
    );
  }, [E, Zi, z, ci, Yi, $i]);
  let ta = z ? Zi : ea;
  G.useEffect(() => {
    Qi(null);
  }, [D, ye]);
  let na = G.useMemo(() => {
      let e = new Map();
      for (let t of E?.sparklines ?? []) e.set(`${t.target.row}:${t.target.col}`, t);
      return e;
    }, [E?.sparklines]),
    ra = G.useMemo(() => sv(be, xe, Ie, He, M_(p)), [p, be, xe, Ie, He]),
    ia = G.useMemo(
      () => (E ? ra.filter((e: any) => e.workbookSheetIndex === E.workbookSheetIndex) : []),
      [E, ra],
    ),
    aa = G.useMemo(
      () => [ia, D, fr, ur, o, p, ye, xe, Se, ta, rr, J],
      [ia, D, fr, ur, o, p, ye, xe, Se, ta, rr, J],
    ),
    oa = G.useRef(null);
  oa.current !== aa && (Qt.current.clear(), (oa.current = aa));
  let sa = G.useCallback(
    (e: any, t: any) => {
      let n = `${e}:${t}`,
        r = Qt.current.get(n);
      if (r) return r;
      let i = ta ? e >= ta.startRow && e <= ta.endRow : !1,
        a = i ? ta?.cells.get(n) : void 0,
        s = rr?.isMergedSecondary(e, t) ?? !1;
      if (!rr && !a) {
        let e = {
          isMergedSecondary: !1,
          style: Th(
            {
              backgroundColor: sg(E, p),
              borderBottom: `none`,
              borderRight: `none`,
              boxShadow: E?.showGridLines ? W_(p.border) : void 0,
              padding: ih,
              verticalAlign: `bottom`,
              whiteSpace: `nowrap`,
            },
            J,
          ),
          value: ``,
        };
        return (Qt.current.set(n, e), e);
      }
      if (a?.isMergedSecondary || s) {
        let e = { isMergedSecondary: !0, style: {}, value: `` };
        return (Qt.current.set(n, e), e);
      }
      let c = rr ? rr.getMergeSpan(e, t) : i ? a?.mergeSpan : null,
        l = _v(O_(E, e, t), i ? (a?.style ?? null) : (rr?.getCellStyleAt(e, t) ?? null), {
          replaceXfSubtrees: !0,
        }),
        u = gv(lr, e, t),
        d = _v(l, yv(u, e, t, E)),
        f = d?.alignment,
        m = Oh(f?.textRotation),
        h = u ? Math.max(u.headerRowCount, 1) : 0,
        g = i ? a?.hyperlink : rr?.getHyperlinkAt(e, t),
        _ = na.get(n) ?? null,
        v =
          _ && rr
            ? _.range.start.row === _.range.end.row
              ? Array.from({ length: Math.abs(_.range.end.col - _.range.start.col) + 1 }, (e: any, t: any) =>
                  ev(rr, _.range.start.row, Math.min(_.range.start.col, _.range.end.col) + t),
                )
              : Array.from({ length: Math.abs(_.range.end.row - _.range.start.row) + 1 }, (e: any, t: any) =>
                  ev(rr, Math.min(_.range.start.row, _.range.end.row) + t, _.range.start.col),
                )
            : null,
        y = d?.cellControl && rr ? tv(rr, e, t) : null,
        b: any = {
          canvas: void 0,
          chartHighlight: fg({ row: e, col: t }, ia),
          checkboxState: y,
          colSpan: c?.colSpan,
          conditionalDataBar: rr ? Xv(e, t, rr, E, $t.current) : null,
          conditionalColorScale: rr ? Zv(e, t, rr, E, $t.current) : null,
          conditionalIcon: rr ? Qv(e, t, rr, E, $t.current) : null,
          hyperlink: g ?? null,
          isMergedSecondary: !1,
          shrinkToFit: f?.shrinkToFit === !0,
          isTableHeader: !!(u && e >= u.start.row && e < u.start.row + h),
          rowSpan: c?.rowSpan,
          sparkline: _ && v ? { config: _, values: v } : null,
          style: Th(G_(d, p, E?.themePalette, { showGridLines: E?.showGridLines }), J),
          textRotationDeg: m,
          validation: $v(e, t, E),
          value: _ ? `` : y === null ? (i || !rr ? (a?.value ?? ``) : $_(rr, e, t, E)) : ``,
        };
      if (o) {
        let n = o({
          cell: { row: e, col: t },
          hasChartHighlight: !!b.chartHighlight,
          hasConditionalFormat: !!(
            b.conditionalColorScale ||
            b.conditionalDataBar ||
            b.conditionalIcon
          ),
          hasHyperlink: !!b.hyperlink,
          hasValidation: !!b.validation,
          isMerged: !!(b.colSpan || b.rowSpan),
          isTableHeader: !!b.isTableHeader,
          resolvedStyle: { ...b.style },
          sheetName: E?.name ?? ``,
          value: b.value,
          workbookSheetIndex: E?.workbookSheetIndex ?? -1,
        });
        n &&
          ((b.style = { ...b.style, ...n }),
          b.conditionalColorScale &&
            (n.backgroundColor !== void 0 || n.background !== void 0) &&
            (b.conditionalColorScale = null));
      }
      if (((b.canvas = Hh(b.style)), Z_(b))) {
        let n = Vr.get(t);
        if (n !== void 0) {
          let t = Math.max(1, b.colSpan ?? 1),
            r = Math.min(Z.length - 1, n + t - 1),
            i = q_(b.style.padding),
            a = Y_(b.value, b.style) + i + 2,
            o = Math.max(Rr[n] ?? _r, Sg(qr, n, r)),
            s = o;
          if (a > s) {
            for (let t = r + 1; t < Z.length; t += 1) {
              let n = Z[t];
              if (n === void 0 || !Q_(sa(e, n)) || ((s += Rr[t] ?? _r), a <= s)) break;
            }
            s > o && (b.spillWidth = Math.max(0, s - i));
          }
        }
      }
      if (b.shrinkToFit && b.value.length > 0 && b.style.whiteSpace !== `pre-wrap`) {
        let e = Vr.get(t);
        if (e !== void 0) {
          let t = Math.max(1, b.colSpan ?? 1),
            n = Math.min(Z.length - 1, e + t - 1),
            r = q_(b.style.padding),
            i = (b.conditionalIcon ? 18 * J : 0) + (b.isTableHeader ? 16 * J : 0),
            a = Math.max(Rr[e] ?? _r, Sg(qr, e, n)),
            o = Math.max(0, a - r - i);
          if (o > 0 && Y_(b.value, b.style) > o) {
            let e = Lh(b.style, 12 * J),
              t = Math.max(6 * J, e * 0.4),
              n = t,
              r = e,
              i = t;
            for (; r - n > 0.25;) {
              let e = (n + r) / 2,
                t = { ...b.style, font: void 0, fontSize: e };
              Y_(b.value, t) <= o ? ((i = e), (n = e)) : (r = e);
            }
            b.shrinkToFitFontSizePx = Math.min(e, i);
          }
        }
      }
      return (Qt.current.set(n, b), b);
    },
    [E, ia, aa, Vr, qr, _r, Rr, lr, o, p, na, ta, Z, rr, J],
  );
  G.useEffect(() => {
    $t.current.clear();
  }, [E?.conditionalFormatRules, E?.workbookSheetIndex, ye]);
  let ca = G.useMemo(() => {
      if (!ai) return null;
      let e = cg(ai),
        t = Br.get(e.start.row),
        n = Br.get(e.end.row),
        r = Vr.get(e.start.col),
        i = Vr.get(e.end.col);
      return t === void 0 || n === void 0 || r === void 0 || i === void 0
        ? null
        : {
            height: Sg(Kr, t, n),
            left: X + Sg(qr, 0, r - 1),
            top: Y + Sg(Kr, 0, t - 1),
            width: Sg(qr, r, i),
          };
    }, [Vr, qr, Y, X, ai, Br, Kr]),
    {
      fill: la,
      header: ua,
      stroke: da,
    } = G.useMemo(
      () => Iv({ palette: p, selectionColor: b, selectionFillColor: x, selectionHeaderColor: S }),
      [p, b, x, S],
    ),
    fa = G.useMemo(
      () =>
        Ti.colIndices.map((e: any) => {
          let t = Di.get(e);
          return {
            end: t?.end ?? qr[e + 1] ?? 0,
            index: e,
            key: Z[e] ?? e,
            size: t?.size ?? Rr[e] ?? _r,
            start: t?.start ?? qr[e] ?? 0,
          };
        }),
      [qr, Di, _r, Rr, Ti.colIndices, Z],
    ),
    pa = G.useMemo(() => {
      let e: any[] = [];
      return (
        fa.forEach((t: any) => {
          let n = Z[t.index];
          n !== void 0 && e.push({ actualCol: n, key: n, size: t.size, virtualIndex: t.index });
        }),
        e
      );
    }, [fa, Z]),
    ma = G.useMemo(() => {
      if (jr.length === 0 || q.height <= 0) return [];
      let e = new Set(bi),
        t = Math.max(0, q.top - Y - Wm),
        n = Math.max(t, q.top + q.height - Y + Wm),
        r = wg(Kr, t),
        i = wg(Kr, n);
      for (let t = Math.max(0, r); t <= Math.max(r, i); t += 1) e.add(t);
      return Array.from(e).sort((e: any, t: any) => e - t);
    }, [Y, q.height, q.top, bi, Kr, jr.length]),
    ha = G.useMemo(() => {
      if (Z.length === 0 || q.width <= 0) return [];
      let e = new Set(xi),
        t = Math.max(0, q.left - X - Wm),
        n = Math.max(t, q.left + q.width - X + Wm),
        r = wg(qr, t),
        i = wg(qr, n);
      for (let t = Math.max(0, r); t <= Math.max(r, i); t += 1) e.add(t);
      return Array.from(e).sort((e: any, t: any) => e - t);
    }, [qr, X, q.left, q.width, xi, Z.length]),
    ga = G.useMemo(() => yg(ma, ha, Si), [ha, ma, Si]),
    _a = G.useMemo(
      () =>
        ga.rowIndices.map((e: any) => ({
          actualRow: jr[e] ?? e,
          index: e,
          size: zr[e] ?? gr,
          start: Kr[e] ?? 0,
        })),
      [ga.rowIndices, gr, zr, Kr, jr],
    ),
    va = G.useMemo(
      () =>
        ga.colIndices.map((e: any) => ({
          actualCol: Z[e] ?? e,
          index: e,
          size: Rr[e] ?? _r,
          start: qr[e] ?? 0,
        })),
      [ga.colIndices, qr, _r, Rr, Z],
    ),
    ya = G.useMemo(() => {
      let e = new Set(Mr.map((e: any) => Br.get(e)).filter((e: any) => e !== void 0)),
        t = new Set(Nr.map((e: any) => Vr.get(e)).filter((e: any) => e !== void 0)),
        n = _a.filter((t: any) => e.has(t.index)),
        r = _a.filter((t: any) => !e.has(t.index)),
        i = va.filter((e: any) => t.has(e.index)),
        a = va.filter((e: any) => !t.has(e.index));
      return {
        corner: { cols: i, rows: n },
        left: { cols: i, rows: r },
        scroll: { cols: a, rows: r },
        top: { cols: a, rows: n },
      };
    }, [va, _a, Vr, Nr, Mr, Br]),
    ba = qr[qr.length - 1] ?? 0,
    xa = li ? (fa[0]?.start ?? 0) : 0,
    Sa = li ? ba - (fa[fa.length - 1]?.end ?? 0) : 0,
    Ca = G.useMemo(
      () =>
        C
          ? se.map((e: any) => ({
              image: e,
              rect:
                Gn && Gn.id === e.id
                  ? Gn.rect
                  : Mg(e, jr, Z, zr, Rr, {
                      actualColPrefixSums: Yr,
                      actualRowPrefixSums: Jr,
                      colIndexByActual: Vr,
                      colPrefixSums: qr,
                      headerHeight: Y,
                      rowIndexByActual: Br,
                      rowHeaderWidth: X,
                      rowPrefixSums: Kr,
                      zoomFactor: J,
                    }),
            }))
          : [],
      [Vr, qr, Yr, Jr, Y, Rr, zr, X, Gn, se, Br, Kr, C, Z, jr, J],
    ),
    wa = G.useMemo(
      () =>
        C
          ? ce.map((e: any) => ({
              rect: jg(e.anchor, jr, Z, zr, Rr, {
                actualColPrefixSums: Yr,
                actualRowPrefixSums: Jr,
                colIndexByActual: Vr,
                colPrefixSums: qr,
                headerHeight: Y,
                rowIndexByActual: Br,
                rowHeaderWidth: X,
                rowPrefixSums: Kr,
                zoomFactor: J,
              }),
              shape: e,
            }))
          : [],
      [Vr, qr, Yr, Jr, Y, Rr, zr, X, Br, Kr, ce, C, Z, jr, J],
    ),
    Ta = G.useMemo(
      () =>
        C
          ? re
              .filter((e: any) => !e.hidden)
              .map((e: any) => ({
                control: e,
                rect: jg(e.anchor, jr, Z, zr, Rr, {
                  actualColPrefixSums: Yr,
                  actualRowPrefixSums: Jr,
                  colIndexByActual: Vr,
                  colPrefixSums: qr,
                  headerHeight: Y,
                  rowIndexByActual: Br,
                  rowHeaderWidth: X,
                  rowPrefixSums: Kr,
                  zoomFactor: J,
                }),
              }))
          : [],
      [Yr, Jr, Vr, qr, Y, Rr, zr, X, re, Br, Kr, C, Z, jr, J],
    ),
    Ea = G.useMemo(
      () =>
        C
          ? M.map((e: any) => ({
              chart: e,
              rect:
                Cn && Cn.id === e.id
                  ? Cn.rect
                  : jg(e.anchor, jr, Z, zr, Rr, {
                      actualColPrefixSums: Yr,
                      actualRowPrefixSums: Jr,
                      colIndexByActual: Vr,
                      colPrefixSums: qr,
                      headerHeight: Y,
                      rowIndexByActual: Br,
                      rowHeaderWidth: X,
                      rowPrefixSums: Kr,
                      zoomFactor: J,
                    }),
            }))
          : [],
      [Yr, Jr, Cn, M, Vr, qr, Y, Rr, zr, X, Br, Kr, C, Z, jr, J],
    ),
    Da = !!(y && H && C),
    Oa = !!(Da && !m && !h),
    ka = G.useMemo(() => (Da ? wa.filter(({ shape: e }: any) => !e.hyperlink) : []), [wa, Da]),
    Aa = G.useMemo(() => (Da ? wa.filter(({ shape: e }: any) => e.hyperlink) : wa), [wa, Da]),
    ja = Ta,
    Ma = G.useMemo(
      () => (Oa ? Ca.filter(({ image: e }: any) => !e.hyperlink && we !== e.id) : []),
      [Ca, we, Oa],
    ),
    Na = G.useMemo(
      () => (Oa ? Ca.filter(({ image: e }: any) => e.hyperlink || we === e.id) : Ca),
      [Ca, we, Oa],
    ),
    Pa = !!(C && (Ea.length > 0 || Aa.length > 0 || ja.length > 0 || Na.length > 0)),
    Fa = G.useMemo(
      () =>
        Da
          ? `${ye}:${Dn}:${ka.map(({ rect: e, shape: t }: any) => `s:${t.id}:${t.zIndex}:${Math.round(e.left)}:${Math.round(e.top)}:${Math.round(e.width)}:${Math.round(e.height)}`).join(`|`)}:${Ma.map(({ image: e, rect: t }: any) => `i:${e.id}:${e.src}:${e.zIndex}:${Math.round(t.left)}:${Math.round(t.top)}:${Math.round(t.width)}:${Math.round(t.height)}`).join(`|`)}`
          : ``,
      [Ma, ka, Dn, ye, Da],
    ),
    Ia = G.useCallback((e: any) => {
      let t = qe.current;
      if (!t) return null;
      let n = t.getBoundingClientRect(),
        r = e.getBoundingClientRect(),
        i = t.offsetWidth || 1,
        a = t.offsetHeight || 1,
        o = Math.max(1e-4, n.width > 0 ? n.width / i : 1),
        s = Math.max(1e-4, n.height > 0 ? n.height / a : 1);
      return {
        height: r.height / s,
        left: (r.left - n.left) / o,
        top: (r.top - n.top) / s,
        width: r.width / o,
      };
    }, []),
    La = G.useCallback(
      (e: any) => {
        let t = qe.current;
        if (!t) return null;
        let n = t.querySelector(`[data-xlsx-cell="${e.row}:${e.col}"]`);
        return n ? Ia(n) : null;
      },
      [Ia],
    ),
    Ra = G.useCallback(
      (e: any) => {
        let t = cg(e),
          n = t.start.row === t.end.row && t.start.col === t.end.col,
          r = n ? rr?.isMergedSecondary(t.start.row, t.start.col) === !0 : !1,
          i = n && !r ? or(t.start) : t.start,
          a = n && !r ? rr?.getMergeSpan(i.row, i.col) : null,
          o =
            n && !r
              ? {
                  row: i.row + Math.max(1, a?.rowSpan ?? 1) - 1,
                  col: i.col + Math.max(1, a?.colSpan ?? 1) - 1,
                }
              : t.end,
          s = Br.get(i.row),
          c = Br.get(o.row),
          l = Vr.get(i.col),
          u = Vr.get(o.col);
        if (s === void 0 || c === void 0 || l === void 0 || u === void 0) return null;
        let d = X + Sg(qr, 0, l - 1),
          f = Y + Sg(Kr, 0, s - 1),
          p = Sg(qr, l, u),
          m = Sg(Kr, s, c),
          h = St.current;
        if (h) {
          let e = Vr.get(h.actualIndex);
          if (e !== void 0) {
            let t = Rr[e] ?? _r,
              n = h.size - t;
            (e < l && (d += n), e >= l && e <= u && (p += n));
          }
        }
        let g = Ct.current;
        if (g) {
          let e = Br.get(g.actualIndex);
          if (e !== void 0) {
            let t = zr[e] ?? gr,
              n = g.size - t;
            (e < s && (f += n), e >= s && e <= c && (m += n));
          }
        }
        return {
          height: Math.max(0, m),
          left: Math.max(X, d),
          top: Math.max(Y, f),
          width: Math.max(0, p),
        };
      },
      [Vr, qr, _r, gr, Rr, zr, Y, X, or, Br, Kr, rr],
    ),
    za = G.useCallback(
      (e: any, t: any) => {
        let n = cg(e),
          r = La(n.start),
          i = La({ row: n.start.row, col: n.end.col }),
          a = La({ row: n.end.row, col: n.start.col }),
          o = La(n.end),
          s = r ?? a,
          c = r ?? i,
          l = i ?? o,
          u = a ?? o,
          d = s ? s.left : t.left,
          f = c ? c.top : t.top,
          p = l ? l.left + l.width : t.left + t.width,
          m = u ? u.top + u.height : t.top + t.height;
        return {
          height: Math.max(0, m - f),
          left: Math.max(X, d),
          top: Math.max(Y, f),
          width: Math.max(0, p - d),
        };
      },
      [Y, X, La],
    ),
    Ba = G.useCallback(
      (e: any) => {
        let t = rn.current;
        if (!t || !t.didDrag || t.axis !== `cell` || !t.originOverlayRect) return null;
        let n = Ra(e);
        if (!n) return null;
        let r = t.originOverlayRect,
          i = cg(e);
        if (pg(i, { start: t.originCell, end: t.originCell })) return r;
        let a = t.originCell,
          o = a.col === i.start.col,
          s = a.row === i.start.row,
          c = za(e, n),
          l = c.left + c.width,
          u = c.top + c.height,
          d = r.left + r.width,
          f = r.top + r.height,
          p = o ? r.left : Math.min(r.left, c.left),
          m = s ? r.top : Math.min(r.top, c.top),
          h = o ? Math.max(d, l) : d,
          g = s ? Math.max(f, u) : f;
        return {
          height: Math.max(r.height, g - m),
          left: p,
          top: m,
          width: Math.max(r.width, h - p),
        };
      },
      [Ra, za],
    ),
    Va = G.useCallback(
      (e: any) => {
        let t = cg(e);
        if (t.start.row === t.end.row && t.start.col === t.end.col) {
          let e = La(t.start);
          if (e) return e;
        }
        let n = Ra(e);
        return n ? za(e, n) : null;
      },
      [Ra, za],
    ),
    Ha = G.useCallback(
      (e: any) => {
        let t = Br.get(e.row),
          n = Vr.get(e.col);
        if (t === void 0 || n === void 0) return null;
        let r = sa(e.row, e.col),
          i = Math.max(1, r.colSpan ?? 1),
          a = Math.max(1, r.rowSpan ?? 1),
          o = Math.min(fr - 1, e.col + i - 1),
          s = Math.min(ur - 1, e.row + a - 1);
        if (rr && (i > 1 || a > 1)) {
          for (let t = e.col + 1; t < fr; t += 1) {
            let n = or({ row: e.row, col: t });
            if (n.row !== e.row || n.col !== e.col) break;
            o = t;
          }
          for (let t = e.row + 1; t < ur; t += 1) {
            let n = or({ row: t, col: e.col });
            if (n.row !== e.row || n.col !== e.col) break;
            s = t;
          }
        }
        return {
          height: Sg(Jr, e.row, s),
          left: X + Sg(Yr, 0, e.col - 1),
          top: Y + Sg(Jr, 0, e.row - 1),
          width: Sg(Yr, e.col, o),
        };
      },
      [Yr, Jr, Vr, fr, Y, ur, X, sa, or, Br, rr],
    ),
    Ua = G.useMemo(() => {
      if (!yn) return null;
      let e = lr.find((e: any) => e.name === yn.tableName) ?? null,
        t = bv(e, yn.row, yn.col),
        n = qe.current;
      if (!e || !t || !n) return null;
      let r = n.querySelector(`[data-xlsx-cell="${yn.row}:${yn.col}"]`);
      if (r)
        return {
          column: t,
          left: r.offsetLeft + r.offsetWidth - 170,
          table: e,
          top: r.offsetTop + r.offsetHeight - 2,
        };
      let i = Ha({ row: yn.row, col: yn.col });
      return i
        ? { column: t, left: i.left + i.width - 170, table: e, top: i.top + i.height - 2 }
        : null;
    }, [lr, yn, Ha]),
    Wa = G.useCallback(
      (e: any) => {
        if (y) return;
        let t = e ? cg(e) : null;
        (xt.current.forEach((e: any, n: any) => {
          e.style.backgroundColor =
            t && n >= t.start.row && n <= t.end.row
              ? `var(--xlsx-selection-header)`
              : p.rowHeaderSurface;
        }),
          yt.current.forEach((e: any, n: any) => {
            e.style.backgroundColor =
              t && n >= t.start.col && n <= t.end.col
                ? `var(--xlsx-selection-header)`
                : p.headerSurface;
          }));
      },
      [y, p.headerSurface, p.rowHeaderSurface],
    ),
    Ga = G.useCallback(
      (e: any, t: any) => {
        if (y) {
          xt.current.delete(e);
          return;
        }
        if (t) {
          xt.current.set(e, t);
          let n = Wn.current ?? qt.current;
          t.style.backgroundColor =
            n && e >= n.start.row && e <= n.end.row
              ? `var(--xlsx-selection-header)`
              : p.rowHeaderSurface;
          return;
        }
        xt.current.delete(e);
      },
      [y, p.rowHeaderSurface],
    ),
    Ka = G.useCallback(
      (e: any, t: any) => {
        if (y) {
          yt.current.delete(e);
          return;
        }
        if (t) {
          yt.current.set(e, t);
          let n = Wn.current ?? qt.current;
          t.style.backgroundColor =
            n && e >= n.start.col && e <= n.end.col
              ? `var(--xlsx-selection-header)`
              : p.headerSurface;
          return;
        }
        yt.current.delete(e);
      },
      [y, p.headerSurface],
    ),
    qa = G.useCallback(
      (e: any, t: any) => {
        let n = pt.current;
        if (!n || !e) {
          t?.updateHeaderSelection !== !1 && Wa(e);
          return;
        }
        let r = t?.preferGeometry
          ? (Ra(e) ?? Va(e))
          : rn.current?.didDrag || on.current
            ? (Ba(e) ?? Ra(e) ?? Va(e))
            : Va(e);
        if (!r) {
          t?.updateHeaderSelection !== !1 && Wa(e);
          return;
        }
        ((n.style.left = `${r.left}px`),
          (n.style.top = `${r.top}px`),
          (n.style.width = `${r.width}px`),
          (n.style.height = `${r.height}px`),
          (n.style.opacity = `1`),
          (n.style.visibility = `visible`));
        let i = gt.current;
        (i &&
          ((i.style.left = `${r.left + r.width - 4 * J}px`),
          (i.style.top = `${r.top + r.height - 4 * J}px`)),
          t?.updateHeaderSelection !== !1 && Wa(e));
      },
      [Wa, Ba, Ra, Va, J],
    ),
    Ja = G.useCallback(
      (e: any, t: any) => {
        let n = pt.current;
        if (!n) return;
        let r = Ia(e) ?? Va(t);
        if (!r) {
          Wa(t);
          return;
        }
        ((n.style.left = `${r.left}px`),
          (n.style.top = `${r.top}px`),
          (n.style.width = `${r.width}px`),
          (n.style.height = `${r.height}px`),
          (n.style.opacity = `1`),
          (n.style.visibility = `visible`));
        let i = gt.current;
        (i &&
          ((i.style.left = `${r.left + r.width - 4 * J}px`),
          (i.style.top = `${r.top + r.height - 4 * J}px`)),
          Wa(t));
      },
      [Wa, Ia, Va, J],
    ),
    Ya = G.useCallback(
      (e: any) => {
        let t = ht.current;
        if (!t || !e || At.current || rn.current || on.current) {
          t && ((t.style.opacity = `0`), (t.style.visibility = `hidden`));
          return;
        }
        let n = sa(e.row, e.col),
          r =
            n.validation?.validationType === `list` && n.validation.showDropdown
              ? Va({ start: e, end: e })
              : null;
        if (!r) {
          ((t.style.opacity = `0`), (t.style.visibility = `hidden`));
          return;
        }
        ((t.style.left = `${r.left + r.width - 16 * J}px`),
          (t.style.top = `${r.top + r.height / 2}px`),
          (t.style.opacity = `1`),
          (t.style.visibility = `visible`));
      },
      [sa, Va, J],
    ),
    Xa = G.useCallback(
      (e: any) => {
        Ye.current = !0;
        let t = cg(e);
        (kt.current &&
          pg(kt.current, t) &&
          ug(wt.current, t.end) &&
          Tt.current === null &&
          Et.current === null) ||
          ((Dt.current = t),
          Ot.current === null &&
            (Ot.current = window.requestAnimationFrame(() => {
              Ot.current = null;
              let e = Dt.current;
              ((Dt.current = null),
                e &&
                  ((kt.current &&
                    pg(kt.current, e) &&
                    ug(wt.current, e.end) &&
                    Tt.current === null &&
                    Et.current === null) ||
                    Xi(() => {
                      ke(e);
                    })));
            })));
      },
      [ke, Xi],
    );
  G.useCallback(() => {
    qt.current && qa(qt.current);
  }, [qa]);
  let Za = G.useCallback((e: any, t: any) => {
    let n = Ke.current,
      r = n?.getBoundingClientRect();
    return !n || !r
      ? null
      : e === `column`
        ? n.scrollLeft + (t - r.left)
        : n.scrollTop + (t - r.top);
  }, []);
  G.useEffect(() => {
    function e(e: any) {
      let t = en.current;
      if (!t) return;
      let n =
        t.type === `column`
          ? Math.max(_r / 2, t.initialPx + (e.clientX - t.startPosition))
          : Math.max(gr / 1.5, t.initialPx + (e.clientY - t.startPosition));
      ((nn.current = { actualIndex: t.actualIndex, size: n, type: t.type }),
        tn.current === null &&
          (tn.current = window.requestAnimationFrame(() => {
            tn.current = null;
            let t = nn.current;
            if (!t) return;
            if (t.type === `column`) {
              ((St.current = { actualIndex: t.actualIndex, size: t.size }),
                (Ct.current = null),
                qt.current && qa(qt.current, { preferGeometry: !0, updateHeaderSelection: !1 }));
              let n = Za(`column`, e.clientX);
              (Un(n === null ? null : { position: n, type: `column` }), Dr(`col-resize`));
              return;
            }
            ((Ct.current = { actualIndex: t.actualIndex, size: t.size }),
              (St.current = null),
              qt.current && qa(qt.current, { preferGeometry: !0, updateHeaderSelection: !1 }));
            let n = Za(`row`, e.clientY);
            (Un(n === null ? null : { position: n, type: `row` }), Dr(`row-resize`));
          })));
    }
    function n(e: any) {
      if (en.current?.pointerId === e.pointerId) {
        let e = en.current,
          n = nn.current;
        ((en.current = null),
          (nn.current = null),
          (St.current = null),
          (Ct.current = null),
          nr(`idle`),
          Un(null),
          Or(),
          (document.body.style.userSelect = ``),
          tn.current !== null && (window.cancelAnimationFrame(tn.current), (tn.current = null)),
          n &&
            n.actualIndex === e.actualIndex &&
            n.type === e.type &&
            (n.type === `column`
              ? t.resizeColumn(n.actualIndex, n.size / J)
              : t.resizeRow(n.actualIndex, n.size / J)));
      }
    }
    return (
      window.addEventListener(`pointermove`, e),
      window.addEventListener(`pointerup`, n),
      window.addEventListener(`pointercancel`, n),
      () => {
        (window.removeEventListener(`pointermove`, e),
          window.removeEventListener(`pointerup`, n),
          window.removeEventListener(`pointercancel`, n),
          Or(),
          tn.current !== null && (window.cancelAnimationFrame(tn.current), (tn.current = null)));
      }
    );
  }, [qa, Or, t, _r, gr, Za, Dr, J]);
  function Qa(e: any, t: any) {
    return e.axis === `row`
      ? ii === void 0 || Q === void 0
        ? null
        : cg({ start: { row: e.anchor.row, col: ii }, end: { row: t.row, col: Q } })
      : e.axis === `column`
        ? ni === void 0 || ri === void 0
          ? null
          : cg({ start: { row: ni, col: e.anchor.col }, end: { row: ri, col: t.col } })
        : cg({ start: e.anchor, end: t });
  }
  function $a(e: any, t: any) {
    let n = rn.current;
    if (!n) return;
    let r = Ii(n, e, t);
    if (!r) return;
    let i = Qa(n, r);
    !i ||
      pg(i, n.previewRange) ||
      ((n.previewRange = i), (Wn.current = i), (qt.current = i), qa(i));
  }
  function eo() {
    let e = cn.current;
    ((cn.current = null), (an.current = null), e?.());
  }
  function to() {
    let e = an.current;
    (eo(), e && !e.committedOnPointerDown && Xa(e.previewRange));
  }
  function no(e: any, t: any) {
    let n = an.current;
    n &&
      (eo(),
      (un.current = Ke.current?.getBoundingClientRect() ?? null),
      (n.didDrag = !0),
      (rn.current = n),
      (Wn.current = n.previewRange),
      (qt.current = n.previewRange),
      nr(`select`),
      (document.body.style.userSelect = `none`),
      io(n.pointerId),
      $a(e, t));
  }
  function ro(e: any, t: any) {
    let n = cn.current;
    ((cn.current = null), n?.());
    let r = t;
    try {
      r.setPointerCapture?.(e);
    } catch {}
    let i = (t: any) => {
        let n = t;
        if (n.pointerId !== e) return;
        let r = an.current;
        if (!r) return;
        let i = Math.abs(n.clientX - r.startClientX),
          a = Math.abs(n.clientY - r.startClientY);
        (i < Bm && a < Bm) || (t.preventDefault(), no(n.clientX, n.clientY));
      },
      a = (t: any) => {
        t.pointerId === e && to();
      };
    (t.addEventListener(`pointermove`, i),
      t.addEventListener(`pointerup`, a),
      t.addEventListener(`pointercancel`, a),
      (cn.current = () => {
        (t.removeEventListener(`pointermove`, i),
          t.removeEventListener(`pointerup`, a),
          t.removeEventListener(`pointercancel`, a));
        try {
          r.hasPointerCapture?.(e) && r.releasePointerCapture?.(e);
        } catch {}
      }));
  }
  function io(e: any) {
    sn.current?.();
    let t: any = null,
      n: any = null,
      r = () => {
        n = null;
        let e = t;
        if (((t = null), !e)) return;
        let r = rn.current;
        if (r) {
          if (!r.didDrag) {
            let t = Math.abs(e.x - r.startClientX),
              n = Math.abs(e.y - r.startClientY);
            if (t < Bm && n < Bm) return;
            r.didDrag = !0;
          }
          $a(e.x, e.y);
        }
      },
      i = (i: any) => {
        i.pointerId === e &&
          ((t = { x: i.clientX, y: i.clientY }),
          n === null && (n = window.requestAnimationFrame(r)));
      },
      a = (r: any) => {
        if (r.pointerId !== e) return;
        (n !== null && (window.cancelAnimationFrame(n), (n = null)), (t = null));
        let i = rn.current,
          a = i ? Ii(i, r.clientX, r.clientY) : null,
          o = i?.previewRange ?? null;
        if (
          (i?.didDrag && a && i && (o = Qa(i, a)),
          (rn.current = null),
          (un.current = null),
          o && (i?.didDrag || !i?.committedOnPointerDown))
        ) {
          if (((Wn.current = o), (qt.current = o), i?.axis === `column`)) {
            let e = cg(o);
            Ze.current = { axis: `column`, startCol: e.start.col, endCol: e.end.col };
          } else if (i?.axis === `row`) {
            let e = cg(o);
            Ze.current = { axis: `row`, startRow: e.start.row, endRow: e.end.row };
          } else Ze.current = null;
          Xa(o);
        } else o || (Wn.current = null);
        (nr(`idle`),
          (document.body.style.cursor = ``),
          (document.body.style.userSelect = ``),
          sn.current?.(),
          (sn.current = null));
      };
    (window.addEventListener(`pointermove`, i),
      window.addEventListener(`pointerup`, a),
      window.addEventListener(`pointercancel`, a),
      (sn.current = () => {
        (n !== null && (window.cancelAnimationFrame(n), (n = null)),
          (t = null),
          window.removeEventListener(`pointermove`, i),
          window.removeEventListener(`pointerup`, a),
          window.removeEventListener(`pointercancel`, a));
      }));
  }
  function ao(e: any, t: any) {
    ln.current?.();
    let n: any = null,
      r: any = null,
      i = () => {
        r = null;
        let e = n;
        if (((n = null), !e)) return;
        let t = Fi(e.x, e.y);
        t && gc(t);
      },
      a = (t: any) => {
        t.pointerId === e &&
          ((n = { x: t.clientX, y: t.clientY }),
          r === null && (r = window.requestAnimationFrame(i)));
      },
      o = (i: any) => {
        if (i.pointerId !== e) return;
        (r !== null && (window.cancelAnimationFrame(r), (r = null)), (n = null));
        let a = Fi(i.clientX, i.clientY);
        a && gc(a);
        let o = on.current?.previewRange ?? t;
        ((on.current = null),
          (un.current = null),
          nr(`idle`),
          Sn(null),
          (document.body.style.cursor = ``),
          (document.body.style.userSelect = ``),
          ne(o),
          ln.current?.(),
          (ln.current = null));
      };
    (window.addEventListener(`pointermove`, a),
      window.addEventListener(`pointerup`, o),
      window.addEventListener(`pointercancel`, o),
      (ln.current = () => {
        (r !== null && (window.cancelAnimationFrame(r), (r = null)),
          (n = null),
          window.removeEventListener(`pointermove`, a),
          window.removeEventListener(`pointerup`, o),
          window.removeEventListener(`pointercancel`, o));
      }));
  }
  (G.useLayoutEffect(() => {
    let e = Wn.current ?? ai;
    if (!e || !qe.current) {
      (Wa(null),
        pt.current && ((pt.current.style.opacity = `0`), (pt.current.style.visibility = `hidden`)));
      return;
    }
    qa(e);
  }, [Wa, qa, ai, ye]),
    G.useLayoutEffect(() => {
      Ya(T);
    }, [T, hn, ye, Ya]));
  let oo = G.useCallback(
      (e: any) => {
        Wi(e);
      },
      [Wi],
    ),
    so = G.useCallback(
      (e: any, t: any) => {
        t.hyperlink && Ui(t.hyperlink.target, t.hyperlink.location);
      },
      [Ui],
    ),
    co = G.useCallback(
      (e: any, t: any) => {
        if (e.button !== 0) return;
        (e.preventDefault(), Hi(), (Ze.current = null));
        let n =
            e.currentTarget.colSpan > 1 || e.currentTarget.rowSpan > 1
              ? (Ni(e.clientX, e.clientY) ?? t)
              : t,
          r = kt.current,
          i = e.shiftKey && r ? r.start : n,
          a = cg({ start: i, end: n }),
          o = ug(wt.current, n),
          s = !o || !At.current;
        At.current && !o && jt.current();
        let c =
            n.row === t.row && n.col === t.col
              ? Li(t, e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY)
              : Ri(n, e.clientX, e.clientY),
          l = n.row === t.row && n.col === t.col ? Ia(e.currentTarget) : Va(a);
        c &&
          (pc(e.currentTarget, e.pointerId, i, `cell`, n, c, l, s, a, e.clientX, e.clientY),
          n.row === t.row && n.col === t.col ? Ja(e.currentTarget, a) : qa(a),
          s && Xa(a));
      },
      [qa, Ja, Xa, Hi, Li, Ri, Ia, Va, Ni],
    ),
    lo = G.useCallback(
      (e: any, t: any) => {
        if (e.button !== 0 || ii === void 0 || Q === void 0) return;
        (e.preventDefault(), Hi());
        let n = kt.current,
          r = e.shiftKey && n ? n.start.row : t,
          i = cg({ start: { row: r, col: ii }, end: { row: t, col: Q } }),
          a = zi(t, e.currentTarget.getBoundingClientRect(), e.clientY);
        a &&
          (pc(
            e.currentTarget,
            e.pointerId,
            { row: r, col: ii },
            `row`,
            { row: t, col: ii },
            a,
            null,
            !0,
            i,
            e.clientX,
            e.clientY,
          ),
          (Ze.current = { axis: `row`, startRow: r, endRow: t }),
          Xa(i));
      },
      [Xa, ii, Hi, Q, zi],
    ),
    uo = G.useCallback(
      (e: any, t: any) => {
        if (e.button !== 0 || ni === void 0 || ri === void 0) return;
        (e.preventDefault(), Hi());
        let n = kt.current,
          r = e.shiftKey && n ? n.start.col : t,
          i = cg({ start: { row: ni, col: r }, end: { row: ri, col: t } }),
          a = Bi(t, e.currentTarget.getBoundingClientRect(), e.clientX);
        a &&
          (pc(
            e.currentTarget,
            e.pointerId,
            { row: ni, col: r },
            `column`,
            { row: ni, col: t },
            a,
            null,
            !0,
            i,
            e.clientX,
            e.clientY,
          ),
          (Ze.current = { axis: `column`, startCol: r, endCol: t }),
          Xa(i));
      },
      [Xa, ni, Hi, ri, Bi],
    ),
    fo = G.useCallback(
      (e: any, t: any, n: any) => {
        Ge && (e.preventDefault(), e.stopPropagation(), fc(e.pointerId, t, n, e.clientY));
      },
      [Ge],
    ),
    $ = G.useCallback(
      (e: any) => {
        let t = gv(lr, e.row, e.col),
          n = bv(t, e.row, e.col);
        if (!t || !n) return null;
        let r = Re && Re.tableName === t.name && Re.columnIndex === n.index ? Re.direction : null,
          i = r === `ascending` ? `▲` : r === `descending` ? `▼` : `▾`;
        return g
          ? g({
              cell: e,
              column: n,
              direction: r,
              sortAscending: () => U(t.name, n.index, `ascending`),
              sortDescending: () => U(t.name, n.index, `descending`),
              table: t,
              triggerIcon: i,
              triggerProps: {
                "aria-haspopup": `menu`,
                "aria-label": `Open menu for ${n.name}`,
                onClick: (e: any) => {
                  e.stopPropagation();
                },
                onPointerDown: (e: any) => {
                  e.stopPropagation();
                },
                style: Sv(p, J),
                type: `button`,
              },
            })
          : (0, K.jsx)(`button`, {
              onPointerDown: (e: any) => {
                (e.preventDefault(), e.stopPropagation());
              },
              onClick: (n: any) => {
                (n.preventDefault(),
                  n.stopPropagation(),
                  bn((n: any) =>
                    n && n.tableName === t.name && n.row === e.row && n.col === e.col
                      ? null
                      : { col: e.col, row: e.row, tableName: t.name },
                  ));
              },
              style: { ...Sv(p, J) },
              type: `button`,
              children: i,
            });
      },
      [lr, p, g, Re, U, J],
    ),
    po = G.useCallback(
      (e: any) => {
        let t = Vr.get(e);
        if (t === void 0) return null;
        let n = Rr[t] ?? _r;
        return { left: Zr.get(e) ?? X + (qr[t] ?? 0) - q.left, width: n };
      },
      [Vr, qr, _r, Rr, X, q.left, Zr],
    ),
    mo = G.useCallback(
      (e: any) => {
        let t = Br.get(e);
        return t === void 0
          ? null
          : { height: zr[t] ?? gr, top: Xr.get(e) ?? Y + (Kr[t] ?? 0) - q.top };
      },
      [gr, zr, Y, q.top, Br, Kr, Xr],
    ),
    ho = Math.max(0, q.width - $r),
    go = Math.max(0, q.height - Qr),
    _o = Math.min(Gm, ho),
    vo = Math.min(Gm, go),
    yo = $r - _o,
    bo = Qr - vo,
    xo = ho + _o * 2,
    So = go + vo * 2,
    Co = xo,
    wo = Math.max(0, Qr - Y),
    To = Math.max(0, $r - X),
    Eo = So,
    Do = To,
    Oo = wo,
    ko = To,
    Ao = xo,
    jo = wo,
    Mo = So,
    No = G.useMemo(
      () =>
        va.flatMap((e: any) => {
          let t = po(e.actualCol);
          if (!t) return [];
          let n = Zr.has(e.actualCol);
          return [
            {
              actualCol: e.actualCol,
              height: Y,
              isFrozen: n,
              left: t.left,
              localLeft: t.left - (n ? X : yo),
              width: t.width,
            },
          ];
        }),
      [va, Y, X, po, yo, Zr],
    ),
    Po = G.useMemo(
      () =>
        _a.flatMap((e: any) => {
          let t = mo(e.actualRow);
          if (!t) return [];
          let n = Xr.has(e.actualRow);
          return [
            {
              actualRow: e.actualRow,
              height: t.height,
              isFrozen: n,
              localTop: t.top - (n ? Y : bo),
              top: t.top,
            },
          ];
        }),
      [_a, Y, mo, bo, Xr],
    ),
    Fo = G.useCallback(
      (e: any) => {
        if (!Ge) return null;
        let t = Ke.current?.getBoundingClientRect();
        if (!t) return null;
        let n = e - t.left;
        for (let e of No)
          if (Math.abs(n - (e.left + e.width)) <= Um)
            return { actualCol: e.actualCol, width: e.width };
        return null;
      },
      [Ge, No],
    ),
    Io = G.useCallback(
      (e: any) => {
        let t = Ke.current?.getBoundingClientRect();
        if (!t) return null;
        let n = e - t.left;
        for (let e of No) if (n >= e.left && n <= e.left + e.width) return e.actualCol;
        return null;
      },
      [No],
    ),
    Lo = G.useCallback(
      (e: any) => {
        if (!Ge) return null;
        let t = Ke.current?.getBoundingClientRect();
        if (!t) return null;
        let n = e - t.top;
        for (let e of Po)
          if (Math.abs(n - (e.top + e.height)) <= Um)
            return { actualRow: e.actualRow, height: e.height };
        return null;
      },
      [Ge, Po],
    ),
    Ro = G.useCallback(
      (e: any) => {
        let t = Ke.current?.getBoundingClientRect();
        if (!t) return null;
        let n = e - t.top;
        for (let e of Po) if (n >= e.top && n <= e.top + e.height) return e.actualRow;
        return null;
      },
      [Po],
    ),
    zo = G.useCallback(
      (e: any) => {
        if (en.current?.type === `column`) {
          e.currentTarget.style.cursor = `col-resize`;
          return;
        }
        e.currentTarget.style.cursor = Fo(e.clientX) ? `col-resize` : `default`;
      },
      [Fo],
    ),
    Bo = G.useCallback(
      (e: any) => {
        if (en.current?.type === `row`) {
          e.currentTarget.style.cursor = `row-resize`;
          return;
        }
        e.currentTarget.style.cursor = Lo(e.clientY) ? `row-resize` : `default`;
      },
      [Lo],
    ),
    Vo = G.useCallback((e: any) => {
      if (en.current) {
        e.currentTarget.style.cursor = en.current.type === `column` ? `col-resize` : `row-resize`;
        return;
      }
      e.currentTarget.style.cursor = `default`;
    }, []),
    Ho = G.useCallback(
      (e: any) => {
        if (e.button !== 0) return;
        let t = Fi(e.clientX, e.clientY);
        if (!t) return;
        (e.preventDefault(), Hi(), (Ze.current = null));
        let n = kt.current,
          r = e.shiftKey && n ? n.start : t,
          i = cg({ start: r, end: t }),
          a = ug(wt.current, t),
          o = !a || !At.current;
        At.current && !a && jt.current();
        let s = Br.get(t.row),
          c = Vr.get(t.col);
        s === void 0 ||
          c === void 0 ||
          (pc(
            e.currentTarget,
            e.pointerId,
            r,
            `cell`,
            t,
            {
              contentScaleX: 1,
              contentScaleY: 1,
              originContentX: qr[c] ?? 0,
              originContentY: Kr[s] ?? 0,
            },
            Va(i),
            o,
            i,
            e.clientX,
            e.clientY,
          ),
          qa(i),
          o && Xa(i));
      },
      [qa, Vr, qr, Xa, Hi, Va, Fi, Br, Kr, pc],
    ),
    Uo = G.useCallback(
      (e: any) => {
        let t = Fi(e.clientX, e.clientY);
        t && so(t, sa(t.row, t.col));
      },
      [sa, so, Fi],
    ),
    Wo = G.useCallback(
      (e: any) => {
        if (H) return;
        let t = Fi(e.clientX, e.clientY);
        t && Wi(t);
      },
      [H, Fi, Wi],
    ),
    Go = G.useCallback(
      (e: any) => {
        if (e.button !== 0 || ni === void 0 || ri === void 0) return;
        let t = Fo(e.clientX);
        if (t) {
          (e.preventDefault(),
            e.stopPropagation(),
            uc(e.pointerId, t.actualCol, t.width, e.clientX));
          return;
        }
        let n = Io(e.clientX);
        if (n === null) return;
        (e.preventDefault(), Hi());
        let r = kt.current,
          i = e.shiftKey && r ? r.start.col : n,
          a = cg({ start: { row: ni, col: i }, end: { row: ri, col: n } }),
          o = Vr.get(i);
        o !== void 0 &&
          (pc(
            e.currentTarget,
            e.pointerId,
            { row: ni, col: i },
            `column`,
            { row: ni, col: n },
            {
              contentScaleX: 1,
              contentScaleY: 1,
              originContentX: qr[o] ?? 0,
              originContentY: Kr[0] ?? 0,
            },
            null,
            !0,
            a,
            e.clientX,
            e.clientY,
          ),
          (Ze.current = { axis: `column`, startCol: i, endCol: n }),
          Xa(a));
      },
      [Vr, qr, Xa, ni, Hi, ri, Io, Fo, Kr, pc],
    ),
    Ko = G.useCallback(
      (e: any) => {
        if (e.button !== 0 || ii === void 0 || Q === void 0) return;
        let t = Lo(e.clientY);
        if (t) {
          (e.preventDefault(),
            e.stopPropagation(),
            fc(e.pointerId, t.actualRow, t.height, e.clientY));
          return;
        }
        let n = Ro(e.clientY);
        if (n === null) return;
        (e.preventDefault(), Hi());
        let r = kt.current,
          i = e.shiftKey && r ? r.start.row : n,
          a = cg({ start: { row: i, col: ii }, end: { row: n, col: Q } }),
          o = Br.get(i);
        o !== void 0 &&
          (pc(
            e.currentTarget,
            e.pointerId,
            { row: i, col: ii },
            `row`,
            { row: n, col: ii },
            {
              contentScaleX: 1,
              contentScaleY: 1,
              originContentX: qr[0] ?? 0,
              originContentY: Kr[o] ?? 0,
            },
            null,
            !0,
            a,
            e.clientX,
            e.clientY,
          ),
          (Ze.current = { axis: `row`, startRow: i, endRow: n }),
          Xa(a));
      },
      [qr, Xa, ii, Hi, Q, Ro, Lo, Br, Kr, pc],
    ),
    qo = G.useCallback((e: any) => {
      if (typeof Image > `u`) return null;
      let t = e.id,
        n = ft.current.get(t);
      if (n && n.src === e.src) return n.loaded && !n.failed ? n.image : null;
      let r = new Image(),
        i = { failed: !1, image: r, loaded: !1, src: e.src };
      return (
        ft.current.set(t, i),
        (r.onload = () => {
          ((i.loaded = !0), On((e: any) => e + 1));
        }),
        (r.onerror = () => {
          ((i.failed = !0), On((e: any) => e + 1));
        }),
        (r.src = e.src),
        null
      );
    }, []);
  G.useLayoutEffect(() => {
    if (!y) return;
    let e = typeof window < `u` ? window.__xlsxCanvasProfile : void 0,
      t = e ? performance.now() : 0,
      n = 0,
      r = 0,
      i = 0,
      a = 0,
      o = 0,
      s = 0,
      c = typeof window > `u` ? 1 : Math.max(1, window.devicePixelRatio || 1);
    function l(e: any, t: any, n: any, r?: any) {
      if (!e) return null;
      let i = Math.max(1, Math.round(t * c)),
        a = Math.max(1, Math.round(n * c));
      (e.width !== i && (e.width = i),
        e.height !== a && (e.height = a),
        e.style.width !== `${t}px` && (e.style.width = `${t}px`),
        e.style.height !== `${n}px` && (e.style.height = `${n}px`));
      let o = e.getContext(`2d`, { alpha: !1 });
      return o
        ? (o.setTransform(c, 0, 0, c, 0, 0), r?.clear !== !1 && o.clearRect(0, 0, t, n), o)
        : null;
    }
    let u = Math.max(0, q.width),
      d = Math.max(0, q.height),
      f = Math.min(Y, d),
      m = Math.min(X, u),
      h = Wn.current ?? ai,
      g = h ? cg(h) : null,
      _ = xg(g),
      v = {
        activeSheet: E ?? null,
        bakedDrawingSignature: Fa,
        bodyHeight: d,
        bodyWidth: u,
        colSignature: bg(va, (e: any) => e.index),
        getCellData: sa,
        headerHeight: f,
        palette: p,
        rowHeaderWidth: m,
        rowSignature: bg(_a, (e: any) => e.index),
        viewportLeft: q.left,
        viewportTop: q.top,
        zoomFactor: J,
      },
      b = {
        activeSheet: E ?? null,
        bodyHeight: d,
        bodyWidth: u,
        colSignature: v.colSignature,
        headerHeight: f,
        palette: p,
        rangeSignature: _,
        rowHeaderWidth: m,
        rowSignature: v.rowSignature,
        viewportLeft: q.left,
        viewportTop: q.top,
        zoomFactor: J,
      },
      x = Mn.current,
      S = Nn.current,
      C = jn.current,
      T = !(
        x &&
        x.activeSheet === v.activeSheet &&
        x.bakedDrawingSignature === v.bakedDrawingSignature &&
        x.bodyHeight === v.bodyHeight &&
        x.bodyWidth === v.bodyWidth &&
        x.colSignature === v.colSignature &&
        x.getCellData === v.getCellData &&
        x.headerHeight === v.headerHeight &&
        x.palette === v.palette &&
        x.rowHeaderWidth === v.rowHeaderWidth &&
        x.rowSignature === v.rowSignature &&
        x.viewportLeft === v.viewportLeft &&
        x.viewportTop === v.viewportTop &&
        x.zoomFactor === v.zoomFactor
      ),
      D = !(
        S &&
        S.activeSheet === b.activeSheet &&
        S.bodyHeight === b.bodyHeight &&
        S.bodyWidth === b.bodyWidth &&
        S.colSignature === b.colSignature &&
        S.headerHeight === b.headerHeight &&
        S.palette === b.palette &&
        S.rangeSignature === b.rangeSignature &&
        S.rowHeaderWidth === b.rowHeaderWidth &&
        S.rowSignature === b.rowSignature &&
        S.viewportLeft === b.viewportLeft &&
        S.viewportTop === b.viewportTop &&
        S.zoomFactor === b.zoomFactor
      ),
      O = !!(
        T &&
        x &&
        x.activeSheet === v.activeSheet &&
        x.bakedDrawingSignature === v.bakedDrawingSignature &&
        x.bodyHeight === v.bodyHeight &&
        x.bodyWidth === v.bodyWidth &&
        x.getCellData === v.getCellData &&
        x.headerHeight === v.headerHeight &&
        x.palette === v.palette &&
        x.rowHeaderWidth === v.rowHeaderWidth &&
        x.zoomFactor === v.zoomFactor
      ),
      k = !!(
        D &&
        S &&
        S.activeSheet === b.activeSheet &&
        S.bodyHeight === b.bodyHeight &&
        S.bodyWidth === b.bodyWidth &&
        S.headerHeight === b.headerHeight &&
        S.palette === b.palette &&
        S.rangeSignature === b.rangeSignature &&
        S.rowHeaderWidth === b.rowHeaderWidth &&
        S.zoomFactor === b.zoomFactor
      ),
      A = !!(
        D &&
        S &&
        S.activeSheet === b.activeSheet &&
        S.bodyHeight === b.bodyHeight &&
        S.bodyWidth === b.bodyWidth &&
        S.headerHeight === b.headerHeight &&
        S.palette === b.palette &&
        S.rangeSignature === b.rangeSignature &&
        S.rowHeaderWidth === b.rowHeaderWidth &&
        S.zoomFactor === b.zoomFactor
      );
    if (!T && !D) return;
    let j: Record<string, any> = {
        corner: { height: Oo, left: X, top: Y, width: Do },
        left: { height: Eo, left: X, top: bo, width: To },
        scroll: { height: So, left: yo, top: bo, width: xo },
        top: { height: wo, left: yo, top: Y, width: Co },
      },
      M: Record<string, any> = T
        ? {
            corner: l(tt.current, Do, Oo, { clear: !O }),
            left: l(et.current, To, Eo, { clear: !O }),
            scroll: l(Qe.current, xo, So, { clear: !O }),
            top: l($e.current, Co, wo, { clear: !O }),
          }
        : { corner: null, left: null, scroll: null, top: null },
      N = D
        ? { frozen: l(rt.current, ko, f), scroll: l(it.current, Ao, f, { clear: !k }) }
        : { frozen: null, scroll: null },
      P = D
        ? { frozen: l(at.current, m, jo), scroll: l(ot.current, m, Mo, { clear: !A }) }
        : { frozen: null, scroll: null },
      F = D ? l(st.current, m, f) : null;
    if (
      (T && (!M.scroll || !M.top || !M.left || !M.corner)) ||
      (D &&
        (!F ||
          (ko > 0 && !N.frozen) ||
          (Ao > 0 && !N.scroll) ||
          (jo > 0 && !P.frozen) ||
          (Mo > 0 && !P.scroll)))
    )
      return;
    let I = E?.showGridLines ?? !0,
      ee = sg(E, p),
      L: Record<string, any[]> = { corner: [], left: [], scroll: [], top: [] },
      te: Record<string, any[]> = { corner: [], left: [], scroll: [], top: [] },
      ne = Lv(Ao, f),
      re = Lv(m, Mo),
      R = Da
        ? [
            ...ka.map(({ rect: e, shape: t }: any) => ({
              kind: `shape`,
              rect: e,
              shape: t,
              zIndex: t.zIndex,
            })),
            ...Ma.map(({ image: e, rect: t }: any) => ({
              image: e,
              kind: `image`,
              rect: t,
              zIndex: e.zIndex,
            })),
          ].sort((e: any, t: any) => e.zIndex - t.zIndex)
        : [],
      ie = (e: any, t: any) => {
        let n = j[t],
          r = t === `scroll` || t === `top` ? q.left : 0,
          i = t === `scroll` || t === `left` ? q.top : 0;
        return {
          height: e.height,
          left: e.left - r - n.left,
          top: e.top - i - n.top,
          width: e.width,
        };
      },
      z = (e: any, t: any, n: any, r: any, i: any, a: any) => {
        if (t.paragraphs.length === 0) return;
        let o = t.textBox?.insetPx,
          s = (o?.left ?? 6) * J,
          c = (o?.right ?? 6) * J,
          l = (o?.top ?? 4) * J,
          u = (o?.bottom ?? 4) * J,
          d = n + s,
          f = r + l,
          p = Math.max(0, i - s - c),
          m = Math.max(0, a - l - u);
        if (p <= 0 || m <= 0) return;
        let h = t.paragraphs.map((t: any) => ({
            lineHeight: Math.max(
              12 * J,
              ...t.runs.map((e: any) => (((e.fontSizePt ?? 11) * 96) / 72) * J * 1.2),
            ),
            widthPx: t.runs.reduce((t: any, n: any) => {
              let r = (((n.fontSizePt ?? 11) * 96) / 72) * J;
              return (
                (e.font = `${n.italic ? `italic ` : ``}${n.bold ? `700 ` : `400 `}${r}px ${n.fontFamily ?? `Calibri, sans-serif`}`),
                t + xh(e, n.text)
              );
            }, 0),
          })),
          g = h.reduce((e: any, t: any) => e + t.lineHeight, 0),
          _ = f;
        (t.textBox?.verticalAlign === `middle`
          ? (_ = f + Math.max(0, (m - g) / 2))
          : t.textBox?.verticalAlign === `bottom` && (_ = f + Math.max(0, m - g)),
          e.save(),
          e.beginPath(),
          e.rect(d, f, p, m),
          e.clip(),
          (e.textBaseline = `middle`),
          t.paragraphs.forEach((n: any, r: any) => {
            let i = h[r] ?? { lineHeight: 14 * J, widthPx: 0 },
              a = d,
              o = n.align ?? t.textBox?.horizontalAlign ?? `left`;
            (o === `center`
              ? (a = d + Math.max(0, (p - i.widthPx) / 2))
              : o === `right` && (a = d + Math.max(0, p - i.widthPx)),
              n.runs.forEach((t: any) => {
                let n = (((t.fontSizePt ?? 11) * 96) / 72) * J;
                ((e.font = `${t.italic ? `italic ` : ``}${t.bold ? `700 ` : `400 `}${n}px ${t.fontFamily ?? `Calibri, sans-serif`}`),
                  (e.fillStyle = t.color ?? `#000000`),
                  (e.textAlign = `left`));
                let r = _ + i.lineHeight / 2;
                if ((e.fillText(t.text, a, r), t.underline && t.text.length > 0)) {
                  let i = xh(e, t.text);
                  ((e.strokeStyle = t.color ?? `#000000`),
                    (e.lineWidth = Math.max(1, J * 0.75)),
                    e.beginPath(),
                    e.moveTo(a, r + Math.max(2, n * 0.28)),
                    e.lineTo(a + i, r + Math.max(2, n * 0.28)),
                    e.stroke());
                }
                a += xh(e, t.text);
              }),
              (_ += i.lineHeight));
          }),
          e.restore());
      },
      ae = (e: any, t: any, n: any) => {
        let r = t.fill?.none ? `transparent` : (t.fill?.color ?? `transparent`),
          i = t.stroke?.none ? `transparent` : (t.stroke?.color ?? `transparent`),
          a = Math.max(0, (t.stroke?.widthPx ?? (t.geometry === `line` ? 2 : 1)) * J),
          o = __(t),
          s = Math.min(t.fill?.opacity ?? 1, t.stroke?.opacity ?? 1);
        (e.save(),
          e.translate(n.left + n.width / 2, n.top + n.height / 2),
          t.rotationDeg && e.rotate((t.rotationDeg * Math.PI) / 180),
          e.scale(t.flipH ? -1 : 1, t.flipV ? -1 : 1),
          (e.globalAlpha *= s),
          (e.lineWidth = a),
          (e.strokeStyle = i),
          (e.fillStyle = r),
          y_(e, t.stroke?.dash, a));
        let c = -n.width / 2,
          l = -n.height / 2;
        if (o && typeof Path2D < `u`) {
          (e.save(),
            e.translate(c, l),
            e.scale(
              n.width / Math.max(1, o.viewBox.width),
              n.height / Math.max(1, o.viewBox.height),
            ));
          let t = Ch(o.path);
          if (!t) {
            (e.restore(), e.restore());
            return;
          }
          (r !== `transparent` && e.fill(t),
            i !== `transparent` && a > 0 && e.stroke(t),
            e.restore());
        } else if (t.geometry === `ellipse`)
          (e.beginPath(),
            e.ellipse(0, 0, n.width / 2, n.height / 2, 0, 0, Math.PI * 2),
            r !== `transparent` && e.fill(),
            i !== `transparent` && a > 0 && e.stroke());
        else {
          let o = t.geometry === `roundRect` ? 12 * J : 0;
          (v_(e, c, l, n.width, n.height, o),
            r !== `transparent` && e.fill(),
            i !== `transparent` && a > 0 && e.stroke());
        }
        (z(e, t, c, l, n.width, n.height), e.restore());
      },
      oe = (e: any, t: any, n: any) => {
        if (!(R.length === 0 || n.length === 0))
          for (let r of R) {
            if (Us(r.rect) !== e) continue;
            let i = ie(r.rect, e);
            if (!(
              i.left + i.width < 0 ||
              i.top + i.height < 0 ||
              i.left > j[e].width ||
              i.top > j[e].height ||
              !Rv(i.left, i.top, i.width, i.height, n)
            ))
              if (r.kind === `shape`) ae(t, r.shape, i);
              else {
                let e = qo(r.image);
                e && t.drawImage(e, i.left, i.top, i.width, i.height);
              }
          }
      },
      B = [`scroll`, `top`, `left`, `corner`];
    if (T) {
      n = e ? performance.now() : 0;
      for (let e of Object.keys(M)) {
        let t = M[e],
          n = j[e];
        if (!t || n.width <= 0 || n.height <= 0) continue;
        let r = Lv(n.width, n.height);
        if (O) {
          let i = kr(e),
            a = e === `scroll` || e === `top` ? q.left - C.left : 0,
            o = e === `scroll` || e === `left` ? q.top - C.top : 0;
          if (i) {
            let s = zv(
              e === `corner`
                ? tt.current
                : e === `left`
                  ? et.current
                  : e === `top`
                    ? $e.current
                    : Qe.current,
              t,
              i,
              c,
              n.width,
              n.height,
              a,
              o,
            );
            s && (r = s);
          }
        } else t.clearRect(0, 0, n.width, n.height);
        if (((te[e] = r), (a += r.length), r.length !== 0)) {
          t.fillStyle = ee;
          for (let e of r) t.fillRect(e.left, e.top, e.width, e.height);
        }
      }
      for (let e of B) {
        let t = M[e],
          n = j[e],
          r = te[e],
          a = ya[e];
        if (
          !t ||
          r.length === 0 ||
          n.width <= 0 ||
          n.height <= 0 ||
          a.rows.length === 0 ||
          a.cols.length === 0
        )
          continue;
        let c = !1,
          l = () => {
            c ||= (t.beginPath(), !0);
          },
          u = () => {
            c &&= ((t.strokeStyle = p.border), (t.lineWidth = 1), t.stroke(), !1);
          },
          d = new Set();
        for (let c of a.rows)
          for (let f of a.cols) {
            let a = { row: c.actualRow, col: f.actualCol },
              m = or(a),
              h = `${m.row}:${m.col}`,
              g = m,
              _ = Br.get(g.row),
              v = Vr.get(g.col);
            if (_ === void 0 || v === void 0) continue;
            let y = X + (qr[v] ?? 0),
              b = Y + (Kr[_] ?? 0),
              x = e === `left` || e === `corner`,
              S = e === `top` || e === `corner`,
              C = {
                height: zr[_] ?? c.size,
                left: (x ? (Zr.get(g.col) ?? y - q.left) : y - q.left) - n.left,
                top: (S ? (Xr.get(g.row) ?? b - q.top) : b - q.top) - n.top,
                width: Rr[v] ?? f.size,
              };
            if (
              !(m.row !== a.row || m.col !== a.col) &&
              !Rv(C.left - Jm, C.top - Jm, C.width + Jm * 2, C.height + Jm * 2, r)
            ) {
              i += 1;
              continue;
            }
            o += 1;
            let w = sa(g.row, g.col);
            if (((w.colSpan || w.rowSpan) && d.has(h)) || w.isMergedSecondary) continue;
            (w.colSpan || w.rowSpan) && d.add(h);
            let T = w.colSpan || w.rowSpan ? Ha(g) : null,
              E = T?.left ?? y,
              D = T?.top ?? b,
              O = {
                height: T?.height ?? zr[_] ?? c.size,
                left: (x ? (Zr.get(g.col) ?? E - q.left) : E - q.left) - n.left,
                top: (S ? (Xr.get(g.row) ?? D - q.top) : D - q.top) - n.top,
                width: T?.width ?? Rr[v] ?? f.size,
              },
              k = Math.max(O.width, w.spillWidth ?? 0);
            if (O.left + k < 0 || O.top + O.height < 0 || O.left > n.width || O.top > n.height)
              continue;
            if (!Rv(O.left, O.top, k, O.height, r)) {
              i += 1;
              continue;
            }
            s += 1;
            let A = w.style,
              j = w.canvas ?? Hh(A),
              M =
                w.conditionalColorScale?.color ??
                (typeof A.backgroundColor == `string` ? A.backgroundColor : ee),
              N =
                !w.conditionalColorScale && typeof A.backgroundImage == `string`
                  ? Gh(t, O, A.backgroundImage)
                  : null;
            if (
              (w.chartHighlight && u(),
              (t.fillStyle = N ?? M),
              t.fillRect(O.left, O.top, O.width, O.height),
              w.chartHighlight &&
                ((t.fillStyle = w.chartHighlight.fillColor),
                t.fillRect(
                  O.left + 1,
                  O.top + 1,
                  Math.max(0, O.width - 2),
                  Math.max(0, O.height - 2),
                )),
              w.conditionalDataBar)
            ) {
              let e = O.left + 4 * J,
                n = O.top + 4 * J,
                r = Math.max(0, (O.width - 8 * J) * (w.conditionalDataBar.widthPercent / 100)),
                i = Math.max(0, O.height - 8 * J);
              r > 0 &&
                i > 0 &&
                ((t.fillStyle = Kh(t, e, n, r, i, w.conditionalDataBar)),
                t.fillRect(e, n, r, i),
                w.conditionalDataBar.border !== !1 &&
                  w.conditionalDataBar.borderColor &&
                  ((t.strokeStyle = w.conditionalDataBar.borderColor),
                  (t.lineWidth = 1),
                  t.strokeRect(e + 0.5, n + 0.5, Math.max(0, r - 1), Math.max(0, i - 1))));
            }
            let P = j.topBorder,
              F = j.rightBorder,
              te = j.bottomBorder,
              ne = j.leftBorder,
              re = Z[v + Math.max(1, w.colSpan ?? 1)],
              R = re === void 0 ? null : sa(g.row, re),
              ie = R?.isMergedSecondary ? null : (R?.canvas?.leftBorder ?? jh(R?.style.borderLeft)),
              z = jr[_ + Math.max(1, w.rowSpan ?? 1)],
              ae = z === void 0 ? null : sa(z, g.col),
              oe = ae?.isMergedSecondary
                ? null
                : (ae?.canvas?.topBorder ?? jh(ae?.style.borderTop)),
              B = Nh(F, ie),
              se = Nh(te, oe);
            if (
              (I &&
                (!B || !se) &&
                (l(),
                B ||
                  (t.moveTo(O.left + O.width - 0.5, O.top),
                  t.lineTo(O.left + O.width - 0.5, O.top + O.height)),
                se ||
                  (t.moveTo(O.left, O.top + O.height - 0.5),
                  t.lineTo(O.left + O.width, O.top + O.height - 0.5))),
              (P || B || se || ne || w.chartHighlight) && u(),
              P && _ === 0 && Fh(t, `top`, O, P),
              B && Fh(t, `right`, O, B),
              se && Fh(t, `bottom`, O, se),
              ne && v === 0 && Fh(t, `left`, O, ne),
              w.chartHighlight)
            ) {
              let e = {
                color: w.chartHighlight.strokeColor,
                style: `solid`,
                width: Math.max(1, J),
              };
              (w.chartHighlight.borderTop && Fh(t, `top`, O, e),
                w.chartHighlight.borderRight && Fh(t, `right`, O, e),
                w.chartHighlight.borderBottom && Fh(t, `bottom`, O, e),
                w.chartHighlight.borderLeft && Fh(t, `left`, O, e));
            }
            let ce = w.value ?? ``;
            if (!(
              w.checkboxState != null ||
              w.sparkline ||
              ce.length > 0 ||
              w.conditionalIcon ||
              w.isTableHeader
            ))
              continue;
            let le = j.padding,
              ue = O.left + le.left,
              de = O.top + le.top,
              fe = Math.max(0, O.width - le.left - le.right),
              pe = Math.max(0, O.height - le.top - le.bottom);
            if (fe <= 0 || pe <= 0) continue;
            let me = w.shrinkToFitFontSizePx ?? Lh(A, 12 * J),
              he = Math.max(1, J * 1.5, me * (w.textRotationDeg ? 0.75 : 0.18));
            if (
              (u(),
              t.save(),
              t.beginPath(),
              t.rect(ue - he, de - he, fe + he * 2, pe + he * 2),
              t.clip(),
              (t.font = w.shrinkToFitFontSizePx ? Ah(A, w.shrinkToFitFontSizePx) : j.baseFont),
              (t.fillStyle = j.textColor),
              (t.textBaseline = `middle`),
              w.checkboxState != null)
            ) {
              let e = Math.min(14 * J, fe, pe),
                n = O.left + (O.width - e) / 2,
                r = O.top + (O.height - e) / 2;
              ((t.strokeStyle = M_(p) ? `#cbd5e1` : `#475569`),
                (t.lineWidth = 1.25),
                t.strokeRect(n, r, e, e),
                w.checkboxState &&
                  ((t.fillStyle = M_(p) ? `#60a5fa` : `#2563eb`),
                  t.fillRect(n + 1.5, r + 1.5, Math.max(0, e - 3), Math.max(0, e - 3)),
                  (t.strokeStyle = M_(p) ? `#020617` : `#ffffff`),
                  (t.lineWidth = 1.5),
                  t.beginPath(),
                  t.moveTo(n + e * 0.24, r + e * 0.56),
                  t.lineTo(n + e * 0.45, r + e * 0.76),
                  t.lineTo(n + e * 0.8, r + e * 0.3),
                  t.stroke()));
            } else if (w.sparkline) {
              let e = w.sparkline.config,
                n = w.sparkline.values
                  .map((e: any, t: any) => ({ index: t, value: e }))
                  .filter((e: any) => typeof e.value == `number` && Number.isFinite(e.value));
              if (n.length > 0) {
                let r = e.negativeColor ?? `#c2410c`,
                  i = e.color ?? `#2563eb`,
                  a = e.markerColor ?? i,
                  o = ue + 1,
                  s = de + 2,
                  c = Math.max(1, fe - 2),
                  l = Math.max(1, pe - 4);
                if (e.type === `winLoss`) {
                  let e = n.map((e: any) => ({ ...e, value: e.value >= 0 ? 1 : -1 })),
                    r = Math.max(4 * J, c / Math.max(e.length * 1.9, 1)),
                    a = e.length > 1 ? (c - r * e.length) / (e.length - 1) : 0,
                    u = s + Math.max(1.5 * J, l * 0.18),
                    d = s + l - Math.max(1.5 * J, l * 0.18);
                  ((t.strokeStyle = i),
                    (t.lineCap = `round`),
                    (t.lineWidth = Math.max(1.5, 1.8 * J)),
                    e.forEach((e: any, n: any) => {
                      let i = o + n * (r + Math.max(0, a)),
                        s = e.value >= 0 ? u : d;
                      (t.beginPath(), t.moveTo(i, s), t.lineTo(i + r, s), t.stroke());
                    }));
                } else if (e.type === `column`) {
                  let e = Math.min(0, ...n.map((e: any) => e.value)),
                    a = Math.max(0, ...n.map((e: any) => e.value)),
                    u = s + l - cv(0, e, a) * l,
                    d = Math.max(2 * J, c / Math.max(n.length * 1.8, 1)),
                    f = n.length > 1 ? (c - d * n.length) / (n.length - 1) : 0;
                  ((t.strokeStyle = p.border),
                    (t.lineWidth = 1),
                    t.beginPath(),
                    t.moveTo(o, u),
                    t.lineTo(o + c, u),
                    t.stroke(),
                    n.forEach((n: any, c: any) => {
                      let p = o + c * (d + Math.max(0, f)),
                        m = s + l - cv(n.value, e, a) * l,
                        h = Math.min(m, u),
                        g = Math.max(1, Math.abs(m - u));
                      ((t.fillStyle = n.value < 0 ? r : i), t.fillRect(p, h, d, g));
                    }));
                } else if (n.length > 1) {
                  let r = Math.min(...n.map((e: any) => e.value)),
                    u = Math.max(...n.map((e: any) => e.value)),
                    d = n.length > 1 ? c / (n.length - 1) : 0;
                  if (
                    ((t.strokeStyle = i),
                    (t.lineCap = `round`),
                    (t.lineJoin = `round`),
                    (t.lineWidth = Math.max(1.2, 1.6 * J)),
                    t.beginPath(),
                    n.forEach((e: any, n: any) => {
                      let i = o + n * d,
                        a = s + l - cv(e.value, r, u) * l;
                      n === 0 ? t.moveTo(i, a) : t.lineTo(i, a);
                    }),
                    t.stroke(),
                    e.markers)
                  ) {
                    let i = Math.max(...n.map((e: any) => e.value)),
                      c = Math.min(...n.map((e: any) => e.value));
                    n.forEach((f: any, p: any) => {
                      let m = o + p * d,
                        h = s + l - cv(f.value, r, u) * l,
                        g = a;
                      (f.value === i && e.highColor
                        ? (g = e.highColor)
                        : f.value === c && e.lowColor
                          ? (g = e.lowColor)
                          : p === 0 && e.firstColor
                            ? (g = e.firstColor)
                            : p === n.length - 1 && e.lastColor
                              ? (g = e.lastColor)
                              : f.value < 0 &&
                                e.negative &&
                                e.negativeColor &&
                                (g = e.negativeColor),
                        (t.fillStyle = g),
                        t.beginPath(),
                        t.arc(m, h, Math.max(1.25, 1.75 * J), 0, Math.PI * 2),
                        t.fill());
                    });
                  }
                }
              }
            } else {
              let n = j.textAlign;
              t.textAlign = n;
              let r = n === `right` ? ue + fe : n === `center` ? ue + fe / 2 : ue,
                i = (w.conditionalIcon ? 18 * J : 0) + (w.isTableHeader ? 16 * J : 0),
                a = w.spillWidth && w.spillWidth > 0 ? Math.max(0, w.spillWidth - i) : null,
                o = a ?? Math.max(0, fe - i),
                s = j.textColor,
                c = j.textOverflowEllipsis,
                l =
                  j.usesWrappedText ||
                  ce.includes(`
`),
                u = w.shrinkToFitFontSizePx ? Rh(A, w.shrinkToFitFontSizePx) : Rh(A, 12 * J);
              if (w.textRotationDeg && ce.length > 0) {
                let e = zh(A.verticalAlign, de, pe, u),
                  r = ue + fe / 2;
                (t.save(),
                  t.translate(r, e),
                  t.rotate((w.textRotationDeg * Math.PI) / 180),
                  (t.textAlign = n),
                  t.fillText(ce, n === `right` ? fe / 2 : n === `center` ? 0 : -(fe / 2), 0),
                  t.restore());
              } else if (l) {
                let e = Vh(t, ce, o),
                  i = w.shrinkToFitFontSizePx ? Rh(A, w.shrinkToFitFontSizePx) : Rh(A, 12 * J),
                  a = e.length * i,
                  c = A.verticalAlign,
                  l = de;
                (c === `middle` ? (l = de + (pe - a) / 2) : c !== `top` && (l = de + pe - a),
                  e.forEach((e: any, a: any) => {
                    let c = l + a * i + i / 2;
                    (t.fillText(e, r, c),
                      Sh(t, {
                        align: n,
                        color: s,
                        decoration: j.textDecoration,
                        lineThroughY: c,
                        maxWidth: o,
                        text: e,
                        textX: r,
                        underlineY: c + Math.max(2, i * 0.24),
                        zoomFactor: J,
                      }));
                  }));
              } else if (a != null) {
                let i = c ? Ih(t, ce, o) : ce,
                  l = zh(A.verticalAlign, de, pe, u);
                L[e].push({
                  align: n,
                  clipHeight: pe + he * 2,
                  clipLeft: ue - he,
                  clipTop: de - he,
                  clipWidth: a + he * 2,
                  color: s,
                  ellipsize: c,
                  font: t.font,
                  maxWidth: a,
                  text: i,
                  textDecoration: j.textDecoration,
                  textX: r,
                  textY: l,
                  lineThroughY: l,
                  underlineY: l + 6 * J,
                });
              } else {
                let e = w.shrinkToFit ? ce : c ? Ih(t, ce, o) : ce,
                  i = zh(A.verticalAlign, de, pe, u);
                (t.fillText(e, r, i),
                  Sh(t, {
                    align: n,
                    color: s,
                    decoration: j.textDecoration,
                    ellipsize: c,
                    lineThroughY: i,
                    maxWidth: o,
                    text: e,
                    textX: r,
                    underlineY: i + 6 * J,
                    zoomFactor: J,
                  }));
              }
            }
            if (w.conditionalIcon) {
              let e = 10 * J,
                n = O.left + O.width - (le.right + e + (w.isTableHeader ? 16 * J : 4 * J)),
                r = O.top + O.height / 2;
              qh(t, w.conditionalIcon, n + e / 2, r, e);
            }
            (w.isTableHeader &&
              ((t.fillStyle = p.mutedText),
              (t.textAlign = `center`),
              t.fillText(`▾`, O.left + O.width - 10 * J, O.top + O.height / 2)),
              t.restore());
          }
        u();
      }
      for (let e of B) {
        let t = M[e];
        if (t)
          for (let n of L[e])
            (t.save(),
              t.beginPath(),
              t.rect(n.clipLeft, n.clipTop, n.clipWidth, n.clipHeight),
              t.clip(),
              (t.font = n.font),
              (t.fillStyle = n.color),
              (t.textAlign = n.align),
              (t.textBaseline = `middle`),
              t.fillText(n.text, n.textX, n.textY),
              Sh(t, {
                align: n.align,
                color: n.color,
                decoration: n.textDecoration,
                ellipsize: n.ellipsize,
                lineThroughY: n.lineThroughY,
                maxWidth: n.maxWidth,
                text: n.text,
                textX: n.textX,
                underlineY: n.underlineY,
                zoomFactor: J,
              }),
              t.restore());
      }
      for (let e of B) {
        let t = M[e];
        t && oe(e, t, te[e]);
      }
      r = e ? performance.now() - n : 0;
    }
    if (D && F) {
      let e = N.frozen,
        t = N.scroll,
        n = P.frozen,
        r = P.scroll;
      if (k) {
        let e = Ar(`top`);
        if (e && t && it.current) {
          let n = zv(it.current, t, e, c, Ao, f, q.left - C.left, 0);
          n && (ne = n);
        }
      }
      if (A) {
        let e = Ar(`left`);
        if (e && r && ot.current) {
          let t = zv(ot.current, r, e, c, m, Mo, 0, q.top - C.top);
          t && (re = t);
        }
      }
      if (
        (e && ko > 0 && ((e.fillStyle = p.headerSurface), e.fillRect(0, 0, ko, f)), t && Ao > 0)
      ) {
        t.fillStyle = p.headerSurface;
        for (let e of ne) t.fillRect(e.left, e.top, e.width, e.height);
      }
      (e && ((e.strokeStyle = p.border), (e.lineWidth = 1)),
        t && ((t.strokeStyle = p.border), (t.lineWidth = 1)));
      for (let n of No) {
        let r = n.isFrozen ? e : t;
        r &&
          (n.localLeft + n.width < 0 ||
            n.localLeft > (n.isFrozen ? ko : Ao) ||
            (!n.isFrozen && !Rv(n.localLeft, 0, n.width, n.height, ne)) ||
            ((r.fillStyle =
              g && n.actualCol >= g.start.col && n.actualCol <= g.end.col ? ua : p.headerSurface),
            r.fillRect(n.localLeft, 0, n.width, n.height),
            (r.strokeStyle = p.border),
            r.beginPath(),
            r.moveTo(n.localLeft + n.width - 0.5, 0),
            r.lineTo(n.localLeft + n.width - 0.5, n.height),
            r.moveTo(n.localLeft, n.height - 0.5),
            r.lineTo(n.localLeft + n.width, n.height - 0.5),
            r.stroke(),
            (r.font = `600 ${11 * J}px ui-sans-serif, system-ui, sans-serif`),
            (r.fillStyle = p.headerText),
            (r.textAlign = `center`),
            (r.textBaseline = `middle`),
            r.fillText(T_(n.actualCol), n.localLeft + n.width / 2, n.height / 2)));
      }
      if (
        (n && jo > 0 && ((n.fillStyle = p.rowHeaderSurface), n.fillRect(0, 0, m, jo)), r && Mo > 0)
      ) {
        r.fillStyle = p.rowHeaderSurface;
        for (let e of re) r.fillRect(e.left, e.top, e.width, e.height);
      }
      (n && ((n.strokeStyle = p.border), (n.lineWidth = 1)),
        r && ((r.strokeStyle = p.border), (r.lineWidth = 1)));
      for (let e of Po) {
        let t = e.isFrozen ? n : r;
        t &&
          (e.localTop + e.height < 0 ||
            e.localTop > (e.isFrozen ? jo : Mo) ||
            (!e.isFrozen && !Rv(0, e.localTop, m, e.height, re)) ||
            ((t.fillStyle =
              g && e.actualRow >= g.start.row && e.actualRow <= g.end.row
                ? ua
                : p.rowHeaderSurface),
            t.fillRect(0, e.localTop, m, e.height),
            t.beginPath(),
            t.moveTo(0, e.localTop + e.height - 0.5),
            t.lineTo(m, e.localTop + e.height - 0.5),
            t.moveTo(m - 0.5, e.localTop),
            t.lineTo(m - 0.5, e.localTop + e.height),
            t.stroke(),
            (t.font = `600 ${11 * J}px ui-sans-serif, system-ui, sans-serif`),
            (t.fillStyle = p.headerText),
            (t.textAlign = `center`),
            (t.textBaseline = `middle`),
            t.fillText(`${e.actualRow + 1}`, m / 2, e.localTop + e.height / 2)));
      }
      ((F.fillStyle = p.headerSurface),
        F.fillRect(0, 0, m, f),
        (F.strokeStyle = p.border),
        (F.lineWidth = 1),
        F.beginPath(),
        F.moveTo(m - 0.5, 0),
        F.lineTo(m - 0.5, f),
        F.moveTo(0, f - 0.5),
        F.lineTo(m, f - 0.5),
        F.stroke());
    }
    ((jn.current = q),
      T && (Mn.current = v),
      D && (Nn.current = b),
      yr(),
      e &&
        (e.push({
          bodyMs: r,
          culledCells: i,
          dirtyRects: a,
          lookedUpCells: o,
          paintedCells: s,
          repaintBody: T,
          repaintHeaders: D,
          renderToLayoutMs: t - w,
          totalMs: performance.now() - t,
        }),
        e.length > 500 && e.splice(0, e.length - 500)));
  }, [
    E,
    yr,
    Fa,
    Ma,
    ka,
    No,
    ya,
    Po,
    va,
    _a,
    Vr,
    qr,
    Rr,
    zr,
    Y,
    X,
    ai,
    q.left,
    q.top,
    q.height,
    q.width,
    y,
    Qr,
    $r,
    sa,
    qo,
    kr,
    Ar,
    p,
    Ha,
    or,
    Br,
    Kr,
    ua,
    Da,
    Zr,
    Xr,
    Z,
    jr,
    J,
  ]);
  let Jo = G.useCallback(
      (e: any, t: any, n: any) => {
        e.button === 0 &&
          (e.preventDefault(),
          e.stopPropagation(),
          Hi(),
          Ee(t.id),
          !(Nt.current || t.editable === !1) &&
            (e.currentTarget.setPointerCapture?.(e.pointerId),
            (mn.current = {
              baseRect: n,
              chartId: t.id,
              didMove: !1,
              pointerId: e.pointerId,
              startClientX: e.clientX,
              startClientY: e.clientY,
              type: `move`,
            }),
            (Ln.current = { id: t.id, rect: n }),
            wn({ id: t.id, rect: n }),
            nr(`select`),
            (document.body.style.cursor = `move`),
            (document.body.style.userSelect = `none`),
            vc(e.pointerId)));
      },
      [Hi, Ee],
    ),
    Yo = G.useCallback(
      (e: any, t: any, n: any, r: any) => {
        Nt.current ||
          t.editable === !1 ||
          e.button !== 0 ||
          (e.preventDefault(),
          e.stopPropagation(),
          Hi(),
          Ee(t.id),
          e.currentTarget.setPointerCapture?.(e.pointerId),
          (mn.current = {
            baseRect: n,
            chartId: t.id,
            didMove: !1,
            handle: r,
            pointerId: e.pointerId,
            startClientX: e.clientX,
            startClientY: e.clientY,
            type: `resize`,
          }),
          (Ln.current = { id: t.id, rect: n }),
          wn({ id: t.id, rect: n }),
          nr(`select`),
          (document.body.style.cursor = String(fh[r])),
          (document.body.style.userSelect = `none`),
          vc(e.pointerId));
      },
      [Hi, Ee],
    ),
    Xo = G.useCallback(
      (e: any, t: any, n: any) => {
        e.button === 0 &&
          (e.preventDefault(),
          e.stopPropagation(),
          Hi(),
          Oe(t.id),
          !(Nt.current || t.editable === !1) &&
            (e.currentTarget.setPointerCapture?.(e.pointerId),
            (fn.current = {
              baseRect: n,
              didMove: !1,
              imageId: t.id,
              pointerId: e.pointerId,
              startClientX: e.clientX,
              startClientY: e.clientY,
              type: `move`,
            }),
            (qn.current = { id: t.id, rect: n }),
            Kn({ id: t.id, rect: n }),
            nr(`select`),
            (document.body.style.cursor = `move`),
            (document.body.style.userSelect = `none`),
            _c(e.pointerId)));
      },
      [Hi, Oe],
    ),
    Zo = G.useCallback(
      (e: any, t: any, n: any, r: any) => {
        Nt.current ||
          t.editable === !1 ||
          e.button !== 0 ||
          (e.preventDefault(),
          e.stopPropagation(),
          Hi(),
          Oe(t.id),
          e.currentTarget.setPointerCapture?.(e.pointerId),
          (fn.current = {
            baseRect: n,
            didMove: !1,
            handle: r,
            imageId: t.id,
            pointerId: e.pointerId,
            startClientX: e.clientX,
            startClientY: e.clientY,
            type: `resize`,
          }),
          (qn.current = { id: t.id, rect: n }),
          Kn({ id: t.id, rect: n }),
          nr(`select`),
          (document.body.style.cursor = String(fh[r])),
          (document.body.style.userSelect = `none`),
          _c(e.pointerId));
      },
      [Hi, Oe],
    ),
    Qo = G.useCallback(
      (e: any) => {
        if (Qn.current === e.id) {
          Qn.current = null;
          return;
        }
        e.hyperlink && Ui(e.hyperlink);
      },
      [Ui],
    ),
    $o = G.useCallback(
      (e: any) => {
        e.hyperlink && Ui(e.hyperlink);
      },
      [Ui],
    ),
    es = G.useCallback(
      (e: any) => {
        if (Rn.current === e.id) {
          Rn.current = null;
          return;
        }
        Ee(e.id);
      },
      [Ee],
    ),
    ts = G.useCallback(
      (e: any) => {
        ((Rn.current = e.chartId), De(e));
      },
      [De],
    ),
    ns = G.useCallback(
      (e: any) => {
        De(e);
      },
      [De],
    );
  if (ue) return (0, K.jsx)(K.Fragment, { children: Dv(s, c, p) });
  if (le)
    return (0, K.jsx)(K.Fragment, {
      children: Fv(
        {
          ...t,
          canLoadDeferred: j,
          continueDeferredLoad: I,
          deferredLoadFileSize: ee,
          isLoadDeferred: le,
        },
        p,
      ),
    });
  if (te)
    return te instanceof Dl
      ? (0, K.jsx)(K.Fragment, {
          children: Av(
            a,
            {
              displayFileName: L,
              fileSizeBytes: te.fileSizeBytes,
              maxFileSizeBytes: te.maxFileSizeBytes,
            },
            p,
          ),
        })
      : (0, K.jsx)(K.Fragment, { children: Ev(i, te, p) });
  if (!E && O?.kind === `chartsheet`)
    return (0, K.jsx)(`div`, {
      style: {
        alignItems: `stretch`,
        backgroundColor: p.canvas,
        display: `flex`,
        flex: 1,
        justifyContent: `center`,
        minHeight: 0,
        minWidth: 0,
        padding: 16,
      },
      children: (0, K.jsx)(`div`, {
        style: {
          backgroundColor: p.surface,
          border: `1px solid ${p.border}`,
          borderRadius: 12,
          display: `grid`,
          gap: 16,
          gridTemplateColumns:
            M.length > 1 ? `repeat(auto-fit, minmax(320px, 1fr))` : `minmax(320px, 1fr)`,
          padding: 16,
          width: `100%`,
        },
        children:
          M.length > 0
            ? M.map((e: any) => {
                let t = { height: 320, left: 0, top: 0, width: 640 };
                return (0, K.jsx)(
                  `div`,
                  {
                    style: { minHeight: 320, position: `relative` },
                    children: de
                      ? Nv(d, e, t)
                      : (0, K.jsx)(gm, {
                          chart: e,
                          onChartElementDoubleClick: ns,
                          onChartElementPointerDown: ts,
                          palette: p,
                          rect: t,
                          selectedChartElement: xe,
                        }),
                  },
                  e.id,
                );
              })
            : (0, K.jsx)(`div`, {
                style: {
                  alignItems: `center`,
                  color: p.mutedText,
                  display: `flex`,
                  fontSize: 13,
                  justifyContent: `center`,
                  minHeight: 320,
                },
                children: `Chartsheet metadata is present, but no embedded chart payload was exposed for this tab.`,
              }),
      }),
    });
  if (!E) return (0, K.jsx)(K.Fragment, { children: Ov(n, p) });
  let rs = Ti.rowIndices.map((e: any) => {
      let t = Ei.get(e);
      return {
        end: t?.end ?? Kr[e + 1] ?? 0,
        index: e,
        key: jr[e] ?? e,
        size: t?.size ?? zr[e] ?? gr,
        start: t?.start ?? Kr[e] ?? 0,
      };
    }),
    is = ui && ci ? gi.getTotalSize() : (Kr[Kr.length - 1] ?? 0),
    as = ba + X,
    os = Y + is,
    ss = Tn !== null && Ue === Tn.baseZoomScale,
    cs = ss ? Math.max(0.1, Tn.targetZoomScale / Tn.baseZoomScale) : 1,
    ls = Ke.current?.scrollLeft ?? q.left,
    us = Ke.current?.scrollTop ?? q.top,
    ds = ss ? (ls + Tn.anchor.x) * (1 - cs) : 0,
    fs = ss ? (us + Tn.anchor.y) * (1 - cs) : 0,
    ps = ss ? cs : 1,
    ms = Math.max(1, J),
    hs = y && r && Tn === null,
    gs = hs
      ? `left 120ms cubic-bezier(0.22, 1, 0.36, 1), top 120ms cubic-bezier(0.22, 1, 0.36, 1), width 120ms cubic-bezier(0.22, 1, 0.36, 1), height 120ms cubic-bezier(0.22, 1, 0.36, 1), opacity 100ms linear`
      : `none`,
    _s = pa.length + 1 + +(xa > 0) + +(Sa > 0),
    vs = `inset -1px 0 0 ${p.border}, inset 0 -1px 0 ${p.border}`,
    ys = Math.max(
      0,
      ...ce.map((e: any) => e.zIndex + 20),
      ...re.map((e: any) => e.zIndex + 20),
      ...se.map((e: any) => e.zIndex + 22),
      ...M.map((e: any) => e.zIndex + 22),
    ),
    bs = Math.max(35, ys + 1),
    xs = Math.max(50, bs + 1),
    Ss = xs + 1,
    Cs = xs + 2,
    ws = bs,
    Ts = Th(
      {
        backgroundColor: p.headerSurface,
        borderBottom: `none`,
        borderRight: `none`,
        boxShadow: vs,
        color: p.headerText,
        fontSize: `11px`,
        fontWeight: 600,
        height: Cm,
        overflow: `hidden`,
        padding: `2px 4px`,
        position: `sticky`,
        textAlign: `center`,
        top: 0,
        userSelect: `none`,
        whiteSpace: `nowrap`,
        zIndex: xs,
      },
      J,
    ),
    Es = Th(
      {
        backgroundColor: `transparent`,
        cursor: `col-resize`,
        position: `absolute`,
        right: -8,
        top: 0,
        width: 16,
        height: `100%`,
        zIndex: 5,
      },
      J,
    ),
    Ds = {
      height: 0,
      left: 0,
      overflow: `visible`,
      pointerEvents: `none`,
      position: `sticky`,
      top: 0,
      width: 0,
    },
    Os = {
      height: 0,
      left: 0,
      overflow: `visible`,
      pointerEvents: `none`,
      position: `sticky`,
      top: 0,
      width: 0,
      zIndex: xs,
    },
    ks = {
      cursor: `cell`,
      pointerEvents: `auto`,
      position: `absolute`,
      transformOrigin: `0 0`,
      transition: `none`,
      zIndex: 10,
    },
    As = { ...ks, display: xo > 0 && So > 0 ? `block` : `none`, left: yo, top: bo },
    js = { ...ks, display: Co > 0 && wo > 0 ? `block` : `none`, left: yo, top: Y, zIndex: 30 },
    Ms = { ...ks, display: To > 0 && Eo > 0 ? `block` : `none`, left: X, top: bo, zIndex: 30 },
    Ns = { ...ks, display: Do > 0 && Oo > 0 ? `block` : `none`, left: X, top: Y, zIndex: 31 },
    Ps = { cursor: `default`, pointerEvents: `auto`, position: `absolute`, transformOrigin: `0 0` },
    Fs = { ...Ps, display: ko > 0 && q.height > 0 ? `block` : `none`, left: X, top: 0, zIndex: Ss },
    Is = {
      ...Ps,
      display: Ao > 0 && q.height > 0 ? `block` : `none`,
      left: yo,
      top: 0,
      zIndex: xs,
    },
    Ls = { ...Ps, display: jo > 0 && q.width > 0 ? `block` : `none`, left: 0, top: Y, zIndex: Ss },
    Rs = { ...Ps, display: Mo > 0 && q.width > 0 ? `block` : `none`, left: 0, top: bo, zIndex: xs },
    zs = {
      display: q.width > 0 && q.height > 0 ? `block` : `none`,
      left: 0,
      pointerEvents: `none`,
      position: `absolute`,
      top: 0,
      transformOrigin: `0 0`,
      zIndex: Cs,
    },
    Bs = y && hn ? Ha(hn) : null,
    Vs = y && T ? $(T) : null,
    Hs = T && Vs ? Ha(T) : null;
  function Us(e: any) {
    return Lg(e, Mr, Nr, Lr, Ir, E?.freezePanes ?? null, Xr, Zr, {
      defaultColWidth: _r,
      defaultRowHeight: gr,
      headerHeight: Y,
      rowHeaderWidth: X,
    });
  }
  function Ws(e: any, t: any, n: any) {
    if (Us(t) !== n) return null;
    let r = q.width > 0 && q.height > 0;
    if (n === `scroll` && r && !Ig(t, q)) return null;
    let i = n !== `scroll`,
      a = e.textBox?.insetPx,
      o = e.scaleX ?? 1,
      s = e.scaleY ?? 1,
      c = Math.max(o, s),
      l = c * J,
      u = o === 0 ? t.width : t.width / o,
      d = s === 0 ? t.height : t.height / s,
      f = __(e),
      p = e.stroke?.none ? `transparent` : (e.stroke?.color ?? `transparent`),
      m = (e.stroke?.widthPx ?? (e.geometry === `line` ? 2 : 1)) * c * J,
      h = `${e.id}-${n}-head-marker`,
      g = `${e.id}-${n}-tail-marker`,
      _ = f ? b_(e.stroke?.headEndType, h, p, m, t, f.viewBox) : null,
      v = f ? b_(e.stroke?.tailEndType, g, p, m, t, f.viewBox) : null,
      y = { ...Rg(e, t, J), ...(f ? { backgroundColor: `transparent`, border: `none` } : null) };
    return (0, K.jsxs)(
      `div`,
      {
        onClick: () => $o(e),
        style: {
          ...y,
          contain: `layout paint`,
          cursor: e.hyperlink ? `pointer` : `default`,
          left: y.left,
          pointerEvents: e.hyperlink ? `auto` : `none`,
          top: y.top,
          zIndex: i ? e.zIndex + 20 : y.zIndex,
        },
        title: e.description,
        children: [
          f
            ? (0, K.jsxs)(`svg`, {
                "aria-hidden": `true`,
                preserveAspectRatio: `none`,
                style: { height: `100%`, inset: 0, position: `absolute`, width: `100%` },
                viewBox: `0 0 ${f.viewBox.width} ${f.viewBox.height}`,
                children: [
                  _ || v ? (0, K.jsxs)(`defs`, { children: [_, v] }) : null,
                  (0, K.jsx)(`path`, {
                    d: f.path,
                    fill: e.fill?.none ? `transparent` : (e.fill?.color ?? `transparent`),
                    fillOpacity: e.fill?.opacity ?? 1,
                    markerEnd: v ? `url(#${g})` : void 0,
                    markerStart: _ ? `url(#${h})` : void 0,
                    stroke: p,
                    strokeOpacity: e.stroke?.opacity ?? 1,
                    strokeWidth: m,
                    vectorEffect: `non-scaling-stroke`,
                  }),
                ],
              })
            : null,
          (0, K.jsx)(`div`, {
            style: {
              color: `#000000`,
              display: `flex`,
              flex: 1,
              flexDirection: `column`,
              gap: 2 * J,
              height: d,
              justifyContent:
                e.textBox?.verticalAlign === `middle`
                  ? `center`
                  : e.textBox?.verticalAlign === `bottom`
                    ? `flex-end`
                    : `flex-start`,
              paddingBottom: (a?.bottom ?? 4) * J,
              paddingLeft: (a?.left ?? 6) * J,
              paddingRight: (a?.right ?? 6) * J,
              paddingTop: (a?.top ?? 4) * J,
              pointerEvents: `none`,
              position: `relative`,
              transform: o !== 1 || s !== 1 ? `scale(${o}, ${s})` : void 0,
              transformOrigin: `top left`,
              width: u,
              zIndex: 1,
            },
            children: e.paragraphs.map((t: any, n: any) => x_(t, n, e.textBox?.horizontalAlign ?? `left`, l)),
          }),
        ],
      },
      `${n}-${e.id}`,
    );
  }
  function Gs(e: any, t: any, n: any) {
    if (Us(t) !== n) return null;
    let r = q.width > 0 && q.height > 0;
    if (n === `scroll` && r && !Ig(t, q)) return null;
    let i = n !== `scroll`,
      a = Yv(e),
      o = Math.max(9 * J, (((e.fontSizePt ?? 9) * 96) / 72) * J),
      s = M_(p) ? `#cbd5e1` : `#475569`,
      c = e.textColor ?? `#000000`,
      d =
        !H &&
        e.controlIndex !== void 0 &&
        [`checkbox`, `dropdown`, `listbox`, `radio`, `scrollbar`, `spinner`].includes(e.kind),
      m = !H && e.kind === `button` && !!l,
      h = d || m,
      g = We.get(e.id) ?? [],
      _ = {
        alignItems: e.kind === `group-box` ? `stretch` : `center`,
        color: c,
        contain: `layout paint`,
        cursor: h ? `pointer` : void 0,
        display: `flex`,
        fontFamily: e.fontFamily ?? `Calibri, sans-serif`,
        fontSize: o,
        fontWeight: 400,
        gap: 4 * J,
        height: t.height,
        justifyContent:
          e.textAlign === `center` ? `center` : e.textAlign === `right` ? `flex-end` : `flex-start`,
        left: t.left,
        lineHeight: 1.2,
        overflow: `hidden`,
        pointerEvents: h ? `auto` : `none`,
        position: `absolute`,
        top: t.top,
        width: t.width,
        zIndex: i ? e.zIndex + 20 : e.zIndex,
      },
      v = (e: any) => {
        e.stopPropagation();
      },
      y = (t: any, n: any) => {
        if (H || e.controlIndex === void 0) return !1;
        let r = Ve(e.controlIndex, { kind: t }, e.sheetIndex);
        return (r && u?.({ control: { ...e, ...n }, previousControl: e, type: `change` }), r);
      },
      b = (t: any = `unchecked`) => {
        let n = Kv(e);
        return n?.kind === `checkbox` || (n?.kind === `optionButton` && t !== `mixed`)
          ? y({ ...n, state: t }, { checked: t === `checked`, state: t })
          : !1;
      },
      x = (t: any) => {
        let n = Kv(e);
        if (n?.kind === `dropdown`) {
          let e = typeof t == `number` ? t : void 0;
          return y({ ...n, selected: e }, { selected: e });
        }
        if (n?.kind === `listBox`) {
          let e = Array.isArray(t) ? t : typeof t == `number` ? [t] : [];
          return y({ ...n, selected: e }, { selected: e });
        }
        return !1;
      },
      S = (t: any) => {
        if (!Number.isFinite(t)) return !1;
        let n = Kv(e);
        if (n?.kind !== `scrollbar` && n?.kind !== `spinner`) return !1;
        let r = Math.max(n.min, Math.min(n.max, t));
        return y({ ...n, value: r }, { value: r });
      },
      C = () => {
        !H && e.kind === `button` && l?.({ control: e, type: `activate` });
      };
    if (f)
      return (0, K.jsx)(
        G.Fragment,
        {
          children: f({
            activate: C,
            checked: Wv(e),
            control: e,
            disabled: !h,
            items: g,
            label: a,
            mixed: Gv(e),
            readOnly: H,
            rect: t,
            setSelected: x,
            setState: b,
            setValue: S,
            stopPropagation: v,
            style: _,
            zoomFactor: J,
          }),
        },
        `${n}-${e.id}`,
      );
    if (e.kind === `group-box`) {
      let t = a.length > 0;
      return (0, K.jsx)(
        `div`,
        {
          style: { ..._, padding: `${t ? Math.max(7, o * 0.5) : 0}px 0 0`, position: `absolute` },
          children: (0, K.jsx)(`div`, {
            style: {
              border: `${Math.max(1, J)}px solid ${s}`,
              borderRadius: 2 * J,
              height: `100%`,
              position: `relative`,
              width: `100%`,
            },
            children: a
              ? (0, K.jsx)(`span`, {
                  style: {
                    backgroundColor: eh,
                    left: 8 * J,
                    maxWidth: `calc(100% - ${16 * J}px)`,
                    padding: `0 ${4 * J}px`,
                    position: `absolute`,
                    top: -(o * 0.6),
                    whiteSpace: `nowrap`,
                  },
                  children: a,
                })
              : null,
          }),
        },
        `${n}-${e.id}`,
      );
    }
    if (e.kind === `radio`) {
      let t = Wv(e);
      return (0, K.jsxs)(
        `button`,
        {
          "aria-disabled": H || e.controlIndex === void 0,
          "aria-checked": t,
          disabled: !H && e.controlIndex === void 0,
          onClick: (e: any) => {
            (e.stopPropagation(), t || b(`checked`));
          },
          onPointerDown: v,
          role: `radio`,
          style: {
            ..._,
            background: `transparent`,
            border: 0,
            boxSizing: `border-box`,
            padding: `0 ${Math.max(1, J)}px`,
          },
          tabIndex: H ? -1 : void 0,
          type: `button`,
          children: [
            Jv(t, p, J),
            a
              ? (0, K.jsx)(`span`, {
                  style: { overflow: `hidden`, textOverflow: `ellipsis`, whiteSpace: `nowrap` },
                  children: a,
                })
              : null,
          ],
        },
        `${n}-${e.id}`,
      );
    }
    if (e.kind === `checkbox`) {
      let t = Wv(e),
        r = Gv(e);
      return (0, K.jsxs)(
        `button`,
        {
          "aria-disabled": H || e.controlIndex === void 0,
          "aria-checked": r ? `mixed` : t,
          disabled: !H && e.controlIndex === void 0,
          onClick: (e: any) => {
            (e.stopPropagation(), b(t && !r ? `unchecked` : `checked`));
          },
          onPointerDown: v,
          role: `checkbox`,
          style: {
            ..._,
            background: `transparent`,
            border: 0,
            boxSizing: `border-box`,
            padding: `0 ${Math.max(1, J)}px`,
          },
          tabIndex: H ? -1 : void 0,
          type: `button`,
          children: [
            qv(t, p, J, r),
            a
              ? (0, K.jsx)(`span`, {
                  style: { overflow: `hidden`, textOverflow: `ellipsis`, whiteSpace: `nowrap` },
                  children: a,
                })
              : null,
          ],
        },
        `${n}-${e.id}`,
      );
    }
    if (e.kind === `button`)
      return (0, K.jsx)(
        `button`,
        {
          "aria-disabled": H || !l,
          disabled: !H && !l,
          onClick: (e: any) => {
            (e.stopPropagation(), C());
          },
          onPointerDown: v,
          style: {
            ..._,
            background: `linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)`,
            border: `${Math.max(1, J)}px solid ${s}`,
            borderRadius: 4 * J,
            boxSizing: `border-box`,
            justifyContent: `center`,
            padding: `0 ${6 * J}px`,
            textAlign: `center`,
          },
          tabIndex: H ? -1 : void 0,
          type: `button`,
          children: a,
        },
        `${n}-${e.id}`,
      );
    if (e.kind === `dropdown`) {
      let t = typeof e.selected == `number` ? e.selected : void 0;
      return (0, K.jsxs)(
        `select`,
        {
          "aria-disabled": H || e.controlIndex === void 0 || g.length === 0,
          "aria-label": a || e.name || `Dropdown form control`,
          disabled: !H && (e.controlIndex === void 0 || g.length === 0),
          onChange: (e: any) => {
            (e.stopPropagation(),
              x(e.currentTarget.value === `` ? void 0 : Number(e.currentTarget.value)));
          },
          onClick: v,
          onPointerDown: v,
          style: {
            ..._,
            backgroundColor: eh,
            border: `${Math.max(1, J)}px solid ${s}`,
            borderRadius: 2 * J,
            boxSizing: `border-box`,
            padding: `0 ${4 * J}px`,
          },
          tabIndex: H ? -1 : void 0,
          value: t === void 0 ? `` : String(t),
          children: [
            t === void 0 ? (0, K.jsx)(`option`, { value: ``, children: a }) : null,
            g.map((e: any, t: any) => (0, K.jsx)(`option`, { value: t, children: e }, t)),
          ],
        },
        `${n}-${e.id}`,
      );
    }
    if (e.kind === `listbox`) {
      let r = Array.isArray(e.selected) ? e.selected : e.selected === void 0 ? [] : [e.selected],
        i = (e.selection ?? `single`) !== `single`;
      return (0, K.jsx)(
        `select`,
        {
          "aria-disabled": H || e.controlIndex === void 0 || g.length === 0,
          "aria-label": a || e.name || `List box form control`,
          disabled: !H && (e.controlIndex === void 0 || g.length === 0),
          multiple: i,
          onChange: (e: any) => {
            (e.stopPropagation(),
              x(Array.from(e.currentTarget.selectedOptions, (e: any) => Number(e.value))));
          },
          onClick: v,
          onPointerDown: v,
          size: Math.max(2, Math.min(g.length || 2, Math.floor(t.height / Math.max(1, o * 1.45)))),
          style: {
            ..._,
            alignItems: void 0,
            backgroundColor: eh,
            border: `${Math.max(1, J)}px solid ${s}`,
            borderRadius: 2 * J,
            boxSizing: `border-box`,
            display: `block`,
            padding: 0,
          },
          tabIndex: H ? -1 : void 0,
          value: i ? r.map(String) : r[0] === void 0 ? `` : String(r[0]),
          children: g.map((e: any, t: any) => (0, K.jsx)(`option`, { value: t, children: e }, t)),
        },
        `${n}-${e.id}`,
      );
    }
    if (e.kind === `scrollbar`) {
      let t = e.min ?? 0,
        r = Math.max(t, e.max ?? 100);
      return (0, K.jsx)(
        `input`,
        {
          "aria-disabled": H || e.controlIndex === void 0,
          "aria-label": a || e.name || `Scrollbar form control`,
          disabled: !H && e.controlIndex === void 0,
          max: r,
          min: t,
          onChange: (e: any) => {
            (e.stopPropagation(), S(e.currentTarget.valueAsNumber));
          },
          onClick: v,
          onPointerDown: v,
          step: Math.max(1, e.increment ?? 1),
          style: {
            ..._,
            accentColor: M_(p) ? `#60a5fa` : `#2563eb`,
            boxSizing: `border-box`,
            padding: 0,
            writingMode: e.horizontal === !1 ? `vertical-lr` : void 0,
          },
          tabIndex: H ? -1 : void 0,
          type: `range`,
          value: Math.max(t, Math.min(r, e.value ?? t)),
        },
        `${n}-${e.id}`,
      );
    }
    if (e.kind === `spinner`) {
      let t = e.min ?? 0,
        r = Math.max(t, e.max ?? 100);
      return (0, K.jsx)(
        `input`,
        {
          "aria-disabled": H || e.controlIndex === void 0,
          "aria-label": a || e.name || `Spinner form control`,
          disabled: !H && e.controlIndex === void 0,
          max: r,
          min: t,
          onChange: (e: any) => {
            (e.stopPropagation(), S(e.currentTarget.valueAsNumber));
          },
          onClick: v,
          onPointerDown: v,
          step: Math.max(1, e.increment ?? 1),
          style: {
            ..._,
            backgroundColor: eh,
            border: `${Math.max(1, J)}px solid ${s}`,
            borderRadius: 2 * J,
            boxSizing: `border-box`,
            padding: `0 ${4 * J}px`,
          },
          tabIndex: H ? -1 : void 0,
          type: `number`,
          value: Math.max(t, Math.min(r, e.value ?? t)),
        },
        `${n}-${e.id}`,
      );
    }
    return (0, K.jsx)(
      `div`,
      {
        style: {
          ..._,
          border:
            e.kind === `editbox` || e.kind === `unknown`
              ? `${Math.max(1, J)}px solid ${s}`
              : void 0,
          borderRadius: 2 * J,
          boxSizing: `border-box`,
          padding: `0 ${Math.max(1, J)}px`,
        },
        children: a
          ? (0, K.jsx)(`span`, {
              style: { overflow: `hidden`, textOverflow: `ellipsis`, whiteSpace: `nowrap` },
              children: a,
            })
          : null,
      },
      `${n}-${e.id}`,
    );
  }
  function Ks(e: any, t: any, n: any) {
    if (Us(t) !== n) return null;
    let r = q.width > 0 && q.height > 0;
    if (n === `scroll` && r && !Ig(t, q)) return null;
    let i = n !== `scroll`,
      a = !H && e.editable !== !1,
      o = M_(p) ? p.canvas : nh,
      s = {
        contain: `layout paint`,
        height: t.height,
        left: t.left,
        overflow: `hidden`,
        pointerEvents: `none`,
        position: `absolute`,
        top: t.top,
        width: t.width,
        zIndex: i ? e.zIndex + 20 : e.zIndex,
      },
      c = (0, K.jsx)(`img`, {
        alt: e.description ?? e.name ?? ``,
        draggable: !1,
        src: e.src,
        style: {
          display: `block`,
          height: `100%`,
          pointerEvents: `none`,
          userSelect: `none`,
          width: `100%`,
        },
      }),
      l =
        we === e.id
          ? (0, K.jsx)(`div`, {
              style: {
                ...s,
                contain: `layout`,
                overflow: `visible`,
                pointerEvents: `none`,
                zIndex: i ? e.zIndex + 22 : e.zIndex + 2,
              },
              children: h
                ? h({
                    defaultNode: (0, K.jsx)(`div`, {
                      style: {
                        border: `${Math.max(1, J)}px solid ${th}`,
                        boxShadow: `0 0 0 ${Math.max(1, J)}px ${o}`,
                        boxSizing: `border-box`,
                        inset: 0,
                        pointerEvents: `none`,
                        position: `absolute`,
                      },
                      children: a
                        ? ah.map((n: any) =>
                            (0, K.jsx)(
                              `div`,
                              { onPointerDown: (r: any) => Zo(r, e, t, n), style: C_(n, th, o, J) },
                              n,
                            ),
                          )
                        : null,
                    }),
                    getHandleProps: (n: any) => ({
                      onPointerDown: (r: any) => {
                        a && Zo(r, e, t, n);
                      },
                      style: a ? C_(n, th, o, J) : { ...C_(n, th, o, J), display: `none` },
                    }),
                    image: e,
                    rect: t,
                  })
                : (0, K.jsx)(`div`, {
                    style: {
                      border: `${Math.max(1, J)}px solid ${th}`,
                      boxShadow: `0 0 0 ${Math.max(1, J)}px ${o}`,
                      boxSizing: `border-box`,
                      inset: 0,
                      pointerEvents: `none`,
                      position: `absolute`,
                    },
                    children: a
                      ? ah.map((n: any) =>
                          (0, K.jsx)(
                            `div`,
                            { onPointerDown: (r: any) => Zo(r, e, t, n), style: C_(n, th, o, J) },
                            n,
                          ),
                        )
                      : null,
                  }),
            })
          : null;
    return (0, K.jsxs)(
      G.Fragment,
      {
        children: [
          m
            ? (0, K.jsx)(`div`, {
                style: s,
                children: m({ defaultNode: c, image: e, rect: t, style: s }),
              })
            : (0, K.jsx)(`div`, { style: s, children: c }),
          (0, K.jsx)(`div`, {
            onClick: () => Qo(e),
            onPointerDown: (n: any) => Xo(n, e, t),
            style: {
              ...s,
              background: `transparent`,
              cursor: a && we === e.id ? `move` : e.hyperlink ? `pointer` : `cell`,
              pointerEvents: `auto`,
              zIndex: i ? e.zIndex + 21 : e.zIndex + 1,
            },
          }),
          l,
        ],
      },
      `${n}-${e.id}`,
    );
  }
  function qs(e: any, t: any, n: any) {
    if (Us(t) !== n) return null;
    let r = q.width > 0 && q.height > 0;
    if (n === `scroll` && r && !Ig(t, q)) return null;
    let i = n !== `scroll`,
      a = !H && e.editable !== !1,
      o = M_(p) ? p.canvas : nh,
      s = {
        contain: `layout paint`,
        height: t.height,
        left: t.left,
        overflow: `hidden`,
        pointerEvents: `none`,
        position: `absolute`,
        top: t.top,
        width: t.width,
        zIndex: i ? e.zIndex + 20 : e.zIndex,
      },
      c =
        Se === e.id
          ? (0, K.jsx)(`div`, {
              style: {
                ...s,
                contain: `layout`,
                overflow: `visible`,
                pointerEvents: `none`,
                zIndex: i ? e.zIndex + 22 : e.zIndex + 2,
              },
              children: (0, K.jsx)(`div`, {
                style: {
                  border: `${Math.max(1, J)}px solid ${th}`,
                  boxShadow: `0 0 0 ${Math.max(1, J)}px ${o}`,
                  boxSizing: `border-box`,
                  inset: 0,
                  pointerEvents: `none`,
                  position: `absolute`,
                },
                children: a
                  ? ah.map((n: any) =>
                      (0, K.jsx)(
                        `div`,
                        { onPointerDown: (r: any) => Yo(r, e, t, n), style: C_(n, th, o, J) },
                        n,
                      ),
                    )
                  : null,
              }),
            })
          : null;
    return (0, K.jsxs)(
      G.Fragment,
      {
        children: [
          (0, K.jsx)(`div`, {
            onClick: () => es(e),
            onPointerDown: (n: any) => Jo(n, e, t),
            style: { ...s, cursor: a && Se === e.id ? `move` : `cell`, pointerEvents: `auto` },
            children: de
              ? Nv(d, e, t)
              : (0, K.jsx)(gm, {
                  chart: e,
                  onChartElementDoubleClick: ns,
                  onChartElementPointerDown: ts,
                  palette: p,
                  rect: t,
                  selectedChartElement: xe,
                }),
          }),
          c,
        ],
      },
      `${n}-${e.id}`,
    );
  }
  let Js = { inset: 0, pointerEvents: `none`, position: `absolute`, zIndex: 20 },
    Ys = {
      height: 0,
      overflow: `visible`,
      pointerEvents: `none`,
      position: `sticky`,
      top: 0,
      width: 0,
      zIndex: 25,
    },
    Xs = {
      height: 0,
      left: 0,
      overflow: `visible`,
      pointerEvents: `none`,
      position: `sticky`,
      width: 0,
      zIndex: 25,
    },
    Zs = {
      height: 0,
      left: 0,
      overflow: `visible`,
      pointerEvents: `none`,
      position: `sticky`,
      top: 0,
      width: 0,
      zIndex: 26,
    },
    Qs = { overflow: `hidden`, pointerEvents: `none`, position: `absolute` },
    $s = {
      ...Qs,
      display: ho > 0 && go > 0 ? `block` : `none`,
      height: go,
      left: $r,
      top: Qr,
      width: ho,
      zIndex: 20,
    },
    ec = {
      ...Qs,
      display: ho > 0 && wo > 0 ? `block` : `none`,
      height: wo,
      left: $r,
      top: Y,
      width: ho,
      zIndex: 35,
    },
    tc = {
      ...Qs,
      display: To > 0 && go > 0 ? `block` : `none`,
      height: go,
      left: X,
      top: Qr,
      width: To,
      zIndex: 35,
    },
    nc = {
      ...Qs,
      display: Do > 0 && Oo > 0 ? `block` : `none`,
      height: Oo,
      left: X,
      top: Y,
      width: Do,
      zIndex: 36,
    },
    rc = `${Math.floor(q.left / Wm)}:${Math.floor(q.top / Wm)}:${q.width}:${q.height}`,
    ic = zn.current,
    cc =
      ic !== null &&
      ic.showImages === C &&
      ic.updateFormControl === Ve &&
      ic.chartRects === Ea &&
      ic.formControlRects === ja &&
      ic.formControlItemsById === We &&
      ic.shapeRects === Aa &&
      ic.imageRects === Na &&
      ic.selectedChartId === Se &&
      ic.selectedImageId === we &&
      ic.readOnly === H &&
      ic.onFormControlAction === l &&
      ic.onFormControlChange === u &&
      ic.selectionStroke === da &&
      ic.renderChartLoading === d &&
      ic.renderFormControl === f &&
      ic.renderImage === m &&
      ic.renderImageSelection === h &&
      ic.isChartsLoading === de &&
      ic.selectedChartElement === xe &&
      ic.palette === p &&
      ic.drawingViewportSignature === rc,
    lc = cc
      ? ic.value
      : C
        ? {
            corner: (0, K.jsxs)(K.Fragment, {
              children: [
                Ea.map(({ chart: e, rect: t }: any) => qs(e, t, `corner`)),
                Aa.map(({ shape: e, rect: t }: any) => Ws(e, t, `corner`)),
                ja.map(({ control: e, rect: t }: any) => Gs(e, t, `corner`)),
                Na.map(({ image: e, rect: t }: any) => Ks(e, t, `corner`)),
              ],
            }),
            left: (0, K.jsxs)(K.Fragment, {
              children: [
                Ea.map(({ chart: e, rect: t }: any) => qs(e, t, `left`)),
                Aa.map(({ shape: e, rect: t }: any) => Ws(e, t, `left`)),
                ja.map(({ control: e, rect: t }: any) => Gs(e, t, `left`)),
                Na.map(({ image: e, rect: t }: any) => Ks(e, t, `left`)),
              ],
            }),
            scroll: (0, K.jsxs)(K.Fragment, {
              children: [
                Ea.map(({ chart: e, rect: t }: any) => qs(e, t, `scroll`)),
                Aa.map(({ shape: e, rect: t }: any) => Ws(e, t, `scroll`)),
                ja.map(({ control: e, rect: t }: any) => Gs(e, t, `scroll`)),
                Na.map(({ image: e, rect: t }: any) => Ks(e, t, `scroll`)),
              ],
            }),
            top: (0, K.jsxs)(K.Fragment, {
              children: [
                Ea.map(({ chart: e, rect: t }: any) => qs(e, t, `top`)),
                Aa.map(({ shape: e, rect: t }: any) => Ws(e, t, `top`)),
                ja.map(({ control: e, rect: t }: any) => Gs(e, t, `top`)),
                Na.map(({ image: e, rect: t }: any) => Ks(e, t, `top`)),
              ],
            }),
          }
        : { corner: null, left: null, scroll: null, top: null };
  cc ||
    (zn.current = {
      chartRects: Ea,
      drawingViewportSignature: rc,
      formControlItemsById: We,
      formControlRects: ja,
      imageRects: Na,
      isChartsLoading: de,
      onFormControlAction: l,
      onFormControlChange: u,
      palette: p,
      readOnly: H,
      renderChartLoading: d,
      renderFormControl: f,
      renderImage: m,
      renderImageSelection: h,
      selectedChartElement: xe,
      selectedChartId: Se,
      selectedImageId: we,
      selectionStroke: da,
      shapeRects: Aa,
      showImages: C,
      updateFormControl: Ve,
      value: lc,
    });
  function uc(e: any, t: any, n: any, r: any) {
    if (!Ge) return;
    ((en.current = {
      actualIndex: t,
      initialPx: n,
      pointerId: e,
      startPosition: r,
      type: `column`,
    }),
      (St.current = { actualIndex: t, size: n }),
      (Ct.current = null));
    let i = Za(`column`, r);
    (Un(i === null ? null : { position: i, type: `column` }),
      nr(`select`),
      Dr(`col-resize`),
      (document.body.style.userSelect = `none`));
  }
  function fc(e: any, t: any, n: any, r: any) {
    if (!Ge) return;
    ((en.current = { actualIndex: t, initialPx: n, pointerId: e, startPosition: r, type: `row` }),
      (Ct.current = { actualIndex: t, size: n }),
      (St.current = null));
    let i = Za(`row`, r);
    (Un(i === null ? null : { position: i, type: `row` }),
      nr(`select`),
      Dr(`row-resize`),
      (document.body.style.userSelect = `none`));
  }
  function pc(e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any, c: any, l: any, u: any) {
    eo();
    let d = cg(c);
    ((an.current = {
      anchor: n,
      axis: r,
      contentScaleX: a.contentScaleX,
      contentScaleY: a.contentScaleY,
      committedOnPointerDown: s,
      didDrag: !1,
      originCell: i,
      originOverlayRect: o,
      originContentX: a.originContentX,
      originContentY: a.originContentY,
      pointerId: t,
      previewRange: d,
      startClientX: l,
      startClientY: u,
    }),
      (Wn.current = d),
      (qt.current = d),
      qa(d),
      ro(t, e));
  }
  function mc(e: any, t: any) {
    let n = cg(e);
    if (dg(t, n)) return n;
    let r = Math.max(0, n.start.row - t.row),
      i = Math.max(0, t.row - n.end.row),
      a = Math.max(0, n.start.col - t.col),
      o = Math.max(0, t.col - n.end.col);
    return cg(
      Math.max(r, i) >= Math.max(a, o)
        ? {
            start: { row: r > 0 ? t.row : n.start.row, col: n.start.col },
            end: { row: i > 0 ? t.row : n.end.row, col: n.end.col },
          }
        : {
            start: { row: n.start.row, col: a > 0 ? t.col : n.start.col },
            end: { row: n.end.row, col: o > 0 ? t.col : n.end.col },
          },
    );
  }
  function hc(e: any, t: any) {
    if (H) return;
    un.current = Ke.current?.getBoundingClientRect() ?? null;
    let n = cg(t);
    ((on.current = { pointerId: e, previewRange: n, sourceRange: n }),
      Sn(n),
      nr(`fill`),
      (document.body.style.cursor = `crosshair`),
      (document.body.style.userSelect = `none`),
      ao(e, n));
  }
  function gc(e: any) {
    let t = on.current;
    if (!t) return;
    let n = mc(t.sourceRange, e);
    ((t.previewRange = n), qa(n));
  }
  function _c(e: any) {
    dn.current?.();
    let t = (e: any, t: any, n: any) => {
        let r = t - e.startClientX,
          i = n - e.startClientY;
        return S_(
          e.type === `move`
            ? { ...e.baseRect, left: e.baseRect.left + r, top: e.baseRect.top + i }
            : dc(e.baseRect, e.handle, r, i, vr),
          { contentOffsetLeft: X, contentOffsetTop: Y, minSizePx: vr },
        );
      },
      n = (n: any) => {
        if (n.pointerId !== e) return;
        let r = fn.current;
        if (!r) return;
        let i = n.clientX - r.startClientX,
          a = n.clientY - r.startClientY;
        !r.didMove && (Math.abs(i) > 3 || Math.abs(a) > 3) && (r.didMove = !0);
        let o = t(r, n.clientX, n.clientY);
        Ai({ id: r.imageId, rect: o });
      },
      r = () => {
        (window.removeEventListener(`pointermove`, n),
          window.removeEventListener(`pointerup`, i),
          window.removeEventListener(`pointercancel`, i));
      },
      i = (n: any) => {
        if (n.pointerId !== e) return;
        let i = fn.current;
        Jn.current !== null && (window.cancelAnimationFrame(Jn.current), (Jn.current = null));
        let a = Yn.current;
        ((Yn.current = null), a && ((qn.current = a), Kn(a)));
        let o = i ? t(i, n.clientX, n.clientY) : null;
        ((fn.current = null),
          (dn.current = null),
          nr(`idle`),
          (document.body.style.cursor = ``),
          (document.body.style.userSelect = ``),
          r(),
          i && (i.didMove && (Qn.current = i.imageId), i.didMove && o && Ne(i.imageId, oi(o))),
          (qn.current = null),
          Kn(null));
      };
    (window.addEventListener(`pointermove`, n),
      window.addEventListener(`pointerup`, i),
      window.addEventListener(`pointercancel`, i),
      (dn.current = r));
  }
  function vc(e: any) {
    pn.current?.();
    let t = (e: any, t: any, n: any) => {
        let r = t - e.startClientX,
          i = n - e.startClientY;
        return S_(
          e.type === `move`
            ? { ...e.baseRect, left: e.baseRect.left + r, top: e.baseRect.top + i }
            : dc(e.baseRect, e.handle, r, i, 48 * J),
          { contentOffsetLeft: X, contentOffsetTop: Y, minSizePx: 48 * J },
        );
      },
      n = (n: any) => {
        if (n.pointerId !== e) return;
        let r = mn.current;
        if (!r) return;
        let i = n.clientX - r.startClientX,
          a = n.clientY - r.startClientY;
        !r.didMove && (Math.abs(i) > 3 || Math.abs(a) > 3) && (r.didMove = !0);
        let o = t(r, n.clientX, n.clientY);
        ji({ id: r.chartId, rect: o });
      },
      r = () => {
        (window.removeEventListener(`pointermove`, n),
          window.removeEventListener(`pointerup`, i),
          window.removeEventListener(`pointercancel`, i));
      },
      i = (n: any) => {
        if (n.pointerId !== e) return;
        let i = mn.current;
        Xn.current !== null && (window.cancelAnimationFrame(Xn.current), (Xn.current = null));
        let a = Zn.current;
        ((Zn.current = null), a && ((Ln.current = a), wn(a)));
        let o = i ? t(i, n.clientX, n.clientY) : null;
        ((mn.current = null),
          (pn.current = null),
          nr(`idle`),
          (document.body.style.cursor = ``),
          (document.body.style.userSelect = ``),
          r(),
          i && (i.didMove && (Rn.current = i.chartId), i.didMove && o && Me(i.chartId, oi(o))),
          (Ln.current = null),
          wn(null));
      };
    (window.addEventListener(`pointermove`, n),
      window.addEventListener(`pointerup`, i),
      window.addEventListener(`pointercancel`, i),
      (pn.current = r));
  }
  function yc() {
    return T && Br.has(T.row) && Vr.has(T.col)
      ? T
      : ni === void 0 || ii === void 0
        ? null
        : { row: ni, col: ii };
  }
  function bc(e: any, t: any) {
    let n = Ke.current;
    if (!n) return;
    let r = n.scrollTop,
      i = n.scrollLeft,
      a = Y + (Kr[e] ?? 0),
      o = Y + (Kr[e + 1] ?? a),
      s = X + (qr[t] ?? 0),
      c = X + (qr[t + 1] ?? s);
    if (o > Qr) {
      let e = n.scrollTop + Qr,
        t = n.scrollTop + n.clientHeight;
      a < e ? (r = a - Qr) : o > t && (r = o - n.clientHeight);
    }
    if (c > $r) {
      let e = n.scrollLeft + $r,
        t = n.scrollLeft + n.clientWidth;
      s < e ? (i = s - $r) : c > t && (i = c - n.clientWidth);
    }
    ((r = Math.max(0, Math.min(r, n.scrollHeight - n.clientHeight))),
      (i = Math.max(0, Math.min(i, n.scrollWidth - n.clientWidth))),
      r !== n.scrollTop && (n.scrollTop = r),
      i !== n.scrollLeft && (n.scrollLeft = i),
      Er(n, { immediate: !0 }));
  }
  function xc(e: any, t: any, n: any) {
    let r = Math.max(0, Math.min(e, jr.length - 1)),
      i = Math.max(0, Math.min(t, Z.length - 1)),
      a = jr[r],
      o = Z[i];
    if (a === void 0 || o === void 0) return;
    let s = { start: { row: a, col: o }, end: { row: a, col: o } };
    ((Ze.current = null),
      (Wn.current = null),
      (qt.current = s),
      qa(s),
      Te({ row: a, col: o }, n ? { extend: !0 } : void 0),
      bc(r, i));
  }
  function Sc(e: any, t: any) {
    let n = Ke.current,
      r = Math.max(gr, (n?.clientHeight ?? gr * 20) - Qr),
      i = Kr[e] ?? 0,
      a = t > 0 ? i + r : i - r;
    return Math.max(0, Math.min(wg(Kr, a), jr.length - 1));
  }
  function Cc(e: any, t: any) {
    let n = Ke.current,
      r = Math.max(_r, (n?.clientWidth ?? _r * 8) - $r),
      i = qr[e] ?? 0,
      a = t > 0 ? i + r : i - r;
    return Math.max(0, Math.min(wg(qr, a), Z.length - 1));
  }
  function wc(e: any) {
    let t = Ze.current;
    if (t?.axis !== `column` || ni === void 0) return null;
    let n = Math.min(t.startCol, t.endCol),
      r = Math.max(t.startCol, t.endCol),
      i = e === `ArrowLeft` ? n - 1 : e === `ArrowRight` ? r + 1 : null;
    if (i === null) return null;
    let a = Br.get(ni),
      o = Vr.get(i);
    return a === void 0 || o === void 0 ? null : { colIndex: o, rowIndex: a };
  }
  function Tc(e: any) {
    let t = Ze.current;
    if (t?.axis !== `row` || ii === void 0) return null;
    let n = Math.min(t.startRow, t.endRow),
      r = Math.max(t.startRow, t.endRow),
      i = e === `ArrowUp` ? n - 1 : e === `ArrowDown` ? r + 1 : null;
    if (i === null) return null;
    let a = Br.get(i),
      o = Vr.get(ii);
    return a === void 0 || o === void 0 ? null : { colIndex: o, rowIndex: a };
  }
  function Ec(e: any) {
    if (hn) return;
    if (!H && (e.metaKey || e.ctrlKey) && !e.altKey) {
      let t = e.key.toLowerCase();
      if (t === `z` && e.shiftKey) {
        (e.preventDefault(), ve());
        return;
      }
      if (t === `z`) {
        (e.preventDefault(), Be());
        return;
      }
      if (t === `y`) {
        (e.preventDefault(), ve());
        return;
      }
    }
    let t = yc();
    if (!t) return;
    let n = Br.get(t.row) ?? 0,
      r = Vr.get(t.col) ?? 0,
      i = e.ctrlKey || e.metaKey;
    if (!H && mg(e)) {
      (e.preventDefault(), Wi(t, e.key));
      return;
    }
    switch (e.key) {
      case `ArrowDown`:
        if ((e.preventDefault(), !e.shiftKey && !i)) {
          let t = Tc(e.key);
          if (t) {
            xc(t.rowIndex, t.colIndex, !1);
            break;
          }
        }
        xc(i ? (Br.get(ry(jr, E?.maxUsedRow ?? -1)) ?? jr.length - 1) : n + 1, r, e.shiftKey);
        break;
      case `ArrowUp`:
        if ((e.preventDefault(), !e.shiftKey && !i)) {
          let t = Tc(e.key);
          if (t) {
            xc(t.rowIndex, t.colIndex, !1);
            break;
          }
        }
        xc(i ? (Br.get(ny(jr, E?.minUsedRow ?? -1)) ?? 0) : n - 1, r, e.shiftKey);
        break;
      case `ArrowLeft`:
        if ((e.preventDefault(), !e.shiftKey && !i)) {
          let t = wc(e.key);
          if (t) {
            xc(t.rowIndex, t.colIndex, !1);
            break;
          }
        }
        xc(n, i ? (Vr.get(ny(Z, E?.minUsedCol ?? -1)) ?? 0) : r - 1, e.shiftKey);
        break;
      case `ArrowRight`:
        if ((e.preventDefault(), !e.shiftKey && !i)) {
          let t = wc(e.key);
          if (t) {
            xc(t.rowIndex, t.colIndex, !1);
            break;
          }
        }
        xc(n, i ? (Vr.get(ry(Z, E?.maxUsedCol ?? -1)) ?? Z.length - 1) : r + 1, e.shiftKey);
        break;
      case `Home`:
        (e.preventDefault(),
          xc(
            i ? (Br.get(ny(jr, E?.minUsedRow ?? -1)) ?? 0) : n,
            Vr.get(ny(Z, E?.minUsedCol ?? -1)) ?? 0,
            e.shiftKey,
          ));
        break;
      case `End`:
        (e.preventDefault(),
          xc(
            i ? (Br.get(ry(jr, E?.maxUsedRow ?? -1)) ?? jr.length - 1) : n,
            Vr.get(ry(Z, E?.maxUsedCol ?? -1)) ?? Z.length - 1,
            e.shiftKey,
          ));
        break;
      case `PageDown`:
        if ((e.preventDefault(), e.altKey)) {
          xc(n, Cc(r, 1), e.shiftKey);
          break;
        }
        xc(Sc(n, 1), r, e.shiftKey);
        break;
      case `PageUp`:
        if ((e.preventDefault(), e.altKey)) {
          xc(n, Cc(r, -1), e.shiftKey);
          break;
        }
        xc(Sc(n, -1), r, e.shiftKey);
        break;
      case `Tab`:
        (e.preventDefault(),
          e.shiftKey
            ? xc(r > 0 ? n : n - 1, r > 0 ? r - 1 : Z.length - 1, !1)
            : xc(r < Z.length - 1 ? n : n + 1, r < Z.length - 1 ? r + 1 : 0, !1));
        break;
      case `Enter`:
        if ((e.preventDefault(), e.metaKey || e.ctrlKey || e.altKey)) break;
        if (e.shiftKey) {
          xc(n - 1, r, !1);
          break;
        }
        xc(n + 1, r, !1);
        break;
      case `Backspace`:
      case `Delete`:
        H || (e.preventDefault(), F());
        break;
      case `F2`:
        H || (e.preventDefault(), Wi(t));
        break;
      default:
        break;
    }
  }
  Xe.current = Ec;
  let Dc = {
      ref: Ke,
      "aria-colcount": Math.max(E?.colCount ?? 0, fr),
      "aria-keyshortcuts": `ArrowUp ArrowDown ArrowLeft ArrowRight Home End PageUp PageDown Control+Home Control+End`,
      "aria-label": E ? `${E.name} worksheet grid` : `Workbook grid`,
      "aria-readonly": H,
      "aria-rowcount": Math.max(E?.rowCount ?? 0, ur),
      role: `grid`,
      onScroll: Mi,
      onCopy: (e: any) => {
        if (hn) return;
        let t = e.clipboardData,
          n = ae();
        if (n) {
          if ((e.preventDefault(), t)) {
            (t.setData(`text/plain`, n.text),
              t.setData(`text/html`, n.html),
              t.setData(Tm, n.structured));
            return;
          }
          he();
        }
      },
      onPointerDownCapture: (e: any) => {
        e.button === 0 &&
          (gg(e.target, e.currentTarget) || ((Ye.current = !0), Vi(e.currentTarget)));
      },
      onClickCapture: (e: any) => {
        gg(e.target, e.currentTarget) || ((Ye.current = !0), Vi(e.currentTarget));
      },
      onFocus: () => {
        Ye.current = !0;
      },
      onKeyDown: Ec,
      onPaste: (e: any) => {
        if (hn || H) return;
        let t = e.clipboardData;
        if (!t) {
          (e.preventDefault(), V());
          return;
        }
        let n = t.getData(Tm),
          r = t.getData(`text/plain`);
        if (!(!n && !r)) {
          if ((e.preventDefault(), n)) {
            ge(n);
            return;
          }
          _e(r);
        }
      },
      tabIndex: 0,
      style: {
        "--xlsx-menu-active": la,
        "--xlsx-menu-border": p.strongBorder,
        "--xlsx-menu-surface": p.surface,
        "--xlsx-selection-header": ua,
        backgroundColor: p.canvas,
        color: p.text,
        cursor: Hn?.type === `column` ? `col-resize` : Hn?.type === `row` ? `row-resize` : void 0,
        flex: 1,
        height: `100%`,
        minHeight: 0,
        minWidth: 0,
        outline: `none`,
        overflow: `auto`,
        width: `100%`,
      },
    },
    Oc = (0, K.jsx)(`div`, {
      style: {
        backgroundColor: sg(E, p),
        minHeight: `100%`,
        minWidth: `100%`,
        position: `relative`,
        width: as,
        height: os,
      },
      children: (0, K.jsxs)(`div`, {
        ref: qe,
        style: {
          height: os,
          left: 0,
          position: `absolute`,
          top: 0,
          transform: !y && ss ? `translate3d(${ds}px, ${fs}px, 0) scale(${cs})` : void 0,
          transformOrigin: `0 0`,
          transition: `none`,
          willChange: !y && ss ? `transform` : void 0,
          width: as,
        },
        children: [
          C && !y
            ? (0, K.jsxs)(K.Fragment, {
                children: [
                  (0, K.jsx)(`div`, { style: Ys, children: lc.top }),
                  (0, K.jsx)(`div`, { style: Xs, children: lc.left }),
                  (0, K.jsx)(`div`, { style: Zs, children: lc.corner }),
                  (0, K.jsx)(`div`, { style: Js, children: lc.scroll }),
                ],
              })
            : null,
          y
            ? (0, K.jsxs)(K.Fragment, {
                children: [
                  (0, K.jsxs)(`div`, {
                    style: Ds,
                    children: [
                      (0, K.jsx)(`canvas`, {
                        ref: Qe,
                        onClick: Uo,
                        onDoubleClick: Wo,
                        onPointerDown: Ho,
                        style: As,
                      }),
                      (0, K.jsx)(`canvas`, {
                        ref: $e,
                        onClick: Uo,
                        onDoubleClick: Wo,
                        onPointerDown: Ho,
                        style: js,
                      }),
                      (0, K.jsx)(`canvas`, {
                        ref: et,
                        onClick: Uo,
                        onDoubleClick: Wo,
                        onPointerDown: Ho,
                        style: Ms,
                      }),
                      (0, K.jsx)(`canvas`, {
                        ref: tt,
                        onClick: Uo,
                        onDoubleClick: Wo,
                        onPointerDown: Ho,
                        style: Ns,
                      }),
                      Pa
                        ? (0, K.jsxs)(K.Fragment, {
                            children: [
                              (0, K.jsx)(`div`, {
                                style: $s,
                                children: (0, K.jsx)(`div`, {
                                  ref: ct,
                                  style: {
                                    height: os,
                                    left: 0,
                                    pointerEvents: `none`,
                                    position: `absolute`,
                                    top: 0,
                                    transform: `translate(${-q.left - $r}px, ${-q.top - Qr}px)`,
                                    transformOrigin: `0 0`,
                                    width: as,
                                  },
                                  children: lc.scroll,
                                }),
                              }),
                              (0, K.jsx)(`div`, {
                                style: ec,
                                children: (0, K.jsx)(`div`, {
                                  ref: lt,
                                  style: {
                                    height: os,
                                    left: 0,
                                    pointerEvents: `none`,
                                    position: `absolute`,
                                    top: 0,
                                    transform: `translate(${-q.left - $r}px, ${-Y}px)`,
                                    transformOrigin: `0 0`,
                                    width: as,
                                  },
                                  children: lc.top,
                                }),
                              }),
                              (0, K.jsx)(`div`, {
                                style: tc,
                                children: (0, K.jsx)(`div`, {
                                  ref: ut,
                                  style: {
                                    height: os,
                                    left: 0,
                                    pointerEvents: `none`,
                                    position: `absolute`,
                                    top: 0,
                                    transform: `translate(${-X}px, ${-q.top - Qr}px)`,
                                    transformOrigin: `0 0`,
                                    width: as,
                                  },
                                  children: lc.left,
                                }),
                              }),
                              (0, K.jsx)(`div`, {
                                style: nc,
                                children: (0, K.jsx)(`div`, {
                                  ref: dt,
                                  style: {
                                    height: os,
                                    left: 0,
                                    pointerEvents: `none`,
                                    position: `absolute`,
                                    top: 0,
                                    transform: `translate(${-X}px, ${-Y}px)`,
                                    transformOrigin: `0 0`,
                                    width: as,
                                  },
                                  children: lc.corner,
                                }),
                              }),
                            ],
                          })
                        : null,
                    ],
                  }),
                  (0, K.jsxs)(`div`, {
                    style: Os,
                    children: [
                      (0, K.jsx)(`canvas`, {
                        ref: rt,
                        onPointerLeave: Vo,
                        onPointerMove: zo,
                        onPointerDown: Go,
                        style: Fs,
                      }),
                      (0, K.jsx)(`canvas`, {
                        ref: it,
                        onPointerLeave: Vo,
                        onPointerMove: zo,
                        onPointerDown: Go,
                        style: Is,
                      }),
                      (0, K.jsx)(`canvas`, {
                        ref: at,
                        onPointerLeave: Vo,
                        onPointerMove: Bo,
                        onPointerDown: Ko,
                        style: Ls,
                      }),
                      (0, K.jsx)(`canvas`, {
                        ref: ot,
                        onPointerLeave: Vo,
                        onPointerMove: Bo,
                        onPointerDown: Ko,
                        style: Rs,
                      }),
                      (0, K.jsx)(`canvas`, { ref: st, style: zs }),
                    ],
                  }),
                  hn && Bs
                    ? (() => {
                        let e = sa(hn.row, hn.col).style,
                          t = typeof e.backgroundColor == `string` ? e.backgroundColor : sg(E, p),
                          n = typeof e.color == `string` ? e.color : L_(null, t, p);
                        return (0, K.jsx)(`div`, {
                          style: {
                            left: Bs.left,
                            position: `absolute`,
                            top: Bs.top,
                            width: Bs.width,
                            height: Bs.height,
                            zIndex: 28,
                          },
                          children: (0, K.jsx)(`input`, {
                            ref: Mt,
                            autoFocus: !0,
                            onBlur: qi,
                            onChange: (e: any) => vn(e.target.value),
                            onKeyDown: (e: any) => {
                              if ((e.stopPropagation(), e.key === `Enter`)) {
                                (e.preventDefault(), Gi());
                                return;
                              }
                              if (e.key === `Escape`) {
                                (e.preventDefault(), Ki());
                                return;
                              }
                              (e.key === `ArrowDown` ||
                                e.key === `ArrowLeft` ||
                                e.key === `ArrowRight` ||
                                e.key === `ArrowUp`) &&
                                (e.preventDefault(), Ji(e.key, e.currentTarget.value));
                            },
                            style: {
                              backgroundColor: t,
                              border: 0,
                              boxShadow: `inset 0 0 0 ${ms}px ${da}`,
                              boxSizing: `border-box`,
                              color: n,
                              display: `block`,
                              font: kh(e, 12 * J),
                              height: `100%`,
                              margin: 0,
                              minHeight: 0,
                              outline: `none`,
                              overflow: `hidden`,
                              padding: wh(ih, J),
                              width: `100%`,
                            },
                            value: _n,
                          }),
                        });
                      })()
                    : null,
                  Vs && Hs
                    ? (0, K.jsx)(`div`, {
                        style: {
                          height: Hs.height,
                          left: Hs.left,
                          pointerEvents: `none`,
                          position: `absolute`,
                          top: Hs.top,
                          width: Hs.width,
                          zIndex: 27,
                        },
                        children: (0, K.jsx)(`div`, {
                          style: {
                            height: `100%`,
                            pointerEvents: `auto`,
                            position: `relative`,
                            width: `100%`,
                          },
                          children: Vs,
                        }),
                      })
                    : null,
                ],
              })
            : (0, K.jsxs)(`table`, {
                ref: Je,
                style: {
                  borderCollapse: `collapse`,
                  color: `#000000`,
                  flex: `0 0 auto`,
                  tableLayout: `fixed`,
                  width: as,
                },
                children: [
                  (0, K.jsxs)(`colgroup`, {
                    children: [
                      (0, K.jsx)(`col`, { style: { width: X } }),
                      xa > 0 ? (0, K.jsx)(`col`, { style: { width: xa } }) : null,
                      pa.map((e: any) =>
                        (0, K.jsx)(
                          `col`,
                          {
                            ref: (t: any) => {
                              t ? vt.current.set(e.actualCol, t) : vt.current.delete(e.actualCol);
                            },
                            style: { width: e.size },
                          },
                          e.key,
                        ),
                      ),
                      Sa > 0 ? (0, K.jsx)(`col`, { style: { width: Sa } }) : null,
                    ],
                  }),
                  (0, K.jsx)(`thead`, {
                    style: { position: `sticky`, top: 0, zIndex: xs },
                    children: (0, K.jsxs)(`tr`, {
                      children: [
                        (0, K.jsx)(`th`, {
                          style: {
                            ...Ts,
                            backgroundColor: p.headerSurface,
                            left: 0,
                            width: X,
                            zIndex: Cs,
                          },
                        }),
                        xa > 0
                          ? (0, K.jsx)(`th`, {
                              "aria-hidden": `true`,
                              style: { ...Ts, padding: 0, width: xa },
                            })
                          : null,
                        pa.map((e: any) =>
                          (0, K.jsx)(
                            `th`,
                            {
                              "data-xlsx-col-header": e.actualCol,
                              ref: (t: any) => Ka(e.actualCol, t),
                              onPointerDown: (t: any) => uo(t, e.actualCol),
                              style: {
                                ...Ts,
                                left: Zr.get(e.actualCol),
                                zIndex: Zr.has(e.actualCol) ? Ss : Ts.zIndex,
                              },
                              children: (0, K.jsxs)(`div`, {
                                style: { position: `relative` },
                                children: [
                                  (0, K.jsx)(`span`, {
                                    style: {
                                      display: `inline-block`,
                                      transform: ps === 1 ? void 0 : `scale(${1 / ps})`,
                                      transformOrigin: `center center`,
                                    },
                                    children: T_(e.actualCol),
                                  }),
                                  (0, K.jsx)(`div`, {
                                    onPointerDown: (t: any) => {
                                      Ge &&
                                        (t.preventDefault(),
                                        t.stopPropagation(),
                                        uc(t.pointerId, e.actualCol, e.size, t.clientX));
                                    },
                                    style: Es,
                                  }),
                                ],
                              }),
                            },
                            e.key,
                          ),
                        ),
                        Sa > 0
                          ? (0, K.jsx)(`th`, {
                              "aria-hidden": `true`,
                              style: { ...Ts, padding: 0, width: Sa },
                            })
                          : null,
                      ],
                    }),
                  }),
                  (0, K.jsxs)(`tbody`, {
                    children: [
                      rs.map((e: any, t: any) => {
                        let n = jr[e.index];
                        if (n === void 0) return null;
                        let r = t === 0 ? 0 : (rs[t - 1]?.end ?? 0),
                          i = Math.max(0, e.start - r);
                        return (0, K.jsxs)(
                          G.Fragment,
                          {
                            children: [
                              i > 0
                                ? (0, K.jsx)(`tr`, {
                                    "aria-hidden": `true`,
                                    style: { height: i },
                                    children: (0, K.jsx)(`td`, { colSpan: _s }),
                                  })
                                : null,
                              (0, K.jsx)(
                                ay,
                                {
                                  actualRow: n,
                                  editingCell: hn,
                                  editingValue: _n,
                                  frozenRowHeaderZIndex: ws,
                                  getCellData: sa,
                                  leadingSpacerWidth: xa,
                                  onCellClick: so,
                                  onCellDoubleClick: oo,
                                  onCellPointerDown: co,
                                  onEditingBlur: qi,
                                  onEditingCancel: Ki,
                                  onEditingCommit: Gi,
                                  onEditingNavigate: Ji,
                                  onEditingValueChange: vn,
                                  headerLabelLiveScale: ps,
                                  onRowHeaderRef: Ga,
                                  onRowPointerDown: lo,
                                  onRowResizePointerDown: fo,
                                  palette: p,
                                  readOnly: H,
                                  renderCellAdornment: $,
                                  rowHeight: e.size,
                                  rowHeaderZIndex: bs,
                                  rowHeaderWidth: X,
                                  stickyLeftByCol: Zr,
                                  stickyTop: Xr.get(n),
                                  trailingSpacerWidth: Sa,
                                  visibleCols: pa,
                                  zoomFactor: J,
                                },
                                e.key,
                              ),
                            ],
                          },
                          `row-fragment-${e.key}`,
                        );
                      }),
                      rs.length > 0 && is - (rs[rs.length - 1]?.end ?? is) > 0
                        ? (0, K.jsx)(`tr`, {
                            style: { height: is - (rs[rs.length - 1]?.end ?? is) },
                            children: (0, K.jsx)(`td`, { colSpan: _s }),
                          })
                        : null,
                    ],
                  }),
                ],
              }),
          (0, K.jsxs)(`div`, {
            ref: mt,
            style: {
              height: 0,
              left: 0,
              overflow: `visible`,
              pointerEvents: `none`,
              position: `absolute`,
              top: 0,
              transformOrigin: `0 0`,
              transition: `none`,
              width: 0,
              zIndex: 24,
            },
            children: [
              (0, K.jsx)(`div`, {
                ref: pt,
                style: {
                  backgroundColor: la,
                  boxSizing: `border-box`,
                  boxShadow: `inset 0 0 0 ${ms}px ${da}`,
                  contain: `layout paint`,
                  height: ca?.height ?? 0,
                  left: ca?.left ?? 0,
                  opacity: +!!ca,
                  pointerEvents: `none`,
                  position: `absolute`,
                  top: ca?.top ?? 0,
                  transition: gs,
                  visibility: ca ? `visible` : `hidden`,
                  willChange: hs ? `left, top, width, height` : void 0,
                  width: ca?.width ?? 0,
                  zIndex: 24,
                },
              }),
              (0, K.jsx)(`div`, {
                ref: ht,
                "aria-hidden": `true`,
                style: {
                  alignItems: `center`,
                  color: p.mutedText,
                  display: `inline-flex`,
                  fontSize: 10 * J,
                  fontWeight: 700,
                  height: 16 * J,
                  justifyContent: `center`,
                  opacity: 0,
                  pointerEvents: `none`,
                  position: `absolute`,
                  transform: `translateY(-50%)`,
                  visibility: `hidden`,
                  width: 12 * J,
                  zIndex: 26,
                },
                children: `▾`,
              }),
              (0, K.jsx)(`div`, {
                ref: gt,
                onPointerDown: (e: any) => {
                  H ||
                    e.button !== 0 ||
                    !sr ||
                    !ca ||
                    (e.preventDefault(), e.stopPropagation(), hc(e.pointerId, sr));
                },
                style: {
                  backgroundColor: da,
                  border: `${Math.max(1, J)}px solid ${p.surface}`,
                  contain: `layout paint`,
                  cursor: `crosshair`,
                  display: !H && ca ? `block` : `none`,
                  height: 8 * J,
                  left: ca ? ca.left + ca.width - 4 * J : 0,
                  pointerEvents: `auto`,
                  position: `absolute`,
                  top: ca ? ca.top + ca.height - 4 * J : 0,
                  transition: hs
                    ? `left 120ms cubic-bezier(0.22, 1, 0.36, 1), top 120ms cubic-bezier(0.22, 1, 0.36, 1)`
                    : `none`,
                  willChange: hs ? `left, top` : void 0,
                  width: 8 * J,
                  zIndex: 25,
                },
              }),
            ],
          }),
          Hn
            ? (0, K.jsx)(`div`, {
                "aria-hidden": `true`,
                style: {
                  backgroundColor: da,
                  borderRadius: Math.max(999, 3 * J),
                  boxShadow: `0 0 0 ${Math.max(1, J)}px ${p.surface}`,
                  height: Hn.type === `column` ? Math.max(12, 14 * J) : Math.max(3, 2 * J),
                  left:
                    Hn.type === `column` ? Hn.position - Math.max(2, 1.5 * J) : Math.max(3, 4 * J),
                  pointerEvents: `none`,
                  position: `absolute`,
                  top:
                    Hn.type === `column`
                      ? Math.max(2 * J, Y - Math.max(14, 16 * J))
                      : Hn.position - Math.max(2, 1.5 * J),
                  width: Hn.type === `column` ? Math.max(3, 2 * J) : Math.max(12, 14 * J),
                  zIndex: 52,
                },
              })
            : null,
          !g && Ua
            ? (0, K.jsx)(`div`, {
                ref: _t,
                style: {
                  color: p.text,
                  left: Math.max(X + 4 * J, Ua.left),
                  position: `absolute`,
                  top: Ua.top,
                  zIndex: 50,
                },
                children: (0, K.jsx)(xv, {
                  cell: { col: Ua.column.index + Ua.table.start.col, row: Ua.table.start.row },
                  column: Ua.column,
                  direction:
                    Re && Re.tableName === Ua.table.name && Re.columnIndex === Ua.column.index
                      ? Re.direction
                      : null,
                  sortAscending: () => {
                    (U(Ua.table.name, Ua.column.index, `ascending`), bn(null));
                  },
                  sortDescending: () => {
                    (U(Ua.table.name, Ua.column.index, `descending`), bn(null));
                  },
                  table: Ua.table,
                  triggerIcon: `▾`,
                  triggerProps: { type: `button` },
                }),
              })
            : null,
        ],
      }),
    });
  return (0, K.jsx)(`div`, {
    style: { backgroundColor: p.canvas, display: `flex`, flex: 1, minHeight: 0, minWidth: 0 },
    children: _
      ? _({ children: Oc, viewportProps: Dc })
      : (0, K.jsx)(`div`, { ...Dc, children: Oc }, A),
  });
}

/* ============================================================================
 * 导出（oy 为 chunk 内唯一顶层符号；消费方 = 同 chunk sy/cy/ly 顶层组件，
 * 见 XlsxPreview.report.md §3.3 接触面登记）
 * ==========================================================================*/

export { oy as SpreadsheetGrid };
export default oy;

/* ============================================================================
 * SYMBOLS — 文件尾符号表（供 SYMBOL-INDEX 增量抽取）
 * ----------------------------------------------------------------------------
 * | 混淆名 | 语义名                | js 行        | jsx 行       | 把握度 |
 * |--------|-----------------------|--------------|--------------|--------|
 * | oy     | SpreadsheetGrid       | 193217–199291| 44862–49526  | 高（结构逐字；类型注记机器补） |
 *
 * 外部依赖登记（本文件仅 declare；canonical 见各段）：
 *   G=React 互操作(9111) · K=jsx-runtime(9113) · k=useVirtualizer
 *   (@tanstack/react-virtual 3.13.23, esm-BY6T6pIH.js) ·
 *   常量段 189512–189563（38 项，值见声明注记）· ac/oc/sc(14200–14206) ·
 *   dc(14259) · Dl(14726) · gm(189364, B5-12a) · ay(193182) ·
 *   助手群 189593–192831（~100 项，逐条行号见声明注记）
 *
 * 关键局部名语义注记（oy 体内，保留原名；详见报告 §2）：
 *   w=画布剖析起点时刻 · T..Ue=控制器解构面（activeCell..zoomScale）·
 *   We=表单控件项映射 · Ge=可编辑判定 · Ke=滚动容器 ref ·
 *   kn=视口矩形 · An=表头/冻结几何 · jr/Z=可见行/列索引表 ·
 *   Pr/Fr=列宽/行高数组 · J=缩放系数 · yr=层变换同步 · br=缩放会话 ·
 *   Er=滚动同步 · gi/_i=行/列 virtualizer · q/Hn/Gn=画布尺寸/主题态 ·
 *   tr=交互状态机（idle/…） · ir/ar=合并区域与反查表 ·
 *   sr=归一选区 · ur/fr=行/列容量 · lr=tables · Oc=主体内容层 ·
 *   Dc=视口属性集
 * ============================================================================
 */
