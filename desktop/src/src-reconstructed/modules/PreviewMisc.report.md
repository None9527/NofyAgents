# PreviewMisc 族恢复报告（PDF / diff / 高亮代码 组件族 · D8 Stage B2）

- 任务：解混淆 ZCode 恢复版 **PDF/diff/高亮代码族**（VENDOR-MANIFEST-LIBS.md「Stage B 抽取队列」中的 3 个含包装层 chunk）
- 恢复日期：2026-08-26
- 输入（均**未修改**，只读）：
  - `/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/pdf-viewer-m6YcRb_5.js`（21,205 行）
  - `/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/highlighted-body-OFNGDK62-RS9ZmWFH.js`（25 行）
  - `/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/diffs.worker-CAavpt0L.js`（10,697 行）
  - jsx 对照：`src-reconstructed/renderer/assets/{同名}.jsx`（18,930 / 43 / 10,142 行）
- 产物：
  - `src-reconstructed/modules/PdfViewer.tsx`（pdf-viewer 自研包装层全量重建）
  - `src-reconstructed/modules/HighlightedCodeBlock.tsx`(代码块高亮族全量重建)
  - `src-reconstructed/modules/DiffsWorker.tsx`（diff worker 自研引擎全量重建）
- 标样：`TopBar.tsx` 格式（头注映射表 + declare 外部依赖 + 全量 JSX/TS 重建 + 尾部 SYMBOLS 表）
- 上游对照：`node_modules/{pdfjs-dist@5.4.296, react-pdf@10.4.1, streamdown@2.5.0, shiki@3.23.0}`、VENDOR-MANIFEST-LIBS.md

---

## 1. 组件/模块清单（混淆名 → 语义名，含行号）

### 1.1 PdfViewer.tsx ← pdf-viewer-m6YcRb_5.js

自研段 **js 20821–21205**（jsx 18642–18929）全量重建；其余 20,820 行为 vendor（§2.1 登记）。

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `Go` | `PdfViewer`（导出） | 20956–21204 | 18774–18929 | 主组件：翻页/缩放/工具条 |
| `Io` | `useStageZoomOverlay` | 20868–20909 | 18693 | 缩放快照遮罩钩子（canvas 翻拍） |
| `Ho` | `RangeSourcePDFDataRangeTransport` | 20920–20936 | 18743 | 范围源 → pdfjs 传输适配 |
| `Vo` | `isRangeSource` | 20917 | 18740 附近 | {requestRange} 鸭子判定 |
| `Wo` | `normalizePdfSource` | 20948–20954 | 18767 | string/Blob/ArrayBuffer/TypedArray 归一 |
| `Uo` | `DEFAULT_PDF_VIEWER_LABELS` | 20937–20946 | 18757 | 英文兜底文案 8 条 |
| `Lo` | `buildCMapOptions` | 20910–20913 | 18724 | cMapUrl/cMapPacked |
| `zo`/`Bo` | `CMAP_DOCUMENT_OPTIONS` / `RANGE_DOCUMENT_OPTIONS` | 20915–20916 | 18732 段 | getDocument options |
| `Ro` | `RANGE_CHUNK_SIZE = 256KB` | 20914 | 18732 | |
| `To` | `PDF_WORKER_SRC` | 20821 | 18642 | pdf.worker.min-qwK7q_zL.mjs |
| `Eo/Do/Oo` | `ZOOM_STEP` / `MIN_ZOOM` / `WHEEL_ZOOM_SENSITIVITY` | 20822–20824 | 18643 | 0.25 / 0.25 / 0.002 |
| `ko/Ao/jo/Mo/No/Po/Fo` | `clampZoom` / `clamp` / `memoizedSize` / `scaleSize` / `zoomOverlayStyle` / `resolveZoomAnchorPoint` / `applyScrollPreservation` | 20825–20867 | — | 缩放引擎纯函数 |

### 1.2 HighlightedCodeBlock.tsx ← highlighted-body-OFNGDK62-RS9ZmWFH.js + 宿主 chunk-BO2N2NFS-CSNAeaxF.js

目标 chunk 整体为 **vendor streamdown@2.5.0**（逐行对照上游 dist 确认，把握度高）；外壳族位于宿主
chunk（= 上游 dist/chunk-BO2N2NFS.js）。本文件把整族重建为可读源码。

