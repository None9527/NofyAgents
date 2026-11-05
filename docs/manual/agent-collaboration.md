# 子任务和通信

同步委派可用 `agent-task` 源码包。并发执行时，将它的 task 导出作为 `resource.agent_tasks.children`；创建依赖同一资源的 `binding.agent_tasks` 和 `tool.agent_tasks`，分别挂到 Agent 的 bindings 和 tool_packs。通过 schema 查询工厂，不猜参数和依赖。

模型可调用 `agent_tasks`：

```json
{"action":"spawn","task_id":"inspect-1","tool":"task","arguments":{"skill":"delegate","args":"检查工作区并返回结果"}}
```

`poll` 查询结果，`wait` 等待最多 60 秒，`cancel` 请求取消，`list` 列举本父运行任务。等待超时不会取消任务。重复 task_id 必须保持相同 tool/arguments。父 Agent 可在子任务执行期间继续采样和处理工具；最终结束前会汇合。父暂停或退出会回收当前执行 future，已持久意图在显式恢复父运行时使用原 child 身份恢复。未知效果仍使用 `run.recovery` 和对应控制指令处理，不能重新 spawn 另一个任务绕过恢复。

父子 Agent 都可挂 `tool.agent_messages`，调用 `agent_messages` 的 send/read/wait。`to:"*"` 为运行树广播；指定 run_id 为定向消息。sender 由内核填写。message_id 在发送者内幂等，读游标使用 next_cursor。不同根运行的消息板相互隔离，Host 重启后从原检查点恢复。

每个父运行最多 64 个任务，每棵运行树最多 1024 条消息，单条正文最多 64 KiB。这些是执行资源约束；不限制源码打包容量。运行事件中的 subagent_start/subagent_finished 和 `run.children` 保留真实子运行、预算与恢复地址。
