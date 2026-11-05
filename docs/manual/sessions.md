# Session 会话与策略手册

版本：`0.6`。SessionPolicy、Agent v2 声明、原生 HTTP、CLI 与 MCP 使用统一内核会话实现。验证范围见[Session 实现记录](../verification/session-modularization.md)与[CLI/MCP 实现记录](../verification/agent-development-cli-mcp.md)。当前发布不包含前端。

## 对象与职责

| 对象 | 用途 |
|---|---|
| Agent 声明 | 定义模型、工具、Prompt、会话策略及其他能力 |
| SessionPolicy 模块 | 决定会话命名、接纳、路由和归档建议，不保存活会话 |
| Session 实例 | 组织同一线程的连续轮次，保留起点和原预算根 |
| Run | 一次真实执行；通过原会话接纳和交接连接连续轮次 |
| MCP 传输会话 | 连接外部客户端与 MCP Server；连接断开不删除内核 Session |

内核继续校验身份、FIFO、权限、预算、检查点、命令幂等和恢复。会话存储复用 `resource.runtime_store`；上下文整理用 ContextPolicy，持久记忆使用原资源/模块。

## 给 Agent 添加会话策略

原生新增种类为 `session_policy`，Agent 的规范字段为 `session_policy`。CLI/MCP 的 slot 可写 session 或 session_policy，二者指向同一个单值插槽。

参数方式，无需预先编写模块 JSON：

```sh
nofy agent module add coder \
  --id session-default --slot session --factory session_policy.rules \
  --set /naming/prefix=coder \
  --set /admission/when_busy=queue \
  --set /routing/mode=labels \
  --set-json '/routing/keys=["project","workspace"]' \
  --set-json /history/archive_after_idle_seconds=null
```

等价的完整模块定义，可保存为 session.module.json 后用 `--from` 导入：

```json
{
  "reference": {"id":"session-default","version":"1"},
  "factory": "session_policy.rules",
  "config": {
    "naming": {"prefix":"coder"},
    "admission": {"when_busy":"queue"},
    "routing": {"mode":"labels","keys":["project","workspace"]},
    "history": {"archive_after_idle_seconds":null}
  },
  "dependencies": {}
}
```

```sh
nofy agent module add coder --from ./session.module.json --slot session
nofy agent module inspect coder session-default
nofy agent module set coder session-default --set /admission/when_busy=reject
```

实际使用时选一种添加方式；重复挂同一个单值插槽会报告已有连接，需要传 --replace-slot，或先 detach 再添加。源码模块的自动版本与显式导入版本可以不同。build/publish/apply 之后，新运行才使用该发布；已有 Session 要走后面的 reconfigure。

| 规则字段 | 语义 |
|---|---|
| naming.prefix | 展示名称前缀；不会改变 session_id |
| admission.when_busy | queue 进入原 FIFO；reject 返回忙碌拒绝；不开放同线程并发 |
| routing.mode=explicit | 使用明确 Session ID；keys 必须为空数组 |
| routing.mode=labels | 按 keys 的全部标签匹配；keys 非空，缺值不匹配，多结果要求调用者选择 |
| history.archive_after_idle_seconds | null 保持当前展示状态；精确秒数字符串表示空闲阈值，仅建议归档，不删除历史 |

标签按字符串精确比较；标签与展示名都不授予权限。策略的执行操作数、时间和消息资源边界只约束运行，不对源码包设置容量配额。

## 外部源码策略

`session_policy.programmed` 复用隔离纯 JSON/Rhai Executor。完整的显式接纳策略模块如下；它保留原 ID、不给出归档建议，最终接纳仍由内核检查：

```json
{
  "reference": {"id":"session-explicit","version":"1"},
  "factory": "session_policy.programmed",
  "config": {
    "source": "#{decision: \"allow\", reason: \"explicit request\", session_id: args.request.session_id, display_name: (), archive: false}",
    "parameters": {}
  },
  "dependencies": {}
}
```

也可把 source 正文放进 session-policy.rhai，使用 `--source /source=@./session-policy.rhai` 添加。该工厂由新版默认 Host 的 Loader 注册；旧实例未升级时不会发现它。

