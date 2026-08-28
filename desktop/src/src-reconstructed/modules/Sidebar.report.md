# Sidebar 模块抽取报告（侧栏 + 任务列表 组件族 · D8 Stage B / F01）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/Sidebar.tsx`（7,204 行）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 地图：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/MODULE-MAP.md` · F01 SidebarFamily（js 142372–142753 + 144153–160322，约 16,550 行）
- 规格：`/home/none/grok-build/web/docs/zcode-uiux-spec.md` §4 / §13.8
- 标样：同目录 `TopBar.tsx` + `TopBar.report.md`（格式与口径一致）

---

## 0. 行号口径（与 TopBar 报告一致的勘误）

规格/地图锚点（rVt≈132075）命中的是 **jsx pretty-print 版**，不是压缩版 `out/…js`。
本报告对每个符号同时给出 **js 行（输入文件）/ jsx 行（规格口径）**。主要锚点双向验证：

| 组件 | 规格/地图行号(=jsx) | jsx 实际 | 输入 js 实际 |
|---|---|---|---|
| rVt（侧栏根） | 132075 | 132075 ✅ | 159137 |
| SRt（页脚） | 124677 | 124677 ✅ | 150435 |
| sBt（分组总控） | 128357 | 128357 ✅ | 155455 |
| BBt（工作区行） | 131453 | 131453 ✅ | 158149 |
| E8（任务行） | 125140 | 125140 ✅ | 151186 |
| EFt（新建任务行） | 120034 | 120034 ✅ | 144153 |

抽取以 jsx 阅读、以 js 复核，未改动 `out/`。

---

## 1. 抽取的组件清单（混淆名 → 语义名 → 行号范围）

### 1.1 核心组件族（完整还原进 Sidebar.tsx）

**侧栏骨架（rVt 及其内联件）**

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `rVt` | `WorkspaceSidebar` | 159137–160322 | 132075–133060 | 侧栏根：`aside flex h-full flex-col` = h-12 drag 条 + 导航 4 行 + 滚动容器（分段行在容器内）+ 项目/任务 section + 页脚 + 文件树滑层；含任务列表/分段/右键菜单/底栏/未读与状态点全部接线 |
| `(rVt 内联 Vn)` | `SidebarOrganizeHeader`（renderOrganizeByHeader） | 159620 | 132412 | 分段行：分组\|项目 pill + 排序菜单 + 归档开关 + 全部展开/收起 |
| `nVt` | `resolveTaskViewMode` | 159128 | 132072 | 一级视图解析 archived/timeline/grouped/workspace |
| `QBt` | `DisabledReasonWrapper` | 159109 | 132053 | 目录不可用 tooltip 包裹 |
| `lBt/cBt` | `StickyHeaderSlot` / `STICKY_HEADER_EXIT_DELAY_MS=150` | 156222/156221 | 128901/128900 | 吸顶头插槽（150ms 淡出） |
| `GBt` | `PurposeSection` | 158981 | 131948 | 项目/会话分段壳（Collapsible 折叠 + 拖拽重排 + 动作区） |
| `WBt/UBt` | `resolveExpandToggleState` / `expandToggleMessageId` | 158970/158967 | 131941/131938 | 全部展开/收起开关状态机 |
| `tVt` | `WorkspaceTabDragOverlay` | 159114 | 132061 | 项目行拖拽浮层 |
| `ZBt` | `resolveWorkspaceTabReorder` | 159100 | 132041 | 项目行重排 |
| `YBt/KBt/qBt/JBt` | 项目列表拖拽位移助手 | 159081/159062–159080 | 132008/131993–132007 | 拖拽 transform 计算 |
| `XBt` | `isWorkspaceExpandedDuringDrag` | 159097 | 132035 | 拖拽中强制展开判定 |
| `VBt` | `restrictDragToVerticalAxis` | 158883 | 131861 | 拖拽修饰器（锁 x=0、钳制 y） |
| `$Bt/eVt` | `EMPTY_TASK_ITEMS` / `EMPTY_REMOTE_LOGS` | 159112 | 132057 | 引用稳定空数组 |

