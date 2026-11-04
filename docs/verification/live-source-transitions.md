# 运行中来源与上下文策略更新验收

L3c1 已接通 Runtime 的三类显式选择：`context_sources`、`context_policies`、`tool_sources`。更新须处于原运行确认的安全停驻点，沿原声明、Loader、管理命令及 Worker 生效。原消息、输入、预算、操作身份、成功效果和上下文进度保留；动态来源仅在显式选择时退休旧工具视图。完整平台仍未完成。

## 已验证行为

| 范围 | 实际证据 |
|---|---|
| 替换与移除 | Runtime 实际运行新检索内容、压缩策略及动态工具，显式空集合退休来源；旧文件效果一次 |
| 新增 | 独立 SDK 消费者将起始三类来源均设为空，经原管理流程添加来源并运行新工具；1 项通过，另 52 项过滤，不混入工作区总数 |
| 原子性 | 管理回执写入被 SQLite trigger 拒绝时，原检查点、版本和预算全部保持；移除故障后重开并接续原命令 |
| 未完成工作 | `before_model` 准备请求和 `before_compact` 计划阻止提前确认停驻；使用原 HookJournal 决议后，原版本完成原工作，再确认停驻并更新 |
| 保护依赖 | 三种选择分别遗漏时拒绝；即使显式选择，共享给保留 Binding 的来源/策略仍不可改写 |
| 策略身份 | 同一策略定义和工厂保持、仅传递依赖变化时产生不同内容身份；原闭包不变沿用原身份，后续 Prompt 变化保持有效策略身份 |
| 版本与会话 | 回滚作为新版本；累计选择在 Prompt 更新、重开和原 session seed 交接后保持 |
| 默认 Host | 已有 `context.rules` 通过真实声明发布、API、Worker 和回环 HTTP 模型/工具传输完成替换、移除及回滚；无新增业务工厂注册 |
| 硬退出 | 独立 Host 子进程在接纳后 `exit(73)`、提交后 `exit(72)`；恢复原命令、状态及预算，原工具和 Hook 每流程各一次 |

Runtime 新增 7 项测试。Host 新增 2 个入口，其中 1 个是只在指定环境下运行的子进程助手；父测试实际执行同进程替换、接纳后退出恢复移除、提交后退出恢复再回滚 3 条流程。回环协议服务用于确定性行为验收，本阶段没有请求真实外部模型或读取生产凭据。

## 完整回归

完整工作区构建后冻结执行一次，原会话 `60692` 正常退出 `0`，无中止后重跑全量。18 包、105 个测试入口共 **1622 项通过，0 失败**；**5 项文档示例通过**。既有 Memory release 性能基准 1 项未运行。

| 检查 | 结果 |
|---|---|
| Runtime 全部测试 | 416 项通过 |
| Host 全部测试 | 249 项通过，其中 HTTP 161 项 / 611.609 秒，进程树 11 项 / 199.678 秒 |
| 无默认 feature、SQLite-only | 通过，分别 14.664 / 17.995 秒 |
| 独立 SDK 消费者 | 通过，9.817 秒 |
| 全工作区严格文档 | 通过，22.082 秒 |
| 实际依赖边界、格式 | 通过，2.729 / 1.255 秒 |
| 冻结摘要 | 653 份源码/声明、110 份预构建制品前后一致 |

`--all-targets --no-run` 额外编译既有 `business_lookup` 示例。它计入制品摘要，不计作测试通过；105 个测试入口保持原统计范围。独立“从空集合新增来源”实验随后通过，使用当前 Runtime 源码及独立 Cargo workspace，没有修改生产源码或工作区测试，亦未改写原 110 份冻结制品。

## 实施与失败记录

生产改动仅 Runtime 五文件：`agent.rs`、`supervisor/jobs/managed/actions.rs`、`supervisor/jobs/managed/transition.rs`、`transition/compatibility.rs`、`durable/retention/decode.rs`。另外两份既有测试注册及六份新 Rust 测试文件。没有新增依赖、数据库表、运行循环、打包校验或包体配额。

专项首先发现命令接纳仍只识别原四种选择，已补充 `action_digest` 的三个条件；空选择与原摘要规则保持。两次早期编译失败来自测试误用私有 helper/字段，改为本地预算查询和公开快照恢复。一次复用样本模型的结束判断把检索 `User` 消息当成新业务回合，已使用按实际工具回执结束的专用测试模型，生产行为未修改。完整回归收集器在开跑前发现额外编译示例，修正统计分类后运行，未把初始化失败算作功能测试结果。失败尝试均保留在证据目录。

影响分析覆盖 `with_live_modules`、`ModuleUpdate`、`restore_job_plan` 和补充接纳入口；CRITICAL 风险已在对应编辑前报告。同名函数和文件级图查询存在缺边，保留原结果并用精确上下文、实际调用及源码差异补证；沿用 L3b6 恢复图，不声称原生新索引成功。

## 证据与恢复边界

- 契约：`docs/architecture/live-source-transitions.md`。
- 证据：`/tmp/nofy-live-sources.gfsb2uzi`；全量 `report.json`、`verification-results.json`、105 份矩阵日志和摘要核对结果。
- 新增实验：同目录 `addition-consumer/`、`source-addition.log`；运行 `cargo test --manifest-path /tmp/nofy-live-sources.gfsb2uzi/addition-consumer/Cargo.toml --offline --test source_addition transitions::modules::sources::replacement::replacement_reopens_atomic_update_and_runs_new_context_policy_and_dynamic_tool_without_repeating_effects -- --exact --nocapture`，设置 `CARGO_TARGET_DIR=/home/none/nofy-build/target` 和 `RUST_MIN_STACK=16777216`。
- 源码恢复：`/home/none/nofy-build-retired.jdnpc7/live-sources.jzmap_zx`，分批编辑前归档及完成后归档；只用于恢复源码，不覆盖用户运行数据库。

`nofy.live/v5` 是本框架新的受支持状态版本。回退到不识别 v5 的内核不能直接读取已写入的 v5 记录；在线配置回滚应使用当前内核创建新的显式版本，并保留原目录、账本、历史版本和回执。源码归档不代表用户持久状态迁移或逆向迁移已经完成。

默认 Host 尚无动态 ToolSource 和通用 ContextPolicy 的外部装载工厂；其 Runtime 工厂验收不替代平台模块交付。Memory 自动捕获与写入绑定迁移、其他状态能力、新控制台、多套锁定参考版本的行为预设及最终发布继续开放。Python 与编程预设源码包本轮未改，先前 53 项 Python 验收不记作本轮新运行。
