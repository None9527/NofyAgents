# chart 包装 / utils / IME 族恢复报告（D8 Stage B2）

- **范围**：`out/renderer/assets/` 下 3 个 chunk（只读，未修改）：
  | chunk | 行数 | 定性 |
  |---|---|---|
  | `chart-iT2j9K3u.js` | 14,496 | recharts@3.8.0 vendored 本体（登记制）+ shadcn/ui chart 包装层（全量重建） |
  | `utils-CEEH0K_K.js` | 18 | first-party `cn`（shadcn lib/utils.ts 的 ZCode 定制版；全量重建） |
  | `imeComposition-DEYFkwWm.js` | 12,605 | vendored 库群（登记制）+ first-party 层（全量重建） |
- **产物**：`src-reconstructed/modules/ChartShadcn.tsx`、`UtilsCn.tsx`、`ImeComposition.tsx`（本文件为族级报告）
- **恢复日期**：2026-08-26
- **标样**：`TopBar.tsx`（依赖登记/接口重建体例）+ `appUsageChartPalette.tsx`（recharts 对照法：导出表 → 内部名 → 上游源码逐节比对 → 消费者用法交叉验证）
- **交叉材料**：`chartVendor.report.md`（recharts 本体别名登记，D2 批次产出）、`VENDOR-MANIFEST-LIBS.md`、`button.tsx`（cva/createLucideIcon 重建）

---

## 1. chart-iT2j9K3u.js — shadcn 包装层身份判定

### 1.1 recharts 本体（登记制，不逐行还原）

本体登记详见 `chartVendor.report.md`（~140 个别名 → recharts 上游文件的完整映射）。
本报告补充 **chunk 区域布局**（行号以 `.js` 为准）：

| 行范围 | 内容 | 证据 |
|---|---|---|
| 1–807 | d3-array 子集 + CJS/interop 助手 | quickselect `Ue`(73)、quantile `Ge`(121) |
| 808 | React interop `j = t(r())` | — |
| 811–818 | recharts util 两张属性长表 | `svgPropertiesNoEvents.js` / `excludeEventProps.js`（node_modules 逐文件命中） |
| ~860–907 | recharts container/Surface.js | `recharts-surface`(907) |
| 2556–2600 | redux（minified） | `@@redux/INIT`(2561) |
| 2717–2837 | immer | `immer-nothing/-draftable/-state` Symbol |
| 3903 | @reduxjs/toolkit | minified 错误消息 URL |
| 4662 | recharts ResponsiveContainer（`Zc`，**未导出**） | initialDimension(4462/4559/4572)；与 `es6/component/ResponsiveContainer.js` 逐节一致 |
| 5324–5336 | react-redux | `react-redux-context` Symbol |
| 5601 | recharts Legend（`Ju`） | displayName `Legend` |
| 6061–6073 | d3-shape 曲线映射表 | curveBasis…curveStepBefore |
| 7577–8422 | decimal.js-light | `[DecimalError]` |
| 9872–9875 | tooltipSlice actions `b_/x_/C_` | pilot 已运行时验证 |
| 10873–10914 | eventemitter3 + recharts eventBus | `rechartsEventEmitter` Symbol |
| 11238 | recharts Tooltip（`xb`） | 全 tooltip props 面 |
| 11797/12158/12267 | Text/Label/LabelList | displayName |
| 12349–12377 | react-is | isFragment |
| 13555–13573 | recharts store/`rT` Provider（导出 `u`） | RTK configureStore + react-redux Provider |
| 14033 | CategoricalChart 渲染壳 | `recharts-wrapper` |
| 14090–14136 | Surface 紧凑形态（`IT`，导出 `o`） | compact/title/desc |
| **14137–14344** | **★ shadcn/ui chart 包装层（first-party，本次重建）** | 见 §1.2 |
| 14345–14496 | export 块（~160 别名） | — |

### 1.2 shadcn 包装层符号表（把握度：**高**，逐字转录）

