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
 *   PRt  → createDragImageUpdater    (151118 / 125117)
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
 *   EN SpinnerIcon (54789) | aw markUsageEntryIntent (js 39378 / jsx 35396；A1-R24 补 js 行)
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


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/shell/Sidebar.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  GroupColorDot,
  GroupColorSwatch,
  groupedTaskKey,
  moveTaskToGroupEdge,
  moveTaskIntoGroupStart,
  moveTaskIntoGroupEnd,
  useRemotePinnedTaskListStore,
  useRemoteWorkspaceTaskListStore,
  DisabledReasonWrapper,
  NewTaskRow,
  RemoteSyncingRow,
  OverflowMarqueeText,
  TaskRow,
  MemoTaskItem,
  TaskRowActionButton,
  TaskActionContextMenuContent,
  TaskRowContextMenuContent,
  PinnedTasksSection,
  TimelineTasksSection,
  RemoteConnectionLogsPopover,
  WorkspaceTaskList,
  WorkspaceSidebarItem,
  restrictDragToVerticalAxis,
  workspaceListDragTransition,
  WorkspaceTabDragOverlay,
  StickyHeaderSlot,
  HomeConversationsSection,
  WsEnumWorkspaceRow,
  WsEnumSection,
  WorkspaceSidebar,
  PurposeSection,
  SortableWorkspaceSidebarItem,
  WebRemoteControlTrigger,
  UsagePlanBadge,
  UsageMenuItems,
  SidebarFooter,
  TaskInteractionBadge,
  GroupNodeDragOverlayCard,
  TaskListLoadingRow,
  taskChangeSummary, // 〔A1-P3-B11〕原 vg（23753）转导出：SidebarLeaves declare 收敛改指面
} from '../components/shell/Sidebar';
