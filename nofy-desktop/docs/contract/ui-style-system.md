# 统一样式方案

对话与设置页参照 ZCode 3.14.3 的中性配色、紧凑控件和清晰表单。沿用现有 theme 令牌，不引入第二套色板或字体。

## 唯一来源

| 层 | 位置 | 职责 |
|---|---|---|
| 主题 | ui/themes/zcode.json → ui/tokens.css | 颜色、字体、基础尺度；tokens.css 是生成物 |
| 基础 | ui/foundations.css | 页面 reset、字体、全局基础语义 |
| 共享控件 | ui/components.css、primitives.tsx、forms.tsx、dialog.tsx | 按钮、输入、字段、弹窗、菜单、状态与焦点规则 |
| 共享内容 | ui/content.css | Markdown、代码块与正文排版 |
| 对话布局 | ui/conversation.css | 消息、工具、审批、输入区的组织与布局 |
| 设置布局 | ui/settings.css | 导航、分组、列表及编辑页面的组织与布局 |
| 文件工作区布局 | ui/workspace.css | 资源标签、阅读 Header、正文/树并列与窄面板抽屉 |
| 壳与其余功能 | ui/styles.css | 导入入口、窗口/侧栏/辅助面板布局及未迁移领域 |

页面不得复制按钮/input/弹窗的颜色、描边、圆角、禁用和 focus 样式。布局调整留在页面所属模块；动态面板尺寸允许 CSS 变量，静态装饰不得写内联 style。
同一 selector 在同一 at-rule 上下文只能定义一次。响应式或状态变体允许有明确不同上下文；禁止在 styles.css 末尾继续堆叠同类覆盖。

## 共享 API

`Btn` 使用统一 plain/primary/danger/ghost，支持原生 button 属性与 sm/md/lg/icon 尺寸。
`Field`、`TextInput`、`SelectControl`、`TextArea` 提供一致字段标签和输入外观。
`Dialog` 管理居中弹层、背景、焦点与 Esc；保存中禁止关闭。

## 本轮页面组织

通用设置只保留主题、字号、语言和版本。模型单独分区，默认显示模型列表，新增/编辑用同一个编辑弹窗。
首页移除实现说明，保留简短任务引导。消息区与输入框对齐同一内容宽度，工具行和轮级动作降低视觉权重。
会话菜单、回退弹窗、模型弹窗复用共享样式；审批卡维持功能和权限语义，仅统一间距、字体与控件外观。

## 验证

以真实 Electron 截图检查对话、通用设置、模型编辑和审批，覆盖深/浅两主题与 1024 窄窗口。
功能沿用 GUI 回归，另外检查共享 CSS 的重复 selector；不以样式数值镜像单测代替视觉检验。

## 本轮执行结果（2026-10-09）

类型检查、构建、`pnpm ui:check` 通过；桌面 270/270 与 ACP 41/41 单测通过。
Electron GUI 对话 11/11、项目/会话 11/11、设置 11/11，使用隔离的确定性模拟内核，未将模拟结果当作真实模型连接验证。

- 对话截图与报告：`output/playwright/2026-10-09T03-40-17.304Z/`。
- 项目/会话报告：`output/playwright/project-2026-10-09T03-44-28.530Z/`。
- 设置截图与报告：`output/playwright/2026-10-09T03-43-23.904Z-settings/`。

macOS arm64 包已重新生成，两次隔离启动正常退出并回收内核。本地 ad-hoc 签名；内核不随包捆绑。


## 2026-10-11 控件收口

ModelSettings、BundleSettings 和通用设置选择框已接入共享控件；set__write 使用点与兼容 CSS 已删除。样式门覆盖七个模块，设置页面另有 AST API 边界测试。截图和功能记录见 [架构收口](../architecture/frontend-closeout-2026-10-11.md)。


## 2026-10-11 输入菜单与玻璃回归修复

共享 MenuButton 原先向上 modifier 被后置通用 top 覆盖，造成上下同时定位、菜单高度被压缩。现将弹层 portal 到 body，按触发器矩形与视口统一定位、翻转和限高，避免 composer/侧栏 containment 与 overflow 裁切；关闭恢复焦点，支持方向键与 Esc。菜单定位只在 ui 层处理，features 不接触 DOM。

.sidebar 的实色背景遮住了既有 under-window vibrancy，已改回透明，shell 保留半透明主题 tint，正文卡片维持独立背景。深浅主题 CSS 实测 body/sidebar 透明，shell 半透明；Electron getBackgroundColor 不返回 alpha，不用于推断原生透明度。OS 材质的实际强度仍受系统外观/辅助功能影响。

399 单测、62 GUI 用例通过；专项覆盖三尺寸的附件/权限/模型菜单完整边界与实际命中、焦点/键盘/外部关闭、两主题透明层。包两次隔离启动通过，旧版进程已退出并重新打开新包。交付记录见 [菜单与玻璃证据](../architecture/frontend-menu-glass-evidence-2026-10-11.json)。


## 2026-10-11：对话展示与查找工具条

