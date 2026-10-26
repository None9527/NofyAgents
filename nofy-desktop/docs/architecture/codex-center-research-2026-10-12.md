# Codex 中栏专项调研与 Nofy 呈现修正

对象：用户标注的Codex截图、本机com.openai.codex 26.1007.21159 build20052的只读产物，以及当前Nofy窗口骨架。原始包位于/Applications/ChatGPT.app；目录名不作为产品身份。提取文件仅存/tmp/nofy-codex-center-2026-10-12，未执行其代码、未操作Codex窗口或读取用户会话/凭据。本报告区分静态确认与截图推断，不声称恢复官方TypeScript源码。

## 确认的中栏职责

```text
local-conversation-page
  ├─ 线程标题/菜单/概览开关
  └─ local-conversation-thread
       ├─ thread-turn-entries：显示读模型、活动/正文/末尾资源
       ├─ virtualized-turn-list：可测量轮次、恢复/跳转接口
       ├─ local-conversation-turn：轮级呈现与动作能力
       └─ thread-scroll-layout：正文坐标、悬浮输入岛与滚动补偿
            └─ scroll-controller context
                 └─ bookmarked user-message navigation / navigation rail
```

### 1. 顶部不是全部工具按钮的集合

local-conversation-page引用thread-overflow-menu、toggle-thread-summary-panel和thread-panel-header-actions。菜单接收thread身份、cwd、Markdown导出函数、父会话、pending工作树与是否可置顶。截图的列表图标与产物中的“Toggle summary / Toggle pinned summary”相符；概览有popover/pinned布局状态，不应直接等同文件右栏开关。

Nofy已经有SessionActionsMenu与面板入口；目前缺独立的任务概览，不应先增加无真实数据的图标。后续标题工具条应按会话动作/概览/窗口面板三类能力组织，而不是把所有控制常驻中栏右上。

### 2. 左侧刻度是用户消息导航

thread-user-message-navigation-rail-app在items少于4时返回null。Rail以用户消息/turn key为身份，点击定位，拖动scrub连续跳转，悬停加载预览；预览包含用户消息、回复与文件/图片/PR等输出，支持书签。getScrollElement与onRevealItem接入统一滚动控制器，不能只查询当前DOM，因为目标可能未挂载。

产物确认：定位在主区左侧并垂直居中；单项命中区w-9/h-2.5，标记基底26px、线高spacing×0.5；列表限高min(70vh,40rem)，自身滚动。邻近项逐级放大/高亮，scrub期间停用动画，减少动态效果同样停用。Rail对分组采用content-visibility:auto；这不证明其DOM总量也被虚拟化。

Nofy已有轮索引和虚拟定位，但尚无导航轨/书签读模型。实现时应复用轮索引和阅读Owner，不从每个stream chunk生成刻度，不在App订阅全部块后重建导航。

### 3. 正文、宽内容与输入岛共用坐标，宽度各有职责

Codex window-type对应body默认thread-content-max-width为48rem；Markdown宽块为56rem。body-max-width包括阅读宽度与两侧内边距，并通过thread-content-responsive-max-width覆盖。footer使用同一正文坐标类，另有composer-inline-overhang/adjacent-max-width，不能据此认为所有内容必须完全同宽。rem换算与具体断点仍取决于根字号和运行时布局，不从截图反推最终CSS像素。

当前Nofy统一1152px列使普通文字在中等窗口接近铺满；这次收窄普通阅读列，并保留宽代码/表格的扩展空间。通顶的是物理区域，正文仍需内边距、阅读上限与上下留白。

### 4. 输入岛是有测量与补偿的悬浮区域

thread-scroll-layout将footer放在底部absolute区域，外层pointer-events:none、实际交互子项pointer-events:auto。测量footer高度后写入thread-scroll-padding-bottom，默认模式额外加16px，并根据是否跟随底部补偿阅读位置。控制器暴露holdViewport、scrollToBottom、距离底部与resize-preserve接口。默认/compact/home模式有各自承载方式。

这套机制的价值在于输入高度、审批或提示条变化时正文仍保持阅读位置，而不是单纯的absolute CSS。Nofy当前采用独立ConversationDock并有阅读锚点Owner；后续若迁移悬浮方式，应一次迁移测量、底部留白、遮挡检测与补偿，不只换定位属性。本轮先改善宽度/留白，保留已经验证的Dock/portal与终端独立槽。

### 5. 回答动作与完成状态具有能力和层级

实际assistant动作行支持copy、fork、rating control、额外动作、persistent/trailing动作与timestamp策略；默认有hover/focus透明度规则，可由alwaysShowActions覆盖。local-conversation-turn禁止默认流式复制，并根据item.completed提供copy text。截图里的朗读与最后一个图标未完成所有注入能力的动态映射，不把图标外观当作功能验证。

Nofy已实现复制/保存与用户回退，但中间commentary也渲染一排回答动作，信息层级弱；本轮只在最终回答显示这组动作。思考不应默认展开成英文流式碎片。无内容期间应呈现通用等待状态；turn-running不能作为“模型正在思考”的证据。

### 6. “已编辑文件”是本轮补丁卡

sites-end-resource产物的轮diff卡接收item.patchBatches/unifiedDiff、conversationId、cwd、hostId。按路径合并文件与行数，默认先列3个文件，再显示剩余数量。运行中摘要与完成卡分开；View changes打开更改视图，Undo/Reapply有pending、Git可用性与部分成功/失败反馈。