**导航与任务行**

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `EFt` | `NewTaskRow` | 144153 | 120034 | 新建任务行（Ctrl+N） |
| `E8` | `TaskRow` | 151186 | 125140 | 任务行：未读点/状态点/置顶/归档确认/拖拽/交互徽章/相对时间/变更统计 |
| `LRt` | `taskRowPropsAreEqual`（+ `MemoTaskItem`） | 151162 | 125125 | memo 比较器 |
| `b8` | `TaskInteractionBadge` | 150807 | 124916 | 待交互徽章（用户输入/权限 + 倒计时） |
| `wRt/TRt` | `isSnoozableUserInputInteraction` / `resolveInteractionBadgeModel` | 150788/150793 | 124887/124892 | 徽章模型 |
| `ERt` | `useSnoozeInteractionCountdown` | 150926 | 124970 | 免打扰倒计时 |
| `D8` | `TaskRowContextMenuContent` | 151618 | 125352 | 任务右键菜单内容 |
| `CRt` | `TaskActionContextMenuContent` | 150732 | 124828 | 右键菜单壳 |
| `dzt` | `GroupedTaskContextMenuContent` | 153462 | 126985 | 分组任务右键菜单（移到分组▸/置顶/重命名/归档/未读/文件管理器/复制/打开方式▸） |
| `M8` | `TaskRowActionButton` | 153598 | 127060 | 行内图标按钮（纯 CSS tooltip） |
| `fzt` | `formatChangeStatParts` | 153631 | 127078 | 变更统计格式化 |
| `w8`(+`C8…jRt/MRt`) | `OverflowMarqueeText` + 跑马灯助手 | 150996(150984–150993) | 125026(125010–125025) | 溢出跑马灯文本 |
| `PRt` | `createDragImageUpdater` | 151118 | 125117 | 拖拽图像更新器 |
| `m8/h8` | `RemoteSyncingRow` / `TaskListLoadingRow` | 146803/146813 | 122299/122307 | 远端同步行 / 加载行 |
| `zRt` | `SectionTitle` | 151751 | 125475 | 段标题 |
| `RRt/VRt` | `taskRowKey` | 151748/152244 | 125473/125891 | 行 key |

**分组域（色板 / 视图操作 / 持久化 / 分组视图）**

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `$6` | `GROUP_COLORS`（gray red orange yellow green blue purple） | 144872 | 120648 | 分组色板 |
| `$Ft/eIt` | `GROUP_COLOR_SURFACE_CLASSES` / `GROUP_COLOR_BORDER_CLASSES` | 144873/144881 | 120649/120658 | 色板类名 |
| `tIt/nIt/rIt/iIt/aIt/oIt` | 分组行类名常量 | 144890–144896 | 120667–120672 | 行布局类名 |
| `e8/t8` | `GroupColorDot` / `GroupColorSwatch` | 144897/144903 | 120673/120679 | 色点 / 选色块 |
| `n8` | `groupedTaskKey` | 144906 | 120686 | 任务键 |
| `sIt/r8/i8/a8/o8/cIt/s8/lIt/uIt/dIt/fIt/pIt/mIt/c8/hIt/l8/gIt/_It/vIt/yIt/u8/d8/bIt/xIt/SIt/CIt/wIt/TIt` | 分组视图不可变操作族（克隆/查删改/定位/插入/移动/裁剪/置顶） | 144909–145136 | 120688–121000 | 含 `insertTaskIntoGroup`(o8)、`moveTaskToTopOfView`(TIt)、`areAllGroupsCollapsed`(dIt，语义=全部展开) |
| `Gne/ane` | `DEFAULT_GROUP_ID_CRON` / `DEFAULT_GROUP_ID_OFF_PEAK` | src chunk 8724/8725 | — | 定时/闲时默认组 id |
| `P8` | `resolveGroupTitle` | 154158 | 127422 | 默认组回退名 |
| `EIt/DIt/OIt/kIt/AIt` | 折叠组持久化 `zcode-grouped-task-collapsed-groups` | 145137–145166 | 121001–121020 | 读写 + 清洗 |
| `pzt/mzt` | `GroupedTaskRow`(+memo) | 153636/154014 | 127081/127331 | 分组任务行（拖拽 + 悬停动作） |
| `gzt/N8` | `GroupedTaskRowSlot`(+memo) | 154042/154092 | 127354/127401 | 行插槽 |
| `hzt` | `GroupEmptyDropZone` | 154015 | 127332 | 空组投放区 |
| `_zt` | `NewThreadRow` | 154093 | 127402 | 新线程草稿行 |
| `wzt` | `GroupTaskVirtualList` | 154202 | 127466 | 组内虚拟列表（>80 启用） |
| `Tzt` | `GroupSection` | 154327 | 127546 | 分组节点（色点/重命名/折叠/计数/右键） |
| `Ezt` | `GroupNodeDragOverlayCard` | 154899 | 127898 | 组拖拽浮层卡 |
| `Izt` | `CollapsedGroupStickyHeader` | 155026 | 128002 | 折叠组吸顶头 |
| `Fzt` | `GroupedNodeVirtualList` | 154948 | 127941 | 分组节点虚拟列表 |
| `sBt` | `GroupedTasksSection` | 155455 | 128357 | 分组视图总控（dnd-kit：任务/组拖拽、重命名对话框、FLIP 动画） |
| `yzt` | `virtualScrollTo` | 154168 | 127443 | 虚拟列表滚动（忽略顶部抖动请求） |
| `ezt/tzt/nzt` | `isGroupedViewInitialLoading` / 远端水合判定 / 请求代管理器 | 153085–153126 | 126627–126668 | 首屏态与去抖加载 |
| `qRt/QRt/$Rt` | 分组视图构建 / 乐观叠加合成 | 152903–153084 | 126428–126626 | 结构+索引→视图 |

