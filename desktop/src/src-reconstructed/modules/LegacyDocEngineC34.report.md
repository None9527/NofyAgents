# legacy-doc 内部引擎 [E7] 交互回调簇全量实体化报告（批次 B5-09 · C3/C4）

- 输入（未修改）：`desktop/src/out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js`（只读参照）
- 对照（行号口径）：`desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx`（pretty 重建孪生，**所有行号锚点均指 jsx**）
- 上游登记：`OfficePreview.report.md` §3.2/§6（[E7] 锚点）；`COVERAGE-LEDGER.md` §f.3 表行 269、§c 第 3 项
- 前序批次：`LegacyDocEngineB.report.md`（批 B：[E7] 骨架/分页链/最终 JSX 逐字 ~2,777 行；交互回调簇仅锚点登记）；`LegacyDocEngineBPageRenderer.tsx`（934 行骨架）
- 本批产物：`LegacyDocEngineC3.tsx`（前半）+ `LegacyDocEngineC4.tsx`（后半）+ 本报告
- 并行约束：与批次 B5-08（jsx 18106–24337）行号互斥，本批仅覆盖 jsx 27889–35407，无越界

---

## 1. 产物清单

| 文件 | 行数 | 覆盖区段（jsx） | 内容 |
|---|---|---|---|
| `LegacyDocEngineC3.tsx` | 5,317 | 27889–31876 | 交互回调簇前半：页节/快照面、虚拟化页窗、测量回灌、表格选区/指针、右键菜单、DOM 选区助手、选区会话、指针拖选、键盘、光标导航、草稿、撤销/输入、表格几何、缩放面（含 No 收尾 31873–31876） |
| `LegacyDocEngineC4.tsx` | 4,110 | 31877–35407 | 交互回调簇后半：节区图片交互/图片拖放/包裹段落渲染器/runs 渲染器/拖放导入/单元格切片布局/fs 节点渲染器/ps 页流渲染器/脚注簇 |
| `LegacyDocEngineC34.report.md` | 本件 | — | 覆盖清单、边界裁决、验证记录、符号表 |

合计 9,427 行重建代码，实体化批 B 骨架中仅锚点登记的交互回调簇余量（~6,300 行区段：27889–35407）。

---

## 2. 覆盖清单（符号 → jsx 行 → 产物行）

### 2.1 C3（jsx 27889–31876，语义重建口径：顶层符号语义名 + 映射表）

C3 符号→jsx 行的完整清单见 `LegacyDocEngineC3.tsx` 文件头 §A 与文件尾符号表（分 17 个面）。摘要（语义名=混淆名(jsx 行)）：

