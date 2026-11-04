# 运行中预算额度迁移（L3b4）

后续L3b5已完成[预算暂停后的待派发工作恢复](budget-resumption.md)，以budget_suspended回执限制为仅预算变化并保留完整进度；未知效果仍待对账。下文“其他边界”和下一优先项为L3b4阶段范围，最新证据见[预算恢复验收](../verification/budget-resumption.md)。

本阶段将同一已确认停驻的根 Agent 的预算配置迁移到新发布，继续使用原逻辑账本，不把新 GovernanceProfile 的内容身份当作新开户许可。目标为原声明、Loader、管理 Worker 与会话交接的同一路径；完整权限、Context、ToolSource、Memory及其他状态边界仍分别实施。

```mermaid
flowchart LR
    Publication[目标声明中的治理配置] --> Resolve[异步解析原目标预算配置及资源]
    Current[原有效版本与账本绑定] --> Resolve
    Resolve --> Proposal[持久不可变迁移计划]
    Proposal --> Fence[确认停驻与原根租约]
    Fence --> Transaction[额度迁移+版本+回执同一事务]
    Transaction --> Runtime[新配置使用原账本与绝对时间基准]
    Runtime --> Child[子调用继承完整身份映射]
    Transaction --> Session[下一轮继承相同预算账本]
```

| 决定 | 语义 |
| --- | --- |
| 选择 | `update_modules.update.budget_limits=true`，沿用同系统精确发布、park与expected_revision；未选择不得改变治理配置 |
| 范围 | 治理引用集合和工厂/依赖保持，允许配置映射得到新的limits/retry；实际源目标Profile必须属于相同已安装资源与运行SQLite后端，不按产品名或具体配置字段分派 |
| 不可变项 | 预算资源逻辑身份、宿主安装上限、物理存储权威、原执行/输入/审批/效果和未选择能力保持；受其他未选择能力保护的共享依赖不能改写 |
| 绑定 | 每个治理引用记录当前Profile身份、原ledger身份、资源身份及完整历史Profile别名；不合并或拆分不同原账本 |
| 原子性 | 计划在事务外解析Profile；原根围栏内重验有效版本/停驻/检查点、原额度及账本归属，再同时写原账本、迁移版本与管理回执 |
| 用量 | 保留used、reserved、active、operation_count、全部操作回执与历史阻断事实；新额度可解除已有额度型阻断，usage_bound等完整性阻断保持，不退款、不重新派发成功调用 |
| 缩减 | 可以将新上限降至已有用量以下，事实不改写，后续新派发受新限额阻断；已派发意图仍可对账和结算 |
| 待派发预留 | 已有成功回执继续重放；已claim的意图不重新派发；尚未claim的预留在派发时重新检查新额度、深度、并发及期限 |
| 期限 | 以原created_at_ms计算显式新duration；其他维度变化不重设期限，回拨时钟不延长预算 |
| 子调用 | 继承原账本、最新规格及完整身份映射；旧或中间版本Profile不得另外开空账本，也不得用陈旧配置覆盖继承规格 |
| 后续轮次 | 原会话种子带入完整预算绑定，仍使用会话原budget_root_run_id；之后仅改模型/Prompt不丢失预算迁移 |
| 版本 | 新命令的budget_limits默认为false且省略，绑定列表缺省空且省略；使用绑定的有效版本为nofy.live/v4，既有v1/v2/v3编码保持。引用扫描同步识别v4 |
| 其他边界 | 本阶段沿用可证明无待处理业务的停驻边界；额度耗尽后的未派发工作、其他未完成效果及资源替换需要相应显式边界，不能据此宣称全部热更新已完成 |

命令沿原actions API提交：

```json
{
  "command_id": "budget-update-1",
  "run_id": "run-1",
  "command": {
    "kind": "update_modules",
    "park_command_id": "park-1",
    "expected_revision": 0,
    "release": "<目标发布摘要>",
    "program": "chat",
    "update": {"budget_limits": true}
  }
}
```

`LiveModuleState`增加省略空值的预算绑定列表；每项包含治理reference、当前profile_identity、ledger_identity、resource_identity和profile_aliases。私有Proposal增加省略空值的预算迁移计划，关联原规格与目标规格。计划及恢复证明只由原受管执行路径产生，模型或普通执行绑定不能注入私有账本别名。

实现职责：governance负责Profile与继承映射、账本算术及SQLite原子修改；transition/budgets负责已发布配置到持久迁移计划、版本重建及恢复；sessions负责只读核对原会话账本归属；retention只识别并保留新协议引用。没有新的BudgetStore后端、执行循环、依赖安装器或产品分支。

验收须覆盖同进程和硬退出恢复、预算增加/缩减、原预留及已claim/成功回执、期限与时钟、事务回滚/精确重放、非法资源或共享依赖、子调用旧/中间配置及跨轮次继续使用原账本；使用真实SQLite和默认Host HTTP，不以SDK可构造或单纯序列化代替。

同一资源与相同Profile内容在原账本模型中共享身份，历史别名延续该共享关系；独立预算约束应使用独立的预算资源引用。将既有共享账本拆成独立账本需要显式迁移，不能因改配置便重复开户或复制预算余额。

本阶段实现及完整回归已通过，实际范围、测试调用修正、三个真实Host流程和剩余边界见[验收报告](../verification/live-budget-transitions.md)。额度耗尽后的待派发工作边界仍是下一优先项，不将安全停驻的迁移作为全部预算状态更新的完成证明。
