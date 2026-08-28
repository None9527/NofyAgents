# B5-FULL-DECODE-PLAN — first-party 源码 100% 解码批次计划

状态：**执行中**
目标：把 COVERAGE-LEDGER 剩余接口级/未重建的 **全部 first-party 代码**逐字重建，
使前端源码完整可维护，然后再执行内核移植（PORTING-PLAN.md 阶段 A–E）。
日期：2026-08-28

---

## 0. 口径与边界

- **解码对象 = first-party 代码**。vendored 第三方库体（styles 内 ~52,000 行：
  Lexical/xterm/framer-motion/shiki/diff/mermaid/qrcode/dnd-kit/cmdk/Radix/图标块；
  143 个 vendor chunk + 2 wasm）维持既定策略：**版本登记 + npm 依赖整体替换**
  （VENDOR-MANIFEST-LIBS.md 已精确到版本，上游源码即其源码），不逐行转录。
- **行号口径**：styles 族以 `out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，
  prettier 格式化、压缩标识符）为主口径；jsx = `src-reconstructed/renderer/assets/
  styles-CdEGpc2x.jsx`（170,400 行 pretty 版）。独立 chunk 以自身行号为准。
  本机路径前缀：`/Users/mac/nofy-build/desktop/src/`（MODULE-MAP 里的
  `/home/none/grok-build/ref-ui/zcode-restored/` 是旧机器路径，一律换算到本机）。
- **`out/` 全程只读**；产物只写 `src-reconstructed/modules/`。
- **逐字重建约定**（沿用 B1–B4）：类名、常量、分支零改动；文件头映射表 +
  文件尾符号表（供 SYMBOL-INDEX 增量抽取）；把握度分级标注。

## 1. 验证门禁（每批必过）

1. `web/node_modules/.bin/esbuild <产物> --loader:.tsx=tsx --jsx=preserve` → 0 错
2. `web/node_modules/.bin/tsc -p /tmp/tsconfig.<产物>.json`（strict、ES2022、
   jsx preserve、moduleResolution Bundler、typeRoots → `web/node_modules/@types`）→ 0 错
3. 锚点回代：≥8 个行号锚点回代原始 chunk 逐字命中
4. 报告 `<产物>.report.md`：覆盖清单、边界裁决、验证记录、符号表

## 2. 批次表（15 路，行号互斥）

| # | 批次 | 范围 | 规模（行） | 产物 |
|---|---|---|---:|---|
| 1 | B5-01 Composer 族 F08 | styles js 63593–69297 + 75527–76245 + 77014–77079（**排除 Lexical 57652–63592 vendored**） | ~5,700 | Composer.tsx |
| 2 | B5-02 尾部块 F18+F20 | styles js 205680–213695 余段（m3t/b4t/v8t/k3t/A3t/s4t + g8t/i8t/x8t/C8t/T8t/j6t） | ~5,100 | OnboardingLoginLeaves.tsx + AppRootLeaves.tsx |
| 3 | B5-03 反馈中心 F09 RMe | styles js 39107–41892 | ~2,785 | FeedbackCenter.tsx |
| 4 | B5-04 支付深部 F12 + Bots F11 | styles js 76564–90180 区（**排除 qrcode 78408–79978 vendored**）+ 147767–149553 | ~4,500 | PaymentDeep.tsx + Bots.tsx |
| 5 | B5-05 WebRemote F17 + 远程向导 F10 | styles js 140669–142371 + 149554–150434 + 124267–124993 + 127935–128568 | ~3,900 | WebRemote.tsx + RemoteWizard.tsx |
| 6 | B5-06 预览卡 F19 + 文件树 F04 + rewind 深部 F03/F14 | styles js 49180–49640 + 50618–51687 + 146089–147766 + 47501–47660 + v_t/__t/p1/yg 散段 | ~4,000 | PreviewCards.tsx + FileTreePanel.tsx + FileRewindDialogDeep.tsx |
| 7 | B5-07 QuickPick 深部 + zZ cmdk + MCP 助手 + 协议常量 + resizable | styles js 32279–35697 散点 + 96589–97700 + 155522–155824 + 157977–158525 + 158854–159974 余 + 203136–203144 + 131422–131631 | ~2,900 | QuickPickDeep.tsx + CmdkPaletteDeep.tsx + McpHelpers.tsx + ProtocolHostConstants.ts |
| 8 | B5-08 legacy-doc C 上 | legacy-doc jsx 18106–19541 测量原语族+Mg 内层余、20231–20943 隙段、20944–24337 [E6]c（195 符号） | ~5,500 | LegacyDocEngineC1.tsx + C2.tsx |
| 9 | B5-09 legacy-doc C 下 | legacy-doc jsx 27340–36416 [E7] 交互回调簇 | ~6,300 | LegacyDocEngineC3.tsx + C4.tsx |
| 10 | B5-10a src-HCld2afU 上 | src-HCld2afU jsx 1–4900 | ~4,900 | SrcSharedA.tsx |
| 11 | B5-10b src-HCld2afU 下 | src-HCld2afU jsx 4901–9742 | ~4,850 | SrcSharedB.tsx |
| 12 | B5-11 小 chunk 三件 | skillStore-BmeKHDBI（2,531）+ usageStatsUiParts-CiR7YEhh（883）+ process-monitor-DOlutpPR（180） | ~3,600 | SkillStore.tsx + UsageStatsUiParts.tsx + ProcessMonitor.tsx |
| 13 | B5-12a xlsx 深部上 | xlsx js 15672–17817 + 183972–189511（地图数据 17818–183063 外置不转录） | ~7,700 | XlsxDeepA.tsx |
| 14 | B5-12b xlsx 深部下 + office 接线 + CartesianChart | xlsx js 193217–199291 + pptx 装配接线/几何登记 + CartesianChart-nORn-0bc.js（1,739） | ~7,800 | XlsxDeepB.tsx + OfficeWiring.tsx + CartesianChart.tsx |
| 15 | B5-13 i18n 动态键 | 6 前缀消费点落定（mode/forms/appError/notification/taskTimeline/usage）+ postUpdateReleaseNotes/forceUpdate 消费点 | 全域分析 | I18nDynamicKeys.report.md（+ I18n.tsx 补遗） |

合计 first-party 待解码 ≈ **69,000 行**（其中 ~45,000 行为逐字转录主体）。

## 3. 边界裁决规则

- 行号段互斥；出现新交集时双方报告各自记录，汇总时裁决（沿用 B4 §f.2 做法）。
- 双归属段按 COVERAGE-LEDGER 既有裁决；消费面优先。
- vendored 库体边界（Lexical/qrcode/xterm/shiki/diff 等）只在报告中注记，不转录。
- 每批完成后回写 COVERAGE-LEDGER §c 队列状态与 §a/§f 数字；全部完成后
  接口级清单清零（vendored 除外），SYMBOL-INDEX 增量登记。

## 4. 验收（全量完成标准）

- COVERAGE-LEDGER 剩余接口级总清单（styles 17 段 + legacy-doc 4 段 + 4 chunk +
  B4-3 余项）全部转为逐字重建或裁决豁免（vendored）。
- 每批 4 项验证门禁全绿。
- SYMBOL-INDEX 增量登记全部新符号。
- `out/` md5 复验不变。
- 完成后才进入 PORTING-PLAN.md 阶段 A。
