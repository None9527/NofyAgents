# 活壳度量账（ZCode 3.11.2，CDP 运行时取数）

取数日期 2026-09-10。方法：给 ZCode 加 `--remote-debugging-port` 重启（用户空闲时、
profile 不动），用 `apps/desktop/scripts/cdp-dump.ts`（零依赖，Node 全局 WebSocket）
经 CDP 取 **盒模型 + computed style + :root 变量解析值 + @keyframes**。
对 ZCode 只读：不点编辑/删除/发送类控件；取数只走 DOM/CSS/Runtime 三个域；
不取任何文本内容（节点只记 textLen），会话标题/路径不入库。

证据件：
- `zcode-live-vars.json` —— :root 528 个自定义属性的**解析值**（theme=dark theme-zai-dark platform-mac-desktop）
- `zcode-live-outline.json` —— 工作区壳的 DOM 结构 + 盒模型（60 节点，无文本）

## 0. 为什么运行时而不是 bundle / source map

| 来源 | 给什么 | 缺什么 |
|---|---|---|
| bundle CSS（已提取成 ui/tokens.css） | 作者写的值、@layer 级联链 | 解析后的最终值、状态态 |
| 逆向树类常量（QuickPick.tsx 等） | 作者写的 utility 类（含 hover/selected 变体） | 真实盒模型、字体回退后的行高 |
| **CDP 运行时** | 级联最终值 + 盒模型 + 可达状态的实测 | 作者意图（哪个值来自哪个令牌） |

⇒ 三者互补：bundle/逆向树用来**写**，运行时用来**验**。source map 确实不需要。

## 1. 大布局改正表（本轮最重要的产出）

我们原先的「grid：全宽顶栏行 + 状态栏行」是 3.7.6 逆向词的误读。活壳 3.11.2 实测：

| 结构 | 活壳实测（盒模型） | 我们改正后（同法自量） | 状态 |
|---|---|---|---|
| 整窗 | `flex h-dvh flex-col bg-background-alt`，**无顶栏行/状态栏行** | `.shell` flex row + background-alt | ✅ 已改 |
| 侧栏宽 | `w-[var(--workspace-sidebar-panel-width)]` = **264px**，max-w-50% | 同变量，默认 264，可拖 200–480 并持久化 | ✅ 已改（原 232） |
| 侧栏顶 | h-12 拖拽区；红绿灯旁按钮是**绝对叠层** h-14 z-20，首按钮 x=96 | `.sidebar__drag` 48px + `.sidebar__overlay` 56px，让位 96px | ✅ 已改 |
| 分隔条 | `group/handle` 1px、z-10、可拖 | `.shell__handle` 命中 4px/视觉贴边，pointer-capture 拖拽 | ✅ 已改（原无） |
| 主列 | `min-w-[320px] flex-1 p-1 pl-0 pt-0` | **用户裁定通栏**：padding 0（去右/下 4px 内缩缝） | ⚠️ 有意偏离活壳 |
| 主列顶 | h-1 拖拽条 | `.shell__dragstrip` 4px | ✅ 已改 |
| 对话区 | **卡片**：`rounded-xl border bg-background`，内缩 4px | **用户裁定（2026-09-11）**：`.card` 去 border/radius，通栏 | ⚠️ 有意偏离活壳（内嵌框不必要） |
| 卡片头 | h-12、`p-2 pl-4`、右簇 28×28 gap-0.5 | `.card__head` 48px、pad 0 8 0 16 | ✅ 已改 |
| 图标按钮 | **28×28**、图标 16 | `.iconbtn` 28×28 | ✅ 已改（原 32） |
| 辅助 pane | 在**卡片内部**右侧；收起 = 1px border-l + opacity-0 | `.card__body` 行内 + `.aux__sliver` | ✅ 已改（原 shell 第三列） |
| 状态栏 | **不存在** | 整窗无状态栏行 | ✅ 已改 |
| 侧栏页脚 | h-56 px-4 pt-2 pb-4；账号卡 32 高 + 32×32 齿轮 | .sidebar__foot = 诊断卡（账号卡槽位）+ 设置齿轮 | ✅ 已改 |

## 1.1 槽位改正表（2026-09-10 第二轮：用户指正「右上角不是 theme 切换」）

上一轮把**主题/设置/诊断**塞进了卡片头右簇，把**新建任务**从侧栏动作区删掉——
都是看错槽位。本轮对活壳逐个 aria-label 取数后改正：

