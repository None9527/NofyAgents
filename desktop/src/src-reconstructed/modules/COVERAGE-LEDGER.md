# COVERAGE-LEDGER — ZCode 3.7.6 恢复版覆盖率总账（D9）

> 只读聚合：数字汇总自 MODULE-MAP.md、VENDOR-MANIFEST-LIBS/GRAMMARS.md 与 32 份 *.report.md；
> 行号口径同 SYMBOL-INDEX.md（styles 族 js=压缩版主口径 / jsx=pretty 版；独立 chunk 指自身行号）。
> 记账约定沿用 MODULE-MAP §4：双归属重叠 12,651 行按去重计；「已抽取占位」族跳过重计。
> **B4 更新（2026-08-26）**：五批产物落地后 styles 与 legacy-doc 引擎区三态已重算——逐族更新见 §a 表，
> 完成台账/验证/裁决/新数字见 §f；§c 队列已加「B4 状态」列。

---

## a) 融合 chunk `styles-CdEGpc2x.js`（213,695 行）逐族账目

**总账（MODULE-MAP §4，无残余）**：族归属 151,433 行（70.86%）+ 横切层/库/构建元数据 62,262 行（29.14%）= 100%。

三态定义：
- **逐字重建** = 源码行已按逐字/逐句转录进重建文件（类名、常量、分支零改动；把握度「高」）；
- **接口级登记** = 行号与职责已核定、以 `declare` 接口 + 行为注释挂接（= B4 队列，见 §c）；
- **vendored 登记** = 第三方库体，按 npm 依赖整体替换策略登记上游与版本，不逐行还原。

| 族 | 地图行数 | 逐字重建（源码行，约） | 接口级登记（约） | vendored 登记（约） | 重建产物（重建行数） |
|---|---:|---|---|---|---|
| F00 TopBar | ~7,860 | ~6,100（四段主体；COt/r4 已由 Modals 补齐，mlt 系已由 GitReview 补齐） | ~900（zZ 弹层 cmdk 全量深部） | — | TopBar.tsx（3,073） |
| F01 Sidebar | ~16,550 | ~15,550（B4 SidebarLeaves 转入 ~2,500：uzt/VFt/mRt 骨架/ABt 光束族/lLt/mLt 远控列表段） | ~1,000（ZS 深部 13 助手/拖拽碰撞；$It 属 F04） | — | Sidebar.tsx（7,204）+ SidebarLeaves.tsx（4,271） |
| F02 Home | ~1,415（+off-peak 段 ~600） | ~2,000（hit/git/Sit/Cit/kit/bX/a4/SV/mC 全量） | 接口引用件属 F08/F10（见 B4） | — | Home.tsx（3,517） |
| F03 Conversation | ~22,720 | ~22,300（B4 ConversationLeaves 转入 ~5,300：15 工具视图/预览卡/自动化卡/captcha 全链/滚动助手 14 个/交互 toast） | ~400（FileRewindDialog 深部 v_t/__t/p1/yg） | shiki 核心 100520–104621（~4,100，与 X08 双归属） | Conversation.tsx（8,342）+ ConversationOverlays.tsx（2,149）+ ConversationLeaves.tsx（4,193） |
| F04 SidePanel | ~7,190 | ~4,600（xqt/标签栏/空态/状态机 1978–3549/入口） | ~1,678（$It 文件树）；叶子 BWt→GitReview、五视图→ExtendedViews、bUt/_Wt/vWt→Term/Browser、tHt→CodeViewer 已分流抽取 | — | SidePanel.tsx（4,770） |
| F05 QuickPick | ~1,250（+横切段） | ~3,150（Rje/nPt/O_e/D_e/mje/历史/过滤/高亮 + Vo 1553–1878 + ZS 35727–36070 + rge 24015–24078 + fuzzy 25586–25631；B4 StoresDeep 转入 Vo 纯助手块 1297–1552 ~256） | ZS 深部 13 助手（~700，与 F01 共记） | cmdk 库体 26004–26574 | QuickPick.tsx（3,108） |
| F06 Settings | ~19,010 | ~4,500（j9 壳/注册表/通用/外观/记忆/索引/浏览器/MCP 工具条/导航状态机） | 九大分区叶子 → 已由 SettingsPanels 批实体化（见下行）；子代理/插件分区已由 B4 SettingsLeaves §A/§B 实体化；余 MCP 纯助手群 ~600（见 §f） | — | Settings.tsx（5,419） |
| F06/F12/F15 分区叶子（B3 批 + B4 批） | （含在 F06/F12/F15 行段内） | ~22,100（B3：FQt 根/面板/导航模型、HQt 全族、y1t、H1t、I0t、G0t、p2t、d6 视图态、p1t 消费面、V2t、U8/gk；B4 转入：子代理分区 888 + 插件分区 1,850 + kNt/YMt 编辑器族 4,400 + u7 卡群深叶 4,101 + 配额/权益/用量钩 1,216） | ~600（MCP 纯助手群；原 ~6,700 行合计偏低，B4 实际展开 11,329 行已按去重口径并入逐字） | — | SettingsPanels.tsx（4,059）+ SettingsPanelsCapability.tsx（5,230）+ SettingsPanelsData.tsx（1,676）+ SettingsLeaves.tsx（6,663，含 F15 §C）+ UsageDeep.tsx（6,353，F12 域） |
| F07 WorkspaceShell | ~7,280 | ~4,700（yJt/XJt/l4/p4/tkt/助手群/持久化/壳平台助手） | ~210（cAt/pAt/uAt resizable-panels 引擎，vendored 变体接口）+ 它族叶子引用 | — | WorkspaceShell.tsx（6,015） |
| F08 Composer | ~12,430 | — | ~5,700（ZV/KJe/SJe/工具条/附件/草稿域，**未抽取**） | Lexical 引擎 57652–63592（~5,940） | —（B4-1） |
| F09 Modals | ~5,290 | ~4,730（COt 全量/三同步对话框/preflight/MEt/E3t 向导/q4t/G4t/P9；B4 ModalsLeaves 转入 Bc/Vc/Mc 文件路径族 ~84） | ~2,785（RMe 反馈中心 39107–41892）；R7/I2t/v$t 共用面经 B4 裁决确认已由 SettingsPanels 族抽取，不再计接口级 | — | Modals.tsx（5,473）+ ModalsLeaves.tsx（1,614，F09/F14/F18 混合） |
| F10 Remote | ~4,740 | ~2,340（r4 分派 + ZEt/lDt/XDt + $Dt + preflight 全量，随 Modals） | ~1,320（fOt/uOt/REt 向导） | — | （随 Modals.tsx；向导待 B4） |
| F11 Bots | ~1,790 | — | ~1,790（qLt 全族未抽取） | — | —（B4） |
| F12 ProviderPlanUsage | ~13,960 | ~7,700（FQt 分区根/面板随 SettingsPanels；B4 UsageDeep 转入 5,317：计费折扣簇 51857–52041 + 权益数据层 52266–52745 + 配额助手/侧栏件 76101–76563 + 供应商卡群 187188–191288 + 用量钩 195171–195258） | ~2,700（支付深部第二符号组：zet 84412/Zet 85948/e5e 79979/Xrt/Zrt 89295/Mq 76864/j3e 76630/xnt 87999，77080–90180 余段，除 vendored qrcode） | QR 生成库 78408–79978（1,571） | UsageDeep.tsx（6,353）+（部分随 SettingsPanels） |
| F13 Dock/Term/Browser | ~3,850（应用层） | ~3,550（yUt/bUt/jqt/Mqt/dock 状态机 + 浏览器全族 kUt…vWt/元素选择器/响应式视口） | ~300（TWt–LWt 归 F04 域） | xterm 162010–175264（13,255，版本标记 3.7.8；OSC52 addon 为应用级已重建） | TerminalPane.tsx（1,974）+ BrowserPane.tsx（3,263） |
| F14 CodeViewer | ~2,570（应用层） | ~2,900（tHt/DVt 分派全族 + FH 消费面 + 编辑器偏好；B4 ModalsLeaves 转入 ~1,120：El gutter 6062–6881 全量 + 指针目标/hast 助手 5249–5313/6959–7012 + gut/mut/hut/ahe/dhe diff 预览族） | ~160（MO 代码查看器深部 47501–47660） | shiki/diff 引擎（X08/X09） | CodeViewer.tsx（2,414）+ ModalsLeaves.tsx（F14 段） |
| F15 Automations | ~6,260 | ~9,000（d6 视图态全量 + 次级件，随 ExtendedViews/SettingsPanelsCapability；bX/kit 随 Home；B4 SettingsLeaves §C 转入 ~4,400：kNt 137005–138512 + YMt 135576–136025 + 编辑器助手族 134026–136937 + cron 域 109250–109510） | ~0（收尾；清单外尾部助手保留前序 declare） | — | SettingsLeaves.tsx §C（分流抽取） |
| F16 RepoWiki | ~1,800 | ~1,800（l3 全族 + 纯函数群，随 ExtendedViews） | — | — | （随 ExtendedViews.tsx） |
| F17 WebRemote | ~2,580 | — | ~2,580（BPt/rRt/oRt/JPt 未抽取；mLt 列表段已随 SidebarLeaves 抽取，见 §c #6） | — | —（B4 后续） |
| F18 OnboardingLogin | ~6,050 | ~1,680（E3t 向导全件随 Modals；B4 ModalsLeaves 转入 hero 三件 x4t/S4t/C4t 206054–206094 ~66） | ~3,230（m3t/b4t/v8t/k3t/A3t/s4t） | — | （随 Modals.tsx + ModalsLeaves.tsx；余 B4 后续） |
| F19 Markdown | ~10,750 | ~3,300（cj 装配链/文本管线/插件四件套/代码块 UI/元素渲染器，MarkdownIntegration） | ~1,800（预览卡群 50618–51687、MBe handler 49180–49640、MO/Qze/Wk 深部） | DropdownMenu 47926–48040 双归属 X03 | MarkdownIntegration.tsx（2,749） |
| F20 Bootstrap | ~1,960 | —（入口 chunk 另计） | ~760（g8t 应用根 212594–213269、i8t、x8t/C8t/T8t）+ j6t useWorkspaceActions | — | rendererEntry.tsx（735，覆盖 index-ABImDspU.js 567 行） |
| 横切 stores（20 个） | ~6,300（行段合计） | 20/20 全量抽取（111 字段 / 178 动作）；B4 StoresDeep 转入深层纯函数助手 ~554（Vo 搜索块 1297–1552、T3、F6、B6、Z0t、Eit） | 余 ~200（协议宿主常量 6 + YAe/Tte/Ane，随 services 余量） | — | stores-core（840）/session（1,422）/tasks（913）/workspace（1,517）+ StoresDeep.tsx（3,358） |
| 横切 services | ~7,600 | 全量（事件原语/IPC 客户端/注册解析/工作区钩子/作用域/遥测监督/命令队列）；B4 StoresDeep §H 转入遥测下沉 **29 函数**（40397–41807，超出原 ×25 登记） | 协议宿主常量 6、帧纯函数 3（~200） | — | services.tsx（4,321）+ StoresDeep.tsx §H |
| 横切原语/图标 | ~9,600 | cmdk 封装（随 QuickPick）、Tabs/Switch/Select/Dialog 类名逐字引用 | Dialog/ContextMenu/Badge/Avatar/ScrollArea 原语接口级 | 图标块 184 个（26575–28020，lucide vendored）+ Radix 封装主块 28021–32245 | （随各族引用） |
| vendored 库块（X08–X14 等） | ~52,000 | —（策略：整体替换为依赖） | — | shiki 10880–17444（6,565）/ diff 17445–23919（6,475）/ mermaid 44696–46174（1,479）/ lru-cache 46175–46900（726）/ Lexical（5,940）/ framer-motion 69298–75526（6,229）/ qrcode（1,571）/ dnd-kit 91811–94695（2,885）/ xterm（13,255） | — |
| 构建元数据/互操作 | ~3,000 | — | — | 1–995（mapDeps+import 块）+ 996–1552（React 互操作）登记 | — |

