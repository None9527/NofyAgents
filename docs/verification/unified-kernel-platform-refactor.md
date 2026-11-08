# 统一内核/平台适配：增量实施验证

日期：2026-11-08。仓库：PC 的 WSL /home/none/nofy-build。基线：c958379f。
计划：[统一内核与原生全平台重构](../architecture/unified-kernel-platform-refactor.md)。
第一批完成 P0 和 P1 的代码及 Linux 验证；第二批完成 P2 的共享工厂目录切片。两批的 macOS/Windows 原生验收均未完成，不能视为对应阶段全面交付。

# 第一批：子进程 CPU 计量

## 实际修改

- 新增 nofy-tty-utils::child_cpu_time(&tokio::process::Child) -> io::Result<Duration>。
- Linux 使用既有 process CPU clock；macOS 使用 proc_pidinfo(PROC_PIDTASKINFO) 的用户态+系统态纳秒；Windows 借用 Child 的现有句柄调用 GetProcessTimes，合并 100ns FILETIME。
- 处理 PID 范围、无效/不完整样本、溢出和已回收子进程；失败返回错误，不用零值或墙钟替代。
- host 模型 worker 的 expired 调用该适配器，不再含 Linux 专属 CPU 读取与非 Linux 拒绝分支。
- 增加三端相同的单元和真实子进程测试、独立原生 CI 作业（不设置 continue-on-error）。
- 没有新建 runtime/agent/workflow，没有添加依赖，没有修改锁文件或持久格式。
- 540 秒 worker 轮换、601 秒隔离 CPU 上限、worker_command/launch_plan、权限/预算、错误后的 retire 路径全部保持。
- 计量不是强制限额。macOS/Windows 的隔离后端仍未实现，仍按原准入拒绝；不能据本批声称完整 Agent 已跨平台运行。

## 已执行结果

以下 Cargo 命令在 WSL Linux、Rust 1.94.0 上执行；使用本地依赖缓存（--offline）。

| 检查 | 结果 |
|---|---|
| cargo fmt --all --check | 通过 |
| cargo check --locked --offline -p nofy-agent-host --all-targets --all-features | 通过 |
| cargo clippy --locked --offline -p nofy-tty-utils --all-targets --all-features -- -D warnings | 通过；最终测试修改后已补跑 |
| cargo test --locked --offline -p nofy-tty-utils --all-features | 单元 44/44、集成 2/2、文档 2/2 |
| RUST_TEST_THREADS=1 cargo test --locked --offline -p nofy-tty-utils --all-features --test process_cpu | 最终代码 2/2；其中一个是测试子进程入口，另一个是实际生命周期断言 |
| cargo test --locked --offline -p nofy-agent-host --lib loader::confine::tests | 9/9 |
| cargo build --locked --offline -p nofy-agent-host | 通过，构建本批 host/helper |
| NOFY_SKIP_REPORT=/tmp/nofy-cpu-host-skip-report.jsonl cargo test --locked --offline -p nofy-agent-host --test http model_program::isolation:: -- --test-threads=2 | 8/8，无 skip 报告条目 |
| cargo check --locked --offline -p nofy-tty-utils --all-targets --all-features --target x86_64-pc-windows-gnu | 通过；仅是交叉编译，不是 Windows 原生行为验证 |
| verify-doc-claims.py | 通过：19 项数字、2 份副本、21 个错误码，与当前契约匹配 |
| verify-framework-boundaries.py / check-agent-runtime-boundaries.py | 通过；runtime 无产品 host/具体工具依赖泄漏 |
| verify-lint-ratchets.py / verify-format-blindspots.py | 通过，无新增违反 |
| verify-platform-welds.py | 通过，无新增；业务层 linux_gate 51→49，libc_call 20→16 |
| git diff --check | 通过 |

Windows 交叉检查提示原有 nofy-tty-utils/src/lib.rs 的 AsRawHandle 未使用 import warning；本批未修改该代码。
平台棘轮计数是文本启发式，不是功能证明；原 baseline 文件未修改。

## 回归覆盖与审查修复

