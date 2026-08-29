/* eslint-disable */
/**
 * ============================================================================
 * ProcessMonitor.tsx — ZCode 3.7.6 进程监控独立窗口（B5-11 · 逐字重建）
 * ============================================================================
 *
 * 原始 chunk（只读）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/process-monitor-DOlutpPR.js（180 行）
 * 对照文件（pretty 版，**行号主口径**）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/process-monitor-DOlutpPR.jsx（94 行）
 * 登记：COVERAGE-LEDGER §b「未重建 first-party（B4 队列）」第 4 件、§c.1 第 11 项；
 *       B5-FULL-DECODE-PLAN 批次 12（B5-11）第 3 件。
 *
 * 本 chunk 是独立 BrowserWindow 入口（渲染到 #root），自带 zh-CN/en-US 双语文案
 * （不走 IntlProvider 词典；词典 chunk 内的 `processMonitor.*` 前缀为同源副本），
 * 主题/字号/语言直接读 localStorage，与主窗口解耦。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号 = jsx 孪生文件行）
 * ----------------------------------------------------------------------------
 *  导入（jsx 1–5）：
 *   e（chunk-Cq_f4orQ 的 s 导出） → toEsmInterop（CJS→ESM 互操作）
 *   t（styles 的 J 导出 = Tie）   → watchUiFontSizeStorageChanges
 *   n（styles 的 K 导出 = mo）    → applyUiFontSizeCssVariable
 *   r（styles 的 q 导出 = po）    → readStoredUiFontSizePx
 *   i（imeComposition 的 P 导出） → reactDomClientModule（react-dom/client）
 *   a（react-BQLj9xdT 的 t 导出） → reactModuleFactory
 *   o（jsx-runtime 的 t 导出）    → jsxRuntimeModuleFactory
 *  模块内（jsx 行）：
 *   s (6)   → ReactInterop（React 命名空间）
 *   c (7)   → ReactDOMClient（createRoot 所在模块）
 *   l (8)   → jsxRuntime
 *   u (9)   → PROCESS_MONITOR_MESSAGES（zh-CN/en-US 文案表，9 键×2）
 *   d (31)  → resolveThemeDarkness（system/dark/zai-dark → dark|light）
 *   f (34)  → applyStoredThemeClasses（zcode-theme → dark/theme-zai-* class 三连）
 *   p (40)  → resolveStoredLocale（zcode-locale ?? zcode-locale-preference）
 *   m (43)  → countProcessTreeNodes（递归计数）
 *   h (46)  → PROCESS_GRID_TEMPLATE_COLUMNS = `minmax(180px, 1fr) 84px 84px 96px`
 *   g (47)  → formatMemoryMegabytes（KB→MB，≥100 取整）
 *   _ (52)  → ProcessTreeNodeRow（递归行组件）
 *   v (61)  → ProcessMonitorApp（根组件：1s 轮询 window.processMonitor）
 *   y (93)  → rootElement（#root）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk）
 * ----------------------------------------------------------------------------
 *  1. styles-CdEGpc2x.js：J/K/q = 字号存储监听/字号 CSS 变量写入/字号读取
 *     （styles js 1062/1058/1053，属 SettingsStore 域助手，见 stores-core.tsx §1）
 *  2. imeComposition-DEYFkwWm.js：P = react-dom/client 模块工厂
 *  3. window.processMonitor：宿主预加载桥（getProcessMetrics → 进程树快照）
 *
 * 把握度：全件高（94 行全量逐字转录；文案/类名/分支零改动）。
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/process-monitor/ProcessMonitor.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

import '../components/process-monitor/ProcessMonitor'; // 副作用转发（原文件无导出面）
