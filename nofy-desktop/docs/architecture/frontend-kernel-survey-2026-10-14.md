# 前端与当前内核的对照（2026-10-14）

切片 1 已落地：侧栏只留新建任务和搜索；设置改为右侧盖层，工作区保持布局；主题、字号、语言在页脚齿轮，内核配置从「模型」进入。项目视图改读 `workspace_list`、技能 toggle、浏览器 Phase A 还没做。

这次调研的其余结论仍有效。对话列上一次的字号、气泡和输入岛不在范围内。

GitNexus MCP 这次没有连上，结论来自当前源码：`packages/acp/src/generated/ext-names.ts`、`apps/desktop/renderer`、`crates/codegen/nofy-agent`、`crates/codegen/nofy-shell`、`crates/codegen/nofy-tools`。

## 结论

nofy-desktop 的壳还是按 ZCode 3.11 的信息架构画的。内核的产品形状是：一个 ACP 子进程拥有会话、工作区、文件、git、终端、MCP、插件、技能和调度事件。三块主表面和这个形状对不上。

1. 左侧栏应只做会话和工作区导航。现在它放了两条没有客户端读路径的产品入口，并把本地偏好画成内核状态。
2. 设置应拆成「本窗口外观」和「内核配置」。现在打开设置会把整个工作区 `hidden` + `inert`。技能开关、项目 MCP、personas 写入的完成度也不一样，界面把它们放在同一套分区里。
3. 右侧内置浏览器不能接到现有内核上。内核没有浏览器会话、标签、导航或截图流。`browser_use` 是一段提示词，工具集仍是默认 nofy-build。可视网页要先由 Electron 主进程托管，再单独定「智能体能驱动它」的契约。

旧文档 `docs/contract/uiux-reference.md` 写过底部浏览器 dock「不做」。那是当时的范围裁定，不是内核能力。同一条也写了终端不做；底部 `TerminalDock` 后来已经接上 pty。浏览器这条不能再当成否决，也不能当成「内核已经会开网页」。

## 内核现在真正给客户端的面

生成表 `ext-names.ts`（证据 sha `7c6d1fed…`）里，和这三块有关的是：

| 面 | 客户端能调用的 | 界面现状 |
|---|---|---|
| 活体会话名单 | `_nofy/sessions/list`，外加 `_nofy/sessions/changed` | `roster/pull` 已用。侧栏和 ⌘K 都吃这份 roster |
| 按工作区的会话摘要 | `_nofy/session_summaries/workspace_list`、`workspace_list_recent` | 只在 smoke / probe 里用过。侧栏项目视图是客户端按 `cwd` 自己分组 |
| 另一条会话列表 | `_nofy/session_summaries/session_list` | `docs/contract/session-read-shapes.md` 记为 Invalid params。不能当名单来源 |
| 会话生命周期 | `session/new`、`load`、`delete`、`rename`、`fork`、`search` | 新建、切换、搜索已接 |
| 文件 | `_nofy/fs/list`、`read_file`、`write_file`、索引事件 | 右侧「文件」已接 list/read。节点没有 size，不能编 |
| Git | `git/status`、`git/diffs`、stage/commit 等一长串 | 右侧「审查」轮询的是整仓 `git/status`，不是单轮 diff |
| 终端 | `terminal/pty/*` | 底部 dock，主进程持有 pty。不是右侧面板 |
| MCP | list / upsert / toggle / delete / setup / auth | 设置里用户范围写入已接。项目 MCP 没有交付 |
| 插件 | `plugins/list`、`plugins/action`、`marketplace/list`、`marketplace/action` | 设置插件页能安装/卸载。侧栏「插件市场」只是打开这一页 |
| 技能 | `skills/list` 与 `skills/toggle`（`name` / `enabled` / `cwd`） | 设置只画只读列表和启用点，没有调用 toggle |
| 调度 | 客户端请求只有 `_nofy/scheduler/delete`。事件有 created / deleted / fired / inject_prompt | 桌面 main 和 renderer 都没有消费这些事件。侧栏「自动化」永久 disabled |
| 模型工具里的调度 | `scheduler_list` / `scheduler_create` / `scheduler_delete` 是给模型的工具，不是 ACP 方法 | 界面不能直接调用 |
| 浏览器 | 无任何 `browser*` 扩展名 | 右侧面板种类只有 `files` / `review` / `agents` |

`web_fetch` 是工具，不是面板。`AgentBuilder` 仅在 `web_fetch_config.is_enabled()` 时把它注入工具表（`crates/codegen/nofy-agent/src/builder.rs`）。它做的是带 SSRF 防护的 HTTP，输出 markdown，打不开需要登录的页面，也没有画面。

## 左侧栏

源码：`features/shell/Sidebar.tsx`、`sidebarModel.ts`。注释写明解剖来自活壳 3.11.2。四行动作是「新建任务 / 搜索 / 自动化 / 插件市场」。