| 槽位 | 活壳实测（aria-label + lucide 名 + 盒模型） | 我们的落点 |
|---|---|---|
| 卡片头右簇（3×28，gap 2） | 帮助 circle-question-mark / 切换终端 square-terminal / 展开·收起侧边面板 panel-right-open 或 close | CardHeader 右簇同序同规格；终端未接线置灰 |
| 卡片头左（会话态） | h1[workspace-title] semibold truncate + 路径胶囊 rounded-full bg-tag/50（folder + 末段名，高 29）+ ⋯ 更多 28×28 | CardHeader 左簇同构；⋯ 先放只读会话信息（写路径未实测） |
| 卡片头左（空态） | **空**（h1 不渲染，容器高 0） | 照做：不编假标题 |
| 侧栏叠层（y=16，x=96 起 pitch 32） | 切换侧边栏 panel-left-close 或 open / 后退 arrow-left / 前进 arrow-right / 新建任务 message-circle-plus | Sidebar 叠层四枚；后退/前进 = 会话激活历史栈（navhistory.ts） |
| 侧栏动作区（四行 248×32） | 新建任务 / 搜索 / 自动化 / 插件市场；**新建任务行是 DIV 不是 BUTTON**（选择器只查 button 会漏）；行内快捷键是淡色小字不是 kbd 芯片 | 四行同序；hint 用 .navrow__hint 淡色小字 |
| 侧栏 tabs 行（h-28） | 分组 hash 与 项目 folder（55×24 + 滑动胶囊 bg-background）；右侧 24×24：展开全部 maximize-2 紧贴 tabs、筛选和排序 list-filter 与归档 archive 靠右 | Sidebar 同构；分组 = 扁平最近列表、项目 = 按工作区分组 |
| 侧栏列表 | 分区头 h-28（chevron + 名 + grip + plus）→ 项目行 248×32（house/folder/cloud + 名）→ 嵌套任务行（状态点 16 + 标题 + 右侧时间芯片「57分/1小时/6天」） | sidebarModel.ts 折出 projects/flat；house 标**本窗口工作区** |
| 分组视图 | 扁平行（外 248×32 py-px、内 h-7），无分区头；「定时任务」是内嵌分区（hash + 计数徽标） | flat 列表已落；定时任务分区随自动化面接 |
| 侧栏页脚 | 账号卡 154×32 + 移动端远控 32×32 + **设置 settings 32×32**（主题住在设置里） | 诊断卡（账号卡槽位）+ 齿轮菜单（主题四档 + 设置面灰） |

## 1.2 像素对账（我们 vs 活壳，同法自量，2026-09-10）

方法：给我们的实例加 NOFY_DEBUG_PORT=9444，用 cdp-dump 的 eval 模式量同一批
选择器的盒模型，与 §1/§1.1 的活壳数逐行比。**全部相等**：

| 构件 | 活壳 | 我们 |
|---|---|---|
| 叠层四枚 | [96,16,28,28] [128,16] [160,16] [192,16] | 同 |
| 动作区四行 | [8,60,248,32] [8,96] [8,132] [8,168] | 同 |
| tabs | [12,214,55,24] [67,214,55,24] | 同 |
| tabs 右侧三枚 | [128,214,24,24] [200,214] [228,214] | 同 |
| 分区头 | [8,252,248,28] | 同 |
| 项目行 | [8,280,248,32] | 同 |
| 任务行（内） | [9,318,246,28] | 同 |
| 卡片头 | [266,5,W,48]，左簇标题 x=282、胶囊高 29、⋯ 28×28；右簇 3×28 gap 2 贴右 8 | 同（W 随窗宽） |
| 页脚 | 左卡 32 高 x=16、右齿轮 [216,·,32,32] | 同 |

对账中修掉的四处度量差：叠层按钮 y 14→16（活壳不是 h-14 垂直居中）、tab 宽 48→55、
展开全部从靠右改到紧贴 tabs、页脚左卡 42→32（触发器自带内边距撑高了）。

## 1.3 这一轮的方法论教训

1. **选择器偏差会伪装成「活壳没有」**：新建任务行是 DIV，我按 button 查询就没看见它，
   于是得出「动作区三行」的错误结论并删了自己的第四行。取数要按**区域**取（某 y 带内
   的所有元素），不要按**标签**取。
2. **aria-label 是槽位的真相**：类名会被 minify、会被猜错，aria-label 是作者写给读屏的
   语义，直接回答「这枚按钮是干什么的」。本轮右簇三枚、叠层四枚、页脚三枚全靠它定名。
3. **状态要切到再量**：卡片头左半在空态是空的、会话态才有标题+胶囊+⋯；tabs 的第二档
  要真点过去（Radix 的 trigger 吃 pointerdown，合成 click 不生效）才看得见分组视图。

## 1.6 终端 dock 解剖（2026-09-11，阶段 B 取数 + 三轮实测）

## 1.7 侧栏 + dock 打磨轮解剖（2026-09-11，像素门差表）

本轮把活壳侧栏与 dock 的构件逐个量了 computed 值，与我们逐项对账后改正。表里「活壳」列全是
本轮 CDP 实测（不是旧文档转述），「改正」列是落到我们代码里的动作。

| 构件 | 活壳实测 | 我们原先 | 改正 |
|---|---|---|---|
| 动作行（新建任务/搜索/自动化/插件市场） | h-32、rounded-lg(8)、px-10、gap-8、行内 **fs14**、hover 底 | fs12、radius 6 | fs14、radius 8 |
| 列表视图 segment | 容器 h-28 pad2 **自带 5% 白底**；tab 55×24 **fs12 fw500** pad 0/8/0/6；**活动 tab 无底色**，只靠文字色 subtle→full | 容器无底 + 滑动胶囊 | 删胶囊；容器底 = 我们的 --color-surface（暗=5% 白，见下令牌注）；tab fs12 fw500 |
| 区段头（项目） | **纯小标题**；工具钮（移动/添加 24×24）在 x=202/226 **悬停才现**；无计数 | chevron+名+计数+常驻工具钮 | 去计数；工具钮 opacity 0→hover 1；标题降为 fs12 淡色 |
| 工作区行 | 右端**无计数/chevron**（只有远端未连的警告+重连）；活动点住在**名字后**（实测 zcodebot 行蓝点） | 计数 + chevron 常驻 | 去计数/chevron；组内有需要注意力的任务时在名字后画点 |
| 任务行 | li h-32 pad 4/4/4/10 br8；**16px 图标槽恒在但平时为空**；标题 flex-1；时间 fs12 subtle 右靠 | 槽里恒画灰点 | 槽恒在、点只在 working/needs_input/dead 时画 |
| 页脚账号位 | 芯片 h-32 pad-right 10、**32 圆头像**+名字 fs14；右侧 32×32 按钮；页脚左右内缩 16 | 8px 状态点 + 名字 fs12 + 版本 | 32 圆底里放状态点；名字 fs14；版本保留 fs12（活壳无版本字，我们留着因为它答「连着哪个内核」） |
| dock 头「终端」标签 | fs14 fw500 全色 | fs10 淡色 | fs14 fw500 全色 |
| dock tab 芯片 | h-[calc(100%-1px)]=27、pad 2/4/2/6、br6、**fs14**；活动底 = rgba(255,255,255,0.1) | h28、pad 0/8、fs10、活动底 --color-tag | 高度/内边距/字号照抄；活动底改 --color-selected（=10% 白，与活壳同值） |

