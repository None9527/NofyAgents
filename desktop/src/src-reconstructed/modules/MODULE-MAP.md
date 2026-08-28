# ZCode 3.7.6 融合 renderer chunk · 全局模块地图（D8 Stage A）

- 输入 js（行号基准，未修改）：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，prettier 格式化、压缩标识符）
- 对照 jsx（JSX 还原版，行号不同）：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行）
- 结构先验：`/home/none/grok-build/web/docs/zcode-uiux-spec.md`（§2–§13 锚点）、`/home/none/grok-build/web/docs/zcode-feature-inventory.md`（A–N 功能域）
- 已完成族（本图不重复展开，仅登记行号占位）：TopBar/S6/H6/U6/TFt/wFt/SFt/xFt/j6/oFt/zZ/n4/Flt 等，见 `TopBar.report.md`；
  Conversation 族（F03 全部三段范围：R0/PTt/zbt/K$/lQ/z_t/Hxt/_xt/pSt/dst/gst/iyt/vbt/Tbt 等），见 `Conversation.report.md`（拆为 `Conversation.tsx` + `ConversationOverlays.tsx`）；QuickPick 族（Rje/nPt/O_e/Vo/ZS/rge 等），见 `QuickPick.report.md`；
  Git 审查族（BWt/NWt/nge 状态层、C6、FileRewindDialog b_t/f1/y_t、FH 代码评论消费面、mlt/Rct/Ict/Lct Git 工具 mini 浮卡），见 `GitReview.report.md`（D8 B3）；
  模态/对话框族（D8 B3：COt 呈现层 / r4+$Dt+ZEt/lDt/XDt 三同步对话框 / MEt 目录浏览 / E3t+导入向导 / H2+U2+q4t 确认 / N9+G4t 警告 / P9 宿主 等），见 `Modals.report.md`（`Modals.tsx` 按子族分节）

**行号口径**：所有范围以 `.js` 为准（闭区间）；每族根组件附 `.jsx` 双行号（抽样验证一致，方法同 TopBar 试点：按混淆名在两个文件各自定位 `function X(` / `var X = (0, Q.memo)`，再双向核对类名/i18n key）。

**定位方法**：① spec §13 锚点组件名直接命中（rVt/Mqt/jqt/X4/Dr…）；② `function X( … return jsx` 顶层声明边界（7,283 个顶层声明全量索引）；③ i18n key 前缀聚类（`settings.*` 1081 处、`chat.*` 322 处、`automations.*` 133 处…共 40+ 前缀的行号包络）；④ zustand `Ae(` 创建点（20 个）与 selector 用法聚类；⑤ 类名锚点（`bg-sidebar`、`h-12 border-b`、`[app-region:drag]`、`cmdk-*`、`data-slot=`）。

---

## 1. 族清单（20 族 + 已完成的 TopBar 族 = 21）

优先级：**P0** = 用户改造最先碰的（Sidebar、Home、Conversation、SidePanel、QuickPick、Settings）；**P1** = 模态族 / stores / services 及支撑面；**P2** = 其余。

### F01 · SidebarFamily（侧栏 + 任务列表族）— P0

| 项 | 值 |
|---|---|
| 覆盖功能 | 侧栏整体（导航 4 行 / 分段 分组\|项目 / 滚动列表 / 页脚）、任务行（未读、置顶、状态徽章、相对时间、…菜单）、任务分组（彩色、拖拽、空组投放）、工作区切换器、工作区行、任务行上下文菜单逻辑、时间线分组、侧栏偏好持久化 |
| 根组件 | `rVt`（memo）js **159137–160322** / jsx **132075**（= spec §13.8 锚点） |
| 副根 | `SRt` 页脚 js 150435–151185 / jsx 124677；`E8` 任务行 js 151186 / jsx 125140；`sBt` 工作区切换器 js 155455 / jsx 128357；`BBt` 工作区行 js 158149 / jsx 131453；`mzt`/`N8` 分组行/新线程行 js 154014/154092 / jsx 127331/127401；`EFt` NewTaskRow js 144153 / jsx 120034 |
| js 行范围 | **142372–142753**（E6/k6 任务列表 stores）+ **144153–160322**（任务行 UI + 任务列表域逻辑 + 侧栏本体） |
| 规模估计 | ~16,550 行 |
| 备注 | 任务列表域逻辑（144363–151186）：`zcode-sidebar-task-preferences` 持久化、`projects|conversations` 视图模式、分组色板 `$6=[gray…purple]`、折叠组 `zcode-grouped-task-collapsed-groups`；spec §4 全部条目在此 |

### F02 · HomeFamily（Home / 新任务草稿族）— P0

| 项 | 值 |
|---|---|
| 覆盖功能 | 首页草稿态（会话面板的 draft 形态）：问候语（按时段 6 档）、品牌区、工作区选择行（最近项目搜索/分离/菜单）、建议卡数据、off-peak 横幅入口。注意：ZCode 的 Home 不是独立视图，而是 `R0` 会话面板 `draftMode` 态 + `hit` 草稿头 |
| 根组件 | `hit`（memo 名 `git`）js **90180–91174** / jsx **78144**（props: snapshot/draftMode/draftConfig/contextHeader/centered） |
| 副根 | `Sit` 问候语 js 91219 / jsx 78861；`xit`/`Cit` 字号自适应/副题 js 91212/91322；`a4` 工作区选择行 js 128568–128795 / jsx 108415（`chat.empty.home/selectProject/detachProject/workspaceMenu`） |
| js 行范围 | **90180–91366** + **128568–128795** |
| 规模估计 | ~1,415 行（大量复用 Composer/Markdown 族组件，故本体小） |
| 备注 | 建议卡文案数据 `Dqe` 在 Composer 族 63845；问候 key `chat.empty.greeting.*` 91191–91200 |

### F03 · ConversationFamily（会话族）— P0（已抽取，见 `Conversation.report.md`）

