# TopBar 模块抽取报告（顶栏 + 会话头 组件族 · pilot）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/TopBar.tsx`（约 2,080 行）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 规格：`/home/none/grok-build/web/docs/zcode-uiux-spec.md`

---

## 0. 重要勘误：规格行号对应的是 jsx，不是输入 js

任务给定的锚点行号（BOt≈108974、S6≈117848、U6≈119420、TFt≈119988…）**逐条精确命中
`src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`**（pretty-print 版），而非输入的压缩版
`out/renderer/assets/styles-CdEGpc2x.js`。两者是同一 chunk 的两种排版：

| 组件 | 规格行号(=jsx) | jsx 实际 | 输入 js 实际 |
|---|---|---|---|
| BOt | 108974 | 108974 ✅ | 129516 |
| S6 | 117848 | 117848 ✅ | 141854 |
| H6 | 119406 | 119406 ✅ | 143316 |
| U6 | 119420 | 119420 ✅ | 143345 |
| wFt | 119497 | 119493（函数头；119497 在其 props 内）✅ | 143485 |
| TFt | 119988 | 119938（函数头；119988 在其 JSX 内）✅ | 144008 |

因此本报告对每个符号同时给出 **js 行（输入文件）/ jsx 行（规格口径）**。抽取工作以 jsx 阅读、
以 js 复核（双向行号映射已验证一致），未改动 `out/`。

---

## 1. 抽取的组件清单（混淆名 → 语义名 → 行号范围）

### 1.1 核心组件族（完整还原进 TopBar.tsx）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `BOt` | `TopBarOverlay` | 129516–129646 | 108974–109063 | 顶栏浮层：`absolute h-14 left-0 top-0 z-20 w-fit`，左簇 logo/侧栏开关、任务后退前进、新任务 `w-7↔w-0` 动画、更新指示器 |
| `o4` | `TopBarIconButton` | 129479–129506 | 108952–108964 | 顶栏通用图标按钮（Tooltip+快捷键+ghost icon-md+no-drag） |
| `LOt` | `UpdateIndicator` | 129385–129478 | 108869–108951 | 更新指示器：下载中 spin / 就绪绿色胶囊 / 发行说明 popover；`@container/topoverlayer` 容器查询展开 |
| `IOt` | `updatePillResponsiveClasses` | 129354–129384 | 108851–108868 | 更新胶囊展开断点：Mac/Linux 280px、Win 216px |
| `FOt` | `ReleaseNotesPopover` | 129296–129353 | 108831–108850 | 发行说明弹层（标题+日期+markdown 滚动区） |
| `POt` | `UpdateStatusDialogController` | 129125–129295 | 108678–108830 | 更新对话框控制器（下载/取消/跳过/重启安装+活动会话确认） |
| `COt` | `UpdateStatusDialog`（接口保留） | 128795–129046 | 108390–108611 | 更新对话框呈现层（叶子对话框，未逐行展开） |
| `DOt/TOt/EOt/kOt/AOt/jOt/MOt/NOt/OOt` | 更新视图模型/本地化/进度助手 | 129047–129124 | 108612–108680 | `resolveUpdateViewModel` 等 9 个纯函数 |
| `s4/ROt/c4/zOt` | Windows caption 让位常量/助手 | 129507–129515 | 108965–108973 | `env(titlebar-area-*)` 反推 −□× 宽度；`--windows-caption-control-width` |
| `S6` | `WindowsCaptionMenu` | 141854–142058 | 117848–118005 | `w-[45px] border-l` ⌄ 应用菜单（13 项，见 §3 验证） |
| `ZPt` | `useHelpActions` | 141806–141824 | 117792–117814 | 反馈/文档/导出日志（S6、U6 共用） |
| `QPt` | `CAPTION_MENU_ALIGN_OFFSET = -12` | 141825 | 117815 | 菜单 alignOffset |
| `$Pt` | `isAutoUpdateChannelSupported` | 141826–141828 | 117816–117818 | `env === 'production'` 才有检查更新 |
| `eFt/tFt` | 更新菜单项 i18n 选择器 | 141829–141853 | 117819–117847 | 按更新状态切 5 种文案 |
| `YPt/XPt` | 截屏/导出日志助手 | 141785–141805 | 117765–117791 | 导出日志用无限时长 toast |
| `lw` | `PRODUCT_DOCS_URL` | 39410 | 35469 | `https://zcode.z.ai/docs` |
| `H6` | `TerminalToggleButton` | 143316–143344 | 119406–119419 | 终端开关：`$i('J')`=Ctrl+J，激活 `!bg-selected`，testid `terminal-toggle` |
| `U6` | `HelpMenu` | 143345–143417 | 119420–119456 | 帮助菜单 5 项（反馈/建议/社群/文档/日志） |
| `TFt` | `SessionHeader` | 144008–144152 | 119938–120036 | 会话头 `h-12 border-b`，整行 drag，非 Mac 桌面挂 S6 |
| `wFt` | `SessionHeaderLeft` | 143485–144007 | 119493–119937 | 标题 + 路径 pill + 分支 chip + 更多菜单 + 重命名/归档/置顶/未读全套逻辑 |
| `SFt` | `SessionHeaderRight` | 143418–143481 | 119457–119492 | 编辑器组 +（帮助）+ 终端 + 侧面板开关 |
| `xFt` | `OpenInEditorButtonGroup` | 143194–143315 | 119336–119405 | “在 IDE 中打开”分裂按钮 + 编辑器单选菜单 |
| `j6` | `TaskRenameDialog` | 142581–142668 | 118551–118607 | 重命名对话框，IME 组词回车守卫 |
| `oFt` | `TaskActionMenuItems` | 142183–142333 | 118106–118238 | 任务操作菜单项（Item/Separator 注入式，可复用于右键菜单） |
| `C6` | `useTaskFileActions`（接口保留） | 142068–142182 | 118006–118105 | 会话文件/日志/供应商配置 路径+复制+打开 |
| `zZ` | `GitBranchChip` | 96589–97700 左右 | 84085–84267 | 分支 chip：cmdk 分支搜索 + 新建分支 + 图谱 + 提交切换向导 |
| `n4` | `RemoteSyncMenuItems` | 127149–127172 | 107575–107596 | 技能/MCP/插件 远程同步菜单项 |
| `r4` | `RemoteSyncDialogs`（接口保留） | 127248+ | 107623+ | 三个同步对话框 |
| `Flt` | `ConversationSummaryAside` | 99217–99484 | 85723–85903 | 右摘要栏 mini/panel/auto 三态 + ResizeObserver 测宽 |
| `VO/HO/UO/WO/GO/KO/qO/JO/YO/XO` | `DropdownMenu*` 原语族 | 47926–48040 | 43144–43290 | Radix 封装，类名逐字保留 |
| `zb/Hb/Ub/Gb/Wb` | `Dialog*` 原语族 | 31943+ | 29335–29420 | Radix Dialog 封装（j6 用） |

