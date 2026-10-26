# ZCode 对照：会话查找、过程流与右侧栏（2026-10-11）

本轮按本地 `ref-desktop/packages/ui/src` 的实际源码修正，而不是继续按截图猜布局。内核仍独立，改动仅涉及客户端读模型、展示和窗口状态。

## 源码发现

| 参照 | 实际行为 | 本轮采用 |
|---|---|---|
| `quickpick/TaskFindDialog.tsx:341` | chat 查找仅在 open 时挂载，宽约 360px，范围在会话容器内 | 删除正文区常驻搜索图标/空工具行；任务头部及 ⌘F/Ctrl+F 打开，查询仍在会话组件内。这里使用正常布局工具条，避免遮挡正文，未照搬绝对定位浮层。 |
| `WorkspaceSidePaneToggleButton.tsx:21` | 开合图标与状态绑定，同一 onToggleSidePane 驱动 | 继续使用窗口 layout.auxOpen，新增面板内收起入口；不另建一份“关闭”状态。 |
| `v4/conversationTurnFlowItems.ts:43` | 按 orderedRows 顺序生成 history/text/work，区分正文前后工作 | middle / final / following 区分时间位置；正文后的工具不再挪到正文前；查找和导出同样纳入 following。 |
| `v4/ConversationTurnGroup.tsx:1433` | hook 有独立详情入口，未作为任意原始 event 普通消息平铺 | 按用户明确要求，hook 完全不进入对话视图，也不留空 wrapper；底层投影仍保留供诊断。 |

## 修正与已复现问题

- 原来查找图标单独占据正文顶部，缺少任务层归属；移入 CardHeader，关闭时不占正文空间。查找开合按活动会话限定，切换会话关闭；查询和匹配更新不进入整个窗口状态。
- 原来最后一条回答被取出后，其后的工具/hook 仍全部算 middle，渲染时顺序倒置。新增 following，增量索引比较与查找定位同时覆盖它；历史已工作折叠只在有可见过程时出现，无用户前缀的过程也可折叠。
- 原来工具卡只渲染参数和位置，忽略 resultText。补可展开结果，失败自动展开，删除重复原始名/kind 标签、空 null 参数区；保留标题和状态。
- 窄窗口 GUI 复现：880×560 时原 @media 把 aux 置于底部并限制 35% 高度，头部+标签+路径占满后 explorer 高度归零。改为 card body 内的完整高度覆盖式面板，收起入口保持可点击。宽窗口仍为左右布局。
- macOS Option+B 可产生 `event.key=∫`，原键位匹配器无法识别；Option 字母键按 KeyB 等 code 归一，组合键逻辑仍复用同一个 useHotkeys。
- 右侧栏整体收起、文件树隐藏与关闭文件标签是三个独立动作；整体收起保留资源标签、模式、阅读位置和树偏好。

## 验证与边界

`pnpm verify` 407 项单测通过，协议、PTY、恢复 smoke 通过。42 个实际 Electron GUI 场景通过，包括流式思考拼接、hook 零可见行、前后工具顺序及结果、头部查找、宽窄窗口整体收起/快捷键/文件树隐藏、一万块虚拟化定位及恢复、资源模式/位置保留。共享样式检查无重复选择器，架构 190 源文件 / 884 imports / 14 个存量例外。

性能和包验证见 [本轮证据](frontend-zcode-alignment-evidence-2026-10-11.json)。GUI 使用隔离 ACP 模拟内核，没有发送真实模型请求；原生 Nofy 的屏幕捕获仍不可用，本轮视觉检查来自生产 Electron 的截图。