| 项 | 值 |
|---|---|
| 覆盖功能 | 会话面板（消息流/轮分段/流式）、虚拟滚动消息列表、工具卡全家桶（ToolLayout/ToolCallBlock/inline diff/计划/思考折叠）、消息行（复制/赞踩/编辑/重试/fork）、配额横幅、轮导航、查找高亮、引用选择动作、会话编排器 `PTt` |
| 根组件 | `R0` js **119219–121283** / jsx **101388**（paneId/sessionId/selectionSideChat；内嵌 `git`(hit) 草稿头 + `zbt` 列表 + `Sit` 空态） |
| 副根 | `Rbt`/`zbt` 消息列表 js 114627 / jsx 97662/98313；`lQ`=ToolLayout js 100416 / jsx 86604；`K$`=ToolCallBlock js 109241 / jsx 93274；`VQ` inline diff js 104622 / jsx 90046；`z_t` 流式折叠 js 111329 / jsx 95033；`PTt` 编排器 js 122803–123102 / jsx 104572；`ust`/`dst` 配额横幅 js 94696–94966 / jsx 82817/82869；消息行 memo 群 `rvt/lvt/fvt/Cvt/Dvt/Hvt/iyt` 111783–113619 |
| js 行范围 | **94696–94966** + **99485–121668** + **122803–123121** |
| 规模估计 | ~22,720 行（全图最大族） |
| 备注 | `chat.toolCall.*` 68 处（99864–109164）、`chat.queue.*`（91131–120301）、`chat.permission.*` 对话框在 116470–117165（权限状态机 `hT` 在横切层 X06）；spec §6 轮级动作/工具行/思考折叠均在此 |

### F04 · SidePanelFamily（侧面板族）— P0

| 项 | 值 |
|---|---|
| 覆盖功能 | 右侧多标签面板：标签栏（激活/重排/关闭/重开）、文件树标签页、Git 变更标签页、白板画布、Treemapping、模型轨迹（modelTrajectory）、开发者工具、子代理目录标签内容；侧面板状态机（开/合/最近关闭标签） |
| 根组件 | `xqt` js **182519–183363** / jsx **147333**（props 40+：sidePaneState/gitState/browserRestoreUrls/fileChangeFind*/onOpenWhiteboard/…） |
| 副根 | `BWt` Git 变更面板 js 178584 / jsx 144748；`FGt` 白板画布 js 179888 / jsx 145638；`P5` 轨迹分段 js 180200；`LKt`/`GKt` 标签内容/子代理目录项 js 181855/182056 / jsx 146763/146983；`$It` 文件树虚拟列表 js 146089；`Boe` useSidePaneState js 2816–3550 / jsx 1919 |
| js 行范围 | **2816–3550** + **146089–147766** + **178584–183363** |
| 规模估计 | ~7,190 行 |
| 备注 | `sidePane.*` 28 处、`workspaceFileTree.*` 16 处（146116–184648）、`whiteboard.*` 画布部分（180132–181600）、`treemapping.*`/`modelTrajectory.*`/`developerTools.*`（179530–182910）；代码查看标签内容借用 F14 `tHt`。**已抽取**：`BWt` Git 审查 pane（含 `NWt` 变更行/查找/虚拟列表 + git 状态层 `nge` 23726–24014 + FileRewindDialog + 代码评论消费面 + Git 工具 mini 浮卡 `mlt/Rct/Ict/Lct` + `C6` useTaskFileActions），见 `GitReview.tsx` / `GitReview.report.md`（D8 B3） |

### F05 · QuickPickFamily（命令面板 / 命令中心族）— P0（已抽取，见 `QuickPick.report.md`）

| 项 | 值 |
|---|---|
| 覆盖功能 | 命令面板（`quickPick.*`：标题「命令面板」/段序 suggested…app）+ 全局搜索命令中心（`commandCenter.*`：最近变更/最近任务/会话 分段、更多结果）；键盘导航（↑↓/Enter 上一项/下一项）；任务内查找入口 |
| 根组件 | `Rje`（memo）js **36439–36948** / jsx **33404**（open/commands/workspaceTabs/onSelectTask/onSearchResultHighlightRequest） |
| 副根 | `nPt` 键盘导航/命令执行 js 139949 / jsx 116646；`QNt` 方向键映射 js 139925；`Vo` 搜索结果 store 见横切层 |
| js 行范围 | **36439–36948** + **139925–140668** |
| 规模估计 | ~1,250 行（命令注册表分散于 WorkspaceShell 的快捷键层） |
| 备注 | `quickPick.*` 11 处（36572–140164）、`commandCenter.*` 19 处（36634–159899）、`taskSearch.*`（36758）；spec §8 段序在此。**已抽取**：`QuickPick.tsx`（含命令注册表 `O_e` js 25394–25585、cmdk 封装 32092–32200、历史/过滤助手 36171–36370、`Vo` store、`ZS` hook、全局快捷键 `rge` 24015–24078），详见 `QuickPick.report.md` |

### F06 · SettingsFamily（设置族）— P0

| 项 | 值 |
|---|---|
| 覆盖功能 | 设置视图壳（64/264px 左段列表 + 右栏）、14 个分区注册表（general/appearance/modelProvider/memory/plugins/skills/subagents/automations/mcp/commands/hooks/indexing/browser/usage）、各分区视图、外部 agent 配置导入（settingsSync：Claude Code/Codex/OpenCode…18 种）、插件市场浏览 |
| 根组件 | `j9` js **204878–205679** / jsx **163283**（内用 `l4` 壳 + `K2t` 分区表 + `S6`/`tkt` 窗口控件） |
| 副根 | `K2t` 分区注册表 js 203935 / jsx 162621；`sZt` 用量限额 js 190009；`C0t` 市场条目卡 js 199415；`Z0t` hooks store js 201244 / jsx 160815；`F6` commands store js 142754；`B6` plugins store js 142985 |
| js 行范围 | **142754–143100**（commands/plugins stores）+ **187020–205679**（供应商协议接线 / settingsSync / 分区视图群 / 注册表 / 视图壳） |
| 规模估计 | ~19,010 行 |
| 备注 | `settings.*` 1081 处（51991–207700 散布，主体 190014–204785）；`settingsSync.*` 28 处（193248–207980）；模型供应商分区的大体量实现（支付/用量）拆在 F12 |