ABI 固定为 `nofy.session-policy/v1`，输入 `SessionPolicyInput`，输出 `SessionPolicyProposal`。入口变量 args 含 phase、冻结时间、会话摘要、请求摘要/标签、授权候选和 parameters_json。阶段是 create、admit_turn、route、retention；所有字段与约束见[Schema](contracts.schema.json)。

输出始终含 decision、reason、session_id、display_name、archive。模块输出只有建议权：会话 ID 必须与原请求/候选相符；route 不能创建会话，retention 不能删除历史。缺失输出、非法 ID、异常或超时报告策略错误，不自动允许。脚本没有模型、文件、网络、时钟或秘密读取能力。

## CLI 操作索引

下表为 CLI；每项对应相同后缀的 `nofy_session_*` MCP 工具。完整输入不是原生 HTTP 请求的简单照抄；`--input` 接收该操作 Schema 中的整个对象，NativeJson 字段再传原 DTO 文本。

| CLI / MCP 后缀 | 主要输入与作用 |
|---|---|
| start | session_id、command_id、expected_session_revision=null、request_json；原子登记首根 Job 与会话 |
| create | session_id、root_run_id；显式接纳已有首根，HTTP 使用同名 session_id/root_run_id |
| list | after、limit、include_archived；limit 1..256，默认不展示归档会话 |
| inspect | session_id；会话状态、原身份、revision 与策略身份 |
| turn | session_id、expected_session_revision、request_json；按原 SessionTurnCommand 续轮 |
| turns | session_id、after、limit；after 是原任务 sequence 的精确字符串 |
| binding | session_id、run_id；查询原轮次接纳和已准备的交接种子摘要 |
| route | system、release、program，及 session_id/labels；只读候选，不提交输入 |
| policy | session_id；冻结策略、policy revision 及运行存储归属摘要 |
| plan | session_id、expected_session_revision、change；只读预览 metadata/生命周期/reconfigure |
| metadata | session_id、command_id、expected_session_revision，及 display_name/labels 至少一项 |
| close / reopen | session_id、command_id、expected_session_revision；关闭或恢复接纳 |
| archive / unarchive | session_id、command_id、expected_session_revision；归档或恢复展示 |
| reconfigure | session_id、command_id、expected_session_revision、source_run_id、expected_source_revision、policy |
| command | session_id、command_id；查询原命令准备/已应用/已拒绝回执 |
| fork / rewind | 来源会话与 turn 的精确版本、新会话/根请求；复制完整或指定前缀历史，不重放工具效果 |
| tree | session_id；查询父子 lineage 与根身份，调用方显式选择分支 |

本轮实现提供全部 20 项原生会话操作，适配器状态仍分别标注。现有 HTTP 索引只记录真实路由；操作目录的 native_api_state 与 interface_state 区分内核和 CLI/MCP。

### 创建、观察和续轮

先构建发布含真实 model/prompt/session_policy 的 Agent。root-run.json 为原 ManagedRunRequest，含真实 run_id、thread_id、system、release、program 和 input。ID 在请求发出前固定；例子中的变量由实际查询/生成结果设置。

```sh
nofy session start --session "$SESSION_ID" --command-id "$START_ID" \
  --request root-run.json
nofy session inspect "$SESSION_ID"
nofy session policy "$SESSION_ID"
nofy session command "$SESSION_ID" "$START_ID"
nofy session turn --input turn.json
nofy session turns "$SESSION_ID" --after "$SEQUENCE" --limit 100
nofy session binding "$SESSION_ID" "$RUN_ID"
```

start 固定预期不存在（null）。先已有首根时用 `nofy session create --session "$SESSION_ID" --root "$ROOT_RUN_ID"`；它不会合并另一个会话或已独立花费的历史预算。

原生 SessionTurnCommand 内的 command_id、source_run_id、expected_source_revision、expected_binding_revision 和 turn 仍按原含义使用。新会话 CAS 不替代源运行或绑定 CAS。turn.kind=new 的 input 是 text/attachments；queued 必须保留原 run_id/submission_digest。

### 路由与元数据

```sh
nofy session route --system coder --release "$RELEASE" --program coder \
  --label project=nofy-build --label workspace=main
nofy session metadata "$SESSION_ID" --command-id "$METADATA_ID" \
  --expected-revision "$SESSION_REVISION" --display-name '当前开发会话'
```

