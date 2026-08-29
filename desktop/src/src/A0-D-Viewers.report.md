# A0-D-Viewers 批次报告（Stage A0 · declare 接线 + 类型收敛）

日期：2026-08-29
任务域（仅编辑这 8 个文件）：CodeViewer.tsx / MarkdownIntegration.tsx / GitReview.tsx / FileTreePanel.tsx / PreviewCards.tsx / PdfViewer.tsx / HighlightedCodeBlock.tsx / LazyPreviewViewers.ts

## 1. 总览

| 指标 | 前 | 后 |
|---|---|---|
| 域内跨模块 declare（任务口径） | 273 | 227（`^declare ` 行实测：37+42+57+45+33+9+1+3） |
| 域内 tsc 错误 | 159 | 1（仅剩 GitReview 4154，TopBar 属主，已登记） |
| declare → 真实 import 接线 | — | 56 条 |
| 误接/坏 import 修复 | — | logger×4 改 './logger'；normalizeDecodedSource / appendWebElementsToContent 退回 declare；ContextMenuItem 误接×3 文件退回 Lane-4 declare |
| declare 实体化（逐字填值） | — | 2（ABS_UNIX_REGEX / ABS_WIN_REGEX） |
| 新增 export（域内属主补出） | — | 20（FTP 9 / MI 10 / CV 1） |
| 需要的 export（域外登记） | — | 7 条 + 待实体化清单 |

门禁结果：
- a. esbuild 逐文件 0 错：8/8 通过（`--loader:.tsx=tsx --jsx=preserve`；LazyPreviewViewers 用 ts loader）。
- b. tsc 逐文件不增：全部下降或持平（见 §4）。
- c. out md5 不变：`desktop/src/out/renderer/assets/src-HCld2afU.js` = f5edd6a1207c6d20008204829dad3923；`styles-CdEGpc2x.js` = 48d71d4874b0868d61fd35a328bf6ad5（注：bundle 实际位于 desktop/src/out/，desktop/out/ 不存在）。

## 2. 逐文件接线清单

### 2.1 FileTreePanel.tsx（declare 47→45，tsc 23→0）
接线（declare→import）：
- `cn` → `import { cn } from './UtilsCn';` // 原 Z（AMBIGUOUS 裁决见 §6.1）
- `getFileMeta` → `import { resolveFileDisplayInfo as getFileMeta } from './ModalsLeaves';` // 原 zc（混淆名锚点：两侧头部均记 zc→resolveFileDisplayInfo 5150）
- `FileIconImage` → `import { FileIconImg as FileIconImage } from './ModalsLeaves';` // 原 Vc（锚点 Vc→FileIconImg 5196）

坏 import 修复：
- `logger`：'./SkillStore'（TS2459，SkillStore 的 logger 本身是未导出 declare）→ `import { t as logger } from './logger';`
- `ContextMenuItem`：移除自 LegacyDocEngineBModel 的 type-only interface 误接（TS2693×12）→ 恢复 Lane-4 组件 declare（参照逐字基准形状）。

新增 export（B5-06 改指清单）：
- `orderEditorsForFileManager`（GA）、`resolveAvailableEditors`（JA）、`useFileContextActions`（QA）
- 任务缓存助手五件：`DEFAULT_TASK_MEMBERSHIP`（iLt）、`sortTasksByRecency`（aLt）、`upsertTaskInWorkspaceCache`（oLt）、`cleanupDeletedTaskState`（sLt）、`registerWorkspaceTask`（cLt）——实现方=本文件，供 Conversation 批次接线
- `FileTreePanel` 组件本体（nLt）——顺带消解 Sidebar.tsx(191) TS2459

类型修复：
- 4 处 `usePlatform()` → `as unknown as PlatformService`（本地 interface 已存在）：消解 TS18046×6 + TS7006×2。

### 2.2 MarkdownIntegration.tsx（declare 45→42，tsc 76→0）
去误接（SrcSharedB 跨块碰撞假阳性，全部撤销）：`import { G, Ia, J, X, Z, ps } from './SrcSharedB'` 整行移除。

