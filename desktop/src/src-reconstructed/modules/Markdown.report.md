# Markdown 渲染 mega-chunk 解混淆报告（D8 Stage B2）

- 输入（均未修改，只读）：
  - `/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js`（21,756 行）
  - `/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/mermaid-GHXKKRXX-BUw9cQJG.js`（2 行 shim）
  - 关联懒加载分包：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/highlighted-body-OFNGDK62-RS9ZmWFH.js`（25 行，已在 `modules/highlightedCodeBlockBody.tsx` 重建）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx`（17,591 行，同 chunk 的 JSX 还原版；双行号口径 = js / jsx）
- 上游对照：`modules/VENDOR-MANIFEST-LIBS.md`、`node_modules/streamdown`（参照安装 2.5.0）
- 产物：`modules/MarkdownContext.tsx`、`MarkdownCodeBlock.tsx`、`MarkdownMermaid.tsx`、`MarkdownTable.tsx`、`MarkdownLink.tsx`、`MarkdownElements.tsx`、`MarkdownAnimate.tsx`、`MarkdownRenderer.tsx`、`MarkdownVendored.tsx`（共 4,980 行）+ 本报告

---

## 0. 重要勘误（三条）

1. **本 chunk 不含 Lexical 0.42.0 / @stripe/stripe-js 9.6.0 / shiki 本体。**
   任务描述称「内含 shiki/Lexical 0.42.0/Stripe 9.6.0 等 vendored 段」——经全文 grep（`lexical|LexicalNode|$createParagraphNode`、`stripe|Stripe(`、`ShikiError|getSingletonHighlighter|bundledLanguages|codeToTokens` 等），三类标记 **0 命中**。
   那个混合 mega-chunk 是 **styles-CdEGpc2x.js（213,695 行）**，VENDOR-MANIFEST-LIBS.md 附注已明确登记（「shiki 3.x/4.x core + Lexical 0.42.0 + @stripe/stripe-js 9.6.0 的混合 mega-chunk」）。本 chunk 与 shiki 的唯一关系是 **消费** 注入式高亮器：`shikiTheme` 选项 + `plugins.code`（`useContext(...)?.code`）+ `--shiki-dark*` CSS 变量（双主题输出约定）。
2. **本 chunk 的定性 = streamdown@2.5.0（vercel/streamdown，Apache-2.0），不是 ZCode 纯自研。**
   证据（把握度：高）：
   - 文件名哈希前缀与上游 `node_modules/streamdown/dist/chunk-BO2N2NFS.js` **逐字一致**（`BO2N2NFS`；`mermaid-GHXKKRXX`、`highlighted-body-OFNGDK62` 同样），ZCode 的 Vite 构建仅追加内容哈希；
   - `streamdown@2.5.0` package.json 依赖树（clsx/hast-util-to-jsx-runtime/html-url-attributes/marked/rehype-harden/rehype-raw/rehype-sanitize/remark-gfm/remark-parse/remark-rehype/tailwind-merge/unified/unist-util-visit(-parents)/remend）与 chunk 内 vendored 段组成 **一一对应**；
   - 上游 `dist/index.js` 导出表（Streamdown/Block/CodeBlock*/Table*/createAnimatePlugin/detectTextDirection/…）与 chunk 尾部 30 个导出符号的语义全部可对应；
   - `highlightedCodeBlockBody.tsx`（D8 前序产物）已逐行对照上游确认 `StreamdownContext/useCodeHighlighter/CodeBlockBody` 三符号。
   因此「自研层」在本报告中指 **streamdown 包的 first-party 组件层**（相对其 vendored 依赖树而言）——它也就是 ZCode 产品层面的「markdown 渲染层」本体。
3. **ZCode 真正的自研集成面在 styles-CdEGpc2x.js（F19 MarkdownFamily）**，不在本 chunk。
   styles 的 `cj` MarkdownRenderer（js 51688）以 `<Streamdown mode components shikiTheme …>` 方式消费本 chunk（`r as Pre` 导入，js 849/51736），注入自定义 `a` 渲染器（工作区文件链接 → 代码查看器）、`[lightTheme, darkTheme]` 主题对与代码预览设置。MODULE-MAP.md F19 已登记该族（46901–57651），抽取它属于后续 Stage。

---

## 1. vendor 段登记表（行号 = js / jsx；版本证据等级同 VENDOR-MANIFEST）

