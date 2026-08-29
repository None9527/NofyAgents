# A0-S2a 报告：入口与小块缝隙闭合（13 文件改接）

日期：2026-08-29 · 阶段：PORTING-PLAN A0.1 · 批次：S2-a
范围：`desktop/src/src/modules/` 中 13 个仍从 `../../out/` 原始 bundle import 的文件，全部改接到重建模块 / 真实 npm 依赖。

## 1. 改接矩阵（13 文件 × 原导入 × 新导入）

| # | 文件 | 原导入（别名） | 新导入（语义名；行尾注释保留原别名） |
|---|------|----------------|--------------------------------------|
| 1 | rendererEntry.tsx | `imeComposition-DEYFkwWm.js { P as reactDomClient }` | `import * as reactDomClient from 'react-dom/client'`（P） |
|   |  | `IntlProvider-C321H7m8.js { t as ZCodeIntlProvider }` | `./I18n { ZCodeIntlProvider }`（t） |
|   |  | `preload-helper-BHSF1fZ9.js { t as preloadModule }` | `../lib/preloadHelper { preloadModule }`（t，新建 lib 承载，逐字转写 vite `__vitePreload` 三参包装器） |
|   |  | `src-HCld2afU.js { Ps, St, ct, ft, no, st, ut }` | `./SrcSharedA { DEFAULT_LOCALE }`（Ps）+ `./SrcSharedB { ServicePortIpcTopics as RendererMessage }`（St）`{ parseLaunchMarks }`（ct）`{ DesktopMenuActionIds as DesktopCommand }`（ft）`{ RPC_FRAME_LIMITS as transportFrameLimits }`（no）`{ LAUNCH_MARKS_STORAGE_KEY as LAUNCH_MARKS_QUERY_PARAM }`（st）`{ resolveClientTelemetryContext as createRendererTelemetryContext }`（ut）。注：任务示例语义名（RendererMessage 等）在 SrcSharedB 无同名导出，按 src-HCld2afU 导出语句与重建文件内部名（Ib/ex/Wf/ix/tx）核对后取 canonical 名 `as` 文件内既有本地名 |
|   |  | `styles-CdEGpc2x.js`（44 符号 mega-chunk） | **遗留**：保留导入（未重建），`@ts-expect-error` 移至 from 行上方 |
|   |  | 动态 `import('../../out/.../e2eStoreBridgeBootstrap-DOKuAE2h.js')` | `import('./e2eStoreBridgeBootstrap')`（preloadModule 的 deps 数组保留原 chunk 名，逐字） |
| 2 | appUsageChartPalette.tsx | `chart-iT2j9K3u.js { Tn, X, Y, Z }` | `recharts/es6/state/hooks.js { useAppDispatch }`（Tn）+ `recharts/es6/state/tooltipSlice.js { setActiveClickItemIndex }`（X）`{ mouseLeaveItem }`（Y）`{ setActiveMouseOverItemIndex }`（Z） |
| 3 | appUsageDailyModelBarChart.tsx | `tiny-invariant-Dm49c6Qj.js { t as invariant }` | npm `tiny-invariant`（t） |
|   |  | `IntlProvider-C321H7m8.js { n as useZCodeIntl }` | `./I18n { useZCodeIntl }`（n） |
|   |  | `usageStatsUiParts-CiR7YEhh.js`（4 符号） | `./UsageStatsUiParts { formatTokens as formatCompactNumber, resolveModelLabel as getModelLabel, formatUtcDateShort as formatUsageDate, UsageEmptyState }` |
|   |  | `CartesianChart-nORn-0bc.js`（7 符号） | `recharts/es6/chart/CartesianChart.js { CartesianChart }`（t）；`recharts/es6/cartesian/GraphicalItemClipPath.js { useNeedsClip, GraphicalItemClipPath }`（a, i）；`recharts/es6/context/ErrorBarContext.js { SetErrorBarContext }`（o）；XAxis/YAxis/CartesianGrid 改 `recharts` 根导出 |
|   |  | `chart-iT2j9K3u.js`（~60 符号） | 按符号分类：`recharts` 根导出（DefaultZIndexes/Layer/Tooltip/ZIndexLayer 等）、`recharts/es6/*` 深路径（逐行 `// 原 chart-iT2j9K3u <别名>` 注释）、`reselect`、`./ChartShadcn`、`../lib/rechartsChunkInternals` |
| 4 | appUsageModelUsagePieChart.tsx | 同上（无 tiny-invariant） | 同上模式；另 7 个 chunk 专有符号 → `../lib/rechartsChunkInternals`（filterProps/pickTooltipEventType 等，逐字转写） |
| 5 | codingPlanUsageLineChart.tsx | `IntlProvider` + `usageStatsUiParts` + `CartesianChart` + `chart-iT2j9K3u` | 同上模式；根导出增 Legend/usePlotArea/useActiveTooltipDataPoints；filterProps → lib |
| 6 | button.tsx | `dist-vnZIbudW.js { t as Slot }` | `@radix-ui/react-slot { Slot }`（定性：radix dist；装 @radix-ui/react-slot@1.3.3） |
|   |  | `bundle-mjs-D8tLE0rB.js { r as clsx }` | npm `clsx`（定性：clsx+tailwind-merge 的 vendor bundle；装 clsx@2.1.1） |
|   |  | `utils-CEEH0K_K.js { t as cn }` | `./UtilsCn { cn }`（自引用文件改接后直接导入） |
| 7 | ChartShadcn.tsx | `utils-CEEH0K_K.js { t as cnMin }` | `./UtilsCn { cn as cnMin }` |
|   |  | `chart-iT2j9K3u.js { i as RechartsTooltip, n as RechartsLegend }` | `recharts { Tooltip as RechartsTooltip, Legend as RechartsLegend }`（i, n；shadcn 图表层改指 npm recharts 3.8.0） |
| 8 | e2eStoreBridgeBootstrap.tsx | `skillStore-BmeKHDBI.js { K, h, o, r, t }` | `./SkillStore { isE2EStoreBridgeEnabled }`（K/内部 v）`{ useTaskStore as useSessionStore }`（h/yn）`{ useWhiteboardStore }`（o/In）`{ useSubagentsStore }`（r/Gn）`{ useSkillsStore as useSkillStore }`（t/Yn）；删除自建 declare global/AnyZustandStore（SkillStore 已声明 4 个 window 全局） |
| 9 | highlightedCodeBlockBody.tsx | `chunk-BO2N2NFS-CSNAeaxF.js { i, n, t }` | 定性 first-party（VENDOR-MANIFEST-LIBS.md：streamdown 应用层）→ `./MarkdownContext { StreamdownContext as StreamdownOptionsContext, useCodeHighlighter }`（i=Xb, n=ry）+ `./MarkdownCodeBlock { CodeBlockBody }`（t=kv） |
| 10 | ImeComposition.tsx | `utils-CEEH0K_K.js { t as cnMin }` | `./UtilsCn { cn as cnMin }` |
|   |  | `button-laUijeDG.js { c as createLucideIconMin, r as cvaMin }` | `./button { createLucideIcon as createLucideIconMin, cva as cvaMin }`（自引用同理；另用 @radix-ui/react-popover@1.1.15） |
| 11 | intlProvider.tsx | `src-HCld2afU.js { Ps as DEFAULT_LOCALE }` | `./SrcSharedA { DEFAULT_LOCALE }`（Ps/内部 e='zh-CN'）；文件为 I18n 的 DUPLICATE-OF，头部注记保留 |
| 12 | logger.tsx | `src-HCld2afU.js { K }` | `./SrcSharedB { formatLogLinePrefix }`（K/内部 Lx），绑定处保留原 `(tag, pid?) => string` cast |
| 13 | UtilsCn.tsx | `bundle-mjs-D8tLE0rB.js { r as clsxMin, t as extendTailwindMergeMin }` | npm `clsx { clsx as clsxMin }` + `tailwind-merge { extendTailwindMerge as extendTailwindMergeMin }`（自引用：cn 直接在本文件定义导出） |

