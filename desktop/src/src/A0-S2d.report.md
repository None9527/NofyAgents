# A0-S2d 批次报告（前端源码化 Stage A0 · declare 接线 + 双归属去重）

日期：2026-08-29 · 工作目录 /Users/mac/nofy-build
任务域（10 文件，均在 desktop/src/src/modules/）：SrcSharedA.tsx、SrcSharedB.tsx、SkillStore.tsx、RemoteWizard.tsx、RemoteGapSegments.tsx、WebRemote.tsx、Bots.tsx、PaymentDeep.tsx、Composer.tsx、Modals.tsx

## §0 总账

| 指标 | 数值 |
|---|---|
| declare → 真实 import 接线 | **152 条** |
| 双归属去重删除 | **≈520 行**（Bots §6 204 行 + PaymentDeep §2 242 行 + §3 前半 50 行 + PaymentDeep §0 declare 段 20 行 + 4 条孤儿 icon declares；均以 tombstone 注释替换，注明 canonical 去向） |
| 消费点改 import | 6 处具名改接 + popover 消费面（PaymentDeep 496–570 区段）整体改指 Composer |
| 类型垫片（零运行时影响） | 5 处（RemoteWizard RemoteDirectoryStepPropsLike 9 个 prop cast 计 1 组 + PaymentDeep 4 处 as/unknown cast） |
| 补导出 | 2 件（Modals `$2`；SrcSharedA `DEFAULT_ASSET_INSTALL_MODE`，随 §15 共 40 符号） |
| 保留 declare | **432 条**（Lane-4 vendored + 属主域外未导出 + 身份待核，见 §7/§8） |
| tsc 域内错误 | **76 → 66（净 −10，零新增）** |
| esbuild 逐文件 | 10/10 通过（0 错） |
| out/ md5 | src-HCld2afU.js = f5edd6a1207c6d20008204829dad3923 ✓；styles-CdEGpc2x.js = 48d71d4874b0868d61fd35a328bf6ad5 ✓ |
| git diff --stat（10 文件） | +364 / −923 |

接线 152 条构成：SrcSharedB §0 91 + SkillStore 9（8 账目 + logger）+ RemoteWizard 21（13 RGS + 8 其他）+ RemoteGapSegments 8 + Modals 2 + Composer 4 + Bots 7 + WebRemote 10。

## §1 任务 1 —— SrcSharedB §0 ambient declare → SrcSharedA 真实 import（B5-10b）

- 账目记 90 条，实数 **91 条**（逐条核对 §0 声明面后确认；多出 1 条为 `El` = CLAUDE_TO_GLM_MODEL_MAP，见 §11 异常 1）。
- 全部 91 条替换为单条聚合 import（插在最后一个 import 收尾行之后），混淆名以别名保留，注释随迁：
  `import { zString as w, …, CLAUDE_TO_GLM_MODEL_MAP as El } from './SrcSharedA';`（91 别名）
- 0 个未映射符号：全部经 SrcSharedA 尾部符号表反查 obf→语义名，且目标绑定/导出逐一验证存在。
- `declare global { var process: any; }` 保留（非模块符号）。
- 导出块（412 别名，含 53 个以原混淆名再导出的上半内部名，如 `webRemoteWorkspaceKey as c`、`fc as $o`、`uc as Zo`）**保持现状**，按任务要求不动。
- 接口级依赖，不影响发射代码；out/ md5 未变（门禁 c 验证）。

## §2 任务 2 —— SkillStore 8 条 src-HCld2afU declare（B5-11）

接线 9 条（8 账目 + 1 logger）：
- `import { t as logger } from './logger';` 并 `export { logger };`（Lane-1 UNIQUE_ADDEXPORT 登记）。
- 自 SrcSharedB 6 条：`buildCustomModelRef as formatCustomQualifiedModelId`、`nativeProviderRef as formatNativeSupplierKey`、`parseCustomModelRef as parseCustomQualifiedModelId`、`listSessionModeOptions as getDefaultModeOptions`、`generateUuid as createUuid`、`buildStableModelId as formatBuiltinQualifiedModelId`。
- 自 SrcSharedA 2 条：`resolveDefaultAgentCliProvider as resolveAgentProvider`、`isGlmAgentCliProvider as isGlmProvider`。
- SubagentsService / SkillsService / Descriptor 接口：按已落地形状核对通过（调用面契约吻合），保留为本地接口契约（§0 头部注释已改写注明）。
- SkillStore 导出的 `create`（BoundStoreHook<T>，zustand vendored 重载）被 Modals/Composer 复用（见 §6），消费侧仅 selector/getState/setState 用法，无裸调用，兼容。