- 页节/快照面：`firstPageIndexByNodeIndex`=ar(27893 起) … `pageSectionInfoByIndex`=or(27900) …（详见 C3 §A）
- 表格选区/指针面：`tableHitTest`=zi(28921) `nearestTableAtPoint`=Bi(28928) `handlePointerMoveCapture`=Vi(28940) `selectWholeTable`=Ui(28948) `computeTableDropTarget`=Wi(28959) `beginTableMove`=Gi(28996)
- 右键菜单状态面：`closeTableContextMenu`=Ki(29063) `openTextContextMenu`=Ji(29069) `openTableContextMenu`=Yi(29077) `runTableAction`=Xi(29084) `tableContextMenuActions`=Zi(29114) `resolveTableMenuCell`=Qi(29115) + menu-dismiss-effect(29133) + 守卫 effects(29146/29150/29153)
- DOM 选区助手面：`placeCaretInHost`=$i(29166) `setTextRangeInElement`=ea(29276) `boundaryToDomPoint`=oa(29389) `applyDomSelection`=sa(29395) `restoreSelectionAfterEdit`=ca(29455) `wrappedParagraphHit`=la(29510) `selectAllContent`=ua(29523) `domPointToBoundary`=da(29540) `boundaryAtPoint`=fa(29583) `selectionFromDom`=pa(29676) `syncActiveTextRangeFromDom`=ma(29690) `scheduleSelectionSync`=ha(29715) + dom-selection-restore-effect(29723)
- 选区会话面：`hasSelectionInside`=ga(29766) `restoreCaretAtX`=_a(29773) `ensureSelectionAfterTap`=va(29795) `cancelPointerSession`=ya(29821) `clearTransientSelections`=ba(29824) `beginWrappedEditing`=xa(29827) `focusWrappedTextarea`=Sa(29862) `commitWrappedText`=Ca(29882) `focusParagraphNode`=wa(29888) `selectDropCap`=Ta(29893) `scheduleCollapsedSelectionSync`=Ea(29897) + history-restore-effect(29902) + selectionchange-effect(29977) + pointer-session-effect(30012)
- 指针拖选面：`beginTextDragSelection`=Da(30039) `tableCellAtPoint`=Oa(30088) `beginTableCellDragSelection`=ka(30090) `handlePointerDownCapture`=Aa(30143) `handleContextMenu`=ja(30161)
- 键盘面：`handleTableSelectionDelete`=Ma(30195) `handleKeyDownCapture`=Na(30211) `handleKeyUp`=Pa(30252) `deleteExpandedSelectionFromKey`=Fa(30255) `replaceSelectionWithText`=Ia(30286)
- 右键菜单动作面：`contextMenuActionsFor`=La(30306) `runContextMenuAction`=Ra(30385) + delete-keydown-effect(30673) + guard-effects(30707-30745)
- 光标导航面：`focusParagraphAtOffset`=za(30747) `focusTableCellParagraph`=Ba(30776) `focusLocationAtOffset`=Va(30789) `placeCaretAtPointInLocation`=Ha(30793) `focusParagraphEnd`=Ua(30813) `selectionOffsetsInHost`=Wa(30824) `caretPointOfCollapsed`=Ga(30851) `tableParagraphUnderSelection`=Ka(30866) `syncTableCellTextRange`=qa(30884) `syncParagraphTextRange`=Ja(30902)
- 草稿面：`commitTableCellDraft`=Ya(30924) `registerCellDraftElement`=Xa(30935) `cellParagraphDraftElement`=Za(30938) `registerCellParagraphDraftElement`=Qa(30939) `unregisterCellParagraphDraftElement`=eo(30941) `commitCellParagraphDraft`=no(30943) `registerSectionDraftElement`=ao(30957) `sectionParagraphDraft`=oo(30960) `setSectionParagraphDraft`=so(30961) `deleteSectionParagraphDraft`=co(30963) `commitSectionParagraphDraft`=lo(30965) `captureSectionParagraphDraft`=uo(30980) `flushSectionParagraphDrafts`=fo(30986) `finishHeaderFooterSession`=po(30996) `endHeaderFooterSession`=ho(31001) + export-transformer-effect(31010)
- 撤销/输入面：`handleUndoRedoKeys`=_o(31073) `handleBeforeInput`=vo(31083) + beforeinput-listener-effect(31334)
- 表格几何面：`resolveColumnWidthsRender`=yo(31341) `resolveRowHeightsRender`=bo(31346) `resolveColumnWidthsDraft`=xo(31352) `resolveRowHeightsDraft`=So(31359) + row-height-measurement-effect(31374)
- 缩放面：`normalizeRowHeightsForResize`=Co(31451) `distributeRowHeights`=wo(31453) `beginColumnResize`=To(31479) `beginRowResize`=Eo(31524) `beginColumnResizeDraft`=Do(31565) `beginRowResizeDraft`=Oo(31606) `beginImageResize`=ko(31646) `beginImagePointerMove`=Ao(31675) `beginDropCapMove`=Mo(31820) `beginDropCapResize`=No(31847，收尾至 31876)

### 2.2 C4（jsx 31877–35407，逐字口径：保留源混淆标识符 + §0 declare 契约）

| 混淆名 | 语义名（§A） | jsx 行 | C4 行 |
|---|---|---|---|
| Fo | beginSectionImagePointerMove | 31877 | 531 |
| zo | selectSectionImageOnTap | 31949 | 604 |
| Vo | handleImageDragStart | 31952 | 608 |
| Ho | handleImageDragEnd | 31959 | 616 |
| Uo | beginCornerResize | 31962 | 620 |
| Wo | beginCornerResizeDraft | 32011 | 670 |
| Go | beginEmbeddedTableMove | 32060 | 720 |
| Ko | tableInteractionContext | 32099 | 760 |
| qo | commitImageDrop | 32126 | 788 |
| Jo | renderImageDropZone | 32146 | 809 |
| Yo | renderWrappedParagraph | 32174 | 838 |
| Xo | renderParagraphRuns | 32506 | 1171 |
| Zo | dataTransferHasFiles | 33516 | 2182 |
| Qo | findDocxFileInTransfer | 33517 | 2184 |
| $o | handleRootDragEnter | 33518 | 2186 |
| es | handleRootDragLeave | 33533 | 2202 |
| ts | handleRootDrop | 33536 | 2206 |
| （window 级拖放监听 effect） | — | 33545 | 2216 |
| ns | minCellContentWidthPx | 33572 | 2244 |
| rs | documentFontFamily | 33573 | 2246 |
| is | pageSurfaceStyle | 33574 | 2248 |
| as/os/ss/cs | 布局缓存 refs（as→as_） | 33586–33589 | 2261–2264 |
| （布局缓存清理 effect） | — | 33590 | 2266 |
| ls | cellLayoutSignature | 33593 | 2270 |
| us | cellSliceLayoutEntries | 33600 | 2278 |
| ds | renderTableCellSlice | 33726 | 2405 |
| fs | renderNode | 33824 | 2504 |
| ps | renderPageFlow | 35044 | 3725 |
| ms/hs | footnotes/endnotes 数据 | 35332–35333 | 4014–4015 |
| gs/_s/vs/ys | 脚注/尾注索引 | 35334–35337 | 4017–4020 |
| bs | footnoteRefsByPage | 35338 | 4022 |
| xs | orderedEndnotes | 35348 | 4033 |
| Ss | referencedFootnoteIds | 35360 | 4046 |
| Cs | unreferencedFootnotes | 35368 | 4055 |
| ws | renderFootnoteParagraphs | 35369 | 4057 |
| Ts | sectionDraftHandlers | 35391 | 4080 |
| Es | beginHeaderFooterEdit | 35398 | 4088 |

