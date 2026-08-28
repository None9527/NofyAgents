# A0-S2e.report.md — pptx/office 域接线核查（PORTING-PLAN 阶段 A0.1 · S2-e 批次）

- 批次：A0 阶段 S2-e（域接线核查 + B5-16/17 遗留清单清理）
- 日期：2026-08-29
- 工作目录：`/Users/mac/nofy-build`；工程源码树：`desktop/src/src/`（门禁均自 `desktop/src/src` 运行）
- 改动面（仅 2 个文件，均在允许清单内）：
  - `desktop/src/src/modules/pptxEngineGeometry.ts`（1745 → 1708 行）
  - `desktop/src/src/modules/pptxRendererPreviewEngine.tsx`（2473 → 2483 行）
- 未改动：pptxEngineCharts/Color/Render/Text/Types、pptxPreviewViewer.tsx、
  PptxGeometryDeferredPresets.ts、PptxGeometryMultiRegion.ts（工程副本与
  src-reconstructed 版 diff 为空，逐字一致）；`out/` 全程只读。
- 未派生子代理。

---

## §1 核查矩阵（域内 10 文件跨文件依赖现状）

| 文件 | 域内 import | 域内导出被消费 | declare 接缝 | 结论 |
|---|---|---|---|---|
| pptxEngineTypes.ts | —（叶） | 全域 | 0 | 闭合 |
| pptxEngineColor.ts | pptxEngineTypes | Charts/Render | 0 | 闭合 |
| pptxEngineText.ts | pptxEngineTypes、pptxEngineColor | Charts/Render | 0 | 闭合 |
| pptxEngineGeometry.ts | pptxEngineTypes | Render + 两实体化模块 | 0 | 本批清理（§3/§4/§5） |
| pptxEngineRender.ts | Types/Color/Geometry/Text | 仅 pptxRendererPreviewEngine | 0 | 闭合 |
| pptxEngineCharts.ts | Types/Color/Text | 仅 pptxRendererPreviewEngine | 0 | 闭合 |
| PptxGeometryDeferredPresets.ts | pptxEngineGeometry（4 符号） | —（纯副作用注册） | 0 | B5-17 声称属实（§2）；本批接线（§3） |
| PptxGeometryMultiRegion.ts | pptxEngineGeometry（7 符号 + 3 类型） | —（纯副作用注册） | 0 | B5-16 声称属实（§2）；本批接线（§3） |
| pptxRendererPreviewEngine.tsx | 全部 6 个引擎子模块 | pptxPreviewViewer（动态 import） | 0 | 本批加装配接线（§3） |
| pptxPreviewViewer.tsx | react + 动态 import 引擎 | LazyPreviewViewers（经 lazy 分包） | **21**（全部跨 chunk，他域，保留，§6） | 无可接线属主 |

PreviewMisc 族（PdfViewer/DiffsWorker/HighlightedCodeBlock，PreviewMisc.report.md 口径）
与本域无 declare 接缝——本批无 PreviewMisc 相关改动。

## §2 B5-16/17 「全真实 import」声称逐一验证

**B5-17（PptxGeometryDeferredPresets.ts）**：import 4 符号逐一核验为
pptxEngineGeometry.ts 真实导出——`PRESET_GEOMETRY_PATHS`(181)、`adjRatio`(30)、
`adjValue`(37，2 重载+实现)、`mirrorPathHorizontally`(105)。文件内 0 个 declare。
**属实。**

**B5-16（PptxGeometryMultiRegion.ts）**：import 7 值符号 + 3 类型逐一核验为真实
导出——`MULTI_REGION_SHAPES`(1438)、`PRESET_GEOMETRY_PATHS`(181)、`adjRatio`(30)、
`arcSegment`(61)、`mirrorPathHorizontally`(105)、`mirrorPathVertically`(134)、
`splitOuterPath`(163)、类型 `MultiRegionBuilder`(1432)/`MultiRegionPath`(1422)/
`PresetGeometryBuilder`(175)。文件内 0 个 declare。
**属实。**

残余跨文件 declare 核查：两实体化文件之外，域内仅 pptxPreviewViewer.tsx 有
21 个 declare，全部属跨 chunk 依赖且属主文件不在本域/不在 src/modules/
（§6 逐项），无可接线对象——「仍为 declare 的跨文件依赖接线到属主文件」一项
经核查**域内无残余可接线项**。

## §3 接线清单（1 处改动，2 条 import）

改动前实测：PptxGeometryDeferredPresets.ts 与 PptxGeometryMultiRegion.ts
**无任何消费方**（全树 grep），其模块级 `.set` 副作用注册从不执行——
两表删除前必须先接线，否则渲染回退。

