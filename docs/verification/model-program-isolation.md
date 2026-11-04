# 模型协议执行隔离验收

## C8b：模型helper装配与物理生命周期（阶段范围通过）

2026-11-03，证据目录`/tmp/nofy-model-helper.Jw6SsR`，阶段前归档`before.tar.gz`。C8a的559源、16保护/二进制及6文档在开始时全部匹配。阶段按HIGH执行，实际入口为ProtocolFactory/ProgrammedModel、Loader注册/关闭、单进程worker_entry及共享HTTP夹具；图谱同名worker_entry误指树Bootstrap，API路由无匹配，使用准确context和源码补证，不改变旧产品或API授权下限。

### 当前实现

ProtocolFactory只绑定定义与Executor；原model-protocol-v1逻辑摘要/工厂revision保持，没有PID/路径/执行器状态进入可移植身份。默认Host由Loader注册隔离执行器，纯构建不启动进程，缺helper在实际admit/history失败且无网络请求。独立SDK明确选trusted或注入自有Executor；只有独立SDK恢复测试显式trusted，没有Host失败回退。

模型六阶段均经过nofy.model-program-evaluate/v1、u32 LE长度前缀和64MiB内部帧。Prepare校验定义摘要并装入8份AST LRU，Evaluate携带单调序号、JSON、spent及cap；回复核对协议/序号/缓存/操作数，原完整u64及ModelFailure保留。语义VM仍为同一Rhai函数/操作/尺寸/期限，默认Host不直接求值；源码包没有新增配额或依赖条件。

两个物理worker只在步骤中占槽，网络等待无占用。会话顺序拥有者累加spent，close取消后等待实际求值结束才放行原连接/调用接纳。每步真实拥有者持许可，丢弃调用者不使其脱管；元数据准备同样等待完成。helper以空环境和原Landlock/seccomp、512MiB地址空间、16MiB模型栈运行；Scope原2MiB不改，CPU硬上限601秒，达到540秒在下一步前退役，单步VM期限另加5秒IPC宽限。父死SIGKILL，关闭取消并drain活跃/空闲worker；清理失败保留槽中的原进程并报告，不在未知进程上启动新替代者。默认540秒CPU轮换已实测；601秒硬限制未主动触发，未知wait/kill内核错误故障注入仍开放，不能外推为所有引擎均已隔离。

GET /api/v1/models/status须Read，返回协议/槽位/计数/PID/helper绑定/停止及清理错误；查询无求值、磁盘探测、凭据或业务源码。执行权限不同于打包边界。

### 已取得证据

| 验证 | 结果 | 日志 |
|---|---|---|
| SDK Models全包 | 7单元+16协议+9传输=32通过 | `models-tests.log` |
| 首轮helper专项 | 3过1失败：测试请求不存在的factories端点得到404 | `isolation-tests.log` |
| 修正实际modules端点后的模型相关专项 | 9通过，17.51秒；真实内存压力只退役worker、Host仍服务且后续程序成功 | `model-tests-fixed.log` |
| 状态API及三协议SSE/签名/unsigned补充 | 11通过，17.60秒；Read差分、实际外部协议原文件在helper内工作 | `model-api-stream-tests.log` |
| 父死和类型化失败补充 | 8通过，6.95秒；包含1个子入口，非8次独立物理实验 | `isolation-final-tests.log` |
| 最终Host全入口no-run | 通过，10.67秒含并行检查锁等待 | `host-frozen-no-run.log` |
| 最终冻结源码的完整默认Host | 72单元+5凭据+127HTTP+11进程树=215通过，0失败/忽略；HTTP759.46秒、树237.78秒 | `host-full.log`，原session51630终结exit0 |
| 实际CLI默认CPU540秒轮换 | 单根609次本地协议调用/608次工具调用，598.85秒墙钟；旧worker已回收CPU540.00秒后替换，同一根正常完成，CLI退出0 | `cpu-single-root.log`，原session26083终结exit0 |
| 实际轮换后的持久预算账本 | 1根、1217项操作全部有回执；steps/model_calls/input_tokens/output_tokens各609、tool_calls608，逐回执汇总一致；预留/活跃/子调用全零 | `cpu-budget.log` |
| 最新预设源码包 | 26文件/203602源码字节/49332归档字节；逐字节/执行位/解包回打包完全一致，禁用site且PATH无外部工具 | `final-source-package.log` |

首次no-run仅有测试API类型误用及缺Debug的断言、一个未用导入；按实际签名/匹配断言修正后构建通过，保留`host-no-run.log`与fixed日志，没有放宽生产边界。后续手工注册表也明确补齐：常驻恢复使用同一Loader，独立SDK恢复才显式trusted；专用无helper负例保持，不给所有路径偷偷加回退。