C4 hook 返回面共 41 个符号（上表全部），供批 B 最终 JSX（jsx 35408–36416）接线消费。

---

## 3. 边界裁决（与批 B 骨架 / 并行批次）

1. **批 B 骨架区（jsx 27340–27888）**：props/状态/refs 声明归批 B `LegacyDocEngineBPageRenderer.tsx`。本批未改动批 B 任何文件。
2. **批 B 未登记 refs（契约差异，仅记录）**：
   - `Z`（jsx 27416，`b.useRef(null)`，拖拽图片节点引用）——批 B 骨架未登记；C3 以 core 字段 `draggedImageRef: Z` 消费（图片移动/拖放链必需）。
   - `Ot`（jsx 27487，`b.useRef(void 0)`，包裹段落指针选区会话引用）——批 B 骨架未登记；C4 以 core 字段 `wrappedParagraphPointerSessionRef: Ot` 消费（Yo 包裹段落拖选必需）。
   - 集成时需在 DocxEditorView 组装层将这两个 ref 注入 core；批 B 文件保持原样。
3. **C3↔C4 接缝**：No（beginDropCapResize）收尾 31873–31876 已在 C3 转录（C3:5117–5120）；C4 自 Fo（31877）起。无重叠、无缺口。
4. **C3→C4 跨段消费（经 core，接口面兼容）**：`resolveColumnWidthsRender`=yo(31341)、`tableParagraphUnderSelection`=Ka(30866)、`beginDropCapMove`=Mo(31820)、`beginDropCapResize`=No(31847)、`paginationKick`=Pn、`scheduleAnnotationEpoch`=Fn、`boundaryAtPoint`=fa(29583，C4 以 §0 declare 挂接)。均为 C3 返回面成员，集成时注入同名绑定即可。
5. **与 B5-08 互斥**：本批行号全部位于 27889–35407；B5-08 为 18106–24337，无交集。C4 §0 中落在 B5-08 区段的模块级助手（Eh 18454、tg 18759、E_ 20244、j_ 20269、wv 21104、cx 23791、Jx 24230、Yx 24241）仅以 `declare const X: any` 契约挂接，不转录实体，归属由属主批负责。
6. **最终 JSX（jsx 35408–36416）**：归批 B 逐字覆盖；其消费的渲染器/回调（Yo/Xo/ds/fs/ps/ws/Ko/Jo/qo/Ts/Es 等）由 C4 返回面供给，接线为下游集成任务（见 §7）。

---

## 4. 重建口径与偏差登记

### 4.1 共同约定
- 类名、字符串常量（反引号模板）、data-* 属性、分支结构零改动。
- `b.useCallback/useMemo/useEffect/useRef` → `React.*`（唯一机械替换）。
- 文件头「混淆名→语义名」映射表 + 文件尾符号表；把握度分级见各件文件头。

### 4.2 C3 口径
- 顶层符号语义重命名（批 B 体例），函数体内局部变量名从源；跨段助手以 declare/core 字段挂接。
- strict 所需最小类型标注：参数 `: any`、`Array.from(...) as Element[]`、`new Map<any, number>(...)`、`as DocxLocation`、`as number`、演化 let 标注等（与批 B 体例一致）。

