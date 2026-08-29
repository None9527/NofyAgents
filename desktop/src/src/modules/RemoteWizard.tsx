/* eslint-disable */
/**
 * ============================================================================
 * RemoteWizard.tsx — F10 RemoteFamily 远程向导逐字重建（B5-05 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（主口径，融合 chunk，213,979 行，D5b 点状改写后现状，只读）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，仅用于 JSX 结构对照）：
 *   desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 行号口径：注释中 js 行号 = **当前 out chunk 行号**（锚点回代以此为准）；
 *           「原 N」= D5b 前原始行号（MODULE-MAP/COVERAGE-LEDGER 口径），本段偏移 +17。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（js 行 = 当前 out / jsx 行 = pretty 版）
 * ----------------------------------------------------------------------------
 *  [步骤指示]（js 127943–128055 / jsx 107954–107992）：
 *   i4   → REMOTE_WIZARD_STEPS  [kind,settings,connecting,directory] (127943 / 107954)
 *   lOt  → wizardStepIndex      (127949 / 107967)
 *   uOt  → RemoteWizardStepIndicator  移动横滚 nav + 桌面 aside 双形态 (127952 / 107970)
 *  [向导头]（js 128058–128108 / jsx 107993–108011）：
 *   dOt  → RemoteWizardHeader   标题/描述 + 最小化(bv minus)/关闭(g x) (128058 / 107993)
 *  [根] 四型设置表单（js 124284–125011 / jsx 105903–106205）：
 *   REt  → RemoteSettingsForm   ssh/server/wsl/docker 四 case 分步表单
 *  [根] 向导壳对话框（js 128110–128541 / jsx 108012–108384）：
 *   fOt  → RemoteWizardDialog   触发器 + Dialog 壳 + 四步分派（最小化/关闭语义内嵌）
 *   pOt  → RemoteWizardDialogAlias  `var pOt = fOt`（Home.tsx 接口引用名）(128542 / 108385)
 *
 * ----------------------------------------------------------------------------
 * 二、边界裁决（只记录，不改动它批产物）
 * ----------------------------------------------------------------------------
 *  1. 已抽取（Modals.tsx，只注记不重复）：MEt 目录浏览（原 123942–124126）+
 *     OEt/kEt/AEt/jEt（原 123929–123945 区）；r4 分派 + ZEt/lDt/XDt 三同步对话框 +
 *     $Dt + preflight 助手（原 124995–127332，含 $2 canOpenRemoteSessionSourceCheck
 *     原 127125——TopBar.report 亦登记，裁决归 Modals）；ZTt/QTt（原 123239/123251，
 *     登记于 TopBar.report）。128795+ 更新窗属 F09/TopBar。
 *  2. **账实差异注记**：COVERAGE-LEDGER 将原 123942–124266 记为「MEt 已抽取」，实测
 *     Modals.tsx 仅含 123929–124126；子段 NEt/PEt/W2/G2/FEt/K2/IEt/LEt（当前
 *     124144–124283）实际未抽取。本文件对 W2（SuggestionInput）等以接口级登记，
 *     待整合期补抽或归并本族（不改动 Modals.tsx）。
 *  3. **未分配隙段**（接口级登记，建议后续批）：
 *     a) 原 123518–123928：fEt/pEt/mEt 向导状态钩 + hEt…bEt 连接日志族 + xEt 步文案 +
 *        SEt 校验/目标构建 + CEt/wEt/TEt/EEt/DEt 流助手；
 *     b) 原 127340–127925：rOt 连接日志步 / oOt 类型步 / sOt 设置步壳 / cOt 目录步（含三同步卡）。
 *     fOt 渲染的四个步骤组件即 b) 隙段，本文件以 declare 挂接。
 *  4. mOt…bOt（原 128526–128567，家目录感知显示名/工作区菜单过滤）已随 Home.tsx 抽取，
 *     本文件不重复；Home.tsx 1192 行 `pOt = fOt` 接口级登记，整合期指向本实现。
 *  5. i18n：`remote/ssh/server/wsl/docker.*` 键全部保留原键名；隙段 a) 的 xEt 亦消费
 *     `remote.*StepTitle/Description` 键（declare 注释留痕）。
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk / 它批已还原者，此处声明接口）
 * ----------------------------------------------------------------------------
 *  1. react (Q) / jsx-runtime ($)；2. cn (Z)；3. Button (X)；4. Input (P，imeComposition y)；
 *  5. useIntlContext (G)；6. logger (J)；7. useConfirmDialog (U2，Modals.tsx)；
 *  8. usePlatformService (l，selectFile 面)；9. useBaseServices (Ec，本 chunk 4897)；
 *  10. 会话 store (Zs，stores-session)；11. Dialog 原语族 (zb/Hb/Ub/Gb/Kb)；
 *  12. Popover 原语族 (T/h/x/O)；13. Command/cmdk 原语族 (Yb/Zb/Xb/Qb/$b/ex)；
 *  14. Select 原语族 (iO/oO/aO/sO/cO)；15. 图标（lucide vendored 块）。
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/remote/RemoteWizard.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  RemoteWizardStepIndicator,
  RemoteWizardHeader,
  RemoteSettingsForm,
  RemoteWizardDialog,
  RemoteWizardDialogAlias,
} from '../components/remote/RemoteWizard';
export type {
  RemoteTarget,
  RemoteWorkspaceSessionLike,
} from '../components/remote/RemoteWizard';
