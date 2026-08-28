# Office 预览族解混淆报告（docx / legacy-doc / pptx 预览 · D8 Stage B2）

- 输入（均未修改）：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/` 下
  1. `previewPaneOfficeDocxContent-3JqWt7cf.js`
  2. `previewPaneOfficeLegacyDocContent-HWD4EOEM.js`（47,538 行）
  3. `pptxRendererPreviewEngine-BIIRLBue.js`（55,447 行自研引擎）
  4. `pptx-preview-viewer-B1z6CWke.js`
  5. `presentationPdfPrintExport-CsVZM-dn.js`
- 对照：`src-reconstructed/renderer/assets/` 同名 `.jsx`（pretty-print + JSX 还原版；**所有行号锚点均指 jsx**）
- 上游对照：`src-reconstructed/modules/VENDOR-MANIFEST-LIBS.md`（docx-preview 0.4.0、JSZip 3.10.1、docx-core wasm 等）
- 产物：`src-reconstructed/modules/` 下 11 个重建文件（见 §1）

---

## 1. 产物清单（每 chunk 一个 .tsx；pptx 引擎按子模块拆）

| 目标 chunk | 重建文件 | 行数 | 说明 |
|---|---|---|---|
| previewPaneOfficeDocxContent-3JqWt7cf | `previewPaneOfficeDocxContent.tsx` | 328 | vendor 登记 + 包装层全量重建 |
| previewPaneOfficeLegacyDocContent-HWD4EOEM | `previewPaneOfficeLegacyDocContent.tsx` | ~930 | vendor/引擎段登记 + 公共层全量重建（见 §4.2 边界说明） |
| pptxRendererPreviewEngine-BIIRLBue | `pptxRendererPreviewEngine.tsx` + 6 子模块 | 2,480 + 14,700 | 按依赖分层拆 7 文件（见 §4.3） |
| pptx-preview-viewer-B1z6CWke | `pptxPreviewViewer.tsx` | ~1,135 | 全量重建 |
| presentationPdfPrintExport-CsVZM-dn | `presentationPdfPrintExport.tsx` | 513 | 全量重建 |

pptx 引擎子模块（依赖方向：types ← color/text/geometry ← render/charts ← 主文件，无环）：

| 文件 | 行数 | 覆盖源区段（jsx） |
|---|---|---|
| `pptxEngineTypes.ts` | 456 | 3589-3695, 3899-3907 + 3875-4984 的类型化 |
| `pptxEngineColor.ts` | ~880 | 4984-6242（颜色/25 种变换/填充/线型/渐变数据） |
| `pptxEngineGeometry.ts` | ~1,750 | 7263-10927（~80 预设逐式转录 + 复杂式锚点登记 + custGeom + 多区域） |
| `pptxEngineText.ts` | 1,244 | 6455-7458, 10928-11106（字体栈/段落/导航/文本体渲染+自适应） |
| `pptxEngineRender.ts` | 4,770 | 6243-6453, 11107-14492（形状/背景/图片/表格/组/EMF/pdfjs） |
| `pptxEngineCharts.ts` | 3,740 | 14494-14648, 41069-44265（OOXML 图表 → echarts 全类型） |
| `pptxRendererPreviewEngine.tsx` | 2,480 | 3263-3600, 3697-4984, 44266-44678 + presentationElementModel 附录 |

---

## 2. vendor 段登记（不逐字转录；行号 = jsx）

### 2.1 previewPaneOfficeDocxContent-3JqWt7cf.jsx（6,776 行）

| 段 | 内容 | jsx 行 | 上游对照 |
|---|---|---|---|
| V1 | JSZip 3.10.1（符号 `en`） | 6-3253 | VENDOR-MANIFEST-LIBS.md · JSZip 3.10.1 |
| V2 | docx-preview 0.4.0（`xt` defaultOptions 6636 / `wt` renderAsync 6671） | 3255-6677 | VENDOR-MANIFEST-LIBS.md · docx-preview 0.4.0 |
| F1 | 自研包装层（Tt 选项/Et 阴影/Ot 类名/kt fit 对比/At 组件） | 6679-6776 | 全量重建进 `previewPaneOfficeDocxContent.tsx` |

### 2.2 previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx（36,535 行）

| 段 | 内容 | jsx 行 | 上游对照 |
|---|---|---|---|
| V0 | PNG 编码器（DataViewWriter D 类 + CRC32 + IHDR/PLTE/tRNS/IDAT/IEND + Adam7；入口 `se`=encodePng） | 15-490 | 通用 PNG 编码库（zlib 走 V1 pako） |
| V1 | CJS 捆绑（`n()` 模块包装）：pako 491-2025 · UTIF 2026-3311 · react 19.2.7 CJS 3312-6646 · react-dom/server 19.2.7 CJS 6647-10294 · `Se` 汇总 10295-10300 | 491-10300 | VENDOR-MANIFEST-LIBS.md · pako/UTIF/react 19.2.7 |
| V2 | 动态依赖：`src-2FP7IUE6`（parseDocx）· `src-AEHDFCS5`（buildDocModel/ensureDocModelBlockIds）· `docx-import-worker-oPk-zLr5.js` · `docx_wasm_bg-HWnIvdMf.wasm` | jsx 1（mapDeps）, 11888, 11971-11975, 36460 | VENDOR-MANIFEST-LIBS.md · docx-core wasm |

### 2.3 pptxRendererPreviewEngine-BIIRLBue.jsx（44,678 行）

| 段 | 内容 | jsx 行 | 上游对照 |
|---|---|---|---|
| V1 | JSZip 3.10.1（符号 `s`） | 13-3262 | VENDOR-MANIFEST-LIBS.md · JSZip 3.10.1 |
| V2 | zrender + echarts（`lx`=zrender.graphic.LinearGradient 21575；`Ej`=echarts.init 28524） | 14650-41068 | echarts（图表运行时） |

重建侧以注入点替代：`registerJszip()` / `registerEchartsInit()`（主文件）与 `ChartLinearGradient` 结构等价物（charts 子模块）。

---

## 3. 每文件组件清单 + 把握度

把握度口径：**高** = 逐句对照转录并过严格类型检查；**中** = 结构/语义完整但局部细节（样式常量、兜底分支）经归纳；**登记** = 锚点级登记（不逐字转录，边界与职责已核实）。

### 3.1 previewPaneOfficeDocxContent.tsx —— 把握度：高

| 混淆名 | 语义名 | jsx 行 | 把握度 |
|---|---|---|---|
| `Tt` | DOCX_PREVIEW_OPTIONS（defaultOptions + 覆盖项） | 6679-6707 | 高 |
| `Et` | 阴影样式注入 | 6708-6720 | 高 |
| `Ot` | 渲染类名拼装 | 6721-6730 | 高 |
| `kt` | fit 视口/框架/内容三层 + 缩放对比 | 6731-6750 | 高 |
| `At` | `PreviewPaneOfficeDocxContent`（chunk 唯一导出） | 6751-6776 | 高 |
| — | `computeOfficeFitMetrics`（officeFilePreview-DDCn9-xI 的 t 导出） | 外 34 行 | 高（接口级 declare） |

### 3.2 previewPaneOfficeLegacyDocContent.tsx —— 把握度：公共层高 / 内部引擎登记

全量重建部分（§1-§5，均逐句对照）：

| 混淆名 | 语义名 | jsx 行 | 把握度 |
|---|---|---|---|
| `br/xr/Sr/Cr/wr/Tr` | wasm 源注册（`initAndRegisterDocxWasm` 等） | 11850-11879, 36460 | 高 |
| `Er..Nr` | DOCX 导入管线（`importDocx`：工作者优先 + 主线程回退 + 中止/计时） | 11880-11993 | 高 |
| `Pr..Rr` | 页面缺省常量（900×1200/56px/15twips） | 11994-12010 | 高 |
| `zr..Yr` | 页面几何（`parsePageGeometry`：pgSz/pgMar/docGrid/pgBorders → px） | 12011-12118 | 高 |
| `Xr..vi` | 图片路由/转换（TIFF→PNG via UTIF+encodePng；EMF/WMF 占位标记；缓存） | 12119-12252 | 高 |
| `DS` | `useDocxModel`（AbortController 守护的模型 hook） | 36417-36459 | 高 |
| `AS` | `docxModelKey`（WeakMap 稳定键） | 36463-36468 | 高 |
| `jS` | fit 度量近似相等判定 | 36469 | 高 |
| `MS` | `DocxFitViewport`（fit 三层 + ResizeObserver + ES 挂载） | 36470-36504 | 高 |
| `NS` | `PreviewPaneOfficeLegacyDocContent`（chunk 导出） | 36505-36533 | 高 |

接口级登记部分（公共契约已按用法还原；实现锚点登记）：

| 混淆名 | 语义 | jsx 行 | 把握度 |
|---|---|---|---|
| `tS` | 编辑器状态 hook（`createDocxEditor` declare） | 24338-27339 区段 | 登记 |
| `ES` | 页面渲染器（`DocxEditorView` props 全量 + 占位实现） | 27340-36416 | 登记 |
| [E1] | Unicode BiDi 引擎（Ee/De 表 + UAX#9 算法） | 10305-11176 | 登记 |
| [E2] | 文本测量与行布局 | 11177-11993 | 登记 |
| [E3] | 脚本/字体启发式（CJK/RTL 正则、语言判定） | 12253-13243 | 登记 |
| [E4] | DOCX XML → 编辑器模型（字段正则 + 段落/表格/编号转换） | 13244-14901 | 登记 |
| [E5] | 缩略图 | 14902-15113 | 登记 |
| [E6] | 编辑器核心（选区/历史/分页/修订） | 15114-27339 | 登记 |

> 边界说明：该 chunk 的自研内部引擎约 26,000 行（[E1]-[E7]），为单会话不可逐字完成之规模；
> 本件按族内既定先例（几何复杂预设/表格样式模板的锚点登记法）处理——公共层、wasm 桥、
> 导入管线、页面几何、图片管线、React 组件层全量重建，内部引擎以锚点 + 职责登记。
> 后续可按 [E1]-[E7] 锚点逐段展开。

### 3.3 pptx 引擎族（7 文件）—— 把握度：高（登记项除外）

`pptxEngineTypes.ts`（高）：`XmlNode`/`parseXml`/`parseRels`/`resolvePartPath`、单位换算（emuToPx/angleToDeg/permilleToUnit/ptToPx）、布尔解析、全部模型类型（主题/母版/版式/幻灯片/节点/渲染上下文）。

`pptxEngineColor.ts`（高）：hex/hsl 互转、25 种 DrawingML 颜色变换逐一转录（tint/shade/lumMod/lumOff/satMod/hueMod/hueOff/satOff/setLum/setSat/setHue/invert/grayscale/complement/gamma/invGamma…）、148 预设色表、方案色解析（含 clrMapOverride 链 + 缓存）、填充/渐变/图案/线型/主题填充解析。

`pptxEngineGeometry.ts`（高 + 登记）：~80 个预设几何逐式转录（含 arc/star/mirror 助手）；**登记项**：`DEFERRED_PRESET_GEOMETRY_ANCHORS` / `DEFERRED_MULTI_REGION_ANCHORS` 中 20 余个复杂预设（任意多段弧/公式繁复者）以 jsx 锚点 + 矩形兜底登记；多区域形状（actionButton 族/cube/foldedCorner/flowChartOfflineStorage）全量；custGeom 解析器（pathLst 全指令 + 公式求值）全量。

`pptxEngineText.ts`（高）：主题字体/别名展开、段落/运行样式解析、项目符号（含罗马数字）、超链接下划线判定、导航解析（ppaction/rel → 幻灯片序号）、`renderTextBody`（bodyPr/lstStyle 继承 + normAutofit 缩放 + 垂直书写）。

`pptxEngineRender.ts`（高）：
| 混淆名 | 语义名 | jsx 行 |
|---|---|---|
| `xo` | `renderShapeNode`（形状渲染主体：几何/填充/描边/箭头/效果/文本/链接） | 11863-12597 |
| `$n..dr` | `renderSlideBackground`（bgPr/bgRef 三级回退 + SVG 渐变 + blip 层） | 6243-6453 |
| `No..zo` | `parseEmf`（EMF 记录扫描：内嵌 PDF/DIB 位图） | 12609-12741 |
| `Bo..is` | pdfjs OffscreenCanvas 工作者（`PDFJS_WORKER_SOURCE` 逐字）+ 并发队列 + 超时 | 12742-12903 |
| `ls..Us` | `renderPictureNode`（视频/音频/裁剪/SVG clip/duotone/lum/biLevel 像素滤镜） | 12905-13435 |
| `Ws..dc` | 表格样式：84 项 GUID 表逐字 + 11 族构建器（Themed/Light/Medium/Dark） | 13436-13969 |
| `fc..bc` | `renderTableNode`（区域栈/填充/边框/单元格样式/文本） | 13970-14284 |
| `Oc/kc` | `renderGroupNode`（子坐标换算/翻转下传/90° 修正/饼图组合特判） | 14359-14492 |

`pptxEngineCharts.ts`（高）：序列/分类/格式代码提取（含空白索引、Excel 日期序列号）、轴解析 → echarts 轴配置、图例（含 DOM 自定义图例）、标题（富文本 rich）、数据标签（共享+逐点覆盖）、**全部 9 类构建器**：柱/条（堆叠/百分比堆叠/逐点着色/负值反色）、折线/面积（marker 轮转/平滑/空白连接）、饼/圆环（爆炸/引导线/多序列切片）、雷达（渐变面积）、散点（scatterStyle 六态）、气泡（√面积比例）、股票（K 线/三序列 custom 渲染）、双轴合并、零轴标签修正、`buildChartOptions` 总装、`renderChartNode`（ResizeObserver 自适应 + 实例回收）。

`pptxRendererPreviewEngine.tsx`（高）：
| 混淆名 | 语义名 | jsx 行 |
|---|---|---|
| `v..M` | `ZIP_LIMITS` + `openPresentationArchive`（限额核算/并发池/懒媒体解析器） | 3336-3598 |
| `ie/ae/oe` | `parseTheme`（配色/字体/四类样式列表） | 3697-3744 |
| `se..fe` / `_e..Se` | 母版/版式解析（占位符递归收集 + 组坐标换算） | 3745-3898 |
| `Ce..et` | 元素解析分派（形状/图片/表格/组/图表/SmartArt/OLE 预览图） | 4030-4570 |
| `rt/it/at` | 幻灯片解析/懒物化 | 4571-4624 |
| `dt` | `buildPresentationModel`（主题链/图表样式/幻灯片定序） | 4625-4790 |
| `ft..wt` | 占位符继承（类型回填/几何继承/布局 bodyPr） | 4791-4935 |
| `Tt` | `createRenderContext` | 4936-4982 |
| `bq` | `renderNode` 分派 | 44266-44283 |
| `Cq..Tq` | spTree 子节点缓存/离屏测量挂载 | 44433-44470 |
| `Eq` | `renderSlide`（背景→母版→版式→节点；句柄释放） | 44328-44432 |
| `Dq..Bq` | 文本条目收集（形状/表格单元格/组递归） | 44453-44578 |
| `Hq` | `PresentationPreviewDocument`（页元素缓存/渲染句柄/释放） | 44579-44669 |
| `Uq` | `pptxRendererPreviewEngine.open`（chunk 导出） | 44670-44678 |
| 附录 | presentationElementModel-r6vQ-JZl（buildSlideElements/hitTestElement，98 行全量） | 独立 chunk |

### 3.4 pptxPreviewViewer.tsx —— 把握度：高

| 混淆名 | 语义名 | jsx 行 | 把握度 |
|---|---|---|---|
| 几何/选择助手 | 命中测试/选区矩形/文本选择判定 | 1-180 | 高 |
| `SlideAiEditPopover` | AI 编辑浮层（元素级） | ~180-260 | 高 |
| `SlidePage` | 单页渲染（renderSlide 句柄 + 代际失效 + 错误回调） | ~260-420 | 高 |
| `SlideThumbnail` | 缩略图（缩放渲染） | ~420-470 | 高 |
| `useElementSize` | ResizeObserver 尺寸 hook | ~470-500 | 高 |
| `PptxPreviewViewer` | 主组件（懒加载引擎/键盘导航/缩放 fit×百分比/元素选择/PDF 导出） | ~500-613 | 高 |

### 3.5 presentationPdfPrintExport.tsx —— 把握度：高

| 混淆名 | 语义名 | jsx 行 | 把握度 |
|---|---|---|---|
| 宿主属性/字体探测/样式表 | 打印宿主构建（data-zcode-print-*、系统字体探测、@page 样式） | 1-160 | 高 |
| `renderPresentationToPrintHost` | 逐页 renderSlide → 打印宿主（句柄聚合释放） | 160-227 | 高 |

---

## 4. 交叉验证

- **上游清单**：docx-preview 0.4.0（`xt`/`wt` 签名与 defaultOptions 键集一致）、JSZip 3.10.1（两处 vendor 段 `loadAsync`/`async("uint8array"|"string")` API 一致）、docx-core wasm（`docx_wasm_bg-HWnIvdMf.wasm` + `import-docx` 工作者协议 `{id, type, buffer, wasmSource}`）、react/react-dom 19.2.7（legacy chunk CJS 段 `e.version = "19.2.7"`）。
- **chunk 导出名**：`export { NS as PreviewPaneOfficeLegacyDocContent }`、`export { Uq as pptxRendererPreviewEngine }`、docx chunk 的 `At` 导出均与输入 js 尾部导出表一致。
- **跨文件契约**：`pptxPreviewViewer` 的 `PptxDocument` 接口与引擎 `PresentationPreviewDocument`（pageCount/pageSize/getPageElements/renderPage/dispose）逐成员对齐；`SlideElement` 联合类型（含 `table-cell` 虚拟类型）两侧一致。

## 5. 验证记录

- esbuild 0.21.5（`--loader:.tsx=tsx --jsx=preserve --outfile=/dev/null`）：11 个文件全部解析通过。
- tsc 5.6.3 `--noEmit --strict --target esnext --lib esnext,dom,dom.iterable --jsx preserve --skipLibCheck`（@types/react 18.3.31）：**11 个文件 0 错误**。
- `out/` 未做任何修改；全部产物位于 `src-reconstructed/modules/`。

## 6. 后续建议

1. legacy-doc 内部引擎 [E1]-[E7] 按锚点逐段展开（优先 [E4] DOCX XML→模型 与 [E7] 页面渲染器）。
2. 几何登记项（`DEFERRED_PRESET_GEOMETRY_ANCHORS`）按锚点补全复杂预设公式。
3. 引擎注入点接线：`registerJszip` / `registerEchartsInit` / `initAndRegisterDocxWasm` 在应用装配处绑定真实 vendor 实现。
