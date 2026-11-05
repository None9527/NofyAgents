# 内核缺口与 MCP 自主装配验收（2026-11-05）

范围以用户确认的「报告中确认缺失的能力全部落地」为准。原[参考复刻报告](../reference-replication-2026-11-05.md)保留原文；本记录依据当前代码和新增实测纠正其分类，不将四个参考 Agent 的全部产品行为认定为已经复刻。

交付为 Rust 内核能力、七个外部能力包、CLI/MCP 接线及[装配指南](../manual/assembly.md)。开发契约为 **0.6：97 项操作、95 个 MCP 工具、20 项 Session 操作、130 条显式 HTTP 方法/路径**。源码打包仍只收集源码和依赖清单，不安装依赖、不打包依赖、不设源码包体配额。未恢复前端。

## 内核能力矩阵

| 编号 | 当前落地与边界 | 实际证据 |
|---|---|---|
| K1 | resource.process_namespace_limits 提供无 cgroup 委派的进程执行；原 cgroup 后端保留。新后端的 CPU/地址空间限制为每进程限制，不宣称整树聚合配额 | process_sessions 4 项集成；真实模型文件工具读写 |
| K2 | 非零退出保留受限 stderr、exit_code、signal、截断标记，传到工具结果/事件；跨截断秘密片段也遮盖。真实模型文件读写当前通过 | executors、loader 40 项集中复验、真实父子效果；未把新通过倒推为原来每个 125 的唯一根因 |
| K3 | session.fork/rewind/tree：冻结来源与版本，原子创建独立根，只复制消息，不重放效果或退款。Opaque 原样保留；含 Opaque 的 rewind 限完整用户轮次边界，冻结模型纯校验在事务外进行 | Session 16 项；真实 MCP fork/rewind 均 completed，原文件摘要/mtime 与原 outcome 不变；部分 Opaque 边界拒绝 |
| K4 | context-compaction@0.2.0 使用已有 context.programmed 和持久采样，提供阈值、tail_keep/full_replace、标记及 /compact；model.context_fallback 处理确认超限后的一次尾部保留恢复 | foundation 2 项；models/profiles 19 项含真实本地 HTTP 超限拒绝/重试；未把尾部省略称为摘要 |
| K5 | 原 tool.skills execution 已能启动真子 Agent；补 resource/binding/tool.agent_tasks 的 spawn/poll/wait/cancel/list、父运行拥有的后台任务及根内持久消息；tool.compose 聚合工具包 | tasks 3 项含审批暂停后恢复只执行一次；真实 MCP 父/异步子分别写入正确文件，均 completed |
| K6 | ask-user、plan 外部包；Responses/Messages hosted_tools 原生透传；交互管道/PTY 与 terminal 五操作；出站 MCP 增加 stdio | 真 HTTP 问询/升级包集成、PTY/stdio 集成、模型协议 19 项。hosted 验证为协议与本地 HTTP 帧，未声称真实服务端 web_search 已调用 |
| K7 | policy.tool_rules 的 allow/deny/ask、参数与命令规则、命令拆分分析、类别控制；原请求审批支持 once/root/thread/session 范围，精确撤销 | Runtime/Host 权限组、真实模型审批暂停；根策略和 OS 资源不被记忆授权替换 |
| K8 | read_only/workspace_write/full_access 作用于明确声明目录；无路由 namespace 经可信 Host HTTP/CONNECT 代理出站，host/port/IP 规则强制执行；execution-escalation 明确失败后取得 Human 同意再用另一声明工具包 | 真实 HTTP/CONNECT、禁止绕过、文件模式测试；普通工具 3 次，较宽工具仅允许分支 1 次，拒绝与恢复不重跑普通效果 |
| K9 | 原 Interject/NextTurn 保留；steering/follow_up 双队列，all/one_at_a_time，原输入 ID/回执和安全采样边界 | 真 SQLite 邮件测试：批量 3 次采样、逐条 5 次，未将模型请求途中注入伪装为即时抢占 |
| K10 | 已有 governance.retry、stage.length/repeat 通过 resilience 接线；补 Retry-After 上限处理、图片回退、上下文超限恢复和完整重试指南。run.recovery(kind=retry) 返回已结算根模型失败的原票据 | 模型协议/Runtime 恢复测试；真实 rewind transport 失败后，用原票据和同一 run 的 retry_model 指令完成；未知 attempt 仍要求真实 evidence reconciliation |

新原语复用同一 Loader、运行树、检查点、预算、审批和恢复账本。没有接入旧 Agent 宿主或额外主循环。压缩、任务角色、计划、问询、协作、升级和挽救组合由外部源码包表达，运行依赖由用户提供。

## MCP/CLI 缺口与报告纠偏

| 编号 | 处理与验证 |
|---|---|
| M1 | tools/list 将组合 Schema 的可填字段公开到顶层，保留原 oneOf/allOf 严格验证；不匹配的内核/客户端版本明确拒绝。真实模型从空参数错误到正确带参调用得到实证，但不能据此断言原 ZCode 桥的唯一根因。旧桌面连接的缓存刷新未另行验收 |
| M2 | project.delete/agent.delete、module.yank/module.gc；工程 tombstone 保留版本连续性，yank 不破坏已有摘要引用，GC 只回收无引用上传源码 |
| M3 | source 与 target 的歧义组合在共同 Schema 拒绝；创建/编辑保留原项目 revision 或源码 digest |
| M4 | configure/module.set 增加精确 unset；null 仍是置值。结构依赖用 module.bind 的 remove_dependencies/replace_dependencies 修复，不能在 config 中假删依赖 |
| M5 | 源码 module_ref 为字符串，固定发布的原生 ModuleRef 为 {id,version}，二者分开说明；未知操作/协议不再返回空 Schema 冒充支持 |
| M6 | 缺少 project_id 等条件返回具体字段路径，错误附下一步 schema/inspect 恢复调用；NativeJson 缺字段保留受认可字段诊断，不回显任意错误正文 |
| M7 | 与 K2 使用同一结构化错误 details；run.events 与完整运行证据保留原现场 |

