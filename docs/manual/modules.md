# 模块、工具与声明手册

版本：`0.3`。模块类型、CLI/MCP 编辑与 SessionPolicy 使用统一 Runtime、Loader 与源码引擎。

## 一个模块包含什么

当前原生 ModuleDefinition 有四部分：

| 字段 | 内容 |
|---|---|
| reference | 该系统依赖图内的 id 与 version |
| factory | 宿主提供的通用装载工厂 |
| config | 按该工厂 Schema 描述参数、代码或制品引用 |
| dependencies | 从工厂依赖槽名称到其他 ModuleRef 的显式连接 |

Agent 声明再将模块挂到 model、prompt、tools、context、policy 等位置。**定义模块、连接模块依赖、将模块挂到 Agent，是三个不同动作**，CLI 可以在一次 add 中完成，但不会将任意 Resource 当成可调用工具。

JSON 描述接入方式。实际行为可以由 Rust 内核的通用能力、Rhai、外部脚本/程序、HTTP 服务或 MCP 服务提供。自定义外部模块不要求修改内核 Rust；选择某种脚本语言也不意味着框架必须捆绑该语言的运行环境。

## 模块种类与插槽

| 原生种类 | CLI slot/用途 | 接线要求 |
|---|---|---|
| model | model | Agent 单值模型插槽，依赖相应连接和协议 |
| prompt | prompt | Agent 单值 Prompt；源码可由模块配置或制品提供 |
| tool_pack | tools | 添加到 tool_packs 集合，一个包可包含多个工具 |
| tool_source | tools / tool_sources | 添加到动态目录集合，执行时获取工具快照 |
| context_source | context / context_sources | 追加上下文来源 |
| context_policy | context_policies | 压缩/整理上下文的策略 |
| policy | policies | Agent 策略；系统 required_policies 另作强制约束 |
| governance | governance | 预算/治理；系统 required_governance 同样覆盖子运行 |
| recipe | recipe | 单值运行配方 |
| stage、stage_source | recipe 的依赖 | 阶段及阶段来源，通过配方连接 |
| middleware | middleware | 声明的中间件集合 |
| checkpointer | checkpointer | 显式检查点能力 |
| binding | bindings | 工作目录、能力或其他上下文绑定 |
| hook | hooks | 订阅 Agent 的声明事件 |
| hook_handler | Hook 的依赖 | handler 本身不能当成订阅挂载 |
| event_producer | Event 程序的依赖 | 通过 Event 程序装配，不凭空新增 Agent 插槽 |
| session_policy | session / session_policy | Agent v2 的会话策略单值插槽 |
| resource | 其他模块依赖 | 连接、目录、制品、环境、记忆或运行资源等 |

“记忆模块”通常是 Resource、ContextSource/ContextPolicy 和工具的组合，不存在一个可以包办所有记忆行为的原生 memory 枚举。模块包可以一起添加这些组件，并清楚显示建立的连接。

## 发现 Schema 与依赖

### SessionPolicy 扩展状态

会话模块化提供 `session_policy` 种类及 Agent v2 的 session_policy 单值引用，CLI slot 的 session 是其别名；`session_policy.rules` 与 `session_policy.programmed` 分别使用规则配置和外部纯源码。两种工厂均由新版默认 Host 注册；实际可用配置以 schema 查询为准。

实例管理仍由内核 Session 子系统执行，存储复用 resource.runtime_store，ContextPolicy 继续负责上下文整理。[Session 手册](sessions.md)提供参数/JSON/MCP 接入和策略应用边界；[架构方案](../architecture/session-modularization.md)定义内核保留的不变量。

### 工厂发现

```sh
nofy describe
nofy schema --factory tool.http_connected
nofy agent module list coder
```

工厂发现沿原 `GET /api/v1/modules`；配置相关依赖沿原 `POST /api/v1/modules/dependencies`。不要仅根据工具名称猜测参数、权限或环境。工厂缺失时报告缺失能力，不自动安装或手工生成 Rust 注册代码。

## 完整自定义计算工具

这是一个真实的纯计算工具定义，功能为返回输入整数的两倍；不依赖模型、网络或外部程序。当前默认 Host 已有 `tool.rhai`，执行仍走原隔离 Executor。