接线：
- `Z` → `import { cn as Z } from './UtilsCn';`
- `J` → `import { t as J } from './logger';`
- `ps` → `import { useServicesOptional as ps } from './services';`（services.tsx 原 ps 导出）+ 调用面 2 处 `as WorkspaceServicesLike | null`（RHe/MarkdownImage 均已有 `if (!services)` 守卫）
- `l` → `import { usePlatform as l } from './ImeComposition';`（styles @342 M=usePlatform）+ 2 处 `as unknown as PlatformServiceLike`
- `FileIcon` / `FOLDER_ICON_SRC` / `resolveFileMeta` → `import { FileIconImg as FileIcon, FOLDER_ICON_DATA_URI as FOLDER_ICON_SRC, resolveFileDisplayInfo as resolveFileMeta } from './ModalsLeaves';`（原 Vc/Fc/zc）
- `rememberLastEditorId` → 并入 './CodeViewer' import（本批新增导出，§2.3）

恢复 declare（前批误删后仅留注释）：
- `declare function G(): { intl: IntlLike };`（useIntlContext，属主 IntlProvider chunk 未实体化）
- `declare const X: ...ButtonHTMLAttributes & { size?; variant? }`（Button，Lane-4）
- `declare const Ia: ...{ title; side?; children? }`（Tooltip，Lane-4）
- `declare const ContextMenuItem: React.ComponentType<Record<string, unknown>>; // Sk`（LegacyDocEngineBModel 误接退回）

实体化（bundle 逐字）：
- `ABS_UNIX_REGEX = /^[a-zA-Z]:[\\/]/`（原 iae，styles 1925）、`ABS_WIN_REGEX = /^\\\\/`（原 aae，styles 1926）。名字语义倒置（UNIX 名为盘符形、WIN 名为 UNC 形）——按「不做语义改名」规则保留原名。

新增 export（供 PreviewCards/GitReview/CodeViewer 消费）：
- `isAbsolutePath`（Ko）、`decodeUriSafe`（qo）、`tableLayoutRoot`（kk）、`tableLayoutInsets`（TBe）、`measureRect`（Ak）、`sameRect`（jk）、`chatDockHeight`（Nk）、`backToBottomInset`（EBe）、`findVerticalScroller`（Pk）、`IMAGE_THUMBNAIL_CLASS`（Gk）

签名修复（域内实现 bug）：
- `tableNeedsStickyScrollbar`（kBe）：位参 `(root, table)` → 对象参 `({ root, table })`（bundle styles 49084 逐字 `function kBe({ root: e, table: t })`）；消解 PreviewCards 1005 TS2554。

类型修复：
- `childrenToText`：`children.props.children` → `(children.props as { children?: React.ReactNode }).children`（React 19 isValidElement props: unknown）
- `InstalledEditor`：加 `[key: string]: unknown`、`iconDataUrl` 改可选（与 FileTreePanel.InstalledEditor 互通；named interface 无索引签名不可赋给带索引签名目标）
- `remote.remoteTarget as { kind?: string } | null`（MI useRemoteWorkspaceInfo 返回 unknown）
- `<img src={editor.iconDataUrl as string | undefined}>`（FTP 索引签名 unknown 收窄）

保留：`QA` declare（原 useWorkspaceFileServices 51093，接口级，本文件无消费点；不与 FileTreePanel.useFileContextActions 混淆名冲突）。

