# 四参考 Agent 经 nofy MCP 复刻与缺口报告（2026-11-05）

目标：用 nofy 内核的入站 MCP 逐个复刻 deepseek-harness(dsh)、pi、codex、grok-build 四个参考 Agent，找内核缺失的底层能力，并区分「内核缺失」与「MCP/CLI 层缺失」。本报告全部结论基于本次会话的真实调用与源码证据，文件行号均经核对。

## 0. 方法与产物

- 参考仓库克隆至 `ref/`：deepseek-harness @ fcc0ad46 (0.2.2-rc.1)、pi @ 0c5b7ee、codex @ ba057e4、grok-build @ 2bdd1d6。
- MCP 通道：`nofy mcp serve --transport stdio`（77 个工具）+ 自驱 stdio JSON-RPC 客户端（`/tmp/nofy-repl/mcp.py`）。ZCode 插件桥不可用（见 M1），全程走 stdio MCP，符合「通过 MCP 复刻」。
- 模块仓库流：`repository.add`（managed）→ `module.publish` ×6 → `agent.create empty` → `agent.module.use / agent.module.add`（每 Agent 15–18 次增量挂载）→ `agent.plan` → `agent.agent.apply`（generation）→ `run.start`（真实模型）。
- 已发布包（repository `local`）：`workspace-files@0.1.0`（preset 六文件工具）、`workspace-files-js@0.1.0/0.1.1`（Node 自研同契约实现）、`workspace-runtime@0.1.0`、`model-connection@0.1.0`、`model-stack@0.1.0`、`workspace-command@0.1.0`。
- 复刻工程：pi-r3（files+skills）、pi-r4（Py+JS 双实现文件工具 + skills）、codex-r3（+整树命令探针）、dsh-r3（+web 探针）、grok-r3（files+web）；另有早期大声明工程 pi-replica/pi-r2/codex-r2/dsh-r2/grok-r2 留作迭代记录。
- 模型：`gemini-3.8-flash-high`（chat_completions，REAL_MODEL_KEY 凭据引用），全部 4 个复刻完成真实流式模型调用（usage/预算入账）。

## 1. 能力矩阵（参考 ↔ nofy 现状）

| 能力 | dsh | pi | codex | grok | nofy 现状 |
|---|---|---|---|---|---|
| 主循环+流式工具调用 | ✅ | ✅ | ✅ | ✅ | ✅（已验证） |
| 文件工具 | ✅ | ✅ | （走 exec） | ✅ | ✅（声明级；进程工具见 K2） |
| shell/exec | ✅ | ✅ | ✅ | ✅ | ❌ 本机（K1/K2） |
| 网络工具 | ✅ | ✅ | ✅(hosted) | ✅(hosted) | ✅ http_connected（已验证）；hosted ❌ |
| 审批/持久决策 | ✅ | （无，扩展实现） | ✅ | ✅ | ✅（approval+on_tools 已验证） |
| allow/deny/ask 规则 | ✅ | （扩展） | ✅(Starlark) | ✅(规则引擎) | ❌ 仅 allow 名单+审批（K7） |
| 沙箱模式/网络沙箱 | ✅ 三档 | （文档化） | ✅ 多平台 | ✅ Observe/Enforce | 部分（seccomp+目录授权；无网络沙箱/模式阶梯，K8） |
| 会话树/fork | ✅ | ✅ | ✅+side-thread | ✅+rewind | ❌ 线性会话（K3） |
| 排队 steer/followUp | ✅ | ✅ 双队列 | ✅ steer | ✅ 队列合并 | 部分：仅 queue\|reject（K9） |
| 自动压缩 | ✅ 压力引擎 | ✅ 三态 | ✅ 三阶段 | ✅ 三层 | 内部有实现、未声明化（K4） |
| 子代理工具 | ✅ 6 后端 | p2 ✅ | ✅ v1/v2 | ✅ | ❌ 无模型侧工具（K5） |
| 交互问询工具 | ✅ ask_user | ❌ | ✅ request_user_input | ✅ | ❌（K6） |
| 计划/待办工具 | ✅ todo/plan | ✅ todo(实验) | ✅ update_plan | ✅ todo/goal | ❌ 仅 runtime stage（K6） |
| hooks/事件 | ✅ waterfall | ✅ 40+ 事件 | ✅ 14 事件×4 handler | ✅ gate/rewrite | ✅ 26 事件+deny/pause/patch/stop（语义需映射） |
| MCP 客户端 | ✅ stdio+http | ✅ stdio/http/in-mem | ✅ 多传输+OAuth | ✅ stdio+http | 仅 http（K6 备注） |
| skills | ✅ | ✅ | ✅ | ✅ | ✅（context.skills/tool.skills_scoped 装配通过） |
| 模型协议 | 插件适配器 | 10 API×45 家 | 仅 Responses | 三协议 | Rhai 程序化协议（chat_completions/responses/messages 预设，已验证） |
| 声明化配置/版本 | ✅ bundle 栈 | settings.json | ✅ config.toml+profile | ✅ 多层 | ✅✅（模块包不可变版本+引用，本次全程验证） |

