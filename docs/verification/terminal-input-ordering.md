# L3b7：收尾恢复与新增输入验收

2026-11-04。已修复收尾暂停后新增输入跳过原Hook，以及同一运行再次完成时事件身份冲突。活跃执行中排队的输入继续参与当前片段；收尾已开始或从complete检查点恢复时，先完成原输出的收尾，再接纳新片段。整个框架仍在实施。

## 根因与最终实现

原循环在before_stop前消费邮箱。真实默认Host反例中，第一个Hook已经成功、第二个因预算不足暂停，新增插话后原第二个Hook未执行，新模型先运行。turn_done反例则在再次完成时报`hook intent/version/payload changed`。两条原始反例均失败，12.66秒，输出见red.log。

AgentHost增加私有、非序列化closing标志，构造时由已有state.complete恢复。本次执行开始收尾时封定；仍在活跃窗口的输入继续沿原顺序处理。收尾期间原recipe、before_stop/subagent_stop及turn_done事实先完成。原收尾要求继续工作时重新开放活跃输入窗口。接受收尾后的首个有效输入时，原HookProgress.turn递增、捕获起点移到新消息前，随输入和原回执在同一次checkpoint提交；同一片段后续输入保持FIFO和同一个turn。

根run/thread、步骤、模型操作序号、预算用量与预留、成功回执和已保存的事实operation保持。Hook操作编码、DurableTurnReceipt和持久Schema没有改变，没有新增数据库表、依赖、主循环或打包要求。生产改动是Runtime的agent.rs及agent目录中loop_host、input_host、execution、hook_host五份源码，后两处仅初始化Host字段。Host只改一份测试注册，增加composition/ordering.rs；没有Host生产分支。

设计与职责见[契约](../architecture/terminal-input-ordering.md)及根目录、Runtime、Host的文件说明。

## 反向检查与修正

首版“所有完成状态都先收尾”过于宽泛。其四条原生场景先通过21.50秒，加入连续插话后首轮完整Host HTTP150项也通过611.288秒；但审查既有邮箱语义时，独立执行原user_tool_proof用例实际失败0.158秒：最终捕获缺少原始query。该失败证明运行中排队的输入不能一概划为下一片段。

只向已核实的验证进程组3440005发送SIGINT，确认原句柄30549终结exit130、进程组为空后才改源码。原输出和冻结证明保存于attempt-1，不能把中止运行计为全量成功。补充AgentHost与finish_hook_outcome的影响分析，加入上述私有阶段标志；不修改既有邮箱断言。修正版全部13项既有邮箱测试0.188秒通过，新增两函数/四条原生流程21.262秒通过。最后仅收敛非收尾时的重复邮箱查询并补私有字段注释，随后独立冻结执行最终全量。

## 实际行为

| 场景 | 结果 |
| --- | --- |
| before_stop暂停后两条插话 | 原两个Hook先完成，随后一次模型处理两条FIFO输入，再完成新Hook；两次输出各对应自己的事件 |
| turn_done暂停后两条插话 | 原事实先完成，新完成事件使用下一turn，不再与原意图冲突 |
| before_stop / turn_done后用户工具 | 原两个Hook先完成，再执行一次用户工具、一次新模型及新Hook |
| 停机重开 | 上述四条流程中两条在邮箱接纳和Park后停止原Host再重开；原检查点、提交和预算保持 |
| 原始效果与新片段 | 每条模型总2次，两段各自两个Hook各1次；用户工具场景额外工具1次；插话场景turn仅增加1，连续输入均有原回执与原文捕获 |
| 计数与重放 | steps/model_sequence均2，tool_calls为4或5，预留归零、原created_at保持；管理命令和邮箱精确重放不增加效果 |
| 活跃输入 | 既有13项邮箱回归及整套Runtime通过，原问题、用户工具授权证明、FIFO、取消和丢失确认恢复继续成立 |

