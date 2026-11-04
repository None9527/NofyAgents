# 有界组合身份与子组预算指纹

L3b9锁定方案：合法的声明组合不能因为身份字符串重复嵌套而失去执行能力。源码打包仍交付源码和普通依赖清单，不探测依赖环境、不设置包体配额；这里处理运行时身份和原预算记录。

```mermaid
flowchart LR
    Definition[冻结声明与身份方案] --> Compile[统一Agent / Tool / Workflow / Event编译]
    Compile --> Fold[每次追加能力后折叠版本化摘要]
    Fold --> Child[原子运行地址与原调用]
    Child --> Fingerprint[composition与input的版本化子组摘要]
    Fingerprint --> Reserve[原预算reserve / claim]
    Reserve --> Execute[原Loader / Runtime]
    Execute --> Receipt[原检查点与原预算回执]
    Receipt --> Resume[同一冻结声明恢复]
```

链路C → A → X：先锁定表示和状态语义，再实施原失败组合，最后核对请求、地址、预算、已成功效果及跨进程恢复。里程碑为M1身份折叠、M2原预留核对、M3原生组合和集中回归。

| 决策 | 行为 |
| --- | --- |
| HashedV2 | 新增显式的框架自身身份格式；初始编译及Hook、Policy、Binding、Governance、ContextPolicy、Recipe、Tool调用、Workflow工具、Event追加后都保持摘要 |
| 既有自身格式 | Legacy / HashedV1的声明、组合身份和地址语义保持；不以更换原运行的身份方案恢复状态，不引入旧产品宿主或代码适配层 |
| 子组指纹 | 所有新子组使用child-group/v1摘要，绑定原composition及input；不把完整声明或用户输入重复塞进账本指纹，不放宽账本边界 |
| 原预留 | 仅原Child活动、child_calls=1、其他字段完整一致且摘要对应原二字符串元组时，接受同一请求的新表示；继续使用原记录发行的reservation，claim/settle仍精确核对原记录 |
| 已有效果 | 原receipt、dispatched、used/reserved、operation_id、epoch和deadline保持；新的表示不能将已claim未知变成可重新派发，也不能覆盖已知结果 |
| 首个预设 | 编程预设显式选择hashed_v2；普通源码归档及依赖由用户安装的交付方式保持 |
| 版本边界 | 版本选择进入冻结快照；运行中不能通过更换scope_identity改变检查点或子运行地址。新格式不声称可被未支持它的旧内核读取 |

接口沿用Settings.scope_identity与ToolRuntimeDefinition.scope_identity，新增字符串值hashed_v2。组合摘要使用composition-hash-v2前缀，子运行地址使用child-hash-v2前缀；其他执行接口、Checkpoint表及预算表不新增字段。子组摘要格式仅用于原内核的Child预算请求，不为其他活动开放模糊匹配。

编译身份由各对象的冻结声明选择；运行地址方案则按原规则由根选择并向后代继承。未声明编译方案的组件不在运行时被重编译或改写身份；显式选择V2的组件在每次能力追加后保持摘要。混合声明必须保留在深层恢复用例中，不能将两类选择混为一谈。

必须验证大Hook定义和长prompt的原失败Agent后代、追加每类能力后的固定身份、快照重建、深层父子范围、原请求新表示的已claim/已完成/未claim状态、混合预算floor、改变其他字段及错摘要拒绝、真实退出后的原效果一次和原账本保持。验收证据完成前不声称整体平台完成。

新增实现与测试职责登记到Runtime、Host和预设的文件说明；最终范围、验证和回退材料另存本阶段验收。