具体错位：

- **自动化。** 按钮 `disabled`，title 把「内核侧调度通告已有，读路径未录」暴露给用户。这句话是对的，控件不该留着。客户端 RPC 只有 delete，参数是 `sessionId` + `taskId`。模型侧 `SchedulerListTool`（`scheduler/list.rs`）能列出 `id / prompt / intervalHuman / nextFireAt / createdAt / recurring`，但这条没有生成进 `EXT_CLIENT_REQUEST`。冷启动画一个任务面板会是空的或假的。事件 `ScheduledTaskCreated` 带 `task_id`、`prompt`、`human_schedule`、`next_fire_at`，桌面目前一条都不听，所以连「这次运行中新出现的任务」也看不见。
- **插件市场。** 点击 `onOpenSettings("plugins")`。市场列表和安装动作已经在设置插件页。侧栏不该再占一行，假装还有第二个市场。
- **分组。** 「分组」页在用户没有自建本地分组时就是一条按时间排的扁列表。分组名来自本地偏好 `session-metadata`（`sessionMetadataPrefs.ts`），不是会话字段。
- **项目。** 项目行由已加载会话和 roster 的 `cwd` 折出来。内核的 `workspace_list` 一次给出各工作区的 `generated_title` / `session_summary`，界面没有用它。最近工作区是另一条本机列表。两套「项目」并列，用户分不清哪个是内核工作区。
- **置顶 / 未读 / 归档。** 同样写在 `session-metadata`。归档按钮的 title 已经承认是本地列表。菜单和筛选仍把它们放在会话属性的位置。
- **文案泄漏实现。** 排序项 hint 是 `roster.lastChangeUnixMs 降序`。新建任务 title 写着 `session/new`。搜索 title 写着「内核命令（实测 167 条）」。这些是给开发看的，不是产品文案。
- **窗口命中。** 拖拽区和 `WindowNavigation` 的无拖拽岛已做过布局。原生红绿灯点击没有在本机点通过（ScreenCaptureKit 失败，且存在同 bundle id 的第二个 Nofy）。这项仍是未验证，不能写成已修好。

侧栏里真正成立的动作只有：新建会话、⌘K、按 roster 切换会话、打开文件夹、本地归档开关。

### 怎么改

先删，再换数据源，不要加第三套列表。

1. 去掉「自动化」和「插件市场」两行。调度在有客户端 list 之前不出现。插件留在设置。
2. 名单继续用已经工作的 `_nofy/sessions/list`。项目视图改读 `workspace_list`（参数形状已在 `session-read-shapes.md` 量过），不再只用客户端 `cwd` 分组冒充项目。
3. 置顶、未读、归档、自建分组若保留，标签写成「仅此窗口」。不写进会话标题，不暗示换机会跟着走。
4. 用户可见 title 只留动作和快捷键。
5. 原生窗口按钮另开一轮真机点击，不和名单改造绑在一起。

不要在这一刀里做定时任务面板。要做的前提是：给客户端补一条与 `SchedulerListTool` 同形的读方法，并用现有 delete 做删除。在那之前，创建任务的入口就是对话里的模型工具，不是侧栏。

## 设置

源码：`settingsModel.ts` 的六个分区（通用、模型、插件、技能、MCP、用量），`sectionRegistry.tsx`，`WindowFrame.tsx`。

打开任一分区时，`App.tsx` 把 `route.id = "settings"` 交给 `WindowFrame`。工作区被 `hidden`、`inert`、`aria-hidden`。会话、右侧面板和终端的键盘作用域一起关掉。设置不是一张盖在会话上的表，它换掉了整个产品。

分区完成度：

| 分区 | 实际写什么 | 缺口 |
|---|---|---|
| 通用 | 主题、字号、语言存在本机偏好。内核版本只读 | 这是界面偏好，不该和内核配置同一套导航 |
| 模型 | Provider 和默认模型走本机 JSON 适配器，不是一条内核 RPC。`authenticate` 在已有 key 时不会热更新采样配置 | 改完凭证可能要重启内核。界面若写「已生效」就是假成功 |
| 插件 | `plugins/action` 安装、卸载；市场列表可读 | 侧栏入口重复。市场行本身是目录，不是独立产品 |
| 技能 | `skills/list` 只读。点只表示 `enabled` | `_nofy/skills/toggle` 已有分派，改 `skills.disabled`。界面没接。`skills/add|remove|config|reset` 在 `EXT_DISPATCH_ONLY`，参数未量，不能先画表单 |
| MCP | 用户范围 upsert / toggle / delete / setup | 带必填 setup 的 upsert 会先落盘再回 Invalid params，直到 setup 提交。项目 MCP 未交付 |
| 用量 | `session/usage` 的 token 分段，界面只格式化 | 可以留。它依赖当前会话，不该在「没有会话」时占满窗口 |
| Personas / Agents | `BundleSettings` 只读 bundled cache | 验收边界写明项目目录写入未交付 |

