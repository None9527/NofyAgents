# B5-14-Final.report.md — 收尾批 B5-14：全部剩余接口级欠款清零（三缺口）

- 批次：B5-14（最终收尾批）
- 工作目录：`/Users/mac/nofy-build`
- 产物（均位于 `desktop/src/src-reconstructed/modules/`）：
  1. `LegacyDocEngineC5.tsx` — 364 行（缺口 1）
  2. `DocxWasmGlue.tsx` — 953 行（缺口 2）
  3. `RemoteGapSegments.tsx` — 1435 行（缺口 3）
- 纪律执行：`desktop/src/out/` 全程只读（§4.4 md5 复验）；未改动任何既有 .tsx/.report.md
  （边界冲突一律只注记）；未派生子代理。

---

## 1. 缺口 1：legacy-doc [E6]b 余带（19542–20230 间未实体化符号）→ LegacyDocEngineC5.tsx

### 1.1 口径

- 主口径：`desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx`
  （pretty 孪生；原件 `out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js` 只读，
  md5 基线 `cfa43c9f7be31ca608214e29ea1419ea`，批后复验一致）。
- B5-08 已覆盖 jsx 18106–19541（测量原语+Mg）与 20231–24337；[E6]b 区（16816–20230）中
  19542–20230 余带的登记符号经精确定位，**实际散布于 17145 与 19552–20133 之间**
  （Dp 一处前挂在 17145，其余集中在 19552+），全量逐字实体化如下。

### 1.2 覆盖清单（符号 → jsx 行 → 产物行）

| 原符号 | 语义名 | jsx 行 | 产物行 | 把握度 |
|---|---|---|---|---|
| Dp | floatingIsParagraphRelative | 17145 | 88 | 高（逐字） |
| Pg | inlineImageIsPageOrMarginAnchored | 19552 | 99 | 高 |
| zg | unscaleDelta | 19680 | 104 | 高 |
| Bg | unscaleRect（+ `UnscaleRect` 接口 109） | 19683 | 118 | 高 |
| Vg | sectionFloatingMovePatch | 19696 | 134 | 高 |
| Hg | floatingMovePatch | 19724 | 174 | 高 |
| Ug | paragraphHostPointHit | 19761 | 220 | 高 |
| Wg | floatingWrapIsInlineLike | 19783 | 245 | 高 |
| qg | isPageOrMarginAnchoredFloating | 19821 | 252 | 高 |
| Yg | paragraphHasAnchoredImage | 19837 | 262 | 高 |
| Xg | paragraphHasUnanchoredFloatingImage | 19840 | 267 | 高 |
| Zg | paragraphHasPageAnchoredFloatingImage | 19843 | 272 | 高 |
| Qg | paragraphHasVisiblePageAnchoredImage | 19846 | 277 | 高 |
| e_ | resolveHighlightColor | 19872 | 282 | 高 |
| f_ | paragraphHostStyle | 20104 | 290 | 高 |
| p_ | themeAwareColor | 20127 | 322 | 高（批 B BModel 436 重复转录，裁决见 1.3） |
| m_ | normalizeFontFamily | 20133 | 330 | 高（批 B BModel 450 重复转录，裁决见 1.3） |

任务书点名的 `zg/Bg/Vg/Hg/Ug/Wg + qg/Yg/Xg/Zg/Qg/e_/f_/m_` 14 符号全部实体化；
另含同余带实测的 Dp/Pg/p_（Pg 为 qg 的谓词基元，p_ 与 m_ 同属登记余带面）。

### 1.3 边界裁决（只注记，不改动既有文件）

1. **与批 B（LegacyDocEngineB*.tsx）**：qg/Yg/Xg/Zg/Qg/e_ 已在 BLayout §14/§16 忠实转录、
   m_/p_ 已在 BModel 436/450 转录——属**重复转录**。按 B5-08 §2.9 Jg 先例裁决：
   **正规实体 = 本文件（C5）**，批 B 副本于整合期改为自 C5 再导入；本批不改动批 B 文件。
   t_/n_/r_ 等批 B 符号不在余带登记清单，仍归批 B。
