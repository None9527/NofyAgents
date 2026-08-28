# ExtendedViews 模块抽取报告（扩展视图族 · D8 Stage B3）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**，只读访问）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/ExtendedViews.tsx`（6,754 行，按视图分 6 节）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 地图：`MODULE-MAP.md`（F04/F15/F16 行号包络）；标样：`TopBar.tsx` / `TopBar.report.md`
- 衔接：本文件全量展开 `SidePanel.tsx` §15 与 `Settings.tsx` 中以接口保留的叶子视图（接口声明签名已对齐；`AutomationsMain.onOpenSession` 按真实调用面修正为对象参数 `{sessionId, workspacePath, workspaceIdentity?}`）

**行号口径**：所有范围以输入 `.js` 为准（闭区间），每个符号附 `.jsx` 对照行号（逐符号双向核对：`function X(` 在两个文件各自定位后抽查类名/i18n key 一致）。

---

## 1. 视图清单（混淆名 → 语义名 → 行号 → 入口）

### 1.1 六个根视图（全量逐字转录）

| 混淆名 | 语义名 | js 行 | jsx 行 | 入口（挂载点） |
|---|---|---|---|---|
| `l3` | `RepoWikiView` | 132306–133070 | 111550–112121 | 侧面板 `repo-wiki` 标签（`xqt` 的 F04 分派）/ 主视图分支（spec §13.6）；props: workspacePath/workspaceIdentity/workspaceTabs/onOpenCodeViewer/onBack |
| `AGt` | `TreemappingView` | 179493–179671 | 145507–145569 | 侧面板 treemapping 标签；props: activeTaskId/workspacePath/workspaceIdentity/source(`{kind:'current'}` 或 `{kind, turnIndex}`) |
| `FGt` | `WhiteboardCanvas` | 179888–180192 | 145638–145797 | 侧面板白板标签（`onOpenWhiteboard` 接线）；props: workspacePath/workspaceIdentity/boardId |
| `tKt` | `ModelTrajectoryView` | 180606–180751 | 146115–146204 | 侧面板模型轨迹标签（`ls` TrajectoryViewerStore 请求驱动）；props: taskId/title/workspacePath/workspaceIdentity/onClose |
| `mKt` | `DeveloperToolsView` | 180870–181215 | 146290–146387 | 侧面板开发者工具标签；props: workspacePath/workspaceIdentity/taskId |
| `d6` | `AutomationsMain`（视图态） | 138823–139924 | 115911–116693 | `j9` 设置壳 `automations` 分区渲染分支（Settings.tsx 5386 处）+ 意图深链（`openAutomationId`）；props: workspacePath/workspaceIdentity/onCreateViaChat/openAutomationId/onOpenAutomationConsumed/onOpenSession |

### 1.2 随族展开的次级组件（全量转录）

