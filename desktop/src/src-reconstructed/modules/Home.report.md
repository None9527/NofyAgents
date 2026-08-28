# Home 模块抽取报告（Home 族 · 草稿态首页组件族 · D8 Stage B / F02）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/Home.tsx`（3,517 行）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 规格：`/home/none/grok-build/web/docs/zcode-uiux-spec.md`（§5 Home 视图）
- 地图：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/MODULE-MAP.md`（F02）

---

## 0. 行号口径与结构结论

行号同 TopBar 试点：每个符号给出 **js 行（输入文件）/ jsx 行（规格口径）**，双向核对一致。
任务给定的根 hit ≈ js 90180 **精确命中**（`function hit({` 在 90180，`var git = (0, Q.memo)(hit)` 在 91174）。

**结构结论（与地图一致并实地验证）**：ZCode 的 Home 不是独立路由视图，而是会话面板
`R0`（F03，js 119219）的 `draftMode` 形态。draft 态装配现场（R0 内，js 121025–121258）：

| 部位 | 组件 | 装配证据（js 行） |
|---|---|---|
| composer 卡 | `git`(=memo(hit))，`draftMode/centered/contextHeader` 传入 | 121025–121073（key=`conversation-composer`） |
| 问候 hero | `Sit` 作为消息列表 `zbt` 的 `emptyState` | 121248–121254（`centerEmptyStateWithDock: ar`） |
| banner+建议卡 | `kit`，条件 `draftMode && !workspaceIdentity && !remoteSessionId` | 121125 |
| workspace 行 | `a4` + `zZ` 分支 chip 由窗口壳 `yJt` 组装为 `contextHeader` 注入 composer 卡顶部 | 184540–184577（`yr` useMemo） |
| 提及菜单 | 在 composer 输入区（`ZV`，F08）内，`@`/`#`/`$` 触发 `KJe`，`/` 触发 `SJe`，面板均为 `SV` | 65195 / 66035 |

---

## 1. 抽取的组件清单（混淆名 → 语义名 → 行号范围）

### 1.1 完整还原（逐字转录进 Home.tsx）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `hit` | `DraftComposerRegion` | 90180–91174 | 78144–78828 | **composer 卡本体**（草稿/会话双态）：输入面双层卡、附件 chip 群、上传进度环、队列确认对话框、草稿持久化（350ms 防抖+pagehide/blur 落盘）、自动聚焦策略、发送流水线（遥测/提示词历史/队列确认/回滚） |
| `git` | `DraftComposerRegionMemo` | 91174 | 78829 | `memo(hit)`，R0 的挂载名 |
| `dit` | `applyExternalTextInsertRequest` | 90132–90149 | 78112–78121 | 外部插入（提及优先 `setMention`，否则 `setText`） |
| `fit` | `applyComposerRestoreRequest` | 90150–90175 | 78122–78135 | composer 恢复（会话/工作区匹配且当前无内容才恢复） |
| `pit` | `areStringArraysEqual` | 90176–90177 | 78136–78138 | 提示词历史相等判定 |
| `mit` | `formatLineCount` | 90178–90181 | 78139–78143 | 剪贴板文本附件行数本地化 |
| `_it` | `isEventInsideDialog` | 91176–91181 | 78830–78836 | Escape 守卫（R0 js 120831 消费） |
| `vit` | `GREETING_HOUR_BOUNDARIES` | 91182 | 78837 | `[5,9,12,14,18,23]` |
| `gX/_X` | `GREETING_MIN/MAX_FONT_SIZE_PX` | 91183–91184 | 78838–78839 | 20 / 30 |
| `yit` | `resolveGreetingI18nId` | 91185–91201 | 78840–78843 | 按时段 6 档选 `chat.empty.greeting.*` |
| `bit` | `msUntilNextGreetingBoundary` | 91202–91211 | 78844–78853 | 问候语定时刷新 |
| `xit` | `fitGreetingFontSize` | 91212–91218 | 78854–78860 | 20–30px 自适应（远控恒 20） |
| `Sit` | `GreetingHero` | 91219–91321 | 78861–78921 | **问候 hero**：线框底图+渐隐遮罩+字号自适应（隐藏 30px 测量副本+ResizeObserver） |
| `Cit` | `HomeHeroLogo` | 91322–91336 | 78922–78926 | **hero 品牌线框 SVG**（400×320，path 逐字转录） |
| `vX` | `toErrorMessage` | 91337–91339 | 78927–78929 | |
| `wit` | `hasCodingPlanProviderEntry` | 91340–91347 | 78930–78932 | |
| `Tit` | `isCodingPlanConnectionSelected` | 91348–91354 | 78933–78937 | |
| `Eit` | `isQuota3103Error` | 91355–91357 | 78938–78940 | |
| `Dit` | `resolveOffPeakErrorI18nId` | 91358–91365 | 78941–78944 | |
| `bX` | `useOffPeakTaskStore` | 91368–91589 | 78945–79214 | off-peak zustand store（初始化单飞/横幅关闭位/建议卡 pendingCreateDraft 投递/任务 CRUD） |
| `Oit` | `OFF_PEAK_HOME_TEMPLATES` | 91590 | 79215 | 3 张建议卡模板 id |
| `kit` | `OffPeakNewTaskBanner` | 91591–91751 | 79222–79377 | **banner 行（📢 可关）+ 建议卡 3 张**（`grid sm:grid-cols-3`，moon 图标+标题+描述，`rounded-2xl border border-card-border`） |
| `mOt/hOt/gOt/_Ot` | 家目录感知显示名 4 件 | 128526–128545 | 108386–108400 | 家目录本身→「主目录」标签 |
| `vOt` | `isSameWorkspaceTab` | 128546–128548 | 108401–108403 | 按作用域 key（`Ti`） |
| `yOt` | `remoteTabSearchHaystack` | 128549–128553 | 108404–108406 | |
| `bOt` | `filterWorkspaceTabsForMenu` | 128554–128567 | 108407–108414 | 搜索+前 5 条 |
| `a4` | `WorkspaceSelectionRow` | 128568–128776 | 108415–108560 | **workspace 行**：胶囊触发器（悬停显形分离钮）+⌄菜单（最近项目搜索/打开文件夹/远程连接/不选项目）+远程向导挂载 |
| `UTt` | `useRemoteWorkspaceEnabled` | 123177–123179 | — | 恒 `true` |
| `N2` | `isRemoteWorkspaceTab` | 123199–123201 | — | |
| `mC` | `mentionTriggerChar` | 36348–36358 | 33369–33379 | **提及域→触发符**：commands `>`、conversations `#`、files `@`（spec §5 所引） |
| `Pqe/Fqe/Iqe/tV` | 提及触发检测 4 件 | 64024–64029, 64061–64064 | — | `/(^|\s)([/@$#¥￥])([^\s/@$#¥￥]*)$/`；¥/￥→$ 归一 |
| `SV` | `SuggestionPanel` | 64639–64775 | 57678–57790 | **提及/斜杠面板可见层**：`rounded-2xl border bg-menu`，@tanstack/virtual 虚拟滚动（行高 34/28/40），边缘渐隐遮罩，`data-trigger` 写触发符 |
| `_Je/vJe/yJe` | 段头/状态/选项行 | 64776–64865 | — | testid `prompt-suggestion-section/-status/-option` |
| 面板助手 | `_V/vV/yV/bV/xV/pJe/mJe/hJe/gJe` | 64594–64637 | — | 行高常量、滚动边缘、扁平行 |
| `EN` | `Spinner` | 54789–54797 | 49174–49180 | loader+`animate-spin` 包装 |

### 1.2 接口保留（行号登记，未逐行展开；属其他族或体量大）

| 混淆名 | 语义名 | js 行 | 归属 |
|---|---|---|---|
| `ZV` | ComposerInput（Lexical 富文本输入） | 66959–~69297 | F08 根组件 |
| `KJe` | MentionSelector（@→files/plugins、#→sessions、$→skills 接线；段钩子 `AJe/WJe/HJe/PJe/Nqe`） | 65605–66035 | F08 |
| `SJe` | SlashPanel（/→commands/skills/subagents；段构造 `bJe` 64867） | 65002–65195 | F08 |
| `ait/Zrt/iZe` | 配置工具条/模式工具条/后台工作胶囊 | 89455 / 89295 / 69225 | F08/F12 |
| `TH/lit/JH/uit` | 代码评论/网页元素/PPTX 引用/会话选择 chip 行 | 68250 / 89941 / 68988 / 90039 | F08 |
| `vN/yN/bN/xN/SN/DN` | 附件列表/卡/图标/名称/删除钮/预览对话框 | 54555–54830 | F08 |
| `vWe` | ChatErrorBanner | 54257 | F08/横切 |
| `mXe/XV/ZXe/QXe/YH/tZe/JXe` | 白板附件作用域/拖拽检测/网页元素/PPTX/代码评论钩子群 | 67631 / 66780 / 68894 / 68946 / 69160 / 69176 / 68812 | F08 |
| `hH/nXe/gH/cH/sH/JJe/lH/iXe` | 草稿持久化/提示词历史/聚焦策略/草稿搬运（键 `zcode-v4-composer-drafts:v1:`，上限 50 scope/30 条历史） | 67451–67560, 66064 | F08 |
| `fOt`(`pOt`) | RemoteWizardDialog | 128093–128525 | F10 |
| `zZ` | GitBranchChip（contextHeader 右件） | ~96589 | TopBar 族（已还原） |
| `R0` | ConversationPane（draft 态装配现场） | 119219–121283 | F03 |
| `yJt` | WorkspaceShell（contextHeader 组装 `yr`） | 183896–185431（组装 184540–184577） | F07 |
| `Dqe/kqe/jqe/ZB` | 官方插件技能文案数据（见 §3.6 勘误） | 63845–63995 | F08 |

### 1.3 图标（`Sa`=createLucideIcon，js 行）

arrow-up(`T_` 26663 发送)、square(`Wv` 27823 停止)、megaphone(`Yye` 27358 横幅)、
moon(`xv` 27468 建议卡)、rotate-ccw(`gbe` 27705 重试)、clipboard-pen-line(`xye` 26884)、
house(`sv` 27214 家目录)、folder(`$_` 27133)、cloud(`U_` 26918 远程)、
folder-plus(`Nye` 27112 打开文件夹)、message-circle(`gv` 27390 不选项目)、
search(`Fv` 27732)、chevron-down(`N_` 26802)、loader(`fv` 27315)、
info(`p`，imeComposition chunk `Ht` 导出 11781)、close-x(`g`，imeComposition `b` 导出)。
共 **16 个**。

### 1.4 data-testid 常量（来自 `src-HCld2afU.js`，已反查导出表+字符串值）

| 局部名 | 值 | 局部名 | 值 |
|---|---|---|---|
| `Ht` | `v4-composer` | `Yee` | `v4-paused-queue-send-dialog` |
| `St` | `chat-attachment-menu-item` | `Sne` | `v4-composer-clear-queue-send` |
| `At` | `chat-attachment-button` | `pee` | `v4-composer-keep-queue-send` |
| `Ot` | `v4-stop` | `Br` | `v4-attachment-upload-progress` |
| `see` | `v4-composer-send` | `Yt` | `v4-attachment-upload-retry` |
| `un` | `v4-composer-input` | `ct` | `v4-attachment` |
| `Ut` | `composer-project-detach` | `Cne` | `composer-workspace-trigger` |
| `_n` | `composer-remote-connection` | `dn` | `composer-work-outside-project` |
| `qr` | testid 拼接 `${base}-${suffix}`（`Nb` 8464） | — | 面板系：`prompt-suggestion-panel/-section/-option/-status`（src 8313–8316） |

---

## 2. 边界判定依据

1. **函数体边界**：同 TopBar 试点——压缩版每语句一行，`function hit({` 起至
   `var git = (0, Q.memo)(hit)`（js 91174）止；`kit` 至 `function Ait`（91755）前；
   `a4` 至 `function xOt`（128777）前；`SV` 至 `function _Je`（64776）前。
2. **闭包追踪**：从 `hit/Sit/kit/a4/SV` 的 JSX 引用递归收集局部符号，终点三类：
   ① 本 chunk 顶层定义（追到底或登记行号）；② 文件头 336–995 import 块的跨 chunk
   别名（§4）；③ 叶子组件（接口保留，§1.2）。`hit` 的 ~40 个闭包依赖全部定位
   （含 `oit` 89931、`ZYe` 67422、`Aj=zcode:add-workspace-file-to-chat` 52163、
   `nH` 67377、`zc` 5150、`Go` 1928、`Ti`=src chunk `to` 导出 等）。
3. **调用方确认**：`git` 的唯一消费方是 `R0`（121025）；`Sit` 仅被 `R0` 的
   emptyState（121253）引用；`kit` 仅被 `R0`（121125）引用；`a4` 有 3 处消费
   （`yJt` 184544 contextHeader、off-peak 表单 135911、自动化编辑器 138135）；
   `SV` 被 `SJe`（65195）与 `KJe`（66035）消费。
4. **归属裁量**：`bX` store 与 `kit` 在地图记账上属 F15（91367–91810），但地图
   F02 覆盖功能明确含「off-peak 横幅入口」，且本任务指明抽 banner/建议卡，故随
   Home 族完整抽取（`Ait/jit` 面板头 91755–91801 不属 draft 态，未抽）。
   `mC`（36348）与 `Lje` 最近提及 chips（36369）在 F05 QuickPick 段内，但 `mC`
   是 spec §5 点名的 @#> 映射本体且仅 11 行，故随族抽取。
5. **排除项**：`xOt` Checkbox（128777，通用原语）、`SOt` 图标 URL（128793）、
   `COt` 更新窗（TopBar 族已抽）、`Mit` 合并 refs（91802，dnd-kit 前缘）。

---

## 3. 与 zcode-uiux-spec.md §5 的交叉验证

| 规格断言（§5） | 代码证据 | 结论 |
|---|---|---|
| hero：品牌线框 logo 居中大图 | `Sit` 内 `Cit` SVG：`absolute left-1/2 top-1/2 aspect-[5/4] w-[min(72vw,25rem)]`，向下渐隐遮罩、`opacity-70` | ✅ |
| 问候语按时间段（`greeting*`） | `yit` 6 档：`chat.empty.greeting.{morningEarly(5-9),morning(9-12),noon(12-14),afternoon(14-18),evening(18-23),lateNight}`；`bit` 定时切换 | ✅（比规格「按时段」更细：6 档而非 4 档，另有 20–30px 字号自适应） |
| workspace 行：🗀 名称 + git 分支 chip + 菜单（最近项目/打开工作区） | `yJt` 组装 contextHeader = `a4`（folder/house/cloud 图标+名称+⌄：搜索最近项目前 5/打开文件夹 `workspace.openFolder`/远程 `remote.trigger`/不选项目）+ `zZ` 分支 chip（仅 `workspacePurpose==='project'` 时，`className px-0 pt-0`） | ✅ |
| composer 卡 `rounded-xl border bg-card` 双层 | 实际为**输入面** `chat-composer-input-surface` 在有 contextHeader 时 `rounded-2xl bg-surface shadow-xl/5`（外层卡片样式由 CSS 类承担）；内部 `ComposerInput className="p-0"` | ✅（细化：圆角档位是 `rounded-2xl`，双层=输入面+外层区域） |
| 输入区 multiline，placeholder「向 ZCode 提问，使用 @ 添加上下文，使用 / 选择命令或能力」 | `ZYe` 4 态选 key：`chat.placeholder.{newTask,newTaskMobile,followUpAsk,followUpQueue}`；`newTask` 即该文案（词典在 IntlProvider chunk） | ✅ |
| 工具条左：`+` 附件、变更前确认、计划模式；右：供应商/模型⌄、思考级别⌄、发送圆钮 | 左簇 `leadingActions`=`Zrt` 模式工具条+`iZe` 后台工作胶囊；`+` 附件=`attachmentAction`（testid `chat-attachment-button`）；右簇 `submitControl`=`ait` 配置工具条（模型/思考/模式选择器）+发送钮 `bg-brand rounded-lg`（testid `v4-composer-send`，`arrow-up` 图标；处理中换 `square` 停止钮 `v4-stop`+Esc tooltip） | ✅（「变更前确认/计划模式」是 `Zrt` 的模式项，本体在 F08，接口保留） |
| 提及菜单：`@` 文件、`#` 会话、`>` 命令（`mC`） | `mC` 逐字一致：`commands→'>'`、`conversations→'#'`、`files→'@'`；触发检测 `Pqe` 支持 `/ @ $ # ¥ ￥`；面板 `SV`（`data-trigger` 区分）；`@` 段=files/plugins/whiteboards、`#` 段=sessions、`$` 段=skills（`KJe` 65623–65716） | ✅（`>` 命令触发在 QuickPick/斜杠侧；`$`=技能为规格未列的第 4 触发符） |
| banner 行（📢 可关） | `kit` 头行：`megaphone` 图标（`Yye`）+`offPeak.newTask.bannerText`（悬停 `bannerTipText`）+关闭钮（`dismissNewTaskBanner` 持久关闭位） | ✅（实体是 off-peak 闲时任务横幅；显示条件 `grayConfig.enabled===true` 且未关闭、且本地工作区草稿） |
| 建议卡 3 张（icon+title+body，`rounded-xl border`） | `Oit` 恰 3 张：`standupGitSummary/ciFlakyReport/customize`；`grid grid-cols-1 gap-4 sm:grid-cols-3`；每卡 moon 图标+`offPeak.newTask.template.<id>.title`+`.description`（`line-clamp-3`）；类名 `rounded-2xl border border-card-border bg-background p-3 hover:bg-surface-hover` | ✅（两处细化：①圆角实际 `rounded-2xl` 非 `rounded-xl`；②3 张卡是 off-peak 模板卡，点击写 `pendingCreateDraft` 并打开自动化面板，无 Coding Plan 时改弹升级 toast） |

**勘误/澄清两条**：

1. **地图备注「建议卡文案数据 `Dqe` 在 Composer 族 63845」**：实地核验 `Dqe` 是
   9 个官方插件名的 Set（android-emulator/browser/browser-use/document-skills/
   ios-simulator/restore-legacy-sessions/skill-creator/superpowers/zcode-guide），
   `kqe` 是这些插件技能的 zh-CN/en-US 精选描述，消费方是 `ZB`→`Uqe`（提及面板
   `$` 技能段的文案），**并非** §5 的 3 张建议卡。3 张建议卡的文案是
   `offPeak.newTask.template.*`（词典 key）。已在 Home.tsx §6 登记。
2. 规格「建议卡 `rounded-xl`」建议回写为 `rounded-2xl border-card-border`；
   「banner 📢」图标实为 lucide `megaphone`，与规格一致。

---

## 4. 外部依赖清单（跨 chunk）

共 **9 个外部 chunk** + 本 chunk 内原语块：

| # | chunk | 提供的符号（原局部名） |
|---|---|---|
| 1 | `react-BQLj9xdT.js` + `jsx-runtime-B5yMD3-t.js` | React（`Q`）、jsx 运行时（`$`） |
| 2 | `utils-CEEH0K_K.js` | `cn()`（`Z`） |
| 3 | `button-laUijeDG.js` | `Button`（`X`）、`createLucideIcon`（`Sa`） |
| 4 | `IntlProvider-C321H7m8.js` | `useIntlContext`（`G`）→{intl,locale} |
| 5 | `imeComposition-DEYFkwWm.js` | toast（`m`）、info 图标（`p`=T）、close 图标（`g`=b）、usePlatformService（`l`=M） |
| 6 | `usageStatsUiParts-CiR7YEhh.js` | `Tooltip`（`Ia`）、Popover 原语（`Na/Oa/Ma/ka`） |
| 7 | `logger-PFDwl5Yq.js` | `logger`（`J`） |
| 8 | `skillStore-BmeKHDBI.js` | zustand `create`（`Ae`）、`useTaskStore`（`xe`，仅用 `draftFocusVersion`） |
| 9 | `src-HCld2afU.js` | §1.4 全部 testid、`testidOf`（`qr`←`Nb`）、workspaceScopeKey（`Ti`←`to`） |
| 10 | `esm-BY6T6pIH.js` | `useVirtualizer`（`to`，@tanstack/react-virtual，`SV` 用） |
| — | 本 chunk 内 | DropdownMenu 原语（`VO…JO` 47926–48040，TopBar 已还原）、Dialog 原语（`zb…Wb` 31943+）、InputGroup（`qb/Jb`）、F08 接口保留件（§1.2） |

---

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| `Sit/Cit`（hero+问候）、`vit/gX/_X/yit/bit/xit`（时段/字号） | **高（逐字转录）** | 全部为短函数/单组件，类名、i18n key、SVG path、CSS 变量名逐字核对 |
| `kit`（banner+3 卡）、`bX` store、off-peak 助手 5 件 | **高（逐字转录）** | store 全量 220 行逐行还原；横幅显示条件/模板投递逻辑直读 |
| `a4`（workspace 行）+ 显示名助手 7 件 | **高（逐字转录）** | 类名、菜单结构、搜索/前 5 条逻辑逐字；`fOt` 向导仅接口 |
| `SV`（面板）+ 行渲染 3 件 + 触发检测 4 件 + `mC` | **高（逐字转录）** | 虚拟滚动参数（34/28/40、overscan 8、max-h-56）、testid 全部反查到字符串值 |
| `hit/git`（composer 卡）的 JSX 结构、类名、i18n key、发送流水线 | **高（逐字转录）** | 1000 行逐行还原；队列确认对话框、上传进度环、草稿持久化时序直读 |
| `hit` 的 TS props/闭包钩子签名（`mXe/ZXe/QXe/tZe/JXe` 等） | **中高（推断）** | 由解构用法归纳接口；F08 实现未展开，字段名与真实接口可能有细微出入 |
| `ait/Zrt/iZe/TH/lit/JH/uit/vN…/DN/vWe` 等叶子 | **中（接口级）** | props 由调用点归纳，行号已登记，可按需补全 |
| 跨 chunk 符号归属 | **高** | 文件头 336–995 import 块逐个别名核对（含 `Ti`/`qr`/`p`/`g` 的二次反查） |

---

## 6. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`（web/node_modules/.bin）：**0 错误**。
- `tsc --noEmit --strict --jsx preserve --target es2020 --module esnext --moduleResolution bundler --skipLibCheck`
  （在 `/home/none/grok-build/web` 的 @types/react 环境下，临时副本验证后已清理）：**0 错误**。
  （首轮 4 处类型错误已修复：`inputRouting` 可选链、附件 `lineCount` 字段、
  `attachmentInputRef` Ref 型、`contextHeader` ReactNode 三元化。）
- `out/` 目录未做任何修改（只读访问；git 状态确认无改动）。

## 7. 后续建议

1. F08 Composer 族抽取时优先补全本文件接口保留件：`ZV`（根）、`KJe/SJe`（提及/斜杠接线）、
   `ait/Zrt`（工具条，含「变更前确认/计划模式」模式项的实体）。
2. `bX/kit` 已随本族抽取，F15 Automations 族抽取时直接引用，避免重复
   （地图 91367–91810 段中 `Ait/jit` 面板头 91755–91801 仍归 F15）。
3. 规格 §5 建议回写：建议卡圆角 `rounded-2xl border-card-border`；问候语 6 档+字号自适应；
   「建议卡」实体为 off-peak 模板卡（`offPeak.newTask.template.*`），与 `Dqe` 技能文案数据区分。
4. `a4` 的另两处消费（off-peak 表单 135911、自动化编辑器 138135）在 F15 抽取时复用本文件导出。