route 返回 none/unique/ambiguous/rejected、候选及选中 ID。只读路由不保证随后仍能接纳；续轮时重新验证原会话状态和策略。metadata 中 display_name=null 清除展示名；labels 一旦提供就整体替换标签映射，省略则保留。CLI 的重复 `--label key=value` 构造完整标签映射，同 key 重复视为参数冲突。

### 生命周期与策略切换

```sh
nofy session close "$SESSION_ID" --command-id "$CLOSE_ID" \
  --expected-revision "$SESSION_REVISION"
nofy session archive "$SESSION_ID" --command-id "$ARCHIVE_ID" \
  --expected-revision "$CLOSED_REVISION"
nofy session list --include-archived
nofy session unarchive "$SESSION_ID" --command-id "$UNARCHIVE_ID" \
  --expected-revision "$ARCHIVED_REVISION"
nofy session reopen "$SESSION_ID" --command-id "$REOPEN_ID" \
  --expected-revision "$UNARCHIVED_REVISION"
```

每一步使用上一步真实回执的 session_revision。close/reopen 改变接纳状态；archive/unarchive 改变展示标记，归档期间拒绝续轮。生命周期提交需静止边界，不隐式取消原运行；关闭/归档后仍可查询和处理原恢复票据。归档阈值给出建议，实际修改经带 CAS 的 archive 提交。

```sh
nofy session plan --input policy-plan.json
nofy session reconfigure --input policy-change.json
```

plan 不预留版本或锁；提交仍检查全部条件。reconfigure 仅在源根已关闭、无活动根、无排队输入和未知效果的轮次间边界应用。policy 指向指定发布中的 ModuleRef；只更换策略闭包，后继轮次种子冻结它。会话 revision 与 policy_revision 递增，原预算/历史身份不变。

策略切换请求格式：

```json
{
  "session_id":"s-coder-01",
  "command_id":"policy-change-01",
  "expected_session_revision":"3",
  "source_run_id":"run-coder-01",
  "expected_source_revision":"0",
  "policy": {
    "release":"selected-published-release",
    "module":{"id":"session-explicit","version":"1"}
  }
}
```

以上 ID、版本和 release 是格式示例，实际提交必须使用真实回执与已发布引用。运行中返回 busy/conflict，不悄悄排队到以后切换。回滚也是提交旧策略引用的新 reconfigure。存储迁移使用已有 runtime-history 路径；源码打包不复制会话数据库。

## MCP 调用

使用 [MCP 手册](mcp.md)中的入站 Server。将会话模块挂到源码 Agent 的 `nofy_agent_module_add` 输入为：

```json
{
  "target":{"kind":"project","project_id":"coder","expected_revision":"0"},
  "agent":"coder",
  "id":"session-default",
  "slot":"session",
  "factory":"session_policy.rules",
  "config": {
    "naming":{"prefix":"coder"},
    "admission":{"when_busy":"queue"},
    "routing":{"mode":"explicit","keys":[]},
    "history":{"archive_after_idle_seconds":null}
  }
}
```

`nofy_session_turn` 的输入示例：

```json
{
  "session_id":"s-coder-01",
  "expected_session_revision":"0",
  "request_json":"{\"command_id\":\"turn-02\",\"source_run_id\":\"run-coder-01\",\"expected_source_revision\":0,\"expected_binding_revision\":0,\"turn\":{\"kind\":\"new\",\"run_id\":\"run-coder-02\",\"input\":{\"text\":\"继续当前任务\",\"attachments\":[]}}}"
}
```

expected_session_revision 使用精确字符串；request_json 中保留原 DTO 字节与数值。示例里的三种版本都须替换为实际查询结果。MCP 工具名、输入与结果 Schema 逐项列在[机器目录](operations.json)；Session 操作共 20 项，传输 JSON-RPC id 不作为业务幂等键。

## 结果、权限与排错

共同信封仍是 protocol/operation/status/data/error/refs/next_cursor。SessionState 报告 session_revision、policy_revision、lifecycle、archived、display_name、labels、原 root/budget/thread 身份、实际 active_run_id、策略身份及 native_view_json。读取旧基础 API 的客户端不能自行编造这些新增字段。

