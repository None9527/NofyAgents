# Session 模块化设计检查

日期：2026-11-04。契约版本 0.2-design，状态：通过。本次交付为[模块化方案](../architecture/session-modularization.md)、[会话手册](../manual/sessions.md)及同步的 CLI/MCP/Schema，未实现新增 SessionPolicy、工厂、插槽、生命周期接口或适配器。

## 集中检查

| 范围 | 结果 |
|---|---|
| 操作目录 | 68 个拟议操作、66 个拟议 MCP 工具，其中 Session 17 项；命名、唯一性和输入/结果引用一致 |
| Schema | Draft 2020-12 元校验、本地引用和 89 个定义检查；40 个输入/结果正反例 |
| 文档示例 | 9 个 JSON、4 个 TOML 解析；26 个 Shell 块只检查语法；5 个 Session 示例另按专用 Schema 核对 |
| 路由边界 | 85 个现有方法/路径对保持原索引；11 个新增会话路由仅记入 planned_routes |
| 原生数据 | 原轮次请求字段按源码核对；两项 JSON 包裹/重复键检查；未执行拟议 CLI、MCP 或原生请求 |
| 源码范围 | 与本阶段开始的 617 份 Rust 源码比较，无变更；未运行 Rust 回归或模型请求 |

输入/结果正反例覆盖规则路由、同线程并发拒绝、参数/依赖边界、Session 插槽及工具插槽区分、创建预期不存在、会话 CAS、精确大整数游标、元数据替换、策略切换源证明、禁止顺带替换存储，以及专用命令结果。

本次修改整块收齐后集中检查；原 0.1-design 的[手册验证](agent-development-handbook.md)保留为历史证据，没有把其原生计算例 validate 当作 SessionPolicy 验收。JSON Schema 的 NativeJson 注解不代替真实 DTO 解析和领域校验，示例中的发布身份仍须由实际内核解析。

## 风险与后续验收

GitNexus impact 对 create_session、submit_session_turn、AgentDefinition、bind_session 返回 LOW/0，但 context 查得前两者分别有 14/7 个调用，bind_session 被 begin_run 调用。此图遍历结果不足以判断没有依赖；未来实现按 HIGH 公共契约风险控制，在编辑前继续补充编译、快照/种子及运行库存储入口分析。

首根原子提交、直接 Run/NextTurn 的统一策略校验、静止边界切换、持久回执与精确重放、预算/状态连续、真实 Codex 互通均仍需[实际行为验收](../architecture/session-modularization.md)。本次没有发布、激活、重启服务或真实模型调用。

机器结果见[JSON 记录](session-modularization-design.json)。原始分析、修改前副本、检查脚本和归档保存在本机临时目录 `/tmp/nofy-session-design.op7fc__p`；仓库内记录保存结果与未实现边界。
