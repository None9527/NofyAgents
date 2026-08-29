/* eslint-disable */
/**
 * ============================================================================
 * RemoteDirectorySuggestInput.tsx — styles 融合 chunk 建议输入微段
 * NEt/PEt/W2 逐字重建（批次 B5-15 · 全量解码最后微批次）
 * ============================================================================
 *
 * 来源文件（主口径，213,979 行，只读；md5 基线 48d71d4874b0868d61fd35a328bf6ad5）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * jsx 孪生交叉参照（同一 chunk 的 pretty-print 版）：
 *   desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 覆盖区段：当前 124144–124259（116 行）＝ 台账口径原 124127–124242（当前−17）：
 *   - NEt → containerContainsTarget（124144–124146，3 行，平凡谓词透传）
 *   - PEt → suggestionMatchesQuery（124147–124151，5 行，trim+toLowerCase includes）
 *   - W2  → SuggestionInput（124152–124259，108 行，Popover+cmdk 建议输入组件）
 * 边界实测裁决：任务书标 W2 起 124151，实测 124151 为 PEt 右花括号、W2 起于
 *   124152（与 WebRemoteWizard.report §B.2.2 登记一致）；W2 止 124259 与任务书
 *   一致，下一顶格符号 G2 @124260 属它批（REt 族依赖，WebRemoteWizard 已内联）。
 *
 * 边界互斥（只注记，不改动它批产物）：
 *   - 上界：124143 `}` 为 MEt DirectoryBrowserDialog 收尾（Modals.tsx 止于原
 *     124126）；123946–123958 OEt/kEt/AEt/jEt 已在 Modals.tsx 3348–3360。
 *   - 下界：124260 G2 / 124267 FEt / 124278 LEt / 124284 REt 属它批；
 *     G2/FEt/K2/IEt/LEt 已由 WebRemoteWizard.tsx 内联逐字实现（其报告 §B.2.2）。
 *
 * 重建口径（与 B5-12d/B5-14 一致）：
 *   - 逐字转录：类名/字符串常量/分支/数值/JSX 调用形态 `(0, $.jsx)(...)`、
 *     `(0, $.jsxs)(...)` 零改动；函数体内局部变量保留原混淆名（e/t/n/r/i/a/o/s/
 *     c/l/u/d/f/p/m/h/g/_/v/y/b）以保证可回代。
 *   - 顶层符号改语义名（下表）；类型标注可机械剥离（解构形参 `}: any`、
 *     箭头回调形参 `: any`）。
 *   - 外部依赖一律 `declare const X: any` 挂接（行号在案，见 §二）。
 *   - 全量逆映射回代：语义名→混淆名、剥离 `: any` 后与 124144–124259 原文
 *     逐行比对 116/116 一致（见 B5-15.report.md §验证）。
 *
 * 文件名注记：任务书默认名 RemoteDirectorySuggestInput.tsx 保留；实测语义为
 *   通用建议输入（SuggestionInput，与 WebRemoteWizard.report 接口级登记名一致），
 *   消费方为远程连接对话框 REt 的 host/port/username/privateKeyPath 四输入，
 *   与目录浏览（MEt，Modals.tsx）无关——整合期可复核文件名。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：当前 js 行 / jsx 孪生行）
 * ----------------------------------------------------------------------------
 *   NEt → containerContainsTarget   onInteractOutside 目标 containment 判定透传
 *                                   (124144 / 105812) 把握度：高
 *   PEt → suggestionMatchesQuery    建议项 trim+toLowerCase includes 查询
 *                                   (124147 / 105817) 把握度：高
 *   W2  → SuggestionInput           Popover(anchor)+cmdk 建议输入组件
 *                                   (124152–124259 / 105822) 把握度：高
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（行号在案；均不属本批 124144–124259 范围）
 * ----------------------------------------------------------------------------
 *   Q  = React interop        chunk 996 `var Q = r(F(), 1)`（F = react-BQLj9xdT.js
 *                              导入，chunk 369）
 *   $  = jsx-runtime          chunk 1287 `var $ = Ke()`（Ke = jsx-runtime-B5yMD3-t.js
 *                              导入，chunk 430）
 *   Z  = cn 类名合并           chunk import 901（utils-CEEH0K_K.js 导出 t；
 *                              重建实体 UtilsCn.tsx cn @117）
 *   T  = Popover 根封装 pr     chunk import 358（imeComposition-DEYFkwWm.js 导出 n，
 *                              该 chunk 12544；重建实体 ImeComposition.tsx Popover @311）
 *   O  = PopoverAnchor 封装 gr chunk import 361（imeComposition chunk 导出 r，该 chunk
 *                              12564；重建实体 ImeComposition.tsx PopoverAnchor @349）
 *   P  = Input（forwardRef）Dn chunk import 367（imeComposition chunk 导出 y，该 chunk
 *                              12067；重建实体 ImeComposition.tsx Input @270）
 *   x  = PopoverContent 封装 hr chunk import 354（imeComposition chunk 导出 i，该 chunk
 *                              12550；重建实体 ImeComposition.tsx PopoverContent @326）
 *   Yb = Command 封装（cmdk）  chunk 32140
 *   Zb = CommandList 封装      chunk 32196
 *   Qb = CommandEmpty 封装     chunk 32206
 *   ex = CommandItem 封装      chunk 32223
 *
 * 消费方证据（详见 B5-15.report.md）：W2 全 chunk 仅被 REt（远程连接对话框，
 *   124284）消费 4 处：124514 ssh.host / 124527 ssh.port / 124544 ssh.username /
 *   124617 ssh.privateKeyPath；suggestions 源 = FEt(remoteWorkspaceSessions)
 *   派生的 hosts/ports/usernames/privateKeyPaths（124336）。
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 外部依赖挂接（行号在案，见上 §二；类型从宽）
// ----------------------------------------------------------------------------

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/remote/RemoteDirectorySuggestInput.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  SuggestionInput,
} from '../components/remote/RemoteDirectorySuggestInput';