## §3 任务 3 —— RemoteWizard 234–363 declare 组改指 RemoteGapSegments（B5-14）

先核验 RGS 导出面：§3.2/§3.3 实体化符号齐备。接线 21 条：
- 自 RemoteGapSegments 13 条：`useRemoteWizardState`、`useRemoteConnectionLogs`、`resolveWizardStepCopy`、`validateAndBuildRemoteTarget`、`attachSelectedResourcePackages`、`isWizardFlowActive`、`isWizardFlowIdle`、`wizardResultToOpenState`、`resolveDirectorySelectFallback`、`RemoteKindStep`、`RemoteSettingsStep`、`RemoteConnectingStep`、`RemoteDirectoryStep`（混淆名注释 mEt/bEt/xEt/SEt/CEt/wEt/TEt/EEt/DEt/oOt/sOt/rOt/cOt 随迁）。
- 其他 8 条：`isValidWslUser as isValidWslUsername`（SrcSharedA）、`generateUuid as generateRequestId`（SrcSharedB）、`extractErrorMessage as toErrorMessage`（FeedbackCenter，原 MC 37651；已逐字核对 FeedbackCenter.tsx:1064 函数体一致，含 `.replace(/^(Error:\s*)+/i, "").trim()`）、`useSessionRegistryStore as useSessionStore`（stores-core）、`useBaseServices`（services）、`t as logger`（logger）、`useConfirmDialog`（Modals）、`Input`（ImeComposition）。
- 被替换 declare 全部删除并留 tombstone。
- 类型垫片：新增 `type RemoteDirectoryStepPropsLike = React.ComponentProps<typeof RemoteDirectoryStep>;`，RemoteDirectoryStep 调用处 9 个 prop cast（services 1 + 本地 `Ke.X as RemoteDirectoryStepPropsLike["…"]` 4 + 远端 `((Ge as {…})?.X ?? null) as …` 4）。零运行时影响。
- 保留 declare 2 条：`useCancelRemoteConnection`（uEt，未实体化）、`SuggestionInput`（属主未导出，见 §8）。

## §4 任务 4 —— 补导出 2 件（B5-14 清单）

1. **Modals.tsx `$2`**：`canOpenRemoteSessionSourceCheck` 加 `export`（附 B5-14 注记）。消费方 RemoteGapSegments 已改真实 import。
2. **SrcSharedA.tsx `DEFAULT_ASSET_INSTALL_MODE`**：随新增 §15 导出块（置于尾部符号表之前、providerEndpointsSchema 链收尾 `});` 之后）一并导出。§15 共 **40 符号**，逐符附混淆名注释，含：zUndefined/Ua、zDate/Ja、looseRecord/no、clientModeEnum/Fo、browserRequestSchema/Ko、browserDescriptorSchema/Yo、sessionContextEnum/Xo、browserResultSchema/as、ASSET_INSTALL_MODES/os、**DEFAULT_ASSET_INSTALL_MODE/ss**、isFileTransferCapability/ps、agentCliProviderEnum/I、USAGE_REPORT_RANGES/ms、clientModeEnum2/Os、messageVisibilityEnum/ks、syntheticSourceEnum/As、workspaceRefSchema/B、permissionDecisionEnum/js、addRulesUpdateSchema/Ps、permissionResponseSchema/Fs、modelRefSchema/V、sessionModeEnum/Is、sessionStatusEnum/Ls、goalTargetSchema/zs、sessionDescriptorSchema/Hs、subagentOriginSchema/Us、messagePartSchema/Qs、messageWithPartsSchema/$s、cacheStatsSchema/tc、contextBreakdownSchema/nc、sessionStateEventSchema/ic、extractTextFromParts/ac、imBindingSchema/sc、BOTS_STREAM_TIMEOUT_MS/uc、BOTS_TASK_CHANNEL/dc、BOTS_TASK_STREAM_CHANNEL/fc、wslUserSchema/Tc、integratedTerminalShellSchema/Jc、approvalPolicyEnum/hl、providerIds/W。
   - 原拟 50 符号，esbuild 检出 10 个已存在于 4658/5186/5706/5720 的 `export const` 链（Dl/Ol/kl/Al/jl/Ml/Fl/Il/Ll + Sl），故收敛为 40；块尾注释注明该 10 符的既有导出位置。