构建元数据：`__vite__mapDeps` + 7 条跨 chunk import，js 1–17。tailwind-merge/clsx 被 ZCode 去重为独立 chunk `bundle-mjs-D8tLE0rB.js`（导入 `s`=twMerge、`c`=clsx）。

| js 行 | jsx 锚点 | 上游库 | 版本 | 结构指纹 |
|---|---|---|---|---|
| 18–1120 | 1 | property-information | 7.1.0（node_modules-ref） | Schema/Info 类、`me`=html `he`=svg 合并 schema |
| 1121–1133 | — | zwitch | 2.0.4（node_modules-ref） | `_e` handlers/invalid/unknown 分派器 |
| 1134–1141 | — | ccount | 2.0.1（ref） | `ve` 子串计数 |
| 1142–1154 | — | comma-separated | ^1.0.2（上游声明） | `ye` parse / `be` stringify |
| 1155–1167 | — | space-separated | ^1.0.2（上游声明） | `xe` parse / `Se` stringify |
| 1168–1175 | — | hast-util-whitespace | 3.0.0（上游声明） | `we/Te` |
| 1176–1200 | — | micromark-util-character | 2.x（上游声明） | asciiAlpha/markdownLineEnding 等谓词群 |
| 1202–1214 | — | micromark-util-chunked + -combine-sets | 2.x | `Fe` 分块 splice / `Ie` |
| 1215–1223 | — | micromark-util-resolve-all | 2.x | `Le` |
| 1224–1272 | — | unist-util-is | 5.x | `Re` test 工厂 |
| 1273–1315 | 1232 | unist-util-visit-parents | 6.0.2（ref） | `Je`；`qe`=SKIP（1274） |
| 1316–1327 | 1268 | unist-util-visit | 5.1.0（ref） | `Xe` |
| 1328–1351 | 1278 | hast-util-parse-selector | 4.x | `Ze=/[#.]/g`、`Qe` |
| 1352–1454 | 1297 | hastscript | 9.x | `$e` 工厂；`st`=h（html）、`ct`=s（svg） |
| 1455–1462 | — | web-namespaces | 2.0.1（ref） | `lt` 六命名空间表 |
| 1463–1473 | — | longest-streak | 3.1.0（ref） | `ut` |
| 1474–1484 | — | micromark-util-factory-space | 2.x | `P` |
| 1485–1886 | 1414 | rehype-harden | 1.1.8（streamdown 声明） | `ft` 插件 + `dt` 策略枚举 + URL 校验 `_t/ht/gt` + 访问器 `St` |
| 1887–2166 | — | hast-util-from-parse5 | 8.x（hast-util-raw 9 声明） | `Rt` fromParse5 + 定位助手群 |
| 2167–7935 | 2110 | parse5 | 7.3.0（node_modules-ref） | `L` ErrorCodes、`mn` Preprocessor（`pn=65536`）、`En` EntityDecoder、`Un` Tokenizer（2,016 行）、`zr` Parser + 23 档插入模式 |
| 7936–8229 | 6454 | hast-util-raw | 9.1.0（ref） | `mo` raw()（parse5 重组 + stitch 注释） |
| 8230–8234 | 6643 | rehype-raw | 7.0.0（streamdown 声明） | `jo` |
| 8235–8520 | 6652 | hast-util-sanitize | ^6.0.0（rehype-sanitize 6 声明；ref 装 5.0.2 不匹配，以声明为准） | `No` GitHub 风格 defaultSchema + `Fo` sanitize |
| 8460–8520 | 6883 | rehype-sanitize | 6.0.0（streamdown 声明） | `Xo`（嵌于 sanitize 段内） |
| 8521–8541 | — | mdast-util-find-and-replace | 3.0.2（ref） | `$o/es/ts` |
| 8542–9092 | — | mdast-util-gfm（autolink-literal/strikethrough/table/task-list 的 from+to）+ mdast-util-to-markdown 助手 | 3.1.0 / 2.1.2（ref） | `is()`/`Ps()`/`Fs()` 等 |
| 9093–9177 | 7480 | mdast-util-to-string | 4.x | `cc` |
| 9178–9575 | — | mdast-util-to-markdown（+mdast-util-phrasing） | 2.1.2（ref） | `fc/pc`、`Fc` phrasing 类型表 |
| 9576–9595 | — | decode-named-character-reference + decode-numeric-character-reference | 1.3.0（ref）/ 1.x | `Gc`（textarea.innerHTML 解码）/`Kc` |
| 9596–9614 | 7840 | mdast-util-from-markdown 内部 decode | 2.0.3（ref） | `qc` 转义/实体正则 + `Jc` |
| 9609–9755 | — | mdast-util-gfm-table / -task-list-item（from+to，与上行交错） | 3.x | `Xc/il/al/ol` |
| 9755–12533 | 8289 | micromark core（shared/create-tokenizer/20+ constructs/initialize）+ micromark-extension-gfm | 2.x / 3.0.0（ref） | `hu` createTokenizer 类、`Vl` attention…`Hd` tasklistCheck（jsx 10024） |
| 12534–12546 | 10063 | remark-gfm | 4.0.1（streamdown 声明） | `Jd` |
| 12547–13301 | 10072 | remend | 1.3.0（streamdown 固定依赖；ref 一致） | esbuild `__spreadValues` 助手 + `Ep` 修复器表（bold/italic/inlineCode/strikethrough/katex/links）+ `Op` parseIncompleteMarkdown（jsx 10721） |
| 13304–13476 | 10744 | inline-style-parser | 0.5.x（style-to-object 声明） | `Np` CJS |
| 13455–13476 | — | style-to-object | 1.x（hast-util-to-jsx-runtime 声明） | `Ip` CJS（嵌于 `Np` 段尾） |
| 13476–13495 | — | unist-util-stringify-position | 4.0.0（ref） | `Lp/Rp/zp/Bp` |
| 13496–13552 | 10920 | vfile-message | 4.x | `Vp` VMessage |
| 13553–13831 | 10953 | hast-util-to-jsx-runtime | 2.3.6（streamdown 声明，ref 一致） | `Jp` 仓库 URL + `Yp` toJsxRuntime |
| 13832–13845 | 11208 | html-url-attributes | 3.0.1（streamdown 声明，ref 一致） | `_m` URL 属性登记表 |
| 13846–14182 | 11481 | micromark initialize（content/flow/text/document + constructs 命名空间） | 2.x | `vm/bm/wm/Em/Mm` |
| 14183–14462 | 11767 | micromark parse core（createParse/preprocess/postprocess） | 2.x | `Hm/Gm/Km/Jm` |
| 14463–15005 | 11804 | mdast-util-from-markdown | 2.0.3（ref） | `Xm` 入口 + `Zm` compile（479 行 handler 表）+ 尾部助手 |
| 15006–15017 | 12373 | remark-parse | 11.0.0（streamdown 声明） | `nh` |
| 15018–15597 | 13070 | mdast-util-to-hast | 13.2.1（ref） | `rh`…`Kh` handler 群 + `toHast` |
| 15598–15737 | 13087 | remark-rehype | 11.1.2（streamdown 声明） | `qh` |
| 15738–16019 | 13361 | vfile（browser path shim + VFile 类） | 6.0.3（ref） | `$h` basename/dirname/…、`fg` 字段表、`mg` |
| 16020–16196 | 13440 | unified | 11.0.5（streamdown 声明） | `vg` Processor 类 + `bg` 工厂 |
| 16196–16227 | — | trough | 2.x（unified 声明） | `xg…kg` |
| 16228–18291 | 13603/13923/15243 | marked | 17.x（streamdown 声明 ^17.0.1；chunk 内无版本串） | `jg` getDefaults、`X` edit()、`Ig` 正则表、`Q_` Tokenizer、`nv` Parser、`ev` Renderer、`tv` TextRenderer、`$_` Lexer（js 17333）、`rv` Hooks、`Z` 入口 |
| **18292–21756** | **15256–17591** | **streamdown first-party 组件层（= 重建对象，见 §2）** | **2.5.0（in-chunk：文件名哈希 + 上游 dist 对照）** | 见组件清单 |

