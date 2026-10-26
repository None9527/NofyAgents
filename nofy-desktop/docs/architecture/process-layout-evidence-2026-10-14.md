# 过程布局修复：参考机制与回归证据

## Codex 本地构建证据

参考目录：`/Users/mac/Workbuddy/2026-10-13-codex-center-research/`。这些是本机提取的构建文件，不是上游未压缩源代码。

- `local-conversation-turn-632904a8790c.js.pretty`：过程容器使用 `flex flex-col gap-0`，由具体内容类型管理间距；todo-list 有独立呈现位置。
- `agent-activity-item-40fa48e24fdc.js.pretty`：工具按类型进入活动分组；正文、错误等独立呈现；todo-list 不走通用活动行。摘要区可截断，图标保持尺寸。
- `collapsed-turn-disclosure-5e77ff7d3908.js.pretty`：收起标题为 inline-flex，标题与箭头相邻，分隔线独立布局。当前 Nofy 的整轮标题箭头仍靠右，本轮未宣称此处一致。

## 本次截图的真实根因

只读检查匹配截图的 topaz 会话事件序列，发现每段 thought 后都有只有两个换行符的 agent_message_chunk。流边界使它们成为独立正文块。原实现给空正文保留了正文留白，导致过程看起来稀疏、断裂。原始会话内容没有复制到测试或修改。

隔离夹具按相同事件顺序构造四组 thought / 空消息 / 工具调用，并明确标记 response_completed：

- 旧安装包产生 4 个空正文行。
- 长命令把“已运行”标签压至 8px（文字需要 39px）。
- 计划同时显示 Updating plan 与原始 plan 事件。
- 参数仍在流入的工具被标为状态未知。

## 修复边界

- `presentWorkSegment` 在呈现层排除纯空白消息与思考；不修改持久化事件，后续文字到达时正常显示。
- 成功的计划工具紧接结构化 plan 时，由计划进度取代重复工具行；失败工具保持可见。
- `PlanActivity` 复用共享 Disclosure、图标与国际化；显示完成数、当前任务和可展开列表。未知状态保留 unknown，未知结构保留诊断内容。
- 操作标签不受长命令挤压，命令明细独立截断；文件名与路径组合仍保持 flex 布局。
- 无完成结果但已接收到参数的工具显示 pending；有结果但无法判断的状态仍保留 unknown。

## 验证

- 单测 445/445，通过类型检查、构建、样式检查和架构检查。
- 新增过程布局 GUI 7/7：空消息、闭合尺寸、紧凑行、宽/窄栏标签、计划展开完整性、待执行状态、思考展开收起。
- 工作流 GUI 9/9：阶段汇总、正文开始、结束折叠、阅读不中断、展开锚点与错误可见。
- 中栏契约 GUI 9/9：表格对齐、计时、Hook 统计、分支、窄栏、取消等。

旧安装包对照报告：`output/playwright/process-layout-2026-10-13T16-35-23.072Z/report.json`。
新版报告：`output/playwright/process-layout-2026-10-13T16-36-57.253Z/report.json`。
新版截图同目录 `final-process.png`；使用隔离 ACP 夹具，不能等同真实模型端到端验证。

此前长历史回放 V09 重新加载后末尾定位超时仍未解决，本轮没有将它算作通过。整体 Codex 中栏交互也不能据此宣称完全对齐。
