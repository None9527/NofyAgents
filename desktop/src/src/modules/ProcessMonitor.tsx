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

import * as React from "react";
import * as ReactDOMClient from 'react-dom/client'; // 原 i（imeComposition 的 P 导出）：react-dom/client 模块（A0-D-Misc 接线）

/* ============================================================================
 * 0. 外部依赖接口（跨 chunk，declare 挂接）
 * ==========================================================================*/

/** 原 t（styles 的 J 导出 = Tie，styles js 1062）：监听 storage 事件中
 *  `zcode-ui-font-size-px` 的变化并写 `--ui-font-size`；返回卸载函数。 */
declare function watchUiFontSizeStorageChanges(): () => void;

/** 原 n（styles 的 K 导出 = mo，styles js 1058）：把字号 clamp 12–20 后写
 *  `document.documentElement.style` 的 `--ui-font-size`。 */
declare function applyUiFontSizeCssVariable(fontSizePx: number): void;

/** 原 r（styles 的 q 导出 = po，styles js 1053）：读 `zcode-ui-font-size-px`
 *  （缺省 14，clamp 12–20）。 */
declare function readStoredUiFontSizePx(): number;



/** 宿主进程监控桥（preload 注入；不可用时为 undefined）。 */
interface ProcessTreeNode {
  name: string;
  pid: number;
  cpu: number;
  /** 单位 KB（formatMemoryMegabytes 内 ÷1024 转 MB）。 */
  memory: number;
  children: ProcessTreeNode[];
}

declare global {
  interface Window {
    processMonitor?: {
      getProcessMetrics(): Promise<ProcessTreeNode | null>;
    };
  }
}

/* ============================================================================
 * 1. 文案表（原 u，jsx 9–30）——zh-CN/en-US 逐字
 * ==========================================================================*/

interface ProcessMonitorMessages {
  title: string;
  process: string;
  pid: string;
  cpu: string;
  memory: string;
  processCount: (count: number) => string;
  loading: string;
  unavailable: string;
}

const PROCESS_MONITOR_MESSAGES: Record<"zh-CN" | "en-US", ProcessMonitorMessages> = {
  "zh-CN": {
    title: `进程监控`,
    process: `进程`,
    pid: `PID`,
    cpu: `CPU`,
    memory: `内存`,
    processCount: (count) => `${count} 个进程`,
    loading: `正在读取进程指标...`,
    unavailable: `进程监控接口不可用`,
  },
  "en-US": {
    title: `Process Monitor`,
    process: `Process`,
    pid: `PID`,
    cpu: `CPU`,
    memory: `Memory`,
    processCount: (count) => `${count} processes`,
    loading: `Reading process metrics...`,
    unavailable: `Process monitor bridge is unavailable`,
  },
};

/* ============================================================================
 * 2. 主题/语言引导（原 d/f/p，jsx 31–42）——独立窗口直读 localStorage
 * ==========================================================================*/

/** 原 d（jsx 31）：主题取值 → dark|light（system 看系统偏好）。 */
function resolveThemeDarkness(theme: string): "dark" | "light" {
  return theme === `system`
    ? window.matchMedia(`(prefers-color-scheme: dark)`).matches
      ? `dark`
      : `light`
    : theme === `dark` || theme === `zai-dark`
      ? `dark`
      : `light`;
}

/** 原 f（jsx 34）：按 `zcode-theme`（缺省 `zai-dark`）切换根元素 class。 */
function applyStoredThemeClasses(): void {
  const theme = localStorage.getItem(`zcode-theme`) ?? `zai-dark`;
  const darkness = resolveThemeDarkness(theme);
  const resolved =
    theme === `system`
      ? darkness === `dark`
        ? `zai-dark`
        : `zai-light`
      : theme === `dark`
        ? `zai-dark`
        : theme === `light`
          ? `zai-light`
          : theme;
  document.documentElement.classList.toggle(`dark`, darkness === `dark`),
    document.documentElement.classList.toggle(`theme-zai-light`, resolved === `zai-light`),
    document.documentElement.classList.toggle(`theme-zai-dark`, resolved === `zai-dark`);
}

/** 原 p（jsx 40）：语言判定（`zcode-locale` 优先，回退 `zcode-locale-preference`）。 */
function resolveStoredLocale(): "zh-CN" | "en-US" {
  return (localStorage.getItem(`zcode-locale`) ??
    localStorage.getItem(`zcode-locale-preference`)) === `en-US`
    ? `en-US`
    : `zh-CN`;
}

/* ============================================================================
 * 3. 进程树助手（原 m/h/g，jsx 43–50）
 * ==========================================================================*/

/** 原 m（jsx 43）：递归统计进程总数。 */
function countProcessTreeNodes(node: ProcessTreeNode | null): number {
  return node ? 1 + node.children.reduce((sum, child) => sum + countProcessTreeNodes(child), 0) : 0;
}

/** 原 h（jsx 46）：四列网格模板（进程名/PID/CPU/内存）。 */
const PROCESS_GRID_TEMPLATE_COLUMNS = `minmax(180px, 1fr) 84px 84px 96px`;

/** 原 g（jsx 47）：KB → `N MB`（≥100MB 不保留小数）。 */
function formatMemoryMegabytes(memoryKb: number): string {
  if (!Number.isFinite(memoryKb) || memoryKb <= 0) return `0 MB`;
  const megabytes = memoryKb / 1024;
  return `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} MB`;
}

