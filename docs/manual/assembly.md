# 只通过 MCP 装配 Agent

契约 0.6。外部 Agent 无须读取框架 Rust 源码。先调用 nofy_describe，核对服务端实际能力和版本，再按 nofy_schema 返回的 guide 施工。Schema 是精确机器契约；guide 给出用途、插槽、依赖端口、参数、前提、示例、下一步和恢复办法。工厂存在与环境可用分别判断。

## 四种查询

```json
{"operation":"agent.create"}
```

```json
{"factory":"tool.process_artifact"}
```

```json
{"preset":"coding","version":"0.1.0"}
```

```json
{"package":{"repository":"local","name":"workspace-files","version":"0.1.0"}}
```

均作为 nofy_schema 的参数。工厂配置确定后，再用 `{factory,config_json}` 取得该配置派生的完整依赖端口；config_json 为序列化 JSON 文本。预设查询返回公开 settings_schema、初始 settings 和步骤，不要求阅读预设脚本。包查询返回固定摘要、公开参数/端口/导出与使用步骤。

引导里每个提到 MCP 工具的调用同时带 `cli` 字段，给出对应的 CLI 命令；调用的 `arguments` 也是该命令 `--input` 的完整 JSON 输入，所以同一份引导对两种入口都适用。CLI 对应 `nofy schema --operation agent.create`、`nofy schema --factory tool.process_artifact`、`nofy schema --preset coding --version 0.1.0`，复杂输入可使用 --input。

## 按指南执行

1. describe：确认当前版本、权限、安装工厂、可选预设与能力事实。
2. schema：选预设或工厂/包，读取必需参数和环境前提。
3. agent.create：从空声明或指定预设创建源码工程。
4. agent.configure：结构化配置公开参数；不用上传修改后的整份 Source。
5. agent.module.add/use：添加模块，按精确端口接线并挂载兼容插槽。
6. inspect/build/plan：补齐缺项，读取实际 system/programs 和 expected_generation。
7. apply：使用唯一 command_id 和原 generation，保存实际 release。
8. run.start/inspect/events：提交明确运行，检查实际执行状态和工具效果。

指南步骤中的 `{"$input":"name"}` 表示调用方必须提供的输入；`{"$result":"step","pointer":"/refs/source_revision"}` 表示前序完整结果信封的字段。它们是指南占位，不是可直接发送给内核的值。先替换占位，再调用工具。native_json_body 是结构化原生正文示例；替换后将其 JSON 序列化，传入步骤声明的 request_json 等字段。

例如配置参数：

```json
{
  "agent":"coder",
  "target":{"kind":"project","project_id":"coder","expected_revision":"0"},
  "settings":{"workspace":"/absolute/workspace","terminal_enabled":false},
  "set":{"/model_settings/max_output_tokens":1024}
}
```

这是 nofy_agent_configure 输入。revision 必须取自实际前序结果，不照抄例子中的 0。settings 做对象增量合并；set 是参数 JSON Pointer 到字面值。null 存储空值，不能作为删除操作。设置写入实际 settings 文件并更新摘要；临时 settings_json 覆盖不继续遮盖该修改。源码允许暂时缺项，inspect/build 将报告它们。

托管目标使用 expected_revision，本地 Source 目标使用 expected_digest。顶层 source 与 target 不可同时提供；上传完整 Source 不传 target，在现有目标中添加 Agent 不传顶层 source 或 preset。冲突时先读取新版本并理解变化。

## 环境与故障

process_isolation 报告平台、helper 配置和 Landlock 查询结果；command_execution 报告当前执行供给条件。发现接口不探测用户任意路径或凭据正文，不把 cgroup v2 挂载等同于已经取得可写委派根。原 cgroup 后端要求实际委派的子目录，根目录字符串本身不是有效授权。

运行排队时 execution 可以为 null。accepted/queued 不表示已完成；completed 也不能替代检查 tool_completed.is_error 和业务结果的 ok。进程工具失败时检查 result.details 的 exit_code、signal、stderr、stderr_truncated；诊断保留受限窗口并遮盖敏感环境值，不替换原错误文本。125 表示隔离/启动失败，需要具体诊断才能归因。

错误信封含 recovery：指出改正输入、刷新身份、检查供给或查询原回执。取消 MCP 等待不取消业务运行；结果不确定时使用原 command/run ID 查询，不能自动制造第二份效果。

压缩、通用子任务和计划工具源码包位于 modules/agent-foundation，可登记为目录/Git 模块来源后显式 sync，再通过 schema(package) 和 module.use 装配。压缩使用 context.programmed 的持久采样；task 使用现有 scoped skill 子执行；这些能力仍共享权限、预算与恢复路径。

managed Agent 创建和编辑默认只返回标识、inspection 和 source_read，避免把完整源码反复注入模型上下文。需要原字节时显式设置 include_source:true，或调用 project.source/agent.export；显式 source target 的编辑继续返回完整结果供本地写入。

describe 默认返回精简目录，按 schema(factory/operation) 获取选中能力的完整契约；include_details:true 才返回全目录描述。agent.apply 默认返回原激活回执与 publication 身份/读取指令，不重复携带完整发布实现；include_publication:true 可取原 publication_json。计划已是结构变更摘要，agent.build 仍用于显式获取完整部署。

run.inspect 默认 view=status，返回 nofy.run-status/v1：原任务身份、实际执行状态、精确 live revision、子状态计数与输出预览。预览提供 bytes/truncated，不冒充完整输出；不重复传输实现快照和历史。需要完整检查点、children 或原始 outcome 时显式用 view=full。CLI 的 nofy run inspect --view full 与 MCP 使用同一选择。

新增工具不会自动修改 required_policies。coding 预设的 policy.tool_scope 明确列出可调用名称；加入 ask_user、agent_tasks 等工具时，同步配置其允许名单，子 Agent 继续继承根策略。遇到审批暂停，按 run.approvals → run.decide → run.control resume 处理原请求；这不增加目录或网络资源。Human 问题使用 run.recovery(kind=human) 返回的 command 模板和 response_schema，详见[问询与升级](human-and-escalation.md)。