| 内部名 | 导出别名 | 语义名 | js 行 | 判定依据 |
|---|---|---|---|---|
| `VT` | `t` | `ChartContainer` | 14146–14166 | data-slot=chart、`chart-${id ?? useId().replace(/:/g,'')}`、`--color-*` 注入、ResponsiveContainer 包裹 —— 与 shadcn chart.tsx 逐节一致 |
| `HT` | （未导出） | `ChartStyle` | 14167–14187 | THEMES={light:'',dark:'.dark'} 双段 `<style>` 注入 |
| `zT` | （未导出） | `ChartContext` | 14140 | createContext(null) |
| `BT` | （未导出） | `useChart` | 14141–14145 | 错误文案 `useChart must be used within a <ChartContainer />`（shadcn 原文） |
| `UT` | `i` | `ChartTooltip` = recharts Tooltip 再导出 | 14188 | `UT = xb`；xb 与 `es6/component/Tooltip.js` 一致 |
| `WT` | `a` | `ChartTooltipContent` | 14189–14295 | indicator=dot/line/dashed、nestLabel、`--color-bg/--color-border` 指示器 —— 与 shadcn 逐节一致 |
| `GT` | `n` | `ChartLegend` = recharts Legend 再导出 | 14296 | `GT = Ju`；Ju.displayName='Legend' |
| `KT` | `r` | `ChartLegendContent` | 14297–14333 | verticalAlign top→pb-3、`[&>svg]:h-3` —— 与 shadcn 一致 |
| `qT` | （未导出） | `getPayloadConfigFromPayload` | 14334–14344 | payload→payload.payload 两级字符串键反查 |
| `LT` | （未导出） | `THEMES` | 14138 | `{light:'',dark:'.dark'}` |
| `RT` | （未导出） | `FALLBACK_CONTAINER_DIMENSIONS` | 14139 | `{width:320,height:200}` |

**与 VENDOR-MANIFEST-LIBS.md / chartVendor.report.md 的两处更正**：
1. 清单原写 “ChartTooltipContent (export alias `n`)” —— 实测导出表 `WT as a`、`GT as n`：
   **ChartTooltipContent 的别名是 `a`；`n` 是 ChartLegend（recharts Legend 再导出）**。
2. chartVendor.report.md §2 把 `WT` 标为 “ChartTooltip”，精确名应为 **ChartTooltipContent**
   （ChartTooltip 是 `UT`=recharts Tooltip 的再导出，别名 `i`，该报告 §3 已正确登记）。

**与 shadcn/ui 公开源码（registry chart.tsx）的差异（共 4 处，均逐字保留在重建里）**：
1. ChartContainer 类名 `text-xs` → `text-ui-base`（ZCode 字号体系，见 §2）；
2. ChartTooltipContent 容器 `text-xs` → `text-ui-base/relaxed`；
3. chartId 拼接 `id || …` → `id ?? …`（?? 为原码形态，空串 id 不回退）；
4. 三处 `||` → `??`（ChartStyle 过滤 `theme ?? color`、ChartStyle 取色 `theme?.[t] ?? color`、tooltipLabel `config[label]?.label ?? label`）。

**消费者交叉验证**：`CodingPlanUsageLineChart`(1017/1024 行：`<he config>`=`t`、`<ae indicator:'line' labelFormatter formatter>`=`a`)、
`AppUsageDailyModelBarChart`(1145：`<qt indicator:'line' labelFormatter>`)、
`AppUsageModelUsagePieChart`(1019：`<de hideLabel indicator:'line' formatter>`) —— props 面与重建的
ChartTooltipContent 完全吻合。

## 2. utils-CEEH0K_K.js — cn（把握度：**高**）

| 原名 | 语义名 | 导出 | 依据 |
|---|---|---|---|
| `n`（局部） | `zcodeTwMerge` | — | `extendTailwindMerge({extend:{classGroups:{'font-size':[text-ui-lg,text-ui-base,text-ui-sm,text-ui-xs,text-mobile-input-safe]}}})` |
| `r` | `cn` | `t` | `cn(...inputs) = zcodeTwMerge(clsx(inputs))` |