/* ============================================================================
 * 4. ProcessTreeNodeRow（原 _，jsx 52–59）——递归行
 * ==========================================================================*/

function ProcessTreeNodeRow({ node, depth }: { node: ProcessTreeNode; depth: number }) {
  return (
    <>
      <div
        className="grid min-h-8 items-center border-b border-border px-4 text-ui-xs last:border-b-0"
        style={{ gridTemplateColumns: PROCESS_GRID_TEMPLATE_COLUMNS, paddingLeft: 16 + depth * 18 }}
      >
        <div className="min-w-0 truncate font-medium text-foreground" title={node.name}>
          {node.name}
        </div>
        <div className="font-mono text-ui-xs text-foreground-subtle">{node.pid}</div>
        <div className="font-mono text-ui-xs text-foreground-subtle">{node.cpu.toFixed(1)}{`%`}</div>
        <div className="font-mono text-ui-xs text-foreground-subtle">{formatMemoryMegabytes(node.memory)}</div>
      </div>
      {node.children.map((child) => (
        <ProcessTreeNodeRow key={`${child.pid}-${child.name}`} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

/* ============================================================================
 * 5. ProcessMonitorApp（原 v，jsx 61–91）——根组件（1s 轮询）
 * ==========================================================================*/

function ProcessMonitorApp() {
  const messages = PROCESS_MONITOR_MESSAGES[React.useMemo(resolveStoredLocale, [])];
  const [rootNode, setRootNode] = React.useState<ProcessTreeNode | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  React.useEffect(() => watchUiFontSizeStorageChanges(), []),
    React.useEffect(() => {
      let cancelled = false;
      async function poll() {
        try {
          const metrics = await window.processMonitor?.getProcessMetrics();
          if (cancelled) return;
          if (!metrics) {
            setErrorMessage(messages.unavailable);
            return;
          }
          setRootNode(metrics), setErrorMessage(null);
        } catch (error) {
          if (cancelled) return;
          setErrorMessage(error instanceof Error ? error.message : String(error));
        }
      }
      poll();
      const timer = window.setInterval(() => void poll(), 1e3);
      return () => {
        cancelled = true, window.clearInterval(timer);
      };
    }, [messages.unavailable]);
  const processCount = countProcessTreeNodes(rootNode);
  return (
    <main className="flex h-dvh min-h-0 flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-header px-4">
        <div className="min-w-0">
          <h1 className="truncate text-ui-xs font-medium">{messages.title}</h1>
          <div className="text-ui-xs text-foreground-subtle">
            {rootNode ? messages.processCount(processCount) : messages.loading}
          </div>
        </div>
      </header>
      <section className="min-h-0 flex-1 overflow-auto bg-background-alt">
        <div
          className="sticky top-0 z-10 grid h-8 items-center border-b border-border bg-panel px-4 text-ui-xs font-medium text-foreground-subtle"
          style={{ gridTemplateColumns: PROCESS_GRID_TEMPLATE_COLUMNS }}
        >
          <div>{messages.process}</div>
          <div>{messages.pid}</div>
          <div>{messages.cpu}</div>
          <div>{messages.memory}</div>
        </div>
        {errorMessage ? (
          <div className="m-4 rounded-lg border border-destructive/30 bg-card px-4 py-3 text-ui-xs text-destructive">
            {errorMessage}
          </div>
        ) : rootNode ? (
          <div className="bg-background">
            <ProcessTreeNodeRow node={rootNode} depth={0} />
          </div>
        ) : (
          <div className="px-4 py-3 text-ui-xs text-foreground-subtle">{messages.loading}</div>
        )}
      </section>
    </main>
  );
}

/* ============================================================================
 * 6. 引导（原 jsx 92–94）：主题 class + 字号变量 → #root 挂载
 * ==========================================================================*/

applyStoredThemeClasses(), applyUiFontSizeCssVariable(readStoredUiFontSizePx());
const rootElement = document.getElementById(`root`);
rootElement && ReactDOMClient.createRoot(rootElement).render(<ProcessMonitorApp />);

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → jsx 行；全 15 个模块内符号 + 7 导入）
 * ============================================================================
 *  导入：e=toEsmInterop(1) | t=watchUiFontSizeStorageChanges(2) | n=applyUiFontSizeCssVariable(2)
 *   r=readStoredUiFontSizePx(2) | i=reactDomClientModule(3) | a=reactModuleFactory(4)
 *   o=jsxRuntimeModuleFactory(5)
 *  模块内：s=ReactInterop(6) | c=ReactDOMClient(7) | l=jsxRuntime(8)
 *   u=PROCESS_MONITOR_MESSAGES(9) | d=resolveThemeDarkness(31) | f=applyStoredThemeClasses(34)
 *   p=resolveStoredLocale(40) | m=countProcessTreeNodes(43) | h=PROCESS_GRID_TEMPLATE_COLUMNS(46)
 *   g=formatMemoryMegabytes(47) | _=ProcessTreeNodeRow(52) | v=ProcessMonitorApp(61)
 *   y=rootElement(93)
 *  导出：无（独立窗口入口 chunk，无 export 语句）
 * ============================================================================
 */