**列表段**

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `BRt` | `PinnedTasksSection` | 151757 | 125480 | 置顶任务段（本地+远端合并） |
| `HRt` | `TimelineTasksSection` | 152247 | 125894 | 时间线任务段（日期分组 + 分页 + 相对时间） |
| `lLt` | `ArchivedTasksSection`★ | 146823 | 122317 | 归档段（接口级声明，见 §2） |
| `mLt` | `WebRemoteTaskListSection`★ | 147286 | 122680 | Web 远控列表段（F17，接口级声明） |

**页脚**

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `SRt` | `SidebarFooter` | 150435 | 124677 | 头像 + 用户名/plan 徽章 + 菜单（语言/主题/缩放/用量/登录登出） |
| `yRt/bRt/xRt` | 用户名/显示名/首字母助手 | 150426–150432 | 124670–124676 | — |
| `hRt` | `UsageMenuItems` | 150373 | 124636 | 用量菜单项 |
| `gRt` | `UsagePlanBadge` | 150410 | 124662 | plan 徽章 |
| `uRt/dRt/fRt/pRt` | 用量视图模型助手/升级按钮 testid | 150230–150254 | 124505–124526 | — |
| `cRt/lRt` | `WebRemoteControlTrigger` | 150140/150159 | 124420/124436 | Web 远控入口 |
| `sRt` | `resolveRemoteControlStatusDisplay` | 150109 | 124391 | 远控状态文案 |
| `y8` | `useWebRemoteControlEnabled` | 150106 | 124386 | 远控开关 |
| `_Rt/vRt` | `ZOOM_LEVEL_MIN=-3` / `ZOOM_LEVEL_MAX=5` | 150424 | 124668 | 缩放边界 |
| `hLt/gLt/_Lt` | Avatar 原语（F04 数值段，页脚复用） | 147698–147725 | 122830–122848 | — |