- 原因：查找大按钮常驻内容区；`agent_thought_chunk` 每帧新建块，导致重复“思考”与大段空隙。
- 投影：相邻且未关闭的思考 delta 原样拼接，不插入空格；工具或正文分开顺序，response/turn 完成关闭思考。回放走相同逻辑，不改内核协议。
- 视图：思考结束后默认折叠，可展开读取；流式思考默认展开并限制内部高度。正文、过程、用量使用既有 token；零用量不展示，段级用量不冒充轮级统计。
- 查找：右上角图标及 ⌘F/Ctrl+F，工具条位于 transcript 滚动容器外，占据正常布局空间，不遮挡消息；Enter/Shift+Enter 导航，Escape 关闭。先跳首个匹配，再循环。
- 样式唯一所有者继续为 `ui/conversation.css`；快捷键复用 `ui/hotkeys.ts`，features 不直接访问 window/document。
- 验证：403 单测，23 GUI 场景，暗/亮主题及 1280/880 宽度；一万条历史的定位、锚点、折叠重测和重载回归通过。最终轻量留白调整另通过类型检查及 3 个展示场景。性能和包证据见 `frontend-transcript-evidence-2026-10-11.json`。


## 2026-10-11：ZCode 对照修正（取代前一轮查找入口位置）

查找入口归任务头部，关闭时不显示 transcript 工具条；仅展开时显示会话内查询行。过程流保持 middle → final → following 的原始顺序，hook 在视图过滤而不删除投影。右侧栏在 ≤900px 窗口采用完整高度覆盖布局，禁止重新压成底部 35% 面板。详情见 `frontend-zcode-alignment-2026-10-11.md`，样式所有者仍为 conversation.css、styles.css、workspace.css。


## 2026-10-11：统一富文本与消息呈现

Markdown 统一使用 CommonMark/GFM 语法树，禁止再复制手写解析器到页面。富内容控件归 ui/contentActions、markdownTable、codeblock；消息几何归 conversation.css，富文本几何归 content.css，阅读列与输入列宽度分开设 token。工具相邻合组保留顺序；文件计数必须来自真实路径。代码默认 API 保留文件源的行号和外层滚动，对话围栏的高度限制不得应用到编号源码块。详情见 `frontend-rich-conversation-2026-10-11.md`。


### 用户气泡操作行（2026-10-11）

对照 ZCode `v4/ConversationRowView.tsx:1284`：MessageActions 使用 `mt-1`，默认 opacity-0，用户行 hover 或动作区 focus-within 时显示。本项目气泡和 TurnActions 同属 `.user-message`，间距 4px，透明隐藏但保留占位；整组 hover/focus-within 显示，触屏保持可发现，减少动效时取消渐变。禁止再把动作行作为 turn-segment 的独立 18px 间距项。


## 主页工作台契约（2026-10-11 H1–H4）

右栏与对话列是Workbench平级区域，顶部对齐、各自拥有头部；不得把右栏放回对话标题之下。共同内容宽度由conversation-column与对话container query决定，禁止为输入/正文新增独立max-width。侧边弹层用原生modal，菜单portal进入所属dialog；并排区域避免自动焦点。阅读位置由application保存，DOM尺寸与滚动由ui协调。文件阅读恢复必须等待可见尺寸，不能写回父容器隐藏造成的0。


## 右栏资源 chrome（2026-10-11）

右栏只允许一条顶部资源标签条，由 AuxPane 与 application/workspace 控制器装配。FilePane 禁止再创建文件标签条；路径/复制/打开/目录操作共用 ResourceHeader，文件标签双击固定、标签按钮关闭；禁止新增刷新/关闭工作区的“⋯”入口，也禁止固定/刷新单独占行。workspace.css 拥有右栏内部几何，控件沿用共享 Btn/MenuButton，预览与目录树使用同一背景 token。

文件预览独立适配可用内容宽度：窄栏目录树并排收缩，不覆盖正文；源码默认换行、行号留独立 gutter。CodeBlock 的 defaultWrap 为可选参数且默认 false，由文件源码启用，禁止改变对话 Markdown 的既有默认。图片同时限制宽高，Markdown 内图片限制内容宽度。


## 上下文浮层与分隔条（2026-10-12）

上下文 HoverCard 必须使用 UI 层的 AnchoredPopover/top layer，禁止在有 overflow 裁剪的 composer/dock 内 absolute 定位。浮层依窗口空间限高并内部滚动。并排中右栏采用1px通顶直线、拖拽热区8px；禁止再叠加 main 右padding与独立分隔占位。


## 左栏窗口导航（2026-10-12）

WindowNavigation属于ShellLayout窗口槽，禁止放回会随aside折叠而消失的子树。窗口按钮必须显式no-drag；Mac交通灯保留空间，保留控件原尺寸；240px以下直接折叠，禁止工具行越出左栏。折叠时主列标题必须为仍可见的窗口导航让位，开合状态仍只归窗口偏好所有者。

窗口导航是普通no-drag岛，渲染顺序放在拖动区域之后，禁止加回container-type或pointer-events:none。页脚诊断与设置共用一块footer-card表面。Electron DOM点击通过不能替代OS原生命中验证。