### 2.3 CodeViewer.tsx（declare 50→37，tsc 24→0）
接线（14 条）：
- `cn` → './UtilsCn'
- `FileIconImg` → './ModalsLeaves'（Vc）
- `useResolvedTheme` → `import { resolveThemeMode as useResolvedTheme } from './Settings';`（原 xo；调用面 theme:string → ThemeMode 字面量联合 cast）
- `useResolvedEditor` → `import { resolveAvailableEditors as useResolvedEditor } from './FileTreePanel';`（JA）
- `useFileActions` → `import { useFileContextActions as useFileActions } from './FileTreePanel';`（QA 族；调用面 copyAbsolutePath/copyRelativePath 与 FTP 返回形兼容）
- `detectLanguage` / `mimeTypeOfPath` / `isPdfPath` / `isPptxPath` → './PreviewCards'（detectPreviewLanguage/imageMimeTypeOfPath/isPdfPreviewPath/isPptxPreviewPath，原 rA/iA/oA/sA）
- `isAbsolutePath` / `basename` / `relativePath` → './MarkdownIntegration'（Ko/Go/zA：isAbsolutePath、baseName、relativePathFromWorkspace）
- `usePlatformService` → `import { usePlatform as usePlatformService } from './ImeComposition';` + `as unknown as PlatformService`
- `createZustandStore` → `import { create as createZustandStore } from './SkillStore';`（原 Ae，SkillStore export 块含 create）

坏 import 修复：
- `logger`：'./SkillStore' → './logger'
- `normalizeDecodedSource`：'./SidePanel'（TS2459，SidePanel@942 未导出、域外）→ 退回 declare `declare function normalizeDecodedSource(source: CodeViewerSourceInput): DecodedCodeViewerSource | null;`，属主登记见 §5

移除死 declare：
- `PlainTextDiffPreview`（gut）：本文件无任何消费点；实体已在 ModalsLeaves 导出（GitReview 以 LightweightDiffPreview 别名消费）

新增 export：
- `rememberLastEditorId(editorId, storage = editorPreferenceStorage()): void { storage?.setItem(LAST_EDITOR_ID_KEY, editorId); }`（原 kA，styles 50904 逐字；供 MI rememberUsedEditorId 消费）

类型修复：
- `RemoteWorkspaceInfo.remoteTarget` 与 `PlatformService.openInEditor` 的 remoteTarget：`string | null` → `{ kind?: string } | null`（与 FTP/MI 的 remoteTarget 模型对齐；消解 1631/2155）
- `const remoteTarget = remoteInfo.remoteTarget as { kind?: string } | null;`
- `useWorkspaceServices(...) as unknown as WorkspaceServices`（BaseServices 索引签名 unknown；消解 fileService TS18046×12 + TS7006×7）
- `onOpenCodeViewer?.(diffSource as CodeViewerSourceInput)`（PreviewCards.CVS → 本文件 CVS，方向可比）
- `buildDiffPreviewSource(decoded as CodeViewerSourceInput, ...)`（named interface 索引签名规则）
- `InstalledEditor` 加索引签名（与 FTP 互通）

### 2.4 GitReview.tsx（declare 70→57，tsc 30→1）
接线（16 条）：
- `cn` → './UtilsCn'
- `usePlatformService` → ImeComposition.usePlatform + `as unknown as PlatformService`
- `createStore` → `import { create as createStore } from './SkillStore';`（BoundStoreHook 与本地 UseBoundStore 使用面兼容）
- `PopoverRoot` → `import { Popover as PopoverRoot } from './ImeComposition';`（见 §7.3 例外说明）
- `CommandItem` → './QuickPick'（AMBIGUOUS 裁决见 §6.5）
- `useSettingsSelector` → `import { useSettingsStore as useSettingsSelector } from './stores-core';`
- `resolveTheme` → Settings.resolveThemeMode（+ThemeMode 字面量 cast）
- `useWorkspaceRemoteInfo` → MarkdownIntegration.useRemoteWorkspaceInfo + 2 处 `as { isRemoteWorkspace: boolean; remoteTarget?: RemoteTarget }`
- `isAbsolutePath` / `toRelativePath` → MarkdownIntegration（Ko / relativePathFromWorkspace）
- `getPreferredEditorId` → CodeViewer.readLastEditorId（OA）
- `normalizeInstalledEditors` → FileTreePanel.orderEditorsForFileManager（GA）
- `extractErrorMessage` → './FeedbackCenter'（AMBIGUOUS 裁决见 §6.4）
- `LightweightDiffPreview` → ModalsLeaves.PlainTextDiffPreview（gut；data-git-plain-text-diff-preview 经 Record<string, unknown> 交叉透传）
- `countDiffLines` → SrcSharedB.countLineDiffChanges（bS；语义名导出，非单字母碰撞）

