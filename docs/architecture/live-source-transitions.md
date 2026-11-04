# 运行中来源与上下文策略更新

本阶段将 `context_sources`、`context_policies` 和 `tool_sources` 接入现有 `update_modules`。配置仍由统一声明、Loader 和原 Worker 装载。适用根 Agent 已确认的安全停驻点；未完成模型、工具、Hook、输入、Recipe 或压缩计划须先在原版本完成或对账，不丢弃待处理工作以制造可更新边界。预算耗尽后持有待处理工作的专用恢复边界仍只接受原独占预算更新。

```mermaid
flowchart LR
  A[发布目标声明] --> B[确认原运行停驻]
  B --> C[校验选择范围与共享保护依赖]
  C --> D[原租约及检查点 CAS]
  D --> E[版本与命令回执原子提交]
  E --> F[原 Worker 恢复原运行]
  F --> G[装载新来源及上下文策略]
  G --> H[取得新的动态工具视图后继续]
```

| 决策 | 行为与原因 |
|---|---|
| 更新选择 | `ModuleUpdate` 增加三个默认 false、false 时省略的布尔字段；未选择的列表及其传递依赖继续保护 |
| 持久版本 | `LiveModuleState` 累积三个选择；任一已选择时使用 `nofy.live/v5`，原 v1–v4 未选择编码保持 |
| 上下文来源 | 替换有效 Agent 的来源及对应 spec；保留会话消息、输入捕获、预算、回执和控制序列，不在接纳事务调用来源 |
| 上下文策略 | 替换有效策略集合；保留 completed、sequence；pending 不得跨版本替换。原基线依赖闭包相同时沿用原身份，其余按完整策略闭包生成内容身份，避免只改依赖仍复用旧完成标记 |
| 动态工具来源 | 显式选择后仅清除已退休的 `tool_revision`，更新前原值保存在 before 检查点；原 Worker 先获取新快照并验证重名/恢复身份，再派发新工作 |
| 静态目录联动 | 同时选择动态来源时，不拿已退休的旧动态目录阻止合法替换；保留来源时仍校验原已接纳动态视图 |
| 回滚与恢复 | 回滚为新的显式版本，恢复使用目标冻结快照，选择通过后续更新和 session seed 延续；保留原和全部版本依赖用于 Loader 保留/卸载判断 |
| Memory 边界 | 检索来源可经本机制更新；持久 Memory 后端、自动捕获绑定和写入回执仍受保护，不能把检索更新等同于存储迁移 |

接口沿用 `POST /api/v1/actions`，`command.kind` 为 `update_modules`；`update.context_sources`、`update.context_policies`、`update.tool_sources` 各自授权目标集合及其专属依赖变化。共享给未选择能力、强制权限、治理、Checkpointer、Binding 或 Recipe 的依赖仍不可改写。显式空集合表达移除。其余命令字段、预期版本和停驻命令身份不变。

验收覆盖新增/替换/移除、同引用依赖更新、声明未选择拒绝、共享保护依赖拒绝、未知待处理工作保留、事务失败回退、接纳/提交后重启恢复、回滚、后续 Prompt 更新、会话交接和 Loader 依赖保留。Host 验收通过实际声明/API/Worker/HTTP 模型及工具传输运行，不依赖新增 Rust 手工注册业务能力。外部真实模型、Memory 存储迁移、控制台与版本化参考预设属于后续整体验收。

当前落地范围：Runtime 三类更新选择与恢复已经通过 SDK 工厂验收；默认 Host 通过已有 `context.rules` 验证上下文源替换、移除和回滚。默认 Host 尚无动态 ToolSource 与通用 ContextPolicy 的外部装载工厂，此缺口继续保留，不能以 SDK 工厂注册测试宣称默认平台已交付这两类外部模块。Memory 检索资源可由现有来源契约表达，自动捕获与持久写入迁移不在本阶段范围。
