# DEBRAND-LEDGER — D5a 用户可见品牌剔除（ZCode → Grok Build）

> 范围：仅用户可见层（标题/弹层/onboarding/logo/占位符/i18n 词典值/通知与对话框文案/导出文件名前缀）。
> **不改**：IPC 通道、存储键、~/.zcode 路径、注释、内部标识符、vendored 串、云联功能函数。
> 词典键（key）不动，仅改值（value）。行号为应用前行号。每条带 `REBRAND-0NN` 注释落盘。

## A. 定向条目

| ID | 文件 | 行 | 现 → 新 |
|---|---|---|---|
| 001 | out/renderer/index.html | 6 | `<title>ZCode</title>` → `<title>Grok Build</title>` |
| 002 | out/renderer/index.html | 176-185 | 启动页 Z 标 SVG(3 path) → 自绘中性 G glyph(stroke path) |
| 003 | out/renderer/assets/styles-CdEGpc2x.js | 39411 | `uw` 顶栏 logo dataURI(Z 方块) → G glyph dataURI(中性底+白 G) |
| 004 | out/renderer/assets/styles-CdEGpc2x.js | 63878,63879,63918,63919,63950,63951 | 内联插件双语描述 ZCode → Grok Build |
| 005 | out/renderer/assets/styles-CdEGpc2x.js | 91332 | HomeHeroLogo(Cit) 线框 Z path → G 线框 path(strokeWidth 56) |
| 006 | out/renderer/assets/styles-CdEGpc2x.js | 129581 | 顶栏 logo `alt: \`ZCode\`` → `alt: \`Grok Build\`` |
| 007 | out/renderer/assets/styles-CdEGpc2x.js | 184748 | 窗口标题 `ZCode / ${Go(M)}` → `Grok Build / ${Go(M)}` |
| 008 | out/renderer/assets/styles-CdEGpc2x.js | 184923 | 窗口标题 `ZCode / ${Go(M)}` → `Grok Build / ${Go(M)}` |
| 009 | out/renderer/assets/styles-CdEGpc2x.js | 203823 | 设置头 logo `alt: \`ZCode\`` → `alt: \`Grok Build\`` |
| 010 | out/renderer/assets/styles-CdEGpc2x.js | 205690-205701 | 登录 logo s4t 三 Z path → G stroke path |
| 011 | out/renderer/assets/styles-CdEGpc2x.js | 206417 | 登录 logo `aria-label: \`ZCode\`` → `Grok Build` |
| 012 | out/renderer/assets/styles-CdEGpc2x.js | 207537 | onboarding logo `aria-label: \`ZCode\`` → `Grok Build` |
| 013 | out/renderer/assets/styles-CdEGpc2x.js | 211182-211194 | 启动 loading logo e8t 三 Z path → G stroke path(保留 animate) |
| 014 | out/renderer/assets/styles-CdEGpc2x.js | 38005 | `pMe = \`ZCode Agent\`` → `\`Grok Build Agent\`` |
| 015 | out/renderer/assets/styles-CdEGpc2x.js | 38041 | `gMe = \`ZCode Agent\`` → `\`Grok Build Agent\`` |
| 016 | out/renderer/assets/IntlProvider-C321H7m8.js | 127 行(见 B) | i18n 双语词典值 ZCode → Grok Build（键不动） |
| 017 | out/main/index.js | 29229,29230 | 外链确认对话框 zh 标题/消息 → Grok Build |
| 018 | out/main/index.js | 29240,29241 | 外链确认对话框 en → Grok Build |
| 019 | out/main/index.js | 31327,31331 | 关于弹层 zh aboutTitle/copyright → Grok Build |
| 020 | out/main/index.js | 31334,31338 | 关于弹层 en aboutTitle/copyright → Grok Build |
| 021 | out/main/index.js | 31322 | `K3 = "ZCode Desktop App"` → `"Grok Build Desktop App"` |
| 022 | out/main/index.js | 31286-31293 | 关于弹层 Z 标 SVG(3 path) → G glyph |
| 023 | out/main/index.js | 32907,32920,32956,33132 | Endpoint 开发窗口 title/label `ZCode Endpoint` → `Grok Build Endpoint` |
| 024 | out/main/index.js | 34950,34957,34959,35609 | 强制更新对话框 zh 文案 → Grok Build |
| 025 | out/main/index.js | 34978,34981,34983,34985,35618 | 强制更新对话框 en 文案 → Grok Build |
| 026 | out/main/index.js | 35219 | 更新 splash `brand-title">ZCode` → `Grok Build` |
| 027 | out/main/index.js | 36167,36416 | `在ZCode打开 / Open in ZCode` → Grok Build |
| 028 | out/main/index.js | 38825,38827,38832,38834 | CUA Helper 权限对话框 zh/en → Grok Build |
| 029 | out/main/index.js | 32046,32077 | 导出日志文件名前缀 `zcode-logs*` → `grok-build-logs*` |
| 030 | out/main/index.js | 38656 | 错误截图文件名前缀 `zcode-error-` → `grok-build-error-` |
| 031 | out/main/chunk-FQMTTDFW.js | 606,612,630,631 | 主进程菜单词典 zh（关于/Endpoint/托盘）→ Grok Build |
| 032 | out/main/chunk-FQMTTDFW.js | 661,667,683,684 | 主进程菜单词典 en → Grok Build |
| 033 | out/main/chunk-FQMTTDFW.js | 17827 | `label: "ZCode Agent"` → `"Grok Build Agent"` |
| 034 | out/host/index.js | 61072,61079 | host 导出日志前缀 `zcode-logs*` → `grok-build-logs*` |
| 035 | src-reconstructed/modules/I18n.tsx | 127 行(见 C) | canonical 词典值同步（与 016 同条目同序） |
| 036 | src-reconstructed/modules/TopBar.tsx | 488 | `alt="ZCode"` → `alt="Grok Build"` |
| 037 | src-reconstructed/modules/Settings.tsx | 1565 | `alt="ZCode"` → `alt="Grok Build"` |
| 038 | src-reconstructed/modules/WorkspaceShell.tsx | 3296,3391 | 窗口标题 `ZCode / …` → `Grok Build / …` |
| 039 | src-reconstructed/modules/Home.tsx | 578 | HomeHeroLogo Z path → G path |
| 040 | src-reconstructed/modules/Modals.tsx | 4221-4226,4245 | ZCodeLogoSvg 三 path → G path；aria-label → Grok Build |
| 043 | out/renderer/assets/styles-CdEGpc2x.js | 150427,150433 | 无用户名回退显示名 `ZCode`/首字母 `Z` → `Grok Build`/`G` |
| 042 | out/main/index.js | 29008,29005 | Linux 深链 .desktop 条目 `Comment=ZCode Desktop App` / `productName ?? "ZCode"` → Grok Build |
| 041 | src-reconstructed/modules/UsageDeep.tsx | 1840 | ZAI_LOGO_DATA_URI Z 方块 → G glyph dataURI |

## B — 词典值逐行（IntlProvider-C321H7m8.js，REBRAND-016/035）