### F07 · WorkspaceShellFamily（窗口骨架 / 工作区壳族）— P0（基础设施级）

| 项 | 值 |
|---|---|
| 覆盖功能 | 主体三分布局（会话列\|右摘要栏，会话列内 聊天\|dock）、v4 分屏（splitPane/绑定/拖拽比例）、窗口壳与次级窗口壳、平台 caption 控件、错误边界、会话路由（打开/侧栏打开/远程回放模式）、会话持久化（`zcode-v4-last-session`）、工作区根接线（服务注册/终端/侧面板/Git/浏览器状态总控） |
| 根组件 | `yJt`（memo）js **183896–185431** / jsx **148387**（= spec §13.6 三分体 149287-149335 的实现）；`XJt` 工作区根控制器 js **186219–187019** / jsx **150098** |
| 副根 | `X4`/`Z4`/`cAt` 分割布局 js 131934/131943/131422 / jsx 111263/—/110732；`l4` 次级窗口壳 js 129647 / jsx 109071；`tkt` Win caption js 129992 / jsx 109264；`ekt` ErrorBoundary js 129920 / jsx 109184；`Xwt`/`tTt` 分屏容器 js 121892/122184；`s2` 分屏 store js 121669 / jsx 103518；`A2` 会话路由 store js 122619 / jsx 104365；`M2/N2/P2` 会话持久化 js 123190–123205 |
| js 行范围 | **121669–122802** + **123122–123479** + **129647–132305** + **183896–187019** |
| 规模估计 | ~7,280 行 |
| 备注 | spec §13.6/§13.7 全部结构断言的落点；`yJt` 内可见 `TFt`/`PTt`/`Mqt`/`Dr`/`BOt` 的装配现场（185128–185375） |

### F08 · ComposerFamily（Composer 族）— P1

| 项 | 值 |
|---|---|
| 覆盖功能 | 富文本输入（Lexical 引擎：@提及节点/粘贴/IME）、提及选择器（文件/插件/技能/子代理/会话/白板）、斜杠面板注册（`app-slash:`）、附件、工具条（模式/模型/思考级别）、模型选择器、草稿状态机、后台工作胶囊接线 |
| 根组件 | `ZV` js **66959–~69297** / jsx **59468**（placeholder/enterSubmits/showMentionButton/showSlashButton…） |
| 副根 | `KJe` 提及选择器 js 65605 / jsx 58473；`vq` 模型选择器 js 75527 / jsx 67089；`UB` 技能上下文 store js 63592 / jsx 56751；`Dqe` 建议卡数据 js 63845；`iV`=`app-slash:` 注册 js 64116；`mXe` 白板提及 js 67631；思考级别解析 `U3e`（disabled/nothink/off…）js 77014 |
| js 行范围 | **57652–69297**（含 Lexical 引擎 57652–63592）+ **75527–76245** + **77014–77079** |
| 规模估计 | ~12,430 行（其中 Lexical 引擎 ~5,940 行为 vendored 依赖） |
| 备注 | `chat.composer/mention/slash/attachments/toolbar.*`（67024–69238 等）；`mode.*` 权限模式选择亦在此接线 |

### F09 · ModalOverlayFamily（模态 / 覆盖层族：反馈 + 确认 + 更新 + 目录浏览）— P1

| 项 | 值 |
|---|---|
| 覆盖功能 | 反馈中心（提交/我的工单/功能请求，`feedback.*` 25 处）、确认对话框（`U2` useConfirmDialog + `H2` store）、警告对话框（`N9` store + `G4t`）、更新状态窗（已在 TopBar 族抽取，行号占位）、目录浏览对话框（路径输入/隐藏目录） |
| 根组件 | `RMe`（memo，反馈中心）js **39107–~41892** / jsx **35262** |
| 副根 | `yC` 反馈 store js 36992 / jsx 33835；`U2` js 123493 / jsx 105222；`H2` store js 123480 / jsx 105205；`N9` store js 206514 / jsx 164300；`MEt` DirectoryBrowser js 123942–124266 / jsx 105724；更新窗 `COt/POt` js 128795–129646（已抽取） |
| js 行范围 | **36992–41892** + **123480–123824** + **206514–206560**（+ 已抽取的 128795–129646 占位） |
| 规模估计 | ~5,290 行 |
| 备注 | 反馈存储键 `zcode.feedback.contact`（37091）；`directoryBrowser.*` 8 处（123961–127862，MEt 本体在 F10 段内相邻）。**B3 已抽取**（`Modals.tsx`）：确认/警告对话框+宿主（H2/U2/q4t、N9/G4t/$3t、P9）、MEt、COt 呈现层；反馈中心 `RMe` 待抽取 |

### F10 · RemoteFamily（远程连接族）— P1

| 项 | 值 |
|---|---|
| 覆盖功能 | 远程向导四型分步流（SSH/Server/WSL/Docker）、连接表单（主机/端口/用户名/认证方式/资产安装）、连接日志、远程同步（技能/MCP/插件，`n4`/`r4`，已随 TopBar 抽取）、目录浏览（与向导共用段） |
| 根组件 | `REt` js **124267–~124993** / jsx **105903**（kind/host/port/username/sshAuthMethod/assetInstallMode） |
| 副根 | `fOt` 向导壳对话框（最小化/关闭）js 128093–128525；`uOt` 步骤指示 js 127935；`ZTt/QTt` 远程目标显示 js 123239/123251（已登记于 TopBar 报告） |
| js 行范围 | **123825–128568**（不含 128795+ 更新窗；含 MEt 目录浏览 123942–124266） |
| 规模估计 | ~4,740 行 |
| 备注 | `remote/ssh/server/wsl/docker.*` 92 处（123825–124986）；`canOpenRemoteSessionSourceCheck`（`$2`）127125。**B3 已抽取**（`Modals.tsx`）：r4 分派 + ZEt/lDt/XDt 三同步对话框全量 + $Dt + preflight 助手（124995–127332）；向导壳 `fOt`/步骤 `uOt`/`REt` 待抽取 |

