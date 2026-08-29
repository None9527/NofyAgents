# A0 进度账（前端源码化 · PORTING-PLAN §5）

滚动更新。基准事实：`src-reconstructed/` 与 `out/` 为只读真值（md5 见下）；`src/modules/` 为可编辑工程副本。

## 关键 md5 基线（out/，任何批次不得改动）

| 文件 | md5 |
|---|---|
| src-HCld2afU.js | f5edd6a1207c6d20008204829dad3923 |
| styles-CdEGpc2x.js | 48d71d4874b0868d61fd35a328bf6ad5 |
| legacy-doc chunk | cfa43c9f7be31ca608214e29ea1419ea |
| xlsx chunk | 4193214026dc469cb45056f49795e25e |
| chunk-YE7GQOST | bbd574fd826831cd3e03798ae32e3196 |
| src-AEHDFCS5 | c200d53acfca1db99e9c649f0f4a971c |
| pptxRendererPreviewEngine | 02b3288447a609a826511301b9ec9bfc |
| pptx-preview-viewer | 4919b990fe658fc65b52523cdff4692a |

## 管线（a0-wiring-data/scripts/，自包含，从仓库根运行）

1. `extract-declares.py` — v3 提取器：`declare const|function|var|let|class|enum` 语句范围；尖括号+花括号双深度；kind 感知终止（class/enum 可 `}` 收尾，其余必须 `;`）；跳过 `declare global/module/namespace`；自带逐文件计数校验与吞并检测。
2. `export-map.py` — 从 `src/modules` 真实 `export` 语句（含多行 `export {…}` 块）建 名→文件 映射。
3. `join-wiring.py` + `join-fallback.py` — declare × 导出映射 × SYMBOL-INDEX 三级联接；产出 status：UNIQUE / UNIQUE_ADDEXPORT / AMBIGUOUS / UNRESOLVED（`—` 属主已剔除）。
4. `autowire.py` — 机械接线：删 declare 插 `import { … } from './Owner'`（多行 import 收尾感知）+ 属主补 `export`。支持 `--apply` 与 `ONLY_FILES=a.tsx,b.tsx` 过滤；BUSY 集排除在编批次文件；LANE4_NAMES/DEFER_S2A_NAMES 排除。
5. `fuzzy-candidates.py` — UNRESOLVED 名的候选属主（CI_EXACT/SUBSTR/TOKEN 三级）。

数据快照：`a0-wiring-data/*.tsv|json`（行号会随编辑漂移，按名字复核）。

## Lane 划分

- **Lane 1（自动）**：UNIQUE/UNIQUE_ADDEXPORT → autowire。已落地 789 wires + 34 属主补导出（45 文件），drift 审计 0、语法错 0。
- **Lane 2（裁决）**：AMBIGUOUS（~86）→ 域批用 bundle 锚点裁决。
- **Lane 3（同义/寻主）**：UNRESOLVED（~3,377；1,987 有模糊候选）→ 域批人工核。
- **Lane 4（vendored→npm，S3 前保留 declare）**：lucide 图标 286 名、shadcn/radix 原语 109 名、lexical 28 名、useVirtualizer、qrcode、Stripe Elements 组件。分类快照：/tmp/a0-lane4-classify.json（待入库）。
- **已知未决名**（SYMBOL-INDEX 误归属，勿再按索引接线）：useTaskListItems / applyOptimisticTaskMutation / buildTaskFeedbackDescription / sshDecoratedProjectName（索引记 TopBar，实为使用方）；useHeroTextSizes / useModelProviders / TooltipRoot / useControllableState / Slot / SearchResultsStore（styles chunk 未重建区）。

## S3 npm 可达性（2026-08-29 核验）