接线落点：`pptxRendererPreviewEngine.tsx`（chunk 主模块 = 渲染器装配处，
B5-17 §6-2 指定位置）：

```
57: import "./PptxGeometryDeferredPresets"; // 原 V.set 余量 ×38 预设（B5-17）
58: import "./PptxGeometryMultiRegion"; // 原 ji 余量 ×38 + 弯箭头 V×4 + Ti/Ei 包装（B5-16）
```

头部子模块清单同步登记（16–17 行）。

求值时序核验（无循环、无 TDZ）：装配图入口先经 pptxEngineRender →
pptxEngineGeometry 全量求值（含既有 134 个 V.set 与 6 个 ji 条目），随后两
副作用模块求值并 `.set` 覆盖/补齐；两模块自身对 pptxEngineGeometry 的
import 此时已解析完毕。反向接线（pptxEngineGeometry 直接 import 两模块）
会构成循环并在模块顶层触发 `PRESET_GEOMETRY_PATHS` TDZ，故不采用。

## §4 删除清单（登记表清理，裁决 = 删除）

`pptxEngineGeometry.ts` 内：

1. **`DEFERRED_PRESET_GEOMETRY_ANCHORS`**（原 1399–1412，39 项）+
   **`FALLBACK_RECT` 常量**（原 1396）+ **兜底循环**（原 1413–1414）——整体删除。
   依据：B5-17 §2 对账 38 个真缺预设已全量逐字转录于
   PptxGeometryDeferredPresets.ts 并经 §3 接线注册；borderCallout1 本文件
   671–676 原有真实体。`FALLBACK_RECT` 无其他消费方（全树 grep 仅定义+兜底
   循环两处），一并删除。
2. **`DEFERRED_MULTI_REGION_ANCHORS`**（原 1508–1522，38 项）——整体删除。
   依据：B5-16 §2.1 对账 38 项全部实体化于 PptxGeometryMultiRegion.ts
   （注册进同一 `MULTI_REGION_SHAPES`）；该表本就无兜底循环消费。

删除后处置：原址各留 3 行 tombstone 注记（现 1403/1498 行）指向依据；
删除依据全文记录于文件头注（「整合清理（A0-S2e）」段）。两表为 export，
删除前全树核查引用：仅 OfficeWiring.tsx:28 与 PptxGeometryDeferredPresets.ts
头注以**注释**形式提及，无代码引用；tsc 前后零差异佐证。

## §5 改指清单（buildMultiRegionPaths，B5-16 §5-1/§5-2 两处偏差）

`pptxEngineGeometry.ts` `buildMultiRegionPaths`（现 1645 行）重写：

- **删除**弯箭头四预设的内联特判分支（原 1664–1688，含 §5-1 偏差：
  curvedleftarrow 一律 `[remainder, outer]`，源 Ti 仅 curvedRightArrow 如此、
  curvedLeftArrow 为 `[outer, remainder]`）。
- **改指**：弯箭头四预设改经 PptxGeometryMultiRegion 的 ji 条目
  （`curvedrightarrow/curvedleftarrow/curveduparrow/curveddownarrow`，该文件
  1051 行）委托忠实版包装 `wrapSplitPresetRegions`（241，原 Ti 逐字）/
  `wrapVerticalArrowRegions`（271，原 Ei 逐字）。
- **查表**改为小写优先→原名回退（原 Pi，jsx 10857–10861 逐字形态），修复
  §5-2：camelCase 键（actionButton 族/leftRightRibbon/ellipseRibbon*/
  smileyFace/can/bevel 等）原经 `MULTI_REGION_SHAPES.get(normalized)` 永远
  落空回单路径分支。
- 未直接 import `resolveMultiRegionPreset`：pptxEngineGeometry ↔
  PptxGeometryMultiRegion 为循环依赖（后者 import 前者），直接 import 会在
  模块求值期触发 TDZ；Pi 逻辑仅 3 行，内联于本函数并在注释中标注源行号，
  语义与忠实版逐条一致（返回值按既有签名 `| undefined`，调用方 `if (multi)`
  判空行为不变）。

运行时冒烟（esbuild bundle 全装配图 + node 执行，/tmp/s2e-smoke-entry.ts）：
- 39/39 原登记表预设名均有真实体（非兜底矩形）且产出以 `M` 起始的路径；
- 38/38 原多区域登记表名均注册且产出非空区域数组；
- `curvedrightarrow` = `[remainder, outer]`、`curvedleftarrow` = `[outer, remainder]`
  （与 splitOuterPath 逐段比对一致）——§5-1 修复验证；