2. **与 C1/C2**：C5 自 C1 导入 isInlineImageNode(2772)/isFloatingImageNode(2795)/
   snapToGridModeOf(1484)/applyDefaultSpacingForGrid(1584)/spacingBeforeAbsent(1602)，
   自 C2 导入 imageIsPageAnchoredFloating(4662) 与类型——均为已门禁正规导出，无冲突。
3. **与 C3 declare（442–480 行）**：六符号（zg/Bg/Vg/Hg/Ug/Wg）由本文件实体化替换。
   签名差异注记：unscaleRect 的 right/bottom 字段、floatingMovePatch 首参为 image、
   paragraphHostPointHit 返回值含 host、floatingWrapIsInlineLike 参数收窄为
   DocxFloatingImage——均按原件实测，declare 为调用点反推的近似。
4. **与 C4**：C4 的 `declare const X: any` 登记面（约 316 处）含余带符号名，整合期改指本文件。

---

## 2. 缺口 2：docx-core wasm glue 两个微 chunk → DocxWasmGlue.tsx

### 2.1 口径与范围

- `out/renderer/assets/chunk-YE7GQOST-DVtn9d8T.js`（428 行，first-party Rust glue）+
  `out/renderer/assets/src-AEHDFCS5-Cut3IAW0.js`（25 行，再导出模块）——**两 chunk 合并为
  一件产物**（src-AEHDFCS5 仅再导出 chunk-YE7GQOST 符号，无独立实体）。
- VENDOR-MANIFEST-LIBS.md「Office 文档预览」表两行（chunk-YE7GQOST 428 行
  「docx-core wasm loader module」/ src-AEHDFCS5 25 行 「re-exports 9 symbols」）核销。
- **清单勘误**：src-AEHDFCS5 实测再导出 **10** 个符号（非 9）：allocateBlockId/
  buildDocModel/buildDocModelFromBytes/cloneDocModel/cloneParagraphNode/cloneTableNode/
  collectDuplicateDocModelBlockIds/deepFreezeDocModel/ensureDocModelBlockIds/normalizeDocModel。

### 2.2 chunk 导出字母映射（实测）

`{ w as a, I as c, P as i, d as l, L as n, T as o, R as r, p as s, l as t, s as u }`
（chunk-YE7GQOST 尾部导出块），即：

| 字母 | 内部名 | 公共名（经 src-AEHDFCS5） | 产物行 |
|---|---|---|---|
| a | w | cloneParagraphNode | 592 |
| c | I | deepFreezeDocModel | 900 |
| i | P | cloneDocModel（= deepCloneModel 契约） | 826 |
| l | d | ensureDocModelBlockIds | 481 |
| n | L | buildDocModel | 906 |
| o | T | cloneTableNode | 748 |
| r | R | buildDocModelFromBytes | 912 |
| s | p | collectDuplicateDocModelBlockIds | 502 |
| t | l | allocateBlockId（= newBlockId 契约） | 468 |
| u | s | normalizeDocModel | 440 |

### 2.3 B5-08 declare 实体化对照

- LegacyDocEngineC2.tsx 301 行 `declare function deepCloneModel(model)` ←
  **本文件 879 行 `export const deepCloneModel = cloneDocModel`**（chunk `i` 导出）✓
- LegacyDocEngineC2.tsx 303 行 `declare function newBlockId()` ←
  **本文件 882 行 `export const newBlockId = allocateBlockId`**（chunk `t` 导出）✓

### 2.4 全量实体清单（30 函数 + 类型系统）

