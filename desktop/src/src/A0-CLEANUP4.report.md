# A0-CLEANUP4.report.md — A0 收尾接线 pass 4（final convergence）

日期：2026-08-29
基线：44 errors（快照 `/tmp/tsc-now11.txt`）→ **终值 2 errors（−42）**
抑制纪律：零新增 `@ts-expect-error` / `@ts-ignore` / `as any` / `as unknown as`；并**删除** 3 处 pass-3 遗留 `as` 垫片（ConversationLeaves 2111/2329、Conversation 3196）。
检查点轨迹：44 → 39 → 37 → 32 → 23 → 21 → 10 → **2**。
残留 2 条均属 S4（未重建层本体转录），类型面已就绪，见 §5。

---

## §1 逐错处置（基线 44 条）

锚点约定：`js N` = `out/renderer/assets/src-HCld2afU.js` 行号；`jsx N` = `out/renderer/assets/styles-CdEGpc2x.js` 行号（混淆束）；ground-truth 指 `src-reconstructed/renderer/assets/*.jsx` 反混淆重排本，按符号/内容定位。

### Home.tsx（7 → 0）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 922,18 / 938,32 | `OffPeakTaskService.list()` 返回 `OffPeakTask[]` ↛ `OffPeakTaskSummary[]`（缺 `id`） | **fixed**：Home 本地 `OffPeakTaskSummary` 重对齐为 `{ offPeakTaskId: string; prompt: string; title?: string }`——bundle js 134720/134426 消费面 `offPeakTaskId` 恒有值、`title` 可选；原 `id`/`title` 必填为重建偏差 |
| 922,38 | `CodingPlanSubscriptionService` 缺 `getOffPeakClientConfig` | **fixed**：属主 StoresDeep `codingPlanSubscriptionService` 具型 `getOffPeakClientConfig(opts: { forceRefresh: boolean }): Promise<OffPeakGrayConfig \| null>` + 可调用索引签名兜底（bundle js 91441 bX.initialize 消费） |
| 1373,11 | `onConnectRemote` 签名漂移 | **fixed**：收 RemoteWizard 属主面具型 `(target: RemoteTarget, requestId: string) => Promise<string \| null>`（bundle a4 js 128776–128786 纯透传 pOt）；RemoteWizard 导出 `RemoteTarget` |
| 1374,11 | `onSelectRemoteProject` 签名漂移 | **fixed**：`(sessionId, path, localWorkspacePath?) => Promise<void>`；RemoteWizard `onSelectProject` 第三参同步收可选（a4 js 128782 可传 undefined；实际处理方 selectRemoteProject，OnboardingLoginLeaves js 209393 域，第三参即可选） |
| 1375,11 | `onCancelRemoteProject` 返回 `void \| Promise<void>` | **fixed**：收 `(sessionId: string) => Promise<void>`（同 a4 透传面） |
| 1376,11 | `string \| undefined` ↛ `string` | **fixed**：由上条 `localWorkspacePath?` 可选化覆盖 |

连带（非基线）：stores-core `OffPeakCreateResult` 改判别联合，与 Home bX 本地族双向对齐（bundle js 91520–91544：ok 分支透传、失败分支 `errorCategory`/`errorCode`/`failureStage` 全字段读取；stores-tasks transportFailure 字面量满足失败分支）。

### PaymentDeep.tsx（6 → 0）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 759,9 | `onCloseAutoFocus` 不在 SelectContent 型面 | **fixed**：属主 Settings.tsx `RadixSelectContent` declare += `onCloseAutoFocus?: (event: Event) => void`，`SelectContent` 包装器同步 +=（radix 原生 prop，`{...rest}` 透传） |
| 1638,7 | TS2871 表达式恒 nullish | **fixed**：`?? null ?? null` → `?? null`（bundle jsx 68820 逐字核对，重复项幂等删除） |
| 11253,7 | `normalizedValue` 不在旧参数型 | **fixed**：改调 `resolveModelTriggerLabelParts`（SettingsLeaves nWe 转录，见下） |
| 11409,40 / 11410,46 / 11411,45 | `fullLabel`/`providerPrefix`/`modelLabel` 不在 `string` | **fixed**：同上——nWe 返回对象 `{ fullLabel, providerPrefix?, modelLabel? }`，旧声明误收 `string` |