Hooks 列表和动作在技能页里，已经是内核读写，只是放错了分区名字。

### 怎么改

1. 通用（主题、字号、语言）从内核配置里拆出去，留在窗口层，不卸载工作区。
2. 内核配置用右侧或覆盖层，工作区保持挂载。关闭后会话滚动位置还在。
3. 已量过的写路径保持：用户 MCP、插件动作、hooks、本机模型 JSON、技能 toggle。技能页加上 enable/disable，失败就显示内核错误，不乐观打点。
4. 不给项目 MCP、personas 目录写入、TOML 带注释迁移做空表单。旧 TOML 继续只读。
5. 模型保存后的文案区分「已写入本机配置」和「当前采样是否已热更新」。后者做不到就明说需要重启。

## 右侧内置浏览器

`panelTabs.ts` 的 `PANEL_KINDS` 是 `files | review | agents`。`AuxPane` 没有第四种。全仓库 `nofy-desktop` 没有 `BrowserView` / `WebContentsView`。

内核侧：

- `AgentDefinition::browser_use()`（`config.rs`）只换提示词：「You are a web browsing agent…」。`prompt_mode` 是 Full，`agents_md` 关掉。工具配置走 `base()` → `default_nofy_build_toolset()`，也就是 bash、读文件、搜索替换、列目录、grep、任务和 **scheduler_list/create/delete**。没有浏览器工具。
- `SessionMode::from_id("browser_use")` 等于 `SessionMode::Default`。计划模式检测会忽略这个 id。会话模式表仍会把该 id 解析成上面的 agent 定义（`session_mode.rs`）。
- `nofy_computer_toolset()` 是工作区/终端工具，给 `nofy-computer` 预设用，同样没有浏览器。
- Composer 的 `computerUseEnabled` / `onToggleComputerUse` 是可选 props。`App` 没有传入，芯片不出现。把它打开不会创建浏览器。
- 系统浏览器由 `nofy-pager-render` 的 link opener 打开。那是 `open`，不是内嵌视图。
- 测试和 MCP 截断文案里出现过 `browser_screenshot`、`browser_goto`、`browse_page`。它们是夹具名或外部 MCP 工具名，不是本桌面的宿主。

所以「右侧什么都没做」对浏览器成立。对文件、审查、子智能体不成立：文件走 `fs/list`，审查走整仓 `git/status`，子智能体行从会话 task 块加上 roster 折出来。审查的缺口是另一件事：内核有 `git/diffs`，界面还没有按单轮编辑画 diff 卡。

### 怎么做

分两段，不能并成一段。

**A. 用户自己看的网页。** Electron 主进程拥有一个 `WebContentsView`（或同等 webview），几何跟右侧槽走，和 pty 一样不放进渲染进程。渲染进程只拿有类型的桥：打开、后退、前进、刷新、当前 URL、加载失败。地址由用户输入。不调用 `web_fetch`，不假装会话模式 `browser_use` 已连接。失败页显示网络或证书错误，不显示「内核已浏览」。

**B. 智能体驱动。** 今天没有契约。要对齐 `ask_user_question` 那种「内核请求、客户端必须应答」的形状：导航、点击、截图回传，每一条都有超时和拒绝。在这条契约被量到并写进 `ext-names` 之前，不给 `browser_use` 做按钮，不把 Phase A 的视图说成 computer use。用户本机另装的 browser MCP 是第三条路，走现有 MCP 设置，不进内置面板。

安全约束放在主进程：默认不给页面内核的 ACP、文件和密钥；外链与登录态留在这个 webview 的 partition 里；和 `web_fetch` 的 SSRF 策略不是同一层，不能互相替代。

## 建议的施工顺序

1. **拆假入口。** 侧栏去掉自动化和插件市场。设置改为不卸载工作区，并把外观从内核配置分开。这一刀不增加能力，只停止误导。
2. **侧栏数据。** 项目视图改用已量过的 `workspace_list`。本地置顶/归档改文案。清掉用户可见的 RPC 名。
3. **技能开关。** 接已有的 `_nofy/skills/toggle`，保留失败态。
4. **浏览器 Phase A。** 右侧第四个面板，仅用户导航。验收用隔离窗口打开一个公网页、后退、刷新、关掉面板后视图销毁。
5. **审查与等待态。** 单轮 diff 用已有 `git/diffs` 或工具回执里的 edit preview，不新造 git。`正在等待模型响应…` 目前只在 i18n 字典里，首页验收 H07/H15 因此失败，这是呈现缺口，单独修。
6. **调度面板和浏览器 Phase B。** 都要先有新的客户端方法或请求/应答。没有测量结果就不做界面。

不在这张表里先做的：云会话图标、personas 目录写入、项目 MCP、TOML 迁移、用 `web_fetch` 冒充浏览器、把 `scheduler_list` 模型工具直接绑到按钮上。