## 2. 内核缺失（需要新增内核能力/工厂——按阻断程度排序）

- **K1 命令执行供给缺失（最硬阻断）**：可执行目录环境强制 `tool.process_tree_artifact` + cgroup v2 委派根。本机实测：`apply` 阶段即拒——`invalid request: an explicit canonical cgroup v2 delegation root is required`（codex-r3/grok 早期复刻）。四个参考的 shell 都不要求 cgroup（Seatbelt/bwrap/Landlock 进程级）。**缺「无 cgroup 委派时的进程级命令执行」选项或委托服务供给路径**；没有它，四个 Agent 的 shell 全部无法复刻。
- **K2 进程工具在本机 100% exit 125 且现场丢失**：所有 `tool.process_artifact` 在真实 run 中 `process exited unsuccessfully (code Some(125))`（pi-r3/r4、grok-r3 一致复现）。归因进展：组件级完整复现（Landlock ABI 7 + seccomp + cache lease + 目录授权 + artifact 树 + Python/Node exec，真实 private_root/lease）**全部通过（exit 0、结果正确）**；host 派生的同一 worker 毫秒级死亡。定位被两个内核缺陷挡住：(a) executor 读取 stderr 后丢弃（`nofy-agent-executors/src/process.rs:224` 附近 `_stderr` 未使用），worker 的失败原因行（"required module isolation or runtime launch failed: …"）到不了工具结果；(b) `/proc` 扫描抓不到毫秒级进程。**需要先把 stderr 带入错误信封**，否则 host 派生上下文中的失败不可诊断。
- **K3 会话树/分支/fork**：参考方均有（pi JSONL 树+leaf 指针、codex fork/side-conversation、dsh fork seed、grok fork+rewind 点）。nofy 会话为线性 turn 流（close/reopen/archive/reconfigure），无 branch/fork/rewind 原语。
- **K4 上下文压缩未声明化**：`context.compaction` 工厂存在于代码但未注册进宿主注册表；无压力阈值/溢出/手动触发、策略选择、压缩占位等声明面。四家参考全部具备自动压缩。
- **K5 模型侧子代理工具**：内核有子运行/预算/恢复底座（max_child_calls、run.recovery(child)），但无 `spawn_agent/subagent/task` 这类模型可调用工具工厂；跨代理通信（mailbox/message-board）也没有模型可见入口。
- **K6 工具形态缺口**：交互问询（ask_user/request_user_input）、计划/待办（update_plan/todo_write，现为 runtime stage 非模型工具）、服务端 hosted 工具（web_search 透传）、PTY/交互式进程（dsh 终端族、codex write_stdin 续写）、stdio MCP 传输（仅 mcp_http）。
- **K7 权限表达力**：现仅 `policy.tool_scope`（allow 名单）+ `policy.on_tools`（送审批）+ `policy.approval`。缺 allow/deny/ask 规则、bash 命令拆分/前缀分析（grok bash_permission、codex execpolicy Starlark）、granular 审批开关（codex 五类）、「本次会话允许」记忆。
- **K8 沙箱模式/网络**：无 read-only/workspace-write 模式阶梯（目录授权可近似）、无网络沙箱与代理强制（codex network-proxy、grok egress-proxy）、无拒绝后升级重试编排（codex orchestrator escalation）。
- **K9 排队语义**：`session_policy.rules.admission.when_busy` 仅 `queue|reject`；缺 steering（打断注入）与 followUp（续跑注入）双队列及 all/one-at-a-time 模式。
- **K10 重试/挽救策略未声明化**：协议层有 retryable 标记 + `run.control RetryModel`，但无 per-provider 自动重试声明（退避表、Retry-After、输出截断 salvage、剥图重试、doom-loop 检测——grok 四层/dsh 指数退避/codex 流式重试）。

