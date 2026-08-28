# F19 MarkdownRenderer 集成层解混淆报告（D8 Stage B3）

- 输入（均未修改，只读）：
  - `/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行）
  - 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行；双行号口径 = js / jsx）
- 前置产物：`modules/Markdown*.tsx`（streamdown@2.5.0 first-party 层，D8 Stage B2；见 `Markdown.report.md`）
- 产出：`modules/MarkdownIntegration.tsx`（2,749 行）+ 本报告
- 任务登记：MODULE-MAP.md F19（js 46901–57651）；Markdown.report.md §0.3 / §7.1 后续 Stage

---

## 0. 定性

styles-CdEGpc2x.js 的 `cj`（js 51688 / jsx 46461，`displayName = 'MessageResponse'`，js 51856）是 **ZCode 自研的 markdown 集成层**：它不实现任何解析/渲染算法，而是把 chunk-BO2N2NFS 的 streamdown first-party 层（`Pre` = 构建导出 `r` = `Streamdown`）与 ZCode 产品面（工作区文件链接、代码查看器、mermaid 预览、编辑器打开方式、主题/字号设置）接线起来。本文件抽取其**消费面**：装配主体、shiki 注入、主题/插件/自定义块渲染器接线、Conversation 耦合点。

## 1. 装配链（cj → Streamdown → contexts）

```
Conversation 行 hvt (js 112357 / jsx 95832)
  └─ <cj streaming workspacePath/Identity/RemoteSessionId theme codePreviewSettings
        onOpenCodeViewer onOpenFileLink onOpenExternalUrl>{row.text}</cj>
cj (51688)
  ├─ 文本管线：oj children→text → uVe 图片行折叠 → yHe 数学$转义 → f (markdown)
  ├─ 模式：bHe(streaming) → 'streaming'|'static'；resetKey = streaming?`streaming:m`:`m:fHe(f)`
  ├─ 主题：EHe(theme, settings) → codeBlockTheme；shikiTheme = [settings.lightTheme, settings.darkTheme]
  ├─ key：DHe(...) → <Streamdown key>（主题/字号/折行/工作区任一变化整树重建）
  └─ xHe 错误边界（渲染崩溃 → 纯文本降级，resetKey 变化复位；componentDidCatch 记
     `[MessageResponse] markdown 渲染失败，已降级为纯文本`）
     └─ Pre = Streamdown（chunk-BO2N2NFS 导出 r；MarkdownRenderer.tsx Qb）
        ├─ components：a / img / p / h1-h6 / strong / code / blockquote / li / ol / ul / table 族（§4）
        ├─ plugins：$Ve = {cjk, code=shiki, math=katex, mermaid}（§3）
        ├─ rehypePlugins：THe = [wHe 文件链接重写, ...Object.values(Mre=DEFAULT_REHYPE_PLUGINS)]
        ├─ linkSafety {enabled:false}（ZCode 自有外链菜单替代 streamdown 弹窗）
        ├─ controls {table:{fullscreen:false}}（MBe 自带全屏）
        └─ parseIncompleteMarkdown = streaming；animated/isAnimating = false
Streamdown 内部 Provider 树（MarkdownContext.tsx）：
  Translations → Plugins(StreamdownPluginsContext) → StreamdownContext(shikiTheme/controls/mode…)
  → Icons → ClassNames；plugins.code 经 useCodeHighlighter 流入 CodeBlockBody
  （MarkdownCodeBlock.tsx，`--shiki-dark*` 双主题变量消费方）
