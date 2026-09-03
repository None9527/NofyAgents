// A0-S4-4c: 自 modules/WebRemote.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/remote/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * WebRemote.tsx — F17 WebRemoteFamily 逐字重建（B5-05 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（主口径，融合 chunk，213,979 行，D5b 点状改写后现状，只读）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，D5b 前快照，仅用于 JSX 结构对照）：
 *   desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 行号口径：本文件注释中的 js 行号 = **当前 out chunk 行号**（锚点回代以此为准）；
 *           括号内「原 N」= D5b 前原始行号（MODULE-MAP/COVERAGE-LEDGER 口径）。
 *           偏移：≤142k 段 +17；149k 段 +46（D5b/D5c 点状改写累积）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（js 行 = 当前 out / jsx 行 = pretty 版）
 * ----------------------------------------------------------------------------
 *  [MobileHome 模型与偏好]（js 140585–140672 / jsx 117214–117299；地图 F17 范围
 *   起自 140669(原)，本族 BPt 的必备依赖、它批未抽取，一并纳入并注记）：
 *   OPt  → EMPTY_MOBILE_HOME_RESULT   {workspaces:[],tasks:[]} (140585)
 *   kPt  → MOBILE_HOME_PREFERENCES_STORAGE_KEY (140586)
 *   v6   → DEFAULT_MOBILE_HOME_PREFERENCES {organizeBy:workspace,sortBy:updated} (140587)
 *   APt  → safeLocalStorage           (140588)
 *   jPt  → isValidMobileHomePreferences (140596)
 *   MPt  → loadMobileHomePreferences  (140604)
 *   NPt  → saveMobileHomePreferences  (140614)
 *   PPt  → buildMobileHomeModel       pinned/timeline/groups/计数 (140619)
 *   FPt  → activeTaskPresentInModel   (140648)
 *   y6   → taskStatusBadgeClass       running/completed/error/idle (140658)
 *   IPt  → latestTaskUpdatedAt        (140670)
 *  [主题菜单]（js 140673–140714 / jsx 117301–117322）：
 *   LPt  → MOBILE_THEME_OPTIONS [system,zai-dark,zai-light] (140673)
 *   RPt  → MobileThemeMenu            手机端远控视图主题下拉 (140674)
 *  [状态图标/空回调]（js 140716–140725 / jsx 117323–117328）：
 *   b6   → TaskStatusIcon             running→spinner/completed→circle-check/error→circle-alert (140716)
 *   zPt  → noopSelectTask             (140725)
 *  [根] 手机端远控任务首页（js 140726–141572 / jsx 117329–117657）：
 *   BPt  → WebRemoteMobileTaskHome    props: activeTaskId/initialResult/onNavigateHome/onNavigateToChat 等
 *  [mobile 页状态 store + history]（js 141573–141600 / jsx 117658–117680）：
 *   VPt  → terminalTransportState     初值 `idle` (141574)
 *   HPt  → transportStateListeners    (141574)
 *   UPt  → subscribeTransportState    (141576)
 *   WPt  → getTerminalTransportState  (141584)
 *   GPt  → useTerminalTransportState  useSyncExternalStore (141587)
 *   x6   → isMobileChatHistoryState   history.state.zcodeMobilePage===`chat` (141590)
 *   KPt  → pushMobileChatHistoryState (141593)
 *   qPt  → resolveInitialMobilePage (141598)
 *  [根] 手机端壳（js 141601–141801 / jsx 117681–117765）：
 *   JPt  → WebRemoteMobileShell       home/chat 双页 + 侧pane 覆盖 + 重连通知
 *  [rRt 状态显示助手]（js 149473–149599 / jsx 123956–124056；位于 F11 地图范围尾段，
 *   rRt 的唯一消费族，纳入并注记双归属，F11 批若覆盖同段按整合期裁决）：
 *   JLt  → BOT_CHANNEL_PROVIDERS      [weixin,feishu,lark,telegram] (149473)
 *   YLt  → statusMatchesWorkspaceTarget (149479)
 *   XLt  → isStatusLiveMobileConnected (149490)
 *   ZLt  → resolveStatusTitle         starting/running/… (149495)
 *   QLt  → resolveStatusDetail        (149511)
 *   $Lt  → statusDotClass             error→bg-destructive/active→bg-success/idle→bg-border/余→bg-warning (149527)
 *   eRt  → resolveStatusTag           设备名/phone/ready/idle/error (149536)
 *   tRt  → isSameWebRemoteStatus      17 字段逐比 (149549)
 *   nRt  → resolveFailureMessage      11 种 failure.reason (149571)
 *  [根] 远控启动对话框（js 149600–150145 / jsx 124107–124375）：
 *   rRt  → WebRemoteControlDialog     memo；QR 配对 + 停止/刷新/复制 + Bot Channel 入口
 *  [特性门]（js 150146–150153 / jsx 124376–124387）：
 *   iRt  → WEB_REMOTE_CONTROL_ENABLED_DEFAULT  **D5b 改写：!0 → !1** (150147)
 *   aRt  → WebRemoteControlEnabledContext (150148)
 *   oRt  → WebRemoteControlEnabledProvider (150149)
 *   y8   → useWebRemoteControlEnabled (150152)
 *
 * ----------------------------------------------------------------------------
 * 二、边界裁决（只记录，不改动它批产物）
 * ----------------------------------------------------------------------------
 *  1. js 141802–142388（原 141785–142371）= YPt/XPt/ZPt/QPt/$Pt/eFt/tFt/S6/C6/oFt/w6：
 *     与 F00 TopBar 双归属，已随 TopBar.tsx 全量抽取（captureFeedbackScreenshots/
 *     exportLogsWithToast/useHelpActions/WindowsCaptionMenu/…），本文件不重复抽取。
 *  2. js 139942–140584（QNt…DPt 段）：f6/aPt/iPt/TPt/wPt/_Pt/gPt/vPt/DPt/EPt/_6/g6/SPt/CPt
 *     已随 SidebarLeaves.tsx（mLt 列表段）抽取；uPt/dPt/fPt/pPt 时间线分组已随 Sidebar.tsx
 *     抽取；QNt/$Nt/ePt/tPt/nPt 属 F03/F04 会话内查找，不在本族。BPt 以接口引用。
 *  3. Sidebar.tsx 对 rRt（4891 行 declare WebRemoteControlDialog）与 y8（4876 行 declare
 *     useWebRemoteControlEnabled）为接口级登记；本文件为唯一规范实现，整合期指向本文件。
 *  4. sRt/cRt/lRt（js 150154–150275，触发器族）与 uRt…xRt 用量族（150276–150480）已随
 *     Sidebar.tsx 抽取（resolveRemoteControlStatusDisplay/WebRemoteControlTrigger/…），
 *     本文件不重复抽取。
 *  5. CLt（147813，F11）返回 `login.oauth.regionTag.*` 键——D5b 云端删除后的**残留 i18n
 *     键**（仅 lark/feishu 区域标签），按现状逐字登记于 declare 注释，不改动。
 *  6. qLt（Bots 配置对话框）/_8（Bot 供应商头像）属 F11（§c #8 剩余），接口级登记。
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk / 它批已还原者，此处声明接口）
 * ----------------------------------------------------------------------------
 *  1. react (Q) / jsx-runtime ($)；2. cn (Z，UtilsCn)；3. Button (X，button chunk)；
 *  4. useIntlContext (G，IntlProvider chunk n 导出)；5. logger (J，logger chunk)；
 *  6. toast (m，imeComposition _ 导出)；7. usePlatformService (l，imeComposition M 导出)；
 *  8. 设置 store (ko)；9. Dialog 原语族 (zb/Hb/Ub/Gb/Kb)；10. DropdownMenu 原语族
 *  (VO/HO/UO/KO/qO/JO/YO)；11. 图标（lucide vendored 块 26575–28020 或跨 chunk 原语）；
 *  12. QR 生成库 Qq（qrcode vendored，X12）；13. testid 作用域拼接 qr/An（src chunk）；
 *  14. 远控切换器 aPt/任务键 f6/ei/排序 g6/分组 TPt/时间线 dPt+pPt（SidebarLeaves/Sidebar）；
 *  15. 相对时间 $S（QuickPick/Sidebar）。
 * ============================================================================
 */

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { LoaderCircle as IconLoaderCircle } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Button, createLucideIcon } from '../../modules/button'; // A0-CLEANUP 族清理：Button/createLucideIcon declare 改指 button chunk
/* ── A0-S2d 接线：跨模块 declare → 真实 import（属主/别名经 bundle 导出表核验）；混淆名注释随迁 ── */
import { t as logger } from '../../modules/logger';
import { dismissToast, toast } from '../../modules/ImeComposition';
import { useSettingsStore } from '../../modules/stores-core'; // 原 ko：设置 store（theme/setTheme 选择器用法）
import type { ThemeMode } from '../../modules/Settings'; // A0-CLEANUP B-22：theme 收敛 ThemeMode（type-only）
import { useConfirmDialog } from '../../modules/Modals'; // 原 U2（Modals.tsx useConfirmDialog，js 123510）
import { formatRelativeTime } from '../../modules/QuickPick'; // 原 $S（QuickPick.tsx formatRelativeTime，js 36080）
import { webRemoteWorkspaceKey as taskWorkspaceKey, joinTestidParts } from '../../modules/SrcSharedB'; // 原 ei（styles 导入块 `c as ei` = SrcSharedB wC 导出）：任务工作区键〔A1-R42〕+joinTestidParts（原 scopedTestId 收敛改指，见下墓碑）
import {
  BotsDialog as BotsConfigDialog, // 原 qLt（F11，147767 区）：Bots 配置对话框
  BotProviderIcon as BotProviderAvatar, // 原 _8（F11）：Bot 供应商头像
  regionTagKeyOfProvider as resolveBotProviderRegionTagId // 原 CLt（147813，F11）：Bot 供应商区域标签 i18n id
} from '../../modules/Bots';

// @types/react 18 尚未收录 `inert` 属性（React 19 类型才加入）；原 JSX 在
// <main> 上原样使用（js 141722 `inert: E ? !0 : void 0`），此处仅补类型垫片，
// 保持逐字重建（类型层，零运行时影响）。
declare module "react" {
  interface HTMLAttributes<T> {
    inert?: boolean;
  }
}

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

declare function cn(...inputs: Array<string | false | null | undefined>): string;
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };
/* ── tombstone（A0-S2d）：logger/toast/dismissToast declare 删除，canonical 在
 *    logger.tsx（t 导出）与 ImeComposition.tsx，经文件头真实 import 消费。 ── */

/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */

/** 原 l（imeComposition M 导出）：平台/桌面服务钩子（远控 IPC 面） */
interface WebRemoteControlStatusLike {
  status: string;
  sessionId?: string | null;
  windowControlSessionId?: string | null;
  deviceToken?: string | null;
  expiresAt?: number | null;
  mobileConnected?: boolean;
  /** 〔A1-R129l〕增补：HFt@144761 比较字段集（activeWorkspaceKey/activeTaskId/updatedAt）+ Sidebar 页脚消费面实证 */
  mobileViewState?: { activeWorkspaceKey?: string | null; activeTaskId?: string | null; updatedAt?: number | null } | null;
  mobileDeviceInfo?: {
    name?: string | null;
    browserPlatform?: string | null;
    userAgent?: string | null;
    updatedAt?: number | null;
    viewport?: { width?: number; height?: number } | null;
  } | null;
  qrUrl?: string | null;
  connectUrl?: string | null;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  error?: string | null;
  failure?: { reason?: string; message?: string } | null;
}
interface PlatformServiceLike {
  getWebRemoteControlStatus?(): Promise<WebRemoteControlStatusLike>;
  /** 〔A1-R129l〕增补：G6@144779 订阅源（束真 `n.onWebRemoteControlStatusChanged?.(...)`，返回退订函数） */
  onWebRemoteControlStatusChanged?(cb: (s: WebRemoteControlStatusLike) => void): () => void;
  startWebRemoteControl?(args: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    remoteSessionId?: string | null;
    initialTaskId?: string | null;
  }): Promise<WebRemoteControlStatusLike>;
  refreshWebRemoteControlPairing?(args: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    remoteSessionId?: string | null;
    initialTaskId?: string | null;
  }): Promise<WebRemoteControlStatusLike>;
  stopWebRemoteControl?(): Promise<unknown>;
  selectFile?(): Promise<string | null>;
  openExternal?(url: string): void;
  captureWindowScreenshot?(): Promise<Blob | null>;
  exportLogs?(): Promise<{ success: boolean; error?: string }>;
}
declare function usePlatformService(): PlatformServiceLike;

/* ── tombstone（A0-S2d）：ko useSettingsStore / U2 useConfirmDialog declare 删除，
 *    canonical 在 stores-core.tsx / Modals.tsx，经文件头真实 import 消费。 ── */

/* ---- Dialog 原语族（原 zb/Hb/Ub/Gb/Kb） ---- */
/* ── tombstone（A0-S3c）：Dialog、DialogContent、DialogDescription、DialogHeader、DialogTitle declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */

/* ---- DropdownMenu 原语族（原 VO/HO/UO/KO/qO/JO/YO） ---- */
/* ── tombstone（A0-S3c）：DropdownMenu、DropdownMenuContent、DropdownMenuLabel、DropdownMenuRadioGroup、DropdownMenuRadioItem、DropdownMenuSeparator、DropdownMenuTrigger declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */







/* ---- 图标（lucide vendored 块；名字逐字取自 Sa(`name`) 工厂） ---- */
interface IconProps { className?: string; "aria-hidden"?: boolean | "true" | "false" }
/* ── tombstone（A0-CLEANUP 族清理）：createLucideIcon declare 删除 → import from './button'。 ── */
const IconLoader = createLucideIcon("loader", []);                 // 原 fv（27363）
const IconCircleCheck = createLucideIcon("circle-check", []);      // 原 I_（26869）
const IconCircleAlert = createLucideIcon("circle-alert", []);      // 原 F_（26860）
const IconChevronDown = createLucideIcon("chevron-down", []);      // 原 N_（26850）
const IconChevronRight = createLucideIcon("chevron-right", []);    // 原 wa（button chunk）
const IconChevronsUp = createLucideIcon("chevrons-up", []);        // 原 fye（26856）
const IconMessageCirclePlus = createLucideIcon("message-circle-plus", []); // 原 hv（27427）
const IconMessageCircleCheck = createLucideIcon("message-circle-check", []); // 原 Xye（27417）
const IconFolderOpen = createLucideIcon("folder-open", []);        // 原 Q_（27151）
const IconClock3 = createLucideIcon("clock-3", []);                // 原 B_（26945）
const IconCloud = createLucideIcon("cloud", []);                   // 原 U_（26966）
const IconPin = createLucideIcon("pin", []);                       // 原 Ov（27626）
const IconArrowLeft = createLucideIcon("arrow-left", []);          // 原 S_（26682）
const IconPalette = createLucideIcon("palette", []);               // 原 wv（27570）
const IconMonitorSmartphone = createLucideIcon("monitor-smartphone", []); // 原 $ye（27505）
const IconSmartphone = createLucideIcon("smartphone", []);         // 原 Vv（27848）
const IconBot = createLucideIcon("bot", []);                       // 原 D_（26756）
const IconUnplug = createLucideIcon("unplug", []);                 // 原 jbe（27971）
const IconSettings2 = createLucideIcon("settings-2", []);          // 原 Lv（27800）
const IconPlus = createLucideIcon("plus", []);                     // 原 kv（27654）
const IconRefreshCw = createLucideIcon("refresh-cw", []);          // 原 Nv（27725）
const IconCopy = createLucideIcon("copy", []);                     // 原 W_（26974）
/** 关闭图标（原 g，button chunk） */
declare const IconX: React.FC<{ className?: string }>;
/** spinner：loader-circle（原 M，imeComposition w 导出） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconLoaderCircle → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** 原 Qq：qrcode vendored 库（X12）toDataURL */
declare const Qq: {
  toDataURL(text: string, options?: { margin?: number; width?: number }): Promise<string>;
};

/* ---- testid（src-HCld2afU.js；链：styles 别名 ← src 导出 ← 内部常量） ---- */
/* ── tombstone〔A1-R42〕：scopedTestId（原 qr/Nb 局部转录，src 8464）删除 → 一符一家收敛 SrcSharedB@5017
 * joinTestidParts（qr 真身链：styles 601 `Xa as qr` ← src 9836 `Nb as Xa` ≡ Nb js 8464 ≡ joinTestidParts
 * 逐字 `${e}-${t}`，R41 既判；本件与 canonical 逐字同形）。消费面实测 3 处改名改指：@883/@961/@1139
 * （≡ bundle 141125/141243/141501，BPt≡WebRemoteMobileTaskHome 内 qr(An, e.taskId)）；@116 导入面扩展。 ── */
const TESTID_TASK_ITEM = "task-item"; // 原 An ← Mi ← X_

/* ---- 它批已还原的远控助手（SidebarLeaves.tsx / Sidebar.tsx） ---- */
export interface TaskMeta {
  taskId: string;
  title?: string | null;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
  unreadAt?: number | null;
  displayStatus?: string | null;
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspaceLabel?: string | null;
}
export interface WebRemoteWorkspaceInfo { // 〔A1-R52〕补 export：switcher 族属主闭合，SidebarLeaves §6 消费面改指（型缝销账）
  kind: "local" | "remote" | string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  label?: string;
  workspacePurpose?: string | null;
  connectionState?: string | null;
  remoteSessionId?: string | null;
  lastConnectionError?: string | null;
}
export interface MobileHomeResult {
  workspaces: WebRemoteWorkspaceInfo[];
  tasks: TaskMeta[];
  activeWorkspaceKey?: string | null;
  activeTaskId?: string | null;
}
/** 原 aPt（SidebarLeaves useWebRemoteTaskSwitcher，jsx 116882） */
declare function useWebRemoteTaskSwitcher(args: {
  activeTaskId: string | null;
  activeWorkspaceIdentity?: string | null;
  activeWorkspacePath: string;
  markTaskReadOnOpen: boolean;
  mobileNavigationIntent: string;
  onNavigateHome?: () => void;
  onNavigateToChat?: () => void;
  onSelectTask?: (task: TaskMeta) => void;
  onSwitchingChange?: (v: boolean) => void;
  switcher: WebRemoteSwitcherService;
}): { error: string | null; openTask: (task: TaskMeta) => void; switchingTaskKey: string | null };
/** 原 f6（SidebarLeaves webRemoteTaskKey） */
declare function webRemoteTaskKey(task: TaskMeta): string;
/* ── tombstone（A0-S2d）：ei taskWorkspaceKey declare 删除——styles 导入块 `c as ei`
 *    证明实体 = SrcSharedB webRemoteWorkspaceKey（wC，jsx 9632），经文件头真实
 *    import 消费（B5 注「SidebarLeaves」为误归）。 ── */
/** 原 g6（SidebarLeaves sortTaskRows） */
declare function sortTaskRows(tasks: TaskMeta[], sortBy: string): TaskMeta[];
/** 原 TPt（SidebarLeaves groupTasksByWorkspace） */
declare function groupTasksByWorkspace(args: {
  workspaces: WebRemoteWorkspaceInfo[];
  tasks: TaskMeta[];
}): Array<{ workspaceKey: string; workspace: WebRemoteWorkspaceInfo; tasks: TaskMeta[]; totalTaskCount?: number; hasUnread?: boolean }>;
/** 原 dPt（Sidebar.tsx 时间线桶→i18n 描述，jsx 116989） */
declare function timelineBucketLabel(bucket: string): { id: string; values?: Record<string, unknown> };
/** 原 pPt（Sidebar.tsx 按日期桶分组，jsx 117002） */
declare function groupTasksByTimelineBucket(
  tasks: TaskMeta[],
  options: { sortBy: string; now: number; locale: string },
): Array<{ key: string; label: string; items: TaskMeta[] }>;
/* ── tombstone（A0-S2d）：$S formatRelativeTime declare 删除，canonical 在
 *    QuickPick.tsx（已导出），经文件头真实 import 消费。 ── */
/** 原 p6：错误文本提取（SidebarLeaves 域，jsx 116942 区；属主在域外且未导出，
 *  登记「需要的 export：SidebarLeaves toErrorMessage(p6)」，保留 declare） */
declare function toErrorMessage(e: unknown): string;

/** 手机端远控 switcher 服务面（BPt/aPt 共用 props.switcher）
 * 〔A1-R52〕属主闭合：+markTaskRead 可选面（bundle 140225 typeof 守卫 + 140235 `.markTaskRead(f).catch` 实证；
 * 消费面 SidebarLeaves openWebRemoteTask 同形守卫调用）——六点分叉表（A1-P2-B9.report.md §四）闭合，
 * 消费面 SidebarLeaves §6 本地三型（WebRemoteWorkspace/WebRemoteTaskIndex/WebRemoteSwitcher）同批删碑改指本面。 */
export interface WebRemoteSwitcherService {
  listWorkspaces(): Promise<MobileHomeResult>;
  onWorkspaceListUpdated?(cb: (result: MobileHomeResult) => void): () => void;
  markTaskRead?(task: TaskMeta): Promise<void>;
  reconnectWorkspace?(workspaceKey: string): Promise<unknown>;
  startDraft?(workspaceKey: string, options: { mobileNavigationIntent: string }): Promise<unknown>;
  switchWorkspace(workspaceKey: string, options: { mobileNavigationIntent: string }): Promise<unknown>;
  updateMobileViewState?(workspaceKey: string, taskId?: string): Promise<unknown>;
}

/* ---- F11 Bots 族（rRt 依赖面）：A0-S2d 已接线自 Bots.tsx 真实导出 ----
 * ── tombstone（A0-S2d）：CLt resolveBotProviderRegionTagId / _8 BotProviderAvatar /
 *    qLt BotsConfigDialog declare 删除，canonical 在 Bots.tsx
 *    （regionTagKeyOfProvider / BotProviderIcon / BotsDialog，均已导出），
 *    经文件头真实 import 消费。CLt 返回值注记保留：
 *    `login.oauth.regionTag.zai`/`login.oauth.regionTag.bigmodel` 为 D5b 云端删除后的残留键。 ── */

/* ============================================================================
 * 1. MobileHome 模型与偏好（原 OPt…IPt，js 140585–140672 / jsx 117214–117299）
 * ==========================================================================*/