保存为 calculate.module.json：

```json
{
  "reference": {"id":"calculate","version":"1"},
  "factory": "tool.rhai",
  "config": {
    "contract": {
      "name": "calculate",
      "description": "Return twice the supplied integer.",
      "effect": "read_only",
      "input_schema": {
        "type":"object",
        "required":["value"],
        "additionalProperties":false,
        "properties":{"value":{"type":"integer"}}
      },
      "output_schema": {
        "type":"object",
        "required":["result"],
        "additionalProperties":false,
        "properties":{"result":{"type":"integer"}}
      }
    },
    "source": "#{result: args.value * 2}"
  },
  "dependencies": {}
}
```

添加方式：

```sh
nofy agent module add coder --from ./calculate.module.json --slot tools
```

不先写模块 JSON 文件也可以。将实现保存到 calculate.rhai，内容为 `#{result: args.value * 2}`，通过参数提供接口：

```sh
nofy agent tool add coder \
  --id calculate --factory tool.rhai \
  --set /contract/name=calculate \
  --set /contract/description='Return twice the supplied integer.' \
  --set /contract/effect=read_only \
  --set-json '/contract/input_schema={"type":"object","required":["value"],"additionalProperties":false,"properties":{"value":{"type":"integer"}}}' \
  --set-json '/contract/output_schema={"type":"object","required":["result"],"additionalProperties":false,"properties":{"result":{"type":"integer"}}}' \
  --source /source=@./calculate.rhai
```

CLI 负责生成声明和 `$file` 连接，代码正文保持为数据，不递归解释成 CLI/模板命令。上述两种方式表达相同工具行为；显式原生版本与自动生成的源码版本可以不同。

## 外部脚本或程序工具

使用已有 `tool.process_artifact` 或 `tool.process_tree_artifact`。准备：

1. 参数/输出 Schema 和 ToolContract。
2. resource.artifact 代码制品与真实 entrypoint。
3. resource.process_local 的用户自备运行环境；需要锁定部署时才选显式锁定环境。
4. 显式目录及其他依赖；会派生进程的工具使用原 process-tree 资源和实际受支持的委托前提。

工具按明确 argv/JSON stdin 工作；环境、依赖和执行权限由声明决定。不能把宿主碰巧安装了某个工具当成 Agent 已经获得该能力，也不能因为打包时没安装依赖就拒绝源码归档。

## HTTP 与 MCP 工具

HTTP 工具使用 `resource.http` + `tool.http_connected`。connection 是依赖槽，config 中 path/method/input/credential_ref 等按真实 Schema 配置。认证只保存凭据引用；资源接纳的方法和凭据引用继续约束实际调用。

调用外部 MCP 服务使用 `resource.mcp_http` + `tool_source.mcp`。该现有适配器只覆盖已验收的 Streamable HTTP 工具范围，详见[原契约](../architecture/mcp-http-tools.md)。这是 coder 的工具来源，与[供外部 Agent 管理内核的 MCP Server](mcp.md)不同。

工具名要符合当前 ToolId 契约；外部 MCP 的不支持名称通过 aliases 显式映射。readOnlyHint 等远端注解只提供描述，不能赋予运行权限。

## 版本与移除

CLI 新建的源码模块在 build 时根据工厂、配置及依赖内容生成版本；已发布引用保持原身份。引用更新只处理声明中明确的模块关系，不扫描任意业务 JSON 字段做替换。

发布后，原 release 的定义和依赖被冻结。修改本地/托管源码不会覆盖已发布版本；重新构建和发布获得新 release。移除被其他模块使用的节点需要先明确调整依赖，不能为了让声明通过而隐藏使用者。

## 使用前检查

- 模块定义有效不表示已经挂到 Agent；用 module inspect 检查实际插槽与调用关系。
- 同一个模型/Prompt 插槽只保留明确绑定的单值；多个工具包则合并目录并检查同名冲突。
- output_schema 描述输出形状。工具自己的 ok、isError、退出码或业务字段仍需按其契约解释；不能把根任务 completed 当成业务成功。
- 凭据、目录和外部环境是显式前提。源码包和可移植声明不含访问令牌与模型密钥。