## §5 任务 5 —— 双归属去重（§2 裁决）

去重前后均逐段对照 src-reconstructed 基准与权威 bundle，确认删除的只是重复转录、消费面语义不变。每处删除留 tombstone（参照 S2-e 做法，注明 canonical 去向）。

### (a) 149473–149599（YLt…nRt，rRt 唯一消费族）canonical = WebRemote.tsx
- **Bots.tsx §6（1966–2169，204 行，9 符号 REMOTE_PAIRING_PROVIDERS…remoteControlFailureMessageOf）整体删除** —— 经全库消费点核验为**零消费**的纯重复转录（重复实体无任何引用点）。
- canonical WebRemote §7 对应实体命名为 BOT_CHANNEL_PROVIDERS 等（两套命名均记入 tombstone）。
- 附带删除 `import { workspaceKeyOf } from './CodeViewer'`（随 §6 失去消费者），留 tombstone。

### (b) 76848–77167（ConfigSelect/Mq 整闭包）canonical = Composer.tsx
- bundle 行号实证：M3e@76848、Nq@77127、X3e@77162、Pq@77166 —— 故 PaymentDeep §3 前半（Nq…X3e）亦属本组，修正 B5-04「§3 77127–77451」的整段归属说法。
- **删除 PaymentDeep §2（242 行，M3e…Mq）+ §3 前半（50 行，Nq…X3e）**，均留 tombstone。
- Composer 侧补导出（各附 A0-S2d 注记）：`SegmentedProgress`、`ContextUsageProvider`、`ContextRingTrigger`、`ContextRingTooltipContent`、`ContextRingTooltipBody`、`export interface ConfigSelectOption/ConfigSelectSpec`、`ConfigSelect`、`isDisabledThoughtOption`、`sortThoughtOptions`、`nextThoughtLevelValue`、`thoughtOptionLabel`。
- `THOUGHT_LEVEL_RANKS` **不导出**（PaymentDeep 为唯一消费者，其本地副本已删、改 import 无需——该符号消费点已随重复段删除）。
- 消费点改接 6 处 + 5 处类型垫片：
  - PaymentDeep 第 88 行原 `THOUGHT_LEVEL_RANKS` import 替换为 10 名 Composer import：`ConfigSelect`、`ContextUsageProvider as ContextUsagePopoverRoot`、`ContextRingTrigger as ContextUsagePopoverTrigger`、`ContextRingTooltipContent as ContextUsagePopoverContent`、`ContextRingTooltipBody as ContextUsagePopoverBody`、`SegmentedProgress as SegmentedProgressBar`、`isDisabledThoughtOption as isThoughtOffOption`、`nextThoughtLevelValue`、`sortThoughtOptions`、`thoughtOptionLabel as thoughtOptionLabelOf`；另 `import type { ConfigSelectOption, ConfigSelectSpec } from './Composer';`。
  - 922 行：`sortThoughtOptions((option.options ?? []) as ConfigSelectOption[])`。
  - 929/1034 行：`thoughtOptionLabelOf(intl, provider ?? undefined, option as unknown as ConfigSelectSpec, …)`（方法双变异性使 PaymentDeep IntlShape 可传入）。
  - 953/11037/11605 行消费面直接命中，无需 cast。

