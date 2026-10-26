# 对话工作流展示：参考源码机制与本轮修正

## 结论

之前把「参考项目的反馈体系」简化成了扫光、工具卡片和结束折叠，遗漏了运行中持续可读的内容摘要、工作阶段语义和最终正文边界。这是展示建模不完整，不是再调一个动画时长能解决的问题。

本次可逐行验证的参考为 `ref-desktop/packages/ui/src` 下的 ZCode 源码。用户提供的 Codex 壳研究 JSON 可以支持模块划分分析，但不应拿 ZCode 的时间常量或状态规则冒充 Codex 的内部实现。

## 源码链路

```text
CLI 权威 turnHeader / ordered rows
  → conversationTurnRenderUnits：整轮、终态、可见内容、最终正文与轮尾附件
  → conversationTurnWorkSegments：原始输入 / accepted guide 的独立视觉工作段
  → conversationTurnFlowItems：保持 user / history / text / work 的原始顺序
  → conversationAssistantWorkItems：思考、正文、连续查阅、连续命令、子智能体
  → ConversationWorkSegmentFlow：本段开合与唯一最终回答操作区
  → ToolLayout / Reasoning / QueuedSummaryContent / MessageResponse
  → ConversationTimeline / timelineScrollAnchor：测高、底部跟随、阅读锚点
```

## 不是一个动画，而是五组协作规则

### 1. 工作段决定展示和折叠

- `v4/conversationTurnWorkSegments.ts:150`：运行中的段不会仅凭「目前最后一段文字」选最终答案；完成的段才回退采用末尾正文。
- `v4/conversationTurnRenderUnits.ts:211`：turn header 为运行态权威，后台工具不能把已完成主轮重新变成运行中。
- `v4/conversationTurnRenderUnits.ts:244`：失败和中断强制保留历史过程，不能因存在部分正文就折叠。
- `v4/ConversationTurnGroup.tsx:645`：段默认展开状态有独立控制；运行过程和终态手动查阅不是一个布尔判断。
- `v4/ConversationTurnGroup.tsx:664`：折叠间距放在动画层内，避免内容高度归零后再突然少一截外部 gap。

我们此前的读模型始终把最后一条 agent-message 命名为 final。它可以用于索引，但不足以裁决是否收起；现在用 `workflowModel.presentWorkSegment` 在展示边界统一裁决，正文后还有工具时不把前面的说明误认为最终答案。

### 2. 连续工具是一段工作，不是一排孤立状态灯

- `v4/conversationAssistantWorkItems.ts:119`：阶段是否仍在运行由它是否处于当前运行段尾部决定，不等于子工具是否全部结束。工具都完成但下一条可见内容尚未出现时，阶段仍在继续。
- 同文件：查阅和命令启用聚合；编辑分组开关当前为 false，不能看见实现文件就说所有组都已启用。
- `ToolCallBlocks/renderers/explore.tsx:415`：运行时的折叠摘要展示最新子操作，完成后显示文件/搜索等汇总。
- `ToolCallBlocks/renderers/execute-group.tsx:111`：命令阶段结束立即清空旧摘要播放队列并显示统计；展开时由子行承载明细。
- 分组 key 锚定第一个真实工具，新增成员不改变组身份。

本轮增加命令阶段，与查阅共用 `WorkStage`，保留子项错误和明细。阶段归属由顺序边界决定，普通工具不自动铺满输出。

### 3. 运行中有真实内容反馈，不只有「正在思考」

- `components/ai-elements/reasoning.tsx:259`：取最后一个非空思考行作为运行摘要。
- 同文件约 307 行：摘要变长后把单行视口推到末尾，展示最新内容。
- `ToolCallBlocks/QueuedSummaryContent.tsx:4`：300ms 位移淡入淡出 + 500ms 停留；最多两条待播快照；同 key 内容原位刷新；调度迟到超过 250ms 时跳过过期队列。
- 减少动画偏好下直接显示最新状态；完成或展开时不再补播旧内容。
- `components/ai-elements/reasoning.tsx:94` 与 `v4/ConversationRowView.tsx:1599`：思考详情默认收起，用户主动展开后保留其选择。