- 依赖 `bundle-mjs-D8tLE0rB.js` = tailwind-merge@3.5.0 dist/bundle-mjs.mjs（内联 clsx@2.1.1）；
  导出表 `Pe as n`=twMerge / `t as r`=clsx / `Ne as t`=extendTailwindMerge（VENDOR-MANIFEST 已登记）。
- 语义 = shadcn `lib/utils.ts` 的 `cn`，ZCode 定制点：自有字号工具类登记进 `font-size` 组
  （这解释了全应用类名里 `text-ui-base` 与 `md:text-ui-base/relaxed` 的冲突消解行为）。
- **运行时验证**（esbuild bundle + Node）：`cn('text-ui-base','text-ui-sm')` → `text-ui-sm`；
  `cn('text-ui-lg text-red-500','text-ui-xs')` → `text-red-500 text-ui-xs`；clsx 对象/数组形态正常。

## 3. imeComposition-DEYFkwWm.js — 结构与符号

### 3.1 vendored 登记（不重建）

| 行范围 | 库 | 版本 | 导出别名 |
|---|---|---|---|
| 26–290 | scheduler | React 19.2.7 配套 | （仅层内） |
| 292–10868 | **react-dom/client 本体** | 19.2.7（in-chunk 版本串 10811/10822；createRoot 10834） | `P`（入口包装 `ae`） |
| 10887–11044 | @radix-ui/react-focus-scope | 1.1.7 | `k`（`pe`） |
| 11045–11065 | @radix-ui/react-focus-guards | 1.1.3 | `O`（`we`） |
| 11066–11693 | react-remove-scroll | 2.7.2 | `D`（`Mt`） |
| 11694–11780 | aria-hidden | 1.2.6 | `E`（`Vt`） |
| 11823–12047 | @radix-ui/react-popover 全栈（含 popper/presence/dismissable-layer/portal 内联副本） | 1.1.15 | （仅层内别名 12048–12052：xn=Root/Sn=Anchor/Cn=Trigger/wn=Portal/Tn=Content） |

版本证据：`node_modules` 参照安装逐包一致；radix popover 代码与
`@radix-ui/react-popover@1.1.15/dist/index.mjs` 逐节比对（POPOVER_NAME、
createContextScope(POPOVER_NAME,[createPopperScope])、useControllableState 的 caller 参数、
`--radix-popover-content-*` 变量映射）。
**更正 VENDOR-MANIFEST-LIBS.md**：该清单把本 chunk 的 radix 原语记为“在 dist-* chunks”，
实测 focus-scope/focus-guards/remove-scroll/aria-hidden/popover 全栈均**内联在本 chunk**
（dist-DJJArJ7D/dist-vnZIbudW 仅提供 popper/slot/compose-refs 等共享件）。

### 3.2 first-party 符号表（全部重建进 ImeComposition.tsx；把握度：**高**，逐字转录）