单元覆盖纳秒/100ns 单位、user+kernel 在舍入前相加、540 秒边界和加法溢出。
同一个 Rust 测试二进制作为子进程，无 shell/脚本平台依赖，验证：
- 子进程空闲不会按墙钟计费；
- 父进程忙、子进程闲时不把父进程 CPU 记给子进程；
- 子进程真正忙后累计 CPU 增加且数量级合理；
- 连续 128 次采样不倒退，仍使用被持有的子进程；
- 回收后的 Child 明确报错。

审查发现 helper 在单线程 libtest 下会把测试名和 CPU_READY 输出到同一行，严格整行匹配因此超时。
已在协议标记前写独立换行，并让 helper 固定 --test-threads=1；RUST_TEST_THREADS=1 的最终回归已通过。
两个独立只读审查未发现生产代码的计量或隔离放宽问题。

现有 host 回归覆盖 worker 重建与显式操作进度、取消/排队/关闭后的回收、内存耗尽只杀 worker、父进程被杀后收尾、元数据只读、缺 helper 不回退以及 provider 等待不占用 evaluator slot。
隔离准入单元覆盖无后端/缺能力拒绝、Linux profile 与目录授权语义不变。

GitNexus impact/context 在修改现有 cpu_seconds/expired 前执行：LOW，直接调用方是模型池 evaluate。
变更后通过安装的 LocalBackend 调用 detect_changes(scope=all)：medium，报告预期模型/进程工具文件相关流程。
该工具按文件扩大符号范围且不覆盖未跟踪新文件；已结合 git diff 逐段复核和对新增文件的独立审查，未修改其列出的其他已有函数。

## 未执行和后续门槛

- 未在本机原生执行 Windows：未找到原生 Rust 工具链或可用 MinGW 链接器。Windows GNU 类型检查不能替代原生测试。
- 无 macOS 原生执行环境，未宣称 macOS 编译或行为通过。
- 新 process-accounting CI 三端作业尚未运行；没有提交/推送，也没有变更 branch protection。
- 未运行整工作区全测试或完整 check-release.sh；本批运行的是受影响 crate、host 相关回归和上述聚合静态门禁。
- P1 完整平台验收仍需 macOS/Windows 原生 CI（含同一 feature/test 清单）；不得把 WSL 当 Windows。
- 完整主 Agent、原生隔离后端、统一工厂目录、RSI 和独立打包继续按计划阶段推进，均不属于本批已完成功能。


# 第二批：共享进程工厂目录与安全拒绝边界

日期：2026-11-08。对应 P2 的部分工作，不代表原生执行后端或新的树级宿主绑定已实现。

## 实际修改与兼容

- 五个原先只在 Linux 注册的工厂改为三端同目录：tool.process_tree_artifact、resource.process_namespace_limits、resource.process_session、tool.terminal、resource.mcp_stdio。实际标识以 catalog.expected.json 为准。
- sessions/tree 的 descriptor、schema、纯配置校验放在共享模块；Linux 原实现移入对应 native 模块。session 生命周期、PTY、MCP stdio、树级执行和清理逻辑未重写。
- process_namespace_limits 的声明、网络策略、默认值和验证移入 process_policy；旧 process_sessions 路径继续 re-export 相同类型，保持 ResourceHandle 类型身份与内容摘要。
- 无原生实现的平台在工厂激活边界经现有 nofy-isolation 的要求/探针准入拒绝；不能创建不受控进程、终端或通道，没有隔离降级。
- 旧 cgroup_root 配置可在任一平台完成纯语法校验；原生 preflight 仍在非 Linux 明确拒绝，不能把旧 Linux 绑定忽略后执行。
- 原有 Linux 五份 descriptor 从修改前构建的 host API 捕获为完整黄金文件，精确对比配置、依赖、输入输出与 capabilities。
- 本批保持公共 HTTP 错误封装兼容：工厂拒绝的 isolation_unavailable 是 message 内的诊断标记，Error::Composition 仍映射到 error.code=invalid；旧 cgroup preflight 的 HostError::Unavailable 映射到 unavailable。没有声称新增独立结构化错误码；该契约演进需另批处理。
- 没有增加依赖、改变锁文件或状态格式，没有调整安全能力等级、错误恢复、资源预算或基线棘轮。

