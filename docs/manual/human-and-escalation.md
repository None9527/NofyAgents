# 问询与执行升级

`ask-user` 模块包导出 `tool`，挂在 Agent 的 tool_packs。模型调用 `ask_user` 时传 `{ "input": { "question": "选择目标", "options": ["A", "B"] } }`。默认响应为 `{ "answer": "A" }`，可通过包参数 response_schema 自定义。问询使用已存在的 resource.workflow Human 节点，不创建临时对话循环。

运行暂停后调用 `run.recovery`，参数为 `{"run_id":"原根运行","kind":"human"}`。解码 data.native_json，选择 targets 中的一项；它包含 response_schema 和完整 command 模板，已经填好 target_run_id、workflow_path、expected_request。只将 command.value 改为满足 response_schema 的答复，再包入 `{run_id,command_id,command}`，JSON 序列化后传给 run.control.action_json。expected_request 是 Human 节点的原始输入，不是 `{kind:"human",request:...}` 暂停包装，也不是工具参数的外层 input。

workflow_path 由内核从原运行冻结的资源图发现：直接 workflow 程序为空数组，工具包内为实际 resource.workflow 引用路径，含精确版本。调用方不用猜包的内部模块名称。该视图只提供待答问题，提交时仍在原根租约下验证请求没有改变。使用新 command_id，提交后用 action.inspect 查询结果；重复相同命令读原回执。Human 命令处理继续原运行，不启动新 run 替代旧问询。`kind=child` 用于未决工具恢复，不返回 Human 问题。

`execution-escalation` 包需要两个明确的 tool_pack 输入 normal/elevated 和对应工具名参数。两个工具均接收原 arguments 对象。普通执行成功时直接返回；已明确结算的失败进入 Human 节点，请操作者决定是否使用已配置的较宽资源。回复必须包含 allow 和 acknowledge_partial_effects:true。仅 allow:true 时执行较宽工具，先前工具不会重跑。未知效果、检查点故障或未决审批继续暂停，不能自动升级。

该编排返回 normal/consent/elevated 各节点的持久状态记录。`Join mode=all_settled_records` 支持保留 completed/failed/skipped 状态，避免根据工具业务输出猜测失败。授权不会提升内核继承的 policy floor；需要先由操作者明确配置较宽的目录/网络/进程资源，包不能突破它们。
