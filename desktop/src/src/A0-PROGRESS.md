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
| Lexical（styles 57652–63592） | lexical/@lexical/react（latest 0.49.0） | ✓ 可达；**vendored 版本号需先从 bundle 锚定再定 npm 版本** |
| resizable-panels（131439–131820） | react-resizable-panels（latest 4.12.3） | ✓ 可达；同上需锚定版本 |
| qrcode（78456–79690） | qrcode@1.5.4 | ✓ |
| useVirtualizer | @tanstack/react-virtual@3.14.10 | ✓ |
| 图标（286 名） | lucide-react@1.35.0（自定义 Icon* 除外，属 first-party） | ✓ |
| shadcn/radix 原语（109 名） | @radix-ui/*（dialog 1.1.23 等）+ 自建 shadcn 层 | ✓ |
| Stripe（80955–81731，6.4.0/9.6.0 双版本） | @stripe/stripe-js / react-stripe-js | 待核版本 |
| xterm 3.7.8 | `xterm@3.7.8` 不可达（包已改名）→ @xterm/xterm 或锁旧版 | ⚠ 需裁决 |

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

## 事故与教训（本阶段）

1. declare 提取器三版演进：v1 漏泛型/多行（2,696 条）→ v2 尾注释逃逸吞并 143 行 → v3 尖括号深度+kind 终止（4,607 条，0 吞并）。**教训：机械删除前必须逐文件计数校验 + 完工后 drift 审计。**
2. `—`（SYMBOL-INDEX 未定属主）曾混入接线目标 → 一律剔除，相关名（Button/Dialog/workspaceKey/useVirtualizer/createLucideIcon/trackEvent 等 95）保留 declare。
3. 并发编辑纪律：BUSY 集排除在编批次文件；属主补导出与在编批次冲突时延迟（如 UsageStatsUiParts 的 Tooltip 族 4 项待 S2-a）。
4. 恢复手段：任何工程副本损坏可从 `src-reconstructed/` 1:1 重拷 + 重放管线。