本轮 `ui/rollingSummary.tsx` 统一承载思考与阶段摘要，身份变更才滚动，同一行的增量原位刷新。`ThoughtActivity` 显示最新思考行，并在工作流推进到后续内容后停止旧运行提示。

### 4. 流式正文不是假的打字效果

- `components/ai-elements/message.tsx:869`：streaming/static 不参与 React key，避免切换状态时重建正文。
- 同文件约 1633 行：真实流式正文使用 Streamdown 的不完整 Markdown 容错，完成态用 static。
- 同文件 1650 行：**明确关闭 Streamdown/正文 rehype 动画**，防止历史内容重渲染时反复闪烁。

本轮保留真实 chunk 驱动正文；不增加假打字等待，也不把完整结果人为切成小块冒充上游流式响应。我们的 Markdown 目前仍是 ReactMarkdown，尚未等价实现 Streamdown 的不完整语法处理和代码块流式专门策略，不能宣称整个正文系统已对齐。

### 5. 滚动是独立的用户意图状态

- `v4/timelineScrollAnchor.ts:51`：程序化滚动、折叠和测高引起的 scroll 事件不能改变用户阅读意图。
- 同文件约 77 行：宽度改变时多个消息分批测高，不能逐条补偿产生抖动。
- 展开历史、查看详情与贴底跟随必须协调，不能每个消息组件自行 scrollIntoView。

现有 `useTranscriptScroll` 继续负责此状态；本轮保持正文 DOM 和列表身份，在同一时间线里改变历史行可见性。

## 已落地范围

- 统一工作段展示策略，完成 / 异常 / 无最终正文分别处理。
- 连续命令、连续查阅的阶段汇总与运行摘要。
- 思考最新行展示、同一行原位更新、新行滚动切换。
- 共享有界摘要队列、过渡和减少动画策略。
- 阶段推进后停止旧思考活动提示。
- 真实正文先可见，完成事件再收起过程；保留最终正文节点。

## 验证与边界

`workflow-policy.test.ts` 覆盖最终正文边界、错误/取消、hook 后缀、时间顺序和摘要行身份。`workflow-system-acceptance.mjs` 在隔离 Electron 中逐阶段发事件，检查摘要内容、过渡帧、阶段 key、完成前正文可见、完成后节点身份、键盘展开和减少动画。

这些是受控 UI 验证，不证明实际模型服务必定持续产出 chunk。若真实链路仍一次性返回整段，必须对齐线上事件时刻与渲染时刻再判断来源，不能靠播放动画掩盖等待。

后续仍缺协议级 accepted guide 工作段事实、Streamdown 等价流式 Markdown 行为、完整子智能体/CUA 阶段呈现。此轮不应标为「全部参考体系已复刻」。

## 本轮验证结果

- 应用单测：413 项通过（包含 7 项新增工作流策略测试）。
- 工作流动态摘要：5 项通过，`output/playwright/workflow-system-2026-10-13T11-54-11.683Z/report.json`。
- 活动卡片、主题、窄栏：10 项通过，`output/playwright/activities-2026-10-13T11-53-59.874Z/report.json`。
- 万块历史、跟随、查找、会话切换：11 项通过，`output/playwright/virtual-2026-10-13T11-54-18.576Z/report.json`。
- DOM 连续性、折叠逐帧检查：4 项通过，`output/playwright/workflow-motion-2026-10-13T11-45-51.606Z/report.json`。
- 重试、失败恢复、阅读锚点：6 项通过，`output/playwright/retry-2026-10-13T11-49-24.686Z/report.json`。
- 类型检查、样式所有权、架构边界和构建通过；打包后两次隔离启动通过。
- 原生用户窗口读取仍报 macOS ScreenCaptureKit -3811，未以此声称实际用户会话已复验，也未强制中止当前用户进程。
- 最新安装包 SHA256：`aa6ae657a7a2e55e60c086116108c860f00098eea8849a663f2bf5a56bec9a77`。
