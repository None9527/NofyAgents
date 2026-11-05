# CLI 使用手册

版本：`0.6`。`nofy` 由 Rust CLI、共用操作客户端与源码引擎实现；构建和连接方式见[总入口](README.md)。

## 连接与通用选项

```text
nofy [全局选项] <命令组> <子命令> [参数]
```

| 选项 | 语义 |
|---|---|
| `--endpoint URL` | 常驻内核地址；不把浏览器代理地址当作固定内核地址 |
| `--token-env NAME` | 从指定环境变量读访问令牌，默认名称 `NOFY_ACCESS_TOKEN` |
| `--token-file PATH` | 读取显式私有令牌文件；与显式 token-env 二选一 |
| `--config PATH`、`--profile NAME` | 选择客户端连接配置；不保存令牌正文 |
| `--format json\|text` | 默认 JSON；text 供人工阅读 |
| `--output PATH` | 保存结果；默认拒绝覆盖已有文件，显式 `--replace-output` 才允许替换 |
| `--timeout SECONDS` | 本次连接/请求期限；不改变任务自身预算或执行期限 |
| `--input PATH`、`--input -` | 从文件或 stdin 读取该操作的完整输入对象 |
| `--help` | 命令层级、参数、作用域提示及 Schema 入口 |

优先级为显式命令参数、选定配置 profile、约定环境、默认值。同一层同时指定互斥令牌来源时报告参数错误，不静默选一个。HTTP 连接不转发访问令牌到重定向后的其他地址。

配置文件：

```toml
[profiles.local]
endpoint = "http://127.0.0.1:7331"
token_env = "NOFY_ACCESS_TOKEN"
format = "json"
```

连接操作：

```sh
nofy describe --endpoint http://127.0.0.1:7331
nofy schema --operation agent.module.add
nofy schema --factory tool.http_connected
```

`describe` 报告协议版本、作用域、工厂与预设状态。它不启动模型、不执行工具，也不把未完成的 pi 预设标为可用。

## 目标与事实源

| 目标 | 指定方式 | 修改位置 |
|---|---|---|
| 内核托管源码工程 | Agent 名称/显式 project ID | 内核源码工程，按 source revision 更新；CLI、HTTP 与 MCP 使用同一事实源 |
| 本地工作副本 | `--project /absolute/project` | 本地声明和源码文件；不会悄悄推送到托管工程 |
| 已发布系统 | system + release/generation | 内核原控制面；源码编辑不会改写旧 release |

同名本地目录和远端系统不自动互相替代。上传/导出必须明确；两种编辑入口使用同一格式和同一项目引擎。只有 build 完整的声明才能进入原生 `Draft`、发布和执行路径，详见[协议手册](protocol.md)。

## 创建与检查 Agent

```sh
nofy agent create coder
nofy agent list
nofy agent inspect coder
nofy agent export coder --output coder-source.tar.gz
```

`create` 创建源码工程及一个名为 coder 的 Agent。未选预设时允许缺少模型/Prompt，返回 `incomplete` 和缺项；不请求模型。相同名称已存在时拒绝覆盖。需要完整模板时使用 `--preset` 和明确版本；预设尚未发布时报告不可用。

本地方式：

```sh
nofy project init ./coder --empty --agent coder
nofy project inspect ./coder
```

工程布局：

```text
coder/
  project.json          工程入口和声明文件位置
  preset.json           现有 nofy.preset/v1 形式的唯一声明模板
  settings.json         非凭据参数；可缺省，部署构建时按实际需要补齐
  source-files.json     源码清单
  requirements.txt      普通外部依赖说明
  modules/              代码、模块定义与资源描述
  文件说明.md           职责和使用前提
```

空工程的未绑定引用属于源码阶段缺项。不会伪造可执行的默认模型、Python/GCC 环境或凭据。

## 添加模块：三种方式

### 1. 引用已有模块

```sh
nofy agent module add coder --module "$MODULE_REF" --slot tools
```

`MODULE_REF` 来自模块目录/发布结果。项目内引用必须能唯一解析；跨发布引用使用带 release 身份的完整引用，不能假定不同系统里相同 id/version 是同一模块。目录中没有的名称返回 not-found。

### 2. 直接提供参数

以下假设 coder 已有名为 service 的 HTTP 连接资源：