---

## 2. 自研层（streamdown first-party）组件清单

行号 = js / jsx。上游导出名取自 `streamdown/dist/index.js`；构建导出别名取自 chunk 尾部导出表。

### 2.1 上下文 / 钩子 / 默认值（→ `MarkdownContext.tsx`）

| 混淆名 | 语义名 | js / jsx | 上游导出 | 说明 |
|---|---|---|---|---|
| `Xb` | StreamdownContext | 21176 / 17235 | StreamdownContext(A) | shikiTheme/controls/isAnimating/lineNumbers/mode/mermaid/linkSafety；**构建导出别名 i**（highlighted-body 消费） |
| `Jb` | DEFAULT_SHIKI_THEME | 21174 / 17231 | — | `['github-light','github-dark']` |
| `Yb` | DEFAULT_LINK_SAFETY | 21175 / 17232 | — | `{enabled:true}` |
| `qb` | STREAMDOWN_CARET_SYMBOLS | 21173 / 17230 | — | `{block:' ▋',circle:' ●'}` |
| `ty/ny` | StreamdownPluginsContext / useStreamdownPlugins | 19610 / 16111 | — | plugins（code/mermaid/cjk/math/renderers） |
| `ry` | useCodeHighlighter | 19612 / 16113 | —（内部） | **构建导出别名 n**（highlighted-body 消费） |
| `iy` | useMermaidPlugin | 19613 / 16114 | — | |
| `ay` | useCustomBlockRenderer | 19614 / 16115 | — | 按语言查 renderers |
| `bv/xv` | IsStreamingContext / useIsStreaming | 18470 / 15425 | — | 末块未完成标记 |
| `Ev/Q` | ClassNamesContext / useClassNames | 18495 / 15443 | — | cn 走上下文（支持 prefix） |
| `Sv/Cv/wv` | streamdownCn / prefixClasses / createPrefixedCn | 18472–18483 / 15427 | — | twMerge(clsx(…)) |
| `Tv` | downloadFile | 18484 / 15437 | — | CSV 前置 BOM |
| `Ov` | parseInlineStyle | 18510 / 15446 | — | shiki rootStyle 解析 |
| `Dv` | STREAMDOWN_LINE_NUMBER_CLASS | 18497 / 15445 | — | CSS counter 行号类 |
| `Lv` | DEFAULT_STREAMDOWN_ICONS | 18731 / 15548 | — | 10 个内联 SVG（Check/Copy/Download/ExternalLink/Loader2/Maximize2/RotateCcw/X/ZoomIn/ZoomOut） |
| `Rv/zv/Bv/Vv` | StreamdownIconsContext / iconsAreEqual / StreamdownIconsProvider / useStreamdownIcons | 18934 / 15560 | — | |
| `Hv/Uv/Wv` | DEFAULT_STREAMDOWN_TRANSLATIONS / TranslationsContext / useStreamdownTranslations | 18950 / 15585 | defaultTranslations(h) | 30 条文案 |
| `Zv/Qv/$v` | 滚动锁（计数/加锁/解锁） | 19481 / 16057 | — | 全屏/模态共用 |

