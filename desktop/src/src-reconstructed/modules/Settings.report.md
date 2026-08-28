# Settings 模块抽取报告（设置视图族 · D8 Stage B）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/Settings.tsx`（5,419 行）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 规格：`/home/none/grok-build/web/docs/zcode-uiux-spec.md` §9、`/home/none/grok-build/web/docs/zcode-feature-inventory.md` §K
- 地图：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/MODULE-MAP.md` F06
- 标样：`TopBar.tsx` / `TopBar.report.md`（行号口径、接口级叶子、验证流程均沿用试点方法）

---

## 0. 行号口径

与 MODULE-MAP/TopBar 报告一致：所有范围以 **输入 .js** 为准（闭区间）；根组件与关键符号附 **jsx 双行号**。
本次锚点逐条命中：`j9` js **204878** / jsx **163283**（任务给定 ≈204878 ✅）、`K2t` js **203935** / jsx **162621** ✅。
抽样双向核对（方法同 TopBar 试点）：j9 props 解构、`grid-cols-[64px_minmax(0,1fr)]` 布局类、
`settings.httpProxy` 行（jsx 162904）在两文件各自定位一致。`out/` 未做任何修改。

---

## 1. 抽取的组件清单（混淆名 → 语义名 → 行号范围）

### 1.1 完整还原进 Settings.tsx

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `j9` | `SettingsView` | 204878–205679 | 163283 | 根：`grid-cols-[64px_1fr] lg:[264px_1fr]` 两栏；左段列表（返回/分组导航/onboarding/页脚）+ 右栏行式内容 |
| `K2t` | `SETTINGS_SECTION_REGISTRY` | 203935–203961 | 162621 | 14 分区注册表（`.filter(ew)` 隐藏 automations） |
| `G2t` | `SETTINGS_SIDEBAR_GROUPS` | 203930–203934 | 162611 | basics/agentCapabilities/dataAndStats 3 组 |
| `q2t` | `SETTINGS_GROUPED_SECTIONS` | 203962–203963 | 162693 | 分组×分区装配（空组剔除） |
| `o4t` | `SettingsSidebarItem` | 204846–204877 | 163271 | 分区按钮（Tooltip 右出、激活 `bg-surface-hover`、<lg 收为 40px 图标） |
| `H2t` | `SettingsCaptionLogo` | 203818–203828 | 162542 | Win 左上 logo 拖拽条 |
| `X2t` | `GeneralSettingsSection` | 203966–204527 | 162699 | 通用分区 24 行（含 HTTP 代理×3） |
| `Z2t` | `GeneralSettingsTitleChips` | 204528–204534 | 163078 | 标题下语言 chip |
| `Q2t` | `PixelNumberInput` | 204535–204565 | 163088 | px 数字输入（12–20 钳制、回车/失焦提交） |
| `$2t` | `AppearanceSettingsSection` | 204566–204775 | 163104 | 外观：主题模式/UI 字号/代码主题/行号/换行/字号 + 亮暗双预览卡 |
| `E2t` | `MemorySettingsSection` | 202650–202837 | 161844 | 记忆开关 + 查看器（请求序号防竞态、滚动位置保持） |
| `w2t` | `ProjectMemoryViewer` | 202420–202643 | 161768 | 查看器三级：项目→文件→预览 |
| `C2t/x2t/S2t/y2t/b2t` | 记忆相对时间助手 | 202372–202419 | 161724 | 刚刚/分钟/今天/昨天/周几/日期 |
| `T2t/T9` | `errorMessageOf`/`hasErrorCode` | 202644–202649 | 161838 | 错误码映射（含 5MiB 限制） |
| `G$t` | `McpSettingsSection` | 194645–195889 | 156627 | MCP：工具条/搜索/本地+插件分组/表单-JSON 编辑器/导入/远程同步 + OAuth 轮询效果链 |
| `KQt` | `McpServerList` | 192956–193013 | — | 服务器列表/空态（行件 `GQt` 接口级） |
| `U$t` | `McpEditorModeTabs` | 194480–194502 | — | form\|JSON 切换 |
| `h2t` | `IndexingSettingsSection` | 202286–202336 | 161628 | 索引：仓库快照/即时 grep 两开关 |
| `O2t` | `BrowserSettingsSection` | 202904–203128 | 162015 | Browser Use 开关 + Chrome 导入 + 清缓存/清全部（确认对话框） |
| `D2t` | `resolveBrowserImportResultMessage` | 202839–202887 | — | 12 种 Chrome 导入错误映射 |
| `D9` | `PendingOperationButton` | 202889–202903 | — | 带 spinner 操作按钮 |
| `U2t` | `DataBaseDirControl` | 203829–203923 | 162548 | 数据目录（浏览/保存/重启提示/安装目录禁写） |
| `e4t` | `UsageSectionTabBar` | 204779–204812 | 163206 | 用量 app\|codingPlan 标签 |
| `t4t/A9/n4t/r4t/i4t/a4t` | Coding Plan 标签助手 | 204813–204845 | — | id 编解码/团队计划判定/标签/源构造/快照可用性 |
| `M7` | `BackLinkButton` | 193045–193056 | — | ← 返回链接按钮 |
| `j7` | `ResourceGroupHeader` | 193014–193044 | — | 分组头（标题+计数+提示） |
| `B3/V3/U3/W3/EMt` | Card/Content/**Row**/SectionCard/Chip | 135212–135380 | 113713–113818 | 右栏行式骨架：`grid-cols-[minmax(0,1fr)_192px]` |
| `wMt/TMt/DMt` | CodeThemeSelect/PreviewCard/标签 | 135262–135333/135278/135376 | 113751/113770 | 10 主题下拉 + 亮暗预览卡 |
| `hC/gC/_C/vC` | Tabs 原语族 | 36949–36991 | — | `data-slot=tabs*`（MODULE-MAP §2.4 登记的「小件原语」实为 Tabs） |
| `DC` | `Switch` | 37297–37315 | — | Radix Switch 封装（类名逐字） |
| `iO/aO/oO/sO/cO` | Select 原语族 | 46009–46104 | — | 触发器 cva `zRe`（45987）分支已展开 |
| `$4…o3` | AlertDialog 原语族 | 131966–132035 | — | 清全部确认对话框用 |
| `S9/w9` | Alert/AlertDescription | 202338–202378 | — | 记忆错误提示 |
| 导航状态机 | `$C/ew/tw/rw/UMe/KMe/sw/qMe/cw/ow` + 键 | 39251–39405 | — | 分区持久化 `zcode-settings-last-section` + sessionStorage 意图 + `zcode:settings-section-intent` 事件 |
| `TO/sze/EO/lo/xo` | 代码主题数据 | 47276–47303/1040/1103 | — | 10 主题/示例代码/解析/缺省 |
| `O9/k9` | caption 缺省宽度/规范化 | 204776–204778 | — | 136px 三键 |

### 1.2 接口级叶子（保留 props 接口 + 行号，未逐行展开 JSX）

| 混淆名 | 语义名 | js 行 | 原因 |
|---|---|---|---|
| `FQt` | ModelProviderSettingsSection | 191784–194644（jsx 154557） | ~2,860 行；供应商卡/连接方式/模型 CRUD/测速，主体在 F12 族 |
| `y1t` | SkillsSettingsSection | 195992–197541（jsx 157604） | ~1,550 行；三域技能列表/诊断/详情面板 |
| `d6` | AutomationsMain | 138823–139924（jsx 115911） | F15 族根（~1,100 行），本族仅消费 |
| `I0t` | PluginsSettingsSection | 199994 | 插件市场浏览 |
| `H1t` | SubagentsSettingsSection | 197542 | 子代理 profile |
| `G0t/p2t` | Commands/HooksSettingsSection | 200852/202032 | 命令/Hooks 管理（stores `F6` 142754 / `Z0t` 201244） |
| `V2t` | MigrationSettingsSection | 203587 | Claude 历史导入 |
| `p1t` | UsageSettingsSection | 195890 | 用量仪表盘（数据层 `nge` 23920） |
| `HQt/_$t/W$t/GQt` | MCP 编辑器/导入对话框/插件列表/服务器行 | 192533/193344/194503/192850 附近 | 表单/18 种外部 agent 导入 |
| `U8` | MemoryFilePreview | 160323 | 属 F14 代码查看族 |
| `gk` | CodeBlock | 48634 | 属 F19 Markdown 族 |
| `l4/tkt/S6/U6/SRt/c4/s4/ROt/r4` | 壳/caption/帮助/页脚/远程同步 | 129647/129992/141854/143345/150435/129507–129515/127248 | 已随 TopBar 族抽取，直接引用 |

---

## 2. 设置项清单（43 key → 控件 → 行号，对照规格 §9）

规格 §9 原文：「左段列表（`settings.*`）：通用(语言/主题/缩放)、模型供应商、MCP 服务器、HTTP 代理、
记忆查看器（5MiB 预览限制等）、自动化、技能、关于/更新。右栏行式（label+control）。」

**行式设置项共 43 个**（`U3` SettingsRow 或等价控件各占 1 key；行号均指输入 .js）：

### 2.1 通用分区（X2t，24 项）

| # | i18n key | 控件 | js 行 |
|---|---|---|---|
| 1 | `settings.locale` | Select（system/zh-CN/en-US，w-260） | 204091 |
| 2 | `settings.terminalProfile` | Switch | 204129 |
| 3 | `settings.terminalFontFamily` | Input(font-mono)+保存按钮，回车提交 | 204139 |
| 4 | `settings.integratedTerminalShell` | Select（auto+系统 shell；仅 win32） | 204163 |
| 5 | `settings.nativeSearchEnhancements` | Switch（testid `settings-native-search-switch`） | 204194 |
| 6 | `settings.httpProxy` | Input(font-mono)+保存按钮，回车提交，保存 toast | 204210 |
| 7 | `settings.httpProxyNoProxy` | Input+保存（逗号分隔规范化） | 204233 |
| 8 | `settings.httpProxyCaCertPath` | Input+保存 | 204256 |
| 9 | `settings.desktopChromiumHardwareAcceleration` | Switch（仅桌面，保存 toast） | 204286 |
| 10 | `settings.receivePreviewUpdates` | Switch（仅桌面） | 204301 |
| 11 | `settings.autoDownloadAndInstallUpdates` | Switch（仅桌面） | 204314 |
| 12 | `settings.notification` | Switch | 204332 |
| 13 | `settings.notificationSound` | Switch（依赖 #12） | 204337 |
| 14 | `settings.closeToTrayOnWindows` | Switch（仅 Win；同步 `syncAppSettings`） | 204343 |
| 15 | `settings.keepAwakeWhileRunning` | Switch（仅桌面） | 204355 |
| 16 | `settings.zcodeInteractionBehavior` | Select（queue/guide） | 204371 |
| 17 | `settings.askUserQuestionAutoResolution` | Switch（testid `…auto-resolution-switch`） | 204402 |
| 18 | `settings.messageStreamShowReasoning` | Switch | 204416 |
| 19 | `settings.messageStreamShowTodos` | Switch | 204427 |
| 20 | `settings.taskAutoArchive` | Switch | 204442 |
| 21 | `settings.taskAutoArchiveDays` | Select（3/7/14/30；依赖 #20） | 204452 |
| 22 | `settings.dataBaseDir` | DataBaseDirControl（只读输入+浏览+保存+重启提示） | 204487 |
| 23 | `settings.onboarding` | Button（打开引导向导） | 204499 |
| 24 | `settings.optimizeAgentExperience` | Switch | 204512 |

### 2.2 外观分区（$2t，7 项）

| # | i18n key | 控件 | js 行 |
|---|---|---|---|
| 25 | `settings.themeMode` | Select（system/zai-dark/zai-light，带图标） | 204599 |
| 26 | `settings.uiFontSize` | PixelNumberInput（12–20px） | 204632 |
| 27 | `settings.lightTheme` | CodeThemeSelect（10 主题） | 204675 |
| 28 | `settings.darkTheme` | CodeThemeSelect | 204683 |
| 29 | `settings.showLineNumbers` | Switch | 204691 |
| 30 | `settings.wrapLongLines` | Switch | 204699 |
| 31 | `settings.fontSize` | PixelNumberInput（12–20px） | 204707 |

### 2.3 记忆分区（E2t，1 项 + 查看器）

| # | i18n key | 控件 | js 行 |
|---|---|---|---|
| 32 | `settings.memory.workspaceMemory` | Switch（testid `settings-memory-switch`） | 202795 |

查看器（`w2t` 202420）：项目列表（`settings-memory-workspace`）→ 文件列表（`settings-memory-file`）→
预览（`settings-memory-preview`，`U8` 渲染）；刷新（`settings-memory-refresh`）、返回
（`settings-memory-back-projects/memories`）；**5MiB 预览限制**由服务端错误码
`PROJECT_MEMORY_PREVIEW_LIMIT_EXCEEDED` → `settings.memory.viewer.fileTooLarge`（202685），
另有 `ENOENT`→fileDeleted、`PROJECT_MEMORY_FILE_CHANGED`→fileChanged。

### 2.4 索引分区（h2t，2 项）

| # | i18n key | 控件 | js 行 |
|---|---|---|---|
| 33 | `settings.indexing.repoTitle` | Switch（`repoSnapshotIndexingUserConfigured` 同写） | 202300 |
| 34 | `settings.indexing.instantGrepTitle` | Switch | 202310 |

### 2.5 浏览器分区（O2t，4 项）

| # | i18n key | 控件 | js 行 |
|---|---|---|---|
| 35 | `settings.browser.control.title` | Switch（Browser Use 插件 `browser-use@zcode-plugins-official`） | 203011 |
| 36 | `settings.browser.import.title` | PendingOperationButton（Chrome 导入；仅非 Win 显示） | 203044 |
| 37 | `settings.browser.clearCache.title` | PendingOperationButton | 203061 |
| 38 | `settings.browser.clearAll.title` | PendingOperationButton(destructive)+AlertDialog 确认 | 203072 |

### 2.6 MCP 分区工具条（G$t，3 项；分区本体为管理器而非行式）

| # | i18n key | 控件 | js 行 |
|---|---|---|---|
| 39 | `settings.mcp.create.open` | 图标按钮 plus（进编辑器） | 195032 |
| 40 | `settings.mcp.import.open` | 图标按钮 download（外部 agent 导入） | 195045 |
| 41 | `settings.mcp.remoteSync.open` | 图标按钮 cloud-upload（仅远程会话） | 195057 |

（另有搜索框 `settings.mcp.searchPlaceholder` 195081、分组 `settings.mcp.group.local/plugin`、
空态 `settings.mcp.emptyTitle/emptyDescription`、远程上下文 `settings.mcp.remoteContext`。）

### 2.7 用量标签（e4t，2 项）

| # | i18n key | 控件 | js 行 |
|---|---|---|---|
| 42 | `settings.usage.tab.appUsage` | TabsTrigger（line 变体） | 204781 |
| 43 | `settings.usage.tab.codingPlan` | TabsTrigger（每订阅源一个，`codingPlan:<id>`） | 204785 |

### 2.8 与规格 §9 八段的逐条对照

| 规格 §9 条目 | 代码落点 | 结论 |
|---|---|---|
| 通用(语言/主题/缩放) | 语言=通用 #1；主题/缩放=外观 #25/#26（规格把「主题/缩放」记在通用名下，实际在 appearance 分区） | ✅（细化） |
| 模型供应商 | `modelProvider` 分区（`FQt` 191784，接口级） | ✅ |
| MCP 服务器 | `mcp` 分区（`G$t` 194645 完整） | ✅ |
| HTTP 代理 | 通用 #6/#7/#8（地址/不走代理/CA 证书；保存 toast `settings.httpProxySavedHint`） | ✅ |
| 记忆查看器（5MiB 预览限制等） | `memory` 分区（`E2t`+`w2t` 完整；5MiB 限制 = `PROJECT_MEMORY_PREVIEW_LIMIT_EXCEEDED`→fileTooLarge） | ✅ |
| 自动化 | `automations` 分区：**注册表登记但被门控隐藏**（`VMe=new Set(['automations'])` 39256，`K2t.filter(ew)` 剔除；渲染分支 `d6` 保留 205637，意图/深链接仍可进入；带 `settings.automations.betaBadge` 徽章） | ✅（3.7.6 侧栏不可见，重要差异） |
| 技能 | `skills` 分区（`y1t` 195992，接口级） | ✅ |
| 关于/更新 | **无独立分区**，由三处承载：① 通用 #10/#11（预览更新/自动下载安装）+ #9 硬件加速；② `S6` 应用菜单「关于/检查更新」（`oi.ShowAbout`/`oi.CheckForUpdates`，js 141993/141997，已随 TopBar 族抽取）；③ 更新状态窗（`COt/POt` 128795–129295，TopBar 族） | ✅（细化） |

左段列表实测 3 组 × 13 可见分区（`q2t`）：basics=general/appearance/modelProvider/browser、
agentCapabilities=memory/plugins/skills/subagents/mcp/commands/hooks、dataAndStats=indexing/usage；
另有一条虚线 `settings.onboarding` 入口（rocket 图标，205402）。
右栏行式骨架 `U3`：`grid-cols-[minmax(0,1fr)_192px]`（label+desc | control）+ 可选 detail 行（135334）。

---

## 3. 边界判定依据

1. **函数体边界**：压缩版每语句一行，`function j9({` 起至下一顶层声明 `function s4t`（205679）前；
   其余组件同理（§1 行号范围）。`var` 声明链（`W2t/G2t/K2t/q2t/J2t/Y2t`，203925–203965）按链成员切分。
2. **闭包追踪**：从 j9 的 JSX 引用递归收集局部符号，终点三类：本 chunk 顶层定义（继续追）、
   文件头 import 块别名（外部依赖）、叶子 UI（接口级）。新增定位：`u`=useSelectDirectory
   （imeComposition chunk `N` 导出 → 内部 `ue` 10883：`platformService.selectDirectory()`）。
3. **分区渲染分派**：j9 内 15 路三元链（205506–205672）与注册表 14 id + `migration` 一一对应，无遗漏。
4. **门控发现**：`VMe`（39256）使 `automations` 在侧栏不可见——规格 §9 列有「自动化」，
   属真实行为差异而非抽取遗漏（渲染分支仍在，报告 §2.8 已标注）。
5. **testid 反查**：15 个 testid 常量经 styles chunk 导入表 → src-HCld2afU.js 导出表
   （9662–10024）→ 字符串定义（8322–8342）三级反查，全部落实值（§1.4 头部映射表）。
6. **排除项**：`s4t`（205679 onboarding SVG）、`b4t`（205826 API key 登录，F18）、
   `I2t`（203140 浏览器数据清理对话框，属浏览器分区深层叶子）不在本次范围。

## 4. 外部依赖清单（跨 chunk）

| # | chunk | 提供的符号 |
|---|---|---|
| 1 | react / jsx-runtime | React、jsx |
| 2 | utils-CEEH0K_K.js | `cn()`（`Z`） |
| 3 | button-laUijeDG.js | Button（`X`）、createLucideIcon（`Sa`）、chevron-right（`wa`=o）、cva（`Ta`=r） |
| 4 | IntlProvider-C321H7m8.js | useIntlContext（`G`）→ {intl, locale, localePreference, setLocalePreference} |
| 5 | imeComposition-DEYFkwWm.js | usePlatformService（`l`=M）、toast（`m`=_）、Input（`P`=y）、spinner（`M`=w）、useSelectDirectory（`u`=N） |
| 6 | usageStatsUiParts-CiR7YEhh.js | Tooltip（`Ia`=u） |
| 7 | logger-PFDwl5Yq.js | logger（`J`） |
| 8 | skillStore-BmeKHDBI.js | zustand create（`Ae`）、useTaskStore（`xe`）、useSkillsStore（`Ne`）、供应商 id 枚举（`q`=mo） |
| 9 | src-HCld2afU.js | 15 个 testid 常量 + 模板 `qr`（`Xa`=Nb） |
| 10 | 本 chunk 横切 | stores：`ko` 应用偏好（1296）、`pc` 工作区标签（4753）、`Ug` MCP（25007）、`B6` 插件（142985）；钩子：`JM` 应用设置（53440）、`qq` 供应商（78195）、`$j` 订阅快照（52449）、`TY` BigModel 产品（83697）、`fX` 升级入口（89052）；服务 context `fs`（2638）/`Ec`（4897） |
| 11 | 已抽取族组件 | TopBar.tsx：S6/U6/c4/s4/ROt/r4；壳族：l4/tkt；侧栏族：SRt |

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| j9 壳布局、左段导航、分区分派、行式原语（B3/V3/U3/W3/EMt）、通用/外观全 31 行、记忆开关+查看器三级、索引、浏览器、MCP 工具条/列表/编辑器容器、e4t、导航状态机、Coding Plan 助手 | **高（逐字转录）** | 类名/i18n key/testid/分支条件直读压缩源码，未做改动；关键处经 jsx 双向核对 |
| MCP OAuth 轮询效果链（194795–194916 六段效果） | **高** | 逐段转录；依赖的纯助手（`P$t/F$t/I$t/M$t/N$t` 等）接口级声明，行为注释标注原行号 |
| TS props/服务接口类型 | **中高（推断）** | 由解构默认值与调用面归纳；`AppSettingsSnapshot`/`RendererSettingsSnapshot` 字段取自实际读写点，真实接口可能有冗余字段 |
| `FQt/y1t/d6/I0t/H1t/G0t/p2t/V2t/p1t/HQt/_$t/W$t/GQt/U8/gk` | **中（接口级）** | 体量大且与本族弱耦合，保留 props + 行为注释 + 行号，可按 TopBar 方法二批补全 |
| testid 值、图标名、存储键 | **高** | 三级反查（导入表→导出表→字符串）逐条落实 |

## 6. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`（web/node_modules/.bin）：**0 错误**（143.8kb 输出）。
- `tsc --noEmit --strict --jsx react-jsx --skipLibCheck`（@types/react 环境，临时副本于
  `/home/none/grok-build/web/.tmp-settings-check/`，验证后已清理）：**0 错误**。
- `out/` 目录未做任何修改（只读访问；git 检查无 out/ 变更）。
- 过程中修复 3 处类型问题：注册表 `.filter` 的字面量拓宽（拆分 `SETTINGS_SECTION_REGISTRY_ALL`）、
  `BaseServices.mcpSyncService` 缺字段、文档注释中 `*/` 提前闭合（`scope.*` 改写）。

## 7. 后续建议

1. 二批抽取接口级叶子：优先 `FQt`（模型供应商，改造高频）与 `y1t`（技能），方法同本次。
2. 规格 §9 建议补注：① 「自动化」在 3.7.6 被 `VMe` 门控隐藏（注册表保留、意图可达）；
   ② 「关于/更新」无独立分区，落点为通用更新行 + S6 菜单 + 更新窗；③ 主题/缩放在 appearance 分区。
3. MODULE-MAP §2.4「小件原语 36949–36991 = hC Separator、gC Badge」应更正为 **Tabs 原语族**
   （`data-slot=tabs/tabs-list/tabs-trigger/tabs-content`）。
4. MCP 助手群（192533–194644 内 `HQt/_$t/GQt` 及 `P$t` 等 16 个纯函数）可在 MCP 专项批次补全。
