# ZCode 与 Nofy 对话主页：布局和交互深度对照

日期：2026-10-11。参照：`ref-desktop` 官方源码，commit `29628c9acdb81b703bbd4080c207a0e7ce5e276e`；Nofy 为当前构建产物。

结论：当前主页没有复现 ZCode 的整体布局契约。已有气泡、Markdown、菜单、虚拟化等组件，但正文、输入岛、审批和侧边面板各自决定尺寸与状态，因此宽度变化和任务状态变化无法保持一致的阅读与操作体验。共享样式文件与 selector 唯一性约束已经存在，但不能替代共享布局策略和交互状态机。

本次没有修改生产 UI；新增可重复运行的审查脚本、测量证据和改造方案。保留用户正在使用的原生窗口和项目数据，未读取模型配置或调用模型 API。

## 1. 方法和证据边界

- 阅读 ZCode `conversationLayout.ts`、`ConversationTimeline.tsx`、`ConversationComposer.tsx`、`ConversationRowView.tsx`、`ConversationTurnGroup.tsx`、`ConversationBottomDockTransition.tsx`、`WorkspaceShellLayout.tsx`。
- 阅读 Nofy foundations / conversation / styles CSS、ShellLayout、Spine、Composer、App、ConversationPane、useWindowPreferences。
- 实际运行 Nofy Electron，使用隔离的 Electron profile、NOFY_HOME、工作区以及确定性 ACP 模拟器。目录与 main/preload/renderer 都使用当前应用实现。
- 28 种尺寸/面板组合：880、900、901、1000、1280、1440、1920px；左栏 264px、480px 或关闭，右栏打开/关闭。右栏通过真实按钮打开，因为 Nofy 启动时主动将 auxOpen 设为 false，不能只写偏好就声称已测右栏。
- 补测 560px 窗口高度下的 12 行输入、阅读位置切换、运行中 Enter 和审批布局。
- 所有对照尺寸来自 Nofy DOM；ZCode 数据来自源码规则，未启动当前 ZCode 做双端同场像素测量。不能把以下源码推导当作 ZCode 实机测量。
- 这些脚本是审查取证，不是通过验收的测试集；零 pageerror 只表示采集完成，不表示 UI 合格。第一轮右栏偏好采样未展开右栏，已由第二轮真实按钮操作的完整矩阵替代。

有效证据：

- `output/playwright/layout-audit-2026-10-10T19-15-54.113Z/report.json`
- `output/playwright/interaction-audit-2026-10-10T19-18-24.613Z/report.json`
- 复现入口：`node apps/desktop/e2e/layout-audit.mjs`、`node apps/desktop/e2e/interaction-audit.mjs`，使用已有构建；没有把报告采集包装成绿色验收门。

## 2. ZCode 实际使用的布局规则

### 2.1 一套对话容器策略，多个区域复用

`conversationLayout.ts:3–28` 定义：

| 对话容器宽度 C | 内容列规则 |
| --- | --- |
| 新任务草稿 | max-w-2xl |
| 会话，C < 864px | w-full |
| 864px ≤ C < 1280px | width: C − 6rem；max-w-4xl |
| C ≥ 1280px | width: C − 24rem；max-w-6xl |

默认 Tailwind 尺寸在 16px 根字号下，2xl / 4xl / 6xl 分别为 672 / 896 / 1152px。上表是源码推导，不是当前 ZCode 运行时读取的计算值。

`ConversationTimeline.tsx:1803–1823、1864–1888、1923–1930` 将同一个 contentWidthClassName 用于历史、实时尾部、header slot 和 composer dock。正文行与输入壳可以有少量各自内部边距，但共享同一根宽度轴；不是两个互不相关的居中 max-width。

断点是 `@container/conversation`，依据实际会话面板宽度，而非整扇窗口。状态汇总面板的宽档位与正文统一在 1280px，位移也同时作用于正文和 dock。不能在我们没有对应汇总布局时照搬其 −168px 位移。

### 2.2 单一滚动坐标系，输入 dock 是明确的布局部件

`ConversationTimeline.tsx:1744–1776、1908–1964`：

- timeline 明确 overflow-x-hidden、overflow-y-auto、scrollbar-gutter:stable。
- 表格、代码横向溢出在自身容器处理。
- 会话态 dock 是 sticky bottom-0，并与消息列共享宽度。
- dock 外壳 pointer-events-none，实际内容列恢复 pointer-events-auto，避免透明空白挡住轮次导航。
- 回到底部按钮定位在 composer dock 上方，跟着实际输入区走。
- 草稿态 greeting、composer 属于同一居中内容组；上留白按 29dvh 伸缩，下限 52px，低高度可由 timeline 承接整体溢出。