## 2. 补导出清单（重建模块工程副本）

仅 1 件：**button.tsx** 末尾新增语义名导出行（从文件内既有定义直接 export，未改实现）：

```
export { Button, buttonVariants, createLucideIcon, cva, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, LucideProvider };
```

（9 个符号；原别名导出行 `export { ZoomIn as a, ... Button as t }` 保留，双轨并存。）
其余目标模块（SrcSharedA/B、I18n、SkillStore、UsageStatsUiParts、MarkdownContext、MarkdownCodeBlock、ChartShadcn、UtilsCn）所需符号均已导出，无需补。

## 3. 新增 npm 依赖（已安装并记录）

| 包 | 版本 | 用途 |
|----|------|------|
| tiny-invariant | ^1.3.3 | bar chart（原 tiny-invariant-Dm49c6Qj） |
| clsx | ^2.1.1 | UtilsCn/button（原 bundle-mjs-D8tLE0rB r） |
| tailwind-merge | ^3.5.0 | UtilsCn（原 bundle-mjs-D8tLE0rB t） |
| reselect | ^5.1.1 | 三图表 createSelector（原 chart chunk 内联） |
| @radix-ui/react-slot | ^1.3.3 | button Slot（原 dist-vnZIbudW t） |
| @radix-ui/react-popover | ^1.1.15 | ImeComposition（原 dist-vnZIbudW 同源 radix dist） |
| es-toolkit | ^1.52.0 | lib/rechartsChunkInternals 的 lodashGet（原为 recharts 传递依赖，提升为直接依赖） |