**styles 汇总（B4 后重算，约值，双归属去重后）**：
- 逐字重建 ≈ **118,400–123,400 行**（≈ **55–58%**；B4 前 95,000–100,000）
- 接口级登记 ≈ **17,600–18,600 行**（≈ **8–9%**；B4 前 41,000–42,000，B4 转出 ~23,400）
- vendored/横切登记 ≈ **62,262 行**（29.14%，其中库体 ~52,000）——**不变**
- 双归属去重 12,651 行——不变；归属合计 = **213,695 / 213,695（100%，无残余）**

**B4 逐字转入明细（接口级 → 逐字，~23,400 源码行，逐族）**：

| 族 | B4 产物 | 转入行段（js，约） | 转入行数（约） |
|---|---|---|---:|
| F01 | SidebarLeaves.tsx | VFt/W6/FFt 144351–144427 区、uzt+合成族 152903–153205 区、mRt 150255、光束族 156793–157550 区、lLt 146823、mLt 147286+远控行族 | ~2,500 |
| F03 | ConversationLeaves.tsx | 15 工具视图+Hpt/Xpt/Ypt 104622–109105、滚动助手 14 个、预览卡族、自动化卡族、captcha 全链 117919+100045–100680 区、交互 toast 117283/117346 | ~5,300 |
| F12 | UsageDeep.tsx | 51857–52041 + 52266–52745 + 76101–76563 + 187188–191288 + 195171–195258 | 5,317 |
| F06 | SettingsLeaves.tsx §A/§B | 子代理 196654–197541（888）+ 插件 198144–199993（1,850） | 2,738 |
| F15 | SettingsLeaves.tsx §C | kNt 137005–138512 + YMt 135576–136025 + 编辑器助手族 134026–136937 区 + cron 域 109250–109510 | ~4,400 |
| F14/F09/F18 | ModalsLeaves.tsx | El 6062–6881 + 指针/hast 助手 5249–5313/6959–7012 + gut/mut/hut/ahe/dhe + Bc/Mc 5113–5196 + hero 206054–206094 | ~1,220 |
| 横切 | StoresDeep.tsx | Vo 块 1297–1552 + T3 134084–134110 + Eit 91354 + Z0t 201185–201243 + F6 142700–142753 + B6 142873–142984 + bFt 143135–143180 + 遥测 40397–41807 | ~1,966 |
| **合计** | 7 件（16 件中之 styles 侧） | | **~23,400** |

**剩余接口级清单（styles，B4 后；条目合计含双归属，去重后 ≈ 18,100）**：