新增两测试函数实际执行四条原生Host流程，其中两条为有序停止后重开，不称为新增硬退出实验。最终完整Host另外重跑既有真实硬退出、未知HTTP不重复等流程。本轮HTTP/SSE使用本地确定性服务，没有新增真实上游模型调用。

## 最终集中验证

| 检查 | 结果 |
| --- | --- |
| 全工作区all-features离线锁定测试构建 | 18包、105入口；最终构建50.51秒 |
| Runtime无默认feature / SQLite-only全目标 | 14.770 / 16.689秒，通过 |
| 仓库外SDK | 11.698秒，通过 |
| 严格全工作区文档 | RUSTDOCFLAGS=-D warnings，19.248秒，通过 |
| 实际全feature/build/dev依赖边界 / 格式 | 2.707 / 1.233秒，通过 |
| 完整预编译矩阵 | 1592项功能通过、0失败；Memory既有release性能基准1项未运行 |
| Runtime | 397项、45入口通过；邮箱13项0.181秒 |
| Host | 238项通过；HTTP150项627.220秒，真实进程树11项216.246秒 |
| 文档示例 | 5项通过，38.117秒 |
| 冻结证明 | 637份源码/声明和109个执行制品在整套前后摘要全部一致 |
| 阶段源码范围 | 相对L3b6最终源码仅5份生产、1份测试注册变化，新增1份测试；其余630份既有源不变、无删除 |

每个入口使用对应Cargo包目录、原默认并发和RUST_MIN_STACK=16777216。最终先完成构建和预检，功能矩阵期间没有源码/声明编辑、重编译或重索引；随后集中执行文档例和摘要核对。最终句柄11557正常exit0；只汇总各测试入口最末外层结果，不累计嵌套子入口小计。阶段文档在完整验证结束后更新。

## 影响与恢复

编辑前drain_inputs与before_hook_stop上游均LOW/1；相关hook_operation为HIGH/14、直接10、影响3条流程，已提前报告。advance同名查询命中其他trait，准确loop_host context和真实驱动调用补证；空incoming不能当成无影响。扩展私有Host字段前，补充AgentHost LOW/2、finish_hook_outcome LOW/1及两处构造源码检查，核心循环仍按人工HIGH控制范围。

沿用已恢复的L3b6图谱，本轮没有强制重试其原生CLI故障，也未把旧图叫作本阶段新索引；新增私有helper和未跟踪测试以准确源码、阶段差异、摘要与实际行为补证。最终detect_changes(all)在收尾文档生成前为累计10778文件、2712符号、204流程、CRITICAL，包含长期未提交开发和旧源码移出，不是本阶段7份代码的新增影响。原始审计输出保留。

证据位于/tmp/nofy-terminal-input.kpfzj6b1；恢复副本/home/none/nofy-build-retired.jdnpc7/terminal-input.wcemqzs2，扩展范围后的before.tar.gz含14份原文件，SHA256为ccba61a6421b7a8e0baf9feb02e59fe32939b69130fb32edb542e8fef1101c72。源码回退须先保存后续修改并逐文件比较；原源码包含已复现缺陷，不应在待收尾且有邮箱输入的运行上直接降级，更不能删除账本、回执或检查点来制造已完成状态。

## 后续边界

已核对现有管理API、ManagedCommand、RunControlCommand和RootTool恢复路径：尚无原生Hook效果对账入口。下一阶段须同时绑定原Hook意图和原预算工具回执，处理预留、类型化结果及外层决策，保留原审批流程，禁止把未claim或普通权限暂停视为已执行未知效果；控制器内部工作继续用其自己的恢复接口。不能只改外层Hook决策就宣称完整恢复。

Context/动态ToolSource/Memory转换、其他权限和资源迁移状态、记忆职责、新控制台、逐版本参考Agent预设、CI/发布、Memory release性能及未知清理错误仍开放。普通源码包和依赖清单、外部依赖用户自行安装边界保持；无新依赖安装、凭据读取或commit/push，整体目标active。
