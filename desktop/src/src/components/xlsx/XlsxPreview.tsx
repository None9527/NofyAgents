// A0-S4-4c: 自 modules/XlsxPreview.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/xlsx/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * XlsxPreview.tsx — ZCode 自研 xlsx 预览渲染层（PreviewPane 包装族）
 *                  （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（融合 chunk，199,508 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
 * 对照文件（同一 chunk 的 pretty-print 版，行号双轨标注：js 行 / jsx 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx
 * 同族文件：
 *   XlsxPreviewWasmBridge.tsx —— duke-sheets wasm 宿主 / xlsx-worker 桥
 *   XlsxPreview.report.md     —— 边界判定 / 拆法 / 占比 / 把握度
 *
 * ----------------------------------------------------------------------------
 * 〇、本模块在融合 chunk 中的位置
 * ----------------------------------------------------------------------------
 * 自研层 = 该 chunk 末尾 js 199415-199508 / jsx 49643-49724，共 4 个符号 +
 * 1 条导出；其余 199,414 行全部为 vendored 库段（d3/topojson 片段、regl、
 * react-xlsx 引擎，含内嵌地图数据），登记见报告 §1。
 * 判定依据：全 chunk 仅此处出现中文字符串（2 条 [PreviewPane] 日志）、
 * useIntlContext 调用、tailwind 设计令牌类名与 data-office-preview-* 属性。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  自研组件族（本文件全量重建）：
 *   uy  → resolveSheetTabTargetIndex  工作表页签键盘导航目标索引 (199415 / 49643)
 *   dy  → SheetTabBar                 工作表页签条（role=tablist） (199428 / 49650)
 *   fy  → XlsxParseErrorState         解析失败态（role=alert + error 日志） (199470 / 49679)
 *   py  → PreviewPaneOfficeXlsxContent 预览面板主组件（chunk 唯一导出） (199478 / 49691)
 *
 *  vendored react-xlsx 接触面（接口级登记，不逐行还原）：
 *   ly  → Spreadsheet                 react-xlsx 顶层组件（控制器注入三分支） (199406 / 49630)
 *   cy  → SpreadsheetWithOwnedController 自建控制器变体 (199402 / 49623)
 *   sy  → SpreadsheetViewer           react-xlsx-viewer 呈现壳 (199292 / 49527)
 *   Ru  → useSpreadsheetController    控制器 hook（file→worker→模型/页签） (15672 / 11907)
 *   rg  → SpreadsheetControllerContext 控制器上下文 (190102 / —)
 *   ig  → SpreadsheetHeaderThemeContext 头部主题上下文 {isDark} (190103 / —)
 *   Dl  → XlsxFileSizeLimitExceededError 文件超限错误 (14726 / —)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母。
 *     A0-S2b：2–5 已接线为真实 import）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *                                    （chunk 内别名 G / K；本文件用 react 包直连）
 *  2. useIntlContext (r)             〔已接线 → useZCodeIntl @ ./I18n〕
 *  3. logger (a)                     〔已接线 → t as logger @ ./logger〕
 *  4. cn() 类名合并 (s)              〔已接线 → cn @ ./UtilsCn〕
 *  5. react-xlsx Spreadsheet (ly)    〔已接线 → Spreadsheet @ ./XlsxDeepT（补导出）〕
 * 调用方（上游）：styles-CdEGpc2x.js 160608-160619 处
 *   `yVt = React.lazy(() => import('./previewPaneOfficeXlsxContent-XeHwYdMn.js')
 *      .then(m => m.PreviewPaneOfficeXlsxContent))`，
 *   由 office 文件类型路由（officeFilePreview-DDCn9-xI.js：.xlsx/.xlsm/.xls →
 *   'excel'）分派；文件字节经该路由的 base64→ArrayBuffer 助手（导出 n）解码。
 * i18n 键：codeViewer.excel.sheetTabs = “工作表”
 *   （zcode/packages/ui/src/i18n/zh-CN.json:1206）
 * ============================================================================
 */

import * as React from "react";

/* ============================================================================
 * 0. 外部依赖（A0-S2b 已接线：原 declare 改真实 import）
 * ==========================================================================*/

/** 类名合并（原 s，utils-CEEH0K_K.js 导出 t） */
import { cn } from "../../modules/UtilsCn";
/** intl 上下文钩子（原 r，IntlProvider-C321H7m8.js 导出 n；调用点原 useIntlContext） */
import { useZCodeIntl } from "../../modules/I18n";
/** 日志器（原 a，logger-PFDwl5Yq.js 导出 t） */
import { t as logger } from "../../modules/logger";