### 2.2 代码块族（→ `MarkdownCodeBlock.tsx`）

| 混淆名 | 语义名 | js / jsx | 上游导出 | 说明 |
|---|---|---|---|---|
| `kv` | CodeBlockBody | 18522 / 15458 | CodeBlockBody 内部（**构建导出别名 t**，highlighted-body 消费） | shiki token 渲染；`--sdm-*`/`--shiki-dark*` 双主题变量链；CSS counter 行号；memo |
| `Av` | CodeBlockContainer | 18615 / 15483 | CodeBlockContainer(d) | `data-streamdown=code-block`；content-visibility |
| `jv/Mv` | CodeBlockContext / useCodeBlockContext | 18629 / 15496 | — | `{code}` |
| `Nv` | CodeBlockHeader | 18629 / 15498 | CodeBlockHeader(e) | 语言名条 |
| `Pv` | trimTrailingNewlines | 18650 / 15508 | — | |
| `Fv` | LazyHighlightedCodeBlockBody | 18650 / 15510 | — | `lazy(import('./highlighted-body-OFNGDK62-…'))` |
| `Iv` | CodeBlock | 18660 / 15513 | CodeBlock(g) | 头+动作条+Suspense（fallback=raw 降级） |
| `Gv` | CodeBlockCopyButton | 18983 / 15618 | CodeBlockCopyButton(i) | clipboard + 2s check 态 + isAnimating 禁用 |
| `Kv` | LANGUAGE_FILE_EXTENSIONS | 19032 / 15657 | — | ~300 项语言→扩展名（含 `文言:'wy'`） |
| `qv` | CodeBlockDownloadButton | 19340 / 15965 | CodeBlockDownloadButton(j) | |
| `Jv` | CodeBlockSkeleton | 19368 / 15993 | CodeBlockSkeleton(k) | 灰条+spinner |

### 2.3 Mermaid 族（→ `MarkdownMermaid.tsx`；含 3 行 shim）