### 令牌映射的一条注（防止下次再对错位）

我们暗色作用域里 --color-surface=5% 白、--color-surface-hover=10% 白、--color-selected=10% 白；
活壳暗色里 segment 容器是 5%、活动芯片是 10%。所以「活壳的 5% 层」对应我们的 **surface**，
「活壳的 10% 层」对应我们的 **selected / surface-hover**。按名字猜（surface-hover≈活壳 surface-hover）
会差一倍透明度——本轮第一版就栽在这里，靠 computed 值对账才发现。

### 页脚溢出（真窗口才看得见）

侧栏窄于 256 时页脚两件套会溢出约 20px：菜单触发器自带 6px 内边距 + 名字不收缩。
已给页脚首件 min-width:0 + 可收缩、触发器在页脚内 padding:0。这类溢出只有真窗口量得到，
静态测试看不见——记在这里作为「像素门必须跑真窗口」的又一个理由。

 ## 1.5 审查 pane 解剖（2026-09-11，阶段 A 取数）
活壳 3.11.2 的终端是**对话列底部的 dock**；卡片头那枚 data-testid="terminal-toggle" 是它的开关。
本轮除了 CDP 量盒模型，还把「终端到底怎么才能用起来」量了三轮（见下「客户端义务」）。

| 构件 | 活壳实测 | 我们的落点 |
|---|---|---|
| 根 section[data-testid=terminal] | flex h-full min-h-0 flex-col gap-2 overflow-hidden bg-background p-3 pb-2（内缩 12/12/8、gap 8、底色 --color-background 暗=#161616） | .dock 同度量；高固定 17.5rem（活壳展开态约 280；它顶边那条 border-t 是**隐藏的拖高手柄** opacity-0 pointer-events-none，本版不做拖高） |
| 头行 | flex shrink-0 items-center gap-2，**h-28** | .dock__head 同 |
| 头行左簇 | flex min-w-0 shrink-0 items-center gap-2：「终端」标签 + **shell 名芯片**（实测显示 "fish"） | 只画「终端」：resolved shell 没有读路径（TerminalInfo 不含 shell；我们不传 create 的 shell 参数 ⇒ 客户端也不知道内核起了谁）。画猜的名字比不画坏 |
| tab 列 | min-w-0 flex-1 overflow-x-auto !scrollbar-hide；tab 名 = **cwd 末段**，重名追加 " 2"（实测 "nofy-build" / "nofy-build 2"） | .dock__tabs 同；nextTabName 同口径（与内核默认同源，pty_session.rs:337-343） |
| 头行右簇 | flex shrink-0 items-center gap-1：新建终端 28×28 + 关闭终端面板 28×28（radius 8） | 同两枚 iconbtn |
| 体 | min-h-0 flex-1 overflow-hidden；每 tab 一片，非活动片 data-[state=inactive]:hidden | .dock__body + .dock__pane：隐藏**不卸载**（scrollback 要留；活壳同行为） |
| xterm | DOM renderer（.xterm-dom-renderer-owner-N）；.xterm-rows **13px** + 终端专用 mono 栈（SF Mono / Cascadia Mono / JetBrains Mono / MesloLGS NF / Hack Nerd Font / Noto Sans Mono CJK SC）；前景 rgb(212,212,212) 是 xterm 默认（活壳没设 theme.foreground） | 同 13px 同栈（常量住 ui/theme.ts）；前景/背景读 dock 根的 computed 值（resolveTerminalPalette），四主题自动跟随，不写死 hex |
| 收起态 | .xterm 仍在 DOM，只是 0×0（dock 根残高 20 = padding） | .dock--closed 只 display:none：组件保持挂载，pty 与其中正在跑的进程继续活 |

我们的实测对账（1280 宽窗口、暗主题）：dock 507×280、padding 12/12/8、gap 8、bg rgb(22,22,22)、
头 28、两枚按钮 28×28、tab 芯片 h-28、体 483×223、.xterm-rows 13px、行高 15 ⇒ 14 行占 210、
余 13px（见下缺陷 2）。与活壳逐项同度量；唯一结构差是活壳多一层 group/tabs（Radix 的结构需要）。

### 三条量出来的客户端义务（都有源码/实测出处，不是猜的）

1. **terminal/list 忽略 sessionId，且混着管道终端**：分派臂直接调全局 list_terminals()
   （extensions/terminal.rs:342-345），而它是 list_ptys() + list_piped_terminals() 的合并
   （nofy-shell-terminal/src/lib.rs:105-110）。管道终端是 agent 跑 bash 工具的非交互终端
   （interactive=false，pty/load 对它回 NotInteractive）⇒ 接管必须按 interactive 过滤，
   否则模型每调一次 bash，dock 就多一个点不进去的假 tab。
