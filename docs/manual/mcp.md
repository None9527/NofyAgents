# 内核控制 MCP 使用手册

版本：`0.6`。入站 MCP Server 使用官方 rmcp 3.6.0，复用共用客户端和源码引擎；与 Agent 调用外部服务的出站 MCP 工具源分别管理。

## 用途与工具发现

Codex 等外部 Agent 通过标准 MCP 操作内核中的源码工程、模块、发布和运行。工具调用复用 CLI 的操作契约及内核 API，不创建另一个 Agent 主循环、执行队列或预算系统。

完整工具及参数入口见 [operations.json](operations.json) 和 [contracts.schema.json](contracts.schema.json)。普通开发操作在 CLI 与 MCP 中一一对应；密钥正文注入保留为独立的私有本地入口，不向模型提供读取密钥值的工具。

MCP `tools/list` 返回明确的 name、description、inputSchema、结果对象 Schema 及可用注解；工具目录固定公开 96 项已实现适配操作；describe 读取实际内核工厂、权限和 Session 能力，调用时以内核授权为准。每个调用仍由内核重新检查权限。操作目录中的权限提示和工具注解不代替授权。

每个工具的 description 以该操作自己的一句话摘要开头（操作目录的 `summary`，97 条互不相同），其后是统一的读取说明；输入模式的每个字段都带 description。注解由目录推导而不是手写：`readOnlyHint` 对应只需 read 作用域的操作；`idempotentHint` 对只读操作以及带 `command_id` 的写操作为真，因为内核按 `command_id` 重放已记录的结果而不是再执行一次；其余写操作的 `destructiveHint` 保守地为真。测试对照操作目录校验这些注解。调用未知工具时，错误信息和 `data.suggestions` 给出最接近的工具名。

机器目录中的 Schema 文件引用用于维护契约；实际 tools/list 会内联工具需要的本地 `$defs`，不会要求客户端读取服务端文件路径。客户端可配置工具允许列表来控制暴露范围，完整目录仍可通过 describe/schema 查询。

## 启动 stdio Server

```sh
nofy mcp serve --transport stdio \
  --endpoint http://127.0.0.1:7331 \
  --token-env NOFY_ACCESS_TOKEN
```

Server 启动前独立注入 NOFY_ACCESS_TOKEN。stdout 仅有 MCP JSON-RPC，日志到 stderr，不输出欢迎语或令牌。一次连接对应外部客户端身份，断开连接不会关闭内核或删除已经接纳的任务。

## Codex 配置

接入配置如下。字段依据[官方 MCP 文档](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)核对；该配置不会自动写入用户环境。

```toml
[mcp_servers.nofy]
command = "nofy"
args = ["mcp", "serve", "--transport", "stdio", "--endpoint", "http://127.0.0.1:7331", "--token-env", "NOFY_ACCESS_TOKEN"]
env_vars = ["NOFY_ACCESS_TOKEN"]
```

运行 Codex 的环境须能找到 nofy 可执行文件并取得该变量。可按官方方式使用 `codex mcp list` 查看配置；配置出现不代表连接或业务验收已经通过。连接及业务验收范围见[实现记录](../verification/agent-development-cli-mcp.md)。

## Streamable HTTP

```sh
nofy mcp serve --transport http \
  --listen 127.0.0.1:7332 \
  --endpoint http://127.0.0.1:7331
```

MCP 地址为 `http://127.0.0.1:7332/mcp`。调用方带自己的 Bearer 身份，桥接器将该身份用于内核请求；HTTP 模式不使用固定管理员环境令牌作为后备。服务校验认证和 Origin，连接日志不记录令牌。

Codex 对应配置：

```toml
[mcp_servers.nofy]
url = "http://127.0.0.1:7332/mcp"
bearer_token_env_var = "NOFY_ACCESS_TOKEN"
```

stdio 和 HTTP 是同一个服务的两种传输，不各自维护声明或任务状态。

## 协议生命周期

使用 JSON-RPC 2.0。流程为 initialize → 验证协商结果 → notifications/initialized → tools/list → tools/call。协商上限固定为 MCP `2025-11-25`，按标准初始化协商处理客户端版本；客户端互通范围以实现记录中的实际运行结果为准。