```sh
nofy agent tool add coder \
  --id search \
  --factory tool.http_connected \
  --set /contract/name=search \
  --set /contract/description='Search the declared service' \
  --set /path=search \
  --set /method=POST \
  --bind connection=service
```

CLI 读取工厂 Schema，生成模块声明，绑定 connection 依赖并挂入 coder 的工具集合。示例只描述接入方式，不声称对应服务已经存在或具备搜索能力。

参数规则：

| 参数 | 规则 |
|---|---|
| `--id` | 工程内模块标识 |
| `--factory` | 从真实 registry 发现的工厂名 |
| `--slot` | Agent 的目标位置；工具快捷命令可以自动选 tools |
| `--set /pointer=value` | 按 JSON Pointer 设置字符串，不猜测布尔值或数字 |
| `--set-json /pointer=JSON` | 设置数字、布尔、null、数组或对象等明确 JSON 值 |
| `--source /pointer=@path` | 上传/复制明确源码文件，建立明确的 source_bindings 文件绑定，业务 JSON 保持字面数据 |
| `--bind slot=module-ref` | 连接该工厂要求的依赖槽；与挂到 Agent 的 slot 不同 |
| `--expected-revision` | 对托管源码工程做 CAS；也可由命令先读 revision，再带原 revision 提交，冲突即停 |

### 3. 导入模块定义

```sh
nofy agent module add coder --from ./calculate.module.json --slot tools
```

文件定义与 CLI 参数使用同一规则。导入模式不混用重复的 factory/config 参数；复杂定义、共享代码和多依赖适合文件方式。[模块手册](modules.md)提供完整定义示例。

## 更新、连接与移除

```sh
nofy agent module list coder
nofy agent module inspect coder search
nofy agent module set coder search --set /path=search-v2
nofy agent module bind coder search --bind connection=service-v2
nofy agent module detach coder search --slot tools
nofy agent module remove coder search
```

`set` 修改源码配置，`bind` 修改依赖边，`detach` 解除 Agent 插槽连接，`remove` 删除未被引用的源码模块。删除仍有使用者的模块时返回引用清单；不递归删掉其他 Agent 的能力。单值 model/prompt 插槽已有绑定时，替换需传 --replace-slot，或先 detach；集合插槽避免重复挂载。

常规新增模块使用通用入口，CLI 不为每个自定义工具新增 Rust 子命令。资源模块通常作为依赖存在，不直接挂到 Agent 的 tools 插槽。新增会话策略使用 `--slot session`（规范名 session_policy）；原生种类和会话策略在[模块手册](modules.md)中分别标注。

## 构建、校验、发布、激活

```sh
nofy project build ./coder --output deployment.json
nofy system validate --file deployment.json
nofy system publish --file deployment.json
```

托管工程对应使用 `nofy agent build coder`。build 解析声明、引用与源码，输出原生部署；不执行项目自己的 build.py、不安装依赖、不调用模型。外部工具的真实运行仍由内核执行边界负责。

publish 回执给出 release；将实际值保存到 RELEASE 后：

```sh
nofy system plan coder --release "$RELEASE"
nofy system apply coder --release "$RELEASE" \
  --expected-generation "$GENERATION" --command-id "$COMMAND_ID"
```

新系统用 `--expected-generation none` 表示预期尚未激活；已存在系统使用查询得到的精确 generation。也可 `--input apply.json` 提供完整请求。调用 apply 就表示执行明确的激活动作，不另增加每次确认流程。

`nofy agent plan coder` 是源码预览，需由新增只读 preview 能力支持，不伪装成现有仅接收已发布 release 的 plan API。`nofy agent apply coder` 是构建/校验/发布/激活的组合便捷入口：分阶段回报，失败时保留已发生的事实和原标识，不宣称多个请求是一个原子事务。

## 启动、观察与续轮

```sh
nofy run start --input run.json
nofy run list
nofy run inspect "$RUN_ID"
nofy run events "$RUN_ID" --after "$CURSOR" --follow
```

run.json 使用原 ManagedRunRequest：run_id、thread_id、system、release、program，以及 Agent 的 input 或 Tool/Workflow 的 parameters。input 与 parameters 不互相冒充；参数结构通过发布的 program interface 查询。