| # | 段 | 行号（js，除注明） | 行数（约） |
|---|---|---|---:|
| 1 | F08 Composer 族 first-party（ZV/KJe/SJe/附件/草稿域，**最大余项**） | 57652–69297 去 Lexical + 75527–76245、77014–77079 | ~5,700 |
| 2 | F18 Onboarding/Login 余量（m3t/b4t/v8t/k3t/A3t/s4t，除 hero 三件） | 205680–211384 + 213270–213616 余段 | ~3,230 |
| 3 | F09 反馈中心 RMe | 39107–41892 | ~2,785 |
| 4 | F12 支付深部第二符号组（zet 84412/Zet 85948/e5e 79979/Xrt/Zrt 89295/Mq 76864/j3e 76630/xnt 87999；77080–90180 余段，除 vendored qrcode 1,571） | 76564–90180 区 | ~2,700 |
| 5 | F17 WebRemote 族（BPt/rRt/oRt/JPt） | 140669–142371 + 149554–150434 | ~2,580 |
| 6 | F20 应用根 + 余量（g8t/i8t/x8t/C8t/T8t/j6t） | 210486–213695 余段 | ~1,900 |
| 7 | F19 预览卡群 + MBe handler + Wk 画廊 | 50618–51687 + 49180–49640 | ~1,800 |
| 8 | F11 Bots 族（qLt 全族） | 147767–149553 | ~1,790 |
| 9 | F04 工作区文件树 $It | 146089–147766 | ~1,678 |
| 10 | F10 远程向导（fOt/uOt/REt） | 124267–124993 + 127935–128568 | ~1,320 |
| 11 | F05/F01 ZS 深部 13 助手 + 拖拽碰撞 | 32279–35697 散点 + F01 段 | ~1,000 |
| 12 | F00 zZ 弹层 cmdk 深部 | 96589–97700 | ~900 |
| 13 | F06 MCP 纯助手群 + 迁移助手尾部 | 155522–155824/157977–158525/158854–159974 余段 + 203136–203144 | ~600 |
| 14 | F03 FileRewindDialog 深部（v_t/__t/p1/yg） | 94xxx/110xxx 散段 | ~400 |
| 15 | 横切 services 协议宿主常量 6 + YAe/Tte/Ane | 散点 | ~200 |
| 16 | F07 resizable-panels（cAt/pAt/uAt，vendored 变体 → 依赖替换策略） | 131422–131631 | 210 |
| 17 | F14 MO 代码查看器深部 | 47501–47660 | ~160 |
| — | **条目合计** | | **~29,250** |

> 条目合计（~29,250）大于去重后总量（~18,100）：与旧账同口径，双归属段（ZS 深部 F01/F05、cron 域 F03/F15、u7 卡群 F06/F12 等）不重复计，12,651 行去重约定沿用。
> styles 之外另有：未重建 first-party chunk ×4（skillStore/src/usageStatsUiParts/process-monitor）与 legacy-doc 引擎区剩余段（见 §f.4）。

---

## b) 757 资产 chunk 三态计数（`out/renderer/assets/*.js`）

| 类别 | 数量 | 明细 |
|---|---:|---|
| **数据存档（grammar/theme）** | **602** | 470 TextMate 语法 + 132 主题（含 2 × @pierre/theme@0.0.28）；**602/602（100%）字节级比对上游**（@shikijs/langs@3.23.0/4.0.2、@shikijs/themes@3.23.0/4.0.2、@pierre/theme@0.0.28）；235 种语言、67 主题；双哈希孪生 442 字节相同 + 132 包装差异 + 26 版本漂移（13 名，3.23.0/4.0.2 双快照）——VENDOR-MANIFEST-GRAMMARS.md |
| **vendor 登记（含版本）** | **143 JS + 2 wasm** | VENDOR-MANIFEST-LIBS.md 145 条：react 19.2.7 / recharts 3.8.0 / mermaid 11.14.0（+dompurify 3.3.3/js-yaml 4.1.1/dayjs 内联）/ @mermaid-js/parser ^1.1.0 / dagre-d3-es 7.0.14 / lodash-es ^4.17.23 / d3 ^7.9.0（d3-scale 4.0.2 等）/ cytoscape 3.33.2 / roughjs ^4.6.6 / katex 0.16.x / @braintree/sanitize-url ^7.1.1 / khroma ^2.1.0 / pdfjs-dist 5.4.296 + react-pdf 10.4.1 / docx-preview 0.4.0 + JSZip 3.10.1 / fflate 0.8.3 / radix（popover 1.1.15/focus-scope 1.1.7/slot 等）/ @tanstack/react-virtual 3.13.23 / tailwind-merge 3.5.0 / tiny-invariant 1.3.3 / streamdown@2.5.0 依赖树 / lucide-react 1.17.0 + cva 0.7.1 / xterm 3.7.8（styles 内）/ react-xlsx 私有引擎 + @dukelib/sheets-wasm 0.1.21 + @pierre/theme；wasm：docx_wasm_bg（1,119,333 B，docx-core Rust）+ duke_sheets_wasm_bg（4,345,449 B，duke-sheets Rust 工作区） |
| **first-party 重建** | **20**（12 全量 + 8 包装层/分段） | 全量：index-ABImDspU（rendererEntry.tsx）、e2eStoreBridgeBootstrap、button-laUijeDG（button.tsx）、logger-PFDwl5Yq（logger.tsx）、utils-CEEH0K_K（UtilsCn.tsx）、IntlProvider-C321H7m8（I18n.tsx canonical）、appUsageChartPalette、AppUsageDailyModelBarChart、AppUsageModelUsagePieChart、CodingPlanUsageLineChart、mermaid-GHXKKRXX（shim）、highlighted-body-OFNGDK62；包装层/分段：styles-CdEGpc2x（族抽取，见 §a）、chart-iT2j9K3u（shadcn 层 14137–14344）、imeComposition（first-party 层 10872–12569）、chunk-BO2N2NFS（streamdown first-party 16%）、pdf-viewer（自研段 20821–21205）、diffs.worker（自研段 9172–10697）、previewPaneOfficeDocxContent（包装层 6679–6776 jsx）、previewPaneOfficeLegacyDocContent（公共层）、previewPaneOfficeXlsxContent（自研 94 行 + 桥 134 行）、pptxRendererPreviewEngine（7 文件）、pptx-preview-viewer、presentationPdfPrintExport、presentationElementModel（98 行全量） |
| **未重建 first-party（B4 队列）** | **4** | skillStore-BmeKHDBI.js（useTaskStore/useSkillsStore + 40+ 选择器）、src-HCld2afU.js（~400 符号：testid/zod/枚举）、usageStatsUiParts-CiR7YEhh.js（Tooltip/Popover/用量助手）、process-monitor-DOlutpPR.js |

**核对**：602 + 143 + 12 = **757** ✓（12 = 8 全量重建的独立 chunk + styles + 3 图表 chunk + e2e 桥 + 入口，均不在两份 manifest 内；pierre-dark/light 2 件计入 602 数据存档）。

---

## c) B4 队列清单（接口级 / 中把握度 / 后续展开）

> 口径：各报告标「接口级」「登记」「待抽取」「后续展开」的符号/行段。行号 = styles js（除注明外）。
> 建议批次：**B4-1** = 用户改造高价值；**B4-2** = 补全族闭环；**B4-3** = 深部引擎/低优先。
> **B4 状态（2026-08-26）**：本队列多数项已随 B4 批次落地（逐行见「B4 状态」列）；完成台账、验证与裁决见 §f。
> **B5 状态（2026-08-29）**：本队列全部余项已经 B5 十七批全量解码清零——逐行对照见 §g.1/g.2；
> 唯一豁免 = vendored 依赖替换策略项（xterm/resizable-panels/Lexical/qrcode/diff 引擎等）。

### c.1 大块（未抽取族/引擎）

