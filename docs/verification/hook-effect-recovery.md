# 原生 Hook 效果与管理恢复验收

2026-11-04，L3b8。验收范围为原生执行型Hook的未知工具效果、已知决策及其原预算结算；整体平台目标仍active。打包器、普通依赖清单及预设未改，外部依赖仍由用户安装，不新增环境、版本或包体配额门槛。

## 交付与边界

原Hook日志先建立，普通工具通过原Schema和权限后才建立原生效果意图。Supervisor在原根租约下安装私有NativeControl；RunServices保留其原始权限，ContextBinding清空扩展不能将其移除。意图记录原事件摘要、订阅/总线、实际日志键、源检查点指纹、工具指纹、原账本scope及原恢复依据，复用Checkpoint表，无新表或外部依赖。

GET `/api/v1/runs/{id}/recovery/hooks`使用Read权限及有界分页；POST `/api/v1/actions`新增`reconcile_hook`，沿原Execute权限、FIFO、计划及租约进入。SDK的`reconcile_hook`只接受事实，后续显式Resume；管理命令经同一Runtime继续。ticket绑定两份原记录的版本、意图摘要和effect/recorded/gate类型。effect必须报告原效果，recorded只能采用原回执，gate仅完成合法最终决策并保留真实工具结果。原权限暂停没有效果意图，不能通过此接口代替审批。

原账本、工具结果、外层决策及不可变命令回执在一个SQLite事务内提交。已claim的未知效果可结算原预留；多层账本的未claim成员只能与最终事实原子结算，不获得IO授权。已有真实结果不可替换。同命令重放不新增预算或请求，实际消费时以稳定事件键记录reconciled。后代路径使用原控制器边界及冻结的scope_identity；不重开已结算失败组或创建新控制器epoch。

生产范围为16份既有文件与4份新Runtime文件，测试为1份原Host注册及2份新文件，共23份Rust源码/测试。具体清单见同名JSON；原始26份文件已有阶段前归档。原有控制器父指纹算法仅转移到共同助手，未改变其计算语义。

## 实际行为

| 验收 | 结果 |
| --- | --- |
| 有/无预算根效果 | 两次独立子进程确实exit76，保留原意图；重开后人工事实使原根完成，模型/HTTP均保持一次 |
| 已知Hook暂停 | 有/无预算两条流程完成原gate，原工具回执和已用/预留/操作数不变，HTTP一次 |
| 后代效果 | 受预算约束的Tool叶和无预算的hashed Agent叶各一条，保持原子运行身份、线程及检查点，完成原workflow；成功工作不重复 |
| 图事件来源 | workflow_start的原图检查点和事实被消费，Hook一次，随后模型与普通工具各一次 |
| 原权限审批 | before_model的Hook未获准时模型/效果均0、恢复目标为空；原审批通过后才执行，各一次 |
| 故障原子性 | SQLite触发器在预算结算之后、外层Hook写入时强制ABORT，检查点与两层预算/事件全部回滚；移除故障后一次成功 |
| 既有结果与反例 | 原回执不可替换；过期ticket/来源、跨根、非法决策、失去租约及未claim预留均不修改原证据/预算；同命令不可改内容 |
| 权限与绑定 | Read可以查询而不能提交恢复；清空ContextBinding仍保留原NativeControl及租约 |

Host新增6个测试入口，其中1个为条件子进程入口、5个父测试实际运行8条流程。真实硬退出只有上表两次；后代2条和图事件1条使用所拥有Tokio任务的abort，不记作进程硬退出。另有5项真实SQLite状态/故障测试。局部HTTP服务与协议响应是受控夹具，本轮未调用真实上游模型、读取真实凭据或安装依赖。

## 集中验证

| 检查 | 结果 |
| --- | --- |
| 全工作区构建 | all-features、locked、offline，55.373秒 |
| 18包、105个测试入口 | 1603项通过、0失败；Memory既有release性能1项未运行 |
| Runtime / Host / Executors | 402 / 244 / 19项通过 |
| Host HTTP / 进程树 | 156项，608.920秒 / 11项，199.918秒 |
| 文档示例 | 5项，29.014秒 |
| 无默认 / 仅SQLite | 15.910 / 16.848秒；无新增警告 |
| 仓库外SDK / 严格文档 | 10.341 / 20.329秒 |
| 依赖边界 / 格式 | 2.849 / 1.255秒 |
| 冻结核对 | 643份源码/声明、109份预构建执行制品，在整套运行前后全部摘要一致 |

