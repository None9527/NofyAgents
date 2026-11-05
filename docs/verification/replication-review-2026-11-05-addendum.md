# 0.6 版本复验记录（对 kernel-gaps-2026-11-05 的独立复核）

对象：commit `558be01f`（契约 0.6，97 操作 / 95 MCP 工具 / 65 工厂）。方法：不采信自述，用新二进制重跑原报告失败探针与组件级复现。

## 已确认修复

1. **K2b 现场回传 ✅**：`tool_completed.result.details` 现在携带 `exit_code`、`signal`、`stderr`、`stderr_truncated`。真实 run 中 stderr 原文（"required module isolation or runtime launch failed: Permission denied (os error 13)"）可读到。复现命令：pi-r4 重跑 read_file，`nofy_run_events` 的 tool_completed.details。
2. **K1 组合门槛 ✅**：`resource.process_namespace_limits` 已注册，替换 cgroup 资源后 `agent.plan` 通过（原 "explicit canonical cgroup v2 delegation root is required" 只在仍引用 `resource.process_tree_limits` 时出现）。
3. **审批语义 ✅**（见 docs/manual/protocol.md；引用行号未复核）：`run.decide {request, allow}` 只记录决定；必须再发 `run.control {"run_id","command_id","command":{"kind":"resume"}}`，之后 run 才恢复。仅 decide 不恢复（曾被误判为卡死，实为文档要求的显式两步）。

## 新发现的问题

### A. 125 的真正根因与仍存在的触发条件

- 根因：`crates/common/nofy-agent-host/src/loader/isolation.rs` 的 `local_paths` 分支只授予 `ReadFile | ReadDir`（`execute` 为 true 时才加 `Execute`）；而 landlock 0.4.4 的 `AccessFs::from_read` 含 `Execute`（fs.rs:112）。动态链接器对共享库 mmap(PROT_EXEC) 需要 Execute，缺它即 EACCES。
- 触发：`loader/launch.rs:84` 把 `resource.process_local` 的 **全部** `paths` 放进 `local_paths`（含 `execute:false` 的库目录）。因此按预设/旧包写法声明依赖目录（execute:false）的运行时，process 工具 100% EACCES。
- 复现（组件级，秒级）：同一 worker、同一 private_root/lease，仅 `local_paths` 与 `read_only` 放置不同——库目录放 `local_paths`(execute:false) → exit 125；放 `read_only` 或 `execute:true` → exit 0。
- 端到端验证：发布 `workspace-runtime@0.1.1`（库目录 execute:true）后，pi-r4 真实模型 read_file 成功（"line two"）。
- 结论（复核后更正）：这不是 Host 的权限缺陷，而是声明不符合契约。`docs/architecture/local-environment-contract.md` 的权限约定是"只有显式 execute=true 路径可执行"，其示例也把 `/lib`、`/lib64` 声明为 `execute:true`。Landlock 的 Execute 同时覆盖 execve 与库的 mmap(PROT_EXEC)，无法只放行加载。因此修复方式是把库目录声明为 `execute:true`（即上面已验证的端到端路径），契约文档已补充这一点；**不应**改为 `from_read`，否则 `execute:false` 将失去意义。
- 仍可改进：EACCES 只表现为退出码 125 加 stderr，错误信息没有指出"哪个路径缺 execute"。该诊断改进尚未实现。

### B. namespace 后端命令执行未见声明的依赖路径（待查，原因未证实）

> 以下“推断”只来自 exit 127 与被截断的 stderr，没有 guest 内的挂载清单作证据，不能当作结论。

- 现象：codex-r3 换 `resource.process_namespace_limits`（filesystem_mode=workspace_write，cpu/address_space 限额）后，plan/apply 通过、审批通过、resume 恢复，命令进入会话后端但失败：`host is unavailable: process session: channel closed`。
- 会话记录（`kernel/loader/process-sessions/<id>.json`）：`state=exited, exit_code=127`，stderr（字节解码）= `supervised command exec failed: No such file or directory (`。
- 已排除：argv 绝对路径（/usr/bin/echo）同样 ENOENT；非 shell 内建问题。
- 推断：namespace guest 未绑定 `resource.process_local` 声明的依赖/程序路径（/usr/bin 等），或需要额外的目录供给方式；`workspace_write` 只放开业务目录写权限，但读环境未含运行时依赖。
- 建议：guest 绑定声明的 local_paths（只读+按 execute 标记授权），或文档明确 namespace 后端的依赖供给方式。

### C. 其他

- `module.bind` 对包导入内部模块（如 `cmd` 包内的 `command`）不可用，必须用 `agent.module.use ... replace_import` 重绑端口——文档可补一句。
- 已删除但仍声明的模块（如遗留 cgroup 资源）会继续参与组合校验并阻断 plan——`module.remove` 可用，但错误信息只给模块 id，建议附"未被引用可移除"的提示。

## 复验覆盖

| 项 | 结果 |
|---|---|
| 契约/操作/工具数（0.6 / 97 / 95） | ✅ |
| 新工厂注册（process_namespace_limits、tool.agent_tasks、tool.compose、policy.tool_rules） | ✅ |
| K2b stderr 回传 | ✅ 真实 run 证据 |
| 125 根因定位 + execute:true 修复路径端到端 | ✅ |
| K1 无 cgroup 组合：组合/审批/恢复链路 | ✅ |
| K1 无 cgroup 组合：namespace guest 依赖可见性 | ❌ 未通过，原因待查（见 B） |
| 审批两段式（decide + control resume） | ✅ |
| 报告纠偏（K4/K5/K9/K10 原分类） | 接受文档意见：外部包表达与既有原语关系已说明 |