### F11 · BotsFamily（Bot 通道族）— P1

| 项 | 值 |
|---|---|
| 覆盖功能 | 飞书/Telegram/微信/Webhook 通道绑定（绑定码、允许工作区/命令、回复粒度）、未绑定态、区域标签（zai/bigmodel） |
| 根组件 | `qLt` js **148573–~149427** / jsx **123319**（open/workspacePath/entryProvider） |
| js 行范围 | **147767–149553** |
| 规模估计 | ~1,790 行 |
| 备注 | `bots.*` 73 处（147875–149415）；`CLt` login.oauth 区域标签 147767 |

### F12 · ProviderPlanUsageFamily（模型供应商 / Coding Plan / 用量族）— P1

| 项 | 值 |
|---|---|
| 覆盖功能 | 供应商配置卡、配额/限额展示（plan 标签、百分比环）、Coding Plan 订阅对话框（个人/团队源选择）、支付（QR 轮询、余额、席位、时长、折扣、政策）、用量统计仪表盘数据层（日趋势/模型分布/高峰时段/工具调用） |
| 根组件 | `zet`（Coding Plan 对话框）js **84412–~85280** / jsx **74125** |
| 副根 | `Zet` 结账面板 js 85948 / jsx —；`e5e` 支付 QR js 79979；`Xrt`/`Zrt` 计划源选择 js 89295 / jsx 77471；`Mq` 供应商选择 js 76864 / jsx 67907；`s3e/v3e` 配额标签 js 76246/76492；`xnt` 用量格式化 js 87999；~~`nge` 用量数据 hook js 23920~~（**勘误**：`nge` 实为 `useGitRepository`，Git 审查族数据层，已随 `GitReview.tsx` 抽取，见 `GitReview.report.md` §4）；`_j` 供应商配置卡 js 51986 / jsx 46718 |
| js 行范围 | **23920–24014** + **76246–77013** + **77080–90180** |
| 规模估计 | ~13,960 行 |
| 备注 | `settings.modelProvider.*` 367 处（51991–197572 散布，主体在此段）；支付/政策子组件群 86123–87300（`FY/xtt/zY/BY/Stt`…）；QR 生成库见横切层 X12 |

### F13 · DockTerminalBrowserFamily（底部 Dock / 终端 / 浏览器族）— P1

| 项 | 值 |
|---|---|
| 覆盖功能 | 底部抽屉 dock（`Z4 id="terminal" minSize 140px maxSize 50%`）、终端/浏览器标签页（新建/关闭/收起）、xterm 终端渲染（ANSI 解析、链接检测、等宽字体栈）、终端面板、内嵌浏览器（地址栏/前进后退/元素选择/响应式视口/缩放/DevTools 入口） |
| 根组件 | `Mqt` js **183602–183895** / jsx **148118**（= spec §13.7）；`jqt` 标签页 js **183364** / jsx **147904** |
| 副根 | `yUt` 终端组件 js 175561 / jsx 142320；`bUt` 终端面板 js 175976 / jsx 142668；`kUt` 浏览器 js 176539 / jsx 143153；`g5` 浏览器视图 js 176688 / jsx 143256；`zUt` 视口/缩放 js 176802；ANSI 助手群 175265–175560（`d5=\x1B` 起始） |
| js 行范围 | **175265–178583** + **183364–183895**（xterm 库 162010–175264 见横切层 X14） |
| 规模估计 | ~3,850 行（应用层）+ 13,255 行 xterm 库 |
| 备注 | `terminal.*` 15 处（143323–183566）、`browser.*` 29 处（176561–182903）；spec §7 dock 形态 |

### F14 · CodeViewerFamily（文件预览 / 代码查看族）— P1

| 项 | 值 |
|---|---|
| 覆盖功能 | 代码查看面板（TextMate 高亮 + 主题/换行/行号/256KB 上限）、patch/multi-file diff 源、文件/图片/SVG/PDF/Office 预览分派、行级代码评论、gutter 悬停控制 |
| 根组件 | `tHt` js **161141–162009** / jsx **133444**（source/workspacePath/onOpenBrowserUrl/renderHeavyContent） |
| 副根 | `El` gutter 控制器 js 6062–6881；`FH` 代码评论 store js 68514 / jsx 60720；预览助手群 160323–161140（`sVt` 图片/`cVt` SVG/`lVt` lazy PDF/`dVt` lazy Office/`uVt` 图表/`W8` memo） |
| js 行范围 | **6062–6881** + **68514–68579** + **160323–162009** |
| 规模估计 | ~2,570 行（应用层）+ shiki/diff 库（X08/X09） |
| 备注 | `codeViewer.*` 72 处（50618–182905）；被 F04 侧面板标签与 F03 工具卡复用；`OVt/UVt = 256*1024` 上限常量 160926/161032。**已抽取**：`FH` 代码评论 store 的消费面（行内评论→回流对话全链路）随 `GitReview.tsx`（D8 B3）；`tHt`/`El`/`W8`/`gut` 本体仍待 F14 抽取 |

### F15 · AutomationsFamily（自动化 / 闲时族）— P1

| 项 | 值 |
|---|---|
| 覆盖功能 | 定时任务列表/编辑器（频率/最大次数/暂停/立即运行）、运行历史、模板（晨间简报/风险扫描/周报…）、聊天创建入口、off-peak 闲时任务（队列/保活/横幅） |
| 根组件 | `d6`（AutomationsMain）js **138823–139924** / jsx **115911**（spec §13.6 automations main 分支） |
| 副根 | `kNt` 自动化编辑器 js 137005–138822 / jsx 114854；`T3` store js 134111 / jsx 112916；`bX` off-peak store js 91368 / jsx 78945；`kit` off-peak 横幅 js 91591 / jsx 79222；`Ait`/`jit` 面板头 js 91755/91801 |
| js 行范围 | **91367–91810** + **134111–139924** |
| 规模估计 | ~6,260 行 |
| 备注 | `automations.*` 133 处（109374–184474）、`offPeak.*` 72 处（91626–155039） |