### (c) 77062–77126（U3e/W3e/G3e）+ 76034–76156（popover 原语）canonical = Composer.tsx
- popover 5 原语经 (b) 的 10 名 import 覆盖（ContextUsagePopoverRoot/Trigger/Content/Body + SegmentedProgressBar），PaymentDeep 对应 5 条 declare 删除，tombstone 注明 canonical。
- U3e/G3e 为空壳转发（随重复段删除而消失，无需单独 import）；W3e 的 declare-only 挂接删除（其消费面已并入 Composer 导出实体）。
- 孤儿 declare 4 条删除（THOUGHT_TRIGGER_TESTID、ModeIconDefault、ModeIconPlan、ModeIconAgent），tombstone 注明；`ModeIconFullAccess` 仍有本地消费，保留。
- PaymentDeep §0 declare 段随上述删除约 20 行（THOUGHT_OFF_VALUES、THOUGHT_LEVEL_LABEL_KEYS + 5 popover 原语 + 4 孤儿）。

## §6 任务 6 —— 域内其余跨模块 declare 接线

| 文件 | 接线数 | 明细 |
|---|---|---|
| WebRemote.tsx | 10 | `t as logger`（logger）、`dismissToast`/`toast`（ImeComposition）、`useSettingsStore`（stores-core）、`useConfirmDialog`（Modals）、`formatRelativeTime`（QuickPick）、`webRemoteWorkspaceKey as taskWorkspaceKey`（SrcSharedB；bundle `c as ei` 实证，B5 误归 SidebarLeaves 已更正）、`BotsDialog as BotsConfigDialog`/`BotProviderIcon as BotProviderAvatar`/`regionTagKeyOfProvider as resolveBotProviderRegionTagId`（Bots） |
| Modals.tsx | 2 | `create as zustandCreate`、`logger`（均自 SkillStore；ZustandStore 接口 + zustandCreate declare 删除，tombstone） |
| Composer.tsx | 4 | `create as createStore`、`logger`、`useTaskStore`、`useWhiteboardStore`（均自 SkillStore；createStore declare + 本地 ZustandStore/ZustandSetState 脚手架删除，tombstone） |
| Bots.tsx | 7 | `isFeishuOrLark as isFeishuFamilyProvider`、`availableReplyModesForProvider as replyModeIdsOfProvider`、`DEFAULT_BOT_REPLY_MODE as REPLY_MODE_DEFAULTS`（更正 B5 误注，见 §11）、`resolveBotReplyMode as defaultReplyModeOf`、`BOTS_STREAM_TIMEOUT_MS as BIND_CODE_TTL_MS`（SrcSharedA）、`generateUuid as generateUniqueId`（SrcSharedB）、`useConfirmDialog`（Modals） |
| RemoteWizard.tsx | 8 | 见 §3「其他 8 条」 |

## §7 保留 declare 分布（共 432 条）

| 文件 | 条数 | 主要原因 |
|---|---|---|
| SrcSharedB.tsx | 1 | `declare global { var process }` |
| SkillStore.tsx | 1 | global 兜底 |
| RemoteWizard.tsx | 28 | Lane-4（shadcn/radix 原语、Icon*）+ useCancelRemoteConnection（未实体化）+ SuggestionInput（属主未导出） |
| RemoteGapSegments.tsx | 6 | cn/useIntlContext/Button/usePlatformService/createLucideIcon/IconChevronRight（Lane-4 + 属主域外） |
| WebRemote.tsx | 28 | Lane-4 + toErrorMessage（p6，与 FeedbackCenter MC 非同一实体，见 §8） |
| Bots.tsx | 22 | Lane-4 + usePlatformService/useZCodeIntl |
| PaymentDeep.tsx | 164 | Stripe vendored 80955–81731 整段不动（硬规则 2）+ Lane-4 + 未实体化间隙 |
| Composer.tsx | 145 | lexical/useVirtualizer/原语 Lane-4 + whiteboard/subagent/taskScopeSelector/workspace-tabs/session 身份待核（见 §8） |
| Modals.tsx | 37 | Lane-4 + 未抽取间隙实体（Ag/M6/mM/Go/R7/I2t/v$t/S4t/RemoteSyncMenuItemsInner） |

## §8 需要的 export（属主域外/未导出 → declare 保留，登记待办）