## 已执行结果

以下均在 WSL Linux 原生执行，Cargo 使用 --locked --offline。

| 检查 | 结果 |
|---|---|
| cargo check -p nofy-agent-host --all-targets --all-features | 通过 |
| cargo clippy -p nofy-agent-host --all-targets --all-features -- -D warnings | 通过 |
| cargo build -p nofy-agent-host | 通过，原生回归使用本批 host/helper |
| cargo test -p nofy-agent-host --lib loader::factories::catalog_tests | 5/5，完整目录、纯校验、激活顺序和旧声明 |
| cargo test -p nofy-agent-host --lib process_policy | 6/6，边界/网络/默认值/真实资源类型身份 |
| cargo test -p nofy-agent-host --lib loader::factories::unavailable | 1/1，四个工厂的缺后端拒绝 |
| cargo test -p nofy-agent-host --lib -- --test-threads=2 | 120/120，零 ignored |
| cargo test -p nofy-agent-host --test process_sessions -- --test-threads=2 | 4/4，网络代理/直接绕过、namespace、目录权限、PTY 与重启 |
| cargo test -p nofy-agent-host --test process_tree -- --test-threads=2 | 11/11，真实 systemd 用户委派、cgroup、取消/回收、外部依赖 |
| NOFY_SKIP_REPORT=/tmp/nofy-factory-native-skip-report.log | 上述原生 host 回归未产生任何跳过条目；Cargo 的通过数与能力跳过分别检查 |
| doc-claims / framework-boundaries / agent-runtime-boundaries / lint-ratchets / format-blindspots / platform-welds / git diff --check | 全部通过 |
| CI YAML 解析与 job/step 上下文、三端同命令、无 continue-on-error 结构检查 | 通过；未运行 actionlint，也未远程运行 GitHub Actions |

platform-welds 当前计数（两批合计）：linux_gate 50（基线 51）、libc_call 16（基线 20）、linux_only_factories 0（基线 5）、linux_only_tests 9（未变）。这些仅为防回退的文本指标，不是功能证明；基线文件未修改。

新增 factory-catalog 必过 CI 作业在 Linux/macOS/Windows 用同样 --all-features 与三个测试过滤器。步骤先创建跳过报告并验证可写，最终 always 步骤要求报告文件存在且为空；报告缺失和写入路径问题不能被当成零跳过。原有广域测量任务仍如实保留未完成功能。

## 审查与未执行事项

- 两轮独立只读审查逐块核对 Linux 生命周期/执行体，与旧实现语义一致；未发现绕过准入或取消隔离的分支。
- 修正了模块拆分后的明确导入、无意义的类型自比较测试，并把目录/policy/拒绝测试纳入三端必过的窄 CI。
- 修正 GitHub Actions 在 job.env 不允许 runner context 的用法，改为 step 中 RUNNER_TEMP 写入 GITHUB_ENV；该表达式上下文问题经独立复核关闭。
- GitNexus context/impact 在移动前执行；ProcessSession::manager 的 CRITICAL 35 节点影响已提前报告，保留原执行体并跑库、会话及树级原生回归。通用方法名有歧义，结合精确 UID、源代码与逐块 diff 核对，不把同名无关符号当证据。
- 变更后 GitNexus detect_changes(scope=all) 报告 HIGH，涉及 13 个既有文件；所列构建/启动相关流程在预期范围。该工具按文件扩大符号范围，且运行间返回流程数不稳定、未计未跟踪新文件，已补充逐文件 diff 与独立审查，不能把其符号数量当成实际修改数量。
- Windows host 全目标全特性交叉检查被环境阻塞：libsqlite3-sys/ring 需要 x86_64-w64-mingw32-gcc，本机未安装，未到达 host 类型检查。第一批 tty-utils 的成功交叉检查不能替代本批 host 检查。
- 本机没有可用 Windows 原生 Rust/macOS 环境；新增三端 CI 尚未实际运行。非 Linux refusal 测试虽然可编译在对应平台上，但还没有原生运行证据。
- 未运行整个 workspace 全测试、完整发布检查或远程 CI，没有提交/推送或改变分支保护。
- P2 后续仍包括与 cgroup 无关的宿主绑定、真实能力探针/握手、结构化拒绝契约与三端原生验收；不能凭工厂目录一致声称三端执行已实现。