| vendored | npm 目标 | 状态 |
|---|---|---|
| zod（SrcSharedA §2–§8 ~3,260 行） | zod@4.3.6 | ✓ 精确版本 |
| recharts（CartesianChart） | recharts@3.8.0 | ✓ 精确版本 |
| Lexical（styles 57652–63592） | lexical/@lexical/react@**0.42.0**（S3-d bundle 指纹双锚 styles 60548/62523 `0.42.0+prod.esm` + 125 错误码 ⊆ 0.42.0 族并集；0.49.0 仅为 npm 可达性） | ✓ S3-d 落地 |
| resizable-panels（131439–131820） | react-resizable-panels（latest 4.12.3） | ✓ 可达；同上需锚定版本 |
| qrcode（78456–79690） | qrcode@1.5.4 | ✓ |
| useVirtualizer | @tanstack/react-virtual@3.14.10 | ✓ |
| 图标（286 名） | lucide-react@1.35.0（自定义 Icon* 除外，属 first-party） | ✓ |
| shadcn/radix 原语（109 名） | @radix-ui/*（dialog 1.1.23 等）+ 自建 shadcn 层 | ✓ |
| Stripe（80955–81731，6.4.0/9.6.0 双版本） | @stripe/stripe-js@9.6.0 + @stripe/react-stripe-js@6.4.0 | ✓ S3-a 落地（版本= bundle 自标记） |
| xterm（旧记 3.7.8 实为 js-base64 标记） | @xterm/xterm@5.5.0 + @xterm/addon-fit@0.10.0（bundle 指纹：rescaleOverlappingGlyphs/allowRescaling/isEmoji 5.5 独有；blink_box_shadow_ 5.4 独有缺失） | ✓ S3-a 裁决落地 |

## S3 清点（pass 4 后实测）
- 剩余 declare：2,502 条语句 / **1,822 个唯一名**。
- Lane-4 vendored 现存：lucide **285**/286、radix/shadcn **104**/109、lexical **20**/28（余者已被波次消耗）。
- first-party 未重建深部：2,427 名中 **1,395** 仍 declared（1,032 已被波次接线消耗）；另有 122 名为波次新增登记。
- 完整性 manifest：a0-wiring-data/ground-truth-md5.manifest（187 件）、a0-wiring-data/out-md5.manifest（2,183 件）。
- S3 子批（全部完工验证）：S3-a = zod/qrcode/virtualizer/Stripe/xterm（resizable-panels 整件推迟）；S3-b = lucide 429/491；S3-c = radix/shadcn 348（components/ui 12 件）；S3-d = lexical 0.42.0（19/20，全在 Composer）。**合计 22 库落地、1 件推迟（react-resizable-panels 待 X4/Z4/Q4 包装重建）**。

## 批次台账