/* --- vendored react-xlsx 接触面（原 ly/sy/cy/Ru/rg/ig/Dl；接口级登记） --- */

/** 工作表页签模型（控制器 tabs 数组项；dy 消费 id/name 两个字段） */
export interface SpreadsheetSheetTab {
  /** 稳定键（渲染 key） */
  id: string;
  /** 页签显示名（工作表名） */
  name: string;
}

/** SheetTabBar 消费到的控制器切面（原 dy 对控制器仅解构这三个字段） */
export interface SheetTabBarController {
  activeTabIndex: number;
  setActiveTabIndex(index: number): void;
  tabs: SpreadsheetSheetTab[];
}

/** react-xlsx 错误（原 Dl 一族；fy 仅消费 message） */
export interface XlsxError extends Error {
  /** XlsxFileSizeLimitExceededError 时携带（原 Dl 的字段） */
  fileSizeBytes?: number;
  maxFileSizeBytes?: number;
}

/**
 * react-xlsx 顶层组件 props（原 ly 的入参 = cy→Ru 的控制器入参 ∪ sy 的呈现入参）。
 * 自研层实际使用的字段见 PreviewPaneOfficeXlsxContentProps 的用法；
 * 其余字段按 sy(199292)/Ru(15672) 的解构登记，供后续抽取参考。
 */
export interface SpreadsheetProps {
  /* — 控制器入参（原 Ru 解构，js 15672-15685） — */
  /** 文件字节（ArrayBuffer；与 src 二选一） */
  file?: ArrayBuffer;
  /** 远端文件 URL（与 file 二选一） */
  src?: string;
  /** 显示文件名（缺省时由 Ol() 从 src 推导） */
  fileName?: string;
  /** 只读（自研预览恒 true） */
  readOnly?: boolean;
  /** 只读模式下允许调整行列尺寸 */
  allowResizeInReadOnly?: boolean;
  /** 超过该字节数转为只读（0=关闭） */
  readOnlyAboveBytes?: number;
  /** 超过该字节数延迟加载（默认 cl，react-xlsx 内部常量） */
  deferLoadingAboveBytes?: number;
  /** 文件大小上限（默认 sl，超限抛 XlsxFileSizeLimitExceededError） */
  maxFileSizeBytes?: number;
  /** 显示隐藏工作表 */
  showHiddenSheets?: boolean;
  /** 跳过 OOXML 附加解析（只要单元格数据） */
  skipXmlParsing?: boolean;
  /** 是否启用 worker 解析（默认 true；需 Worker 可用且 wasm 源就绪） */
  useWorker?: boolean;

  /* — 呈现入参（原 sy 解构，js 199292-199324） — */
  className?: string;
  controller?: unknown; // 外部注入控制器（原 rg 上下文同源）
  height?: string | number;
  isDark?: boolean;
  rounded?: boolean;
  showDefaultToolbar?: boolean;
  showImages?: boolean;
  experimentalCanvas?: boolean;
  enableCanvasSelectionAnimation?: boolean;
  enableGestureZoom?: boolean;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorState?: (error: XlsxError) => React.ReactNode;
  fileTooLargeState?: (info: {
    displayFileName: string;
    fileSizeBytes?: number;
    maxFileSizeBytes?: number;
  }) => React.ReactNode;
  /** 工具栏渲染函数：接收控制器 */
  toolbar?: (controller: SheetTabBarController) => React.ReactNode;
  getCellStyle?: unknown;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  selectionColor?: string;
  selectionFillColor?: string;
  selectionHeaderColor?: string;
  onFormControlAction?: unknown;
  onFormControlChange?: unknown;
  renderChartLoading?: unknown;
  renderFormControl?: unknown;
  renderImage?: unknown;
  renderImageSelection?: unknown;
  renderScroller?: unknown;
  renderTableHeaderMenu?: unknown;
}

/**
 * react-xlsx 顶层组件（原 ly，js 199406 / jsx 49630）。
 * 控制器三分支：props.controller → 用之；否则 rg 上下文 → 用之；
 * 否则 cy 自建（Ru hook + xlsx-worker + duke-sheets wasm，
 * 见 XlsxPreviewWasmBridge.tsx）。
 * A0-S2b 已接线：实体 = XlsxDeepT.tsx 的 Spreadsheet（补导出）；
 * 导入侧按本文件 SpreadsheetProps 口径标注（实体形参为 any，不改发射语义）。
 */