坏 import 修复：
- `logger` → './logger'
- `appendWebElementsToContent`：'./Composer'（TS2459，Composer@7411 未导出）→ 恢复 declare，登记 §5
- `ContextMenuItem`：LegacyDocEngineBModel 误接（TS2693×8）→ 恢复参照形状 Lane-4 declare

类型修复：
- 3 处 `useServices() as { gitService: GitService }`（本地 GitService interface 已按逐字基准存在；消解 gitService TS18046×8 + TS7031×5 + TS7006×3）
- 990 行 `buildLastTurnChangeSummary(null) ?? void 0 ?? null` → `?? null`（TS2881；bundle 24056 逐字即 `?? void 0 ?? null`，void 0 恒 undefined，语义等价，见 §6.8）
- `InstalledEditor` 加索引签名；`CodePreviewSettings` 加索引签名 + 选择器出口 `as CodePreviewSettings`（与 ModalsLeaves.CodePreviewSettings 互通）

剩余 1 错：4154 `popoverSide="left"` —— TopBar.GitBranchChipProps.popoverSide 仅收 "top"|"bottom"，域外属主，登记 §5。基线中的 3194/4161（TopBar GitSummary 类型）在会话期间因 TopBar 批次推进自然消解。

### 2.5 PreviewCards.tsx（declare 45→33，tsc 4→0）
接线（12 条）：
- `cn` → './UtilsCn'
- `Tooltip` → `import { InfoTooltip as Tooltip } from './UsageStatsUiParts';`（first-party 信息浮层件；调用面 798/831/2295 仅 title/side，与 InfoTooltipProps 完全兼容）
- `tableLayoutRoot/tableLayoutInsets/measureRect/sameRect/chatDockHeight/backToBottomInset/findVerticalScroller/IMAGE_THUMBNAIL_CLASS/isAbsolutePath/decodeUriSafe` → './MarkdownIntegration'（本批新增导出，§2.2）

坏 import 修复：`logger` → './logger'。

类型修复：
- `usePlatform() as unknown as PlatformService`（本地 interface 含 saveFile?；消解 1742/1770 TS2349）
- 1005 TS2554 经 MI kBe 签名修复被动消解（调用面本就是对象参）

### 2.6 PdfViewer.tsx（declare 10→9，tsc 1→0）
- `cn` → './UtilsCn'
- `pageViewportRef: React.RefObject<HTMLDivElement>` → `React.RefObject<HTMLDivElement | null>`（React 19 useRef(null) 类型；消解 427）
- 保留：Button、Icon×4（Lane-4）、PDFDataRangeTransport/GlobalWorkerOptions/PdfDocument/PdfPage（pdfjs vendored）

### 2.7 HighlightedCodeBlock.tsx（declare 3→1，tsc 1→0）
- `StreamdownOptionsContext`（Xb）→ `import { StreamdownContext as StreamdownOptionsContext } from './MarkdownContext';`
- `CodeHighlighterContext`（ty）→ `import { StreamdownPluginsContext as CodeHighlighterContext } from './MarkdownContext';`（.code: CodeHighlighterPlugin 与本地 CodeHighlighter 形状互赋，themes 均为 ShikiTheme=unknown，无需 cast）
- `useClassNames`：`return React.useContext(ClassNamesContext) as ClassNamesMerger;`（ClassNamesFn 参数更窄；213 行 LINE_NUMBER_CLASS 数组实参禁止收窄 merger 类型；方向可比，直接 as 成立）
- 与 highlightedCodeBlockBody.tsx 的既有接线（StreamdownContext/useCodeHighlighter）同口径

