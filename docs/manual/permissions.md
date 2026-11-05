# 权限规则、模式与会话授权

权限是原 Policy 链的约束。`policy.tool_rules` 配置 `default`、`unknown_command` 和有名称的 `rules`，每条规则提供 id、category、tools、action（allow/deny/ask），可附参数 JSON Schema 及命令前缀条件。同集合内 deny 优先，其次 ask，最后 allow；其他 Host/父 Agent floor 继续生效。ask 必须连接 `approval` Policy，通常为 `policy.approval`。

```json
{"default":"ask","unknown_command":"ask","rules":[
  {"id":"git-status","category":"command.read","action":"allow","tools":["run_command"],"command":{"pointer":"/argv","prefixes":[["git","status"]]}},
  {"id":"writes","category":"filesystem.write","action":"ask","tools":["write_file","apply_patch"]},
  {"id":"blocked","category":"network","action":"deny","tools":["mcp_untrusted_*"]}
]}
```

tools 支持精确名称或末尾 `*`。category 为操作者定义的分类，可以分别控制文件写入、网络、命令、外部 MCP、权限升级等，不绑定某个 Agent 产品。`arguments_schema` 限制实际参数。命令 pointer 指向 argv 数组或 POSIX 字符串；前缀是完整词数组，不是字符串 starts-with。allow 要求所有命令分段均匹配，`git status; rm ...` 不能因第一段获准而整体放行。

`nofy command analyze --command 'git status && printf done'` / `nofy_command_analyze` 只返回词、分段、动态构造和重定向诊断，不执行命令。argv 中的 `$HOME` 是字面参数；shell 字符串中的变量、替换、环境改写、无法证明的 wrapper 或重定向按 unknown_command 处理。固定 `sh/bash -c` 可做限深分析；分析不是完整 shell 解释器。静态 deny 对已识别禁止分段仍优先。动态规则建议 ask 或 deny；unknown_command:allow 是操作者显式放宽。

审批结果出现在原 run 的暂停原因及 approvals 列表。完整复制原 request（包括可选 policy_id），通过 `run.decide.decision_json` 提交：

```json
{"request":{"run_id":"<原值>","thread_id":"<原值>","step":1,"call":{"id":"<原值>","name":"<原值>","arguments":{}},"policy_id":"<原值>"},"allow":true,"scope":"session"}
```

scope 可选 once（默认）、root、thread、session，实际以暂停原因的 scope_offer 为准。Session scope 只在原监督 root 已登记 Session 时提供。anchor 来自原监督身份，不能由请求指定。命名规则记住该规则当前参数和命令约束；默认 ask 仅记住同一工具与相同参数。不同策略有独立 policy_id，一条规则的记忆不能通过另一条规则的审批。已记录决定不能改 allow 或 scope；原恢复命令沿原 run.control/actions 路径提交。

`permission.grants` 列出授权及版本；`permission.revoke` 提供 grant_id、expected_revision、稳定 command_id 精确撤销。重复相同撤销命令读取原结果，不复活 grant，也不改变过去已发生的效果。记忆跨 Host 重启，范围固定在原 root/thread/Session；切换规则内容或模块身份后不能沿用旧身份授权。deny 的记忆同样可明确保存与撤销。

进程资源另声明 OS 文件权限。`resource.process_namespace_limits.filesystem_mode` 可为 read_only、workspace_write、full_access；workspace_write 的 writable_directories 默认为 `["WORKSPACE"]`。内核在独立 Sandbox 副本上收紧目录 mount/Landlock，原目录资源声明不被改写。read_only 仅使所供给业务目录只读，私有 scratch 仍可写；workspace_write 只保留指定别名的原写权限；full_access 使用所有已显式供给的目录授权。三者都不能访问未供给的 Host 路径，运行环境仍只读，内核状态不向工具暴露。

权限升级必须明确选取已发布的较宽 profile 并经过适用审批。命令失败可能已产生部分效果，不能仅因非零退出码而自动换权限重放。指南与工厂 Schema 说明能力，实际操作权限始终由内核授权及资源边界决定。
