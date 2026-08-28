# SUMMARY — ZCode 3.7.6 恢复版 · 解混淆总报告（D9 汇总）

> 面向用户的最终报告。配套产物：`SYMBOL-INDEX.md`（全局导航底座）、`COVERAGE-LEDGER.md`(覆盖率总账 + B4 队列 + 勘误全表)、
> `MODULE-MAP.md`（21 族地图）、`VENDOR-MANIFEST-LIBS/GRAMMARS.md`（上游登记）、32 份 `*.report.md`（逐族证据）。
> 全程只读聚合：`out/` 未做任何修改；除 i18n 去重注释外未改动任何既有 .tsx 内容。

---

## 1. 解了什么（数字）

### 1.1 对象

ZCode 3.7.6 桌面端（Electron + Vite + React 19）渲染进程构建产物 `out/renderer/`：
**757 个 JS 资产 chunk**，核心是 213,695 行的融合 mega-chunk `styles-CdEGpc2x.js`
（shiki core + Lexical + Stripe 等 vendored 段与全部自研 UI 的混合体，压缩标识符）。

### 1.2 产物规模

| 指标 | 数值 |
|---|---:|
| 重建模块文件 | **63 个**（.tsx/.ts，合计 144,791 行重建源码） |
| 族报告 | 32 份 *.report.md + MODULE-MAP + 2 份 VENDOR-MANIFEST |
| 符号索引条目 | **2,394 条**（语义名 ↔ 混淆名 ↔ js/jsx 行号 ↔ 所在文件，D9 脚本抽取 + 抽样校验） |
| 覆盖族 | 21 族（F00–F20）+ 横切层 8 类（20 zustand store / services IPC / i18n / Radix+cmdk / 184 图标 / testid / 工具块 / 9 个 vendored 库） |
| 词典 | zh-CN / en-US 各 **4,503 key**（77 个一级前缀，逐字节保真） |

### 1.3 覆盖率

**styles 融合 chunk（213,695 行）—— 归属 100%，无残余**：
- 逐字重建（源码行覆盖）≈ **95,000–100,000 行（≈45–47%）**：21 族中 17 族的主体已逐字转录
  （类名 / i18n key / data-* 属性 / 常量 / 分支零改动）；
- 接口级登记（B4 队列）≈ **41,000 行（≈19%）**：行号锚点 + 职责核定，待批次展开；
- vendored / 横切登记 ≈ **62,262 行（29.14%）**：9 个库体按上游身份+版本登记（整体替换策略）。

**757 资产 chunk**：602 数据存档（470 语法 + 132 主题，**100% 字节级比对上游**）+
143 vendor JS + 2 wasm（全部带版本证据）+ 12 first-party（8 全量重建 + 4 登记）；
另有 4 个未重建 first-party chunk（skillStore / src / usageStatsUiParts / process-monitor）列入 B4。

### 1.4 关键定性结论

- i18n 为 **ZCode 自研**（无 react-intl/ICU；`{placeholder}` replaceAll 插值 + 伪复数 key 23 个）；
- markdown 层 = **streamdown@2.5.0**（vercel，Apache-2.0）+ ZCode 集成层 `cj`（styles F19）；
- xlsx 预览 = **私有 react-xlsx 引擎**（99.89% 库壳）+ duke-sheets Rust wasm 桥；
- 终端 = vendored **xterm 3.7.8** fork + 自研宿主（IME 守卫/主题合成/OSC52）；
- 「审查」标签 = 固定 id `git`；Home = R0 的 draft 形态（非独立路由）；
- `hT` 非「权限状态机」而是**会话遥测/归因监督器**；`nge` = useGitRepository（两处地图误认已纠正）。

---

## 2. 质量证据

### 2.1 静态检查

- **tsc `--noEmit --strict`：63 个文件全部 0 错误**（每批次独立验证，@types/react 18.3.31 环境；
  见各报告 §验证记录）。
- esbuild `--loader:.tsx=tsx --jsx=preserve`：63/63 解析通过。

### 2.2 运行时等价 harness 清单