| 节 | 混淆名 → 语义名 | js 行 | jsx 行 |
|---|---|---|---|
| §1 Wiki | `RAt` WikiProjectCard / `zAt` WikiPageRenderer（分帧渲染）/ `BAt` CollapsiblePanelShell / `VAt` WikiProjectList / `HAt` WikiGenerateEmptyState / `UAt` WikiPagePendingCard / `WAt` WikiTaskProgress / `bAt`+`xAt` WikiCatalogTree(+节点) / `s3` RepoWikiLogoIcon（自定义 SVG）/ `u3`+`d3` 元数据行 | 133071–133692、132042–132286 | 112122–112421、111381–111529 |
| §1 Wiki 纯函数 | 目录树构造 `SAt/CAt/wAt/TAt/EAt/DAt/OAt`、项目选择 `kAt/AAt`、状态助手 `f3/YAt/XAt/ZAt/p3/QAt/$At/ejt/tjt/m3`、Markdown 分帧 `njt/rjt/ijt/ajt/ojt/sjt/cjt`、生成表单 `h3/ljt/ujt/djt/fjt/pjt/mjt/hjt/gjt/g3/_jt/vjt/yjt/bjt`、杂项 `_3/xjt/Sjt/Cjt/wjt/v3/Tjt/Ejt/Djt/Ojt/kjt/Ajt/jjt/GAt`、合并 `KAt/qAt/JAt`、常量 `c3/jAt/MAt/NAt/PAt/FAt/IAt/LAt`（=0/5/10s/8k/12k/2/560px/不锁模型） | 132192–132305、133693–134110 | 111458–111550、112421+ |
| §2 树图 | `M5` TreemapStatCard / `N5` DiffCountBadge / `jGt` TreemapEmptyState / `MGt` TreemapDirectoryNode / `NGt` TreemapFileNode；事件采集 `rGt/aGt/iGt/oGt/ZWt/QWt/$Wt/eGt/nGt/tGt/sGt/lGt`；树构造 `uGt/xGt/SGt/O5/CGt/wGt/TGt/k5/A5/EGt/DGt/OGt/j5/kGt/gGt/_Gt/vGt/yGt/bGt`；基座 `b5/x5/S5/VWt/C5/HWt/w5/UWt/WWt/GWt/T5/KWt/qWt/JWt/YWt/XWt`；常量 `dGt/E5/D5/fGt/pGt/mGt/hGt`（=6/14/'.'/64/34/52/24） | 178920–179887 | 145022–145637 |
| §3 白板 | 色板 `PGt`（6 色）；画布逻辑（指针捕获/坐标归一/草稿笔画/重绘）全部内联于 `FGt` | 179886–180192 | 145637–145797 |
| §4 轨迹 | `RGt` useModelTrajectory（代际防竞态）/ `P5` TrajectoryPartRenderer / `zGt/BGt/VGt/HGt/UGt/F5` 折叠/徽章/pre/用量/状态 / `WGt/GGt` 汇总/序列化 / `KGt/qGt/JGt/YGt/XGt/ZGt/QGt/$Gt/eKt` 记录卡族 / `nKt/rKt/iKt/aKt/oKt` 目录解析/列表/输入去重 | 180193–180800 | 145798–146240 |
| §5 开发工具 | `sKt/cKt` 空常量、`I5/lKt/uKt/dKt` 格式化、`fKt` 状态 label、`pKt` NetworkHeadersDetails | 180802–180869 | 146243–146289 |
| §6 自动化 | `ANt` AutomationSchedulePill / `ZNt` AutomationCardMenu / `L3` AutomationCreateSplitButton / `INt` OffPeakCreateButton / `tMt` KeepAwakeBanner / `Gjt` SwitchToggle / `uMt`+`Njt` 模板图标 / `lMt`(6 项)+`Mjt`(4 项) 图标映射 / `Pjt`(3) `LNt`(4) 模板表 / `BNt/VNt/HNt` 标签决策 / `UNt` 生命周期呈现 / `WNt/GNt/KNt/qht/Kht` 生命周期档位 / `u6/qNt/JNt/YNt/XNt` 错误与深链 / `MNt/NNt/PNt/FNt` 遥测 / `Vjt/Hjt/Ujt/Wjt` 闲时遥测 / `Ijt/Ljt` 可用性 / `Tit/Eit/Dit` coding-plan 判定 / `AMt` 模型分组 / `rgt/egt` 频率文案 / `H3/c6/l6/Fjt/jNt` 常量 / 图标包装族 `E3+D3/Kjt/O3/qjt/k3/A3/Jjt/Yjt/j3/Xjt/M3/N3/P3/Zjt/F3/sMt` / `EN` LoadingSpinner(js 54789) | 134385–134679、135261、138513–138822、133984–134010、109243–109250+109499–109525、91347–91366、54789 | 113296–113575、113750、115689–115876、112743–112778、93276–93279+93576–93602、78933–78941 |

### 1.3 接口保留的叶子（未逐行展开，声明了完整 props）

| 混淆名 | 语义 | js 行 | 原因 |
|---|---|---|---|
| `kNt` | AutomationEditor（自动化编辑器） | 137005–138822 | ~1,820 行编辑器表单，属下一批（d6 视图态按任务要求只解到编辑器入口） |
| `YMt` | OffPeakTaskEditor（闲时任务编辑器） | F15 闲时段 | 同上 |
| `cMt` | OffPeakTaskList（闲时任务列表） | 134679–134923 | 列表卡片群（含 `sMt` 徽章接线），与编辑器同批 |
| `T3` | AutomationsStore | 134111–137004 | ~2,900 行 zustand store，声明全动作接口（18 个动作 + 6 个字段） |
| `bX` | OffPeakTaskStore | 91368–91590 | 同上（19 个动作 + 8 个字段） |
| `Oe` | WhiteboardStore（skillStore chunk o 导出） | 跨 chunk | 声明 5 动作 + `workspaces[].boardsById` 状态 |
| `vq` | ModelSelector（F08 js 75527） | 75527+ | Composer 族资产 |
| `JM/qq/sX/fX` | 设置快照/模型注册表/权益/升级钩子 | 53440/78195/88255/89052 | F06/F12 接线 |
| `og/_g` | 工具族分类/文件变更提取 | 23084/23638 | 横切工具层 |
| `_w/mw/k0/u1` | 会话快照客户端/传输/钩子/行提取 | 40286/39534/118675/110158 | 会话运行时 |
| `Q$/Xht` | cron/调度规则文案（编辑器域） | 109xxx | `rgt` 经声明接口调用 |