| 批次 | 域 | 状态 | 结果 |
|---|---|---|---|
| S2-a | 13 接缝文件脱 out/ | **完工已验证** | 13/13 改接（react-dom/client、./I18n、SrcSharedA/B、recharts npm+深路径、radix/clsx/tailwind-merge/reselect/tiny-invariant）；新增 lib/{preloadHelper,recharts-deep.d,rechartsChunkInternals}；button.tsx 双轨导出 9 语义名；A/B 净 −320；遗留 rendererEntry 的 styles 44 符号导入（未重建区）；报告 A0-S2a.report.md |
| S2-b | xlsx declare 接线 | **完工已验证** | 270 declares→import（A 94/B 151/C 6/T 15/Preview 4）+ 使用点改名 1,301 处 + d.ts 垫片 duke_sheets_wasm；域错 3→0；报告 A0-S2b.report.md |
| S2-c | legacy-doc 接线 | **完工已验证** | ≈330 接线/17 文件（C4 255 含 937 使用点改名；C3 85；C2 5 含 deepCloneModel←cloneDocModel/newBlockId←allocateBlockId；C1 11；BModel 17；Engine3/4 3+3；previewPane 3）+ 7 组 C5 正典消费侧切换 + 补导出 2；批次 tsc 0；域错 0；项目净 −21（→773）；out/ md5 复验一致（含 legacy-doc 块 cfa4…）；报告 A0-S2c.report.md |
| S2-e | pptx office 接线 | **完工已验证** | 2 副作用 import；删 2 DEFERRED 表+FALLBACK_RECT；buildMultiRegionPaths 改忠实包装；域内 0 错；报告 A0-S2e.report.md |
| D-Settings | Settings 族 5 文件 | **完工已验证** | 101 接线（含 32 TESTID_*→SrcSharedB 逐条核验）+ 修破损 logger import 5；错 315→272（SettingsLeaves 25→2）；保留 395（Lane-4 ~190 + 14 组属主未导出 + 5 组接线会增错附因保留）；需要的 export 14 项；报告 A0-D-Settings.report.md |
| D-Viewers | CodeViewer 族 8 文件 | **完工已验证** | 56 接线 + 域内补导出 20 + 退回误接 5 + 修坏 import 4；错 159→1（GitReview popoverSide 待 TopBar 域）；纠正前批单字母碰撞误接（TS2693×26）；需要的 export 7 项；报告 A0-D-Viewers.report.md |
| S2-d | SrcSharedA/B ambient、SkillStore、Remote 改指、补导出、双归属去重 | **完工已验证** | 152 接线（SrcSharedB 91 ambient 全接）+ 去重删 ≈520 行（Bots 204/PaymentDeep 292/popover 族，均留 tombstone）+ SrcSharedA 新导出块 40 符号（含 DEFAULT_ASSET_INSTALL_MODE）+ Modals $2 再导出；域错 76→66 零新增；diff +364/−923；报告 A0-S2d.report.md |
| D-Shell | WorkspaceShell/Sidebar 族 7 文件 | **完工已验证** | 11 组接线 + 域内补导出 8 + 回退前批误接 3；错 342→286（逐文件不增）；需要的 export 16 项；报告 A0-D-Shell.report.md |
| D-Services | services/stores-*/StoresDeep/AppRootLeaves | **完工已验证** | 35 接线 + 6 logger 改接 + 4 组类型收敛；**域错 135→0 全清零**；workspaceKey 属主落实 = SkillStore.resolveWorkspaceKey（bundle b/H）；保留 114 逐条登记；需要的 export 9 项 + 未重建属主一批；报告 A0-D-Services.report.md |
| D-Conversation | Conversation 族 + Composer/Modals（6 文件，518 declares，75 错） | **完工已验证** | 56 接线（值 30+型 26）+ 4 处 useWorkspaceServices()→useServices()（bundle fs 5 锚点）；**域错 75→0 全清零**；保留 495（Lane-4 lexical/Icon*/radix 原语 + 域外未导出）；共享类型收敛到 ConversationLeaves（+5 type export）；外溢核验消费方计数全部不变；需要的 export 13 项；报告 A0-D-Conversation.report.md |
| D-Misc | Bots/QuickPick/Cmdk/Usage/Onboarding 等（13 文件，489 declares，139 错） | **完工已验证** | 62 接线 + 域内补 export 2（UsageDeep.formatGrantUnits、RDSI.SuggestionInput）；**域错 139→0 全清零**；保留 451（Lane-4/未重建属主/域外未导出）；AMBIGUOUS 裁决 6（workspaceScopeKey→resolveWorkspaceKey 等）；回滚前波误接 5；需要的 export 17 项；报告 A0-D-Misc.report.md |
| 收尾接线 pass 1 | 工作清单 A 段 + B 段非★项（27 文件） | **完工已验证** | Button 22 文件/buttonVariants/createLucideIcon 8 文件/9 图标接线；Tooltip→InfoTooltip 8 文件；workspaceKey→resolveWorkspaceKey（SettingsLeaves 变体→automationsWorkspaceKey@SrcSharedB）；B 段 1–9/21/22/24–28/30/32 落地，23/29/31 部分/33/34 附因跳过；发现 ButtonProps Record<string,unknown> 失上下文型（26 TS7006+5 TS2322）以最小注解修复；项目 582→538 逐文件零回退；报告 A0-CLEANUP1.report.md |