| harness | 对象 | 结果 |
|---|---|---|
| `/tmp/verify-intlProvider.mjs` | intlProvider.tsx vs 原 chunk（Node ESM 并排，桩 dispatcher） | **14/14 PASS**（导出面 / 词典 4,503×2 逐键 / 存储三路径 / formatMessage 逐 id / 占位替换 / 越界抛错文案） |
| `/tmp/verify-button.mjs` | button.tsx vs 原 chunk | **12/12 PASS**（cva 组合 10+5 例 / buttonVariants 7×10 全组合 / 图标形状 / Button 渲染等价） |
| `/tmp/verify-appUsageChartPalette.mjs` | 调色板模块（真实加载 recharts bundle） | **12/12 PASS**（取色回绕 / 三事件 hook action 深度相等 / noop 兜底） |
| `/tmp/verify-charts-surface.mjs` | 三个图表 chunk 导出面 | 3/3 PASS |
| ChartUtilsIme 运行时抽查 | cn 冲突消解 / isComposingText / sha256 测试向量 / pptx 引用往返 / **renderToString 14 项** | 全过 |
| 本账 D9 行号回代 | 16 个符号锚点 → 原始 chunk 对应行 | **16/16 逐字命中**（`function X(` / `var X = memo(`） |
| 本账 D9 抽样 | 2,394 条索引的 12% 随机样本（297 条）存在性复核 | **0 失败** |

### 2.3 字节级保真项

- i18n 词典：I18n.tsx 行 314–4828 / 4833–9351 与来源行 49–4563 / 4566–9084 `diff` = **0 差异**；
- 602 grammar/theme chunk 与 @shikijs/langs@3.23.0&4.0.2、@shikijs/themes、@pierre/theme@0.0.28 **字节级一致**（含双哈希孪生配对）；
- `duke_sheets_wasm_bg.wasm` 4,345,449 B 与 @dukelib/sheets-wasm@0.1.21 **逐字节同长**；
- lucide 图标 iconNode / cva 0.7.1 / recharts 选择器族：与 node_modules 上游逐字节/逐语句一致；
- DiffsWorker `EXTENSION_TO_LANGUAGE` 343 条：程序化抽取，条目数与源文件精确相等；
- pptx 表格样式 84 项 GUID 表、343 条语言映射、PDF 常量族：逐字转录。

### 2.4 交叉验证方法（每族报告 §3）

规格断言 ↔ 代码证据逐条对拍：TopBar 12 条 / Sidebar 10 条 / Conversation 8 条 / WorkspaceShell 11 条 /
Settings 8 段 / QuickPick 13 条 / SidePanel tab 型 14 型全表 / Home 8 条 —— 由此产出 §3 勘误表（见 COVERAGE-LEDGER §d）。

---

## 3. 导航方法 —— 如何用 SYMBOL-INDEX.md 改造前端

`SYMBOL-INDEX.md` 是四向表（**语义名 ↔ 混淆名 ↔ js/jsx 行号 ↔ 所在文件**，2,394 条，24 族分节，
每族附「外部依赖跨引用：符号 → 提供模块」+ 附录 B 冲突裁决）。四种用法：

1. **语义名 → 源码**：想改「侧栏任务行」→ 搜 `TaskRow` → 得 `E8` js 151186 / jsx 125140 →
   在 `out/.../styles-CdEGpc2x.js:151186` 看原始实现、在 `Sidebar.tsx` 看语义重建。
2. **混淆名 → 语义**：读旧代码/日志遇到 `xqt` → 反查 = SidePanel 根（182519）。
3. **族入口**（改造最先碰的 P0 根组件）：
   | 族 | 根 | js | jsx |
   |---|---|---|---|
   | Sidebar | `rVt` WorkspaceSidebar | 159137 | 132075 |
   | Home | `hit`(memo `git`) DraftComposerRegion | 90180 | 78144 |
   | Conversation | `R0` ConversationPane | 119219 | 101388 |
   | SidePanel | `xqt` SidePanel | 182519 | 147333 |
   | QuickPick | `Rje` QuickPick | 36439 | 33404 |
   | Settings | `j9` SettingsView | 204878 | 163283 |
   | 壳（基础设施） | `yJt` WorkspaceShell / `XJt` WorkspaceRoot | 183896 / 186219 | 148387 / 150098 |
4. **改造工作流**：选族（建议 Home/Sidebar 起步）→ SYMBOL-INDEX 定位根与闭包符号 →
   以重建 .tsx 为行为蓝图按自己的设计系统重写 → 文案对照 **I18n.tsx 词典**（4,503 key，
   前缀 ↔ 族对照见 I18n.report §4）→ 跨 chunk 依赖按各族「外部依赖跨引用」表替换为自己的等价物。
   交互规格可直接引用：快捷键表（QuickPick.report §3）、14 型侧面板标签（SidePanel.report §2）、
   43 个行式设置项（Settings.report §2）、布局树（WorkspaceShell.report §3）。

