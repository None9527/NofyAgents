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
 *   xUt  → ELEMENT_PICKER_LIMITS   {maxTextChars:4000,maxHtmlChars:6000,maxAttributeChars:500,labels} (175990)
 *   SUt  → injectableElementPickerScript  注入页内的 overlay+tooltip+选择 Promise（纯函数，toString 序列化）(175996)
 *   CUt  → serializeElementPicker        `(${SUt.toString()})(${JSON.stringify(opts)})` (176424)
 *   wUt  → cancelPickerScript            取消已挂载 picker 的 IIFE (176428)
 *   TUt  → isPickerResult                cancelled|selected+element (176436)
 *   EUt  → attachWorkspaceToPickedElement +BH 校验 (176443)
 *   DUt  → originPathOfUrl               origin+pathname，失败→?# 前 (176453)
 *   OUt  → useWebElementPicker           isPicking/start/cancel/toggle + Esc 全局监听 + 卸载取消 (176461)
 *
 *  工具栏（176539–176687 / jsx 143153 起）：
 *   kUt  → BrowserToolbar          form h-12：back/forward/reload/地址/responsive/picker/⋯ (176539 / 143153)
 *   g5   → ToolbarIconButton       Tooltip+Button icon-md，active→secondary+aria-pressed (176688 / 143256)
 *   AUt  → BrowserMoreMenu         ⋯ → openExternal / devtools 两项 (176611)
 *   jUt  → BrowserEmptyState       globe|spinner + browser.title/empty 覆盖层 (176664)
 *
 *  响应式视口（176711–177344 / jsx 143300 起）：
 *   MUt  → ZOOM_OPTIONS            [fit,50,75,100,125,150,200] (176711)
 *   NUt  → resolveVisualScale      fit→min(1,(w-32)*zf/vw,(h-32)*zf/vh) (176713)
 *   PUt  → resolveTransformScale   visual/desktopZoom (176721)
 *   FUt  → resolveDesktopLayoutScale  zf>1→{1,1}；zf<1→{1/zf,zf} (176724)
 *   _5=di → RESPONSIVE_VIEWPORT_LIMITS {min320/max3840/min320/max2160}（src-HCld2afU.js 反查）(176732)
 *   IUt/LUt → EDGE_HANDLES(4)/CORNER_HANDLES(4) 把手几何+testid (176734,176770)
 *   RUt  → EDGE_ICON_CLASS         group-hover 显现的把手图标类 (176801)
 *   zUt  → ResponsiveResizeHandles 4 边 separator(role/aria-valuenow/键盘)+4 角 (176802 / 143360)
 *   BUt  → DEFAULT_VIEWPORT        {width:393,height:852} (176864)
 *   VUt/HUt → clampInt/clampViewport (176867,176870)
 *   UUt  → ResponsiveViewportCanvas  画布+scale 变换+fit 重测 RO+blur 结束拖拽 (176876 / 143400)
 *   WUt  → BrowserSurface          resize 弱提示条 + UUt + webview（compositor/layout/transform scale data-*）(177082 / 143564)
 *   GUt/KUt → isValidDimension/dimensionLimits (177169,177178)
 *   qUt  → ResponsiveToolbar       W×H 输入（Popover 报错）+ zoom Select (177186 / 143620)
 *   JUt  → useFutureTimestamp      未来时间戳到达前为 true (177344)
 *   YUt/XUt/ZUt/QUt → 3000/300/100/500 弱提示时序 (177358)
 *   $Ut  → useBrowserResizeWarning  agent 操作期 ResizeObserver 尺寸变化→3s 弱提示 (177364 / 143741)
 *
 *  截图 surface 稳定（177456–177618）：
 *   eWt/v5 → roundSize/sizesEqual(±1) (177456,177461)
 *   tWt/nWt/rWt → 0.001/100ms/2500ms (177464)
 *   iWt/aWt → layoutScaleFromDataset/responsiveScaleFromAncestor (177467,177471)
 *   oWt/sWt → surfaceSnapshotEqual/measureWebviewViewport (177474,177478)
 *   cWt  → useScreenshotSurfaceStabilizer  guest 对齐+scale 稳定双帧→surfaceReady 上报 (177484)
 *   lWt/uWt → wheelDelta/guestWheelScrollCanvas（ipc-message WheelBoundary 续接画布滚动）(177592,177596)
 *
 *  桌面 zoom（177617–177641）：
 *   dWt/fWt/pWt → 1.1/-3/5；mWt → 1.1^clamp(round(level),-3,5) (177617,177621)
 *   hWt  → useDesktopZoomFactor    getDesktopZoomLevel+onDesktopZoomLevelChanged (177625)
 *   gWt  → useResponsiveModeController  模式开关/viewport 双向同步（browserViewUpdateViewport/onBrowserViewViewportChanged）(177644 / 144000)
 *
 *  组件：
 *   _Wt  → BrowserView             根：工具栏+响应式条+surface；webview 事件全集；崩溃重建；residency 上报 (177724 / 144066)
 *   vWt  → BrowserUseView          TabsContent forceMount 包装（inert/hidden 三态 + screenshot data-state）(178191 / 144506)
 *   yWt/bWt/xWt → tabMatch/requestMatch/findBrowserUseTab (178241,178251,178260)
 *   SWt  → useScreenshotSurfaceRequest  onBrowserViewScreenshotSurfacePrepare/Release (178264)
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

import * as React from "react";
import { Input, Popover, PopoverContent, PopoverTrigger } from './ImeComposition';
import { Select, SelectItem, SelectTrigger, SelectValue, TabsContent } from './Settings';
import { logger } from './SkillStore';
/* ── A0-D-Misc 接线：可用属主（前波成果） ── */
import { cn } from './UtilsCn'; // 原 Z：cn 类名合并
import { useZCodeIntl as useIntlContext, type ZCodeIntl } from './I18n'; // 原 G：useIntlContext（IntlShape 消费面改指 ZCodeIntl）
import { Button } from './button'; // 原 X：Button
import { InfoTooltip as Tooltip } from './UsageStatsUiParts'; // 原 Ia（usageStatsUiParts u=X InfoTooltip）

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

/* A0-D-Misc：原 `webview: WebviewIntrinsicProps` 整件增补与 @types/react 内建
 * webview（DetailedHTMLProps<WebViewHTMLAttributes<HTMLWebViewElement>, …>）冲突
 * （TS2717）；改为向内建 WebViewHTMLAttributes 追加 electron 专有属性与
 * data-* 索引签名（原 WebviewIntrinsicProps 消费面），调用面差异
 * （ref/allowpopups）在使用点以类型垫片对齐（零运行时影响）。 */
declare module "react" {
  interface WebViewHTMLAttributes<T> {
    nodeintegrationinsubframes?: string;
    [dataAttribute: `data-${string}`]: unknown;
  }
}



/** lucide 风格图标（原 Ea/wa/Nv/$ye/tbe/q_/k_/K_/N/fv/nv/iv/Rye） */
declare const IconArrowLeft: React.FC<{ className?: string }>;
declare const IconArrowRight: React.FC<{ className?: string }>;
declare const IconRotateCw: React.FC<{ className?: string }>;
declare const IconSmartphone: React.FC<{ className?: string }>;
declare const IconMousePointerClick: React.FC<{ className?: string }>;
declare const IconOpenExternal: React.FC<{ className?: string }>;
declare const IconBug: React.FC<{ className?: string }>;
declare const IconEllipsis: React.FC<{ className?: string }>;
declare const IconTriangleAlert: React.FC<{ className?: string }>;
declare const IconLoader: React.FC<{ className?: string }>;
declare const IconGlobe: React.FC<{ className?: string }>;
declare const IconMoveHorizontal: React.FC<{ className?: string }>;
declare const IconMoveVertical: React.FC<{ className?: string }>;

/** Input（原 P，imeComposition chunk） */

/** Tooltip（原 Ia，usageStatsUiParts）——已改真实 import（InfoTooltip），见文件头 import 块。 */

/** DropdownMenu 封装（原 VO/HO/UO/WO/GO/KO/qO/JO/YO） */
declare const DropdownMenu: React.FC<{ children: React.ReactNode }>;
declare const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }>;
declare const DropdownMenuContent: React.FC<{ align?: "start" | "end"; className?: string; children: React.ReactNode }>;
declare const DropdownMenuItem: React.FC<{ "data-testid"?: string; disabled?: boolean; onSelect?: () => void; children: React.ReactNode }>;

/** Popover 封装（原 Oa/Ma/ka） */

/** Select 封装（原 iO/oO/sO/cO，Radix 主块 28021–32245） */

/* ----------------------------------------------------------------------------
 * Electron webview 元素接口（guest view）
 * -------------------------------------------------------------------------- */
interface WebviewDomEvent {
  title?: string;
  errorCode?: number;
  errorDescription?: string;
  validatedURL?: string;
  isMainFrame?: boolean;
  details?: { exitCode?: number; reason: string };
  favicons?: string[];
  channel?: string;
  args?: unknown[];
}
/** guest view 元素（独立接口，避免与 lib.dom addEventListener 重载冲突） */
interface ElectronWebviewElement {
  src?: string;
  allowpopups?: string;
  partition?: string;
  nodeintegrationinsubframes?: string;
  dataset: Record<string, string | undefined>;
  offsetWidth: number;
  offsetHeight: number;
  loadURL(url: string): Promise<void>;
  getURL(): string;
  canGoBack(): boolean;
  canGoForward(): boolean;
  getTitle(): string;
  reload(): void;
  goBack(): void;
  goForward(): void;
  openDevTools(): void;
  getWebContentsId(): number;
  executeJavaScript(code: string, userGesture?: boolean): Promise<unknown>;
  setZoomFactor(factor: number): void;
  removeAttribute(name: string): void;
  closest(selector: string): Element | null;
  getBoundingClientRect(): DOMRect;
  addEventListener(type: string, listener: (event: WebviewDomEvent) => void, capture?: boolean): void;
  removeEventListener(type: string, listener: (event: WebviewDomEvent) => void, capture?: boolean): void;
}

/** 浏览器服务面（原 l()，PlatformService 浏览器段） */
interface BrowserPlatformService {
  browserViewAttachGuest?(req: {
    key: string;
    webContentsId: number;
    active: boolean;
    workspaceKey?: string;
    remoteSessionId?: string;
    sessionId?: string;
    residencyGeneration?: number;
  }): Promise<void>;
  browserViewReportResidency?(req: {
    tabId: string;
    workspaceKey: string;
    remoteSessionId?: string;
    sessionId: string;
    selected: boolean;
    visible: boolean;
    currentTask: boolean;
    loading: boolean;
    restoreUrl: string | null;
    title: string | null;
    faviconUrl?: string;
  }): Promise<void>;
  browserViewUpdateViewport?(req: { tabId: string; viewport: ViewportSize | null }): Promise<void> | null;
  onBrowserViewViewportChanged?(
    cb: (e: { tabId: string; sessionId?: string; viewport: ViewportSize | null }) => void,
  ): (() => void) | undefined;
  onBrowserViewScreenshotSurfacePrepare?(cb: (e: ScreenshotSurfaceRequest) => void): (() => void) | undefined;
  onBrowserViewScreenshotSurfaceRelease?(cb: (e: ScreenshotSurfaceRequest) => void): (() => void) | undefined;
  browserViewScreenshotSurfaceReady?(req: ScreenshotSurfaceRequest & { surfaceScale: number; viewport: ViewportSize }): void;
  openExternal(url: string): void;
  getDesktopZoomLevel?(): Promise<{ zoomLevel: number }>;
  onDesktopZoomLevelChanged?(cb: (e: { zoomLevel: number }) => void): (() => void) | undefined;
}
declare function usePlatformService(): BrowserPlatformService;

/** 网页元素上下文入聊天 / 校验（原 WXe/BH，68774/68623，Composer 域横切） */
declare function addWebElementContextToChat(context: PickedWebElement & { workspacePath: string; workspaceIdentity?: string }): void;
declare function validateWebElementContext(
  context: PickedWebElement & { workspacePath: string; workspaceIdentity?: string },
): boolean;

/* ============================================================================
 * 1. URL / 状态助手（原 50712–50860 浏览器域段）
 * ==========================================================================*/

/** 原 vA */
export const BLANK_URL = "about:blank";

/** 原 gVe：可自动恢复的 guest 崩溃原因 */
const RECOVERABLE_CRASH_REASONS = new Set(["abnormal-exit", "killed", "crashed", "oom", "memory-eviction"]);

/** 原 _Ve */
export function isRecoverableCrash(reason: string): boolean {
  return RECOVERABLE_CRASH_REASONS.has(reason);
}

/** 原 vVe/yVe：webview 未就绪的 disposed 类错误（吞掉回退） */
const WEBVIEW_DISPOSED_MESSAGES = ["must be attached to the DOM", "Render frame was disposed"];
function isWebviewDisposedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return message ? WEBVIEW_DISPOSED_MESSAGES.some((m) => message.includes(m)) : false;
}

/** 原 yA：disposed 类错误→回退值（可选 warn），其余抛 */
export function safeWebviewCall<T>(call: () => T, fallback: T, onError?: (error: unknown) => void): T {
  try {
    return call();
  } catch (error) {
    if (isWebviewDisposedError(error)) {
      onError?.(error);
      return fallback;
    }
    throw error;
  }
}

/** 原 xVe */
export interface BrowserNavigationState {
  canGoBack: boolean;
  canGoForward: boolean;
  currentUrl: string;
  errorMessage: string | null;
  isLoading: boolean;
  isReady: boolean;
  title: string;
}
export const INITIAL_BROWSER_STATE: BrowserNavigationState = {
  canGoBack: false,
  canGoForward: false,
  currentUrl: BLANK_URL,
  errorMessage: null,
  isLoading: false,
  isReady: false,
  title: "",
};

const ALLOWED_SCHEMES = new Set(["about:", "data:", "file:", "http:", "https:"]);
const SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const IPV4_REGEX = /^\d{1,3}(?:\.\d{1,3}){3}$/;