### F16 · RepoWikiFamily（仓库 Wiki 族）— P2

| 项 | 值 |
|---|---|
| 覆盖功能 | 仓库 wiki 主视图（标签页/返回/打开代码查看）、wiki 任务卡（生成/停止） |
| 根组件 | `l3` js **132306–133070** / jsx **111550**（spec §13.6 `repo-wiki` main 分支） |
| 副根 | `RAt` wiki 任务卡 js 133071 / jsx 112122 |
| js 行范围 | **132306–134110** |
| 规模估计 | ~1,800 行 |
| 备注 | `repoWiki.*` 49 处（132390–182909） |

### F17 · WebRemoteFamily（Web 远控族）— P2

| 项 | 值 |
|---|---|
| 覆盖功能 | 手机端远控视图（导航/任务切换/初始结果）、远控启动对话框、远控特性门（`oRt`）、移动端导航折叠把手（`yJt` 内的 `webRemoteControl.*` 分支） |
| 根组件 | `BPt` js **140709–~141557** / jsx **117329**（activeTaskId/initialResult/onNavigateHome/onNavigateToChat） |
| 副根 | `rRt` 启动对话框 js 149554–150102 / jsx 124107；`oRt` 特性门 js 150103 / jsx 124380 |
| js 行范围 | **140669–142371** + **149554–150434** |
| 规模估计 | ~2,580 行 |
| 备注 | `webRemoteControl.*` 93 处（140669–150215）；QR 配对库见 X12 |

### F18 · OnboardingLoginFamily（Onboarding / 登录族）— P2

| 项 | 值 |
|---|---|
| 覆盖功能 | 欢迎门（语言选择）、onboarding 向导（欢迎/迁移/项目选择 hero）、API key 登录、OAuth 重登、历史数据导入向导（`z9=[session, skills-import, mcp-import, commands-import, agents-file, migration]`） |
| 根组件 | `m3t`（onboarding 欢迎/项目选择）js **207490** / jsx **164996**；`b4t`（API key 登录）js **205826** / jsx **163845** |
| 副根 | `v8t` 欢迎门 js 213270 / jsx 170001；`k3t`/`A3t` 导入向导 js 208549/208639；`Y4t`（memo `XJt`? 不——`Y4t=memo(XJt)` 在 206773 为远控壳 memo） |
| js 行范围 | **205680–211384** + **213270–213616** |
| 规模估计 | ~6,050 行 |
| 备注 | `onboarding.*` 52 处（207322–208432）、`login.*` 26 处（205863–210098）、`projectSelector.*`（207506） |

### F19 · MarkdownFamily（Markdown / 富文本渲染族）— P2

| 项 | 值 |
|---|---|
| 覆盖功能 | `cj` Markdown 渲染器（流式/代码块语言头/复制/打开代码查看）、代码块 UI（`codeBlock.*`：mermaid 预览入口等）、聊天预览卡（图片/文档/网页）、链接安全弹窗、内联图表块、用量快照缓存（寄生于此段） |
| 根组件 | `cj`（memo）js **51688–~57651** / jsx **46461** |
| 副根 | `KRe` 源类型判定 js 46901；`MBe` 图表/媒体块 js 49090；`Ik` 侧边状态 js 49696；预览卡群 50618–51687；`yj` 链接正则 js 52043 |
| js 行范围 | **46901–57651**（其中 47926–48040 为 DropdownMenu 原语，属横切层 X03，双归属） |
| 规模估计 | ~10,750 行 |
| 备注 | `markdownImage/markdownTable/codeBlock.*`（47901–50101）；mermaid/lru-cache 库见 X10 |

### F20 · BootstrapDevToolsFamily（应用引导 / 开发者工具族）— P2

| 项 | 值 |
|---|---|
| 覆盖功能 | 应用根（provider 树：图标/Tooltip/服务/平台/广播/错误边界/远控门/启动屏）、启动屏音频、ARMS E2E 遥测记录、渲染器实例 id、token 调试面板用例（TDP01–03） |
| 根组件 | `g8t`（App root）js **212594–213269** / jsx **169433** |
| 副根 | `i8t` token 调试用例 js 211385 / jsx 168266；`x8t` 启动音 js 213617；`C8t` 遥测 js 213626；`T8t` 渲染器 id js 213638 |
| js 行范围 | **211385–213269** + **213617–213695**（文件尾 export 块 213646–213695：本 chunk 对外导出 `Tie/mo/po/WOt/T8t/g8t/v8t/…`） |
| 规模估计 | ~1,960 行 |

### F00 · TopBarFamily（已完成，占位）

| 项 | 值 |
|---|---|
| 覆盖功能 | 顶栏浮层/更新指示/发行说明/更新对话框/Windows caption 菜单/帮助菜单/终端开关/会话头全套/分支 chip/远程同步菜单项/右摘要栏 |
| 根组件 | `BOt` js 129516 / jsx 108974；`TFt` js 144008 / jsx 119938；`S6` js 141854 / jsx 117848；`zZ` js ~96589 / jsx 84085；`Flt` js 99217 / jsx 85723 |
| js 行范围 | **94967–99484**（分支切换器 + 摘要栏）+ **127125–127248**（远程同步，语义上属 F10）+ **128795–129646**（更新窗，语义上属 F09）+ **141785–144152**（caption/帮助/会话头） |
| 规模估计 | ~7,860 行（已抽取进 `TopBar.tsx`，见 `TopBar.report.md`） |
| 备注 | 范围内 `96895–98008`（`Rct` GitActionMenu + `Ict` 提交对话框 + `Lct` 推送对话框 + 助手群）与 `98270–98452`（`flt/plt/XZ` 段壳 + `mlt` SummaryGitSection）属 Git 审查族，已随 `GitReview.tsx` 抽取（D8 B3，见 `GitReview.report.md`）；`95017–95078`（`NZ/Est/PZ`）同 |