### 1.2 辅助符号（钩子 / store / 纯函数，随闭包一并定位）

| 混淆名 | 语义名 | js 行 | jsx 行 |
|---|---|---|---|
| `yC` | `useFeedbackStore` | 36992 | 33835 |
| `E6` | `usePinnedTaskListStore` | 142372 | 118266 |
| `k6` | `useWorkspaceTaskListStore` | 142464 | 118392 |
| `Ug` | `useMcpStore` | （jsx 21655） | 21655 |
| `ls` | `useTrajectoryViewerStore` | （jsx 1697） | 1697 |
| `xe` | `useTaskStore`（skillStore chunk `h` 导出） | 跨 chunk | — |
| `ZS` | `useTaskListItems` | 35727 | 32810 |
| `U2` | `useConfirmDialog` | 123493 | 105222 |
| `Oc/Ec` | `useWorkspaceServices` / `useBaseServices` | 4945 / 4897 | 3754 / 3716 |
| `Uo` | `applyOptimisticTaskMutation` | 1895 | 959 |
| `w6` | `buildTaskFeedbackDescription` | 142334 | 118239 |
| `ZTt/QTt` | `remoteTargetDisplayLabel` / `sshDecoratedProjectName` | 123239 / 123251 | 104935 / 104947 |
| `$2`(+`CFt`) | `canOpenRemoteSessionSourceCheck` | 127125 (143482) | 107556 (119494) |
| `Zge` | `resolveEffectiveProvider` | （jsx 21359） | 21359 |
| `pct` | `useGitBranchSwitcher` | 96362 | 83842 |
| `MZ` | `resolveBranchDisplayLabel` | 94967 | 82976 |
| `Uct` | `resolveSummaryPanelVariant` | 98016 | 84991 |
| `tlt` | `buildSummaryPanelModel` | 98133 | 85113 |
| `slt/clt` | `EMPTY_BACKGROUND_WORKS/EMPTY_SUBAGENTS` | 98224 | 85193 |
| `mlt/hlt/Clt/Tlt/klt/Alt/Plt` | 摘要栏 6 个分段 + mini 卡（接口保留） | 98354/98453/98727/98778/98871/98933/99109 | 85281/85318/85482/85520/85573/85602/85678 |
| `cj` | `MarkdownRenderer`（memo） | （jsx 46461） | 46461 |