| 收尾接线 pass 2 | 工作清单 ★项（10–20/35/42）+ 45/46/47/50（21 文件） | **完工已验证** | 29 新 export（值 16+型 13）+ 14 消费接线；15 declare + 6 镜像类型删除；GitSummary 镜像并归 TopBar 属主（item 17 经 46 消解）；SessionIndexState.sessions→Map<string,SessionIndexRow> 去 5/6 双重断言；bundle 实证修正 2 处（GitReview GXe@68833 附件层级、Composer HoverCard J4e@76086 非 Tooltip）；项目 538→528 零回退；报告 A0-CLEANUP2.report.md |
| 收尾接线 pass 3 | 3a 机械项（36–41/43/44）+ 3b BaseServices 服务类型化（~250 unknown-族）+ 3c 横切属主定位（48/49） | **完工已验证** | **项目 528→44（−91.7%）零回退、零新增抑制**；3b 杠杆 = stores-core ResolvedBaseServices（BaseServices & Pick<Required<…>> 23 字段收窄）经 useServices/useBaseServices/useWorkspaceServices 贯通；服务字段型从真实属主（SkillsService/PluginService/CommandsService/SubagentsService/AutomationsAgentService/OffPeakTaskService/SettingService/SystemService/MemoryService），未重建属主以带注 callable 兜底；10 文件清零（SPC 168→0/EV 74→0/Settings 52→0/SP 44→0 等）；#49 useSettingsSelector 属主定位 = stores-core useSettingsStoreValue（styles js 1301，非工作清单所记 src 块）；#48 横切工具身份层确认未重建（declare 保留）；报告 A0-CLEANUP3.report.md |

| 收尾接线 pass 4 | 残余 44 错终局收敛（11 文件） | **完工已验证** | **44→2（−42）零回退、零新增抑制**；SidePanel SessionHandle 整形（js 40347/k0 118692）+ BaseServices += terminalService；FileLinkModel 族 11 处中段签名统一并删 3 处 pass-3 投射；PaymentDeep onCloseAutoFocus/?? null 重复/nWe 标签链转录（resolveModelTriggerLabelParts）；TopBar 双 GitSummary 镜像删除改 GitReview 再导出 + TaskMeta += workspacePath（e_e 24501 族）；SrcSharedB 伪 declare global process 删除（真源 = 父目录 @types/node，S3 移除时需本地型声明）。残余 2 错均 TopBar S4 待实体化（UpdateDialog POt 19-prop 面 jsx 108829；Qct git 投射 jsx 85059–85080）；报告 A0-CLEANUP4.report.md |

| S3-a | vendored→npm：zod/qrcode/useVirtualizer/Stripe/xterm | **完工已验证** | zod@4.3.6 落地（SrcSharedA 删 3,562 行 vendored 体→`import * as zod` + 语义名 shim，6,167→2,907 行）；qrcode@1.5.4（2 declares）；@tanstack/react-virtual@3.14.10（5 declares，useMessageListVirtualizer 确认为直接别名）；Stripe 9.6.0/6.4.0（7 declares）；xterm 裁决 = @xterm/xterm@5.5.0（"3.7.8" 标记实为 js-base64；bundle 指纹锚定 5.5.0，3 处内部 API shim 迁公共 API）；react-resizable-panels **整件推迟**（仅 declare 无转录引擎，X4/Z4/Q4 包装属主未重建，门禁无法验证运行时）；tsc 逐行不变（2）；报告 A0-S3a.report.md |

| S3-b | lucide 285 declares→lucide-react | **完工已验证** | lucide-react@1.35.0 落地；**429/491 declare 语句转真 import**（225 名纯迁移 + 21 句 4 图标并入 ./button pass-1 正典）；62 句/60 名保留逐件登记（49 自定义一方图标误分类、FileIcon 自定义 src prop、IconFork 无对应导出、6 名-符号冲突不猜）；裁决含 Kv trash 簇→Trash2（js 27882）、IconSend→ArrowUpFromLine（w_ 26653）、Spinner 族→LoaderCircle；零调用面改动（LucideProps 全覆盖）、零抑制；32 文件 +134/−444；tsc 逐行不变（2）；报告 A0-S3b.report.md |

| S3-c | radix/shadcn 原语→自建 shadcn 层 | **完工已验证** | 实测 101 名/328 语句（前记 104 偏差已核）；库归属精分（Command*=cmdk、ResizablePanel*=react-resizable-panels 续推迟、PopoverRoot 四分、GitReview Tooltip*=hover-card 包装）；新建 components/ui 12 件（dialog/alert-dialog/dropdown-menu/context-menu/hover-card/collapsible/card/scroll-area/checkbox/input-group/command/alert）+ 13 包精确钉版（@radix-ui/react-dialog 1.1.23…cmdk 1.1.1）；**348 declares 转 import**、8 件附因保留；事故：转换器截断多行 declare 致 12 文件 ~170 语法错，HEAD 全跨度提取手术修复（31 尾移除、280 验净），全量 esbuild 复扫通过；零抑制；报告 A0-S3c.report.md |