报告中部分「缺失」需要纠正：K4 旧 compaction crate 未接 Host，不等于没有 context.programmed；K5 的 execution-bound skills 原本有真子执行；K9 原本有安全边界的 Interject/NextTurn；K10 原本有自动重试及续写/重复检测。新增实现补其公开组合、双队列、异步协作和恢复缺口，没有再造一套循环。

## 不读框架源码的真实模型闭环

调用方仅收到公开 MCP 工具、schema/guide 和操作者已配置的连接/工作目录/凭据引用。输入 Schema 的 $ref 在测试驱动中等义展开以转为模型 function 参数；所有业务 MCP 结果原样提供，没有中途摘要投影或人工修补。

- 模型创建 `guided-7e2a1a80`，配置 coding 公开参数，添加并替换 prompt.static，检查/计划/发布激活，启动 `guided-75d6dbf808`，轮询并检查事件。
- 固定 release：`e09f0ecad23e97348d67d27985b4111ca56e22cf61d569b7c2a6d9d82b911630`。20 轮、20 次模型发起的 MCP 调用；实际执行包含 2 次模型采样、1 次成功文件读取，读到了调用方事先不知道的随机文件内容。
- 调用方累计输入 666154、输出 5920 tokens；这是跨轮累计量，不是单次上下文。末次请求为 46538 input tokens。
- 请求模型 `gemini-3.8-flash-high`，网关及被创建 Agent 回报 `gemini-3.8-flash-n`。按用户要求保留差异，不认定别名映射、不改请求名。

此前更复杂的真实模型装配产物经确定性 MCP 操作者继续运行：`verified-cc97b9f30a` 及其异步 skill 子运行均 completed，parent.txt/delegated.txt 各写入正确的 17 字节证明。该轮不能称为全程无人辅助；上述新的 20 轮验收才是完整无源码装配闭环。

在该真实效果运行上建立 Session：fork 保留 21 条原消息并完成至 23 条，rewind 保留 2 条并完成至 4 条；两分支均无新工具调用或子运行，原文件及原 outcome 不变。rewind 曾遇模型 transport 失败，使用原根票据、generation 0 的新 retry_model 命令恢复原 run；没有伪造模型结果或另建运行代替恢复。

## 真实验收发现并修复的问题

1. managed 编辑反复回传整包 Source：默认返回 inspection/refs/source_read，显式 include_source:true 取全。
2. 工具参数只在 allOf/$ref 内：顶层公开可填属性，严格选择器验证仍保留。
3. Human 无可直接回答的完整公开视图：增加 kind=human，返回 response_schema 和精确 command 模板；原租约下重新核验。
4. 发布与轮询吞入完整实现：describe 默认目录摘要，agent.apply 默认 publication 身份/read，完整数据分别显式读取；run.inspect 默认有界 status，view=full 保留原证据。计划原本就是摘要，未另改其语义。
5. Opaque 历史被 canonical 工具配对误拒：完整原样保留，部分前缀采取明确边界，冻结模型纯校验。
6. 已结算模型失败缺公开 retry ticket：增加 kind=retry 和两层 command_id 一致的完整控制示例。

同一 JSON 序列化下，describe 从约 159 KB 到 59 KB、apply 从约 478 KB 到 8.5 KB，状态轮询约 1 KB。输出预览具有 bytes/truncated，完整源码与历史没有被截断或丢弃。

## 集中验证与范围

完整日志保存在工作区外的私有验收目录，机器摘要见 [JSON](kernel-gaps-2026-11-05.json)。不将重叠测试相加制造总数。

| 检查块 | 结果 |
|---|---|
| Runtime 集中组 | 154 passed；后续 Session 16 项及新 Opaque 边界 1 项补验通过 |
| 模型/压缩 | profiles 19、foundation 2 passed |
| Client/MCP、CLI | 10、6 passed；包含官方 rmcp 客户端互通 |
| Loader、process_sessions、Host lib | 40、4、86 passed |
| 新 Human/升级包、状态视图 | 2、1 passed；含单层/双层资源和 Unicode 长输出 |
| 原失败组复验 | 模型源码示例、真实进程退出后的语义恢复、会话能力计数分别通过 |
| 构建与结构 | locked workspace/all-targets/all-features、fmt、依赖边界检查；无旧宿主依赖进入 Host |

首次完整 Host HTTP 202 项有 9 项失败，随后按真实原因修复并复验相关组；新增后的 HTTP 205 项没有再全量重复运行，不能把集中复验描述为重新全量通过。过程中重链接运行中的 helper 曾使其正确拒绝，已改为固定二进制副本并避免与进程验收并发替换。

OS namespace、PTY、代理的实际证据来自本机 Linux；hosted 的证据来自协议与本地服务帧。没有宣称所有平台、所有外部服务或四个参考产品的全功能矩阵完成。常驻 7331 实例未重启，桌面中仍缓存的旧工具目录不代表本轮 0.6 二进制已经加载。未提交或推送代码。