不能用整个工作区git/status替代本轮补丁，再显示“本轮编辑N个文件”。Nofy后续应先落实TurnChangeSummary的真实输入与撤销契约，再注册卡片；当前检查点回退与轮补丁撤销也不能混为一个动作。

## 本轮发现与实施范围

- P1：SegmentView只在middle非空时显示正在处理，首个模型内容返回前界面只有用户气泡与停止按钮。补等待状态；它不替代真实请求无响应的协议排查。
- P2：普通正文/输入统一1152px上限，缺正文与宽块分工。引入共享阅读/宽块/边距token，改善上下留白；物理骨架保持通顶细线分隔。
- P2：思考默认流式展开，中间正文也带复制/保存。默认折叠思考，并让最终回答拥有一组动作，减少过程区噪声。

左导航轨、任务概览、本轮diff卡和未接入的朗读/反馈能力仍属于后续模块；没有用占位按钮冒充完成。源文件定位、哈希与本轮验证见codex-center-research-2026-10-12-evidence.json。

本轮类型、样式、架构及428单测/构建/smoke通过；主页、折叠间距、万块历史GUI通过。正文与输入横轴共享主视图container，scrollbar-gutter对称，宽代码/表格仍在视口边距内。包两次隔离启动通过。最终报告、实际尺寸与等待提示截图见证据索引。

最终三组GUI共28场景通过（主页16、折叠间距1、万块历史11），0页面异常；等待提示另断言实际处于滚动视口内且高于输入岛。新版已重开，1个主进程/1个独立内核子进程。


## 活动呈现模块第二版（2026-10-12）

上一版把阅读目标 600px 当成手动压缩的硬限制，且缺少完整活动反馈，本节替代该限制。默认自动分配保留 600px 舒适宽度；手动分隔条允许中栏最低 280px。右栏偏好上限 4096px，实际宽度由可用空间限制，601px 以下主工作区才进入弹层。420px 以下中栏使用 12px 阅读边距，权限/模型缩为原尺寸图标入口、工具行可换行，长标题截断；不缩小图标。查找/终端可从现有帮助菜单调用；极窄且左栏关闭时优先侧栏开关/标题/右栏开关，其他动作由快捷键及重新打开导航访问。

### 源码里确认到的活动结构

`sites-end-resource-61eec7d61437.js.pretty` 的 `b_` 提供 summary/summaryKey/summaryTransition/defaultExpanded/canExpand/shouldAnimateInitialCollapse，以及 opacity/height 的展开收起；引用 collapsed-turn-disclosure 模块。`jO` 组合活动组，接收 preserveSingleItemGroups/isTurnInProgress/isHeaderInProgress/isActivitySliceClosed/isExploring 等状态。运行中的 commentary 有 loading-shimmer，command 有 interrupted/running/finished 等状态，streaming diff 与完成补丁卡分开。这说明它不是把所有工具渲染成同一种 details+原始 JSON。产物是静态只读取证，没有执行参考应用代码。

### 当前实现的所有权与行为

- `ui/disclosure.tsx` 是共享动画原语。原生 details/summary 保留键盘语义和查找展开；components.css 独占高度、透明度、箭头过渡，支持减少动态效果。自动状态更新只作用于未被用户手动改变的展开状态。
- `features/conversation/activityModel.ts` 读取规范化 Block，只派生状态、真实操作计数及编辑片段；不猜未知状态是成功，也不制造每个工具的耗时。
- `ActivityCard` 按命令、查阅、编辑和其他工具呈现。命令有代码控件/流式输出/完整复制；连续查阅合组；kind=other时识别原始工具名（如list_dir、grep），执行/编辑显式kind优先；编辑有红绿片段；失败/待确认有独立状态且默认展开。输出预览最多 16000 字符，编辑每侧最多 150 行，完整内容留在模型中。没有可展开内容的状态行不显示空折叠箭头，null输入不渲染为参数。
- `SegmentView` 管回合层：正在处理的摘要、读取/命令/编辑/异常计数，正常完成自动收起、失败或待确认保持打开；手动选择优先。最终答复留在折叠外，运行中不给临时正文附最终答复动作；hook 仍仅在诊断数据保留。
- `core/toolContent.ts` 对照本地 ACP schema 的 Diff(path/newText/oldText) 建立可选 typed editPreviews。projectEvent 保留多个 diff，后续仅文本/状态帧不清除预览；UI 优先使用该内容，再兼容已知 old_string/new_string 原始输入。

内核 `tool_calls.rs:1803` 在开始时已发送 Diff，因而编辑预览不是“文件已经修改”的证明。红绿行数表示这一操作的替换片段，不是整个工作区或本轮 Git 差异。若没有旧文本，只显示内容预览，不声称删除/新增统计。本轮没有增加无数据来源的好评/差评、朗读、整轮撤销按钮。

折叠动画使用 [Chrome 的 details-content 文档](https://developer.chrome.com/blog/styling-details) 中的原生内容过渡能力，并以 @supports 降级；功能仍可在无动画环境使用。实际动画须以 GUI 帧采样验收，而非只检查 className。


第二版验收：434单测、类型、样式、架构及构建通过；主页16、窗口5、活动8、万块历史11，共40 GUI场景，0页面异常。动画采样包含展开/关闭中间帧，减少动态效果立即切换；真实拖拽中栏280px/右栏1374px，正文/输入/文档无横向溢出，长标题和菜单操作可用。ACP结构化diff→投影→UI预览通过，后续纯文本更新保留该预览。两次包隔离启动通过，详情见evidence.json活动模块索引与package-macos-verification.json。
