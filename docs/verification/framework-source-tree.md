# CLEAN5a：框架工作区与中立源码归属验收

本文件记录CLEAN5a当时状态。随后CLEAN5b已将这里列为待移出的旧源码按精确清单归档后移出，见[物理移出验收](retired-source-tree.md)；本记录中的原始失败、测试次数和当时未完成项不据此改写。

2026-11-03，范围为根Cargo入口收束、旧沙箱桥接移除、三个中立包迁移及开发入口纠正。证据根`/tmp/nofy-clean5-leaves.vy7rmv`；无提交/推送、外部模型请求或用户依赖安装。

## 变更与边界

根工作区显式20包、默认Host，47项实际共享依赖保持原版本/flags。Cargo离线裁锁1331→521包，身份集合没有新增版本/来源。Executors移除NofySandboxGuard及nofy-sandbox feature/依赖，不加空兼容项；Host真实Guard/隔离不变，通用拒绝负例实际断言touch未启动。

TTYUtils/SQLiteJournal/TestSupport物理迁到common，无旧路径壳。13份原文件权限保持，8份Rust中7份原字节一致，TTY的一份仅修文档注释，执行代码/API不变。其他文档链接、Compaction模块顺序和ToolOutput完整示例修正不改执行逻辑。README改为实际框架入口，不再引导旧CLI或proto工具安装。

施工前upstream：NofySandboxGuard LOW/0，EnvironmentGuard LOW/10；JournalMode的实际Runtime/Memory消费者由Cargo补证。只迁路径的detach_command CRITICAL/152、chat_completion_script_exact CRITICAL/54及根Cargo人工HIGH已在编辑前报告。收尾Goal文档所在函数HIGH/19，只修注释；其余文档入口LOW。SearchResult误选同名节点、路径型impact不支持，以准确context及unified_search_with_embedding LOW/1补证，不把错误节点当覆盖。

## 实际测试

| 包 | 单元/集成通过 | 未运行 |
|---|---:|---:|
| AgentExecutors | 18 | 0 |
| AgentHost | 222 | 0 |
| AgentModels | 32 | 0 |
| AgentModules | 41 | 0 |
| AgentRuntime | 375 | 0 |
| Compaction | 147 | 0 |
| Goal | 120 | 0 |
| InterjectionCore | 14 | 0 |
| Memory | 322 | 1项release性能基准 |
| MemoryTypes | 0，无测试入口 | 0 |
| Orchestra | 107 | 0 |
| PackCore | 7 | 0 |
| SQLiteJournal | 19 | 0 |
| TestSupport | 3 | 0 |
| TokenEstimation | 16 | 0 |
| ToolProtocol | 14 | 0 |
| ToolRuntime | 105 | 0 |
| ToolTypes | 58 | 0 |
| TTYUtils | 42 | 0 |
| Workflow | 63 | 0 |
| 合计 | 1725 | 1 |

另有5项文档示例通过（ToolRuntime 3、TTYUtils 2）；Python预设53项通过，分开计数。唯一未运行的是Memory显式忽略的release基准observation_scale_baseline_10k_and_100k，不声称性能验收完成。

首轮cargo test --workspace --all-features --locked --offline通过1398项，含Host72单元+5凭据+134HTTP+11进程树=222，HTTP757.46秒、树236.57秒，Runtime375项。原session15252最终exit101，停在旧Orchestra LOC门槛；workspace-tests.log保留原始失败。

该门槛在未修改的原提交就失真：实际3980行、上限3693。按用户更换固定行数机制的要求撤出Orchestra和PackCore两份LOC测试；原业务测试/执行源码不动，不抬上限或分拆文件凑数。原稿withdrawn-loc-gates.tar.gz在删除前tar -dzf核对一致，可恢复。撤出的非功能约束不计作通过，也不据此声称最终编排能力已全部归属。

首轮109个全工作区测试入口去掉两份LOC后为107个；成功结束87个入口。其余20个保持原冻结二进制，在各自包目录、原16MiB测试线程栈下实际执行，327项通过，日志original-pending-fullgraph-tests.log，补齐原all-features图。额外九包Cargo矩阵remaining-tests.log也327项通过，不重复计数。原完整文档入口workspace-doctests.log曾有1个忽略示例，补齐后tool-doctest-final.log三项全通过，其余文档入口源码未变。

## 构建、归档与恢复

- 全工作区all-features/all-targets离线check通过，65秒；完整no-run通过，2分01秒，注释修正后最终no-run通过，20.62秒。严格全工作区文档最终15.32秒通过，cargo fmt --all --check和git diff --check通过。两轮原文档失败日志保留，不关闭warning门控。
- Cargo边界通过：Host普通16包、含build/dev17包；Executors含全部feature/build/dev7包，无旧宿主/沙箱桥。20包43条本地path边（38 normal、5 dev，含平台声明）均在工作区；平台声明检查不是其他平台实际运行证明。
- 初始639份源码/声明、5份构建配置和109份原测试二进制冻结，首轮结束后全部匹配。撤出两份LOC并补Tool文档后，其余636份源、5份构建配置、109份原二进制仍匹配；之后仅更新说明/控制文档，最终清单另存，不改写首轮基线。
- 禁用site、PATH无外部工具的实际源码CLI打包26文件、203602源码字节、49332归档字节，逐项原字节和执行位一致；SHA256为0304b0f0a6620175dd5a2275989c8bd50f6f64d01fda244cbcd20a52949a51a6。归档source-package.4MNseq/coding-source.tar.gz。不探测、安装或锁定用户依赖，无包体配额。

before.tar.gz保存根构建/锁、Executors、Runtime清单和三个原叶子；追加before-doc-links、before-additional-doc-links、before-tool-doc-example、before-final-docs覆盖后续准确路径。初始工作树/暂存diff独立保存，未用reset/checkout覆盖用户修改。首次审计错误地要求已编辑说明也保持字节一致而失败；最终migration-audit-final.log只准许TTY精确注释与TestSupport说明变化，13原文件权限均一致。

最终GitNexus detect_changes(all)为332文件、3677符号、13流程、HIGH，是全部累计脏树而非本阶段新增影响；旧UI/宿主误连不因此接回。没有stale告警，不重复索引。新增及迁移未跟踪文件由明确清单、原稿、摘要及实际测试补证，不把图谱当完整覆盖。

## 未完成项

工作区外尚有69个旧codegen包、8个旧common包和旧UI/服务/构建/发布源码待按准确清单归档后移出，不将Cargo排除当作最终干净源码树。五个codegen公共候选及SDK专用Workflow/Pack/Orchestra须继续归属收敛并按实际能力纳入统一装载；不承诺旧DSL永久兼容，也不删除能力来缩小目标。

完整运行中状态迁移、新控制台、多套锁定参考版本的行为预设和先前未完成的故障证据仍开放。外部依赖自备不撤销generation、预算/效果连续性、回滚及执行权限要求。
