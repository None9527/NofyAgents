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
import {
  isE2EStoreBridgeEnabled, // 原 skillStore-BmeKHDBI K（内部名 v）
  useTaskStore as useSessionStore, // 原 skillStore-BmeKHDBI h（内部名 yn）
  useWhiteboardStore, // 原 skillStore-BmeKHDBI o（内部名 In）
  useSubagentsStore, // 原 skillStore-BmeKHDBI r（内部名 Gn）
  useSkillsStore as useSkillStore, // 原 skillStore-BmeKHDBI t（内部名 Yn）
} from './SkillStore';

/* ─────────────────────────── 类型声明（推断） ─────────────────────────── */

/**
 * 构建期注入的 Vite 环境变量（原码内联了 import.meta.env 的产物快照）。
 * 把握度高：字段与入口/日志等 chunk 中反复出现的同一对象逐字一致。
 〔A1-R186〕★本注（块 @48-51、类别「死面之标签」）係下方被删面之**标签**：其主语 ZCodeRendererEnv 已随死界面普查批第五批销账 ⇒ 本注失去该 referent。★〔A1-R186 裁定 part (ii)，dossier-F f.5〕本注所标签之实体 ZCodeRendererEnv 经重测仍活（命中 4 处：lib/logger.ts@13／lib/logger.ts@45／stores/e2eStoreBridge.ts@6／stores/e2eStoreBridge.ts@18；口径＝掩码 v8 之代码位命中、已排除本批全部被删区间（故係**施后**值，恒 ≤ 施前值））⇒ 按〔A1-R176〕判别式（注之 referent 是否尚有活体成员）本注必须存活。§5.3 不对称：多一骑手只费一行、漏一骑手则留一句假散文 ⇒ 疑则存之、存活并加骑手。原文逐字保留、只增不改（骑手只增文、不删旧字）。 */
/* ── tombstone〔A1-R186〕死界面普查批第五批（modules/e2eStoreBridgeBootstrap.tsx：1 面／11 行，本批该文件共 1 碑）：本地 interface ZCodeRendererEnv@52-62（11 行）纯删，11 行等行墓碑在原位。
 *    判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。
 *    interface ZCodeRendererEnv：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；带 export 而无一家导入方把该名作 specifier 拉取〔判据 Ⓑ 之 specifier 级，A1-R184 v8〕。
 *    同名定义站：ZCodeRendererEnv 施前全树 3 家、本批销 1 家 ⇒ 施后余 2 家（皆未导出，活体 lib/logger.ts@13／stores/e2eStoreBridge.ts@6）。
 *    原体内 @59 之单行成员文档注按〔A1-R165 s8〕**逐字保留于本碑**（其注内散文「'1' 表示启用 E2E store 桥（本模块的门控开关）。」原样转录；定界符按〔A1-R173 沉淀①〕只描述不引用）——它载束源出处，删之即失证。
 *    邻接注记裁定（±4 行窗口）：@51 之注记皆**存活**、其原文逐字保留并各带同批骑手（骑手只增文、不删旧字），已断言与 HEAD 之差异仅限骑手所增。
 *    型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。
 *    原界面共 11 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 11 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 11 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    净零行：本碑 11 行置换原 11 行，文件行数 109 不变、零重锚（本文件 e2eStoreBridgeBootstrap 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 0 条（原始发射 0）；六形全树零命中 ⇒ 净零行非引证所强制，仍照本批工艺一律强制（等行墓碑），免与它文件引证口径分叉）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */

/* ──────── skillStore chunk 符号说明（minified 别名 -> 语义名） ────────
 * 门控 isE2EStoreBridgeEnabled：仅当运行在浏览器且
 * VITE_ZCODE_E2E_STORE_BRIDGE === '1' 时返回 true。
 * useSessionStore（会话/任务 store）：workspaces 状态 + getWorkspaceState。
 * useSkillStore（技能 store）：skills[] + initialize(skillsService)。
 * useSubagentsStore（子代理 store）：agents[] + initialize(subagentsService)。
 * useWhiteboardStore（白板 store）：createBoard 等。
 * 四个 window 挂载点的全局声明由 SkillStore.tsx 统一给出（类型为 unknown，
 * Playwright 等测试工具读取它们）。
 * ─────────────────────────────────────────────────────────────────────── */

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