物理证据包括NoNewPrivs/Seccomp/CapEff/空环境与/proc真实地址空间限制；每阶段完整u64往返、8项有界缓存的淘汰及空闲worker重建后spent不倒退；显式typed failure完整传回；两个SIGSTOP活worker下丢弃/取消/排队取消和物理PIDFD退出，再启动后续程序；关闭回收空闲worker；两个真实HTTP提供方响应等待时第三调用完成。内存压力是多个各自小于16MiB的变量，未扩大VM限制来制造通过；未拿到原始分配器诊断，不额外声称某个精确OOM信号。

父死测试先完成一次helper往返确保隔离已安装，再挂起其活跃步骤并SIGKILL拥有者；任何重开/恢复前PIDFD确认helper退出。随后测试信号全部收紧为pidfd_send_signal；三协议SSE测试新增在请求已发送、尚无响应帧时杀掉空闲helper，要求同一HTTP响应继续、签名与u64保留且只有两次物理请求（首轮+显式后续）。最终完整Host已覆盖这些收紧后的测试文本，不只复用先前同名专项结果。

首轮CPU测法逐次新建根运行，根46时墙钟165.89秒/worker CPU20.10秒，根138时墙钟501.67秒/CPU60.41秒。因实测控制面开销大，在149次成功请求后主动SIGINT验收脚本，CLI正常退出0；脚本KeyboardInterrupt/exit130保留于`cpu-rotation.log`，没有到达轮换阈值，不计为机制通过，也未定位性能根因。随后改用单根连续往返，只轮询轻量models/status与实际进程CPU；源码、CLI、VM限制与默认540/601策略不变，不是观察超时后重复启动同一任务。

单根实验在旧worker CPU539.6376秒时仍观察到原进程，下一独立步骤前换成新worker；内核父进程累计已回收子CPU为540.00秒（本夹具没有其他子进程）。轮换时已完成608个工具效果，之后仅显式最后一轮模型回复结束，因此609次提供方夹具请求/608个工具结果逐项ID一致、均非错误，原会话token各609。只读SQLite核对原budget scope仍一根，1217份回执之和精确等于used，reserved与active全零。没有降低阈值、重编译、重发已成功请求、调用真实外部模型或注入用户凭据。CLI正常关闭后拥有者/旧新worker均不再存在。

原559项中24份Rust/测试与2份说明改变，其余533项不变；新增execution/worker、Host池/进程、隔离/流式测试6个Rust，形成565源冻结。根Cargo/lock/工具链/AGENTS及外部执行源码未改，没有新增依赖；真实边界检查仍Models/Modules6、Host16/含build-dev17。严格Host/Models文档10.12秒、定向fmt/diff通过。完整Host215项及CPU长跑结束后565源与16保护/二进制仍匹配，之后仅更新Host/Models/预设三份文件说明，执行源码及二进制不变；最终565源、16保护/二进制和7份控制文档另存final清单，原frozen清单不覆盖。GitNexus detect(all)307文件/3384符号/13流程/HIGH为原累计脏树，结合准确源码与摘要补证；没有stale警告，不重索引，不commit/push。所有失败及中断记录保留，未知清理故障、其他引擎、全状态迁移/物理旧树/新控制台/多预设继续，整体active。

## C8a：异步控制与事务边界

2026-11-03，证据目录`/tmp/nofy-model-isolation.1HBg0C`。阶段前归档为`before.tar.gz`，保留已有脏树，不commit/push，不引入旧Agent兼容层，不修改源码包与用户自备依赖规则。

### 实际实现

Model::request_bound及validate_live_history改为async；治理通过原await_resource等待准入，计算完成前不做模型预算预留，不发提供方请求，原取消与总期限覆盖等待。当前模型驱动和目标内测试消费新接口，没有为旧开发期同步签名增加回退。

submit_transition和执行转换两处，先读准确边界、事务外历史校验，再在最终事务重读并验证内部证明。绑定内容包括提案、原提交摘要、源/目标快照、有效版本及模块选择、完整停驻记录、任务状态、检查点revision与原始payload；历史证明还绑定完整RunState。执行侧等待续原根租约，原所有权、FIFO、停驻凭据、safe-root和CAS检查均保留。校验失败写入原失败回执；精确重放不再次校验或变更状态。未修改JobSubmission、管理命令、检查点、generation或成功效果的持久格式。

### 运行证据

