# steering 与 follow-up

`run.steer` 将用户输入送到原运行的下一个安全边界：已冻结的模型请求和未配对工具结果先完成。`run.follow_up` 在当前回答结束后注入，随后继续采样。二者是独立队列；后发的 steering 不会被先发的 follow-up 阻塞。`NextTurn` 仍是独立新运行的快照交接，不等同于本运行内的 follow-up。

Agent 声明的 settings 接受：

```json
{"input_delivery":{"steering":"one_at_a_time","follow_up":"all"}}
```

默认两队列均为 all。all 在同次采样前交付已有消息；one_at_a_time 每次采样前仅交付一条。每条输入分别记录原始来源、序号、摘要、hook 决策和交付回执，不把批量输入拼成一条失去来源的消息。

CLI/MCP 参数为 root_run_id、run_id、thread_id、agent、input_id、text，可附 attachments。地址从原 run.inspect/run.children 获取，input_id 重试必须保持原内容。重复提交读已有回执；等待 HTTP/MCP 请求超时不取消已接纳输入。`run.input` 继续支持原始 MailEnvelope，新增 `input.kind:"follow_up"`，message 结构与 interject 一致。
