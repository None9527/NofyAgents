// A0-S4-4c: 自 modules/TopBar.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/shell/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * TopBar.tsx — ZCode 3.7.6 顶栏 + 会话头 组件族（解混淆重建 · pilot）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，规格文档行号以它为准）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  组件族主体：
 *   BOt  → TopBarOverlay              顶栏浮层 (129516 / 108974)
 *   o4   → TopBarIconButton          顶栏通用图标按钮+tooltip (129479 / 108952)
 *   LOt  → UpdateIndicator           更新指示器（下载中/可更新/已下载胶囊）(129385 / 108869)
 *   IOt  → updatePillResponsiveClasses 更新胶囊按平台展开的容器查询类 (129354 / 108851)
 *   FOt  → ReleaseNotesPopover       发行说明弹层 (129296 / 108831)
 *   POt  → UpdateStatusDialogController 更新对话框控制器（下载/跳过/重启安装）(129142 / 108678)
 *   COt  → UpdateStatusDialog        更新对话框呈现层（属主 Modals.tsx，本文件真实 import 调用）(128812 / 108390)
 *   DOt  → resolveUpdateViewModel    更新状态 → 视图模型 (129083 / 108630)
 *   TOt  → pickLocalizedReleaseNotes (129064 / 108612)
 *   EOt  → formatReleaseDate         (129071 / 108620)
 *   kOt  → downloadProgressLabel     (129113 / 108657)
 *   NOt  → formatMegabytes           (129139 / 108680)
 *   c4   → windowsCaptionInsetStyle  env(titlebar-area-*) 计算右侧原生控件宽度 (129509 / 108967)
 *   s4   → WINDOWS_CAPTION_RIGHT_INSET_VAR (129507 / 108965)
 *   zOt  → WINDOWS_CAPTION_BUTTON_CLASS   (129515 / 108973)
 *   S6   → WindowsCaptionMenu        Win/Linux 标题栏 ⌄ 应用菜单 (141854 / 117848)
 *   U6   → HelpMenu                  帮助菜单（反馈/建议/社群/文档/导出日志）(143345 / 119420)
 *   H6   → TerminalToggleButton      终端开关（Ctrl+J，激活 !bg-selected）(143316 / 119406)
 *   TFt  → SessionHeader             会话头（h-12 border-b）(144008 / 119938)
 *   wFt  → SessionHeaderLeft         会话头左簇（标题/路径pill/分支/更多）(143485 / 119493)
 *   SFt  → SessionHeaderRight        会话头右簇（编辑器/帮助/终端/侧面板）(143418 / 119457)
 *   xFt  → OpenInEditorButtonGroup   在 IDE 中打开（主按钮+⌄选择编辑器）(143194 / 119336)
 *   j6   → TaskRenameDialog          任务重命名对话框（IME 保护）(142581 / 118551)
 *   oFt  → TaskActionMenuItems       任务操作菜单项（置顶/重命名/归档/未读/复制路径…）(142183 / 118106)
 *   zZ   → GitBranchChip             git 分支切换 chip（含分支搜索/新建/提交切换）(96589 / 84085)
 *   n4   → RemoteSyncMenuItems       远程同步菜单项（技能/MCP/插件）(127166 / 107575)
 *   r4   → RemoteSyncDialogs         远程同步对话框组（本文件仅保留接口）(127265 / 107623)
 *   Flt  → ConversationSummaryAside  会话右摘要栏（mini/panel/auto 三态）(99217 / 85723)
 *   VO/HO/UO/WO/GO/KO/qO/JO/YO/XO
 *        → DropdownMenu* 原语族      (47926-48040 / 43144-43290)
 *
 *  辅助钩子 / 服务 / store（同 chunk 内）：
 *   ZPt  → useHelpActions            (141806 / 117792)
 *   $Pt  → isAutoUpdateChannelSupported（env==='production'）(141826 / 117816)
 *   eFt/tFt → updateMenuItemI18nId / updateMenuItemI18nValues (141829,141843 / 117819,117833)
 *   QPt  → CAPTION_MENU_ALIGN_OFFSET = -12 (141825 / 117815)
 *   YPt  → captureFeedbackScreenshots (141785 / 117765)
 *   XPt  → exportLogsWithToast       (141789 / 117769)
 *   lw   → PRODUCT_DOCS_URL = https://zcode.z.ai/docs (39410 / 35469)
 *   C6   → useTaskFileActions        (142068 / 118006)
 *   CFt/$2 → canOpenRemoteSessionSource (143499,127142 / 119494,107556)
 *   ZTt  → remoteTargetLabel         (123256 / 104935)  〔A1-R5：R4 误归 XTt，已更正为 ZTt 真实 import〕
 *   QTt  → sshDecoratedProjectName   (123268 / 104947)
 *   $b   → sanitizeRemoteTargetForRestore（src-HCld2afU.js 8611；本 chunk 导入名 yne）〔A1-R5：normalizeRemoteTarget 改指 SrcSharedB〕
 *   Zge  → resolveEffectiveProvider  (jsx 21359)
 *   U2   → useConfirmDialog          (123510 / 105222)
 *   Oc   → useWorkspaceServices      (4945 / 3754)
 *   Ec   → useBaseServices           (4897 / 3716)
 *   ZS   → useTaskListItems          (35727 / 32810)
 *   Uo   → applyOptimisticTaskMutation (1895 / 959)
 *   w6   → buildTaskFeedbackDescription (142334 / 118239)
 *   pct  → useGitBranchSwitcher      (96362 / 83842)
 *   MZ   → resolveBranchDisplayLabel (94967 / 82976)
 *   Uct  → resolveSummaryPanelVariant (98016 / 84991)
 *   tlt  → buildSummaryPanelModel    (98133 / 85113)
 *   slt/clt → EMPTY_BACKGROUND_WORKS / EMPTY_SUBAGENTS (98224 / 85193)
 *   mlt/hlt/Clt/Tlt/klt/Alt/Plt
 *        → SummaryGitSection / SummaryGoalSection / SummaryPlansSection /
 *          SummaryPlanSection / SummaryTerminalsSection / SummaryAgentsSection /
 *          SummaryMiniCard (98354,98453,98727,98778,98871,98933,99109 / 85281…85678)
 *   yC   → useFeedbackStore          (36992 / 33835)
 *   E6   → usePinnedTaskListStore    (142372 / 118266)
 *   k6   → useWorkspaceTaskListStore (142464 / 118392)
 *   Ug   → useMcpStore               (jsx 21655)
 *   ls   → useTrajectoryViewerStore  (jsx 1697)
 *   xe   → useTaskStore（skillStore chunk 的 h 导出）
 *
 *  图标（lucide 风格，Sa=createLucideIcon 工厂，js 行 / jsx 行）：
 *   S_ arrow-left 26634 | C_ arrow-right 26649 | hv message-circle-plus 27379
 *   Tv panel-left-close 27535 | Ev panel-left-open 27540
 *   ibe panel-right-close 27545 | abe panel-right-open 27550
 *   Uv square-terminal 27818 | vye circle-question-mark 26859 | N_ chevron-down 26802
 *   K_ ellipsis 26950 | U_ cloud 26918 | $_ folder 27133 | ev git-branch 27142
 *   Zve arrow-down-to-line 26620 | fv loader 27315 | M_ check 26801
 *   vv message-square 27411 | Uye lightbulb 27270 | Jv users 27950
 *   oye book-open 26698 | Dye file-archive 26998 | H_ cloud-upload 26913
 *   Zye minimize-2 27436 | kv plus（新建分支）| tv git-graph（图谱）
 *
 *  data-testid 常量（来自 src-HCld2afU.js，out/ 行号）：
 *   Jt=workspace-header(8361) | xne=workspace-title(8362) | hn=workspace-path(8362)
 *   Vt=workspace-more-button(8364) | pr=terminal-toggle(8237) | tee=chat-summary-panel(8308)
 *   $n=task-new-button(8318) | Wn=v4-task-open-in-split(8416)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)               utils-CEEH0K_K.js  (t 导出)
 *  3. Button (X) / createLucideIcon (Sa)
 *                                    button-laUijeDG.js  (t / c 导出)
 *  4. useIntlContext (G) 返回 {intl, locale}
 *                                    IntlProvider-C321H7m8.js (n 导出)
 *  5. usePlatformService (l)、toast (m/b)、Input (P)、IME 回车守卫 (A)、
 *     spinner 图标 (M)、Popover 原语 (T/h/x)
 *                                    imeComposition-DEYFkwWm.js（共享原语 chunk，
 *                                    导出 M/_/y/t/w/a/n/i 等）
 *  6. Tooltip (Ia)、Popover 弹层原语 (Na/Oa/Ma/ka)
 *                                    usageStatsUiParts-CiR7YEhh.js (u/p/d/m/f 导出)
 *  7. shortcutLabel ($i)：`$i('N')` → “Ctrl+N”
 *                                    keyboardShortcuts-BGHopxr9.js (n 导出)
 *  8. logger (J)                     logger-PFDwl5Yq.js (t 导出)
 *  9. DesktopCommand 枚举 (oi)、运行环境常量 (hi)、全部 testid 常量
 *                                    src-HCld2afU.js (ft/js/Ha/qa/Ka/Ga/Ri/Vn/Pi/Oa 导出)
 * 10. Radix DropdownMenu 底层原语 (aTe…vTe)：打包进本 chunk（jsx 27465 起）
 * 11. Markdown 渲染器 (cj)：本 chunk jsx 46461（memo 化）
 * ============================================================================
 */

import * as React from "react";
import { ShadcnTooltipProvider as PopoverRoot } from '../../modules/UsageStatsUiParts'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { PopoverContent as PopoverContentPrimitive, PopoverTrigger as PopoverTriggerPrimitive } from '../../modules/ImeComposition'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Command as CommandPalette, CommandItem } from '../../modules/QuickPick'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { CommandInput } from '../ui/command'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Button, createLucideIcon, ChevronRight as IconChevronRight, ChevronLeft } from '../../modules/button'; // A0-CLEANUP 族清理：Button/createLucideIcon declare 改指 button chunk。〔A1-P3-B13〕+IconChevronRight（原 wa = button chunk y 导出 = chevron-right@102；plt/jlt 转录消费；button chunk 图标 pass-1 canonical 先例 SkillsSettingsSection）〔A1-R58〕+ChevronLeft（原 Ea = button chunk s 导出 = chevron-left@100；blt 折叠触发器消费）
import { CommitGraphDialog as CommitGraphViewer, CreateBranchDialog, SwitchAssistDialog, resolveBranchDisplayLabel, useGitBranchSwitcher } from '../../modules/CmdkPaletteDeep'; // CommitGraphViewer 原 fct
import { resolveAvailableEditors, type InstalledEditor } from '../../modules/FileTreePanel'; // +InstalledEditor（A0-CLEANUP B-21：本地别名删除改指属主型）
import { SummaryGitSection, useTaskFileActions, type GitSummary } from '../../modules/GitReview'; // A0-CLEANUP4：GitSummary 属主为 GitReview（原 Yhe 缺省形），本地镜像删除后转手导出
import { Input, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, dismissToast, toast, usePlatformService, type PlatformService, type RemoteTarget } from '../../modules/ImeComposition'; // 〔A1-R48〕+usePlatformService/type PlatformService（原 l ≡ M 导出域外别名）：本地 21 员面碑化改指，参型面 @399/@623/@902/@1117/@1148/@1154 同名解析，见下墓碑；〔A1-R50〕+type RemoteTarget（统一属主改指，本地同形副本删除）
import { MarkdownRenderer } from '../../modules/MarkdownIntegration';
import { RemoteSyncDialogs, UpdateStatusDialog, canOpenRemoteSessionSourceCheck, useConfirmDialog } from '../../modules/Modals'; // A0-TOPBAR-MATER：useConfirmDialog（原 U2）declare 删除 → Modals 属主真实 import
import { CommandEmpty, CommandGroup, CommandList } from '../../modules/QuickPick';
import { type SubagentOpenRequest } from '../../modules/SidePanel'; // A0-CLEANUP4：子代理会话打开请求（原 Dlt 构造面，js 98874）
import { logger, useTaskStore } from '../../modules/SkillStore';
import { useBaseServices, useWorkspaceServices } from '../../modules/services';
import { applySearchTaskMutation as applyOptimisticTaskMutation } from '../../stores/searchResultsStore'; // A1-R10 项 2b：原 Uo（1895 / 959）declare 改指 canonical = R9 shim（bundle 逐字）；调用点 2141/2173/2372/2389 逐字不变，本地面与 canonical 面全同（非空 TaskMeta 四元组）。环安全：shim 值闭包（QuickPick/helpers/taskStore/zustand）不达 components/shell
import { useFeedbackStore } from '../../modules/stores-core';
import { useTrajectoryViewerStore, useTuiEditRequestStore } from '../../modules/stores-session';
import { usePinnedTaskListStore, useWorkspaceTaskListStore } from '../../modules/stores-tasks';
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // 原 Ia=u（A0-CLEANUP 族清理：本地 Tooltip declare 改指 InfoTooltip）
import { remoteTargetConnectionAddress, sshDecoratedProjectName } from '../../modules/SplitLayoutDeep'; // A1-R4 QTt（styles 123268）；A1-R5 归属更正：XTt→ZTt（styles 123256），tombstone 见原声明位
import { sanitizeRemoteTargetForRestore, DesktopMenuActionIds as DesktopCommand, joinTestidParts, v4BackgroundWorkCancelTestid, v4BackgroundWorkItemTestid } from '../../modules/SrcSharedB'; // 原 $b（src-HCld2afU.js 8611，pt→yne 导出）：A1-R5 normalizeRemoteTarget 改指；〔A1-R48〕+DesktopMenuActionIds as DesktopCommand（oi 收敛改指，WorkspaceShell@263 A1-P2-B1 / Sidebar@220 A1-P3-B1 同式先例），见下墓碑。〔A1-P3-B13〕+joinTestidParts（qr 真身：styles 601 `Xa as qr` ← src 9836 `Nb as Xa` ≡ Nb 8464 ≡ SrcSharedB@5015，R41 既判）+v4BackgroundWorkCancelTestid（≡ Oy@8405；Elt 98863 收敛）+v4BackgroundWorkItemTestid（≡ Dy@8404；Olt 98888 / Alt 99041 收敛）。环安全：SrcSharedB 值闭包不达 components/shell（B11/B12 同边先例）
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'; // 〔A1-P3-B13〕原 kZ/AZ/jZ（js 94973/94976/94979）A0-S3c 既重建：XZ/plt 段壳转录消费
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'; // 〔A1-R58〕原 dN/fN/pN（js 54538/54541/54544）A0-S3c 既重建（hover-card.tsx 头注引证）：xlt 折叠悬浮预览消费

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/


/** react-intl 风格 intl 对象（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };

/* ── tombstone〔A1-R48〕：本地 PlatformService 面（21 员，A0 转录 = 本批 canonical 增补签名源）+ declare usePlatformService（原 l）
 *    删除 → 改指 canonical = components/ime/ImeComposition PlatformService 富面 + 真导出（modules/ImeComposition shim 再导出）。
 *    面覆核对（21 员全覆盖）：openExternal✓（canonical 既有）/openInFileManager✓（增补·必选，直调 @1252）/
 *    openInEditor✓（增补·必选，直调 @1845；opts 之 remoteTarget 于 canonical 原结构化内联，〔A1-R50〕抽出为属主型 RemoteTarget，与本文件局部面逐字同形）/
 *    getInstalledEditors✓（增补·必选，直调 @1807）/canOpenCommunity✓（增补·必选，直调 @1243）/
 *    openCommunity✓（增补·必选，直调 @1427）/executeDesktopCommand✓（增补·必选，直调 @1258/@1330；参型 DesktopCommand 收敛见下墓碑）/
 *    getUpdateState?✓（增补，真值守卫 @1211 + 直调 @1213）/onUpdateStateChanged?✓（增补，?. 调用 @1237）/
 *    downloadUpdate?✓（增补，?. @965）/cancelUpdateDownload?✓（增补，?. @983）/skipUpdateVersion?✓（增补，?. @993）/
 *    quitAndInstallUpdate?✓（增补，?. @1015）/openUpdateStatusWindow?✓（增补，真值守卫 @763 + 直调 @764）/
 *    getAutoUpdatePreferences?✓（增补，?. @935）/setAutoDownloadAndInstallUpdates?✓（增补，?. @974）/
 *    getZCodeStdioTapDevState?✓（增补，真值守卫 @1220 + 直调 @1225）/getDesktopSessionActivity?✓（增补，?. @1002）/
 *    captureWindowScreenshot?✓（canonical 既判 R15，?. @1149/@2085）/exportLogs✓（增补·必选，直调 @1157）/
 *    onSettingsChanged?✓（canonical 既判 R11，?. @944）。
 *    UpdateState null 支：canonical getUpdateState 返 Promise<UpdateState | null>，与本文件 @1204 useState<UpdateState | null> 及 @1237 setUpdateState(state) 逐字相容（本地面@176 原形即带 null 支）。
 *    消费位普查（grep platform[?]?\. 全 27 位皆覆；余 @760 openExternal useCallback 裹、@1129 openExternal 直调）。
 *    负证据：普查位外无余消费；本面型参引用仅 @399/@623/@902/@1117/@1148/@1154，无余本地面引用。
 *    参型面 @399（UpdateIndicator props）/@623（props）/@902（props）/@1117（useHelpActions）/@1148（captureFeedbackScreenshots）/
 *    @1154（exportLogsWithToast）之 PlatformService 同名解析 canonical；hook 消费位 @1198/@1397/@1801/@1998 逐字不变。
 *    型依赖处置：UpdateState@212/ReleaseNotesPayload@218 属主留本文件（导出链 WorkspaceShell@219 经 modules/TopBar@152 不动）；
 *    RemoteTarget@224 本文件局部面〔A1-R50〕已删碑改指属主 ImeComposition::RemoteTarget（@1456/@1711/@1794/@1924 props 面 + @1838 型缝逐字不变；统一属主裁定闭合）；
 *    InstalledEditor 属主 = FileTreePanel（@134 既导入；A0-CLEANUP B-21 既判）。
 *    Provider 链核验：本面碑化不影响 PlatformProvider 注入链（rendererEntry@454 desktopPlatformBridge → ZCodeApp →
 *    AppRootLeaves@1901；AppRootLeaves props 型 = OnboardingLoginLeaves.PlatformService，[key: string]: any 索引签名
 *    满足 canonical 全部必选员，赋值成立；OnboardingLoginLeaves@1136/@1284 二段断言缝件互不干涉）。
 *    WorkspaceShell@321 二段断言缝件（A1-P2-B6 既判）本地面 extends SidePanelPlatformService，源为 `as unknown as`，
 *    canonical 本批增补不改其可赋性（cast 缝隔离）；SidePanel 浏览器视图族 12 员不在本批（留批）。
 *    同域余面披露：Composer@548/ExtendedViews@196/ConversationLeaves@242/Settings §0 等本地 PlatformService 面
 *    非本批范围（R46 §四.2 清单仅八件），留批。
 *    增补证据见 A1-R47.report §四.6（宿主桥接真值字面量 X@~337-474 + Pe@201-234；缺失成员 6 组清单；签名源 = 本文件@164-190）。 ── */

/** toast（原 m / b：弹出 / 关闭，imeComposition chunk 的 _ 导出） */

/** 快捷键文案：`shortcutLabel("N")` → “Ctrl+N”（原 $i） */
declare function shortcutLabel(key: string): string;

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/* ── tombstone〔A1-R48〕：declare enum DesktopCommand（原 oi）删除 → 收敛改指 canonical = modules/SrcSharedB DesktopMenuActionIds
 *    （src ex@8631 / export ft，SrcSharedB@5233 逐字；收敛既判：WorkspaceShell@263 A1-P2-B1、Sidebar@220/268 A1-P3-B1、
 *    rendererEntry@43）。原 declare 成员值为 PascalCase（"ShowAbout" 等）≠ bundle 真值 camelCase（"showAbout" 等）——误铸；
 *    改指后值回 bundle 真形（行为向真身收敛）。原 declare 为 ambient 无运行时实体，消费位 1300–1343 潜悬空引用，本收敛并除之。
 *    七用点成员（ShowAbout/CheckForUpdates/OpenProcessMonitor/OpenCommunity/ToggleDevTools/
 *    ToggleZCodeStdioTapDevProxy/CloseWindow）DesktopMenuActionIds 全括（实测）。
 *    型面：canonical 为 plain object（非 enum），补同名型别名（成员值并；Sidebar@268 同形先例）。
 *    消费位 @1256-1259/@1300/@1304/@1308/@1316/@1330/@1337/@1343 逐字不变。
 *    负证据：全树 declare enum DesktopCommand 唯本处与 Sidebar 已碑处（A1-P3-B1），无第三副本。 ── */
type DesktopCommand = (typeof DesktopCommand)[keyof typeof DesktopCommand];

type Platform = "mac" | "windows" | "linux" | "web";
export type UpdateState =
  | { kind: "checking" }
  | { kind: "update-available"; version: string; channel?: string; releaseNotes?: ReleaseNotesPayload }
  | { kind: "download-progress"; version: string; progress: number; totalBytes: number; transferredBytes: number; channel?: string; releaseNotes?: ReleaseNotesPayload }
  | { kind: "update-downloaded"; version: string; channel?: string; releaseNotes?: ReleaseNotesPayload }
  | null;
interface ReleaseNotesPayload {
  title: string;
  markdown: string;
  releaseDate?: string;
  releaseNotesByLocale?: Record<string, { title: string; markdown: string }>;
}
/* ── tombstone〔A1-R50〕：本地 RemoteTarget 副本（6 员 family-A 形）删除 → 统一属主
 *    改指 components/ime/ImeComposition::RemoteTarget（canonical openInEditor opts.remoteTarget
 *    内联抽出，与本局部面逐字同形；经 modules/ImeComposition type import，既有边）。
 *    消费位 @1456/@1711/@1794/@1924 props 面 + @1838 型缝 cast 逐字不变。 ── */
/* ── tombstone（A0-CLEANUP B-21）：本地 InstalledEditor 别名删除 → import type
 *    { InstalledEditor } from './FileTreePanel'（iconDataUrl 为平台实返可选字段）。 ── */
/* ── tombstone（A0-CLEANUP4）：本地 4 字段 GitSummary 镜像删除 → 接线 git 域属主
 *    GitReview.GitSummary（原 Yhe 缺省形，12 字段；运行期值恒为 useGitState 全形，
 *    束 nge→a4/ConversationSummaryAside/mlt 链路实证）。 ── */
export type { GitSummary };

/* --- UI 原语（button-laUijeDG / usageStatsUiParts / imeComposition chunk） --- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon-sm" | "icon-md" | "icon-lg";
}
/* ── tombstone（A0-CLEANUP 族清理）：Button / Tooltip declare 删除 → import
 *    { Button, createLucideIcon } from './button'、{ InfoTooltip as Tooltip }
 *    from './UsageStatsUiParts'（原 Ia=usageStatsUiParts u 导出）。 ── */

/* --- 下拉菜单原语族（原 VO/HO/UO/WO/GO/KO/qO/JO/YO/XO，本 chunk 47926-48040 / jsx 43144-43290）
 * 底层是打包进本 chunk 的 Radix DropdownMenu（aTe…vTe，jsx 27465）。
 * 这里保留原始类名，完整还原。 */

const DropdownMenu: React.FC<React.ComponentPropsWithoutRef<"div"> & { open?: boolean; onOpenChange?: (open: boolean) => void }> = (props) => (
  <div data-slot="dropdown-menu" {...props} />
);

const DropdownMenuTrigger: React.FC<React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }> = (props) => (
  <button data-slot="dropdown-menu-trigger" {...props} />
);

const DropdownMenuContent: React.FC<
  React.ComponentPropsWithoutRef<"div"> & { align?: "start" | "center" | "end"; side?: "top" | "bottom"; sideOffset?: number; alignOffset?: number }
> = ({ className, align = "start", sideOffset = 2, ...rest }) => (
  <div
    data-slot="dropdown-menu-content"
    // 定位由 Radix Portal 处理；动画/滚动/尺寸类名与原实现逐字一致
    className={cn(
      "z-[60] flex flex-col gap-0.5 max-h-(--radix-dropdown-menu-content-available-height) w-(--radix-dropdown-menu-trigger-width) min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-popover-border bg-menu p-1 text-foreground !shadow-md focus:!shadow-md focus-visible:!shadow-md duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
      className,
    )}
    {...rest}
  />
);

const DropdownMenuItem: React.FC<
  React.ComponentPropsWithoutRef<"div"> & { inset?: boolean; variant?: "default" | "destructive"; disabled?: boolean; title?: string; onSelect?: () => void }
> = ({ className, inset, variant = "default", ...rest }) => (
  <div
    data-slot="dropdown-menu-item"
    data-inset={inset}
    data-variant={variant}
    className={cn(
      "group/dropdown-menu-item relative flex min-h-7 cursor-default items-center gap-2 rounded-lg px-2 py-1 text-ui-base/relaxed text-foreground outline-hidden select-none data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground data-inset:pl-7.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive data-[variant=destructive]:data-[highlighted]:text-destructive-foreground data-disabled:pointer-events-none data-disabled:text-foreground-subtlest data-disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-current data-[variant=destructive]:data-[highlighted]:*:[svg]:text-destructive-foreground",
      className,
    )}
    {...rest}
  />
);

/** 复选菜单项（原 GO；右侧 check 指示器 M_ check 图标） */
const DropdownMenuCheckboxItem: React.FC<
  React.ComponentPropsWithoutRef<"div"> & { checked?: boolean; inset?: boolean; onCheckedChange?: (v: boolean) => void }