### 1.3 图标（`Sa` = createLucideIcon 工厂；js 26620–27950 / jsx 23223–25478）

arrow-left(`S_`)、arrow-right(`C_`)、message-circle-plus(`hv`)、panel-left-close/open(`Tv/Ev`)、
panel-right-close/open(`ibe/abe`)、square-terminal(`Uv`)、circle-question-mark(`vye`)、
chevron-down(`N_`)、ellipsis(`K_`)、cloud(`U_`)、folder(`$_`)、git-branch(`ev`)、
arrow-down-to-line(`Zve`)、loader(`fv`)、check(`M_`)、message-square(`vv`)、lightbulb(`Uye`)、
users(`Jv`)、book-open(`oye`)、file-archive(`Dye`)、cloud-upload(`H_`)、minimize-2(`Zye`)、
plus(`kv`)、git-graph(`tv`)，另 spinner `loader-circle`(`M`) 来自 imeComposition chunk。
共 **25 个**。

### 1.4 data-testid 常量（来自 `src-HCld2afU.js`，已反查导出表+字符串值）

| 局部名 | 导出 | 值（out/src-HCld2afU.js 行） |
|---|---|---|
| `Jt` | Ha←Rv | `workspace-header`（8361） |
| `xne` | qa←zv | `workspace-title`（8362） |
| `hn` | Ka←Bv | `workspace-path`（8362 附近） |
| `Vt` | Ga←Vv | `workspace-more-button`（8364） |
| `pr` | Ri←Sg | `terminal-toggle`（8237） |
| `tee` | Vn←z_ | `chat-summary-panel`（8308） |
| `$n` | Pi←Y_ | `task-new-button`（8318） |
| `Wn` | Oa←zy | `v4-task-open-in-split`（8416） |

---

## 2. 边界判定依据

1. **函数体边界**：压缩版每语句一行，`function BOt({` 起至下一个顶层声明 `var l4 = (0, Q.memo)(...)`
   （js 129647）前为止；其余组件同理用相邻顶层声明定界（见 §1 行号范围）。
2. **闭包追踪**：从每个锚点组件的 JSX 引用出发，递归收集局部符号（图标、原语、助手函数、
   store、testid），直到全部落到三类终点之一：① 本 chunk 内另一处顶层定义（继续追）；
   ② 文件头 34 行 import 块中的跨 chunk 别名（记为外部依赖，§4）；③ 叶子 UI（对话框/
   分段卡片，接口保留）。
3. **调用方确认**：`TFt` 是会话头唯一入口（被会话视图壳引用，规格 §13.6 的 `149287-149335`
   三分结构在 jsx 149287 处可核对：`section.bg-background` 内 = 头部 + 水平分割），
   `BOt` 被窗口壳在侧栏上方挂载（规格 §13.1）。两者互不嵌套：BOt 是全局浮层，TFt 是会话视图行。
4. **Flt 归属**：`Flt` 在 jsx 85723 定义、`Ilt = memo(Flt)`（jsx 85904）导出，被会话列
   （§13.6 的 `[conversation-column | Dr 右摘要栏]`）引用。虽然它不是“顶栏/会话头”行内组件，
   但规格 §6/§13 明确列入本族，且定位容易，故一并抽取。
5. **排除项**：`EFt`（NewTaskRow，js 144153）紧邻 TFt 之后但属于侧栏/首页任务行 UI；
   `Mr` 首页草稿头（规格 §13.9，jsx 149295 附近）与 `l4`（应用壳 memo 组件）不在本次范围。

