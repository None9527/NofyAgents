# ZCode 3.7.6 UI/UX 源码解析规格（v1.0）

> 目标：100% 基于复原源码（`ref-ui/zcode/apps/desktop/src/renderer/src/assets/*.jsx`、
> shipped css `ref-ui/zcode-restored/out/renderer/assets/styles-BxSv8qTx.css`、
> i18n `IntlProvider-C321H7m8.jsx`、tokens `packages/ui/design-tokens.json`）的 UI/UX 规格。
> 所有结论附证据；无法证实的标 `TODO(evidence)`。
> 主题类名：`theme-zai-dark` / `theme-zai-light`（源码内主题 id）。

---

## 1. 设计令牌

### 1.1 基础
| 令牌 | 值 | 说明 |
|---|---|---|
| `--ui-font-size` | `14px` | 基准字号；`--text-ui-base` = 它，`-lg/+2px`、`-xl/+4px`、`-caption/-1px`、`-sm/-2px`、`-xs/-4px` |
| `--font-sans` | ui-sans-serif, system-ui, …, "Noto Color Emoji" | |
| `--font-mono` | ui-monospace, SFMono-Regular, Menlo, Consolas, … | |
| 圆角 | xs 2px / sm 4px / md 6px / lg 8px / xl 12px / 2xl 16px / 3xl 24px | tailwind v4 尺度 |
| 过渡 | `--default-transition-duration: .15s`，easing `cubic-bezier(.4,0,.2,1)` | 侧栏折叠用 `duration-300 ease-out` |

### 1.2 语义色（dark = `.theme-zai-dark`，light = `.theme-zai-light`）
| 令牌 | dark | light | 用途 |
|---|---|---|---|
| background | neutral-950 系（win 内容区 `bg-background-win-alt`） | neutral-50 | 主内容底 |
| `--color-sidebar` | `#161616` | `#f0f0f0` | 侧栏底 |
| `--color-header` / `--color-panel` | `#202020` | `#fff` | 头部/底部 dock 面板 |
| `--color-card` / input / popover | `#2b2b2b` | `#fff` | 卡片、输入框、弹层 |
| `--color-border` | `#ffffff1a` | `#0d0d0d1a` | 描边 |
| `--color-border-hover` | `#ffffff26` | `#0d0d0d26` | |
| `--color-hover` | `#ffffff0d` | `#0d0d0d0d` | 行 hover |
| `--color-selected` | `#ffffff1a` | `#0d0d0d0d` | 选中行 |
| `--color-surface` / `-hover` | `#ffffff0d` / `#ffffff1a` | `#0d0d0d08` / `0d` | |
| `--color-brand` | `#fff` | `#000` | logo/强调 |
| `--color-accent` | `#001d3d` | `#ebf4ff` | |
| foreground | neutral-200 系（`text-foreground`）；`-subtle`、`-subtlest` 递减 | neutral-700 | 文本三级 |
| 终端调色板 | bg=background, fg=foreground, cursor `#f8f8f8`, red `#ff5c5c`, green `#46bf72`, yellow `#ff8a30`, blue `#4099ff`, magenta `#7b5ce5`, cyan `#42c8c8`… | 对应 light 值 | xterm |
| usage 图表 1-6 | `#4099ff #46bf72 #7b5ce5 #ff5c5c #ff8a30 #42c8c8` | light 对应 | 用量仪表盘 |
| neutral 尺度 | 50 `oklch(98.5% 0 0)` … 950 `oklch(14.5% 0 0)`（纯灰） | | |

### 1.3 滚动条/动效
细滚动条（`scrollbar-width: thin` 风格、webkit 4-8px、thumb 用 border/hover 色）；splash logo pop 动画 `cubic-bezier(.22,1,.36,1)`；侧栏宽度变量 `--workspace-sidebar-panel-width`，折叠动画 `transition-[opacity,width] duration-300 ease-out`。

---

## 2. 窗口骨架

