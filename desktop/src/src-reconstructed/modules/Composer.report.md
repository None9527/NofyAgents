# B5-01 批次报告 —— Composer 族（F08）first-party 逐字重建

- 日期：2026-08-29
- 来源主口径：`out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，prettier 格式化、标识符压缩；全程只读）
- 对照孪生：`src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（pretty-print，行号不同，仅对照用）
- 产物：
  - `src-reconstructed/modules/Composer.tsx`（9,321 行；文件头映射表 + §0 declare 域 + [A]–[D] 重建段 + 文件尾符号表）
  - `src-reconstructed/modules/Composer.report.md`（本报告）
- 登记依据：COVERAGE-LEDGER §a 表 F08 行、§c.1 #1；MODULE-MAP F08 节；Home.report §1.2；B5-FULL-DECODE-PLAN。

## 1. 覆盖清单

重建范围 = 登记行段 **js 63593–69297**（主体）+ **js 75527–76245、77014–77079**（关联余段），并按 §2 裁决外扩/让渡。57652–63489 为 Lexical vendored 库体，**未转录**（§R1 仅注记边界）。

| 段 | js 行段 | 内容（根符号） | 备注 |
| --- | --- | --- | --- |
| [A] | 63490–63639 | pqe→useSubagentsContext 63490；RB/zB/mqe（缓存/代次）63562–63564；BB/VB/hqe/HB（技能上下文键/合并/去重/加载）63565–63581 | 登记段外，裁决 §R1 |
| [B0] | 63640–63751 | UB→useSkillContextStore 63640；WB→useSkillsContext 63680 | 主体起点 |
| [B1–B3] | 63752–65051 | 建议过滤/评分/构建（gqe…）、触发解析、提及令牌工具 | 主体 |
| [B4] | 64514–64686 | mV→PromptMentionNode 64514；hV→createMentionNode 64632；gV→isMentionNode 64636 | Lexical 节点子类 |
| [B5] | 64687–64914 | SV→SuggestionPanel 64687 | 建议面板 |
| [B6] | 64915–65276 | bJe→useSlashPanelSections 64915；SJe→SlashPanel 65052 | 斜杠面板 |
| [B7] | 65276–66093 | KJe→MentionSelector 65653；HJe/WJe/Nqe 建议钩子；目录去重/环行 | 提及选择器 |
| [B8] | 66094–66331 | zV→resolveTaskProvider 起；提示词历史导航、媒体查询、焦点策略 | 编辑器辅助 |
| [B9] | 66333–66810 | hYe→SubmitOnEnterPlugin、gYe→EditorChangeLogger、_Ye→EditableSyncPlugin、vYe→E2ELexicalBridgePlugin、SYe→EditorApiPlugin、LEXICAL_CHAT_INPUT_THEME、LexicalChatInput、TYe→PassthroughErrorBoundary | Lexical 插件族 |
| [B10] | 66811–67276 | YV→applyWorkspaceFileMentionDrop 66811；XV→useComposerFileDragDetection；jYe→ComposerActionMenu；ZV→ComposerInput 67007（F08 根组件） | |
| [B11] | 67277–67477 | NYe→NANOID_ALPHABET、QV→nanoid、附件阈值常量、附件记录装配 | 附件模型纯函数 |
| [B12] | 67480–67600 | QYe→PROMPT_HISTORY_STORAGE_PREFIX、iH→safeLocalStorage、oH→sanitizePromptHistory 等 | 历史/聚焦/草稿域 |
| [B13] | 67601–68290 | yH→useComposerAttachmentStore 67602；bH/aXe/oXe/sXe/cXe/lXe/xH/uXe/dXe/SH/fXe/pXe/CH/wH；mXe→useComposerAttachments 67679 | 附件 store + 上传管线 |
| [B14] | 68294–68640 | hXe→codeCommentKey 68295；TH→CodeCommentsChip 68298；EH/DH/gXe 事件；FH→useCodeCommentsStore 68562；jXe 68628 | 代码评论域 |
| [B15] | 68643–68826 | IH/LH 事件、MXe markdown 头、网页元素装配/解析 | 网页元素域 |
| [B16] | 68827–69353 | GH→countComposerContexts 68825；GXe/KXe/qXe；PPTX 域（_ buildPptxElementsMarkdown 等跨 chunk 消费）；tZe→useSessionScopedReferences；nZe/rZe→BackgroundWorksCapsule 69273；iZe→memo 69345；XH/ZH 69346/69351 | 终点外扩至 69353，裁决 §R2 |
| [C] | 75494–76148 | N4e→LABEL_ANIMATION_TRANSITION 75494；P4e→usePrefersReducedMotion；_q→AnimatedLabel 75520；vq→ModelSelector 75575（memo）；MODE_LABEL_I18N/MODE_DESCRIPTION_I18N；SegmentedProgress；ContextRing 族（止于 Q4e 76147–76148） | 起点前移 32 行，裁决 §R5；76149 起让渡，裁决 §R4 |
| [D] | 76848–77167 | M3e→isOptionValue 76848；N3e→DANGEROUS_MODE_VALUES 76851；P3e/F3e testid；I3e→ApiRetryIndicator 76860；ConfigSelect 闭包；思考级别值表（U3e→THOUGHT_LEVEL_DISABLED_VALUES 77062 等） | 整闭包转录，裁决 §R3（登记 77014–77079 ⊂ 闭包） |