## 3. 与 zcode-uiux-spec.md 的交叉验证

规格 §2/§3/§13 的每条结构断言都在代码里找到了对应实现：

| 规格断言 | 代码证据 | 结论 |
|---|---|---|
| §13.1 顶栏是绝对定位浮层 `absolute h-14 left-0 top-0 z-20 w-fit`，侧栏可见时宽 = `var(--workspace-sidebar-panel-width)` | `BOt` return 第一层 div 类名与 style 逐字一致 | ✅ |
| §13.1 左簇仅含 logo（hover 变形侧栏开关）、任务后退/前进、新任务 `w-7↔w-0`、更新指示器；不含面板图标/窗口控制 | `BOt` 左簇 4 段 JSX 与之一致；全文件无终端/浏览器图标出现在 BOt | ✅ |
| §3 logo hover 淡出、面板图标淡入（`group-hover:opacity-*`） | `img … group-hover:opacity-0` + `IconPanelLeft* … group-hover:opacity-100`，150ms | ✅ |
| §3 新任务展开条件 `showNewTaskButton ?? !isSidebarVisible`，300ms 宽度过渡 | `P = v ?? !s`；`transition-[opacity,width] duration-300 ease-out`，`w-7 opacity-100 ↔ w-0 opacity-0 pointer-events-none` | ✅ |
| §13.2 会话头右 = `SFt`（[xFt 编辑器][U6 帮助，Win/Linux 隐藏][H6 终端][侧栏面板开关]）+ `S6` | `TFt`：`hideHelpMenu={isNonMacDesktop}` 传入 SFt；非 Mac 桌面 header 尾部挂 `S6` | ✅ |
| §13.3 S6 = `w-[45px] border-l border-border/50`，菜单 13 项 | 触发器类名逐字一致；菜单项：新建任务(Ctrl+N)/打开工作区(Ctrl+O)/文件管理器\|关于/检查更新/进程监视器\|反馈/建议/社群/文档/导出日志\|[stdio tap+DevTools]\|关闭窗口 | ✅ |
| §13.4 U6 帮助菜单 5 项；H6 终端开关 Ctrl+J、激活 `!bg-selected` | `U6` 恰 5 项（反馈/建议/社群/文档/日志）；`H6` tooltip `shortcut={$i('J')}`、`e && '!bg-selected text-foreground'` | ✅ |
| §13.5 TFt `h-12 border-b`；左 = [面包屑/标题/变更 pill `rounded-full bg-tag/50`/分支 chip/刷新]；非 Mac `pr-[120px]` | header 类名逐字一致；pill 类名含 `rounded-full bg-tag/50`；`isLinuxDesktop && 'pr-[120px]'` | ✅ |
| §6 Flt mini/panel 两态 + `@min-[1136px]` 断点 | 实际为 **mini/panel/auto 三态**（`auto` 用 `@min-[1136px]/conversation:` 容器查询切换），比规格多一档；`--chat-summary-panel-mini-width` 由 ResizeObserver 测量（封顶 320px） | ✅（细化） |
| §2 顶栏整条为拖拽区、按钮 no-drag | `BOt` 外层 `pointer-events-none`，左簇 `pointer-events-auto … [app-region:no-drag]`；TFt 行 `[app-region:drag]`，两簇 `[app-region:no-drag]`；所有顶栏按钮均带 `[app-region:no-drag]` | ✅ |
| §2 Win 用 `env(titlebar-area-*)` 计算 caption 宽度（默认 136px 三键） | `c4(e=136)`：`calc(100vw - env(titlebar-area-x) - env(titlebar-area-width, calc(100vw - 136px)))`，再三等分 | ✅ |
| §2 Mac 全屏/交通灯左留白 ≈96px | `Math.round(a ?? 96)`；全屏变体 `pl-3/pl-5 pt-1` | ✅ |

规格中一处 **待修正**：§13.5 说左簇含“工作区面包屑 j6”。实际 `j6`（jsx 118551）是
**任务重命名对话框**（Dialog + Input + IME 守卫），在 `wFt` 中由“更多菜单→重命名”触发；
左簇的“面包屑”观感来自 `项目名 @ 远程目标` 的 pill（folder/cloud 图标），并无独立面包屑组件。
（规格 §13.2 把 `j6` 标为面包屑系误认，建议下版更正。）