| 内部名 | 导出别名 | 语义名 | js 行 |
|---|---|---|---|
| `se` | `A` | PlatformProvider | 10872–10874 |
| `ce` | `M` | usePlatform（错误文案中文：`usePlatform 必须在 PlatformProvider 内使用`） | 10875–10879 |
| `le` | `j` | useOptionalPlatform | 10880–10882 |
| `ue` | `N` | useSelectDirectory | 10883–10885 |
| `Ht/Ut/Wt/Gt/Kt/qt` | `T/w/C/S/x/b` | lucide 图标 Info/LoaderCircle/MousePointer2/Sparkles/TriangleAlert/X | 11781–11822 |
| `En` | （未导出） | inputVariants（cva；size=xs/sm/default/lg） | 12053–12066 |
| `Dn` | `y` | Input（data-slot=input，htmlSize 透传） | 12067–12079 |
| `On` | `v` | Textarea（data-slot=textarea，field-sizing-content） | 12080–12090 |
| `An/jn/Mn/Nn/Pn/Fn/In` | （未导出） | toast 模块态：计数器/push/dismiss 闭包/pending/cancelled 集合/3000ms/200ms | 12092–12099 |
| `Ln` | （未导出） | ensureToastHost（`#zcode-toast-host` + createRoot） | 12100–12106 |
| `Rn` | （未导出） | ToastHost（top-center/top-right/bottom-left 三列 + 锚定组） | 12107–12163 |
| `zn` | （未导出） | anchorCenterX | 12164–12166 |
| `Bn` | （未导出） | AnchoredToastGroup（ResizeObserver+MutationObserver+resize/scroll 跟随） | 12167–12207 |
| `Vn` | （未导出） | ToastItem（rAF 进场/定时退场 200ms） | 12208–12241 |
| `Hn` | （未导出） | ToastCard（update/info/warning/default 四态布局） | 12242–12373 |
| `Un` | `_` | toast（返回数字 id；宿主未就绪时 rAF 自旋） | 12374–12404 |
| `Wn` | `g` | dismissToast（pending→cancelled 去抖） | 12405–12411 |
| `Gn` | `o` | PPTX_ELEMENT_REFERENCE_EVENT_TYPE=`zcode:pptx-element-reference-add-to-chat` | 12412 |
| `Kn/qn/Jn/Yn/Xn/Zn` | （未导出） | 引用块标题/消歧说明/sha256 正则/escapeRegExp/新旧块正则 | 12413–12425 |
| `Qn/$n/er` | （未导出） | isRecord/isFiniteNumber/isOptionalString | 12426–12432 |
| `tr` | `d` | fallbackTo | 12433–12435 |
| `nr` | `p` | isSameWorkspaceTarget | 12436–12441 |
| `rr` | （未导出，重建中 export） | isPptxElementReference（31 项字段校验） | 12442–12481 |
| `ir` | （未导出） | createPptxElementReferenceId | 12482–12486 |
| `ar` | `h` | sha256Fingerprint（WebCrypto） | 12487–12491 |
| `or` | `l` | buildPptxElementReference | 12492–12509 |
| `sr` | （未导出） | pptxElementReferenceKey（\0 连接） | 12510–12519 |
| `cr` | `s` | upsertPptxElementReference | 12520–12524 |
| `lr` | `c` | appendPptxElementReferences | 12525–12531 |
| `ur` | `m` | extractPptxElementReferences（坏 JSON 安全回退） | 12532–12548 |
| `dr` | `f` | isPptxElementReferenceEvent | 12549–12551 |
| `fr` | `u` | dispatchPptxElementReferenceEvent | 12552–12554 |
| `pr/mr/hr/gr` | `n/a/i/r` | Popover/PopoverTrigger/PopoverContent/PopoverAnchor（shadcn 包装） | 12555–12566 |
| `_r` | `t` | **isComposingText**（chunk 得名于此）：`compositionActive ‖ isComposing ‖ nativeEvent?.isComposing` | 12567–12569 |

**与 MODULE-MAP.md §3 导入表的更正**（该表为推测，本次以导出表+消费者双向实测）：
`l`=buildPptxElementReference（非 usePlatformService）、`m`=extractPptxElementReferences（非 toast；
toast 是 `_`）、`P`=react-dom/client 模块（非 Input；Input 是 `y`）、`A`=PlatformProvider（非 IME 守卫；
守卫是 `t`）、`a`=PopoverTrigger（非 platform provider）、`M`=usePlatform、`w`=LoaderCircle（spinner ✓ 与旧表一致）。

**消费者交叉验证**：
- `styles-CdEGpc2x.js` 导入 30/34 个导出（缺 `h/l/u` 三个 pptx 专用件）；应用根 `g8t`(212600)
  以 `<A platform={e.platform}>` 包裹全树 → PlatformProvider 身份确证。
- `pptx-preview-viewer-B1z6CWke.js` 恰好导入缺失的 3 个（`h/l/u`）+ popover/input/textarea/toast/图标/`t` 守卫
  → pptx 引用族身份确证。
- TopBar 族 `j6` TaskRenameDialog 的 IME 回车守卫即消费 `t`（`!_r(e) && submit()` 模式）。

### 3.3 shadcn 对照（input/textarea/popover）