**合计**：约 5,700 源码行（逐字转录）→ 9,321 行 TSX（含文件头映射表、§0 declare 域、节注释与文件尾符号表）。

## 2. 边界裁决

- **§R1（Lexical 区内的 first-party 段）**：登记的「Lexical 57652–63592」实际在 **63489** 结束（63490 起为 first-party `function pqe(e, t, n) {`）。63490–63639（pqe 子代理上下文 + 技能上下文加载域）全部收录为 [A]。Lexical 库体 57652–63489 一律未转录。
- **§R2（主体终点外扩 56 行）**：登记终点 69297 落在 rZe/iZe（BackgroundWorksCapsule）函数体内。first-party 实际延续到 **69353**（iZe memo 69345、XH isCoarseTouchDevice 69346、ZH shouldRestoreFocus 69351）；**69354 起为 framer-motion vendored**（gq 工厂 75493 为其尾行），未转录。XH/ZH 为 ModelSelector 焦点策略直接依赖，随函数收录。
- **§R3（ConfigSelect 整闭包）**：登记余段 77014–77079 位于 76848 开始的 ConfigSelect/思考级别解析闭包中部；按逐字保真原则整闭包转录（76848–77167）。与 B5-04（F12）对思考级别值表存在双重归属，本件按 COVERAGE-LEDGER §c.1 #1 记在 F08 名下，B5-04 引用时以本件为准。
- **§R4（76149–76245 让渡）**：登记余段 75527–76245 的尾段 76149–76245 为上下文用量/快照助手（Sq 76149、Cq 76152、$4e 76157、wq 76163、Tq 76183、n3e 76194、Eq 76197、Dq 76200、Oq 76207），属 F12 用量域，让渡给 UsageDeep.tsx，本件不转录。[C] 止于 76148（Q4e 尾行）。
- **§R5（[C] 起点前移 32 行）**：登记起点 75527 落在 _q（AnimatedLabel，75520）函数体内；其前置常量/钩子 N4e 75494、P4e 75496 与 framer-motion 尾行 75493 相邻。为 ModelSelector 完整性收录 75494 起。
- **vendored 注记**：Lexical 57652–63489、framer-motion 69354–75493 两段库体均未转录，仅在本报告与文件头注记边界。

## 3. 验证记录（门禁）

1. **esbuild**：`web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/Composer.tsx --loader:.tsx=tsx --jsx=preserve` → **0 错误**（输出 254.2kb，exit 0；最终两次复跑均通过）。
2. **tsc**：`web/node_modules/.bin/tsc -p /tmp/tsconfig.composer.json` → **0 错误**（exit 0，输出为空）。配置：strict、target/lib ES2022（+DOM）、module ESNext、moduleResolution Bundler、jsx preserve、noEmit、skipLibCheck、typeRoots `["/Users/mac/nofy-build/web/node_modules/@types"]`、types react/react-dom；另以 baseUrl+paths 将 `react`/`react-dom` 及其子路径映射到 @types d.ts（Bundler 模式下 @types exports 解析失败的修正）。
3. **行号锚点回代**（16/16 逐字命中，≥8 达标）——对 `out/renderer/assets/styles-CdEGpc2x.js` 精确行整行比对：

| # | js 行 | 原文（整行） | 重建对应 |
| --- | --- | --- | --- |
| 1 | 63490 | `function pqe(e, t, n) {` | useSubagentsContext |
| 2 | 63640 | `var UB = Ae((e, t) => ({` | useSkillContextStore |
| 3 | 64243 | `function Kqe(e) {` | toSlashPanelMention |
| 4 | 64514 | `var mV = class e extends dI {` | PromptMentionNode |
| 5 | 64687 | `function SV({` | SuggestionPanel |
| 6 | 64915 | `function bJe(e, t, n, r, i, a, o, s, c) {` | useSlashPanelSections |
| 7 | 65052 | `function SJe({` | SlashPanel |
| 8 | 65653 | `function KJe({` | MentionSelector |
| 9 | 67007 | `function ZV({` | ComposerInput |
| 10 | 67679 | `function mXe(e) {` | useComposerAttachments |
| 11 | 69273 | `function rZe({ backgroundWorks: e, runningSubagentCount: t = 0, onOpen: n }) {` | BackgroundWorksCapsule |
| 12 | 69345 | `var iZe = (0, Q.memo)(rZe);` | BackgroundWorksCapsuleMemo |
| 13 | 69346 | `function XH() {` | isCoarseTouchDevice |
| 14 | 75575 | `var vq = (0, Q.memo)(function ({` | ModelSelector |
| 15 | 77062 | ``var U3e = new Set([`disabled`, `false`, `no`, `none`, `nothink`, `no-think`, `no_think`, `off`]),`` | THOUGHT_LEVEL_DISABLED_VALUES |
| 16 | 69351 | `function ZH({ isCoarseTouchDevice: e }) {` | shouldRestoreFocus |