这是一套互相配合的几何和滚动契约。我们可以继续使用 flex 分离的正文与输入区，但必须补齐同样的宽度、锚点和状态约束；不必为形式一致机械搬运 sticky DOM。

### 2.3 用户消息并非固定占内容列的 85%

`ConversationRowView.tsx:1252–1288`：气泡按内容自然宽度，在会话宿主 ≥624px 时再以 max-w-xl 封顶；附件位于气泡外；按钮在同一行容器，mt-1，hover/focus 显示。

Nofy 已修好 4px 按钮间距与自动隐藏；这项可以保留。剩余差别是气泡 max-width:85%，宽度随正文列比例放大，长输入与短输入的节奏缺少清晰上限。

### 2.4 输入是运行状态的入口，而不只是 textarea + stop

`ConversationComposer.tsx:1121–1138、2065–2095`：是否允许发送来自 inputRouting.mode、附件是否准备好、pending 和 submissionReady。运行中空草稿显示 Stop，有草稿显示可路由的发送；guide/enqueue 由命令层和内核裁决，不在视觉层臆造行为。

`ConversationComposer.tsx:2186–2207`：审批阻断时可隐藏 composer，但保留挂载与内部草稿状态。`ConversationBottomDockTransition.tsx` 让不同 dock 模式共享 grid 单元、底部对齐，防止高度变化后先跳位再动画。

## 3. Nofy 实测：主要宽度偏差

单位 px，四舍五入。正文为 `.block--agent .md` 可用宽度；输入为 `.composer__inner` 外框宽度。表中只有后两行使用左栏宽档，其余左栏为 264px。

| 窗口 | 右栏 | 对话区 | 正文 | 输入岛 | 现象 |
| --- | --- | ---: | ---: | ---: | --- |
| 880 | 关闭 | 606 | 508 | 566 | 输入比正文宽，边距两套口径 |
| 900 | 打开 | 626 | 528 | 586 | 右栏 548px 覆盖在对话区上 |
| 901 | 打开 | 403 | 297 | 339 | 多 1px 就切并排，对话区减少约 223px |
| 1280 | 关闭 | 1006 | 900 | 704 | 输入突然成为独立窄列 |
| 1280 | 打开 | 454 | 348 | 390 | 右栏 548px，比实际对话区更宽 |
| 1440 | 关闭 | 1166 | 976 | 704 | 正文与输入左边缘相差约 141px |
| 1920 | 关闭 | 1646 | 976 | 704 | 固定双 max-width，尺寸增大仍然错轴 |
| 1000，左栏 480 | 打开 | 286 | 180 | 222 | 正文已不适合阅读代码和表格 |
| 901，左栏宽档 | 打开 | 216 | 110 | 152 | 对话正文严重被挤压 |

901px 下左栏因 max-width:50% 被压到约 450.5px，最后一行不是把 480px 硬塞进窗口。

### [P1] 宽度轴分裂

Nofy `foundations.css`：--ui-transcript-width = 64rem，--ui-content-width = 44rem。正文最终内容宽 976px，输入固定 704px。此前增加正文宽度只缓解了单一阅读场景，却破坏了与输入的联系。

更明显的是：窄窗口输入比正文宽，宽窗口又比正文窄；两个区域不是稳定的“外框稍宽、文本内缩”关系。**不能只把输入的 44rem 改成 64rem就宣称修复**，还要同时处理消息行内边距、审批、空态、滚动条和面板模式。

### [P1] 断点用错参照，空间下限不可满足

Nofy `styles.css:2494–2513`：aux 宽度是 min(偏好宽度, max(220px, 100cqw − 420px))，同时以窗口 900px 切换 overlay。

当 card body 不足 640px 时，右栏仍强制保留 220px，已经无法保住“420px 对话区”。窗口跨过 900px 切换，并没有考虑左栏宽度。因此只增加 1px，主页结构就大幅跳变。

覆盖布局还没有与其匹配的统一 sheet 交互：源码没有遮罩、背景 inert 或专用 overlay Escape 关闭契约。880px 的实测截图里，只有约 58px 对话区未被右栏覆盖；这不是可同时操作的双栏。

### [P2] 横向留白叠加，正文额外损失空间