stdio 每行一条 UTF-8 JSON 消息。HTTP 每次 POST 一条消息，接受 application/json 和 text/event-stream 响应。JSON-RPC id 用于关联传输，不当作内核 command_id。Schema/模板资源通过声明的 resources/list/read 暴露；未实现的 sampling、roots、elicitation 等能力不会被宣告可用。

MCP resources 使用受控 URI，例如 `nofy://schemas/contracts`、`nofy://schemas/operations`、`nofy://presets/index`、`nofy://projects/<id>/source` 与 `nofy://source-archives/<digest>?offset=0&limit=65536`。URI 只指向被授权的登记对象，不接受任意服务器文件路径或任意外部 URL。

## 常用操作输入

### 逐步创建 Agent

1. `nofy_agent_create` 创建源码工程，未配置 model/prompt 时保持 incomplete。
2. `nofy_agent_module_add` 添加引用、导入定义或配置工厂，并指定插槽/依赖。
3. `nofy_agent_inspect` 返回源码 revision、模块关系、缺项和可构建状态。
4. `nofy_agent_build` 输出原生部署；`nofy_system_validate` 校验。
5. `nofy_system_publish`、`nofy_system_plan`、`nofy_system_apply` 分别发布、查看差异并激活。

源码工程允许缺项，原生完整系统 Draft 仍只承载完整 SystemDocument。操作必须持有原 source revision，冲突时报告冲突并停止，不隐式覆盖。

### 添加工具

`nofy_agent_module_add` 与 CLI 共用 ModuleAdd 输入：agent、target、slot，以及 module_ref/native_module 或 factory/config/dependencies 的一种。工具快捷入口 `nofy_agent_tool_add` 自动选择 tools 插槽，其余输入和行为相同。

MCP 直接提供结构化参数，通常不需要先手写 JSON 文件。若实现来自代码，使用声明的源码文件集合或制品句柄；服务不会把客户端路径当成服务器路径。

### 运行与观察

`nofy_run_start` 返回接纳事实和原 run_id/thread_id。后续使用 inspect 和 events；长任务不占用一个无限等待的 tools/call。events 接受 cursor、limit 和有界 wait，在 data.native_json 中返回原事件，next_cursor 保存原游标；运行状态通过 inspect 查询。事件视图断开不自动重跑。

### 审批与恢复

`nofy_run_approvals` 获取完整原请求，`nofy_run_decide` 提交原请求与 allow。`nofy_run_recovery` 读取 root/child/model/hook 票据；`nofy_run_control` 提交带真实证据的原 ManagedAction。MCP 服务不能凭超时生成“未发生效果”的结论或编造恢复结果。

## Session 工具组

新增会话策略通过 `nofy_agent_module_add` 的 slot=session/session_policy 挂载，使用同一编辑引擎；策略模块不接管 MCP 传输连接。

| 工具 | 用途 |
|---|---|
| nofy_session_start / create | 原子创建首根会话，或接纳已有首根 |
| nofy_session_list / inspect / policy | 实例、状态与冻结策略查询 |
| nofy_session_turn / turns / binding | 原输入续轮、轮次列表、交接绑定查询 |
| nofy_session_route / plan | 只读候选选择与状态变更预览 |
| nofy_session_metadata | 带 command_id/CAS 更新展示元数据 |
| nofy_session_close / reopen / archive / unarchive | 静止边界的接纳状态与展示变更 |
| nofy_session_reconfigure / command | 轮次间策略切换及原命令回执查询 |

20 项操作的完整输入、规则/源码模块示例和结果字段见[Session 手册](sessions.md)，每项专用 inputSchema/outputSchema 见[操作目录](operations.json)。源码 revision、会话 revision、policy revision、源运行 live revision、轮次 binding revision 互相独立。MCP 返回精确字符串；原 DTO 放入 NativeJson，不改写业务数据。

Session 调用先核对 /sessions/capabilities，再使用专用会话输入和结果；连接旧内核或缺少能力时报告错误，不降级为旧会话线格式。

## 返回值与错误

