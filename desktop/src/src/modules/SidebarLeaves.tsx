/* eslint-disable */
/**
 * ============================================================================
 * SidebarLeaves.tsx — Sidebar 族接口级叶子展开（B4 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，规格文档行号以它为准）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：同目录 Sidebar.report.md §2「接口级（★）保留清单」——本文件将其中六项叶子
 *       从「接口声明」展开为「逐行还原」，格式与口径同 TopBar.tsx / Sidebar.tsx。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  数据层钩子：
 *   VFt  → useWorkspaceTaskGroups   项目视图任务分组数据钩子 (144469)
 *   uzt  → useGroupedTaskView       分组任务视图数据层钩子 (153251)
 *   mRt  → useSidebarUsageState     侧栏用量状态钩子（F12 域接线）(150301)
 *  分组视图合成助手（uzt 依赖族，本次一并实体化）：
 *   KRt  → sortTasksByGroupOrder        (— / 126406)
 *   qRt  → buildGroupedViewFromStructure (152903 区 / 126428)
 *   JRt  → applyDraftPromotions          (— / 126470)
 *   YRt  → findTaskInViewByKey           (— / 126504)
 *   XRt  → isTaskFirstInGroup            (— / 126514)
 *   ZRt  → normalizeWorkspaceScopes      (— / 126518)
 *   j8   → collectViewWorkspaceScopes    (— / 126525)
 *   QRt  → composeOptimisticOverlay      (153040 区 / 126543)
 *   $Rt  → collectViewTaskKeys           (— / 126621)
 *   tzt  → isGroupedViewReady            (— / 126635)
 *   nzt  → GroupedViewLoadCache（class） (— / 126641)
 *   rzt  → prependCreatedGroup           (— / 126669)
 *   izt  → resolveVisibleMissingTaskKeys (— / 126679)
 *   azt  → viewNodeOrderKey              (— / 126690)
 *   ozt  → viewNodesShallowEqual         (— / 126693)
 *   szt  → mergeGroupedViewPreservingIdentity (— / 126696)
 *   czt  → toTopLevelNodeRef             (— / 126714)
 *   lzt  → serializeGroupedViewOrder     (— / 126721)
 *   Cx   → fetchTaskIndex（接口级，跨块助手群 _x/vx/gx/yx/bx/xx/Sx/xOe/bOe）(32477)
 *  光束动画族：
 *   ABt  → BeamBorderAnimation       光束描边动画容器 (157596)
 *   OBt  → useSystemThemePreference  prefers-color-scheme 侦听 (— / 131093)
 *   kBt  → resolveBeamTheme          auto → 系统主题 (— / 131104)
 *   wBt  → generateBeamCss           尺寸分派 (— / 130367)
 *   TBt  → generateBeamCssSm         旋转 conic 描边 (— / 130373)
 *   EBt  → generateBeamCssMd         旋转 conic + 边缘渐隐 (— / 130593)
 *   DBt  → generateBeamCssLine       行波 travel/spike 动画 (— / 130825)
 *   fBt/pBt → smBorderGradients/smInnerGradients (— / 129454/129458)
 *   mBt/hBt → mdBorderGradients/mdInnerGradients (— / 129462/129466)
 *   gBt  → resolveSpikePalette       (— / 129475)
 *   H8   → withAlpha                 rgb()/rgba() → 指定 alpha (— / 129920)
 *   vBt  → lineStrokeGradients       (— / 129929)
 *   bBt  → lineInnerGradients        (— / 130159)
 *   SBt  → lineBloomGradients        (— / 130327)
 *   CBt  → lineBloomMonoGradients    (— / 130349)
 *   uBt  → BEAM_SIZE_PRESETS         sm/md/line 圆角与描边宽 (— / 128919)
 *   B8   → BEAM_THEME_PARAMS         尺寸×主题 不透明度/内阴影/饱和 (— / 128935)
 *   V8   → MD_BEAM_PALETTES          md 边框/尖峰色板 (— / 128990)
 *   dBt  → SM_BEAM_PALETTES          sm 边框/内部色板 (— / 129180)
 *   _Bt  → LINE_STROKE_PALETTES      line 描边色板（主题×变体）(— / 129479)
 *   yBt  → LINE_INNER_PALETTES       line 内部色板 (— / 129940)
 *   xBt  → LINE_SPIKE_PALETTES       line 尖峰色板 (— / 130168)
 *  列表段：
 *   lLt  → ArchivedTasksSection      归档任务段 (146869)
 *   mLt  → WebRemoteTaskListSection  Web 远控任务列表段 (147332)
 *   uLt  → WebRemoteTaskRow          远控任务行 (— / 122425)
 *   aPt  → useWebRemoteTaskSwitcher  远控打开/切换状态钩子 (— / 116882)
 *   iPt  → openWebRemoteTask         远控任务打开流程 (— / 116801)
 *   dLt  → WEB_REMOTE_RETRY_DELAY_MS = 300 (— / 122539)
 *   fLt  → WEB_REMOTE_MAX_RETRIES = 3      (— / 122540)
 *   pLt  → waitRetryDelay            (— / 122541)
 *   DPt  → buildWebRemoteTaskViewModel 视图模型（pinned/groups/timeline/archived）(— / 117181)
 *   TPt  → groupTasksByWorkspace     (— / 117155)
 *   EPt  → taskMatchesSearch         (— / 117146)
 *   _6   → filterTasksBySearch       (— / 117149)
 *   g6   → sortTaskRows              (— / 117120)
 *   SPt  → taskRowComparator         (— / 117117)
 *   CPt  → sameTaskRef               (— / 117126)
 *   wPt  → applyRemoteTaskMembership (— / 117128)
 *   _Pt  → filterRemoteCapableWorkspaces (— / 117029)
 *   gPt  → isRemoteCapableWorkspace  (— / 117026)
 *   vPt  → shouldRetryEmptyRemoteIndex (— / 117035)
 *   h6   → mapRemoteTasksToRows      (— / 117063)
 *   xPt  → resolveTaskDisplayStatus  (— / 117053)
 *   mPt  → isStreamingDisplayStatus  (— / 117049)
 *   hPt  → isRunningRuntimeStatus    (— / 117051)
 *   bPt  → normalizeRuntimePhase     (— / 117043)
 *   f6   → webRemoteTaskKey          `${workspaceKey}:${taskId}` (— / 116795)
 *   ei   → taskWorkspaceKey          identity?.trim() || path（Io 的任务对象形态）
 *   sLt  → cleanupDeletedTaskState   (— / 122284)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk；标注来源 chunk）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() (Z)                       utils-CEEH0K_K.js
 *  3. Button (X) / 图标工厂           button-laUijeDG.js
 *  4. useIntlContext (G)             IntlProvider-C321H7m8.js
 *  5. Tooltip (Ia)                   usageStatsUiParts-CiR7YEhh.js
 *  6. logger (J)                     logger-PFDwl5Yq.js
 *  7. useTaskStore (xe) / getWorkspaceSlice (fe)   skillStore-BmeKHDBI.js
 *  8. 会话注册/搜索/路由 store (Zs/Vo/A2)           src-HCld2afU.js
 *  9. useConfirmDialog (U2) / applyOptimisticTaskMutation (Uo)  已在 TopBar.tsx 还原
 * 10. useTaskListItems (ZS) / buildWorkspaceServicesMap (yc) / useScopedWorkspaceTabs (J3)
 *                                    src-HCld2afU.js（接口声明，见 §0）
 * 11. 用量域 F12（JM/xn/qq/hX/q/Uq/dr/TY/pX/Mrt/$j/rM/Oq/PCt）  接口声明，见 §0
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/shell/SidebarLeaves.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  readVisibleLimit,
  expandedWorkspaceKeySet, // 〔A1-R129i〕原 PFt 144384 实体化转导出（Sidebar §23 declare 退役批）
  incrementVisibleLimit, // 〔A1-R129i〕原 IFt 144397 实体化转导出
  pruneVisibleLimits, // 〔A1-R129i〕原 LFt 144400 实体化转导出
  useWorkspaceTaskGroups,
  useSidebarUsageState,
  useGroupedTaskView,
  generateBeamCssSm,
  generateBeamCssMd,
  generateBeamCssLine,
  generateBeamCss,
  useSystemThemePreference,
  BeamBorderAnimation,
  ArchivedTasksSection,
  WebRemoteTaskListSection,
} from '../components/shell/SidebarLeaves';
export type {
  SidebarUsageStateModel,
  GroupedTaskViewController,
  BeamBorderAnimationProps,
} from '../components/shell/SidebarLeaves'; // 〔A1-R52〕WebRemoteSwitcher 转导出删除——switcher 族属主闭合，canonical = WebRemote.WebRemoteSwitcherService（消费面改指 modules/WebRemote）