Nofy `.spine` 左右各 24px，`.spine__inner` 又左右各 24px。900px 以下仅将 inner 改成 20px。scrollbar 占用另外约 10px，因此正文通常损失 106px（窄档 98px），而不是单层边距。

ZCode 由共享列宽控制外侧留白，再由 ConversationTurnGroup 的 px-4 / @md:px-6 定义行内边距。我们的两层 padding 与输入区的左右 32/20px 不来自同一规则。

### [P2] 新任务首页没有 greeting + composer 的共同布局

1280px 初始空态实测：问候区 y=97、h≈354；输入岛 y=713、h=122，之间约 261px。空态位于独立 spine 的顶部，输入钉在页面底部；margin:auto 没有在共同的垂直空间中将两者组织起来。

ZCode 新任务是独立居中草稿状态。我们的初始化还自动创建实际 session，这一点与草稿态不同；是否采用延迟创建必须由 session 用例决定，不能只靠 EmptyState CSS 伪装。

### [P2] 低高度下各个 dock 同时占位

1280×560，12 行输入：textarea 到 160px，输入岛总高 230px，正文仅剩 240px。正常约束未越出视口，但阅读空间明显缩小。

1280×900，审批出现：审批占 378.9px，输入还占 122px，正文缩至 309.1px。仍展示可编辑但不能发送的输入框，同时向用户展示审批主任务，注意力竞争明显。

## 4. 实际交互与源码差异

### [P1] 切回会话丢失阅读位置

实际滚动至首条消息顶部（scrollTop=0），新建另一任务，再切回来：采样时 scrollTop 已自动移动到 381px，没有恢复原位置。源码 ConversationPane 用 session.id 作为 MemoSpine key，切换即卸载；stickRef 默认 true，无会话级阅读位置存储。

ZCode 有独立 timelineScrollAnchor / scrollMemoryKey，记录 following 与可见 anchor；宽度变化时暂停逐行补偿，稳定后再处理。现有 TanStack Virtual 并不自动替我们保存跨会话阅读状态。

### [P2] 离开尾部后没有“回到最新”入口

当前源码没有对应按钮；GUI 也没有发现。用户需要自己滚到底部才恢复跟随。在长任务中，这是核心导航缺失。查找虽然能跳历史，但跳完缺少回到当前任务进度的出口。

### [P1] 运行中追加输入形成死路

实际模拟审批中的运行任务，输入“执行过程中追加的指导”后按 Enter，prompt 数量仍为 2，草稿留下、仅显示 Stop，无 Send。与 Composer submit 中 `running` 直接 return 一致。

前端已经能显示并编辑内核队列，却没有统一的 busy 输入入口。对齐必须先确认当前内核实际支持的 queue / guide 协议，再由 application 暴露语义命令；不能仅恢复发送按钮让用户撞上协议错误。

### [P2] 仅附件输入也被文本判断挡住

Nofy submit 与按钮都以 trimmed text.length 为门禁；有附件、没有文字仍不可发送。ZCode 把附件 readiness 与 hasDraftToSubmit 纳入统一提交状态。这项为源码确认，未在本轮执行附件上传验收。

### [P2] 收窄时隐去控制内容，没有统一优先级

Nofy 40rem composer container query 隐藏 toolbtn label/chevron，model 另有 18rem 上限；但缺少统一的“保留发送与模式入口、压缩模型标签、更多菜单承接次要项”规则。最窄测量下模型 label 短仍未检测到 button 越界，**这不能证明长模型名、多附件、多模式状态也适配**。下一版必须覆盖这些真实内容压力。

### [P2] 过程呈现仍偏向全轮折叠

ZCode ConversationTurnGroup 按有序 commentary、reasoning、explore/execute 等 flow items 呈现，避免把每种内容都独立写成一份渲染逻辑。我们将 middle 收进整个 turnhead，最终正文之外的过程存在双层展开关系。Markdown 变完整不代表任务时间线的阅读层级已对齐。

### [P3] 历史行与新内容共用入场动画

Nofy `.block, .tool-card, .approval` 统一 nofy-rise。历史恢复、虚拟行重新挂载也会执行；没有区分实时新增与历史内容。ZCode 专门组织 dock / 面板的转换，与我们给所有内容节点添加动画是不同策略。下一版应只对明确的新交互和新状态使用动作反馈，减少历史重挂载动画。

## 5. 为什么会变成现在这样

有三个具体原因：