2. **pty/load 是第一方的重挂接路径**：重绑通知目标 + 回放 256KiB 输出环形缓冲（:54），
   帧带 isReplay:true（:801-815）；源码写明客户端义务是「reset its VTE emulator and feed all
   bytes from scratch」⇒ 收到 isReplay 先 term.reset() 再写，否则重挂接把历史叠成两份。
   pty-smoke 的 ⑤ 把「回放帧含命令产物」钉成了门（实测回放 @101ms）。
3. **终端必须持续应答能力查询**：fish 4.7.1 在启动时与每次画提示符时都会发查询
   （kitty 键盘 ESC[?u、XTVERSION ESC[>0q、OSC 11、DCS+q、DA1 ESC[0c、CPR ESC[6n）。
   三轮实测：谁都不答 ⇒ 启动等满 10s（带 DA1 超时警告）且提示符处再等 10s 才读输入；
   只答启动那轮 DA1 ⇒ 93ms 出提示符但命令仍等 10s；按 xterm 口径全答
   （DA1/DA2/CPR/OSC 10-12，回复串逐字取自 xterm 6：InputHandler.ts:1672/:1711/:2663、
   CoreBrowserTerminal.ts:217 + XParseColor.ts:77）⇒ 首屏静默 1.1s、命令产物 101ms。
   真 app 里 xterm 自动应答 ⇒ dock 首屏不卡（真机实测 fish+starship 提示符 <1.1s 出现）。

### 更正一条旧账（ecosystem-shapes.json 的 terminal 段）

那里记的「pty/input 未回显」与「shell 早退（exit@2919ms）」**都是误判**：2919ms 正是探针自己
调 terminal/kill 的时刻；没看到回显是因为等待窗口只有 1.2/1.5s，而那 10s 是 fish 在等查询应答。
四种建 pty 变体（显式 bash / 显式 zsh / 默认 $SHELL -l / 无 sessionId）实测全部能回显。
另有一个量法陷阱已写进门注释：**tty 行规程会立刻回显输入**，「看到输入里的标记」不等于
「shell 执行了」——pty-smoke 用 echo <小写> | tr a-z A-Z 断言大写产物来区分这两件事。

### 我们自己的两处视觉缺陷（本轮真窗口发现并修，记在这里防复发）

1. **UA 按钮壳**：全局 reset 只 reset 了 font/color，Chromium UA 给 button 的
   border:2px outset ButtonBorder + ButtonFace 底色，在 aux__tab / dock__tab / dock__tabx /
   chip / sidebar__newbtn / footcard__btn 上全露了出来（真窗口对空白 button 探针量到
   borderTopWidth=2px、backgroundColor=rgb(107,107,107)）。已在全局 reset 补 border:0; background:none。
2. **xterm 视口黑底**：xterm.css:95 写死 .xterm-viewport{background-color:#000}；行数取整后
   pane 底部剩 13px 露出黑杠（截图里 dock 底边一条黑条）。已 .dock .xterm-viewport 透明化，
   让 dock 底色（= 喂给 xterm 的 theme.background）透出来。

## 1.8 侧边面板首屏 + 标签管理弹层解剖（2026-09-11，CDP 实测活壳 3.11.2）

用户给了两张活壳截图（空态首屏 / 标签管理弹层），本轮在活壳上**关一下审查 tab 量空态、
再点审查卡开回**（可逆操作，量完已恢复原状），弹层与 + 菜单直接开合取数。CSS px、暗色。

| 部件 | 活壳实测 | 我们的落点 |
|---|---|---|
| 头行 tabs-list | 548×48（!h-12）、**5% surface 底**、无边线；内 = [p-2 pl-3 触发钮位][flex-1 overflow-x-auto 芯片行 py-2.5 gap-2] | .aux__head 48 高 surface 底；.aux__head-lead / .aux__tabs-scroll / .aux__tabs-row |
| 触发钮（chevrons-down 图标、aria「搜索标签页」） | 28×28 br8、outline 变体：border-border + text-foreground；icon = 双 chevron（m7 6 5 5 5-5 / m7 13 5 5 5-5） | .aux__head .iconbtn  scoped 补边/字色/br8；IconChevronsDown |
| 标签芯片 | flex 1 1 9.75rem + min-w-15 + **max-w-39（=156 宽的来由）**、h28、br8（!rounded-lg 覆盖）、pad 0 6/右 8、gap 6、fs14 fw500；未选中 bg=--side-pane-tab-bg(=background 透明)+subtle 字、hover 出 border+foreground 字；选中 border-border + bg=--color-card(#2b2b2b) + foreground 字；cursor default | .aux__chip / --active；× 20×20 ghost、icon 12、opacity-0 → hover/选中常显（截图里选中芯片的 × 常显） |
| + 新增标签 | 28×28 同 outline 变体；点开 **dropdown**：只列**当前没开**的标签种（实测开审查时给 辅助对话/终端/浏览器），content pad4 br12 popover 底 gap2、item 173×29 pad4/8 br8 fs14 icon15 gap8 | MenuButton variant=icon align=left；items = 未开真标签 + 终端(dock 真动作) + 辅助对话/浏览器灰项 |
| 弹层（搜索标签页） | 288×内容高、br12、bg popover(#2b2b2b)、**1px popover-border**、锚 = 触发钮 left 对齐 / 头行顶 +42；搜索行 p-1 border-b 高 41（input-group 278×32 br6、左 icon 24 宽 subtlest、input fs14 pad-left 6）；滚动区 max-h、scrollbar-hide；段容器 p-1 border-b last:0；段标题 278×37 pad8 fs14 fw500 subtle；行 278×33 pad6/8 gap8 br8（icon 20 槽 subtle + 标签 fs14 fw500 flex-1 truncate + 相对时间 fs14 subtle mr-0.5 + 打开段 × 20×20）；打开段当前标签行 bg 10%、键盘光标行 bg 5% | .aux__switcher*；相对时间复用 palette.formatCompactRelative（刚刚/N分/N小时/N天，与活壳文案逐字同） |
| 首屏（零标签） | 头行**整行不画**；shell bg-background；居中容器 px-5 py-10 overflow-y-auto；content flex-col gap-5 max-w 544；标题 h2 20/28 fw600 foreground「打开标签页」；副题 14/20 subtle「选择要在侧边面板中打开的标签。」；网格 **3 等列 gap-2**；卡 164×88 br12 bg surface(5%)、flex-col center gap6 pad 0 12、icon 16 subtle + 标签 fs14 fw500 truncate；hover 走 150ms 底色过渡；cursor default | .aux__open-*；卡 = 会话活动/审查/文件/终端(真动作=dock 开关) + 辅助对话/浏览器灰卡（title 写明未接线/明确不做） |

### 两条推断值（量不到活壳 computed，出处是类名/截图，记清防冒充实测）

1. **未选中芯片的底色**：活壳只开了一个标签，量不到第二枚芯片的 computed；取类名
   `[--side-pane-tab-bg:var(--color-background)]` + `data-active:[--side-pane-tab-bg:var(--color-card)]`
   的差，即未选中=透明、选中=card。我们实例双芯片截图复核过观感一致。
2. **卡的 hover 底色**：合成 hover 量不到，按令牌族取 surface→surface-hover（5%→10%），
   与弹层行 hover 同档。

### 与活壳的两处刻意差别

1. 首屏卡片我们给 `cursor: pointer`（活壳是 default，疑似漏配）；灰卡 not-allowed。
2. 弹层「最近关闭」是**面板局部态**（useState，关标签时记、重开时销），不进 store——
   活壳那份跨不跨重启未实测，不冒充。

> 更正（同日晚批）：§1.8 首屏卡与 + 菜单里的「会话活动」已按用户裁定**删除**——产品里没有
> 这个设定，子智能体/会话活动属于下面 §1.9 那套体系。首屏卡现为 审查/文件/终端 + 两灰卡；
> roster 读路径保留，只服务侧栏「未加载会话」列表与 session/load。

## 1.9 子智能体显示体系解剖（2026-09-11，逆向树 3.11.2 抓取；活壳无运行中子智能体，未实机复核）

用户裁定：「子智能体的显示和（顶栏汇总/工具卡）图标是一套体系，不是会话活动。」抓取结论——
ZCode 的子智能体有**三个面**，全在同一套图标/汇总体系里，侧边面板没有常驻标签：

| 面 | 逆向树出处 | 形态 |
|---|---|---|
| 会话内工具块 | components/conversation/ConversationToolViews.tsx:862 AgentToolView | 与普通工具卡同族 ToolLayout：icon = IconBot size-4 subtle；kindLabel zh「子智能体」（chat.toolCall.agent.fallback）；名 = fallback name；**调色板色徽** AgentColorBadge（mono fs14 fw500 彩色文字、max-w-36 truncate、title=名）；运行中摘要走子工具卡流式汇总；summaryAction zh「在右侧打开」（chat.toolCall.agent.openInSidePane）→ 侧栏子智能体会话 tab；展开 = ml-2 border-l pl-3.5 space-y-3 的嵌套列：输出文件卡 / 「提示词」块 / Agent thought / Agent output / 子工具调用列表（递归同族） |
| 侧栏面板 tab | modules/SidePanel.tsx:58-59、164-198 | SubagentSessionTab（icon lucide **bot**、title「子智能体」、只读会话 R0）与 SubagentDirectoryTab（icon **list-tree**、title「子智能体目录」、空态「没有正在运行的子智能体」）；由工具块「在右侧打开」或顶栏汇总行点击创建，**不是常驻入口** |
| 顶栏汇总岛 | components/shell/TopBar.tsx:4085 SummaryAgentsSection | 与「更改 +N -M」同壳的 summary section（section="agent"）：收起态 = 最长耗时（startedAt 最大值、1s 一跳）· 运行中计数；展开态按 startedAt 升序列 RunningSubagent 行（行点击开会话/目录、含取消后台工作）；无运行且 ended=0 时整段不画 |

### 调色板与色徽（颜色是「哪个子智能体」的唯一视觉锚）

8 色 palette：yellow red orange green cyan blue purple pink（AgentToolBlocks.tsx:35）。
取色链：工作区/全局 agent 配置的 color → resolveAgentColorHash → hashToAgentPaletteColor(名)
（ShellCommandBlocks.ts:24，t = t*31 + charCode 模 8）。暗色徽章 = 浅色文字档（如 sky-50）配
32% 底；徽章本体是**彩色 mono 文字**不是色块胶囊。

### 对我们产品的落点提案（未实施，等裁定）

1. 脊柱 agent 工具块：我们的 tool-card 族 + IconBot + 调色板色徽 + 嵌套子工具 + 「在右侧打开」；
2. 侧栏面板加两种**按需** tab：子智能体会话（只读）/ 子智能体目录（bot / list-tree 图标位）；
3. 卡片头汇总条加 agent 汇总段（与 DiffChip 同壳），收起态耗时·计数。
   数据前提：内核侧 child tool calls 与 roster 父子关系要先录夹具实测（现 roster 只有
   activity/origin/cwd，见 session-read-shapes.md）。

### 落地批（2026-09-11 晚二批，已实施）：内核线路证据补齐后三面齐做

数据前提后来在**内核源码**里解决了（不是夹具）：
- spawn 工具 wire 名 = `task`（nofy-tools task/mod.rs:40 TASK_TOOL_NAME；is_task_tool_id 另收
  "Task"/"spawn_subagent"），tool_call_update.kind = "task"（ToolKind::Task snake_case）。
- 结果文本带 `<subagent_result>` 页脚：subagent_id / subagent_type / resume 提示 / 可选 persona
  （nofy-tool-types task.rs:421 format_resume_footer 逐字）；结果文本进 UI 走
  tool_call_update.content 的 type=text 项（store 新增 resultText 捕获，夹具实测 content 数组在案）。
- 子会话 id = subagent_id（MVP 同值）⇒ 与 roster 按 sessionId join 得活动态。

我们的落点（与提案的三处差别，都有理由）：
1. 脊柱 AgentCard：IconBot + 「子智能体」+ 8 色色徽（subagent_type 哈希，活壳同算法）+ 状态；
   展开 = 左边线嵌套列（提示词 / 回传 / subagent_id 行）；「在右侧打开」= 目录 tab + 定位展开。
   与活壳差别：我们没有 child tool calls 的线路（ZCode 那层在服务端聚合），嵌套子工具列表不画——
   画了就是猜。
2. 侧栏：单一「子智能体」目录 tab（行 = 色徽 + 描述 + 活动点 + 状态，展开看提示词/回传/id），
   没做活壳的第二种 session tab——只读会话需要 history 读路径（_nofy/session/load_history
   实测 Method not found），等内核给了再补，不画空壳。
3. 卡片头 AgentChip（与 DiffChip 同壳同栈 chipstack）：总数 · 运行中 / 失败；无块不渲染。
   没做顶栏汇总岛——我们的顶栏没有活壳那套 summary stack 壳，硬塞一枚孤芯片是装饰。

另按用户裁定：composer「电脑操作」改为**开启才显示**（未接线 ⇒ 整枚不画）；上下文环常亮更正见 §2 前。

### 真轮次走查（同晚三批）：桌面线路的四个实测更正

用真内核跑了一轮「派 explore 子智能体列目录」，帧级对照后更正四处（都已进 agentModel/投影）：
1. **spawn 完成帧 content 是嵌套 wrapper** {type:"content",content:{type:"text",text}}；扁 text 只有
   diff 族才有。投影 contentTextOf 两形态都收。
2. **spawn 文本是后台派发通知**（Subagent started in background. / subagent_id: / type: /
   description: 三行），不是 <subagent_result> 页脚——页脚是模型面文本，桌面线路只在
   Result.output 里夹带（连同 <subagent_meta> 行），展示前两者都摘（cleanAgentOutput）。
3. **正文输出在轮询帧**：父模型用 get_command_or_subagent_output 轮询，完成帧
   rawOutput = {type:"TaskOutput", Result:{task_id, status, output, duration_secs, …}}；
   join 三路（Result.task_id / 入参 task_ids / 标题短 id），多帧取**质量档最高**者
   （终态 Result > 中间 Result > 仅匹配），中间「still running」帧不得冒充终态。
4. **轮询块折进 agent 卡**（linkedPollBlockIds），脊柱不单独画——活壳把它们当 child tool calls
   折进 agent 视图，我们同纪律；未关联的轮询块仍按普通工具卡画，不静默丢。

走查截图四态：运行中（色徽+运行点+提示词列）、审批卡挡轮次（allow_once 放行）、终态
（回传干净目录列表 + subagent_id · 2.8s）、目录 tab 定位展开。roster 里子会话同步行出现
（侧栏「（无工作区）」行），join 口径成立。

### 后台胶囊批（2026-09-11 晚五批）：右上 / composer 两处胶囊的显示与消失口径

活壳口径（BackgroundWorksCapsule.tsx + TopBar.tsx:4085 SummaryAgentsSection 实证 + 本机活体复现）：
- 子智能体一 **running** 就同时触发右上 SummaryAgentsSection 胶囊与 composer 的
  BackgroundWorksCapsule——**回合内也算**（2026-09-11 活壳实机：v4-stop 在位=父回合仍跑时，
  v4-composer-background-work-trigger 与 data-running-agent-count 已为 1）；
- 子智能体一结束（running→false）两处同时消失（与父回合开/闭无关）；
- composer 胶囊 = bot 图标 × 计数（countBackgroundWorks totalCount=0 即 null）；
  右上 = 「子智能体 N · N 运行中」（chipstack 与 DiffChip 同栈）。

**消失信号（本批关键发现）**：detached 子智能体没有轮询完成帧（父回合已收、不再 poll），
块级 running 永不翻 false ⇒ 胶囊曾永不消失（活体复现 75s+ 不消，即用户报的「没做好」）。
内核的真正终态信号是 **SessionUpdate::SubagentFinished**（extensions/notification.rs，父会话通道，
{subagent_id, child_session_id, status: completed|failed|cancelled, error?, duration_ms, output?…}）。
桌面侧投影进 SessionState.subagentFinished，agentView 的 finished 参据此翻 running/failed/output。
排除的两个假信号：roster 不可用（子会话 summary 被 headless 排除，不进 _nofy/sessions/changed）；
nofy/task_completed 只覆盖 bash/monitor（TaskKind 无 subagent 臂）。

判定函数 = agentModel.runningAgentRows(rows)：所有 running 行（回合内 + detached）。单测五态在
test/agent-model.test.ts；活体截图 /tmp/n-capsule-on.png（running=两处出现）、
/tmp/n-capsule-off.png（结束=两处消失）。早先「仅 detached 才显示」的结论已作废（实机推翻）。

### 形态更正（同晚四批，用户指出「不该展开」）：agent 块 = 单行摘要，不内嵌正文

逆向 ToolLayoutBlocks.ts 的逻辑给了硬依据：`ie = !L && (R || z) ? … : null`——存在
summaryAction（「在右侧打开」）时 ToolLayout **根本不渲染内联内容**；canToggle=false 也去掉
折叠箭头；header 在三态分支里走 summaryAction 支 = 整行 role=button + cursor-pointer，
点击即 onActivate（开右侧 pane）。AgentToolView 正是 canToggle=false + forceOpen=false +
summaryAction 齐备 ⇒ 活壳对话里的子智能体永远是一条摘要行。

我们的 AgentCard 同形态重写：单行 = IconBot + 「子智能体」+ 色徽 + 描述 +（运行中点/芯片 |
状态芯片 + 耗时）；整行可点进侧栏目录（提示词/回传/subagent_id 都在目录行里看）；
删除内嵌 details 列。走查：DOM 无 details、role=button、行文本
「子智能体 | explore | 描述 | completed | 3.1s」，点击落目录 tab 定位展开。

## 1.5 审查 pane 解剖（2026-09-11，阶段 A 取数）
## 1.5 审查 pane 解剖（2026-09-11，阶段 A 取数）

活壳审查 = 侧边面板（卡片内、宽 548）的「审查」tab；面板空态是「打开标签页」四枚
（辅助对话 message-square-text / 审查 file-diff / 终端 square-terminal / 浏览器 globe）。

| 构件 | 活壳实测 | 我们的落点 |
|---|---|---|
| 面板 tab 条 h-48 | 收起 chevrons-down 28×28 + 活动 tab 芯片（file-diff + 名 + x）h-28 + plus 28×28 | AuxPane tab 条（roster/文件/审查） |
| 内容头 h-56 p-3 | 左 = 区段选择器（未暂存，h-32 chevron），右 = 刷新 refresh-cw h-32 | review__head：branch+commit 芯片 + 刷新 |
| 汇总条 | 卡片对话区右上浮 chip rounded-2xl：file-diff + 更改 + +N(diff-added) −M(diff-removed)，h-32 | DiffChip 同位同形（工作区干净不渲染） |
| 文件行 h-32 px-3 gap-3 | 文件类型图标 16（IMG 图集）+ 名 truncate + 目录 truncate（最淡）+ 右靠 +N/−M + chevron（展开转 180） | reviewrow 同度量（图标用自绘 IconFile） |
| 展开体 | shadow-DOM web component diffs-container：gutter 38、代码行 h-20、折叠行 h-32「N unmodified lines」 | 自绘 diffview 同度量（diffModel.ts 解析+折叠；段内折叠可本地展开，gap 折叠灰着说明） |
| 分区 | unstaged / staged 两组 | 同（git/status 的两个数组直出） |

刻意差别：diff 体活壳是第三方 web component（shadow DOM），干净室不取其资产、自绘同度量；
文件类型图标活壳是一组 IMG，我们用单枚自绘 IconFile；活壳的区段选择器还有更多档，
我们没有第三档数据源 ⇒ 两区段直出，不放假下拉。

顺带实测（阶段 B 的入口）：活壳终端 = **底部 dock**（「新建终端」「关闭终端面板」两枚
28×28 在 dock 头右侧），卡片头「切换终端」是它的开关。

## 1.4 composer 工具条解剖（2026-09-10 第三轮）

活壳 .chat-composer-region（会话态实测，region 高 106）：

| 构件 | 活壳实测 | 我们的落点 |
|---|---|---|
| 容器 | rounded-2xl bg-surface、视觉无边框、内容内缩 13（=12 内边距+1 透明边框）、输入区与工具条间距 12 | .composer__inner 同（透明 1px 边框保留以对齐盒模型，聚焦态用它上色） |
| 输入区 | min-h-10(40) max-h-40(160)、text-ui-base leading-5、**首行顶格**（40 是两行预留不是内边距） | textarea.composer__input 同 |
| 工具条 | h-28、gap 4；左簇与右簇之间 ml-auto | .composer__row 同 |
| 添加上下文 | 28×28 plus | iconbtn 灰（promptCapabilities 实测 image/audio=false） |
| 切换模式 | h28：shield-alert(warning 色) + 档位名 + chevron | toolbtn--warn 灰；生效模式无读路径（生态面 #6），title 写明 |
| 电脑操作 | h28：monitor-cog + 名 | toolbtn 灰（未声明 computer-use 能力） |
| 上下文计量 | 28×28 按钮位、aria=「上下文已用 X / 总量 Y」、内 12px 环 | ContextMeter 圆环（span+role=img；用量面 #7 落地再换真按钮） |
| 选择模型 | h28：package + provider/name + chevron | MenuButton plain 同构（数据源 sessionConfig.options 不变） |
| 推理档 | h28：brain + 档名 + chevron | toolbtn 灰（当前档位无读路径） |
| 发送 | 28×28、radius 8、实心 primary、arrow-up（**不是圆钮**） | .sendbtn 改 28×28 radius-md |

像素对账（region 相对坐标）：输入区 (13,13,·,40)、工具条 (13,65,·,28)、
添加上下文 (13,65,28,28)、切换模式 x=45、电脑操作 x=153、右簇贴右 13、内部 gap 4 ——
**与活壳全等**（模式/电脑操作按钮的绝对 x 因标签字形宽差 4px 以内，结构间距相同）。

两处刻意差别：排队消息条我们放在 composer 上方只读展示（活壳的排队芯片带 ✕ 撤销，
写路径未实测 ⇒ 不放假按钮）；工具条标签不做容器查询隐藏（活壳 @xl/@sm composer 断点
会收掉文字只留图标，我们的对话列最窄 320+辅助 pane 收起时仍放得下全标签）。

### 更正（2026-09-11 晚批）：上下文环是**常亮**的

逆向 ModelSelector.tsx:724 ContextRingGlyph 无条件渲染：track = currentColor 0.25、
arc = currentColor 0.7、几何 r10 / viewBox24 / stroke4 / size-3.5。我们原先 info=null 返回 null，
新会话 composer 右簇少一枚环（用户抓出「中间对话框应该还有个图标」）。现改为没数据也画
track + 0 arc，aria/title 写「等待内核回传」，不编数字；stroke 3→4、track/arc 改 currentColor
0.25/0.7 对齐活壳。

## 2. 解析值抽样（dark + zai-dark）

`--ui-font-size: 14px`、`--spacing: .25rem`、`--radius-xl: .75rem`、`--radius-2xl: 1rem`、
`--color-background: #161616`、`--color-background-alt: color-mix(#2b2b2b 60%)`、
`--color-border: #ffffff1a`、`--color-selected: #ffffff1a`、`--color-menu-hover: #363636`、
`--color-popover: #2b2b2b`。与 ui/tokens.css 的提取值同族（提取自 3.7.6 出厂 CSS，
3.11.2 解析值一致 ⇒ 令牌层没有漂移）。

## 3. 取数工具的两个坑（已修，记下来）

1. **--ws 必须优先于 /json/version**：本机同时开多个带调试端口的 Electron 时，
   先试发现端点会静默连到**另一个**应用（本轮「我们的取数」一度全打到 ZCode 上，
   靠 themeAttr 一模一样才发现）。
2. **合成字符键要补 char 事件**：Electron `sendInputEvent` 的 keyDown 不产生文本插入，
   ⌘K 这类 window 监听收得到、输入框 onChange 收不到（NOFY_SCREENSHOT_KEYS 已补）。

## 4. 下一步用这条管线验什么

- 每个新 pane（文件/审查/终端/市场）落地后，同选择器取两侧盒模型做差表；
- 暗/亮两主题各取一次 vars，与 themes/*.json 对账；
- 会话进行中态（脊柱块、工具卡、diff 汇总条）在真轮次里取，不猜。

## 5. 玻璃/接缝/深浅色批（2026-09-11 深夜）

老版本逆向树＝直接可读的 UI 样式源（用户指点后找到，取代像素探针当主依据）：
语义重建组件 desktop/src/src（230 tsx，className 逐字；壳层布局在
components/shell/WorkspaceShell.tsx 3366-3570）；pretty jsx 在 desktop/src/src-reconstructed
（757 个）；出厂 authored CSS 在 desktop/src/out/renderer/assets/styles-BxSv8qTx.css
（令牌四层 :root/.dark/.theme-zai-light/.theme-zai-dark）；更老 fork 树（~/.Trash/zcode-fork、
~/Documents/Codex/2026-06-17/zcode）另有 styles-DK_Mqp_v.pretty.css（14k 行可读）。

活壳 3.11.2 壳层实测（CDP computed，dark）：WindowShell 的 bg-background-alt 解析为
oklab(0.289 0 0 / 0.6)（60% 半透明，玻璃底）；body rgba(0,0,0,0)；aside 全透明；
separator rect 宽 1px、上下各让 24px、mask 渐隐；主列 padding 0/4/4/0；主 section 底
rgb(22,22,22) + 1px 边 rgba(255,255,255,0.1) + radius 12px，相对窗口内缩右/下 4px、
顶 4px 由 h-1 拖拽条承担。

我们的对应改动：.sidebar 透明、.shell__main padding 0/4/4/0、.card 圆角 12px + 1px 边、
.shell__handle 1px 发丝线 + mask、vite build.cssTarget=chrome136（oklch 不再降级 lab）。

对账：/tmp/cmp-colors.py 把本批 --mode vars 存档（/tmp/n-vars.json，337 变量）与
zcode-live-vars.json（528 变量）按 oklch/oklab/lab/rgb/hex 换算 sRGB 后比对：
235 个 --color-* 全等、mismatch 0（21 个 color-mix 串解析器跳过，另议）。

坑：活壳重启后 /json 发现端点仍禁用，browser ws UUID 只能从启动日志拿；
本轮起活壳取数需用户侧带日志重启，否则以 zcode-live-vars.json 存档为基线。