---

## 2. 横切层清单

### 2.1 zustand stores（20 个创建点；`Ae` = skillStore chunk 导出的 create）

| # | 混淆名 | 语义名 | js 行 | jsx 行 | 归属族 |
|---|---|---|---|---|---|
| 1 | `Mie` 工厂内 `o`（钩子 `ko` js 1296 / jsx 351） | SettingsStore（theme/locale/uiFontSizePx + 持久化 `zcode-theme|locale`） | 1140–1286 | 185 | 横切（F06 消费） |
| 2 | `Vo` | SearchResultsStore（resultsByQueryKey/taskMeta/unreadOverlay） | 1553–2609 | 569 | F05 |
| 3 | `ls` | TrajectoryViewerStore（model-trajectory-open 请求） | 2610–2637 | 1697 | F04 |
| 4 | `Zs` | SessionRegistryStore（baseServices/sessionsById/按路径与身份索引） | 4309–4352 | 3184 | 横切（F07 消费） |
| 5 | `Ug` | McpStore（connect/status 节流、按工作区身份） | 25007–25973 | 21655 | F06 |
| 6 | `yC` | FeedbackStore（open/featureRequestOpen/tab/submitDraft） | 36992–37066 | 33835 | F09 |
| 7 | `UB` | SkillContextStore（按 工作区×供应商 缓存技能上下文） | 63592–63845 | 56751 | F08 |
| 8 | `yH` | SelectionScopesStore（scopes: 会话引用选择域） | 67554–67560 | 59934 | F03 |
| 9 | `FH` | CodeCommentsStore（commentsByBucketKey 行级评论） | 68514–68579 | 60720 | F14（消费面已抽取：`GitReview.tsx`，D8 B3） |
| 10 | `bX` | OffPeakTaskStore（tasks/grayConfig/codingPlanSupport/takeNumber） | 91368–91590 | 78945 | F15 |
| 11 | `s2` | SplitLayoutStore（splitPane/openSessionInNewPane/replacePaneBinding） | 121669–121891 | 103518 | F07 |
| 12 | `A2` | SessionRouterStore（configureClientMode/openSessionFromSidebar/web-remote-replayable） | 122619–122802 | 104365 | F07 |
| 13 | `H2` | ConfirmDialogStore（pendingRequest/settleConfirmation） | 123480–123492 | 105205 | F09 |
| 14 | `T3` | AutomationsStore（automations/runsCache/operationId） | 134111–137004 | 112916 | F15 |
| 15 | `E6` | PinnedTaskListStore | 142372–142463 | 118266 | F01 |
| 16 | `k6` | WorkspaceTaskListStore | 142464–142753 | 118392 | F01 |
| 17 | `F6` | CommandsStore（user/plugin commands、capability） | 142754–142984 | 118681 | F06 |
| 18 | `B6` | PluginsStore（plugins/marketplaces/diagnostics） | 142985–143100 | 119004 | F06 |
| 19 | `Z0t` | HooksStore（事件/匹配/超时/异步） | 201244–201421 | 160815 | F06 |
| 20 | `N9` | AlertDialogStore（pendingRequest/settleAlert） | 206514–206560 | 164300 | F09 |

（`useTaskStore` `xe`、`useSkillsStore` `Ne` 在 skillStore-BmeKHDBI.js，跨 chunk。）

### 2.2 services / IPC client 层

| 符号 | 语义 | js 行 | 说明 |
|---|---|---|---|
| `ise` | MessagePort 流客户端（onMessage/onFlowState，host 32 服务面的 renderer 侧） | 3843–4308 | 类 + 帧处理 |
| `Sse` | registerBaseServices（注入 `Zs`） | 4353 | |
| `fs` | useServices（context 钩子） | 2638 | |
| `Ec` / `Gse` | useBaseServices | 4897 / 4879 | |
| `Dc` | workspace 服务解析（rpcReady） | 4907 | |
| `Oc` | useWorkspaceServices | 4945 | |
| `Qs` 等 | 会话注销/工作区路径反查 | 4357+ | |
| 24015–25006 | 工作区文件/路径服务钩子群（`Dg/Og/kg/Cge/wge/Ag`…） | 24015–25006 | 含 `Sge` 路径状态缺省 |
| 4946–6061 | 文件类型/图标工具（`kc`=document、`Mc` SVG 文件夹图标、`Fc`…） | 4946–6061 | 文件树/提及/代码查看共用 |

### 2.3 i18n

- 本 chunk **无词典**：全部 `formatMessage({ id: … })` 内联 key（40+ 前缀、约 3,000 处调用）；词典（**zh-CN/en-US 各 4,503 key，77 个一级前缀**，两目录 key 集一致）在 **IntlProvider-C321H7m8.js**（自研 i18n，无 react-intl；导入 `G`=useZCodeIntl、`He/We`=localStorage 读/写、`Be`=取可写存储、`Ve/Ue`=zh/en 词典、`Ge`=ZCodeIntlProvider，见 §3）。**已解混淆（D8 B2）**：语义重建 + 词典逐字节抽取 + 前缀对照表见 `I18n.tsx` / `I18n.report.md`。
- 前缀包络（首–末行）已在族表备注中逐族登记；最大五家：`settings.*` 51991–207700（1081）、`chat.*` 49946–197340（322）、`automations.*` 109374–184474（133）、`common.*`（127）、`git.*` 95142–178846（95）。（口径：key 字符串全量出现次数；I18n.report.md §4 另给静态 `formatMessage({id:"…"` 直写口径：2,261 处/1,652 个不同 id，包络逐条核对一致。）

### 2.4 Radix / cmdk / UI 原语块