1. **RemoteDirectorySuggestInput** 的 `SuggestionInput` —— 属主未导出，RemoteWizard 保留 declare。
2. **SidebarLeaves**：p6（toErrorMessage）、aPt、f6、g6、TPt —— WebRemote 消费；其中 p6 经 bundle 核验与 FeedbackCenter MC 为不同实体，不得误接。
3. **Sidebar**：dPt、pPt。
4. **ImeComposition**：`usePlatformService`（RGS/Bots 消费）。
5. **SkillStore 候选**：whiteboard/subagent 相关实体身份待核（候选存在但 skillStore-BmeKHDBI 导出表证据不足）→ Composer 相关 declare 保留。
6. **Settings**：`useWorkspaceTabsStore`（BUSY 文件，其他批次编辑中）→ Composer declare 保留。

## §9 tsc 前后对照（域内 10 文件，基线 /tmp/tsc-baseline-domain.txt，终态 /tmp/tsc-s2d-final2.txt）

| 文件 | 基线 | 终态 | Δ | 备注 |
|---|---|---|---|---|
| SrcSharedA.tsx | 0 | 0 | 0 | |
| SrcSharedB.tsx | 2 | 2 | 0 | 既有错误，未触碰 |
| SkillStore.tsx | 0 | 0 | 0 | |
| RemoteWizard.tsx | 0 | 0 | 0 | 垫片后 0 错 |
| RemoteGapSegments.tsx | 0 | 0 | 0 | |
| WebRemote.tsx | 0 | 0 | 0 | |
| Bots.tsx | 19 | 16 | −3 | declare any 传播错随接线消解 |
| PaymentDeep.tsx | 34 | 29 | −5 | 同上；剩余为 Stripe vendored/间隙 any 传播，留待后续波次 |
| Composer.tsx | 18 | 17 | −1 | 2 条 SelectContent TS2322 签名文本因并行批扩展 Settings 原语 props 而变（同一既有错误）；useWorkspaceServices() TS2554 为并行批改 services.tsx 签名所致，基线已存在（经错误签名 comm-diff 核验） |
| Modals.tsx | 3 | 2 | −1 | |
| **合计** | **76** | **66** | **−10** | **零新增** |

注：其他并行批次会改动全项目总数，本表以域内 10 文件为准。

## §10 门禁

- **a. esbuild 逐文件**：`cd desktop/src/src && ./node_modules/.bin/esbuild modules/<file> --loader:.tsx=tsx --jsx=preserve --outfile=/dev/null` —— 10/10 通过，0 错。
- **b. tsc**：`./node_modules/.bin/tsc -p tsconfig.json` —— 域内 76 → 66，逐文件不增（§9）。
- **c. out/ md5**：`md5 -q desktop/src/out/renderer/assets/src-HCld2afU.js` = f5edd6a1207c6d20008204829dad3923 ✓；`styles-CdEGpc2x.js` = 48d71d4874b0868d61fd35a328bf6ad5 ✓。

## §11 异常与更正

1. **91 vs 90**：SrcSharedB §0 实数 91 条（账目 90），多出 `El` = CLAUDE_TO_GLM_MODEL_MAP；已一并接线。
2. **SrcSharedA §15 收敛**：原拟 50 符号，10 个已在 4658/5186/5706/5720 `export const` 链中导出（esbuild "Multiple exports with the same name" 检出），收敛为 40。
3. **Bots `REPLY_MODE_DEFAULTS`**：B5 账目误注为其他符号，实为 `DEFAULT_BOT_REPLY_MODE`，已按 bundle 实证更正。
4. **`ei`（taskWorkspaceKey）误归**：B5 记为 SidebarLeaves，bundle import 块（styles 617–780 区段 `c as ei`）实证属 SrcSharedB `webRemoteWorkspaceKey`，已更正。
5. **并行批干扰**：services.tsx 签名被并行批改为需 (workspacePath, preferredRemoteSessionId)，Composer 的 useWorkspaceServices() TS2554 属基线既有；Settings 原语 props 扩展仅改 2 条 TS2322 错误文本。均非本批引入。
6. **Composer 瞬时尖峰（18→60）自查**：曾删 createStore declare 而漏加 import，门禁前发现并修复（并入第 464 行 SkillStore import），终态 17。