| # | 对象 | 行号/规模 | 所属族 | 建议批次 | 出处 | B4 状态 |
|---|---|---|---|---|---|---|
| 1 | Composer 族 first-party（ZV/KJe/SJe/ait/Zrt/iZe/TH/lit/JH/uit/vN…DN 附件/草稿域 hH…sH/mXe 白板提及） | 57652–69297 去 Lexical 后 ~5,700 行（+75527–76245、77014–77079） | F08 | **B4-1**（改造第一触点） | Home.report §1.2 / MODULE-MAP F08 | 剩余（B4-1 未启动） |
| 2 | F12 用量深层 + 供应商卡：u7/CXt/v7/nZt/rZt/x7/yZt/bZt/MZt/WZt/eQt/tQt；zet/Zet/e5e/Xrt/Zrt/Mq/s3e/v3e/xnt；q$t/J$t | 188376–191288 深叶 + 76246–77013 + 77080–90180 主体，~8,000+ 行 | F12 | **B4-1** | SettingsPanels.report §7 / MODULE-MAP F12 | 部分 ✓ UsageDeep.tsx（第一符号组 5,317 行；支付深部余） |
| 3 | legacy-doc 内部引擎 [E1]–[E7]：BiDi/文本测量/脚本启发式/XML→模型/缩略图/编辑器核心/页面渲染（tS/ES 接口） | jsx 10305–36416，~26,000 行 | office | **B4-3**（优先 [E4]+[E7] 锚点展开） | OfficePreview.report §3.2/§6 | 部分 ✓ 批次 A+B（E6c/E7 回调簇/20231–20943 余） |
| 4 | xterm vendored 库体 | 162010–175264（13,255 行，`nHt='3.7.8'`） | F13/X14 | 依赖替换策略；契约测试按需（ZCode fork 口径） | TermBrowser.report §7 | 依赖替换策略（不变） |
| 5 | Bots 族（qLt 飞书/Telegram/微信/Webhook） | 147767–149553（~1,790） | F11 | B4-2 | MODULE-MAP F11 | 剩余 |
| 6 | WebRemote 族（BPt/rRt/oRt/JPt + mLt 列表段） | 140669–142371 + 149554–150434（~2,580） | F17 | B4-2 | MODULE-MAP F17 | 剩余（mLt 列表段已随 SidebarLeaves 抽取） |
| 7 | Onboarding/Login 余量（m3t/b4t/v8t/k3t/A3t/s4t） | 205680–211384 + 213270–213616 余段（~3,300） | F18 | B4-2 | MODULE-MAP F18 | 剩余（hero 三件已随 ModalsLeaves 抽取） |
| 8 | 应用根 g8t + F20 余量（i8t/x8t/C8t/T8t/j6t useWorkspaceActions） | 210486–213695 余段（~1,900） | F20 | B4-2 | MODULE-MAP F20 / Modals.report §5 | 剩余 |
| 9 | 反馈中心 RMe | 39107–41892（~2,785） | F09 | B4-2 | Modals.report §1 | 剩余 |
| 10 | 远程向导（fOt/uOt/REt 四型分步流） | 124267–124993 + 127935–128568（~1,320） | F10 | B4-2 | Modals.report §8 | 剩余 |
| 11 | 未重建 first-party chunk ×4：skillStore / src-HCld2afU / usageStatsUiParts / process-monitor | 4 chunk | 横切 | **B4-1**（src/skillStore 为全图依赖底） | 本报告 §b | 剩余 |

### c.2 已抽取族内的接口级叶子

| # | 对象 | 行号 | 所属族 | 建议批次 | 出处 | B4 状态 |
|---|---|---|---|---|---|---|
| 12 | 15 个工具视图（opt/Gft/Spt/upt/Mht/Pht/Vpt/Dht/Sht/mht/eht/ght/omt/Nmt/Wmt/Qpt；ept shell 已作代表） | 104622–109105（~4,483） | F03 | B4-1 | Conversation.report §7 | ✓ ConversationLeaves（15 视图 + Hpt/Xpt/Ypt） |
| 13 | FileRewindDialog 深部（v_t/__t/p1/yg）+ 预览卡单项 + 自动化卡 + captcha 部件 + 滚动助手 14 个 + Xpt/Hpt | 94xxx/110xxx/117xxx–118xxx 散段 | F03 | B4-2 | Conversation.report §5/§7 | 部分 ✓（除 rewind 深部外全部抽取） |
| 14 | Sidebar ★叶子：uzt/VFt/mRt/ABt+TBt…wBt 光束/lLt/mLt/FileTreePanel/ZS 深部/拖拽碰撞 | 144427/150255/153205/156793–157547/146823/147286 等（~3,500） | F01 | B4-2（uzt 优先） | Sidebar.report §7 | 部分 ✓ SidebarLeaves（ZS 深部/拖拽碰撞余） |
| 15 | 工作区文件树 $It | 146089–147766（~1,678） | F04 | B4-2 | SidePanel.report §1.6 | 剩余 |
| 16 | El gutter 控制器 + MO 代码查看器深部 | 6062–6881（~820）+ 47501–47660 | F14/F19 | B4-2 | TermBrowser/MarkdownIntegration report | 部分 ✓ ModalsLeaves（El 全量；MO 余） |
| 17 | 自动化编辑器 kNt + 闲时 YM t/cMt + T3/bX 深层动作 | 137005–138822（1,818）+ 114019 + 134679–134923 | F15 | B4-2（F15 收尾） | ExtendedViews.report §7 | ✓ SettingsLeaves §C（+ StoresDeep T3） |
| 18 | 设置深叶：插件三视图 m0t/S0t/D0t 群、子代理 n9/V1t、MCP 纯助手群、迁移助手 | 158854–159974 / 157977–158525 / 155522–155824 / 203136–203144 | F06 | B4-2 | SettingsPanels.report §7 | 部分 ✓ SettingsLeaves §A/§B（MCP 纯助手群余） |
| 19 | F19 余量：预览卡群 + MBe 交互 handler + Wk 画廊 | 50618–51687 + 49180–49640（~1,800） | F19 | B4-2 | MarkdownIntegration.report §8 | 剩余 |
| 20 | QuickPick 深部：ZS 13 助手（Ex/Ox/sje…）+ Vo 7 合并助手 | 32279–35697 散点 | F05/F01 共享 | B4-2（随侧栏） | QuickPick.report §8 | 部分（Vo 纯助手块已随 StoresDeep §A；ZS 13 助手余） |
| 21 | services 余量：遥测下沉 ×25 + 协议宿主常量（bi/KAe/GAe/UAe/WAe）+ YAe/Tte/Ane + F12 域助手 | 41500–41800 + 散点 | 横切 | B4-3 | Stores.report §6/§7 | 部分 ✓ StoresDeep §H（遥测 29 函数；协议宿主常量余） |
| 22 | TopBar 残余：zZ 弹层 cmdk 全量 | 96589–97700 深部 | F00 | B4-3 | TopBar.report §7 | 剩余 |
| 23 | resizable-panels 引擎内部（cAt/pAt/uAt） | 131422–131631 | F07 | 依赖替换策略 | WorkspaceShell.report §6 | 依赖替换策略（不变） |
| 24 | xlsx react-xlsx 深部：Ru→oy→canvas 渲染层；地图数据段仅登记 | 15672–17817 / 193217–199291 / 183972–189511（地图数据 17818–183063 外置） | xlsx | B4-3 | XlsxPreview.report §8 | 剩余（B4-3） |
| 25 | office 接线与几何登记：registerJszip/registerEchartsInit/initAndRegisterDocxWasm 装配；DEFERRED_PRESET_GEOMETRY_ANCHORS 20+ 复杂预设 | pptx chunk | office | B4-3 | OfficePreview.report §6 | 剩余（B4-3） |
| 26 | PreviewMisc 消费侧：lVt 包装（F14）+ diffs 主线程侧 17445–23919/46488–46950 | styles | F14 | B4-2 | PreviewMisc.report §7 | 部分（El/gut 已抽取；lVt/diffs 主线程侧余） |
| 27 | i18n 动态 key 6 前缀消费点落定（mode/forms/appError/notification/taskTimeline/usage）+ postUpdateReleaseNotes/forceUpdate 消费点 | 全域 | i18n | B4-3 | I18n.report §9 | 剩余（B4-3） |
| 28 | CartesianChart-nORn-0bc.js 分包登记 | 1,739 行 | charts | B4-3 | ChartUtilsIme.report §6 | 剩余（B4-3） |

