# UI/UX 参照账（S0 裁定：界面跟 ZCode 的组织，代码不跟）

> ⚠ **2026-09-10 活壳取数后**：本表「顶栏 / 底部 dock / 右辅助 pane 列位置 / 布局引擎」
> 四行已被 §8 取代（ZCode 3.11.2 的 CDP 盒模型实测，见 zcode-live-metrics.md）。
> 3.7.6 逆向词给的「全宽顶栏 + 整窗状态栏」是误读；活壳的 header 在对话卡片里。

证据三源，互相对照：

1. **活壳**（dev.zcode.app 在跑）：设置面与主工作区面各一张截图（/tmp/zcode-shell-1/2.png，
   易失；重捕方法见 §5）。给「现在长什么样」。
2. **逆向源码** `desktop/src/src-reconstructed/modules/`（104 个 tsx，只读参照）：
   给「为什么这么组织」。关键件：`WorkspaceShell.tsx`(6017 行)、`Sidebar.tsx`(5636)、
   `SidePanel.tsx`(4789)、`TopBar.tsx`(3098)、`Conversation.tsx`(8342)、
   `Composer.tsx`(9321)、`stores-{core,session,tasks,workspace}.tsx`。
3. **实测契约** `docs/contract/*`：给「哪些量真的存在」，防 UI 画空气。

干净室边界不变：只取**组织与交互语法**，组件全部自写；截图含用户真实会话标题/路径，
**禁止入库**，本账只记结构不贴图。

---

## 1. 壳的四区语法

| 区 | ZCode 的证据 | 我们的落点 | 裁定 |
|---|---|---|---|
| 侧栏 | 活壳：顶部动作栈（新建任务⌘N / 搜索⌘K / 自动化 / 插件市场）→ **按工作区分组**的会话列表（组内相对时间 + 暂停/刷新态 + 「显示更多」分页）→ 底部「任务」区（后台队列）→ 用户页脚。源码 Sidebar.tsx | `features/shell/Sidebar.tsx`：按 `session.cwd` 分组 + `queueEntries` 任务区（只读）+ 动作栈；未接线的动作**显式标灰并写明接哪一期** | 采用 |
| 对话列 | 活壳：流式脊柱 + 「已工作 1 分 58 秒」段耗时芯片 + 子智能体进度浮层 + diff 汇总条（`1 个文件已更改 +9 -9` + 撤销）+ composer | `features/conversation/*`。段耗时/diff 汇总/子智能体浮层登记为 P2 块形状，录到夹具再画 | 采用 |
| composer 工具条 | 活壳：左 = 附件＋ / **权限模式选择器**（「完全访问」）/ 电脑操作开关；右 = 模型选择器 / 推理档（「最高」）/ 圆形发送 | 模型选择器**从顶栏移进 composer 右组**；权限模式位保留但 S0 是占位芯片（见 §3） | 采用 |
| 右辅助 pane | 活壳：标签页（「Visual review π」+ ＋）；源码 SidePanel.tsx 的 `focusPane(paneId)` / `replacePaneBinding(paneId, SessionBinding)` ⇒ **pane 与 session 绑定** | `features/shell/AuxPane.tsx`：S0 只读 roster 标签；子智能体/评审会话将来按同一绑定模型开标签 | 采用（绑定模型记为裁定） |
| 底部 dock | 源码 DockTerminalBrowserPanel（F13）：终端/浏览器 | **不做**。我们未声明 terminal 能力（caps.ts 裁定），内核自管终端；浏览器面不在 P1–P8 | 跳过（记理由） |
| 顶栏 | 活壳：cwd 面包屑 + 模式芯片 + 「…」+ 右侧 pane 开关图标组 | 面包屑 + aux 开关 + 主题；模式芯片等实测来源（§3） | 采用 |
| 布局引擎 | 源码：vendored react-resizable-panels；持久化键 `react-resizable-panels:{layoutId}:{panelIds}`；`useCollapsiblePanel` 记开合+尺寸；CSS var `--workspace-sidebar-panel-width` | S0 固定宽 + aux 可折叠，**开合态持久化**（`nofy-desktop:layout`）；可拖拽分隔留到 P2 之后，不提前引依赖 | 改编 |
| 设置面 | 活壳：分组左导航（基础设置 / Agent 能力 / 数据与统计 / 引导）+ master-detail + 状态芯片 + 内联校验 | 登记为 P6；分组词汇直接沿用（用户肌肉记忆） | 采用（延后） |

## 2. 状态组织：域切片，但单 store 单 dispatch

ZCode 的 store 按域分文件（stores-core / session / tasks / workspace）。
我们维持**单一 reducer store、唯一写入通道 dispatch**（TUI 纪律，86 例门钉着），
但裁定：P1 起把 `project.ts` 的 reducer 切成同域 slice（connection / session /
tasks / workspace），reducer 形状即契约、迁移机械。**现在不切**——
624 行刚被回放门钉住，无收益的重排只是风险。