| S3-d | lexical vendored→npm | **完工已验证** | 版本指纹双锚定 **0.42.0**（非旧记 0.49.0）；20 declares 全在 Composer.tsx（Markdown/DocEngine 提示被 grep 证伪）；19 转 npm import + 8 KEY_*/COPY/BLUR 命令 + LexicalCommand 接口；1 保留（reportLexicalInputTelemetry 一方遥测）；4 处 bundle 锚定修正（$applyNodeMutation 实为 $applyNodeReplacement hV/LR@61025 错码 200–203 等）；lexical+@lexical/react@0.42.0 精确钉版（30 包传递锁齐）；tsc 逐行不变（2）；报告 A0-S3d.report.md |

| S4-1 | lib 层拆分（shim 模式） | **完工已验证** | 11 件 lib/ 新文件（608 行）：UtilsCn 全件→lib/cn；logger 全件→lib/logger；SrcSharedA §1 15 符号→locale/workspaceUtils/buildEnv/errorUtils；SrcSharedB 5 自含簇 23 符号→uuid/stableIds/logFormat/providerRefs/lineDiff；原 4 件 modules 文件转薄 re-export shim（B5 头注+尾表保留）；零 importers 改写；emit-diff 用 10 入口覆盖 bundle（88MB，rendererEntry 图仅 9 模块不可用）+ __esm 归一化多集比较 = 0 删 0 增；1 处文档化偏差（logger 内 formatLogLinePrefix 改指同层 ./logFormat，emit-diff 0 差验证惰性）；tsc 恒 2、md5 恒不变、零抑制；报告 A0-S4-1.report.md（含 S5 可复用 harness 命令） |

| TopBar 实体化 | 最后 2 错档消解 | **完工已验证** | UpdateDialog 控制器（POt js 129142–129312/jsx 108678–108830 全转录：更新偏好订阅、4 待锁异步动作 +1.5s 自清 OOt、useConfirmDialog 改 import Modals 属主、release-notes LRU、18-prop 渲染面；2 死 prop 登记不转发）+ buildSummaryPanelGitModel（Qct js 98128–98144 逐字，双 null 门）；锚点修正：jsx 108829 实属 styles 块非 src 块；**项目 tsc 归零**（364→2,448 峰→…→2→0）；报告 A0-TOPBAR-MATER.report.md |

| S4-2 | i18n 消息表拆分（shim 模式） | **完工已验证** | 普查发现两表非同一副本：I18n.tsx 带 REBRAND-035+135 nofy 值、intlProvider.tsx 留原始 ZCode 值（各 4,506 键实测）→ 各自字节忠实去向不合并；lib/i18n/ 5 件 18,118 行（zh-CN/en-US 正典 + .zcode 双件 + types）；**I18n.tsx 9,686→657（−93.2%）、intlProvider.tsx 9,516→479（−95.0%）**；28 消费方零改写；emit-diff（10 入口 86MB + --external:./TopBar 隔离并行批）0 删 0 增；树摇对称核验（nofy×2/ZCode×1）；tsc 0、md5 恒、零抑制；推迟件：intlProvider 全去重、lib/locale 合并；报告 A0-S4-2.report.md |

| S4-3 | stores 拆分（shim 模式） | **完工已验证** | 6 模块→**34 件 stores/ 文件**（~10k 行）+ 6 薄 shim；modules 占用 12,740→3,012（−9,728）；SkillStore 4,566→360（taskStore 2,999 行独立）、stores-core 951→106、StoresDeep 3,339→2,264（§A–F 助手 6 件 *Helpers.ts）、stores-tasks 938→74、stores-workspace 1,516→90、stores-session 1,430→118；零推迟单元；同名异体运行时实体（commandsInFlight 等）强制分文件防语义合并；初始化序守恒（emit-diff 多集核验）；中途 3 破损即修；tsc 0→0、md5 恒、esbuild 40/40、零新增抑制（as-any 净 −2）；报告 A0-S4-3.report.md |