start 和生命周期写操作返回 SessionCommandReceipt，phase 为 prepared/applied/rejected。applied 表示命令已提交，不表示首根运行已完成；原 run 结果与工具业务状态仍需单独检查。服务端 prepared 不等于客户端已经确认，响应丢失时查询原 command_id。create 使用原 session_id/root_run_id 精确幂等；turn 使用 request_json 内原 command_id 和完整请求。

commands 查询允许读取尚未创建实例时 start 的准备/拒绝回执。精确重放先读原请求和回执，不因当前会话 revision 已变化而再执行一次；相同 ID 的不同内容拒绝。直接提交同线程 Run/NextTurn 也须在原 Job/交接及 begin_run 路径校验策略，不能绕过会话接纳。

read 用于查询、route 和 plan；execute 用于会话实例写入；reconfigure 还需 read 目标发布；源码编辑/发布仍按 edit/publish 及资源权限检查。模块建议与标签不增强调用者权限。

| 现象 | 处理 |
|---|---|
| 未发现 SessionPolicy 工厂 | 检查当前 Host 是否升级、工厂是否注册；读取真实 registry 能力，不生成手工 Rust 注册代码 |
| 路由 ambiguous | 让调用者明确选择 ID，再读该会话 revision；不自动取第一个 |
| revision 冲突 | 重新读取状态和差异；不以新版本自动覆盖 |
| 会话 busy | 等待已提交工作走完，或显式处理原运行；超时不能冒充静止边界 |
| 已 closed/archived | 带原 revision 显式 reopen/unarchive，保留原预算与历史 |
| 原输入已排队 | 使用原 queued run/digest 查询与接纳，不另建重复输入 |
| 策略异常/非法输出 | 报告 policy_invalid；修正并发布模块，按边界显式切换 |
| 写请求失联 | 保留同一命令和原输入，查询 session.command 或轮次 binding；不换新 ID 重发 |

新版原生错误包含 session_closed、session_archived、policy_rejected、policy_invalid；路由歧义由 route 的 ambiguous 状态表达。CLI 的冲突退出 4，未确认退出 6，领域拒绝退出 7。取消任务沿 run.cancel；Ctrl-C/MCP 请求取消默认仅停止本次等待。

物理删除历史、分支/克隆、跨 Agent 合并和预算重置不属于本首期契约。实施与真实行为验收见[架构要求](../architecture/session-modularization.md)；本页例子通过文档校验也不能宣称这些接口已经可用。

## 原生 HTTP 的实际入口

新版接口以 `GET /api/v1/sessions/capabilities` 报告 `nofy.session-control/v1`、Agent 声明版本和策略 ABI Schema。接口清单见[HTTP 索引](http-api-index.json)。

- POST sessions：输入 `{session_id,root_run_id}`；返回 SessionState。Rust 内部 SessionRequest 仍使用 id，不将内部 DTO 当成新版线格式。
- POST sessions/start：输入 SessionStart；首根与会话同事务，返回 SessionCommandReceipt。rejected 也有持久回执，不意味着已派发。
- POST sessions/{id}/turns：输入完整 `{session_id,expected_session_revision,request_json}`；request_json 保存原 SessionTurnCommand。
- GET sessions/{id}/turns：返回 `{turns_json:[原轮次 JSON 文本]}`，控制数值保持精确。
- GET sessions/{id}/turns/{run}：报告原生绑定、seed_json 和 policy_admission_json。首根/直接 Run 可以没有显式轮次命令，因此 native_admission_json 可为 null；策略拒绝仍可通过此处查询。
- 生命周期、元数据、plan、route、policy、reconfigure、commands 使用上表完整输入，路径里的 id 与输入 session_id 必须一致。

策略拒绝的直接 Run/NextTurn 保留原 Job 和输入，停为 waiting；取消或进一步处理需显式操作。已接纳输入使用冻结的策略和标签，不因后来的展示元数据修改而重新解释。

新会话起点协议为 nofy.session/v2，要求同库 profile 存在；受支持的 v1 原始身份仍可读取，并以明确命令增补元数据。策略交接 seed 使用 v2 并冻结 policy epoch；没有策略的既有 seed 保持原格式。旧二进制不能调度新增协议，二进制降级需停止调度并保留原库；策略回滚在新版内核中作为新 reconfigure 提交。