```
shell (h-dvh flex, bg 按平台: linux/win = bg-background-win-alt, mac = bg-background-alt)
├─ Sidebar（左，宽 var(--workspace-sidebar-panel-width)，bg-sidebar，可整体隐藏）
└─ main (flex-1 min-w-0, relative)
   ├─ TopBar 覆盖层：absolute left-0 top-0 z-20 h-14(mac)/h-12(linux/win)，pointer-events-none，左簇 pointer-events-auto
   ├─ 视图内容（home / conversation / settings …）
   └─ BottomDock（终端/浏览器/审查 标签页抽屉，见 §6）
```
- 顶栏是**覆盖层**不是行：内容从其下方开始；整条顶栏为拖拽区（`[app-region:drag]`），按钮 `no-drag`。
- 平台差异：mac 全屏/交通灯左留白 `paddingLeft≈96px`；win 用 `env(titlebar-area-*)` 计算右侧 caption 控件宽度（默认 136px 三键）。

## 3. 顶栏（组件 BOt，styles-CdEGpc2x.jsx）

左簇（`flex items-center gap-1`，顺序固定）：
1. **侧栏开关**：按钮内是 app logo 图（size-5），hover 时 logo 淡出、面板图标淡入（`group-hover:opacity-*`）；快捷键 `toggleSidebar`（TODO(evidence) 默认 Ctrl+B）；侧栏隐藏时图标直接显示面板图标。
2. **任务导航 ← / →**（`taskNav.back/forward`，disabled 态置灰）。
3. **新建任务**：`showNewTaskButton ?? !isSidebarVisible` —— 侧栏隐藏时才展开（宽度过渡 `w-7 ↔ w-0`，300ms）。
4. 更新指示器（LOt：下载中 spin + "updateReady" 胶囊 + 释放说明 popover）。

右侧：平台窗口控件（min/max/close；linux 另有菜单 chevron ⌄ 打开应用菜单：view/zoom/help/about/check-updates/feedback/export-logs/process-monitor/devtools…，见 `titleBar.menu.*`）。

**顶栏没有任何面板图标**（终端/浏览器/审查都不在顶栏）。

## 4. 侧栏（真组件，非 client-clean）

自上而下：
1. logo 行（品牌标 + 前进后退箭头在顶栏，侧栏内仅品牌区）。
2. 导航 4 行（与参考截图一致）：**新建任务（Ctrl+N）/ 搜索（Ctrl+K，`quickPick.find` 任务内查找 + 全局搜索 overlay）/ 自动化 / 技能**。无终端/文件/Git/浏览器。
3. 分段控件 `分组 | 项目`（pill segment，active 黑底描边）+ 右侧 filter/archive 图标。
4. **列表区（唯一滚动容器）**：
   - 项目视图：workspace 行 + 任务行（标题 + 相对时间；未读点；hover 出 `…` 菜单）。
   - 分组视图：group 节点（可改色/重命名/取消分组，`taskGroup.*`）+ 任务。
   - 任务行上下文菜单（`dzt`）：移动到分组▸、置顶、重命名、**归档**、**标记未读**、在文件管理器打开、复制路径/任务路径/日志路径/JSONL路径/会话ID、打开方式▸。
   - 时间线：相对时间（今天/N天/N分钟）。
5. 底栏（固定）：头像 + 用户名/`连接使用`(未登录) + 右侧菜单：用量(plan/配额)、设置子菜单（**主题 zai-dark/zai-light**、**界面缩放**、**语言 zh-CN/en-US/系统默认**）、社群、下载日志、设置入口。

## 5. Home 视图

- hero：品牌线框 logo 居中大图；问候语按时间段（`greeting*`）。
- workspace 行：🗀 名称 + git 分支 chip（分支·变更数）+  菜单（最近项目/打开工作区）。
- composer 卡（`rounded-xl border bg-card` 双层）：
  - 输入区 multiline，placeholder「向 ZCode 提问，使用 @ 添加上下文，使用 / 选择命令或能力」。
  - 工具条左：`+` 附件、**变更前确认**（手图标+⌄）、**计划模式**；右：供应商/模型⌄、**思考级别⌄（最高等）**、发送圆钮。
  - 提及菜单：`@` 文件、`#` 会话、`>` 命令（`mC`：commands `>`、conversations `#`、files `@`）。
- banner 行（📢 可关）。
- 建议卡 3 张（icon+title+body，`rounded-xl border`）。

## 6. 会话视图