## 4. 新增 src/lib/ 小文件

1. `lib/preloadHelper.ts` — vite 三参预载包装器 `preloadModule(loader, deps, baseUrl)` 逐字转写（重建模块中无实体；依据 rendererEntry 头注与 out 原件行为）。
2. `lib/recharts-deep.d.ts` — `declare module 'recharts/es6/*';` 通配环境声明（npm recharts 深路径无相邻 .d.ts；与原 minified 无类型处理一致）。
3. `lib/rechartsChunkInternals.ts` — chart chunk 专有、npm recharts 3.8.0 无对应导出的符号逐字转写：filterProps、pickId、pickTooltipEventType、selectPolarTooltipEvents、combinePolarAppliedNumericalValues、combineTooltipPayloadConfigurationsInput、selectTooltipPayloadConfigurationsInput、lodashGetModule。

## 5. 错误数前后对照（`./node_modules/.bin/tsc -p tsconfig.json`，desktop/src/src 运行）

| 时点 | 全项目 | 13 文件 | 说明 |
|------|--------|---------|------|
| 任务基线（/tmp/a0-tsc-baseline.txt） | 364 | 321 | 改接前 |
| 改接前实测（05:52） | 362 | 319 | 3 条 clsx TS2307 已随依赖消失 |
| HEAD 检查点（06:33，Lane-1 自动接线 789 wires/45 文件提交，非本批） | — | — | 全项目错误暴涨（大量 TS2459 自动接线未导出符号），基线口径失效 |
| 测量 A：当前树 + 13 文件取 HEAD 版 | 1521 | 318 | 本批责任的隔离测量 |
| 测量 B：当前树 + 本批改接 | 1201 | 0 | A→B 净 −320：13 文件 −318 + Sidebar.tsx 1 条 TS2687（删除与 Sidebar 冲突的重复 Window.zcode 声明后消失） |
| 最终（含他批并行收敛） | 1186 | 0 | FileTreePanel 15 错由他批修复，与本批无关 |

- **13 文件相关错误清零**（含 lib/ 0 错）。
- A/B 错误集逐条 diff：**他文件零新增**（唯一差异为他文件减少 1 条）。
- 门禁 2：13 文件逐个 esbuild `--loader:.tsx=tsx --jsx=automatic` 变换 0 错；加做的 `--bundle` 解析亦 13/13 通过（bundle 曾抓出 `getValueByDataKey` 深路径错误：recharts 3.8.0 中位于 `util/ChartUtils.js` 而非 `util/DataUtils.js`，已修正）。
- 门禁 3：out/ md5 复验不变 — `styles-CdEGpc2x.js` = 48d71d4874b0868d61fd35a328bf6ad5 ✓，`src-HCld2afU.js` = f5edd6a1207c6d20008204829dad3923 ✓。

## 6. @ts-expect-error 账目

改接前（HEAD 版 13 文件）35 条 → 改接后 1 条（rendererEntry 遗留 styles mega-chunk 导入，由原 import 上方移至 from 行上方使其生效）。**零新增**。

## 7. 遗留（如实）

1. **rendererEntry.tsx 仍从 `../../out/renderer/assets/styles-CdEGpc2x.js` 导入 44 符号**（应用外壳/服务通道/协议客户端 mega-chunk，未重建；带 1 条生效的 @ts-expect-error）。待 styles chunk 源码化批次处理。
2. **recharts 深路径导入经通配 d.ts 为 any**：npm recharts 3.8.0 不为 `es6/*` 深路径提供类型；与原 minified 无类型等价，但弱于根导出类型。
3. **bundle 版 recharts ≠ npm 3.8.0**：chart chunk 专有符号（filterProps 链、polar tooltip 组合器等）已逐字转写至 `lib/rechartsChunkInternals.ts`；若日后升级 recharts 需复核。
4. **B5 误命名以本地别名保留并加注**：`isFunction`=isNumber、`isNumber`=isWellBehavedNumber、`svgPropertiesNoEventsOfProps`=svgPropertiesNoEvents、`setPolarOptions`=updatePolarOptions、`selectPolarAppliedNumericalValuesInput`=selectAllErrorBarSettings（均带行尾注释）。
5. **intlProvider.tsx 为 I18n 的 DUPLICATE-OF**：按任务保留文件与头部 DUPLICATE 注记，仅改接其 out 导入。
6. **rendererEntry 的 preloadModule deps 数组保留原 chunk 文件名字符串**（modulepreload 预载清单数据，逐字）。
7. pie 图表内若干死代码 createSelector 链（原样转写，未删）。
8. 全项目剩余 1186 错均属他批/未接线文件（Lane-1 自动接线的 TS2459 等），不在本批 13 文件范围。