---

## d) 勘误汇总（规格 / 地图 / 清单 回写全表）

状态：**已回写** = 已在 MODULE-MAP/VENDOR-MANIFEST 正文可见；**待回写** = 仅存于报告，建议下版落账。

### d.1 对 zcode-uiux-spec.md（web/docs/zcode-uiux-spec.md）

| # | 勘误 | 出处 | 状态 |
|---|---|---|---|
| 1 | 规格锚点行号口径 = **jsx pretty 版**，非输入 js（BOt 108974/S6 117848/H6 119406/U6 119420/TFt 119938 逐条命中 jsx） | TopBar.report §0 | 已回写（MODULE-MAP 行号口径行） |
| 2 | §13.2/§13.5「j6=面包屑」误认 → 实为**任务重命名对话框**（142581，更多菜单→重命名触发） | TopBar.report §3 | 待回写 |
| 3 | §6 Flt「mini/panel 两态」→ 实为 **mini/panel/auto 三态**（@min-[1136px]/conversation 容器查询） | TopBar.report §3 | 待回写 |
| 4 | §6 建议补记：轮导航刻度条（iyt，≥864px）与选区引用浮层（Tbt，8000 字符上限）为实有能力 | Conversation.report §3 | 待回写 |
| 5 | §13.6 补记三处实测：会话列 <480px 收右栏/<360px 收侧栏（300ms 防抖）；侧栏为自管 separator + 双持久化键；远控壳 automations→chat 强制 | WorkspaceShell.report §3 | 待回写 |
| 6 | §2 Win caption「默认 136px」→ 默认 136 + 原生几何事件**动态修正**（SJt.onWindowControlsOverlayChanged） | WorkspaceShell.report §3 | 待回写 |
| 7 | §9 「自动化」在 3.7.6 被 VMe 门控**侧栏不可见**（注册表保留、意图可达）；「关于/更新」无独立分区（通用更新行 + S6 菜单 + 更新窗三处承载）；主题/缩放在 appearance 分区 | Settings.report §2.8/§7 | 待回写 |
| 8 | §8 段序 7 段 → **6 段**（无 recommended）；chat/navigation 段无注册命令；placeholder 用 commandCenter.placeholder；删 personalization/my-tickets/toggle-browser-panel/toggle-diff-panel/toggle-side-pane（面板内）；§11 快捷键表按 QuickPick.report §3 落账（含 ⌘⇧P 同开命令中心、Ctrl+Alt+B 侧面板） | QuickPick.report §4 | 待回写 |
| 9 | §5 建议卡圆角 rounded-xl → **rounded-2xl border-card-border**；「建议卡」实体 = off-peak 模板卡（offPeak.newTask.template.*），与 Dqe 技能文案数据区分；问候语 6 档 + 20–30px 自适应 | Home.report §3 | 待回写 |
| 10 | §13.8/§4 侧栏描述与实现完全吻合（无需勘误，正面结论） | Sidebar.report §3 | — |
| 11 | 侧面板快捷键 **Ctrl+Alt+B** 规格未记载，建议补 | SidePanel.report §7 | 待回写 |

### d.2 对 MODULE-MAP.md

| # | 勘误 | 出处 | 状态 |
|---|---|---|---|
| 1 | F12 备注「nge=用量数据 hook js 23920」误认 → **useGitRepository**（Git 审查族数据层）；23920–24014 改记 Git 状态层（双归属 F04/F13 数据面） | GitReview.report §4 | **已回写**（F12 副根行删除线+注） |
| 2 | F04 BWt 行「178920」为下一顶层声明行，函数体实止于 **178919** | GitReview.report §4 | 待回写 |
| 3 | TopBar.tsx GitBranchChipProps.popoverSide 缺 **"left"**（mlt 98437/Ict 97169 实传） | GitReview.report §4 | 待回写（TopBar.tsx 接口） |
| 4 | §2.4「小件原语 36949–36991 = hC Separator/gC Badge」→ 实为 **Tabs 原语族**（data-slot=tabs*） | SidePanel.report §7 / Settings.report §7 | 待回写 |
| 5 | F04 状态层行号 2816–3550 → **1978–3549**（漏标签工厂 2015–2158/转换 2159–2575/缓存 2577–2637） | SidePanel.report §0/§7 | 待回写（SidePanel.tsx 已按完整范围抽取） |
| 6 | 「审查」无独立 tab 型：**审查 = git 标签**（固定 id `git`，标题 sidePane.review）；空态四宫格为条件四项（有激活任务桌面态），开发者工具开启时五项 | SidePanel.report §2/§7 | 待回写 |
| 7 | Sqt…Aqt（183259–183363）语义属 **F13**（终端 dock），F04 区间内双归属改记 | SidePanel.report §7 / TermBrowser.report §7 | 待回写 |
| 8 | F13 行尾包络 178297–178583（TWt–LWt git diff 助手）语义属 **F04 BWt**，改记双归属；Fqt/Iqt dock 控制器被 F07 消费，双归属 | TermBrowser.report §7 | 待回写 |
| 9 | xterm 版本标记 **3.7.8**（162010），与 orca patched 6.1.0-beta 不同源；OHt（OSC52 剪贴板 addon）为应用级，建议自 X14 剥离登记 | TermBrowser.report §7 | 待回写 |
| 10 | §2.6 hT「权限状态机」→ 按实现更正为**会话遥测/归因监督器**（permission.lifecycle 仅其中一支） | Stores.report §2.1 / services.tsx 头注 | 报告已更正；地图 §2.6 正文待同步 |
| 11 | F02 备注「建议卡文案数据 Dqe 63845」误认 → Dqe=9 官方插件名 Set + kqe 技能文案，消费方为提及面板 $ 技能段（ZB→Uqe） | Home.report §3.6 | 待回写 |
| 12 | §3 imeComposition 导入表（推测版）实测更正：`l`=buildPptxElementReference、`m`=extractPptxElementReferences、`P`=react-dom/client 模块、`A`=PlatformProvider、`a`=PopoverTrigger、`M`=usePlatform、`t`=isComposingText | ChartUtilsIme.report §3.2 | 待回写 |
| 13 | F19 消费面补记：用量分区三 lazy（Q$t/$$t/i1t）↔ 已恢复图表模块对应（deps 321/326/327） | SettingsPanels.report §7 | 待回写 |
| 14 | ExtendedViews 衔接修正：Settings.tsx 内 AutomationsMain.onOpenSession 签名应为对象参数 `{sessionId, workspacePath, workspaceIdentity?}` | ExtendedViews.report §7 | 待回写（下轮同步） |

### d.3 对 VENDOR-MANIFEST / 其它清单

