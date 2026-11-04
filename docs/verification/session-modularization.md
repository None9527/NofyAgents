# Session 模块化实施与验收

日期：2026-11-04。声明、注册表、Loader、持久会话事务和 HTTP 已实施；CLI/MCP 的跨入口验收另见[开发入口记录](agent-development-cli-mcp.md)。前端已恢复到本轮开始前的文件，页面不属于本次交付。

内核新增 SessionPolicy 与 Agent v2 插槽，提供 rules/programmed 两种工厂和纯 JSON ABI。会话实例、接纳凭据、命令回执复用原 SQLite 运行库；start 的首根 Job、绑定、策略意图和应用回执同事务提交。直接 Run/NextTurn 仍经过同一接纳检查；生命周期与策略切换限定静止边界，原预算和成功效果不重建。

| 检查 | 实际结果 |
|---|---|
| Runtime all-features 首轮 | 集成目标全部通过，含新增 5 项策略行为；lib 有 6 项保留扫描相关失败 |
| Executors all-features | 34 项通过，包含禁止 ambient timestamp 的新增用例 |
| Host lib | 修正路由 plan 的同名导入后 86 项通过 |
| Host HTTP | 原 201 项通过；新增 3 项因保留扫描只接纳 Agent v1 而失败 |
| 保留扫描补验 | 增加新会话表的明确投影、冻结闭包验证和 Agent v2 门控后 8 项通过 |
| Session HTTP 补验 | 新增 3 项全部通过，覆盖规则/脚本装载、重开、原回执重放、拒绝不派发、生命周期与权限 |

失败记录保留于工作区外证据目录，精确计数及日志见[机器记录](session-modularization.json)。不把首轮说成全量全绿，也不重复运行未受修复影响的既有集成目标。

原生能力从 GET /api/v1/sessions/capabilities 发现，协议为 nofy.session-control/v1。实际实例是否已升级需读取该入口；构建成功不代表运行进程自动更新。本波使用受控协议夹具与真实 Loader/执行器，不是新的外部真实模型验收。所有在途更新、断电时刻和整个最终平台的完成度仍按各自记录判断。