# 第三批：目录声明与实际路径权限分离

日期：2026-11-08。对应 P2/P4 的目录切片，Windows 仅开放纯声明，不开放实际目录权限。

## 实际修改与安全边界

- resource.directory 的纯校验复用 nofy-host-path::Syntax，Windows drive/UNC/verbatim 子路径不再因为 Prefix 组件而一律失败；明确拒绝盘/共享根、设备名、ADS、非规范拼写及私有根的双向词法重叠。
- POSIX 保留原有组件语义，没有顺手拒绝既有合法的反斜杠名字、重复或尾分隔符。schema、revision、资源 identity 和内容摘要规则未变。
- 目录声明测试不再只在 Unix 可见；纯预览不读取私有存储、不创建目录，既有权限继承仍按原契约核对。
- Windows 的 Grant::preflight 在纯 validate 后、任何文件系统读取前明确返回 Unavailable。publication/job、部署持久准入、实际 Directory::prepare 和普通 process-artifact 调用都仍经这一边界；不会用纯声明有效性代替实际权限。
- 采用这个保守拒绝是因为历史保护根可能保留 8.3 短名，而目录使用 canonical 长名；大小写折叠与 verbatim 归一化不能证明两者不是同一位置。已退休/缺失根也不能通过忽略 canonicalize 失败来放行。
- runtime_history::protection::overlap 改用现有 host-path 双向包含，在 Windows 增加大小写/verbatim 的拒绝保护，POSIX 保持原行为。它仍是词法防御，不是完整的别名身份解析器。
- Linux Grant::open、目录生命周期与实际描述符校验保持原样；未修改持久格式、历史迁移协议、lease 或文件权限。
- 删除过时的目录声明 Windows skip，占位的 Linux opened-descriptor 限制仍明确保留。

## 已执行验证与审查

- WSL Linux 聚焦目录 11/11、真实保护注册/迁移边界 3/3、nofy-host-path 27/27 全部通过。
- host --all-features 全库 130/130，通过，零 ignored；使用显式预创建的 NOFY_SKIP_REPORT 独立核对能力跳过。
- host --all-features 构建通过；HTTP runtime_history::conflicting_existing_grants_are_rejected_before_source_or_protection_changes 1/1 通过。
- HTTP loader::images::directories 的 6 项端到端权限回归 6/6 通过（274.41 秒），覆盖真实 helper 的读/写/执行限制、无环境目录权限、权限重新校验、写入回滚、丢失目录后的已成功回执与环境变量伪造拒绝。全部第三批原生回归结束后 NOFY_SKIP_REPORT 文件存在且大小为 0。
- workspace fmt、doc-claims、framework/runtime boundaries、lint-ratchets、format-blindspots、platform-welds、diff --check 全过；host 全目标全特性 clippy -D warnings 通过。
- CI YAML/step context/矩阵/证据归档结构检查通过；五个 filter 的实际 --list 命令已在 WSL 执行，核对目录 11、保护 3 的真实清单。未声称 actionlint 或远程 CI 运行。
- GitNexus 精确 context/impact 核对目录 validate 的 open/config/preflight 调用和 history overlap 的 check/preflight_grants 调用。变更后整个未提交集合被 detect_changes 标为 HIGH；已按全变更集报告，而不是把单符号局部结果冒充整体低风险。
- 独立只读审查发现并封住 Windows 别名授权风险后复核通过：实际权限无绕过 preflight 的新增入口；Linux Grant::open、生命周期和 factory schema/identity 与原实现一致。

## 原生验收范围与剩余限制