类型层：DocxCorePackage/BorderSide/ParagraphBorders/TableBorders/RunStyle/ParagraphStyle/
PatchRun/Widget/TextChild/FormFieldChild/ImageChild/ParagraphChild/Paragraph/CellMargins/
TableFloating/TableStyle/TableCell/TableRow/Table/Block/HeaderFooter/SectionMeta/Note/
ParagraphStyleDef/NumberingLevel/NumberingDefinitions/Metadata/Model（130–437 行）。
函数层（产物行）：toUint8Array · normalizeImageNode · normalizeBlockNode · normalizeBlock ·
normalizeDocModel(440) · blockIdCounter · allocateBlockId(468) · assignBlockIdsRecursive ·
ensureDocModelBlockIds(481) · collectDuplicateBlockIdsRecursive ·
collectDuplicateDocModelBlockIds(502) · blockIsParagraph · blockIsTable · mapBlockNodes ·
cloneNumberingStyle · cloneSpacingStyle · cloneIndentStyle · cloneBorderSideStyle ·
cloneParagraphBordersStyle · cloneParagraphStyleDeep · cloneRunStyleDeep ·
cloneParagraphNode(592) · cloneParagraphFull · cloneCellMarginTwips · cloneBorderSpec ·
cloneTableBordersSpec · cloneTableFloatingSpec · cloneTableNode(748) · cloneTableFull ·
cloneBlock · cloneNumberingDefinitions · cloneDocModel(826) · deepFreezeRecursive ·
deepFreezeDocModel(900) · buildDocModel(906) · buildDocModelFromBytes(912)。

### 2.5 结构偏差登记（1 处，已注记）

`buildDocModelFromBytes` 内 `import('./src-2FP7IUE6-ahbsNOoE.js')` 动态导入在重建侧无对应
实体文件（该 chunk 属另行批次），按 XlsxPreviewWasmBridge 先例契约化为
`declare function loadParseDocxModule()`；preloadModule + `__vite__mapDeps([0,1,2])` +
`import.meta.url` 结构逐字保留。

---

## 3. 缺口 3：F10 远程族两个隙段 → RemoteGapSegments.tsx

### 3.1 口径

- 主口径 `out/renderer/assets/styles-CdEGpc2x.js`（只读，md5 基线
  `48d71d4874b0868d61fd35a328bf6ad5`，批后复验一致）。
- 行号换算：台账口径 ≤142k 区 = 当前 − 17；**以符号实测定位为准**（任务书台账行号
  123518/123928/127340/127925 与实测边界完全吻合：mEt 原 123518 起、DEt 原 123928 止、
  rOt 原 127340 起、cOt 原 127925 止）。
- 接口级登记依据：`WebRemoteWizard.report.md` §B.2-3（RemoteWizard.tsx 234–363 行 declare
  契约名全部沿用）。

### 3.2 隙段 a 覆盖清单（台账原 123518–123928；12 登记符号 + 内部 4 + 邻接 1）

| 原符号 | 语义名 | 当前 js 行 | 原（台账） | jsx 行 | 产物行 |
|---|---|---|---|---|---|
| dEt | probeDockerAvailability（邻接补录） | 123513–123521 | 123496–123504 | — | 242 |
| fEt | resolveCurrentDockerContainer | 123522–123525 | 123505–123508 | 105244 | 257 |
| pEt | listAvailableRemoteKinds | 123526–123534 | 123509–123517 | 105251 | 269 |
| mEt | useRemoteWizardState | 123535–123746 | 123518–123729 | 105255 | 283 |
| hEt | stripRemoteLogPrefixes | 123747–123753 | 123730–123736 | 105441 | 510 |
| gEt | logIsDownloadProgress（内部） | 123754–123756 | 123737–123739 | — | 519 |
| _Et | classifyProgressLogMessage（内部） | 123757–123761 | 123740–123744 | — | 524 |
| vEt | mergeRemoteLogProgressEntry（内部） | 123762–123784 | 123745–123767 | — | 531 |
| yEt | logEntryMatchesRequestId（内部） | 123785–123788 | 123768–123771 | — | 556 |
| bEt | useRemoteConnectionLogs | 123789–123837 | 123772–123820 | 105484 | 562 |
| xEt | resolveWizardStepCopy | 123838–123867 | 123821–123850 | 105519 | 613 |
| SEt | validateAndBuildRemoteTarget | 123868–123928 | 123851–123911 | 105567 | 648 |
| CEt | attachSelectedResourcePackages | 123929–123931 | 123912–123914 | 105674 | 714 |
| wEt | isWizardFlowActive | 123932–123934 | 123915–123917 | 105682 | 719 |
| TEt | isWizardFlowIdle | 123935–123937 | 123918–123920 | 105685 | 724 |
| EEt | wizardResultToOpenState | 123938–123940 | 123921–123923 | 105688 | 729 |
| DEt | resolveDirectorySelectFallback | 123941–123945 | 123924–123928 | 105694 | 734 |