| 混淆名 | 语义名 | js / jsx | 上游导出 | 说明 |
|---|---|---|---|---|
| `av/ov/sv` | 懒渲染常量（300ms/300px/500ms） | 18292 / — | — | |
| `cv` | useLazyRender | 18295 / 15256 | —（内部） | IntersectionObserver + requestIdleCallback |
| `oy` | downloadSvgAsPng | 19626 / 16120 | — | SVG→5x canvas→PNG blob |
| `sy` | MermaidDownloadDropdown | 19653 / 16142 | — | SVG/PNG/MMD 三档 |
| `cy` | MermaidFullscreenButton | 19759 / 16201 | — | portal 全屏 + 内嵌重渲染 |
| `$b` | ZoomableContent | 21463 / 17421 | — | 滚轮缩放/指针拖拽/控制簇（0.5–3x，步进 0.1） |
| `ex` | **Mermaid** | 21620 / 17524 | mermaid-GHXKKRXX 再导出为 `Mermaid`（**构建导出别名 a**） | 四相位：占位→loading('Loading diagram...')→error(自定义/内置红框+Show Code)→ZoomableContent 包 svg（`data-streamdown=mermaid`，role=img）；id=`mermaid-<hash>-<ts>-<rand>` |
| `by` | LazyMermaid | 20282 / 16517 | — | `lazy(import('./mermaid-GHXKKRXX-…'))` |
| shim | mermaid-GHXKKRXX-BUw9cQJG.js | 全文件 2 行 | — | `import {a as e} from './chunk-BO2N2NFS-…'; export {e as Mermaid}` —— 上游 `dist/mermaid-GHXKKRXX.js` 的同构再导出 |

### 2.4 表格族（→ `MarkdownTable.tsx`）

| 混淆名 | 语义名 | js / jsx | 上游导出 |
|---|---|---|---|
| `ly` | extractTableDataFromElement | 19849 / 16254 | m |
| `uy` | tableDataToCSV | 19867 / 16272 | n |
| `dy` | tableDataToTSV | 19896 / 16300 | o |
| `fy` | escapeMarkdownTableCell | 19931 / 16333 | p |
| `py` | tableDataToMarkdown | 19946 / 16344 | q |
| `my` | TableCopyDropdown | 19956 / 16354 | r（ClipboardItem 双 MIME：text/plain + text/html） |
| `hy` | TableDownloadDropdown | 20062 / 16417 | s |
| `gy` | TableFullscreenButton | 20144 / 16455 | t（sticky 表头全屏） |
| `_y` | TableWrapper | 20238 / 16495 | —（`data-streamdown=table-wrapper`） |

### 2.5 链接 / 图片 / 元素族（→ `MarkdownLink.tsx` + `MarkdownElements.tsx`）

| 混淆名 | 语义名 | js / jsx | 备注 |
|---|---|---|---|
| `ey` | LinkSafetyModal | 19488 / 16064 | 外链确认（复制/打开；`data-streamdown=link-safety-modal`） |
| `My` | MarkdownA | 20374 / 16583 | linkSafety 开启 → button+确认流；`streamdown:incomplete-link` 占位豁免 |
| `Sy/$` | nodesHaveEqualPosition / memoPropsAreEqual | 20290 / 16521 | mdast position 相等 |
| `Cy/wy/Ty/Ey` | resolveControlFlag / Table / Code / Mermaid | 20304 / 16537 | 控件开关解析 |
| `Dy…Ry` | MarkdownOl/Li/Ul/Hr/Strong/H1–H6 | 20320–20496 / 16549–16625 | 全部 `data-streamdown` 标记 + memo |
| `zy/By/Vy/Hy/Uy/Wy` | MarkdownTable/Thead/Tbody/Tr/Th/Td | 20512–20567 / 16631–16667 | |
| `Gy/Ky/qy` | MarkdownBlockquote/Sup/Sub | 20581–20603 / 16673–16688 | |
| `Jy` | MarkdownSection | 20653 / 16694 | data-footnotes 空脚注剔除 |
| `Yy` | MarkdownCode | 20660 / 16780 | 四分派：inline / 自定义渲染器 / mermaid 块（动作条+LazyMermaid）/ CodeBlock；meta 解析 `startLine=`/`noLineNumbers` |
| `Xv/Xy` | MarkdownImg | 19383+20763 / 16003+16833 | 失败降级 + 悬停下载（MIME 推断扩展名） |
| `Zy` | MarkdownParagraph | 20765 / 16843 | 单图/单代码块透传 |
| `Qy` | STREAMDOWN_COMPONENTS | 20778 / 16856 | 26 标签映射（含 pre→data-block 克隆） |
| `$y/eb/tb` | RTL/字母正则 + detectTextDirection | 20809 / 16890 | 上游导出 u |