| 块 | js 行 | jsx 行 | 内容 |
|---|---|---|---|
| cmdk 原语 | 26004–26574 | 22591–23140 | `[cmdk-*]` 选择器、root/input/item/list 封装 |
| 图标块（`Sa`=createLucideIcon） | 26575–28020 | 23141–25478 | **184 个** lucide 图标（`Jve` 起：activity…git-graph…） |
| Radix/shadcn 封装主块 | 28021–32245 | 25651–29334 | Collapsible(`Zv`)、Menu、ScrollArea、Select、Input/InputGroup(`data-slot`)、Dialog(`zb` 31943 / jsx 29335) |
| DropdownMenu 封装 | 47926–48040 | 43144–43290 | `VO…JO`（TopBar 报告 §1.1 已登记） |
| 小件原语 | 36949–36991 | — | `hC` Separator、`gC` Badge、`_C/vC` |
| ButtonGroup 类 | 42807 | — | `data-slot=button-group` 容器类 |
| Dialog/Popover/Tooltip 复用 | — | — | 其余 Popover/Tooltip 来自 usageStatsUiParts / imeComposition chunk（§3） |

### 2.5 testid 常量块

- **不在本 chunk**：全部经 `src-HCld2afU.js` 导入（导入表 431–827 行，约 400 个符号），含 `DesktopCommand` 枚举（`oi`=ft）、环境常量（`hi`=js）、`workspace-header/task-new-button/terminal-toggle/chat-summary-panel/…` 等（TopBar 报告 §1.4 已反查 8 个导出字母）。

### 2.6 工具函数块 / 应用运行时

| 块 | js 行 | 内容 |
|---|---|---|
| 事件/可释放原语 | 3551–3842 | `ks` Emitter、`As` 可释放类（`ise` 依赖） |
| 命令队列运行时 | 32246–36438 | steer/dispatch/admittedAt/provenance + zod schema（`K()`）+ 流帧装配（`proto.frameAssemblyMetadataMismatch`）——chat.queue/steer 的底层 |
| 权限状态机 | 41893–42596 | `hT` class（platform/workspaceScopeKey/eventIds/acceptedCommandIds/terminalKeys）+ `uT` 集合 |
| 工作区作用域 context | 42597–42806 | `ST/CT/xFe`（服务作用域）、`TT/CFe/wFe`（工作区作用域）、`ET/DT/TFe`（面板作用域） |
| mdast/unist 工具 | 42807–44695 | 删除线/位置合并等 AST 操作（与 mermaid 相邻） |
| HTML 白名单 | 25974–26003 | `s_` 允许标签 reduce |
| 会话持久化 | 123122–123479 | `RTt`=`zcode-v4-last-session:v1:`、`M2/N2/P2` |
| 壳平台助手 | 185432–186218 | `$5`/`bJt`/`xJt`/`SJt`/`e7`（圆角/让位/拖拽） |
| TextMate 片段引擎 | 6882–10879 | 片段变量/变换正则 `ql`、语法错误类 `Ul`（代码查看基建） |

### 2.7 vendored 第三方库块（抽取时应整体替换为依赖，勿逐行还原）

| 库 | js 行 | jsx 行 | 证据 |
|---|---|---|---|
| shiki（语言注册表 + 核心 + oniguruma + 主题） | 10880–17444；100520–104621 | 9006；86683 | `wd`/`uQ` 注册表、`getSingletonHighlighter`(13200)、`SharedHighlight.registerCustomTheme`(16000)、HEAPU8 WASM(102557) |
| diff 渲染引擎（file / file-diff 类） | 17445–23919 | 15147–21838 | `Lm.__id='file:'`(17447)、`Sh.__id='file-diff:'`(20751)、hunks/conflict 助手群 |
| mermaid（含 c4） | 44696–46174 | 40288 | `ZE='c4'`、detector、`jD` a11y attr |
| lru-cache | 46175–46900 | 41603 | `Symbol('older')`、limit/_keymap |
| Lexical（composer 编辑器引擎） | 57652–63592 | — | `EI` 选区类、invariant 错误码（`AN(63,…)`）、anchor/focus/applyDOMRange |
| framer-motion | 69298–75526 | 61280–67088 | MotionValue(70691)、`framerAppearId`(71300)、scrapeMotionValuesFromProps(71908) |
| qrcode（QR 生成） | 78408–79978 | 69260 | `p8e`：BitMatrix(78500)、版本/纠错表 |
| dnd-kit | 91811–94695 | 79378–82816 | `xX` isBrowser、useDndMonitor(92034)、`_Z`=DndContext(93473)、sensors/collisionDetection |
| xterm（终端模拟） | 162010–175264 | 134112 | `nHt='3.7.8'` 起始的 13,255 行单声明 |

### 2.8 构建元数据

- 1–335：`__vite__mapDeps`（动态 import 依赖表，主要为 shiki 语言语法包 + office worker）；336–995：33 条跨 chunk import（§3）；996–1552：React/ReactDOM 互操作（`Q`/`io`）、jsx 运行时（`$=Ke()`）、`Nie` 广播/认证 provider、`Oo` context。

---

## 3. 每族外部依赖（跨 chunk 导入；导入块 js 336–966）

