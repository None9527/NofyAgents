# 预算暂停后的原位继续执行（L3b5）

后续L3b6扩展到子Agent/原生Skill和模型已完成但收尾Hook仍pending的状态，并在原Hook意图中保存恢复身份，避免由后来增加的账本追认旧未知效果。见[组合恢复设计](budget-composition-resumption.md)与[实际验收](../verification/budget-composition-resumption.md)。下文“业务尚未完成”等限制保留L3b5阶段范围。

额度耗尽时，检查点可能已保存下一次模型请求、工具意图或控制器进度。继续执行必须保留这些身份及原账本；删除待处理状态、重新提交输入或另开空账本均不构成恢复。

```mermaid
flowchart LR
    Halt[持久 BudgetExceeded 与原检查点] --> Fence[原根租约核对状态与归属]
    Fence --> Park[标记 budget_suspended 的停驻回执]
    Park --> Check[只允许同资源预算配置变化]
    Check --> Commit[原账本额度与版本原子更新]
    Commit --> Release[显式 Unpark 与 Resume]
    Release --> Journal[原操作身份与回执继续判定派发或对账]
```

| 决定 | 约束 |
| --- | --- |
| 新边界 | 仅停止且等待中的根执行，其持久结果必须是 BudgetExceeded，结果状态与检查点逐字节语义相同，且业务尚未完成。运行中的未知效果不能据此确认停驻。 |
| 回执 | ParkReceipt 增加默认 false 且省略的 budget_suspended；原有无待处理工作边界编码保持。回执继续绑定检查点 revision/digest 与原提交身份。 |
| 可更新内容 | 此边界只接受明确选择 budget_limits 的命令；除原 governance 根配置外，整个 CompilationSnapshot 保持相同。模型、Prompt、工具、Hook、权限、Context、输入和其他定义不得混改。 |
| 原子性 | 复用已有异步验证、原根围栏、savepoint、账本迁移、版本和最终管理回执事务；未提交的更新不得部分生效。 |
| 状态与效果 | 保持整个 RunState、待处理 operation/call 身份、预留、用量、回执和未知意图。增加额度仅改变许可，不能把已 claim 或结果未知的操作认定为未执行。 |
| 恢复 | 显式 Unpark 后以原 run/thread/submission 继续；成功回执重放，未派发工作依原身份执行，未知效果仍需已有 reconciliation。重启使用同一路径。 |

公开命令沿用 Park → UpdateModules（仅 budget_limits=true）→ Unpark → Resume。无需新模型主循环、预算后端、依赖安装器或包体校验。资源替换、账本拆合及其他能力的待处理状态迁移保持开放。

新增回执字段示例：

```json
{"checkpoint_revision":7,"checkpoint_digest":"<原检查点摘要>","parked_at_ms":1000,"budget_suspended":true}
```

budget_suspended缺省false并省略，既有无待处理工作回执编码保持。它不接受客户端指定，只由原根租约内确认产生；原Park状态、身份、revision/digest仍完整参与验证。子控制器及业务完成后的终止工作需要各自行为证据，不能由本阶段根模型/工具用例推定全部组合成立。实现与完整回归见[验收记录](../verification/budget-resumption.md)。