## 3. ⚠ 权限模式：必须可见，但 S0 只能是占位

活壳把模式选择器放在 composer 左下（「完全访问」）。我们的实测账
（permission-flow-measured.md §0）说得更硬：`ui.permission_mode="always-approve"`
时内核**完全不发**权限请求——不显式呈现模式，用户会把「没弹窗」误读成「安全」。

但**生效模式的线路来源尚未实测**：config.json 的 `ui.permission_mode` 是文件不是线路；
settings 读路径没录过夹具。按「一条不造」：S0 在 composer 放占位芯片并标明「未接线」，
录到 settings 读路径即换真选择器。不猜、不藏、不假装。

## 4. 明确不跟的

- **进程拓扑** main/host/scheduler：裁定 B 已否（旧路 D1/D2 的成因是三层桥从未被端到端验证）。
- **flat modules 平铺**：104 个大组件文件、无特性域边界，是「越做越难改」的本体；我们按 features/ 分域。
- **线路名进组件**：ZCode 的线路形状抹在组件里；我们线路名只准住在 core/ 与 seam/
  （`core/interactions.ts` 是裁决面分类的守门点，dep 纪律见 ipc-boundary.md）。
- **office/pdf/xlsx/legacy-doc 预览族、Payment/Onboarding/Feedback/SkillStore/Remote**：
  不在 P1–P8，不建 chrome（建了就是永远空着的菜单项）。
- **markdown 渲染**：ZCode 有 12 个 Markdown* 模块；我们 P2 再上，S0 用 pre-wrap。
  诚实的简陋好过错误的精致。

## 5. 重捕活壳参照

CUA：`getApp("dev.zcode.app")` → `getScreenshot()`；设置面在工作区面点「返回工作区」可互切。
只读不改：不点编辑/删除/发送类控件。截图**不落库**。

## 6. 工艺批 1/2 落地记录（2026-09-10）

用户裁定「太简陋，达不到 ZCode 水平」后的第一批追赶。全部真机截图验过：
/tmp/nofy-s8-md.png（真轮次：markdown 标题/列表/行内码/围栏码）、
/tmp/nofy-s9-empty.png（品牌空态）。截图含工作区路径，不落库。

已落：

- **图标系** `ui/icons.tsx`：自绘 24×24 stroke 几何 22 枚（干净室，不取任何图标库资产）。
  侧栏动作行、组头、composer 工具条、顶栏开关、状态栏全图标化——纯文字按钮是 demo 感第一来源。
- **自绘弹层** `ui/menu.tsx` 替掉**全部原生 select**（模型/主题/诊断）：macOS 原生弹出层
  无法样式化，是 demo 感第二来源。关层靠 fixed overlay + Esc，不碰 document API（dep-guard 兼容）。
- **markdown 渲染** `ui/markdown.tsx`：输出 React 节点、不产 HTML 字符串（模型文本不可信，
  从构造上无注入面）。标题/列表(一层嵌套)/引用/分隔/围栏码/行内码/粗斜体/链接；
  不支持的行原样进段落——渲染失败的表现是朴素，不是错乱。
- **composer 工艺**：2xl 圆角卡、图标工具条、圆形发送/停止、受控草稿（空态建议芯片填进来）。
- **侧栏工艺**：navrow + ⌘hint、可折叠工作区组（窗口局部态）、任务区图标头。
- **空态品牌化**：mark + 标题 + 三条建议芯片；「只有 hook 事件」也视为空态——
  投影层一条不落（blocks 与诊断计数都在），视图层在首屏让位，hook 噪声不是首屏内容。
- **状态栏降级**：产品面只留连接点 + 内核版本 + 轮级用量 + stopReason；
  诊断量（事件/表外/边界自检/平台）收进弹层，一次点击可达；warn 色只给边界自检失败，
  表外事件计数是常态信息不是事故。
- **回合「已工作 Ns」**：本地墙钟计时（首帧到当前），title 写明，不与内核任何字段混淆。
- **全局手感**：滚动条、selection、focus ring、120ms 过渡、层级底色、hook 行收成淡 meta。

### 工艺批 3（同日晚些）：代码块与表格达到活壳结构级

- **代码块外壳** `ui/codeblock.tsx`：语言条 + 复制按钮 + **行号（CSS counter，活壳同法）**
  + 高亮正文。解剖对照 streamdown 族（MarkdownCodeBlock.tsx 头注）逐件落：
  Header/CopyButton/lineNumbers 都有；DownloadButton 与 shiki 精度留在 §7。
