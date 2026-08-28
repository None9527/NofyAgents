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

## 批次台账

| 批次 | 域 | 状态 | 结果 |
|---|---|---|---|
| S2-a | 13 接缝文件脱 out/ | 运行中 | — |
| S2-b | xlsx declare 接线 | 运行中 | XlsxDeepC 已开始接线 |
| S2-c | legacy-doc 接线 | 运行中 | — |
| S2-e | pptx office 接线 | **完工已验证** | 2 副作用 import；删 2 DEFERRED 表+FALLBACK_RECT；buildMultiRegionPaths 改忠实包装；域内 0 错；报告 A0-S2e.report.md |
| D-Settings | Settings 族 5 文件 | 运行中 | — |
| D-Viewers | CodeViewer 族 8 文件 | 运行中 | — |
| S2-d | SrcSharedA/B ambient 90、SkillStore 8、RemoteWizard→RGS、$2/DEFAULT_ASSET_INSTALL_MODE 补导出、双归属去重 | **待 S2-a 落地后启动** | — |
| D-Shell / D-Conversation / D-Services / D-Misc | 族文件第二波 | 待启动 | — |

## 事故与教训（本阶段）

1. declare 提取器三版演进：v1 漏泛型/多行（2,696 条）→ v2 尾注释逃逸吞并 143 行 → v3 尖括号深度+kind 终止（4,607 条，0 吞并）。**教训：机械删除前必须逐文件计数校验 + 完工后 drift 审计。**
2. `—`（SYMBOL-INDEX 未定属主）曾混入接线目标 → 一律剔除，相关名（Button/Dialog/workspaceKey/useVirtualizer/createLucideIcon/trackEvent 等 95）保留 declare。
3. 并发编辑纪律：BUSY 集排除在编批次文件；属主补导出与在编批次冲突时延迟（如 UsageStatsUiParts 的 Tooltip 族 4 项待 S2-a）。
4. 恢复手段：任何工程副本损坏可从 `src-reconstructed/` 1:1 重拷 + 重放管线。