| chunk | 导出字母 → 本地名（要点） | 消费族 |
|---|---|---|
| `react-BQLj9xdT.js` + `jsx-runtime-B5yMD3-t.js` | `F`→React(`Q`)、`Ke`→jsx(`$`) | 全部 |
| `react-dom-BlRPXJso.js` | `I`→ReactDOM(`io`) | F20/F07 |
| `utils-CEEH0K_K.js` | `Z`→`cn()` 类名合并 | 全部 |
| `button-laUijeDG.js` | `X`→Button、`Sa`→createLucideIcon、`qre`→图标 provider、`xa/Ca/wa/Ta/Ea/Kre` | 全部（图标块 2.4） |
| `IntlProvider-C321H7m8.js` | `G`→useZCodeIntl{intl,locale,localePreference,setLocale,setLocalePreference}（n）、`He`→readLocalStorageItem（o）/`We`→writeLocalStorageItem（s）、`Be`→getWritableStorage（a）、`Ve`→ZH_CN_MESSAGES（i）/`Ue`→EN_US_MESSAGES（r）、`Ge`→ZCodeIntlProvider（t）；详见 I18n.report.md | 全部（i18n 2.3） |
| `skillStore-BmeKHDBI.js` | `Ae`→zustand create、`xe`→useTaskStore、`Ne`→useSkillsStore、另 40+ 字母（`L/R/z/B/…/ze`：任务/草稿/工作区状态选择器群） | F01/F03/F06/F07 |
| `src-HCld2afU.js` | ~400 符号：testid 常量、`oi`=DesktopCommand、`hi`=环境常量、`K`=zod、`q`=usePlatformService?（按调用面）| 全部（2.5） |
| `imeComposition-DEYFkwWm.js` | `a..P` 25 符号：`l`→usePlatformService、`m`→toast、`P`→Input、`A`→IME 回车守卫、`M`→spinner、Popover 原语、`a`→平台 provider、`u`→? | F07/F09/全部 |
| `usageStatsUiParts-CiR7YEhh.js` | `Ia`→Tooltip、`Na/Oa/Ma/ka`→Popover root/anchor/trigger/content、`Da/Jre/Oa/…/Ia` 15 符号（图表件） | F12/F03/TopBar |
| `keyboardShortcuts-BGHopxr9.js` | `$i`→shortcutLabel、`Lre/Rre/Zi/Qi/zre/Bre/ea/Vre/ta` | F05/F07/TopBar |
| `logger-PFDwl5Yq.js` | `J`→logger | 全部 |
| `chunk-BO2N2NFS-CSNAeaxF.js` | 25 符号（`xre/Sre/Cre/…/Xi`）：共享运行时助手 | 横切 |
| `preload-helper-BHSF1fZ9.js` | `Y`→动态 import 助手 | 2.7/2.8 |
| `dist-DJJArJ7D.js` | `na…_a` 18 符号（`fa`/`pa`…：sidePane 状态转换 `fae` 等） | F04 |
| `dist-vnZIbudW.js` | `va/ya/ba/Wre/Gre` | 横切 |
| `katex-fHRr5Rbn.js` | `La`→KaTeX | F19 |
| `src-D6nttw3b.js` | `Ra/za/Ba/Va`（mermaid detector/注册） | 2.7 |
| `chunk-ICPOFSXX-C_rmVRO5.js` | `Ha/$re/…/fie` 23 符号 | 横切 |
| `chunk-5PVQY5BW-CHFWSpGD.js` | `pie/Qa/$a/mie/hie/gie` | F14 |
| `chunk-426QAEUC / chunk-XPW4576I / chunk-U2HBQHQK / chunk-336JU56O` | `_ie` / `vie,yie` / `bie,xie` / `Sie` | F14/F19 |
| `isEmpty-CzqZrCGw.js` | `eo` | 横切 |
| `esm-BY6T6pIH.js` | `to` | 横切 |
| `officeFilePreview-DDCn9-xI.js` | `no`→office 预览、`ro`→文件分派 | F14 |
| `chunk-Cq_f4orQ.js` | `e/t/n/r/i`→interop 助手（`r`/`i` = CJS 互操作） | 2.7/2.8 |
| 副作用导入 | `chunk-BSJP7CBP / chunk-ZZ45TVLE / chunk-X2U36JSP / chunk-5FUZZQ4R / chunk-ENJZ2VHE` | — |
| 动态 import（`__vite__mapDeps`） | shiki 语法包 ×190+、office worker、pdfjs | F14 |

---

## 4. 未归属行范围

**无残余**：213,695 行 = 族归属 151,433 行（70.86%）+ 横切层/库/构建元数据 62,262 行（29.14%），合计 100%。

说明两条记账约定：
1. **双归属**：横切层（stores/原语/库）与其所在族范围有 12,651 行重叠（如 `VO` DropdownMenu 47926–48040 同时落在 F19 范围与 X03 原语块；`E6/k6` 142372–142753 同时是 F01 范围与 store 层）。覆盖率按去重后计算，不重复计。
2. **已抽取占位**：F00（TopBar 族）四段范围已产出 `TopBar.tsx`，后续按族抽取时跳过；其中 `127125–127248`（远程同步）语义属 F10、`128795–129646`（更新窗）语义属 F09，抽取这两族的剩余部分时直接引用已还原组件。

建议的残余处理：X08–X14 七个 vendored 库块（合计 ~52,000 行）在重建时以 npm 依赖整体替换，不做逐行还原。

---

## 5. 覆盖率与汇报摘要

- **族数**：21（20 新 + 1 已完成 TopBar）；横切层 8 类（stores 20 个 slice / services / i18n / Radix+cmdk / 图标 184 个 / testid（外部）/ 工具块 / vendored 库 9 个）。
- **覆盖率**：100%（族 70.86% + 横切 29.14%，去重后 213,695/213,695 行全部归属）。
- **P0 族根组件清单**（混淆名 → 语义名，js / jsx 双行号）：
  1. `rVt` Sidebar — js 159137 / jsx 132075
  2. `hit`（memo `git`）Home 草稿/会话历史视图 — js 90180 / jsx 78144
  3. `R0` ConversationPane — js 119219 / jsx 101388
  4. `xqt` SidePanel — js 182519 / jsx 147333
  5. `Rje` QuickPick/命令中心 — js 36439 / jsx 33404
  6. `j9` SettingsView — js 204878 / jsx 163283
  （P0 基础设施：`yJt` WorkspaceShell js 183896 / jsx 148387，`XJt` 工作区根 js 186219 / jsx 150098）
- **抽取顺序建议**：F07（壳/分屏，其余族的装配环境）→ F02+F08（Home+Composer，改造第一触点）→ F03 → F01 → F04 → F06 → ~~F05~~（已完成）；P1/P2 按需。