---

## 2. 边界判定与闭包追踪

1. **顶层声明定界**：每个根视图自 `function X({` 起，至下一顶层声明前止（`l3`→`RAt`@133071；`AGt`→`M5`@179672；`FGt`→`IGt`@180193；`tKt`→`nKt`@180752；`mKt`→`hKt`@181216；`d6`→`QNt`@139925）。
2. **闭包追踪**：从各根视图 JSX 引用出发递归收集局部符号，终点三类：① 本 chunk 另一顶层定义（继续追，如 `l3`→`vq`→F08、`d6`→`T3`→store 层）；② 文件头 import 块 336–966 的跨 chunk 别名（登记为外部依赖）；③ 叶子（接口保留）。
3. **跨 chunk 归属反查**（导入字母 → chunk → 字符串值）：
   - 白板六件 `Te/Oe/ke/ve/_e/ye` + `fe/xe` = skillStore-BmeKHDBI.js 的 `l/o/p/d/c/f/U/h` 导出；
   - `ene/Ti/q/Zn/ri/xw/vee` + 全部 testid = src-HCld2afU.js（`n/to/mo/P/et/Z` 导出）；
   - `M/N/p/g` 图标与 spinner = imeComposition-DEYFkwWm.js（`w/x/T/b` 导出）；`wa` chevron-right = button-laUijeDG.js（`o` 导出）。
   - **9 个 testid 常量已反查到字符串值**：`on`=offpeak-tab、`jr`=automations-list、`Bte`=automation-card、`Mte`=offpeak-create-button、`Nte`=automation-create-manually、`Fn`=automation-create-menu、`at`=automation-card-menu、`Xn`=automation-action-toggle、`Et`=automation-action-delete（src-HCld2afU.js 8423–8440）。
4. **与 SettingsPanels 的冲突处理**：`Settings.tsx` 已将 `d6` 声明为接口并在分区分支渲染；本文件只解 `d6` 的**视图态**（列表态全量 + 状态机 + 全部回调），编辑器 `kNt`/`YMt` 保持接口，不与设置分区视图重叠。

## 3. 交叉验证

| 证据 | 代码落点 | 结论 |
|---|---|---|
| feature-inventory：Treemapping = 每轮文件活动树（读/写/查看/删除） | `AGt` 的 `treemapping.change.{written/modified/deleted/viewed}`、live/snapshot 徽章、末轮提取 `lGt` | ✅ |
| MODULE-MAP F16：`repoWiki.*` 49 处（132390–182909） | `l3` 族内 34 个 `repoWiki.*` key（title/back/delete/regenerate/meta.*/phase.*/status*/pagePending*…） | ✅ |
| MODULE-MAP F04：`whiteboard.*` 画布部分（180132–181600） | `FGt` 的 12 个 `whiteboard.*` key（tool.pen/eraser、color、strokeWidth、undo/redo/clear、addToChat、canvasLabel、missing、nameLabel） | ✅ |
| MODULE-MAP F04：`modelTrajectory.*`/`developerTools.*`（179530–182910） | `tKt` 25 个 `modelTrajectory.*` key（source.main/subagent/compact/sidecar…role.*）；`mKt` 的 `developerTools.*` + `tokenDebug.*` 双前缀 | ✅ |
| MODULE-MAP F15：`automations.*` 133 处、`offPeak.*` 72 处 | `d6` 视图态含 `automations.*` 28 个、`offPeak.*` 21 个、`settings.automations.*` 2 个 key | ✅ |
| spec §13.6 main 分支（repo-wiki / automations） | `l3`/`d6` 即该两分支的实现（MODULE-MAP 已登记锚点） | ✅ |
| 白板 16:10 画布 + 6 色板 + 橡皮 3× 宽 | `aspect-[16/10]`、`PGt` 6 色、`Math.max(14, v*3)` | ✅ 逐字 |
| 轨迹输入去重（会话型记录按上轮消息数切片、去 assistant） | `iKt/aKt/oKt` 与转录一致 | ✅ 逐字 |

## 4. 外部依赖清单（跨 chunk）

