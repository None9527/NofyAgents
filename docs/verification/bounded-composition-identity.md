# 有界组合身份与子组预算验收

2026-11-04，L3b9。关闭L3b8记录的“大Hook组合Agent后代在派发前因子组指纹超过65536字节失败”问题。原账本边界未放宽；编程预设选用显式hashed_v2。整体平台目标仍active。

## 实现与状态语义

HashedV2在初始编译和每次Hook、Policy、Binding、Governance、ContextPolicy、Recipe、Tool调用、Workflow工具及Event追加后折叠身份，组合身份固定84字节，子地址固定78字节。Legacy/HashedV1属于框架自身已存在的冻结格式，其原编译/地址语义保持；没有接回旧产品代码或主循环。编译格式由对象显式声明，运行地址方案由根向后代继承，两者分别核对；未声明的组件不会在执行时被重编译为V2。

新子组指纹为child-group/v1前缀及原composition/input规范元组的SHA256，共79字节。已有原Child活动、child_calls=1且其他字段全部一致时，原二字符串元组可与摘要表示核对；继续使用原记录发行的reservation，而非创建新句柄或重写原请求。claim/settle仍完整比较原请求；已claim未知仍未知，原receipt不能替换。operation_id、成本、深度、活动类型、unbounded标志或内容改变均不能借此重用原请求。

生产范围为10份既有Runtime源码加1份新fingerprint.rs，5份测试文件含2原文件和3新文件，另编程预设仅preset.json选择hashed_v2。无新依赖、表或持久根字段。新文件与原入口清单见JSON；源档保留阶段前23份原文件。

## 实际验收

| 场景 | 证据 |
| --- | --- |
| 原失败组合 | 默认格式、HashedV1、HashedV2三条有预算Agent＋执行型Hook路径均完成原workflow；模型、Hook及业务HTTP各一次 |
| 长输入 | V2的中文prompt为150000 UTF-8字节，旧原始元组仍超过65536；新摘要通过原账本边界，预留完成后清零、原规格与子运行身份保持 |
| 真实退出 | 新子进程确实exit75；重开Host后原ticket一致，按原快照与租约完成，原效果和模型均未重发 |
| 每类追加 | 3项属性测试验证完整追加链、固定长度、顺序/内容变化与确定性，并核对既有自身格式追加字节 |
| 原预算记录 | 4项Memory/SQLite测试覆盖原预留的未claim/已claim/已完成状态、数据库重开、原request不改及混合表示floor；错误活动/成本/内容/其他字段拒绝 |
| 深层状态 | 原3个用例分别在V1/V2运行：16层共享预算及清空绑定、12层叶子模型重试、12层定点取消；快照、原地址、请求和成功效果保持 |
| 首个预设 | hashed_v2声明通过实际原生文件工具、审批、源码热更新及重开回归；Python53项通过，源码包仍按普通清单交付 |

最终新增Host3入口中1个是条件子进程助手，2个父测试实际运行4条流程；3次为拥有的Tokio任务abort，1次为真实exit75，不能混计。该计数指最终集中矩阵，不叠加先前专项或失败尝试。HTTP/模型协议服务是受控本地夹具，本轮未调用真实上游模型、读取真实凭据或安装外部依赖。

## 集中结果

| 检查 | 结果 |
| --- | --- |
| 工作区构建 | all-features / locked / offline，92.409秒 |
| 18包105入口 | 1613项测试通过、0失败；Memory既有release性能1项未运行 |
| Runtime / Host / Executors | 409 / 247 / 19项通过 |
| Host HTTP / 进程树 | 159项，609.319秒 / 11项，200.040秒 |
| 文档示例 | 5项，30.709秒 |
| 无默认 / 仅SQLite | 19.399 / 22.352秒，无新增警告 |
| 仓库外SDK / 严格文档 | 15.324 / 23.139秒 |
| 依赖边界 / 格式 | 2.718 / 1.245秒 |
| Python预设 | 53项，2.382秒命令时间，含普通源码归档与自备环境路径 |
| 整套冻结 | 647份源码/声明、109份预构建执行制品前后摘要全部一致 |

最终会话62584正常exit0，各测试入口以外层harness最终汇总计数，不累计条件助手继承的子进程汇总。阶段前后源码清单及执行制品记录保存在证据根，文档收尾允许的改动另作核对。

## 失败记录与范围

最初深层新断言错误地要求故意省略声明的奇数层也采用V2编译格式；按原混合声明保留用例，只对显式V2层验证84字节编译身份，所有后代仍验证V2地址。之后修正了由上层#[path]导致的测试子模块路径。第三次专项在关闭Host后查询导致503，将同一断言移到关闭前，未改变生产逻辑或放宽断言。三份尝试均保留；最终整套冻结只运行一次并通过。

编程预设采用新格式，需要支持hashed_v2的内核在装载时解释；打包本身不探测/安装环境或核对依赖版本，不捆绑依赖、不设包体配额。源码回退档不保证未支持V2的旧内核读取新的快照；不通过删原状态、账本或成功回执回退。本轮没有修改用户生产数据库。

L3b8的未知Hook原生恢复继续有效；历史无原证明的无预算意图及全部控制器组合没有因此宣称完成。ContextSource/ContextPolicy、动态ToolSource、Memory状态迁移、新控制台、多套锁定参考版本的行为预设、发布与性能仍待完善，整体目标未完成。只读后续入口审计见证据根next-stateful-update-audit.json。

## 影响与恢复

编辑前with_hooks为CRITICAL23、with_required_policy为CRITICAL24、with_binding为HIGH21、with_governance为HIGH19、ContextPolicy/Recipe各HIGH11、set_scope_identity为HIGH16、bind_tool_program为HIGH8、add_program_tool为CRITICAL8、BudgetRequest为CRITICAL19，已报告并限定阶段。IdentityScheme及部分动态后端/字段边未完整入图，LOW/0不能当作无影响；精确源码、快照、原状态与集中回归补证。

沿用L3b6恢复的可读图（708文件/13652节点/36179关系/300流程），没有将先前原生CLI失败说成新成功索引。收尾detect_changes(all)为10790文件、2860符号、212流程、CRITICAL，属于累计工作树，不等于本阶段16份Rust文件增量；新增模块仍由显式文件/摘要与实际行为补证。

证据`/tmp/nofy-bounded-identity.pyuwi58h`；恢复`/home/none/nofy-build-retired.jdnpc7/bounded-identity.fmmz0kic`。before.tar.gz含23原文件，SHA256为`f3fa9a195f3c09d7ef1fc05589d2899bbc070dbe78681691a553b5e1612450c8`；最终after、files.json、RESTORE.md和证据摘要另存恢复根。未commit/push。

## 当前源码归档

默认CLI在禁用site、PATH无外部工具的环境打包26文件、204148源码字节，归档49648字节。逐文件字节和执行位一致；解包后以相同默认CLI重打包，两个tar.gz完整字节相同。SHA256为cc03239845f386cb55930dcced5c3f6aab65d45faf0aaaa86f0fb42cc8a318f2，证据source-package/result.json及实际归档位于本阶段证据根。依赖未捆绑，未探测版本、摘要或安装环境，无包体配额。打包器、依赖清单及外部模块源码未改；只有preset.json选择V2以及文件说明更新。