| 命令/入口 | 结果 | 日志 |
|---|---|---|
| `cargo test --locked --offline -p nofy-agent-runtime --all-features` | 375通过，0失败/忽略；含5项新增异步预算/历史测试 | `runtime-full.log` |
| `cargo test --locked --offline -p nofy-agent-models` | 7单元+16协议+9传输=32通过 | `models-async-tests.log` |
| `cargo test --locked --offline -p nofy-agent-host --no-run` | 全部Host测试入口构建通过，56.97秒含并行构建锁等待 | `host-no-run.log` |
| Host HTTP `parking::transitions::` | 4入口通过，46.67秒；含2个独立进程子入口和2个实际综合测试，覆盖接受后exit(97)、重启、更新/跨根种子和预算保持 | `host-transition-tests.log` |
| Host HTTP `model_program::`，标准Cargo启动 | 4通过，11.60秒；包含声明完整性/预检与真实本地三协议、运行中源码版本装载 | `host-model-cargo-tests.log` |
| 相同二进制的失败用例，仅补既有测试栈环境 | 1通过，9.70秒 | `host-model-stack-control.log` |
| 补强预算断言后的治理回归 | 11通过，0失败/忽略，0.10秒 | `runtime-budget-proof-tests.log` |

最初定向Runtime的治理11/停驻25已通过，之后增加精确并发重放测试并由完整375项覆盖，不把两轮重复计为新增测试。新历史4项分别覆盖：接纳期间checkpoint/park漂移；执行等待超过多个租约周期仍排他且不占数据库锁；执行中漂移/历史拒绝持久失败并重开重放；原等待提交晚于同ID命令实际完成时返回精确冻结结果。新预算1项包括完成、取消、总期限三条路径，准入等待时调用及预算使用均为零，结束不遗留等待资源。

完整375项之后，仅为该新增预算测试补强`used/reserved`全零及`active_operations/operation_count`全零断言；生产Rust不变，11项治理回归补验通过，375项按未变范围覆盖，不冒称最终测试文本由一次完整命令覆盖。严格Runtime+Models全特性无依赖rustdoc通过21.94秒；定向fmt/diff检查及真实Cargo边界通过，Host普通16/含build-dev17没有变化。

### 失败与对照

首次直接执行`target/debug/deps/http-f3e0b9d08ff73001 model_program::`，绕过Cargo，4入口只完成1项即发生测试线程stack overflow，进程exit134，保留`host-model-tests.log`，不称首轮全绿。调用shell未设置RUST_MIN_STACK；仓库原`.cargo/config.toml`为Cargo启动测试配置16777216，生产Host原WORKER_STACK_BYTES也是16MiB，均未修改。

原源码与二进制不变，标准Cargo四项全部通过；随后同一直接二进制仅设置原既有`RUST_MIN_STACK=16777216`，精确失败用例通过。二进制SHA-256为`8e6074aead7a6419e21c32b32a4ad40059b450639232fdafab02a3dae412120d`。该对照定位本次启动环境缺失，不是通过增加生产限额修复代码，也不能据此声称默认2MiB栈受支持或模型VM已有进程隔离。

### 变更范围与可回退性

阶段前M3d4的555份源/声明和16份保护配置/实际二进制在开始时全部匹配。原555份中18份Rust源码/测试改变，其余537份保持一致；另有原冻结清单未覆盖的Runtime/Models两份文件说明，通过阶段前tar原字节对比确认更改并补入当前清单，不能算作新增源码。新增历史边界实现与测试2份Rust，无源码删除。根Cargo生成文件、Cargo.lock、AGENTS、工具链和Cargo配置均未改变；16份保护清单中7份实际构建产物变化，其他9份一致。没有新增依赖、修改权限过滤器、改变模型协议工厂身份或连接/凭据定义。阶段回退应只对照`before.tar.gz`中的这些准确路径，不覆盖原有脏树或历史数据库。

最终冻结为559份源/声明的`source-final.sha256`（原555+新增Rust2+扩大纳入原文件说明2）、16份保护配置/二进制的`artifacts-final.sha256`及6份控制文档的`metadata-final.sha256`。GitNexus detect(all)返回306文件/3382符号/13流程/HIGH，是累计脏树而非本阶段独有改动，不能据它宣称新未跟踪文件完整覆盖；以准确源码、阶段前后摘要及实际回归补证。未收到stale告警，不重索引，不修改旧产品源码来迁就图谱同名误连。

### 未完成边界

实际Rhai的admit/history及Session仍在宿主求值。本阶段没有受限helper池、内部帧协议、物理worker取消/退出/内存压力验收，也没有新的外部提供方请求。独立SDK与默认Host的执行器分离、三协议在helper内完整运行、故障后的Host可用性和生命周期回收属于C8b，不用32项模型测试替代它们。完整运行中权限/预算/上下文/动态工具源/记忆迁移、物理旧源码清理、新控制台及多套参考Agent预设仍开放，总目标active。