| 混淆名 | 语义名 | 上游名 | 宿主 chunk js 行 / jsx 行 |
|---|---|---|---|
| 目标 chunk `c` | `HighlightedCodeBlockBody`（导出） | `R` | 目标 chunk 1–25 / 1–43 |
| `Iv` | `HighlightedCodeBlock` | `st`（导出别名 g） | 18660 / 15513 |
| `Fv` | `LazyHighlightedCodeBlockBody` | `cr`（lazy） | 18650 / 15510 |
| `kv` | `CodeBlockBody`（memo） | `At`（导出别名 c） | 18522–18614 / 15458–15482 |
| `Av` | `CodeBlockShell` | `ot` | 18615 / 15483 |
| `Nv` | `CodeBlockHeader` | `rt` | 18629 / 15498 |
| `Pv` | `trimTrailingNewlines` | `lr` | 18638 / 15504 |
| `jv`/`Mv` | `CodeBlockCodeContext` / `useCodeBlockCode` | `nt`/`He` | 18627–18628 / 15494–15497 |
| `Dv`/`Ov` | `LINE_NUMBER_CLASS` / `parseInlineStyle` | — | jsx 15445–15457 |
| `Xb` | `StreamdownOptionsContext` | `R`（导出别名 A） | 21176 / 17235 |
| `ty`/`ny`/`ry` | `CodeHighlighterContext` / `useCodeHighlighterContext` / `useCodeHighlighter` | `Ve`/—/`Li` | 19610–19612 / 16111–16113 |

### 1.3 DiffsWorker.tsx ← diffs.worker-CAavpt0L.js

自研段 **js 9172–10697**（jsx 8660–10142）全量重建（含 343 条扩展名→语言映射表逐字转录）；
其余 9,171 行为 vendor（§2.3 登记）。共 **44+ 个自研符号**，分组如下（完整映射见文件头 §二）：

| 分组 | 符号（原 → 语义） |
|---|---|
| 注册表 | `rl/il/al` resolvedLanguageMap/loadedLanguageNames/loadResolvedLanguages；`ol/sl/cl` resolvedThemeMap/loadedThemeNames/loadResolvedThemes；`Z/ll` customExtensionMap/customExtensionsVersion；`ul` EXTENSION_TO_LANGUAGE(343 条)；`dl` resolveLanguageForFileName；`fl` setCustomExtensions |
| hast 工具 | `pl` stripTrailingNewline；`ml/hl` hastText/hastElement；`gl` findCodeElement；`_l` processLine（data-line 四件套）；`vl/yl` NO_TOKEN/MULTIPLE_TOKENS；`bl` groupTokensByCharPosition；`xl/Sl/Cl` getCharPosition/clearCharPositions/setCharPosition |
| transformer | `wl` createDiffTransformers；`El` TOKEN_STYLE_NORMALIZER；`Q` cssVariablePrefix（`--diffs-token-`/`--diffs-`）；`Dl` buildThemeStyles；`Ol` buildThemeColorVars（gitDecoration.* → terminal.ansi* 兜底）；`kl` getLineNodes；`Tl` styleToClassTransformer（vendor，classPrefix 'hl-'） |
| diff 迭代器 | `Al` iterateOverDiff（unified/split/both 窗口化 + 折叠上下文）；`jl` resolveCollapsedRange；`Ml` hasTrailingContext；`Nl` computeChangeRanges；`Pl` buildChangeItem；`Fl` createDiffSpanDecoration（data-diff-span）；`Il` appendDiffSegment |
| 渲染器 | `Rl` renderDiff；`zl` computeLineDecorations（char/word-alt 行内 diff）；`Bl` createHunkAccumulator；`Vl` highlightFilePair；`Gl` renderFile；`Hl` iterateLines；`Ul` splitLines；`Kl` joinLineSlice；`Ll/Wl` 窗口默认选项 |
| 消息处理器 | `Jl` handleWorkerMessage（initialize/set-render-options/file/diff）；`Yl/Xl/Zl/Ql` 四类请求处理；`$l` getOrCreateHighlighter（shiki-wasm→oniguruma，否则 JS 正则引擎）；`eu` applyCustomExtensions；`tu/nu/ru` postFileSuccess/postDiffSuccess/postErrorResponse；`ql/$` 单例/默认渲染选项 |

---

## 2. vendor 段登记（不逐行转写，行号范围 + 上游 + 锚点）

### 2.1 pdf-viewer-m6YcRb_5.js（vendor 20,820 行 / 全文件 98.2%）

| 行范围 (js) | 上游 | 版本 | 锚点 |
|---|---|---|---|
| 10–19411 | pdfjs-dist（build/pdf.mjs 全量） | 5.4.296（in-chunk 10531/11857） | `h` 导出命名空间(10)、`Gn` GlobalWorkerOptions(9066)、`Dr` TextLayer(10221)、`kr` getDocument(10459)、`Pr` PDFWorker(11122)、`Ci` AnnotationLayer(14358)、`qi` AnnotationEditorLayer(18685)、`globalThis.pdfjsLib`(19355–19411) |
| 19412–19457 | dequal（react-pdf 依赖） | — | `Zi` dequal（Document options 深比较 19880/19887） |
| 19458–19470 | make-cancellable-promise | — | `Qi`（包装 getDocument/getPage 等 5 处） |
| 19471–19569 | make-event-props | — | `$i…ha/_a` 事件名表、`va` makeEventProps |
| 19570–19598 | warning（CJS） | — | `ya` |
| 19599–20820 | react-pdf（dist/esm 全家桶） | 10.4.1（node_modules-ref） | `ba` DocumentContext、`Sa` LinkService、`Ca` Message、`qa` Document(19841)、`Xa` PageContext、`wo` Page(20610) |