> = ({ className, children, checked, inset, ...rest }) => (
  <div data-slot="dropdown-menu-checkbox-item" data-inset={inset}
    className={cn("relative flex min-h-7 cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-ui-base text-foreground outline-hidden select-none data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:text-foreground-subtlest data-disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
    {...rest}>
    <span className="pointer-events-none absolute right-2 flex items-center justify-center" data-slot="dropdown-menu-checkbox-item-indicator">
      {checked ? <IconCheck className="size-4 text-foreground-subtle" /> : null}
    </span>
    {children}
  </div>
);

const DropdownMenuRadioGroup: React.FC<React.ComponentPropsWithoutRef<"div"> & { value?: string; onValueChange?: (v: string) => void }> = ({ className, ...rest }) => (
  <div data-slot="dropdown-menu-radio-group" className={cn("flex flex-col gap-0.5", className)} {...rest} />
);

/** 单选菜单项（原 qO） */
const DropdownMenuRadioItem: React.FC<React.ComponentPropsWithoutRef<"div"> & { value: string; inset?: boolean }> = ({ className, children, inset, ...rest }) => (
  <div data-slot="dropdown-menu-radio-item" data-inset={inset}
    className={cn("relative flex min-h-7 cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-ui-base text-foreground outline-hidden select-none data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:text-foreground-subtlest data-disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
    {...rest}>
    <span className="pointer-events-none absolute right-2 flex items-center justify-center" data-slot="dropdown-menu-radio-item-indicator">
      <IconCheck className="size-4 text-foreground-subtle" />
    </span>
    {children}
  </div>
);

const DropdownMenuSeparator: React.FC<React.ComponentPropsWithoutRef<"div">> = ({ className, ...rest }) => (
  <div data-slot="dropdown-menu-separator" className={cn("-mx-1 my-1 h-px bg-border", className)} {...rest} />
);

/** 菜单项右侧快捷键文案（原 XO） */
const DropdownMenuShortcut: React.FC<React.ComponentPropsWithoutRef<"span">> = ({ className, ...rest }) => (
  <span data-slot="dropdown-menu-shortcut"
    className={cn("ml-auto text-ui-xs tracking-widest text-foreground-subtlest group-data-[highlighted]/dropdown-menu-item:text-foreground-subtle", className)}
    {...rest} />
);

/* --- 图标（原 Sa 工厂批量生成的 lucide 图标；此处按语义命名） --- */

type IconProps = React.SVGProps<SVGSVGElement>;
/* ── tombstone（A0-CLEANUP 族清理）：createLucideIcon declare 删除 → import from './button'。 ── */

const IconArrowLeft = createLucideIcon("arrow-left", []);            // 原 S_（js 26634）
const IconArrowRight = createLucideIcon("arrow-right", []);          // 原 C_（js 26649）
const IconMessageCirclePlus = createLucideIcon("message-circle-plus", []); // 原 hv（js 27379）新建任务
const IconPanelLeftClose = createLucideIcon("panel-left-close", []); // 原 Tv（js 27535）
const IconPanelLeftOpen = createLucideIcon("panel-left-open", []);   // 原 Ev（js 27540）
const IconPanelRightClose = createLucideIcon("panel-right-close", []); // 原 ibe（js 27545）
const IconPanelRightOpen = createLucideIcon("panel-right-open", []); // 原 abe（js 27550）
const IconSquareTerminal = createLucideIcon("square-terminal", []);  // 原 Uv（js 27818）
const IconSquare = createLucideIcon("square", []);                   // 原 Wv（js 27871）〔A1-P3-B13〕Elt 停止钮
const IconBot = createLucideIcon("bot", []);                         // 原 D_（js 26756）〔A1-P3-B13〕Alt 子代理行
const IconCircleCheck = createLucideIcon("circle-check", []);        // 原 I_（js 26869）〔A1-P3-B13〕jlt 已结束条目
const IconCircleQuestionMark = createLucideIcon("circle-question-mark", []); // 原 vye（js 26859）
const IconChevronDown = createLucideIcon("chevron-down", []);        // 原 N_（js 26802）
const IconEllipsis = createLucideIcon("ellipsis", []);               // 原 K_（js 26950）
const IconCloud = createLucideIcon("cloud", []);                     // 原 U_（js 26918）远程工作区
const IconFolder = createLucideIcon("folder", []);                   // 原 $_（js 27133）本地工作区
const IconGitBranch = createLucideIcon("git-branch", []);            // 原 ev（js 27142）
const IconActivity = createLucideIcon("activity", []);               // 原 y_（js 26634）〔A1-R58〕Plt 双运行态行
const IconCircleCheckBig = createLucideIcon("circle-check-big", []); // 原 pye（js 26865）〔A1-R58〕hlt 已验证徽记
const IconCircle = createLucideIcon("circle", []);                   // 原 z_（js 26921）〔A1-R58〕glt 待办条目
const IconFileDiff = createLucideIcon("file-diff", []);              // 原 X_（js 27084）〔A1-R58〕Plt 变更行
const IconGoal = createLucideIcon("goal", []);                       // 原 rv（js 27223）〔A1-R58〕hlt 未完成迭代 / Plt 目标行
const IconListChecks = createLucideIcon("list-checks", []);          // 原 lv（js 27329）〔A1-R58〕Clt 计划目录行 / Plt todo 行
const IconMaximize2 = createLucideIcon("maximize-2", []);            // 原 mv（js 27394）〔A1-R58〕QZ hover 展开提示
const IconPause = createLucideIcon("pause", []);                     // 原 sbe（js 27612）〔A1-R58〕hlt 暂停钮
const IconPlay = createLucideIcon("play", []);                       // 原 cbe（js 27636）〔A1-R58〕hlt 恢复钮
const IconArrowDownToLine = createLucideIcon("arrow-down-to-line", []); // 原 Zve（js 26620）更新就绪
const IconLoader = createLucideIcon("loader", []);                   // 原 fv（js 27315）
const IconLoaderCircle = createLucideIcon("loader-circle", []);      // 原 M（imeComposition chunk w 导出）
const IconCheck = createLucideIcon("check", []);                     // 原 M_（js 26801）
const IconMessageSquare = createLucideIcon("message-square", []);    // 原 vv（js 27411）
const IconLightbulb = createLucideIcon("lightbulb", []);             // 原 Uye（js 27270）
const IconUsers = createLucideIcon("users", []);                     // 原 Jv（js 27950）
const IconBookOpen = createLucideIcon("book-open", []);              // 原 oye（js 26698）
const IconFileArchive = createLucideIcon("file-archive", []);        // 原 Dye（js 26998）
const IconCloudUpload = createLucideIcon("cloud-upload", []);        // 原 H_（js 26913）
const IconMinimize2 = createLucideIcon("minimize-2", []);            // 原 Zye（js 27436）
const IconPlus = createLucideIcon("plus", []);                       // 原 kv（新建分支）
const IconGitGraph = createLucideIcon("git-graph", []);              // 原 tv（提交图谱）

/* ============================================================================
 * 1. 顶栏浮层 TopBarOverlay（原 BOt，js 129516-129646 / jsx 108974-109063）
 * ----------------------------------------------------------------------------
 * 结构要点（与 zcode-uiux-spec.md §13.1 交叉验证）：
 *  - 绝对定位浮层 `absolute h-14 left-0 top-0 z-20 w-fit`，整层 pointer-events-none，
 *    只有左簇 `pointer-events-auto`，因此顶栏其余区域可拖拽窗口（[app-region:drag]
 *    由下层侧栏/会话头提供，按钮一律 [app-region:no-drag]）。
 *  - 侧栏可见时宽度 = var(--workspace-sidebar-panel-width)，正好压在侧栏 h-12 drag 条上。
 *  - 左簇顺序固定：[侧栏开关(logo↔面板图标)] [任务后退/前进] [新建任务(宽度动画)] [更新指示器]。
 *  - 顶栏不含任何面板图标（终端/浏览器/审查），也不含窗口控制（−□× 是原生的）。
 * ==========================================================================*/

interface TopBarOverlayProps {
  workspaceAbsPath: string;
  isMacDesktop: boolean;
  isMacFullscreen: boolean;
  isWindowsDesktop: boolean;
  isDesktop: boolean;
  /** Mac 交通灯让位像素（默认 96） */
  macWindowControlsLeftPaddingPx?: number;
  /** Win 原生 caption 三键宽度估计（默认 136），用于 env(titlebar-area-*) 反推 */
  windowsWindowControlsRightPaddingPx?: number;
  isSidebarVisible: boolean;
  updateReadyVersion?: string | null;
  updateState: UpdateState;
  toggleSidebarShortcutLabel?: string;
  newTaskShortcutLabel?: string;
  goBackShortcutLabel?: string;
  goForwardShortcutLabel?: string;
  canTaskNavBack: boolean;
  canTaskNavForward: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  /** 未指定时回退为 !isSidebarVisible：侧栏隐藏才展开新建按钮 */
  showNewTaskButton?: boolean | null;
  appLogoUrl: string;
  platform: PlatformService;
  onToggleSidebar: () => void;
  onCreateTask: () => void;
  onGoBack: () => void;
  onGoForward: () => void;
  hideTaskNavigationButtons?: boolean;
  /** 非空时禁用新建按钮并作为 tooltip 文案（只读工作区等） */
  newTaskDisabledReason?: string | null;
}

export function TopBarOverlay({
  workspaceAbsPath,
  isMacDesktop,
  isMacFullscreen,
  isWindowsDesktop,
  isDesktop,
  macWindowControlsLeftPaddingPx,
  windowsWindowControlsRightPaddingPx,
  isSidebarVisible,
  updateReadyVersion,
  updateState,
  toggleSidebarShortcutLabel,
  newTaskShortcutLabel,
  goBackShortcutLabel,
  goForwardShortcutLabel,
  canTaskNavBack,
  canTaskNavForward,
  canGoBack,
  canGoForward,
  showNewTaskButton,
  appLogoUrl,
  platform,
  onToggleSidebar,
  onCreateTask,
  onGoBack,
  onGoForward,
  hideTaskNavigationButtons = false,
  newTaskDisabledReason,
}: TopBarOverlayProps) {
  const { intl } = useIntlContext();

  // 侧栏可见 → 显示“收起”图标(panel-left-close)；隐藏 → “展开”图标(panel-left-open)
  const SidebarToggleIcon = isSidebarVisible ? IconPanelLeftClose : IconPanelLeftOpen;
  // 非 Mac 桌面（Windows 或 Linux）：logo hover 变形版侧栏开关 + h-12 高度
  const isNonMacDesktop = isWindowsDesktop || !!(isDesktop && !isMacDesktop && !isWindowsDesktop);

  const toggleSidebarLabel = intl.formatMessage({ id: "workspaceSidebar.toggleSidebar" });
  const newTaskLabel = intl.formatMessage({ id: "sidebar.newTask" });
  const taskNavBackLabel = intl.formatMessage({ id: "taskNav.back" });
  const taskNavForwardLabel = intl.formatMessage({ id: "taskNav.forward" });

  // 新建任务按钮展开条件：显式 prop 优先，否则“侧栏隐藏时展开”
  const isNewTaskButtonExpanded = showNewTaskButton ?? !isSidebarVisible;

  // Mac 非全屏：给红绿灯让位（默认 96px）
  const macTrafficLightsStyle =
    isMacDesktop && !isMacFullscreen && Number.isFinite(macWindowControlsLeftPaddingPx)
      ? { paddingLeft: `${Math.round(macWindowControlsLeftPaddingPx ?? 96)}px` }
      : undefined;
  // Windows：用 env(titlebar-area-*) 反推右侧原生 −□× 占位
  const windowsCaptionStyle = isWindowsDesktop
    ? { ...windowsCaptionInsetStyle(windowsWindowControlsRightPaddingPx), paddingRight: WINDOWS_CAPTION_RIGHT_INSET_VAR }
    : undefined;

  return (
    // @container/topoverlayer：供更新胶囊的容器查询断点使用（见 updatePillResponsiveClasses）
    <div
      style={isSidebarVisible ? { width: "var(--workspace-sidebar-panel-width)" } : undefined}
      className={cn("@container/topoverlayer pointer-events-none absolute h-14 flex left-0 top-0 z-20 w-fit")}
    >
      <div
        style={{ ...macTrafficLightsStyle, ...windowsCaptionStyle }}
        className={cn(
          "flex items-center",
          isMacDesktop && "h-14",
          isNonMacDesktop && "h-12 pl-2",
          // Mac 全屏时贴近屏幕左缘；非全屏只留交通灯空间
          isMacDesktop && (isMacFullscreen ? (isSidebarVisible ? "pl-3 pt-1" : "pl-5 pt-1") : "pt-1"),
        )}
      >
        {/* 左簇：唯一可交互区域（no-drag），其余顶栏区域透传拖拽 */}
        <div className={cn("pointer-events-auto flex items-center gap-1 shrink-0 [app-region:no-drag]")}>
          {/* 1) 侧栏开关：
               - Win/Linux：按钮内是 app logo(size-5)，hover 时 logo 淡出、面板图标淡入
                 （group-hover:opacity-* 交叉渐变，150ms）；
               - Mac：不显示 logo，直接是面板图标按钮。 */}
          {isNonMacDesktop && (
            <TopBarIconButton
              title={toggleSidebarLabel}
              shortcut={toggleSidebarShortcutLabel}
              ariaLabel={toggleSidebarLabel}
              buttonClassName="group relative overflow-hidden rounded-lg"
              onClick={onToggleSidebar}
            >
              <img src={appLogoUrl} alt="nofy" className="size-5 transition-opacity duration-150 group-hover:opacity-0" draggable={false} /> {/* REBRAND-036+136 */}
              <SidebarToggleIcon className="absolute inset-0 m-auto size-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
            </TopBarIconButton>
          )}
          {isMacDesktop && (
            <TopBarIconButton title={toggleSidebarLabel} shortcut={toggleSidebarShortcutLabel} ariaLabel={toggleSidebarLabel} onClick={onToggleSidebar}>
              <SidebarToggleIcon className="size-4" />
            </TopBarIconButton>
          )}

          {/* 2) 任务导航 后退/前进（disabled 态由 TopBarIconButton 置灰） */}
          {hideTaskNavigationButtons ? null : (
            <>
              <TopBarIconButton title={taskNavBackLabel} shortcut={goBackShortcutLabel} ariaLabel={taskNavBackLabel} disabled={!canTaskNavBack} onClick={onGoBack}>
                <IconArrowLeft className="size-4" />
              </TopBarIconButton>
              <TopBarIconButton title={taskNavForwardLabel} shortcut={goForwardShortcutLabel} ariaLabel={taskNavForwardLabel} disabled={!canTaskNavForward} onClick={onGoForward}>
                <IconArrowRight className="size-4" />
              </TopBarIconButton>
            </>
          )}

          {/* 3) 新建任务：宽度动画容器 w-7 ↔ w-0（transition-[opacity,width] 300ms ease-out）。
               收起时 aria-hidden + pointer-events-none，避免隐藏按钮被点中。 */}
          <div
            aria-hidden={!isNewTaskButtonExpanded}
            className={cn(
              "inline-flex overflow-hidden transition-[opacity,width] duration-300 ease-out",
              isNewTaskButtonExpanded ? "w-7 opacity-100" : "pointer-events-none w-0 opacity-0",
            )}
          >
            <TopBarIconButton
              title={newTaskDisabledReason ?? newTaskLabel}
              shortcut={newTaskShortcutLabel}
              ariaLabel={newTaskLabel}
              disabled={!!newTaskDisabledReason}
              onClick={onCreateTask}
            >
              <IconMessageCirclePlus className="size-4" />
            </TopBarIconButton>
          </div>

          {/* 4) 更新指示器（下载中 spin / 就绪胶囊 / 发行说明 popover） */}
          <UpdateIndicator
            platform={platform}
            version={updateReadyVersion}
            updateState={updateState}
            isMacDesktop={isMacDesktop}
            isWindowsDesktop={isWindowsDesktop}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 1.1 TopBarIconButton（原 o4，js 129479 / jsx 108952）
 *     顶栏通用图标按钮：Tooltip（含快捷键提示）+ ghost icon-md 按钮 + no-drag。
 * ==========================================================================*/

interface TopBarIconButtonProps {
  title: string;
  ariaLabel: string;
  children: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  side?: "top" | "bottom" | "left" | "right";
  buttonClassName?: string;
}

export function TopBarIconButton({
  title,
  ariaLabel,
  children,
  shortcut,
  disabled,
  onClick,
  onMouseEnter,
  side = "bottom",
  buttonClassName,
}: TopBarIconButtonProps) {
  return (
    <Tooltip title={title} shortcut={shortcut} side={side}>
      <Button
        type="button"
        variant="ghost"
        size="icon-md"
        className={cn("[app-region:no-drag] transition-colors", buttonClassName)}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => onClick()}
        onMouseEnter={onMouseEnter}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

/* ============================================================================
 * 1.2 Windows caption 让位工具（原 s4/ROt/c4/zOt，js 129507-129515 / jsx 108965-108973）
 *     Windows 无原生 titlebar-area 时，用 100vw 减去 env(titlebar-area-*) 反推
 *     右侧 −□× 三键总宽，再三等分得到单键宽（供 ⌄ 菜单/终端开关贴合原生键宽）。
 * ==========================================================================*/

export const WINDOWS_CAPTION_RIGHT_INSET_VAR = "var(--windows-caption-controls-right-inset)"; // 原 s4
const WINDOWS_CAPTION_CONTROL_WIDTH_VAR = "var(--windows-caption-control-width)";      // 原 ROt

export function windowsCaptionInsetStyle(fallbackTotalWidth = 136): Record<string, string> {
  const safeFallback = Number.isFinite(fallbackTotalWidth) && fallbackTotalWidth > 0 ? Math.round(fallbackTotalWidth) : 136;
  return {
    "--windows-caption-controls-right-inset": `calc(100vw - env(titlebar-area-x, 0px) - env(titlebar-area-width, calc(100vw - ${safeFallback}px)))`,
    "--windows-caption-control-width": `calc(var(--windows-caption-controls-right-inset) / 3)`,
  };
}

/** 让某个顶栏按钮占满一个原生 caption 键的宽度（原 zOt） */
const WINDOWS_CAPTION_BUTTON_CLASS = "h-full w-[var(--windows-caption-control-width,46px)] rounded-none";

/* ============================================================================
 * 1.3 UpdateIndicator（原 LOt，js 129385-129478 / jsx 108869-108951）
 *     三种相位：downloading（spinner + 进度文案）/ downloaded（绿色“重启更新”胶囊，
 *     带发行说明 popover）/ before-download（“有可用更新”胶囊）。
 *     胶囊在容器足够宽时从圆形图标展开成带文字的胶囊（@container 查询，按平台断点）。
 * ==========================================================================*/

interface UpdateIndicatorProps {
  platform: PlatformService;
  version?: string | null;
  updateState: UpdateState;
  isMacDesktop?: boolean;
  isWindowsDesktop?: boolean;
  className?: string;
}

/** 原 IOt：容器查询断点按平台不同（Win 顶栏更窄，用 216px；其余 280px） */
function updatePillResponsiveClasses({ isMacDesktop, isWindowsDesktop }: { isMacDesktop: boolean; isWindowsDesktop: boolean }) {
  if (isMacDesktop) {
    return {
      expandWidthClass: "@min-[280px]/topoverlayer:w-16",
      hideIconClass: "@min-[280px]/topoverlayer:hidden",
      revealTextClass: [
        "@min-[280px]/topoverlayer:opacity-100",
        "@min-[280px]/topoverlayer:w-auto",
        "@min-[280px]/topoverlayer:relative",
      ],
    };
  }
  if (isWindowsDesktop) {
    return {
      expandWidthClass: "@min-[216px]/topoverlayer:w-16",
      hideIconClass: "@min-[216px]/topoverlayer:hidden",
      revealTextClass: [
        "@min-[216px]/topoverlayer:opacity-100",
        "@min-[216px]/topoverlayer:w-auto",
        "@min-[216px]/topoverlayer:relative",
      ],
    };
  }
  return {
    expandWidthClass: "@min-[280px]/topoverlayer:w-16",
    hideIconClass: "@min-[280px]/topoverlayer:hidden",
    revealTextClass: [
      "@min-[280px]/topoverlayer:opacity-100",
      "@min-[280px]/topoverlayer:w-auto",
      "@min-[280px]/topoverlayer:relative",
    ],
  };
}

/** 原 TOt：按 locale 选择发行说明，中文优先，回退默认/中文 */
function pickLocalizedReleaseNotes(payload: ReleaseNotesPayload | undefined, locale: string) {
  if (!payload) return null;
  const fallback = { title: payload.title, markdown: payload.markdown };
  return payload.releaseNotesByLocale?.[locale] ?? (locale === "zh-CN" ? fallback : payload.releaseNotesByLocale?.["zh-CN"] ?? fallback);
}

/** 原 EOt：发行日期本地化（UTC，年月日） */
function formatReleaseDate(releaseDate: string | undefined, locale: string): string | null {
  if (!releaseDate) return null;
  const parsed = new Date(releaseDate);
  return Number.isNaN(parsed.getTime())
    ? releaseDate
    : new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(parsed);
}

function formatMegabytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function downloadProgressLabel(state: UpdateState): string | null {
  if (state?.kind !== "download-progress") return null;
  const { totalBytes, transferredBytes } = state;
  return typeof transferredBytes === "number" && Number.isFinite(transferredBytes) && transferredBytes >= 0 &&
    typeof totalBytes === "number" && Number.isFinite(totalBytes) && totalBytes > 0
    ? `${formatMegabytes(transferredBytes)} / ${formatMegabytes(totalBytes)}`
    : null;
}

/** 原 jOt：下载进度夹取到 0-100 */
function downloadProgressValue(state: UpdateState): number {
  const value = state?.kind === "download-progress" ? Number(state.progress) : 0;
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
}

/** 原 DOt：把 updateState 归一成视图模型（相位/展示版本/进度/发行说明/可跳过版本/通道） */
function resolveUpdateViewModel({ legacyReadyVersion, updateState }: { legacyReadyVersion?: string | null; updateState: UpdateState }) {
  const isDownloading = updateState?.kind === "download-progress";
  const downloadedVersion = updateState?.kind === "update-downloaded" ? updateState.version : updateState === null ? legacyReadyVersion ?? null : null;
  const availableVersion = updateState?.kind === "update-available" ? updateState.version : null;
  return {
    dialogPhase: downloadedVersion ? ("downloaded" as const) : isDownloading ? ("downloading" as const) : ("before-download" as const),
    displayVersion: downloadedVersion ?? (isDownloading ? updateState!.version : null) ?? availableVersion ?? (isDownloading ? "…" : null),
    progressLabel: downloadProgressLabel(updateState),
    progressValue: downloadProgressValue(updateState),
    releaseNotesPayload:
      updateState?.kind === "update-available" || updateState?.kind === "download-progress" || updateState?.kind === "update-downloaded"
        ? updateState.releaseNotes
        : undefined,
    skippableVersion:
      updateState?.kind === "update-available" || updateState?.kind === "download-progress" ? (updateState.version ?? null) : null,
    updateChannel:
      updateState?.kind === "update-available" || updateState?.kind === "download-progress" || updateState?.kind === "update-downloaded"
        ? updateState.channel
        : undefined,
  };
}

/** 原 OOt：pending 动作是否已被更新状态超越（用于即时清锁） */
function isPendingUpdateActionResolved(action: "download" | "cancel" | "skip" | "restart", state: UpdateState): boolean {
  return (
    (action === "download" && (state?.kind === "download-progress" || state?.kind === "update-downloaded")) ||
    (action === "cancel" && state?.kind !== "download-progress") ||
    (action === "skip" && state?.kind !== "update-available" && state?.kind !== "download-progress")
  );
}

export function UpdateIndicator({ platform, version, updateState, isMacDesktop = false, isWindowsDesktop = false, className }: UpdateIndicatorProps) {
  const { intl, locale } = useIntlContext();
  const [isDialogOpen, openDialog] = React.useState(false);
  // 发行说明缓存：locale:version → {releaseDateLabel, releaseNotes}，LRU 上限 8
  const releaseNotesCacheRef = React.useRef(new Map<string, { releaseDateLabel: string | null; releaseNotes: { title: string; markdown: string } }>());

  const { expandWidthClass, hideIconClass, revealTextClass } = updatePillResponsiveClasses({ isMacDesktop, isWindowsDesktop });
  const { dialogPhase, displayVersion, progressLabel, releaseNotesPayload } = resolveUpdateViewModel({ legacyReadyVersion: version, updateState });
  const localizedNotes = pickLocalizedReleaseNotes(releaseNotesPayload, locale);
  const releaseDateLabel = formatReleaseDate(releaseNotesPayload?.releaseDate, locale);
  const cacheKey = displayVersion ? `${locale}:${displayVersion}` : null;

  React.useEffect(() => {
    if (!cacheKey || !localizedNotes) return;
    releaseNotesCacheRef.current.set(cacheKey, { releaseDateLabel, releaseNotes: localizedNotes });
    if (releaseNotesCacheRef.current.size > 8) {
      const oldest = releaseNotesCacheRef.current.keys().next().value;
      if (oldest) releaseNotesCacheRef.current.delete(oldest);
    }
  }, [releaseDateLabel, localizedNotes, cacheKey]);

  const cached = cacheKey ? releaseNotesCacheRef.current.get(cacheKey) : undefined;
  const effectiveNotes = localizedNotes ?? cached?.releaseNotes ?? null;
  const effectiveDateLabel = releaseDateLabel ?? cached?.releaseDateLabel ?? null;
  // 下载中不展示发行说明（内容尚未确定）
  const popoverNotes = dialogPhase === "downloading" ? null : effectiveNotes;

  const openExternal = React.useCallback((url: string) => platform.openExternal(url), [platform]);
  const handlePillClick = React.useCallback(() => {
    // 有独立更新状态窗口（进程监视器风格）则打开它，否则打开内嵌对话框
    if (platform.openUpdateStatusWindow) {
      platform.openUpdateStatusWindow();
      return;
    }
    openDialog(true);
  }, [platform]);

  if (!displayVersion) return null;

  const releaseNotesTitle = intl.formatMessage({ id: "updateReady.releaseNotesTitle" }, { version: displayVersion });
  const tooltipText =
    dialogPhase === "downloading"
      ? progressLabel
        ? intl.formatMessage({ id: "desktopMenu.help.downloadingUpdateProgress" }, { progress: progressLabel })
        : intl.formatMessage({ id: "desktopMenu.help.downloadingUpdateVersion" }, { version: displayVersion })
      : dialogPhase === "downloaded"
        ? intl.formatMessage({ id: "updateReady.tooltip" }, { version: displayVersion })
        : intl.formatMessage({ id: "updateAvailable.tooltip" }, { version: displayVersion });

  // 绿色圆钮：下载中 = 白色 spinner；就绪 = 下载图标 + 容器查询展开的文字
  const pill = (
    <Button
      size="xs"
      variant="secondary"
      aria-label={tooltipText}
      onClick={handlePillClick}
      className={cn(
        "gap-1 rounded-full text-ui-base w-6 border-transparent bg-success text-success-foreground hover:bg-success/80 transition-all",
        dialogPhase !== "downloading" && expandWidthClass,
        className,
      )}
    >
      {dialogPhase === "downloading" ? (
        <IconLoaderCircle className="size-3 shrink-0 animate-spin" />
      ) : (
        <IconArrowDownToLine className={cn("size-3 shrink-0 inline", hideIconClass)} />
      )}
      {dialogPhase === "downloading" ? null : (
        <span className={cn("w-0 overflow-hidden absolute opacity-0 transition-all", ...revealTextClass)}>
          {intl.formatMessage({ id: "updateReady.shortTitle" })}
        </span>
      )}
    </Button>
  );

  return (
    <>
      {popoverNotes ? (
        <ReleaseNotesPopover
          locale={locale}
          onOpenExternalUrl={openExternal}
          releaseDateLabel={effectiveDateLabel}
          releaseNotesMarkdown={popoverNotes.markdown}
          releaseNotesTitle={releaseNotesTitle}
        >
          {pill}
        </ReleaseNotesPopover>
      ) : (
        <Tooltip title={tooltipText} side="bottom">{pill}</Tooltip>
      )}
      {/* 更新对话框（下载/跳过/重启安装）。完整呈现层为原 COt（styles 128812），
          此处保留控制器接口；详见 UpdateStatusDialogController 注释。 */}
      <UpdateStatusDialogController platform={platform} version={version ?? null} updateState={updateState} open={isDialogOpen} onOpenChange={openDialog} />
    </>
  );
}

/** 原 FOt（js 129313 / jsx 108831）：发行说明 Popover（标题+日期+markdown 滚动区） */
function ReleaseNotesPopover({
  children,
  locale,
  onOpenExternalUrl,
  releaseDateLabel,
  releaseNotesMarkdown,
  releaseNotesTitle,
}: {
  children: React.ReactNode;
  locale: string;
  onOpenExternalUrl: (url: string) => void;
  releaseDateLabel: string | null;
  releaseNotesMarkdown: string;
  releaseNotesTitle: string;
}) {
  // 原实现使用 usageStatsUiParts chunk 的 Popover 原语（Na=Root, Oa, Ma=Trigger asChild, ka=Content）
  return (
    <PopoverRoot>
      <PopoverAnchor key={`${locale}:${releaseNotesTitle}`}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="w-96 max-w-[calc(100vw-2rem)] flex-col items-start gap-2 rounded-xl border-popover-border bg-popover px-4 py-3 text-left text-popover-foreground shadow-md"
        >
          <div className="flex w-full min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-ui-sm font-medium leading-5 text-foreground">{releaseNotesTitle}</div>
              {releaseDateLabel ? <div className="text-ui-sm leading-4 text-foreground-subtle">{releaseDateLabel}</div> : null}
            </div>
          </div>
          <div className="max-h-72 w-full overflow-y-auto border-t border-border pt-2">
            {/* 原 cj：memo 化 Markdown 渲染器（本 chunk jsx 46461），prose 排版 + 外链走 IPC */}
            <MarkdownRenderer
              className={cn(
                "prose prose-sm max-w-none text-ui-sm leading-relaxed text-foreground dark:prose-invert",
                "prose-headings:font-semibold prose-headings:tracking-tight",
                "prose-h1:text-ui-lg prose-h2:text-ui-base prose-h3:text-ui-base",
              )}
              onOpenExternalUrl={onOpenExternalUrl}
            >
              {releaseNotesMarkdown}
            </MarkdownRenderer>
          </div>
        </PopoverContent>
      </PopoverAnchor>
    </PopoverRoot>
  );
}

/* ── tombstone（A0-S3c）：CommandInput、CommandItem、CommandPalette、Dialog、DialogContent、DialogFooter、DialogHeader、DialogTitle、PopoverContentPrimitive、PopoverRoot、PopoverTriggerPrimitive declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */

/**
 * 原 POt（styles 129142-129312 / jsx 108678-108830）：更新对话框控制器。
 * 职责：拉取自动更新偏好（getAutoUpdatePreferences + onSettingsChanged 订阅）、
 * 下载/取消/跳过/重启安装四类异步动作（每类带 pending 动作锁 + 1.5s 自动清除）、
 * 重启前若有运行中会话先走 useConfirmDialog 确认、发行说明 LRU 缓存。
 * 最终渲染原 COt（Modals.UpdateStatusDialog）呈现层。
 * 注：bundle 调用面另传 localizedUpdateReleaseNotes / onOpenReleaseNotesExternalUrl 两 prop，
 * COt 解构面（styles 128812）不消费，Modals 属主型面亦未声明，故不透传。
 */
function UpdateStatusDialogController({
  platform,
  version,
  updateState,
  open,
  onOpenChange,
  edgeToEdge = false,
  showOverlay = true,
}: {
  platform: PlatformService;
  version: string | null;
  updateState: UpdateState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edgeToEdge?: boolean;
  showOverlay?: boolean;
}) {
  const { intl, locale } = useIntlContext();
  const requestConfirmation = useConfirmDialog();
  const [autoDownloadAndInstallUpdates, setAutoDownloadAndInstallUpdates] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<null | "download" | "cancel" | "skip" | "restart">(null);
  const pendingActionRef = React.useRef<null | "download" | "cancel" | "skip" | "restart">(null);
  const releaseNotesCacheRef = React.useRef(new Map<string, { releaseDateLabel: string | null; releaseNotes: { title: string; markdown: string } }>());
  const markPendingAction = React.useCallback((action: null | "download" | "cancel" | "skip" | "restart") => {
    pendingActionRef.current = action;
    setPendingAction(action);
  }, []);
  const viewModel = resolveUpdateViewModel({ legacyReadyVersion: version, updateState });
  const lastViewModelRef = React.useRef<ReturnType<typeof resolveUpdateViewModel> | null>(null);
  // 下载中相位冻结：pending 动作期间沿用上一有效视图模型，避免版本/相位跳变
  const { dialogPhase, displayVersion, progressLabel, progressValue, releaseNotesPayload, skippableVersion } =
    viewModel.displayVersion || pendingAction === null ? viewModel : lastViewModelRef.current ?? viewModel;
  const localizedNotes = pickLocalizedReleaseNotes(releaseNotesPayload, locale);
  const releaseDateLabel = formatReleaseDate(releaseNotesPayload?.releaseDate, locale);
  const cacheKey = displayVersion ? `${locale}:${displayVersion}` : null;

  React.useEffect(() => {
    if (viewModel.displayVersion) lastViewModelRef.current = viewModel;
  }, [viewModel]);
  React.useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      platform.getAutoUpdatePreferences?.()
        .then((prefs) => {
          if (!cancelled) setAutoDownloadAndInstallUpdates(prefs.autoDownloadAndInstallUpdates);
        })
        .catch(() => {
          if (!cancelled) setAutoDownloadAndInstallUpdates(false);
        });
    };
    refresh();
    const unsubscribe = platform.onSettingsChanged?.(refresh) ?? (() => {});
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [platform]);
  React.useEffect(() => {
    if (!cacheKey || !localizedNotes) return;
    releaseNotesCacheRef.current.set(cacheKey, { releaseDateLabel, releaseNotes: localizedNotes });
    if (releaseNotesCacheRef.current.size > 8) {
      const oldest = releaseNotesCacheRef.current.keys().next().value;
      if (oldest) releaseNotesCacheRef.current.delete(oldest);
    }
  }, [releaseDateLabel, localizedNotes, cacheKey]);

  const cached = cacheKey ? releaseNotesCacheRef.current.get(cacheKey) : undefined;
  const effectiveDateLabel = releaseDateLabel ?? cached?.releaseDateLabel ?? null;
  const downloadUpdate = React.useCallback(async () => {
    if (pendingActionRef.current) return;
    markPendingAction("download");
    try {
      await platform.downloadUpdate?.();
    } catch (error) {
      markPendingAction(null);
      throw error;
    }
  }, [platform, markPendingAction]);
  const handleAutoDownloadAndInstallUpdatesChange = React.useCallback(
    async (value: boolean) => {
      setAutoDownloadAndInstallUpdates(value);
      await platform.setAutoDownloadAndInstallUpdates?.(value);
      if (value && updateState?.kind === "update-available") await downloadUpdate();
    },
    [downloadUpdate, platform, updateState?.kind],
  );
  const cancelDownload = React.useCallback(async () => {
    if (pendingActionRef.current) return;
    markPendingAction("cancel");
    try {
      await platform.cancelUpdateDownload?.();
    } catch (error) {
      markPendingAction(null);
      throw error;
    }
  }, [platform, markPendingAction]);
  const skipVersion = React.useCallback(async () => {
    if (!skippableVersion || pendingActionRef.current) return;
    markPendingAction("skip");
    try {
      await platform.skipUpdateVersion?.(skippableVersion);
      onOpenChange(false);
    } catch (error) {
      markPendingAction(null);
      throw error;
    }
  }, [onOpenChange, platform, markPendingAction, skippableVersion]);
  const restartAndInstall = React.useCallback(async () => {
    if (pendingActionRef.current) return;
    const activity = await platform.getDesktopSessionActivity?.();
    const hasActiveSessions = (activity?.runningAgentSessionCount ?? 0) + (activity?.runningRepoWikiTaskCount ?? 0) > 0;
    if (hasActiveSessions) {
      const confirmed = await requestConfirmation({
        title: intl.formatMessage({ id: "updateReady.confirm.title" }, { version: displayVersion ?? "" }),
        description: intl.formatMessage({ id: "updateReady.confirm.description" }),
        confirmLabel: intl.formatMessage({ id: "updateReady.confirm.ok" }),
        cancelLabel: intl.formatMessage({ id: "updateReady.confirm.cancel" }),
      });
      if (!confirmed) return;
    }
    markPendingAction("restart");
    try {
      await platform.quitAndInstallUpdate?.();
    } catch (error) {
      markPendingAction(null);
      throw error;
    }
  }, [displayVersion, intl, platform, requestConfirmation, markPendingAction]);

  React.useEffect(() => {
    if (!displayVersion && updateState !== null) onOpenChange(false);
  }, [displayVersion, onOpenChange, updateState]);
  React.useEffect(() => {
    if (!pendingAction) return;
    if (isPendingUpdateActionResolved(pendingAction, updateState)) {
      markPendingAction(null);
      return;
    }
    if (pendingAction === "restart") {
      if (updateState !== null && updateState.kind !== "update-downloaded") markPendingAction(null);
      return;
    }
    const timer = globalThis.setTimeout(() => markPendingAction(null), 1500);
    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [markPendingAction, pendingAction, updateState?.kind]);

  if (!displayVersion) return null;
  const releaseDateMessage = effectiveDateLabel
    ? intl.formatMessage({ id: "updateDialog.releaseDate" }, { date: effectiveDateLabel })
    : null;
  return (
    <UpdateStatusDialog
      autoDownloadAndInstallUpdates={autoDownloadAndInstallUpdates}
      displayVersion={displayVersion}
      edgeToEdge={edgeToEdge}
      intl={intl}
      isUpdateActionPending={pendingAction !== null}
      onAutoDownloadAndInstallUpdatesChange={handleAutoDownloadAndInstallUpdatesChange}
      onCancelDownload={cancelDownload}
      onDownloadUpdate={downloadUpdate}
      onOpenChange={onOpenChange}
      onRestartUpdate={restartAndInstall}
      onSkipUpdate={skipVersion}
      open={open}
      phase={dialogPhase}
      progressLabel={progressLabel}
      progressValue={progressValue}
      releaseDateLabel={releaseDateMessage}
      showOverlay={showOverlay}
      skippableVersion={skippableVersion}
    />
  );
}

/* ============================================================================
 * 2. WindowsCaptionMenu（原 S6，js 141854-142058 / jsx 117848-118005）
 * ----------------------------------------------------------------------------
 * Windows/Linux 标题栏最右侧的 ⌄ 应用菜单（原生 −□× 左边）。
 * 触发键宽 45px（或一个 caption 键宽），`border-l border-border/50` 分隔线。
 * 菜单项：新建任务 Ctrl+N / 打开工作区 Ctrl+O / 在文件管理器中打开 | 关于 /
 * 检查更新(仅 production) / 进程监视器 | 问题反馈 / 产品建议 / 用户社群(按 locale) /
 * 产品文档 / 导出日志 | [stdio tap 开关 + DevTools（开发可见）] | 关闭窗口。
 * ==========================================================================*/

export const PRODUCT_DOCS_URL = "https://zcode.z.ai/docs"; // 原 lw（js 39458）
const CAPTION_MENU_ALIGN_OFFSET = -12;              // 原 QPt（js 141842）

/** 原 $Pt：自动更新仅在生产构建可用 */
function isAutoUpdateChannelSupported(env: string = "production"): boolean {
  return env === "production";
}

/** 原 eFt：按更新状态选“检查更新”菜单项的 i18n id */
function updateMenuItemI18nId(state: UpdateState & { enabled?: boolean; kind?: string } | null): string {
  switch (state?.kind) {
    case "checking":
      return "desktopMenu.help.checkingForUpdates";
    case "update-available":
      return "desktopMenu.help.updateAvailableVersion";
    case "download-progress":
      return "desktopMenu.help.downloadingUpdateProgress";
    case "update-downloaded":
      return "desktopMenu.help.restartToUpdate";
    default:
      return "titleBar.menu.help.checkForUpdates";
  }
}

/** 原 tFt：对应的 i18n 插值 */
function updateMenuItemI18nValues(state: UpdateState): Record<string, unknown> | undefined {
  switch (state?.kind) {
    case "update-available":
    case "update-downloaded":
      return { version: state.version };
    case "download-progress":
      return { progress: state.progress };
    default:
      return undefined;
  }
}

/** 原 ZPt（js 141823）：帮助动作（反馈/文档/导出日志），S6 与 U6 共用 */
function useHelpActions({ platform, intl, openSubmit }: { platform: PlatformService; intl: IntlShape; openSubmit: (payload: FeedbackSubmitPayload) => void }) {
  return {
    openIssueReport: async () => {
      openSubmit({
        type: "bug",
        module: "其它",
        severity: "P2-中",
        includeLogs: true,
        screenshots: await captureFeedbackScreenshots(platform),
      });
    },
    openProductDocs: () => {
      platform.openExternal(PRODUCT_DOCS_URL);
    },
    exportLogs: () => {
      exportLogsWithToast(platform, intl);
    },
  };
}

interface FeedbackSubmitPayload {
  title?: string;
  type: "bug" | "feature";
  module: string;
  severity: string;
  includeLogs: boolean;
  description?: string;
  screenshots?: Blob[];
}

/** 原 YPt（js 141785）：截屏作为反馈附件 */
async function captureFeedbackScreenshots(platform: PlatformService): Promise<Blob[]> {
  const shot = await platform.captureWindowScreenshot?.().catch(() => null);
  return shot ? [shot] : [];
}

/** 原 XPt（js 141789）：导出日志（无限时长 toast 直到完成） */
async function exportLogsWithToast(platform: PlatformService, intl: IntlShape) {
  const pendingId = toast(intl.formatMessage({ id: "sidebar.exportLogs.pending" }), { durationMs: Infinity });
  try {
    const result = await platform.exportLogs();
    if (!result.success) {
      toast(intl.formatMessage({ id: "sidebar.exportLogs.error" }, { error: result.error ?? "unknown" }));
    }
  } catch (error) {
    toast(intl.formatMessage({ id: "sidebar.exportLogs.error" }, { error: error instanceof Error ? error.message : String(error) }));
  } finally {
    dismissToast(pendingId);
  }
}


interface WindowsCaptionMenuProps {
  /** 只读原因：非空时禁用新建任务/文件管理器打开，并作为 tooltip */
  readOnlyReason?: string | null;
  workspaceAbsPath: string;
  onCreateTask: () => void;
  onOpenWorkspace: () => void;
  allowOpenWorkspace?: boolean;
  allowOpenInFileManager?: boolean;
  onToggleTerminal: () => void;
  onToggleBrowser: () => void;
  /** header：带 border-l 分隔线；其它场景（如首页草稿头）可去掉 */
  /** header-borderless：Windows 草稿 caption 菜单（bundle 185695/205611 实传值） */
  triggerPresentation?: "header" | "header-borderless" | "bare";
  /** Windows：按原生 caption 键宽排版 */
  useWindowsCaptionSpacing?: boolean;
}

export function WindowsCaptionMenu({
  readOnlyReason,
  workspaceAbsPath,
  onCreateTask,
  onOpenWorkspace,
  allowOpenWorkspace = true,
  allowOpenInFileManager = true,
  onToggleTerminal,
  onToggleBrowser,
  triggerPresentation = "header",
  useWindowsCaptionSpacing = false,
}: WindowsCaptionMenuProps) {
  const platform = usePlatformService();
  const { intl, locale } = useIntlContext();
  const openFeedbackSubmit = useFeedbackStore((s) => s.openSubmit);
  const openFeatureRequest = useFeedbackStore((s) => s.openFeatureRequest);
  const helpActions = useHelpActions({ platform, intl, openSubmit: openFeedbackSubmit });

  const [updateState, setUpdateState] = React.useState<UpdateState | null>(null);
  const [stdioTap, setStdioTap] = React.useState({ enabled: false, visible: false });
  const [communityAvailable, setCommunityAvailable] = React.useState(false);
  const updatesSupported = isAutoUpdateChannelSupported();

  // 打开菜单/窗口聚焦时同步自动更新状态
  const syncUpdateState = React.useCallback(async () => {
    if (!platform.getUpdateState) return;
    try {
      setUpdateState(await platform.getUpdateState());
    } catch (error) {
      logger.warn("[WindowsCaptionMenuButton] 同步自动更新状态失败", { error });
    }
  }, [platform]);

  const syncStdioTapState = React.useCallback(async () => {
    if (!platform.getZCodeStdioTapDevState) {
      setStdioTap({ enabled: false, visible: false });
      return;
    }
    try {
      const state = await platform.getZCodeStdioTapDevState();
      setStdioTap({ enabled: state.enabled, visible: state.visible });
    } catch (error) {
      logger.warn("[WindowsCaptionMenuButton] 同步 stdio tap 状态失败", { error });
      setStdioTap({ enabled: false, visible: false });
    }
  }, [platform]);

  React.useEffect(() => {
    if (updatesSupported) syncUpdateState();
    syncStdioTapState();
    if (!updatesSupported) return;
    return platform.onUpdateStateChanged?.((state) => setUpdateState(state)) ?? (() => {});
  }, [platform, updatesSupported, syncStdioTapState, syncUpdateState]);

  // 社群入口按 locale/渠道灰度
  React.useEffect(() => {
    let cancelled = false;
    platform.canOpenCommunity(locale).then(
      (ok) => { if (!cancelled) setCommunityAvailable(ok); },
      () => { if (!cancelled) setCommunityAvailable(false); },
    );
    return () => { cancelled = true; };
  }, [locale, platform]);

  const handleOpenInFileManager = async () => {
    if (readOnlyReason) return;
    const result = await platform.openInFileManager(workspaceAbsPath);
    if (!result.success) toast(intl.formatMessage({ id: "appHeader.openInFileManagerFailed" }));
  };

  const runDesktopCommand = (command: DesktopCommand) => {
    void (async () => {
      await platform.executeDesktopCommand(command);
      if (command === DesktopCommand.CheckForUpdates) await syncUpdateState();
    })();
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) { if (updatesSupported) syncUpdateState(); syncStdioTapState(); } }}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className={cn(
            "text-foreground-subtle hover:text-foreground [app-region:no-drag]",
            useWindowsCaptionSpacing ? WINDOWS_CAPTION_BUTTON_CLASS : "h-full w-[45px] rounded-none",
            "border-0 hover:bg-hover",
            triggerPresentation === "header" && "border-l border-border/50",
          )}
          aria-label={intl.formatMessage({ id: "titleBar.windowMenu" })}
        >
          <IconChevronDown className="size-5 text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" alignOffset={CAPTION_MENU_ALIGN_OFFSET} side="bottom" sideOffset={8} className="w-72 rounded-2xl border border-popover-border bg-menu p-2">
        {/* 文件 */}
        <DropdownMenuItem disabled={!!readOnlyReason} title={readOnlyReason ?? undefined} onSelect={() => { if (!readOnlyReason) onCreateTask(); }}>
          {intl.formatMessage({ id: "titleBar.menu.file.newTask" })}
          <DropdownMenuShortcut>{shortcutLabel("N")}</DropdownMenuShortcut>
        </DropdownMenuItem>
        {allowOpenWorkspace ? (
          <DropdownMenuItem onSelect={onOpenWorkspace}>
            {intl.formatMessage({ id: "workspace.openWorkspace" })}
            <DropdownMenuShortcut>{shortcutLabel("O")}</DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : null}
        {allowOpenInFileManager ? (
          <DropdownMenuItem disabled={!!readOnlyReason} title={readOnlyReason ?? undefined} onSelect={handleOpenInFileManager}>
            {intl.formatMessage({ id: "appHeader.openInFileExplorer" })}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        {/* 关于 / 更新 / 进程监视器 */}
        <DropdownMenuItem onSelect={() => runDesktopCommand(DesktopCommand.ShowAbout)}>
          {intl.formatMessage({ id: "titleBar.menu.help.about" })}
        </DropdownMenuItem>
        {updatesSupported ? (
          <DropdownMenuItem disabled={(updateState as { enabled?: boolean } | null)?.enabled === false} onSelect={() => runDesktopCommand(DesktopCommand.CheckForUpdates)}>
            {intl.formatMessage({ id: updateMenuItemI18nId(updateState) }, updateMenuItemI18nValues(updateState))}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={() => runDesktopCommand(DesktopCommand.OpenProcessMonitor)}>
          {intl.formatMessage({ id: "titleBar.menu.help.processMonitor" })}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* 反馈 / 建议 / 社群 / 文档 / 日志 */}
        <DropdownMenuItem onSelect={helpActions.openIssueReport}>{intl.formatMessage({ id: "titleBar.menu.help.feedback" })}</DropdownMenuItem>
        <DropdownMenuItem onSelect={openFeatureRequest}>{intl.formatMessage({ id: "workspaceHeader.help.productRequest" })}</DropdownMenuItem>
        {communityAvailable ? (
          <DropdownMenuItem onSelect={() => runDesktopCommand(DesktopCommand.OpenCommunity)}>
            {intl.formatMessage({ id: "sidebar.menu.community" })}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={helpActions.openProductDocs}>{intl.formatMessage({ id: "workspaceHeader.help.docs" })}</DropdownMenuItem>
        <DropdownMenuItem onSelect={helpActions.exportLogs}>{intl.formatMessage({ id: "titleBar.menu.help.exportLogs" })}</DropdownMenuItem>
        {/* 开发调试段：仅当 stdio tap 功能可见时出现 */}
        {stdioTap.visible ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={stdioTap.enabled}
              onCheckedChange={() => {
                void (async () => {
                  await platform.executeDesktopCommand(DesktopCommand.ToggleZCodeStdioTapDevProxy);
                  await syncStdioTapState();
                })();
              }}
            >
              {intl.formatMessage({ id: "titleBar.menu.help.toggleZCodeStdioTap" })}
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem onSelect={() => runDesktopCommand(DesktopCommand.ToggleDevTools)}>
              {intl.formatMessage({ id: "titleBar.menu.help.toggleDevTools" })}
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => runDesktopCommand(DesktopCommand.CloseWindow)}>
          {intl.formatMessage({ id: "titleBar.menu.file.closeWindow" })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================================================
 * 3. TerminalToggleButton（原 H6，js 143316 / jsx 119406）
 *    终端面板开关：快捷键 Ctrl+J；激活态 `!bg-selected`（选中色底）。
 *    注意：终端本体是会话列内的底部 dock，这里只是开关。
 * ==========================================================================*/

interface TerminalToggleButtonProps {
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  disabledReason?: string | null;
  useWindowsCaptionSpacing?: boolean;
}

export function TerminalToggleButton({ isTerminalOpen, onToggleTerminal, disabledReason, useWindowsCaptionSpacing = false }: TerminalToggleButtonProps) {
  const { intl } = useIntlContext();
  const label = intl.formatMessage({ id: "terminal.toggle" });
  return (
    <Tooltip title={disabledReason ?? label} side="bottom" shortcut={shortcutLabel("J")}>
      <Button
        type="button"
        variant="ghost"
        size="icon-md"
        data-testid="terminal-toggle"
        className={cn(
          "text-foreground hover:bg-hover hover:text-foreground [app-region:no-drag]",
          useWindowsCaptionSpacing && "h-full w-[var(--windows-caption-control-width,46px)] rounded-none",
          isTerminalOpen && "!bg-selected text-foreground",
        )}
        aria-label={label}
        disabled={!!disabledReason}
        onClick={onToggleTerminal}
      >
        <IconSquareTerminal className="size-4" />
      </Button>
    </Tooltip>
  );
}

/* ============================================================================
 * 4. HelpMenu（原 U6，js 143345 / jsx 119420）
 *    帮助菜单：问题反馈 / 产品建议 / 用户社群 / 产品文档 / 导出日志。
 *    仅 Mac 会话头显示（Win/Linux 由 WindowsCaptionMenu 承载这些项）。
 * ==========================================================================*/

export function HelpMenu({ className }: { className?: string }) {
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const openFeedbackSubmit = useFeedbackStore((s) => s.openSubmit);
  const openFeatureRequest = useFeedbackStore((s) => s.openFeatureRequest);
  const menuLabel = intl.formatMessage({ id: "workspaceHeader.help.menu" });
  const helpActions = useHelpActions({ platform, intl, openSubmit: openFeedbackSubmit });

  return (
    <DropdownMenu>
      <Tooltip title={menuLabel} side="bottom">
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            className={cn("text-foreground hover:bg-hover hover:text-foreground [app-region:no-drag]", className)}
            aria-label={menuLabel}
          >
            <IconCircleQuestionMark className="size-4" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={helpActions.openIssueReport}>
          <IconMessageSquare className="size-4" />
          {intl.formatMessage({ id: "workspaceHeader.help.issueReport" })}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={openFeatureRequest}>
          <IconLightbulb className="size-4" />
          {intl.formatMessage({ id: "workspaceHeader.help.productRequest" })}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { platform.openCommunity(); }}>
          <IconUsers className="size-4" />
          {intl.formatMessage({ id: "workspaceHeader.help.community" })}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={helpActions.openProductDocs}>
          <IconBookOpen className="size-4" />
          {intl.formatMessage({ id: "workspaceHeader.help.docs" })}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={helpActions.exportLogs}>
          <IconFileArchive className="size-4" />
          {intl.formatMessage({ id: "titleBar.menu.help.exportLogs" })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================================================
 * 5. SessionHeader（原 TFt，js 144008-144152 / jsx 119938-120036）
 * ----------------------------------------------------------------------------
 * 会话视图的头部行：`h-12 border-b`。整行 [app-region:drag]（可拖拽窗口），
 * 左右两簇内部 no-drag。结构：
 *   <header> = [左簇 wFt | 右簇 SFt]（drag 区，内边距随侧栏隐藏/更新就绪做动画）
 *            + 非 Mac 桌面额外挂 S6（⌄ 菜单，原生 −□× 左侧）。
 * 非 Mac 桌面 header 加 `pr-[120px]` 给原生窗口控制让位（规格 §13.5 证实）。
 * ==========================================================================*/

interface SessionHeaderProps {
  readOnlyReason?: string | null;
  workspaceAbsPath: string;
  remoteSessionId?: string | null;
  workspaceIdentity?: string | null;
  remoteTarget?: RemoteTarget | null;
  localWorkspacePath?: string;
  projectName: string;
  activeTaskTitle?: string | null;
  activeTaskChangeSummary?: string | null;
  hasUpdateReady?: boolean;
  activeTaskId?: string | null;
  activeTraceId?: string | null;
  activeSessionId?: string | null;
  activeTaskProvider?: string | null;
  resolvedActiveTaskMeta?: TaskMeta | null;
  sessionLogPath?: string | null;
  nativeSessionLogProvider?: string | null;
  nativeSessionLogPath?: string | null;
  nativeSessionLogExists?: boolean;
  nativeSessionLogLoading?: boolean;
  providerWorkspaceConfigPath?: string | null;
  providerWorkspaceConfigExists?: boolean;
  providerWorkspaceConfigLoading?: boolean;
  workspaceHeaderState: { selectedProvider?: string | null };
  gitSummary: GitSummary;
  gitDirtyFileCount: number;
  isMacDesktop: boolean;
  isMacFullscreen: boolean;
  isWindowsDesktop: boolean;
  isWebRemoteControl?: boolean;
  windowsWindowControlsRightPaddingPx?: number;
  isDesktop: boolean;
  simplifyForNarrowRemote?: boolean;
  isSidebarVisible: boolean;
  isTerminalOpen: boolean;
  isSidePaneOpen: boolean;
  onRefreshGit: () => void;
  onToggleTerminal: () => void;
  onToggleBrowser: () => void;
  onToggleSidePane: () => void;
  toggleSidePaneShortcutLabel?: string;
  onReloadSession?: () => void;
  reloadSessionDisabled?: boolean;
  reloadSessionPending?: boolean;
  onCreateTask: () => void;
  onOpenWorkspace: () => void;
  allowOpenWorkspace?: boolean;
}

interface TaskMeta {
  taskId: string;
  workspacePath: string; // A0-CLEANUP4：束 e_e 返回面恒含 workspacePath（store 实体 + Pge 会话回退，js 24501/24737/24794）
  /* A1-R9 E6/k6 收敛精化：原弱型面（title?/forkedFromTaskId? + 索引签名）与 canonical
   * stores/ PinnedTask/TimelineTask 富面不合（upsertTask 消费面 2336–2394 = bundle
   * 143674–143928 簇）。按 bundle 真形精化：e_e@24771 返回任务元对象（Vo
   * taskMetaByEntityKey 实体 ⊕ Pge@24501 会话回退，两支均恒含 title/createdAt/
   * updatedAt；Qge@24740 比较器枚举全字段面）。成员面与 stores/ PinnedTask 对齐
   * （可指派）；索引签名保留（本文件消费面读动态字段）。 */
  title: string;
  createdAt: number;
  updatedAt: number;
  status?: string;
  unreadAt?: number | null;
  provider?: string;
  model?: string;
  forkedFromTaskId?: string | null;
  pinned?: boolean;
  archived?: boolean;
  cronAutomationId?: string | null;
  automationId?: string | null;
  offPeakTaskId?: string | null;
  pendingInteraction?: {
    interactionId: string;
    kind?: string;
    toolName?: string;
    autoResolution?: { state: string; visibleAt: number; deadlineAt: number; startedAt?: number } | null;
  } | null;
  changeSummary?: { fileCount: number; added: number; removed: number; files: Array<{ path: string; added: number; removed: number; writeCount: number; lastTurnIndex: number; [key: string]: unknown }>; [key: string]: unknown } | null; // A1-R10 2c 精化：canonical 真形（np@6874 strict；helpers TaskChangeSummary 同面）
  __zcodeSessionActivity?: {
    phase: string;
    lastActivityAt: number;
    pendingInteractions?: { permissionCount: number; userInputCount: number }; // A1-R10 2c 精化：去 | null（canonical helpers SessionActivity 面）
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export function SessionHeader({
  readOnlyReason,
  workspaceAbsPath,
  remoteSessionId,
  workspaceIdentity,
  remoteTarget,
  localWorkspacePath,
  projectName,
  activeTaskTitle,
  activeTaskChangeSummary,
  hasUpdateReady,
  activeTaskId,
  activeTraceId,
  activeSessionId,
  activeTaskProvider,
  resolvedActiveTaskMeta,
  sessionLogPath,
  nativeSessionLogProvider,
  nativeSessionLogPath,
  nativeSessionLogExists,
  nativeSessionLogLoading,
  providerWorkspaceConfigPath,
  providerWorkspaceConfigExists,
  providerWorkspaceConfigLoading,
  workspaceHeaderState,
  gitSummary,
  gitDirtyFileCount,
  isMacDesktop,
  isMacFullscreen,
  isWindowsDesktop,
  isWebRemoteControl = false,
  windowsWindowControlsRightPaddingPx,
  isDesktop,
  simplifyForNarrowRemote = false,
  isSidebarVisible,
  isTerminalOpen,
  isSidePaneOpen,
  onRefreshGit,
  onToggleTerminal,
  onToggleBrowser,
  onToggleSidePane,
  toggleSidePaneShortcutLabel,
  onReloadSession,
  reloadSessionDisabled,
  reloadSessionPending,
  onCreateTask,
  onOpenWorkspace,
  allowOpenWorkspace = true,
}: SessionHeaderProps) {
  // 右簇编辑器选择 → 透传给左簇（编辑器按钮组与任务菜单联动）
  const [selectedEditor, setSelectedEditor] = React.useState<InstalledEditor | null>(null);

  const isSidebarHidden = !isSidebarVisible;
  // 非 Mac 且非 Windows 的桌面 = Linux
  const isLinuxDesktop = !!(isDesktop && !isMacDesktop && !isWindowsDesktop);
  const isNonMacDesktop = isWindowsDesktop || isLinuxDesktop;
  const windowsCaptionStyle = isWindowsDesktop
    ? { ...windowsCaptionInsetStyle(windowsWindowControlsRightPaddingPx), paddingRight: WINDOWS_CAPTION_RIGHT_INSET_VAR }
    : undefined;

  // 侧栏隐藏时，头部内容要顶到窗口左缘：按平台/全屏/更新就绪给出不同左内边距，
  // 配合 `transition-[padding] duration-300` 做让位动画
  let sidebarHiddenPaddingClass: string | false = false;
  if (isSidebarHidden) {
    sidebarHiddenPaddingClass = isMacDesktop
      ? hasUpdateReady
        ? (isMacFullscreen ? "pl-48" : "pl-66")
        : (isMacFullscreen ? "pl-38" : "pl-58")
      : hasUpdateReady
        ? "pl-44"
        : "pl-38";
  }

  return (
    <header
      data-testid="workspace-header"
      style={windowsCaptionStyle}
      className={cn(
        "@container/workspace-header flex w-full shrink-0 h-12 border-b border-border",
        isLinuxDesktop && "pr-[120px]", // 给 Linux 原生窗口控制让位
      )}
    >
      {/* 整行 drag 区：左簇内容 + 右簇控件，内边距变化有 300ms 过渡 */}
      <div
        className={cn(
          "flex h-12 flex-1 min-w-0 items-center justify-between gap-2 overflow-hidden p-2 pl-4 [app-region:drag] transition-[padding] duration-300",
          isWindowsDesktop && "pr-0",
          sidebarHiddenPaddingClass,
        )}
      >
        <SessionHeaderLeft
          readOnlyReason={readOnlyReason}
          workspaceAbsPath={workspaceAbsPath}
          remoteSessionId={remoteSessionId}
          workspaceIdentity={workspaceIdentity}
          remoteTarget={remoteTarget}
          localWorkspacePath={localWorkspacePath}
          projectName={projectName}
          activeTaskTitle={activeTaskTitle}
          activeTaskChangeSummary={activeTaskChangeSummary}
          activeTaskId={activeTaskId}
          activeTraceId={activeTraceId}
          activeSessionId={activeSessionId}
          activeTaskProvider={activeTaskProvider}
          resolvedActiveTaskMeta={resolvedActiveTaskMeta}
          gitSummary={gitSummary}
          gitDirtyFileCount={gitDirtyFileCount}
          sessionLogPath={sessionLogPath}
          nativeSessionLogProvider={nativeSessionLogProvider}
          nativeSessionLogPath={nativeSessionLogPath}
          nativeSessionLogExists={nativeSessionLogExists}
          nativeSessionLogLoading={nativeSessionLogLoading}
          providerWorkspaceConfigPath={providerWorkspaceConfigPath}
          providerWorkspaceConfigExists={providerWorkspaceConfigExists}
          providerWorkspaceConfigLoading={providerWorkspaceConfigLoading}
          workspaceHeaderState={workspaceHeaderState}
          isMacDesktop={isMacDesktop}
          isMacFullscreen={isMacFullscreen}
          isWindowsDesktop={isWindowsDesktop}
          isWebRemoteControl={isWebRemoteControl}
          simplifyForNarrowRemote={simplifyForNarrowRemote}
          selectedEditor={selectedEditor}
          onReloadSession={onReloadSession}
          reloadSessionDisabled={reloadSessionDisabled}
          reloadSessionPending={reloadSessionPending}
          onRefreshGit={onRefreshGit}
        />
        <SessionHeaderRight
          readOnlyReason={readOnlyReason}
          workspaceAbsPath={workspaceAbsPath}
          workspaceIdentity={workspaceIdentity}
          remoteTarget={remoteTarget}
          isTerminalOpen={isTerminalOpen}
          isSidePaneOpen={isSidePaneOpen}
          onToggleTerminal={onToggleTerminal}
          onToggleSidePane={onToggleSidePane}
          toggleSidePaneShortcutLabel={toggleSidePaneShortcutLabel}
          simplifyForNarrowRemote={simplifyForNarrowRemote}
          hideHelpMenu={isNonMacDesktop}
          useWindowsCaptionSpacing={!!isWindowsDesktop}
          onSelectedEditorChange={setSelectedEditor}
        />
      </div>
      {/* 非 Mac 桌面：⌄ 应用菜单贴在原生 −□× 左侧（Mac 用交通灯+应用菜单键，无此项） */}
      {isNonMacDesktop ? (
        <div className={cn("flex items-center [app-region:no-drag]", isWindowsDesktop ? "gap-0" : "gap-1")}>
          <WindowsCaptionMenu
            readOnlyReason={readOnlyReason}
            workspaceAbsPath={workspaceAbsPath}
            onCreateTask={onCreateTask}
            onOpenWorkspace={onOpenWorkspace}
            allowOpenWorkspace={allowOpenWorkspace}
            onToggleTerminal={onToggleTerminal}
            onToggleBrowser={onToggleBrowser}
            useWindowsCaptionSpacing={!!isWindowsDesktop}
          />
        </div>
      ) : null}
    </header>
  );
}

/* ============================================================================
 * 5.1 SessionHeaderRight（原 SFt，js 143418-143481 / jsx 119457-119492）
 *     右簇顺序：[在 IDE 中打开][帮助菜单(仅Mac)][终端开关][侧面板开关]。
 *     窄远程会话（simplifyForNarrowRemote）时砍掉帮助+终端，只留编辑器和面板开关。
 * ==========================================================================*/

interface SessionHeaderRightProps {
  readOnlyReason?: string | null;
  workspaceAbsPath: string;
  workspaceIdentity?: string | null;
  remoteTarget?: RemoteTarget | null;
  isTerminalOpen: boolean;
  isSidePaneOpen: boolean;
  onToggleTerminal: () => void;
  onToggleSidePane: () => void;
  toggleSidePaneShortcutLabel?: string;
  onSelectedEditorChange?: (editor: InstalledEditor | null) => void;
  simplifyForNarrowRemote?: boolean;
  hideHelpMenu?: boolean;
  useWindowsCaptionSpacing?: boolean;
}

export function SessionHeaderRight({
  readOnlyReason,
  workspaceAbsPath,
  workspaceIdentity,
  remoteTarget,
  isTerminalOpen,
  isSidePaneOpen,
  onToggleTerminal,
  onToggleSidePane,
  toggleSidePaneShortcutLabel,
  onSelectedEditorChange,
  simplifyForNarrowRemote = false,
  hideHelpMenu = false,
  useWindowsCaptionSpacing = false,
}: SessionHeaderRightProps) {
  const { intl } = useIntlContext();
  // 面板打开 → “收起”图标(panel-right-close)；关闭 → “展开”图标
  const SidePaneToggleIcon = isSidePaneOpen ? IconPanelRightClose : IconPanelRightOpen;

  return (
    <div className={cn("flex shrink-0 items-center [app-region:no-drag]", useWindowsCaptionSpacing ? "-my-2 h-12 gap-0" : "gap-0.5")}>
      <OpenInEditorButtonGroup
        disabledReason={readOnlyReason}
        workspaceAbsPath={workspaceAbsPath}
        workspaceIdentity={workspaceIdentity}
        remoteTarget={remoteTarget}
        onSelectedEditorChange={onSelectedEditorChange}
      />
      {simplifyForNarrowRemote ? null : (
        <>
          {hideHelpMenu ? null : <HelpMenu />}
          <TerminalToggleButton isTerminalOpen={isTerminalOpen} onToggleTerminal={onToggleTerminal} disabledReason={readOnlyReason} useWindowsCaptionSpacing={useWindowsCaptionSpacing} />
        </>
      )}
      {/* 右侧摘要面板开关：激活态 !bg-selected */}
      <Tooltip title={intl.formatMessage({ id: "sidePane.togglePanel" })} side="bottom" shortcut={toggleSidePaneShortcutLabel}>
        <Button
          type="button"
          variant="ghost"
          size="icon-md"
          className={cn(
            "text-foreground hover:bg-hover hover:text-foreground",
            useWindowsCaptionSpacing && "h-full w-[var(--windows-caption-control-width,46px)] rounded-none",
            isSidePaneOpen && "!bg-selected text-foreground",
          )}
          aria-label={intl.formatMessage({ id: isSidePaneOpen ? "sidePane.collapse" : "sidePane.expand" })}
          onClick={onToggleSidePane}
        >
          <SidePaneToggleIcon className="size-4" />
        </Button>
      </Tooltip>
    </div>
  );
}

/* ============================================================================
 * 5.2 OpenInEditorButtonGroup（原 xFt，js 143194 / jsx 119336）
 *     “在 IDE 中打开”分裂按钮：主按钮=最近选择的编辑器图标；⌄=切换编辑器。
 *     远程 server 目标不渲染；选择会持久化（原 KVe/kA：localStorage 记忆）。
 * ==========================================================================*/

function OpenInEditorButtonGroup({
  disabledReason,
  workspaceAbsPath,
  workspaceIdentity,
  remoteTarget,
  onSelectedEditorChange,
}: {
  disabledReason?: string | null;
  workspaceAbsPath: string;
  workspaceIdentity?: string | null;
  remoteTarget?: RemoteTarget | null;
  onSelectedEditorChange?: (editor: InstalledEditor | null) => void;
}) {
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const [installedEditors, setInstalledEditors] = React.useState<InstalledEditor[]>([]);
  const [selectedEditorId, setSelectedEditorId] = React.useState<string | null>(() => readPreferredEditorId());

  React.useEffect(() => {
    let cancelled = false;
    platform.getInstalledEditors().then(
      (editors) => { if (!cancelled) setInstalledEditors(editors); },
    ).catch((error) => {
      logger.warn("[WorkspaceEditorButtonGroup] 获取已安装 IDE 列表失败:", error);
    });
    return () => { cancelled = true; };
  }, [platform]);

  // 原 JA：在已安装列表中挑出选中项（找不到则取第一个可用）
  const { availableEditors, selectedEditor } = React.useMemo(
    // remoteTarget ?? null：FTP 参数收 null 不收 undefined（属主返回形即本族 InstalledEditor 三面）
    () => resolveAvailableEditors({ installedEditors, selectedEditorId, remoteTarget: remoteTarget ?? null }),
    [installedEditors, remoteTarget, selectedEditorId],
  );

  React.useEffect(() => {
    onSelectedEditorChange?.(selectedEditor ?? null);
  }, [onSelectedEditorChange, selectedEditor]);

  // Windows 下图标缩一号（原生标题栏更矮）
  const iconClass = React.useMemo(
    () => (typeof navigator !== "undefined" && /windows/i.test(navigator.userAgent) ? "size-4 shrink-0" : "size-5 shrink-0"),
    [],
  );

  const openInEditor = (editor: InstalledEditor) => {
    if (disabledReason) return;
    setSelectedEditorId(editor.id);
    rememberPreferredEditorId(editor.id); // 原 KVe(`explicit`) && kA(editor.id)
    const remoteOpts =
      remoteTarget || workspaceIdentity
        ? {
            // A1-R5 边界转型：$b 返回三 kind 净化目标 | undefined（server 支 void）；
            // 本文件局部 RemoteTarget 三面收边（非 any cast；openInEditor opts 面）。
            remoteTarget: remoteTarget ? (sanitizeRemoteTargetForRestore(remoteTarget) as RemoteTarget | undefined) : undefined,
            workspaceIdentity: workspaceIdentity ?? undefined,
          }
        : undefined;
    platform.openInEditor(editor.id, workspaceAbsPath, remoteOpts).then((result) => {
      if (!result.success) {
        logger.warn("[WorkspaceEditorButtonGroup] 打开编辑器失败", {
          editorId: editor.id, workspaceAbsPath, workspaceIdentity, error: result.error ?? "unknown-error",
        });
      }
    });
  };

  if (!selectedEditor || remoteTarget?.kind === "server") return null;

  return (
    <div className="flex items-center h-7 rounded-lg border border-border bg-input overflow-hidden p-0 hover:border-border-hover">
      <Button
        type="button"
        variant="ghost"
        size="icon-md"
        className="size-7 rounded-none border-0"
        disabled={!!disabledReason}
        onClick={() => openInEditor(selectedEditor)}
        aria-label={intl.formatMessage({ id: "appHeader.openInEditor" }, { editor: selectedEditor.name })}
        title={disabledReason ?? intl.formatMessage({ id: "appHeader.openInEditor" }, { editor: selectedEditor.name })}
      >
        <img src={selectedEditor.iconDataUrl} alt={selectedEditor.name} className={iconClass} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            className="rounded-none border-0 text-foreground-subtlest !w-5"
            disabled={!!disabledReason}
            aria-label={intl.formatMessage({ id: "appHeader.selectOpenApp" })}
            title={disabledReason ?? intl.formatMessage({ id: "appHeader.selectOpenApp" })}
          >
            <IconChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuRadioGroup value={selectedEditor.id} onValueChange={(id) => {
            const editor = availableEditors.find((e) => e.id === id);
            if (editor) openInEditor(editor);
          }}>
            {availableEditors.map((editor) => (
              <DropdownMenuRadioItem key={editor.id} value={editor.id}>
                <img src={editor.iconDataUrl} alt={editor.name} className={iconClass} />
                {editor.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

declare function readPreferredEditorId(): string | null;
declare function rememberPreferredEditorId(id: string): void;
/* ── tombstone（A1-R5）：normalizeRemoteTarget declare 删除 → 真实 import
 *    sanitizeRemoteTargetForRestore（原 $b，src-HCld2afU.js 8611–8629，pt 导出 → 本 chunk
 *    yne，bundle 调用点 143262）from './SrcSharedB'。裁决：$b 为 1 参净化器（ssh 留
 *    sshConfigAlias、wsl 留 user、server 支 return void），与 iEt（3 参
 *    normalizeRemoteTargetForConnection，唯一调用点 123415 B2 内部）无涉——
 *    R4 §8-4「1 参 vs 3 参」疑点经 bundle 对照裁决为异符号。A0 declare 返回型
 *    `RemoteTarget` 不确（server 支 undefined），canonical 返回型以推断为准。 ── */

/* ============================================================================
 * 5.3 SessionHeaderLeft（原 wFt，js 143485-144007 / jsx 119493-119937）
 * ----------------------------------------------------------------------------
 * 左簇 = [任务标题 h1][工作区路径 pill（folder/cloud 图标 + 项目名 @远程）]
 *        [git 分支 chip + 刷新][更多 ⌄（任务操作 + 远程同步）][重载 spinner]。
 * 还内嵌：任务重命名对话框（j6）、远程同步对话框组（r4）。
 * 容器查询断点：@max-[560px]/workspace-header 与 @max-[420px]/workspace-header
 * 逐级收缩标题/隐藏分支 chip。
 * ==========================================================================*/

interface SessionHeaderLeftProps {
  readOnlyReason?: string | null;
  workspaceAbsPath: string;
  remoteSessionId?: string | null;
  workspaceIdentity?: string | null;
  remoteTarget?: RemoteTarget | null;
  localWorkspacePath?: string;
  projectName: string;
  activeTaskTitle?: string | null;
  activeTaskChangeSummary?: string | null;
  activeTaskId?: string | null;
  activeTraceId?: string | null;
  activeSessionId?: string | null;
  activeTaskProvider?: string | null;
  resolvedActiveTaskMeta?: TaskMeta | null;
  gitSummary: GitSummary;
  gitDirtyFileCount: number;
  sessionLogPath?: string | null;
  nativeSessionLogProvider?: string | null;
  nativeSessionLogPath?: string | null;
  nativeSessionLogExists?: boolean;
  nativeSessionLogLoading?: boolean;
  providerWorkspaceConfigPath?: string | null;
  providerWorkspaceConfigExists?: boolean;
  providerWorkspaceConfigLoading?: boolean;
  reloadSessionPending?: boolean;
  workspaceHeaderState: { selectedProvider?: string | null };
  onRefreshGit: () => void;
  isMacDesktop: boolean;
  isMacFullscreen: boolean;
  isWindowsDesktop: boolean;
  isWebRemoteControl?: boolean;
  selectedEditor?: InstalledEditor | null;
  simplifyForNarrowRemote?: boolean;
  compact?: boolean;
  onReloadSession?: () => void;
  reloadSessionDisabled?: boolean;
}

export function SessionHeaderLeft({
  readOnlyReason,
  workspaceAbsPath,
  remoteSessionId,
  workspaceIdentity,
  remoteTarget,
  localWorkspacePath,
  projectName,
  activeTaskTitle,
  activeTaskChangeSummary,
  activeTaskId,
  activeTraceId,
  activeSessionId,
  activeTaskProvider,
  resolvedActiveTaskMeta,
  gitSummary,
  gitDirtyFileCount,
  sessionLogPath,
  nativeSessionLogProvider,
  nativeSessionLogPath,
  nativeSessionLogExists,
  nativeSessionLogLoading,
  providerWorkspaceConfigPath,
  providerWorkspaceConfigExists,
  providerWorkspaceConfigLoading,
  reloadSessionPending,
  workspaceHeaderState,
  onRefreshGit,
  isMacDesktop,
  isMacFullscreen,
  isWindowsDesktop,
  isWebRemoteControl = false,
  selectedEditor,
  simplifyForNarrowRemote = false,
  compact = false,
}: SessionHeaderLeftProps) {
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const openFeedbackSubmit = useFeedbackStore((s) => s.openSubmit);
  const confirmDialog = useConfirmDialog();

  // 服务上下文：远程（按工作区）与本机基础服务（原 Oc / Ec）
  const workspaceServices = useWorkspaceServices(workspaceAbsPath, remoteSessionId, workspaceIdentity);
  const baseServices = useBaseServices();

  // 任务列表 store 操作（原 xe：useTaskStore）
  const removeTaskState = useTaskStore((s) => s.removeTaskState);
  const upsertOptimisticTaskListItem = useTaskStore((s) => s.upsertOptimisticTaskListItem);
  const removeOptimisticTaskListItem = useTaskStore((s) => s.removeOptimisticTaskListItem);
  const setTaskUnreadIndicator = useTaskStore((s) => s.setTaskUnreadIndicator);

  const [isTaskMenuOpen, setTaskMenuOpen] = React.useState(false);
  const [renamingTaskId, setRenamingTaskId] = React.useState<string | null>(null);
  const [renameDraft, setRenameDraft] = React.useState("");
  const [skillSyncOpen, setSkillSyncOpen] = React.useState(false);
  const [mcpSyncOpen, setMcpSyncOpen] = React.useState(false);
  const [pluginSyncOpen, setPluginSyncOpen] = React.useState(false);
  const renameInputRef = React.useRef<HTMLInputElement>(null!);

  // “置顶标签页”用的当前工作区条目（原 me）
  const pinnedWorkspaceTabs = React.useMemo(
    () => [{
      id: `header-${workspaceIdentity?.trim() || workspaceAbsPath}`,
      kind: "workspace" as const,
      workspacePath: workspaceAbsPath,
      label: projectName,
      remoteSessionId,
      workspaceIdentity,
    }],
    [projectName, remoteSessionId, workspaceAbsPath, workspaceIdentity],
  );

  // 置顶任务列表（原 ZS = useTaskListItems）：判断当前任务是否已置顶
  const pinnedTaskList = useTaskListItems({
    kind: "pinned",
    workspaceTabs: isTaskMenuOpen && activeTaskId ? pinnedWorkspaceTabs : [],
    sortBy: "updated",
    searchQuery: "",
    expanded: true,
    collapsedLimit: 20,
  });
  const isTaskPinned = !!(activeTaskId && pinnedTaskList.items.some((item) => item.taskId === activeTaskId));

  const taskMeta = resolvedActiveTaskMeta ?? null;
  const effectiveTaskId = taskMeta?.taskId ?? activeTaskId;
  const hasNoTask = !effectiveTaskId;
  const pinLoading = isTaskMenuOpen && !!effectiveTaskId && pinnedTaskList.loading;

  const effectiveProvider = resolveEffectiveProvider(activeTaskProvider, workspaceHeaderState.selectedProvider);

  // 任务文件操作（会话文件/原生日志/供应商配置 的路径、复制、在文件管理器打开）
  const taskFileActions = useTaskFileActions({
    workspacePath: workspaceAbsPath,
    remoteSessionId,
    workspaceIdentity,
    taskId: activeTaskId ?? "",
    provider: activeTaskProvider ?? effectiveProvider,
    intl,
  });

  // 远程目标展示：`项目名 @ host[:port]`（cloud 图标）；本地为 folder 图标
  // A1-R5 归属更正：bundle wFt 143599 `je = i ? ZTt(i) : null` = 连接地址（ZTt，host[:port]），
  // 非 XTt 显示标签（XTt 唯一 bundle 调用点 128568 yOt → Home.remoteTabSearchHaystack）；
  // R4 改指误作 XTt，此处更正为 ZTt=remoteTargetConnectionAddress（返回 string | undefined 兼容）。
  const remoteTargetLabel = remoteTarget ? remoteTargetConnectionAddress(remoteTarget) : null;
  const decoratedProjectName = sshDecoratedProjectName(projectName, remoteTarget);
  const showRemoteSuffix = !!(remoteTargetLabel && decoratedProjectName === projectName);
  const isRemoteWorkspace = !!(remoteTargetLabel || workspaceIdentity?.trim() || remoteSessionId);

  // 是否允许“查看轨迹/远程同步”（原 CFt→$2：web 回放模式或无本地源服务时禁用）
  const canOpenRemoteSessionSource = canOpenRemoteSessionSourceCheck({
    remoteSessionId,
    remoteTarget,
    clientMode: isWebRemoteControl ? "web-remote-replayable" : "desktop-continuous",
    hasLocalSourceService: !!(baseServices.skillSyncService && baseServices.mcpSyncService && baseServices.pluginSyncService),
  });

  const isSessionReloading = reloadSessionPending;
  const sessionReloadingLabel = intl.formatMessage({ id: "appHeader.workspaceSessionActionLoading" });
  const isUntitledTask = activeTaskId === null;

  /* ---- 任务反馈（从更多菜单发起，模板含任务/工作区/日志路径） ---- */
  const openTaskFeedback = async () => {
    const title = activeTaskTitle || intl.formatMessage({ id: taskMeta?.forkedFromTaskId ? "taskList.forkedUntitled" : "taskList.untitled" });
    const screenshot = await platform.captureWindowScreenshot?.().catch(() => null);
    openFeedbackSubmit({
      title: intl.formatMessage({ id: "feedback.submit.template.section.taskFeedbackTitle" }, { title }).slice(0, 80),
      type: "bug",
      module: "Agent任务执行失败",
      severity: "P2-中",
      includeLogs: true,
      description: buildTaskFeedbackDescription({
        taskTitle: title,
        taskId: effectiveTaskId ?? undefined,
        workspacePath: workspaceAbsPath,
        taskSessionPath: taskFileActions.taskSessionFile.path,
        taskLogPath: taskFileActions.taskNativeSessionLogFile.path,
        formatMessage: (id, values) => intl.formatMessage({ id }, values),
      }),
      screenshots: screenshot ? [screenshot] : [],
    });
    toast(intl.formatMessage({ id: "taskList.feedbackOpened" }));
  };

  /* ---- D5c：在 TUI 中编辑此任务（底部终端 dock 新建一页 exec nofy 任务编辑模式） ----
   * 产品口径：TUI=具体任务的编辑器，入口只挂在任务上；无 session 时禁用。
   * 会话 id=当前任务 session id（activeSessionId，SessionRegistry 键）；cwd=任务工作区。 */
  const requestEditTaskInTui = () => {
    if (!activeSessionId || readOnlyReason) return;
    logger.info("[App] 请求在 TUI 中编辑此任务", { sessionId: activeSessionId, workspace: workspaceAbsPath });
    useTuiEditRequestStore.getState().requestOpen({
      workspaceKey: workspaceIdentity?.trim() || workspaceAbsPath,
      sessionId: activeSessionId,
      cwd: workspaceAbsPath,
    });
  };

  /* ---- 重命名 ---- */
  const startRename = () => {
    if (!effectiveTaskId) return;
    setRenamingTaskId(effectiveTaskId);
    setRenameDraft(taskMeta?.title ?? activeTaskTitle ?? "");
  };
  const cancelRename = () => { setRenamingTaskId(null); setRenameDraft(""); };
  const confirmRename = async () => {
    if (!renamingTaskId) return;
    const nextTitle = renameDraft.trim();
    const previousTitle = taskMeta?.title ?? activeTaskTitle ?? "";
    if (nextTitle === previousTitle.trim()) { cancelRename(); return; }
    try {
      const renamed = await workspaceServices.zcodeTaskService.renameTask({
        taskId: renamingTaskId,
        workspacePath: workspaceAbsPath,
        title: nextTitle,
        ...(workspaceIdentity ? { workspaceIdentity } : {}),
      });
      upsertOptimisticTaskListItem(workspaceAbsPath, renamed, workspaceIdentity);
      // 远程工作区：同步置顶/普通两个列表 store（原 E6/k6）
      if (workspaceIdentity) {
        if (isTaskPinned) usePinnedTaskListStore.getState().upsertTask(renamed);
        else useWorkspaceTaskListStore.getState().upsertTask(renamed);
      }
      applyOptimisticTaskMutation({
        previousTask: mergeTask(renamed, { title: previousTitle }),
        nextTask: renamed,
        previousState: { pinned: isTaskPinned, archived: false },
        nextState: { pinned: isTaskPinned, archived: false },
      });
      cancelRename();
    } catch {
      toast(intl.formatMessage({ id: "taskList.renameFailed" }));
    }
  };

  /* ---- 归档（先确认对话框） ---- */
  const archiveTask = async () => {
    if (!effectiveTaskId) return;
    const confirmed = await confirmDialog({
      title: intl.formatMessage({ id: "confirmDialog.taskArchiveTitle" }),
      description: intl.formatMessage({ id: "confirmDialog.taskArchiveDescription" }, {
        taskTitle: taskMeta?.title?.trim() || activeTaskTitle?.trim() || intl.formatMessage({ id: "taskList.untitled" }),
      }),
      confirmLabel: intl.formatMessage({ id: "taskList.archive" }),
    });
    if (!confirmed) return;
    cancelRename();
    workspaceServices.zcodeTaskService
      .archiveTask({ taskId: effectiveTaskId, workspacePath: workspaceAbsPath, ...(workspaceIdentity ? { workspaceIdentity } : {}) })
      .then((archived) => {
        removeTaskState(workspaceAbsPath, effectiveTaskId, workspaceIdentity);
        if (workspaceIdentity) {
          usePinnedTaskListStore.getState().removeTask(workspaceAbsPath, effectiveTaskId, workspaceIdentity);
          useWorkspaceTaskListStore.getState().removeTask(workspaceAbsPath, effectiveTaskId, workspaceIdentity);
        }
        applyOptimisticTaskMutation({
          previousTask: mergeTask(archived),
          nextTask: archived,
          previousState: { pinned: isTaskPinned, archived: false },
          nextState: { pinned: false, archived: true },
        });
      });
  };

  const mergeTask = (base: TaskMeta, patch?: Partial<TaskMeta>): TaskMeta =>
    taskMeta ? { ...taskMeta, ...patch } : { ...(base as TaskMeta), title: activeTaskTitle ?? base.title, ...patch };

  return (
    <div className={cn("flex min-w-0 items-center gap-1 overflow-hidden [app-region:no-drag]", simplifyForNarrowRemote && "max-md:gap-1")}>
      {/* 重命名对话框（原 j6） */}
      <TaskRenameDialog
        open={renamingTaskId !== null}
        value={renameDraft}
        inputRef={renameInputRef}
        intl={intl}
        onOpenChange={(open) => { if (!open) cancelRename(); }}
        onChange={setRenameDraft}
        onCancel={cancelRename}
        onConfirm={() => { confirmRename(); }}
      />

      {/* 任务标题：@容器断点逐级收窄（560px→30vw，420px→22vw） */}
      <h1
        data-testid="workspace-title"
        className={cn(
          "flex min-w-12 max-w-100 shrink items-center gap-2 truncate font-semibold text-foreground @max-[560px]/workspace-header:max-w-[30vw] @max-[420px]/workspace-header:max-w-[22vw]",
          simplifyForNarrowRemote && "max-md:max-w-[42vw]",
          compact ? "text-[0.92rem]" : "text-ui-base",
        )}
        title={activeTaskTitle ?? undefined}
      >
        <span className="min-w-0 truncate">{activeTaskTitle}</span>
      </h1>

      {/* 工作区路径 pill：rounded-full bg-tag/50；远程=cloud 图标，本地=folder 图标 */}
      {isUntitledTask ? null : (
        <div
          data-testid="workspace-path"
          className={cn(
            "flex min-w-0 w-fit max-w-48 shrink items-center gap-0.5 overflow-hidden rounded-full bg-tag/50 text-foreground @max-[560px]/workspace-header:max-w-32 @max-[420px]/workspace-header:hidden",
            simplifyForNarrowRemote && "max-md:max-w-[46vw] max-md:shrink max-md:overflow-hidden",
            compact ? "py-0.75 pl-2 pr-2 text-[0.78rem]" : "py-1 pl-2 pr-2.5 text-ui-base",
          )}
          title={remoteTargetLabel ? `${workspaceAbsPath} (${remoteTargetLabel})` : workspaceAbsPath}
        >
          {isRemoteWorkspace ? (
            <IconCloud className="mr-1 size-4 text-foreground-subtle" />
          ) : (
            <IconFolder className="mr-1 size-4 text-foreground-subtle" />
          )}
          <span className="min-w-0 truncate">{decoratedProjectName}</span>
          {showRemoteSuffix ? (
            <>
              <span className="px-0.5 text-foreground-subtlest">{"@"}</span>
              <span className="min-w-0 max-w-40 truncate text-foreground-subtle">{remoteTargetLabel}</span>
            </>
          ) : null}
        </div>
      )}

      <div className="flex min-w-0 shrink-0 items-center gap-1 @max-[420px]/workspace-header:[&>[data-workspace-header-branch]]:hidden">
        {/* git 分支 chip + 刷新（只读工作区不显示） */}
        {isUntitledTask ? null : (
          <>
            {readOnlyReason ? null : (
              <GitBranchChip
                workspacePath={workspaceAbsPath}
                gitSummary={gitSummary}
                dirtyFileCount={gitDirtyFileCount}
                onRefreshGit={onRefreshGit}
                compactForRemoteControl={simplifyForNarrowRemote}
                popoverSide="bottom"
                className="px-0 pt-0"
                markAsWorkspaceHeaderBranch
                triggerClassName="border border-border/0 bg-tag/50 hover:border-border-hover hover:bg-tag/50 @max-[560px]/workspace-header:size-8 @max-[560px]/workspace-header:px-0 @max-[560px]/workspace-header:[&>span]:hidden @max-[560px]/workspace-header:[&>[data-branch-switcher-trailing-icon]]:hidden"
              />
            )}
          </>
        )}

        {/* 更多 ⌄：远程同步项（仅远程且可打开源时）+ 任务操作菜单 */}
        <DropdownMenu open={isTaskMenuOpen} onOpenChange={setTaskMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size={compact ? "icon-sm" : "icon-md"} data-testid="workspace-more-button"
              aria-label={intl.formatMessage({ id: "common.more" })}>
              <IconEllipsis className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {canOpenRemoteSessionSource && remoteTarget ? (
              <>
                <RemoteSyncMenuItems
                  canSyncSkills
                  canSyncMcp
                  canSyncPlugins
                  onOpenSkillSync={() => setSkillSyncOpen(true)}
                  onOpenMcpSync={() => setMcpSyncOpen(true)}
                  onOpenPluginSync={() => setPluginSyncOpen(true)}
                />
                <DropdownMenuSeparator />
              </>
            ) : null}
            {/* D5c：在 TUI 中编辑此任务——入口只挂在任务上（会话头 ⋯ 菜单）；无 session 禁用 */}
            <DropdownMenuItem
              data-testid="task-edit-in-tui"
              disabled={!activeSessionId || !!readOnlyReason}
              title={readOnlyReason ?? undefined}
              onSelect={() => { requestEditTaskInTui(); }}
            >
              {intl.formatMessage({ id: "taskList.editInTui" })}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <TaskActionMenuItems
              intl={intl}
              isPinned={isTaskPinned}
              fileManagerLabel={taskFileActions.fileManagerLabel}
              taskSessionFile={taskFileActions.taskSessionFile}
              activeSessionId={activeSessionId}
              taskNativeSessionLogFile={taskFileActions.taskNativeSessionLogFile}
              providerConfigFile={taskFileActions.providerConfigFile}
              disableTaskTargetActions={hasNoTask || pinLoading}
              disableTaskActions={!!readOnlyReason}
              disabledReason={readOnlyReason}
              disablePinTaskAction={pinLoading}
              hideMobileUnsupportedActions={simplifyForNarrowRemote}
              Item={DropdownMenuItem}
              Separator={DropdownMenuSeparator}
              onTogglePinTask={() => toggleTaskPinned()}
              onStartRenameTask={startRename}
              onArchiveTask={() => { archiveTask(); }}
              onMarkTaskAsUnread={() => markTaskUnread()}
              onOpenTaskFeedback={() => { openTaskFeedback(); }}
              onOpenTaskPathInFileManager={() => { taskFileActions.handleOpenTaskPathInFileManager(); }}
              onCopyWorkspacePath={() => { taskFileActions.handleCopyText(intl.formatMessage({ id: "appHeader.copyPath" }), workspaceAbsPath); }}
              onCopyTaskPath={() => { taskFileActions.handleCopyText(intl.formatMessage({ id: "appHeader.copyTaskPath" }), taskFileActions.taskSessionFile.path); }}
              onCopyTaskLogPath={() => { taskFileActions.handleCopyText(intl.formatMessage({ id: "appHeader.copyLogPath" }), taskFileActions.taskNativeSessionLogFile.path); }}
              onCopySessionId={() => { taskFileActions.handleCopyText(intl.formatMessage({ id: "appHeader.copySessionId" }), activeSessionId ?? null); /* 运行期 undefined↔null 等价归一 */ }}
              onViewModelTrajectory={effectiveTaskId ? () => {
                useTrajectoryViewerStore.getState().requestOpen({
                  taskId: effectiveTaskId,
                  workspaceKey: workspaceIdentity?.trim() || workspaceAbsPath,
                  title: taskMeta?.title ?? null,
                });
              } : undefined}
              onOpenProviderConfig={() => { taskFileActions.handleOpenProviderConfig(); }}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 远程同步对话框组（技能/MCP/插件；原 r4，完整实现见 js 127265） */}
        <RemoteSyncDialogs
          canSyncSkills={canOpenRemoteSessionSource}
          canSyncMcp={canOpenRemoteSessionSource}
          canSyncPlugins={canOpenRemoteSessionSource}
          skillOpen={skillSyncOpen}
          mcpOpen={mcpSyncOpen}
          pluginOpen={pluginSyncOpen}
          onSkillOpenChange={setSkillSyncOpen}
          onMcpOpenChange={setMcpSyncOpen}
          onPluginOpenChange={setPluginSyncOpen}
          remoteTarget={remoteTarget}
          workspaceIdentity={workspaceIdentity}
          skillWorkspacePath={workspaceAbsPath}
          mcpWorkspacePath={workspaceAbsPath}
          pluginWorkspacePath={workspaceAbsPath}
        />

        {/* 会话重载进行中：旋转 loader + tooltip */}
        {isSessionReloading ? (
          <Tooltip title={sessionReloadingLabel} side="bottom" align="start" className="max-w-84 items-start px-2 py-1.5">
            <span role="img" aria-label={sessionReloadingLabel}
              className={cn("inline-flex items-center justify-center rounded-full text-foreground-subtle", compact ? "size-6" : "size-7")}>
              <IconLoader className={cn("animate-spin", compact ? "size-3.5" : "size-4")} />
            </span>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );

  /* ---- 置顶/取消置顶（乐观更新 + 失败回滚，原实现逐行保留逻辑） ---- */
  function toggleTaskPinned() {
    if (!effectiveTaskId) return;
    const task = taskMeta ?? null;
    if (!task) return;
    // 乐观切换两个列表 store 的归属（置顶 ↔ 普通）
    if (workspaceIdentity && !isTaskPinned) {
      usePinnedTaskListStore.getState().upsertTask(task);
      useWorkspaceTaskListStore.getState().removeTask(workspaceAbsPath, effectiveTaskId, workspaceIdentity);
    }
    if (workspaceIdentity && isTaskPinned) {
      usePinnedTaskListStore.getState().removeTask(workspaceAbsPath, effectiveTaskId, workspaceIdentity);
      useWorkspaceTaskListStore.getState().upsertTask(task);
    }
    applyOptimisticTaskMutation({
      previousTask: task, nextTask: task,
      previousState: { pinned: isTaskPinned, archived: false },
      nextState: { pinned: !isTaskPinned, archived: false },
    });
    workspaceServices.zcodeTaskService
      .setTaskPinned({ taskId: effectiveTaskId, workspacePath: workspaceAbsPath, pinned: !isTaskPinned, ...(workspaceIdentity ? { workspaceIdentity } : {}) })
      .then((updated) => {
        removeOptimisticTaskListItem(workspaceAbsPath, effectiveTaskId, workspaceIdentity);
        if (workspaceIdentity && !isTaskPinned) {
          usePinnedTaskListStore.getState().upsertTask(updated);
          useWorkspaceTaskListStore.getState().removeTask(workspaceAbsPath, effectiveTaskId, workspaceIdentity);
        }
        if (workspaceIdentity && isTaskPinned) {
          usePinnedTaskListStore.getState().removeTask(workspaceAbsPath, effectiveTaskId, workspaceIdentity);
          useWorkspaceTaskListStore.getState().upsertTask(updated);
        }
        applyOptimisticTaskMutation({
          previousTask: mergeTask(updated), nextTask: updated,
          previousState: { pinned: !isTaskPinned, archived: false },
          nextState: { pinned: !isTaskPinned, archived: false },
        });
      })
      .catch(() => {
        // 回滚乐观更新
        if (workspaceIdentity && !isTaskPinned) {
          usePinnedTaskListStore.getState().removeTask(workspaceAbsPath, effectiveTaskId, workspaceIdentity);
          useWorkspaceTaskListStore.getState().upsertTask(task);
        }
        if (workspaceIdentity && isTaskPinned) {
          usePinnedTaskListStore.getState().upsertTask(task);
          useWorkspaceTaskListStore.getState().removeTask(workspaceAbsPath, effectiveTaskId, workspaceIdentity);
        }
        applyOptimisticTaskMutation({
          previousTask: task, nextTask: task,
          previousState: { pinned: !isTaskPinned, archived: false },
          nextState: { pinned: isTaskPinned, archived: false },
        });
        toast(intl.formatMessage({ id: "taskList.pinFailed" }));
      });
  }

  /* ---- 标记未读 ---- */
  function markTaskUnread() {
    if (!effectiveTaskId) return;
    workspaceServices.zcodeTaskService
      .setTaskUnread({ taskId: effectiveTaskId, workspacePath: workspaceAbsPath, unread: true, ...(workspaceIdentity ? { workspaceIdentity } : {}) })
      .then((updated) => {
        setTaskUnreadIndicator(workspaceAbsPath, effectiveTaskId, true, workspaceIdentity);
        upsertOptimisticTaskListItem(workspaceAbsPath, updated, workspaceIdentity);
        if (workspaceIdentity) {
          if (isTaskPinned) usePinnedTaskListStore.getState().upsertTask(updated);
          else useWorkspaceTaskListStore.getState().upsertTask(updated);
        }
        applyOptimisticTaskMutation({
          previousTask: mergeTask(updated), nextTask: updated,
          previousState: { pinned: isTaskPinned, archived: false },
          nextState: { pinned: isTaskPinned, archived: false },
        });
      });
  }
}

/* --- SessionHeaderLeft 依赖的外部符号声明 --- */

/** D5c：TUI 编辑打开请求信箱（实现见 stores-session.tsx TuiEditRequestStore） */
declare function useTaskListItems(query: { kind: "pinned"; workspaceTabs: unknown[]; sortBy: "updated"; searchQuery: string; expanded: boolean; collapsedLimit: number }): { items: Array<{ taskId: string }>; loading: boolean };
declare function resolveEffectiveProvider(taskProvider: string | null | undefined, selectedProvider: string | null | undefined): string; // 原 Zge（jsx 21359；前批次误作 './21359' import，复原为 declare）
/* ── tombstone（A1-R4；A1-R5 更正）：remoteTargetDisplayLabel（A1-R4 误归 XTt）/
 *    sshDecoratedProjectName（原 QTt）declare 删除 → 真实 import from './SplitLayoutDeep'（§F 远端条目域）。
 *    A1-R5 归属更正：SessionHeaderLeft remoteTargetLabel 位（2034）对应 bundle wFt 143599
 *    `je = i ? ZTt(i) : null`——真形为 ZTt=remoteTargetConnectionAddress（js 123256），非 XTt
 *    （styles 123242；XTt 唯一 bundle 调用点 128568 yOt → Home.remoteTabSearchHaystack）。import 已改 ZTt。
 *    型别宽化：canonical 参型为结构面、返回 string | undefined（bundle 未知 kind 无 default 分支）；
 *    本文件调用面皆真值判定/插值渲染，兼容（2034–2037/2192/2203）。 ── */
/* ── tombstone（A1-R10 2b）：declare function applyOptimisticTaskMutation（原 Uo，1895 / 959）删除，
 *    改经文件头 stores/searchResultsStore import 消费（canonical = applySearchTaskMutation）。 ── */
declare function buildTaskFeedbackDescription(args: { taskTitle: string; taskId?: string; workspacePath: string; taskSessionPath?: string | null; taskLogPath?: string | null; formatMessage: (id: string, values?: Record<string, unknown>) => string }): string;

/* ============================================================================
 * 5.4 TaskRenameDialog（原 j6，js 142581 / jsx 118551）
 *     重命名对话框：Enter 确认，但 IME 组词期间的 Enter 不算（中文输入法保护，
 *     原 A = imeComposition chunk 的 isImeEnter 守卫）。
 * ==========================================================================*/

export function TaskRenameDialog({
  open,
  value,
  inputRef,
  intl,
  onOpenChange,
  onChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  value: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  intl: IntlShape;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const compositionActiveRef = React.useRef(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden rounded-2xl p-0">
        <div className="flex min-w-0 flex-col gap-6 p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle>{intl.formatMessage({ id: "taskList.rename" })}</DialogTitle>
          </DialogHeader>
          <div className="flex min-w-0 flex-col space-y-4">
            <Input
              ref={inputRef}
              value={value}
              size="lg"
              placeholder={intl.formatMessage({ id: "taskList.renamePlaceholder" })}
              onChange={(e) => { onChange(e.target.value); }}
              onCompositionEnd={() => { compositionActiveRef.current = false; }}
              onCompositionStart={() => { compositionActiveRef.current = true; }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                // IME 组词中的回车（选词）不触发确认
                if (isImeEnter({ compositionActive: compositionActiveRef.current, nativeEvent: e.nativeEvent })) {
                  logger.debug("[TaskRenameDialog] ignore rename enter during IME", { valueLength: value.length });
                  return;
                }
                e.preventDefault();
                logger.info("[TaskRenameDialog] rename confirm via enter", { valueLength: value.length, trimmedLength: value.trim().length });
                onConfirm();
              }}
            />
          </div>
          <DialogFooter className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" size="lg" className="h-10 min-w-0 px-5" onClick={onCancel}>
              {intl.formatMessage({ id: "common.cancel" })}
            </Button>
            <Button type="button" size="lg" className="h-10 min-w-0 px-5" onClick={() => {
              logger.info("[TaskRenameDialog] rename confirm via button", { valueLength: value.length, trimmedLength: value.trim().length });
              onConfirm();
            }}>
              {intl.formatMessage({ id: "common.confirm" })}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** 原 zb/Hb/Ub/Gb/Wb（本 chunk js 31943+ / jsx 29335+）：Radix Dialog 封装 */





declare function isImeEnter(args: { compositionActive: boolean; nativeEvent: React.KeyboardEvent["nativeEvent"] }): boolean;

/* ============================================================================
 * 5.5 TaskActionMenuItems（原 oFt，js 142183 / jsx 118106）
 *     任务操作菜单项（渲染目标 Item/Separator 由调用方注入，便于复用到右键菜单）：
 *     置顶/取消置顶、重命名、归档、标记未读、[分屏打开] | 在文件管理器打开、
 *     复制工作区路径/任务路径/日志路径/[会话ID]/[供应商配置] | [查看轨迹]。
 * ==========================================================================*/

export interface TaskActionMenuItemsProps {
  intl: IntlShape;
  isPinned: boolean;
  fileManagerLabel: string;
  taskSessionFile: { path: string | null; loading: boolean };
  activeSessionId?: string | null;
  taskNativeSessionLogFile: { path: string | null; loading: boolean };
  providerConfigFile: { path: string | null; loading: boolean };
  disableTaskActions?: boolean;
  disableTaskTargetActions?: boolean;
  disablePinTaskAction?: boolean;
  disabledReason?: string | null;
  hideMobileUnsupportedActions?: boolean;
  Item: React.FC<{ disabled?: boolean; title?: string; onSelect?: () => void; children?: React.ReactNode; "data-testid"?: string }>;
  Separator: React.FC<React.ComponentPropsWithoutRef<"div">>;
  onTogglePinTask: () => void;
  onStartRenameTask: () => void;
  onArchiveTask: () => void;
  onMarkTaskAsUnread: () => void;
  onOpenInSplitPane?: () => void;
  openInSplitPaneDisabled?: boolean;
  onOpenTaskFeedback: () => void;
  onOpenTaskPathInFileManager: () => void;
  onCopyWorkspacePath: () => void;
  onCopyTaskPath: () => void;
  onCopyTaskLogPath: () => void;
  onCopySessionId?: () => void;
  onViewModelTrajectory?: () => void;
  onOpenProviderConfig: () => void;
}

export function TaskActionMenuItems({
  intl,
  isPinned,
  fileManagerLabel,
  taskSessionFile,
  activeSessionId,
  taskNativeSessionLogFile,
  providerConfigFile,
  disableTaskActions = false,
  disableTaskTargetActions = false,
  disablePinTaskAction = false,
  disabledReason,
  hideMobileUnsupportedActions = false,
  Item,
  Separator,
  onTogglePinTask,
  onStartRenameTask,
  onArchiveTask,
  onMarkTaskAsUnread,
  onOpenInSplitPane,
  openInSplitPaneDisabled = false,
  onOpenTaskFeedback,
  onOpenTaskPathInFileManager,
  onCopyWorkspacePath,
  onCopyTaskPath,
  onCopyTaskLogPath,
  onCopySessionId,
  onViewModelTrajectory,
  onOpenProviderConfig,
}: TaskActionMenuItemsProps) {
  const targetDisabled = disableTaskActions || disableTaskTargetActions;
  return (
    <>
      <Item disabled={targetDisabled || disablePinTaskAction} title={targetDisabled ? disabledReason ?? undefined : undefined}
        onSelect={() => { if (!targetDisabled && !disablePinTaskAction) onTogglePinTask(); }}>
        {intl.formatMessage({ id: isPinned ? "taskList.unpin" : "taskList.pin" })}
      </Item>
      <Item disabled={targetDisabled} title={disabledReason ?? undefined} onSelect={() => { if (!targetDisabled) onStartRenameTask(); }}>
        {intl.formatMessage({ id: "taskList.rename" })}
      </Item>
      <Item disabled={targetDisabled} title={disabledReason ?? undefined} onSelect={() => { if (!targetDisabled) onArchiveTask(); }}>
        {intl.formatMessage({ id: "taskList.archive" })}
      </Item>
      <Item disabled={targetDisabled} title={disabledReason ?? undefined} onSelect={() => { if (!targetDisabled) onMarkTaskAsUnread(); }}>
        {intl.formatMessage({ id: "taskList.markAsUnread" })}
      </Item>
      {onOpenInSplitPane ? (
        <Item data-testid="v4-task-open-in-split" disabled={targetDisabled || openInSplitPaneDisabled} onSelect={onOpenInSplitPane}>
          {intl.formatMessage({ id: "taskList.openInSplitPane" })}
        </Item>
      ) : null}
      <Separator />
      {hideMobileUnsupportedActions ? null : (
        <Item disabled={disableTaskActions} title={disableTaskActions ? disabledReason ?? undefined : undefined}
          onSelect={() => { if (!disableTaskActions) onOpenTaskPathInFileManager(); }}>
          {fileManagerLabel}
        </Item>
      )}
      <Item disabled={disableTaskActions} title={disableTaskActions ? disabledReason ?? undefined : undefined} onSelect={onCopyWorkspacePath}>
        {intl.formatMessage({ id: "appHeader.copyPath" })}
      </Item>
      <Item disabled={targetDisabled || taskSessionFile.loading || !taskSessionFile.path} title={targetDisabled ? disabledReason ?? undefined : undefined} onSelect={onCopyTaskPath}>
        {intl.formatMessage({ id: "appHeader.copyTaskPath" })}
      </Item>
      <Item disabled={targetDisabled || taskNativeSessionLogFile.loading || !taskNativeSessionLogFile.path} title={targetDisabled ? disabledReason ?? undefined : undefined} onSelect={onCopyTaskLogPath}>
        {intl.formatMessage({ id: "appHeader.copyLogPath" })}
      </Item>
      {onCopySessionId ? (
        <Item disabled={targetDisabled || !activeSessionId} title={targetDisabled ? disabledReason ?? undefined : undefined} onSelect={onCopySessionId}>
          {intl.formatMessage({ id: "appHeader.copySessionId" })}
        </Item>
      ) : null}
      {hideMobileUnsupportedActions ? null : (
        <Item disabled={disableTaskActions || providerConfigFile.loading || !providerConfigFile.path} title={disableTaskActions ? disabledReason ?? undefined : undefined}
          onSelect={() => { if (!disableTaskActions) onOpenProviderConfig(); }}>
          <span className="truncate">{intl.formatMessage({ id: "appHeader.goToProviderConfig" })}</span>
        </Item>
      )}
      {onViewModelTrajectory ? (
        <>
          <Separator />
          <Item disabled={targetDisabled || !activeSessionId} title={targetDisabled ? disabledReason ?? undefined : undefined} onSelect={onViewModelTrajectory}>
            {intl.formatMessage({ id: "appHeader.viewModelTrajectory" })}
          </Item>
        </>
      ) : null}
    </>
  );
}

/* ============================================================================
 * 5.6 GitBranchChip（原 zZ，js 96589 / jsx 84085）
 *     git 分支 chip：rounded-full 触发器（分支图标 + 分支名 + ⌄/spinner），
 *     弹层是 cmdk 命令面板风格的分支搜索列表（当前分支置顶滚动、脏文件数提示），
 *     底部动作：新建分支 / 查看图谱；切换有未提交变更时走“提交并切换”向导（原 Mst）。
 *     状态全部来自 useGitBranchSwitcher（原 pct，js 96362）。
 * ==========================================================================*/

interface GitBranchChipProps {
  workspacePath: string;
  gitSummary: GitSummary;
  dirtyFileCount: number;
  onRefreshGit: () => void;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  branchListClassName?: string;
  markAsWorkspaceHeaderBranch?: boolean;
  compactForRemoteControl?: boolean;
  popoverSide?: "top" | "bottom" | "left";
  avoidPopoverCollisions?: boolean;
  showFooterActions?: boolean;
}

export function GitBranchChip({
  workspacePath,
  gitSummary,
  dirtyFileCount,
  onRefreshGit,
  className,
  triggerClassName,
  popoverClassName,
  branchListClassName,
  markAsWorkspaceHeaderBranch = false,
  compactForRemoteControl = false,
  popoverSide = "top",
  avoidPopoverCollisions = true,
  showFooterActions = true,
}: GitBranchChipProps) {
  const { intl, locale } = useIntlContext();
  const numberFormat = new Intl.NumberFormat(locale);
  const branchListRef = React.useRef<HTMLDivElement>(null);
  const [graphViewerOpen, setGraphViewerOpen] = React.useState(false);

  const {
    open, setOpen,
    createDialogOpen, setCreateDialogOpen,
    createBranchName, setCreateBranchName,
    commitMessage, setCommitMessage,
    commitError,
    switchAssistStep, switchAssistState,
    branchesResult, loadingBranches, mutationPending,
    switchBranch, createBranchAndSwitch,
    openSwitchCommitDialog, closeSwitchAssistDialog, commitAndSwitchBranch,
  } = useGitBranchSwitcher({
    workspacePath,
    currentBranchName: gitSummary.branchName,
    headRefType: gitSummary.headRefType,
    onRefreshGit,
  });

  const gitUsable = gitSummary.isGitAvailable && gitSummary.isRepository;
  const currentBranchName = branchesResult?.currentBranchName ?? gitSummary.branchName;
  const branchLabel = React.useMemo(
    () => resolveBranchDisplayLabel({
      headRefType: gitSummary.headRefType,
      currentBranchName,
      detachedLabel: intl.formatMessage({ id: "git.head.detached" }),
      fallbackLabel: intl.formatMessage({ id: "git.branchSwitcher.label" }),
    }),
    [currentBranchName, gitSummary.headRefType, intl],
  );
  const dirtyLabel = React.useMemo(
    () => (dirtyFileCount > 0 ? intl.formatMessage({ id: "git.branchSwitcher.currentDirty" }, { count: numberFormat.format(dirtyFileCount) }) : null),
    [dirtyFileCount, intl, numberFormat],
  );

  // 打开时把当前分支滚动到可见区域
  React.useEffect(() => {
    if (!open || !branchesResult?.branches.length) return;
    const frame = window.requestAnimationFrame(() => {
      (branchListRef.current?.querySelector('[data-branch-current="true"]') ?? null)?.scrollIntoView({ block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [branchesResult, open]);

  if (!gitUsable) return null;

  return (
    <>
      <div data-workspace-header-branch={markAsWorkspaceHeaderBranch ? "true" : undefined} className={cn("flex items-center px-1 pt-2", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTriggerPrimitive asChild>
            <Button
              type="button"
              variant="ghost"
              size="default"
              disabled={mutationPending}
              aria-label={intl.formatMessage({ id: "git.branchSwitcher.trigger.ariaLabel" })}
              className={cn("min-w-0 rounded-full text-ui-base/relaxed", compactForRemoteControl ? "size-8 px-0" : "max-w-full pl-3 pr-2", triggerClassName)}
            >
              <IconGitBranch data-branch-switcher-primary-icon="true" className="size-4 text-foreground-subtle" />
              {compactForRemoteControl ? null : (
                <>
                  <span className="min-w-0 max-w-25 truncate text-left">{branchLabel}</span>
                  {loadingBranches || mutationPending ? (
                    <IconLoader data-branch-switcher-trailing-icon="true" className="size-3.5 animate-spin text-foreground-subtle" />
                  ) : (
                    <IconChevronDown data-branch-switcher-trailing-icon="true" className="size-3.5 text-foreground-subtle" />
                  )}
                </>
              )}
            </Button>
          </PopoverTriggerPrimitive>
          <PopoverContentPrimitive
            align="start"
            side={popoverSide}
            avoidCollisions={avoidPopoverCollisions}
            className={cn("w-80 gap-0 bg-menu p-0", popoverClassName)}
          >
            {/* cmdk 分支搜索面板（原 Yb/Xb/Zb/Qb/$b/ex）：输入过滤 + 分支组 */}
            <CommandPalette>
              <CommandInput placeholder={intl.formatMessage({ id: "git.branchSwitcher.searchPlaceholder" })} className="h-8" />
              <CommandList ref={branchListRef} className={cn("max-h-72", branchListClassName)}>
                <CommandEmpty className="px-4 py-5 text-foreground-subtle">
                  {loadingBranches ? intl.formatMessage({ id: "common.loading" }) : intl.formatMessage({ id: "git.branchSwitcher.empty" })}
                </CommandEmpty>
                <CommandGroup
                  heading={intl.formatMessage({ id: "git.branchSwitcher.section.branches" })}
                  className="space-y-0.5 p-1 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-ui-base **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-foreground-subtle"
                >
                  {(branchesResult?.branches ?? []).map((branch) => {
                    const isCurrent = branch.name === currentBranchName;
                    return (
                      <CommandItem
                        key={branch.name}
                        value={branch.name}
                        data-checked={isCurrent ? "true" : undefined}
                        data-branch-current={isCurrent ? "true" : undefined}
                        disabled={mutationPending}
                        className="items-start gap-3 rounded-lg px-3 py-2 text-ui-base"
                        onSelect={() => { switchBranch(branch.name); }}
                      >
                        <IconGitBranch className="mt-0.5 size-4 text-foreground-subtle" />
                        <div className="min-w-0 flex-1 flex flex-col gap-1 text-left">
                          <div className="truncate text-ui-base font-medium text-foreground">{branch.name}</div>
                          {isCurrent && dirtyLabel ? <p className="pt-0.5 text-ui-base text-foreground-subtle">{dirtyLabel}</p> : null}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
              {showFooterActions ? (
                <div className="border-t border-border p-1">
                  <Button type="button" variant="ghost" size="lg"
                    className="w-full justify-start px-2 text-foreground hover:bg-menu-hover hover:text-foreground"
                    disabled={mutationPending}
                    onClick={() => { setOpen(false); setCreateDialogOpen(true); }}>
                    <IconPlus className="size-4 text-foreground-subtle" />
                    {intl.formatMessage({ id: "git.branchSwitcher.createAction" })}
                  </Button>
                  <Button type="button" variant="ghost" size="lg"
                    className="w-full justify-start px-2 text-foreground hover:bg-menu-hover hover:text-foreground"
                    onClick={() => { setOpen(false); setGraphViewerOpen(true); }}>
                    <IconGitGraph className="size-4 text-foreground-subtle" />
                    {intl.formatMessage({ id: "gitGraph.menuAction" })}
                  </Button>
                </div>
              ) : null}
            </CommandPalette>
          </PopoverContentPrimitive>
        </Popover>
      </div>

      {/* 新建分支对话框（原 jst）、提交图谱（原 fct）、提交并切换向导（原 Mst）——
          均为叶子对话框，完整实现见 jsx 84085 闭包，此处保留调用形态 */}
      <CreateBranchDialog
        open={createDialogOpen}
        branchName={createBranchName}
        mutationPending={mutationPending}
        onOpenChange={(next) => { setCreateDialogOpen(next); if (!next) setCreateBranchName(""); }}
        onBranchNameChange={setCreateBranchName}
        onCancel={() => { setCreateDialogOpen(false); setCreateBranchName(""); }}
        onSubmit={() => { createBranchAndSwitch(); }}
      />
      <CommitGraphViewer open={graphViewerOpen} workspacePath={workspacePath} onOpenChange={setGraphViewerOpen} />
      <SwitchAssistDialog
        step={switchAssistStep}
        state={switchAssistState}
        currentBranchLabel={branchLabel}
        commitMessage={commitMessage}
        commitError={commitError}
        mutationPending={mutationPending}
        onClose={closeSwitchAssistDialog}
        onOpenCommit={openSwitchCommitDialog}
        onCommitMessageChange={setCommitMessage}
        onSubmit={() => { commitAndSwitchBranch(); }}
      />
    </>
  );
}







/* ============================================================================
 * 5.7 RemoteSyncMenuItems / RemoteSyncDialogs（原 n4/r4，js 127166/127265）
 *     远程工作区的“同步到远端”入口：技能 / MCP / 插件三项。
 * ==========================================================================*/

export function RemoteSyncMenuItems({
  canSyncSkills,
  canSyncMcp,
  canSyncPlugins = false,
  onOpenSkillSync,
  onOpenMcpSync,
  onOpenPluginSync,
  stopMouseDownPropagation = false,
  mcpDisabled = false,
}: {
  canSyncSkills: boolean;
  canSyncMcp: boolean;
  canSyncPlugins?: boolean;
  onOpenSkillSync: () => void;
  onOpenMcpSync: () => void;
  onOpenPluginSync: () => void;
  stopMouseDownPropagation?: boolean;
  mcpDisabled?: boolean;
}) {
  const { intl } = useIntlContext();
  const stopPropagation = stopMouseDownPropagation ? (e: React.MouseEvent) => { e.stopPropagation(); } : undefined;
  return (
    <>
      {canSyncSkills ? (
        <DropdownMenuItem onMouseDown={stopPropagation} onSelect={onOpenSkillSync}>
          <IconCloudUpload className="size-3.5" />
          {intl.formatMessage({ id: "settings.skills.remoteSync.open" })}
        </DropdownMenuItem>
      ) : null}
      {canSyncMcp ? (
        <DropdownMenuItem disabled={mcpDisabled} onMouseDown={stopPropagation} onSelect={onOpenMcpSync}>
          <IconCloudUpload className="size-3.5" />
          {intl.formatMessage({ id: "settings.mcp.remoteSync.open" })}
        </DropdownMenuItem>
      ) : null}
      {canSyncPlugins ? (
        <DropdownMenuItem onMouseDown={stopPropagation} onSelect={onOpenPluginSync}>
          <IconCloudUpload className="size-3.5" />
          {intl.formatMessage({ id: "settings.plugins.remoteSync.open" })}
        </DropdownMenuItem>
      ) : null}
    </>
  );
}

/** 原 r4（js 127265）：三个同步对话框（技能/MCP/插件）。接口保留，完整 JSX 从略。 */

/* ============================================================================
 * 6. ConversationSummaryAside（原 Flt，js 99217-99484 / jsx 85723-85903）
 * ----------------------------------------------------------------------------
 * 会话视图右侧摘要面板，绝对定位悬浮在会话列右上角（`absolute top-0 z-20 pt-4`）。
 * 三种显示模式（原 Uct 解析）：
 *   - mini  ：悬浮小卡（只读摘要条，点开展开）
 *   - panel ：固定面板（w-80，max-h min(64dvh,32rem)，内部滚动）
 *   - auto  ：容器查询自适应——窄=mini 形态，≥1136px（@conversation 容器）=panel 形态
 * 内容分段：git 变更 / 目标(goal) / 会话计划 / 计划 / 运行中终端 / 运行中子代理。
 * mini 卡宽度用 ResizeObserver 测量（封顶 320px）写入 --chat-summary-panel-mini-width。
 * ==========================================================================*/

export type SummaryPanelVariant = "mini" | "panel" | "auto";
export type SummaryPanelLayoutMode = "none" | "inline" | "auto";

export interface BackgroundWork {
  workId: string;
  kind: "bash" | "subagent";
  status: "running" | string;
  title?: string;
  childSessionId?: string;
  cancellable?: boolean;
  blocked?: boolean;
  startedAt?: number;
}
export interface RunningSubagent {
  agentId?: string;
  childSessionId: string;
  controlWorkId?: string;
  subagentType?: string;
  title?: string;
  status: string;
  startedAt?: number;
  cancellable?: boolean;
}
export interface SummaryGoal { objective: string; status: string; [key: string]: unknown }

interface ConversationSummaryAsideProps {
  workspacePath: string;
  workspaceIdentity?: string | null;
  gitSummary: GitSummary;
  gitDirtyFileCount?: number;
  gitWorktreeReviewSourceId?: string | null;
  gitWorktreeChangeSummary?: unknown;
  activeTaskChangeSummary?: string | null;
  goal?: SummaryGoal | null;
  sessionPlans?: unknown;
  plan?: unknown;
  backgroundWorks?: BackgroundWork[];
  runningSubagents?: RunningSubagent[];
  endedSubagentCount?: number;
  rootSessionId?: string | null;
  parentSessionId?: string | null;
  layoutMode?: SummaryPanelLayoutMode;
  summaryPanelVariantOverride?: SummaryPanelVariant | null;
  onVariantChange?: (variant: SummaryPanelVariant | null) => void;
  terminalSectionOpen?: boolean;
  onTerminalSectionOpenChange?: (v: boolean) => void;
  agentSectionOpen?: boolean;
  onAgentSectionOpenChange?: (v: boolean) => void;
  onRefreshGit?: () => void;
  onOpenGitReview?: () => void;
  onPauseGoal?: () => void;
  onResumeGoal?: () => void;
  onOpenPlanDetail?: () => void;
  onCancelBackgroundWork?: (workId: string) => void;
  onOpenSubagentSession?: (request: SubagentOpenRequest) => void;
  onOpenSubagentDirectory?: (req: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; rootSessionId?: string; parentSessionId: string }) => void; // A1-R3 宽化：原 () => void；bundle 真形含 req（ConversationPaneProps 同形收敛；壳层 handleOpenSubagentDirectory 面）
  className?: string;
}

const EMPTY_BACKGROUND_WORKS: BackgroundWork[] = [];   // 原 slt（js 98272）
const EMPTY_SUBAGENTS: RunningSubagent[] = [];         // 原 clt

/** 原 Qct（js 98128 / jsx 85059-85080）：摘要面板 git 段投影，两道 null 门
 * （!isGitAvailable || !isRepository → null；added + removed <= 0 → null）。 */
function buildSummaryPanelGitModel({
  gitSummary,
  gitDirtyFileCount = 0,
  gitWorktreeChangeSummary,
}: {
  gitSummary: GitSummary | null;
  gitDirtyFileCount?: number;
  gitWorktreeChangeSummary?: { added?: number; removed?: number } | null;
}) {
  if (!gitSummary?.isGitAvailable || !gitSummary.isRepository) return null;
  const added = gitWorktreeChangeSummary?.added ?? 0;
  const removed = gitWorktreeChangeSummary?.removed ?? 0;
  if (added + removed <= 0) return null;
  const isClean = !gitSummary.isDirty && gitDirtyFileCount === 0 && added === 0 && removed === 0 && gitSummary.ahead === 0;
  return {
    branchName: gitSummary.branchName,
    headRefType: gitSummary.headRefType,
    dirtyFileCount: gitDirtyFileCount,
    added,
    removed,
    ahead: gitSummary.ahead,
    behind: gitSummary.behind,
    isClean,
  };
}

/** 原 tlt（js 98181）：把原始会话状态归一成摘要面板模型 */
export function buildSummaryPanelModel(args: {
  gitSummary: GitSummary;
  gitDirtyFileCount: number;
  gitWorktreeChangeSummary?: unknown;
  goal?: SummaryGoal | null;
  sessionPlans?: unknown;
  workspacePath: string;
  plan?: unknown;
  backgroundWorks?: BackgroundWork[];
  runningSubagents?: RunningSubagent[];
}) {
  // 真实实现：聚合 git 变更、目标、计划，把 backgroundWorks 拆成
  // runningBashWorks / runningSubagentWorks（按 childSessionId 关联控制项）。
  const runningBashWorks = (args.backgroundWorks ?? []).filter((w) => w.status === "running" && w.kind === "bash");
  const runningSubagentWorks = args.runningSubagents ?? [];
  // 原 tlt 直接 Qct(e) 全参透传；gitWorktreeChangeSummary 公共面为 unknown（Conversation 域同），
  // 投影入口按消费面（added/removed）具型桥接，与 WorkspaceShell 属主型一致。
  const git = buildSummaryPanelGitModel({
    gitSummary: args.gitSummary,
    gitDirtyFileCount: args.gitDirtyFileCount,
    gitWorktreeChangeSummary: args.gitWorktreeChangeSummary as { added?: number; removed?: number } | null | undefined,
  });
  return {
    git,
    goal: args.goal ?? null,
    sessionPlans: args.sessionPlans ?? null,
    plan: args.plan ?? null,
    runningWorks: runningBashWorks,
    runningBashWorks,
    runningSubagentWorks,
    hasContent: !!(git || args.goal || args.sessionPlans || args.plan || runningBashWorks.length > 0 || runningSubagentWorks.length),
  };
}

/** 原 Uct（js 98064）：变体解析（override 优先，缺省 auto） */
export function resolveSummaryPanelVariant(args: { variantOverride: SummaryPanelVariant | null }): SummaryPanelVariant {
  return args.variantOverride ?? "auto";
}

export function ConversationSummaryAside({
  workspacePath,
  workspaceIdentity,
  gitSummary,
  gitDirtyFileCount = 0,
  gitWorktreeReviewSourceId,
  gitWorktreeChangeSummary,
  activeTaskChangeSummary,
  goal,
  sessionPlans,
  plan,
  backgroundWorks = EMPTY_BACKGROUND_WORKS,
  runningSubagents = EMPTY_SUBAGENTS,
  endedSubagentCount = 0,
  rootSessionId,
  parentSessionId,
  layoutMode = "none",
  summaryPanelVariantOverride,
  onVariantChange,
  terminalSectionOpen,
  onTerminalSectionOpenChange,
  agentSectionOpen,
  onAgentSectionOpenChange,
  onRefreshGit,
  onOpenGitReview,
  onPauseGoal,
  onResumeGoal,
  onOpenPlanDetail,
  onCancelBackgroundWork,
  onOpenSubagentSession,
  onOpenSubagentDirectory,
  className,
}: ConversationSummaryAsideProps) {
  const miniMeasureRef = React.useRef<HTMLDivElement>(null);
  const [miniWidthPx, setMiniWidthPx] = React.useState(320);

  const model = React.useMemo(
    () => buildSummaryPanelModel({
      gitSummary, gitDirtyFileCount, gitWorktreeChangeSummary, goal, sessionPlans, workspacePath, plan, backgroundWorks, runningSubagents,
    }),
    [backgroundWorks, gitDirtyFileCount, gitSummary, gitWorktreeChangeSummary, goal, sessionPlans, plan, runningSubagents, workspacePath],
  );

  const variant = resolveSummaryPanelVariant({ variantOverride: summaryPanelVariantOverride ?? null });
  const displayModeValue: SummaryPanelVariant = summaryPanelVariantOverride == null ? "auto" : variant;
  const { intl } = useIntlContext();
  const displayModeLabel = intl.formatMessage({ id: "chat.summaryPanel.displayMode" });

  const miniWidthStyle = React.useMemo(() => ({ "--chat-summary-panel-mini-width": `${miniWidthPx}px` }) as React.CSSProperties, [miniWidthPx]);

  const showGitSection = !!(model.git && gitSummary && onRefreshGit);
  const showGoalSection = !!model.goal;
  const showSessionPlansSection = !!model.sessionPlans;
  const showPlanSection = !!model.plan;
  const showTerminalsSection = model.runningBashWorks.length > 0;
  const showEndedSubagentsEntry = !!(endedSubagentCount > 0 && parentSessionId && onOpenSubagentDirectory);
  const showAgentsSection = model.runningSubagentWorks.length > 0 || showEndedSubagentsEntry;

  const handleDisplayModeChange = React.useCallback((value: string) => {
    if (value === "auto") { onVariantChange?.(null); return; }
    if (value === "panel" || value === "mini") onVariantChange?.(value);
  }, [onVariantChange]);
  const collapseToMini = React.useCallback(() => { onVariantChange?.("mini"); }, [onVariantChange]);

  // mini 卡宽度测量：跟随内容，封顶 320
  React.useEffect(() => {
    const node = miniMeasureRef.current;
    if (!node) return;
    const measure = () => {
      const width = Math.ceil(node.getBoundingClientRect().width);
      if (width > 0) {
        const next = Math.min(width, 320);
        setMiniWidthPx((prev) => (prev === next ? prev : next));
      }
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [model]);

  if (!model.hasContent) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 z-20 pt-4",
        layoutMode === "inline"
          ? "right-4"
          : layoutMode === "auto"
            ? "inset-x-0 flex justify-end px-4 @min-[1136px]/conversation:left-auto @min-[1136px]/conversation:right-4 @min-[1136px]/conversation:px-0"
            : "inset-x-0 flex justify-end px-4",
        className,
      )}
    >
      <aside
        aria-label={intl.formatMessage({ id: "chat.summaryPanel.title" })}
        data-testid="chat-summary-panel"
        data-state={variant === "mini" ? "collapsed" : "expanded"}
        data-display-mode={variant}
        data-goal-status={model.goal?.status}
        data-goal-objective={model.goal?.objective}
        data-running-background-count={model.runningBashWorks.length + model.runningSubagentWorks.length}
        data-running-terminal-count={model.runningBashWorks.length}
        data-running-agent-count={model.runningSubagentWorks.length}
        style={miniWidthStyle}
        className={cn(
          "pointer-events-auto relative overflow-hidden rounded-2xl border border-[var(--color-popover-border)] bg-[var(--color-popover)] text-[var(--color-foreground)] shadow-md transition-[border-radius,padding,background-color,box-shadow] duration-300 ease-in-out",
          variant === "mini"
            ? "inline-flex max-h-8.5 w-[var(--chat-summary-panel-mini-width)] max-w-[calc(100vw-1.5rem)] flex-col"
            : variant === "panel"
              ? "flex max-h-[min(64dvh,32rem)] w-80 max-w-[calc(100vw-1.5rem)] flex-col"
              : // auto：窄容器=mini 形态，≥1136px=panel 形态
                "inline-flex max-h-8.5 w-[var(--chat-summary-panel-mini-width)] max-w-[calc(100vw-1.5rem)] flex-col @min-[1136px]/conversation:max-h-[min(64dvh,32rem)] @min-[1136px]/conversation:w-80",
        )}
      >
        {/* 面板态右上角控制区：显示模式 ⌄（auto/panel/mini）+ 收起为 mini */}
        {variant === "mini" ? null : (
          <div className={cn("absolute right-3 top-3 z-10 items-center gap-1", variant === "auto" ? "hidden @min-[1136px]/conversation:flex" : "flex")}>
            <DropdownMenu>
              <Tooltip title={displayModeLabel} side="left">
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" className="size-6" aria-label={displayModeLabel}>
                    <IconEllipsis className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </Tooltip>
              <DropdownMenuContent align="end" side="bottom" className="w-44">
                <DropdownMenuRadioGroup value={displayModeValue} onValueChange={handleDisplayModeChange}>
                  <DropdownMenuRadioItem value="auto">
                    {intl.formatMessage({ id: "chat.summaryPanel.displayModeAuto" })}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip title={intl.formatMessage({ id: "chat.summaryPanel.showMini" })} side="left">
              <Button type="button" variant="ghost" size="icon-sm" className="size-6"
                aria-label={intl.formatMessage({ id: "chat.summaryPanel.showMini" })} onClick={collapseToMini}>
                <IconMinimize2 className="size-3.5" />
              </Button>
            </Tooltip>
          </div>
        )}

        {/* 面板态正文：分段滚动区 */}
        {variant === "mini" ? null : (
          <div className={cn("min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto p-2", variant === "auto" ? "hidden @min-[1136px]/conversation:flex" : "flex")}>
            {showGitSection ? (
              <SummaryGitSection model={model} gitSummary={gitSummary} gitWorktreeReviewSourceId={gitWorktreeReviewSourceId}
                workspacePath={workspacePath} workspaceIdentity={workspaceIdentity} activeTaskChangeSummary={activeTaskChangeSummary}
                onRefreshGit={onRefreshGit!} onOpenGitReview={onOpenGitReview} separated={false} />
            ) : null}
            {showGoalSection ? <SummaryGoalSection model={model} separated={showGitSection} onPauseGoal={onPauseGoal} onResumeGoal={onResumeGoal} /> : null}
            {showSessionPlansSection ? <SummaryPlansSection model={model} parentSessionId={parentSessionId} onOpenPlanDetail={onOpenPlanDetail} separated={showGitSection || showGoalSection} /> : null}
            {showPlanSection ? <SummaryPlanSection model={model} separated={showGitSection || showGoalSection || showSessionPlansSection} /> : null}
            {showTerminalsSection ? (
              <SummaryTerminalsSection section="terminal" title={intl.formatMessage({ id: "chat.statusPanel.terminals" })}
                works={model.runningBashWorks} open={terminalSectionOpen} onOpenChange={onTerminalSectionOpenChange}
                separated={showGitSection || showGoalSection || showSessionPlansSection || showPlanSection} onCancelBackgroundWork={onCancelBackgroundWork} />
            ) : null}
            {showAgentsSection ? (
              <SummaryAgentsSection title={intl.formatMessage({ id: "chat.statusPanel.agents" })}
                subagents={model.runningSubagentWorks} endedSubagentCount={showEndedSubagentsEntry ? endedSubagentCount : 0}
                onCancelBackgroundWork={onCancelBackgroundWork} open={agentSectionOpen} onOpenChange={onAgentSectionOpenChange}
                separated={showGitSection || showGoalSection || showSessionPlansSection || showPlanSection || showTerminalsSection}
                parentSessionId={parentSessionId} rootSessionId={rootSessionId}
                onOpenSubagentSession={onOpenSubagentSession} onOpenSubagentDirectory={onOpenSubagentDirectory} />
            ) : null}
          </div>
        )}

        {/* mini 卡（原 Plt）：同时是测量基准；panel 态隐藏，auto 态仅窄容器可见 */}
        <div
          ref={miniMeasureRef}
          aria-hidden={variant === "panel"}
          className={cn(
            "w-max max-w-80 transition-opacity duration-150",
            variant === "mini"
              ? "pointer-events-auto relative visible opacity-100"
              : variant === "panel"
                ? "pointer-events-none invisible absolute left-0 top-0 opacity-0"
                : "pointer-events-auto relative visible opacity-100 @min-[1136px]/conversation:hidden",
          )}
        >
          <SummaryMiniCard model={model} gitWorktreeChangeSummary={gitWorktreeChangeSummary} onVariantChange={onVariantChange} />
        </div>
      </aside>
    </div>
  );
}

/** 原 Ilt（js 99485）：导出 memo 版本，供会话视图按引用稳定性挂载 */
export const MemoizedConversationSummaryAside = React.memo(ConversationSummaryAside);

/* --- Flt 分段组件（原 mlt/hlt/Clt/Tlt/klt/Alt/Plt，js 98354-99216）：
       均为纯呈现叶子。mlt=SummaryGitSection 属主 GitReview（A0-CLEANUP4 既改指）；
       klt/Alt 〔A1-P3-B13〕、hlt/Clt/Tlt/Plt 〔A1-R58〕转录实体化，墓碑如下 --- */
/* ── tombstone〔A1-R58〕：declare SummaryGoalSection（原 hlt，js 98501）/SummaryPlansSection（原 Clt，js 98775）/SummaryPlanSection（原 Tlt，js 98826）/SummaryMiniCard（原 Plt，js 99157）删除 → 转录实体化，见文件尾 Flt 分段组件转录区（R58 扩展段）。prop 面保持 declare 原形（model: unknown），体内投射消费面（型缝注记在案）；唯 SummaryPlansSection.onOpenPlanDetail 由 () => void 宽化为 (payload: unknown) => void = bundle 98809 `t?.(wlt(n, e))` 载荷调用实证，宽化面消费侧（少参规则）仍可赋。 ── */
/* ── tombstone〔A1-P3-B13〕：declare SummaryTerminalsSection（原 klt，js 98919）/SummaryAgentsSection（原 Alt，js 98981）删除 → 转录实体化，见文件尾 Flt 分段组件转录区。qr 3 点收敛在案：Elt 98863 `qr(Pr, e)`（Pr = styles 581 `Ui as Pr` ← src 9816 `Oy as Ui` ≡ Oy@8405 v4-background-work-cancel）/ Olt 98888 `qr(Ur, n.workId)` / Alt 99041 `qr(Ur, e.controlWorkId)`（Ur = styles 595 `Wi as Ur` ← src 9830 `Dy as Wi` ≡ Dy@8404 v4-background-work-item）。P1 转交件（B12 点表 #8）。 ── */


/* ============================================================================
 * Flt 分段组件转录区〔A1-P3-B13〕（原 flt/plt/XZ + vst/JZ/llt/ult/dlt/YZ + Elt/Dlt/Olt/klt/Alt/jlt，
 *      js 98318–98325 / 98326–98360 / 98361–98400 / 94998 / 98274–98315 / 98850–98884 /
 *      98885–98915 / 98919–98980 / 98981–99102 / 99103–99126）：
 *      klt→SummaryTerminalsSection / Alt→SummaryAgentsSection declare 实体化（墓碑见 declare 块）；
 *      qr 3 点 98863/98888/99041 收敛改指 joinTestidParts（P1 转交件，B12 点表 #8）。
 *      依赖：kZ/AZ/jZ = Collapsible 族（ui/collapsible，A0-S3c 既重建）/ G = useIntlContext /
 *      Z = cn / X = Button / Wv = IconSquare / Uv = IconSquareTerminal / D_ = IconBot /
 *      N_ = IconChevronDown / wa = IconChevronRight（button chunk）/ I_ = IconCircleCheck。
 * 〔A1-R58〕扩展：nlt/rlt/ilt/alt/olt（js 98226/98227/98231/98243/98265）+
 *      hlt→SummaryGoalSection（98501）+ glt/_lt/ZZ/vlt/ylt/blt/xlt/Slt
 *      （98616/98632/98634/98649/98674/98698/98742）+ Clt→SummaryPlansSection（98775）+
 *      wlt（98818）+ Tlt→SummaryPlanSection（98826）+ QZ/Mlt/Nlt（99127/99147/99154）+
 *      Plt→SummaryMiniCard（99157）；mlt（98402）属主 GitReview SummaryGitSection 不重复转录。
 *      新增依赖：dN/fN/pN = HoverCard 族（ui/hover-card，A0-S3c 既重建）/
 *      Ea = ChevronLeft（button chunk s 导出）/ 九图标见图标块〔A1-R58〕行。
 * ==========================================================================*/

/** 原 flt（js 98318）：分段滚动封顶表（environment 无封顶） */
const SUMMARY_SECTION_MAX_HEIGHT: Record<string, string | null> = {
  environment: null,
  goal: "max-h-48",
  sessionPlans: "max-h-48",
  plan: "max-h-80",
  terminal: "max-h-48",
  agent: "max-h-48",
};

/** 原 vst（js 94998）：已运行时长文案（分:秒 / 秒） */
function formatWorkElapsed(elapsedMs: number, formatMessage: IntlShape["formatMessage"]) {
  const totalSeconds = Math.max(1, Math.floor(elapsedMs / 1e3));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0
    ? formatMessage(
        { id: "chat.longRunning.elapsedMinutesSeconds" },
        { minutes: String(minutes), seconds: String(seconds) },
      )
    : formatMessage({ id: "chat.longRunning.elapsedSeconds" }, { seconds: String(totalSeconds) });
}

/** 原 JZ（js 98274）：时分秒短格式（zh 用中文单位） */
function formatDurationShort(totalSeconds: number, locale = "en-US") {
  const clampedSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const restSeconds = clampedSeconds % 60;
  const units = locale.startsWith("zh")
    ? { hours: "小时", minutes: "分", seconds: "秒" }
    : { hours: "h", minutes: "m", seconds: "s" };
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}${units.hours}`);
  if (minutes > 0) parts.push(`${minutes}${units.minutes}`);
  if (restSeconds > 0 || parts.length === 0) parts.push(`${restSeconds}${units.seconds}`);
  return parts.join(" ");
}

/** 原 llt（js 98290）：单工作已运行毫秒。〔A1-P3-B13〕型缝：BackgroundWork.startedAt 可选，bundle 径取；缺省按 now 计 0（与 Alt bundle `?? p` 守卫同形） */
function workElapsedMs(work: BackgroundWork, now: number) {
  return Math.max(0, now - (work.startedAt ?? now));
}

/** 原 ult（js 98293）：列表最大已运行毫秒 */
function maxWorkElapsedMs(works: BackgroundWork[], now: number) {
  return works.reduce((max, work) => Math.max(max, workElapsedMs(work, now)), 0);
}

/** 原 dlt（js 98296）：运行中任务数文案（单/复） */
function formatRunningTasksCount(formatMessage: IntlShape["formatMessage"], count: number) {
  return formatMessage(
    {
      id:
        count === 1
          ? "chat.summaryPanel.runningBackgroundTasksMiniValue"
          : "chat.summaryPanel.runningBackgroundTasksMiniValuePlural",
    },
    { count: String(count) },
  );
}

/** 原 YZ（js 98307）：运行中子代理数文案（单/复） */
function formatRunningAgentsCount(formatMessage: IntlShape["formatMessage"], count: number) {
  return formatMessage(
    {
      id:
        count === 1
          ? "chat.statusPanel.runningAgentsValue"
          : "chat.statusPanel.runningAgentsValuePlural",
    },
    { count: String(count) },
  );
}

/** 原 plt（js 98326）：分段头（CollapsibleTrigger asChild；展开 chevron-down / 收起 chevron-right，hover 显形） */
function SummarySectionHeader({ children, isOpen, section, title }: { children?: React.ReactNode; isOpen: boolean; section: string; title: string }) {
  return (
    <div className="mb-0.5 flex h-8 min-w-0 shrink-0 items-center gap-1.5 px-2 pr-8">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          aria-expanded={isOpen}
          data-status-section-trigger={section}
          className="group flex min-w-0 shrink-0 items-center gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-border-focused)]"
        >
          <span className="shrink-0 text-ui-base text-[var(--color-foreground-subtle)]">{title}</span>
          {isOpen ? (
            <IconChevronDown className="size-3.5 shrink-0 text-[var(--color-foreground-subtle)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
          ) : (
            <IconChevronRight className="size-3.5 shrink-0 text-[var(--color-foreground-subtle)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
          )}
        </button>
      </CollapsibleTrigger>
      {children ? (
        <div className="inline-flex min-w-0 max-w-full shrink items-center gap-1.5 text-ui-sm text-[var(--color-foreground-subtlest)]">{children}</div>
      ) : null}
    </div>
  );
}

/** 原 XZ（js 98361）：分段壳（Collapsible 受控/非受控双模 + 滚动封顶） */
function SummarySectionShell({
  children,
  defaultOpen = true,
  onOpenChange,
  open,
  separated = false,
  section,
  title,
  trailing,
}: {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  separated?: boolean;
  section: string;
  title: string;
  trailing?: (open: boolean) => React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = open !== void 0;
  const effectiveOpen = open ?? internalOpen;
  const maxHeightClass = SUMMARY_SECTION_MAX_HEIGHT[section];
  return (
    <Collapsible
      open={effectiveOpen}
      onOpenChange={React.useCallback(
        (nextOpen: boolean) => {
          if (!isControlled) setInternalOpen(nextOpen);
          onOpenChange?.(nextOpen);
        },
        [isControlled, onOpenChange],
      )}
      data-status-section={section}
      className={cn("min-w-0 flex-none", separated && "border-t border-[var(--color-border)] pt-2")}
    >
      <section className="min-w-0 flex-none">
        <SummarySectionHeader isOpen={effectiveOpen} section={section} title={title}>
          {trailing?.(effectiveOpen)}
        </SummarySectionHeader>
        <CollapsibleContent>
          {maxHeightClass ? (
            <div data-status-section-scroll={section} className={cn(maxHeightClass, "min-h-0 overflow-x-hidden overflow-y-auto pr-1")}>
              {children}
            </div>
          ) : (
            children
          )}
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

/* ============================================================================
 * Flt 分段组件转录区〔A1-R58〕扩展段之一：目标族（原 nlt/rlt/ilt/alt/olt + hlt，
 *      js 98226 / 98227 / 98231 / 98243 / 98265 / 98501）+
 *      计划族（原 glt/_lt/ZZ/vlt/ylt/blt/xlt/Slt + Clt/wlt + Tlt，
 *      js 98616 / 98632 / 98634 / 98649 / 98674 / 98698 / 98742 / 98775 / 98818 / 98826）
 * ==========================================================================*/

/** 〔A1-R58〕型缝：目标模型消费面（hlt/alt/ilt/olt 读取面；SummaryGoal 宽化索引面于实体入口投射） */
interface SummaryGoalModelView {
  objective: string;
  status: string;
  iteration: number;
  iterations?: Array<{ iteration: number; items: Array<{ status: string; [key: string]: unknown }> }>;
  verifications: Array<{ iteration: number; outcome: string | null; nextAction?: string | null; [key: string]: unknown }>;
  summaryTitle?: string | null;
  timeUsedSeconds?: number | null;
  activeRunStartedAtMs?: number | null;
  [key: string]: unknown;
}

/** 〔A1-R58〕型缝：alt 返回面（目标迭代视图） */
interface GoalIterationView {
  iteration: number;
  title: string | null;
  items: Array<{ status: string; [key: string]: unknown }>;
  completedCount: number;
  totalCount: number;
  completed: boolean;
  verificationOutcome: string | null;
}

/** 原 nlt（js 98226）：目标迭代标题哨兵值（verification nextAction 为此句 → 视同无标题） */
const GOAL_NEXT_ACTION_SENTINEL = "Continue verifying and completing the goal.";

/** 原 rlt（js 98227）：nextAction 修剪；空值或哨兵值 → null */
function normalizeGoalNextAction(nextAction?: string | null): string | null {
  const trimmed = nextAction?.trim();
  return !trimmed || trimmed === GOAL_NEXT_ACTION_SENTINEL ? null : trimmed;
}

/** ES2023 findLast 的等价实现（目标 lib 为 ES2022；TurnNavigator.findLastItem 同形先例）。
 * 〔A1-R58〕bundle ilt 98234 径用 findLast，此处按 lib 面等价转录。 */
function findLastGoalVerification<T>(items: T[], predicate: (item: T) => boolean): T | undefined {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) return items[index];
  }
  return undefined;
}

/** 原 ilt（js 98231）：目标总迭代数（既有迭代号最大值 + 状态驱动 +1 投射） */
function countGoalIterations(goal: SummaryGoalModelView): number {
  const maxIterationItem = (goal.iterations ?? []).reduce((max, entry) => Math.max(max, entry.iteration), 0);
  const maxVerification = goal.verifications.reduce((max, entry) => Math.max(max, entry.iteration), 0);
  const lastVerificationForCurrent = findLastGoalVerification(goal.verifications, (entry) => entry.iteration === goal.iteration);
  const projected =
    goal.status === "active" ||
    goal.status === "notSatisfied" ||
    (goal.status === "paused" && lastVerificationForCurrent?.outcome === "notSatisfied")
      ? goal.iteration + 1
      : Math.max(1, goal.iteration);
  return Math.max(1, projected, maxIterationItem, maxVerification);
}

/** 原 alt（js 98243）：目标 → 迭代视图列表（verifications 配对前一轮 nextAction，完成者优先排序） */
function buildGoalIterationViews(goal: SummaryGoalModelView): GoalIterationView[] {
  const itemsByIteration = new Map((goal.iterations ?? []).map((entry) => [entry.iteration, entry.items] as const));
  const verificationByIteration = new Map(goal.verifications.map((entry) => [entry.iteration, entry] as const));
  const views: GoalIterationView[] = [];
  for (let iteration = 1; iteration <= countGoalIterations(goal); iteration += 1) {
    const items = itemsByIteration.get(iteration) ?? [];
    const completedCount = items.filter((item) => item.status === "completed").length;
    const priorVerification = verificationByIteration.get(iteration - 1);
    views.push({
      iteration,
      title: iteration === 1 ? goal.summaryTitle?.trim() || goal.objective.trim() || null : normalizeGoalNextAction(priorVerification?.nextAction),
      items,
      completedCount,
      totalCount: items.length,
      completed: items.length > 0 && completedCount >= items.length,
      verificationOutcome: verificationByIteration.get(iteration)?.outcome ?? null,
    });
  }
  return views.sort((a, b) => (a.completed === b.completed ? a.iteration - b.iteration : a.completed ? -1 : 1));
}

/** 原 olt（js 98265）：目标已用秒数（active 系状态且有 activeRunStartedAtMs → 叠加实时走秒） */
function goalElapsedSeconds(goal: SummaryGoalModelView, now: number): number {
  const baseSeconds = Math.max(0, Math.floor(goal.timeUsedSeconds ?? 0));
  return !(goal.status === "active" || goal.status === "verifying" || goal.status === "notSatisfied") ||
    goal.activeRunStartedAtMs == null
    ? baseSeconds
    : baseSeconds + Math.max(0, Math.floor((now - goal.activeRunStartedAtMs) / 1e3));
}

/** 原 hlt（js 98501）：SummaryGoalSection —— 目标段（迭代列表 + 已用时 + 暂停/恢复钮）。
 * 〔A1-R58〕declare 实体化；prop 面保持 declare 原形（model: unknown），体内投射 SummaryGoalModelView（型缝）。 */
export function SummaryGoalSection({ model, onPauseGoal, onResumeGoal, separated }: { model: unknown; separated: boolean; onPauseGoal?: () => void; onResumeGoal?: () => void }) {
  const { intl, locale } = useIntlContext();
  const [now, setNow] = React.useState(() => Date.now());
  const goal = (model as { goal?: SummaryGoalModelView | null }).goal;
  const isLive = goal?.status === "active" || goal?.status === "verifying" || goal?.status === "notSatisfied";
  const isPaused = goal?.status === "paused";
  const isVerified = goal?.status === "verified";
  const iterationViews = React.useMemo(() => (goal ? buildGoalIterationViews(goal) : []), [goal]);
  if (
    (React.useEffect(() => {
      if (!isLive || !goal || goal.activeRunStartedAtMs == null) return;
      setNow(Date.now());
      const timer = setInterval(() => setNow(Date.now()), 1e3);
      return () => clearInterval(timer);
    }, [goal, isLive]),
    !goal)
  )
    return null;
  const elapsedLabel = formatDurationShort(goalElapsedSeconds(goal, now), locale);
  const actionControl = isLive ? (
    <Tooltip title={intl.formatMessage({ id: "chat.target.pause" })}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-6 shrink-0"
        data-goal-action="pause"
        disabled={!onPauseGoal}
        aria-label={intl.formatMessage({ id: "chat.target.pause" })}
        onClick={onPauseGoal}
      >
        <IconPause className="size-3.5" />
      </Button>
    </Tooltip>
  ) : isPaused ? (
    <Tooltip title={intl.formatMessage({ id: "chat.target.resume" })}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-6 shrink-0"
        data-goal-action="resume"
        disabled={!onResumeGoal}
        aria-label={intl.formatMessage({ id: "chat.target.resume" })}
        onClick={onResumeGoal}
      >
        <IconPlay className="size-3.5" />
      </Button>
    </Tooltip>
  ) : isVerified ? (
    <IconCircleCheckBig aria-label={intl.formatMessage({ id: "chat.goalVerification.complete" })} className="size-4 shrink-0 text-[var(--color-success)]" />
  ) : null;
  return (
    <SummarySectionShell
      section="goal"
      separated={separated}
      title={intl.formatMessage({ id: "chat.statusPanel.goal" })}
      trailing={() => (
        <>
          <span className="shrink-0 tabular-nums" data-goal-elapsed-seconds={goalElapsedSeconds(goal, now)}>
            {elapsedLabel}
          </span>
          {actionControl ? <span className="shrink-0">·</span> : null}
          {actionControl}
        </>
      )}
    >
      <div className="space-y-0">
        {iterationViews.map((view) => {
          const title =
            view.title ?? intl.formatMessage({ id: "chat.summaryPanel.goalIterationValue" }, { count: String(view.iteration) });
          return (
            <div
              key={view.iteration}
              data-goal-iteration={view.iteration}
              data-goal-iteration-completed={view.completed}
              data-goal-verification-outcome={view.verificationOutcome ?? undefined}
              className="flex min-w-0 cursor-default items-start gap-2 rounded-lg px-2 py-2 hover:bg-[var(--color-hover)]"
              title={title}
            >
              {view.completed ? (
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-[var(--color-success)] text-ui-xs tabular-nums text-[var(--color-success)]">
                  {view.iteration}
                </span>
              ) : (
                <IconGoal className="size-4 shrink-0 text-[var(--color-foreground-subtle)]" />
              )}
              <p className="line-clamp-3 min-w-0 flex-1 text-ui-base leading-4 text-[var(--color-foreground)]">{title}</p>
              {view.totalCount > 0 ? (
                <span className="shrink-0 text-ui-sm tabular-nums text-[var(--color-foreground-subtle)]">
                  {view.completedCount}/{view.totalCount}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </SummarySectionShell>
  );
}

/** 〔A1-R58〕型缝：计划展示项消费面（vlt/ylt/Slt 读取面：id/content/status） */
interface PlanDisplayItem {
  id: string;
  content: string;
  status: string;
  [key: string]: unknown;
}

/** 原 glt（js 98616）：计划项状态图标（completed=勾 / inProgress=箭头 / 余=圆圈） */
function PlanItemStatusIcon({ status }: { status: string }) {
  return status === "completed" ? (
    <IconCircleCheck aria-hidden={true} className="mt-0.5 size-3.5 shrink-0 text-[var(--color-success)]" />
  ) : status === "inProgress" ? (
    <IconArrowRight aria-hidden={true} className="mt-0.5 size-3.5 shrink-0 text-[var(--color-foreground)]" />
  ) : (
    <IconCircle aria-hidden={true} className="mt-0.5 size-3.5 shrink-0 text-[var(--color-foreground-subtlest)]" />
  );
}

/** 原 _lt/ZZ（js 98632）：紧凑阈值（≤6 不折叠）/ 聚焦窗口（3 项） */
const TODO_COMPACT_THRESHOLD = 6;
const TODO_FOCUS_WINDOW = 3;

/** 原 vlt（js 98634）：展示项列表紧凑切分（聚焦窗口锚定 inProgress > 首个未完成 > 尾部） */
function compactPlanDisplayItems(items: PlanDisplayItem[]) {
  if (items.length <= TODO_COMPACT_THRESHOLD)
    return { compact: false, precedingItems: [] as PlanDisplayItem[], focusItems: items, followingItems: [] as PlanDisplayItem[] };
  const inProgressIndex = items.findIndex((item) => item.status === "inProgress");
  const firstNotCompletedIndex = items.findIndex((item) => item.status !== "completed");
  const anchor =
    inProgressIndex >= 0 ? inProgressIndex : firstNotCompletedIndex >= 0 ? firstNotCompletedIndex : Math.max(0, items.length - TODO_FOCUS_WINDOW);
  const start = Math.max(0, Math.min(anchor, items.length - TODO_FOCUS_WINDOW));
  const end = Math.min(items.length, start + TODO_FOCUS_WINDOW);
  return {
    compact: true,
    precedingItems: items.slice(0, start),
    focusItems: items.slice(start, end),
    followingItems: items.slice(end),
  };
}

/** 原 ylt（js 98649）：计划项行（状态图标 + 两行截断 + 完成态删除线） */
function PlanDisplayItemList({ items }: { items: PlanDisplayItem[] }) {
  return items.map((item) => (
    <li
      key={item.id}
      data-plan-status={item.status}
      className="flex min-h-8 items-start gap-2 rounded-lg px-2 py-1.5 text-ui-base hover:bg-[var(--color-hover)]"
    >
      <PlanItemStatusIcon status={item.status} />
      <span
        title={item.content}
        className={cn(
          "line-clamp-2 min-w-0 flex-1 break-words leading-5",
          item.status === "completed" ? "text-[var(--color-foreground-subtlest)] line-through" : "text-[var(--color-foreground)]",
        )}
      >
        {item.content}
      </span>
    </li>
  ));
}

/** 原 blt（js 98674）折叠触发钮 props。〔A1-R58〕型缝：bundle `...a` rest 直透 button；
 * 唯一消费位 xlt 仅传四字段，radix asChild 运行期并合不经型面，故型面收敛为四字段
 * （索引签名会触发 React 19 PropsWithoutRef Omit 塌缩，必选成员不可保）。 */
interface PlanFoldTriggerButtonProps {
  group: string;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onTouchOpen: () => void;
  open: boolean;
}

/** 原 blt（js 98674）：折叠组触发钮（触控设备点按即开 → onTouchOpen）。 */
const PlanFoldTriggerButton = React.forwardRef<HTMLButtonElement, PlanFoldTriggerButtonProps>(function PlanFoldTriggerButton(
  { group, label, onClick, onTouchOpen, open, ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      aria-expanded={open}
      data-status-todo-preview-trigger={group}
      className="flex h-8 w-full min-w-0 items-center gap-2 rounded-lg px-2 text-left text-ui-base text-[var(--color-foreground-subtle)] hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-input-border-focused)]"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && typeof window < "u" && window.matchMedia?.("(hover: none)").matches) onTouchOpen();
      }}
    >
      <ChevronLeft className="size-3.5 shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
});

/** 原 xlt（js 98698）：折叠组悬浮预览（HoverCard 左出弹层，组别决定标题文案） */
function PlanFoldPreview({ group, items, onOpenChange, open }: { group: "preceding" | "following"; items: PlanDisplayItem[]; onOpenChange: (open: boolean) => void; open: boolean }) {
  const { intl } = useIntlContext();
  const messageId =
    group === "preceding"
      ? items.every((item) => item.status === "completed")
        ? "chat.statusPanel.todoCompletedFold"
        : "chat.statusPanel.todoEarlierFold"
      : items.every((item) => item.status === "pending")
        ? "chat.statusPanel.todoWaitingFold"
        : "chat.statusPanel.todoLaterFold";
  const label = intl.formatMessage({ id: messageId }, { count: String(items.length) });
  return (
    <HoverCard closeDelay={80} open={open} openDelay={120} onOpenChange={onOpenChange}>
      <HoverCardTrigger asChild={true}>
        <PlanFoldTriggerButton group={group} label={label} open={open} onTouchOpen={() => onOpenChange(true)} />
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        side="left"
        sideOffset={4}
        data-status-todo-preview-content={group}
        className="w-80 max-w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-[var(--color-popover-border)] bg-[var(--color-menu)] p-3 shadow-md ring-0"
      >
        <div className="flex max-h-[min(24rem,calc(100dvh-2rem))] min-w-0 flex-col">
          <p className="flex h-8 shrink-0 items-center px-2 text-ui-base text-[var(--color-foreground-subtle)]">{label}</p>
          <ul className="min-h-0 space-y-0 overflow-y-auto pr-1">
            <PlanDisplayItemList items={items} />
          </ul>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/** 原 Slt（js 98742）：计划 todo 列表（聚焦窗口 + 前后折叠组） */
function PlanTodoList({ plan }: { plan: { displayItems: PlanDisplayItem[] } }) {
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  const segmentation = compactPlanDisplayItems(plan.displayItems);
  const handleOpenChange = (group: string, nextOpen: boolean) => {
    setOpenGroup((current) => (nextOpen ? group : current === group ? null : current));
  };
  return (
    <ul className="space-y-0 pb-1">
      {segmentation.compact && segmentation.precedingItems.length > 0 ? (
        <li>
          <PlanFoldPreview group="preceding" items={segmentation.precedingItems} open={openGroup === "preceding"} onOpenChange={(nextOpen) => handleOpenChange("preceding", nextOpen)} />
        </li>
      ) : null}
      <PlanDisplayItemList items={segmentation.focusItems} />
      {segmentation.compact && segmentation.followingItems.length > 0 ? (
        <li>
          <PlanFoldPreview group="following" items={segmentation.followingItems} open={openGroup === "following"} onOpenChange={(nextOpen) => handleOpenChange("following", nextOpen)} />
        </li>
      ) : null}
    </ul>
  );
}

/** 〔A1-R58〕型缝：会话计划条目消费面（Clt 读取面：title/toolCallId/markdown/planFilePath） */
interface SessionPlanItem {
  title?: string | null;
  toolCallId: string;
  markdown: string;
  planFilePath?: string | null;
  [key: string]: unknown;
}

/** 〔A1-R58〕型缝：会话计划集消费面（Clt/Plt 读取面：items） */
interface SessionPlansModelView {
  items: SessionPlanItem[];
  [key: string]: unknown;
}

/** 原 wlt（js 98818）：计划详情打开载荷（planFilePath 有原值才附） */
function buildPlanDetailPayload(parentSessionId: string, item: SessionPlanItem) {
  return {
    parentSessionId,
    toolCallId: item.toolCallId,
    markdown: item.markdown,
    ...(item.planFilePath ? { planFilePath: item.planFilePath } : {}),
  };
}

/** 原 Clt（js 98775）：SummaryPlansSection —— 会话计划目录段（条目 → openPlanDetail 载荷）。
 * 〔A1-R58〕declare 实体化；prop 面 model: unknown 保持原形（型缝）；
 * onOpenPlanDetail 由 declare 面 () => void 宽化为 (payload: unknown) => void
 * = bundle 98809 `t?.(wlt(n, e))` 载荷调用实证（宽化面消费侧少参规则仍可赋）。 */
export function SummaryPlansSection({ model, onOpenPlanDetail, parentSessionId, separated }: { model: unknown; parentSessionId?: string | null; onOpenPlanDetail?: (payload: unknown) => void; separated: boolean }) {
  const { intl } = useIntlContext();
  const sessionPlans = (model as { sessionPlans?: SessionPlansModelView | null }).sessionPlans;
  return sessionPlans ? (
    <SummarySectionShell section="sessionPlans" separated={separated} title={intl.formatMessage({ id: "chat.statusPanel.sessionPlans" })}>
      <ul className="space-y-0">
        {sessionPlans.items.map((item) => {
          const title = item.title ?? intl.formatMessage({ id: "chat.statusPanel.planFallback" });
          const canOpen = !!(parentSessionId && onOpenPlanDetail);
          return (
            <li key={item.toolCallId}>
              <button
                type="button"
                data-plan-directory-tool-call-id={item.toolCallId}
                disabled={!canOpen}
                aria-label={intl.formatMessage({ id: "chat.statusPanel.openPlan" }, { title })}
                onClick={() => {
                  if (parentSessionId) onOpenPlanDetail?.(buildPlanDetailPayload(parentSessionId, item));
                }}
                className={cn(
                  "flex min-h-8 w-full min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-ui-base text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-input-border-focused)]",
                  canOpen && "hover:bg-[var(--color-hover)]",
                )}
              >
                <IconListChecks className="size-4 shrink-0 text-[var(--color-foreground-subtle)]" />
                <span className="min-w-0 flex-1 truncate">{title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </SummarySectionShell>
  ) : null;
}

/** 〔A1-R58〕型缝：计划（todo）模型消费面（Tlt/Slt/Mlt/Nlt 读取面） */
interface PlanModelView {
  totalCount: number;
  completedCount: number;
  displayItems: PlanDisplayItem[];
  items: PlanDisplayItem[];
  [key: string]: unknown;
}

/** 原 Tlt（js 98826）：SummaryPlanSection —— todo 段（完成计数 + 展示项列表）。
 * 〔A1-R58〕declare 实体化；prop 面保持 declare 原形（model: unknown），体内投射（型缝）。 */
export function SummaryPlanSection({ model, separated }: { model: unknown; separated: boolean }) {
  const { intl } = useIntlContext();
  const plan = (model as { plan?: PlanModelView | null }).plan;
  if (!plan) return null;
  const allCompleted = plan.totalCount > 0 && plan.completedCount >= plan.totalCount;
  return (
    <SummarySectionShell
      section="plan"
      separated={separated}
      title={intl.formatMessage({ id: "chat.statusPanel.todo" })}
      trailing={() => (
        <span className={cn("tabular-nums", allCompleted ? "text-[var(--color-success)]" : "text-[var(--color-foreground-subtle)]")}>
          {plan.completedCount}/{plan.totalCount}
        </span>
      )}
    >
      <PlanTodoList key={plan.displayItems.map((item) => `${item.id}\u0000${item.content}\u0000${item.status}`).join("")} plan={plan} />
    </SummarySectionShell>
  );
}

/** 原 Elt（js 98850）：后台工作取消钮（stopRunningBackgroundTask）。qr 点 98863 `qr(Pr, e)` 收敛改指（Pr ≡ v4BackgroundWorkCancelTestid）。 */
function BackgroundWorkCancelButton({ workId, onCancel }: { workId: string; onCancel?: (workId: string) => void }) {
  const { intl } = useIntlContext();
  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onCancel?.(workId);
    },
    [onCancel, workId],
  );
  return onCancel ? (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-testid={joinTestidParts(v4BackgroundWorkCancelTestid, workId)}
      aria-label={intl.formatMessage({ id: "chat.summaryPanel.stopRunningBackgroundTask" })}
      onClick={handleClick}
      className="pointer-events-auto relative z-[2] ml-auto h-6 shrink-0 px-1.5 text-ui-base text-[var(--color-foreground)]"
    >
      <IconSquare aria-hidden={true} className="size-3 fill-current" />
      {intl.formatMessage({ id: "chat.statusPanel.runningStop" })}
    </Button>
  ) : null;
}

/** 原 Dlt（js 98874）：子代理会话打开请求构造（parentSessionId 缺省返 null）；型别属主 SidePanel.SubagentOpenRequest */
function buildSubagentOpenRequest({ parentSessionId, rootSessionId, subagent }: { parentSessionId?: string | null; rootSessionId?: string | null; subagent: RunningSubagent }): SubagentOpenRequest | null {
  return parentSessionId
    ? ({
        rootSessionId: rootSessionId ?? parentSessionId,
        parentSessionId,
        childSessionId: subagent.childSessionId,
        subagentType: subagent.subagentType,
        title: subagent.title,
      } as unknown as SubagentOpenRequest) // 〔A1-P3-B13〕型缝：RunningSubagent.subagentType/title 可选，bundle 98879–98881 径透传（SidePanel 消费面容忍）
    : null;
}

/** 原 Olt（js 98885）：后台工作行（终端类）。qr 点 98888 `qr(Ur, n.workId)` 收敛改指（Ur ≡ v4BackgroundWorkItemTestid）。 */
function BackgroundWorkRow({ now, onCancelBackgroundWork, work }: { now: number; onCancelBackgroundWork?: (workId: string) => void; work: BackgroundWork }) {
  const { intl } = useIntlContext();
  return (
    <li
      data-testid={joinTestidParts(v4BackgroundWorkItemTestid, work.workId)}
      data-background-task-kind={work.kind}
      data-work-id={work.workId}
      data-work-status={work.status}
      className="group relative flex min-w-0 items-start gap-2 rounded-lg px-2 py-2 hover:bg-[var(--color-hover)]"
    >
      <IconSquareTerminal className="pointer-events-none relative z-[1] mt-0.5 size-4 shrink-0 text-[var(--color-foreground-subtle)]" />
      <div className="pointer-events-none relative z-[1] flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="line-clamp-2 text-ui-base leading-5 text-[var(--color-foreground)]">{work.title}</p>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-ui-base">
          <span className="shrink-0 tabular-nums text-[var(--color-foreground-subtle)]">
            {formatWorkElapsed(workElapsedMs(work, now), intl.formatMessage)}
          </span>
          {work.cancellable === false ? null : <BackgroundWorkCancelButton workId={work.workId} onCancel={onCancelBackgroundWork} />}
        </div>
      </div>
    </li>
  );
}

/** 原 klt（js 98919）：运行中终端段（declare SummaryTerminalsSection 实体化，墓碑见 declare 块） */
export function SummaryTerminalsSection({
  onCancelBackgroundWork,
  onOpenChange,
  open,
  separated,
  section,
  title,
  works,
}: {
  onCancelBackgroundWork?: (workId: string) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  separated: boolean;
  section: string;
  title: string;
  works: BackgroundWork[];
}) {
  const { intl, locale } = useIntlContext();
  const [now, setNow] = React.useState(() => Date.now());
  const sortedWorks = React.useMemo(() => [...works].sort((a, b) => (a.startedAt ?? 0) - (b.startedAt ?? 0)), [works]);
  React.useEffect(() => {
    if (works.length === 0) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1e3);
    return () => clearInterval(timer);
  }, [works.length]);
  if (works.length === 0) return null;
  const totalElapsedLabel = formatDurationShort(Math.max(1, Math.floor(maxWorkElapsedMs(works, now) / 1e3)), locale);
  return (
    <SummarySectionShell
      section={section}
      defaultOpen={false}
      open={open}
      onOpenChange={onOpenChange}
      separated={separated}
      title={title}
      trailing={(isOpen) =>
        isOpen ? (
          <span>
            {intl.formatMessage(
              {
                id:
                  works.length === 1
                    ? "chat.statusPanel.runningStatusValue"
                    : "chat.statusPanel.runningStatusValuePlural",
              },
              { count: String(works.length) },
            )}
          </span>
        ) : (
          <>
            <span className="min-w-0 truncate">{totalElapsedLabel}</span>
            <span className="shrink-0">·</span>
            <span className="shrink-0">{formatRunningTasksCount(intl.formatMessage, works.length)}</span>
          </>
        )
      }
    >
      <ul className="space-y-0">
        {sortedWorks.map((work) => (
          <BackgroundWorkRow key={work.workId} work={work} now={now} onCancelBackgroundWork={onCancelBackgroundWork} />
        ))}
      </ul>
    </SummarySectionShell>
  );
}

/** 原 jlt（js 99103）：已结束子代理条目（打开目录） */
function EndedAgentsEntry({ count, onOpen, parentSessionId, rootSessionId, separated }: { count: number; onOpen?: (req: { rootSessionId: string; parentSessionId: string }) => void; parentSessionId?: string | null; rootSessionId?: string | null; separated: boolean }) {
  const { intl } = useIntlContext();
  return count <= 0 || !parentSessionId || !onOpen ? null : (
    <div className={cn(separated && "border-t border-[var(--color-border)] pt-2")}>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-ui-base text-[var(--color-foreground)] hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-input-border-focused)]"
        onClick={() => onOpen({ rootSessionId: rootSessionId ?? parentSessionId, parentSessionId })}
      >
        <IconCircleCheck className="size-4 shrink-0 text-[var(--color-foreground-subtle)]" />
        <span>{intl.formatMessage({ id: "chat.statusPanel.endedAgents" })}</span>
        <span className="ml-auto text-[var(--color-foreground-subtle)]">{count}</span>
        <IconChevronRight className="size-4 text-[var(--color-foreground-subtle)]" />
      </button>
    </div>
  );
}

/** 原 Alt（js 98981）：运行中子代理段（declare SummaryAgentsSection 实体化，墓碑见 declare 块）。qr 点 99041 `qr(Ur, e.controlWorkId)` 收敛改指（Ur ≡ v4BackgroundWorkItemTestid）。 */
export function SummaryAgentsSection({
  endedSubagentCount,
  onCancelBackgroundWork,
  onOpenChange,
  onOpenSubagentDirectory,
  onOpenSubagentSession,
  open,
  parentSessionId,
  rootSessionId,
  separated,
  title,
  subagents,
}: {
  endedSubagentCount: number;
  onCancelBackgroundWork?: (workId: string) => void;
  onOpenChange?: (open: boolean) => void;
  onOpenSubagentDirectory?: (req: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; rootSessionId?: string; parentSessionId: string }) => void;
  onOpenSubagentSession?: (request: SubagentOpenRequest) => void;
  open?: boolean;
  parentSessionId?: string | null;
  rootSessionId?: string | null;
  separated: boolean;
  title: string;
  subagents: RunningSubagent[];
}) {
  const { intl, locale } = useIntlContext();
  const [now, setNow] = React.useState(() => Date.now());
  const sortedSubagents = React.useMemo(() => [...subagents].sort((a, b) => (a.startedAt ?? 0) - (b.startedAt ?? 0)), [subagents]);
  React.useEffect(() => {
    if (subagents.length === 0) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1e3);
    return () => window.clearInterval(timer);
  }, [subagents.length]);
  if (subagents.length === 0 && endedSubagentCount <= 0) return null;
  const maxElapsedMs = subagents.reduce((max, subagent) => Math.max(max, Math.max(0, now - (subagent.startedAt ?? now))), 0);
  return (
    <SummarySectionShell
      section="agent"
      defaultOpen={false}
      open={open}
      onOpenChange={onOpenChange}
      separated={separated}
      title={title}
      trailing={(isOpen) =>
        subagents.length === 0
          ? null
          : isOpen
            ? (
              <span>{formatRunningAgentsCount(intl.formatMessage, subagents.length)}</span>
            )
            : (
              <>
                <span className="min-w-0 truncate">{formatDurationShort(Math.max(1, Math.floor(maxElapsedMs / 1e3)), locale)}</span>
                <span className="shrink-0">·</span>
                <span className="shrink-0">{formatRunningAgentsCount(intl.formatMessage, subagents.length)}</span>
              </>
            )
      }
    >
      <ul className="space-y-0">
        {sortedSubagents.map((subagent) => {
          const openRequest = buildSubagentOpenRequest({ parentSessionId, rootSessionId, subagent });
          const canOpenSession = !!(openRequest && onOpenSubagentSession);
          return (
            <li
              key={subagent.childSessionId}
              data-testid={subagent.controlWorkId ? joinTestidParts(v4BackgroundWorkItemTestid, subagent.controlWorkId) : void 0}
              data-background-task-kind="agent"
              data-child-session-id={subagent.childSessionId}
              data-work-id={subagent.controlWorkId}
              data-work-status="running"
              className={cn(
                "group relative flex min-w-0 items-start gap-2 rounded-lg px-2 py-2 hover:bg-[var(--color-hover)]",
                canOpenSession && "cursor-pointer",
              )}
            >
              {canOpenSession ? (
                <button
                  type="button"
                  data-running-subagent-session-trigger="true"
                  data-child-session-id={subagent.childSessionId}
                  aria-label={intl.formatMessage({ id: "chat.summaryPanel.openRunningSubagentSession" })}
                  onClick={() => openRequest && onOpenSubagentSession?.(openRequest)}
                  className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-input-border-focused)]"
                />
              ) : null}
              <IconBot className="pointer-events-none relative z-[1] mt-0.5 size-4 shrink-0 text-[var(--color-foreground-subtle)]" />
              <div className="pointer-events-none relative z-[1] flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="line-clamp-2 text-ui-base leading-5 text-[var(--color-foreground)]">{subagent.title}</span>
                <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-ui-base">
                  <span className="text-ui-base tabular-nums text-[var(--color-foreground-subtle)]">
                    {formatWorkElapsed(Math.max(0, now - (subagent.startedAt ?? now)), intl.formatMessage)}
                  </span>
                  {subagent.controlWorkId && subagent.cancellable !== false ? (
                    <BackgroundWorkCancelButton workId={subagent.controlWorkId} onCancel={onCancelBackgroundWork} />
                  ) : null}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <EndedAgentsEntry
        count={endedSubagentCount}
        parentSessionId={parentSessionId}
        rootSessionId={rootSessionId}
        onOpen={onOpenSubagentDirectory as ((req: { rootSessionId: string; parentSessionId: string }) => void) | undefined} /* 〔A1-P3-B13〕型缝：bundle 99093–99097 jlt 仅回传 rootSessionId/parentSessionId 二字段（A1-R3 declare 宽型为外层闭包面） */
        separated={subagents.length > 0}
      />
    </SummarySectionShell>
  );
}

/* ============================================================================
 * Flt 分段组件转录区〔A1-R58〕扩展段之二：mini 卡族（原 QZ/Mlt/Nlt + Plt，
 *      js 99127 / 99147 / 99154 / 99157）
 * ==========================================================================*/

/** 原 QZ（js 99127）：mini 卡单行（图标位 hover 切换 maximize-2 展开提示） */
function MiniCardRow({ children, icon }: { children?: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex h-8 w-max max-w-80 min-w-0 items-center gap-1.5 pl-2 pr-3 text-ui-base text-[var(--color-foreground)]">
      <span className="relative size-4 shrink-0">
        <span className="absolute inset-0 transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0">{icon}</span>
        <IconMaximize2 className="absolute inset-0 size-4 text-[var(--color-foreground)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
      </span>
      {children}
    </div>
  );
}

/** 原 Mlt（js 99147）：首个进行中项（退首个 pending 项） */
function firstActivePlanItem(plan?: PlanModelView | null): PlanDisplayItem | null {
  return plan?.items.find((item) => item.status === "inProgress") ?? plan?.items.find((item) => item.status === "pending") ?? null;
}

/** 原 Nlt（js 99154）：末个已完成项（倒序查找） */
function lastCompletedPlanItem(plan?: PlanModelView | null): PlanDisplayItem | null {
  return [...(plan?.items ?? [])].reverse().find((item) => item.status === "completed") ?? null;
}

/** 〔A1-R58〕型缝：mini 卡模型消费面（Plt 读取面） */
interface SummaryMiniCardModelView {
  plan?: PlanModelView | null;
  sessionPlans?: SessionPlansModelView | null;
  goal?: SummaryGoalModelView | null;
  git?: unknown;
  runningBashWorks: unknown[];
  runningSubagentWorks: unknown[];
  [key: string]: unknown;
}

/** 原 Plt（js 99157）：SummaryMiniCard —— 收起态单行卡（内容优先级：
 * 进行中计划项 > 活跃目标题 > git 变更 > 已验证目标题 > 末完成项 > todo 计数 > 首个会话计划 > 运行中计数）。
 * 〔A1-R58〕declare 实体化；prop 面保持 declare 原形（model: unknown），体内投射（型缝）。 */
export function SummaryMiniCard({ gitWorktreeChangeSummary, model, onVariantChange }: { model: unknown; gitWorktreeChangeSummary?: unknown; onVariantChange?: (variant: SummaryPanelVariant | null) => void }) {
  const { intl } = useIntlContext();
  const showPanelLabel = intl.formatMessage({ id: "chat.summaryPanel.showPanel" });
  const summaryModel = model as SummaryMiniCardModelView;
  const activePlanItem = firstActivePlanItem(summaryModel.plan);
  const lastCompletedItem = lastCompletedPlanItem(summaryModel.plan);
  const firstSessionPlan = summaryModel.sessionPlans?.items[0] ?? null;
  const goal = summaryModel.goal;
  const goalTitle = (goal && (goal.summaryTitle?.trim() || goal.objective.trim())) || null;
  const goalStatus = goal?.status ?? null;
  const isGoalLive = goalStatus === "active" || goalStatus === "notSatisfied" || goalStatus === "paused" || goalStatus === "verifying";
  const isGoalVerified = goalStatus === "verified";
  const worktreeChangeSummary = gitWorktreeChangeSummary as { added?: number; removed?: number } | null | undefined;
  const added = worktreeChangeSummary?.added ?? 0;
  const removed = worktreeChangeSummary?.removed ?? 0;
  const hasGitChanges = !!(summaryModel.git && added + removed > 0);
  const hasBashWorks = summaryModel.runningBashWorks.length > 0;
  const hasSubagentWorks = summaryModel.runningSubagentWorks.length > 0;
  const runningWorkCount = summaryModel.runningBashWorks.length + summaryModel.runningSubagentWorks.length;
  const runningIcon = hasBashWorks ? (hasSubagentWorks ? IconActivity : IconSquareTerminal) : IconBot;
  const row = activePlanItem ? (
    <MiniCardRow icon={<IconArrowRight className="size-4 text-[var(--color-foreground)]" />}>
      <span className="min-w-0 truncate">{activePlanItem.content}</span>
    </MiniCardRow>
  ) : goalTitle && isGoalLive ? (
    <MiniCardRow icon={<IconGoal className="size-4 text-[var(--color-foreground)]" />}>
      <span className="min-w-0 truncate">{goalTitle}</span>
    </MiniCardRow>
  ) : hasGitChanges ? (
    <MiniCardRow icon={<IconFileDiff className="size-4 text-[var(--color-foreground)]" />}>
      <span className="min-w-0 truncate">{intl.formatMessage({ id: "chat.statusPanel.changes" })}</span>
      <span className="shrink-0 text-[var(--color-diff-added)]">+{added}</span>
      <span className="shrink-0 text-[var(--color-diff-removed)]">-{removed}</span>
    </MiniCardRow>
  ) : goalTitle && isGoalVerified ? (
    <MiniCardRow icon={<IconGoal className="size-4 text-[var(--color-foreground)]" />}>
      <span className="min-w-0 truncate">{goalTitle}</span>
    </MiniCardRow>
  ) : lastCompletedItem ? (
    <MiniCardRow icon={<IconCircleCheck className="size-4 text-[var(--color-success)]" />}>
      <span className="min-w-0 truncate">{lastCompletedItem.content}</span>
    </MiniCardRow>
  ) : summaryModel.plan ? (
    <MiniCardRow icon={<IconListChecks className="size-4 text-[var(--color-foreground-subtle)]" />}>
      <span className="min-w-0 truncate">{intl.formatMessage({ id: "chat.statusPanel.todo" })}</span>
      <span className="shrink-0 text-[var(--color-foreground-subtle)]">
        {summaryModel.plan.completedCount}/{summaryModel.plan.totalCount}
      </span>
    </MiniCardRow>
  ) : firstSessionPlan ? (
    <MiniCardRow icon={<IconListChecks className="size-4 text-[var(--color-foreground)]" />}>
      <span className="min-w-0 truncate">{firstSessionPlan.title ?? intl.formatMessage({ id: "chat.statusPanel.planFallback" })}</span>
    </MiniCardRow>
  ) : runningWorkCount > 0 ? (
    <MiniCardRow icon={React.createElement(runningIcon, { className: "size-4 text-[var(--color-foreground)]" })}>
      <span className="shrink-0">
        {hasSubagentWorks ? formatRunningAgentsCount(intl.formatMessage, runningWorkCount) : formatRunningTasksCount(intl.formatMessage, runningWorkCount)}
      </span>
    </MiniCardRow>
  ) : null;
  return row ? (
    <Tooltip title={showPanelLabel} sideOffset={4} side="left">
      <button
        type="button"
        aria-label={showPanelLabel}
        className="group inline-flex w-max max-w-80 cursor-pointer flex-col items-stretch text-left text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-menu-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-border-focused)]"
        onClick={() => onVariantChange?.("panel")}
      >
        {row}
      </button>
    </Tooltip>
  ) : null;
}