- 三端 CI 使用同一 --all-features 及相同五个 filter，新增实际 --list 清单与独立 skip 文件归档。目录额外的 Linux descriptor、Unix symlink/POSIX/non-UTF8 测试导致实际数目不同：本机 Linux 11，预计 macOS 10、Windows 7；后两者尚未运行，不能把预计数写成通过数。共同保护测试三端各 3 项。
- Windows 对真实 canonical 目录的测试必须断言明确 Unavailable，包括三种 Access 和 publication/job，不是 skip 或假装成功。
- 没有 Windows junction/短名/共享别名的原生行为证据；没有 macOS 原生执行证据。Windows 实际目录授权保持关闭，不能声称三端目录能力等价。
- 既有 history/local/runtime read_root 的其他别名入口尚未全面改造。本批没有扩大它们的权限，也不声称全部路径入口已安全。启用 Windows 授权前须完成计划中双方向、未存在末级与退休保护根的原生身份测试。
- 三端 CI 未远程执行，没有提交/推送，没有改机器安全设置或棘轮基线。


# 第四批：共同内核原生契约验收门

日期：2026-11-08。复用现有 Rust 测试，不改变 Agent/workflow 调度或增加运行时。

## 真实缺口与范围

host/CLI 显式启用 runtime 的 sqlite、workflow、control-file，但根 workspace 成员没有启用 runtime/pack。Linux workspace-tests 已有 --all-features，因此不能说 pack 全仓未测；原有 macOS/Windows workspace 测量不带 --all-features 且允许失败，缺少这组共同契约的必过证据。

本批只选择五个已存在的 integration targets：program、governance_runtime、policy_floor、nested_control、pack。它们无 OS 条件测试、ignored 或能力 early-return，无外部 provider、shell、host helper 或原生隔离依赖。模型/工具是桩，pack 的 MCP 项是内存 ToolSource 绑定；真实重启使用 current_exe 子进程和 SQLite。没有据此宣称整个 runtime 的测试在三端相同，declarative 的 Unix-only 文件目录用例仍另有边界。

## 实施与已执行验证

- 新增 shared-kernel 三端同 --all-features/同五目标的非宽容失败作业，以及始终运行的 shared-kernel-parity 汇总作业。后者缺任何一个平台的完整证据、执行失败或清单不一致都失败。
- scripts/verify-shared-kernel.py 保留原始 --list、测试日志、退出码、skip 文件与摘要；检查 matrix 标签和实际 platform.system()/sys.platform，不能把 WSL 标为 Windows。
- 汇总重新解析原始证据，不只信任 evidence.json；逐目标核对清单和实际执行，拒绝空/缺失/重复/未知输出、ignored、filtered、skips、不匹配的命令或退出码。ANSI/CRLF/Windows .exe 输出有回归覆盖。
- Python 验证器单测 21/21 通过，包含失败路径与平台错标检查。实际 compare CLI 在只有 Linux 原始证据时按预期 exit 1，不能把缺失的 macOS/Windows 视为通过。CI 固定 Python 3.12。
- 真实 WSL Linux --list 与全 feature 执行：program 21、governance_runtime 11、policy_floor 4、nested_control 5、pack 3，共 44 个测试条目全部通过，0 failed/ignored/filtered。
- 44 条包含 2 个进程 helper 入口，证据单列 42 个非 helper 条目；不将 helper 或用例条数冒充独立的完整产品验收。
- 使用最终 collect CLI 在本机再次完整执行并成功校验：executed=44、passed=44、acceptance_checks=42、helpers=2、reported_skips=0。本地证据位于 /tmp/nofy-shared-kernel-verified-linux；这是本地 Linux 证据，不是远程 CI。
- 治理中的短 deadline/watchdog 未放宽；审批暂停/恢复、子预算继承、权限 floor、未知效果不重发、SQLite 重开、workflow 恢复与 pack 绑定使用原来的真实断言。

三端实际 parity 尚未运行：单测中的三平台样本只是校验器测试，不能当作 macOS/Windows 行为证据。没有变更 branch protection，也没有提交/推送。

# 第五批：独立消费者路径与 Unicode I/O

日期：2026-11-08。对应 P7 的仓库外公共 API 消费者验证，不代表已发布独立安装包。

## 修复与兼容

原 verify-agent-independent-consumer.py 把宿主路径直接插入 TOML 双引号；Windows 的 C:\Users 等内容会被当作转义并导致 Invalid hex value。