/** 原 OPt（140585） */
const EMPTY_MOBILE_HOME_RESULT: MobileHomeResult = { workspaces: [], tasks: [] };
/** 原 kPt（140586） */
const MOBILE_HOME_PREFERENCES_STORAGE_KEY = `zcode-web-remote-control-mobile-task-home-preferences`;
/** 原 v6（140587） */
const DEFAULT_MOBILE_HOME_PREFERENCES: MobileHomePreferences = {
  organizeBy: `workspace`,
  sortBy: `updated`,
};
interface MobileHomePreferences {
  organizeBy: "workspace" | "timeline";
  sortBy: "created" | "updated";
}
/** 原 APt（140588） */
function safeLocalStorage(): Storage | null {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
/** 原 jPt（140596） */
function isValidMobileHomePreferences(e: unknown): e is MobileHomePreferences {
  if (typeof e != `object` || !e) return false;
  const t = e as Record<string, unknown>;
  return (
    (t.organizeBy === `workspace` || t.organizeBy === `timeline`) &&
    (t.sortBy === `created` || t.sortBy === `updated`)
  );
}
/** 原 MPt（140604） */
function loadMobileHomePreferences(e: Storage | null = safeLocalStorage()): MobileHomePreferences {
  try {
    const t = e?.getItem(MOBILE_HOME_PREFERENCES_STORAGE_KEY);
    if (!t) return DEFAULT_MOBILE_HOME_PREFERENCES;
    const n = JSON.parse(t);
    return isValidMobileHomePreferences(n) ? n : DEFAULT_MOBILE_HOME_PREFERENCES;
  } catch {
    return DEFAULT_MOBILE_HOME_PREFERENCES;
  }
}
/** 原 NPt（140614） */
function saveMobileHomePreferences(e: MobileHomePreferences, t: Storage | null = safeLocalStorage()): void {
  try {
    t?.setItem(MOBILE_HOME_PREFERENCES_STORAGE_KEY, JSON.stringify(e));
  } catch {}
}
interface MobileHomeModel {
  activeTaskId: string | null;
  activeWorkspaceKey: string;
  defaultExpandedWorkspaceKeys: Set<string>;
  pinnedTasks: TaskMeta[];
  timelineTasks: TaskMeta[];
  groups: Array<{ workspaceKey: string; workspace: WebRemoteWorkspaceInfo; tasks: TaskMeta[]; totalTaskCount?: number; hasUnread?: boolean }>;
  totalTaskCount: number;
  totalWorkspaceCount: number;
}
/** 原 PPt（140619）：活动键归并 + pinned/timeline/groups 三视图模型 */
function buildMobileHomeModel({
  activeTaskId: e,
  activeWorkspaceIdentity: t,
  activeWorkspacePath: n,
  sortBy: r = `updated`,
  result: i,
}: {
  activeTaskId: string | null;
  activeWorkspaceIdentity?: string | null;
  activeWorkspacePath: string;
  sortBy?: "created" | "updated";
  result: MobileHomeResult;
}): MobileHomeModel {
  const a = taskWorkspaceKey({ workspacePath: n, workspaceIdentity: t ?? null });
  const o = i.activeWorkspaceKey ?? a;
  const s = i.activeTaskId ?? e;
  const c = (i.tasks ?? []).filter((e) => !e.archived);
  const l = sortTaskRows(
    c.filter((e) => e.pinned),
    r,
  );
  const u = c.filter((e) => !e.pinned);
  const d = groupTasksByWorkspace({ workspaces: i.workspaces, tasks: u });
  const f = d.some((e) => e.workspaceKey === o);
  return {
    activeTaskId: s ?? null,
    activeWorkspaceKey: o,
    defaultExpandedWorkspaceKeys: new Set(f ? [o] : []),
    pinnedTasks: l,
    timelineTasks: sortTaskRows(u, r),
    groups: d,
    totalTaskCount: c.length,
    totalWorkspaceCount: d.length,
  };
}
/** 原 FPt（140648）：活动任务存在于模型（pinned 或分组内），无活动任务恒真 */
function activeTaskPresentInModel(e: MobileHomeModel): boolean {
  return e.activeTaskId
    ? e.pinnedTasks.some((t) => t.taskId === e.activeTaskId && taskWorkspaceKey(t) === e.activeWorkspaceKey) ||
        e.groups.some(
          (t) =>
            t.workspaceKey === e.activeWorkspaceKey &&
            t.tasks.some((t) => t.taskId === e.activeTaskId),
        )
    : true;
}
/** 原 y6（140658）：状态徽章类名 */
function taskStatusBadgeClass(e: string): string {
  switch (e) {
    case `running`:
      return `border-brand/40 bg-accent text-foreground`;
    case `completed`:
      return `border-success/40 bg-success text-success-foreground`;
    case `error`:
      return `border-destructive/40 bg-destructive text-destructive-foreground`;
    case `idle`:
      return `border-border bg-surface text-foreground-subtle`;
  }
  return `border-border bg-surface text-foreground-subtle`;
}
/** 原 IPt（140670） */
function latestTaskUpdatedAt(e: TaskMeta[]): number | null {
  return e.length === 0 ? null : Math.max(...e.map((e) => e.updatedAt));
}

/* ============================================================================
 * 2. 主题菜单（原 LPt/RPt，js 140673–140714 / jsx 117301–117322）
 * ==========================================================================*/

/** 原 LPt（140673） */
const MOBILE_THEME_OPTIONS = [`system`, `zai-dark`, `zai-light`];
/** 原 RPt（140674）：手机端远控视图右上角主题下拉 */
function MobileThemeMenu() {
  const { intl: e } = useIntlContext();
  const t = useSettingsStore((e) => e.theme);
  const n = useSettingsStore((e) => e.setTheme);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={e.formatMessage({ id: `webRemoteControl.themeMenu.trigger` })}
        >
          <IconPalette className={`size-4`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup
          value={t}
          onValueChange={(e) => {
            MOBILE_THEME_OPTIONS.includes(e) && n(e as ThemeMode);
          }}
        >
          {MOBILE_THEME_OPTIONS.map((t) => (
            <DropdownMenuRadioItem key={t} value={t}>
              {t === `system`
                ? e.formatMessage({ id: `sidebar.settings.systemDefault` })
                : e.formatMessage({ id: `sidebar.settings.theme.${t}` })}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================================================
 * 3. 状态图标 / 空回调（原 b6/zPt，js 140716–140725 / jsx 117323–117328）
 * ==========================================================================*/

/** 原 b6（140716）：任务状态小图标 */
function TaskStatusIcon(e: string) {
  return e === `running` ? (
    <IconLoader className={`size-3 animate-spin`} />
  ) : e === `completed` ? (
    <IconCircleCheck className="size-3" />
  ) : e === `error` ? (
    <IconCircleAlert className="size-3" />
  ) : null;
}
/** 原 zPt（140725） */
function noopSelectTask() {}

/* ============================================================================
 * 4. WebRemoteMobileTaskHome（原 BPt，js 140726–141572 / jsx 117329–117657）
 * ==========================================================================*/

export function WebRemoteMobileTaskHome({
  activeTaskId: e,
  activeWorkspaceIdentity: t,
  activeWorkspacePath: n,
  initialResult: r,
  onNavigateHome: i,
  onNavigateToChat: a,
  onOpenTask: o,
  preferences: s,
  onPreferencesChange: c,
  onSelectTask: l = noopSelectTask,
  onStartDraftInWorkspace: u,
  refreshKey: d,
  onCrossWorkspaceSwitchingChange: f,
  switcher: p,
}: {
  activeTaskId: string | null;
  activeWorkspaceIdentity?: string | null;
  activeWorkspacePath: string;
  initialResult?: MobileHomeResult | null;
  onNavigateHome?: () => void;
  onNavigateToChat?: () => void;
  onOpenTask?: (task: TaskMeta) => void;
  preferences: MobileHomePreferences;
  onPreferencesChange: (next: MobileHomePreferences) => void;
  onSelectTask?: (task: TaskMeta) => void;
  onStartDraftInWorkspace?: (workspacePath: string, workspaceIdentity?: string | null) => void;
  refreshKey?: number;
  onCrossWorkspaceSwitchingChange?: (v: boolean) => void;
  switcher: WebRemoteSwitcherService;
}) {
  const { intl: m, locale: h } = useIntlContext();
  const [g, _] = React.useState<MobileHomeResult>(r ?? EMPTY_MOBILE_HOME_RESULT);
  const [v, y] = React.useState(!r);
  const [b, x] = React.useState<string | null>(null);
  const S = s.organizeBy;
  const C = s.sortBy;
  const w = React.useMemo(
    () =>
      buildMobileHomeModel({
        activeTaskId: e,
        activeWorkspaceIdentity: t,
        activeWorkspacePath: n,
        sortBy: C,
        result: r ?? EMPTY_MOBILE_HOME_RESULT,
      }),
    [e, t, n, r, C],
  );
  const [T, E] = React.useState(() => new Set(w.defaultExpandedWorkspaceKeys));
  const D = React.useRef(!!r);
  const O = React.useMemo(
    () =>
      buildMobileHomeModel({
        activeTaskId: e,
        activeWorkspaceIdentity: t,
        activeWorkspacePath: n,
        sortBy: C,
        result: g,
      }),
    [e, t, n, g, C],
  );
  const k = React.useMemo(
    () => [...O.defaultExpandedWorkspaceKeys].join(`\0`),
    [O.defaultExpandedWorkspaceKeys],
  );
  const A = React.useMemo(
    () => new Map(O.groups.map((e) => [e.workspaceKey, e.workspace])),
    [O.groups],
  );
  const j = React.useMemo(
    () => groupTasksByTimelineBucket(O.timelineTasks, { sortBy: C, now: Date.now(), locale: h }),
    [h, O.timelineTasks, C],
  );
  const {
    error: M,
    openTask: N,
    switchingTaskKey: P,
  } = useWebRemoteTaskSwitcher({
    activeTaskId: O.activeTaskId,
    activeWorkspaceIdentity: t,
    activeWorkspacePath: n,
    markTaskReadOnOpen: true,
    mobileNavigationIntent: `chat`,
    onNavigateHome: i,
    onNavigateToChat: a,
    onSelectTask: l,
    onSwitchingChange: f,
    switcher: p,
  });
  const F = b ?? M;
  const I = React.useCallback(async () => {
    y(true), x(null);
    try {
      _(await p.listWorkspaces());
    } catch (e) {
      const t = toErrorMessage(e);
      logger.error(`[WebRemoteControlMobileTaskHome] 加载远控首页失败`, { error: t }), x(t);
    } finally {
      y(false);
    }
  }, [p]);
  React.useEffect(() => {
    r || I();
  }, [r, I]);
  React.useEffect(() => {
    d && I();
  }, [I, d]);
  React.useEffect(
    () =>
      p.onWorkspaceListUpdated?.((e) => {
        _(e), x(null), y(false);
      }),
    [p],
  );
  React.useEffect(() => {
    D.current || v || (D.current = true, E(new Set(O.defaultExpandedWorkspaceKeys)));
  }, [k, v, O.defaultExpandedWorkspaceKeys]);
  React.useEffect(() => {
    if (!(v || g.workspaces.length === 0)) {
      if (!O.groups.find((e) => e.workspaceKey === O.activeWorkspaceKey)) {
        logger.warn(`[WebRemoteControlMobileTaskHome] 初始 workspace 未匹配`, {
          workspaceKey: O.activeWorkspaceKey,
        });
        return;
      }
      activeTaskPresentInModel(O) ||
        logger.warn(`[WebRemoteControlMobileTaskHome] 初始 task 未匹配`, {
          taskId: O.activeTaskId,
          workspaceKey: O.activeWorkspaceKey,
        });
    }
  }, [v, O.activeTaskId, O.activeWorkspaceKey, O.groups, g.workspaces.length]);
  const L = React.useCallback((e: string) => {
      E((t) => {
        const n = new Set(t);
        return (n.has(e) ? n.delete(e) : n.add(e), n);
      });
    }, []);
  const R = React.useCallback(() => {
      E(new Set());
    }, []);
  const z = React.useCallback(
    (e: TaskMeta) => {
      if (o) {
        o(e);
        return;
      }
      N(e);
    },
    [o, N],
  );
  const [B, V] = React.useState<string | null>(null);
  const [H, ee] = React.useState<string | null>(null);
  const U = React.useCallback(
    async (e: WebRemoteWorkspaceInfo) => {
      const t = taskWorkspaceKey(e);
      if (p.reconnectWorkspace) {
        x(null), ee(t);
        try {
          await p.reconnectWorkspace(t), await I();
        } catch (e) {
          const n = toErrorMessage(e);
          logger.error(`[WebRemoteControlMobileTaskHome] 手机端重连远程工作区失败`, {
            error: n,
            workspaceKey: t,
          }),
            x(n);
        } finally {
          ee(null);
        }
      }
    },
    [I, p],
  );
  const te = React.useCallback(
    async (e: WebRemoteWorkspaceInfo) => {
      const t = taskWorkspaceKey(e);
      const n = t !== O.activeWorkspaceKey;
      x(null), V(t), f?.(true);
      try {
        p.startDraft
          ? await p.startDraft(t, { mobileNavigationIntent: `chat` })
          : (await p.switchWorkspace(t, { mobileNavigationIntent: `chat` }),
            await p.updateMobileViewState?.(t)),
          n || (u?.(e.workspacePath, e.workspaceIdentity), a?.());
      } catch (e) {
        const n = toErrorMessage(e);
        logger.error(`[WebRemoteControlMobileTaskHome] 手机端新建任务失败`, {
          error: n,
          workspaceKey: t,
        }),
          x(n);
      } finally {
        V(null), f?.(false);
      }
    },
    [O.activeWorkspaceKey, f, a, u, p],
  );
  return (
    <section className={`flex h-full min-h-0 flex-col bg-background text-foreground`}>
      <header className={`shrink-0 border-b border-border bg-header px-4 py-3`}>
        <div className={`flex min-w-0 items-start justify-between gap-3`}>
          <div className={`min-w-0`}>
            <div className={`truncate text-ui-lg font-medium`}>
              {m.formatMessage({ id: `webRemoteControl.mobileHome.title` })}
            </div>
            <div className={`mt-1 text-ui-base text-foreground-subtle`}>
              {m.formatMessage({ id: `webRemoteControl.mobileHome.connected` })}
            </div>
          </div>
          <div className={`flex shrink-0 items-center gap-1`}>
            <MobileThemeMenu />
          </div>
        </div>
      </header>
      <div className={`min-h-0 flex-1 overflow-y-auto px-3 py-3`}>
        <div className={`rounded-lg border border-card-border bg-card p-3 text-ui-base/relaxed text-foreground-subtle`}>
          {m.formatMessage({ id: `webRemoteControl.mobileHome.notice` })}
        </div>
        <div className={`mt-4 flex items-start justify-between gap-3`}>
          <div className={`min-w-0`}>
            <h1 className={`text-ui-base font-medium`}>
              {m.formatMessage({ id: `webRemoteControl.mobileHome.sectionTitle` })}
            </h1>
            <p className={`mt-1 text-ui-base text-foreground-subtle`}>
              {m.formatMessage(
                { id: `webRemoteControl.mobileHome.summary` },
                {
                  taskCount: String(O.totalTaskCount),
                  workspaceCount: String(O.totalWorkspaceCount),
                },
              )}
            </p>
          </div>
          <div className={`flex shrink-0 items-center gap-1`}>
            {S === `workspace` ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={m.formatMessage({
                  id: `webRemoteControl.mobileHome.collapseAll`,
                })}
                onClick={R}
              >
                <IconChevronsUp className={`size-3.5`} />
              </Button>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={m.formatMessage({
                    id: `webRemoteControl.mobileHome.organize`,
                  })}
                >
                  <IconSettings2 className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-52 min-w-52`}>
                <DropdownMenuLabel>
                  {m.formatMessage({
                    id: `webRemoteControl.mobileHome.organize`,
                  })}
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={S}
                  onValueChange={(e) => {
                    (e === `workspace` || e === `timeline`) && c({ ...s, organizeBy: e });
                  }}
                >
                  <DropdownMenuRadioItem value={`workspace`}>
                    <IconFolderOpen className={`size-4`} />
                    {m.formatMessage({
                      id: `webRemoteControl.mobileHome.organizeByWorkspace`,
                    })}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={`timeline`}>
                    <IconClock3 className={`size-4`} />
                    {m.formatMessage({
                      id: `webRemoteControl.mobileHome.organizeByTimeline`,
                    })}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{m.formatMessage({ id: `webRemoteControl.mobileHome.sortBy` })}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={C}
                  onValueChange={(e) => {
                    (e === `created` || e === `updated`) && c({ ...s, sortBy: e });
                  }}
                >
                  <DropdownMenuRadioItem value={`created`}>
                    <IconMessageCirclePlus className={`size-4`} />
                    {m.formatMessage({
                      id: `webRemoteControl.mobileHome.sortByCreated`,
                    })}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={`updated`}>
                    <IconMessageCircleCheck className={`size-4`} />
                    {m.formatMessage({
                      id: `webRemoteControl.mobileHome.sortByUpdated`,
                    })}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={m.formatMessage({ id: `webRemoteControl.mobileHome.refresh` })}
              onClick={() => {
                I();
              }}
            >
              <IconRefreshCw className={cn(`size-3.5`, v && `animate-spin`)} />
            </Button>
          </div>
        </div>
        {F ? (
          <div className={`mt-3 rounded-lg border border-destructive/40 bg-card px-3 py-2 text-ui-base text-destructive`}>
            {F}
          </div>
        ) : null}
        {v && O.totalWorkspaceCount === 0 ? (
          <div className={`mt-3 flex items-center gap-2 px-1 py-2 text-ui-base text-foreground-subtle`}>
            <IconLoader className={`size-3.5 animate-spin`} />
            {m.formatMessage({ id: `common.loading` })}
          </div>
        ) : null}
        {!v && !F && O.totalWorkspaceCount === 0 ? (
          <div className={`mt-3 px-1 py-2 text-ui-base text-foreground-subtle`}>
            {m.formatMessage({ id: `webRemoteControl.noTasks` })}
          </div>
        ) : null}
        {O.pinnedTasks.length > 0 ? (
          <section className={`mt-3`}>
            <h2 className={`px-1 py-1 text-ui-base font-medium text-foreground-subtlest`}>
              {m.formatMessage({ id: `taskList.pinnedSection` })}
            </h2>
            <ul className={`space-y-1`}>
              {O.pinnedTasks.map((e) => {
                const t = webRemoteTaskKey(e);
                const n = taskWorkspaceKey(e);
                const r = A.get(n);
                const i =
                  r?.kind === `remote` && (r.connectionState === `disconnected` || !r.remoteSessionId);
                const a = n === O.activeWorkspaceKey && e.taskId === O.activeTaskId;
                const o = P === t;
                const s = e.title || m.formatMessage({ id: `taskList.untitled` });
                const c = e.displayStatus ?? `idle`;
                return (
                  <li key={t}>
                    <button
                      type="button"
                      data-testid={joinTestidParts(TESTID_TASK_ITEM, e.taskId)}
                      data-state={a ? `selected` : `idle`}
                      className={cn(
                        `flex min-h-12 w-full min-w-0 items-center gap-2 rounded-lg border border-card-border bg-card px-3 py-2 text-left transition-colors disabled:cursor-wait disabled:opacity-70`,
                        a ? `bg-selected text-foreground` : `hover:bg-surface-hover`,
                      )}
                      disabled={!!P || i}
                      onClick={() => {
                        i || z(e);
                      }}
                      aria-label={m.formatMessage({ id: `webRemoteControl.openTask` }, { title: s })}
                    >
                      <span className={`relative flex size-4 shrink-0 items-center justify-center text-foreground-subtle`}>
                        {o ? <IconLoader className={`size-4 animate-spin`} /> : <IconPin className={`size-4`} />}
                        {!o && e.unreadAt ? (
                          <span className={`absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400`} />
                        ) : null}
                      </span>
                      <span className={`min-w-0 flex-1`}>
                        <span className={`block truncate text-ui-base text-foreground`}>{s}</span>
                        <span className={`mt-1 flex min-w-0 items-center gap-1.5 text-ui-base text-foreground-subtle`}>
                          <span className={`truncate`}>
                            {r?.workspacePurpose === `conversation`
                              ? m.formatMessage({ id: `workspaceSidebar.conversationsSection` })
                              : e.workspaceLabel || r?.label || e.workspacePath}
                          </span>
                          <span className={`shrink-0`}>{`·`}</span>
                          <span className={`truncate`}>
                            {formatRelativeTime(C === `created` ? e.createdAt : e.updatedAt, m)}
                          </span>
                        </span>
                      </span>
                      <span
                        className={cn(
                          `inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-ui-xs leading-none`,
                          taskStatusBadgeClass(c),
                        )}
                      >
                        {TaskStatusIcon(c)}
                        {m.formatMessage({ id: `webRemoteControl.taskStatus.${c}` })}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
        {S === `timeline` ? (
          <ul className={`mt-3 space-y-2`}>
            {O.totalTaskCount === 0 && O.totalWorkspaceCount > 0 ? (
              <li className={`px-1 py-2 text-ui-base text-foreground-subtle`}>
                {m.formatMessage({ id: `webRemoteControl.noTasks` })}
              </li>
            ) : null}
            {j.map((e) => {
              const t = timelineBucketLabel(e.label);
              return (
                <li key={e.key} className={`space-y-1`}>
                  <div className={`px-1 py-1 text-ui-base font-medium text-foreground-subtle`}>
                    {m.formatMessage({ id: t.id }, t.values)}
                  </div>
                  <ul className={`space-y-1`}>
                    {e.items.map((e) => {
                      const t = webRemoteTaskKey(e);
                      const n = taskWorkspaceKey(e);
                      const r = A.get(n);
                      const i =
                        r?.kind === `remote` &&
                        (r.connectionState === `disconnected` || !r.remoteSessionId);
                      const a = n === O.activeWorkspaceKey && e.taskId === O.activeTaskId;
                      const o = P === t;
                      const s = e.title || m.formatMessage({ id: `taskList.untitled` });
                      const c = e.displayStatus ?? `idle`;
                      return (
                        <li key={t}>
                          <button
                            type="button"
                            data-testid={joinTestidParts(TESTID_TASK_ITEM, e.taskId)}
                            data-state={a ? `selected` : `idle`}
                            className={cn(
                              `flex min-h-14 w-full min-w-0 items-center gap-2 rounded-lg border border-card-border bg-card px-3 py-2 text-left transition-colors disabled:cursor-wait disabled:opacity-70`,
                              a ? `bg-selected text-foreground` : `hover:bg-surface-hover`,
                            )}
                            disabled={!!P || i}
                            onClick={() => {
                              i || z(e);
                            }}
                          >
                            <span className={`relative flex size-4 shrink-0 items-center justify-center`}>
                              {o ? (
                                <IconLoader className={`size-4 animate-spin text-foreground-subtle`} />
                              ) : e.unreadAt ? (
                                <span className={`h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400`} />
                              ) : null}
                            </span>
                            <span className={`min-w-0 flex-1`}>
                              <span className={`block truncate text-ui-base text-foreground`}>{s}</span>
                              <span className={`mt-1 flex min-w-0 items-center gap-1.5 text-ui-base text-foreground-subtle`}>
                                <span className={`truncate`}>
                                  {r?.workspacePurpose === `conversation`
                                    ? m.formatMessage({ id: `workspaceSidebar.conversationsSection` })
                                    : e.workspaceLabel || r?.label || e.workspacePath}
                                </span>
                                <span className={`shrink-0`}>{`·`}</span>
                                <span className={`truncate`}>
                                  {formatRelativeTime(C === `created` ? e.createdAt : e.updatedAt, m)}
                                </span>
                              </span>
                            </span>
                            <span
                              className={cn(
                                `inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-ui-xs leading-none`,
                                taskStatusBadgeClass(c),
                              )}
                            >
                              {TaskStatusIcon(c)}
                              {m.formatMessage({ id: `webRemoteControl.taskStatus.${c}` })}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className={`mt-3 space-y-2`}>
            {O.groups.map((e) => {
              const t = T.has(e.workspaceKey);
              const n = latestTaskUpdatedAt(e.tasks);
              const r =
                e.workspace.kind === `remote` &&
                (e.workspace.connectionState === `disconnected` || !e.workspace.remoteSessionId);
              const i = H === e.workspaceKey;
              return (
                <li key={e.workspaceKey} className={`rounded-lg border border-card-border bg-card`}>
                  <div className={`flex min-w-0 items-center gap-2 px-3 py-3`}>
                    <button
                      type="button"
                      className={`flex min-w-0 flex-1 items-center gap-2 text-left`}
                      aria-expanded={t}
                      onClick={() => L(e.workspaceKey)}
                    >
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground-subtle`}>
                        {e.workspace.workspacePurpose === `conversation` ? (
                          <IconMessageCirclePlus className={`size-4`} />
                        ) : e.workspace.kind === `remote` ? (
                          <IconCloud className={`size-4`} />
                        ) : (
                          <IconFolderOpen className={`size-4`} />
                        )}
                      </span>
                      <span className={`min-w-0 flex-1`}>
                        <span className={`flex min-w-0 items-center gap-2`}>
                          <span className={`truncate text-ui-base font-medium text-foreground`}>
                            {e.workspace.workspacePurpose === `conversation`
                              ? m.formatMessage({ id: `workspaceSidebar.conversationsSection` })
                              : e.workspace.label}
                          </span>
                          <span className={`shrink-0 rounded-full border border-border bg-surface px-1.5 py-0.5 text-ui-xs leading-none text-foreground-subtle`}>
                            {m.formatMessage({
                              id:
                                e.workspace.workspacePurpose === `conversation`
                                  ? `webRemoteControl.mobileHome.workspaceKind.conversation`
                                  : e.workspace.kind === `remote`
                                    ? `webRemoteControl.mobileHome.workspaceKind.remote`
                                    : `webRemoteControl.mobileHome.workspaceKind.local`,
                            })}
                          </span>
                          {r ? (
                            <span className={`shrink-0 rounded-full border border-destructive/40 bg-card px-1.5 py-0.5 text-ui-xs leading-none text-destructive`}>
                              {m.formatMessage({ id: `webRemoteControl.mobileHome.disconnected` })}
                            </span>
                          ) : null}
                        </span>
                        <span className={`mt-1 block truncate font-mono text-ui-base text-foreground-subtlest`}>
                          {e.workspace.workspacePath}
                        </span>
                        {e.workspace.lastConnectionError ? (
                          <span className={`mt-1 block truncate text-ui-base text-destructive`}>
                            {e.workspace.lastConnectionError}
                          </span>
                        ) : null}
                        {n ? (
                          <span className={`mt-1 block text-ui-base text-foreground-subtle`}>
                            {m.formatMessage({ id: `webRemoteControl.mobileHome.updatedAt` }, { time: formatRelativeTime(n, m) })}
                          </span>
                        ) : null}
                      </span>
                      <span className={`flex shrink-0 items-center gap-2 text-ui-base text-foreground-subtle`}>
                        {!t && e.hasUnread ? (
                          <span
                            aria-hidden={`true`}
                            data-workspace-unread-indicator={`true`}
                            className={`h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400`}
                          />
                        ) : null}
                        {m.formatMessage({ id: `webRemoteControl.mobileHome.taskCount` }, { count: String(e.tasks.length) })}
                        {t ? <IconChevronDown className={`size-4`} /> : <IconChevronRight className={`size-4`} />}
                      </span>
                    </button>
                    {r ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!p.reconnectWorkspace || !!P || !!B || !!H}
                        onClick={() => {
                          U(e.workspace);
                        }}
                      >
                        {i ? <IconLoader className={`size-3.5 animate-spin`} /> : <IconRefreshCw className={`size-3.5`} />}
                        <span className={`sr-only`}>
                          {m.formatMessage({
                            id: i ? `webRemoteControl.mobileHome.reconnecting` : `webRemoteControl.mobileHome.reconnect`,
                          })}
                        </span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!!P || !!B || !!H}
                        onClick={() => {
                          te(e.workspace);
                        }}
                      >
                        {B === e.workspaceKey ? (
                          <IconLoader className={`size-3.5 animate-spin`} />
                        ) : (
                          <IconPlus className={`size-3.5`} />
                        )}
                      </Button>
                    )}
                  </div>
                  {t ? (
                    <ul className={`border-t border-card-border px-2 py-2`}>
                      {e.tasks.length === 0 ? (
                        <li className={`px-2 py-2 text-ui-base text-foreground-subtle`}>
                          {m.formatMessage({ id: `webRemoteControl.mobileHome.workspaceEmpty` })}
                        </li>
                      ) : null}
                      {e.tasks.map((e) => {
                        const t = webRemoteTaskKey(e);
                        const n = taskWorkspaceKey(e) === O.activeWorkspaceKey && e.taskId === O.activeTaskId;
                        const i = P === t;
                        const a = e.title || m.formatMessage({ id: `taskList.untitled` });
                        const o = e.displayStatus ?? `idle`;
                        return (
                          <li key={t}>
                            <button
                              type="button"
                              data-testid={joinTestidParts(TESTID_TASK_ITEM, e.taskId)}
                              data-state={n ? `selected` : `idle`}
                              className={cn(
                                `flex min-h-12 w-full min-w-0 items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors disabled:cursor-wait disabled:opacity-70`,
                                n ? `bg-selected text-foreground` : `hover:bg-surface-hover`,
                              )}
                              disabled={!!P || r}
                              onClick={() => {
                                r || z(e);
                              }}
                            >
                              <span className={`relative flex size-4 shrink-0 items-center justify-center`}>
                                {i ? (
                                  <IconLoader className={`size-4 animate-spin text-foreground-subtle`} />
                                ) : e.unreadAt ? (
                                  <span className={`h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400`} />
                                ) : null}
                              </span>
                              <span className={`min-w-0 flex-1`}>
                                <span className={`block truncate text-ui-base text-foreground`}>{a}</span>
                                <span className={`mt-1 flex min-w-0 items-center gap-1.5 text-ui-base text-foreground-subtle`}>
                                  <span className={`truncate`}>{formatRelativeTime(e.updatedAt, m)}</span>
                                </span>
                              </span>
                              <span
                                className={cn(
                                  `inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-ui-xs leading-none`,
                                  taskStatusBadgeClass(o),
                                )}
                              >
                                {TaskStatusIcon(o)}
                                {m.formatMessage({ id: `webRemoteControl.taskStatus.${o}` })}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
 * 5. mobile 页状态 store + history（原 VPt…qPt，js 141573–141600 / jsx 117658–117680）
 * ==========================================================================*/

/** 原 VPt（141573） */
let terminalTransportState = `idle`;
/** 原 HPt（141574） */
const transportStateListeners = new Set<(state: string) => void>();
/** 原 UPt（141577） */
function subscribeTransportState(e: (state: string) => void) {
  return (
    transportStateListeners.add(e),
    () => {
      transportStateListeners.delete(e);
    }
  );
}
/** 原 WPt（141583） */
function getTerminalTransportState() {
  return terminalTransportState;
}
/** 原 GPt（141586） */
function useTerminalTransportState(e = terminalTransportState) {
  return React.useSyncExternalStore(subscribeTransportState, getTerminalTransportState, () => e);
}
/** 原 x6（141590） */
function isMobileChatHistoryState(e: unknown): boolean {
  return typeof e == `object` && !!e && (e as { zcodeMobilePage?: string }).zcodeMobilePage === `chat`;
}
/** 原 KPt（141594） */
function pushMobileChatHistoryState() {
  typeof window > `u` ||
    isMobileChatHistoryState(window.history.state) ||
    window.history.pushState({ zcodeMobilePage: `chat` }, ``);
}
/** 原 qPt（141598） */
function resolveInitialMobilePage(e: string | undefined): "chat" | "home" {
  return e === `chat` || (typeof window < `u` && isMobileChatHistoryState(window.history.state)) ? `chat` : `home`;
}

/* ============================================================================
 * 6. WebRemoteMobileShell（原 JPt，js 141601–141801 / jsx 117681–117765）
 * ==========================================================================*/

export function WebRemoteMobileShell({
  activeTaskId: e,
  activeWorkspaceIdentity: t,
  activeWorkspacePath: n,
  chatContent: r,
  chatOverlay: i,
  initialNavigationIntent: a,
  initialWorkspaceList: o,
  isSidePaneOpen: s = false,
  onCloseSidePane: c,
  onSelectTask: l,
  onStartDraftInWorkspace: u,
  renderChatHeader: d,
  sidePaneContent: f,
  switcher: p,
  webRemoteControlTerminalTransportState: m,
}: {
  activeTaskId: string | null;
  activeWorkspaceIdentity?: string | null;
  activeWorkspacePath: string;
  chatContent: React.ReactNode;
  chatOverlay?: React.ReactNode | null;
  initialNavigationIntent?: string;
  initialWorkspaceList?: MobileHomeResult;
  isSidePaneOpen?: boolean;
  onCloseSidePane?: () => void;
  onSelectTask?: (task: TaskMeta) => void;
  onStartDraftInWorkspace?: (workspacePath: string, workspaceIdentity?: string | null) => void;
  renderChatHeader: (args: { onBackHome: () => void }) => React.ReactNode;
  sidePaneContent?: React.ReactNode | null;
  switcher: WebRemoteSwitcherService;
  webRemoteControlTerminalTransportState?: string;
}) {
  const { intl: h } = useIntlContext();
  const [g, _] = React.useState<"chat" | "home">(() => resolveInitialMobilePage(a));
  const [v, y] = React.useState<MobileHomePreferences>(() => loadMobileHomePreferences());
  const [b, x] = React.useState(0);
  const [S, C] = React.useState(false);
  const w = useTerminalTransportState(m);
  const T = React.useRef<string | null>(null);
  const E = !!f && s;
  const D = React.useCallback(() => {
    _(`chat`), pushMobileChatHistoryState();
  }, []);
  const O = React.useCallback((e: MobileHomePreferences) => {
    saveMobileHomePreferences(e), logger.debug(`[WebRemoteControlMobileShell] 更新手机端任务首页偏好`, e), y(e);
  }, []);
  const k = React.useCallback(() => {
    if ((x((e) => e + 1), typeof window < `u` && isMobileChatHistoryState(window.history.state))) {
      window.history.back();
      return;
    }
    _(`home`);
  }, []);
  React.useEffect(() => {
    a === `chat` && D();
  }, [a, D]);
  React.useEffect(() => {
    if (typeof window > `u`) return;
    const e = (e: PopStateEvent) => {
      const t = isMobileChatHistoryState(e.state) ? `chat` : `home`;
      _(t), t === `home` && x((e) => e + 1);
    };
    return (
      window.addEventListener(`popstate`, e),
      () => {
        window.removeEventListener(`popstate`, e);
      }
    );
  }, []);
  React.useEffect(() => {
    if (!p.updateMobileViewState) return;
    const r = taskWorkspaceKey({ workspacePath: n, workspaceIdentity: t ?? null });
    const i = `${r}:${e ?? ``}`;
    T.current !== i &&
      ((T.current = i),
      p.updateMobileViewState(r, e ?? void 0).catch((t) => {
        const n = t instanceof Error ? t.message : String(t);
        logger.warn(`[WebRemoteControlMobileShell] 同步 mobileViewState 失败`, {
          error: n,
          workspaceKey: r,
          taskId: e ?? null,
        });
      }));
  }, [e, t, n, p]);
  return (
    <div className={`relative flex h-full min-h-0 flex-col bg-background`}>
      {g === `home` ? (
        <WebRemoteMobileTaskHome
          activeTaskId={e}
          activeWorkspaceIdentity={t}
          activeWorkspacePath={n}
          initialResult={o}
          onCrossWorkspaceSwitchingChange={C}
          onNavigateHome={k}
          onNavigateToChat={D}
          preferences={v}
          onPreferencesChange={O}
          refreshKey={b}
          onSelectTask={l}
          onStartDraftInWorkspace={u}
          switcher={p}
        />
      ) : (
        <section className={`flex h-full min-h-0 flex-col bg-background text-foreground`} data-mobile-page={`chat`}>
          <div className={`flex h-11 shrink-0 items-center gap-2 border-b border-border bg-header px-2`}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={h.formatMessage({ id: `webRemoteControl.mobileShell.backHome` })}
              onClick={k}
            >
              <IconArrowLeft className={`size-4`} />
            </Button>
            <span className={`min-w-0 flex-1 truncate text-ui-base font-medium`}>
              {h.formatMessage({ id: `webRemoteControl.mobileShell.chatTitle` })}
            </span>
            <MobileThemeMenu />
          </div>
          {d({ onBackHome: k })}
          <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden`}>
            <main
              className={`flex h-full min-h-0 flex-1 flex-col overflow-hidden`}
              aria-hidden={E ? true : void 0}
              data-mobile-chat-surface={E ? `inert` : void 0}
              inert={E ? true : void 0}
            >
              {r}
            </main>
            {f ? (
              <div
                className={[
                  `absolute inset-0 z-30 transition-opacity duration-200 ease-out`,
                  s ? `opacity-100` : `pointer-events-none opacity-0`,
                ].join(` `)}
                aria-hidden={!s}
                data-mobile-side-pane-overlay={`true`}
              >
                <button
                  type="button"
                  className={`absolute inset-0 bg-background/60 backdrop-blur-[1px]`}
                  aria-label={h.formatMessage({ id: `sidePane.collapse` })}
                  onClick={c}
                />
                <div
                  className={[
                    `absolute top-0 right-0 h-full w-[min(88vw,28rem)] max-w-full border-l border-border bg-background shadow-2xl transition-transform duration-200 ease-out`,
                    s ? `translate-x-0` : `translate-x-full`,
                  ].join(` `)}
                >
                  {f}
                </div>
              </div>
            ) : null}
            {i ? (
              <div className={`pointer-events-none absolute inset-0 z-40`} data-mobile-chat-overlay={`true`}>
                <div className={`pointer-events-auto`}>{i}</div>
              </div>
            ) : null}
          </div>
        </section>
      )}
      {S ? (
        <div
          className={`absolute inset-0 z-40 flex items-center justify-center bg-background/72 backdrop-blur-[1px]`}
          aria-live={`polite`}
          aria-busy={`true`}
        >
          <div className={`flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle shadow-sm`}>
            <IconLoader className={`size-4 animate-spin`} />
            {h.formatMessage({ id: `common.loading` })}
          </div>
        </div>
      ) : null}
      {w === `reconnecting` ? (
        <div
          className={`pointer-events-none absolute top-3 left-1/2 z-50 flex -translate-x-1/2 justify-center px-3`}
          aria-live={`polite`}
          aria-busy={`true`}
          data-web-remote-control-reconnect-notice={`true`}
        >
          <div className={`flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-lg border border-border bg-toast px-3 py-2 text-ui-base text-foreground shadow-lg`}>
            <IconLoader className={`size-4 shrink-0 animate-spin text-foreground-subtle`} />
            <span className={`min-w-0 whitespace-nowrap`}>
              {h.formatMessage({ id: `webRemoteControl.mobileShell.reconnecting` })}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================================
 * 7. rRt 状态显示助手（原 JLt…nRt，js 149473–149599；F11 尾段双归属，见头注二.1'）
 * ==========================================================================*/

/** 原 JLt（149473）：Bot Channel 供应商清单 */
const BOT_CHANNEL_PROVIDERS = [
  { provider: `weixin` },
  { provider: `feishu` },
  { provider: `lark` },
  { provider: `telegram` },
];
/** 原 YLt（149479）：状态已绑定到当前 workspace+remoteSession 目标 */
function statusMatchesWorkspaceTarget(
  e: WebRemoteControlStatusLike,
  t: string,
  n?: string | null,
  r?: string | null,
): boolean {
  if (e.status === `idle` || e.status === `error`) return false;
  const i = e.workspacePath?.trim();
  if (!i) return false;
  const a = taskWorkspaceKey({ workspacePath: t, workspaceIdentity: n ?? null });
  if (taskWorkspaceKey({ workspacePath: i, workspaceIdentity: e.workspaceIdentity ?? null }) !== a) return false;
  const o = r?.trim() || void 0;
  return (e.remoteSessionId?.trim() || void 0) === o ? !!(e.windowControlSessionId ?? e.sessionId) : false;
}
/** 原 XLt（149490）：状态为活且手机已连 */
function isStatusLiveMobileConnected(e: WebRemoteControlStatusLike): boolean {
  return e.status === `idle` || e.status === `error`
    ? false
    : !!(e.mobileConnected && (e.windowControlSessionId ?? e.sessionId));
}
/** 原 ZLt（149495）：状态标题 */
function resolveStatusTitle(e: WebRemoteControlStatusLike, t: IntlShape["formatMessage"]): string {
  switch (e.status) {
    case `starting`:
      return t({ id: `webRemoteControl.status.starting` });
    case `running`:
      return t({ id: `webRemoteControl.status.running` });
    case `connecting`:
      return t({ id: `webRemoteControl.status.connecting` });
    case `active`:
      return t({ id: `webRemoteControl.status.active` });
    case `error`:
      return t({ id: `webRemoteControl.status.error` });
    default:
      return t({ id: `webRemoteControl.status.idle` });
  }
}
/** 原 QLt（149511）：状态详情行 */
function resolveStatusDetail(e: WebRemoteControlStatusLike, t: IntlShape["formatMessage"]): string {
  switch (e.status) {
    case `starting`:
      return t({ id: `webRemoteControl.statusDetail.starting` });
    case `running`:
      return t({ id: `webRemoteControl.statusDetail.running` });
    case `connecting`:
      return t({ id: `webRemoteControl.statusDetail.connecting` });
    case `active`:
      return t({ id: `webRemoteControl.statusDetail.active` });
    case `error`:
      return t({ id: `webRemoteControl.statusDetail.error` });
    default:
      return t({ id: `webRemoteControl.statusDetail.idle` });
  }
}
/** 原 $Lt（149527）：状态点类名 */
function statusDotClass(e: WebRemoteControlStatusLike): string {
  return e.status === `error`
    ? `bg-destructive`
    : e.status === `active`
      ? `bg-success`
      : e.status === `idle`
        ? `bg-border`
        : `bg-warning`;
}
/** 原 eRt（149536）：状态标签（设备名优先） */
function resolveStatusTag(e: WebRemoteControlStatusLike, t: IntlShape["formatMessage"]): string {
  return (
    e.mobileDeviceInfo?.browserPlatform?.trim() ||
    e.mobileDeviceInfo?.name?.trim() ||
    (e.mobileConnected
      ? t({ id: `webRemoteControl.statusTag.phone` })
      : e.status === `idle`
        ? t({ id: `webRemoteControl.status.idle` })
        : e.status === `error`
          ? t({ id: `webRemoteControl.status.error` })
          : t({ id: `webRemoteControl.statusTag.ready` }))
  );
}
/** 原 tRt（149549）：两状态等价（轮询去重，17 字段逐比） */
function isSameWebRemoteStatus(e: WebRemoteControlStatusLike, t: WebRemoteControlStatusLike): boolean {
  return (
    e.status === t.status &&
    e.sessionId === t.sessionId &&
    e.windowControlSessionId === t.windowControlSessionId &&
    e.deviceToken === t.deviceToken &&
    e.expiresAt === t.expiresAt &&
    e.mobileConnected === t.mobileConnected &&
    e.mobileDeviceInfo?.updatedAt === t.mobileDeviceInfo?.updatedAt &&
    e.mobileDeviceInfo?.userAgent === t.mobileDeviceInfo?.userAgent &&
    e.mobileDeviceInfo?.viewport?.width === t.mobileDeviceInfo?.viewport?.width &&
    e.mobileDeviceInfo?.viewport?.height === t.mobileDeviceInfo?.viewport?.height &&
    e.qrUrl === t.qrUrl &&
    e.connectUrl === t.connectUrl &&
    e.workspacePath === t.workspacePath &&
    e.workspaceIdentity === t.workspaceIdentity &&
    e.remoteSessionId === t.remoteSessionId &&
    e.error === t.error &&
    e.failure?.reason === t.failure?.reason &&
    e.failure?.message === t.failure?.message
  );
}
/** 原 nRt（149571）：failure.reason → 用户文案 */
function resolveFailureMessage(
  e: { reason?: string; message?: string } | null | undefined,
  t: IntlShape["formatMessage"],
): string | null {
  if (!e) return null;
  switch (e.reason) {
    case `session-not-found`:
      return t({ id: `webRemoteControl.failure.sessionNotFound` });
    case `session-expired`:
      return t({ id: `webRemoteControl.failure.sessionExpired` });
    case `session-conflict`:
      return e.message?.toLowerCase().includes(`kicked`)
        ? t({ id: `webRemoteControl.failure.kicked` })
        : t({ id: `webRemoteControl.failure.sessionConflict` });
    case `workspace-closed`:
      return t({ id: `webRemoteControl.failure.workspaceClosed` });
    case `desktop-disconnected`:
      return t({ id: `webRemoteControl.failure.desktopDisconnected` });
    case `invalid-mobile-connection`:
      return t({ id: `webRemoteControl.failure.invalidMobileConnection` });
    case `desktop-bootstrap-timeout`:
      return t({ id: `webRemoteControl.failure.desktopBootstrapTimeout` });
    case `connection-recovery-timeout`:
      return t({ id: `webRemoteControl.failure.connectionRecoveryTimeout` });
    case `relay-unavailable`:
      return t({ id: `webRemoteControl.failure.relayUnavailable` });
    case `unsupported-action`:
      return t({ id: `webRemoteControl.failure.unsupportedAction` });
    case `unexpected-error`:
      return t({ id: `webRemoteControl.failure.unexpectedError` });
  }
  return null;
}

/* ============================================================================
 * 8. WebRemoteControlDialog（原 rRt，js 149600–150145 / jsx 124107–124375）
 * ==========================================================================*/

export const WebRemoteControlDialog = React.memo(function WebRemoteControlDialog({
  open: e,
  onOpenChange: t,
  workspacePath: n,
  workspaceIdentity: r,
  remoteSessionId: i,
  initialTaskId: a,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  initialTaskId?: string | null;
}) {
  const o = usePlatformService();
  const s = useConfirmDialog();
  const { intl: c } = useIntlContext();
  const [u, d] = React.useState<WebRemoteControlStatusLike>({ status: `idle` });
  const [f, p] = React.useState(false);
  const [h, _] = React.useState<string | null>(null);
  const [v, y] = React.useState(false);
  const [b, x] = React.useState<string | null>(null);
  const S = React.useMemo(() => resolveStatusTitle(u, c.formatMessage), [c.formatMessage, u]);
  const C = React.useMemo(() => resolveStatusDetail(u, c.formatMessage), [c.formatMessage, u]);
  const w = React.useMemo(() => resolveFailureMessage(u.failure, c.formatMessage), [c.formatMessage, u.failure]);
  const T = React.useMemo(() => resolveStatusTag(u, c.formatMessage), [c.formatMessage, u]);
  const E = statusDotClass(u);
  React.useEffect(() => {
    if (!e) return;
    let t = false;
    return (
      (async () => {
        p(true);
        try {
          const e = await o.getWebRemoteControlStatus!();
          const s =
            statusMatchesWorkspaceTarget(e, n, r, i) || isStatusLiveMobileConnected(e)
              ? e
              : await o.startWebRemoteControl!({
                  workspacePath: n,
                  workspaceIdentity: r,
                  remoteSessionId: i,
                  initialTaskId: a,
                });
          t ||
            (d(s),
            logger.info(`[WebRemoteControlDialog] Web 远程控制状态已同步`, {
              workspacePath: n,
              workspaceIdentity: r ?? `none`,
              remoteSessionId: i ?? `none`,
              initialTaskId: a ?? `none`,
              status: s.status,
              sessionId: s.sessionId ?? `none`,
            }));
        } catch (e) {
          const o = e instanceof Error ? e.message : String(e);
          t ||
            (d({ status: `error`, workspacePath: n, remoteSessionId: i, error: o }),
            toast(c.formatMessage({ id: `webRemoteControl.startFailed` }, { error: o }))),
            logger.error(`[WebRemoteControlDialog] 启动 Web 远程控制失败`, {
              workspacePath: n,
              workspaceIdentity: r ?? `none`,
              remoteSessionId: i ?? `none`,
              initialTaskId: a ?? `none`,
              error: o,
            });
        } finally {
          t || p(false);
        }
      })(),
      () => {
        t = true;
      }
    );
  }, [c, e, o, i, r, n, a]);
  React.useEffect(() => {
    if (!e) return;
    let t = false;
    const a = async () => {
      try {
        const e = await o.getWebRemoteControlStatus!();
        if (t || !(statusMatchesWorkspaceTarget(e, n, r, i) || isStatusLiveMobileConnected(e) || e.status === `idle` || e.status === `error`))
          return;
        d((t) => (isSameWebRemoteStatus(t, e) ? t : e));
      } catch {}
    };
    const s = window.setInterval(() => {
      a();
    }, 1e3);
    return () => {
      ((t = true), window.clearInterval(s));
    };
  }, [e, o, i, r, n]);
  React.useEffect(() => {
    if (!u.qrUrl) {
      _(null);
      return;
    }
    let e = false;
    return (
      _(null),
      Qq.toDataURL(u.qrUrl, { margin: 1, width: 320 })
        .then((t) => {
          e || _(t);
        })
        .catch((e) => {
          const t = e instanceof Error ? e.message : String(e);
          logger.error(`[WebRemoteControlDialog] 生成二维码失败`, t);
        }),
      () => {
        e = true;
      }
    );
  }, [u.qrUrl]);
  const D = async () => {
    if (u.connectUrl)
      try {
        await navigator.clipboard.writeText(u.connectUrl),
          toast(c.formatMessage({ id: `webRemoteControl.copyLink.copied` })),
          logger.info(`[WebRemoteControlDialog] 已复制 Web 远程控制链接`, {
            workspacePath: n,
            remoteSessionId: i ?? `none`,
            sessionId: u.sessionId ?? `none`,
          });
      } catch (e) {
        const t = e instanceof Error ? e.message : String(e);
        toast(c.formatMessage({ id: `webRemoteControl.copyLinkFailed` }, { error: t })),
          logger.error(`[WebRemoteControlDialog] 复制 Web 远程控制链接失败`, t);
      }
  };
  const O = async () => {
    if (
      await s({
        title: c.formatMessage({ id: `webRemoteControl.refreshQr.confirmTitle` }),
        description: c.formatMessage({ id: `webRemoteControl.refreshQr.confirmDescription` }),
        confirmLabel: c.formatMessage({ id: `webRemoteControl.refreshQr` }),
      })
    ) {
      p(true);
      try {
        const e = await o.refreshWebRemoteControlPairing!({
          workspacePath: n,
          workspaceIdentity: r,
          remoteSessionId: i,
          initialTaskId: a,
        });
        d(e),
          toast(c.formatMessage({ id: `webRemoteControl.refreshQr.success` })),
          logger.info(`[WebRemoteControlDialog] 已刷新 Web 远程控制二维码`, {
            workspacePath: n,
            workspaceIdentity: r ?? `none`,
            remoteSessionId: i ?? `none`,
            initialTaskId: a ?? `none`,
            sessionId: e.sessionId ?? `none`,
          });
      } catch (e) {
        const t = e instanceof Error ? e.message : String(e);
        toast(c.formatMessage({ id: `webRemoteControl.refreshQr.failed` }, { error: t })),
          logger.error(`[WebRemoteControlDialog] 刷新 Web 远程控制二维码失败`, {
            workspacePath: n,
            workspaceIdentity: r ?? `none`,
            remoteSessionId: i ?? `none`,
            initialTaskId: a ?? `none`,
            error: t,
          });
      } finally {
        p(false);
      }
    }
  };
  const k = async () => {
    p(true);
    try {
      await o.stopWebRemoteControl!(),
        d({ status: `idle` }),
        t(false),
        toast(c.formatMessage({ id: `webRemoteControl.stopSuccess` })),
        logger.info(`[WebRemoteControlDialog] 已关闭 Web 远程控制`, {
          workspacePath: n,
          remoteSessionId: i ?? `none`,
        });
    } catch (e) {
      const t = e instanceof Error ? e.message : String(e);
      toast(c.formatMessage({ id: `webRemoteControl.stopFailed` }, { error: t })),
        logger.error(`[WebRemoteControlDialog] 关闭 Web 远程控制失败`, t);
    } finally {
      p(false);
    }
  };
  const A = (e: boolean) => {
    logger.info(`[WebRemoteControlDialog] 弹层开关状态变化`, {
      workspacePath: n,
      remoteSessionId: i ?? `none`,
      nextOpen: e,
    }),
      t(e);
  };
  const j = () => {
    logger.info(`[WebRemoteControlDialog] 用户点击右上角关闭按钮`, {
      workspacePath: n,
      remoteSessionId: i ?? `none`,
      sessionId: u.sessionId ?? `none`,
      status: u.status,
    }),
      A(false);
  };
  const N = (e: string) => {
    x(e),
      y(true),
      logger.info(`[WebRemoteControlDialog] 打开 Bot Channel 配置入口`, {
        workspacePath: n,
        workspaceIdentity: r ?? `none`,
        provider: e,
      });
  };
  return (
    <>
      <Dialog open={e} onOpenChange={A}>
        <DialogContent
          showCloseButton={false}
          className={`max-h-[calc(100vh-6rem)] max-w-4xl gap-0 overflow-hidden rounded-2xl p-0`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={`absolute top-2 right-2 enabled:cursor-pointer [app-region:no-drag]`}
            onClick={j}
          >
            <IconX className={`size-4`} />
            <span className={`sr-only`}>{`Close`}</span>
          </Button>
          <div
            data-testid={`web-remote-control-dialog-scroll`}
            className={`max-h-[calc(100vh-6rem)] min-h-0 overflow-y-auto p-5`}
          >
            <DialogHeader className={`space-y-2 pr-8`}>
              <div className={`flex items-center gap-2`}>
                <div className={`flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-primary`}>
                  <IconMonitorSmartphone className={`size-5`} />
                </div>
                <div className={`space-y-1`}>
                  <DialogTitle>{c.formatMessage({ id: `webRemoteControl.title` })}</DialogTitle>
                  <DialogDescription>{c.formatMessage({ id: `webRemoteControl.description` })}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div
              data-testid={`web-remote-control-main-grid`}
              className={`mt-5 grid gap-4 md:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]`}
            >
              <section
                data-testid={`web-remote-control-scan-card`}
                className={`flex min-h-[360px] flex-col rounded-xl border border-border bg-card p-4`}
              >
                <div className={`mb-4 flex items-start gap-2`}>
                  <IconSmartphone className={`mt-0.5 size-4 shrink-0 text-foreground-subtle`} />
                  <div className={`min-w-0 space-y-1`}>
                    <div className={`text-ui-base font-medium text-foreground`}>
                      {c.formatMessage({ id: `webRemoteControl.mobileQr.title` })}
                    </div>
                    <p className={`text-ui-base/relaxed text-foreground-subtle`}>
                      {c.formatMessage({ id: `webRemoteControl.mobileQr.description` })}
                    </p>
                  </div>
                </div>
                <div data-testid={`web-remote-control-connection-card`} className={`mb-3 rounded-lg bg-surface px-3 py-2`}>
                  <div className={`flex flex-wrap items-center justify-between gap-3`}>
                    <div className={`min-w-0 flex-1 space-y-1`}>
                      <div className={`flex min-w-0 items-center gap-2`}>
                        <div className={`text-ui-base font-medium text-foreground`}>{S}</div>
                        <div className={`flex min-w-0 items-center gap-1.5 rounded-full bg-card px-2 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                          <span className={`size-1.5 shrink-0 rounded-full ${E}`} />
                          <span className={`truncate`}>{T}</span>
                        </div>
                      </div>
                      <div className={`text-ui-base/relaxed text-foreground-subtle`}>{C}</div>
                    </div>
                    {f ? (
                      <IconLoaderCircle className={`size-4 animate-spin text-foreground-subtle`} />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="default"
                        className={`shrink-0 gap-2 enabled:cursor-pointer`}
                        onClick={() => void k()}
                        disabled={u.status === `idle`}
                      >
                        <IconUnplug className={`size-3.5`} />
                        {c.formatMessage({ id: `webRemoteControl.stop` })}
                      </Button>
                    )}
                  </div>
                  {w ? (
                    <div className={`mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-ui-base/relaxed text-destructive`}>
                      <p>{w}</p>
                      {u.failure?.message && u.failure.message !== w ? (
                        <p className={`mt-1 text-ui-xs/relaxed opacity-80`}>{u.failure.message}</p>
                      ) : null}
                    </div>
                  ) : u.error ? (
                    <p className={`mt-3 text-ui-base/relaxed text-destructive`}>{u.error}</p>
                  ) : null}
                  <div
                    data-testid={`web-remote-control-copy-link-row`}
                    className={`mt-3 flex min-h-10 flex-wrap items-center gap-3 border-t border-border pt-3`}
                  >
                    <div className={`min-w-48 flex-1 text-ui-base/relaxed text-foreground-subtle`}>
                      {c.formatMessage({ id: `webRemoteControl.copyLink.description` })}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      className={`shrink-0 gap-2 enabled:cursor-pointer`}
                      onClick={() => void O()}
                      disabled={f}
                    >
                      <IconRefreshCw className={`size-3.5`} />
                      {c.formatMessage({ id: `webRemoteControl.refreshQr` })}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      className={`shrink-0 gap-2 enabled:cursor-pointer`}
                      onClick={() => void D()}
                      disabled={!u.connectUrl || f}
                    >
                      <IconCopy className={`size-3.5`} />
                      {c.formatMessage({ id: `webRemoteControl.copyLink` })}
                    </Button>
                  </div>
                </div>
                <div className={`flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-background-alt p-4`}>
                  {h ? (
                    <img
                      src={h}
                      alt={c.formatMessage({ id: `webRemoteControl.qrAlt` })}
                      className={`size-64 max-w-full rounded-lg bg-white p-3`}
                    />
                  ) : (
                    <div className={`flex flex-col items-center gap-3 text-center text-ui-base text-foreground-subtle`}>
                      <IconLoaderCircle className={`size-5 animate-spin`} />
                      <span>{c.formatMessage({ id: `webRemoteControl.generating` })}</span>
                    </div>
                  )}
                </div>
              </section>
              <section className={`flex min-h-[360px] flex-col rounded-xl border border-border bg-card p-4`}>
                <div className={`mb-4 flex items-start gap-2`}>
                  <IconBot className={`mt-0.5 size-4 shrink-0 text-foreground-subtle`} />
                  <div className={`min-w-0 space-y-1`}>
                    <div className={`text-ui-base font-medium text-foreground`}>
                      {c.formatMessage({ id: `webRemoteControl.botChannel.title` })}
                    </div>
                    <p className={`text-ui-base/relaxed text-foreground-subtle`}>
                      {c.formatMessage({ id: `webRemoteControl.botChannel.description` })}
                    </p>
                  </div>
                </div>
                <div className={`grid min-h-0 flex-1 gap-3`}>
                  {BOT_CHANNEL_PROVIDERS.map((e) => {
                    const t = resolveBotProviderRegionTagId(e.provider);
                    return (
                      <button
                        key={e.provider}
                        type="button"
                        className={`flex min-h-0 cursor-pointer items-start gap-3 rounded-lg border border-transparent bg-surface px-3 py-3 text-left transition-colors hover:border-input-border-focused hover:bg-surface-hover focus-visible:border-input-border-focused`}
                        onClick={() => N(e.provider)}
                      >
                        <BotProviderAvatar provider={e.provider} className={`size-12 shrink-0`} />
                        <span className={`min-w-0 flex-1 space-y-1`}>
                          <span className={`flex min-w-0 items-center gap-1.5 text-ui-base font-medium text-foreground`}>
                            <span className={`min-w-0 truncate`}>
                              {c.formatMessage({ id: `webRemoteControl.botChannel.${e.provider}.title` })}
                            </span>
                            {t ? (
                              <span className={`inline-flex h-5 shrink-0 items-center rounded-full border border-border px-2 text-ui-xs font-medium leading-none text-foreground-subtle`}>
                                {c.formatMessage({ id: t })}
                              </span>
                            ) : null}
                          </span>
                          <span className={`block text-ui-base/relaxed text-foreground-subtle`}>
                            {c.formatMessage({ id: `webRemoteControl.botChannel.${e.provider}.description` })}
                          </span>
                          <span className={`block text-ui-base font-medium text-primary`}>
                            {c.formatMessage({ id: `webRemoteControl.botChannel.configure` })}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className={`mt-3`}>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    data-testid={`web-remote-control-open-bots`}
                    className={`w-full justify-center gap-2 enabled:cursor-pointer`}
                    onClick={() => {
                      x(null),
                        y(true),
                        logger.info(`[WebRemoteControlDialog] 打开 Bots 总配置入口`, {
                          workspacePath: n,
                          workspaceIdentity: r ?? `none`,
                        });
                    }}
                  >
                    <IconBot className={`size-3.5`} />
                    {c.formatMessage({ id: `webRemoteControl.botChannel.manageBots` })}
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <BotsConfigDialog
        open={v}
        onOpenChange={y}
        workspacePath={n}
        workspaceIdentity={r}
        entryProvider={b}
      />
    </>
  );
});

/* ============================================================================
 * 9. 特性门（原 iRt/aRt/oRt/y8，js 150146–150153 / jsx 124376–124387）
 *    D5b 注：iRt 原始值 !0，D5b 于原 150100 行改写为 !1（默认关闭），按现状逐字。
 * ==========================================================================*/

/** 原 iRt（150147；D5b 改写 !0→!1） */
const WEB_REMOTE_CONTROL_ENABLED_DEFAULT = false;
/** 原 aRt（150148） */
const WebRemoteControlEnabledContext = React.createContext(WEB_REMOTE_CONTROL_ENABLED_DEFAULT);
/** 原 oRt（150149） */
export function WebRemoteControlEnabledProvider({
  enabled: e = WEB_REMOTE_CONTROL_ENABLED_DEFAULT,
  children: t,
}: {
  enabled?: boolean;
  children: React.ReactNode;
}) {
  return <WebRemoteControlEnabledContext.Provider value={e}>{t}</WebRemoteControlEnabledContext.Provider>;
}
/** 原 y8（150152）；Sidebar.tsx 4876 接口级同名登记，整合期指向本实现 */
export function useWebRemoteControlEnabled(): boolean {
  return React.useContext(WebRemoteControlEnabledContext);
}
/** 原 HFt（styles 144761）：远控状态等值谓词（G6 轮询去重；十四字段比较集逐字） */
function webRemoteControlStatusEqual(e: WebRemoteControlStatusLike, t: WebRemoteControlStatusLike): boolean {
  return (
    e.status === t.status &&
    e.sessionId === t.sessionId &&
    e.windowControlSessionId === t.windowControlSessionId &&
    e.mobileConnected === t.mobileConnected &&
    e.mobileViewState?.activeWorkspaceKey === t.mobileViewState?.activeWorkspaceKey &&
    e.mobileViewState?.activeTaskId === t.mobileViewState?.activeTaskId &&
    e.mobileViewState?.updatedAt === t.mobileViewState?.updatedAt &&
    e.mobileDeviceInfo?.updatedAt === t.mobileDeviceInfo?.updatedAt &&
    e.mobileDeviceInfo?.userAgent === t.mobileDeviceInfo?.userAgent &&
    e.mobileDeviceInfo?.viewport?.width === t.mobileDeviceInfo?.viewport?.width &&
    e.mobileDeviceInfo?.viewport?.height === t.mobileDeviceInfo?.viewport?.height &&
    e.error === t.error &&
    e.failure?.reason === t.failure?.reason &&
    e.failure?.message === t.failure?.message
  );
}
/** 原 G6（styles 144779，旧注 144737 行漂）：Web 远控状态轮询钩子（订阅 + 间隔双源；束内 debug 串自名 useWebRemoteControlStatus）。
 *  〔A1-R129l〕实体化：束位在 Sidebar 模块域（邻 UFt/K6/q6 侧栏偏好族），按远控域属主落本文件；
 *  消费面 = components/shell/Sidebar 两 declare（同钩子异面，碑文见其原声明位）。 */
export function useWebRemoteControlStatus({ enabled: e = !0, intervalMs: t = 1e3 } = {}): WebRemoteControlStatusLike {
  let n = usePlatformService(),
    [r, i] = React.useState({ status: `idle` });
  return (
    React.useEffect(() => {
      if (!e || !n) {
        i({ status: `idle` });
        return;
      }
      let r = !1,
        a = (e: WebRemoteControlStatusLike) => {
          r || i((t) => (webRemoteControlStatusEqual(t, e) ? t : e));
        },
        o = async () => {
          try {
            a(await n.getWebRemoteControlStatus!());
          } catch (e) {
            let t = e instanceof Error ? e.message : String(e);
            logger.debug(`[useWebRemoteControlStatus] 同步 Web 远程控制状态失败`, { error: t });
          }
        };
      o();
      let s = n.onWebRemoteControlStatusChanged?.((e) => {
          a(e);
        }),
        c = window.setInterval(() => {
          o();
        }, t);
      return () => {
        ((r = !0), s?.(), window.clearInterval(c));
      };
    }, [e, t, n]),
    r
  );
}

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → 当前 js 行 / jsx 行；本文件覆盖段）
 * ============================================================================
 *  OPt 140585/117214 | kPt 140586/117215 | v6 140587/117216 | APt 140588/117223
 *  jPt 140596/117231 | MPt 140604/117236 | NPt 140614/117246 | PPt 140619/117251
 *  FPt 140648/117283 | y6 140658/117286 | IPt 140670/117298
 *  LPt 140673/117301 | RPt 140674/117302 | b6 140716/117323 | zPt 140725/117328
 *  BPt 140726–141572/117329–117657
 *  VPt 141573/117657 | HPt 141574/117658 | UPt 141577/117659 | WPt 141583/117664
 *  GPt 141586/117667 | x6 141590/117670 | KPt 141594/117673 | qPt 141598/117678
 *  JPt 141601–141801/117681–117765
 *  JLt 149473/123956 | YLt 149479/123965 | XLt 149490/123980 | ZLt 149495/123983
 *  QLt 149511/124011 | $Lt 149527/124039 | eRt 149536/124042 | tRt 149549/124053
 *  nRt 149571/124056
 *  rRt 149600–150145/124107–124375
 *  iRt 150147/124378（D5b !1）| aRt 150148/124379 | oRt 150149/124380 | y8 150152/124386
 *  HFt 144761 → webRemoteControlStatusEqual | G6 144779 → useWebRemoteControlStatus（〔A1-R129l〕实体化；束位属 Sidebar 模块域，按远控域属主落户）
 *  —— 边界注记（不抽取）：141802–142388 TopBar 族 | sRt/cRt/lRt/uRt…xRt Sidebar 族
 *     | CLt/qLt/_8 F11 族（CLt 含 login.oauth 残留键）
 * ============================================================================
 */