- `actionButtonBeginning/leftRightRibbon/smileyFace/bevel` 经原名回退命中
  ——§5-2 修复验证；`curveduparrow/curveddownarrow` 各产出 2 区域（忠实 Ei）；
- 单路径预设（`rect`）行为不变、无多区域。
  结果：`SMOKE OK`（0 失败项）。

## §6 保留并列遗留（他批负责，如实）

1. **pptxPreviewViewer.tsx 21 个 declare**（全部跨 chunk，属主不在本域，保留）：
   - `cn`(70) → utils-CEEH0K_K.js；`logger`(73) → logger-PFDwl5Yq.js；
     `vitePreload`(76) → preload-helper-BHSF1fZ9.js；
   - `usePlatformService`(85)/`toast`(88)/`isImeComposing`(91)/`PopoverRoot`(129)/
     `PopoverAnchor`(130)/`PopoverContent`(131)/`Button`(147)/`Input`(160)/
     `Textarea`(170)/`IconSparkles`(182)/`IconMousePointerClick`(183)/
     `IconLoaderCircle`(184)/`IconChevronLeft`(185)/`IconZoomOut`(187)/
     `IconZoomIn`(188) → imeComposition-DEYFkwWm.js；
   - `createLucideIcon`(200)/`IconChevronRight`(186)（button 侧重复声明见
     头注映射表）→ button-laUijeDG.js；
   - `hitTestSlideElement`(109) → presentationElementModel-r6vQ-JZl.js
     （该 chunk 尚未实体化为模块，仅存 out/ 与 jsx 孪生；与
     pptxRendererPreviewEngine.tsx 的 `hitTestElement`(2338) 非同文件符号，
     不改指）。
2. **OfficeWiring.tsx**（B5-12b，不在本批允许改动面）：与
   PptxGeometryDeferredPresets.ts 重复转录同一 38 个 V.set 余量预设 + Di；
   当前全树无消费方，不影响运行时；后续装配批次应二选一（B5-16 §6-2 口径）。
3. **B5-16 §6-3/§6-5 改指项无消费点**：pptxEngineGeometry.ts 未导出的
   `actionButtonMetrics`(1432)/`outerRectPath`(1451) 仅被本文件既有 6 条
   ji 条目内部消费（自包含）；渲染器侧无 Ai（jsx 12271）调用点——
   PptxGeometryMultiRegion 导出的 `actionButtonMetrics`/`actionButtonOuterRect`/
   `actionButtonGlyphPath` 暂无工程消费方，留待渲染器细化批次。
4. **并发批次干扰记录**：门禁复跑期间遇他批并发改写 AppRootLeaves.tsx/
   Bots.tsx 等（全项目错误数瞬时波动至 2448）；隔离核验确认域内文件与
   本批符号在任何时点均 0 错（§7）。

## §7 门禁记录（前后错误数）

| 门禁 | 改动前 | 改动后 | 结论 |
|---|---|---|---|
| tsc 全项目（稳定树） | 362（/tmp 基线 364：clsx×2 已因安装消解；ChartShadcn +1 为他批所致） | 362，逐条 diff = **零差异** | 只减不增 ✓ |
| tsc 域内文件 | 0 | 0（含并发波动期隔离核验） | 清零 ✓ |
| esbuild 域内 10 文件逐个 | 0 错 | 0 错 | ✓ |
| out/ md5 pptxRendererPreviewEngine-BIIRLBue.js | 02b3288447a609a826511301b9ec9bfc | 02b3288447a609a826511301b9ec9bfc | 不变 ✓ |
| out/ md5 pptx-preview-viewer-B1z6CWke.js | 4919b990fe658fc65b52523cdff4692a | 4919b990fe658fc65b52523cdff4692a | 不变 ✓ |
| 运行时冒烟（装配图 bundle + node） | —（改动前两模块未被 import，注册不生效） | SMOKE OK（39/39 + 38/38 + 顺序/回退验证） | ✓ |

域内文件在基线中本无 tsc 错误，「顺带修复」项无对象（如实记录）。

## §8 补导出/删除导出逐件记录

- 删除导出 ×2：`DEFERRED_PRESET_GEOMETRY_ANCHORS`、`DEFERRED_MULTI_REGION_ANCHORS`
  （均 pptxEngineGeometry.ts；无代码消费方，见 §4）。
- 删除模块私有 ×1：`FALLBACK_RECT`（无消费方）。
- 新增导出 ×0；新增 import ×2（均为副作用 import，见 §3）；签名变更 ×0
  （`buildMultiRegionPaths` 签名与返回语义保持，仅内部实现改指）。
- 未新增任何 `@ts-expect-error`；未改动发射语义（函数签名/返回形态/
  既有注册条目全部保持）。
