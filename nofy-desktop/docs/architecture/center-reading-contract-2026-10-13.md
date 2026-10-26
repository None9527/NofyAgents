# 中栏阅读与回合操作：修正记录（2026-10-13）

## 本轮根因与验收口径

用户指出表格超出正文。旧版在 `ui/conversation.css` 对回答里的表格和代码块使用 `--ui-conversation-wide-width:56rem` 与负边距，正文上限却是 48rem。旧 GUI 只验证 `scrollWidth <= clientWidth`，因此布局主动扩宽也能通过。

改前在 1920px Electron 窗口实测：正文左右坐标 708.5 / 1476.5，表格与代码块 644.5 / 1540.5；两侧各突出 64px，而窗口 overflow 为 0。复现报告：
`output/playwright/center-contract-2026-10-13T15-37-55.416Z/report.json`。

已删除自动扩宽与废弃宽度 token。正文、表格、代码块共用阅读轴；长表格、长代码在自身容器横向滚动，只有用户点击展开才打开宽视图。没有为这一轮引入第二套 UI 组件或样式库。

新的验收必须比较各富内容容器与相邻正文的 left / right，误差 <1px；同时检查窗口不溢出。覆盖 1920 / 1440 / 900 / 640 窗口宽度，以及右侧工作区展开后 280px 中栏。已检查截图，长连续字符串不强制拆成高窄文字列。

## 回合展示与数据边界

- `responseModel.ts` 提供持续到秒的时间格式，使用现有 startedAt / endedAt，结束后冻结；并按实际 HookRunEntryDto 的嵌套 status 解码成功、错误、阻断、跳过、未知，不将缺失状态当成功。
- `Spine.tsx` 在工具运行、正文流式、尚无输出时持续展示时间。Hook 数据只从本回合 middle / following 获取，仍不出现在普通对话事件行。
- `ResponseTools.tsx` 在回答操作行接入从此回答分叉与 Hook 统计。使用现有 Btn / Dialog / Disclosure / Icon；旧回答传自己的 promptIndex，读取当前会话的 cwd 和运行状态后调用现有内核接口。运行时禁用分叉；失败可重试；已创建但加载失败时保留新会话身份，避免重复创建。
- 内核 `session/storage/jsonl/copy.rs:300` 明确目标 prompt inclusive，因此没有加一。切换任务后，晚到的分叉不抢焦点。
- 共享 Dialog 修复 React 移除原生 dialog 后入口焦点丢失，保留 preventScroll 与当前其他模态窗口保护。
- WorkStage 对全部为 read 且带路径的阶段统计去重文件数；混合查阅仍称操作，不猜文件数量。
- 回合折叠、滚动意图继续由原有 workflowModel / useTranscriptScroll 管理。未新增第二个滚动所有者。

## Codex 核对依据与范围

本机提取文件位于 `/Users/mac/Workbuddy/2026-10-13-codex-center-research/`：

- `app-primary-6f60e9ac4103.js.pretty` 中 LW / D7e：按工作状态和起止时间显示，working 且未结束时 1000ms 更新。
- `sites-end-resource-78b98c374310.js.pretty` 中 Ax：同一回答动作行接受 onFork / hookStats，与回答身份绑定。
- `supplement/user-message-dd2539189e70.js.pretty` 中 ft：Hook 统计入口与独立对话框，blockedCount 和 errorCount 分别识别。

参考机制被接到本项目现有协议及 UI 基础上。本轮不声称整个 Codex 中栏功能已经等价：朗读、评分、跨窗口任务等仍取决于相应产品能力。历史时长精度仍受现有回合投影的起止时间来源约束。

## 验证

441 项单测通过；类型检查、共享样式检查、架构检查通过（231 source files / 1078 imports / 14 explicit legacy exceptions）。

实际 Electron 回归：