### 3.3 隙段 b 覆盖清单（台账原 127340–127925；4 登记符号 + 内部 2 + 邻接 3）

| 原符号 | 语义名 | 当前 js 行 | 原（台账） | jsx 行 | 产物行 |
|---|---|---|---|---|---|
| eOt | REMOTE_LOG_AUTOSCROLL_THRESHOLD_PX（邻接补录） | 127350 | 127333 | — | 748 |
| tOt | logViewIsScrolledToBottom（邻接补录） | 127351–127353 | 127334–127336 | — | 751 |
| nOt | scrollLogViewToBottom（邻接补录） | 127354–127356 | 127337–127339 | — | 756 |
| rOt | RemoteConnectingStep | 127357–127509 | 127340–127492 | 107685 | 761 |
| iOt | buildRemoteConnectionFeedbackDescription（内部） | 127510–127526 | 127493–127509 | — | 902 |
| aOt | remoteKindIcon（内部） | 127527–127538 | 127510–127521 | — | 928 |
| oOt | RemoteKindStep | 127539–127615 | 127522–127598 | 107764 | 942 |
| sOt | RemoteSettingsStep | 127616–127781 | 127599–127764 | 107792 | 1073 |
| cOt | RemoteDirectoryStep | 127782–127942 | 127765–127925 | 107859 | 1253 |

### 3.4 边界裁决（只注记，不改动既有文件）

1. **H2/U2**（当前 123480–123512，隙段 a 前邻）：已随 stores-core.tsx §5（739–786 行）
   抽取，不在本批范围，仅注记。
2. **OEt/kEt/AEt/jEt**（当前 123946–123958 = 原 123929–123941，隙段 a 后邻）：已随
   Modals.tsx 3348–3360 抽取，仅注记。
3. **REt/MEt/r4/$Dt**：直接 import 正规实体（RemoteWizard.tsx 521 / Modals.tsx 3374/3225/744），
   不重复转录。
4. **$2 canOpenRemoteSessionSourceCheck**：正规实体 Modals.tsx 689（**未导出**）→ 本文件
   declare 挂接（签名照录），整合期改为自 Modals 再导出。
5. **$te DEFAULT_ASSET_INSTALL_MODE**：正规实体 SrcSharedA.tsx 4542（const 链声明符，
   **未导出**）→ declare 挂接；整合期补导出。
6. **i4/lOt/uOt/dOt/fOt/pOt**（当前 127943+）：已随 RemoteWizard.tsx 抽取；本文件四步骤
   组件即 RemoteWizard.tsx 344–363 行 declare 的实体化对象，整合期替换。
7. **testid 绑定**：styles 自 src-HCld2afU 绑定 wne/yn/pn/Gt（remote-kind-*）与 Ni
  （ssh-error）；正规实体 SrcSharedB.tsx remoteKind*Testid/sshErrorTestid，本文件 import。
8. **yC FeedbackStore**：stores-core.tsx §3 已重建导出，本文件 import。
9. **类型层垫片 4 处**（零运行时影响，产物尾表已注记）：useState/useRef 泛型；
   sOt 传 REt 的 `dockerAvailable={y as boolean | undefined}`（REt 以 `=== false` 消费，
   null/undefined 行为同一）；oOt 卡片图标局部名 r → KindIcon（JSX 组件位需大写）；
   隐式参数类型标注。

---

## 4. 验证记录（四项门禁）

### 4.1 门禁 1 — esbuild（三件各跑，0 错）

```
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/LegacyDocEngineC5.tsx \
  --loader:.tsx=tsx --jsx=preserve --outfile=/dev/null   → Done in 7ms，0 错
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/DocxWasmGlue.tsx \
  --loader:.tsx=tsx --jsx=preserve --outfile=/dev/null   → Done in 1ms，0 错
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/RemoteGapSegments.tsx \
  --loader:.tsx=tsx --jsx=preserve --outfile=/dev/null   → Done in 8ms，0 错
```

