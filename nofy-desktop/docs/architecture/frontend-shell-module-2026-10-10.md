# 主界面状态模块迁移

2026-10-10。按模块整体迁移 App、Sidebar、Composer、ApprovalHost、QueueHost 和诊断区；保留内核、ACP 与 reducer，不添加兼容豁免。

## 边界

application/shell 提供缓存选择器。ShellState 是明确的会话摘要类型，包含导航、模型/权限/用量与命令所需字段，排除正文、轮数组、队列、审批、搜索和事件计数；不是伪造的完整 AppState。会话摘要按字段复用，删除会话会移除对应 key。侧栏和命令中心共用稳定导航模型，忽略不改变导航内容的模型和运行状态更新。

App 使用 useProjection 订阅摘要，保留窗口布局、路由和跨区域协调。useWorkspaceAgents 单独订阅 task/poll 与完成状态；普通文本流不使其失效。ComposerBoundary 与 SidebarBoundary 统一稳定事件回调并 memo 视图，回调读取最新已提交闭包。模型和内核命令读模型不再因正文或其他会话状态变化重新创建。

ApprovalHost 独立订阅活动会话及全局审批，持有应答和 Escape 取消行为，保留 transportEpoch 与请求对象身份检查。QueueHost 独立订阅当前会话队列、连接可用性和会话 id；会话切换重建队列表单。SidebarFoot 独立订阅事件计数与诊断摘要，诊断仍实时更新，不触发整窗重排。HeaderBoundary 独立读取真实块数。

导航动作实时查询 client.projection.getState() 判断会话是否已加载，避免摘要缓存导致错误 load。SessionActionsMenu 只收操作所需字段；导出点击时从当前 store 读取完整历史，失效会话明确报错。用量账本仅依赖 id/modelId/turnUsage，不因正文流重复扫描与追加。

## 验证

新增 6 项选择器回归：正文/队列/搜索/审批隔离，标题与删除生效；审批跨会话、同 id 重连对象替换；队列可用性与切换；普通正文不触发 agent 投影，完成状态仍生效；诊断计数更新；导航模型忽略模型/运行变化并响应选中变化。

完整 pnpm verify 通过；最后一轮命令依赖收窄及第 6 项测试后重跑 pnpm test 和 pnpm build。最终单测 366（ACP 41、desktop 325），架构与类型/样式检查通过，协议 7、PTY 8、恢复 11。架构报告 177 源文件、812 imports、15 存量例外。

四组隔离生产 Electron GUI 46/46，无 pageerror：对话/审批 11、项目/导出/删除 11、设置/重连/语言布局 15、长对话虚拟化 9。具体路径及包校验见 [交付证据](frontend-shell-module-evidence-2026-10-10.json)。

| 10000 消息测量 | 上一版 | 本版 |
| --- | ---: | ---: |
| 流式阶段 App 渲染 | 24 | 4 |
| 流式阶段 Composer 渲染 | 未计数 | 5 |
| 流式阶段 Sidebar / ApprovalHost / QueueHost 渲染 | 未计数 | 0 / 0 / 0 |
| 后台追加时 App 渲染 | 21 | 1 |
| 后台追加时 Spine / Composer / Sidebar / ApprovalHost / QueueHost 渲染 | 部分未计数 | 0 / 0 / 0 / 0 / 0 |
| 输入到下一帧 p95 | 14.3ms | 14.3ms |
| 可见消息块 DOM | 22 | 22 |

[原始记录](benchmarks/2026-10-10-shell-module.json)。各组 20 次输入、单次本机模拟测量；不宣称通用性能预算。输入阶段只有 App/Composer 各 20 次，历史 Markdown、侧栏、审批与队列均为 0。性能脚本 after-shell 标签增加模块渲染断言；真实模型网络与峰值内存不属于本次测试。

## 后续模块

主界面已经移除完整 AppState 订阅，受控草稿仍由 App 调用 application/workspace hooks 管理。布局与跨区域协调尚集中在 App，不宣称文件长度或 A3 全量关闭。

下一模块整体处理设置：分区注册、资源查询/失效与未保存修改退出；之后再处理工作区资源能力与长回合细粒度呈现。继续以模块为交付单位，模块内部一次统一验证。
