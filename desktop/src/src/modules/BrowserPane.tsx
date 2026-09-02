/* eslint-disable */
/**
 * ============================================================================
 * BrowserPane.tsx — ZCode 3.7.6 内嵌浏览器族（地址栏/导航/devtools/响应式/元素选择 · 解混淆重建 · D8 Stage B3 / F13 浏览器侧）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 本族 = 内嵌浏览器：工具栏（后退/前进/刷新/地址栏/响应式/元素选择/⋯更多）、
 * webview 宿主（guest 崩溃原位重建、residency 上报、zoom 同步）、响应式视口
 * （自由尺寸画布 + 8 向把手 + 键盘微调 + fit-to-window 缩放 + 桌面 zoom 合成）、
 * 网页元素选择器（注入脚本 + overlay + tooltip + 上下文入聊天）、截图 surface 稳定
 * 等待、agent 操作期 resize 弱提示。
 * 挂起浏览器占位 `pqt` 已在 SidePanel.tsx 登记重建（SuspendedBrowserTabPlaceholder），
 * 本文件不重复，仅于报告互引。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  网页元素选择器（175990–176538 / jsx 142680 起）：
 *   xUt  → ELEMENT_PICKER_LIMITS   {maxTextChars:4000,maxHtmlChars:6000,maxAttributeChars:500,labels} (176244)
 *   SUt  → injectableElementPickerScript  注入页内的 overlay+tooltip+选择 Promise（纯函数，toString 序列化）(176250)
 *   CUt  → serializeElementPicker        `(${SUt.toString()})(${JSON.stringify(opts)})` (176424)
 *   wUt  → cancelPickerScript            取消已挂载 picker 的 IIFE (176680)
 *   TUt  → isPickerResult                cancelled|selected+element (176689)
 *   EUt  → attachWorkspaceToPickedElement +BH 校验 (176697)
 *   DUt  → originPathOfUrl               origin+pathname，失败→?# 前 (176705)
 *   OUt  → useWebElementPicker           isPicking/start/cancel/toggle + Esc 全局监听 + 卸载取消 (176713)
 *
 *  工具栏（176539–176687 / jsx 143153 起）：
 *   kUt  → BrowserToolbar          form h-12：back/forward/reload/地址/responsive/picker/⋯ (176792)
 *   g5   → ToolbarIconButton       Tooltip+Button icon-md，active→secondary+aria-pressed (176941)
 *   AUt  → BrowserMoreMenu         ⋯ → openExternal / devtools 两项 (176869)
 *   jUt  → BrowserEmptyState       globe|spinner + browser.title/empty 覆盖层 (176920)
 *
 *  响应式视口（176711–177344 / jsx 143300 起）：
 *   MUt  → ZOOM_OPTIONS            [fit,50,75,100,125,150,200] (176965)
 *   NUt  → resolveVisualScale      fit→min(1,(w-32)*zf/vw,(h-32)*zf/vh) (176713)
 *   PUt  → resolveTransformScale   visual/desktopZoom (176974)
 *   FUt  → resolveDesktopLayoutScale  zf>1→{1,1}；zf<1→{1/zf,zf} (176977)
 *   _5=di → RESPONSIVE_VIEWPORT_LIMITS {min320/max3840/min320/max2160}（src-HCld2afU.js 反查）(176732)
 *   IUt/LUt → EDGE_HANDLES(4)/CORNER_HANDLES(4) 把手几何+testid (176734,176770)
 *   RUt  → EDGE_ICON_CLASS         group-hover 显现的把手图标类 (176801)
 *   zUt  → ResponsiveResizeHandles 4 边 separator(role/aria-valuenow/键盘)+4 角 (176802)
 *   BUt  → DEFAULT_VIEWPORT        {width:393,height:852} (177118)
 *   VUt/HUt → clampInt/clampViewport (176867,176870)
 *   UUt  → ResponsiveViewportCanvas  画布+scale 变换+fit 重测 RO+blur 结束拖拽 (177128)
 *   WUt  → BrowserSurface          resize 弱提示条 + UUt + webview（compositor/layout/transform scale data-*）(177337)
 *   GUt/KUt → isValidDimension/dimensionLimits (177169,177178)
 *   qUt  → ResponsiveToolbar       W×H 输入（Popover 报错）+ zoom Select (177439)
 *   JUt  → useFutureTimestamp      未来时间戳到达前为 true (177598)
 *   YUt/XUt/ZUt/QUt → 3000/300/100/500 弱提示时序 (177358)
 *   $Ut  → useBrowserResizeWarning  agent 操作期 ResizeObserver 尺寸变化→3s 弱提示 (177615)
 *
 *  截图 surface 稳定（177456–177618）：
 *   eWt/v5 → roundSize/sizesEqual(±1) (177456,177461)
 *   tWt/nWt/rWt → 0.001/100ms/2500ms (177464)
 *   iWt/aWt → layoutScaleFromDataset/responsiveScaleFromAncestor (177467,177471)
 *   oWt/sWt → surfaceSnapshotEqual/measureWebviewViewport (177474,177478)
 *   cWt  → useScreenshotSurfaceStabilizer  guest 对齐+scale 稳定双帧→surfaceReady 上报 (177738)
 *   lWt/uWt → wheelDelta/guestWheelScrollCanvas（ipc-message WheelBoundary 续接画布滚动）(177592,177596)
 *
 *  桌面 zoom（177617–177641）：
 *   dWt/fWt/pWt → 1.1/-3/5；mWt → 1.1^clamp(round(level),-3,5) (177617,177621)
 *   hWt  → useDesktopZoomFactor    getDesktopZoomLevel+onDesktopZoomLevelChanged (177877)
 *   gWt  → useResponsiveModeController  模式开关/viewport 双向同步（browserViewUpdateViewport/onBrowserViewViewportChanged）(177897)
 *
 *  组件：
 *   _Wt  → BrowserView             根：工具栏+响应式条+surface；webview 事件全集；崩溃重建；residency 上报 (177977)
 *   vWt  → BrowserUseView          TabsContent forceMount 包装（inert/hidden 三态 + screenshot data-state）(178444)
 *   yWt/bWt/xWt → tabMatch/requestMatch/findBrowserUseTab (178241,178251,178260)
 *   SWt  → useScreenshotSurfaceRequest  onBrowserViewScreenshotSurfacePrepare/Release (178517)
 *
 *  URL/状态助手（50712–50860，浏览器域横切，随族登记）：
 *   vA=`about:blank`；gVe 可恢复崩溃原因集；_Ve isRecoverableCrash；vVe/yVe disposed 消息集；
 *   yA safeWebviewCall（disposed 吞→回退值，其余抛）；xVe INITIAL_BROWSER_STATE；
 *   SA isHttpUrl；MVe normalizeAddress（scheme 补全+localhost/私网→http，其余 https）；TA blankToEmpty
 *
 *  data-testid 常量（src-HCld2afU.js 反查值）：
 *   rte=browser-back-button | kne=browser-forward-button | lne=browser-refresh-button |
 *   Qe=browser-address-input | Lne=browser-responsive-button | rne=browser-element-picker-button |
 *   wte=browser-more-button | Fee=browser-open-external-item | Hne=browser-devtools-button |
 *   ht=browser-webview | nre=browser-responsive-toolbar | Bee=browser-responsive-width-input |
 *   Gee=browser-responsive-height-input | xr=browser-responsive-zoom-select | ure=browser-responsive-zoom-option |
 *   Oee=browser-responsive-scaled-frame | hre=browser-responsive-viewport |
 *   Zte/mte/yte/hne=browser-responsive-resize-left/width/top/height |
 *   Zee/ute/Yne/Wte=browser-responsive-resize-corner-top-left/top-right/bottom-left/(bottom-right)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime；2. cn (Z)；3. Button (X) / 图标块；4. useIntlContext (G)；
 *  5. usePlatformService (l) —— 浏览器服务面（attachGuest/reportResidency/updateViewport/
 *     onViewportChanged/screenshotSurfaceReady/openExternal/desktopZoom 族）；6. logger (J)；
 *  7. Tooltip (Ia) usageStatsUiParts；8. DropdownMenu 封装 VO/HO/UO/WO/GO/KO/qO/JO/YO（TopBar 族已登记）；
 *  9. Popover 封装 Oa/Ma/ka（usageStatsUiParts）；10. Select 封装 iO/oO/sO/cO（本 chunk Radix 主块 28021–32245）；
 * 11. Input (P) imeComposition；12. BH/WXe 网页元素上下文校验/入聊天（68623/68774，Composer 域横切）；
 * 13. testid/RESPONSIVE_VIEWPORT_LIMITS (di)/IPC 通道 (fre) —— src-HCld2afU.js
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/browser/BrowserPane.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  BLANK_URL,
  isRecoverableCrash,
  safeWebviewCall,
  INITIAL_BROWSER_STATE,
  isHttpUrl,
  normalizeAddress,
  blankToEmpty,
  ELEMENT_PICKER_LIMITS,
  injectableElementPickerScript,
  serializeElementPickerScript,
  cancelPickerScript,
  isPickerResult,
  attachWorkspaceToPickedElement,
  originPathOfUrl,
  useWebElementPicker,
  ToolbarIconButton,
  BrowserMoreMenu,
  BrowserToolbar,
  BrowserEmptyState,
  ZOOM_OPTIONS,
  resolveVisualScale,
  resolveTransformScale,
  resolveDesktopLayoutScale,
  RESPONSIVE_VIEWPORT_LIMITS,
  ResponsiveResizeHandles,
  DEFAULT_VIEWPORT_SIZE,
  clampViewport,
  ResponsiveViewportCanvas,
  BrowserSurface,
  isValidDimension,
  dimensionLimits,
  ResponsiveToolbar,
  useFutureTimestamp,
  useBrowserResizeWarning,
  useScreenshotSurfaceStabilizer,
  useGuestWheelCanvasScroll,
  zoomFactorFromLevel,
  useDesktopZoomFactor,
  useResponsiveModeController,
  BrowserView,
  BrowserUseView,
  browserUseTabMatches,
  screenshotRequestMatches,
  findBrowserUseTab,
  useScreenshotSurfaceRequest,
} from '../components/browser/BrowserPane';
export type {
  BrowserNavigationState,
  PickedElementStyle,
  PickedWebElement,
  ElementPickerResult,
  ViewportSize,
  ScreenshotSurfaceRequest,
  BrowserViewProps,
  BrowserUseTabDescriptor,
} from '../components/browser/BrowserPane';