| # | 勘误 | 出处 | 状态 |
|---|---|---|---|
| 1 | chunk-tiers.json 4 条 tier 纠正：c4Diagram/chunk-U2HBQHQK/journeyDiagram/sequenceDiagram 误归 grammar_data → mermaid 图形 chunk | VENDOR-MANIFEST-LIBS 附注 / GRAMMARS Excluded | **已回写**（两清单正文） |
| 2 | chart-iT2j9K3u：ChartTooltipContent 导出别名 `n` → 实为 **`a`**；`n` 是 ChartLegend（Legend 再导出） | ChartUtilsIme.report §1.2 | **已回写**（LIBS 清单 chart 行） |
| 3 | chartVendor.report §2 WT「ChartTooltip」→ 精确名 **ChartTooltipContent** | ChartUtilsIme.report §1.2 | 待回写（chartVendor 报告自身） |
| 4 | imeComposition 的 radix 原语（focus-scope/focus-guards/remove-scroll/aria-hidden/popover 全栈）**内联在本 chunk**，非仅 dist-* chunks | ChartUtilsIme.report §3.1 | **已回写**（LIBS 清单 imeComposition 行） |
| 5 | highlighted-body tier 由 first-party 修正为 **streamdown vendor** | highlightedCodeBlockBody.report / PreviewMisc.report §4 | **已回写** |
| 6 | 「Lexical/Stripe/shiki 混合 mega-chunk」限定于 **styles-CdEGpc2x.js**；chunk-BO2N2NFS 定性 = **streamdown@2.5.0**（不含三者） | Markdown.report §0 | **已回写**（LIBS 附注）；任务描述勘误存档于此 |
| 7 | react-xlsx 为**私有引擎**（非 npm 公开同名库 0.4.10），建议 LIBS 补登记条目（5 处自称标记 + 子段表） | XlsxPreview.report §8 | 待回写 |
| 8 | 词典计数 4,515/4,519（intlProvider.report §1）→ 实测 **4,503/4,503**（与 I18n.report §3 一致；D9 以原始 chunk 行 49–4563/4566–9084 重数核验） | D9 复核 | 本账记录（intlProvider.report 为前序口径） |
| 9 | katex 版本存疑：原 monorepo 0.16.25 vs 参照安装 0.16.45（chunk 内无版本串） | VENDOR-MANIFEST-LIBS 附注 | 已注记 |
| 10 | WorkspaceActionError（j6t.y）在 3.7.6 为**置位但无呈现的死状态**；重建时建议自接 N9 AlertDialog 或 toast | Modals.report §5 | 本账记录 |

---

## e) 记账备注

1. 「逐字重建」按**源码行覆盖**计，非重建文件行数（重建含类型/注释/JSX 展开，行数不与源码 1:1）。
2. 双归属重叠 12,651 行（MODULE-MAP §4 约定）不重复计：如 E6/k6 同属 F01 与 store 层、VO DropdownMenu 同属 F19 与 X03、Sqt…Aqt 同属 F04 区间与 F13 语义。
3. 已抽取族互引不重复计行（TopBar↔Sidebar↔Modals↔GitReview 的 j6/oFt/C6/n4/r4/COt/mlt 系等）。
4. 「接口级」项全部带行号锚点，可按 B4 批次同法展开（方法 = TopBar 试点：jsx 阅读 + js 复核 + 闭包追踪三终点）。
5. **i18n 去重（D9）**：I18n.tsx = canonical；intlProvider.tsx 文件头已加 `// DUPLICATE-OF: I18n.tsx`（不删文件）；
   本账 §b 的 IntlProvider 行以 canonical 计，词典数字以 4,503×2 为准（见 §d.3 第 8 条）。

---

## f) B4 批次完成台账（2026-08-26 重算）

> §c 队列的多数项已随 B4 五批落地。本节登记产物清单、验证状态、边界裁决、legacy-doc 引擎区三态重算与新覆盖率数字。
> 行号口径同 §a；`out/` 全程只读（批后复验 md5 `c9d0d675d0b858e6e7711df3e9122e81`、styles 213,695 行、legacy-doc chunk 47,538 行均不变）。

### f.1 五批产物清单与验证状态

| 批次 | 产物（重建行数） | 报告 | 覆盖 | 验证 |
|---|---|---|---|---|
| B4-a 侧栏/会话叶子 | SidebarLeaves.tsx（4,271）+ ConversationLeaves.tsx（4,193） | Leaves.report.md | F01 六项★叶子（VFt/uzt/mRt/ABt 光束族/lLt/mLt + 合成助手族）；F03 15 工具视图 + 预览卡/自动化卡/captcha 全链/滚动助手 14 个/交互 toast | esbuild 双件 0 错；tsc strict 双件 0 错 |
| B4-b F12 用量深层 | UsageDeep.tsx（6,353） | UsageDeep.report.md | B4-1 #2 第一符号组：u7 卡群深叶 187188–191288 + q$t/J$t 用量数据层 + $j 权益数据层 + 计费折扣簇 + 配额助手/侧栏计划件（共 5,317 源码行） | esbuild 0 错；tsc strict 0 错；i18n 80/80 静态 key 脚本比对 0 差；锚点 8/8 命中 |
| B4-c legacy-doc 引擎批 A | LegacyDocEngine1.tsx（1,237）/2.tsx（1,207）/3.tsx（1,466）/4.tsx（2,169） | LegacyDocEngine.report.md | [E1] BiDi+断词、[E2] 测量/断行、[E3] 脚本解析+段落 XML 编辑、[E4] 编辑指令/分页/布局服务（jsx 10303–14903，4,601 行，≈347 符号） | esbuild 0 错；tsc 5 文件联编 0 错；行为冒烟（BiDi 级别/断词/断行/XML 扫描/编辑指令/分页拟合）全过 |
| B4-d legacy-doc 引擎批 B | LegacyDocEngineBThumbnails.ts（337）/BModel.ts（2,694）/BLayout.tsx（1,942）/BEditorState.tsx（2,453）/BPageRegistry.tsx（890）/BPageRenderer.tsx（934） | LegacyDocEngineB.report.md | [E5] 缩略图常量 + [E6]a/b/d/e 模型/布局/状态机 tS/页注册表 + [E7] 页面渲染器 ES 骨架（jsx 14902–36416） | esbuild 6/6；tsc 6 文件 0 错；tS 100 成员返回面逐一对照；分页仲裁链/缩略图消费链交叉核验 |
| B4-e 设置/模态/杂项叶子 | SettingsLeaves.tsx（6,663）+ ModalsLeaves.tsx（1,614）+ StoresDeep.tsx（3,358） | SettingsModalsStoresLeaves.report.md | F06 子代理/插件分区 + F15 自动化编辑器（kNt/YMt/cron 域）+ F14 El/gut + F09 文件路径件 + F18 hero 三件 + 横切 store 深层助手 + 遥测下沉 29 函数（40397–41807） | esbuild 三件 0 错；tsc strict 0 错（首轮 72 错逐项按原文修正归零）；out/ md5 批复验一致 |

合计：**16 件产物，41,781 重建行**；五批报告齐备（5 份：Leaves / UsageDeep / LegacyDocEngine / LegacyDocEngineB / SettingsModalsStoresLeaves）。

### f.2 边界裁决记录（并行五批互裁）

