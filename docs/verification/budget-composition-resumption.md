# L3b6：预算暂停的子运行与收尾恢复验收

已补齐子Agent和原生Skill执行中耗尽额度，以及模型已完成但before_stop/turn_done仍待处理时的原位恢复。只调整同资源预算，原run/thread、输入、检查点、用量、预留和成功效果保持。没有新主循环、数据库表、依赖或源码打包门槛；整体平台仍在实施。

## 实现与实际失效

原停驻直接拒绝complete=true，即使仍有收尾工作。新增用例用默认Host让第一个Hook成功、第二个因额度不足停下，原实现20.835秒后仍是Park requested、job waiting、BudgetExceeded。现只放行持久预算暂停且仍有pending work的已完成模型状态；完整结束的运行不能重新打开，其他停驻/提交/检查点/版本/租约检查保持。

执行器Hook的原始意图先于预算准入写入；未拿到额度也可能留下外层意图。初版以当前持久预算允许重入，审查后发现还缺原始依据。有效SDK反向复现使用独立Hook日志、真实SQLite预算与回环HTTP：原调用未受预算约束、完成回执写入失败，随后加入SQLite预算，初版返回Continue并实际发送2次HTTP。修复后返回uncertain_hook，HTTP保持1次。相同逻辑Profile identity指向另一个SQLite文件的第二个反向用例，也在派发前拒绝，效果仍为1次。

HookHandler新增默认resume_identity/can_resume，执行器以当前非空、全部持久且有非空存储身份的账本集合生成恢复身份。按原scope与物理存储排序后摘要为budget.receipts/v1，不含可变额度、重试与租约轮次，不把物理路径暴露为证明值。私有Hook Saved.resume在首次意图写入，完成时保留原值，重入前精确匹配。原controller已有静态契约者继续精确核对；没有原恢复证明的普通未知记录不会因后来增加账本而提升为可重试。未知已claim仍由原预算边界拒绝重复派发。

生产范围为Runtime的parking、transition、governance、hooks、hooks/emission、hooks/journal六份源码，以及Executors的hooks.rs。三份既有测试文件和五份新组合测试文件，没有Host生产变更。完整契约与文件职责见[设计](../architecture/budget-composition-resumption.md)及各包文件说明。

## 行为证据

| 用例 | 实际结果 |
| --- | --- |
| Runtime子Agent | 子检查点pending_model、原child/run/thread与父预留保持；调额后父/子模型各2次、工具1次、child_calls总1，预留最终归零 |
| 原生Skill | 真实发布与Loader、Worker、模型HTTP/SSE、工具和Host重开；原子检查点与已成功工具保持，最终父/子各2请求、工具1次、原账本child_calls为1 |
| 两种收尾事件 | before_stop和turn_done均为第一个Hook已成功、第二个未派发；调额不改完整RunState/输出，最终模型1次、两个Hook各1次 |
| 更新硬退出 | before_stop接纳后exit88、turn_done提交后exit87、子Agent接纳/提交后各一条；重开沿原发布/管理/Worker继续，检查点、预留、原提交及原账本保持，精确重放不增加效果 |
| 收尾未知HTTP | 已产生第二个HTTP效果、响应和完成回执未落盘时exit88；原两秒租约到期后恢复为budget_uncertain，原模型、两个HTTP均各1次，used/reserved/operation_count保持 |
| 无持久账本 | 无预算与仅内存预算两种实际执行器用例，丢失完成回执后均uncertain_hook，不重复HTTP |
| 原证明缺失/错存储 | 上述两条有效SDK反向用例：后来增加账本不追认旧意图；相同逻辑Profile换物理存储不重发 |

Host新增8个测试函数中两个是条件子入口，不能当作额外硬退出实验。实际包括7条正常管理/恢复流程、1条未知HTTP硬退出、2条公开Hook API反向流程。未知HTTP的首次启动使用原RunSupervisor显式2秒租约，其余恢复走默认Host Worker。此阶段没有新的真实提供方请求；HTTP/SSE是确定性本地夹具，不宣称新增Gemini验收。

## 集中验证