成功调用通过 structuredContent 返回[公共结果对象](protocol.md)，content 附同一信封的 JSON 文本。大输出返回明确的制品句柄/分页，不静默丢弃正文后报告完整成功。

| 情况 | 表达 |
|---|---|
| JSON 解析错误 | JSON-RPC -32700 |
| 非法 JSON-RPC 请求 | -32600 |
| 不存在的方法 | -32601 |
| 未知工具或无法路由的工具请求 | -32602 |
| 已知工具的输入 Schema 错误 | 工具结果 isError=true、code=local_input |
| 适配器内部错误 | -32603；不暴露秘密或私有源码栈 |
| 内核领域拒绝 | 正常 tools/call 结果，isError=true，保留原业务错误码和标识 |
| 写请求失联 | status=unconfirmed、isError=true，保留原 command_id/run_id；不表示业务一定失败 |
| 任务已接纳 | status=accepted、isError=false；任务尚未完成 |

HTTP 传输层未认证/无效身份先返回认证状态；不能把未认证请求包成成功工具结果。任务状态在 data 中继续表达，isError=false 不证明某个外部工具的业务结果成功。

## 取消与超时

MCP notifications/cancelled 结束当前等待或本次适配器操作。已经提交给内核的任务继续由内核持有；需要取消它时显式调用 `nofy_run_cancel`。若断线时不能确认提交结果，用原 ID 查询，不能换 ID 自动重发。

传输观察超时、任务预算、工具自身期限是独立边界。MCP 服务不通过刷新预算/期限来让等待看起来成功；运行中模块替换仍走原停驻及 update_modules。

## 外部 Agent 的推荐工作过程

先 describe/schema；取得源码模板或创建空工程；逐步添加模块及依赖；inspect 确认缺项；build/validate；发布并查看差异；apply；提交真实任务；依据原事件、业务结果及恢复票据迭代；最后导出源码、依赖说明、版本来源和验收记录。

工具本身不要求使用某个模型或修改内核 Rust。pi 复现按固定参考提交和完整能力差异矩阵验收，不通过更换名字、缩小工具集合或只验证连接就宣称完成。

## 故障检查

| 现象 | 检查 |
|---|---|
| MCP 无法启动 | nofy 未构建/未安装、command 路径、环境变量转交、stderr |
| tools/list 看不到操作 | 服务能力、身份作用域、工具允许列表与协议版本 |
| 请求超时 | 先查原业务 ID 与回执，再决定是否重新观察 |
| MCP 已退出但任务还在 | 这是传输与持久任务分离；显式 cancel 才取消任务 |
| 添加代码后运行不变 | 确认是否 build/publish/apply，及运行是否仍固定原 release |
| 预设 pi 不可用 | 检查发现结果是否仍为开发中；不能自动替换成编码基线冒充 pi |

## HTTP 身份与归档读取

HTTP 桥接不读取 stdio 的固定令牌文件。每次请求验证 Bearer，并将相同身份用于该次内核调用；同一进程中的只读调用者不能借用另一个调用者的管理员权限。默认拒绝带未登记 Origin 的请求，无 Origin 的本地 MCP 客户端可正常连接；需要浏览器来源时显式增加 `--allowed-origin https://your-console.example`。Host 校验默认允许 localhost、127.0.0.1 和 ::1，自定义域名通过 --allowed-host 登记。

HTTP 使用无状态 Streamable HTTP，不保留跨身份的 MCP 传输 session；SDK 负责握手、JSON/SSE、版本和取消。支持的最高协议为 2025-11-25，未协商的 sampling、roots、elicitation 不开放。

`nofy_project_pack` 返回 sha256、精确字节数、uri 与下载路径。resources/read 返回 base64 块及 offset、next_offset、total、eof 和归档摘要；按 next_offset 读取至 eof=true 后校验摘要。默认 64KiB，单次最大 1MiB 仅约束传输块，不限制归档总大小。不要将第一块当成完整包。登记归档也可用带同一身份的 GET /api/v1/source-archives/<digest> 流式下载。

模块仓库操作及 `agent.module.use/unuse` 见[模块仓库手册](repositories.md)。声明保存固定版本引用，导出收齐源码；运行依赖由用户提供。