构建差异注记：react-pdf 上游的 `clsx` 依赖在本构建中解析到 bundle-mjs chunk 的 `r` 导出
（= clsx 本体，tailwind-merge bundle 内含），调用语义不变。

### 2.2 highlighted-body-OFNGDK62-RS9ZmWFH.js（vendor 25 行 / 全文件 100%）

整文件 = streamdown@2.5.0 `dist/highlighted-body-OFNGDK62.js`（hash 前缀来自上游 rollup 构建，
ZCode Vite 仅追加内容哈希）。宿主侧代码块段（§1.2 表）同属 streamdown。ZCode 特有部分仅为：
主题资产 `pierre-dark/pierre-light`（styles chunk 16050–16070 注册）与 tailwind 设计令牌类名。

### 2.3 diffs.worker-CAavpt0L.js（vendor 9,171 行 / 全文件 85.7%）

| 行范围 (js) | 上游 | 锚点 |
|---|---|---|
| 10–~5160 | vscode-textmate + hast 生态 + @shikijs/core（Rollup 提升交错） | Grammar `_compilePatterns`(1000)、`tokenizeLine`(1666)、property-information 属性表(2640)、HTML 实体表(3500)、token 渲染(4600)、`Vi` createHighlighter(5424) |
| 5460–8177 | oniguruma-to-es + @shikijs/engine-javascript | 正则 AST 解析(5465+)、Subroutine `Ba`(6200)、ES2024/25 转换(7600)、`Xs` Scanner(8115)、`Qs` createJavaScriptRegexEngine(8178) |
| 8194–8545 | @shikijs/engine-oniguruma | `$s` ShikiError、`xc` createOnigurumaEngine(8533) |
| 8546–9098 | jsdiff（npm `diff`） | `Y` Diff 基类(8546)、`Cc` diffChars(8721)、`Lc` diffWordsWithSpace(8898)、structuredPatch(9049–9081) |
| 9099–9158 | @shikijs/transformers | `qc` style-to-class（name 串自证）+ `Jc` cyrb53 |
| 9159–9171 | vscode-oniguruma wasm（base64 内联，构建期定制*） | `Yc/Xc/Zc/Qc/$c`；blob 与 wasm-B4ap0Fdc.js 同源 |