### 2.8 LazyPreviewViewers.ts（declare 3→3，tsc 0→0）
零改动。Q/Y/__vite__mapDeps 三条 declare 保留：wiring-plan 给出的目标是跨块名字碰撞；bundle 证据——styles@996 Q=React interop、@856 Y=preload-helper（`__vite__preloadHelper`）、chunk 自身头部 `__vite__mapDeps`。

## 3. 保留 declare 及原因（227 条，按类）

1. **Lane-4 vendored（S3 换 npm）**：全部 `Icon*`/`*Icon`、Button、Dialog*、DropdownMenu*、ContextMenu*（含新恢复的 ContextMenuItem×3 文件）、Collapsible*、Tooltip*（MI 的 Ia、GitReview 的 TooltipRoot/Trigger/Content）、useVirtualizer、SpinnerIcon、pdfjs 四件（PdfViewer）、DiffFilePairViewer/DiffPatchViewer（nze/rze，X09 diff 引擎）。
2. **域外属主未导出（登记 §5，保留 declare）**：normalizeDecodedSource（SidePanel@942）、appendWebElementsToContent（Composer@7411）、isMediaPath（pptxRendererPreviewEngine@132，MI 消费）。
3. **待实体化（无属主实现，横切/他族）**：
   - MI：useIntlContext（G）、mc（tab store 选择器）、isWorkspaceTabLike（oc）、formatRemoteTarget（yne）、isInAppBrowserHost（wA）、LANGUAGE_DISPLAY_KEYS、mermaid 五件、remarkMath/rehypeKatex、cjk 二件、shiki 四件（BUNDLED_LANGUAGE_ALIASES/SUPPORTED_LANGUAGE_IDS/createShikiHighlighter/FORGIVING_ONIG_ENGINE）、QA（接口级无消费）、summarizeSource（Uk）
   - CodeViewer：useIntlContext、uid（QV）、PlainCodeBlock（BO）、HighlightedCodeBlockWithComments（MO）、isPlainTextLanguage（NO）、patchToPlainTextLines（fg）、PatchPlainTextPreview（Oft）、base64ToArrayBuffer（no）、officeKindOfPath（ro）、resolvePathAgainst 相关与 LazyOffice×3
   - GitReview：joinPath（Jo）、resolveRemoteSessionKey、parsePatchIntoLines、detectFileType、shortcutLabel/shortcutMatches（keyboardShortcuts chunk）、任务路径钩子×3、Composer 族×5（appendSelectionsToContent/appendPptxElementsToContent/parseSelectionReferences/splitWebElementContexts/splitPptxElementReferences）
   - FileTreePanel：useIntlContext、useWorkspaceScopedServices（Oc）、parentDirectoryPath（sae）、pathToFileUrl（Yo）、拖拽助手×5（Composer 域）、任务态接口×9（F01 域）
   - PreviewCards：useIntlContext、tool 助手×6（og/cg/sg/Bh/Rh/Kh）、resolvePathAgainst（Jo）
   - PdfViewer/HighlightedCodeBlock：useIntlContext（PdfViewer 无；HCB 剩 ClassNamesMerger declare type）
4. **shadcn/radix 原语其余族**：Select*（GitReview 已真实 import 自 Settings，其余文件保留）、Dialog*、ScrollArea 等按域内各文件现状保留。

## 4. tsc 前后对照（逐文件）

基线口径：任务书给定基线（与本批次首次全量 tsc 实测一致）。注意 /tmp/tsc-baseline.txt 于 07:27 被并行批次覆写，本表不采用该文件被覆写后的内容。

| 文件 | 基线 | 完工后 | Δ |
|---|---|---|---|
| CodeViewer.tsx | 24 | 0 | −24 |
| MarkdownIntegration.tsx | 76 | 0 | −76 |
| GitReview.tsx | 30 | 1 | −29 |
| FileTreePanel.tsx | 23 | 0 | −23 |
| PreviewCards.tsx | 4 | 0 | −4 |
| PdfViewer.tsx | 1 | 0 | −1 |
| HighlightedCodeBlock.tsx | 1 | 0 | −1 |
| LazyPreviewViewers.ts | 0 | 0 | 0 |
| **合计** | **159** | **1** | **−158** |