| 检查 | 结果 |
| --- | --- |
| all-features离线锁定编译 | 18包、105个测试入口，最终构建日志1m13s |
| 无默认feature全目标构建 | 通过，最终日志14.67秒 |
| SQLite单独feature全目标构建 | 通过，16.503秒 |
| 仓库外SDK | 通过，12.982秒 |
| 严格全工作区文档 | RUSTDOCFLAGS=-D warnings，通过，18.232秒 |
| 实际全feature/build/dev依赖边界 | 通过，2.647秒；18个公共框架包，无旧宿主回流 |
| 格式 | 通过，1.208秒 |
| 完整105个预编译测试入口 | 1590项功能通过，0失败；Memory既有release性能基准1项忽略 |
| Host / Runtime / Executors | 236 / 397 / 19项通过；Host HTTP148项603.554秒，进程树11项204.649秒；Runtime parking46项5.570秒 |
| 文档示例 | 5项通过，27.655秒 |
| 冻结核对 | 636份源码/声明、109个执行制品在完整执行前后摘要全部一致 |

每个入口使用对应Cargo包目录、默认并发和原RUST_MIN_STACK=16777216；全套前先完成构建与预检，运行期间无源码修改、重编译或重索引。收集器只计最末外层TTY汇总，不重复加入子进程小计。最终源码收尾只登记文档及索引统计。

先前定向记录分别为Runtime子调用0.275秒、Executors反向0.116秒、Host最初两项16.270秒、四项崩溃58.718秒。加入原始证明后，最终Host组合8项59.219秒通过，636份源摘要不变。首轮Runtime测试误用私有checkpoint_key导致编译失败，改用ChildRunRecord公开checkpoint_key，没有放宽生产接口。SDK反向夹具最初被SQLite声明归属保护拒绝，随后改用公开API支持的独立Hook日志和真实SQLite预算/HTTP；没有绕过或修改该保护。

初版完整回归在原始恢复依据审查时主动中止，属于未完成运行；仅向已核实的验证进程组发送SIGINT，确认原句柄exit130后才改源码，全部输出保存于attempt-1。有效重复HTTP复现及修复后的通过输出均保留。最终完整回归为后续独立冻结的一次全量通过，不能把中止运行计为第二次全量成功。

## 影响、恢复与剩余范围

编辑前上游分析：safe为HIGH/8，transition_action为CRITICAL/43，submit_transition为CRITICAL/35，HookHandler为HIGH/102（直接24），ExecutorHandler为LOW/3。已提前报告风险。HookJournal同名查询落到Impl而返回0，不能据此推断无风险；准确begin context指向HookBus.emit，实际检查begin/finish/reconcile、静态controller与执行器dispatch调用，范围仍为原七份生产源码。新增公共恢复契约和日志证明同步纳入分析与反向验收。

最终GitNexus CLI出现原生`double free or corruption`，exit134；进程内单线程尝试又在Schema断言和File COPY处失败，exit1，不能记作索引成功。两次现场分别保留在恢复目录的`index-after-failure`和`index-failed-serial`。已从首轮CLI失败后经MCP读取确认的图谱副本恢复，数据库SHA256为`83e06490d45b47f893d9a16d05b017ef0303370c3a88ec2378d281c6b1bfdb60`；恢复时间与原索引时间分别记录，不冒充新一次成功分析。MCP实际查询确认13652节点、708文件，源码符号与调用关系可读；元数据36179关系、300流程。未改已通过测试的源码或第三方工具安装。

最终detect_changes(all)映射累计10775文件、2686符号、198流程，风险CRITICAL；这是旧源码移出与长期未提交开发合并后的工作树范围，不是本阶段15份代码文件的新增影响，也未覆盖全部未跟踪文件。实际阶段范围另以7份生产、8份测试的明确清单、源码摘要、冻结验证和行为证据约束。无commit/push。

证据：/tmp/nofy-budget-composition.i5ilpmem。恢复副本：/home/none/nofy-build-retired.jdnpc7/budget-composition.xdx2bbe8；before.tar.gz SHA256为393b1480ee24252eebb25cf57b0c71f5ad8e9e2fc2483338c64c57d93b39b6f5。不得将源码回退当成持久事实降级或删除预算/回执；已写的原证明和未知意图应由支持其语义的版本保留和处理。

下一优先核对暂停期间新增输入与收尾Hook的先后顺序、事件身份，以及未知Hook的管理恢复入口；尚不能由本轮原输入恢复推断并发新输入和所有控制器状态已完整验收。随后继续Context/动态ToolSource/Memory、预算资源替换/账本拆合、其他权限状态、记忆职责、新控制台及预算视图、多套逐版本参考预设、CI/发布、Memory release性能及未知清理错误。源码包与普通依赖清单、外部依赖用户安装边界保持，整体目标active，无commit/push。