import { Spreadsheet as SpreadsheetImpl } from "../../modules/XlsxDeepT";
const Spreadsheet = SpreadsheetImpl as React.FC<SpreadsheetProps>; // 原 ly

/* ============================================================================
 * 1. resolveSheetTabTargetIndex（原 uy，js 199415-199427 / jsx 49643-49649）
 * ----------------------------------------------------------------------------
 * 页签条键盘导航：Home→首、End→尾、←/→ 循环移动；其余键返回 null（不拦截）。
 * ==========================================================================*/

export function resolveSheetTabTargetIndex({
  currentIndex,
  key,
  tabCount,
}: {
  currentIndex: number;
  key: string;
  tabCount: number;
}): number | null {
  return tabCount < 1
    ? null
    : key === "Home"
      ? 0
      : key === "End"
        ? tabCount - 1
        : key === "ArrowLeft"
          ? (currentIndex - 1 + tabCount) % tabCount
          : key === "ArrowRight"
            ? (currentIndex + 1) % tabCount
            : null;
}

/* ============================================================================
 * 2. SheetTabBar（原 dy，js 199428-199469 / jsx 49650-49678）
 * ----------------------------------------------------------------------------
 * 自研工作表页签条，作为 react-xlsx 的 toolbar 渲染函数注入：
 *  - 单表（tabs.length <= 1）不渲染；
 *  - role=tablist / role=tab + aria-selected + roving tabindex（激活项 0，余 -1）；
 *  - 点击切表：setActiveTabIndex + [PreviewPane] debug 日志（中文，含表名）；
 *  - 键盘：Home/End/←/→（循环），命中即 preventDefault 并把焦点移到目标页签
 *    （querySelectorAll('[role="tab"]').item(n).focus()）。
 * 样式：容器 `flex min-h-0 shrink-0 gap-1 overflow-x-auto border-b border-border
 *   bg-surface px-2 py-1`；页签 `h-7 max-w-48 shrink-0 truncate rounded-md px-2
 *   text-ui-sm transition-colors` + 激活 `bg-selected text-foreground` /
 *   非激活 `text-foreground-subtle hover:bg-hover hover:text-foreground`。
 * ==========================================================================*/

interface SheetTabBarProps {
  controller: SheetTabBarController;
  /** tablist 的 aria-label（i18n：codeViewer.excel.sheetTabs = “工作表”） */
  label: string;
}