剩余 1 条：`GitReview.tsx(4154) TS2322 "left" ↛ "bottom" | "top" | undefined` —— 属主 TopBar.tsx（域外、他批在编），登记 §5.4。
「待属主接线后消解」：无遗留——所有 declare-any 传播错均已由真实类型化导出或消费面收窄 cast 消解。

## 5. 需要的 export（域外属主，本批未编辑）

| # | 属主文件 | 符号 | 定义行 | 消费方 / 用途 |
|---|---|---|---|---|
| 1 | SidePanel.tsx | normalizeDecodedSource | 942 | CodeViewer（现保留 declare） |
| 2 | Composer.tsx | appendWebElementsToContent | 7411 | GitReview（现保留 declare） |
| 3 | Composer.tsx | nanoid | 5607 | CodeViewer uid（QV）接线前置 |
| 4 | TopBar.tsx | GitBranchChipProps.popoverSide | 2465 | 需放宽收录 "left"（GitReview 4154 唯一残留错） |
| 5 | UsageStatsUiParts.tsx | InfoTooltipProps（加 aria-pressed） | 924 | FileTreePanel Tooltip→InfoTooltip 接线前置（现按 Lane-4 保留 declare） |
| 6 | Settings.tsx | ThemeMode（type 导出） | 320 | 可去掉 CodeViewer/GitReview 的字面量联合 cast（非阻塞） |
| 7 | pptxRendererPreviewEngine.tsx | isMediaPath | 132 | MarkdownIntegration（现保留 declare） |

待实体化（无属主、横切层，登记备查）：Jo joinPath/resolvePathAgainst（styles 1952）、sae parentDirectoryPath、Yo pathToFileUrl、useIntlContext（IntlProvider-C321H7m8 chunk）、mc/pc tab store、oc/yne/wA、GitReview resolveRemoteSessionKey/parsePatchIntoLines/detectFileType/任务路径钩子×3/shortcut×2、Composer 族×5、MI summarizeSource（Uk）、CodeViewer uid/BO/MO/NO/fg/Oft/no/ro/LazyOffice×3、vendored mermaid/shiki/katex/cjk/LANGUAGE_DISPLAY_KEYS、F01 任务态×9、Composer 拖拽助手×5。

## 6. 歧义裁决（AMBIGUOUS / 形状冲突）