**工作区行族**

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `BBt` | `WorkspaceSidebarItem` | 158149 | 131453 | 工作区行：折叠/光束动画/更多菜单/重连/文件树/新线程/任务内列表 |
| `HBt` | `SortableWorkspaceSidebarItem` | 158893 | 131883 | 可拖拽包装（useSortable） |
| `MBt` | `WorkspaceTaskList` | 157550 块内 | 131192 | 工作区内任务列表（重命名/置顶/归档/未读接线） |
| `FBt` | `RemoteConnectionLogsPopover` | 158029 | 131404 | 重连日志弹层（自动滚底） |
| `ABt` | `BeamBorderAnimation`★ | 157550 | 131107 | 光束描边动画（接口级） |
| `TBt/EBt/DBt/OBt/kBt/wBt` | 光束 CSS 生成器★ | 156793–157547 | 130373–131106 | 接口级 |
| `IBt/LBt` | `EMPTY_PINNED_TASKS` / `isUserHomeDirectory` | 158132/158133 | 131438/131439 | — |
| `zBt`(+`RBt`) | `resolveSshConnectionInfo` | 158140(158137) | 131446 | SSH 连接信息（别名/`user@host:port`） |

### 1.2 辅助符号（钩子 / store / 纯函数）

| 混淆名 | 语义名 | js 行 | jsx 行 | 备注 |
|---|---|---|---|---|
| `E6` | `useRemotePinnedTaskListStore` | 142372 | 118266 | zustand，完整还原 |
| `k6` | `useRemoteWorkspaceTaskListStore` | 142464 | 118392 | zustand，完整还原 |
| `T6/O6/sFt/cFt/D6/A6` | store 键/排序/刷新助手（`storeWorkspaceKey`/`sortPinnedTasks`/`sortTasksBy`） | 142360–142580 | 118255–118480 | 完整还原 |
| `UFt/K6/q6/KFt/WFt/GFt` | 侧栏任务偏好 `zcode-sidebar-task-preferences` | 144772–144802 | 120543–120570 | 完整还原 |
| `J6/qFt/Y6/JFt/X6/Z6/YFt/XFt/Q6` | 分段偏好 `zcode-sidebar-purpose-section-preferences` | 144803–144862 | 120576–120635 | 完整还原 |
| `ZFt/QFt` | `partitionWorkspaceTabsByPurpose` | 144863/144866 | 120636/120638 | 完整还原 |
| `PFt/FFt/IFt/LFt/W6` | 展开键集合 / 可见数限制 / 展开标记 | 144342–144363 | 120153–120164 | 接口级声明 |
| `VFt` | `useWorkspaceTaskGroups`★ | 144427 | 120229 | 项目视图数据层，接口级 |
| `DFt/OFt/kFt/AFt/jFt/MFt/NFt` | 乐观叠加合并助手★ | 144184–144341 | 120050–120152 | 接口级声明 |
| `uzt` | `useGroupedTaskView`★ | 153205 | 126735 | 分组视图数据层，接口级（返回 11 字段已全量定型） |
| `M6/N6/V6` | 同步后刷新助手 | 142670–142719 | 119312 | 接口级声明 |
| `Io/Lo/Fo/Mo/No/Po` | `workspaceKey`/`taskEntityKey`/`compareTasksForList`/`taskSessionActivity`/`taskPendingAttention`/`mergeTaskWithActivity` | 跨块（jsx 408/411/405/369/376/385） | 同左 | 横切助手，本文件内实现 |
| `QS/$S` | `resolveTaskIndicator` / `formatRelativeTime` | jsx 33105/33108 | 同左 | 状态点/相对时间 |
| `vg/Vhe/Go` | `taskChangeSummary` / `titleWithChangeStats` / `workspaceBaseName` | jsx 20317/20328/986 | 同左 | 变更统计 |
| `pPt/dPt/uPt/fPt` | 时间线日期分组 | 116989–117060 | 99930–99990 | 完整还原 |
| `b2/x2` | `sessionIndexKey` | 122295 | 103978 | 会话索引键 |
| `R2/U0` | `resolveWorkspaceTabKey` | 123289/121375 | 104991/88177 | 工作区键（两处同构） |
| `qr`（src chunk `Nb` 8464） | `scopedTestId` | src-HCld2afU.js | — | `${base}-${id}` |
| `ZS` | `useTaskListItems`★ | 35727 | 32810 | 接口级声明 |
| `sc/mc/pc/ko/Zs/A2` | 目录可用性/页签/设置/会话注册/会话路由 store 选择器 | 跨块 | — | 接口级声明 |
| `LTt/u2/Iwt/Lwt/Rwt/Wwt/Gwt/Kwt` | 会话打开能力 + 拖拽 MIME/载荷/位置跟踪 | jsx 104823/103642–103717 | 同左 | 接口级声明 |
| `J3/yc` | `useScopedWorkspaceTabs` / `buildWorkspaceServicesMap` | jsx 113936/3637 | 同左 | 接口级声明 |
| `EN` | `SpinnerStatus`（role=status 旋转图标） | 54789 | — | 完整还原 |
| `aw` | `markUsageEntryIntent` | jsx 35396 | 同左 | 接口级声明 |
| `Qie` | `forgetRecentWorkspaces` | jsx 945 | 同左 | 接口级声明 |
| 已在 TopBar.tsx 抽取 | `j6` TaskRenameDialog、`oFt` TaskActionMenuItems、`C6` useTaskFileActions、`w6` buildTaskFeedbackDescription、`Uo` applyOptimisticTaskMutation、`n4/r4` RemoteSync 菜单/对话框、`$2` canOpenRemoteSessionSourceCheck、`QTt` sshDecoratedProjectName、`yC/ls` store | — | — | 本文件仅声明接口引用 |

