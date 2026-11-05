# 模型原生工具与恢复策略

provider-native hosted 工具是模型协议配置。Responses/ Messages 预设接受 model settings 中的 hosted_tools 数组，例如 Responses 的 `[{"type":"web_search"}]`。定义使用服务端接受的原生格式；预设不把它转换成本地 function。Chat Completions 预设没有该原生契约，会在请求前明确拒绝。

Responses 的 web_search_call、引用和其他输出项随 opaque history、provider 元数据保留。Messages 的 server_tool_use/web_search_tool_result 保留原格式；pause_turn 会在 hosted_tool_rounds 上限内继续请求，默认最多两次，事先预留相应调用预算。当前配置是否支持某种原生工具由实际服务端决定，框架不会伪造搜索结果。provider 侧效果由其服务负责；本地 Tool Policy 不逐项裁决服务端内部调用。

`model.image_fallback` 包装已声明的 model 依赖并挂到 model 插槽。配置 statuses、codes 和 replacement。只在未收到任何输出 chunk、请求含 canonical 图片且发生已配置的明确拒绝时重试一次，图片替换为说明文字；原始检查点历史不改。带 hosted_tools 的请求不会自动剥图重试。请求上界按两次采样预留，首次失败 token 按原模型声明上界保守记账，`completion_info.provider._image_fallback` 记录原因、移除数和调用数。

通用重试使用现有 governance.budget_connected 的 retry 配置：max_attempts、base_delay_ms、max_delay_ms。遵守 Retry-After；超过等待上限则保留失败，不提前重试。模型失败、自动重试、手动 RetryModel 与未知效果 reconciliation 保持原 journal 语义。

已结算的根模型失败可用 run.recovery(kind=retry) 读取原 ModelRetryTicket；null 表示当前没有可重试的已结算失败，不能伪造票据。schema(operation=run.control) 的 model_retry 给出完整原生正文：外层 command.kind=control，command.control.kind=retry_model，command.control.command 含原 ticket 与 command_id，且该 ID 必须与动作外层 command_id 相同。读取 action.inspect 确认回执，新 generation 使用独立预算准入；始终恢复原 run。未知已派发 attempt 应查询 kind=model，先以真实 provider 证据 reconciliation，不能套用已结算失败重试。

`resilience` 源码包将已有 stage.length 和 stage.repeat 接到 runtime.recipe；导出 recipe 挂到 Agent 的 recipe 插槽。使用 stage.length 处理长度结束时，模型协议 length_policy 应配置为 complete_partial，使原运行收到 length 结束原因并由续写阶段处理。压缩另用 context-compaction 包及其 journal/policy 两个导出。

`context-compaction@0.2.0` 增加显式手动指令。以 Session 新轮输入 `/compact` 或 `/compact 说明`，会在当前轮次前汇总全部旧历史；保留当前输入、原始出处和工具配对，汇总完成后不在该轮重复手动压缩。manual_prefix 可配置，空字符串关闭。自动模式仍按压力阈值工作；占位标记与 metadata 区分自动策略和 manual_full_replace。

`model.context_fallback` 是可选溢出恢复包装：依赖原 model，配置 keep_turns 与明确的 provider codes。遇到配置的上下文超限代码或 HTTP 413、且尚未收到任何 chunk 时，保留全部 system 消息及最近完整用户轮次，加入“旧视图已省略”的标记，重试一次。完整检查点历史保留，元数据记录 removed_messages；它是尾部保留策略，不伪造摘要。单个当前轮次本身过大时仍可能失败。请求 bound 预留两次模型上界，hosted 请求禁自动重试。优先使用压力压缩，溢出包装用于已确认超限后的最后一道恢复。