`start` 默认在接纳后返回；`--wait` 等待运行进入完成或需要处理的状态。事件有原 cursor，断线续读不重启任务。持续会话通过 session 操作续轮，不能仅重复旧 run_id 来创建新一轮。

```sh
nofy session list
nofy session inspect "$SESSION_ID"
nofy session create --session "$SESSION_ID" --root "$ROOT_RUN_ID"
nofy session turn --input turn.json
nofy session turns "$SESSION_ID" --after "$SEQUENCE"
```

`create` 接纳已有首根；`session start` 原子创建首根 Job 与会话。turn.json 为公共 SessionTurn 输入，包含 expected_session_revision 和存放原 SessionTurnCommand 的 request_json，保留源运行 revision、绑定 revision 与先后顺序。

[Session 专册](sessions.md)给出全部 20 项会话 CLI/MCP 操作及规则/源码模块例子：路由、元数据、生命周期、策略查询/切换、原命令与轮次绑定查询。`session plan` 是只读预览；reconfigure 首期仅在轮次间静止边界生效。先用 describe 确认连接的是新版内核。

## 审批、取消、更新与恢复

```sh
nofy run approvals "$RUN_ID"
nofy run decide "$RUN_ID" --input decision.json
nofy run cancel "$RUN_ID" --command-id "$CANCEL_ID"
nofy run control --input action.json
nofy action inspect "$COMMAND_ID"
nofy run recovery "$RUN_ID" --kind root
```

decision.json 必须携带刚读到的完整原审批请求及 allow；改动参数不算批准原请求。取消使用独立 cancel 操作。Ctrl-C 默认结束本次等待，不自动取消内核任务。

control 传递原 ManagedAction，支持 park/unpark、resume、transition、update_modules 及原有对账等种类。先查询原运行/票据，按实际 Schema 提交；不根据超时猜造工具或模型结果。

发布新配置默认只激活系统版本；运行中替换模块须先取得明确停驻边界，并用原 park_command_id、expected_revision 和选择的 update 字段执行。保持原会话、预算及已成功效果。

## 导出、打包和回滚

```sh
nofy system history coder
nofy system export "$RELEASE" --output system.bundle.json
nofy project pack ./coder --output coder-source.tar.gz
nofy system rollback coder --release "$OLD_RELEASE" \
  --expected-generation "$GENERATION" --command-id "$ROLLBACK_ID"
```

export 导出已发布系统；pack 归档源码和普通依赖清单，不打包 Python/GCC/库，不探测依赖版本、强制环境闭包或设置包体配额。输出默认不覆盖。完整会话和记忆历史通过显式状态后端/迁移操作处理，不随源码包暗中复制。

rollback 将旧 release 作为目标，再产生新 generation；不会把 generation 倒退，也不会撤销已发生的文件、网络或模型效果。用户自行安装的依赖不由声明回滚替换。

## 资源及完整接口发现

`nofy resource list/inspect/apply`、`nofy budget list`、`nofy credential list/put/delete` 作为资源组入口；复杂请求可用 `nofy call <operation-id> --input request.json`。operation-id 必须来自版本化目录，不能任意指定 HTTP URL。凭据正文只从指定 stdin/私有文件输入，不出现在命令行、普通结果或日志里；MCP 不向模型开放读取密钥值的工具。

原生管理路径的完整出处见 [HTTP API 索引](http-api-index.json)。操作目录会明确哪些功能已实现，不能靠 generic call 掩盖尚未实现的能力。

## 输出、退出码与排错

默认 stdout 是一个协议结果对象；follow 输出 NDJSON，进度和诊断到 stderr。机器消费者同时检查信封 status、运行状态与外部工具业务结果，不能只看进程退出码。

| 退出码 | 含义 |
|---:|---|
| 0 | 操作成功或明确已接纳，查看结果中的实际业务状态 |
| 2 | 本地参数/输入 Schema 错误 |
| 3 | 未认证或权限不足 |
| 4 | revision/generation/命令身份冲突 |
| 5 | 项目、模块、release 或运行不存在 |
| 6 | 连接失败、请求中断或结果未确认 |
| 7 | 内核领域拒绝；或显式 --wait 得到失败/取消/预算耗尽 |
| 8 | 显式 --wait 停在审批、人类输入、预算停驻或对账等需处理状态 |
| 9 | 本地文件/归档或环境前提错误 |
| 10 | 不支持的协议版本或操作 |
| 130 | 用户停止本次 CLI 等待/订阅 |