### 4.2 门禁 2 — tsc strict（0 错）

- 配置：`/tmp/tsconfig.LegacyDocEngineC5.json` / `/tmp/tsconfig.DocxWasmGlue.json` /
  `/tmp/tsconfig.RemoteGapSegments.json`（strict、target/lib ES2022+DOM+DOM.Iterable、
  module ESNext、moduleResolution Bundler、jsx preserve、noEmit、skipLibCheck、
  typeRoots → `web/node_modules/@types`、include 仅该产物）。
- 差异注记：C5/DocxWasmGlue 用 `types: [react, react-dom, node]`；RemoteGapSegments 用
  `types: []` —— 因其导入的 SrcSharedB.tsx 含 `declare global { var process: any }`，
  与 @types/node 的 Process 声明冲突（TS2403）；SrcSharedB 自身门禁即 `types: []`
  （SrcSharedB.report.md 1505 行），本件对齐该口径。
- 修正归零记录：RemoteGapSegments 首轮 5 错（4× TS7006 setter 回调隐式 any——返回面
  逗号表达式内无上下文推断，补参数类型标注；1× TS2403 见上）→ 归零。
- 结果：

```
web/node_modules/.bin/tsc -p /tmp/tsconfig.LegacyDocEngineC5.json    → exit 0，0 错
web/node_modules/.bin/tsc -p /tmp/tsconfig.DocxWasmGlue.json         → exit 0，0 错
web/node_modules/.bin/tsc -p /tmp/tsconfig.RemoteGapSegments.json    → exit 0，0 错
```

### 4.3 门禁 3 — 锚点回代（每件 ≥8，全部逐字命中；[产物命中/原件命中]）

**LegacyDocEngineC5.tsx（12 锚点，对 jsx 主口径）**

| # | 锚点（逐字串） | jsx 行（抽样） | 产物行 | 结果 |
|---|---|---|---|---|
| A1 | `[data-docx-paragraph-host='true'][data-docx-paragraph-kind='paragraph'][data-docx-paragraph-node-index]` | 19766 区 | 223 | ✓ [1/2] |
| A2 | `[data-testid='docx-editor-viewer']` | 19762 区 | 221 | ✓ [1/1] |
| A3 | `topandbottom` | 19700 区 | — | ✓ [1/3] |
| A4 | `distLPx ?? 8` | 19728 区 | 208 | ✓ [1/2] |
| A5 | `#f3f4f6` | 20127 区 | 324/326 | ✓ [2/6] |
| A6 | `rgb(0, 0, 0)` | 20131 区 | 326 | ✓ [1/1] |
| A7 | `/(mono\|consolas\|courier\|menlo\|code)/` | 20133 区 | 340 | ✓ [1/1] |
| A8 | ``horizontalRelativeTo: `margin` `` | 19730 区 | — | ✓ [2/3] |
| A9 | ``boxSizing: `border-box` `` | 20120 区 | — | ✓ [1/13] |
| A10 | `allowNegativeImageTop: !0` | 19726 区 | 198 | ✓ [1/1] |
| A11 | ``width: `100%` `` | 20121 区 | — | ✓ [1/14] |
| A12 | `Number.parseFloat(String(` | 20107–20110 | 300/301 | ✓ [4/4] |

**DocxWasmGlue.tsx（16 锚点，对两微 chunk 原件）**

