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
 *   OPt  → EMPTY_MOBILE_HOME_RESULT   {workspaces:[],tasks:[]} (140585 / 117214)
 *   kPt  → MOBILE_HOME_PREFERENCES_STORAGE_KEY (140586 / 117215)
 *   v6   → DEFAULT_MOBILE_HOME_PREFERENCES {organizeBy:workspace,sortBy:updated} (140587 / 117216)
 *   APt  → safeLocalStorage           (140588 / 117223)
 *   jPt  → isValidMobileHomePreferences (140596 / 117231)
 *   MPt  → loadMobileHomePreferences  (140604 / 117236)
 *   NPt  → saveMobileHomePreferences  (140614 / 117246)
 *   PPt  → buildMobileHomeModel       pinned/timeline/groups/计数 (140619 / 117251)
 *   FPt  → activeTaskPresentInModel   (140648 / 117283)
 *   y6   → taskStatusBadgeClass       running/completed/error/idle (140658 / 117286)
 *   IPt  → latestTaskUpdatedAt        (140670 / 117298)
 *  [主题菜单]（js 140673–140714 / jsx 117301–117322）：
 *   LPt  → MOBILE_THEME_OPTIONS [system,zai-dark,zai-light] (140673 / 117301)
 *   RPt  → MobileThemeMenu            手机端远控视图主题下拉 (140674 / 117302)
 *  [状态图标/空回调]（js 140716–140725 / jsx 117323–117328）：
 *   b6   → TaskStatusIcon             running→spinner/completed→circle-check/error→circle-alert (140716 / 117323)
 *   zPt  → noopSelectTask             (140725 / 117328)
 *  [根] 手机端远控任务首页（js 140726–141572 / jsx 117329–117657）：
 *   BPt  → WebRemoteMobileTaskHome    props: activeTaskId/initialResult/onNavigateHome/onNavigateToChat 等
 *  [mobile 页状态 store + history]（js 141573–141600 / jsx 117658–117680）：
 *   VPt  → terminalTransportState     初值 `idle` (141573 / 117657)
 *   HPt  → transportStateListeners    (141574 / 117658)
 *   UPt  → subscribeTransportState    (141577 / 117659)
 *   WPt  → getTerminalTransportState  (141583 / 117664)
 *   GPt  → useTerminalTransportState  useSyncExternalStore (141586 / 117667)
 *   x6   → isMobileChatHistoryState   history.state.zcodeMobilePage===`chat` (141590 / 117670)
 *   KPt  → pushMobileChatHistoryState (141594 / 117673)
 *   qPt  → resolveInitialMobilePage (141598 / 117678)
 *  [根] 手机端壳（js 141601–141801 / jsx 117681–117765）：
 *   JPt  → WebRemoteMobileShell       home/chat 双页 + 侧pane 覆盖 + 重连通知
 *  [rRt 状态显示助手]（js 149473–149599 / jsx 123956–124056；位于 F11 地图范围尾段，
 *   rRt 的唯一消费族，纳入并注记双归属，F11 批若覆盖同段按整合期裁决）：
 *   JLt  → BOT_CHANNEL_PROVIDERS      [weixin,feishu,lark,telegram] (149473 / 123956)
 *   YLt  → statusMatchesWorkspaceTarget (149479 / 123965)
 *   XLt  → isStatusLiveMobileConnected (149490 / 123980)
 *   ZLt  → resolveStatusTitle         starting/running/… (149495 / 123983)
 *   QLt  → resolveStatusDetail        (149511 / 124011)
 *   $Lt  → statusDotClass             error→bg-destructive/active→bg-success/idle→bg-border/余→bg-warning (149527 / 124039)
 *   eRt  → resolveStatusTag           设备名/phone/ready/idle/error (149536 / 124042)
 *   tRt  → isSameWebRemoteStatus      17 字段逐比 (149549 / 124053)
 *   nRt  → resolveFailureMessage      11 种 failure.reason (149571 / 124056)
 *  [根] 远控启动对话框（js 149600–150145 / jsx 124107–124375）：
 *   rRt  → WebRemoteControlDialog     memo；QR 配对 + 停止/刷新/复制 + Bot Channel 入口
 *  [特性门]（js 150146–150153 / jsx 124376–124387）：
 *   iRt  → WEB_REMOTE_CONTROL_ENABLED_DEFAULT  **D5b 改写：!0 → !1** (150147 / 124378)
 *   aRt  → WebRemoteControlEnabledContext (150148 / 124379)
 *   oRt  → WebRemoteControlEnabledProvider (150149 / 124380)
 *   y8   → useWebRemoteControlEnabled (150152 / 124386)
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


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/remote/WebRemote.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  WebRemoteMobileTaskHome,
  WebRemoteMobileShell,
  WebRemoteControlDialog,
  WebRemoteControlEnabledProvider,
  useWebRemoteControlEnabled,
} from '../components/remote/WebRemote';
export type {
  TaskMeta,
  MobileHomeResult,
  WebRemoteSwitcherService,
} from '../components/remote/WebRemote';