属主侧转录（SettingsLeaves，nWe 链，ground-truth jsx 48436–48452）：`canonicalProviderIdOf` declare（原 dr，src chunk Jx 9036/Wx 9025，待 S4 本体）→ `composeProviderModelLabel`（原 rN）→ `resolveModelFullLabel`（原 iN）→ `export resolveModelTriggerLabelParts`（原 nWe）。

### SidePanel.tsx（9 → 0）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 3234,39 / 3432,39 | `SessionHandle` 缺 `store` | **fixed**：`SessionHandle = { store: SessionStoreHandle; release(): void }`（bundle js 40347 acquire 返回 `{store, release}`；k0 js 118692 读 `handle.store`）；`SessionStoreHandle` 自 Conversation 导出引入，本地 SessionSnapshot 镜像删除 |
| 3267,66 / 3267,87 | `item` 为 unknown / ↛ `SubagentDirectoryItem` | **fixed**：导出 `SubagentListResponse`（items 具型）；Conversation 新增 `SubagentRunningSnapshot`（rke schema js 33140），`SessionSnapshot.subagents.running` 收其数组 |
| 3356,9 | `(req: SubagentOpenRequest) => void` ↛ `(session: unknown) => void` | **fixed**：unknown 垫片删除，`onOpenSubagentSession` 具型 `SubagentOpenRequest` |
| 3455,9 | `(path: string)` ↛ `(link: FileLinkModel)` | **fixed**：FileLinkModel 族收敛，见 §2 |
| 4316,29 | `CodeViewerSource` ↛ `CodeViewerSourceInput` | **fixed**：CodeViewer 属主 `CodeViewerPanelProps` += `onOpenCodeViewer?: (source: DiffPreviewFileSource) => void`；PreviewCards 导出 `DiffPreviewFileSource`（YBe 返回面，js 50348–50365）。修复后暴露被其掩盖的 `onClose` 透传：ground-truth jsx 147739 调用面传 `onClose: C`、tHt 本体（jsx 133444）解构不消费 → `onClose?: (tabId: string) => void` 具型 |
| 4330,29 | `GitState` 缺 `GitPaneState` 9 成员 | **fixed**：占位 `interface GitState {[key:string]:unknown}` 删除，prop 收 GitReview 属主 `GitPaneState` |
| 4354,29 | `BaseServices` 缺 `terminalService` | **fixed**：`BaseServices` += `terminalService: TerminalService`（TerminalPane 导出接口） |

连带（非基线）：`isWindowsDesktop?: boolean` 收可选——bundle 调用面 Er jsx 149076 省略该 prop，xqt jsx 147333 解构后传 bUt（缺省 false）。

### TopBar.tsx（7 → 2，修 5 缓 2）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 881,6（现 879） | UpdateDialog 缺 17 prop | **deferred → S4**，见 §5-① |
| 2148,52 / 2153,55 / 2182,59 / 2185,56 | `TaskMeta` ↛ `PinnedTask`/`TimelineTask`（缺 `workspacePath`） | **fixed**：本地 `TaskMeta` += `workspacePath: string`——bundle e_e 返回面恒含 workspacePath（store 实体 + Pge 会话回退，js 24501/24737/24794） |
| 2954,34（现 2953） | `GitSummary` ↛ `SummaryPanelGitModel` | **deferred → S4**，见 §5-② |
| 2954,48 | 双 `GitSummary` 族互斥（缺 workspacePath/repoRoot 等 8 成员） | **fixed**：本地 4 字段镜像删除，转手导出 GitReview 属主 `GitSummary`（原 Yhe 缺省形 12 字段；运行期值恒为 useGitState 全形，nge→a4/ConversationSummaryAside/mlt 链路实证） |