1. 原先样式大量注释仍以旧壳 3.11.2 的局部实测为依据，最近又加入当前 ZCode v4 的气泡/Markdown和 Codex 风格文件区。参考版本与规则没有形成统一基线。例：composer 注释说左右 40px、底部 16px，实际代码是 32px / 20px。
2. UI 样式检查能约束 selector 所有者，却不会检查“正文和输入是否同轴”“左右栏拖动是否保留正文空间”“审批是否与输入互斥”。这些跨组件契约从未成为验收条件。
3. 性能门和功能用例验证了可渲染、可复制、可打开，缺少联合状态矩阵。此前 880/1440 单独检查不越界，漏掉了 900/901 结构跳变、左栏宽档 + 右栏、切会话阅读位置、busy 输入和审批高度。

核心模块边界和 typed 客户端可以保留。需要重做的是对话场景的共同布局、滚动和输入状态契约，不能继续通过每个组件增加一个 max-width 或 media query 来修补。

## 6. 第一版重做应分四个完整模块

| 模块 | 状态所有者/公开接口 | 主要工作 | 必要验收 |
| --- | --- | --- | --- |
| H1 对话布局 | ui conversation layout policy；application 保存面板偏好 | 统一内容列与 dock 的宽度、gutter、空态；依据对话宿主与剩余空间选择 split/sheet；面板宽偏好和实际宽分离 | 同轴关系、左右栏拖动、864/1280容器临界值、900/901窗口、880到1920布局；sheet遮罩/焦点/Escape |
| H2 阅读与滚动 | application 会话阅读状态；timeline 负责 DOM 测量 | Following/ReadingHistory 分离、anchor + offset + session id、回到最新、resize稳定后补偿；查找与展开后的统一锚定 | 切回会话恢复阅读位置、流式追加不抢历史、拖栏保持可见行、代码换行/审批高度变化不漂移、200轮虚拟阈值切换 |
| H3 底部交互 dock | application 输入路由；renderer纯视图 | Draft/Ready/Running/Blocked/Error状态、输入与审批共享dock、运行中空草稿停止/有草稿按协议发送、附件可提交 | Enter/Shift+Enter/中文IME、queue/guide真实内核、审批不清草稿、失败不清草稿、短窗口、仅附件、长模型名 |
| H4 对话信息层级 | application有序flow read model；feature组件 | 用户消息自然宽度 + 上限、过程摘要与实际活动顺序、正文/代码/表格宽度、动作按情境显示；删除历史入场动画 | 前后工具顺序、长/短输入、连续查阅/执行、失败工具、流式完成、非活跃会话不重渲染；hook继续不显示 |

每个模块都要完成联合验收再扩展下一模块，保持现有性能门与内核独立边界。H3 依赖上一轮前后端报告中的会话恢复状态与内核路由契约，不能只改视觉。

建议第一版先固定以下产品规则：

- 所有对话区域共享一套宽度策略，内部允许少量语义化 padding 差异；不再保留各自独立 64rem/44rem。
- 回复正文与输入岛同轴，气泡右边界落在同一内容列；表格与代码局部横向滚动。
- 分屏有明确可满足的主区下限，空间不足进入完整 sheet 模式，禁止宽度公式互相挤压。
- 新任务作为 greeting + composer 组合，已建立会话继续拥有稳定底部操作区。
- 操作状态由内核能力与会话生命周期决定；running 不等于禁止一切输入，connected 不等于 sessionReady。
- 先建立观测和布局验收，不以“没有报错”或“DOM 没越界”替代体验合格。

## 7. 验收矩阵的补齐

需要横跨窗口宽度、左栏宽度/开合、右栏模式、窗口高度、长内容和任务状态的联合场景；无需机械跑所有组合，但以下不能漏：

- 900/901 的连续拖动；同样容器宽度在不同窗口和左栏状态下应得到相同布局模式。
- 左栏 200/264/480，右栏 320/548/760偏好；实际内容空间不足时有可解释的降级。
- 560/700/900 高度：空态、12行草稿、单审批、多审批、队列同时出现。
- 长模型名称、非默认字号、中文长文本、只有附件、横向表格、不换行代码。
- 1/100/200/1000轮：阅读历史、发送新消息、切会话、查找、打开/关闭右栏、拖宽度。
- 所有几何读取记录浏览器版本、主题、字号、设备比例和面板状态；截图等待过渡稳定，颜色比较必须在同场条件下进行。

本轮最终判断：宽度轴、自适应模式、空态/底部dock和会话阅读交互需要按模块重做。复制或编辑按钮隐藏、标准Markdown、typed客户端和既有性能机制已经具备基础，应作为现有能力继续使用。