## 4. 外部依赖清单（跨 chunk）

共 **10 个外部 chunk** + 2 个 chunk 内本地原语块：

| # | chunk | 提供的符号（原局部名） |
|---|---|---|
| 1 | `react-BQLj9xdT.js` + `jsx-runtime-B5yMD3-t.js` | React（`Q`）、jsx 运行时（`$`） |
| 2 | `utils-CEEH0K_K.js` | `cn()` 类名合并（`Z`，t 导出） |
| 3 | `button-laUijeDG.js` | `Button`（`X`，t）、`createLucideIcon`（`Sa`，c） |
| 4 | `IntlProvider-C321H7m8.js` | `useIntlContext`（`G`，n）→ {intl, locale} |
| 5 | `imeComposition-DEYFkwWm.js`（共享原语 chunk） | `usePlatformService`（`l`=M）、toast（`m`=_）、`Input`（`P`=y）、IME 回车守卫（`A`=t）、spinner 图标（`M`=w）、Popover 原语（`T/h/x`=n/a/i） |
| 6 | `usageStatsUiParts-CiR7YEhh.js` | `Tooltip`（`Ia`=u）、Popover root/anchor/trigger/content（`Na/Oa/Ma/ka`=p/d/m/f） |
| 7 | `keyboardShortcuts-BGHopxr9.js` | `shortcutLabel`（`$i`=n） |
| 8 | `logger-PFDwl5Yq.js` | `logger`（`J`=t） |
| 9 | `src-HCld2afU.js` | `DesktopCommand` 枚举（`oi`=ft）、环境常量（`hi`=js）、全部 8 个 testid 常量（§1.4） |
| 10 | `skillStore-BmeKHDBI.js` | `useTaskStore`（`xe`=h）、zustand create（`Ae`=q）、`useSkillsStore`（`Ne`=t） |
| — | 本 chunk 内 | Radix DropdownMenu 原语（`aTe…vTe`，jsx 27465）、Dialog 封装（jsx 29335）、cmdk 原语、`cj` Markdown 渲染器（jsx 46461） |

TopBar.tsx 头部注释按“符号 → chunk → 导出字母 → 行号”完整登记了 **60+ 个**外部/内部符号。

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| BOt/o4/S6/H6/U6/TFt/SFt/wFt 的 JSX 结构、类名、i18n key、props 解构 | **高（逐字转录）** | 直接从压缩源码逐行还原，类名/i18n id 未做任何改动 |
| 交互语义（drag/no-drag、宽度动画、disabled、快捷键、乐观更新回滚） | **高** | 行为由类名/事件处理器直读；中文注释逐条标注 |
| TS props 类型 | **中高（推断）** | 由解构默认值与用法推断；跨 chunk 服务对象（如 `PlatformService`）按调用面归纳，可能与真实接口有细微出入 |
| `UpdateStatusDialogController`(POt)/`COt`/`r4`/`zZ` 弹层尾部/`Flt` 分段卡片 | **中（接口级）** | 这些叶子对话框/卡片体量大且与顶栏族弱相关，保留 props 接口 + 行为注释，未逐行展开 JSX（行号已给出，可按需补全） |
| 跨 chunk 符号的 chunk 归属 | **高** | 由文件头 34 行 import 块逐个别名核对 |

## 6. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`：解析通过（0 错误）。
- `tsc --noEmit --strict`（在 `/home/none/grok-build/web` 的 @types/react 环境下）：**0 错误**。
  （产物本体放在 zcode-restored 下，该目录无 node_modules，故验证在临时副本上进行，验证后已清理。）
- `out/` 目录未做任何修改（只读访问）。

## 7. 后续建议

1. 按 §5 中标注“接口级”的叶子（COt 更新对话框、r4 同步对话框、zZ 弹层 cmdk 全量、Flt 六个分段卡片）
   做第二批抽取，方法同本次。
2. 规格 §13.2 中 `j6`=面包屑 的表述建议更正为“任务重命名对话框”。
3. `Flt` 的三态（含 `auto`）建议回写规格 §6（现写“mini/panel 两态”）。
