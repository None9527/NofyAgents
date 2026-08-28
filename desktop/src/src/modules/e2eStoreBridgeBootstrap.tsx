/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · first-party renderer chunk 完整解混淆
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/e2eStoreBridgeBootstrap-DOKuAE2h.js（9 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     : LLM 语义重命名（无 JSX，故 JSX 还原不适用）
 *    · 依据：导出名 `registerE2EStoreBridges` 已自带语义；
 *      四个 window 挂载点名称（__zcodeSessionStoreE2E / __skillStoreE2E /
 *      __subagentsStoreE2E / __whiteboardStoreE2E）直接给出 store 身份；
 *    · 依赖侧五个导入（skillStore chunk 的 K/h/o/r/t 导出）经其导出表
 *      逐一映射到内部名，再对照 skillStore-BmeKHDBI.jsx 中的 zustand
 *      store 定义（state 字段：workspaces+getWorkspaceState / createBoard /
 *      agents[]+subagentsService / skills[]+skillsService）确认身份。
 *    · 唯一消费者：入口 chunk index-ABImDspU.js（在
 *      VITE_ZCODE_E2E_STORE_BRIDGE === '1' 时动态 import 并调用本函数）。
 *
 *  行为等价声明：本文件与原始 chunk 运行时行为逐字等价——
 *    1) 门控 `isE2EStoreBridgeEnabled()` 短路逻辑不变（原码用逗号表达式
 *       `e() && ((a), (b), (c), (d))`，恢复版改写为 if 语句；二者均只在
 *       门控为真时执行挂载，表达式返回值均被丢弃，无可观察差异）；
 *    2) 四个 window 属性名、挂载值（zustand store hook 本体）逐一不变。
 * ════════════════════════════════════════════════════════════════════════════
 */

// ─── 依赖：./skillStore-BmeKHDBI.js 的 5 个导出 ───
// 原 chunk 导入：import { K as e, h as t, o as n, r, t as i } from "./skillStore-BmeKHDBI.js"
// skillStore chunk 导出表（尾部）给出：K=v, h=yn, o=In, r=Gn, t=Yn。
// 各内部名在 skillStore-BmeKHDBI.jsx 中的定义与身份核对：
//   v  (行 50)   : function v(e = ee()) { return typeof window !== 'undefined'
//                  && e.VITE_ZCODE_E2E_STORE_BRIDGE === '1' }      → 门控函数
//   yn (行 1794) : zustand store，state 含 workspaces / getWorkspaceState → 会话 store
//   Yn (行 2387) : zustand store，state 含 skills[] / initialize 报
//                  'skillsService is required'                     → 技能 store
//   Gn (行 2161) : zustand store，state 含 agents[] / initialize 报
//                  'subagentsService is required'                  → 子代理 store
//   In (行 1923) : zustand store，state 含 createBoard / defaultNamePrefix → 白板 store
// @ts-expect-error 原始构建产物为 minified JS、无类型声明；类型契约由下方 cast 约束
import { K, h, o, r, t } from '../../out/renderer/assets/skillStore-BmeKHDBI.js';

/* ─────────────────────────── 类型声明（推断） ─────────────────────────── */

/**
 * 构建期注入的 Vite 环境变量（原码内联了 import.meta.env 的产物快照）。
 * 把握度高：字段与入口/日志等 chunk 中反复出现的同一对象逐字一致。
 */
export interface ZCodeRendererEnv {
  BASE_URL: string;
  DEV: boolean;
  MODE: string;
  PROD: boolean;
  SSR: boolean;
  VITE_ZCODE_BASE_URL: string;
  /** '1' 表示启用 E2E store 桥（本模块的门控开关）。 */
  VITE_ZCODE_E2E_STORE_BRIDGE: string;
  VITE_ZCODE_ENDPOINT_ORIGIN: string;
}

/**
 * zustand store hook 的最小公共形状。
 * // TODO(infer): 各 store 的完整 state/action 类型未建模（它们定义在
 * // skillStore chunk 内部，恢复它们不在本模块范围内）。
 */
type AnyZustandStore = {
  (): unknown;
  getState: () => unknown;
  setState: (partial: unknown) => void;
  subscribe: (listener: () => void) => () => void;
};

/** 挂载到 window 上的 E2E 桥全局对象（Playwright 等测试工具读取它们）。 */
declare global {
  interface Window {
    __zcodeSessionStoreE2E?: AnyZustandStore;
    __skillStoreE2E?: AnyZustandStore;
    __subagentsStoreE2E?: AnyZustandStore;
    __whiteboardStoreE2E?: AnyZustandStore;
  }
}

/* ──────── skillStore chunk 符号的类型化绑定（minified 别名 -> 语义名） ──────── */

/** 门控：仅当运行在浏览器且 VITE_ZCODE_E2E_STORE_BRIDGE === '1' 时返回 true。 */
const isE2EStoreBridgeEnabled = K as (env?: ZCodeRendererEnv) => boolean;
/** 会话（任务）store：workspaces 状态 + getWorkspaceState。 */
const useSessionStore = h as AnyZustandStore;
/** 技能 store：skills[] + initialize(skillsService)。 */
const useSkillStore = t as AnyZustandStore;
/** 子代理 store：agents[] + initialize(subagentsService)。 */
const useSubagentsStore = r as AnyZustandStore;
/** 白板 store：createBoard 等。 */
const useWhiteboardStore = o as AnyZustandStore;

/* ─────────────────────────── registerE2EStoreBridges ─────────────────────────── */

/**
 * 把四个 zustand store 以稳定全局名挂到 window 上，供 E2E 测试直接读取
 * 渲染进程状态（绕过 UI 断言）。原码以逗号表达式连写四个赋值，恢复版
 * 改写为普通语句块，行为一致。
 *
 * 原函数名即导出名 `registerE2EStoreBridges`（chunk 中唯一导出，未混淆）。
 */
function registerE2EStoreBridges(): void {
  if (!isE2EStoreBridgeEnabled()) return;
  window.__zcodeSessionStoreE2E = useSessionStore;
  window.__skillStoreE2E = useSkillStore;
  window.__subagentsStoreE2E = useSubagentsStore;
  window.__whiteboardStoreE2E = useWhiteboardStore;
}

export { registerE2EStoreBridges };

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * 导出符号（1 个）：
 *   registerE2EStoreBridges -> a -> registerE2EStoreBridges
 *     （原 chunk 导出即 `export { a as registerE2EStoreBridges }`，
 *      内部名 a，语义名沿用原导出名）
 * 模块内局部符号（0 个额外）：无
 * 导入符号（5 个，来自 ./skillStore-BmeKHDBI.js，格式：导出别名 -> 内部名 -> 语义名）：
 *   K -> v  -> isE2EStoreBridgeEnabled   门控（window 存在 && 环境变量为 '1'）
 *   h -> yn -> useSessionStore           会话 store（__zcodeSessionStoreE2E）
 *   t -> Yn -> useSkillStore             技能 store（__skillStoreE2E）
 *   r -> Gn -> useSubagentsStore         子代理 store（__subagentsStoreE2E）
 *   o -> In -> useWhiteboardStore        白板 store（__whiteboardStoreE2E）
 * ════════════════════════════════════════════════════════════════════════ */