### 2.6 动画插件（→ `MarkdownAnimate.tsx`）

| 混淆名 | 语义名 | js / jsx | 上游导出 |
|---|---|---|---|
| `lv…vv` | 切分/跳过标签/动画 span 助手群 | 18380–18436 / 15300–15388 | — |
| `yv` | createAnimatePlugin | 18437 / 15389 | createAnimatePlugin(a)（`--sd-animation/--sd-duration/--sd-easing/--sd-delay`；已渲染字符不重播） |

### 2.7 渲染器主体（→ `MarkdownRenderer.tsx`）

| 混淆名 | 语义名 | js / jsx | 上游导出 |
|---|---|---|---|
| `nb/rb` | 代码栅栏/表格分隔行正则 | 20822 / 16898 | — |
| `ib` | isCodeFenceIncomplete | 20824 / 16900 | useIsCodeFenceIncomplete(b) 的等价内联版 |
| `ab` | hasIncompleteTableDivider | 20846 / 16922 | — |
| `ob` | htmlToTextPlugin | 20857 / 16933 | —（无 rehype-raw 时防崩） |
| `sb…ub` | EMPTY_PLUGINS / DEFAULT_REMARK_REHYPE_OPTIONS / pluginNamesCache / ProcessorCache | 20862–20928 / 16938–16941 | —（LRU 100，按插件名+选项序列化键） |
| `db` | MarkdownProcessor | 20929 / 17000 | —（parse→runSync→renderHast 同步） |
| `fb/pb/mb` | getProcessor / hasRehypeRaw / createProcessor | 20935–20948 / 17006–17013 | — |
| `hb/gb/_b/vb/yb` | identity / removeRawNode / transformElementUrls / shouldSkipElement / renderHast | 20949–21000 / 17020–17063 | —（toJsxRuntime passKeys+passNode） |
| `bb…jb` | 脚注/HTML/数学正则群 + **parseMarkdownIntoBlocks** | 21001–21100 / 17064–17100 | parseMarkdownIntoBlocks(w)；marked.lex 切块 + 未闭合 HTML/$$ 合并 + 脚注单块 |
| `Mb/Nb/Pb/Fb` | preserveHtmlBlocks / 转义正则 / escapeLiteralTagContent | 21101–21131 / 17156–17186 | — |
| `Ib/Lb` | getTextContent / literalTagContentPlugin | 21132–21145 / 17187–17199 | — |
| `Rb` | codeMetaPlugin | 21146 / 17200 | —（code.meta→hProperties.metastring） |
| `zb/Bb/Vb` | normalizeHtmlIndentation | 21154 / 17208 | normalizeHtmlIndentation(x) |
| `Hb` | STREAMDOWN_SANITIZE_SCHEMA | 21146–21155 / 17200 | —（defaultSchema + tel: + code[metastring]） |
| `Ub` | DEFAULT_REHYPE_PLUGINS | 21156 / 17210 | defaultRehypePlugins(y)；**构建导出别名 o**（styles 消费） |
| `Wb/Gb/Kb` | DEFAULT_REMARK_PLUGINS / 默认值数组 | 21170 / 17224 | defaultRemarkPlugins(z) |
| `Zb` | **Block** | 21185 / 17244 | Block(B)（memo；动画记账 + dir 包裹 + IsStreaming 注入） |
| `Qb` | **Streamdown** | 21228 / 17276 | Streamdown(C)；**构建导出别名 r**（styles 的 `cj` MarkdownRenderer 消费）——static 整篇 / streaming 分块（remend→切块→Block[]，useTransition 降级、caret、逐块 dir=auto、animate） |

---

## 3. 自研层行占比

| 段 | js 行范围 | 行数 | 占比 |
|---|---|---|---|
| 构建元数据（__vite__mapDeps + imports） | 1–17 | 17 | 0.08% |
| vendor 段（§1 全部条目） | 18–18291 | 18,274 | 84.00% |
| **自研层（streamdown first-party，§2）** | **18292–21756** | **3,465** | **15.93%** |
| 合计 | | 21,756 | 100% |

