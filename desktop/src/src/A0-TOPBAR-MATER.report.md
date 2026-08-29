# A0-TOPBAR-MATER：TopBar 双桩实体化（S4 附带件）

范围：仅 `modules/TopBar.tsx`（+217/−18 行）。未新建文件（决定见 §3）。
基线：/tmp/tsc-now17.txt（项目恰 2 错，均 TopBar 桩）。前报：A0-CLEANUP4.report.md §5-①/②、A0-S4-PLAN.md §附带实体化。

**锚点勘误**：任务书与历史注释把锚点挂在 "src-HCld2afU.js"，实测该 chunk 仅 10,069 行；
`js N` / `jsx N` 锚点真实落在主渲染 bundle `out/renderer/assets/styles-CdEGpc2x.js`（213,979 行）
与其重建版 `src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行）。
jsx 108829 = POt 渲染尾 `<COt …/>` 调用行（19/20-prop 面证据行），与任务书描述吻合。

## §1 桩①：UpdateDialog 控制器（POt → UpdateStatusDialogController）

### bundle 证据（转录源）
- `styles-CdEGpc2x.js` **129142–129312** `function POt({platform, version, updateState, open, onOpenChange, edgeToEdge=!1, showOverlay=!0})`；
  重建 jsx **108678–108830** 同体，**jsx 108829** 为 `COt` 完整调用面（20 prop）。
- 辅助函数同 chunk：`TOt` 129064 / `EOt` 129071 / `DOt` 129083 / `OOt` 129106 / `kOt` 129113 /
  `AOt` 129125 / `jOt` 129128 / `MOt` 129132 / `NOt` 129139；`U2`(useConfirmDialog) 123510；`COt` 128812。
- COt 解构面（js 128812–128831）= 18 prop；POt 调用面（jsx 108829）= 20 prop，
  多出 `localizedUpdateReleaseNotes` / `onOpenReleaseNotesExternalUrl` 两 **死 prop**
  （全 bundle 仅 POt 调用点出现，COt 不消费；Modals.UpdateStatusDialog 型面亦未声明）。

### 实现（TopBar.tsx 现状）
- `UpdateStatusDialogController` 全量转录 POt：
  - 偏好拉取 `getAutoUpdatePreferences` + `onSettingsChanged` 订阅（带 cancelled 守卫）；
  - 四类异步动作 `download/cancel/skip/restart`，各带 `pendingActionRef`+state 双锁（`markPendingAction`，原 `g`），
    失败即清锁重抛；`skip` 成功后 `onOpenChange(false)`；`restart` 前
    `getDesktopSessionActivity` 计数 >0 时走 `useConfirmDialog`（updateReady.confirm.* 四 key）确认；
  - 清锁 effect：`isPendingUpdateActionResolved`（原 OOt）即时清 / restart 特判 / 1.5s 超时清除；
  - `!displayVersion && updateState !== null → onOpenChange(false)` 相位同步 effect；
  - 发行说明 LRU（8 条）缓存 + `locale:version` 键；下载中相位冻结
    （`viewModel.displayVersion || pendingAction === null ? viewModel : lastViewModelRef.current ?? viewModel`，原 `v` ref）；
  - 渲染透传 Modals.`UpdateStatusDialog` 全 18 声明 prop（含 `progressValue`、`skippableVersion`、
    `releaseDateLabel`（`updateDialog.releaseDate` 插值）、`edgeToEdge`/`showOverlay` 默认参透传）。
- 配套补全：
  - `resolveUpdateViewModel`（DOt）扩至全形：+`progressValue`（新 `downloadProgressValue`，原 jOt 夹取 0–100）、
    +`skippableVersion`、+`updateChannel`；
  - 新 `isPendingUpdateActionResolved`（原 OOt）；
  - `useConfirmDialog` 本地 `declare` 删除 → `import { …, useConfirmDialog } from './Modals'`
    （U2 属主，Modals.tsx 5190；调用面 `{title, description, confirmLabel, cancelLabel}` 兼容
    `Omit<ConfirmDialogRequest,"resolve">`）。

### 与 bundle 的受控偏差（登记）
1. 死 prop 不透传：`localizedUpdateReleaseNotes`/`onOpenReleaseNotesExternalUrl` 及其死局部量
   （bundle `j`/`M`）省略——COt 不消费，透传将触发 excess-prop 新错；行为零差异。
2. 可选 IPC 方法（`downloadUpdate`/`cancelUpdateDownload`/`skipUpdateVersion`/`quitAndInstallUpdate`）
   以 `?.()` 调用：重建 `PlatformService` 型面为可选，`rendererEntry.tsx` 541–555 接线恒带
   `?? Promise.resolve()` 兜底，运行期语义等价 bundle 直调。
3. `intl` 仍走本文件局部 `useIntlContext` declare（既有脚手架，14 处消费，非本批次范围）；
   其 `IntlShape` 与 Modals 侧 `ZCodeIntl` 结构同形，赋值兼容。

## §2 桩②：buildSummaryPanelModel 的 git 投影（Qct）

### bundle 证据（转录源）
- `styles-CdEGpc2x.js` **98128–98144** `function Qct({gitSummary, gitDirtyFileCount=0, gitWorktreeChangeSummary})`；
  重建 jsx **85059–85080** 逐行同体。两道 null 门：
  `!isGitAvailable || !isRepository → null`；`added + removed <= 0 → null`。
  返回 8 字段 `{branchName, headRefType, dirtyFileCount, added, removed, ahead, behind, isClean}`，
  其中 `isClean = !isDirty && dirtyFileCount===0 && added===0 && removed===0 && ahead===0`（束内恒假，逐字保留）。
- 消费面 `SummaryPanelGitModel`（GitReview.tsx 4034）= `{added, removed, dirtyFileCount}`，投影返回值结构超集兼容。

### 实现（TopBar.tsx 现状）
- 新 `buildSummaryPanelGitModel`（B5 语义名，随 `buildSummaryPanelModel` 族）逐行转录 Qct；
- `buildSummaryPanelModel` 内 `const git = args.gitSummary?.isRepository ? …` 桩行替换为
  `buildSummaryPanelGitModel({ gitSummary, gitDirtyFileCount, gitWorktreeChangeSummary })` 全参透传（原 `Qct(e)`）。
- 型桥接（唯一受控偏差）：公共面 `gitWorktreeChangeSummary` 保持 `unknown`
  （Conversation.tsx 7056/7380/7587 以 unknown 直传，收窄公共型将给他文件引入新错），
  投影入口单点具型桥接 `as { added?: number; removed?: number } | null | undefined`
  （与 WorkspaceShell.tsx 1958 属主型同形；非 `as any`/`as unknown as`，规则允许）。
  两侧类型（GitSummary / SummaryPanelGitModel）未动，符 A0-CLEANUP4 预判。

## §3 新建文件决定
**不新建**。POt 与 TopBar 同属主渲染 chunk 且控制器历史映射即在 TopBar；
COt 呈现层属主已在 `modules/Modals.tsx`（UpdateStatusDialog，364 行起），经真实 import 消费，无需 components/ 新件。

## §4 门禁结果
| 门禁 | 结果 |
|---|---|
| a. esbuild TopBar.tsx | ✅ `--loader:.tsx=tsx --jsx=automatic` 0 错（GATE_A_OK） |
| b. tsc -p tsconfig.json --noEmit | ✅ exit 0，**项目总错 0**；TopBar 双错（884 TS2740 / 2958 TS2322）消失，无文件新增错。中途快照曾见 I18n.tsx 2 错（并发批次在编，终态已消）与本批次 1 处 import 笔误（canOpenRemoteSessionSourceCheck 截断，已修） |
| c. out/ md5 | ✅ `f5edd6a1207c6d20008204829dad3923`（src-HCld2afU.js）/ `48d71d4874b0868d61fd35a328bf6ad5`（styles-CdEGpc2x.js），与基线逐字一致 |
| d. git status 范围 | ✅ 本批次仅 `desktop/src/src/modules/TopBar.tsx`（+本报告）。`I18n.tsx`/`intlProvider.tsx`/`lib/i18n/` = 并发 I18n 批次；`web/`（仅 node_modules，mtime 2026-08-23）为既有未跟踪目录，非本批次所建。未 commit |

抑制面核查：TopBar.tsx 全文无 `@ts-expect-error`/`@ts-ignore`/`as any`/`as unknown as`（grep 0 命中）；
唯一新增断言为 §2 具型桥接 `as {…} | null | undefined`。