| # | chunk | 符号（原局部名） |
|---|---|---|
| 1 | react / jsx-runtime | React（Q）、jsx（$） |
| 2 | utils-CEEH0K_K.js | `cn()`（Z） |
| 3 | button-laUijeDG.js | Button（X）、createLucideIcon（Sa）、chevron-right（wa=o） |
| 4 | IntlProvider-C321H7m8.js | useIntlContext（G）→ {intl, locale} |
| 5 | imeComposition-DEYFkwWm.js | usePlatformService（l）、toast（m）、Input（P）、spinner（M=w）、x（g=b）、alert-triangle（N=x）、moon（p=T） |
| 6 | usageStatsUiParts-CiR7YEhh.js | Tooltip（Ia）、Popover 原语（Na/Oa/Ma/ka） |
| 7 | logger-PFDwl5Yq.js | logger（J） |
| 8 | skillStore-BmeKHDBI.js | useTaskStore（xe=h）、白板 store（Oe=o）、drawWhiteboard（ke=p）、createStroke（ve=d）、默认色（_e=c）、addToChat（ye=f）、whiteboardWorkspaceKey（Te=l）、selectProviderConfigState（fe=U）、selectSessionByTask（H=F）、zustand create（Ae=q） |
| 9 | src-HCld2afU.js | testid ×9（§2.3）、providerIds（q=mo）、repoWikiWorkspaceKey（ene=n）、automationsWorkspaceKey（Ti=to）、parseModelString（Zn=P）、isCreateLimitError（ri=et）、reportTelemetry（xw）、OFFPEAK_TELEMETRY_DEFAULT_PROVIDER（vee=Z） |
| — | 本 chunk 原语 | Select（iO…cO 46009）、Checkbox（DC 37297）、AlertDialog（$4…a3 131966–132040）、DropdownMenu（VO… 47926）、Collapsible（kZ/AZ/jZ 94925）、Badge（uJ 80303）、ScrollArea（Y3 136026）、PanelGroup/Panel/Handle（X4/Z4/Q4 131934–131944）、MarkdownRenderer（cj）、zc/Vc/Bc/Go/Ko/sae/Mg/co/Ao/lo/JM/qq/sX/fX/FM/LM |

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| 六根视图 + 全部次级组件的 JSX 结构、类名、i18n key、props 解构、状态机分支 | **高（逐字转录）** | 直接从压缩源码逐行还原；`@container/repo-wiki` 容器查询、`auto-rows-[132px]` 网格、`[&::-webkit-details-marker]:hidden` 等细节均逐字保留 |
| 纯函数族（目录树构造/事件采集/分帧渲染/遥测字段/生命周期档位） | **高（逐字转录）** | 逻辑分支一对一翻译，常量值全部回代（如 `Jht=720*60*60*1e3`、`IAt=560`） |
| TS props/状态类型 | **中高（推断）** | 由解构默认值与调用面归纳；跨 chunk 服务接口（RepoWikiService/ZCodeAgentService 等）可能与真实签名有细微出入 |
| `d6` 视图态内 22 个回调的语义（立即运行/去重/确认删除/遥测上报时序） | **高** | 事件处理器直读；中文日志文案（`[automations] 立即运行交互开始` 等）原样保留 |
| 接口保留叶子（kNt/YMt/cMt/T3/bX/Oe/vq/JM 族） | **接口级** | 行号与 props 已登记，可按下批同法展开 |
| 一处主动修正 | — | `collectTreemapEvents` 保持原码“写入事件只求值一次”语义（原 `e=rGt(...)` 后三次引用 `e.length`） |

## 6. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`：**0 错**（198.3 kB 输出）。
- `tsc --noEmit --strict --noUnusedLocals --noUnusedParameters`（/home/none/grok-build/web 的 @types/react 18 环境，tsconfig 与 TopBar 验证同参）：**0 错**。验证在 /tmp/ev-check 临时副本进行，验证后保留副本供复核。
- `out/` 目录未做任何修改（全程只读）。

## 7. 后续建议

1. 下一批展开 `kNt`（自动化编辑器，含 cron 构造器 `Q$/Xht/e1/agt` 域）+ `YMt`/`cMt` 闲时编辑/列表，与 `T3`/`bX` 两 store 一并抽取（F15 收尾）。
2. `SidePanel.tsx` §15 的 5 条接口声明可在装配时改为本文件的具名导出（`RepoWikiView/TreemappingView/WhiteboardCanvas/ModelTrajectoryView/DeveloperToolsView`），注意 `RepoWikiView` 实际 props 比 SidePanel 声明多 `workspaceTabs/onBack` 两项。
3. `Settings.tsx` 的 `AutomationsMain` 声明中 `onOpenSession?: (sessionId: string) => void` 与真实调用面（对象参数）不符，建议下轮同步修正。
