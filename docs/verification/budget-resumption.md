# L3b5：预算暂停后的原位继续执行验收

后续L3b6已验收子Agent/原生Skill、收尾Hook、原恢复身份匹配及相关硬退出；详见[组合恢复验收](budget-composition-resumption.md)。下文为L3b5阶段事实和当时开放项。

已完成业务尚未结束、持久结果为 BudgetExceeded 的根 Agent 在原检查点停驻、调整同资源额度并继续执行。未派发的模型与工具保留原操作身份；已经 claim 的未知工具效果仍保持待对账。使用原发布、Loader、actions、根租约和 Worker，无新主循环、数据库表或依赖。

## 变更范围与证据

生产变更仅限 Runtime 的 parking.rs、transition.rs、transition/history.rs 和 transition/compatibility.rs。ParkReceipt 增加默认 false 且省略的 budget_suspended；它只证明原根已经在预算边界停止，不代表待处理效果已成功或尚未发生。停驻时要求 waiting、原持久 BudgetExceeded、结果状态与检查点完整一致；提交和应用时都只允许 budget_limits，除治理根配置外整个编译快照保持。其他能力与资源变更不进入此边界。

契约见[预算恢复设计](../architecture/budget-resumption.md)。两处既有测试注册新增两份 resumption.rs，分别覆盖 Runtime 与默认 Host。源码打包入口、普通依赖清单、Cargo/lock、预设与执行权限均未改动。

| 验收 | 实际结果 |
| --- | --- |
| 模型额度耗尽 | 已成功模型与工具结果保持，下一次 pending_model 原样跨更新保存；原 run/thread/submission 继续，最终模型共2次、工具一次 |
| 工具额度耗尽 | 已保存但尚未派发的 in_flight 与队列保持；调额后执行一次，不重新提交输入 |
| 更新最终回执丢失 | SQLite 触发器令回执写入失败，原账本、检查点和版本全部回滚；重开后精确重放一次提交 |
| 配置混改 | 预算暂停中拒绝同时选择工具、Hook、权限，拒绝混改模型/Prompt或普通 transition；拒绝发生于管理动作接纳前 |
| 期限耗尽的未知效果 | 工具实际追加文件后总期限耗尽；延长期限后仍返回 budget_uncertain，原 in_flight、预留和账本保持，文件没有第二次追加 |
| 默认 Host | 实际 native 工厂、发布/API/Worker、回环 HTTP/SSE、工具与Hook：模型和工具各一条同进程路径，另有接纳后exit91和提交后exit90两条硬退出路径，共4条实际流程 |
| Host 效果与权限 | 每条最终模型2次、业务工具1次、对应Hook1次，原输入/提交、原账本和创建时间不变；Read令牌提交更新为403，命令回执精确重放 |

Host 的 exhausted_budget_process 是条件子入口，不能把普通测试发现时的提前返回当成另一条硬退出实验。原模型网关没有新增请求；这些协议服务是确定性本地夹具，不宣称新的 Gemini 验收。

## 集中验证

| 检查 | 结果 |
| --- | --- |
| 全工作区 all-features 离线锁定编译 | 18包、105个测试入口；构建日志显示1m12s |
| 105个已编译测试入口 | 1580项功能通过，0失败；1项既有Memory release性能基准忽略 |
| Host | 228项通过；HTTP140项602.116秒，进程树11项201.293秒 |
| Runtime | 396项通过，含parking45项5.640秒及新增3项恢复验收 |
| 仓库外SDK消费 | 通过，1.665秒 |
| 严格全工作区文档 | RUSTDOCFLAGS=-D warnings，通过，15.358秒 |
| 实际全feature/build/dev依赖边界 | 通过，2.606秒；18个公共框架包，无旧宿主回流 |
| 格式 | 通过，1.204秒 |
| 文档示例 | 5项通过，27.058秒 |
| 冻结核对 | 631份源码/声明与109个执行制品在整套运行前后摘要相同；收尾随后只改文档与索引统计 |

每个入口使用 Cargo 对应包目录、默认测试并发和原 RUST_MIN_STACK=16777216，执行前完成编译与预检，执行期间没有修改源码、重编译或重索引。没有因超时增加期限，没有功能失败后重跑整套，也未运行新的 Python 或真实提供方验收。

首轮 Runtime 新3项单独通过1.225秒。首轮 Host 定向验收失败18.613秒：测试夹具停止 worker 后，仍向已进入 shutting_down 的同一 Host 发起发布，得到503。修正为重开 Host 后冻结尚未应用的命令；生产实现未改。最终完整矩阵一次通过，保留该失败日志。

最终汇总脚本在全部测试及摘要核对完成后退出1，原因是TTY子进程继承stdout额外输出一份“1 passed”小计，收集器错误要求每入口只有一份汇总。按最后一份外层“41 passed”汇总重新解析原日志后，18包1580项与5项文档示例成立；没有重跑测试，也没有把子进程小计再加一次。

## 影响、恢复与剩余范围

阶段前 GitNexus 上游影响：safe 为 HIGH/8（直接3，涉及4流程）；submit_transition 为 CRITICAL/33；transition_action 为 CRITICAL/43（直接1，涉及7流程）；ParkReceipt 为 LOW/5。首次按 parking.rs 文件名查询选中了同名测试文件，其 LOW 结果不用于生产范围判断，随后用准确safe符号、context及源码补证。Host API runs.rs:324调用submit_transition，管理动作分派到parking_action/transition_action，生产图的动态边和低置信度方法边不能视为无影响。编辑前已报告风险。

证据目录：/tmp/nofy-budget-resumption.a2uau25_，含全部构建、预检、105入口、文档、失败、冻结摘要、逐包汇总与影响分析。可恢复源码副本：/home/none/nofy-build-retired.jdnpc7/budget-resumption.zbzpz069；before.tar.gz 的 SHA256 为 cbe0022d465fc1367c873f47d4e5d222b6334cde46731a254bf62671b6532ff0。源码恢复不等于持久状态降级；已记录的新停驻事实和已用预算不能删除或退款，应由支持它们的版本完成显式配置回滚。

最终实际索引为700文件、13586节点、35906关系、300流程，MCP节点/文件查询与meta一致。沿用前阶段已验证的单worker进程导入规避GitNexus原生并发故障，不修改安装工具或工程；最终索引18.7秒成功，没有在测试期间索引。detect_changes(all)给出累计10772文件、2648映射符号、198流程、CRITICAL，已报告；它包含旧清理和既有开发变更，不能当成本阶段范围计数。阶段前后清单证明仅4份生产源及4份测试文件变化；新未跟踪文件也单独登记，不由git diff漏边替代验证。没有commit/push，AGENTS仅更新索引统计行，其规则正文保持。

本阶段保持开放：已完成业务但仍有终止工作、其他模块的待处理状态迁移、预算资源替换与账本拆合、Context/动态ToolSource/Memory、记忆职责审核、新控制台与预算用量管理视图、多套逐版本参考Agent预设、CI/发布、Memory release性能及未知清理错误。子控制器等保留的进度仍需对应行为证据，不能仅由根模型/工具的本次成功推断全部组合已验收。整体目标仍在进行中。