| S4-4a | components 拆分：settings/modal 域（8 文件，shim 模式） | **完工已验证** | 8 源文件 35,812→9,402 行（−73.7%）；32 件 components/ 新文件 28,848 行（components/settings、components/modals、components/automations）；SettingsLeaves 6,555→397（SubagentLeaves/PluginLeaves/AutomationEditor 三族）、ExtendedViews 6,609→4,964（§6 AutomationsMainView 2,037 行）、Settings/Modals 族组件全迁；中途破损即修（U7 5→0、U8 44→0）；emit-diff 全程累计 0 语义差；推迟件：ModalsLeaves §D 管道缠绕、ExtendedViews §1–§5 域外归 S4-4b/c；tsc 0→0、md5 恒、esbuild 40/40、零抑制（as-any 150=150）；报告 A0-S4-4a.report.md |

| S4-4b | components 拆分：conversation/composer 域（4 文件，shim 模式） | **完工已验证** | 15 单元→15 件新文件（components/conversation 10 + components/composer 5）；ConversationLeaves 4,141→1,475、ConversationOverlays 2,080→360、Composer 9,198→7,419、Conversation 8,098→6,004；**emit-diff 捕获并修复 1 处真实语义差**（ModelSelector Sparkles≠Sparkle 误代图标，sparkle.mjs 模块消失检出）；推迟件：Composer lexical 编辑器引擎域（[A]/[B1–B15] 编辑器态闭包）+ Conversation §5/§7/§8/§9 编排域（不切闭包纪律）；tsc 0→0、md5 恒、esbuild 19/19、零新增抑制（as-any 净 −2）；报告 A0-S4-4b.report.md |

| S4-4c | components 拆分：shell + 深部 viewers + 杂项 UI（shim 模式） | **完工已验证** | 46 单元全落地（53 件整件组件迁移→19 个 components/ 域：shell/xlsx/charts/markdown/code-viewer/remote/quickpick/payments/usage/feedback/browser/terminal/cmdk/bots/ime/pdf/preview/process-monitor/onboarding）；53 源文件 132,772→8,802 行 shim；零剩余单元；边界案：UsageStatsUiParts useControllableState shim 副本、ProcessMonitor 副作用转发 shim、动态 import 型改写、XlsxDeepB default 再导出；emit-diff 46/46 PASS + 累计 241/241 行全分类（90 未配对 = 8 白名单通配 external 换位，151 对 = 碰撞后缀翻转）零语义漂移；esbuild 106/106（含 5 通配 external 教训）；53/53 shim 面审计一致；73 处 as-any 全字节搬运 0 新增；MarkdownVendored 按设计不迁；tsc 0→0、md5 恒；报告 A0-S4-4c.report.md |

| S4-5 | services 拆分（shim 模式） | **完工已验证** | services.tsx 4,279→130 行 shim；11 单元→services/ 11 件（4,258 行，4,190 体行字节核验一致）：eventPrimitives/ipcBridge/serviceContext/sessionRegistry/providerRegistrySync/remoteServices/workspaceServiceHooks/telemetryScopes/conversationTelemetry/commandQueueProtocol/sessionIndex；拓扑序执行；无顶层注册/订阅代码（初始化序平凡守恒）；导出面审计 77 值+49 型精确；中途 2 修（EventUtil 改指 eventPrimitives、protocolLimits ambient 本地零发射副本——esbuild 0.25.12 ambient 值引用经再导出链拒绝，FeedbackCenter L303 先例）；emit-diff 11/11 PASS + 累计白名单零新增；tsc 0、md5 恒、零抑制；报告 A0-S4-5.report.md（含 modules/ 终态清单 104 件：61 shim + 部分拆分残余 + 入口/胶合 + LegacyDocEngine 域） |