1. **cn（AMBIGUOUS SrcSharedB;UtilsCn）×5 文件** → 一律 UtilsCn。依据：styles chunk 导入块地面真相 `Z = cn`（t from utils-CEEH0K_K.js @901）；SrcSharedB 的单字母别名是 src chunk（src-HCld2afU.js）导出别名，对 styles 块为跨块碰撞假阳性（已逐一验证 SrcSharedB G=resolveFirstReadyProvider、J=listSessionModePresets、X=buildSessionSettingsViewModel、Z=OFFPEAK_IDLE_PLAN_ID、Ia=v4UserInputTextTestid、ps=fs，均与调用面不符）。
2. **FileIconImg/FileIcon（AMBIGUOUS ModalsLeaves;QuickPick）** → ModalsLeaves。依据：混淆名 Vc 锚点（ModalsLeaves 头部 Vc→FileIconImg 5196）+ 调用面 src/size/className。
3. **PlainTextDiffPreview（AMBIGUOUS GitReview;ModalsLeaves）** → ModalsLeaves（gut 实体 100459）。GitReview 的 PWt 是封装层非属主；GitReview 内 LightweightDiffPreview 亦指向同一实体。
4. **extractErrorMessage（AMBIGUOUS FeedbackCenter;SrcSharedB）** → FeedbackCenter@1064。依据：实现逐字剥 `Error:` 前缀，与 GitReview 注释「原 MC，js 37603；去 Error: 前缀」完全吻合。
5. **CommandItem（AMBIGUOUS QuickPick;SettingsPanelsCapability）** → QuickPick。依据：同文件 Command/CommandList/CommandShortcut 已由前批接自 QuickPick，同一 cmdk 族必须同源；调用面 value/disabled/onSelect/data-testid 与 cmdk Item 吻合。
6. **usePlatformService / l（UNRESOLVED/AMBIGUOUS）→ ImeComposition.usePlatform**（MI/FTP/CV/GR 四文件同裁决）。依据：styles @342 `M`=usePlatform；调用面 getInstalledEditors/openInEditor/openInFileManager/saveFile 与平台服务面吻合；消费面以本地 PlatformService* interface + `as unknown as` 收窄（类型化、发射等价）。
7. **ABS_UNIX_REGEX/ABS_WIN_REGEX** → 实体化逐字值（styles 1925/1926）。名字语义倒置（「UNIX」为盘符形、「WIN」为 UNC 形）——遵守「不做语义改名」，注释说明。
8. **GitReview 990 `?? void 0 ?? null`** → `?? null`。bundle 24056 逐字即 `Hhe(null) ?? void 0 ?? null`；TS2881 因 `void 0` 类型化为 void（恒非 nullish 判定），`?? null` 语义等价（`x ?? undefined ?? null ≡ x ?? null`）。
9. **PopoverRoot / Tooltip 的 Lane-4 边界**：FileTreePanel 与 GitReview 的 Tooltip* 按 Lane-4 保留；PreviewCards 的 Tooltip 接 InfoTooltip（first-party 件、已导出、调用面全兼容）；GitReview PopoverRoot 接 ImeComposition.Popover——因同文件 PopoverAnchor/PopoverContent/PopoverTrigger 已（前批）接自 ImeComposition，root 若留 declare 重建时 radix 上下文断裂。见 §7.3。

## 7. 异常

1. **/tmp/tsc-baseline.txt 被并行批次覆写**（07:27，334194B→286757B，159 口径→1175 口径）。本报告基线采用任务书数字（与本批次首次实测一致），不受影响。
2. **前批 SrcSharedB 误接**：MI 的 Z/G/J/X/Ia/ps 全部接到 SrcSharedB 单字母别名（跨块碰撞假阳性），是 MI 76 错的主因；本批全部去接线并恢复 G/X/Ia declare。
3. **前批 ContextMenuItem 误接**：FTP/GR/MI 自 LegacyDocEngineBModel 导入 type-only interface 当组件值用（TS2693×26）；本批恢复参照逐字基准的 Lane-4 组件 declare。
4. **MI 的 QA declare 无消费点**（原 useWorkspaceFileServices 51093，接口级）：保留不接——若接 FileTreePanel.useFileContextActions 会与现存 declare 标识符冲突，且无调用面支撑。
5. **CodeViewer PlainTextDiffPreview declare 为死声明**（无消费点）：移除；实体在 ModalsLeaves 导出，GitReview 以别名消费。
6. **GitReview 基线错 3194/4161（TopBar GitSummary）** 在会话期间因 TopBar 批次推进自然消解，非本批动作；仅剩 4154（popoverSide）。
7. **门禁 c 路径**：任务书写作 desktop/out/，实际 bundle 位于 desktop/src/out/renderer/assets/（desktop/out/ 不存在）；两 md5 在真实路径验证一致。
8. **并行批次影响**：全项目错误数波动（他批文件），域外涉及本批导出面的错误经核查均为基线已有（Conversation/ConversationLeaves 的 CodePreviewSettings、SidePanel/WorkspaceShell 的 OpenCodeViewerFn 等），非本批引入；本批新增导出均为加法操作。

## 8. 完工汇报数字

- 接线数：56 条 declare → 真实 import（另修复坏 import 4 处、退回误接 5 处）
- 保留数：227 条 declare（Lane-4 vendored / 域外未导出 / 待实体化）
- 错误数变化：159 → 1（−158；残留 1 条属主在 TopBar，已登记）
- 需要的 export：7 条（另有待实体化清单 §5）
