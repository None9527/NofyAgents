# 上下文浮层裁剪与右栏间隔（2026-10-12）

用户截图中的上下文弹层只剩底部三行。ContextMeter 原来将 absolute 弹层放在 composer 内，ConversationDock 的 overflow-y:auto 会裁剪浮层；局部 z-index 无法突破该边界。

## 修复

- 新增 ui/AnchoredPopover，将浮层 portal 到所属 dialog 或 document.body，以原生 popover manual 进入 top layer。复用 menuPosition 定位，按窗口可用空间设置 max-height，并允许内部滚动；尺寸、滚动和窗口变化时跟随触发器。
- ContextMeter 保留悬停阅读、点击钉住、外点关闭和 Escape；新增键盘焦点开启。移入浮层时取消短暂关闭计时，避免跨过间隙就消失。
- 工作台 split 时移除 main 的重复右内边距；分隔条8px热区两边各重叠3px，净占位2px。hover线缩为1px。sheet与侧栏其他几何保留。

## 影响与验证

GitNexus ContextMeter LOW，直接调用者 Composer；新布局符号未索引，已核对工作台调用点。未改内核或协议。UI拥有 portal/DOM/定位，feature只提供内容与开合状态。

pnpm verify 的423单测、架构/样式/类型、构建和三类smoke通过。隔离 Electron 主页12项GUI通过，包含原有多窗口宽度/左右栏组合、阅读/队列/审批以及新增两条：1440×900与880×420的浮层边界、top-layer归属、底部字段可见且可命中、内部滚动、悬停/钉住/外点/Escape；实际2px间隔、8px热区与拖拽。

首次GUI在重新进入悬停/键盘焦点的步骤等待超时。测试补充明确激活隔离Electron、指针与焦点先移出再重新进入，第二次真实悬停与键盘步骤均通过；首次失败报告保留，不计入通过结果。

报告：output/playwright/homepage-2026-10-12T03-08-31.751Z/report.json。验收使用合成上下文数据和隔离profile，未调用模型接口。

证据索引：frontend-context-popover-gap-2026-10-12-evidence.json。发布包两次隔离启动通过，已重新打开新版Nofy.app。