export function SheetTabBar({ controller, label }: SheetTabBarProps) {
  const { activeTabIndex, setActiveTabIndex, tabs } = controller;
  if (tabs.length <= 1) return null;

  const switchToTab = (index: number) => {
    setActiveTabIndex(index);
    logger.debug("[PreviewPane] Excel 工作表已切换", {
      sheetIndex: index,
      sheetName: tabs[index]?.name,
    });
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const targetIndex = resolveSheetTabTargetIndex({
      currentIndex,
      key: event.key,
      tabCount: tabs.length,
    });
    if (targetIndex !== null) {
      event.preventDefault();
      switchToTab(targetIndex);
      // 原实现：`.item(n).focus()`（Element 无 focus 类型，此处断言为 HTMLElement）
      const targetTab = event.currentTarget.parentElement
        ?.querySelectorAll('[role="tab"]')
        ?.item(targetIndex) as HTMLElement | null | undefined;
      targetTab?.focus();
    }
  };

  return (
    <div
      aria-label={label}
      className="flex min-h-0 shrink-0 gap-1 overflow-x-auto border-b border-border bg-surface px-2 py-1"
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const isActive = index === activeTabIndex;
        return (
          <button
            aria-selected={isActive}
            className={cn(
              "h-7 max-w-48 shrink-0 truncate rounded-md px-2 text-ui-sm transition-colors",
              isActive
                ? "bg-selected text-foreground"
                : "text-foreground-subtle hover:bg-hover hover:text-foreground",
            )}
            onClick={() => switchToTab(index)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            title={tab.name}
            type="button"
            key={tab.id}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
 * 3. XlsxParseErrorState（原 fy，js 199470-199477 / jsx 49679-49690）
 * ----------------------------------------------------------------------------
 * 解析失败态：挂载/错误变化时打 [PreviewPane] error 日志（路径+错误消息），
 * 呈现为 role=alert 的破坏色文本。
 * ==========================================================================*/

interface XlsxParseErrorStateProps {
  error: XlsxError;
  /** 统一错误文案（来自 PreviewPaneOfficeXlsxContent 的 errorMessage prop） */
  message: string;
  sourcePath: string;
}

export function XlsxParseErrorState({ error, message, sourcePath }: XlsxParseErrorStateProps) {
  React.useEffect(() => {
    logger.error("[PreviewPane] Excel 文件解析失败", { path: sourcePath, error: error.message });
  }, [error, sourcePath]);

  return (
    <div className="p-3 text-sm text-destructive" role="alert">
      {message}
    </div>
  );
}

/* ============================================================================
 * 4. PreviewPaneOfficeXlsxContent（原 py，js 199478-199507 / jsx 49691-49723）
 * ----------------------------------------------------------------------------
 * chunk 唯一导出；预览面板的 Excel 分支主组件。
 * 结构：外壳 `h-full min-h-0 w-full min-w-0 overflow-hidden bg-background` +
 *   `data-office-preview-kind="excel"`，内嵌 vendored react-xlsx Spreadsheet：
 *  - readOnly 恒真、rounded=0、showDefaultToolbar=false（自研页签条替代默认工具栏）；
 *  - toolbar = useCallback 包裹的 SheetTabBar（依赖仅 i18n 文案）；
 *  - loadingState = aria-busy 空占位（`data-office-preview-pending` 供 e2e 探针）；
 *  - errorState / fileTooLargeState 统一走传入的 errorMessage 文案。
 * ==========================================================================*/

export interface PreviewPaneOfficeXlsxContentProps {
  /** xlsx 文件字节（ArrayBuffer；上游路由 base64→ArrayBuffer 后传入） */
  buffer: ArrayBuffer;
  /** 解析失败/超限统一文案 */
  errorMessage: string;
  /** 暗色主题（跟随应用主题传入 react-xlsx 调色） */
  isDark: boolean;
  /** 文件路径（fileName + 日志用） */
  sourcePath: string;
}

export function PreviewPaneOfficeXlsxContent({
  buffer,
  errorMessage,
  isDark,
  sourcePath,
}: PreviewPaneOfficeXlsxContentProps) {
  const { intl } = useZCodeIntl(); // 原 useIntlContext（r()）
  const sheetTabsLabel = intl.formatMessage({ id: "codeViewer.excel.sheetTabs" });

  return (
    <div className="h-full min-h-0 w-full min-w-0 overflow-hidden bg-background" data-office-preview-kind="excel">
      <Spreadsheet
        file={buffer}
        fileName={sourcePath}
        height="100%"
        isDark={isDark}
        readOnly
        rounded={false}
        showDefaultToolbar={false}
        toolbar={React.useCallback(
          (controller: SheetTabBarController) => <SheetTabBar controller={controller} label={sheetTabsLabel} />,
          [sheetTabsLabel],
        )}
        loadingState={
          <div aria-busy="true" className="h-full min-h-0 w-full bg-background" data-office-preview-pending />
        }
        errorState={(error) => <XlsxParseErrorState error={error} message={errorMessage} sourcePath={sourcePath} />}
        fileTooLargeState={() => (
          <div className="p-3 text-sm text-destructive" role="alert">
            {errorMessage}
          </div>
        )}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: 原名(minified) -> 语义名 -> js 行 / jsx 行
 * ════════════════════════════════════════════════════════════════════════
 * 自研符号（4 + 1 导出）：
 *   uy -> resolveSheetTabTargetIndex     199415-199427 / 49643-49649
 *   dy -> SheetTabBar                    199428-199469 / 49650-49678
 *   fy -> XlsxParseErrorState            199470-199477 / 49679-49690
 *   py -> PreviewPaneOfficeXlsxContent   199478-199507 / 49691-49723
 *   export { py as PreviewPaneOfficeXlsxContent }        199508 / 49724
 * vendored 接触面（接口级登记，行号见头注释）：
 *   ly -> Spreadsheet                    199406-199413 / 49630-49641
 *   cy -> SpreadsheetWithOwnedController 199402-199405 / 49623-49629
 *   sy -> SpreadsheetViewer              199292-199401 / 49527-49622
 *   Ru -> useSpreadsheetController       15672-17817  / 11907-13483
 *   rg -> SpreadsheetControllerContext   190102
 *   ig -> SpreadsheetHeaderThemeContext  190103
 *   Dl -> XlsxFileSizeLimitExceededError 14726-14735
 * ════════════════════════════════════════════════════════════════════════ */