- 改为完整序列化依赖路径字符串；非 BMP Unicode 保留有效 Unicode scalar，DEL 使用 TOML 接受的转义，不以盲目替换反斜杠处理路径。
- manifest、Cargo 管道解码与 stdout/stderr/dependencies/result 文件显式 UTF-8，避免 Windows 本地代码页破坏中文/emoji 路径或构建日志。
- 保留既有临时目录复制、独立 workspace、offline Cargo、行为断言与 forbidden dependency 检查，不改 fixture features 或业务实现。
- 三端 shared-kernel 作业在下载并验证 Rust 依赖后运行消费者单测和既有 offline smoke，独立归档消费者结果，不混入内核 parity artifact。

## 已执行验证与限制

- 18 个 Python 单测通过：TOML 解析后核对完整 manifest，覆盖 POSIX、盘符、UNC/extended-length、空格、Unicode/emoji、引号、反斜杠和 C0/DEL；mock 主流程覆盖 UTF-8 成功/失败日志以及原有行为和禁止依赖断言。
- mock 主流程另外用存在目录加 .. 模拟短名/长名等价拼写，比较两侧都 resolve，避免正确的 Windows 临时 cwd 被测试误判；生产 cwd 行为未改。
- 真实 WSL 消费者在仓库外构建/运行通过；报告 status=passed、outside_workspace=true、dependency_boundary=passed，既有 configuration、recipe、workflow/module/hook、program、event_program、declarative_system、file_catalog 断言通过。
- 首次路径修复版真实执行通过后，最终 UTF-8 I/O 版本再做真实快缓存复验并通过；不把 mock Cargo 当作真实构建。
- fixture 启用 pack/workflow/control-file，不启用 sqlite；本项不能代替第四批 SQLite 恢复验证，也不是独立可分发安装包验收。
- Windows/macOS 原生消费者尚未运行；纯 Python 的 Windows 路径 round-trip 不是原生 Cargo 证据。
- GitNexus 修改前核对原脚本 main 与文件影响，未有外部生产调用链；最终全树 detect_changes 报 CRITICAL（前次为 HIGH），263 个符号/18 个既有文件，仍是同一整文件扩大范围且不计未索引新脚本。已按较高等级报告，并结合逐批回归、具体 diff 与新增文件审查；不将局部脚本 LOW 当作整体风险结论。
- 未修改 Rust 生产实现、依赖锁文件、机器配置或棘轮基线；没有安装、提交或推送。


## 第四/五批独立审查收口与下一原生门槛

独立只读审查复跑 21 个证据校验器单测、18 个消费者单测，并重新解析最终 Linux 原始证据，未发现本批阻断问题。该审查未重复 Cargo，也没有将模拟的三平台样本视为原生通过。

在同一 PC 进一步核对可用构建条件：PATH 未发现 cargo/rustc/rustup/cl/clang/gcc，用户 cargo.exe 与标准 VS 工具定位器未找到，WSL 无 x86_64-w64-mingw32-gcc。已尝试不安装软件的替代路线：用现有 Rust 内附 rust-lld、Windows GNU std 与稳定 ld.lld 链接模式编译最小 Windows 程序；仍因缺 kernel32/msvcrt/mingwex/gcc_eh/pthread 等导入/运行库而无法链接。因此本机当前配置无法给这些修改提供 Windows 原生执行证据，不只是 PATH 未配置的问题。

下一步需要用户提供已配置的原生环境，或明确授权安装官方工具链；远程三端 CI 还需允许提交/推送本次准确源码，macOS 也必须有真实原生运行证据。在此之前保持既有安全拒绝，不把更多未经验证的原生实现或产品功能当作已解决阻塞。本轮没有为尝试链接修改仓库、机器设置、rustup 默认值或基线。


## 后续验证授权与投递

2026-11-08 后续获准将以上本批改动提交到公开仓库 None9527/NofyAgents 的独立测试分支，并创建草稿 PR 触发三端 CI；不改 main、不合并，不安装本机工具链。上文各批“尚未提交/推送/远程运行”是当批完成时的记录，后续真实 CI 结果会单独追加，不能预先视为三端通过。投递前远端 main 与本地基线同为 c958379f，34 个任务文件逐项检查，未发现凭据形态内容、构建产物或棘轮基线修改。