| S5 | 总验证 + 运行时启动 | **完工已验证** | tsc 0 + esbuild 290/290；declare 终账 1,808 句/1,438 名：vendored-npm-pending = **0**（lucide 残 59 全为自定义一方图标、radix 残 8 为 S3-c 登记保留、lexical 残 1 一方遥测），一方未重建深部 1,675 句（A0 后 sourcification 目标），ambient/MarkdownVendored 按设计；锚点抽查 8/8 命中；**md5 清单双空 diff（187+2,183 件，全 A0 零 ground-truth 改动）**；**运行时启动 PASS**：rendererEntry bundle 583KB + 真 Electron（ELECTRON_RENDERER_URL 分支，NOFY_KERNEL_PORT=9803）启动，首启捕获跨 chunk i18n 上下文缺陷（styles 块 useZCodeIntl 读原 chunk provider）以 harness 级单实例 shim 修复、重建源码未动；React 挂载、完整 app shell 渲染（侧栏/问候/Composer/命令面板）、零控制台异常、截图存档；抑制审计 @ts-expect-error 37→3（净 −34 零新增）、as any 232→156 字节搬运；boot harness 入库 a0-wiring-data/boot-harness/；报告 A0-S5.report.md（§7 = PORTING-PLAN 阶段 A 交接位） |

**A0 阶段总结（前端源码化收官）**：36 件 B5 逐字产物 + 79 件 D9/B4 文件 → 真模块化源码工程：modules/ 61 shim + 入口/胶合 + 文档化推迟域；lib/ 19、stores/ 34、components/ 112（19 域）、services/ 11、lib/i18n 5；tsc 364→2,448 峰→0；22 库 npm 化（1 件推迟）；全程 out/ 与 src-reconstructed/ 零改动（md5 清单双空 diff 实证）；零新增抑制；运行时启动验证通过。交接位：src-chunk facade（minified↔语义名映射，使 styles 块消费重建深树）+ 内核 ACP 缝正交推进（PORTING-PLAN 阶段 A）。

**S4 阶段总结**：文件树拆分完成——lib 11 件、lib/i18n 5 件（18,118 行）、stores 34 件、components 112 件（19 域）、services 11 件；modules/ 从 117 件族级大文件（300,457 行）收敛为 61 薄 shim + 入口/胶合 + 文档化推迟域（ExtendedViews §1–§5、ModalsLeaves §D、Composer 编辑器引擎、Conversation 编排域、LegacyDocEngine）；全程 shim 模式零 importers 改写、emit-diff 零语义漂移、tsc 恒 0、out/ md5 恒不变、零新增抑制。

**S3 阶段总结**：22 库落地（zod 4.3.6 / qrcode 1.5.4 / @tanstack/react-virtual 3.14.10 / @stripe/stripe-js 9.6.0 + react-stripe-js 6.4.0 / @xterm/xterm 5.5.0 + addon-fit 0.10.0 / lucide-react 1.35.0 / @radix-ui 13 包 + cmdk 1.1.1 / lexical 0.42.0 族），1 件推迟（react-resizable-panels）；SrcSharedA 6,167→2,907 行；components/ui 层建立（12 件）；全程零抑制、tsc 恒 2（TopBar S4 桩）、out/ md5 恒不变。

**S2 接线阶段总结**：项目 tsc 364（declare-any 静默基线）→ 2,448（真实类型引入峰值）→ … → 773（波次末）→ 582 → 538 → 528 → 44 → **2**（均为 S4 待实体化桩，型已就绪）。剩余 declare 2,502 条 = Lane-4 vendored（S3 目标）+ 未重建深部（S4 目标）。

## 事故与教训（本阶段）

1. declare 提取器三版演进：v1 漏泛型/多行（2,696 条）→ v2 尾注释逃逸吞并 143 行 → v3 尖括号深度+kind 终止（4,607 条，0 吞并）。**教训：机械删除前必须逐文件计数校验 + 完工后 drift 审计。**
2. `—`（SYMBOL-INDEX 未定属主）曾混入接线目标 → 一律剔除，相关名（Button/Dialog/workspaceKey/useVirtualizer/createLucideIcon/trackEvent 等 95）保留 declare。
3. 并发编辑纪律：BUSY 集排除在编批次文件；属主补导出与在编批次冲突时延迟（如 UsageStatsUiParts 的 Tooltip 族 4 项待 S2-a）。
4. 恢复手段：任何工程副本损坏可从 `src-reconstructed/` 1:1 重拷 + 重放管线。