- 头部：← 返回、标题、状态、用量/上下文 chip、动作（导出/重命名/置顶/归档/删除等）。
- 消息流：turn 以 **turnHeader** 分段（kinds: `userInput | backgroundResult | goalContinuation | editRerun`；state running/completedSuccess/…）。
  - **每轮头部动作**（schema `actions`）：`canFork / canEdit / canRetry / canRewindFiles`，`editDisposition: rewind|fork` —— 即 重试/编辑/回退文件 是**轮级菜单**，不是消息气泡按钮。
  - 工具行：`▶ ✓ 名称: 摘要` 折叠块（bash 显示命令前缀）。
  - 思考/摘要折叠；markdown 富文本（代码块带语言头+复制）。
- **右侧 aside 摘要面板**（`Flt`）：mini（悬浮小卡）/panel 两态；内容=目标(goal)、git worktree 变更摘要、运行中 bash/子代理计数；`@min-[1136px]` 断点行为。
- 底部 composer 同 home。
- **quick pick find**（Ctrl+F 类）：scope 切换 消息/文件变更，`{current}/{total}` 导航。

## 7. 底部 Dock 面板（终端/浏览器/审查）

- 形态：**底部抽屉，多标签**（xterm 终端 tab ×N、浏览器 tab ×N、审查/diff tab）。
- 终端：`terminal.*`（新建/关闭tab/复制/粘贴/`[进程已退出]`），快捷键 toggleTerminal（TODO(evidence) 默认 Ctrl+J/`）。
- 浏览器：地址栏（输入网址回车）+ 后退/前进/刷新 + 更多⌄（外部打开/devtools/自由尺寸 responsive）。
- 审查：diff/变更列表（`add-review-tab` icon=diff，关键词 变更/审查）。
- 入口：**仅** quick-pick `panels` 段 + 快捷键；不在侧栏/顶栏。

## 8. Quick Pick 命令面板（`quickPick.*`：标题「命令面板」，placeholder「输入命令」）

段序：`suggested 建议 / recommended 推荐 / chat 对话 / navigation 导航 / panels 面板 / configure 配置 / app 应用`。
命令清单（id → icon/shortcut/run）：
- suggested: new-task(message,Ctrl+N), open-workspace(folder), settings(gear)
- chat: （会话级命令：compact/rewind 等，TODO(evidence) 全量）
- navigation: previous/next-conversation, go-back, go-forward, find
- panels: toggle-sidebar, toggle-terminal, toggle-preview(browser), add-terminal-tab, add-browser-tab, add-review-tab, toggle-side-pane, toggle-browser-panel, toggle-diff-panel
- configure: settings, mcp-servers, personalization, skills, switch-theme-dark/light
- app: feedback, my-tickets, community, product-docs, login/logout

## 9. 设置视图
左段列表（`settings.*`）：通用(语言/主题/缩放)、模型供应商、MCP 服务器、**HTTP 代理**、**记忆查看器**（5MiB 预览限制等）、自动化、技能、关于/更新。右栏行式（label+control）。

## 10. 其他覆盖层
- directoryBrowser（浏览文件夹：路径输入/Go/显示隐藏/选此目录）。
- 反馈对话框、我的反馈列表、更新状态窗、进程监控窗（独立 window）。

## 11. 快捷键（已证实/推断）
| 键 | 动作 | 证据 |
|---|---|---|
| Ctrl+N | 新任务 | 参考 UI + client-clean |
| Ctrl+K | 搜索/查找 | 参考 UI |
| Ctrl+B | 切换侧栏 | TODO(evidence) |
| toggleTerminal | 切换终端 | shortcuts 注册表传入，默认值 TODO(evidence) |
| Ctrl+P/⇧P | 命令面板 | TODO(evidence)（quickPick.title 存在） |

## 12. 与我们现实现的差异清单（rework 依据）
1. 主题令牌：现 base 用 client-clean 采样值（sidebar #2b2b2b 等）→ 换成 §1.2 真值（sidebar #161616、card #2b2b2b、border #ffffff1a…）。
2. 顶栏：现左簇 logo+←+→ 已对齐；需补 更新指示位、菜单 ⌄ 内容、新建按钮的隐藏侧栏时展开动画。
3. 侧栏：现结构已对齐 4 导航+分段+滚动列表+底栏；需补 任务行上下文菜单（归档/未读/复制路径…）、底栏设置子菜单（主题/缩放/语言）、用量块。
4. 终端/浏览器/审查：现是独立全视图 → 改为**底部 dock 标签抽屉**，入口仅 quick-pick/快捷键。
5. 轮级动作：现气泡下 👍👎↻✎ → 改为 **turnHeader 级菜单**（重试/编辑/回退文件/fork）。
6. 右摘要面板：现工作面板为自绘抽屉 → 改为会话右侧 aside（mini/panel 两态，goal+变更摘要）。
7. quick pick：现 palette 自绘 → 换成 §8 段序+命令清单+「命令面板」文案。
8. 文件浏览：移除独立视图 → @ 提及 + directoryBrowser 对话框。

## §13 v2 复核：窗口骨架的真实结构（源码行号证据，styles-CdEGpc2x.jsx）

v1 的若干结论被推翻，以下为逐行复核后的权威结构：

1. **顶栏 BOt（108974）是绝对定位浮层**：`absolute h-14 left-0 top-0 z-20 w-fit`，侧栏可见时宽度 = `var(--workspace-sidebar-panel-width)`。左簇仅含：logo（hover 变形为侧栏开关图标，109033-109039）、任务后退/前进（109044-109060）、新任务按钮（宽度动画 `w-7↔w-0`，109062）。**顶栏不含任何面板图标、不含窗口控制**。

2. **右侧簇**：首页草稿态（`Mr` 分支，149345）= `[H6 终端开关][S6 ⌄ 窗口菜单]`；会话头 TFt（119988-120032）右 = `SFt`（[xFt 工作区/编辑器选择][U6 帮助，Win/Linux 隐藏][H6 终端][侧栏面板开关 ibe/abe]）+ `S6`。参考图右上 = 终端图标 + 带 `border-l` 分隔的 ⌄ + 原生 −□×（已用 ref-tr2.png 逐像素确认）。

3. **S6 = WindowsCaptionMenuButton（117848）**：`w-[45px] border-l border-border/50`，菜单项：新建任务 Ctrl+N、打开工作区 Ctrl+O、在文件管理器中打开、关于、检查更新、进程监视器、问题反馈、产品建议、用户社群、产品文档、导出日志、DevTools、关闭窗口。

4. **U6 = 帮助菜单（119420）**：问题反馈/产品建议/用户社群/产品文档/导出日志。**H6 = 终端开关（119406，Ctrl+J，激活态 `!bg-selected`）**。

5. **会话头 TFt（119988）**：`h-12 border-b`；左 = wFt（119497）：[工作区面包屑 j6][h1 任务标题 font-semibold truncate][变更摘要圆角 pill `rounded-full bg-tag/50`][git 分支 chip + 刷新]；非 Mac 桌面 `pr-[120px]` 让位原生窗口控制。

6. **主体三分（149287-149335）**：`section.bg-background` 内 = 头部 + `<X4 水平分割>[conversation-column | Dr 右摘要栏]`；conversation-column 内 `<X4 vertical>[conversation 聊天 | Mqt 底部 dock]`。**dock 在会话列内部（聊天下方），右摘要栏与整个会话列并排**——v1 把 dock 放在窗口底部、把面板开关放进 quick pick 均错误。

7. **Mqt dock（148118）**：`Z4 id="terminal" border-t minSize 140px maxSize 50%`，内含 jqt（147904）终端/浏览器标签页：标签栏 + 新建标签 + 关闭最后一签时收起面板。

8. **侧栏 rVt（132075）**：`aside flex h-full flex-col` = `h-12 drag 条`（顶栏浮层压在其上）+ 导航 4 行（新建任务/搜索/自动化/技能）+ **分段行（分组|项目 pill + 排序/归档图标）位于滚动容器内部** + 项目/任务 section + 页脚 SRt。

9. **首页草稿头（jr，149295）**：`h-10` drag 区，右 = `[U6][H6]`（Mac）或 Mr 分支 `[H6][S6]`（参考图态）。

实现已按本复核重构：TopOverlay/CaptionRight 浮层、ws-header 全宽头、task-body 水平分割（会话列|工作面板）、会话列内 dock、首页 composer 卡内嵌工作区行、暗色细滚动条。