function hasAllowedScheme(url: string): boolean {
  try {
    return ALLOWED_SCHEMES.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

/** 原 SA */
export function isHttpUrl(url: string): boolean {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function schemeOf(url: string): string | null {
  const match = url.match(SCHEME_REGEX)?.[0].toLowerCase();
  return match ? (ALLOWED_SCHEMES.has(match) ? match : match) : null;
}
function hasKnownScheme(url: string): boolean {
  const match = url.match(SCHEME_REGEX);
  if (!match) return false;
  return ALLOWED_SCHEMES.has(match[0].toLowerCase());
}
function hasUnsupportedScheme(url: string): boolean {
  const match = url.match(SCHEME_REGEX);
  if (!match) return false;
  const scheme = match[0].toLowerCase();
  return ALLOWED_SCHEMES.has(scheme) ? false : !/^\d{1,5}(?:$|[/?#])/.test(url.slice(match[0].length));
}
function decorateIpv6Host(host: string): string {
  return host === "::1" ? "[::1]" : /^::1(?=[:/?#])/.test(host) ? `[::1]${host.slice(3)}` : host;
}
function tryBuildUrl(input: string): URL | null {
  try {
    const decorated = decorateIpv6Host(input);
    return new URL(decorated.startsWith("//") ? `http:${decorated}` : `http://${decorated}`);
  } catch {
    return null;
  }
}
function portOf(input: string): string | null {
  const decorated = decorateIpv6Host(input);
  const host = (decorated.startsWith("//") ? decorated.slice(2) : decorated).split(/[/?#]/, 1)[0] ?? "";
  const bare = host.split("@").at(-1) ?? host;
  if (bare.startsWith("[")) return bare.match(/^\[[^\]]+\]:(\d+)$/)?.[1] ?? null;
  const match = bare.match(/:(\d+)$/);
  return match ? (bare.slice(0, match.index).includes(":") ? null : (match[1] ?? null)) : null;
}
function isPrivateOrLocalHost(host: string): boolean {
  const lowered = host.toLowerCase().replace(/^\[(.*)]$/, "$1");
  if (
    lowered === "localhost" ||
    lowered === "localhost.localdomain" ||
    lowered.endsWith(".localhost") ||
    lowered === "::1" ||
    lowered === "0:0:0:0:0:0:0:1" ||
    lowered.endsWith(".local") ||
    lowered.endsWith(".test")
  )
    return true;
  if (!IPV4_REGEX.test(lowered)) return false;
  const [a = 0, b = 0] = lowered.split(".").map(Number);
  if (lowered.split(".").some((part) => !Number.isInteger(Number(part)) || Number(part) < 0 || Number(part) > 255)) return false;
  return (
    a === 127 ||
    (a === 0 && b === 0) ||
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}
function shouldPreferHttp(url: URL, port: string | null): boolean {
  return !!(isPrivateOrLocalHost(url.hostname) || (port && port !== "443"));
}
function withInferredScheme(input: string): string {
  const decorated = decorateIpv6Host(input);
  const parsed = tryBuildUrl(decorated);
  const scheme = parsed && shouldPreferHttp(parsed, portOf(decorated)) ? "http" : "https";
  return decorated.startsWith("//") ? `${scheme}:${decorated}` : `${scheme}://${decorated}`;
}

/** 原 MVe：地址栏归一（非法/不支持 scheme→null；无 scheme→localhost/私网 http，其余 https） */
export function normalizeAddress(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || hasUnsupportedScheme(trimmed)) return null;
  const candidate = hasKnownScheme(trimmed) ? trimmed : withInferredScheme(trimmed);
  return hasAllowedScheme(candidate) ? candidate : null;
}

/** 原 TA */
export function blankToEmpty(url: string): string {
  return url === "about:blank" ? "" : url;
}

/* ============================================================================
 * 2. 网页元素选择器（原 175990–176538）
 * ==========================================================================*/

/** 原 xUt */
export const ELEMENT_PICKER_LIMITS = {
  maxTextChars: 4000,
  maxHtmlChars: 6000,
  maxAttributeChars: 500,
  labels: { background: "Background", color: "Color", font: "Font" },
};

export interface PickedElementStyle {
  backgroundColor?: string;
  color: string;
  display: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
}
export interface PickedWebElement {
  pageUrl: string;
  pageTitle: string;
  tagName: string;
  role?: string;
  accessibleName?: string;
  selector: string;
  xpath: string;
  text?: string;
  nearbyText?: string;
  htmlExcerpt?: string;
  attributes: Record<string, string>;
  rect: { x: number; y: number; width: number; height: number };
  style: PickedElementStyle;
  capturedAt: number;
}
export type ElementPickerResult = { status: "cancelled" } | { status: "selected"; element: PickedWebElement };

/**
 * 原 SUt：注入页内的选择器脚本（序列化执行；overlay+tooltip+crosshair+Esc/click）。
 * 保持纯函数形态（toString 注入），逻辑逐段对应原实现。
 */
export function injectableElementPickerScript(options: typeof ELEMENT_PICKER_LIMITS): Promise<ElementPickerResult> {
  const GLOBAL_KEY = "__zcodeWebElementPicker";
  (window as unknown as Record<string, { cancel?: () => void }>)[GLOBAL_KEY]?.cancel?.();

  const truncate = (text: string | null | undefined, max: number) => {
    const clean = (text ?? "").replace(/\s+/g, " ").trim();
    return clean.length > max ? `${clean.slice(0, max)}...` : clean;
  };
  const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  const toHex = (r: number, g: number, b: number) =>
    `#${[r, g, b]
      .map((c) => clampChannel(c).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`;
  const alphaOf = (raw: string) => (raw ? (raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw)) : 1);
  const normalizeColor = (raw: string) => {
    const text = raw.trim();
    const match =
      /^rgba?\(\s*([0-9.]+)(?:,|\s)+([0-9.]+)(?:,|\s)+([0-9.]+)(?:\s*[,/]\s*([0-9.]+%?))?\s*\)$/iu.exec(text);
    if (!match) return text;
    const [r, g, b] = [match[1], match[2], match[3]];
    if (!r || !g || !b) return text;
    const [cr, cg, cb, ca] = [Number(r), Number(g), Number(b), alphaOf(match[4] ?? "1")];
    if ([cr, cg, cb, ca].some(Number.isNaN)) return text;
    return ca <= 0 ? "transparent" : toHex(cr, cg, cb);
  };
  const readStyle = (element: Element): PickedElementStyle => {
    const computed = window.getComputedStyle(element);
    const background = normalizeColor(computed.backgroundColor);
    return {
      ...(background === "transparent" ? {} : { backgroundColor: background }),
      color: normalizeColor(computed.color),
      display: computed.display,
      fontFamily: truncate(computed.fontFamily, 160),
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
    };
  };
  const fontLabel = (style: PickedElementStyle) => truncate([style.fontSize, style.fontFamily].filter(Boolean).join(" "), 96);
  const sizeLabel = (rect: DOMRect) => `${Math.round(rect.width)}x${Math.round(rect.height)}`;
  const hasVisibleBackground = (style: PickedElementStyle) =>
    !!(style.backgroundColor && style.backgroundColor !== "transparent" && style.backgroundColor !== "rgba(0, 0, 0, 0)");
  const escapeSelectorPart = (value: string) => {
    const escape = window.CSS?.escape;
    return escape ? escape(value) : value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  };
  const textOf = (element: Element) =>
    element instanceof HTMLInputElement
      ? element.type.toLowerCase() === "password"
        ? "[masked password input]"
        : truncate(
            element.getAttribute("aria-label") || element.getAttribute("placeholder") || element.name || element.type,
            options.maxTextChars,
          )
      : element instanceof HTMLTextAreaElement
        ? truncate(
            element.getAttribute("aria-label") || element.getAttribute("placeholder") || element.name || "textarea",
            options.maxTextChars,
          )
        : truncate((element as HTMLElement).innerText || element.textContent, options.maxTextChars);
  const roleOf = (element: Element) => {
    const tag = element.tagName.toLowerCase();
    if (tag === "button") return "button";
    if (tag === "a" && element.hasAttribute("href")) return "link";
    if (tag === "img") return "img";
    if (tag === "input") {
      const type = (element.getAttribute("type") ?? "text").toLowerCase();
      return type === "checkbox"
        ? "checkbox"
        : type === "radio"
          ? "radio"
          : type === "range"
            ? "slider"
            : type === "button" || type === "submit" || type === "reset"
              ? "button"
              : "textbox";
    }
    return tag === "textarea"
      ? "textbox"
      : tag === "select"
        ? "combobox"
        : tag === "nav"
          ? "navigation"
          : tag === "main"
            ? "main"
            : tag === "form"
              ? "form"
              : /^h[1-6]$/u.test(tag)
                ? "heading"
                : "";
  };
  const accessibleNameOf = (element: Element) => {
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const resolved = truncate(
        labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" "),
        options.maxTextChars,
      );
      if (resolved) return resolved;
    }
    return truncate(
      element.getAttribute("aria-label") ||
        element.getAttribute("alt") ||
        element.getAttribute("title") ||
        element.getAttribute("placeholder") ||
        textOf(element),
      options.maxTextChars,
    );
  };
  const attributesOf = (element: Element) => {
    const out: Record<string, string> = {};
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      if (
        !(
          name === "id" ||
          name === "class" ||
          name === "href" ||
          name === "src" ||
          name === "alt" ||
          name === "title" ||
          name === "name" ||
          name === "type" ||
          name === "placeholder" ||
          name.startsWith("aria-")
        ) ||
        name === "value"
      )
        continue;
      out[name] = truncate(attr.value, options.maxAttributeChars);
    }
    return out;
  };
  const cssSelectorOf = (element: Element) => {
    if (element.id) return `#${escapeSelectorPart(element.id)}`;
    const parts: string[] = [];
    let node: Element | null = element;
    while (node && node.nodeType === Node.ELEMENT_NODE && parts.length < 8) {
      const tag = node.tagName.toLowerCase();
      if (node.id) {
        parts.unshift(`${tag}#${escapeSelectorPart(node.id)}`);
        break;
      }
      const tagName = node.tagName;
      let part = `${tag}${Array.from(node.classList)
        .filter(Boolean)
        .slice(0, 2)
        .map((c) => `.${escapeSelectorPart(c)}`)
        .join("")}`;
      const parent: Element | null = node.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter((c) => c instanceof Element && c.tagName === tagName);
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
      }
      parts.unshift(part);
      node = parent;
    }
    return parts.join(" > ");
  };
  const xpathOf = (element: Element) => {
    const parts: string[] = [];
    let node: Element | null = element;
    while (node && node.nodeType === Node.ELEMENT_NODE && parts.length < 12) {
      const tag = node.tagName.toLowerCase();
      const tagName = node.tagName;
      const parent: Element | null = node.parentElement;
      if (!parent) {
        parts.unshift(`/${tag}`);
        break;
      }
      const index =
        Array.from(parent.children)
          .filter((c) => c instanceof Element && c.tagName === tagName)
          .indexOf(node) + 1;
      parts.unshift(`${tag}[${index}]`);
      node = parent;
    }
    return `/${parts.join("/")}`.replace(/^\/\//u, "/");
  };
  const nearbyTextOf = (element: Element) => {
    const scope = element.closest("article, section, main, form, li, tr, dialog") || element.parentElement || element;
    return truncate((scope as HTMLElement).innerText || scope.textContent, options.maxTextChars);
  };
  const htmlExcerptOf = (element: Element) => {
    const clone = element.cloneNode(true);
    if (!(clone instanceof Element)) return "";
    clone.querySelectorAll("script, style, noscript, template").forEach((n) => {
      n.remove();
    });
    clone.querySelectorAll("input, textarea").forEach((n) => {
      if (n instanceof HTMLInputElement) {
        n.removeAttribute("value");
        if (n.type.toLowerCase() === "password") n.setAttribute("type", "password");
      }
      if (n instanceof HTMLTextAreaElement) n.textContent = "";
    });
    return truncate(clone.outerHTML, options.maxHtmlChars);
  };
  const rectOf = (rect: DOMRect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });

  const overlay = document.createElement("div");
  overlay.setAttribute("data-zcode-web-element-picker", "overlay");
  Object.assign(overlay.style, {
    background: "rgba(37, 99, 235, 0.12)",
    border: "2px solid #2563eb",
    borderRadius: "4px",
    boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.10)",
    boxSizing: "border-box",
    display: "none",
    left: "0",
    pointerEvents: "none",
    position: "fixed",
    top: "0",
    zIndex: "2147483647",
  });
  const tooltip = document.createElement("div");
  Object.assign(tooltip.style, {
    backdropFilter: "blur(10px)",
    background: "rgba(17, 24, 39, 0.92)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    borderRadius: "18px",
    boxShadow: "0 18px 38px rgba(15, 23, 42, 0.28)",
    boxSizing: "border-box",
    color: "#f9fafb",
    display: "none",
    font: "12px/1.4 -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    left: "0",
    maxWidth: "calc(100vw - 16px)",
    minWidth: "214px",
    padding: "12px 18px 14px",
    pointerEvents: "none",
    position: "fixed",
    top: "0",
    width: "min(320px, calc(100vw - 16px))",
    zIndex: "2147483647",
  });
  document.documentElement.append(overlay, tooltip);

  let hovered: Element | null = null;
  let settled = false;
  let settle: ((result: ElementPickerResult) => void) | null = null;

  const teardown = () => {
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
    overlay.remove();
    tooltip.remove();
    delete (window as unknown as Record<string, unknown>)[GLOBAL_KEY];
    document.documentElement.style.cursor = "";
  };
  const addTooltipRow = (label: string, value: string | undefined) => {
    if (!value) return;
    const row = document.createElement("div");
    Object.assign(row.style, {
      alignItems: "baseline",
      columnGap: "16px",
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr)",
      minWidth: "0",
    });
    const labelSpan = document.createElement("span");
    labelSpan.textContent = label;
    Object.assign(labelSpan.style, {
      color: "rgba(255, 255, 255, 0.62)",
      fontSize: "15px",
      fontWeight: "600",
      minWidth: "0",
      whiteSpace: "nowrap",
    });
    const valueSpan = document.createElement("span");
    valueSpan.textContent = value;
    Object.assign(valueSpan.style, {
      color: "#ffffff",
      fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace",
      fontSize: "15px",
      fontWeight: "700",
      minWidth: "0",
      overflow: "hidden",
      textAlign: "right",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    });
    row.append(labelSpan, valueSpan);
    tooltip.append(row);
  };
  const renderTooltip = (element: Element, rect: DOMRect) => {
    const style = readStyle(element);
    tooltip.replaceChildren();
    const head = document.createElement("div");
    Object.assign(head.style, {
      alignItems: "baseline",
      columnGap: "16px",
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) auto",
      minWidth: "0",
    });
    const tagSpan = document.createElement("span");
    tagSpan.textContent = element.tagName.toLowerCase();
    Object.assign(tagSpan.style, {
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "800",
      minWidth: "0",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    });
    const sizeSpan = document.createElement("span");
    sizeSpan.textContent = sizeLabel(rect);
    Object.assign(sizeSpan.style, {
      color: "#ffffff",
      fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace",
      fontSize: "15px",
      fontWeight: "800",
      whiteSpace: "nowrap",
    });
    head.append(tagSpan, sizeSpan);
    tooltip.append(head);
    addTooltipRow(options.labels.color, style.color);
    if (hasVisibleBackground(style)) addTooltipRow(options.labels.background, style.backgroundColor);
    addTooltipRow(options.labels.font, fontLabel(style));
  };
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const placeTooltip = (rect: DOMRect, tooltipWidth: number, tooltipHeight: number) => {
    const maxX = Math.max(8, window.innerWidth - tooltipWidth - 8);
    const maxY = Math.max(8, window.innerHeight - tooltipHeight - 8);
    const centerX = rect.left + rect.width / 2 - tooltipWidth / 2;
    const centerY = rect.top + rect.height / 2 - tooltipHeight / 2;
    return (
      [
        { left: clamp(centerX, 8, maxX), top: rect.bottom + 12 },
        { left: clamp(centerX, 8, maxX), top: rect.top - tooltipHeight - 12 },
        { left: rect.right + 12, top: clamp(centerY, 8, maxY) },
        { left: rect.left - tooltipWidth - 12, top: clamp(centerY, 8, maxY) },
      ].find(
        (pos) =>
          pos.left >= 8 &&
          pos.top >= 8 &&
          pos.left + tooltipWidth <= window.innerWidth - 8 &&
          pos.top + tooltipHeight <= window.innerHeight - 8,
      ) ??
      (
        [
          { left: clamp(centerX, 8, maxX), size: window.innerHeight - rect.bottom - 8, top: clamp(rect.bottom + 12, 8, maxY) },
          { left: clamp(centerX, 8, maxX), size: rect.top - 8, top: clamp(rect.top - tooltipHeight - 12, 8, maxY) },
          { left: clamp(rect.right + 12, 8, maxX), size: window.innerWidth - rect.right - 8, top: clamp(centerY, 8, maxY) },
          { left: clamp(rect.left - tooltipWidth - 12, 8, maxX), size: rect.left - 8, top: clamp(centerY, 8, maxY) },
        ].sort((a, b) => b.size - a.size)[0] ?? { left: 8, top: 8 }
      )
    );
  };
  const highlight = (element: Element | null) => {
    if (!element || element === overlay || element === tooltip || tooltip.contains(element)) {
      overlay.style.display = "none";
      tooltip.style.display = "none";
      return;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      overlay.style.display = "none";
      tooltip.style.display = "none";
      return;
    }
    overlay.style.display = "block";
    overlay.style.left = `${Math.max(0, rect.left)}px`;
    overlay.style.top = `${Math.max(0, rect.top)}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    tooltip.style.display = "block";
    renderTooltip(element, rect);
    const position = placeTooltip(rect, tooltip.offsetWidth || 240, tooltip.offsetHeight || 90);
    tooltip.style.left = `${position.left}px`;
    tooltip.style.top = `${position.top}px`;
  };
  function onMouseMove(event: MouseEvent) {
    const target = event.target;
    if (target instanceof Element) {
      hovered = target;
      highlight(target);
    }
  }
  function snapshotOf(element: Element): PickedWebElement {
    const rect = element.getBoundingClientRect();
    return {
      pageUrl: location.href,
      pageTitle: document.title,
      tagName: element.tagName.toLowerCase(),
      role: element.getAttribute("role") || roleOf(element) || void 0,
      accessibleName: accessibleNameOf(element) || void 0,
      selector: cssSelectorOf(element),
      xpath: xpathOf(element),
      text: textOf(element) || void 0,
      nearbyText: nearbyTextOf(element) || void 0,
      htmlExcerpt: htmlExcerptOf(element) || void 0,
      attributes: attributesOf(element),
      rect: rectOf(rect),
      style: readStyle(element),
      capturedAt: Date.now(),
    };
  }
  function onClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!hovered) {
      settle?.({ status: "cancelled" });
      return;
    }
    settle?.({ status: "selected", element: snapshotOf(hovered) });
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      settle?.({ status: "cancelled" });
    }
  }
  return new Promise((resolve) => {
    const done = (result: ElementPickerResult) => {
      if (settled) return;
      settled = true;
      teardown();
      resolve(result);
    };
    settle = done;
    function cancel() {
      done({ status: "cancelled" });
    }
    (window as unknown as Record<string, { cancel: () => void }>)[GLOBAL_KEY] = { cancel };
    document.documentElement.style.cursor = "crosshair";
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
  });
}

/** 原 CUt */
export function serializeElementPickerScript(overrides: Partial<typeof ELEMENT_PICKER_LIMITS> = {}): string {
  const options = { ...ELEMENT_PICKER_LIMITS, ...overrides, labels: { ...ELEMENT_PICKER_LIMITS.labels, ...overrides.labels } };
  return `(${injectableElementPickerScript.toString()})(${JSON.stringify(options)})`;
}

/** 原 wUt */
export function cancelPickerScript(): string {
  return [
    "(() => {",
    "const picker = window.__zcodeWebElementPicker;",
    "if (picker && typeof picker.cancel === 'function') picker.cancel();",
    "})()",
  ].join("\n");
}

/** 原 TUt */
export function isPickerResult(value: unknown): value is ElementPickerResult {
  if (typeof value !== "object" || !value) return false;
  const result = value as { status?: unknown; element?: unknown };
  return result.status === "cancelled" || (result.status === "selected" && typeof result.element === "object" && result.element !== null);
}

/** 原 EUt：挂工作区作用域 + BH 校验 */
export function attachWorkspaceToPickedElement(args: {
  result: { status: "selected"; element: PickedWebElement };
  workspacePath: string;
  workspaceIdentity?: string | null;
}): (PickedWebElement & { workspacePath: string; workspaceIdentity?: string }) | null {
  const context = {
    ...args.result.element,
    workspacePath: args.workspacePath,
    ...(args.workspaceIdentity ? { workspaceIdentity: args.workspaceIdentity } : {}),
  };
  return validateWebElementContext(context) ? context : null;
}

/** 原 DUt */
export function originPathOfUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split(/[?#]/u)[0] ?? "";
  }
}

/** 原 OUt：renderer 侧 picker 控制钩子（executeJs 注入 + Esc 全局键 + 卸载取消） */
export function useWebElementPicker({
  executeJs,
  workspacePath,
  workspaceIdentity,
  labels,
}: {
  executeJs: (code: string) => Promise<unknown>;
  workspacePath: string;
  workspaceIdentity?: string | null;
  labels?: { background: string; color: string; font: string };
}) {
  const [isPicking, setIsPicking] = React.useState(false);
  const runIdRef = React.useRef(0);
  const executeJsRef = React.useRef(executeJs);
  executeJsRef.current = executeJs;

  const cancelPicking = React.useCallback(async () => {
    runIdRef.current += 1;
    setIsPicking(false);
    try {
      await executeJsRef.current(cancelPickerScript());
    } catch (error) {
      logger.debug("[UnifiedBrowserView] 取消网页元素选择失败", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  const startPicking = React.useCallback(async () => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setIsPicking(true);
    logger.info("[UnifiedBrowserView] 开始网页元素选择");
    try {
      const result = (await executeJsRef.current(serializeElementPickerScript(labels ? { labels } : {}))) as unknown;
      if (runIdRef.current !== runId) return;
      if (!isPickerResult(result)) {
        logger.warn("[UnifiedBrowserView] 网页元素选择返回了无法识别的结果");
        return;
      }
      if (result.status === "cancelled") {
        logger.info("[UnifiedBrowserView] 网页元素选择已取消");
        return;
      }
      const context = attachWorkspaceToPickedElement({ result, workspacePath, workspaceIdentity });
      if (!context) {
        logger.warn("[UnifiedBrowserView] 网页元素上下文无效，已丢弃");
        return;
      }
      addWebElementContextToChat(context);
      logger.info("[UnifiedBrowserView] 网页元素上下文已加入聊天", {
        tagName: context.tagName,
        url: originPathOfUrl(context.pageUrl),
      });
    } catch (error) {
      logger.warn("[UnifiedBrowserView] 网页元素选择失败", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      if (runIdRef.current === runId) setIsPicking(false);
    }
  }, [labels, workspaceIdentity, workspacePath]);

  const togglePicking = React.useCallback(async () => {
    if (isPicking) {
      await cancelPicking();
      return;
    }
    await startPicking();
  }, [cancelPicking, isPicking, startPicking]);

  React.useEffect(() => {
    if (!isPicking) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelPicking();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [cancelPicking, isPicking]);

  React.useEffect(
    () => () => {
      cancelPicking();
    },
    [cancelPicking],
  );

  return { cancelPicking, isPicking, startPicking, togglePicking };
}

/* ============================================================================
 * 3. 工具栏（原 kUt/g5/AUt/jUt，js 176539–176687）
 * ==========================================================================*/

/** 原 g5：Tooltip 包裹的图标按钮（active→secondary 底 + aria-pressed） */
export function ToolbarIconButton({
  dataTestId,
  disabled,
  icon,
  onClick,
  title,
  active = false,
  pressed,
}: {
  dataTestId?: string;
  disabled?: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  pressed?: boolean;
}) {
  return (
    <Tooltip title={title}>
      <Button
        type="button"
        size="icon-md"
        variant={active ? "secondary" : "ghost"}
        aria-label={title}
        aria-pressed={pressed}
        data-testid={dataTestId}
        disabled={disabled}
        onClick={onClick}
      >
        {icon}
      </Button>
    </Tooltip>
  );
}

/** 原 AUt：⋯ 更多菜单（外部打开 / DevTools） */
export function BrowserMoreMenu({
  canOpenDevTools,
  canOpenExternal,
  formatMessage,
  onOpenDevTools,
  onOpenExternal,
}: {
  canOpenDevTools: boolean;
  canOpenExternal: boolean;
  formatMessage: ZCodeIntl["formatMessage"];
  onOpenDevTools: () => void;
  onOpenExternal: () => void;
}) {
  const label = formatMessage({ id: "browser.more" });
  return (
    <DropdownMenu>
      <Tooltip title={label}>
        <DropdownMenuTrigger asChild>
          <Button type="button" size="icon-md" variant="ghost" aria-label={label} data-testid="browser-more-button">
            <IconEllipsis className="size-4" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem data-testid="browser-open-external-item" disabled={!canOpenExternal} onSelect={onOpenExternal}>
          <IconOpenExternal className="size-4" />
          <span>{formatMessage({ id: "browser.openExternal" })}</span>
        </DropdownMenuItem>
        <DropdownMenuItem data-testid="browser-devtools-button" disabled={!canOpenDevTools} onSelect={onOpenDevTools}>
          <IconBug className="size-4" />
          <span>{formatMessage({ id: "browser.devtools" })}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** 原 kUt：地址栏工具条（form h-12 px-3 gap-2） */
export function BrowserToolbar({
  addressValue,
  browserState,
  formatMessage,
  onAddressChange,
  onGoBack,
  onGoForward,
  onOpenExternal,
  onOpenDevTools,
  onPickElement,
  onReload,
  onToggleResponsiveMode,
  onSubmit,
  isElementPickerActive,
  isResponsiveMode,
}: {
  addressValue: string;
  browserState: BrowserNavigationState;
  formatMessage: ZCodeIntl["formatMessage"];
  onAddressChange: (value: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onOpenExternal: () => void;
  onOpenDevTools: () => void;
  onPickElement: () => void;
  onReload: () => void;
  onToggleResponsiveMode: () => void;
  onSubmit: (event: React.FormEvent) => void;
  isElementPickerActive: boolean;
  isResponsiveMode: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex items-center h-12 px-3 gap-2">
      <ToolbarIconButton
        icon={<IconArrowLeft className="h-4 w-4" />}
        title={formatMessage({ id: "browser.back" })}
        disabled={!browserState.canGoBack}
        dataTestId="browser-back-button"
        onClick={onGoBack}
      />
      <ToolbarIconButton
        icon={<IconArrowRight className="h-4 w-4" />}
        title={formatMessage({ id: "browser.forward" })}
        disabled={!browserState.canGoForward}
        dataTestId="browser-forward-button"
        onClick={onGoForward}
      />
      <ToolbarIconButton
        icon={<IconRotateCw className={`h-4 w-4 ${browserState.isLoading ? "animate-spin" : ""}`} />}
        title={formatMessage({ id: "browser.reload" })}
        disabled={!browserState.isReady}
        dataTestId="browser-refresh-button"
        onClick={onReload}
      />
      <Input
        type="text"
        value={addressValue}
        data-testid="browser-address-input"
        size="sm"
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder={formatMessage({ id: "browser.addressPlaceholder" })}
        spellCheck={false}
      />
      <ToolbarIconButton
        icon={<IconSmartphone className="h-4 w-4" />}
        title={formatMessage({ id: isResponsiveMode ? "browser.responsive.exit" : "browser.responsive.enter" })}
        disabled={false}
        dataTestId="browser-responsive-button"
        onClick={onToggleResponsiveMode}
        active={isResponsiveMode}
        pressed={isResponsiveMode}
      />
      <ToolbarIconButton
        icon={<IconMousePointerClick className="h-4 w-4" />}
        title={formatMessage({ id: isElementPickerActive ? "browser.elementPicker.cancel" : "browser.elementPicker.start" })}
        disabled={!browserState.isReady}
        dataTestId="browser-element-picker-button"
        onClick={onPickElement}
        active={isElementPickerActive}
      />
      <BrowserMoreMenu
        canOpenExternal={browserState.isReady && isHttpUrl(browserState.currentUrl)}
        canOpenDevTools={browserState.isReady}
        formatMessage={formatMessage}
        onOpenExternal={onOpenExternal}
        onOpenDevTools={onOpenDevTools}
      />
    </form>
  );
}

/** 原 jUt：空态覆盖层（globe|spinner + 文案） */
export function BrowserEmptyState({
  browserState,
  formatMessage,
}: {
  browserState: BrowserNavigationState;
  formatMessage: ZCodeIntl["formatMessage"];
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background px-6">
      <div className="flex max-w-sm flex-col pb-10 items-center text-center">
        {browserState.isReady ? (
          <IconGlobe className="mb-6 size-16 text-foreground opacity-30" />
        ) : (
          <IconLoader className="mb-6 size-16 animate-spin text-foreground opacity-30" />
        )}
        <h3 className="text-ui-base font-medium text-foreground">{formatMessage({ id: "browser.title" })}</h3>
        <p className="mt-2 text-ui-base text-foreground-subtle">{formatMessage({ id: "browser.empty" })}</p>
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. 响应式视口（原 176711–177344）
 * ==========================================================================*/

/** 原 MUt */
export const ZOOM_OPTIONS = ["fit", "50", "75", "100", "125", "150", "200"];

/** 原 NUt：fit→画布扣除 32px 边距后按桌面 zoom 缩放取最小比 */
export function resolveVisualScale(args: {
  canvasSize: { width: number; height: number } | null;
  desktopZoomFactor?: number;
  viewportSize: ViewportSize;
  zoom: string;
}): number {
  if (args.zoom !== "fit") return Number(args.zoom) / 100;
  const canvas = args.canvasSize;
  if (!canvas || canvas.width <= 0 || canvas.height <= 0) return 1;
  const zoomFactor = Number.isFinite(args.desktopZoomFactor) && (args.desktopZoomFactor as number) > 0 ? (args.desktopZoomFactor as number) : 1;
  const availableWidth = Math.max(0, canvas.width - 32) * zoomFactor;
  const availableHeight = Math.max(0, canvas.height - 32) * zoomFactor;
  return availableWidth === 0 || availableHeight === 0 ? 1 : Math.min(1, availableWidth / args.viewportSize.width, availableHeight / args.viewportSize.height);
}

/** 原 PUt */
export function resolveTransformScale(args: { desktopZoomFactor: number; visualScale: number }): number {
  return args.visualScale / (Number.isFinite(args.desktopZoomFactor) && args.desktopZoomFactor > 0 ? args.desktopZoomFactor : 1);
}

/** 原 FUt：桌面 zoom<1 时布局放大补偿 */
export function resolveDesktopLayoutScale(factor: number): { layoutScale: number; transformScale: number } {
  const safe = Number.isFinite(factor) && factor > 0 ? factor : 1;
  return safe > 1
    ? { layoutScale: 1, transformScale: 1 }
    : safe < 1
      ? { layoutScale: 1 / safe, transformScale: safe }
      : { layoutScale: 1, transformScale: 1 };
}

/** 原 di（src-HCld2afU.js 反查） */
export const RESPONSIVE_VIEWPORT_LIMITS = { minWidth: 320, maxWidth: 3840, minHeight: 320, maxHeight: 2160 };

interface ResizeDirection {
  widthDirection: -1 | 0 | 1;
  heightDirection: -1 | 0 | 1;
}
interface EdgeHandle extends ResizeDirection {
  className: string;
  dimension: "width" | "height";
  key: string;
  orientation: "vertical" | "horizontal";
  testId: string;
}
interface CornerHandle extends ResizeDirection {
  className: string;
  key: string;
  testId: string;
}

/** 原 IUt */
const EDGE_HANDLES: EdgeHandle[] = [
  {
    className: "top-0 -left-2 h-full w-4 cursor-ew-resize",
    dimension: "width",
    heightDirection: 0,
    key: "left",
    orientation: "vertical",
    testId: "browser-responsive-resize-left",
    widthDirection: -1,
  },
  {
    className: "top-0 -right-2 h-full w-4 cursor-ew-resize",
    dimension: "width",
    heightDirection: 0,
    key: "right",
    orientation: "vertical",
    testId: "browser-responsive-resize-width",
    widthDirection: 1,
  },
  {
    className: "-top-2 left-0 h-4 w-full cursor-ns-resize",
    dimension: "height",
    heightDirection: -1,
    key: "top",
    orientation: "horizontal",
    testId: "browser-responsive-resize-top",
    widthDirection: 0,
  },
  {
    className: "-bottom-2 left-0 h-4 w-full cursor-ns-resize",
    dimension: "height",
    heightDirection: 1,
    key: "bottom",
    orientation: "horizontal",
    testId: "browser-responsive-resize-height",
    widthDirection: 0,
  },
];

/** 原 LUt */
const CORNER_HANDLES: CornerHandle[] = [
  {
    className: "-top-2 -left-2 cursor-nwse-resize",
    heightDirection: -1,
    key: "top-left",
    testId: "browser-responsive-resize-corner-top-left",
    widthDirection: -1,
  },
  {
    className: "-top-2 -right-2 cursor-nesw-resize",
    heightDirection: -1,
    key: "top-right",
    testId: "browser-responsive-resize-corner-top-right",
    widthDirection: 1,
  },
  {
    className: "-bottom-2 -left-2 cursor-nesw-resize",
    heightDirection: 1,
    key: "bottom-left",
    testId: "browser-responsive-resize-corner-bottom-left",
    widthDirection: -1,
  },
  {
    className: "-right-2 -bottom-2 cursor-nwse-resize",
    heightDirection: 1,
    key: "bottom-right",
    testId: "browser-responsive-resize-corner",
    widthDirection: 1,
  },
];

/** 原 RUt */
const EDGE_ICON_CLASS =
  "pointer-events-none absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-foreground-subtlest opacity-0 transition-[color,opacity] group-hover/resize-edge:text-foreground-subtle group-hover/resize-edge:opacity-100 group-focus-visible/resize-edge:text-foreground-subtle group-focus-visible/resize-edge:opacity-100";

/** 原 zUt：4 边 separator（role=separator + aria-value* + 键盘）+ 4 角拖拽 */
export function ResponsiveResizeHandles({
  height,
  heightLabel,
  onBeginResize,
  onEndResize,
  onPointerMove,
  onResizeKeyDown,
  width,
  widthLabel,
}: {
  height: number;
  heightLabel: string;
  onBeginResize: (direction: ResizeDirection, event: React.PointerEvent) => void;
  onEndResize: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onResizeKeyDown: (direction: ResizeDirection, event: React.KeyboardEvent) => void;
  width: number;
  widthLabel: string;
}) {
  return (
    <>
      {EDGE_HANDLES.map((handle) => {
        const isWidth = handle.dimension === "width";
        const direction: ResizeDirection = { heightDirection: handle.heightDirection, widthDirection: handle.widthDirection };
        return (
          <div
            key={handle.key}
            aria-label={isWidth ? widthLabel : heightLabel}
            aria-orientation={handle.orientation}
            aria-valuemax={isWidth ? RESPONSIVE_VIEWPORT_LIMITS.maxWidth : RESPONSIVE_VIEWPORT_LIMITS.maxHeight}
            aria-valuemin={isWidth ? RESPONSIVE_VIEWPORT_LIMITS.minWidth : RESPONSIVE_VIEWPORT_LIMITS.minHeight}
            aria-valuenow={isWidth ? width : height}
            className={cn("group/resize-edge absolute z-30 touch-none outline-none", handle.className)}
            data-resize-edge={handle.key}
            data-testid={handle.testId}
            onKeyDown={(e) => onResizeKeyDown(direction, e)}
            onLostPointerCapture={onEndResize}
            onPointerCancel={onEndResize}
            onPointerDown={(e) => onBeginResize(direction, e)}
            onPointerMove={onPointerMove}
            onPointerUp={onEndResize}
            role="separator"
            tabIndex={0}
          >
            {handle.orientation === "vertical" ? (
              <IconMoveHorizontal className={EDGE_ICON_CLASS} />
            ) : (
              <IconMoveVertical className={EDGE_ICON_CLASS} />
            )}
          </div>
        );
      })}
      {CORNER_HANDLES.map((handle) => {
        const direction: ResizeDirection = { heightDirection: handle.heightDirection, widthDirection: handle.widthDirection };
        return (
          <div
            key={handle.key}
            aria-hidden="true"
            className={cn("absolute z-40 size-5 touch-none", handle.className)}
            data-resize-corner={handle.key}
            data-testid={handle.testId}
            onLostPointerCapture={onEndResize}
            onPointerCancel={onEndResize}
            onPointerDown={(e) => onBeginResize(direction, e)}
            onPointerMove={onPointerMove}
            onPointerUp={onEndResize}
          />
        );
      })}
    </>
  );
}

/** 原 BUt */
export const DEFAULT_VIEWPORT_SIZE = { width: 393, height: 852 };

export interface ViewportSize {
  width: number;
  height: number;
}

/** 原 VUt */
function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** 原 HUt */
export function clampViewport(size: ViewportSize): ViewportSize {
  return {
    width: clampInt(size.width, RESPONSIVE_VIEWPORT_LIMITS.minWidth, RESPONSIVE_VIEWPORT_LIMITS.maxWidth),
    height: clampInt(size.height, RESPONSIVE_VIEWPORT_LIMITS.minHeight, RESPONSIVE_VIEWPORT_LIMITS.maxHeight),
  };
}

interface ActiveDrag extends ResizeDirection {
  captureTarget: Element & { hasPointerCapture(id: number): boolean; releasePointerCapture(id: number): void };
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startSize: ViewportSize;
}

/** 原 UUt：响应式画布（fit 重测 RO + 指针拖拽 + 键盘微调 + blur 收尾） */
export function ResponsiveViewportCanvas({
  active,
  children,
  desktopZoomFactor,
  isComposed,
  onResize,
  onViewportSizeChange,
  viewportSize,
  zoom,
}: {
  active: boolean;
  children: React.ReactNode;
  desktopZoomFactor: number;
  isComposed: boolean;
  onResize?: () => void;
  onViewportSizeChange: (size: ViewportSize) => void;
  viewportSize: ViewportSize;
  zoom: string;
}) {
  const { intl } = useIntlContext();
  const canvasRef = React.useRef<HTMLDivElement | null>(null);
  const sizeRef = React.useRef(viewportSize);
  const scaleRef = React.useRef(1);
  const dragRef = React.useRef<ActiveDrag | null>(null);
  const pendingSizeRef = React.useRef<ViewportSize | null>(null);
  const resizeRafRef = React.useRef(0);
  const [canvasSize, setCanvasSize] = React.useState<{ width: number; height: number } | null>(null);

  const visualScale = active ? resolveVisualScale({ canvasSize, desktopZoomFactor, viewportSize, zoom }) : 1;
  const transformScale = active ? resolveTransformScale({ desktopZoomFactor, visualScale }) : 1;
  scaleRef.current = transformScale;

  const commitSize = React.useCallback(
    (size: ViewportSize) => {
      const clamped = clampViewport(size);
      const previous = sizeRef.current;
      if (previous.width === clamped.width && previous.height === clamped.height) return;
      sizeRef.current = clamped;
      onViewportSizeChange(clamped);
      onResize?.();
    },
    [onResize, onViewportSizeChange],
  );

  React.useEffect(() => {
    sizeRef.current = viewportSize;
  }, [viewportSize]);

  const scheduleCommit = React.useCallback(
    (size: ViewportSize) => {
      pendingSizeRef.current = clampViewport(size);
      if (resizeRafRef.current === 0)
        resizeRafRef.current = window.requestAnimationFrame(() => {
          resizeRafRef.current = 0;
          const pending = pendingSizeRef.current;
          pendingSizeRef.current = null;
          if (pending) commitSize(pending);
        });
    },
    [commitSize],
  );

  /** 原 x：结束拖拽（释放捕获 + 冲刷 pending） */
  const endDrag = React.useCallback(
    (reason: string, pointerId?: number, commit = true) => {
      const drag = dragRef.current;
      if (!drag || (pointerId !== void 0 && drag.pointerId !== pointerId)) return;
      dragRef.current = null;
      if (resizeRafRef.current !== 0) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = 0;
      }
      const pending = pendingSizeRef.current;
      pendingSizeRef.current = null;
      if (pending && commit) commitSize(pending);
      try {
        if (drag.captureTarget.hasPointerCapture(drag.pointerId)) drag.captureTarget.releasePointerCapture(drag.pointerId);
      } catch {}
      logger.debug("[browser-use] 结束自由尺寸拖拽", { pointerId: drag.pointerId, reason });
    },
    [commitSize],
  );

  /** 原 S */
  const beginDrag = React.useCallback(
    (direction: ResizeDirection, event: React.PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      endDrag("pointer-replaced");
      try {
        (event.currentTarget as Element & { setPointerCapture(id: number): void }).setPointerCapture(event.pointerId);
      } catch {}
      dragRef.current = {
        ...direction,
        captureTarget: event.currentTarget as ActiveDrag["captureTarget"],
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startSize: sizeRef.current,
      };
    },
    [endDrag],
  );

  /** 原 C */
  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (event.pointerType === "mouse" && !(event.buttons & 1)) {
        endDrag("mouse-button-released", event.pointerId);
        return;
      }
      event.preventDefault();
      const scale = scaleRef.current > 0 ? scaleRef.current : 1;
      const deltaX = (event.clientX - drag.startClientX) / scale;
      const deltaY = (event.clientY - drag.startClientY) / scale;
      scheduleCommit({
        width: drag.startSize.width + deltaX * drag.widthDirection,
        height: drag.startSize.height + deltaY * drag.heightDirection,
      });
    },
    [endDrag, scheduleCommit],
  );

  /** 原 w */
  const endDragFromEvent = React.useCallback(
    (event: React.PointerEvent) => {
      endDrag(event.type, event.pointerId);
    },
    [endDrag],
  );

  /** 原 T：方向键 ±1（Shift ±10） */
  const handleResizeKeyDown = React.useCallback(
    (direction: ResizeDirection, event: React.KeyboardEvent) => {
      const step = event.shiftKey ? 10 : 1;
      const current = sizeRef.current;
      if (
        direction.widthDirection !== 0 &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        event.preventDefault();
        commitSize({ ...current, width: current.width + (event.key === "ArrowRight" ? step : -step) * direction.widthDirection });
      }
      if (
        direction.heightDirection !== 0 &&
        (event.key === "ArrowUp" || event.key === "ArrowDown")
      ) {
        event.preventDefault();
        commitSize({
          ...current,
          height: current.height + (event.key === "ArrowDown" ? step : -step) * direction.heightDirection,
        });
      }
    },
    [commitSize],
  );

  /* fit 模式画布重测（RO） */
  React.useLayoutEffect(() => {
    if (!active || !isComposed || zoom !== "fit") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = (size: { width: number; height: number }) => {
      if (size.width <= 0 || size.height <= 0) return;
      setCanvasSize((previous) => (previous?.width === size.width && previous.height === size.height ? previous : size));
    };
    const rect = canvas.getBoundingClientRect();
    update({ width: rect.width, height: rect.height });
    logger.debug("[browser-use] 重测自由尺寸 Fit 画布", {
      desktopZoomFactor,
      height: rect.height,
      width: rect.width,
    });
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) update({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [active, desktopZoomFactor, isComposed, zoom]);

  /* 模式退出/窗口失焦→收尾拖拽 */
  React.useEffect(() => {
    if (!active) {
      endDrag("mode-inactive", void 0, false);
      return;
    }
    const onBlur = () => endDrag("window-blur");
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("blur", onBlur);
      endDrag("mode-exit", void 0, false);
    };
  }, [active, endDrag]);

  return (
    <div
      ref={canvasRef}
      className={cn(
        "h-full min-h-0 w-full min-w-0",
        active ? "overflow-auto bg-background-alt" : "overflow-hidden bg-background",
      )}
      data-responsive-browser-mode={active ? "active" : "inactive"}
    >
      <div className={cn(active ? "flex min-h-full w-max min-w-full items-center justify-center p-4" : "h-full w-full")}>
        <div
          className={cn("relative shrink-0", active ? "bg-card shadow-sm ring-1 ring-border" : "h-full w-full")}
          data-testid="browser-responsive-scaled-frame"
          style={active ? { height: `${viewportSize.height * transformScale}px`, width: `${viewportSize.width * transformScale}px` } : void 0}
        >
          <div
            aria-label={intl.formatMessage({ id: "browser.responsive.viewport" })}
            className={cn("relative", active ? "shrink-0" : "h-full w-full")}
            data-responsive-height={active ? viewportSize.height : void 0}
            data-responsive-scale={active ? visualScale : void 0}
            data-responsive-width={active ? viewportSize.width : void 0}
            data-testid="browser-responsive-viewport"
            style={
              active
                ? {
                    height: `${viewportSize.height}px`,
                    transform: `scale(${transformScale})`,
                    transformOrigin: "top left",
                    width: `${viewportSize.width}px`,
                  }
                : void 0
            }
          >
            {children}
            {active ? (
              <ResponsiveResizeHandles
                height={viewportSize.height}
                heightLabel={intl.formatMessage({ id: "browser.responsive.resizeHeight" })}
                onBeginResize={beginDrag}
                onEndResize={endDragFromEvent}
                onPointerMove={handlePointerMove}
                onResizeKeyDown={handleResizeKeyDown}
                width={viewportSize.width}
                widthLabel={intl.formatMessage({ id: "browser.responsive.resizeWidth" })}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 原 WUt：浏览器 surface（resize 弱提示条 + 画布 + webview 合成缩放） */
export function BrowserSurface({
  browserRegionRef,
  browserState,
  desktopZoomFactor,
  isResidencyRestore,
  formatMessage,
  isEmptyBrowserState,
  isComposed,
  isResponsiveMode,
  onViewportResize,
  onViewportSizeChange,
  onWebviewRef,
  showResizeWarning,
  webviewGeneration,
  viewportSize,
  viewportZoom,
}: {
  browserRegionRef: React.MutableRefObject<HTMLDivElement | null>;
  browserState: BrowserNavigationState;
  desktopZoomFactor: number;
  isResidencyRestore: boolean;
  formatMessage: ZCodeIntl["formatMessage"];
  isEmptyBrowserState: boolean;
  isComposed: boolean;
  isResponsiveMode: boolean;
  onViewportResize: () => void;
  onViewportSizeChange: (size: ViewportSize) => void;
  onWebviewRef: (node: ElectronWebviewElement | null) => void;
  showResizeWarning: boolean;
  webviewGeneration: number;
  viewportSize: ViewportSize;
  viewportZoom: string;
}) {
  const { layoutScale, transformScale } = resolveDesktopLayoutScale(desktopZoomFactor);
  const composedLayoutScale = isResponsiveMode ? layoutScale : 1;
  const composedTransformScale = isResponsiveMode ? transformScale : 1;
  const needsAbsoluteLayout = isResponsiveMode && composedLayoutScale !== 1;
  const layoutSizeExpr = `calc(100% * ${composedLayoutScale})`;
  const setWebviewRef = React.useCallback(
    (node: ElectronWebviewElement | null) => {
      onWebviewRef(node);
    },
    [onWebviewRef],
  );
  return (
    <div ref={browserRegionRef} className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
      {showResizeWarning ? (
        <div
          role="status"
          aria-live="polite"
          data-browser-resize-warning="visible"
          className="pointer-events-none absolute top-2 right-2 left-2 z-20 mx-auto flex w-fit max-w-full items-center gap-2 rounded-xl border border-popover-border bg-popover px-3 py-2 text-ui-base font-medium text-foreground shadow-md"
        >
          <span
            aria-hidden="true"
            data-browser-resize-warning-accent="visible"
            className="h-5 w-0.5 shrink-0 rounded-full bg-warning"
          />
          <IconTriangleAlert aria-hidden="true" className="size-4 shrink-0 text-warning" />
          <span>{formatMessage({ id: "browser.resizeDuringOperationWarning" })}</span>
        </div>
      ) : null}
      <ResponsiveViewportCanvas
        active={isResponsiveMode}
        desktopZoomFactor={desktopZoomFactor}
        isComposed={isComposed}
        onResize={onViewportResize}
        onViewportSizeChange={onViewportSizeChange}
        viewportSize={viewportSize}
        zoom={viewportZoom}
      >
        {isEmptyBrowserState ? <BrowserEmptyState key="empty-state" browserState={browserState} formatMessage={formatMessage} /> : null}
        <webview
          key={`webview:${webviewGeneration}`}
          ref={setWebviewRef as unknown as React.Ref<HTMLWebViewElement>}
          allowpopups={"" as unknown as boolean}
          src={isResidencyRestore ? "zcode-browser-restore://pending" : BLANK_URL}
          partition="persist:zcode-embedded-browser"
          nodeintegrationinsubframes="true"
          data-browser-compositor-scale={isResponsiveMode ? desktopZoomFactor : void 0}
          data-browser-layout-scale={isResponsiveMode ? composedLayoutScale : void 0}
          data-browser-transform-scale={isResponsiveMode ? composedTransformScale : void 0}
          data-testid="browser-webview"
          data-browser-resize-dimmed={showResizeWarning ? "true" : void 0}
          className={cn("browser-use-viewport h-full min-h-0 w-full", isEmptyBrowserState ? "hidden" : "inline-flex")}
          style={
            isResponsiveMode
              ? {
                  ...(needsAbsoluteLayout
                    ? { height: layoutSizeExpr, left: 0, position: "absolute", top: 0, width: layoutSizeExpr }
                    : {}),
                  ...(composedTransformScale === 1 ? {} : { transform: `scale(${composedTransformScale})`, transformOrigin: "top left" }),
                }
              : void 0
          }
        />
      </ResponsiveViewportCanvas>
    </div>
  );
}

/** 原 GUt */
export function isValidDimension(dimension: "width" | "height", value: number): boolean {
  return Number.isInteger(value)
    ? dimension === "width"
      ? value >= RESPONSIVE_VIEWPORT_LIMITS.minWidth && value <= RESPONSIVE_VIEWPORT_LIMITS.maxWidth
      : value >= RESPONSIVE_VIEWPORT_LIMITS.minHeight && value <= RESPONSIVE_VIEWPORT_LIMITS.maxHeight
    : false;
}

/** 原 KUt */
export function dimensionLimits(dimension: "width" | "height"): { max: number; min: number } {
  return dimension === "width"
    ? { max: RESPONSIVE_VIEWPORT_LIMITS.maxWidth, min: RESPONSIVE_VIEWPORT_LIMITS.minWidth }
    : { max: RESPONSIVE_VIEWPORT_LIMITS.maxHeight, min: RESPONSIVE_VIEWPORT_LIMITS.minHeight };
}

/** 原 qUt：响应式工具条（W×H 数字输入 + Popover 越界报错 + zoom Select） */
export function ResponsiveToolbar({
  onViewportSizeChange,
  onZoomChange,
  viewportSize,
  zoom,
}: {
  onViewportSizeChange: (size: ViewportSize) => void;
  onZoomChange: (zoom: string) => void;
  viewportSize: ViewportSize;
  zoom: string;
}) {
  const { intl } = useIntlContext();
  const [widthText, setWidthText] = React.useState(String(viewportSize.width));
  const [heightText, setHeightText] = React.useState(String(viewportSize.height));
  const [invalid, setInvalid] = React.useState({ height: false, width: false });

  React.useEffect(() => {
    setWidthText(String(viewportSize.width));
  }, [viewportSize.width]);
  React.useEffect(() => {
    setHeightText(String(viewportSize.height));
  }, [viewportSize.height]);

  const setInvalidFlag = (dimension: "width" | "height", value: boolean) => {
    setInvalid((prev) => (prev[dimension] === value ? prev : { ...prev, [dimension]: value }));
  };
  const resetText = (dimension: "width" | "height") => {
    setInvalidFlag(dimension, false);
    if (dimension === "width") {
      setWidthText(String(viewportSize.width));
      return;
    }
    setHeightText(String(viewportSize.height));
  };
  const commit = (dimension: "width" | "height") => {
    const parsed = Number((dimension === "width" ? widthText : heightText).trim());
    if (!isValidDimension(dimension, parsed)) {
      setInvalidFlag(dimension, true);
      return;
    }
    setInvalidFlag(dimension, false);
    if (viewportSize[dimension] === parsed) {
      resetText(dimension);
      return;
    }
    onViewportSizeChange({ ...viewportSize, [dimension]: parsed });
  };
  const handleChange = (dimension: "width" | "height", value: string) => {
    if (dimension === "width") setWidthText(value);
    else setHeightText(value);
    if (invalid[dimension]) setInvalidFlag(dimension, !isValidDimension(dimension, Number(value.trim())));
  };
  const errorMessage = (dimension: "width" | "height") => {
    const limits = dimensionLimits(dimension);
    return intl.formatMessage(
      { id: "browser.responsive.dimensionRangeError" },
      { max: String(limits.max), min: String(limits.min) },
    );
  };
  const handleKeyDown = (dimension: "width" | "height", event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit(dimension);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      resetText(dimension);
      event.currentTarget.blur();
    }
  };
  return (
    <div
      className="flex h-8 shrink-0 items-center justify-center gap-1 overflow-x-auto border-y border-border bg-background px-2"
      data-testid="browser-responsive-toolbar"
    >
      <Popover open={invalid.width}>
        <PopoverTrigger asChild>
          <Input
            aria-invalid={invalid.width || void 0}
            aria-label={intl.formatMessage({ id: "browser.responsive.width" })}
            className="h-7 w-14 shrink-0 border-transparent bg-transparent px-1 text-center font-sans text-ui-base font-medium tabular-nums hover:border-transparent hover:bg-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive"
            data-testid="browser-responsive-width-input"
            inputMode="numeric"
            max={RESPONSIVE_VIEWPORT_LIMITS.maxWidth}
            min={RESPONSIVE_VIEWPORT_LIMITS.minWidth}
            onBlur={() => commit("width")}
            onChange={(e) => handleChange("width", e.target.value)}
            onKeyDown={(e) => handleKeyDown("width", e)}
            size="sm"
            spellCheck={false}
            value={widthText}
          />
        </PopoverTrigger>
        <PopoverContent align="center" className="border-destructive bg-popover text-destructive" side="bottom" sideOffset={4}>
          {errorMessage("width")}
        </PopoverContent>
      </Popover>
      {invalid.width ? <span className="sr-only" role="alert">{errorMessage("width")}</span> : null}
      <span aria-hidden="true" className="shrink-0 text-ui-base text-foreground-subtle">
        ×
      </span>
      <Popover open={invalid.height}>
        <PopoverTrigger asChild>
          <Input
            aria-invalid={invalid.height || void 0}
            aria-label={intl.formatMessage({ id: "browser.responsive.height" })}
            className="h-7 w-14 shrink-0 border-transparent bg-transparent px-1 text-center font-sans text-ui-base font-medium tabular-nums hover:border-transparent hover:bg-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive"
            data-testid="browser-responsive-height-input"
            inputMode="numeric"
            max={RESPONSIVE_VIEWPORT_LIMITS.maxHeight}
            min={RESPONSIVE_VIEWPORT_LIMITS.minHeight}
            onBlur={() => commit("height")}
            onChange={(e) => handleChange("height", e.target.value)}
            onKeyDown={(e) => handleKeyDown("height", e)}
            size="sm"
            spellCheck={false}
            value={heightText}
          />
        </PopoverTrigger>
        <PopoverContent align="center" className="border-destructive bg-popover text-destructive" side="bottom" sideOffset={4}>
          {errorMessage("height")}
        </PopoverContent>
      </Popover>
      {invalid.height ? <span className="sr-only" role="alert">{errorMessage("height")}</span> : null}
      <Select value={zoom} onValueChange={(value) => onZoomChange(value)}>
        <SelectTrigger
          aria-label={intl.formatMessage({ id: "browser.responsive.zoom" })}
          className="min-w-24 shrink-0 font-medium tabular-nums"
          data-testid="browser-responsive-zoom-select"
          size="default"
          variant="ghost"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContentAlignEnd>
          {ZOOM_OPTIONS.map((option) => (
            <SelectItem key={option} data-testid={`browser-responsive-zoom-option-${option}`} value={option}>
              {option === "fit" ? intl.formatMessage({ id: "browser.responsive.fitToWindow" }) : `${option}%`}
            </SelectItem>
          ))}
        </SelectContentAlignEnd>
      </Select>
    </div>
  );
}
/** 原 sO（SelectContent align=end） */
declare const SelectContentAlignEnd: React.FC<{ children: React.ReactNode }>;

/* ============================================================================
 * 5. resize 弱提示（原 JUt/$Ut，js 177344–177455）
 * ==========================================================================*/

/** 原 JUt：时间戳未到达期间为 true */
export function useFutureTimestamp(timestampMs: number): boolean {
  const [nowTick, setNowTick] = React.useState(0);
  const pending = timestampMs > Date.now() && nowTick !== timestampMs;
  React.useEffect(() => {
    const remaining = timestampMs - Date.now();
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => setNowTick(timestampMs), remaining);
    return () => window.clearTimeout(timer);
  }, [timestampMs]);
  return pending;
}

/** 原 YUt/XUt/ZUt/QUt */
const RESIZE_WARNING_DURATION_MS = 3000;
const RESIZE_SETTLE_WINDOW_MS = 300;
const RESIZE_SETTLE_MIN_STEP_MS = 100;
const RESIZE_SETTLE_HARD_CAP_MS = 500;

/** 原 $Ut：agent 操作期 browser 区域尺寸变化→3s 弱提示（settle 窗内不提示） */
export function useBrowserResizeWarning({
  browserKey,
  isVisible,
  operationUntil,
  resizeBaselineVersion,
}: {
  browserKey: string;
  isVisible: boolean;
  operationUntil: number | undefined;
  resizeBaselineVersion: number | undefined;
}) {
  const [showResizeWarning, setShowResizeWarning] = React.useState(false);
  const regionRef = React.useRef<HTMLDivElement | null>(null);
  const lastSizeRef = React.useRef<ViewportSize | null>(null);
  const warnedRef = React.useRef(false);
  const warningTimerRef = React.useRef<number | null>(null);
  const settleUntilRef = React.useRef(0);
  const settleCapRef = React.useRef(0);
  const baselineVersionRef = React.useRef(resizeBaselineVersion);
  const didMountRef = React.useRef(false);
  const isVisibleRef = React.useRef(isVisible);
  const isOperating = useFutureTimestamp(operationUntil ?? 0);
  const isOperatingRef = React.useRef(isOperating);

  isVisibleRef.current = isVisible;
  isOperatingRef.current = isOperating;

  /** 原 _：触发一次弱提示（同周期仅一次） */
  const notifyBrowserViewportResize = React.useCallback(() => {
    if (!isVisibleRef.current || !isOperatingRef.current || warnedRef.current) return;
    warnedRef.current = true;
    setShowResizeWarning(true);
    warningTimerRef.current = window.setTimeout(() => {
      warningTimerRef.current = null;
      setShowResizeWarning(false);
    }, RESIZE_WARNING_DURATION_MS);
  }, []);

  /** 原 v：重置 settle 窗（now+300，硬上限 now+500） */
  const resetSettleWindow = React.useCallback(() => {
    const now = Date.now();
    lastSizeRef.current = null;
    settleUntilRef.current = now + RESIZE_SETTLE_WINDOW_MS;
    settleCapRef.current = now + RESIZE_SETTLE_HARD_CAP_MS;
  }, []);

  /** 原 y */
  const prepareForAgentViewportChange = React.useCallback(
    (expected: boolean) => {
      if (expected) resetSettleWindow();
    },
    [resetSettleWindow],
  );

  /* baseline 版本变化（agent 侧 viewport 切换）→settle 窗 */
  React.useLayoutEffect(() => {
    const previousVersion = baselineVersionRef.current;
    const didMount = didMountRef.current;
    const mountedWithBaseline = !didMount && (resizeBaselineVersion ?? 0) > 0;
    const versionChanged = didMount && previousVersion !== resizeBaselineVersion;
    baselineVersionRef.current = resizeBaselineVersion;
    didMountRef.current = true;
    lastSizeRef.current = null;
    if (mountedWithBaseline || versionChanged) resetSettleWindow();
  }, [resetSettleWindow, isVisible, resizeBaselineVersion]);

  React.useEffect(() => {
    if (isOperating) return;
    warnedRef.current = false;
    setShowResizeWarning(false);
    if (warningTimerRef.current !== null) {
      window.clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, [isOperating]);

  React.useEffect(() => {
    const region = regionRef.current;
    if (!region || typeof ResizeObserver > "u") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const next: ViewportSize = {
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      };
      if (next.width <= 0 || next.height <= 0) return;
      const previous = lastSizeRef.current;
      lastSizeRef.current = next;
      const now = Date.now();
      const settling = now <= settleUntilRef.current;
      if (settling) settleUntilRef.current = Math.min(settleCapRef.current, Math.max(settleUntilRef.current, now + RESIZE_SETTLE_MIN_STEP_MS));
      const sizeChanged = previous !== null && (previous.width !== next.width || previous.height !== next.height);
      logger.debug("[browser-use] browser region ResizeObserver", {
        browserKey,
        isAgentOperating: isOperatingRef.current,
        isVisible: isVisibleRef.current,
        nextSize: next,
        previousSize: previous,
        resizeBaselineVersion,
        isAgentLayoutSettling: settling,
        sizeChanged,
        warnedForActiveCycle: warnedRef.current,
      });
      if (!sizeChanged || settling) return;
      notifyBrowserViewportResize();
    });
    observer.observe(region);
    return () => observer.disconnect();
  }, [browserKey, resizeBaselineVersion, notifyBrowserViewportResize]);

  React.useEffect(
    () => () => {
      if (warningTimerRef.current !== null) window.clearTimeout(warningTimerRef.current);
    },
    [],
  );

  return {
    browserRegionRef: regionRef as React.MutableRefObject<HTMLDivElement | null>,
    notifyBrowserViewportResize,
    prepareForAgentViewportChange,
    showResizeWarning,
  };
}

/* ============================================================================
 * 6. 截图 surface 稳定（原 177456–177618）
 * ==========================================================================*/

/** 原 eWt */
function roundSize(width: number, height: number): ViewportSize | null {
  const size = { width: Math.round(width), height: Math.round(height) };
  return size.width > 0 && size.height > 0 ? size : null;
}

/** 原 v5 */
function sizesEqual(a: ViewportSize, b: ViewportSize): boolean {
  return Math.abs(a.width - b.width) <= 1 && Math.abs(a.height - b.height) <= 1;
}

/** 原 tWt/nWt/rWt */
const SURFACE_SCALE_EPSILON = 0.001;
const SURFACE_RETRY_INTERVAL_MS = 100;
const SURFACE_WAIT_TIMEOUT_MS = 2500;

/** 原 iWt */
function layoutScaleOf(webview: ElectronWebviewElement): number {
  const raw = Number(webview.dataset.browserLayoutScale);
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

/** 原 aWt */
function responsiveScaleOf(webview: ElectronWebviewElement): number {
  const ancestor = webview.closest("[data-responsive-scale]");
  const raw = Number(ancestor?.getAttribute("data-responsive-scale"));
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

interface SurfaceSnapshot {
  surfaceScale: number;
  viewport: ViewportSize;
}

/** 原 oWt */
function surfaceSnapshotsEqual(a: SurfaceSnapshot, b: SurfaceSnapshot): boolean {
  return sizesEqual(a.viewport, b.viewport) && Math.abs(a.surfaceScale - b.surfaceScale) <= SURFACE_SCALE_EPSILON;
}

/** 原 sWt：rect 与 offset/layout-scale 两路测量取与期望一致者 */
function measureWebviewViewport(webview: ElectronWebviewElement, expected: ViewportSize): ViewportSize | null {
  const rect = webview.getBoundingClientRect();
  const rectSize = roundSize(rect.width, rect.height);
  const layoutScale = layoutScaleOf(webview);
  const offsetSize = roundSize(webview.offsetWidth / layoutScale, webview.offsetHeight / layoutScale);
  if (rectSize && sizesEqual(rectSize, expected)) return rectSize;
  if (offsetSize && sizesEqual(offsetSize, expected)) return offsetSize;
  return rectSize ?? offsetSize;
}

export interface ScreenshotSurfaceRequest {
  requestId: string;
  tabId: string;
  workspaceKey: string;
  sessionId: string;
  browserId: string;
  browserGeneration: number;
  webContentsId: number;
  viewport: ViewportSize;
}

/** 原 cWt：截图 surface 稳定等待（guest 对齐 + viewport 对齐 + scale 双采样→ready 上报） */
export function useScreenshotSurfaceStabilizer(request: ScreenshotSurfaceRequest | null, webview: ElectronWebviewElement | null) {
  const platform = usePlatformService();
  React.useEffect(() => {
    if (!request || !webview || typeof ResizeObserver > "u") return;
    const activeRequest = request;
    const activeWebview = webview;
    let disposed = false;
    let stabilized = false;
    let lastSnapshot: SurfaceSnapshot | null = null;
    let rafId: number | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let loggedMisaligned = false;
    let attempt = 0;
    const deadline = Date.now() + SURFACE_WAIT_TIMEOUT_MS;

    const cancelPending = () => {
      attempt += 1;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    };
    function scheduleRetry() {
      if (disposed || stabilized) return;
      cancelPending();
      const currentAttempt = attempt;
      const fire = () => {
        if (disposed || stabilized || currentAttempt !== attempt) return;
        cancelPending();
        checkStability();
      };
      rafId = window.requestAnimationFrame(fire);
      retryTimer = setTimeout(fire, SURFACE_RETRY_INTERVAL_MS);
    }
    function retryOrTimeout() {
      if (Date.now() >= deadline) {
        logger.warn("[browser-use] 截图 surface 等待超时，停止重试", {
          requestId: activeRequest.requestId,
          tabId: activeRequest.tabId,
          expectedViewport: activeRequest.viewport,
        });
        return;
      }
      scheduleRetry();
    }
    function checkStability() {
      const guestId = safeWebviewCall(() => activeWebview.getWebContentsId(), 0);
      if (guestId !== activeRequest.webContentsId) {
        logger.debug("[browser-use] 截图 surface 等待当前 guest", {
          requestId: activeRequest.requestId,
          expectedGuestId: activeRequest.webContentsId,
          guestId,
        });
        retryOrTimeout();
        return;
      }
      const viewport = measureWebviewViewport(activeWebview, activeRequest.viewport);
      if (!viewport || !sizesEqual(viewport, activeRequest.viewport)) {
        if (!loggedMisaligned) {
          loggedMisaligned = true;
          logger.debug("[browser-use] 截图 surface viewport 尚未对齐", {
            requestId: activeRequest.requestId,
            expectedViewport: activeRequest.viewport,
            viewport,
          });
        }
        retryOrTimeout();
        return;
      }
      const snapshot: SurfaceSnapshot = { surfaceScale: responsiveScaleOf(activeWebview), viewport };
      if (!lastSnapshot || !surfaceSnapshotsEqual(lastSnapshot, snapshot)) {
        lastSnapshot = snapshot;
        retryOrTimeout();
        return;
      }
      if (stabilized) return;
      logger.debug("[browser-use] 截图 surface 已稳定", {
        requestId: activeRequest.requestId,
        tabId: activeRequest.tabId,
        surfaceScale: snapshot.surfaceScale,
        viewport: snapshot.viewport,
      });
      stabilized = true;
      platform.browserViewScreenshotSurfaceReady?.({
        ...activeRequest,
        surfaceScale: snapshot.surfaceScale,
        viewport: snapshot.viewport,
      });
    }
    function invalidate() {
      if (disposed || stabilized) return;
      lastSnapshot = null;
      loggedMisaligned = false;
      cancelPending();
      scheduleRetry();
    }
    const observer = new ResizeObserver(() => {
      invalidate();
    });
    const onDomReady = () => {
      invalidate();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") invalidate();
    };
    observer.observe(activeWebview as unknown as Element);
    activeWebview.addEventListener("dom-ready", onDomReady);
    document.addEventListener("visibilitychange", onVisibilityChange);
    scheduleRetry();
    return () => {
      disposed = true;
      observer.disconnect();
      activeWebview.removeEventListener("dom-ready", onDomReady);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelPending();
    };
  }, [platform, request, webview]);
}

/* ============================================================================
 * 7. guest wheel 续接 + 桌面 zoom（原 177592–177641）
 * ==========================================================================*/

/** 原 fre.WheelBoundary（src-HCld2afU.js 反查） */
const IPC_CHANNEL_WHEEL_BOUNDARY = "zcode:embedded-browser-wheel-boundary";

/** 原 lWt */
function wheelDelta(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** 原 uWt：响应式模式下 guest 越界 wheel 续接画布滚动 */
export function useGuestWheelCanvasScroll({
  browserRegionRef,
  isResponsiveMode,
  webview,
}: {
  browserRegionRef: React.MutableRefObject<HTMLDivElement | null>;
  isResponsiveMode: boolean;
  webview: ElectronWebviewElement | null;
}) {
  React.useEffect(() => {
    if (!webview) return;
    const onIpcMessage = (event: WebviewDomEvent) => {
      if (!isResponsiveMode || event.channel !== IPC_CHANNEL_WHEEL_BOUNDARY) return;
      const payload = event.args?.[0] as { deltaX?: unknown; deltaY?: unknown } | undefined;
      const deltaX = wheelDelta(payload?.deltaX);
      const deltaY = wheelDelta(payload?.deltaY);
      if (deltaX === 0 && deltaY === 0) return;
      const canvas = browserRegionRef.current?.querySelector('[data-responsive-browser-mode="active"]');
      if (canvas) {
        canvas.scrollBy({ behavior: "auto", left: deltaX, top: deltaY });
        logger.debug("[browser-use] guest wheel 续接自由尺寸画布", {
          deltaX,
          deltaY,
          scrollLeft: canvas.scrollLeft,
          scrollTop: canvas.scrollTop,
        });
      }
    };
    webview.addEventListener("ipc-message", onIpcMessage);
    return () => webview.removeEventListener("ipc-message", onIpcMessage);
  }, [browserRegionRef, isResponsiveMode, webview]);
}

/** 原 dWt/fWt/pWt */
const DESKTOP_ZOOM_BASE = 1.1;
const DESKTOP_ZOOM_MIN_LEVEL = -3;
const DESKTOP_ZOOM_MAX_LEVEL = 5;

/** 原 mWt */
export function zoomFactorFromLevel(level: number): number {
  return Number.isFinite(level)
    ? DESKTOP_ZOOM_BASE ** +Math.min(DESKTOP_ZOOM_MAX_LEVEL, Math.max(DESKTOP_ZOOM_MIN_LEVEL, Math.round(level)))
    : 1;
}

/** 原 hWt */
export function useDesktopZoomFactor(): number {
  const platform = usePlatformService();
  const [level, setLevel] = React.useState(0);
  React.useEffect(() => {
    let disposed = false;
    const apply = (next: number) => {
      if (!disposed && Number.isFinite(next)) setLevel(next);
    };
    platform.getDesktopZoomLevel?.().then((result) => apply(result.zoomLevel));
    const unsubscribe = platform.onDesktopZoomLevelChanged?.((event) => {
      apply(event.zoomLevel);
    });
    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, [platform]);
  return zoomFactorFromLevel(level);
}

/* ============================================================================
 * 8. 响应式模式控制器（原 gWt，js 177644 / jsx 144000）
 * ==========================================================================*/

/** 原 gWt：模式开关 + viewport 双向同步（agent 侧变更不触发 resize 弱提示） */
export function useResponsiveModeController({
  browserKey,
  desktopZoomFactor,
  onAgentViewportChange,
  onViewportSynchronized,
  onViewportResize,
  sessionId,
}: {
  browserKey: string;
  desktopZoomFactor: number;
  onAgentViewportChange: (active: boolean) => void;
  onViewportSynchronized: () => void;
  onViewportResize: () => void;
  sessionId?: string;
}) {
  const platform = usePlatformService();
  const [isResponsiveMode, setIsResponsiveMode] = React.useState(false);
  const [responsiveViewportSize, setResponsiveViewportSize] = React.useState<ViewportSize>({ ...DEFAULT_VIEWPORT_SIZE });
  const [responsiveViewportZoom, setResponsiveViewportZoom] = React.useState("fit");
  const agentModeRef = React.useRef(false);
  const lastZoomFactorRef = React.useRef(desktopZoomFactor);
  const wasResponsiveRef = React.useRef(false);

  /** 原 _：agent 首次给 viewport 时回到 fit */
  const setAgentMode = React.useCallback((active: boolean) => {
    if (active && !agentModeRef.current) setResponsiveViewportZoom("fit");
    agentModeRef.current = active;
    setIsResponsiveMode(active);
  }, []);

  /** 原 v：viewport 同步到主进程；成功后回 zoom 复位 */
  const syncViewport = React.useCallback(
    (viewport: ViewportSize | null) => {
      const pending = platform.browserViewUpdateViewport?.({ tabId: browserKey, viewport });
      if (pending)
        pending
          .then(() => {
            if (viewport) onViewportSynchronized();
          })
          .catch((error) => {
            logger.debug("[browser-use] 同步 tab viewport 失败", {
              error: error instanceof Error ? error.message : String(error),
            });
          });
    },
    [browserKey, onViewportSynchronized, platform],
  );

  /* 桌面 zoom 变化且处于响应式→重新同步当前 viewport */
  React.useEffect(() => {
    const wasResponsive = wasResponsiveRef.current;
    const zoomChanged = lastZoomFactorRef.current !== desktopZoomFactor;
    wasResponsiveRef.current = isResponsiveMode;
    lastZoomFactorRef.current = desktopZoomFactor;
    if (isResponsiveMode && wasResponsive && zoomChanged) syncViewport(responsiveViewportSize);
  }, [desktopZoomFactor, isResponsiveMode, responsiveViewportSize, syncViewport]);

  /* agent 侧 viewport 变更（弱提示不触发） */
  React.useEffect(
    () =>
      platform.onBrowserViewViewportChanged?.((event) => {
        if (event.tabId !== browserKey || (sessionId && event.sessionId !== sessionId)) return;
        const modeChanged = (event.viewport !== null) !== agentModeRef.current;
        onAgentViewportChange(modeChanged);
        logger.debug("[browser-use] 模型 viewport 变更不触发 resize 弱提示", {
          modeChanged,
          tabId: browserKey,
          viewport: event.viewport,
        });
        if (event.viewport) {
          setResponsiveViewportSize({ ...event.viewport });
          setAgentMode(true);
          if (desktopZoomFactor > 1) syncViewport(event.viewport);
          return;
        }
        setAgentMode(false);
      }),
    [setAgentMode, browserKey, desktopZoomFactor, onAgentViewportChange, platform, sessionId, syncViewport],
  );

  return {
    isResponsiveMode,
    responsiveViewportSize,
    responsiveViewportZoom,
    setResponsiveViewportZoom,
    toggleResponsiveMode: React.useCallback(() => {
      onViewportResize();
      const next = !agentModeRef.current;
      setAgentMode(next);
      syncViewport(next ? responsiveViewportSize : null);
    }, [setAgentMode, onViewportResize, responsiveViewportSize, syncViewport]),
    updateResponsiveViewportSize: React.useCallback(
      (size: ViewportSize) => {
        setResponsiveViewportSize(size);
        syncViewport(size);
      },
      [syncViewport],
    ),
  };
}

/* ============================================================================
 * 9. BrowserView（原 _Wt，js 177724 / jsx 144066）
 * ==========================================================================*/

export interface BrowserViewProps {
  browserKey: string;
  isResidencyRestore?: boolean;
  isVisible: boolean;
  isSelected?: boolean;
  isCurrentTask?: boolean;
  initialUrl?: string | null;
  faviconUrl?: string;
  navigationRequest?: { id: string; url: string } | null;
  onUrlChange?: (url: string) => void;
  onPageMetadataChange?: (meta: { title?: string; faviconUrl?: string | null }) => void;
  onNavigationRequestHandled?: (id: string) => void;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  sessionId?: string;
  residencyGeneration?: number;
  browserUseOperationUntil?: number;
  browserResizeBaselineVersion?: number;
  screenshotSurfaceRequest?: ScreenshotSurfaceRequest | null;
}

/** 原 _Wt：内嵌浏览器根组件 */
export function BrowserView({
  browserKey,
  isResidencyRestore = false,
  isVisible,
  isSelected = isVisible,
  isCurrentTask = isSelected,
  initialUrl,
  faviconUrl,
  navigationRequest,
  onUrlChange,
  onPageMetadataChange,
  onNavigationRequestHandled,
  workspacePath,
  workspaceIdentity,
  remoteSessionId,
  sessionId,
  residencyGeneration,
  browserUseOperationUntil,
  browserResizeBaselineVersion,
  screenshotSurfaceRequest,
}: BrowserViewProps) {
  const platform = usePlatformService();
  const { intl } = useIntlContext();
  const desktopZoomFactor = useDesktopZoomFactor();
  const [addressValue, setAddressValue] = React.useState("");
  const [browserState, setBrowserState] = React.useState<BrowserNavigationState>(INITIAL_BROWSER_STATE);
  const [isResidencyRestorePending, setIsResidencyRestorePending] = React.useState(false);
  const [webviewGeneration, setWebviewGeneration] = React.useState(0);
  const [webview, setWebview] = React.useState<ElectronWebviewElement | null>(null);

  useScreenshotSurfaceStabilizer(screenshotSurfaceRequest ?? null, webview);
  const isScreenshotSurfacePreparing = !!screenshotSurfaceRequest;

  /** 原 P：zoom 同步（未就绪 webview 跳过） */
  const syncZoom = React.useCallback((target: ElectronWebviewElement, factor: number) => {
    if (typeof target.setZoomFactor === "function")
      safeWebviewCall(() => target.setZoomFactor(factor), void 0, (error) => {
        logger.debug("[browser-use] 跳过未就绪 webview 的 zoom 同步", {
          error: error instanceof Error ? error.message : String(error),
          targetZoomFactor: factor,
        });
      });
  }, []);

  /** 原 F */
  const resetZoomToUnity = React.useCallback(() => {
    if (webview) syncZoom(webview, 1);
  }, [syncZoom, webview]);

  const {
    browserRegionRef,
    notifyBrowserViewportResize,
    prepareForAgentViewportChange,
    showResizeWarning,
  } = useBrowserResizeWarning({
    browserKey,
    isVisible,
    operationUntil: browserUseOperationUntil,
    resizeBaselineVersion: browserResizeBaselineVersion,
  });

  const {
    isResponsiveMode,
    responsiveViewportSize,
    responsiveViewportZoom,
    setResponsiveViewportZoom,
    toggleResponsiveMode,
    updateResponsiveViewportSize,
  } = useResponsiveModeController({
    browserKey,
    desktopZoomFactor,
    onAgentViewportChange: prepareForAgentViewportChange,
    onViewportSynchronized: resetZoomToUnity,
    onViewportResize: notifyBrowserViewportResize,
    sessionId,
  });

  useGuestWheelCanvasScroll({ browserRegionRef, isResponsiveMode, webview });

  const pendingLoadUrlRef = React.useRef<string | null>(null);
  const requestedUrlRef = React.useRef<string | null>(null);
  const restoredUrlRef = React.useRef<string | null>(null);
  const handledNavigationRequestRef = React.useRef<string | null>(null);
  const lastRealUrlRef = React.useRef<string | null>(initialUrl && initialUrl !== "about:blank" ? initialUrl : null);
  const recoveringRef = React.useRef(false);
  const guestAttachRef = React.useRef<{ active: boolean; webContentsId: number } | null>(null);
  const wasResponsiveRef = React.useRef(false);
  const onPageMetadataChangeRef = React.useRef(onPageMetadataChange);
  onPageMetadataChangeRef.current = onPageMetadataChange;
  const onUrlChangeRef = React.useRef(onUrlChange);
  onUrlChangeRef.current = onUrlChange;

  /** 原 fe：上报 guest webContentsId（attach/detach + 作用域） */
  const reportGuestAttach = React.useCallback(
    (active: boolean) => {
      if (!webview || typeof webview.getWebContentsId !== "function") return;
      const webContentsId = safeWebviewCall(() => webview.getWebContentsId(), 0);
      if (webContentsId <= 0) return;
      const previous = guestAttachRef.current;
      if (previous?.webContentsId === webContentsId && previous.active === active) return;
      guestAttachRef.current = { active, webContentsId };
      const workspaceKey = workspaceIdentity?.trim() || workspacePath;
      platform
        .browserViewAttachGuest?.({
          key: browserKey,
          webContentsId,
          active,
          ...(workspaceKey ? { workspaceKey } : {}),
          ...(remoteSessionId ? { remoteSessionId } : {}),
          ...(sessionId ? { sessionId } : {}),
          ...(residencyGeneration === void 0 ? {} : { residencyGeneration }),
        })
        .catch((error) => {
          logger.debug("[browser-use] 上报 guest webContentsId 失败", {
            error: error instanceof Error ? error.message : String(error),
          });
        });
    },
    [browserKey, platform, remoteSessionId, residencyGeneration, sessionId, webview, workspaceIdentity, workspacePath],
  );

  const { cancelPicking, isPicking, togglePicking } = useWebElementPicker({
    executeJs: (code) => (webview ? webview.executeJavaScript(code, true) : Promise.resolve({ status: "cancelled" })),
    workspacePath: workspacePath ?? "",
    workspaceIdentity,
  });

  /** 原 he：从 webview 同步导航状态 */
  const syncStateFromWebview = React.useCallback((target: ElectronWebviewElement) => {
    const warnNotReady = (error: unknown) => {
      logger.debug("[browser-use] 跳过未就绪 webview 的状态同步", {
        error: error instanceof Error ? error.message : String(error),
      });
    };
    const url = safeWebviewCall(() => target.getURL(), "", warnNotReady) || "about:blank";
    const canGoBack = safeWebviewCall(() => target.canGoBack(), false, warnNotReady);
    const canGoForward = safeWebviewCall(() => target.canGoForward(), false, warnNotReady);
    const title = safeWebviewCall(() => target.getTitle(), "", warnNotReady);
    if (url !== "about:blank") lastRealUrlRef.current = url;
    setAddressValue(blankToEmpty(url));
    setBrowserState((prev) => ({ ...prev, canGoBack, canGoForward, currentUrl: url, isReady: true, title }));
    onPageMetadataChangeRef.current?.({ title: title || void 0 });
    if (url !== "about:blank") onUrlChangeRef.current?.(url);
  }, []);

  /* webview 事件全集 */
  React.useEffect(() => {
    if (!webview) return;
    const onDidAttach = () => {
      if (isResidencyRestore) webview.removeAttribute("src");
      reportGuestAttach(isSelected);
    };
    const onDomReady = () => {
      if (isResponsiveMode) syncZoom(webview, 1);
      reportGuestAttach(isSelected);
      const pending = pendingLoadUrlRef.current;
      if (pending) {
        pendingLoadUrlRef.current = null;
        setBrowserState((prev) => ({ ...prev, isReady: true }));
        webview.loadURL(pending).catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          if (message.includes("ERR_ABORTED")) return;
          setBrowserState((prev) => ({
            ...prev,
            errorMessage: intl.formatMessage({ id: "browser.loadFailed" }, { message }),
            isLoading: false,
          }));
        });
        return;
      }
      recoveringRef.current = false;
      syncStateFromWebview(webview);
    };
    const onDidStartLoading = () => {
      cancelPicking();
      setBrowserState((prev) => ({ ...prev, errorMessage: null, isLoading: true }));
    };
    const onDidStopLoading = () => {
      recoveringRef.current = false;
      setBrowserState((prev) => ({ ...prev, isLoading: false }));
      syncStateFromWebview(webview);
    };
    const onDidNavigate = () => {
      syncStateFromWebview(webview);
    };
    const onPageTitleUpdated = (event: WebviewDomEvent) => {
      setBrowserState((prev) => ({ ...prev, title: event.title ?? "" }));
      onPageMetadataChangeRef.current?.({ title: event.title || void 0 });
    };
    const onDidFailLoad = (event: WebviewDomEvent) => {
      if (!event.isMainFrame || event.errorCode === -3) return;
      logger.warn("[browser-use] 页面加载失败", {
        errorCode: event.errorCode,
        errorDescription: event.errorDescription,
        url: event.validatedURL,
      });
      setBrowserState((prev) => ({
        ...prev,
        currentUrl: event.validatedURL || prev.currentUrl,
        errorMessage: intl.formatMessage({ id: "browser.loadFailed" }, { message: event.errorDescription ?? "" }),
        isLoading: false,
      }));
      setAddressValue(blankToEmpty(event.validatedURL || safeWebviewCall(() => webview.getURL(), "") || "about:blank"));
      recoveringRef.current = false;
    };
    const onRenderProcessGone = (event: WebviewDomEvent) => {
      const { exitCode, reason } = event.details ?? { exitCode: void 0, reason: "" };
      if (!isRecoverableCrash(reason)) {
        logger.warn("[browser-use] guest renderer 异常退出且不可自动恢复", {
          browserKey,
          exitCode,
          reason,
        });
        setBrowserState((prev) => ({
          ...prev,
          errorMessage: intl.formatMessage({ id: "browser.loadFailed" }, { message: `renderer ${reason} (${exitCode})` }),
          isLoading: false,
          isReady: false,
        }));
        return;
      }
      if (recoveringRef.current) return;
      recoveringRef.current = true;
      const recoveryUrl = lastRealUrlRef.current;
      pendingLoadUrlRef.current = recoveryUrl;
      requestedUrlRef.current = null;
      restoredUrlRef.current = null;
      guestAttachRef.current = null;
      cancelPicking();
      logger.warn("[browser-use] guest renderer 异常退出，原位重建并恢复最近 URL", {
        browserKey,
        exitCode,
        reason,
        recoveryUrl,
      });
      setAddressValue(blankToEmpty(recoveryUrl ?? "about:blank"));
      setIsResidencyRestorePending(!!recoveryUrl);
      setBrowserState((prev) => ({
        ...prev,
        canGoBack: false,
        canGoForward: false,
        currentUrl: recoveryUrl ?? "about:blank",
        errorMessage: null,
        isLoading: !!recoveryUrl,
        isReady: false,
      }));
      setWebviewGeneration((generation) => generation + 1);
    };
    webview.addEventListener("did-attach", onDidAttach);
    webview.addEventListener("dom-ready", onDomReady);
    webview.addEventListener("did-start-loading", onDidStartLoading);
    webview.addEventListener("did-stop-loading", onDidStopLoading);
    webview.addEventListener("did-navigate", onDidNavigate);
    webview.addEventListener("did-navigate-in-page", onDidNavigate);
    webview.addEventListener("page-title-updated", onPageTitleUpdated);
    webview.addEventListener("did-fail-load", onDidFailLoad);
    webview.addEventListener("render-process-gone", onRenderProcessGone);
    return () => {
      webview.removeEventListener("did-attach", onDidAttach);
      webview.removeEventListener("dom-ready", onDomReady);
      webview.removeEventListener("did-start-loading", onDidStartLoading);
      webview.removeEventListener("did-stop-loading", onDidStopLoading);
      webview.removeEventListener("did-navigate", onDidNavigate);
      webview.removeEventListener("did-navigate-in-page", onDidNavigate);
      webview.removeEventListener("page-title-updated", onPageTitleUpdated);
      webview.removeEventListener("did-fail-load", onDidFailLoad);
      webview.removeEventListener("render-process-gone", onRenderProcessGone);
    };
  }, [browserKey, cancelPicking, intl, isResidencyRestore, isSelected, platform, reportGuestAttach, syncZoom, syncStateFromWebview, webview]);

  /* 桌面 zoom 变化：进入/退出响应式时同步 webview zoom */
  React.useEffect(() => {
    if (!webview) return;
    const was = wasResponsiveRef.current;
    wasResponsiveRef.current = isResponsiveMode;
    if (isResponsiveMode) syncZoom(webview, 1);
    else if (was) syncZoom(webview, desktopZoomFactor);
  }, [desktopZoomFactor, isResponsiveMode, syncZoom, webview]);

  React.useEffect(() => {
    reportGuestAttach(isSelected);
  }, [isSelected, reportGuestAttach]);

  /* residency 上报 */
  React.useEffect(() => {
    const workspaceKey = workspaceIdentity?.trim() || workspacePath;
    if (!workspaceKey || !sessionId) return;
    const restoreUrl =
      browserState.currentUrl && browserState.currentUrl !== "about:blank" ? browserState.currentUrl : (lastRealUrlRef.current ?? null);
    platform
      .browserViewReportResidency?.({
        tabId: browserKey,
        workspaceKey,
        ...(remoteSessionId ? { remoteSessionId } : {}),
        sessionId,
        selected: isSelected,
        visible: isVisible,
        currentTask: isCurrentTask,
        loading: browserState.isLoading,
        restoreUrl,
        title: browserState.title || null,
        ...(faviconUrl === void 0 ? {} : { faviconUrl }),
      })
      .catch((error) => {
        logger.debug("[browser-use] 上报 tab residency 失败", {
          error: error instanceof Error ? error.message : String(error),
          tabId: browserKey,
        });
      });
  }, [browserKey, browserState.currentUrl, browserState.isLoading, browserState.title, faviconUrl, isCurrentTask, isSelected, isVisible, platform, remoteSessionId, sessionId, workspaceIdentity, workspacePath]);

  /** 原 ge：地址归一 + 加载编排（未就绪→pendingLoad） */
  const navigate = React.useCallback(
    async (raw: string, _source: "toolbar" | "restore" | "request" = "toolbar") => {
      const normalized = normalizeAddress(raw);
      if (!normalized) {
        setBrowserState((prev) => ({ ...prev, errorMessage: intl.formatMessage({ id: "browser.invalidUrl" }) }));
        return;
      }
      if (normalized === requestedUrlRef.current && (pendingLoadUrlRef.current === normalized || browserState.isLoading)) {
        setAddressValue(blankToEmpty(normalized));
        setIsResidencyRestorePending(true);
        return;
      }
      setAddressValue(blankToEmpty(normalized));
      setIsResidencyRestorePending(true);
      lastRealUrlRef.current = normalized;
      onUrlChange?.(normalized);
      setBrowserState((prev) => ({ ...prev, errorMessage: null }));
      requestedUrlRef.current = normalized;
      if (!webview || !browserState.isReady) {
        pendingLoadUrlRef.current = normalized;
        return;
      }
      try {
        await webview.loadURL(normalized);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("ERR_ABORTED")) return;
        setBrowserState((prev) => ({
          ...prev,
          errorMessage: intl.formatMessage({ id: "browser.loadFailed" }, { message }),
          isLoading: false,
        }));
      }
    },
    [browserState.isLoading, browserState.isReady, intl, onUrlChange, webview],
  );

  /* initialUrl 恢复 */
  React.useEffect(() => {
    if (!initialUrl || initialUrl === "about:blank") return;
    lastRealUrlRef.current = initialUrl;
    if (restoredUrlRef.current !== initialUrl) {
      if (browserState.currentUrl === initialUrl) {
        restoredUrlRef.current = initialUrl;
        setIsResidencyRestorePending(true);
        setAddressValue(blankToEmpty(initialUrl));
        return;
      }
      restoredUrlRef.current = initialUrl;
      navigate(initialUrl, "restore");
    }
  }, [browserState.currentUrl, initialUrl, navigate]);

  /* 外部导航请求（主进程/agent） */
  React.useEffect(() => {
    if (navigationRequest && handledNavigationRequestRef.current !== navigationRequest.id) {
      handledNavigationRequestRef.current = navigationRequest.id;
      navigate(navigationRequest.url, "request").finally(() => {
        onNavigationRequestHandled?.(navigationRequest.id);
      });
    }
  }, [navigationRequest, onNavigationRequestHandled, navigate]);

  /** 原 _e：未就绪 webview 操作跳过 */
  const safeWebviewOp = React.useCallback((op: () => void) => {
    safeWebviewCall(() => {
      op();
    }, void 0, (error) => {
      logger.debug("[browser-use] 跳过未就绪 webview 的操作", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }, []);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      navigate(addressValue);
    },
    [addressValue, navigate],
  );
  const goBack = React.useCallback(() => {
    if (!webview || !browserState.canGoBack) return;
    safeWebviewOp(() => webview.goBack?.());
  }, [browserState.canGoBack, safeWebviewOp, webview]);
  const goForward = React.useCallback(() => {
    if (!webview || !browserState.canGoForward) return;
    safeWebviewOp(() => webview.goForward());
  }, [browserState.canGoForward, safeWebviewOp, webview]);
  const reload = React.useCallback(() => {
    if (!webview || !browserState.isReady) return;
    safeWebviewOp(() => webview.reload());
  }, [browserState.isReady, safeWebviewOp, webview]);
  const openDevTools = React.useCallback(() => {
    if (!webview || !browserState.isReady) return;
    safeWebviewOp(() => webview.openDevTools());
  }, [browserState.isReady, safeWebviewOp, webview]);
  const openExternal = React.useCallback(() => {
    if (!webview || !browserState.isReady) return;
    safeWebviewOp(() => {
      const url = webview.getURL();
      if (isHttpUrl(url)) platform.openExternal(url);
    });
  }, [browserState.isReady, platform, safeWebviewOp, webview]);
  const pickElement = React.useCallback(() => {
    if (!webview || !browserState.isReady) return;
    togglePicking().catch((error) => {
      setBrowserState((prev) => ({
        ...prev,
        errorMessage: intl.formatMessage(
          { id: "browser.elementPickerFailed" },
          { message: error instanceof Error ? error.message : String(error) },
        ),
      }));
    });
  }, [browserState.isReady, intl, togglePicking, webview]);
  const handleToggleResponsive = React.useCallback(() => {
    toggleResponsiveMode();
  }, [toggleResponsiveMode]);
  const handleViewportSizeChange = updateResponsiveViewportSize;
  const handleViewportSizeChangeWithWarning = React.useCallback(
    (size: ViewportSize) => {
      notifyBrowserViewportResize();
      updateResponsiveViewportSize(size);
    },
    [notifyBrowserViewportResize, updateResponsiveViewportSize],
  );

  /* webview ref 管理 + favicon 监听（原 ke） */
  const faviconListenerRef = React.useRef<{ node: ElectronWebviewElement; listener: (e: WebviewDomEvent) => void } | null>(null);
  const handleWebviewRef = React.useCallback((node: ElectronWebviewElement | null) => {
    const previous = faviconListenerRef.current;
    if (previous?.node !== node) {
      if (previous) {
        previous.node.removeEventListener("page-favicon-updated", previous.listener);
        faviconListenerRef.current = null;
      }
      if (node) {
        const listener = (event: WebviewDomEvent) => {
          onPageMetadataChangeRef.current?.({ faviconUrl: event.favicons?.[0] ?? null });
        };
        node.addEventListener("page-favicon-updated", listener);
        faviconListenerRef.current = { node, listener };
      }
      setWebview(node);
    }
  }, []);

  const isEmptyBrowserState = !isResidencyRestorePending && addressValue.trim() === "" && !browserState.isLoading && !browserState.errorMessage;

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        isVisible || isScreenshotSurfacePreparing ? "flex" : "hidden",
        "h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-background",
      )}
    >
      <BrowserToolbar
        addressValue={addressValue}
        browserState={browserState}
        formatMessage={intl.formatMessage}
        onAddressChange={setAddressValue}
        onGoBack={goBack}
        onGoForward={goForward}
        onOpenExternal={openExternal}
        onOpenDevTools={openDevTools}
        onPickElement={pickElement}
        onReload={reload}
        onToggleResponsiveMode={handleToggleResponsive}
        onSubmit={handleSubmit}
        isElementPickerActive={isPicking}
        isResponsiveMode={isResponsiveMode}
      />
      {isResponsiveMode ? (
        <ResponsiveToolbar
          onViewportSizeChange={handleViewportSizeChangeWithWarning}
          onZoomChange={setResponsiveViewportZoom}
          viewportSize={responsiveViewportSize}
          zoom={responsiveViewportZoom}
        />
      ) : null}
      <BrowserSurface
        browserRegionRef={browserRegionRef}
        browserState={browserState}
        desktopZoomFactor={desktopZoomFactor}
        isResidencyRestore={isResidencyRestore}
        formatMessage={intl.formatMessage}
        isEmptyBrowserState={isEmptyBrowserState}
        isComposed={isVisible || isScreenshotSurfacePreparing}
        isResponsiveMode={isResponsiveMode}
        onViewportResize={notifyBrowserViewportResize}
        onViewportSizeChange={handleViewportSizeChange}
        onWebviewRef={handleWebviewRef}
        showResizeWarning={showResizeWarning}
        webviewGeneration={webviewGeneration}
        viewportSize={responsiveViewportSize}
        viewportZoom={responsiveViewportZoom}
      />
    </div>
  );
}

/* ============================================================================
 * 10. BrowserUseView（原 vWt，js 178191 / jsx 144506）+ 截图请求钩子（SWt）
 * ==========================================================================*/

export interface BrowserUseTabDescriptor {
  id: string;
  tabId: string;
  residency?: "restoring" | "suspended" | "resident" | string;
  residencyGeneration?: number;
  faviconUrl?: string;
  sessionId?: string;
  browserUseOperationUntil?: number;
  browserUseResizeBaselineVersion?: number;
}

/** TabsContent（原 vC，Radix Tabs 封装） */

/** 原 vWt：browser-use 标签包装（forceMount + inert + 三态可见性） */
export function BrowserUseView({
  tab,
  isPanelVisible,
  isSelected,
  isCurrentTask,
  screenshotSurfaceRequest,
  initialUrl,
  workspacePath,
  workspaceIdentity,
  remoteSessionId,
  residencyGeneration,
  onUrlChange,
  onPageMetadataChange,
}: {
  tab: BrowserUseTabDescriptor;
  isPanelVisible: boolean;
  isSelected: boolean;
  isCurrentTask: boolean;
  screenshotSurfaceRequest: ScreenshotSurfaceRequest | null;
  initialUrl?: string | null;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  residencyGeneration?: number;
  onUrlChange?: (url: string) => void;
  onPageMetadataChange?: (meta: { title?: string; faviconUrl?: string | null }) => void;
}) {
  return (
    <TabsContent
      value={tab.id}
      {...({ forceMount: true } as unknown as Partial<React.ComponentProps<typeof TabsContent>>)} /* A0-D-Misc：bundle TabsContent 为 radix 原语带 forceMount，Settings.TabsContent 缺，已登记需要的 export */
      aria-hidden={!isSelected}
      inert={isSelected ? void 0 : true}
      data-browser-use-tab-id={tab.tabId}
      data-browser-screenshot-surface-state={screenshotSurfaceRequest ? "preparing" : void 0}
      className={cn(
        "h-full min-h-0 bg-background",
        isSelected
          ? "relative z-10 flex"
          : screenshotSurfaceRequest
            ? "pointer-events-none absolute inset-0 z-0 flex overflow-hidden"
            : "hidden",
      )}
    >
      <BrowserView
        browserKey={tab.tabId}
        isResidencyRestore={tab.residency === "restoring"}
        isVisible={isPanelVisible && isSelected}
        isSelected={isSelected}
        isCurrentTask={isCurrentTask}
        screenshotSurfaceRequest={screenshotSurfaceRequest}
        initialUrl={initialUrl}
        faviconUrl={tab.faviconUrl}
        workspacePath={workspacePath}
        workspaceIdentity={workspaceIdentity}
        remoteSessionId={remoteSessionId}
        sessionId={tab.sessionId}
        residencyGeneration={residencyGeneration}
        browserUseOperationUntil={tab.browserUseOperationUntil}
        browserResizeBaselineVersion={tab.browserUseResizeBaselineVersion}
        onUrlChange={onUrlChange}
        onPageMetadataChange={onPageMetadataChange}
      />
    </TabsContent>
  );
}

/** 原 yWt */
export function browserUseTabMatches(
  tab: { workspaceKey: string; sessionId: string; browserId: string; browserGeneration: number; tabId: string },
  request: { workspaceKey: string; sessionId: string; browserId: string; browserGeneration: number; tabId: string },
): boolean {
  return (
    tab.workspaceKey === request.workspaceKey &&
    tab.sessionId === request.sessionId &&
    tab.browserId === request.browserId &&
    tab.browserGeneration === request.browserGeneration &&
    tab.tabId === request.tabId
  );
}

/** 原 bWt */
export function screenshotRequestMatches(
  a: ScreenshotSurfaceRequest,
  b: ScreenshotSurfaceRequest,
): boolean {
  return (
    a.requestId === b.requestId &&
    a.workspaceKey === b.workspaceKey &&
    a.sessionId === b.sessionId &&
    a.browserId === b.browserId &&
    a.browserGeneration === b.browserGeneration &&
    a.tabId === b.tabId &&
    a.webContentsId === b.webContentsId
  );
}

/** 原 xWt */
export function findBrowserUseTab<T extends { type: string } & Parameters<typeof browserUseTabMatches>[0]>(
  tabs: T[],
  request: Parameters<typeof browserUseTabMatches>[1],
): T | undefined {
  return tabs.find((tab) => tab.type === "browser-use" && browserUseTabMatches(tab, request));
}

/** 原 SWt：订阅主进程截图 surface prepare/release（非本 renderer tab 忽略；新请求替换旧请求） */
export function useScreenshotSurfaceRequest(
  tabScope: { workspaceKey: string; sessionId: string; browserId: string; browserGeneration: number; tabId: string },
): ScreenshotSurfaceRequest | null {
  const platform = usePlatformService();
  const [request, setRequest] = React.useState<ScreenshotSurfaceRequest | null>(null);
  React.useEffect(() => {
    const unsubscribePrepare = platform.onBrowserViewScreenshotSurfacePrepare?.((incoming) => {
      if (!findBrowserUseTab([{ type: "browser-use", ...tabScope }], incoming)) {
        logger.debug("[browser-use] 忽略非当前 renderer tab 的截图 surface prepare", {
          requestId: incoming.requestId,
          tabId: incoming.tabId,
        });
        return;
      }
      setRequest((current) =>
        current && current.requestId !== incoming.requestId
          ? (logger.debug("[browser-use] 保留仍在准备中的截图 surface 请求", {
              requestId: current.requestId,
              tabId: current.tabId,
            }),
            current)
          : incoming,
      );
    });
    const unsubscribeRelease = platform.onBrowserViewScreenshotSurfaceRelease?.((incoming) => {
      setRequest((current) => (!current || !screenshotRequestMatches(current, incoming) ? current : null));
    });
    return () => {
      unsubscribePrepare?.();
      unsubscribeRelease?.();
    };
  }, [platform, tabScope]);
  return request;
}