连带（非基线）：`ConversationSummaryAsideProps.onOpenSubagentSession` 与 `SummaryAgentsSection` declare 由 `(sessionId: string)` 收 `(request: SubagentOpenRequest)`——bundle Dlt js 98874 构造并传递请求对象（预防 SidePanel 接线级联）。

### Sidebar.tsx（4 → 0）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 4431,21 | 缺 `listWorkspaces`（WebRemoteSwitcher） | **fixed**：prop 收属主型 `WebRemoteSwitcher \| null`（SidebarLeaves 导出）；双族桥接送 `WebRemoteWorkspace.kind` 收必填（`"local" \| "remote" \| string`），方法语法双变覆盖返回面 |
| 4449,21 | `onWebRemoteTaskOpen` 参数面过宽 | **fixed**：`(info: { crossWorkspace: boolean }) => void`（jsx 116823/148809；SidebarLeaves 3417 消费面） |
| 4450,21 | `onWebRemoteTaskSwitchingChange` boolean↔string | **fixed**：`(key: string \| null) => void`（jsx 148809；SidebarLeaves 3435） |
| 4553,45 | 双 `TaskMeta` 族 `status` 必选↔可选 | **fixed**：本地 `TaskMeta.status?: string` 收可选 |

### WorkspaceShell.tsx（3 → 0）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 3074,7 | `zcodeAgentService` 缺 `listSessionSubagents` | **fixed**：`WorkspaceServices.zcodeAgentService` += `listSessionSubagents(req)` 具型（jsx 146810 typeof-guarded 调用）。级联暴露并修复：`zcodeSessionService` 具型 `closeSession`（jsx 118609）；`terminalService: TerminalService`（rendererEntry js 335）；SidePanel `isWindowsDesktop?`（见上） |
| 3114,7 / 3608,29 | `handleOpenFileLink(link)` ↛ `(path: string) => void` | **fixed**：FileLinkModel 族收敛，见 §2 |

连带（非基线）：`webRemoteTaskSwitching` state 收 `string \| null \| false`、handler 收 `(switching: string \| null)`（jsx 148541/148814）；`findWorkspaceTabByPath(path, identity?: string \| null, remoteSessionId?: string \| null)` null 容忍。

### UsageStatsUiParts.tsx（3 → 0）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 964,33 / 976,13 / 976,39 | cloneElement children 为 unknown（React 19 默认 props=unknown） | **fixed**：新增 `InfoTooltipCloneProps { className?: string; ref?: React.Ref<HTMLSpanElement> }`，3 处 cast 收 `children as React.ReactElement<InfoTooltipCloneProps>`——具型泛参替代 unknown，非抑制 |

### SrcSharedB.tsx（2 → 0）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 445,7 | TS2403 `process` 必须为 `Process` | **fixed**：本地 `declare global { var process: any }` 删除（tombstone 注释）。全局 `process: Process` 来自**父目录** `desktop/src/node_modules/@types/node`（node 解析上行；TS compiler API 探针实证）——S5 备忘见 §6 |
| 866,162 | `string \| undefined` ↛ `string` 返回 | **fixed**：`resolveProviderApiFormat(e: any): string \| undefined`——原 Cu defaultKind 分支透传 uu()，未知 kind 返回 undefined（src chunk 5229/5125）。诊断备注：any 参函数体内三元真支收窄字面量、假支 `string \| undefined` 触发，属真实型面而非抑制场景 |

### SidebarLeaves.tsx（1 → 0）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 1527,28 | `ZCodeTaskService` 缺 `unarchiveTask`/`deleteTask` | **fixed**：属主 stores-tasks `ZCodeTaskService` += 两方法（jsx 122398/122435/122730/122770 消费面） |