- L152 `bots.description`: 把外部聊天工具和 Webhook 接入 ZCode 机器人。`, → 把外部聊天工具和 Webhook 接入 Grok Build 机器人。`,
- L193 `bots.setup.guide.weixin.create.2`: ZCode 会直接保存 iLink 返回的 bot_token；扫码后请在微信里向 Bot 发送任意消息完成会话激活。`, → Grok Build 会直接保存 iLink 返回的 bot_token；扫码后请在微信里向 Bot 发送任意消息完成会话激活。
- L195 `(续行)`: "ZCode 内置 iLink 客户端，通过 `/ilink/bot/getupdates` 长轮询收消息，通过 `/ilink → "Grok Build 内置 iLink 客户端，通过 `/ilink/bot/getupdates` 长轮询收消息，通过 `/
- L206 `bots.setup.guide.webhook.create.1`: Webhook 模式不需要先在第三方平台创建原生机器人；你的系统只需要能向 ZCode 回调接口发消息。`, → Webhook 模式不需要先在第三方平台创建原生机器人；你的系统只需要能向 Grok Build 回调接口发消息。`,
- L209 `bots.setup.guide.webhook.bind.1`: 向 ZCode 的 `/api/bots/webhook` 发送一条私聊消息回调。", → 向 Grok Build 的 `/api/bots/webhook` 发送一条私聊消息回调。",
- L335 `bots.runtime.telegramLongPollingHandledElsewhere`: Telegram 长轮询由另一个 ZCode 窗口处理。`, → Telegram 长轮询由另一个 Grok Build 窗口处理。`,
- L412 `welcome.title`: Welcome to ZCode`, → Welcome to Grok Build`,
- L418 `login.title`: 欢迎来到 ZCode`, → 欢迎来到 Grok Build`,
- L419 `login.description`: 连接账号，开始使用 ZCode`, → 连接账号，开始使用 Grok Build`,
- L454 `logout.confirm.title`: 断开连接并重启 ZCode？`, → 断开连接并重启 Grok Build？`,
- L607 `modelTrajectory.empty`: 暂无模型调用记录（仅 ZCode Agent 会落盘 model-io）`, → 暂无模型调用记录（仅 Grok Build Agent 会落盘 model-io）`,
- L999 `titleBar.menu.help.about`: 关于 ZCode`, → 关于 Grok Build`,
- L1049 `forceUpdate.title`: 需要升级 ZCode 后继续使用`, → 需要升级 Grok Build 后继续使用`,
- L1121 `workspaceSidebar.unavailableLocalDirectory`: 工作区目录不存在或无法访问，当前仅可查看历史记录。恢复该目录后重启 ZCode 即可继续使用。`, → 工作区目录不存在或无法访问，当前仅可查看历史记录。恢复该目录后重启 Grok Build 即可继续使用。`,
- L1161 `ssh.assetInstallModeDescription`: 远端服务器下载可减少上传等待，但服务器需要能访问 ZCode CDN，并具备下载、解压和校验工具。`, → 远端服务器下载可减少上传等待，但服务器需要能访问 Grok Build CDN，并具备下载、解压和校验工具。`,
- L1274 `webRemoteControl.mobileHome.title`: ZCode 远程控制`, → Grok Build 远程控制`,
- L1316 `remote.kind.server.wizardDescription`: 已运行的 ZCode 服务`, → 已运行的 Grok Build 服务`,
- L1340 `server.description`: 连接已经运行的 ZCode server。`, → 连接已经运行的 Grok Build server。`,
- L1593 `settings.terminalFontFamilyDescription`: 留空时自动探测系统终端配置；填写后作为 ZCode 终端的字体覆盖。`, → 留空时自动探测系统终端配置；填写后作为 Grok Build 终端的字体覆盖。`,
- L1678 `settings.zcodeInteractionBehaviorDescription`: 在 ZCode 运行时将后续操作加入队列，或引导至下一轮工具调用后运行。`, → 在 Grok Build 运行时将后续操作加入队列，或引导至下一轮工具调用后运行。`,
- L1700 `settings.dataBaseDirForbiddenInstallDir`: 不能选择 ZCode 安装目录作为数据存储路径。请选择安装目录之外的文件夹。`, → 不能选择 Grok Build 安装目录作为数据存储路径。请选择安装目录之外的文件夹。`,
- L1715 `settings.migration.sectionDescription`: 扫描本机 Claude Code 原生历史，可按 workspace 和时间范围筛选，再把选中的会话导入到对应的 ZCode 任 → 扫描本机 Claude Code 原生历史，可按 workspace 和时间范围筛选，再把选中的会话导入到对应的 Grok Bu
- L1774 `settings.browser.desktopOnly`: 浏览器数据只能在 ZCode 桌面端管理。`, → 浏览器数据只能在 Grok Build 桌面端管理。`,
- L1784 `settings.browser.import.helperVerificationFailed`: ZCode 的 Windows 安全导入组件校验失败，Cookie 未导入。请重新安装或更新 ZCode。`, → Grok Build 的 Windows 安全导入组件校验失败，Cookie 未导入。请重新安装或更新 Grok Build。`
- L1787 `settings.browser.import.adminConfirmDescription`: Chrome 在 Windows 上使用 App-Bound 加密保护 Cookie。ZCode 将为本次导入请求管理员权限，临 → Chrome 在 Windows 上使用 App-Bound 加密保护 Cookie。Grok Build 将为本次导入请求管理
- L1830 `settings.mcp.description`: 管理 ZCode Agent 使用的 MCP 服务器配置。`, → 管理 Grok Build Agent 使用的 MCP 服务器配置。`,
- L1896 `settings.mcp.host.activeDescription`: 该 MCP 服务器由 ZCode 宿主为 {pluginName} 插件提供，运行时身份由宿主管理。`, → 该 MCP 服务器由 Grok Build 宿主为 {pluginName} 插件提供，运行时身份由宿主管理。`,
- L1904 `settings.mcp.statusOnlyUnsupported`: 当前 ZCode Agent 不支持 OAuth 状态刷新。请升级或重启 ZCode，然后重新打开 MCP 设置进行完整刷新。` → 当前 Grok Build Agent 不支持 OAuth 状态刷新。请升级或重启 Grok Build，然后重新打开 MCP 
- L1952 `settings.mcpServers.import.importing`: 正在导入 MCP 服务器到 ZCode`, → 正在导入 MCP 服务器到 Grok Build`,
- L2034 `settings.modelProvider.startPlan.highlight.trial.description`: 登录 ZCode 3.x 后开始计时。`, → 登录 Grok Build 3.x 后开始计时。`,
- L2041 `settings.modelProvider.startPlan.compatibility`: 支持 BYOK、BYOA；Base URL、API Format 和 API Key 由 ZCode 自动维护，无需手动配置。` → 支持 BYOK、BYOA；Base URL、API Format 和 API Key 由 Grok Build 自动维护，无需手
- L2135 `settings.modelProvider.codingPlan.purchase.teamMemberNoticeDescription`: 请先在 BigModel 团队套餐管理页添加自己或其他成员，完成后即可在 ZCode 使用团队额度。`, → 请先在 BigModel 团队套餐管理页添加自己或其他成员，完成后即可在 Grok Build 使用团队额度。`,
- L2476 `settings.usage.billingBanner.description`: 连接 {provider} 账号后查询编程套餐权益，购买或配置后回到 ZCode 即可继续编码。`, → 连接 {provider} 账号后查询编程套餐权益，购买或配置后回到 Grok Build 即可继续编码。`,
- L2664 `settings.skills.agent.glm`: ZCode Agent`, → Grok Build Agent`,
- L2699 `settings.skills.import.mode.copy.description`: 将完整技能目录复制到 ZCode。外部 Agent 目录后续变更不会自动同步。`, → 将完整技能目录复制到 Grok Build。外部 Agent 目录后续变更不会自动同步。`,
- L2700 `settings.skills.import.mode.symlink.description`: 创建指向外部 Agent 技能目录的链接。ZCode 会跟随来源目录后续变更，但该技能依赖来源路径持续可用。`, → 创建指向外部 Agent 技能目录的链接。Grok Build 会跟随来源目录后续变更，但该技能依赖来源路径持续可用。`,
- L2701 `settings.skills.import.importing`: 正在导入技能到 ZCode`, → 正在导入技能到 Grok Build`,
- L2763 `settings.subagents.description`: 管理 ZCode Agent 运行时消费的用户级子智能体 Markdown 文件。`, → 管理 Grok Build Agent 运行时消费的用户级子智能体 Markdown 文件。`,
- L2850 `settings.plugins.store.subtitle`: 用插件为 ZCode 扩展技能、命令与 MCP 能力`, → 用插件为 Grok Build 扩展技能、命令与 MCP 能力`,
- L3036 `settings.plugins.import.mode.copy.description`: 将完整插件目录复制到 ZCode，并注册到 plugins.dirs。外部 Agent 目录后续变更不会自动同步。`, → 将完整插件目录复制到 Grok Build，并注册到 plugins.dirs。外部 Agent 目录后续变更不会自动同步。`,
- L3037 `settings.plugins.import.mode.symlink.description`: 创建指向外部 Agent 插件目录的链接，并注册到 plugins.dirs。ZCode 会跟随来源目录后续变更，但该插件依赖来 → 创建指向外部 Agent 插件目录的链接，并注册到 plugins.dirs。Grok Build 会跟随来源目录后续变更，但该
- L3038 `settings.plugins.import.importing`: 正在导入插件到 ZCode`, → 正在导入插件到 Grok Build`,
- L3046 `settings.commands.description`: 管理 ZCode Agent 的 .md 命令文件。命令可通过 /command-name 在聊天中调用。`, → 管理 Grok Build Agent 的 .md 命令文件。命令可通过 /command-name 在聊天中调用。`,
- L3048 `settings.commands.source.zcodeAgent`: ZCode Agent`, → Grok Build Agent`,
- L3101 `settings.commands.import.mode.copy.description`: 将命令文件复制到 ZCode。外部 Agent 文件后续变更不会自动同步。`, → 将命令文件复制到 Grok Build。外部 Agent 文件后续变更不会自动同步。`,
- L3102 `settings.commands.import.mode.symlink.description`: 创建指向外部 Agent 命令文件的链接。ZCode 会跟随来源文件后续变更，但该命令依赖来源路径持续可用。`, → 创建指向外部 Agent 命令文件的链接。Grok Build 会跟随来源文件后续变更，但该命令依赖来源路径持续可用。`,
- L3103 `settings.commands.import.importing`: 正在导入命令到 ZCode`, → 正在导入命令到 Grok Build`,
- L3151 `settings.plugins.zcodeOnly`: 仅支持 ZCode Agent`, → 仅支持 Grok Build Agent`,
- L3160 `settingsSync.agent.zcode`: ZCode Agent`, → Grok Build Agent`,
- L3206 `settingsSync.discovery.helper`: 仅导入缺失项，不会覆盖当前 ZCode 中已存在的配置。`, → 仅导入缺失项，不会覆盖当前 Grok Build 中已存在的配置。`,
- L3211 `onboarding.dialog.title`: 欢迎使用 ZCode`, → 欢迎使用 Grok Build`,
- L3215 `onboarding.welcome.title`: 欢迎使用 ZCode`, → 欢迎使用 Grok Build`,
- L3216 `onboarding.welcome.start`: 开始使用 ZCode`, → 开始使用 Grok Build`,
- L3233 `onboarding.stepDescription.migration`: 开始迁移并等待 ZCode 完成导入。`, → 开始迁移并等待 Grok Build 完成导入。`,
- L3249 `(续行)`: 如果目标文件已存在，ZCode 默认 AGENTS 配置会被覆盖。`, → 如果目标文件已存在，Grok Build 默认 AGENTS 配置会被覆盖。`,
- L3300 `chat.placeholder.newTask`: 向 ZCode 提问，使用 @ 添加上下文，使用 / 选择命令或能力`, → 向 Grok Build 提问，使用 @ 添加上下文，使用 / 选择命令或能力`,
- L3301 `chat.placeholder.newTaskMobile`: 向 ZCode 提问…`, → 向 Grok Build 提问…`,
- L3830 `chat.cuaPermission.dragTitle`: ZCode CUA Helper.app`, → Grok Build CUA Helper.app`,
- L4177 `feedback.submit.template.section.copyErrorHeading`: ZCode 报错信息`, → Grok Build 报错信息`,
- L4310 `offPeak.keepAwakeBanner`: ZCode 运行会话时保持电脑唤醒。`, → Grok Build 运行会话时保持电脑唤醒。`,
- L4347 `offPeak.form.instructionsPlaceholder`: 描述希望 ZCode 在后台完成的工作、预期结果和约束，例如整理本周代码改动并生成站会摘要…`, → 描述希望 Grok Build 在后台完成的工作、预期结果和约束，例如整理本周代码改动并生成站会摘要…`,
- L4669 `bots.description`: Connect external chats and webhooks to ZCode bots.`, → Connect external chats and webhooks to Grok Build bots.`,
- L4710 `bots.setup.guide.weixin.create.2`: ZCode saves the bot_token returned by iLink automatically; after → Grok Build saves the bot_token returned by iLink automatically; 
- L4712 `(续行)`: "ZCode uses a built-in iLink client: `/ilink/bot/getupdates` for → "Grok Build uses a built-in iLink client: `/ilink/bot/getupdates
- L4723 `bots.setup.guide.webhook.create.1`: Webhook mode does not require a native bot in the third-party pr → Webhook mode does not require a native bot in the third-party pr
- L4727 `(续行)`: "POST a private-message callback to ZCode's `/api/bots/webhook`  → "POST a private-message callback to Grok Build's `/api/bots/webh
- L4853 `bots.runtime.telegramLongPollingHandledElsewhere`: Telegram long polling is handled by another ZCode window.`, → Telegram long polling is handled by another Grok Build window.`,
- L4930 `welcome.title`: Welcome to ZCode`, → Welcome to Grok Build`,
- L4936 `login.title`: Welcome to ZCode`, → Welcome to Grok Build`,
- L4937 `login.description`: Connect your account to start using ZCode`, → Connect your account to start using Grok Build`,
- L4972 `logout.confirm.title`: Disconnect and restart ZCode?`, → Disconnect and restart Grok Build?`,
- L5125 `modelTrajectory.empty`: No model calls recorded (only ZCode Agent writes model-io)`, → No model calls recorded (only Grok Build Agent writes model-io)`
- L5517 `titleBar.menu.help.about`: About ZCode`, → About Grok Build`,
- L5567 `forceUpdate.title`: Update ZCode to continue`, → Update Grok Build to continue`,
- L5639 `workspaceSidebar.unavailableLocalDirectory`: The workspace directory does not exist or cannot be accessed. Yo → The workspace directory does not exist or cannot be accessed. Yo
- L5679 `ssh.assetInstallModeDescription`: Remote server download reduces upload waiting, but the server mu → Remote server download reduces upload waiting, but the server mu
- L5792 `webRemoteControl.mobileHome.title`: ZCode remote control`, → Grok Build remote control`,
- L5834 `remote.kind.server.wizardDescription`: Running ZCode service`, → Running Grok Build service`,
- L5858 `server.description`: Connect to an already running ZCode server.`, → Connect to an already running Grok Build server.`,
- L6023 `chat.changeSummary.rewindDialog.description`: ZCode checks current file content again before writing. If anoth → Grok Build checks current file content again before writing. If 
- L6108 `settings.terminalFontFamilyDescription`: Leave blank to auto-detect system terminal settings; set a value → Leave blank to auto-detect system terminal settings; set a value
- L6193 `settings.zcodeInteractionBehaviorDescription`: While ZCode is running, add follow-up actions to the queue or gu → While Grok Build is running, add follow-up actions to the queue 
- L6215 `settings.dataBaseDirForbiddenInstallDir`: The data directory cannot be the ZCode installation folder on Wi → The data directory cannot be the Grok Build installation folder 
- L6230 `settings.migration.sectionDescription`: Scan native Claude Code history on this machine, optionally filt → Scan native Claude Code history on this machine, optionally filt
- L6289 `settings.browser.desktopOnly`: Browser data can only be managed in the ZCode desktop app.`, → Browser data can only be managed in the Grok Build desktop app.`
- L6299 `settings.browser.import.helperVerificationFailed`: ZCode could not verify its Windows secure import component. Rein → Grok Build could not verify its Windows secure import component.
- L6302 `settings.browser.import.adminConfirmDescription`: Chrome protects cookies with App-Bound encryption on Windows. Fo → Chrome protects cookies with App-Bound encryption on Windows. Fo
- L6345 `settings.mcp.description`: Manage MCP server configurations used by ZCode Agent.`, → Manage MCP server configurations used by Grok Build Agent.`,
- L6411 `settings.mcp.host.activeDescription`: ZCode provides this MCP server for the {pluginName} plugin. Its  → Grok Build provides this MCP server for the {pluginName} plugin.
- L6419 `settings.mcp.statusOnlyUnsupported`: This ZCode Agent cannot refresh OAuth status. Upgrade or restart → This Grok Build Agent cannot refresh OAuth status. Upgrade or re
- L6467 `settings.mcpServers.import.importing`: Importing MCP servers into ZCode`, → Importing MCP servers into Grok Build`,
- L6549 `settings.modelProvider.startPlan.highlight.trial.description`: Timing starts after signing in to ZCode 3.x.`, → Timing starts after signing in to Grok Build 3.x.`,
- L6556 `settings.modelProvider.startPlan.compatibility`: Supports BYOK and BYOA. Base URL, API format, and API Key are ma → Supports BYOK and BYOA. Base URL, API format, and API Key are ma
- L6650 `settings.modelProvider.codingPlan.purchase.teamMemberNoticeDescription`: Add yourself or other members on the BigModel team plan manageme → Add yourself or other members on the BigModel team plan manageme
- L6975 `settings.usage.billingBanner.description`: Connect your {provider} account to query Coding Plan entitlement → Connect your {provider} account to query Coding Plan entitlement
- L7179 `settings.skills.agent.glm`: ZCode Agent`, → Grok Build Agent`,
- L7214 `settings.skills.import.mode.copy.description`: Copy the full skill directory into ZCode. Later changes in the e → Copy the full skill directory into Grok Build. Later changes in 
- L7215 `settings.skills.import.mode.symlink.description`: Create a directory link to the external agent skill. ZCode follo → Create a directory link to the external agent skill. Grok Build 
- L7216 `settings.skills.import.importing`: Importing skills into ZCode`, → Importing skills into Grok Build`,
- L7281 `settings.subagents.description`: Manage user-level subagent Markdown files consumed by ZCode Agen → Manage user-level subagent Markdown files consumed by Grok Build
- L7368 `settings.plugins.store.subtitle`: Extend ZCode with skills, commands, and MCP servers from plugins → Extend Grok Build with skills, commands, and MCP servers from pl
- L7554 `settings.plugins.import.mode.copy.description`: Copy the full plugin directory into ZCode and register it in plu → Copy the full plugin directory into Grok Build and register it i
- L7555 `settings.plugins.import.mode.symlink.description`: Create a directory link to the external agent plugin and registe → Create a directory link to the external agent plugin and registe
- L7556 `settings.plugins.import.importing`: Importing plugins into ZCode`, → Importing plugins into Grok Build`,
- L7564 `settings.commands.description`: Manage ZCode Agent .md command files. Commands can be invoked wi → Manage Grok Build Agent .md command files. Commands can be invok
- L7566 `settings.commands.source.zcodeAgent`: ZCode Agent`, → Grok Build Agent`,
- L7619 `settings.commands.import.mode.copy.description`: Copy the command file into ZCode. Later changes in the external  → Copy the command file into Grok Build. Later changes in the exte
- L7620 `settings.commands.import.mode.symlink.description`: Create a file link to the external agent command. ZCode follows  → Create a file link to the external agent command. Grok Build fol
- L7621 `settings.commands.import.importing`: Importing commands into ZCode`, → Importing commands into Grok Build`,
- L7669 `settings.plugins.zcodeOnly`: ZCode Agent only`, → Grok Build Agent only`,
- L7677 `settingsSync.action.finish`: Start using ZCode`, → Start using Grok Build`,
- L7678 `settingsSync.agent.zcode`: ZCode Agent`, → Grok Build Agent`,
- L7724 `settingsSync.discovery.helper`: Only missing items will be imported and your current ZCode setti → Only missing items will be imported and your current Grok Build 
- L7729 `onboarding.dialog.title`: Welcome to ZCode`, → Welcome to Grok Build`,
- L7733 `onboarding.welcome.title`: Welcome to ZCode`, → Welcome to Grok Build`,
- L7734 `onboarding.welcome.start`: Start ZCode`, → Start Grok Build`,
- L7751 `onboarding.stepDescription.migration`: Start migration and wait while ZCode imports your selections.`, → Start migration and wait while Grok Build imports your selection
- L7766 `onboarding.agentsFile.confirmDescription`: ZCode will copy {source} to {target}. → Grok Build will copy {source} to {target}.
- L7767 `(续行)`: If the target file already exists, the ZCode default AGENTS conf → If the target file already exists, the Grok Build default AGENTS
- L7818 `chat.placeholder.newTask`: Ask ZCode anything, @ to add context, / for commands or capabili → Ask Grok Build anything, @ to add context, / for commands or cap
- L7819 `chat.placeholder.newTaskMobile`: Ask ZCode anything…`, → Ask Grok Build anything…`,
- L8044 `(续行)`: Compress the current conversation with the current model first.  → Compress the current conversation with the current model first. 
- L8293 `chat.slash.emptyUnavailable`: No slash commands have been broadcast for the current ZCode Agen → No slash commands have been broadcast for the current Grok Build
- L8348 `chat.cuaPermission.dragTitle`: ZCode CUA Helper.app`, → Grok Build CUA Helper.app`,
- L8695 `feedback.submit.template.section.copyErrorHeading`: ZCode Error Info`, → Grok Build Error Info`,
- L8831 `offPeak.keepAwakeBanner`: Keep your computer awake while ZCode is running a chat.`, → Keep your computer awake while Grok Build is running a chat.`,
- L8868 `offPeak.form.instructionsPlaceholder`: Describe a task ZCode can work on in the background, including t → Describe a task Grok Build can work on in the background, includ

## C — 词典值逐行（I18n.tsx，REBRAND-016/035）

- L421 `bots.description`: 把外部聊天工具和 Webhook 接入 ZCode 机器人。`, → 把外部聊天工具和 Webhook 接入 Grok Build 机器人。`,
- L462 `bots.setup.guide.weixin.create.2`: ZCode 会直接保存 iLink 返回的 bot_token；扫码后请在微信里向 Bot 发送任意消息完成会话激活。`, → Grok Build 会直接保存 iLink 返回的 bot_token；扫码后请在微信里向 Bot 发送任意消息完成会话激活。
- L464 `(续行)`: "ZCode 内置 iLink 客户端，通过 `/ilink/bot/getupdates` 长轮询收消息，通过 `/ilink → "Grok Build 内置 iLink 客户端，通过 `/ilink/bot/getupdates` 长轮询收消息，通过 `/
- L475 `bots.setup.guide.webhook.create.1`: Webhook 模式不需要先在第三方平台创建原生机器人；你的系统只需要能向 ZCode 回调接口发消息。`, → Webhook 模式不需要先在第三方平台创建原生机器人；你的系统只需要能向 Grok Build 回调接口发消息。`,
- L478 `bots.setup.guide.webhook.bind.1`: 向 ZCode 的 `/api/bots/webhook` 发送一条私聊消息回调。", → 向 Grok Build 的 `/api/bots/webhook` 发送一条私聊消息回调。",
- L604 `bots.runtime.telegramLongPollingHandledElsewhere`: Telegram 长轮询由另一个 ZCode 窗口处理。`, → Telegram 长轮询由另一个 Grok Build 窗口处理。`,
- L681 `welcome.title`: Welcome to ZCode`, → Welcome to Grok Build`,
- L687 `login.title`: 欢迎来到 ZCode`, → 欢迎来到 Grok Build`,
- L688 `login.description`: 连接账号，开始使用 ZCode`, → 连接账号，开始使用 Grok Build`,
- L723 `logout.confirm.title`: 断开连接并重启 ZCode？`, → 断开连接并重启 Grok Build？`,
- L876 `modelTrajectory.empty`: 暂无模型调用记录（仅 ZCode Agent 会落盘 model-io）`, → 暂无模型调用记录（仅 Grok Build Agent 会落盘 model-io）`,
- L1268 `titleBar.menu.help.about`: 关于 ZCode`, → 关于 Grok Build`,
- L1318 `forceUpdate.title`: 需要升级 ZCode 后继续使用`, → 需要升级 Grok Build 后继续使用`,
- L1390 `workspaceSidebar.unavailableLocalDirectory`: 工作区目录不存在或无法访问，当前仅可查看历史记录。恢复该目录后重启 ZCode 即可继续使用。`, → 工作区目录不存在或无法访问，当前仅可查看历史记录。恢复该目录后重启 Grok Build 即可继续使用。`,
- L1430 `ssh.assetInstallModeDescription`: 远端服务器下载可减少上传等待，但服务器需要能访问 ZCode CDN，并具备下载、解压和校验工具。`, → 远端服务器下载可减少上传等待，但服务器需要能访问 Grok Build CDN，并具备下载、解压和校验工具。`,
- L1543 `webRemoteControl.mobileHome.title`: ZCode 远程控制`, → Grok Build 远程控制`,
- L1585 `remote.kind.server.wizardDescription`: 已运行的 ZCode 服务`, → 已运行的 Grok Build 服务`,
- L1609 `server.description`: 连接已经运行的 ZCode server。`, → 连接已经运行的 Grok Build server。`,
- L1862 `settings.terminalFontFamilyDescription`: 留空时自动探测系统终端配置；填写后作为 ZCode 终端的字体覆盖。`, → 留空时自动探测系统终端配置；填写后作为 Grok Build 终端的字体覆盖。`,
- L1947 `settings.zcodeInteractionBehaviorDescription`: 在 ZCode 运行时将后续操作加入队列，或引导至下一轮工具调用后运行。`, → 在 Grok Build 运行时将后续操作加入队列，或引导至下一轮工具调用后运行。`,
- L1969 `settings.dataBaseDirForbiddenInstallDir`: 不能选择 ZCode 安装目录作为数据存储路径。请选择安装目录之外的文件夹。`, → 不能选择 Grok Build 安装目录作为数据存储路径。请选择安装目录之外的文件夹。`,
- L1984 `settings.migration.sectionDescription`: 扫描本机 Claude Code 原生历史，可按 workspace 和时间范围筛选，再把选中的会话导入到对应的 ZCode 任 → 扫描本机 Claude Code 原生历史，可按 workspace 和时间范围筛选，再把选中的会话导入到对应的 Grok Bu
- L2043 `settings.browser.desktopOnly`: 浏览器数据只能在 ZCode 桌面端管理。`, → 浏览器数据只能在 Grok Build 桌面端管理。`,
- L2053 `settings.browser.import.helperVerificationFailed`: ZCode 的 Windows 安全导入组件校验失败，Cookie 未导入。请重新安装或更新 ZCode。`, → Grok Build 的 Windows 安全导入组件校验失败，Cookie 未导入。请重新安装或更新 Grok Build。`
- L2056 `settings.browser.import.adminConfirmDescription`: Chrome 在 Windows 上使用 App-Bound 加密保护 Cookie。ZCode 将为本次导入请求管理员权限，临 → Chrome 在 Windows 上使用 App-Bound 加密保护 Cookie。Grok Build 将为本次导入请求管理
- L2099 `settings.mcp.description`: 管理 ZCode Agent 使用的 MCP 服务器配置。`, → 管理 Grok Build Agent 使用的 MCP 服务器配置。`,
- L2165 `settings.mcp.host.activeDescription`: 该 MCP 服务器由 ZCode 宿主为 {pluginName} 插件提供，运行时身份由宿主管理。`, → 该 MCP 服务器由 Grok Build 宿主为 {pluginName} 插件提供，运行时身份由宿主管理。`,
- L2173 `settings.mcp.statusOnlyUnsupported`: 当前 ZCode Agent 不支持 OAuth 状态刷新。请升级或重启 ZCode，然后重新打开 MCP 设置进行完整刷新。` → 当前 Grok Build Agent 不支持 OAuth 状态刷新。请升级或重启 Grok Build，然后重新打开 MCP 
- L2221 `settings.mcpServers.import.importing`: 正在导入 MCP 服务器到 ZCode`, → 正在导入 MCP 服务器到 Grok Build`,
- L2303 `settings.modelProvider.startPlan.highlight.trial.description`: 登录 ZCode 3.x 后开始计时。`, → 登录 Grok Build 3.x 后开始计时。`,
- L2310 `settings.modelProvider.startPlan.compatibility`: 支持 BYOK、BYOA；Base URL、API Format 和 API Key 由 ZCode 自动维护，无需手动配置。` → 支持 BYOK、BYOA；Base URL、API Format 和 API Key 由 Grok Build 自动维护，无需手
- L2404 `settings.modelProvider.codingPlan.purchase.teamMemberNoticeDescription`: 请先在 BigModel 团队套餐管理页添加自己或其他成员，完成后即可在 ZCode 使用团队额度。`, → 请先在 BigModel 团队套餐管理页添加自己或其他成员，完成后即可在 Grok Build 使用团队额度。`,
- L2745 `settings.usage.billingBanner.description`: 连接 {provider} 账号后查询编程套餐权益，购买或配置后回到 ZCode 即可继续编码。`, → 连接 {provider} 账号后查询编程套餐权益，购买或配置后回到 Grok Build 即可继续编码。`,
- L2933 `settings.skills.agent.glm`: ZCode Agent`, → Grok Build Agent`,
- L2968 `settings.skills.import.mode.copy.description`: 将完整技能目录复制到 ZCode。外部 Agent 目录后续变更不会自动同步。`, → 将完整技能目录复制到 Grok Build。外部 Agent 目录后续变更不会自动同步。`,
- L2969 `settings.skills.import.mode.symlink.description`: 创建指向外部 Agent 技能目录的链接。ZCode 会跟随来源目录后续变更，但该技能依赖来源路径持续可用。`, → 创建指向外部 Agent 技能目录的链接。Grok Build 会跟随来源目录后续变更，但该技能依赖来源路径持续可用。`,
- L2970 `settings.skills.import.importing`: 正在导入技能到 ZCode`, → 正在导入技能到 Grok Build`,
- L3032 `settings.subagents.description`: 管理 ZCode Agent 运行时消费的用户级子智能体 Markdown 文件。`, → 管理 Grok Build Agent 运行时消费的用户级子智能体 Markdown 文件。`,
- L3119 `settings.plugins.store.subtitle`: 用插件为 ZCode 扩展技能、命令与 MCP 能力`, → 用插件为 Grok Build 扩展技能、命令与 MCP 能力`,
- L3305 `settings.plugins.import.mode.copy.description`: 将完整插件目录复制到 ZCode，并注册到 plugins.dirs。外部 Agent 目录后续变更不会自动同步。`, → 将完整插件目录复制到 Grok Build，并注册到 plugins.dirs。外部 Agent 目录后续变更不会自动同步。`,
- L3306 `settings.plugins.import.mode.symlink.description`: 创建指向外部 Agent 插件目录的链接，并注册到 plugins.dirs。ZCode 会跟随来源目录后续变更，但该插件依赖来 → 创建指向外部 Agent 插件目录的链接，并注册到 plugins.dirs。Grok Build 会跟随来源目录后续变更，但该
- L3307 `settings.plugins.import.importing`: 正在导入插件到 ZCode`, → 正在导入插件到 Grok Build`,
- L3315 `settings.commands.description`: 管理 ZCode Agent 的 .md 命令文件。命令可通过 /command-name 在聊天中调用。`, → 管理 Grok Build Agent 的 .md 命令文件。命令可通过 /command-name 在聊天中调用。`,
- L3317 `settings.commands.source.zcodeAgent`: ZCode Agent`, → Grok Build Agent`,
- L3370 `settings.commands.import.mode.copy.description`: 将命令文件复制到 ZCode。外部 Agent 文件后续变更不会自动同步。`, → 将命令文件复制到 Grok Build。外部 Agent 文件后续变更不会自动同步。`,
- L3371 `settings.commands.import.mode.symlink.description`: 创建指向外部 Agent 命令文件的链接。ZCode 会跟随来源文件后续变更，但该命令依赖来源路径持续可用。`, → 创建指向外部 Agent 命令文件的链接。Grok Build 会跟随来源文件后续变更，但该命令依赖来源路径持续可用。`,
- L3372 `settings.commands.import.importing`: 正在导入命令到 ZCode`, → 正在导入命令到 Grok Build`,
- L3420 `settings.plugins.zcodeOnly`: 仅支持 ZCode Agent`, → 仅支持 Grok Build Agent`,
- L3429 `settingsSync.agent.zcode`: ZCode Agent`, → Grok Build Agent`,
- L3475 `settingsSync.discovery.helper`: 仅导入缺失项，不会覆盖当前 ZCode 中已存在的配置。`, → 仅导入缺失项，不会覆盖当前 Grok Build 中已存在的配置。`,
- L3480 `onboarding.dialog.title`: 欢迎使用 ZCode`, → 欢迎使用 Grok Build`,
- L3484 `onboarding.welcome.title`: 欢迎使用 ZCode`, → 欢迎使用 Grok Build`,
- L3485 `onboarding.welcome.start`: 开始使用 ZCode`, → 开始使用 Grok Build`,
- L3502 `onboarding.stepDescription.migration`: 开始迁移并等待 ZCode 完成导入。`, → 开始迁移并等待 Grok Build 完成导入。`,
- L3518 `(续行)`: 如果目标文件已存在，ZCode 默认 AGENTS 配置会被覆盖。`, → 如果目标文件已存在，Grok Build 默认 AGENTS 配置会被覆盖。`,
- L3569 `chat.placeholder.newTask`: 向 ZCode 提问，使用 @ 添加上下文，使用 / 选择命令或能力`, → 向 Grok Build 提问，使用 @ 添加上下文，使用 / 选择命令或能力`,
- L3570 `chat.placeholder.newTaskMobile`: 向 ZCode 提问…`, → 向 Grok Build 提问…`,
- L4099 `chat.cuaPermission.dragTitle`: ZCode CUA Helper.app`, → Grok Build CUA Helper.app`,
- L4446 `feedback.submit.template.section.copyErrorHeading`: ZCode 报错信息`, → Grok Build 报错信息`,
- L4579 `offPeak.keepAwakeBanner`: ZCode 运行会话时保持电脑唤醒。`, → Grok Build 运行会话时保持电脑唤醒。`,
- L4616 `offPeak.form.instructionsPlaceholder`: 描述希望 ZCode 在后台完成的工作、预期结果和约束，例如整理本周代码改动并生成站会摘要…`, → 描述希望 Grok Build 在后台完成的工作、预期结果和约束，例如整理本周代码改动并生成站会摘要…`,
- L4940 `bots.description`: Connect external chats and webhooks to ZCode bots.`, → Connect external chats and webhooks to Grok Build bots.`,
- L4981 `bots.setup.guide.weixin.create.2`: ZCode saves the bot_token returned by iLink automatically; after → Grok Build saves the bot_token returned by iLink automatically; 
- L4983 `(续行)`: "ZCode uses a built-in iLink client: `/ilink/bot/getupdates` for → "Grok Build uses a built-in iLink client: `/ilink/bot/getupdates
- L4994 `bots.setup.guide.webhook.create.1`: Webhook mode does not require a native bot in the third-party pr → Webhook mode does not require a native bot in the third-party pr
- L4998 `(续行)`: "POST a private-message callback to ZCode's `/api/bots/webhook`  → "POST a private-message callback to Grok Build's `/api/bots/webh
- L5124 `bots.runtime.telegramLongPollingHandledElsewhere`: Telegram long polling is handled by another ZCode window.`, → Telegram long polling is handled by another Grok Build window.`,
- L5201 `welcome.title`: Welcome to ZCode`, → Welcome to Grok Build`,
- L5207 `login.title`: Welcome to ZCode`, → Welcome to Grok Build`,
- L5208 `login.description`: Connect your account to start using ZCode`, → Connect your account to start using Grok Build`,
- L5243 `logout.confirm.title`: Disconnect and restart ZCode?`, → Disconnect and restart Grok Build?`,
- L5396 `modelTrajectory.empty`: No model calls recorded (only ZCode Agent writes model-io)`, → No model calls recorded (only Grok Build Agent writes model-io)`
- L5788 `titleBar.menu.help.about`: About ZCode`, → About Grok Build`,
- L5838 `forceUpdate.title`: Update ZCode to continue`, → Update Grok Build to continue`,
- L5910 `workspaceSidebar.unavailableLocalDirectory`: The workspace directory does not exist or cannot be accessed. Yo → The workspace directory does not exist or cannot be accessed. Yo
- L5950 `ssh.assetInstallModeDescription`: Remote server download reduces upload waiting, but the server mu → Remote server download reduces upload waiting, but the server mu
- L6063 `webRemoteControl.mobileHome.title`: ZCode remote control`, → Grok Build remote control`,
- L6105 `remote.kind.server.wizardDescription`: Running ZCode service`, → Running Grok Build service`,
- L6129 `server.description`: Connect to an already running ZCode server.`, → Connect to an already running Grok Build server.`,
- L6294 `chat.changeSummary.rewindDialog.description`: ZCode checks current file content again before writing. If anoth → Grok Build checks current file content again before writing. If 
- L6379 `settings.terminalFontFamilyDescription`: Leave blank to auto-detect system terminal settings; set a value → Leave blank to auto-detect system terminal settings; set a value
- L6464 `settings.zcodeInteractionBehaviorDescription`: While ZCode is running, add follow-up actions to the queue or gu → While Grok Build is running, add follow-up actions to the queue 
- L6486 `settings.dataBaseDirForbiddenInstallDir`: The data directory cannot be the ZCode installation folder on Wi → The data directory cannot be the Grok Build installation folder 
- L6501 `settings.migration.sectionDescription`: Scan native Claude Code history on this machine, optionally filt → Scan native Claude Code history on this machine, optionally filt
- L6560 `settings.browser.desktopOnly`: Browser data can only be managed in the ZCode desktop app.`, → Browser data can only be managed in the Grok Build desktop app.`
- L6570 `settings.browser.import.helperVerificationFailed`: ZCode could not verify its Windows secure import component. Rein → Grok Build could not verify its Windows secure import component.
- L6573 `settings.browser.import.adminConfirmDescription`: Chrome protects cookies with App-Bound encryption on Windows. Fo → Chrome protects cookies with App-Bound encryption on Windows. Fo
- L6616 `settings.mcp.description`: Manage MCP server configurations used by ZCode Agent.`, → Manage MCP server configurations used by Grok Build Agent.`,
- L6682 `settings.mcp.host.activeDescription`: ZCode provides this MCP server for the {pluginName} plugin. Its  → Grok Build provides this MCP server for the {pluginName} plugin.
- L6690 `settings.mcp.statusOnlyUnsupported`: This ZCode Agent cannot refresh OAuth status. Upgrade or restart → This Grok Build Agent cannot refresh OAuth status. Upgrade or re
- L6738 `settings.mcpServers.import.importing`: Importing MCP servers into ZCode`, → Importing MCP servers into Grok Build`,
- L6820 `settings.modelProvider.startPlan.highlight.trial.description`: Timing starts after signing in to ZCode 3.x.`, → Timing starts after signing in to Grok Build 3.x.`,
- L6827 `settings.modelProvider.startPlan.compatibility`: Supports BYOK and BYOA. Base URL, API format, and API Key are ma → Supports BYOK and BYOA. Base URL, API format, and API Key are ma
- L6921 `settings.modelProvider.codingPlan.purchase.teamMemberNoticeDescription`: Add yourself or other members on the BigModel team plan manageme → Add yourself or other members on the BigModel team plan manageme
- L7246 `settings.usage.billingBanner.description`: Connect your {provider} account to query Coding Plan entitlement → Connect your {provider} account to query Coding Plan entitlement
- L7450 `settings.skills.agent.glm`: ZCode Agent`, → Grok Build Agent`,
- L7485 `settings.skills.import.mode.copy.description`: Copy the full skill directory into ZCode. Later changes in the e → Copy the full skill directory into Grok Build. Later changes in 
- L7486 `settings.skills.import.mode.symlink.description`: Create a directory link to the external agent skill. ZCode follo → Create a directory link to the external agent skill. Grok Build 
- L7487 `settings.skills.import.importing`: Importing skills into ZCode`, → Importing skills into Grok Build`,
- L7552 `settings.subagents.description`: Manage user-level subagent Markdown files consumed by ZCode Agen → Manage user-level subagent Markdown files consumed by Grok Build
- L7639 `settings.plugins.store.subtitle`: Extend ZCode with skills, commands, and MCP servers from plugins → Extend Grok Build with skills, commands, and MCP servers from pl
- L7825 `settings.plugins.import.mode.copy.description`: Copy the full plugin directory into ZCode and register it in plu → Copy the full plugin directory into Grok Build and register it i
- L7826 `settings.plugins.import.mode.symlink.description`: Create a directory link to the external agent plugin and registe → Create a directory link to the external agent plugin and registe
- L7827 `settings.plugins.import.importing`: Importing plugins into ZCode`, → Importing plugins into Grok Build`,
- L7835 `settings.commands.description`: Manage ZCode Agent .md command files. Commands can be invoked wi → Manage Grok Build Agent .md command files. Commands can be invok
- L7837 `settings.commands.source.zcodeAgent`: ZCode Agent`, → Grok Build Agent`,
- L7890 `settings.commands.import.mode.copy.description`: Copy the command file into ZCode. Later changes in the external  → Copy the command file into Grok Build. Later changes in the exte
- L7891 `settings.commands.import.mode.symlink.description`: Create a file link to the external agent command. ZCode follows  → Create a file link to the external agent command. Grok Build fol
- L7892 `settings.commands.import.importing`: Importing commands into ZCode`, → Importing commands into Grok Build`,
- L7940 `settings.plugins.zcodeOnly`: ZCode Agent only`, → Grok Build Agent only`,
- L7948 `settingsSync.action.finish`: Start using ZCode`, → Start using Grok Build`,
- L7949 `settingsSync.agent.zcode`: ZCode Agent`, → Grok Build Agent`,
- L7995 `settingsSync.discovery.helper`: Only missing items will be imported and your current ZCode setti → Only missing items will be imported and your current Grok Build 
- L8000 `onboarding.dialog.title`: Welcome to ZCode`, → Welcome to Grok Build`,
- L8004 `onboarding.welcome.title`: Welcome to ZCode`, → Welcome to Grok Build`,
- L8005 `onboarding.welcome.start`: Start ZCode`, → Start Grok Build`,
- L8022 `onboarding.stepDescription.migration`: Start migration and wait while ZCode imports your selections.`, → Start migration and wait while Grok Build imports your selection
- L8037 `onboarding.agentsFile.confirmDescription`: ZCode will copy {source} to {target}. → Grok Build will copy {source} to {target}.
- L8038 `(续行)`: If the target file already exists, the ZCode default AGENTS conf → If the target file already exists, the Grok Build default AGENTS
- L8089 `chat.placeholder.newTask`: Ask ZCode anything, @ to add context, / for commands or capabili → Ask Grok Build anything, @ to add context, / for commands or cap
- L8090 `chat.placeholder.newTaskMobile`: Ask ZCode anything…`, → Ask Grok Build anything…`,
- L8315 `(续行)`: Compress the current conversation with the current model first.  → Compress the current conversation with the current model first. 
- L8564 `chat.slash.emptyUnavailable`: No slash commands have been broadcast for the current ZCode Agen → No slash commands have been broadcast for the current Grok Build
- L8619 `chat.cuaPermission.dragTitle`: ZCode CUA Helper.app`, → Grok Build CUA Helper.app`,
- L8966 `feedback.submit.template.section.copyErrorHeading`: ZCode Error Info`, → Grok Build Error Info`,
- L9102 `offPeak.keepAwakeBanner`: Keep your computer awake while ZCode is running a chat.`, → Keep your computer awake while Grok Build is running a chat.`,
- L9139 `offPeak.form.instructionsPlaceholder`: Describe a task ZCode can work on in the background, including t → Describe a task Grok Build can work on in the background, includ

## 遗留（不在本次范围/仅记录）

- `src-HCld2afU.js` / `styles` 内 IPC 通道、`ZCode Protocol/1` 协议头、服务名（*ZCodeService）、存储键、`~/.zcode`、`zcode-stdio-tap.json` 等内部标识符：不改。
- `index-ABImDspU.js` `getZCodeStdioTapDevState` preload API 名：不改。
- main `ZCode-CUA-Helper-*.zip` 远端 CDN 工件名（功能性文件名，改动会破坏下载）：不改，记录。
- `e3e`/BIGMODEL 菱形渐变 logo 为第三方(GLM)厂标，vendored：不改。
- package.json name/`@zcode/*` 依赖名（驱动 userData 路径）：不改。
- `chat.cuaPermission.dragTitle` 值已随词典改为 `Grok Build CUA Helper.app`（与 028 一致；若后续恢复真实 helper 包名需同步）。
- **主进程需重启生效**：out/main 与 out/host 的改动（关于弹层/托盘/更新对话框/导出前缀/.desktop）需重启 Electron 主进程后才在运行实例生效；渲染端改动 reload 即生效（已截图验证）。运行实例旧关于弹层截图：/tmp/debrand-shots/03-about-old-main.png；新关于 HTML 静态渲染验证：about-new.html（G glyph+Grok Build，无 ZCode）。

---

# §D — D5c 品牌二次校正（Grok Build → nofy）

> 背景：grok-build 仅为上游仓库名，禁止作为用户可见品牌；用户可见品牌统一为 **nofy**。
> 范围与 D5a 相同：仅用户可见层（标题/弹层/onboarding/logo glyph/占位符/i18n 词典值/通知与对话框文案/导出文件名前缀/托盘/菜单/关于）。
> **不改**：IPC 通道、存储键、~/.zcode 路径、内部标识符、vendored 串、仓库路径。词典键不动，仅改值。
> 注释标记：在 D5a 原标记上滚动为 `REBRAND-0NN+1NN`（1xx = 0NN + 100）。
>
> **大小写规范**：
> - `document.title` / HTML `<title>` / 窗口标题前缀 / alt / aria-label / 托盘 tooltip / 回退显示名 / 占位符（"向 nofy 提问…"）/ "关于 nofy" / "About nofy" / copyright → 小写 **nofy**；
> - 品牌位于句首（含 。！？.!? 之后的新句）或标题短语开头 → **Nofy**（如 `Nofy Agent`、`Nofy Endpoint`、`Nofy Desktop App`、`Nofy 远程控制`、`Nofy will open System Settings…`）；
> - 其余句中位置 → **nofy**。

## D.1 定向条目（1xx = 0NN+100，与 §A 同址）

| ID | 文件 | 现 → 新 |
|---|---|---|
| 101 | out/renderer/index.html | `<title>Grok Build</title>` → `<title>nofy</title>` |
| 102 | out/renderer/index.html | 启动页 G glyph path → 小写 n glyph（viewBox 0 0 256 218，stroke 40：`M78 187 L78 95 A50 50 0 0 1 178 95 L178 187`） |
| 103 | styles-CdEGpc2x.js | `uw` 顶栏 logo dataURI G path → n path（viewBox 0 0 18 18，stroke 2.8：`M5 14.5 L5 8.2 A4 4 0 0 1 13 8.2 L13 14.5`，URL 编码） |
| 104 | styles-CdEGpc2x.js | 内联插件双语描述 6 处 → nofy（句中，小写） |
| 105 | styles-CdEGpc2x.js | HomeHeroLogo(Cit) G path → n path（viewBox 0 0 400 320，strokeWidth 56：`M122 270 L122 148 A78 78 0 0 1 278 148 L278 270`） |
| 106 | styles-CdEGpc2x.js | 顶栏 logo `alt` → `nofy` |
| 107/108 | styles-CdEGpc2x.js | 窗口标题 `Grok Build / ${Go(M)}` → `nofy / ${Go(M)}`（2 处） |
| 109 | styles-CdEGpc2x.js | 设置头 logo `alt` → `nofy` |
| 110 | styles-CdEGpc2x.js | 登录 logo s4t G path → n path（256×218 套） |
| 111 | styles-CdEGpc2x.js | 登录 logo `aria-label` → `nofy` |
| 112 | styles-CdEGpc2x.js | onboarding logo `aria-label` → `nofy` |
| 113 | styles-CdEGpc2x.js | 启动 loading logo e8t G path → n path（256×218 套，保留 animate） |
| 114/115 | styles-CdEGpc2x.js | `pMe`/`gMe = \`Grok Build Agent\`` → `\`Nofy Agent\`` |
| 116 | IntlProvider-C321H7m8.js | i18n 双语词典值 131 处：句中→nofy，句首/标题开头→Nofy（键不动；逐行分布同 §B 各行） |
| 117/118 | out/main/index.js | 外链确认对话框 zh/en → nofy（句中） |
| 119/120 | out/main/index.js | 关于弹层 zh/en aboutTitle → `关于 nofy`/`About nofy`；copyright → `nofy` |
| 121 | out/main/index.js | `K3 = "Grok Build Desktop App"` → `"Nofy Desktop App"` |
| 122 | out/main/index.js | 关于弹层 G glyph SVG → n glyph（256×218 套） |
| 127 | out/main/index.js | `在Grok Build中打开 / Open in Grok Build`（VL/YL 共 4 处）→ nofy |
| 128 | out/main/index.js | CUA Helper 权限对话框 zh/en：句首 `Nofy 将打开系统设置…`/`Nofy will open System Settings…`，句中 `nofy CUA Helper(.app)` |
| 129 | out/main/index.js | 导出日志前缀 `grok-build-logs-full-`/`grok-build-logs-` → `nofy-logs-full-`/`nofy-logs-` |
| 130 | out/main/index.js | 错误截图前缀 `grok-build-error-` → `nofy-error-` |
| 131 | chunk-FQMTTDFW.js | 菜单词典 zh：`关于 nofy`、`Nofy Endpoint`、tray.tooltip `nofy`、`打开 nofy` |
| 132 | chunk-FQMTTDFW.js | 菜单词典 en：`About nofy`、`Nofy Endpoint`、tray.tooltip `nofy`、`Open nofy` |
| 133 | chunk-FQMTTDFW.js | `label: "Grok Build Agent"` → `"Nofy Agent"` |
| 135 | src-reconstructed/modules/I18n.tsx | canonical 词典值同步（与 116 同条目同序，131 处） |
| 136 | src-reconstructed/modules/TopBar.tsx | `alt="Grok Build"` → `alt="nofy"` |
| 137 | src-reconstructed/modules/Settings.tsx | `alt="Grok Build"` → `alt="nofy"` |
| 138 | src-reconstructed/modules/WorkspaceShell.tsx | 窗口标题 `Grok Build / …` → `nofy / …`（2 处） |
| 139 | src-reconstructed/modules/Home.tsx | HomeHeroLogo G path → n path（400×320 套） |
| 140 | src-reconstructed/modules/Modals.tsx | ZCodeLogoSvg G path → n path（256×218 套）；onboarding 欢迎区 `aria-label` → `nofy` |
| 141 | src-reconstructed/modules/UsageDeep.tsx | ZAI_LOGO_DATA_URI G glyph dataURI → n glyph dataURI（18×18 套） |
| 142 | out/main/index.js | .desktop `Comment=Grok Build Desktop App` → `Comment=Nofy Desktop App`；`productName ?? "Grok Build"` → `?? "nofy"` |
| 143 | styles-CdEGpc2x.js | 无用户名回退显示名 `Grok Build` → `nofy`；头像首字母回退 `` `G` `` → `` `n` ``（经 toUpperCase 显示为 N） |
| 144 | out/main/seam/nofy-backend.js | `brand: "Grok Build"` → `brand: "nofy"` |

## D.2 n glyph 画法（三套 viewBox，stroke=currentColor，fill=none，双竖+弧肩）

路径骨架：`M x1 yb L x1 ys A R R 0 0 1 x2 ys L x2 yb`（R=(x2−x1)/2，sweep=1 使弧肩向上拱起；左竖自基线至 ys，半圆肩弧越过右竖顶端，右竖落回基线）。

| 套 | viewBox | stroke | 新 path | 使用点 |
|---|---|---|---|---|
| A | 0 0 256 218 | 40 | `M78 187 L78 95 A50 50 0 0 1 178 95 L178 187` | index.html 启动、登录 s4t、启动 loading e8t、关于弹层、Modals ZCodeLogoSvg |
| B | 0 0 18 18 | 2.8 | `M5 14.5 L5 8.2 A4 4 0 0 1 13 8.2 L13 14.5`（dataURI 内 URL 编码） | 顶栏 uw dataURI、UsageDeep ZAI_LOGO_DATA_URI |
| C | 0 0 400 320 | 56 | `M122 270 L122 148 A78 78 0 0 1 278 148 L278 270` | HomeHeroLogo（Cit/Home.tsx） |

三套均水平居中（A: x∈[58,198] 中心 128；B: x∈[3.6,14.4] 中心 9；C: x∈[94,306] 中心 200），基线/外扩与原 G 一致，未超出 viewBox。

## D.3 计数

- 品牌串替换：319 处原始 "Grok Build"（styles 17、IntlProvider 131、I18n.tsx 131、main 23、chunk 9、seam 2、index.html 1、Modals 1、WorkspaceShell 2、TopBar 1、Settings 1）。其中 → `nofy` 247 处（含预置 4 处：html title、.desktop Comment、seam brand、seam 注释）、→ `Nofy` 70 处、另 2 处窗口标题 tsx 由 Nofy 校正回 nofy。
- glyph path 替换：9 处（A×5、B×2、C×2）；导出前缀 3 处；头像首字母 1 行。
- 审计日志：/tmp/rebrand-d5c-audit.log（332 行，逐处含行号与上下文）；改前备份：/tmp/debrand-d5c-backup/。

## D.4 N/A（D5a 条目在云剔除轮已随代码删除，本轮无落点）

- 123–126（原 023 Endpoint 开发窗口、024/025 强制更新对话框、026 更新 splash）：相关代码已不在 out/main/index.js。
- 134（原 034 host 导出前缀）：重建后的 out/host/index.js 已无日志导出代码（全文无品牌串）。

## D.5 遗留（承 §遗留，另）

- `chat.cuaPermission.dragTitle` 现为 `Nofy CUA Helper.app`（与 128 一致；若后续恢复真实 helper 包名需同步）。
- 头像首字母经 `toUpperCase()` 渲染为大写 N（代码行为，未改逻辑）。
- 主进程改动（关于弹层/托盘/菜单/导出前缀/.desktop）仍需重启 Electron 主进程生效；渲染端 reload 即生效。