- Input/Textarea/Popover 的 `data-slot` 约定、cva 变体结构、`align='center'/sideOffset=4` 缺省、
  Portal 包裹均与 shadcn/ui 新版（v4）一致；类名为 ZCode 设计系统定制
  （`text-ui-base` 字号、`z-[60]`、`rounded-xl`、`data-open/data-closed` 动画、`resize-none` 等）。

## 4. 把握度总评

| 部分 | 把握度 | 依据 |
|---|---|---|
| chart shadcn 层 5 个导出组件 + 4 个层内符号 | **高（逐字转录）** | 与 shadcn 公开源码逐节对照；3 个消费者 props 面交叉验证；4 处 ZCode 差异已定位并保留 |
| utils cn + tailwind-merge 扩展配置 | **高** | 18 行全量；运行时冲突消解实测 |
| imeComposition first-party 28 个导出符号 | **高（逐字转录）** | 导出表 + styles/pptx-preview-viewer 双消费者实测；toast/pptx 族纯函数运行时验证 |
| vendored 库身份/版本/行范围 | **高** | in-chunk 版本串 + node_modules 参照安装逐包比对 |
| 类型推断（PlatformService 全接口、ChartPayloadEntry 全集、ToastOptions 等） | **中高** | 按调用面归纳，`// TODO(infer)` 标注；与真实接口可能有细微出入 |
| ResponsiveContainer 以 npm recharts 导入 | **高（语义）** | chunk 内 `Zc` 与 `es6/component/ResponsiveContainer.js` 逐节一致（原符号未导出，此为唯一可行重建路径） |

## 5. 验证记录（全部通过）

验证环境：`/tmp/d8b2-verify/root`（node_modules 符号链接自 `web/node_modules`
[react@18.3.1/@types/react@18.3.31/csstype] 与 `zcode-restored/node_modules`
[recharts@3.8.0/tailwind-merge@3.5.0/clsx@2.1.1/@radix-ui/*]；`out/` 符号链接只读）。

1. **tsc 5.6.3 `--strict --noEmit`（moduleResolution=bundler, jsx=react-jsx, skipLibCheck）**：
   3 个文件 **0 错误**（唯一一处 TS2352 转换为 `as unknown as` 后归零）。
2. **esbuild 解析检查**（`--loader:.tsx=tsx --jsx=preserve`）：3/3 通过。
3. **esbuild bundle 冒烟**（真实 `out/` chunk 导入全部可解析）：3/3 通过
   （ChartShadcn 束 821KB = 含 406KB chart chunk 本体）。
4. **运行时等价抽查**（Node 22 ESM 加载 bundle）：
   - cn：`font-size` 组冲突消解 3 例 ✓；
   - isComposingText 三重探测 4 例 ✓；fallbackTo/isSameWorkspaceTarget ✓；
   - sha256Fingerprint('abc') = 标准测试向量 `sha256:ba7816bf…` ✓；
   - isPptxElementReference 正/反例 ✓；upsert 替换/追加 ✓；
   - **引用块 append→extract 往返**（新版标题 + legacy 标题 + 坏 JSON 安全回退）3 例 ✓；
   - **React renderToString 14 项**：ChartContainer 的 data-slot/data-chart/
     ChartStyle light+dark CSS 变量/无 color 项过滤/子节点透传；
     ChartTooltipContent 的 config label 解析/toLocaleString/`type:'none'` 过滤/dot 类名；
     ChartLegendContent 的 label/色块/pb-3；useChart 容器外抛错文案逐字一致 ✓。
5. `out/` 未修改（只读访问）；验证用临时副本位于 /tmp，未污染交付目录。

## 6. 流程合规备注

- 未修改 `out/` 下任何文件。
- 本会话无 GitNexus MCP 工具可用；本任务仅**新建**恢复文件，未编辑任何既有符号，
  故未执行 `gitnexus_impact` / `gitnexus_detect_changes`。
- 后续建议：① VENDOR-MANIFEST-LIBS.md 中两处更正（§1.2/§3.1 所列）可回写；
  ② CartesianChart-nORn-0bc.js（recharts 分包，chartVendor.report.md §4 未登记部分）
  可在下一批次补登记。