| # | 锚点 | 原件命中 | 产物行（抽样） | 结果 |
|---|---|---|---|---|
| B1 | `headerSections` | chunk×7 | 338 | ✓ [9] |
| B2 | `footerSections` | chunk×7 | — | ✓ [9] |
| B3 | `sectionPropertiesXml` | chunk×2 | — | ✓ [4] |
| B4 | `partName` | chunk×5 | — | ✓ [7] |
| B5 | `sourceXml` | chunk×4 | — | ✓ [8] |
| B6 | `noteReference` | chunk×3 | — | ✓ [5] |
| B7 | `pictureBullet` | chunk×2 | — | ✓ [3] |
| B8 | `referenceType` | chunk×4 | — | ✓ [5] |
| B9 | ``b${ `` | chunk×1 | 470 | ✓ [1] |
| B10 | `src-2FP7IUE6` | chunk×2 | 12 | ✓ [7] |
| B11 | `chunk-WKBPLHUA` | chunk×1 + src×1 | 24 | ✓ [7] |
| B12 | `allocateBlockId` | src×1 | 468 | ✓ [7] |
| B13 | `collectDuplicateDocModelBlockIds` | src×1 | 502 | ✓ [5] |
| B14 | `deepFreezeDocModel` | src×1 | 900 | ✓ [5] |
| B15 | `ensureDocModelBlockIds` | src×1 | 481 | ✓ [5] |
| B16 | `normalizeDocModel` | src×1 | 440 | ✓ [6] |

**RemoteGapSegments.tsx（14 锚点，对 styles-CdEGpc2x.js）**

| # | 锚点（逐字串） | 当前 js 行 | 产物行 | 结果 |
|---|---|---|---|---|
| C1 | `/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\]\s*/u` | 123749 | — | ✓ [1/1] |
| C2 | `/^download progress:/iu` | 123755 | 520 | ✓ [1/1] |
| C3 | `/^upload progress(?: \[([^\]]+)\])?(?: \((.+)\))?:/iu` | 123759 | — | ✓ [1/1] |
| C4 | `feedback.submit.template.section.remoteConnectFailed` | 127378 | — | ✓ [1/1] |
| C5 | `remote.connectionLogEmpty` | 127454 | — | ✓ [1/2] |
| C6 | `remote-connection-settings-scroll` | 127673 | 1129 | ✓ [1/1] |
| C7 | `directoryBrowser.selectDir` | 127879 | 1332 | ✓ [1/2] |
| C8 | `remote.optionsLoadFailed` | 127682 | — | ✓ [1/1] |
| C9 | `remote.startConnection` | 127773 | 1219 | ✓ [1/1] |
| C10 | `border-warning/30 text-warning hover:bg-warning/10` | 127475 | — | ✓ [1/1] |
| C11 | `min-h-[22rem] flex-1 items-center justify-center` | 127923 | 1374 | ✓ [1/1] |
| C12 | `flex min-h-32 flex-col items-start gap-4 rounded-2xl border p-4 text-left transition-colors` | 127556 | — | ✓ [1/1] |
| C13 | `text-ui-base leading-5 text-foreground-subtle` | 127579 | — | ✓ [1/42] |
| C14 | `w-full flex min-w-0 leading-5 text-foreground` | 127424 | — | ✓ [1/1] |

（另 `P2-中`（799）/`SSH连接失败`/`desktop-continuous`/`directory-step` 等亦逐字一致。）

### 4.4 门禁 4 — out/ 只读 md5 复验（批后）

```
md5(out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js)
  = cfa43c9f7be31ca608214e29ea1419ea   （= 基线，一致）
md5(out/renderer/assets/styles-CdEGpc2x.js)
  = 48d71d4874b0868d61fd35a328bf6ad5   （= 基线，一致）
md5(out/renderer/assets/chunk-YE7GQOST-DVtn9d8T.js)
  = bbd574fd826831cd3e03798ae32e3196   （批前批后一致，只读）
md5(out/renderer/assets/src-AEHDFCS5-Cut3IAW0.js)
  = c200d53acfca1db99e9c649f0f4a971c   （批前批后一致，只读）
```

---

## 5. 接口级总清单核销对照（逐项引用 B5-MERGE-NOTES §3）

| B5-MERGE-NOTES §3 行（原文摘要） | 批前状态 | B5-14 核销结果 |
|---|---|---|
| 「原 123518–123928（12 符号）F10 隙段 a」 | B5-05 接口级登记，待补抽 | **已清零**：RemoteGapSegments.tsx 隙段 a（12 登记符号全量逐字 + 内部 4 + 邻接 dEt 补录；§3.2） |
| 「原 127340–127925（4 符号）F10 隙段 b」 | B5-05 接口级登记，待补抽 | **已清零**：RemoteGapSegments.tsx 隙段 b（4 登记符号全量逐字 + 内部 2 + 邻接 eOt/tOt/nOt 补录；§3.3） |
| 「legacy-doc jsx [E6]b 余带（约 19542–20230）zg/Bg/Vg/Hg/Ug/Wg + qg/Yg/Xg/Zg/Qg/e_/f_/m_ 族」 | B5-08 发现；B5-14 已启动 | **已清零**：LegacyDocEngineC5.tsx（17 实体，点名 14 符号全部逐字；§1.2） |
| 「chunk-YE7GQOST-DVtn9d8T.js（428 行）+ src-AEHDFCS5（25 行）…B5-08 declare 挂接（deepCloneModel/newBlockId）」 | B5-08 declare 挂接；B5-14 已启动 | **已清零**：DocxWasmGlue.tsx（两 chunk 合并全量；deepCloneModel/newBlockId 实体化对照见 §2.3；9→10 符号勘误见 §2.1） |
| 「xlsx js 189512–193216（~3,700）」 | B5-12c 补抽（已启动） | **不属 B5-14**（xlsx 批自管），状态沿用 §3 原记 |
| 「xlsx js 183064–183971（Vu/yd/bd…Od）」 | 已并入 B5-12c 实体化 | **不属 B5-14**，状态沿用 |
| 「xlsx js 199292–199508（sy/cy）」 | 已清零（XlsxDeepT.tsx，B5-12d） | 维持已清零 |
| 「xlsx js 9111–15671（前导段）」 | 已清零（XlsxDeepP.tsx，B5-12d，FIRST-PARTY 裁决） | 维持已清零 |
| 「pptx 多区域余量 Ti/Ei/ki/Ai + DEFERRED_MULTI_REGION_ANCHORS（36 项）」 | B5-12b 登记；数据外置策略，merge 裁决豁免或外置资产 | **不属 B5-14**（任务书限定三缺口）；状态沿用，见 §6 遗留 |

---

## 6. 遗留问题（如实列出）

1. **pptx 余量**（B5-MERGE-NOTES §3 末行）：Ti/Ei/ki/Ai + DEFERRED_MULTI_REGION_ANCHORS
   36 项，归 B5-12b 数据外置策略（merge 裁决豁免或外置资产），不在本批三缺口范围。
2. **xlsx 189512–193216**：B5-12c 补抽（已启动），不在本批范围。
3. **账实差异（B5-05 发现）**：NEt/PEt/W2（当前 124144–124259）仍未抽取——本批未触碰
   （纪律：不改 Modals.tsx）；RemoteGapSegments 亦不消费三者。
4. **整合期改指清单**（本批产生）：
   - RemoteWizard.tsx 344–363 行四步骤 declare → 改 import RemoteGapSegments；
     234–320 行隙段 a declare → 同上。
   - LegacyDocEngineC3.tsx 442–480 行六 declare、C4 相应登记 → 改指 LegacyDocEngineC5。
   - LegacyDocEngineC2.tsx 301/303 行 deepCloneModel/newBlockId declare → 改指 DocxWasmGlue。
   - Modals.tsx 需再导出 $2；SrcSharedA 需导出 DEFAULT_ASSET_INSTALL_MODE（4542）。
   - 批 B（BLayout §14/§16、BModel 436/450）的 qg/Yg/Xg/Zg/Qg/e_/m_/p_ 副本 → 改自 C5 导入。
5. **类型层垫片**：三件共 6 处注记（C5 的 `as number` 类铸按 C2 先例；RemoteGapSegments
   §3.4-9 四处；DocxWasmGlue 的 `ViteMapDepsFn` 显式注解一处）——均零运行时影响。

## 7. 把握度分布

- **高（全量逐行/逐字）**：三件全部实体化符号（C5 17 + Glue 30 函数 + RGS 26），
  类名、字符串常量、正则、分支结构、i18n 键名零改动。
- **中**：无（本批无接口级 declare 挂接遗留；$2/$te 两处 declare 为**未导出正规实体**
  的临时契约，签名照录自既有产物，非反推）。
- **低**：无。