| 现象 | 处理 |
|---|---|
| CLI 不存在 | 按总入口构建 nofy，并将其绝对路径或所在目录加入 PATH |
| 401/403 | 检查连接 profile、令牌来源和作用域；不要把模型 API key 当内核访问令牌 |
| 源码工程 incomplete | 查看 missing_slots，补齐真实模型、Prompt 和依赖后再 build |
| 409 冲突 | 重新读取原版本与差异，再明确提交；不自动覆盖 |
| 发布成功但没运行 | 检查是否 apply、program 参数是否正确以及运行是否已接纳 |
| 找不到外部依赖 | 用户安装或修正显式环境绑定；源码打包无需因此失败 |
| 写请求超时 | 保留原 command_id/run_id，查询回执；不要换新 ID 重发 |
| 工具出错而根任务 completed | 检查工具业务结果与 is_error/ok/退出码；根状态不是效果证明 |

## 本地编辑和精确输入

`--offline` 让源码变换不查询工厂目录；离线添加工具使用规范 `--slot tool_packs` 或 `--slot tool_sources`，`tools` 别名在 build 时需要工厂种类。离线不执行发布、运行或远端查询。`--preset-dir /absolute/presets` 可读取本地模板登记；`--settings FILE` 给本地构建提供临时参数，不隐式改写 settings.json。

`--input` 默认接收该操作的完整对象；system validate/publish、run start/control/decide/input 也识别其原生 DTO，按对应 NativeJson 字段封装。NativeJson 的具名参数可用 `@FILE`，例如 `--request-json @run.json`。字段与位置参数或 --input 重复时拒绝歧义。版本数字以十进制字符串输入，`none`/`null` 仅用于允许空值的创建/激活字段。

新增模块的 config/config_json、--set 和 --set-json 都按字面数据处理，不递归执行其中的模板关键字。`--source /source=@calculate.rhai` 复制指定文件到源码集合，通过 source_bindings 绑定；不把该客户端路径传给服务器读取。

跨发布模块引用使用 `nofy://releases/RELEASE/modules/ID/VERSION`，ID/VERSION 按 URI 组件编码。导入精确依赖闭包；遇到同 ID 的不同定义返回冲突，不替换、改名或扫描任意业务 JSON 猜测依赖。

CLI 的写入会先读取一次原 revision 或 generation，带这个版本提交；冲突后停止，不自动取新版本覆盖。`--expected-revision`、`--expected-generation` 可明确固定预期。未提供 command_id 的独立生命周期/激活命令会生成一个 ID，并在 refs 中返回；自动化重试应主动提供固定 ID。

私有模型凭据示例：

```sh
nofy credential put MODEL_KEY --expected-revision none \
  --value-from '{"kind":"stdin"}' < "$PRIVATE_MODEL_KEY_FILE"
```

凭据文件可改用 `--value-from '{"kind":"file","path":"/private/model-key"}'`，文件须为私有常规文件；密钥正文不出现在参数或结果。不能同时从 stdin 读取操作 JSON 和密钥值。

`--output` 对 build 写 deployment_json，对 system export 写原生 bundle JSON，对 agent export/project pack 写源码 tar.gz，其他操作保存结果信封。默认不覆盖已有输出；--replace-output 显式替换。原源码摘要不匹配时本地编辑拒绝提交，未列入 source-files.json 的用户文件不被修改。

本机开发安装已将 nofy 指向新版 Rust CLI；默认 local profile 只引用既有 console-token 文件，连接 http://127.0.0.1:7331。stdio 身份需要环境变量时明确传 --token-env，避免 profile 的令牌文件引用优先于环境。运行尚无 live 更新记录时，run inspect 的 refs.live_revision 返回 "0"；预算及运行资源来源的 next_cursor 保留内核原值。resource list --kind runtimes 返回完整清单，不接受分页。

--config PATH 专用于客户端连接配置；模块参数通过 --config-json、--set/--set-json 或 --input 内的 config 对象提供，两种配置含义分开。

模块仓库操作及 `agent.module.use/unuse` 见[模块仓库手册](repositories.md)。声明保存固定版本引用，导出收齐源码；运行依赖由用户提供。