## 3. MCP/CLI 层缺失（内核有、通道坏/缺——本次实证）

- **M1 ZCode 插件桥带参调用全丢**：本会话内 66 个带参 MCP 工具一律 `input does not match <op> at ""`（入参为空），无参工具正常；同一内核经 stdio MCP 带参调用完全正常。插件与内核契约（77 工具、module_ref 字符串等新形态）未同步。
- **M2 无删除/清理入口**：project、模块包版本、agent 均无删除操作（DELETE 仅 credentials/drafts/runtime-sources）。实验污染（pi-replica rev20 等）无法清理，只能改名重建。
- **M3 `agent.create` 同时携带 `source`+`target(project)` 时**，适配器 `source()` 因 input.source 短路返回 `project=None`，revision 校验必然失败（`nofy-agent-client/src/projects.rs` source 分支）。仅传 target 或仅传 source 才可用。
- **M4 `module.set` 的 JSON Pointer 只作用于渲染后 config，null 是置值不是删除**；多余键无法移除，只能 `""` 整体替换——易踩坑（本次 dir-create/config.dependencies 事故）。
- **M5 `module_ref` 形态不一致**：MCP schema 描述为对象（ModuleRef{id,version}），实现为字符串（`alias.export` 或 `nofy://releases/...`）；旧 CLI 对新操作 schema 返回 null 而非明确错误。
- **M6 `agent.plan` 的 AgentRead target 校验错误信息笼统**（`at /target` 不指字段）。
- **M7 无工具失败现场**：run 事件 tool_completed 仅含 error 字符串，stderr 丢失（同 K2b，属内核-通道联合观测面缺口）。

## 4. 已验证可复刻（证据）

1. **模块仓库全流程**（MCP）：`repository.add` → `module.publish`×6（含参数/端口/导出/`$file`/`$json`/`$input` 全部表达式形态）→ `agent.create empty`（missing_slots 引导）→ `agent.module.use`（bindings 连接他包导出 `conn.main`、`replace_import` 升级 0.1.0→0.1.1）→ `agent.module.add`（module_ref 挂载额外导出、inline 模块、slot 挂载 model/prompt/tool_packs/policies/governance/session_policy/bindings/context_sources）→ plan → apply（generation 递增）。
2. **真实模型闭环**：pi-r3/r4、codex-r3（apply 前）、dsh-r3、grok-r3 全部完成真实流式调用；usage/token 记账、预算 limits、会话策略前缀命名生效。
3. **真实效果工具**：`tool.http_connected`（web_fetch）端到端成功——真实 HTTPS 请求、错误正确回传模型（dsh-r3 run Completed，模型如实报告探测页非 JSON）。
4. **双语言工具**：同一 manifest 契约的 Python（preset）与 Node（自研 `files-js.mjs`，含路径逃逸/符号链接/UTF-8 边界防护）实现均通过隔离 worker 组件级验证（exit 0 + 正确 JSON 信封）——**内核不限定工具实现语言得到实证**。
5. **声明化策略栈**：session_policy.rules、budget+governance、policy.tool_scope、policy.on_tools（写审批）、context.rules、prompt 按参考差异分别装配成功。
6. **内核拒绝路径证据**：cgroup 委派缺失的明确错误（K1）；process 工具 125 复现（K2）。

## 5. 环境（非内核、非 MCP——单独列出）

- WSL2 内核 6.18：cgroup 根不可写（无 systemd 委派）；模型端点（www.none.xz.cn:3002）出现两次瞬时 transport 失败后自愈；ZCode 沙箱内 nohup 守护的监听器会静默丢失（后台任务方式稳定）；这些不属于内核缺口，但影响复刻环境搭建。
- 早期出现的 `local dependency paths must not overlap`（merged-/usr 规范化）与 `executable directory requires tool.process_tree_artifact` 属内核契约正确执行，不是缺陷。

## 6. 结论（下一步优先级建议）

1. 修 K2b（executor 回传 worker stderr）——一行级改动，解锁 K2 归因。
2. 供 K1（无委派环境的进程级命令执行，或明示委托服务供给）——四家 shell 复刻的前置。
3. 补 K9/K4（排队语义与压缩声明化）——日常可用性分水岭。
4. K7/K8（权限规则与沙箱阶梯）——对齐 codex/grok 的安全面。
5. K3/K5（会话树与子代理工具）——对齐 pi/codex 的高阶行为面。
6. MCP 层：M1 插件同步、M2 清理入口、M3–M5 契约一致性。