```

证据（把握度：高）：`Pre` 导入 js 849（`r as Pre`，同块 855 行 `from "./chunk-BO2N2NFS-CSNAeaxF.js"`）；`Mre`（`o`）= DEFAULT_REHYPE_PLUGINS 与 Markdown.report.md §4 跨 chunk 消费表逐字吻合；cj 的 props 面与 Conversation.tsx 已声明的 `MarkdownRenderer` 接口（jsx 46461 契约）一致。

## 2. shiki 高亮注入证据（100520–104621 + 注入点）

注入点链（把握度：高，逐字对照）：

1. `$Ve.code = TIe = wIe()`（js 51186 / 43695，jsx 46054 / 39365）：插件对象
   `{name:'shiki', type:'code-highlighter', supportsLanguage, getSupportedLanguages, getThemes, highlight}`；
   `highlight({code,language,themes}, onReady)` → `CIe(lang, themes)` → `Id({themes, langs:[lang], engine: yIe})`
   → `t.codeToTokens(code, {lang, themes:{light, dark}})` —— **shiki 标准双主题 token API**；
   结果缓存 `nE`（前100+后100 采样键 `SIe`），异步经 `rE` 回调集通知（首返 null）。
2. `Id`（js 13191）= `Xue({langs: Td, themes: Ed, engine: () => Fd(import('./wasm-B4ap0Fdc.js'))})`，
   解构 `codeToHtml/codeToHast/codeToTokens/getSingletonHighlighter/…` —— shiki core 工厂面。
3. `yIe = Ep({forgiving: true})`（js 43632）；`Ep`（js 15923）= JS 正则 oniguruma 引擎工厂
   （`createScanner/createString`），与 wasm 引擎并存的 forgiving 路径。
4. 语言/主题元数据：`wd`（js 10880，别名表 `bIe` + 支持集 `$T` + 归一 `eE`）、`Td`（js 12440）。
5. **100520–104621 = shiki 懒加载登记段**（任务给定区间，逐段核对）：
   - 100520–100541：esbuild CJS 互操作助手（`uQ/but/xut/Sut`）；
   - 100542–102138：`dQ` bundledLanguages ≈200 条，逐条 `import: () => Y(() => import('./<lang>-<hash>.js'), [], import.meta.url)`（jsx 86706 起）；
   - 102139–102140：`Cut/wut` id/alias → import 映射；
   - 102141–102544：bundledThemes 登记（`github-light` 102254 起，含 -default/-high-contrast 变体）；
   - 102545–102800：oniguruma **wasm 绑定**（`fQ` OnigError / `hQ` OnigString / OnigScanner / `mQ` binding；`Must invoke loadWasm first.`）；
   - 103150–104494：textmate Registry（`_onigLib`）+ 语法/主题归一尾段（缺省回退 `github-light`，104494）；
   - 104600–104621：段尾接入消费面（`Oft/kft/VQ` 轻量 diff 高亮预览，同用 `lo` 设置与 github-* 主题对）。
6. 主题接线：`shikiTheme: b = [l.lightTheme, l.darkTheme]`（cj，js 51742 区）→ StreamdownContext；
   `code` 渲染器另把 `EHe` 解析的单主题 `y` 交给 `gk`→`MO`（高亮体）；默认 `lo = {github-light, github-dark, showLineNumbers:true, wrapLongLines:false, fontSizePx:12}`（js 1040 / jsx 93）与 MarkdownContext.tsx `DEFAULT_SHIKI_THEME` 同族。

与 Markdown.report.md §0.1 勘误互证：chunk-BO2N2NFS **不含** shiki 本体，仅消费注入；本体（core + wasm + 懒加载登记）落在 styles 的 3900–18000（core/引擎）与 **100520–104621（登记段）**。

## 3. 主题 / 插件 / 自定义块渲染器接线

- 主题：`EHe`（system→matchMedia；`dark|zai-dark`→darkTheme）；`kft`（104615）= 同逻辑复用於 diff 预览。
- 插件表 `$Ve`：cjk=`vIe`（`_Ie()`：remark 前 `sIe` + 后 `gIe` autolink 尾标点切分 / `lIe` micromark 扩展）；
  code=`TIe`（§2）；math=`xE({singleDollarTextMath:true})`（katex，`remarkPlugin/rehypePlugin/getStyles`）；
  mermaid=`RRe=rO()`（mermaid 门面：initialize/render 懒初始化；`nO` 默认 config）。
- 自定义块渲染器（components 映射，逐字类名/data 属性转录）：
  - `a`：工作区文件链接 → `RHe`（右键「打开方式」编辑器菜单，`zcode-last-editor-id` 记忆，远控工作区门控）/ `onOpenFileLink|onOpenCodeViewer` 回调；http(s) → `IHe`（app-browser vs external-browser 分流菜单）；其余 → 纯 span（`nj` 类）；
  - `code`：无 `data-block` → 行内 code；有 → `gk` ZCode 代码块（`fk` ctx + mermaid 门控 `Oze/Pze`（复杂度度量 `Nze`：20k 字符/600 行/1500 分）+ `BO` 内嵌 mermaid 串行队列渲染 + `MO` 高亮体 + `Qze` 全屏）+ `pk` 语言条；流式期 `enableSyntaxHighlighting/renderMermaid = !streaming`；
  - `img` → `mVe`（本地图片 `readMediaPreview` data-url、失败降级、画廊灯箱 `Wk`）；`p` → `dVe`（全图段落 → `qk` 画廊组）；
  - `h1-h6` → `sj`（`nHe` 类名表）；`strong/blockquote/li/ol/ul/thead/tbody/tr/th/td` 逐字；
  - `table` → `MBe`（粘性横向滚动条 + 全屏预览；几何模型 `vBe…Fk/jBe` 逐字收录，交互 handler 群 js 49180–49640 摘录为行为注释，本文件保留接口）。
- rehype：`THe = [wHe, ...Object.values(Mre)]`；`wHe` 递归重写 `a[href]/img[src]` 的工作区相对路径
  （`CHe` 判定 + `SHe` 规范 href：Win 盘符转正、补 `./`、`:line[:col]` 后缀）。

## 4. 与 Conversation 行的耦合点

- 主耦合：`hvt` AssistantMessageRow（js 112357 / jsx 95832，memo）—— `streaming = row.state==='streaming'`、
  `children = row.text`，工作区三元组 + theme + codePreviewSettings + 三回调全部来自行 context
  （Conversation.tsx 3299–3345 已重建该行，接口与本文件 `MarkdownRendererProps` 互洽）。
- 其余消费面：`zAt` RepoWikiPane 分帧渲染（js 133196–133234，`FAt`  chunk 渐进 + perf 日志）；
  `_j` CodingPlan 信息弹窗（52014）；diff/预览卡群（99830/99893/106077/106152/107716/107886/108521）；
  帮助/设置等（129336/160334/182266）。
- memo 比较器逐字：children/streaming/streamingAnimationKey/工作区三元组/theme/settings/三回调引用相等。

## 5. 抽取范围与行占比

| 段 | js 行 | 处置 |
|---|---|---|
| cj 主体 + memo + displayName | 51688–51856 | 逐字重建 |
| 文本管线/数学转义/边界/主题/链接解析 | 50405–51673（含 hA/gA/uVe/dVe/mVe 50467–50712） | 逐字重建（mVe/dVe 全量） |
| 插件四件套 + shiki 注入 | 43471–43780、44373–44385、45960–45990 | 逐字重建（sIe/cIe/sLe/XIe 声明） |
| 代码块 UI 族 fk/nBe/pk/gk/_k/iBe/vk + mermaid 门控 + BO | 47661–48891 | 逐字重建（MO/Qze 接口） |
| 元素渲染器 + 表格几何 | 48892–49760、48936–49089 | 逐字（MBe 组件接口 + 几何逐字） |
| shiki vendored 登记段 | 100520–104621 / core 3900–18000 | 证据登记 + 消费面声明（不转录 vendored 本体） |
| 横切原语（ContextMenu/Dialog/Button/Tooltip/图标/services/stores） | 分散 | 接口声明（同 TopBar/Conversation 口径） |

## 6. 把握度

| 部分 | 把握度 | 依据 |
|---|---|---|
| cj 装配链与 props/memo 契约 | 高 | 逐语句对照；与 Conversation.tsx 既有声明互洽 |
| shiki 注入链（wIe→Id→codeToTokens；100520–104621 分段） | 高 | API 面逐字（codeToTokens/themes{light,dark}/getSingletonHighlighter/wasm import）；区间边界实读 |
| components 自定义块渲染器类名/data 属性/文案键 | 高 | 逐字转录 |
| MBe 交互 handler 群、MO/Qze/Wk 内部 | 中 | 接口化 + 行为注释（几何模型逐字） |
| TS props/上下文类型 | 中高 | 由默认值与消费面归纳 |

## 7. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`：解析通过（0 错误）。
- `tsc --noEmit --strict`（target ES2022 + DOM，jsx react-jsx，@types/react 18.3.31 = `/home/none/grok-build/web/node_modules`，TS 5.6.3）：**exit 0，0 错误**（/tmp/mdverify 临时副本，含 MarkdownContext/Renderer/Vendored/Elements/CodeBlock/Link/Table/Mermaid/Animate 依赖闭包）。
- `out/` 未修改（只读）。

## 8. 后续建议

1. F19 余量：预览卡群（50618–51687）、`MBe` 交互 handler 全量、`MO` 代码查看器（47501–47660，行注释/选择）可另立子 Stage。
2. `@streamdown/cjk|code|math|mermaid` 宿主侧落点已在本文件以插件工厂形式闭合（vIe/TIe/xE/rO），VENDOR-MANIFEST 可注明「四插件由 styles 注入，非分包自带」。