最终会话61161正常exit0，报告按各外层harness最后汇总计数，未叠加继承输出的子进程汇总。最终测试含条件入口，测试数量不等于独立真实退出次数或所有业务能力完成度。源码归档未变，不重复运行或重记此前9项源码打包测试。收尾额外执行一次实际默认CLI：禁用site、PATH无外部工具，26文件/203602源码字节，归档49332字节；逐文件字节及执行位正确，与原已验归档完整字节相同，SHA256为0304b0f0a6620175dd5a2275989c8bd50f6f64d01fda244cbcd20a52949a51a6。只读核对最初误将coding前缀重复计算，修正核对根后通过，未改打包器或重跑生成。新证据为本阶段source-package-check/result.json；默认边界及原解包重打包验收见[source-package.md](source-package.md)。

## 失败记录与未完成项

首个Host夹具误将ModuleRegistry当作Arc，修正了测试类型。最初受预算约束的Agent后代在Hook派发前失败：原组合身份132231字节，经初始hashed_v1后仍为131236字节，子组指纹超过现有65536字节账本边界。该组合没有被计为通过，也没有通过放宽保护解决；它是下一独立组合标识阶段的开放缺陷。本轮后代验收明确覆盖受预算约束的Tool与无预算的Agent。

之后发现恢复查询没有绑定根的scope_identity，合法hashed Agent后代被过滤；已按原冻结快照恢复身份选择，原后代流程通过。一个SQLite测试夹具未推进checkpoint revision，改正了夹具。首轮整套已通过Runtime45入口，但无默认构建出现两处新增未用助手警告；主动SIGINT停止会话98575并确认exit130、进程组3515446清空后，才收窄助手的feature编译范围。首轮保存在attempt-1，不记为完整成功；最终重新冻结并运行整套一次通过。

历史无预算Hook若缺失原派发证明，仍保持未知；未声称自动迁移所有旧记录。已结算控制器失败不会由效果事实隐式重开，完整loop/subflow等组合矩阵仍须继续。Context、动态ToolSource、Memory、其他迁移状态、新控制台、逐版本参考预设、性能及发布仍开放，整体目标未完成。

## 影响与恢复材料

阶段前emit为CRITICAL（34项、直接13项、5流程），dispatch_tool为HIGH（4项、3流程）；managed_action_leased为CRITICAL43，action_digest为CRITICAL75，execute_leased为HIGH8，原parent_fingerprint为CRITICAL17；后代recovery_path/check_group_boundary/graph_route各HIGH4。风险已在编辑前报告，后续补充了路径和RunServices范围。API工具没有解析到Rust路由，RunServices的方法边也未完整映射；这不代表无影响，真实源码路径、原生认证用例、清空绑定测试及完整回归共同补证。

沿用L3b6恢复的可读图：meta为708文件、13652节点、36179关系、300流程，indexedAt为2026-11-03T17:29:14.630Z，原图时间17:19:03.655Z。没有将此前失败的原生CLI分析说成新成功索引。新增模块/助手未完整入图，显式文件清单、阶段前后摘要及实际行为是必要补证；收尾detect_changes(all)为10783文件、2776符号、206流程、CRITICAL，属于累计工作树；不是本阶段23份Rust文件的增量，新增模块仍须显式清单补证。

证据根`/tmp/nofy-hook-recovery.zazor1ee`；恢复根`/home/none/nofy-build-retired.jdnpc7/hook-recovery.3091o1dy`。阶段前before.tar.gz包含26份原文件，SHA256为`74ba452d26e65b21395fa99a86de772890b4dd87ed2b513bd24f9046a9e431f0`；最终文件及回退说明由恢复根的files.json和RESTORE.md核对。未commit/push。

源码回退材料只覆盖本阶段源码差异，本轮没有修改用户生产数据库。不声称B7可直接接管B8尚未完成的原生意图；未来实际使用此状态时须保留原数据库、账本和回执，通过支持该版本的内核完成恢复或显式迁移，不以删状态解除保护。