### 4.3 C4 口径（渲染密集区段特化，已登记）
- 顶层符号与局部变量**一律保留源混淆标识符**，语义解析仅在 §A/符号表/本报告；跨模块助手以 §0 `declare const X: any`（316 项）挂接。目的：3,500+ 行渲染器 JSX 零改写逐字保真。
- **逐行回代实测：3530/3531 行（99.97%）归一化后与 jsx 孪生逐字一致**（归一化 = 剥离 TS 专属标注，见 §5.3）。

### 4.4 偏差清单（全部为 TS strict/TSX 语法所必需，运行时行为不变）
| 偏差 | 位置 | 说明 |
|---|---|---|
| `as` → `as_` | jsx 33586/33591/33626/33650（4 处） | `as` 为 TSX 保留字，不可作标识符 |
| Xo 第 4 参可选 `i?: any` | jsx 32506（唯一非逐字行） | 源调用点（33799/34600 族）按 3 实参调用，JS 语义等同 |
| 参数 `: any` 标注 238 处 | 全 C4 | TS7006/TS7034 门禁所需；其中 70 处无括号箭头参数补括号 `(e: any) =>` |
| `t!`/`e!` 非空断言 10 处 | jsx 34658 族 ref 回调闭包（C4:2668、3317–3348） | React ref 回调参数类型含 null；闭包内窄化丢失 |
| `(t.nativeEvent as any)?.isComposing` 3 处 | jsx 对应 C4:1021/2705/3341 | React 类型中 `nativeEvent: Event` 无 `isComposing` |
| `Array.from(e.querySelectorAll(t)) as Element[]` 1 处 | C4:2460 区 | strict 下 `Array.from(any)` 推断为 `unknown[]` |
| `.find((e: any) => ...)` 1 处 | Qo（jsx 33517） | 同上 |
| 演化数组 `let n: any[] = []` 2 处 | bs/xs（jsx 35338/35348 族） | `: any` + `[]` 初始化在 strict 下仍被窄化为 `never[]` |

---

## 5. 验证记录（四项门禁）

### 5.1 门禁 1：esbuild 解析
```
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/LegacyDocEngineC3.tsx --loader:.tsx=tsx --jsx=preserve  → 0 错
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/LegacyDocEngineC4.tsx --loader:.tsx=tsx --jsx=preserve  → 0 错
```

### 5.2 门禁 2：tsc strict
- `/tmp/tsconfig.LegacyDocEngineC3.json` / `/tmp/tsconfig.LegacyDocEngineC4.json`（strict、ES2022、lib ES2022+DOM+DOM.Iterable、jsx preserve、module ESNext、moduleResolution Bundler、noEmit、skipLibCheck、typeRoots → `web/node_modules/@types`、types [react, react-dom, node]、paths react/react-jsx-runtime/react-dom → `web/node_modules/@types/*`、include 仅该产物）。
- `web/node_modules/.bin/tsc -p <config>`：C3 → **0 错**；C4 → **0 错**（迭代 4 轮：317 → 238 处自动标注 → 19 → 0）。

### 5.3 门禁 3：锚点回代（≥8，逐字命中）

回代方法：对 jsx 孪生行施加唯一机械变换（`b.use*`→`React.use*`；C4 另含 `as`→`as_`），对产物行剥离 TS 专属标注（`: any`/`: any[]` 标注、`(e: any) =>` 括号、`!` 断言、`as X[]` 投射、`Map<any, number>`），逐行精确匹配。

**C3 锚点（13 处，全部唯一命中）：**

| jsx 行 | C3 行 | 内容（截断） |
|---|---|---|
| 27899 | 742 | `if (!(!Number.isFinite(t) \|\| t <= 0)) return Math.max(1, Math.round(t));` |
| 28309 | 1216 | `n(e => e?.startPageIndex === s && e?.endPageIndex === c ? e : {` |
| 28690 | 1662 | `u = Math.max(16, Math.min(Math.round(o.pageHeightPx * 0.12), Math.round(` |
| 28800 | 1776 | `previousConsecutivePasses: St.current.consecutivePasses,` |
| 29090 | 2109 | `e.insertTableRow(r.tableIndex, r.rowIndex, \`above\`);` |
| 29498 | 2552 | `(e === 0 \|\| !i && e < 4) && (i \|\| t?.removeAllRanges(), Rn(n, () => {` |
| 29898 | 2993 | `we.current !== null && window.clearTimeout(we.current), we.current = win…` |
| 30318 | 3450 | `disabled: (e.id === \`cut\` \|\| e.id === \`copy\`) && !n` |
| 30704 | 3838 | `return window.addEventListener(\`keydown\`, t, !0), () => {` |
| 31089 | 4296 | `dataTransferText: t.dataTransfer?.getData(\`text/plain\`)` |
| 31100 | 4307 | `o = n == null ? NaN : Number.parseInt(n, 10),` |
| 31664 | 4902 | `p = Math.max(24, Math.round(s + (Math.abs(t) > Math.abs(n) ? t : n))), m…` |
| 31733 | 4973 | `x = !0, Z.current = n, je(!0), Ne(void 0);` |