## 折叠内容列（2026-10-12）

侧栏折叠后，main左侧恢复4px框架间隔；conversation容器共用clamp(32px, 5cqw, 64px)总内边距与1152px阅读上限，正文/输入/审批/队列保持同一列。列宽连续变化，不再通过864/1280px断点切换，避免侧栏动画触发二次跳动。禁止将标题栏的导航让位空间应用到正文，或沿用896px上限造成1280px窗口的大块空白。空会话引导列仍单独封顶672px。

中右栏并排接缝由aux__handle一条1px直线独占；中栏右边框、右栏左边框与接缝侧圆角必须去掉，禁止再叠出双线或空隙。modal独立保留自己的边框圆角。


## 右栏共享组件规格（2026-10-12）

PaneToolbar/PaneTab/PaneSearch/PaneEmpty等归ui/workbench.tsx，基于现有Btn/MenuButton/TextInput；尺寸token归foundations，共享控件视觉归components，右栏布局归workspace.css。禁止AuxPane/FilePane另写按钮/标签/输入/空状态尺寸，也禁止styles.css添加右栏控件覆盖。主行48px、主控件和标签32px、目录行28px；主图标16px、空状态24px，方向/关闭指示12px。空状态必须重置h2/p margin，入口只列实际能力。

check-ui-styles自动拒绝styles.css中的右栏控件/内部布局选择器（仅保留handle/sliver与外层几何），并拒绝components.css以外对ui-pane-*共享控件的重写。


## 左栏收拢动效（2026-10-12）

开放状态/宽度仍由LayoutPrefs持有。ui/useSidebarMotion只管理表现：外层sidebar-slot在220ms内收拢，内层保留最近开放宽度并淡出/轻移；关闭时立即inert/aria-hidden，完成后visibility隐藏。WindowNavigation保持独立可操作，main框架与标题导航留位同步过渡。拖拽调整宽度时关闭slot过渡以跟手，低于240px才进入收拢。快速反向操作清除旧结束计时器；系统减少动态效果禁用全部相关过渡及延迟，不缩小图标。


## 可扩展窗口骨架（2026-10-12，替代旧4px卡片框架）

ShellLayout的导航/主视图/右工作区通顶，Header与TabStrip共用ui-pane-bar-height=48px；面板外框无内部卡片圆角/边框/4px空隙，各接缝仅1px，8px命中区独立。ui/windowLayout独占窗口分配、对话/右栏宽度规则（下方活动模块更新手动下限）、320px右栏最低宽度、auto/fixed尺寸和底部工具上限。偏好由application持有，CSS只负责表现。侧栏玻璃、整体页脚、原尺寸控件与220ms收拢保持。

WindowFrame的route不销毁workspace，隐藏区域inert且工作区快捷键停用；UI测量隐藏时不记录0。面板元数据、命令与视图由panelRegistry统一；页面或工具扩展按frontend-window-skeleton-2026-10-12.md接入，禁止在App或Spine里追加布局分支。


## 中栏阅读与留白（2026-10-12，替代1152px普通正文上限）

物理面板保持通顶，内部正文、审批、队列和输入岛使用foundation的48rem阅读上限、clamp(24px,4cqw,40px)侧边距。直接代码块/表格可居中扩展到56rem并受主视图可用宽度限制；只作用于对话中的Markdown，不改文件工作区的源码与表格。正文与输入共同以card__conversation为容器坐标，spine滚动条两侧占位对称，禁止再让两者分别按不同容器计算中心。

正文使用UI字号+2px和1.7行高，标题按正文层级缩放；顶部40px/底部48px阅读留白，700px以下窗口压缩到24px/28px。用户气泡最多占阅读列85%，完整圆角；思考默认折叠，只有最终回答显示回答动作。TurnRecord运行中但尚无内容时显示“正在处理/等待响应”，不把通用运行状态冒充模型思考。


## 窄中栏与活动反馈（2026-10-12，替代600px手动硬下限）

ui/windowLayout区分舒适宽度600px与手动下限280px；right max4096但保留280px主视图。自动分配优先保留阅读空间，手动拖拽尊重偏好。420px以下使用12px侧边距和紧凑入口，原尺寸图标、可换行工具行、无横向溢出。ShellLayout提供data-compact，模块只负责内部适配。

展开收起统一使用ui/disclosure（ui-motion-disclosure），不复用设置表单ui-disclosure的边框/间距。原生details的高度/透明度/箭头过渡归components.css；activity布局与状态皮肤归conversation.css。自动完成折叠不覆盖用户选择；失败/待确认保持显著，状态未知不得显示成功。查阅、命令、编辑采用不同反馈，参数与位置默认折叠。hooks不可渲染，运行中临时正文不展示最终动作。

结构化Diff须在core投影保留并由typed Block传给UI；不得在组件重新解释协议帧。编辑预览可能是待执行操作，行数是片段统计，不能混作完整本轮diff。预览内容受上限约束，完整输出复制保留原始全文。