### MarkdownMermaid.tsx（1 → 0）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 186,26 | `RefObject<HTMLDivElement \| null>` ↛ `RefObject<HTMLDivElement>` | **fixed**：`useLazyRender` 返回型 `containerRef: React.RefObject<HTMLDivElement \| null>`（React 19 `useRef<T>(null)` 实型） |

### MarkdownElements.tsx（1 → 0）

| 基线位置 | 错误 | 处置 |
|---|---|---|
| 703,89 | cloneElement `data-block` 不在 `Partial<unknown>` | **fixed**：cast 收 `React.ReactElement<{ "data-block"?: string }>`（具型泛参，同 UsageStatsUiParts 手法） |

---

## §2 FileLinkModel 族收敛（跨文件）

链中段 11 处 `onOpenFileLink?: (path: string) => void` 声明（ConversationLeaves 6、Conversation 6 处消费/声明、SidePanel 5）统一为 `(link: FileLinkModel) => void`；ConversationLeaves 2111/2329 与 Conversation 3196 共 3 处 `as` 垫片删除，改纯透传 `onOpenFileLink={props.onOpenFileLink}`。链首 WorkspaceShell `handleOpenFileLink` 参数收 `FileLinkModel` 后，体内下沉面同步 null 容忍：本地 `CodeViewerSource` 工作区三元组放宽 `string \| null`、`findWorkspaceTabByPath` 二/三参收 `?: string \| null`（透传型 + `!identity ||` 真值检查，语义不变）。

---

## §3 编辑文件清单（22）

基线有错（11）：Home、PaymentDeep、SidePanel、TopBar、Sidebar、WorkspaceShell、UsageStatsUiParts、SrcSharedB、SidebarLeaves、MarkdownMermaid、MarkdownElements。
属主/级联（11，错数恒 0）：Conversation、ConversationLeaves、CodeViewer、PreviewCards、Settings、SettingsLeaves、TerminalPane、RemoteWizard、StoresDeep、stores-core、stores-tasks。

---

## §4 门检结果

**a. esbuild（22/22 通过）**
`./node_modules/.bin/esbuild modules/<f> --loader:.tsx=tsx --jsx=preserve --outfile=/dev/null` 对 §3 全部 22 文件逐一执行，0 失败。

**b. tsc 总量与逐文件差量（基线 44）**

| 文件 | 基线 | 终值 | Δ |
|---|---|---|---|
| SidePanel.tsx | 9 | 0 | −9 |
| TopBar.tsx | 7 | 2 | −5 |
| Home.tsx | 7 | 0 | −7 |
| PaymentDeep.tsx | 6 | 0 | −6 |
| Sidebar.tsx | 4 | 0 | −4 |
| WorkspaceShell.tsx | 3 | 0 | −3 |
| UsageStatsUiParts.tsx | 3 | 0 | −3 |
| SrcSharedB.tsx | 2 | 0 | −2 |
| SidebarLeaves.tsx | 1 | 0 | −1 |
| MarkdownMermaid.tsx | 1 | 0 | −1 |
| MarkdownElements.tsx | 1 | 0 | −1 |
| 其余 11 编辑文件 | 0 | 0 | 0 |
| **合计** | **44** | **2** | **−42** |

无文件错数上升；终检 `./node_modules/.bin/tsc --noEmit` 输出仅 §5 两条。

**c. ground-truth 束完整性**
`md5 -q desktop/src/out/renderer/assets/src-HCld2afU.js desktop/src/out/renderer/assets/styles-CdEGpc2x.js`
= `f5edd6a1207c6d20008204829dad3923` / `48d71d4874b0868d61fd35a328bf6ad5` ✓（与任务给定值一致）

**d. 改动范围**
`git status --porcelain | grep -v '^??'` → 22 条 ` M`，全部位于 `desktop/src/src/modules/` 下（清单见 §3）。未触碰 A0-PROGRESS.md / A0-CLEANUP-WORKLIST.md / src-reconstructed/ / out/；未 commit。