**C4 锚点（14 处，全部命中；全量回代 3530/3531 = 99.97%）：**

| jsx 行 | C4 行 | 内容（截断） |
|---|---|---|
| 31950 | 605 | `k \|\| !bn \|\| bn.region !== e.region \|\| bn.partName !== e.partName …` |
| 31957 | 613 | `Z.current = t, je(!0), Fe(t), Ne(void 0), e.dataTransfer.effectAllowed…` |
| 32075 | 735 | `!t \|\| t.embeddedTableKey !== n \|\| e.pointerId !== t.pointerId \|\| M…` |
| 32105 | 766 | `resolveRowHeights: (e, t) => So(e, t),` |
| 32138 | 800 | `cellIndex: t.cellIndex,` |
| 32166 | 829 | `borderLeft: n ? \`2px solid #0f172a\` : \`2px solid transparent\`,` |
| 32335 | 999 | `}>{l}{y.map((e, t) => (0, $.jsx)(\`span\`, {` |
| 33584 | 2258 | `overflow: Q \|\| Je ? \`visible\` : \`clip\`` |
| 33591 | 2267 | `as.current.clear(), os.current.clear(), ss.current.clear(), cs.cur…`（C4 中为 as_） |
| 33780 | 2459 | `width: w.imageWidthPx ?? 12,` |
| 34100 | 2780 | `if (ya(), Ax(r)) {` |
| 35100 | 3781 | `f = s?.nodeIndex,` |
| 35393 | 4082 | `readDraftHtml: oo,` |
| 35403 | 4093 | `region: t,` |

全量统计：C4 区段 3,531 行中 3,530 行归一化后逐字命中（唯一例外 = jsx 32506 Xo 签名行，见 §4.4）；C3 区段 3,984 行中 2,962 行（74.35%）逐字命中，其余为语义重命名行/类型标注行（字符串、类名、分支结构仍零改动，重命名对照见 C3 §A/符号表）。

### 5.4 门禁 4：报告完整性
本文件含覆盖清单（§2）、边界裁决（§3）、口径与偏差（§4）、验证记录（§5）、符号表索引（§6）、遗留问题（§7）。

### 5.5 out/ 只读抽验
```
md5 desktop/src/out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
= cfa43c9f7be31ca608214e29ea1419ea   （与基线一致，未改动）
```

---

## 6. 符号表

- C3：完整符号表见 `LegacyDocEngineC3.tsx` 文件尾（17 个面，语义名=混淆名(jsx 行)），映射表见文件头 §A；类型导出 `DocxEditorViewInteractionCore` / `DocxEditorViewInteractionSurface`。
- C4：完整映射见 `LegacyDocEngineC4.tsx` 文件头 §A（含把握度分级），§0 为 316 项跨段/跨模块 `declare const` 契约；类型导出 `DocxEditorViewRenderSurface`（41 成员返回面）。
- 汇总（C4 顶层符号 ↔ 语义名 ↔ jsx 行）已在 §2.2 表中给出。

---

## 7. 遗留问题清单

1. **最终 JSX 接线**：批 B 最终 JSX（jsx 35408–36416）对 C4 返回面 41 符号的消费尚待在 DocxEditorView 组装层接线（下游集成任务，非本批范围）。
2. **批 B 未登记 refs**：`Z`（jsx 27416）与 `Ot`（jsx 27487）需在集成层注入 core（§3.2）；批 B 文件未改动。
3. **C4 §0 any 契约 316 项**：集成时替换为各属主模块的类型化导入（[E1]–[E6] 助手、批 B 布局/文本助手、C3 交互面）。
4. **Xo 签名行（jsx 32506）** 为 C4 唯一非逐字行（第 4 参可选化），运行时行为与源一致。
5. **`as` → `as_`** 4 处（TSX 保留字），集成接线时对外键名不受影响（内部 ref）。
6. C3 行级逐字率 74.35%：非命中行均为符号语义重命名/类型标注所致（批 B 体例要求），字符串/类名/分支结构零改动；如需 100% 行级对照可依据 C3 §A 映射表逐行复核。