| # | 事项 | 裁决 | 依据 |
|---|---|---|---|
| 1 | `q$t/J$t`（+`K$t`）用量数据钩：StoresDeep §G 曾实体化，与 B4-b UsageDeep.tsx（锚点 js 195179/195206 命中）重叠 | **让位**：StoresDeep §G 改为边界注记，UsageDeep.tsx 为唯一规范实现；SettingsPanelsData 对应 declare 整合期改指向 UsageDeep | MODULE-MAP F12 归属；任务条件「若未被 F12 批覆盖则你做」 |
| 2 | `R7` useExternalAgentImportState / `v$t` 选择面板 / `I2t` useClaudeMigration（Modals.report 接口级） | **不重复抽取**：已由 SettingsPanels.tsx 3153/3953 + SettingsPanelsData.tsx 844 全量抽取 | F06 族既有产物优先 |
| 3 | `W8` DiffViewer(memo) | **不重复抽取**：CodeViewer.tsx 1124 已实现 | F14 族既有产物 |
| 4 | `Eit` isTakeNumberFailure（quota_3103） | StoresDeep.tsx 为 **canonical**（store 层登记位）；ExtendedViews 5739 局部同义件整合期可改引用 | Stores.report §4 |
| 5 | `El/gut/Bc`（F14 族符号）由 B4-e 抽取 | 按任务清单直接指派；族归属仍记 F14，整合期并入 CodeViewer 族不产生冲突（无并行批认领） | 任务清单优先 |
| 6 | cron 域 109250–109510 行号落在 F03 段（双归属） | 按消费面归 **F15**（kNt/YMt 直接消费）；与会话批零重叠 | 消费面归属 |
| 7 | 并行批行号交集 | Sidebar/Conversation/legacy-doc/Settings-Modals-Stores 各批**零行号交集**，无需裁决；第 1/5/6 条为预防性记录 | 各报告 §3 |
| 8 | legacy-doc 批 A/B 分段 | [E1]–[E4]（批 A）与 [E5]–[E7]（批 B）按 jsx 锚点互斥；公共层 10 项手工登记（§21）不重复计；20231–20943 隙段（C_/w_ 风格解析起）两批均未覆盖，维持接口级 | 两报告 §6.1/§2 |

### f.3 legacy-doc 引擎区三态重算（jsx 10303–36416 = 26,114 行）

| 段 | jsx 行 | 行数 | 批 A | 批 B | 三态归属 |
|---|---|---:|---|---|---|
| [E1] BiDi+断词 | 10303–11176 | 874 | ✓ 全量逐字 | — | 逐字 |
| [E2] 测量/断行 | 11177–11846 | 670 | ✓ 全量逐字 | — | 逐字 |
| （公共层已重建段） | 11847–12249 | 403 | （B2 公共层） | — | 逐字（不计入本两批） |
| [E3] 脚本解析+段落 XML 编辑 | 12250–13243 | 994 | ✓ 全量逐字 | — | 逐字 |
| [E4] 编辑指令/分页/布局服务 | 13244–14903 | 1,660 | ✓ 全量逐字 | — | 逐字 |
| [E5] 缩略图常量层 | 14902–15113 | 212 | — | ✓ 全量逐句 | 逐字 |
| [E6]a 模型与节点助手 | 15114–16815 | 1,702 | — | ✓ 全量语义重建 | 逐字 |
| [E6]b 行布局与分页 | 16816–20230 | 3,415 | — | 逐句 ~230/270 符号；测量原语族 18106–19189 + 分页主循环内层 Mg 19230–19541 登记 | 逐字 ~2,019 / 接口级 ~1,396 |
| 隙段（C_/w_ 风格解析起） | 20231–20943 | 713 | — | 未覆盖 | 接口级 |
| [E6]c 渲染助手与编辑器 reducer | 20944–24337 | 3,394 | — | 锚点登记（195 符号，declare 契约对接） | 接口级 |
| [E6]d 编辑器状态机 tS | 24338–26660 | 2,323 | — | ✓ 全量语义重建（3 超长命令体语义归纳） | 逐字 |
| [E6]e 页注册表 + 节段渲染器 | 26661–27339 | 679 | — | ✓ 全量语义重建 | 逐字 |
| [E7] 页面渲染器 ES | 27340–36416 | 9,077 | — | props/状态骨架/分页链/最终 JSX 全量；**交互回调簇 ~6,300 行锚点登记** | 逐字 ~2,777 / 接口级 ~6,300 |

> 段界注：E4 尾界 14902–14903（Xs 缩略图排除标记）按批 A 登记归 [E4]，批 B [E5] 自 14902 起含同 2 行——两批合计较 26,114 多出该 2 行重叠，不另行扣除（≈0.01%）。

**引擎区三态汇总**：
- 逐字/全量重建 ≈ **13,910 行（53.3%）**（批 A 4,198 + 批 B 9,712；另公共层已重建段 403 行，占 1.5%）
- 接口级（锚点登记）≈ **11,803 行（45.2%）**（[E6]b 登记 1,396 + 隙段 713 + [E6]c 3,394 + [E7] 交互回调簇 6,300）
- vendored = **0**（引擎区无第三方库体）
- 后续展开建议：[E6]c 195 符号按 declare 契约逐式补全（首批缺口）→ [E7] 交互回调簇（测量回灌→fs 节点渲染器→键盘→指针）→ 测量原语族 + Mg 分页内层。

### f.4 新覆盖率数字（first-party 逐字占比）

| 口径 | B4 前 | B4 后 |
|---|---|---|
| styles 213,695 行 · 逐字（占整 chunk） | ~95,000–100,000（45–47%） | **~118,400–123,400（55–58%，中值 56.6%）** |
| styles · 逐字占 first-party 归属行（逐字+接口级 ≈139,100） | ~70% | **~87%** |
| styles · 接口级 | ~41,000–42,000（19%） | **~17,600–18,600（8–9%）** |
| styles · vendored/横切 | 62,262（29.14%） | 62,262（29.14%，不变） |
| legacy-doc 引擎区 26,114 行 · 逐字/全量 | ~0（全部接口级登记） | **13,910（53.3%）** |
| first-party 逐字总量（两大块） | ~95,000–100,000 | **≈ 134,900+ 行**（styles ~121,000 + legacy-doc 引擎 13,910；其余独立 chunk 按 §b 状态不变，未重复计） |

**剩余接口级总清单**：styles 侧 17 段（见 §a 汇总表，去重后 ~18,100 行）+ legacy-doc 引擎区 4 段（~11,800 行）+ 未重建 first-party chunk ×4（skillStore/src/usageStatsUiParts/process-monitor）。

---

## g) B5 全量解码完成台账（2026-08-29）

> B4 剩余接口级清单（§a 17 段 + 引擎区 4 段 + 未重建 chunk ×4）经 B5 十七批次全量逐字解码。
> 体例：逐字重建（类名/常量/分支零改动；顶层符号语义名+映射表，局部名保留原混淆名，逆映射可回代）。
> 门禁：每批 esbuild 0 错 + tsc strict 0 错 + ≥8 锚点回代逐字命中 + 报告；全部经独立复核。
> **基数刷新**：styles-CdEGpc2x.js 213,695 → **213,979 行**（D5b 删除/桩化净位移；分段偏移映射见 B5-MERGE-NOTES §1）。
> `out/` 全程只读：styles `48d71d48…`、src-HCld2afU `f5edd6a1…`、legacy-doc `cfa43c9f…`、xlsx `41932140…`、YE7GQOST `bbd574fd…`、AEHDFCS5 `c200d53a…` 批前批后一致。

### g.1 批次产物总表（36 件 .tsx/.ts，~122,300 重建行；报告 23 份另计）