### 1.3 图标（`Sa` = createLucideIcon；共 **40 个**）

hash(`ov`)、folder(`$_`)、folder-open(`Q_`)、cloud(`U_`)、house(`sv`)、list-tree(`uv`)、
message-circle-plus(`hv`)、search(`Fv`)、calendar-clock(`lye`)、wand-sparkles(`Yv`)、
minimize-2(`Zye`)、maximize-2(`mv`)、list-filter(`Wye`)、clock-3(`B_`)、
message-circle-check(`Xye`)、archive(`x_`)、x(`g`，imeComposition chunk)、cloud-upload(`H_`)、
pin(`Ov`)、smartphone(`Vv`)、clock(`V_`)、moon(`xv`)、loader(`fv`)、
triangle-alert(`p`，imeComposition chunk)、refresh-cw(`Nv`)、check(`M_`)、copy(`W_`)、
ellipsis(`K_`)、settings(`Rv`)、globe(`nv`)、palette(`wv`)、maximize(`Jye`)、
log-in(`pv`)、log-out(`Kye`)、user(`Pbe`)、settings-2(`Lv`)、grip-vertical(`iv`)、
arrow-up-to-line(`nye`)、zoom-in(`xa`)、zoom-out(`Kre`)、chevron-right(`wa`)，
另 spinner(`M`，imeComposition chunk)。

### 1.4 data-testid 常量（来自 `src-HCld2afU.js` 导出表，值已反查）

`sidebar`(8290)、`workspace-list`(8291)、`workspace-item`(8292)、`workspace-close`(8293)、
`workspace-file-tree-button`(8364)、`project-add`(8296)、`conversation-new-task`(8295)、
`project-section`(8294)、`conversation-section`(8294 附近)、`task-item`(8319)、
`task-archive`(8316)、`task-settings-button`(8322)、`task-list`(8317)、`task-empty`(8320)、
`task-new-button`(8318)、`automations-open`(8420)、`login-trigger`(8222)、
`login-menu-item`(8223)、`logout-button`(8236)、`sidebar-coding-plan-usage-button`(8337)、
`sidebar-coding-plan-upgrade-button`（本 chunk 150254）、`zcode-default-group-cron`(8724)、
`zcode-default-group-off-peak`(8725)；复合 testid 助手 `scopedTestId`（`Nb` 8464）。

---

## 2. 边界判定依据

1. **族范围**：以 MODULE-MAP F01 为准——js 142372–142753（远端任务 store 段）+
   144153–160322（侧栏主体段），根组件 `rVt`（159137）为唯一侧栏入口，被应用壳挂载。
2. **函数体边界**：压缩版每语句一行，每个组件自 `function X(` / `var X = memo(` 起，
   至下一个顶层声明前为止；jsx 版双向核对（如 rVt：js 159137 ↔ jsx 132075）。
