# CLEAN5c：公共能力归属与统一 Workflow 验收

后续状态：本报告保留CLEAN5c发生时的失败与开放结论。所述HTTP并发回执超时已由[CLEAN5d注册表共享](host-registry-sharing.md)定位、修复，并在相同15秒期限八路并发及完整105入口矩阵验证通过；下文历史数据不改写为一次全绿。

2026-11-03。源码归属与统一执行路径已实现；功能回归按冻结制品分组覆盖。首轮全量不是一次通过，HTTP 并发下的管理回执超时仍未定位，不能据单项重跑宣称该负载问题已修复。完整平台目标继续开放。

## 实现与恢复

- 当前 18 包全部位于 crates/common，40 条本地 path 依赖均留在工作区。
- Memory、TokenEstimation、PackCore 原稿逐文件比对后迁入 common；Memory 的 54 份 Rust 源及 Token 的 1 份 Rust 源字节未变。PackCore 只移出未使用的 builtin_packs/file-steward 数据和专属测试，保留通用解析、平面隔离及服务命名空间。
- 旧 Rhai Workflow 与 Orchestra 共 26 文件、253412 字节移至工作区外研究归档；不留原宿主、脚本适配、WorkflowCheckpointer 或旧路径转发。Runtime 私有 DAG 只承担当前图需要的依赖校验与就绪选择。
- WorkflowDocument、WorkflowSpec、ModuleRef、WorkflowCompilationSnapshot 格式不变；原 SDK 派发和顺序/并行恢复用例转至同一声明式图路径，检查暂停、恢复、组合漂移拒绝及成功效果不重复。
- Cargo.lock 离线裁剪 521→516，未新增身份或升级版本；删除两个旧包及其三个不再使用的依赖。通用外部 Rhai 工具和模型模块仍按各自契约工作。

恢复目录为 `/home/none/nofy-build-retired.jdnpc7/clean5c.Ya3dAO`，含修改前 tar、工作树/暂存 diff、状态及逐项移动记录。五项移动的 110 条记录前后字节、权限、所有者及时间一致；暂存区未改。初始 tar SHA256 为 `63c67c8cd174bf56959a33000602f54460b316f8c74d105804179a156523f929`。精确路径、文件数及依赖边见同名 JSON，不覆盖已有输出或用户修改。

## 构建与分组结果

| 验证 | 实际结果 |
|---|---|
| 全 feature/target check | 44.84 秒通过 |
| 全工作区严格文档 | 25.743 秒通过，RUSTDOCFLAGS=-D warnings |
| 全工作区测试入口编译 | 105 个；初轮 100.454 秒，两个 SDK 调用修正后 2.88 秒、进程树测试修正后 8.03 秒补编 |
| 仓库外独立 SDK | 实际编译/执行通过，含 Agent 组合、配置、Workflow/Hook、事件和文件目录；无旧引擎依赖 |
| 实际 Cargo 闭包 | 默认、全部可选 feature、build/dev 均无旧 Workflow/Orchestra/宿主；不是用户源码包的依赖探测器 |
| Rust 功能回归 | 18 包、105 入口，1555 项按未变范围分组通过；Memory 1 项 release 性能基准未运行 |
| 文档示例 | 5 项通过 |
| Python 预设 | 53 项通过，2.391 秒 |
| 源码与制品 | 623 份源码/声明/配置和 109 个执行制品冻结；测试期间无变化。后一次冻结仅预期改变进程树测试辅助函数及其二进制 |

按包的精确数量见同名 JSON；Runtime 为 377 项，Host 为 222 项。子进程测试输出不重复加总为独立入口。

## 失败、修复与仍开放的超时

1. 新迁移 SDK 用例首次错误传入 RunInput::new("")，使文本消息进入只接受工具调用/恢复的参数；改为既有图契约 RunInput::default()。两项迁移用例及新增 DAG 校验随后通过，生产 Tool 参数检查未放宽。
2. 首次完整 Cargo 命令在 904.346 秒退出 101：HTTP 组 885.82 秒，133 过、1 失败。失败项为 declared_rules_preserve_approval_and_success_receipts_after_reopen_and_portable_lock_import，15 秒内管理回执未 finished；期限后的诊断观察到运行 closed/completed。相同二进制、相同期限单项通过 56.662 秒。并发时序值得排查，但根因未证实，保留为开放问题，不以增加超时或单测重跑求取“全量全绿”。
3. 后续分组的进程树首轮 10 过、1 失败，214.203 秒：settled 只等 execution 完成便保存整条记录，捕获到 run 仍 running；重启后 run 已 closed，整条比较失败。补充准确 context/Cypher 与实际调用审计后，仅收紧测试辅助函数，要求 execution 与队列均已落定，原 40 秒期限不变。11 项完整进程树重跑通过 239.074 秒，包含真实 CLI 重启后的记录比较。
4. 首轮未到达的入口依照原冻结制品继续执行；测试辅助函数修正后只有其源和二进制预期变化，其余 622 源、108 制品不变。最后 86 个入口及文档示例全部通过；不重复运行或加总已有通过范围。

证据根 `/tmp/nofy-clean5c-ownership.xyDbvE` 的 attempt-1/2/3 保存各次失败、原稿、完整日志及冻结摘要；coverage.json 记录每个入口的来源。HTTP 高并发动作回执时序须继续定位，再推进依赖其稳定性的后续工作。

## 源码交付边界

普通源码包实际含 26 文件、203602 源码字节，归档 49332 字节，SHA256 为 `0304b0f0a6620175dd5a2275989c8bd50f6f64d01fda244cbcd20a52949a51a6`。禁用 site 且 PATH 无外部工具时 CLI 打包成功，条目、原字节及执行位逐项一致。外部依赖由用户安装，普通 requirements 清单随源码交付；不探测依赖版本/摘要、不安装依赖、不内嵌运行环境、不设包体配额。

当前源码包与此前验收全字节相同。可选锁定部署、框架 generation/恢复和执行权限是独立契约，不成为默认打包前提。本阶段没有新增外部模型请求、读取凭据、安装工具、commit 或 push；真实模型请求名与返回元数据差异继续保留原记录。

## 图谱与未完成项

实现收尾、文档写入前 detect(all) 为 10766 文件、2546 符号、184 流程、CRITICAL，属于此前脏树及物理移出累计范围，已报告；不是本阶段新增执行源数量。impact 对测试 settled 误选同名旧 Orchestra 函数，准确 context/Cypher 证明直接调用只有 confined.rs 的 execute/run；不将误选结果当作真实风险结论。

本地图谱在实际测试退出后刷新；overview 可能缓存旧统计，以 .gitnexus/meta.json 及实际 File/符号查询为准。旧 codegen/Workflow/Orchestra 不再位于源码树；全部依赖边和冻结证据独立补证。

完整运行中权限/预算/上下文/动态 ToolSource/Memory 转换、记忆内部职责审核、新控制台、多套锁定参考版本的行为预设、CI/发布与此前故障证据继续开放。SDK 组合和此次归属整理不等于最终常驻平台完成。