计入伴随 first-party 分包：`mermaid-GHXKKRXX`（2 行）+ `highlighted-body-OFNGDK62`（25 行）——三 chunk 合计 21,783 行，自研层合计 3,492 行，占 **16.03%**。
（对照 jsx 版：自研层 = jsx 15256–17591，2,336 行 / 17,591 = 13.3%，压缩前后比例一致。）

---

## 4. 跨 chunk 消费面（构建导出表 → 消费方）

| 构建导出 | 内部名 | 语义 | 消费方 |
|---|---|---|---|
| `a` | `ex` | Mermaid | mermaid-GHXKKRXX shim（再导出） |
| `i` | `Xb` | StreamdownContext | highlighted-body |
| `n` | `ry` | useCodeHighlighter | highlighted-body |
| `t` | `kv` | CodeBlockBody | highlighted-body |
| `r` | `Qb` | Streamdown | styles-CdEGpc2x（`Pre`，cj MarkdownRenderer 主体） |
| `o` | `Ub` | DEFAULT_REHYPE_PLUGINS | styles（`Mre`） |
| `d/u` | `ct/st` | hastscript s/h | styles（`Dre/Fre`） |
| `f/m/p/h` | `Xe/Je/qe/Re` | visit / visitParents / SKIP / unist-util-is | styles（`Ore/jre/Nre/kre`） |
| `k/l` | `de/lt` | property-information find / web-namespaces | styles（`Are/qi`） |
| `s/v/y/g` | `P/Fe/j/Le` | factory-space / chunked splice / markdownLineEnding / resolveAll | styles（`Ji/Yi/Xi/Ki`） |
| 未消费残余 | `A/C/D/E/O/S/T/_/b/c/w/x` | property-information/hast 段符号 | （树摇残留，无静态/动态消费方） |

---

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| 定性 = streamdown@2.5.0 | **高** | 文件名哈希前缀与上游 dist 逐字一致；依赖树与 chunk 内 vendor 段一一对应；上游导出表全量可映射；highlighted-body 已逐行对照 |
| §1 vendor 段边界与版本 | **高**（主库）/ **中-高**（mdast-util-gfm 系交错小段） | 每段有结构指纹（类名/常量/错误串），多数与 node_modules 参照源码核对；版本以 in-chunk > upstream-decl > node_modules-ref 分级标注，hast-util-sanitize 按 rehype-sanitize 6 声明取 ^6.0.0（参照装 5.0.2 不匹配，已注明） |
| §2 自研层 JSX/类名/data 属性/文案字符串 | **高（逐字转录）** | 直接从压缩源码还原，未改动任何类名与字符串 |
| 钩子逻辑（懒渲染/缓存/切块/动画/控件解析） | **高** | 逐语句对照；依赖数组与分支条件一致 |
| TS props/上下文类型 | **中高（推断）** | 由默认值与消费面归纳；上游 `dist/index.d.ts` 未逐条核对 |
| 「不含 Lexical/Stripe/shiki」勘误 | **高** | 全文多组标记 grep 0 命中 |

---

## 6. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`：9 个文件全部解析通过（0 错误）。
- `tsc --noEmit --strict`（target ES2022 + DOM，jsx react-jsx，@types/react 18.3.31 环境 = `/home/none/grok-build/web/node_modules`）：**exit 0，0 错误**。
  （产物位于 zcode-restored 下，该目录无 node_modules，验证在 /tmp/mdverify 临时副本上进行，方法同 TopBar 试点。）
- `out/` 目录未做任何修改（只读访问）。

## 7. 后续建议

1. styles-CdEGpc2x.js 的 F19 MarkdownFamily（`cj` MarkdownRenderer 等，46901–57651）是 ZCode 真正自研的 markdown 集成层（文件链接渲染器/代码预览设置/主题接线），建议作为下一个 Stage B 条目。
2. VENDOR-MANIFEST-LIBS.md 中本 chunk 条目可更新为「streamdown@2.5.0（vendor）+ first-party 组件层 16%」，并把「Lexical/Stripe/shiki 混合」明确限定在 styles-CdEGpc2x.js。
3. `@streamdown/cjk|code|math|mermaid` 四个插件包（1.0.3/1.1.1/1.0.2/1.0.2，参照安装）的实现不在本 chunk（经 `plugins` prop 注入），如需要可另立条目登记其宿主侧落点。