3. **闭包追踪**：从 rVt 及各段组件的 JSX 引用出发递归收集局部符号（图标、原语、助手、
   store、testid），直到落到：① 本 chunk 顶层定义（继续追）；② 文件头 import 块的跨
   chunk 别名（记外部依赖，§4）；③ 叶子数据层（接口保留，见下）。
4. **接口级（★）保留清单**（体量大、与侧栏渲染弱耦合的数据层/样式生成层，保留
   props/返回类型 + 行号，未逐行展开 JSX）：
   - `uzt` useGroupedTaskView（153205，依赖 izt/QRt/qRt/szt/rzt/lzt/j8/Cx/ZRt/J3/JS/dx/OFt 等 15+ 跨块助手）
   - `VFt` useWorkspaceTaskGroups（144427）
   - `mRt` useSidebarUsageState（150255）
   - `ABt` BeamBorderAnimation + `TBt…wBt` 光束 CSS 生成器（156793–157547）
   - `lLt` ArchivedTasksSection（146823）、`mLt` WebRemoteTaskListSection（147286，属 F17 边界）
   - 文件树滑层面板（FileTreePanel）、`ZS` useTaskListItems、分组拖拽碰撞助手 `Kzt…Bzt` 部分声明
5. **排除项**：`zZ` 分支 chip 等顶栏族符号（已归 TopBar.tsx）；会话视图/首页组件不在本族。

## 3. 与 zcode-uiux-spec.md 的交叉验证

规格 §4（侧栏）与 §13.8 的每条结构断言都在代码里找到了对应实现：

| 规格断言 | 代码证据（Sidebar.tsx 行） | 结论 |
|---|---|---|
| §13.8 rVt = `aside flex h-full flex-col` | 5612 `<aside data-testid="sidebar" className="flex h-full flex-col overflow-hidden">` | ✅ |
| §13.8 `h-12 drag 条`（顶栏浮层压在其上） | 5614 `<div className="h-12 [app-region:drag]" …/>` | ✅ |
| §4.2/§13.8 导航 4 行 = 新建任务(Ctrl+N)/搜索(Ctrl+K)/自动化/技能，无终端/文件/Git/浏览器 | rVt 导航区：NewTaskRow（Ctrl+N shortcutLabel）+ `commandCenter.open`（Ctrl+K）+ `workspace.openScheduledSettings`（automations-open testid）+ `workspace.openSkillsSettings`；全文件无终端类导航项 | ✅ |
| §4.3/§13.8 分段控件 `分组\|项目`（pill segment）+ 排序/归档图标，**分段行在滚动容器内部** | renderOrganizeByHeader（Tabs pill + list-filter 排序菜单 + archive 归档开关 + 全部展开/收起），渲染位置在滚动容器内（5668 附近，先滚动区后分段行的 DOM 顺序已核对源码 159620） | ✅ |
| §4.4 列表区=唯一滚动容器；项目视图=工作区行+任务行（标题+相对时间/未读点/hover `…`） | WorkspaceSidebarItem/WorkspaceTaskList/TaskRow：`formatRelativeTime`、未读点 `resolveTaskIndicator`、hover 动作按钮 | ✅ |
| §4.4 分组视图=组节点（改色/重命名/取消分组，`taskGroup.*`） | GroupSection/GroupedTasksSection：`taskGroup.rename/color/ungroup/moveToGroup/moveToTop` i18n key 全对上 | ✅ |
| §4.4 任务右键菜单（dzt）：移到分组▸/置顶/重命名/归档/标记未读/文件管理器/复制路径…/打开方式▸ | GroupedTaskContextMenuContent 菜单项与 i18n key 逐条一致 | ✅ |
| §4.4 时间线=相对时间（今天/N天/N分钟） | TimelineTasksSection + `formatRelativeTime` + 日期分组助手 | ✅ |
| §4.5/§13.8 底栏=头像+用户名/plan+菜单（用量、主题 **zai-dark/zai-light**、**界面缩放**、**语言 zh-CN/en-US/系统默认**） | SidebarFooter（6261 起）：语言子菜单（系统默认/英文/中文）、主题子菜单（系统/zai-dark/zai-light，5411 setTheme 白名单）、缩放子菜单（zoom-in/out，ZOOM_LEVEL_MIN=-3/MAX=5）、用量项、登录登出 | ✅ |
| §4.1 品牌区 | 侧栏内仅 h-12 drag 条（品牌/前进后退在顶栏浮层，与 §13.1 一致） | ✅ |