- `center-contract-2026-10-13T15-44-20.509Z/report.json`：8 项，正文边界、流式与无输出计时、结束冻结、Hook 分类与焦点、窄栏、旧回答分叉及加载重试。
- `workflow-system-2026-10-13T15-41-02.032Z/report.json`：9 项，阶段摘要、默认折叠、DOM 保留、上翻暂停跟随、展开锚定、错误保持可见。
- `rich-2026-10-13T15-44-34.510Z/report.json`：5 项，Markdown、表格、代码、导出、主题宽度。
- `markdown-stream-2026-10-13T15-44-40.645Z/report.json`：6 项，流式边界、片段身份、表格展开状态、阅读位置。
- `user-actions-2026-10-13T15-47-39.816Z/report.json`：6 项，按钮紧贴、悬停与键盘焦点以及富文本。
- `retry-2026-10-13T15-47-46.317Z/report.json`：6 项，重试、终止失败、恢复输入、滚动、取消、窄栏。

报告统一位于 `output/playwright/`。两个旧测试前提已修正：悬停前用真实滚轮进入阅读模式；失败工具直接断言可见，不再要求它必须存在于可折叠历史组。没有放宽原本的间距、位置或可见性要求。

安装包 `release/mac-arm64/Nofy.app` 已更新，zip SHA256：
`531ac26d58b3e11f476d0a3d62039200ffdd39ac848d66e1d423477c71a1be64`。
两次隔离启动通过，见 `docs/contract/package-macos-verification.json`。GUI 使用受控 ACP 和已有真实错误帧验证，没有额外向外部模型发请求；未把模拟测试当成真实模型挂起问题的完整端到端验证。

## 改动影响

GitNexus：Spine / SegmentView / BlockView 为 LOW，直接调用沿 SegmentView → Spine → App。Dialog、WorkStage、新增 ResponseTools 和相关 GUI 脚本未被索引，返回 UNKNOWN；通过当前源码引用确认调用范围，未将 UNKNOWN 宣称为 LOW。没有提交或重置工作区。

## 首条消息前悬空操作栏回归（2026-10-14）

上一轮遗漏了 session_start Hook：它在第一条用户消息之前形成 user=null 的 lead 段落，Hook-only 的兜底操作栏把它当成回答，显示分叉与 Hook 按钮。先在旧构建注入真实形状的启动 Hook 复现，C00 失败，报告 `center-contract-2026-10-13T15-59-49.449Z/report.json`。

修正：仅包含隐藏事件的前置段落不进入显示列表、虚拟列表尺寸和阅读锚点；数据仍完整保留在 store。回合操作必须绑定用户消息；从此回答分叉还必须有完成回答和 promptIndex。真实回合取消且没有回答时保留其 Hook 统计，但不生成回答分叉按钮。

`center-contract-2026-10-13T16-01-21.834Z/report.json` 九项通过，包括首次发送、重载、旧回答分叉和无回答取消。顶部截图见 `center-contract-2026-10-13T16-02-38.760Z/first-answer.png`。441 项单测、类型、样式与架构检查通过。安装包更新并通过两次隔离启动，zip SHA256 `d2343e46d925808a8bf3180a15df093bfd83f1e54083a6fbd89c9104194ff84c`。当前已经打开的用户窗口没有强制重启。

复查将全列表 filter 收窄为只检查首个 lead 段落，普通列表直接复用原引用。最终专项报告 `center-contract-2026-10-13T16-06-54.533Z/report.json` 九项通过。长历史扩展回归出现不稳定项：首次尝试 V01 超时；对照运行去掉过滤后 V01 通过但 V09 重载定位和 V11 设置路由超时，报告 `virtual-2026-10-13T16-05-17.501Z/report.json`。这些不计入通过项，也不能据此宣称整个中栏完成验收。

最终长历史报告 `virtual-2026-10-13T16-06-53.500Z/report.json`：10/11 通过，V09 重载后定位末尾超时仍未解决；首次加载、查找、动态折叠、会话切换、离屏锚点与路由恢复均通过。本次首条消息操作栏修复已打包，长历史重载问题单独保留，不能称所有 GUI 检查通过。
