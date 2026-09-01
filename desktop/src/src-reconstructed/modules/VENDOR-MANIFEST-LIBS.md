# VENDOR-MANIFEST-LIBS — ZCode 恢复版 renderer 第三方库 chunk 上游识别清单 (D8 Stage D2)

- 资产目录: `/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets`
- 生成日期: 2026-08-26
- 范围: `/tmp/chunk-tiers.json` vendor 项中除去 shiki 语法/主题 chunk；另收 4 个被误分到 grammar_data 的 mermaid chunk（tier 纠正）；另收 tiers 标为 first_party 但实际打包/包装第三方库、或任务点名的 chunk（chart-*、pdf-viewer、presentationPdf*、dist/esm/bundle 系）。
- 版本证据等级: `in-chunk`（chunk 内版本串）> `upstream-path`（与上游 dist 文件名-哈希精确匹配）> `upstream-decl`（上游 package.json 依赖声明）> `node_modules-ref`（zcode-restored/node_modules 参照安装，chunk 内无版本）。
- 条目数: **147**（JS chunk 143 + wasm 伴随资产 2 + chunk 内嵌 vendor 区 2）

## ⚠ 含 first-party 包装层的 chunk（Stage B 抽取队列）

| chunk | 上游库 | 包装符号 |
|---|---|---|
| `chart-iT2j9K3u.js` | recharts (+ first-party shadcn/ui chart layer) | ChartContainer (export alias `t`, data-slot=chart); ChartTooltipContent (export alias `a`; D8-B2 更正：原记 `n` 实为 ChartLegend); ChartTooltip = recharts Tooltip 再导出 (export alias `i`); ChartLegend = recharts Legend 再导出 (export alias `n`); ChartLegendContent (export alias `r`); useChart (internal `BT`, throws 'useChart must be used within a <ChartContainer />'); ChartContext (internal `zT`); ChartStyle (internal `HT`, 不导出); getPayloadConfigFromPayload (internal `qT`); 全量重建见 `ChartShadcn.tsx` + `ChartUtilsIme.report.md` |
| `appUsageChartPalette-BeN2wLzW.js` | first-party (no third-party lib) | Cell stub; palette resolver (export aliases a/i/n/r/t) |
| `utils-CEEH0K_K.js` | first-party tailwind-merge config (cn helper) | cn/extendTailwindMerge config (export alias `t`) |
| `pdf-viewer-m6YcRb_5.js` | react-pdf + pdfjs-dist + first-party viewer | PdfViewer (export name, React component wrapping react-pdf) |
| `previewPaneOfficeDocxContent-3JqWt7cf.js` | docx-preview + JSZip + first-party wrapper | PreviewPaneOfficeDocxContent (export name) |
| `previewPaneOfficeLegacyDocContent-HWD4EOEM.js` | first-party legacy .doc preview + docx-core wasm bridge | PreviewPaneOfficeLegacyDocContent (export name) |
| `previewPaneOfficeXlsxContent-XeHwYdMn.js` | first-party canvas spreadsheet preview + xlsx-worker bridge；内嵌 vendor 区 28–1835（d3-geo/d3-hierarchy/topojson-client/regl，见「chunk 内嵌 vendor 区」节） | PreviewPaneOfficeXlsxContent (export name) |
| `pptx-preview-viewer-B1z6CWke.js` | first-party PPTX preview shell | PptxPreviewViewer (export name) |
| `pptxRendererPreviewEngine-BIIRLBue.js` | first-party PPTX render engine + JSZip | pptxRendererPreviewEngine (export name; `{open(buffer)}` API) |
| `presentationPdfPrintExport-CsVZM-dn.js` | first-party PPTX print/PDF export | renderPresentationToPrintHost (export name) |
| `diffs.worker-CAavpt0L.js` | first-party diff worker = jsdiff + shiki (core/engine-oniguruma/engine-javascript via oniguruma-to-es) + unified/split renderer | diff engine message handler (type: success/error/context/context-expanded/change) |
| `IntlProvider-C321H7m8.js` | first-party i18n provider + locale data (zh-CN/en-US) | IntlProvider chunk exports (aliases a/i/n/o/r/s/t) |
| `imeComposition-DEYFkwWm.js` | first-party shadcn/ui popover/input/textarea + IME composition helper | Popover/PopoverAnchor/PopoverContent/PopoverTrigger; Input; Textarea; isComposing (export alias `t`) |
| `chunk-BO2N2NFS-CSNAeaxF.js` | first-party markdown/streamdown renderer mega-chunk (Mermaid React wrapper + shiki theme context) | Mermaid (export alias `a`, re-exported by mermaid-GHXKKRXX); shikiTheme context (alias `i`); markdown renderer exports (A/C/D/E/O/S/T/_/b/c/d/f/g/h/k/l/m/n/o/p/r/s/t/u/v/w/x/y) |
| `mermaid-GHXKKRXX-BUw9cQJG.js` | first-party wrapper shim (re-exports Mermaid React component) | Mermaid (re-export) |
| `highlighted-body-OFNGDK62-RS9ZmWFH.js` | first-party HighlightedCodeBlockBody (shiki consumer) | HighlightedCodeBlockBody (export name) |
| `docx_wasm_bg-HWnIvdMf.wasm` | docx-core Rust crate (first-party; crates/docx-core) | wasm-bindgen exports consumed by chunk-WKBPLHUA |
| `duke_sheets_wasm_bg-BCCK9PkU.wasm` | duke-sheets Rust workspace (crates: duke-sheets-core/-xlsx/-xlsb/-xls/-formula/-crypto) | wasm-bindgen exports consumed by duke_sheets_wasm-WTFY9Nh4.js |

## React 与构建运行时

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `react-BQLj9xdT.js` | 424 | react | 19.2.7 (in-chunk) | version string `19.2.7`; Symbol.for(`react.transitional.element`), `react.portal` (React 19 production build) | 否 |
| `react-dom-BlRPXJso.js` | 170 | react-dom | 19.2.7 (in-chunk) | version string `19.2.7`; react-dom production client bundle | 否 |
| `jsx-runtime-B5yMD3-t.js` | 20 | react/jsx-runtime | 19.2.7 (in-chunk) | Symbol.for(`react.transitional.element`)+`react.fragment` jsx-runtime exports | 否 |
| `chunk-Cq_f4orQ.js` | 46 | vite/esbuild runtime helpers (__toESM/__commonJS/__copyProps) | n/a (n/a) | Object.create/defineProperty interop boilerplate; shared by every CJS-wrapped vendor chunk | 否 |
| `preload-helper-BHSF1fZ9.js` | 60 | vite preload helper (__vitePreload) | n/a (n/a) | `modulepreload` + __vite__mapDeps machinery | 否 |