未发现规格需要勘误之处（与 TopBar 不同，§4/§13.8 对侧栏的描述与实现完全吻合）。

## 4. 外部依赖清单（跨 chunk）

共 **11 个外部 chunk** + 1 组本 chunk 内原语块（头注 §二逐符号登记，合计 **400+ 符号**）：

| # | chunk | 提供的符号（原局部名） |
|---|---|---|
| 1 | `react-BQLj9xdT.js` + `jsx-runtime-B5yMD3-t.js` | React（`Q`）、jsx 运行时（`$`） |
| 2 | `utils-CEEH0K_K.js` | `cn()` 类名合并（`Z`） |
| 3 | `button-laUijeDG.js` | `Button`（`X`）、`createLucideIcon`（`Sa`）、cva（`Ca`）、zoom-in/out（`xa/Kre`）、chevron-right（`wa`） |
| 4 | `IntlProvider-C321H7m8.js` | `useIntlContext`（`G`）→ {intl, locale, …} |
| 5 | `imeComposition-DEYFkwWm.js` | `usePlatformService`（`l`）、toast（`m`）、`Input`（`P`）、IME 回车守卫（`A`）、spinner（`M`）、x/triangle-alert 图标、Popover 原语 |
| 6 | `usageStatsUiParts-CiR7YEhh.js` | `Tooltip`（`Ia`）、Popover root/anchor/trigger/content（`Na/Oa/Ma/ka`） |
| 7 | `keyboardShortcuts-BGHopxr9.js` | `shortcutLabel`（`$i`） |
| 8 | `logger-PFDwl5Yq.js` | `logger`（`J`） |
| 9 | `skillStore-BmeKHDBI.js` | zustand `create`（`Ae`）、`useTaskStore`（`xe`）、工作区状态选择器群（`Ne/fe/ee/U…`）、`useSkillsStore` |
| 10 | `src-HCld2afU.js` | testid 常量族（§1.4 全部 23 项）、`DesktopCommand`、环境常量、默认分组 id、`isCronTask/isOffPeakTask`、`scopedTestId`（Nb）、会话/页签/拖拽横切助手（约 400 符号） |
| 11 | `esm-BY6T6pIH.js` | `useVirtualizer`（`to`，@tanstack/virtual 核心） |
| — | 本 chunk 内原语块 | Radix Tabs（`hC/gC/_C` 36949）、DropdownMenu（`VO…JO` 47926）、ContextMenu（`yk…Ck` 43966）、Collapsible（`kZ/AZ/jZ` 82939）、Dialog（`zb…` 31943）、Badge（`uJ` 70704）、Avatar（`hLt…` 147698）、dnd-kit vendored 块（91811–94695）、`react-dom createPortal`（`io`） |

---

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| rVt 骨架（drag 条/导航 4 行/滚动区/分段行位置/页脚挂载/文件树滑层）、SidebarFooter 全部菜单项与子菜单、TaskRow/GroupedTaskRow/WorkspaceSidebarItem 的 JSX 结构、类名、i18n key、testid | **高（逐字转录）** | 直接从压缩源码逐行还原，类名/i18n id/testid 值（经 src-HCld2afU.js 导出表反查）未做改动 |
| 交互语义：拖拽（任务/组/项目行三套 dnd 接线）、右键菜单分派、乐观更新与回滚、未读/状态点、折叠持久化、分段偏好、FLIP 动画触发点 | **高** | 行为由事件处理器直读；中文注释逐条标注；关键回调（如 Dt 远控键上报、handleToggleAllExpanded 三分派）与源码逐句核对 |
| 分组视图不可变操作族（27 个纯函数）、偏好读写、双 store、排序/比较器 | **高** | 纯函数逐字转录，输入输出语义明确 |
| TS props/返回类型（跨 chunk 服务对象：WorkspaceServices/PlatformService/ZCodeTaskServiceLike、dnd-kit 事件、virtualizer 选项） | **中高（推断）** | 由解构默认值与调用面归纳；真实接口可能有细微出入（如 `FileTreeRequest.workspaceName` 在源码侧即允许缺省） |
| 接口级★叶子：useGroupedTaskView/useWorkspaceTaskGroups/useSidebarUsageState/BeamBorderAnimation+CSS 生成器/ArchivedTasksSection/WebRemoteTaskListSection/FileTreePanel/useTaskListItems/部分拖拽碰撞助手 | **中（接口级）** | 保留 props/返回类型 + 行为注释 + 行号，未逐行展开（合计约 3,500 行源码体量，可按需二批抽取） |
| 跨 chunk 符号的 chunk 归属 | **高** | 由文件头 import 块（431–890 行区段）逐个别名核对 |

