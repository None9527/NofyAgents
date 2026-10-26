# 对话局部订阅与增量行模型（A3 首批）

2026-10-09。保留独立内核、ACP、同步 reducer 与共享 16ms 帧调度。本批收口 Conversation 的读取和历史行更新，不替换消息事实、不引入状态库或虚拟列表。

## 已落地职责

- `application/conversation/selectors.ts`：只选活跃会话的 id、blocks、turns、subagentFinished 和 agentState；忽略标题等非正文元数据与非活跃会话变化，快照引用稳定。
- `application/conversation/turns.ts` / `turnIndex.ts`：既有回合分组语义移入应用层；比较不可变引用定位 dirty 边界，仅重组受影响回合之后的后缀，历史段与列表引用可复用。仍有 O(n) 引用扫描，不宣称 O(1)。
- `ConversationPane`：从只读 projection 局部订阅，稳定事件回调，MemoSpine 绘制；原 Spine 保留为视图，公开入口指向这个容器。
- `Spine`：分组索引、折叠/查找与底部跟随；删除尾块 JSON.stringify。Segment/Block/TurnActions 按真实数据引用隔离，已完成轮次不因计时器逐秒更新。
- `useAgentProjection`：仅在 task/poll 源引用或 finished 投影变化时重新关联，普通文本追加不会重建 agent map。未变化的 agent view 保留引用。既有解析仍在 feature 纯模型，协议解码全面下沉尚未完成。
- `TurnActions`：缩窄为 id/agentState 读模型，仍随真实运行状态刷新按钮；回退/编辑不会捕获旧会话或旧回调。
- `SettingsBoundary`：稳定事件回调并隔离父层无关更新；设置组件的本地表单、语言/主题及业务资源变化继续正常渲染。
- 附件搜索 close 现在幂等；open/query 与给 Composer 的 view 引用稳定。修复了“关闭状态创建新 snapshot → Composer effect 再关闭”的 App 空转反馈循环。

`ui/useStableCallback.ts` 保留最新已提交闭包，只稳定事件身份；不用于忽略变化的数据 props。`ui/renderDiagnostics.ts` 是测试专用可选数字计数 sink，没有模型文本、凭据或持久化，默认未启用。

## 同机基线与观测

生产 Electron 构建，1440×900，相同确定性 ACP corpus，1000/10000 个 user/agent 块；每组 20 次原生输入。输入事件记录到下一 requestAnimationFrame 的延迟，不混同 Playwright 调用总耗时。最终对比执行期间没有同时运行 build/verify。

| 指标 | 改造前 | 改造后 |
|---|---:|---:|
| 1000 块输入→下一帧 p95 | 21.7ms | 12.1ms |
| 10000 块输入→下一帧 p95 | 119.4ms | 18.1ms |
| 10000 块输入阶段 Markdown 执行 | 845000 | 0 |
| 10000 块流式阶段 Markdown 执行 | 165009 | 7 |
| 后台会话追加时前台 Spine 渲染 | 12 | 0 |
| 后台追加时通用设置页渲染 | 23 | 0 |
| 10000 块实际 DOM 消息块 | 10000 | 10000 |

这些是单次模拟器、每组 20 输入的观测，包含行复用与附件反馈循环修复的共同影响，不用于宣称通用速度保证、相对 Codex/ZCode 优势或已经满足完整性能预算。stream 次数受帧合并影响，不等于模型 chunk 数。performance.memory 指标粗粒度且可能缓存，原始值保留，但不作进程内存或峰值下降结论。

原始记录：[before](benchmarks/2026-10-09-conversation-before.json)、[after](benchmarks/2026-10-09-conversation-after.json)。可复跑 `node apps/desktop/e2e/conversation-performance.mjs after`；after 标签额外断言历史 Markdown 不随输入执行、后台消息不绘制前台/静态设置、App 不进入反馈循环。首次 before 菜单精确名称定位失败及中间 after 空转记录保留在 output，最终报告均无错误。

## 验证

新增 5 项模型测试，覆盖尾部流式引用复用、完成轮次、追加/前缀/历史改写/截断、150 轮确定性变更与全量模型等价，以及元数据/后台会话选择器隔离。原回合和 agent 模型契约保留。

完整 `pnpm verify`：358 项单测（ACP 41、desktop 317）、62 条夹具、架构/样式/类型/构建、协议 7/7、PTY 8/8、恢复 11/11 通过。

三组 Electron 回归 37/37，均无 pageerror：

- 对话：`output/playwright/2026-10-09T10-35-08.700Z/report.json`，11/11。
- 项目/会话：`output/playwright/project-2026-10-09T10-35-09.919Z/report.json`，11/11。
- 设置：`output/playwright/2026-10-09T10-35-11.095Z-settings/report.json`，15/15。

单独性能验收：`output/performance/after-final-2026-10-09T10-29-15.856Z/report.json`。全部 GUI 使用隔离模拟内核，不将其当真实网络模型验证。依赖扫描 168 源文件、764 imports，存量例外保持 15，无新增豁免。

设置计数测量的是通用分区的顶层 Surface，不代表 MCP/模型内部订阅已全部隔离。

更新后的 macOS arm64 包两次隔离启动通过并回收内核；ad-hoc 本地签名，不捆绑内核。源码与包校验见 [交付证据](frontend-conversation-evidence-2026-10-09.json)。

## 下一阶段

App 仍订阅完整 AppState；Sidebar、Composer、ApprovalHost 的领域容器/选择器，以及设置内部 connection 查询仍需继续迁移。任务/poll join、已加载查找、事件投影数组拷贝并未全面优化。

本批交付时 DOM 仍随全部历史线性增长；随后 [A5 虚拟化第一版](frontend-conversation-virtualization-2026-10-09.md) 已完成轮级动态测量、查找定位和底部跟随。重复采样与预算、精确内存追踪及完整能力矩阵仍未完成。本批提供 A5 所需稳定行身份与可复跑基线，不冒充 A3/A5 全量关闭。
