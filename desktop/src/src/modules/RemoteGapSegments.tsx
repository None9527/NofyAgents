/* eslint-disable */
/**
 * ============================================================================
 * RemoteGapSegments.tsx — F10 远程族两个未分配隙段的逐字重建（批次 B5-14 · 缺口 3）
 * ============================================================================
 *
 * 来源文件（主口径，融合 chunk，只读，md5 基线 48d71d4874b0868d61fd35a328bf6ad5）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 接口级登记依据：
 *   desktop/src/src-reconstructed/modules/WebRemoteWizard.report.md §B.2-3（隙段 a/b）
 *
 * 行号口径：本文件注释中「当前 N」= 当前 out chunk 实测行号（锚点回代以此为准）；
 *           「原 N」= 台账口径（≤142k 区 当前−17）；「jsx N」= WebRemoteWizard.report.md
 *           所引 pretty 版行号（仅登记符号有值，其余记 —）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表
 * ----------------------------------------------------------------------------
 * 隙段 a（台账原 123518–123928 / 当前 123522–123945；登记 12 符号 + 内部 4 + 邻接 1）：
 *   dEt → probeDockerAvailability        docker 可用性探测（邻接，原 123496，未登记；本批补录）
 *                                        （当前 123513–123521 / jsx —）
 *   fEt → resolveCurrentDockerContainer  现容器名在列表中则保留（当前 123522–123525 / 原 123505 / jsx 105244）
 *   pEt → listAvailableRemoteKinds       可用连接类型列表（当前 123526–123534 / 原 123509 / jsx 105251）
 *   mEt → useRemoteWizardState           向导状态总钩（当前 123535–123746 / 原 123518 / jsx 105255）
 *   hEt → stripRemoteLogPrefixes         日志行前缀剥离（当前 123747–123753 / 原 123730 / jsx 105441）
 *   gEt → logIsDownloadProgress          内部（当前 123754–123756 / 原 123737 / jsx —）
 *   _Et → classifyProgressLogMessage     内部（当前 123757–123761 / 原 123740 / jsx —）
 *   vEt → mergeRemoteLogProgressEntry    内部（当前 123762–123784 / 原 123745 / jsx —）
 *   yEt → logEntryMatchesRequestId       内部（当前 123785–123788 / 原 123768 / jsx —）
 *   bEt → useRemoteConnectionLogs        连接日志钩（当前 123789–123837 / 原 123772 / jsx 105484）
 *   xEt → resolveWizardStepCopy          步文案（当前 123838–123867 / 原 123821 / jsx 105519）
 *   SEt → validateAndBuildRemoteTarget   校验并构建目标（当前 123868–123928 / 原 123851 / jsx 105567）
 *   CEt → attachSelectedResourcePackages ssh 目标附资源包（当前 123929–123931 / 原 123912 / jsx 105674）
 *   wEt → isWizardFlowActive             当前 123932–123934 / 原 123915 / jsx 105682
 *   TEt → isWizardFlowIdle               当前 123935–123937 / 原 123918 / jsx 105685
 *   EEt → wizardResultToOpenState        当前 123938–123940 / 原 123921 / jsx 105688
 *   DEt → resolveDirectorySelectFallback 当前 123941–123945 / 原 123924–123928 / jsx 105694
 * 隙段 b（台账原 127340–127925 / 当前 127350–127942；登记 4 符号 + 内部 2 + 邻接 3）：
 *   eOt → REMOTE_LOG_AUTOSCROLL_THRESHOLD_PX  邻接，原 127333，未登记；本批补录（当前 127350）
 *   tOt → logViewIsScrolledToBottom           邻接，原 127334，未登记；本批补录（当前 127351–127353）
 *   nOt → scrollLogViewToBottom               邻接，原 127337，未登记；本批补录（当前 127354–127356）
 *   rOt → RemoteConnectingStep           连接日志步（当前 127357–127509 / 原 127340 / jsx 107685）
 *   iOt → buildRemoteConnectionFeedbackDescription 内部（当前 127510–127526 / 原 127493 / jsx —）
 *   aOt → remoteKindIcon                 内部（当前 127527–127538 / 原 127510 / jsx —）
 *   oOt → RemoteKindStep                 类型步（当前 127539–127615 / 原 127522 / jsx 107764）
 *   sOt → RemoteSettingsStep             设置步壳（当前 127616–127781 / 原 127599 / jsx 107792）
 *   cOt → RemoteDirectoryStep            目录步（当前 127782–127942 / 原 127765–127925 / jsx 107859）
 *
 * ----------------------------------------------------------------------------
 * 二、边界裁决（只记录，不改动它批产物）
 * ----------------------------------------------------------------------------
 *  1. H2/U2（useConfirmDialogStore/useConfirmDialog，当前 123480–123512）已随
 *     stores-core.tsx §5 抽取（739–786 行），与本隙段 a 邻接，不在本批范围。
 *  2. OEt/kEt/AEt/jEt（当前 123946–123958 = 原 123929–123941）已随 Modals.tsx
 *     抽取（3348–3360 行），紧接隙段 a 之后，不在本批范围。
 *  3. REt RemoteSettingsForm（RemoteWizard.tsx 521 行导出）/ MEt DirectoryBrowserDialog、
 *     r4 RemoteSyncDialogs、$Dt RemoteSyncDropdownButton（Modals.tsx 导出）——本文件直接
 *     import 正规实体，不重复转录。
 *  4. $2 canOpenRemoteSessionSourceCheck：正规实现在 Modals.tsx 689 行（未导出），
 *     本文件以 declare 挂接（签名照录），整合期改为自 Modals 再导出。
 *  5. $te DEFAULT_ASSET_INSTALL_MODE：正规实体在 SrcSharedA.tsx 4542 行（const 链
 *     声明符，未导出），本文件以 declare 挂接，整合期补导出或改 import。
 *  6. i4/lOt/uOt/dOt/fOt/pOt（当前 127943+，步序/指示器/头/壳）已随 RemoteWizard.tsx
 *     抽取；本文件四步骤组件即 fOt 的 declare 挂接对象，整合期替换 RemoteWizard.tsx
 *     344–363 行 declare。
 *  7. testid：styles 自 src-HCld2afU 绑定 wne/yn/pn/Gt（remote-kind-*）与 Ni（ssh-error）；
 *     正规实体在 SrcSharedB.tsx（remoteKind*Testid / sshErrorTestid），本文件 import。
 *  8. yC FeedbackStore：stores-core.tsx §3 已逐字重建并导出 useFeedbackStore，本文件 import。
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk / 它批已还原者）
 * ----------------------------------------------------------------------------
 *  1. react；2. cn (Z)；3. Button (X)；4. useIntlContext (G)；5. usePlatformService (l，
 *     本批扩展面：isDockerAvailable/listDockerContainers/listSSHConfigAliases/
 *     listWSLDistros/onRemoteConnectionLog/captureWindowScreenshot)；
 *  6. useFeedbackStore (yC，stores-core)；7. 图标（Sa=createLucideIcon：fv loader 27363 /
 *     N triangle-alert / Iv server 27794 / U_ cloud 26966 / Qye monitor-cog 27491 /
 *     Gv terminal 27900 / wa ChevronRight=button chunk o 导出）；
 *  8. lee isValidWslUser、vne listFileTransferCapabilities（SrcSharedA 导出）。
 *
 * 把握度：高（全量逐行逐字；类型注解与两处类型层垫片在 §五 符号表后注记）。
 * ==========================================================================*/


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/remote/RemoteGapSegments.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  probeDockerAvailability,
  resolveCurrentDockerContainer,
  listAvailableRemoteKinds,
  useRemoteWizardState,
  stripRemoteLogPrefixes,
  useRemoteConnectionLogs,
  resolveWizardStepCopy,
  validateAndBuildRemoteTarget,
  attachSelectedResourcePackages,
  isWizardFlowActive,
  isWizardFlowIdle,
  wizardResultToOpenState,
  resolveDirectorySelectFallback,
  REMOTE_LOG_AUTOSCROLL_THRESHOLD_PX,
  logViewIsScrolledToBottom,
  scrollLogViewToBottom,
  RemoteConnectingStep,
  RemoteKindStep,
  RemoteSettingsStep,
  RemoteDirectoryStep,
} from '../components/remote/RemoteGapSegments';