**抑制审计**
`git diff -- desktop/src/src/modules | grep -E '^\+' | grep -cE '@ts-expect-error|@ts-ignore|as any|as unknown as'` = **0**；另删除 3 处既有 `as` 垫片（§2）。

---

## §5 残留错误（2 条，均属 S4）

两条均位于 TopBar.tsx，类型面已全部就绪，仅待未重建函数**本体**转录。

### ① TopBar.tsx(879,6) — UpdateDialog 桩体（POt → COt）

```
error TS2740: Type '{ open: boolean; phase: "downloading" | "downloaded" | "before-download";
displayVersion: string; progressLabel: string | null; onOpenChange: (open: boolean) => void; }'
is missing the following properties from type '{ displayVersion: string; edgeToEdge?: boolean;
intl: ZCodeIntl; isUpdateActionPending: boolean; autoDownloadAndInstallUpdates: boolean;
onAutoDownloadAndInstallUpdatesChange: (v: boolean) => void; ... 11 more ...;
skippableVersion?: string | ... }': intl, isUpdateActionPending,
autoDownloadAndInstallUpdates, onAutoDownloadAndInstallUpdatesChange, and 6 more.
```

现状：UpdateDialog（原 POt）为 5-prop 桩体；其属主型面（19 prop）已按消费面定型。
ground truth：jsx 108829 处 COt 被以完整 19-prop 面调用（intl、isUpdateActionPending、autoDownloadAndInstallUpdates 等全量传入）。
归属：**S4** —— 需转录 COt 本体（更新检查/下载/安装状态机）；桩体补齐即消。

### ② TopBar.tsx(2953,34) — buildSummaryPanelModel 的 git 投影（Qct）

```
error TS2322: Type '{ git: GitSummary | null; goal: SummaryGoal | null; ... hasContent: boolean; }'
is not assignable to type '{ git?: SummaryPanelGitModel | null | undefined; }'.
  Types of property 'git' are incompatible.
    Type 'GitSummary | null' is not assignable to type 'SummaryPanelGitModel | null | undefined'.
      Type 'GitSummary' is missing the following properties from type 'SummaryPanelGitModel':
      added, removed, dirtyFileCount
```

现状：`SummaryPanelGitModel`（投影目标）已具型 `{ branchName, headRefType, dirtyFileCount, added, removed, ahead, behind, isClean }`；`GitSummary` 已收敛至 GitReview 属主 12 字段全形（§1 TopBar 2954,48）。缺的是投影函数本体。
ground truth：jsx 85059–85080，Qct 投影：`{ gitSummary, gitDirtyFileCount, gitWorktreeChangeSummary }` → `SummaryPanelGitModel`，含两道门：`!isGitAvailable || !isRepository → null`；`added + removed <= 0 → null`。
归属：**S4** —— 转录 Qct 本体即消；两侧类型无需再动。

---

## §6 S5 备忘

1. **SettingsLeaves.canonicalProviderIdOf** 现为 declare（原 dr，src chunk Jx 9036/Wx 9025）——待 provider-catalog 层（Hx/Wx）重建后接本体。
2. **`desktop/src/node_modules/@types/node`**（src 目录之父级）是全局 `process: Process` 的来源。若 S3（vendored→npm）移除该包，SrcSharedB 5795/6393 的 `process` 引用需补**具型**本地 declare（不得 `any`，避免复发 TS2403）。
3. **WebRemote 双 TaskMeta 族未完全合并**（本 pass 仅以 `status?` 可选化 + `kind` 必填化 + 方法双变桥接打通赋值面）。若 S5 合并：方向为收紧 `WebRemote.TaskMeta.title` 至必填（全部消费点已有 `|| untitled` 守护，收紧安全）。
4. 残留 2 条（§5）随 S4 本体转录自然消除，无需独立 pass。