- **自写高亮** `ui/highlight.tsx`：字符扫描器（非正则地狱），每行独立 token 化；
  类别 comment/string/number/keyword/func/type/punct；语言族 ts/js/rust/py/bash，
  认不出的落 generic（字符串/注释/数字仍分色）。颜色走我们自己的 --code-* 语义层，
  亮/暗各一套——**亮色走查已做**（/tmp/nofy-s11-light.png）。
- **markdown 表格**：表头+分隔行识别，渲染 thead/tbody，inline 语法照旧。
- 真轮次截图 /tmp/nofy-s10-code.png：ts 代码块（关键字紫/字符串绿/函数蓝/类型青）
  + 三列表格 + 行号 + 复制按钮，全部在真内核轮次里渲染。
- 走查抓到的小修：主动作行里的 kbd 在近黑底上不可见 ⇒ .navrow--primary .kbd 反色。
- 一处环境事实登记：主题偏好存在 Electron profile 的 file:// localStorage，
  **跨实例共享**（曾残留 zai-dark）；这是 file:// 源的固有行为，不是我们的 bug，
  但说明「清偏好」要清 profile 而不是清 home。

## 7. 仍未达到活壳水平的下一批（按性价比序，批 3 后刷新）

**已完成（2026-09-10 晚）**：⌘K 命令面板（生态面 #1，解剖抄 QuickPick.tsx，纯模型 14 例门）；
大布局改正（§8）；侧栏可拖分隔条；roster 字段进 store ⇒ 未加载会话可经面板 session/load（P1 冷启动）。
**已完成（2026-09-10 夜）**：生态面 #2 文件 pane——辅助 pane「文件」标签：
逐层树（fs/list depth=1、includeHidden=false、respectGitIgnore 默认 true 挡 node_modules）、
文件预览（fs/read_file + 既有 CodeBlock）、模糊搜索（fuzzy open/change/status 通知/close，
结果住 store.search，generation 乱序旧批丢弃）。4 例门 test/readers-eco.test.ts。

1. **审查 pane（生态面 #4）+ diff 汇总条**：`git/status`（staged/unstaged + additions/deletions
   + patch）与 `git/diffs`（**from 必须大写 HEAD**，小写 head 静默返回空）+ `git/files` 取 HEAD 侧内容。
2. **终端 pane（生态面 #3）**：pty 全生命周期已实测；**写入必须 base64 的 data 键**（input 键静默丢弃），
   输出帧 data 也是 base64；shell 会发终端能力探测序列 ⇒ 需要真 VTE（PLAN §4 已选 @xterm/xterm）。
3. **市场/技能/插件/MCP（生态面 #5）**：marketplace/list(292 条目) / skills/list(155) /
   plugins/list / mcp/list(servers+tools+status) 均已实测。
4. **设置面（P6）**：分组词汇沿用活壳；config 读写路径待录（内核无 config 读 ext，走本地 config.json）。
5. **用量面（生态面 #7）**：session/usage 九量已实测。
6. 代码块下载按钮 / shiki 精度 / mermaid / 虚拟化长脊柱：排在 pane 之后。

## 8. 大布局（2026-09-10 活壳 CDP 实测改正）

整窗 = 侧栏(264px 全高, 宽变量可拖) + 分隔条 + 主列(min-w 320, 右/下 4px 缝)；
主列 = h-1 拖拽条 + **对话卡片**(rounded-xl + border + bg-background)；
卡片 = h-12 头(左：标题 + 路径胶囊 + ⋯，空态为空；右：帮助/切换终端/展开·收起侧边面板
三枚 28×28) + 卡体(对话列 + 辅助 pane)；
侧栏 = h-12 拖拽区 + 红绿灯旁绝对叠层(y=16, x=96 起 pitch 32 四枚) + 动作四行 +
tabs 行(分组|项目 + 三枚 24×24) + 列表(分区头→项目行→任务行) + h-56 页脚
(诊断卡 + 设置齿轮 32×32；**主题住在齿轮菜单里**)；
**没有全宽顶栏行、没有整窗状态栏行**（诊断收进侧栏页脚账号卡槽位的菜单）。
逐条盒模型对照与自量结果见 zcode-live-metrics.md §1/§1.1/§1.2。

### 8.1 第二轮槽位改正（同日，用户指正后）

第一轮把主题/设置/诊断放进了卡片头右簇、把新建任务行从动作区删掉——两处都是看错槽位。
教训记在 zcode-live-metrics.md §1.3：**按区域取数而不是按标签取数**（新建任务行是 DIV）、
**aria-label 是槽位语义的真相**、**状态切到再量**（空态/会话态的卡片头左半不同；
Radix tabs 的 trigger 吃 pointerdown，合成 click 不生效）。

CUA：`getApp("dev.zcode.app")` → `getScreenshot()`；设置面在工作区面点「返回工作区」可互切。
只读不改：不点编辑/删除/发送类控件。截图**不落库**。