\* 上游经 fetch/URL 载入 wasm，此处 atob 内联——重建保留接口（`ONIGURUMA_WASM_MODULE`），不转录数据。
注：shiki 版本参照 node_modules shiki@3.23.0 / @shikijs/*@4.0.2（VENDOR-MANIFEST 已登记）；
jsdiff 无版本串，API 面（diffWithOptionsObj/structuredPatch）与 diff 8.x 一致。

---

## 3. 边界判定与交叉验证

1. **函数体边界**：压缩版每语句一行，自研段每个符号用相邻顶层声明定界；双行号（js/tsx 对照 jsx）
   已逐一核对（`Go` 20956/18774、`Io` 20868/18693、`Al` 9779/9258、`Rl` 9669 附近/9669、`Jl` 10691/10010 等）。
2. **消费者验证**（均在 styles-CdEGpc2x.js，未改动）：
   - PdfViewer：`lVt` lazy PDF 预览（MODULE-MAP F14 副根，js 160323–161140）动态 import 本 chunk；
   - diffs.worker：`q6t` worker 工厂（211091，`name:'zcode-diffs-worker'`）、`J6t` 池大小
     （211097，hardwareConcurrency/2 夹取 1–4）、`X6t` DiffsWorkerPoolProvider（211124，
     codePreviewSettings.lightTheme/darkTheme → theme 对、lineDiffType='word-alt'、
     maxLineDiffLength=1000、tokenizeMaxLineLength=1000、useTokenTransformer=false）、
     `Y6t` 渲染参数同步（211102，中文日志 `[DiffsWorkerPoolProvider] 同步渲染参数失败`）、
     `XRe` useDiffsWorkerPool（46950）。请求构造面（46488/46616/46782）与 §三 协议逐字段吻合。
   - HighlightedCodeBlock：宿主 chunk MarkdownCode（jsx 16835 `<Iv …>`）；styles 的 `cj`
     Markdown 渲染器（MODULE-MAP F19）经宿主 chunk 复用。
3. **上游逐行对照**：
   - react-pdf 10.4.1：Document/Page/Canvas 源码核对（`onRenderSuccess(makePageCallback(page, scale))`
     证实 PdfViewer 的 `e.width / e.originalWidth` 用法）；
   - streamdown 2.5.0：highlighted-body 逐语句一致；chunk-BO2N2NFS.js 导出表
     `At as c / Li as f / R as A / st as g / ot as d / rt as e` 与本构建 `kv/ry/Xb/Iv/Av/Nv` 一一对应；
   - pdfjs-dist 5.4.296：版本串、GlobalWorkerOptions/PDFDataRangeTransport API 面核对。
4. **默认主题证据**：worker `nl={dark:'pierre-dark',light:'pierre-light'}` 与 styles chunk
   `Zc`（js 5234）一致，主题懒加载注册在 16050–16070。

## 4. 与既有产物的关系

- `highlightedCodeBlockBody.tsx`（B1 阶段对目标 chunk 的单体重建）与本族 `HighlightedCodeBlock.tsx`
  对 Body 的语义结论一致；本文件为族级交付物（外壳族 + Body），两者并存、互不冲突。
- VENDOR-MANIFEST-LIBS.md 对三个 chunk 的定性（含包装符号、版本证据）与本次逐行核对结果一致；
  其中 highlighted-body 的 tier 已由 B1 从 first-party 修正为 streamdown vendor（本次沿用）。

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| PdfViewer 自研段全部 17 个符号的 JSX/逻辑 | **高（逐字转录）** | 单声明压缩源码逐行还原；类名/常量/事件语义直读 |
| PdfViewer vendor 段定性（pdfjs/react-pdf/4 个小程序件） | **高** | 版本串 in-chunk + node_modules 逐文件对照（Document/Page/Canvas、dequal/make-cancellable-promise/make-event-props/warning 导入表） |
| HighlightedCodeBlock 族（含 Body） | **高（逐字转录）** | 与上游 streamdown dist 逐语句一致；导出表双向核对 |
| DiffsWorker 消息处理器 + 渲染器（44+ 符号） | **高（逐字转录）** | 压缩源码逐行还原；协议与主线程请求构造面（46488–46783）逐字段互证 |
| DiffsWorker `iterateOverDiff` 窗口/折叠语义 | **高** | 控制流逐分支转写；错误串（`trailing context mismatch`/`missing change line data`）逐字保留 |
| EXTENSION_TO_LANGUAGE 343 条 | **高（程序化转录）** | 从源 chunk 正则抽取，条目数与源文件 `: \`` 配对数（343）精确相等 |
| DiffsWorker vendor 段内部模块边界（§2.3 行范围） | **中高** | 锚点符号确凿；Rollup 提升致段间交错，范围为锚点包络近似 |
| TS props/接口类型 | **中高（推断）** | 由解构默认值与调用面归纳；跨 chunk 服务对象按消费面建模 |
| oniguruma wasm blob 内容 | **登记级** | 二进制数据不转录（与 wasm-B4ap0Fdc.js 同源，另见 VENDOR-MANIFEST） |

## 6. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`（esbuild via /home/none/grok-build/web）：
  **3/3 通过（0 错误）**。
- `tsc --noEmit --strict`（typescript 5.6.3，@types/react@18.3.31 环境，
  /tmp/verify-b2 临时副本，验证后清理）：**0 错误**。
  注：产物位于 zcode-restored（无 node_modules），故验证在临时副本进行；
  @types/react 为 18.x，PdfViewer 的 ref 类型按 18 语义收敛（运行时行为不受影响）。
- `out/` 目录未做任何修改（仅读取；git 状态确认无 out/ 下文件改动）。
- 本任务仅**新建**恢复产物，未编辑任何既有符号；本会话无 GitNexus MCP 工具可用，
  故未执行 `gitnexus_impact` / `gitnexus_detect_changes`（同 appUsageChartPalette 报告 §8 流程合规备注）。

## 7. 后续建议

1. PdfViewer 的消费侧 `lVt`（lazy PDF 预览包装，含 256KB 阈值与 i18n labels 注入）属 F14
   CodeViewerFamily，待该族抽取时引用本文件的 `PdfViewer`。
2. diffs.worker 的主线程侧（DiffsWorkerPool/useDiffsWorkerPool/`file:`/`file-diff:` 渲染器，
   styles chunk 17445–23919、46488–46950）属 F14，抽取时直接引用本文件的协议类型。
3. `pierre-dark/pierre-light` 主题资产（styles chunk 16050–16070 注册、独立主题 chunk）
   建议在 Markdown/shiki 族（F19）抽取时一并登记。
4. DiffsWorker vendor §2.3 的段间交错边界如需精确化，可在后续以 source-map 级工具复核
   （当前锚点包络对重建消费已足够）。
