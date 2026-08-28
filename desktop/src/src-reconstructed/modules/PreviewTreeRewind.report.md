# PreviewTreeRewind.report.md — B5-06 批次（F19 预览卡群 + F04 文件树 + F14 MO 深部 + F03 FileRewindDialog 深部）重建报告

> 批次：B5-06 · 解码子代理产物报告
> 主口径：`desktop/src/out/renderer/assets/styles-CdEGpc2x.js`（本机实测 **213,979 行**，md5 `48d71d4874b0868d61fd35a328bf6ad5`，全程只读）
> 对照：`desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（pretty 版，170,400 行）
> 产物：`PreviewCards.tsx`（A 段）、`FileTreePanel.tsx`（B 段）、`FileRewindDialogDeep.tsx`（C+D 段）

---

## §0 口径与约定

1. 本批所有行号一律为**本机实测行**（js 行 / jsx 行）。旧登记（MODULE-MAP、MarkdownIntegration.report、SidePanel.report、Conversation.report、COVERAGE-LEDGER）使用 **213,695 行版**口径，与本批实测 chunk 存在**分段线性偏移**（见 §1）。
2. 逐字重建约定：类名、字符串常量、分支结构零改动；混淆名→语义名映射表置于各 .tsx 文件头；符号表置于文件尾；i18n 键保留原键名。
3. JSX 表达约定：重建文件使用**真 JSX**（非压缩 `(0,$.jsx)(...)` 形式），与 ConversationLeaves.tsx / PreviewCards.tsx 既有体例一致。
4. 双归属裁决总则：**消费面优先**——符号若已被既有模块逐字实现，则本批以 `declare` 挂接、不重复转录；仅被接口级 `declare` 者，本批为实现方；边界冲突只记录、不改既有 .tsx/.report.md。

---

## §1 行号偏移校准（旧登记 → 实测）

实测 chunk 较旧登记版净增 284 行，但偏移**分段不均**：F19/F03/F14 区段 **+48**，F04 文件树区段 **+46**。下表为本批 14 个回代锚点的逐点换算（全部经 §4.3 逐字核验命中）：

| 符号 | 段 | 旧登记 js | 实测 js | 偏移 | 实测 jsx |
|---|---|---|---|---|---|
| Qze | A | 48221 | 48269 | +48 | 43464 |
| MBe | A | 49090 | 49138 | +48 | 44247 |
| Wk | A | 49834 | 49882 | +48 | 44808 |
| ZBe | A | 50353 | 50401 | +48 | 45250 |
| ej | A | 51173 | 51221 | +48 | 46037 |
| QA | B(模型层) | 51093 | 51141 | +48 | 45957 |
| MO | C | 47501 | 47549 | +48 | 42773 |
| Sze | C | 47414 | 47462 | +48 | 42729 |
| __t | D | 110362 | 110410 | +48 | 94426 |
| v_t | D | 110379 | 110427 | +48 | 94447 |
| BIt | B | 145318 | 145364 | +46 | 121173 |
| $It | B | 146089 | 146135 | +46 | 121795 |
| nLt | B | 146240 | 146286 | +46 | 121891 |
| cLt | B | 146793 | 146839 | +46 | 122289 |

> 结论：F19/F14/F03 用 +48，F04 用 +46。后续批次引用本批行号时以**实测**为准。

---

## §2 覆盖清单（符号 → 实测 js 行 / jsx 行）

### A 段 · PreviewCards.tsx（2,385 行）
- Qze 深部（48114–48571）：Uze/ek/tk/nk/Wze/rk/Gze/Kze/qze/ik/ak/Jze/ok/sk/ck/Yze/Xze/Zze/lk/uk/Qze/dk
- MBe 全量（49138–49770）：MBe / Lk
- Wk 画廊（49801–50176）：Rk/zk/RBe/zBe/Bk/Vk/Hk/Uk/BBe/VBe/Wk/qk
- 工具预览源构建（50177–50420）：HBe/Jk/UBe/WBe/Yk/Xk/Zk/Qk/$k/eA/tA/nA/rA/iA/aA/oA/sA/cA/GBe/lA/uA/KBe/qBe/JBe/YBe/XBe/ZBe
- 微件（51221–51233）：ej / tj

### B 段 · FileTreePanel.tsx（2,718 行）
- 模型层（50907–51197，数值在 A 行范围、语义归 F04）：AA/jA/MA/NA/NVe/PVe/FVe/PA/IVe/FA/IA/LA/RA/LVe/BA/VA/RVe/HA/UA/zVe/BVe/VVe/HVe/UVe/WA/GA/WVe/GVe/KA/qA/JA/KVe/YA/XA/qVe/JVe/YVe/ZA/XVe/ZVe/QA
  - 其中 zA/QVe/$A 由 MarkdownIntegration.tsx 已实现 → 本文件 `declare` 挂接（不重复）。
- 树族（145213–146777）：f8/jIt/MIt/NIt/PIt/FIt/IIt/LIt/RIt/zIt/BIt/VIt/HIt/p8/UIt/WIt/GIt/KIt/qIt/JIt/YIt/XIt/ZIt/QIt/$It/eLt/tLt/nLt/rLt
- 任务缓存助手（146778–146848，物理在 B 行范围、语义属 F01）：iLt/aLt/oLt/sLt/cLt

### C+D 段 · FileRewindDialogDeep.tsx（950 行）
- C · MO 深部（47354–47712；任务口径 47501–47660=47549–47708，依赖簇 47354–47548 为 MO 自洽纳入）：cze/lze/uze/dze/fze/pze/mze/hze/gze/_ze/vze/DO/OO/yze/kO/AO/bze/xze/jO/Sze/Cze/MO/NO
- D · FileRewindDialog 深部（110410–110634）：__t / v_t
  - p1/yg 由 GitReview.tsx 已实现 → `declare` 挂接；b_t/f1/y_t/x_t 归 GitReview.tsx，排除只注记。

---

## §3 边界裁决摘要

1. **A/B 模型层归属**：50907–51197 数值落在 A 段行范围（50618–51687）内，但语义为文件树模型+编辑器+文件动作（F04）。PreviewCards.tsx 尾注已移交，本批由 FileTreePanel.tsx 重建（内部裁决，消费面=文件树）。
2. **F04 任务缓存助手**：iLt/aLt/oLt/sLt/cLt（146778–146848）物理位于 B 行范围、语义属 F01 任务列表。sLt 与 SidebarLeaves.tsx、cLt 与 SettingsPanelsCapability.tsx 的接口级 `declare` 构成双归属，本文件为**实现方**；m8/h8（146849/146859）已由 Sidebar.tsx 完整实现（RemoteSyncingRow/TaskListLoadingRow），跳过；lLt/uLt/dLt/pLt/mLt（146869+）= F01 任务段族（Sidebar/SidebarLeaves 接口级）；hLt/gLt/_Lt 头像原语 + vLt 起 Bots 常量（147700+）= X03/B5-04，排除只注记。
3. **C 段依赖簇**：MO 依赖簇 47354–47548 数值在任务口径（47549–47708）之前，为 MO 自洽纳入（内部裁决）。oze（47343，暗色探测）横切层，接口级声明。
4. **D 段双归属**：v_t/__t 仅被 Conversation.tsx 接口级 `declare`，本文件为**实现方**；p1/yg 已由 GitReview.tsx 逐字实现，本文件 `declare` 挂接；b_t/f1/y_t/x_t 归 GitReview.tsx，排除只注记。
5. **跨文件共享钩子**：QA/JA 由 FileTreePanel.tsx 重建，被 v_t 消费 → FileRewindDialogDeep.tsx `declare` 挂接；$A/zA/OA/kA 由 MarkdownIntegration.tsx 重建 → 同挂接。
6. **DropdownMenu 原语族**（实测 47974–48113；旧登记 47926–48040）= X03 双归属，按任务排除，三件产物均仅 `declare` 挂接、只注记。

---

## §4 验证记录（四项门禁 + md5）

### 4.1 门禁 1 · esbuild（`--loader:.tsx=tsx --jsx=preserve`）
| 产物 | 退出码 |
|---|---|
| PreviewCards.tsx | 0 |
| FileTreePanel.tsx | 0 |
| FileRewindDialogDeep.tsx | 0 |

### 4.2 门禁 2 · tsc strict（`/tmp/tsconfig.<name>.json`：strict/ES2022/jsx preserve/moduleResolution Bundler/typeRoots→web/node_modules/@types；include 仅该产物；react 经 paths 指到 @types/react）
| 产物 | 错误数 |
|---|---|
| PreviewCards.tsx | 0 |
| FileTreePanel.tsx | 0 |
| FileRewindDialogDeep.tsx | 0 |

### 4.3 门禁 3 · 行号锚点回代（≥8，实际 14，逐字命中原始 chunk）
见 §1 表。14/14 命中（`sed -n '<line>p'` 提取行与符号定义逐字一致；$It 行内容 `function $It({` 经单独核验）。

### 4.4 门禁 4 · 报告完整性
本报告含 §0 口径 / §1 偏移 / §2 覆盖 / §3 边界 / §4 验证 / §5 遗留，四件产物均含文件头映射表+文件尾符号表。✔

### 4.5 out/ 只读复验
`md5(out/renderer/assets/styles-CdEGpc2x.js)` = `48d71d4874b0868d61fd35a328bf6ad5`，与基线一致；行数 213,979。✔ 未改动。

---

## §5 遗留问题清单

1. **模型层跨域**：QA（useFileContextActions）/JA（resolveAvailableEditors）实现落在 FileTreePanel.tsx，但被 Conversation 域（v_t）与 MarkdownIntegration 消费；若后续 F01/F19 批次需要独立实现，需以本文件为消费面基准去重。
2. **任务缓存助手归属**：iLt/aLt/oLt/sLt/cLt 语义属 F01，物理在 B 行范围；建议 F01 批次以本文件为实现基准，SidebarLeaves/SettingsPanelsCapability 的接口级 `declare` 维持挂接。
3. **横切路径助手未归批**：Go/sae/Yo（1925–1975）与 xe/ce/pe（跨块任务态）仍为接口级声明，待横切/任务态批次落地后替换。
4. **vendored diff 组件**：$Re（X09）与 DropdownMenu 原语（X03）保持 `declare`，待对应 vendored 批次提供实现。

---

*报告生成：B5-06 解码子代理 · 2026-08-28*
