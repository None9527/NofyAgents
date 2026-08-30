// A0-S4-4c: 自 modules/Sidebar.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/shell/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * Sidebar.tsx — ZCode 3.7.6 侧栏 + 任务列表 组件族（解混淆重建 · D8 Stage B / F01）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，规格行号以它为准）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 地图：MODULE-MAP.md F01 · SidebarFamily（js 142372–142753 + 144153–160322）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  侧栏骨架：
 *   rVt  → WorkspaceSidebar          侧栏根（aside h-full flex-col：h-12 drag 条 + 导航 4 行
 *                                     + 滚动列表 + 页脚 + 文件树滑层）(159137 / 132075)
 *   (rVt 内联 Vn) → SidebarOrganizeHeader 分段行（分组|项目 pill + 视图选项 + 归档开关，
 *                                     在滚动容器内部）(159620 / 132412)
 *   nVt  → resolveTaskViewMode       一级视图解析 archived/timeline/grouped/workspace (159128 / 132072)
 *   QBt  → DisabledReasonWrapper     目录不可用 tooltip 包裹 (159109 / 132053)
 *   lBt  → StickyHeaderSlot          吸顶头插槽（150ms 淡出）(156222 / 128901)
 *   cBt  → STICKY_HEADER_EXIT_DELAY_MS = 150 (156221 / 128900)
 *   GBt  → PurposeSection            项目/会话分段壳（折叠 + 拖拽重排 + 动作区）(158981 / 131948)
 *   WBt/UBt → resolveExpandToggleState / expandToggleMessageId (158970/158967 / 131941/131938)
 *   tVt  → WorkspaceTabDragOverlay   项目行拖拽浮层 (159114 / 132061)
 *   ZBt  → resolveWorkspaceTabReorder (159100 / 132041)
 *   YBt/KBt/qBt/JBt → 项目列表拖拽位移助手 (159081/159062–159080 / 132008/131993–132007)
 *   XBt  → isWorkspaceExpandedDuringDrag (159097 / 132035)
 *   VBt  → restrictDragToVerticalAxis 拖拽修饰器（锁 x=0、钳制 y）(158883 / 131861)
 *   $Bt/eVt → EMPTY_TASK_ITEMS / EMPTY_REMOTE_LOGS (159112 / 132057)
 *
 *  导航与任务行：
 *   EFt  → NewTaskRow                新建任务行（Ctrl+N）(144153 / 120034)
 *   E8   → TaskRow                   任务行（未读点/状态点/置顶/归档确认/拖拽/徽章/相对时间）
 *                                     (151186 / 125140)；memo 比较器 LRt (151162 / 125125)
 *   b8   → TaskInteractionBadge      待交互徽章（用户输入/权限 + 倒计时）(150807 / 124916)
 *   wRt/TRt → isSnoozableUserInputInteraction / resolveInteractionBadgeModel (150788/150793 / 124887/124892)
 *   ERt  → useSnoozeInteractionCountdown (150926 / 124970)
 *   D8   → TaskRowContextMenuContent 任务右键菜单内容 (151618 / 125352)
 *   CRt  → TaskActionContextMenuContent 右键菜单壳 (150732 / 124828)
 *   dzt  → GroupedTaskContextMenuContent 分组任务右键菜单 (153462 / 126985)
 *   M8   → TaskRowActionButton       行内图标按钮（CSS tooltip）(153598 / 127060)
 *   fzt  → formatChangeStatParts     (153631 / 127078)
 *   pzt/mzt → GroupedTaskRow         分组任务行（拖拽 + 悬停动作）(153636/154014 / 127081/127331)
 *   gzt/N8 → GroupedTaskRowSlot      (154042/154092 / 127354/127401)
 *   hzt  → GroupEmptyDropZone        空组投放区 (154015 / 127332)
 *   _zt  → NewThreadRow              新线程草稿行 (154093 / 127402)
 *   wzt  → GroupTaskVirtualList      组内虚拟列表（>80 启用）(154202 / 127466)
 *   Tzt  → GroupSection              分组节点（色点/重命名/折叠/计数/右键）(154327 / 127546)
 *   Ezt  → GroupNodeDragOverlayCard  (154899 / 127898)
 *   Izt  → CollapsedGroupStickyHeader (155026 / 128002)
 *   Fzt  → GroupedNodeVirtualList    (154948 / 127941)
 *   sBt  → GroupedTasksSection       分组视图总控（dnd-kit）(155455 / 128357)
 *   BRt  → PinnedTasksSection        置顶任务段 (151757 / 125480)
 *   HRt  → TimelineTasksSection      时间线任务段（日期分组 + 分页）(152247 / 125894)
 *   zRt  → SectionTitle (151751 / 125475)；RRt/VRt → taskRowKey (151748/152244)
 *   m8/h8 → RemoteSyncingRow / TaskListLoadingRow (146803/146813 / 122299/122307)
 *   w8   → OverflowMarqueeText       溢出跑马灯文本 (150996 / 125026)
 *   C8/DRt/S8/NRt/ORt/kRt/x8/ARt/jRt/MRt → 跑马灯常量/助手 (150984–150993 / 125010–125025)
 *   PRt  → createDragImageUpdater    (151118 / 125117) 〔A1-R4 改指 → SplitLayoutUiDeep createSessionDragPreview〕
 *
 *  分组域（色板 / 视图操作 / 持久化）：
 *   $6   → GROUP_COLORS [gray red orange yellow green blue purple] (144872 / 120648)
 *   $Ft/eIt → GROUP_COLOR_SURFACE_CLASSES / GROUP_COLOR_BORDER_CLASSES (144873/144881 / 120649/120658)
 *   tIt/nIt/rIt/iIt/aIt/oIt → 分组行类名常量 (144890–144896 / 120667–120672)
 *   e8/t8 → GroupColorDot / GroupColorSwatch (144897/144903 / 120673/120679)
 *   n8   → groupedTaskKey (144906 / 120686)
 *   sIt/r8/i8/a8/o8/cIt/s8/lIt/uIt/dIt/fIt/pIt/mIt/c8/hIt/l8/gIt/_It/vIt/yIt/u8/d8/bIt/xIt/SIt/CIt/wIt/TIt
 *        → 分组视图不可变操作族 (144909–145136 / 120688–121000)
 *   Gne/ane → DEFAULT_GROUP_ID_CRON/OFF_PEAK（src chunk tt/nt，8724/8725）
 *   P8   → resolveGroupTitle (154158 / 127422)
 *   EIt/DIt/OIt/kIt/AIt → 折叠组持久化 zcode-grouped-task-collapsed-groups (145137–145166 / 121001–121020)
 *   uzt  → useGroupedTaskView（数据装载，接口级）(153205 / 126735)
 *   qRt/QRt/$Rt/ezt/tzt/nzt → 分组视图构建/乐观叠加/状态 (152903–153126 / 126428–126668)
 *   Kzt/qzt/Jzt/Yzt/Xzt/Zzt/$zt/I8/L8/R8/Vzt/Hzt/Uzt/Wzt/Gzt/Lzt/Rzt/F8/zzt/Bzt
 *        → 分组拖拽碰撞/载荷解析助手 (155202–155454 / 128079–128356)
 *   nBt/rBt/iBt/aBt/oBt → FLIP 布局动画助手 (155363–155414 / 128321–128355)
 *
 *  偏好 / 分段 / 数据层：
 *   UFt/K6/q6/KFt/WFt/GFt → 侧栏任务偏好 zcode-sidebar-task-preferences (144772–144802 / 120543–120570)
 *   J6/qFt/Y6/JFt/X6/Z6/YFt/XFt/Q6 → 分段偏好 zcode-sidebar-purpose-section-preferences
 *                                     (144803–144862 / 120576–120635)
 *   ZFt/QFt → 按用途拆分工作区标签 (144863/144866 / 120636/120638)
 *   PFt/FFt/IFt/LFt → 展开键集合 / 可见数限制 (144342–144362 / 120153–120163)
 *   W6   → workspaceExpansionFlags (144363 / 120164)
 *   VFt  → useWorkspaceTaskGroups（项目视图数据，接口级）(144427 / 120229)
 *   DFt/OFt/kFt/AFt/jFt/MFt/NFt → 乐观叠加合并助手 (144184–144341 / 120050–120152)
 *   E6   → useRemotePinnedTaskListStore (142372 / 118266)
 *   k6   → useRemoteWorkspaceTaskListStore (142464 / 118392)
 *   T6/O6/sFt/cFt/D6/A6 → store 键/排序/刷新助手 (142360–142580 / 118255–118480)
 *
 *  页脚：
 *   SRt  → SidebarFooter             头像 + 用户名/plan 徽章 + 菜单（语言/主题/缩放/用量/登录）
 *                                     (150435 / 124677)
 *   yRt/bRt/xRt → 用户名/显示名/首字母 (150426/150429/150432 / 124670–124676)
 *   mRt  → useSidebarUsageState（接口级）(150255 / 124527)
 *   hRt  → UsageMenuItems (150373 / 124636)；gRt → UsagePlanBadge (150410 / 124662)
 *   uRt/dRt/fRt/pRt → 用量视图模型助手/常量 (150230–150254 / 124505–124526)
 *   cRt/lRt → WebRemoteControlTrigger (150140/150159 / 124420/124436)
 *   sRt  → resolveRemoteControlStatusDisplay (150109 / 124391)
 *   y8   → useWebRemoteControlEnabled (150106 / 124386)
 *   _Rt/vRt → ZOOM_LEVEL_MIN=-3 / ZOOM_LEVEL_MAX=5 (150424 / 124668)
 *   hLt/gLt/_Lt → Avatar 原语（数值上在 F04 段内，页脚复用）(147698–147725 / 122830–122848)
 *
 *  工作区行：
 *   BBt  → WorkspaceSidebarItem      工作区行（折叠/光束动画/更多菜单/重连/文件树/新线程）
 *                                     (158149 / 131453)
 *   HBt  → SortableWorkspaceSidebarItem (158893 / 131883)
 *   MBt  → WorkspaceTaskList         工作区内任务列表（重命名/置顶/归档/未读接线）(157550 块内 / 131192)
 *   ABt  → BeamBorderAnimation       工作区光束描边动画（接口级）(157550 / 131107)
 *   TBt/EBt/DBt/OBt/kBt/wBt → 光束 CSS 生成器（接口级）(156793–157547 / 130373–131106)
 *   V8/uBt/B8 → 工作区 logo 色板/光束参数（数据，接口级）(156306/128919 / 128990/128919)
 *   FBt  → RemoteConnectionLogsPopover (158029 / 131404)
 *   IBt  → EMPTY_PINNED_TASKS (158132 / 131438)；LBt → isUserHomeDirectory (158133 / 131439)
 *   zBt  → resolveSshConnectionInfo (158140 / 131446)；R2 → workspaceTabKey (104991 / 88177)
 *
 *  横切助手（本 chunk 内、族外）：
 *   Io workspaceKey (jsx 408) | Lo taskEntityKey (jsx 411) | Fo compareTasksForList (jsx 405)
 *   Mo taskSessionActivity (jsx 369) | No taskPendingAttention (jsx 376) | Po mergeTaskWithActivity (jsx 385)
 *   QS resolveTaskIndicator (jsx 33105) | $S formatRelativeTime (jsx 33108)
 *   vg taskChangeSummary (jsx 20317) | Vhe titleWithChangeStats (jsx 20328) | Go workspaceBaseName (jsx 986)
 *   pPt/dPt/uPt/fPt 时间线日期分组 (116989–117060 / 99930–99990)
 *   sc 本地目录可用性选择器 (3324) | mc useOptionalTabStore (jsx 3606) | pc useTabStore (jsx 3601)
 *   ko useSettingsStore (jsx 351) | Zs useSessionRegistryStore | A2 useSessionRouterStore (jsx 104365)
 *   b2 sessionIndexKey (jsx 103978) | LTt useSessionOpenability (jsx 104823)
 *   u2/Iwt/Lwt/Rwt 会话拖拽 MIME/载荷 (jsx 103642–103650) | Wwt/Gwt/Kwt 拖拽位置跟踪 (jsx 103709–103717)
 *   J3 useScopedWorkspaceTabs (jsx 113936) | yc buildWorkspaceServicesMap (jsx 3637)
 *   ZS useTaskListItems (35727 / 32810) | Tse resolveRemoteSessionServices (jsx 3269)
 *   EN SpinnerIcon (54789) | aw markUsageEntryIntent (jsx 35396)
 *   M6/N6/V6 同步后刷新 (142670–142719/119312) | Qie forgetRecentWorkspaces (jsx 945)
 *
 *  已在 TopBar.tsx 抽取、此处仅引用接口：
 *   j6 TaskRenameDialog | oFt TaskActionMenuItems | C6 useTaskFileActions | w6 buildTaskFeedbackDescription
 *   Uo applyOptimisticTaskMutation | n4 RemoteSyncMenuItems | r4 RemoteSyncDialogs
 *   $2 canOpenRemoteSessionSourceCheck | QTt sshDecoratedProjectName
 *   yC useFeedbackStore | ls useTrajectoryViewerStore
 *
 *  图标（Sa=createLucideIcon，js 行）：
 *   ov hash 27208 | $_ folder 27133 | Q_ folder-open 27103 | U_ cloud 26918 | sv house 27214
 *   uv list-tree 27300 | hv message-circle-plus 27379 | Fv search 27732 | lye calendar-clock 26775
 *   Yv wand-sparkles 27966 | Zye minimize-2 27436 | mv maximize-2 27346 | Wye list-filter 27288
 *   B_ clock-3 26897 | Xye message-circle-check 27369 | x_ archive 26615 | g x（imeComposition chunk）
 *   H_ cloud-upload 26913 | Ov pin 27578 | Vv smartphone 27800 | V_ clock 26901 | xv moon 27468
 *   fv loader 27315 | p triangle-alert（imeComposition chunk）| Nv refresh-cw 27677 | M_ check 26801
 *   W_ copy 26926 | K_ ellipsis 26950 | Rv settings 27758 | nv globe 27170 | wv palette 27522
 *   Jye maximize 27352 | pv log-in 27325 | Kye log-out 27330 | Pbe user 27946 | Lv settings-2 27752
 *   iv grip-vertical 27188 | nye arrow-up-to-line 26658
 *   button chunk：xa zoom-in | Kre zoom-out | wa chevron-right | Ca cva | X Button | Sa createLucideIcon
 *   imeComposition chunk：M spinner | g x 图标 | A isImeEnter | l usePlatformService | m toast
 *
 *  data-testid 常量（src-HCld2afU.js，out/ 行号）：
 *   Xte=sidebar(8290) | iee=workspace-list(8291) | Nr=workspace-item(8292) | Sn=workspace-close(8293)
 *   fr=workspace-file-tree-button(8364) | yre=project-add(8296) | cee=conversation-new-task(8295)
 *   ut=project-section(8294) | xee=conversation-section(8294 附近) | An=task-item(8319)
 *   et=task-archive(8316) | Ft=task-settings-button(8322) | Rn=task-list(8317) | kte=task-empty(8320)
 *   $n=task-new-button(8318) | Nt=automations-open(8420) | $ee=login-trigger(8222)
 *   Zne=login-menu-item(8223) | _ne=logout-button(8236) | vte=sidebar-coding-plan-usage-button(8337)
 *   pRt=sidebar-coding-plan-upgrade-button（本 chunk 150254）
 *   qr=`${base}-${id}` 复合 testid 助手（src chunk Nb，8464）
 *   Gne=zcode-default-group-cron(8724) | ane=zcode-default-group-off-peak(8725)
 *   pi=isCronTask（src chunk fx 8726）| Yr=isOffPeakTask（src chunk px 8729）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime           react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)              utils-CEEH0K_K.js
 *  3. Button/createLucideIcon/cva/zoom-in/zoom-out/chevron-right (X/Sa/Ca/xa/Kre/wa)
 *                                   button-laUijeDG.js
 *  4. useIntlContext (G)            IntlProvider-C321H7m8.js
 *  5. usePlatformService/toast/Input/IME 守卫/spinner/x 图标/Popover 原语 (l/m/P/A/M/g/…)
 *                                   imeComposition-DEYFkwWm.js
 *  6. Tooltip (Ia)、Popover 原语 (Na/Oa/Ma/ka)
 *                                   usageStatsUiParts-CiR7YEhh.js
 *  7. shortcutLabel ($i)            keyboardShortcuts-BGHopxr9.js
 *  8. logger (J)                    logger-PFDwl5Yq.js
 *  9. zustand create/useTaskStore/useSkillsStore/工作区状态选择器群 (Ae/xe/Ne/fe/ee/U…)
 *                                   skillStore-BmeKHDBI.js
 * 10. testid 常量/DesktopCommand/环境常量/默认分组 id/cron-offpeak 判定 (~400 符号)
 *                                   src-HCld2afU.js
 * 11. useVirtualizer (to)           esm-BY6T6pIH.js（@tanstack/virtual 核心）
 * 12. 本 chunk 内原语：Radix Tabs(hC/gC/_C 36949)、DropdownMenu(VO…JO 47926)、
 *     ContextMenu(yk…Ck 43966)、Collapsible(kZ/AZ/jZ 82939)、Dialog(zb… 31943)、
 *     Badge(uJ 70704)、dnd-kit vendored 块(91811–94695)
 * ============================================================================
 */

import * as React from "react";
import { Tabs as TabsRoot } from '../../modules/Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { ContextMenu, ContextMenuContent, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '../ui/context-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Hash as IconHash, Folder as IconFolder, FolderOpen as IconFolderOpen, Cloud as IconCloud, House as IconHouse, ListTree as IconListTree, MessageCirclePlus as IconMessageCirclePlus, Search as IconSearch, CalendarClock as IconCalendarClock, WandSparkles as IconWandSparkles, Minimize2 as IconMinimize2, Maximize2 as IconMaximize2, ListFilter as IconListFilter, Clock3 as IconClock3, MessageCircleCheck as IconMessageCircleCheck, Archive as IconArchive, CloudUpload as IconCloudUpload, Pin as IconPin, Smartphone as IconSmartphone, Clock as IconClock, Moon as IconMoon, Loader as IconLoader, TriangleAlert as IconTriangleAlert, RefreshCw as IconRefreshCw, Check as IconCheck, Copy as IconCopy, Ellipsis as IconEllipsis, Settings as IconSettings, Globe as IconGlobe, Palette as IconPalette, Maximize as IconMaximize, LogIn as IconLogIn, LogOut as IconLogOut, User as IconUser, Settings2 as IconSettings2, GripVertical as IconGripVertical, ArrowUpToLine as IconArrowUpToLine, ChevronDown as IconChevronDown, LoaderCircle as SpinnerIcon, Plus as IconPlus, ChartColumn as IconChartColumn, Rocket as IconRocket } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Button, buttonVariants, ZoomIn as IconZoomIn, ZoomOut as IconZoomOut, ChevronRight as IconChevronRight } from '../../modules/button'; // A0-CLEANUP 族清理：Button/buttonVariants declare 改指 button chunk；A0-S3b 增补：ZoomIn as IconZoomIn, ZoomOut as IconZoomOut, ChevronRight as IconChevronRight（button chunk 图标，pass-1 同源）
import { FileTreePanel } from '../../modules/FileTreePanel';
import { useTaskFileActions } from '../../modules/GitReview';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger, toast } from '../../modules/ImeComposition';
import { RemoteSyncDialogs, canOpenRemoteSessionSourceCheck } from '../../modules/Modals';
import { Badge } from '../../modules/PaymentDeep';
import { TabsList, TabsTrigger } from '../../modules/Settings';
import { ArchivedTasksSection, BeamBorderAnimation, WebRemoteTaskListSection, readVisibleLimit, useGroupedTaskView, useSidebarUsageState, useWorkspaceTaskGroups, type WebRemoteSwitcher } from '../../modules/SidebarLeaves';
import { logger, mergeTaskMeta, resolveWorkspaceKey as workspaceKey, useTaskStore, type TaskStore } from '../../modules/SkillStore'; // +workspaceKey（原 Io，A0-CLEANUP 族清理）；A0-CLEANUP3 3b：getWorkspaceSlice 形参对齐真 store 面
import { RemoteSyncMenuItems, TaskActionMenuItems, TaskRenameDialog, type TaskActionMenuItemsProps } from '../../modules/TopBar';
import { WebRemoteControlDialog, useWebRemoteControlEnabled } from '../../modules/WebRemote';
import { acquireSessionIndexStore, releaseSessionIndexStore, useBaseServices, useWorkspaceServices } from '../../modules/services';
import { useFeedbackStore, useSessionRegistryStore, useSettingsStore } from '../../modules/stores-core';
import { hasUnavailableLocalDirectoryTab as isLocalDirectoryUnavailableSelector } from '../../modules/WorkspaceTabsDeep'; // 原 sc（A1-R1：styles js 4493 / jsx 3324 逐字重建改指）
import { useSessionRouterStore, useTrajectoryViewerStore } from '../../modules/stores-session';
import { useSidebarSessionDrop as useSessionOpenability, SESSION_DRAG_MIME, serializeSessionDragPayload, setSessionDragFallbackPayload as setCurrentSessionDrag, clearSessionDragFallbackPayload as clearCurrentSessionDrag, createSessionDragPreview as createDragImageUpdater, type SessionDragPayload } from '../../modules/SplitLayoutUiDeep'; // 原 LTt（A1-R3：FTt/ITt/LTt 域重建改指；本地 SessionScope 与 SidebarSessionDropTarget 同形）+ u2/Iwt/Lwt/Rwt/PRt（A1-R4：拖放源侧改指，tombstone 见原声明位）
import { sshDecoratedProjectName } from '../../modules/SplitLayoutDeep'; // A1-R4：QTt（js 123267）远端条目域改指（tombstone 见原声明位）
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // 原 Ia（A0-CLEANUP 族清理：本地 Tooltip declare 改指 InfoTooltip）

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现见上清单；此处为重建接口）
 * ==========================================================================*/


/** react-intl 风格 intl（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string; localePreference: LocalePreference; setLocalePreference: (v: LocalePreference) => void };
type LocalePreference = "system" | "zh-CN" | "en-US";
type ThemeId = "light" | "dark" | "zai-light" | "zai-dark" | "system";

/** 桌面平台服务（原 l()，imeComposition chunk）——侧栏用到的子集 */
interface PlatformService {
  executeDesktopCommand(command: DesktopCommand): Promise<void> | void;
  getDesktopZoomLevel?(): Promise<{ zoomLevel: number }>;
  onDesktopZoomLevelChanged?(cb: (e: { zoomLevel: number }) => void): () => void;
  getInstalledEditors(): Promise<InstalledEditor[]>;
  captureWindowScreenshot?(): Promise<Blob | null>;
  getWebRemoteControlStatus?(): Promise<WebRemoteControlStatus>;
  onWebRemoteControlStatusChanged?(cb: (s: WebRemoteControlStatus) => void): () => void;
}
declare function usePlatformService(): PlatformService;
interface InstalledEditor { id: string; name: string; [key: string]: unknown }
type WebRemoteControlStatus =
  | { status: "idle" | "starting" | "connecting" | "running" | "active" | "error"; [key: string]: unknown };

/** toast（原 m，imeComposition chunk） */

/** 快捷键文案（原 $i）：`shortcutLabel("N")` → “Ctrl+N” */
declare function shortcutLabel(key: string): string;

/** 日志器（原 J） */

/** 桌面命令枚举（原 oi，src-HCld2afU.js；页脚界面缩放用） */
declare enum DesktopCommand { ZoomIn = "ZoomIn", ZoomOut = "ZoomOut", ResetZoom = "ResetZoom" }

/** IME 回车守卫（原 A，imeComposition chunk） */
declare function isImeEnter(args: { compositionActive: boolean; nativeEvent: React.KeyboardEvent["nativeEvent"] }): boolean;

/* ============================================================================
 * 1. 领域类型（任务 / 分组 / 工作区标签）
 * ==========================================================================*/

/** 任务元数据（原 task meta；skillStore chunk 的任务实体，按调用面归纳） */
interface TaskMeta {
  taskId: string;
  title: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  createdAt: number;
  updatedAt: number;
  /* A0-CLEANUP4：status 可缺——与 SidebarLeaves TaskMeta（store 真值面）同族对齐，
     消费仅 === 比较（388）与透传（364） */
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
  pendingInteraction?: TaskInteraction | null;
  changeSummary?: TaskChangeSummary | null;
  /** 会话活动附着（原 __zcodeSessionActivity，Mo 读取） */
  __zcodeSessionActivity?: SessionActivity | null;
}
interface SessionActivity {
  phase: "prewarming" | "running" | "completedSuccess" | "completedInterrupted" | "error" | "draft" | string;
  lastActivityAt: number;
  pendingInteractions?: { permissionCount: number; userInputCount: number } | null;
}
interface TaskChangeSummary { files: unknown[]; added: number; removed: number }
/** 待处理交互（原 pendingInteraction：askUserQuestion / 权限请求） */
interface TaskInteraction {
  interactionId: string;
  kind?: string;
  toolName?: string;
  autoResolution?: { state: "snoozed" | string; visibleAt: number; deadlineAt: number; startedAt?: number } | null;
}
interface TaskGroup { id: string; title: string; color: GroupColor; createdAt: number; sortOrder?: number | null }
type GroupColor = "gray" | "red" | "orange" | "yellow" | "green" | "blue" | "purple";
/** 分组视图节点（原 qRt 产物） */
type GroupedViewNode =
  | { type: "group"; group: TaskGroup; tasks: TaskMeta[]; sortOrder?: number }
  | { type: "task"; task: TaskMeta; sortOrder?: number };
interface GroupedView { nodes: GroupedViewNode[] }
/** 工作区标签（原 workspace tab；pc store 的条目） */
/** type 别名：对 SidebarLeaves.WorkspaceTab（带索引签名）可赋值 */
type WorkspaceTab = {
  id: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  localWorkspacePath?: string | null;
  workspacePurpose?: "project" | "conversation";
  label?: string;
  availability?: "unavailable-local-directory" | string;
};
/** 远程目标：kind 基（与 SidebarLeaves/Home/RemoteWizard 同口径；resolveSshConnectionInfo 按 kind==="ssh" 裁决） */
interface RemoteTarget {
  kind: "ssh" | "wsl" | "docker" | "server";
  host?: string;
  alias?: string;
  username?: string;
  port?: number;
  sshConfigAlias?: string;
  [key: string]: unknown;
}
type TaskSortBy = "created" | "updated";
/** 一级组织方式（持久化于 zcode-sidebar-task-preferences）——HOME-SEG：grouped 退役，home 取代 */
type TaskOrganizeBy = "home" | "project" | "chronological";
/** 解析后的任务视图模式（原 nVt 产物）——HOME-SEG：grouped→home */
type TaskViewMode = "archived" | "timeline" | "home" | "workspace";
type TaskRowVariant = "default" | "timeline";
/** 任务行状态指示（原 QS 产物） */
type TaskIndicator = "error" | "unread" | "loading" | "none";
/** 待关注摘要（原 No 产物） */
type TaskAttention = { kind: "userInput" | "permission"; count: number } | null;

/* ============================================================================
 * 2. 横切任务助手（原 Io/Lo/Fo/Mo/No/Po/QS/$S/vg/Vhe/Go/pi/Yr，jsx 369–411/986/20317/33105）
 * ==========================================================================*/

/* ── tombstone（A0-CLEANUP 族清理）：workspaceKey（原 Io）declare 删除 → import { resolveWorkspaceKey as workspaceKey } from './SkillStore'。 ── */
/** 原 Lo（jsx 411）：任务实体键 `workspaceKey::taskId` */
function taskEntityKey(task: Pick<TaskMeta, "workspacePath" | "workspaceIdentity" | "taskId">): string {
  return `${workspaceKey(task.workspacePath, task.workspaceIdentity)}::${task.taskId}`;
}
/** 原 Mo（jsx 369）：读取附着的会话活动 */
function taskSessionActivity(task: TaskMeta): SessionActivity | null {
  return task.__zcodeSessionActivity ?? null;
}
/** 原 Fie（jsx 373）：活动进行中（预热/运行） */
function isTaskActivityRunning(task: TaskMeta): boolean {
  const phase = taskSessionActivity(task)?.phase;
  return phase === "prewarming" || phase === "running";
}
/** 原 No（jsx 376）：待关注交互摘要（用户输入优先于权限） */
function taskPendingAttention(task: TaskMeta): TaskAttention {
  const pending = taskSessionActivity(task)?.pendingInteractions;
  if (!pending) return null;
  const count = pending.permissionCount + pending.userInputCount;
  return count === 0 ? null : { kind: pending.userInputCount > 0 ? "userInput" : "permission", count };
}
/** 原 Po（jsx 385）：把乐观任务补丁与会话活动合并（保留活动附着） */
function mergeTaskWithActivity(base: TaskMeta, patch: Partial<TaskMeta>): TaskMeta {
  const activity = taskSessionActivity(base);
  if (!activity) return patch as TaskMeta;
  const hasUnread = Object.prototype.hasOwnProperty.call(patch, "unreadAt");
  return {
    ...base, ...patch,
    createdAt: base.createdAt,
    updatedAt: activity.lastActivityAt,
    status: base.status,
    unreadAt: hasUnread ? patch.unreadAt : base.unreadAt,
    __zcodeSessionActivity: activity,
  } as TaskMeta;
}
/** 原 ee（skillStore 导出 G）：任务元数据合并（接口） */
/** 原 Iie/Lie/Fo（jsx 396–405）：列表排序比较器——运行中任务恒在前，其余按 updated/created */
function compareTasksForList(a: TaskMeta, b: TaskMeta, sortBy: TaskSortBy): number {
  const aRunning = isTaskActivityRunning(a);
  const bRunning = isTaskActivityRunning(b);
  if (aRunning !== bRunning) return aRunning ? -1 : 1;
  if (aRunning) {
    return b.createdAt === a.createdAt ? b.taskId.localeCompare(a.taskId) : b.createdAt - a.createdAt;
  }
  return sortBy === "created"
    ? b.createdAt === a.createdAt
      ? b.updatedAt === a.updatedAt ? b.taskId.localeCompare(a.taskId) : b.updatedAt - a.updatedAt
      : b.createdAt - a.createdAt
    : b.updatedAt === a.updatedAt
      ? b.createdAt === a.createdAt ? b.taskId.localeCompare(a.taskId) : b.createdAt - a.createdAt
      : b.updatedAt - a.updatedAt;
}
/** 原 QS（jsx 33105）：任务行指示解析——错误 > 未读 > 运行中 > 无 */
function resolveTaskIndicator(task: TaskMeta, activity: SessionActivity | null): TaskIndicator {
  if (activity?.phase === "error" || (!activity && task.status === "error")) return "error";
  if (typeof task.unreadAt === "number") return "unread";
  if (activity?.phase === "prewarming" || activity?.phase === "running") return "loading";
  return "none";
}
/** 原 $S（jsx 33108）：相对时间（刚刚 / N 分钟 / N 小时 / N 天） */
function formatRelativeTime(updatedAt: number, intl: IntlShape): string {
  const minutes = Math.floor((Date.now() - updatedAt) / 60000);
  if (minutes < 1) return intl.formatMessage({ id: "taskList.justNow" });
  if (minutes < 60) return intl.formatMessage({ id: "taskList.minutesAgo" }, { minutes: String(minutes) });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return intl.formatMessage({ id: "taskList.hoursAgo" }, { hours: String(hours) });
  return intl.formatMessage({ id: "taskList.daysAgo" }, { days: String(Math.floor(hours / 24)) });
}
/** 原 vg（jsx 20317）：任务变更摘要（无文件则 null） */
function taskChangeSummary(task: TaskMeta): TaskChangeSummary | null {
  return !task.changeSummary || task.changeSummary.files.length === 0 ? null : task.changeSummary;
}
/** 原 Vhe（jsx 20328）：标题 + 变更统计后缀（tooltip 用） */
function titleWithChangeStats(title: string, summary: TaskChangeSummary | null, intl: IntlShape): string {
  return summary
    ? `${title} (${intl.formatMessage({ id: "taskList.changeStats" }, { added: String(summary.added), removed: String(summary.removed) })})`
    : title;
}
/** 原 Go（jsx 986）：路径末段名 */
function workspaceBaseName(path: string): string {
  const parts = path.replace(/\\/g, "/").replace(/\/+$/, "").split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}
/** 原 pi（src chunk fx 8726）：定时任务 */
declare function isCronTask(task: TaskMeta): boolean;
/** 原 Yr（src chunk px 8729）：闲时任务 */
declare function isOffPeakTask(task: TaskMeta): boolean;
/** 原 fzt（153631 / 127078）：变更统计片段 ["+N", "-N"] */
function formatChangeStatParts(summary: TaskChangeSummary | null): string[] {
  if (!summary) return [];
  const parts: string[] = [];
  if (summary.added > 0) parts.push(`+${summary.added}`);
  if (summary.removed > 0) parts.push(`-${summary.removed}`);
  return parts;
}

/* ============================================================================
 * 3. 时间线日期分组（原 uPt/dPt/fPt/pPt，js 116958–117060 / jsx 99930 附近）
 * ==========================================================================*/

type TimelineDateBucket =
  | { kind: "today" } | { kind: "yesterday" } | { kind: "daysAgo"; daysAgo: number }
  | { kind: "thisWeek" } | { kind: "lastWeek" } | { kind: "thisMonth" } | { kind: "lastMonth" }
  | { kind: "thisYear" } | { kind: "earlier" };
declare function startOfLocalDay(ms: number): number;
declare function startOfWeekLocal(now: number, locale: string): number;
declare function startOfMonthLocal(now: number): number;
const DAY_MS = 86400000; // 原 sPt
/** 原 uPt（116958）：把时间戳归入日期桶（今天/昨天/N天前/本周/上周/本月…） */
function bucketTaskDate(timestamp: number, now: number, locale: string): TimelineDateBucket {
  const dayDiff = Math.floor((startOfLocalDay(now) - startOfLocalDay(timestamp)) / DAY_MS);
  if (dayDiff <= 0) return { kind: "today" };
  if (dayDiff === 1) return { kind: "yesterday" };
  if (dayDiff <= 3) return { kind: "daysAgo", daysAgo: dayDiff };
  const weekStart = startOfWeekLocal(now, locale);
  if (timestamp >= weekStart) return { kind: "thisWeek" };
  if (timestamp >= weekStart - 7 * DAY_MS) return { kind: "lastWeek" };
  if (timestamp >= startOfMonthLocal(now)) return { kind: "thisMonth" };
  const d = new Date(now);
  if (timestamp >= new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime()) return { kind: "lastMonth" };
  if (new Date(timestamp).getFullYear() === d.getFullYear()) return { kind: "thisYear" };
  return { kind: "earlier" };
}
/** 原 dPt（116989）：桶 → i18n 描述 */
function timelineBucketMessage(bucket: TimelineDateBucket): { id: string; values?: Record<string, string> } {
  return bucket.kind === "daysAgo"
    ? { id: "taskTimeline.daysAgo", values: { days: String(bucket.daysAgo ?? 0) } }
    : { id: `taskTimeline.${bucket.kind}` };
}
function timelineBucketKey(bucket: TimelineDateBucket): string {
  return bucket.kind === "daysAgo" ? `${bucket.kind}:${bucket.daysAgo ?? 0}` : bucket.kind;
}
/** 原 pPt（117002）：按日期桶分组任务（保持原顺序） */
function groupTasksByDateBucket(
  tasks: TaskMeta[],
  opts: { sortBy: TaskSortBy; now: number; locale: string },
): Array<{ key: string; label: TimelineDateBucket; items: TaskMeta[] }> {
  const groups: Array<{ key: string; label: TimelineDateBucket; items: TaskMeta[] }> = [];
  const byKey = new Map<string, { key: string; label: TimelineDateBucket; items: TaskMeta[] }>();
  for (const task of tasks) {
    const bucket = bucketTaskDate(opts.sortBy === "created" ? task.createdAt : task.updatedAt, opts.now, opts.locale);
    const key = timelineBucketKey(bucket);
    const existing = byKey.get(key);
    if (existing) { existing.items.push(task); continue; }
    const created = { key, label: bucket, items: [task] };
    byKey.set(key, created);
    groups.push(created);
  }
  return groups;
}

/* ============================================================================
 * 4. 侧栏偏好持久化
 *    4.1 任务偏好（原 UFt/K6/WFt/GFt/q6/KFt，js 144772–144802 / jsx 120543–120570）
 * ==========================================================================*/

const SIDEBAR_TASK_PREFERENCES_KEY = "zcode-sidebar-task-preferences"; // 原 UFt
// HOME-SEG：Home 为默认选中（原默认 project）
const DEFAULT_TASK_PREFERENCES: { organizeBy: TaskOrganizeBy; sortBy: TaskSortBy } = { organizeBy: "home", sortBy: "updated" }; // 原 K6
declare function getLocalStorage(): Storage | null; // 原 Be（IntlProvider chunk 的安全访问器）
function isTaskOrganizeBy(value: unknown): value is TaskOrganizeBy {
  // HOME-SEG：grouped 退役
  return value === "home" || value === "project" || value === "chronological";
}
function isTaskSortBy(value: unknown): value is TaskSortBy {
  return value === "created" || value === "updated";
}
/** 原 q6（144780）：读取任务偏好（缺省 项目/按更新时间） */
function loadSidebarTaskPreferences(storage: Storage | null = getLocalStorage()) {
  let raw: string | null = null;
  try { raw = storage?.getItem(SIDEBAR_TASK_PREFERENCES_KEY) ?? null; } catch { raw = null; }
  if (!raw) return DEFAULT_TASK_PREFERENCES;
  try {
    const parsed = JSON.parse(raw) as { organizeBy?: unknown; sortBy?: unknown };
    // HOME-SEG：历史 "grouped" 偏好归并进 Home 段（分组视图已删除）
    const organizeBy = parsed.organizeBy === "grouped" ? "home" : parsed.organizeBy;
    return {
      organizeBy: isTaskOrganizeBy(organizeBy) ? organizeBy : DEFAULT_TASK_PREFERENCES.organizeBy,
      sortBy: isTaskSortBy(parsed.sortBy) ? parsed.sortBy : DEFAULT_TASK_PREFERENCES.sortBy,
    };
  } catch {
    return DEFAULT_TASK_PREFERENCES;
  }
}
/** 原 KFt（144798）：写回任务偏好 */
function saveSidebarTaskPreferences(
  prefs: { organizeBy: TaskOrganizeBy; sortBy: TaskSortBy },
  storage: Storage | null = getLocalStorage(),
): void {
  try { storage?.setItem(SIDEBAR_TASK_PREFERENCES_KEY, JSON.stringify({ organizeBy: prefs.organizeBy, sortBy: prefs.sortBy })); } catch { /* 忽略 */ }
}

/* ==== 4.2 分段偏好（原 J6/qFt/Y6/JFt/X6/Z6/YFt/XFt/Q6，js 144803–144862）==== */

type PurposeSectionId = "projects" | "conversations";
const PURPOSE_SECTION_IDS: PurposeSectionId[] = ["projects", "conversations"]; // 原 J6
const PURPOSE_SECTION_PREFERENCES_KEY = "zcode-sidebar-purpose-section-preferences"; // 原 qFt
interface PurposeSectionPreferences {
  projectsExpanded: boolean;
  conversationsExpanded: boolean;
  sectionOrder: PurposeSectionId[];
}
const DEFAULT_PURPOSE_SECTION_PREFERENCES: PurposeSectionPreferences = {
  projectsExpanded: true, conversationsExpanded: true, sectionOrder: [...PURPOSE_SECTION_IDS],
}; // 原 Y6
function safeWindowLocalStorage(): Storage | null { // 原 JFt（144806）
  if (typeof window === "undefined") return null;
  try { return window.localStorage; } catch { return null; }
}
function defaultPurposeSectionPreferences(): PurposeSectionPreferences { // 原 X6（144814）
  return { ...DEFAULT_PURPOSE_SECTION_PREFERENCES, sectionOrder: [...DEFAULT_PURPOSE_SECTION_PREFERENCES.sectionOrder] };
}
/** 原 Z6（144817）：段序校验（必须恰好包含 projects+conversations） */
function sanitizeSectionOrder(value: unknown): PurposeSectionId[] {
  if (!Array.isArray(value) || value.length !== PURPOSE_SECTION_IDS.length) return [...PURPOSE_SECTION_IDS];
  const set = new Set(value as PurposeSectionId[]);
  return set.size !== PURPOSE_SECTION_IDS.length || PURPOSE_SECTION_IDS.some((id) => !set.has(id))
    ? [...PURPOSE_SECTION_IDS]
    : (value as PurposeSectionId[]);
}
/** 原 YFt（144822）：段序拖拽重排（active 移到 over 位置） */
function reorderSectionOrder(order: PurposeSectionId[], activeId: string, overId: string): PurposeSectionId[] {
  const safe = sanitizeSectionOrder(order);
  const from = safe.indexOf(activeId as PurposeSectionId);
  const to = safe.indexOf(overId as PurposeSectionId);
  if (from === -1 || to === -1 || from === to) return safe;
  const next = [...safe];
  const moved = next[from];
  if (!moved) return safe;
  next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
/** 原 XFt（144831）：读取分段偏好 */
function loadPurposeSectionPreferences(storage: Storage | null = safeWindowLocalStorage()): PurposeSectionPreferences {
  try {
    const raw = storage?.getItem(PURPOSE_SECTION_PREFERENCES_KEY);
    if (!raw) return defaultPurposeSectionPreferences();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return defaultPurposeSectionPreferences();
    const value = parsed as Partial<PurposeSectionPreferences>;
    return {
      projectsExpanded: typeof value.projectsExpanded === "boolean" ? value.projectsExpanded : DEFAULT_PURPOSE_SECTION_PREFERENCES.projectsExpanded,
      conversationsExpanded: typeof value.conversationsExpanded === "boolean" ? value.conversationsExpanded : DEFAULT_PURPOSE_SECTION_PREFERENCES.conversationsExpanded,
      sectionOrder: sanitizeSectionOrder(value.sectionOrder),
    };
  } catch {
    return defaultPurposeSectionPreferences();
  }
}
/** 原 Q6（144851）：写回分段偏好 */
function savePurposeSectionPreferences(prefs: PurposeSectionPreferences, storage: Storage | null = safeWindowLocalStorage()): void {
  try {
    storage?.setItem(PURPOSE_SECTION_PREFERENCES_KEY, JSON.stringify({
      projectsExpanded: prefs.projectsExpanded,
      conversationsExpanded: prefs.conversationsExpanded,
      sectionOrder: sanitizeSectionOrder(prefs.sectionOrder),
    }));
  } catch { /* 忽略 */ }
}
/** 原 ZFt/QFt（144863/144866）：按用途拆分工作区标签（会话工作区 vs 项目工作区） */
function workspacePurposeOf(tab: WorkspaceTab): "conversation" | "project" {
  return tab.workspacePurpose === "conversation" ? "conversation" : "project";
}
function partitionWorkspaceTabsByPurpose(tabs: WorkspaceTab[]) {
  const conversationWorkspaceTabs: WorkspaceTab[] = [];
  const projectWorkspaceTabs: WorkspaceTab[] = [];
  for (const tab of tabs) (workspacePurposeOf(tab) === "conversation" ? conversationWorkspaceTabs : projectWorkspaceTabs).push(tab);
  return { allTaskWorkspaceTabs: tabs, conversationWorkspaceTabs, projectWorkspaceTabs };
}

/* ==== 4.3 折叠组持久化（原 EIt/DIt/OIt/kIt/AIt，js 145137–145166 / jsx 121001–121020）==== */

const COLLAPSED_GROUPS_STORAGE_KEY = "zcode-grouped-task-collapsed-groups"; // 原 EIt
function sanitizeCollapsedGroupRecord(value: unknown): Record<string, boolean> { // 原 DIt
  return !value || typeof value !== "object" || Array.isArray(value)
    ? {}
    : Object.fromEntries(Object.entries(value).filter(([k, v]) => typeof k === "string" && k.length > 0 && v === true));
}
/** 原 kIt（145148）：读取折叠组集合 */
function loadCollapsedGroupIds(storage: Storage | null = getLocalStorage()): Set<string> {
  let raw: string | null = null;
  try { raw = storage?.getItem(COLLAPSED_GROUPS_STORAGE_KEY) ?? null; } catch { raw = null; }
  if (!raw) return new Set();
  try { return new Set(Object.keys(sanitizeCollapsedGroupRecord(JSON.parse(raw)))); } catch { return new Set(); }
}
/** 原 AIt（145162）：写回折叠组集合（{groupId: true} 映射） */
function saveCollapsedGroupIds(ids: Set<string>, storage: Storage | null = getLocalStorage()): void {
  try { storage?.setItem(COLLAPSED_GROUPS_STORAGE_KEY, JSON.stringify(Object.fromEntries([...ids].map((id) => [id, true])))); } catch { /* 忽略 */ }
}

/* ============================================================================
 * 5. 分组色板与分组视图不可变操作
 *    （原 $6/$Ft/eIt/类名常量/e8/t8/n8 + sIt…TIt，js 144872–145136 / jsx 120648–121000）
 * ==========================================================================*/

/** 原 $6（144872）：分组色板（7 色） */
const GROUP_COLORS: GroupColor[] = ["gray", "red", "orange", "yellow", "green", "blue", "purple"];
/** 原 $Ft（144873）：色点/色片表面色 */
const GROUP_COLOR_SURFACE_CLASSES: Record<GroupColor, string> = {
  gray: "bg-zinc-300 text-zinc-800 dark:bg-zinc-400/32 dark:text-zinc-100",
  red: "bg-rose-300 text-rose-900 dark:bg-rose-400/32 dark:text-rose-50",
  orange: "bg-orange-300 text-orange-900 dark:bg-orange-400/32 dark:text-orange-50",
  yellow: "bg-amber-300 text-amber-900 dark:bg-amber-300/32 dark:text-amber-50",
  green: "bg-emerald-300 text-emerald-900 dark:bg-emerald-400/32 dark:text-emerald-50",
  blue: "bg-sky-300 text-sky-900 dark:bg-sky-400/32 dark:text-sky-50",
  purple: "bg-violet-300 text-violet-900 dark:bg-violet-400/32 dark:text-violet-50",
};
/** 原 eIt（144881）：组体左缘描边色（GROUP_BODY_CLASS 的 border-l 配色） */
const GROUP_COLOR_BORDER_CLASSES: Record<GroupColor, string> = {
  gray: "border-zinc-500/70 dark:border-zinc-400/55",
  red: "border-rose-500/70 dark:border-rose-400/52",
  orange: "border-orange-500/70 dark:border-orange-400/52",
  yellow: "border-amber-500/70 dark:border-amber-300/52",
  green: "border-emerald-500/70 dark:border-emerald-400/52",
  blue: "border-sky-500/70 dark:border-sky-400/52",
  purple: "border-violet-500/70 dark:border-violet-400/52",
};
/* 原 tIt…oIt（144890–144896）：分组行类名常量（逐字保留） */
const GROUP_NODE_WRAPPER_CLASS = "relative pt-2.5 pb-0 transition-[width,max-width] duration-200 ease-out";
const GROUP_HEADER_ROW_CLASS = "mb-0.5 flex h-8 items-center gap-1 rounded-lg border border-transparent pl-1.5 pr-1 text-ui-base text-foreground transition-[background-color,border-color,box-shadow] hover:bg-surface-hover";
const GROUP_TITLE_BUTTON_CLASS = "min-w-0 max-w-full cursor-pointer truncate rounded-sm px-1 text-left text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-border-focused";
const GROUP_COUNT_BADGE_CLASS = "inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-tag/50 px-1.5 py-0.5 text-ui-sm font-medium leading-none text-foreground-subtle";
const GROUP_BODY_CLASS = "ml-4 border-l py-px pl-2";
const GROUPED_TASK_ROW_CLASS = "flex h-7 w-full min-w-0 items-center gap-2 rounded-lg border border-transparent pl-2.5 pr-1 text-left text-ui-base transition-[background-color,border-color,color,opacity]";

/** 原 e8（144897）：组色点（圆底 + hash 图标） */
export function GroupColorDot({ color }: { color: GroupColor }) {
  return (
    <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full", GROUP_COLOR_SURFACE_CLASSES[color])}>
      <IconHash className="size-3" />
    </span>
  );
}
/** 原 t8（144903）：组色片（菜单内小圆点） */
export function GroupColorSwatch({ color }: { color: GroupColor }) {
  return <span className={cn("size-2.5 shrink-0 rounded-full", GROUP_COLOR_SURFACE_CLASSES[color])} />;
}

/** 原 n8（144906）：分组视图任务键 */
export function groupedTaskKey(task: Pick<TaskMeta, "workspacePath" | "workspaceIdentity" | "taskId">): string {
  return workspaceKey(task.workspacePath, task.workspaceIdentity) + "\u0000" + task.taskId;
}

/** 原 sIt（144909）：浅克隆分组视图（节点与组内任务数组均克隆） */
function cloneGroupedView(view: GroupedView): GroupedView {
  return { nodes: view.nodes.map((node) => (node.type === "task" ? { ...node } : { ...node, tasks: [...node.tasks] })) };
}
/** 原 r8（144914）：克隆节点数组 */
function cloneGroupedNodes(view: GroupedView): GroupedViewNode[] {
  return [...view.nodes];
}
/** 原 i8（144917）：克隆组节点 */
function cloneGroupNode(node: Extract<GroupedViewNode, { type: "group" }>): Extract<GroupedViewNode, { type: "group" }> {
  return { ...node, tasks: [...node.tasks] };
}
/** 原 s8（144958）：按键查找任务（顶层与组内） */
function findTaskInView(view: GroupedView, taskKey: string): TaskMeta | null {
  for (const node of view.nodes) {
    if (node.type === "task" && groupedTaskKey(node.task) === taskKey) return node.task;
    if (node.type === "group") {
      const found = node.tasks.find((task) => groupedTaskKey(task) === taskKey);
      if (found) return found;
    }
  }
  return null;
}
/** 原 c8（144998）：组节点索引 */
function findGroupNodeIndex(view: GroupedView, groupId: string): number {
  return view.nodes.findIndex((node) => node.type === "group" && node.group.id === groupId);
}
/** 原 hIt（145001）：任务所在组 id（不在组内返回 null） */
function findGroupIdOfTask(view: GroupedView, taskKey: string): string | null {
  for (const node of view.nodes) {
    if (node.type === "group" && node.tasks.some((task) => groupedTaskKey(task) === taskKey)) return node.group.id;
  }
  return null;
}
/** 原 pIt（144990）：同 hIt（wIt 用） */
function findGroupIdOfTaskOrNull(view: GroupedView, taskKey: string): string | null {
  return findGroupIdOfTask(view, taskKey);
}
/** 原 mIt（144995）：顶层任务节点索引 */
function findTopLevelTaskNodeIndex(view: GroupedView, taskKey: string): number {
  return view.nodes.findIndex((node) => node.type === "task" && groupedTaskKey(node.task) === taskKey);
}

/** 原 l8（145006）：任务定位（顶层 or 组内，含索引） */
type TaskLocation =
  | { parent: "root"; nodeIndex: number; task: TaskMeta }
  | { parent: "group"; groupId: string; nodeIndex: number; taskIndex: number; task: TaskMeta };
function locateTaskInView(view: GroupedView, taskKey: string): TaskLocation | null {
  for (let nodeIndex = 0; nodeIndex < view.nodes.length; nodeIndex += 1) {
    const node = view.nodes[nodeIndex];
    if (!node) continue;
    if (node.type === "task" && groupedTaskKey(node.task) === taskKey) return { parent: "root", nodeIndex, task: node.task };
    if (node.type === "group") {
      const taskIndex = node.tasks.findIndex((task) => groupedTaskKey(task) === taskKey);
      if (taskIndex >= 0) {
        const task = node.tasks[taskIndex];
        return task ? { parent: "group", groupId: node.group.id, nodeIndex, taskIndex, task } : null;
      }
    }
  }
  return null;
}
/** 原 gIt（145025）：任务投放位置（组内 → group，否则 top） */
function resolveTaskPlacement(view: GroupedView, taskKey: string | null): { type: "top" } | { type: "group"; groupId: string } {
  if (!taskKey) return { type: "top" };
  const location = locateTaskInView(view, taskKey);
  return location?.parent === "group" ? { type: "group", groupId: location.groupId } : { type: "top" };
}
/** 原 a8（144920）：从视图移除任务（返回新视图与被移除任务） */
function removeTaskFromView(view: GroupedView, taskKey: string): { nextView: GroupedView; task: TaskMeta | null } {
  const nodes = cloneGroupedNodes(view);
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) continue;
    if (node.type === "task" && groupedTaskKey(node.task) === taskKey) {
      nodes.splice(index, 1);
      return { nextView: { nodes }, task: node.task };
    }
    if (node.type === "group") {
      const taskIndex = node.tasks.findIndex((task) => groupedTaskKey(task) === taskKey);
      if (taskIndex >= 0) {
        const cloned = cloneGroupNode(node);
        const [removed] = cloned.tasks.splice(taskIndex, 1);
        nodes[index] = cloned;
        return { nextView: { nodes }, task: removed ?? null };
      }
    }
  }
  return { nextView: { nodes }, task: null };
}
/** 原 cIt（144948）：从视图中移除任务（组内或顶层，归档用） */
function removeTaskFromEverywhere(view: GroupedView, taskKey: string): GroupedView {
  const next = cloneGroupedView(view);
  for (const node of next.nodes) {
    if (node.type !== "group") continue;
    const taskIndex = node.tasks.findIndex((task) => groupedTaskKey(task) === taskKey);
    if (taskIndex >= 0) { node.tasks.splice(taskIndex, 1); return next; }
  }
  const nodeIndex = next.nodes.findIndex((node) => node.type === "task" && groupedTaskKey(node.task) === taskKey);
  if (nodeIndex >= 0) next.nodes.splice(nodeIndex, 1);
  return next;
}
/** 原 lIt（144968）：用新任务元数据替换视图内同名任务 */
function replaceTaskInView(view: GroupedView, task: TaskMeta): GroupedView {
  const key = groupedTaskKey(task);
  return {
    nodes: view.nodes.map((node) =>
      node.type === "task"
        ? groupedTaskKey(node.task) === key ? { ...node, task } : node
        : { ...node, tasks: node.tasks.map((item) => (groupedTaskKey(item) === key ? task : item)) },
    ),
  };
}
/** 原 uIt（144980）：收集全部组 id（保持顺序） */
function collectGroupIds(view: GroupedView): string[] {
  return view.nodes.flatMap((node) => (node.type === "group" ? [node.group.id] : []));
}
/** 原 _It（145030）：把任务插入到参照任务旁边（同层） */
function insertTaskBeside(view: GroupedView, task: TaskMeta, anchorTaskKey: string, position: "before" | "after"): GroupedView {
  const nodes = cloneGroupedNodes(view);
  const anchor = locateTaskInView({ nodes }, anchorTaskKey);
  if (!anchor) return { nodes };
  if (anchor.parent === "root") {
    nodes.splice(anchor.nodeIndex + (position === "after" ? 1 : 0), 0, { type: "task", task });
    return { nodes };
  }
  const groupNode = nodes[anchor.nodeIndex];
  if (!groupNode || groupNode.type !== "group") return { nodes };
  const cloned = cloneGroupNode(groupNode);
  cloned.tasks.splice(anchor.taskIndex + (position === "after" ? 1 : 0), 0, task);
  nodes[anchor.nodeIndex] = cloned;
  return { nodes };
}
/** 原 yIt（145052）：把任务插入组节点旁（顶层，组前/组后） */
function insertTaskBesideGroupNode(view: GroupedView, task: TaskMeta, groupId: string, position: "before" | "after"): GroupedView {
  const nodes = cloneGroupedNodes(view);
  const groupIndex = nodes.findIndex((node) => node.type === "group" && node.group.id === groupId);
  if (groupIndex >= 0) nodes.splice(groupIndex + (position === "after" ? 1 : 0), 0, { type: "task", task });
  return { nodes };
}
/** 原 u8（145057）：拖拽——把活动任务移到组头/组尾外侧 */
export function moveTaskToGroupEdge(view: GroupedView, args: { activeTaskKey: string; groupId: string; position: "before" | "after" }): GroupedView {
  const groupNode = view.nodes.find((node) => node.type === "group" && node.group.id === args.groupId);
  if (!groupNode || groupNode.type !== "group") return view;
  const { nextView, task } = removeTaskFromView(view, args.activeTaskKey);
  return task ? insertTaskBesideGroupNode(nextView, task, args.groupId, args.position) : view;
}
/** 原 d8（145063）：拖拽——把活动任务放入组首 */
export function moveTaskIntoGroupStart(view: GroupedView, args: { activeTaskKey: string; groupId: string }): GroupedView {
  const { nextView, task } = removeTaskFromView(view, args.activeTaskKey);
  if (!task) return view;
  const groupNode = nextView.nodes.find((node) => node.type === "group" && node.group.id === args.groupId);
  if (!groupNode || groupNode.type !== "group") return view;
  const firstKey = groupNode.tasks[0] ? groupedTaskKey(groupNode.tasks[0]) : null;
  return insertTaskIntoGroup(nextView, task, args.groupId, firstKey);
}
/** 原 bIt（145071）：拖拽——把活动任务追加到组尾 */
export function moveTaskIntoGroupEnd(view: GroupedView, args: { activeTaskKey: string; groupId: string }): GroupedView {
  const { nextView, task } = removeTaskFromView(view, args.activeTaskKey);
  if (!task) return view;
  const groupIndex = findGroupNodeIndex(nextView, args.groupId);
  const groupNode = nextView.nodes[groupIndex];
  if (!groupNode || groupNode.type !== "group") return view;
  const cloned = cloneGroupNode(groupNode);
  cloned.tasks.push(task);
  const nodes = cloneGroupedNodes(nextView);
  nodes[groupIndex] = cloned;
  return { nodes };
}
/** 原 SIt（145095）：组节点的下一个顶层节点（移出组时的落点参照） */
function findNodeAfterGroup(view: GroupedView, groupId: string): GroupedViewNode | null {
  const index = view.nodes.findIndex((node) => node.type === "group" && node.group.id === groupId);
  return index >= 0 ? (view.nodes[index + 1] ?? null) : null;
}
/** 原 CIt（145099）：把任务插入顶层（参照节点前；参照为 null 追加末尾） */
function insertTaskAtTopLevel(view: GroupedView, task: TaskMeta, anchor: GroupedViewNode | null): GroupedView {
  const nodes = cloneGroupedNodes(view);
  const anchorIndex = anchor === null
    ? nodes.length
    : nodes.findIndex((node) =>
        anchor.type === "group"
          ? node.type === "group" && node.group.id === anchor.group.id
          : node.type === "task" && groupedTaskKey(node.task) === groupedTaskKey(anchor.task),
      );
  nodes.splice(anchorIndex < 0 ? nodes.length : anchorIndex, 0, { type: "task", task });
  return { nodes };
}
/** 原 wIt（145111）：菜单「移动到分组 / 取消分组」——目标组为 null 时移到顶层 */
function moveTaskToGroupOrTop(view: GroupedView, task: TaskMeta, targetGroupId: string | null): GroupedView {
  const taskKey = groupedTaskKey(task);
  const currentGroupId = findGroupIdOfTaskOrNull(view, taskKey);
  if (currentGroupId === targetGroupId) return view;
  const { nextView, task: removed } = removeTaskFromView(view, taskKey);
  if (!removed) return view;
  return targetGroupId
    ? insertTaskIntoGroup(nextView, removed, targetGroupId, null)
    : insertTaskAtTopLevel(nextView, removed, currentGroupId ? findNodeAfterGroup(view, currentGroupId) : null);
}
/* ============================================================================
 * 6. 默认分组与任务列表 stores
 * ==========================================================================*/

/** 原 Gne（src chunk tt，8724）：默认定时任务组 id */
const DEFAULT_GROUP_ID_CRON = "zcode-default-group-cron";
/** 原 ane（src chunk nt，8725）：默认闲时任务组 id */
const DEFAULT_GROUP_ID_OFF_PEAK = "zcode-default-group-off-peak";
/** 原 P8（154158 / 127422）：组标题解析（默认组走 i18n） */
function resolveGroupTitle(group: TaskGroup, labels: { cron: string; offPeak: string }): string {
  return group.id === DEFAULT_GROUP_ID_CRON ? labels.cron : group.id === DEFAULT_GROUP_ID_OFF_PEAK ? labels.offPeak : group.title;
}
function isDefaultGroup(groupId: string): boolean {
  return groupId === DEFAULT_GROUP_ID_CRON || groupId === DEFAULT_GROUP_ID_OFF_PEAK;
}

/** zustand create（原 Ae，skillStore-BmeKHDBI.js 导出 q） */
declare function createStore<T>(initializer: (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T) => T): {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState(): T;
  setState(partial: Partial<T>): void;
};

/** 原 T6/O6（142360/144446）：store 工作区键 */
function storeWorkspaceKey(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceKey(workspacePath, workspaceIdentity);
}
/** 原 sFt（142363）：置顶列表排序（委托 cFt 的 updated 序） */
function sortPinnedTasks(tasks: TaskMeta[]): TaskMeta[] {
  return sortTasksBy(tasks, "updated");
}
/** 远端任务服务调用面（zcodeTaskService 的侧栏相关方法） */
interface ZCodeTaskServiceLike {
  listPinnedTasks(args: { workspacePath: string; workspaceIdentity?: string }): Promise<TaskMeta[]>;
  listTaskList(args: { kind: "timeline"; workspaceScopes: Array<{ workspacePath: string; workspaceIdentity?: string }>; sortBy: TaskSortBy; limit: number }): Promise<{ items: TaskMeta[]; total: number; hasMore: boolean }>;
  renameTask(args: { taskId: string; workspacePath: string; title: string; workspaceIdentity?: string }): Promise<TaskMeta>;
  setTaskPinned(args: { taskId: string; workspacePath: string; pinned: boolean; workspaceIdentity?: string }): Promise<TaskMeta>;
  setTaskUnread(args: { taskId: string; workspacePath: string; unread: boolean; workspaceIdentity?: string }): Promise<TaskMeta>;
  archiveTask(args: { taskId: string; workspacePath: string; workspaceIdentity?: string }): Promise<TaskMeta>;
}

/** 原 E6（142372 / 118266）：远端置顶任务列表 store（按工作区键索引） */
interface RemotePinnedTaskListState {
  itemsByWorkspaceKey: Record<string, TaskMeta[]>;
  loadingByWorkspaceKey: Record<string, boolean>;
  errorByWorkspaceKey: Record<string, string>;
  refreshWorkspace(args: { workspacePath: string; workspaceIdentity?: string | null; zcodeTaskService: ZCodeTaskServiceLike }): Promise<void>;
  upsertTask(task: TaskMeta): void;
  removeTask(workspacePath: string, taskId: string, workspaceIdentity?: string | null): void;
  clearWorkspace(workspacePath: string, workspaceIdentity?: string | null): void;
}
export const useRemotePinnedTaskListStore = createStore<RemotePinnedTaskListState>((set) => ({
  itemsByWorkspaceKey: {},
  loadingByWorkspaceKey: {},
  errorByWorkspaceKey: {},
  async refreshWorkspace({ workspacePath, workspaceIdentity, zcodeTaskService }) {
    const key = storeWorkspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: true },
      errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: "" },
    }));
    try {
      const items = await zcodeTaskService.listPinnedTasks({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}) });
      set((state) => ({
        itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortPinnedTasks(items) },
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn("[remotePinnedTaskStore] 读取远端 pinned task 失败", { workspacePath, workspaceIdentity, error: message });
      set((state) => ({
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
        errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: message },
      }));
    }
  },
  upsertTask(task) {
    const key = storeWorkspaceKey(task.workspacePath, task.workspaceIdentity);
    set((state) => {
      const items = state.itemsByWorkspaceKey[key] ?? [];
      const next = items.some((item) => item.taskId === task.taskId)
        ? items.map((item) => (item.taskId === task.taskId ? task : item))
        : [...items, task];
      return { itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortPinnedTasks(next) } };
    });
  },
  removeTask(workspacePath, taskId, workspaceIdentity) {
    const key = storeWorkspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: (state.itemsByWorkspaceKey[key] ?? []).filter((item) => item.taskId !== taskId) },
    }));
  },
  clearWorkspace(workspacePath, workspaceIdentity) {
    const key = storeWorkspaceKey(workspacePath, workspaceIdentity);
    set((state) => {
      const { [key]: _items, ...itemsRest } = state.itemsByWorkspaceKey;
      const { [key]: _loading, ...loadingRest } = state.loadingByWorkspaceKey;
      const { [key]: _error, ...errorRest } = state.errorByWorkspaceKey;
      return { itemsByWorkspaceKey: itemsRest, loadingByWorkspaceKey: loadingRest, errorByWorkspaceKey: errorRest };
    });
  },
}));
/** 原 k6（142464 / 118392）：远端工作区时间线任务列表 store */
interface RemoteWorkspaceTaskListState {
  itemsByWorkspaceKey: Record<string, TaskMeta[]>;
  totalByWorkspaceKey: Record<string, number>;
  hasMoreByWorkspaceKey: Record<string, boolean>;
  loadingByWorkspaceKey: Record<string, boolean>;
  errorByWorkspaceKey: Record<string, string>;
  refreshWorkspace(args: { workspacePath: string; workspaceIdentity?: string | null; zcodeTaskService: ZCodeTaskServiceLike; sortBy: TaskSortBy; limit: number }): Promise<void>;
  upsertTask(task: TaskMeta, sortBy?: TaskSortBy): void;
  removeTask(workspacePath: string, taskId: string, workspaceIdentity?: string | null): void;
  clearWorkspace(workspacePath: string, workspaceIdentity?: string | null): void;
}
export const useRemoteWorkspaceTaskListStore = createStore<RemoteWorkspaceTaskListState>((set) => ({
  itemsByWorkspaceKey: {},
  totalByWorkspaceKey: {},
  hasMoreByWorkspaceKey: {},
  loadingByWorkspaceKey: {},
  errorByWorkspaceKey: {},
  async refreshWorkspace({ workspacePath, workspaceIdentity, zcodeTaskService, sortBy, limit }) {
    const key = storeWorkspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: true },
      errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: "" },
    }));
    try {
      const result = await zcodeTaskService.listTaskList({
        kind: "timeline",
        workspaceScopes: [{ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}) }],
        sortBy,
        limit,
      });
      set((state) => ({
        itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortTasksBy(result.items, sortBy) },
        totalByWorkspaceKey: { ...state.totalByWorkspaceKey, [key]: result.total },
        hasMoreByWorkspaceKey: { ...state.hasMoreByWorkspaceKey, [key]: result.hasMore },
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn("[remoteTimelineTaskStore] 读取远端 timeline task 失败", { workspacePath, workspaceIdentity, error: message });
      set((state) => ({
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
        errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: message },
      }));
    }
  },
  upsertTask(task, sortBy = "updated") {
    const key = storeWorkspaceKey(task.workspacePath, task.workspaceIdentity);
    set((state) => {
      const items = state.itemsByWorkspaceKey[key] ?? [];
      const next = items.some((item) => item.taskId === task.taskId)
        ? items.map((item) => (item.taskId === task.taskId ? task : item))
        : [...items, task];
      return {
        itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortTasksBy(next, sortBy) },
        totalByWorkspaceKey: { ...state.totalByWorkspaceKey, [key]: Math.max(state.totalByWorkspaceKey[key] ?? 0, next.length) },
      };
    });
  },
  removeTask(workspacePath, taskId, workspaceIdentity) {
    const key = storeWorkspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: (state.itemsByWorkspaceKey[key] ?? []).filter((item) => item.taskId !== taskId) },
      totalByWorkspaceKey: { ...state.totalByWorkspaceKey, [key]: Math.max(0, (state.totalByWorkspaceKey[key] ?? state.itemsByWorkspaceKey[key]?.length ?? 0) - 1) },
    }));
  },
  clearWorkspace(workspacePath, workspaceIdentity) {
    const key = storeWorkspaceKey(workspacePath, workspaceIdentity);
    set((state) => {
      const { [key]: _i, ...itemsRest } = state.itemsByWorkspaceKey;
      const { [key]: _t, ...totalRest } = state.totalByWorkspaceKey;
      const { [key]: _h, ...hasMoreRest } = state.hasMoreByWorkspaceKey;
      const { [key]: _l, ...loadingRest } = state.loadingByWorkspaceKey;
      const { [key]: _e, ...errorRest } = state.errorByWorkspaceKey;
      return { itemsByWorkspaceKey: itemsRest, totalByWorkspaceKey: totalRest, hasMoreByWorkspaceKey: hasMoreRest, loadingByWorkspaceKey: loadingRest, errorByWorkspaceKey: errorRest };
    });
  },
}));

/* ============================================================================
 * 7. UI 原语与横切依赖声明（真实实现见头注清单）
 * ==========================================================================*/

/* ── tombstone（A0-CLEANUP 族清理）：Button（原 X）/buttonVariants（原 Ca）declare 删除 → import from './button'。 ── */
/** Radix Tabs 原语（原 hC/gC/_C，本 chunk 36949+；分段控件复用） */
/* ── tombstone（A0-S3c）：Collapsible、CollapsibleContent、CollapsibleTrigger、ContextMenu、ContextMenuContent、ContextMenuSeparator、ContextMenuSub、ContextMenuSubContent、ContextMenuSubTrigger、ContextMenuTrigger、Dialog、DialogContent、DialogFooter、DialogHeader、DialogTitle、DropdownMenu、DropdownMenuContent、DropdownMenuItem、DropdownMenuLabel、DropdownMenuRadioGroup、DropdownMenuRadioItem、DropdownMenuSeparator、DropdownMenuShortcut、DropdownMenuSub、DropdownMenuSubContent、DropdownMenuSubTrigger、DropdownMenuTrigger、TabsRoot declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */
/** Radix DropdownMenu 原语（原 VO/HO/UO/WO/XO/YO/JO/KO/qO/ZO/QO/$O，本 chunk 47926–48040） */












/** Radix ContextMenu 原语（原 yk/bk/xk/wk/Tk/Ek/Sk/Ck，本 chunk 43966–44030） */



declare const ContextMenuItem: React.FC<React.ComponentPropsWithoutRef<"div"> & { disabled?: boolean; title?: string; onSelect?: () => void }>;




/** Radix Collapsible 原语（原 kZ/AZ/jZ，本 chunk 82939–82949） */



/* ── tombstone（A0-CLEANUP 族清理）：Tooltip（原 Ia）declare 删除 → import { InfoTooltip as Tooltip } from './UsageStatsUiParts'。 ── */
/** Popover 原语（原 Na/Oa/Ma/ka，usageStatsUiParts chunk） */
/** Badge（原 uJ，本 chunk 70704） */
/** Avatar 原语（原 hLt/gLt/_Lt，本 chunk 147698–147725） */
declare function Avatar(props: { size?: "default" | string; children?: React.ReactNode; key?: React.Key }): React.ReactElement;
declare const AvatarImage: React.FC<{ src: string; alt: string }>;
declare const AvatarFallback: React.FC<React.ComponentPropsWithoutRef<"div">>;
/** Radix Dialog 封装（原 zb…，本 chunk 31943+；TopBar.tsx 已还原） */





/** dnd-kit（vendored 块 91811–94695；_Z=DndContext、EZ=SortableContext、bZ=DragOverlay、
 *  DZ=useSortable、vZ=useDraggable、yZ=useDroppable、UX=PointerSensor、WX=sensors、
 *  aZ=PointerSensor、rZ=KeyboardSensor、KX=closestCenter、TZ=rectSortingStrategy、
 *  YBt 见下文、BX.Transform、ist=sortableKeyboardCoordinates） */
declare function useDraggableSensor(args: { id: string; disabled?: boolean; data?: unknown }): {
  attributes: Record<string, unknown>; listeners: Record<string, unknown>; setNodeRef: (el: HTMLElement | null) => void;
  transform: { x: number; y: number } | null; transition: string | undefined; isDragging: boolean;
};
declare function useSortableBinding(args: { id: string; disabled?: boolean; data?: unknown }): {
  attributes: Record<string, unknown>; listeners: Record<string, unknown>; setNodeRef: (el: HTMLElement | null) => void;
  setActivatorNodeRef: (el: HTMLElement | null) => void; transform: { x: number; y: number } | null; transition: string | undefined; isDragging: boolean;
};
declare function useDroppableBinding(args: { id: string; disabled?: boolean; data?: unknown }): { setNodeRef: (el: HTMLElement | null) => void };
declare const DndContext: React.FC<{
  sensors?: unknown; collisionDetection?: unknown; modifiers?: unknown[]; autoScroll?: unknown;
  onDragStart?: (e: DndEvent) => void; onDragMove?: (e: DndEvent) => void; onDragOver?: (e: DndEvent) => void;
  onDragEnd?: (e: DndEvent) => void; onDragCancel?: () => void; children?: React.ReactNode;
}>;
declare const SortableContext: React.FC<{ items: string[]; strategy?: unknown; children?: React.ReactNode }>;
declare const DragOverlay: React.FC<{ dropAnimation?: unknown; children?: React.ReactNode }>;
interface DndEvent {
  active: { id: string | number; rect: { current: { initial?: { width: number | null } | null } }; data: { current: unknown } };
  over: { id: string | number; data: { current: unknown } } | null;
  delta: { x: number; y: number };
}
declare const dndTransform: { toString(t: { x?: number; y?: number; scaleX?: number; scaleY?: number }): string };
declare const closestCenterCollision: unknown;
declare const rectSortingStrategy: unknown;
declare const verticalListSortingStrategy: unknown;
declare function pointerSensorFactory(opts?: { activationConstraint?: { distance: number } }): unknown;
declare function keyboardSensorFactory(opts?: { coordinateGetter?: unknown }): unknown;
declare function makeSensors(...sensors: unknown[]): unknown;
declare const sortableKeyboardCoordinates: unknown;
/** useVirtualizer（原 to，esm-BY6T6pIH.js = @tanstack/virtual 核心） */
declare function useVirtualizer(opts: {
  count: number; getScrollElement: () => HTMLElement | null; estimateSize: (index: number) => number;
  getItemKey: (index: number) => string; overscan: number; scrollMargin?: number;
  scrollToFn?: (offset: number, opts: { adjustments?: number; behavior?: ScrollBehavior }, instance: unknown) => void;
  initialOffset?: () => number; measureElement?: (el: HTMLElement | null) => void;
}): {
  getVirtualItems(): Array<{ key: string; index: number; start: number }>;
  getTotalSize(): number;
  measureElement: (el: HTMLElement | null) => void;
};
/* ---- 图标（原混淆名 → lucide 名，js 行号见头注 §一） ---- */
type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（16）：IconHash/IconFolder/IconFolderOpen/IconCloud/IconHouse/IconListTree/IconMessageCirclePlus/IconSearch/IconCalendarClock/IconWandSparkles/IconMinimize2/IconMaximize2/IconListFilter/IconClock3/IconMessageCircleCheck/IconArchive → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconX: React.FC<IconProps>;               // g x（imeComposition chunk）
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（26）：IconCloudUpload/IconPin/IconSmartphone/IconClock/IconMoon/IconLoader/IconTriangleAlert/IconRefreshCw/IconCheck/IconCopy/IconEllipsis/IconSettings/IconGlobe/IconPalette/IconZoomIn/IconZoomOut/IconMaximize/IconLogIn/IconLogOut/IconUser/IconSettings2/IconGripVertical/IconArrowUpToLine/IconChevronDown/IconChevronRight/SpinnerIcon → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/** 原 EN（54789）：role=status 的旋转加载图标 */
function SpinnerStatus({ className, ...rest }: IconProps) {
  return <IconLoader role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...rest} />;
}

/* ---- data-testid 常量（原局部名 → 值，见头注 §一） ---- */
const TESTID_SIDEBAR = "sidebar";                                   // Xte
const TESTID_WORKSPACE_LIST = "workspace-list";                     // iee
const TESTID_WORKSPACE_ITEM = "workspace-item";                     // Nr
const TESTID_WORKSPACE_CLOSE = "workspace-close";                   // Sn
const TESTID_WORKSPACE_FILE_TREE_BUTTON = "workspace-file-tree-button"; // fr
const TESTID_PROJECT_ADD = "project-add";                           // yre
const TESTID_CONVERSATION_NEW_TASK = "conversation-new-task";       // cee
const TESTID_PROJECT_SECTION = "project-section";                   // ut
const TESTID_CONVERSATION_SECTION = "conversation-section";         // xee
const TESTID_TASK_ITEM = "task-item";                               // An
const TESTID_TASK_ARCHIVE = "task-archive";                         // et
const TESTID_TASK_SETTINGS_BUTTON = "task-settings-button";         // Ft
const TESTID_TASK_LIST = "task-list";                               // Rn
const TESTID_TASK_EMPTY = "task-empty";                             // kte
const TESTID_TASK_NEW_BUTTON = "task-new-button";                   // $n
const TESTID_AUTOMATIONS_OPEN = "automations-open";                 // Nt
const TESTID_LOGIN_TRIGGER = "login-trigger";                       // $ee
const TESTID_LOGIN_MENU_ITEM = "login-menu-item";                   // Zne
const TESTID_LOGOUT_BUTTON = "logout-button";                       // _ne
const TESTID_SIDEBAR_USAGE_BUTTON = "sidebar-coding-plan-usage-button"; // vte
const TESTID_SIDEBAR_UPGRADE_BUTTON = "sidebar-coding-plan-upgrade-button"; // pRt（本 chunk 150254）
/* ---- 横切 store / 钩子声明（实现位置见头注） ---- */

/** 原 xe（skillStore chunk h 导出）：任务全局 store（选择器用法） */
declare const taskStoreApi: { getState(): TaskGlobalState };
interface WorkspaceSliceState {
  activeTaskId: string | null;
  taskListVersion: number;
  groupedDraftTask: { placement: GroupedDraftPlacement } | null;
  draftFocusVersion: number;
  optimisticTaskListByTaskId: Record<string, TaskMeta>;
  promotedGroupedDraftTaskByTaskId: Record<string, { workspacePath: string; workspaceIdentity?: string | null; createdAt: number; placement: GroupedDraftPlacement }>;
  selectedSupplierKey: string;
  draftSessionId?: string | null;
}
type GroupedDraftPlacement = { type: "top" } | { type: "group"; groupId: string };
interface TaskGlobalState {
  bumpTaskListVersion(workspacePath: string, workspaceIdentity?: string | null): void;
  removeTaskState(workspacePath: string, taskId: string, identity?: string | null): void;
  upsertOptimisticTaskListItem(workspacePath: string, task: TaskMeta, identity?: string | null): void;
  removeOptimisticTaskListItem(workspacePath: string, taskId: string, identity?: string | null): void;
  setTaskUnreadIndicator(workspacePath: string, taskId: string, unread: boolean, identity?: string | null): void;
  startDraft(workspacePath: string, opts?: unknown, identity?: string | null): void;
  clearGroupedDraftTask(workspacePath: string, identity?: string | null): void;
  getWorkspaceState(workspacePath: string, identity?: string | null): WorkspaceSliceState;
}
/** 原 fe（skillStore 导出 U）：取工作区 slice */
declare function getWorkspaceSlice(state: TaskStore, workspacePath: string, workspaceIdentity?: string | null): WorkspaceSliceState; // A0-CLEANUP3 3b：useTaskStore 选择器以真 store 面传入
/** 原 ko（jsx 351）：设置 store（主题/语言/恢复 OAuth 会话） */
/** 原 pc（jsx 3601）：工作区标签 store（context 注入） */
interface WorkspaceTabStore {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  expandedWorkspacePaths: Set<string>;
  activateTab(id: string): void;
  closeTab(id: string): void;
  openSettingsTab(): void;
  toggleWorkspaceExpanded(path: string): void;
  reorderWorkspaceTabs(fromIndex: number, toIndex: number): void;
  expandAllWorkspaceTabs(paths: string[]): void;
  collapseAllWorkspaceTabs(paths: string[]): void;
}
declare function useTabStore<T>(selector: (state: WorkspaceTabStore) => T): T;
/** 原 mc（jsx 3606）：可空版 useTabStore */
declare function useOptionalTabStore<T>(selector: (state: WorkspaceTabStore) => T): T;
/* ── tombstone（A1-R1）：isLocalDirectoryUnavailableSelector（原 sc js 4493 / jsx 3324）declare 已删除，改经文件头真实 import（hasUnavailableLocalDirectoryTab as …，../../modules/WorkspaceTabsDeep）消费。 ── */
/** 原 Zs：会话注册表 store */
/** 原 Vo：搜索结果 store（任务列表查询缓存） */
declare function useSearchResultsStore<T>(selector: (state: SearchResultsState) => T): T;
interface SearchResultsState {
  setQueryResults(payload: unknown): void;
  resultsByQueryKey: Record<string, { taskKeys: string[]; total: number; unreadTaskKeys: string[] } | undefined>;
  taskMetaByEntityKey: Record<string, TaskMeta>;
  taskUnreadOverlayByEntityKey: Record<string, number | null>;
}
/** 原 A2（jsx 104365）：会话路由 store（sessionIndex 用于「可在分屏打开」判定） */
/** 原 yC：反馈 store（TopBar.tsx 已登记） */
interface FeedbackDraft { title: string; type: string; module: string; severity: string; includeLogs: boolean; description: string; screenshots: Blob[] }
/** 原 ls：轨迹查看 store（TopBar.tsx 已登记） */
/* ── tombstone（A1-R3）：useSessionOpenability declare（原 LTt 消费面）已删除——
 *    FTt/ITt/LTt 逐字重建于 modules/SplitLayoutUiDeep.tsx，改经文件头
 *    `useSidebarSessionDrop as useSessionOpenability` 真实 import 消费；
 *    载荷面 SessionScope 与 SidebarSessionDropTarget 同形（bundle js 151680 构造面）。 ── */
interface SessionScope { workspacePath: string; workspaceIdentity?: string; remoteSessionId?: string; sessionId: string }
/** 工作区服务集合（侧栏用到的调用面） */
interface WorkspaceServices {
  zcodeTaskService: ZCodeTaskServiceLike;
  zcodeSessionService: { closeSession(args: { workspacePath: string; workspaceIdentity?: string; sessionId: string }): Promise<void>; [key: string]: unknown };
  zcodeAgentService?: unknown;
  skillSyncService?: unknown;
  mcpSyncService?: unknown;
  pluginSyncService?: unknown;
  commandsService?: unknown;
  skillsService?: unknown;
  fileWatcherService?: unknown;
  gitService?: unknown;
}
/** 原 Ec（4897）：基础服务 */
/** 原 Oc（4945）：工作区服务解析 */
/** 原 yc（jsx 3637）：工作区键 → 服务/远端会话 映射 */
declare function buildWorkspaceServicesMap(
  tabs: WorkspaceTab[],
  baseServices: WorkspaceServices | null,
  sessionMaps: { sessionsById: unknown; sessionIdByWorkspaceIdentity: Record<string, string>; sessionIdByWorkspacePath: Record<string, string> },
): Map<string, { services: WorkspaceServices; remoteSessionId?: string; isRemoteWorkspace: boolean }>;
/** 原 J3（jsx 113936）：按当前能力裁剪工作区标签（远程未连接则排除等） */
declare function useScopedWorkspaceTabs(args: { workspaceTabs: WorkspaceTab[] }): WorkspaceTab[];
/** 原 ZS（35727 / 32810）：任务列表查询钩子（置顶/时间线两种 kind） */
declare function useTaskListItems(query: { kind: "pinned" | "timeline"; workspaceTabs: WorkspaceTab[]; sortBy: TaskSortBy; searchQuery: string; expanded: boolean; collapsedLimit: number }): {
  items: TaskMeta[]; total: number; hasMore: boolean; loading: boolean; syncingRemoteWorkspaces?: boolean; refresh?: () => void;
};
/** 原 Tse（jsx 3269）：按工作区身份取远端会话服务 */
declare function resolveRemoteSessionServices(workspaceIdentity: string): WorkspaceServices | null;
/** 原 gc（jsx 3614）：标签的远端会话 id */
declare function remoteSessionIdOfTab(tab: Pick<WorkspaceTab, "workspaceIdentity" | "remoteSessionId">, sessionMaps: unknown): string | undefined;
/** 原 _c（jsx 3618）：任务查询作用域 */
declare function taskQueryScopeOfTab(tab: WorkspaceTab, remoteSessionId?: string): { workspacePath: string; workspaceIdentity?: string | null };
/** 原 zie（jsx 425）：任务查询键构造 */
declare function buildTaskQueryKey(args: { kind: string; workspaceScopes: Array<{ workspacePath: string; workspaceIdentity?: string | null }>; sortBy: TaskSortBy; search: string; expanded: boolean; collapsedLimit?: number }): string;
/** 原 Uo（1895 / 959，TopBar 已登记）：乐观任务变更广播 */
declare function applyOptimisticTaskMutation(mutation: { previousTask: TaskMeta | null; nextTask: TaskMeta | null; previousState: { pinned: boolean; archived: boolean }; nextState: { pinned: boolean; archived: boolean } }): void;
/** 原 C6（TopBar 已登记）：任务文件动作钩子 */
/** 原 w6（TopBar 已登记）：任务反馈描述构造 */
declare function buildTaskFeedbackDescription(args: { taskTitle: string; taskId?: string; workspacePath: string; taskSessionPath?: string | null; taskLogPath?: string | null; formatMessage: (id: string, values?: Record<string, unknown>) => string }): string;
/** 原 n4/r4（TopBar.tsx 已还原）：远程同步菜单项 / 对话框组 */
/** 原 $2（TopBar 已登记）：远程会话源可打开性检查 */
/* ── tombstone（A1-R4）：sshDecoratedProjectName（原 QTt）declare 删除 → 真实 import
 *    from '../../modules/SplitLayoutDeep'（§F 远端条目域，js 123267）。
 *    型别宽化：返回 string | undefined；调用面（2978/3137）为插值渲染，兼容。 ── */
/** 原 M6/N6/V6（142670–142719/119312）：同步完成后的缓存刷新 */
declare function refreshAfterSkillSync(args: { zcodeSessionService: WorkspaceServices["zcodeSessionService"]; workspacePath: string; workspaceIdentity?: string | null; reason: string }): Promise<void>;
declare function refreshSkillStoresAfterSync(args: { workspacePath: string; workspaceIdentity?: string | null; skillsService: unknown; provider?: string }): Promise<void>;
declare function refreshAfterPluginSync(args: Record<string, unknown>): Promise<void>;
/** 原 Qie（jsx 945）：从最近工作区移除 */
declare function forgetRecentWorkspaces(entries: Array<{ workspacePath: string; workspaceIdentity?: string | null }>): void;
/** 原 aw（jsx 35396）：记录「进入用量页」意图（sessionStorage） */
declare function markUsageEntryIntent(): void;
/** 原 xw：遥测事件上报 */
declare function trackEvent(platformService: PlatformService | null, eventName: string, source: string): void;
declare function buildWebRemoteControlEventProps(args: { workspaceKind: "local" | "remote"; remoteKind?: string }): string;
declare function parseRemoteIdentityKind(identity: string): { kind: string } | null;
declare function resolveWorkspaceRemoteSessionId(workspacePath: string, remoteSessionId: string | null | undefined, workspaceIdentity?: string | null): string | null;
/* ---- 会话拖拽（HTML5 DnD，原 u2/Iwt/Lwt/Rwt/PRt/Wwt/Gwt/Kwt，jsx 103642–103717） ---- */
/* ── tombstone（A1-R4）：本地 SESSION_DRAG_MIME 常量 + SessionDragPayload 型 +
 *    serializeSessionDragPayload(Iwt)/setCurrentSessionDrag(Lwt)/clearCurrentSessionDrag(Rwt)/
 *    createDragImageUpdater(PRt) declare 删除 → modules/SplitLayoutUiDeep.tsx 真实 import
 *    （u2/Iwt/Lwt/Rwt 为 R3 逐字重建，PRt 为 R4 §8a 转录；别名保持调用面逐字不变）。
 *    死声明删除（无调用点）：recordDragPosition/wasDroppedOutsideSidebar/resetDragPositionTracking
 *    ——A0 期对 Wwt/Gwt/Kwt 之近似；canonical previewSessionDropAt/commitSessionDropAt/
 *    cancelSessionDropPreview 在 SplitLayoutUiDeep（R3），真实消费面为分组视图 sBt 之
 *    DnD 编排（js 155580–156026），该视图已退役（HOME-SEG），随视图重建接线。 ── */

/** 原 j6（TopBar.tsx 已还原，142581 / 118551）：任务重命名对话框 */

/* ============================================================================
 * 8. 小型共享组件
 * ==========================================================================*/

/** 原 nVt（159128 / 132072）：一级视图模式解析——HOME-SEG：grouped 退役，home（扁平对话 list）取代 */
function resolveTaskViewMode(args: { showArchivedTasks: boolean; taskOrganizeBy: TaskOrganizeBy }): TaskViewMode {
  if (args.showArchivedTasks) return "archived";
  if (args.taskOrganizeBy === "chronological") return "timeline";
  if (args.taskOrganizeBy === "home") return "home";
  return "workspace";
}
/** 原 QBt（159109 / 132053）：目录不可用时给子内容包一层 tooltip */
export function DisabledReasonWrapper({ children, disabledReason }: { children: React.ReactNode; disabledReason?: string }) {
  return disabledReason ? <Tooltip title={disabledReason}><div>{children}</div></Tooltip> : <>{children}</>;
}
/** 原 UBt（158967）：全部展开/收起按钮的文案 id */
function expandToggleMessageId(areAllExpanded: boolean): string {
  return areAllExpanded ? "workspaceSidebar.collapseAllGroups" : "workspaceSidebar.expandAllGroups";
}
/** 原 WBt（158970 / 131941）：展开/收起按钮状态（过渡期沿用上一帧，避免闪烁） */
function resolveExpandToggleState(args: {
  current: { visible: boolean; canToggle: boolean; areAllExpanded: boolean; transitionPending: boolean };
  previous: { canToggle: boolean; areAllExpanded: boolean; messageId: string } | null;
}): { canToggle: boolean; areAllExpanded: boolean; messageId: string } | null {
  if (!args.current.visible) return null;
  if (args.current.transitionPending && args.previous) return args.previous;
  return { canToggle: args.current.canToggle, areAllExpanded: args.current.areAllExpanded, messageId: expandToggleMessageId(args.current.areAllExpanded) };
}
/** 原 EFt（144153 / 120034）：新建任务行（导航第 1 行，Ctrl+N） */
export function NewTaskRow({ onCreateTask, disabled = false }: { onCreateTask: () => void; disabled?: boolean }) {
  const { intl } = useIntlContext();
  const shortcut = shortcutLabel("N");
  return (
    <div
      role="group"
      aria-disabled={disabled}
      data-testid={TESTID_TASK_NEW_BUTTON}
      onClick={() => { if (!disabled) onCreateTask(); }}
      className={cn(
        "group w-full h-8 rounded-lg inline-flex shrink-0 items-center justify-stretch gap-2 overflow-hidden pl-2.5 pr-2.5 hover:bg-surface-hover hover:text-foreground active:translate-y-0 cursor-pointer",
        disabled && "cursor-not-allowed text-foreground-subtlest hover:bg-transparent hover:text-foreground-subtlest",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 text-ui-base">
        <IconMessageCirclePlus className="h-4 w-4 shrink-0" />
        <span className="truncate">{intl.formatMessage({ id: "taskList.newThread" })}</span>
        <span className="ml-auto shrink-0 text-ui-xs font-normal text-foreground-subtlest">{shortcut}</span>
      </div>
    </div>
  );
}
/** 原 zRt（151751 / 125475）：段标题（置顶段等） */
function SectionTitle({ title }: { title: string }) {
  return <h3 className="px-2.5 py-1 text-ui-base font-medium text-foreground-subtlest">{title}</h3>;
}
/** 原 m8（146803 / 122299）：远端工作区同步中行 */
export function RemoteSyncingRow() {
  const { intl } = useIntlContext();
  return (
    <div className="flex items-center gap-2 px-2.5 py-1 text-ui-base text-foreground-subtlest">
      <SpinnerStatus className="size-4 text-foreground-subtlest" />
      <span>{intl.formatMessage({ id: "taskList.syncingRemoteWorkspaces" })}</span>
    </div>
  );
}
/* ============================================================================
 * 9. 溢出跑马灯文本（原 w8 + C8/常量，js 150984–151117 / jsx 125010–125117）
 * ==========================================================================*/

const MARQUEE_FADE_MASK_CLASS = "[mask-image:linear-gradient(to_right,black_calc(100%_-_1.5rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%_-_1.5rem),transparent)]"; // 原 DRt
const MARQUEE_GAP_PX = 24;      // 原 ORt
const MARQUEE_SPEED_PX_PER_S = 40; // 原 kRt
const MARQUEE_MIN_DURATION_S = 6;  // 原 x8
const MARQUEE_PAUSE_S = 2;      // 原 ARt
const MARQUEE_REPEAT_THRESHOLD = 1000; // 原 jRt（容器宽度超过该值不重复滚动）
const MARQUEE_FADE_RATIO = 0.15; // 原 MRt
const MARQUEE_MASK_RIGHT = "linear-gradient(to right, black 0, black calc(100% - 1.5rem), transparent 100%)"; // 原 S8
const MARQUEE_MASK_BOTH = "linear-gradient(to right, transparent 0, black 1.5rem, black calc(100% - 1.5rem), transparent 100%)"; // 原 NRt
/** 原 C8（150993）：跑马灯遮罩样式 */
function marqueeMaskStyle(maskImage: string): React.CSSProperties {
  return { maskImage, WebkitMaskImage: maskImage } as React.CSSProperties;
}
/** 原 w8（150996 / 125026）：文本溢出时悬停触发跑马灯滚动（Web Animations） */
export function OverflowMarqueeText({
  as: Tag = "p",
  children,
  className,
  title,
  ...rest
}: { as?: "p" | "span"; children: React.ReactNode; className?: string; title?: string } & Record<string, unknown>) {
  const outerRef = React.useRef<HTMLElement | null>(null);
  const innerRef = React.useRef<HTMLElement | null>(null);
  const animationRef = React.useRef<HTMLElement | null>(null);
  const [metrics, setMetrics] = React.useState({ distance: 0, duration: MARQUEE_MIN_DURATION_S, isOverflowing: false });
  const { distance, duration, isOverflowing } = metrics;

  // 测量溢出：内容 scrollWidth > 容器 clientWidth 时计算滚动距离/时长
  React.useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      const scrollWidth = inner.scrollWidth;
      const overflowing = scrollWidth > outer.clientWidth;
      const nextDistance = overflowing ? scrollWidth + MARQUEE_GAP_PX : 0;
      const nextDuration = overflowing ? Math.max(MARQUEE_MIN_DURATION_S, nextDistance / MARQUEE_SPEED_PX_PER_S) : MARQUEE_MIN_DURATION_S;
      setMetrics((prev) => (prev.isOverflowing === overflowing && prev.distance === nextDistance && prev.duration === nextDuration
        ? prev
        : { distance: nextDistance, duration: nextDuration, isOverflowing: overflowing }));
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [children]);

  // 悬停动画：行级元素（任务行）进入时启动，离开时停止
  React.useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!isOverflowing || !outer || !inner || typeof inner.animate !== "function") return;
    const reducedMotion = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const row = outer.closest("[data-task-item-key], [data-grouped-task-key]") ?? outer;
    let animations: Animation[] = [];
    let hideTimer: number | null = null;
    const stop = () => {
      if (hideTimer !== null) { window.clearTimeout(hideTimer); hideTimer = null; }
      animations.forEach((animation) => animation.cancel());
      animations = [];
    };
    const start = () => {
      if (reducedMotion?.matches) return;
      stop();
      const total = duration + MARQUEE_PAUSE_S;
      const moveKeyframes: Keyframe[] = [
        { transform: "translateX(0)" },
        { transform: "translateX(-" + distance + "px)" },
      ];
      const animation = inner.animate(moveKeyframes, { duration: total * MARQUEE_REPEAT_THRESHOLD, easing: "linear", iterations: Infinity });
      animations.push(animation);
    };
    row.addEventListener("mouseenter", start);
    row.addEventListener("mouseleave", stop);
    return () => {
      row.removeEventListener("mouseenter", start);
      row.removeEventListener("mouseleave", stop);
      stop();
    };
  }, [isOverflowing, distance, duration]);

  const Component = Tag as unknown as React.ElementType;
  return (
    <Component
      ref={outerRef}
      className={cn("relative min-w-0 overflow-hidden", isOverflowing && MARQUEE_FADE_MASK_CLASS, className)}
      style={isOverflowing ? marqueeMaskStyle(MARQUEE_MASK_RIGHT) : undefined}
      title={title}
      {...rest}
    >
      <span ref={innerRef as React.RefObject<HTMLSpanElement>} className="inline-block w-max min-w-full whitespace-nowrap">
        {children}
      </span>
    </Component>
  );
}
/* ============================================================================
 * 10. 待交互徽章（原 wRt/TRt/b8/ERt，js 150788–150983 / jsx 124887–125009）
 * ==========================================================================*/

/** 原 wRt（150788）：是否为可暂停倒计时的用户输入交互（askUserQuestion / 带自动结束） */
function isSnoozableUserInputInteraction(interaction: TaskInteraction | null | undefined): boolean {
  if (!interaction || interaction.kind !== "userInput") return false;
  return interaction.toolName?.trim().toLowerCase() === "askuserquestion" || interaction.autoResolution !== undefined;
}
type InteractionBadgeModel =
  | { kind: "permission"; canSnooze: boolean }
  | { kind: "userInput"; canSnooze: boolean; countdownProgress?: number };
/** 原 TRt（150793）：徽章视图模型（权限 / 用户输入 + 倒计时进度） */
function resolveInteractionBadgeModel(
  interaction: TaskInteraction | null | undefined,
  legacyPending: boolean,
  now: number,
): InteractionBadgeModel | null {
  if (!interaction) return legacyPending ? { kind: "permission", canSnooze: false } : null;
  if (!isSnoozableUserInputInteraction(interaction)) return { kind: "permission", canSnooze: false };
  const autoResolution = interaction.autoResolution;
  if (!autoResolution) return { kind: "userInput", canSnooze: true };
  if (autoResolution.state === "snoozed") return { kind: "userInput", canSnooze: false };
  if (now < autoResolution.visibleAt) return { kind: "userInput", canSnooze: true };
  const window = Math.max(1, autoResolution.deadlineAt - autoResolution.visibleAt);
  return {
    kind: "userInput",
    countdownProgress: Math.max(0, Math.min(1, (autoResolution.deadlineAt - now) / window)),
    canSnooze: true,
  };
}
/** 原 ERt（150926 / 124970）：侧栏请求暂停自动结束（经会话服务发送暂停命令） */
declare function useSnoozeInteractionCountdown(args: {
  workspacePath: string; workspaceIdentity?: string; remoteSessionId?: string; sessionId: string;
}): (interactionId: string) => Promise<boolean> | boolean;

/* ============================================================================
 * 11. 任务行（原 E8 + LRt，js 151186–151617 / jsx 125140–125351）
 *     未读点/错误点/运行中 loader/闲时点、置顶按钮、归档两步确认、
 *     会话拖拽（HTML5）、待交互徽章、变更统计、定时/闲时图标、相对时间。
 * ==========================================================================*/

interface TaskRowProps {
  workspacePath: string;
  remoteSessionId?: string | null;
  task: TaskMeta;
  isPinned: boolean;
  isActive: boolean;
  isMobileActive?: boolean;
  onSelectTask: (taskId: string) => void;
  onArchiveTaskInline: (event: React.MouseEvent, taskId: string) => void;
  onCancelArchiveConfirm: () => void;
  isArchiveConfirming?: boolean;
  onTogglePinTask: (taskId: string, pinned: boolean) => void;
  onStartRenameTask?: (taskId: string, title: string | undefined) => void;
  onArchiveTask?: (taskId: string) => void;
  onMarkTaskAsUnread?: (taskId: string) => void;
  onOpenTaskContextMenu?: (taskId: string) => void;
  variant?: TaskRowVariant;
  showPinAction?: boolean;
  intl: IntlShape;
  actionsDisabled?: boolean;
  actionsDisabledReason?: string | null;
}

export function TaskRow({
  workspacePath,
  remoteSessionId,
  task,
  isPinned,
  isActive,
  isMobileActive = false,
  onSelectTask,
  onArchiveTaskInline,
  onCancelArchiveConfirm,
  isArchiveConfirming,
  onTogglePinTask,
  onOpenTaskContextMenu,
  variant = "default",
  showPinAction = true,
  intl,
  actionsDisabled = false,
  actionsDisabledReason,
}: TaskRowProps) {
  const [hovered, setHovered] = React.useState(false);
  const rowRef = React.useRef<HTMLLIElement>(null);
  // 本地目录不可用（远程会话掉线且无本地源）→ 行动作禁用
  const directoryUnavailable = useOptionalTabStore((state) => actionsDisabled || isLocalDirectoryUnavailableSelector(state, task.workspacePath, task.workspaceIdentity));
  const disabledReason = directoryUnavailable
    ? actionsDisabledReason ?? intl.formatMessage({ id: "workspaceSidebar.unavailableLocalDirectory" })
    : undefined;
  const snoozeCountdown = useSnoozeInteractionCountdown({
    workspacePath,
    ...(task.workspaceIdentity ? { workspaceIdentity: task.workspaceIdentity } : {}),
    ...(remoteSessionId ? { remoteSessionId } : {}),
    sessionId: task.taskId,
  });

  // 归档两步确认：Escape 或点击行外取消
  React.useEffect(() => {
    if (!isArchiveConfirming) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onCancelArchiveConfirm(); };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && rowRef.current?.contains(target)) return;
      onCancelArchiveConfirm();
    };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [isArchiveConfirming, onCancelArchiveConfirm]);

  const sessionOpenability = useSessionOpenability().enabled;
  const sessionScope = React.useMemo<SessionScope>(() => ({
    workspacePath,
    ...(task.workspaceIdentity?.trim() ? { workspaceIdentity: task.workspaceIdentity } : {}),
    ...(remoteSessionId ? { remoteSessionId } : {}),
    sessionId: task.taskId,
  }), [remoteSessionId, task.workspaceIdentity, workspacePath, task.taskId]);
  const sessionRouteKey = sessionIndexKey(sessionScope, task.taskId);
  const hasSessionRoute = useSessionRouterStore((state) => !!state.sessionIndex[sessionRouteKey]);
  // 可拖拽条件：目录可用 + 分屏打开能力开启 + 尚未在会话索引中
  const draggable = !directoryUnavailable && sessionOpenability && !hasSessionRoute;

  const activity = taskSessionActivity(task);
  const attention = taskPendingAttention(task);
  const hasAttention = !!task.pendingInteraction || attention !== null;
  const attentionLabel = attention
    ? intl.formatMessage({ id: attention.kind === "userInput" ? "taskList.userInputTag" : "taskList.permissionTag" })
    : null;
  const attentionBadgeLabel = attention && attentionLabel && attention.count > 1
    ? intl.formatMessage({ id: "taskList.attentionCount" }, { label: attentionLabel, count: String(attention.count) })
    : attentionLabel;
  const title = task.title || intl.formatMessage({ id: task.forkedFromTaskId ? "taskList.forkedUntitled" : "taskList.untitled" });

  const handleSelect = React.useCallback(() => { onSelectTask(task.taskId); }, [onSelectTask, task.taskId]);
  const handleDragStart = React.useCallback((event: React.DragEvent<HTMLLIElement>) => {
    if (!draggable) { event.preventDefault(); return; }
    event.dataTransfer.effectAllowed = "copy";
    const payload: SessionDragPayload = {
      kind: "zcode/session",
      workspacePath,
      ...(task.workspaceIdentity?.trim() ? { workspaceIdentity: task.workspaceIdentity } : {}),
      ...(remoteSessionId ? { remoteSessionId } : {}),
      sessionId: task.taskId,
    };
    setCurrentSessionDrag(payload);
    event.dataTransfer.setData(SESSION_DRAG_MIME, serializeSessionDragPayload(payload));
    event.dataTransfer.setData("text/plain", title);
    const updateDragImage = createDragImageUpdater({
      clientX: event.clientX, clientY: event.clientY, dataTransfer: event.dataTransfer, source: event.currentTarget,
    });
    const ownerWindow = event.currentTarget.ownerDocument.defaultView;
    if (ownerWindow) ownerWindow.requestAnimationFrame(updateDragImage);
    else updateDragImage();
  }, [draggable, remoteSessionId, task.taskId, task.workspaceIdentity, title, workspacePath]);
  const handleDragEnd = React.useCallback(() => { clearCurrentSessionDrag(); }, []);
  const handleContextMenu = React.useCallback(() => { onOpenTaskContextMenu?.(task.taskId); }, [onOpenTaskContextMenu, task.taskId]);
  const handleArchiveInline = React.useCallback((event: React.MouseEvent) => {
    if (directoryUnavailable) { event.preventDefault(); event.stopPropagation(); return; }
    onArchiveTaskInline(event, task.taskId);
  }, [onArchiveTaskInline, task.taskId, directoryUnavailable]);
  const handleTogglePin = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!directoryUnavailable) onTogglePinTask(task.taskId, !isPinned);
  }, [isPinned, onTogglePinTask, task.taskId, directoryUnavailable]);

  const indicator = resolveTaskIndicator(task, activity);
  const isCron = isCronTask(task);
  const isOffPeak = isOffPeakTask(task);
  const isTimelineVariant = variant === "timeline";
  const showIdleDot = isTimelineVariant && indicator === "none" && !isPinned; // 时间线空态点
  const showPinnedPin = isPinned && indicator === "none" && !isMobileActive;   // 置顶常显钉
  const relativeTime = formatRelativeTime(task.updatedAt, intl);
  const changeSummary = taskChangeSummary(task);
  const hasWorkspaceIdentity = !!task.workspaceIdentity?.trim();
  const archiveLabel = intl.formatMessage({ id: isArchiveConfirming ? "common.confirm" : "taskList.archive" });
  const titleWithStats = titleWithChangeStats(title, changeSummary, intl);
  const workspaceLabel = workspaceBaseName(task.workspacePath);
  const taskItemKey = workspaceKey(task.workspacePath, task.workspaceIdentity) + ":" + task.taskId;

  const changeStatsElement = !hasAttention && changeSummary ? (
    <span className="shrink-0 text-ui-base">
      {changeSummary.added > 0 ? <span className="text-diff-added">{"+"}{changeSummary.added}</span> : null}
      {changeSummary.removed > 0 ? <span className="ml-1 text-diff-removed">{"-"}{changeSummary.removed}</span> : null}
    </span>
  ) : null;
  const showHoverActions = !directoryUnavailable && !hasAttention && (hovered || isArchiveConfirming);
  const archiveVisibilityClass = isArchiveConfirming ? "flex" : "hidden group-hover/task-item:flex";
  // 归档按钮：确认中=红色确认钮；远程工作区=云上传图标，本地=归档盒图标
  const archiveElement = showHoverActions ? (
    <div className={cn("items-center gap-0.5", archiveVisibilityClass)}>
      <Tooltip title={archiveLabel} side="right" align="center">
        <Button
          type="button"
          variant={isArchiveConfirming ? "destructive" : "ghost"}
          size={isArchiveConfirming ? "sm" : "icon-sm"}
          onMouseDown={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={handleArchiveInline}
          data-testid={scopedTestId(TESTID_TASK_ARCHIVE, task.taskId)}
          className={cn("shrink-0", archiveVisibilityClass, isArchiveConfirming ? "border-destructive/20 px-2" : "text-foreground hover:bg-background/90 hover:text-foreground")}
          aria-label={archiveLabel}
        >
          {isArchiveConfirming ? (
            <span>{intl.formatMessage({ id: "common.confirm" })}</span>
          ) : hasWorkspaceIdentity ? (
            <IconCloudUpload className="h-3.5 w-3.5" />
          ) : (
            <IconArchive className="h-3.5 w-3.5" />
          )}
        </Button>
      </Tooltip>
    </div>
  ) : null;
  // 置顶钉：悬停显示；置顶且无指示器时常显
  const pinElement = (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      disabled={directoryUnavailable}
      onMouseDown={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); }}
      onClick={handleTogglePin}
      className={cn(
        "hidden size-4 min-w-0 rounded-sm p-0 text-foreground-subtle !bg-transparent hover:text-foreground",
        "group-hover/task-item:inline-flex",
        showPinnedPin && "inline-flex",
      )}
      aria-label={intl.formatMessage({ id: isPinned ? "taskList.unpin" : "taskList.pin" })}
    >
      <IconPin className="size-4" />
    </Button>
  );

  return (
    <li
      ref={rowRef}
      data-testid={scopedTestId(TESTID_TASK_ITEM, task.taskId)}
      data-task-item-key={taskItemKey}
      data-mobile-active-task={isMobileActive ? "true" : undefined}
      data-archive-confirming-task-id={isArchiveConfirming ? task.taskId : undefined}
      onClick={handleSelect}
      onContextMenu={handleContextMenu}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group/task-item flex cursor-pointer gap-2 rounded-lg pl-2.5 pr-1 py-1 transition-[background-color,border-color,box-shadow]",
        isTimelineVariant ? "items-start py-1.5" : "items-center",
        isActive ? "bg-selected" : "hover:bg-surface-hover",
      )}
    >
      {/* 状态点/置顶钉 槽位 */}
      <div className={cn("relative flex size-4 shrink-0 items-center justify-center", isTimelineVariant && "mt-0.5")}>
        <span aria-hidden="true" className={cn("flex size-4 items-center justify-center transition-opacity group-hover/task-item:hidden", isMobileActive && "invisible")}>
          {indicator === "error" ? (
            <span data-error-indicator="true" className="h-1.5 w-1.5 rounded-full bg-destructive" />
          ) : indicator === "unread" ? (
            <span data-unread-indicator="true" className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
          ) : indicator === "loading" ? (
            <IconLoader className="size-4 animate-spin text-foreground-subtle" />
          ) : showIdleDot ? (
            <span data-idle-indicator="true" className="h-1.5 w-1.5 rounded-full bg-border" />
          ) : null}
        </span>
        {showPinAction && disabledReason ? <Tooltip title={disabledReason}>{pinElement}</Tooltip> : showPinAction ? pinElement : null}
      </div>

      {isTimelineVariant ? (
        /* 时间线变体：双行（标题行 + 工作区/时间行） */
        <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-1.5">
            {isMobileActive ? (
              <Tooltip title={intl.formatMessage({ id: "taskList.mobileActive" })} side="right" align="center"
                triggerClassName="absolute -left-6 top-2 z-10 -translate-y-1/2 group-hover/task-item:hidden">
                <span data-mobile-active-task="true" className="inline-flex size-4 items-center justify-center rounded-sm text-success"
                  aria-label={intl.formatMessage({ id: "taskList.mobileActive" })}>
                  <IconSmartphone className="size-3.5" />
                </span>
              </Tooltip>
            ) : null}
            <OverflowMarqueeText className="text-ui-base text-foreground" title={titleWithStats}>{title}</OverflowMarqueeText>
            {task.pendingInteraction ? (
              <TaskInteractionBadge interaction={task.pendingInteraction} formatMessage={(id) => intl.formatMessage({ id })} onSnoozeCountdown={snoozeCountdown} />
            ) : attentionBadgeLabel ? (
              <Badge className="h-5 shrink-0 border-transparent bg-success/14 px-2 text-ui-base font-medium text-success dark:bg-success/18">{attentionBadgeLabel}</Badge>
            ) : null}
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2 text-ui-base text-foreground-subtle h-6">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate">{workspaceLabel}</span>
            </div>
            <div className="ml-auto flex shrink-0 items-center justify-end gap-1.5">
              {hasAttention ? null : (
                <span className={cn("flex items-center gap-1.5", isArchiveConfirming ? "hidden" : "group-hover/task-item:hidden")}>
                  {changeStatsElement}
                  {changeStatsElement ? <span aria-hidden="true" className="shrink-0 text-foreground-subtlest">{"·"}</span> : null}
                  {isCron ? (
                    <IconClock data-cron-task-icon="true" aria-label={intl.formatMessage({ id: "taskList.cronTaskLabel" })} className="size-3.5 shrink-0" />
                  ) : isOffPeak ? (
                    <IconMoon data-off-peak-task-icon="true" aria-label={intl.formatMessage({ id: "taskList.offPeakTaskLabel" })} className="size-3.5 shrink-0" />
                  ) : null}
                  <span className="mr-1">{relativeTime}</span>
                </span>
              )}
              {archiveElement}
            </div>
          </div>
        </div>
      ) : (
        /* 默认变体：单行（标题 + 统计 + 徽章 + 时间） */
        <>
          <div className="relative min-w-0 flex h-6 flex-1 flex-wrap items-center gap-1.5">
            {isMobileActive ? (
              <Tooltip title={intl.formatMessage({ id: "taskList.mobileActive" })} side="right" align="center"
                triggerClassName="absolute -left-6 top-1/2 z-10 -translate-y-1/2 group-hover/task-item:hidden">
                <span data-mobile-active-task="true" className="inline-flex size-4 items-center justify-center rounded-sm text-success"
                  aria-label={intl.formatMessage({ id: "taskList.mobileActive" })}>
                  <IconSmartphone className="size-3.5" />
                </span>
              </Tooltip>
            ) : null}
            <OverflowMarqueeText className="text-ui-base text-foreground" title={titleWithStats}>{title}</OverflowMarqueeText>
            {changeStatsElement ? <span className={cn(isArchiveConfirming ? "hidden" : "group-hover/task-item:hidden")}>{changeStatsElement}</span> : null}
            {task.pendingInteraction ? (
              <TaskInteractionBadge interaction={task.pendingInteraction} formatMessage={(id) => intl.formatMessage({ id })} onSnoozeCountdown={snoozeCountdown} />
            ) : attentionBadgeLabel ? (
              <Badge className="h-5 shrink-0 border-transparent bg-success/14 px-2 text-ui-sm font-medium text-success dark:bg-success/18">{attentionBadgeLabel}</Badge>
            ) : null}
          </div>
          {hasAttention ? null : (
            <span className={cn("mr-0.5 flex shrink-0 items-center gap-1 text-ui-sm text-foreground-subtle", isArchiveConfirming ? "hidden" : "group-hover/task-item:hidden")}>
              {isCron ? (
                <IconClock data-cron-task-icon="true" aria-label={intl.formatMessage({ id: "taskList.cronTaskLabel" })} className="size-3.5 shrink-0" />
              ) : isOffPeak ? (
                <IconMoon data-off-peak-task-icon="true" aria-label={intl.formatMessage({ id: "taskList.offPeakTaskLabel" })} className="size-3.5 shrink-0" />
              ) : null}
              {relativeTime}
            </span>
          )}
          {archiveElement}
        </>
      )}
    </li>
  );
}
/** 原 LRt（151162 / 125125）：memo 比较器——任务对象/激活态/回调引用变化才重渲 */
function taskRowPropsAreEqual(prev: Readonly<TaskRowProps>, next: Readonly<TaskRowProps>): boolean {
  return (
    prev.task === next.task &&
    prev.isPinned === next.isPinned &&
    prev.isActive === next.isActive &&
    prev.isMobileActive === next.isMobileActive &&
    prev.isArchiveConfirming === next.isArchiveConfirming &&
    prev.variant === next.variant &&
    prev.showPinAction === next.showPinAction &&
    prev.actionsDisabled === next.actionsDisabled &&
    prev.actionsDisabledReason === next.actionsDisabledReason &&
    prev.workspacePath === next.workspacePath &&
    prev.remoteSessionId === next.remoteSessionId &&
    prev.intl === next.intl &&
    prev.onSelectTask === next.onSelectTask &&
    prev.onArchiveTaskInline === next.onArchiveTaskInline &&
    prev.onCancelArchiveConfirm === next.onCancelArchiveConfirm &&
    prev.onTogglePinTask === next.onTogglePinTask &&
    prev.onOpenTaskContextMenu === next.onOpenTaskContextMenu
  );
}
/** 原 (0,Q.memo)(E8, LRt)：任务行记忆化组件（props 浅比较见上） */
export const MemoTaskItem = React.memo(TaskRow, taskRowPropsAreEqual);
/* ============================================================================
 * 12. 任务右键菜单（原 CRt/D8/dzt，js 150732–153597 / jsx 124828–127059）
 * ==========================================================================*/

/** 原 M8（153598 / 127060）：行内图标按钮（可选纯 CSS tooltip，避免弹层抖动） */
export function TaskRowActionButton({
  label, children, onClick, showTooltip = false, disabledReason,
}: { label: string; children: React.ReactNode; onClick: (e: React.MouseEvent) => void; showTooltip?: boolean; disabledReason?: string }) {
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={!!disabledReason}
      onMouseDown={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); }}
      onPointerDown={(e: React.PointerEvent) => { e.preventDefault(); e.stopPropagation(); }}
      onClick={(e: React.MouseEvent) => { if (!disabledReason) onClick(e); }}
      aria-label={label}
    >
      {children}
    </Button>
  );
  return showTooltip ? (
    <span className="group/task-action-tooltip relative inline-flex shrink-0">
      {button}
      <span
        data-task-row-action-tooltip="true"
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-0.5 w-max max-w-48 -translate-x-1/2 rounded-lg border border-border bg-tooltip px-2.5 py-1 text-ui-sm font-medium whitespace-normal text-tooltip-foreground opacity-0 transition-opacity group-hover/task-action-tooltip:visible group-hover/task-action-tooltip:opacity-100 group-focus-within/task-action-tooltip:visible group-focus-within/task-action-tooltip:opacity-100"
      >
        {disabledReason ?? label}
      </span>
    </span>
  ) : button;
}

/** 原 CRt（150732 / 124828）：任务操作右键菜单壳——把 TopBar 族的 TaskActionMenuItems
 *  注入 ContextMenu 原语（复用于置顶段/时间线段/工作区列表）。 */
export function TaskActionContextMenuContent(props: Omit<TaskActionMenuItemsProps, "Item" | "Separator">) {
  return (
    <ContextMenuContent className="w-52">
      <TaskActionMenuItems {...props} Item={ContextMenuItem} Separator={ContextMenuSeparator} />
    </ContextMenuContent>
  );
}

interface TaskRowContextMenuProps {
  workspacePath: string;
  remoteSessionId?: string | null;
  task: TaskMeta;
  isPinned: boolean;
  intl: IntlShape;
  onTogglePinTask: (taskId: string, pinned: boolean) => void;
  onStartRenameTask: (taskId: string, title: string | undefined) => void;
  onArchiveTask: (taskId: string) => void;
  onMarkTaskAsUnread: (taskId: string) => void;
  disableTaskActions?: boolean;
  disabledReason?: string | null;
}
/** 原 D8（151618 / 125352）：任务行右键菜单内容——接线文件动作、反馈、轨迹、分屏打开 */
export function TaskRowContextMenuContent({
  workspacePath, remoteSessionId, task, isPinned, intl,
  onTogglePinTask, onStartRenameTask, onArchiveTask, onMarkTaskAsUnread,
  disableTaskActions = false, disabledReason,
}: TaskRowContextMenuProps) {
  const platformService = usePlatformService();
  const directoryUnavailable = useOptionalTabStore((state) => disableTaskActions || isLocalDirectoryUnavailableSelector(state, task.workspacePath, task.workspaceIdentity));
  const effectiveDisabledReason = directoryUnavailable
    ? disabledReason ?? intl.formatMessage({ id: "workspaceSidebar.unavailableLocalDirectory" })
    : undefined;
  const openability = useSessionOpenability();
  const splitOpenEnabled = openability.enabled;
  const sessionScope = React.useMemo<SessionScope>(() => ({
    workspacePath,
    ...(task.workspaceIdentity?.trim() ? { workspaceIdentity: task.workspaceIdentity } : {}),
    ...(remoteSessionId ? { remoteSessionId } : {}),
    sessionId: task.taskId,
  }), [remoteSessionId, task.taskId, task.workspaceIdentity, workspacePath]);
  const canSplitOpen = openability.canOpenSession(sessionScope);
  const openFeedbackSubmit = useFeedbackStore((state) => state.openSubmit);
  const {
    taskSessionFile, taskNativeSessionLogFile, providerConfigFile,
    fileManagerLabel, handleCopyText, handleOpenTaskPathInFileManager, handleOpenProviderConfig,
  } = useTaskFileActions({
    workspacePath, remoteSessionId, workspaceIdentity: task.workspaceIdentity,
    taskId: task.taskId, provider: task.provider, intl, loadTaskPaths: true, loadProviderConfig: true,
  });
  const title = task.title || intl.formatMessage({ id: task.forkedFromTaskId ? "taskList.forkedUntitled" : "taskList.untitled" });
  // 「任务反馈」：预填反馈中心（bug/P2 + 任务描述 + 窗口截图）
  const openTaskFeedback = React.useCallback(async () => {
    const screenshot = (await platformService?.captureWindowScreenshot?.().catch(() => null)) ?? null;
    openFeedbackSubmit({
      title: intl.formatMessage({ id: "feedback.submit.template.section.taskFeedbackTitle" }, { title }).slice(0, 80),
      type: "bug",
      module: "Agent任务执行失败",
      severity: "P2-中",
      includeLogs: true,
      description: buildTaskFeedbackDescription({
        taskTitle: title, taskId: task.taskId, workspacePath,
        taskSessionPath: taskSessionFile.path, taskLogPath: taskNativeSessionLogFile.path,
        formatMessage: (id, values) => intl.formatMessage({ id }, values),
      }),
      screenshots: screenshot ? [screenshot] : [],
    });
    toast(intl.formatMessage({ id: "taskList.feedbackOpened" }));
  }, [intl, openFeedbackSubmit, platformService, task.taskId, taskNativeSessionLogFile.path, taskSessionFile.path, title, workspacePath]);

  return (
    <TaskActionContextMenuContent
      intl={intl}
      isPinned={isPinned}
      fileManagerLabel={fileManagerLabel}
      taskSessionFile={taskSessionFile}
      activeSessionId={task.taskId}
      taskNativeSessionLogFile={taskNativeSessionLogFile}
      providerConfigFile={providerConfigFile}
      disableTaskActions={directoryUnavailable}
      disabledReason={effectiveDisabledReason}
      onTogglePinTask={() => { onTogglePinTask(task.taskId, !isPinned); }}
      onStartRenameTask={() => { onStartRenameTask(task.taskId, task.title); }}
      onArchiveTask={() => { onArchiveTask(task.taskId); }}
      onMarkTaskAsUnread={() => { onMarkTaskAsUnread(task.taskId); }}
      onOpenInSplitPane={splitOpenEnabled ? () => { openability.openSession(sessionScope); } : undefined}
      openInSplitPaneDisabled={directoryUnavailable || !canSplitOpen}
      onOpenTaskFeedback={() => { void openTaskFeedback(); }}
      onOpenTaskPathInFileManager={() => { handleOpenTaskPathInFileManager(); }}
      onCopyWorkspacePath={() => { handleCopyText(intl.formatMessage({ id: "appHeader.copyPath" }), workspacePath); }}
      onCopyTaskPath={() => { handleCopyText(intl.formatMessage({ id: "appHeader.copyTaskPath" }), taskSessionFile.path); }}
      onCopyTaskLogPath={() => { handleCopyText(intl.formatMessage({ id: "appHeader.copyLogPath" }), taskNativeSessionLogFile.path); }}
      onCopySessionId={() => { handleCopyText(intl.formatMessage({ id: "appHeader.copySessionId" }), task.taskId); }}
      onViewModelTrajectory={() => {
        useTrajectoryViewerStore.getState().requestOpen({
          taskId: task.taskId,
          workspaceKey: task.workspaceIdentity?.trim() || workspacePath,
          title,
        });
      }}
      onOpenProviderConfig={() => { handleOpenProviderConfig(); }}
    />
  );
}
/* ============================================================================
 * 16. 置顶任务段（原 BRt，js 151757–152243 / jsx 125480–125893）
 *     置顶任务 = 本地 useTaskListItems(pinned) + 远端 E6 store 合并，
 *     上限 20 条 + 展开/收起；右键/行内动作与时间线段同一套乐观更新。
 * ==========================================================================*/

/** 原 RRt/VRt（151748/152244）：任务行键 `workspaceKey:taskId` */
function taskRowKey(workspacePath: string, taskId: string, workspaceIdentity?: string | null): string {
  return workspaceKey(workspacePath, workspaceIdentity) + ":" + taskId;
}
/** 原 z8（155354 / 128339）：分组视图指纹（结构相等性快速比较；接口） */
declare function groupedNodeFingerprint(view: GroupedView): string;
/** 原 eBt（155361 / 128260）：拖拽浮层落回动画配置 */
declare const groupedDropAnimation: unknown;
/** 原 tBt（155361 / 128264）：dnd autoScroll 阈值配置 */
declare const groupedAutoScrollThreshold: unknown;
/** 原 Tse（jsx 3269）：按工作区身份解析远端会话服务 */
declare function resolveServicesByWorkspaceIdentity(workspaceIdentity: string | null | undefined): WorkspaceServices | null;

export function PinnedTasksSection({
  workspaceTabs, activeWorkspacePath, activeWorkspaceIdentity, activeTaskId, taskSortBy, mobileActiveTaskKey, onSelectTask,
}: {
  workspaceTabs: WorkspaceTab[];
  activeWorkspacePath: string;
  activeWorkspaceIdentity?: string | null;
  activeTaskId: string | null;
  taskSortBy: TaskSortBy;
  mobileActiveTaskKey?: string | null;
  onSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
}) {
  const { intl } = useIntlContext();
  const baseServices = useBaseServices();
  const scopedWorkspaceTabs = useScopedWorkspaceTabs({ workspaceTabs });
  const sessionIdByWorkspaceIdentity = useSessionRegistryStore((state) => state.sessionIdByWorkspaceIdentity);
  const removeTaskState = useTaskStore((state) => state.removeTaskState);
  const upsertOptimisticTaskListItem = useTaskStore((state) => state.upsertOptimisticTaskListItem);
  const removeOptimisticTaskListItem = useTaskStore((state) => state.removeOptimisticTaskListItem);
  const setTaskUnreadIndicator = useTaskStore((state) => state.setTaskUnreadIndicator);
  const [archiveConfirmingKey, setArchiveConfirmingKey] = React.useState<string | null>(null);
  const [renamingTaskKey, setRenamingTaskKey] = React.useState<string | null>(null);
  const [contextMenuTaskKey, setContextMenuTaskKey] = React.useState<string | null>(null);
  const [renameDraft, setRenameDraft] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);
  const renameInputRef = React.useRef<HTMLInputElement>(null);
  const archiveConfirmingRef = React.useRef(archiveConfirmingKey);
  const sortByRef = React.useRef(taskSortBy);
  const intlRef = React.useRef(intl);
  const onSelectTaskRef = React.useRef(onSelectTask);
  archiveConfirmingRef.current = archiveConfirmingKey;
  sortByRef.current = taskSortBy;
  intlRef.current = intl;
  onSelectTaskRef.current = onSelectTask;

  const { items: localPinnedItems } = useTaskListItems({ kind: "pinned", workspaceTabs: scopedWorkspaceTabs, sortBy: taskSortBy, searchQuery: "", expanded: true, collapsedLimit: 20 });
  const remoteItemsByWorkspaceKey = useRemotePinnedTaskListStore((state) => state.itemsByWorkspaceKey);
  const remoteLoadingByWorkspaceKey = useRemotePinnedTaskListStore((state) => state.loadingByWorkspaceKey);
  // 远端条目：仅远程工作区（有身份/远端目标/远端会话）
  const remoteWorkspaceKeys = React.useMemo(
    () => [...new Set(workspaceTabs.filter((tab) => tab.workspaceIdentity || tab.remoteTarget || tab.remoteSessionId).map((tab) => workspaceKey(tab.workspacePath, tab.workspaceIdentity)))],
    [workspaceTabs],
  );
  const remoteItems = React.useMemo(() => remoteWorkspaceKeys.flatMap((key) => remoteItemsByWorkspaceKey[key] ?? []), [remoteItemsByWorkspaceKey, remoteWorkspaceKeys]);
  const allItems = React.useMemo(() => [...localPinnedItems, ...remoteItems].sort((a, b) => compareTasksForList(a, b, taskSortBy)), [localPinnedItems, remoteItems, taskSortBy]);
  const visibleItems = expanded ? allItems : allItems.slice(0, 20);
  const totalCount = allItems.length;
  const isRemoteLoading = workspaceTabs.some((tab) =>
    !tab.workspaceIdentity && !tab.remoteTarget && !tab.remoteSessionId ? false : !!remoteLoadingByWorkspaceKey[workspaceKey(tab.workspacePath, tab.workspaceIdentity)],
  );
  const hasMoreThanLimit = totalCount > 20;
  const pinnedSectionTitle = intl.formatMessage({ id: "taskList.pinnedSection" });
  const activeWorkspaceKey = workspaceKey(activeWorkspacePath, activeWorkspaceIdentity);
  const itemsByKey = React.useMemo(() => {
    const map = new Map<string, TaskMeta>();
    for (const item of visibleItems) map.set(taskRowKey(item.workspacePath, item.taskId, item.workspaceIdentity), item);
    return map;
  }, [visibleItems]);

  const servicesOf = React.useCallback((workspaceIdentity: string | null | undefined) => {
    const remote = workspaceIdentity ? resolveServicesByWorkspaceIdentity(workspaceIdentity) : null;
    return remote ?? (baseServices as unknown as WorkspaceServices | null);
  }, [baseServices]);

  /* ---- 动作（乐观更新，失败 toast） ---- */
  const archivePinnedTask = React.useCallback((rowKey: string) => {
    const item = itemsByKey.get(rowKey);
    if (!item) return;
    const services = servicesOf(item.workspaceIdentity);
    if (!services) return;
    services.zcodeTaskService.archiveTask({
      taskId: item.taskId, workspacePath: item.workspacePath,
      ...(item.workspaceIdentity ? { workspaceIdentity: item.workspaceIdentity } : {}),
    }).then((archived) => {
      removeTaskState(item.workspacePath, item.taskId, item.workspaceIdentity);
      if (item.workspaceIdentity) {
        useRemotePinnedTaskListStore.getState().removeTask(item.workspacePath, item.taskId, item.workspaceIdentity);
        useRemoteWorkspaceTaskListStore.getState().removeTask(item.workspacePath, item.taskId, item.workspaceIdentity);
      }
      applyOptimisticTaskMutation({ previousTask: item, nextTask: archived, previousState: { pinned: true, archived: false }, nextState: { pinned: false, archived: true } });
    });
  }, [itemsByKey, removeTaskState, servicesOf]);
  const selectPinnedTask = React.useCallback((rowKey: string) => {
    const item = itemsByKey.get(rowKey);
    if (item) onSelectTaskRef.current(item.workspacePath, item.taskId, item.workspaceIdentity);
  }, [itemsByKey]);
  const handleArchiveInline = React.useCallback((event: React.MouseEvent, rowKey: string) => {
    event.stopPropagation();
    if (archiveConfirmingRef.current !== rowKey) { setArchiveConfirmingKey(rowKey); return; }
    setArchiveConfirmingKey(null);
    archivePinnedTask(rowKey);
  }, [archivePinnedTask]);
  const togglePinnedTaskPin = React.useCallback((rowKey: string, pinned: boolean) => {
    const item = itemsByKey.get(rowKey);
    if (!item) return;
    const services = servicesOf(item.workspaceIdentity);
    if (!services) return;
    // 乐观：置顶↔普通 两个远端 store 间搬家
    if (item.workspaceIdentity && pinned) {
      useRemotePinnedTaskListStore.getState().removeTask(item.workspacePath, item.taskId, item.workspaceIdentity);
      useRemoteWorkspaceTaskListStore.getState().upsertTask(item, sortByRef.current);
    }
    applyOptimisticTaskMutation({ previousTask: item, nextTask: item, previousState: { pinned: true, archived: false }, nextState: { pinned, archived: false } });
    services.zcodeTaskService.setTaskPinned({
      taskId: item.taskId, workspacePath: item.workspacePath,
      ...(item.workspaceIdentity ? { workspaceIdentity: item.workspaceIdentity } : {}),
      pinned,
    }).then((updated) => {
      removeOptimisticTaskListItem(item.workspacePath, item.taskId, item.workspaceIdentity);
      if (item.workspaceIdentity && pinned) {
        useRemotePinnedTaskListStore.getState().upsertTask(updated);
        useRemoteWorkspaceTaskListStore.getState().removeTask(item.workspacePath, item.taskId, item.workspaceIdentity);
      }
      if (item.workspaceIdentity && !pinned) useRemoteWorkspaceTaskListStore.getState().upsertTask(updated, sortByRef.current);
      applyOptimisticTaskMutation({ previousTask: item, nextTask: updated, previousState: { pinned, archived: false }, nextState: { pinned, archived: false } });
    }).catch(() => {
      if (item.workspaceIdentity) {
        useRemotePinnedTaskListStore.getState().upsertTask(item);
        useRemoteWorkspaceTaskListStore.getState().removeTask(item.workspacePath, item.taskId, item.workspaceIdentity);
      }
      applyOptimisticTaskMutation({ previousTask: item, nextTask: item, previousState: { pinned, archived: false }, nextState: { pinned: true, archived: false } });
      toast(intlRef.current.formatMessage({ id: "taskList.pinFailed" }));
    });
  }, [itemsByKey, removeOptimisticTaskListItem, servicesOf]);
  const startPinnedTaskRename = React.useCallback((rowKey: string, title: string | undefined) => {
    setArchiveConfirmingKey(null);
    setRenamingTaskKey(rowKey);
    setRenameDraft(title ?? "");
  }, []);
  const markPinnedTaskUnread = React.useCallback((rowKey: string) => {
    const item = itemsByKey.get(rowKey);
    if (!item) return;
    const services = servicesOf(item.workspaceIdentity);
    if (!services) return;
    services.zcodeTaskService.setTaskUnread({
      taskId: item.taskId, workspacePath: item.workspacePath,
      ...(item.workspaceIdentity ? { workspaceIdentity: item.workspaceIdentity } : {}),
      unread: true,
    }).then((updated) => {
      setTaskUnreadIndicator(item.workspacePath, item.taskId, true, item.workspaceIdentity);
      upsertOptimisticTaskListItem(item.workspacePath, updated, item.workspaceIdentity);
      if (item.workspaceIdentity) useRemotePinnedTaskListStore.getState().upsertTask(updated);
      applyOptimisticTaskMutation({ previousTask: item, nextTask: updated, previousState: { pinned: true, archived: false }, nextState: { pinned: true, archived: false } });
    });
  }, [itemsByKey, servicesOf, setTaskUnreadIndicator, upsertOptimisticTaskListItem]);
  const openContextMenu = React.useCallback((rowKey: string) => {
    if (archiveConfirmingRef.current === rowKey) setArchiveConfirmingKey(null);
    setContextMenuTaskKey(rowKey);
  }, []);
  // 行回调缓存（按键复用，避免每行重建闭包）
  const rowActionCacheRef = React.useRef(new Map<string, Record<string, unknown>>());
  const getRowActions = React.useCallback((rowKey: string) => {
    let actions = rowActionCacheRef.current.get(rowKey);
    if (!actions) {
      actions = {
        onSelectTask: () => { selectPinnedTask(rowKey); },
        onArchiveTaskInline: (event: React.MouseEvent) => { handleArchiveInline(event, rowKey); },
        onTogglePinTask: (_taskId: string, pinned: boolean) => { togglePinnedTaskPin(rowKey, pinned); },
        onStartRenameTask: (_taskId: string, title: string | undefined) => { startPinnedTaskRename(rowKey, title); },
        onArchiveTask: () => { archivePinnedTask(rowKey); },
        onMarkTaskAsUnread: () => { markPinnedTaskUnread(rowKey); },
        onOpenTaskContextMenu: () => { openContextMenu(rowKey); },
      };
      rowActionCacheRef.current.set(rowKey, actions);
    }
    return actions;
  }, [archivePinnedTask, handleArchiveInline, markPinnedTaskUnread, openContextMenu, selectPinnedTask, startPinnedTaskRename, togglePinnedTaskPin]);

  React.useEffect(() => {
    if (renamingTaskKey) { renameInputRef.current?.focus(); renameInputRef.current?.select(); }
  }, [renamingTaskKey]);
  React.useEffect(() => {
    if (contextMenuTaskKey && !itemsByKey.get(contextMenuTaskKey)) setContextMenuTaskKey(null);
  }, [contextMenuTaskKey, itemsByKey]);
  React.useEffect(() => {
    for (const key of rowActionCacheRef.current.keys()) if (!itemsByKey.has(key)) rowActionCacheRef.current.delete(key);
  }, [itemsByKey]);

  const contextMenuItem = contextMenuTaskKey ? itemsByKey.get(contextMenuTaskKey) ?? null : null;
  if (visibleItems.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 px-2 empty:hidden">
      {renamingTaskKey === null ? null : (
        <TaskRenameDialog
          open
          value={renameDraft}
          inputRef={renameInputRef}
          intl={intl}
          onOpenChange={(open) => { if (!open) { setRenamingTaskKey(null); setRenameDraft(""); } }}
          onChange={setRenameDraft}
          onCancel={() => { setRenamingTaskKey(null); setRenameDraft(""); }}
          onConfirm={() => {
            if (!renamingTaskKey) return;
            const item = itemsByKey.get(renamingTaskKey);
            const services = item ? servicesOf(item.workspaceIdentity) : null;
            if (!item || !services) { setRenamingTaskKey(null); setRenameDraft(""); return; }
            services.zcodeTaskService.renameTask({
              taskId: item.taskId, workspacePath: item.workspacePath,
              ...(item.workspaceIdentity ? { workspaceIdentity: item.workspaceIdentity } : {}),
              title: renameDraft.trim(),
            }).then((updated) => {
              upsertOptimisticTaskListItem(item.workspacePath, updated, item.workspaceIdentity);
              if (item.workspaceIdentity) useRemotePinnedTaskListStore.getState().upsertTask(updated);
              applyOptimisticTaskMutation({ previousTask: item, nextTask: updated, previousState: { pinned: true, archived: false }, nextState: { pinned: true, archived: false } });
              setRenamingTaskKey(null);
              setRenameDraft("");
            }).catch(() => { toast(intl.formatMessage({ id: "taskList.renameFailed" })); });
          }}
        />
      )}
      <SectionTitle title={pinnedSectionTitle} />
      <ContextMenu onOpenChange={(open) => { if (!open) setContextMenuTaskKey(null); }}>
        <ContextMenuTrigger asChild>
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              const rowKey = taskRowKey(item.workspacePath, item.taskId, item.workspaceIdentity);
              if (!servicesOf(item.workspaceIdentity)) return null;
              const actions = getRowActions(rowKey);
              return (
                <MemoTaskItem
                  key={rowKey}
                  workspacePath={item.workspacePath}
                  remoteSessionId={item.workspaceIdentity ? sessionIdByWorkspaceIdentity[item.workspaceIdentity] : undefined}
                  task={item}
                  isPinned
                  isActive={workspaceKey(item.workspacePath, item.workspaceIdentity) === activeWorkspaceKey && item.taskId === activeTaskId}
                  isMobileActive={mobileActiveTaskKey === rowKey}
                  onSelectTask={actions.onSelectTask as (taskId: string) => void}
                  onArchiveTaskInline={actions.onArchiveTaskInline as (event: React.MouseEvent, taskId: string) => void}
                  onCancelArchiveConfirm={() => setArchiveConfirmingKey(null)}
                  isArchiveConfirming={archiveConfirmingKey === rowKey}
                  onTogglePinTask={actions.onTogglePinTask as (taskId: string, pinned: boolean) => void}
                  onStartRenameTask={actions.onStartRenameTask as (taskId: string, title: string | undefined) => void}
                  onArchiveTask={actions.onArchiveTask as (taskId: string) => void}
                  onMarkTaskAsUnread={actions.onMarkTaskAsUnread as (taskId: string) => void}
                  onOpenTaskContextMenu={actions.onOpenTaskContextMenu as (taskId: string) => void}
                  intl={intl}
                />
              );
            })}
          </ul>
        </ContextMenuTrigger>
        {contextMenuItem ? (
          <TaskRowContextMenuContent
            workspacePath={contextMenuItem.workspacePath}
            remoteSessionId={contextMenuItem.workspaceIdentity ? sessionIdByWorkspaceIdentity[contextMenuItem.workspaceIdentity] : undefined}
            task={contextMenuItem}
            isPinned
            intl={intl}
            onTogglePinTask={(taskId, pinned) => togglePinnedTaskPin(taskRowKey(contextMenuItem.workspacePath, taskId, contextMenuItem.workspaceIdentity), pinned)}
            onStartRenameTask={(taskId, title) => startPinnedTaskRename(taskRowKey(contextMenuItem.workspacePath, taskId, contextMenuItem.workspaceIdentity), title)}
            onArchiveTask={() => archivePinnedTask(taskRowKey(contextMenuItem.workspacePath, contextMenuItem.taskId, contextMenuItem.workspaceIdentity))}
            onMarkTaskAsUnread={() => markPinnedTaskUnread(taskRowKey(contextMenuItem.workspacePath, contextMenuItem.taskId, contextMenuItem.workspaceIdentity))}
          />
        ) : null}
      </ContextMenu>
      {isRemoteLoading ? <RemoteSyncingRow /> : null}
      {hasMoreThanLimit ? (
        <div className="cursor-pointer pl-8.5">
          <span className="text-ui-base text-foreground-subtlest hover:text-foreground-subtle" onClick={() => { setExpanded((value) => !value); }}>
            {intl.formatMessage({ id: expanded ? "taskList.showLess" : "taskList.showMore" })}
          </span>
        </div>
      ) : null}
    </div>
  );
}
/* ============================================================================
 * 17. 时间线任务段（原 HRt，js 152247–152864 / jsx 125894–126383）
 *     本地 timeline 查询 + 远端 k6 store 合并，按日期桶分组（可关），
 *     分页 +20；远端工作区自动刷新；右键/行内动作同置顶段。
 * ==========================================================================*/

export function TimelineTasksSection({
  workspaceTabs, activeWorkspacePath, activeWorkspaceIdentity, activeTaskId, taskSortBy,
  groupByDate = true, taskRowVariant = "timeline", emptyMessage, mobileActiveTaskKey, onSelectTask,
}: {
  workspaceTabs: WorkspaceTab[];
  activeWorkspacePath: string;
  activeWorkspaceIdentity?: string | null;
  activeTaskId: string | null;
  taskSortBy: TaskSortBy;
  groupByDate?: boolean;
  taskRowVariant?: TaskRowVariant;
  emptyMessage?: string;
  mobileActiveTaskKey?: string | null;
  onSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
}) {
  const { intl, locale } = useIntlContext();
  const baseServices = useBaseServices();
  const scopedWorkspaceTabs = useScopedWorkspaceTabs({ workspaceTabs });
  const sessionsById = useSessionRegistryStore((state) => state.sessionsById);
  const sessionIdByWorkspaceIdentity = useSessionRegistryStore((state) => state.sessionIdByWorkspaceIdentity);
  const sessionIdByWorkspacePath = useSessionRegistryStore((state) => state.sessionIdByWorkspacePath);
  const sessionMaps = React.useMemo(() => ({ sessionsById, sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath }), [sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath, sessionsById]);
  const removeTaskState = useTaskStore((state) => state.removeTaskState);
  const upsertOptimisticTaskListItem = useTaskStore((state) => state.upsertOptimisticTaskListItem);
  const removeOptimisticTaskListItem = useTaskStore((state) => state.removeOptimisticTaskListItem);
  const setTaskUnreadIndicator = useTaskStore((state) => state.setTaskUnreadIndicator);
  const [archiveConfirmingKey, setArchiveConfirmingKey] = React.useState<string | null>(null);
  const [renamingTaskKey, setRenamingTaskKey] = React.useState<string | null>(null);
  const [contextMenuTaskKey, setContextMenuTaskKey] = React.useState<string | null>(null);
  const [renameDraft, setRenameDraft] = React.useState("");
  const [visibleLimit, setVisibleLimit] = React.useState(20);
  const renameInputRef = React.useRef<HTMLInputElement>(null);
  const archiveConfirmingRef = React.useRef(archiveConfirmingKey);
  const renamingRef = React.useRef(renamingTaskKey);
  const sortByRef = React.useRef(taskSortBy);
  const intlRef = React.useRef(intl);
  const onSelectTaskRef = React.useRef(onSelectTask);
  archiveConfirmingRef.current = archiveConfirmingKey;
  renamingRef.current = renamingTaskKey;
  sortByRef.current = taskSortBy;
  intlRef.current = intl;
  onSelectTaskRef.current = onSelectTask;

  const workspaceServicesByKey = React.useMemo(() => buildWorkspaceServicesMap(workspaceTabs, baseServices as unknown as WorkspaceServices | null, sessionMaps), [baseServices, sessionMaps, workspaceTabs]);
  const activeWorkspaceKey = workspaceKey(activeWorkspacePath, activeWorkspaceIdentity);
  const tabsSignature = React.useMemo(
    () => workspaceTabs.map((tab) => (tab.workspaceIdentity?.trim() || tab.workspacePath) + ":" + tab.workspacePath).join("|"),
    [workspaceTabs],
  );
  const { items: localItems, total: localTotal, hasMore: localHasMore, loading: localLoading } = useTaskListItems({
    kind: "timeline", workspaceTabs: scopedWorkspaceTabs, sortBy: taskSortBy, searchQuery: "", expanded: false, collapsedLimit: visibleLimit,
  });
  const remoteItemsByWorkspaceKey = useRemoteWorkspaceTaskListStore((state) => state.itemsByWorkspaceKey);
  const remoteLoadingByWorkspaceKey = useRemoteWorkspaceTaskListStore((state) => state.loadingByWorkspaceKey);
  const remoteTotalByWorkspaceKey = useRemoteWorkspaceTaskListStore((state) => state.totalByWorkspaceKey);
  const remoteHasMoreByWorkspaceKey = useRemoteWorkspaceTaskListStore((state) => state.hasMoreByWorkspaceKey);
  const remoteWorkspaceKeys = React.useMemo(
    () => [...new Set(workspaceTabs.filter((tab) => tab.workspaceIdentity || tab.remoteTarget || tab.remoteSessionId).map((tab) => workspaceKey(tab.workspacePath, tab.workspaceIdentity)))],
    [workspaceTabs],
  );
  const remoteItems = React.useMemo(() => remoteWorkspaceKeys.flatMap((key) => remoteItemsByWorkspaceKey[key] ?? []), [remoteItemsByWorkspaceKey, remoteWorkspaceKeys]);
  const mergedItems = React.useMemo(() => [...localItems, ...remoteItems].sort((a, b) => compareTasksForList(a, b, taskSortBy)), [localItems, remoteItems, taskSortBy]);
  const visibleItems = mergedItems.slice(0, visibleLimit);
  const itemsByKey = React.useMemo(() => {
    const map = new Map<string, TaskMeta>();
    for (const item of visibleItems) map.set(taskRowKey(item.workspacePath, item.taskId, item.workspaceIdentity), item);
    return map;
  }, [visibleItems]);

  // 日期桶分组（仅保留有服务工作区的条目）
  const dateGroups = React.useMemo(() => {
    const available = visibleItems.filter((item) => workspaceServicesByKey.has(workspaceKey(item.workspacePath, item.workspaceIdentity)));
    if (!groupByDate) return [{ key: "all", label: null as TimelineDateBucket | null, items: available }];
    return groupTasksByDateBucket(visibleItems, { sortBy: taskSortBy, now: Date.now(), locale })
      .map((group) => ({ ...group, items: group.items.filter((item) => workspaceServicesByKey.has(workspaceKey(item.workspacePath, item.workspaceIdentity))) }))
      .filter((group) => group.items.length > 0);
  }, [groupByDate, visibleItems, locale, taskSortBy, workspaceServicesByKey]);

  const remoteTotal = remoteWorkspaceKeys.reduce((sum, key) => sum + (remoteTotalByWorkspaceKey[key] ?? remoteItemsByWorkspaceKey[key]?.length ?? 0), 0);
  const total = localTotal + remoteTotal;
  const remoteHasMore = remoteWorkspaceKeys.some((key) => remoteHasMoreByWorkspaceKey[key]);
  const isRemoteLoading = workspaceTabs.some((tab) =>
    !tab.workspaceIdentity && !tab.remoteTarget && !tab.remoteSessionId ? false : !!remoteLoadingByWorkspaceKey[workspaceKey(tab.workspacePath, tab.workspaceIdentity)],
  );
  const isLoading = localLoading || isRemoteLoading;
  const hasMore = localHasMore || remoteHasMore || total > visibleItems.length;
  const showMoreRow = (isLoading || mergedItems.length >= visibleLimit) && hasMore;

  // 排序/工作区集合变化时重置分页
  React.useEffect(() => { setVisibleLimit(20); }, [taskSortBy, tabsSignature]);
  /* ---- 动作 ---- */
  const servicesOfItem = React.useCallback((item: TaskMeta) => {
    const entry = workspaceServicesByKey.get(workspaceKey(item.workspacePath, item.workspaceIdentity));
    return entry?.services ?? null;
  }, [workspaceServicesByKey]);
  const archiveTimelineTask = React.useCallback((rowKey: string) => {
    const item = itemsByKey.get(rowKey);
    if (!item) return;
    const services = servicesOfItem(item);
    if (!services) return;
    services.zcodeTaskService.archiveTask({
      taskId: item.taskId, workspacePath: item.workspacePath,
      ...(item.workspaceIdentity ? { workspaceIdentity: item.workspaceIdentity } : {}),
    }).then((archived) => {
      removeTaskState(item.workspacePath, item.taskId, item.workspaceIdentity);
      if (item.workspaceIdentity) {
        useRemoteWorkspaceTaskListStore.getState().removeTask(item.workspacePath, item.taskId, item.workspaceIdentity);
        useRemotePinnedTaskListStore.getState().removeTask(item.workspacePath, item.taskId, item.workspaceIdentity);
      }
      applyOptimisticTaskMutation({ previousTask: item, nextTask: archived, previousState: { pinned: false, archived: false }, nextState: { pinned: false, archived: true } });
    });
  }, [itemsByKey, removeTaskState, servicesOfItem]);
  const selectTimelineTask = React.useCallback((rowKey: string) => {
    const item = itemsByKey.get(rowKey);
    if (item) onSelectTaskRef.current(item.workspacePath, item.taskId, item.workspaceIdentity);
  }, [itemsByKey]);
  const handleArchiveInline = React.useCallback((event: React.MouseEvent, rowKey: string) => {
    event.stopPropagation();
    if (renamingRef.current) { setRenamingTaskKey(null); setRenameDraft(""); }
    if (archiveConfirmingRef.current !== rowKey) { setArchiveConfirmingKey(rowKey); return; }
    setArchiveConfirmingKey(null);
    archiveTimelineTask(rowKey);
  }, [archiveTimelineTask]);
  const toggleTimelineTaskPin = React.useCallback((rowKey: string, pinned: boolean) => {
    const item = itemsByKey.get(rowKey);
    if (!item) return;
    const services = servicesOfItem(item);
    if (!services) return;
    // 乐观：置顶时从时间线搬入置顶 store
    if (item.workspaceIdentity && pinned) {
      useRemoteWorkspaceTaskListStore.getState().removeTask(item.workspacePath, item.taskId, item.workspaceIdentity);
      useRemotePinnedTaskListStore.getState().upsertTask(item);
    }
    applyOptimisticTaskMutation({ previousTask: item, nextTask: item, previousState: { pinned: false, archived: false }, nextState: { pinned, archived: false } });
    services.zcodeTaskService.setTaskPinned({
      taskId: item.taskId, workspacePath: item.workspacePath,
      ...(item.workspaceIdentity ? { workspaceIdentity: item.workspaceIdentity } : {}),
      pinned,
    }).then((updated) => {
      removeOptimisticTaskListItem(item.workspacePath, item.taskId, item.workspaceIdentity);
      if (item.workspaceIdentity && pinned) {
        useRemotePinnedTaskListStore.getState().upsertTask(updated);
        useRemoteWorkspaceTaskListStore.getState().removeTask(item.workspacePath, item.taskId, item.workspaceIdentity);
      }
      applyOptimisticTaskMutation({ previousTask: item, nextTask: updated, previousState: { pinned, archived: false }, nextState: { pinned, archived: false } });
    }).catch(() => {
      if (item.workspaceIdentity && pinned) {
        useRemotePinnedTaskListStore.getState().removeTask(item.workspacePath, item.taskId, item.workspaceIdentity);
        useRemoteWorkspaceTaskListStore.getState().upsertTask(item, sortByRef.current);
      }
      applyOptimisticTaskMutation({ previousTask: item, nextTask: item, previousState: { pinned, archived: false }, nextState: { pinned: false, archived: false } });
      toast(intlRef.current.formatMessage({ id: "taskList.pinFailed" }));
    });
  }, [itemsByKey, removeOptimisticTaskListItem, servicesOfItem]);
  const startTimelineTaskRename = React.useCallback((rowKey: string, title: string | undefined) => {
    setArchiveConfirmingKey(null);
    setRenamingTaskKey(rowKey);
    setRenameDraft(title ?? "");
  }, []);
  const archiveFromMenu = React.useCallback((rowKey: string) => {
    setArchiveConfirmingKey(null);
    setRenamingTaskKey(null);
    setRenameDraft("");
    archiveTimelineTask(rowKey);
  }, [archiveTimelineTask]);
  const markTimelineTaskUnread = React.useCallback((rowKey: string) => {
    const item = itemsByKey.get(rowKey);
    if (!item) return;
    const services = servicesOfItem(item);
    if (!services) return;
    services.zcodeTaskService.setTaskUnread({
      taskId: item.taskId, workspacePath: item.workspacePath,
      ...(item.workspaceIdentity ? { workspaceIdentity: item.workspaceIdentity } : {}),
      unread: true,
    }).then((updated) => {
      setTaskUnreadIndicator(item.workspacePath, item.taskId, true, item.workspaceIdentity);
      upsertOptimisticTaskListItem(item.workspacePath, updated, item.workspaceIdentity);
      if (item.workspaceIdentity) useRemoteWorkspaceTaskListStore.getState().upsertTask(updated, sortByRef.current);
      applyOptimisticTaskMutation({ previousTask: item, nextTask: updated, previousState: { pinned: false, archived: false }, nextState: { pinned: false, archived: false } });
    });
  }, [itemsByKey, servicesOfItem, setTaskUnreadIndicator, upsertOptimisticTaskListItem]);
  const openContextMenu = React.useCallback((rowKey: string) => {
    if (archiveConfirmingRef.current === rowKey) setArchiveConfirmingKey(null);
    setContextMenuTaskKey(rowKey);
  }, []);
  const rowActionCacheRef = React.useRef(new Map<string, Record<string, unknown>>());
  const getRowActions = React.useCallback((rowKey: string) => {
    let actions = rowActionCacheRef.current.get(rowKey);
    if (!actions) {
      actions = {
        onSelectTask: () => { selectTimelineTask(rowKey); },
        onArchiveTaskInline: (event: React.MouseEvent) => { handleArchiveInline(event, rowKey); },
        onTogglePinTask: (_taskId: string, pinned: boolean) => { toggleTimelineTaskPin(rowKey, pinned); },
        onStartRenameTask: (_taskId: string, title: string | undefined) => { startTimelineTaskRename(rowKey, title); },
        onArchiveTask: () => { archiveFromMenu(rowKey); },
        onMarkTaskAsUnread: () => { markTimelineTaskUnread(rowKey); },
        onOpenTaskContextMenu: () => { openContextMenu(rowKey); },
      };
      rowActionCacheRef.current.set(rowKey, actions);
    }
    return actions;
  }, [archiveFromMenu, handleArchiveInline, markTimelineTaskUnread, openContextMenu, selectTimelineTask, startTimelineTaskRename, toggleTimelineTaskPin]);

  const contextMenuItem = contextMenuTaskKey ? itemsByKey.get(contextMenuTaskKey) ?? null : null;
  React.useEffect(() => {
    if (renamingTaskKey) { renameInputRef.current?.focus(); renameInputRef.current?.select(); }
  }, [renamingTaskKey]);
  React.useEffect(() => {
    if (contextMenuTaskKey && !itemsByKey.get(contextMenuTaskKey)) setContextMenuTaskKey(null);
  }, [contextMenuTaskKey, itemsByKey]);
  React.useEffect(() => {
    for (const key of rowActionCacheRef.current.keys()) if (!itemsByKey.has(key)) rowActionCacheRef.current.delete(key);
  }, [itemsByKey]);

  if (visibleItems.length === 0 && isLoading) {
    return <div className="flex min-h-0 flex-col px-2"><TaskListLoadingRow /></div>;
  }
  if (visibleItems.length === 0) {
    return <div className="px-3 py-2 text-ui-base text-foreground-subtle">{emptyMessage ?? intl.formatMessage({ id: "taskList.noTasks" })}</div>;
  }
  return (
    <div className="flex min-h-0 flex-col">
      {renamingTaskKey === null ? null : (
        <TaskRenameDialog
          open
          value={renameDraft}
          inputRef={renameInputRef}
          intl={intl}
          onOpenChange={(open) => { if (!open) { setRenamingTaskKey(null); setRenameDraft(""); } }}
          onChange={setRenameDraft}
          onCancel={() => { setRenamingTaskKey(null); setRenameDraft(""); }}
          onConfirm={() => {
            if (!renamingTaskKey) return;
            const item = itemsByKey.get(renamingTaskKey);
            if (!item) { setRenamingTaskKey(null); setRenameDraft(""); return; }
            const nextTitle = renameDraft.trim();
            if (nextTitle === item.title.trim()) { setRenamingTaskKey(null); setRenameDraft(""); return; }
            const services = servicesOfItem(item);
            if (!services) { setRenamingTaskKey(null); setRenameDraft(""); return; }
            services.zcodeTaskService.renameTask({
              taskId: item.taskId, workspacePath: item.workspacePath,
              ...(item.workspaceIdentity ? { workspaceIdentity: item.workspaceIdentity } : {}),
              title: nextTitle,
            }).then((updated) => {
              upsertOptimisticTaskListItem(item.workspacePath, updated, item.workspaceIdentity);
              if (item.workspaceIdentity) useRemoteWorkspaceTaskListStore.getState().upsertTask(updated, taskSortBy);
              applyOptimisticTaskMutation({ previousTask: item, nextTask: updated, previousState: { pinned: false, archived: false }, nextState: { pinned: false, archived: false } });
              setRenamingTaskKey(null);
              setRenameDraft("");
            }).catch(() => { toast(intl.formatMessage({ id: "taskList.renameFailed" })); });
          }}
        />
      )}
      <ContextMenu onOpenChange={(open) => { if (!open) setContextMenuTaskKey(null); }}>
        <ContextMenuTrigger asChild>
          <ul className="space-y-1">
            {dateGroups.map((group) => {
              const message = group.label ? timelineBucketMessage(group.label) : null;
              return (
                <li key={group.key} className="space-y-0.5">
                  {message ? (
                    <div className="px-3 pt-2 pb-1 text-ui-base font-medium text-foreground-subtle">
                      {intl.formatMessage({ id: message.id }, message.values)}
                    </div>
                  ) : null}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const rowKey = taskRowKey(item.workspacePath, item.taskId, item.workspaceIdentity);
                      const entry = workspaceServicesByKey.get(workspaceKey(item.workspacePath, item.workspaceIdentity));
                      if (!entry) return null;
                      const actions = getRowActions(rowKey);
                      return (
                        <MemoTaskItem
                          key={rowKey}
                          workspacePath={item.workspacePath}
                          remoteSessionId={entry.remoteSessionId}
                          task={item}
                          isPinned={false}
                          variant={taskRowVariant}
                          isActive={workspaceKey(item.workspacePath, item.workspaceIdentity) === activeWorkspaceKey && item.taskId === activeTaskId}
                          isMobileActive={mobileActiveTaskKey === rowKey}
                          onSelectTask={actions.onSelectTask as (taskId: string) => void}
                          onArchiveTaskInline={actions.onArchiveTaskInline as (event: React.MouseEvent, taskId: string) => void}
                          onCancelArchiveConfirm={() => setArchiveConfirmingKey(null)}
                          isArchiveConfirming={archiveConfirmingKey === rowKey}
                          onTogglePinTask={actions.onTogglePinTask as (taskId: string, pinned: boolean) => void}
                          onStartRenameTask={actions.onStartRenameTask as (taskId: string, title: string | undefined) => void}
                          onArchiveTask={actions.onArchiveTask as (taskId: string) => void}
                          onMarkTaskAsUnread={actions.onMarkTaskAsUnread as (taskId: string) => void}
                          onOpenTaskContextMenu={actions.onOpenTaskContextMenu as (taskId: string) => void}
                          intl={intl}
                        />
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </ContextMenuTrigger>
        {contextMenuItem && contextMenuTaskKey ? (
          <TaskRowContextMenuContent
            workspacePath={contextMenuItem.workspacePath}
            remoteSessionId={workspaceServicesByKey.get(workspaceKey(contextMenuItem.workspacePath, contextMenuItem.workspaceIdentity))?.remoteSessionId}
            task={contextMenuItem}
            isPinned={false}
            intl={intl}
            onTogglePinTask={(taskId, pinned) => toggleTimelineTaskPin(taskRowKey(contextMenuItem.workspacePath, taskId, contextMenuItem.workspaceIdentity), pinned)}
            onStartRenameTask={(taskId, title) => { setArchiveConfirmingKey(null); setRenamingTaskKey(contextMenuTaskKey); setRenameDraft(title ?? ""); }}
            onArchiveTask={() => archiveFromMenu(taskRowKey(contextMenuItem.workspacePath, contextMenuItem.taskId, contextMenuItem.workspaceIdentity))}
            onMarkTaskAsUnread={() => markTimelineTaskUnread(taskRowKey(contextMenuItem.workspacePath, contextMenuItem.taskId, contextMenuItem.workspaceIdentity))}
          />
        ) : null}
      </ContextMenu>
      {isRemoteLoading ? <RemoteSyncingRow /> : null}
      {showMoreRow ? (
        <div className="cursor-pointer pl-8.5 pb-4">
          <span className="text-ui-base text-foreground-subtlest hover:text-foreground-subtle" onClick={() => { setVisibleLimit((limit) => limit + 20); }}>
            {intl.formatMessage({ id: "taskList.showMore" })}
          </span>
        </div>
      ) : null}
    </div>
  );
}
/* ============================================================================
 * 19. 工作区行族（原 BBt/HBt/MBt/FBt/ABt 等，js 156221–158882 / jsx 128900–131860）
 * ==========================================================================*/

/** 原 ABt（157550 / 131107）：光束描边动画容器（工作区行聚焦时的流光描边；
 *  CSS 由 TBt/EBt/DBt/OBt/kBt/wBt 生成，接口级，156793–157547 / 130373–131106） */
/** 原 V8/uBt/B8（156306/128919）：logo 光束色板与参数（数据块，接口级） */
declare const WORKSPACE_LOGO_PALETTES: Record<string, unknown>;

/** 原 FBt（158029 / 131404）：远程重连日志 popover（自动滚底） */
export function RemoteConnectionLogsPopover({ logs, children }: {
  logs: Array<{ id: string; timestamp: string; level: "info" | "success" | "warn" | "error" | string; message: string }>;
  children?: React.ReactNode;
}) {
  const { intl } = useIntlContext();
  const [open, setOpen] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const cancelScrollRef = React.useRef<() => void>(() => {});
  const scrollToBottom = React.useCallback((el: HTMLDivElement) => {
    cancelScrollRef.current();
    cancelScrollRef.current = autoScrollToBottom(el);
  }, []);
  const attachList = React.useCallback((el: HTMLDivElement | null) => {
    listRef.current = el;
    if (el) scrollToBottom(el);
  }, [scrollToBottom]);
  React.useEffect(() => {
    if (open && listRef.current) scrollToBottom(listRef.current);
  }, [logs.length, open, scrollToBottom]);
  React.useEffect(() => () => cancelScrollRef.current(), []);
  return (
    <Popover>
      <PopoverAnchor onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {children ?? (
            <div className="flex shrink-0 items-center gap-1 text-ui-base text-foreground-subtle" aria-label={intl.formatMessage({ id: "workspaceSidebar.connecting" })}>
              <SpinnerIcon className="h-3 w-3 animate-spin" />
              <span>{intl.formatMessage({ id: "workspaceSidebar.connecting" })}</span>
            </div>
          )}
        </PopoverTrigger>
      </PopoverAnchor>
      <PopoverContent side="right" align="start" sideOffset={6}
        className="w-[min(24rem,calc(100vw-1rem))] max-w-[min(24rem,calc(100vw-1rem))] overflow-hidden px-3 py-2">
        <div className="space-y-2">
          <div className="text-ui-sm font-medium text-tooltip-foreground">{intl.formatMessage({ id: "remote.connectionLog" })}</div>
          <div ref={attachList} className="max-h-56 space-y-1 overflow-x-hidden overflow-y-auto font-mono text-ui-sm">
            {logs.length > 0 ? logs.map((log) => (
              <div key={log.id} className="flex min-w-0 items-start leading-5">
                <span className="shrink-0 text-tooltip-foreground/60">{log.timestamp}</span>
                <span className={cn("mx-2 shrink-0",
                  log.level === "success" ? "text-success" : log.level === "warn" ? "text-warning" : log.level === "error" ? "text-destructive" : "text-tooltip-foreground/70")}>
                  {"["}{log.level.toUpperCase()}{"]"}
                </span>
                <span className="min-w-0 flex-1 break-all whitespace-pre-wrap text-tooltip-foreground">{log.message}</span>
              </div>
            )) : (
              <div className="text-tooltip-foreground/70">{"[INFO] "}{intl.formatMessage({ id: "remote.connectionLogEmpty" })}</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
/** 原 NBt/PBt（158017/158020）：日志列表滚底（立即 + 下一帧再校一次） */
declare function autoScrollToBottom(el: HTMLDivElement): () => void;
const EMPTY_PINNED_TASKS: TaskMeta[] = []; // 原 IBt（158132）
/** 原 LBt（158133 / 131439）：是否用户主目录（主目录显示 house 图标） */
function isUserHomeDirectory(path: string): boolean {
  const normalized = path.replace(/\\/g, "/").replace(/\/+$/, "");
  return /^(\/Users\/[^/]+|\/home\/[^/]+|[A-Za-z]:\/Users\/[^/]+)$/.test(normalized);
}
/** 原 MBt（157550 块内 / 131192）：工作区内任务列表（展开的工作区行内部）
 *  行内动作经 onRenameTask/onSetTaskPinned/onArchiveTask/onSetTaskUnread 注入，
 *  顶部可选新建线程行，底部可选设置按钮。 */
interface WorkspaceTaskListProps {
  workspacePath: string;
  remoteSessionId?: string | null;
  workspaceIdentity?: string | null;
  tasks: TaskMeta[];
  pinnedTasks?: TaskMeta[];
  activeTaskId: string | null;
  sortBy?: TaskSortBy | "manual";
  isWorkspaceActive?: boolean;
  onSelectTask: (taskId: string) => void;
  showCreateButton?: boolean;
  showFooter?: boolean;
  showEmptyState?: boolean;
  loading?: boolean;
  hasMore?: boolean;
  onShowMore?: () => void;
  onRenameTask: (taskId: string, title: string) => Promise<TaskMeta | null>;
  onSetTaskPinned: (taskId: string, pinned: boolean) => Promise<TaskMeta | null>;
  onArchiveTask: (taskId: string) => Promise<TaskMeta | null>;
  onSetTaskUnread: (taskId: string, unread: boolean) => Promise<TaskMeta | null>;
  mobileActiveTaskKey?: string | null;
  readOnlyReason?: string | null;
}
export const WorkspaceTaskList = React.memo(function WorkspaceTaskList({
  workspacePath, remoteSessionId, workspaceIdentity, tasks, pinnedTasks = EMPTY_PINNED_TASKS,
  activeTaskId, sortBy = "manual", isWorkspaceActive = true, onSelectTask,
  showCreateButton = true, showFooter = true, showEmptyState = true, loading, hasMore = false, onShowMore,
  onRenameTask, onSetTaskPinned, onArchiveTask, onSetTaskUnread, mobileActiveTaskKey, readOnlyReason,
}: WorkspaceTaskListProps) {
  const { intl } = useIntlContext();
  const pinnedTaskIds = React.useMemo(() => new Set(pinnedTasks.map((task) => task.taskId)), [pinnedTasks]);
  const allTasks = React.useMemo(() => [...tasks, ...pinnedTasks], [pinnedTasks, tasks]);
  const startDraft = useTaskStore((state) => state.startDraft);
  const openSettingsTab = useTabStore((state) => state.openSettingsTab);
  const [archiveConfirmingId, setArchiveConfirmingId] = React.useState<string | null>(null);
  const [renamingTaskId, setRenamingTaskId] = React.useState<string | null>(null);
  const [contextMenuTaskId, setContextMenuTaskId] = React.useState<string | null>(null);
  const [renameDraft, setRenameDraft] = React.useState("");
  const renameInputRef = React.useRef<HTMLInputElement>(null);
  const archiveConfirmingRef = React.useRef(archiveConfirmingId);
  const renamingRef = React.useRef(renamingTaskId);
  const onSelectTaskRef = React.useRef(onSelectTask);
  const onSetTaskPinnedRef = React.useRef(onSetTaskPinned);
  const onArchiveTaskRef = React.useRef(onArchiveTask);
  const onSetTaskUnreadRef = React.useRef(onSetTaskUnread);
  archiveConfirmingRef.current = archiveConfirmingId;
  renamingRef.current = renamingTaskId;
  onSelectTaskRef.current = onSelectTask;
  onSetTaskPinnedRef.current = onSetTaskPinned;
  onArchiveTaskRef.current = onArchiveTask;
  onSetTaskUnreadRef.current = onSetTaskUnread;

  const cancelArchiveConfirm = React.useCallback(() => { setArchiveConfirmingId(null); }, []);
  const cancelRename = React.useCallback(() => { setRenamingTaskId(null); setRenameDraft(""); }, []);
  const selectTask = React.useCallback((taskId: string) => { onSelectTaskRef.current(taskId); }, []);
  const openContextMenu = React.useCallback((taskId: string) => {
    if (archiveConfirmingRef.current === taskId) setArchiveConfirmingId(null);
    setContextMenuTaskId(taskId);
  }, []);
  const handleCreateTask = React.useCallback(() => {
    if (!readOnlyReason) startDraft(workspacePath, undefined, workspaceIdentity);
  }, [readOnlyReason, startDraft, workspaceIdentity, workspacePath]);
  const handleArchiveInline = React.useCallback(async (event: React.MouseEvent, taskId: string) => {
    event.stopPropagation();
    if (readOnlyReason) return;
    if (renamingRef.current) cancelRename();
    if (archiveConfirmingRef.current !== taskId) { setArchiveConfirmingId(taskId); return; }
    setArchiveConfirmingId(null);
    await onArchiveTaskRef.current(taskId);
  }, [cancelRename, readOnlyReason]);
  const startRename = React.useCallback((taskId: string, title: string | undefined) => {
    if (readOnlyReason) return;
    logger.info("[TaskList] rename start", { taskId, workspacePath, workspaceIdentity, titleLength: title?.length ?? 0 });
    setArchiveConfirmingId(null);
    setRenamingTaskId(taskId);
    setRenameDraft(title ?? "");
  }, [readOnlyReason, workspaceIdentity, workspacePath]);
  const togglePin = React.useCallback(async (taskId: string, pinned: boolean) => {
    if (!readOnlyReason) await onSetTaskPinnedRef.current(taskId, pinned);
  }, [readOnlyReason]);
  const archiveFromMenu = React.useCallback(async (taskId: string) => {
    if (readOnlyReason) return;
    setArchiveConfirmingId(null);
    cancelRename();
    await onArchiveTaskRef.current(taskId);
  }, [cancelRename, readOnlyReason]);
  const markUnread = React.useCallback((taskId: string) => {
    if (!readOnlyReason) void onSetTaskUnreadRef.current(taskId, true);
  }, [readOnlyReason]);
  // 重命名提交：未变化直接关闭；失败保持打开并 toast
  const submitRename = React.useCallback(async (taskId: string) => {
    if (readOnlyReason) return;
    const task = allTasks.find((item) => item.taskId === taskId);
    if (!task) { logger.warn("[TaskList] rename submit task missing", { taskId, workspacePath, workspaceIdentity }); cancelRename(); return; }
    const nextTitle = renameDraft.trim();
    if (nextTitle === task.title.trim()) { cancelRename(); return; }
    let updated: TaskMeta | null;
    try {
      updated = await onRenameTask(taskId, nextTitle);
    } catch (error) {
      logger.error("[TaskList] rename submit onRenameTask rejected", { taskId, workspacePath, workspaceIdentity, message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
    if (!updated) { toast(intl.formatMessage({ id: "taskList.renameFailed" })); return; }
    cancelRename();
  }, [allTasks, cancelRename, intl, onRenameTask, readOnlyReason, renameDraft, workspaceIdentity, workspacePath]);

  React.useEffect(() => {
    if (renamingTaskId) { renameInputRef.current?.focus(); renameInputRef.current?.select(); }
  }, [renamingTaskId]);
  const sortedTasks = React.useMemo(
    () => (sortBy === "manual" ? tasks : [...tasks].sort((a, b) => compareTasksForList(a, b, sortBy))),
    [sortBy, tasks],
  );
  React.useEffect(() => { if (archiveConfirmingId && !sortedTasks.some((task) => task.taskId === archiveConfirmingId)) setArchiveConfirmingId(null); }, [archiveConfirmingId, sortedTasks]);
  React.useEffect(() => { if (renamingTaskId && !sortedTasks.some((task) => task.taskId === renamingTaskId)) cancelRename(); }, [cancelRename, renamingTaskId, sortedTasks]);
  React.useEffect(() => { if (contextMenuTaskId && !sortedTasks.some((task) => task.taskId === contextMenuTaskId)) setContextMenuTaskId(null); }, [contextMenuTaskId, sortedTasks]);
  const contextMenuTask = React.useMemo(() => (contextMenuTaskId ? allTasks.find((task) => task.taskId === contextMenuTaskId) ?? null : null), [allTasks, contextMenuTaskId]);

  function renderTaskRow(task: TaskMeta) {
    return (
      <MemoTaskItem
        key={task.taskId}
        workspacePath={workspacePath}
        remoteSessionId={remoteSessionId}
        task={task}
        isPinned={pinnedTaskIds.has(task.taskId)}
        isActive={isWorkspaceActive && task.taskId === activeTaskId}
        isMobileActive={mobileActiveTaskKey === workspaceKey(workspacePath, workspaceIdentity) + ":" + task.taskId}
        onSelectTask={selectTask}
        onArchiveTaskInline={handleArchiveInline}
        onCancelArchiveConfirm={cancelArchiveConfirm}
        isArchiveConfirming={archiveConfirmingId === task.taskId}
        onTogglePinTask={togglePin}
        onStartRenameTask={startRename}
        onArchiveTask={archiveFromMenu}
        onMarkTaskAsUnread={markUnread}
        onOpenTaskContextMenu={openContextMenu}
        actionsDisabled={!!readOnlyReason}
        actionsDisabledReason={readOnlyReason}
        intl={intl}
      />
    );
  }

  return (
    <div data-testid={TESTID_TASK_LIST} className="flex flex-col gap-2">
      {renamingTaskId === null ? null : (
        <TaskRenameDialog
          open
          value={renameDraft}
          inputRef={renameInputRef}
          intl={intl}
          onOpenChange={(open) => { if (!open) cancelRename(); }}
          onChange={setRenameDraft}
          onCancel={cancelRename}
          onConfirm={() => { if (renamingTaskId) void submitRename(renamingTaskId); }}
        />
      )}
      {showCreateButton ? (
        <div className="border-b p-3">
          <Tooltip title={readOnlyReason ?? intl.formatMessage({ id: "taskList.newThread" })}>
            <div>
              <NewTaskRow onCreateTask={handleCreateTask} disabled={!!readOnlyReason} />
            </div>
          </Tooltip>
        </div>
      ) : null}
      <div>
        <div className="space-y-1">
          {loading && sortedTasks.length === 0 ? (
            <TaskListLoadingRow />
          ) : sortedTasks.length === 0 ? (
            showEmptyState ? (
              <div data-testid={TESTID_TASK_EMPTY} className="px-8.5 py-2 text-ui-base text-foreground-subtlest">
                {intl.formatMessage({ id: "taskList.noTasks" })}
              </div>
            ) : null
          ) : (
            <ContextMenu onOpenChange={(open) => { if (!open) setContextMenuTaskId(null); }}>
              <ContextMenuTrigger asChild>
                <ul className="space-y-0.5">{sortedTasks.map(renderTaskRow)}</ul>
              </ContextMenuTrigger>
              {contextMenuTask ? (
                <TaskRowContextMenuContent
                  workspacePath={workspacePath}
                  remoteSessionId={remoteSessionId}
                  task={contextMenuTask}
                  isPinned={pinnedTaskIds.has(contextMenuTask.taskId)}
                  intl={intl}
                  onTogglePinTask={togglePin}
                  onStartRenameTask={startRename}
                  onArchiveTask={archiveFromMenu}
                  onMarkTaskAsUnread={markUnread}
                  disableTaskActions={!!readOnlyReason}
                  disabledReason={readOnlyReason}
                />
              ) : null}
            </ContextMenu>
          )}
        </div>
        {hasMore && onShowMore ? (
          <div className="cursor-pointer pl-8.5">
            <span className="text-ui-base text-foreground-subtlest hover:text-foreground-subtle" onClick={onShowMore}>
              {intl.formatMessage({ id: "taskList.showMore" })}
            </span>
          </div>
        ) : null}
      </div>
      {showFooter ? (
        <div className="border-t border-outline/40 p-3">
          <Button type="button" variant="outline" size="sm" onClick={() => openSettingsTab()} data-testid={TESTID_TASK_SETTINGS_BUTTON} className="w-full justify-center">
            <IconSettings2 className="h-3.5 w-3.5" />
            {intl.formatMessage({ id: "taskList.openSettings" })}
          </Button>
        </div>
      ) : null}
    </div>
  );
});
/** 原 BBt（158149 / 131453）：工作区行——折叠头（图标/名称/未读点/更多菜单/文件树/重连/新线程）
 *  + 展开体（工作区内任务列表）+ 远程同步对话框。 */
interface WorkspaceSidebarItemProps {
  tab: WorkspaceTab;
  isActiveWorkspace: boolean;
  isExpanded: boolean;
  closeTab: (tabId: string) => void;
  toggleWorkspaceExpanded: (workspacePath: string) => void;
  onSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
  onStartDraftInWorkspace: (workspacePath: string, workspaceIdentity?: string | null) => void;
  taskItems: TaskMeta[];
  taskListLoading: boolean;
  taskListHasMore: boolean;
  taskListHasUnread?: boolean;
  mobileActiveTaskKey?: string | null;
  isWebRemoteControl?: boolean;
  onShowMoreTasks: () => void;
  reconnectingRemoteWorkspaceKeys: string[];
  remoteWorkspaceErrorByWorkspaceKey: Record<string, string | undefined>;
  reconnectingRemoteWorkspaceLogsByWorkspaceKey: Record<string, Array<{ id: string; timestamp: string; level: string; message: string }>>;
  onReconnectRemoteWorkspace: (workspaceKey: string) => void;
  onOpenFileTree?: (request: { workspacePath: string; workspaceName?: string; workspaceIdentity?: string | null; workspaceRemoteSessionId?: string | null }) => void;
  itemRef?: (el: HTMLElement | null) => void;
  itemStyle?: React.CSSProperties;
  sortableBindings?: { attributes: Record<string, unknown>; listeners: Record<string, unknown> } | null;
  isDragging?: boolean;
}
export const WorkspaceSidebarItem = React.memo(function WorkspaceSidebarItem({
  tab, isActiveWorkspace, isExpanded, closeTab, toggleWorkspaceExpanded, onSelectTask, onStartDraftInWorkspace,
  taskItems, taskListLoading, taskListHasMore, taskListHasUnread = false, mobileActiveTaskKey,
  isWebRemoteControl = false, onShowMoreTasks, reconnectingRemoteWorkspaceKeys, remoteWorkspaceErrorByWorkspaceKey,
  reconnectingRemoteWorkspaceLogsByWorkspaceKey, onReconnectRemoteWorkspace, onOpenFileTree,
  itemRef, itemStyle, sortableBindings, isDragging = false,
}: WorkspaceSidebarItemProps) {
  const { intl } = useIntlContext();
  const workspaceActiveTaskId = useTaskStore((state) => getWorkspaceSlice(state, tab.workspacePath, tab.workspaceIdentity).activeTaskId);
  const removeTaskState = useTaskStore((state) => state.removeTaskState);
  const upsertOptimisticTaskListItem = useTaskStore((state) => state.upsertOptimisticTaskListItem);
  const removeOptimisticTaskListItem = useTaskStore((state) => state.removeOptimisticTaskListItem);
  const setTaskUnreadIndicator = useTaskStore((state) => state.setTaskUnreadIndicator);
  const workspaceServices = useWorkspaceServices(tab.workspacePath, tab.remoteSessionId, tab.workspaceIdentity, tab.remoteTarget);
  const baseServices = useBaseServices();
  const taskService = workspaceServices.zcodeTaskService;
  const taskItemsRef = React.useRef(taskItems);
  taskItemsRef.current = taskItems;
  const findTask = React.useCallback((taskId: string) => taskItemsRef.current.find((item) => item.taskId === taskId) ?? null, []);
  const isHomeDirectory = isUserHomeDirectory(tab.workspacePath);
  const readOnlyReason = tab.availability === "unavailable-local-directory"
    ? intl.formatMessage({ id: "workspaceSidebar.unavailableLocalDirectory" })
    : undefined;
  const workspaceTabKey = resolveWorkspaceTabKey(tab);
  const isRemoteTab = !!(tab.remoteSessionId || tab.remoteTarget || tab.workspaceIdentity);
  const needsReconnect = !!(isRemoteTab && !tab.remoteSessionId);
  const isReconnecting = !!(needsReconnect && reconnectingRemoteWorkspaceKeys.includes(workspaceTabKey));
  const remoteError = remoteWorkspaceErrorByWorkspaceKey[workspaceTabKey];
  const decoratedLabel = sshDecoratedProjectName(tab.label, tab.remoteTarget);
  const sshInfo = resolveSshConnectionInfo(tab);
  const reconnectLogs = reconnectingRemoteWorkspaceLogsByWorkspaceKey[workspaceTabKey] ?? [];
  const showErrorTooltip = !!(needsReconnect && !isReconnecting && remoteError?.trim());
  const showReconnectActions = !!needsReconnect;
  const canOpenFileTree = !!(onOpenFileTree && !needsReconnect);
  const canSyncRemote = canOpenRemoteSessionSourceCheck({
    remoteSessionId: tab.remoteSessionId,
    remoteTarget: tab.remoteTarget,
    clientMode: isWebRemoteControl ? "web-remote-replayable" : "desktop-continuous",
    hasLocalSourceService: !!baseServices.skillSyncService,
  });
  const showBeamActive = isReconnecting;
  const [copiedError, setCopiedError] = React.useState(false);
  const [skillSyncOpen, setSkillSyncOpen] = React.useState(false);
  const [mcpSyncOpen, setMcpSyncOpen] = React.useState(false);
  const [pluginSyncOpen, setPluginSyncOpen] = React.useState(false);
  const copiedTimerRef = React.useRef<number | null>(null);
  React.useEffect(() => () => { if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current); }, []);

  const handleExpandedChange = React.useCallback((open: boolean) => {
    if (needsReconnect) return;
    if (open) { if (!isExpanded) onStartDraftInWorkspace(tab.workspacePath, tab.workspaceIdentity); }
    else if (isExpanded) toggleWorkspaceExpanded(tab.workspacePath);
  }, [needsReconnect, isExpanded, onStartDraftInWorkspace, tab.workspaceIdentity, tab.workspacePath, toggleWorkspaceExpanded]);
  const selectTaskInWorkspace = React.useCallback((taskId: string) => {
    onSelectTask(tab.workspacePath, taskId, tab.workspaceIdentity);
  }, [onSelectTask, tab.workspaceIdentity, tab.workspacePath]);
  const stopMouseEvent = React.useCallback((event: React.MouseEvent) => { event.preventDefault(); event.stopPropagation(); }, []);
  const stopPropagationOnly = React.useCallback((event: React.MouseEvent) => { event.stopPropagation(); }, []);
  const handleNewThread = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!readOnlyReason) onStartDraftInWorkspace(tab.workspacePath, tab.workspaceIdentity);
  }, [onStartDraftInWorkspace, readOnlyReason, tab.workspaceIdentity, tab.workspacePath]);
  // 移除工作区（关闭标签 + 从最近列表移除）
  const handleRemoveWorkspace = React.useCallback(() => {
    logger.debug("[WorkspaceSidebarItem] 移除 workspace", {
      isExpanded,
      workspaceKey: tab.workspaceIdentity?.trim() || tab.workspacePath,
    });
    closeTab(tab.id);
    forgetRecentWorkspaces([{ workspacePath: tab.workspacePath, ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}) }]);
  }, [closeTab, isExpanded, tab.id, tab.workspaceIdentity, tab.workspacePath]);
  const handleReconnect = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!needsReconnect || isReconnecting) return;
    onReconnectRemoteWorkspace(workspaceTabKey);
  }, [needsReconnect, isReconnecting, onReconnectRemoteWorkspace, workspaceTabKey]);
  const handleOpenFileTree = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (needsReconnect || readOnlyReason || !onOpenFileTree) return;
    onOpenFileTree({ workspacePath: tab.workspacePath, workspaceName: tab.label, workspaceIdentity: tab.workspaceIdentity, workspaceRemoteSessionId: tab.remoteSessionId });
  }, [needsReconnect, onOpenFileTree, readOnlyReason, tab.label, tab.remoteSessionId, tab.workspaceIdentity, tab.workspacePath]);
  /* ---- 任务 CRUD（注入工作区内列表；乐观更新 + 详细日志） ---- */
  const renameTask = React.useCallback(async (taskId: string, title: string): Promise<TaskMeta | null> => {
    if (readOnlyReason) return null;
    const previous = findTask(taskId);
    logger.info("[WorkspaceSidebarItem] rename service call start", { taskId, workspacePath: tab.workspacePath, workspaceIdentity: tab.workspaceIdentity, previousTitleLength: previous?.title.length, nextTitleLength: title.length });
    let updated: TaskMeta;
    try {
      updated = await taskService.renameTask({ taskId, workspacePath: tab.workspacePath, title, ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}) });
    } catch (error) {
      logger.error("[WorkspaceSidebarItem] rename service call failed", { taskId, workspacePath: tab.workspacePath, workspaceIdentity: tab.workspaceIdentity, message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
    logger.info("[WorkspaceSidebarItem] rename service call resolved", { taskId, workspacePath: tab.workspacePath, workspaceIdentity: tab.workspaceIdentity, resolvedTitleLength: updated.title.length });
    upsertOptimisticTaskListItem(tab.workspacePath, updated, tab.workspaceIdentity);
    if (tab.workspaceIdentity) useRemoteWorkspaceTaskListStore.getState().upsertTask(updated);
    applyOptimisticTaskMutation({ previousTask: previous ?? updated, nextTask: updated, previousState: { pinned: false, archived: false }, nextState: { pinned: false, archived: false } });
    logger.info("[WorkspaceSidebarItem] rename cache mutation applied", { taskId, workspacePath: tab.workspacePath, workspaceIdentity: tab.workspaceIdentity });
    return updated;
  }, [tab.workspaceIdentity, tab.workspacePath, findTask, readOnlyReason, upsertOptimisticTaskListItem, taskService]);
  const setTaskPinned = React.useCallback(async (taskId: string, pinned: boolean): Promise<TaskMeta | null> => {
    if (readOnlyReason) return null;
    const previous = findTask(taskId);
    if (previous) {
      if (tab.workspaceIdentity && pinned) {
        useRemotePinnedTaskListStore.getState().upsertTask(previous);
        useRemoteWorkspaceTaskListStore.getState().removeTask(tab.workspacePath, taskId, tab.workspaceIdentity);
      }
      if (tab.workspaceIdentity && !pinned) {
        useRemotePinnedTaskListStore.getState().removeTask(tab.workspacePath, taskId, tab.workspaceIdentity);
        useRemoteWorkspaceTaskListStore.getState().upsertTask(previous);
      }
      applyOptimisticTaskMutation({ previousTask: previous, nextTask: previous, previousState: { pinned: false, archived: false }, nextState: { pinned, archived: false } });
    }
    try {
      const updated = await taskService.setTaskPinned({ taskId, workspacePath: tab.workspacePath, pinned, ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}) });
      removeOptimisticTaskListItem(tab.workspacePath, taskId, tab.workspaceIdentity);
      if (tab.workspaceIdentity && pinned) {
        useRemotePinnedTaskListStore.getState().upsertTask(updated);
        useRemoteWorkspaceTaskListStore.getState().removeTask(tab.workspacePath, taskId, tab.workspaceIdentity);
      }
      if (tab.workspaceIdentity && !pinned) {
        useRemotePinnedTaskListStore.getState().removeTask(tab.workspacePath, taskId, tab.workspaceIdentity);
        useRemoteWorkspaceTaskListStore.getState().upsertTask(updated);
      }
      applyOptimisticTaskMutation({ previousTask: previous ?? updated, nextTask: updated, previousState: { pinned, archived: false }, nextState: { pinned, archived: false } });
      return updated;
    } catch (error) {
      if (previous) {
        if (tab.workspaceIdentity && pinned) {
          useRemotePinnedTaskListStore.getState().removeTask(tab.workspacePath, taskId, tab.workspaceIdentity);
          useRemoteWorkspaceTaskListStore.getState().upsertTask(previous);
        }
        if (tab.workspaceIdentity && !pinned) {
          useRemotePinnedTaskListStore.getState().upsertTask(previous);
          useRemoteWorkspaceTaskListStore.getState().removeTask(tab.workspacePath, taskId, tab.workspaceIdentity);
        }
        applyOptimisticTaskMutation({ previousTask: previous, nextTask: previous, previousState: { pinned, archived: false }, nextState: { pinned: false, archived: false } });
      }
      throw error;
    }
  }, [removeOptimisticTaskListItem, readOnlyReason, tab.workspaceIdentity, tab.workspacePath, findTask, taskService]);
  const archiveTask = React.useCallback(async (taskId: string): Promise<TaskMeta | null> => {
    if (readOnlyReason) return null;
    const previous = findTask(taskId);
    const archived = await taskService.archiveTask({ taskId, workspacePath: tab.workspacePath, ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}) });
    removeTaskState(tab.workspacePath, taskId, tab.workspaceIdentity);
    if (tab.workspaceIdentity) {
      useRemoteWorkspaceTaskListStore.getState().removeTask(tab.workspacePath, taskId, tab.workspaceIdentity);
      useRemotePinnedTaskListStore.getState().removeTask(tab.workspacePath, taskId, tab.workspaceIdentity);
    }
    applyOptimisticTaskMutation({ previousTask: previous ?? archived, nextTask: archived, previousState: { pinned: false, archived: false }, nextState: { pinned: false, archived: true } });
    return archived;
  }, [removeTaskState, readOnlyReason, tab.workspaceIdentity, tab.workspacePath, findTask, taskService]);
  const setTaskUnread = React.useCallback(async (taskId: string, unread: boolean): Promise<TaskMeta | null> => {
    if (readOnlyReason) return null;
    const previous = findTask(taskId);
    const updated = await taskService.setTaskUnread({ taskId, workspacePath: tab.workspacePath, unread, ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}) });
    setTaskUnreadIndicator(tab.workspacePath, taskId, unread, tab.workspaceIdentity);
    upsertOptimisticTaskListItem(tab.workspacePath, updated, tab.workspaceIdentity);
    if (tab.workspaceIdentity) useRemoteWorkspaceTaskListStore.getState().upsertTask(updated);
    applyOptimisticTaskMutation({ previousTask: previous ?? updated, nextTask: updated, previousState: { pinned: false, archived: false }, nextState: { pinned: false, archived: false } });
    return updated;
  }, [readOnlyReason, setTaskUnreadIndicator, tab.workspaceIdentity, tab.workspacePath, findTask, upsertOptimisticTaskListItem, taskService]);
  const copyRemoteError = React.useCallback(async () => {
    if (!remoteError || remoteError.trim().length === 0) return;
    await navigator.clipboard.writeText(remoteError).then(() => {
      setCopiedError(true);
      if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(() => { setCopiedError(false); copiedTimerRef.current = null; }, 1500);
    });
  }, [remoteError]);
  /* ---- 行头内容（图标随远程/主目录/展开态变化） ---- */
  const headerContent = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="relative flex size-4 shrink-0 items-center justify-center">
        {isExpanded && !needsReconnect ? (
          isRemoteTab ? <IconCloud className="h-4 w-4 text-foreground-subtle" />
            : isHomeDirectory ? <IconHouse className="h-4 w-4 text-foreground-subtle" />
            : <IconFolderOpen className="h-4 w-4 text-foreground-subtle" />
        ) : isRemoteTab ? <IconCloud className="h-4 w-4 text-foreground-subtle" />
          : isHomeDirectory ? <IconHouse className="h-4 w-4 text-foreground-subtle" />
          : <IconFolder className="h-4 w-4 text-foreground-subtle" />}
      </span>
      <div className="min-w-0 truncate text-ui-base text-foreground-subtle">{decoratedLabel}</div>
      {!isExpanded && taskListHasUnread ? (
        <span aria-hidden="true" data-workspace-unread-indicator="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500 dark:bg-sky-400" />
      ) : null}
      {readOnlyReason ? (
        <Tooltip title={readOnlyReason} side="right" align="center">
          <span role="img" aria-label={readOnlyReason} tabIndex={0} className="flex size-4 shrink-0 items-center justify-center">
            <IconTriangleAlert className="size-3.5 text-destructive" />
          </span>
        </Tooltip>
      ) : null}
    </div>
  );

  return (
    <li ref={itemRef as React.Ref<HTMLLIElement>} style={itemStyle} className="space-y-2">
      <Collapsible className="flex flex-col gap-1" open={isExpanded && !needsReconnect} onOpenChange={handleExpandedChange}>
        {/* 行头（光束动画包裹；拖拽绑定在触发器上） */}
        <BeamBorderAnimation size="line" colorVariant="colorful" duration={1.96} active={showBeamActive} borderRadius={8}>
          <div className={cn(
            "group flex items-center gap-2 rounded-lg transition-[background-color,box-shadow]",
            isReconnecting ? "bg-brand/10 workspace-remote-connecting-breathe" : needsReconnect ? "bg-warning/8" : null,
            isDragging && "bg-selected shadow-xl",
          )}>
            <CollapsibleTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                data-testid={scopedTestId(TESTID_WORKSPACE_ITEM, tab.workspacePath)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "flex h-8 min-w-0 flex-1 justify-start gap-2 rounded-lg pl-2.5 pr-1 text-left text-foreground aria-expanded:bg-transparent aria-expanded:text-foreground",
                  "hover:bg-surface-hover hover:text-foreground",
                  needsReconnect && "hover:bg-transparent aria-expanded:bg-transparent",
                  sortableBindings && "cursor-grab active:cursor-grabbing",
                )}
                {...(sortableBindings?.attributes ?? {})}
                {...(sortableBindings?.listeners ?? {})}
              >
                {sshInfo ? (
                  /* SSH 连接详情 tooltip（alias/host/path） */
                  <Popover>
                    <PopoverAnchor>
                      <PopoverTrigger asChild>{headerContent}</PopoverTrigger>
                    </PopoverAnchor>
                    <PopoverContent side="right" align="start" sideOffset={6} className="max-w-80 flex-col items-start gap-2 p-2.5 text-left">
                      <span className="text-ui-sm font-medium text-tooltip-foreground">{intl.formatMessage({ id: "workspaceSidebar.sshConnectionTitle" })}</span>
                      <dl className="grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1 text-ui-sm/relaxed text-tooltip-foreground">
                        {sshInfo.alias ? (
                          <>
                            <dt className="font-medium">{intl.formatMessage({ id: "workspaceSidebar.sshConnectionAlias" })}</dt>
                            <dd className="min-w-0 break-all font-mono">{sshInfo.alias}</dd>
                          </>
                        ) : null}
                        <dt className="font-medium">{intl.formatMessage({ id: "workspaceSidebar.sshConnectionHost" })}</dt>
                        <dd className="min-w-0 break-all font-mono">{sshInfo.hostLabel}</dd>
                        <dt className="font-medium">{intl.formatMessage({ id: "workspaceSidebar.sshConnectionPath" })}</dt>
                        <dd className="min-w-0 break-all font-mono">{sshInfo.workspacePath}</dd>
                      </dl>
                    </PopoverContent>
                  </Popover>
                ) : headerContent}
                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex shrink-0 items-center gap-1">
                    {/* 更多菜单：远程同步三项 + 移除工作区 */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm"
                          className="shrink-0 text-foreground-subtle opacity-0 hover:bg-surface-hover hover:text-foreground group-hover:opacity-100"
                          onMouseDown={stopMouseEvent}
                          aria-label={intl.formatMessage({ id: "common.more" })}
                        >
                          <IconEllipsis className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={stopPropagationOnly}>
                        <RemoteSyncMenuItems
                          canSyncSkills={canSyncRemote}
                          canSyncMcp={canSyncRemote}
                          canSyncPlugins={canSyncRemote}
                          stopMouseDownPropagation
                          onOpenSkillSync={() => setSkillSyncOpen(true)}
                          onOpenMcpSync={() => setMcpSyncOpen(true)}
                          onOpenPluginSync={() => setPluginSyncOpen(true)}
                        />
                        <DropdownMenuItem
                          data-testid={scopedTestId(TESTID_WORKSPACE_CLOSE, tab.workspacePath)}
                          onMouseDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
                          onSelect={() => { handleRemoveWorkspace(); }}
                        >
                          <IconX className="h-3.5 w-3.5" />
                          {intl.formatMessage({ id: "workspaceSidebar.remove" })}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* 文件树按钮 */}
                    {canOpenFileTree ? (
                      <Tooltip title={readOnlyReason ?? intl.formatMessage({ id: "workspaceSidebar.showFileTree" })}>
                        <Button type="button" variant="ghost" size="icon-sm"
                          data-testid={scopedTestId(TESTID_WORKSPACE_FILE_TREE_BUTTON, tab.workspacePath)}
                          className="shrink-0 text-foreground-subtle opacity-0 hover:bg-surface-hover hover:text-foreground group-hover:opacity-100"
                          aria-label={intl.formatMessage({ id: "workspaceSidebar.showFileTree" })}
                          onMouseDown={stopMouseEvent}
                          onClick={handleOpenFileTree}
                          disabled={!!readOnlyReason}
                        >
                          <IconListTree className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    ) : null}
                    {/* 未连接：错误详情（可复制）或简单提示 */}
                    {showErrorTooltip ? (
                      remoteError ? (
                        <Popover>
                          <PopoverAnchor>
                            <PopoverTrigger asChild>
                              <div className="flex size-6 shrink-0 items-center justify-center !text-warning cursor-help" aria-label={intl.formatMessage({ id: "workspaceSidebar.notConnected" })}>
                                <IconTriangleAlert className="h-3.5 w-3.5" />
                              </div>
                            </PopoverTrigger>
                          </PopoverAnchor>
                          <PopoverContent side="top" align="center" sideOffset={4} className="w-72 max-w-72 items-center gap-2 p-2.5">
                            <pre className="max-h-32 min-w-0 flex-1 overflow-auto text-ui-sm/relaxed whitespace-pre-wrap break-words font-mono text-tooltip-foreground">{remoteError}</pre>
                            <Button type="button" variant="ghost" size="icon-md"
                              className="mt-0.5 size-6 shrink-0 text-tooltip-foreground/80 hover:bg-tooltip-tag hover:text-tooltip-foreground"
                              onClick={(event: React.MouseEvent) => { event.preventDefault(); event.stopPropagation(); void copyRemoteError(); }}
                              title={intl.formatMessage({ id: copiedError ? "chat.toolCall.copyError.copied" : "chat.toolCall.copyError" })}
                              aria-label={intl.formatMessage({ id: copiedError ? "chat.toolCall.copyError.copied" : "chat.toolCall.copyError" })}
                            >
                              {copiedError ? <IconCheck className="size-3" /> : <IconCopy className="size-3" />}
                            </Button>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Tooltip title={intl.formatMessage({ id: "workspaceSidebar.notConnected" })}>
                          <div className="flex size-6 shrink-0 items-center justify-center !text-warning" aria-label={intl.formatMessage({ id: "workspaceSidebar.notConnected" })}>
                            <IconTriangleAlert className="h-3.5 w-3.5" />
                          </div>
                        </Tooltip>
                      )
                    ) : null}
                    {/* 重连状态：连接中=日志 popover；待重连=重连按钮；否则=新线程按钮 */}
                    {showReconnectActions ? (
                      isReconnecting ? (
                        <RemoteConnectionLogsPopover logs={reconnectLogs}>
                          <div role="status"
                            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }),
                              "shrink-0 text-foreground opacity-100 hover:bg-surface-hover hover:text-foreground group-hover:opacity-100")}
                            onMouseDown={stopMouseEvent}
                            aria-label={intl.formatMessage({ id: "workspaceSidebar.connecting" })}
                          >
                            <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
                          </div>
                        </RemoteConnectionLogsPopover>
                      ) : (
                        <Tooltip title={intl.formatMessage({ id: "workspaceSidebar.reconnect" })} side="right" align="center">
                          <Button type="button" variant="ghost" size="icon-sm"
                            className="shrink-0 text-foreground opacity-100 hover:bg-surface-hover hover:text-foreground group-hover:opacity-100 disabled:opacity-100"
                            onMouseDown={stopMouseEvent}
                            onClick={handleReconnect}
                            aria-label={intl.formatMessage({ id: "workspaceSidebar.reconnect" })}
                          >
                            <IconRefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </Tooltip>
                      )
                    ) : (
                      <Tooltip title={readOnlyReason ?? intl.formatMessage({ id: "taskList.newThread" })}>
                        <Button type="button" variant="ghost" size="icon-sm"
                          className="shrink-0 text-foreground-subtle opacity-0 hover:bg-surface-hover hover:text-foreground group-hover:opacity-100"
                          onMouseDown={stopMouseEvent}
                          onClick={handleNewThread}
                          disabled={!!readOnlyReason}
                          aria-label={intl.formatMessage({ id: "taskList.newThread" })}
                        >
                          <IconMessageCirclePlus className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
          </div>
        </BeamBorderAnimation>
        {/* 展开体：工作区内任务列表 */}
        <CollapsibleContent>
          <WorkspaceTaskList
            workspacePath={tab.workspacePath}
            remoteSessionId={tab.remoteSessionId}
            workspaceIdentity={tab.workspaceIdentity}
            tasks={taskItems}
            pinnedTasks={EMPTY_PINNED_TASKS}
            activeTaskId={isActiveWorkspace ? workspaceActiveTaskId : null}
            onSelectTask={selectTaskInWorkspace}
            showCreateButton={false}
            showFooter={false}
            loading={taskListLoading}
            hasMore={taskListHasMore}
            mobileActiveTaskKey={mobileActiveTaskKey}
            onShowMore={onShowMoreTasks}
            onRenameTask={renameTask}
            onSetTaskPinned={setTaskPinned}
            onArchiveTask={archiveTask}
            onSetTaskUnread={setTaskUnread}
            readOnlyReason={readOnlyReason}
          />
        </CollapsibleContent>
      </Collapsible>
      {/* 远程同步对话框组（技能/MCP/插件；原 r4，TopBar.tsx 已还原） */}
      <RemoteSyncDialogs
        canSyncSkills={canSyncRemote}
        canSyncMcp={canSyncRemote}
        canSyncPlugins={canSyncRemote}
        skillOpen={skillSyncOpen}
        mcpOpen={mcpSyncOpen}
        pluginOpen={pluginSyncOpen}
        onSkillOpenChange={setSkillSyncOpen}
        onMcpOpenChange={setMcpSyncOpen}
        onPluginOpenChange={setPluginSyncOpen}
        localSkillSyncService={baseServices.skillSyncService}
        remoteSkillSyncService={workspaceServices.skillSyncService}
        localMcpSyncService={baseServices.mcpSyncService}
        remoteMcpSyncService={workspaceServices.mcpSyncService}
        localPluginSyncService={baseServices.pluginSyncService}
        remotePluginSyncService={workspaceServices.pluginSyncService}
        localZCodeAgentService={baseServices.zcodeAgentService}
        remoteZCodeAgentService={workspaceServices.zcodeAgentService}
        remoteTarget={tab.remoteTarget}
        skillWorkspacePath={tab.workspacePath}
        mcpWorkspacePath={tab.workspacePath}
        pluginWorkspacePath={tab.workspacePath}
        pluginLocalWorkspacePath={tab.localWorkspacePath ?? undefined} // A0-CLEANUP3 3b：props 面为 string | undefined（null 归一）
        mcpLocalWorkspacePath={tab.localWorkspacePath ?? undefined}
        workspaceIdentity={tab.workspaceIdentity}
        onSkillsSynced={async () => {
          await refreshAfterSkillSync({ zcodeSessionService: workspaceServices.zcodeSessionService, workspacePath: tab.workspacePath, workspaceIdentity: tab.workspaceIdentity, reason: "sidebar-remote-skill-sync" });
          await refreshSkillStoresAfterSync({ workspacePath: tab.workspacePath, workspaceIdentity: tab.workspaceIdentity, skillsService: workspaceServices.skillsService });
        }}
        onMcpSynced={async () => {
          await refreshMcpStoreAfterSync(tab.workspacePath, workspaceServices.mcpSyncService, tab.workspaceIdentity);
        }}
        onPluginsSynced={async () => {
          await refreshAfterPluginSync({
            commandsService: workspaceServices.commandsService,
            mcpSyncService: workspaceServices.mcpSyncService,
            reason: "sidebar-remote-plugin-sync",
            skillsService: workspaceServices.skillsService,
            workspaceIdentity: tab.workspaceIdentity,
            workspacePath: tab.workspacePath,
            zcodeAgentService: workspaceServices.zcodeAgentService,
            zcodeSessionService: workspaceServices.zcodeSessionService,
          });
        }}
      />
    </li>
  );
});
/** 原 Ug 的侧栏调用面：同步后刷新 MCP store */
declare function refreshMcpStoreAfterSync(workspacePath: string, mcpSyncService: unknown, workspaceIdentity?: string | null): Promise<void>;
/** 原 mLt（147286 / 122386 附近）：Web 远控任务段（F17 族，接口级） */
/** 原 nLt（146240 / 121340 附近）：文件树面板（F04 族，接口级） */
/** 原 lLt（146823 / 122323）：归档任务段（结构同时间线段，查询 archived；接口级） */

/* ============================================================================
 * 20. 侧栏骨架助手（原 HBt/VBt/YBt/ZBt/XBt/tVt/lBt，js 156221–159136）
 * ==========================================================================*/

/** 原 VBt（158883 / 131861）：拖拽修饰器——锁 x=0，y 钳制在容器范围内 */
export function restrictDragToVerticalAxis({ transform, draggingNodeRect, activeNodeRect, containerNodeRect, windowRect }: {
  transform: { x: number; y: number; [key: string]: unknown };
  draggingNodeRect?: { top: number; bottom: number } | null;
  activeNodeRect?: { top: number; bottom: number } | null;
  containerNodeRect?: { top: number; bottom: number } | null;
  windowRect?: { top: number; bottom: number } | null;
}) {
  const nodeRect = draggingNodeRect ?? activeNodeRect;
  const bounds = containerNodeRect ?? windowRect;
  if (!nodeRect || !bounds) return { ...transform, x: 0 };
  const topLimit = bounds.top - nodeRect.top;
  const bottomLimit = bounds.bottom - nodeRect.bottom;
  const clampedY = Math.min(Math.max(transform.y, topLimit), bottomLimit);
  return { ...transform, x: 0, y: clampedY };
}
/** 原 XBt（159097 / 132035）：拖拽中的工作区保持展开（被拖行除外） */
function isWorkspaceExpandedDuringDrag(args: { activeDragId: string | null; expanded: boolean; tabId: string }): boolean {
  return args.expanded && args.activeDragId !== args.tabId;
}
/** 原 ZBt（159100 / 132041）：项目行拖拽 → 全量标签重排索引 */
function resolveWorkspaceTabReorder(args: { activeId: string; overId: string; projectTabs: WorkspaceTab[]; workspaceTabs: WorkspaceTab[] }): { fromIndex: number; toIndex: number } | null {
  const activeProjectIndex = args.projectTabs.findIndex((tab) => tab.id === args.activeId);
  const overProjectIndex = args.projectTabs.findIndex((tab) => tab.id === args.overId);
  if (activeProjectIndex === -1 || overProjectIndex === -1) return null;
  const activeGlobalIndex = args.workspaceTabs.findIndex((tab) => tab.id === args.activeId);
  const overTab = args.projectTabs[overProjectIndex];
  const overGlobalIndex = overTab ? args.workspaceTabs.findIndex((tab) => tab.id === overTab.id) : -1;
  return activeGlobalIndex === -1 || overGlobalIndex === -1 ? null : { fromIndex: activeGlobalIndex, toIndex: overGlobalIndex };
}
const WORKSPACE_DRAG_ROW_HEIGHT_PX = 32; // 原 KBt（159062）
/** 原 qBt（159063）：垂直列表拖拽的行位移 */
function workspaceDragRowOffset(args: { index: number; activeIndex: number; overIndex: number; itemGap: number }): number {
  const step = WORKSPACE_DRAG_ROW_HEIGHT_PX + Math.max(0, args.itemGap);
  if (args.index < args.activeIndex && args.index >= args.overIndex) return step;
  if (args.index > args.activeIndex && args.index <= args.overIndex) return -step;
  return 0;
}
/** 原 JBt（159071）：相邻行间距 */
function workspaceDragItemGap(rects: Array<{ top: number; bottom: number }>, index: number, activeIndex: number): number {
  const rect = rects[index];
  if (!rect) return 0;
  if (activeIndex < index) {
    const previous = rects[index - 1];
    return previous ? rect.top - previous.bottom : 0;
  }
  const next = rects[index + 1];
  return next ? next.top - rect.bottom : 0;
}
/** 原 YBt（159081 / 132008）：项目列表拖拽位移策略（垂直列表） */
export function workspaceListDragTransition({ activeIndex, activeNodeRect, index, overIndex, rects }: {
  activeIndex: number;
  activeNodeRect: { top: number; bottom: number } | null;
  index: number;
  overIndex: number;
  rects: Array<{ top: number; bottom: number }>;
}): { x: number; y: number; scaleX: number; scaleY: number } | null {
  const activeRect = rects[activeIndex] ?? activeNodeRect;
  if (!activeRect) return null;
  if (index === activeIndex) {
    const overRect = rects[overIndex];
    return overRect
      ? { x: 0, y: activeIndex < overIndex ? overRect.bottom - activeRect.bottom : overRect.top - activeRect.top, scaleX: 1, scaleY: 1 }
      : null;
  }
  return {
    x: 0,
    y: workspaceDragRowOffset({ activeIndex, index, itemGap: workspaceDragItemGap(rects, index, activeIndex), overIndex }),
    scaleX: 1,
    scaleY: 1,
  };
}
/** 原 tVt（159114 / 132061）：项目行拖拽浮层 */
export function WorkspaceTabDragOverlay({ tab, width }: { tab: WorkspaceTab; width: number | null }) {
  const isRemote = !!(tab.remoteSessionId || tab.remoteTarget || tab.workspaceIdentity);
  return (
    <div
      data-testid="workspace-drag-overlay"
      className="pointer-events-none flex cursor-grabbing items-center rounded-lg border border-border bg-background text-ui-base text-foreground shadow-lg h-8 px-2.5 gap-2 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0"
      style={width ? { width } : undefined}
    >
      {isRemote ? (
        <IconCloud className="size-3.5 shrink-0 text-foreground-subtle" />
      ) : (
        <IconFolder className="size-3.5 shrink-0 text-foreground-subtle" />
      )}
      <span className="min-w-0 flex-1 truncate px-1">{tab.label}</span>
    </div>
  );
}
const STICKY_HEADER_EXIT_DELAY_MS = 150; // 原 cBt（156221）
/** 原 lBt（156222 / 128901）：吸顶头插槽——内容消失后延迟 150ms 淡出 */
export function StickyHeaderSlot({ header }: { header: React.ReactNode }) {
  const [content, setContent] = React.useState<React.ReactNode>(header);
  const [visible, setVisible] = React.useState(!!header);
  React.useEffect(() => {
    if (header) {
      setContent(header);
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = window.setTimeout(() => { setContent(null); }, STICKY_HEADER_EXIT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [header]);
  return content ? (
    <div className={cn(
      "pointer-events-auto absolute left-0 right-0 top-0 z-20 pt-1",
      "transition-[opacity,transform] duration-150 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none",
      visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
    )}>
      {content}
    </div>
  ) : null;
}
/* ============================================================================
 * 20b. HOME-SEG：Home 段——扁平对话 list（webchat 式）
 *     HOME-ISO：Home 隔离——只列 Home 发起的会话（kind='home'，助手路）。
 *     数据源＝虚拟工作区 __home__ 的 sessions-index：adapter 按发起面 kind 路由
 *     （home 会话进 __home__ scope；task 会话进 cwd scope，互斥）。存量会话默认
 *     kind='task'，Home 发起面 UI 尚无 → 此处恒空，渲染空态「还没有对话」。
 *     条目形状＝适配器 indexUpsert 产物：{sessionId, workspaceId, title, titleSource,
 *     phase, sessionEnded, hasBackgroundWork, lastActivityAt, createdAt}。
 * ==========================================================================*/

/** HOME-SEG：Home 会话条目（SessionIndexEntry 子集） */
interface HomeConversationEntry {
  sessionId: string;
  title?: string;
  lastActivityAt: number;
  [key: string]: unknown;
}
interface HomeSessionIndexStore {
  subscribe(listener: () => void): () => void;
  getSessions(): HomeConversationEntry[];
}
interface HomeSessionIndexScope {
  workspaceKey: string;
  workspacePath: string;
  workspaceIdentity?: string;
}

const HOME_NO_SESSIONS: HomeConversationEntry[] = [];
const HOME_ISO_SCOPE_KEY = "__home__"; // HOME-ISO：Home 虚拟工作区（与 adapter HOME_WORKSPACE_ID 一致）
/** HOME-SEG：Home 段数据钩子——HOME-ISO：订阅 __home__ 作用域（与当前工作区无关） */
function useHomeConversations(): HomeConversationEntry[] {
  const { zcodeAgentService } = useBaseServices();
  const [sessions, setSessions] = React.useState<HomeConversationEntry[]>(HOME_NO_SESSIONS);
  React.useEffect(() => {
    if (!zcodeAgentService) return;
    const scope: HomeSessionIndexScope = {
      workspaceKey: HOME_ISO_SCOPE_KEY,
      workspacePath: HOME_ISO_SCOPE_KEY,
    };
    const store = acquireSessionIndexStore(scope, zcodeAgentService);
    const sync = () => setSessions(store.getSessions());
    const unsubscribe = store.subscribe(sync);
    sync();
    return () => { unsubscribe(); releaseSessionIndexStore(scope, store); };
  }, [zcodeAgentService]);
  return sessions;
}

/** HOME-SEG：Home 视图——扁平对话 list。行＝会话标题（truncate；空题回退 sessionId 前 8 位）
 *  + 相对时间；三态配方照抄现有任务行（默认透明 / hover:bg-surface-hover / 选中 bg-selected）；
 *  点击＝复用任务打开路径 onSelectTask。HOME-ISO：数据与当前工作区无关（__home__ 作用域）；
 *  workspacePath/identity 仅用于点击路由（home 会话尚无，待 Home 发起面落地后条目应携带真实
 *  cwd——adapter sessionCwdHints 已可解析）。 */
export function HomeConversationsSection(props: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  activeTaskId?: string | null;
  onSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
}) {
  const { intl } = useIntlContext();
  const sessions = useHomeConversations();
  if (sessions.length === 0) {
    return (
      <div data-testid="home-conversation-empty" className="px-3 py-2 text-ui-base text-foreground-subtle">
        {intl.formatMessage({ id: "workspaceSidebar.homeNoConversations" })}
      </div>
    );
  }
  return (
    <ul data-testid="home-conversation-list" className="space-y-0.5 pb-4">
      {sessions.map((session) => {
        const title = session.title || String(session.sessionId).slice(0, 8);
        const isActive = session.sessionId === props.activeTaskId;
        return (
          <li
            key={session.sessionId}
            data-testid="home-conversation-row"
            data-home-session-id={session.sessionId}
            data-home-session-active={isActive ? "true" : undefined}
            onClick={() => props.onSelectTask(props.workspacePath, session.sessionId, props.workspaceIdentity)}
            className={cn(
              "group/task-item flex cursor-pointer items-center gap-2 rounded-lg pl-2.5 pr-1 py-1 transition-[background-color,border-color,box-shadow]",
              isActive ? "bg-selected" : "hover:bg-surface-hover",
            )}
          >
            <span className="min-w-0 flex-1 truncate text-foreground" title={title}>{title}</span>
            <span className="shrink-0 text-ui-xs text-foreground-subtlest">{formatRelativeTime(session.lastActivityAt, intl)}</span>
          </li>
        );
      })}
    </ul>
  );
}
/* ============================================================================
 * 20c. WS-ENUM：项目分段＝全部 daemon 已知 workspace 的任务
 *     枚举来源＝window.zcode.listNofyWorkspaces（main 侧 workspace-registry：
 *     优先 ACP _nofy/session_summaries/workspace_list，回退 ~/.nofy/sessions
 *     目录扫描 URL-decode）。含从未在桌面打开的 workspace（如 Z-Image）。
 *     懒加载：项目行展开时才 acquire 该 workspace 的 sessions-index
 *     （acquireSessionIndexStore/releaseSessionIndexStore 引用计数池）。
 *     点击未打开 workspace 的任务＝复用任务打开路径 onSelectTask
 *     （handleSelectTaskAcrossWorkspaces → resolveAutomationsRunTab →
 *     addLocalWorkspaceTab 补开 tab → openSessionBesideDraft）。
 * ==========================================================================*/

/** WS-ENUM：main 侧枚举返回的 workspace 形状 */
interface WsEnumSession {
  sessionId: string;
  title?: string;
  updatedAt?: number;
  createdAt?: number;
  lastActivityAt?: number;
}
interface WsEnumWorkspace {
  path: string;
  sessions: WsEnumSession[];
}
declare global {
  interface Window {
    zcode?: {
      listNofyWorkspaces?(opts?: { refresh?: boolean }): Promise<{
        ok?: boolean;
        source?: string;
        workspaces?: WsEnumWorkspace[];
      }>;
      [key: string]: unknown;
    };
  }
}
const WS_ENUM_NO_WORKSPACES: WsEnumWorkspace[] = [];

/** WS-ENUM：全量 daemon 已知 workspace 钩子（项目段启用；window focus 刷新） */
function useWsEnumKnownWorkspaces(enabled: boolean): { workspaces: WsEnumWorkspace[]; source: string; loading: boolean } {
  const [state, setState] = React.useState({ workspaces: WS_ENUM_NO_WORKSPACES, source: "", loading: false });
  const refresh = React.useCallback(() => {
    const bridge = typeof window === "undefined" ? undefined : window.zcode;
    if (!bridge?.listNofyWorkspaces) return;
    setState((s) => ({ ...s, loading: true }));
    bridge.listNofyWorkspaces({}).then(
      (res) => setState({ workspaces: res?.workspaces ?? WS_ENUM_NO_WORKSPACES, source: res?.source ?? "", loading: false }),
      () => setState((s) => ({ ...s, loading: false })),
    );
  }, []);
  React.useEffect(() => {
    if (!enabled) return;
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [enabled, refresh]);
  return state;
}

/** WS-ENUM：懒加载 sessions-index——仅项目行展开时 acquire（展开前用枚举种子） */
function useWsEnumWorkspaceSessions(workspacePath: string, expanded: boolean, seed?: WsEnumSession[]): WsEnumSession[] {
  const { zcodeAgentService } = useBaseServices();
  const [live, setLive] = React.useState<WsEnumSession[] | null>(null);
  React.useEffect(() => {
    if (!expanded || !zcodeAgentService) return;
    const scope: HomeSessionIndexScope = { workspaceKey: workspacePath, workspacePath };
    const store = acquireSessionIndexStore(scope, zcodeAgentService);
    const sync = () => setLive(store.getSessions() as WsEnumSession[]);
    const unsubscribe = store.subscribe(sync);
    sync();
    return () => { unsubscribe(); releaseSessionIndexStore(scope, store); };
  }, [expanded, zcodeAgentService, workspacePath]);
  return live && live.length ? live : seed?.length ? seed : live ?? HOME_NO_SESSIONS;
}

/** WS-ENUM：未打开 workspace 行——头（折叠/名称/计数）+ 展开后的会话 list */
export function WsEnumWorkspaceRow(props: {
  ws: WsEnumWorkspace;
  expanded: boolean;
  onToggle: () => void;
  activeTaskId?: string | null;
  onSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
}) {
  const { intl } = useIntlContext();
  const sessions = useWsEnumWorkspaceSessions(props.ws.path, props.expanded, props.ws.sessions);
  const name = props.ws.path.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? props.ws.path;
  return (
    <li data-testid="ws-enum-workspace-row" data-ws-enum-path={props.ws.path} className="rounded-lg">
      <button type="button" data-testid="ws-enum-workspace-toggle" onClick={props.onToggle}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-surface-hover">
        <IconFolder aria-hidden="true" className="size-3.5 shrink-0 text-foreground-subtle" />
        <span className="min-w-0 flex-1 truncate text-ui-sm font-medium text-foreground" title={props.ws.path}>{name}</span>
        <span className="shrink-0 text-ui-xs text-foreground-subtlest">{String(props.ws.sessions?.length ?? 0)}</span>
      </button>
      {props.expanded ? (
        sessions.length ? (
          <ul className="mt-0.5 space-y-0.5 pb-2">
            {sessions.map((session) => {
              const title = session.title || String(session.sessionId).slice(0, 8);
              const isActive = session.sessionId === props.activeTaskId;
              return (
                <li key={session.sessionId} data-testid="ws-enum-session-row" data-ws-enum-session-id={session.sessionId}
                  onClick={() => props.onSelectTask(props.ws.path, session.sessionId)}
                  className={cn(
                    "group/task-item flex cursor-pointer items-center gap-2 rounded-lg pl-2.5 pr-1 py-1 transition-[background-color,border-color,box-shadow]",
                    isActive ? "bg-selected" : "hover:bg-surface-hover",
                  )}>
                  <span className="min-w-0 flex-1 truncate text-foreground" title={title}>{title}</span>
                  <span className="shrink-0 text-ui-xs text-foreground-subtlest">{formatRelativeTime(session.lastActivityAt ?? session.updatedAt ?? 0, intl)}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div data-testid="ws-enum-sessions-empty" className="px-3 py-1.5 text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: "workspaceSidebar.homeNoConversations" })}
          </div>
        )
      ) : null}
    </li>
  );
}

/** WS-ENUM：未打开 workspace 行列表（项目段内、tab 项目行之后） */
export function WsEnumSection(props: {
  rows: WsEnumWorkspace[];
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  activeTaskId?: string | null;
  onSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
}) {
  return (
    <ul data-testid="ws-enum-list" className="space-y-1 pb-4">
      {props.rows.map((ws) => (
        <WsEnumWorkspaceRow key={ws.path} ws={ws} expanded={props.expandedPaths.has(ws.path)}
          onToggle={() => props.onToggle(ws.path)} activeTaskId={props.activeTaskId} onSelectTask={props.onSelectTask} />
      ))}
    </ul>
  );
}
/* ============================================================================
 * 21. 侧栏根组件（原 rVt，js 159137–160322 / jsx 132075–132772）
 *     aside h-full flex-col = h-12 drag 条 + 导航 4 行（新建任务/搜索/自动化/技能）
 *     + 滚动区（分段行 + 置顶段 + Home|项目分段 或 时间线/归档视图）
 *     + 页脚 + 文件树滑层（右滑覆盖）。HOME-SEG：分组视图渲染路径已删除。
 * ==========================================================================*/

const EMPTY_TASK_ITEMS: TaskMeta[] = []; // 原 $Bt（159112）
const EMPTY_REMOTE_LOGS: Record<string, Array<{ id: string; timestamp: string; level: string; message: string }>> = {}; // 原 eVt

interface WorkspaceSidebarProps {
  workspacePath: string;
  workspaceRemoteSessionId?: string | null;
  activePreviewPath?: string | null;
  onSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
  onStartDraftInWorkspace: (workspacePath: string, workspaceIdentity?: string | null) => void;
  onOpenCodeViewer?: (request: Record<string, unknown>) => void;
  onOpenBrowserUrl?: (url: string) => void;
  fileTreeOpenRequest?: { target: string } | null;
  onCreateTask: (opts?: { groupedDraftPlacement: GroupedDraftPlacement }) => void;
  onCreateConversationTask?: () => void;
  onOpenFolderFromWorkspaceMenu?: () => void;
  onOpenRemoteWorkspace?: () => void;
  /* A0-CLEANUP4：收 SidebarLeaves WebRemoteSwitcher 面——WebRemoteTaskListSection（原 mLt）switcher 同形 */
  webRemoteControlWorkspaceSwitcher?: WebRemoteSwitcher | null;
  theme: ThemeId;
  onConnectRemote?: () => void;
  onSelectRemoteProject?: () => void;
  onCancelRemoteProject?: () => void;
  onReconnectRemoteWorkspace?: (workspaceKey: string) => void;
  onLogout?: () => void;
  onLogin?: () => void;
  user?: SidebarUser | null;
  reconnectingRemoteWorkspaceKeys?: string[];
  remoteWorkspaceErrorByWorkspaceKey?: Record<string, string | undefined>;
  reconnectingRemoteWorkspaceLogsByWorkspaceKey?: Record<string, Array<{ id: string; timestamp: string; level: string; message: string }>>;
  isDesktop?: boolean;
  isWebRemoteControl?: boolean;
  isMacDesktop?: boolean;
  isWindowsDesktop?: boolean;
  isSidebarVisible?: boolean;
  onToggleSidebar?: () => void;
  toggleSidebarShortcutLabel?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
  goBackShortcutLabel?: string;
  goForwardShortcutLabel?: string;
  onOpenCommandCenter?: () => void;
  onOpenRepoWiki?: () => void;
  repoWikiActive?: boolean;
  onOpenAutomations?: () => void;
  automationsActive?: boolean;
  onFileTreeOpenChange?: (open: boolean) => void;
  /* A0-CLEANUP4：与 mLt/iPt 调用面对齐——onTaskOpen 收 {crossWorkspace}（bundle jsx 148809 qn 解构面）、
     切换中回调收任务键 string | null（iPt onSwitchingChange(taskKey/null)，SidebarLeaves 3417/3435） */
  onWebRemoteTaskOpen?: (info: { crossWorkspace: boolean }) => void;
  onWebRemoteTaskSwitchingChange?: (key: string | null) => void;
}

export const WorkspaceSidebar = React.memo(function WorkspaceSidebar(props: WorkspaceSidebarProps) {
  const {
    workspacePath, workspaceRemoteSessionId, activePreviewPath, onSelectTask, onStartDraftInWorkspace,
    onOpenCodeViewer, onOpenBrowserUrl, fileTreeOpenRequest, onCreateTask, onCreateConversationTask,
    onOpenFolderFromWorkspaceMenu, onOpenRemoteWorkspace, webRemoteControlWorkspaceSwitcher, theme,
    onReconnectRemoteWorkspace, onLogout, onLogin, user,
    reconnectingRemoteWorkspaceKeys = [], remoteWorkspaceErrorByWorkspaceKey = {},
    reconnectingRemoteWorkspaceLogsByWorkspaceKey = EMPTY_REMOTE_LOGS,
    isDesktop = false, isWebRemoteControl = false, isSidebarVisible = true,
    onOpenCommandCenter, onOpenRepoWiki, repoWikiActive = false, onOpenAutomations, automationsActive = false,
    onFileTreeOpenChange, onWebRemoteTaskOpen, onWebRemoteTaskSwitchingChange,
  } = props;
  const { intl, localePreference, setLocalePreference } = useIntlContext();
  const { openCodingPlanUpgrade } = useCodingPlanUpgrade();
  const webRemoteControlEnabled = useWebRemoteControlEnabled();
  const bumpTaskListVersion = useTaskStore((state) => state.bumpTaskListVersion);
  // 活动工作区身份（仅当活动标签属于当前工作区）
  const activeWorkspaceIdentity = useTabStore((state) => {
    if (!state.activeTabId) return undefined;
    const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
    if (!activeTab || !isTaskWorkspaceTab(activeTab) || activeTab.workspacePath !== workspacePath) return undefined;
    return activeTab.workspaceIdentity;
  });
  const localDirectoryUnavailable = useTabStore((state) => isLocalDirectoryUnavailableSelector(state, workspacePath, activeWorkspaceIdentity));
  const sidebarDisabledReason = localDirectoryUnavailable ? intl.formatMessage({ id: "workspaceSidebar.unavailableLocalDirectory" }) : undefined;
  const setTheme = useSettingsStore((state) => state.setTheme);
  const commandCenterShortcut = shortcutLabel("K");
  const tabs = useTabStore((state) => state.tabs);
  const activateTab = useTabStore((state) => state.activateTab);
  const closeTab = useTabStore((state) => state.closeTab);
  const openSettingsTab = useTabStore((state) => state.openSettingsTab);
  const expandedWorkspacePaths = useTabStore((state) => state.expandedWorkspacePaths);
  const toggleWorkspaceExpanded = useTabStore((state) => state.toggleWorkspaceExpanded);
  const reorderWorkspaceTabs = useTabStore((state) => state.reorderWorkspaceTabs);
  const expandAllWorkspaceTabs = useTabStore((state) => state.expandAllWorkspaceTabs);
  const collapseAllWorkspaceTabs = useTabStore((state) => state.collapseAllWorkspaceTabs);
  const taskWorkspaceTabs = React.useMemo(() => tabs.filter(isTaskWorkspaceTab), [tabs]);
  const { conversationWorkspaceTabs, projectWorkspaceTabs } = React.useMemo(() => partitionWorkspaceTabsByPurpose(taskWorkspaceTabs), [taskWorkspaceTabs]);
  const projectWorkspacePaths = React.useMemo(() => projectWorkspaceTabs.map((tab) => tab.workspacePath), [projectWorkspaceTabs]);
  const allProjectsExpanded = React.useMemo(
    () => projectWorkspacePaths.length > 0 && projectWorkspacePaths.every((path) => expandedWorkspacePaths.has(path)),
    [expandedWorkspacePaths, projectWorkspacePaths],
  );
  /* ---- 本地状态 ---- */
  const [showArchivedTasks, setShowArchivedTasks] = React.useState(false);
  const [fileTreeOpen, setFileTreeOpen] = React.useState(false);
  const [fileTreeRequest, setFileTreeRequest] = React.useState<FileTreeRequest | null>(null);
  const [stickyGroupHeader, setStickyGroupHeader] = React.useState<React.ReactNode>(null);
  const [taskOrganizeBy, setTaskOrganizeBy] = React.useState<TaskOrganizeBy>(() => loadSidebarTaskPreferences().organizeBy);
  const [taskSortBy, setTaskSortBy] = React.useState<TaskSortBy>(() => loadSidebarTaskPreferences().sortBy);
  const [purposeSectionPreferences, setPurposeSectionPreferences] = React.useState<PurposeSectionPreferences>(loadPurposeSectionPreferences);
  const [lastNonGroupedOrganizeBy, setLastNonGroupedOrganizeBy] = React.useState<TaskOrganizeBy>(() => (loadSidebarTaskPreferences().organizeBy === "chronological" ? "chronological" : "project"));
  const [visibleLimitByWorkspaceKey, setVisibleLimitByWorkspaceKey] = React.useState<Record<string, number>>({});
  const [activeDragTabId, setActiveDragTabId] = React.useState<string | null>(null);
  const [activeDragTabWidth, setActiveDragTabWidth] = React.useState<number | null>(null);
  const [collapsedWorkspaceKeys, setCollapsedWorkspaceKeys] = React.useState<Set<string>>(() => new Set());
  const [workspaceGroupKeys, setWorkspaceGroupKeys] = React.useState<string[]>([]);
  const [crossWorkspaceSwitching, setCrossWorkspaceSwitching] = React.useState(false);
  const [webRemoteTaskGroupKeys, setWebRemoteTaskGroupKeys] = React.useState<string[]>([]);
  const [webRemoteHasTasks, setWebRemoteHasTasks] = React.useState<boolean | null>(null);
  // HOME-SEG：分组视图状态族（groupedTaskGroupIds/水合/末次组 id/有无任务/折叠组 id）随分组渲染路径删除
  const segmentThumbRefs = React.useRef<{ workspace: HTMLButtonElement | null; home: HTMLButtonElement | null }>({ workspace: null, home: null });
  const setProjectsExpanded = React.useCallback((expanded: boolean) => {
    setPurposeSectionPreferences((current) => {
      if (current.projectsExpanded === expanded) return current;
      const next = { ...current, projectsExpanded: expanded };
      savePurposeSectionPreferences(next);
      return next;
    });
  }, []);
  const setConversationsExpanded = React.useCallback((expanded: boolean) => {
    setPurposeSectionPreferences((current) => {
      if (current.conversationsExpanded === expanded) return current;
      const next = { ...current, conversationsExpanded: expanded };
      savePurposeSectionPreferences(next);
      return next;
    });
  }, []);
  // 分段重排（项目 ↔ 会话）
  const handleSectionDragEnd = React.useCallback((event: DndEvent) => {
    if (!event.over || event.active.id === event.over.id) return;
    const activeSectionId = String(event.active.id);
    const overSectionId = String(event.over.id);
    setPurposeSectionPreferences((current) => {
      const nextOrder = reorderSectionOrder(current.sectionOrder, activeSectionId, overSectionId);
      if (nextOrder.every((id, index) => id === current.sectionOrder[index])) return current;
      const next = { ...current, sectionOrder: nextOrder };
      savePurposeSectionPreferences(next);
      return next;
    });
  }, []);
  const segmentListRef = React.useRef<HTMLDivElement>(null);
  const [segmentThumbStyle, setSegmentThumbStyle] = React.useState<{ opacity: number; transform: string; width: number }>({ opacity: 0, transform: "translateX(0px)", width: 0 });
  const previousExpandToggleRef = React.useRef<{ canToggle: boolean; areAllExpanded: boolean; messageId: string } | null>(null);
  const [scrollFadeTop, setScrollFadeTop] = React.useState(false);
  const [scrollFadeBottom, setScrollFadeBottom] = React.useState(false);
  // HOME-SEG：persistCollapsedGroupIds / handleGroupedTaskGroupIdsChange 随分组渲染路径删除
  // Web 远控工作区分组键上报
  /** 原 Dt（159283）：Web 远控列表上报工作区分组键——进入跨工作区切换态、
   *  记录有无任务、保留最近一次非空键、更新当前键（引用稳定化）、裁剪折叠集合 */
  const handleWebRemoteWorkspaceGroupKeysChange = React.useCallback((keys: string[]) => {
    setCrossWorkspaceSwitching(true);
    setWebRemoteHasTasks(keys.length > 0);
    if (keys.length > 0) setWebRemoteTaskGroupKeys(keys);
    setWorkspaceGroupKeys((current) => (current.length === keys.length && current.every((key, index) => key === keys[index]) ? current : keys));
    setCollapsedWorkspaceKeys((current) => {
      const allowed = new Set(keys);
      const next = new Set([...current].filter((key) => allowed.has(key)));
      return next.size === current.size && [...next].every((key) => current.has(key)) ? current : next;
    });
  }, []);
  /** 原 fn（159459）：打开自动化（定时任务）设置 */
  const handleOpenAutomations = React.useCallback(() => {
    onOpenAutomations?.();
  }, [onOpenAutomations]);
  /* ---- 副作用：文件树请求/偏好持久化/视图模式联动 ---- */
  React.useEffect(() => {
    if (fileTreeOpenRequest) { setFileTreeRequest(fileTreeOpenRequest.target as unknown as FileTreeRequest); setFileTreeOpen(true); }
  }, [fileTreeOpenRequest]);
  React.useEffect(() => { onFileTreeOpenChange?.(fileTreeOpen); }, [fileTreeOpen, onFileTreeOpenChange]);
  React.useEffect(() => () => onFileTreeOpenChange?.(false), [onFileTreeOpenChange]);
  React.useEffect(() => {
    saveSidebarTaskPreferences({ organizeBy: taskOrganizeBy, sortBy: taskSortBy });
  }, [taskOrganizeBy, taskSortBy]);
  React.useEffect(() => {
    if (taskOrganizeBy === "project" || taskOrganizeBy === "chronological") setLastNonGroupedOrganizeBy(taskOrganizeBy);
  }, [taskOrganizeBy]);

  const isWebRemoteMode = !!(webRemoteControlWorkspaceSwitcher || isWebRemoteControl);
  const baseTaskViewMode = resolveTaskViewMode({ showArchivedTasks, taskOrganizeBy });
  // HOME-SEG：远控壳无 Home 段，回退项目视图（原 grouped 回退同构）
  const taskViewMode = isWebRemoteMode && baseTaskViewMode === "home" ? "workspace" : baseTaskViewMode;
  // 项目视图下「已展开工作区」的键集合（用于可见数限制的清理）
  const expandedProjectKeys = React.useMemo(
    () => expandedWorkspaceKeySet({ enabled: !isWebRemoteMode && taskViewMode === "workspace" && purposeSectionPreferences.projectsExpanded, expandedWorkspacePaths, workspaces: projectWorkspaceTabs }),
    [taskViewMode, expandedWorkspacePaths, isWebRemoteMode, projectWorkspaceTabs, purposeSectionPreferences.projectsExpanded],
  );
  React.useEffect(() => {
    setVisibleLimitByWorkspaceKey((current) => pruneVisibleLimits(current, expandedProjectKeys));
  }, [expandedProjectKeys]);
  React.useEffect(() => {
    // HOME-SEG：分组视图已删除——吸顶分组头/文件树请求恒清（运行树同构 Fe(null)）
    setStickyGroupHeader(null);
    setFileTreeRequest(null);
  }, [baseTaskViewMode]);
  React.useEffect(() => {
    if (!isWebRemoteMode || taskViewMode !== "workspace") return;
    setCrossWorkspaceSwitching(false);
  }, [taskViewMode, isWebRemoteMode]);

  // HOME-SEG：分组视图动作注入（新建组 / 新建草稿）随分组渲染路径删除
  const showPurposeSections = !isWebRemoteMode && (baseTaskViewMode === "workspace" || baseTaskViewMode === "timeline" || baseTaskViewMode === "archived");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  /* ---- 项目行拖拽（段内垂直排序 + 浮层 portal） ---- */
  const sectionDragSensors = makeSensors(pointerSensorFactory({ activationConstraint: { distance: 8 } }));
  const workspaceDragSensors = makeSensors(
    pointerSensorFactory({ activationConstraint: { distance: 8 } }),
    keyboardSensorFactory({ coordinateGetter: sortableKeyboardCoordinates }),
  );
  const localeMenuValue = localePreference === "system" ? "system" : localePreference;
  // 项目视图数据（每工作区分组：条目/总数/更多/未读）
  const workspaceTaskGroups = useWorkspaceTaskGroups({
    workspaceTabs: projectWorkspaceTabs,
    activeWorkspacePath: workspacePath,
    activeWorkspaceIdentity,
    sortBy: taskSortBy,
    visibleLimitByWorkspaceKey,
    defaultVisibleLimit: 5,
  });
  const handleOpenRepoWikiForFileTree = React.useCallback(() => {
    if (!fileTreeRequest || !onOpenRepoWiki) return;
    const key = workspaceKey(fileTreeRequest.workspacePath, fileTreeRequest.workspaceIdentity);
    const tab = taskWorkspaceTabs.find((item) => workspaceKey(item.workspacePath, item.workspaceIdentity) === key);
    if (tab) activateTab(tab.id);
    onOpenRepoWiki();
  }, [activateTab, fileTreeRequest, onOpenRepoWiki, taskWorkspaceTabs]);
  const repoWikiActiveForFileTree = !!(repoWikiActive && fileTreeRequest && workspaceKey(fileTreeRequest.workspacePath, fileTreeRequest.workspaceIdentity) === workspaceKey(workspacePath, activeWorkspaceIdentity));
  const webRemoteControlStatus = useWebRemoteControlStatusPolling({ enabled: isDesktop && webRemoteControlEnabled });
  const mobileActiveTaskKey = React.useMemo(() => {
    const viewState = webRemoteControlStatus.mobileViewState;
    return !webRemoteControlStatus.mobileConnected || !viewState?.activeWorkspaceKey || !viewState.activeTaskId
      ? null
      : viewState.activeWorkspaceKey + ":" + viewState.activeTaskId;
  }, [webRemoteControlStatus.mobileConnected, webRemoteControlStatus.mobileViewState]);
  const workspaceGroupByKey = React.useMemo(
    () => new Map(workspaceTaskGroups.groups.map((group) => [workspaceKey(group.workspacePath, group.workspaceIdentity), group])),
    [workspaceTaskGroups.groups],
  );
  const showMoreWorkspaceTasks = React.useCallback((key: string) => {
    setVisibleLimitByWorkspaceKey((current) => incrementVisibleLimit(current, key));
  }, []);
  const openFileTreeForWorkspace = React.useCallback((request: FileTreeRequest) => {
    setFileTreeRequest(request);
    setFileTreeOpen(true);
  }, []);
  const fileTreeRequestRef = React.useRef<FileTreeRequest | null>(null);

  // Web 远控：同步当前活动任务到手机端视图状态
  const activeTaskIdForMobile = useTaskStore((state) => getWorkspaceSlice(state, workspacePath, activeWorkspaceIdentity).activeTaskId);
  React.useEffect(() => {
    if (!webRemoteControlWorkspaceSwitcher?.updateMobileViewState || !activeTaskIdForMobile) return;
    const key = workspaceKey(workspacePath, activeWorkspaceIdentity);
    webRemoteControlWorkspaceSwitcher.updateMobileViewState(key, activeTaskIdForMobile).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn("[WorkspaceSidebar] 同步远控 mobileViewState 失败", { error: message, workspaceKey: key, taskId: activeTaskIdForMobile });
    });
  }, [activeTaskIdForMobile, webRemoteControlWorkspaceSwitcher, activeWorkspaceIdentity, workspacePath]);
  /* ---- 滚动边缘渐隐遮罩（上下 32px 渐变） ---- */
  const scrollMaskStyle = React.useMemo(() => {
    const base: React.CSSProperties = { overflowAnchor: "none" };
    if (!scrollFadeTop && !scrollFadeBottom) return base;
    const topStops = scrollFadeTop ? "transparent 0px, black 32px" : "black 0px, black 32px";
    const bottomStops = scrollFadeBottom
      ? "black calc(100% - 32px), transparent 100%"
      : "black calc(100% - 32px), black 100%";
    return {
      ...base,
      WebkitMaskImage: "linear-gradient(to bottom, " + topStops + ", " + bottomStops + ")",
      maskImage: "linear-gradient(to bottom, " + topStops + ", " + bottomStops + ")",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
    };
  }, [scrollFadeBottom, scrollFadeTop]);

  /* ---- 分段行（分组|项目）滑块指示器（测量 offsetLeft/width） ---- */
  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const update = () => {
      const scrollable = el.scrollHeight > el.clientHeight + 1;
      const atTop = el.scrollTop <= 1;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      setScrollFadeTop(scrollable && !atTop);
      setScrollFadeBottom(scrollable && !atBottom);
    };
    let frame: number | null = null;
    update();
    const schedule = () => {
      if (frame === null) {
        frame = requestAnimationFrame(() => { frame = null; update(); });
      }
    };
    const observer = new ResizeObserver(() => { schedule(); });
    observer.observe(el);
    const firstChild = el.firstElementChild;
    if (firstChild instanceof HTMLElement) observer.observe(firstChild);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [expandedWorkspacePaths, taskWorkspaceTabs.length]);
  const segmentMode = !isWebRemoteMode && taskOrganizeBy === "home" ? "home" : "workspace"; // HOME-SEG：Home｜项目
  const segmentSortMode = taskOrganizeBy === "chronological" ? "chronological" : "project";
  // WS-ENUM：项目分段枚举全部 daemon 已知 workspace（含从未在桌面打开的）。
  // 仅项目段（非远控壳、非 Home 段、非归档）时拉取；window focus 时刷新。
  const wsEnumState = useWsEnumKnownWorkspaces(!isWebRemoteMode && taskOrganizeBy !== "home" && !showArchivedTasks);
  const [wsEnumExpandedPaths, setWsEnumExpandedPaths] = React.useState<Set<string>>(() => new Set());
  const wsEnumToggle = React.useCallback((wsPath: string) => {
    setWsEnumExpandedPaths((cur) => {
      const next = new Set(cur);
      if (next.has(wsPath)) next.delete(wsPath); else next.add(wsPath);
      return next;
    });
  }, []);
  // WS-ENUM：已打开 tab 的 workspace 由原项目行渲染，此处仅补未打开的
  const wsEnumRows = React.useMemo(() => {
    const openPaths = new Set(taskWorkspaceTabs.map((tab) => tab.workspacePath));
    return wsEnumState.workspaces.filter((w) => w?.path && !openPaths.has(w.path));
  }, [wsEnumState.workspaces, taskWorkspaceTabs]);
  React.useLayoutEffect(() => {
    if (isWebRemoteMode) return;
    const list = segmentListRef.current;
    if (!list) return;
    const update = () => {
      const thumb = segmentThumbRefs.current[segmentMode];
      if (!thumb) return;
      const transform = "translateX(" + thumb.offsetLeft + "px)";
      const width = thumb.offsetWidth;
      setSegmentThumbStyle((current) =>
        current.opacity === 1 && current.transform === transform && current.width === width
          ? current
          : { opacity: 1, transform, width },
      );
    };
    let frame: number | null = null;
    const schedule = () => {
      if (frame === null) {
        frame = requestAnimationFrame(() => { frame = null; update(); });
      }
    };
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(list);
    for (const thumb of Object.values(segmentThumbRefs.current)) if (thumb) observer?.observe(thumb);
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [segmentMode, isWebRemoteMode]);
  const handleUpgradeClick = React.useCallback((providerId: string | null, funnelContext: unknown) => {
    openCodingPlanUpgrade({ providerId, funnelContext });
  }, [openCodingPlanUpgrade]);
  const cancelTabDrag = React.useCallback(() => {
    setActiveDragTabId(null);
    setActiveDragTabWidth(null);
  }, []);
  const handleTabDragStart = React.useCallback((event: DndEvent) => {
    setActiveDragTabId(String(event.active.id));
    setActiveDragTabWidth(event.active.rect.current.initial?.width ?? null);
  }, []);
  const handleTabDragEnd = React.useCallback((event: DndEvent) => {
    cancelTabDrag();
    if (!event.over || event.active.id === event.over.id) return;
    const reorder = resolveWorkspaceTabReorder({
      activeId: String(event.active.id),
      overId: String(event.over.id),
      projectTabs: projectWorkspaceTabs,
      workspaceTabs: taskWorkspaceTabs,
    });
    if (reorder) reorderWorkspaceTabs(reorder.fromIndex, reorder.toIndex);
  }, [projectWorkspaceTabs, reorderWorkspaceTabs, cancelTabDrag, taskWorkspaceTabs]);
  const draggingTab = React.useMemo(() => (activeDragTabId ? projectWorkspaceTabs.find((tab) => tab.id === activeDragTabId) ?? null : null), [activeDragTabId, projectWorkspaceTabs]);
  const handleThemeChange = React.useCallback((value: string) => {
    if (value === "light" || value === "dark" || value === "zai-light" || value === "zai-dark" || value === "system") setTheme(value);
  }, [setTheme]);
  const handleLocaleChange = React.useCallback((value: string) => {
    if (value === "system") { setLocalePreference("system"); return; }
    if (value === "zh-CN" || value === "en-US") setLocalePreference(value);
  }, [setLocalePreference]);
  const handleOpenSkillsSettings = React.useCallback(() => {
    openSkillsSettingsIntent();
    openSettingsTab();
  }, [openSettingsTab]);
  /* ---- 展开/收起按钮的派生状态（项目段/分组段/远控段 三种情形） ---- */
  const isRemoteWorkspaceSection = isWebRemoteMode && !showArchivedTasks && taskViewMode === "workspace";
  const effectiveWorkspaceGroupKeys = workspaceGroupKeys.length > 0 ? workspaceGroupKeys : webRemoteHasTasks === false ? [] : webRemoteTaskGroupKeys;
  const remoteTransitionPending = isRemoteWorkspaceSection && !crossWorkspaceSwitching && webRemoteHasTasks !== false;
  const remoteToggleVisible = isRemoteWorkspaceSection && (workspaceGroupKeys.length > 0 || remoteTransitionPending);
  const remoteHasToggleableGroups = effectiveWorkspaceGroupKeys.length > 0;
  const remoteAllCollapsed = effectiveWorkspaceGroupKeys.length > 0 && effectiveWorkspaceGroupKeys.every((key) => !collapsedWorkspaceKeys.has(key));
  // HOME-SEG：分组段派生态随分组渲染路径删除；展开/收起仅余 远控段/项目段 两情形
  const projectsSectionActive = !isWebRemoteMode && !showArchivedTasks && taskOrganizeBy === "project" && projectWorkspaceTabs.length > 0;
  const expandToggleVisible = remoteToggleVisible || projectsSectionActive;
  const expandToggleCanToggle = remoteHasToggleableGroups || projectsSectionActive;
  const expandToggleAllExpanded = remoteToggleVisible ? remoteAllCollapsed : purposeSectionPreferences.projectsExpanded && allProjectsExpanded;
  const expandToggleTransitionPending = remoteTransitionPending;
  const expandToggleState = resolveExpandToggleState({
    current: { visible: expandToggleVisible, canToggle: expandToggleCanToggle, areAllExpanded: expandToggleAllExpanded, transitionPending: expandToggleTransitionPending },
    previous: previousExpandToggleRef.current,
  });
  const handleOrganizeByChange = React.useCallback((value: string) => {
    // HOME-SEG：一级视图切换——home｜workspace（grouped 退役）
    logger.debug("[WorkspaceSidebar] 切换任务一级视图", { from: taskOrganizeBy, to: value });
    if (value === "home") { setTaskOrganizeBy("home"); return; }
    if (value === "workspace") setTaskOrganizeBy(lastNonGroupedOrganizeBy);
  }, [taskOrganizeBy, lastNonGroupedOrganizeBy]);
  const handleSegmentSortModeChange = React.useCallback((value: string) => {
    if (value === "project" || value === "chronological") { setLastNonGroupedOrganizeBy(value); setTaskOrganizeBy(value); }
  }, []);
  // 全部展开/收起（两种情形分派：远控段/项目段）
  const handleToggleAllExpanded = React.useCallback(() => {
    if (!expandToggleCanToggle) return;
    if (remoteHasToggleableGroups) {
      setCollapsedWorkspaceKeys(remoteAllCollapsed ? new Set(effectiveWorkspaceGroupKeys) : new Set());
      return;
    }
    if (purposeSectionPreferences.projectsExpanded && allProjectsExpanded) {
      setProjectsExpanded(false);
      collapseAllWorkspaceTabs(projectWorkspacePaths);
      return;
    }
    setProjectsExpanded(true);
    expandAllWorkspaceTabs(projectWorkspacePaths);
  }, [remoteAllCollapsed, allProjectsExpanded, remoteHasToggleableGroups, expandToggleCanToggle,
    collapseAllWorkspaceTabs, expandAllWorkspaceTabs, setProjectsExpanded,
    purposeSectionPreferences.projectsExpanded, effectiveWorkspaceGroupKeys, projectWorkspacePaths]);
  /* ---- 分段行（原 rVt 内联 Vn，js 159620 / jsx 132412）：
          分组|项目 pill（Tabs 原语 + 滑块）+ 全部展开/收起 + [新建组] + [视图选项] + 归档开关 ---- */
  const renderOrganizeHeader = React.useCallback(() => (
    <div className={cn("pl-2.5 pr-3", isWebRemoteMode && "-mx-4")}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 shrink-0 items-center gap-1">
          {isWebRemoteMode ? (
            <div className="inline-flex h-7 min-w-0 items-center rounded-full border border-border bg-surface px-2 text-ui-xs font-medium text-foreground">
              {intl.formatMessage({ id: "workspaceSidebar.organizeByProject" })}
            </div>
          ) : (
            <TabsRoot value={segmentMode} onValueChange={handleOrganizeByChange} className="w-fit shrink-0" aria-label={intl.formatMessage({ id: "workspaceSidebar.organize" })}>
              <TabsList ref={segmentListRef} className="relative h-7 w-fit overflow-hidden rounded-full bg-surface p-0.5 group-data-horizontal/tabs:h-7">
                {/* 滑块（跟随激活项位移/宽度，200ms 过渡） */}
                <span aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0.5 left-0 rounded-full bg-background transition-[opacity,transform,width] duration-200 ease-out"
                  style={segmentThumbStyle}
                />
                {/* HOME-SEG：Home 段（原 分组 段位置；house 图标，两语言文案均为 "Home"） */}
                <TabsTrigger
                  ref={(el: HTMLButtonElement | null) => { segmentThumbRefs.current.home = el; }}
                  value="home"
                  className="relative z-10 h-6 flex-none gap-1 rounded-full border-transparent bg-transparent py-0 pl-1.5 pr-2 text-ui-sm font-medium text-foreground-subtle transition-colors data-active:border-transparent data-active:bg-transparent data-active:text-foreground data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-transparent"
                >
                  <IconHouse aria-hidden="true" className="size-3 shrink-0" />
                  <span>{intl.formatMessage({ id: "workspaceSidebar.organizeHome" })}</span>
                </TabsTrigger>
                <TabsTrigger
                  ref={(el: HTMLButtonElement | null) => { segmentThumbRefs.current.workspace = el; }}
                  value="workspace"
                  className="relative z-10 h-6 flex-none gap-1 rounded-full border-transparent bg-transparent py-0 pl-1.5 pr-2 text-ui-sm font-medium text-foreground-subtle transition-colors data-active:border-transparent data-active:bg-transparent data-active:text-foreground data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-transparent"
                >
                  <IconFolder aria-hidden="true" className="size-3 shrink-0" />
                  <span>{intl.formatMessage({ id: "workspaceSidebar.organizeByProject" })}</span>
                </TabsTrigger>
              </TabsList>
            </TabsRoot>
          )}
          {/* 全部展开/收起 */}
          {expandToggleState ? (
            <Tooltip title={intl.formatMessage({ id: expandToggleState.messageId })}>
              <Button type="button" variant="ghost" size="icon-sm"
                className="shrink-0 text-foreground-subtle hover:text-foreground"
                aria-label={intl.formatMessage({ id: expandToggleState.messageId })}
                disabled={!expandToggleState.canToggle}
                onClick={handleToggleAllExpanded}
              >
                {expandToggleState.areAllExpanded ? <IconMinimize2 className="size-3.5" /> : <IconMaximize2 className="size-3.5" />}
              </Button>
            </Tooltip>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {/* HOME-SEG：分组视图「新建组」按钮随分组渲染路径删除 */}
          {/* 视图选项菜单：组织方式（项目/时间线）+ 排序（更新时间/创建时间） */}
          {segmentMode === "workspace" || showArchivedTasks ? (
            <DropdownMenu>
              <Tooltip title={intl.formatMessage({ id: "workspaceSidebar.taskViewOptions" })}>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm"
                    className="shrink-0 text-foreground-subtle hover:text-foreground"
                    aria-label={intl.formatMessage({ id: "workspaceSidebar.taskViewOptions" })}
                  >
                    <IconListFilter className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-48 min-w-48">
                {segmentMode === "workspace" && !showArchivedTasks ? (
                  <>
                    <DropdownMenuLabel>{intl.formatMessage({ id: "workspaceSidebar.organize" })}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={segmentSortMode} onValueChange={handleSegmentSortModeChange}>
                      <DropdownMenuRadioItem value="project">
                        <IconFolder className="size-4" />
                        {intl.formatMessage({ id: "workspaceSidebar.viewByWorkspace" })}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="chronological">
                        <IconClock3 className="size-4" />
                        {intl.formatMessage({ id: "workspaceSidebar.organizeChronologicalList" })}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </>
                ) : null}
                {segmentMode === "workspace" && !showArchivedTasks && (segmentMode === "workspace" || showArchivedTasks) ? <DropdownMenuSeparator /> : null}
                {segmentMode === "workspace" || showArchivedTasks ? (
                  <>
                    <DropdownMenuLabel>{intl.formatMessage({ id: "workspaceSidebar.sortBy" })}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={taskSortBy} onValueChange={(value) => {
                      if (value === "created" || value === "updated") setTaskSortBy(value);
                    }}>
                      <DropdownMenuRadioItem value="updated">
                        <IconMessageCircleCheck className="size-4" />
                        {intl.formatMessage({ id: "workspaceSidebar.sortByUpdated" })}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="created">
                        <IconMessageCirclePlus className="size-4" />
                        {intl.formatMessage({ id: "workspaceSidebar.sortByCreated" })}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {/* 归档开关 */}
          <Tooltip title={intl.formatMessage({ id: "workspaceSidebar.toggleArchivedTasks" })}>
            <Button type="button" variant="ghost" size="icon-sm"
              className="shrink-0 text-foreground-subtle hover:text-foreground data-[state=on]:bg-hover data-[state=on]:text-foreground"
              data-state={showArchivedTasks ? "on" : "off"}
              aria-label={intl.formatMessage({ id: "workspaceSidebar.toggleArchivedTasks" })}
              onClick={() => { setShowArchivedTasks((value) => !value); }}
            >
              {showArchivedTasks ? <IconX className="size-3.5" /> : <IconArchive className="size-3.5" />}
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  ), [segmentMode, handleOrganizeByChange, handleToggleAllExpanded, handleSegmentSortModeChange, intl, isWebRemoteMode,
    segmentThumbStyle, showArchivedTasks, segmentMode === "workspace" || showArchivedTasks, segmentSortMode, taskSortBy, expandToggleState,
    baseTaskViewMode, sidebarDisabledReason, localDirectoryUnavailable]);
  React.useEffect(() => {
    if (!expandToggleTransitionPending) previousExpandToggleRef.current = expandToggleState;
  }, [expandToggleState, expandToggleTransitionPending]);
  return (
    <aside data-testid={TESTID_SIDEBAR} className="flex h-full flex-col overflow-hidden">
      {/* h-12 拖拽条（顶栏浮层压在其上；远控窄屏隐藏） */}
      <div className={cn("h-12 [app-region:drag]", isWebRemoteMode && "max-md:hidden")} />
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* 主导航面（文件树打开时左滑隐藏） */}
        <div
          data-web-remote-navigation-scroll={isWebRemoteMode ? "true" : undefined}
          className={cn(
            "absolute inset-0 flex min-h-0 flex-col transition-transform duration-200 ease-out",
            fileTreeOpen && "-translate-x-full pointer-events-none",
            isWebRemoteMode && "max-md:overflow-y-auto",
          )}
          aria-hidden={fileTreeOpen}
        >
          {/* 导航 4 行：新建任务 / 搜索（命令中心）/ [自动化] / 技能 */}
          <div className={cn("flex flex-col gap-1 px-2", "py-3", isWebRemoteMode && "max-md:pt-11")}>
            <DisabledReasonWrapper disabledReason={sidebarDisabledReason}>
              <NewTaskRow
                disabled={localDirectoryUnavailable}
                onCreateTask={() => {
                  // HOME-SEG：分组草稿置入分支随分组渲染路径删除——Home/项目 一律普通新建
                  if (localDirectoryUnavailable) return;
                  onCreateTask();
                }}
              />
            </DisabledReasonWrapper>
            <Button variant="ghost" onClick={onOpenCommandCenter} data-icon="inline-start" size="lg"
              className="w-full justify-start gap-2 text-foreground hover:bg-surface-hover hover:text-foreground">
              <IconSearch className="size-4" />
              <span className="min-w-0 flex-1 truncate text-left">{intl.formatMessage({ id: "commandCenter.open" })}</span>
              <span className="ml-auto shrink-0 text-ui-xs font-normal text-foreground-subtlest">{commandCenterShortcut}</span>
            </Button>
            {isWebRemoteMode ? null : (
              <Button variant="ghost" onClick={handleOpenAutomations} data-icon="inline-start"
                data-testid={TESTID_AUTOMATIONS_OPEN} size="lg" aria-pressed={automationsActive}
                className={cn("w-full justify-start gap-2 text-foreground hover:bg-surface-hover hover:text-foreground", automationsActive && "bg-selected text-foreground")}>
                <IconCalendarClock className="size-4" />
                {intl.formatMessage({ id: "workspace.openScheduledSettings" })}
              </Button>
            )}
            <Button variant="ghost" onClick={handleOpenSkillsSettings} data-icon="inline-start" size="lg"
              className="w-full justify-start gap-2 text-foreground hover:bg-surface-hover hover:text-foreground">
              <IconWandSparkles className="size-4" />
              {intl.formatMessage({ id: "workspace.openSkillsSettings" })}
            </Button>
          </div>
          {/* 列表区（唯一滚动容器）：吸顶槽 + 分段行 + 置顶段 + 各视图 */}
          <div className="relative flex min-h-0 flex-1 flex-col">
            <StickyHeaderSlot header={stickyGroupHeader} />
            <div ref={scrollContainerRef}
              className={cn("flex flex-1 min-h-0 flex-col gap-3 overflow-y-auto", isWebRemoteMode && "max-md:flex-none max-md:overflow-visible")}
              style={scrollMaskStyle}
            >
              {isWebRemoteMode ? null : renderOrganizeHeader()}
              {showPurposeSections ? (
                <PinnedTasksSection
                  workspaceTabs={taskWorkspaceTabs}
                  activeWorkspacePath={workspacePath}
                  activeWorkspaceIdentity={activeWorkspaceIdentity}
                  activeTaskId={activeTaskIdForMobile}
                  taskSortBy={taskSortBy}
                  mobileActiveTaskKey={mobileActiveTaskKey}
                  onSelectTask={onSelectTask}
                />
              ) : null}
              <div className="flex min-h-0 flex-col gap-3 px-2">
                {webRemoteControlWorkspaceSwitcher && (taskViewMode === "workspace" || taskViewMode === "timeline" || taskViewMode === "archived") ? (
                  /* Web 远控任务段（F17 族，接口级） */
                  <WebRemoteTaskListSection
                    switcher={webRemoteControlWorkspaceSwitcher}
                    activeWorkspacePath={workspacePath}
                    activeWorkspaceIdentity={activeWorkspaceIdentity}
                    activeTaskId={activeTaskIdForMobile}
                    taskSortBy={taskSortBy}
                    taskViewMode={taskViewMode}
                    collapsedWorkspaceKeys={collapsedWorkspaceKeys}
                    renderBeforePinnedTasks={renderOrganizeHeader}
                    onToggleWorkspaceCollapsed={(key: string) => {
                      setCollapsedWorkspaceKeys((current) => {
                        const next = new Set(current);
                        if (next.has(key)) next.delete(key);
                        else next.add(key);
                        return next;
                      });
                    }}
                    onWorkspaceGroupKeysChange={handleWebRemoteWorkspaceGroupKeysChange}
                    onSelectTask={onSelectTask}
                    onTaskOpen={onWebRemoteTaskOpen}
                    onCrossWorkspaceSwitchingChange={onWebRemoteTaskSwitchingChange}
                  />
                ) : baseTaskViewMode === "archived" ? (
                  <ArchivedTasksSection
                    workspaceTabs={taskWorkspaceTabs}
                    activeWorkspacePath={workspacePath}
                    activeWorkspaceIdentity={activeWorkspaceIdentity}
                    activeTaskId={activeTaskIdForMobile}
                    sortBy={taskSortBy}
                    mobileActiveTaskKey={mobileActiveTaskKey}
                    onSelectTask={onSelectTask}
                  />
                ) : baseTaskViewMode === "home" ? (
                  /* HOME-SEG：Home 视图——扁平会话 list（取代分组视图 GroupedTasksSection 渲染路径，
                     数据源 SessionIndexStore；点击复用任务打开路径 onSelectTask） */
                  <HomeConversationsSection
                    workspacePath={workspacePath}
                    workspaceIdentity={activeWorkspaceIdentity}
                    activeTaskId={activeTaskIdForMobile}
                    onSelectTask={onSelectTask}
                  />
                ) : baseTaskViewMode === "timeline" ? (
                  <TimelineTasksSection
                    workspaceTabs={taskWorkspaceTabs}
                    activeWorkspacePath={workspacePath}
                    activeWorkspaceIdentity={activeWorkspaceIdentity}
                    activeTaskId={activeTaskIdForMobile}
                    taskSortBy={taskSortBy}
                    mobileActiveTaskKey={mobileActiveTaskKey}
                    onSelectTask={onSelectTask}
                  />
                ) : (
                  /* 项目视图：分段可拖拽重排（项目段/会话段） */
                  <DndContext sensors={sectionDragSensors} collisionDetection={closestCenterCollision} modifiers={[restrictDragToVerticalAxis]} onDragEnd={handleSectionDragEnd}>
                    <SortableContext items={purposeSectionPreferences.sectionOrder} strategy={rectSortingStrategy}>
                      <div data-purpose-section-list="true">
                        {purposeSectionPreferences.sectionOrder.map((sectionId) =>
                          sectionId === "projects" ? (
                            <PurposeSection
                              key={sectionId}
                              sortableId={sectionId}
                              dragHandleLabel={intl.formatMessage({ id: "workspaceSidebar.reorderSection" }, { section: intl.formatMessage({ id: "workspaceSidebar.projectsSection" }) })}
                              title={intl.formatMessage({ id: "workspaceSidebar.projectsSection" })}
                              open={purposeSectionPreferences.projectsExpanded}
                              onOpenChange={setProjectsExpanded}
                              testId={TESTID_PROJECT_SECTION}
                              action={(
                                <DropdownMenu>
                                  <Tooltip title={intl.formatMessage({ id: "workspaceSidebar.addProject" })}>
                                    <DropdownMenuTrigger asChild>
                                      <Button type="button" variant="ghost" size="icon-sm"
                                        className="text-foreground-subtle hover:text-foreground data-[state=open]:text-foreground"
                                        aria-label={intl.formatMessage({ id: "workspaceSidebar.addProject" })}
                                        data-testid={TESTID_PROJECT_ADD}
                                      >
                                        <IconPlus className="size-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                  </Tooltip>
                                  <DropdownMenuContent align="end" className="min-w-44">
                                    <DropdownMenuItem onSelect={onOpenFolderFromWorkspaceMenu}>
                                      <IconFolderOpen className="size-4" />
                                      {intl.formatMessage({ id: "workspace.openFolder" })}
                                    </DropdownMenuItem>
                                    {onOpenRemoteWorkspace ? (
                                      <DropdownMenuItem onSelect={onOpenRemoteWorkspace}>
                                        <IconCloud className="size-4" />
                                        {intl.formatMessage({ id: "remote.trigger" })}
                                      </DropdownMenuItem>
                                    ) : null}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            >
                              {projectWorkspaceTabs.length === 0 && wsEnumRows.length === 0 ? (
                                <div className="px-3 py-2 text-ui-base text-foreground-subtle">
                                  {intl.formatMessage({ id: "workspaceSidebar.noProjects" })}
                                </div>
                              ) : (
                                /* WS-ENUM：tab 项目行 + 未打开的 daemon 已知 workspace 行 */
                                <>
                                {projectWorkspaceTabs.length === 0 ? null : (
                                /* 工作区行列表（垂直拖拽重排 + 浮层 portal） */
                                <DndContext sensors={workspaceDragSensors} collisionDetection={closestCenterCollision} modifiers={[restrictDragToVerticalAxis]}
                                  onDragStart={handleTabDragStart} onDragEnd={handleTabDragEnd} onDragCancel={cancelTabDrag}
                                >
                                  <SortableContext items={projectWorkspaceTabs.map((tab) => tab.id)} strategy={verticalListSortingStrategy}>
                                    <ul data-testid={TESTID_WORKSPACE_LIST} className="space-y-2 pb-4">
                                      {projectWorkspaceTabs.map((tab) => {
                                        const key = workspaceKey(tab.workspacePath, tab.workspaceIdentity);
                                        const group = workspaceGroupByKey.get(key);
                                        const groupLoading = workspaceTaskGroups.loadingByWorkspaceKey[key] ?? false;
                                        return (
                                          <SortableWorkspaceSidebarItem
                                            key={tab.id}
                                            tab={tab}
                                            isActiveWorkspace={tab.workspacePath === workspacePath}
                                            isExpanded={isWorkspaceExpandedDuringDrag({ activeDragId: activeDragTabId, expanded: expandedWorkspacePaths.has(tab.workspacePath), tabId: tab.id })}
                                            activateTab={activateTab}
                                            closeTab={closeTab}
                                            toggleWorkspaceExpanded={toggleWorkspaceExpanded}
                                            onSelectTask={onSelectTask}
                                            onStartDraftInWorkspace={onStartDraftInWorkspace}
                                            taskItems={group?.items ?? EMPTY_TASK_ITEMS}
                                            taskListLoading={groupLoading}
                                            taskListHasMore={group?.hasMore ?? false}
                                            taskListHasUnread={group?.hasUnread ?? false}
                                            mobileActiveTaskKey={mobileActiveTaskKey}
                                            isWebRemoteControl={isWebRemoteControl}
                                            workspaceKey={key}
                                            onShowMoreWorkspaceTasks={showMoreWorkspaceTasks}
                                            reconnectingRemoteWorkspaceKeys={reconnectingRemoteWorkspaceKeys}
                                            remoteWorkspaceErrorByWorkspaceKey={remoteWorkspaceErrorByWorkspaceKey}
                                            reconnectingRemoteWorkspaceLogsByWorkspaceKey={reconnectingRemoteWorkspaceLogsByWorkspaceKey}
                                            onReconnectRemoteWorkspace={onReconnectRemoteWorkspace ?? (() => {})}
                                            onOpenFileTree={openFileTreeForWorkspace}
                                          />
                                        );
                                      })}
                                    </ul>
                                  </SortableContext>
                                  {typeof document === "undefined" ? null : createPortal(
                                    <DragOverlay>
                                      {draggingTab ? <WorkspaceTabDragOverlay tab={draggingTab} width={activeDragTabWidth} /> : null}
                                    </DragOverlay>,
                                    document.body,
                                  )}
                                </DndContext>
                                )}
                                {/* WS-ENUM：未打开的 daemon 已知 workspace（如 Z-Image）；
                                    点击行内会话＝打开该 workspace+session（复用任务打开路径） */}
                                {wsEnumRows.length === 0 ? null : (
                                  <WsEnumSection rows={wsEnumRows} expandedPaths={wsEnumExpandedPaths} onToggle={wsEnumToggle}
                                    activeTaskId={activeTaskIdForMobile} onSelectTask={onSelectTask} />
                                )}
                                </>
                              )}
                            </PurposeSection>
                          ) : (
                            /* 会话段 */
                            <PurposeSection
                              key={sectionId}
                              sortableId={sectionId}
                              dragHandleLabel={intl.formatMessage({ id: "workspaceSidebar.reorderSection" }, { section: intl.formatMessage({ id: "workspaceSidebar.conversationsSection" }) })}
                              title={intl.formatMessage({ id: "workspaceSidebar.conversationsSection" })}
                              open={purposeSectionPreferences.conversationsExpanded}
                              onOpenChange={setConversationsExpanded}
                              testId={TESTID_CONVERSATION_SECTION}
                              action={(
                                <Tooltip title={intl.formatMessage({ id: "workspaceSidebar.newConversation" })}>
                                  <Button type="button" variant="ghost" size="icon-sm"
                                    className="text-foreground-subtle hover:text-foreground"
                                    aria-label={intl.formatMessage({ id: "workspaceSidebar.newConversation" })}
                                    data-testid={TESTID_CONVERSATION_NEW_TASK}
                                    onClick={onCreateConversationTask}
                                  >
                                    <IconMessageCirclePlus className="size-3.5" />
                                  </Button>
                                </Tooltip>
                              )}
                            >
                              <TimelineTasksSection
                                workspaceTabs={conversationWorkspaceTabs}
                                activeWorkspacePath={workspacePath}
                                activeWorkspaceIdentity={activeWorkspaceIdentity}
                                activeTaskId={activeTaskIdForMobile}
                                taskSortBy={taskSortBy}
                                groupByDate={false}
                                taskRowVariant="default"
                                emptyMessage={intl.formatMessage({ id: "workspaceSidebar.noConversations" })}
                                mobileActiveTaskKey={mobileActiveTaskKey}
                                onSelectTask={onSelectTask}
                              />
                            </PurposeSection>
                          ),
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* 页脚 */}
        <SidebarFooter
          theme={theme}
          localeMenuValue={localeMenuValue}
          onLocaleChange={handleLocaleChange}
          onThemeChange={handleThemeChange}
          onSettingsButtonClick={openSettingsTab}
          onUsageClick={openSettingsTab}
          onUpgradeClick={handleUpgradeClick}
          onLogin={onLogin}
          onLogout={onLogout}
          user={user}
          workspacePath={workspacePath}
          workspaceIdentity={activeWorkspaceIdentity}
          workspaceRemoteSessionId={workspaceRemoteSessionId}
          activeTaskId={activeTaskIdForMobile}
          isDesktop={isDesktop}
        />
      </div>
      {/* 文件树滑层（右滑覆盖主导航面） */}
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-200 ease-out",
          fileTreeOpen ? "translate-x-0" : "translate-x-full pointer-events-none",
        )}
        aria-hidden={!fileTreeOpen}
      >
        {fileTreeRequest ? (
          <FileTreePanel
            workspacePath={fileTreeRequest.workspacePath}
            workspaceName={fileTreeRequest.workspaceName}
            workspaceIdentity={fileTreeRequest.workspaceIdentity}
            workspaceRemoteSessionId={fileTreeRequest.workspaceRemoteSessionId}
            revealPath={fileTreeRequest.revealPath}
            temporaryExternalDirectory={fileTreeRequest.temporaryExternalDirectory}
            canOpenLocalFileManager={isDesktop}
            activePreviewPath={activePreviewPath}
            onClose={() => setFileTreeOpen(false)}
            onOpenRepoWiki={onOpenRepoWiki && !fileTreeRequest.temporaryExternalDirectory ? handleOpenRepoWikiForFileTree : undefined}
            onOpenBrowserUrl={isDesktop ? onOpenBrowserUrl : undefined}
            repoWikiActive={repoWikiActiveForFileTree}
            onOpenPreview={(request: Record<string, unknown>) => {
              onOpenCodeViewer?.({
                ...request,
                workspacePath: fileTreeRequest.workspacePath,
                workspaceIdentity: fileTreeRequest.workspaceIdentity,
                workspaceRemoteSessionId: fileTreeRequest.workspaceRemoteSessionId,
              });
            }}
          />
        ) : null}
      </div>
    </aside>
  );
});
/** 原 kv：plus 图标（新建项目/会话） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconPlus → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/** 原 oc：工作区标签是否承载任务（排除设置/预览类标签） */
declare function isTaskWorkspaceTab(tab: WorkspaceTab): boolean;
/** 原 fX（77235）：Coding Plan 升级入口钩子 */
declare function useCodingPlanUpgrade(): { openCodingPlanUpgrade(args: { providerId: string | null | undefined; funnelContext: unknown }): void };
/** 原 G6 的页脚用法：远控状态轮询（含 mobileViewState） */
declare function useWebRemoteControlStatusPolling(args: { enabled: boolean }): WebRemoteControlStatus & { mobileConnected: boolean; mobileViewState?: { activeWorkspaceKey?: string; activeTaskId?: string } | null };
/** 文件树打开请求（原 fileTreeOpenRequest.target 的结构） */
interface FileTreeRequest {
  workspacePath: string;
  workspaceName?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  revealPath?: string | null;
  temporaryExternalDirectory?: boolean;
  [key: string]: unknown;
}
/** 原 iw：进入技能设置意图标记（sessionStorage） */
declare function openSkillsSettingsIntent(): void;

/* ============================================================================
 * 22. 分段壳（原 GBt，js 158981 / jsx 131948）
 *     项目/会话 分段：标题行（折叠箭头 + 拖拽把手 + 动作区）+ 折叠内容。
 * ==========================================================================*/

export function PurposeSection({ title, open, onOpenChange, action, children, testId, sortableId, dragHandleLabel }: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: React.ReactNode;
  children?: React.ReactNode;
  testId?: string;
  sortableId: string;
  dragHandleLabel: string;
}) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortableBinding({ id: sortableId });
  return (
    <section
      ref={setNodeRef}
      style={{
        transform: transform ? dndTransform.toString({ ...transform, scaleX: 1, scaleY: 1 }) : undefined,
        transition,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.85 : 1,
      }}
      data-testid={testId}
      aria-label={title}
      className="group/purpose-section relative"
    >
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <div className="flex h-7 min-w-0 items-center">
          <CollapsibleTrigger asChild>
            <button type="button"
              className="flex h-7 min-w-0 flex-1 items-center gap-1 px-2.5 text-left text-ui-base font-medium text-foreground-subtlest outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <span className="min-w-0 truncate">{title}</span>
              {open ? (
                <IconChevronDown aria-hidden="true" data-purpose-section-chevron="expanded"
                  className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/purpose-section:opacity-100 group-focus-within/purpose-section:opacity-100 [@media(hover:none)]:opacity-100" />
              ) : (
                <IconChevronRight aria-hidden="true" data-purpose-section-chevron="collapsed"
                  className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/purpose-section:opacity-100 group-focus-within/purpose-section:opacity-100 [@media(hover:none)]:opacity-100" />
              )}
            </button>
          </CollapsibleTrigger>
          <div className="flex shrink-0 items-center pr-1.5 opacity-0 transition-opacity group-hover/purpose-section:opacity-100 group-focus-within/purpose-section:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:none)]:opacity-100">
            {/* 段拖拽把手 */}
            <button
              ref={setActivatorNodeRef}
              type="button"
              aria-label={dragHandleLabel}
              data-purpose-section-drag-handle={sortableId}
              className="flex size-6 touch-none cursor-grab items-center justify-center rounded-md text-foreground-subtlest outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 active:cursor-grabbing"
              {...(attributes as object)}
              {...(listeners as object)}
            >
              <IconGripVertical aria-hidden="true" className="size-3.5" />
            </button>
            {action}
          </div>
        </div>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    </section>
  );
}
/** 原 HBt（158893 / 131883）：可排序工作区行（dnd useSortable 包裹 WorkspaceSidebarItem） */
export function SortableWorkspaceSidebarItem(props: Omit<WorkspaceSidebarItemProps, "itemRef" | "itemStyle" | "sortableBindings" | "isDragging" | "onShowMoreTasks"> & {
  workspaceKey: string;
  onShowMoreWorkspaceTasks: (workspaceKey: string) => void;
  activateTab: (tabId: string) => void;
}) {
  const { tab, workspaceKey, onShowMoreWorkspaceTasks, activateTab: _activateTab, ...rest } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortableBinding({ id: tab.id });
  const transformCss = React.useMemo(() => {
    if (transform) return dndTransform.toString({ ...transform, scaleX: 1, scaleY: 1 });
    return undefined;
  }, [transform?.x, transform?.y]);
  const itemStyle = React.useMemo<React.CSSProperties>(
    () => ({ transform: transformCss, transition, zIndex: isDragging ? 10 : undefined, opacity: Number(!isDragging) }),
    [isDragging, transition, transformCss],
  );
  const sortableBindings = React.useMemo(() => ({ attributes, listeners }), [attributes, listeners]);
  const handleShowMore = React.useCallback(() => { onShowMoreWorkspaceTasks(workspaceKey); }, [onShowMoreWorkspaceTasks, workspaceKey]);
  return (
    <WorkspaceSidebarItem
      tab={tab}
      {...rest}
      onShowMoreTasks={handleShowMore}
      itemRef={setNodeRef}
      itemStyle={itemStyle}
      sortableBindings={sortableBindings}
      isDragging={isDragging}
    />
  );
}
/* ============================================================================
 * 18. 侧栏页脚（原 SRt + 助手群，js 150106–151185 / jsx 124386–125139）
 *     头像 + 用户名/plan 徽章 + 下拉菜单：语言/主题/界面缩放/用量/登录登出，
 *     右侧：Web 远控触发器（桌面）+ 设置按钮。
 * ==========================================================================*/

/** 原 y8（150106 / 124386）：Web 远控特性门（context） */
/** 原 sRt（150109 / 124391）：远控状态 → 图标色 + tooltip */
function resolveRemoteControlStatusDisplay(
  status: WebRemoteControlStatus,
  formatMessage: (descriptor: { id: string }) => string,
): { iconClassName: string; tooltip: string } {
  if (status.status === "error") return { iconClassName: "text-destructive", tooltip: formatMessage({ id: "webRemoteControl.triggerStatus.error" }) };
  if (status.status === "active") return { iconClassName: "text-success", tooltip: formatMessage({ id: "webRemoteControl.triggerStatus.connected" }) };
  if (status.status === "starting") return { iconClassName: "text-warning", tooltip: formatMessage({ id: "webRemoteControl.triggerStatus.starting" }) };
  if (status.status === "connecting") return { iconClassName: "text-warning", tooltip: formatMessage({ id: "webRemoteControl.triggerStatus.connecting" }) };
  if (status.status === "running") return { iconClassName: "text-warning", tooltip: formatMessage({ id: "webRemoteControl.triggerStatus.waiting" }) };
  return { iconClassName: "text-foreground-subtle", tooltip: formatMessage({ id: "webRemoteControl.triggerStatus.idle" }) };
}
/** 原 rRt（149554 / 124107，F17 族）：远控启动对话框（接口级） */
/** 原 lRt（150159 / 124436）：Web 远控触发器按钮 + 对话框 */
function WebRemoteControlTriggerInner({ workspacePath, workspaceIdentity, remoteSessionId, initialTaskId, compact = false, className }: {
  workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null;
  initialTaskId?: string | null; compact?: boolean; className?: string;
}) {
  const { intl } = useIntlContext();
  const platformService = usePlatformService();
  const resolvedRemoteSessionId = resolveWorkspaceRemoteSessionId(workspacePath, remoteSessionId, workspaceIdentity) ?? undefined;
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const statusDisplay = resolveRemoteControlStatusDisplay(useWebRemoteControlStatus(), intl.formatMessage);
  return (
    <>
      <Tooltip title={intl.formatMessage({ id: "webRemoteControl.trigger" })} description={statusDisplay.tooltip}
        side="top" align="center" triggerClassName={compact ? undefined : "w-full"}>
        <Button
          variant="ghost"
          onClick={() => {
            if (platformService) {
              trackEvent(platformService, buildWebRemoteControlEventProps({
                workspaceKind: workspaceIdentity?.trim() || resolvedRemoteSessionId ? "remote" : "local",
                remoteKind: workspaceIdentity ? parseRemoteIdentityKind(workspaceIdentity)?.kind : undefined,
              }), "web-remote-control-entry");
            }
            logger.info("[WorkspaceWebRemoteControlTrigger] 打开 Web 远程控制弹层", {
              workspacePath, workspaceIdentity: workspaceIdentity ?? "none",
              remoteSessionId: resolvedRemoteSessionId ?? "none", initialTaskId: initialTaskId ?? "none",
            });
            setDialogOpen(true);
          }}
          size={compact ? "icon-lg" : "lg"}
          aria-label={intl.formatMessage({ id: "webRemoteControl.trigger" })}
          className={cn(
            compact
              ? "text-foreground hover:bg-surface-hover hover:text-foreground"
              : "w-full justify-start gap-2 text-foreground hover:bg-surface-hover hover:text-foreground",
            className,
          )}
        >
          <IconSmartphone className={cn("size-4", statusDisplay.iconClassName)} />
          {compact ? (
            <span className="sr-only">{intl.formatMessage({ id: "webRemoteControl.trigger" })}</span>
          ) : (
            intl.formatMessage({ id: "webRemoteControl.trigger" })
          )}
        </Button>
      </Tooltip>
      <WebRemoteControlDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workspacePath={workspacePath}
        workspaceIdentity={workspaceIdentity}
        remoteSessionId={resolvedRemoteSessionId}
        initialTaskId={initialTaskId ?? undefined}
      />
    </>
  );
}
/** 原 G6（144737 / 120497）：Web 远控状态轮询钩子 */
declare function useWebRemoteControlStatus(intervalMs?: number): WebRemoteControlStatus;
/** 原 cRt（150140 / 124420）：远控触发器（特性门内才渲染） */
export function WebRemoteControlTrigger(props: Parameters<typeof WebRemoteControlTriggerInner>[0]) {
  const enabled = useWebRemoteControlEnabled();
  return enabled ? <WebRemoteControlTriggerInner {...props} /> : null;
}

/* ---- 用户名 / 用量（原 yRt/bRt/xRt/uRt/dRt/fRt/mRt/hRt/gRt，js 150230–150434） ---- */

interface SidebarUser { displayName?: string | null; username?: string | null; avatarUrl?: string | null; id?: string; [key: string]: unknown }
/** 原 yRt（150426）：用户名解析（displayName > username > ZCode） */
function resolveUserName(user: SidebarUser | null | undefined): string {
  return user?.displayName?.trim() || user?.username?.trim() || "ZCode";
}
/** 原 bRt（150429）：页脚显示名（未登录=「连接使用」文案） */
function userDisplayName(user: SidebarUser | null | undefined, formatMessage: (descriptor: { id: string }) => string): string {
  return user ? resolveUserName(user) : formatMessage({ id: "sidebar.profile.notLoggedIn" });
}
/** 原 xRt（150432）：头像缺省首字母 */
function userInitial(user: SidebarUser | null | undefined): string {
  return (user?.displayName?.trim() || user?.username?.trim() || "Z")[0]?.toUpperCase() ?? "Z";
}
/** 原 mRt（150255 / 124527）：侧栏用量状态钩子（供应商计划接线，F12 域，接口级） */
/** 与 SidebarLeaves.SidebarUsageStateModel（mRt 返回形）结构对齐；去索引签名以便接口型来源可赋值 */
interface SidebarUsageState {
  providerEntitlements: Array<{ providerId: string; snapshot: PlanSnapshot | null }>;
  upgradeTargetProviderId: string | null | undefined; // 与 SidebarLeaves SidebarUsageStateModel 对齐（mRt 返回 string | undefined）
  profilePlanBadge?: { audience?: "individual" | "team"; snapshot?: PlanSnapshot | null } | null;
}
interface PlanSnapshot { [key: string]: unknown }
declare function isPlanExpiring(snapshot: PlanSnapshot | null): boolean;
declare function planUpgradeFunnelArgs(args: { providerId: string | null; upgradeSource: string; eventRegion: string; eventText: string; entryPlanState: string }): unknown;
declare function planEntryState(args: { snapshot: PlanSnapshot | null }): string;
/** 原 uRt（150230）：团队/个人权益归并（接口级纯函数） */
declare function resolveProfilePlanAudience(args: { hasTeamPlanEntitlement: boolean; individualEntitlements: Array<{ snapshot: PlanSnapshot | null; providerId: string; loading?: boolean }>; teamEntitlementLoading: boolean }): { audience: "individual" | "team"; snapshot?: PlanSnapshot } | null;
/** 原 dRt/fRt（150240/150247）：plan 徽章文案（去前缀 + 标题化） */
function resolvePlanBadgeLabel(entitlement: { unavailableReason?: string; quota?: { level?: string }; subscription?: { details: Array<{ productName?: string }> } } | null | undefined): string | null {
  if (!entitlement || entitlement.unavailableReason === "no_plan") return null;
  const raw = entitlement.quota?.level?.trim() || entitlement.subscription?.details[0]?.productName?.trim() || null;
  if (!raw) return null;
  const stripped = raw.replace(/^glm\s+coding\s+/i, "").trim() || raw;
  return stripped.length > 0 ? titleCasePlanLabel(stripped) : null;
}
function titleCasePlanLabel(label: string): string {
  return /^[a-z][a-z0-9 -]*$/i.test(label)
    ? label.replace(/\b[a-z][a-z0-9]*\b/gi, (word) => (word.length <= 1 ? word.toUpperCase() : word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase()))
    : label;
}
/** 原 gRt（150410 / 124662）：用户名右侧的 plan 徽章 */
export function UsagePlanBadge({ state }: { state: SidebarUsageState }) {
  const { intl } = useIntlContext();
  const label = state.profilePlanBadge?.audience === "team"
    ? intl.formatMessage({ id: "sidebar.usage.plan.audienceTeam" })
    : resolvePlanBadgeLabel((state.profilePlanBadge?.snapshot as never) ?? null);
  return label ? (
    <span className="min-w-0 max-w-20 shrink truncate rounded-full border border-border bg-surface px-1 py-px text-ui-xs font-medium leading-normal text-foreground-subtle" title={label}>
      {label}
    </span>
  ) : null;
}
/** 原 hRt（150373 / 124636）：菜单内用量两行——打开用量统计 + 升级/续费 */
export function UsageMenuItems({ state, onUsageClick, onUpgradeClick }: {
  state: SidebarUsageState;
  onUsageClick?: () => void;
  onUpgradeClick?: (providerId: string | null, funnel: unknown) => void;
}) {
  const { intl } = useIntlContext();
  const { providerEntitlements, upgradeTargetProviderId } = state;
  const targetSnapshot = providerEntitlements.find((entry) => entry.providerId === upgradeTargetProviderId)?.snapshot ?? null;
  const upgradeMessageId = isPlanExpiring(targetSnapshot) ? "sidebar.usage.plan.renew" : "sidebar.usage.plan.upgrade";
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem data-testid={TESTID_SIDEBAR_USAGE_BUTTON} onSelect={() => { markUsageEntryIntent(); onUsageClick?.(); }}>
        <IconChartColumn className="size-4" />
        {intl.formatMessage({ id: "sidebar.usage.plan.openStats" })}
      </DropdownMenuItem>
      <DropdownMenuItem data-testid={TESTID_SIDEBAR_UPGRADE_BUTTON}
        onSelect={() => {
          onUpgradeClick?.(upgradeTargetProviderId ?? null, planUpgradeFunnelArgs({
            providerId: upgradeTargetProviderId ?? null,
            upgradeSource: "profile_menu",
            eventRegion: "app.profile",
            eventText: intl.formatMessage({ id: upgradeMessageId }),
            entryPlanState: planEntryState({ snapshot: targetSnapshot }),
          }));
        }}
      >
        <IconRocket className="size-4" />
        {intl.formatMessage({ id: upgradeMessageId })}
      </DropdownMenuItem>
    </>
  );
}
/** 原 uye/Pv 图标（用量菜单用）：bar-chart / rocket */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：IconChartColumn/IconRocket → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
const ZOOM_LEVEL_MIN = -3; // 原 _Rt（150424）
const ZOOM_LEVEL_MAX = 5;  // 原 vRt（150424）

interface SidebarFooterProps {
  theme: ThemeId;
  localeMenuValue: string;
  onLocaleChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onSettingsButtonClick?: () => void;
  onUsageClick?: () => void;
  onUpgradeClick?: (providerId: string | null, funnel: unknown) => void;
  onLogin?: () => void;
  onLogout?: () => void;
  settingsButtonMode?: "settings" | "back";
  user?: SidebarUser | null;
  /** A0-CLEANUP3 3b：SettingsView 页脚调用不传路径（对齐源真 declare 面），体内以 "" 兜底 */
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  activeTaskId?: string | null;
  isDesktop?: boolean;
}
/** 原 SRt（150435 / 124677）：侧栏页脚 */
export const SidebarFooter = React.memo(function SidebarFooter({
  theme, localeMenuValue, onLocaleChange, onThemeChange, onSettingsButtonClick, onUsageClick, onUpgradeClick,
  onLogin, onLogout, settingsButtonMode = "settings", user, workspacePath, workspaceIdentity,
  workspaceRemoteSessionId, activeTaskId, isDesktop = false,
}: SidebarFooterProps) {
  const { intl } = useIntlContext();
  const platformService = usePlatformService();
  const isRestoringOAuthSession = useSettingsStore((state) => state.isRestoringOAuthSession);
  const displayName = userDisplayName(user, intl.formatMessage);
  const initial = userInitial(user);
  const avatarKey = user?.avatarUrl ?? user?.id ?? "guest";
  const showRestoringSpinner = !user && isRestoringOAuthSession;
  const usageState = useSidebarUsageState({ enabled: true, workspaceIdentity, workspacePath: workspacePath ?? "" }); // A0-CLEANUP3 3b：workspacePath 可省（SettingsView 页脚不传）

  // 头像 + 名称 + plan 徽章（菜单触发器内容）
  const profileTriggerContent = (
    <>
      <Avatar size="default" key={avatarKey}>
        {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
        <AvatarFallback className="bg-background text-foreground">
          {user ? initial : showRestoringSpinner ? (
            <>
              <SpinnerIcon className="size-4 animate-spin" />
              <span className="sr-only">{intl.formatMessage({ id: "common.loading" })}</span>
            </>
          ) : (
            <IconUser className="size-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 overflow-hidden text-left">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate text-ui-base font-semibold text-foreground">{displayName}</span>
          {user ? <UsagePlanBadge state={usageState} /> : null}
        </div>
      </div>
    </>
  );

  const settingsButtonLabel = settingsButtonMode === "back"
    ? intl.formatMessage({ id: "workspace.backToWorkspace" })
    : intl.formatMessage({ id: "settings.title" });
  const settingsButtonDisabled = !onSettingsButtonClick;
  const effectiveUsageClick = onUsageClick ?? onSettingsButtonClick;
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(0);
  const executeDesktopCommand = React.useCallback((command: DesktopCommand) => {
    void platformService.executeDesktopCommand(command);
  }, [platformService]);

  // 桌面端界面缩放级别同步
  React.useEffect(() => {
    if (!isDesktop) { setZoomLevel(0); return; }
    let cancelled = false;
    platformService.getDesktopZoomLevel?.().then((result) => {
      if (!cancelled && Number.isFinite(result.zoomLevel)) setZoomLevel(result.zoomLevel);
    });
    const unsubscribe = platformService.onDesktopZoomLevelChanged?.((event) => {
      if (Number.isFinite(event.zoomLevel)) setZoomLevel(event.zoomLevel);
    });
    return () => { cancelled = true; unsubscribe?.(); };
  }, [isDesktop, platformService]);
  const zoomNotDefault = zoomLevel !== 0;
  const canZoomIn = zoomLevel < ZOOM_LEVEL_MAX;
  const canZoomOut = zoomLevel > ZOOM_LEVEL_MIN;

  return (
    <div className="flex min-w-0 gap-2 p-4">
      {/* 左：头像菜单（语言/主题/[缩放]/用量/登录登出） */}
      <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="lg"
            className="min-w-0 flex-1 justify-start gap-2 overflow-hidden rounded-tl-2xl rounded-bl-2xl border-0 pl-0"
            data-testid={TESTID_LOGIN_TRIGGER}
            aria-label={displayName}
          >
            {profileTriggerContent}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-50" forceMount>
          {/* 语言子菜单：系统默认/英文/中文 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconGlobe className="size-4" />
              {intl.formatMessage({ id: "settings.locale" })}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuRadioGroup value={localeMenuValue} onValueChange={onLocaleChange}>
                <DropdownMenuRadioItem value="system">{intl.formatMessage({ id: "sidebar.settings.systemDefault" })}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en-US">{intl.formatMessage({ id: "sidebar.settings.locale.en-US" })}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="zh-CN">{intl.formatMessage({ id: "sidebar.settings.locale.zh-CN" })}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {/* 主题子菜单：系统默认/zai-dark/zai-light */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconPalette className="size-4" />
              {intl.formatMessage({ id: "settings.themeMode" })}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuRadioGroup value={theme} onValueChange={onThemeChange}>
                <DropdownMenuRadioItem value="system">{intl.formatMessage({ id: "sidebar.settings.systemDefault" })}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="zai-dark">{intl.formatMessage({ id: "sidebar.settings.theme.zai-dark" })}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="zai-light">{intl.formatMessage({ id: "sidebar.settings.theme.zai-light" })}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {/* 界面缩放（仅桌面）：放大/缩小/实际大小 */}
          {isDesktop ? (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconZoomIn className="size-4" />
                {intl.formatMessage({ id: "sidebar.settings.interfaceZoom" })}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-50">
                <DropdownMenuItem disabled={!canZoomIn} onSelect={() => executeDesktopCommand(DesktopCommand.ZoomIn)}>
                  <IconZoomIn className="size-4" />
                  {intl.formatMessage({ id: "titleBar.menu.view.zoomIn" })}
                  <DropdownMenuShortcut>{shortcutLabel("+")}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!canZoomOut} onSelect={() => executeDesktopCommand(DesktopCommand.ZoomOut)}>
                  <IconZoomOut className="size-4" />
                  {intl.formatMessage({ id: "titleBar.menu.view.zoomOut" })}
                  <DropdownMenuShortcut>{shortcutLabel("-")}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!zoomNotDefault} onSelect={() => executeDesktopCommand(DesktopCommand.ResetZoom)}>
                  <IconMaximize className="size-4" />
                  {intl.formatMessage({ id: "titleBar.menu.view.actualSize" })}
                  <DropdownMenuShortcut>{shortcutLabel("0")}</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : null}
          {/* 用量：打开统计 + 升级/续费 */}
          <UsageMenuItems state={usageState} onUsageClick={effectiveUsageClick} onUpgradeClick={onUpgradeClick} />
          {/* 登录（未登录时）/登出 */}
          {onLogin && !user ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onLogin} data-testid={TESTID_LOGIN_MENU_ITEM}>
                <IconLogIn className="size-4" />
                {intl.formatMessage({ id: "app.login" })}
              </DropdownMenuItem>
            </>
          ) : null}
          {onLogout ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onLogout} data-testid={TESTID_LOGOUT_BUTTON}>
                <IconLogOut className="size-4" />
                {intl.formatMessage({ id: "app.logout" })}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* 右：Web 远控触发器（桌面+有工作区）+ 设置按钮 */}
      <div className="flex shrink-0 items-center gap-1.5">
        {isDesktop && workspacePath ? (
          <WebRemoteControlTrigger
            workspacePath={workspacePath}
            workspaceIdentity={workspaceIdentity}
            remoteSessionId={workspaceRemoteSessionId}
            initialTaskId={activeTaskId ?? undefined}
            compact
          />
        ) : null}
        <Tooltip title={settingsButtonLabel}>
          <Button type="button" variant="ghost" size="icon-lg" data-testid={TESTID_TASK_SETTINGS_BUTTON}
            aria-label={settingsButtonLabel} disabled={settingsButtonDisabled} onClick={onSettingsButtonClick}>
            <IconSettings className="size-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
});
interface TaskInteractionBadgeProps {
  interaction: TaskInteraction | null;
  legacyPending?: boolean;
  className?: string;
  now?: number;
  formatMessage: (id: string) => string;
  onSnoozeCountdown?: (interactionId: string) => Promise<boolean> | boolean;
}
/** 原 b8（150807 / 124916）：待交互徽章——
 *  权限=静态胶囊；用户输入=倒计时胶囊（进度用 --zcode-interaction-progress 驱动），
 *  可暂停时悬停显示「停止倒计时」并点击请求暂停。 */
export function TaskInteractionBadge({ interaction, legacyPending = false, className, now, formatMessage, onSnoozeCountdown }: TaskInteractionBadgeProps) {
  const [clock, setClock] = React.useState(() => Date.now());
  const snoozingRef = React.useRef<string | null>(null);
  const effectiveNow = now ?? clock;

  // 无外部 now 时自走时钟：窗口聚焦/可见性变化时刷新
  React.useEffect(() => {
    if (now !== undefined) return;
    const refresh = () => setClock(Date.now());
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [now, interaction?.interactionId, interaction?.autoResolution?.state, interaction?.autoResolution?.startedAt]);

  const model = resolveInteractionBadgeModel(interaction, legacyPending, effectiveNow);
  if (!model) return null;
  const label = formatMessage(model.kind === "userInput" ? "taskList.userInputTag" : "taskList.permissionTag");
  const stopLabel = formatMessage("taskList.stopCountdown");
  const progress = model.kind === "userInput" ? model.countdownProgress : undefined;
  const autoResolution = interaction?.autoResolution;
  const remainingMs = progress !== undefined && autoResolution && autoResolution.state !== "snoozed"
    ? Math.max(0, autoResolution.deadlineAt - effectiveNow)
    : 0;
  const progressStyle = progress === undefined ? undefined : ({
    "--zcode-interaction-progress": String(progress),
    "--zcode-interaction-remaining-ms": remainingMs + "ms",
  } as React.CSSProperties);
  const snoozable = model.canSnooze && !!interaction && !!onSnoozeCountdown;
  const handleSnooze = () => {
    if (!snoozable || !interaction || !onSnoozeCountdown || snoozingRef.current === interaction.interactionId) return;
    snoozingRef.current = interaction.interactionId;
    let result: Promise<boolean> | boolean;
    try {
      result = onSnoozeCountdown(interaction.interactionId);
    } catch {
      snoozingRef.current = null;
      return;
    }
    Promise.resolve(result)
      .then((ok) => { if (!ok && snoozingRef.current === interaction.interactionId) snoozingRef.current = null; })
      .catch(() => { if (snoozingRef.current === interaction.interactionId) snoozingRef.current = null; });
  };
  const badgeClass = cn(
    "relative inline-flex h-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-transparent bg-interaction-confirmation-surface px-2 text-ui-sm font-medium text-interaction-confirmation-foreground",
    className,
  );
  const inner = (
    <>
      {progress === undefined ? null : (
        <span aria-hidden="true" className="zcode-task-interaction-countdown-fill absolute inset-0 origin-left bg-interaction-ask-fill transition-opacity group-hover/interaction-badge:opacity-0 group-focus-visible/interaction-badge:opacity-0 motion-reduce:transition-none" />
      )}
      {snoozable ? (
        <span aria-hidden="true" className="relative z-1 grid whitespace-nowrap">
          <span className="col-start-1 row-start-1 transition-opacity group-hover/interaction-badge:opacity-0 group-focus-visible/interaction-badge:opacity-0 motion-reduce:transition-none">{label}</span>
          <span className="col-start-1 row-start-1 opacity-0 transition-opacity group-hover/interaction-badge:opacity-100 group-focus-visible/interaction-badge:opacity-100 motion-reduce:transition-none">{stopLabel}</span>
        </span>
      ) : (
        <span className="relative z-1 whitespace-nowrap">{label}</span>
      )}
    </>
  );
  return snoozable ? (
    <button
      type="button"
      data-task-interaction-badge={model.kind}
      data-slot="badge"
      data-countdown-progress={progress?.toFixed(3)}
      data-countdown-snoozable="true"
      aria-label={stopLabel}
      className={cn("group/interaction-badge cursor-pointer transition-colors hover:bg-secondary hover:text-foreground focus-visible:bg-secondary focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-border-focused motion-reduce:transition-none", badgeClass)}
      style={progressStyle}
      onMouseDown={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); }}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSnooze(); }}
    >
      {inner}
    </button>
  ) : (
    <span data-task-interaction-badge={model.kind} data-slot="badge" data-countdown-progress={progress?.toFixed(3)} className={badgeClass} style={progressStyle}>
      {inner}
    </span>
  );
}


/* ============================================================================
 * 23. 数据层助手声明（实现位置见头注；接口级）
 * ==========================================================================*/

/** 原 PFt（144342）：项目视图展开键集合 */
declare function expandedWorkspaceKeySet(args: { enabled: boolean; expandedWorkspacePaths: Set<string>; workspaces: WorkspaceTab[] }): Set<string>;
/** 原 FFt（144351）：读取工作区可见条数限制（下限 5） */
/** 原 IFt（144355）：可见条数 +5 */
declare function incrementVisibleLimit(map: Record<string, number>, key: string, defaultLimit?: number): Record<string, number>;
/** 原 LFt（144358）：清理已不在展开集合中的可见数限制 */
declare function pruneVisibleLimits(map: Record<string, number>, keepKeys: Set<string>): Record<string, number>;
/** 原 dIt（144983）：折叠组集合裁剪到仍存在的组 */
declare function pruneCollapsedGroupIds(collapsed: Set<string>, existingGroupIds: string[]): Set<string>;
/** 原 VFt（144427 / 120229）：项目视图任务分组数据钩子（本地查询 + 远端 k6 + 乐观叠加） */
/** 原 W6（144363）：工作区展开标记映射（路径 → true） */
declare function workspaceExpansionFlags(current: Record<string, boolean>, paths: string[]): Record<string, boolean>;

/* ============================================================================
 * 22b. 补遗：小助手与跨块依赖（原定义散见于本 chunk 与 src-HCld2afU.js）
 * ==========================================================================*/

/** 原 qr（导入自 src-HCld2afU.js，内部名 Nb，8464）：testid 作用域拼接 `${base}-${id}` */
function scopedTestId(base: string, id: string): string {
  return `${base}-${id}`;
}

/** 原 R2（123289）：工作区页签键 = 去空白后的 workspaceIdentity，否则 workspacePath */
function resolveWorkspaceTabKey(tab: Pick<WorkspaceTab, "workspacePath" | "workspaceIdentity">): string {
  return tab.workspaceIdentity?.trim() || tab.workspacePath;
}

/** 原 b2（122295）：会话索引键 `${workspaceScopeKey}::${sessionId}`（U0 即 R2 同构函数，121375） */
function sessionIndexKey(workspaceScope: Pick<WorkspaceTab, "workspacePath" | "workspaceIdentity">, sessionId: string): string {
  return `${resolveWorkspaceTabKey(workspaceScope)}::${sessionId}`;
}

/** 原 RBt（158137）+ zBt（158140）：SSH 远端目标 → 连接信息（别名/`user@host:port`/工作区路径） */
function resolveSshConnectionInfo(tab: WorkspaceTab): { alias: string | null; hostLabel: string; workspacePath: string } | null {
  if (tab.remoteTarget?.kind !== "ssh") return null;
  const target = tab.remoteTarget;
  const username = typeof target.username === "string" ? target.username.trim() : "";
  const host = typeof target.host === "string" ? target.host.trim() : "";
  return {
    alias: typeof target.sshConfigAlias === "string" && target.sshConfigAlias.trim() ? target.sshConfigAlias.trim() : null,
    hostLabel: `${username}@${host}:${target.port ?? 22}`,
    workspacePath: tab.workspacePath,
  };
}

/** 原 cFt（142449）：任务双序排序——`created` 按创建时间倒序，`updated`（默认）按更新时间倒序，
 *  同级再按另一时间倒序，最后按 taskId 字典序稳定兜底 */
function sortTasksBy(tasks: TaskMeta[], sortBy: TaskSortBy = "updated"): TaskMeta[] {
  return [...tasks].sort((a, b) =>
    sortBy === "created"
      ? b.createdAt === a.createdAt
        ? b.updatedAt === a.updatedAt
          ? b.taskId.localeCompare(a.taskId)
          : b.updatedAt - a.updatedAt
        : b.createdAt - a.createdAt
      : b.updatedAt === a.updatedAt
        ? b.createdAt === a.createdAt
          ? b.taskId.localeCompare(a.taskId)
          : b.createdAt - a.createdAt
        : b.updatedAt - a.updatedAt,
  );
}

/** 原 dIt（144983）：有效组 id 均不在折叠集合中（=全部展开；供「全部展开/收起」开关判定） */
function areAllGroupsCollapsed(groupIds: string[], collapsedGroupIds: Set<string>): boolean {
  return groupIds.length > 0 && groupIds.every((id) => !collapsedGroupIds.has(id));
}

/** 原 ezt（153085）：分组视图首屏加载态 = 未初始化，或（加载中且尚无节点） */
function isGroupedViewInitialLoading(state: { initialized: boolean; loading: boolean; hasNodes: boolean }): boolean {
  return !state.initialized || (state.loading && !state.hasNodes);
}

/** 原 io.createPortal（react-dom）：弹层传送门（拖拽覆盖层挂到 document.body） */
declare function createPortal(children: React.ReactNode, container: Element | DocumentFragment): React.ReactElement;

/** 原 o8（144939）：把任务插入指定组——beforeTaskKey 为 null 时追加到组尾，
 *  找不到锚点时也追加到组尾；组不存在则原样返回 */
function insertTaskIntoGroup(view: GroupedView, task: TaskMeta, groupId: string, beforeTaskKey: string | null): GroupedView {
  const nodes = cloneGroupedNodes(view);
  const groupIndex = nodes.findIndex((node) => node.type === "group" && node.group.id === groupId);
  const groupNode = nodes[groupIndex];
  if (!groupNode || groupNode.type !== "group") return { nodes };
  const nextGroupNode = cloneGroupNode(groupNode);
  const insertIndex = beforeTaskKey === null
    ? nextGroupNode.tasks.length
    : nextGroupNode.tasks.findIndex((item) => groupedTaskKey(item) === beforeTaskKey);
  nextGroupNode.tasks.splice(insertIndex < 0 ? nextGroupNode.tasks.length : insertIndex, 0, task);
  nodes[groupIndex] = nextGroupNode;
  return { nodes };
}

/** 原 TIt（145118）：把任务移到其所在容器（根列表/所属组）的最前；已在最前则原样返回 */
function moveTaskToTopOfView(view: GroupedView, task: TaskMeta): GroupedView {
  const taskKey = groupedTaskKey(task);
  const location = locateTaskInView(view, taskKey);
  if (
    !location ||
    (location.parent === "root" && location.nodeIndex === 0) ||
    (location.parent === "group" && location.taskIndex === 0)
  ) {
    return view;
  }
  const { nextView, task: removedTask } = removeTaskFromView(view, taskKey);
  if (!removedTask) return view;
  if (location.parent === "group") {
    const groupNode = nextView.nodes.find((node) => node.type === "group" && node.group.id === location.groupId);
    if (!groupNode || groupNode.type !== "group") return view;
    const firstTaskKey = groupNode.tasks[0] ? groupedTaskKey(groupNode.tasks[0]) : null;
    return insertTaskIntoGroup(nextView, removedTask, location.groupId, firstTaskKey);
  }
  return { nodes: [{ type: "task", task: removedTask }, ...nextView.nodes] };
}

/** 原 yzt（154168）：虚拟列表滚动目标偏移——
 *  顶部的「无行为 + 已在顶部」滚动请求会被忽略，避免水合抖动 */
function virtualScrollTo(
  offset: number,
  { adjustments = 0, behavior }: { adjustments?: number; behavior?: ScrollBehavior },
  instance: unknown,
): void {
  const virtualizer = instance as { scrollElement: Element | null | undefined; scrollOffset: number; options: { horizontal?: boolean } };
  const scrollElement = virtualizer.scrollElement;
  if (!scrollElement) return;
  const target = offset + adjustments;
  if (
    !virtualizer.options.horizontal &&
    offset === 0 &&
    adjustments === 0 &&
    behavior === undefined &&
    scrollElement.scrollTop > 0 &&
    virtualizer.scrollOffset === 0
  ) {
    return;
  }
  if (virtualizer.options.horizontal) {
    scrollElement.scrollTo({ left: target, behavior });
    return;
  }
  scrollElement.scrollTo({ top: target, behavior });
}

/** 原 Ezt（154899 / 128180）：分组节点拖拽覆盖层卡片——色点 + 组名（含定时/闲时默认组回退名）+ 任务数 */
export function GroupNodeDragOverlayCard({ node, className, style }: {
  node: Extract<GroupedViewNode, { type: "group" }>;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { intl } = useIntlContext();
  const title = resolveGroupTitle(node.group, {
    cron: intl.formatMessage({ id: "taskGroup.cronGroupName" }),
    offPeak: intl.formatMessage({ id: "offPeak.sidebar.groupTitle" }),
  });
  return (
    <div className={className} style={style}>
      <div className="pointer-events-none flex h-8 cursor-grabbing items-center gap-1 rounded-lg border border-border bg-background pl-1.5 pr-1 text-ui-base text-foreground shadow-lg">
        <GroupColorDot color={node.group.color} />
        <span className="min-w-0 flex-1 truncate px-1">{title}</span>
        <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-tag/50 px-1.5 py-0.5 text-ui-sm font-medium leading-none text-foreground-subtle">
          {node.tasks.length}
        </span>
      </div>
    </div>
  );
}

/** 原 h8（146813 / 121650）：任务列表加载中行（旋转图标 + 文案） */
export function TaskListLoadingRow() {
  const { intl } = useIntlContext();
  return (
    <div className="flex items-center gap-2 px-2.5 py-1 text-ui-base text-foreground-subtlest">
      <SpinnerStatus className="size-4 text-foreground-subtlest" />
      <span>{intl.formatMessage({ id: "taskList.loading" })}</span>
    </div>
  );
}

/** 原 uzt（153205 / 126650）★：分组任务视图数据层 hook——
 *  拉取 listGroupedTaskViewStructure + 任务索引，合成乐观视图（草稿提升覆盖层），
 *  并提供 创建组/重命名组/改色/解散组/应用顺序 等持久化操作（失败回滚本地视图）。
 *  依赖跨块助手（izt/QRt/qRt/szt/rzt/lzt/j8/Cx/ZRt/J3/JS/dx/OFt 等），此处按接口级声明。 */
interface GroupedTaskViewController {
  view: GroupedView;
  setView: (view: GroupedView | ((current: GroupedView) => GroupedView)) => void;
  loading: boolean;
  initialized: boolean;
  saving: boolean;
  refresh: () => Promise<void>;
  createGroup: () => Promise<TaskGroup>;
  renameGroup: (groupId: string, title: string) => Promise<void>;
  updateGroupColor: (groupId: string, color: GroupColor) => Promise<void>;
  ungroupGroup: (groupId: string) => Promise<void>;
  applyOrder: (view: GroupedView) => Promise<void>;
}

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → js 行 / jsx 行；★=接口级未逐行展开）
 * ============================================================================
 *  骨架：rVt→WorkspaceSidebar 159137/132075 | (Vn)→renderOrganizeHeader 159620/132412
 *   nVt→resolveTaskViewMode 159128/132072 | QBt→DisabledReasonWrapper 159109/132053
 *   lBt→StickyHeaderSlot 156222/128901 | cBt→STICKY_HEADER_EXIT_DELAY_MS 156221/128900
 *   GBt→PurposeSection 158981/131948 | WBt→resolveExpandToggleState 158970/131941
 *   UBt→expandToggleMessageId 158967/131938 | tVt→WorkspaceTabDragOverlay 159114/132061
 *   ZBt→resolveWorkspaceTabReorder 159100/132041 | YBt→workspaceListDragTransition 159081/132008
 *   KBt/qBt/JBt→拖拽位移常量/助手 159062–159080/131993–132007
 *   XBt→isWorkspaceExpandedDuringDrag 159097/132035 | VBt→restrictDragToVerticalAxis 158883/131861
 *   $Bt/eVt→EMPTY_TASK_ITEMS/EMPTY_REMOTE_LOGS 159112/132057
 *  任务行：EFt→NewTaskRow 144153/120034 | E8→TaskRow 151186/125140 | LRt→taskRowPropsAreEqual 151162/125125
 *   b8→TaskInteractionBadge 150807/124916 | wRt→isSnoozableUserInputInteraction 150788/124887
 *   TRt→resolveInteractionBadgeModel 150793/124892 | ERt→useSnoozeInteractionCountdown★ 150926/124970
 *   D8→TaskRowContextMenuContent 151618/125352 | CRt→TaskActionContextMenuContent 150732/124828
 *   dzt→GroupedTaskContextMenuContent 153462/126985 | M8→TaskRowActionButton 153598/127060
 *   fzt→formatChangeStatParts 153631/127078 | w8→OverflowMarqueeText 150996/125026
 *   m8/h8→RemoteSyncingRow/TaskListLoadingRow 146803/146813 / 122299/122307
 *   zRt→SectionTitle 151751/125475 | RRt/VRt→taskRowKey 151748/152244
 *  分组：pzt/mzt→GroupedTaskRow(+memo) 153636/154014 / 127081/127331
 *   gzt/N8→GroupedTaskRowSlot(+memo) 154042/154092 / 127354/127401
 *   hzt→GroupEmptyDropZone 154015/127332 | _zt→NewThreadRow 154093/127402
 *   wzt→GroupTaskVirtualList 154202/127466 | Tzt→GroupSection 154327/127546
 *   Ezt→GroupNodeDragOverlayCard 154899/127898 | Izt→CollapsedGroupStickyHeader 155026/128002
 *   Fzt→GroupedNodeVirtualList 154948/127941 | sBt→GroupedTasksSection 155455/128357
 *   $6→GROUP_COLORS 144872/120648 | $Ft/eIt→色板类名 144873/144881
 *   tIt/nIt/rIt/iIt/aIt/oIt→分组行类名常量 144890–144896/120667–120672
 *   e8/t8→GroupColorDot/GroupColorSwatch 144897/144903 | n8→groupedTaskKey 144906/120686
 *   sIt/r8/i8/a8/o8/cIt/s8/lIt/uIt→视图不可变操作 144909–144980（c8…TIt 144998–145136 同族）
 *   Gne/ane→DEFAULT_GROUP_ID_CRON/OFF_PEAK（src chunk 8724/8725）| P8→resolveGroupTitle 154158/127422
 *   EIt/kIt/AIt→折叠组持久化 145137–145166/121001–121020 | uzt→useGroupedTaskView★ 153205/126735
 *   Kzt/$zt/qzt…Gzt/Lzt/Rzt/F8/zzt/Bzt/nBt…oBt→分组拖拽助手★(声明) 155202–155454/128079–128356
 *   z8→groupedNodeFingerprint★ 155354 | eBt/tBt→dropAnimation/autoScroll★ 155361
 *  列表段：BRt→PinnedTasksSection 151757/125480 | HRt→TimelineTasksSection 152247/125894
 *   lLt→ArchivedTasksSection★ 146823 | mLt→WebRemoteTaskListSection★(F17) 147286
 *  偏好：UFt/K6/q6/KFt→任务偏好 144772–144802 | J6…Q6→分段偏好 144803–144862
 *   ZFt/QFt→partitionWorkspaceTabsByPurpose 144863/144866 | PFt/FFt/IFt/LFt→可见数助手★ 144342–144362
 *   VFt→useWorkspaceTaskGroups★ 144427/120229 | DFt…NFt→乐观叠加助手★ 144184–144341
 *  stores：E6→useRemotePinnedTaskListStore 142372/118266 | k6→useRemoteWorkspaceTaskListStore 142464/118392
 *   T6/O6→storeWorkspaceKey 142360/144446 | sFt/cFt→排序 142363/142449 | D6/A6→刷新助手★ 142430/142553
 *  页脚：SRt→SidebarFooter 150435/124677 | yRt/bRt/xRt→用户名助手 150426–150432
 *   mRt→useSidebarUsageState★ 150255 | hRt→UsageMenuItems 150373/124636 | gRt→UsagePlanBadge 150410/124662
 *   uRt/dRt/fRt→用量视图模型★ 150230–150254 | pRt→升级按钮 testid 150254
 *   cRt/lRt→WebRemoteControlTrigger 150140/150159 | sRt→resolveRemoteControlStatusDisplay 150109
 *   y8→useWebRemoteControlEnabled 150106 | _Rt/vRt→ZOOM_LEVEL_MIN/MAX 150424
 *   hLt/gLt/_Lt→Avatar 原语 147698–147725（F04 数值段，页脚复用）
 *  工作区行：BBt→WorkspaceSidebarItem 158149/131453 | HBt→SortableWorkspaceSidebarItem 158893/131883
 *   MBt→WorkspaceTaskList 157550块/131192 | FBt→RemoteConnectionLogsPopover 158029/131404
 *   ABt→BeamBorderAnimation★ 157550/131107 | TBt…wBt→光束 CSS 生成★ 156793–157547
 *   V8/uBt/B8→logo 色板数据★ 156306/128919 | IBt→EMPTY_PINNED_TASKS 158132
 *   LBt→isUserHomeDirectory 158133/131439 | zBt→resolveSshConnectionInfo★ 158140/131446
 *   R2→resolveWorkspaceTabKey★ 104991 | NBt/PBt→autoScrollToBottom★ 158017/158020
 *  横切（本 chunk 族外，按调用面声明）：
 *   Io→workspaceKey | Lo→taskEntityKey | Fo→compareTasksForList | Mo→taskSessionActivity
 *   No→taskPendingAttention | Po→mergeTaskWithActivity | QS→resolveTaskIndicator | $S→formatRelativeTime
 *   vg→taskChangeSummary | Vhe→titleWithChangeStats | Go→workspaceBaseName
 *   uPt/dPt/fPt/pPt→日期桶分组 116958–117060 | pi/Yr→isCronTask/isOffPeakTask（src chunk fx/px）
 *   sc→isLocalDirectoryUnavailableSelector 3324 | mc→useOptionalTabStore | pc→useTabStore
 *   ko→useSettingsStore | Zs→useSessionRegistryStore | Vo→useSearchResultsStore | A2→useSessionRouterStore
 *   xe→useTaskStore | fe→getWorkspaceSlice | Uo→applyOptimisticTaskMutation（TopBar 已还原）
 *   j6→TaskRenameDialog | oFt→TaskActionMenuItems | C6→useTaskFileActions | w6→buildTaskFeedbackDescription
 *   n4→RemoteSyncMenuItems | r4→RemoteSyncDialogs | $2→canOpenRemoteSessionSourceCheck
 *   QTt→sshDecoratedProjectName | yC→useFeedbackStore | ls→useTrajectoryViewerStore
 *   J3→useScopedWorkspaceTabs | yc→buildWorkspaceServicesMap | ZS→useTaskListItems | Tse→resolveServicesByWorkspaceIdentity
 *   u2/Iwt/Lwt/Rwt→会话拖拽 | PRt→createDragImageUpdater（A1-R4 起经 SplitLayoutUiDeep 真实 import）| Wwt/Gwt/Kwt→canonical 在 SplitLayoutUiDeep（分组视图退役，未接线）
 *   M6/N6/V6→同步后刷新 | Qie→forgetRecentWorkspaces | aw→markUsageEntryIntent | xw→trackEvent
 *   EN→SpinnerStatus 54789 | LTt→useSessionOpenability | b2→sessionIndexKey
 *   hC/gC/_C→Tabs 原语 36949 | VO…$O→DropdownMenu 原语 47926 | yk…Ck→ContextMenu 原语 43966
 *   kZ/AZ/jZ→Collapsible 原语 82939 | uJ→Badge 70704 | Ia→Tooltip | Na/Oa/Ma/ka→Popover（usageStatsUiParts）
 *   dnd-kit vendored 91811–94695 | to→useVirtualizer（esm-BY6T6pIH.js）
 * ============================================================================ */