**把握度分布（按符号计）**：头注 + 尾符号表共登记 **170+ 符号**——
高（逐字转录/直读还原）约 **78%**，中高（类型推断）约 **12%**，中（接口级★）约 **10%**。

## 6. 验证记录

- `web/node_modules/.bin/esbuild Sidebar.tsx --loader:.tsx=tsx --jsx=preserve`：**0 错误**（272.8kb，Done in 19ms）。
- `web/node_modules/.bin/tsc -p /tmp/tsconfig.sidebar.json`（strict、ES2022、jsx preserve、moduleResolution Bundler、typeRoots 指向 `web/node_modules/@types`）：**0 错误**（起始 51 错 → 0 错，全部修复项见 §7 附录）。
- `out/` 目录未做任何修改（`git status` 中保持未跟踪状态）。
- 产物体量：7,204 行（源族约 16,550 行压缩代码；接口级叶子未展开）。

## 7. 后续建议

1. 二批抽取接口级★叶子，优先级：`uzt` useGroupedTaskView（分组数据层，含乐观叠加合成
   izt/QRt/qRt）→ `VFt` useWorkspaceTaskGroups → `ABt/TBt…wBt` 光束动画 → `lLt/mLt` 两个列表段。
2. `dIt`（areAllGroupsCollapsed）源码语义实为「全部展开」（`!t.has(id)` 全称量词），
   在 rVt 中供 `areAllExpanded` 开关使用；本文件按源码行为逐字保留并加注释，
   若上游重构建议同时更名。
3. 本族横切助手（Io/Lo/Fo/QS/$S/vg 等 jsx 33000 区段）与 TopBar 共享，若后续做
   「共享层」模块可统一抽取。

### 附：tsc 51→0 修复项（本次会话内完成）

- 16 个遗漏符号补回：`insertTaskIntoGroup`(o8)、`sortTasksBy`(cFt)、`sessionIndexKey`(b2)、
  `scopedTestId`(Nb/qr)、`virtualScrollTo`(yzt)、`useGroupedTaskView`(uzt★declare)、
  `moveTaskToTopOfView`(TIt)、`isGroupedViewInitialLoading`(ezt)、`GroupNodeDragOverlayCard`(Ezt)、
  `createPortal`(io)、`MemoTaskItem`、`TaskListLoadingRow`(h8)、`resolveWorkspaceTabKey`(R2)、
  `resolveSshConnectionInfo`(zBt+RBt)、`areAllGroupsCollapsed`(dIt)、rVt 内
  `handleOpenAutomations`(fn)/`handleWebRemoteWorkspaceGroupKeysChange`(Dt)、GroupedTasksSection 内 `ungroup`(Ze)。
- 类型修复：3 处 `as unknown as WorkspaceServices | null`；`useRef<HTMLDivElement | null>`；
  `persistCollapsedGroupIds` 参数改为 `((ids)=>Set<string>) | Set<string>`；`new Set<string>()`；
  `event.over` 闭包前提取 `overId`；`workspaceName` 改可选（3 处接口）；`GroupTaskVirtualList`
  Omit 增补 `workspaceLabel`；`SortableWorkspaceSidebarItem` Omit 增补 `onShowMoreTasks`；
  `RemoteTarget` 增补 `username/port/sshConfigAlias`；`virtualScrollTo` instance 参数改 `unknown` 内转型。