---

## 4. 下一步建议

### 4.1 B4 批次（接口级展开，全表见 COVERAGE-LEDGER §c，28 组）

- **B4-1（高价值）**：① Composer 族 F08 first-party ~5,700 行（改造第一触点）；② F12 供应商卡 +
  支付/用量深部 ~8,000 行；③ 未重建底座 chunk：src-HCld2afU（~400 符号）与 skillStore（useTaskStore 系）。
- **B4-2（族闭环）**：15 个工具视图（104622–109105）、Sidebar ★叶子（~3,500 行）、$It 文件树、
  自动化编辑器 kNt/YMt、插件三视图、F19 预览卡群、Bots/WebRemote/Onboarding 余量、反馈中心 RMe、远程向导。
- **B4-3（深部/低优先）**：legacy-doc 内部引擎 [E1]–[E7] ~26,000 行（优先 [E4] DOCX XML→模型 与
  [E7] 页面渲染器锚点展开）、xterm fork 契约口径、react-xlsx 深部、遥测下沉函数。
- vendored 库体（~52,000 行：shiki/Lexical/framer-motion/dnd-kit/xterm/qrcode…）维持
  「npm 依赖整体替换」策略，不逐行还原。

### 4.2 基于此重建自己的前端

- 抽取/改造顺序建议（MODULE-MAP §5）：**F07 壳与分屏（装配环境）→ F02 Home + F08 Composer
  （第一触点）→ F03 Conversation → F01 Sidebar → F04 SidePanel → F06 Settings**，P1/P2 按需。
- 每个重建文件即行为蓝图：类名/常量/键盘处理/持久化键（`zcode-*` 30+ 键已全量登记）可直接移植；
  各报告 §3 的规格对拍表可作验收清单；COVERAGE-LEDGER §d 勘误表是规格 ↔ 实现的差异全记录。
- 设计系统差异点已定位：`text-ui-*` 字号体系（cn 定制）、`rounded-2xl` 卡片、
  `@container` 断点（摘要栏 1136px）、zai-dark/zai-light 主题对、pierre-dark/light 代码主题。

### 4.3 D5 · nofy 内核接线

- **渲染器 ↔ 宿主契约面**已完整重建：`rendererEntry.tsx` 尾符号表列出 **34 个服务通道描述符**
  （zcodeSession/setting/terminal/git/hooks/mcp/usageStats/…），`services.tsx` 重建了
  MessagePort 流协议（`ise`/`ase`/`Us`：帧格式、流控 `__zcodeRpcControl: connection-flow-v1`、
  错误透传字段）。nofy 内核实现宿主侧对应服务面即可对接整个重建前端。
- 命令队列运行时（`services.tsx` G 段：steer/dispatch/admittedAt/provenance + 23 个会话命令白名单 +
  16 种帧装配故障码）是内核会话协议的现成参照。
- 跨窗口同步范式（i18n 广播 `state:locale` + 代际计数 + 回环抑制）可作 nofy 多窗口状态同步的模板。
- 遥测监督器（`hT`，700 行全量转录）给出了前端侧事实归因的完整字段表，供内核侧采集对齐。

---

## 5. 产物清单（D9）

| 文件 | 内容 |
|---|---|
| `SYMBOL-INDEX.md` | 四向符号索引（2,394 条 / 24 族 / 外部依赖跨引用 / 冲突裁决附录） |
| `COVERAGE-LEDGER.md` | 覆盖率总账（a 逐族行账 / b 757 资产三态 / c B4 队列 28 组 / d 勘误全表 35 条） |
| `SUMMARY.md` | 本文件 |
| `intlProvider.tsx`（头注） | `// DUPLICATE-OF: I18n.tsx`（i18n 去重，不删文件） |
| `I18n.tsx`（头注） | ★ CANONICAL 标注（词典与 API 以它为准） |

生成与校验：抽取脚本 `/tmp/d9/extract_symbols.py`（原始 TSV `/tmp/d9/symbols-raw.tsv`）；
12% 抽样 0 失败；16 行号锚点回代 16/16 命中；`out/` 只读未动。