4. **附加行号核验**（非门禁，用于映射表纠偏）：对 [A]/[B4]/[B13]/[B14]/[B16]/[D] 约 50 个符号逐一定位原始行并修正了文件内 ±1–2 行的旧登记（如 yH 67601→67602、TH 68297→68298、GH 68827→68825、M3e 76849→76848、hV 64633→64632 等）；[B1]/[B5]/[B7]–[B12]/[C] 余目行为抽样核验（含 16 锚点全中），与 B1–B4 既有件的行号精度惯例一致。
5. `out/` 全程只读；写入仅限 `src-reconstructed/modules/Composer.tsx`、`Composer.report.md` 与 `/tmp/tsconfig.composer.json`。

## 4. 符号表（供 SYMBOL-INDEX 增量抽取）

完整符号表见 `Composer.tsx` 文件尾注释块（[A]–[D] 分段，`混淆名→语义名 js行` 格式）。文件头映射表含 **351 条单符号条目**（另有 ~30 个分组列举项，如 CV/wV/TV/EV/DV/OV/kV 编辑令牌、MV…MJe 目录去重族）。根符号摘录：

| 混淆名 | 语义名 | js 行 |
| --- | --- | --- |
| pqe | useSubagentsContext | 63490 |
| UB | useSkillContextStore | 63640 |
| WB | useSkillsContext | 63680 |
| mV | PromptMentionNode | 64514 |
| hV / gV | createMentionNode / isMentionNode | 64632 / 64636 |
| SV | SuggestionPanel | 64687 |
| bJe | useSlashPanelSections | 64915 |
| SJe | SlashPanel | 65052 |
| KJe | MentionSelector | 65653 |
| ZV | ComposerInput（F08 根） | 67007 |
| mXe | useComposerAttachments | 67679 |
| yH | useComposerAttachmentStore | 67602 |
| TH | CodeCommentsChip | 68298 |
| FH | useCodeCommentsStore | 68562 |
| GH | countComposerContexts | 68825 |
| rZe / iZe | BackgroundWorksCapsule / Memo | 69273 / 69345 |
| XH / ZH | isCoarseTouchDevice / shouldRestoreFocus | 69346 / 69351 |
| N4e / P4e / _q | LABEL_ANIMATION_TRANSITION / usePrefersReducedMotion / AnimatedLabel | 75494 / 75496 / 75520 |
| vq | ModelSelector | 75575 |
| M3e | isOptionValue | 76848 |
| N3e | DANGEROUS_MODE_VALUES | 76851 |
| I3e | ApiRetryIndicator | 76860 |
| U3e | THOUGHT_LEVEL_DISABLED_VALUES | 77062 |

## 5. 越界发现（登记外/范围外 Composer 属符号，仅记录未动手）

以下符号经 COVERAGE-LEDGER §c.1 #1 核对属 Composer 族登记群，但位于本批次行段之外，已在原始 js 定位，留待后续批次：

| 混淆名 | js 行 | 内容 | 建议归属 |
| --- | --- | --- | --- |
| j3e | 76678 | 上下文用量部件（76630–76848 区） | F12 UsageDeep |
| Pq | 77166 | ThoughtLevelControl（[D] 闭包后紧邻的思考级别 UI） | F08 后续小批 |
| Fq | 77348 | 思考级别辅助 | 同上 |
| Z3e / Q3e / $3e | 77360 / 77367 / 77393 | 思考级别解析余段 | 同上 |
| Zrt | 89415 | `memo(Xrt)`，附件/草稿域 chip | F08 尾批 |
| ait | 89978 | `memo(iit)`，附件/草稿域 chip | F08 尾批 |
| lit | 89989 | contexts chip（onRemove/onRemoveAll 面） | F08 尾批 |
| uit | 90087 | references chip | F08 尾批 |

## 6. 余量

**无**。分配行段（63593–69297 去 Lexical 后全部、75527–76245 中属 F08 的 75494–76148、77014–77079 所在的 76848–77167 闭包）已全量逐字转录，无接口级欠款。76149–76245 为 §R4 让渡（F12），不属本批余量。

## 7. 把握度分布

- **高（逐字/逐行转录）**：约 95% —— 全部函数体、类名/常量/分支逻辑、JSX 结构、逗号表达式 effect 返回均按原样对应；16 锚点整行回代命中。
- **中（语义归纳，已标注）**：约 5% —— §0 declare 域（跨 chunk 依赖的接口级声明：skillStore/imeComposition/testids/logger/白板/会话引用等）、类型标注（参数/返回类型为重建所需的新增信息，运行时语义不变）、语义命名本身。文件内以 `/** 原 XX（js NNNNN）*/` 逐函数标注来源；`as` 类型断言共 ~15 处，均为纯类型面（`item.value as string` 等），不改变运行时行为。