## 图表 (recharts)

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `chart-iT2j9K3u.js` | 14496 | recharts (+ first-party shadcn/ui chart layer) | 3.8.0 (node_modules-ref) | recharts-* DOM class names (recharts-cartesian-axis-tick_text, recharts-tooltip-cursor, recharts-default-tooltip), XAxis/YAxis/Tooltip components, d3-scale/d3-shape deduped to shared chunks; node_modules recharts=3.8.0 (no version embedded in recharts dist) | **是** |
| `CartesianChart-nORn-0bc.js` | 1739 | recharts (chart/CartesianChart module split) | 3.8.0 (node_modules-ref) | recharts-cartesian-grid-bg / recharts-cartesian-axis-tick-value class names; barGap/barSize/stackOffset/syncId/syncMethod props; imports d3 scale/shape chunks | 否 |
| `appUsageChartPalette-BeN2wLzW.js` | 49 | first-party (no third-party lib) | n/a (n/a) | imports {Tn,X,Y,Z} from chart-iT2j9K3u.js, defines stub `Cell` component (displayName=`Cell`) and palette resolver | **是** |

## Mermaid 11.14.0 — core 与图形定义 chunk

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `chunk-ICPOFSXX-C_rmVRO5.js` | 6337 | mermaid core chunk + inlined dompurify + khroma | mermaid 11.14.0 / dompurify 3.3.3 (in-chunk) | name-hash matches mermaid/dist/chunks/mermaid.core/chunk-ICPOFSXX.mjs; DOMPurify `t.version = "3.3.3"` inlined (upstream imports dompurify/khroma externally); config/securityLevel/getAccTitle etc. | 否 |
| `chunk-5PVQY5BW-CHFWSpGD.js` | 1064 | mermaid core utils + inlined @braintree/sanitize-url + d3 curves | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-5PVQY5BW.mjs (assignWithDepth/common/detectType/directiveRegex/sanitizeDirective; upstream imports @braintree/sanitize-url + d3-shape curves externally) | 否 |
| `chunk-336JU56O-DkB263D0.js` | 154 | mermaid core render/layout-algorithm chunk | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-336JU56O.mjs; render/getRegisteredLayoutAlgorithm; mapDeps -> dagre-KV5264BT | 否 |
| `chunk-426QAEUC-Dad5DTJk.js` | 11 | mermaid core (securityLevel helper) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-426QAEUC.mjs | 否 |
| `chunk-4BX2VUAB-CXCf2nkj.js` | 8 | mermaid core (accTitle/accDescr helper) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-4BX2VUAB.mjs; setAccTitle/setAccDescription | 否 |
| `chunk-4TB4RGXK-C7n-Hj7Q.js` | 2594 | mermaid core rendering-util chunk | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-4TB4RGXK.mjs (imports getIconStyles/createTooltip/getDiagramElement/setupViewPortForSVG/render upstream) | 否 |
| `chunk-55IACEB6-e4qpGqL1.js` | 9 | mermaid core (getDiagramElement) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-55IACEB6.mjs; sandbox id handling | 否 |
| `chunk-5FUZZQ4R-BxSIwqfJ.js` | 4761 | mermaid core flowchart rendering chunk | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-5FUZZQ4R.mjs (insertCluster/insertNode/positionNode/updateNodeBounds upstream) | 否 |
| `chunk-BSJP7CBP-CtqWAD3R.js` | 87 | mermaid core (node translate helper) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-BSJP7CBP.mjs | 否 |
| `chunk-EDXVE4YY-WgyXtTWn.js` | 15 | mermaid core (setupViewPortForSVG) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-EDXVE4YY.mjs | 否 |
| `chunk-ENJZ2VHE-D2K2A5i_.js` | 1520 | mermaid core dagre edge/marker rendering chunk | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-ENJZ2VHE.mjs (insertEdge/insertEdgeLabel/markers/positionEdgeLabel upstream) | 否 |
| `chunk-FMBD7UC4-B1I-L8ZC.js` | 20 | mermaid core (Font Awesome icon CSS constant) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-FMBD7UC4.mjs; `/* Font Awesome icon styling - consolidated */` | 否 |
| `chunk-OYMX7WX6-DX8RmQcM.js` | 2081 | mermaid core rendering chunk | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-OYMX7WX6.mjs | 否 |
| `chunk-QZHKN3VN-Ct9iE2Zt.js` | 13 | mermaid core (registry class) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-QZHKN3VN.mjs | 否 |
| `chunk-U2HBQHQK-Cs90NbhX.js` | 2668 | mermaid core chunk (marked inlined; d3/@iconify/utils/ts-dedent consumers) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-U2HBQHQK.mjs (upstream imports d3, @iconify/utils, marked, ts-dedent externally; marked inlined here) | 否 |
| `chunk-X2U36JSP-GGXNMzXA.js` | 104 | mermaid core (handDrawnSeed / roughjs seeding) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-X2U36JSP.mjs; handDrawnSeed config | 否 |
| `chunk-XPW4576I-C4Q_AnuJ.js` | 2285 | mermaid core chunk with inlined js-yaml | mermaid 11.14.0 / js-yaml 4.1.1 (upstream-path) | name-hash matches mermaid.core/chunk-XPW4576I.mjs (2716 lines upstream); isNothing/isObject + YAML loader internals = js-yaml (node_modules js-yaml=4.1.1) | 否 |
| `chunk-YZCP3GAM-C2MTlcUQ.js` | 106 | mermaid core (createTooltip) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-YZCP3GAM.mjs; imports dist-B7dupJ3c (@braintree/sanitize-url) | 否 |
| `chunk-ZZ45TVLE-D6pHsM4Y.js` | 42 | mermaid core (getSubGraphTitleMargins) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/chunk-ZZ45TVLE.mjs | 否 |
| `architectureDiagram-Q4EWVU46-Bzza8z4g.js` | 7085 | mermaid (architecture diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/architectureDiagram-Q4EWVU46.mjs; inlines cytoscape-fcose (fcose/coseBase markers); imports cytoscape.esm (3.33.2), mermaid-parser.core, src-D6nttw3b (d3); upstream externals: cytoscape, cytoscape-fcose, d3, @mermaid-js/parser | 否 |
| `blockDiagram-DXYQGD6D-5Ftn7EdM.js` | 3748 | mermaid (block diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/blockDiagram-DXYQGD6D.mjs | 否 |
| `c4Diagram-AHTNJAMY-D_C9c5pc.js` | 3082 | mermaid (C4 diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/c4Diagram-AHTNJAMY.mjs; TIER CORRECTION: listed under grammar_data in chunk-tiers.json | 否 |
| `classDiagram-6PBFFD2Q-CTD8As5r.js` | 27 | mermaid (class diagram (v1)) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/classDiagram-6PBFFD2Q.mjs | 否 |
| `classDiagram-v2-HSJHXN6E-Dgo6tlur.js` | 27 | mermaid (class diagram v2) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/classDiagram-v2-HSJHXN6E.mjs | 否 |
| `erDiagram-SMLLAGMA-C_frkA08.js` | 1601 | mermaid (ER diagram (+ jison parser)) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/erDiagram-SMLLAGMA.mjs; jison-generated parser inlined | 否 |
| `flowDiagram-DWJPFMVM-ChJq-_O4.js` | 3603 | mermaid (flowchart diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/flowDiagram-DWJPFMVM.mjs | 否 |
| `ganttDiagram-T4ZO3ILL-CWfUL4eJ.js` | 3185 | mermaid (gantt diagram + inlined dayjs) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/ganttDiagram-T4ZO3ILL.mjs; dayjs + advancedFormat/isoWeek/duration/customParseFormat plugins inlined (upstream imports dayjs externally; mermaid dep dayjs ^1.11.19) | 否 |
| `gitGraphDiagram-UUTBAWPF-DOHUN4oS.js` | 1201 | mermaid (gitGraph diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/gitGraphDiagram-UUTBAWPF.mjs | 否 |
| `infoDiagram-42DDH7IO-CiyzBiC_.js` | 35 | mermaid (info diagram) | mermaid 11.14.0 (in-chunk) | name-hash matches mermaid.core/infoDiagram-42DDH7IO.mjs; contains mermaid version string `11.14.0` | 否 |
| `ishikawaDiagram-UXIWVN3A-C4-4UrHW.js` | 941 | mermaid (ishikawa (fishbone) diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/ishikawaDiagram-UXIWVN3A.mjs | 否 |
| `journeyDiagram-VCZTEJTY-DrUKz0D3.js` | 1269 | mermaid (user journey diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/journeyDiagram-VCZTEJTY.mjs; TIER CORRECTION: listed under grammar_data in chunk-tiers.json | 否 |
| `kanban-definition-6JOO6SKY-DyL3T2K5.js` | 1092 | mermaid (kanban definition) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/kanban-definition-6JOO6SKY.mjs | 否 |
| `mindmap-definition-QFDTVHPH-CRwFpofj.js` | 1182 | mermaid (mindmap definition) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/mindmap-definition-QFDTVHPH.mjs | 否 |
| `pieDiagram-DEJITSTG-CXQRcYKN.js` | 213 | mermaid (pie diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/pieDiagram-DEJITSTG.mjs | 否 |
| `quadrantDiagram-34T5L4WZ-BgTxgERB.js` | 2175 | mermaid (quadrant chart diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/quadrantDiagram-34T5L4WZ.mjs | 否 |
| `requirementDiagram-MS252O5E-utbFnmhP.js` | 2059 | mermaid (requirement diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/requirementDiagram-MS252O5E.mjs | 否 |
| `sankeyDiagram-XADWPNL6-D1-kaXZ5.js` | 1121 | mermaid (sankey diagram (+ inlined d3-sankey)) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/sankeyDiagram-XADWPNL6.mjs; d3-sankey ^0.12.3 inlined (mermaid dep) | 否 |
| `sequenceDiagram-FGHM5R23-vIwWNFLy.js` | 5533 | mermaid (sequence diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/sequenceDiagram-FGHM5R23.mjs; TIER CORRECTION: listed under grammar_data in chunk-tiers.json | 否 |
| `stateDiagram-FHFEXIEX-Dl2Wgi--.js` | 482 | mermaid (state diagram (v1)) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/stateDiagram-FHFEXIEX.mjs | 否 |
| `stateDiagram-v2-QKLJ7IA2-duw16POG.js` | 25 | mermaid (state diagram v2) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/stateDiagram-v2-QKLJ7IA2.mjs | 否 |
| `timeline-definition-GMOUNBTQ-Cs1YsgCJ.js` | 1627 | mermaid (timeline definition) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/timeline-definition-GMOUNBTQ.mjs | 否 |
| `vennDiagram-DHZGUBPP-DRiRCH7s.js` | 2276 | mermaid (venn diagram (+ inlined @upsetjs/venn.js)) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/vennDiagram-DHZGUBPP.mjs; @upsetjs/venn.js ^2.0.0 inlined (mermaid dep) | 否 |
| `wardleyDiagram-NUSXRM2D-CARWGBA1.js` | 1106 | mermaid (wardley map diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/wardleyDiagram-NUSXRM2D.mjs | 否 |
| `xychartDiagram-5P7HB3ND-CuWGUfRF.js` | 2171 | mermaid (xychart diagram) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/xychartDiagram-5P7HB3ND.mjs | 否 |
| `diagram-5BDNPKRD-Dq-_Oj1A.js` | 142 | mermaid (generic diagram definition module) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/diagram-5BDNPKRD.mjs | 否 |
| `diagram-G4DWMVQ6-CUP6CJOA.js` | 518 | mermaid (generic diagram definition module) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/diagram-G4DWMVQ6.mjs | 否 |
| `diagram-MMDJMWI5-C4Yz_tzn.js` | 267 | mermaid (generic diagram definition module) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/diagram-MMDJMWI5.mjs | 否 |
| `diagram-TYMM5635-ic71_TK_.js` | 220 | mermaid (generic diagram definition module) | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/diagram-TYMM5635.mjs | 否 |
| `cose-bilkent-S5V4N54A-DoQtGwhn.js` | 3850 | cytoscape-cose-bilkent + mermaid cytoscape-setup | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/cose-bilkent-S5V4N54A.mjs (upstream: `// src/rendering-util/layout-algorithms/cose-bilkent/cytoscape-setup.ts`, imports cytoscape + cytoscape-cose-bilkent externally); cytoscape-cose-bilkent inlined; imports cytoscape.esm-ZNxEkdto (3.33.2); mermaid dep cytoscape-cose-bilkent ^4.1.0 | 否 |
| `dagre-KV5264BT-DcjV4okn.js` | 514 | mermaid dagre-d3-es rendering layer | mermaid 11.14.0 (upstream-path) | name-hash matches mermaid.core/dagre-KV5264BT.mjs; upstream imports dagre-d3-es/src/dagre/index.js + dagre-d3-es/src/graphlib/* externally -> deduped to dagre-Ba15qe2z/graphlib-By8Ud-mb here | 否 |

## @mermaid-js/parser（mermaid 11.14.0 内置）

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `mermaid-parser.core-eu6-s8Rd.js` | 174 | @mermaid-js/parser core registry (mermaid-parser.core.mjs) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | content = mermaid/dist/chunks/mermaid.esm/chunk-COTS6TSK.mjs (`// ../parser/dist/mermaid-parser.core.mjs`, lazy `parsers`/`initializers` registry); mapDeps -> info/packet/pie/radar/gitGraph/architecture/treemap/treeView/wardley service chunks; mermaid package.json declares @mermaid-js/parser ^1.1.0 | 否 |
| `chunk-K5T4RW27-C2k7zM1B.js` | 19320 | @mermaid-js/parser langium runtime | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | Langium/langium markers (29x); corresponds to mermaid.esm/chunk-WEB62QT6.mjs (26,233 lines unminified); imported by every create*Services chunk | 否 |
| `architecture-YZFGNWBL-C_yj8nWv.js` | 3 | @mermaid-js/parser (createArchitectureServices shim) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | = mermaid.esm/architecture-YZFGNWBL-SHOFS5JC.mjs (first hash segment identical) | 否 |
| `chunk-7N4EOEYR-CsHhOX59.js` | 49 | @mermaid-js/parser (architecture services implementation) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | class extends ... architecture service; imported by architecture-YZFGNWBL | 否 |
| `gitGraph-7Q5UKJZL-3kAD1sB3.js` | 3 | @mermaid-js/parser (createGitGraphServices shim) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | = mermaid.esm/gitGraph-7Q5UKJZL-OZ6BR2NM.mjs (first hash segment identical) | 否 |
| `chunk-67CJDMHE-Cexdo6Zz.js` | 32 | @mermaid-js/parser (gitGraph services implementation) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | class extends ... gitGraph service | 否 |
| `info-OMHHGYJF-DxeNaTt9.js` | 3 | @mermaid-js/parser (createInfoServices shim) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | = mermaid.esm/info-OMHHGYJF-5WKMRTR7.mjs (first hash segment identical) | 否 |
| `chunk-KGLVRYIC-BHpl30-B.js` | 32 | @mermaid-js/parser (info services implementation) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | class extends ... info service | 否 |
| `packet-4T2RLAQJ-do9TQ2oW.js` | 3 | @mermaid-js/parser (createPacketServices shim) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | = mermaid.esm/packet-4T2RLAQJ-KIAKHBGY.mjs (first hash segment identical) | 否 |
| `chunk-FOC6F5B3-DKRBqgb6.js` | 32 | @mermaid-js/parser (packet services implementation) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | class extends ... packet service | 否 |
| `pie-ZZUOXDRM-D2y5C8UT.js` | 3 | @mermaid-js/parser (createPieServices shim) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | = mermaid.esm/pie-ZZUOXDRM-DHM77I3D.mjs (first hash segment identical) | 否 |
| `chunk-AA7GKIK3-USDP_OCc.js` | 40 | @mermaid-js/parser (pie services implementation) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | class extends ... pie service | 否 |
| `radar-PYXPWWZC-ClC9wlgL.js` | 3 | @mermaid-js/parser (createRadarServices shim) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | = mermaid.esm/radar-PYXPWWZC-LLCHBXKI.mjs (first hash segment identical) | 否 |
| `chunk-2KRD3SAO-CGz6ceN4.js` | 32 | @mermaid-js/parser (radar services implementation) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | class extends ... radar service | 否 |
| `treemap-W4RFUUIX-Dge-OZNU.js` | 3 | @mermaid-js/parser (createTreemapServices shim) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | = mermaid.esm/treemap-W4RFUUIX-TFP7P7ZZ.mjs (first hash segment identical) | 否 |
| `chunk-LIHQZDEY-D6IgIE9_.js` | 75 | @mermaid-js/parser (treemap services implementation) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | class extends ... treemap service | 否 |
| `treeView-SZITEDCU-DpZRKpHb.js` | 3 | @mermaid-js/parser (createTreeViewServices shim) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | = mermaid.esm/treeView-SZITEDCU-XYQEM24W.mjs (first hash segment identical) | 否 |
| `chunk-ORNJ4GCN-Bu3Yxmim.js` | 41 | @mermaid-js/parser (treeView services implementation) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | class extends ... treeView service | 否 |
| `wardley-RL74JXVD-B0NkEXbY.js` | 3 | @mermaid-js/parser (createWardleyServices shim) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | = mermaid.esm/wardley-RL74JXVD-T2LBEBUU.mjs (first hash segment identical) | 否 |
| `chunk-CIAEETIT-DcXR9d5t.js` | 31 | @mermaid-js/parser (wardley services implementation) | ^1.1.0 (bundled with mermaid 11.14.0) (upstream-decl) | class extends ... wardley service | 否 |

## dagre-d3-es 7.0.14

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `dagre-Ba15qe2z.js` | 1947 | dagre-d3-es src/dagre (layout algorithm) | 7.0.14 (upstream-decl) | imports graphlib + lodash-es chunks (flatten/identity/isEmpty/reduce); consumed by mermaid dagre-KV5264BT whose upstream imports `dagre-d3-es/src/dagre/index.js`; mermaid pins dagre-d3-es 7.0.14 | 否 |
| `graphlib-By8Ud-mb.js` | 589 | dagre-d3-es src/graphlib | 7.0.14 (upstream-decl) | imports lodash-es chunks; upstream mermaid.core/dagre-KV5264BT.mjs imports `dagre-d3-es/src/graphlib/index.js` + json.js | 否 |

## lodash-es（mermaid/dagre-d3-es 依赖）

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `clone-C1scsHxK.js` | 6 | lodash-es cloneDeep (via dagre-d3-es graphlib json) | lodash-es ^4.17.23 (upstream-decl) | `var t=4; return e(n,t)` = cloneDeep with CLONE_DEEP_FLAG; imported from graphlib chunk; mermaid dep lodash-es ^4.17.23 | 否 |
| `identity-BWeT0p4R.js` | 438 | lodash-es (root/identity core) | ^4.17.23 (upstream-decl) | lodash root detection (`typeof global == 'object' && global.Object === Object`); base of reduce/flatten/isEmpty chunks | 否 |
| `reduce-Bc5cHXXJ.js` | 576 | lodash-es reduce/baseEach internals | ^4.17.23 (upstream-decl) | imports identity chunk; lodash internal symbols (D/E/T/_/c/d/f/g/h/i/l/n/r/s/t) | 否 |
| `flatten-D5zHxTCl.js` | 35 | lodash-es flatten | ^4.17.23 (upstream-decl) | imports identity+reduce chunks; used by dagre-Ba15qe2z | 否 |
| `isEmpty-CzqZrCGw.js` | 80 | lodash-es isEmpty | ^4.17.23 (upstream-decl) | imports identity chunk; consumed by chunk-K5T4RW27 (@mermaid-js/parser) | 否 |

## d3 7.x（mermaid/recharts 共享模块）

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `src-D6nttw3b.js` | 2095 | d3 (selection/transition/zoom/drag/dispatch/timer/ease bundle) | ^7.9.0 (upstream-decl) | select/selectAll/dispatch/transition/zoom present; chunk name `src` = d3@7 entry src/index.js; mermaid diagrams import it wherever upstream imports `from "d3"`; mermaid dep d3 ^7.9.0 | 否 |
| `string-DeCsdInp.js` | 515 | d3-color + d3-interpolate | d3-color 3.1.0 / d3-interpolate 3.0.1 (node_modules-ref) | rgb/hsl color classes + interpolateString tail (`s.join("")` with piece interpolators); imported by src-D6nttw3b and d3-scale linear | 否 |
| `defaultLocale-6WHJ3B09.js` | 250 | d3-format (defaultLocale) | 3.1.2 (node_modules-ref) | formatDecimal/toLocaleString(`en`) locale machinery; imported by d3-scale linear/time | 否 |
| `init-C9W85X21.js` | 27 | d3-scale (initRange/initDomain) | 4.0.2 (node_modules-ref) | `switch(arguments.length){case 0:...this.range(e)...this.range(t).domain(...)}` = d3-scale init | 否 |
| `ordinal-C7Z5b-kP.js` | 73 | d3-scale ordinal + d3-array InternMap | d3-scale 4.0.2 (node_modules-ref) | `class extends Map` with Object.defineProperties = d3-array InternMap; ordinal scale | 否 |
| `band-DeoNU25q.js` | 89 | d3-scale band | 4.0.2 (node_modules-ref) | imports ordinal+init; band scale internals | 否 |
| `linear-lf9nDQy-.js` | 388 | d3-scale linear | 4.0.2 (node_modules-ref) | imports string (d3-interpolate) + defaultLocale (d3-format) + init | 否 |
| `time-22YdBqJA.js` | 1025 | d3-scale time (+ d3-time) | d3-scale 4.0.2 / d3-time 3.1.0 (node_modules-ref) | imports linear+init; time scale tick/interval machinery | 否 |
| `path-DGMeFKnt.js` | 100 | d3-path | 3.1.0 (node_modules-ref) | Path `this._ += e[0]` moveTo/arc internals (d3-path) | 否 |
| `path-6nRvbSUf.js` | 23 | d3-shape (path/curve helper) | 3.2.0 (node_modules-ref) | imports path-DGMeFKnt (d3-path); `t.digits` constant-curve helper | 否 |
| `math-hZRFyvgF.js` | 32 | d3-shape (math constants) | 3.2.0 (node_modules-ref) | atan2/cos/sin/1e-12/PI/2 constants = d3-shape/src/math.js | 否 |
| `array-B2f2amhX.js` | 5 | d3-array (slice/array helper) | 3.2.4 (node_modules-ref) | Array.prototype.slice + `typeof e=='object' && 'length' in e` = d3-array array() | 否 |
| `arc-BwHSA3do.js` | 202 | d3-shape arc | 3.2.0 (node_modules-ref) | imports path+math; arc generator | 否 |
| `catmullRom-VKG4HBuo.js` | 164 | d3-shape curveCatmullRom | 3.2.0 (node_modules-ref) | bezierCurveTo with `_k` tension = catmullRom curve | 否 |
| `line-B5c9ys_W.js` | 48 | d3-shape line | 3.2.0 (node_modules-ref) | imports path/array/linearClosed; line generator | 否 |
| `linearClosed-sVKHPf8I.js` | 56 | d3-shape curveLinearClosed | 3.2.0 (node_modules-ref) | areaStart/areaEnd `_line` state = curveLinearClosed | 否 |
| `pie-1vRCKDMq.js` | 74 | d3-shape pie | 3.2.0 (node_modules-ref) | imports path/math/array; pie generator | 否 |
| `step-BOU9QToW.js` | 428 | d3-shape curveStep family | 3.2.0 (node_modules-ref) | imports linearClosed; step curve classes | 否 |
| `symbol-DjjK0MCF.js` | 202 | d3-shape symbol | 3.2.0 (node_modules-ref) | imports path/math/array; symbol generator | 否 |
| `treemap-DBUS1PbI.js` | 309 | d3-hierarchy treemap | 3.1.2 (node_modules-ref) | standalone treemap layout (sumChildren/round/squarify) | 否 |

## cytoscape / roughjs / katex / sanitize-url / khroma

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `cytoscape.esm-ZNxEkdto.js` | 23091 | cytoscape | 3.33.2 (in-chunk) | version string `3.33.2`; `cytoscape.use()`; cytoscape_container/cytoscape_stylesheet; chunk name = cytoscape dist esm build; consumed by mermaid cose-bilkent + architectureDiagram (upstream externals) | 否 |
| `rough.esm-By2WpMXC.js` | 1508 | roughjs | ^4.6.6 (upstream-decl) | chunk name = roughjs dist rough.esm.js; bowing/roughness/curveStepCount/curveFitting options; mermaid dep roughjs ^4.6.6 (hand-drawn rendering) | 否 |
| `katex-fHRr5Rbn.js` | 11025 | katex (CJS dist wrapped) | 0.16.x (ref 0.16.45; original monorepo pinned 0.16.25) (node_modules-ref) | ParseError/SETTINGS_SCHEMA/__defineFunction/__parse namespace = katex; resolved from mermaid core `import("katex")` (upstream mermaid.core/chunk-ICPOFSXX.mjs); mermaid dist comment proves original build used pnpm katex@0.16.25; zcode-restored/node_modules katex=0.16.45; no version embedded in katex dist | 否 |
| `dist-B7dupJ3c.js` | 82 | @braintree/sanitize-url | ^7.1.1 (upstream-decl) | invalidProtocolRegex/htmlCtrlEntityRegex/ctrlCharactersRegex/BLANK_URL=`about:blank`/sanitizeUrl = @braintree/sanitize-url; mermaid dep ^7.1.1; imported by chunk-YZCP3GAM (createTooltip) | 否 |
| `channel-BWO9zL-c.js` | 3 | khroma (color channel helper fragment, inlined via mermaid core) | ^2.1.0 (upstream-decl) | `e.lang.round(t.parse(n)[r])` with e/t from chunk-ICPOFSXX (khroma inlined there); mermaid dep khroma ^2.1.0; shared with styles-CdEGpc2x | 否 |

## PDF (react-pdf + pdfjs-dist)

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `pdf-viewer-m6YcRb_5.js` | 21205 | react-pdf + pdfjs-dist + first-party viewer | react-pdf 10.4.1 / pdfjs-dist 5.4.296 (in-chunk) | pdfjs version string `5.4.296` (= node_modules pdfjs-dist); react-pdf markers (Document/Page, workerSrc, getDocument); imports keyboardShortcuts/button (first-party UI) | **是** |

## Office 文档预览 (docx/xlsx/pptx + Rust wasm)

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `previewPaneOfficeDocxContent-3JqWt7cf.js` | 9354 | docx-preview + JSZip + first-party wrapper | docx-preview 0.4.0 / jszip 3.10.1 (in-chunk) | docx-preview renderAsync options object (renderChanges/renderComments/renderEndnotes/renderFooters/renderFootnotes/renderHeaders/useBase64URL); JSZip `r.version = "3.10.1"` (docx-preview dep); `zcode-docx-preview-N` ids | **是** |
| `previewPaneOfficeLegacyDocContent-HWD4EOEM.js` | 47538 | first-party legacy .doc preview + docx-core wasm bridge | n/a (first-party) (n/a) | posts `{type:'import-docx', buffer, wasmSource}` to docx-import-worker; loads `docx_wasm_bg-HWnIvdMf.wasm` via new URL; imports chunk-WKBPLHUA/chunk-YE7GQOST wasm glue | **是** |
| `docx-import-worker-oPk-zLr5.js` | 744 | first-party worker for docx-core wasm (import-docx) | n/a (first-party) (n/a) | wasm-bindgen worker (`N.__wbindgen_add_to_stack_pointer`); handles import-docx messages for docx_wasm_bg.wasm | 否 |
| `chunk-WKBPLHUA-Dg0DBfSj.js` | 444 | docx-core wasm-bindgen glue (Rust crate `docx-core`) | first-party Rust (rustc 2d8144b7) (in-chunk) | exports build_doc_model_from_package/build_doc_model_from_bytes/parse_docx_wasm/model_to_document_xml_wasm/serialize_docx_wasm; wasm-bindgen stack-pointer ABI | 否 |
| `chunk-XBI2PYTU-8QsfST8j.js` | 49 | docx-core JS API (package builder) | first-party Rust glue (n/a) | imports chunk-WKBPLHUA; `parts`/`binaryAssets` package assembly; version `1.0` (docx package format marker) | 否 |
| `chunk-YE7GQOST-DVtn9d8T.js` | 428 | docx-core wasm loader module | first-party Rust glue (n/a) | mapDeps -> src-2FP7IUE6 + chunk-WKBPLHUA; wasm init/instantiate plumbing | 否 |
| `src-2FP7IUE6-ahbsNOoE.js` | 9 | docx-core API re-export (createMinimalDocxPackage) | first-party Rust glue (n/a) | exports createMinimalDocxPackage etc. from chunk-XBI2PYTU; chunk name `src` = crate JS src entry | 否 |
| `src-AEHDFCS5-Cut3IAW0.js` | 25 | docx-core API re-export module | first-party Rust glue (n/a) | re-exports 9 symbols from chunk-YE7GQOST | 否 |
| `previewPaneOfficeXlsxContent-XeHwYdMn.js` | 199508 | first-party canvas spreadsheet preview + xlsx-worker bridge | n/a (first-party) (n/a) | workbook/worksheet/formula model, canvas rendering (39x canvas), spawns xlsx-worker (Worker refs), zip markers (Content_Types/styles.xml/sharedStrings) via fflate chunk; imports @tanstack/react-virtual (esm-BY6T6pIH) + d3-shape chunks for sparkline/chart glyphs | **是** |
| `xlsx-worker-DJiDdvsD.js` | 6202 | worker hosting duke-sheets WASM (xlsx/xlsb/xls parsing) | n/a (first-party Rust bridge) (n/a) | loads `duke_sheets_wasm_bg-BCCK9PkU.wasm` via new URL; duke + workbook_new markers; self-contained IIFE worker bundle | 否 |
| `duke_sheets_wasm-WTFY9Nh4.js` | 1349 | wasm-bindgen glue for duke-sheets | first-party Rust (rustc 2d8144b7) (in-chunk) | wasm-bindgen `__wrap`/FinalizationRegistry glue; companion duke_sheets_wasm_bg-BCCK9PkU.wasm | 否 |
| `pptx-preview-viewer-B1z6CWke.js` | 827 | first-party PPTX preview shell | n/a (first-party) (n/a) | lazy-loads pptxRendererPreviewEngine + presentationElementModel via __vite__mapDeps; imports imeComposition (popover/input) | **是** |
| `pptxRendererPreviewEngine-BIIRLBue.js` | 55446 | first-party PPTX render engine + JSZip | jszip 3.10.1 (engine itself first-party) (in-chunk) | JSZip `r.version = "3.10.1"` + loadAsync/support/defaults; DOMParser-based OOXML parsing; lazySlides; exports engine object | **是** |
| `presentationElementModel-r6vQ-JZl.js` | 98 | first-party presentation element geometry model | n/a (first-party) (n/a) | position/size rect math for slide elements | 否 |
| `presentationPdfPrintExport-CsVZM-dn.js` | 291 | first-party PPTX print/PDF export | n/a (first-party) (n/a) | data-zcode-pptx-print-host/page/style attributes; font metrics tables | **是** |
| `officeFilePreview-DDCn9-xI.js` | 34 | first-party office file type router | n/a (first-party) (n/a) | extension lists [.xlsx/.xlsm/.xls], [.docx], [.doc] -> preview kind | 否 |
| `docx_wasm_bg-HWnIvdMf.wasm` | (binary 1119333B) | docx-core Rust crate (first-party; crates/docx-core) | rustc commit 2d8144b7880597b6e6d3dfd63a9a9efae3f533d3; serde_json 1.0.150 (in-chunk) | wasm strings: crates/docx-core/src/parse/*.rs, build_doc_model_from_package/parse_docx_wasm/serialize_docx_wasm exports, own ZIP inflate ('Invalid DOCX ZIP: bad local header') | **是** |
| `duke_sheets_wasm_bg-BCCK9PkU.wasm` | (binary 4345449B) | duke-sheets Rust workspace (crates: duke-sheets-core/-xlsx/-xlsb/-xls/-formula/-crypto) | rustc commit 2d8144b7880597b6e6d3dfd63a9a9efae3f533d3; deps: quick-xml 0.37.5, chrono 0.4.43, zopfli 0.8.3, rayon-core 1.13.0, rand_chacha 0.3.1, md-5/sha1/sha2 0.10.x, memchr 2.7.6, hashbrown 0.17.1 (in-chunk) | wasm strings: /home/runner/work/duke-sheets/duke-sheets/crates/*; exports workbook_new/workbook_calculate/worksheet_*; xls BIFF + rc4_legacy crypto | **是** |

## fflate / diffs.worker / oniguruma wasm

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `browser-BrD0k0WI.js` | 821 | fflate (zip inflate/unzip) | 0.8.3 (node_modules-ref) | zip local-header parsing, `unknown compression type`, method 8 inflate vs store, crc; chunk name `browser` = fflate browser build; node_modules fflate=0.8.3; imported by xlsx/docx preview chunks | 否 |
| `diffs.worker-CAavpt0L.js` | 10697 | first-party diff worker = jsdiff + shiki (core/engine-oniguruma/engine-javascript via oniguruma-to-es) + unified/split renderer | shiki ref 3.23.0 / jsdiff (diff npm) (node_modules-ref) | ShikiError class + OnigurumaEngine + codeToTokens/codeToHtml (shiki); oniguruma-to-es regex AST (Subroutine/NamedCallout/Directive/CharacterSet); jsdiff internals (buildValues/tokenize, hunks/oldStart/newStart); `--diffs-token` CSS prefix, iterateOverDiff/unifiedLineCount/splitLineCount/data-diff-span; receives wasmBinary via postMessage (no static wasm import) | **是** |
| `wasm-B4ap0Fdc.js` | 8 | vscode-oniguruma WASM blob (base64) | oniguruma 6.x (vscode-oniguruma packaging) (in-chunk) | exports createOnigScanner/findNextOnigScannerMatch/getLastOnigError; `Oniguruma %d.%d.%d : Copyright (C) 2002-2018 K.Kosako`; identical to wasm-CmMPG1ko.js; imported by styles-CdEGpc2x.js (shiki mega-chunk, first_party tier) | 否 |
| `wasm-CmMPG1ko.js` | 8 | vscode-oniguruma WASM blob (base64, duplicate) | oniguruma 6.x (in-chunk) | byte-identical to wasm-B4ap0Fdc.js (second copy for a different importer graph) | 否 |

## UI 基础库 (radix / tanstack / tailwind-merge) 与 first-party 附加条目

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `dist-vnZIbudW.js` | 109 | @radix-ui/react-compose-refs + @radix-ui/react-slot | radix-ui (ref install) (node_modules-ref) | composeRefs/useComposedRefs (`e.current=t` ref setter + cleanup), Slot/createSlot with `${e}.Slot` displayName = radix react-slot dist; chunk name `dist` = radix dist/index.js layout | 否 |
| `dist-DJJArJ7D.js` | 1940 | @radix-ui/react-popper (+ inlined @floating-ui, @radix-ui/primitive, @radix-ui/react-context) | radix-ui (ref install) (node_modules-ref) | composeEventHandlers (`checkForDefaultPrevented`), createContext `${e}Provider` pattern, data-side/data-align, anchor/Anchor/Popper, floating-ui computePosition internals; imports dist-vnZIbudW (Slot/useComposedRefs) | 否 |
| `esm-BY6T6pIH.js` | 782 | @tanstack/react-virtual + @tanstack/virtual-core + @tanstack/react-store | 3.13.23 (node_modules-ref) | Virtualizer class (`_didMount`/`_willUpdate`), useVirtualizer/useWindowVirtualizer (observeElementRect/observeElementOffset/scrollToFn), useStore with initialDeps/debug cost; chunk name `esm` = @tanstack/react-virtual dist/esm; node_modules @tanstack/react-virtual=3.13.23 | 否 |
| `bundle-mjs-D8tLE0rB.js` | 1185 | tailwind-merge | 3.5.0 (node_modules-ref) | classGroups/conflictingClassGroups machinery; chunk name = tailwind-merge dist/bundle-mjs.js; node_modules tailwind-merge=3.5.0 | 否 |
| `utils-CEEH0K_K.js` | 18 | first-party tailwind-merge config (cn helper) | n/a (n/a) | extendTailwindMerge-style call `t({extend:{classGroups:{'font-size':['text-ui-lg',...]}}})` over bundle-mjs; ZCode design-system class groups | **是** |
| `tiny-invariant-Dm49c6Qj.js` | 11 | tiny-invariant | 1.3.3 (node_modules-ref) | exact minified match of tiny-invariant source (`Invariant failed`, isProduction flag); node_modules tiny-invariant=1.3.3 | 否 |
| `IntlProvider-C321H7m8.js` | 9253 | first-party i18n provider + locale data (zh-CN/en-US) | n/a (first-party) (n/a) | ZCode translation catalogs (`settings.locale.zh-CN`, `sidebar.settings.theme.light`...), Intl.PluralRules-style plural handling; no react-intl/ICU library inside | **是** |
| `imeComposition-DEYFkwWm.js` | 12605 | first-party shadcn/ui popover/input/textarea + IME composition helper + toast 系统 + PPTX 元素引用族 + PlatformProvider；vendored: scheduler / react-dom-client@19.2.7 / radix focus-scope@1.1.7+focus-guards@1.1.3+popover@1.1.15 全栈 / react-remove-scroll@2.7.2 / aria-hidden@1.2.6（D8-B2 更正：这些库**内联在本 chunk**，非仅 dist-* chunks） | n/a (first-party + vendored 混合; 版本见证据列) (in-chunk react-dom `19.2.7`; radix node_modules-ref) | data-slot popover/popover-anchor/popover-content/popover-trigger/input/textarea; toast host `#zcode-toast-host`(createRoot); `zcode:pptx-element-reference-add-to-chat` 事件; isComposing helper `_r` (export `t`); 34 导出全表见 `ChartUtilsIme.report.md` §3.2 | **是** |
| `keyboardShortcuts-BGHopxr9.js` | 89 | first-party keyboard shortcut formatting | n/a (first-party) (n/a) | platform detection + ⌘/Ctrl symbol formatting | 否 |
| `chunk-BO2N2NFS-CSNAeaxF.js` | 21756 | first-party markdown/streamdown renderer mega-chunk (Mermaid React wrapper + shiki theme context) | n/a (first-party) (n/a) | exports `Mermaid` React component (data-streamdown=mermaid, 'Loading diagram...', zoom controls), shikiTheme context, mermaid-block actions; lazy-loads mermaid-GHXKKRXX/highlighted-body | **是** |
| `mermaid-GHXKKRXX-BUw9cQJG.js` | 2 | first-party wrapper shim (re-exports Mermaid React component) | n/a (first-party) (n/a) | 3 lines: `import { a as e } from './chunk-BO2N2NFS...'; export { e as Mermaid }` | **是** |
| `highlighted-body-OFNGDK62-RS9ZmWFH.js` | 25 | first-party HighlightedCodeBlockBody (shiki consumer) | n/a (first-party) (n/a) | uses shikiTheme context from chunk-BO2N2NFS; renders code blocks | **是** |

## chunk 内嵌 vendor 区（无独立 vendor chunk）

| chunk | 行数 | 上游库 | 版本 | 证据 | 包装层 |
|---|---|---|---|---|---|
| `styles-CdEGpc2x.js` 91850–94592（内嵌区） | 2743 | @dnd-kit/core + @dnd-kit/sortable | core v6 / sortable v7–8 族 (API-shape) | chunk 内无版本串、package.json 无 dnd-kit 声明（库体随 styles chunk 内联打包）；区界实测：起点 91850 `Mit`=useCombinedRefs（前界 91849 `jit` first-party memo）、终点 94592（后界 94593 `sst` first-party 队列域）；92082 库错误串 `useDndMonitor must be used within a children of <DndContext>`（in-chunk 铁证）；92050–92077 无障碍播报器（Uit/Wit/Git）；93521 `_Z`=DndContext(memo)、94289 `EZ`=SortableContext、94380+ useSortable 全签名（animateLayoutChanges/getNewIndex/strategy/resizeObserverConfig/transition）、94522 sortableKeyboardCoordinates 族、94242 `TZ`=rectSorting 策略；碰撞族 92249 `KX`=closestCenter 式基线 + 92263 `rat` 次算法（A1-P3-B10.report.md §三 全取证） | **是**（first-party 包装层 = 155343 `Kzt`=groupedCollisionDetection 分组过滤包装 + 94607 `cst` 纵限 modifier + 94621 `lst` 队列项组件（chat.queue.* i18n）；消费面 `collisionDetection: KX` @94819/160252/160350/183209/191521、`collisionDetection: Kzt` @156237；QuickPickDeep `dndBaselineCollision` declare = vendor 边界占位） |
| `previewPaneOfficeXlsxContent-XeHwYdMn.js` 28–1835（内嵌区） | 1808 | d3-geo + d3-hierarchy + topojson-client + regl | n/a (API-shape) | chunk 内无版本串、package.json 无 d3/regl/topojson 声明（库体随本 chunk 内联打包）；区界实测：起点 28 `P`=d3-array Adder（Float64Array(32) partials）、28–1834 = d3/topojson 区、1835 = regl UMD 包装 `Ln = t((e, t) => …` 起始行（1841 `n.createREGL = r()`、1866 `(regl)` 错误串、1924 constructor 参校验）；**regl 库体实际跨度 1835–9110**（树内 XlsxDeepP@37 注记在案；本条目区间 = 八名范围，P3-B11 受理口径）。身份指纹（A1-P3-B11.report.md §4 三勘误）：wn@1479 = d3-geo **geoMercator**（原投影 Cn@1473 `[λ, ln tan(π/4+φ/2)]` + scale(961/τ)；「miller」仅 189196 应用层枚举标）、En@1536 = **geoIdentity** 形（angle/reflectX/reflectY/clipExtent/fit* 面，体无 insets 非 geoAlbersUsa；us-state 分支在 189196 应用层）、On@1658 = **geoNaturalEarth**（原投影 Dn@1632 多项式系数逐字 + scale(175.295)，189196 缺省分支）；余名 = topojson feature Pn@1758 / geoPath rn@1075 / partition kn@1661 / treemapSlice An@1705；八名 declare 落档 = XlsxDeepA@404–411（Pn/rn/En/wn/On/kn/An）+ XlsxDeepP@532（Ln） | **是**（first-party 包装层 = XlsxDeepP::reglInterop（原 Rn@9112，regl WebGL 互操作，模块头 9111–9130）+ XlsxDeepC `yd`=SurfaceChartPanel@183672 唯一消费面（`reglInterop.default({...})` @1047）；vendor 体不转录（B10 KX@dnd-kit 先例），XlsxDeepA/C declares = 边界占位） |

| `styles-CdEGpc2x.js` 46014–47548 + 47974–48571（内嵌区，双段） | 2133 | X09 code-view 引擎（vendored lru_map + Select/ContextMenu/Tooltip UI 套件 + diff/注解视图族） | n/a (API-shape) | chunk 内无版本串、package.json 无对应声明（库体随 styles chunk 内联打包）；区界实测（A1-P3-B12.report.md §二 全域普查 23 段）：46014–46033 rO+RRe mermaid diagram 插件工厂（X09 插件槽）、46171–46175 lO/HRe/uO 三内部件（gutter-slot 定位样式/`{display:'contents'}` slot 容器/noop 渲染器，消费全集皆 vendor 区内 URe@46202/SO@47146-47148/xO@47060/wO@47219）、46223–46948 pO+池类 **vendored lru_map UMD 内联**（`(n ||= self).lru_map`）+ 高亮 worker 池（generateRequestId req_N，消息型 initialize/file/diff）、47063–47110 $Re=**DiffViewer（X09）**、47222–47320 nze/rze=**DiffFilePairViewer/DiffPatchViewer**、47321–47461 ize…jO 18 符 diff 引擎助手带、47462–47548 Sze/Cze 注解滑杆/评论 UI、47974–48114 VO…$O 13 符 ContextMenu/Dropdown 套件、48115–48571 ek…Qze/dk 注解工具条/Tooltip 族；中段 47549–47973 为 app 包装带（~1,000 行 first-party，MO/BO/Qze 三面板候裁件，非本条目范围） | **是**（first-party 包装层 = app 包装带 47549–47973 区；边界占位六 declare 已覆 app 接引面：DiffViewer/PlainCodeBlock/HighlightedCodeBlockWithComments/isPlainTextLanguage（FileRewindDialogDeep@139 区）+ DiffFilePairViewer/DiffPatchViewer（CodeViewer@239/@247 区），B10 KX@dnd-kit 模式；vendor 体不转录，lO/HRe/uO 零 declare 裁定见 A1-P3-B12.report.md §2.2） |

## 附注

- **tier 纠正（4 条）**: `c4Diagram-AHTNJAMY-D_C9c5pc.js`、`chunk-U2HBQHQK-Cs90NbhX.js`、`journeyDiagram-VCZTEJTY-DrUKz0D3.js`、`sequenceDiagram-FGHM5R23-vIwWNFLy.js` 在 chunk-tiers.json 中被误归 grammar_data（其内容含 `displayName`/`patterns` 字样触发误判），实为 mermaid.core 图形 chunk。
- **styles-CdEGpc2x.js（first_party tier，213,695 行）** 不在本清单范围，但注意：它是 shiki 3.x/4.x core + Lexical 0.42.0 + @stripe/stripe-js 9.6.0/@stripe/react-stripe-js 6.4.0 的混合 mega-chunk，并静态导入两份 vscode-oniguruma wasm（wasm-B4ap0Fdc / wasm-CmMPG1ko）。Stage B 需要时另行拆分。〔A1-R49〕其内嵌 @dnd-kit/core+sortable vendored 区（91850–94592，现 chunk 行号口径 213,979 行）已按「chunk 内嵌 vendor 区」条目补登（A1-P3-B10 §3-2 提请，编排方 R49 分发）。
- 〔A1-R51〕`previewPaneOfficeXlsxContent-XeHwYdMn.js` 内嵌 vendored 区 28–1835（d3-geo/d3-hierarchy/topojson-client/regl）已按「chunk 内嵌 vendor 区」条目补登（A1-P3-B11 §4 提请，编排方 R51 分发；八名范围口径，regl 库体实跨 1835–9110，详见条目证据列）。
- 〔A1-R52〕`styles-CdEGpc2x.js` 内嵌 vendored 区 46014–47548 + 47974–48571（X09 code-view 引擎：vendored lru_map + Select/ContextMenu/Tooltip 套件 + diff/注解视图族，双段 2,133 行）已按「chunk 内嵌 vendor 区」条目补登（A1-P3-B12 §2.2 提请，编排方 R52 分发；lO/HRe/uO 三符零 declare 裁定 + 中段 app 包装带 47549–47973 除外口径，详见条目证据列）。
- **katex 版本存疑**: chunk 内无版本串；原 monorepo pnpm 路径注释证明 mermaid 自带副本为 0.16.25，参照安装为 0.16.45。
- **node_modules 参照**: /home/none/grok-build/ref-ui/zcode-restored/node_modules（recharts 3.8.0、mermaid 11.14.0、pdfjs-dist 5.4.296、react-pdf 10.4.1、docx-preview 0.4.0、shiki 3.23.0、@shikijs/* 4.0.2、tailwind-merge 3.5.0、tiny-invariant 1.3.3、js-yaml 4.1.1、fflate 0.8.3、@tanstack/react-virtual 3.13.23、lexical 0.42.0、@stripe/* 等）；安装不完整（无 cytoscape/dagre/graphlib/roughjs/react-intl，react 未装），故部分版本只能给上游声明区间。
- **wasm 伴随资产**: docx_wasm_bg-HWnIvdMf.wasm (1,119,333 B) 与 duke_sheets_wasm_bg-BCCK9PkU.wasm (4,345,449 B) 不在 chunk-tiers.json 中，作为伴随资产登记。
- 未修改 out/ 目录；本清单仅读取。