| 批次 | 产物（重建行数） | 覆盖对象 |
|---|---|---|
| B5-01 | Composer.tsx（9,321） | §a #1 F08 Composer 族全量（351 符号） |
| B5-02 | OnboardingLoginLeaves.tsx（5,379）+ AppRootLeaves.tsx（2,726） | §a #2 F18 余量 + #6 F20 应用根 |
| B5-03 | FeedbackCenter.tsx（4,334） | §a #3 反馈中心（真实起点今 37093；85 个 feedback.* 键） |
| B5-04 | PaymentDeep.tsx（12,066）+ Bots.tsx（2,209） | §a #4 支付深部第二符号组 + #8 F11 Bots 族 |
| B5-05 | WebRemote.tsx（2,063）+ RemoteWizard.tsx（1,637） | §a #5 F17 WebRemote + #10 远程向导 |
| B5-06 | PreviewCards.tsx（2,385）+ FileTreePanel.tsx（2,718）+ FileRewindDialogDeep.tsx（950） | §a #7 预览卡群 + #9 $It 文件树 + #14 rewind 深部 |
| B5-07 | QuickPickDeep.tsx（1,697）+ CmdkPaletteDeep.tsx（1,804）+ McpHelpers.tsx（529） | §a #11 ZS 深部 + #12 zZ cmdk 深部 + #13 MCP 助手群（实测 193351–193633/203426–203439） |
| B5-08 | LegacyDocEngineC1.tsx（3,799）+ C2.tsx（4,794） | 引擎区 jsx 18106–19541 ∪ 20231–20943 ∪ 20944–24337（[E6]c 195 符号全量实体化） |
| B5-09 | LegacyDocEngineC3.tsx（5,317）+ C4.tsx（4,110） | 引擎区 [E7] 交互回调簇 jsx 27889–35407（C4 回代 99.97% 逐字） |
| B5-10a/b | SrcSharedA.tsx（6,358，567 符号）+ SrcSharedB.tsx（7,009，769 符号） | src-HCld2afU 全量（AST 1,336 声明 1:1 对齐；§2–§8 为捆绑 zod v4.3.6） |
| B5-11 | SkillStore.tsx（4,569）+ UsageStatsUiParts.tsx（1,374）+ ProcessMonitor.tsx（310） | 三个未重建 first-party chunk 全量 |
| B5-12a | XlsxDeepA.tsx（8,178） | xlsx Ru 控制器域（15672+） |
| B5-12b | XlsxDeepB.tsx（6,530）+ OfficeWiring.tsx（1,662） | xlsx canvas/工具条域 + office 接线（CartesianChart = 纯 recharts 3.8.0 vendor，免产出） |
| B5-12c | XlsxDeepC.tsx（5,133，297 符号） | xlsx 189512–193216（常量/剪贴板/上下文/工具条 UI/行渲染层；逆映射逐字节一致） |
| B5-12d | XlsxDeepP.tsx（7,292，440 符号/87 导出）+ XlsxDeepT.tsx（331） | xlsx 9111–15671 前导段（裁决 FIRST-PARTY react-xlsx 私有引擎）+ 199292–199508 入口层 |
| B5-13 | I18nDynamicKeys.report.md | i18n 动态键全域核销（74/109 消费；35 孤儿键；postUpdateReleaseNotes/forceUpdate 证伪） |
| B5-14 | LegacyDocEngineC5.tsx（364）+ DocxWasmGlue.tsx（953）+ RemoteGapSegments.tsx（1,435） | [E6]b 余带 + chunk-YE7GQOST/src-AEHDFCS5（deepCloneModel/newBlockId 实体化）+ F10 两隙段（123522–123945/127350–127942） |
| B5-15 | RemoteDirectorySuggestInput.tsx（233） | NEt/PEt/W2 微段（今 124144–124259；W2 = ssh 连接建议输入，逆映射 116/116 一致） |
| B5-15b | LazyPreviewViewers.ts（93）+ 2×.d.ts 垫片 | lVt/dVt 两个 React.lazy 包装（今 160672–160695；逆映射 15/15 一致；styles 接口级 declare 残留清零） |
| B5-16 | PptxGeometryMultiRegion.ts（1,501） | pptx DEFERRED_MULTI_REGION_ANCHORS：实测 38 多区域条目全转录 + 弯箭头四 V 构建器 + ki/Ai/Pi/Mi/Ni（锚点 98；运行时冒烟 38/38） |
| B5-17 | PptxGeometryDeferredPresets.ts（1,170） | pptx DEFERRED_PRESET_GEOMETRY_ANCHORS：38 单区域复杂预设转录 + 1 项已覆盖跳过（逆映射 212/212 抽查一致） |

### g.2 三态重算（B5 后）

| 口径 | B4 后 | B5 后 |
|---|---|---|
| styles 213,979 行 · 逐字重建 | ~118,400–123,400（55–58%） | **~136,000+（≈64%；§a 17 段中 16 段转逐字）** |
| styles · 接口级 | ~17,600–18,600（8–9%） | **~210（仅 resizable-panels vendored 变体，依赖替换策略豁免）——first-party 接口级清零** |
| styles · vendored/横切 | 62,262（29.14%） | 不变（策略：npm 整体替换） |
| legacy-doc 引擎区 26,114 行 · 逐字 | 13,910（53.3%） | **≈26,114（100%；接口级四段全部实体化：18106–19541/20231–20943/20944–24337 归 C1/C2，27889–35407 归 C3/C4，[E6]b 余带归 C5）** |
| xlsx chunk 199,508 行 | 自研 94 行 + 桥 134 行（登记口径） | **first-party 9111–199508 逐字全覆盖（XlsxDeepA/B/C/P/T + OfficeWiring + 既有 XlsxPreview 族）；1–9110 = d3/topojson/regl vendored** |
| 未重建 first-party chunk | 4 | **0**（skillStore/src/usageStatsUiParts/process-monitor 全量落定） |
| docx wasm glue 两微 chunk | declare 挂接 | **逐字全覆盖**（DocxWasmGlue.tsx，453 行原件 → 953 行重建） |

### g.3 B5 后剩余事项（全部非「未解码」性质）

1. **vendored 依赖替换候选**（A0.1 执行）：zod v4.3.6（SrcSharedA §2–§8 内联）、recharts 3.8.0（CartesianChart）、Lexical（styles 57652–63592）、Stripe 6.4.0/9.6.0（80955–81731）、qrcode（78456–79690）、resizable-panels（131439–131820）、shiki/xterm/dnd-kit/framer-motion/mermaid 等（VENDOR-MANIFEST 在案）。
2. **declare 替换总账**（整合期执行，清单在 B5-MERGE-NOTES §4 与各批报告）：xlsx 12a 94 + 12b 146 + 12c 6 → XlsxDeepC/P 导出；SkillStore 8 → SrcSharedA/B；C4 316 项 → 属主模块；SrcSharedB 90 ambient → SrcSharedA；RemoteWizard 234–363 → RemoteGapSegments；C3/C4 六 declare → C5；C2 301/303 → DocxWasmGlue；Modals 补导出 `$2`、SrcSharedA 补导出 `DEFAULT_ASSET_INSTALL_MODE`。
3. **双归属裁决遗留**（整合期改 import）：14341–14474（XlsxDeepP vs XlsxPreviewWasmBridge）、199415–199508（XlsxDeepT vs XlsxPreview）、Bots 尾段 149473–149599、PaymentDeep 版 76848–77167、批 B qg…e_/m_/p_ 副本。
4. **i18n 孤儿键 35 个**（阶段 C 清理候选，B5-13 §5）。
5. **全部解码批次已落地**（B5-15/15b/16/17 于 2026-08-29 凌晨验收）；仅余 SYMBOL-INDEX B5 增量登记进行中。整合期清单见 B5-MERGE-NOTES §4（declare 替换/双归属改指/登记表删除）。
